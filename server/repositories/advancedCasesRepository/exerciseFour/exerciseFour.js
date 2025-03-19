import { transportCompaniesNamespace } from '../../../model/transportCompanies.js';
import { vehiclesNamespace } from '../../../model/vehicles.js';
import { workplacesNamespace } from '../../../model/workplaces.js';
import { RedisJsonRepo } from '../../redisJsonRepo.js';
import { AggregateGroupByReducers, AggregateSteps } from 'redis';
//Вот эту фнкцию потом инжектим в AdvancedCasesRepo

/**
 * названий всех различных мест работы, вместе с размером льгот;
 * @param {RedisJsonRepo} repoCtx контекст вызова функции. Юзается, чтобы просто не прописывать .bind(this)
 */
async function caseA (repoCtx) {
    const { results } = await repoCtx.redisClient.ft.aggregate(repoCtx.withIdx(workplacesNamespace), '*', {
        STEPS: [
            {
                type: AggregateSteps.GROUPBY,
                properties: ['@name'],
                REDUCE: [
                    {
                        type: AggregateGroupByReducers.TOLIST,
                        property: '@benefit',
                        AS: 'benefit',
                    }
                ]
            }
        ]
    });
    
    return results;
}

/**
 * всех различных адресов, где расположены автопредприятия;
 * @param {RedisJsonRepo} repoCtx контекст вызова функции. Юзается, чтобы просто не прописывать .bind(this)
 */
async function caseB (repoCtx) {
    const { results } = await repoCtx.redisClient.ft.aggregate(repoCtx.withIdx(transportCompaniesNamespace), '*', {
        STEPS: [
            {
                type: AggregateSteps.GROUPBY,
                properties: ['@address'],
                REDUCE: [
                    {
                        type: AggregateGroupByReducers.TOLIST,
                        property: '@name',
                        AS: 'name',
                    }
                ]
            }
        ]
    });

    return results;
}

/**
 * всех различных мест расположения техники.
 * @param {RedisJsonRepo} repoCtx контекст вызова функции. Юзается, чтобы просто не прописывать .bind(this)
 */
async function caseC (repoCtx) {
    const { results } = await repoCtx.redisClient.ft.aggregate(repoCtx.withIdx(vehiclesNamespace), '*', {
        STEPS: [
            {
                type: AggregateSteps.GROUPBY,
                properties: ['@address'],
                REDUCE: [
                    {
                        type: AggregateGroupByReducers.TOLIST,
                        property: '@type',
                        AS: 'type',
                    }
                ]
            }
        ]
    });

    return results;
}


export const exerciseFour = {
    a: caseA,
    b: caseB,
    c: caseC
};