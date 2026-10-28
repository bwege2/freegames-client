// Online play: the website's lobby where the original had its game server's chat room, and the
// original's in-game protocol (fb_net.pm's gsend/grecv: "<id><message>" lines) carried as
// Msg.line over the room (protocol/games/frozenbubble.capnp). The server module relays the lines,
// as fb-server did, decides the seats' ids and nicks (Msg.start, GAME_CAN_START's mapping) and each
// game's starting bubbles, and counts the victories (Results).
import { packGame, setData, bytes, unpackGame, type GameContext, type RoundStart } from '../../../../src/sdk/index.ts';
import * as P from '../proto/frozenbubble.ts';
import { Die, type FbNet, type FbOnline, type NetMsg, type OnlineSetup } from '../fb/game.ts';

const CSS = `
.fb-net { position: absolute; inset: 0; overflow: auto; background: rgb(0 0 0 / .35); }
.fb-net-opts { box-sizing: border-box; max-width: 34rem; margin: 1.5rem auto -1rem; padding: .8rem 1.5rem; font: 14px/1.5 system-ui, sans-serif;
  color: #1d2125; background: #fff; border-radius: 10px; }
.fb-net-opts b { display: block; margin-bottom: .3rem; }
.fb-net-opts label { display: flex; gap: .5rem; align-items: center; }
`;

const LIMITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 30, 50, 100];

/** the module's Start: GAME_CAN_START's mapping and this client's nick */
type StartInfo = Pick<OnlineSetup, 'mapping' | 'mynick'>;

const enc = new TextEncoder();
const dec = new TextDecoder();

export class Online implements FbOnline, FbNet {
  private readonly ctx: GameContext;
  private readonly host: HTMLElement;
  private overlay: HTMLDivElement | null = null;
  private round: RoundStart | null = null;
  private myid = '';
  private connected = false;
  private incoming: NetMsg[] = [];
  private delayed: NetMsg[] = [];
  private waiter: (() => void) | null = null;
  private start: StartInfo | null = null;
  private startWaiter: ((s: StartInfo) => void) | null = null;
  private results: Uint8Array | null = null;
  private finishedWaiter: (() => void) | null = null;
  private subscribed = false;
  private lastResults = '';
  private rounds = 0;
  private readonly ticks: () => number;
  readonly net: FbNet = this;

  constructor(host: HTMLElement, ctx: GameContext, ticks: () => number) {
    this.host = host;
    this.ctx = ctx;
    this.ticks = ticks;
  }

  typing(): boolean { return this.overlay !== null; }

  /** for the end-to-end test: the seat, the seats, the rounds finished and the last one's results ("nick:victories,... reason") */
  info(): { you: number; seats: number; results: string; rounds: number } {
    return { you: this.round?.you ?? -1, seats: this.round?.seats.length ?? 0, results: this.lastResults, rounds: this.rounds };
  }

  private describe(results: Uint8Array): string {
    if (!results.length) return '';
    try {
      const r = unpackGame(P.Results, results);
      const nicks = r.nicks, v = r.victories;
      const out: string[] = [];
      for (let i = 0; i < nicks.length; i++) out.push(`${nicks.get(i)}:${v.get(i)}`);
      return `${out.join(',')} ${r.reason}`;
    } catch { return '?'; }
  }

  private subscribe(): void {
    if (this.subscribed) return;
    this.subscribed = true;
    const rooms = this.ctx.rooms;
    rooms.on('message', (g) => {
      let m: P.Msg;
      try { m = unpackGame(P.Msg, g.data); } catch { return; }
      if (m.which() === P.Msg.START) {
        if (g.from !== 255) return;
        const s = m.start;
        const ids = bytes(s.ids);
        const nicks = s.nicks;
        const mapping: { id: string; nick: string }[] = [];
        for (let i = 0; i < ids.length && i < nicks.length; i++) mapping.push({ id: String.fromCharCode(ids[i]), nick: nicks.get(i) });
        const you = mapping[s.you];
        if (!you) return;
        // (it may come before the lobby has handed over the round)
        this.start = { mapping, mynick: you.nick };
        this.startWaiter?.(this.start);
      } else if (m.which() === P.Msg.LINE) {
        const d = bytes(m.line);
        if (d.length < 2) return;
        this.incoming.push({ id: String.fromCharCode(d[0]), msg: dec.decode(d.subarray(1)) });
        const w = this.waiter;
        this.waiter = null;
        w?.();
      }
    });
    // the module ends the round when the game is over for good (victories limit, players left); the
    // clients notice that themselves (as the original's did) and leave, so the connection stays
    rooms.on('finished', (f) => {
      this.results = f.results;
      this.lastResults = this.describe(f.results);
      this.rounds++;
      this.finishedWaiter?.();
    });
    rooms.on('closed', () => {
      this.connected = false;
      this.finishedWaiter?.();
      const w = this.waiter;
      this.waiter = null;
      w?.();
    });
  }

