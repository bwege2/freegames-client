// locations.cpp of HyperRogue 13.1o: connection tables, walkers, the cell and heptagon structures, movei,
// celllister. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// A leaf module (PORTING.md, "Modules"): it imports only other leaves. The few functions of other files it calls
// (createMov, createStep, reverse_directions, whirlwind::jumpDestination, DUALMUL) are reached through `late`,
// which cell.ts / heptagon.ts / complex.ts / classes.ts fill in their register functions.
import type { eLand, eWall, eMonster, eItem } from './content.ts';
import { gmod, NotPorted } from './hyper.ts';
import { hrand } from './rand.ts';

export let cellcount = 0;
export let heptacount = 0;
/** cellcount/heptacount are changed by cell.ts (newCell, destroy_cell) and here */
export function add_cellcount(d: number): void { cellcount += d; }
export function add_heptacount(d: number): void { heptacount += d; }

/** the absolute limit on distance (horocycles; the heptagon distance is a short) */
export const global_distance_limit = 32000;
/** used in iterative algorithms to prevent infinite loops created by incorrect data; larger than
 *  global_distance_limit */
export const iteration_limit = 10000000;

export const NODIR = 126;
export const NOBARRIERS = 127;
export const NOBARRIERS2 = 125;
export const FULL_EDGE = 120;

/** late-bound functions of other modules (set by their register_* functions) */
export const late = {
  createMov: (_c: cell, _d: number): cell => { throw new NotPorted('createMov'); },
  createStep: (_h: heptagon, _d: number): heptagon => { throw new NotPorted('createStep'); },
  reverse_directions_cell: (_c: cell, _dir: number): number[] => { throw new NotPorted('reverse_directions'); },
  reverse_directions_hept: (_h: heptagon, _dir: number): number[] => { throw new NotPorted('reverse_directions'); },
  whirlwind_jumpDestination: (_c: cell): cell => { throw new NotPorted('whirlwind::jumpDestination'); },
  /** #define DUALMUL (DUAL ? 2 : 1) */
  DUALMUL: (): number => 1,
};

/** the order of pointers: C++ compares cell* / heptagon* by address (std::set<cell*>, std::map<cell*, ...>,
 *  tie(at, spin, mirrored) < ...). The port uses the creation serial instead; see PORTING.md, "Pointer order". */
let serial = 0;

// --- connection_table<T> ---

/** what connection_table and walker need of cell and heptagon */
export interface node<T extends node<T>> { type: number; c: connection_table<T>; move(d: number): T; cmove(d: number): T; }

export class connection_table<T extends node<T>> {
  /** T* move_table[degree] (null where not yet connected) */
  readonly move_table: (T | null)[];
  /** the spin table: spin in bits 0..6, mirror in bit 7 */
  readonly spintable: Uint8Array;
  private readonly owner: T;

  constructor(owner: T, degree: number) {
    this.owner = owner;
    this.move_table = new Array(degree).fill(null);
    this.spintable = new Uint8Array(degree);
  }

  /** the full T this table belongs to */
  full(): T { return this.owner; }
  /** for the edge d, set the `spin` and `mirror` attributes */
  setspin(d: number, spin: number, mirror: boolean): void {
    let c = spin & 0xFF;
    if (mirror) c |= 128;
    this.spintable[d] = c;
  }
  /** we are spin(i)-th neighbor of move[i] */
  spin(d: number): number { return this.spintable[d] & 127; }
  /** on non-orientable surfaces, the d-th edge may be mirrored */
  mirror(d: number): boolean { return (this.spintable[d] & 128) !== 0; }
  /** 'fix' the edge number d to get the actual index in [0, degree()) */
  fix(d: number): number { return gmod(d, this.owner.type); }
  /** T in the direction i (C++ returns T*&: assign with setMove) */
  move(i: number): T { return this.move_table[i] as T; }
  setMove(i: number, v: T | null): void { this.move_table[i] = v; }
  /** T in the direction i, modulo degree() */
  modmove(i: number): T { return this.move(this.fix(i)); }
  modspin(i: number): number { return this.spin(this.fix(i)); }
  fullclear(): void {
    for (let i = 0; i < this.owner.type; i++) this.move_table[i] = null;
  }
  /** connect this in direction d0 to c1 in direction d1, possibly mirrored */
  connect(d0: number, c1: T, d1: number, m: boolean): void {
    this.move_table[d0] = c1;
    c1.c.move_table[d1] = this.owner;
    this.setspin(d0, d1, m);
    c1.c.setspin(d1, d0, m);
  }
  /** connect(d0, walker) */
  connectw(d0: number, hs: walker<T>): void {
    this.connect(d0, hs.at, hs.spin, hs.mirrored);
  }
}

