// One game's connection to the server: transport (WebTransport with WebSocket fallback, link.ts),
// Hello for the game, clock sync, requests with answers, events, reconnect. Games do not use this
// directly but through ctx.net / ctx.rooms / ctx.storage / ctx.scores (docs/GAME-INTEGRATION.md).
import { encode, decode, errorName, PROTOCOL_VERSION, Which, type P } from './codec.ts';
import { fetchWtInfo, openWs, openWt, type Link } from './link.ts';

const TOKEN_KEY = 'freegames-token';
const NAME_KEY = 'freegames-name';

/** `replaced`: the same account opened this game on another connection (another tab); no reconnect. */
export type NetStatus = 'offline' | 'connecting' | 'online' | 'replaced';

/** the server's close code for a connection a newer login of the same account and game replaced */
export const CLOSE_REPLACED = 4000;

/** A refused request (ErrorMsg): `code` is the protocol's ErrorCode, `codeName` its name. */
export class ServerError extends Error {
  readonly code: number;
  readonly codeName: string;
  constructor(code: number, text: string) {
    super(text);
    this.code = code;
    this.codeName = errorName(code);
  }
}

export interface ClientEvents {
  status: NetStatus;
  welcome: { accountId: number; name: string };
  /** an ErrorMsg that answers no pending request */
  error: ServerError;
  /** every message from the server (rooms.ts, storage.ts, scores.ts listen here) */
  message: P.Envelope;
}

type Handler<K extends keyof ClientEvents> = (v: ClientEvents[K]) => void;

// localStorage may be missing (node tests) or blocked (private windows): fall back to memory
const memory = new Map<string, string>();
function load(key: string): string {
  try { return localStorage.getItem(key) ?? memory.get(key) ?? ''; } catch { return memory.get(key) ?? ''; }
}
function store(key: string, v: string): void {
  memory.set(key, v);
  try { localStorage.setItem(key, v); } catch { /* storage unavailable */ }
}

function randomToken(): string {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Whether this browser has an account token already. Without one, reading the player's files needs no
 * connection (there are none), so a game's start creates no token (§ 25 TDDDG): it is made only when the
 * player first uses something that needs an account (accountToken, via GameClient.connect).
 */
export function hasAccountToken(): boolean {
  return load(TOKEN_KEY).length >= 16;
}

/** The browser's account token (created once, kept in localStorage). */
export function accountToken(): string {
  let t = load(TOKEN_KEY);
  if (t.length < 16) {
    t = randomToken();
    store(TOKEN_KEY, t);
  }
  return t;
}

/**
 * The server a `?server=` link names (`ws(s)://host:port/ws`), if it may be used: on a development page
 * (localhost) any, on the site itself only its own host. Anything else is ignored: the connection carries
 * the browser's account token, so a link naming a foreign server would hand it over.
 */
export function serverOverride(search: string, page: { hostname: string; host: string }): string | null {
  const q = new URLSearchParams(search).get('server');
  if (!q) return null;
  let u: URL;
  try {
    u = new URL(q);
  } catch {
    return null;
  }
  if (u.protocol !== 'ws:' && u.protocol !== 'wss:') return null;
  const dev = page.hostname === 'localhost' || page.hostname === '127.0.0.1' || page.hostname === '[::1]';
  return dev || u.host === page.host ? q : null;
}

/** The player's display name, shared by all games. */
export function playerName(): string {
  return load(NAME_KEY);
}

export function setPlayerName(v: string): void {
  store(NAME_KEY, v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24));
}

export interface ClientOptions {
  /** ws(s):// URL of the server; default: this page's origin + /ws, or ?server= (serverOverride) */
  url?: string;
  /** 'ws' forces WebSocket (also ?transport=ws) */
  transport?: 'auto' | 'ws';
  /** account token (tests); default: the browser's */
  token?: string;
  /** request timeout, ms */
  timeoutMs?: number;
}

interface Pending {
  resolve: (e: P.Envelope) => void;
  reject: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
  /** for requests answered by a message without `req` (CreateRoom -> RoomUpdate) */
  match?: (e: P.Envelope) => boolean;
}

