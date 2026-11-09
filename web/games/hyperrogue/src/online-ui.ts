// The online game in the page (port only; ONLINE.md): the shared lobby (ctx.lobby) over the game's window, the
// lockstep (src/net.ts) driven from the game's frame loop, a status line (round, whom the round waits for, the
// players who left) and the results. The game itself stays the original's screen: the map, the HUD, the menus.
// The player plays with the single-player controls; what they choose becomes their seat's decision.
// (C) Zeno Rogue, GPL-2.0-or-later (HyperRogue); TypeScript port.
import type { GameContext, RoundStart } from '../../../src/sdk/index.ts';
import { G } from './globals.ts';
import { Online, packOptions, GAME, type OnlineEnd } from './net.ts';
import {
  online_menu_options, online_install_input, online_state_parts, online_as_local_player, online_end_game, online_push_menu,
} from './online.ts';
import { popScreenAll } from './control.ts';

const CSS = `
.hr-online { position: absolute; left: 50%; transform: translateX(-50%); top: 6px; z-index: 20; max-width: calc(100% - 16px);
  font: 14px/1.4 system-ui, sans-serif; color: #e8e8e8; background: rgb(0 0 0 / .72); border: 1px solid #555;
  border-radius: 8px; padding: .35rem .8rem; display: flex; gap: .8rem; align-items: center; flex-wrap: wrap; }
.hr-online button { font: inherit; padding: .15rem .7rem; border: 1px solid #888; background: #333; color: #fff;
  border-radius: 6px; cursor: pointer; }
.hr-online-end { flex-direction: column; align-items: stretch; top: 20%; padding: 1rem 1.4rem; }
.hr-online-end table { border-collapse: collapse; }
.hr-online-end td, .hr-online-end th { padding: .1rem .6rem; text-align: right; }
.hr-online-end td:first-child, .hr-online-end th:first-child { text-align: left; }
.hr-lobby { position: absolute; inset: 0; z-index: 30; overflow: auto; background: rgb(0 0 0 / .8); }
`;

/** player i's colour (multi::scs[i].skincolor, the colour the original gives each player's body) */
function playerColor(i: number): string {
  const c = G.multi_scs[i]?.skincolor ?? 0xFFFFFFFF;
  return '#' + ((c >>> 8) & 0xFFFFFF).toString(16).padStart(6, '0');
}

