document.addEventListener('DOMContentLoaded', () => {
  const flightResultsEl = document.getElementById('flightResults');
  const rawJsonEl = document.getElementById('rawJson');
  const refreshButton = document.getElementById('refreshButton');

  if (!flightResultsEl || !rawJsonEl || !refreshButton) return;

  function formatDateTime(dateString) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatDuration(minutes) {
    if (typeof minutes !== 'number' || Number.isNaN(minutes)) return 'Unknown';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  }

  function formatCarriers(carriers) {
    if (!Array.isArray(carriers) || carriers.length === 0) return 'Unknown';
    return carriers.map((carrier) => carrier.name || 'Unknown').join(', ');
  }

  function renderLeg(leg, index) {
    const stops = leg.stopCount === 0 ? 'Nonstop' : `${leg.stopCount} stop${leg.stopCount === 1 ? '' : 's'}`;
    return `
      <div class="mb-3">
        <h6 class="mb-1">Leg ${index + 1}: ${leg.origin} → ${leg.destination}</h6>
        <p class="mb-1"><strong>Departure:</strong> ${formatDateTime(leg.departure)}</p>
        <p class="mb-1"><strong>Arrival:</strong> ${formatDateTime(leg.arrival)}</p>
        <p class="mb-1"><strong>Duration:</strong> ${formatDuration(leg.durationMinutes)}</p>
        <p class="mb-1"><strong>Stops:</strong> ${stops}</p>
        <p class="mb-1"><strong>Airline(s):</strong> ${formatCarriers(leg.carriers)}</p>
      </div>
    `;
  }

  async function loadFlightResults() {
    flightResultsEl.innerHTML = '<div class="alert alert-secondary">Loading saved flight results...</div>';
    rawJsonEl.textContent = '';

    try {
      const response = await fetch('/flight-results.json', { cache: 'no-store' });
      if (!response.ok) {
        flightResultsEl.innerHTML = `<div class="alert alert-danger">Unable to load flight results: ${response.status} ${response.statusText}</div>`;
        return;
      }

      const data = await response.json();
      rawJsonEl.textContent = JSON.stringify(data, null, 2);

      const itineraries = Array.isArray(data.itineraries) ? data.itineraries : [];
      const total = typeof data.total === 'number' ? data.total : itineraries.length;

      if (itineraries.length === 0) {
        flightResultsEl.innerHTML = `<div class="alert alert-info">No flight itineraries found. Total results: ${total}</div>`;
        return;
      }

      let html = `<div class="row row-cols-1 row-cols-md-1 g-3">`;
      itineraries.forEach((itinerary, index) => {
        const price = itinerary.price?.formatted || (itinerary.price && `${itinerary.price.amount} ${itinerary.price.currency}`) || 'N/A';
        const legs = Array.isArray(itinerary.legs) ? itinerary.legs : [];
        const totalStops = legs.reduce((sum, leg) => sum + (typeof leg.stopCount === 'number' ? leg.stopCount : 0), 0);
        html += `
          <div class="col">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 class="card-title mb-1">Result ${index + 1}</h5>
                    <p class="mb-0 text-muted">${legs[0]?.origin || ''} → ${legs[legs.length - 1]?.destination || ''}</p>
                  </div>
                  <div class="text-end">
                    <p class="mb-1"><strong>Price:</strong> ${price}</p>
                    <p class="mb-0"><strong>Total stops:</strong> ${totalStops}</p>
                  </div>
                </div>
                ${legs.map((leg, legIndex) => renderLeg(leg, legIndex + 1)).join('')}
                ${itinerary.bookingUrl ? `<a href="${itinerary.bookingUrl}" target="_blank" rel="noopener" class="btn btn-outline-primary btn-sm mt-2">Book this flight</a>` : ''}
              </div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      flightResultsEl.innerHTML = html;
    } catch (error) {
      flightResultsEl.innerHTML = `<div class="alert alert-danger">Error loading saved flight results: ${error.message}</div>`;
    }
  }

  refreshButton.addEventListener('click', loadFlightResults);
  loadFlightResults();
});
