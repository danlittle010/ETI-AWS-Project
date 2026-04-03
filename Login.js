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

    function showMessage(type, text) {
        output.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
    }

    async function fetchSignupUsers() {
        try {
            const response = await fetch('/Signup.json', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('Could not load signups');
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to read Signup.json:', error);
            return null;
        }
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = collectFormData();

        if (!formData.email || !formData.password) {
            showMessage('warning', 'Please enter email and password.');
            return;
        }

        const users = await fetchSignupUsers();
        if (users === null) {
            showMessage('danger', 'Could not read signup data. Make sure Signup.json exists.');
            return;
        }

        const userMatch = users.find((u) => u.email === formData.email && u.password === formData.password);
        if (!userMatch) {
            showMessage('danger', 'Invalid email or password.');
            return;
        }

        showMessage('success', `Login successful. Welcome, ${userMatch.fullname || userMatch.email}! Redirecting...`);
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 750);
    });

    saveJsonBtn.addEventListener('click', () => {
        const formData = collectFormData();
        const loginData = {
            type: formData.type,
            name: formData.name,
            email: formData.email,
            password: formData.password
        };
        const json = JSON.stringify(loginData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'login-data.json';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);

        showMessage('info', 'Saved form data to login-data.json');
    });

    // Start state
    switchTab('user');
});