const { analyzeQuerySystemPrompt } = require("../../../Utils/Constants/Prompts");
const { getLLMChatCompletionResponse } = require("../../../Utils/LLMFunctions/Completions");

/**
 * Parse and analyze the user query
 * @param {string} query - The user's raw query
 * @returns {Object} Parsed query data
 */
async function parseQuery(query) {
    console.log('Parsing query:', query);

    const analyzedQueryResponse = await getLLMChatCompletionResponse({
        messages: [
            { role: 'system', content: analyzeQuerySystemPrompt },
            { role: 'user', content: query },
        ],
    });

    const rawContent = analyzedQueryResponse.choices[0]?.message?.content;

    if (!rawContent) {
        throw new Error('Failed to analyze query: Empty response');
    }

    try {
        return typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
    } catch (error) {
        console.error('JSON parsing error in parseQuery:', error);
        throw new Error('Failed to parse query analysis response');
    }
}


module.exports =  {
    parseQuery
}