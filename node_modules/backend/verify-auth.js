const API_URL = 'http://localhost:4000/api';

async function runTests() {
  console.log('--- Starting Authentication Verification ---\n');
  let token = '';

  try {
    // 1. Test Registration
    console.log('1. Testing POST /auth/register...');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testpatient@example.com',
        password: 'password123',
        name: 'Test Patient',
        role: 'PATIENT'
      })
    });
    
    const registerData = await registerRes.json();
    if (registerRes.ok && registerData.token) {
      console.log('✅ Registration successful.');
      // Save token for later tests
      token = registerData.token;
    } else if (registerData.error?.code === 'USER_EXISTS') {
      console.log('ℹ️ User already exists, skipping registration failure test.');
    } else {
      console.error('❌ Registration failed:', registerData);
    }

    // 2. Test Login
    console.log('\n2. Testing POST /auth/login...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testpatient@example.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.token) {
      console.log('✅ Login successful. Received JWT.');
      token = loginData.token; // update token
      if (loginData.user.passwordHash || loginData.user.password) {
        console.error('❌ Login returned password hash/data!');
      } else {
        console.log('✅ Login response properly omitted password data.');
      }
    } else {
      console.error('❌ Login failed:', loginData);
    }

    // 3. Test Invalid Login
    console.log('\n3. Testing POST /auth/login with wrong password...');
    const invalidLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testpatient@example.com',
        password: 'wrongpassword'
      })
    });
    if (invalidLoginRes.status === 401) {
      console.log('✅ Invalid login correctly rejected with 401.');
    } else {
      console.error('❌ Invalid login test failed:', await invalidLoginRes.json());
    }

    // 4. Test GET /auth/me (Protected Route)
    console.log('\n4. Testing GET /auth/me with valid token...');
    const meRes = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const meData = await meRes.json();
    if (meRes.ok && meData.email === 'testpatient@example.com') {
      console.log('✅ GET /auth/me successful. Profile fetched.');
      if (meData.patientProfile) {
        console.log('✅ PatientProfile relationship is present.');
      }
    } else {
      console.error('❌ GET /auth/me failed:', meData);
    }

    // 5. Test Missing Token
    console.log('\n5. Testing GET /auth/me with NO token...');
    const noTokenRes = await fetch(`${API_URL}/auth/me`, {
      method: 'GET'
    });
    if (noTokenRes.status === 401) {
      console.log('✅ Request without token correctly rejected with 401.');
    } else {
      console.error('❌ Missing token test failed:', await noTokenRes.json());
    }

    // 6. Test Token Refresh
    console.log('\n6. Testing POST /auth/refresh with valid token...');
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const refreshData = await refreshRes.json();
    if (refreshRes.ok && refreshData.token) {
      console.log('✅ Token refresh successful. Received new JWT.');
    } else {
      console.error('❌ Token refresh failed:', refreshData);
    }

    // 7. Test Zod Validation (Missing email)
    console.log('\n7. Testing POST /auth/register validation (missing email)...');
    const badRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'password123',
        name: 'Bad Reg',
        role: 'PATIENT'
      })
    });
    const badRegData = await badRegRes.json();
    if (badRegRes.status === 400 && badRegData.error?.code === 'VALIDATION_ERROR') {
      console.log('✅ Validation correctly caught missing email and returned 400.');
    } else {
      console.error('❌ Validation test failed:', badRegData);
    }

    console.log('\n--- Verification Complete ---');
  } catch (err) {
    console.error('Test execution error. Is the server running on port 4000?', err);
  }
}

runTests();
