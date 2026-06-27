const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

/**
 * Generates a random 6-character code from the alphabet:
 * digits 2-9 and lowercase letters (excluding i, l, o).
 */
export function generateSlugCode(): string {
  let result = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    result += ALPHABET[randomIndex];
  }
  return result;
}

/**
 * Generates a unique 6-character slug code checking against the database.
 * Retries up to 10 times, throwing an error if exhausted.
 */
export async function generateUniqueSlug(db: any): Promise<string> {
  const maxRetries = 10;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const slug = generateSlugCode();
    const existing = await db.firm.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) {
      return slug;
    }
  }
  throw new Error("Failed to generate a unique firm slug after maximum retries.");
}
