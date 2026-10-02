import fs from 'node:fs';
import path from 'node:path';

// A recording holds every /api/ response one scenario received, in the order it
// received them, so polled SIRI data replays as the same sequence of updates.
export type RecordedResponse = {
  status: number;
  contentType: string;
  // Parsed when the response is JSON, so diffs of committed recordings stay readable.
  body: unknown;
};

export type Recording = {
  // When recording started. Replay starts the browser clock here; anything the app
  // shows relative to "now" then matches what it showed while recording.
  recordedAt: string;
  // Host the responses came from. Matching ignores it, so a QA recording replays
  // against a build that points anywhere.
  source: string;
  responses: Record<string, RecordedResponse[]>;
};

export const RECORDINGS_DIR = path.join(__dirname, '..', 'recordings');

// Varies per run (sessionId) or per environment (key), and has no effect on the response.
const IGNORED_PARAMS = new Set(['sessionId', 'key']);

export const isApiRequest = (url: URL) => normalizePath(url.pathname).startsWith('/api/');

// The key a response is stored under: method, path and the remaining query
// params, sorted so their order in the URL doesn't matter.
export function requestKey(method: string, url: URL): string {
  const params = [...url.searchParams]
    .filter(([name]) => !IGNORED_PARAMS.has(name))
    .sort(([a, av], [b, bv]) => a.localeCompare(b) || av.localeCompare(bv));
  const query = new URLSearchParams(params).toString();
  return `${method} ${normalizePath(url.pathname)}${query ? `?${query}` : ''}`;
}

// The stop endpoint's default ends up as "https://host//api/stop-for-id".
const normalizePath = (pathname: string) => pathname.replace(/\/{2,}/g, '/');

const recordingPath = (name: string) => path.join(RECORDINGS_DIR, `${name}.json`);

export function loadRecording(name: string): Recording {
  const file = recordingPath(name);
  if (!fs.existsSync(file)) {
    throw new Error(`No recording at ${path.relative(process.cwd(), file)}. Record it with: npm run test:e2e:record`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function saveRecording(name: string, recording: Recording) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
  fs.writeFileSync(recordingPath(name), JSON.stringify(recording, null, 2) + '\n');
}

export function parseBody(contentType: string, text: string): unknown {
  if (contentType.includes('json')) {
    try {
      return JSON.parse(text);
    } catch {
      // Fall through and keep the raw text.
    }
  }
  return text;
}

export const serializeBody = (body: unknown) => (typeof body === 'string' ? body : JSON.stringify(body));
