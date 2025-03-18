import express from 'express';
import cors from 'cors';
import { CasesService } from './services/casesService.js';
import { workplacesNamespace } from './model/workplaces.js';
import { mockTableController } from './controllers/mockTableController.js';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // кэширование preflight запросов
    maxAge: 43200,
}));

app.use(express.json());

app.use('/tables', mockTableController);

app.get('/', (req, res) => {
    res.status(200).send({ message: 'let\'s go bitch' });
});

// const test = new CasesService();
// await test.repository.redisClient.flushAll();
// await test.createInitialData();

// await test.repository.updateDocuments(workplacesNamespace, '@benefit:[0 0]', {
//     name: str => str + 'функция работает',
//     benefit: 10,
// });

//await test.repository.deleteDocumentsByQuery(workplacesNamespace, '@benefit:[0 0]');
//const result = await test.repository.getDocumentsByQuery(workplacesNamespace, '*');
//console.log(result);

app.listen(3500, () => {
    console.log('server is running');
});