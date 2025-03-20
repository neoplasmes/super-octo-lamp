import { AggregateGroupByReducers, AggregateSteps } from 'redis';
import { ordersNamespace } from '../../../model/orders.js';
import { transportCompaniesNamespace } from '../../../model/transportCompanies.js';
import { vehiclesNamespace } from '../../../model/vehicles.js';
import { workplacesNamespace } from '../../../model/workplaces.js';
import { RedisJsonRepo } from '../../redisJsonRepo.js';

// Все эти функции вставляются в advancedCasesRepo

/**
 * @description
 * найти такие типпы техники, для которых суммарная стоимость заказов за день не превысила 500000;
 * 
 * @param {RedisJsonRepo} repoCtx контекст вызова функции. Юзается, чтобы просто не прописывать .bind(this).<br>
 * 
 * См. {@link https://github.com/neoplasmes/super-octo-lamp/blob/master/server/repositories/redisJsonRepo.js#L18}
 * чтобы понять вообще смысл используемых функций.<br>
 * 
 * См. {@link https://github.com/neoplasmes/super-octo-lamp/blob/master/server/repositories/advancedCasesRepository/advancedCasesRepo.js} и
 * {@link https://github.com/neoplasmes/super-octo-lamp/blob/master/server/services/casesService.js#L62} чтобы понять куда эти функции перенаправляются.
 */
async function caseA (repoCtx) {
    const ids = (await repoCtx.redisClient.ft.aggregate(
        repoCtx.withIdx(ordersNamespace),
        '*',
        {
            STEPS: [
                {
                    type: AggregateSteps.GROUPBY,
                    properties: ['@vehicleId', '@date'],
                    REDUCE: {
                        type: AggregateGroupByReducers.SUM,
                        property: '@payment',
                        AS: 'totalPayment'
                    }
                },
                {
                    type: AggregateSteps.FILTER,
                    expression: '@totalPayment < 500000'
                }
            ]
        }
    )).results.map(item => item['vehicleId']);

    const idsQuery = ids.map(id => `@id:[${id} ${id}]`).join(' | ');

    return await repoCtx.getDocumentsByQueryExperimental(
        vehiclesNamespace,
        idsQuery,
        ['id', 'type']
    );
}

/**
 * для каждого автопредприятия вывести общее число его заказов со стоиомостью более 200000;
 * @param {RedisJsonRepo} repoCtx
 */
async function caseB (repoCtx) {
    const response = await repoCtx.redisClient.ft.aggregate(
        repoCtx.withIdx(ordersNamespace),
        '@payment:[200000 +inf]',
        {
            STEPS: [
                {
                    type: AggregateSteps.GROUPBY,
                    properties: ['@transportCompanyId'],
                    REDUCE: {
                        type: AggregateGroupByReducers.COUNT,
                        AS: 'expensiveOrders'
                    }
                }
            ]
        }
    );

    return response.results;
}

/**
 * для каждой организации, в которой работала автотехника, вывести суммарную величину расходов на автотехнику по дням недели;
 * @param {RedisJsonRepo} repoCtx
 */
async function caseC (repoCtx) {
    const [_, ...documents] = await repoCtx.redisClient.sendCommand([
        'FT.AGGREGATE', repoCtx.withIdx(ordersNamespace), '*',
        'GROUPBY', '2', '@workplaceId', '@date',           
        'REDUCE', 'SUM', '1', '@payment', 'AS', 'totalPayment', 
        'APPLY', 'format("%s:%s", @date, @totalPayment)', 'AS', 'date_payment', 
        'GROUPBY', '1', '@workplaceId',                   
        'REDUCE', 'TOLIST', '1', '@date_payment', 'AS', 'expenses' 
    ]);

    const parsedResponse = [];
    for (const doc of documents) {
        const parsedEntry = {}

        for (let i = 0; i < doc.length;) {
            parsedEntry[doc[i++]] = doc[i++];
        }

        parsedResponse.push(parsedEntry);
    }

    return parsedResponse;
}


/**
 * определить те дни, когда количество заказов от организаций не из Н.новгорода превышало три.
 * @param {RedisJsonRepo} repoCtx
 */
async function caseD (repoCtx) {
    const notNnIds = (await repoCtx.getDocumentsByQueryExperimental(
        workplacesNamespace,
        '@address:\'Н.Новгород\'',
        ['id']
    )).map(item => item['id']);

    const idsQuery = notNnIds.map(
        id => `@workplaceId:[${id} ${id}]`
    ).join(' | ');


    const { results } = await repoCtx.redisClient.ft.aggregate(
        repoCtx.withIdx(ordersNamespace),
        idsQuery,
        {
            STEPS: [
                {
                    type: AggregateSteps.GROUPBY,
                    properties: ['@date'],
                    REDUCE: {
                        type: AggregateGroupByReducers.COUNT,
                        AS: 'ordersByNotNnCount'
                    }
                },
                {
                    type: AggregateSteps.FILTER,
                    expression: '@ordersByNotNnCount < 4'
                }
            ]
        }
    );

    return results;
}



export const exerciseFifteen = {
    a: caseA,
    b: caseB,
    c: caseC,
    d: caseD
};