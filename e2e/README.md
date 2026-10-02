# End-to-end tests (Playwright)

## Snapshots

`checkpoint(name)` compares the page against two committed snapshots in `__snapshots__/`:
an ARIA snapshot of the sidebar (text, structure, order) and a screenshot of the whole page.
Regenerate them with `npm run test:e2e -- --update-snapshots`.

### Setting up snapshots for a spec

Do these in order whenever a spec gains checkpoints, or after an intended UI change.

1. **Generate the reference snapshots** from code you know is correct:

   ```sh
   npm run test:e2e -- e2e/<spec>.spec.ts --update-snapshots
   ```

   This writes `<checkpoint>.png` and `<checkpoint>.aria.yml` to
   `e2e/__snapshots__/<spec>.spec.ts/<test name>/`. Open the PNGs and read the YAML before
   committing; from then on they define what "correct" looks like.

2. **Check they're stable.** Replay several times; every run should pass with no differences:

   ```sh
   npm run test:e2e -- e2e/<spec>.spec.ts --repeat-each=5
   ```

   A checkpoint that fails intermittently means something on the page is still changing
   (a marker settling, a loading state, a clock). Fix it in the snapshot setup (a mask in
   `checkpoint`, or waiting for the page to settle), not in the app.

3. **Prove they catch changes.** Make a deliberate, visible change in the app (for example,
   reverse the order the favorites list renders in), then run the spec:

   ```sh
   npm run test:e2e -- e2e/<spec>.spec.ts
   npx playwright show-report
   ```

   The affected checkpoints should fail. The report shows the expected image, the actual
   one, and a diff with changed pixels highlighted; ARIA snapshot failures show a text diff.
   Revert the change afterwards.

Snapshots are compared with a 1% pixel tolerance (`maxDiffPixelRatio` in
`playwright.config.ts`). The clock in the Refresh button is masked, since the browser
clock keeps running during replay.

### Fonts are currently ignored

Screenshots do **not** test the app's real fonts. Before each screenshot, every element is
switched to Arimo (`e2e/support/screenshotStyles.ts`), a font with Arial's metrics.

Why: the app asks for Helvetica/Arial. macOS has them and CI's Linux doesn't, so CI falls
back to a font with different glyph widths, text wraps differently, and every screenshot
would differ between a Mac and CI. Forcing one font lets the same snapshots work on both.

What this means: a change to the app's fonts (family, a missing web font, fallback order)
won't fail any test. Size, weight, color, wrapping and layout are still compared. If fonts
start to matter, the alternative is taking and comparing screenshots inside Playwright's
Docker image instead.
