import type { Locator } from '@playwright/test';
import { test } from './support/fixtures';

test.use({ recording: 'stop-403424' });

test('open and close the routes and service alerts on stop 403424, by mouse and keyboard', async ({ page, checkpoint }) => {
  // 19 checkpoints: writing their snapshots from scratch takes longer than the 60s default.
  test.slow();
  const alert = page.getByRole('button', { name: 'Toggle Service Alert Open/' });
  const m101Alert = page.locator('button').filter({ hasText: 'Service Alert for M101' });
  const bxm1 = page.getByRole('button', { name: 'Toggle BXM1 to EAST MIDTOWN 34 ST via LEX AV' });
  const bxm1Inwood = page.getByRole('button', { name: 'Toggle BXM1 to EAST MIDTOWN 34 ST via INWOOD via LEX AV' });
  const m101 = page.getByRole('button', { name: 'Toggle M101 to LIMITED EAST' });
  const mapLink = page.getByRole('link', { name: 'map' });
  const seeAMap = page.getByRole('link', { name: 'See a map' });
  // The draft named buses by vehicle ID (3275, 3352; 5316, 5949, 5302), which is live data;
  // these are the same links by their position under each route. They only move focus, so
  // when fewer buses are en route than the draft had, the last one stands in.
  const pressVehicle = async (route: Locator, n: number, key: string) => {
    const links = route.locator('xpath=following-sibling::div[1]').getByRole('list').first().getByRole('link');
    await links.first().waitFor();
    await links.nth(Math.min(n, (await links.count()) - 1)).press(key);
  };

  await page.goto('/?search=403424');
  await checkpoint('loaded');

  // Mouse
  await bxm1.click();
  await checkpoint('bxm1-toggled-1');
  await alert.nth(1).click();
  await checkpoint('alert-2-open');
  await alert.nth(1).click();
  await checkpoint('alert-2-closed');
  await bxm1.click();
  await checkpoint('bxm1-toggled-2');
  await alert.first().click();
  await checkpoint('alert-1-open');
  await alert.first().click();
  await checkpoint('alert-1-closed');
  await bxm1.click();
  await checkpoint('bxm1-toggled-3');

  // Keyboard, starting from a click in the sidebar
  const sidebarStart = page.locator('div').filter({ hasText: 'FavoritesNearby BusesStops:' }).nth(2);
  await sidebarStart.click();
  await sidebarStart.press('Tab');
  await page.getByRole('button', { name: 'Favorites', exact: true }).press('Tab');
  await page.getByRole('button', { name: 'Nearby Buses' }).press('Tab');
  await bxm1.press('Tab');
  await mapLink.first().press('Tab');
  await bxm1Inwood.press('Tab');
  await pressVehicle(bxm1Inwood, 0, 'Tab');
  await pressVehicle(bxm1Inwood, 1, 'Tab');
  await alert.nth(1).press('Enter');
  await checkpoint('key-alert-2-open');
  await alert.nth(1).press('Enter');
  await checkpoint('key-alert-2-closed');
  await alert.nth(1).press('Shift+Tab');
  await pressVehicle(bxm1Inwood, 1, 'Shift+Tab');
  await pressVehicle(bxm1Inwood, 0, 'Shift+Tab');
  await bxm1Inwood.press('Enter');
  await checkpoint('key-bxm1-inwood-toggled');
  await bxm1Inwood.press('Tab');
  await mapLink.nth(1).press('Tab');
  await m101.press('Enter');
  await checkpoint('key-m101-toggled-1');
  await m101.press('Tab');
  await mapLink.nth(2).press('Tab');
  await seeAMap.first().press('Tab');
  await page.getByRole('link', { name: 'See a map of the northbound' }).press('Shift+Tab');
  await seeAMap.first().press('Shift+Tab');
  await mapLink.nth(2).press('Shift+Tab');
  await m101.press('Enter');
  await checkpoint('key-m101-toggled-2');
  await m101.press('Enter');
  await checkpoint('key-m101-toggled-3');
  await m101.press('Enter');
  await checkpoint('key-m101-toggled-4');
  await m101.press('Tab');
  await pressVehicle(m101, 0, 'Tab');
  await pressVehicle(m101, 1, 'Tab');
  await pressVehicle(m101, 2, 'Tab');
  await m101Alert.press('Enter');
  await checkpoint('key-m101-alert-open');
  await m101Alert.press('Shift+Tab');
  await pressVehicle(m101, 2, 'Shift+Tab');
  await pressVehicle(m101, 1, 'Shift+Tab');
  await pressVehicle(m101, 0, 'Shift+Tab');
  await m101.press('Enter');
  await checkpoint('key-m101-toggled-5');
  await m101.press('Enter');
  await checkpoint('key-m101-toggled-6');
  await m101.press('Enter');
  await checkpoint('key-m101-toggled-7');
});
