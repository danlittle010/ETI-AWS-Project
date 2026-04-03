document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const saveSignupJson = document.getElementById('saveSignupJson');
    const output = document.getElementById('signupOutput');

    function collectSignupData() {
        return {
            fullname: document.getElementById('fullname').value.trim(),
            email: document.getElementById('signupEmail').value.trim(),
            password: document.getElementById('signupPassword').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            timestamp: new Date().toISOString()
        };
    }

    function displayMessage(type, text) {
        output.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
    }

    function saveSignupToServer(payload) {
        return fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then((response) => {
            if (!response.ok) {
                return response.json().then((err) => {
                    throw new Error(err.error || 'Server save failed');
                });
            }
            return response.json();
        });
    }

    function buildPayload(data) {
        return {
            fullname: data.fullname,
            email: data.email,
            password: data.password
        };
    }

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = collectSignupData();

        if (data.password !== data.confirmPassword) {
            displayMessage('danger', 'Passwords do not match. Please try again.');
            return;
        }

        const payload = buildPayload(data);

        saveSignupToServer(payload)
            .then(() => {
                displayMessage('success', 'Signup info saved to Signup.json on server. Redirecting to main page...');
                setTimeout(() => {
                    window.location.href = 'main.html';
                }, 750);
            })
            .catch((err) => {
                displayMessage('danger', `Saving failed: ${err.message}`);
            });
    });

    saveSignupJson.addEventListener('click', () => {
        const data = collectSignupData();

        if (data.password !== data.confirmPassword) {
            displayMessage('danger', 'Passwords do not match. Please try again.');
            return;
        }

        const payload = buildPayload(data);

        saveSignupToServer(payload)
            .then(() => {
                displayMessage('info', 'Signup info saved to Signup.json on server.');
            })
            .catch((err) => {
                displayMessage('danger', `Saving failed: ${err.message}`);
            });
    });
});