export class GameClient {
  readonly game: string;
  status: NetStatus = 'offline';
  accountId = 0;
  name = '';
  /** round-trip time of the fastest recent ping, ms */
  rtt = 0;
  /** serverTime - local clock, ms (median of the fastest ping samples) */
  private offset = 0;
  private samples: { offset: number; rtt: number }[] = [];
  private link: Link | null = null;
  private wtFailed = false;
  private handlers = new Map<keyof ClientEvents, Set<(v: unknown) => void>>();
  private retry = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  /** an account connection is wanted (connect) */
  private wanted = false;
  /** an anonymous play is wanted (count): Presence until connect() asks for more */
  private counted = false;
  /** the link is open (opened() ran) */
  private ready = false;
  /** a Hello went out on this link */
  private helloSent = false;
  private countWaiters: (() => void)[] = [];
  private opening = false;
  private nextReq = 1;
  private pending = new Map<number, Pending>();
  private waiters: { resolve: () => void; reject: (e: Error) => void }[] = [];
  private readonly opts: ClientOptions;

  constructor(game: string, opts: ClientOptions = {}) {
    this.game = game;
    this.opts = opts;
  }

  get online(): boolean { return this.status === 'online'; }
  /** whether to keep a connection open (and come back after a drop) */
  private get keep(): boolean { return this.wanted || this.counted; }
  /** whether this client has an account to use without making one (a test token, or the browser's) */
  hasAccount(): boolean { return !!this.opts.token || hasAccountToken(); }
  /** "wt" (WebTransport) or "ws" (WebSocket) while connected. */
  get transport(): Link['kind'] | null { return this.link?.kind ?? null; }
  /** Server clock now (ms since the epoch). */
  serverNow(): number { return performance.timeOrigin + performance.now() + this.offset; }

  on<K extends keyof ClientEvents>(k: K, h: Handler<K>): () => void {
    let s = this.handlers.get(k);
    if (!s) this.handlers.set(k, (s = new Set()));
    s.add(h as (v: unknown) => void);
    return () => s!.delete(h as (v: unknown) => void);
  }

  private emit<K extends keyof ClientEvents>(k: K, v: ClientEvents[K]): void {
    for (const h of [...(this.handlers.get(k) ?? [])]) {
      try { h(v); } catch (e) { console.error(`net handler ${k}`, e); }
    }
  }

  private setStatus(s: NetStatus): void {
    if (s === this.status) return;
    this.status = s;
    this.emit('status', s);
  }

  /**
   * Connects with the browser's account (making its token if there is none yet, and keeps reconnecting
   * until close()); resolves once the server welcomed us. An anonymous play (count) becomes an account
   * play on the same connection.
   */
  connect(): Promise<void> {
    if (this.online) return Promise.resolve();
    const p = new Promise<void>((resolve, reject) => this.waiters.push({ resolve, reject }));
    this.wanted = true;
    if (this.ready && !this.helloSent) {
      this.setStatus('connecting');
      this.sendHello();
    } else if (!this.link && !this.opening) void this.open();
    return p;
  }

  /**
   * Counts this play among the game's players now without an account (Presence): nothing is stored in the
   * browser, nothing that identifies it is sent. Resolves once the server has been told (never, without
   * one). The status stays as it is: the game has no connection of its own until connect().
   */
  count(): Promise<void> {
    if (this.counted && this.ready) return Promise.resolve();
    const p = new Promise<void>((resolve) => this.countWaiters.push(resolve));
    this.counted = true;
    if (!this.link && !this.opening) void this.open();
    return p;
  }

  /**
   * Changes the player's name (shared by all games). The server learns it from a new Hello, so an open
   * connection is renewed; do it outside a room (the lobby's room list), where nothing is lost.
   */
  async rename(name: string): Promise<void> {
    setPlayerName(name);
    if (!this.link || !this.helloSent || playerName() === this.name || !playerName()) return;
    const l = this.link;
    this.link = null;
    this.stopPing();
    this.failAll(new Error('renaming'));
    l.close();
    this.setStatus('connecting');
    this.retry = 0;
    await this.connect();
  }

