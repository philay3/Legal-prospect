import prisma from "../prisma";
import { isUseful } from "../research/sanitize";
import zipcodes from "zipcodes";

export interface ResearchFirmInput {
  firm_name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  attorney_name?: string | null;
  attorneys?: { name: string; email: string | null }[] | null;
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

  for (const firm of firms) {
    const firmName = firm.firm_name.trim();

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

    // Check if an existing firm matches the zip and firmName exactly
    const existing = await prisma.firm.findFirst({
      where: {
        zip,
        firmName,
      },
    });

    if (existing) {
      // Build update object, updating only fields where incoming values are useful
      const updateData: any = {
        lastCheckedDate: new Date(),
      };

      if (isUseful(firm.address)) updateData.streetAddress = streetAddress;
      if (isUseful(firm.phone)) updateData.phone = phone;
      if (isUseful(firm.website)) {
        updateData.website = website;
        updateData.sourceUrl = sourceUrl;
      }
      if (isUseful(firm.email)) updateData.email = email;
      if (isUseful(city)) updateData.city = city;
      if (isUseful(state)) updateData.state = state;

      if (mappedAttorneys.length > 0) {
        updateData.attorneys = mappedAttorneys;
        updateData.attorneyCountRange = attorneyCountRange;
      }

      await prisma.firm.update({
        where: { id: existing.id },
        data: updateData,
      });
    } else {
      // Create a new firm record
      await prisma.firm.create({
        data: {
          firmName,
          zip,
          city,
          state,
          streetAddress,
          website,
          phone,
          email,
          practiceAreas: [],
          attorneyCountRange,
          attorneys: mappedAttorneys,
          sourceType: "WEB_SCRAPE",
          sourceUrl,
          confidenceLevel: "UNKNOWN",
          verificationStatus: "CANDIDATE",
          lastCheckedDate: new Date(),
          globalNotes: "Discovered via live web research; pending review.",
        },
      });
    }
  }
}
