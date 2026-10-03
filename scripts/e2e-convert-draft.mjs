#!/usr/bin/env node
// Does the mechanical part of turning a codegen draft into a spec, and lists what still needs
// a person's judgment. See "Converting a draft (agents)" in e2e/README.md.
//
//   node scripts/e2e-convert-draft.mjs e2e/drafts/<draft>.spec.ts <name> [options]
//
// Writes e2e/<name>.spec.ts (refuses to overwrite it without --force) and prints one line per
// thing to check, each with its line in the new spec.
//   --recording <name>  recording to replay (default: <name>)
//   --checkpoints       write the suggested checkpoints as real calls, not TODO comments
//   --force             overwrite e2e/<name>.spec.ts
//   --stdout            print the spec instead of writing it
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Calls that act on a locator; everything before the last one is the locator.
const ACTIONS = new Set(['press', 'click', 'dblclick', 'fill', 'check', 'uncheck', 'selectOption', 'hover', 'type', 'pressSequentially']);
// Roles a key press can come from. A press codegen recorded on anything else (a heading, a
// container div) came from whatever had focus, which codegen couldn't name.
const FOCUSABLE_ROLES = new Set(['button', 'link', 'textbox', 'checkbox', 'radio', 'combobox', 'searchbox', 'menuitem', 'tab', 'option', 'switch', 'slider', 'spinbutton']);
const TOGGLE_KEYS = new Set(['Enter', ' ', 'Space']);
const RESERVED = new Set(['page', 'key', 'bus', 'vehicle', 'routeBus', 'checkpoint', 'expect', 'test', 'body']);

// Splits `page.getByRole('x', { name: 'a (b' }).first().press('Tab')` into its top-level calls,
// skipping over strings (names can hold unbalanced brackets) and nested brackets.
export function splitChain(expr) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') quote = c;
    else if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === '.' && depth === 0) {
      parts.push(expr.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(expr.slice(start));
  return parts.map((p) => {
    const m = /^(\w+)(?:\(([\s\S]*)\))?$/.exec(p.trim());
    return m ? { name: m[1], args: m[2], text: p.trim() } : { name: p.trim(), args: undefined, text: p.trim() };
  });
}

// One statement per entry, with the draft line it started on.
function statements(source) {
  const out = [];
  let buf = '';
  let line = 0;
  source.split('\n').forEach((text, i) => {
    if (!buf) line = i + 1;
    buf += (buf ? ' ' : '') + text.trim();
    let depth = 0;
    let quote = null;
    for (let j = 0; j < buf.length; j++) {
      const c = buf[j];
      if (quote) {
        if (c === '\\') j++;
        else if (c === quote) quote = null;
      } else if (c === "'" || c === '"' || c === '`') quote = c;
      else if ('([{'.includes(c)) depth++;
      else if (')]}'.includes(c)) depth--;
    }
    // The test's opening line leaves its brackets open; it's dropped anyway.
    if (buf.endsWith('{') && /^test\(/.test(buf) || (depth <= 0 && (buf.endsWith(';') || buf === '' || buf.startsWith('//')))) {
      if (buf) out.push({ text: buf.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')'), line });
      buf = '';
    }
  });
  if (buf) out.push({ text: buf, line });
  return out;
}

const stringArg = (args, key) => {
  const m = new RegExp(`${key}:\\s*(['"])((?:\\\\.|(?!\\1).)*)\\1`).exec(args ?? '');
  return m?.[2];
};
const firstString = (args) => /^\s*(['"])((?:\\.|(?!\1).)*)\1/.exec(args ?? '')?.[2];

// What a locator expression points at, as far as the text says.
function describeLocator(expr) {
  const calls = splitChain(expr).slice(1);
  const info = { expr, role: undefined, name: undefined, css: [], position: undefined, hasText: undefined, exact: false };
  for (const c of calls) {
    if (c.name === 'getByRole') {
      info.role = firstString(c.args);
      info.name = stringArg(c.args, 'name');
      info.description = stringArg(c.args, 'description');
      info.exact = /exact:\s*true/.test(c.args);
    } else if (c.name === 'locator') info.css.push(firstString(c.args));
    else if (c.name === 'getByText' || c.name === 'getByLabel' || c.name === 'getByTitle') info.name = firstString(c.args);
    else if (c.name === 'filter') info.hasText = stringArg(c.args, 'hasText');
    else if (c.name === 'first') info.position = 'first()';
    else if (c.name === 'last') info.position = 'last()';
    else if (c.name === 'nth') info.position = `nth(${c.args})`;
  }
  info.isBody = calls.length === 1 && info.css[0] === 'body';
  info.isMap = info.css.includes('#map');
  info.vehicleId = info.role === 'link' && /^\d+$/.test(info.name ?? '') ? info.name : undefined;
  info.focusable = info.isBody || FOCUSABLE_ROLES.has(info.role) || info.css.some((s) => /^(a|button|input|select|textarea)\b/.test(s ?? ''));
  return info;
}

// A readable const name for a locator; the reviewer may still rename it.
export function nameFor(info) {
  const n = info.name ?? info.hasText ?? info.css.at(-1) ?? 'element';
  if (/^Toggle favorites status for/i.test(n)) return 'favorite';
  if (/^Toggle Service Alert/i.test(n)) return 'alert';
  let s = n
    .replace(/^Toggle\s+/i, '')
    .replace(/^MTA NYCT_/, '')
    .replace(/^view full\s+/i, 'view ')
    .replace(/\s*Open \/ Closed\s*$/i, '')
    .replace(/\s*\(currently.*$/i, '');
  let words = s.match(/[A-Za-z0-9]+/g) ?? ['element'];
  if (words.length > 1 && words[0] === words[1]) words.splice(1, 1);
  if (/^\d{6}$/.test(words[0])) words = ['stop', words[0]];
  else if (/^\d/.test(words[0])) words.unshift(info.role ?? 'el');
  words = words.slice(0, 3);
  const camel = words.map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())).join('');
  return RESERVED.has(camel) ? `${camel}El` : camel;
}

// stop401778 -> stop-401778, but m15ToSouth -> m15-to-south.
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Za-z]{4,})(\d)/g, '$1-$2').toLowerCase();

