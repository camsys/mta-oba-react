import { expect, test } from './support/fixtures';

test.use({ recording: 'route-b63' });

// Stop links on the "to BAY RIDGE" direction, in tab order.
const STOPS = [
  'ATLANTIC AV/HENRY ST',
  'ATLANTIC AV/CLINTON ST',
  'ATLANTIC AV/COURT ST',
  'ATLANTIC AV/SMITH ST',
  'ATLANTIC AV/HOYT ST',
  'ATLANTIC AV/BOND ST',
  'ATLANTIC AV/NEVINS ST',
];
const LAST_STOP = 'ATLANTIC AV/3 AV';

test('keyboard through the header, service alert, directions and stops on B63', async ({ page, checkpoint: compare }) => {
  // 12 checkpoints: generating their references takes longer than the default timeout.
  test.slow();
  // Opening a collapsible pins its max-height to scrollHeight (whole pixels) and only frees
  // it 500ms later (public/js/bustime.js), so wait for that or the content is up to 1px short.
  const opening = () =>
    page
      .locator('.collapse-content')
      .evaluateAll((els) => els.filter((el) => /^[1-9][\d.]*px$/.test((el as HTMLElement).style.maxHeight)).length);
  const checkpoint = async (name: string) => {
    await expect.poll(opening).toBe(0);
    await compare(name);
  };
  const alert = page.getByRole('button', { name: 'Toggle Service Alert Open/' });
  const favorite = page.getByRole('button', { name: 'Toggle favorites status for' });
  const toBayRidge = page.getByRole('button', { name: 'Toggle MTA NYCT_B63 to BAY' });
  const toPier6 = page.getByRole('button', { name: 'Toggle MTA NYCT_B63 to PIER 6' });
  // The other direction has stops with the same names, so look only in this one.
  const bayRidgeStops = page.locator('.route-direction').filter({ has: toBayRidge });
  const firstStop = bayRidgeStops.getByRole('link', { name: 'BROOKLYN BRIDGE PARK/PIER' });
  const stop = (name: string) => bayRidgeStops.getByRole('link', { name, exact: true });

  await page.goto('/?search=B63');
  await checkpoint('loaded');

  // Header to the service alert
  await page.getByRole('link', { name: 'MTA Bus Time Home' }).press('Tab');
  await page.getByRole('link', { name: 'MTA Home' }).press('Tab');
  await page.getByRole('textbox', { name: 'Route, intersection, or stop' }).press('Tab');
  await page.getByRole('button', { name: 'clear search button' }).press('Tab');
  await page.getByRole('button', { name: 'Favorites', exact: true }).press('Tab');
  await page.getByRole('button', { name: 'Nearby Buses' }).press('Tab');
  await alert.press('Enter');
  await checkpoint('alert-open');

  // Into the "to BAY RIDGE" direction and its stops
  await alert.press('Tab');
  await toBayRidge.press('Enter');
  await checkpoint('bay-ridge-open');
  await toBayRidge.press('Tab');
  await checkpoint('focus-first-stop');
  await firstStop.press('Tab');
  for (const name of STOPS) await stop(name).press('Tab');
  await checkpoint('focus-last-stop');

  // Back up the stops to the direction toggle
  await stop(LAST_STOP).press('Shift+Tab');
  for (const name of [...STOPS].reverse()) await stop(name).press('Shift+Tab');
  await firstStop.press('Shift+Tab');
  await checkpoint('focus-back-bay-ridge');
  await toBayRidge.press('Enter');
  await checkpoint('bay-ridge-closed');

  // The "to PIER 6" direction
  await toBayRidge.press('Tab');
  await toPier6.press('Enter');
  await checkpoint('pier-6-open');
  await toPier6.press('Enter');
  await checkpoint('pier-6-closed');

  // Back to the service alert
  await toPier6.press('Shift+Tab');
  await toBayRidge.press('Shift+Tab');
  await alert.press('Enter');
  await checkpoint('alert-closed');

  // On to the favorite toggle
  await alert.press('Tab');
  await toBayRidge.press('Tab');
  await toPier6.press('Tab');
  await favorite.press('Enter');
  await checkpoint('favorited');
  await favorite.press('Enter');
  await checkpoint('unfavorited');
});
