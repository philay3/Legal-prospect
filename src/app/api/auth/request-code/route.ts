import { NextRequest, NextResponse } from "next/server";
import { findOrCreateActiveUserByEmail, countRecentCodes, createLoginCode, findLatestUnusedCode } from "../../../../lib/auth/db";
import { generateLoginCode, sha256 } from "../../../../lib/auth/crypto";
import { sendLoginCodeEmail } from "../../../../lib/auth/email";
import { CODE_EXPIRY_MS } from "../../../../lib/auth/constants";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: true });
    }

    const { email } = body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ ok: true });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await findOrCreateActiveUserByEmail(normalizedEmail);

    if (user) {
      // Abuse guard: check if user has requested 5 or more codes in the last hour
      const oneHourAgo = new Date(Date.now() - 3600000);
      const hourlyCount = await countRecentCodes(normalizedEmail, oneHourAgo);

      if (hourlyCount < 5) {
        const recent = await findLatestUnusedCode(normalizedEmail);
        const isCooldownActive = recent && (Date.now() - recent.createdAt.getTime() < 60000);

        if (!isCooldownActive) {
          const code = generateLoginCode();
          const codeHash = sha256(code);
          const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);

          await createLoginCode(normalizedEmail, codeHash, expiresAt);

          try {
            await sendLoginCodeEmail(normalizedEmail, code);
          } catch (error) {
            console.error("Failed to send login code email:", error);
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error requesting login code:", error);
    return NextResponse.json({ ok: true });
  }
}
