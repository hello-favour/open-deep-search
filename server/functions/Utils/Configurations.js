const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");
const { onInit } = require("firebase-functions/v2/core");

const API_PIE_KEY = defineString("API_PIE_KEY");
const GOOGLE_CUSTOM_SEARCH_ENGINE_ID = defineString('GOOGLE_CUSTOM_SEARCH_ENGINE_ID');
const GOOGLE_CUSTOM_SEARCH_KEY = defineString('GOOGLE_CUSTOM_SEARCH_KEY')
const GEMINI_API_KEY = defineString('GEMINI_API_KEY');

const finalConfigs = {
    PIE_API_KEY: undefined,
    GOOGLE_CUSTOM_SEARCH_ENGINE_ID: undefined,
    GOOGLE_CUSTOM_SEARCH_KEY: undefined,
    GEMINI_API_KEY: undefined,
    genAI: undefined,
}

onInit(async () => {
    finalConfigs.PIE_API_KEY = API_PIE_KEY.value();
    finalConfigs.GOOGLE_CUSTOM_SEARCH_ENGINE_ID = GOOGLE_CUSTOM_SEARCH_ENGINE_ID.value();
    finalConfigs.GOOGLE_CUSTOM_SEARCH_KEY = GOOGLE_CUSTOM_SEARCH_KEY.value();
    finalConfigs.GEMINI_API_KEY = GEMINI_API_KEY.value();

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    finalConfigs.genAI = genAI;

    admin.initializeApp();
});


module.exports = {
    finalConfigs: () => finalConfigs,
};