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
            msg: 'error creating a table',
            errorLog: e.message,
        });
    }
});


/**
 * { "a":"text", "b":"123" }
 */
mockTableRouter.post('/insert', async (req, res) => {
    const { name, data } = req.body;
    if (!name || !data) {
        res.status(404).json({ message: 'incorrect request body' })
    }

    const normalizedName = name.replace(/^idx:/, "");

    await mockTableService.insertToTable(normalizedName, data)
    .then(_ => { res.sendStatus(201); })
    .catch(err => { res.status(500).json(err); });
});

/**
 * В body - {
 *      name: string,
 *      query: string
 * }
 */ 
mockTableRouter.get('/select', async (req, res) => {
    const { name, query } = req.query;

    if (!name || !query) {
        res.status(404).json({ message: 'incorrect request body' })
    }

    //const trimIdx = (str) => str.replace(/^idx:/, "");
    const normalizedName = name.replace(/^idx:/, "");

    const tableData = await mockTableService.selectFromTable(normalizedName, query);
    res.status(200).json(tableData.map(item => item.value));
});

mockTableRouter.post('/delete', async (req, res) => {
    const { name, query } = req.query;

    if (!name || !query) {
        res.status(404).json({ message: 'incorrect query params' })
    }

    const normalizedName = name.replace(/^idx:/, "");
    await mockTableService.deleteFromTable(normalizedName, query);
    res.sendStatus(200);
});

/**
 * {
 *      name: string,
 *      query: string,
 *      instructions: dictionary
 * }
 */
mockTableRouter.post('/update', async (req, res) => {
    const { name, query, instructions } = req.body;

    if (!name || !query || !instructions) {
        res.status(404).json({ message: 'incorrect request body' })
    }

    const normalizedName = name.replace(/^idx:/, "");
    await mockTableService.updateInTable(normalizedName, query, instructions);
    res.sendStatus(200);
});

export const mockTableController = mockTableRouter;