// --- gcell / cell ---

const f32 = new Float32Array(1);
const i32v = new Int32Array(f32.buffer);

/** struct fieldinfo inside the LHU union: fieldval (16 bits), rval, flowerdist, walldist, walldist2 (4 bits each) */
export class fieldinfo {
  private readonly u: LHU;
  constructor(u: LHU) { this.u = u; }
  get fieldval(): number { return this.u.landpar & 0xFFFF; }
  set fieldval(v: number) { this.u.landpar = (this.u.landpar & ~0xFFFF) | (v & 0xFFFF); }
  private get4(sh: number): number { return (this.u.landpar >>> sh) & 15; }
  private set4(sh: number, v: number): void { this.u.landpar = (this.u.landpar & ~(15 << sh)) | ((v & 15) << sh); }
  get rval(): number { return this.get4(16); }
  set rval(v: number) { this.set4(16, v); }
  get flowerdist(): number { return this.get4(20); }
  set flowerdist(v: number) { this.set4(20, v); }
  get walldist(): number { return this.get4(24); }
  set walldist(v: number) { this.set4(24, v); }
  get walldist2(): number { return this.get4(28); }
  set walldist2(v: number) { this.set4(28, v); }
}

/** union LHU { int32_t landpar; unsigned landpar_color; float heat; char bytes[4]; fieldinfo fi; } */
export class LHU {
  /** the 32 bits, as int32 */
  landpar = 0;
  readonly fi = new fieldinfo(this);
  get landpar_color(): number { return this.landpar >>> 0; }
  set landpar_color(v: number) { this.landpar = v | 0; }
  /** float heat: stores round to binary32 */
  get heat(): number { i32v[0] = this.landpar; return f32[0]; }
  set heat(v: number) { f32[0] = v; this.landpar = i32v[0]; }
  /** bytes[k] (char, signed on x86) */
  byte(k: number): number { return ((this.landpar << (24 - 8 * k)) >> 24); }
  setByte(k: number, v: number): void {
    this.landpar = (this.landpar & ~(0xFF << (8 * k))) | ((v & 0xFF) << (8 * k));
  }
}

/** a cell_content list entry (shmup monsters); stage 1 keeps the list empty */
export type cell_content_list = unknown;

/** struct cell : gcell. The bit fields of gcell wrap on store as in C++ (CAP_BITFIELD, the desktop build). */
export class cell implements node<cell> {
  /** creation serial, for the pointer order (not in C++) */
  readonly _id = serial++;

  land: eLand = 0;
  wall: eWall = 0;
  monst: eMonster = 0;
  item: eItem = 0;
  barleft: eLand = 0;
  barright: eLand = 0;

  private _ligon = 0;
  private _mpdist = 0;
  private _pathdist = 0;
  private _cpdist = 0;
  private _mondir = 0;
  private _bardir = 0;
  private _stuntime = 0;
  private _hitpoints = 0;
  private _monmirror = 0;
  private _landflags = 0;
  private _wparam = 0;

