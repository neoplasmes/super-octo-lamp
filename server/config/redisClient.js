import { createClient } from "redis";

const client = createClient({
    url: 'redis://localhost:6379'
});

client.on('error', err => console.log('Redis Client Error', err));

client.connect().catch(err => console.log(`error while connecting to redis: ${err}`));

// SCAN производительнее, чем KEYS
// client.UNSAFE__findAllWithScan = async function(pattern) {
//     const matches = [];

//     let cursor = 0;

//     do {
//       const reply = await this.scan(cursor, {
//         MATCH: pattern, 
//         COUNT: 100,     
//       });

//       cursor = reply.cursor;

//       matches.push(...reply.keys);
//     } while (cursor !== 0);
// }

export const redisClient = client;