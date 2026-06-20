import "server-only";
import { cache } from "react";
import { getSessionToken } from "./cookies";
import { findSessionByToken } from "./db";
import { isSessionValid } from "./crypto";

/**
 * Retrieves the currently authenticated user from the session token in the request cookies.
 * Returns null if no valid session is found.
 */
export const getCurrentUser = cache(async () => {
  const token = await getSessionToken();
  if (!token) return null;

  const session = await findSessionByToken(token);
  if (!session || !isSessionValid(session)) return null;

  return session.user;
});

