require('dotenv').config();
const express = require('express');
const { analyzeQuerySystemPrompt, searchStrategySystemPrompt, synthesisSystemPrompt } = require('../Utils/Constants/Prompts');
const { getLLMChatCompletionResponse } = require('../Utils/LLMFunctions/Completions');
const { collectData, evaluateData } = require('../Utils/LLMFunctions/GeminiEvalualtionFunctions');

const deepSearchRoutesV2 = express.Router();

deepSearchRoutesV2.post('/query', async (req, res) => {
    const { query, user, requestID } = req.body;

    if (!query || !user) return res.status(400).send({ error: 'Missing required fields' });

    try {
        // Step 1: Query Parsing (R1)
        const analyzedQueryResponse = await getLLMChatCompletionResponse({
            messages: [
                { role: 'system', content: analyzeQuerySystemPrompt },
                { role: 'user', content: query },
            ],
            model: 'deepseek-r1', // Replace with actual R1 model
            provider: 'OpenRouter',
        });

        const analyzedData = JSON.parse(analyzedQueryResponse.choices[0].message.content);

        // Step 2: Search Strategy (R1)
        const searchStrategyResponse = await getLLMChatCompletionResponse({
            messages: [
                { role: 'system', content: searchStrategySystemPrompt },
                { role: 'user', content: JSON.stringify(analyzedData) },
            ],
            model: 'deepseek-r1',
            provider: 'OpenRouter',
        });
        const strategyData = JSON.parse(searchStrategyResponse.choices[0].message.content);

        // Step 3: Data Collection (Gemini Grounding)
        const collectedData = await collectData(strategyData, analyzedData.distilled_query);

        if (!collectedData.length) {
            throw new Error('Failed to collect sufficient data after retries');
        }

        // Step 4: Data Evaluation (GPT-4)
        const evaluatedData = await evaluateData(collectedData, strategyData);

        // Step 5: Synthesis (GPT-4)
        const synthesisResponse = await getLLMChatCompletionResponse({
            messages: [
                { role: 'system', content: synthesisSystemPrompt },
                { role: 'user', content: JSON.stringify(evaluatedData) },
            ],
            model: 'gpt-4o',
            provider: 'openai',
        });
        const finalData = JSON.parse(synthesisResponse.choices[0].message.content);

        // Return the final response
        return res.status(200).send(finalData.response);
    } catch (error) {
        console.error(`Error processing query ${requestID} for user ${user}:`, error);
        return res.status(500).send({ error: 'Internal server error' });
    }
});

module.exports = {
    deepSearchRoutesV2
};