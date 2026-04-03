document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const output = document.getElementById('output');
    const loginTypeInput = document.getElementById('loginType');

    function collectFormData() {
        return {
            type: loginTypeInput.value || 'user',
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
});