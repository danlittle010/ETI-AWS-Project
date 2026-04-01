document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const output = document.getElementById('output');
    const saveJsonBtn = document.getElementById('saveJsonBtn');
    const userLoginTab = document.getElementById('userLoginTab');
    const authorLoginTab = document.getElementById('authorLoginTab');
    const loginTypeInput = document.getElementById('loginType');

    function switchTab(type) {
        loginTypeInput.value = type;
        if (type === 'user') {
            userLoginTab.classList.add('btn-primary');
            userLoginTab.classList.remove('btn-outline-primary');
            authorLoginTab.classList.remove('btn-primary');
            authorLoginTab.classList.add('btn-outline-primary');
        } else {
            authorLoginTab.classList.add('btn-primary');
            authorLoginTab.classList.remove('btn-outline-primary');
            userLoginTab.classList.remove('btn-primary');
            userLoginTab.classList.add('btn-outline-primary');
        }
    }

    window.switchTab = switchTab;

    function collectFormData() {
        return {
            type: loginTypeInput.value || 'user',
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
        };
    }

    function downloadJSON(data, filename = 'login-data.json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = collectFormData();

        output.innerHTML = `<div class="alert alert-success">Logged in as: <strong>${formData.email}</strong> (${formData.type})</div>`;

        // Optional: save automatically on login
        downloadJSON(formData, 'login-data.json');
    });

    saveJsonBtn.addEventListener('click', () => {
        const formData = collectFormData();
        downloadJSON(formData, 'login-data.json');
        output.innerHTML = `<div class="alert alert-info">Saved form data to login-data.json</div>`;
    });

    // Start state
    switchTab('user');
});