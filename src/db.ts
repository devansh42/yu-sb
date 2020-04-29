import { open } from "sqlite";
import * as sqlite3 from 'sqlite3';
import { YU_DB_FILE } from "./fixed";

export async function getDB() {
    return open({
        filename: YU_DB_FILE,
        driver: sqlite3.Database
    });
}