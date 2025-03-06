const axios = require('axios');
const { finalConfigs } = require("../Configurations");

async function searchWebAPI({
    query,
    searchType,
    filter,
    rights,
    safe,
    maxResults = 10,
    apiProvider = "google",
}) {

    try {
        const {
            GOOGLE_CUSTOM_SEARCH_ENGINE_ID,
            GOOGLE_CUSTOM_SEARCH_KEY
        } = finalConfigs();

        if (!query) {
            throw new Error("Search query is required.");
        }
        if (!GOOGLE_CUSTOM_SEARCH_ENGINE_ID || !GOOGLE_CUSTOM_SEARCH_KEY) {
            throw new Error("Google API credentials are missing.");
        }

        console.log(GOOGLE_CUSTOM_SEARCH_ENGINE_ID, GOOGLE_CUSTOM_SEARCH_KEY, "searchWebAPI");

        const encodedQuery = encodeURIComponent(query);


        let url;
        if (apiProvider === "google") {
            url = `https://www.googleapis.com/customsearch/v1?q=${encodedQuery}&cx=${GOOGLE_CUSTOM_SEARCH_ENGINE_ID}&key=${GOOGLE_CUSTOM_SEARCH_KEY}`;

            // Add search-specific parameters
            if (searchType) url += `&searchType=${searchType}`;
            if (filter) url += `&filter=${filter}`;
            if (rights) url += `&rights=${rights}`;
            if (safe) url += `&safe=${safe}`;
            if (maxResults) url += `&num=${maxResults}`;
        } else {
            throw new Error(`Unsupported API provider: ${apiProvider}`);
        }

        const response = await axios.get(url);

        if (response.data && response.data.items) {
            return response.data.items;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error in searchAPI:", error.message || error);
        return [];
    }
}


module.exports = {
    searchWebAPI,
}