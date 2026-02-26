const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testOrganizerFlow() {
    const timestamp = Date.now();
    const organizerEmail = `host_${timestamp}@example.com`;
    const password = 'Password123!';

    console.log(`Starting test for ${organizerEmail}...`);

    try {
        // 1. Register
        console.log('1. Registering Organizer...');
        const registerResponse = await axios.post(`${BASE_URL}/api/v1/auth/register`, {
            email: organizerEmail,
            password: password,
            firstName: 'Test',
            lastName: 'Host',
            role: 'HOST'
        });
        console.log('✅ Registered:', registerResponse.data.user.id);
        const userId = registerResponse.data.user.id;

        // 2. Try Login (Should fail)
        console.log('2. Trying Login (Should fail with 401)...');
        try {
            await axios.post(`${BASE_URL}/api/v1/auth/login`, {
                email: organizerEmail,
                password: password
            });
            console.error('❌ Login should have failed!');
        } catch (e) {
            if (e.response && e.response.status === 401) {
                console.log('✅ Login failed as expected (Pending Approval)');
            } else {
                console.error('❌ Unexpected error during expected fail login:', e.message);
            }
        }

        // 3. Admin Approve (Simulate Link Click which is GET)
        console.log('3. Admin Approving (via Simulated Email Link GET)...');
        try {
            await axios.get(`${BASE_URL}/api/v1/admin/approve-host/${userId}?email=true`);
            console.log('✅ Admin Approved Host (simulated email click)');
        } catch (e) {
            console.error('❌ Admin Approve Failed:', e.message);
            if (e.response) {
                console.error('Status:', e.response.status);
                console.error('Data:', e.response.data);
            }
            throw e;
        }

        // 4. Login (Should require OTP)
        // Note: In real flow, user verifies email first using the OTP sent at registration.
        // Since we can't easily grab that OTP here, we skip explicit email verification
        // because "Pending Approval" blocks login regardless of email status.
        // Admin Approval sets hostApproved=true.
        console.log('4. Trying Login (Should require OTP)...');
        const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: organizerEmail,
            password: password
        });

        if (loginResponse.data.requiresOtp) {
            console.log('✅ Login requires OTP');
            console.log('Message:', loginResponse.data.message);
        } else {
            console.error('❌ Login did NOT require OTP:', loginResponse.data);
            return;
        }

        console.log('✅ Flow verified! Backend logic is solid.');

    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
    }
}

testOrganizerFlow();