  /** unsigned ligon : 1 */
  get ligon(): number { return this._ligon; }
  set ligon(v: number | boolean) { this._ligon = Number(v) & 1; }
  /** signed mpdist : 7 */
  get mpdist(): number { return this._mpdist; }
  set mpdist(v: number) { this._mpdist = (v << 25) >> 25; }
  /** signed pathdist : 8 */
  get pathdist(): number { return this._pathdist; }
  set pathdist(v: number) { this._pathdist = (v << 24) >> 24; }
  /** signed cpdist : 8 */
  get cpdist(): number { return this._cpdist; }
  set cpdist(v: number) { this._cpdist = (v << 24) >> 24; }
  /** unsigned mondir : 8 */
  get mondir(): number { return this._mondir; }
  set mondir(v: number) { this._mondir = v & 0xFF; }
  /** unsigned bardir : 8 */
  get bardir(): number { return this._bardir; }
  set bardir(v: number) { this._bardir = v & 0xFF; }
  /** unsigned stuntime : 8 */
  get stuntime(): number { return this._stuntime; }
  set stuntime(v: number) { this._stuntime = v & 0xFF; }
  /** unsigned hitpoints : 7 */
  get hitpoints(): number { return this._hitpoints; }
  set hitpoints(v: number) { this._hitpoints = v & 0x7F; }
  /** unsigned monmirror : 1 */
  get monmirror(): number { return this._monmirror; }
  set monmirror(v: number | boolean) { this._monmirror = Number(v) & 1; }
  /** unsigned landflags : 8 */
  get landflags(): number { return this._landflags; }
  set landflags(v: number) { this._landflags = v & 0xFF; }
  /** char wparam (signed) */
  get wparam(): number { return this._wparam; }
  set wparam(v: number) { this._wparam = (v << 24) >> 24; }

  readonly LHU = new LHU();
  /** #define landparam LHU.landpar */
  get landparam(): number { return this.LHU.landpar; }
  set landparam(v: number) { this.LHU.landpar = v | 0; }
  /** #define landparam_color LHU.landpar_color */
  get landparam_color(): number { return this.LHU.landpar_color; }
  set landparam_color(v: number) { this.LHU.landpar_color = v; }
  /** #define fval LHU.fi.fieldval */
  get fval(): number { return this.LHU.fi.fieldval; }
  set fval(v: number) { this.LHU.fi.fieldval = v; }

  contents: cell_content_list = null;

  /** char type: our degree */
  type: number;
  /** used by celllister */
  listindex = 0;
  /** heptagon who owns us */
  master: heptagon;
  readonly c: connection_table<cell>;

  /** tailored_alloc<cell>(type) + the fields newCell sets; the oracle zero-fills the allocation, so every field
   *  initcell() does not set starts at 0 (hitpoints, the LHU bytes, ...) */
  constructor(type: number, master: heptagon) {
    this.type = type;
    this.master = master;
    this.c = new connection_table<cell>(this, type);
  }

  degree(): number { return this.type; }
  move(d: number): cell { return this.c.move(d); }
  setMove(d: number, v: cell | null): void { this.c.setMove(d, v); }
  modmove(d: number): cell { return this.c.modmove(d); }
  cmove(d: number): cell { return late.createMov(this, d); }
  cmodmove(d: number): cell { return late.createMov(this, this.c.fix(d)); }
}

// automaton state
export const hsOrigin = 0, hsA = 1, hsB = 2, hsError = 3, hsA0 = 4, hsA1 = 5, hsB0 = 6, hsB1 = 7, hsC = 8;
export type hstate = number;

/** struct cdata */
export class cdata {
  readonly val = new Int32Array(4);
  bits = 0;
}

/** struct heptagon; the bit fields and shorts wrap on store */
export class heptagon implements node<heptagon> {
  readonly _id = serial++;
  private _s = 0;
  private _dm4 = 0;
  private _distance = 0;
  private _emeraldval = 0;
  private _fiftyval = 0;
  private _zebraval = 0;
  private _fieldval = 0;
  private _rval0 = 0;
  private _rval1 = 0;

