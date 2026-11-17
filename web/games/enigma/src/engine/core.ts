// The core of Enigma's engine: objects (Object.cc, StateObject.cc, GridObject.cc, floors.cc, items.cc,
// stones.cc, actors.cc), the world with its physics (world.cc), the timer (timer.cc), the players and
// inventories (player.cc, Inventory.cc), the server state (server.cc) and the random numbers (enigma.cc).
// Object kinds live in objects/*.ts and register their templates here (BootRegister).
import { ObjectValidator } from './validator.ts';
import { pow08 } from './pow.ts';
import {
  VObj, VGroup, VPos, VTokens, vtype, VT, toBool, toInt, toDouble, toStr, valueEquals, toTokenList, makeTokens,
  roundNearest, type Value,
} from './value.ts';
import { Display, type Model, type SpriteHandle, type ModelCallback } from './display.ts';

export { toBool, toInt, toDouble, toStr, valueEquals, roundNearest, VObj, VGroup, VPos, VTokens, vtype, VT, makeTokens, toTokenList };
export type { Value };

// ------------------------------------------------------------------ directions, positions

export const NODIR = -1, WEST = 0, SOUTH = 1, EAST = 2, NORTH = 3;
export const NODIRBIT = 0, WESTBIT = 1, SOUTHBIT = 2, EASTBIT = 4, NORTHBIT = 8, ALL_DIRECTIONS = 15;
export function reverseDir(d: number): number { return d === NODIR ? NODIR : (d + 2) % 4; }
export function toBits(d: number): number { return d === NODIR ? 0 : 1 << d; }
export const DX = [-1, 0, 1, 0], DY = [0, 1, 0, -1];

export class GridPos {
  x: number; y: number;
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  static of(p: V2): GridPos { return new GridPos(Math.floor(p.x), Math.floor(p.y)); }
  eq(o: GridPos) { return this.x === o.x && this.y === o.y; }
  center(): V2 { return new V2(this.x + 0.5, this.y + 0.5); }
  move(d: number): GridPos { return d === NODIR ? new GridPos(this.x, this.y) : new GridPos(this.x + DX[d], this.y + DY[d]); }
}

export class V2 {
  x: number; y: number;
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  clone() { return new V2(this.x, this.y); }
  eq(o: V2) { return this.x === o.x && this.y === o.y; }
}
export function len(x: number, y: number): number { return Math.sqrt(x * x + y * y); }


// ------------------------------------------------------------------ random numbers (enigma.cc)

export const ENIGMA_RAND_MAX = 0x7fffffff;
export const rng = { level: 1, system: 1 };
export function Rand(isLevel = true): number {
  let r = isLevel ? rng.level : rng.system;
  // 31 bit BSD rand: x = (a x + c) mod 2^31 with int32 arithmetic
  r = (Math.imul(r, 1103515245) + 12345) & 0x7fffffff;
  if (isLevel) rng.level = r; else rng.system = r;
  return r;
}
export function IntegerRand(min: number, max: number, isLevel = true): number {
  return Math.floor((max - min + 1) * (Rand(isLevel) / (ENIGMA_RAND_MAX + 1.0))) + min;
}
export function DoubleRand(min: number, max: number, isLevel = true): number {
  return min + Rand(isLevel) / ENIGMA_RAND_MAX * (max - min);
}

// ------------------------------------------------------------------ server state (server.cc)

export const server = {
  EnigmaCompatibility: 1.1,
  LevelTime: 0,
  WorldInitialized: false,
  WorldSized: false,
  IsLevelRestart: false,
  IsDifficult: true,
  CreatingPreview: false,
  ConserveLevel: true, ProvideExtralifes: true, InfiniteReincarnation: false, SurviveFinish: true,
  TwoPlayerGame: false, SingleComputerGame: true, AllowSingleOxyds: false, AllowSuicide: true,
  AllowTogglePlayer: true, AutoRespawn: false, ShowMoves: false, NoCollisions: false,
  FollowAction: new GridPos(19, 12), FollowGrid: true, FollowMethod: 0 as number, FollowThreshold: 0.5,
  GlassesVisibility: 0, FlatForce: 0, ConstantForce: new V2(),
  Brittleness: 0.5, BumperForce: 200, CrackSpreading: 0.5, ElectricForce: 15, ExtralifeGlasses: 19,
  FallenPuzzle: 'fl_gray', Fragility: 1, FrictionFactor: 1, HoleForce: 1, MagnetForce: 30, MagnetRange: 10,
  MaxOxydColor: 7, RubberViolationStrength: 50, SlopeForce: 25, SubSoil: 0, SwampSinkSpeed: 4,
  WaterSinkSpeed: 10000, WormholeForce: 30, WormholeRange: 10,
  SublevelNumber: 1, SublevelTitle: '',
  moveCounter: 0,
  /** set by FinishLevel, read by the game loop */
  finishRequested: false,
};
export function IncMoveCounter() { server.moveCounter++; }

/** hooks to the rest of the program (level loader, Lua, sound, game flow) */
export interface EngineHost {
  callLua(func: string, arg: Value, obj: GameObject | null, expectFunction: boolean): void;
  setDefaultFloor(x: number, y: number): void;
  sound(name: string, x: number, y: number, vol: number): void;
  finishLevel(): void;
  showText(text: string): void;
  log(msg: string): void;
}
export const host: EngineHost = {
  callLua: () => {}, setDefaultFloor: () => {}, sound: () => {}, finishLevel: () => { server.finishRequested = true; },
  showText: () => {}, log: () => {},
};
export class XLevelRuntime extends Error {}

export let validator: ObjectValidator;
export function setValidator(v: ObjectValidator) { validator = v; }
export const display = new Display();

// ------------------------------------------------------------------ objects (Object.cc)

export const OBJECT = 0, FLOOR = 1, ITEM = 2, STONE = 3, ACTOR = 4, OTHER = 5;
export const OBJBIT_INVERSE = 1 << 8, OBJBIT_NOP = 1 << 9, OBJBIT_INIT = 1 << 10, OBJBIT_PHOTOACTIV = 1 << 11;
export const OBJBIT_LIGHTNEWDIRS = 15, OBJBIT_LIGHTOLDDIRS = 15 << 4, OBJBIT_LIGHTALLDIRS = 255;

export interface Message { message: string; value: Value; sender: GameObject | null }

let nextId = 1;
const objects = new Map<number, GameObject>();

export abstract class GameObject implements ModelCallback {
  id = 0;
  attribs = new Map<string, Value>();
  objFlags = 0;
  state = 0;

  constructor() { this.id = nextId++; objects.set(this.id, this); }
  static getObject(id: number): GameObject | null { return objects.get(id) ?? null; }

  abstract getClass(): string;
  getObjectType(): number { return OBJECT; }
  /** C++ copy constructor + clone() */
  clone(): GameObject {
    const c = Object.create(Object.getPrototypeOf(this)) as GameObject;
    Object.assign(c, this);
    c.attribs = new Map(this.attribs);
    c.id = nextId++;
    objects.set(c.id, c);
    c.afterClone();
    return c;
  }
  protected afterClone() {}
  dispose() { objects.delete(this.id); }

  getKind(): string { return validator.getKind(this.getClass(), (k) => this.getAttr(k)); }
  isKind(kind: string): boolean { return validator.isKind(this.getClass(), (k) => this.getAttr(k), kind); }
  validateMessage(msg: string): boolean { return validator.validateMessage(this.getClass(), msg, (k) => this.getAttr(k)); }

  message(m: Message): Value {
    if (m.message === 'toggle') { this.toggleState(); return undefined; }
    if (m.message === 'signal') {
      let v: number;
      if (typeof m.value === 'number' || typeof m.value === 'string') v = toInt(m.value);
      else v = toBool(m.value) ? 1 : 0;
      if (v >= 0) this.setState(v % 2);
      return null;
    }
    if (m.message === 'on' || m.message === 'open') { this.setState(1); return null; }
    if (m.message === 'off' || m.message === 'close') { this.setState(0); return null; }
    return this.objectMessage(m);
  }
  /** Object::message */
  objectMessage(m: Message): Value {
    if (m.message === '_init') {
      if (this.objFlags & OBJBIT_INIT) this.finalizeNearestObjectReferences();
    } else if (m.message === 'kill') {
      switch (this.getObjectType()) {
        case OTHER: KillOther(this as unknown as Other); break;
        case FLOOR: KillFloor((this as unknown as GridObject).pos); break;
        case ITEM: KillItem((this as unknown as GridObject).pos); break;
        case STONE: KillStone((this as unknown as GridObject).pos); break;
      }
    } else if (m.message === 'disconnect') {
      let was = false;
      for (const o of getObjectList(this.getAttr('rubbers'), null)) if (o) KillOther(o as unknown as Other);
      if (getObjectList(this.getAttr('rubbers'), null).length) { was = true; this.setAttr('rubber', null); }
      return was;
    }
    return undefined;
  }

  // ----- attributes (Object, StateObject)
  setAttr(key: string, val: Value): void {
    if (key === 'state') {
      if (toInt(val) >= this.minState() && toInt(val) <= this.maxState()) this.setState(toInt(val));
      return;
    }
    this.objectSetAttr(key, val);
  }
  objectSetAttr(key: string, val: Value) {
    if (key === 'inverse') { if (toBool(val)) this.objFlags |= OBJBIT_INVERSE; else this.objFlags &= ~OBJBIT_INVERSE; }
    else if (key === 'nopaction') { if (toBool(val)) this.objFlags |= OBJBIT_NOP; else this.objFlags &= ~OBJBIT_NOP; }
    else if (val !== undefined) {
      if (val === null) this.attribs.delete(key);
      else this.attribs.set(key, val);
    }
  }
  getAttr(key: string): Value {
    if (key === 'state') return this.externalState();
    if (key === '$maxState') return this.maxState();
    if (key === '$minState') return this.minState();
    return this.objectGetAttr(key);
  }
  objectGetAttr(key: string): Value {
    if (key === 'inverse') return (this.objFlags & OBJBIT_INVERSE) !== 0;
    if (key === 'nopaction') return (this.objFlags & OBJBIT_NOP) !== 0;
    if (key === 'basename') {
      const name = toStr(this.getAttr('name'));
      let p = name.lastIndexOf('%');
      if (p >= 0) return name.slice(0, p);
      p = name.lastIndexOf('#');
      if (p >= 0) return name.slice(0, p);
      return name;
    }
    if (this.attribs.has(key)) return this.attribs.get(key);
    return validator.getDefaultValue(this.getClass(), key);
  }
  getDefaultedAttr(key: string, def: Value): Value { const v = this.getAttr(key); return v !== undefined ? v : def; }

  setAttrChecked(key: string, val: Value) {
    if (key === 'name') {
      const oldName = toStr(this.getAttr('name'));
      const newName = toStr(val);
      const isRename = oldName.length > 0 && newName !== oldName;
      const victim = GetNamedObject(newName);
      if (victim) {
        UnnameObject(victim);
        for (const f of getObjectList(victim.getAttr('fellows'), null)) {
          if (!f) continue;
          const l = getObjectList(f.getAttr('fellows'), null).filter((x) => x !== null);
          l.push(victim);
          f.setAttr('fellows', makeGroup(l));
        }
      }
      NameObject(this, toStr(val));
      if (isRename) {
        for (const f of getObjectList(this.getAttr('fellows'), null)) {
          if (!f) continue;
          const l = getObjectList(f.getAttr('fellows'), null).filter((x) => x !== null);
          l.push(this);
          f.setAttr('fellows', makeGroup(l));
        }
      }
      return;
    }
    let result = 0;
    if (!key.startsWith('_')) result = validator.validateAttributeWrite(this.getClass(), key, val);
    if (result === 0) {
      if (key === 'destination' || key.startsWith('target') || key.startsWith('anchor'))
        if (maybeNearestObjectReference(val)) this.objFlags |= OBJBIT_INIT;
      this.setAttr(key, val);
    } else {
      const reason = result === 1 ? 'attribute name unknown' : result === 2 ? 'no write access allowed' : 'value typ mismatch';
      throw new XLevelRuntime(`Object: attribute '${key}' write failed for kind '${this.getKind()}', ${reason}`);
    }
  }
  getAttrChecked(key: string): Value {
    if (key.startsWith('_') || validator.validateAttributeRead(this.getClass(), key)) return this.getAttr(key);
    throw new XLevelRuntime(`Object: attribute '${key}' read not allowed for kind '${this.getKind()}'`);
  }

  // ----- states (StateObject)
  maxState(): number { return 1; }
  minState(): number { return 0; }
  toggleState() {
    const s = this.externalState();
    if (s + 1 <= this.maxState()) this.setState(s + 1); else this.setState(this.minState());
  }
  externalState(): number { return this.state; }
  setState(s: number) { this.state = s; }

  // ----- actions
  invertActionValue(v: Value): Value { return !toBool(v); }
  performAction(val: Value) {
    let mv = val;
    if (this.objFlags & OBJBIT_INVERSE) mv = this.invertActionValue(val);
    if (server.EnigmaCompatibility < 1.10) mv = toBool(mv) ? 1 : 0;
    let targets = toTokenList(this.getAttr('target'));
    let actions = toTokenList(this.getAttr('action'));
    const state = this.getAttr('state');
    if (state !== undefined) {
      const s = toInt(state);
      const st = this.getAttr(`target_${s}`);
      if (st !== undefined) targets = toTokenList(st);
      const sa = this.getAttr(`action_${s}`);
      if (sa !== undefined) actions = toTokenList(sa);
    }
    const secure = toBool(this.getAttr('safeaction'));
    let ai = 0;
    for (const t of targets) {
      let action = ai < actions.length ? toStr(actions[ai]) : '';
      const ol = getObjectList(t, this);
      if (ol.length === 0 || (ol.length === 1 && ol[0] === null)) {
        if ((action === 'callback' || action === '') && typeof t === 'string') {
          if (secure) PerformSecureAction(this.id, true, action !== '' ? 1 : 0, t, mv);
          else host.callLua(t, mv, this, action !== '');
        }
      } else {
        if (action === '') action = (this.objFlags & OBJBIT_NOP) ? 'nop' : 'toggle';
        for (const o of ol) {
          if (!o) continue;
          if (action !== 'nop' && o.validateMessage(action)) {
            if (secure) PerformSecureAction(this.id, false, o.id, action, mv);
            else SendMessage(o, action, mv, this);
          }
        }
      }
      if (ai < actions.length) ai++;
    }
  }
  finalizeNearestObjectReferencesOf(attr: string) {
    let modified = false;
    const targets = toTokenList(this.getAttr(attr));
    for (let i = 0; i < targets.length; i++) {
      const r = finalizeNearestObjectReference(targets[i], this);
      if (r !== false) { targets[i] = r; modified = true; }
    }
    if (modified) {
      if (attr.startsWith('anchor')) this.setAttr(attr, targets[0]);
      else this.setAttr(attr, makeTokens(targets));
    }
  }
  finalizeNearestObjectReferences() {
    this.finalizeNearestObjectReferencesOf('target');
    this.finalizeNearestObjectReferencesOf('destination');
    this.finalizeNearestObjectReferencesOf('anchor1');
    this.finalizeNearestObjectReferencesOf('anchor2');
    const min = toInt(this.getAttr('$minState')), max = toInt(this.getAttr('$maxState'));
    for (let i = min; i <= max; i++) this.finalizeNearestObjectReferencesOf(`target_${i}`);
  }
  sendImpulse(dest: GridPos, dir: number) {
    const st = GetStone(dest);
    if (st) st.on_impulse({ sender: this, dest, dir, byWire: false });
  }
  transferName(target: GameObject | null) {
    if (!target) return;
    const v = this.getAttr('name');
    if (v !== undefined) {
      const name = toStr(v);
      UnnameObject(this);
      if (target.getAttr('name') !== undefined) UnnameObject(target);
      NameObject(target, name);
    }
  }
  transferIdentity(target: GameObject | null) {
    if (!target) return;
    this.transferName(target);
    for (const [k, v] of this.attribs) {
      if (k.startsWith('_') || k.startsWith('target') || k.startsWith('action')) target.setAttr(k, v);
    }
  }
  squareDistance(_o: GameObject): number { return 1e15; }
  isSouthOrEastOf(_o: GameObject): boolean { return true; }
  animcb() {}
  warning(msg: string) { host.log(`${this.getKind()}: ${msg}`); }
}

