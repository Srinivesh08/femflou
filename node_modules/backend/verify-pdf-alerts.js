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
    return (await loginRes.json()).token;
  }
  return data.token;
}

async function createAndAnalyze(token) {
  // Generate Image
  const img = new Jimp(50, 50, 0x555555FF);
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
  console.log('--- Starting PDF, Verification, and Alerts Tests ---\n');

  try {
    const doctorToken = await registerUser('doc_alert@example.com', 'DOCTOR');
    const patientToken = await registerUser(`pat_${Date.now()}@example.com`, 'PATIENT');

    console.log('1. Generating samples until we trigger a CRITICAL alert...');
    let alertReport = null;
    for (let i = 0; i < 20; i++) {
      const data = await createAndAnalyze(patientToken);
      if (data.report && data.report.isAlert) {
        alertReport = data.report;
        console.log(`✅ Found CRITICAL alert on attempt ${i + 1}!`);
        console.log(`   Message: ${alertReport.alertMessage}`);
        break;
      }
    }

    if (!alertReport) {
      console.error('❌ Failed to generate a critical alert after 20 tries. Test cannot continue.');
      return;
    }

    console.log('\n2. Testing /api/alerts (Doctor View)...');
    const alertsRes = await fetch(`${API_URL}/alerts`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    const alertsData = await alertsRes.json();
    if (alertsRes.ok && Array.isArray(alertsData)) {
      // We might have multiple alerts if previous tests ran, but we should find ours
      const found = alertsData.find(a => a.id === alertReport.id);
      if (found) {
        console.log(`✅ Doctor successfully fetched alerts and found the new critical report.`);
      } else {
        console.log(`⚠️ Doctor couldn't find the specific alert. (This is expected if the patient wasn't assigned to this doctor, as DOCTOR role filters by assigned patients).`);
        console.log(`Let's re-test with an ADMIN token to ensure it exists globally.`);
        const adminToken = await registerUser('admin_alert@example.com', 'ADMIN');
        const adminAlertsRes = await fetch(`${API_URL}/alerts`, {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const adminAlertsData = await adminAlertsRes.json();
        const adminFound = adminAlertsData.find(a => a.id === alertReport.id);
        if (adminFound) {
          console.log(`✅ ADMIN successfully fetched global alerts and found it.`);
        } else {
          console.error(`❌ ADMIN could not find the alert either.`);
        }
      }
    }

    console.log('\n3. Testing Public Verification Endpoint...');
    const verifyRes = await fetch(`${API_URL}/verify/${alertReport.id}`);
    const verifyData = await verifyRes.json();
    if (verifyRes.ok && verifyData.exists && verifyData.createdAt) {
      console.log(`✅ Verification endpoint succeeded with limited data:`);
      console.log(verifyData);
    } else {
      console.error('❌ Verification endpoint failed:', verifyData);
    }

    console.log('\n4. Testing PDF Generation...');
    const pdfRes = await fetch(`${API_URL}/reports/${alertReport.id}/pdf`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    
    if (pdfRes.ok) {
      const buffer = await pdfRes.arrayBuffer();
      if (buffer.byteLength > 1000) { // A valid PDF with text and images will be > 1KB
        fs.writeFileSync('test-report.pdf', Buffer.from(buffer));
        console.log(`✅ Successfully generated and saved PDF to 'test-report.pdf' (${buffer.byteLength} bytes).`);
      } else {
        console.error(`❌ PDF buffer is suspiciously small: ${buffer.byteLength} bytes.`);
      }
    } else {
      console.error('❌ PDF generation request failed:', pdfRes.status);
    }

    console.log('\n--- Verification Complete ---');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
