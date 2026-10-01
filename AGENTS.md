# AGENTS.md

Notes for AI coding agents (and humans) working in this repo. Keep it short.
Give the *why* with each rule, so it can be applied to cases it doesn't name.

## Commands
- `npm run dev-start`: webpack dev server (http://localhost:8080/?LineRef=B63)
- `npm run build`: production build into `dist/` (CI runs this plus `npm audit --audit-level=high`)
- `npm test`: Node built-in test runner over `test/*.test.js`; no test framework dependency

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
- **Env config defaults in `webpack.config.js`:** use `??`, not `||`, for any variable that a remote env config must be able to set to `''` (e.g. `BETA_BANNER_TEXT`, `BETA_BANNER_LINK`), and add its key to `test/webpack.config.test.js` (or, if it isn't a `DefinePlugin` value, a test showing `''` turns it off, as in `test/gaTag.test.js`).
  Why: `||` treats `''` as missing and silently restores the default, so an environment can't turn the feature off.
- **Versioning:** `package.json`, `package-lock.json` and `public/version.json` must match. `npm version` syncs them through `scripts/sync-version.mjs`.
  Why: deploys are tagged by version and the app reports `version.json`. See "How to deploy" in README.md.
