// C-Dogs SDL 2.5.0, translated: missions and objectives (mission.c, objective.c, mission_static.c's loading,
// map_new.c, map_archive.c's campaign loading). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import {
  rand, cmod, svec2i, svec2i_zero, svec2i_subtract, svec2i_is_zero, Rect2iNew, Rect2iIsInside, colorWhite,
  colorRed, colorGreen, colorCyan, colorYellow, colorBattleshipGrey, colorOfficeGreen, colorGravel, colorDoveGray,
  DIRECTION_COUNT, type Color, type Vec2i,
} from './base.ts';
import {
  GetString, LoadBool, LoadColor, LoadInt, LoadIntArray, LoadRect2i, LoadStr, LoadVec2i, arr, child, has,
  atoiNode, type Json,
} from './json.ts';
import { gPicManager } from './pics.ts';
import {
  IntPickupClass, IntMapObject, StrPickupClass, StrMapObject, StrWeaponClass, gWeaponClasses, IntExitStyle,
  IntKeyStyle, FPS_FRAMELIMIT,
} from './classes.ts';
import {
  gTileWall, gTileFloor, gTileRoom, gTileDoor, gTileNothing, TileClassInit, TileClassBaseStyleType,
  TileClassLoadJSON, IntWallStyle, IntFloorStyle, IntRoomStyle, IntDoorStyle, MAP_ACCESSBITS, MAP_MASKACCESS,
  MAP_FLOOR, MAP_SQUARE, MAP_WALL, MAP_DOOR, MAP_ROOM, type Exit,
} from './map.ts';
import { CHashMap } from './chashmap.ts';
import { TILE_CLASS_WALL, TILE_CLASS_FLOOR, TILE_CLASS_DOOR, type TileClass, type PickupClass, type MapObject, type WeaponClass } from './types.ts';
import type { CampaignSetting } from './state.ts';

export const MAPTYPE_CLASSIC = 0;
export const MAPTYPE_STATIC = 1;
export const MAPTYPE_CAVE = 2;
export const MAPTYPE_INTERIOR = 3;
export function MapTypeStr(t: number): string {
  return ['Classic', 'Static', 'Cave', 'Interior'][t] ?? '';
}
export function StrMapType(s: string): number {
  const i = ['Classic', 'Static', 'Cave', 'Interior'].indexOf(s);
  return i < 0 ? MAPTYPE_CLASSIC : i;
}

