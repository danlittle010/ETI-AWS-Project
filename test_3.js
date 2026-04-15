const http = require('https');
const fs = require('fs');

const options = {
	method: 'GET',
	hostname: 'skyscanner-flights-travel-api.p.rapidapi.com',
	port: null,
	path: '/flights/searchFlights?countryCode=US&adults=2&childrens=0&originSkyId=TTN&returnDate=2026-06-12&infants=0&cabinClass=economy&market=US&currency=USD&originEntityId=TTN&date=2026-06-02&destinationEntityId=MCO&destinationSkyId=MCO',
	headers: {
		'x-rapidapi-key': 'f2accd269cmsh088866a4174f207p131af9jsn093ac8cbdd37',
		'x-rapidapi-host': 'skyscanner-flights-travel-api.p.rapidapi.com',
		'Content-Type': 'application/json'
	}
};

const req = http.request(options, function (res) {
	const chunks = [];

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

req.end();