const { finalConfigs } = require("../Configurations");
const { webSearchSearchPrompt } = require("../Constants/Prompts");
const { scrapeWebPage } = require("../SearchFunctions/ScrapeWebPage");
const { getLLMChatCompletionResponse } = require("./Completions");



// Step 3: Data Collection with Gemini Grounding
async function collectData(strategyData, distilledQuery, maxRetries = 3) {
    const { genAI } = finalConfigs();

    const geminiModel = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        tools: [{
            googleSearchRetrieval: {
                dynamic_retrieval_config: {
                    mode: "MODE_DYNAMIC",
                    dynamic_threshold: 0.3,
                },
            }
        }],
    });

    let retryCount = 0;
    let collectedData = [];

    while (retryCount < maxRetries) {
        try {
            const result = await geminiModel.generateContent(distilledQuery);
            const candidate = result.response.candidates[0];
            const groundingMetadata = candidate.groundingMetadata;

            if (!groundingMetadata || !groundingMetadata.groundingChunks) {
                throw new Error('Grounding failed: No metadata returned');
            }

            // Extract and scrape grounded sources
            collectedData = await Promise.all(
                groundingMetadata.groundingChunks
                    .filter(chunk => chunk.web && chunk.web.uri)
                    .slice(0, strategyData.max_sources)
                    .map(async chunk => {
                        const url = chunk.web.uri;
                        const content = await scrapeWebPage(url) || 'No content scraped';
                        return { sourceUrl: url, content };
                    })
            );

            // Validate sufficiency (using R1 for simplicity)
            const validationResponse = await getLLMChatCompletionResponse({
                messages: [
                    { role: 'system', content: webSearchSearchPrompt },
                    { role: 'user', content: JSON.stringify({ strategy: strategyData, collected: collectedData }) },
                ],
                model: 'deepseek-r1',
                provider: 'OpenRouter',
            });
            const validationData = JSON.parse(validationResponse.choices[0].message.content);

            if (validationData.is_sufficient) break;

            distilledQuery = validationData.refined_query || distilledQuery;
            retryCount++;
        } catch (error) {
            console.error('Error in collectData:', error.message);
            retryCount++;
            if (retryCount === maxRetries) {
                console.error('Max retries reached in collectData');
                break;
            }
        }
    }

    return collectedData.length >= strategyData.min_sources ? collectedData : [];
}

// Step 4: Data Evaluation and Reasoning (GPT-4)
async function evaluateData(collectedData, strategyData, maxRetries = 3) {
    let retryCount = 0;
    let evaluatedData;

    while (retryCount < maxRetries) {
        const evaluationResponse = await getLLMChatCompletionResponse({
            messages: [
                { role: 'system', content: webSearchRefinementPrompt },
                { role: 'user', content: JSON.stringify({ collected: collectedData, strategy: strategyData }) },
            ],
            model: 'gpt-4o',
            provider: 'openai',
        });

        evaluatedData = JSON.parse(evaluationResponse.choices[0].message.content);

        if (evaluatedData.is_sufficient) break;

        collectedData = await collectData(strategyData, evaluatedData.refinement_suggestions || strategyData.distilled_query);
        retryCount++;
    }

    return evaluatedData;
}


module.exports = {
    collectData,
    evaluateData,
};