//This file contains code for code deployement
import * as express from "express";
import { getDB } from "./db";
import { getRedis } from "./redis";
import { x } from "tar";
import * as fs from "fs";
import { join } from "path";
import { file, dir, } from "tmp-promise";
import * as  aws from "aws-sdk";
import * as mime from "mime-types";

import { YU_DO_SPACES_REGION, YU_DO_SPACES_ACCESS_KEY_ID, YU_DO_SPACES_SECRET_ACCESS_KEY, YU_DO_BUCKET_NAME, YU_DO_SPACES_ENDPOINT, YU_STATIC_DOMAIN_SUFFIX, subDomainRegexp } from "./fixed";

import { isHostExists } from "./info";


//AWS Configuration initalization
aws.config.update({ region: YU_DO_SPACES_REGION, accessKeyId: YU_DO_SPACES_ACCESS_KEY_ID, secretAccessKey: YU_DO_SPACES_SECRET_ACCESS_KEY })
//Making AWS S3 Object
const s3 = new aws.S3({ apiVersion: '2006-03-01', endpoint: YU_DO_SPACES_ENDPOINT });


//validateUp handles validation for site uploads
export async function validateUp(req: express.Request, res: express.Response, next: express.NextFunction) {
    let r = ["hostname", "type", "wd", "type"];
    if (r.filter(v => v in req.body).length != r.length) res.status(400).send("Required Parameters not found").end();
    const { hostname, type } = req.body;
    if (!isValidHostname(hostname.toString()) || !(type.toString() in ["regular", "spa"])) {
        res.status(400).send("Invalid Parameters").end();
    } else if (isHostExists(hostname)) res.status(400).send("website exists already").end();
    else next();

}





//handleUp handles site uploading stuff after request parameter validation
export async function handleUp(req: express.Request, res: express.Response) {

    const { hostname, uid, type, files, wd } = req.body;
    console.log(type);
    sendSignal(hostname, type, true); //sending signal to server
    uploadFile(hostname, files, wd);
    const db = await getDB();
    try {

        let stmt = await db.prepare("update deployments set type=?,status=? where uid=? and hostname=? ");
        let r = await stmt.run(type, 1, uid, hostname)
        await stmt.finalize();
        if (r.changes == 0) {
            // We have to insert a new row
            stmt = await db.prepare("insert into deployments (hostname,uid,status,type)values(?,?,?,?)");
            await stmt.run(hostname, uid, 1, type)
            await stmt.finalize();

        }
        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).end();
    } finally {

        await db.close();
    }
}

function uploadFile(hostname: string, files: string, wd: string) {
    file().then(async (f) => {
        fs.writeFileSync(f.path, files, { encoding: "base64" })
        const d = await dir();
        await x({ file: f.path, cwd: d.path })
        let ar = walkDir(join(d.path, wd))

        const p = ar.map(src => {
            const t = mime.lookup(src);
            return s3.putObject({
                Bucket: YU_DO_BUCKET_NAME,
                ACL: "public-read", //Canned ACL For public making files publiclly readable
                ContentType: t == false ? "application/octet-stream" : String(t),
                Body: fs.readFileSync(src), Key: src.replace(join(d.path, wd), hostname)
            }).promise();
        });
        Promise.all(p)
            .then(() => {

            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                f.cleanup() //Cleaning up resources
                    .then(() => { })
                    .catch(console.log);

                fs.rmdirSync(d.path, { recursive: true }); //Cleanup temporary directory
            })

    })
}
const rd = fs.readdirSync

function walkDir(path: string): Array<string> {
    const ar = [];
    listDir(path, ar);
    return ar;
}

function listDir(path: string, ar: Array<string>) {
    const list = rd(path);

    for (let i = 0; i < list.length; i++) {
        let o = join(path, list[i]);
        if (fs.statSync(o).isFile()) {
            ar.push(o);
        } else {
            listDir(o, ar)

        }
    }

}


export function validateDown(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { hostname } = req.body;
    const h = hostname.toString();
    if (isValidHostname(h)) next();
    else res.status(400).send("Invalid Hostname").end();
}


function isValidHostname(h: string) {
    if (h.split(".").length !== 3) return false;
    else if (!h.endsWith(YU_STATIC_DOMAIN_SUFFIX)) return false;
    return subDomainRegexp.test(h.split(".")[0])
}


export async function handleDown(req: express.Request, res: express.Response) {
    const { uid, hostname } = req.body;

    const db = await getDB();
    try {

        let stmt = await db.prepare("select status,type from deployments where uid=? and hostname=? limit 1");
        let rows = await stmt.all(uid, hostname);
        await stmt.finalize();
        if (rows.length == 0) {
            // Website doesn't belongs to you
            res.status(401).end();
        } else {
            if (rows[0].status == 1) {
                //Site is deployed 
                stmt = await db.prepare("update deployments set status=? where hostname=? and uid=? ");
                sendSignal(hostname, rows[0].type, false);
                await stmt.run(0, hostname, uid)
                await stmt.finalize();
                res.status(200).end();
            } else {
                res.status(404).end();
            }
        }


    } catch (error) {
        console.error(error);
        res.status(500).end();
    } finally {
        await db.close();
    }
}

function sendSignal(hostname: string, type: string, deploy: boolean) {
    const rd = getRedis()

    rd.publish(deploy ? "static-site-deploy" : "static-site-undeploy", JSON.stringify({
        "site-hostname": hostname,
        "site-type": type
    }));


}