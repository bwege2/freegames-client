// Port of src/engine/trans.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// The table is struct-of-arrays with the field widths of entry_t (16 bytes per entry, as sizeof(entry_t)):
// lock uint32 (stored as int32), move uint16, depth sint8, date uint8, move_depth sint8, flags uint8,
// min_depth sint8, max_depth sint8, min_value sint16, max_value sint16.

import { MoveNone } from './move.ts';
import { option_get_int } from './option.ts';
import { send } from './protocol.ts';
import { ValueInf } from './value.ts';

// constants
const UseModulo = false;

const DateSize = 16;

const ClusterSize = 4; // TODO: unsigned?

const DepthNone = -128;

const EntrySize = 16; // sizeof(entry_t)

// types
export class trans_t { // HACK: typedef'ed in trans.h
  size = 0; // uint32
  mask = 0; // uint32
  date = 0;
  age = new Int32Array(DateSize);
  used = 0;
  read_nb = 0;
  read_hit = 0;
  write_nb = 0;
  write_hit = 0;
  write_collision = 0;
  // entry_t * table
  lock = new Int32Array(0);
  move = new Uint16Array(0);
  depth = new Int8Array(0);
  edate = new Uint8Array(0);
  move_depth = new Int8Array(0);
  flags = new Uint8Array(0);
  min_depth = new Int8Array(0);
  max_depth = new Int8Array(0);
  min_value = new Int16Array(0);
  max_value = new Int16Array(0);
}

// variables
export const Trans: trans_t = new trans_t();

/** what trans_retrieve() returns through its pointer arguments */
export const TransOut = { move: 0, min_depth: 0, max_depth: 0, min_value: 0, max_value: 0 };

// functions

// trans_is_ok()
export function trans_is_ok(trans: trans_t): boolean {
  if (trans.size === 0) return false;
  if (trans.mask === 0 || trans.mask >= trans.size) return false;
  if (trans.date >= DateSize) return false;
  for (let date = 0; date < DateSize; date++) {
    if (trans.age[date] !== trans_age(trans, date)) return false;
  }
  return true;
}

// trans_init()
export function trans_init(trans: trans_t): void {
  trans.size = 0;
  trans.mask = 0;
  table_alloc(trans, 0);
  trans_set_date(trans, 0);
  trans_clear(trans);
}

function table_alloc(trans: trans_t, size: number): void {
  trans.lock = new Int32Array(size);
  trans.move = new Uint16Array(size);
  trans.depth = new Int8Array(size);
  trans.edate = new Uint8Array(size);
  trans.move_depth = new Int8Array(size);
  trans.flags = new Uint8Array(size);
  trans.min_depth = new Int8Array(size);
  trans.max_depth = new Int8Array(size);
  trans.min_value = new Int16Array(size);
  trans.max_value = new Int16Array(size);
}

// trans_alloc()
export function trans_alloc(trans: trans_t): void {
  // calculate size (uint32 arithmetic)
  let target = option_get_int('Hash') >>> 0;
  if (target < 4) target = 16;
  target = (target * 1024 * 1024) % 4294967296;
  let size: number;
  for (size = 1; size !== 0 && size <= target; size = (size * 2) % 4294967296)
    ;
  size = Math.floor(size / 2);
  // allocate table
  size = Math.floor(size / EntrySize);
  trans.size = size + (ClusterSize - 1); // HACK to avoid testing for end of table
  trans.mask = (size - 1) >>> 0;
  table_alloc(trans, trans.size);
  trans_clear(trans);
}

// trans_free()
export function trans_free(trans: trans_t): void {
  table_alloc(trans, 0);
  trans.size = 0;
  trans.mask = 0;
}

// trans_clear()
export function trans_clear(trans: trans_t): void {
  trans_set_date(trans, 0);
  trans.lock.fill(0);
  trans.move.fill(MoveNone);
  trans.depth.fill(DepthNone);
  trans.edate.fill(trans.date);
  trans.move_depth.fill(DepthNone);
  trans.flags.fill(0);
  trans.min_depth.fill(DepthNone);
  trans.max_depth.fill(DepthNone);
  trans.min_value.fill(-ValueInf);
  trans.max_value.fill(+ValueInf);
}

