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
//handleUp handles site uploading stuff after request parameter validation
function handleUp(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, hostname, uid, type, files, wd, db, stmt, r;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, hostname = _a.hostname, uid = _a.uid, type = _a.type, files = _a.files, wd = _a.wd;
                    sendSignal(hostname, type, true); //sending signal to server
                    uploadFile(hostname, files, wd);
                    return [4 /*yield*/, db_1.getDB()];
                case 1:
                    db = _b.sent();
                    return [4 /*yield*/, db.prepare("update deployments set type=? and set status=? where uid=? and hostname=? limit 1")];
                case 2:
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.run(type, 1, uid, hostname)];
                case 3:
                    r = _b.sent();
                    if (!(r.changes == 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, db.prepare("insert into deployments (hostname,uid,status,type)values(?,?,?,?)")];
                case 4:
                    // We have to insert a new row
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.run(hostname, uid, 1, type)];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: return [4 /*yield*/, db.close()];
                case 7:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.handleUp = handleUp;
function uploadFile(hostname, files, wd) {
    var _this = this;
    tmp_promise_1.file().then(function (f) { return __awaiter(_this, void 0, void 0, function () {
        var d;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs.writeFileSync(f.path, tmp_promise_1.file, { encoding: "base64" });
                    return [4 /*yield*/, tmp_promise_1.dir()];
                case 1:
                    d = _a.sent();
                    return [4 /*yield*/, tar_1.x({ file: f.path, cwd: d.path })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
}
var rd = fs.readdirSync;
function listDir(path) {
    var list = rd(path);
    var ar = [];
    list.map(function (v) {
        var o = path_1.join(path, v);
        if (fs.statSync(o).isDirectory()) {
            ar = ar.concat(listDir(o));
        }
        else {
            ar.push(o);
        }
    });
    return ar;
}
function test_listDir() {
    listDir("/home/devansh42/project/yu/demo/yu-static-scheduler").forEach(console.log);
}
test_listDir();
function handleDown(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var db, _a, uid, hostname, stmt, rows;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDB()];
                case 1:
                    db = _b.sent();
                    _a = req.body, uid = _a.uid, hostname = _a.hostname;
                    return [4 /*yield*/, db.prepare("select status,type from deployments where uid=? and hostname=? limit 1")];
                case 2:
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.all(uid, hostname)];
                case 3:
                    rows = _b.sent();
                    if (!(rows.length == 0)) return [3 /*break*/, 4];
                    // Website doesn't belongs to you
                    res.status(401).end();
                    return [3 /*break*/, 8];
                case 4:
                    if (!(rows[0].status == 1)) return [3 /*break*/, 7];
                    return [4 /*yield*/, db.prepare("update deployments set status=? where hostname=? and uid=? limit 1")];
                case 5:
                    //Site is deployed 
                    stmt = _b.sent();
                    sendSignal(hostname, rows[0].type, false);
                    return [4 /*yield*/, stmt.run(0, hostname, uid)];
                case 6:
                    _b.sent();
                    res.status(200).end();
                    return [3 /*break*/, 8];
                case 7:
                    res.status(404).end();
                    _b.label = 8;
                case 8: return [4 /*yield*/, db.close()];
                case 9:
                    _b.sent();
                    return [2 /*return*/];
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
}
