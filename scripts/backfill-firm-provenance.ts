import "dotenv/config";
import { pickCurrentBest } from "../src/lib/research/evidence";
import prisma from "../src/lib/prisma";

async function main() {
  console.log("Starting firm contact provenance backfill...");

  const firms = await prisma.firm.findMany({
    include: {
      dataPoints: true,
    },
  });

  console.log(`Found ${firms.length} firms to check.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const firm of firms) {
    const emailPoints = firm.dataPoints.filter((dp) => dp.field === "EMAIL");
    const phonePoints = firm.dataPoints.filter((dp) => dp.field === "PHONE");

    const bestEmail = pickCurrentBest(emailPoints);
    const bestPhone = pickCurrentBest(phonePoints);

    const updatePayload: any = {};

    if (bestEmail) {
      if (
        firm.emailSource !== bestEmail.source ||
        firm.emailConfidence !== bestEmail.confidence
      ) {
        updatePayload.emailSource = bestEmail.source;
        updatePayload.emailConfidence = bestEmail.confidence;
      }
    }

    if (bestPhone) {
      if (
        firm.phoneSource !== bestPhone.source ||
        firm.phoneConfidence !== bestPhone.confidence
      ) {
        updatePayload.phoneSource = bestPhone.source;
        updatePayload.phoneConfidence = bestPhone.confidence;
      }
    }

    if (Object.keys(updatePayload).length > 0) {
      await prisma.firm.update({
        where: { id: firm.id },
        data: updatePayload,
      });
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log("Backfill complete:");
  console.log(`- Total firms processed: ${firms.length}`);
  console.log(`- Updated: ${updatedCount}`);
  console.log(`- Skipped (already correct): ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error("Error during backfill:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
