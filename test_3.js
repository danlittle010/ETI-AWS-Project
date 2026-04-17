const http = require('https');
const fs = require('fs');

const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function askQuestion(query) {
	return new Promise((resolve) => rl.question(query, resolve));
}

(async () => {
	const departure = (await askQuestion('Departure airport code: ')).trim().toUpperCase();
	const arrival = (await askQuestion('Arrival airport code: ')).trim().toUpperCase();
	const departureDate = (await askQuestion('Departure date (YYYY-MM-DD): ')).trim();
	const returnDate = (await askQuestion('Return date (YYYY-MM-DD): ')).trim();
	const adults = parseInt(await askQuestion('Number of adults: '), 10) || 1;
	const children = parseInt(await askQuestion('Number of children: '), 10) || 0;
	const infants = parseInt(await askQuestion('Number of infants: '), 10) || 0;
	const cabinClass = (await askQuestion('Cabin class (economy/business/first): ')).trim().toLowerCase() || 'economy';

	rl.close();

	const options = {
		method: 'GET',
		hostname: 'skyscanner-flights-travel-api.p.rapidapi.com',
		port: null,
		path: `/flights/searchFlights?countryCode=US&adults=${adults}&childrens=${children}&originSkyId=${departure}&returnDate=${returnDate}&infants=${infants}&cabinClass=${cabinClass}&market=US&currency=USD&originEntityId=${departure}&date=${departureDate}&destinationEntityId=${arrival}&destinationSkyId=${arrival}`,
		headers: {
			'x-rapidapi-key': 'f2accd269cmsh088866a4174f207p131af9jsn093ac8cbdd37',
			'x-rapidapi-host': 'skyscanner-flights-travel-api.p.rapidapi.com',
			'Content-Type': 'application/json'
		}
	};

	const req = http.request(options, function (res) {
		const chunks = [];

		if (res.statusCode && res.statusCode !== 200) {
			console.error('HTTP error:', res.statusCode);
		}

		res.on('data', function (chunk) {
			chunks.push(chunk);
		});

		res.on('end', function () {
			const body = Buffer.concat(chunks).toString();
			console.log(body);

			try {
				const json = JSON.parse(body);
				fs.writeFileSync('flight-results.json', JSON.stringify(json, null, 2), 'utf8');
				console.log('Saved results to flight-results.json');
			} catch (error) {
				console.error('Failed to save JSON results:', error.message);
			}
		});
	});

	req.on('error', function (error) {
		console.error('Request failed:', error.message);
	});

	req.end();
})();