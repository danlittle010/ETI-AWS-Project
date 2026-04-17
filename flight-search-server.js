const https = require('https');
const fs = require('fs');

function searchFlights({
  departure,
  arrival,
  departureDate,
  returnDate,
  adults = 1,
  children = 0,
  infants = 0,
  cabinClass = 'economy'
}) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      countryCode: 'US',
      adults: String(adults),
      childrens: String(children),
      originSkyId: departure,
      returnDate,
      infants: String(infants),
      cabinClass,
      market: 'US',
      currency: 'USD',
      originEntityId: departure,
      date: departureDate,
      destinationEntityId: arrival,
      destinationSkyId: arrival
    });

    const options = {
      method: 'GET',
      hostname: 'skyscanner-flights-travel-api.p.rapidapi.com',
      port: null,
      path: `/flights/searchFlights?${params.toString()}`,
      headers: {
        'x-rapidapi-key': 'f2accd269cmsh088866a4174f207p131af9jsn093ac8cbdd37',
        'x-rapidapi-host': 'skyscanner-flights-travel-api.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();

        let json;
        try {
          json = JSON.parse(body);
        } catch (parseError) {
          return reject(new Error('Invalid JSON response from flight API'));
        }

        fs.writeFile('flight-results.json', JSON.stringify(json, null, 2), 'utf8', (err) => {
          if (err) {
            return reject(err);
          }
          resolve(json);
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

module.exports = { searchFlights };
