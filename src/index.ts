import * as express from "express";
import { handleLogin, validateAuthCredentials, handleSignup, jwtTokenVerifier } from "./auth";
import { handleList, handleRecommend, validateRecommed, handleHostExists, validateHostExists } from "./info";
import { handleDown, validateDown, handleUp, validateUp } from "./updown";
import { YU_BACKEND_PORT } from "./fixed";

const app = express();
app.use(express.json()); //Middle to parse request data


app.post("/login", handleLogin, validateAuthCredentials);
app.post("/signup", handleSignup, validateAuthCredentials);

app.use(jwtTokenVerifier);

//Below endpoints are for users
app.get("/list", handleList);
app.get("/recommend", handleRecommend, validateRecommed);
app.post("/down", handleDown, validateDown);
app.post("/up", handleUp, validateUp);
app.get("/host", handleHostExists, validateHostExists);

app.listen(YU_BACKEND_PORT, () => {
    console.log("Listeing at ", YU_BACKEND_PORT);
})