export class OnlineUI {
  readonly host: HTMLElement;
  readonly ctx: GameContext;
  online: Online | null = null;
  private lobbyBox: HTMLDivElement | null = null;
  private bar: HTMLDivElement | null = null;
  private offs: (() => void)[] = [];
  private shown = '';
  /** the state right after the game started (debugging) */
  private startParts: Record<string, number[]> | null = null;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    if (!document.getElementById('hr-online-css')) {
      const st = document.createElement('style');
      st.id = 'hr-online-css';
      st.textContent = CSS;
      document.head.append(st);
    }
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    G.online_menu = true;
    G.online_open_lobby = () => { void this.openLobby(); };
    (window as unknown as { __hyperrogue_online?: unknown }).__hyperrogue_online = {
      info: () => this.info(),
      menu: () => { popScreenAll(); online_push_menu(); },
      // for finding where two browsers' games differ
      parts: () => (this.online ? online_state_parts() : null),
      startParts: () => this.startParts,
    };
  }

  /** for the e2e: the round, the hashes, whom it waits for */
  info(): unknown {
    const o = this.online;
    if (!o) return null;
    return {
      you: o.you, seats: o.seats, round: o.round, played: o.played, log: o.log.slice(-200).map((e) => e.hash),
      canDecide: o.canDecide(), waiting: o.undecided(), over: o.over, end: o.end, left: o.leftNames,
      players: G.multi_players, turn: G.turncount,
    };
  }

  async openLobby(): Promise<void> {
    if (this.lobbyBox || this.online) return;
    const box = document.createElement('div');
    box.className = 'hr-lobby';
    const inner = document.createElement('div');
    inner.style.cssText = 'max-width:46rem;margin:0 auto;padding:1rem;';
    box.append(inner);
    this.host.append(box);
    this.lobbyBox = box;
    const opts = { ...online_menu_options };
    try {
      const round = await this.ctx.lobby(inner, {
        title: 'HyperRogue online',
        seats: { min: 2, max: 7, default: 2 },
        seatNames: Array.from({ length: 7 }, (_, i) => `Player ${i + 1}`),
        options: () => packOptions(opts),
      });
      this.begin(round);
    } catch {
      // cancelled: back to the online menu
      online_push_menu();
    } finally {
      box.remove();
      this.lobbyBox = null;
      this.host.focus({ preventScroll: true });
    }
  }

  private begin(round: RoundStart): void {
    for (const off of this.offs) off();
    const o = new Online((data, to) => this.ctx.rooms.send(data, to), GAME);
    this.online = o;
    const start = (r: RoundStart): void => {
      popScreenAll();
      o.start(r);
      this.startParts = online_state_parts();
      if (!o.end) online_install_input((d) => o.decide({ ...d, seat: o.you }), () => this.leave(true));
      this.status();
    };
    this.offs = [
      this.ctx.rooms.on('message', ({ from, data }) => o.message(from, data)),
      this.ctx.rooms.on('finished', ({ results, stopped }) => { o.finished(results, stopped); this.status(); }),
      // back after a dropped connection: the game from the seed again, then every decision so far
      this.ctx.rooms.on('started', (r) => { if (r.rejoined) start(r); }),
      this.ctx.rooms.on('closed', ({ reason }) => {
        if (!o.end) o.end = { reason: 'stopped', rounds: o.round, gold: 0, seats: [], text: `Out of the room: ${reason}` };
        this.status();
      }),
    ];
    start(round);
  }

  /**
   * The player leaves the online game (the Leave button, the end screen), back to a single-player game; `stopping`:
   * from a restart or a mode change in a menu (stop_game), which then starts the next game itself.
   */
  leave(stopping = false): void {
    if (!this.online) return;
    for (const off of this.offs) off();
    this.offs = [];
    this.online = null;
    try { this.ctx.rooms.leave(); } catch { /* not in a room */ }
    this.bar?.remove();
    this.bar = null;
    this.shown = '';
    if (stopping) {
      G.online_lockstep = false;
      G.online_input = null;
      G.online_leave = null;
      G.online_isolated = false;
      G.multi_players = 1;
    } else online_end_game();
  }

  /** one frame: the rounds that are complete, then the game's frame with the local player at the controls */
  frame(iter: () => void): void {
    const o = this.online;
    if (!o) { iter(); return; }
    if (!o.end) o.pump(64);
    this.status();
    online_as_local_player(o.playerOf(o.you), iter);
  }

  private status(): void {
    const o = this.online;
    if (!o) return;
    const name = (seat: number): string => o.names[o.playerOf(seat)] ?? `seat ${seat + 1}`;
    let html: string;
    const key = JSON.stringify([o.round, o.end, o.over, o.undecided(), o.canDecide(), o.leftNames, o.waitingForHistory]);
    if (key === this.shown) return;
    this.shown = key;
    const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
    if (o.end) html = this.endHtml(o.end, o, esc);
    else {
      const me = o.playerOf(o.you);
      const parts = [`<span style="color:${playerColor(me)}">●</span> Online, round ${o.round + 1}`];
      if (o.waitingForHistory) parts.push('catching up…');
      else if (o.over) parts.push('game over: waiting for the others');
      else if (o.canDecide()) parts.push('<b>your move</b>');
      else {
        const w = o.undecided().filter((s) => s !== o.you);
        parts.push(w.length ? `waiting for ${w.map((s) => esc(name(s))).join(', ')}` : 'waiting');
      }
      if (o.leftNames.length) parts.push(`left: ${o.leftNames.map(esc).join(', ')}`);
      if (o.options.turnTimeout) parts.push(`${o.options.turnTimeout} s a turn`);
      html = parts.map((p) => `<span>${p}</span>`).join('') + '<button data-act="leave">Leave</button>';
    }
    if (!this.bar) {
      this.bar = document.createElement('div');
      for (const t of ['pointerdown', 'mousedown', 'mouseup', 'click', 'keydown', 'wheel'] as const)
        this.bar.addEventListener(t, (e) => e.stopPropagation());
      this.bar.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).dataset.act === 'leave') this.leave();
      });
      this.host.append(this.bar);
    }
    this.bar.className = o.end ? 'hr-online hr-online-end' : 'hr-online';
    this.bar.innerHTML = html;
  }

  private endHtml(e: OnlineEnd, o: Online, esc: (s: string) => string): string {
    const why: Record<string, string> = {
      over: 'The game is over.', disagreed: 'The game is over, but the browsers did not agree how.',
      desync: 'The games went apart: the round was stopped.', left: 'Everyone left.', limit: 'The game reached the server\'s limit of rounds.',
      stopped: 'The round was stopped.', version: 'Another version of the game.',
    };
    let s = `<b>${why[e.reason] ?? ''}</b>`;
    if (e.text) s += `<span>${esc(e.text)}</span>`;
    if (e.reason === 'over') {
      s += `<span>${e.rounds} rounds, ${e.gold} $$$ in all</span><table><tr><th>player</th><th>treasures</th><th>kills</th><th>deaths</th></tr>`;
      e.seats.forEach((st, i) => {
        s += `<tr><td><span style="color:${playerColor(i)}">●</span> ${esc(o.names[i] ?? `Player ${i + 1}`)}</td><td>${st.treasures}</td><td>${st.kills}</td><td>${st.deaths}</td></tr>`;
      });
      s += '</table>';
    }
    return s + '<button data-act="leave">Back to the game</button>';
  }

  stop(): void {
    for (const off of this.offs) off();
    this.offs = [];
    this.lobbyBox?.remove();
    this.bar?.remove();
    if (this.online) { try { this.ctx.rooms.leave(); } catch { /* gone */ } }
    this.online = null;
    G.online_menu = false;
    G.online_open_lobby = null;
    G.online_input = null;
    G.online_leave = null;
    G.online_lockstep = false;
    delete (window as unknown as { __hyperrogue_online?: unknown }).__hyperrogue_online;
  }
}
