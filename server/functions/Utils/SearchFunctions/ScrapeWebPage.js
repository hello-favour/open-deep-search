
// SearchFunctions/ScrapeWebPage.js
const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Scrape content from a web page
 * @param {string} url - URL to scrape
 * @param {number} [maxLength=2000] - Maximum content length
 * @returns {string|null} Scraped content or null if failed
 */
async function scrapeWebPage(url, maxLength = 2000) {
    try {
        const response = await axios.get(url, {
            headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5"
            },
            timeout: 10000,
            maxContentLength: 1024 * 1024 * 5 // 5MB max to prevent huge downloads
        });

        const $ = cheerio.load(response.data);
        
        // Remove script, style, and other non-content elements
        $('script, style, iframe, noscript, head, nav, footer').remove();
        
        // Extract meaningful content
        const paragraphs = $("p, h1, h2, h3, h4, h5, h6, li")
            .map((i, el) => {
                const text = $(el).text().trim();
                return text.length > 0 ? text : null;
            })
            .get()
            .filter(Boolean) // Remove empty strings
            .join("\n");
            
        // If no paragraphs found, try to get any text content
        const content = paragraphs.length > 0 
            ? paragraphs 
            : $('body').text().trim().replace(/\s+/g, ' ');
            
        // Limit content length
        return content.slice(0, maxLength);
    } catch (error) {
        console.error(`Failed to scrape ${url}:`, error.message);
        return null;
    }
}

module.exports = {
    scrapeWebPage
};