export function makeGroup(list: (GameObject | null)[]): VGroup {
  let d = '';
  for (const o of list) {
    if (!o) d += '#0,';
    else {
      const n = o.getAttr('name');
      if (typeof n === 'string' && n !== '') d += n + ',';
      else d += `#${o.id},`;
    }
  }
  return new VGroup(d);
}
export function objValue(o: GameObject | null): Value {
  if (!o) return new VObj(0, null);
  const n = o.getAttr('name');
  if (typeof n === 'string' && n !== '') return new VObj(o.id, n);
  return new VObj(o.id, null);
}
export function toObject(v: Value): GameObject | null {
  if (v instanceof VObj) return v.name !== null ? GetNamedObject(v.name) : GameObject.getObject(roundNearest(v.id));
  if (typeof v === 'string') return GetNamedObject(v);
  return null;
}
export function getObjectList(v: Value, reference: GameObject | null): (GameObject | null)[] {
  if (typeof v === 'string') {
    if (/[*?]/.test(v)) return GetNamedGroup(v, reference);
    if (v === '@') return [reference];
    return [toObject(v)];
  }
  if (v instanceof VObj) return [toObject(v)];
  if (v instanceof VGroup) {
    const out: (GameObject | null)[] = [];
    for (const s of v.desc.split(',')) {
      if (!s) continue;
      out.push(s[0] === '#' ? GameObject.getObject(parseInt(s.slice(1), 10) || 0) : GetNamedObject(s));
    }
    return out;
  }
  return [];
}
/** Value -> position (operator ecl::V2) */
export function toPosition(v: Value): V2 {
  if (v instanceof VPos) return new V2(v.x, v.y);
  if (v instanceof VObj || typeof v === 'string') {
    const o = toObject(v);
    if (o) {
      if (o instanceof GridObject) { const p = o.getOwnerPos(); return new V2(p.x, p.y); }
      if (o instanceof Actor) return o.ai.pos.clone();
    } else if (typeof v === 'string' || (v as VObj).name !== null) {
      return toPosition(GetNamedPosition(typeof v === 'string' ? v : (v as VObj).name!));
    }
  }
  return new V2(-1, -1);
}
export function centeredPos(v: Value): V2 {
  if (v instanceof VPos) return v.grid ? new V2(v.x + 0.5, v.y + 0.5) : new V2(v.x, v.y);
  if (v instanceof VObj || typeof v === 'string') {
    const o = toObject(v);
    if (o) {
      if (o instanceof GridObject) return o.getOwnerPos().center();
      if (o instanceof Actor) return o.ai.pos.clone();
    } else if (typeof v === 'string' || (v as VObj).name !== null) {
      return centeredPos(GetNamedPosition(typeof v === 'string' ? v : (v as VObj).name!));
    }
  }
  return new V2(-1, -1);
}
export function getPositionList(v: Value, reference: GameObject | null): Value[] {
  if (typeof v === 'string' && /[*?]/.test(v)) return GetNamedPositionList(v, reference);
  const t = vtype(v);
  if (t === VT.STRING || t === VT.OBJECT || t === VT.POSITION || t === VT.GRIDPOS) return [v];
  if (v instanceof VGroup) {
    const out: Value[] = [];
    for (const s of v.desc.split(',')) {
      if (!s) continue;
      out.push(s[0] === '#' ? objValue(GameObject.getObject(parseInt(s.slice(1), 10))) : GetNamedPosition(s));
    }
    return out;
  }
  return [];
}
function finalizeNearestObjectReference(v: Value, reference: GameObject): Value | false {
  if (typeof v === 'string' && !v.startsWith('@@') && v.startsWith('@') && /[*?]/.test(v)) {
    const r = GetNamedGroup(v, reference);
    if (r.length && r[0]) {
      const n = r[0].getAttr('name');
      if (typeof n === 'string' && n !== '') return new VObj(r[0].id, n);
    }
    return new VObj(0, null);
  }
  return false;
}
function maybeNearestObjectReference(v: Value): boolean {
  if (typeof v === 'string') return v.includes('@');
  if (v instanceof VObj) return v.name !== null && v.name.includes('@');
  if (v instanceof VGroup || v instanceof VTokens) return v.desc.includes('@');
  return false;
}

// ------------------------------------------------------------------ grid objects

export abstract class GridObject extends GameObject {
  pos = new GridPos(-1, -1);
  get_pos() { return this.pos; }
  isDisplayable() { return this.pos.x >= 0; }
  setOwner(player: number) { this.pos = new GridPos(-1, player); }
  getOwner(): Value { return this.pos.x === -1 && this.pos.y !== -1 ? this.pos.y : null; }
  setOwnerPos(po: GridPos) { this.pos = po.x >= 0 ? new GridPos(-2 - po.x, -2 - po.y) : new GridPos(po.x, po.y); }
  getOwnerPos(): GridPos { return this.pos.x <= -2 ? new GridPos(-2 - this.pos.x, -2 - this.pos.y) : this.pos; }
  abstract layer(): number;

  setAttr(key: string, val: Value) {
    if (key === 'connections' || key === 'faces') {
      let d = 0;
      const vs = toStr(val);
      if (vs.includes('n')) d |= NORTHBIT;
      if (vs.includes('e')) d |= EASTBIT;
      if (vs.includes('s')) d |= SOUTHBIT;
      if (vs.includes('w')) d |= WESTBIT;
      if (key === 'faces') d ^= ALL_DIRECTIONS;
      this.objectSetAttr('$connections', d);
      if (this.isDisplayable()) this.init_model();
    } else if (key === '$connections') {
      this.objectSetAttr('$connections', val);
      if (this.isDisplayable()) this.init_model();
    } else super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'connections' || key === 'faces') {
      const db = key === 'connections' ? this.getConnections() : this.getFaces();
      return (db & NORTHBIT ? 'n' : '') + (db & EASTBIT ? 'e' : '') + (db & SOUTHBIT ? 's' : '') + (db & WESTBIT ? 'w' : '');
    }
    return super.getAttr(key);
  }
  setState(s: number) {
    this.state = s;
    if (this.isDisplayable()) this.init_model();
  }
  getModelName(): string { return this.getClass(); }
  init_model() { this.set_model(this.getModelName()); }
  set_model(name: string) { display.setModel(this.layer(), this.pos.x, this.pos.y, name); }
  get_model(): Model | null { return display.getModel(this.layer(), this.pos.x, this.pos.y); }
  kill_model(p: GridPos) { display.killModel(this.layer(), p.x, p.y); }
  set_anim(name: string) {
    this.set_model(name);
    const m = this.get_model();
    if (m) m.setCallback(this);
  }
  getConnections(): number { const v = this.getAttr('$connections'); return v !== undefined ? toInt(v) : 0; }
  getFaces(_invisible = false): number { return ALL_DIRECTIONS ^ this.getConnections(); }
  on_creation(_p: GridPos) { this.init_model(); }
  on_removal(p: GridPos) {
    this.kill_model(p);
    if (this.objFlags & OBJBIT_PHOTOACTIV) this.deactivatePhoto();
  }
  creation(p: GridPos) { this.pos = p; this.on_creation(p); }
  removal(p: GridPos) { this.on_removal(p); this.pos = new GridPos(-1, -1); }
  actor_enter(_a: Actor) {}
  actor_leave(_a: Actor) {}
  sound_event(name: string, vol = 1.0): boolean {
    const c = this.pos.center();
    host.sound(name, c.x, c.y, vol);
    return true;
  }
  squareDistance(o: GameObject): number {
    if (this.isDisplayable()) {
      if (o instanceof Actor) { const a = o.ai.pos; return (a.x - this.pos.x) ** 2 + (a.y - this.pos.y) ** 2; }
      if (o instanceof GridObject && o.isDisplayable()) return (o.pos.x - this.pos.x) ** 2 + (o.pos.y - this.pos.y) ** 2;
    }
    return 1e15;
  }
  isSouthOrEastOf(o: GameObject): boolean {
    if (this.isDisplayable()) {
      if (o instanceof Actor) { const a = o.ai.pos; return a.y < this.pos.y || (a.y === this.pos.y && a.x < this.pos.x); }
      if (o instanceof GridObject && o.isDisplayable()) return o.pos.y < this.pos.y || (o.pos.y === this.pos.y && o.pos.x < this.pos.x);
      return true;
    }
    return false;
  }
  // lasers: photo sensors
  activatePhoto() { photoSensors.unshift(this); this.objFlags |= OBJBIT_PHOTOACTIV; }
  deactivatePhoto() {
    const i = photoSensors.indexOf(this);
    if (i >= 0) photoSensors.splice(i, 1);
    this.objFlags &= ~OBJBIT_PHOTOACTIV;
  }
  lightDirChanged(_o: number, _n: number) {}
  processLight(d: number) { this.objFlags |= toBits(d); }
  emissionDirections(): number { return 0; }
}
export const photoSensors: GridObject[] = [];

export const GRID_FLOOR = 0, GRID_ITEMS = 1, GRID_STONES = 2;

// ------------------------------------------------------------------ floors (floors.cc)

export abstract class Floor extends GridObject {
  friction = 0;
  adhesion = 0;
  forceX = 0; forceY = 0;
  layer() { return GRID_FLOOR; }
  getObjectType() { return FLOOR; }
  message(m: Message): Value {
    // fire is not ported: "heat", "ignite", "setfire", ... do nothing
    return super.message(m);
  }
  process_mouseforce(a: Actor, fx: number, fy: number): [number, number] {
    if (a.controlled_by(player.current)) { const ad = this.getAdhesion(); return [ad * fx, ad * fy]; }
    return [0, 0];
  }
  setAttr(key: string, val: Value) {
    if (key === 'adhesion') this.adhesion = toDouble(val);
    else if (key === 'friction') this.friction = toDouble(val);
    else if (key === 'force_x') this.forceX = toDouble(val);
    else if (key === 'force_y') this.forceY = toDouble(val);
    super.setAttr(key, val);
    if (key === 'faces' && this.isDisplayable()) this.init_model();
  }
  getAttr(key: string): Value {
    if (key === 'adhesion') return this.adhesion;
    if (key === 'friction') return this.friction;
    return super.getAttr(key);
  }
  on_creation(p: GridPos) {
    const ad = GridObject.prototype.getAttr.call(this, 'adhesion');
    if (ad !== undefined) this.adhesion = toDouble(ad);
    const fr = GridObject.prototype.getAttr.call(this, 'friction');
    if (fr !== undefined) this.friction = toDouble(fr);
    super.on_creation(p);
  }
  get_sink_speed(): [number, number] { return [0, 0]; }
  get_friction() { return this.friction; }
  getAdhesion() { return this.adhesion; }
  is_destructible() { return true; }
  is_freeze_check() { return toBool(this.getAttr('freeze_check')); }
  add_force(_a: Actor | null, f: V2) { f.x += this.forceX; f.y += this.forceY; }
  stone_change(_st: Stone | null) {
    if (toBool(this.getDefaultedAttr('floodable', false))) {
      SendMessage(GetFloor(this.pos), '_checkflood');
      for (let d = NORTH; d !== NODIR; d--) SendMessage(GetFloor(this.pos.move(d)), '_checkflood');
    }
  }
  actor_contact(_a: Actor) {}
  on_drop(_it: Item) {}
  on_pickup(_it: Item) {}
}

// ------------------------------------------------------------------ items (items.cc)

export const itf_none = 0, itf_static = 1, itf_indestructible = 2, itf_animation = 4, itf_invisible = 8,
  itf_inflammable = 16, itf_norespawn = 32, itf_fireproof = 64, itf_portable = 128, itf_freezable = 256;
export interface ItemTraits { name: string; flags: number; radius: number }
export const ITEM_DROP = 0, ITEM_KILL = 1, ITEM_KEEP = 2;

