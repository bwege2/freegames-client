// The online game (port only; ONLINE.md): the game side of the lockstep. The original 13.1o has only local
// multiplayer (multi.cpp, up to 7 players at one keyboard); online, every browser runs the same turn-based
// multiplayer game from the round's seed and applies every seat's decisions round by round, exactly as
// multi::handleMulti applies the decisions of the players at one keyboard (multi_alldecided). The network side is
// src/net.ts, the screens around it src/online-ui.ts. This file has what touches the game: the start of a game,
// applying a round, the hash of the state, the end, and the online menu (a dialog in the original's style).
// (C) Zeno Rogue, GPL-2.0-or-later (HyperRogue); TypeScript port.
import { G } from './globals.ts';
import { MD_WAIT, MD_DROP, MD_UNDECIDED, MD_USE_ORB } from './hyper.ts';
import type { cell } from './locations.ts';
import { hrngen, shrand, srand, drawing_rng_begin, drawing_rng_end } from './rand.ts';
import { stop_game, start_game, rg_inv } from './system.ts';
import { resetModes } from './config.ts';
import { multi_alldecided, multi_activePlayers, multi_leaveGame, multi_playerActive } from './multi.ts';
import { addMessage, flashMessages } from './basegraph.ts';
import { XLAT, XLAT1 } from './language.ts';
import { gold } from './items.ts';
import { linf, ittypes, motypes } from './content.ts';
import { gamescreen, sm, popScreen } from './graph.ts';
import { pushScreen } from './control.ts';
import {
  dialog_init_t, dialog_addInfo, dialog_addSelItem, dialog_addItem, dialog_addBreak, dialog_addBack, dialog_display,
  dialog_add_action, ONOFF,
} from './dialogs.ts';

/** the room options (protocol/games/hyperrogue.capnp Options) */
export interface OnlineOptions {
  /** specialland (eLand) */
  land: number;
  hardcore: boolean;
  /** inv::on */
  orbStrategy: boolean;
  /** s; 0: none */
  turnTimeout: number;
}

/** the start lands a room may choose (eLand; the server module's LANDS): Icy Land first, the original's default */
export const ONLINE_LANDS = [4, 2, 3, 5, 6, 7];
/** the turn timeouts offered, s */
export const ONLINE_TIMEOUTS = [0, 30, 60, 120];
export const DEFAULT_OPTIONS: OnlineOptions = { land: 4, hardcore: false, orbStrategy: false, turnTimeout: 0 };

/** one seat's decision for a round (Decision of the schema): kind 0 move, 1 wait, 2 drop, 3 orb, 4 leave, 5 none */
export interface OnlineDecision {
  seat: number;
  kind: number;
  dir: number;
  subdir: number;
  target: number;
}

export const K_MOVE = 0, K_WAIT = 1, K_DROP = 2, K_ORB = 3, K_LEAVE = 4, K_NONE = 5;

/**
 * Starts the online game: the standard game (resetModes, as the start menu's "HyperRogue classic" or "Orb Strategy
 * mode"), the room's options, `players` players with the blade (as showConfigureMultiplayer does), the drawing
 * isolated from the rules, both generators seeded with the round's seed. Every browser of the round runs exactly
 * this.
 */
export function online_start_game(seed: number, o: OnlineOptions, players: number): void {
  G.online_lockstep = false;
  G.online_input = null;
  G.online_isolated = true;
  resetModes(o.orbStrategy ? rg_inv : 'c'.charCodeAt(0));
  stop_game();
  G.hardcore = o.hardcore;
  G.hardcoreAt = 0;
  G.casual = false;
  G.use_custom_land_list = false;
  G.princess_challenge = false;
  G.specialland = G.firstland = o.land;
  G.multi_players = players;
  G.bow_weapon = 0; // bow::wBlade
  for (let i = 0; i < G.multi_whereto.length; i++) {
    G.multi_kills[i] = G.multi_deaths[i] = G.multi_treasures[i] = 0;
    G.multi_pkills[i] = G.multi_suicides[i] = 0;
    G.multi_whereto[i].d = MD_UNDECIDED;
    G.multi_whereto[i].subdir = 1;
    G.multi_accepted[i] = false;
    G.multi_after_accepted[i] = false;
  }
  G.multi_revive_queue.length = 0;
  G.cheater = 0;
  G.autocheat = false;
  shrand(seed);
  srand(seed);
  start_game();
}

/** the player leaves the game (the original's leave key, multi::handleMulti): only while more than one plays */
function leave(p: number): void {
  if (multi_playerActive(p) && multi_activePlayers() > 1) {
    addMessage(XLAT('Left the game.'));
    multi_leaveGame(p);
  }
}