export const OBJECTIVE_KILL = 0;
export const OBJECTIVE_COLLECT = 1;
export const OBJECTIVE_DESTROY = 2;
export const OBJECTIVE_RESCUE = 3;
export const OBJECTIVE_INVESTIGATE = 4;
export const OBJECTIVE_HIDDEN = 1;
export const OBJECTIVE_POSKNOWN = 2;
export const OBJECTIVE_HIACCESS = 4;
export const OBJECTIVE_UNKNOWNCOUNT = 8;
export const OBJECTIVE_NOACCESS = 16;
export function ObjectiveTypeStr(t: number): string {
  return ['Kill', 'Collect', 'Destroy', 'Rescue', 'Explore'][t] ?? '';
}
export function StrObjectiveType(s: string): number {
  const i = ['Kill', 'Collect', 'Destroy', 'Rescue', 'Explore'].indexOf(s);
  return i < 0 ? OBJECTIVE_KILL : i;
}
export function ObjectiveTypeColor(t: number): Color {
  switch (t) {
    case OBJECTIVE_KILL: case OBJECTIVE_DESTROY: return colorRed;
    case OBJECTIVE_COLLECT: case OBJECTIVE_RESCUE: return colorGreen;
    case OBJECTIVE_INVESTIGATE: return colorCyan;
    default: return colorYellow;
  }
}
export interface Objective {
  Description: string;
  Type: number;
  Index: number;
  MapObjects: (MapObject | null)[];
  Pickups: (PickupClass | null)[];
  Count: number;
  Required: number;
  Flags: number;
  color: Color;
  placed: number;
  done: number;
}
export function ObjectiveLoadJSON(node: Json, version: number): Objective {
  const o: Objective = {
    Description: GetString(node, 'Description'), Type: OBJECTIVE_KILL, Index: 0, MapObjects: [], Pickups: [], Count: 0,
    Required: 0, Flags: 0, color: colorWhite, placed: 0, done: 0,
  };
  const t = LoadStr(node, 'Type');
  if (t != null) o.Type = StrObjectiveType(t);
  if (version < 8) {
    const index = LoadInt(node, 'Index', 0);
    if (o.Type === OBJECTIVE_COLLECT) o.Pickups = [IntPickupClass(index)];
    else if (o.Type === OBJECTIVE_DESTROY) o.MapObjects = [IntMapObject(index)];
    else o.Index = index;
  } else if (o.Type === OBJECTIVE_COLLECT) {
    const p = LoadStr(node, 'Pickup');
    if (p != null) o.Pickups = [StrPickupClass(p)];
    else o.Pickups = arr(node, 'Pickups').map((x) => StrPickupClass(String(x)));
  } else if (o.Type === OBJECTIVE_DESTROY) {
    const m = LoadStr(node, 'MapObject');
    if (m != null) o.MapObjects = [StrMapObject(m)];
    else o.MapObjects = arr(node, 'MapObjects').map((x) => StrMapObject(String(x)));
  } else {
    o.Index = LoadInt(node, 'Index', 0);
  }
  o.Count = LoadInt(node, 'Count', 0);
  o.Required = LoadInt(node, 'Required', 0);
  o.Flags = LoadInt(node, 'Flags', 0);
  if (version < 14) {
    if (o.Type === OBJECTIVE_RESCUE) {
      o.Flags |= OBJECTIVE_HIACCESS;
      o.Flags &= ~OBJECTIVE_NOACCESS;
    } else if (o.Type === OBJECTIVE_KILL) {
      o.Flags &= ~(OBJECTIVE_HIACCESS | OBJECTIVE_NOACCESS);
    }
  }
  return o;
}
export function ObjectiveCopy(o: Objective): Objective {
  return { ...o, MapObjects: [...o.MapObjects], Pickups: [...o.Pickups] };
}
export function ObjectiveSetup(o: Objective): void {
  o.color = ObjectiveTypeColor(o.Type);
  o.placed = 0;
  o.done = 0;
}
export const ObjectiveIsRequired = (o: Objective): boolean => o.Required > 0;
export const ObjectiveIsComplete = (o: Objective): boolean => o.done >= o.Required;
export const ObjectiveIsPerfect = (o: Objective): boolean => o.done === o.Count && o.done > o.Required;
export function ObjectiveGetPlacementAccessFlags(o: Objective): number {
  if (o.Flags & OBJECTIVE_HIACCESS) return 1;
  if (o.Flags & OBJECTIVE_NOACCESS) return 2;
  return 0;
}

export interface MissionTileClasses { Wall: TileClass; Floor: TileClass; Room: TileClass; Door: TileClass }
export interface RoomParams { Count: number; Min: number; Max: number; Edge: boolean; Overlap: boolean; Walls: number; WallLength: number; WallPad: number }
export interface DoorParams { Enabled: boolean; Min: number; Max: number; RandomPos: boolean }
export interface PillarParams { Count: number; Min: number; Max: number }
export interface CharacterPlace { Pos: Vec2i; Dir: number }
export interface MissionStatic {
  TileClasses: CHashMap<TileClass>;
  Tiles: number[];
  Access: number[];
  Items: { M: MapObject; Positions: Vec2i[] }[];
  Characters: { Index: number; Places: CharacterPlace[] }[];
  Objectives: { Index: number; PositionIndices: { Position: Vec2i; Index: number }[] }[];
  Keys: { Index: number; Positions: Vec2i[] }[];
  Pickups: { P: PickupClass; Positions: Vec2i[] }[];
  Start: Vec2i;
  Exits: Exit[];
  AltFloorsEnabled: boolean;
}
export interface Mission {
  Title: string;
  Description: string;
  Type: number;
  Size: Vec2i;
  ExitStyle: string;
  KeyStyle: string;
  Objectives: Objective[];
  Enemies: number[];
  SpecialChars: number[];
  MapObjectDensities: { M: MapObject | null; Density: number }[];
  PickupCounts: { P: PickupClass | null; Count: number }[];
  EnemyDensity: number;
  Weapons: WeaponClass[];
  Song: string | null;
  WeaponPersist: boolean;
  SkipDebrief: boolean;
  Classic: {
    TileClasses: MissionTileClasses; Walls: number; WallLength: number; CorridorWidth: number; Rooms: RoomParams;
    Squares: number; ExitEnabled: boolean; Doors: DoorParams; Pillars: PillarParams;
  };
  Static: MissionStatic;
  Cave: {
    TileClasses: MissionTileClasses; FillPercent: number; Repeat: number; R1: number; R2: number; CorridorWidth: number;
    Rooms: RoomParams; Squares: number; ExitEnabled: boolean; DoorsEnabled: boolean;
  };
  Interior: {
    TileClasses: MissionTileClasses; CorridorWidth: number; Rooms: RoomParams; ExitEnabled: boolean; Doors: DoorParams;
    Pillars: PillarParams;
  };
}

