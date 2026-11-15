// The port run headless on a session (test/sessions/*.txt), with the oracle's rules (re/liquidwar/oracle/
// oracle.c): the same virtual clock, the session's keys and mouse at the same times, and the same trace:
// screen and palette hashes (F), sounds (S, M, V), each battle's start (G) and every logic round (R), the
// exit (X). The config file the game leaves is returned too.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { load_datafile } from '../src/al/datafile.ts';
import { _handle_key_press, _handle_key_release, KEY_NAMES } from '../src/al/keyboard.ts';
import { mouse } from '../src/al/mouse.ts';
import { hex8, paletteHash, screenHash, screenRef } from '../src/al/screen.ts';
import { current_palette, RGB_SCALE_6 } from '../src/al/palette.ts';
import { soundHooks } from '../src/al/sound.ts';
import { GameExit, sys, type SysEvent } from '../src/al/sys.ts';
import { libc } from '../src/glibc.ts';
import { configFile, setConfigText } from '../src/lw/config.ts';
import type { GameFiles } from '../src/lw/disk.ts';
import { gameHooks } from '../src/lw/game.ts';
import { env } from '../src/lw/lang.ts';
import { lw_main } from '../src/lw/main.ts';
import { G, NB_TEAMS } from '../src/lw/state.ts';

const here = dirname(new URL(import.meta.url).pathname);
export const ASSETS = join(here, '..', 'assets');
export const SESSIONS = join(here, 'sessions');

export function gameFiles(): GameFiles {
  const custom = (kind: string): [string, Uint8Array][] => readdirSync(join(ASSETS, 'custom', kind)).sort()
    .map((f) => [f, new Uint8Array(readFileSync(join(ASSETS, 'custom', kind, f)))]);
  return {
    dat: load_datafile(new Uint8Array(readFileSync(join(ASSETS, 'lw.dat')))),
    map: custom('map'),
    texture: custom('texture'),
    music: custom('music'),
  };
}

export interface Session {
  events: SysEvent[];
  cfg: string;
  lang: string;
}

export function parseSession(text: string): Session {
  const events: SysEvent[] = [];
  let cfg = '';
  let lang = 'C';
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const w = line.split(/\s+/);
    const cmd = w[0]!;
    if (cmd === 'cfg') cfg += `${line.slice(4)}\n`;
    else if (cmd === 'lang') lang = w[1]!;
    else if (cmd === 'press' || cmd === 'tap') {
      const ms = Number(w[1]);
      const k = KEY_NAMES[w[2]!];
      if (!k) throw new Error(`unknown key ${w[2]}`);
      const ascii = w.length >= 4 ? Number(w[3]) : k[1];
      const dur = w.length >= 5 ? Number(w[4]) : 60;
      events.push({ t: ms * 1000, apply: () => _handle_key_press(ascii, k[0]) });
      if (cmd === 'tap') events.push({ t: (ms + dur) * 1000, apply: () => _handle_key_release(k[0]) });
    } else if (cmd === 'release') {
      const k = KEY_NAMES[w[2]!]!;
      events.push({ t: Number(w[1]) * 1000, apply: () => _handle_key_release(k[0]) });
    } else if (cmd === 'mouse') {
      const x = Number(w[2]), y = Number(w[3]), b = Number(w[4] ?? 0);
      events.push({
        t: Number(w[1]) * 1000,
        apply: () => {
          mouse.x = x;
          mouse.y = y;
          mouse.b = b;
        },
      });
    } else if (cmd === 'end') {
      events.push({ t: Number(w[1]) * 1000, apply: () => {
        throw new GameExit(0);
      } });
    }
  }
  // qsort by time, ties in file order (oracle.c cmp_event)
  events.forEach((e, i) => ((e as SysEvent & { i: number }).i = i));
  events.sort((a, b) => a.t - b.t || (a as SysEvent & { i: number }).i - (b as SysEvent & { i: number }).i);
  return { events, cfg, lang };
}

function fnvInts(h: number, ...v: number[]): number {
  for (const x of v) {
    for (let k = 0; k < 4; k++) {
      h ^= (x >>> (8 * k)) & 0xff;
      h = Math.imul(h, 16777619) >>> 0;
    }
  }
  return h;
}

export interface PortRun {
  trace: string[];
  config: string;
}