/**
 * Applies one round: first the players whose seats left the room (`gone`, by player index; they leave the game and
 * are never revived, since nobody decides for them any more), then every decision, in the server's order, into
 * multi::whereto (a living player without a decision waits), then the part of handleMulti that runs when all have
 * decided. Returns whether the round was played (a refused round changes only the messages).
 */
export function online_apply_round(decisions: OnlineDecision[], gone: number[], playerOf: (seat: number) => number): boolean {
  const input = G.online_input;
  G.online_input = null;
  try {
    for (const p of gone) {
      leave(p);
      const q = G.multi_revive_queue;
      for (let i = q.length - 1; i >= 0; i--) if (q[i] === p) q.splice(i, 1);
    }
    const n = G.multi_players;
    for (let p = 0; p < n; p++) { G.multi_whereto[p].d = MD_UNDECIDED; G.multi_whereto[p].subdir = 1; }
    for (const d of decisions) {
      const p = playerOf(d.seat);
      if (p < 0 || p >= n) continue;
      const md = G.multi_whereto[p];
      const at = G.multi_player[p].at;
      switch (d.kind) {
        case K_MOVE:
          if (at && d.dir < at.type) { md.d = d.dir; md.subdir = d.subdir < 0 ? -1 : 1; }
          else md.d = MD_WAIT;
          break;
        case K_WAIT: md.d = MD_WAIT; break;
        case K_DROP: md.d = MD_DROP; break;
        case K_ORB:
          if (d.target < G.dcal.length) { md.d = MD_USE_ORB; md.tgt = G.dcal[d.target]; }
          else md.d = MD_WAIT;
          break;
        case K_LEAVE: leave(p); break;
        default: break;
      }
    }
    for (let p = 0; p < n; p++) if (G.multi_whereto[p].d === MD_UNDECIDED) G.multi_whereto[p].d = MD_WAIT;
    flashMessages();
    return multi_alldecided();
  } finally {
    G.online_input = input;
  }
}

/** a decision of the local player (from movepcto / targetRangedOrb): its kind, or -1 if it is none */
export function online_decision_of(d: number, subdir: number, tgt: cell | null): OnlineDecision | null {
  if (d >= 0 && d < 8) return { seat: -1, kind: K_MOVE, dir: d, subdir: subdir < 0 ? -1 : 1, target: 0 };
  if (d === MD_WAIT) return { seat: -1, kind: K_WAIT, dir: 0, subdir: 1, target: 0 };
  if (d === MD_DROP) return { seat: -1, kind: K_DROP, dir: 0, subdir: 1, target: 0 };
  if (d === MD_USE_ORB && tgt) {
    const i = G.dcal.indexOf(tgt);
    if (i < 0 || i > 0xffff) return null;
    return { seat: -1, kind: K_ORB, dir: 0, subdir: 1, target: i };
  }
  return null;
}

/**
 * Runs `f` (a frame: the keys, the mouse, the drawing) with the local player as the player at the controls: cwt and
 * multi::cpid are player p's, as multi::handleMulti sets them for each player's keys, and they are put back after,
 * so that the rules find them as they left them.
 */
export function online_as_local_player<T>(p: number, f: () => T): T {
  const bcwt = G.cwt.clone(), bcpid = G.multi_cpid;
  const pl = p >= 0 ? G.multi_player[p] : null;
  if (pl?.at) {
    G.cwt.set(pl);
    G.multi_cpid = p;
    const w = G.multi_whereis[p];
    if (w && w.T.some((row) => row.some((v) => v !== 0))) G.current_display.player_matrix = w; // (drawn at least once)
  }
  // the whole frame (not only drawscreen) runs on the drawing's generators: a frame of the browser's main loop
  // draws hrand outside drawscreen too, and how many frames a browser draws must not change the rules' sequence
  const iso = G.online_isolated;
  if (iso) drawing_rng_begin();
  try {
    return f();
  } finally {
    if (iso) drawing_rng_end();
    G.cwt.set(bcwt);
    G.multi_cpid = bcpid;
  }
}

/** the online game's controls: a move or ranged Orb the player chooses goes to `decide` instead of being played */
export function online_install_input(decide: (d: OnlineDecision) => boolean, leave: () => void): void {
  G.online_lockstep = true;
  G.online_leave = leave;
  G.online_input = (d, subdir, tgt) => {
    const x = online_decision_of(d, subdir, tgt);
    return x ? decide(x) : false;
  };
}

// --- the hash of the state (FNV-1a, 32 bits): what the rules decide, nothing of the drawing ---

