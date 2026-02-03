import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';
const SESSION_ID = 'test-session-' + Date.now();

async function testLangChain() {
  console.log("🦜🔗 Testing LangChain Integration...\n");

  // 1. Start Conversation
  console.log("1️⃣ Starting Conversation (Roleplay: Waiter)...");
  try {
    const res = await fetch(`${BASE_URL}/api/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        topic: "Ordering Coffee", 
        level: "Beginner", 
        sessionId: SESSION_ID 
      })
    });
    const data = await res.json();
    console.log("🤖 AI:", data.message);
  } catch (e) {
    console.error("❌ Failed to start chat:", e.message);
  }

  // 2. Send Message
  console.log("\n2️⃣ Sending User Message: 'I want coffee please'");
  try {
    const res = await fetch(`${BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: "I want coffee please", 
        sessionId: SESSION_ID,
        topic: "Ordering Coffee",
        level: "Beginner"
      })
    });
    const data = await res.json();
    console.log("🤖 AI:", data.message);
  } catch (e) {
    console.error("❌ Failed to send message:", e.message);
  }

  // 3. Analyze Grammar
  console.log("\n3️⃣ Analyzing Grammar: 'I want two coffee'");
  try {
    const res = await fetch(`${BASE_URL}/api/grammar/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: "I want two coffee", 
        context: "Ordering coffee" 
      })
    });
    const report = await res.json();
    console.log("📝 Grammar Report:");
    console.log(`   Score: ${report.score}/100`);
    console.log(`   Feedback: ${report.generalFeedback}`);
    if (report.corrections.length > 0) {
      console.log("   Corrections:");
      report.corrections.forEach(c => {
        console.log(`     - "${c.original}" -> "${c.corrected}" (${c.explanation})`);
      });
    }
  } catch (e) {
    console.error("❌ Failed to analyze grammar:", e.message);
  }
}

testLangChain();
