const https = require('https');
const fs = require('fs');
const readline = require('readline');

function buildPath({ departure, arrival, departureDate, returnDate, adults = 1, children = 0, infants = 0, cabinClass = 'economy' }) {
	return `/flights/searchFlights?${new URLSearchParams({
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
	}).toString()}`;
}

function searchFlights(params) {
	return new Promise((resolve, reject) => {
		const options = {
			method: 'GET',
			hostname: 'skyscanner-flights-travel-api.p.rapidapi.com',
			port: null,
			path: buildPath(params),
			headers: {
				'x-rapidapi-key': 'f2accd269cmsh088866a4174f207p131af9jsn093ac8cbdd37',
				'x-rapidapi-host': 'skyscanner-flights-travel-api.p.rapidapi.com',
				'Content-Type': 'application/json'
			}
		};

		const req = https.request(options, (res) => {
			const chunks = [];

			if (res.statusCode && res.statusCode !== 200) {
				console.error('HTTP error:', res.statusCode);
			}

			res.on('data', (chunk) => chunks.push(chunk));
			res.on('end', () => {
				const body = Buffer.concat(chunks).toString();
				let json;

				try {
					json = JSON.parse(body);
				} catch (error) {
					return reject(new Error('Failed to parse JSON response'));
				}

				fs.writeFileSync('flight-results.json', JSON.stringify(json, null, 2), 'utf8');
				resolve(json);
			});
		});

		req.on('error', (error) => reject(error));
		req.end();
	});
}

async function runInteractive() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	function askQuestion(query) {
		return new Promise((resolve) => rl.question(query, resolve));
	}

	const departure = (await askQuestion('Departure airport code: ')).trim().toUpperCase();
	const arrival = (await askQuestion('Arrival airport code: ')).trim().toUpperCase();
	const departureDate = (await askQuestion('Departure date (YYYY-MM-DD): ')).trim();
	const returnDate = (await askQuestion('Return date (YYYY-MM-DD): ')).trim();
	const adults = parseInt(await askQuestion('Number of adults: '), 10) || 1;
	const children = parseInt(await askQuestion('Number of children: '), 10) || 0;
	const infants = parseInt(await askQuestion('Number of infants: '), 10) || 0;
	const cabinClass = (await askQuestion('Cabin class (economy/business/first): ')).trim().toLowerCase() || 'economy';

	rl.close();

	try {
		await searchFlights({ departure, arrival, departureDate, returnDate, adults, children, infants, cabinClass });
		console.log('Saved results to flight-results.json');
	} catch (error) {
		console.error('Failed to save JSON results:', error.message);
	}
}

if (require.main === module) {
	runInteractive();
}

module.exports = { searchFlights };