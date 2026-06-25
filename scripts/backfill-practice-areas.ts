import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma";
import { normalizePracticeAreas, toCanonicalPracticeArea } from "../src/lib/research/sanitize";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: Neither DIRECT_URL nor DATABASE_URL environment variables are defined.");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting practice areas backfill...");

  // 1. Fetch all firms with their practiceAreas arrays
  const firms = await prisma.firm.findMany({
    select: {
      id: true,
      firmName: true,
      practiceAreas: true,
    },
  });

  const firmsToProcess = firms.filter(
    (f) => f.practiceAreas && Array.isArray(f.practiceAreas) && f.practiceAreas.length > 0
  );

  console.log(`Found ${firmsToProcess.length} firms with practice areas to process.`);

  // 2. Gather all unique canonical practice area names
  const allCanonicalNames = new Set<string>();
  const firmPracticeAreasMap = new Map<string, string[]>();

  for (const firm of firmsToProcess) {
    const normalized = normalizePracticeAreas(firm.practiceAreas);
    const canonical = normalized.map(toCanonicalPracticeArea);
    if (canonical.length > 0) {
      firmPracticeAreasMap.set(firm.id, canonical);
      for (const name of canonical) {
        allCanonicalNames.add(name);
      }
    }
  }

  const uniqueNames = Array.from(allCanonicalNames);
  console.log(`Identified ${uniqueNames.length} unique canonical practice areas.`);

  // 3. Upsert each name into PracticeArea table
  if (uniqueNames.length > 0) {
    await prisma.practiceArea.createMany({
      data: uniqueNames.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }

  // 4. Retrieve all practice areas to map names to IDs
  const dbPracticeAreas = await prisma.practiceArea.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const areaIdByName = new Map<string, string>();
  for (const pa of dbPracticeAreas) {
    areaIdByName.set(pa.name.toLowerCase(), pa.id);
  }

  // 5. Construct FirmPracticeArea links
  const linksToCreate: { firmId: string; practiceAreaId: string }[] = [];
  let processedFirmsCount = 0;

  for (const [firmId, areaNames] of firmPracticeAreasMap.entries()) {
    processedFirmsCount++;
    for (const name of areaNames) {
      const practiceAreaId = areaIdByName.get(name.toLowerCase());
      if (practiceAreaId) {
        linksToCreate.push({
          firmId,
          practiceAreaId,
        });
      }
    }
  }

  // 6. Insert links with skipDuplicates
  let linksCreatedCount = 0;
  if (linksToCreate.length > 0) {
    const result = await prisma.firmPracticeArea.createMany({
      data: linksToCreate,
      skipDuplicates: true,
    });
    linksCreatedCount = result.count;
  }

  console.log(`Backfill complete:`);
  console.log(`- Firms processed: ${processedFirmsCount}`);
  console.log(`- FirmPracticeArea links created: ${linksCreatedCount}`);
}

main()
  .catch((e) => {
    console.error("Error during backfill:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
