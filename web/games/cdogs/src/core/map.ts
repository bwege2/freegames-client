// C-Dogs SDL 2.5.0, translated: the map and what is on it (tile_class.c, tile.c, triggers.c, map.c, los.c,
// thing.c, collision/collision.c, collision/minkowski_hex.c). GPL-2.0-or-later / BSD-2-Clause
// (web/games/cdogs/LICENSE.md).
import {
  f32, rand, cmod, idiv, toInt, RAND_FLOAT, MAX, svec2, svec2i, svec2_zero, svec2_add, svec2_subtract,
  svec2_scale, svec2_clamp, svec2_is_zero, svec2i_add, svec2i_scale, svec2i_subtract,
  svec2i_assign_vec2, svec2i_one, svec2i_zero, svec2i_distance_squared, svec2_assign_vec2i, Vec2ToTile,
  Vec2iToTile, Vec2CenterOfTile, Vec2iCenterOfTile, Rect2iNew, Rect2iIsInside, Rect2iCenter, HasClearLineJMRaytrace,
  BresenhamLineDraw, colorWhite, colorBattleshipGrey, colorOfficeGreen, colorGravel, ColorStr, svec2_length_squared,
  TILE_WIDTH, TILE_HEIGHT, TILE_SIZE, type Vec2, type Vec2i, type Color, type Rect2i,
} from './base.ts';
import {
  gPicManager, PicManagerGetPic, PicManagerGenerateMaskedStylePic, CPicUpdate, type PicManager, type Pic,
} from './pics.ts';
import { LoadBool, LoadColor, LoadStr, type Json } from './json.ts';
import {
  KIND_CHARACTER, KIND_PARTICLE, KIND_MOBILEOBJECT, KIND_OBJECT, KIND_PICKUP, TILE_CLASS_FLOOR, TILE_CLASS_WALL,
  TILE_CLASS_DOOR, TILE_CLASS_NOTHING,
  type Thing, type ThingId, type Tile, type TileClass, type DoorState, type TActor,
} from './types.ts';
import { gActors, gObjs, gMobObjs, gParticles, gPickups, gCampaign, gMission, IsPVP } from './state.ts';
import { GameEventNew, GameEventsEnqueue, GameEventCopy, gGameEvents, GAME_EVENT_TRIGGER, GAME_EVENT_EXPLORE_TILES, type GameEvent } from './events.ts';
import { ConfigGetEnum, ConfigGetInt, ALLYCOLLISION_NORMAL } from './config.ts';
import { soundHooks } from './sounds.ts';
import { FLAGS_KEYCARD_RED, FLAGS_KEYCARD_BLUE, FLAGS_KEYCARD_GREEN, FLAGS_KEYCARD_YELLOW } from './classes.ts';

// ---------------------------------------------------------------------------------------------------------------
// tile_class.c

function tc(Name: string | null, canWalk: boolean, isOpaque: boolean, shootable: boolean, IsRoom: boolean, Type: number): TileClass {
  return {
    Name, Pic: null, Style: null, StyleType: null, Mask: { ...colorWhite }, MaskAlt: { ...colorWhite }, canWalk,
    isOpaque, shootable, IsRoom, Type, DamageBullet: null,
  };
}
export const gTileFloor = tc('tile', true, false, false, false, TILE_CLASS_FLOOR);
export const gTileRoom = tc('tile', true, false, false, true, TILE_CLASS_FLOOR);
export const gTileWall = tc('wall', false, true, true, false, TILE_CLASS_WALL);
export const gTileNothing = tc(null, false, false, false, false, TILE_CLASS_NOTHING);
export const gTileExit = tc('exits', true, false, false, false, TILE_CLASS_FLOOR);
export const gTileDoor = tc('door', false, true, true, true, TILE_CLASS_DOOR);

