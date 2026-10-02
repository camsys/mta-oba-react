import { expect, test, GOOGLE_MAPS_BLOCKED_ERRORS } from './support/fixtures';

test.use({ recording: 'smoke' });

test('the home page loads', async ({ page, checkpoint, advance }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Replay's fake clock catches errors thrown inside timers and logs them with console.error
  // instead of letting them reach 'pageerror'; its frames in the stack identify them.
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('ClockController')) {
      errors.push(message.text().split('\n')[0]);
    }
  });

  await page.goto('/');
  await checkpoint('home');
  // Errors can come from timers well after load (retries, the map giving up, the first SIRI
  // poll at 30s). Run page time past one poll so they happen before the check below.
  await advance(35_000);

  // Blocking Google Maps causes these on purpose; anything else means the app broke on load.
  const unexpected = errors.filter((message) => !GOOGLE_MAPS_BLOCKED_ERRORS.some((known) => message.includes(known)));
  expect(unexpected, 'page errors on load').toEqual([]);
});
