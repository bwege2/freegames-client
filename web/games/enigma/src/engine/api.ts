// The level's Lua state (lua.cc InitLevel, API 2): objects, positions, groups, position lists, tiles, the
// world "wo", named objects "no", tiles "ti", positions "po", the "en" functions, and the world proxy
// attributes (WorldProxy.cc). Translated from lua.cc function by function.
import { newState } from '../lua/lib.ts';
import { Lua, LuaError, LuaFunction, LuaTable, LuaUserdata, truthy, typeName, tonumber, type LuaValue } from '../lua/interp.ts';
import {
  Actor, AddActor, AddOther, DisposeObject, Floor, GameObject, GetFloor, GetItem, GetNamedGroup, GetNamedObject,
  GetNamedPosition, GetNamedPositionList, GetObjectTemplate, GetStone, GridObject, GridPos, IntegerRand, IsInsideLevel,
  Item, KillFloor, KillItem, KillOther, KillStone, MakeObject, NameObject, NamePosition, Other, Rand, SendMessage,
  SetFloor, SetItem, SetStone, Stone, V2, VGroup, VObj, VPos, VTokens, XLevelRuntime, getObjectList, makeGroup,
  makeTokens, objValue, player, server, toObject, toPosition, toTokenList, vtype, VT, world, resizeWorld, toBool,
  toDouble, toInt, toStr, ENIGMA_RAND_MAX, BroadcastMessage, FLOOR, ITEM, STONE, OTHER,
  type ItemHolder, type Value,
} from './core.ts';
import { shuffleOxyd } from './objects/oxyd.ts';

const ID = {
  OBJECT: '_ENIGMAOBJECT', POSITION: '_POSITION', POSITIONS: '_POSITIONS', WORLD: '_WORLDOBJECT', NAMEOBJ: '_NAMEDOBJECTS',
  GROUP: '_GROUP', POLIST: '_POLIST', TILES: '_TILES', TILE: '_TILE', DEFAULT: '_DEFAULT',
};

interface ObjUD { t: 'object'; id: number }
interface PosUD { t: 'position'; x: number; y: number }
interface GroupUD { t: 'group'; members: LuaUserdata[] }
interface PolistUD { t: 'polist'; pts: number[] }
interface TileUD { t: 'tile'; parts: LuaValue[]; key?: string }
interface Singleton { t: 'world' | 'namedobj' | 'positions' | 'tiles' | 'default' }
type UD = ObjUD | PosUD | GroupUD | PolistUD | TileUD | Singleton;

export class LevelLua {
  L: Lua;
  metas: Record<string, LuaTable> = {};
  tilesTable = new LuaTable();
  resolver: LuaValue = undefined;
  floorKey = '';
  customResolution = false;
  worldUserMethods = new LuaTable();
  loadLib: (id: string) => void = () => { throw new XLevelRuntime('LoadLib: no level'); };

  constructor(difficulty: number) {
    const L = this.L = newState();
    L.doString('options={}', 'options');
    L.doString(`options.Difficulty = ${difficulty}`, 'options');
    this.registerAll();
  }

  err(msg: string): never { throw new LuaError(this.L.where(1) + msg); }

  // ------------------------------------------------------------ type checks and conversions
  ud(v: LuaValue): UD | null { return v instanceof LuaUserdata ? v.data as UD : null; }
  isObject(v: LuaValue) { return this.ud(v)?.t === 'object'; }
  isPosition(v: LuaValue) { return this.ud(v)?.t === 'position'; }
  isGroup(v: LuaValue) { return this.ud(v)?.t === 'group'; }
  isPolist(v: LuaValue) { return this.ud(v)?.t === 'polist'; }
  isTile(v: LuaValue) { return this.ud(v)?.t === 'tile'; }
  isTiles(v: LuaValue) { return this.ud(v)?.t === 'tiles'; }
  isWorld(v: LuaValue) { return this.ud(v)?.t === 'world'; }
  isDefault(v: LuaValue) { return this.ud(v)?.t === 'default'; }

  newUD(data: UD, meta: string): LuaUserdata { const u = new LuaUserdata(data); u.metatable = this.metas[meta]; return u; }
  pushObject(o: GameObject | null): LuaUserdata { return this.newUD({ t: 'object', id: o ? o.id : -1 }, ID.OBJECT); }
  toObject(v: LuaValue): GameObject | null {
    if (!this.isObject(v)) this.err('Cannot convert type to an Object');
    const id = (this.ud(v) as ObjUD).id;
    return id !== -1 ? GameObject.getObject(id) : null;
  }
  pushPosition(x: number, y: number) { return this.newUD({ t: 'position', x, y }, ID.POSITION); }
  toPos(v: LuaValue): V2 { const d = this.ud(v); return d && d.t === 'position' ? new V2(d.x, d.y) : new V2(0, 0); }
  pushGroup(list: (GameObject | null)[]): LuaUserdata {
    const seen = new Set<GameObject>();
    const members: LuaUserdata[] = [];
    for (const o of list) if (o && !seen.has(o)) { seen.add(o); members.push(this.pushObject(o)); }
    return this.newUD({ t: 'group', members }, ID.GROUP);
  }
  groupObjects(v: LuaValue): (GameObject | null)[] {
    const d = this.ud(v);
    if (!d || d.t !== 'group') return [];
    return d.members.map((m) => this.toObject(m));
  }
  pushPolist(list: Value[]) {
    const pts: number[] = [];
    for (const v of list) if (v !== undefined) { const p = toPosition(v); pts.push(p.x, p.y); }
    return this.newUD({ t: 'polist', pts }, ID.POLIST);
  }
  polistPositions(v: LuaValue): V2[] {
    const d = this.ud(v) as PolistUD;
    const out: V2[] = [];
    for (let i = 0; i + 1 < d.pts.length; i += 2) out.push(new V2(d.pts[i], d.pts[i + 1]));
    return out;
  }

  pushValue(v: Value): LuaValue {
    switch (vtype(v)) {
      case VT.NIL: case VT.DEFAULT: return undefined;
      case VT.DOUBLE: return v as number;
      case VT.STRING: return v as string;
      case VT.BOOL: return v as boolean;
      case VT.OBJECT: return this.pushObject(toObject(v));
      case VT.GROUP: return this.pushGroup(getObjectList(v, null));
      case VT.POSITION: case VT.GRIDPOS: { const p = toPosition(v); return this.pushPosition(p.x, p.y); }
      case VT.TOKENS: {
        const t = new LuaTable();
        let n = 1;
        for (const tok of toTokenList(v)) t.set(n++, this.pushValue(tok));
        return t;
      }
    }
    return undefined;
  }
  toValue(v: LuaValue): Value {
    switch (typeName(v)) {
      case 'nil': return null;
      case 'number': return v as number;
      case 'string': return v as string;
      case 'boolean': return v as boolean;
      case 'userdata': {
        if (this.isObject(v)) return objValue(this.toObject(v));
        if (this.isGroup(v)) return makeGroup(this.groupObjects(v));
        if (this.isPosition(v)) { const p = this.toPos(v); return new VPos(p.x, p.y, false); }
        if (this.isDefault(v)) return null;
        this.err(`Cannot convert userdata type '${this.userType(v)}' to Value.`);
      }
      // eslint-disable-next-line no-fallthrough
      case 'table': {
        const tokens: Value[] = [];
        const t = v as LuaTable;
        for (let i = 1; t.getInt(i) !== undefined; i++) tokens.push(this.toValue(t.getInt(i)));
        return makeTokens(tokens);
      }
    }
    this.err('Cannot convert type to Value.');
  }
  userType(v: LuaValue): string {
    const d = this.ud(v);
    if (!d) return 'unknown';
    return d.t === 'namedobj' || d.t === 'positions' ? 'unknown' : d.t;
  }

  /** catch engine exceptions as Lua errors (throwLuaError) */
  guard<T>(f: () => T): T {
    try { return f(); } catch (e) {
      if (e instanceof XLevelRuntime) this.err(e.message);
      throw e;
    }
  }

