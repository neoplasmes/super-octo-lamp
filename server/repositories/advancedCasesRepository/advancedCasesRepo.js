import { RedisJsonRepo } from '../redisJsonRepo.js';
import { exerciseEleven } from './exerciseEleven/exerciseEleven.js';
import { exerciseFive } from './exerciseFive/exerciseFive.js';
import { exerciseFour } from './exerciseFour/exerciseFour.js';
import { exerciseSeven } from './exerciseSeven/exerciseSeven.js';
import { exerciseTen } from './exerciseTen/exerciseTen.js';
import { exerciseTwelve } from './exerciseTwelve/exerciseTwelve.js';
import { exerciseSix } from './exersiceSix/exerciseSix.js';

export class AdvancedCasesRepo extends RedisJsonRepo {
    constructor() {
        super();
    }

    casesFunctions = {
        '4': exerciseFour,
        '5': exerciseFive,
        '6': exerciseSix,
        '7': exerciseSeven,
        '10': exerciseTen,
        '11': exerciseEleven,
        '12': exerciseTwelve
    }
}