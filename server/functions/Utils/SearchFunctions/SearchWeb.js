const puppeteer = require('puppeteer');

async function scrapeWebPage(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });

    const content = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, h1, h2, h3');
      return Array.from(elements)
        .map((el) => el.innerText.trim())
        .join('\n');
    });

    await browser.close();

    return content.slice(0, 2000); // Limit to 2000 characters
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error.message);
    return null;
  }
}

module.exports = {
  scrapeWebPage,
};