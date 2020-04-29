import * as express from "express";
import { getDB } from "./db";
import * as datamuse from "datamuse";
import { subDomainRegexp, YU_DOMAIN_NAME } from "./fixed";
import * as dns from "dns";

//handleList handles listing of project
export async function handleList(req: express.Request, res: express.Response) {
    const { only_deployed } = req.query;
    const { uid } = req.body;
    const db = await getDB();
    try {

        let sql = "select hostname,status from deployments where uid=?";
        if (only_deployed == undefined || !only_deployed) {
            //Fetch all
        } else {
            sql.concat(" and status=1");
        }

        let stmt = await db.prepare(sql);
        let rows = await stmt.all(uid)
        await stmt.finalize()
        res.status(200).json(
            rows.map(v => {
                    return { hostname: v.hostname, deployed: v.status == 1 }
            })
        ).end();

    } catch (error) {
        console.log(error)
        res.status(500).send("Internal server error").end();
    } finally {
        await db.close();

    }
}


export function validateRecommed(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { hostname } = req.query;
    if (hostname == undefined) res.status(400).send('Hostname Required').end();
    else {
        if (hostname.toString().split(".").length !== 3) res.status(400).send("Invalid Hostname").end();
        else next();
    }
}


export async function handleRecommend(req: express.Request, res: express.Response) {
    const { hostname } = req.query;
    try {
        const ar = await datamuse.sug({
            s: hostname.toString().split(".")[0],
            max: 10 //Max 10 suggestion
        });

        const s = ar.map(({ word }) => word.search(" ") > -1 ? word.split(" ").join("-") : word)
            .filter((w: string) => subDomainRegexp.test(w))
            .filter(async (w: string) => !isHostExists([w, YU_DOMAIN_NAME].join(".")));
        res.status(200).json(s).end();
    } catch (err) {
        res.status(500).send("Couldn't suggest a domain").end();
        console.log(err)
    }
}



//isHostExists checks if hostname exists or not via hostname lookup
export async function isHostExists(hostname: string) {
    try {
        await dns.promises.lookup(hostname)
        return true; //Lookup is successful and can't be used
    } catch (err) {
        return false;
    }

}