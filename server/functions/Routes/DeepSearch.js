const express = require("express");
const { getLLMChatCompletionResponse } = require("../Utils/LLMFunctions/Completions");
const { searchWebAPI } = require("../Utils/SearchFunctions/SearchWeb");
const { analyzeQuerySystemPrompts, finalStructuredOutputSystemPrompts } = require("../Utils/Constants/Prompts");
const { scrapeWebPage } = require("../Utils/SearchFunctions/ScrapeWebPage");

const deepSearchRoutes = express.Router();

deepSearchRoutes.post("/query", async (req, res) => {
    const { query, user, requestID } = req.body;

    // Input validation
    if (!query || !user) {
        return res.status(400).send({ error: "Missing required fields" });
    }


    const analyzeQuerySystemPrompt = analyzeQuerySystemPrompts();

    try {
        // Step 1: Analyze the query to determine intent
        const analyzedQueryResponse = await getLLMChatCompletionResponse({
            messages: [
                { role: "system", content: analyzeQuerySystemPrompt },
                { role: "user", content: query }
            ],
        });


        const analyzedData = JSON.parse(analyzedQueryResponse.choices[0].message.content);


        // Step 2: Process based on intent
        let finalResponse;

        if (analyzedData.intent === "normal") {

            finalResponse = await getLLMChatCompletionResponse({
                messages: [
                    { role: "system", content: finalStructuredOutputSystemPrompts({
                        KNOWLEDGE_CENTER: '',
                        THOUGHT_PROCESS: analyzedData.thoughtProcess,
                    }) },
                    { role: "user", content: query }
                ],
                model: "gpt-4o",
                provider: "openai"
            });
        } else if (analyzedData.intent === "deep_search") {
            // Perform a web search for "deep_search" intent
            const searchResults = await searchWebAPI({
                query: analyzedData?.distiledQuery ?? query,
                maxResults: 5,
            });


            // Step 3: Scrape content from search result URLs using Cheerio
            const scrapedContents = await Promise.all(
                searchResults.map(async (result) => {
                    const url = result.link;
                    const snippet = result.snippet;

                    const content = await scrapeWebPage(url);


                    return { sourceUrl: url, content: content ?? snippet };
                })
            );

            const searchResultsText = scrapedContents
                .map(({ url, content }) => `Source: ${url}\n${content}`)
                .join("\n\n");


            // Generate final response with search results
            finalResponse = await getLLMChatCompletionResponse({
                messages: [
                    {
                        role: "system", content: finalStructuredOutputSystemPrompts({
                            KNOWLEDGE_CENTER: searchResultsText,
                            THOUGHT_PROCESS: analyzedData.thoughtProcess,
                        })
                    },
                    { role: "user", content: query }
                ],
                model: "gpt-4o",
                provider: "openai"
            });
        } else {
            throw new Error("Invalid intent received from query analysis");
        }

        return res.status(200).send(finalResponse.choices[0].message.content);
    } catch (error) {
        console.error(`Error processing query ${requestID} for user ${user}:`, error);

        return res.status(500).send({ error: "Internal server error" });
    }
});

module.exports = {
    deepSearchRoutes,
};