#!/usr/bin/env bash
# regen-dumps.sh
# Regenerates the four project-knowledge dumps from current source.
# Read-only except for the four *-dump.txt files it writes. Run from the repo root.
# Find-based so it never goes stale: it captures whatever is on disk, not a hardcoded list.

emit() { printf '\n===== %s =====\n' "$2" >> "$1"; cat "$2" >> "$1"; }

# ---- pipeline-dump.txt : discovery, extraction, persistence ----
: > pipeline-dump.txt
find src/lib/research src/lib/db -type f -name '*.ts' ! -name '*.test.ts' ! -name '*_test.ts' 2>/dev/null | sort \
  | while IFS= read -r f; do emit pipeline-dump.txt "$f"; done
for f in src/app/api/prospects/search/route.ts src/app/api/leads/enrich/route.ts src/types/prospect.ts; do
  [ -f "$f" ] && emit pipeline-dump.txt "$f"
done

# ---- project-dump.txt : schema, types, every API route, all lib/utils, config ----
: > project-dump.txt
[ -f prisma/schema.prisma ] && emit project-dump.txt prisma/schema.prisma
find src -type f -name '*.ts' ! -name '*.test.ts' ! -name '*_test.ts' \
     ! -path 'src/generated/*' ! -path '*/__tests__/*' 2>/dev/null | sort \
  | while IFS= read -r f; do emit project-dump.txt "$f"; done
for f in package.json tsconfig.json next.config.ts next.config.mjs vitest.config.ts vitest.config.mts .env.example; do
  [ -f "$f" ] && emit project-dump.txt "$f"
done

# ---- frontend-dump.txt : every page and component ----
: > frontend-dump.txt
find src/app src/components -type f -name '*.tsx' ! -name '*.test.tsx' ! -path '*/__tests__/*' 2>/dev/null | sort \
  | while IFS= read -r f; do emit frontend-dump.txt "$f"; done

# ---- styles-dump.txt : global CSS + tailwind/postcss config ----
: > styles-dump.txt
find src -type f \( -name '*.css' -o -name '*.scss' \) 2>/dev/null | sort \
  | while IFS= read -r f; do emit styles-dump.txt "$f"; done
for f in tailwind.config.ts tailwind.config.js postcss.config.mjs postcss.config.js; do
  [ -f "$f" ] && emit styles-dump.txt "$f"
done

# ---- manifest + sanity checks ----
echo
echo "Wrote:"
for d in pipeline project frontend styles; do
  printf '  %-18s %4s files\n' "$d-dump.txt" "$(grep -c '^===== ' "$d-dump.txt")"
done
echo
echo "Sanity (all should say ok):"
grep -q 'emailConfidence'    project-dump.txt  && echo "  [ok] provenance columns present in schema"      || echo "  [MISS] emailConfidence not in schema dump"
grep -q 'saveResearchFirms'  pipeline-dump.txt && echo "  [ok] saveResearchFirms captured"                || echo "  [MISS] saveResearchFirms not captured"
grep -q 'pickCurrentBest'    pipeline-dump.txt && echo "  [ok] pickCurrentBest captured"                  || echo "  [MISS] pickCurrentBest not captured (check src/lib path)"
grep -q 'dashboard/page'     frontend-dump.txt && echo "  [ok] dashboard page captured"                   || echo "  [MISS] dashboard page not captured"
grep -q 'leads/page'         frontend-dump.txt && echo "  [ok] leads page captured"                       || echo "  [MISS] leads page not captured"