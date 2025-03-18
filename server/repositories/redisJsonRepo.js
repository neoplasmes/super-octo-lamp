import { SchemaFieldTypes } from 'redis';
import { redisClient } from '../config/redisClient.js';

/**
 * @typedef {'OK' | null} redisDummyResponse
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

            validationSchema[`$.${name}`] = { type: type, AS: name }; //ИЗ-ЗА ТОГО ЧТО Я НЕ УКАЗАЛ AS: name Я ПРОСИДЕЛ ПОЛЧАСА И ТУПИЛ В ЭКРАН
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

    // //Вот как будто нахер не нужен этот метод
    // /**
    //  * Получить 1 документ в виде JSON
    //  * @param {string} namespace 
    //  * @param {number} id 
    //  * @returns {Object}
    //  */
    // async getDocumentByID(namespace, id) {
    //     const response = await this.redisClient.json.get(`${namespace}:${id}`);

    //     return JSON.parse(response);
    // }

    /**
     * Поиск по документам с помощью индексатора. 
     * '*' - для всего
     * "@<fieldName>:<values че-то там>" - для более конкретных результатов.
     * @param {string} namespace 
     * @param {string} query 
     * @param {number} limit 
     */
    async getDocumentsByQuery(namespace, query, limit = undefined) {
        const response = await this.redisClient.ft.search(this.withIdx(namespace), query, {
            LIMIT: { from: 0, size: limit ?? maxLimit }
        });

        return response.documents;
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
        const namespaceInfo = await this.redisClient.ft.info(withIdx(namespace));
        return Number(namespaceInfo.numDocs);
    }
}