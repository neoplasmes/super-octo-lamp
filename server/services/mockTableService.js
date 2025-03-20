import { RedisJsonRepo } from '../repositories/redisJsonRepo.js';
import { SchemaFieldTypes } from 'redis';

export const mockTableIndexPrefix = 'dynamic_'
//Тут опять же надо инжектить репозиторий, а не тупо вставлять его, но сейчас не то время и нет тайпскрипта
export class MockTableService {
    /**
     * 
     * @param {string} str 
     * @returns 
     */
    _withMockTablePrefix(str) {
        return mockTableIndexPrefix + str;
    }

    /**
     * @param {string} str 
     * @returns {boolean}
     */
    checkMockPrefix(str) {
        return str.includes(mockTableIndexPrefix);
    }

    constructor() {
        this.repository = new RedisJsonRepo();
    }

    /**
     * Функция которая возвращает всю инфу об индексах (в нашем случае - типо таблицах), с префиксом dynamic/
     * Нужна для того, чтобы на фронте потом можно было сделать список таблиц.
     * @returns информация об индексах
     */
    async getTablesInfo() {
        const generalList = await this.repository.listIndexes();

        console.log(generalList);

        if (generalList.length === 0) {
            return [];
        }

        const listOfDynamicTables = generalList.filter(name => name.includes(mockTableIndexPrefix))

        console.log(listOfDynamicTables);

        const infoList = await Promise.all(
            listOfDynamicTables.map(name => this.repository.getIndexInfo(name)),
        );

        const normalizedInfoList = infoList.map(item => {
            const schema = {};
            for (const attr of item.attributes) {
                schema[attr['attribute']] = attr['type'];
            }
    
            return {
                name: item.indexName,
                rowsTotal: item.numDocs,
                schema: schema,
            }
        });

        return infoList;
    }

    /**
     * Создаёт индекс в Redis'е по неким JSON документам. Ловит ошибку типов.
     * НЕ ЛОВИТ ОШИБКИ ЗАПРОСА. ЭТО НЕ ОТНОСИТСЯ К МОДЕЛИ.
     * @param {string} tableName 
     * @param {Object.<string, SchemaFieldTypes.TEXT | SchemaFieldTypes.NUMERIC>} tableSchema
     * @returns {Promise.<void>}
     */
    async createTable(tableName, tableSchema) {
        //При создании таблицы - т.е. индекса мы добавляем "idx:""
        await this.repository.createIndex(this._withMockTablePrefix(tableName), tableSchema);
    }

    /**
     * Удаляет индекс и все связанные документы.
     * @param {string} indexName начинается с idx:
     */
    async deleteTable(indexName) {
        return await this.repository.deleteIndex(
            indexName,
            true, //флаг true - значит включена опция DROP DOCUMENTS (сокр. DD (DEAD DYNASTY))
        );
    }

    /**
     * Имитирует SELECT из таблицы
     * @param {string} tableName 
     * @param {string} query 
     * @returns результат запроса 
     */
    async selectFromTable(tableName, query) {
        return await this.repository.getDocumentsByQuery(
            tableName,
            query,
        );
    }

    async insertToTable(tableName, data) {
        const keys = await this.repository.redisClient.keys(`${tableName}:*`);

        let maxId = 0;
        if (keys.length > 0) {
            maxId = Math.max(...keys.map(key => {
                console.log(key.split(':').at(-1));

                return parseInt(key.split(':').at(-1), 10)
            }));
        }

        await this.repository.createOrReplaceDocument(
            tableName,
            maxId + 1,
            data
        );
    }

    /**
     * Имитирует DELETE из таблицы
     * @param {string} tableName 
     * @param {string} query 
     * @returns кол-во удалённых 
     */
    async deleteFromTable(tableName, query) {
        return await this.repository.deleteDocumentsByQuery(
            tableName,
            query,
        );
    }

    /**
     * Обновление кортежа по заданному условию
     * @param {string} tableName 
     * @param {string} whereQuery 
     * @param {Object.<string, string | number | UpdateFunction>} updateInstructions ключ - название поля (типо колонки), значение - новое значение
     */
    async updateInTable(tableName, whereQuery, updateInstructions) {
        return await this.repository.updateDocuments(
            tableName, 
            whereQuery, 
            updateInstructions,
        );
    }
}