export function TileClassTypeStr(t: number): string {
  return ['Floor', 'Wall', 'Door'][t] ?? '';
}
export function StrTileClassType(s: string): number {
  switch (s) {
    case 'Floor': return TILE_CLASS_FLOOR;
    case 'Wall': return TILE_CLASS_WALL;
    case 'Door': return TILE_CLASS_DOOR;
    default: return TILE_CLASS_NOTHING;
  }
}
export function TileClassLoadJSON(node: Json | undefined): TileClass {
  const t = tc(null, false, false, false, false, TILE_CLASS_FLOOR);
  t.Mask = { r: 0, g: 0, b: 0, a: 0 };
  t.MaskAlt = { r: 0, g: 0, b: 0, a: 0 };
  t.Name = LoadStr(node, 'Name');
  const type = LoadStr(node, 'Type');
  if (type != null) t.Type = StrTileClassType(type);
  t.Style = LoadStr(node, 'Style');
  t.Mask = LoadColor(node, 'Mask', t.Mask);
  t.MaskAlt = LoadColor(node, 'MaskAlt', t.MaskAlt);
  t.canWalk = LoadBool(node, 'CanWalk', false);
  t.isOpaque = LoadBool(node, 'IsOpaque', false);
  t.shootable = LoadBool(node, 'Shootable', false);
  t.IsRoom = LoadBool(node, 'IsRoom', false);
  t.DamageBullet = LoadStr(node, 'DamageBullet');
  return t;
}
export function TileClassBaseStyleType(type: number): string {
  switch (type) {
    case TILE_CLASS_FLOOR: return 'normal';
    case TILE_CLASS_WALL: return 'o';
    case TILE_CLASS_DOOR: return 'normal_h';
    default: return '';
  }
}
export function TileClassCopy(src: TileClass): TileClass {
  const d = { ...src, Mask: { ...src.Mask }, MaskAlt: { ...src.MaskAlt } };
  if (src.StyleType) d.StyleType = TileClassBaseStyleType(src.Type);
  return d;
}
export function TileClassGetName(base: TileClass, style: string | null, type: string | null, mask: Color, maskAlt: Color): string {
  return `${TileClassTypeStr(base.Type)}${base.IsRoom ? 'room' : ''}/${style ?? '(null)'}/${type ?? '(null)'}/${ColorStr(mask)}/${ColorStr(maskAlt)}`;
}
export function TileClassGetBaseName(t: TileClass): string {
  return TileClassGetName(t, t.Style, TileClassBaseStyleType(t.Type), t.Mask, t.MaskAlt);
}
export function TileClassGetPic(pm: PicManager, t: TileClass): Pic | null {
  return PicManagerGetPic(pm, `${t.Name}/${t.Style}/${t.StyleType}/${ColorStr(t.Mask)}/${ColorStr(t.MaskAlt)}`);
}
export function TileClassReloadPic(t: TileClass, pm: PicManager): void {
  if (t.Name != null && t.Name.length !== 0) {
    PicManagerGenerateMaskedStylePic(pm, t.Name, t.Style ?? '(null)', t.StyleType ?? '(null)', t.Mask, t.MaskAlt, false);
    t.Pic = TileClassGetPic(pm, t);
  }
}
export function TileClassInit(base: TileClass, pm: PicManager, style: string | null, type: string | null, mask: Color,
  maskAlt: Color): TileClass {
  const t: TileClass = { ...base, Mask: { ...mask }, MaskAlt: { ...maskAlt } };
  t.Style = style ?? null;
  t.StyleType = type && type.length ? type : null;
  if (!(type && type.length)) t.StyleType = base.StyleType;
  TileClassReloadPic(t, pm);
  return t;
}
export function TileClassInitDefault(base: TileClass, pm: PicManager, forceStyle: string | null, forceMask: Color | null): TileClass {
  let style = IntFloorStyle(0);
  let mask = colorBattleshipGrey;
  const maskAlt = colorOfficeGreen;
  switch (base.Type) {
    case TILE_CLASS_WALL: style = IntWallStyle(0); mask = colorGravel; break;
    case TILE_CLASS_DOOR: style = IntDoorStyle(0); mask = colorWhite; break;
    default: break;
  }
  if (forceStyle != null) style = forceStyle;
  if (forceMask != null) mask = forceMask;
  return TileClassInit(base, pm, style, TileClassBaseStyleType(base.Type), mask, maskAlt);
}
export type TileClasses = Map<string, TileClass>;
export function StrTileClass(c: TileClasses, name: string | null): TileClass {
  if (name == null || name.length === 0) return gTileNothing;
  return c.get(name) ?? gTileNothing;
}
export function TileClassesGetMaskedTile(c: TileClasses, base: TileClass, style: string | null, type: string,
  mask: Color, maskAlt: Color): TileClass {
  return StrTileClass(c, TileClassGetName(base, style, type, mask, maskAlt));
}
export function TileClassesAdd(c: TileClasses, pm: PicManager, base: TileClass, style: string | null, type: string | null,
  mask: Color, maskAlt: Color): TileClass {
  const t = TileClassInit(base, pm, style, type, mask, maskAlt);
  c.set(TileClassGetName(t, style, type, mask, maskAlt), t);
  return t;
}
export function TileClassesGetExit(c: TileClasses, pm: PicManager, style: string, isShadow: boolean): TileClass {
  const type = isShadow ? 'shadow' : 'normal';
  const t = StrTileClass(c, TileClassGetName(gTileExit, style, type, colorWhite, colorWhite));
  if (t !== gTileNothing) return t;
  PicManagerGenerateMaskedStylePic(pm, 'exits', style, type, colorWhite, colorWhite, true);
  return TileClassesAdd(c, pm, gTileExit, style, type, colorWhite, colorWhite);
}

// pics.c
export const WALL_TYPE_COUNT = 16;
export const FLOOR_TYPES = 4;
export function IntWallType(i: number): string {
  return ['o', 'w', 'e', 'n', 's', 'nw', 'ne', 'sw', 'se', 'wt', 'et', 'nt', 'st', 'v', 'h', 'x'][i];
}
export function IntWallStyle(i: number): string {
  return ['steel', 'brick', 'carbon', 'steelwood', 'stone', 'plasteel', 'granite'][Math.abs(i) % 7];
}
export function IntTileType(i: number): string {
  return ['shadow', 'normal', 'alt1', 'alt2'][Math.abs(i) % 4];
}
export function IntFloorStyle(i: number): string {
  return ['recessed', 'tile', 'dirt', 'flat', 'striped', 'smallsquare', 'stone', 'wood', 'biggrid', 'grid'][Math.abs(i) % 10];
}
export function IntRoomStyle(i: number): string {
  return ['recessed', 'tile', 'dirt', 'flat', 'striped', 'smallsquare', 'stone', 'wood', 'grid', 'biggrid', 'checker'][Math.abs(i) % 11];
}
export function IntDoorStyle(i: number): string {
  return ['office', 'dungeon', 'blast', 'alien'][Math.abs(i) % 4];
}

// ---------------------------------------------------------------------------------------------------------------
// tile.c

export const DOORSTATE_COUNT = 15;
export function DoorStateInit(d: DoorState, isOpen: boolean): void {
  d.Count = DOORSTATE_COUNT;
  d.IsOpen = isOpen;
}
export function newTile(): Tile {
  return {
    Class: gTileNothing, Door: { Count: 0, IsOpen: false, Class: null, Class2: null, IsHorizontal: false },
    triggers: [], things: [], outOfSight: false, isVisited: false,
  };
}
function doorClosed(t: Tile): boolean {
  return t.Class.Type === TILE_CLASS_DOOR && t.Door.Class != null && !t.Door.IsOpen && t.Door.Class.Name != null;
}
export function TileIsOpaque(t: Tile | null): boolean {
  return t != null && (doorClosed(t) ? t.Door.Class!.isOpaque : t.Class.isOpaque);
}
export function TileIsShootable(t: Tile): boolean {
  return doorClosed(t) ? t.Door.Class!.shootable : t.Class.shootable;
}
export function TileCanWalk(t: Tile | null): boolean {
  if (t == null) return false;
  return doorClosed(t) ? t.Door.Class!.canWalk : t.Class.canWalk;
}
export function TileIsClear(t: Tile | null): boolean {
  if (t == null || !TileCanWalk(t)) return false;
  for (const tid of t.things) if (tid.Kind !== KIND_PARTICLE && tid.Kind !== KIND_PICKUP) return false;
  return true;
}
export function TileHasCharacter(t: Tile): boolean {
  return t.things.some((tid) => tid.Kind === KIND_CHARACTER);
}

// ---------------------------------------------------------------------------------------------------------------
// triggers.c

export const ACTION_NULL = 0;
export const ACTION_SETTRIGGER = 1;
export const ACTION_CLEARTRIGGER = 2;
export const ACTION_EVENT = 3;
export const ACTION_ACTIVATEWATCH = 4;
export const ACTION_DEACTIVATEWATCH = 5;
export interface TAction { Type: number; index: number; Event: GameEvent | null }
export interface Trigger { id: number; flags: number; isActive: boolean; cannotActivateLock: number; actions: TAction[] }
export interface Condition { Type: number; Counter: number; CounterMax: number; Pos: Vec2i }
export interface TWatch { index: number; conditions: Condition[]; actions: TAction[]; active: boolean }
export const CONDITION_TILECLEAR = 1;
const CANNOT_ACTIVATE_LOCK = 50;

