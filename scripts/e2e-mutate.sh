#!/usr/bin/env bash
# Proves a spec's references catch a visible change, without touching src/: runs the spec in
# Docker with extra CSS injected at every checkpoint (E2E_MUTATION_CSS, see checkpoint() in
# e2e/support/fixtures.ts) and expects it to fail. See "Converting a draft (agents)" in
# e2e/README.md.
#
#   E2E_PORT=<port> scripts/e2e-mutate.sh <spec> '<css>'
#
# Prints the first failing checkpoint and its pixel count, and confirms src/ and public/ are
# untouched. Exit code 0 when the mutation was caught.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

[ $# -eq 2 ] || { echo "usage: E2E_PORT=<port> scripts/e2e-mutate.sh <spec> '<css>'" >&2; exit 2; }
BASE="$(basename "$1")"; BASE="${BASE%.spec.ts}"
SPEC="e2e/$BASE.spec.ts"
[ -f "$SPEC" ] || { echo "no spec at $SPEC" >&2; exit 2; }
LANE="${E2E_PORT:-}"

LOGDIR="test-results-${LANE:-8083}-cycle/$BASE"
mkdir -p "$LOGDIR"
log="$LOGDIR/mutate.log" report="$LOGDIR/mutate.json"
rm -f "$report"

t0=$SECONDS
E2E_MUTATION_CSS="$2" PLAYWRIGHT_JSON_OUTPUT_NAME="$report" \
  scripts/e2e-docker.sh "$SPEC" --reporter=list,json >"$log" 2>&1
node scripts/lib/e2e-report-summary.mjs "$report" --mutation
caught=$?
echo "  ($((SECONDS - t0))s, log: $log)"

if [ -n "$(git status --porcelain -- src/ public/)" ]; then
  echo "src/ or public/ has changes (not from this script, which never writes there):"
  git status --short -- src/ public/ | head -5
  exit 1
fi
echo "src/ and public/ untouched"
exit $caught
