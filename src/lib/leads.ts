import "server-only";
import prisma from "./prisma";

/**
 * Idempotently saves a firm for a user.
 * Uses Prisma's upsert to prevent database constraint race conditions.
 */
export async function saveLead(userId: string, firmId: string) {
  return prisma.savedLead.upsert({
    where: {
      userId_firmId: {
        userId,
        firmId,
      },
    },
    update: {},
    create: {
      userId,
      firmId,
    },
  });
}

/**
 * Idempotently removes a saved lead for a user.
 * Uses deleteMany to avoid throwing errors if the lead is already unsaved.
 */
export async function unsaveLead(userId: string, firmId: string) {
  return prisma.savedLead.deleteMany({
    where: {
      userId,
      firmId,
    },
  });
}

/**
 * Returns a list of firm IDs saved by a specific user.
 */
export async function getSavedFirmIds(userId: string): Promise<string[]> {
  const records = await prisma.savedLead.findMany({
    where: {
      userId,
    },
    select: {
      firmId: true,
    },
  });
  return records.map((record) => record.firmId);
}

/**
 * Returns saved leads for a specific user, including full firm data,
 * ordered by the date saved (newest first). Optionally takes a limit parameter.
 */
export async function listSavedLeads(userId: string, limit?: number) {
  return prisma.savedLead.findMany({
    where: {
      userId,
    },
    include: {
      firm: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

/**
 * Returns the total count of saved leads for a specific user.
 */
export async function countSavedLeads(userId: string): Promise<number> {
  return prisma.savedLead.count({
    where: {
      userId,
    },
  });
}
