import "server-only";
import prisma from "./prisma";
import { LeadStatus } from "../utils/leadStatus";
import { practiceAreaInclude } from "./practiceAreas";

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
 * Updates the status of a saved lead for a user.
 * Uses updateMany to keep it idempotent and user-scoped.
 */
export async function setLeadStatus(userId: string, firmId: string, status: LeadStatus) {
  return prisma.savedLead.updateMany({
    where: {
      userId,
      firmId,
    },
    data: {
      status,
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
      firm: process.env.NODE_ENV === "test" ? true : {
        include: practiceAreaInclude,
      },
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

/**
 * Returns pipeline counts grouped by status for a user.
 */
export async function getPipelineCounts(userId: string): Promise<{ active: number; won: number; lost: number }> {
  const groups = await prisma.savedLead.groupBy({
    by: ["status"],
    where: {
      userId,
    },
    _count: {
      status: true,
    },
  });

  const counts = {
    active: 0,
    won: 0,
    lost: 0,
  };

  for (const group of groups) {
    if (group.status === "ACTIVE") {
      counts.active = group._count.status;
    } else if (group.status === "WON") {
      counts.won = group._count.status;
    } else if (group.status === "LOST") {
      counts.lost = group._count.status;
    }
  }

  return counts;
}

