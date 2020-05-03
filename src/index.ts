import * as express from "express";
import { handleLogin, validateAuthCredentials, handleSignup, jwtTokenVerifier } from "./auth";
import { handleList, handleRecommend, validateRecommed, handleHostExists, validateHostExists } from "./info";
import { handleDown, validateDown, handleUp, validateUp } from "./updown";
import { YU_BACKEND_PORT } from "./fixed";
import * as multer from "multer";
import { tmpdir } from 'os';
const app = express();

const fileUploadMiddleware = multer({ dest: tmpdir() }).single("files");

app.post("/up", fileUploadMiddleware, jwtTokenVerifier, validateUp, handleUp);

app.use(express.json()); //Middle to parse request data


app.post("/login", validateAuthCredentials, handleLogin);
app.post("/signup", validateAuthCredentials, handleSignup);

app.use(jwtTokenVerifier);


//Below endpoints are for users

app.get("/list", handleList);
app.get("/recommend", validateRecommed, handleRecommend);
app.post("/down", validateDown, handleDown);
app.get("/host", validateHostExists, handleHostExists);

app.listen(YU_BACKEND_PORT, () => {
    console.log("Listeing at ", YU_BACKEND_PORT);
})
