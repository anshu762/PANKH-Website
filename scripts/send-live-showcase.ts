import { cleanPhoneForWhatsApp, buildWhatsAppShareUrl } from "../lib/connect/whatsapp";
import dotenv from "dotenv";

dotenv.config();

// Target phone from CLI argument (e.g. npx tsx scripts/send-live-showcase.ts 9572593673) or default to requested test number
const targetPhoneInput = process.argv[2] || "9572593673";
const targetDigits = cleanPhoneForWhatsApp(targetPhoneInput);

interface MessagePayload {
  title: string;
  category: "SENTINEL_RED_ALERT" | "CONNECT_VET_SUMMARY" | "ECONOMICS_BRIEF" | "WEATHER_ADVISORY";
  body: string;
}

const SHOWCASE_MESSAGES: MessagePayload[] = [
  {
    title: "1. Pankh Sentinel — Urgent Disease Risk Alert (Red Flag)",
    category: "SENTINEL_RED_ALERT",
    body: 
`🚨 *PANKH SENTINEL — IMMEDIATE FLOCK ALERT*
────────────────────────
📍 *Farm:* Gurpreet Poultry Farm, Samrala (Ludhiana)
🐥 *Flock:* Cobb 500 • Day 22 (2,950 birds)
⚠️ *Risk Level:* *URGENT (RED)*

📊 *Critical Triggers Detected:*
• Water intake dropped by *17.2%* in last 24h (640L ➔ 530L)
• Daily mortality spiked from 2 birds to *8 birds*
• Respiratory symptoms reported: *Coughing / Rales*

🛑 *What to do RIGHT NOW:*
1. Immediately isolate Shed #2.
2. Provide oral electrolyte + Vitamin C in cool drinking water.
3. Do not mix healthy flock equipment.
4. Contact GADVASU vet helpline immediately.

_Note: AI risk classification; not a confirmed diagnosis._`,
  },
  {
    title: "2. Pankh Connect — Specialist Vet Escalation Summary",
    category: "CONNECT_VET_SUMMARY",
    body:
`📋 *PANKH CONNECT — CLINICAL CASE SUMMARY*
────────────────────────
👨‍🌾 *Farmer:* Gurpreet Singh (+${targetDigits})
📍 *Location:* Village Samrala, Dist. Ludhiana, Punjab
🏥 *Assigned Clinic:* GADVASU Poultry Disease Clinic, Ludhiana

🐥 *Flock Telemetry:*
• Breed: Broiler Cobb 500 | Age: Day 22
• Initial Flock: 3,000 | Current: 2,950
• Livability: *98.3%*

🔍 *Observed Clinical Signs:*
• Water Intake Drop: 17%
• Mild respiratory rales & lethargy
• Feed intake marginally reduced (310kg ➔ 280kg)

⚠️ *DISCLAIMER:* AI-prepared clinical telemetry summary for licensed veterinary consultation. This is NOT a confirmed veterinary diagnosis.`,
  },
  {
    title: "3. Pankh Economics — Batch Performance & P&L Update",
    category: "ECONOMICS_BRIEF",
    body:
`💰 *PANKH FARM ECONOMICS — BATCH PERFORMANCE*
────────────────────────
📦 *Batch:* Cobb-500-Summer-2026
📅 *Day 22 Progress Report*

📈 *Key Metrics:*
• Average Weight: *1.18 kg / bird*
• Current FCR: *1.48* (Punjab Benchmark: 1.52 - Excellent)
• Total Feed Consumed: 5,160 kg

💵 *Economics Overview:*
• Total Cost Incurred: ₹2,42,800 (Feed: 68%, DOC: 22%, Med: 10%)
• Cost per Bird: *₹82.30*
• Current Market Mandi Rate: *₹102 / kg*
• Projected Profit per Bird: *+₹19.70*

_Estimations based on active Punjab mandi rates & farmer check-in data._`,
  },
  {
    title: "4. Pankh Sentinel — Weather & Shed Heat Stress Advisory",
    category: "WEATHER_ADVISORY",
    body:
`☀️ *PANKH ADVISORY — HEAT STRESS FORECAST*
────────────────────────
📍 *Region:* Ludhiana & Central Punjab
🌡️ *Forecast:* Max Temp *41.5°C*, Humidity *68%*
⚠️ *Heat Index:* Severe Heat Stress Warning for Broilers

🐔 *Recommended Actions:*
• Run foggers/sprinklers between 12:00 PM - 4:00 PM.
• Withdraw feed during peak afternoon heat (1:00 PM - 3:30 PM) to reduce metabolic heat production.
• Ensure water tanks are shaded and cool water is circulated.
• Add electrolytes and betaine in water.

_Powered by Pankh Sentinel Environmental Radar._`,
  }
];

function generateShowcase() {
  console.log("══════════════════════════════════════════════════════════════");
  console.log(`📱 PANKH ZERO-COST WHATSAPP CLICK-TO-CHAT SHOWCASE`);
  console.log(`🎯 Recipient Target Phone: +${targetDigits} (Dynamic: ${targetPhoneInput})`);
  console.log("══════════════════════════════════════════════════════════════\n");

  for (let i = 0; i < SHOWCASE_MESSAGES.length; i++) {
    const msg = SHOWCASE_MESSAGES[i];
    const waUrl = buildWhatsAppShareUrl(targetPhoneInput, msg.body);

    console.log(`\n📌 [Scenario ${i + 1}/4]: ${msg.title}`);
    console.log(`🔗 1-Click WhatsApp Direct Link:`);
    console.log(`   ${waUrl}\n`);
    console.log(`💬 Message Preview:\n${msg.body}`);
    console.log("──────────────────────────────────────────────────────────────");
  }

  console.log("\n✅ All 4 showcase scenarios are ready with zero-cost wa.me Click-to-Chat!");
  console.log("👉 Click any of the links above to open the pre-filled message directly in WhatsApp.");
}

generateShowcase();
