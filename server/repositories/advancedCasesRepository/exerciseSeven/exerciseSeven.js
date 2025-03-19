import { ordersNamespace } from '../../../model/orders.js';
import { transportCompaniesNamespace } from '../../../model/transportCompanies.js';
import { vehiclesNamespace } from '../../../model/vehicles.js';
import { workplacesNamespace } from '../../../model/workplaces.js';
import { RedisJsonRepo } from '../../redisJsonRepo.js';

// Все эти функции вставляются в advancedCasesRepo

/**
 * @description
 * названия автопредприятий, которые предоставляли технику на работу в другие населенные пункты <br>
 * для организаций с размером льгот от 3% и выше. Также включить в отчет названия этих организаций и место их расположения;
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
            transportCompanyId: value['transportCompanyId'],
            vehicleId: value['vehicleId'],
        })
    );

    const workplacesMap = await repoCtx.prepareDocumentsForJoin(workplacesNamespace, '*');
    const vehiclesMap = await repoCtx.prepareDocumentsForJoin(vehiclesNamespace, '*');
    const transportCompaniesMap = await repoCtx.prepareDocumentsForJoin(transportCompaniesNamespace, '*');

    const result = [];
    const duplicateTemp = new Set();

    for (const item of ids) {
        const vehicleRow = vehiclesMap.get(item.vehicleId);
        const workplaceRow = workplacesMap.get(item.workplaceId);
        const transportCompanyRow = transportCompaniesMap.get(item.transportCompanyId);

        if (
            vehicleRow['address'] != workplaceRow['address'] &&
            workplaceRow['benefit'] >= 3 &&
            !duplicateTemp.has(transportCompanyRow['id'])
        ) {
            result.push({
                name: transportCompanyRow['name'],
                address: transportCompanyRow['address']
            });

            duplicateTemp.add(transportCompanyRow['id']);
        }
    }

    return result;
}

/**
 * идентификатор и тип машин, расположенных в том же месте, 
 * что и автопредприятие, направившее их на работу;
 * @param {RedisJsonRepo} repoCtx
 */
async function caseB (repoCtx) {
    const ids = (await repoCtx.getDocumentsByQuery(ordersNamespace, '*')).map(
        ({ value }) => ({
            workplaceId: value['workplaceId'],
            vehicleId: value['vehicleId'],
        })
    );

    const vehiclesMap = await repoCtx.prepareDocumentsForJoin(vehiclesNamespace, '*');
    const transportCompaniesMap = await repoCtx.prepareDocumentsForJoin(transportCompaniesNamespace, '*');

    const result = [];
    const duplicateTemp = new Set();

    for (const item of ids) {
        const vehicleRow = vehiclesMap.get(item.vehicleId);
        const transportCompanyRow = transportCompaniesMap.get(item.transportCompanyId);

        if (vehicleRow['address'] == transportCompanyRow['address'] && !duplicateTemp.has(vehicleRow['id'])) {
            result.push({
                id: vehicleRow['id'],
                type: vehicleRow['type']
            });

            duplicateTemp.add(vehicleRow['id']);
        }
    }

    return result;
}

/**
 * тип машин, имеющих общих владельцев ( т.е. направленных на работу 
 * разными автопредприятиями) и имеющих стоимость заказа более 115000руб.
 * @param {RedisJsonRepo} repoCtx
 */
async function caseC (repoCtx) {
    const ids = (await repoCtx.getDocumentsByQuery(ordersNamespace, '@payment:[115001 +inf]')).map(
        ({ value }) => ({
            workplaceId: value['workplaceId'],
            vehicleId: value['vehicleId']
        })
    );

    const vehiclesMap = await repoCtx.prepareDocumentsForJoin(vehiclesNamespace, '*');
    const transportCompaniesMap = await repoCtx.prepareDocumentsForJoin(transportCompaniesNamespace, '*');

    const result = new Set();;
    /**
     * @type {Map<string, string>}
     */
    const temp = new Map(); // key - тип тачки, value - set(владельцы)

    for (const item of ids) {
        const vehicleType = vehiclesMap.get(item.vehicleId)['type'];
        const transportCompanyName = transportCompaniesMap.get(item.workplaceId)['name'];

        if (temp.has(vehicleType) && temp.get(vehicleType) !== transportCompanyName) {
            result.add(vehicleType);
        } else {
            temp.set(vehicleType, transportCompanyName);
        }
    }

    return Array.from(result);
}


/**
 * название мест работы, для которых производился заказ техники на общую сумму более 100000руб.
 * @param {RedisJsonRepo} repoCtx
 */
async function caseD (repoCtx) {
    const ids = (await repoCtx.getDocumentsByQuery(ordersNamespace, '@payment:[100001 +inf]')).map(
        ({ value }) => ({
            workplaceId: value['workplaceId']
        })
    );

    const workplacesMap = await repoCtx.prepareDocumentsForJoin(workplacesNamespace, '*');

    const result = new Set();

    for (const item of ids) {
        result.add(workplacesMap.get(item.workplaceId)['name']);
    }

    return Array.from(result);
}



export const exerciseSeven = {
    a: caseA,
    b: caseB,
    c: caseC,
    d: caseD
};