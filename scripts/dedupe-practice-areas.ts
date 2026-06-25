import "dotenv/config";
import Module from "module";

// Intercept and mock 'server-only' to prevent it from throwing in a CLI/non-Next context
const originalLoad = (Module as any)._load;
(Module as any)._load = function (request: string, parent: any, isMain: boolean) {
  if (request === "server-only") {
    return {};
  }
  return originalLoad.apply(this, arguments);
};

import { normalizePracticeAreas, toCanonicalPracticeArea } from "../src/lib/research/sanitize";
import prisma from "../src/lib/prisma";


function canonicalNameOf(name: string): string {
  const normalized = normalizePracticeAreas([name])[0];
  return toCanonicalPracticeArea(normalized || name);
}

async function main() {
  console.log("Starting practice areas deduplication...");

  // 1. Fetch before state
  const practiceAreasBefore = await prisma.practiceArea.findMany({
    include: {
      firmLinks: true,
    },
  });

  const totalLinksBefore = await prisma.firmPracticeArea.count();
  
  const nonCanonicalCountBefore = practiceAreasBefore.filter(
    (pa) => pa.name !== canonicalNameOf(pa.name)
  ).length;

  const activeNonCanonicalCountBefore = practiceAreasBefore.filter(
    (pa) => pa.name !== canonicalNameOf(pa.name) && pa.firmLinks.length > 0
  ).length;

  console.log("Initial Metrics:");
  console.log(`- Total FirmPracticeArea links: ${totalLinksBefore}`);
  console.log(`- Total non-canonical PracticeArea rows: ${nonCanonicalCountBefore}`);
  console.log(`- Active non-canonical PracticeArea rows: ${activeNonCanonicalCountBefore}`);

  // 2. Group by canonical name
  const groups = new Map<string, typeof practiceAreasBefore>();
  for (const pa of practiceAreasBefore) {
    const canonical = canonicalNameOf(pa.name);
    if (!groups.has(canonical)) {
      groups.set(canonical, []);
    }
    groups.get(canonical)!.push(pa);
  }

  // 3. Process each canonical group
  for (const [canonicalName, group] of groups.entries()) {
    if (group.length <= 1) continue;

    console.log(`\nProcessing group for canonical name: "${canonicalName}" (${group.length} variants found)`);

    // Pick keeper (the one whose name is exactly canonicalName)
    const keeper = group.find((pa) => pa.name === canonicalName);
    let keeperId: string;

    if (!keeper) {
      console.log(`- Keeper row "${canonicalName}" not found. Creating it.`);
      const newKeeper = await prisma.practiceArea.create({
        data: { name: canonicalName },
      });
      keeperId = newKeeper.id;
    } else {
      console.log(`- Keeper row found (ID: ${keeper.id})`);
      keeperId = keeper.id;
    }

    const nonKeepers = group.filter((pa) => pa.id !== keeperId);
    const nonKeeperLinks = nonKeepers.flatMap((pa) => pa.firmLinks);
    const firmIdsToLink = Array.from(new Set(nonKeeperLinks.map((l) => l.firmId)));

    console.log(`- Non-keeper variants: ${nonKeepers.map((nk) => `"${nk.name}"`).join(", ")}`);
    console.log(`- Firms to link to keeper: ${firmIdsToLink.length}`);

    if (firmIdsToLink.length > 0) {
      // Create new links for the keeper with skipDuplicates: true
      const createRes = await prisma.firmPracticeArea.createMany({
        data: firmIdsToLink.map((firmId) => ({
          firmId,
          practiceAreaId: keeperId,
        })),
        skipDuplicates: true,
      });
      console.log(`- Created/verified ${createRes.count} links to keeper.`);
    }

    // Delete non-keeper links
    const nonKeeperIds = nonKeepers.map((pa) => pa.id);
    if (nonKeeperIds.length > 0) {
      const deleteRes = await prisma.firmPracticeArea.deleteMany({
        where: {
          practiceAreaId: {
            in: nonKeeperIds,
          },
        },
      });
      console.log(`- Deleted ${deleteRes.count} links associated with non-keeper variants.`);
    }
  }

  // 4. Fetch after state
  const practiceAreasAfter = await prisma.practiceArea.findMany({
    include: {
      firmLinks: true,
    },
  });

  const totalLinksAfter = await prisma.firmPracticeArea.count();
  
  const nonCanonicalCountAfter = practiceAreasAfter.filter(
    (pa) => pa.name !== canonicalNameOf(pa.name)
  ).length;

  const activeNonCanonicalCountAfter = practiceAreasAfter.filter(
    (pa) => pa.name !== canonicalNameOf(pa.name) && pa.firmLinks.length > 0
  ).length;

  console.log("\nPost-Deduplication Metrics:");
  console.log(`- Total FirmPracticeArea links: Before = ${totalLinksBefore}, After = ${totalLinksAfter}`);
  console.log(`- Non-canonical PracticeArea rows: Before = ${nonCanonicalCountBefore}, After = ${nonCanonicalCountAfter}`);
  console.log(`- Active non-canonical PracticeArea rows (should be 0): Before = ${activeNonCanonicalCountBefore}, After = ${activeNonCanonicalCountAfter}`);
}

main()
  .catch((e) => {
    console.error("Error during deduplication:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
