// Each game's players now, from the server's /stats (Hub.publishStats): `playing` counts the players
// connected to the game (every play connects, player.ts), `online` the ones of them seated in one of its
// rooms. Polled every 20 seconds while a view listens and the tab is visible; the list, the game page
// and the player bar show it, and the list filters and sorts by it.
import { serverOverride } from '../sdk/net/client.ts';

export interface Players {
  playing: number;
  online: number;
  /** plays started in the last 30 days: the game's popularity */
  plays30: number;
}
/** game id -> its players now */
export type Live = ReadonlyMap<string, Players>;

const EVERY_MS = 20_000;
const NONE: Players = { playing: 0, online: 0, plays30: 0 };

/** a game's players in `live` (none when the game is not in it, or nothing is known) */
export function playersOf(live: Live | null, id: string): Players {
  return live?.get(id) ?? NONE;
}

/** The games' figures in a /stats answer, or null if it has none (an older server, not JSON). */
export function parseLive(body: unknown): Live | null {
  const games = (body as { games?: unknown } | null)?.games;
  if (!games || typeof games !== 'object') return null;
  const live = new Map<string, Players>();
  for (const [id, v] of Object.entries(games as Record<string, unknown>)) {
    const p = v as { playing?: unknown; online?: unknown; plays30?: unknown };
    const count = (x: unknown) => (typeof x === 'number' && Number.isInteger(x) && x >= 0 ? x : 0);
    live.set(id, { playing: count(p?.playing), online: count(p?.online), plays30: count(p?.plays30) });
  }
  return live;
}

/** "123 plays in the last 30 days", or "" */
export function popularText(p: Players): string {
  return p.plays30 ? `${p.plays30} play${p.plays30 === 1 ? '' : 's'} in the last 30 days` : '';
}

/** "2 playing · 1 online", "1 playing", or "" when nobody plays */
export function liveText(p: Players): string {
  if (!p.playing && !p.online) return '';
  return p.online ? `${p.playing} playing · ${p.online} online` : `${p.playing} playing`;
}

/** a path on the server the games connect to: this page's origin, or the one ?server= names (as the SDK's client) */
function serverUrl(path: string): string {
  const q = serverOverride(location.search, location);
  if (q) {
    const u = new URL(q);
    return `${u.protocol === 'wss:' ? 'https:' : 'http:'}//${u.host}${path}`;
  }
  return `${location.origin}${path}`;
}

const statsUrl = () => serverUrl('/stats');

/**
 * Tells the server which view of the website is shown ("list", "game:<id>", "play:<id>"), for its daily sums
 * (the usage statistics): nothing else is sent, nothing is stored in the browser.
 */
export function reportView(view: string): void {
  try {
    void fetch(serverUrl(`/hit?p=${encodeURIComponent(view)}`), { cache: 'no-store', keepalive: true }).catch(() => { /* no server */ });
  } catch { /* no fetch (tests) */ }
}

let live: Live | null = null;
const listeners = new Set<(live: Live | null) => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
let polling = false;

async function poll(): Promise<void> {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!listeners.size || polling) return;
  if (document.visibilityState === 'visible') {
    polling = true;
    try {
      const r = await fetch(statsUrl(), { cache: 'no-store' });
      live = r.ok ? parseLive(await r.json()) : null;
    } catch {
      live = null; // no server (a static preview): nothing is shown
    } finally {
      polling = false;
    }
    for (const l of [...listeners]) l(live);
  }
  if (listeners.size) timer = setTimeout(() => void poll(), EVERY_MS);
}

// (the filter's node tests import this module without a document)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && listeners.size) void poll();
  });
}

/**
 * Calls `cb` with the players now, at once if they are known and then on every poll, until `signal`
 * aborts. Polling runs while anyone listens.
 */
export function onLive(cb: (live: Live | null) => void, signal: AbortSignal): void {
  if (signal.aborted) return;
  listeners.add(cb);
  signal.addEventListener('abort', () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearTimeout(timer);
      timer = null;
    }
  }, { once: true });
  if (live) cb(live);
  if (!timer && !polling) void poll();
}

/** Polls now (a play started or ended): the change shows without waiting for the next poll. */
export function refreshLive(): void {
  if (listeners.size && !polling) void poll();
}
