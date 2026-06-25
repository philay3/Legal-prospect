import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: Neither DIRECT_URL nor DATABASE_URL environment variables are defined.");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const firms = await prisma.firm.findMany({
    select: {
      id: true,
      practiceAreas: true,
    },
  });

  const nonEmptyArrayCount = firms.filter(
    (f) => f.practiceAreas && Array.isArray(f.practiceAreas) && f.practiceAreas.length > 0
  ).length;

  const firmsWithLinksCount = await prisma.firm.count({
    where: {
      areaLinks: {
        some: {},
      },
    },
  });

  console.log(`--- COUNT RESULTS ---`);
  console.log(`Firms with non-empty practiceAreas array: ${nonEmptyArrayCount}`);
  console.log(`Firms with at least one FirmPracticeArea link: ${firmsWithLinksCount}`);
  console.log(`Difference (Firms needing backfilling): ${nonEmptyArrayCount - firmsWithLinksCount}`);
  console.log(`----------------------`);
}

main()
  .catch((e) => {
    console.error("Error checking counts:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
