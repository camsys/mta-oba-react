# AGENTS.md

Notes for AI coding agents (and humans) working in this repo. Keep it short.
Give the *why* with each rule, so it can be applied to cases it doesn't name.

## Commands
- `npm run dev-start`: webpack dev server (http://localhost:8080/?search=B63)
- `npm run build`: production build into `dist/` (CI runs this plus `npm audit --audit-level=high`)
- `npm test`: Node built-in test runner over `test/*.test.js`; no test framework dependency
- `npm run test:e2e`: Playwright browser tests in `e2e/`, replaying recorded API responses. How to write, record and snapshot a test: `e2e/README.md`
- Converting a codegen draft into a spec: follow "Converting a draft (agents)" in `e2e/README.md` (`scripts/e2e-*`); it keeps each conversion to short tool summaries.

The README and Dockerfile mention `npm run start` / `build-css`, which no longer exist. Use the scripts in `package.json`.

## Layout
- `src/components/`: React components (`views/` = cards, `map/` = Leaflet map, `pageStructure/` = header, sidebar, search, `util/` = state components)
- `src/js/`, `src/utils/`: data fetching, state updates, map marker factories
- `src/js/old/`: legacy code; don't extend it
- `public/`: copied as-is into `dist/` (includes `version.json`)
- Webpack aliases: `Components`, `Utils`, `Assets`, `JS`, `Style` (see `webpack.config.js`)
- The codebase is mid-migration from JS to TS. Prefer `.tsx` for new components.
  Why: README notes the JS data models were a workaround for the lack of typing.

## Rules
- **e2e snapshots come from code you mean to accept:** check `git diff -- src/ public/` before `--update-snapshots` (`public/js/` changes the page too), and never regenerate snapshots just to make a failing test pass. Generate them with `npm run test:e2e:docker -- --update-snapshots`, never natively.
  Why: references define "correct"; generating them from a broken or experimental build makes the tests protect the bug. Reference screenshots are Linux (CI's Docker image); macOS renders text differently, so native runs skip screenshots.
- **Parallel e2e runs:** when other agents or terminals may be running e2e tests in this checkout, put your own `E2E_PORT` (digits only, not 8082-8084) on every e2e command, including record runs and `--update-snapshots`. One run per port at a time. See "Running several at once" in `e2e/README.md`.
  Why: without it, runs share port 8083 and `dist-e2e/`, so a second run fails, or writes into the first run's build while it's under test.
- **Recording changes other lanes' replays:** run `test:e2e:record` for a spec only when nothing else is replaying that spec. Afterwards, check `git diff --stat -- e2e/recordings/`, then either keep the new recording (and regenerate that spec's snapshots) or restore it.
  Why: lanes keep separate builds but share `e2e/recordings/`, so a new recording makes existing snapshots fail for every lane, which looks like a UI regression.
- **Env config defaults in `webpack.config.js`:** use `??`, not `||`, for any variable that a remote env config must be able to set to `''` (e.g. `BETA_BANNER_TEXT`, `BETA_BANNER_LINK`), and add its key to `test/webpack.config.test.js` (or, if it isn't a `DefinePlugin` value, a test showing `''` turns it off, as in `test/gaTag.test.js`).
  Why: `||` treats `''` as missing and silently restores the default, so an environment can't turn the feature off.
- **Google tag on every page:** new HTML pages in `public/` need `<!-- GA_TAG_INJECTION_MARKER: replaced at build time by webpack.config.js -->` as the first line inside `<head>`. CI fails the build otherwise (`npm test`, then `npm run check-ga-tag` over `dist/`).
  Why: MTA compares usage between the new and classic sites; a page without the tag silently drops out of those numbers.
- **Versioning:** `package.json`, `package-lock.json` and `public/version.json` must match. `npm version` syncs them through `scripts/sync-version.mjs`.
  Why: deploys are tagged by version and the app reports `version.json`. See "How to deploy" in README.md.
