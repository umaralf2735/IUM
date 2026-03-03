const API_URL = 'http://127.0.0.1:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
        window.location.href = 'dashboard.html';
    }

    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('login-error');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = '';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Save token
                localStorage.setItem('adminToken', data.access_token);
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.textContent = data.msg || 'Login gagal. Periksa kembali username/password.';
            }
        } catch (error) {
            console.error('Login Error:', error);
            errorMsg.textContent = 'Tidak dapat terhubung ke server.';
        }
    });
});
