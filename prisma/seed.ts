import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma";
import { SEED_PROSPECTS } from "../src/data/prospects";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: Neither DIRECT_URL nor DATABASE_URL environment variables are defined.");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding...");

  for (const prospect of SEED_PROSPECTS) {
    console.log(`Upserting firm: ${prospect.firmName} (${prospect.id})`);
    
    const mappedFirm = {
      firmName: prospect.firmName,
      zip: prospect.zip,
      zipExt: prospect.zipExt || null,
      city: prospect.city,
      state: prospect.state,
      streetAddress: prospect.streetAddress || null,
      website: prospect.website || null,
      phone: prospect.phone || null,
      email: prospect.email || null,
      practiceAreas: prospect.practiceAreas || [],
      attorneyCountRange: prospect.attorneyCountRange,
      attorneys: prospect.attorneys || [],
      sourceType: prospect.sourceType,
      sourceUrl: prospect.sourceUrl || null,
      confidenceLevel: prospect.confidenceLevel,
      verificationStatus: prospect.verificationStatus,
      lastCheckedDate: prospect.lastCheckedDate ? new Date(prospect.lastCheckedDate) : null,
      globalNotes: prospect.globalNotes || null,
    };

    await prisma.firm.upsert({
      where: { id: prospect.id },
      update: mappedFirm,
      create: {
        id: prospect.id,
        ...mappedFirm,
      },
    });
  }

  console.log("Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