  // ------------------------------------------------------------ positions
  coords(v: LuaValue, what: string): [number, number] {
    let x: LuaValue, y: LuaValue;
    if (v instanceof LuaTable) { x = v.getInt(1); y = v.getInt(2); }
    else if (this.isPosition(v)) { const p = this.toPos(v); x = p.x; y = p.y; }
    else if (this.isObject(v)) { x = this.L.index(v, 'x'); y = this.L.index(v, 'y'); }
    else this.err(`Invalid ${what} value type`);
    if (typeof x !== 'number' || typeof y !== 'number') this.err(`Invalid ${what} value type`);
    return [x, y];
  }
  newPosition(v: LuaValue): LuaUserdata { const [x, y] = this.coords(v, 'new position'); return this.pushPosition(x, y); }
  addPositionsBase(a: LuaValue, b: LuaValue, factor: number, scalar = false): LuaValue {
    if (!(this.isPolist(a) || this.isPolist(b))) {
      let x = 0, y = 0;
      for (const [i, v] of [[1, a], [2, b]] as const) {
        const [px, py] = this.coords(v, 'add position');
        x += (i === 1 ? 1 : factor) * px;
        y += (i === 1 ? 1 : factor) * py;
      }
      return this.pushPosition(x, y);
    }
    let pl: V2[] = [];
    let offset = new V2(0, 0);
    let found = false;
    if (this.isPolist(a)) { pl = this.polistPositions(a); found = true; }
    else if (!scalar) offset = this.toPos(this.newPosition(a));
    if (this.isPolist(b)) {
      if (found) this.err('Addition of two position lists not supported');
      pl = this.polistPositions(b);
    } else if (!scalar) offset = this.toPos(this.newPosition(b));
    return this.pushPolist(pl.map((p) => new VPos(offset.x + factor * p.x, offset.y + factor * p.y, false)));
  }
  joinGroup(a: LuaValue, b: LuaValue): LuaValue {
    if (!((this.isGroup(a) || this.isObject(a)) && (this.isGroup(b) || this.isObject(b)))) this.err('Join Group - argument is no object or group');
    const objs: (GameObject | null)[] = [];
    for (const v of [a, b]) {
      if (this.isGroup(v)) objs.push(...this.groupObjects(v)); else objs.push(this.toObject(v));
    }
    return this.pushGroup(objs);
  }
  centerPosition(v: LuaValue): LuaValue {
    let x: LuaValue, y: LuaValue;
    if (this.isPosition(v)) { const p = this.toPos(v); x = p.x; y = p.y; }
    else if (this.isObject(v)) { x = this.L.index(v, 'x'); y = this.L.index(v, 'y'); }
    else this.err('Invalid center position value type');
    if (typeof x !== 'number' || typeof y !== 'number') this.err('Invalid center position value type');
    return this.pushPosition(Math.floor(x) + 0.5, Math.floor(y) + 0.5);
  }
  multiply(a: LuaValue, b: LuaValue, isDiv: boolean): LuaValue {
    let x = 0, y = 0, f = 1;
    for (const v of [a, b]) {
      if (this.isPosition(v)) { const p = this.toPos(v); x = p.x; y = p.y; }
      else if (tonumber(v) !== undefined) f = tonumber(v)!;
      else this.err('Invalid multiplication position value type');
    }
    if (isDiv) { x /= f; y /= f; } else { x *= f; y *= f; }
    return this.pushPosition(x, y);
  }

  // ------------------------------------------------------------ set objects (setObjectByTable, setObjectByTile)
  setObjectAttributes(obj: GameObject, t: LuaTable) {
    for (let r = t.next(undefined); r; r = t.next(r[0])) {
      const [k, v] = r;
      if (typeof k === 'string') obj.setAttrChecked(k, this.toValue(v));
      else if (k === 2) { if (typeof v === 'string') obj.setAttrChecked('name', v); }
    }
  }
  setObjectByTable(t: LuaValue, x: number, y: number, onlyFloors = false, holder: (ItemHolder & { owner?: number }) | null = null) {
    const xi = Math.floor(x), yi = Math.floor(y);
    if (!(t instanceof LuaTable)) this.err(`World: object set of wrong type '${typeName(t)}'`);
    if (t.length() === 0) return;
    const nv = t.getInt(1);
    if (typeof nv !== 'string' && typeof nv !== 'number') this.err('World: object type string missing');
    let name = typeof nv === 'number' ? String(nv) : nv;
    if (name.startsWith('#')) { x = xi + 0.5; y = yi + 0.5; name = name.slice(1); }
    const p = new GridPos(xi, yi);
    if (name === 'nil') return;
    if (name === 'fl_nil') { if (!onlyFloors) KillFloor(p); return; }
    if (name === 'st_nil') { if (!onlyFloors) KillStone(p); return; }
    if (name === 'it_nil') { if (!onlyFloors) KillItem(p); return; }
    const obj = MakeObject(name);
    if (!obj) this.err(`World: unknown object name '${name}'`);
    try { this.setObjectAttributes(obj, t); } catch (e) {
      DisposeObject(obj);
      if (e instanceof XLevelRuntime) this.err(e.message);
      throw e;
    }
    if (holder) {
      if (!(obj instanceof Item)) { DisposeObject(obj); this.err('Attempt to add an object to a bag or inventory that is no item'); }
      if (!obj.isPortable()) { DisposeObject(obj); this.err('Attempt to add an item to a bag or inventory that is not portable'); }
      holder.add_item(obj);
      player.onInventory();
      return;
    }
    const checker = () => {
      const odd = obj.getAttr('checkerboard');
      return odd !== undefined && (xi + yi) % 2 !== toInt(odd);
    };
    this.guard(() => {
      if (obj instanceof Floor) { if (checker()) { DisposeObject(obj); return; } SetFloor(p, obj); }
      else if (obj instanceof Stone) { if (!onlyFloors) { if (checker()) { DisposeObject(obj); return; } SetStone(p, obj); } else DisposeObject(obj); }
      else if (obj instanceof Item) { if (!onlyFloors) { if (checker()) { DisposeObject(obj); return; } SetItem(p, obj); } else DisposeObject(obj); }
      else if (obj instanceof Actor) {
        if (!onlyFloors) {
          const dx = t.getInt(2), dy = t.getInt(3);
          if (typeof dx === 'number') x += dx;
          if (typeof dy === 'number') y += dy;
          if (IsInsideLevel(new GridPos(Math.floor(x), Math.floor(y)))) AddActor(x, y, obj);
          else this.err('World: actor addition to position outside of world');
        } else DisposeObject(obj);
      } else if (obj instanceof Other) { if (x < 0) AddOther(obj); }
      else this.err('World set of unknown object');
    });
  }
  setObjectByTile(tile: LuaValue, x: number, y: number, onlyFloors = false, holder: ItemHolder | null = null) {
    const d = this.ud(tile) as TileUD;
    const first = d.parts[0];
    if (this.isTile(first)) this.setObjectByTile(first, x, y, onlyFloors, holder); else this.setObjectByTable(first, x, y, onlyFloors, holder);
    const second = d.parts[1];
    if (second !== undefined) {
      if (this.isTile(second)) this.setObjectByTile(second, x, y, onlyFloors, holder); else this.setObjectByTable(second, x, y, onlyFloors, holder);
    }
  }
  setObjectByAny(v: LuaValue, x: number, y: number, onlyFloors = false, holder: ItemHolder | null = null) {
    if (v instanceof LuaTable) this.setObjectByTable(v, x, y, onlyFloors, holder); else this.setObjectByTile(v, x, y, onlyFloors, holder);
  }

