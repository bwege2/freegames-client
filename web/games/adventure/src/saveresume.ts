// saveresume.c of Open Adventure 1.22: saving and resuming.
// SPDX-FileCopyrightText: (C) 1977, 2005 by Will Crowther and Don Woods
// SPDX-License-Identifier: BSD-2-Clause
//
// (ESR) This replaces  a bunch of particularly nasty FORTRAN-derived code;
// see the history.adoc file in the source distribution for discussion.
//
// The save file is the original's: struct save_t as fwrite() writes it on x86-64 Linux (gcc), little
// endian, every member an int32_t except the magic and zzword. Files written by the original resume
// here and the other way round (re/adventure/NOTES.md, "Save files").
import {
  BAD_SAVE, LOC_START, NDWARVES, NHINTS, NLOCATIONS, NOBJECTS, NO_OBJECT, LOC_NOWHERE, NDEATHS, OK_MAN,
  RESUME_ABANDON, RESUME_HELP, SAVE_TAMPERING, SUSPEND_WARNING, THIS_ACCEPTABLE, VERSION_SKEW,
  arbitrary_messages, objects,
} from './dungeon.ts';
import {
  ADVENT_MAGIC, EXIT_SUCCESS, GO_CLEAROBJ, GO_TOP, LCG_M, MOD, OBJECT_IS_NOTFOUND2, PROP_IS_INVALID,
  SAVE_VERSION, copy_game, exit, game, host, isspace, new_game, out, type game_t, type phase_codes_t,
} from './advent.ts';
import { rspeak, yes_or_no } from './misc.ts';
import { myreadline } from './main.ts';

/*
 * Use this to detect endianness mismatch.  Can't be unchanged by byte-swapping.
 */
const ENDIAN_MAGIC = 2317;

/** game_t's int32_t members, in the order of the struct */
const FIELDS = [
  'lcg_x', 'abbnum', 'bonus', 'chloc', 'chloc2', 'clock1', 'clock2', 'clshnt', 'closed', 'closng', 'lmwarn',
  'novice', 'panic', 'wzdark', 'blooded', 'conds', 'detail', 'dflag', 'dkill', 'dtotal', 'foobar', 'holdng',
  'igo', 'iwest', 'knfloc', 'limit', 'loc', 'newloc', 'numdie', 'oldloc', 'oldlc2', 'oldobj', 'saved', 'tally',
  'thresh', 'seenbigwords', 'trnluz', 'turns',
] as const satisfies readonly (keyof game_t)[];

/** sizeof(struct game_t): the int32s, zzword[6] and 2 bytes of padding, then the arrays */
export const GAME_SIZE = FIELDS.length * 4 + 8 + NLOCATIONS * 8 + (NDWARVES + 1) * 12 + NOBJECTS * 12 + NHINTS * 8 + NOBJECTS * 2 * 4;
/** sizeof(struct save_t): magic[sizeof(ADVENT_MAGIC)], version, canary, game */
export const SAVE_SIZE = 16 + 4 + 4 + GAME_SIZE;

/** struct save_t save, as its bytes */
const save = new Uint8Array(SAVE_SIZE);
const sv = new DataView(save.buffer);

export function reset_save(): void {
  save.fill(0);
}

/** struct game_t from its bytes at `off` */
function get_game(v: DataView, off: number): game_t {
  const g = new_game();
  let p = off;
  const int = () => { const x = v.getInt32(p, true); p += 4; return x; };
  for (const f of FIELDS) g[f] = int();
  for (let i = 0; i < 8; i++) g.zzword[i] = v.getUint8(p++);
  for (const l of g.locs) { l.abbrev = int(); l.atloc = int(); }
  for (const d of g.dwarves) { d.seen = int(); d.loc = int(); d.oldloc = int(); }
  for (const o of g.objects) { o.fixed = int(); o.prop = int(); o.place = int(); }
  for (const h of g.hints) { h.used = int(); h.lc = int(); }
  for (let i = 0; i < g.link.length; i++) g.link[i] = int();
  return g;
}

/** struct game_t into its bytes at `off` */
function set_game(v: DataView, off: number, g: game_t): void {
  let p = off;
  const int = (x: number) => { v.setInt32(p, x, true); p += 4; };
  for (const f of FIELDS) int(g[f]);
  for (let i = 0; i < 8; i++) v.setUint8(p++, g.zzword[i]);
  for (const l of g.locs) { int(l.abbrev); int(l.atloc); }
  for (const d of g.dwarves) { int(d.seen); int(d.loc); int(d.oldloc); }
  for (const o of g.objects) { int(o.fixed); int(o.prop); int(o.place); }
  for (const h of g.hints) { int(h.used); int(h.lc); }
  for (let i = 0; i < g.link.length; i++) int(g.link[i]);
}

