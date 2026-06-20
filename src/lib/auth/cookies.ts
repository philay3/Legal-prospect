import "server-only";
import { cookies } from "next/headers";
import { SESSION_EXPIRY_MS, DEFAULT_COOKIE_NAME } from "./constants";

function getCookieName(): string {
  return process.env.AUTH_SESSION_COOKIE_NAME || DEFAULT_COOKIE_NAME;
}

/**
 * Sets the HttpOnly session cookie with maxAge matching the 30-day session lifetime.
 */
export async function setSessionCookie(rawToken: string) {
  const cookieStore = await cookies();
  const name = getCookieName();
  cookieStore.set(name, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY_MS / 1000,
  });
}

/**
 * Retrieves the session token from the cookies.
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const name = getCookieName();
  return cookieStore.get(name)?.value;
}

/**
 * Clears the session cookie.
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  const name = getCookieName();
  cookieStore.delete(name);
}
