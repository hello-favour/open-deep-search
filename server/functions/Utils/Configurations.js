const { defineString } = require("firebase-functions/params");
const { onInit } = require("firebase-functions/v2/core");

const API_PIE_KEY = defineString("API_PIE_KEY");
const OPEN_AI_API_KEY = defineString("OPEN_AI_API_KEY");
const GEMINI_API_KEY = defineString("GEMINI_API_KEY");
const DEEPSEEK_API_KEY = defineString("DEEPSEEK_API_KEY");

const finalConfigs = {
    PIE_API_KEY: undefined,
    OPEN_AI_API_KEY: undefined,
    GEMINI_API_KEY: undefined,
    DEEPSEEK_API_KEY: undefined
}

onInit(async () => {
    finalConfigs.PIE_API_KEY = API_PIE_KEY.value();
    finalConfigs.OPEN_AI_API_KEY = OPEN_AI_API_KEY.value();
    finalConfigs.GEMINI_API_KEY = GEMINI_API_KEY.value();
    finalConfigs.DEEPSEEK_API_KEY = DEEPSEEK_API_KEY.value();
});