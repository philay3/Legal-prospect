import prisma from "../prisma";
import { generateUniqueSlug } from "../slug";
import { isUseful, sanitizeFirm, sanitizeText, normalizePracticeAreas, toCanonicalPracticeArea } from "../research/sanitize";
import { classifyContact, pickCurrentBest } from "../research/evidence";
import zipcodes from "zipcodes";

export interface ResearchFirmInput {
  firm_name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  attorney_name?: string | null;
  attorneys?: { name: string; email: string | null }[] | null;
  practiceAreas?: string[] | null;
  practice_areas?: string[] | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  lat?: number | null;
  lng?: number | null;
  sourceType?: string | null;
  isUS?: boolean;
}

/**
 * Saves and dedupes research-discovered firms into the flat Firm table.
 * Dedup is handled by checking [zip, firmName] matches.
 * Existing records are updated with non-empty/non-placeholder values (via isUseful).
 * New records are created with appropriate defaults.
 */
export async function saveResearchFirms(
  zip: string,
  firms: ResearchFirmInput[]
): Promise<void> {
  const zipInfo = zipcodes.lookup(zip);
  const city = zipInfo?.city || "";
  const state = zipInfo?.state || "";

  console.log(`[save] zip=${zip} received=${firms.length}`);

  // Pre-process and sanitize incoming firms
  const processedFirms = firms.map((rawFirm) => {
    const firm = sanitizeFirm(rawFirm);
    const firmName = firm.firm_name.trim();
    return { rawFirm, firm, firmName };
  });

  // Extract all distinct, canonical practice area names across incoming firms
  const allIncomingPracticeAreas = processedFirms.flatMap(
    (pf) => pf.firm.practiceAreas ?? pf.firm.practice_areas ?? []
  );
  
  const allAreaNames = normalizePracticeAreas(allIncomingPracticeAreas).map(toCanonicalPracticeArea);

  // Batch-create practice areas to avoid race conditions
  if (allAreaNames.length > 0) {
    await prisma.practiceArea.createMany({
      data: allAreaNames.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }

  // Retrieve IDs for the practice areas
  const areaRows = allAreaNames.length > 0
    ? await prisma.practiceArea.findMany({
        where: { name: { in: allAreaNames } },
        select: { id: true, name: true },
      })
    : [];

  const areaIdByName = new Map<string, string>();
  for (const r of areaRows) {
    areaIdByName.set(r.name, r.id);
    areaIdByName.set(r.name.toLowerCase(), r.id);
  }

  const getAreaId = (name: string): string | undefined => {
    const canonical = toCanonicalPracticeArea(name);
    return areaIdByName.get(canonical) || areaIdByName.get(canonical.toLowerCase());
  };

  const results = await Promise.allSettled(
    processedFirms.map(async ({ rawFirm, firm, firmName }) => {
      try {
        // Map attorneys array
        const mappedAttorneys = firm.attorneys
          ? firm.attorneys.map((a) => a.name.trim()).filter(Boolean)
          : (isUseful(firm.attorney_name) ? [firm.attorney_name!.trim()] : []);

        // Derive attorneyCountRange
        let attorneyCountRange = "Unknown";
        const count = mappedAttorneys.length;
        if (count === 1) {
          attorneyCountRange = "1";
        } else if (count >= 2 && count <= 5) {
          attorneyCountRange = "2-5";
        } else if (count >= 6 && count <= 10) {
          attorneyCountRange = "6-10";
        } else if (count >= 11) {
          attorneyCountRange = "11+";
        }

        const streetAddress = isUseful(firm.address) ? firm.address!.trim() : null;
        const phone = isUseful(firm.phone) ? firm.phone!.trim() : null;
        const website = isUseful(firm.website) ? firm.website!.trim() : null;
        const email = isUseful(firm.email) ? firm.email!.trim() : null;
        const sourceUrl = website || null;

        // Gate location overrides to authoritative Places (GOOGLE_MAPS) data in the US only
        const isPlaces = rawFirm.sourceType === "GOOGLE_MAPS";
        const shouldOverrideLocation = isPlaces && rawFirm.isUS !== false;

        let firmCity = city;
        let firmState = state;
        let firmZip = zip;
        let firmZipExt: string | null = null;

        if (shouldOverrideLocation) {
          if (isUseful(firm.city)) firmCity = firm.city!.trim();
          if (isUseful(firm.state)) firmState = firm.state!.trim();
          if (isUseful(firm.zip)) {
            const rawZip = firm.zip!.trim();
            if (rawZip.includes("-")) {
              const parts = rawZip.split("-");
              firmZip = parts[0].trim();
              firmZipExt = parts[1].trim() || null;
            } else {
              firmZip = rawZip;
            }
          }
        }

        // Check if an existing firm matches the searchZip and firmName exactly
        const existing = await prisma.firm.findFirst({
          where: {
            searchZip: zip,
            firmName,
          },
        });

        if (existing) {
          // Build update object, updating only fields where incoming values are useful
          const updateData: any = {
            lastCheckedDate: new Date(),
          };

          if (isUseful(firm.address)) updateData.streetAddress = streetAddress;
          if (isUseful(firm.website)) {
            updateData.website = website;
            updateData.sourceUrl = sourceUrl;
          }
          if (isUseful(firmCity)) updateData.city = firmCity;
          if (isUseful(firmState)) updateData.state = firmState;
          if (shouldOverrideLocation) {
            updateData.zip = firmZip;
            updateData.zipExt = firmZipExt;
          }

          if (mappedAttorneys.length > 0) {
            updateData.attorneys = mappedAttorneys;
            updateData.attorneyCountRange = attorneyCountRange;
          }

          updateData.practiceAreas = normalizePracticeAreas([
            ...(existing.practiceAreas ?? []),
            ...(firm.practiceAreas ?? firm.practice_areas ?? []),
          ]).map(toCanonicalPracticeArea);

          // Save DataPoints first (best-effort, append-only) so they are included in the read
          try {
            if (isUseful(email)) {
              const classification = classifyContact("EMAIL", email!, {
                website,
                sourceType: rawFirm.sourceType ?? null,
              });
              await prisma.dataPoint.create({
                data: {
                  firmId: existing.id,
                  field: "EMAIL",
                  value: email!,
                  source: classification.source as any,
                  confidence: classification.confidence,
                },
              });
            }
          } catch (e: any) {
            console.error(`[datapoint] Failed to write email DataPoint for firm "${firmName}":`, e.message || e);
          }

          try {
            if (isUseful(phone)) {
              const classification = classifyContact("PHONE", phone!, {
                website,
                sourceType: rawFirm.sourceType ?? null,
              });
              await prisma.dataPoint.create({
                data: {
                  firmId: existing.id,
                  field: "PHONE",
                  value: phone!,
                  source: classification.source as any,
                  confidence: classification.confidence,
                },
              });
            }
          } catch (e: any) {
            console.error(`[datapoint] Failed to write phone DataPoint for firm "${firmName}":`, e.message || e);
          }

          // Read EMAIL and PHONE DataPoints for this firm
          const points = await prisma.dataPoint.findMany({
            where: { firmId: existing.id },
            select: { value: true, source: true, confidence: true, observedAt: true, field: true },
          });

          const emailPoints = points.filter((p) => p.field === "EMAIL");
          const phonePoints = points.filter((p) => p.field === "PHONE");

          const bestEmail = pickCurrentBest(emailPoints);
          const bestPhone = pickCurrentBest(phonePoints);

          if (bestEmail) {
            updateData.email = bestEmail.value;
            updateData.emailSource = bestEmail.source;
            updateData.emailConfidence = bestEmail.confidence;
          }
          if (bestPhone) {
            updateData.phone = bestPhone.value;
            updateData.phoneSource = bestPhone.source;
            updateData.phoneConfidence = bestPhone.confidence;
          }

          await prisma.firm.update({
            where: { id: existing.id },
            data: updateData,
          });

          // Save attorneys (dual-write)
          const attorneyInputs = buildAttorneyInputs(existing.id, mappedAttorneys);
          for (const input of attorneyInputs) {
            await prisma.attorney.upsert({
              where: {
                firmId_name: {
                  firmId: existing.id,
                  name: input.name,
                },
              },
              create: {
                firmId: existing.id,
                name: input.name,
              },
              update: {},
            });
          }

          // Save practice areas (dual-write) - Link only the incoming ones
          const incomingPracticeAreas = normalizePracticeAreas(
            firm.practiceAreas ?? firm.practice_areas ?? []
          ).map(toCanonicalPracticeArea);

          const links = incomingPracticeAreas
            .map((name) => getAreaId(name))
            .filter((id): id is string => Boolean(id))
            .map((practiceAreaId) => ({
              firmId: existing.id,
              practiceAreaId,
            }));

          if (links.length > 0) {
            await prisma.firmPracticeArea.createMany({
              data: links,
              skipDuplicates: true,
            });
          }
        } else {
          // Create a new firm record
          const createDataPayload: any = {
            firmName,
            slug: await generateUniqueSlug(prisma),
            searchZip: zip,
            zip: firmZip,
            zipExt: firmZipExt,
            city: firmCity,
            state: firmState,
            streetAddress,
            website,
            phone,
            email,
            practiceAreas: normalizePracticeAreas(
              firm.practiceAreas || firm.practice_areas
            ).map(toCanonicalPracticeArea),
            attorneyCountRange,
            attorneys: mappedAttorneys,
            sourceType: isPlaces ? "GOOGLE_MAPS" : "WEB_SCRAPE",
            sourceUrl,
            confidenceLevel: isPlaces ? "MEDIUM" : "UNKNOWN",
            verificationStatus: "CANDIDATE",
            lastCheckedDate: new Date(),
            globalNotes: isPlaces 
              ? "Discovered via Google Places API; pending review."
              : "Discovered via live web research; pending review.",
          };

          let emailClassification: any = null;
          if (isUseful(email)) {
            emailClassification = classifyContact("EMAIL", email!, {
              website,
              sourceType: rawFirm.sourceType ?? null,
            });
            createDataPayload.emailSource = emailClassification.source;
            createDataPayload.emailConfidence = emailClassification.confidence;
          }

          let phoneClassification: any = null;
          if (isUseful(phone)) {
            phoneClassification = classifyContact("PHONE", phone!, {
              website,
              sourceType: rawFirm.sourceType ?? null,
            });
            createDataPayload.phoneSource = phoneClassification.source;
            createDataPayload.phoneConfidence = phoneClassification.confidence;
          }

          const createdFirm = await prisma.firm.create({
            data: createDataPayload,
          });

          // Save attorneys (dual-write)
          const attorneyInputs = buildAttorneyInputs(createdFirm.id, mappedAttorneys);
          for (const input of attorneyInputs) {
            await prisma.attorney.upsert({
              where: {
                firmId_name: {
                  firmId: createdFirm.id,
                  name: input.name,
                },
              },
              create: {
                firmId: createdFirm.id,
                name: input.name,
              },
              update: {},
            });
          }

          // Save practice areas (dual-write)
          const practiceAreaNames = createdFirm.practiceAreas ?? [];
          const links = practiceAreaNames
            .map((name) => getAreaId(name))
            .filter((id): id is string => Boolean(id))
            .map((practiceAreaId) => ({
              firmId: createdFirm.id,
              practiceAreaId,
            }));

          if (links.length > 0) {
            await prisma.firmPracticeArea.createMany({
              data: links,
              skipDuplicates: true,
            });
          }

          // Save DataPoints best-effort
          try {
            if (isUseful(email) && emailClassification) {
              await prisma.dataPoint.create({
                data: {
                  firmId: createdFirm.id,
                  field: "EMAIL",
                  value: email!,
                  source: emailClassification.source as any,
                  confidence: emailClassification.confidence,
                },
              });
            }
          } catch (e: any) {
            console.error(`[datapoint] Failed to write email DataPoint for firm "${firmName}":`, e.message || e);
          }

          try {
            if (isUseful(phone) && phoneClassification) {
              await prisma.dataPoint.create({
                data: {
                  firmId: createdFirm.id,
                  field: "PHONE",
                  value: phone!,
                  source: phoneClassification.source as any,
                  confidence: phoneClassification.confidence,
                },
              });
            }
          } catch (e: any) {
            console.error(`[datapoint] Failed to write phone DataPoint for firm "${firmName}":`, e.message || e);
          }
        }
      } catch (error) {
        return Promise.reject({ firmName, error });
      }
    })
  );

  let upserted = 0;
  let failed = 0;
  for (const res of results) {
    if (res.status === "fulfilled") {
      upserted++;
    } else {
      failed++;
      const reason = res.reason;
      console.error(`[save] Failed to save firm "${reason?.firmName || "Unknown"}":`, reason?.error || reason);
    }
  }

  console.log(`[save] zip=${zip} received=${firms.length} upserted=${upserted} failed=${failed}`);
}

/**
 * Builds a list of cleaned, deduplicated attorney records for database save.
 * Trims, ignores empty names, deduplicates within the firm, and as a backstop
 * removes control/NUL characters.
 */
export function buildAttorneyInputs(
  firmId: string,
  names: string[]
): { firmId: string; name: string }[] {
  const seen = new Set<string>();
  const inputs: { firmId: string; name: string }[] = [];

  for (const name of names) {
    if (!name) continue;
    const cleanName = sanitizeText(name).trim();
    if (!cleanName) continue;
    if (seen.has(cleanName)) continue;
    seen.add(cleanName);
    inputs.push({ firmId, name: cleanName });
  }

  return inputs;
}

