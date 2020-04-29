import * as sqlite3 from 'sqlite3';
import { open } from "sqlite";
import { createClient, RedisClient } from 'redis';
import { promisify } from "util";

export async function getDatabase() {
    return open({
        driver: sqlite3.Database,
        filename: "data.db"
    });
}

export function getRedis(): RedisClient {
    //const red = new RedisClientAsync(createClient());
    return createClient();
}

// export class RedisClientAsync {
//     red: RedisClient

//     constructor(red: RedisClient) {
//         this.red = red;
//         red.set
//     }



// }