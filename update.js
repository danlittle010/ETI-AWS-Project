// Auto-update script with AJAX polling
const UPDATE_INTERVAL = 3000; // Update every 3 seconds

// Get all updates from server
async function fetchUpdates() {
  try {
    const response = await fetch('/api/updates', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch updates');
    return await response.json();
  } catch (error) {
    console.error('Update fetch error:', error);
    return null;
  }
}

// Update users list on the page
function updateUsersList(users) {
  const usersList = document.getElementById('usersList');
  if (!usersList) return;
  
  if (users.length === 0) {
    usersList.innerHTML = '<p class="text-muted">No users yet</p>';
    return;
  }
  
  let html = '<ul class="list-group">';
  users.forEach((user) => {
    html += `
      <li class="list-group-item">
        <strong>${user.fullname}</strong> (${user.email})
      </li>
    `;
  });
  html += '</ul>';
  usersList.innerHTML = html;
}

// Update travel deals on the page
function updateTravelDeals(deals) {
  const dealsList = document.getElementById('dealsList');
  if (!dealsList) return;
  
  if (deals.length === 0) {
    dealsList.innerHTML = '<p class="text-muted">No deals available</p>';
    return;
  }
  
  let html = '<div class="row">';
  deals.forEach((deal) => {
    html += `
      <div class="col-md-4 mb-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${deal.destination}</h5>
            <p class="card-text">
              <strong>$${deal.price}</strong> via ${deal.airline}
            </p>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  dealsList.innerHTML = html;
}

// Update timestamp
function updateTimestamp(timestamp) {
  const timestampEl = document.getElementById('lastUpdate');
  if (timestampEl) {
    const date = new Date(timestamp);
    timestampEl.textContent = date.toLocaleTimeString();
  }
}

// Main auto-update loop
function startAutoUpdate() {
  // Initial fetch
  fetchUpdates().then((data) => {
    if (data) {
      updateUsersList(data.users);
      updateTravelDeals(data.travelDeals);
      updateTimestamp(data.timestamp);
    }
  });

  // Poll for updates
  setInterval(() => {
    fetchUpdates().then((data) => {
      if (data) {
        updateUsersList(data.users);
        updateTravelDeals(data.travelDeals);
        updateTimestamp(data.timestamp);
      }
    });
  }, UPDATE_INTERVAL);
}

// Start auto-update when DOM is ready
document.addEventListener('DOMContentLoaded', startAutoUpdate);