// Live data in a locator: what a later recording can show differently.
function liveData(info) {
  const text = [info.name, info.description, info.hasText].filter(Boolean).join(' ');
  if (info.vehicleId) return `vehicle ID "${info.vehicleId}", with no toggle before it to count from; name it by position by hand`;
  if (/\bVehicle \d+/.test(text)) return `vehicle ID in "${text.slice(0, 60)}"`;
  if (/\b\d{1,2}:\d{2}\b|\bminutes?\b|\bmins?\b|\bapproaching\b|\bstops? away\b|\bmiles? away\b|\bat stop\b/i.test(text))
    return `time or distance in "${text.slice(0, 60)}"`;
  if (/\(\d+\)|\b\d+ (stops|buses|routes|alerts|results)\b/i.test(text)) return `count in "${text.slice(0, 60)}"`;
  if (/Loading/i.test(text)) return `loading state "${text.slice(0, 60)}"`;
  return undefined;
}

// Locators that match (or matched) more than one element, or depend on page structure.
function ambiguity(info) {
  const out = [];
  if (info.position) out.push(`${info.position}: the name matches several elements; check the position is stable, or scope it`);
  if (info.css.some((s) => /:nth-child|>/.test(s ?? ''))) out.push('CSS path: breaks with any layout change; use a role and name');
  if (info.css.some((s) => /_undefined"?\]?$|\[id="/.test(s ?? ''))) out.push('generated id: use the link name, scoped to its direction');
  if (info.css[0] === 'div' && info.hasText !== undefined) out.push('container div matched by its text');
  return out;
}

