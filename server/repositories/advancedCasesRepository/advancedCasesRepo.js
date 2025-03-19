import { RedisJsonRepo } from '../redisJsonRepo.js';
import { exerciseFive } from './exerciseFive/exerciseFive.js';
import { exerciseFour } from './exerciseFour/exerciseFour.js';
import { exerciseSix } from './exersiceSix/exerciseSix.js';

export class AdvancedCasesRepo extends RedisJsonRepo {
    constructor() {
        super();
    }

    casesFunctions = {
        '4': exerciseFour,
        '5': exerciseFive,
        '6': exerciseSix
    }
}