export abstract class Item extends GridObject {
  abstract traits(): ItemTraits;
  layer() { return GRID_ITEMS; }
  getObjectType() { return ITEM; }
  getClass() { return this.traits().name; }
  getAttr(key: string): Value {
    if (key === 'liftable') return !this.isStatic();
    if (key === 'portable') return this.isPortable();
    if (key === 'freezable') return this.isFreezable();
    return super.getAttr(key);
  }
  isStatic() { return (this.traits().flags & itf_static) !== 0; }
  isPortable() { return !this.isStatic() || (this.traits().flags & itf_portable) !== 0; }
  isFreezable() { return this.isPortable() || (this.traits().flags & itf_freezable) !== 0; }
  kill() { KillItem(this.pos); }
  replace(kind: string) {
    const n = MakeItem(kind);
    this.transferName(n);
    this.setup_successor(n);
    SetItem(this.pos, n);
  }
  transform(kind: string) {
    const n = MakeItem(kind);
    this.transferIdentity(n);
    SetItem(this.pos, n);
  }
  setup_successor(_n: Item) {}
  get_inventory_model(): string { return this.getKind(); }
  init_model() {
    const tr = this.traits();
    if (tr.flags & itf_invisible) this.set_model('invisible');
    else if (tr.flags & itf_animation) this.set_anim(tr.name);
    else this.set_model(tr.name);
  }
  stone_change(_st: Stone | null) {}
  on_stonehit(_st: Stone) {}
  getFriction(_pos: V2, def: number, _a: Actor): number { return def; }
  calcMouseforce(_a: Actor, _mx: number, _my: number, fx: number, fy: number): [number, number] { return [fx, fy]; }
  covers_floor(_pos: V2, _a: Actor): boolean { return false; }
  /** grid positions a flood spreads to through this item (vortex destinations) */
  warpSpreadPos(_isWater: boolean): GridPos[] { return []; }
  add_force(_a: Actor, _f: V2) {}
  on_drop(_a: Actor) {}
  drop(a: Actor, p: GridPos) { SetItem(p, this); this.on_drop(a); }
  on_pickup(_a: Actor) {}
  can_drop_at(p: GridPos) { return GetItem(p) === null; }
  activate(_a: Actor, _p: GridPos): number { return ITEM_DROP; }
  actor_hit(a: Actor): boolean {
    if (this.isStatic()) return false;
    const r = this.traits().radius !== 0 ? this.traits().radius : 0.3;
    const c = this.pos.center();
    return len(a.ai.pos.x - c.x, a.ai.pos.y - c.y) < r;
  }
}

// ------------------------------------------------------------------ stones (stones.cc)

export const MOVABLE_PERSISTENT = 0, MOVABLE_BREAKABLE = 1, MOVABLE_STANDARD = 2, MOVABLE_IRREGULAR = 3;
export const STONE_PASS = 0, STONE_REBOUND = 1;
export interface Impulse { sender: GameObject | null; dest: GridPos; dir: number; byWire: boolean }

export interface StoneContact {
  actor: Actor; stonepos: GridPos; stoneid: string; response: number; contact_point: V2; normal: V2;
  is_collision: boolean; ignore: boolean; new_collision: boolean; is_contact: boolean; outerCorner: boolean;
  faces: number; sound: string;
}
export function newContact(): StoneContact {
  return {
    actor: null as unknown as Actor, stonepos: new GridPos(), stoneid: '', response: STONE_REBOUND, contact_point: new V2(),
    normal: new V2(), is_collision: false, ignore: false, new_collision: false, is_contact: false, outerCorner: false,
    faces: 0, sound: '',
  };
}

export abstract class Stone extends GridObject {
  freezeCheckRunning = false;
  layer() { return GRID_STONES; }
  getObjectType() { return STONE; }
  /** MOVABLE_* of the stone's traits */
  movableTrait(): number { return MOVABLE_PERSISTENT; }
  collision_sound(): string { return 'stone'; }
  collision_response(_sc: StoneContact): number { return STONE_REBOUND; }
  is_movable(): boolean { return this.movableTrait() >= MOVABLE_STANDARD; }
  is_removable() { return true; }
  is_floating() { return false; }
  is_transparent(_d: number) { return this.is_floating(); }
  is_sticky(_a: Actor) { return !this.is_floating(); }
  allowsSpreading(_d: number, _flood = false) { return !this.is_floating(); }
  isConnectable(o: Stone | null) { return o !== null && o.getClass() === this.getClass(); }
  autoJoinCluster() {
    const p = this.pos;
    const my = this.getAttr('cluster');
    for (let d = WEST; d <= NORTH; d++) {
      const nb = GetStone(p.move(d));
      if (this.isConnectable(nb)) {
        const nc = nb!.getAttr('cluster');
        if (my !== undefined) {
          if (valueEquals(my, nc)) {
            this.setAttr('$connections', this.getConnections() | toBits(d));
            nb!.setAttr('$connections', nb!.getConnections() | toBits(reverseDir(d)));
          } else if (nc === undefined && (nb!.getConnections() & toBits(reverseDir(d)))) {
            this.setAttr('$connections', this.getConnections() | toBits(d));
          } else this.setAttr('$connections', this.getConnections() & (ALL_DIRECTIONS ^ toBits(d)));
        } else if (nc !== undefined) {
          if (this.getConnections() & toBits(d)) nb!.setAttr('$connections', nb!.getConnections() | toBits(reverseDir(d)));
          else nb!.setAttr('$connections', nb!.getConnections() & (ALL_DIRECTIONS ^ toBits(reverseDir(d))));
        }
      } else if (my !== undefined) this.setAttr('$connections', this.getConnections() & (ALL_DIRECTIONS ^ toBits(d)));
    }
  }
  autoLeaveCluster() {
    const p = this.pos;
    for (let d = WEST; d <= NORTH; d++) {
      const nb = GetStone(p.move(d));
      if (this.isConnectable(nb) && nb!.getAttr('cluster') !== undefined)
        nb!.setAttr('$connections', nb!.getConnections() & (ALL_DIRECTIONS ^ toBits(reverseDir(d))));
    }
  }
  actor_hit(sc: StoneContact) { if (this.is_movable()) maybe_push_stone(sc); }
  actor_touch(_sc: StoneContact) {}
  actor_inside(_a: Actor) {}
  actor_contact(_a: Actor) {}
  on_floor_change() {}
  on_creation(p: GridPos) {
    for (const o of getObjectList(this.getAttr('rubbers'), null)) SendMessage(o, '_recheck');
    super.on_creation(p);
  }
  transform(kind: string) {
    const n = MakeStone(kind);
    this.transferIdentity(n);
    SetStone(this.pos, n);
  }
  on_impulse(impulse: Impulse) {
    if (this.is_movable()) {
      const id = this.id;
      this.move_stone_dir(impulse.dir);
      if (GameObject.getObject(id)) this.propagateImpulse(impulse);
    }
  }
  propagateImpulse(impulse: Impulse) {
    if (!impulse.byWire) {
      for (const f of getObjectList(this.getAttr('fellows'), null)) {
        if (f instanceof Stone) f.on_impulse({ sender: this, dest: f.pos, dir: impulse.dir, byWire: true });
      }
    }
  }
  move_stone(newPos: GridPos, soundevent: string): boolean {
    if (this.isDisplayable()) {
      const p = this.pos;
      if (!GetStone(newPos)) {
        this.sound_event(soundevent);
        MoveStone(p, newPos);
        IncMoveCounter();
        if (this.on_move(p)) {
          const it = GetItem(newPos);
          if (it) it.on_stonehit(this);
        }
        return true;
      }
    }
    return false;
  }
  move_stone_dir(dir: number) { return this.move_stone(this.pos.move(dir), 'movesmall'); }
  on_move(_origin: GridPos): boolean {
    if (!this.is_floating()) ShatterActorsInsideField(this.pos);
    return true;
  }
  distortedVelocity(vx: number, vy: number, def = 1.0): [number, number] {
    const f = toDouble(this.getDefaultedAttr('hit_strength', def));
    const xx = toDouble(this.getDefaultedAttr('hit_distortion_xx', 1)), xy = toDouble(this.getAttr('hit_distortion_xy'));
    const yx = toDouble(this.getAttr('hit_distortion_yx')), yy = toDouble(this.getDefaultedAttr('hit_distortion_yy', 1));
    return [(xx * vx + xy * vy) * f, (yx * vx + yy * vy) * f];
  }
  freeze_check(): boolean { return false; }
}

export function maybe_push_stone(sc: StoneContact): boolean {
  if (sc.actor && !sc.actor.isMoribund()) {
    const dir = GetPushDirection(sc);
    if (dir !== NODIR) {
      sc.actor.sendImpulse(sc.stonepos, dir);
      return GetStone(sc.stonepos) === null;
    }
  }
  return false;
}

export function contact_face(sc: StoneContact): number {
  const n = sc.normal;
  if (n.x === -1 && n.y === 0) return WEST;
  if (n.x === 1 && n.y === 0) return EAST;
  if (n.x === 0 && n.y === -1) return NORTH;
  if (n.x === 0 && n.y === 1) return SOUTH;
  return NODIR;
}
export function GetPushDirection(sc: StoneContact): number {
  const ai = sc.actor.ai;
  const dir = contact_face(sc);
  if (dir !== NODIR && ai.vel.x * sc.normal.x + ai.vel.y * sc.normal.y < -4) return reverseDir(dir);
  return NODIR;
}

// ------------------------------------------------------------------ others (rubber bands, wires)

export abstract class Other extends GameObject {
  getObjectType() { return OTHER; }
  postAddition() {}
  preRemoval() {}
  tick(_dt: number) {}
}

// ------------------------------------------------------------------ actors (actors.cc)

export interface Contact { pos: V2; normal: V2 }
const MAX_CONTACTS = 10;
export class ActorInfo {
  pos = new V2(); vel = new V2(); forceacc = new V2(); force = new V2(); collforce = new V2(); pos_force = new V2();
  frozen_vel = new V2();
  gridpos = new GridPos(); last_gridpos = new GridPos(); field: Field | null = null;
  charge = 0; mass = 1; radius = 1; grabbed = false; created = false; ignore_contacts = false; friction = 0;
  contacts: Contact[] = []; last_contacts: Contact[] = [];
}
export interface ActorTraits { name: string; radius: number; mass: number }

export abstract class Actor extends GameObject {
  static readonly max_radius = 24.0 / 64;
  ai = new ActorInfo();
  sprite: SpriteHandle | null = null;
  startingpos = new V2(); respawnpos = new V2();
  flagRespawn = false; centerRespawn = true; inplaceRespawn = false; spikes = false; firstGridStep = false;
  controllers = 0; adhesion = 0;
  left: Actor | null = null; right: Actor | null = null;

  constructor(tr: ActorTraits) {
    super();
    this.setAttr('adhesion', 0.0);
    this.ai.mass = Math.fround(tr.mass);
    this.ai.radius = Math.fround(tr.radius);
  }
  protected afterClone() {
    const o = this.ai;
    const n = new ActorInfo();
    Object.assign(n, o);
    n.pos = o.pos.clone(); n.vel = o.vel.clone(); n.forceacc = o.forceacc.clone(); n.force = o.force.clone();
    n.collforce = o.collforce.clone(); n.pos_force = o.pos_force.clone(); n.frozen_vel = o.frozen_vel.clone();
    n.contacts = []; n.last_contacts = [];
    this.ai = n;
    this.startingpos = this.startingpos.clone(); this.respawnpos = this.respawnpos.clone();
  }
  abstract traits(): ActorTraits;
  can_be_warped(): boolean { return false; }
  getObjectType() { return ACTOR; }
  get_pos() { return this.ai.pos; }
  get_gridpos() { return this.ai.gridpos; }
  setAttr(key: string, val: Value) {
    if (key === 'controllers') this.controllers = toInt(val);
    else if (key === 'adhesion') this.adhesion = toDouble(val);
    else if (key === 'charge') this.ai.charge = toDouble(val);
    else this.objectSetAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'controllers') return this.controllers;
    if (key === 'adhesion') return this.adhesion;
    if (key === 'charge') return this.ai.charge;
    if (key === 'mass') return this.ai.mass;
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === '_freeze') { this.ai.frozen_vel = this.ai.vel.clone(); this.ai.vel = new V2(); }
    else if (m.message === '_revive') { this.ai.vel = this.ai.frozen_vel.clone(); }
    else if (m.message === '_update_mass') {
      if (valueEquals(this.getAttr('owner'), m.value)) {
        this.ai.mass = Math.fround(this.traits().mass) + toDouble(player.inventory(toInt(m.value)).getAttr('mass'));
      }
    } else if (m.message === '_update_pin') {
      if (valueEquals(this.getAttr('owner'), m.value)) this.spikes = player.inventory(toInt(m.value)).find('it_pin') !== -1;
    }
    return super.message(m);
  }
  get_controllers() { return this.controllers; }
  controlled_by(pl: number) { return (this.controllers & (1 + pl)) !== 0; }
  get_mouseforce() { return this.adhesion; }
  has_spikes() { return this.spikes; }
  has_shield() { return false; }
  abstract is_dead(): boolean;
  isMoribund() { return this.is_dead(); }
  is_movable() { return true; }
  is_flying() { return false; }
  is_on_floor() { return true; }
  is_drunken() { return false; }
  is_invisible() { return false; }
  can_drop_items() { return false; }
  can_pickup_items() { return false; }
  isSteerable() { return true; }
  on_collision(_a: Actor): boolean { return false; }
  beforeStoneBounce(_sc: StoneContact) {}
  afterStoneBounce(_sc: StoneContact) {}
  think(_dt: number) {
    const f = this.ai.field;
    if (f) {
      const fl = f.floor, it = f.item;
      const covers = !!it && it.covers_floor(this.ai.pos, this);
      if (!covers && fl && this.is_on_floor()) fl.actor_contact(this);
    }
  }
  set_respawnpos(p: V2) { this.respawnpos = p.clone(); this.flagRespawn = true; }
  remove_respawnpos() { this.flagRespawn = false; }
  find_respawnpos() {}
  get_respawnpos() { return this.flagRespawn ? this.respawnpos : this.startingpos; }
  respawn() {
    let p = this.startingpos.clone();
    if (this.flagRespawn || server.AutoRespawn) {
      if (this.inplaceRespawn) p = this.respawnpos.clone();
      else if (this.centerRespawn) p = GridPos.of(this.respawnpos).center();
      else {
        p = this.respawnpos.clone();
        const gp = GridPos.of(this.respawnpos);
        const dx = this.respawnpos.x - gp.x, dy = this.respawnpos.y - gp.y;
        if (dx > 0.28 && dx < 0.5) p.x = gp.x + 0.28; else if (dx < 0.72 && dx >= 0.5) p.x = gp.x + 0.72;
        if (dy > 0.28 && dy < 0.5) p.y = gp.y + 0.28; else if (dy < 0.72 && dy >= 0.5) p.y = gp.y + 0.72;
      }
    }
    this.warp(p);
    this.on_respawn(p);
  }
  add_force(fx: number, fy: number) { this.ai.forceacc.x += fx; this.ai.forceacc.y += fy; }
  init() { this.sprite = display.addSprite(this.ai.pos, null); }
  on_creation(p: V2) {
    if (!this.ai.created) {
      this.ai.created = true;
      this.startingpos = this.ai.pos.clone();
      const vx = this.getAttr('velocity_x');
      if (vx !== undefined) this.ai.vel = new V2(toDouble(vx), this.ai.vel.y);
      const vy = this.getAttr('velocity_y');
      if (vy !== undefined) this.ai.vel = new V2(this.ai.vel.x, toDouble(vy));
    }
    if (!this.sprite) this.init();
    this.set_model(this.getKind());
    this.sprite!.move(p);
    this.move();
  }
  on_respawn(_p: V2) { this.centerRespawn = true; }
  warp(newpos: V2) {
    this.ai.pos = newpos.clone();
    world.did_move_actor(this);
    this.ai.vel = new V2();
    this.sprite?.move(newpos);
    this.move();
    for (const o of getObjectList(this.getAttr('rubbers'), null)) SendMessage(o, '_recheck');
  }
  move() {
    const ai = this.ai;
    if (ai.field) {
      if (!ai.gridpos.eq(ai.last_gridpos)) {
        this.firstGridStep = true;
        const of = world.getField(ai.last_gridpos);
        if (of) { if (of.floor) of.floor.actor_leave(this); if (of.item) of.item.actor_leave(this); }
        if (ai.field.floor) ai.field.floor.actor_enter(this);
        if (ai.field.item) ai.field.item.actor_enter(this);
      }
      const it = ai.field.item;
      if (it && it.actor_hit(this)) player.pickupItem(this, ai.gridpos);
      const st = ai.field.stone;
      if (st) st.actor_inside(this);
      if (this.firstGridStep && !this.is_flying()) this.firstGridStep = false;
      else if (!this.flagRespawn && !this.isMoribund() && !this.is_flying()) {
        const fl = ai.field.floor;
        if (fl && fl.getAdhesion() !== 0) this.respawnpos = ai.pos.clone();
      }
    }
    ai.last_gridpos = ai.gridpos;
  }
  move_screen() { this.sprite?.move(this.ai.pos); }
  set_model(name: string) { this.sprite?.replace(display.makeModel(name)); }
  set_anim(name: string) { this.set_model(name); this.sprite?.setCallback(this); }
  hide() { this.sprite?.hide(); }
  show() { this.sprite?.show(); }
  can_move(): boolean {
    const st = GetStone(this.ai.gridpos);
    if (st) {
      if (!server.NoCollisions || !isMarbleOrPearl(this)) return !st.is_sticky(this);
    }
    return true;
  }
  sound_event(name: string, vol = 1.0) { host.sound(name, this.ai.pos.x, this.ai.pos.y, vol); return true; }
  squareDistance(o: GameObject): number {
    if (o instanceof Actor) return (this.ai.pos.x - o.ai.pos.x) ** 2 + (this.ai.pos.y - o.ai.pos.y) ** 2;
    return o.squareDistance(this);
  }
  isSouthOrEastOf(o: GameObject): boolean {
    if (o instanceof Actor) return this.ai.pos.y > -o.ai.pos.y || (this.ai.pos.y === o.ai.pos.y && this.ai.pos.x > -o.ai.pos.x);
    return !o.isSouthOrEastOf(this);
  }
}
const MARBLE_TRAITS = new Set(['ac_marble_white', 'ac_marble_black', 'ac_marble_glass', 'ac_pearl_white', 'ac_pearl_black']);
export function isMarbleOrPearl(a: Actor) { return MARBLE_TRAITS.has(a.traits().name); }