export function convertDraft(source, { name, recording = name, draft = 'the draft', checkpoints = false } = {}) {
  const notes = [];
  const steps = []; // { kind, ... }
  let search;
  for (const st of statements(source)) {
    const t = st.text;
    if (/^import\b/.test(t) || /^test\(/.test(t) || /^\}\);?$/.test(t) || t.startsWith('//')) continue;
    let m = /^await page\.goto\((['"`])(.*)\1\);$/.exec(t);
    if (m) {
      // Relative, without codegen's uuid; the query is otherwise kept as written.
      const url = new URL(m[2], 'http://localhost');
      search ??= url.searchParams.get('search') ?? '';
      const query = url.search.slice(1).split('&').filter((p) => p && !p.startsWith('uuid=')).join('&');
      steps.push({ kind: 'goto', url: url.pathname + (query ? `?${query}` : ''), line: st.line });
      continue;
    }
    m = /^await (page\..*);$/.exec(t);
    const chain = m && splitChain(m[1]);
    const action = chain?.at(-1);
    if (chain && ACTIONS.has(action.name) && chain.length > 2) {
      const expr = m[1].slice(0, m[1].length - action.text.length - 1);
      steps.push({ kind: 'action', expr, info: describeLocator(expr), action: action.name, args: action.args, line: st.line });
      continue;
    }
    steps.push({ kind: 'raw', text: t, line: st.line });
  }

  const pageKind = /^\d{6}$/.test(search ?? '') ? 'stop' : /^-?\d+\.\d+,-?\d+\.\d+$/.test(search ?? '') ? 'location' : 'route';
  // Which positional helper fits a bus under this toggle. A route page's direction toggles carry
  // the agency ("Toggle MTA NYCT_B63 to BAY"); a stop card's route toggles don't ("Toggle M15 to
  // PIKE ST"), and those are stop cards on a location page or a stop page. A spec that moves
  // between pages (tab-through) can need all three.
  const helperFor = (toggle) =>
    /^Toggle [A-Z][A-Za-z ]*_/.test(toggle.name ?? '') ? 'routeBus' : pageKind === 'location' ? 'bus' : 'vehicle';

  // Vehicle links become positional: the nth distinct vehicle reached under the toggle that
  // last had focus before it.
  const used = new Set();
  let anchor;
  const vehicleOrder = new Map(); // anchor expr -> [ids]
  for (const s of steps) {
    if (s.kind !== 'action') continue;
    const { info } = s;
    if (info.vehicleId && !info.isMap) {
      if (anchor) {
        const ids = vehicleOrder.get(anchor.expr) ?? [];
        if (!ids.includes(info.vehicleId)) ids.push(info.vehicleId);
        vehicleOrder.set(anchor.expr, ids);
        s.vehicle = { anchor: anchor.expr, n: ids.indexOf(info.vehicleId), helper: helperFor(anchor) };
        used.add(s.vehicle.helper);
      }
    } else if (info.role === 'button' && /^Toggle .+ to /.test(info.name ?? '')) {
      anchor = info;
    }
  }

  // Consts for every locator a key press checks or that's used more than once.
  const uses = new Map();
  for (const s of steps) if (s.kind === 'action' && !s.vehicle) uses.set(s.expr, (uses.get(s.expr) ?? 0) + 1);
  const consts = new Map(); // expr -> var
  const taken = new Set();
  const declare = (expr) => {
    if (consts.has(expr)) return consts.get(expr);
    const info = describeLocator(expr);
    let v = info.isBody ? 'body' : nameFor(info);
    for (let i = 2; taken.has(v); i++) v = `${nameFor(info)}${i}`;
    taken.add(v);
    consts.set(expr, v);
    return v;
  };
  for (const s of steps) {
    if (s.kind !== 'action' || s.vehicle) continue;
    const isKey = s.action === 'press' && s.info.focusable;
    if (isKey || uses.get(s.expr) > 1) declare(s.expr);
  }
  for (const s of steps) if (s.vehicle) declare(s.vehicle.anchor);
  const ref = (s) =>
    s.vehicle ? `${s.vehicle.helper}(${consts.get(s.vehicle.anchor)}, ${s.vehicle.n})` : consts.get(s.expr) ?? s.expr;

  // Where the first keyboard section starts, and what it should wait for.
  const firstPress = steps.findIndex((s) => s.kind === 'action' && s.action === 'press');
  let waitIndex = firstPress;
  if (firstPress > 0) {
    const prev = steps[firstPress - 1];
    if (prev.kind === 'action' && prev.action === 'click' && !prev.info.focusable) waitIndex = firstPress - 1;
  }
  const firstToggle = steps.find((s, i) => i >= firstPress && s.kind === 'action' && s.action === 'press' && TOGGLE_KEYS.has(firstString(s.args)) && s.info.focusable && !s.vehicle);

  const body = [];
  const out = (text, note) => {
    body.push(text);
    if (note) for (const n of [].concat(note)) notes.push({ at: body.length, text: n });
  };
  const checkpointNames = new Map();
  const suggest = (base) => {
    const n = (checkpointNames.get(base) ?? 0) + 1;
    checkpointNames.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
  const addCheckpoint = (base) => {
    const cp = suggest(base);
    if (checkpoints) out(`  await checkpoint('${cp}'); // TODO name what it shows`);
    else out(`  // TODO checkpoint('${cp}')`);
  };
  const flagged = new Set();
  const locatorNotes = (s) => {
    if (s.vehicle || flagged.has(s.expr)) return [];
    flagged.add(s.expr);
    const notesHere = [];
    const live = liveData(s.info);
    if (live) notesHere.push(`live data: ${live}`);
    for (const a of ambiguity(s.info)) notesHere.push(`ambiguous: ${a}`);
    return notesHere;
  };

  let focusUnknown = false; // set after a step that can move focus somewhere the draft doesn't say
  steps.forEach((s, i) => {
    if (i === waitIndex && firstPress >= 0) {
      const target = firstToggle ?? steps[firstPress];
      used.add('expect');
      out('');
      out('  // Record mode skips checkpoints, so wait for the page to be laid out before tabbing.');
      out(`  await expect(${ref(target)}).toBeVisible();`, 'wait: check this is what the first Tab needs (a section that loads later mounts untabbable)');
    }
    if (s.kind === 'goto') {
      out(`  await page.goto('${s.url}');`);
      out(`  await checkpoint('${suggest('loaded')}');`);
      focusUnknown = false;
      return;
    }
    if (s.kind === 'raw') {
      if (/waitForTimeout|pause\(\)/.test(s.text)) {
        out(`  ${s.text}`, 'pause in the draft: replace with a wait for what it waited for');
        addCheckpoint('paused');
      } else out(`  ${s.text}`, 'not converted: check by hand');
      return;
    }
    const { info } = s;
    const extra = locatorNotes(s);
    if (s.vehicle && !flagged.has(`vehicle ${info.vehicleId}`)) {
      flagged.add(`vehicle ${info.vehicleId}`);
      extra.push(`live data: vehicle ${info.vehicleId} -> ${ref(s)}, by its order under ${consts.get(s.vehicle.anchor)}; check the position`);
    }
    if (s.action === 'press') {
      const k = firstString(s.args);
      if (!info.focusable) {
        out(`  await page.keyboard.press('${k}');`, [
          ...extra,
          `focus: press on ${info.role ?? 'a container'} (not focusable), so no focus check; Tab starts from the click before it`,
        ]);
      } else {
        if (focusUnknown) extra.push(`focus: the step before can move focus anywhere (a link or page change); check ${ref(s)} is where it lands`);
        if (info.isBody) extra.push('focus: on <body>, so the last step dropped focus; check that is the app behaviour being tested');
        out(`  await key(${ref(s)}, '${k}');`, extra);
        used.add('key');
      }
      focusUnknown = TOGGLE_KEYS.has(k) && (info.role === 'link' || /Full Route|view full|Search Here/i.test(info.name ?? ''));
      if (TOGGLE_KEYS.has(k) && info.focusable && !info.isBody) addCheckpoint(`${kebab(ref(s).replace(/\(.*$/, ''))}-enter`);
      return;
    }
    const args = s.args ?? '';
    if (info.isMap && (s.action === 'click' || s.action === 'dblclick')) {
      extra.push(/position/.test(args) ? 'map click by coordinates: depends on map position and zoom; prefer a marker or button' : 'map click at the map centre: depends on where the map is; prefer a marker or button');
    }
    out(`  await ${ref(s)}.${s.action}(${args});`, extra);
    focusUnknown = s.action === 'click' && (info.role === 'link' || info.isMap);
    if (s.action === 'click' || s.action === 'dblclick') {
      if (!info.focusable && !info.isMap) {
        if (steps[i + 1]?.kind === 'action' && steps[i + 1].action === 'press') {
          notes.push({ at: body.length, text: 'click on a non-focusable element before a key press: it only sets where Tab starts; use a stable element (a heading)' });
          return;
        }
      }
      addCheckpoint(`${kebab(ref(s).replace(/\(.*$/, ''))}-${s.action === 'dblclick' ? 'double-clicked' : 'clicked'}`);
    }
  });

  // Assemble.
  const helpers = ['bus', 'vehicle', 'routeBus', 'key'].filter((h) => used.has(h));
  const head = [];
  head.push(`import { ${used.has('expect') ? 'expect, ' : ''}test } from './support/fixtures';`);
  if (helpers.length) head.push(`import { ${helpers.sort().join(', ')} } from './support/steps';`);
  head.push('', `test.use({ recording: '${recording}' });`, '');
  head.push(`// Converted from ${draft} by scripts/e2e-convert-draft.mjs. Resolve every TODO, then delete this line.`);
  head.push(`test('TODO what the user does', async ({ page, checkpoint }) => {`);
  head.push('  test.slow();');
  for (const [expr, v] of consts) head.push(`  const ${v} = ${expr};`);
  const offset = head.length;
  const spec = [...head, ...body, '});', ''].join('\n');
  return {
    spec,
    notes: notes.map((n) => ({ line: n.at + offset, text: n.text })).sort((a, b) => a.line - b.line),
    pageKind,
  };
}

function main(argv) {
  const args = argv.slice(2);
  const flag = (f) => {
    const i = args.indexOf(f);
    if (i < 0) return undefined;
    args.splice(i, 1);
    return true;
  };
  const option = (f) => {
    const i = args.indexOf(f);
    if (i < 0) return undefined;
    const v = args[i + 1];
    args.splice(i, 2);
    return v;
  };
  const force = flag('--force');
  const toStdout = flag('--stdout');
  const checkpoints = flag('--checkpoints');
  const recording = option('--recording');
  const [draftPath, name] = args;
  if (!draftPath || !name || !/^[\w-]+$/.test(name)) {
    console.error('usage: node scripts/e2e-convert-draft.mjs <draft> <name> [--recording <name>] [--checkpoints] [--force] [--stdout]');
    process.exit(2);
  }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const draft = path.relative(root, path.resolve(draftPath));
  const { spec, notes, pageKind } = convertDraft(fs.readFileSync(draftPath, 'utf8'), {
    name,
    recording: recording ?? name,
    draft,
    checkpoints: !!checkpoints,
  });
  if (toStdout) {
    process.stdout.write(spec);
  } else {
    const target = path.join(root, 'e2e', `${name}.spec.ts`);
    if (fs.existsSync(target) && !force) {
      console.error(`e2e/${name}.spec.ts exists; pass --force to overwrite it`);
      process.exit(1);
    }
    fs.writeFileSync(target, spec);
    const todos = spec.split('\n').filter((l) => l.includes('TODO checkpoint') || l.includes("// TODO name")).length;
    console.log(`wrote e2e/${name}.spec.ts (${pageKind} page, ${todos} checkpoints to name, ${notes.length} lines to check)`);
  }
  // With --stdout the spec owns stdout.
  const log = toStdout ? console.error : console.log;
  for (const n of notes) log(`  L${n.line}: ${n.text}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv);
