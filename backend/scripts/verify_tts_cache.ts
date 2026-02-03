
import fetch from "node-fetch";

async function verifyCache() {
  const url = "http://localhost:3001/tts";
  const payload = {
    text: "Testing caching system " + Date.now(), // Unique text to ensure fresh start
    language: "es",
    options: { gender: "female" }
  };

  console.log("🚀 Starting TTS Cache Verification...");
  console.log(`📝 Text: "${payload.text}"`);

  // First Request (Cache Miss)
  console.log("\n1️⃣  Sending First Request (Should be Cache MISS)...");
  const start1 = performance.now();
  try {
    const res1 = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const end1 = performance.now();
    
    if (!res1.ok) throw new Error(`HTTP Error: ${res1.status}`);
    
    console.log(`   ⏱️  Time: ${(end1 - start1).toFixed(2)}ms`);
    console.log(`   🏷️  Provider Header: ${res1.headers.get("X-TTS-Provider")}`);
    
    // Check if it successfully used a provider (not cache)
    const provider1 = res1.headers.get("X-TTS-Provider");
    if (provider1 === "cache") {
      console.warn("   ⚠️  Unexpected: First request hit cache? (Maybe hash collision)");
    } else {
      console.log("   ✅  Correct: First request hit API.");
    }

  } catch (err) {
    console.error("   ❌  Request 1 Failed:", err);
    return;
  }

  // Second Request (Cache Hit)
  console.log("\n2️⃣  Sending Second Request (Should be Cache HIT)...");
  const start2 = performance.now();
  try {
    const res2 = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const end2 = performance.now();

    if (!res2.ok) throw new Error(`HTTP Error: ${res2.status}`);
    
    console.log(`   ⏱️  Time: ${(end2 - start2).toFixed(2)}ms`);
    console.log(`   🏷️  Provider Header: ${res2.headers.get("X-TTS-Provider")}`);
    
    // Verify Cache Hit
    const provider2 = res2.headers.get("X-TTS-Provider");
    if (provider2 === "cache") {
      console.log("   ✅  SUCCESS: Second request served from cache!");
      console.log("   🎉  Caching is working correctly.");
    } else {
      console.error("   ❌  FAILURE: Second request did NOT hit cache. Check server logs.");
    }

  } catch (err) {
    console.error("   ❌  Request 2 Failed:", err);
  }
}

verifyCache();
