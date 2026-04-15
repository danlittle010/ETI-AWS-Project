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

// Helper: random delay between min and max ms
function humanDelay(min, max) {
  const ms = Math.floor(Math.random() * (max - min)) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
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
    const browser = await puppeteer.launch({
      headless: false, // Use headed mode — hardest to detect
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--window-size=1366,768',
      ],
      defaultViewport: null, // Use window size instead of viewport
    });

    const page = await browser.newPage();

    // Mask webdriver flag at the JS level
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });

    await page.setUserAgent(getRandomUserAgent());
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });

    // Step 1: Land on homepage first like a real user
    await page.goto('https://www.skyscanner.com', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Step 2: Simulate human mouse movement
    await humanDelay(2000, 4000);
    await page.mouse.move(
      300 + Math.random() * 400,
      200 + Math.random() * 300,
      { steps: 20 }
    );
    await humanDelay(500, 1500);

    // Step 3: Now navigate to the search URL
    const url = `https://www.skyscanner.com/transport/flights/${departure}/${destination}/${departday}/${returnday}/?adultsv2=${adults}&cabinclass=${cabinclass}&childrenv2=${children}&ref=home&rtn=1&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false`;

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

    // Step 4: Wait for flight results to actually render
    await humanDelay(4000, 7000);

    // Try waiting for the results container (inspect Skyscanner's actual class names)
    try {
      await page.waitForSelector('[class*="FlightsResults"], [data-testid*="flight"]', {
        timeout: 30000,
      });
    } catch {
      console.log('Results selector timed out — dumping HTML for inspection');
      const html = await page.content();
      fs.writeFileSync('debug.html', html);
      await browser.close();
      return;
    }

    const data = await page.evaluate(() => {
      // --- Adjust these selectors after inspecting debug.html ---
      const prices = [];
      document.querySelectorAll('[class*="Price"], [data-testid*="price"]').forEach(el => {
        prices.push(el.textContent.trim());
      });

      const airlines = [];
      document.querySelectorAll('[class*="Carrier"], [data-testid*="carrier"]').forEach(el => {
        airlines.push(el.textContent.trim());
      });

      return { prices, airlines };
    });

    console.log('Prices found:', data.prices);
    console.log('Airlines found:', data.airlines);

    await browser.close();

  } catch (error) {
    console.error('Error in dynamic scraping:', error.message);
  }
}

// Uncomment to run dynamic scraper instead
scrapeDynamicWebsite();