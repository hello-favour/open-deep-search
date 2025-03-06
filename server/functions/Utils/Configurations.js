const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");
const { onInit } = require("firebase-functions/v2/core");

const API_PIE_KEY = defineString("API_PIE_KEY");
const GOOGLE_CUSTOM_SEARCH_ENGINE_ID = defineString('GOOGLE_CUSTOM_SEARCH_ENGINE_ID');
const GOOGLE_CUSTOM_SEARCH_KEY = defineString('GOOGLE_CUSTOM_SEARCH_KEY')

const finalConfigs = {
    PIE_API_KEY: undefined,
    GOOGLE_CUSTOM_SEARCH_ENGINE_ID: undefined,
    GOOGLE_CUSTOM_SEARCH_KEY: undefined,
}

onInit(async () => {
    finalConfigs.PIE_API_KEY = API_PIE_KEY.value();
    finalConfigs.GOOGLE_CUSTOM_SEARCH_ENGINE_ID = GOOGLE_CUSTOM_SEARCH_ENGINE_ID.value();
    finalConfigs.GOOGLE_CUSTOM_SEARCH_KEY = GOOGLE_CUSTOM_SEARCH_KEY.value();

    admin.initializeApp();
});


module.exports = {
    finalConfigs: () => finalConfigs,
};