// ------------------------------------------------------------------ ecl::Dict (named objects)

/** ecl::hash: the PJW/ELF hash on signed chars */
export function eclHash(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    let c = key.charCodeAt(i) & 0xff;
    if (c > 127) c -= 256;
    h = ((h << 4) + c) >>> 0;
    const g = h & 0xf0000000;
    if (g !== 0) { h = (h ^ (g >>> 24)) >>> 0; h = (h ^ g) >>> 0; }
  }
  return h >>> 0;
}
export class Dict<T> {
  buckets: { key: string; val: T; next: unknown }[][];
  constructor(size = 257) { this.buckets = Array.from({ length: size }, () => []); }
  private b(key: string) { return this.buckets[eclHash(key) % this.buckets.length]; }
  find(key: string): T | undefined { for (const e of this.b(key)) if (e.key === key) return e.val; return undefined; }
  has(key: string) { return this.b(key).some((e) => e.key === key); }
  insert(key: string, val: T) { this.b(key).unshift({ key, val, next: null }); }
  remove(key: string) { const b = this.b(key); const i = b.findIndex((e) => e.key === key); if (i >= 0) b.splice(i, 1); }
  *entries(): Generator<[string, T]> { for (const b of this.buckets) for (const e of b) yield [e.key, e.val]; }
  clear() { for (const b of this.buckets) b.length = 0; }
}

/** ecl::string_match: '?' any character, '*' any sequence */
export function stringMatch(str: string, templ: string): boolean {
  let si = 0, ti = 0;
  for (;;) {
    const t = ti < templ.length ? templ[ti++] : '';
    const s = si < str.length ? str[si++] : '';
    if (t === s) { if (!t) return true; continue; }
    if (t === '?') { if (!s) return false; continue; }
    if (t !== '*') return false;
    const t2 = ti < templ.length ? templ[ti++] : '';
    if (!t2) return true;
    let sc = s;
    for (;;) {
      if (!sc) return false;
      if (sc === t2 && stringMatch(str.slice(si), templ.slice(ti))) return true;
      sc = si < str.length ? str[si++] : '';
    }
  }
}

// ------------------------------------------------------------------ the world (world.cc)

export class Field { floor: Floor | null = null; item: Item | null = null; stone: Stone | null = null; }

export const ActorTimeStep = 0.0025;
const contact_e = 0.02;
let restTime = 0; // a static of World::move_actors: it survives level changes

interface PendingAction { senderId: number; isCallback: boolean; targetId: number; name: string; val: Value }
export interface TimeHandler { tick?(dt: number): void; alarm(): void; distinguished_alarm?(n: number): void }

class Alarm {
  handler: TimeHandler; interval: number; timeleft: number; repeatp: boolean; removed = false; alarmnr: number;
  constructor(h: TimeHandler, i: number, r: boolean, n: number) { this.handler = h; this.interval = i; this.timeleft = i; this.repeatp = r; this.alarmnr = n; }
  tick(dt: number) {
    if (this.removed) return;
    this.timeleft -= dt;
    if (this.repeatp) {
      while (this.timeleft <= 0) { this.handler.distinguished_alarm?.(this.alarmnr); this.handler.alarm(); this.timeleft += this.interval; }
    } else if (this.timeleft <= 0) { this.handler.distinguished_alarm?.(this.alarmnr); this.handler.alarm(); }
  }
  expired() { return this.removed || this.timeleft <= 0; }
}
export class Timer {
  handlers: (TimeHandler | null)[] = [];
  alarms: Alarm[] = [];
  activate(th: TimeHandler) { if (!this.handlers.includes(th)) this.handlers.push(th); }
  deactivate(th: TimeHandler) { const i = this.handlers.indexOf(th); if (i >= 0) this.handlers[i] = null; }
  set_alarm(th: TimeHandler, interval: number, repeatp = false, alarmnr = 0) {
    if (!(interval > 0)) throw new XLevelRuntime('Timer error: timer with interval <= 0 seconds');
    if (repeatp && interval < 0.01) throw new XLevelRuntime('Timer error: looping timer with interval < 0.01 seconds');
    this.alarms.push(new Alarm(th, interval, repeatp, alarmnr));
  }
  remove_alarm(th: TimeHandler, alarmnr = 0): number {
    let left = 0;
    for (const a of this.alarms) if (a.handler === th && a.alarmnr === alarmnr) { a.removed = true; left = a.timeleft; }
    return left;
  }
  tick(dt: number) {
    this.handlers = this.handlers.filter((h) => h !== null);
    for (const h of this.handlers.slice()) if (h) h.tick?.(dt);
    // alarms added during the tick are ticked too (std::list iteration)
    for (let i = 0; i < this.alarms.length; i++) this.alarms[i].tick(dt);
    this.alarms = this.alarms.filter((a) => !a.expired());
  }
  clear() { this.handlers = []; this.alarms = []; }
}
export const GameTimer = new Timer();

export class World {
  w = 20; h = 13;
  fields: Field[] = [];
  actorlist: Actor[] = [];
  others: Other[] = [];
  rubberbands: { applyForces(dt: number): void }[] = [];
  leftmost: Actor | null = null; rightmost: Actor | null = null;
  objnames = new Dict<GameObject>();
  namedPositions = new Dict<Value>();
  changedStones: GridPos[] = [];
  actionList: PendingAction[] = [];
  collisionCriticalPositions: GridPos[] = [];
  registerCriticalPositions = false;
  scrambles: { pos: GridPos; dir: number; intensity: number }[] = [];
  scrambleIntensity = 10;
  numMeditatists = 0; indispensableHollows = 0; engagedIndispensableHollows = 0; engagedDispensableHollows = 0;
  preparing = true;
  mouseForce = new V2();
  forces: { globalForce(a: Actor): V2; tick(dt: number): void }[] = [];

  resize(w: number, h: number) {
    this.w = w; this.h = h;
    this.fields = Array.from({ length: w * h }, () => new Field());
  }
  getField(p: GridPos): Field | null {
    if (p.x < 0 || p.y < 0 || p.x >= this.w || p.y >= this.h) return null;
    return this.fields[p.y * this.w + p.x];
  }
  isBorder(p: GridPos) { return p.x === 0 || p.y === 0 || p.x === this.w - 1 || p.y === this.h - 1; }

  // ----- named objects
  getNamed(name: string): GameObject | null {
    let w = name;
    if (w.startsWith('@')) w = w.slice(1);
    if (w.startsWith('@')) w = w.slice(1);
    return this.objnames.find(w) ?? null;
  }
  getGroup(tmpl: string, reference: GameObject | null): (GameObject | null)[] {
    const result: (GameObject | null)[] = [];
    let pattern = tmpl;
    let nearest = false;
    let mindist = -1;
    if (pattern.startsWith('@')) {
      pattern = pattern.slice(1);
      if (pattern.length === 0) return [reference];
      if (pattern.startsWith('@')) pattern = pattern.slice(1);
      if (reference) nearest = true;
    }
    for (const [k, o] of this.objnames.entries()) {
      if (!stringMatch(k, pattern)) continue;
      if (!nearest || mindist < 0) {
        result.push(o);
        if (nearest) mindist = reference!.squareDistance(o);
      } else {
        const nd = reference!.squareDistance(o);
        if (mindist > nd || (mindist === nd && o.isSouthOrEastOf(result[result.length - 1]!))) {
          result.pop(); result.push(o); mindist = nd;
        }
      }
    }
    return result;
  }
  nameObject(obj: GameObject, name: string) {
    const old = this.getNamed(name);
    if (old) this.unname(old);
    let unique = name;
    if (name.endsWith('#')) {
      let i: number;
      for (i = IntegerRand(1, 999999); this.getNamed(name + i) !== null; i = IntegerRand(1, 999999));
      unique = name + i;
    }
    this.objnames.insert(unique, obj);
    obj.objectSetAttr('name', unique);
  }
  unname(obj: GameObject) {
    const v = obj.getAttr('name');
    if (v !== undefined) {
      this.objnames.remove(toStr(v));
      obj.objectSetAttr('name', null);
    }
  }

  // ----- actors
  add_actor(a: Actor, pos: V2) {
    this.actorlist.push(a);
    a.ai.pos = pos.clone();
    a.ai.gridpos = GridPos.of(pos);
    a.ai.field = this.getField(a.ai.gridpos);
    const oldright = this.rightmost;
    a.left = oldright; a.right = null;
    this.rightmost = a;
    if (!this.leftmost) this.leftmost = a;
    if (oldright) { oldright.right = a; this.did_move_actor(a); }
    if (!this.preparing) a.on_creation(pos);
    const id = a.traits().name;
    if (id === 'ac_pearl_white' || id === 'ac_pearl_black') ChangeMeditation(1, 0, 0, 0);
  }
  yield_actor(a: Actor): Actor | null {
    const i = this.actorlist.indexOf(a);
    if (i < 0) return null;
    this.actorlist.splice(i, 1);
    if (!a.left) this.leftmost = a.right; else a.left.right = a.right;
    if (!a.right) this.rightmost = a.left; else a.right.left = a.left;
    a.left = a.right = null;
    a.ai.grabbed = true;
    return a;
  }
  did_move_actor(a: Actor) {
    a.ai.gridpos = GridPos.of(a.ai.pos);
    a.ai.field = this.getField(a.ai.gridpos);
    const ax = a.ai.pos.x;
    const oldL = a.left, oldR = a.right;
    let newL = oldL, newR = oldR;
    while (newL && newL.ai.pos.x > ax) newL = newL.left;
    while (newR && newR.ai.pos.x < ax) newR = newR.right;
    if (newL !== oldL || newR !== oldR) {
      if (!oldL) { this.leftmost = oldR; oldR!.left = null; }
      else if (!oldR) { this.rightmost = oldL; oldL.right = null; }
      else { oldL.right = oldR; oldR.left = oldL; }
      if (newL !== oldL) {
        if (!newL) { a.left = null; a.right = this.leftmost; this.leftmost!.left = a; this.leftmost = a; }
        else { a.left = newL; a.right = newL.right; newL.right = a; a.right!.left = a; }
      } else if (newR !== oldR) {
        if (!newR) { a.right = null; a.left = this.rightmost; this.rightmost!.right = a; this.rightmost = a; }
        else { a.right = newR; a.left = newR.left; newR.left = a; a.left!.right = a; }
      }
    }
  }

  // ----- the tick (World::tick)
  tick(dtime: number) {
    this.move_actors(dtime);
    // stone changes reported while these are handled are dropped by changed_stones.clear(), as in the original
    const changed = this.changedStones;
    const nchanged = changed.length;
    for (let i = 0; i < nchanged; i++) this.stone_change(changed[i]);
    this.changedStones = [];
    this.mouseForce = new V2();
    for (const f of this.forces) f.tick(dtime);
    GameTimer.tick(dtime);
    lightHooks.performRecalc(false);
    this.doPerformPendingActions();
    for (const a of this.actorlist.slice()) {
      const it = a.ai.field?.item;
      if (it && it.getClass() === 'it_laserbeam') it.actor_hit(a);
    }
  }
  doPerformPendingActions() {
    const list = this.actionList;
    for (let i = 0; i < list.length; i++) {
      const ac = list[i];
      if (ac.isCallback) host.callLua(ac.name, ac.val, GameObject.getObject(ac.senderId), ac.targetId !== 0);
      else SendMessage(GameObject.getObject(ac.targetId), ac.name, ac.val, GameObject.getObject(ac.senderId));
    }
    this.actionList = [];
  }
  stone_change(p: GridPos) {
    const f = this.getField(p);
    if (!f) return;
    let st = f.stone;
    if (st) { st.on_floor_change(); st = f.stone; }
    if (st) { st.freeze_check(); st = f.stone; }
    if (f.item) f.item.stone_change(st);
    if (f.floor) f.floor.stone_change(st);
    for (const d of [NORTH, SOUTH, EAST, WEST]) { const s = GetStone(p.move(d)); if (s) s.freeze_check(); }
    lightHooks.maybeRecalc(p);
  }

