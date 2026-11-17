// Lasers (laser.cc, stones/LaserStone.cc, stones/MirrorStone.cc): beams are it_laserbeam items spread from
// the laser stones through transparent stones; mirrors turn them; photo sensors (GridObject) see the light.
import {
  Item, Stone, Register, GameTimer, GetStone, GetItem, SetItem, KillItem, SendMessage, IntegerRand, maybe_push_stone,
  lightHooks, photoSensors, toInt, toBool, toBits, reverseDir, levelPrepareHooks, host,
  NODIR, WEST, NORTH, EASTBIT, WESTBIT, NORTHBIT, SOUTHBIT, ALL_DIRECTIONS, itf_static, itf_indestructible,
  OBJBIT_LIGHTNEWDIRS, OBJBIT_LIGHTOLDDIRS, OBJBIT_LIGHTALLDIRS, MOVABLE_PERSISTENT, MOVABLE_STANDARD,
  type GridObject, type GridPos, type Message, type Value, type Actor, type StoneContact, type TimeHandler, type GameObject,
} from '../core.ts';
import { wieldedItemIs } from './stones2.ts';

const rotateCw = (d: number) => [3, 0, 1, 2][d];
const rotateCcw = (d: number) => [1, 2, 3, 0][d];

let beams: LaserBeam[] = [];
let lasers: LaserStone[] = [];
let recalcScheduled = false;
levelPrepareHooks.push(() => { beams = []; recalcScheduled = false; });

export class LaserBeam extends Item {
  constructor(dir: number) { super(); this.objFlags |= toBits(dir); }
  traits() { return { name: 'it_laserbeam', flags: itf_static | itf_indestructible, radius: 0 }; }
  message(m: Message): Value { if (m.message === '_freeze') { this.kill(); return null; } return super.message(m); }
  init_model() {
    const d = this.objFlags & 15;
    if (d & (EASTBIT | WESTBIT)) this.set_model(d & (NORTHBIT | SOUTHBIT) ? 'it_laser_hv' : 'it_laser_h');
    else if (d & (NORTHBIT | SOUTHBIT)) this.set_model('it_laser_v');
  }
  processLight(dir: number) {
    const b = toBits(dir);
    if ((this.objFlags & 15 & b) === 0) { this.objFlags |= b; emitFrom(this.pos, dir); }
  }
  on_creation(p: GridPos) {
    beams.push(this);
    const d = this.objFlags & 15;
    if (d & EASTBIT) emitFrom(p, 2); else if (d & WESTBIT) emitFrom(p, 0); else if (d & NORTHBIT) emitFrom(p, 3); else if (d & SOUTHBIT) emitFrom(p, 1);
  }
  on_removal(p: GridPos) {
    if ((this.objFlags & 15) !== 0) { const i = beams.indexOf(this); if (i >= 0) beams.splice(i, 1); }
    super.on_removal(p);
  }
  actor_hit(a: Actor) {
    const d = this.objFlags & 15;
    const dx = Math.abs(a.ai.pos.x - this.pos.x - 0.5), dy = Math.abs(a.ai.pos.y - this.pos.y - 0.5);
    if (((d & (EASTBIT | WESTBIT)) && dy < 0.21) || ((d & (NORTHBIT | SOUTHBIT)) && dx < 0.21)) SendMessage(a, '_laserhit');
    return false;
  }
}

export function emitFrom(p0: GridPos, dir: number) {
  let pass = true;
  const p = p0.move(dir);
  const st = GetStone(p);
  if (st) { pass = st.is_transparent(dir); st.processLight(dir); }
  if (pass) {
    const it = GetItem(p);
    if (it) it.processLight(dir);
    else SetItem(p, new LaserBeam(dir));
  }
}

function lightFrom(p0: GridPos, dir: number): boolean {
  const p = p0.move(dir);
  const st = GetStone(p);
  if (st && (st.emissionDirections() & toBits(reverseDir(dir)))) return true;
  const it = GetItem(p);
  return !!it && (it.emissionDirections() & toBits(reverseDir(dir))) !== 0;
}
export function updateCurrentLightDirs(o: GridObject): number {
  let r = 0;
  for (let d = NORTH; d !== NODIR; d--) if (lightFrom(o.pos, reverseDir(d))) r |= toBits(d);
  o.objFlags = (o.objFlags & ~OBJBIT_LIGHTNEWDIRS) | r;
  return r;
}

