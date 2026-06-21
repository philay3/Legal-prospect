# Legal Prospector — Start Here

The map of this project's docs. **Legal Prospector** turns a ZIP code into an accurate, exportable list of small and boutique law firms — with the contact and firm data (attorneys, practice areas, real contact info) that Google misses. Built for a Thomson Reuters rep selling Westlaw.

**New here?** Read `README.md` → `architecture.md` → `database.md` → `how-we-build.md` — the product, the system, the data model, and how the work is run.

## The docs

**Product**
- `README.md` *(repo root)* — what it does, who it's for, the high-level diagrams. Start here.

**How it's built**
- `architecture.md` — the system end to end: request lifecycles (search, sign-in, save), data layering, and the design tradeoffs.
- `data-pipeline.md` — how firm data is discovered and enriched today, pass by pass (Places → per-firm extraction → persist).
- `database.md` — the 9-table schema and ERD, including the `searchZip` bug-and-fix.
- `how-we-build.md` — the three-way AI loop and the guardrails that make handing work to an agent safe.

**Where it's going**
- `roadmap.md` — current status and what's next.
- `data-app-design.md` — the future data layer: per-field provenance and buying signals. A design map, not yet built.

**How the work is run**
- `AGENTS.md` *(repo root)* — the rules the coding agent must follow.
- `tasks/current-task.md` — the single task the agent is allowed to work on right now.
- `tasks/work.md` — what happened in each task.
- `tasks/decisions.md` — important product, technical, and process decisions, including build-order changes.

## Repo shape
```
README.md            ← product overview + diagrams
AGENTS.md            ← coding-agent rules
tasks/
  current-task.md    ← the one active task
  work.md            ← work log
  decisions.md       ← decision log
docs/
  START-HERE.md   ← this file
  architecture.md
  data-pipeline.md
  database.md
  roadmap.md
  how-we-build.md
  data-app-design.md
  scrapped/          ← superseded drafts
```

## How we work, in one breath
One task per coding-agent session, with the human reviewing every diff and running every command. Migrations are additive and reversible — local and production share one Neon database, so changes are previewed as SQL and only ever add. Build-order or design changes get written down in `decisions.md`, never made silently. The full version is in `how-we-build.md`.