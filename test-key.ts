import dotenv from 'dotenv';
dotenv.config();

// Native fetch is available in Node 22+
const fetch = globalThis.fetch;

async function run() {
    console.log("⚡ Testing RAW HTTP Request to Google...");
    
    // Explicitly testing gemini-1.5-flash
    const model = "gemini-1.5-flash";
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            console.error("Please read this error detail carefully:");
            console.error(JSON.stringify(data, null, 2));
        } else {
            console.log("✅ SUCCESS (Raw Fetch)!");
            console.log(data.candidates[0].content.parts[0].text);
        }

    } catch (error) {
        console.error("❌ Network/Fetch Error:", error);
    }
}

run();
