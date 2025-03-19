/*
Итог:

модель - бизнес сущности
репозиторий - работа с БД. По идее должен реализовывать некий ИНТЕРФЕЙС.
сервис - бизнес логика. входит инфа из контроллера. отправляется инфа в репозиторий и ведутся вычисления какие-то короче.
контроллер - принимает Http, юзает сервис, отправляет ответ потом.

*/
import { Router } from 'express';
import { CasesService } from '../services/casesService.js';

const casesService = new CasesService();
const casesRouter = Router();

casesRouter.get('/info', async (_, res) => {
    res.status(200).json(casesService.getCases());
});

casesRouter.get('/:number/:letter', async (req, res) => {
    const {number, letter} = req.params;

    try {
        const result = await casesService.solveCase(number, letter);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
        throw error;
    }
});

export const casesController = casesRouter;