import "server-only";
import prisma from "./prisma";
import { dedupeRecentSearches } from "../utils/recentSearches";

export type LogInput =
  | { type: "SEARCHED"; query: string }
  | { type: "SAVED"; firmId?: string | null; count?: number }
  | { type: "WON" | "LOST"; firmId: string };

/**
 * Logs a user activity. Best-effort execution wrapping in try/catch to never throw.
 */
export async function logActivity(userId: string, input: LogInput): Promise<void> {
  try {
    if (input.type === "SEARCHED") {
      await prisma.activity.create({
        data: {
          userId,
          type: "SEARCHED",
          query: input.query,
        },
      });
    } else if (input.type === "SAVED") {
      await prisma.activity.create({
        data: {
          userId,
          type: "SAVED",
          firmId: input.firmId || null,
          count: input.count || null,
        },
      });
    } else {
      await prisma.activity.create({
        data: {
          userId,
          type: input.type,
          firmId: input.firmId,
        },
      });
    }
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

/**
 * Returns recent activity entries for a user, including associated firm data, ordered by newest first.
 */
export async function getRecentActivity(userId: string, limit = 12) {
  return prisma.activity.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: {
      firm: true,
    },
  });
}

/**
 * Returns deduplicated recent search ZIP codes for a user, ordered by newest first.
 */
export async function getRecentSearches(userId: string, limit = 5): Promise<string[]> {
  const records = await prisma.activity.findMany({
    where: {
      userId,
      type: "SEARCHED",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    select: {
      query: true,
    },
  });

  const zips = records
    .map((record) => record.query)
    .filter((query): query is string => query !== null);

  return dedupeRecentSearches(zips, limit);
}

/**
 * Counts the user's WON activities in the last 7 days.
 */
export async function countWonThisWeek(userId: string): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return prisma.activity.count({
    where: {
      userId,
      type: "WON",
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });
}

