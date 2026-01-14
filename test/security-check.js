import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testCORS() {
  console.log('🔍 Testing CORS...');
  try {
    const res = await fetch(`${BASE_URL}/api/chat/start`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://evil.com',
        'Access-Control-Request-Method': 'POST'
      }
    });

    const allowOrigin = res.headers.get('access-control-allow-origin');
    
    // If allowOrigin is null, it means the server didn't send the header (Good, because origin is bad)
    // If allowOrigin is present, it MUST NOT be evil.com
    if (!allowOrigin) {
       console.log('✅ CORS Valid: No Access-Control-Allow-Origin header sent for unauthorized origin.');
    } else if (allowOrigin !== 'http://evil.com') {
       console.log(`✅ CORS Valid: Origin header is ${allowOrigin} (Expected non-evil)`);
    } else {
       console.log(`❌ CORS Failed: Server allowed ${allowOrigin}`);
    }
  } catch (e) {
    console.log('⚠️ Error testing CORS (Is server running?):', e.message);
  }
}

async function testRateLimit() {
  console.log('🔍 Testing Rate Limit (Sending 110 requests)...');
  let blocked = false;
  // Use a random session ID to avoid interfering with real tests if any logic depends on it
  // But rate limit is by IP usually
  
  const start = Date.now();
  for (let i = 0; i < 110; i++) {
    try {
        // We hit a lightweight endpoint under /api to test the rate limiter
        const res = await fetch(`${BASE_URL}/api/limit-test`, { 
            method: 'GET',
        });
        
        // We expect 404 initially (fast), then 429 when limited.
        // We check if rate limit headers are present too.
        
        if (res.status === 429) {
            console.log(`✅ Rate Limit Triggered at request #${i+1}`);
            // Verify it's OUR rate limiter, not Google's
            const body = await res.json();
            if (body.error && body.error.includes("Too many requests")) {
                 console.log("   -> Confirmed it is the Express Rate Limiter.");
            }
            blocked = true;
            break;
        }
        
    } catch (e) {
        console.log('Req failed', e.message);
    }
  }
  const duration = (Date.now() - start) / 1000;
  console.log(`⏱️ Test took ${duration}s`);

  if (!blocked) {
    console.log('❌ Rate Limit Failed: Did not block after 100+ requests');
  }
}

async function run() {
    console.log('🚀 Starting Security Verification...');
    await testCORS();
    await testRateLimit();
}

run();
