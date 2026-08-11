const fs = require('fs');
const Jimp = require('jimp');

const API_URL = 'http://localhost:4000/api';

async function registerUser(email, role) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password', name: `Test ${role}`, role })
  });
  const data = await res.json();
  if (data.error?.code === 'USER_EXISTS') {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password' })
    });
    return { token: (await loginRes.json()).token, user: (await loginRes.json()).user };
  }
  return { token: data.token, user: data.user };
}

async function createAndAnalyze(token) {
  const img = new Jimp(10, 10, 0xFFFFFFFF);
  for(let i=0; i<10; i++) img.setPixelColor(Math.random() > 0.5 ? 0x000000FF : 0xFFFFFFFF, Math.random()*10, Math.random()*10);
  const buffer = await img.getBufferAsync(Jimp.MIME_JPEG);
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('image', blob, 'test.jpg');

  const uploadRes = await fetch(`${API_URL}/samples/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  const sample = await uploadRes.json();

  const analyzeRes = await fetch(`${API_URL}/samples/${sample.id}/analyze`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await analyzeRes.json();
}

async function runTests() {
  console.log('--- Starting Doctor Portal Tests ---\n');

  try {
    const docData = await registerUser(`doc_portal_${Date.now()}@example.com`, 'DOCTOR');
    const doctorToken = docData.token;
    
    const patData = await registerUser(`pat_portal_${Date.now()}@example.com`, 'PATIENT');
    const patientToken = patData.token;

    // 1. Generate Two Reports
    console.log('1. Generating two reports for comparison...');
    const dataA = await createAndAnalyze(patientToken);
    const dataB = await createAndAnalyze(patientToken);
    const reportIdA = dataA.report.id;
    const reportIdB = dataB.report.id;
    console.log(`✅ Reports generated. A: ${reportIdA}, B: ${reportIdB}`);

    // 2. Test Compare Endpoint
    console.log('\n2. Testing /compare endpoint...');
    const compareRes = await fetch(`${API_URL}/reports/compare?reportIdA=${reportIdA}&reportIdB=${reportIdB}`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    const compareData = await compareRes.json();
    if (compareRes.ok && compareData.deltas) {
      console.log(`✅ Comparison successful. Computed deltas:`);
      console.log(compareData.deltas);
    } else {
      console.error('❌ Comparison failed:', compareData);
    }

    // 3. Test Comment Endpoint
    console.log('\n3. Testing Comment Endpoint...');
    const commentRes = await fetch(`${API_URL}/reports/${reportIdA}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${doctorToken}` },
      body: JSON.stringify({ text: 'Patient advised to monitor hydration levels.' })
    });
    if (commentRes.ok) {
      console.log(`✅ Doctor comment successfully added.`);
    } else {
      console.error('❌ Failed to add comment:', await commentRes.json());
    }

    // 4. Test Approve Endpoint
    console.log('\n4. Testing Approve Endpoint...');
    const approveRes = await fetch(`${API_URL}/reports/${reportIdA}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    if (approveRes.ok) {
      console.log(`✅ Report successfully approved and marked as reviewed.`);
    } else {
      console.error('❌ Failed to approve report:', await approveRes.json());
    }

    // 5. Test CSV Export
    console.log('\n5. Testing CSV Export Endpoint...');
    const csvRes = await fetch(`${API_URL}/patients/export`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    if (csvRes.ok) {
      const csvText = await csvRes.text();
      fs.writeFileSync('patients_export.csv', csvText);
      console.log(`✅ CSV generated and saved to 'patients_export.csv'.`);
      console.log(`Preview of CSV:\n${csvText.split('\n').slice(0, 3).join('\n')}...`);
    } else {
      console.error('❌ Failed to export CSV:', await csvRes.text());
    }

    console.log('\n--- Doctor Portal Verification Complete ---');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
