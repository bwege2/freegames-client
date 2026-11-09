// The scenario interpreter of re/hyperrogue/oracle/harness.cpp, run against the port: same commands, same dump
// format (re/hyperrogue/oracle/scenarios-format.md), so its output can be compared line for line with the
// oracle's golden dumps (test/golden/). Keep the two in step: a change to one is a change to both.
import { G } from '../src/globals.ts';
import { fmtG17, fmtG, std_sort, c_clock } from '../src/cpp.ts';
import { cgi } from '../src/geometry.ts';
import {
  minf, iinf, winf, linf, motypes, ittypes, walltypes, landtypes, monster_ids, item_ids, wall_ids, land_ids,
} from '../src/content.ts';
import { isNative } from '../src/content-req.ts';
import { cell, celllister, type cellwalker } from '../src/locations.ts';
import { MD_WAIT, MD_DROP, MD_USE_ORB, MAXPLAYER, NotPorted } from '../src/hyper.ts';
import { multi_alldecided, multi_activePlayers, multi_leaveGame } from '../src/multi.ts';
import { addMessage, flashMessages } from '../src/basegraph.ts';
import { XLAT, XLAT1, XLATN, XLAT1_acc } from '../src/language.ts';
import { hrngen, shrand, hrand, hrandpos, hrandf, chance, hrandstate, hrandom_permutation, srand, rand } from '../src/rand.ts';
import { hyper_init, register_all } from '../src/hyper-main.ts';
import { movepcto } from '../src/pcmove.ts';
import { applyCheat, cheatMoveTo } from '../src/debug.ts';
import { targetRangedOrb, roKeyboard } from '../src/orbs.ts';
import { stop_game, stop_game_and_switch_mode, start_game, loadsave, restore_all_golems, rg_nothing } from '../src/system.ts';
import { cfs } from '../src/cfile.ts';
import { loadNewConfig, saveConfig, conffile_ref } from '../src/config.ts';
import { initcells, celldist, ctof } from '../src/cell.ts';
import {
  ishept, pseudohept, emeraldval, polara50, polarb50, fiftyval049, fiftyval200, zebra40, zebra3,
} from '../src/pattern2.ts';
import { fieldpattern_fieldval_uniq } from '../src/fieldpattern.ts';
import { shot_take, shot_svg, svg_render, svg_f } from '../src/screenshot.ts';
import { compute_fsize, init_font, textwidth } from '../src/basegraph.ts';
import { drawscreen } from '../src/graph.ts';
import { ttf_record, type text_record } from '../src/sdlttf.ts';
import { handlekey } from '../src/control.ts';
import {
  SDLK_ESCAPE, SDLK_RETURN, SDLK_BACKSPACE, SDLK_TAB, SDLK_UP, SDLK_DOWN, SDLK_LEFT, SDLK_RIGHT, SDLK_PAGEUP,
  SDLK_PAGEDOWN, SDLK_HOME, SDLK_END, SDLK_F1, SDLK_F2, SDLK_F3, SDLK_F4, SDLK_F5, SDLK_F6, SDLK_F7, SDLK_F8, SDLK_F9,
  SDLK_F10, PSEUDOKEY_WHEELUP, PSEUDOKEY_WHEELDOWN,
} from '../src/sdl.ts';

/** harness.cpp key_of: a key name -> SDL2 keycode (one character is itself, ^X is Ctrl+X, the names, else a number) */
const key_names: Record<string, number> = {
  Escape: SDLK_ESCAPE, Return: SDLK_RETURN, Space: 32, Backspace: SDLK_BACKSPACE, Tab: SDLK_TAB, Up: SDLK_UP,
  Down: SDLK_DOWN, Left: SDLK_LEFT, Right: SDLK_RIGHT, PageUp: SDLK_PAGEUP, PageDown: SDLK_PAGEDOWN, Home: SDLK_HOME,
  End: SDLK_END, F1: SDLK_F1, F2: SDLK_F2, F3: SDLK_F3, F4: SDLK_F4, F5: SDLK_F5, F6: SDLK_F6, F7: SDLK_F7, F8: SDLK_F8,
  F9: SDLK_F9, F10: SDLK_F10, WheelUp: PSEUDOKEY_WHEELUP, WheelDown: PSEUDOKEY_WHEELDOWN,
};
function key_of(k: string): number {
  if (k.length === 1) return k.charCodeAt(0);
  if (k.length === 2 && k[0] === '^') return k.charCodeAt(1) - 64;
  if (k in key_names) return key_names[k];
  return parseInt(k, 10) | 0; // atoi
}

