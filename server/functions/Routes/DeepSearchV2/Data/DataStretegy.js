const { searchStrategySystemPrompt } = require("../../../Utils/Constants/Prompts");
const { getLLMChatCompletionResponse } = require("../../../Utils/LLMFunctions/Completions");

/**
 * Formulate search strategy based on analyzed query
 * @param {Object} analyzedData - The analyzed query data
 * @returns {Object} Search strategy data
 */
async function formSearchStrategy(analyzedData) {
    const searchStrategyResponse = await getLLMChatCompletionResponse({
        messages: [
            { role: 'system', content: searchStrategySystemPrompt },
            { role: 'user', content: JSON.stringify(analyzedData) },
        ],
    });

    const rawContent = searchStrategyResponse.choices[0]?.message?.content;

    if (!rawContent) {
        throw new Error('Failed to formulate search strategy: Empty response');
    }

    try {
        const parsedContent = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
        return typeof parsedContent === 'string' ? JSON.parse(parsedContent) : parsedContent;
    } catch (error) {
        console.error('JSON parsing error in formSearchStrategy:', error);
        throw new Error('Failed to parse search strategy response');
    }
}


module.exports =  {
    formSearchStrategy
}
