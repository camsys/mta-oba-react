import { type Locator, expect } from '@playwright/test';
import { waitForTogglesToSettle } from './fixtures';

// Shared steps for specs converted from codegen drafts (scripts/e2e-convert-draft.mjs writes
// specs that use them). See "Converting a draft (agents)" in e2e/README.md.

// The first line of a failed focus check; scripts/e2e-cycle.sh looks for it.
export const FOCUS_CHECK_FAILED = 'Focus check failed';

// Presses `k` on the element that should have focus. Each step names the element that had
// focus when the key was recorded: locator.press would move focus there first and skip the
// real tab order, and an Enter on the wrong toggle would be recorded instead of failing.
// Before pressing, the last toggle must finish, as checkpoint() waits for: record mode skips
// checkpoints, and a key pressed while a toggle is pending can leave different elements
// tabbable than the draft saw.
export async function key(on: Locator, k: string) {
  await expectFocused(on);
  await waitForTogglesToSettle(on.page());
  await on.page().keyboard.press(k);
}

// Like expect(on).toBeFocused(), but a failure names what has focus instead, its neighbours in
// tab order, and how far away the expected element is.
export async function expectFocused(on: Locator) {
  try {
    await expect(on).toBeFocused();
  } catch (error) {
    throw new Error(`${FOCUS_CHECK_FAILED}: expected ${on}\n${await describeFocus(on)}`, { cause: error });
  }
}

// Positional locators for live data. A draft names buses by vehicle ID, which changes with
// every recording; these name the same links by their position, so IDs never go into a spec.

// The nth bus link under a direction toggle in a stop card (nearby stops, location.spec.ts).
export const bus = (direction: Locator, n: number) =>
  direction.locator('xpath=following-sibling::*[1]').getByRole('link').nth(n);

// The nth bus link under a route toggle on a stop page (stop-400723.spec.ts).
export const vehicle = (route: Locator, n: number) =>
  route.locator('xpath=following-sibling::div[1]').getByRole('list').first().getByRole('link').nth(n);

// The nth approaching bus in a direction on a route page (route-b63.spec.ts), given the
// direction's toggle. Buses sit between the stops in tab order.
export const routeBus = (direction: Locator, n: number) =>
  direction
    .page()
    .locator('.route-direction')
    .filter({ has: direction })
    .locator('.approaching-buses')
    .getByRole('link')
    .nth(n);

async function describeFocus(on: Locator): Promise<string> {
  try {
    const handles = await on.elementHandles();
    const report = await on.page().evaluate(
      ([expected, matches]) => {
        const role = (el: Element) => {
          const explicit = el.getAttribute('role');
          if (explicit) return explicit;
          const tag = el.tagName.toLowerCase();
          if (tag === 'a' && el.hasAttribute('href')) return 'link';
          if (tag === 'input') return (el as HTMLInputElement).type === 'checkbox' ? 'checkbox' : 'textbox';
          if (/^h[1-6]$/.test(tag)) return 'heading';
          return tag;
        };
        const name = (el: Element) => {
          const labelledBy = el.getAttribute('aria-labelledby');
          const text =
            el.getAttribute('aria-label') ||
            (labelledBy && document.getElementById(labelledBy)?.textContent) ||
            (el as HTMLElement).innerText ||
            el.getAttribute('title') ||
            el.getAttribute('placeholder') ||
            '';
          const flat = text.replace(/\s+/g, ' ').trim();
          return flat.length > 60 ? `${flat.slice(0, 57)}...` : flat;
        };
        const step = (el: Element) => {
          const tag = el.tagName.toLowerCase();
          if (el.id) return `${tag}#${el.id}`;
          const cls = [...el.classList][0];
          return cls ? `${tag}.${cls}` : tag;
        };
        const path = (el: Element) => {
          const steps: string[] = [];
          for (let e: Element | null = el; e && steps.length < 4 && e !== document.body; e = e.parentElement) {
            steps.unshift(step(e));
            if (e.id) break;
          }
          return steps.join(' > ');
        };
        const describe = (el: Element | null) =>
          el ? `${role(el)} "${name(el)}" (${path(el) || 'body'})` : '(nothing)';

        const tabbable = [
          ...document.querySelectorAll<HTMLElement>(
            'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]',
          ),
        ]
          .filter(
            (el) =>
              el.tabIndex >= 0 &&
              !(el as HTMLButtonElement).disabled &&
              !el.closest('[inert]') &&
              el.getClientRects().length > 0 &&
              getComputedStyle(el).visibility !== 'hidden',
          )
          .map((el, i) => ({ el, i }))
          .sort((a, b) => (a.el.tabIndex || Infinity) - (b.el.tabIndex || Infinity) || a.i - b.i)
          .map(({ el }) => el);

        const active = document.activeElement;
        const at = active ? tabbable.indexOf(active as HTMLElement) : -1;
        const lines = [`  focused:  ${describe(active)}`];
        if (at >= 0) {
          lines.push(`  before:   ${describe(tabbable[at - 1] ?? null)}`);
          lines.push(`  after:    ${describe(tabbable[at + 1] ?? null)}`);
        } else if (active && active !== document.body) {
          lines.push('  (the focused element is not in the tab order)');
        }
        if (matches === 0) lines.push('  expected: matches no element');
        else if (matches > 1) lines.push(`  expected: matches ${matches} elements (make the locator unique)`);
        else if (expected instanceof Element) {
          const to = tabbable.indexOf(expected as HTMLElement);
          if (to < 0) lines.push(`  expected: ${describe(expected)}, not tabbable (hidden, inert or tabIndex -1)`);
          else if (at >= 0) {
            const d = to - at;
            lines.push(`  expected: ${describe(expected)}, ${Math.abs(d)} Tab${Math.abs(d) === 1 ? '' : 's'} ${d > 0 ? 'after' : 'before'} the focused element`);
          } else lines.push(`  expected: ${describe(expected)}`);
        }
        return lines.join('\n');
      },
      [handles.length === 1 ? handles[0] : null, handles.length] as const,
    );
    await Promise.all(handles.map((h) => h.dispose()));
    return report;
  } catch (error) {
    return `  (could not describe focus: ${String(error).split('\n')[0]})`;
  }
}
