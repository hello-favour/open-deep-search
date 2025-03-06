const express = require("express");
const { getLLMChatCompletionResponse } = require("../Utils/LLMFunctions/Completions");
const { searchWebAPI } = require("../Utils/SearchFunctions/SearchWeb");
const { analyzeQuerySystemPrompts, finalStructuredOutputSystemPrompts } = require("../Utils/Constants/Prompts");
const { scrapeWebPage } = require("../Utils/SearchFunctions/ScrapeWebPage");

const deepSearchRoutes = express.Router();

deepSearchRoutes.post("/query", async (req, res) => {
    const { query, user, requestID } = req.body;

    console.log(`Processing query ${requestID} for user ${user}: ${query}`);

    // Input validation
    if (!query || !user) {
        return res.status(400).send({ error: "Missing required fields" });
    }


    const analyzeQuerySystemPrompt = analyzeQuerySystemPrompts();
    const finalStructuredOutputSystemPrompt = finalStructuredOutputSystemPrompts();

    try {
        // Step 1: Analyze the query to determine intent
        const analyzedQueryResponse = await getLLMChatCompletionResponse({
            messages: [
                { role: "system", content: analyzeQuerySystemPrompt },
                { role: "user", content: query }
            ],
            model: "gpt-4o-mini",
            provider: "openai"
        });

        const analyzedData = JSON.parse(analyzedQueryResponse.choices[0].message.content);

        // Step 2: Process based on intent
        let finalResponse;

        if (analyzedData.intent === "normal" || analyzedData.intent === "think") {
            // Directly generate response for "normal" or "think" intents
            finalResponse = await getLLMChatCompletionResponse({
                messages: [
                    { role: "system", content: finalStructuredOutputSystemPrompt },
                    { role: "user", content: JSON.stringify(analyzedData) }
                ],
                model: "gpt-4o",
                provider: "openai"
            });
        } else if (analyzedData.intent === "deep_search") {
            // Perform a web search for "deep_search" intent
            const searchResults = await searchWebAPI({
                query: analyzedData.distiledQuery,
                searchType: "web",
                maxResults: 3,
            });


            // Step 3: Scrape content from search result URLs using Cheerio
            const scrapedContents = await Promise.all(
                searchResults.map(async (result) => {
                    const url = result.link; // Google Custom Search returns "link" field
                    const content = await scrapeWebPage(url);
                    return { url, content };
                })
            );

            // Combine scraped content into a single string for the LLM
            const searchResultsText = scrapedContents
                .map(({ url, content }) => `Source: ${url}\n${content}`)
                .join("\n\n");

            // Generate final response with search results
            finalResponse = await getLLMChatCompletionResponse({
                messages: [
                    { role: "system", content: finalStructuredOutputSystemPrompt },
                    { role: "user", content: JSON.stringify({ ...analyzedData, searchResults: searchResultsText }) }
                ],
                model: "gpt-4o",
                provider: "openai"
            });
        } else {
            throw new Error("Invalid intent received from query analysis");
        }

        // Parse and send the final structured response
        const finalData = JSON.parse(finalResponse.choices[0].message.content);
        return res.status(200).send(finalData);
    } catch (error) {
        console.error(`Error processing query ${requestID} for user ${user}:`, error);

        return res.status(500).send({ error: "Internal server error" });
    }
});

module.exports = {
    deepSearchRoutes,
};