//This file contains code to handle auth related stuff
import * as express from "express";

import { sign, verify } from "jsonwebtoken";
import { getDB } from "./db";

//Validates things for signup/login function
export function validateAuthCredentials(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { email, password } = req.body;
    let msg: string = "";
    if (email == undefined || password == undefined) msg = "Email/Password Required";
    else if (password.length < 8) msg = "Password must be atleast 8 character";
    if (msg == "") next();
    else res.status(400).send(msg).end();

}


export async function handleLogin(req: express.Request, res: express.Response) {
    const { email, password } = req.body;
    const db = await getDB();
    let stmt = await db.prepare("select uid from users where email=? and password=? limit 1");
    let rows = await stmt.all(email, password)
    if (rows.length == 1) {
        let access_token = createKJWTToken(rows[0].uid)
        res.status(200).json({ email, access_token }).end();

    } else {
        //Invalid credentials
        res.status(403).send().end();
    }

    await db.close();

}


//handleSignup handles singup process
export async function handleSignup(req: express.Request, res: express.Response) {
    const { email, password } = req.body;
    const db = await getDB();
    let stmt = await db.prepare("select uid from users where email=? and password=? limit 1");
    let rows = await stmt.all(email, password)
    if (rows.length == 1) {
        res.status(200).send().end();
    } else if (rows.length == 0) {
        //Invalid credentials
        stmt = await db.prepare("select uid from users where email=? limit 1");
        rows = await stmt.all(email);
        if (rows.length == 1) res.status(403).send().end();
        else {
            stmt = await db.prepare("insert into users(email,password)values(?,?)");
            let r = await stmt.run(email, password);
            let access_token = createKJWTToken(r.lastID)
            res.status(201).json({ email, access_token }).end();
        }
    }

    await db.close();
}


export function jwtTokenVerifier(req: express.Request, res: express.Response, next: express.NextFunction) {
    const t = req.get("Authorization")
    let msg: string;

    if (t == "" || t == undefined || t.split(" ").length != 2) {
        msg = "Invalid jwt token: Authentication Required";
        res.status(403).send(msg).end();

    }
    try {
        const pay = verify(t.split(" ")[1], someSecret);
        req.body.uid = JSON.parse(pay.toString()).data;
        next();

    } catch (error) {
        msg = "Invalid/Expired Token : Authentication Required";
        res.status(403).send(msg).end();

    }
}


const someSecret = "somesecret";

function createKJWTToken(userid: number) {
    const token = sign({
        data: userid,
        exp: Math.floor(Date.now() / 1000) + (86400), // 1d Validity


    }, someSecret)
    return token;
}