  // ------------------------------------------------------------ tiles and resolvers
  pushNewTile(parts: LuaValue[], key?: string) { return this.newUD({ t: 'tile', parts, key }, ID.TILE); }
  tilesRead(key: LuaValue, direct: boolean): LuaValue {
    if (typeof key !== 'string' && typeof key !== 'number') this.err('Tiles: key is not a string');
    const k = String(key);
    let v = this.tilesTable.get(k);
    if (direct && v === undefined) {
      if (k.includes('%%')) { this.tilesWrite(k, new LuaTable()); v = this.tilesTable.get(k); }
      else this.err(`Tiles: undefined key '${k}'`);
    }
    return v;
  }
  tilesWrite(key: LuaValue, v: LuaValue) {
    if (typeof key !== 'string' && typeof key !== 'number') this.err('Tiles: key is not a string');
    const k = String(key);
    if (!(v instanceof LuaTable || this.isTile(v))) this.err('Tiles: value is not a tile or table');
    const tile = this.pushNewTile([v], k);
    if (this.tilesTable.get(k) !== undefined) this.err(`Tiles: redefinition of key '${k}'`);
    this.tilesTable.set(k, tile);
  }
  evaluateKey(resolver: LuaValue, key: LuaValue, x: number, y: number): LuaValue {
    if (!(typeof x === 'number' && typeof y === 'number' && (typeof key === 'string' || typeof key === 'number') &&
      (this.isTiles(resolver) || resolver instanceof LuaFunction || resolver instanceof LuaTable))) this.err('Resolver with false argument types' + (process.env.DBG ? [typeof resolver, typeof key, typeof x, typeof y, String(x), String(y)].join(',') : ''));
    const k = String(key);
    if (this.isTiles(resolver)) return this.tilesRead(k, false);
    if (resolver instanceof LuaFunction) {
      let r: LuaValue;
      try { r = this.L.call(resolver, [k, x, y])[0]; } catch (e) {
        if (e instanceof LuaError) this.err(`Error within tile key resolver: \n  ${String(e.value)}`);
        throw e;
      }
      if (!(this.isTile(r) || r instanceof LuaTable || r === undefined)) this.err(`World init undefined tile '${k}' at ${x}, ${y}`);
      return r;
    }
    const impl = (resolver as LuaTable).getInt(1);
    this.customResolution = true;
    let r: LuaValue;
    try { r = this.L.call(impl, [resolver, this.evaluateFn, k, x, y])[0]; }
    catch (e) {
      this.customResolution = false;
      if (e instanceof LuaError) this.err(`Error within tile key resolver: \n  ${String(e.value)}`);
      throw e;
    }
    this.customResolution = false;
    if (!(this.isTile(r) || r instanceof LuaTable || r === undefined)) this.err(`World init undefined tile '${k}' at ${x}, ${y}`);
    return r;
  }
  evaluateFn = new LuaFunction((a) => [this.evaluateKey(a[0], a[1], tonumber(a[2])!, tonumber(a[3])!)], 'evaluateKey');
  setObjectByKey(key: string, j: number, i: number, onlyFloors = false) {
    const t = this.evaluateKey(this.resolver, key, j, i);
    if (t === undefined) this.err(`World init undefined tile '${key}' at ${j}, ${i}`);
    this.setObjectByAny(t, j, i, onlyFloors);
    const p = new GridPos(j, i);
    if (!GetFloor(p)) {
      const ft = this.evaluateKey(this.resolver, this.floorKey, j, i);
      if (ft === undefined) this.err(`World init undefined default tile at ${j}, ${i}`);
      this.setObjectByAny(ft, j, i, true);
      if (!GetFloor(p)) this.err(`World no floor at ${j}, ${i}`);
    }
  }
  finalizeResolvers(r: LuaValue) {
    if (r instanceof LuaTable) {
      this.finalizeResolvers(r.getInt(3));
      const fin = r.getInt(2);
      if (fin !== undefined) {
        try { this.L.call(fin, [r]); } catch (e) {
          if (e instanceof LuaError) this.err(`Error within tile key resolver finalization:\n ${String(e.value)}`);
          throw e;
        }
      }
    }
  }
  setDefaultFloor(x: number, y: number) {
    if (this.floorKey !== '' || this.resolver !== undefined) this.setObjectByKey(this.floorKey, x, y, true);
  }
  createWorld(a: LuaValue[]): LuaValue[] {
    if (server.WorldSized) this.err('World recreation not allowed');
    const args = a.slice();
    if (args[2] instanceof LuaTable) {
      const dk = (args[2] as LuaTable).get('defaultkey');
      if (typeof dk !== 'string') this.err('World create with false argument types');
      args.splice(2, 0, dk);
    }
    const res = args[1], defKey = args[2], spec = args[3];
    if (!((this.isTiles(res) || res instanceof LuaFunction || res instanceof LuaTable) && (typeof defKey === 'string' || typeof defKey === 'number') &&
      (spec instanceof LuaTable || (typeof spec === 'number' && typeof args[4] === 'number')))) this.err('World create with false argument types');
    this.resolver = res;
    this.floorKey = String(defKey);
    const keyLength = this.floorKey.length;
    const lines: string[] = [];
    let width = 0, height = 0;
    if (spec instanceof LuaTable) {
      height = spec.length();
      for (let i = 1; i <= height; i++) {
        const l = this.L.index(spec, i);
        if (typeof l !== 'string' && typeof l !== 'number') this.err('World create map has enties that are no strings');
        lines.push(String(l));
        width = Math.max(width, lines[lines.length - 1].length);
      }
      if (width % keyLength !== 0) this.err('World create map row with odd length');
      width = width / keyLength;
    } else {
      width = Math.trunc(spec as number); height = Math.trunc(args[4] as number);
      if (width <= 0 || height <= 0) this.err('World create with bad size');
      for (let i = 0; i < height; i++) lines.push('');
    }
    resizeWorld(width, height);
    this.onResize(Math.min(20, width), Math.min(13, height));
    for (let i = 0; i < height; i++) {
      const line = lines[i];
      if (line.length % keyLength !== 0) this.err('World create map row with odd length');
      const ll = line.length / keyLength;
      for (let j = 0; j < width; j++) {
        if (j < ll) this.setObjectByKey(line.substr(j * keyLength, keyLength), j, i, false);
        else this.setObjectByKey(this.floorKey, j, i, true);
      }
    }
    this.finalizeResolvers(this.resolver);
    return [width, height];
  }
  onResize: (w: number, h: number) => void = () => {};

  // ------------------------------------------------------------ world proxy (WorldProxy.cc)
  worldGet(key: string): Value {
    const s = server;
    switch (key) {
      case 'AllowSingleOxyds': return s.AllowSingleOxyds;
      case 'AllowSuicide': return s.AllowSuicide;
      case 'AutoRespawn': return s.AutoRespawn;
      case 'TogglePlayerOnDeath': return s.AllowTogglePlayer;
      case 'ConserveLevel': return s.ConserveLevel;
      case 'CreatingPreview': return s.CreatingPreview;
      case 'FollowAction': return new VPos(s.FollowAction.x, s.FollowAction.y, true);
      case 'FollowGrid': return s.FollowGrid;
      case 'FollowMethod': return s.FollowMethod;
      case 'FollowThreshold': return s.FollowThreshold;
      case 'Height': return world.h;
      case 'IsDifficult': return s.IsDifficult;
      case 'LevelTime': return s.LevelTime;
      case 'ProvideExtralifes': return s.ProvideExtralifes;
      case 'InfiniteReincarnation': return s.InfiniteReincarnation;
      case 'ShowMoves': return s.ShowMoves;
      case 'SublevelNumber': return s.SublevelNumber;
      case 'SublevelTitle': return s.SublevelTitle;
      case 'SurviveFinish': return s.SurviveFinish;
      case 'Width': return world.w;
      case 'ActorimpulseStrength': return s.BumperForce;
      case 'CrackSpreading': return s.CrackSpreading;
      case 'ElectricStrength': return s.ElectricForce;
      case 'ExtralifeGlasses': return s.ExtralifeGlasses;
      case 'FallenPuzzle': return s.FallenPuzzle;
      case 'Fragility': return s.Fragility;
      case 'FrictionStrength': return s.FrictionFactor;
      case 'GlobalForce': return new VPos(s.ConstantForce.x, s.ConstantForce.y, false);
      case 'MeditationStrength': return s.HoleForce;
      case 'MagnetStrength': return s.MagnetForce;
      case 'MagnetRange': return s.MagnetRange;
      case 'MaxOxydColor': return s.MaxOxydColor;
      case 'RubberViolationStrength': return s.RubberViolationStrength;
      case 'SlopeStrength': return s.SlopeForce;
      case 'SubSoil': return s.SubSoil;
      case 'SwampSinkTime': return s.SwampSinkSpeed > 0 ? (s.SwampSinkSpeed >= 10000 ? 0 : 7.0 / s.SwampSinkSpeed) : null;
      case 'WaterSinkTime': return s.WaterSinkSpeed > 0 ? (s.WaterSinkSpeed >= 10000 ? 0 : 7.0 / s.WaterSinkSpeed) : null;
      case 'WormholeStrength': return s.WormholeForce;
      case 'WormholeRange': return s.WormholeRange;
    }
    return undefined;
  }
  worldSet(key: string, val: Value) {
    const s = server;
    const d = () => toDouble(val);
    switch (key) {
      case 'AllowSingleOxyds': s.AllowSingleOxyds = toBool(val); break;
      case 'AllowSuicide': s.AllowSuicide = toBool(val); break;
      case 'AutoRespawn': s.AutoRespawn = toBool(val); break;
      case 'TogglePlayerOnDeath': s.AllowTogglePlayer = toBool(val); break;
      case 'ConserveLevel': s.ConserveLevel = toBool(val); break;
      case 'FollowAction': { const p = toPosition(val); s.FollowAction = new GridPos(p.x, p.y); this.onFollow(); break; }
      case 'FollowGrid': {
        const was = s.FollowGrid;
        s.FollowGrid = toBool(val);
        if (was && !s.FollowGrid) { s.FollowMethod = 1; s.FollowThreshold = 0; s.FollowAction = new GridPos(0, 0); }
        else if (!was && s.FollowGrid) { s.FollowThreshold = 0.5; s.FollowAction = new GridPos(9.5, 6); }
        this.onFollow(); break;
      }
      case 'FollowMethod': {
        const old = s.FollowMethod;
        s.FollowMethod = toInt(val);
        if (old !== s.FollowMethod) {
          if (s.FollowMethod === 2) { s.FollowThreshold = 0.5; s.FollowAction = new GridPos(19, 12); }
          else if (s.FollowMethod === 1 && s.FollowGrid) { s.FollowThreshold = 0.5; s.FollowAction = new GridPos(9.5, 6); }
          this.onFollow();
        }
        break;
      }
      case 'FollowThreshold': s.FollowThreshold = d(); this.onFollow(); break;
      case 'ProvideExtralifes': {
        const nf = toBool(val);
        if (!(s.ProvideExtralifes || !nf)) throw new XLevelRuntime("Attribute 'ProvideExtralifes': toggling from false to true not allowed");
        s.ProvideExtralifes = nf; break;
      }
      case 'InfiniteReincarnation': s.InfiniteReincarnation = toBool(val); break;
      case 'ShowMoves': s.ShowMoves = toBool(val); break;
      case 'SublevelTitle': s.SublevelTitle = toStr(val); break;
      case 'SurviveFinish': s.SurviveFinish = toBool(val); break;
      case 'CrackSpreading': s.CrackSpreading = d(); break;
      case 'ActorimpulseStrength': s.BumperForce = d(); break;
      case 'ElectricStrength': s.ElectricForce = d(); break;
      case 'ExtralifeGlasses': s.ExtralifeGlasses = toInt(val); break;
      case 'FallenPuzzle': s.FallenPuzzle = toStr(val); break;
      case 'Fragility': s.Fragility = d(); break;
      case 'FrictionStrength': s.FrictionFactor = d(); break;
      case 'GlobalForce': { const p = toPosition(val); s.ConstantForce = new V2(p.x, p.y); break; }
      case 'MeditationStrength': s.HoleForce = d(); break;
      case 'MagnetStrength': s.MagnetForce = d(); BroadcastMessage('_updateglobals', 'it_magnet', false, true, false); break;
      case 'MagnetRange': s.MagnetRange = d(); BroadcastMessage('_updateglobals', 'it_magnet', false, true, false); break;
      case 'MaxOxydColor':
        s.MaxOxydColor = toInt(val);
        if (!(s.MaxOxydColor >= 0 && s.MaxOxydColor < 13)) throw new XLevelRuntime("Attribute 'MaxOxydColor' value is out of range.");
        break;
      case 'RubberViolationStrength': s.RubberViolationStrength = d(); break;
      case 'SlopeStrength': s.SlopeForce = d(); break;
      case 'SubSoil': s.SubSoil = toInt(val); break;
      case 'SwampSinkTime': if (val === null) s.SwampSinkSpeed = 0; else if (d() === 0) s.SwampSinkSpeed = 10000; else s.SwampSinkSpeed = 7.0 / d(); break;
      case 'WaterSinkTime': if (val === null) s.WaterSinkSpeed = 0; else if (d() === 0) s.WaterSinkSpeed = 10000; else s.WaterSinkSpeed = 7.0 / d(); break;
      case 'WormholeStrength': s.WormholeForce = d(); BroadcastMessage('_updateglobals', 'it_wormhole', false, true, false); break;
      case 'WormholeRange': s.WormholeRange = d(); BroadcastMessage('_updateglobals', 'it_wormhole', false, true, false); break;
      default: throw new XLevelRuntime(`Attempt to set not existing global attribute '${key}'.`);
    }
  }
  onFollow: () => void = () => {};