  // ----- forces
  drunkenMouseforce(a: Actor, mx: number, my: number): [number, number] {
    if (a.get_controllers() !== 0 && a.is_drunken()) {
      const t1 = Math.trunc(server.LevelTime);
      const base1 = (t1 * 3.1415926535) % 2.0 - 1.0;
      const t2 = Math.trunc(5.0 * server.LevelTime);
      const base2 = (t2 * 3.1415926535) % 2.0 - 1.0;
      const angle = Math.PI * (0.3 * base1 + 0.15 * base2);
      return [mx * Math.cos(angle) - my * Math.sin(angle), mx * Math.sin(angle) + my * Math.cos(angle)];
    }
    return [mx, my];
  }
  getMouseForce(a: Actor): [number, number] {
    if (a.is_flying() || a.is_dead()) return [0, 0];
    const f = a.get_mouseforce();
    return [this.mouseForce.x * f, this.mouseForce.y * f];
  }
  get_local_force(a: Actor): V2 {
    const f = new V2();
    let mx = 0, my = 0;
    let friction = 0;
    if (a.is_on_floor()) {
      const fl = a.ai.field!.floor;
      if (fl) {
        if (a.get_controllers() !== 0) { const [fx, fy] = this.getMouseForce(a); [mx, my] = fl.process_mouseforce(a, fx, fy); }
        friction = fl.get_friction();
        fl.add_force(a, f);
      }
      const it = a.ai.field!.item;
      if (it) {
        friction = it.getFriction(a.ai.pos, friction, a);
        if (a.get_controllers() !== 0) { const [fx, fy] = this.getMouseForce(a); [mx, my] = it.calcMouseforce(a, fx, fy, mx, my); }
        it.add_force(a, f);
      }
    }
    a.ai.friction = friction;
    const [dx, dy] = this.drunkenMouseforce(a, mx, my);
    f.x += dx; f.y += dy;
    return f;
  }
  get_global_force(a: Actor): V2 {
    const f = new V2(server.ConstantForce.x, server.ConstantForce.y);
    const q = a.ai.charge;
    if (q) {
      for (const a2 of this.actorlist) {
        if (a2 === a) continue;
        const q2 = a2.ai.charge;
        if (q2) {
          let dx = a.ai.pos_force.x - a2.ai.pos_force.x, dy = a.ai.pos_force.y - a2.ai.pos_force.y;
          const dist = len(dx, dy);
          if (dist) {
            dx /= dist; dy /= dist;
            const k = server.ElectricForce * q * q2 / dist;
            f.x += k * dx; f.y += k * dy;
          }
        }
      }
    }
    for (const ff of this.forces) { const g = ff.globalForce(a); f.x += g.x; f.y += g.y; }
    return f;
  }

  // ----- collisions
  find_contact_with_stone(a: Actor, p: GridPos, c: StoneContact, winFacesActorStone: number, isRounded = true, st: Stone | null = null) {
    c.is_contact = false;
    c.faces = NODIRBIT;
    c.outerCorner = false;
    let isInnerContact = false;
    const stone = st ?? GetStone(p);
    if (!stone) return;
    const isWindow = stone.getClass() === 'st_window';
    let wsides = NODIRBIT;
    if (isWindow) wsides = stone.getFaces(a.is_invisible());
    const ai = a.ai;
    const r = ai.radius;
    const x = p.x, y = p.y;
    const ax = ai.pos.x, ay = ai.pos.y;
    const erad_const = 2.0 / 32;
    const erad_window_const = 1.5 / 32;
    const cdist = isWindow ? erad_window_const : erad_const;
    const erad = isRounded ? cdist : 0.0;

    if (ax >= x && ax < x + 1 && ay >= y && ay < y + 1) {
      if (isWindow) {
        const xcorner = ax >= x + 0.5 ? 1 : 0;
        const ycorner = ay >= y + 0.5 ? 1 : 0;
        const xoff = ax < x + erad_window_const ? -1 : (ax > x + 1 - erad_window_const ? 1 : 0);
        const yoff = ay < y + erad_window_const ? -1 : (ay > y + 1 - erad_window_const ? 1 : 0);
        let face = NODIRBIT;
        if (!xcorner && yoff) face = WESTBIT;
        else if (xcorner && yoff) face = EASTBIT;
        else if (!ycorner && xoff) face = NORTHBIT;
        else if (ycorner && xoff) face = SOUTHBIT;
        const neighbour = GetStone(new GridPos(x + xoff, y + yoff));
        const faceN = neighbour && neighbour.getClass() === 'st_window' ? neighbour.getFaces(a.is_invisible()) : NODIRBIT;
        if ((winFacesActorStone & face) && !(faceN & face)) {
          const cx = [cdist, -cdist];
          const cornerX = x + xcorner + cx[xcorner], cornerY = y + ycorner + cx[ycorner];
          let bx = ax - cornerX, by = ay - cornerY;
          if (Math.abs(Math.abs(bx) - Math.abs(by)) < 1.0e-7) by = by >= 0 ? Math.abs(bx) : -Math.abs(bx);
          const lb = len(bx, by);
          c.is_contact = lb - r - cdist < contact_e;
          c.normal = new V2(bx / lb, by / lb);
          c.faces = face;
          c.contact_point = new V2(cornerX + c.normal.x * cdist, cornerY + c.normal.y * cdist);
          isInnerContact = true;
        } else if ((winFacesActorStone & SOUTHBIT) && ay > y + 1 - 2 * erad_window_const - r - contact_e) {
          c.contact_point = new V2(ax, y + 1 - 2 * erad_window_const); c.normal = new V2(0, -1); c.faces = SOUTHBIT;
          c.is_contact = true; isInnerContact = true;
        } else if ((winFacesActorStone & NORTHBIT) && ay <= y + 2 * erad_window_const + r + contact_e) {
          c.contact_point = new V2(ax, y + 2 * erad_window_const); c.normal = new V2(0, 1); c.faces = NORTHBIT;
          c.is_contact = true; isInnerContact = true;
        } else if ((winFacesActorStone & WESTBIT) && ax <= x + 2 * erad_window_const + r + contact_e) {
          c.contact_point = new V2(x + 2 * erad_window_const, ay); c.normal = new V2(1, 0); c.faces = WESTBIT;
          c.is_contact = true; isInnerContact = true;
        } else if ((winFacesActorStone & EASTBIT) && ax > x + 1 - 2 * erad_window_const - r - contact_e) {
          c.contact_point = new V2(x + 1 - 2 * erad_window_const, ay); c.normal = new V2(-1, 0); c.faces = EASTBIT;
          c.is_contact = true; isInnerContact = true;
        }
      }
    } else if (ax >= x + erad && ax < x + 1 - erad &&
      (!isWindow || (ay > y + 1 && (wsides & SOUTHBIT)) || (ay < y && (wsides & NORTHBIT)) ||
        ax <= x + erad_window_const || ax >= x + 1 - erad_window_const)) {
      let dist = r + 5;
      if (ay > y + 1) { c.contact_point = new V2(ax, y + 1); c.normal = new V2(0, 1); c.faces = SOUTHBIT; dist = ay - (y + 1); }
      else if (ay < y) { c.contact_point = new V2(ax, y); c.normal = new V2(0, -1); c.faces = NORTHBIT; dist = y - ay; }
      c.is_contact = dist - r < contact_e;
      if (isWindow && ((ay > y + 1 && !(wsides & SOUTHBIT)) || (ay < y && !(wsides & NORTHBIT))))
        c.faces = ax <= x + erad_window_const ? WESTBIT : EASTBIT;
    } else if (ay >= y + erad && ay < y + 1 - erad &&
      (!isWindow || (ax > x + 1 && (wsides & EASTBIT)) || (ax < x && (wsides & WESTBIT)) ||
        ay <= y + erad_window_const || ay >= y + 1 - erad_window_const)) {
      let dist = r + 5;
      if (ax > x + 1) { c.contact_point = new V2(x + 1, ay); c.normal = new V2(1, 0); c.faces = EASTBIT; dist = ax - (x + 1); }
      else if (ax < x) { c.contact_point = new V2(x, ay); c.normal = new V2(-1, 0); c.faces = WESTBIT; dist = x - ax; }
      c.is_contact = dist - r < contact_e;
      if (isWindow && ((ax > x + 1 && !(wsides & EASTBIT)) || (ax < x && !(wsides & WESTBIT))))
        c.faces = ay <= y + erad_window_const ? NORTHBIT : SOUTHBIT;
    } else if (!isWindow || !(
      (ax > x + cdist && ax < x + 0.5 && (wsides & WESTBIT) && (winFacesActorStone & WESTBIT)) ||
      (ax >= x + 0.5 && ax < x + 1 - cdist && (wsides & EASTBIT) && (winFacesActorStone & EASTBIT)) ||
      (ay > y + cdist && ay < y + 0.5 && (wsides & NORTHBIT) && (winFacesActorStone & NORTHBIT)) ||
      (ay >= y + 0.5 && ay < y + 1 - cdist && (wsides & SOUTHBIT) && (winFacesActorStone & SOUTHBIT)))) {
      const xcorner = ax >= x + 0.5 ? 1 : 0;
      const ycorner = ay >= y + 0.5 ? 1 : 0;
      const cx = [cdist, -cdist];
      const cornerX = x + xcorner + cx[xcorner], cornerY = y + ycorner + cx[ycorner];
      let bx = ax - cornerX, by = ay - cornerY;
      if (Math.abs(Math.abs(bx) - Math.abs(by)) < 1.0e-7) by = by >= 0 ? Math.abs(bx) : -Math.abs(bx);
      const lb = len(bx, by);
      c.is_contact = lb - r - cdist < contact_e;
      c.normal = new V2(bx / lb, by / lb);
      c.contact_point = new V2(cornerX + c.normal.x * cdist, cornerY + c.normal.y * cdist);
      if (!isWindow) {
        if (Math.abs(bx) >= Math.abs(by)) c.faces |= bx < 0 ? WESTBIT : EASTBIT;
        else if (Math.abs(by) >= Math.abs(bx)) c.faces |= by < 0 ? NORTHBIT : SOUTHBIT;
      } else {
        if (!xcorner && (bx > 0 || (!ycorner && !(wsides & NORTHBIT)) || (ycorner && !(wsides & SOUTHBIT)) || Math.abs(bx) >= Math.abs(by))) c.faces |= WESTBIT;
        if (xcorner && (bx < 0 || (!ycorner && !(wsides & NORTHBIT)) || (ycorner && !(wsides & SOUTHBIT)) || Math.abs(bx) >= Math.abs(by))) c.faces |= EASTBIT;
        if (ycorner && (by < 0 || (!xcorner && !(wsides & WESTBIT)) || (xcorner && !(wsides & EASTBIT)) || Math.abs(by) >= Math.abs(bx))) c.faces |= SOUTHBIT;
        if (!ycorner && (by > 0 || (!xcorner && !(wsides & WESTBIT)) || (xcorner && !(wsides & EASTBIT)) || Math.abs(by) >= Math.abs(bx))) c.faces |= NORTHBIT;
      }
      c.outerCorner = true;
    }
    if (c.is_contact) {
      if (!isInnerContact && ax >= x && ax < x + 1 && ay >= y && ay < y + 1) c.is_collision = false;
      else c.is_collision = c.normal.x * ai.vel.x + c.normal.y * ai.vel.y < 0;
      c.ignore = false;
      c.actor = a;
      c.stonepos = p;
      c.stoneid = stone.getClass();
      c.response = stone.collision_response(c);
      c.sound = stone.collision_sound();
    }
  }

  find_contact_with_edge(a: Actor, p0: GridPos, p1: GridPos, p2: GridPos, c0: StoneContact, c1: StoneContact, c2: StoneContact, win: number) {
    const s0 = GetStone(p0), s1 = GetStone(p1), s2 = GetStone(p2);
    if (s0) c0.response = s0.collision_response(c0);
    if (s1) c1.response = s1.collision_response(c1);
    if (s2) c2.response = s2.collision_response(c2);
    const vel = a.ai.vel;
    if (s1 && s2 && c1.response === STONE_REBOUND && c2.response === STONE_REBOUND) {
      this.find_contact_with_stone(a, p1, c1, win, false, s1);
      this.find_contact_with_stone(a, p2, c2, win, false, s2);
    } else if (s0 && s1 && c0.response === STONE_REBOUND && c1.response === STONE_REBOUND) {
      this.find_contact_with_stone(a, p1, c1, win, false, s1);
      if (c1.normal.x * vel.x + c1.normal.y * vel.y >= 0) this.find_contact_with_stone(a, p0, c0, win, true, s0);
      this.find_contact_with_stone(a, p2, c2, win, true, s2);
    } else if (s0 && s2 && c0.response === STONE_REBOUND && c2.response === STONE_REBOUND) {
      this.find_contact_with_stone(a, p2, c2, win, false, s2);
      if (c2.normal.x * vel.x + c2.normal.y * vel.y >= 0) this.find_contact_with_stone(a, p0, c0, win, true, s0);
      this.find_contact_with_stone(a, p1, c1, win, true, s1);
    } else {
      if (s0) this.find_contact_with_stone(a, p0, c0, win, true, s0);
      if (s1) this.find_contact_with_stone(a, p1, c1, win, true, s1);
      if (s2) this.find_contact_with_stone(a, p2, c2, win, true, s2);
    }
  }

  find_contact_with_window(a: Actor, p: GridPos, c0: StoneContact, c1: StoneContact, faces: number) {
    if (faces === NODIRBIT) return;
    if (faces & WESTBIT) this.find_contact_with_stone(a, p, c0, WESTBIT);
    if ((faces & EASTBIT) && !c0.is_contact) this.find_contact_with_stone(a, p, c0, EASTBIT);
    if (faces & SOUTHBIT) this.find_contact_with_stone(a, p, c1, SOUTHBIT);
    if ((faces & NORTHBIT) && !c1.is_contact) this.find_contact_with_stone(a, p, c1, NORTHBIT);
  }

