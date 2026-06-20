import "server-only";
import prisma from "../prisma";
import { sha256 } from "./crypto";

/**
 * Finds an active user by their email address.
 */
export async function findActiveUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: {
      email,
      isActive: true,
    },
  });
}

/**
 * Finds an existing user (regardless of isActive) or creates a new one with isActive: true.
 * Uses atomic upsert with an empty update block to avoid race conditions.
 */
export async function findOrCreateActiveUserByEmail(email: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      isActive: true,
    },
  });
}

/**
 * Counts the number of login codes created for an email address since a given timestamp.
 */
export async function countRecentCodes(email: string, since: Date) {
  return prisma.loginCode.count({
    where: {
      email,
      createdAt: {
        gte: since,
      },
    },
  });
}

/**
 * Creates a login code record.
 */
export async function createLoginCode(email: string, codeHash: string, expiresAt: Date) {
  return prisma.loginCode.create({
    data: {
      email,
      codeHash,
      expiresAt,
    },
  });
}

/**
 * Finds the latest unused login code for an email address.
 */
export async function findLatestUnusedCode(email: string) {
  return prisma.loginCode.findFirst({
    where: {
      email,
      usedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Marks a login code as used.
 */
export async function markCodeUsed(id: string) {
  return prisma.loginCode.update({
    where: { id },
    data: {
      usedAt: new Date(),
    },
  });
}

/**
 * Increments the attempt count of a login code.
 */
export async function incrementCodeAttempt(id: string) {
  return prisma.loginCode.update({
    where: { id },
    data: {
      attemptCount: {
        increment: 1,
      },
    },
  });
}

/**
 * Creates a new user session.
 */
export async function createSession(userId: string, tokenHash: string, expiresAt: Date) {
  return prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
}

/**
 * Finds a session by its raw token, first hashing it to match tokenHash.
 */
export async function findSessionByToken(rawToken: string) {
  const tokenHash = sha256(rawToken);
  return prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });
}

/**
 * Deletes a session by id (e.g. for logging out).
 */
export async function deleteSession(id: string) {
  return prisma.session.delete({
    where: { id },
  });
}

/**
 * Marks a user as logged in by updating lastLoginAt.
 */
export async function markUserLoggedIn(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
    },
  });
}