export function MissionTileClassesInitDefault(): MissionTileClasses {
  return {
    Wall: TileClassInit(gTileWall, gPicManager, IntWallStyle(0), TileClassBaseStyleType(TILE_CLASS_WALL), colorBattleshipGrey, colorOfficeGreen),
    Floor: TileClassInit(gTileFloor, gPicManager, IntFloorStyle(0), TileClassBaseStyleType(TILE_CLASS_FLOOR), colorGravel, colorOfficeGreen),
    Room: TileClassInit(gTileRoom, gPicManager, IntRoomStyle(0), TileClassBaseStyleType(TILE_CLASS_FLOOR), colorDoveGray, colorOfficeGreen),
    Door: TileClassInit(gTileDoor, gPicManager, IntDoorStyle(0), TileClassBaseStyleType(TILE_CLASS_DOOR), colorWhite, colorWhite),
  };
}
const rooms0 = (): RoomParams => ({ Count: 0, Min: 0, Max: 0, Edge: false, Overlap: false, Walls: 0, WallLength: 0, WallPad: 0 });
const doors0 = (): DoorParams => ({ Enabled: false, Min: 0, Max: 0, RandomPos: false });
const pillars0 = (): PillarParams => ({ Count: 0, Min: 0, Max: 0 });
function MissionStaticInit(): MissionStatic {
  return {
    TileClasses: new CHashMap(), Tiles: [], Access: [], Items: [], Characters: [], Objectives: [], Keys: [], Pickups: [],
    Start: svec2i_zero(), Exits: [], AltFloorsEnabled: true,
  };
}
/** MissionInit: the classic map's default tile classes are made (and their pictures masked) for every mission */
export function MissionInit(): Mission {
  const tc = MissionTileClassesInitDefault();
  return {
    Title: '', Description: '', Type: MAPTYPE_CLASSIC, Size: svec2i_zero(), ExitStyle: IntExitStyle(0),
    KeyStyle: IntKeyStyle(0), Objectives: [], Enemies: [], SpecialChars: [], MapObjectDensities: [], PickupCounts: [],
    EnemyDensity: 0, Weapons: [], Song: null, WeaponPersist: false, SkipDebrief: false,
    Classic: {
      TileClasses: tc, Walls: 0, WallLength: 0, CorridorWidth: 0, Rooms: rooms0(), Squares: 0, ExitEnabled: true,
      Doors: doors0(), Pillars: pillars0(),
    },
    Static: MissionStaticInit(),
    Cave: {
      TileClasses: tc, FillPercent: 0, Repeat: 0, R1: 0, R2: 0, CorridorWidth: 0, Rooms: rooms0(), Squares: 0,
      ExitEnabled: false, DoorsEnabled: false,
    },
    Interior: { TileClasses: tc, CorridorWidth: 0, Rooms: rooms0(), ExitEnabled: false, Doors: doors0(), Pillars: pillars0() },
  };
}

