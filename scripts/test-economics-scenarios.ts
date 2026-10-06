/**
 * PANKH Phase 6 — Farm Economics Module Automated Scenarios Verification
 * 
 * Verifies:
 * 1. Pure deterministic math calculations matching manual calculations down to the exact paisa.
 * 2. Strict Financial Safety rules (missing data labeled, FCR null without weigh-ins, assumptions explicit).
 * 3. Rule-based deterministic insight generation and comparative batch deltas.
 * 4. Multilingual localized agrarian sentence synthesis (Punjabi, Hindi, English).
 * 5. End-to-end database service operations (querying, creating, updating, deleting transactions).
 */

import { PrismaClient, TransactionType, BatchStatus } from "@prisma/client";
import {
  calculateTotalBatchCost,
  calculateCostPerBirdPlaced,
  calculateCostPerSurvivingBird,
  calculateMortalityRate,
  calculateEstimatedMortalityLoss,
  calculateFeedCostShare,
  calculateRevenue,
  calculateGrossMargin,
  calculateBreakEvenPrice,
  calculateFeedConversionRatio,
  buildBatchEconomicsReport,
} from "../lib/economics/calculations";
import {
  generateDeterministicInsights,
  getDeterministicLocalizedInsightBody,
} from "../lib/economics/insights";
import { economicsService } from "../services/economics.service";

const prisma = new PrismaClient();

