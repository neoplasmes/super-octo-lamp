import { transportCompaniesNamespace } from '../../../model/transportCompanies.js';
import { vehiclesNamespace } from '../../../model/vehicles.js';
import { workplacesNamespace } from '../../../model/workplaces.js';
import { RedisJsonRepo } from '../../redisJsonRepo.js';
import { AggregateSteps } from 'redis';
//Вот эту фнкцию потом инжектим в AdvancedCasesRepo

/**
 * типе и месте расположения техники, с максимальным количеством более 3;
 * @param {RedisJsonRepo} repoCtx контекст вызова функции. Юзается, чтобы просто не прописывать .bind(this)
 */
async function caseA (repoCtx) {
    const result = await repoCtx.getDocumentsByQuery(vehiclesNamespace, '@maxCount:[4 +inf]');

    return result.map(item => item.value);
}

/**
 * автопредприятиях с размером комиссионных более 5% и расположенных не в Н.Новгроде. Вывести также и размер комиссионных. Отсортировать по нему полученные результаты;
 * @param {RedisJsonRepo} repoCtx контекст вызова функции. Юзается, чтобы просто не прописывать .bind(this)
 */
async function caseB (repoCtx) {
    const { results } = await repoCtx.redisClient.ft.aggregate(repoCtx.withIdx(transportCompaniesNamespace), '*', {
        STEPS: [
            {
                type: AggregateSteps.FILTER,
                expression: '@address!=\'Н.Новгород\' && @commission > 5'
            },
            {
                type: AggregateSteps.SORTBY,
                BY: '@commission',
            }
        ]
    });

    return results;
}

/**
 * местах работы, расположенных в Ильино.
 * @param {RedisJsonRepo} repoCtx контекст вызова функции. Юзается, чтобы просто не прописывать .bind(this)
 */
async function caseC (repoCtx) {
    const result = await repoCtx.getDocumentsByQuery(workplacesNamespace, '@address:\'Ильино\'');

    return result.map(item => item.value);
}


export const exerciseFive = {
    a: caseA,
    b: caseB,
    c: caseC
};