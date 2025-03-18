import { RedisJsonRepo } from '../repositories/RedisJsonRepo.js';

export const mockTableIndexPrefix = 'dynamic/'
//Тут опять же надо инжектить репозиторий, а не тупо вставлять его, но сейчас не то время и нет тайпскрипта
export class MockTableService {
    _withMockTablePrefix(str) {
        return mockTableIndexPrefix + str;
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

        if (generalList.length === 0) {
            return [];
        }

        const listOfDynamicTables = generalList.filter(name => name.includes(mockTableIndexPrefix))

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
        await this.repository.createIndex(this._withMockTablePrefix(tableName), tableSchema);
    }

    /**
     * Удаляет индекс и все связанные документы.
     * @param {string} tableName
     */
    async deleteTable(tableName) {
        return await this.repository.deleteIndex(
            this._withMockTablePrefix(tableName),
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
            this._withMockTablePrefix(tableName),
            query,
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
            this._withMockTablePrefix(tableName),
            query,
        );
    }

    /**
     * Обновление кортежа по заданному условию
     * @param {string} namespace 
     * @param {string} whereQuery 
     * @param {Object.<string, string | number | UpdateFunction>} updateInstructions ключ - название поля (типо колонки), значение - новое значение
     */
    async updateInTable(tableName, whereQuery, updateInstructions) {
        return await this.repository.updateDocuments(
            this._withMockTablePrefix(tableName), 
            whereQuery, 
            updateInstructions,
        );
    }
}