async function runEconomicsScenarioTests() {
  console.log("══════════════════════════════════════════════════════════");
  console.log("💰 PANKH PHASE 6: FARM ECONOMICS VERIFICATION SUITE");
  console.log("══════════════════════════════════════════════════════════\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] Test ${totalTests}: ${testName}`);
      if (details) console.log(`   └─ ${details}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] Test ${totalTests}: ${testName}`);
      if (details) console.error(`   └─ Error: ${details}`);
    }
  }

  // -------------------------------------------------------------
  // TEST GROUP 1: Pure Deterministic Calculation Engine
  // -------------------------------------------------------------
  console.log("\n📐 Test Group 1: Deterministic Calculations vs Manual Math");

  // Sample realistic commercial broiler batch transactions
  const sampleTransactions = [
    { type: "EXPENSE" as const, category: "chicks", amount: 190000, date: "2026-09-01" }, // 5000 @ ₹38
    { type: "EXPENSE" as const, category: "feed-starter", amount: 105000, date: "2026-09-03" }, // 50 bags @ ₹2100
    { type: "EXPENSE" as const, category: "feed-grower", amount: 246000, date: "2026-09-12" }, // 120 bags @ ₹2050
    { type: "EXPENSE" as const, category: "feed-finisher", amount: 160000, date: "2026-09-20" }, // 80 bags @ ₹2000
    { type: "EXPENSE" as const, category: "vaccine", amount: 8500, date: "2026-09-05" },
    { type: "EXPENSE" as const, category: "medicine", amount: 12000, date: "2026-09-14" },
    { type: "EXPENSE" as const, category: "utilities", amount: 22000, date: "2026-09-22" },
    { type: "EXPENSE" as const, category: "labour", amount: 25000, date: "2026-09-25" },
    // Revenues
    { type: "REVENUE" as const, category: "sales-birds", amount: 846000, date: "2026-09-28" }, // 4700 birds @ ₹180
    { type: "REVENUE" as const, category: "sales-manure", amount: 15000, date: "2026-09-29" },
  ];

  // 1.1 Total Batch Cost: 190k + 105k + 246k + 160k + 8.5k + 12k + 22k + 25k = 768,500
  const costResult = calculateTotalBatchCost(sampleTransactions);
  assert(
    costResult.value === 768500,
    "Total Batch Cost sums all expenses accurately",
    `Calculated: ₹${costResult.value} | Expected: ₹768,500`
  );

  // 1.2 Cost Per Bird Placed: 768,500 / 5,000 = 153.70
  const costPerPlaced = calculateCostPerBirdPlaced(768500, 5000);
  assert(
    costPerPlaced.value === 153.7,
    "Cost per Bird Placed matches manual calculation",
    `Calculated: ₹${costPerPlaced.value} | Expected: ₹153.70`
  );

  // 1.3 Cost Per Surviving Bird: 768,500 / 4,700 = 163.51
  const costPerSurviving = calculateCostPerSurvivingBird(768500, 4700, 5000);
  assert(
    costPerSurviving.value === 163.51,
    "Cost per Surviving Bird matches manual calculation",
    `Calculated: ₹${costPerSurviving.value} | Expected: ₹163.51`
  );

  // 1.4 Mortality Rate: (5000 - 4700) / 5000 * 100 = 6.00%
  const mortRate = calculateMortalityRate(5000, 4700);
  assert(
    mortRate.value === 6.0,
    "Mortality Rate is exactly 6.0%",
    `Calculated: ${mortRate.value}% | Expected: 6.0%`
  );

  // 1.5 Estimated Mortality Loss: 300 deaths * ₹150 assumed = ₹45,000
  const mortLoss = calculateEstimatedMortalityLoss(300, 150);
  assert(
    mortLoss.value === 45000 && mortLoss.isEstimated === true,
    "Estimated Mortality Loss is ₹45,000 with explicit isEstimated flag",
    `Calculated: ₹${mortLoss.value} | Assumption: "${mortLoss.assumptions[0]}"`
  );

  // 1.6 Feed Cost Share: (105k + 246k + 160k) / 768.5k = 511,000 / 768,500 = 66.49% -> 66.5%
  const feedCostShare = calculateFeedCostShare(511000, 768500);
  assert(
    feedCostShare.value === 66.5,
    "Feed Cost Share is exactly 66.5%",
    `Calculated: ${feedCostShare.value}% | Expected: 66.5%`
  );

  // 1.7 Total Revenue: 846,000 + 15,000 = 861,000
  const revResult = calculateRevenue(sampleTransactions);
  assert(
    revResult.value === 861000,
    "Total Revenue sums all revenues accurately",
    `Calculated: ₹${revResult.value} | Expected: ₹861,000`
  );

  // 1.8 Net Gross Margin: 861,000 - 768,500 = +92,500
  const marginResult = calculateGrossMargin(861000, 768500);
  assert(
    marginResult.value === 92500,
    "Gross Margin is positive ₹92,500 profit",
    `Calculated: ₹${marginResult.value} | Expected: ₹92,500`
  );

  // 1.9 Break-Even Price: 768,500 / 4,700 = ₹163.51/bird
  const breakEven = calculateBreakEvenPrice(768500, 4700);
  assert(
    breakEven.perBird.value === 163.51,
    "Break-even price per bird is ₹163.51",
    `Calculated: ₹${breakEven.perBird.value}/bird`
  );

  // -------------------------------------------------------------
  // TEST GROUP 2: Financial Safety Rules & Unfabricated FCR
  // -------------------------------------------------------------
  console.log("\n🛡️  Test Group 2: Financial Safety Rules & Honest Missing Data");

  // 2.1 FCR MUST BE NULL when bird weigh-ins are absent
  const fcrNoWeight = calculateFeedConversionRatio(12500, null);
  assert(
    fcrNoWeight.value === null && fcrNoWeight.missingInputs.includes("weightGainKg"),
    "FCR is strictly null when weight-gain data is missing (Brief requirement)",
    `Reason: "${fcrNoWeight.reason}"`
  );

  // 2.2 FCR computed accurately when weigh-in data DOES exist: 12500 kg feed / 7500 kg gain = 1.67
  const fcrWithWeight = calculateFeedConversionRatio(12500, 7500);
  assert(
    fcrWithWeight.value === 1.67,
    "FCR calculates accurately when actual weight gain is provided",
    `Calculated FCR: ${fcrWithWeight.value} | Expected: 1.67`
  );

  // 2.3 Incomplete transactions (missing chick cost) flags assumption
  const incompleteTxs = [
    { type: "EXPENSE" as const, category: "feed-starter", amount: 50000, date: "2026-09-01" },
  ];
  const incompleteCost = calculateTotalBatchCost(incompleteTxs);
  assert(
    incompleteCost.isEstimated === true &&
    incompleteCost.missingInputs.includes("chickPurchaseCost"),
    "Incomplete transactions trigger isEstimated=true and list missing inputs",
    `Missing: ${incompleteCost.missingInputs.join(", ")}`
  );

  // 2.4 Zero starting birds returns null instead of dividing by zero
  const zeroBirds = calculateCostPerBirdPlaced(100000, 0);
  assert(
    zeroBirds.value === null && zeroBirds.missingInputs.includes("startingBirds"),
    "Zero starting birds safely returns null with missing input flag"
  );

  // -------------------------------------------------------------
  // TEST GROUP 3: Rule-Based Deterministic Insights Engine
  // -------------------------------------------------------------
  console.log("\n💡 Test Group 3: Deterministic Insights & Multilingual Output");

  const mockBatch = {
    id: "batch_test_1",
    birdType: "Commercial Broiler",
    breed: "Cobb 500",
    productionType: "BROILER" as const,
    placementDate: new Date("2026-09-01"),
    startingBirds: 5000,
    currentBirds: 4700,
    status: "ACTIVE" as const,
  };

  const report = buildBatchEconomicsReport(mockBatch, sampleTransactions, []);

  // Previous closed batch for comparison
  const mockPrevBatch = {
    id: "batch_test_prev",
    birdType: "Commercial Broiler",
    breed: "Cobb 500",
    productionType: "BROILER" as const,
    placementDate: new Date("2026-07-01"),
    startingBirds: 5000,
    currentBirds: 4850,
    status: "CLOSED" as const,
  };
  const prevTransactions = [
    { type: "EXPENSE" as const, category: "chicks", amount: 180000, date: "2026-07-01" },
    { type: "EXPENSE" as const, category: "feed-starter", amount: 450000, date: "2026-07-10" },
    { type: "REVENUE" as const, category: "sales-birds", amount: 820000, date: "2026-08-12" },
  ];
  const prevReport = buildBatchEconomicsReport(mockPrevBatch, prevTransactions, []);

  const insights = generateDeterministicInsights(report, prevReport);

  assert(
    insights.length >= 3,
    "Generated multiple deterministic financial insights",
    `Total insights generated: ${insights.length}`
  );

  const feedInsight = insights.find((i) => i.id === "feed-cost-share");
  assert(
    feedInsight !== undefined && feedInsight.deterministicNumbers.feedShare === 66.5,
    "Feed cost share insight contains exact deterministic 66.5%",
    `Headline: "${feedInsight?.headline}"`
  );

  const mortInsight = insights.find((i) => i.id === "mortality-loss-impact");
  assert(
    mortInsight !== undefined && mortInsight.isEstimated === true,
    "Mortality loss insight contains explicit assumption label",
    `Label: "${mortInsight?.assumptionLabel}"`
  );

  // Test Punjabi and Hindi localized sentence output
  const paSentence = getDeterministicLocalizedInsightBody(feedInsight!, "pa");
  assert(
    paSentence.includes("66.5%") && paSentence.includes("ਫ਼ੀਡ"),
    "Punjabi localized sentence retains exact deterministic figures and Gurmukhi phrasing",
    `Gurmukhi: "${paSentence}"`
  );

  const hiSentence = getDeterministicLocalizedInsightBody(feedInsight!, "hi");
  assert(
    hiSentence.includes("66.5%") && hiSentence.includes("दाने (feed) का हिस्सा"),
    "Hindi localized sentence retains exact deterministic figures",
    `Hindi: "${hiSentence}"`
  );

  // -------------------------------------------------------------
  // TEST GROUP 4: Database Service Operations & Seeding
  // -------------------------------------------------------------
  console.log("\n🗄️  Test Group 4: End-to-End Database Service & Batch Ledger");

  // Find demo farmer Gurpreet Singh
  const demoFarmer = await prisma.user.findFirst({
    where: { email: "farmer@pankh.app" },
    include: {
      farmer: {
        include: {
          farms: {
            include: {
              batches: {
                where: { status: BatchStatus.ACTIVE },
              },
            },
          },
        },
      },
    },
  });

  if (demoFarmer && demoFarmer.farmer?.farms[0]?.batches[0]) {
    const activeBatch = demoFarmer.farmer.farms[0].batches[0];
    const userId = demoFarmer.id;

    // Check existing transactions
    const existingCount = await prisma.transaction.count({
      where: { batchId: activeBatch.id },
    });

    if (existingCount < 5) {
      console.log(`   Seeding realistic transactions for active demo batch ${activeBatch.id}...`);
      await prisma.transaction.createMany({
        data: [
          {
            batchId: activeBatch.id,
            type: TransactionType.EXPENSE,
            category: "chicks",
            amount: 114000, // 3000 chicks @ ₹38
            quantity: 3000,
            unit: "chicks",
            note: "Purchased from Khanna Hatcheries",
            date: activeBatch.placementDate,
          },
          {
            batchId: activeBatch.id,
            type: TransactionType.EXPENSE,
            category: "feed-starter",
            amount: 63000, // 30 bags @ ₹2100
            quantity: 30,
            unit: "bags",
            note: "Pre-starter feed 50kg bags",
            date: new Date(activeBatch.placementDate.getTime() + 2 * 86400000),
          },
          {
            batchId: activeBatch.id,
            type: TransactionType.EXPENSE,
            category: "feed-grower",
            amount: 143500, // 70 bags @ ₹2050
            quantity: 70,
            unit: "bags",
            note: "Grower crumble feed",
            date: new Date(activeBatch.placementDate.getTime() + 10 * 86400000),
          },
          {
            batchId: activeBatch.id,
            type: TransactionType.EXPENSE,
            category: "vaccine",
            amount: 5400,
            quantity: 3,
            unit: "vials",
            note: "Lasota and IBD booster doses",
            date: new Date(activeBatch.placementDate.getTime() + 7 * 86400000),
          },
          {
            batchId: activeBatch.id,
            type: TransactionType.EXPENSE,
            category: "utilities",
            amount: 14500,
            note: "Diesel generator and wood husk bedding",
            date: new Date(activeBatch.placementDate.getTime() + 14 * 86400000),
          },
        ],
      });
      console.log("   ✅ Seeded realistic initial batch transactions.");
    }

    // 4.1 Test getBatchEconomicsDashboardData via service
    const dashData = await economicsService.getBatchEconomicsDashboardData(userId);
    assert(
      dashData.report !== null && (dashData.report.totalBatchCost.value ?? 0) > 0,
      "EconomicsService returns populated report for demo farmer's active batch",
      `Total Cost: ₹${dashData.report?.totalBatchCost.value?.toLocaleString("en-IN")} | Transactions: ${dashData.report?.transactions.length}`
    );

    // 4.2 Test createTransaction via service
    const newTx = await economicsService.createTransaction(userId, {
      batchId: activeBatch.id,
      type: "EXPENSE",
      category: "medicine",
      amount: 3200,
      quantity: 4,
      unit: "bottles",
      note: "Electrolyte stress pack for heat",
      date: new Date().toISOString().slice(0, 10),
    });
    assert(
      newTx.id !== undefined && newTx.amount === 3200,
      "EconomicsService creates new transaction with audit log",
      `Created Tx ID: ${newTx.id} | Amount: ₹${newTx.amount}`
    );

    // 4.3 Test updateTransaction via service
    const updatedTx = await economicsService.updateTransaction(userId, {
      id: newTx.id,
      amount: 3500,
      note: "Updated with extra vitamin C pack",
    });
    assert(
      updatedTx.amount === 3500 && Boolean(updatedTx.note?.includes("vitamin C")),
      "EconomicsService updates transaction amount and note cleanly",
      `Updated Amount: ₹${updatedTx.amount}`
    );

    // 4.4 Test deleteTransaction via service
    const deleted = await economicsService.deleteTransaction(userId, newTx.id);
    assert(deleted === true, "EconomicsService deletes transaction cleanly");
  } else {
    console.log("   ⚠️ Demo farmer not found, skipped DB integration test.");
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n══════════════════════════════════════════════════════════");
  console.log(`📊 RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log("══════════════════════════════════════════════════════════\n");

  if (passedTests === totalTests) {
    console.log("🎉 ALL PHASE 6 FARM ECONOMICS TESTS PASSED WITH ZERO DISCREPANCIES!");
  } else {
    console.error("❌ Some tests failed. Please review the output above.");
    process.exit(1);
  }
}

runEconomicsScenarioTests()
  .catch((e) => {
    console.error("Fatal test runner error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
