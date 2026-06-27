/**
 * scripts/screenshots.ts
 *
 * Captures the README screenshots from a running dev server. Re-run whenever the
 * UI changes, or hand it to the Antigravity agent to run.
 *
 *   npm i -D playwright
 *   npx playwright install chromium      # one-time
 *   npm run dev                          # in another terminal
 *   npx tsx scripts/screenshots.ts
 *
 * No prisma import here, so plain tsx is fine (no --conditions=react-server).
 *
 * Auth-gated pages (dashboard, leads, account) only shoot if you pass a session
 * cookie. Grab it once from your browser while signed in:
 *   DevTools > Application > Cookies > copy the value of the session cookie, then:
 *     SCREENSHOT_SESSION="<value>" npx tsx scripts/screenshots.ts
 * Sessions last ~30 days, so this is roughly a once-a-month copy.
 *
 * Selectors updated for the warm-paper ledger restyle: the home search field is
 * now #zip-search, the results area is the ledger (.rl-table-wrapper) rather than
 * a <table>, and the feedback panel is .feedback-panel.
 */

import { chromium, type Page } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// ---- Config (override via env) ----
const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve(process.cwd(), process.env.SCREENSHOT_OUT_DIR ?? "docs/images");
const ZIP = process.env.SCREENSHOT_ZIP ?? "10567"; // use a ZIP already cached, so no live pipeline run
const COOKIE_NAME = process.env.AUTH_SESSION_COOKIE_NAME ?? "legal_prospector_session";
const SESSION = process.env.SCREENSHOT_SESSION ?? "";

const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2; // crisp on retina

// Selectors to confirm against the live markup. If a shot fails, adjust here.
const SEL = {
  zipInput: '#zip-search, input[placeholder*="ZIP" i], input[type="search"]',
  searchSubmit: '.rl-search-submit-btn, button[type="submit"]',
  resultsReady: '.rl-table-wrapper, [data-testid="results-table"]',
  feedbackTrigger: '.feedback-bubble-btn, [aria-label*="feedback" i]',
  feedbackPanel: '.feedback-panel, [role="dialog"]',
};

type Shot = {
  name: string;
  path: string;
  auth?: boolean;
  prepare?: (page: Page) => Promise<void>;
  clip?: string; // CSS selector to element-clip instead of full page
  fullPage?: boolean;
};

const SHOTS: Shot[] = [
  { name: "home", path: "/", fullPage: true },
  { name: "login", path: "/login" },
  {
    name: "search-results",
    path: "/",
    prepare: async (page) => {
      await page.fill(SEL.zipInput, ZIP);
      await page.click(SEL.searchSubmit);
      await page.waitForSelector(SEL.resultsReady, { timeout: 60_000 });
      await page.waitForLoadState("networkidle").catch(() => {});
    },
  },
  { name: "dashboard", path: "/dashboard", auth: true, fullPage: true },
  { name: "saved-leads", path: "/leads", auth: true, fullPage: true },
  { name: "user-account", path: "/account", auth: true },
  {
    name: "feedback-widget",
    path: "/",
    clip: SEL.feedbackPanel,
    prepare: async (page) => {
      await page.click(SEL.feedbackTrigger);
      await page.waitForSelector(SEL.feedbackPanel);
    },
  },
];

// Let web fonts (Newsreader, IBM Plex Mono) finish loading and the layout settle
// before shooting, so the ledger type renders crisp instead of in a fallback face.
async function settle(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => (document as Document & { fonts?: FontFaceSet }).fonts?.ready).catch(() => {});
  await page.waitForTimeout(250);
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SCALE });

  if (SESSION) {
    const { hostname } = new URL(BASE_URL);
    await context.addCookies([
      { name: COOKIE_NAME, value: SESSION, domain: hostname, path: "/", httpOnly: true, sameSite: "Lax" },
    ]);
  }

  const page = await context.newPage();
  const ok: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const shot of SHOTS) {
    if (shot.auth && !SESSION) {
      skipped.push(`${shot.name} (set SCREENSHOT_SESSION)`);
      continue;
    }
    const out = path.join(OUT_DIR, `${shot.name}.png`);
    try {
      await page.goto(`${BASE_URL}${shot.path}`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      if (shot.prepare) await shot.prepare(page);
      await settle(page);
      if (shot.clip) {
        await page.locator(shot.clip).first().screenshot({ path: out });
      } else {
        await page.screenshot({ path: out, fullPage: shot.fullPage ?? false });
      }
      ok.push(shot.name);
      console.log(`captured  ${shot.name} -> ${path.relative(process.cwd(), out)}`);
    } catch (err) {
      failed.push(shot.name);
      console.error(`FAILED    ${shot.name}: ${(err as Error).message.split("\n")[0]}`);
    }
  }

  await browser.close();

  console.log(`\nDone. ${ok.length} captured, ${skipped.length} skipped, ${failed.length} failed.`);
  if (skipped.length) console.log(`Skipped: ${skipped.join(", ")}`);
  if (failed.length) {
    console.log(`Failed: ${failed.join(", ")} -- likely a selector mismatch; check SEL against the live markup.`);
    process.exitCode = 1;
  }
}

run();