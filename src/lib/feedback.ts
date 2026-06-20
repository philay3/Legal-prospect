import "server-only";
import prisma from "./prisma";

/**
 * Creates a new feedback entry in the database.
 */
export async function createFeedback({
  choice,
  message,
  userId,
}: {
  choice: string;
  message?: string | null;
  userId?: string | null;
}) {
  return prisma.feedback.create({
    data: {
      choice,
      message: message ?? null,
      userId: userId ?? null,
    },
  });
}
