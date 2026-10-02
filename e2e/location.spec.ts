import { test } from './support/fixtures';

test.use({ recording: 'location' });

test('keyboard through nearby routes and stops for a location', async ({ page, checkpoint: compare }) => {
  // 27 checkpoints don't fit in the default timeout.
  test.slow();

  // public/js/bustime.js finishes a toggle on timers: a section opens with a px max-height that
  // becomes `none` 500ms later, and closes 10ms after the keypress. Snapshotting before then catches
  // it half done, and toggling again before then lets the stale 500ms timer re-expand a closed
  // section. So wait for every toggle to finish before its checkpoint (and so before the next toggle).
  const checkpoint = async (name: string) => {
    await page.waitForFunction(() =>
      [...document.querySelectorAll<HTMLElement>('.collapse-content')].every((el) =>
        ['', 'none', '0px'].includes(el.style.maxHeight),
      ),
    );
    await compare(name);
  };

  const alert = page.getByRole('button', { name: 'Toggle Service Alert Open/' });
  const favorite = page.getByRole('button', { name: 'Toggle favorites status for' }).first();
  const showRoutes = page.getByRole('button', { name: 'Show nearby routes (currently' });
  const showStops = page.getByRole('button', { name: 'Show nearby stops (currently' });
  const m15 = page.getByRole('button', { name: 'Toggle M15 M15 East Harlem -' });
  const sim10 = page.getByRole('button', { name: 'Toggle SIM10 SIM10' });
  const m15ToEast = page.getByRole('button', { name: 'Toggle MTA NYCT_M15 to EAST' });
  const m15ToSouth = page.getByRole('button', { name: 'Toggle MTA NYCT_M15 to SOUTH' });
  const viewRoute = page.getByRole('button', { name: 'view full Route' }).first();
  const viewStop = page.getByRole('button', { name: 'view full Stop' }).first();
  const stop401778 = page.getByRole('button', { name: 'Toggle 401778 2 AV/E 25 ST' });
  const stop402135 = page.getByRole('button', { name: 'Toggle 402135 E 23 ST/2 AV' });
  const stop401832 = page.getByRole('button', { name: 'Toggle 401832 E 23 ST/2 AV' });
  const toPikeSt = page.getByRole('button', { name: 'Toggle M15 to PIKE ST -via 2' });
  const toSouthFerry = page.getByRole('button', { name: 'Toggle M15 to SOUTH FERRY via' });
  const toMillBasin = page.getByRole('button', { name: 'Toggle BM1 to MILL BASIN - E' });
  // Buses listed under a direction, by position: which buses these are depends on when it's recorded.
  const bus = (direction: typeof toPikeSt, n: number) =>
    direction.locator('xpath=following-sibling::*[1]').getByRole('link').nth(n);

  await page.goto('/?search=40.738933,-73.979874');
  await checkpoint('loaded');

  // Header to the nearby routes
  await page.locator('div').filter({ hasText: 'FavoritesNearby BusesNearby:' }).nth(2).press('Tab');
  await page.getByRole('button', { name: 'Favorites', exact: true }).press('Tab');
  await page.getByRole('button', { name: 'Nearby Buses' }).press('Tab');
  await showRoutes.press('Tab');
  await showStops.press('Tab');
  await m15.press('Enter');
  await checkpoint('m15-open');

  // Down the M15 card to its favorite toggle
  await m15.press('Tab');
  await alert.first().press('Tab');
  await m15ToEast.press('Tab');
  await m15ToSouth.press('Tab');
  await viewRoute.press('Tab');
  await favorite.press('Enter');
  await checkpoint('m15-favorited');
  await favorite.press('Enter');
  await checkpoint('m15-unfavorited');

  // Back up to the "to SOUTH FERRY" direction
  await favorite.press('Shift+Tab');
  await viewRoute.press('Shift+Tab');
  await m15ToSouth.press('Enter');
  await checkpoint('m15-south-open');
  await m15ToSouth.press('Enter');
  await checkpoint('m15-south-closed');

  // The M15 service alert, closing and reopening the card
  await m15ToSouth.press('Shift+Tab');
  await m15ToEast.press('Shift+Tab');
  await alert.first().press('Enter');
  await checkpoint('m15-alert-open');
  await alert.first().press('Shift+Tab');
  await m15.press('Enter');
  await checkpoint('m15-closed');
  await m15.press('Tab');
  await sim10.press('Shift+Tab');
  await m15.press('Enter');
  await checkpoint('m15-reopened');
  await m15.press('Tab');
  await alert.first().press('Enter');
  await checkpoint('m15-alert-closed');
  await alert.first().press('Shift+Tab');
  await m15.press('Enter');
  await checkpoint('m15-closed-again');
  await m15.press('Enter');
  await checkpoint('m15-opened-again');
  await m15.press('Tab');
  await alert.first().press('Enter');
  await checkpoint('m15-alert-reopened');
  await alert.first().press('Shift+Tab');
  await m15.press('Enter');
  await checkpoint('m15-closed-last');

  // SIM10
  await m15.press('Tab');
  await sim10.press('Enter');
  await checkpoint('sim10-open');

  // Nearby stops: 2 AV/E 25 ST
  await sim10.press('Shift+Tab');
  await m15.press('Shift+Tab');
  await showStops.press('Enter');
  await checkpoint('stops');
  await showStops.press('Tab');
  await stop401778.press('Enter');
  await checkpoint('stop-401778-open');
  await stop401778.press('Tab');
  await toPikeSt.press('Tab');
  await bus(toPikeSt, 0).press('Tab');
  await bus(toPikeSt, 1).press('Tab');
  await bus(toPikeSt, 2).press('Tab');
  await alert.first().press('Enter');
  await checkpoint('stop-401778-alert-open');
  await alert.first().press('Enter');
  await checkpoint('stop-401778-alert-closed');
  await alert.first().press('Shift+Tab');
  await bus(toPikeSt, 2).press('Shift+Tab');
  await bus(toPikeSt, 1).press('Shift+Tab');
  await bus(toPikeSt, 0).press('Shift+Tab');
  await toPikeSt.press('Enter');
  await checkpoint('pike-st-closed');
  await toPikeSt.press('Tab');
  await toSouthFerry.press('Enter');
  await checkpoint('south-ferry-closed');
  await toSouthFerry.press('Tab');
  await viewStop.press('Tab');
  await favorite.press('Enter');
  await checkpoint('stop-401778-favorited');

  // Back up to the stop list
  await favorite.press('Shift+Tab');
  await viewStop.press('Shift+Tab');
  await toSouthFerry.press('Shift+Tab');
  await toPikeSt.press('Shift+Tab');
  await stop401778.press('Shift+Tab');
  await showStops.press('Tab');
  await stop401778.press('Enter');
  await checkpoint('stop-401778-closed');

  // E 23 ST/2 AV (402135)
  await stop401778.press('Tab');
  await stop402135.press('Enter');
  await checkpoint('stop-402135-open');
  await stop402135.press('Tab');
  await toMillBasin.press('Tab');
  await bus(toMillBasin, 0).press('Tab');
  await alert.nth(2).press('Enter');
  await checkpoint('stop-402135-alert-open');
  await alert.nth(2).press('Shift+Tab');
  await bus(toMillBasin, 0).press('Shift+Tab');
  await toMillBasin.press('Shift+Tab');
  await stop402135.press('Enter');
  await checkpoint('stop-402135-closed');

  // E 23 ST/2 AV (401832)
  await stop402135.press('Tab');
  await stop401832.press('Enter');
  await checkpoint('stop-401832-open');
  await stop401832.press('Enter');
  await checkpoint('stop-401832-closed');
});
