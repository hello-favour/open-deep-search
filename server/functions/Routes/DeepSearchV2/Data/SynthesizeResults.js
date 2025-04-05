const { getLLMChatCompletionResponse } = require("../../../Utils/LLMFunctions/Completions");

/**
 * Synthesize final results from evaluated data
 * @param {Object} evaluatedData - The evaluated data
 * @returns {Object} Final synthesis
 */
async function synthesizeResults(evaluatedData) {
    try {
        const synthesisResponse = await getLLMChatCompletionResponse({
            messages: [
                { role: 'system', content: synthesisSystemPrompt },
                { role: 'user', content: JSON.stringify(evaluatedData) },
            ],
        });

        const rawSynthesis = synthesisResponse.choices[0]?.message?.content;

        if (!rawSynthesis) {
            throw new Error('Empty synthesis response');
        }

        const finalData = typeof rawSynthesis === 'string' ? JSON.parse(rawSynthesis) : rawSynthesis;
        return finalData;
    } catch (error) {
        console.error('Error in synthesizeResults:', error.message);
        // Return a fallback response if synthesis fails
        return {
            response: "Unable to synthesize results due to an error",
            error: error.message
        };
    }
}

module.exports =  {
    synthesizeResults
}