/** harness.cpp harness_init_font(): initgraph's init_font (TTF_Init, set_cfont), which -nogui skips; once */
let font_ready = false;
function harness_init_font(): void {
  if (font_ready) return;
  init_font();
  font_ready = true;
}

function lookup(ids: readonly string[], s: string): number {
  const i = ids.indexOf(s);
  if (i >= 0) return i;
  if (/^\d+$/.test(s) && +s < ids.length) return +s;
  throw new Error(`unknown name: ${s}`);
}

const hex = (v: number, w: number): string => (v >>> 0).toString(16).padStart(w, '0');

function fnvBytes(h: number, bytes: Iterable<number>): number {
  for (const b of bytes) { h ^= b; h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

/** fnv(h, (long long) v): the 8 bytes of v, little endian, two's complement */
function fnv(h: number, v: number): number {
  const lo = v | 0;
  const bytes = [lo & 0xFF, (lo >>> 8) & 0xFF, (lo >>> 16) & 0xFF, (lo >>> 24) & 0xFF];
  const sign = v < 0 ? 0xFF : 0;
  bytes.push(sign, sign, sign, sign);
  return fnvBytes(h, bytes);
}

const utf8 = new TextEncoder();
const hashString = (s: string): number => fnvBytes(2166136261, utf8.encode(s));

function quote(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
}

/** harness.cpp: time() is fixed (2026-01-01 00:00:00 UTC, not a festive date) */
export const HARNESS_TIME = 1767225600;
c_clock.now = (): number => HARNESS_TIME;
/** harness.cpp: TZ=UTC (the dates in the score file) */
process.env.TZ = 'UTC';

export function runScenario(text: string): string {
  register_all(); // the static initializers of the original run before main
  const out: string[] = [];
  const P = (s: string): void => { out.push(s); };
  let ini_text = '';
  let radius = 3;
  let log_seen = 0;
  let log_last_quantity = 0;
  let started = false;

  function dump_messages(): void {
    const gamelog = G.gamelog;
    if (log_seen > gamelog.length) log_seen = gamelog.length;
    if (log_seen > 0 && log_seen <= gamelog.length && gamelog[log_seen - 1].quantity !== log_last_quantity)
      P(`msg+ ${gamelog[log_seen - 1].quantity} ${quote(gamelog[log_seen - 1].msg)}\n`);
    for (let i = log_seen; i < gamelog.length; i++) P(`msg ${gamelog[i].quantity} ${quote(gamelog[i].msg)}\n`);
    log_seen = gamelog.length;
    log_last_quantity = log_seen ? gamelog[log_seen - 1].quantity : 0;
  }

  function cell_fields(c: cell, h: { v: number }, print: boolean): void {
    const f = [c.land, c.wall, c.monst, c.item, c.mondir, c.hitpoints, c.stuntime, c.landparam, c.landflags,
      c.wparam, c.mpdist, c.bardir, c.barleft, c.barright, c.ligon, c.monmirror, c.type];
    for (const v of f) h.v = fnv(h.v, v);
    if (print)
      P(` ${land_ids[c.land]} ${wall_ids[c.wall]} ${monster_ids[c.monst]} ${item_ids[c.item]} d${c.mondir} h${c.hitpoints} s${c.stuntime} p${hex(c.landparam, 8)} f${c.landflags} w${c.wparam} m${c.mpdist} b${c.bardir} ${land_ids[c.barleft]} ${land_ids[c.barright]}${c.ligon ? ' ligon' : ''}${c.monmirror ? ' monmirror' : ''}\n`);
  }

  /** harness.cpp dump_pos: the heptagon path from the origin, which cell of that heptagon, the spin */
  function dump_pos(cw: cellwalker): string {
    const path: number[] = [];
    let h = cw.at.master;
    while (h.distance > 0 && h.move(0)) { path.push(h.c.spin(0)); h = h.move(0); }
    let s = ` d${cw.at.master.distance}`;
    for (let i = path.length - 1; i >= 0; i--) s += ` ${path[i]}`;
    let k = -1;
    const c7 = cw.at.master.c7;
    if (c7 !== cw.at) for (let i = 0; i < c7.type; i++) if (c7.move(i) === cw.at) { k = i; break; }
    return `${s} / ${k} spin ${cw.spin}${cw.mirrored ? ' mirrored' : ''}`;
  }

  function dump(what: string, ret = -1, header = true): void {
    if (header) P(`== ${what}\n`);
    if (ret >= 0) P(`ret ${ret}\n`);
    dump_messages();
    P(`turn ${G.turncount} canmove ${G.canmove ? 1 : 0} cheater ${G.cheater}\n`);
    P(`pos${dump_pos(G.cwt)}\n`);
    // local multiplayer (turn-based, multi::players > 1): each player's position (or "none"), statistics and
    // decided move, the revival queue
    if (G.multi_players > 1) {
      for (let i = 0; i < G.multi_players; i++) {
        const pl = G.multi_player[i];
        P(`player ${i}${pl.at ? dump_pos(pl) : ' none'} t${G.multi_treasures[i]} k${G.multi_kills[i]} d${G.multi_deaths[i]} pk${G.multi_pkills[i]} s${G.multi_suicides[i]} w${G.multi_whereto[i].d}\n`);
      }
      P(`revive${G.multi_revive_queue.map((i) => ' ' + i).join('')}\n`);
    }
    let s = 'items';
    for (let i = 0; i < ittypes; i++) if (G.items[i]) s += ` ${item_ids[i]}=${G.items[i]}`;
    s += '\nkills';
    for (let i = 0; i < motypes; i++) if (G.kills[i]) s += ` ${monster_ids[i]}=${G.kills[i]}`;
    P(s + '\n');
    const idx = new Map<cell, number>();
    const dcal = G.dcal;
    for (let i = 0; i < dcal.length; i++) idx.set(dcal[i], i);
    const h = { v: 2166136261 };
    for (let i = 0; i < dcal.length; i++) {
      const c = dcal[i];
      const print = c.cpdist <= radius;
      if (print) {
        let par = -1, pd = -1;
        for (let d = 0; d < c.type; d++) {
          const c2 = c.move(d);
          if (c2 && idx.has(c2) && c2.cpdist < c.cpdist) { par = idx.get(c2)!; pd = d; break; }
        }
        P(`c${i} ${c.cpdist} ${par}.${pd}`);
      }
      cell_fields(c, h, print);
    }
    P(`dcal ${dcal.length} hash ${hex(h.v, 8)}\n`);
  }

  try {
    commands(text);
  } catch (e) {
    // a scenario that reaches unported code: the output so far goes with the error (oracle.test.ts compares it
    // with the start of the golden)
    if (e instanceof NotPorted) (e as NotPorted & { partial?: string }).partial = out.join('');
    throw e;
  }
  return out.join('');

  function commands(text: string): void {
  for (const line of text.split('\n')) {
    if (line === '' || line[0] === '#') continue;
    const words = line.trim().split(/\s+/);
    const cmd = words[0];
    if (cmd === 'start') {
      if (started) throw new Error('start twice');
      const seed = parseInt(words[1], 10);
      const args = ['hyperrogue', '-nogui', '-fixx', String(seed)];
      for (let a of words.slice(2)) {
        if (/^la[A-Z]/.test(a)) a = String(lookup(land_ids, a));
        args.push(a);
      }
      hyper_init(args);
      started = true;
      dump(line);
    }
    else if (cmd === 'radius') radius = parseInt(words[1], 10);
    else if (cmd === 'move') {
      const b = movepcto(parseInt(words[1], 10), 1);
      dump(line, b ? 1 : 0);
    }
    else if (cmd === 'wait') {
      const b = movepcto(MD_WAIT, 1);
      dump(line, b ? 1 : 0);
    }
    else if (cmd === 'cheat') {
      const k = words[1];
      const key = k.length === 2 && k[0] === '^' ? k.charCodeAt(1) - 64 : k.charCodeAt(0);
      const b = applyCheat(key);
      dump(line, b ? 1 : 0);
    }
    else if (cmd === 'goto') {
      cheatMoveTo(lookup(land_ids, words[1]));
      dump(line);
    }
    else if (cmd === 'drop') {
      const b = movepcto(MD_DROP, 1);
      dump(line, b ? 1 : 0);
    }
    else if (cmd === 'orb') {
      const i = parseInt(words[1], 10);
      const it = targetRangedOrb(i >= 0 && i < G.dcal.length ? G.dcal[i] : G.cwt.at, roKeyboard);
      dump(line, it);
    }
    else if (cmd === 'pmove') {
      // pmove <p> <d> [<subdir>] | wait | drop | orb <i> (harness.cpp): multi::whereto[p], accepted; no dump
      const p = parseInt(words[1], 10), w = words[2];
      if (!(p >= 0 && p < MAXPLAYER)) throw new Error('pmove: player');
      const md = G.multi_whereto[p];
      md.subdir = 1;
      if (w === 'wait') md.d = MD_WAIT;
      else if (w === 'drop') md.d = MD_DROP;
      else if (w === 'orb') {
        const i = words.length > 3 ? parseInt(words[3], 10) : -1;
        md.d = MD_USE_ORB; md.tgt = i >= 0 && i < G.dcal.length ? G.dcal[i] : G.multi_player[p].at;
      }
      else { md.d = parseInt(w, 10) | 0; if (words.length > 3) md.subdir = parseInt(words[3], 10); }
      G.multi_accepted[p] = true;
    }
    else if (cmd === 'round') {
      // round (harness.cpp): what multi::handleMulti does when all players have decided (multi_alldecided)
      flashMessages();
      const played = multi_alldecided();
      dump(line, played ? 1 : 0);
    }
    else if (cmd === 'leave') {
      // leave <p>: the "leave the game" key of player p (multi::handleMulti)
      const p = parseInt(words[1], 10);
      if (multi_activePlayers() > 1) {
        addMessage(XLAT('Left the game.'));
        multi_leaveGame(p);
      }
      dump(line);
    }
    else if (cmd === 'plook') {
      const p = parseInt(words[1], 10);
      P(`== ${line}\n`);
      const cw = G.multi_player[p];
      if (cw.at) for (let d = 0; d < cw.at.type; d++) {
        const c = cw.plus(d).peek();
        if (c) P(`look ${d} ${land_ids[c.land]} ${wall_ids[c.wall]} ${monster_ids[c.monst]} ${item_ids[c.item]}\n`);
        else P(`look ${d} -\n`);
      }
      P('look end\n');
    }
    else if (cmd === 'look') {
      P(`== ${line}\n`);
      for (let d = 0; d < G.cwt.at.type; d++) {
        const c = G.cwt.plus(d).peek();
        if (c) P(`look ${d} ${land_ids[c.land]} ${wall_ids[c.wall]} ${monster_ids[c.monst]} ${item_ids[c.item]}\n`);
        else P(`look ${d} -\n`);
      }
      P('look end\n');
    }
    else if (cmd === 'restart') {
      stop_game_and_switch_mode(words.length > 1 ? words[1].charCodeAt(0) : rg_nothing);
      start_game();
      dump(line);
    }
    else if (cmd === 'saveload') {
      // the score file lives in cfs.files (the oracle: a private temporary directory)
      G.scorefile = 'harness.log';
      G.save_cheats = true;
      stop_game();
      G.autocheat = false;
      loadsave();
      G.autocheat = true;
      const b = G.loaded_from_save;
      start_game();
      if (b) G.loaded_from_save = b;
      restore_all_golems();
      G.save_cheats = false;
      dump(line);
      const f = cfs.files.get(G.scorefile);
      if (f !== undefined) {
        const text = Buffer.from(f, 'latin1').toString('utf8');
        const lines = text.split('\n');
        if (lines[lines.length - 1] === '') lines.pop();
        for (const l of lines) P(`file ${l}\n`);
      }
    }
    else if (cmd === 'ini') {
      // ini <line>: a line of a configuration file, kept until loadconfig (harness.cpp)
      ini_text += line.replace(/^ini ?/, '') + '\n';
    }
    else if (cmd === 'loadconfig') {
      // loadconfig: the ini lines read as hyperrogue.ini in the new format (config.cpp loadNewConfig)
      loadNewConfig(ini_text);
      ini_text = '';
    }
    else if (cmd === 'saveconfig') {
      // saveconfig: saveConfig() into cfs.files, then the file as ini lines
      conffile_ref.v = 'harness.ini';
      saveConfig();
      P(`== ${line}\n`);
      const f = cfs.files.get(conffile_ref.v) ?? '';
      const lines = f.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();
      for (const l of lines) P(`ini ${l}\n`);
    }
    else if (cmd === 'item') {
      G.items[lookup(item_ids, words[1])] = parseInt(words[2], 10);
    }
    else if (cmd === 'dump') dump(line);
    else if (cmd === 'online') {
      // online <0|1> (port only, not in harness.cpp: oracle scenarios never use it): G.online_isolated, the online
      // lockstep mode in which drawing changes no game state (ONLINE.md); for re/hyperrogue/tools/determinism.py
      G.online_isolated = words[1] === '1';
    }
    else if (cmd === 'rngstate') {
      // rngstate (harness.cpp): the next 4 numbers of a copy of hrngen, and one glibc rand() (drawn)
      const r = hrngen.clone();
      const a = r.next(), b = r.next(), c = r.next(), d = r.next();
      P(`== ${line}\nrngstate mt ${a} ${b} ${c} ${d} rand ${rand()}\n`);
    }
    else if (cmd === 'lang') {
      // lang <n>: vid.language = n, as the language menu (the data: run-scenario.ts loads every language first)
      G.vid.language = parseInt(words[1], 10);
    }
    else if (cmd === 'xlat' || cmd === 'xlatn' || cmd === 'xlat1zh') {
      // xlat <text>[<TAB><p1>...]: XLAT(text, p1, ...) (\n = newline); xlatn <name>: XLAT1, XLATN; xlat1zh <name>:
      // XLAT1_acc(name, 8)
      let t = line.slice(line.indexOf(cmd) + cmd.length);
      if (t[0] === ' ') t = t.slice(1);
      if (cmd === 'xlatn') P(`xlatn ${quote(XLAT1(t))} | ${quote(XLATN(t))}\n`);
      else if (cmd === 'xlat1zh') { const p = XLAT1_acc(t, 8); P(`xlat1zh ${p !== null ? quote(p) : '(null)'}\n`); }
      else {
        const parts = t.split('\t').map((p) => p.split('\\n').join('\n'));
        P(`xlat ${quote(XLAT(parts[0], ...parts.slice(1, 6)))}\n`);
      }
    }
    else if (cmd === 'ticks') G.ticks = parseInt(words[1], 10);
    else if (cmd === 'svg') {
      // svg <w> <h> map|screen (harness.cpp svg_command): the view through the SVG renderer (src/screenshot.ts),
      // then the dump without its == line (drawing may create cells).
      const w = parseInt(words[1], 10), h = parseInt(words[2], 10), what = words[3];
      P(`== ${line}\n`);
      if (what === 'map') {
        const d1 = G.shot_shotx, d2 = G.shot_shoty, d3 = G.shot_shotformat, d4 = G.shot_format, d5 = G.hide_hud;
        G.shot_shotx = w; G.shot_shoty = h; G.shot_shotformat = -1; G.shot_format = shot_svg; G.hide_hud = true;
        try {
          try { P(shot_take()); }
          finally { G.shot_shotx = d1; G.shot_shoty = d2; G.shot_shotformat = d3; G.shot_format = d4; G.hide_hud = d5; }
        } catch (e) {
          // the SVG so far goes with a NotPorted (the drawing is ported package by package)
          if (e instanceof NotPorted) P(svg_f.s.join(''));
          throw e;
        }
      }
      else if (what === 'screen') {
        // harness_init_font(); the window surface is the canvas shim's (none headless)
        harness_init_font();
        G.vid.xres = w; G.vid.yres = h;
        compute_fsize();
        const d1 = G.svg_divby, d2 = G.shot_transparent;
        G.svg_divby = 1; G.shot_transparent = false;
        // the interface text: SDL_BlitSurface of TTF_RenderUTF8_* onto the window (src/sdlttf.ts), recorded as the
        // harness records it, printed after the SVG
        const text_records: text_record[] = [];
        ttf_record.on = (t) => { text_records.push(t); };
        try {
          try { P(svg_render(drawscreen)); }
          finally { G.svg_divby = d1; G.shot_transparent = d2; ttf_record.on = null; }
        } catch (e) {
          if (e instanceof NotPorted) P(svg_f.s.join(''));
          throw e;
        }
        for (const t of text_records)
          P(`text ${t.x} ${t.y} ${t.w} ${t.h} ${t.size} ${hex(t.col, 6)} ${quote(t.str)}\n`);
      }
      else throw new Error('svg: map or screen');
      dump(line, -1, false);
    }
    else if (cmd === 'key') {
      // key <k> [<u>] (harness.cpp key_command): the window is drawn once as `svg ... screen` draws it (drawscreen
      // sets keyhandler; the SVG is thrown away), at the size of the last `svg ... screen`, then handlekey(sym, uni)
      const sym = key_of(words[1]);
      const uni = words.length > 2 ? key_of(words[2]) : sym;
      harness_init_font();
      const d1 = G.svg_divby, d2 = G.shot_transparent;
      G.svg_divby = 1; G.shot_transparent = false;
      try { svg_render(drawscreen); }
      finally { G.svg_divby = d1; G.shot_transparent = d2; }
      handlekey(sym, uni);
      dump(line);
    }
    else if (cmd === 'shapes') {
      // shapes [<from> <to>] (harness.cpp): cgi.require_shapes(), then the size of hpc and of ourshape (the float
      // vertices every shape is drawn from) with an FNV-1a hash of ourshape's float bits; with a range, those
      // vertices (%.9g: exact for floats). NaN coordinates are hashed as 0x7FC00000, printed as "nan" and counted
      // (their sign is not observable in JavaScript; scenarios-format.md)
      const a = words.length > 1 ? parseInt(words[1], 10) : -1, b = words.length > 2 ? parseInt(words[2], 10) : -1;
      P(`== ${line}\n`);
      const gi = cgi();
      gi.require_shapes();
      const bits = new Uint8Array(4);
      const bv = new DataView(bits.buffer);
      let hh = 2166136261, nans = 0;
      for (const v of gi.ourshape) for (let k = 0; k < 4; k++) {
        if (Number.isNaN(v[k])) { bv.setUint32(0, 0x7FC00000, true); nans++; }
        else bv.setFloat32(0, v[k], true);
        hh = fnvBytes(hh, bits);
      }
      P(`shapes hpc ${gi.hpc.length} ourshape ${gi.ourshape.length} hash ${hex(hh, 8)} nan ${nans}\n`);
      for (let i = Math.max(a, 0); i < Math.min(b, gi.ourshape.length); i++) {
        let s = `v ${i}`;
        for (let k = 0; k < 4; k++) s += ` ${Number.isNaN(gi.ourshape[i][k]) ? 'nan' : fmtG(gi.ourshape[i][k], 9)}`;
        P(s + '\n');
      }
    }
    else if (cmd === 'textwidth') {
      // textwidth <size> <text>: basegraph.cpp textwidth with the game's font (TTF_SizeUTF8: src/sdlttf.ts)
      const m = /^\S+\s+(\S+) ?(.*)$/.exec(line)!;
      const size = parseInt(m[1], 10), t = m[2];
      harness_init_font();
      P(`textwidth ${size} ${textwidth(size, t)} ${quote(t)}\n`);
    }
    else if (cmd === 'map') {
      const r = parseInt(words[1], 10);
      P(`== ${line}\n`);
      if (!G.currentmap) initcells();
      const o: cell = G.currentmap.gamestart();
      const cl = new celllister(o, r, 1000000, null);
      for (let i = 0; i < cl.lst.length; i++) {
        const c = cl.lst[i];
        const h = c.master;
        let s = `c${i} t${c.type} d${cl.dists[i]}`;
        for (let k = 0; k < c.type; k++) {
          const c2 = c.move(k);
          if (c2 && cl.listed(c2)) s += ` ${c2.listindex}.${c.c.spin(k)}`;
          else s += ` ${c2 ? '?' : '-'}`;
        }
        s += ` | ${c === h.c7 ? 'c7' : 'hex'} h${h.distance} s${h.s} dm${h.dm4} e${h.emeraldval} f${h.fiftyval} z${h.zebraval} fv${h.fieldval} r${h.rval0},${h.rval1}`;
        s += ` | cd${celldist(c)} ctof${ctof(c)} ishept${ishept(c) ? 1 : 0} ph${pseudohept(c) ? 1 : 0} em${emeraldval(c)} pa${polara50(c) ? 1 : 0} pb${polarb50(c) ? 1 : 0} f49_${fiftyval049(c)} f200_${fiftyval200(c)} z40_${zebra40(c)} z3_${zebra3(c)} fu${fieldpattern_fieldval_uniq(c)}\n`;
        P(s);
      }
      cl.destroy();
    }
    else if (cmd === 'content') {
      P(`== ${line}\n`);
      content_tables(P);
      for (let l = 0; l < landtypes; l++) {
        let s = `native ${land_ids[l]}`;
        for (let m = 0; m < motypes; m++) if (isNative(l, m)) s += ` ${m}:${isNative(l, m)}`;
        P(s + '\n');
      }
    }
    else if (cmd === 'sort') {
      const seed = parseInt(words[1], 10), n = parseInt(words[2], 10), k = parseInt(words[3], 10);
      P(`== ${line}\n`);
      shrand(seed);
      const v: [number, number][] = [];
      for (let i = 0; i < n; i++) v.push([hrand(k), i]);
      std_sort(v, (a, b) => a[0] < b[0]);
      P('sorted' + v.map((p) => ' ' + p[1]).join('') + '\n');
    }
    else if (cmd === 'rng') {
      const seed = parseInt(words[1], 10), n = parseInt(words[2], 10);
      P(`== ${line}\n`);
      const list = (name: string, f: (i: number) => string): void => {
        let s = name;
        for (let i = 0; i < n; i++) s += ' ' + f(i);
        P(s + '\n');
      };
      shrand(seed);
      list('mt', () => String(hrngen.next()));
      shrand(seed);
      list('hrand', (i) => String(hrand(1 + (i * 7919) % 1000)));
      list('hrandpos', () => String(hrandpos()));
      list('hrandf', () => fmtG17(hrandf()));
      list('chance', (i) => (chance(i / n) ? '1' : '0'));
      P(`hrandstate ${hrandstate()}\n`);
      P('perm' + hrandom_permutation(n).map((v) => ' ' + v).join('') + '\n');
      srand(seed);
      list('rand', () => String(rand()));
    }
    else throw new Error(`unknown command: ${line}`);
  }
  }
}

/** the m/i/w/l lines of the `content` command (src/content.ts alone) */
export function content_tables(P: (s: string) => void): void {
  const fl = (f: bigint): string => f.toString(16).padStart(16, '0');
  for (let i = 0; i < motypes; i++) {
    const m = minf[i];
    P(`m ${i} ${monster_ids[i]} ${m.glyph} ${hex(m.color, 6)} ${fl(m.flags)} ${m.mgroup} ${m.name} ${hex(hashString(m.help), 8)}\n`);
  }
  for (let i = 0; i < ittypes; i++) {
    const m = iinf[i];
    P(`i ${i} ${item_ids[i]} ${m.glyph} ${hex(m.color, 6)} ${m.itemclass} ${fl(m.flags)} ${m.orbshape} ${m.name} ${hex(hashString(m.help), 8)}\n`);
  }
  for (let i = 0; i < walltypes; i++) {
    const m = winf[i];
    P(`w ${i} ${wall_ids[i]} ${m.glyph} ${hex(m.color, 6)} ${fl(m.flags)} ${m.snakelevel} ${m.sg} ${m.name} ${hex(hashString(m.help), 8)}\n`);
  }
  for (let i = 0; i < landtypes; i++) {
    const m = linf[i];
    P(`l ${i} ${land_ids[i]} ${hex(m.color, 6)} ${fl(m.flags)} ${m.treasure} ${m.name} ${hex(hashString(m.help), 8)}\n`);
  }
}
