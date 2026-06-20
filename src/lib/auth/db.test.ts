import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

import prisma from "../prisma";
import {
  findActiveUserByEmail,
  findOrCreateActiveUserByEmail,
  countRecentCodes,
  createLoginCode,
  findLatestUnusedCode,
  markCodeUsed,
  incrementCodeAttempt,
  createSession,
  findSessionByToken,
  deleteSession,
} from "./db";

vi.mock("../prisma", () => ({
  default: {
    user: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
    loginCode: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("Database authentication helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("AUTH_SESSION_SECRET", "test-pepper-secret-value");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("findActiveUserByEmail", () => {
    it("should look up active user by email address", async () => {
      const mockUser = { id: "user-123", email: "test@example.com", isActive: true };
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any);

      const result = await findActiveUserByEmail("test@example.com");

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
          isActive: true,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("findOrCreateActiveUserByEmail", () => {
    it("should find or create user using upsert", async () => {
      const mockUser = { id: "user-123", email: "test@example.com", isActive: true };
      vi.mocked(prisma.user.upsert).mockResolvedValue(mockUser as any);

      const result = await findOrCreateActiveUserByEmail("test@example.com");

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        update: {},
        create: {
          email: "test@example.com",
          isActive: true,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("countRecentCodes", () => {
    it("should return the count of codes in the given timeframe", async () => {
      vi.mocked(prisma.loginCode.count).mockResolvedValue(3);
      const since = new Date(Date.now() - 3600000);

      const result = await countRecentCodes("test@example.com", since);

      expect(prisma.loginCode.count).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
          createdAt: {
            gte: since,
          },
        },
      });
      expect(result).toBe(3);
    });
  });

  describe("createLoginCode", () => {
    it("should insert a new login code record into the database", async () => {
      const expiresAt = new Date();
      const mockCode = { id: "code-123", email: "test@example.com", codeHash: "hashed", expiresAt };
      vi.mocked(prisma.loginCode.create).mockResolvedValue(mockCode as any);

      const result = await createLoginCode("test@example.com", "hashed", expiresAt);

      expect(prisma.loginCode.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          codeHash: "hashed",
          expiresAt,
        },
      });
      expect(result).toEqual(mockCode);
    });
  });

  describe("findLatestUnusedCode", () => {
    it("should look up latest unused code", async () => {
      const mockCode = { id: "code-123", email: "test@example.com", usedAt: null };
      vi.mocked(prisma.loginCode.findFirst).mockResolvedValue(mockCode as any);

      const result = await findLatestUnusedCode("test@example.com");

      expect(prisma.loginCode.findFirst).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
          usedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      expect(result).toEqual(mockCode);
    });
  });

  describe("markCodeUsed", () => {
    it("should update usedAt field to current date", async () => {
      const mockCode = { id: "code-123", usedAt: new Date() };
      vi.mocked(prisma.loginCode.update).mockResolvedValue(mockCode as any);

      const result = await markCodeUsed("code-123");

      expect(prisma.loginCode.update).toHaveBeenCalledWith({
        where: { id: "code-123" },
        data: {
          usedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockCode);
    });
  });

  describe("incrementCodeAttempt", () => {
    it("should increment attempt count for the code", async () => {
      const mockCode = { id: "code-123", attemptCount: 1 };
      vi.mocked(prisma.loginCode.update).mockResolvedValue(mockCode as any);

      const result = await incrementCodeAttempt("code-123");

      expect(prisma.loginCode.update).toHaveBeenCalledWith({
        where: { id: "code-123" },
        data: {
          attemptCount: {
            increment: 1,
          },
        },
      });
      expect(result).toEqual(mockCode);
    });
  });

  describe("createSession", () => {
    it("should insert session record with token hash", async () => {
      const expiresAt = new Date();
      const mockSession = { id: "session-123", userId: "user-123", tokenHash: "hashed", expiresAt };
      vi.mocked(prisma.session.create).mockResolvedValue(mockSession as any);

      const result = await createSession("user-123", "hashed", expiresAt);

      expect(prisma.session.create).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          tokenHash: "hashed",
          expiresAt,
        },
      });
      expect(result).toEqual(mockSession);
    });
  });

  describe("findSessionByToken", () => {
    it("should hash the raw token and find matching session including user", async () => {
      const mockSession = {
        id: "session-123",
        tokenHash: "hashed-token",
        user: { id: "user-123", email: "test@example.com" },
      };
      vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession as any);

      const result = await findSessionByToken("my-raw-token");

      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: {
          tokenHash: expect.any(String),
        },
        include: {
          user: true,
        },
      });
      expect(result).toEqual(mockSession);
    });
  });

  describe("deleteSession", () => {
    it("should delete session by id", async () => {
      const mockSession = { id: "session-123" };
      vi.mocked(prisma.session.delete).mockResolvedValue(mockSession as any);

      const result = await deleteSession("session-123");

      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: { id: "session-123" },
      });
      expect(result).toEqual(mockSession);
    });
  });
});
