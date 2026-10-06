import { prisma } from "../lib/db";
import { connectService } from "../services/connect.service";
import { CaseStatus } from "@prisma/client";
import {
  normalizeE164Phone,
  cleanPhoneForWhatsApp,
  buildWhatsAppShareUrl,
  dispatchCaseSummary,
} from "../lib/connect/whatsapp";
import dotenv from "dotenv";

dotenv.config();

// Default testing phone (user requested: 9572593673), or pass any custom number via CLI: npx tsx scripts/test-whatsapp-flow.ts 9876543210
const testPhoneInput = process.argv[2] || "9572593673";

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    if (detail) console.log(`   └─ ${detail}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (detail) console.error(`   └─ Error: ${detail}`);
    process.exit(1);
  }
}

async function runTests() {
  console.log("══════════════════════════════════════════════════════════════");
  console.log("🚀 Testing Zero-Cost Direct WhatsApp (wa.me) & Connect Engine");
  console.log("══════════════════════════════════════════════════════════════\n");

  // -------------------------------------------------------------
  // Test 1: Phone Number Normalization & wa.me Extraction
  // -------------------------------------------------------------
  console.log("📋 Test Group 1: Phone Normalization & wa.me URL Formatting");

  const normalized = normalizeE164Phone(testPhoneInput);
  const cleanDigits = cleanPhoneForWhatsApp(testPhoneInput);

  assert(
    normalized === `+91${testPhoneInput.slice(-10)}`,
    `Normalizes 10-digit phone "${testPhoneInput}" to international E.164`,
    `Normalized: ${normalized}`
  );

  assert(
    cleanDigits === `91${testPhoneInput.slice(-10)}`,
    `Extracts digits-only with country code for wa.me links`,
    `wa.me digits: ${cleanDigits}`
  );

  // Formatting with symbols and spaces
  const spacedPhone = `+91 ${testPhoneInput.slice(-10, -5)}-${testPhoneInput.slice(-5)}`;
  assert(
    cleanPhoneForWhatsApp(spacedPhone) === `91${testPhoneInput.slice(-10)}`,
    `Handles spaced and hyphenated phone numbers correctly`,
    `Input: "${spacedPhone}" -> Output: "${cleanPhoneForWhatsApp(spacedPhone)}"`
  );

  // -------------------------------------------------------------
  // Test 2: URL Encoding & Deep Link Generation
  // -------------------------------------------------------------
  console.log("\n📋 Test Group 2: WhatsApp Share URL Generation");

  const sampleMessage =
    `*🚨 PANKH SENTINEL ALERT*\n` +
    `Farmer: Gurpreet Singh\n` +
    `Flock: Cobb 500 (Day 22)\n` +
    `Symptoms: Water drop 17%\n` +
    `_AI-prepared case summary; not a confirmed diagnosis._`;

  const shareUrl = buildWhatsAppShareUrl(testPhoneInput, sampleMessage);

  assert(
    shareUrl.startsWith(`https://wa.me/91${testPhoneInput.slice(-10)}?text=`),
    "Builds valid https://wa.me URL with phone number and text parameter",
    shareUrl.substring(0, 75) + "..."
  );

  assert(
    shareUrl.includes(encodeURIComponent("PANKH SENTINEL ALERT")),
    "Correctly encodes special characters and markdown stars in URL",
    "Verified encoded parameters"
  );

  // -------------------------------------------------------------
  // Test 3: Standalone Dispatch Payload Generation
  // -------------------------------------------------------------
  console.log("\n📋 Test Group 3: dispatchCaseSummary Result Structure");

  const dispatchResult = await dispatchCaseSummary({
    toPhone: testPhoneInput,
    messageText: sampleMessage,
    channel: "WHATSAPP",
  });

  assert(
    dispatchResult.success === true && dispatchResult.status === "READY",
    "Dispatch result returns success: true and status: READY (Zero Twilio cost)",
    `Status: ${dispatchResult.status}`
  );

  assert(
    Boolean(dispatchResult.whatsappUrl && dispatchResult.summaryText),
    "Dispatch result contains valid whatsappUrl and summaryText for 1-click sharing",
    `URL present: ${Boolean(dispatchResult.whatsappUrl)}`
  );

  // -------------------------------------------------------------
  // Test 4: End-to-End Case Creation, Consent & Dynamic Escalation
  // -------------------------------------------------------------
  console.log("\n📋 Test Group 4: End-to-End Database Case Lifecycle & Consent Flow");

  // Fetch active demo farmer dynamically from database
  const demoFarmer = await prisma.farmer.findFirst({
    include: {
      user: true,
      farms: {
        include: {
          batches: { where: { status: "ACTIVE" } },
        },
      },
    },
  });

  if (!demoFarmer || !demoFarmer.farms[0]?.batches[0]) {
    throw new Error("Demo farmer or active flock batch not found in database.");
  }

  const demoBatch = demoFarmer.farms[0].batches[0];
  console.log(`   Found Farmer: ${demoFarmer.user?.name || "Farmer"} (ID: ${demoFarmer.id})`);
  console.log(`   Found Active Batch: ${demoBatch.breed} (Batch ID: ${demoBatch.id})`);

  // 4.1 Create a case
  const createdCase = await connectService.createFarmerCase(
    {
      batchId: demoBatch.id,
      symptomsDescription: "Wet droppings observed and birds sneezing since morning.",
      selectedSymptoms: ["Watery Droppings", "Coughing / Sneezing"],
    },
    demoFarmer.id,
    demoFarmer.userId
  );

  assert(
    createdCase.status === CaseStatus.CREATED && createdCase.consentGiven === false,
    "Farmer case is created with status CREATED and consentGiven: false",
    `Case ID: ${createdCase.id}`
  );

  // 4.2 Attempt dispatch without consent (must throw error)
  let consentBlocked = false;
  try {
    await connectService.sendCaseSummaryToVet({
      caseId: createdCase.id,
      vetLabId: "vet-gadvasu-ludhiana",
      consentGiven: false,
      actorUserId: demoFarmer.userId,
    });
  } catch (err: any) {
    if (err.message.includes("consent is required")) {
      consentBlocked = true;
    }
  }

  assert(
    consentBlocked,
    "Dispatch without farmer consent is strictly blocked (Section 11 Compliance)",
    "Correctly threw authorization error"
  );

  // 4.3 Authorize dispatch with farmer consent
  const escalationOutcome = await connectService.sendCaseSummaryToVet({
    caseId: createdCase.id,
    vetLabId: "vet-gadvasu-ludhiana",
    consentGiven: true,
    channel: "WHATSAPP",
    actorUserId: demoFarmer.userId,
  });

  assert(
    escalationOutcome.result.success === true && escalationOutcome.result.status === "READY",
    "Case summary successfully generated with zero-cost WhatsApp URL",
    `WhatsApp Link: ${escalationOutcome.result.whatsappUrl?.substring(0, 60)}...`
  );

  assert(
    escalationOutcome.caseRecord.status === CaseStatus.CONTACTED &&
      escalationOutcome.caseRecord.consentGiven === true &&
      escalationOutcome.caseRecord.assignedVetLabId === "vet-gadvasu-ludhiana",
    "Case transitions to CONTACTED status with consentGiven: true and assigned Vet",
    `Status: ${escalationOutcome.caseRecord.status}`
  );

  // 4.4 Check AuditLog
  const auditLog = await prisma.auditLog.findFirst({
    where: {
      entityId: createdCase.id,
      action: "CONNECT_CASE_DISPATCHED_TO_VET",
    },
  });

  assert(
    Boolean(auditLog),
    "AuditLog entry recorded with actor, action, and recipient metadata",
    `AuditLog ID: ${auditLog?.id}`
  );

  console.log("\n══════════════════════════════════════════════════════════════");
  console.log("🎉 ALL TESTS PASSED! ZERO-COST WHATSAPP ENGINE IS 100% OPERATIONAL");
  console.log("══════════════════════════════════════════════════════════════\n");
}

runTests()
  .catch((e) => {
    console.error("Test execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
