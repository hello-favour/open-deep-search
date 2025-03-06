
const axios = require("axios");
const cheerio = require("cheerio");

export async function scrapeWebPage(url) {
    try {
        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 10000,
        });
        const $ = cheerio.load(response.data);

        // Extract meaningful content (customize based on your needs)
        const content = $("p, h1, h2, h3")
            .map((i, el) => $(el).text().trim())
            .get()
            .join("\n")
            .slice(0, 2000); // Limit to 2000 characters to avoid overwhelming LLM

        return content || "";
    } catch (error) {
        console.error(`Failed to scrape ${url}:`, error.message);
        return "Scraping failed";
    }
}