Task: add a new pure helper, test-first. Additive only — do not change any existing function. Do NOT run any commands.

In src/lib/research/sanitize.ts, add:

export function normalizeAttorneyName(name: string): string {
  if (!name) return "";
  return sanitizeText(name).replace(/\s+/g, " ").trim();
}

(sanitizeText already exists in this file — reuse it.)

In src/lib/research/sanitize.test.ts (relative import: import { normalizeAttorneyName } from "./sanitize"), add exactly:

it("strips a trailing 'Esq.' so the same attorney isn't stored twice", () => {
  expect(normalizeAttorneyName("Michael H. Joseph, Esq.")).toBe("Michael H. Joseph");
});

Do not touch any other function. Do NOT run any commands — just list the test command for me to run. Report the changed files, then stop.