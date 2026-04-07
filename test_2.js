const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

// Apply stealth plugin to bypass bot detection
puppeteer.use(StealthPlugin());

// Rotating user agents for variety
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

// Proxy list - Add your proxies here (format: 'http://ip:port')
const proxyList = [];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getRandomProxy() {
  if (proxyList.length === 0) return null;
  return proxyList[Math.floor(Math.random() * proxyList.length)];
}

// Exponential backoff for retries
async function retryWithBackoff(fn, maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const waitTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
      console.log(`Attempt ${i + 1} failed. Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw lastError;
}

let departday = '260602';  // Replace with your desired departure date
let returnday = '260606';  // Replace with your desired return date
let departure = 'ttn';  // Replace with your departure airport code
let destination = 'mco';  // Replace with your destination airport code
let cabinclass = 'economy';  // Replace with your desired cabin class
let adults = 2;  // Replace with the number of adults
let children = 0;  // Replace with the number of children

if (children === 0) {
  let children = '';
}

async function scrapeWebsite() {
  try {
    const url = `https://www.skyscanner.com/transport/flights/${departure}/${destination}/${departday}/${returnday}/?adultsv2=${adults}&cabinclass=${cabinclass}&childrenv2=${children}&ref=home&rtn=1&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false`;  // Replace with your target URL
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
    const url = 'https://www.skyscanner.com/transport/flights/ttn/mco/260602/260606/?adultsv2=2&cabinclass=economy&childrenv2=&ref=home&rtn=1&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false';  // Replace with your target URL
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    const page = await browser.newPage();

    // Set realistic viewport and user agent
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Set realistic headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Referer': 'https://www.google.com/',
    });

    // Add randomized delay to appear human-like
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;
    await new Promise(resolve => setTimeout(resolve, randomDelay));

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });  // Wait for page to load fully

    // Add another delay before scraping
    await new Promise(resolve => setTimeout(resolve, 2000));

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