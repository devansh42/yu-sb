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
var crypto = require("crypto");
var fixed_1 = require("./fixed");
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
function md5(s) {
    return crypto.createHash("md5")
        .update(s, "utf8")
        .digest("hex");
}
function handleLogin(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, password, db, stmt, rows, access_token, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, email = _a.email, password = _a.password;
                    return [4 /*yield*/, db_1.getDB()];
                case 1:
                    db = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, 6, 8]);
                    return [4 /*yield*/, db.prepare("select uid from users where email=? and password=? limit 1")];
                case 3:
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.all(email, md5(password))];
                case 4:
                    rows = _b.sent();
                    if (rows.length == 1) {
                        access_token = createKJWTToken(rows[0].uid);
                        res.status(200).json({ email: email, access_token: access_token }).end();
                    }
                    else {
                        //Invalid credentials
                        res.status(403).send().end();
                    }
                    return [3 /*break*/, 8];
                case 5:
                    error_1 = _b.sent();
                    console.error(error_1);
                    res.status(500).end();
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, db.close()];
                case 7:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.handleLogin = handleLogin;
//handleSignup handles singup process
function handleSignup(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, password, db, stmt, rows, r, access_token, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, email = _a.email, password = _a.password;
                    return [4 /*yield*/, db_1.getDB()];
                case 1:
                    db = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 13, 14, 16]);
                    return [4 /*yield*/, db.prepare("select uid from users where email=? and password=? limit 1")];
                case 3:
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.all(email, md5(password))];
                case 4:
                    rows = _b.sent();
                    if (!(rows.length == 1)) return [3 /*break*/, 5];
                    res.status(200).send().end();
                    return [3 /*break*/, 12];
                case 5:
                    if (!(rows.length == 0)) return [3 /*break*/, 12];
                    return [4 /*yield*/, db.prepare("select uid from users where email=? limit 1")];
                case 6:
                    //Invalid credentials
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.all(email)];
                case 7:
                    rows = _b.sent();
                    if (!(rows.length == 1)) return [3 /*break*/, 8];
                    res.status(403).send().end();
                    return [3 /*break*/, 12];
                case 8: return [4 /*yield*/, db.prepare("insert into users(email,password)values(?,?)")];
                case 9:
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.run(email, md5(password))];
                case 10:
                    r = _b.sent();
                    access_token = createKJWTToken(r.lastID);
                    res.status(201).json({ email: email, access_token: access_token }).end();
                    return [4 /*yield*/, stmt.finalize()];
                case 11:
                    _b.sent();
                    _b.label = 12;
                case 12: return [3 /*break*/, 16];
                case 13:
                    error_2 = _b.sent();
                    console.error(error_2);
                    res.status(500).end();
                    return [3 /*break*/, 16];
                case 14: return [4 /*yield*/, db.close()];
                case 15:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 16: return [2 /*return*/];
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
        console.log(msg);
        return; // Returning back
    }
    try {
        var pay = jsonwebtoken_1.verify(t.split(" ")[1], someSecret);
        req.body.uid = pay["data"];
        next();
    }
    catch (error) {
        msg = "Invalid/Expired Token : Authentication Required";
        res.status(403).send(msg).end();
        console.log(error);
    }
}
exports.jwtTokenVerifier = jwtTokenVerifier;
var someSecret = fixed_1.YU_JWT_SECRET;
function createKJWTToken(userid) {
    var token = jsonwebtoken_1.sign({
        data: userid,
        exp: Math.floor(Date.now() / 1000) + (86400),
    }, someSecret);
    return token;
}
