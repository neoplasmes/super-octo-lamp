import { ordersInitialValues, ordersNamespace, ordersSchema } from '../model/orders.js';
import { transportCompaniesInitialValues, transportCompaniesNamespace, transportCompaniesSchema } from '../model/transportCompanies.js';
import { vehiclesInitialValues, vehiclesNamespace, vehiclesSchema } from '../model/vehicles.js';
import { workplacesInitialValues, workplacesNamespace, workplacesSchema } from '../model/workplaces.js';
import { AdvancedCasesRepo } from '../repositories/advancedCasesRepository/advancedCasesRepo.js';

export class CasesService {
    /**
     * Короче сюда типо мы inject'им репозиторий, который реализует конкретный интерфейс. Но, поскольку мы юзаем JS, а не TS, 
     * мы просто втупую создаём объект.
     */
    constructor(documentsRepo = undefined) {
        this.repository = new AdvancedCasesRepo();
    }

    /**
     * Метод создаёт в базе данных индексы и стартовый набор документов.
     * @param {boolean} withFlush если true, то сначала всё удалится к чертям.
     */
    async createInitialData(withFlush) {
        await Promise.all([
            this.repository.createIndex(workplacesNamespace, workplacesSchema),
            this.repository.createIndex(transportCompaniesNamespace, transportCompaniesSchema),
            this.repository.createIndex(vehiclesNamespace, vehiclesSchema),
            this.repository.createIndex(ordersNamespace, ordersSchema)
        ]);

        const dataInjectingBox = [
            ...workplacesInitialValues.map(item => this.repository.createOrReplaceDocument(
                workplacesNamespace,
                item.id,
                item,
            )),
            ...transportCompaniesInitialValues.map(item => this.repository.createOrReplaceDocument(
                transportCompaniesNamespace,
                item.id,
                item
            )),
            ...vehiclesInitialValues.map(item => this.repository.createOrReplaceDocument(
                vehiclesNamespace,
                item.id,
                item
            )),
            ...ordersInitialValues.map(item => this.repository.createOrReplaceDocument(
                ordersNamespace,
                item.id,
                item
            )),
        ];

        const safetyCheck = await Promise.all(dataInjectingBox);
        if (safetyCheck.includes(null)) {
            console.log('Вероятно, че-то не создалось')
        }
    }

    /**
     * Маппер функций для решения кейсов
     * @param {string} number 
     * @param {string} letter 
     */
    async solveCase(number, letter) {
        return await this.repository.casesFunctions[number][letter](this.repository);
    }
}