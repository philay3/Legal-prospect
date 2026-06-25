import prisma from "../prisma";
import type { ResearchAuditEntry } from "../research/runLeadResearch";

export interface PersistResearchAuditInput {
  searchZip: string;
  savedFirms: Array<{ id: string; firmName: string }>;
  auditEntries: ResearchAuditEntry[];
}

/**
 * Persists the research audit log entries to the database in a best-effort manner.
 */
export async function persistResearchAudit({
  searchZip,
  savedFirms,
  auditEntries,
}: PersistResearchAuditInput): Promise<void> {
  try {
    console.log(`[audit] Persisting ${auditEntries.length} research audit entries for ZIP ${searchZip}`);
    
    // Map firmName to id in-memory by exact trimmed name
    const nameToId = new Map<string, string>();
    for (const f of savedFirms) {
      nameToId.set(f.firmName.trim(), f.id);
    }

    // Insert runs one by one
    for (const entry of auditEntries) {
      try {
        const firmId = nameToId.get(entry.firmName.trim()) || null;

        await prisma.researchRun.create({
          data: {
            firmId,
            firmName: entry.firmName,
            searchZip,
            trigger: "DISCOVERY",
            startedAt: entry.startedAt,
            finishedAt: entry.finishedAt,
            websiteChecks: {
              create: entry.attempts.map((att) => ({
                url: att.url,
                provider: att.provider,
                httpStatus: att.httpStatus,
                outcome: att.outcome,
                errorMessage: att.errorMessage,
              })),
            },
          },
        });
      } catch (innerError: any) {
        console.error(`[audit] Failed to write research run for ${entry.firmName}:`, innerError.message || innerError);
      }
    }
  } catch (outerError: any) {
    console.error("[audit] Failed in persistResearchAudit coordinator:", outerError.message || outerError);
  }
}