  /** Disconnects for good: pending requests fail, no reconnect. */
  close(): void {
    this.wanted = false;
    this.counted = false;
    this.ready = false;
    this.helloSent = false;
    this.countWaiters = [];
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
    const l = this.link;
    this.link = null;
    l?.close();
    this.stopPing();
    this.failAll(new Error('connection closed'));
    for (const w of this.waiters.splice(0)) w.reject(new Error('connection closed'));
    this.setStatus('offline');
  }

  private url(): string {
    if (this.opts.url) return this.opts.url;
    const q = typeof location !== 'undefined' ? serverOverride(location.search, location) : null;
    if (q) return q;
    return `${location.origin.replace(/^http/, 'ws')}/ws`;
  }

  private async open(): Promise<void> {
    if (this.wanted) this.setStatus('connecting');
    this.opening = true;
    const url = this.url();
    const slot: { link: Link | null } = { link: null };
    const ev = {
      open: () => this.opened(slot),
      message: (d: Uint8Array) => { try { this.handle(d); } catch (e) { console.warn('bad message', e); } },
      close: (code?: number) => this.closed(slot.link, code),
    };
    try {
      const force = this.opts.transport ?? (typeof location !== 'undefined' ? new URLSearchParams(location.search).get('transport') : null);
      if (force !== 'ws' && !this.wtFailed && typeof WebTransport !== 'undefined') {
        const info = await fetchWtInfo(url);
        if (info && this.keep) {
          const host = new URL(url).hostname;
          try {
            await openWt(`https://${host}:${info.port}${info.path}`, info, {
              ...ev, open: () => { /* set below, after the link object exists */ },
            }).then((l) => { slot.link = l; this.link = l; this.opened(slot); });
            return;
          } catch (e) {
            console.info('WebTransport unavailable, using WebSocket:', (e as Error).message ?? e);
            this.wtFailed = true;
          }
        }
      }
      if (!this.keep) return;
      try {
        slot.link = this.link = openWs(url, ev);
      } catch (e) {
        console.warn('websocket', e);
        this.scheduleRetry();
      }
    } finally {
      this.opening = false;
    }
  }

  private opened(slot: { link: Link | null }): void {
    if (!slot.link || this.link !== slot.link) return;
    this.samples = [];
    this.ready = true;
    this.helloSent = false;
    if (this.wanted) this.sendHello();
    else {
      // an anonymous play: the game, nothing else
      this.sendRaw(encode((e) => {
        const p = e._initPresence();
        p.version = PROTOCOL_VERSION;
        p.game = this.game;
      }));
    }
    for (const w of this.countWaiters.splice(0)) w();
    this.ping();
    this.stopPing();
    this.pingTimer = setInterval(() => this.ping(), 2000);
  }

  private sendHello(): void {
    const name = playerName();
    this.helloSent = true;
    this.sendRaw(encode((e) => {
      const h = e._initHello();
      h.token = this.opts.token ?? accountToken();
      h.name = name;
      h.version = PROTOCOL_VERSION;
      h.game = this.game;
    }));
  }

