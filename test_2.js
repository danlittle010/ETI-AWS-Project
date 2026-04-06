const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://example.com')
  .then(response => {
    const $ = cheerio.load(response.data);
    $('.target-class').each((i, elem) => {
      console.log($(elem).text());  // Process/store data
    });
  });