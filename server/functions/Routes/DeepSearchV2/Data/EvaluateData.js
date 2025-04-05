const { webSearchRefinementPrompt } = require("../../../Utils/Constants/Prompts");
const { getLLMChatCompletionResponse } = require("../../../Utils/LLMFunctions/Completions");
const { collectData } = require("./CollectData");

/**
 * Evaluate collected data quality
 * @param {Array} collectedData - The collected data
 * @param {Object} strategyData - The search strategy
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Object} Evaluated data
 */
async function evaluateData(collectedData, strategyData, maxRetries = 1) {
    let retryCount = 0;
    let evaluatedData;

    while (retryCount < maxRetries) {
        try {
            const knowledgeContent = JSON.stringify(collectedData);

            const evaluationResponse = await getLLMChatCompletionResponse({
                messages: [
                    {
                        role: 'system',
                        content: webSearchRefinementPrompt({
                            KNOWLEDGE_CENTER: knowledgeContent,
                            STRATEGY: JSON.stringify(strategyData),
                        })
                    },
                ],
            });

            const rawEvalData = evaluationResponse.choices[0]?.message?.content;

            if (!rawEvalData) {
                throw new Error('Empty evaluation response');
            }

            evaluatedData = typeof rawEvalData === 'string' ? JSON.parse(rawEvalData) : rawEvalData;

            if (evaluatedData.is_sufficient) {
                break;
            }

            // If not sufficient, try to collect more data with refined query
            if (retryCount < maxRetries - 1 && evaluatedData.refinement_suggestions) {
                const additionalData = await collectData(
                    strategyData,
                    evaluatedData.refinement_suggestions
                );

                if (additionalData.length) {
                    // Merge new data with existing data
                    collectedData = [...collectedData, ...additionalData];
                }
            }

            retryCount++;
        } catch (error) {
            console.error('Error in evaluateData:', error.message);
            retryCount++;

            if (retryCount === maxRetries) {
                // Return best effort evaluation if all retries fail
                return {
                    filtered_data: collectedData,
                    is_sufficient: false,
                    reasoning: "Evaluation failed, returning collected data as-is"
                };
            }
        }
    }

    return evaluatedData || {
        filtered_data: collectedData,
        is_sufficient: false,
        reasoning: "No evaluation data available, returning collected data as-is"
    };
}


module.exports =  {
    evaluateData,
}