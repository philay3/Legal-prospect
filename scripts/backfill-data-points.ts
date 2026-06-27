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

import { isUseful } from "../src/lib/research/sanitize";
import { classifyContact } from "../src/lib/research/evidence";
import prisma from "../src/lib/prisma";

async function main() {
  console.log("Starting contact data points backfill...");

  const firms = await prisma.firm.findMany({
    include: {
      dataPoints: true,
    },
  });

  console.log(`Found ${firms.length} firms to process.`);

  let emailSeeded = 0;
  let emailSkipped = 0;
  let phoneSeeded = 0;
  let phoneSkipped = 0;

  const now = new Date();

  for (const firm of firms) {
    // 1. Process email
    if (isUseful(firm.email)) {
      const emailVal = firm.email!.trim();
      const hasEmailDP = firm.dataPoints.some(
        (dp) => dp.field === "EMAIL" && dp.value.trim().toLowerCase() === emailVal.toLowerCase()
      );

      if (!hasEmailDP) {
        const classification = classifyContact("EMAIL", emailVal, {
          website: firm.website,
          sourceType: firm.sourceType,
        });

        const observedAt = firm.lastCheckedDate ?? firm.createdAt ?? now;

        await prisma.dataPoint.create({
          data: {
            firmId: firm.id,
            field: "EMAIL",
            value: emailVal,
            source: classification.source as any,
            confidence: classification.confidence,
            observedAt: observedAt,
          },
        });
        emailSeeded++;
      } else {
        emailSkipped++;
      }
    }

    // 2. Process phone
    if (isUseful(firm.phone)) {
      const phoneVal = firm.phone!.trim();
      const hasPhoneDP = firm.dataPoints.some(
        (dp) => dp.field === "PHONE" && dp.value.trim() === phoneVal
      );

      if (!hasPhoneDP) {
        const classification = classifyContact("PHONE", phoneVal, {
          website: firm.website,
          sourceType: firm.sourceType,
        });

        const observedAt = firm.lastCheckedDate ?? firm.createdAt ?? now;

        await prisma.dataPoint.create({
          data: {
            firmId: firm.id,
            field: "PHONE",
            value: phoneVal,
            source: classification.source as any,
            confidence: classification.confidence,
            observedAt: observedAt,
          },
        });
        phoneSeeded++;
      } else {
        phoneSkipped++;
      }
    }
  }

  console.log(`Backfill complete:`);
  console.log(`- Email: ${emailSeeded} seeded, ${emailSkipped} skipped`);
  console.log(`- Phone: ${phoneSeeded} seeded, ${phoneSkipped} skipped`);
}

main()
  .catch((e) => {
    console.error("Error during backfill:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
