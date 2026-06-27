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

let prisma: any;

// Use dynamic imports to ensure the server-only interception is in place before loading
async function main() {
  const { default: localPrisma } = await import("../src/lib/prisma");
  prisma = localPrisma;
  const { generateUniqueSlug } = await import("../src/lib/slug");

  console.log("Starting firm slugs backfill...");

  // Find all firms where slug is null
  const firmsToBackfill = await prisma.firm.findMany({
    where: {
      slug: null,
    },
  });

  console.log(`Found ${firmsToBackfill.length} firms without slugs.`);

  let updatedCount = 0;

  for (const firm of firmsToBackfill) {
    try {
      // Generate a unique slug code using the shared library function
      const slug = await generateUniqueSlug(prisma);

      await prisma.firm.update({
        where: { id: firm.id },
        data: { slug },
      });

      console.log(`Assigned slug "${slug}" to firm: "${firm.firmName}"`);
      updatedCount++;
    } catch (error) {
      console.error(`Failed to assign slug to firm "${firm.firmName}" (${firm.id}):`, error);
    }
  }

  console.log("Backfill complete:");
  console.log(`- Total firms processed: ${firmsToBackfill.length}`);
  console.log(`- Updated: ${updatedCount}`);
  console.log(`- Skipped (already have slugs): 0`);
}

main()
  .catch((e) => {
    console.error("Error during backfill:", e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