export const gWatches: TWatch[] = [];
let watchIndex = 1;
export function TriggerNew(): Trigger {
  return { id: 0, flags: 0, isActive: true, cannotActivateLock: 0, actions: [] };
}
export function TriggerAddAction(t: Trigger): TAction {
  const a: TAction = { Type: ACTION_NULL, index: 0, Event: null };
  t.actions.push(a);
  return a;
}
export function WatchNew(): TWatch {
  const w: TWatch = { index: watchIndex++, conditions: [], actions: [], active: false };
  gWatches.push(w);
  return w;
}
export function WatchAddCondition(w: TWatch, type: number, counterMax: number, pos: Vec2i): Condition {
  const c: Condition = { Type: type, Counter: 0, CounterMax: counterMax, Pos: pos };
  w.conditions.push(c);
  return c;
}
export function WatchAddAction(w: TWatch): TAction {
  const a: TAction = { Type: ACTION_NULL, index: 0, Event: null };
  w.actions.push(a);
  return a;
}
export function WatchesInit(): void {
  gWatches.length = 0;
}
function ActivateWatch(idx: number): void {
  for (const w of gWatches) {
    if (w.index === idx) {
      w.active = true;
      for (const c of w.conditions) c.Counter = 0;
      return;
    }
  }
}
function DeactivateWatch(idx: number): void {
  for (const w of gWatches) {
    if (w.index === idx) {
      w.active = false;
      return;
    }
  }
}
function ActionRun(a: TAction, mapTriggers: Trigger[]): void {
  switch (a.Type) {
    case ACTION_SETTRIGGER:
      for (const tr of mapTriggers) {
        if (tr.id === a.index) {
          tr.isActive = true;
          break;
        }
      }
      break;
    case ACTION_CLEARTRIGGER:
      for (const tr of mapTriggers) {
        if (tr.id === a.index) {
          tr.isActive = false;
          break;
        }
      }
      break;
    case ACTION_EVENT:
      GameEventsEnqueue(gGameEvents, GameEventCopy(a.Event!));
      break;
    case ACTION_ACTIVATEWATCH:
      ActivateWatch(a.index);
      break;
    case ACTION_DEACTIVATEWATCH:
      DeactivateWatch(a.index);
      break;
    default:
      break;
  }
}
function ConditionsMet(conditions: Condition[], ticks: number): boolean {
  let all = true;
  for (const c of conditions) {
    let met = false;
    if (c.Type === CONDITION_TILECLEAR) {
      const tile = MapGetTile(gMap, c.Pos);
      met = tile != null && !TileHasCharacter(tile);
    }
    if (met) {
      c.Counter += ticks;
      all = all && c.Counter >= c.CounterMax;
    } else {
      c.Counter = 0;
      all = false;
    }
  }
  return all;
}
export function TriggerTryActivate(t: Trigger, flags: number, tilePos: Vec2i): boolean {
  const canActivate = t.isActive && (t.flags === 0 || (t.flags & flags) !== 0);
  if (canActivate) {
    const e = GameEventNew(GAME_EVENT_TRIGGER);
    e.u.ID = t.id >>> 0;
    e.u.Tile = { x: tilePos.x, y: tilePos.y };
    GameEventsEnqueue(gGameEvents, e);
  } else if (t.cannotActivateLock > 0) {
    t.cannotActivateLock--;
  }
  return canActivate;
}
export const TriggerCannotActivate = (t: Trigger): boolean => t.cannotActivateLock === 0;
export function TriggerSetCannotActivate(t: Trigger): void {
  t.cannotActivateLock = CANNOT_ACTIVATE_LOCK;
}
export function TriggerActivate(t: Trigger, mapTriggers: Trigger[]): void {
  for (const a of t.actions) ActionRun(a, mapTriggers);
}
export function UpdateWatches(mapTriggers: Trigger[], ticks: number): void {
  for (let i = 0; i < gWatches.length; i++) {
    const w = gWatches[i];
    if (!w.active) continue;
    if (ConditionsMet(w.conditions, ticks)) {
      for (let j = 0; j < w.actions.length; j++) ActionRun(w.actions[j], mapTriggers);
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// map.c

export const MAP_FLOOR = 0;
export const MAP_WALL = 1;
export const MAP_DOOR = 2;
export const MAP_ROOM = 3;
export const MAP_NOTHING = 4;
export const MAP_SQUARE = 5;
export const MAP_ACCESS_RED = 0x800;
export const MAP_ACCESS_BLUE = 0x400;
export const MAP_ACCESS_GREEN = 0x200;
export const MAP_ACCESS_YELLOW = 0x100;
export const MAP_MASKACCESS = 0xff;
export const MAP_ACCESSBITS = 0x0f00;

export interface Exit { R: Rect2i; Mission: number; Hidden: boolean }
export interface GameMap {
  TileClasses: TileClasses;
  Tiles: Tile[];
  Size: Vec2i;
  LOS: { LOS: boolean[]; Explored: boolean[] };
  access: number[];
  triggers: Trigger[];
  triggerId: number;
  tilesSeen: number;
  keyAccessCount: number;
  start: Vec2i;
  exits: Exit[];
  NumExplorableTiles: number;
}
export const gMap: GameMap = {
  TileClasses: new Map(), Tiles: [], Size: svec2i_zero(), LOS: { LOS: [], Explored: [] }, access: [], triggers: [],
  triggerId: 0, tilesSeen: 0, keyAccessCount: 0, start: svec2i_zero(), exits: [], NumExplorableTiles: 0,
};

export function GetAccessMask(k: number): number {
  return k === -1 ? 0 : (MAP_ACCESS_YELLOW << k) & 0xffff;
}
export function MapIsTileIn(map: GameMap, pos: Vec2i): boolean {
  return Rect2iIsInside(Rect2iNew(svec2i_zero(), map.Size), pos);
}
export function MapGetTile(map: GameMap, pos: Vec2i): Tile | null {
  if (!MapIsTileIn(map, pos)) return null;
  return map.Tiles[pos.y * map.Size.x + pos.x];
}
function MapIsPosIn(map: GameMap, pos: Vec2): boolean {
  return pos.x >= 0 && pos.y >= 0 && MapIsTileIn(map, Vec2ToTile(pos));
}
export function MapIsTileInExit(map: GameMap, ti: Thing, exit: number): number {
  if (exit < 0) {
    for (let i = 0; i < map.exits.length; i++) if (MapIsTileInExit(map, ti, i) !== -1) return i;
    return -1;
  }
  const tilePos = Vec2ToTile(ti.Pos);
  const e = map.exits[exit];
  const r = Rect2iNew(e.R.Pos, svec2i_add(e.R.Size, svec2i_one()));
  return Rect2iIsInside(r, tilePos) ? exit : -1;
}
export function MapTryMoveThing(map: GameMap, t: Thing, pos: Vec2): boolean {
  if (!MapIsPosIn(map, pos)) return false;
  t.LastPos = t.Pos;
  const doRemove = t.Pos.x >= 0 && t.Pos.y >= 0;
  const t1 = Vec2ToTile(t.Pos);
  const t2 = Vec2ToTile(pos);
  if (t1.x === t2.x && t1.y === t2.y && doRemove) {
    t.Pos = pos;
    return true;
  }
  if (doRemove) MapRemoveThing(map, t);
  t.Pos = pos;
  MapGetTile(map, t2)!.things.push({ Id: t.id, Kind: t.kind });
  return true;
}
export function MapRemoveThing(map: GameMap, t: Thing): void {
  if (!MapIsPosIn(map, t.Pos)) return;
  const tile = MapGetTile(map, Vec2ToTile(t.Pos))!;
  const i = tile.things.findIndex((tid) => tid.Id === t.id && tid.Kind === t.kind);
  if (i >= 0) tile.things.splice(i, 1);
}
export function MapGetRandomTile(map: GameMap): Vec2i {
  const x = cmod(rand(), map.Size.x);
  const y = cmod(rand(), map.Size.y);
  return svec2i(x, y);
}
export function MapGetRandomPos(map: GameMap): Vec2 {
  for (;;) {
    const x = RAND_FLOAT(0, map.Size.x * TILE_WIDTH);
    const y = RAND_FLOAT(0, map.Size.y * TILE_HEIGHT);
    const pos = svec2(x, y);
    if (pos.x < map.Size.x * TILE_WIDTH && pos.y < map.Size.y * TILE_HEIGHT) return pos;
  }
}
function MapChangeFloor(map: GameMap, pos: Vec2i, normal: TileClass, shadow: TileClass): void {
  const tAbove = MapGetTile(map, svec2i(pos.x, pos.y - 1));
  const canSeeTileAbove = !(pos.y > 0 && TileIsOpaque(tAbove));
  const t = MapGetTile(map, pos);
  if (t == null || t.Class.Type !== TILE_CLASS_FLOOR) return;
  t.Class = canSeeTileAbove ? normal : shadow;
}
export function MapHasExits(m: GameMap): boolean {
  return m.exits.length > 0 && !IsPVP(gCampaign.Entry.Mode);
}
export function MapShowExitArea(map: GameMap, i: number): void {
  const exit = map.exits[i];
  const left = exit.R.Pos.x;
  const right = left + exit.R.Size.x;
  const top = exit.R.Pos.y;
  const bottom = top + exit.R.Size.y;
  const style = gMission.missionData!.ExitStyle;
  const exitClass = TileClassesGetExit(map.TileClasses, gPicManager, style, false);
  const exitShadowClass = TileClassesGetExit(map.TileClasses, gPicManager, style, true);
  for (let x = left; x <= right; x++) MapChangeFloor(map, svec2i(x, top), exitClass, exitShadowClass);
  for (let x = left; x <= right; x++) MapChangeFloor(map, svec2i(x, bottom), exitClass, exitShadowClass);
  for (let y = top + 1; y < bottom; y++) MapChangeFloor(map, svec2i(left, y), exitClass, exitShadowClass);
  for (let y = top + 1; y < bottom; y++) MapChangeFloor(map, svec2i(right, y), exitClass, exitShadowClass);
}
export function MapGetExitPos(m: GameMap, i: number): Vec2 {
  return svec2_assign_vec2i(Vec2iCenterOfTile(Rect2iCenter(m.exits[i].R)));
}
export function MapHasLockedRooms(map: GameMap): boolean {
  return map.access.some((a) => a !== 0);
}
export function AccessCodeToFlags(code: number): number {
  if (code & MAP_ACCESS_RED) return FLAGS_KEYCARD_RED;
  if (code & MAP_ACCESS_BLUE) return FLAGS_KEYCARD_BLUE;
  if (code & MAP_ACCESS_GREEN) return FLAGS_KEYCARD_GREEN;
  if (code & MAP_ACCESS_YELLOW) return FLAGS_KEYCARD_YELLOW;
  return 0;
}
export function MapGetAccessLevel(map: GameMap, pos: Vec2i): number {
  if (!MapIsTileIn(map, pos)) return 0;
  return AccessCodeToFlags(map.access[pos.y * map.Size.x + pos.x]);
}
export function MapTileIsInLockedRoom(map: GameMap, tilePos: Vec2i): boolean {
  return MapGetAccessLevel(map, tilePos) !== 0;
}
export function MapPosIsInLockedRoom(map: GameMap, pos: Vec2): boolean {
  return MapTileIsInLockedRoom(map, Vec2ToTile(pos));
}
export function MapGetDoorKeycardFlag(map: GameMap, pos: Vec2i): number {
  let l = MapGetAccessLevel(map, pos);
  if (l) return l;
  l = MapGetAccessLevel(map, svec2i(pos.x - 1, pos.y));
  if (l) return l;
  l = MapGetAccessLevel(map, svec2i(pos.x + 1, pos.y));
  if (l) return l;
  l = MapGetAccessLevel(map, svec2i(pos.x, pos.y - 1));
  if (l) return l;
  return MapGetAccessLevel(map, svec2i(pos.x, pos.y + 1));
}
export function MapGenerateFreePosition(map: GameMap, size: Vec2i): Vec2 {
  for (let i = 0; i < 100; i++) {
    const v = MapGetRandomPos(map);
    if (!IsCollisionWithWall(v, size)) return v;
  }
  return svec2_zero();
}
export function GetPlacementRetries(map: GameMap, paFlags: number): { retries: number; locked: boolean; unlocked: boolean } {
  const locked = paFlags === 1 && MapHasLockedRooms(map);
  const unlocked = paFlags === 2;
  return { retries: locked || unlocked ? 1000 : 100, locked, unlocked };
}
export function MapPlaceRandomPos(map: GameMap, paFlags: number, tryPlace: (pos: Vec2) => boolean): boolean {
  const { retries, locked, unlocked } = GetPlacementRetries(map, paFlags);
  for (let i = 0; i < retries; i++) {
    const v = MapGetRandomPos(map);
    const isInLocked = MapPosIsInLockedRoom(map, v);
    if ((!locked || isInLocked) && (!unlocked || !isInLocked)) {
      if (tryPlace(v)) return true;
    }
  }
  return false;
}
export function MapInit(map: GameMap, size: Vec2i): void {
  map.TileClasses = new Map();
  map.Tiles = [];
  map.Size = { ...size };
  map.LOS = { LOS: new Array(size.x * size.y).fill(false), Explored: new Array(size.x * size.y).fill(false) };
  map.access = new Array(size.x * size.y).fill(0);
  map.triggers = [];
  map.triggerId = 0;
  map.tilesSeen = 0;
  map.keyAccessCount = 0;
  map.start = svec2i_zero();
  map.exits = [];
  map.NumExplorableTiles = 0;
  pathCacheHooks.init(map);
  for (let i = 0; i < size.x * size.y; i++) map.Tiles.push(newTile());
}
/** path_cache.c lives in ai.ts; it registers itself here */
export const pathCacheHooks = { init: (_m: GameMap): void => {}, clear: (): void => {} };
export function PathCacheClear(): void {
  pathCacheHooks.clear();
}
export const ACTOR_W = 14;
export const ACTOR_H = 10;
export function MapIsPosOKForPlayer(map: GameMap, pos: Vec2, allowAllTiles: boolean): boolean {
  if (!MapIsTileAreaClear(map, pos, svec2i(ACTOR_W, ACTOR_H))) return false;
  if (MapPosIsInLockedRoom(map, pos)) return false;
  const tile = MapGetTile(map, Vec2ToTile(pos))!;
  if (tile.Class.Type === TILE_CLASS_FLOOR) return true;
  else if (allowAllTiles) return TileCanWalk(tile);
  return false;
}
export function MapIsTileAreaClear(map: GameMap, pos: Vec2, size: Vec2i): boolean {
  if (IsCollisionWithWall(pos, size)) return false;
  const tv = Vec2ToTile(pos);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const dtv = svec2i(tv.x + dx, tv.y + dy);
      if (!MapIsTileIn(map, dtv)) continue;
      const things = MapGetTile(map, dtv)!.things;
      for (let i = 0; i < things.length; i++) {
        const ti = ThingIdGetThing(things[i]);
        if (AABBOverlap(pos, ti.Pos, size, ti.size)) {
          if (ti.kind === KIND_OBJECT && gObjs[ti.id].Health <= 0) continue;
          return false;
        }
      }
    }
  }
  return true;
}
export function MapMarkAsVisited(map: GameMap, pos: Vec2i): void {
  const t = MapGetTile(map, pos)!;
  if (!t.isVisited && TileCanWalk(t)) map.tilesSeen++;
  t.isVisited = true;
}
export function MapMarkAllAsVisited(map: GameMap): void {
  for (let y = 0; y < map.Size.y; y++) for (let x = 0; x < map.Size.x; x++) MapMarkAsVisited(map, svec2i(x, y));
}
export function MapGetExploredPercentage(map: GameMap): number {
  return idiv(100 * map.tilesSeen, map.NumExplorableTiles);
}
export function MapUpdate(map: GameMap): void {
  for (const t of map.Tiles) if (t.Door.Count > 0) t.Door.Count--;
}
export function MapSearchTileAround(map: GameMap, start: Vec2i, func: (m: GameMap, v: Vec2i) => boolean): Vec2i {
  if (func(map, start)) return start;
  for (let radius = 1; radius < MAX(map.Size.x, map.Size.y); radius++) {
    for (let x = start.x - radius; x <= start.x + radius; x++) {
      if (x < 0) continue;
      if (x >= map.Size.x) break;
      for (let y = start.y - radius; y <= start.y + radius; y++) {
        if (y < 0) continue;
        if (y >= map.Size.y) break;
        if (x !== start.x - radius && x !== start.x + radius && y !== start.y - radius && y !== start.y + radius) continue;
        if (func(map, svec2i(x, y))) return svec2i(x, y);
      }
    }
  }
  return svec2i_zero();
}
export function MapTileIsUnexplored(map: GameMap, tile: Vec2i): boolean {
  const t = MapGetTile(map, tile)!;
  return !t.isVisited && TileCanWalk(t);
}
export function MapNewTrigger(map: GameMap): Trigger {
  const t = TriggerNew();
  map.triggers.push(t);
  t.id = map.triggerId++;
  return t;
}

soundHooks.isPosNoSee = (v: Vec2i): boolean => {
  const t = MapGetTile(gMap, Vec2iToTile(v));
  return t != null && TileIsOpaque(t);
};

// ---------------------------------------------------------------------------------------------------------------
// thing.c

const DRAW_SHAKE_MAX = 2.0;
const DRAW_SHAKE_FACTOR = f32(0.3);
const DRAW_SHAKE_DECAY = f32(0.8);
export function newThing(id: number, kind: number, size: Vec2i, flags: number): Thing {
  return {
    Pos: svec2(-1, -1), LastPos: svec2_zero(), Vel: svec2_zero(), size: { ...size }, kind, id, flags, drawFunc: 0,
    drawData: { MobObjId: 0, Scale: svec2_zero() }, CPic: {
      Type: 0, Pic: null, Sprites: null, Count: 0, Frame: 0, TicksPerFrame: 0, Mask: { r: 0, g: 0, b: 0, a: 0 },
    }, CPicFunc: 0, drawShake: svec2_zero(), ShadowSize: svec2i_zero(), SoundLock: 0,
  };
}
export function IsThingInsideTile(i: Thing, tilePos: Vec2i): boolean {
  const hx = idiv(i.size.x, 2);
  const hy = idiv(i.size.y, 2);
  return f32(i.Pos.x - hx) >= tilePos.x * TILE_WIDTH && f32(i.Pos.x + hx) < (tilePos.x + 1) * TILE_WIDTH &&
    f32(i.Pos.y - hy) >= tilePos.y * TILE_HEIGHT && f32(i.Pos.y + hy) < (tilePos.y + 1) * TILE_HEIGHT;
}
export function ThingUpdate(t: Thing, ticks: number): void {
  t.SoundLock = MAX(0, t.SoundLock - ticks);
  for (let i = 0; i < ticks; i++) {
    t.drawShake = svec2_scale(t.drawShake, f32(-DRAW_SHAKE_DECAY));
    if (svec2_length_squared(t.drawShake) < 1.0) {
      t.drawShake = svec2_zero();
      break;
    }
  }
  CPicUpdate(t.CPic, ticks);
}
export function ThingAddDrawShake(t: Thing, shake: Vec2): void {
  if (svec2_is_zero(shake)) {
    const x = f32(RAND_FLOAT(-DRAW_SHAKE_MAX, DRAW_SHAKE_MAX) * f32(0.7));
    const y = f32(RAND_FLOAT(-DRAW_SHAKE_MAX, DRAW_SHAKE_MAX) * f32(0.7));
    t.drawShake = svec2(x, y);
  } else {
    t.drawShake = svec2_clamp(svec2_add(t.drawShake, svec2_scale(shake, DRAW_SHAKE_FACTOR)),
      svec2(-DRAW_SHAKE_MAX, -DRAW_SHAKE_MAX), svec2(DRAW_SHAKE_MAX, DRAW_SHAKE_MAX));
  }
}
export function ThingIdGetThing(tid: ThingId): Thing {
  switch (tid.Kind) {
    case KIND_CHARACTER: return gActors[tid.Id].thing;
    case KIND_PARTICLE: return gParticles[tid.Id].thing;
    case KIND_MOBILEOBJECT: return gMobObjs[tid.Id].thing;
    case KIND_OBJECT: return gObjs[tid.Id].thing;
    default: return gPickups[tid.Id].thing;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// collision/collision.c, collision/minkowski_hex.c

export const COLLISIONTEAM_NONE = 0;
export const COLLISIONTEAM_GOOD = 1;
export const COLLISIONTEAM_BAD = 2;
export interface CollisionParams { ThingMask: number; Team: number; IsPVP: boolean; AllActors: boolean }
export const gCollisionSystem = { allyCollision: 1, tileCache: [] as Vec2i[] };
export function CollisionSystemReset(): void {
  gCollisionSystem.allyCollision = ConfigGetEnum('Game.AllyCollision');
}

/** set by actors.ts: ActorGetByUID */
export const collisionHooks = { actorByUID: (_uid: number): TActor | null => null };

export function CalcCollisionTeam(isActor: boolean, actorIn: TActor | null): number {
  let actor = actorIn;
  if (!isActor || !actor || (actor.flags & (FLAGS_PRISONER | FLAGS_VICTIM)) || IsPVP(gCampaign.Entry.Mode)) {
    return COLLISIONTEAM_NONE;
  }
  if (actor.pilotUID !== actor.uid && actor.pilotUID >= 0) actor = collisionHooks.actorByUID(actor.pilotUID)!;
  if (actor.PlayerUID >= 0 || (actor.flags & FLAGS_GOOD_GUY)) return COLLISIONTEAM_GOOD;
  return COLLISIONTEAM_BAD;
}
export const FLAGS_PRISONER = 1 << 18;
export const FLAGS_VICTIM = 1 << 22;
export const FLAGS_GOOD_GUY = 1 << 17;

function HitWall(x: number, y: number): boolean {
  return !TileCanWalk(MapGetTile(gMap, svec2i(idiv(toInt(x), TILE_WIDTH), idiv(toInt(y), TILE_HEIGHT))));
}
export function IsCollisionWithWall(pos: Vec2, size2: Vec2i): boolean {
  const sx = idiv(size2.x, 2);
  const sy = idiv(size2.y, 2);
  if (f32(pos.x - sx) < 0 || f32(pos.y - sy) < 0 || f32(pos.x + sx) >= gMap.Size.x * TILE_WIDTH ||
    f32(pos.y + sy) >= gMap.Size.y * TILE_HEIGHT) return true;
  const px = toInt(pos.x);
  const py = toInt(pos.y);
  return HitWall(px - sx, py - sy) || HitWall(px - sx, py) || HitWall(px - sx, py + sy) || HitWall(px, py + sy) ||
    HitWall(px + sx, py + sy) || HitWall(px + sx, py) || HitWall(px + sx, py - sy) || HitWall(px, py - sy);
}
export function IsCollisionDiamond(map: GameMap, pos: Vec2, size2: Vec2i): boolean {
  const mapSize = svec2i(map.Size.x * TILE_WIDTH, map.Size.y * TILE_HEIGHT);
  const sx = idiv(size2.x, 2);
  const sy = idiv(size2.y, 2);
  if (f32(pos.x - sx) < 0 || f32(pos.x + sx) >= mapSize.x || f32(pos.y - sy) < 0 || f32(pos.y + sy) >= mapSize.y) {
    return true;
  }
  const gradient = f32(f32(sy) / sx);
  for (let i = 0; i < sx; i++) {
    const y = f32((-sx + i) * gradient);
    const p = svec2_add(pos, svec2(i, y));
    if (HitWall(p.x, p.y)) return true;
  }
  for (let i = 0; i < sx; i++) {
    const y = f32(i * gradient);
    const p = svec2_add(pos, svec2(f32(sx - i), y));
    if (HitWall(p.x, p.y)) return true;
  }
  for (let i = 0; i < sx; i++) {
    const y = f32((sx - i) * gradient);
    const p = svec2_add(pos, svec2(-i, y));
    if (HitWall(p.x, p.y)) return true;
  }
  for (let i = 0; i < sx; i++) {
    const y = f32(-i * gradient);
    const p = svec2_add(pos, svec2(f32(-sx + i), y));
    if (HitWall(p.x, p.y)) return true;
  }
  return false;
}
export function AABBOverlap(pos1: Vec2, pos2: Vec2, size1: Vec2i, size2: Vec2i): boolean {
  const dx = Math.abs(f32(pos1.x - pos2.x));
  const dy = Math.abs(f32(pos1.y - pos2.y));
  const rx = idiv(size1.x + size2.x, 2);
  const ry = idiv(size1.y + size2.y, 2);
  return dx < rx && dy < ry;
}
function CollisionIsOnSameTeam(i: Thing, team: number, isPVP: boolean): boolean {
  if (gCollisionSystem.allyCollision === ALLYCOLLISION_NORMAL) return false;
  let itemTeam = COLLISIONTEAM_NONE;
  if (i.kind === KIND_CHARACTER) itemTeam = CalcCollisionTeam(true, gActors[i.id]);
  return team !== COLLISIONTEAM_NONE && itemTeam !== COLLISIONTEAM_NONE && team === itemTeam && !isPVP;
}
function CheckParams(params: CollisionParams, a: Thing, b: Thing): boolean {
  if (a === b) return false;
  if (!params.AllActors) {
    if (CollisionIsOnSameTeam(b, params.Team, params.IsPVP)) return false;
    if (a.kind === KIND_CHARACTER && b.kind === KIND_CHARACTER) {
      const aa = gActors[a.id];
      const ab = gActors[b.id];
      if (aa && ab) {
        if (aa.vehicleUID !== -1 || ab.vehicleUID !== -1) return false;
        if (aa.pilotUID === -1 || ab.pilotUID === -1) return false;
      }
    }
  }
  if (params.ThingMask !== 0 && !(b.flags & params.ThingMask)) return false;
  return true;
}
function TileCacheAddImpl(tc: Vec2i[], v: Vec2i, addAdjacents: boolean): void {
  if (!MapIsTileIn(gMap, v)) return;
  for (let i = 0; i < tc.length; i++) {
    const t = tc[i];
    if (t.y > v.y || (t.y === v.y && t.x > v.x)) {
      tc.splice(i, 0, v);
      break;
    } else if (t.x === v.x && t.y === v.y) {
      return;
    }
  }
  // the original pushes v at the end too after inserting (CArrayPushBack after the loop's break)
  tc.push(v);
  if (addAdjacents) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        TileCacheAddImpl(tc, svec2i(v.x + dx, v.y + dy), false);
      }
    }
  }
}
export type CollideItemFunc = (ti: Thing, colA: Vec2, colB: Vec2, normal: Vec2) => boolean;
export type CheckWallFunc = (tilePos: Vec2i) => boolean;
export type CollideWallFunc = (tilePos: Vec2i, col: Vec2, normal: Vec2) => boolean;
export function OverlapThings(item: Thing, pos: Vec2, vel: Vec2, size: Vec2i, params: CollisionParams,
  func: CollideItemFunc | null, checkWallFunc: CheckWallFunc | null, wallFunc: CollideWallFunc | null): void {
  const tc: Vec2i[] = [];
  gCollisionSystem.tileCache = tc;
  const dtx = idiv(idiv(size.x + TILE_WIDTH - 1, 2), TILE_WIDTH);
  const dty = idiv(idiv(size.y + TILE_HEIGHT - 1, 2), TILE_HEIGHT);
  const tv = Vec2iToTile(svec2i_assign_vec2(pos));
  for (let dy = -dty; dy < 2 * dty; dy++) {
    for (let dx = -dtx; dx < 2 * dtx; dx++) TileCacheAddImpl(tc, svec2i(tv.x + dx, tv.y + dy), true);
  }
  BresenhamLineDraw(svec2i_assign_vec2(pos), svec2i_assign_vec2(svec2_add(pos, vel)),
    (p) => TileCacheAddImpl(tc, Vec2iToTile(p), true));
  for (let i = 0; i < tc.length; i++) {
    if (!CheckOverlaps(item, pos, vel, size, params, func, checkWallFunc, wallFunc, tc[i])) return;
  }
}
function CheckOverlaps(item: Thing, pos: Vec2, vel: Vec2, size: Vec2i, params: CollisionParams,
  func: CollideItemFunc | null, checkWallFunc: CheckWallFunc | null, wallFunc: CollideWallFunc | null,
  tilePos: Vec2i): boolean {
  if (func != null) {
    const tileThings = MapGetTile(gMap, tilePos)!.things;
    for (let i = 0; i < tileThings.length; i++) {
      const ti = ThingIdGetThing(tileThings[i]);
      if (!CheckParams(params, item, ti)) continue;
      const col = MinkowskiHexCollide(pos, vel, size, ti.Pos, ti.Vel, ti.size);
      if (!col) continue;
      if (!func(ti, col.colA, col.colB, col.normal)) return false;
    }
  }
  if (checkWallFunc != null && wallFunc != null && checkWallFunc(tilePos)) {
    const sizeForWall = item.kind === KIND_MOBILEOBJECT ? svec2i_zero() : size;
    const col = MinkowskiHexCollide(pos, vel, sizeForWall, Vec2CenterOfTile(tilePos), svec2_zero(), TILE_SIZE());
    if (col && !wallFunc(tilePos, col.colA, col.normal)) return false;
  }
  return true;
}
export function OverlapGetFirstItem(item: Thing, pos: Vec2, size: Vec2i, vel: Vec2, params: CollisionParams): Thing | null {
  let first: Thing | null = null;
  OverlapThings(item, pos, vel, size, params, (ti) => {
    first = ti;
    return false;
  }, null, null);
  return first;
}
export function GetWallBouncePosVel(pos: Vec2, vel: Vec2, colPos: Vec2, colNormal: Vec2): { pos: Vec2; vel: Vec2 } {
  const velBeforeCol = svec2_subtract(colPos, pos);
  const velAfterCol = svec2_subtract(vel, velBeforeCol);
  if (svec2_is_zero(colNormal)) return { pos: svec2_subtract(pos, vel), vel: svec2_scale(vel, -1) };
  const velReflected = svec2(
    colNormal.x === 0 ? velAfterCol.x : f32(colNormal.x * Math.abs(velAfterCol.x)),
    colNormal.y === 0 ? velAfterCol.y : f32(colNormal.y * Math.abs(velAfterCol.y)));
  return {
    pos: svec2_add(colPos, velReflected),
    vel: svec2(colNormal.x === 0 ? vel.x : f32(colNormal.x * Math.abs(vel.x)),
      colNormal.y === 0 ? vel.y : f32(colNormal.y * Math.abs(vel.y))),
  };
}
function RectangleLineIntersect(rectPos: Vec2, rectSize: Vec2i, lineStart: Vec2, lineEnd: Vec2): { s: number; normal: Vec2 } | null {
  const left = f32(rectPos.x - idiv(rectSize.x, 2));
  const right = f32(left + rectSize.x);
  const top = f32(rectPos.y - idiv(rectSize.y, 2));
  const bottom = f32(top + rectSize.y);
  const topLeft = svec2(left, top);
  const topRight = svec2(right, top);
  const bottomRight = svec2(right, bottom);
  const bottomLeft = svec2(left, bottom);
  if (lineStart.x > left && lineStart.x < right && lineStart.y > top && lineStart.y < bottom) {
    return { s: 0, normal: svec2_zero() };
  }
  let s = -1;
  let normal = svec2_zero();
  const check = (p1: Vec2, p2: Vec2, n: Vec2): void => {
    const r = LinesIntersectFull(p1, p2, lineStart, lineEnd);
    if (r.ok && (s < 0 || r.s < s)) {
      s = r.s;
      normal = n;
    }
  };
  check(topLeft, topRight, svec2(0, 1));
  check(topRight, bottomRight, svec2(-1, 0));
  check(bottomLeft, bottomRight, svec2(0, -1));
  check(topLeft, bottomLeft, svec2(1, 0));
  return s >= 0 && s <= 1 ? { s, normal } : null;
}
function LinesIntersectFull(p1Start: Vec2, p1End: Vec2, p2Start: Vec2, p2End: Vec2): { ok: boolean; s: number } {
  const v1 = svec2_subtract(p1End, p1Start);
  const v2 = svec2_subtract(p2End, p2Start);
  const divisor = f32(f32(f32(-v2.x) * v1.y) + f32(v1.x * v2.y));
  if (divisor === 0) return { ok: false, s: 0 };
  const p12 = svec2_subtract(p1Start, p2Start);
  const s = f32(f32(f32(f32(-v1.y) * p12.x) + f32(v1.x * p12.y)) / divisor);
  const t = f32(f32(f32(v2.x * p12.y) - f32(v2.y * p12.x)) / divisor);
  return { ok: s >= 0 && s <= 1 && t >= 0 && t <= 1, s };
}
export function MinkowskiHexCollide(posA: Vec2, velA: Vec2, sizeA: Vec2i, posB: Vec2, velB: Vec2, sizeB: Vec2i):
  { colA: Vec2; colB: Vec2; normal: Vec2 } | null {
  const sizeC = svec2i_add(sizeA, sizeB);
  const velBA = svec2_subtract(velB, velA);
  const r = RectangleLineIntersect(posA, sizeC, posB, svec2_add(posB, velBA));
  if (!r) return null;
  if (r.s === 0) return { colA: posA, colB: posB, normal: r.normal };
  return { colA: svec2_add(posA, svec2_scale(velA, r.s)), colB: svec2_add(posB, svec2_scale(velB, r.s)), normal: r.normal };
}