  find_stone_contacts(a: Actor, c0: StoneContact, c1: StoneContact, c2: StoneContact) {
    c0.is_contact = c1.is_contact = c2.is_contact = false;
    c0.actor = c1.actor = c2.actor = a;
    const ai = a.ai;
    const re = ai.radius + contact_e;
    const g = new GridPos(Math.floor(ai.pos.x), Math.floor(ai.pos.y));
    const x = ai.pos.x, y = ai.pos.y;
    const noColl = server.NoCollisions && isMarbleOrPearl(a);
    const aws = GetStone(g);
    const win = aws && aws.getClass() === 'st_window' ? aws.getFaces(a.is_invisible()) : NODIRBIT;
    const P = (px: number, py: number) => new GridPos(px, py);
    const setEdge = (nx0: number, ny0: number, ny1: number, nx2: number, cx: number, cy: number) => {
      c0.normal = new V2(nx0, ny0); c1.normal = new V2(0, ny1); c2.normal = new V2(nx2, 0);
      c0.contact_point = new V2(cx, cy); c1.contact_point = new V2(cx, cy); c2.contact_point = new V2(cx, cy);
    };
    if (y - g.y < re) {
      if (x - g.x < re) {
        if (!noColl) this.find_contact_with_window(a, g, c1, c2, win);
        if (c1.is_contact) this.find_contact_with_stone(a, P(g.x, g.y - 1), c0, win);
        else if (c2.is_contact) this.find_contact_with_stone(a, P(g.x - 1, g.y), c0, win);
        else { setEdge(1, 1, 1, 1, g.x, g.y); this.find_contact_with_edge(a, P(g.x - 1, g.y - 1), P(g.x, g.y - 1), P(g.x - 1, g.y), c0, c1, c2, win); }
      } else if (-x + (g.x + 1) < re) {
        if (!noColl) this.find_contact_with_window(a, g, c1, c2, win);
        if (c1.is_contact) this.find_contact_with_stone(a, P(g.x, g.y - 1), c0, win);
        else if (c2.is_contact) this.find_contact_with_stone(a, P(g.x + 1, g.y), c0, win);
        else { setEdge(-1, 1, 1, -1, g.x + 1, g.y); this.find_contact_with_edge(a, P(g.x + 1, g.y - 1), P(g.x, g.y - 1), P(g.x + 1, g.y), c0, c1, c2, win); }
      } else {
        if (!noColl) this.find_contact_with_window(a, g, c1, c2, win);
        if (!c2.is_contact) this.find_contact_with_stone(a, P(g.x, g.y - 1), c0, win);
      }
    } else if (-y + (g.y + 1) < re) {
      if (x - g.x < re) {
        if (!noColl) this.find_contact_with_window(a, g, c1, c2, win);
        if (c1.is_contact) this.find_contact_with_stone(a, P(g.x, g.y + 1), c0, win);
        else if (c2.is_contact) this.find_contact_with_stone(a, P(g.x - 1, g.y), c0, win);
        else { setEdge(1, -1, -1, 1, g.x, g.y + 1); this.find_contact_with_edge(a, P(g.x - 1, g.y + 1), P(g.x, g.y + 1), P(g.x - 1, g.y), c0, c1, c2, win); }
      } else if (-x + (g.x + 1) < re) {
        if (!noColl) this.find_contact_with_window(a, g, c1, c2, win);
        if (c1.is_contact) this.find_contact_with_stone(a, P(g.x, g.y + 1), c0, win);
        else if (c2.is_contact) this.find_contact_with_stone(a, P(g.x + 1, g.y), c0, win);
        else { setEdge(-1, -1, -1, -1, g.x + 1, g.y + 1); this.find_contact_with_edge(a, P(g.x + 1, g.y + 1), P(g.x, g.y + 1), P(g.x + 1, g.y), c0, c1, c2, win); }
      } else {
        if (!noColl) this.find_contact_with_window(a, g, c1, c2, win);
        if (!c2.is_contact) this.find_contact_with_stone(a, P(g.x, g.y + 1), c0, win);
      }
    } else {
      if (x - g.x < re) {
        if (!noColl) this.find_contact_with_window(a, g, c1, c2, win);
        if (!c1.is_contact) this.find_contact_with_stone(a, P(g.x - 1, g.y), c0, win);
      } else if (-x + (g.x + 1) < re) {
        if (!noColl) this.find_contact_with_window(a, g, c1, c2, win);
        if (!c1.is_contact) this.find_contact_with_stone(a, P(g.x + 1, g.y), c0, win);
      } else if (!noColl) this.find_contact_with_window(a, g, c0, c1, win);
    }
  }

  handle_stone_contact(sc: StoneContact) {
    const a = sc.actor;
    const ai = a.ai;
    const restitution = 1.0;
    if (server.NoCollisions && sc.stoneid !== 'st_borderstone' && isMarbleOrPearl(a)) return;
    const contact: Contact = { pos: sc.contact_point.clone(), normal: sc.normal.clone() };
    if (sc.is_contact && sc.response === STONE_REBOUND) {
      if (ai.contacts.length >= MAX_CONTACTS) throw new XLevelRuntime(`Enigma Error - insufficient contacts: ${ai.contacts.length}`);
      ai.contacts.push(contact);
    }
    if (sc.is_collision) {
      if (!sc.ignore && sc.response === STONE_REBOUND) {
        const slow = len(ai.vel.x, ai.vel.y) < 0.3;
        if (!hasNearbyContact(ai.last_contacts, contact)) {
          const stone = GetStone(sc.stonepos);
          if (stone) {
            a.beforeStoneBounce(sc);
            if (slow) stone.actor_touch(sc); else stone.actor_hit(sc);
            a.afterStoneBounce(sc);
            if (!slow) {
              display.sparkle(sc.contact_point);
              let volume = Math.max(0.25, len(ai.vel.x, ai.vel.y) / 8);
              volume = Math.min(1.0, volume);
              host.sound(sc.sound, sc.contact_point.x, sc.contact_point.y, volume);
            }
          }
        }
        const nc = sc.normal.x * ai.collforce.x + sc.normal.y * ai.collforce.y;
        if (nc < 0) { ai.collforce.x -= nc * sc.normal.x; ai.collforce.y -= nc * sc.normal.y; }
        const dt = ActorTimeStep;
        const k = (1 + restitution) * (ai.vel.x * sc.normal.x + ai.vel.y * sc.normal.y);
        ai.collforce.x -= k * sc.normal.x / dt * ai.mass;
        ai.collforce.y -= k * sc.normal.y / dt * ai.mass;
      }
    } else if (sc.is_contact) {
      const stone = GetStone(sc.stonepos);
      if (stone) {
        stone.actor_contact(sc.actor);
        if (!a.ai.gridpos.eq(sc.stonepos) && !sc.ignore && sc.response === STONE_REBOUND) {
          const nc = sc.normal.x * ai.collforce.x + sc.normal.y * ai.collforce.y;
          if (nc < 0) { ai.collforce.x -= nc * sc.normal.x; ai.collforce.y -= nc * sc.normal.y; }
        }
      }
    }
  }

  handle_actor_contacts() {
    let a = this.leftmost;
    while (a) {
      let cand = a.right;
      const acting = a.ai.radius + Actor.max_radius;
      const maxX = a.ai.pos.x + acting;
      while (cand && cand.ai.pos.x <= maxX) {
        let yd = cand.ai.pos.y - a.ai.pos.y;
        yd = yd < 0 ? -yd : yd;
        if (yd <= acting) this.handle_actor_contact(a, cand);
        cand = cand.right;
      }
      a = a.right;
    }
  }
  handle_actor_contact(actor1: Actor, actor2: Actor) {
    const a1 = actor1.ai, a2 = actor2.ai;
    if (a1.ignore_contacts || a2.ignore_contacts) return;
    let nx = a1.pos.x - a2.pos.x, ny = a1.pos.y - a2.pos.y;
    if (Math.abs(Math.abs(nx) - Math.abs(ny)) < 1.0e-7 && Math.abs(ny) > 1.0e-5) ny = ny >= 0 ? Math.abs(nx) : -Math.abs(nx);
    const dist = len(nx, ny);
    if (dist !== 0) { nx /= dist; ny /= dist; }
    const overlap = a1.radius + a2.radius - dist;
    if (overlap > 0 && !a1.grabbed && !a2.grabbed) {
      const relspeed = (a2.vel.x - a1.vel.x) * nx + (a2.vel.y - a1.vel.y) * ny;
      if (relspeed < 0) return;
      let enforce = actor1.on_collision(actor2);
      enforce = actor2.on_collision(actor1) || enforce;
      const rebound = actor1.is_movable() && actor2.is_movable() && (enforce || actor1.is_on_floor() === actor2.is_on_floor());
      if (rebound) {
        const c2: Contact = { pos: new V2(a2.pos.x + nx * a2.radius, a2.pos.y + ny * a2.radius), normal: new V2(-nx, -ny) };
        a2.contacts.push(c2);
        const c1: Contact = { pos: c2.pos.clone(), normal: new V2(nx, ny) };
        a1.contacts.push(c1);
        const restitution = 1.0;
        let dmu = a1.mass;
        if (a1.mass !== a2.mass) dmu = 2 * a1.mass * a2.mass / (a1.mass + a2.mass);
        const k = restitution * dmu * relspeed / ActorTimeStep;
        const fx = k * nx, fy = k * ny;
        a1.collforce.x += fx; a1.collforce.y += fy;
        a2.collforce.x -= fx; a2.collforce.y -= fy;
        if (!hasNearbyContact(a1.last_contacts, c1)) {
          let volume = len(fx, fy) * ActorTimeStep;
          volume = Math.min(1.0, volume);
          if (volume > 0.4) host.sound('ballcollision', c1.pos.x, c1.pos.y, volume);
        }
      }
    }
  }

  private contactsBuf = [newContact(), newContact(), newContact()];
  handle_stone_contacts(actor: Actor) {
    if (actor.ai.ignore_contacts) return;
    const [c0, c1, c2] = this.contactsBuf;
    this.find_stone_contacts(actor, c0, c1, c2);
    if (c0.is_contact) this.handle_stone_contact(c0);
    if (c1.is_contact) this.handle_stone_contact(c1);
    if (c2.is_contact) this.handle_stone_contact(c2);
  }

  move_actors(dtime: number) {
    const dt = ActorTimeStep;
    restTime += dtime;
    const actors = this.actorlist;
    const n = actors.length;
    for (let i = 0; i < n; i++) {
      const ai = actors[i].ai;
      if (!ai.grabbed) ai.pos_force = new V2(ai.pos.x + dtime * 0.4 * ai.vel.x, ai.pos.y + dtime * 0.4 * ai.vel.y);
      else ai.pos_force = ai.pos.clone();
    }
    const gf: V2[] = [];
    for (let i = 0; i < n; i++) gf.push(this.get_global_force(actors[i]));
    while (restTime > 0) {
      for (let i = 0; i < n; i++) {
        const a = actors[i]; const ai = a.ai;
        ai.force = new V2(ai.forceacc.x * 6, ai.forceacc.y * 6);
        ai.force.x += gf[i].x; ai.force.y += gf[i].y;
        const lf = this.get_local_force(a);
        ai.force.x += lf.x; ai.force.y += lf.y;
        ai.forceacc = new V2();
        ai.collforce = new V2();
        ai.last_contacts = ai.contacts;
        ai.contacts = [];
      }
      for (const rb of this.rubberbands) rb.applyForces(dt);
      this.handle_actor_contacts();
      this.collisionCriticalPositions = [];
      this.registerCriticalPositions = true;
      for (let i = 0; i < n; i++) { const a = actors[i]; if (!a.ai.grabbed) this.handle_stone_contacts(a); }
      this.doPerformPendingActions();
      for (let i = 0; i < n; i++) {
        const a = actors[i]; const ai = a.ai;
        const st = { dtime: dt };
        if (!a.can_move()) {
          if (len(ai.force.x, ai.force.y) > 30) display.sparkle(ai.pos);
          ai.vel = new V2();
        } else if (!a.is_dead() && a.is_movable() && !ai.grabbed) {
          this.advance_actor(a, st);
        }
        a.move();
        a.think(st.dtime);
      }
      this.registerCriticalPositions = false;
      restTime -= dt;
    }
  }

  advance_actor(a: Actor, st: { dtime: number }) {
    const MAXVEL = 70;
    const ai = a.ai;
    const oldPos = ai.pos.clone();
    let fx = ai.force.x, fy = ai.force.y;
    for (const c of ai.contacts) {
      const nc = c.normal.x * fx + c.normal.y * fy;
      if (nc < 0) { fx -= nc * c.normal.x; fy -= nc * c.normal.y; }
    }
    fx += ai.collforce.x; fy += ai.collforce.y;
    const dtime = st.dtime;
    ai.vel.x += dtime * fx / ai.mass;
    ai.vel.y += dtime * fy / ai.mass;
    let q = len(ai.vel.x, ai.vel.y) / MAXVEL;
    if (q > 1) { ai.vel.x /= q; ai.vel.y /= q; }
    let friction = server.FrictionFactor * ai.friction;
    if (a.has_spikes()) friction += 7.0 * server.FrictionFactor;
    const vv = len(ai.vel.x, ai.vel.y);
    if (vv > 0) {
      let frx = ai.vel.x * friction, fry = ai.vel.y * friction;
      frx /= vv; fry /= vv;
      const p = pow08(vv);
      frx *= p; fry *= p;
      ai.vel.x -= dtime * frx / ai.mass;
      ai.vel.y -= dtime * fry / ai.mass;
      if (friction < 0) {
        q = len(ai.vel.x, ai.vel.y) / MAXVEL;
        if (q > 1) { ai.vel.x /= q; ai.vel.y /= q; }
      }
    }
    ai.pos.x += dtime * ai.vel.x;
    ai.pos.y += dtime * ai.vel.y;
    if (ai.pos.x < 0) ai.pos.x = 0.0;
    if (ai.pos.x >= this.w) ai.pos.x = this.w - 1e-12;
    if (ai.pos.y < 0) ai.pos.y = 0.0;
    if (ai.pos.y >= this.h) ai.pos.y = this.h - 1e-12;
    const oldG = GridPos.of(oldPos);
    let newG = GridPos.of(ai.pos);
    for (const e of this.collisionCriticalPositions) {
      if (e.eq(newG)) { ai.pos = oldPos.clone(); newG = oldG; break; }
    }
    if (oldG.x !== newG.x && oldG.y !== newG.y) {
      const newPos = ai.pos.clone();
      const cornerX = 0.5 + (newG.x + oldG.x) / 2.0, cornerY = 0.5 + (newG.y + oldG.y) / 2.0;
      const tx = (cornerY - oldPos.y) / ai.vel.y;
      const ty = (cornerX - oldPos.x) / ai.vel.x;
      const mid_t = (tx + ty) / 2;
      const mid = new V2((oldPos.x + ai.vel.x * tx + cornerX) / 2.0, (oldPos.y + ai.vel.y * ty + cornerY) / 2.0);
      if (mid.x === cornerX && mid.y === cornerY &&
        ((mid.x === oldG.x && mid.y === oldG.y) || (mid.x === oldG.x + 1 && mid.y === oldG.y + 1))) {
        const d = 0.5 - IntegerRand(0, 1);
        mid.x += d * 1e-10; mid.y += d * -1e-10;
      }
      ai.pos = mid.clone();
      this.did_move_actor(a);
      a.move();
      a.think(mid_t);
      st.dtime -= mid_t;
      if (!a.is_dead() && a.is_movable() && !ai.grabbed && ai.pos.x === mid.x && ai.pos.y === mid.y) ai.pos = newPos;
      else return;
    }
    this.did_move_actor(a);
  }

