#!/usr/bin/env bash
# Regenerate the source dumps that are loaded into the Claude project knowledge.
#
# Run this AFTER the practice-area dedupe cleanup ships, then re-upload the two
# .txt files to the project knowledge (replace the old ones). The cleanup moves
# toCanonicalPracticeArea between sanitize.ts and saveResearchFirms.ts, and both
# files live in both dumps, so regenerating once after the cleanup captures
# everything in a single pass.
#
# Save as scripts/make-dumps.sh, then:  bash scripts/make-dumps.sh
set -euo pipefail
cd "$(dirname "$0")/.."   # repo root, assuming this lives in scripts/

dump() {
  local out="$1"; shift
  : > "$out"
  for f in "$@"; do
    [ -f "$f" ] || continue
    printf '===== %s =====\n' "$f" >> "$out"
    cat "$f" >> "$out"
    printf '\n' >> "$out"
  done
  echo "wrote $out ($(grep -c '^===== ' "$out") files)"
}

# pipeline-dump: the research + save pipeline
dump pipeline-dump.txt \
  src/lib/db/persistResearchAudit.ts \
  src/lib/db/saveResearchFirms.ts \
  $(find src/lib/research -name '*.ts' ! -name '*.test.ts' | sort)

# project-dump: API routes, lib, utils, types, prisma
# Uses find so new files (like src/lib/practiceAreas.ts) are picked up
# automatically and test files are skipped. Slightly more inclusive than the
# original hand-curated list, on purpose, so nothing gets missed again.
dump project-dump.txt \
  $(find src/app/api -name 'route.ts' | sort) \
  $(find src/lib -name '*.ts' ! -name '*.test.ts' | sort) \
  $(find src/utils -name '*.ts' ! -name '*.test.ts' | sort) \
  $(find src/types -name '*.ts' ! -name '*.test.ts' | sort) \
  prisma/schema.prisma \
  prisma/seed.ts