// ---------------------------------------------------------------------------------------------------------------
// los.c

export const FLAGS_VISIBLE = 1 << 8;
export function LOSReset(map: GameMap): void {
  map.LOS.LOS.fill(false);
  map.LOS.Explored.fill(false);
}
function SetLOSVisible(map: GameMap, pos: Vec2i, explore: boolean): void {
  const t = MapGetTile(map, pos);
  if (t == null) return;
  const i = pos.y * map.Size.x + pos.x;
  map.LOS.LOS[i] = true;
  if (!t.isVisited && explore) map.LOS.Explored[i] = true;
  for (const tid of t.things) {
    const ti = ThingIdGetThing(tid);
    if (ti.kind === KIND_CHARACTER) gActors[ti.id].flags |= FLAGS_VISIBLE;
  }
}
export function LOSSetAllVisible(map: GameMap): void {
  map.LOS.LOS.fill(true);
  for (let y = 0; y < map.Size.y; y++) for (let x = 0; x < map.Size.x; x++) SetLOSVisible(map, svec2i(x, y), false);
}
export function LOSTileIsVisible(map: GameMap, pos: Vec2i): boolean {
  if (MapGetTile(map, pos) == null) return false;
  return map.LOS.LOS[pos.y * map.Size.x + pos.x];
}
export function LOSCalcFrom(map: GameMap, pos: Vec2i, explore: boolean): void {
  map.LOS.Explored.fill(false);
  for (let ex = pos.x - 1; ex <= pos.x + 1; ex++) {
    for (let ey = pos.y - 1; ey <= pos.y + 1; ey++) SetLOSVisible(map, svec2i(ex, ey), explore);
  }
  const sightRange = ConfigGetInt('Game.SightRange');
  if (sightRange === 0) return;
  const origin = svec2i(pos.x - sightRange, pos.y - sightRange);
  const perimSize = svec2i_scale(svec2i_subtract(pos, origin), 2);
  const sightRange2 = sightRange * sightRange;
  const isBlocked = (v: Vec2i): boolean => {
    if (svec2i_distance_squared(pos, v) >= sightRange2) return true;
    const t = MapGetTile(map, v);
    if (t == null) return true;
    SetLOSVisible(map, v, explore);
    return TileIsOpaque(t);
  };
  const end = { x: origin.x, y: origin.y };
  for (; end.x < origin.x + perimSize.x; end.x++) HasClearLineJMRaytrace(pos, { ...end }, isBlocked);
  for (; end.y < origin.y + perimSize.y; end.y++) HasClearLineJMRaytrace(pos, { ...end }, isBlocked);
  for (; end.x > origin.x; end.x--) HasClearLineJMRaytrace(pos, { ...end }, isBlocked);
  for (; end.y > origin.y; end.y--) HasClearLineJMRaytrace(pos, { ...end }, isBlocked);
  for (let y = origin.y; y < origin.y + perimSize.y; y++) {
    for (let x = origin.x; x < origin.x + perimSize.x; x++) {
      const v = svec2i(x, y);
      const tile = MapGetTile(map, v);
      if (!tile || !TileIsOpaque(tile)) continue;
      if (svec2i_distance_squared(pos, v) >= sightRange2) continue;
      // SetObstructionVisible
      let done = false;
      for (let dx = -1; dx < 2 && !done; dx++) {
        for (let dy = -1; dy < 2; dy++) {
          const p = svec2i(v.x + dx, v.y + dy);
          const t = MapGetTile(map, p);
          if (t != null && !TileIsOpaque(t) && LOSTileIsVisible(map, p)) {
            SetLOSVisible(map, v, explore);
            done = true;
            break;
          }
        }
      }
    }
  }
  let e = GameEventNew(GAME_EVENT_EXPLORE_TILES);
  let run = false;
  const RUNS_MAX = 16;
  for (let y = 0; y < map.Size.y; y++) {
    for (let x = 0; x < map.Size.x; x++) {
      const explored = map.LOS.Explored[y * map.Size.x + x];
      // LOSAddRun
      let full = false;
      const runs = e.u.Runs as { Tile: Vec2i; Run: number }[];
      if (explored) {
        if (!run) runs.push({ Tile: svec2i(x, y), Run: 0 });
        runs[runs.length - 1].Run++;
        run = true;
      } else {
        if (runs.length === RUNS_MAX) full = true;
        else run = false;
      }
      if (full) {
        GameEventsEnqueue(gGameEvents, e);
        e = GameEventNew(GAME_EVENT_EXPLORE_TILES);
        run = false;
      }
    }
  }
  if (e.u.Runs.length > 0) GameEventsEnqueue(gGameEvents, e);
  map.LOS.Explored.fill(false);
}

