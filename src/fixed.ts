import { join } from "path";
const e = process.env;
export const YU_DOMAIN_NAME = e.YU_DOMAIN_NAME || "localhost";
export const YU_DO_SPACES_REGION = e.YU_DO_SPACES_REGION || "sgp1";
export const YU_DO_SPACES_ACCESS_KEY_ID = e.YU_DO_SPACES_ACCESS_KEY_ID || "sgp1";
export const YU_DO_SPACES_SECRET_ACCESS_KEY = e.YU_DO_SPACES_SECRET_ACCESS_KEY || "sgp1";
export const YU_DO_BUCKET_NAME = e.YU_DO_BUCKET_NAME || "";
export const YU_DO_SPACES_ENDPOINT = e.YU_DO_SPACES_ENDPOINT || '';
export const YU_STATIC_DOMAIN_SUFFIX = e.YU_STATIC_DOMAIN_SUFFIX || "bsnl.online"
export const YU_BACKEND_PORT = e.YU_BACKEND_PORT || "8080";
export const YU_REDIS_HOST = e.YU_REDIS_HOST || "localhost"
export const YU_DB_FILE = e.YU_DB_FILE || join(process.cwd(), "data", "data.db")
export const subDomainRegexp = /^[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?$/