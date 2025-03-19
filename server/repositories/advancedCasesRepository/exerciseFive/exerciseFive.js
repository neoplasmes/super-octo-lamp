import { transportCompaniesNamespace } from '../../../model/transportCompanies.js';
import { vehiclesNamespace } from '../../../model/vehicles.js';
import { workplacesNamespace } from '../../../model/workplaces.js';
import { RedisJsonRepo } from '../../redisJsonRepo.js';
import { AggregateSteps } from 'redis';
//Вот эту фнкцию потом инжектим в AdvancedCasesRepo

/**
 * @description
 * Информация о типе и месте расположения техники, с максимальным количеством более 3;
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
    const result = await repoCtx.getDocumentsByQuery(vehiclesNamespace, '@maxCount:[4 +inf]');

    return result.map(item => item.value);
}

/**
 * Инфа об автопредприятиях с размером комиссионных более 5% и расположенных не в Н.Новгроде. Вывести также и размер комиссионных.<br>
 * Отсортировать по нему полученные результаты;
 * @param {RedisJsonRepo} repoCtx
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
 * Инфа о местах работы, расположенных в Ильино.
 * @param {RedisJsonRepo} repoCtx
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