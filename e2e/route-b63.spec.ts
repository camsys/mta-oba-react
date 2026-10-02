import type { Locator } from '@playwright/test';
import { expect, test } from './support/fixtures';

test.use({ recording: 'route-b63' });

test('keyboard through the header, service alert, directions and stops on B63', async ({ page, checkpoint }) => {
  test.slow();
  const favorites = page.getByRole('button', { name: 'Favorites', exact: true });
  const nearby = page.getByRole('button', { name: 'Nearby Buses' });
  const alert = page.getByRole('button', { name: 'Toggle Service Alert Open/' });
  const favorite = page.getByRole('button', { name: 'Toggle favorites status for' });
  const toBayRidge = page.getByRole('button', { name: 'Toggle MTA NYCT_B63 to BAY' });
  const toPier6 = page.getByRole('button', { name: 'Toggle MTA NYCT_B63 to PIER 6' });
  // Both directions have stops with the same names, so look only in one direction.
  const bayRidge = page.locator('.route-direction').filter({ has: toBayRidge });
  const pier6 = page.locator('.route-direction').filter({ has: toPier6 });
  const firstStop = bayRidge.getByRole('link', { name: 'BROOKLYN BRIDGE PARK/PIER' });
  const stop = (direction: Locator, name: string) => direction.getByRole('link', { name, exact: true });
  // The draft named buses by vehicle ID (433, 792), which is live data; these are the same
  // links by their position among the direction's approaching buses. Where a bus sits in the
  // tab order is live data too: 792 had moved one stop on by the time this was recorded.
  const vehicle = (direction: Locator, n: number) => direction.locator('.approaching-buses').getByRole('link').nth(n);
  // Each step names the element that had focus when the key was recorded. Check it still has
  // focus, then press the key there: locator.press would move focus to it first and skip the
  // real tab order, and an Enter on the wrong toggle would be recorded instead of failing.
  const key = async (on: Locator, k: string) => {
    await expect(on).toBeFocused();
    await page.keyboard.press(k);
  };

  await page.goto('/?search=B63');
  await checkpoint('loaded');

  // Mouse
  await toBayRidge.click();
  await checkpoint('bay-ridge-clicked');
  await toBayRidge.click();
  await checkpoint('bay-ridge-clicked-again');

  // Keyboard. The heading isn't focusable or a toggle: the click only sets where Tab starts.
  // Record mode skips checkpoints, so wait for the route card to be laid out before tabbing.
  await expect(favorites).toBeVisible();
  await page.getByRole('heading', { name: 'Routes:' }).click();
  await page.keyboard.press('Tab');
  await key(favorites, 'Tab');
  await key(nearby, 'Tab');
  await key(alert, 'Tab');
  await key(toBayRidge, 'Enter');
  await checkpoint('bay-ridge-enter');
  await key(toBayRidge, 'Enter');
  await checkpoint('bay-ridge-enter-again');

  // The service alert
  await key(toBayRidge, 'Shift+Tab');
  await key(alert, 'Enter');
  await checkpoint('alert-open');
  await key(alert, 'Enter');
  await checkpoint('alert-closed');

  // Into the "to BAY RIDGE" stops, as far as the first bus, and back
  await key(alert, 'Tab');
  await key(toBayRidge, 'Enter');
  await checkpoint('bay-ridge-third-enter');
  await key(toBayRidge, 'Tab');
  await expect(firstStop).toBeFocused();
  await checkpoint('focus-first-stop');
  await key(firstStop, 'Tab');
  await key(stop(bayRidge, 'ATLANTIC AV/HENRY ST'), 'Tab');
  await key(vehicle(bayRidge, 0), 'Shift+Tab');
  await key(stop(bayRidge, 'ATLANTIC AV/HENRY ST'), 'Shift+Tab');
  await key(firstStop, 'Shift+Tab');
  await key(toBayRidge, 'Enter');
  await checkpoint('bay-ridge-fourth-enter');

  // The favorite toggle
  await key(toBayRidge, 'Tab');
  await key(toPier6, 'Tab');
  await key(favorite, 'Enter');
  await checkpoint('favorited');
  await key(favorite, 'Enter');
  await checkpoint('unfavorited');

  // The "to PIER 6" stops, past its first bus, and back
  await key(favorite, 'Shift+Tab');
  await key(toPier6, 'Enter');
  await checkpoint('pier-6-enter');
  const pier6Down: Locator[] = [
    stop(pier6, 'SHORE RD/3 AV'),
    stop(pier6, 'SHORE RD/83 ST'),
    stop(pier6, '4 AV/100 ST'),
    stop(pier6, '4 AV/MARINE AV'),
    stop(pier6, '5 AV/95 ST'),
    vehicle(pier6, 0),
    stop(pier6, '5 AV/92 ST'),
    stop(pier6, '5 AV/89 ST'),
    stop(pier6, '5 AV/86 ST'),
    stop(pier6, '5 AV/83 ST'),
  ];
  await key(toPier6, 'Tab');
  for (const on of pier6Down) await key(on, 'Tab');
  await key(stop(pier6, '5 AV/80 ST'), 'Shift+Tab');
  await checkpoint('focus-pier-6-83-st');
  for (const on of [...pier6Down].reverse()) await key(on, 'Shift+Tab');
  await key(toPier6, 'Enter');
  await checkpoint('pier-6-enter-again');

  // Back up to the header
  await key(toPier6, 'Shift+Tab');
  await key(toBayRidge, 'Shift+Tab');
  await key(alert, 'Shift+Tab');
  await expect(nearby).toBeFocused();
});