  /** hstate s : 6 */
  get s(): hstate { return this._s; }
  set s(v: hstate) { this._s = v & 63; }
  /** unsigned dm4 : 2 */
  get dm4(): number { return this._dm4; }
  set dm4(v: number) { this._dm4 = v & 3; }
  /** short distance */
  get distance(): number { return this._distance; }
  set distance(v: number) { this._distance = (v << 16) >> 16; }
  /** short emeraldval */
  get emeraldval(): number { return this._emeraldval; }
  set emeraldval(v: number) { this._emeraldval = (v << 16) >> 16; }
  /** short fiftyval */
  get fiftyval(): number { return this._fiftyval; }
  set fiftyval(v: number) { this._fiftyval = (v << 16) >> 16; }
  /** short zebraval */
  get zebraval(): number { return this._zebraval; }
  set zebraval(v: number) { this._zebraval = (v << 16) >> 16; }
  /** int fieldval : 24 */
  get fieldval(): number { return this._fieldval; }
  set fieldval(v: number) { this._fieldval = (v << 8) >> 8; }
  /** unsigned char type : 8 */
  type: number;
  /** short rval0, rval1 */
  get rval0(): number { return this._rval0; }
  set rval0(v: number) { this._rval0 = (v << 16) >> 16; }
  get rval1(): number { return this._rval1; }
  set rval1(v: number) { this._rval1 = (v << 16) >> 16; }
  /** for the main map, the fractal landscape data; for alternate structures, the original (cast) */
  cdata: cdata | null = null;
  /** for alternate structures, cdata contains the pointer to the original: the port keeps it here */
  cdata_orig: heptagon | null = null;
  /** which central cell does this heptagon correspond to */
  c7: cell = null!;
  /** associated generator of alternate structure, for Camelot and horocycles */
  alt: heptagon = null!;
  readonly c: connection_table<heptagon>;

  /** tailored_alloc<heptagon>(degree) (init_heptagon in heptagon.cpp sets the rest) */
  constructor(type: number) {
    this.type = type;
    this.c = new connection_table<heptagon>(this, type);
    heptacount++;
  }

  move(d: number): heptagon { return this.c.move(d); }
  setMove(d: number, v: heptagon | null): void { this.c.setMove(d, v); }
  modmove(d: number): heptagon { return this.c.modmove(d); }
  cmove(d: number): heptagon { return late.createStep(this, d); }
  cmodmove(d: number): heptagon { return late.createStep(this, this.c.fix(d)); }
  degree(): number { return this.type; }
}

// --- walker<T> ---

/** wstep, wmirror, rev, revstep: the tags of walker's operator+= (use the methods below) */

export class walker<T extends node<T>> {
  /** where we are at */
  at: T;
  /** in which direction (edge) we are facing */
  spin: number;
  /** are we mirrored */
  mirrored: boolean;

  /** walker(T *at = NULL, int s = 0, bool m = false); like the original, the spin is not normalized */
  constructor(at: T = null!, s = 0, m = false) {
    this.at = at; this.spin = s; this.mirrored = m;
  }

  clone(): walker<T> { return new walker<T>(this.at, this.spin, this.mirrored); }
  /** assignment: cw = other */
  set(o: walker<T>): this { this.at = o.at; this.spin = o.spin; this.mirrored = o.mirrored; return this; }

  /** += i: spin by i to the left (or right, when mirrored) */
  add(i: number): this {
    this.spin = this.at.c.fix(this.spin + (this.mirrored ? -i : i));
    return this;
  }
  /** -= i */
  sub(i: number): this {
    this.spin = this.at.c.fix(this.spin - (this.mirrored ? -i : i));
    return this;
  }
  /** += wmirror */
  addMirror(): this {
    this.mirrored = !this.mirrored;
    return this;
  }
  /** += wstep: a single step, after which we are facing the T we were originally on */
  addStep(): this {
    this.at.cmove(this.spin);
    const nspin = this.at.c.spin(this.spin);
    if (this.at.c.mirror(this.spin)) this.mirrored = !this.mirrored;
    this.at = this.at.move(this.spin);
    this.spin = nspin;
    return this;
  }
  /** += rev: face the other direction; may use hrand */
  addRev(): this {
    const rd = this.at instanceof cell ? late.reverse_directions_cell(this.at, this.spin)
      : late.reverse_directions_hept(this.at as unknown as heptagon, this.spin);
    if (rd.length === 1) this.spin = rd[0];
    else this.spin = rd[hrand(rd.length)];
    return this;
  }
  /** += revstep */
  addRevStep(): this {
    this.addRev(); return this.addStep();
  }

