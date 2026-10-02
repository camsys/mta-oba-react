import type { Locator } from '@playwright/test';
import { expect, test } from './support/fixtures';

test.use({ recording: 'tab-through' });

test('tab through the home page, search, a route, a stop and favorites', async ({ page, checkpoint }) => {
  test.slow();

  const body = page.locator('body');
  const searchBox = page.getByRole('textbox', { name: 'Route, intersection, or stop' });
  const clearSearch = page.getByRole('button', { name: 'clear search button' });
  const favorites = page.getByRole('button', { name: 'Favorites', exact: true });
  const nearby = page.getByRole('button', { name: 'Nearby Buses' });
  const toggleFavorite = page.getByRole('button', { name: 'Toggle favorites status for' });
  const fullRoute = page.getByRole('button', { name: 'view full Full Route' });

  // Route page: the direction toggles, and the stops and buses listed under one direction.
  const b1ToBayRidge = page.getByRole('button', { name: 'Toggle MTA NYCT_B1 to BAY' });
  const b1ToManhattanBeach = page.getByRole('button', {
    name: 'Toggle MTA NYCT_B1 to MANHATTAN BEACH KINGSBORO CC Open / Closed',
  });
  const b16ToBayRidge = page.getByRole('button', { name: 'Toggle MTA NYCT_B16 to BAY' });
  const b16ToLefferts = page.getByRole('button', {
    name: 'Toggle MTA NYCT_B16 to LEFFERTS GARDENS PROSPECT PK STA Open / Closed',
  });
  // A direction's stops are in the DOM (and the accessibility tree) while it's closed too, and
  // both directions list the same names, so stops are looked up inside their direction.
  const directionOf = (toggle: Locator) => toggle.locator('xpath=..');
  const stop = (toggle: Locator, name: string) => directionOf(toggle).getByRole('link', { name, exact: true });
  // Buses listed under a stop on the route page. The draft had them by vehicle ID (4791 under
  // 86 ST/4 AV, 408 under SHORE RD/91 ST), but QA's buses move by the minute: in the recording
  // neither stop has a bus (B1's nearest is at 86 ST/DAHLGREN PL). So the steps tab through
  // whatever buses the recording lists under each stop, checking focus on every one.
  const busesAt = (toggle: Locator, stopName: string) =>
    directionOf(toggle)
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: stopName, exact: true }) })
      .locator('.approaching-buses')
      .getByRole('link');
  const tabDownStops = async (toggle: Locator, names: string[]) => {
    for (const name of names) {
      await key(stop(toggle, name), 'Tab');
      const buses = busesAt(toggle, name);
      const count = await buses.count();
      for (let i = 0; i < count; i++) await key(buses.nth(i), 'Tab');
    }
  };

  // Stop page: the routes serving it, and their buses (IDs in the draft: B1 4791, 4743, 4788;
  // B16 408, 357, 278).
  const stopB1 = page.getByRole('button', { name: 'Toggle B1 to MANHATTAN BEACH' });
  const stopB16 = page.getByRole('button', { name: 'Toggle B16 to LEFFERTS' });
  const stopBuses = (route: Locator) =>
    route.locator('xpath=following-sibling::div[1]').getByRole('list').first().getByRole('link');
  const vehicle = (route: Locator, n: number) => stopBuses(route).nth(n);

  // Each step names the element that had focus when the key was recorded. Check it still has
  // focus, then press the key there: locator.press would move focus to it first and skip the
  // real tab order, and an Enter on the wrong element would be recorded instead of failing.
  const key = async (on: Locator, k: string) => {
    await expect(on).toBeFocused();
    await page.keyboard.press(k);
  };

  // Home page. Nothing has focus after the load; the first Tab reaches the header's first link.
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'All Routes Available' })).toBeVisible();
  await checkpoint('home');
  await key(body, 'Tab');
  await key(page.getByRole('link', { name: 'MTA Bus Time Home' }), 'Tab');
  await key(page.getByRole('link', { name: 'MTA Home' }), 'Tab');
  await key(searchBox, 'Tab');
  await key(page.getByRole('button', { name: 'Routes & Stops Near Me' }), 'Tab');
  await key(page.getByRole('button', { name: 'All Routes Available' }), 'Tab');
  await key(page.getByRole('button', { name: 'Favorites' }), 'Enter');
  await expect(page.getByRole('heading', { name: 'Favorites:' })).toBeVisible();
  await checkpoint('home-favorites');

  // Favorites from the header, then clear the search and search for b1
  await key(body, 'Tab');
  await key(favorites, 'Enter');
  // The clear button is disabled (out of the tab order) until the search box shows
  // "View Favorites"; Shift+Tab before then lands in the search box.
  await expect(clearSearch).toBeEnabled();
  await checkpoint('header-favorites');
  await key(favorites, 'Shift+Tab');
  // The clear button focuses the search box while it still says "View Favorites", which fetches
  // suggestions for that. Its (empty) answer arriving after b1's would wipe b1's suggestions.
  const viewFavoritesSuggestions = page.waitForResponse((r) => r.url().includes('/api/autocomplete?term=View'));
  await key(clearSearch, 'Enter');
  await viewFavoritesSuggestions;
  await checkpoint('search-cleared');
  await searchBox.fill('b1');
  // Arrow keys pressed before the suggestions arrive pick a different one, or none.
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option', { name: 'B1', exact: true })).toBeVisible();
  await key(searchBox, 'ArrowDown');
  await key(searchBox, 'Enter');
  await expect(b1ToManhattanBeach).toBeVisible();
  await expect(clearSearch).toBeEnabled();
  await checkpoint('b1-route');

  // B1 route: open the Manhattan Beach direction, down to its second stop
  await key(body, 'Tab');
  await key(clearSearch, 'Tab');
  await key(favorites, 'Tab');
  await key(nearby, 'Tab');
  await key(b1ToBayRidge, 'Tab');
  await key(b1ToManhattanBeach, 'Enter');
  await checkpoint('b1-manhattan-beach-open');
  await key(b1ToManhattanBeach, 'Tab');
  await tabDownStops(b1ToManhattanBeach, ['86 ST/4 AV']);
  await key(stop(b1ToManhattanBeach, '86 ST/5 AV'), 'Enter');
  await expect(stopB1).toBeVisible();
  await checkpoint('stop-page');

  // Stop page: down B1's buses to its full route
  await key(body, 'Tab');
  await key(stopB1, 'Tab');
  await key(vehicle(stopB1, 0), 'Tab');
  await key(vehicle(stopB1, 1), 'Tab');
  await key(vehicle(stopB1, 2), 'Tab');
  await key(fullRoute.first(), 'Enter');
  await expect(b1ToManhattanBeach).toBeVisible();
  await checkpoint('b1-full-route');

  // B1 route again: favorite it, refresh, then back to the stop
  await key(body, 'Tab');
  await key(b1ToBayRidge, 'Tab');
  await key(b1ToManhattanBeach, 'Tab');
  await key(toggleFavorite, 'Enter');
  await checkpoint('b1-favorited');
  await key(toggleFavorite, 'Tab');
  await key(page.getByRole('button', { name: 'Refresh the data' }), 'Enter');
  await checkpoint('b1-refreshed');
  await key(page.getByRole('button', { name: 'Refresh the data' }), 'Shift+Tab');
  await key(toggleFavorite, 'Shift+Tab');
  await key(b1ToManhattanBeach, 'Enter');
  await checkpoint('b1-manhattan-beach-open-again');
  await key(b1ToManhattanBeach, 'Tab');
  await tabDownStops(b1ToManhattanBeach, ['86 ST/4 AV']);
  await key(stop(b1ToManhattanBeach, '86 ST/5 AV'), 'Enter');
  await expect(stopB1).toBeVisible();
  await checkpoint('stop-page-again');

  // Stop page: open B1's third bus, then its route from the vehicle card
  await key(body, 'Tab');
  await key(stopB1, 'Tab');
  await key(vehicle(stopB1, 0), 'Tab');
  await key(vehicle(stopB1, 1), 'Tab');
  await key(vehicle(stopB1, 2), 'Enter');
  const vehicleHeading = page.getByRole('heading', { name: /^bus and stroller icon B1 Bay Ridge/ });
  await expect(vehicleHeading).toBeVisible();
  await checkpoint('vehicle-page');
  await key(fullRoute, 'Shift+Tab');
  await key(vehicleHeading, 'Enter');
  await checkpoint('vehicle-heading-enter');
  await key(vehicleHeading, 'Tab');
  await key(fullRoute, 'Enter');
  await expect(b1ToManhattanBeach).toBeVisible();
  await checkpoint('b1-from-vehicle');

  // Favorites list, from the header
  await key(body, 'Shift+Tab');
  await key(nearby, 'Shift+Tab');
  await key(favorites, 'Enter');
  await checkpoint('favorites-b1');
  await key(favorites, 'Tab');
  await key(nearby, 'Tab');
  await key(page.getByRole('button', { name: 'Reorder favorites' }), 'Tab');
  await key(page.getByRole('button', { name: 'B1 Bay Ridge - Manhattan Beach' }), 'Enter');
  await expect(b1ToManhattanBeach).toBeVisible();
  await checkpoint('b1-from-favorites');

  // B1 route from favorites, to the stop once more
  await key(body, 'Shift+Tab');
  await key(nearby, 'Tab');
  await key(b1ToBayRidge, 'Tab');
  await key(b1ToManhattanBeach, 'Enter');
  await checkpoint('b1-manhattan-beach-open-third');
  await key(b1ToManhattanBeach, 'Tab');
  await tabDownStops(b1ToManhattanBeach, ['86 ST/4 AV']);
  await key(stop(b1ToManhattanBeach, '86 ST/5 AV'), 'Enter');
  await expect(stopB1).toBeVisible();
  await checkpoint('stop-page-third');

  // Stop page: past B1 to B16's buses, favorite the stop
  await key(body, 'Tab');
  await key(stopB1, 'Tab');
  await key(vehicle(stopB1, 0), 'Tab');
  await key(vehicle(stopB1, 1), 'Tab');
  await key(vehicle(stopB1, 2), 'Tab');
  await key(fullRoute.first(), 'Tab');
  await key(stopB16, 'Tab');
  await key(vehicle(stopB16, 0), 'Tab');
  await key(vehicle(stopB16, 1), 'Tab');
  await key(vehicle(stopB16, 2), 'Tab');
  await key(fullRoute.nth(1), 'Tab');
  await key(toggleFavorite, 'Enter');
  await checkpoint('stop-favorited');
  await key(toggleFavorite, 'Shift+Tab');
  await key(fullRoute.nth(1), 'Shift+Tab');
  await key(vehicle(stopB16, 2), 'Shift+Tab');
  await key(vehicle(stopB16, 1), 'Tab');
  await key(vehicle(stopB16, 2), 'Tab');
  await key(fullRoute.nth(1), 'Enter');
  await expect(b16ToLefferts).toBeVisible();
  await checkpoint('b16-route');

  // B16 route: open the Lefferts Gardens direction, down its stops to another stop
  await key(body, 'Tab');
  await key(b16ToBayRidge, 'Tab');
  await key(b16ToLefferts, 'Enter');
  await checkpoint('b16-lefferts-open');
  await key(b16ToLefferts, 'Tab');
  await tabDownStops(b16ToLefferts, [
    'SHORE RD/4 AV',
    'SHORE RD/3 AV',
    'SHORE RD/99 ST',
    'SHORE RD/97 ST',
    'SHORE RD/RIDGE BLVD',
    'SHORE RD/OLIVER ST',
    'SHORE RD/91 ST',
    'NARROWS AV/89 ST',
    'SHORE RD/83 ST',
  ]);
  // The stop's own data (stop-for-id) arrives after its card; record mode must wait for it, or
  // the request is still in flight when the test ends and never makes it into the recording.
  const stopData = page.waitForResponse((r) => r.url().includes('/api/stop-for-id'));
  await key(stop(b16ToLefferts, 'NARROWS AV/86 ST'), 'Enter');
  await stopData;
  await expect(stopB16).toBeVisible();
  await checkpoint('b16-stop-page');

  // Favorites list, with the route and the stop
  await key(body, 'Shift+Tab');
  await key(nearby, 'Shift+Tab');
  await key(favorites, 'Enter');
  // Wait for the list, so the test doesn't end (in record mode) with its requests in flight.
  await expect(page.getByRole('button', { name: 'B1 Bay Ridge - Manhattan Beach' })).toBeVisible();
  await expect(page.getByRole('button', { name: /86 ST\/5 AV/ })).toBeVisible();
  await checkpoint('favorites-b1-and-stop');
});
