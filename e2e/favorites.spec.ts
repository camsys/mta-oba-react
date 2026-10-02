import type { Locator, Page } from '@playwright/test';
import { expect, test } from './support/fixtures';

test.use({ recording: 'favorites' });

const searchBox = (page: Page) => page.getByRole('textbox', { name: 'Route, intersection, or stop' });
const toggleFavorite = (page: Page) => page.getByRole('button', { name: 'Toggle favorites status for' });
const openFavorites = (page: Page) => page.getByRole('button', { name: 'Favorites', exact: true }).click();
const favorite = (page: Page, name: string | RegExp) =>
  page.getByRole('heading', { name: 'Favorites:' }).locator('xpath=following-sibling::div[1]').getByRole('button', { name });

const B44 = /^B44 Sheepshead Bay -/;
const STOP = 'LEE AV/ROSS ST';

// Checks `on` still has focus, then presses the key there: locator.press would move focus to
// `on` first, so it wouldn't notice focus leaving the search box.
async function press(page: Page, on: Locator, key: string) {
  await expect(on).toBeFocused();
  await page.keyboard.press(key);
}

// Picks a suggestion with the keyboard; `keys` are pressed before Enter.
async function searchFromSuggestions(page: Page, term: string, keys = ['ArrowDown']) {
  await page.getByRole('button', { name: 'clear search button' }).click();
  await searchBox(page).fill(term);
  for (const key of keys) await press(page, searchBox(page), key);
  await press(page, searchBox(page), 'Enter');
}

test('add and remove a route and a stop as favorites', async ({ page, checkpoint }) => {
  await page.goto('/?search=View+Favorites');
  await checkpoint('empty');

  // Favorite the route
  await searchFromSuggestions(page, 'b44', ['ArrowDown', 'ArrowDown', 'ArrowUp']);
  await checkpoint('route-card');
  await toggleFavorite(page).click();
  await checkpoint('route-toggle-favorited');
  await openFavorites(page);
  await checkpoint('route-favorited');

  // Favorite a stop on it
  await favorite(page, B44).click();
  await page
    .getByRole('button', { name: 'Toggle MTA NYCT_B44 to SHEEPSHEAD BAY KNAPP ST via NOSTRAND Open / Closed' })
    .click();
  await page.getByRole('link', { name: STOP }).click();
  await checkpoint('stop-card');
  await toggleFavorite(page).click();
  await openFavorites(page);
  await checkpoint('stop-favorited');

  // Unfavorite the route, then the stop
  await favorite(page, B44).click();
  await toggleFavorite(page).click();
  await openFavorites(page);
  await checkpoint('route-removed');

  await favorite(page, STOP).click();
  await toggleFavorite(page).click();
  await openFavorites(page);
  await checkpoint('all-removed');

  // Favorite the route again from a fresh search
  await searchFromSuggestions(page, 'b44');
  await toggleFavorite(page).click();
  await openFavorites(page);
  await checkpoint('route-favorited-again');

  // Favorites are kept in cookies, so B44 is still listed after a reload.
  await page.reload();
  await checkpoint('after-reload');
});