  scramble_puzzles() {
    while (this.scrambles.length) {
      for (const s of this.scrambles) {
        const puzz = GetStone(s.pos);
        if (puzz && s.intensity) { SendMessage(puzz, '_scramble', s.dir); --s.intensity; }
        else s.intensity = 0;
      }
      this.scrambles = this.scrambles.filter((s) => s.intensity >= 1);
    }
  }
}

function hasNearbyContact(list: Contact[], c: Contact): boolean {
  for (const x of list) {
    if (len(x.pos.x - c.pos.x, x.pos.y - c.pos.y) < 0.2 && len(x.normal.x - c.normal.x, x.normal.y - c.normal.y) < 0.1) return true;
  }
  return false;
}

/** laser recalculation hooks (objects/laser.ts installs them) */
/** Glasses::updateGlasses (items/GlassesItem.cc), set by the glasses item */
export const glassesHooks = { update: () => {} };
export const lightHooks = {
  performRecalc: (_init: boolean) => {},
  maybeRecalc: (_p: GridPos) => {},
  recalc: () => {},
};

export let world = new World();

// ------------------------------------------------------------------ object repository (BootRegister)

const templates = new Map<string, GameObject>();
export function Register(name: string, obj: GameObject) { templates.set(name, obj); }
export function hasTemplate(name: string) { return templates.has(name); }
export function MakeObject(kind: string): GameObject | null {
  const t = templates.get(kind);
  if (!t) return null;
  return t.clone();
}
function make<T>(kind: string, cls: abstract new (...a: never[]) => T): T {
  const o = MakeObject(kind);
  if (!o || !(o instanceof cls)) throw new XLevelRuntime(`MakeObject: unknown object name '${kind}'`);
  return o as T;
}
export function MakeFloor(kind: string) { return make(kind, Floor); }
export function MakeItem(kind: string) { return make(kind, Item); }
export function MakeStone(kind: string) { return make(kind, Stone); }
export function MakeActor(kind: string) { return make(kind, Actor); }
export function GetObjectTemplate(kind: string) { return templates.get(kind) ?? null; }
export function DisposeObject(o: GameObject | null) { if (o) o.dispose(); }
export function templateNames() { return [...templates.keys()]; }

// ------------------------------------------------------------------ world functions

function layerSet<T extends GridObject>(p: GridPos, x: T | null, get: (f: Field) => T | null, set: (f: Field, v: T | null) => void) {
  if (!x) return;
  const f = world.getField(p);
  if (f) {
    const old = get(f);
    if (old) { old.removal(p); old.dispose(); }
    set(f, x);
    x.creation(p);
  } else x.dispose();
}
function layerYield<T extends GridObject>(p: GridPos, get: (f: Field) => T | null, set: (f: Field, v: T | null) => void): T | null {
  const f = world.getField(p);
  if (!f) return null;
  const x = get(f);
  if (x) { set(f, null); x.removal(p); }
  return x;
}
const gFl = (f: Field) => f.floor, sFl = (f: Field, v: Floor | null) => { f.floor = v; };
const gIt = (f: Field) => f.item, sIt = (f: Field, v: Item | null) => { f.item = v; };
const gSt = (f: Field) => f.stone, sSt = (f: Field, v: Stone | null) => { f.stone = v; };

export function IsInsideLevel(p: GridPos) { return p.x >= 0 && p.y >= 0 && p.x < world.w && p.y < world.h; }
export function IsLevelBorder(p: GridPos) { return world.isBorder(p); }
export function GetField(p: GridPos) { return world.getField(p); }
export function GetFloor(p: GridPos): Floor | null { return world.getField(p)?.floor ?? null; }
export function SetFloor(p: GridPos, fl: Floor | null) {
  layerSet(p, fl, gFl, sFl);
  if (!world.preparing) { const st = GetStone(p); if (st) st.on_floor_change(); }
}
export function KillFloor(p: GridPos) {
  DisposeObject(layerYield(p, gFl, sFl));
  if (server.EnigmaCompatibility >= 1.10) host.setDefaultFloor(p.x, p.y);
}
// StoneLayer's default (world_internal.hh): outside the level GetStone answers this immovable, indestructible
// stone, so actors bounce off the level's edge and stones are never pushed out of it.
class BorderStone extends Stone {
  getClass() { return 'st_borderstone'; }
  getKind() { return 'INVALID'; }
  clone(): GameObject { return this; }
  dispose() {}
}
let borderstone: BorderStone | null = null;
export function GetStone(p: GridPos): Stone | null {
  const f = world.getField(p);
  if (f) return f.stone;
  return (borderstone ??= new BorderStone());
}
export function KillStone(p: GridPos) { DisposeObject(layerYield(p, gSt, sSt)); world.changedStones.push(p); }
export function YieldStone(p: GridPos): Stone | null { const s = layerYield(p, gSt, sSt); world.changedStones.push(p); return s; }
export function SetStone(p: GridPos, st: Stone | null) {
  layerSet(p, st, gSt, sSt);
  world.changedStones.push(p);
  if (world.registerCriticalPositions) world.collisionCriticalPositions.push(p);
}
export function ReplaceStone(p: GridPos, st: Stone) {
  const old = GetStone(p);
  if (old) { old.transferName(st); DisposeObject(layerYield(p, gSt, sSt)); }
  SetStone(p, st);
}
export function MoveStone(o: GridPos, n: GridPos) { SetStone(n, YieldStone(o)); }
export function TouchStone(p: GridPos) {
  world.changedStones.push(p);
  if (world.registerCriticalPositions) world.collisionCriticalPositions.push(p);
}
export function GetItem(p: GridPos): Item | null { return world.getField(p)?.item ?? null; }
export function KillItem(p: GridPos) { lightHooks.maybeRecalc(p); DisposeObject(layerYield(p, gIt, sIt)); }
export function YieldItem(p: GridPos): Item | null { lightHooks.maybeRecalc(p); return layerYield(p, gIt, sIt); }
export function SetItem(p: GridPos, it: Item | null) { lightHooks.maybeRecalc(p); layerSet(p, it, gIt, sIt); }
export function AddActor(x: number, y: number, a: Actor) { world.add_actor(a, new V2(x, y)); }
export function YieldActor(a: Actor) { return world.yield_actor(a); }
export function KillActor(a: Actor) { const x = world.yield_actor(a); if (x) { x.sprite?.kill(); x.dispose(); } }
export function GrabActor(a: Actor) { a.ai.grabbed = true; }
export function ReleaseActor(a: Actor) { a.ai.grabbed = false; }
export function WarpActor(a: Actor, x: number, y: number, keepVelocity: boolean) {
  if (!IsInsideLevel(GridPos.of(new V2(x, y)))) throw new XLevelRuntime('WarpActor: Tried to warp actor out of level grid.');
  const v = a.ai.vel.clone();
  a.warp(new V2(x, y));
  if (keepVelocity) a.ai.vel = v;
}
export function GetActorsInRange(c: V2, range: number): Actor[] {
  return world.actorlist.filter((a) => len(a.ai.pos.x - c.x, a.ai.pos.y - c.y) < range);
}
export function GetActorsInsideField(p: GridPos): Actor[] { return world.actorlist.filter((a) => a.ai.gridpos.eq(p)); }
export function ShatterActorsInsideField(p: GridPos) { for (const a of GetActorsInsideField(p)) SendMessage(a, '_shatter'); }
export function DidMoveActor(a: Actor) { world.did_move_actor(a); }
export function NameObject(o: GameObject, name: string) { world.nameObject(o, name); }
export function UnnameObject(o: GameObject) { world.unname(o); }
export function GetNamedObject(name: string): GameObject | null { return world.getNamed(name); }
export function GetNamedGroup(tmpl: string, ref: GameObject | null = null) { return world.getGroup(tmpl, ref); }
export function NamePosition(v: Value, name: string) { world.namedPositions.remove(name); world.namedPositions.insert(name, v); }
export function GetNamedPosition(name: string): Value {
  const o = GetNamedObject(name);
  if (o) {
    if (o instanceof GridObject) return new VPos(o.pos.x, o.pos.y, true);
    if (o instanceof Actor) return new VPos(o.ai.pos.x, o.ai.pos.y, false);
    return new VPos(-1, -1, true);
  }
  let w = name;
  if (w.startsWith('@')) w = w.slice(1);
  if (w.startsWith('@')) w = w.slice(1);
  const f = world.namedPositions.find(w);
  return f !== undefined ? f : new VPos(-1, -1, true);
}
export function GetNamedPositionList(tmpl: string, ref: GameObject | null = null): Value[] {
  const out: Value[] = [];
  for (const o of GetNamedGroup(tmpl, ref)) {
    if (o instanceof GridObject) out.push(new VPos(o.pos.x, o.pos.y, true));
    else if (o instanceof Actor) out.push(new VPos(o.ai.pos.x, o.ai.pos.y, false));
  }
  for (const [k, v] of world.namedPositions.entries()) if (stringMatch(k, tmpl) && !world.objnames.has(k)) out.push(v);
  return out;
}
export function SendMessage(o: GameObject | null, msg: string, value: Value = null, sender: GameObject | null = null): Value {
  if (!o) return undefined;
  return o.message({ message: msg, value, sender });
}
export function BroadcastMessage(msg: string, value: Value, floors: boolean, items: boolean, stones: boolean, actors = false, others = false) {
  for (let y = 0; y < world.h; y++) for (let x = 0; x < world.w; x++) {
    const f = world.getField(new GridPos(x, y))!;
    if (floors && f.floor) SendMessage(f.floor, msg, value);
    if (items && f.item) SendMessage(f.item, msg, value);
    if (stones && f.stone) SendMessage(f.stone, msg, value);
  }
  if (actors) for (const a of world.actorlist) SendMessage(a, msg, value);
  if (others) for (const o of world.others) SendMessage(o, msg, value);
}
export function PerformSecureAction(senderId: number, isCallback: boolean, targetId: number, name: string, val: Value) {
  world.actionList.push({ senderId, isCallback, targetId, name, val });
}
export function AddOther(o: Other) {
  world.others.push(o);
  if ('applyForces' in o) world.rubberbands.push(o as unknown as { applyForces(dt: number): void });
  o.postAddition();
}
export function KillOther(o: Other | null) {
  if (!o) return;
  o.preRemoval();
  const i = world.others.indexOf(o);
  if (i >= 0) {
    world.others.splice(i, 1);
    const j = world.rubberbands.indexOf(o as unknown as { applyForces(dt: number): void });
    if (j >= 0) world.rubberbands.splice(j, 1);
    o.dispose();
  }
}
export function ChangeMeditation(dm: number, dih: number, deih: number, dedh: number) {
  world.numMeditatists += dm; world.indispensableHollows += dih;
  world.engagedIndispensableHollows += deih; world.engagedDispensableHollows += dedh;
  if (!world.preparing && world.indispensableHollows === world.engagedIndispensableHollows &&
    world.engagedIndispensableHollows + world.engagedDispensableHollows === world.numMeditatists) host.finishLevel();
}
// SendExplosionEffect (world.cc): the 9 fields around an explosion, in get_neighbour's order (enigma.cc)
export const EXPLOSION_DYNAMITE = 0, EXPLOSION_BLACKBOMB = 1, EXPLOSION_WHITEBOMB = 2, EXPLOSION_DISPENSER = 3, EXPLOSION_SPITTER = 4;
const NB_X = [0, 0, -1, 1, 0, -1, 1, -1, 1], NB_Y = [0, -1, 0, 0, 1, -1, -1, 1, 1];
function explosion(source: GridPos, dest: GridPos, kind: string) {
  const st = GetStone(dest);
  if (st) SendMessage(st, '_explosion', new VPos(source.x, source.y, true));
  if (source.eq(dest)) return;
  const it = GetItem(dest);
  if (it) {
    if (it.getClass() === 'it_explosion') {
      const n = MakeItem(kind)!;
      if (toInt(n.getAttr('state')) > toInt(it.getAttr('state'))) SetItem(dest, n); else DisposeObject(n);
    } else if (it.traits().flags & itf_indestructible) SendMessage(it, '_explosion', new VPos(source.x, source.y, true));
    else SetItem(dest, MakeItem(kind));
  } else SetItem(dest, MakeItem(kind));
  const fl = GetFloor(dest);
  if (fl) SendMessage(fl, '_explosion');
}
export function SendExplosionEffect(center: GridPos, type: number) {
  const igniteAll = (d: GridPos, msg: string) => {
    const st = GetStone(d); if (st) SendMessage(st, msg);
    const it = GetItem(d); if (it) SendMessage(it, msg);
    const fl = GetFloor(d); if (fl) SendMessage(fl, msg);
  };
  for (let a = 0; a < 9; a++) {
    const dest = new GridPos(center.x + NB_X[a], center.y + NB_Y[a]);
    const direct = a <= 4;
    switch (type) {
      case EXPLOSION_DYNAMITE: igniteAll(dest, 'ignite'); break;
      case EXPLOSION_BLACKBOMB: if (direct) explosion(center, dest, 'it_explosion_nil'); else igniteAll(dest, 'ignite'); break;
      case EXPLOSION_WHITEBOMB: explosion(center, dest, 'it_explosion_debris'); break;
      case EXPLOSION_DISPENSER: if (direct) igniteAll(dest, '_dispenser'); break;
    }
  }
}
export function AddScramble(p: GridPos, d: number) { world.scrambles.push({ pos: p, dir: d, intensity: world.scrambleIntensity }); }

// ------------------------------------------------------------------ inventories and players (Inventory.cc, player.cc)

export interface ItemHolder { add_item(it: Item): void; is_full(): boolean; is_empty(): boolean; yield_first(): Item | null; containsKind(k: string): boolean }
function asHolder(it: Item | null): (Item & ItemHolder) | null {
  return it && 'add_item' in it ? it as Item & ItemHolder : null;
}

