"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var auth_1 = require("./auth");
var info_1 = require("./info");
var updown_1 = require("./updown");
var fixed_1 = require("./fixed");
var app = express();
app.use(express.json()); //Middle to parse request data
app.post("/login", auth_1.handleLogin, auth_1.validateAuthCredentials);
app.post("/signup", auth_1.handleSignup, auth_1.validateAuthCredentials);
app.use(auth_1.jwtTokenVerifier);
//Below endpoints are for users
app.get("/list", info_1.handleList);
app.get("/recommend", info_1.handleRecommend, info_1.validateRecommed);
app.post("/down", updown_1.handleDown, updown_1.validateDown);
app.post("/up", updown_1.handleUp, updown_1.validateUp);
app.post("/host", info_1.handleHostExists, info_1.validateHostExists);
app.listen(fixed_1.YU_BACKEND_PORT, function () {
    console.log("Listeing at ", fixed_1.YU_BACKEND_PORT);
});
