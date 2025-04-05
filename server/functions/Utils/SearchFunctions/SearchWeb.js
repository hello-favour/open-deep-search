// SearchFunctions/SearchWeb.js
const axios = require('axios');
const { finalConfigs } = require("../Configurations");

/**
 * Search the web using Google Custom Search API or API Pie
 * @param {Object} options - Search options
 * @param {string} options.query - Search query
 * @param {string} [options.searchType] - Type of search (for Google API)
 * @param {string} [options.filter] - Filter options (for Google API)
 * @param {string} [options.rights] - Rights filter (for Google API)
 * @param {string} [options.safe] - Safe search setting (for Google API)
 * @param {string} [options.geo="us"] - Country code for localized results (for API Pie)
 * @param {string} [options.lang="en"] - Language code for results (for API Pie)
 * @param {string} [options.timeRange=null] - Time range filter for search results (for API Pie)
 * @param {number} [options.maxResults=10] - Maximum number of results
 * @param {string} [options.apiProvider="google"] - API provider ("google" or "apipie")
 * @returns {Array} Search results
 */
async function searchWebAPI({
    query,
    searchType,
    filter,
    rights,
    safe,
    geo = "us",
    lang = "en",
    timeRange = null,
    maxResults = 10,
    apiProvider = "google",
}) {
    if (!query) {
        throw new Error("Search query is required");
    }

    try {
        const configs = finalConfigs();

        if (apiProvider === "apipie") {
            // API Pie search implementation
            const { PIE_API_KEY } = configs;
            
            if (!PIE_API_KEY) {
                throw new Error("API Pie key is missing");
            }
            
            // Determine safeSearch value for API Pie
            let safeSearchValue = -1; // Default moderate
            if (safe === "active" || safe === "high") {
                safeSearchValue = 1; // On
            } else if (safe === "off") {
                safeSearchValue = -2; // Off
            }
            
            const requestData = {
                query: query,
                provider: "google", 
                geo: geo,
                lang: lang,
                results: maxResults,
                safeSearch: safeSearchValue,
                timeRange: timeRange
            };

            console.log("API Pie request data:", requestData);
            
            const response = await axios.post('https://apipie.ai/v1/search', requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': PIE_API_KEY
                },
                timeout: 10000
            });

            console.log("API Pie response:", response.data);
            
            // Convert API Pie response format to match Google's format
            if (response.data && response.data.results) {
                return Object.values(response.data.results).map(item => ({
                    link: item.url,
                    title: item.title,
                    snippet: item.description
                }));
            }
            
            return [];
        } else {
            // Original Google Custom Search implementation
            const {
                GOOGLE_CUSTOM_SEARCH_ENGINE_ID,
                GOOGLE_CUSTOM_SEARCH_KEY
            } = configs;

            if (!GOOGLE_CUSTOM_SEARCH_ENGINE_ID || !GOOGLE_CUSTOM_SEARCH_KEY) {
                throw new Error("Google API credentials are missing");
            }

            const encodedQuery = encodeURIComponent(query);
            
            // Build URL with query parameters
            const params = new URLSearchParams({
                q: query,
                cx: GOOGLE_CUSTOM_SEARCH_ENGINE_ID,
                key: GOOGLE_CUSTOM_SEARCH_KEY
            });
            
            if (searchType) params.append('searchType', searchType);
            if (filter) params.append('filter', filter);
            if (rights) params.append('rights', rights);
            if (safe) params.append('safe', safe);
            if (maxResults) params.append('num', maxResults.toString());
            
            const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;

            const response = await axios.get(url, {
                timeout: 10000
            });

            return response.data?.items || [];
        }
    } catch (error) {
        console.error(`Error in searchWebAPI (${apiProvider}):`, error.message || error);
        return [];
    }
}

module.exports = {
    searchWebAPI
};