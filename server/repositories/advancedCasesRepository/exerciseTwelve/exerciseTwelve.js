import { ordersNamespace } from '../../../model/orders.js';
import { transportCompaniesNamespace } from '../../../model/transportCompanies.js';
import { vehiclesNamespace } from '../../../model/vehicles.js';
import { workplacesNamespace } from '../../../model/workplaces.js';
import { RedisJsonRepo } from '../../redisJsonRepo.js';
import { AggregateGroupByReducers, AggregateSteps } from 'redis';
// Все эти функции вставляются в advancedCasesRepo

/**
 * @description
 * Используя операцию UNION получить адреса мест работ и адреса размещения техники.
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
    //Используем транзакцию, чтобы продемонстрировать возможности
    const transaction = repoCtx.redisClient.multi();

    transaction.ft.search(
        repoCtx.withIdx(workplacesNamespace),
        '*',
        { RETURN: ['address', 'name'] }
    );

    transaction.ft.search(
        repoCtx.withIdx(vehiclesNamespace),
        '*',
        { RETURN: ['address', 'type'] }
    );

    const response = await transaction.exec();



    return response.reduce((acc, curr) => {
        return acc.concat(curr.documents.map(({ value }) => ({
            address: value.address,
            name: value.name ?? value.type,
        })));
    }, []);
}



export const exerciseTwelve = {
    a: caseA,
};