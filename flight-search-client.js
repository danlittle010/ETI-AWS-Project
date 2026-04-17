document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('flightSearchForm');
  const output = document.getElementById('flightResults');

  if (!form || !output) return;

  function renderResults(json) {
    if (!json || typeof json !== 'object') {
      output.innerHTML = '<div class="alert alert-warning">No response data.</div>';
      return;
    }

    if (json.error) {
      output.innerHTML = `<div class="alert alert-danger">Error: ${json.error}</div>`;
      return;
    }

    const items = json.itineraries || [];
    if (!Array.isArray(items) || items.length === 0) {
      output.innerHTML = '<div class="alert alert-info">No flights found for those search terms.</div>';
      return;
    }

    let html = '<div class="row">';
    items.forEach((itinerary, index) => {
      const price = itinerary.price || itinerary.minPrice || 'N/A';
      const legs = itinerary.legs || [];
      html += `
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Flight ${index + 1}</h5>
              <p class="card-text"><strong>Price:</strong> ${price}</p>
              <p class="card-text"><strong>Legs:</strong> ${legs.length}</p>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    output.innerHTML = html;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    output.innerHTML = '<div class="alert alert-secondary">Searching flights...</div>';

    const formData = new FormData(form);
    const payload = {
      departure: formData.get('departure')?.toString().trim().toUpperCase(),
      arrival: formData.get('arrival')?.toString().trim().toUpperCase(),
      departureDate: formData.get('departureDate')?.toString().trim(),
      returnDate: formData.get('returnDate')?.toString().trim(),
      adults: Number(formData.get('adults')) || 1,
      children: Number(formData.get('children')) || 0,
      infants: Number(formData.get('infants')) || 0,
      cabinClass: formData.get('cabinClass')?.toString().trim().toLowerCase() || 'economy'
    };

    try {
      const response = await fetch('/api/search-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (!response.ok) {
        renderResults({ error: json.error || response.statusText });
        return;
      }
      window.location.href = 'flight-results.html';
    } catch (error) {
      output.innerHTML = `<div class="alert alert-danger">Search failed: ${error.message}</div>`;
    }
  });
});