export function LoadMissionTileClasses(node: Json, version: number): MissionTileClasses {
  if (version <= 14) {
    let wallStyle: string;
    let floorStyle: string;
    let roomStyle: string;
    if (version <= 10) {
      wallStyle = IntWallStyle(LoadInt(node, 'WallStyle', 0));
      floorStyle = IntFloorStyle(LoadInt(node, 'FloorStyle', 0));
      roomStyle = IntRoomStyle(LoadInt(node, 'RoomStyle', 0));
    } else {
      wallStyle = GetString(node, 'WallStyle');
      floorStyle = GetString(node, 'FloorStyle');
      roomStyle = GetString(node, 'RoomStyle');
    }
    const doorStyle = version <= 5 ? IntDoorStyle(LoadInt(node, 'DoorStyle', 0)) : GetString(node, 'DoorStyle');
    const zero: Color = { r: 0, g: 0, b: 0, a: 0 };
    const wallMask = LoadColor(node, 'WallMask', zero);
    const floorMask = LoadColor(node, 'FloorMask', zero);
    const roomMask = LoadColor(node, 'RoomMask', zero);
    const altMask = LoadColor(node, 'AltMask', zero);
    return {
      Wall: TileClassInit(gTileWall, gPicManager, wallStyle, TileClassBaseStyleType(TILE_CLASS_WALL), wallMask, altMask),
      Floor: TileClassInit(gTileFloor, gPicManager, floorStyle, TileClassBaseStyleType(TILE_CLASS_FLOOR), floorMask, altMask),
      Room: TileClassInit(gTileRoom, gPicManager, roomStyle, TileClassBaseStyleType(TILE_CLASS_FLOOR), roomMask, altMask),
      Door: TileClassInit(gTileDoor, gPicManager, doorStyle, TileClassBaseStyleType(TILE_CLASS_DOOR), colorWhite, colorWhite),
    };
  }
  const c = child(node, 'TileClasses');
  return {
    Wall: TileClassLoadJSON(child(c, 'Wall')), Floor: TileClassLoadJSON(child(c, 'Floor')),
    Room: TileClassLoadJSON(child(c, 'Room')), Door: TileClassLoadJSON(child(c, 'Door')),
  };
}
function LoadRooms(n: Json | undefined): RoomParams {
  return {
    Count: LoadInt(n, 'Count', 0), Min: LoadInt(n, 'Min', 0), Max: LoadInt(n, 'Max', 0), Edge: LoadBool(n, 'Edge', false),
    Overlap: LoadBool(n, 'Overlap', false), Walls: LoadInt(n, 'Walls', 0), WallLength: LoadInt(n, 'WallLength', 0),
    WallPad: LoadInt(n, 'WallPad', 0),
  };
}
function LoadDoors(n: Json | undefined): DoorParams {
  return { Enabled: LoadBool(n, 'Enabled', false), Min: LoadInt(n, 'Min', 0), Max: LoadInt(n, 'Max', 0), RandomPos: LoadBool(n, 'RandomPos', false) };
}
function LoadPillars(n: Json | undefined): PillarParams {
  return { Count: LoadInt(n, 'Count', 0), Min: LoadInt(n, 'Min', 0), Max: LoadInt(n, 'Max', 0) };
}
function LoadWeapons(node: Json | undefined): WeaponClass[] {
  const out: WeaponClass[] = [];
  if (!Array.isArray(node) || node.length === 0) {
    for (const wc of gWeaponClasses.Guns) if (wc.IsRealGun) out.push(wc);
    for (const wc of gWeaponClasses.CustomGuns) if (wc.IsRealGun) out.push(wc);
  } else {
    for (const n of node) {
      const wc = StrWeaponClass(String(n));
      if (wc) out.push(wc);
    }
  }
  return out;
}

