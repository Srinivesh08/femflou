const Jimp = require('jimp');

const API_URL = 'http://localhost:4000/api';

async function registerPatient() {
  const email = `patient_${Date.now()}@example.com`;
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password', name: 'Analysis Tester', role: 'PATIENT' })
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Registration failed');
  return data.token;
}

async function uploadImage(token, buffer, filename) {
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('image', blob, filename);

  const res = await fetch(`${API_URL}/samples/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return res.json();
}

async function analyzeSample(token, sampleId) {
  const res = await fetch(`${API_URL}/samples/${sampleId}/analyze`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

async function runTests() {
  console.log('--- Starting Sample Analysis Verification ---\n');

  try {
    const token = await registerPatient();
    console.log('✅ Registered test patient');

    // Generate Dark/Blurry Image
    console.log('Generating dark/blurry image...');
    const darkImg = new Jimp(200, 200, 0x111111FF); // Very dark gray
    darkImg.blur(5); // Add blur
    const darkBuffer = await darkImg.getBufferAsync(Jimp.MIME_JPEG);

    // Generate Bright/Sharp/Noisy Image
    console.log('Generating bright/noisy image...');
    const brightImg = new Jimp(200, 200, 0xEEEEEEFF); // Very light gray
    for (let i = 0; i < 1000; i++) {
      brightImg.setPixelColor(Math.random() > 0.5 ? 0xFFFFFFFF : 0x000000FF, Math.random() * 200, Math.random() * 200); // Add sharp noise
    }
    const brightBuffer = await brightImg.getBufferAsync(Jimp.MIME_JPEG);

    // Upload Dark Image
    console.log('\nUploading Dark Image...');
    const darkUpload = await uploadImage(token, darkBuffer, 'dark.jpg');
    console.log(`✅ Uploaded. Brightness: ${darkUpload.brightnessScore}, Focus: ${darkUpload.focusScore}`);
    
    // Upload Bright Image
    console.log('\nUploading Bright Image...');
    const brightUpload = await uploadImage(token, brightBuffer, 'bright.jpg');
    console.log(`✅ Uploaded. Brightness: ${brightUpload.brightnessScore}, Focus: ${brightUpload.focusScore}`);

    if (darkUpload.brightnessScore < brightUpload.brightnessScore) {
      console.log('✅ Brightness scores correctly differ based on pixel data.');
    } else {
      console.error('❌ Brightness logic failed.');
    }

    if (darkUpload.focusScore < brightUpload.focusScore) {
      console.log('✅ Focus (sharpness) scores correctly differ based on pixel data.');
    } else {
      console.error('❌ Focus logic failed.');
    }

    // Trigger Analysis
    console.log(`\nTriggering Analysis on sample ${darkUpload.id}...`);
    const analysis1 = await analyzeSample(token, darkUpload.id);
    
    if (analysis1.status === 'ANALYZED' && analysis1.report && analysis1.biomarkerResults.length === 6) {
      console.log('✅ Analysis completed successfully. Created Report and 6 BiomarkerResults.');
      console.log(`   AI Summary: "${analysis1.report.aiSummary}"`);
    } else {
      console.error('❌ Analysis failed or incomplete:', analysis1);
    }

    // Attempt Analysis again to test error logic
    console.log('\nAttempting Analysis on same sample again...');
    const analysis2 = await analyzeSample(token, darkUpload.id);
    if (analysis2.error?.code === 'BAD_REQUEST') {
      console.log('✅ Correctly prevented double analysis.');
    } else {
      console.error('❌ Failed to prevent double analysis:', analysis2);
    }

    console.log('\n--- Verification Complete ---');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
