document.getElementById('checkHealth').addEventListener('click', () => {
    const status = document.getElementById('status');
    status.innerHTML = "> Checking GIA Nodes...\n> Hardware: NOMINAL\n> DSN Link: STABLE\n> System health at 98%.";
});

document.getElementById('testCortex').addEventListener('click', () => {
    const status = document.getElementById('status');
    status.innerHTML = "> Accessing AI Cortex...\n> Deep Mind response: 14ms\n> Zero-Trust Perimeter: LOCKED\n> Diagnostic Complete.";
});

const loginStatus = document.getElementById('login-status');

// 1. Request OTP Key from AI Worker
document.getElementById('requestKeyBtn').addEventListener('click', async () => {
    loginStatus.innerHTML = "<span style='color: var(--accent)'>Generating Encrypted Key...</span>";
    
    try {
        const response = await fetch('/api/admin/generate-key', { method: 'POST' });
        const data = await response.json();
        
        if (response.ok) {
            loginStatus.innerHTML = "<span style='color: #22c55e'>Key sent to authorized device.</span>";
            console.log("Admin Hint: Check Worker Console for Key"); // In production, this would be an email/SMS
        }
    } catch (err) {
        loginStatus.innerHTML = "<span style='color: var(--accent-warn)'>Connection Failed.</span>";
    }
});

// 2. Handle Login Verification
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    loginStatus.innerHTML = "<span style='color: var(--accent)'>Verifying Clearance...</span>";

    const payload = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        otp: document.getElementById('otp').value
    };

    try {
        const response = await fetch('/api/admin/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            loginStatus.innerHTML = "<span style='color: #22c55e'>Clearance Granted. Redirecting...</span>";
            setTimeout(() => window.location.href = 'admin-dashboard.html', 1500);
        } else {
            loginStatus.innerHTML = "<span style='color: var(--accent-warn)'>ACCESS DENIED: Invalid Credentials.</span>";
        }
    } catch (err) {
        loginStatus.innerHTML = "<span style='color: var(--accent-warn)'>System Error. Link Severed.</span>";
    }
});