  // ------------------------------------------------------------ registration (InitLevel)
  private registerAll() {
    const L = this.L;
    const G = L.G;
    const F = (name: string, f: (a: LuaValue[]) => LuaValue[]) => new LuaFunction(f, name);
    const self = this;

    const random = F('random', (a) => {
      const r = Rand() / (ENIGMA_RAND_MAX + 1.0);
      switch (a.length) {
        case 0: return [r];
        case 1: { const u = Math.trunc(tonumber(a[0]) ?? 0); if (!(1 <= u)) this.err("bad argument #1 to 'random' (interval is empty)"); return [Math.floor(r * u) + 1]; }
        case 2: {
          const l = Math.trunc(tonumber(a[0]) ?? 0), u = Math.trunc(tonumber(a[1]) ?? 0);
          if (!(l <= u)) this.err("bad argument #2 to 'random' (interval is empty)");
          return [Math.floor(r * (u - l + 1)) + l];
        }
      }
      this.err('wrong number of arguments');
    });

    // the "enigma" table: levelfuncs and the tolua module
    const enigma = new LuaTable();
    G.set('enigma', enigma);
    const lf: Record<string, (a: LuaValue[]) => LuaValue[]> = {
      LoadLib: (a) => { this.guard(() => this.loadLib(String(a[0]))); return []; },
      GetObjectTemplate: (a) => [this.pushObject(GetObjectTemplate(String(a[0])))],
      MakeObject: (a) => {
        if (typeof a[0] !== 'string') this.err('MakeObject: string expected as argument');
        const o = MakeObject(a[0]);
        if (!o) this.err(`MakeObject: unknown object name '${a[0]}'`);
        return [this.pushObject(o)];
      },
      SetActor: (a) => {
        const x = tonumber(a[0]) ?? 0, y = tonumber(a[1]) ?? 0;
        const ac = this.toObject(a[2]);
        if (!(ac instanceof Actor)) this.err('object is no valid actor');
        if (IsInsideLevel(new GridPos(Math.floor(x), Math.floor(y)))) AddActor(x, y, ac); else this.err('position is outside of world');
        return [];
      },
      GetNamedObject: (a) => [this.pushObject(GetNamedObject(String(a[0])))],
      GetFloor: (a) => [this.pushObject(GetFloor(new GridPos(Math.floor(tonumber(a[0]) ?? 0), Math.floor(tonumber(a[1]) ?? 0))))],
      GetItem: (a) => [this.pushObject(GetItem(new GridPos(Math.floor(tonumber(a[0]) ?? 0), Math.floor(tonumber(a[1]) ?? 0))))],
      GetStone: (a) => [this.pushObject(GetStone(new GridPos(Math.floor(tonumber(a[0]) ?? 0), Math.floor(tonumber(a[1]) ?? 0))))],
      GetPos: (a) => {
        const o = this.toObject(a[0]);
        if (!o) this.err('GetPos: Illegal object');
        let p = new GridPos(-1, -1);
        if (o instanceof GridObject) p = o.pos; else if (o instanceof Actor) p = GridPos.of(o.ai.pos);
        return [p.x, p.y];
      },
      GetAttrib: (a) => {
        const o = this.toObject(a[0]);
        if (!o) this.err('GetAttrib: invalid object');
        if (a[1] === 'kind') this.err('GetAttrib: illegal attribute, use GetKind()');
        return [this.guard(() => this.pushValue(o.getAttrChecked(String(a[1]))))];
      },
      GetClass: (a) => { const o = this.toObject(a[0]); if (!o) this.err('GetClass: invalid object'); return [o.getClass()]; },
      GetKind: (a) => { const o = this.toObject(a[0]); if (!o) this.err('GetKind: invalid object'); return [o.getKind()]; },
      IsSameObject: (a) => [this.toObject(a[0]) === this.toObject(a[1])],
      SetAttrib: (a) => {
        const o = this.toObject(a[0]);
        if (o && (typeof a[1] === 'string')) this.guard(() => o.setAttrChecked(a[1] as string, this.toValue(a[2])));
        else this.err(`SetAttrib: invalid object or attribute name '${String(a[1])}'`);
        return [];
      },
      SendMessage: (a) => {
        const o = this.toObject(a[0]);
        const v = a.length >= 3 ? this.toValue(a[2]) : null;
        if (typeof a[1] !== 'string') this.err('Illegal message');
        if (o) this.guard(() => SendMessage(o, a[1] as string, v));
        return [];
      },
      NameObject: (a) => {
        const o = this.toObject(a[0]);
        if (!o) this.err('NameObject: Illegal object');
        if (typeof a[1] !== 'string') this.err('NameObject: Illegal name');
        NameObject(o, a[1]);
        return [];
      },
      EmitSound: (a) => {
        const o = this.toObject(a[0]);
        if (typeof a[1] !== 'string') this.err('Illegal sound');
        if (!o) this.err('EmitSound: invalid object');
        if (o instanceof GridObject) o.sound_event(a[1], typeof a[2] === 'number' ? a[2] : 1.0);
        return [];
      },
      SetFloor: (a) => {
        const p = new GridPos(Math.floor(tonumber(a[0]) ?? 0), Math.floor(tonumber(a[1]) ?? 0));
        if (a[2] === undefined) SetFloor(p, null);
        else { const fl = this.toObject(a[2]); if (!(fl instanceof Floor)) this.err('object argument 3 must be a floor or nil'); this.guard(() => SetFloor(p, fl)); }
        return [];
      },
      SetItem: (a) => {
        const it = this.toObject(a[2]);
        if (!(it instanceof Item)) this.err('object is no valid item');
        this.guard(() => SetItem(new GridPos(Math.floor(tonumber(a[0]) ?? 0), Math.floor(tonumber(a[1]) ?? 0)), it));
        return [];
      },
      SetStone: (a) => {
        const st = this.toObject(a[2]);
        if (!(st instanceof Stone)) this.err('object is no valid stone');
        this.guard(() => SetStone(new GridPos(Math.floor(tonumber(a[0]) ?? 0), Math.floor(tonumber(a[1]) ?? 0)), st));
        return [];
      },
      KillStone: (a) => { KillStone(new GridPos(Math.floor(tonumber(a[0]) ?? 0), Math.floor(tonumber(a[1]) ?? 0))); return []; },
      KillItem: (a) => { KillItem(new GridPos(Math.floor(tonumber(a[0]) ?? 0), Math.floor(tonumber(a[1]) ?? 0))); return []; },
      GetTicks: () => [Math.floor(performance.now())],
      IsSolved: () => this.err('Usage of depreceated function "IsSolved()"'),
      AddConstantForce: (a) => { server.ConstantForce = new V2(tonumber(a[0]) ?? 0, tonumber(a[1]) ?? 0); return []; },
      SetScrambleIntensity: (a) => { world.scrambleIntensity = Math.trunc(tonumber(a[0]) ?? 0); return []; },
      FindDataFile: () => [undefined],
      settile: undefined as unknown as (a: LuaValue[]) => LuaValue[],
    };
    delete (lf as Record<string, unknown>).settile;
    for (const [k, f] of Object.entries(lf)) enigma.set(k, F(k, f));
    enigma.set('random', random);
    // tolua "enigma" module: directions and server variables
    enigma.set('NODIR', -1); enigma.set('NORTH', 3); enigma.set('EAST', 2); enigma.set('SOUTH', 1); enigma.set('WEST', 0);
    const vars: Record<string, keyof typeof server> = {
      TwoPlayerGame: 'TwoPlayerGame', SingleComputerGame: 'SingleComputerGame', ConserveLevel: 'ConserveLevel',
      AllowTogglePlayer: 'AllowTogglePlayer', ShowMoves: 'ShowMoves', Brittleness: 'Brittleness', SlopeForce: 'SlopeForce',
      FlatForce: 'FlatForce', FrictionFactor: 'FrictionFactor', ElectricForce: 'ElectricForce', BumperForce: 'BumperForce',
      MagnetForce: 'MagnetForce', MagnetRange: 'MagnetRange', WaterSinkSpeed: 'WaterSinkSpeed', SwampSinkSpeed: 'SwampSinkSpeed',
      WormholeForce: 'WormholeForce', WormholeRange: 'WormholeRange', HoleForce: 'HoleForce', CreatingPreview: 'CreatingPreview',
    };
    const emeta = new LuaTable();
    emeta.set('__index', F('enigma_index', (a) => { const k = String(a[1]); return k in vars ? [server[vars[k]] as LuaValue] : [undefined]; }));
    emeta.set('__newindex', F('enigma_newindex', (a) => {
      const k = String(a[1]);
      if (k in vars) (server as Record<string, unknown>)[vars[k]] = typeof server[vars[k]] === 'boolean' ? truthy(a[2]) : tonumber(a[2]) ?? 0;
      else (a[0] as LuaTable).set(a[1], a[2]);
      return [];
    }));
    enigma.metatable = emeta;

    // "en" and the global functions of levelFuncs
    const en = new LuaTable();
    const usertype = F('usertype', (a) => [this.userType(a[0])]);
    const grp = F('grp', (a) => [this.newGroup(a)]);
    const fl = F('fl', (a) => [this.getStoneItemFloor(a, FLOOR)]);
    const it = F('it', (a) => [this.getStoneItemFloor(a, ITEM)]);
    const st = F('st', (a) => [this.getStoneItemFloor(a, STONE)]);
    for (const [k, f] of [['random', random], ['usertype', usertype], ['grp', grp], ['fl', fl], ['it', it], ['st', st]] as const) {
      en.set(k, f); G.set(k, f);
    }
    G.set('en', en);

    // ----- metatables of the userdata types
    const meta = (id: string, ops: Record<string, (a: LuaValue[]) => LuaValue[]>) => {
      const m = new LuaTable();
      m.set('_id', id);
      for (const [k, f] of Object.entries(ops)) m.set(k, F(k, f));
      this.metas[id] = m;
    };
    const method = (name: string, f: (a: LuaValue[]) => LuaValue[]) => F(name, f);
    const syntax = () => this.err("Syntax error - usage of '.' instead of ':'");

    // objects
    const objectMethods: Record<string, LuaFunction> = {
      exists: method('exists', (a) => { if (!this.isObject(a[0])) syntax(); return [this.toObject(a[0]) !== null]; }),
      is: method('is', (a) => {
        if (!this.isObject(a[0])) syntax();
        if (typeof a[1] !== 'string') this.err('Illegal kind - no string');
        const o = this.toObject(a[0]);
        return [o ? o.isKind(a[1]) : false];
      }),
      kind: method('kind', (a) => { if (!this.isObject(a[0])) syntax(); const o = this.toObject(a[0]); return [o ? o.getKind() : '']; }),
      kill: method('kill', (a) => this.killObject(a)),
      message: method('message', (a) => {
        if (!this.isObject(a[0])) syntax();
        if (a.length < 2) this.err('Message missing');
        return [this.objectMessage(a[0], a[1], a[2])];
      }),
      sound: method('sound', (a) => {
        if (!this.isObject(a[0])) syntax();
        if (typeof a[1] !== 'string') this.err('Sound name expected as first argument');
        const o = this.toObject(a[0]);
        if (o instanceof GridObject) o.sound_event(a[1], typeof a[2] === 'number' ? a[2] : 1.0);
        return [];
      }),
      set: method('set', (a) => {
        if (!this.isObject(a[0])) syntax();
        if (!(a[a.length - 1] instanceof LuaTable)) this.err('Multiple set of object attributes requires a table as argument.');
        const t = a[a.length - 1] as LuaTable;
        if (t.getInt(1) !== undefined) this.err('Set attribute: encountered attribute without key name');
        const o = this.toObject(a[0]);
        if (o) this.guard(() => this.setObjectAttributes(o, t));
        return [];
      }),
      xy: method('xy', (a) => {
        if (!this.isObject(a[0])) syntax();
        const o = this.toObject(a[0]);
        if (o instanceof GridObject) { const p = o.getOwnerPos(); return [p.x, p.y]; }
        if (o instanceof Actor) { const p = GridPos.of(o.ai.pos); return [p.x, p.y]; }
        this.err('xy access to not existing object');
      }),
    };
    meta(ID.OBJECT, {
      __newindex: (a) => {
        const o = this.toObject(a[0]);
        const key = a[1];
        if (o && (typeof key === 'string' || typeof key === 'number')) this.guard(() => o.setAttrChecked(String(key), this.toValue(a[2])));
        else if (o) this.err(`SetAttrib: invalid object or attribute name '${String(key)}'`);
        return [];
      },
      __index: (a) => {
        const key = a[1];
        if (typeof key === 'string' && objectMethods[key]) return [objectMethods[key]];
        if (typeof key !== 'string' && typeof key !== 'number') this.err('Invalid object read index type');
        const o = this.toObject(a[0]);
        const ks = typeof key === 'string' ? key : '';
        if (o && typeof key === 'string' && (key === 'x' || key === 'y')) {
          let p = new GridPos(-1, -1);
          if (o instanceof GridObject) p = o.getOwnerPos(); else if (o instanceof Actor) p = GridPos.of(o.ai.pos);
          return [key === 'x' ? p.x : p.y];
        }
        if (!ks.startsWith('_') && ((o !== null && o.validateMessage(ks)) || (o === null && (ks === 'exists' || ks === 'kill')))) {
          const msg = ks;
          return [F('directMessage', (b) => {
            if (!this.isObject(b[0])) this.err("Message error: no target object - may be caused by usage of '.' instead of ':'");
            return [this.objectMessage(b[0], msg, b[1])];
          })];
        }
        if (o) return [this.guard(() => this.pushValue(o.getAttrChecked(ks)))];
        return [undefined];
      },
      __eq: (a) => { const o1 = this.toObject(a[0]), o2 = this.toObject(a[1]); return [o1 === o2 && o1 !== null]; },
      __add: (a) => [this.isGroup(a[0]) || this.isGroup(a[1]) ? this.joinGroup(a[0], a[1]) : this.addPositionsBase(a[0], a[1], 1)],
      __sub: (a) => [this.addPositionsBase(a[0], a[1], -1)],
      __len: (a) => [this.centerPosition(a[0])],
      __unm: (a) => [this.toObject(a[0]) !== null],
    });

    // positions
    const positionMethods: Record<string, LuaFunction> = {
      xy: method('xy', (a) => { if (!this.isPosition(a[0])) syntax(); const p = this.toPos(a[0]); return [p.x, p.y]; }),
      grid: method('grid', (a) => { if (!this.isPosition(a[0])) syntax(); const p = this.toPos(a[0]); return [this.pushPosition(Math.floor(p.x), Math.floor(p.y))]; }),
      exists: method('exists', (a) => { if (!this.isPosition(a[0])) syntax(); const p = this.toPos(a[0]); return [IsInsideLevel(new GridPos(Math.floor(p.x), Math.floor(p.y)))]; }),
    };
    meta(ID.POSITION, {
      __newindex: (a) => {
        if (typeof a[1] !== 'string' && typeof a[1] !== 'number') this.err('Invalid position write index type');
        if (typeof a[2] !== 'number') this.err('Invalid position write value type');
        if (a[1] === 'x' || a[1] === 'y') this.err('Invalid position modification of x or y coordinate');
        this.err('Invalid position index');
      },
      __index: (a) => {
        const k = a[1];
        if (typeof k === 'string' && positionMethods[k]) return [positionMethods[k]];
        if (typeof k !== 'string' && typeof k !== 'number') this.err('Invalid position read index type');
        if (k === 'x' || k === 'y') { const p = this.toPos(a[0]); return [k === 'x' ? p.x : p.y]; }
        this.err('Invalid position index');
      },
      __eq: (a) => { const p = this.toPos(a[0]), q = this.toPos(a[1]); return [p.x === q.x && p.y === q.y]; },
      __add: (a) => [this.isGroup(a[0]) || this.isGroup(a[1]) ? this.joinGroup(a[0], a[1]) : this.addPositionsBase(a[0], a[1], 1)],
      __sub: (a) => [this.addPositionsBase(a[0], a[1], -1)],
      __mul: (a) => {
        if (this.isPosition(a[0]) && this.isPosition(a[1])) this.err('Multiplication of two positions not allowed');
        return [this.multiply(a[0], a[1], false)];
      },
      __div: (a) => {
        if (!this.isPosition(a[0]) || tonumber(a[1]) === undefined) this.err('Division of position with wrong types');
        return [this.multiply(a[0], a[1], true)];
      },
      __len: (a) => [this.centerPosition(a[0])],
      __unm: (a) => { const p = this.toPos(a[0]); return [this.pushPosition(-p.x, -p.y)]; },
      __concat: (a) => [this.joinPolist(a[0], a[1])],
    });

    // po
    meta(ID.POSITIONS, {
      __newindex: (a) => {
        if (typeof a[1] !== 'string' && typeof a[1] !== 'number') this.err('Position naming: key is not a string');
        if (!this.isPosition(a[2])) this.err('Position naming: value is not a position');
        const p = this.toPos(a[2]);
        NamePosition(new VPos(p.x, p.y, false), String(a[1]));
        return [];
      },
      __index: (a) => {
        if (typeof a[1] !== 'string' && typeof a[1] !== 'number') this.err('Positions: key is not a string');
        const name = String(a[1]);
        if (/[*?]/.test(name)) return [this.pushPolist(GetNamedPositionList(name))];
        return [this.pushValue(GetNamedPosition(name))];
      },
      __call: (a) => {
        const args = a.slice(1);
        if (args.length < 1) this.err('New position call without arguments');
        if (this.isGroup(args[0])) return [this.newPolist(args[0])];
        if (args[0] instanceof LuaTable) {
          let coordinates = true;
          if ((args[0] as LuaTable).length() === 0) coordinates = false;
          else if (this.isPosition((args[0] as LuaTable).getInt(1))) coordinates = false;
          return [coordinates ? this.newPosition(args[0]) : this.newPolist(args[0])];
        }
        if (args.length >= 2 && typeof args[0] === 'number') return [this.newPosition(this.tableOf(args[0], args[1]))];
        return [this.newPosition(args[0])];
      },
    });

    // no
    meta(ID.NAMEOBJ, {
      __index: (a) => {
        if (typeof a[1] !== 'string' && typeof a[1] !== 'number') this.err('Named object access without giving a name');
        const name = String(a[1]);
        if (/[*?]/.test(name)) return [this.pushGroup(GetNamedGroup(name))];
        return [this.pushObject(GetNamedObject(name))];
      },
      __newindex: (a) => {
        const o = this.toObject(a[2]);
        if (!o) return [];
        if (typeof a[1] !== 'string' && typeof a[1] !== 'number') this.err('NameObject: Illegal name');
        const name = String(a[1]);
        if (name.startsWith('$')) this.err("NameObject: names with leading '$' are reserved");
        NameObject(o, name);
        return [];
      },
    });

    // wo
    const worldMethods: Record<string, LuaFunction> = {
      create: method('create', (a) => this.createWorld(a)),
      _register: method('_register', (a) => {
        if (!((typeof a[1] === 'string' || typeof a[1] === 'number') && a[2] instanceof LuaFunction)) this.err('World register method argument error');
        this.worldUserMethods.set(a[1], a[2]);
        return [];
      }),
      _evaluate: method('_evaluate', (a) => [this.evaluateKey(a[1], a[2], tonumber(a[3])!, tonumber(a[4])!)]),
      add: method('add', (a) => this.addOther(a)),
      fl: method('fl', (a) => [this.getStoneItemFloor(a, FLOOR)]),
      it: method('it', (a) => [this.getStoneItemFloor(a, ITEM)]),
      st: method('st', (a) => [this.getStoneItemFloor(a, STONE)]),
      shuffleOxyd: method('shuffleOxyd', (a) => { if (!this.isWorld(a[0])) syntax(); this.guard(() => shuffleOxyd(this, a.slice(1))); return []; }),
      externalData: method('externalData', () => this.err('External data is not available')),
    };
    meta(ID.WORLD, {
      __newindex: (a) => { this.worldWrite(a[1], a[2]); return []; },
      __index: (a) => {
        if (typeof a[1] !== 'string' && typeof a[1] !== 'number') this.err('World read access without giving an attribute name');
        const k = String(a[1]);
        if (worldMethods[k]) return [worldMethods[k]];
        const v = this.worldGet(k);
        if (v !== undefined) return [this.pushValue(v)];
        const um = this.worldUserMethods.get(k);
        if (um instanceof LuaFunction) return [um];
        this.err('World read access without a valid key');
      },
      __call: (a) => this.createWorld(a),
    });

    // tiles and tile
    meta(ID.TILE, {
      __newindex: () => this.err('Tile: illegal write access'),
      __index: (a) => {
        if (a[1] === '_declaration') return [F('_declaration', (b) => {
          if (b.length !== 1 || !this.isTile(b[0])) this.err("Tile declaration with illegal arguments: possible syntax error - usage of '.' instead of ':'");
          const result = new LuaTable();
          this.tileDecl(b[0], result, true);
          return [result];
        })];
        this.err('Tile: illegal read access');
      },
      __concat: (a) => {
        if (a[1] === undefined) this.err('Tile concat of not existing second argument');
        if (!((this.isTile(a[0]) || a[0] instanceof LuaTable) && (this.isTile(a[1]) || a[1] instanceof LuaTable))) this.err('Tile concat of unsupported types');
        return [this.pushNewTile([a[0], a[1]])];
      },
    });
    meta(ID.TILES, {
      __newindex: (a) => {
        if (server.EnigmaCompatibility < 1.10) this.err('Mismatch of new API 2 syntax with level compatibility < 1.10');
        this.tilesWrite(a[1], a[2]);
        return [];
      },
      __index: (a) => [this.tilesRead(a[1], !this.customResolution)],
      __call: (a) => {
        if (!(a[1] instanceof LuaTable && a.length === 2)) this.err('New tile with wrong arguments');
        return [this.pushNewTile([a[1]])];
      },
    });

    // groups
    const groupMethods: Record<string, LuaFunction> = {
      message: method('message', (a) => this.groupMessage(a[0], a[1], a[2], a.length)),
      kill: method('kill', (a) => this.killObject(a)),
      shuffle: method('shuffle', (a) => {
        if (!this.isGroup(a[0])) syntax();
        const v = this.groupObjects(a[0]);
        for (let i = v.length - 1; i > 0; i--) { const j = IntegerRand(0, i); const o = v[j]; v[j] = v[i]; v[i] = o; }
        return [this.pushGroup(v)];
      }),
      sort: method('sort', (a) => [this.sortGroup(a)]),
      sub: method('sub', (a) => {
        if (!this.isGroup(a[0])) syntax();
        const old = this.groupObjects(a[0]);
        const length = old.length;
        let start = 0, end = length;
        if (a.length === 2 && typeof a[1] === 'number') { end = Math.trunc(a[1]); if (end < 0) { start = length - end; end = length; } }
        if (a.length === 3 && typeof a[1] === 'number' && typeof a[2] === 'number') { start = Math.trunc(a[1]) - 1; end = Math.trunc(a[2]); if (end < 0) end = start - end; }
        return [this.pushGroup(old.filter((_, i) => i >= start && i < end))];
      }),
      nearest: method('nearest', (a) => {
        if (!this.isGroup(a[0])) syntax();
        if (!(a.length === 2 && this.isObject(a[1]))) this.err('Syntax error: expected object reference as first argument');
        const list = this.groupObjects(a[0]);
        const center = this.toObject(a[1]);
        if (!center) this.err('Error: reference object is no longer existing');
        let mindist = -1;
        let cand: GameObject | null = null;
        for (const o of list) {
          if (mindist < 0) { cand = o; mindist = center.squareDistance(o!); }
          else {
            const nd = center.squareDistance(o!);
            if (mindist > nd || (mindist === nd && o!.isSouthOrEastOf(cand!))) { cand = o; mindist = nd; }
          }
        }
        return [this.pushObject(cand)];
      }),
    };
    meta(ID.GROUP, {
      __newindex: (a) => {
        if (typeof a[1] !== 'string') this.err('Group: illegal attribute write access');
        for (const o of this.groupObjects(a[0])) if (o) this.guard(() => o.setAttrChecked(a[1] as string, this.toValue(a[2])));
        return [];
      },
      __index: (a) => {
        const k = a[1];
        const d = this.ud(a[0]) as GroupUD;
        if (typeof k === 'number' || (typeof k === 'string' && tonumber(k) !== undefined)) {
          let i = Math.trunc(tonumber(k)!);
          const size = d.members.length;
          if (i < 0) i = size + 1 + i;
          return [i >= 1 && i <= size ? d.members[i - 1] : this.pushObject(null)];
        }
        if (typeof k === 'string') {
          if (groupMethods[k]) return [groupMethods[k]];
          const msg = k;
          return [F('groupDirectMessage', (b) => {
            if (!this.isGroup(b[0])) this.err("Message error: no target group - may be caused by usage of '.' instead of ':'");
            return this.groupMessage(b[0], msg, b[1], b.length + 1);
          })];
        }
        if (this.isObject(k)) {
          const idx = d.members.indexOf(k as LuaUserdata);
          if (idx >= 0) return [idx + 1];
          const o1 = this.toObject(k);
          for (let i = 0; i < d.members.length; i++) if (this.toObject(d.members[i]) === o1) return [i + 1];
          return [undefined];
        }
        this.err('Group: illegal read access');
      },
      __len: (a) => [(this.ud(a[0]) as GroupUD).members.length],
      __add: (a) => [this.joinGroup(a[0], a[1])],
      __mul: (a) => [this.intersectGroup(a[0], a[1], true)],
      __sub: (a) => [this.intersectGroup(a[0], a[1], false)],
      __eq: (a) => [this.groupEqual(a[0], a[1])],
      __call: (a) => {
        if (!this.isGroup(a[0])) this.err('Group: iterator first arg not a group');
        const d = this.ud(a[0]) as GroupUD;
        if (a[2] === undefined) return [d.members.length === 0 ? undefined : d.members[0]];
        const i = d.members.indexOf(a[2] as LuaUserdata);
        return [i >= 0 ? d.members[i + 1] : undefined];
      },
    });

    // position lists
    meta(ID.POLIST, {
      __newindex: () => this.err('PoList: illegal write access'),
      __index: (a) => {
        if (tonumber(a[1]) === undefined) this.err('Position List: illegal read access');
        let i = Math.trunc(tonumber(a[1])!);
        const d = this.ud(a[0]) as PolistUD;
        const size = Math.floor(d.pts.length / 2);
        if (i < 0) i = size + 1 + i;
        if (i >= 1 && i <= size) return [this.pushPosition(d.pts[2 * i - 2], d.pts[2 * i - 1])];
        return [undefined];
      },
      __len: (a) => [Math.floor((this.ud(a[0]) as PolistUD).pts.length / 2)],
      __add: (a) => [this.addPositionsBase(a[0], a[1], 1)],
      __sub: (a) => [this.addPositionsBase(a[0], a[1], -1)],
      __concat: (a) => [this.joinPolist(a[0], a[1])],
      __mul: (a) => {
        let f = 0;
        if (tonumber(a[0]) !== undefined) f = tonumber(a[0])!; else if (tonumber(a[1]) !== undefined) f = tonumber(a[1])!;
        else this.err('Position List - scalar multiplications with invalid value type.');
        return [this.addPositionsBase(a[0], a[1], f, true)];
      },
      __eq: (a) => {
        if (!(this.isPolist(a[0]) && this.isPolist(a[1]))) this.err('Comparison of polists - argument is no polist');
        const p = (this.ud(a[0]) as PolistUD).pts, q = (this.ud(a[1]) as PolistUD).pts;
        return [p.length === q.length && p.every((v, i) => v === q[i])];
      },
    });
    meta(ID.DEFAULT, {});

    const reg = (name: string, data: Singleton, id: string) => {
      const u = this.newUD(data, id);
      G.set(name, u);
      en.set(name, u);
    };
    reg('no', { t: 'namedobj' }, ID.NAMEOBJ);
    reg('wo', { t: 'world' }, ID.WORLD);
    reg('ti', { t: 'tiles' }, ID.TILES);
    reg('po', { t: 'positions' }, ID.POSITIONS);
    reg('DEFAULT', { t: 'default' }, ID.DEFAULT);
    void self;
  }