// trans_inc_date()
export function trans_inc_date(trans: trans_t): void {
  trans_set_date(trans, (trans.date + 1) % DateSize);
}

// trans_set_date()
function trans_set_date(trans: trans_t, date: number): void {
  trans.date = date;
  for (date = 0; date < DateSize; date++) {
    trans.age[date] = trans_age(trans, date);
  }
  trans.used = 0;
  trans.read_nb = 0;
  trans.read_hit = 0;
  trans.write_nb = 0;
  trans.write_hit = 0;
  trans.write_collision = 0;
}

// trans_age()
function trans_age(trans: trans_t, date: number): number {
  let age = trans.date - date;
  if (age < 0) age += DateSize;
  return age;
}

// trans_store()
export function trans_store(trans: trans_t, key_hi: number, key_lo: number, move: number, depth: number, min_value: number, max_value: number): void {
  // init
  trans.write_nb++;
  // probe
  let best_entry = -1;
  let best_score = -32767;
  let entry = trans_entry(trans, key_lo);
  for (let i = 0; i < ClusterSize; i++, entry++) {
    if (trans.lock[entry] === key_hi) {
      // hash hit => update existing entry
      trans.write_hit++;
      if (trans.edate[entry] !== trans.date) trans.used++;
      trans.edate[entry] = trans.date;
      if (depth > trans.depth[entry]) trans.depth[entry] = depth; // for replacement scheme
      if (move !== MoveNone && depth >= trans.move_depth[entry]) {
        trans.move_depth[entry] = depth;
        trans.move[entry] = move;
      }
      if (min_value > -ValueInf && depth >= trans.min_depth[entry]) {
        trans.min_depth[entry] = depth;
        trans.min_value[entry] = min_value;
      }
      if (max_value < +ValueInf && depth >= trans.max_depth[entry]) {
        trans.max_depth[entry] = depth;
        trans.max_value[entry] = max_value;
      }
      return;
    }
    // evaluate replacement score
    const score = trans.age[trans.edate[entry]] * 256 - trans.depth[entry];
    if (score > best_score) {
      best_entry = entry;
      best_score = score;
    }
  }
  // "best" entry found
  entry = best_entry;
  if (trans.edate[entry] === trans.date) {
    trans.write_collision++;
  } else {
    trans.used++;
  }
  // store
  trans.lock[entry] = key_hi;
  trans.edate[entry] = trans.date;
  trans.depth[entry] = depth;
  trans.move_depth[entry] = (move !== MoveNone) ? depth : DepthNone;
  trans.move[entry] = move;
  trans.min_depth[entry] = (min_value > -ValueInf) ? depth : DepthNone;
  trans.max_depth[entry] = (max_value < +ValueInf) ? depth : DepthNone;
  trans.min_value[entry] = min_value;
  trans.max_value[entry] = max_value;
}

// trans_retrieve(): the values come back in TransOut
export function trans_retrieve(trans: trans_t, key_hi: number, key_lo: number): boolean {
  // init
  trans.read_nb++;
  // probe
  let entry = trans_entry(trans, key_lo);
  for (let i = 0; i < ClusterSize; i++, entry++) {
    if (trans.lock[entry] === key_hi) {
      // found
      trans.read_hit++;
      if (trans.edate[entry] !== trans.date) trans.edate[entry] = trans.date;
      TransOut.move = trans.move[entry];
      TransOut.min_depth = trans.min_depth[entry];
      TransOut.max_depth = trans.max_depth[entry];
      TransOut.min_value = trans.min_value[entry];
      TransOut.max_value = trans.max_value[entry];
      return true;
    }
  }
  // not found
  return false;
}

// trans_stats()
export function trans_stats(trans: trans_t): void {
  const full = trans.used / trans.size;
  send('info hashfull %.0f', full * 1000.0);
}

// trans_entry()
function trans_entry(trans: trans_t, key_lo: number): number {
  if (UseModulo) {
    return (key_lo >>> 0) % (trans.mask + 1);
  } else {
    return ((key_lo & trans.mask) >>> 0);
  }
}
