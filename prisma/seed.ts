import { PrismaClient, Role, PreferredLanguage, ProductionType, BatchStatus, AlertSeverity } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_ALERT_RULES } from "../lib/sentinel/rules";
import { seedVetLabs } from "./seed-vetlab";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Pankh database seed (Phase 4: Sentinel)...");

  const adminEmail = "admin@pankh.app";
  const seedPassword =
    process.env.ADMIN_SEED_PASSWORD || "PankhAdmin2026!";

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(seedPassword, salt);

  // 1. Seed or Upsert Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
    create: {
      email: adminEmail,
      name: "Pankh Super Admin",
      passwordHash,
      role: Role.SUPER_ADMIN,
      preferredLanguage: PreferredLanguage.ENGLISH,
      phone: "9999999999",
    },
  });

  console.log(`✅ Super Admin configured: ${superAdmin.email} (Role: ${superAdmin.role})`);

  // 2. Seed Complete Sentinel Alert Rules (Admin Editable in Phase 7)
  const ruleEntries = [
    {
      name: "Daily Mortality Warning Rate (%)",
      thresholdKey: "MORTALITY_RATE_WARNING",
      thresholdValue: DEFAULT_ALERT_RULES.MORTALITY_RATE_WARNING,
    },
    {
      name: "Daily Mortality Urgent Rate (%)",
      thresholdKey: "MORTALITY_RATE_CRITICAL",
      thresholdValue: DEFAULT_ALERT_RULES.MORTALITY_RATE_CRITICAL,
    },
    {
      name: "Feed Intake Drop Warning (%)",
      thresholdKey: "FEED_DROP_WARNING_PERCENT",
      thresholdValue: DEFAULT_ALERT_RULES.FEED_DROP_WARNING_PERCENT,
    },
    {
      name: "Feed Intake Drop Urgent (%)",
      thresholdKey: "FEED_DROP_CRITICAL_PERCENT",
      thresholdValue: DEFAULT_ALERT_RULES.FEED_DROP_CRITICAL_PERCENT,
    },
    {
      name: "Water Intake Drop Warning (%)",
      thresholdKey: "WATER_DROP_WARNING_PERCENT",
      thresholdValue: DEFAULT_ALERT_RULES.WATER_DROP_WARNING_PERCENT,
    },
    {
      name: "Water Intake Drop Urgent (%)",
      thresholdKey: "WATER_DROP_CRITICAL_PERCENT",
      thresholdValue: DEFAULT_ALERT_RULES.WATER_DROP_CRITICAL_PERCENT,
    },
    {
      name: "Egg Production Drop Warning (%)",
      thresholdKey: "EGG_DROP_WARNING_PERCENT",
      thresholdValue: DEFAULT_ALERT_RULES.EGG_DROP_WARNING_PERCENT,
    },
    {
      name: "Egg Production Drop Urgent (%)",
      thresholdKey: "EGG_DROP_CRITICAL_PERCENT",
      thresholdValue: DEFAULT_ALERT_RULES.EGG_DROP_CRITICAL_PERCENT,
    },
    {
      name: "Shed High Temperature Alert (°C)",
      thresholdKey: "SHED_TEMP_HIGH_CELSIUS",
      thresholdValue: DEFAULT_ALERT_RULES.SHED_TEMP_HIGH_CELSIUS,
    },
    {
      name: "Shed Critical Heat Stress Limit (°C)",
      thresholdKey: "SHED_TEMP_CRITICAL_CELSIUS",
      thresholdValue: DEFAULT_ALERT_RULES.SHED_TEMP_CRITICAL_CELSIUS,
    },
    {
      name: "Risk Engine Weight: Mortality",
      thresholdKey: "WEIGHT_MORTALITY",
      thresholdValue: DEFAULT_ALERT_RULES.WEIGHT_MORTALITY,
    },
    {
      name: "Risk Engine Weight: Water Intake",
      thresholdKey: "WEIGHT_WATER",
      thresholdValue: DEFAULT_ALERT_RULES.WEIGHT_WATER,
    },
    {
      name: "Risk Engine Weight: Feed Intake",
      thresholdKey: "WEIGHT_FEED",
      thresholdValue: DEFAULT_ALERT_RULES.WEIGHT_FEED,
    },
    {
      name: "Risk Engine Weight: Physical Symptoms",
      thresholdKey: "WEIGHT_SYMPTOMS",
      thresholdValue: DEFAULT_ALERT_RULES.WEIGHT_SYMPTOMS,
    },
    {
      name: "Risk Engine Weight: Shed Environment",
      thresholdKey: "WEIGHT_ENVIRONMENT",
      thresholdValue: DEFAULT_ALERT_RULES.WEIGHT_ENVIRONMENT,
    },
    {
      name: "Composite Risk Score: Watch (Amber) Threshold",
      thresholdKey: "RISK_SCORE_AMBER_THRESHOLD",
      thresholdValue: DEFAULT_ALERT_RULES.RISK_SCORE_AMBER_THRESHOLD,
    },
    {
      name: "Composite Risk Score: Urgent (Red) Threshold",
      thresholdKey: "RISK_SCORE_RED_THRESHOLD",
      thresholdValue: DEFAULT_ALERT_RULES.RISK_SCORE_RED_THRESHOLD,
    },
  ];

  for (const rule of ruleEntries) {
    await prisma.alertRule.upsert({
      where: { thresholdKey: rule.thresholdKey },
      update: {
        thresholdValue: rule.thresholdValue,
        updatedBy: superAdmin.id,
      },
      create: {
        name: rule.name,
        thresholdKey: rule.thresholdKey,
        thresholdValue: rule.thresholdValue,
        editable: true,
        updatedBy: superAdmin.id,
      },
    });
  }

  console.log(`✅ Seeded ${ruleEntries.length} Sentinel Alert Rules.`);

  // 3. Seed Demo Farmer & Active Flock (for realistic rolling 7-day baseline)
  const demoFarmerEmail = "farmer@pankh.app";
  const demoFarmerUser = await prisma.user.upsert({
    where: { email: demoFarmerEmail },
    update: {
      passwordHash,
      role: Role.FARMER,
      name: "Gurpreet Singh",
      preferredLanguage: PreferredLanguage.PUNJABI,
      phone: "9876543210",
    },
    create: {
      email: demoFarmerEmail,
      name: "Gurpreet Singh",
      passwordHash,
      role: Role.FARMER,
      preferredLanguage: PreferredLanguage.PUNJABI,
      phone: "9876543210",
    },
  });

  let farmerRecord = await prisma.farmer.findUnique({
    where: { userId: demoFarmerUser.id },
  });

  if (!farmerRecord) {
    farmerRecord = await prisma.farmer.create({
      data: {
        userId: demoFarmerUser.id,
        village: "Samrala",
        district: "Ludhiana",
        state: "Punjab",
        consentDataShare: true,
      },
    });
  }

  let demoFarm = await prisma.farm.findFirst({
    where: { farmerId: farmerRecord.id },
  });

  if (!demoFarm) {
    demoFarm = await prisma.farm.create({
      data: {
        farmerId: farmerRecord.id,
        name: "Ludhiana Model Broiler Farm",
        farmType: "Semi-EC",
        capacity: 4000,
        shedCount: 2,
        ventilationType: "Tunnel",
      },
    });
  }

  // Active batch placed 21 days ago
  const placementDate = new Date();
  placementDate.setDate(placementDate.getDate() - 21);

  let activeBatch = await prisma.batch.findFirst({
    where: { farmId: demoFarm.id, status: BatchStatus.ACTIVE },
  });

  if (!activeBatch) {
    activeBatch = await prisma.batch.create({
      data: {
        farmId: demoFarm.id,
        birdType: "Commercial Broiler",
        breed: "Cobb 500",
        productionType: ProductionType.BROILER,
        placementDate,
        startingBirds: 3000,
        currentBirds: 2962,
        status: BatchStatus.ACTIVE,
      },
    });
  }

  // 4. Seed 7 Days of Historical Daily Health Logs (Rolling baseline)
  const existingLogsCount = await prisma.dailyHealthLog.count({
    where: { batchId: activeBatch.id },
  });

  if (existingLogsCount < 7) {
    console.log("📊 Seeding 7-day rolling baseline history for demo batch...");
    const baseMortality = [2, 1, 3, 2, 1, 2, 2];
    const baseFeedKg = [125, 128, 130, 133, 135, 138, 140];
    const baseWaterL = [250, 256, 260, 265, 270, 275, 280];
    const baseTemp = [29.5, 30.0, 31.0, 30.5, 29.8, 30.2, 31.5];

    for (let i = 7; i >= 1; i--) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - i);
      logDate.setHours(9, 30, 0, 0);

      const idx = 7 - i;
      await prisma.dailyHealthLog.create({
        data: {
          batchId: activeBatch.id,
          date: logDate,
          mortality: baseMortality[idx],
          feedKg: baseFeedKg[idx],
          waterLitres: baseWaterL[idx],
          shedTemp: baseTemp[idx],
          symptoms: [],
          notes: `Routine Day ${21 - i} check-in: flock active and healthy`,
          createdAt: logDate,
        },
      });
    }

    // Seed initial Normal Alert
    await prisma.alert.create({
      data: {
        batchId: activeBatch.id,
        severity: AlertSeverity.GREEN,
        reason: "All flock indicators (mortality, feed, water intake) remain within normal expected baseline limits.",
        signalsTriggered: {
          mortalityRate: 0.07,
          compositeScore: 4.2,
          hardRedFlag: false,
          confidence: "HIGH",
        },
        createdAt: new Date(),
      },
    });

    console.log("✅ Seeded 7 days of historical logs + baseline alert.");
  }

  // 4. Seed Punjab Vet, Lab & Association Directory
  await seedVetLabs(prisma);

  // 5. Seed Approved Standard Poultry Vaccination Schedules (Phase 8 Section 7.3)
  const existingSchedules = await prisma.vaccinationSchedule.count();
  if (existingSchedules === 0) {
    console.log("💉 Seeding standard approved poultry vaccination schedules...");
    const defaultSchedules = [
      {
        productionType: ProductionType.BROILER,
        dayDue: 1,
        vaccineName: "Marek's Disease Vaccine (HVT)",
        route: "Subcutaneous",
        diseaseTarget: "Marek's Disease",
        mandatory: true,
        notes: "Administered at hatchery on Day 1 of placement",
      },
      {
        productionType: ProductionType.BROILER,
        dayDue: 5,
        vaccineName: "Ranikhet (Newcastle) B1 Strain",
        route: "Eye drop / Coarse spray",
        diseaseTarget: "Newcastle Disease (ND)",
        mandatory: true,
        notes: "Give early morning in cool hours. Ensure clean, chlorine-free water.",
      },
      {
        productionType: ProductionType.BROILER,
        dayDue: 14,
        vaccineName: "Gumboro (IBD) Intermediate Strain",
        route: "Drinking water",
        diseaseTarget: "Infectious Bursal Disease",
        mandatory: true,
        notes: "Withhold water 1-2 hours prior. Add skim milk powder (2g/L) as stabilizer.",
      },
      {
        productionType: ProductionType.BROILER,
        dayDue: 21,
        vaccineName: "Ranikhet (Newcastle) LaSota Strain Booster",
        route: "Drinking water",
        diseaseTarget: "Newcastle Disease (ND)",
        mandatory: true,
        notes: "Second protection booster against field strains.",
      },
      {
        productionType: ProductionType.BROILER,
        dayDue: 28,
        vaccineName: "Gumboro (IBD) Booster Strain",
        route: "Drinking water",
        diseaseTarget: "Infectious Bursal Disease",
        mandatory: false,
        notes: "Recommended in high-density poultry corridors (Ludhiana, Sangrur).",
      },
      {
        productionType: ProductionType.LAYER,
        dayDue: 35,
        vaccineName: "Fowl Pox Vaccine",
        route: "Wing web puncture",
        diseaseTarget: "Avian Pox",
        mandatory: true,
        notes: "Check for 'take' swelling 7 days post-vaccination.",
      },
      {
        productionType: ProductionType.LAYER,
        dayDue: 70,
        vaccineName: "Infectious Coryza Inactivated",
        route: "Subcutaneous",
        diseaseTarget: "Infectious Coryza",
        mandatory: true,
        notes: "Protects against Avibacterium paragallinarum respiratory complex.",
      },
      {
        productionType: ProductionType.LAYER,
        dayDue: 112,
        vaccineName: "ND + EDS (Egg Drop Syndrome) Inactivated",
        route: "Intramuscular breast",
        diseaseTarget: "ND and Egg Drop Syndrome",
        mandatory: true,
        notes: "Given at 16 weeks before onset of commercial egg laying.",
      },
    ];

    for (const item of defaultSchedules) {
      await prisma.vaccinationSchedule.create({ data: item });
    }
    console.log(`✅ Seeded ${defaultSchedules.length} standard vaccination schedule items.`);
  }

  console.log("🌱 Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
