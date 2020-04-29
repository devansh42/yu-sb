"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var auth_1 = require("./auth");
var info_1 = require("./info");
var app = express();
app.use(express.json()); //Middle to parse request data
app.post("/login", auth_1.handleLogin, auth_1.validateAuthCredentials);
app.post("/signup", auth_1.handleSignup, auth_1.validateAuthCredentials);
app.use(auth_1.jwtTokenVerifier);
app.get("/list", info_1.handleList);
