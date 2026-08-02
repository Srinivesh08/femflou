const API_URL = 'http://localhost:4000/api';

async function registerUser(email, password, name, role) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role })
  });
  const data = await res.json();
  if (res.ok) return { token: data.token, user: data.user };
  if (data.error?.code === 'USER_EXISTS') {
    // If exists, login instead
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    return { token: loginData.token, user: loginData.user };
  }
  throw new Error(`Failed to register ${email}: ${JSON.stringify(data)}`);
}

async function getMePatient(token) {
  const res = await fetch(`${API_URL}/patients/me`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return { status: res.status, data: await res.json() };
}

async function getPatientById(token, profileId) {
  const res = await fetch(`${API_URL}/patients/${profileId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return { status: res.status, data: await res.json() };
}

async function runTests() {
  console.log('--- Starting Patient Profile Endpoints Verification ---\n');

  try {
    // 1. Setup Accounts
    console.log('1. Setting up accounts...');
    const patientA = await registerUser('patA@example.com', 'password123', 'Patient A', 'PATIENT');
    const patientB = await registerUser('patB@example.com', 'password123', 'Patient B', 'PATIENT');
    const doctorC = await registerUser('docC@example.com', 'password123', 'Doctor C', 'DOCTOR');
    console.log('✅ Accounts set up.');

    // 2. Get Patient A's Profile ID
    console.log('\n2. Fetching Patient A and B Profiles...');
    const patAMe = await getMePatient(patientA.token);
    const patAProfileId = patAMe.data.id;
    
    const patBMe = await getMePatient(patientB.token);
    const patBProfileId = patBMe.data.id;
    console.log(`✅ Fetched profiles. Profile ID A: ${patAProfileId}, Profile ID B: ${patBProfileId}`);

    // 3. Authorization Check: Patient A accesses Patient B
    console.log('\n3. Testing Authorization (Patient A -> Patient B)...');
    const crossAccess = await getPatientById(patientA.token, patBProfileId);
    if (crossAccess.status === 403) {
      console.log('✅ Correctly blocked: Patient A cannot read Patient B\'s data (403 Forbidden).');
    } else {
      console.error(`❌ Failed: Expected 403, got ${crossAccess.status}`, crossAccess.data);
    }

    // 4. Authorization Check: Doctor accesses Patient A
    console.log('\n4. Testing Authorization (Doctor C -> Patient A)...');
    const docAccessA = await getPatientById(doctorC.token, patAProfileId);
    if (docAccessA.status === 200 && docAccessA.data.id === patAProfileId) {
      console.log('✅ Correctly allowed: Doctor C can read Patient A\'s data.');
    } else {
      console.error(`❌ Failed: Expected 200, got ${docAccessA.status}`, docAccessA.data);
    }

    // 5. Test Listing Patients as Doctor
    console.log('\n5. Testing GET /patients (Doctor C)...');
    const listRes = await fetch(`${API_URL}/patients`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${doctorC.token}` }
    });
    const listData = await listRes.json();
    if (listRes.ok && Array.isArray(listData.data)) {
      console.log(`✅ Doctor C successfully listed patients. Found ${listData.pagination.totalCount} patients.`);
    } else {
      console.error('❌ Failed to list patients:', listData);
    }

    console.log('\n--- Verification Complete ---');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
