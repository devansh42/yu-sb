import * as sqlite3 from 'sqlite3';
import { open } from "sqlite";
import { createClient, RedisClient } from 'redis';
import { YU_REDIS_HOST, YU_DB_FILE } from "./fixed";


export function getRedis(): RedisClient {
    //const red = new RedisClientAsync(createClient());
    return createClient({ host: YU_REDIS_HOST });
}

// export class RedisClientAsync {
//     red: RedisClient

//     constructor(red: RedisClient) {
//         this.red = red;
//         red.set
//     }



// }