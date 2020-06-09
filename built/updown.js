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
var db_1 = require("./db");
var redis_1 = require("./redis");
var tar_1 = require("tar");
var fs = require("fs");
var path_1 = require("path");
var tmp_promise_1 = require("tmp-promise");
var aws = require("aws-sdk");
var mime = require("mime-types");
var fixed_1 = require("./fixed");
var info_1 = require("./info");
//AWS Configuration initalization
aws.config.update({ region: fixed_1.YU_DO_SPACES_REGION, accessKeyId: fixed_1.YU_DO_SPACES_ACCESS_KEY_ID, secretAccessKey: fixed_1.YU_DO_SPACES_SECRET_ACCESS_KEY });
//Making AWS S3 Object
var s3 = new aws.S3({ apiVersion: '2006-03-01', endpoint: fixed_1.YU_DO_SPACES_ENDPOINT });
//validateUp handles validation for site uploads
function validateUp(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var r, _a, hostname, type;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    r = ["hostname", "type", "wd"];
                    if (r.filter(function (v) { return v in req.body; }).length != r.length) {
                        res.status(400).send("Required Parameters not found").end();
                        fs.unlink(req.file.path, function () { });
                        return [2 /*return*/];
                    }
                    _a = req.body, hostname = _a.hostname, type = _a.type;
                    if (!(!info_1.isValidHostname(hostname) || ["regular", "spa"].indexOf(type) == -1)) return [3 /*break*/, 1];
                    res.status(400).send("Invalid Parameters").end();
                    fs.unlink(req.file.path, function () { });
                    return [2 /*return*/];
                case 1: return [4 /*yield*/, info_1.isHostExists(hostname)];
                case 2:
                    if (_b.sent()) {
                        res.status(400).send("website exists already").end();
                        fs.unlink(req.file.path, function () { });
                        return [2 /*return*/];
                    }
                    else
                        next();
                    _b.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.validateUp = validateUp;
//handleUp handles site uploading stuff after request parameter validation
function handleUp(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, hostname, uid, type, wd, db, stmt, r, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, hostname = _a.hostname, uid = _a.uid, type = _a.type, wd = _a.wd;
                    return [4 /*yield*/, db_1.getDB()];
                case 1:
                    db = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 11, 12, 14]);
                    return [4 /*yield*/, uploadFile(hostname, req.file.path, wd)];
                case 3:
                    _b.sent();
                    sendSignal(hostname, type, true); //sending signal to server
                    return [4 /*yield*/, db.prepare("update deployments set type=?,status=? where uid=? and hostname=? ")];
                case 4:
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.run(type, 1, uid, hostname)];
                case 5:
                    r = _b.sent();
                    return [4 /*yield*/, stmt.finalize()];
                case 6:
                    _b.sent();
                    if (!(r.changes == 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, db.prepare("insert into deployments (hostname,uid,status,type)values(?,?,?,?)")];
                case 7:
                    // We have to insert a new row
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.run(hostname, uid, 1, type)];
                case 8:
                    _b.sent();
                    return [4 /*yield*/, stmt.finalize()];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10:
                    res.status(200).end();
                    return [3 /*break*/, 14];
                case 11:
                    error_1 = _b.sent();
                    console.error(error_1);
                    res.status(500).end();
                    return [3 /*break*/, 14];
                case 12: return [4 /*yield*/, db.close()];
                case 13:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
exports.handleUp = handleUp;
function uploadFile(hostname, path, wd) {
    return __awaiter(this, void 0, void 0, function () {
        var tempDir, y, ar, p, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tmp_promise_1.dir()];
                case 1:
                    tempDir = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, 6, 7]);
                    return [4 /*yield*/, tar_1.x({ file: path, cwd: tempDir.path })
                        //for Window paths
                    ];
                case 3:
                    _a.sent();
                    //for Window paths
                    if (wd.split(":").length > 1 && wd.indexOf("\\") > -1) {
                        y = wd.split(":")[1];
                        wd = y.split("\\").join("/");
                    }
                    ar = walkDir(path_1.join(tempDir.path, wd));
                    p = ar.map(function (src) {
                        var t = mime.lookup(src);
                        return s3.putObject({
                            Bucket: fixed_1.YU_DO_BUCKET_NAME,
                            ACL: "public-read",
                            ContentType: t == false ? "application/octet-stream" : String(t),
                            Body: fs.readFileSync(src), Key: src.replace(path_1.join(tempDir.path, wd), hostname)
                        }).promise();
                    });
                    return [4 /*yield*/, Promise.all(p)];
                case 4: return [2 /*return*/, _a.sent()];
                case 5:
                    err_1 = _a.sent();
                    console.log(err_1);
                    throw err_1;
                case 6:
                    fs.unlinkSync(path); //Removing uploaded files
                    fs.rmdirSync(tempDir.path, { recursive: true }); //Cleanup temporary directory
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
var rd = fs.readdirSync;
function walkDir(path) {
    var ar = [];
    listDir(path, ar);
    return ar;
}
function listDir(path, ar) {
    var list = rd(path);
    for (var i = 0; i < list.length; i++) {
        var o = path_1.join(path, list[i]);
        if (fs.statSync(o).isFile()) {
            ar.push(o);
        }
        else {
            listDir(o, ar);
        }
    }
}
function validateDown(req, res, next) {
    var hostname = req.body.hostname;
    var h = hostname.toString();
    if (info_1.isValidHostname(h))
        next();
    else
        res.status(400).send("Invalid Hostname").end();
}
exports.validateDown = validateDown;
function handleDown(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, uid, hostname, db, stmt, rows, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, uid = _a.uid, hostname = _a.hostname;
                    return [4 /*yield*/, db_1.getDB()];
                case 1:
                    db = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 12, 13, 15]);
                    return [4 /*yield*/, db.prepare("select status,type from deployments where uid=? and hostname=? limit 1")];
                case 3:
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.all(uid, hostname)];
                case 4:
                    rows = _b.sent();
                    return [4 /*yield*/, stmt.finalize()];
                case 5:
                    _b.sent();
                    if (!(rows.length == 0)) return [3 /*break*/, 6];
                    // Website doesn't belongs to you
                    res.status(401).end();
                    return [3 /*break*/, 11];
                case 6:
                    if (!(rows[0].status == 1)) return [3 /*break*/, 10];
                    return [4 /*yield*/, db.prepare("update deployments set status=? where hostname=? and uid=? ")];
                case 7:
                    //Site is deployed 
                    stmt = _b.sent();
                    sendSignal(hostname, rows[0].type, false);
                    return [4 /*yield*/, stmt.run(0, hostname, uid)];
                case 8:
                    _b.sent();
                    return [4 /*yield*/, stmt.finalize()];
                case 9:
                    _b.sent();
                    res.status(200).end();
                    return [3 /*break*/, 11];
                case 10:
                    res.status(404).end();
                    _b.label = 11;
                case 11: return [3 /*break*/, 15];
                case 12:
                    error_2 = _b.sent();
                    console.error(error_2);
                    res.status(500).end();
                    return [3 /*break*/, 15];
                case 13: return [4 /*yield*/, db.close()];
                case 14:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
exports.handleDown = handleDown;
function sendSignal(hostname, type, deploy) {
    var rd = redis_1.getRedis();
    rd.publish(deploy ? "static-site-deploy" : "static-site-undeploy", JSON.stringify({
        "site-hostname": hostname,
        "site-type": type
    }));
    var h = hostname.split(".")[0];
    if (deploy) {
        rd.sadd("domains", h); //adding to cache
    }
    else {
        rd.srem("domains", h); //removing from cache
    }
}
