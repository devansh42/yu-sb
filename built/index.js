"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var auth_1 = require("./auth");
var info_1 = require("./info");
var updown_1 = require("./updown");
var fixed_1 = require("./fixed");
var multer = require("multer");
var os_1 = require("os");
var app = express();
var fileUploadMiddleware = multer({ dest: os_1.tmpdir() }).single("files");
app.post("/up", auth_1.jwtTokenVerifier, updown_1.validateUp, fileUploadMiddleware, updown_1.handleUp);
app.use(express.json()); //Middle to parse request data
app.post("/login", auth_1.handleLogin, auth_1.validateAuthCredentials);
app.post("/signup", auth_1.handleSignup, auth_1.validateAuthCredentials);
app.use(auth_1.jwtTokenVerifier);
//Below endpoints are for users
app.get("/list", info_1.handleList);
app.get("/recommend", info_1.handleRecommend, info_1.validateRecommed);
app.post("/down", updown_1.handleDown, updown_1.validateDown);
app.get("/host", info_1.handleHostExists, info_1.validateHostExists);
app.listen(fixed_1.YU_BACKEND_PORT, function () {
    console.log("Listeing at ", fixed_1.YU_BACKEND_PORT);
});
