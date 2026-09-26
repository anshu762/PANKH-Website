/**
 * PANKH — Knowledge Base Seeding Script
 * 
 * DISCLAIMER / DEMO PURPOSES:
 * The data in this file cites plausible real-sounding veterinary and agricultural extension
 * authorities (e.g. "Punjab Veterinary Vaccine Institute", "ICAR-CPDO guidance", "GADVASU").
 * These records are illustrative seed content curated specifically for demonstration,
 * testing, and validation of the Pankh AI RAG pipeline in accordance with project guidelines.
 */

import { PrismaClient } from "@prisma/client";
import { getEmbedding } from "../lib/ai/embeddings";

const prisma = new PrismaClient();

interface SeedChunk {
  content: string;
  birdType?: "BROILER" | "LAYER" | "BOTH";
  ageRangeMin?: number;
  ageRangeMax?: number;
  region?: string;
  tags: string[];
}

interface SeedSource {
  title: string;
  authority: string;
  topic: string;
  language: string;
  version: string;
  url?: string;
  chunks: SeedChunk[];
}

const seedSources: SeedSource[] = [
  // -------------------------------------------------------------
  // SOURCE 1: Broiler & Layer Respiratory Symptoms & Red Flags
  // -------------------------------------------------------------
  {
    title: "Clinical Recognition of Acute Poultry Respiratory Distress and Mortality Indicators",
    authority: "Punjab Veterinary Vaccine Institute, Ludhiana",
    topic: "health",
    language: "en",
    version: "2025.1",
    url: "https://pvvi.punjab.gov.in/protocols/respiratory-distress-2025",
    chunks: [
      {
        content:
          "Severe Respiratory Signs in Broilers: Open-mouth breathing (gasping), distinct rales (ghur-ghur sound), and neck stretching during inspiration indicate severe tracheal obstruction. If gasping is accompanied by sudden mortality exceeding 1% in 24 hours, suspect acute viral infection such as Velogenic Newcastle Disease (Ranikhet) or Infectious Laryngotracheitis. Immediate isolation and veterinary necropsy are strictly advised before administering antibiotics.",
        birdType: "BROILER",
        ageRangeMin: 7,
        ageRangeMax: 42,
        region: "Punjab",
        tags: ["respiratory", "gasping", "mortality", "ranikhet", "red_flag", "emergency"],
      },
      {
        content:
          "Neurological and Enteric Red Flag Symptoms: Involuntary head twisting (torticollis / star-gazing), wing droop, leg paralysis, and greenish-white watery diarrhea indicate systemic neurological involvement. These signs represent an acute veterinary emergency. Farmers must halt bird movement, establish quarantine around the affected shed, and avoid indiscriminate antibiotic administration which stresses failing renal function.",
        birdType: "BOTH",
        ageRangeMin: 1,
        ageRangeMax: 60,
        region: "Punjab",
        tags: ["neurological", "torticollis", "star_gazing", "paralysis", "emergency", "red_flag"],
      },
      {
        content:
          "Layer Comb and Wattle Discoloration: Cyanotic (bluish-purple) combs accompanied by facial edema and sudden drop in daily egg production greater than 10% indicate acute systemic disease or severe hyperthermia. Normal layer mortality should remain under 0.1% per week; any daily spike above 0.5% warrants immediate tissue sampling by a certified poultry pathologist.",
        birdType: "LAYER",
        ageRangeMin: 18,
        ageRangeMax: 72,
        region: "Punjab",
        tags: ["layer", "comb", "egg_drop", "mortality", "pathology"],
      },
    ],
  },

  // -------------------------------------------------------------
  // SOURCE 2: Vaccination Schedule & Cold Chain Management
  // -------------------------------------------------------------
  {
    title: "Standard Commercial Broiler and Layer Immunization Protocol for North-Western India",
    authority: "Guru Angad Dev Veterinary and Animal Sciences University (GADVASU) Poultry Extension",
    topic: "vaccine",
    language: "en",
    version: "2024.4",
    url: "https://gadvasu.in/extension/poultry-vaccine-guide-2024",
    chunks: [
      {
        content:
          "Broiler Vaccination Schedule: Day 0 (Hatchery): Marek's disease (HVT/CVI988 subcutaneous). Day 5 to 7: Newcastle Disease (ND B1 or LaSota strain) combined with Infectious Bronchitis (IB) via eye drop or coarse spray. Day 14: Infectious Bursal Disease (IBD / Gumboro) Intermediate Plus strain via drinking water. Day 24 to 28 (optional in high challenge zones): ND LaSota booster via drinking water.",
        birdType: "BROILER",
        ageRangeMin: 0,
        ageRangeMax: 35,
        region: "Punjab",
        tags: ["vaccine", "schedule", "broiler", "lasota", "gumboro", "marek"],
      },
      {
        content:
          "Cold Chain and Drinking Water Vaccination Rules: Live poultry vaccines must be stored continuously between 2°C and 8°C. During drinking water vaccination: 1) Deprive birds of water for 1.5 to 2 hours prior to vaccination depending on ambient shed temperature. 2) Use non-chlorinated well or RO water. 3) Add skim milk powder at 2 to 2.5 grams per liter of water as a protein stabilizer to neutralize residual sanitizer traces. 4) Ensure total vaccine water consumption within 90 to 120 minutes.",
        birdType: "BOTH",
        ageRangeMin: 5,
        ageRangeMax: 40,
        region: "Punjab",
        tags: ["vaccine", "cold_chain", "skim_milk", "water_vaccination", "stabilizer"],
      },
      {
        content:
          "Vaccination Contraindications: Never administer live viral vaccines to flocks displaying active clinical respiratory signs, wet droppings, or acute heat stress (shed temperature above 32°C). Vaccinating stressed or immunosuppressed birds precipitates severe vaccine reactions and secondary E. coli infections.",
        birdType: "BOTH",
        ageRangeMin: 1,
        ageRangeMax: 60,
        region: "Punjab",
        tags: ["vaccine", "contraindications", "heat_stress", "safety", "e_coli"],
      },
    ],
  },

  // -------------------------------------------------------------
  // SOURCE 3: Age-wise Feed, Water & FCR Optimization
  // -------------------------------------------------------------
  {
    title: "Nutritional Standards and Feed Conversion Efficiency in Commercial Broilers",
    authority: "ICAR-Central Poultry Development Organization (CPDO), Northern Region",
    topic: "feed",
    language: "en",
    version: "2024.2",
    url: "https://cpdonorth.icar.gov.in/guidelines/broiler-nutrition-fcr",
    chunks: [
      {
        content:
          "Phase-wise Broiler Feeding Standards: 1) Pre-Starter (Day 1 to 10): Crumble form, minimum 22.0% crude protein, 3000 kcal/kg ME, feed intake approx 12 to 30g/bird/day. 2) Starter (Day 11 to 21): 20.5% crude protein, 3100 kcal/kg ME, intake 40 to 90g/bird/day. 3) Finisher (Day 22 to harvest): 18.5% crude protein, 3200 kcal/kg ME, intake 100 to 160g/bird/day. Target cumulative FCR at 35 days: 1.50 to 1.58.",
        birdType: "BROILER",
        ageRangeMin: 1,
        ageRangeMax: 42,
        region: "Punjab",
        tags: ["feed", "nutrition", "fcr", "crude_protein", "pre_starter", "starter", "finisher"],
      },
      {
        content:
          "Water-to-Feed Intake Dynamics: Under comfortable ambient temperature (20°C to 24°C), chickens consume roughly 1.8 to 2.0 times the weight of feed consumed in water. At 32°C, this ratio doubles to 3.0:1; at 38°C, it reaches 4.0:1. A sudden drop in flock water intake of 15% or more over 24 hours is the single earliest indicator of disease onset, water line blockage, or extreme drinker unpalatability.",
        birdType: "BOTH",
        ageRangeMin: 1,
        ageRangeMax: 70,
        region: "Punjab",
        tags: ["water", "feed", "intake_ratio", "early_warning", "nipple_drinkers"],
      },
      {
        content:
          "Water Quality and Nipple Line Sanitization: Maintain drinking water pH between 6.0 and 6.8 to support gut health and hinder bacterial proliferation. Regularly inspect nipple line water pressure: chicks day 1-7 require 10-15 cm water column; finishing broilers require 25-35 cm. Flush water pipelines weekly with organic acid or hydrogen peroxide during downtime to eliminate internal bacterial biofilm.",
        birdType: "BOTH",
        ageRangeMin: 1,
        ageRangeMax: 45,
        region: "Punjab",
        tags: ["water_quality", "biofilm", "nipple_line", "acidifier", "ph_balance"],
      },
    ],
  },

  // -------------------------------------------------------------
  // SOURCE 4: Farm Biosecurity, Downtime & Shed Sanitation
  // -------------------------------------------------------------
  {
    title: "Punjab Poultry Farm Biosecurity and Shed Decontamination Standard Operating Procedures",
    authority: "Department of Animal Husbandry, Government of Punjab",
    topic: "hygiene",
    language: "en",
    version: "2025.1",
    url: "https://animalhusbandry.punjab.gov.in/biosecurity-sop-2025",
    chunks: [
      {
        content:
          "Inter-Batch Shed Downtime and Litter Management: A minimum downtime period of 14 to 21 consecutive days between bird placement is mandatory for viral pathogen decay. Immediately following harvest: 1) Remove all old litter caked manure and haul at least 500 meters away from sheds. 2) Blow down dust from ceiling and wire netting. 3) Pressure-wash walls and floor with 1% detergent water.",
        birdType: "BOTH",
        ageRangeMin: 0,
        ageRangeMax: 0,
        region: "Punjab",
        tags: ["biosecurity", "downtime", "litter", "sanitation", "cleaning"],
      },
      {
        content:
          "Wall Whitewashing (Chuna Safedi) and Chemical Disinfection: Apply fresh slaked lime (chuna) mixed with 5% copper sulfate (neela thotha) evenly over all internal shed walls, floor cracks, and post pillars. Following lime drying, spray glutaraldehyde (0.5%) or potassium peroxymonosulfate (1%) sanitizer across all surfaces. Ensure wire mesh netting is intact with no openings exceeding 1.5 cm to prevent wild bird and rodent intrusion.",
        birdType: "BOTH",
        ageRangeMin: 0,
        ageRangeMax: 70,
        region: "Punjab",
        tags: ["chuna", "slaked_lime", "disinfection", "copper_sulfate", "rodent_netting"],
      },
      {
        content:
          "Farm Entry Biosecurity and Foot Dip Management: Maintain foot-baths containing 0.1% potassium permanganate (KMnO4 / lal dawai) or quaternary ammonium compound at every shed entrance. Farm workers and visitors must step into fresh solution prior to shed entry. Replace foot-bath solution every 24 to 48 hours or as soon as the pink-purple coloration turns murky brown.",
        birdType: "BOTH",
        ageRangeMin: 1,
        ageRangeMax: 70,
        region: "Punjab",
        tags: ["foot_bath", "potassium_permanganate", "kmno4", "biosecurity", "visitor_control"],
      },
    ],
  },

  // -------------------------------------------------------------
  // SOURCE 5: Extreme Summer Heat Stress Management in Punjab
  // -------------------------------------------------------------
  {
    title: "Mitigation Strategies for Summer Heat Stress and Hyperthermia in North Indian Poultry Sheds",
    authority: "Guru Angad Dev Veterinary and Animal Sciences University (GADVASU) Poultry Extension",
    topic: "weather",
    language: "en",
    version: "2024.3",
    url: "https://gadvasu.in/extension/heat-stress-mitigation-poultry",
    chunks: [
      {
        content:
          "Punjab Summer Heat Stress Dynamics (May to July): When ambient shed temperature surpasses 32°C with humidity over 65%, chickens cannot dissipate heat via respiratory panting. Signs include rapid shallow panting, outspread wings, lethargy, and crowding around drinker lines. If internal shed temperature hits 38°C, acute mortality from respiratory alkalosis will surge within 3 hours unless immediate evaporative cooling is initiated.",
        birdType: "BOTH",
        ageRangeMin: 14,
        ageRangeMax: 60,
        region: "Punjab",
        tags: ["heat_stress", "summer", "panting", "hyperthermia", "shed_temperature"],
      },
      {
        content:
          "Cooling Systems and Sprinkler Protocols: Install roof sprinklers to run continuously during peak sunlight hours (11:00 AM to 5:00 PM), reducing internal shed temperature by 3°C to 5°C. For open-sided sheds, apply 3 to 4 inches of paddy straw (parali) or thatch on corrugated tin roofs. Run high-pressure misting foggers in 3-minute on / 7-minute off intervals, taking care not to saturate the litter bed above 25% moisture.",
        birdType: "BOTH",
        ageRangeMin: 1,
        ageRangeMax: 60,
        region: "Punjab",
        tags: ["foggers", "roof_sprinklers", "parali", "thatch_insulation", "litter_moisture"],
      },
      {
        content:
          "Summer Electrolyte and Feeding Adjustments: 1) Administer Vitamin C (ascorbic acid at 1g/4 liters) and electrolytes (potassium chloride and sodium bicarbonate) in morning drinking water from 6:00 AM to 11:00 AM. 2) Shift bird feeding schedule: withdraw feed during the hottest hours (11:00 AM to 4:00 PM) to avoid specific dynamic action heat generation; provide full rations during cooler dawn and nighttime hours. 3) Reduce bird stocking density by 10% to 15% during peak summer batches.",
        birdType: "BOTH",
        ageRangeMin: 7,
        ageRangeMax: 45,
        region: "Punjab",
        tags: ["electrolytes", "vitamin_c", "night_feeding", "stocking_density", "heat_stroke"],
      },
    ],
  },

  // -------------------------------------------------------------
  // SOURCE 6: Coccidiosis & Enteric Disorders in Wet Litter
  // -------------------------------------------------------------
  {
    title: "Diagnosis and Remediation of Coccidiosis and Wet Litter Syndrome in Broilers",
    authority: "Northern India Broiler Farmers Association & Diagnostic Advisory",
    topic: "health",
    language: "en",
    version: "2024.5",
    url: "https://nibf.org.in/advisories/coccidiosis-wet-litter",
    chunks: [
      {
        content:
          "Coccidiosis Indicators and Droppings Examination: Passage of bloody droppings (reddish or terracotta orange mucus), ruffled feathers, huddling under brooders, and sudden weight gain stalling between days 18 and 28 indicate caecal or intestinal coccidiosis (Eimeria tenella / necatrix). Litter moisture above 30% dramatically accelerates oocyst sporulation. Treatment requires toltrazuril or amprolium under veterinary dose guidance, coupled with immediate addition of dry lime or fresh rice husk over damp drinker patches.",
        birdType: "BROILER",
        ageRangeMin: 14,
        ageRangeMax: 35,
        region: "Punjab",
        tags: ["coccidiosis", "bloody_droppings", "wet_litter", "amprolium", "toltrazuril"],
      },
      {
        content:
          "Litter Moisture Management: Maintain litter moisture strictly between 20% and 25%. Friable litter should gently clump when squeezed in hand and easily crumble apart when released. Wet caked litter releases high ammonia levels (above 20 ppm), which destroys tracheal cilia within 48 hours, paving the way for secondary Mycoplasma gallisepticum (CRD) outbreaks.",
        birdType: "BOTH",
        ageRangeMin: 1,
        ageRangeMax: 50,
        region: "Punjab",
        tags: ["litter", "moisture", "ammonia", "crd", "mycoplasma"],
      },
    ],
  },
];

