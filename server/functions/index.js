const express = require("express");
const cors = require("cors");
const { Middleware } = require("./Middleware");
const { onRequest } = require("firebase-functions/v2/https");
const { deepSearchRoutes } = require("./Routes/DeepSearch");
const { deepSearchRoutesV2 } = require("./Routes/DeepSearchV2");
const app = express();


app.use(cors({ origin: true }));

app.use('/', Middleware);

app.use("/deep-search", deepSearchRoutes);
app.use("/deep-search-v2", deepSearchRoutesV2);

exports.v1 = onRequest({
    concurrency: 1,
    cors: true,
    memory: "1GB",
    memory: "1GiB",
    timeoutSeconds: 60,
}, app);
