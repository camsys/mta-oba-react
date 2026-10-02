import type { Locator } from '@playwright/test';
import { expect, test } from './support/fixtures';

test.use({ recording: 'location' });

test('keyboard through nearby routes and stops for a location', async ({ page, checkpoint }) => {
  test.slow();
  const favorites = page.getByRole('button', { name: 'Favorites', exact: true });
  const nearbyBuses = page.getByRole('button', { name: 'Nearby Buses' });
  const showRoutes = page.getByRole('button', { name: 'Show nearby routes (currently' });
  const showStops = page.getByRole('button', { name: 'Show nearby stops (currently' });
  const alert = page.getByRole('button', { name: 'Toggle Service Alert Open/' });
  const favorite = page.getByRole('button', { name: 'Toggle favorites status for' }).first();
  const m15 = page.getByRole('button', { name: 'Toggle M15 M15 East Harlem -' });
  const sim10 = page.getByRole('button', { name: 'Toggle SIM10 SIM10' });
  const m15ToEast = page.getByRole('button', { name: 'Toggle MTA NYCT_M15 to EAST' });
  const m15ToSouth = page.getByRole('button', { name: 'Toggle MTA NYCT_M15 to SOUTH' });
  const viewRoute = page.getByRole('button', { name: 'view full Route' }).first();
  // The first two stops under the M15 "to SOUTH FERRY" direction (E 126 ST/2 AV is also on the EAST HARLEM list).
  const e126St = page.getByRole('link', { name: 'E 126 ST/2 AV' }).nth(1);
  const e124St = page.getByRole('link', { name: 'AV/E 124 ST' });
  const stop401778 = page.getByRole('button', { name: 'Toggle 401778 2 AV/E 25 ST' });
  const stop402135 = page.getByRole('button', { name: 'Toggle 402135 E 23 ST/2 AV' });
  const toSouthFerry = page.getByRole('button', { name: 'Toggle M15 to SOUTH FERRY via' });
  const toPikeSt = page.getByRole('button', { name: 'Toggle M15 to PIKE ST -via 2' });
  // In 2 AV/E 25 ST's card: the service alert under "to PIKE ST" (nth(0) is the one under "to SOUTH FERRY").
  const pikeStAlert = alert.nth(1);
  const viewFullRoute = page.getByRole('button', { name: 'view full Full Route' }).nth(1);
  const viewStop = page.getByRole('button', { name: 'view full Stop' }).first();
  // The draft named buses by vehicle ID (5887, 5329, 5861), which is live data; these are the
  // same links by their position under the direction.
  const bus = (direction: Locator, n: number) =>
    direction.locator('xpath=following-sibling::*[1]').getByRole('link').nth(n);
  // Each step names the element that had focus when the key was recorded. Check it still has
  // focus, then press the key there: locator.press would move focus to it first and skip the
  // real tab order, and an Enter on the wrong toggle would be recorded instead of failing.
  // Also let the last toggle finish (public/js/bustime.js runs it on 10ms and 500ms timers), as
  // checkpoint() does: record mode skips checkpoints, and a toggle pressed while another is still
  // pending leaves different elements tabbable than the draft saw.
  const key = async (on: Locator, k: string) => {
    await expect(on).toBeFocused();
    await page.waitForFunction(
      () =>
        !document.querySelector('[data-collapse-state]') &&
        [...document.querySelectorAll<HTMLElement>('.collapse-content')].every((el) =>
          ['', 'none', '0px'].includes(el.style.maxHeight),
        ),
    );
    await page.keyboard.press(k);
  };

  await page.goto('/?search=40.738933,-73.979874');
  await checkpoint('loaded');

  // The heading isn't focusable or a toggle: the click only sets where Tab starts.
  // Record mode skips checkpoints, so wait for the routes to be laid out before tabbing, and for
  // M15's service alert: one that arrives after M15 is opened mounts untabbable (tabIndex -1).
  await expect(m15).toBeVisible();
  await expect(alert.first()).toBeAttached({ timeout: 15_000 });
  await page.getByRole('heading', { name: 'Nearby:' }).click();
  await page.keyboard.press('Tab');

  // Header to the nearby routes
  await key(favorites, 'Tab');
  await key(nearbyBuses, 'Tab');
  await key(showRoutes, 'Tab');
  await key(showStops, 'Tab');
  await key(m15, 'Enter');
  await checkpoint('m15-open');

  // Down the M15 card to its favorite toggle
  await key(m15, 'Tab');
  await key(alert.first(), 'Tab');
  await key(m15ToEast, 'Tab');
  await key(m15ToSouth, 'Tab');
  await key(viewRoute, 'Tab');
  await key(favorite, 'Enter');
  await checkpoint('m15-favorited');
  await key(favorite, 'Enter');
  await checkpoint('m15-unfavorited');

  // Back up to the "to SOUTH FERRY" direction, into its stops and out again
  await key(favorite, 'Shift+Tab');
  await key(viewRoute, 'Shift+Tab');
  await key(m15ToSouth, 'Enter');
  await checkpoint('m15-south-open');
  await key(m15ToSouth, 'Tab');
  await key(e126St, 'Tab');
  await checkpoint('m15-south-stop-focused');
  await key(e124St, 'Shift+Tab');
  await key(e126St, 'Shift+Tab');
  await key(m15ToSouth, 'Enter');
  await checkpoint('m15-south-closed');

  // Past the closed direction and back up to "to EAST HARLEM"
  await key(m15ToSouth, 'Tab');
  await key(viewRoute, 'Tab');
  await key(favorite, 'Shift+Tab');
  await key(viewRoute, 'Shift+Tab');
  await key(m15ToSouth, 'Shift+Tab');
  await key(m15ToEast, 'Enter');
  await checkpoint('m15-east-open');

  // The M15 service alert, then close the card
  await key(m15ToEast, 'Shift+Tab');
  await key(alert.first(), 'Enter');
  await checkpoint('m15-alert-open');
  await key(alert.first(), 'Shift+Tab');
  await key(m15, 'Enter');
  await checkpoint('m15-closed');

  // SIM10
  await key(m15, 'Tab');
  await key(sim10, 'Enter');
  await checkpoint('sim10-open');
  await key(sim10, 'Enter');
  await checkpoint('sim10-closed');

  // Nearby stops: 2 AV/E 25 ST
  await key(sim10, 'Shift+Tab');
  await key(m15, 'Shift+Tab');
  await key(showStops, 'Enter');
  await checkpoint('stops');
  // Record mode skips checkpoints: wait for 401778's buses, which mount untabbable (tabIndex -1)
  // if they arrive after the stop is opened.
  await expect(toSouthFerry).toBeAttached();
  await key(showStops, 'Tab');
  await key(stop401778, 'Tab');
  await key(stop402135, 'Shift+Tab');
  await key(stop401778, 'Enter');
  await checkpoint('stop-401778-open');
  await key(stop401778, 'Tab');
  await key(toSouthFerry, 'Enter');
  await checkpoint('south-ferry-closed');
  await key(toSouthFerry, 'Tab');
  await key(toPikeSt, 'Tab');
  await key(bus(toPikeSt, 0), 'Tab');
  await key(bus(toPikeSt, 1), 'Tab');
  await key(bus(toPikeSt, 2), 'Tab');
  await key(pikeStAlert, 'Enter');
  await checkpoint('stop-401778-alert-open');

  // Back up to the stop and close it
  await key(pikeStAlert, 'Shift+Tab');
  await key(bus(toPikeSt, 2), 'Shift+Tab');
  await key(bus(toPikeSt, 1), 'Shift+Tab');
  await key(bus(toPikeSt, 0), 'Shift+Tab');
  await key(toPikeSt, 'Shift+Tab');
  await key(toSouthFerry, 'Shift+Tab');
  await key(stop401778, 'Enter');
  await checkpoint('stop-401778-closed');

  // E 23 ST/2 AV (402135)
  await key(stop401778, 'Tab');
  await key(stop402135, 'Enter');
  await checkpoint('stop-402135-open');
  await key(stop402135, 'Enter');
  await checkpoint('stop-402135-closed');

  // Reopen 2 AV/E 25 ST and tab down to its favorite toggle
  await key(stop402135, 'Shift+Tab');
  await key(stop401778, 'Enter');
  await checkpoint('stop-401778-reopened');
  await key(stop401778, 'Tab');
  await key(toSouthFerry, 'Tab');
  await key(alert.first(), 'Tab');
  await key(toPikeSt, 'Tab');
  await key(bus(toPikeSt, 0), 'Tab');
  await key(bus(toPikeSt, 1), 'Tab');
  await key(bus(toPikeSt, 2), 'Tab');
  await key(pikeStAlert, 'Tab');
  await key(viewFullRoute, 'Tab');
  await key(viewStop, 'Tab');
  await key(favorite, 'Enter');
  await checkpoint('stop-401778-favorited');

  // Back up to the stop and close it
  await key(favorite, 'Shift+Tab');
  await key(viewStop, 'Shift+Tab');
  await key(viewFullRoute, 'Shift+Tab');
  await key(pikeStAlert, 'Shift+Tab');
  await key(bus(toPikeSt, 2), 'Shift+Tab');
  await key(bus(toPikeSt, 1), 'Shift+Tab');
  await key(bus(toPikeSt, 0), 'Shift+Tab');
  await key(toPikeSt, 'Shift+Tab');
  await key(alert.first(), 'Shift+Tab');
  await key(toSouthFerry, 'Shift+Tab');
  await key(stop401778, 'Enter');
  await checkpoint('stop-401778-closed-last');
});