function csvInts(s: string): number[] {
  // strtok(",") skips empty tokens; atoi of each
  return s.split(',').filter((t) => t.length > 0).map((t) => atoiNode(t));
}
function TryLoadPositions(node: Json): Vec2i[] | null {
  const p = child(node, 'Positions');
  if (!Array.isArray(p)) return null;
  return p.map((pos) => { const a = pos as Json[]; return svec2i(atoiNode(a[0]), atoiNode(a[1])); });
}
function MissionStaticTryLoadJSON(node: Json, size: Vec2i, version: number, mission: number): MissionStatic | null {
  const m = MissionStaticInit();
  if (version <= 14) {
    const mtc = LoadMissionTileClasses(node, version);
    let oldTiles: number[];
    if (version === 1) {
      const t = child(node, 'Tiles');
      if (!Array.isArray(t)) return null;
      oldTiles = t.map((x) => atoiNode(x) & 0xffff);
    } else {
      oldTiles = csvInts(GetString(node, 'Tiles')).map((x) => x & 0xffff);
    }
    for (let t of oldTiles) {
      m.Access.push(t & MAP_ACCESSBITS);
      t &= MAP_MASKACCESS;
      let base: TileClass;
      switch (t) {
        case MAP_FLOOR: case MAP_SQUARE: base = mtc.Floor; break;
        case MAP_WALL: base = mtc.Wall; break;
        case MAP_DOOR: base = mtc.Door; break;
        case MAP_ROOM: base = mtc.Room; break;
        default: base = gTileNothing; break;
      }
      const key = `${t}`;
      if (!m.TileClasses.has(key)) m.TileClasses.set(key, { ...base, Mask: { ...base.Mask }, MaskAlt: { ...base.MaskAlt } });
      m.Tiles.push(t);
    }
  } else {
    const classes = child(node, 'TileClasses');
    if (classes && typeof classes === 'object' && !Array.isArray(classes)) {
      for (const k of Object.keys(classes)) m.TileClasses.set(k, TileClassLoadJSON(classes[k]));
    }
    for (const row of arr(node, 'Tiles')) m.Tiles.push(...csvInts(String(row)));
    for (const row of arr(node, 'Access')) m.Access.push(...csvInts(String(row)).map((x) => x & 0xffff));
  }
  // LoadStaticItems
  for (const it of arr(node, 'StaticItems')) {
    let mo: MapObject | null;
    if (version <= 3) mo = IntMapObject(LoadInt(it, 'Index', 0));
    else {
      const name = GetString(it, 'MapObject');
      mo = StrMapObject(name);
      if (mo == null && version <= 11 && name.endsWith(' spawner')) {
        mo = StrMapObject(`${name.slice(0, name.length - ' spawner'.length)} ammo spawner`);
      }
    }
    if (mo == null) continue;
    const pos = TryLoadPositions(it);
    if (pos == null) continue;
    m.Items.push({ M: mo, Positions: pos });
  }
  if (version < 13) {
    for (const it of arr(node, 'StaticWrecks')) {
      let mo: MapObject | null;
      if (version <= 3) mo = IntMapObject(LoadInt(it, 'Index', 0));
      else {
        const base = StrMapObject(GetString(it, 'MapObject'));
        mo = base ? StrMapObject(base.Wreck.MO) : null;
      }
      if (mo == null) continue;
      const pos = TryLoadPositions(it);
      if (pos == null) continue;
      m.Items.push({ M: mo, Positions: pos });
    }
  }
  for (const ch of arr(node, 'StaticCharacters')) {
    const cps = { Index: LoadInt(ch, 'Index', 0), Places: [] as CharacterPlace[] };
    const positions = TryLoadPositions(ch);
    if (positions) for (const p of positions) cps.Places.push({ Pos: p, Dir: cmod(rand(), DIRECTION_COUNT) });
    for (const pl of arr(ch, 'Places')) cps.Places.push({ Pos: LoadVec2i(pl, 'Pos', svec2i_zero()), Dir: LoadInt(pl, 'Dir', 0) });
    m.Characters.push(cps);
  }
  for (const ob of arr(node, 'StaticObjectives')) {
    const op = { Index: LoadInt(ob, 'Index', 0), PositionIndices: [] as { Position: Vec2i; Index: number }[] };
    const positions = child(ob, 'Positions');
    if (!Array.isArray(positions)) continue;
    const opPositions: Vec2i[] = [];
    for (const p of positions) {
      const a = p as Json[];
      if (a.length < 2) continue;
      const pos = svec2i(atoiNode(a[0]), atoiNode(a[1]));
      if (!Rect2iIsInside(Rect2iNew(svec2i_zero(), size), pos)) continue;
      opPositions.push(pos);
    }
    const indices = LoadIntArray(ob, 'Indices');
    for (let i = 0; i < Math.min(opPositions.length, indices.length); i++) {
      op.PositionIndices.push({ Position: opPositions[i], Index: indices[i] });
    }
    m.Objectives.push(op);
  }
  for (const k of arr(node, 'StaticKeys')) {
    const pos = TryLoadPositions(k);
    if (pos == null) continue;
    m.Keys.push({ Index: LoadInt(k, 'Index', 0), Positions: pos });
  }
  for (const p of arr(node, 'StaticPickups')) {
    const pc = StrPickupClass(GetString(p, 'Pickup'));
    if (pc == null) continue;
    const pos = TryLoadPositions(p);
    if (pos == null) continue;
    m.Pickups.push({ P: pc, Positions: pos });
  }
  m.Start = LoadVec2i(node, 'Start', m.Start);
  if (version < 16) {
    const exitNode = child(node, 'Exit');
    if (exitNode != null) {
      const pos = LoadVec2i(exitNode, 'Start', svec2i_zero());
      const end = LoadVec2i(exitNode, 'End', svec2i_zero());
      const sz = svec2i_subtract(end, pos);
      if (!svec2i_is_zero(sz)) m.Exits.push({ R: Rect2iNew(pos, sz), Mission: mission + 1, Hidden: false });
    }
  } else {
    for (const e of arr(node, 'Exits')) {
      m.Exits.push({
        R: LoadRect2i(e, 'Rect', Rect2iNew(svec2i_zero(), svec2i_zero())), Mission: LoadInt(e, 'Mission', 0),
        Hidden: LoadBool(e, 'Hidden', false),
      });
    }
  }
  m.AltFloorsEnabled = LoadBool(node, 'AltFloorsEnabled', true);
  return m;
}
export function MissionStaticGetTileClass(m: MissionStatic, size: Vec2i, pos: Vec2i): TileClass | null {
  if (!Rect2iIsInside(Rect2iNew(svec2i_zero(), size), pos)) return null;
  const tile = m.Tiles[size.x * pos.y + pos.x];
  if (tile < 0) return null;
  return m.TileClasses.get(`${tile}`) ?? null;
}