  tableOf(x: LuaValue, y: LuaValue) { const t = new LuaTable(); t.set(1, x); t.set(2, y); return t; }

  newGroup(a: LuaValue[]): LuaValue {
    const objs: (GameObject | null)[] = [];
    if (a[0] instanceof LuaTable) {
      if (a.length > 1) this.err('New Group - more arguments than table of objects');
      const t = a[0];
      for (let r = t.next(undefined); r; r = t.next(r[0])) objs.push(this.toObject(r[1]));
    } else if (this.isGroup(a[0])) objs.push(...this.groupObjects(a[a.length - 1]));
    else if (this.isObject(a[0])) { for (const v of a) objs.push(this.toObject(v)); }
    else if (a.length > 0) this.err('New Group - argument is no object');
    return this.pushGroup(objs);
  }
  newPolist(v: LuaValue): LuaValue {
    const list: Value[] = [];
    if (this.isGroup(v)) { for (const o of this.groupObjects(v)) if (o) list.push(objValue(o)); }
    else if (v instanceof LuaTable) { const n = v.length(); for (let i = 1; i <= n; i++) list.push(this.toValue(v.getInt(i))); }
    else this.err('New Polist - false arguments');
    return this.pushPolist(list);
  }
  joinPolist(a: LuaValue, b: LuaValue): LuaValue {
    if (!((this.isPolist(a) || this.isPosition(a)) && (this.isPolist(b) || this.isPosition(b)))) this.err('Join Polist - argument is no polist, position or object');
    const list: Value[] = [];
    for (const v of [a, b]) {
      if (this.isPolist(v)) for (const p of this.polistPositions(v)) list.push(new VPos(p.x, p.y, false));
      else { const p = this.toPos(v); list.push(new VPos(p.x, p.y, false)); }
    }
    return this.pushPolist(list);
  }
  intersectSets(a: LuaValue, b: LuaValue, isIntersect: boolean): { objs: GameObject[]; size1: number; size2: number } {
    if (!((this.isGroup(a) || this.isObject(a)) && (this.isGroup(b) || this.isObject(b)))) this.err('Intersect or Diff Group - argument is no object or group');
    const set = new Set<GameObject>();
    let size1 = 0, size2 = 0;
    for (const o of this.isGroup(b) ? this.groupObjects(b) : [this.toObject(b)]) if (o) { size2++; set.add(o); }
    const out: GameObject[] = [];
    for (const o of this.isGroup(a) ? this.groupObjects(a) : [this.toObject(a)]) {
      if (!o) continue;
      size1++;
      if (isIntersect === set.has(o)) out.push(o);
    }
    return { objs: out, size1, size2 };
  }
  intersectGroup(a: LuaValue, b: LuaValue, isIntersect: boolean) { return this.pushGroup(this.intersectSets(a, b, isIntersect).objs); }
  groupEqual(a: LuaValue, b: LuaValue) { const r = this.intersectSets(a, b, false); return r.size1 === r.size2 && r.objs.length === 0; }

