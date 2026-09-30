/**
 * PANKH Phase 4 — Sentinel Module Automated Scenarios Verification
 *
 * Verifies:
 * 1. Rolling 7-day baseline engine (median, mean, variability, early-batch low confidence)
 * 2. Normal check-in -> GREEN severity
 * 3. Moderate deviation (18.5% feed drop) -> AMBER severity
 * 4. Sudden water plunge (44%) + red-flag symptom ("unusual deaths") -> forces RED with clear specific reason
 * 5. Missing water ("Don't know") -> does NOT produce false RED on its own
 * 6. End-to-end checkin process with auto-created CaseRecord & AuditLog notification stub
 * 7. Farmer action resolution ("Resolved", "Vet contacted") updating Alert & CaseRecord
 */

import { PrismaClient, AlertSeverity, CaseStatus } from "@prisma/client";
import { calculateBatchBaseline, calculateMetricBaseline } from "../lib/sentinel/baseline";
import { calculateRisk } from "../lib/sentinel/riskEngine";
import { DEFAULT_ALERT_RULES } from "../lib/sentinel/rules";
import { sentinelService } from "../services/sentinel.service";

const prisma = new PrismaClient();

async function runSentinelScenarioTests() {
  console.log("=================================================");
  console.log("🛡️  PANKH PHASE 4: SENTINEL SCENARIOS VERIFICATION");
  console.log("=================================================\n");

  let allPassed = true;

  // -------------------------------------------------------------
  // TEST 1: Pure Rolling Baseline Calculation
  // -------------------------------------------------------------
  console.log("-------------------------------------------------");
  console.log("TEST 1: Rolling 7-Day Baseline & Early-Batch Confidence");
  console.log("-------------------------------------------------");

  const sampleLogs = [
    { mortality: 2, feedKg: 135, waterLitres: 270, eggCount: null, shedTemp: 30, date: new Date("2026-09-27") },
    { mortality: 1, feedKg: 132, waterLitres: 265, eggCount: null, shedTemp: 30, date: new Date("2026-09-26") },
    { mortality: 3, feedKg: 130, waterLitres: 260, eggCount: null, shedTemp: 31, date: new Date("2026-09-25") },
    { mortality: 2, feedKg: 128, waterLitres: 258, eggCount: null, shedTemp: 29, date: new Date("2026-09-24") },
    { mortality: 1, feedKg: 126, waterLitres: 254, eggCount: null, shedTemp: 30, date: new Date("2026-09-23") },
    { mortality: 2, feedKg: 125, waterLitres: 250, eggCount: null, shedTemp: 29, date: new Date("2026-09-22") },
    { mortality: 2, feedKg: 122, waterLitres: 248, eggCount: null, shedTemp: 30, date: new Date("2026-09-21") },
  ];

  const fullBaseline = calculateBatchBaseline(sampleLogs);
  console.log(`- 7 Logs Available: Confidence=${fullBaseline.confidence} (Expected: HIGH)`);
  console.log(`- Feed Median: ${fullBaseline.feedKg?.median} kg (Expected: 128 kg)`);
  console.log(`- Water Median: ${fullBaseline.waterLitres?.median} L (Expected: 258 L)`);
  console.log(`- Mortality Mean: ${fullBaseline.mortality?.mean} (Expected: 1.86)`);

  const earlyLogs = sampleLogs.slice(0, 2);
  const earlyBaseline = calculateBatchBaseline(earlyLogs);
  console.log(`- 2 Logs Available: Confidence=${earlyBaseline.confidence} (Expected: LOW)`);
  console.log(`- Days Available: ${earlyBaseline.daysAvailable} (Expected: 2)`);

  const pass1 =
    fullBaseline.confidence === "HIGH" &&
    fullBaseline.feedKg?.median === 128 &&
    fullBaseline.waterLitres?.median === 258 &&
    earlyBaseline.confidence === "LOW" &&
    earlyBaseline.daysAvailable === 2;

  console.log(pass1 ? ">>> RESULT: TEST 1 PASSED ✅\n" : ">>> RESULT: TEST 1 FAILED ❌\n");
  if (!pass1) allPassed = false;

  // -------------------------------------------------------------
  // TEST 2: Normal Routine Check-in -> GREEN Severity
  // -------------------------------------------------------------
  console.log("-------------------------------------------------");
  console.log("TEST 2: Normal Routine Check-in");
  console.log("-------------------------------------------------");

  const normalLog = {
    mortality: 2,
    feedKg: 130,
    waterLitres: 260,
    symptoms: [],
    shedTemp: 30.0,
  };

  const normalBatch = {
    startingBirds: 3000,
    currentBirds: 2960,
    productionType: "BROILER",
    placementDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // Day 21
  };

  const riskNormal = calculateRisk(normalLog, fullBaseline, normalBatch, DEFAULT_ALERT_RULES);
  console.log(`- Risk Severity: ${riskNormal.severity} (Expected: GREEN)`);
  console.log(`- Hard Red Flag: ${riskNormal.signalsTriggered.hardRedFlag} (Expected: false)`);
  console.log(`- Composite Score: ${riskNormal.signalsTriggered.compositeScore}`);
  console.log(`- Primary Reason: "${riskNormal.reasons[0]}"`);

  const pass2 = riskNormal.severity === "GREEN" && !riskNormal.signalsTriggered.hardRedFlag;
  console.log(pass2 ? ">>> RESULT: TEST 2 PASSED ✅\n" : ">>> RESULT: TEST 2 FAILED ❌\n");
  if (!pass2) allPassed = false;

  // -------------------------------------------------------------
  // TEST 3: Moderate Feed Drop -> AMBER Severity
  // -------------------------------------------------------------
  console.log("-------------------------------------------------");
  console.log("TEST 3: Moderate Feed Drop (18.5% drop) + Symptom");
  console.log("-------------------------------------------------");

  const moderateLog = {
    mortality: 3,
    feedKg: 105, // Expected ~133 kg for Day 21 broilers -> ~21% drop
    waterLitres: 250,
    symptoms: ["cough/sneeze"],
    shedTemp: 31.0,
  };

  const riskModerate = calculateRisk(moderateLog, fullBaseline, normalBatch, DEFAULT_ALERT_RULES);
  console.log(`- Risk Severity: ${riskModerate.severity} (Expected: AMBER)`);
  console.log(`- Feed Deviation%: ${riskModerate.signalsTriggered.feedDeviationPercent}%`);
  console.log(`- Reasons Count: ${riskModerate.reasons.length}`);
  console.log(`- Reason 1: "${riskModerate.reasons[0]}"`);

  const pass3 =
    riskModerate.severity === "AMBER" &&
    typeof riskModerate.signalsTriggered.feedDeviationPercent === "number" &&
    riskModerate.signalsTriggered.feedDeviationPercent >= 15.0;

  console.log(pass3 ? ">>> RESULT: TEST 3 PASSED ✅\n" : ">>> RESULT: TEST 3 FAILED ❌\n");
  if (!pass3) allPassed = false;

  // -------------------------------------------------------------
  // TEST 4: Primary Required Test — Sudden Water Plunge + Red-Flag
  // -------------------------------------------------------------
  console.log("-------------------------------------------------");
  console.log("TEST 4: Primary Mandate — Water Plunge + Red-Flag Symptom");
  console.log("-------------------------------------------------");

  const urgentLog = {
    mortality: 18,
    feedKg: 100,
    waterLitres: 150, // 270L baseline -> ~44% plunge!
    symptoms: ["unusual deaths", "sleepy birds"],
    shedTemp: 33.5,
    notes: "Sudden flock mortality in north pen with high water refusal",
  };

  const riskUrgent = calculateRisk(urgentLog, fullBaseline, normalBatch, DEFAULT_ALERT_RULES);
  console.log(`- Risk Severity: ${riskUrgent.severity} (Expected: RED)`);
  console.log(`- Hard Red Flag Triggered: ${riskUrgent.signalsTriggered.hardRedFlag} (Expected: true)`);
  console.log(`- Water Drop Percent: ${riskUrgent.signalsTriggered.waterDeviationPercent}% (Expected: >40%)`);
  console.log(`- Diagnostic Reasons (${riskUrgent.reasons.length}):`);
  riskUrgent.reasons.forEach((r, i) => console.log(`   ${i + 1}. ${r}`));
  console.log(`- Action Recommendations (${riskUrgent.recommendations.length}):`);
  riskUrgent.recommendations.forEach((rec, i) => console.log(`   [Action] ${rec}`));

  const hasSpecificWaterReason = riskUrgent.reasons.some((r) =>
    r.toLowerCase().includes("water intake down")
  );
  const hasRedFlagReason = riskUrgent.reasons.some(
    (r) =>
      r.toLowerCase().includes("mortality") ||
      r.toLowerCase().includes("unusual deaths") ||
      r.toLowerCase().includes("emergency")
  );

  const pass4 =
    riskUrgent.severity === "RED" &&
    riskUrgent.signalsTriggered.hardRedFlag &&
    hasSpecificWaterReason &&
    hasRedFlagReason;

  console.log(pass4 ? ">>> RESULT: TEST 4 PASSED ✅\n" : ">>> RESULT: TEST 4 FAILED ❌\n");
  if (!pass4) allPassed = false;

  // -------------------------------------------------------------
  // TEST 5: Missing Water ("Don't know") Must NOT Trigger RED Alone
  // -------------------------------------------------------------
  console.log("-------------------------------------------------");
  console.log("TEST 5: Missing Water Field ('Don't Know') Non-Blocking");
  console.log("-------------------------------------------------");

  const missingWaterLog = {
    mortality: 1,
    feedKg: 130,
    waterLitres: null,
    waterUnknown: true,
    symptoms: [],
    shedTemp: 29.5,
  };

  const riskMissingWater = calculateRisk(missingWaterLog, fullBaseline, normalBatch, DEFAULT_ALERT_RULES);
  console.log(`- Risk Severity: ${riskMissingWater.severity} (Expected: GREEN)`);
  console.log(`- Water Score Points: ${riskMissingWater.signalsTriggered.scoreBreakdown.water} (Expected: 0)`);

  const pass5 =
    riskMissingWater.severity === "GREEN" &&
    riskMissingWater.signalsTriggered.scoreBreakdown.water === 0;

  console.log(pass5 ? ">>> RESULT: TEST 5 PASSED ✅\n" : ">>> RESULT: TEST 5 FAILED ❌\n");
  if (!pass5) allPassed = false;

  // -------------------------------------------------------------
  // TEST 6: End-to-End API / Service Check-in & Auto-Escalation
  // -------------------------------------------------------------
  console.log("-------------------------------------------------");
  console.log("TEST 6: End-to-End Database Check-in & Auto-Escalation");
  console.log("-------------------------------------------------");

  // Load demo farmer
  const demoFarmer = await prisma.user.findFirst({
    where: { email: "farmer@pankh.app" },
    include: {
      farmer: {
        include: {
          farms: {
            include: {
              batches: {
                where: { status: "ACTIVE" },
              },
            },
          },
        },
      },
    },
  });

  if (!demoFarmer || !demoFarmer.farmer?.farms[0]?.batches[0]) {
    console.error("Demo farmer or batch missing. Run seed script first.");
    process.exit(1);
  }

  const batchBefore = demoFarmer.farmer.farms[0].batches[0];
  const birdsBefore = batchBefore.currentBirds;

  // Process checkin with urgent payload
  const checkinResult = await sentinelService.processCheckin(demoFarmer.id, {
    mortality: 15,
    feedKg: 110,
    feedUnit: "KG",
    waterLitres: 160,
    symptoms: ["unusual deaths", "cough/sneeze"],
    shedTemp: 32.0,
    notes: "E2E Test Check-in: Sudden mortalities and drop in water",
  });

  console.log(`- Created DailyHealthLog: ID=${checkinResult.log.id}, Mortality=${checkinResult.log.mortality}`);
  console.log(`- Created Alert: ID=${checkinResult.alert.id}, Severity=${checkinResult.alert.severity}`);
  console.log(`- Auto-Created CaseRecord: ID=${checkinResult.caseRecord?.id}, Status=${checkinResult.caseRecord?.status}`);

  // Verify living flock count decremented
  const batchAfter = await prisma.batch.findUnique({
    where: { id: batchBefore.id },
  });
  console.log(`- Flock Birds: Before=${birdsBefore}, After=${batchAfter?.currentBirds} (Expected: ${birdsBefore - 15})`);

  // Verify AuditLog notification stub
  const auditEntry = await prisma.auditLog.findFirst({
    where: {
      entityType: "CaseRecord",
      entityId: checkinResult.caseRecord?.id,
    },
  });
  console.log(`- AuditLog Stub: Action=${auditEntry?.action} (Expected: SENTINEL_RED_ALERT_ESCALATION)`);

  const pass6 =
    checkinResult.alert.severity === AlertSeverity.RED &&
    !!checkinResult.caseRecord &&
    checkinResult.caseRecord.status === CaseStatus.CREATED &&
    batchAfter?.currentBirds === birdsBefore - 15 &&
    auditEntry?.action === "SENTINEL_RED_ALERT_ESCALATION";

  console.log(pass6 ? ">>> RESULT: TEST 6 PASSED ✅\n" : ">>> RESULT: TEST 6 FAILED ❌\n");
  if (!pass6) allPassed = false;

  // -------------------------------------------------------------
  // TEST 7: Farmer Action Resolution ("Resolved" & "Vet Contacted")
  // -------------------------------------------------------------
  console.log("-------------------------------------------------");
  console.log("TEST 7: Farmer Alert Actions & Case Status Sync");
  console.log("-------------------------------------------------");

  const alertId = checkinResult.alert.id;

  // Action: VET_CONTACTED
  const updateVet = await sentinelService.handleFarmerAction(
    demoFarmer.id,
    alertId,
    "VET_CONTACTED",
    "Spoke with Dr. Harpreet GADVASU"
  );
  const caseAfterVet = await prisma.caseRecord.findFirst({
    where: { alertId },
  });
  console.log(`- Action 'VET_CONTACTED': Alert Acknowledged=${updateVet.acknowledged}, CaseStatus=${caseAfterVet?.status} (Expected: CONTACTED)`);

  // Action: RESOLVED
  const updateResolved = await sentinelService.handleFarmerAction(
    demoFarmer.id,
    alertId,
    "RESOLVED",
    "Water line unblocked, flock recovered"
  );
  const caseAfterResolved = await prisma.caseRecord.findFirst({
    where: { alertId },
  });
  console.log(`- Action 'RESOLVED': Alert Acknowledged=${updateResolved.acknowledged}, CaseStatus=${caseAfterResolved?.status} (Expected: RESOLVED)`);

  const pass7 =
    updateVet.acknowledged === true &&
    caseAfterVet?.status === CaseStatus.CONTACTED &&
    caseAfterResolved?.status === CaseStatus.RESOLVED;

  console.log(pass7 ? ">>> RESULT: TEST 7 PASSED ✅\n" : ">>> RESULT: TEST 7 FAILED ❌\n");
  if (!pass7) allPassed = false;

  // -------------------------------------------------------------
  // Clean up test check-in data so seed remains baseline
  // -------------------------------------------------------------
  console.log("🧹 Cleaning up test artifacts...");
  if (checkinResult.caseRecord) {
    await prisma.auditLog.deleteMany({
      where: { entityType: "CaseRecord", entityId: checkinResult.caseRecord.id },
    });
    await prisma.caseRecord.delete({ where: { id: checkinResult.caseRecord.id } });
  }
  await prisma.auditLog.deleteMany({
    where: { entityType: "Alert", entityId: alertId },
  });
  await prisma.alert.delete({ where: { id: alertId } });
  await prisma.dailyHealthLog.delete({ where: { id: checkinResult.log.id } });
  // Restore bird count
  await prisma.batch.update({
    where: { id: batchBefore.id },
    data: { currentBirds: birdsBefore },
  });
  console.log("✅ Cleanup complete.\n");

  console.log("=================================================");
  if (allPassed) {
    console.log("🎉 ALL PHASE 4 SENTINEL SCENARIOS VERIFIED SUCCESSFULLY!");
  } else {
    console.log("⚠️ SOME SENTINEL SCENARIOS FAILED. CHECK LOGS ABOVE.");
  }
  console.log("=================================================");
}

runSentinelScenarioTests()
  .catch((e) => {
    console.error("Test execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