export function LoadMissions(missions: Mission[], missionsNode: Json[], version: number): void {
  let mission = 0;
  for (const c of missionsNode) {
    const m = MissionInit();
    m.Title = GetString(c, 'Title');
    m.Description = GetString(c, 'Description');
    const t = LoadStr(c, 'Type');
    if (t != null) m.Type = StrMapType(t);
    m.Size = svec2i(LoadInt(c, 'Width', 0), LoadInt(c, 'Height', 0));
    m.ExitStyle = version <= 9 ? IntExitStyle(LoadInt(c, 'ExitStyle', 0)) : GetString(c, 'ExitStyle');
    m.KeyStyle = version <= 8 ? IntKeyStyle(LoadInt(c, 'KeyStyle', 0)) : GetString(c, 'KeyStyle');
    for (const o of arr(c, 'Objectives')) m.Objectives.push(ObjectiveLoadJSON(o, version));
    m.Enemies = LoadIntArray(c, 'Enemies');
    m.SpecialChars = LoadIntArray(c, 'SpecialChars');
    if (version <= 3) {
      const items = LoadIntArray(c, 'Items');
      const dens = LoadIntArray(c, 'ItemDensities');
      for (let i = 0; i < items.length; i++) m.MapObjectDensities.push({ M: IntMapObject(items[i]), Density: dens[i] });
    } else {
      for (const mod of arr(c, 'MapObjectDensities')) {
        m.MapObjectDensities.push({ M: StrMapObject(GetString(mod, 'MapObject')), Density: LoadInt(mod, 'Density', 0) });
      }
    }
    for (const pc of arr(c, 'PickupCounts')) {
      m.PickupCounts.push({ P: StrPickupClass(GetString(pc, 'Pickup')), Count: LoadInt(pc, 'Count', 0) });
    }
    m.EnemyDensity = LoadInt(c, 'EnemyDensity', 0);
    m.Weapons = LoadWeapons(child(c, 'Weapons'));
    m.WeaponPersist = LoadBool(c, 'WeaponPersist', false);
    m.SkipDebrief = LoadBool(c, 'SkipDebrief', false);
    m.Song = LoadStr(c, 'Song');
    switch (m.Type) {
      case MAPTYPE_CLASSIC:
        m.Classic.TileClasses = LoadMissionTileClasses(c, version);
        m.Classic.Walls = LoadInt(c, 'Walls', 0);
        m.Classic.WallLength = LoadInt(c, 'WallLength', 0);
        m.Classic.CorridorWidth = LoadInt(c, 'CorridorWidth', 0);
        m.Classic.Rooms = LoadRooms(child(c, 'Rooms'));
        m.Classic.Squares = LoadInt(c, 'Squares', 0);
        m.Classic.ExitEnabled = LoadBool(c, 'ExitEnabled', true);
        m.Classic.Doors = LoadDoors(child(c, 'Doors'));
        m.Classic.Pillars = LoadPillars(child(c, 'Pillars'));
        break;
      case MAPTYPE_STATIC: {
        const s = MissionStaticTryLoadJSON(c, m.Size, version, mission);
        if (s == null) { mission++; continue; }
        m.Static = s;
        break;
      }
      case MAPTYPE_CAVE:
        m.Cave.TileClasses = LoadMissionTileClasses(c, version);
        m.Cave.FillPercent = LoadInt(c, 'FillPercent', 0);
        m.Cave.Repeat = LoadInt(c, 'Repeat', 0);
        m.Cave.R1 = LoadInt(c, 'R1', 0);
        m.Cave.R2 = LoadInt(c, 'R2', 0);
        if (has(c, 'Rooms')) m.Cave.Rooms = LoadRooms(child(c, 'Rooms'));
        m.Cave.Squares = LoadInt(c, 'Squares', 0);
        m.Cave.ExitEnabled = LoadBool(c, 'ExitEnabled', true);
        m.Cave.DoorsEnabled = version < 14 ? true : LoadBool(c, 'DoorsEnabled', false);
        break;
      case MAPTYPE_INTERIOR:
        m.Interior.TileClasses = LoadMissionTileClasses(c, version);
        m.Interior.CorridorWidth = LoadInt(c, 'CorridorWidth', 0);
        m.Interior.Rooms = LoadRooms(child(c, 'Rooms'));
        m.Interior.ExitEnabled = LoadBool(c, 'ExitEnabled', true);
        m.Interior.Doors = LoadDoors(child(c, 'Doors'));
        m.Interior.Pillars = LoadPillars(child(c, 'Pillars'));
        break;
      default:
        mission++;
        continue;
    }
    missions.push(m);
    mission++;
  }
}

