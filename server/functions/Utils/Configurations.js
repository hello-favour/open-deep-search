const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");
const { onInit } = require("firebase-functions/v2/core");

const API_PIE_KEY = defineString("API_PIE_KEY");

const finalConfigs = {
    PIE_API_KEY: undefined,
}

onInit(async () => {
    finalConfigs.PIE_API_KEY = API_PIE_KEY.value();
    admin.initializeApp();
});


module.exports = {
    finalConfigs: () => finalConfigs,
};