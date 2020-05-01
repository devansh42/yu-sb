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
var datamuse = require("datamuse");
var fixed_1 = require("./fixed");
var redis_1 = require("./redis");
var util_1 = require("util");
//handleList handles listing of project
function handleList(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var only_deployed, uid, db, sql, stmt, rows, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    only_deployed = req.query.only_deployed;
                    uid = req.body.uid;
                    return [4 /*yield*/, db_1.getDB()];
                case 1:
                    db = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, 7, 9]);
                    sql = "select hostname,status from deployments where uid=?";
                    if (only_deployed == undefined || !only_deployed) {
                        //Fetch all
                    }
                    else {
                        sql.concat(" and status=1");
                    }
                    return [4 /*yield*/, db.prepare(sql)];
                case 3:
                    stmt = _a.sent();
                    return [4 /*yield*/, stmt.all(uid)];
                case 4:
                    rows = _a.sent();
                    return [4 /*yield*/, stmt.finalize()];
                case 5:
                    _a.sent();
                    res.status(200).json(rows.map(function (v) {
                        return { hostname: v.hostname, deployed: v.status == 1 };
                    })).end();
                    return [3 /*break*/, 9];
                case 6:
                    error_1 = _a.sent();
                    console.log(error_1);
                    res.status(500).send("Internal server error").end();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, db.close()];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.handleList = handleList;
function validateRecommed(req, res, next) {
    var hostname = req.query.hostname;
    if (hostname == undefined)
        res.status(400).send('Hostname Required').end();
    else {
        if (hostname.toString().split(".").length !== 3)
            res.status(400).send("Invalid Hostname").end();
        else
            next();
    }
}
exports.validateRecommed = validateRecommed;
function handleRecommend(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var hostname, ar, s, err_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hostname = req.query.hostname;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, datamuse.sug({
                            s: hostname.toString().split(".")[0],
                            max: 10 //Max 10 suggestion
                        })];
                case 2:
                    ar = _a.sent();
                    s = ar.map(function (_a) {
                        var word = _a.word;
                        return word.search(" ") > -1 ? word.split(" ").join("-") : word;
                    })
                        .filter(function (w) { return fixed_1.subDomainRegexp.test(w); })
                        .filter(function (w) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, !isHostExists([w, fixed_1.YU_DOMAIN_NAME].join("."))];
                    }); }); });
                    res.status(200).json(s).end();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    res.status(500).send("Couldn't suggest a domain").end();
                    console.log(err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.handleRecommend = handleRecommend;
function validateHostExists(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var hostname, h;
        return __generator(this, function (_a) {
            hostname = req.query.hostname;
            h = String(hostname);
            if (h == undefined)
                res.status(400).end();
            if (!isValidHostname(h))
                res.status(400).end();
            else
                next();
            return [2 /*return*/];
        });
    });
}
exports.validateHostExists = validateHostExists;
function handleHostExists(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var hostname;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hostname = req.query.hostname;
                    return [4 /*yield*/, isHostExists(String(hostname))];
                case 1:
                    if (_a.sent()) {
                        res.status(200).end();
                    }
                    else {
                        res.status(404).end();
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.handleHostExists = handleHostExists;
//isHostExists checks if hostname exists or not via hostname lookup
function isHostExists(hostname) {
    return __awaiter(this, void 0, void 0, function () {
        var rd, s, p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rd = redis_1.getRedis();
                    s = hostname.split(".")[0];
                    p = util_1.promisify(rd.sismember).bind(rd);
                    return [4 /*yield*/, p("domains", s)];
                case 1: return [2 /*return*/, (_a.sent()) == 1];
            }
        });
    });
}
exports.isHostExists = isHostExists;
function isValidHostname(h) {
    if (h.split(".").length !== 3)
        return false;
    else if (!h.endsWith(fixed_1.YU_STATIC_DOMAIN_SUFFIX))
        return false;
    return fixed_1.subDomainRegexp.test(h.split(".")[0]);
}
exports.isValidHostname = isValidHostname;