  objectMessage(objUD: LuaValue, msg: LuaValue, val: LuaValue): LuaValue {
    const o = this.toObject(objUD);
    if (typeof msg !== 'string') this.err('Illegal message - no string');
    const v = this.toValue(val);
    let answer: Value = null;
    if (o) answer = this.guard(() => (o.validateMessage(msg) ? SendMessage(o, msg, v) : null));
    return this.pushValue(answer);
  }
  groupMessage(g: LuaValue, msg: LuaValue, val: LuaValue, nargs: number): LuaValue[] {
    if (!this.isGroup(g)) this.err("Syntax error - usage of '.' instead of ':'");
    if (nargs < 2) this.err('Message missing');
    const d = this.ud(g) as GroupUD;
    let last: LuaValue = undefined;
    for (const m of d.members.slice()) last = this.objectMessage(m, msg, val);
    return d.members.length >= 1 ? [last] : [];
  }
  killObject(a: LuaValue[]): LuaValue[] {
    if (!(this.isObject(a[0]) || this.isGroup(a[0]))) this.err("Syntax error - usage of '.' instead of ':'");
    if (a.length !== 1) this.err('Kill of object allows no arguments');
    const list = this.isGroup(a[0]) ? (this.ud(a[0]) as GroupUD).members.slice() : [a[0]];
    for (const u of list) {
      const o = this.toObject(u);
      if (!o) continue;
      switch (o.getObjectType()) {
        case OTHER: KillOther(o as Other); break;
        case FLOOR: KillFloor((o as GridObject).pos); break;
        case STONE: KillStone((o as GridObject).pos); break;
        case ITEM: if ((o as GridObject).isDisplayable()) KillItem((o as GridObject).pos); break;
        default: this.err('Kill of object type not allowed');
      }
    }
    return [];
  }
  getStoneItemFloor(a: LuaValue[], ot: number): LuaValue {
    const args = this.isWorld(a[0]) ? a.slice(1) : a;
    const get = (p: GridPos) => ot === FLOOR ? GetFloor(p) : ot === ITEM ? GetItem(p) : GetStone(p);
    if (this.isGroup(args[0])) {
      const out: GameObject[] = [];
      for (const o of this.groupObjects(args[0])) {
        let p: GridPos;
        if (o instanceof GridObject) p = o.getOwnerPos(); else if (o instanceof Actor) p = GridPos.of(o.ai.pos); else continue;
        const r = get(p);
        if (r) out.push(r);
      }
      return this.pushGroup(out);
    }
    if (this.isPolist(args[0])) {
      const out: GameObject[] = [];
      for (const p of this.polistPositions(args[0])) { const r = get(GridPos.of(p)); if (r) out.push(r); }
      return this.pushGroup(out);
    }
    const v = args.length >= 2 && typeof args[0] === 'number' ? this.tableOf(args[0], args[1]) : args[0];
    const p = this.toPos(this.newPosition(v));
    return this.pushObject(get(new GridPos(Math.floor(p.x), Math.floor(p.y))));
  }
  sortGroup(a: LuaValue[]): LuaValue {
    if (!this.isGroup(a[0])) this.err("Syntax error - usage of '.' instead of ':'");
    const cmd = a.length >= 2 && typeof a[1] === 'string' ? a[1] : '';
    const old = this.groupObjects(a[0]);
    if (cmd === 'circular') {
      let cx = 0, cy = 0, num = 0;
      for (const o of old) if (o) { const p = toPosition(objValue(o)); cx += p.x; cy += p.y; num++; }
      if (num === 0) return this.pushGroup([]);
      cx /= num; cy /= num;
      const map = new Map<number, GameObject>();
      for (const o of old) if (o) { const p = toPosition(objValue(o)); map.set(Math.atan2(p.y - cy, p.x - cx), o); }
      return this.pushGroup([...map.keys()].sort((x, y) => x - y).map((k) => map.get(k)!));
    }
    if (cmd === 'linear') {
      let dx: number, dy: number;
      if (a.length === 2 && old.length >= 2) {
        const p0 = toPosition(objValue(old[0])), p1 = toPosition(objValue(old[1]));
        dx = p1.x - p0.x; dy = p1.y - p0.y;
      } else if (a.length === 3 && this.isPosition(a[2])) { const p = this.toPos(a[2]); dx = p.x; dy = p.y; }
      else return this.pushGroup(old);
      const l = Math.sqrt(dx * dx + dy * dy);
      if (l) { dx /= l; dy /= l; }
      const entries = old.map((o, i) => { const p = toPosition(objValue(o)); return { d: dx * p.x + dy * p.y, o, i }; });
      entries.sort((x, y) => x.d - y.d || x.i - y.i);
      return this.pushGroup(entries.map((e) => e.o));
    }
    const map = new Map<string, GameObject | null>();
    for (const o of old) map.set(toStr(o!.getAttr('name')), o);
    return this.pushGroup([...map.keys()].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)).map((k) => map.get(k)!));
  }
  worldWrite(key: LuaValue, val: LuaValue) {
    if (typeof key === 'string' || typeof key === 'number') { this.guard(() => this.worldSet(String(key), this.toValue(val))); return; }
    if ((this.isObject(key) || this.isPosition(key) || key instanceof LuaTable || this.isGroup(key) || this.isPolist(key)) &&
      (val instanceof LuaTable || this.isTile(val))) {
      let x = -1, y = -1;
      if (key instanceof LuaTable) {
        const kx = key.getInt(1), ky = key.getInt(2);
        if (typeof kx !== 'number' || typeof ky !== 'number') this.err('Invalid position value type');
        x = kx; y = ky;
      } else if (this.isPosition(key)) { const p = this.toPos(key); x = p.x; y = p.y; }
      else if (this.isObject(key)) {
        const o = this.toObject(key);
        let p: GridPos;
        if (o instanceof GridObject) p = o.getOwnerPos(); else if (o instanceof Actor) p = GridPos.of(o.ai.pos); else return;
        x = p.x; y = p.y;
      } else if (this.isGroup(key)) {
        for (const o of this.groupObjects(key)) {
          if (!o) continue;
          let p = new GridPos(0, 0);
          if (o instanceof GridObject) p = o.getOwnerPos(); else if (o instanceof Actor) p = GridPos.of(o.ai.pos);
          this.setObjectByAny(val, p.x, p.y);
        }
        return;
      } else if (this.isPolist(key)) {
        for (const p of this.polistPositions(key)) { const g = GridPos.of(p); this.setObjectByAny(val, g.x, g.y); }
        return;
      }
      this.setObjectByAny(val, x, y);
      return;
    }
    if ((this.isObject(key) || this.isPosition(key) || key instanceof LuaTable || this.isGroup(key)) && val === undefined)
      this.err('World write access with nil value (undefined tile?)');
    this.err('World write access with bad index or bad value');
  }
  addOther(a: LuaValue[]): LuaValue[] {
    if (!this.isWorld(a[0])) this.err("Syntax error - usage of '.' instead of ':'");
    if (this.isTile(a[1]) || a[1] instanceof LuaTable) this.setObjectByAny(a[a.length - 1], -1, -1);
    else if (typeof a[1] === 'number' && (this.isTile(a[2]) || a[2] instanceof LuaTable)) {
      const pl = Math.trunc(a[1]);
      if (pl !== 0 && pl !== 1) this.err('World attempt to add objects to not existing player');
      this.setObjectByAny(a[a.length - 1], -1, -1, false, player.inventory(pl));
    } else if (this.isObject(a[1]) && (this.isTile(a[2]) || a[2] instanceof LuaTable)) {
      const o = this.toObject(a[1]);
      if (!o || !('add_item' in o)) this.err('World attempt to add objects to an object that can not take other objects');
      this.setObjectByAny(a[a.length - 1], -1, -1, false, o as unknown as ItemHolder);
    }
    return [];
  }
  tileDecl(tile: LuaValue, result: LuaTable, isTop: boolean) {
    const d = this.ud(tile) as TileUD;
    if (!isTop && d.key !== undefined) { result.set(result.length() + 1, d.key); return; }
    const declOf = (p: LuaValue) => {
      if (this.isTile(p)) this.tileDecl(p, result, false);
      else if (p instanceof LuaTable) {
        if (p.length() === 0) return;
        const copy = new LuaTable();
        for (let r = p.next(undefined); r; r = p.next(r[0])) {
          const v = r[1];
          if (v instanceof LuaTable) {
            const c2 = new LuaTable();
            for (let r2 = v.next(undefined); r2; r2 = v.next(r2[0])) c2.set(r2[0], r2[1]);
            copy.set(r[0], c2);
          } else copy.set(r[0], v);
        }
        result.set(result.length() + 1, copy);
      }
    };
    declOf(d.parts[0]);
    if (d.parts[1] !== undefined) declOf(d.parts[1]);
  }

  /** lua::CallFunc: a dotted function path, called with (value, object) */
  callFunc(path: string, arg: Value, obj: GameObject | null, expectFunction: boolean) {
    const nodes = path.split('.');
    let f: LuaValue = this.L.G.get(nodes[0]);
    for (let i = 1; i < nodes.length; i++) {
      if (!(f instanceof LuaTable)) {
        if (expectFunction) throw new XLevelRuntime(`callback '${path}' failed:\nSuper domain of '${nodes[i]}' is not a table!`);
        return;
      }
      f = this.L.index(f, nodes[i]);
    }
    if (f instanceof LuaFunction) {
      try { this.L.call(f, [this.pushValue(arg), this.pushObject(obj)]); } catch (e) {
        if (e instanceof LuaError) throw new XLevelRuntime(`callback '${path}' failed:\n${String(e.value)}`);
        throw e;
      }
    } else if (expectFunction) throw new XLevelRuntime(`callback '${path}' failed:\nNo function of given name exists.`);
  }
  isFunc(name: string) { return this.L.G.get(name) instanceof LuaFunction; }
}

export function groupValue(v: Value): VGroup { return v as VGroup; }
export { VObj, VTokens };
