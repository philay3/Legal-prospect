import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, clearSessionCookie } from "../../../../lib/auth/cookies";
import { findSessionByToken, deleteSession } from "../../../../lib/auth/db";

export async function POST(request: NextRequest) {
  try {
    const token = await getSessionToken();
    if (token) {
      const session = await findSessionByToken(token);
      if (session) {
        await deleteSession(session.id);
      }
    }
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in sign-out route:", error);
    // Always clear session cookie even on database failures
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  }
}
