const express = require('express');
const { getLLMChatCompletionResponse } = require('../../Utils/LLMFunctions/Completions');
const { searchWebAPI } = require('../../Utils/SearchFunctions/SearchWeb');
const {  finalStructuredOutputSystemPrompts, analyzeQuerySystemPrompt } = require('../../Utils/Constants/Prompts');
const { scrapeWebPage } = require('../../Utils/SearchFunctions/ScrapeWebPage');

const deepSearchRoutes = express.Router();

deepSearchRoutes.post('/query', async (req, res) => {
  const { query, user, requestID } = req.body;

  // Input validation
  if (!query || !user) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  try {
    // Step 1: Analyze the query to determine intent
    const analyzedQueryResponse = await getLLMChatCompletionResponse({
      messages: [
        { role: 'system', content: analyzeQuerySystemPrompt() },
        { role: 'user', content: query },
      ],
    });

    const analyzedData = JSON.parse(analyzedQueryResponse.choices[0].message.content);

    // Step 2: Process based on intent (both 'think' and 'deep_search' search the web)
    if (['think', 'deep_search'].includes(analyzedData.intent)) {
      // Perform a web search
      const searchResults = await searchWebAPI({
        query: analyzedData.distilledQuery ?? query,
        maxResults: 5,
      });

      // Step 3: Scrape content from search result URLs
      const scrapedContents = await Promise.all(
        searchResults.map(async (result) => {
          const url = result.link;
          const snippet = result.snippet;
          const content = await scrapeWebPage(url);
          return { sourceUrl: url, content: content ?? snippet };
        })
      );

      const searchResultsText = scrapedContents
        .map(({ sourceUrl, content }) => `Source: ${sourceUrl}\n${content}`)
        .join('\n\n');

      // Step 4: Generate final response with search results
      const finalResponse = await getLLMChatCompletionResponse({
        messages: [
          {
            role: 'system',
            content: finalStructuredOutputSystemPrompts({
              KNOWLEDGE_CENTER: searchResultsText,
              THOUGHT_PROCESS: analyzedData.thoughtProcess,
            }),
          },
          { role: 'user', content: query },
        ],
        model: 'gpt-4o',
        provider: 'openai',
      });

      return res.status(200).send(finalResponse.choices[0].message.content);
    } else {
      throw new Error('Invalid intent received from query analysis');
    }
  } catch (error) {
    console.error(`Error processing query ${requestID} for user ${user}:`, error);
    return res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = {
  deepSearchRoutes,
};