lightHooks.maybeRecalc = (p) => {
  recalcScheduled = recalcScheduled || lightFrom(p, 3) || lightFrom(p, 1) || lightFrom(p, 0) || lightFrom(p, 2);
};
lightHooks.recalc = () => { recalcScheduled = true; };
lightHooks.performRecalc = (isInit) => {
  if (!recalcScheduled) return;
  recalcScheduled = false;
  // GridObject::preLaserRecalc
  for (const o of photoSensors) o.objFlags = (o.objFlags & ~OBJBIT_LIGHTALLDIRS) | ((o.objFlags & OBJBIT_LIGHTNEWDIRS) << 4);
  // LaserBeam::kill_all
  for (const b of beams) b.objFlags = (b.objFlags & ~255) | ((b.objFlags & 15) << 4);
  for (const l of lasers.slice()) l.emitLight();
  // LaserBeam::all_emitted
  let x = 0, y = 0, count = 0;
  for (const b of beams.slice()) {
    const nd = b.objFlags & 15;
    if (nd === 0) { const i = beams.indexOf(b); if (i >= 0) beams.splice(i, 1); KillItem(b.pos); }
    else if ((b.objFlags & 240) !== (nd << 4)) {
      b.init_model();
      if ((((b.objFlags & 240) >> 4) & nd) !== nd) { const p = b.getOwnerPos(); x += p.x; y += p.y; count++; }
    }
  }
  if (count) host.sound('laseron', x / count + 0.5, y / count + 0.5, 1);
  if (!isInit) {
    // GridObject::postLaserRecalc
    for (const o of photoSensors.slice()) {
      const n = o.objFlags & OBJBIT_LIGHTNEWDIRS, old = (o.objFlags & OBJBIT_LIGHTOLDDIRS) >> 4;
      if (n !== old) o.lightDirChanged(old, n);
    }
  }
};

