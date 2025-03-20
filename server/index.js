import express from 'express';
import cors from 'cors';
import { CasesService } from './services/casesService.js';
import { workplacesNamespace } from './model/workplaces.js';
import { mockTableController } from './controllers/mockTableController.js';
import { casesController } from './controllers/casesController.js';
import { transportCompaniesNamespace } from './model/transportCompanies.js';
import { ordersNamespace } from './model/orders.js';
import { vehiclesNamespace } from './model/vehicles.js';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // кэширование preflight запросов
    maxAge: 43200,
}));

app.use(express.json());

app.use('/tables', mockTableController);
app.use('/cases', casesController);

app.get('/', (req, res) => {
    res.status(200).send({ message: 'let\'s go bitch' });
});

const test = new CasesService();
await test.repository.deleteIndex(workplacesNamespace, true);
await test.repository.deleteIndex(transportCompaniesNamespace, true);
await test.repository.deleteIndex(ordersNamespace, true);
await test.repository.deleteIndex(vehiclesNamespace, true);
await test.createInitialData();

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