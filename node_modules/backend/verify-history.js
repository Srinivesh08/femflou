const Jimp = require('jimp');

const API_URL = 'http://localhost:4000/api';

async function registerPatient(prefix) {
  const email = `${prefix}_${Date.now()}@example.com`;
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password', name: `History Tester ${prefix}`, role: 'PATIENT' })
  });
  const data = await res.json();
  return data.token;
}

async function createReport(token) {
  // Generate Image
  const img = new Jimp(100, 100, 0x555555FF);
  const buffer = await img.getBufferAsync(Jimp.MIME_JPEG);
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('image', blob, 'test.jpg');

  // Upload
  const uploadRes = await fetch(`${API_URL}/samples/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  const sample = await uploadRes.json();

  // Analyze
  const analyzeRes = await fetch(`${API_URL}/samples/${sample.id}/analyze`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const analysisData = await analyzeRes.json();
  
  return analysisData.report.id;
}

async function runTests() {
  console.log('--- Starting History & Calibration Verification ---\n');

  try {
    // 1. Test Calibration Endpoint & Caching
    console.log('1. Testing GET /api/calibration...');
    const calAllRes = await fetch(`${API_URL}/calibration`);
    const calAllData = await calAllRes.json();
    const cacheControl = calAllRes.headers.get('cache-control');
    if (calAllRes.ok && calAllData.length > 0) {
      console.log(`✅ Fetched ${calAllData.length} calibration curves.`);
      if (cacheControl && cacheControl.includes('max-age')) {
        console.log(`✅ Cache-Control header correctly set: ${cacheControl}`);
      } else {
        console.error('❌ Cache-Control header missing!');
      }
    } else {
      console.error('❌ Failed to fetch calibration curves (did you run the seed script?):', calAllData);
    }

    // 2. Setup Patient & Report
    console.log('\n2. Setting up Patient A and creating a report...');
    const tokenA = await registerPatient('patA');
    const tokenB = await registerPatient('patB');
    const reportId = await createReport(tokenA);
    console.log(`✅ Report created. ID: ${reportId}`);

    // 3. Test Report Access
    console.log('\n3. Testing Report Access Boundaries...');
    const reportResA = await fetch(`${API_URL}/reports/${reportId}`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    if (reportResA.ok) {
      console.log('✅ Patient A successfully read their own report.');
    } else {
      console.error('❌ Patient A failed to read own report:', await reportResA.json());
    }

    const reportResB = await fetch(`${API_URL}/reports/${reportId}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    if (reportResB.status === 403) {
      console.log('✅ Correctly blocked: Patient B cannot read Patient A\'s report (403 Forbidden).');
    } else {
      console.error(`❌ Failed: Expected 403, got ${reportResB.status}`, await reportResB.json());
    }

    // 4. Test Trend Endpoint
    console.log('\n4. Testing Trend Endpoint...');
    const trendRes = await fetch(`${API_URL}/reports/${reportId}/trend`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const trendData = await trendRes.json();
    if (trendRes.ok && trendData['ALBUMIN']) {
      console.log('✅ Trend data successfully fetched. Sample data structure for ALBUMIN:');
      console.log('  ', trendData['ALBUMIN'][0]);
    } else {
      console.error('❌ Failed to fetch trend data:', trendData);
    }

    console.log('\n--- Verification Complete ---');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
