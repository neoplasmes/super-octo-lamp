import { AggregateGroupByReducers, AggregateSteps } from 'redis';
import { ordersNamespace } from '../../../model/orders.js';
import { transportCompaniesNamespace } from '../../../model/transportCompanies.js';
import { vehiclesNamespace } from '../../../model/vehicles.js';
import { workplacesNamespace } from '../../../model/workplaces.js';
import { RedisJsonRepo } from '../../redisJsonRepo.js';

// Все эти функции вставляются в advancedCasesRepo

/**
 * @description
 * найти места работы на которые направлялась техника не из Н.Новгорода;
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
    const ids = await repoCtx.getDocumentsByQueryExperimental(ordersNamespace, '*', ['workplaceId', 'vehicleId']);

    const workplacesMap = await repoCtx.prepareDocumentsForJoin(workplacesNamespace, '*');
    const vehiclesMap = await repoCtx.prepareDocumentsForJoin(vehiclesNamespace, '-@address:\'Н.Новгород\'');// берём тачки НЕ из н.новгорода

    const result = [];
    const duplicateTemp = new Set();

    for (const item of ids) {
        const { workplaceId, vehicleId } = item;

        const vehicleRow = vehiclesMap.get(vehicleId);
        if (!vehicleRow) {
            continue;
        }

        if (!duplicateTemp.has(workplaceId)) {
            result.push(workplacesMap.get(workplaceId));
            duplicateTemp.add(workplaceId)
        }   
    }

    return result;
}

/**
 * определить такие автопредприятия, которые не получали заказов на поставку автокранов;
 * @param {RedisJsonRepo} repoCtx
 */
async function caseB (repoCtx) {
    const ids = await repoCtx.getDocumentsByQueryExperimental(ordersNamespace, '*', ['transportCompanyId', 'vehicleId']);

    const transportCompaniesMap = await repoCtx.prepareDocumentsForJoin(transportCompaniesNamespace, '*');
    const vehiclesMap = await repoCtx.prepareDocumentsForJoin(vehiclesNamespace, '-@type:\'Автокран\'');// берём НЕ автокраны

    const result = [];
    const duplicateTemp = new Set();

    for (const item of ids) {
        const { transportCompanyId, vehicleId } = item;

        const vehicleRow = vehiclesMap.get(vehicleId);
        if (!vehicleRow) {
            continue;
        }

        if (!duplicateTemp.has(transportCompanyId)) {
            result.push(transportCompaniesMap.get(transportCompanyId));
            duplicateTemp.add(transportCompanyId)
        }   
    }

    return result;
}

/**
 * найти технику, которую направляли на все такие места работы, которые не делали заказов техники автопредприятиям чужих районов;
 * @param {RedisJsonRepo} repoCtx
 */
async function caseC (repoCtx) {
    const ids = await repoCtx.getDocumentsByQueryExperimental(ordersNamespace, '*', ['transportCompanyId', 'workplaceId', 'vehicleId']);

    const transportCompaniesMap = await repoCtx.prepareDocumentsForJoin(transportCompaniesNamespace, '*');
    const workplacesMap = await repoCtx.prepareDocumentsForJoin(workplacesNamespace, '*');


    //1: Не делали заказов техники автопредприятиям чужих районов
    for (const item of ids) {
        const { transportCompanyId, workplaceId } = item;

        const transportCompanyRow = transportCompaniesMap.get(transportCompanyId);
        const workplaceRow = workplacesMap.get(workplaceId);

        // Если хоть один раз сделал заказ не туда - исключаешься
        if (workplaceRow === undefined || transportCompanyRow['address'] !== workplaceRow['address']) {
            workplacesMap.delete(workplaceId);
        }
        //В workplaces map остаются только те предприятия, которые "Не делали заказов техники автопредприятиям чужих районов"
    }

    //2: оставим только те vehicleId, у которых есть Id из workplacesMap, затем сгруппируем их, чтобы избежать дубликатов
    const idsQuery = Array.from(workplacesMap.keys()).map(
        id => `@workplaceId:[${id} ${id}]`
    ).join(' | ');

    const vehicleIdsWithWorkplacesList = await repoCtx.redisClient.ft.aggregate(
        repoCtx.withIdx(ordersNamespace),
        idsQuery,
        {
            STEPS: [
                {
                    type: AggregateSteps.GROUPBY,
                    properties: ['@vehicleId'],
                    REDUCE: {
                        type: AggregateGroupByReducers.TOLIST,
                        property: '@workplaceId',
                        AS: 'workplaceIds'
                    }
                }
            ]
        }
    );

    //3: сделаем query чтоб просить тока id, которые мы получили выше
    const vehicleIdsQuery = vehicleIdsWithWorkplacesList.results.map(({ vehicleId }) => `@id:[${vehicleId} ${vehicleId}]`).join(' | ');
    
    return (await repoCtx.getDocumentsByQuery(vehiclesNamespace, vehicleIdsQuery)).map(({ value }) => value);
}


