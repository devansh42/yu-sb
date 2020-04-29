"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = require("jsonwebtoken");
var db_1 = require("./db");
//Validates things for signup/login function
function validateAuthCredentials(req, res, next) {
    var _a = req.body, email = _a.email, password = _a.password;
    var msg = "";
    if (email == undefined || password == undefined)
        msg = "Email/Password Required";
    else if (password.length < 8)
        msg = "Password must be atleast 8 character";
    if (msg == "")
        next();
    else
        res.status(400).send(msg).end();
}
exports.validateAuthCredentials = validateAuthCredentials;
function handleLogin(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, password, db, stmt, rows, access_token;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, email = _a.email, password = _a.password;
                    return [4 /*yield*/, db_1.getDB()];
                case 1:
                    db = _b.sent();
                    return [4 /*yield*/, db.prepare("select uid from users where email=? and password=? limit 1")];
                case 2:
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.all(email, password)];
                case 3:
                    rows = _b.sent();
                    if (rows.length == 1) {
                        access_token = createKJWTToken(rows[0].uid);
                        res.status(200).json({ email: email, access_token: access_token }).end();
                    }
                    else {
                        //Invalid credentials
                        res.status(403).send().end();
                    }
                    return [4 /*yield*/, db.close()];
                case 4:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.handleLogin = handleLogin;
//handleSignup handles singup process
function handleSignup(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, password, db, stmt, rows, r, access_token;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, email = _a.email, password = _a.password;
                    return [4 /*yield*/, db_1.getDB()];
                case 1:
                    db = _b.sent();
                    return [4 /*yield*/, db.prepare("select uid from users where email=? and password=? limit 1")];
                case 2:
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.all(email, password)];
                case 3:
                    rows = _b.sent();
                    if (!(rows.length == 1)) return [3 /*break*/, 4];
                    res.status(200).send().end();
                    return [3 /*break*/, 10];
                case 4:
                    if (!(rows.length == 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, db.prepare("select uid from users where email=? limit 1")];
                case 5:
                    //Invalid credentials
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.all(email)];
                case 6:
                    rows = _b.sent();
                    if (!(rows.length == 1)) return [3 /*break*/, 7];
                    res.status(403).send().end();
                    return [3 /*break*/, 10];
                case 7: return [4 /*yield*/, db.prepare("insert into users(email,password)values(?,?)")];
                case 8:
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.run(email, password)];
                case 9:
                    r = _b.sent();
                    access_token = createKJWTToken(r.lastID);
                    res.status(201).json({ email: email, access_token: access_token }).end();
                    _b.label = 10;
                case 10: return [4 /*yield*/, db.close()];
                case 11:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.handleSignup = handleSignup;
function jwtTokenVerifier(req, res, next) {
    var t = req.get("Authorization");
    var msg;
    if (t == "" || t == undefined || t.split(" ").length != 2) {
        msg = "Invalid jwt token: Authentication Required";
        res.status(403).send(msg).end();
    }
    try {
        var pay = jsonwebtoken_1.verify(t.split(" ")[1], someSecret);
        req.body.uid = JSON.parse(pay.toString()).data;
        next();
    }
    catch (error) {
        msg = "Invalid/Expired Token : Authentication Required";
        res.status(403).send(msg).end();
    }
}
exports.jwtTokenVerifier = jwtTokenVerifier;
var someSecret = "somesecret";
function createKJWTToken(userid) {
    var token = jsonwebtoken_1.sign({
        data: userid,
        exp: Math.floor(Date.now() / 1000) + (86400),
    }, someSecret);
    return token;
}