export function MapNewLoadCampaignJSON(root: Json, c: CampaignSetting): void {
  c.Title = GetString(root, 'Title');
  c.Author = GetString(root, 'Author');
  c.Description = GetString(root, 'Description');
  c.Ammo = LoadBool(root, 'Ammo', c.Ammo);
  c.SkipWeaponMenu = LoadBool(root, 'SkipWeaponMenu', c.SkipWeaponMenu);
  c.BuyAndSell = LoadBool(root, 'BuyAndSell', c.BuyAndSell);
  c.RandomPickups = LoadBool(root, 'RandomPickups', true);
  c.DoorOpenTicks = LoadInt(root, 'DoorOpenTicks', FPS_FRAMELIMIT);
  c.Lives = LoadInt(root, 'Lives', c.Lives);
  c.MaxLives = LoadInt(root, 'MaxLives', c.MaxLives);
  c.PlayerHP = LoadInt(root, 'PlayerHP', c.PlayerHP);
  c.PlayerMaxHP = LoadInt(root, 'PlayerMaxHP', c.PlayerMaxHP);
  c.PlayerExcessHP = LoadInt(root, 'PlayerExcessHP', c.PlayerExcessHP);
}

export function MissionGetTileClasses(m: Mission): MissionTileClasses | null {
  switch (m.Type) {
    case MAPTYPE_CLASSIC: return m.Classic.TileClasses;
    case MAPTYPE_CAVE: return m.Cave.TileClasses;
    case MAPTYPE_INTERIOR: return m.Interior.TileClasses;
    default: return null;
  }
}
export function KeycardCount(flags: number): number {
  let n = 0;
  for (const f of [8, 4, 2, 1]) if (flags & f) n++;
  return n;
}
export function KeyColor(flags: number): Color {
  switch (flags) {
    case 1: return { r: 252, g: 224, b: 0, a: 255 };
    case 2: return { r: 0, g: 252, b: 0, a: 255 };
    case 4: return { r: 0, g: 252, b: 252, a: 255 };
    case 8: return { r: 132, g: 0, b: 0, a: 255 };
    default: return { r: 172, g: 172, b: 172, a: 255 };
  }
}
export function KeycardStr(d: number): string {
  return ({ 1: 'yellow', 2: 'green', 4: 'blue', 8: 'red' } as Record<number, string>)[d] ?? '';
}
export const ObjectiveFromThing = (f: number): number => (((f & (8 + 16 + 32 + 64 + 128)) >> 3) - 1);
export const ObjectiveToThing = (o: number): number => (o + 1) << 3;

export { TILE_CLASS_DOOR, TILE_CLASS_FLOOR };
