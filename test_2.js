const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeWebsite() {
  try {
    const url = 'https://www.espn.com';  // Replace with your target URL
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })  // For testing; remove in production
    });

    const $ = cheerio.load(response.data);
    
    const headings = [];
    const links = [];
    const articles = [];

    // Extract all headings
    $('h1, h2, h3').each((i, elem) => {
      headings.push($(elem).text().trim());
    });

    // Extract links
    $('a').each((i, elem) => {
      const link = $(elem).attr('href');
      const text = $(elem).text().trim();
      if (link) {
        links.push({ text, link });
      }
    });

    // Store article data
    $('div.article').each((i, elem) => {
      articles.push({
        title: $(elem).find('h2').text().trim(),
        content: $(elem).find('p').text().trim()
      });
    });

    return { headings, links, articles, success: true };

  } catch (error) {
    console.error('Error scraping:', error.message);
    return { error: error.message, success: false };
  }
}

async function saveResults() {
  const results = {
    timestamp: new Date().toISOString(),
    staticScrape: await scrapeWebsite()
  };

  const filePath = path.join(__dirname, 'testing.JSON');
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  console.log('Results saved to testing.JSON');
}

saveResults();

async function scrapeDynamicWebsite() {
  try {
    const url = 'https://www.espn.com';  // Replace with your target URL
    const browser = await puppeteer.launch({ headless: true });  // Set to false to see browser
    const page = await browser.newPage();

    // Set user agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    await page.goto(url, { waitUntil: 'networkidle2' });  // Wait for page to load fully

    // Wait for specific elements if needed (e.g., dynamic content)
    // await page.waitForSelector('div.dynamic-content');

    // Extract data using page.evaluate (runs in browser context)
    const data = await page.evaluate(() => {
      const headings = [];
      document.querySelectorAll('h1, h2, h3').forEach(elem => {
        headings.push(elem.textContent.trim());
      });

      const links = [];
      document.querySelectorAll('a').forEach(elem => {
        const href = elem.getAttribute('href');
        const text = elem.textContent.trim();
        if (href) {
          links.push({ text, href });
        }
      });

      const articles = [];
      document.querySelectorAll('div.article').forEach(elem => {
        const title = elem.querySelector('h2')?.textContent.trim() || '';
        const content = elem.querySelector('p')?.textContent.trim() || '';
        articles.push({ title, content });
      });

      return { headings, links, articles };
    });

    console.log('Dynamic scraped headings:', data.headings);
    console.log('Dynamic scraped links:', data.links);
    console.log('Dynamic scraped data:', data.articles);

    await browser.close();

  } catch (error) {
    console.error('Error in dynamic scraping:', error.message);
  }
}

// Uncomment to run dynamic scraper instead
 scrapeDynamicWebsite();