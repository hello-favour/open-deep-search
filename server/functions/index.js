const express = require("express");
const cors = require("cors");
const { Middleware } = require("./Middleware");
const { onRequest } = require("firebase-functions/v2/https");
const { deepSearchRoutes } = require("./Routes/DeepSearch/DeepSearch");
const { deepSearchRoutesV2 } = require("./Routes/DeepSearchV2/DeepSearchV2");

const app = express();
const appV2 = express();


app.use(cors({ origin: true }));

app.use('/', Middleware);

app.use("/deep-search", deepSearchRoutes);
appV2.use("/open-deep-search", deepSearchRoutesV2);

exports.v1 = onRequest({
    concurrency: 1,
    cors: true,
    memory: "1GiB",
    timeoutSeconds: 60,
}, app);


exports.v2 = onRequest({
    concurrency: 1,
    cors: true,
    memory: "2GiB",
    timeoutSeconds: 60,
}, appV2);
