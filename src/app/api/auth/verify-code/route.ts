import { NextRequest, NextResponse } from "next/server";
import { findLatestUnusedCode, incrementCodeAttempt, markCodeUsed, findActiveUserByEmail, createSession, markUserLoggedIn } from "../../../../lib/auth/db";
import { checkLoginCode, generateSessionToken, sha256 } from "../../../../lib/auth/crypto";
import { setSessionCookie } from "../../../../lib/auth/cookies";
import { SESSION_EXPIRY_MS, MAX_LOGIN_ATTEMPTS } from "../../../../lib/auth/constants";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false });
    }

    const { email, code } = body;
    if (!email || !code || typeof email !== "string" || typeof code !== "string") {
      return NextResponse.json({ ok: false });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const record = await findLatestUnusedCode(normalizedEmail);

    if (!record) {
      return NextResponse.json({ ok: false });
    }

    const result = checkLoginCode(record, code, new Date(), MAX_LOGIN_ATTEMPTS);

    if (!result.ok) {
      if (result.reason === "mismatch") {
        await incrementCodeAttempt(record.id);
      }
      return NextResponse.json({ ok: false });
    }

    await markCodeUsed(record.id);

    const user = await findActiveUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json({ ok: false });
    }

    const rawToken = generateSessionToken();
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

    await createSession(user.id, tokenHash, expiresAt);
    await setSessionCookie(rawToken);
    await markUserLoggedIn(user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in verify-code route:", error);
    return NextResponse.json({ ok: false });
  }
}