/** savefile(fp): the bytes it writes to fp (fwrite(&save, sizeof(struct save_t), 1, fp)). */
export function savefile(): Uint8Array {
  /* Save game to file. No input or output from user. */
  for (let i = 0; i < 16; i++) save[i] = i < ADVENT_MAGIC.length ? ADVENT_MAGIC.charCodeAt(i) : 0; // memcpy(&save.magic, ADVENT_MAGIC, sizeof(ADVENT_MAGIC))
  if (sv.getInt32(16, true) === 0) {
    sv.setInt32(16, SAVE_VERSION, true);
  }
  if (sv.getInt32(20, true) === 0) {
    sv.setInt32(20, ENDIAN_MAGIC, true);
  }
  set_game(sv, 24, game); // save.game = game
  return save.slice();
}

/** Set the version a save file is written with (cheat -v; the test tool). */
export function set_save_version(v: number): void {
  sv.setInt32(16, v, true);
}

/* Suspend and resume */

function strip(name: string): string {
  // Trim leading whitespace
  let a = 0;
  while (isspace(name[a])) {
    a++; // LCOV_EXCL_LINE
  }
  if (a < name.length) {
    // Trim trailing whitespace;
    // might be left there by autocomplete
    let end = name.length - 1;
    while (end > a && isspace(name[end])) {
      end--;
    }
    // Write new null terminator character
    return name.slice(a, end + 1);
  }

  return name.slice(a);
}

export async function suspend(): Promise<phase_codes_t> {
  /*  Suspend.  Offer to save things in a file, but charging
   *  some points (so can't win by using saved games to retry
   *  battles or to start over after learning zzword).
   *  If ADVENT_NOSAVE is defined, gripe instead. */

  rspeak(SUSPEND_WARNING);
  if (!(await yes_or_no(arbitrary_messages[THIS_ACCEPTABLE], arbitrary_messages[OK_MAN], arbitrary_messages[OK_MAN]))) {
    return GO_CLEAROBJ;
  }
  game.saved = game.saved + 5;

  // C: fp = fopen(strip(name), WRITE_MODE) until it opens, then savefile(fp) and fclose(fp). Here the
  // file is written in one step (server storage has no open files): savefile() makes the bytes, and a
  // name that cannot be a file or a write that fails is the original's "Can't open file".
  let stored = false;
  while (!stored) {
    let name = await myreadline('\nFile name: ');
    if (name === null) {
      return GO_TOP;
    }
    name = strip(name);
    if (name.length === 0) {
      return GO_TOP; // LCOV_EXCL_LINE
    }
    stored = await host.write_file(strip(name), savefile());
    if (!stored) {
      out(`Can't open file ${name}, try again.\n`);
    }
  }

  rspeak(RESUME_HELP);
  exit(EXIT_SUCCESS);
}

export async function resume(): Promise<phase_codes_t> {
  /*  Resume.  Read a suspended game back from a file.
   *  If ADVENT_NOSAVE is defined, gripe instead. */

  let fp: Uint8Array | null = null;

  if (game.loc !== LOC_START || game.locs[LOC_START].abbrev !== 1) {
    rspeak(RESUME_ABANDON);
    if (!(await yes_or_no(arbitrary_messages[THIS_ACCEPTABLE], arbitrary_messages[OK_MAN], arbitrary_messages[OK_MAN]))) {
      return GO_CLEAROBJ;
    }
  }

  while (fp === null) {
    let name = await myreadline('\nFile name: ');
    if (name === null) {
      return GO_TOP;
    }
    name = strip(name);
    if (name.length === 0) {
      return GO_TOP; // LCOV_EXCL_LINE
    }
    fp = await host.read_file(name); // fopen(name, READ_MODE)
    if (fp === null) {
      out(`Can't open file ${name}, try again.\n`);
    }
  }

  return restore(fp);
}

