import { SchemaFieldTypes } from 'redis';
import { redisClient } from '../config/redisClient.js';

/**
 * @typedef {'OK' | null} redisDummyResponse
 * @typedef {function(number): number} NumericUpdateFunction
 * @typedef {function(string): string} TextUpdateFunction
 * @typedef {NumericUpdateFunction | TextUpdateFunction} UpdateFunction
 * @typedef {Promise.<{ id: string, value: Object<string, number | string> }[]>} ActualRetrievedJSON
 */


const maxLimit = 10000;

/**
 * Это тупо контроллер для обращения к редису.
 * Не ловит сетевые ошибки.
 */
export class RedisJsonRepo {
    withIdx(str) {
        return `idx:${str}`;
    }

    fieldTypes = new Set(Object.values(SchemaFieldTypes));

    constructor() {
        this.redisClient = redisClient;
    }

    /**
     * Создаёт индекс в Redis'е по неким JSON документам. Ловит ошибку типов.
     * НЕ ЛОВИТ ОШИБКИ ЗАПРОСА. ЭТО НЕ ОТНОСИТСЯ К МОДЕЛИ.
     * @param {string} namespace 
     * @param {Object.<string, SchemaFieldTypes.TEXT | SchemaFieldTypes.NUMERIC>} fieldsMap
     * @returns {Promise.<redisDummyResponse>}
     */
    async createIndex(namespace, fieldsMap) {
        const validationSchema = {};

        for (const [name, type] of Object.entries(fieldsMap)) {
            if (!this.fieldTypes.has(type)) {
                throw new Error(`Incorrect field type recieved: ${type}`);
            }

            validationSchema[`$.${name}`] = { type: type, AS: name, SORTABLE: true }; //ИЗ-ЗА ТОГО ЧТО Я НЕ УКАЗАЛ AS: name Я ПРОСИДЕЛ ПОЛЧАСА И ТУПИЛ В ЭКРАН
            /*
            На выходе получаем че то типо:
            {
                '$.workplaceId': { type: 'NUMERIC' },
                '$.companyId': { type: 'NUMERIC' },
                '$.equipmentId': { type: 'TEXT' },
            }
            */
        }

        return await this.redisClient.ft.create(this.withIdx(namespace), validationSchema, { ON: 'JSON', PREFIX: `${namespace}:` });
    }

    /**
     * Юзать для определения того, какие таблицы существуют.
     * @returns {Promise.<string[]>} массив существующих индексов.
     */
    async listIndexes() {
        return await this.redisClient.ft._list();
    }

    /**
     * @param {string} indexName 
     * @returns информация об индексе
     */
    async getIndexInfo(indexName) {
        return await this.redisClient.ft.info(this.withIdx(indexName));
    }

    /**
     * Удаляет индекс
     * @param {string} namespace
     * @param {boolean} withDocuments если указан как true то все проидексированные документы тоже удалятся.
     * @returns {Promise.<redisDummyResponse>} - короче ОК говорит...
     */
    async deleteIndex(namespace, withDocuments) {
        return await this.redisClient.ft.dropIndex(this.withIdx(namespace), { DD: withDocuments });
    }

    /**
     * Важно!!! Если уже существует user:1 и мы добавляем user:1 опять, то все данные просто перезапишутся новыми.
     * Именно поэтому метод назван CREATE or REPLACE
     * @param {string} namespace 
     * @param {number} id 
     * @param {Object.<string, string>} data 
     * @returns {Promise.<redisDummyResponse>}
     */
    async createOrReplaceDocument(namespace, id, data) {
        // $ значит корень документа. типо мы не поле меняем у документа с ключом ${namespace}:${id}, а весь документ
        await this.redisClient.json.set(`${namespace}:${id}`, '$', data); 
    }

    /**
     * Функция, имитирующая UPDATE WHERE
     * @param {string} namespace 
     * @param {string} whereQuery 
     * @param {Object.<string, string | number | UpdateFunction>} updateInstructions ключ - название поля (типо колонки), значение - новое значение
     */
    async updateDocuments(namespace, whereQuery, updateInstructions) {
        const documentsToUpdate = await this.getDocumentsByQuery(namespace, whereQuery);

        if (documentsToUpdate.length === 0) {
            return 0;
        }

        // создаём типо "транзакцию" в редисе
        const transaction = this.redisClient.multi();
        documentsToUpdate.forEach(doc => {
            const multiSetArgs = Array.from(Object.entries(updateInstructions)).map(
                ([path, instruction]) => {
                    if (doc.value[path] === undefined) {
                        throw new Error(`There is no field ${path} in ${this.withIdx(namespace)} namespace`)
                    }

                    let newValue = undefined;
                    if (typeof instruction === 'function') {
                        newValue = instruction(doc.value[path]);
                    } else {
                        newValue = instruction;
                    }

                    return {
                        key: doc.id,
                        path: `$.${path}`,
                        value: newValue
                    }
                }
            )

            transaction.json.mSet(multiSetArgs);
        });

        return await transaction.exec();
    }

    /**
     * Поиск по документам с помощью индексатора. 
     * '*' - для всего
     * "@<fieldName>:<values че-то там>" - для более конкретных результатов.
     * @param {string} namespace 
     * @param {string} query 
     * @param {string[]} fieldsToReturn 
     * @returns {Promise<ActualRetrievedJSON>}
     */
    async getDocumentsByQuery(namespace, query, fieldsToReturn = []) {
        const optionsObject = fieldsToReturn.length === 0 ? {} : {
            RETURN: fieldsToReturn
        };

        const response = await this.redisClient.ft.search(this.withIdx(namespace), query, optionsObject);

        return response.documents;
    }

    /**
     * Функция делает запрос необходимых документов и превращает их в объект Map структуры 'id': 'data'.
     * Выбрана map чтобы было удобно доставать данные по id и для оптимизации скорости этого извлечения по id.
     * Array.prototype.indexOf - медленный (O(n));
     * @param {string} namespace 
     * @param {string} query 
     * @returns {Promise.<Map.<string, Object.<string, string | number>>} Map структуры 'id': 'data'
     */
    async prepareDocumentsForJoin(namespace, query) {
        const response = (await this.getDocumentsByQuery(namespace, query)).reduce(
            (acc, { value }) => {
                acc.set(value['id'], value);
    
                return acc;
            },
            new Map()
        );

        return response;
    }

    /** 
     * Удалить всё, что совпало по search-query
     * @param {string} namespace 
     * @param {string} query 
     * @param {number} limit 
     * @returns {Promise.<number>} кол-во удалённых документов
     */
    async deleteDocumentsByQuery(namespace, query, limit = undefined) {
        const queryResult = await this.getDocumentsByQuery(namespace, query, limit);

        const keysToDelete = queryResult.map(doc => doc.id);
        if (keysToDelete.length === 0) {
            return 0;
        }

        return await this.redisClient.del(keysToDelete);
    }

    /**
     * считает кол-во проиндексированных документов в конкретном индексе.
     * если такого индекса нет, то я хз что будет
     * @param {string} namespace название пространства имён (индекса), в котором хранятся документы 
     */
    async countDocumentsInIndex(namespace) {
        const namespaceInfo = await this.getIndexInfo(namespace);
        return Number(namespaceInfo.numDocs);
    }
}