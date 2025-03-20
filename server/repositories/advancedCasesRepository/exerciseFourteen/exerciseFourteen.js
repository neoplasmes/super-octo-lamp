import { AggregateGroupByReducers, AggregateSteps } from 'redis';
import { ordersNamespace } from '../../../model/orders.js';
import { transportCompaniesNamespace } from '../../../model/transportCompanies.js';
import { workplacesNamespace } from '../../../model/workplaces.js';
import { RedisJsonRepo } from '../../redisJsonRepo.js';

// Все эти функции вставляются в advancedCasesRepo

/**
 * @description
 * определить число рзличных видов техники, работавшей в детском саду;
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
    //Предполагается что садик у нас только 1Ы
    const kidsHouseId = (await repoCtx.getDocumentsByQueryExperimental(
        workplacesNamespace,
        '@name:\'Детский сад\'',
        ['id']
    ))[0]['id']

    const distinctVehiclesCount = await repoCtx.redisClient.ft.aggregate(
        repoCtx.withIdx(ordersNamespace),
        `@workplaceId:[${kidsHouseId} ${kidsHouseId}]`,
        {
            STEPS: [{
                type: AggregateSteps.GROUPBY,
                properties: ['@workplaceId'],
                REDUCE: {
                    type: AggregateGroupByReducers.COUNT_DISTINCT,
                    property: '@vehicleId',
                    AS: 'vehiclesCount'
                }
            }]
        }
    );

    if (distinctVehiclesCount.results.length > 1) {
        throw new Error('unexpected behaviour in 14/a')
    }

    return [distinctVehiclesCount.results[0]];
}

/**
 * найти среднее значение льгот у тех организаций, которые заказывали технику у всех автопредприятий Н.Новгорода;
 * Для этого задания надо добавить данные в таблицу.
 * @param {RedisJsonRepo} repoCtx
 */
async function caseB (repoCtx) {
    const allNNtransportCompaniesIds = await repoCtx.getDocumentsByQueryExperimental(
        transportCompaniesNamespace, 
        '*', 
        ['id']
    );

    const allNNtransportCompaniesIdsOptimized = new Set(
        allNNtransportCompaniesIds.map(item => item['id'])
    );

    const transportCompaniesForWorkplaces = await repoCtx.redisClient.ft.aggregate(
        repoCtx.withIdx(ordersNamespace),
        '*',
        {
            STEPS: [{
                type: AggregateSteps.GROUPBY,
                properties: ['@workplaceId'],
                REDUCE: {
                    type: AggregateGroupByReducers.TO_LIST,
                    property: '@transportCompanyId',
                    AS: 'transportCompanies'
                }
            }]
        }
    );

    const resultIds = [];
    start: for (const { workplaceId, transportCompanies } of transportCompaniesForWorkplaces.results) {
        for (const company of transportCompanies) {
            if (!allNNtransportCompaniesIdsOptimized.has(company)) {
                continue start;
            }
        }

        resultIds.push(workplaceId);
    }

    const idsQuery = resultIds.map(
        id => `@workplaceId:[${id} ${id}]`
    ).join(' | ');

    const response = await repoCtx.redisClient.ft.aggregate(
        repoCtx.withIdx(workplacesNamespace),
        idsQuery,
        {
            STEPS: [
                {
                    type: AggregateSteps.GROUPBY,
                    REDUCE: {
                        type: AggregateGroupByReducers.AVG,
                        property: '@benefit',
                        AS: 'averageBenefit',
                    }
                }
            ]
        }
    )

    return response.results;
}

/**
 * найти суммарные расходы овощной базы на заказы автотехники;
 * @param {RedisJsonRepo} repoCtx
 */
async function caseC (repoCtx) {
    //Предлполагаем что всегда существует только одна овощная база
    const vegetableBaseId = (await repoCtx.getDocumentsByQueryExperimental(
        workplacesNamespace,
        '@name:\'Овощная база\'',
        ['id']
    ))[0]['id'];

    const idsQuery = `@workplaceId:[${vegetableBaseId} ${vegetableBaseId}]`;

    const response = await repoCtx.redisClient.ft.aggregate(
        repoCtx.withIdx(ordersNamespace),
        idsQuery,
        {
            STEPS: [
                {
                    type: AggregateSteps.GROUPBY,
                    REDUCE: {
                        type: AggregateGroupByReducers.SUM,
                        property: '@payment',
                        AS: 'totalPayment'
                    }
                }
            ]
        }
    );
    
    return response.results;
}


/**
 * найти среди автопредприятий с рпзмером комиссионных больше среднего те, которые предоставляли технику в организации Н.Новгрода.
 * @param {RedisJsonRepo} repoCtx
 */
async function caseD (repoCtx) {
    //1. Средняя комса
    const averageCommissionResponse = await repoCtx.redisClient.ft.aggregate(
        repoCtx.withIdx(transportCompaniesNamespace),
        '*',
        {
            STEPS: [
                {
                    type: AggregateSteps.GROUPBY,
                    REDUCE: {
                        type: AggregateGroupByReducers.AVG,
                        property: '@commission',
                        AS: 'averageCommission'
                    }
                }
            ]
        }
    );

    const averageCommission = Number(averageCommissionResponse.results[0]['averageCommission']);

    //2. Автопредприятия с комсой выше среднего
    const transportCompaniesIds = (await repoCtx.getDocumentsByQueryExperimental(
        transportCompaniesNamespace,
        `@commission:[${averageCommission} +inf]`,
        ['id']
    )).map(item => item['id']);

    const transportCompaniesQuery = transportCompaniesIds.map(
        id => `@transportCompanyId:[${id} ${id}]`
    ).join(' | ');

    //3. Организации из нн
    const nnWorkplacesIds = (await repoCtx.getDocumentsByQueryExperimental(
        workplacesNamespace,
        '@address:\'Н.Новгород\'',
        ['id']
    )).map(item => item['id']);

    const workplacesQuery = nnWorkplacesIds.map(
        id => `@workplaceId:[${id} ${id}]`
    ).join(' | ');

    //Получили id компаний которые и выше среднего комсу берут и отправляли заказ в предприятия НН
    const resultIds = (await repoCtx.getDocumentsByQueryExperimental(
        ordersNamespace,
        `(${transportCompaniesQuery}) (${workplacesQuery})`,
        ['transportCompanyId']
    )).map(item => item['transportCompanyId']);

    const resultQuery = resultIds.map(
        id => `@id:[${id} ${id}]`
    ).join(' | ');

    return await repoCtx.getDocumentsByQueryExperimental(
        transportCompaniesNamespace,
        resultQuery
    );
}



export const exerciseFourteen = {
    a: caseA,
    b: caseB,
    c: caseC,
    d: caseD
};