/** restore(fp): fp is the file's bytes. */
export function restore(fp: Uint8Array): phase_codes_t {
  /*  Read and restore game state from file, assuming
   *  sane initial state.
   *  If ADVENT_NOSAVE is defined, gripe instead. */

  save.set(fp.subarray(0, SAVE_SIZE)); // fread(&save, sizeof(struct save_t), 1, fp): a short file fills only its part
  const version = sv.getInt32(16, true), canary = sv.getInt32(20, true);
  let magic_ok = true;
  for (let i = 0; i < 16; i++) if (save[i] !== (i < ADVENT_MAGIC.length ? ADVENT_MAGIC.charCodeAt(i) : 0)) magic_ok = false;
  if (!magic_ok || canary !== ENDIAN_MAGIC) {
    rspeak(BAD_SAVE);
  } else if (version !== SAVE_VERSION) {
    rspeak(VERSION_SKEW, Math.trunc(version / 10), MOD(version, 10), Math.trunc(SAVE_VERSION / 10), MOD(SAVE_VERSION, 10));
  } else {
    const saved_game = get_game(sv, 24);
    if (!is_valid(saved_game)) {
      rspeak(SAVE_TAMPERING);
      exit(EXIT_SUCCESS);
    } else {
      copy_game(game, saved_game); // game = save.game
    }
  }
  return GO_TOP;
}

export function is_valid(valgame: game_t): boolean {
  /*  Save files can be roughly grouped into three groups:
   *  With valid, reachable state, with valid, but unreachable
   *  state and with invalid state. We check that state is
   *  valid: no states are outside minimal or maximal value
   */

  /* Prevent division by zero */
  if (valgame.abbnum === 0) {
    return false; // LCOV_EXCL_LINE
  }

  /* Check for RNG overflow. Truncate */
  if (valgame.lcg_x >= LCG_M) {
    return false;
  }

  /*  Bounds check for locations */
  if (valgame.chloc < -1 || valgame.chloc >= NLOCATIONS ||
      valgame.chloc2 < -1 || valgame.chloc2 >= NLOCATIONS ||
      valgame.loc < 0 || valgame.loc >= NLOCATIONS ||
      valgame.newloc < 0 || valgame.newloc >= NLOCATIONS ||
      valgame.oldloc < 0 || valgame.oldloc >= NLOCATIONS ||
      valgame.oldlc2 < 0 || valgame.oldlc2 >= NLOCATIONS) {
    return false; // LCOV_EXCL_LINE
  }
  /*  Bounds check for location arrays */
  for (let i = 0; i <= NDWARVES; i++) {
    if (valgame.dwarves[i].loc < -1 || valgame.dwarves[i].loc >= NLOCATIONS ||
        valgame.dwarves[i].oldloc < -1 || valgame.dwarves[i].oldloc >= NLOCATIONS) {
      return false; // LCOV_EXCL_LINE
    }
  }

  for (let i = 0; i < NOBJECTS; i++) {
    if (valgame.objects[i].place < -1 || valgame.objects[i].place >= NLOCATIONS ||
        valgame.objects[i].fixed < -1 || valgame.objects[i].fixed >= NLOCATIONS) {
      return false; // LCOV_EXCL_LINE
    }
  }

  /*  Bounds check for dwarves */
  if (valgame.dtotal < 0 || valgame.dtotal > NDWARVES || valgame.dkill < 0 || valgame.dkill > NDWARVES) {
    return false; // LCOV_EXCL_LINE
  }

  /*  Validate that we didn't die too many times in save */
  if (valgame.numdie >= NDEATHS) {
    return false; // LCOV_EXCL_LINE
  }

  /* Recalculate tally, throw the towel if in disagreement */
  let temp_tally = 0;
  for (let treasure = 1; treasure < NOBJECTS; treasure++) {
    if (objects[treasure].is_treasure) {
      if (OBJECT_IS_NOTFOUND2(valgame, treasure)) {
        ++temp_tally;
      }
    }
  }
  if (temp_tally !== valgame.tally) {
    return false; // LCOV_EXCL_LINE
  }

  /* Check that properties of objects aren't beyond expected */
  for (let obj = 0; obj < NOBJECTS; obj++) {
    if (PROP_IS_INVALID(valgame.objects[obj].prop)) {
      return false; // LCOV_EXCL_LINE
    }
  }

  /* Check that values in linked lists for objects in locations are inside
   * bounds */
  for (let loc = LOC_NOWHERE; loc < NLOCATIONS; loc++) {
    if (valgame.locs[loc].atloc < NO_OBJECT || valgame.locs[loc].atloc >= NOBJECTS * 2) {
      return false; // LCOV_EXCL_LINE
    }
  }
  for (let obj = 0; obj < NOBJECTS * 2; obj++) {
    if (valgame.link[obj] < NO_OBJECT || valgame.link[obj] >= NOBJECTS * 2) {
      return false; // LCOV_EXCL_LINE
    }
  }

  return true;
}