// ----- laser stones
const L_OFF = 0, L_ON = 1, L_NEW_OFF = 2, L_NEW_ON = 3, L_NEW_OFF_PENDING_ON = 4, L_NEW_ON_PENDING_OFF = 5;
const SFX = ['-w', '-s', '-e', '-n'];
export class LaserStone extends Stone implements TimeHandler {
  constructor(dir: number) { super(); this.setAttr('orientation', dir); }
  getClass() { return 'st_laser'; }
  clone(): GameObject { const o = super.clone() as LaserStone; lasers.push(o); return o; }
  dispose() { const i = lasers.indexOf(this); if (i >= 0) lasers.splice(i, 1); GameTimer.remove_alarm(this); super.dispose(); }
  setAttr(key: string, val: Value) {
    if (this.isDisplayable() && key === 'orientation') { super.setAttr(key, val); recalcScheduled = true; this.init_model(); return; }
    super.setAttr(key, val);
  }
  message(m: Message): Value {
    if (m.message === 'orientate' && this.isDisplayable()) { this.setAttr('orientation', m.value); return null; }
    if ((m.message === 'turn' || m.message === 'turnback') && this.isDisplayable()) {
      const cc = toBool(this.getAttr('counterclock'));
      this.setAttr('orientation', (m.message === 'turn' && !cc) || (m.message === 'turnback' && cc) ? rotateCw(this.orientation()) : rotateCcw(this.orientation()));
      return null;
    }
    return super.message(m);
  }
  externalState() { return this.state % 2; }
  setState(s: number) {
    if (this.isDisplayable()) {
      switch (this.state) {
        case L_OFF: case L_ON:
          if (this.state !== s) { this.state = s + 2; GameTimer.set_alarm(this, 0.2, false); recalcScheduled = true; this.init_model(); }
          break;
        case L_NEW_OFF: case L_NEW_ON:
          if (this.state !== s + 2) this.state += 2;
          break;
        case L_NEW_OFF_PENDING_ON: case L_NEW_ON_PENDING_OFF:
          if (this.state === s + 4) this.state -= 2;
          break;
      }
    } else this.state = s;
  }
  toggleState() {
    if (this.state === L_OFF || this.state === L_NEW_OFF || this.state === L_NEW_ON_PENDING_OFF) this.setState(L_ON);
    else this.setState(L_OFF);
  }
  init_model() { this.set_model((this.externalState() === 1 ? 'st-laseron' : 'st-laser') + SFX[this.orientation()]); }
  on_creation(p: GridPos) { if (this.state === L_ON) recalcScheduled = true; super.on_creation(p); }
  on_removal(p: GridPos) { GameTimer.remove_alarm(this); this.state &= 1; super.on_removal(p); }
  emissionDirections() { return this.externalState() === 1 ? toBits(this.orientation()) : 0; }
  alarm() {
    const old = this.externalState();
    switch (this.state) {
      case L_NEW_OFF: this.state = L_OFF; break;
      case L_NEW_ON: this.state = L_ON; break;
      case L_NEW_OFF_PENDING_ON: this.state = L_NEW_ON; GameTimer.set_alarm(this, 0.2, false); break;
      case L_NEW_ON_PENDING_OFF: this.state = L_NEW_OFF; GameTimer.set_alarm(this, 0.2, false); break;
    }
    if (old !== this.externalState()) { recalcScheduled = true; this.init_model(); }
  }
  emitLight() { if (this.externalState() === 1) emitFrom(this.pos, this.orientation()); }
  orientation() { return toInt(this.getAttr('orientation')); }
}
for (const [n, d] of [['st_laser', 2], ['st_laser_n', 3], ['st_laser_s', 1], ['st_laser_e', 2], ['st_laser_w', 0]] as [string, number][]) Register(n, new LaserStone(d));