  /** cw + i, cw + wstep, cw + wmirror, cw + rev, cw + revstep (copies) */
  plus(i: number): walker<T> { return this.clone().add(i); }
  minus(i: number): walker<T> { return this.clone().add(-i); }
  plusStep(): walker<T> { return this.clone().addStep(); }
  plusMirror(): walker<T> { return this.clone().addMirror(); }
  plusRev(): walker<T> { return this.clone().addRev(); }
  plusRevStep(): walker<T> { return this.clone().addRevStep(); }

  eq(x: walker<T>): boolean { return this.at === x.at && this.spin === x.spin && this.mirrored === x.mirrored; }
  ne(x: walker<T>): boolean { return !this.eq(x); }
  /** operator<: tie(at, spin, mirrored) with the pointer order of `at` (creation serial) */
  lt(x: walker<T>): boolean {
    const a = (this.at as unknown as { _id: number })._id, b = (x.at as unknown as { _id: number })._id;
    if (a !== b) return a < b;
    if (this.spin !== x.spin) return this.spin < x.spin;
    return Number(this.mirrored) < Number(x.mirrored);
  }

  /** how much should we spin to face direction dir */
  to_spin(dir: number): number {
    return gmod(dir - this.spin, this.at.type) * (this.mirrored ? -1 : 1);
  }
  /** cw++ / cw-- (the returned value is the walker itself, as in C++) */
  inc(): this { return this.add(1); }
  dec(): this { return this.sub(1); }
  /** what T are we facing, without creating it */
  peek(): T { return this.at.move(this.spin); }
  /** what T are we facing, with creating it */
  cpeek(): T { return this.at.cmove(this.spin); }
  /** would we create a new T if we stepped forwards? */
  creates(): boolean { return !this.peek(); }
  /** mirror this walker with respect to the d-th edge */
  mirrorat(d: number): walker<T> { return new walker<T>(this.at, this.at.c.fix(d + d - this.spin), !this.mirrored); }
}

export type cellwalker = walker<cell>;
export type heptspin = walker<heptagon>;
export const cellwalker = walker as new (at?: cell, s?: number, m?: boolean) => walker<cell>;
export const heptspin = walker as new (at?: heptagon, s?: number, m?: boolean) => walker<heptagon>;

/** cw + cth: heptspin(cw.at->master, cw.spin * DUALMUL, cw.mirrored) */
export function cw_to_hs(cw: cellwalker): heptspin {
  return new heptspin(cw.at.master, cw.spin * late.DUALMUL(), cw.mirrored);
}
/** hs + cth: cellwalker(hs.at->c7, hs.spin / DUALMUL, hs.mirrored) */
export function hs_to_cw(hs: heptspin): cellwalker {
  return new cellwalker(hs.at.c7, Math.trunc(hs.spin / late.DUALMUL()), hs.mirrored);
}

// --- celllister ---

/** manual_celllister: only one may be active at a time (stack semantics); call destroy() where the C++ object
 *  goes out of scope (use try/finally) */
export class manual_celllister {
  readonly lst: cell[] = [];
  readonly tmps: number[] = [];

  listed(c: cell): boolean {
    return c.listindex >= 0 && c.listindex < this.lst.length && this.lst[c.listindex] === c;
  }
  add(c: cell): boolean {
    if (this.listed(c)) return false;
    this.tmps.push(c.listindex);
    c.listindex = this.lst.length;
    this.lst.push(c);
    return true;
  }
  remove(c: cell): boolean {
    if (!this.listed(c)) return false;
    const i = c.listindex;
    c.listindex = this.tmps[i];
    this.tmps.splice(i, 1);
    this.lst.splice(i, 1);
    return true;
  }
  /** ~manual_celllister */
  destroy(): void {
    for (let i = 0; i < this.lst.length; i++) this.lst[i].listindex = this.tmps[i];
  }
}

export const srAll = 0, srCount = 1, srCell = 2, srDistance = 3;

