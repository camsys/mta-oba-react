#!/usr/bin/env bash
# The steps after recording a spec, in order, with one line per stage. Stops at the first
# failure and prints only its first error (and the focus diagnostic, if any); full logs go to
# files whose paths it prints. See "Converting a draft (agents)" in e2e/README.md.
#
#   E2E_PORT=<port> scripts/e2e-cycle.sh <spec> [--from regenerate|repeat|native] [--allow-src-changes]
#
# Stages:
#   recordings  git diff --stat -- e2e/recordings/ (and the spec's recording exists)
#   regenerate  the spec's references, in Docker, with --update-snapshots=all
#   repeat      Docker, --repeat-each=5
#   native      native, --repeat-each=5 (ARIA snapshots, flows, page errors; no screenshots)
#
# Recording stays a separate, manual step: lanes share e2e/recordings/ (see AGENTS.md).
# regenerate refuses to run while src/ or public/ has changes, since references must come from
# code you mean to accept; --allow-src-changes overrides that when the change is the point.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

usage() { echo "usage: E2E_PORT=<port> scripts/e2e-cycle.sh <spec> [--from regenerate|repeat|native] [--allow-src-changes]" >&2; exit 2; }
SPEC_ARG= FROM=recordings ALLOW_SRC=
while [ $# -gt 0 ]; do
  case "$1" in
    --from) FROM="${2:-}"; shift 2 ;;
    --allow-src-changes) ALLOW_SRC=1; shift ;;
    -*) usage ;;
    *) SPEC_ARG="$1"; shift ;;
  esac
done
[ -n "$SPEC_ARG" ] || usage
case "$FROM" in recordings|regenerate|repeat|native) ;; *) usage ;; esac

BASE="$(basename "$SPEC_ARG")"; BASE="${BASE%.spec.ts}"
SPEC="e2e/$BASE.spec.ts"
[ -f "$SPEC" ] || { echo "no spec at $SPEC" >&2; exit 2; }
LANE="${E2E_PORT:-}"
[ -n "$LANE" ] || echo "note: E2E_PORT is not set, so this uses the default lane (8083); set it if anything else runs e2e tests here"

# Inside the checkout (Docker writes there too) and ignored by git (/test-results*/). Not in
# test-results-<lane>/ itself: Playwright empties that at the start of every run.
LOGDIR="test-results-${LANE:-8083}-cycle/$BASE"
rm -rf "$LOGDIR" && mkdir -p "$LOGDIR"
echo "$SPEC, lane ${LANE:-default}, logs in $LOGDIR/"

order="recordings regenerate repeat native"
started=
should_run() {
  for s in $order; do
    [ "$s" = "$FROM" ] && started=1
    [ "$s" = "$1" ] && { [ -n "$started" ]; return; }
  done
}

pass() { printf '%-11s PASS %s\n' "$1" "$2"; }
fail() {
  printf '%-11s FAIL %s\n' "$1" "$2"
  exit 1
}

# Runs `playwright test` (natively or through Docker) with a JSON report next to the log.
run_stage() {
  local name="$1"; shift
  local log="$LOGDIR/$name.log" report="$LOGDIR/$name.json" t0=$SECONDS code summary
  PLAYWRIGHT_JSON_OUTPUT_NAME="$report" "$@" --reporter=list,json >"$log" 2>&1
  code=$?
  summary="$(node scripts/lib/e2e-report-summary.mjs "$report" 2>&1)"
  local first="${summary%%$'\n'*}"
  if [ $code -eq 0 ]; then
    pass "$name" "($((SECONDS - t0))s) $first"
  else
    printf '%-11s FAIL (%ss) %s\n' "$name" "$((SECONDS - t0))" "$first"
    [ "$summary" != "$first" ] && printf '%s\n' "${summary#*$'\n'}"
    echo "  log: $log"
    case "$summary" in *.png*) echo "  diff images: test-results${LANE:+-$LANE}/ (actual, expected and diff per failed screenshot)" ;; esac
    exit 1
  fi
}

if should_run recordings; then
  REC="$(sed -nE "s/.*recording: *['\"]([^'\"]+)['\"].*/\1/p" "$SPEC" | head -1)"
  if [ -z "$REC" ]; then fail recordings "$SPEC has no test.use({ recording })"; fi
  if [ ! -f "e2e/recordings/$REC.json" ]; then fail recordings "e2e/recordings/$REC.json is missing; record it first"; fi
  # Names, not just counts, so the changed files can be checked against what was recorded.
  stat="$(git diff --name-only -- e2e/recordings/ | xargs -n1 basename 2>/dev/null | paste -sd ' ' -)"
  stat="${stat:+changed: $stat}"
  untracked="$(git ls-files --others --exclude-standard -- e2e/recordings/ | xargs -n1 basename 2>/dev/null | paste -sd ' ' -)"
  pass recordings "${stat:-no changes against HEAD}${untracked:+; untracked: $untracked}"
  git diff --stat -- e2e/recordings/ >"$LOGDIR/recordings.log"
fi

if should_run regenerate; then
  if [ -z "$ALLOW_SRC" ] && [ -n "$(git status --porcelain -- src/ public/)" ]; then
    fail regenerate "src/ or public/ has changes; references must come from code you mean to accept (--allow-src-changes)"
  fi
  run_stage regenerate scripts/e2e-docker.sh "$SPEC" --update-snapshots=all
  refs="$(node scripts/e2e-refs-report.mjs "$SPEC" | grep -E '^  (orphaned|missing):' | sed 's/^  //; s/  */ /g' | paste -sd ';' -)"
  echo "            refs: $refs"
fi

should_run repeat && run_stage repeat scripts/e2e-docker.sh "$SPEC" --repeat-each=5
should_run native && run_stage native npx playwright test "$SPEC" --repeat-each=5
exit 0
