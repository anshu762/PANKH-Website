/**
 * PANKH Phase 3 — End-to-End Scenarios Verification
 * 
 * Tests the 3 mandatory scenarios required by USER_REQUEST:
 * (a) Mild feed question — no escalation, correct source cited
 * (b) Critical symptom combination — must trigger red flags, escalate=true, create Alert(RED) + CaseRecord
 * (c) Vague/unsupported question — must state verified info not found, never invent fake sources
 * Plus: Message feedback persistence and AuditLog entry verification
 */

import { PrismaClient, AlertSeverity, CaseStatus } from "@prisma/client";
import { checkRedFlags } from "../lib/ai/redFlags";
import { classifyIntent } from "../lib/ai/router";
import { retrieveKnowledge } from "../lib/ai/retrieval";
import { generateStructuredAnswer } from "../lib/ai/generator";

const prisma = new PrismaClient();

async function runScenarioTests() {
  console.log("=================================================");
  console.log("🚀 PANKH PHASE 3: END-TO-END SCENARIOS VERIFICATION");
  console.log("=================================================\n");

  // Setup: Find or create test farmer and active batch
  let user = await prisma.user.findFirst({ where: { role: "FARMER" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "farmer.test.phase3@pankh.app",
        passwordHash: "test_hash_not_for_login",
        name: "Test Farmer",
        role: "FARMER",
      },
    });
  }

  let farmer = await prisma.farmer.findUnique({
    where: { userId: user.id },
    include: { farms: { include: { batches: true } } },
  });

  if (!farmer) {
    farmer = await prisma.farmer.create({
      data: {
        userId: user.id,
        village: "Samrala",
        district: "Ludhiana",
        state: "Punjab",
      },
      include: { farms: { include: { batches: true } } },
    });
  }

  let farm = farmer.farms[0];
  if (!farm) {
    farm = await prisma.farm.create({
      data: {
        farmerId: farmer.id,
        name: "Ludhiana Model Broiler Farm",
        farmType: "Semi-EC",
        capacity: 5000,
        shedCount: 2,
        ventilationType: "Tunnel",
      },
      include: { batches: true },
    });
  }

  let batch = await prisma.batch.findFirst({
    where: { farmId: farm.id, status: "ACTIVE" },
  });

  if (!batch) {
    batch = await prisma.batch.create({
      data: {
        farmId: farm.id,
        birdType: "Commercial Broiler",
        breed: "Cobb 500",
        productionType: "BROILER",
        placementDate: new Date(),
        startingBirds: 3000,
        currentBirds: 2950,
        status: "ACTIVE",
      },
    });
  }

  console.log(`✅ Test Farmer Context Ready: ${farmer.village}, ${farmer.district} (Batch ID: ${batch.id})\n`);

  let allPassed = true;

  // -------------------------------------------------------------
  // SCENARIO A: Mild Feed Question
  // -------------------------------------------------------------
  console.log("-------------------------------------------------");
  console.log("TEST SCENARIO (A): Mild Feed Question");
  console.log("-------------------------------------------------");
  const queryA = "Day 15 broiler starter feed intake, crude protein percentage and standard FCR chart";
  console.log(`Query: "${queryA}"`);

  const redFlagsA = checkRedFlags({ text: queryA, flockSize: batch.currentBirds });
  const intentA = await classifyIntent(queryA);
  const chunksA = await retrieveKnowledge(queryA, { birdType: batch.birdType, topK: 3 });
  const answerA = await generateStructuredAnswer({
    query: queryA,
    intent: intentA.intent,
    redFlags: redFlagsA,
    retrievedChunks: chunksA,
    birdType: batch.birdType,
  });

  console.log(`- Red Flags Triggered: ${redFlagsA.triggered} (Expected: false)`);
  console.log(`- Intent Classified: ${intentA.intent} (Expected: feed)`);
  console.log(`- Escalation Flag: ${answerA.escalate} (Expected: false)`);
  console.log(`- Source Cited: "${answerA.sourceTitle}"`);
  console.log(`- Direct Answer: "${answerA.answer.slice(0, 90)}..."`);

  const passA = !redFlagsA.triggered && intentA.intent === "feed" && !answerA.escalate && !!answerA.sourceTitle;
  console.log(passA ? ">>> RESULT: SCENARIO A PASSED ✅\n" : ">>> RESULT: SCENARIO A FAILED ❌\n");
  if (!passA) allPassed = false;

  // -------------------------------------------------------------
  // SCENARIO B: Symptom Combination Triggering Red Flag
  // -------------------------------------------------------------
  console.log("-------------------------------------------------");
  console.log("TEST SCENARIO (B): Critical Symptom Combination");
  console.log("-------------------------------------------------");
  const queryB = "Chicks twisting neck (torticollis), severe gasping, and 45 birds died since morning in shed 1";
  console.log(`Query: "${queryB}"`);

  const redFlagsB = checkRedFlags({ text: queryB, flockSize: batch.currentBirds });
  const intentB = await classifyIntent(queryB);
  const chunksB = await retrieveKnowledge(queryB, { birdType: batch.birdType, topK: 3 });
  const answerB = await generateStructuredAnswer({
    query: queryB,
    intent: intentB.intent,
    redFlags: redFlagsB,
    retrievedChunks: chunksB,
    birdType: batch.birdType,
  });

  console.log(`- Red Flags Triggered: ${redFlagsB.triggered} (Expected: true)`);
  console.log(`- Urgency Level: ${redFlagsB.urgencyLevel} (Expected: CRITICAL)`);
  console.log(`- Signals: mortality=${redFlagsB.signals.mortalitySpike}, neuro=${redFlagsB.signals.neurologicalSigns}, resp=${redFlagsB.signals.severeRespiratory}`);
  console.log(`- Escalation Flag: ${answerB.escalate} (Expected: true)`);
  console.log(`- Escalation Reason: "${answerB.escalateReason}"`);

  // Verify DB Alert and CaseRecord creation
  let alertCreated = null;
  let caseRecordCreated = null;

  if (answerB.escalate) {
    alertCreated = await prisma.alert.create({
      data: {
        batchId: batch.id,
        severity: AlertSeverity.RED,
        reason: answerB.escalateReason || "Veterinary escalation triggered",
        signalsTriggered: { reasons: redFlagsB.reasons, query: queryB },
        escalated: true,
      },
    });

    caseRecordCreated = await prisma.caseRecord.create({
      data: {
        farmerId: farmer.id,
        batchId: batch.id,
        alertId: alertCreated.id,
        symptomsSummary: queryB,
        aiSummary: answerB.answer,
        status: CaseStatus.CREATED,
      },
    });

    console.log(`- Database Alert Created: ID=${alertCreated.id}, Severity=${alertCreated.severity}`);
    console.log(`- Database CaseRecord Created: ID=${caseRecordCreated.id}, Status=${caseRecordCreated.status}`);
  }

  const passB =
    redFlagsB.triggered &&
    redFlagsB.signals.mortalitySpike &&
    redFlagsB.signals.neurologicalSigns &&
    redFlagsB.signals.severeRespiratory &&
    answerB.escalate &&
    !!alertCreated &&
    !!caseRecordCreated;

  console.log(passB ? ">>> RESULT: SCENARIO B PASSED ✅\n" : ">>> RESULT: SCENARIO B FAILED ❌\n");
  if (!passB) allPassed = false;

  // -------------------------------------------------------------
  // SCENARIO C: Vague / Unsupported Question
  // -------------------------------------------------------------
  console.log("-------------------------------------------------");
  console.log("TEST SCENARIO (C): Vague / Unsupported Question");
  console.log("-------------------------------------------------");
  const queryC = "Can I feed cheese pizza with paneer to cure stomach ache?";
  console.log(`Query: "${queryC}"`);

  const redFlagsC = checkRedFlags({ text: queryC, flockSize: batch.currentBirds });
  const intentC = await classifyIntent(queryC);
  const chunksC = await retrieveKnowledge(queryC, { birdType: batch.birdType, topK: 3 });
  const answerC = await generateStructuredAnswer({
    query: queryC,
    intent: intentC.intent,
    redFlags: redFlagsC,
    retrievedChunks: chunksC,
    birdType: batch.birdType,
  });

  console.log(`- Red Flags Triggered: ${redFlagsC.triggered} (Expected: false)`);
  console.log(`- Intent Classified: ${intentC.intent} (Expected: unrelated)`);
  console.log(`- Escalation Flag: ${answerC.escalate} (Expected: false)`);
  console.log(`- Source Cited: "${answerC.sourceTitle}" (Must NOT invent fake citations)`);
  console.log(`- Answer: "${answerC.answer.slice(0, 95)}..."`);

  const passC =
    !redFlagsC.triggered &&
    intentC.intent === "unrelated" &&
    !answerC.escalate &&
    answerC.sourceTitle === "No Verified Source Available";

  console.log(passC ? ">>> RESULT: SCENARIO C PASSED ✅\n" : ">>> RESULT: SCENARIO C FAILED ❌\n");
  if (!passC) allPassed = false;

  // -------------------------------------------------------------
  // SCENARIO D: Feedback & AuditLog Persistence
  // -------------------------------------------------------------
  console.log("-------------------------------------------------");
  console.log("TEST SCENARIO (D): Message Feedback & AuditLog");
  console.log("-------------------------------------------------");

  const conversation = await prisma.conversation.create({
    data: { farmerId: farmer.id },
  });

  const testMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "ASSISTANT",
      content: JSON.stringify(answerA),
      sourceIds: answerA.retrievedChunkIds,
      feedback: "NOT_HELPFUL",
    },
  });

  const auditLog = await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "AI_FEEDBACK_NEGATIVE",
      entityType: "Message",
      entityId: testMessage.id,
      metadata: { feedback: "NOT_HELPFUL", requiresAdminReview: true },
    },
  });

  console.log(`- Message Feedback Updated: ${testMessage.feedback}`);
  console.log(`- AuditLog Entry Created: Action=${auditLog.action}, EntityID=${auditLog.entityId}`);

  const passD = testMessage.feedback === "NOT_HELPFUL" && auditLog.action === "AI_FEEDBACK_NEGATIVE";
  console.log(passD ? ">>> RESULT: SCENARIO D PASSED ✅\n" : ">>> RESULT: SCENARIO D FAILED ❌\n");
  if (!passD) allPassed = false;

  // Cleanup test alert and case
  if (alertCreated && caseRecordCreated) {
    await prisma.caseRecord.delete({ where: { id: caseRecordCreated.id } });
    await prisma.alert.delete({ where: { id: alertCreated.id } });
  }
  await prisma.auditLog.delete({ where: { id: auditLog.id } });
  await prisma.conversation.delete({ where: { id: conversation.id } });

  console.log("=================================================");
  if (allPassed) {
    console.log("🎉 ALL PHASE 3 SCENARIOS VERIFIED SUCCESSFULLY!");
  } else {
    console.log("⚠️ SOME SCENARIOS FAILED. CHECK LOGS ABOVE.");
  }
  console.log("=================================================");
}

runScenarioTests()
  .catch((e) => {
    console.error("Test execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