/** celllister: the cells around orig by distance (forCellCM: creates the cells); destroy() at scope end */
export class celllister extends manual_celllister {
  readonly dists: number[] = [];
  reason = srAll;

  add_at(c: cell, d: number): void {
    if (this.add(c)) this.dists.push(d);
  }

  constructor(orig: cell, maxdist: number, maxcount: number, breakon: cell | null) {
    super();
    this.add_at(orig, 0);
    let last = orig;
    for (let i = 0; i < this.lst.length; i++) {
      const c = this.lst[i];
      if (maxdist) for (let k = 0; k < c.type; k++) {
        const c2 = late.createMov(c, k);
        this.add_at(c2, this.dists[i] + 1);
        if (c2 === breakon) { this.reason = srCell; return; }
      }
      if (c === last) {
        if (this.lst.length >= maxcount) { this.reason = srCount; return; }
        if (this.dists[i] + 1 === maxdist) { this.reason = srDistance; return; }
        last = this.lst[this.lst.length - 1];
      }
    }
    this.reason = srAll;
  }

  getdist(c: cell): number { return this.dists[c.listindex]; }
}

// --- free functions of locations.cpp ---

export function proper(c: cell, d: number): boolean { return d >= 0 && d < c.type; }

/** return b-a, as in, a number x such that a+x == b */
export function cwdiff(b: cellwalker, a: cellwalker): number {
  return a.mirrored ? a.spin - b.spin : b.spin - a.spin;
}
export function cwdiff_fixed(b: cellwalker, a: cellwalker): number {
  return gmod(cwdiff(b, a), b.at.type);
}
/** return c+(b-a) */
export function cw_add_diff(c: cellwalker, b: cellwalker, a: cellwalker): cellwalker {
  c = c.clone();
  c.add(cwdiff(b, a));
  if (a.mirrored !== b.mirrored) c.addMirror();
  return c;
}

export const STRONGWIND = 199;
export const FALL = 198;
export const NO_SPACE = 197;
export const TELEPORT = 196;
export const JUMP = 195;
export const STAY = 194;
export const NOMOVEI = 193;

/** struct movei (a value type: copy with clone()) */
export class movei {
  s: cell;
  t: cell;
  d: number;

  constructor(s: cell, t: cell, d: number) { this.s = s; this.t = t; this.d = d; }
  /** movei(cell *s, int d) */
  static sd(s: cell, d: number): movei {
    let t: cell;
    if (d === STRONGWIND) t = late.whirlwind_jumpDestination(s);
    else if (d < 0 || d >= s.type) t = s;
    else t = s.cmove(d);
    return new movei(s, t, d);
  }
  /** movei(cellwalker cw) */
  static cw(cw: cellwalker): movei { return new movei(cw.at, cw.cpeek(), cw.spin); }
  clone(): movei { return new movei(this.s, this.t, this.d); }
  op(): boolean { return this.s !== this.t; }
  proper(): boolean { return this.d >= 0 && this.d < this.s.type && this.s.move(this.d) === this.t; }
  rev(): movei { return new movei(this.t, this.s, this.rev_dir_or(this.d)); }
  dir_or(x: number): number { return this.proper() ? this.d : x; }
  rev_dir_or(x: number): number { return this.proper() ? this.s.c.spin(this.d) : x; }
  rev_dir_mirror(): number { return this.proper() ? this.s.c.spin(this.d) : this.d; }
  rev_dir_force(): number { return this.s.c.spin(this.d); }
  dir_force(): number { return this.d; }
  mirror(): boolean { return this.s.c.mirror(this.d); }
}

/** struct jumpdata */
export class jumpdata {
  dashmon: eMonster = 0;
  jumpthru: cell = null!;
  uniq = false;
  moves: movei[] = [];
}

export function moveimon(c: cell): movei { return movei.sd(c, c.mondir); }

export function match(f: cell, t: cell): movei {
  for (let i = 0; i < f.type; i++) if (f.move(i) === t) return new movei(f, t, i);
  return new movei(f, t, -1);
}