export interface RunOptions {
  /** called with the game state after every round, to change a rule (mutation tests) */
  mutate?: () => void;
}

export async function runPort(sessionText: string, opts: RunOptions = {}): Promise<PortRun> {
  const s = parseSession(sessionText);
  const trace: string[] = [];
  let lastS = -1, lastP = -1;
  sys.reset(false);
  sys.setEvents(s.events);
  screenRef.textMode = false;
  sys.onSample = () => {
    if (screenRef.textMode) return;
    const hs = screenHash(), hp = paletteHash();
    if (hs !== lastS || hp !== lastP) {
      trace.push(`F ${Math.floor(sys.vt / 1000)} ${hex8(hs)} ${hex8(hp)}`);
      if (process.env.PORT_SHOTS) writeShot(`${process.env.PORT_SHOTS}/${String(Math.floor(sys.vt / 1000)).padStart(8, '0')}.bmp`);
      lastS = hs;
      lastP = hp;
    }
  };
  soundHooks.trace = (l) => trace.push(l);
  soundHooks.midiIndex = (m) => G.MIDI_MUSIC.indexOf(m);
  gameHooks.afterInit = () => {
    trace.push(`G ${Math.floor(sys.vt / 1000)} ${G.CURRENT_AREA_W} ${G.CURRENT_AREA_H} ${G.CURRENT_MESH_SIZE} ${G.CURRENT_ARMY_SIZE} ${G.PLAYING_TEAMS}`);
  };
  gameHooks.afterMove = () => {
    opts.mutate?.();
    const a = G.CURRENT_ARMY!;
    let ha = 2166136261;
    for (let i = 0; i < G.CURRENT_ARMY_SIZE; ++i) ha = fnvInts(ha, a.x[i]!, a.y[i]!, a.health[i]!, a.team[i]!);
    const m = G.CURRENT_MESH!;
    let hm = 2166136261;
    for (let i = 0; i < G.CURRENT_MESH_SIZE * NB_TEAMS; ++i) hm = fnvInts(hm, m.grad[i]!, m.dir[i]!, m.update[i]!);
    let hc = 2166136261;
    for (let i = 0; i < NB_TEAMS; ++i) {
      const c = G.CURRENT_CURSOR[i]!;
      hc = fnvInts(hc, c.x, c.y, c.val, c.team, c.active, c.key_state, G.ACTIVE_FIGHTERS[i]!, c.loose_time);
    }
    trace.push(`R ${G.GLOBAL_CLOCK} ${hex8(ha)} ${hex8(hm)} ${hex8(hc)} ${libc.calls}`);
  };
  env.LANG = s.lang;
  setConfigText(s.cfg);
  libc.calls = 0;
  try {
    await lw_main({ files: gameFiles(), time: 1000000000 });
  } catch (e) {
    if (!(e instanceof GameExit)) throw e;
    trace.push(`X ${Math.floor(sys.vt / 1000)} ${e.code}`);
  }
  return { trace, config: configFile.toString() };
}

/** the screen as an 8-bit BMP with the current palette (for comparing with the oracle's ORACLE_SHOTS) */
export function writeShot(path: string): void {
  const s = screenRef.screen;
  const w = s.w, h = s.h;
  const row = (w + 3) & ~3;
  const size = 54 + 1024 + row * h;
  const b = Buffer.alloc(size);
  b.write('BM', 0);
  b.writeUInt32LE(size, 2);
  b.writeUInt32LE(54 + 1024, 10);
  b.writeUInt32LE(40, 14);
  b.writeInt32LE(w, 18);
  b.writeInt32LE(h, 22);
  b.writeUInt16LE(1, 26);
  b.writeUInt16LE(8, 28);
  b.writeUInt32LE(256, 46);
  for (let i = 0; i < 256; i++) {
    b[54 + i * 4] = RGB_SCALE_6[current_palette[i * 3 + 2]!]!;
    b[54 + i * 4 + 1] = RGB_SCALE_6[current_palette[i * 3 + 1]!]!;
    b[54 + i * 4 + 2] = RGB_SCALE_6[current_palette[i * 3]!]!;
  }
  for (let y = 0; y < h; y++) {
    const o = 54 + 1024 + (h - 1 - y) * row;
    for (let x = 0; x < w; x++) b[o + x] = s.data[s.base + y * s.stride + x]!;
  }
  writeFileSync(path, b);
}
