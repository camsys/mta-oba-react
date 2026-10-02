import type { Locator } from '@playwright/test';
import { expect, test } from './support/fixtures';

test.use({ recording: 'stop-400723' });

test('open and close the routes and service alerts on stop 400723, by keyboard and mouse', async ({ page, checkpoint }) => {
  test.slow();
  const m55 = page.getByRole('button', { name: 'Toggle M55 to 44 ST 6 AV' });
  const m55Alert = page.locator('button').filter({ hasText: 'Service Alert for M55' });
  const sim1c = page.getByRole('button', { name: 'Toggle SIM1C to MIDTOWN via' });
  const sim3c = page.getByRole('button', { name: 'Toggle SIM3C to MIDTOWN via' });
  // The draft named buses by vehicle ID (9592, 9668, 7600), which is live data; these are the
  // same links by their position under the route.
  const vehicle = (route: Locator, n: number) =>
    route.locator('xpath=following-sibling::div[1]').getByRole('list').first().getByRole('link').nth(n);
  // Each step names the element that had focus when the key was recorded. Check it still has
  // focus, then press the key there: locator.press would move focus to it first and skip the
  // real tab order, and an Enter on the wrong toggle would be recorded instead of failing.
  const key = async (on: Locator, k: string) => {
    await expect(on).toBeFocused();
    await page.keyboard.press(k);
  };

  await page.goto('/?search=400723');
  await checkpoint('loaded');

  // Keyboard. The heading isn't focusable or a toggle: the click only sets where Tab starts.
  // Record mode skips checkpoints, so wait for the routes to be laid out before tabbing.
  await expect(m55).toBeVisible();
  await page.getByRole('heading', { name: 'Stops:' }).click();
  await page.keyboard.press('Tab');
  await key(page.getByRole('button', { name: 'Favorites', exact: true }), 'Tab');
  await key(page.getByRole('button', { name: 'Nearby Buses' }), 'Tab');
  await key(m55, 'Enter');
  await checkpoint('m55-closed');
  await key(m55, 'Enter');
  await checkpoint('m55-open');

  // Down M55's buses to its service alert
  await key(m55, 'Tab');
  await key(vehicle(m55, 0), 'Tab');
  await key(vehicle(m55, 1), 'Tab');
  await key(vehicle(m55, 2), 'Tab');
  await key(m55Alert, 'Enter');
  await checkpoint('m55-alert-open');
  await key(m55Alert, 'Enter');
  await checkpoint('m55-alert-closed');
  await key(m55Alert, 'Enter');
  await checkpoint('m55-alert-reopened');
  await key(m55Alert, 'Enter');
  await checkpoint('m55-alert-closed-again');

  // Back up to M55 and close it
  await key(m55Alert, 'Shift+Tab');
  await key(vehicle(m55, 2), 'Shift+Tab');
  await key(vehicle(m55, 1), 'Shift+Tab');
  await key(vehicle(m55, 0), 'Shift+Tab');
  await key(m55, 'Enter');
  await checkpoint('m55-closed-last');

  // Mouse. A double-click toggles twice within the collapse timers (public/js/bustime.js), so
  // the section must end where it started, with aria-expanded to match.
  await sim1c.click();
  await checkpoint('sim1c-clicked');
  await sim3c.dblclick();
  await checkpoint('sim3c-double-clicked');
  await sim1c.dblclick();
  await checkpoint('sim1c-double-clicked');
});
