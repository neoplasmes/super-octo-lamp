import { createClient } from "redis";

const client = createClient({
    url: 'redis://localhost:6379'
});

client.on('error', err => console.log('Redis Client Error', err));

client.connect().catch(err => console.log(`error while connecting to redis: ${err}`));

export {
    client
};