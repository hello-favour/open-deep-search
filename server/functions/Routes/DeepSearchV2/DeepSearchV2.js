const express = require('express');
const { parseQuery } = require('./Data/ParseQuery');
const { formSearchStrategy } = require('./Data/DataStretegy');
const { collectData } = require('./Data/CollectData');
const { evaluateData } = require('./Data/EvaluateData');
const { synthesizeResults } = require('./Data/SynthesizeResults');

const deepSearchRoutesV2 = express.Router();

deepSearchRoutesV2.post('/query', async (req, res) => {
    const { query, user, requestID } = req.body;


    if (!query) {
        return res.status(400).send({ error: 'Missing required fields' });
    }

    try {
        // Step 1: Query Parsing
        const analyzedData = await parseQuery(query);

        console.log('Analyzed Data:', analyzedData);

        // Step 2: Search Strategy
        const strategyData = await formSearchStrategy(analyzedData);

        console.log('Search Strategy Data:', strategyData);

        // Step 3: Data Collection
        const collectedData = await collectData(strategyData, analyzedData.distilled_query);

        console.log('Collected Data:', collectedData);

        if (!collectedData.length) {
            throw new Error('Failed to collect sufficient data');
        }

        // Step 4: Data Evaluation
        const evaluatedData = await evaluateData(collectedData, strategyData);

        console.log('Evaluated Data:', evaluatedData);

        if (!evaluatedData) {
            throw new Error('Failed to evaluate data');
        }

        // // Step 5: Synthesis
        const finalResponse = await synthesizeResults(evaluatedData);

        // Return the final response
        return res.status(200).send(finalResponse);
    } catch (error) {
        console.error(`Error processing query for user ${user}:`, error.message || error);
        return res.status(500).send({ error: 'Internal server error' });
    }
});


module.exports = {
    deepSearchRoutesV2
};