/**
 * какие типы техники направлялись на овощную базу всеми автопредприятиями не более раза.
 * @param {RedisJsonRepo} repoCtx
 */
async function caseD (repoCtx) {
    //Предлполагаем что всегда существует только одна овощная база
    const vegetableBaseId = (await repoCtx.getDocumentsByQueryExperimental(
        workplacesNamespace,
        '@name:\'Овощная база\'',
        ['id']
    ))[0]['id'];

    // Получили все пары трнаспорт - компания для каждого существующего заказа на овощную базу
    const vehiclesAndTransposrtCompaniesIdsInOrders = await repoCtx.getDocumentsByQueryExperimental(
        ordersNamespace,
        `@workplaceId:[${vegetableBaseId} ${vegetableBaseId}]`,
        ['vehicleId', 'transportCompanyId']
    );
    
    console.log(vehiclesAndTransposrtCompaniesIdsInOrders);

    const obj = {};
    const hasToBeExcludedFlag = 'asdfadgadgadgadgadg';
    vehiclesAndTransposrtCompaniesIdsInOrders.forEach(({vehicleId, transportCompanyId}) => {
        //Если нет никакой инфы по технике, начинаем её собирать
        if (obj[vehicleId] === undefined) {
            obj[vehicleId] = new Set();
            obj[vehicleId].add(transportCompanyId); 

            //Если же у нас уже под vehicleId хранится Set, т.е. мы начали собирать инфу о том, кто отправляел этот транспорт
        } else if (typeof obj[vehicleId] === 'object') {
            // И при этом у нас уже есть информация о том, что компания отправляла этот транспорт, т.е. он сейчас его отправляет второй раз
            if (obj[vehicleId].has(transportCompanyId)) {
                // Значит этот тип техники мы не включаем в итоговый список, т.к. его получается какая-то компания отправляла более одного раза
                // а нам надо "не более одного"
                obj[vehicleId] = hasToBeExcludedFlag;
            } else {
                // Продолжаем собирать инфу, если компания на текущей итерации цикла отправила транспорт только первый раз.
                obj[vehicleId].add(transportCompanyId);
            }
        }
    });

    console.log(obj);
    //Все компании которые не попали в obj, очевидно, отправили технику на овощную базу 0 раз, что соотв. условию
    //"не более одного раза".
    //Таким образов все ключи объекта obj, значение которых не равно hasToBeExcluded и являются id техники, которую
    //ВСЕ компании отправили на овощную базу не более раза.

    const vehicleIds = [];
    for (const key in obj) {
        if (obj[key] !== hasToBeExcludedFlag) {
            vehicleIds.push(Number(key));
        }
    }

    //формируем запрос на лишь необходимые нам id
    const idsQuery = vehicleIds.map(id => `@id:[${id} ${id}]`).join(' | ');

    const response = await repoCtx.getDocumentsByQuery(vehiclesNamespace, idsQuery);

    return response.map(item => item.value);
}



export const exerciseThirteen = {
    a: caseA,
    b: caseB,
    c: caseC,
    d: caseD
};