function fnv(h: number, v: number): number {
  v |= 0;
  for (let k = 0; k < 4; k++) { h ^= (v >>> (8 * k)) & 0xff; h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

/**
 * The hash of the game: turncount, canmove, cheater, items, kills, the players (position as an index of dcal, facing,
 * statistics), the revival queue, every cell of dcal (the fields that test/trace.ts dumps: land, wall, monster,
 * item, direction, hit points, stun, land parameter, flags, wall parameter, mpdist, barrier, ligon, mirror, type) and
 * the next numbers of a copy of hrngen.
 */
export function online_state_hash(): number {
  let h = 2166136261;
  for (const part of Object.values(online_state_parts())) for (const v of part) h = fnv(h, v);
  return h >>> 0;
}

/** what online_state_hash hashes, by part (for finding where two games differ) */
export function online_state_parts(): Record<string, number[]> {
  const dcal = G.dcal;
  const idx = new Map<cell, number>();
  for (let i = 0; i < dcal.length; i++) idx.set(dcal[i], i);
  const players: number[] = [];
  for (let p = 0; p < G.multi_players; p++) {
    const pl = G.multi_player[p];
    players.push(pl.at ? idx.get(pl.at) ?? -2 : -1, pl.spin, pl.mirrored ? 1 : 0, G.multi_treasures[p], G.multi_kills[p], G.multi_deaths[p]);
  }
  const parts: Record<string, number[]> = {
    game: [G.turncount, G.canmove ? 1 : 0, G.cheater, dcal.length],
    items: Array.from({ length: ittypes }, (_, i) => G.items[i]),
    kills: Array.from({ length: motypes }, (_, i) => G.kills[i]),
    players,
    revive: [...G.multi_revive_queue],
  };
  dcal.forEach((c, i) => {
    parts['c' + i] = [c.land, c.wall, c.monst, c.item, c.mondir, c.hitpoints, c.stuntime, c.landparam, c.landflags,
      c.wparam, c.mpdist, c.bardir, c.barleft, c.barright, +c.ligon, +c.monmirror, c.type];
  });
  const r = hrngen.clone();
  parts.hrngen = [r.next(), r.next()];
  return parts;
}

/** the game is over for everyone: the last player cannot move (checkmove's canmove) */
export function online_game_over(): boolean {
  return !G.canmove;
}

/** the end's numbers: gold() and multi::treasures/kills/deaths by player */
export function online_stats(): { gold: number; seats: { treasures: number; kills: number; deaths: number }[] } {
  const seats = [];
  for (let p = 0; p < G.multi_players; p++)
    seats.push({ treasures: G.multi_treasures[p], kills: G.multi_kills[p], deaths: G.multi_deaths[p] });
  return { gold: gold(), seats };
}

/** whether player p is on the board */
export function online_alive(p: number): boolean {
  return !!G.multi_player[p]?.at;
}

/** the end of the online game in this browser: back to the original's single-player game */
export function online_end_game(): void {
  G.online_lockstep = false;
  G.online_input = null;
  G.online_leave = null;
  G.online_isolated = false;
  stop_game();
  G.multi_players = 1;
  start_game();
}

// --- the online menu (port only; a dialog in the style of the original's "multiplayer" menu) ---

/** the options the next room is created with (the menu changes them) */
export const online_menu_options: OnlineOptions = { ...DEFAULT_OPTIONS };

export function online_showMenu(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('online multiplayer'));
  const o = online_menu_options;
  dialog_addInfo(XLAT('2 to 7 players, each at their own computer'));
  dialog_addInfo(XLAT('the rules of the multiplayer mode, one turn for everyone'));
  dialog_addBreak(100);
  dialog_addSelItem(XLAT('starting land'), XLAT1(linf[o.land].name), 'l'.charCodeAt(0));
  dialog_add_action(() => { o.land = ONLINE_LANDS[(ONLINE_LANDS.indexOf(o.land) + 1) % ONLINE_LANDS.length]; });
  dialog_addSelItem(XLAT('hardcore mode'), ONOFF(o.hardcore), 'h'.charCodeAt(0));
  dialog_add_action(() => { o.hardcore = !o.hardcore; });
  dialog_addSelItem(XLAT('Orb Strategy mode'), ONOFF(o.orbStrategy), 'i'.charCodeAt(0));
  dialog_add_action(() => { o.orbStrategy = !o.orbStrategy; });
  dialog_addSelItem(XLAT('time for a turn'), o.turnTimeout ? `${o.turnTimeout} s` : XLAT('unlimited'), 't'.charCodeAt(0));
  dialog_add_action(() => { o.turnTimeout = ONLINE_TIMEOUTS[(ONLINE_TIMEOUTS.indexOf(o.turnTimeout) + 1) % ONLINE_TIMEOUTS.length]; });
  dialog_addBreak(100);
  dialog_addItem(XLAT('find or create a room'), 'n'.charCodeAt(0));
  dialog_add_action(() => { popScreen(); G.online_open_lobby?.(); });
  dialog_addBack();
  dialog_display();
}

/** opens the online menu (for the UI) */
export function online_push_menu(): void { pushScreen(online_showMenu); }
