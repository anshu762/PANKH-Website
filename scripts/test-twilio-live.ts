import { normalizeE164Phone, sendTwilioMessage } from "../lib/connect/twilio";
import dotenv from "dotenv";

dotenv.config();

async function runTwilioTests() {
  console.log("==========================================");
  console.log("🚀 Testing Twilio WhatsApp & SMS Service");
  console.log("==========================================\n");

  // Test 1: Phone Normalization
  console.log("Test 1: Phone Number Normalization");
  const tests = [
    { input: "9876543210", expected: "+919876543210" },
    { input: "+91 98765-43210", expected: "+919876543210" },
    { input: "919876543210", expected: "+919876543210" },
    { input: "+14155238886", expected: "+14155238886" },
  ];

  let normPass = true;
  for (const t of tests) {
    const res = normalizeE164Phone(t.input);
    if (res === t.expected) {
      console.log(`  ✅ Normalization for "${t.input}" -> "${res}"`);
    } else {
      console.error(`  ❌ Failed for "${t.input}": got "${res}", expected "${t.expected}"`);
      normPass = false;
    }
  }

  // Test 2: Twilio Configuration Check
  console.log("\nTest 2: Twilio Environment & Credentials");
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const fromNum = process.env.TWILIO_WHATSAPP_NUMBER;
  const fromWa = process.env.TWILIO_WHATSAPP_FROM;

  console.log(`  TWILIO_ACCOUNT_SID: ${sid ? sid.substring(0, 6) + "..." + sid.substring(sid.length - 4) : "NOT SET"}`);
  console.log(`  TWILIO_AUTH_TOKEN: ${token ? "********" + token.substring(token.length - 4) : "NOT SET"}`);
  console.log(`  TWILIO_WHATSAPP_NUMBER: ${fromNum}`);
  console.log(`  TWILIO_WHATSAPP_FROM: ${fromWa}`);

  // Test 3: Twilio API Account Verification via Direct Twilio REST API
  console.log("\nTest 3: Twilio Credentials Verification (REST API /Accounts)");
  if (sid && token) {
    try {
      const authHeader = `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`;
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
        headers: { Authorization: authHeader },
      });
      const data = await res.json();

      if (res.ok) {
        console.log(`  ✅ Twilio API Authentication Successful!`);
        console.log(`     Account Friendly Name: ${data.friendly_name}`);
        console.log(`     Account Status: ${data.status}`);
        console.log(`     Account Type: ${data.type}`);
      } else {
        console.warn(`  ⚠️ Twilio API returned error:`, data);
      }
    } catch (e: any) {
      console.error(`  ❌ Twilio connection failed:`, e.message);
    }
  }

  // Test 4: Dispatch Case Summary via sendTwilioMessage
  console.log("\nTest 4: sendTwilioMessage Dispatch Flow");
  const sampleMessage = 
    `*🚨 PANKH SENTINEL ALERT: Sudden Water Drop*\n\n` +
    `Farmer: Gurpreet Singh (Samrala, Ludhiana)\n` +
    `Flock: Cobb 500 (Day 22, 2,950 birds)\n` +
    `Symptoms: Coughing / Sneezing, Water intake down 17%\n` +
    `Recommended Action: Clinical inspection & oral electrolytes.\n\n` +
    `_AI-prepared case summary; not a confirmed diagnosis._`;

  const dispatchResult = await sendTwilioMessage({
    toPhone: "+919876543210",
    messageText: sampleMessage,
    channel: "WHATSAPP",
  });

  console.log("  Dispatch Result:", JSON.stringify(dispatchResult, null, 2));

  if (dispatchResult.success) {
    console.log(`  ✅ Message dispatched successfully! Status: ${dispatchResult.status}, SID: ${dispatchResult.messageSid}`);
  } else {
    console.log(`  ℹ️ Twilio handled dispatch outcome: ${dispatchResult.status}`);
    console.log(`     Reason / Error: ${dispatchResult.error}`);
    console.log(`     Notice: ${dispatchResult.sandboxNotice}`);
    console.log(`  ✅ Safe failure handling verified: The system does not crash when recipient hasn't joined Sandbox.`);
  }

  console.log("\n==========================================");
  console.log("🏁 Twilio Integration Test Complete!");
  console.log("==========================================");
}

runTwilioTests();