// ----- mirrors
const OUT_DIRS: number[] = [
  (WESTBIT << 12) + (SOUTHBIT << 8) + (EASTBIT << 4) + NORTHBIT, (SOUTHBIT << 12) + (0 << 8) + (NORTHBIT << 4) + 0,
  (EASTBIT << 12) + (NORTHBIT << 8) + (WESTBIT << 4) + SOUTHBIT, (0 << 12) + (WESTBIT << 8) + (0 << 4) + EASTBIT,
  (WESTBIT << 12) + ((NORTHBIT + SOUTHBIT) << 8) + (WESTBIT << 4) + EASTBIT, ((WESTBIT + EASTBIT) << 12) + (SOUTHBIT << 8) + (NORTHBIT << 4) + SOUTHBIT,
  (EASTBIT << 12) + (WESTBIT << 8) + (EASTBIT << 4) + (NORTHBIT + SOUTHBIT), (SOUTHBIT << 12) + (NORTHBIT << 8) + ((WESTBIT + EASTBIT) << 4) + NORTHBIT,
  ((WESTBIT + NORTHBIT) << 12) + ((SOUTHBIT + EASTBIT) << 8) + ((EASTBIT + SOUTHBIT) << 4) + (NORTHBIT + WESTBIT),
  ((SOUTHBIT + NORTHBIT) << 12) + (0 << 8) + ((NORTHBIT + SOUTHBIT) << 4) + 0,
  ((EASTBIT + NORTHBIT) << 12) + ((NORTHBIT + EASTBIT) << 8) + ((WESTBIT + SOUTHBIT) << 4) + (SOUTHBIT + WESTBIT),
  (0 << 12) + ((WESTBIT + EASTBIT) << 8) + (0 << 4) + (EASTBIT + WESTBIT),
  ((WESTBIT + NORTHBIT) << 12) + ((NORTHBIT + SOUTHBIT + EASTBIT) << 8) + ((WESTBIT + SOUTHBIT) << 4) + (EASTBIT + WESTBIT),
  ((WESTBIT + EASTBIT + NORTHBIT) << 12) + ((SOUTHBIT + EASTBIT) << 8) + ((NORTHBIT + SOUTHBIT) << 4) + (SOUTHBIT + WESTBIT),
  ((EASTBIT + NORTHBIT) << 12) + ((WESTBIT + EASTBIT) << 8) + ((EASTBIT + SOUTHBIT) << 4) + (NORTHBIT + SOUTHBIT + WESTBIT),
  ((SOUTHBIT + NORTHBIT) << 12) + ((NORTHBIT + EASTBIT) << 8) + ((WESTBIT + EASTBIT + SOUTHBIT) << 4) + (NORTHBIT + WESTBIT),
  0, 0, 0, 0, 0, 0, 0, 0,
  ((WESTBIT + NORTHBIT) << 12) + ((SOUTHBIT + EASTBIT) << 8) + ((EASTBIT + SOUTHBIT) << 4) + (NORTHBIT + WESTBIT),
  ((SOUTHBIT + NORTHBIT) << 12) + (EASTBIT << 8) + ((NORTHBIT + SOUTHBIT) << 4) + WESTBIT,
  ((EASTBIT + NORTHBIT) << 12) + ((NORTHBIT + EASTBIT) << 8) + ((WESTBIT + SOUTHBIT) << 4) + (SOUTHBIT + WESTBIT),
  (NORTHBIT << 12) + ((WESTBIT + EASTBIT) << 8) + (SOUTHBIT << 4) + (EASTBIT + WESTBIT),
  0, 0, 0, 0,
];
const TRIANGLE = 1 << 24, PANE = 1 << 25, SIDE = 1 << 26, MOVABLE = 1 << 27;
class MirrorStone extends Stone {
  constructor(tri: boolean, mov: boolean, pane: boolean, side: boolean, dir: number, cc = false) {
    super();
    this.state = dir;
    if (tri) this.objFlags |= TRIANGLE;
    if (mov) this.objFlags |= MOVABLE;
    if (pane) this.objFlags |= PANE;
    if (side) this.objFlags |= SIDE;
    if (cc) this.setAttr('counterclock', true);
  }
  getClass() { return 'st_mirror'; }
  movableTrait() { return this.objFlags & MOVABLE ? MOVABLE_STANDARD : MOVABLE_PERSISTENT; }
  setAttr(key: string, val: Value) {
    let newModel = false, light = false, handled = false;
    if (key === 'movable') { if (toBool(val) !== ((this.objFlags & MOVABLE) !== 0)) { this.objFlags ^= MOVABLE; newModel = true; handled = true; } }
    else if (key === 'flavor') {
      const v = String(val);
      if (v === 'triangle' && !(this.objFlags & TRIANGLE)) { this.objFlags |= TRIANGLE; this.objFlags &= ~SIDE; newModel = light = handled = true; }
      else if (v === 'slab' && ((this.objFlags & TRIANGLE) || (this.objFlags & SIDE))) { this.objFlags &= ~(TRIANGLE | SIDE); newModel = light = handled = true; }
      else if (v === 'sheets' && ((this.objFlags & TRIANGLE) || !(this.objFlags & SIDE))) { this.objFlags &= ~TRIANGLE; this.objFlags |= SIDE | PANE; newModel = light = handled = true; }
    } else if (key === 'orientation') {
      let o = toInt(val);
      if (o === -2) o = IntegerRand(this.minState(), this.maxState());
      if (o >= this.minState() && o <= this.maxState()) { this.setState(o); handled = true; }
    } else if (key === 'transparent') {
      if (toBool(val) !== ((this.objFlags & PANE) !== 0) && !(this.objFlags & SIDE)) { this.objFlags ^= PANE; newModel = light = handled = true; }
    }
    if (this.isDisplayable()) { if (newModel) this.init_model(); if (light) recalcScheduled = true; }
    if (!handled) super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'movable') return (this.objFlags & MOVABLE) !== 0;
    if (key === 'flavor') return this.objFlags & TRIANGLE ? 'triangle' : this.objFlags & SIDE ? 'sheets' : 'slab';
    if (key === 'orientation') return this.state;
    if (key === 'transparent') return (this.objFlags & PANE) !== 0;
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === 'orientate') { this.setAttr('state', m.value); return null; }
    if (m.message === 'turn' || m.message === 'turnback') {
      const cc = toBool(this.getAttr('counterclock'));
      this.setAttr('state', (m.message === 'turn' && !cc) || (m.message === 'turnback' && cc) ? rotateCw(this.state) : rotateCcw(this.state));
      return null;
    }
    if (m.message === 'signal') { if (toInt(m.value) === 1) this.toggleState(); return null; }
    if (m.message === '_trigger') { if (toInt(m.value) === 1) this.toggleState(); return null; }
    return super.message(m);
  }
  maxState() { return 3; }
  setState(s: number) {
    this.state = s;
    if (this.isDisplayable()) { this.init_model(); recalcScheduled = true; this.sound_event('mirrorturn'); }
  }
  toggleState() { this.setState(!toBool(this.getAttr('counterclock')) ? rotateCw(this.state) : rotateCcw(this.state)); }
  init_model() {
    const f = this.objFlags;
    this.set_model(`st-${f & TRIANGLE ? '3' : 'p'}mirror-${f & MOVABLE ? 'm' : 's'}${f & PANE ? (f & SIDE ? 'f' : 't') : 'o'}${((5 - this.state) % 4) + 1}`);
  }
  on_creation(p: GridPos) { this.activatePhoto(); super.on_creation(p); }
  processLight(d: number) {
    const old = this.emissionDirections();
    super.processLight(d);
    const nw = this.emissionDirections();
    if (old !== nw) for (let nd = WEST; nd <= NORTH; nd++) { const b = toBits(nd); if (!(old & b) && (nw & b)) emitFrom(this.pos, nd); }
  }
  emissionDirections() {
    const idx = ((this.objFlags >>> 22) & 0x1c) | this.state;
    const c = OUT_DIRS[idx] ?? 0;
    let r = 0;
    if (this.objFlags & NORTHBIT) r |= (c >> 12) & ALL_DIRECTIONS;
    if (this.objFlags & EASTBIT) r |= (c >> 8) & ALL_DIRECTIONS;
    if (this.objFlags & SOUTHBIT) r |= (c >> 4) & ALL_DIRECTIONS;
    if (this.objFlags & WESTBIT) r |= c & ALL_DIRECTIONS;
    return r;
  }
  actor_hit(sc: StoneContact) {
    if (this.objFlags & MOVABLE) maybe_push_stone(sc);
    if (wieldedItemIs(sc.actor, 'it_wrench')) this.setState(!toBool(this.getAttr('counterclock')) ? rotateCcw(this.state) : rotateCw(this.state));
    else this.toggleState();
  }
}
const MIRRORS: [string, boolean, boolean, boolean, boolean, number, boolean?][] = [
  ['st_mirror', false, false, false, false, 3], ['st_mirror_slab', false, false, false, false, 3], ['st_mirror_triangle', true, false, false, false, 3],
  ['st_mirror_sheets', false, false, true, true, 3],
];
const DIRS: [string, number][] = [['n', 3], ['e', 2], ['s', 1], ['w', 0]];
for (const [f, tri] of [['slab', false], ['triangle', true]] as [string, boolean][]) {
  for (const [suf, mv, tr] of [['', false, false], ['t', false, true], ['m', true, false], ['tm', true, true]] as [string, boolean, boolean][]) {
    for (const [dn, d] of DIRS) MIRRORS.push([`st_mirror_${f}_${dn}${suf}`, tri, mv, tr, false, d]);
  }
}
for (const [suf, mv, tr] of [['c', false, false], ['tc', false, true], ['mc', true, false], ['tmc', true, true]] as [string, boolean, boolean][]) {
  for (const [dn, d] of DIRS) MIRRORS.push([`st_mirror_triangle_${dn}${suf}`, true, mv, tr, false, d, true]);
}
for (const [n, tri, mv, pane, side, d, cc] of MIRRORS) Register(n, new MirrorStone(tri, mv, pane, side, d, cc ?? false));
export const _keep = [GetStone];
