// По методологии layered architecture я должен линковать контроллер с endpoint'ами в слое routes, но у меня нет тайпскрипта
// И я не хочу отказываться от автокомплита

import { Router } from 'express';
import { MockTableService } from '../services/mockTableService.js';

/**
 * Линковать на путь '/tables'
 */
const mockTableRouter = Router();
const mockTableService = new MockTableService();

/**
 * На текущий момент будем возвращать для каждой таблицы: 
 * 1. количество строк (т.е. кол-во документов)
 * 2. имя таблицы (сущности namespace в нашем случае)
 * 3. схему таблицы (имя: тип)
 */
mockTableRouter.get('/', async (req, res) => {
    console.log(new Date())

    const tablesInfo = await mockTableService.getTablesInfo();

    return res.status(200).json(tablesInfo);
});


/**
 * В body должно присутствовать следующее:
 * name: string
 * schema: {
 *      [property: string]: SchemaFieldType
 * }
 */
mockTableRouter.post('/create', async (req, res) => {
    const requestBody = req.body;

    console.log(requestBody)

    try {
        await mockTableService.createTable(
            requestBody.name,
            requestBody.schema,
        );

        res.sendStatus(201);
    } catch (e) {
        console.log(e);
        res.status(404).json({
            msg: 'error, creating a table',
            errorLog: e.message,
        });
    }
});

export const mockTableController = mockTableRouter;