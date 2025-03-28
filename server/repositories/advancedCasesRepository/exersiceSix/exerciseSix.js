import { ordersNamespace } from '../../../model/orders.js';
import { transportCompaniesNamespace } from '../../../model/transportCompanies.js';
import { vehiclesNamespace } from '../../../model/vehicles.js';
import { workplacesNamespace } from '../../../model/workplaces.js';
import { RedisJsonRepo } from '../../redisJsonRepo.js';


// Все эти функции вставляются в advancedCasesRepo

/**
 * @description
 * название места работы,  техника, количество, оплата. Отсортировать по сумме оплаты и месту работы
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
    // в Redis невозможно сымитировать JOIN'ы, поэтому расчёт будет вестись в коде
    const orders = await repoCtx.getDocumentsByQuery(ordersNamespace, '*');

    const workplacesMap = await repoCtx.prepareDocumentsForJoin(workplacesNamespace, '*');

    console.log(workplacesMap);

    const vehiclesMap = await repoCtx.prepareDocumentsForJoin(vehiclesNamespace, '*');

    console.log(vehiclesMap);

    const joinedData = orders.map(({ value }) => {
        return {
            workplaceName: workplacesMap.get(value['workplaceId'])['name'],
            vaehicleType: vehiclesMap.get(value['vehicleId'])['type'],
            quantity: value['quantity'],
            payment: value['payment']
        }
    }).sort((a, b) => {
        const paymentComparison = a.payment - b.payment;
        if (paymentComparison !== 0) {
            return paymentComparison;
        }

        return a.workplaceName.localeCompare(b.workplaceName);
    });

    return joinedData;
}

/**
 * номер, дату, название автопредприятия.
 * @param {RedisJsonRepo} repoCtx
 */
async function caseB (repoCtx) {
    // в Redis невозможно сымитировать JOIN'ы, поэтому расчёт будет вестись в коде
    const orders = await repoCtx.getDocumentsByQuery(ordersNamespace, '*');

    const tranportComaniesMap = await repoCtx.prepareDocumentsForJoin(transportCompaniesNamespace, '*');

    const joinedData = orders.map(({ value }) => {
        return {
            id: value['id'],
            date: value['date'],
            tranportComany: tranportComaniesMap.get(value['transportCompanyId'])['name'],
        }
    })

    return joinedData;
}


export const exerciseSix = {
    a: caseA,
    b: caseB,
};