  /** the lobby (with the game creator's options), then the round's GAME_CAN_START */
  async chooseGame(): Promise<OnlineSetup | null> {
    this.subscribe();
    this.round = null;
    this.start = null;
    this.results = null;
    this.incoming = [];
    this.delayed = [];
    if (!document.getElementById('fb-net-css')) {
      const st = document.createElement('style');
      st.id = 'fb-net-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    const o = document.createElement('div');
    o.className = 'fb-net';
    const opts = document.createElement('div');
    opts.className = 'fb-net-opts';
    opts.innerHTML = '<b>New game: the creator\'s options</b>'
      + '<label><input type="checkbox" class="fb-chain" checked> Chain-reaction</label>'
      + '<label><input type="checkbox" class="fb-cont" checked> Continue game when players leave</label>'
      + '<label><input type="checkbox" class="fb-single" checked> Single player targetting (F1-F4, F10)</label>'
      + `<label>Victories limit <select class="fb-limit">${LIMITS.map((v) => `<option value="${v}"${v === 5 ? ' selected' : ''}>${v || 'none (unlimited)'}</option>`).join('')}</select></label>`;
    const box = document.createElement('div');
    o.append(opts, box);
    this.host.appendChild(o);
    this.overlay = o;
    const q = <T extends Element>(s: string): T => opts.querySelector(s) as T;
    try {
      const round = await this.ctx.lobby(box, {
        title: 'Frozen Bubble online',
        seats: { min: 2, max: 5, default: 5 },
        options: () => packGame(P.Options, (x) => {
          x.chainReaction = q<HTMLInputElement>('.fb-chain').checked;
          x.continueGameWhenPlayersLeave = q<HTMLInputElement>('.fb-cont').checked;
          x.singlePlayerTargetting = q<HTMLInputElement>('.fb-single').checked;
          x.victoriesLimit = Number(q<HTMLSelectElement>('.fb-limit').value);
        }),
      });
      this.round = round;
      this.connected = true;
    } catch {
      this.close();
      return null;
    }
    this.close();
    const start = this.start ?? await new Promise<StartInfo | null>((resolve) => {
      this.startWaiter = resolve;
      const t = setTimeout(() => resolve(null), 15000);
      this.ctx.signal.addEventListener('abort', () => { clearTimeout(t); resolve(null); }, { once: true });
    });
    this.startWaiter = null;
    if (!start) { this.ctx.rooms.leave(); this.connected = false; return null; }
    let opt: P.Options | null = null;
    try { const opts = this.round?.options; if (opts?.length) opt = unpackGame(P.Options, opts); } catch { opt = null; }
    return {
      ...start,
      chainreaction: opt ? opt.chainReaction : true,
      continuegamewhenplayersleave: opt ? opt.continueGameWhenPlayersLeave : true,
      singleplayertargetting: opt ? opt.singlePlayerTargetting : true,
      scorelimit: opt ? opt.victoriesLimit : 5,
    };
  }

  private close(): void {
    this.overlay?.remove();
    this.overlay = null;
    this.host.focus();
  }

  /** after a game: the module ends the round (Results); then the room is left */
  async ended(): Promise<void> {
    if (this.round) {
      if (this.connected && !this.results) {
        await new Promise<void>((resolve) => {
          this.finishedWaiter = resolve;
          setTimeout(resolve, 10000);
        });
        this.finishedWaiter = null;
      }
      this.ctx.rooms.leave();
    }
    this.connected = false;
    this.round = null;
  }

  // ------------------------------------------------------------------ fb_net's in-game part

  isconnected(): boolean { return this.connected; }

  setmyid(id: string): void { this.myid = id; }

  gsend(msg: string): void {
    if (!this.connected) return;
    const body = enc.encode(msg);
    const d = new Uint8Array(1 + body.length);
    d[0] = this.myid.charCodeAt(0);
    d.set(body, 1);
    this.ctx.rooms.send(packGame(P.Msg, (m) => setData((n) => m._initLine(n), d)), 'server');
  }

  grecv(): NetMsg[] {
    const out = [...this.delayed, ...this.incoming];
    this.delayed = [];
    this.incoming = [];
    return out;
  }

  gdelay_messages(...m: NetMsg[]): void { this.delayed.push(...m); }

  grecv_get1msg_ifdata(): NetMsg | undefined {
    const [m, ...rest] = this.grecv();
    this.delayed.push(...rest);
    return m;
  }

  /** waits (10 s at most, the original's alarm) for a message */
  async grecv_get1msg(): Promise<NetMsg> {
    const until = Date.now() + 10000;
    while (!this.delayed.length) {
      this.delayed = this.grecv();
      if (this.delayed.length) break;
      if (!this.connected || Date.now() > until) { this.disconnect(); throw new Die('quit'); }
      await new Promise<void>((resolve) => {
        this.waiter = resolve;
        setTimeout(resolve, 100);
      });
      this.waiter = null;
      if (this.ctx.signal.aborted) throw new Die('quit');
    }
    void this.ticks;
    return this.delayed.shift()!;
  }

  disconnect(): void {
    if (this.connected) this.ctx.rooms.leave();
    this.connected = false;
  }

  stop(): void { this.close(); }
}
