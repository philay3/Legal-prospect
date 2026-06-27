/**
 * scripts/readme-shots.ts
 *
 * Captures the README "story" screenshots in one pass, walking the real user journey:
 *
 *   1. search-results  /?zip=<ZIP>             (public)   search a ZIP -> the firm ledger
 *   2. firm-detail     first result -> /firms  (public)   drill into one firm's profile
 *   3. dashboard       /dashboard              (private)  pipeline tiles + activity feed
 *   4. saved-leads     /leads                  (private)  the Active / Won / Lost pipeline
 *
 * Output: docs/images/<name>.png  (overwrites the README images)
 *
 * --- Run ---
 *   npx playwright install chromium                       # once, to get the browser binary
 *   SHOT_SESSION="<cookie value>" npx tsx scripts/readme-shots.ts
 *
 * The two private shots need a logged-in session. Sign in to the app in your browser,
 * open DevTools -> Application -> Cookies, copy the value of the
 * `legal_prospector_session` cookie, and pass it as SHOT_SESSION. Omit it and the
 * script still produces the two public shots and skips the private ones.
 *
 * --- Env (all optional) ---
 *   SHOT_BASE_URL     default http://localhost:3000
 *   SHOT_ZIP          default 01824   — use a ZIP that's already CACHED, so the shot is
 *                                       fast and deterministic (a cache miss runs live research)
 *   SHOT_FIRM         slug or id to feature on the firm-detail shot; default = the first result
 *   SHOT_SESSION      raw `legal_prospector_session` cookie value (for the private shots)
 *   SHOT_COOKIE_NAME  default legal_prospector_session (only if you overrode AUTH_SESSION_COOKIE_NAME)
 *   SHOT_WIDTH        default 1440
 *   SHOT_HEIGHT       default 1000
 *   SHOT_SCALE        default 2       — deviceScaleFactor; 2 = crisp retina-density PNGs
 *   SHOT_FULLPAGE     set to 1 to capture the full scroll height instead of the viewport
 *   SHOT_HIDE         comma-separated CSS selectors to hide before each shot
 *                     (e.g. the floating feedback bubble) — leaves them out of the capture
 */

import { chromium, type Page } from "playwright";
import path from "node:path";
import fs from "node:fs";

const BASE_URL = (process.env.SHOT_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const ZIP = process.env.SHOT_ZIP ?? "01824";
const FIRM = process.env.SHOT_FIRM ?? "";
const SESSION = process.env.SHOT_SESSION ?? "";
const COOKIE_NAME = process.env.SHOT_COOKIE_NAME ?? "legal_prospector_session";
const WIDTH = Number(process.env.SHOT_WIDTH ?? 1440);
const HEIGHT = Number(process.env.SHOT_HEIGHT ?? 1000);
const SCALE = Number(process.env.SHOT_SCALE ?? 2);
const FULLPAGE = process.env.SHOT_FULLPAGE === "1";
const HIDE = (process.env.SHOT_HIDE ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const OUT_DIR = path.resolve(process.cwd(), "docs/images");

/** Wait for the network to go quiet, fonts to load, and overlays to be hidden. */
async function settle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => (document as any).fonts?.ready).catch(() => {});
  if (HIDE.length) {
    const css = HIDE.map((sel) => `${sel}{display:none !important;}`).join("\n");
    await page.addStyleTag({ content: css }).catch(() => {});
  }
  await page.waitForTimeout(400); // brief paint settle
}

async function capture(page: Page, name: string): Promise<void> {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: FULLPAGE });
  console.log(`  \u2713 ${path.relative(process.cwd(), file)}`);
}

function onLoginPage(page: Page): boolean {
  return new URL(page.url()).pathname.startsWith("/login");
}

async function loadResults(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/?zip=${encodeURIComponent(ZIP)}`, {
    waitUntil: "domcontentloaded",
  });
  // The home page auto-runs the search from the ?zip param. Wait for the first
  // ledger row (generous timeout in case ZIP is a cache miss and runs live).
  await page.locator(".rl-row").first().waitFor({ timeout: 90_000 });
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Base URL : ${BASE_URL}`);
  console.log(`ZIP      : ${ZIP}`);
  console.log(`Firm     : ${FIRM || "(first few results)"}`);
  console.log(`Session  : ${SESSION ? "provided" : "none (skipping private shots)"}`);
  console.log(`Viewport : ${WIDTH}x${HEIGHT} @${SCALE}x${FULLPAGE ? " fullPage" : ""}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
  });

  if (SESSION) {
    const { hostname } = new URL(BASE_URL);
    await context.addCookies([
      {
        name: COOKIE_NAME,
        value: SESSION,
        domain: hostname,
        path: "/",
        httpOnly: true,
        secure: BASE_URL.startsWith("https"),
        sameSite: "Lax",
      },
    ]);
  }

  const page = await context.newPage();

  // 1. Search + results (public) ------------------------------------------------
  try {
    console.log("search-results");
    await loadResults(page);
    await settle(page);
    await capture(page, "search-results");
  } catch (e) {
    console.warn(`  \u2717 search-results failed: ${(e as Error).message}`);
  }

  // 2. Firm details (public) — specific firm or first few results ---------------
  try {
    console.log("firm-details");
    if (FIRM) {
      await page.goto(`${BASE_URL}/firms/${encodeURIComponent(FIRM)}`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByRole("heading", { level: 1 }).first().waitFor({ timeout: 30_000 });
      await settle(page);
      await capture(page, "firm-detail");
    } else {
      await loadResults(page);
      const count = await page.locator(".rl-row").count();
      console.log(`Discovered ${count} firms on the search results page.`);
      
      const limit = Math.min(count, 3);
      for (let i = 0; i < limit; i++) {
        const indexStr = `${i + 1}`;
        console.log(`firm-detail-${indexStr}`);
        
        await loadResults(page);
        await settle(page);
        
        const currentFirm = page.locator(".rl-firm-name").nth(i);
        const text = await currentFirm.innerText();
        console.log(`  Clicking firm ${indexStr}: "${text}"`);
        
        await currentFirm.click();
        await page.waitForURL("**/firms/**", { timeout: 30_000 });
        await page.getByRole("heading", { level: 1 }).first().waitFor({ timeout: 30_000 });
        await settle(page);
        await capture(page, `firm-detail-${indexStr}`);
      }
    }
  } catch (e) {
    console.warn(`  \u2717 firm-details failed: ${(e as Error).message}`);
  }

  // 3 + 4. Private shots — require a session ------------------------------------
  if (!SESSION) {
    console.warn("\nSHOT_SESSION not set — skipping dashboard + saved-leads.");
  } else {
    try {
      console.log("dashboard");
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
      if (onLoginPage(page)) throw new Error("bounced to /login — SHOT_SESSION missing or expired");
      await settle(page);
      await capture(page, "dashboard");
    } catch (e) {
      console.warn(`  \u2717 dashboard failed: ${(e as Error).message}`);
    }

    try {
      console.log("saved-leads");
      await page.goto(`${BASE_URL}/leads`, { waitUntil: "domcontentloaded" });
      if (onLoginPage(page)) throw new Error("bounced to /login — SHOT_SESSION missing or expired");
      await settle(page);
      await capture(page, "saved-leads");
    } catch (e) {
      console.warn(`  \u2717 saved-leads failed: ${(e as Error).message}`);
    }
  }

  await browser.close();
  console.log("\nDone. Images written to docs/images/.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});