  private stopPing(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  private closed(link: Link | null, code?: number): void {
    if (!link || this.link !== link) return;
    this.link = null;
    this.ready = false;
    this.helloSent = false;
    this.stopPing();
    if (code === CLOSE_REPLACED) {
      // another tab of this account took over: coming back would push it out again, and so on
      this.wanted = false;
      this.failAll(new Error('opened in another tab'));
      for (const w of this.waiters.splice(0)) w.reject(new Error('opened in another tab'));
      this.setStatus('replaced');
      return;
    }
    this.failAll(new Error('connection lost'));
    this.setStatus(this.wanted ? 'connecting' : 'offline');
    if (this.keep) this.scheduleRetry();
  }

  private scheduleRetry(): void {
    if (!this.keep || this.retryTimer) return;
    const delay = Math.min(15000, 500 * 2 ** this.retry++) * (0.75 + Math.random() * 0.5);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (this.keep && !this.link && !this.opening) void this.open();
    }, delay);
  }

  private ping(): void {
    const now = performance.timeOrigin + performance.now();
    this.sendRaw(encode((e) => { e._initPing().clientTime = now; }));
  }

  private sendRaw(b: Uint8Array): void {
    this.link?.send(b);
  }

  /** Sends one message (dropped while offline). */
  send(fill: (e: P.Envelope) => void): void {
    this.sendRaw(encode(fill));
  }

  /** Sends one message that may be lost or overtaken (a datagram over WebTransport). */
  sendUnreliable(fill: (e: P.Envelope) => void): void {
    this.link?.sendUnreliable(encode(fill));
  }

  /**
   * Sends a request and resolves with the answer (the message carrying the same `req`), or rejects with
   * a ServerError (the ErrorMsg refusing it), or on timeout / lost connection. `fill` gets the req id.
   * Requests whose answer carries no `req` (CreateRoom, JoinRoom, StartRoom) pass `match`: the first
   * message it accepts is the answer.
   */
  request(fill: (e: P.Envelope, req: number) => void, match?: (e: P.Envelope) => boolean): Promise<P.Envelope> {
    if (!this.online) return Promise.reject(new Error('not connected'));
    const req = this.nextReq++;
    if (this.nextReq > 0xfffffff0) this.nextReq = 1;
    return new Promise<P.Envelope>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(req);
        reject(new Error('request timed out'));
      }, this.opts.timeoutMs ?? 10000);
      this.pending.set(req, { resolve, reject, timer, match });
      this.send((e) => fill(e, req));
    });
  }

  private failAll(err: Error): void {
    for (const p of this.pending.values()) {
      clearTimeout(p.timer);
      p.reject(err);
    }
    this.pending.clear();
  }

  private answer(req: number, e: P.Envelope | Error): boolean {
    const p = this.pending.get(req);
    if (!req || !p) return false;
    this.pending.delete(req);
    clearTimeout(p.timer);
    if (e instanceof Error) p.reject(e);
    else p.resolve(e);
    return true;
  }

  // ------------------------------------------------------------------ receive

  private handle(data: Uint8Array): void {
    const e = decode(data);
    switch (e.which()) {
      case Which.WELCOME: {
        const w = e.welcome;
        this.accountId = w.accountId;
        this.name = w.name;
        this.retry = 0;
        if (!this.samples.length) this.offset = w.serverTime - (performance.timeOrigin + performance.now());
        this.setStatus('online');
        this.emit('welcome', { accountId: w.accountId, name: w.name });
        for (const x of this.waiters.splice(0)) x.resolve();
        return;
      }
      case Which.PONG: {
        const now = performance.timeOrigin + performance.now();
        const p = e.pong;
        const rtt = Math.max(0, now - p.clientTime);
        this.samples.push({ offset: p.serverTime + rtt / 2 - now, rtt });
        if (this.samples.length > 15) this.samples.shift();
        const best = [...this.samples].sort((a, b) => a.rtt - b.rtt).slice(0, Math.max(3, Math.ceil(this.samples.length / 2)));
        const offs = best.map((s) => s.offset).sort((a, b) => a - b);
        this.offset = offs[offs.length >> 1];
        this.rtt = best[0].rtt;
        return;
      }
      case Which.ERROR: {
        const err = new ServerError(e.error.code, e.error.text);
        if (!this.answer(e.error.req, err)) {
          // refused before the welcome (version, unknown game): connecting fails
          if (!this.online && this.waiters.length) {
            for (const x of this.waiters.splice(0)) x.reject(err);
            this.close();
          }
          this.emit('error', err);
        }
        return;
      }
      default: {
        const req = answerReq(e);
        if (req) this.answer(req, e);
        else for (const [r, p] of this.pending) if (p.match?.(e)) { this.answer(r, e); break; }
        this.emit('message', e);
      }
    }
  }
}

/** The `req` of a server answer (0 for unsolicited messages). */
function answerReq(e: P.Envelope): number {
  switch (e.which()) {
    case Which.ROOM_LIST: return e.roomList.req;
    case Which.STORAGE_REPLY: return e.storageReply.req;
    case Which.SCORE_TABLE: return e.scoreTable.req;
    default: return 0;
  }
}
