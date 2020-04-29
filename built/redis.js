"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redis_1 = require("redis");
var fixed_1 = require("./fixed");
function getRedis() {
    //const red = new RedisClientAsync(createClient());
    return redis_1.createClient({ host: fixed_1.YU_REDIS_HOST });
}
exports.getRedis = getRedis;
// export class RedisClientAsync {
//     red: RedisClient
//     constructor(red: RedisClient) {
//         this.red = red;
//         red.set
//     }
// }
