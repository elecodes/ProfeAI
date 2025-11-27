import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testValidation() {
  console.log("🧪 Testing API Validation...\n");

  // Test 1: Invalid Dialogue Request (Missing topic)
  console.log("1️⃣ Testing Invalid Dialogue Request (No topic)...");
  try {
    const res = await fetch(`${BASE_URL}/api/generate-dialogue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 'beginner' })
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (res.status === 400 && data.error === "Validation Error") {
        console.log("✅ Passed: Server rejected invalid request with 400.");
        console.log("   Error details:", JSON.stringify(data.details));
      } else {
        console.error("❌ Failed: Expected 400, got", res.status);
        console.log("Response body:", text.substring(0, 200));
      }
    } catch {
      console.error("❌ Failed to parse JSON. Status:", res.status);
      console.log("Response body preview:", text.substring(0, 200));
    }
  } catch (e) {
    console.error("❌ Request failed:", e.message);
  }

  // Test 2: Invalid Dialogue Request (Short topic)
  console.log("\n2️⃣ Testing Invalid Dialogue Request (Short topic)...");
  try {
    const res = await fetch(`${BASE_URL}/api/generate-dialogue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: "Hi", level: 'beginner' })
    });
    const data = await res.json();
    if (res.status === 400 && data.error === "Validation Error") {
      console.log("✅ Passed: Server rejected short topic.");
    } else {
      console.error("❌ Failed: Expected 400, got", res.status);
    }
  } catch {
    console.error("❌ Request failed.");
  }

  // Test 3: Invalid TTS Request (Missing text)
  console.log("\n3️⃣ Testing Invalid TTS Request (No text)...");
  try {
    const res = await fetch(`${BASE_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'es' })
    });
    const data = await res.json();
    if (res.status === 400 && data.error === "Validation Error") {
      console.log("✅ Passed: Server rejected missing text.");
    } else {
      console.error("❌ Failed: Expected 400, got", res.status);
    }
  } catch {
    console.error("❌ Request failed.");
  }
}

testValidation();
