import { ordersNamespace } from '../../../model/orders.js';
import { transportCompaniesNamespace } from '../../../model/transportCompanies.js';
import { vehiclesNamespace } from '../../../model/vehicles.js';
import { workplacesNamespace } from '../../../model/workplaces.js';
import { RedisJsonRepo } from '../../redisJsonRepo.js';

// Все эти функции вставляются в advancedCasesRepo

/**
 * @description
 * определить такие места работы, в которых не работала техника, размещенная в Н.Новгороде;
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
    const ids = (await repoCtx.getDocumentsByQuery(ordersNamespace, '*')).map(
        ({ value }) => ({
            workplaceId: value['workplaceId'],
            vehicleId: value['vehicleId'],
        })
    );

    const workplacesMap = await repoCtx.prepareDocumentsForJoin(workplacesNamespace, '*');
    const vehiclesMap = await repoCtx.prepareDocumentsForJoin(vehiclesNamespace, '*');

    const result = [];
    const duplicateTemp = new Set();

    for (const item of ids) {
        const vehicleRow = vehiclesMap.get(item.vehicleId);
        const workplaceRow = workplacesMap.get(item.workplaceId);

        if (vehicleRow['address'] === 'Н.Новгород' || duplicateTemp.has(workplaceRow['id'])) {
            continue;
        }

        result.push(workplaceRow);
        duplicateTemp.add(workplaceRow['id']);
    }

    return result;
}

/**
 * найти технику которую предоставляли автопредприятия с другим адресом и не бравшие заказы на работу в детском саду;
 * @param {RedisJsonRepo} repoCtx
 */
async function caseB (repoCtx) {
    const workplacesMap = await repoCtx.prepareDocumentsForJoin(workplacesNamespace, '*');

    // Получаем все индексы с детским садиком (по сути он у нас один, но делаем для общего случая);
    const idsQuery = [];
    workplacesMap.forEach((value) => {
        const id = value['id'];

        if (value['name'] === 'Детский сад') {
            idsQuery.push(`-@workplaceId:[${id} ${id}]`);
        }
    });
        
    const vehiclesMap = await repoCtx.prepareDocumentsForJoin(vehiclesNamespace, '*');
    const transportCompaniesMap = await repoCtx.prepareDocumentsForJoin(transportCompaniesNamespace, '*');

    // Таким образом мы получаем список только тех заказов, которые не связаны с детским садиком
    const ids = (await repoCtx.getDocumentsByQuery(ordersNamespace, idsQuery.join(' '))).map(
        ({ value }) => ({
            workplaceId: value['workplaceId'],
            transportCompanyId: value['transportCompanyId'],
            vehicleId: value['vehicleId'],
        })
    );

    const result = new Set();

    for (const item of ids) {
        const workplaceRow = workplacesMap.get(item.workplaceId);
        const vehicleRow = vehiclesMap.get(item.vehicleId);
        const transportCompanyRow = transportCompaniesMap.get(item.transportCompanyId);

        //нужны предприятия с разным адресом
        if (transportCompanyRow['address'] === workplaceRow['address']) {
            continue;
        }

        result.add(vehicleRow['type']);
    }

    return Array.from(result);
}

//Задание C нет смысла делать, ибо в Redis в принципе нет функции NOT IN

export const exerciseTen = {
    a: caseA,
    b: caseB,
};