export class Inventory {
  items: Item[] = [];
  ownerId = 0;
  static readonly max_items = 12;
  attrs = new Map<string, Value>();
  getAttr(k: string): Value { return this.attrs.get(k) ?? undefined; }
  size() { return this.items.length; }
  clear() { for (const i of this.items) i.dispose(); this.items = []; }
  get_item(i: number): Item | null { return i >= this.items.length ? null : this.items[i]; }
  yield_item(i: number): Item | null {
    if (i < this.items.length) { const it = this.items.splice(i, 1)[0]; it.setOwner(-1); return it; }
    return null;
  }
  yield_first() { return this.yield_item(0); }
  remove_item(w: Item) { const i = this.items.indexOf(w); if (i >= 0) { this.items.splice(i, 1); w.setOwner(-1); return w; } return null; }
  is_full() { const h = asHolder(this.get_item(0)); if (h && !h.is_full()) return false; return this.items.length >= Inventory.max_items; }
  is_empty() { return this.items.length === 0; }
  add_item(i: Item) {
    const first = asHolder(this.get_item(0)), add = asHolder(i);
    if (first && !first.is_full() && (!add || !add.is_empty())) first.add_item(i);
    else if (this.items.length < Inventory.max_items) { this.items.unshift(i); i.setOwner(this.ownerId); }
    else i.dispose();
  }
  rotate_left() { if (this.items.length) this.items.push(this.items.shift()!); }
  rotate_right() { if (this.items.length) this.items.unshift(this.items.pop()!); }
  /** Inventory::takeItemsFrom: the bag's items move into the inventory unless its first item is a bag with room */
  takeItemsFrom(ih: ItemHolder) {
    const h = asHolder(this.get_item(0));
    if (h && !h.is_full()) return;
    while (this.items.length < Inventory.max_items && !ih.is_empty()) {
      const it = ih.yield_first()!;
      this.items.unshift(it);
      it.setOwner(this.ownerId);
    }
  }
  willAddItem(it: Item | null): boolean {
    const h = asHolder(it);
    if (this.is_full()) return false;
    if (h && h.is_empty() && (this.items.length >= Inventory.max_items || asHolder(this.get_item(0)) !== null)) return false;
    return true;
  }
  find(kind: string, start = 0): number {
    for (let i = start; i < this.items.length; i++) if (this.items[i].isKind(kind)) return i;
    return -1;
  }
  containsKind(kind: string) {
    for (const it of this.items) { if (it.isKind(kind)) return true; const h = asHolder(it); if (h && h.containsKind(kind)) return true; }
    return false;
  }
}

interface PlayerInfo { inventory: Inventory; actors: Actor[]; out_of_lives: boolean; inhibit_pickup: boolean }

class Players {
  players: PlayerInfo[] = [this.newInfo(), this.newInfo()];
  current = 0;
  unassigned: Actor[] = [];
  respawnList: { actor: Actor; time_left: number }[] = [];
  /** called when the inventory of the current player changed */
  onInventory: () => void = () => {};
  /** level flow hooks */
  restartLevel: () => void = () => {};
  restartGame: () => void = () => {};
  isRestarting: () => boolean = () => false;

  private newInfo(): PlayerInfo { return { inventory: new Inventory(), actors: [], out_of_lives: false, inhibit_pickup: false }; }
  inventory(i: number) { return this.players[i].inventory; }
  inventoryOf(a: Actor): Inventory | null { const v = a.getAttr('owner'); return v !== undefined && v !== null ? this.inventory(toInt(v)) : null; }

  newGame() {
    const extra = [0, 0];
    for (let i = 0; i < 2; i++) {
      if (server.IsLevelRestart) {
        if (server.ProvideExtralifes) {
          let idx = -1; extra[i] = -1;
          do { ++extra[i]; idx = this.players[i].inventory.find('it_extralife', ++idx); } while (idx !== -1);
        } else extra[i] = 0;
      } else extra[i] = server.ProvideExtralifes ? 2 : 0;
    }
    for (const p of this.players) p.inventory.clear();
    this.players = [this.newInfo(), this.newInfo()];
    for (let i = 0; i < 2; i++) {
      const inv = this.inventory(i);
      inv.ownerId = i;
      for (let j = 0; j < extra[i]; j++) inv.add_item(MakeItem('it_extralife'));
    }
    this.unassigned = [];
    this.respawnList = [];
  }
  prepareLevel() {
    for (const p of this.players) {
      let n = 0;
      for (const it of p.inventory.items) if (it.getClass() === 'it_extralife') n++;
      p.inventory.clear();
      for (let i = 0; i < n; i++) p.inventory.add_item(MakeItem('it_extralife'));
      p.actors = [];
    }
    this.setCurrent(0);
    this.respawnList = [];
  }
  setCurrent(i: number) { if (i < this.players.length) { this.current = i; this.onInventory(); glassesHooks.update(); } }
  addActor(i: number, a: Actor) { ReleaseActor(a); this.players[i].actors.push(a); }
  addUnassigned(a: Actor) { this.unassigned.push(a); }
  levelFinished(stage: number) {
    for (const p of this.players) for (const a of p.actors) {
      if (stage === 0) SendMessage(a, '_levelfinish');
      else { SendMessage(a, '_disappear'); SendMessage(a, 'disconnect'); }
    }
  }
  setRespawnPositions(pos: GridPos, color: Value) {
    for (const p of this.players) for (const a of p.actors) { const c = a.getAttr('color'); if (c !== undefined && valueEquals(c, color)) a.set_respawnpos(pos.center()); }
  }
  removeRespawnPositions(color: Value) {
    for (const p of this.players) for (const a of p.actors) { const c = a.getAttr('color'); if (c !== undefined && valueEquals(c, color)) a.remove_respawnpos(); }
  }
  suicide() { for (const p of this.players) for (const a of p.actors) SendMessage(a, '_suicide'); }
  mainActor(i: number) { return this.players[i].actors[0] ?? null; }
  numberOfRealPlayers() { return this.players.filter((p) => p.actors.length > 0).length; }
  private hasExtralive(pl: number, num: number) {
    let idx = 0;
    for (let i = 0; i < num; i++) { const f = this.players[pl].inventory.find('it_extralife', idx); if (f === -1) return false; idx = f + 1; }
    return true;
  }
  private removeExtralife(a: Actor) {
    const inv = this.inventoryOf(a);
    if (!inv) return false;
    const idx = inv.find('it_extralife');
    if (idx === -1) return false;
    inv.yield_item(idx)?.dispose();
    if (inv === this.inventory(this.current)) this.onInventory();
    return true;
  }
  private resurrect(pl: number, a: Actor): boolean {
    const has = this.hasExtralive(pl, 1);
    if (has) {
      SendMessage(a, '_resurrect');
      if (!server.InfiniteReincarnation) this.removeExtralife(a);
      this.respawnList.push({ actor: a, time_left: 1.5 });
    } else this.players[pl].out_of_lives = true;
    return has;
  }
  checkDeadActors() {
    let togglePlayer = false;
    const NO = -99;
    let toggleTo = NO;
    let newGame = false;
    for (let pl = -1; pl < this.players.length; pl++) {
      const actors = pl === -1 ? this.unassigned : this.players[pl].actors;
      let living = false;
      const ess = new Map<string, number>();
      for (const a of actors) {
        const ev = a.getAttr('essential_id');
        const essId = ev !== undefined ? toStr(ev) : a.traits().name;
        const essential = toInt(a.getAttr('essential'));
        if (essential === 2) ess.set(essId, (ess.get(essId) ?? 0) - 1);
        if (!a.is_dead() || (pl >= 0 && server.ConserveLevel && this.resurrect(pl, a))) {
          if (pl >= 0 && a.controlled_by(pl) && a.isSteerable()) living = true;
          if (essential === 0 || essential === 2) ess.set(essId, (ess.get(essId) ?? 0) + 1);
        } else if (essential === 1) newGame = true;
      }
      for (const v of [...ess.keys()].sort().map((k) => ess.get(k)!)) if (v < 0) newGame = true;
      if (living) { if (toggleTo === NO) toggleTo = pl; }
      else if (pl === this.current) {
        if (this.inventory(pl).find('it_yinyang', 0) >= 0) togglePlayer = true;
        else newGame = true;
      }
    }
    if (!server.ConserveLevel && !this.isRestarting() && (newGame || (togglePlayer && toggleTo === NO))) {
      const numDead: number[] = [];
      let reset = true;
      for (let pl = 0; pl < this.players.length; pl++) {
        numDead.push(this.players[pl].actors.filter((a) => a.is_dead()).length);
        if (!this.hasExtralive(pl, numDead[pl])) { reset = false; break; }
      }
      if (reset) {
        for (let pl = 0; pl < this.players.length; pl++) {
          const inv = this.inventory(pl);
          for (let i = 0; i < numDead[pl]; i++) inv.yield_item(inv.find('it_extralife'))?.dispose();
        }
        this.restartLevel();
        return;
      }
    }
    if (newGame) this.restartGame();
    else if (togglePlayer) {
      if (toggleTo === NO) this.restartGame(); else this.setCurrent(toggleTo);
    }
  }
  tick(dt: number) {
    for (let i = 0; i < this.respawnList.length;) {
      const r = this.respawnList[i];
      r.time_left -= dt;
      if (r.time_left < 0) { r.actor.respawn(); this.respawnList.splice(i, 1); continue; }
      i++;
    }
    this.checkDeadActors();
  }
  mayPickup(a: Actor, it: Item | null, allowFlying = false): Inventory | null {
    const v = a.getAttr('owner');
    if (v === undefined || v === null) return null;
    const ip = toInt(v);
    if (ip < 0 || ip >= this.players.length) return null;
    const inv = this.inventory(ip);
    const dont = this.players[ip].inhibit_pickup || (!allowFlying && a.is_flying()) || !inv.willAddItem(it) || a.is_dead();
    return dont ? null : inv;
  }
  pickupItem(a: Actor, p: GridPos) {
    const f = world.getField(p);
    if (!f || !f.item) return;
    const inv = this.mayPickup(a, f.item);
    if (inv) {
      const item = YieldItem(p);
      if (item) {
        inv.add_item(item);
        item.on_pickup(a);
        if (inv === this.inventory(this.current)) this.onInventory();
        const c = p.center();
        host.sound('pickup', c.x, c.y, 1);
      }
    }
  }
  pickupAsItem(a: Actor, obj: GridObject, kind: string): boolean {
    const item = MakeItem(kind);
    const inv = this.mayPickup(a, item, true);
    if (inv) {
      inv.add_item(item);
      obj.transferIdentity(item);
      if (inv === this.inventory(this.current)) this.onInventory();
      host.sound('pickup', a.ai.pos.x, a.ai.pos.y, 1);
      return true;
    }
    item.dispose();
    return false;
  }
  activateFirstItem() {
    const inv = this.players[this.current].inventory;
    if (inv.size() === 0) return;
    let it = inv.get_item(0)!;
    let ac: Actor | null = null;
    let p = new GridPos();
    let canDrop = false;
    for (const a of this.players[this.current].actors) {
      if (!a.is_dead()) { ac = a; p = GridPos.of(a.ai.pos); canDrop = a.can_drop_items(); break; }
    }
    if (!ac) return;
    switch (it.activate(ac, p)) {
      case ITEM_DROP:
        if (it.can_drop_at(p) && canDrop) { it = inv.yield_first()!; this.onInventory(); it.drop(ac, p); }
        break;
      case ITEM_KILL: inv.yield_first()?.dispose(); this.onInventory(); break;
    }
  }
  rotateInventory(dir: number) {
    host.sound('invrotate', 0, 0, 1);
    const inv = this.players[this.current].inventory;
    if (dir === 1) inv.rotate_left(); else inv.rotate_right();
    this.onInventory();
  }
  setInhibitPickup(f: boolean) { this.players[this.current].inhibit_pickup = f; }
}
export const player = new Players();

// ------------------------------------------------------------------ level preparation (server.cc, world.cc)

export function resetServerForLevel() {
  Object.assign(server, {
    SublevelNumber: 1, SublevelTitle: '', NoCollisions: false, WorldInitialized: false, LevelTime: 0,
    ConserveLevel: true, ProvideExtralifes: true, InfiniteReincarnation: false, SurviveFinish: true, TwoPlayerGame: false,
    SingleComputerGame: true, AllowSingleOxyds: false, AllowSuicide: true, AllowTogglePlayer: true, AutoRespawn: false,
    FollowAction: new GridPos(19, 12), FollowGrid: true, FollowMethod: 0, FollowThreshold: 0.5, ShowMoves: false,
    GlassesVisibility: 0, FlatForce: 0, ConstantForce: new V2(), Brittleness: 0.5, BumperForce: 200, CrackSpreading: 0.5,
    ElectricForce: 15, ExtralifeGlasses: 19, FallenPuzzle: 'fl_gray', Fragility: 1, FrictionFactor: 1, HoleForce: 1,
    MagnetForce: 30, MagnetRange: 10, MaxOxydColor: 7, RubberViolationStrength: 50, SlopeForce: 25, SubSoil: 0,
    SwampSinkSpeed: 4, WaterSinkSpeed: 10000, WormholeForce: 30, WormholeRange: 10, moveCounter: 0, finishRequested: false,
    WorldSized: false,
  });
}
export const levelPrepareHooks: (() => void)[] = [];
/** WorldPrepareLevel + Resize(20, 13) */
export function worldPrepareLevel() {
  GameTimer.clear();
  for (const a of world.actorlist) a.sprite?.kill();
  world = new World();
  world.resize(20, 13);
  display.newWorld(20, 13);
  photoSensors.length = 0;
  for (const h of levelPrepareHooks) h();
}
export function resizeWorld(w: number, h: number) {
  world = new World();
  world.resize(w, h);
  display.newWorld(w, h);
  server.WorldSized = true;
  player.newGame();
}

/** WorldInitLevel */
export function worldInitLevel() {
  if (server.EnigmaCompatibility < 1.10) server.CrackSpreading = server.Brittleness;
  world.scramble_puzzles();
  lightHooks.recalc();
  lightHooks.performRecalc(true);
  let seen0 = false;
  for (const a of world.actorlist.slice()) {
    a.on_creation(a.ai.pos);
    SendMessage(a, '_init', null);
    const v = a.getAttr('owner');
    if (v !== undefined && v !== null) {
      const ip = toInt(v);
      player.addActor(ip, a);
      if (ip === 0) seen0 = true;
    } else player.addUnassigned(a);
  }
  world.changedStones = [];
  if (!seen0) throw new XLevelRuntime('Error: No player 0 defined!');
  BroadcastMessage('_init', null, true, true, true);
  for (const o of world.others) SendMessage(o, '_init', null);
  server.moveCounter = 0;
  world.preparing = false;
  server.WorldInitialized = true;
}
