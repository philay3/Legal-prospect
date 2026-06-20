import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import prisma from "./prisma";
import {
  saveLead,
  unsaveLead,
  getSavedFirmIds,
  listSavedLeads,
  countSavedLeads,
} from "./leads";

vi.mock("./prisma", () => ({
  default: {
    savedLead: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("Database leads helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveLead", () => {
    it("should idempotently upsert a saved lead using the compound unique key", async () => {
      const mockResult = { id: "sl-123", userId: "user-1", firmId: "firm-1" };
      vi.mocked(prisma.savedLead.upsert).mockResolvedValue(mockResult as any);

      const result = await saveLead("user-1", "firm-1");

      expect(prisma.savedLead.upsert).toHaveBeenCalledWith({
        where: {
          userId_firmId: {
            userId: "user-1",
            firmId: "firm-1",
          },
        },
        update: {},
        create: {
          userId: "user-1",
          firmId: "firm-1",
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("unsaveLead", () => {
    it("should delete matching saved lead records via deleteMany", async () => {
      vi.mocked(prisma.savedLead.deleteMany).mockResolvedValue({ count: 1 } as any);

      const result = await unsaveLead("user-1", "firm-1");

      expect(prisma.savedLead.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          firmId: "firm-1",
        },
      });
      expect(result).toEqual({ count: 1 });
    });
  });

  describe("getSavedFirmIds", () => {
    it("should retrieve saved firm IDs and map them to a string array", async () => {
      const mockRecords = [
        { firmId: "firm-1" },
        { firmId: "firm-2" },
      ];
      vi.mocked(prisma.savedLead.findMany).mockResolvedValue(mockRecords as any);

      const result = await getSavedFirmIds("user-1");

      expect(prisma.savedLead.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
        },
        select: {
          firmId: true,
        },
      });
      expect(result).toEqual(["firm-1", "firm-2"]);
    });
  });

  describe("listSavedLeads", () => {
    it("should find saved leads with full firm data, ordered by newest, respecting limit if provided", async () => {
      const mockRecords = [
        { id: "sl-1", userId: "user-1", firmId: "firm-1", firm: { id: "firm-1", name: "Firm 1" } },
      ];
      vi.mocked(prisma.savedLead.findMany).mockResolvedValue(mockRecords as any);

      const resultWithLimit = await listSavedLeads("user-1", 5);

      expect(prisma.savedLead.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
        },
        include: {
          firm: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });
      expect(resultWithLimit).toEqual(mockRecords);

      const resultAll = await listSavedLeads("user-1");
      expect(prisma.savedLead.findMany).toHaveBeenLastCalledWith({
        where: {
          userId: "user-1",
        },
        include: {
          firm: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: undefined,
      });
    });
  });

  describe("countSavedLeads", () => {
    it("should return the total count of saved leads for a user", async () => {
      vi.mocked(prisma.savedLead.count).mockResolvedValue(42);

      const result = await countSavedLeads("user-1");

      expect(prisma.savedLead.count).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
        },
      });
      expect(result).toBe(42);
    });
  });
});
