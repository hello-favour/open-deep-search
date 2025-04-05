const { webSearchRefinementPrompt } = require("../../../Utils/Constants/Prompts");
const { getLLMChatCompletionResponse } = require("../../../Utils/LLMFunctions/Completions");
const { scrapeWebPage } = require("../../../Utils/SearchFunctions/ScrapeWebPage");
const { searchWebAPI } = require("../../../Utils/SearchFunctions/SearchWeb");

/**
 * Collect data based on strategy and query
 * @param {Object} strategyData - The search strategy
 * @param {string} distilledQuery - The distilled query for search
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Array} Collected data
 */
async function collectData(strategyData, distilledQuery, maxRetries = 1) {
    let retryCount = 0;
    let collectedData = [];

    while (retryCount < maxRetries && collectedData.length < strategyData.min_sources) {
        try {
            // Perform web search
            const searchResults = await searchWebAPI({
                query: distilledQuery,
                maxResults: strategyData?.max_sources || 5,
            });

            if (!searchResults.length) {
                throw new Error('No search results found');
            }

            // Scrape content from search result URLs in parallel
            const scrapingPromises = searchResults.map(async (result) => {
                const { link: url, snippet } = result;
                try {
                    const content = await scrapeWebPage(url);

                    return {
                        sourceUrl: url,
                        content: content || snippet
                    };
                } catch (err) {
                    console.warn(`Scraping error for ${url}:`, err.message);
                    return {
                        sourceUrl: url,
                        content: snippet
                    };
                }
            });

            const scrapedContents = await Promise.all(scrapingPromises);

            collectedData = scrapedContents.filter(item => item.content?.trim());

            // Validate data sufficiency
            if (collectedData.length >= strategyData.min_sources) {
                break;
            }

            // If not sufficient, try refining the query
            if (retryCount < maxRetries - 1) {
                const searchResultsText = collectedData
                    .map(({ sourceUrl, content }) => `Source: ${sourceUrl}\n${content}`)
                    .join('\n\n');

                const validationResponse = await getLLMChatCompletionResponse({
                    messages: [
                        {
                            role: 'system',
                            content: webSearchRefinementPrompt({
                                KNOWLEDGE_CENTER: searchResultsText,
                                STRATEGY: JSON.stringify(strategyData),
                            })
                        },
                    ],
                });

                const validationRawData = validationResponse.choices[0]?.message?.content;

                if (validationRawData) {
                    const validationData = typeof validationRawData === 'string'
                        ? JSON.parse(validationRawData)
                        : validationRawData;

                    if (validationData.is_sufficient) {
                        break;
                    }

                    distilledQuery = validationData.refined_query || distilledQuery;
                }
            }

            retryCount++;
        } catch (error) {
            console.error('Error in collectData:', error.message);
            retryCount++;
        }
    }

    return collectedData;
}


module.exports = {
    collectData,
}