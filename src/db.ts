import { open } from "sqlite";
import * as sqlite3 from 'sqlite3';

export async function getDB() {
    return open({
        filename: "data.db",
        driver: sqlite3.Database
    });
}