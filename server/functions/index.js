const express = require("express");
const cors = require("cors");
const { Middleware } = require("./Middleware");
const { onRequest } = require("firebase-functions/v2/https");
const app = express();


app.use(cors({ origin: true }));
app.use(express.json());

app.use('/', Middleware);

exports.v1 = onRequest({
    concurrency: 1,
    cors: true,
    memory: "1GB",
    memory: "1GiB",
    timeoutSeconds: 60,
}, app);
