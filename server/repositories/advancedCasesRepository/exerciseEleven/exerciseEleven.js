import { ordersNamespace } from '../../../model/orders.js';
import { transportCompaniesNamespace } from '../../../model/transportCompanies.js';
import { vehiclesNamespace } from '../../../model/vehicles.js';
import { workplacesNamespace } from '../../../model/workplaces.js';
import { RedisJsonRepo } from '../../redisJsonRepo.js';
import { AggregateGroupByReducers, AggregateSteps } from 'redis';
// Все эти функции вставляются в advancedCasesRepo

/**
 * @description
 * найти среди автопредприятий, имевших заказы в четверг, автопредприятия с минимальным рамером комиссионных;
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
    const thursdayIds = (await repoCtx.getDocumentsByQuery(ordersNamespace, '@date:\'Четверг\'')).map(
        ({value}) => `@id:[${value['workplaceId']} ${value['workplaceId']}]`
    );

    const queryIds = thursdayIds.join(' | ');

    // SendCommand используется потому, что инвалиды не добавили поддержку 'LOAD' в ft.aggregate
    const [_total, ...documents] = await repoCtx.redisClient.sendCommand([
        'FT.AGGREGATE', repoCtx.withIdx(transportCompaniesNamespace), queryIds,
        'SORTBY', '2', '@commission', 'ASC',
        'LOAD', '*'
    ]);

    /*
    После этого мы получаем ответ:
    [
        [
            "commission",
            "4",
            "$",
            "{\"id\":4,\"name\":\"АТП 7\",\"address\":\"Кстово\",\"commission\":4}"
        ],
        ...
    ]
        Его надо распарсить
    */

    const minCommission = documents[0][1] //см. выше чтоб понять.
    const result = [];

    for (const doc of documents) {
        const currentCommission = doc[1];
        if (currentCommission > minCommission) {
            break;
        }

        result.push(JSON.parse(doc[3]));
    }

    return result;
}

/**
 * - определить максимальную стоимость заказов во вторник;
 * @param {RedisJsonRepo} repoCtx
 */
async function caseB (repoCtx) {
    const { results } = await repoCtx.redisClient.ft.aggregate(
        repoCtx.withIdx(ordersNamespace),
        '@date:\'Вторник\'',
        {
            STEPS: [
                {
                    type: AggregateSteps.GROUPBY,
                    properties: [],
                    REDUCE: {
                        type: AggregateGroupByReducers.MAX,
                        property: '@payment',
                        AS: 'maxPayment'
                    }
                }
            ]
        }
    )

    return results;
}

/**
 * запрос задания 7.с; - это не делаем
 * @param {RedisJsonRepo} repoCtx контекст вызова функции. Юзается, чтобы просто не прописывать .bind(this)
 */
async function caseC (repoCtx) {
    return [{ message: 'Здесь redis а не SQL' }];
}


/**
 * найти места работы, имеющие минимальный размер льгот.
 * @param {RedisJsonRepo} repoCtx контекст вызова функции. Юзается, чтобы просто не прописывать .bind(this)
 */
async function caseD (repoCtx) {
    const [_total, ...documents] = await repoCtx.redisClient.sendCommand([
        'FT.AGGREGATE', repoCtx.withIdx(workplacesNamespace), '*',
        'SORTBY', '2', '@benefit', 'ASC',
        'LOAD', '*'
    ]);

    /**
     * См. {@link caseA} чтобы понять
     */
    const minBenefit = documents[0][1]
    const result = [];

    for (const doc of documents) {
        const currentBenefit = doc[1];
        if (currentBenefit > minBenefit) {
            break;
        }

        result.push(JSON.parse(doc[3]));
    }

    return result;
}



export const exerciseEleven = {
    a: caseA,
    b: caseB,
    c: caseC,
    d: caseD,
};