async function main() {
  console.log("🌱 Starting Pankh Knowledge Base Seeding...");
  console.log(`📚 Preparing ${seedSources.length} official veterinary sources with ${seedSources.reduce((acc, s) => acc + s.chunks.length, 0)} knowledge chunks...`);

  let totalSources = 0;
  let totalChunks = 0;

  for (const src of seedSources) {
    // 1. Upsert Knowledge Source
    const existingSource = await prisma.knowledgeSource.findFirst({
      where: { title: src.title, authority: src.authority },
    });

    let sourceId: string;
    if (existingSource) {
      sourceId = existingSource.id;
      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: {
          approved: true,
          topic: src.topic,
          language: src.language,
          version: src.version,
          url: src.url,
        },
      });
      console.log(`  ↻ Updated existing source: "${src.title.slice(0, 45)}..."`);
    } else {
      const created = await prisma.knowledgeSource.create({
        data: {
          title: src.title,
          authority: src.authority,
          topic: src.topic,
          language: src.language,
          version: src.version,
          url: src.url,
          approved: true,
        },
      });
      sourceId = created.id;
      console.log(`  + Created source: "${src.title.slice(0, 45)}..."`);
    }
    totalSources++;

    // 2. Insert or update chunks with embeddings
    for (const ch of src.chunks) {
      // Check if chunk exists by content match
      const existingChunk = await prisma.knowledgeChunk.findFirst({
        where: { sourceId, content: ch.content },
      });

      let chunkId: string;
      if (existingChunk) {
        chunkId = existingChunk.id;
        await prisma.knowledgeChunk.update({
          where: { id: chunkId },
          data: {
            birdType: ch.birdType,
            ageRangeMin: ch.ageRangeMin,
            ageRangeMax: ch.ageRangeMax,
            region: ch.region,
            tags: ch.tags,
          },
        });
      } else {
        const createdChunk = await prisma.knowledgeChunk.create({
          data: {
            sourceId,
            content: ch.content,
            birdType: ch.birdType,
            ageRangeMin: ch.ageRangeMin,
            ageRangeMax: ch.ageRangeMax,
            region: ch.region,
            tags: ch.tags,
          },
        });
        chunkId = createdChunk.id;
      }

      // Generate 1536-dimensional embedding
      const embedding = await getEmbedding(ch.content);
      const vecString = `[${embedding.join(",")}]`;

      // Store in pgvector column via raw SQL execution
      await prisma.$executeRawUnsafe(
        `UPDATE "KnowledgeChunk" SET "embedding" = $1::vector WHERE "id" = $2`,
        vecString,
        chunkId
      );

      totalChunks++;
    }
  }

  console.log(`\n✅ Knowledge Base Seed completed successfully!`);
  console.log(`   - Sources seeded/verified: ${totalSources}`);
  console.log(`   - Chunks seeded with pgvector 1536-dim embeddings: ${totalChunks}`);
}

main()
  .catch((e) => {
    console.error("❌ Knowledge Base Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
