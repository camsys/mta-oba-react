#!/usr/bin/env bash
# Runs the e2e suite inside Playwright's Linux Docker image, the same one CI uses, so
# screenshots match the committed references (which are made on Linux; see e2e/README.md).
# Arguments go to `playwright test`:
#   npm run test:e2e:docker -- e2e/favorites.spec.ts --update-snapshots
#
# The image ships Node 24 (v1.63.0-noble); CI builds with Node 20. That's fine here: the Node
# version doesn't affect rendering, only the browser build does, and that comes from the tag.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# The tag must match the installed @playwright/test exactly: another version has another
# browser build, and its screenshots mean nothing.
VERSION="$(node -p "require('@playwright/test/package.json').version")"
IMAGE="mcr.microsoft.com/playwright:v${VERSION}-noble"

# Linux node_modules live in a named volume over the mount, so `npm ci` in the container
# doesn't replace the host's macOS binaries. Named after the checkout's path, so separate
# copies of the repo don't share (and fight over) one.
HASH="$( (printf %s "$ROOT" | shasum 2>/dev/null || printf %s "$ROOT" | sha1sum) | cut -c1-12)"
VOLUME="mta-oba-react-e2e-node-modules-${HASH}"

# A TTY keeps the list reporter's colors; CI and pipes don't have one.
TTY=
if [ -t 1 ]; then TTY=-t; fi

# --ipc=host: Chromium runs out of shared memory without it.
# E2E_PORT and CI are passed only if set, so lanes and CI settings behave as they do natively.
exec docker run --rm $TTY --ipc=host \
  -v "$ROOT":/work \
  -v "$VOLUME":/work/node_modules \
  -w /work \
  -e E2E_PORT -e CI \
  "$IMAGE" \
  bash -c '
    # npm ci only when package-lock.json changed since the volume was last installed.
    lock="$(sha1sum package-lock.json | cut -d" " -f1)"
    if [ "$(cat node_modules/.e2e-lock-hash 2>/dev/null)" != "$lock" ]; then
      npm ci --no-audit --no-fund || exit 1
      echo "$lock" > node_modules/.e2e-lock-hash
    fi
    exec npx playwright test "$@"' bash "$@"
