import { PrismaClient, Role, PreferredLanguage } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Pankh database seed...");

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

  // 2. Seed Baseline Sentinel Alert Rules
  const defaultRules = [
    {
      name: "Daily Mortality Warning Rate (%)",
      thresholdKey: "MORTALITY_RATE_WARNING",
      thresholdValue: 0.5, // 0.5% daily mortality triggers AMBER
      editable: true,
      updatedBy: superAdmin.id,
    },
    {
      name: "Daily Mortality Urgent Rate (%)",
      thresholdKey: "MORTALITY_RATE_CRITICAL",
      thresholdValue: 1.0, // 1.0% daily mortality triggers RED
      editable: true,
      updatedBy: superAdmin.id,
    },
    {
      name: "Consecutive Feed Intake Drop (%)",
      thresholdKey: "FEED_DROP_WARNING_PERCENT",
      thresholdValue: 15.0, // 15% feed intake drop
      editable: true,
      updatedBy: superAdmin.id,
    },
    {
      name: "Shed High Temperature Alert (°C)",
      thresholdKey: "SHED_TEMP_HIGH_CELSIUS",
      thresholdValue: 34.0, // 34°C triggers heat stress alert
      editable: true,
      updatedBy: superAdmin.id,
    },
  ];

  for (const rule of defaultRules) {
    await prisma.alertRule.upsert({
      where: { thresholdKey: rule.thresholdKey },
      update: {
        thresholdValue: rule.thresholdValue,
        updatedBy: rule.updatedBy,
      },
      create: rule,
    });
  }

  console.log(`✅ Seeded ${defaultRules.length} Sentinel Alert Rules.`);
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
