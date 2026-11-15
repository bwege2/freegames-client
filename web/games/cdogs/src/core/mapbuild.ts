// C-Dogs SDL 2.5.0, translated: building a mission's map (map_build.c, map_classic.c, map_cave.c,
// map_interior.c, map_static.c, door.c's door groups). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import {
  rand, cmod, idiv, RAND_INT, RAND_BOOL, MAX, MIN, CLAMP, svec2i, svec2i_zero, svec2i_one, svec2i_add,
  svec2i_subtract, svec2i_scale, svec2i_multiply, svec2i_divide, svec2i_min, svec2i_max, svec2i_is_equal,
  Rect2iNew, Rect2iZero, Rect2iIsZero, Rect2iIsAtEdge, Rect2iIsInside, Rect2iOverlap, Rect2iCenter, rectForEach,
  Vec2CenterOfTile, BresenhamLineDraw, CArrayShuffle, colorWhite, f32, type Vec2, type Vec2i, type Rect2i,
} from './base.ts';
import { gPicManager, PicManagerGenerateMaskedStylePic, type PicManager } from './pics.ts';
import {
  MapInit, MapGetTile, MapIsTileIn, MapGetRandomTile, MapGetRandomPos, MapHasLockedRooms, MapPosIsInLockedRoom,
  MapNewTrigger, MapTileIsInLockedRoom, GetPlacementRetries, AccessCodeToFlags, GetAccessMask, TileCanWalk,
  TileIsClear, TileIsOpaque, IsCollisionWithWall, TileClassesAdd, TileClassesGetMaskedTile, TileClassGetName,
  StrTileClass, DoorStateInit, gTileNothing, IntWallType, IntTileType, WALL_TYPE_COUNT, FLOOR_TYPES, WatchNew,
  WatchAddCondition, WatchAddAction, TriggerAddAction, CONDITION_TILECLEAR, ACTION_ACTIVATEWATCH, ACTION_SETTRIGGER,
  ACTION_DEACTIVATEWATCH, ACTION_EVENT, ACTION_CLEARTRIGGER, MAP_ACCESS_RED, MAP_ACCESS_BLUE, MAP_ACCESS_GREEN,
  MAP_ACCESS_YELLOW, type GameMap, type Exit,
} from './map.ts';
import {
  type Mission, type MissionTileClasses, type RoomParams, MAPTYPE_CLASSIC, MAPTYPE_STATIC, MAPTYPE_CAVE,
  MAPTYPE_INTERIOR, OBJECTIVE_COLLECT, OBJECTIVE_DESTROY, OBJECTIVE_KILL, OBJECTIVE_RESCUE, OBJECTIVE_HIACCESS,
  OBJECTIVE_NOACCESS, ObjectiveGetPlacementAccessFlags, ObjectiveToThing, MissionStaticGetTileClass,
} from './mission.ts';
import {
  StrMapObject, MapObjectGetFlags, MapObjectIsOnWall, PickupClassHasAmmoEffect, KeyPickupClass, KEY_COUNT,
  PLACEMENT_OUTSIDE, PLACEMENT_INSIDE, PLACEMENT_NO_WALLS, PLACEMENT_ONE_WALL, PLACEMENT_ONE_OR_MORE_WALLS,
  PLACEMENT_FREE_IN_FRONT, FLAGS_KEYCARD_RED, FLAGS_KEYCARD_BLUE, FLAGS_KEYCARD_GREEN, FLAGS_KEYCARD_YELLOW,
  CharacterStoreGetRandomSpecialId,
} from './classes.ts';
import {
  TILE_CLASS_FLOOR, TILE_CLASS_WALL, TILE_CLASS_DOOR, TILE_CLASS_NOTHING, KIND_OBJECT, KIND_PARTICLE, KIND_PICKUP,
  MAP_OBJECT_TYPE_PICKUP_SPAWNER, type TileClass, type Tile, type MapObject, type PickupClass, type CharacterStore,
} from './types.ts';
import { gCampaign, gObjs, HasExit, HasObjectives, AreKeysAllowed, ModeHasNPCs } from './state.ts';
import {
  GameEventNew, GameEventsEnqueue, gGameEvents, GAME_EVENT_ADD_PICKUP, GAME_EVENT_SOUND_AT, GAME_EVENT_DOOR_TOGGLE,
  GAME_EVENT_TILE_SET, GAME_EVENT_ACTOR_ADD,
} from './events.ts';
import { buildHooks } from './hooks.ts';

const COLLECTABLE_W = 4;
const COLLECTABLE_H = 3;
const EXIT_WIDTH = 8;
const EXIT_HEIGHT = 8;

export interface MapBuilder {
  Map: GameMap;
  mission: Mission;
  mode: number;
  characters: CharacterStore;
  access: number[];
  tiles: TileClass[];
  leaveFree: boolean[];
}

export function MapBuild(m: GameMap, mission: Mission, loadDynamic: boolean, missionIndex: number, mode: number,
  characters: CharacterStore): void {
  const n = mission.Size.x * mission.Size.y;
  const mb: MapBuilder = {
    Map: m, mission, mode, characters, access: new Array(n).fill(0),
    tiles: Array.from({ length: n }, () => ({ ...gTileNothing })), leaveFree: new Array(n).fill(false),
  };
  MapInit(mb.Map, mb.mission.Size);
  switch (mission.Type) {
    case MAPTYPE_CLASSIC: MapClassicLoad(mb); break;
    case MAPTYPE_STATIC: MapStaticLoad(mb); break;
    case MAPTYPE_CAVE: MapCaveLoad(mb); break;
    case MAPTYPE_INTERIOR: MapInteriorLoad(mb, missionIndex); break;
    default: break;
  }
  mb.Map.access = [...mb.access];
  MapSetupTilesAndWalls(mb);
  MapSetupDoors(mb);
  switch (mission.Type) {
    case MAPTYPE_CLASSIC:
      MapAddDrains(mb);
      if (HasExit(gCampaign.Entry.Mode) && mission.Classic.ExitEnabled) MapGenerateRandomExitArea(mb.Map, missionIndex);
      break;
    case MAPTYPE_CAVE:
      if (HasExit(gCampaign.Entry.Mode) && mission.Cave.ExitEnabled) MapGenerateRandomExitArea(mb.Map, missionIndex);
      break;
    case MAPTYPE_INTERIOR:
      MapAddDrains(mb);
      break;
    default:
      break;
  }
  mb.Map.NumExplorableTiles = 0;
  for (let y = 0; y < mb.Map.Size.y; y++) {
    for (let x = 0; x < mb.Map.Size.x; x++) if (TileCanWalk(MapGetTile(mb.Map, svec2i(x, y)))) mb.Map.NumExplorableTiles++;
  }
  if (loadDynamic) {
    MapLoadDynamic(mb);
    buildHooks.actorsPilotVehicles();
  }
}

export function SetupWallTileClasses(m: GameMap, pm: PicManager, base: TileClass): void {
  for (let i = 0; i < WALL_TYPE_COUNT; i++) {
    PicManagerGenerateMaskedStylePic(pm, 'wall', base.Style!, IntWallType(i), base.Mask, base.MaskAlt, false);
    TileClassesAdd(m.TileClasses, pm, base, base.Style, IntWallType(i), base.Mask, base.MaskAlt);
  }
}
export function SetupFloorTileClasses(m: GameMap, pm: PicManager, base: TileClass): void {
  for (let i = 0; i < FLOOR_TYPES; i++) {
    PicManagerGenerateMaskedStylePic(pm, 'tile', base.Style!, IntTileType(i), base.Mask, base.MaskAlt, false);
    TileClassesAdd(m.TileClasses, pm, base, base.Style, IntTileType(i), base.Mask, base.MaskAlt);
  }
}
const DOORTYPE_H = 0;
const DOORTYPE_LEFT = 1;
const DOORTYPE_HMID = 2;
const DOORTYPE_RIGHT = 3;
const DOORTYPE_V = 4;
const DOORTYPE_TOP = 5;
const DOORTYPE_VMID = 6;
const DOORTYPE_BOTTOM = 7;
const DOORTYPE_COUNT = 8;
export function SetupDoorTileClasses(m: GameMap, pm: PicManager, base: TileClass): void {
  for (const key of ['yellow', 'green', 'blue', 'red', 'open', 'wall', 'normal']) {
    for (let type = DOORTYPE_H; type < DOORTYPE_COUNT; type++) DoorAddClass(m.TileClasses, pm, base, key, type);
  }
}
export function MissionSetupTileClasses(m: GameMap, pm: PicManager, mtc: MissionTileClasses): void {
  SetupWallTileClasses(m, pm, mtc.Wall);
  SetupFloorTileClasses(m, pm, mtc.Floor);
  SetupFloorTileClasses(m, pm, mtc.Room);
  SetupDoorTileClasses(m, pm, mtc.Door);
}

function MapSetupDoors(mb: MapBuilder): void {
  const doorsSetup = new Array(mb.Map.Size.x * mb.Map.Size.y).fill(false);
  rectForEach(Rect2iNew(svec2i_zero(), mb.Map.Size), (v) => {
    const idx = v.x + v.y * mb.Map.Size.x;
    if (MapBuilderIsDoor(mb, v) && !doorsSetup[idx]) {
      const groupSize = MapAddDoorGroup(mb, v, MapGetAccessFlags(mb, v));
      for (let dx = 0; dx < groupSize.x; dx++) {
        for (let dy = 0; dy < groupSize.y; dy++) doorsSetup[v.x + dx + (v.y + dy) * mb.Map.Size.x] = true;
      }
    }
  });
}
function MapBuilderIsDoor(mb: MapBuilder, v: Vec2i): boolean {
  const t = MapBuilderGetTile(mb, v);
  return t != null && t.Type === TILE_CLASS_DOOR;
}
function MapGetAccessFlags(mb: MapBuilder, v: Vec2i): number {
  let flags = 0;
  flags = MAX(flags, AccessCodeToFlags(MapBuildGetAccess(mb, v)));
  flags = MAX(flags, AccessCodeToFlags(MapBuildGetAccess(mb, svec2i(v.x - 1, v.y))));
  flags = MAX(flags, AccessCodeToFlags(MapBuildGetAccess(mb, svec2i(v.x + 1, v.y))));
  flags = MAX(flags, AccessCodeToFlags(MapBuildGetAccess(mb, svec2i(v.x, v.y - 1))));
  flags = MAX(flags, AccessCodeToFlags(MapBuildGetAccess(mb, svec2i(v.x, v.y + 1))));
  return flags;
}
export function MapBuildGetAccess(mb: MapBuilder, pos: Vec2i): number {
  if (!MapIsTileIn(mb.Map, pos)) return 0;
  return mb.access[pos.y * mb.Map.Size.x + pos.x];
}
export function MapBuildSetAccess(mb: MapBuilder, pos: Vec2i, v: number): void {
  mb.access[pos.y * mb.Map.Size.x + pos.x] = v & 0xffff;
}
export function MapBuilderGetTile(mb: MapBuilder, pos: Vec2i): TileClass | null {
  if (!MapIsTileIn(mb.Map, pos)) return null;
  return mb.tiles[pos.y * mb.Map.Size.x + pos.x];
}
export function MapBuilderSetTile(mb: MapBuilder, pos: Vec2i, t: TileClass | null): void {
  if (t != null) mb.tiles[pos.y * mb.Map.Size.x + pos.x] = { ...t };
}
export function MapBuilderSetLeaveFree(mb: MapBuilder, tile: Vec2i, value: boolean): void {
  if (!MapIsTileIn(mb.Map, tile)) return;
  mb.leaveFree[tile.y * mb.Map.Size.x + tile.x] = value;
}
export function MapBuilderIsLeaveFree(mb: MapBuilder, tile: Vec2i): boolean {
  if (!MapIsTileIn(mb.Map, tile)) return false;
  return mb.leaveFree[tile.y * mb.Map.Size.x + tile.x];
}

// map_object.c's tile checks (they need the objects)
function MapObjectIsTileOK(mo: MapObject, tile: Tile | null, tileAbove: Tile | null): boolean {
  if (tile == null) return false;
  if (mo.DrawAbove) {
    for (const tid of tile.things) if (tid.Kind === KIND_OBJECT && gObjs[tid.Id].Class.DrawAbove) return false;
  } else if (mo.DrawBelow) {
    for (const tid of tile.things) if (tid.Kind === KIND_OBJECT && gObjs[tid.Id].Class.DrawBelow) return false;
  } else {
    if (!TileCanWalk(tile)) return false;
    for (const tid of tile.things) {
      if (tid.Kind === KIND_OBJECT) {
        const obj = gObjs[tid.Id];
        if (!obj.Class.DrawAbove && !obj.Class.DrawBelow) return false;
      } else if (tid.Kind !== KIND_PARTICLE && tid.Kind !== KIND_PICKUP) return false;
    }
  }
  if (MapObjectIsOnWall(mo) && (tileAbove == null || tileAbove.Class.Type !== TILE_CLASS_WALL)) return false;
  return true;
}
export function MapObjectGetPlacementPos(mo: MapObject, tilePos: Vec2i): Vec2 {
  let pos = Vec2CenterOfTile(tilePos);
  pos = { x: f32(pos.x + mo.PosOffset.x), y: f32(pos.y + mo.PosOffset.y) };
  if (MapObjectIsOnWall(mo)) pos.y = f32(pos.y - (6 + 1));
  return pos;
}
function IsTileOKStrict(obj: MapObject, tile: Tile | null, tileAbove: Tile | null, tileBelow: Tile | null,
  numWallsAdjacent: number, numWallsAround: number): boolean {
  if (!MapObjectIsTileOK(obj, tile, tileAbove)) return false;
  if ((obj.Flags & (1 << PLACEMENT_OUTSIDE)) && tile!.Class.IsRoom) return false;
  if ((obj.Flags & (1 << PLACEMENT_INSIDE)) && !tile!.Class.IsRoom) return false;
  if ((obj.Flags & (1 << PLACEMENT_NO_WALLS)) && numWallsAround !== 0) return false;
  if ((obj.Flags & (1 << PLACEMENT_ONE_WALL)) && numWallsAdjacent !== 1) return false;
  if ((obj.Flags & (1 << PLACEMENT_ONE_OR_MORE_WALLS)) && numWallsAdjacent < 1) return false;
  if ((obj.Flags & (1 << PLACEMENT_FREE_IN_FRONT)) && !TileIsClear(tileBelow)) return false;
  return true;
}
function MapGetNumWallsAdjacentTile(map: GameMap, v: Vec2i): number {
  let count = 0;
  if (v.x > 0 && v.y > 0 && v.x < map.Size.x - 1 && v.y < map.Size.y - 1) {
    if (!TileCanWalk(MapGetTile(map, svec2i(v.x - 1, v.y)))) count++;
    if (!TileCanWalk(MapGetTile(map, svec2i(v.x + 1, v.y)))) count++;
    if (!TileCanWalk(MapGetTile(map, svec2i(v.x, v.y - 1)))) count++;
    if (!TileCanWalk(MapGetTile(map, svec2i(v.x, v.y + 1)))) count++;
  }
  return count;
}
function MapGetNumWallsAroundTile(map: GameMap, v: Vec2i): number {
  let count = MapGetNumWallsAdjacentTile(map, v);
  if (v.x > 0 && v.y > 0 && v.x < map.Size.x - 1 && v.y < map.Size.y - 1) {
    if (!TileCanWalk(MapGetTile(map, svec2i(v.x - 1, v.y - 1)))) count++;
    if (!TileCanWalk(MapGetTile(map, svec2i(v.x + 1, v.y + 1)))) count++;
    if (!TileCanWalk(MapGetTile(map, svec2i(v.x + 1, v.y - 1)))) count++;
    if (!TileCanWalk(MapGetTile(map, svec2i(v.x - 1, v.y + 1)))) count++;
  }
  return count;
}
export function MapTryPlaceOneObject(mb: MapBuilder, v: Vec2i, mo: MapObject, extraFlags: number, isStrictMode: boolean): boolean {
  if (!gCampaign.Setting.Ammo && mo.Type === MAP_OBJECT_TYPE_PICKUP_SPAWNER && mo.PickupClass &&
    PickupClassHasAmmoEffect(mo.PickupClass)) return false;
  const t = MapGetTile(mb.Map, v);
  const tAbove = MapGetTile(mb.Map, svec2i(v.x, v.y - 1));
  const tBelow = MapGetTile(mb.Map, svec2i(v.x, v.y + 1));
  if (isStrictMode && !IsTileOKStrict(mo, t, tAbove, tBelow, MapGetNumWallsAdjacentTile(mb.Map, v),
    MapGetNumWallsAroundTile(mb.Map, v))) return false;
  else if (!MapObjectIsTileOK(mo, t, tAbove)) return false;
  if (mo.Flags & (1 << PLACEMENT_FREE_IN_FRONT)) MapBuilderSetLeaveFree(mb, svec2i(v.x, v.y + 1), true);
  buildHooks.objAdd({
    UID: buildHooks.objsGetNextUID(), MapObjectClass: mo.Name, Pos: MapObjectGetPlacementPos(mo, v),
    ThingFlags: MapObjectGetFlags(mo) | extraFlags, Health: mo.Health, Mask: { r: 0, g: 0, b: 0, a: 0 },
  });
  return true;
}
export function MapTryPlaceDestroyObject(mb: MapBuilder, m: Mission, objective: number, pos: Vec2i, strict: boolean): boolean {
  const o = m.Objectives[objective];
  const i = RAND_INT(0, o.MapObjects.length - 1);
  const mo = o.MapObjects[i]!;
  return MapTryPlaceOneObject(mb, pos, mo, ObjectiveToThing(objective), strict);
}
export function MapPlacePickup(p: PickupClass, pos: Vec2, flags: number): void {
  const e = GameEventNew(GAME_EVENT_ADD_PICKUP);
  e.u.PickupClass = p.Name;
  e.u.ThingFlags = flags >>> 0;
  e.u.Pos = { ...pos };
  GameEventsEnqueue(gGameEvents, e);
}
export function MapPlaceCollectible(m: Mission, objective: number, pos: Vec2): void {
  const o = m.Objectives[objective];
  const i = RAND_INT(0, o.Pickups.length - 1);
  MapPlacePickup(o.Pickups[i]!, pos, ObjectiveToThing(objective));
}
export function MapPlaceKey(mb: MapBuilder, tilePos: Vec2i, keyIndex: number): void {
  const e = GameEventNew(GAME_EVENT_ADD_PICKUP);
  e.u.PickupClass = KeyPickupClass(mb.mission.KeyStyle, keyIndex)!.Name;
  e.u.Pos = Vec2CenterOfTile(tilePos);
  GameEventsEnqueue(gGameEvents, e);
}
export function MapPlaceRandomTile(mb: MapBuilder, paFlags: number, tryPlace: (v: Vec2i) => boolean): boolean {
  const { retries, locked, unlocked } = GetPlacementRetries(mb.Map, paFlags);
  for (let i = 0; i < retries; i++) {
    const tilePos = MapGetRandomTile(mb.Map);
    const isInLocked = MapTileIsInLockedRoom(mb.Map, tilePos);
    if ((!locked || isInLocked) && (!unlocked || !isInLocked)) {
      if (tryPlace(tilePos)) return true;
    }
  }
  return false;
}

function MapLoadDynamic(mb: MapBuilder): void {
  if (mb.mission.Type === MAPTYPE_STATIC) MapStaticLoadDynamic(mb);
  for (const mod of mb.mission.MapObjectDensities) {
    const n = idiv(mod.Density * mb.Map.Size.x * mb.Map.Size.y, 1000);
    for (let j = 0; j < n; j++) MapTryPlaceOneObject(mb, MapGetRandomTile(mb.Map), mod.M!, 0, true);
  }
  for (const pc of mb.mission.PickupCounts) {
    for (let j = 0; j < pc.Count; j++) {
      for (let i = 0; i < 1000; i++) {
        const v = MapGetRandomPos(mb.Map);
        if (!IsCollisionWithWall(v, svec2i(COLLECTABLE_W, COLLECTABLE_H))) {
          MapPlacePickup(pc.P!, v, 0);
          break;
        }
      }
    }
  }
  if (HasObjectives(gCampaign.Entry.Mode)) AddObjectives(mb);
  if (AreKeysAllowed(gCampaign.Entry.Mode)) AddKeys(mb);
}
function AddObjectives(mb: MapBuilder): void {
  mb.mission.Objectives.forEach((o, idx) => {
    if (o.Type !== OBJECTIVE_COLLECT && o.Type !== OBJECTIVE_DESTROY) return;
    if (o.Type === OBJECTIVE_COLLECT) {
      for (let i = o.placed; i < o.Count; i++) if (MapTryPlaceCollectible(mb, idx)) o.placed++;
    } else {
      let strictCounter = 1000;
      for (let i = o.placed; i < o.Count; i++) {
        const strict = strictCounter > 0;
        const ok = MapPlaceRandomTile(mb, ObjectiveGetPlacementAccessFlags(o),
          (tp) => MapTryPlaceDestroyObject(mb, mb.mission, idx, tp, strict));
        if (ok) o.placed++;
        if (strictCounter > 0) strictCounter--;
      }
    }
    o.Count = o.placed;
    if (o.Count < o.Required) o.Required = o.Count;
  });
}
function MapTryPlaceCollectible(mb: MapBuilder, objective: number): boolean {
  const o = mb.mission.Objectives[objective];
  const hasLockedRooms = (o.Flags & OBJECTIVE_HIACCESS) !== 0 && MapHasLockedRooms(mb.Map);
  const noaccess = (o.Flags & OBJECTIVE_NOACCESS) !== 0;
  let i = noaccess || hasLockedRooms ? 1000 : 100;
  while (i) {
    const v = MapGetRandomPos(mb.Map);
    if (!IsCollisionWithWall(v, svec2i(COLLECTABLE_W, COLLECTABLE_H))) {
      if ((!hasLockedRooms || MapPosIsInLockedRoom(mb.Map, v)) && (!noaccess || !MapPosIsInLockedRoom(mb.Map, v))) {
        MapPlaceCollectible(mb.mission, objective, v);
        return true;
      }
    }
    i--;
  }
  return false;
}
function AddKeys(mb: MapBuilder): void {
  if (mb.Map.keyAccessCount >= 5) MapPlaceCard(mb, 3, MAP_ACCESS_BLUE);
  if (mb.Map.keyAccessCount >= 4) MapPlaceCard(mb, 2, MAP_ACCESS_GREEN);
  if (mb.Map.keyAccessCount >= 3) MapPlaceCard(mb, 1, MAP_ACCESS_YELLOW);
  if (mb.Map.keyAccessCount >= 2) MapPlaceCard(mb, 0, 0);
}
function MapPlaceCard(mb: MapBuilder, keyIndex: number, mapAccess: number): void {
  for (;;) {
    const v = MapGetRandomTile(mb.Map);
    const t = MapGetTile(mb.Map, v)!;
    if (t.Class.IsRoom && TileIsClear(t) && TileCanWalk(t) && MapBuildGetAccess(mb, v) === mapAccess &&
      TileIsClear(MapGetTile(mb.Map, svec2i(v.x, v.y + 1)))) {
      MapPlaceKey(mb, v, keyIndex);
      return;
    }
  }
}

function MapTileIsNormalFloor(mb: MapBuilder, pos: Vec2i): boolean {
  const tile = MapBuilderGetTile(mb, pos)!;
  if (tile.Type !== TILE_CLASS_FLOOR || tile.IsRoom) return false;
  const tAbove = MapBuilderGetTile(mb, svec2i(pos.x, pos.y - 1));
  if (!tAbove || tAbove.Type !== TILE_CLASS_FLOOR || tAbove.IsRoom) return false;
  return true;
}
function MapSetupTilesAndWalls(mb: MapBuilder): void {
  rectForEach(Rect2iNew(svec2i_zero(), mb.Map.Size), (v) => { MapSetupTile(mb, v); });
  if (mb.mission.Type !== MAPTYPE_STATIC || mb.mission.Static.AltFloorsEnabled) {
    const n = mb.Map.Size.x * mb.Map.Size.y;
    for (let i = 0; i < idiv(n, 22); i++) {
      const pos = MapGetRandomTile(mb.Map);
      if (MapTileIsNormalFloor(mb, pos)) {
        const t = MapGetTile(mb.Map, pos)!;
        t.Class = TileClassesGetMaskedTile(mb.Map.TileClasses, t.Class, t.Class.Style, 'alt1', t.Class.Mask, t.Class.MaskAlt);
      }
    }
    for (let i = 0; i < idiv(n, 16); i++) {
      const pos = MapGetRandomTile(mb.Map);
      if (MapTileIsNormalFloor(mb, pos)) {
        const t = MapGetTile(mb.Map, pos)!;
        t.Class = TileClassesGetMaskedTile(mb.Map.TileClasses, t.Class, t.Class.Style, 'alt2', t.Class.Mask, t.Class.MaskAlt);
      }
    }
  }
}
function MapSetupTile(mb: MapBuilder, pos: Vec2i): void {
  if (!MapIsTileIn(mb.Map, pos)) return;
  const tAbove = MapGetTile(mb.Map, svec2i(pos.x, pos.y - 1));
  const canSeeTileAbove = !(tAbove != null && TileIsOpaque(tAbove));
  const t = MapGetTile(mb.Map, pos);
  if (!t) return;
  const tc = MapBuilderGetTile(mb, pos)!;
  if (tc.Type === TILE_CLASS_FLOOR) {
    t.Class = TileClassesGetMaskedTile(mb.Map.TileClasses, tc, tc.Style, canSeeTileAbove ? 'normal' : 'shadow', tc.Mask, tc.MaskAlt);
  } else if (tc.Type === TILE_CLASS_WALL) {
    t.Class = TileClassesGetMaskedTile(mb.Map.TileClasses, tc, tc.Style, MapGetWallPic(mb, pos), tc.Mask, tc.MaskAlt);
  } else if (tc.Type === TILE_CLASS_DOOR) {
    t.Class = TileClassesGetMaskedTile(mb.Map.TileClasses, tc, tc.Style, 'normal_h', tc.Mask, tc.MaskAlt);
  } else {
    t.Class = gTileNothing;
  }
}
function W(mb: MapBuilder, x: number, y: number): boolean {
  const v = svec2i(x, y);
  if (!MapIsTileIn(mb.Map, v)) return false;
  return MapBuilderGetTile(mb, v)!.Type === TILE_CLASS_WALL;
}
function MapGetWallPic(m: MapBuilder, pos: Vec2i): string {
  const x = pos.x;
  const y = pos.y;
  if (W(m, x - 1, y) && W(m, x + 1, y) && W(m, x, y + 1) && W(m, x, y - 1)) return 'x';
  if (W(m, x - 1, y) && W(m, x + 1, y) && W(m, x, y + 1)) return 'nt';
  if (W(m, x - 1, y) && W(m, x + 1, y) && W(m, x, y - 1)) return 'st';
  if (W(m, x - 1, y) && W(m, x, y + 1) && W(m, x, y - 1)) return 'et';
  if (W(m, x + 1, y) && W(m, x, y + 1) && W(m, x, y - 1)) return 'wt';
  if (W(m, x + 1, y) && W(m, x, y + 1)) return 'nw';
  if (W(m, x + 1, y) && W(m, x, y - 1)) return 'sw';
  if (W(m, x - 1, y) && W(m, x, y + 1)) return 'ne';
  if (W(m, x - 1, y) && W(m, x, y - 1)) return 'se';
  if (W(m, x - 1, y) && W(m, x + 1, y)) return 'h';
  if (W(m, x, y + 1) && W(m, x, y - 1)) return 'v';
  if (W(m, x, y + 1)) return 'n';
  if (W(m, x, y - 1)) return 's';
  if (W(m, x + 1, y)) return 'w';
  if (W(m, x - 1, y)) return 'e';
  return 'o';
}
function MapIsValidStartForWall(mb: MapBuilder, pos: Vec2i, isRoom: boolean, pad: number): boolean {
  if (!MapIsTileIn(mb.Map, pos) || pos.x === 0 || pos.y === 0 || pos.x === mb.Map.Size.x - 1 ||
    pos.y === mb.Map.Size.y - 1) return false;
  for (let dx = pos.x - pad; dx <= pos.x + pad; dx++) {
    for (let dy = pos.y - pad; dy <= pos.y + pad; dy++) {
      const d = svec2i(dx, dy);
      const t = MapBuilderGetTile(mb, d);
      if (t == null || t.Type !== TILE_CLASS_FLOOR || t.IsRoom !== isRoom || MapBuilderIsLeaveFree(mb, d)) return false;
    }
  }
  return true;
}
export function MapGetRoomSize(r: RoomParams, doorMin: number): Vec2i {
  const roomMin = MAX(r.Min, doorMin + 2);
  const roomMax = MAX(r.Max, doorMin + 2);
  const x = RAND_INT(roomMin, roomMax);
  const y = RAND_INT(roomMin, roomMax);
  return svec2i(x, y);
}
function MapBuilderGetIsRoom(mb: MapBuilder, pos: Vec2i): boolean {
  const t = MapBuilderGetTile(mb, pos);
  return t != null && t.Type === TILE_CLASS_FLOOR && t.IsRoom;
}
export function MapMakeRoom(mb: MapBuilder, pos: Vec2i, size: Vec2i, walls: boolean, wall: TileClass, room: TileClass,
  removeInterRoomWalls: boolean): void {
  for (let y = pos.y; y < pos.y + size.y; y++) {
    for (let x = pos.x; x < pos.x + size.x; x++) {
      const v = svec2i(x, y);
      if (y === pos.y || y === pos.y + size.y - 1 || x === pos.x || x === pos.x + size.x - 1) {
        const t = MapBuilderGetTile(mb, v);
        if (walls && t != null && !t.IsRoom) MapBuilderSetTile(mb, v, wall);
      } else {
        MapBuilderSetTile(mb, v, room);
      }
    }
  }
  if (removeInterRoomWalls) {
    for (let y = pos.y; y < pos.y + size.y; y++) {
      for (let x = pos.x; x < pos.x + size.x; x++) {
        if (y === pos.y || y === pos.y + size.y - 1 || x === pos.x || x === pos.x + size.x - 1) {
          if ((MapBuilderGetIsRoom(mb, svec2i(x + 1, y)) && MapBuilderGetIsRoom(mb, svec2i(x - 1, y))) ||
            (MapBuilderGetIsRoom(mb, svec2i(x, y + 1)) && MapBuilderGetIsRoom(mb, svec2i(x, y - 1)))) {
            MapBuilderSetTile(mb, svec2i(x, y), room);
          }
        }
      }
    }
  }
}
export function MapMakeRoomWalls(mb: MapBuilder, r: RoomParams, wall: TileClass, room: Rect2i): void {
  let count = 0;
  for (let i = 0; i < 100 && count < r.Walls; i++) {
    if (!MapTryBuildWall(mb, true, MAX(r.WallPad, 1), r.WallLength, wall, room)) continue;
    count++;
  }
}
export function MapTryBuildWall(mb: MapBuilder, isRoom: boolean, pad: number, wallLength: number, wall: TileClass,
  r: Rect2i): boolean {
  let v: Vec2i;
  if (Rect2iIsZero(r)) v = MapGetRandomTile(mb.Map);
  else {
    const x = cmod(rand(), r.Size.x);
    const y = cmod(rand(), r.Size.y);
    v = svec2i_add(r.Pos, svec2i(x, y));
  }
  if (MapIsValidStartForWall(mb, v, isRoom, pad)) {
    MapBuilderSetTile(mb, v, wall);
    MapGrowWall(mb, v, isRoom, pad, rand() & 3, wallLength, wall);
    return true;
  }
  return false;
}
function MapGrowWallCheck(mb: MapBuilder, v: Vec2i, isRoom: boolean): boolean {
  if (!MapIsTileIn(mb.Map, v)) return true;
  const t = MapBuilderGetTile(mb, v);
  return !(t == null || t.Type !== TILE_CLASS_FLOOR || t.IsRoom !== isRoom || MapBuilderIsLeaveFree(mb, v));
}
function MapGrowWall(mb: MapBuilder, posIn: Vec2i, isRoom: boolean, pad: number, d: number, lengthIn: number,
  wall: TileClass): void {
  const pos = { ...posIn };
  let length = lengthIn;
  if (length <= 0) return;
  switch (d) {
    case 0:
      if (pos.y < 2 + pad) return;
      for (let vy = pos.y - 2; vy > pos.y - 2 - pad; vy--) {
        const level = vy - (pos.y - 2);
        for (let vx = pos.x - 1 - level; vx <= pos.x + 1 + level; vx++) if (!MapGrowWallCheck(mb, svec2i(vx, vy), isRoom)) return;
      }
      pos.y--;
      break;
    case 1:
      for (let vx = pos.x + 2; vx < pos.x + 2 + pad; vx++) {
        const level = vx - (pos.x + 2);
        for (let vy = pos.y - 1 - level; vy <= pos.y + 1 + level; vy++) if (!MapGrowWallCheck(mb, svec2i(vx, vy), isRoom)) return;
      }
      pos.x++;
      break;
    case 2:
      for (let vy = pos.y + 2; vy < pos.y + 2 + pad; vy++) {
        const level = vy - (pos.y + 2);
        for (let vx = pos.x - 1 - level; vx <= pos.x + 1 + level; vx++) if (!MapGrowWallCheck(mb, svec2i(vx, vy), isRoom)) return;
      }
      pos.y++;
      break;
    case 4:
      if (pos.x < 2 + pad) return;
      for (let vx = pos.x - 2; vx > pos.x - 2 - pad; vx--) {
        const level = vx - (pos.x - 2);
        for (let vy = pos.y - 1 - level; vy <= pos.y + 1 + level; vy++) if (!MapGrowWallCheck(mb, svec2i(vx, vy), isRoom)) return;
      }
      pos.x--;
      break;
    default:
      break;
  }
  MapBuilderSetTile(mb, pos, wall);
  length--;
  if (length > 0 && (rand() & 3) === 0) {
    const l = cmod(rand(), length);
    MapGrowWall(mb, pos, isRoom, pad, rand() & 3, l, wall);
    length -= l;
  }
  MapGrowWall(mb, pos, isRoom, pad, d, length, wall);
}
export function MapSetRoomAccessMask(mb: MapBuilder, r: Rect2i, accessMask: number): void {
  rectForEach(r, (v) => { MapBuildSetAccess(mb, v, accessMask); });
}
export function MapSetRoomAccessMaskOverlap(mb: MapBuilder, rooms: Rect2i[], accessMask: number): void {
  const overlapRooms: Rect2i[] = [rooms[0]];
  for (let k = 0; k < overlapRooms.length; k++) {
    const room = overlapRooms[k];
    for (let i = 0; i < rooms.length; i++) {
      const r = rooms[i];
      if (Rect2iOverlap(room, r)) {
        MapSetRoomAccessMask(mb, r, accessMask);
        overlapRooms.push(r);
        rooms.splice(i, 1);
        i--;
      }
    }
  }
}
export function MapPlaceDoors(mb: MapBuilder, r: Rect2i, hasDoors: boolean, doors: boolean[], doorMin: number,
  doorMax: number, accessMask: number, randomPos: boolean, door: TileClass, floor: TileClass): void {
  const tile = hasDoors ? door : floor;
  MapSetRoomAccessMask(mb, r, accessMask);
  for (let i = 0; i < 4; i++) {
    if (!doors[i]) continue;
    const doorSize = doorMax > doorMin ? RAND_INT(doorMin, doorMax) : doorMin;
    let roomDim: number;
    let d: Vec2i;
    let doorStart: Vec2i;
    switch (i) {
      case 0: roomDim = r.Size.y; d = svec2i(1, 0); doorStart = r.Pos; break;
      case 1: roomDim = r.Size.y; d = svec2i(1, 0); doorStart = svec2i(r.Pos.x + r.Size.x - 1, r.Pos.y); break;
      case 2: roomDim = r.Size.x; d = svec2i(0, 1); doorStart = r.Pos; break;
      default: roomDim = r.Size.x; d = svec2i(0, 1); doorStart = svec2i(r.Pos.x, r.Pos.y + r.Size.y - 1); break;
    }
    PlaceDoors(mb, doorSize, roomDim, doorStart, d, randomPos, tile);
  }
}
function PlaceDoors(mb: MapBuilder, doorSize: number, roomDim: number, doorStart: Vec2i, d: Vec2i, randomPos: boolean,
  tile: TileClass): void {
  const dAcross = svec2i_subtract(svec2i_one(), d);
  const size = MIN(doorSize, roomDim - 2);
  let start = doorStart;
  if (randomPos) start = svec2i_add(start, svec2i_scale(dAcross, RAND_INT(1, roomDim - size - 1)));
  else start = svec2i_add(start, svec2i_scale(dAcross, idiv(roomDim - size, 2)));
  for (let i = 0; i < size; i++) {
    const v = svec2i_add(start, svec2i_scale(dAcross, i));
    if (!TryPlaceDoorTile(mb, v, d, tile)) break;
  }
}
function TryPlaceDoorTile(mb: MapBuilder, v: Vec2i, d: Vec2i, tile: TileClass): boolean {
  if (MapBuilderGetTile(mb, v)!.Type === TILE_CLASS_WALL &&
    MapBuilderGetTile(mb, svec2i_add(v, d))!.Type !== TILE_CLASS_WALL &&
    MapBuilderGetTile(mb, svec2i_subtract(v, d))!.Type !== TILE_CLASS_WALL) {
    MapBuilderSetTile(mb, v, tile);
    return true;
  }
  return false;
}
export function MapIsAreaInside(map: GameMap, pos: Vec2i, size: Vec2i): boolean {
  return pos.x >= 0 && pos.y >= 0 && pos.x + size.x < map.Size.x && pos.y + size.y < map.Size.y;
}
function MapBuilderIsAreaFunc(mb: MapBuilder, pos: Vec2i, size: Vec2i, func: (mb: MapBuilder, v: Vec2i) => boolean): boolean {
  if (!MapIsAreaInside(mb.Map, pos, size)) return false;
  let ok = true;
  rectForEach(Rect2iNew(pos, size), (v) => {
    if (!func(mb, v)) {
      ok = false;
      return true;
    }
    return false;
  });
  return ok;
}
function IsClear(mb: MapBuilder, pos: Vec2i): boolean {
  return MapBuilderGetTile(mb, pos)!.Type === TILE_CLASS_FLOOR && !MapBuilderIsLeaveFree(mb, pos);
}
export function MapIsAreaClear(mb: MapBuilder, pos: Vec2i, size: Vec2i): boolean {
  return MapBuilderIsAreaFunc(mb, pos, size, IsClear);
}
function AreaHasRoomAndFloor(mb: MapBuilder, pos: Vec2i): boolean {
  let hasRoom = false;
  let hasFloor = false;
  rectForEach(Rect2iNew(svec2i_subtract(pos, svec2i_one()), svec2i(3, 3)), (v) => {
    const t = MapBuilderGetTile(mb, v);
    if (t == null || t.Type !== TILE_CLASS_FLOOR || MapBuilderIsLeaveFree(mb, v)) return;
    if (t.IsRoom) hasRoom = true;
    else hasFloor = true;
  });
  return hasRoom && hasFloor;
}
function IsClearOrRoom(mb: MapBuilder, pos: Vec2i): boolean {
  const tile = MapBuilderGetTile(mb, pos)!;
  if (tile.Type === TILE_CLASS_FLOOR && !MapBuilderIsLeaveFree(mb, pos)) return true;
  if (tile.Type !== TILE_CLASS_WALL) return false;
  return AreaHasRoomAndFloor(mb, pos);
}
export function MapIsAreaClearOrRoom(mb: MapBuilder, pos: Vec2i, size: Vec2i): boolean {
  return MapBuilderIsAreaFunc(mb, pos, size, IsClearOrRoom);
}
function IsClearOrWall(mb: MapBuilder, pos: Vec2i): boolean {
  const tile = MapBuilderGetTile(mb, pos)!;
  if (tile.Type === TILE_CLASS_FLOOR && !tile.IsRoom && !MapBuilderIsLeaveFree(mb, pos)) return true;
  if (tile.Type !== TILE_CLASS_WALL) return false;
  return AreaHasRoomAndFloor(mb, pos);
}
export function MapIsAreaClearOrWall(mb: MapBuilder, pos: Vec2i, size: Vec2i): boolean {
  return MapBuilderIsAreaFunc(mb, pos, size, IsClearOrWall);
}
/** returns the overlap size; overlapAccess collects the access of overlapping rooms */
export function MapGetRoomOverlapSize(mb: MapBuilder, r: Rect2i, overlapAccess: { v: number } | null): number {
  let numOverlaps = 0;
  let overlapMin = svec2i_zero();
  let overlapMax = svec2i_zero();
  rectForEach(r, (v) => {
    if (v.x !== r.Pos.x && v.x !== r.Pos.x + r.Size.x - 1 && v.y !== r.Pos.y && v.y !== r.Pos.y + r.Size.y - 1) return;
    if (!MapIsTileIn(mb.Map, v)) return;
    const tile = MapBuilderGetTile(mb, v)!;
    if (tile.Type !== TILE_CLASS_WALL || !AreaHasRoomAndFloor(mb, v)) return;
    for (let y2 = v.y - 1; y2 <= v.y + 1; y2++) {
      for (let x2 = v.x - 1; x2 <= v.x + 1; x2++) {
        const v2 = svec2i(x2, y2);
        const t = MapBuilderGetTile(mb, v2);
        if (t != null && t.IsRoom && overlapAccess != null) overlapAccess.v |= MapBuildGetAccess(mb, v2);
      }
    }
    if (numOverlaps === 0) {
      overlapMin = { ...v };
      overlapMax = { ...v };
    } else {
      overlapMin = svec2i_min(overlapMin, v);
      overlapMax = svec2i_max(overlapMax, v);
    }
    numOverlaps++;
  });
  if (numOverlaps < 2) return 0;
  for (let y = overlapMin.y; y <= overlapMax.y; y++) {
    for (let x = overlapMin.x; x <= overlapMax.x; x++) {
      const v = svec2i(x, y);
      const tile = MapBuilderGetTile(mb, v)!;
      if (tile.Type === TILE_CLASS_WALL) {
        if (!AreaHasRoomAndFloor(mb, v)) return 0;
      } else if (!tile.IsRoom) return 0;
    }
  }
  return MAX(overlapMax.x - overlapMin.x, overlapMax.y - overlapMin.y) - 1;
}
function MapIsLessThanTwoWallOverlaps(mb: MapBuilder, pos: Vec2i, size: Vec2i): boolean {
  if (!MapIsTileIn(mb.Map, pos)) return false;
  let numOverlaps = 0;
  let overlapMin = svec2i_zero();
  let overlapMax = svec2i_zero();
  for (let y = pos.y; y < pos.y + size.y; y++) {
    for (let x = pos.x; x < pos.x + size.x; x++) {
      if (x !== pos.x && x !== pos.x + size.x - 1 && y !== pos.y && y !== pos.y + size.y - 1) continue;
      const v = svec2i(x, y);
      if (MapBuilderGetTile(mb, v)!.Type !== TILE_CLASS_WALL) continue;
      if (!AreaHasRoomAndFloor(mb, v)) {
        if (numOverlaps === 0) {
          overlapMin = { ...v };
          overlapMax = { ...v };
        } else {
          overlapMin = svec2i_min(overlapMin, v);
          overlapMax = svec2i_max(overlapMax, v);
        }
        numOverlaps++;
      }
    }
  }
  if (numOverlaps < 2) return true;
  for (let y = overlapMin.y; y <= overlapMax.y; y++) {
    for (let x = overlapMin.x; x <= overlapMax.x; x++) {
      const v = svec2i(x, y);
      if (MapBuilderGetTile(mb, v)!.Type !== TILE_CLASS_WALL) return false;
      if (AreaHasRoomAndFloor(mb, v)) return false;
    }
  }
  return true;
}
export function MapFillRect(mb: MapBuilder, r: Rect2i, edge: TileClass, fill: TileClass): void {
  rectForEach(r, (v) => { MapBuilderSetTile(mb, v, Rect2iIsAtEdge(r, v) ? edge : fill); });
}
export function GenerateAccessMask(accessLevel: { v: number }): number {
  let accessMask = 0;
  switch (cmod(rand(), 20)) {
    case 0:
      if (accessLevel.v >= 4) {
        accessMask = MAP_ACCESS_RED;
        accessLevel.v = 5;
      }
      break;
    case 1: case 2:
      if (accessLevel.v >= 3) {
        accessMask = MAP_ACCESS_BLUE;
        if (accessLevel.v < 4) accessLevel.v = 4;
      }
      break;
    case 3: case 4: case 5:
      if (accessLevel.v >= 2) {
        accessMask = MAP_ACCESS_GREEN;
        if (accessLevel.v < 3) accessLevel.v = 3;
      }
      break;
    case 6: case 7: case 8: case 9:
      if (accessLevel.v >= 1) {
        accessMask = MAP_ACCESS_YELLOW;
        if (accessLevel.v < 2) accessLevel.v = 2;
      }
      break;
    default:
      break;
  }
  if (accessLevel.v < 1) accessLevel.v = 1;
  return accessMask;
}
function keyAccessRef(mb: MapBuilder): { v: number } {
  const m = mb.Map;
  return {
    get v() { return m.keyAccessCount; },
    set v(x: number) { m.keyAccessCount = x; },
  };
}
function MapGenerateRandomExitArea(map: GameMap, mission: number): void {
  let t: Tile | null = null;
  const exit: Exit = { R: Rect2iZero(), Mission: mission + 1, Hidden: false };
  for (let i = 0; i < 10000 && (t == null || !TileCanWalk(t)); i++) {
    exit.R.Size.x = MIN(map.Size.x - 2, EXIT_WIDTH + 1);
    exit.R.Pos.x = cmod(rand(), Math.abs(map.Size.x) - exit.R.Size.x);
    exit.R.Size.y = MIN(map.Size.y - 2, EXIT_HEIGHT + 1);
    exit.R.Pos.y = cmod(rand(), Math.abs(map.Size.y) - exit.R.Size.y);
    t = MapGetTile(map, Rect2iCenter(exit.R));
  }
  map.exits.push({ R: { Pos: { ...exit.R.Pos }, Size: { ...exit.R.Size } }, Mission: exit.Mission, Hidden: false });
}
function MapAddDrains(mb: MapBuilder): void {
  const drain = StrMapObject('drain0');
  if (drain == null) return;
  for (let i = 0; i < idiv(mb.Map.Size.x * mb.Map.Size.y, 45); i++) {
    const v = MapGetRandomTile(mb.Map);
    v.x &= 0xfffffe;
    v.y &= 0xfffffe;
    if (MapTileIsNormalFloor(mb, v)) MapTryPlaceOneObject(mb, v, drain, 0, false);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// door.c

function GetDoorType(isHorizontal: boolean, i: number, count: number): number {
  if (isHorizontal) {
    if (count === 1) return DOORTYPE_H;
    if (i === 0) return DOORTYPE_LEFT;
    if (i === count - 1) return DOORTYPE_RIGHT;
    return DOORTYPE_HMID;
  }
  if (count === 1) return DOORTYPE_V;
  if (i === 0) return DOORTYPE_TOP;
  if (i === count - 1) return DOORTYPE_BOTTOM;
  return DOORTYPE_VMID;
}
function DoorTypeIsHorizontal(type: number): boolean {
  return type === DOORTYPE_H || type === DOORTYPE_LEFT || type === DOORTYPE_HMID || type === DOORTYPE_RIGHT;
}
function DoorGetTypeName(key: string, type: number): string {
  let typeStr = '';
  if (key === 'wall') {
    typeStr = '';
  } else if (key === 'open') {
    typeStr = DoorTypeIsHorizontal(type) ? '_h' : '_v';
  } else {
    typeStr = ['_h', '_left', '_hmid', '_right', '_v', '_top', '_vmid', '_bottom'][type] ?? '';
  }
  return `${key}${typeStr}`;
}
function DoorGetClassName(door: TileClass, key: string, dType: number): string {
  const type = DoorGetTypeName(key, dType);
  const mask = key === 'normal' ? door.Mask : colorWhite;
  const maskAlt = key === 'normal' ? door.MaskAlt : colorWhite;
  return TileClassGetName(door, door.Style, type, mask, maskAlt);
}
function DoorAddClass(c: Map<string, TileClass>, pm: PicManager, base: TileClass, key: string, type: number): void {
  const buf = DoorGetTypeName(key, type);
  const mask = key === 'normal' ? base.Mask : colorWhite;
  const maskAlt = key === 'normal' ? base.MaskAlt : colorWhite;
  PicManagerGenerateMaskedStylePic(pm, 'door', base.Style!, buf, mask, maskAlt, true);
  const t = TileClassesAdd(c, pm, base, base.Style, buf, mask, maskAlt);
  const isOpenOrWallCavity = key === 'open' || key === 'wall';
  t.isOpaque = !isOpenOrWallCavity;
  t.canWalk = isOpenOrWallCavity;
  t.shootable = !isOpenOrWallCavity;
}
function DoorGroupIsHorizontal(mb: MapBuilder, v: Vec2i): boolean {
  const l = MapBuilderGetTile(mb, svec2i(v.x - 1, v.y));
  const r = MapBuilderGetTile(mb, svec2i(v.x + 1, v.y));
  const a = MapBuilderGetTile(mb, svec2i(v.x, v.y - 1));
  const b = MapBuilderGetTile(mb, svec2i(v.x, v.y + 1));
  const lD = l != null && l.Type === TILE_CLASS_DOOR;
  const rD = r != null && r.Type === TILE_CLASS_DOOR;
  const aD = a != null && a.Type === TILE_CLASS_DOOR;
  const bD = b != null && b.Type === TILE_CLASS_DOOR;
  const lW = l != null && l.canWalk;
  const rW = r != null && r.canWalk;
  const aW = a != null && a.canWalk;
  const bW = b != null && b.canWalk;
  if (aW && bW && lW && rW) {
    if (lD && rD) return true;
    if (aD && bD) return false;
    return lD || rD;
  }
  if (aW && bW) return true;
  if (lW && rW) return false;
  if (aW || bW) return true;
  if (aD || bD) return true;
  return false;
}
function GetDoorCountInGroup(mb: MapBuilder, v: Vec2i, isHorizontal: boolean): number {
  const dv = svec2i(isHorizontal ? 1 : 0, isHorizontal ? 0 : 1);
  let count = 0;
  for (let vi = v; MapIsTileIn(mb.Map, vi) && MapBuilderGetTile(mb, vi)!.Type === TILE_CLASS_DOOR; vi = svec2i_add(vi, dv)) count++;
  return count;
}
function MapAddDoorGroup(mb: MapBuilder, v: Vec2i, keyFlags: number): Vec2i {
  const door = MapBuilderGetTile(mb, v)!;
  const isHorizontal = DoorGroupIsHorizontal(mb, v);
  const doorGroupCount = GetDoorCountInGroup(mb, v, isHorizontal);
  const dv = svec2i(isHorizontal ? 1 : 0, isHorizontal ? 0 : 1);
  const dAside = svec2i(dv.y, dv.x);
  let doorKey: string;
  switch (keyFlags) {
    case FLAGS_KEYCARD_RED: doorKey = 'red'; break;
    case FLAGS_KEYCARD_BLUE: doorKey = 'blue'; break;
    case FLAGS_KEYCARD_GREEN: doorKey = 'green'; break;
    case FLAGS_KEYCARD_YELLOW: doorKey = 'yellow'; break;
    default: doorKey = 'normal'; break;
  }
  for (let i = 0; i < doorGroupCount; i++) {
    const type = GetDoorType(isHorizontal, i, doorGroupCount);
    const doorClass = StrTileClass(mb.Map.TileClasses, DoorGetClassName(door, doorKey, type));
    const doorClassOpen = StrTileClass(mb.Map.TileClasses, DoorGetClassName(door, 'open', type));
    const vI = svec2i_add(v, svec2i_scale(dv, i));
    const tile = MapGetTile(mb.Map, vI)!;
    tile.Door.Class = doorClass;
    DoorStateInit(tile.Door, false);
    tile.Door.IsHorizontal = isHorizontal;
    tile.Class = doorClassOpen;
    if (isHorizontal) {
      const tileB = MapGetTile(mb.Map, svec2i_add(vI, dAside));
      if (TileCanWalk(tileB) && tileB!.Class.Type === TILE_CLASS_FLOOR) {
        tileB!.Class = TileClassesGetMaskedTile(mb.Map.TileClasses, tileB!.Class, tileB!.Class.Style, 'shadow',
          tileB!.Class.Mask, tileB!.Class.MaskAlt);
      }
    } else if (i === 0) {
      tile.Door.Class2 = StrTileClass(mb.Map.TileClasses, DoorGetClassName(door, 'wall', type));
    }
  }
  const w = CreateCloseDoorWatch(mb, v, isHorizontal, doorGroupCount);
  const t = CreateOpenDoorTrigger(mb, v, isHorizontal, doorGroupCount, keyFlags);
  let a = TriggerAddAction(t);
  a.Type = ACTION_ACTIVATEWATCH;
  a.index = w.index;
  a = WatchAddAction(w);
  a.Type = ACTION_SETTRIGGER;
  a.index = t.id;
  for (let i = 0; i < doorGroupCount; i++) {
    const vI = svec2i_add(v, svec2i_scale(dv, i));
    MapBuilderSetLeaveFree(mb, vI, true);
    MapBuilderSetLeaveFree(mb, svec2i_add(vI, dAside), true);
    MapBuilderSetLeaveFree(mb, svec2i_subtract(vI, dAside), true);
  }
  return isHorizontal ? svec2i(doorGroupCount, 1) : svec2i(1, doorGroupCount);
}
function CreateCloseDoorWatch(mb: MapBuilder, v: Vec2i, isHorizontal: boolean, doorGroupCount: number) {
  const w = WatchNew();
  const dv = svec2i(isHorizontal ? 1 : 0, isHorizontal ? 0 : 1);
  const dAside = svec2i(dv.y, dv.x);
  for (let i = 0; i < doorGroupCount; i++) {
    const vI = svec2i_add(v, svec2i_scale(dv, i));
    for (let j = -1; j <= 1; j++) {
      WatchAddCondition(w, CONDITION_TILECLEAR, gCampaign.Setting.DoorOpenTicks, svec2i_add(vI, svec2i_scale(dAside, j)));
    }
  }
  let a = WatchAddAction(w);
  a.Type = ACTION_DEACTIVATEWATCH;
  a.index = w.index;
  a = WatchAddAction(w);
  a.Type = ACTION_EVENT;
  a.Event = GameEventNew(GAME_EVENT_SOUND_AT);
  a.Event.u.Sound = 'door_close';
  a.Event.u.Pos = Vec2CenterOfTile(svec2i_add(v, svec2i_scale(dv, f32(doorGroupCount / 2))));
  for (let i = 0; i < doorGroupCount; i++) {
    const vI = svec2i_add(v, svec2i_scale(dv, i));
    a = WatchAddAction(w);
    a.Type = ACTION_EVENT;
    a.Event = GameEventNew(GAME_EVENT_DOOR_TOGGLE);
    a.Event.u.IsOpen = false;
    a.Event.u.Pos = { ...vI };
  }
  if (isHorizontal) {
    for (let i = 0; i < doorGroupCount; i++) {
      const vI = svec2i_add(v, svec2i_scale(dv, i));
      const vI2 = svec2i(vI.x + dAside.x, vI.y + dAside.y);
      const t = MapBuilderGetTile(mb, vI2)!;
      if (t.Type === TILE_CLASS_FLOOR) {
        a = WatchAddAction(w);
        a.Type = ACTION_EVENT;
        a.Event = GameEventNew(GAME_EVENT_TILE_SET);
        a.Event.u.Pos = { ...vI2 };
        a.Event.u.ClassName = TileClassGetName(t, t.Style, 'shadow', t.Mask, t.MaskAlt);
      }
    }
  }
  return w;
}
function CreateOpenDoorTrigger(mb: MapBuilder, v: Vec2i, isHorizontal: boolean, doorGroupCount: number, keyFlags: number) {
  const dv = svec2i(isHorizontal ? 1 : 0, isHorizontal ? 0 : 1);
  const dAside = svec2i(dv.y, dv.x);
  const t = MapNewTrigger(mb.Map);
  t.flags = keyFlags;
  let a = TriggerAddAction(t);
  a.Type = ACTION_CLEARTRIGGER;
  a.index = t.id;
  for (let i = 0; i < doorGroupCount; i++) {
    const vI = svec2i_add(v, svec2i_scale(dv, i));
    a = TriggerAddAction(t);
    a.Type = ACTION_EVENT;
    a.Event = GameEventNew(GAME_EVENT_DOOR_TOGGLE);
    a.Event.u.IsOpen = true;
    a.Event.u.Pos = { ...vI };
  }
  if (isHorizontal) {
    for (let i = 0; i < doorGroupCount; i++) {
      const vI = svec2i_add(v, svec2i_scale(dv, i));
      const vIAside = svec2i_add(vI, dAside);
      const tc = MapBuilderGetTile(mb, vIAside)!;
      if (tc.Type === TILE_CLASS_FLOOR) {
        a = TriggerAddAction(t);
        a.Type = ACTION_EVENT;
        a.Event = GameEventNew(GAME_EVENT_TILE_SET);
        a.Event.u.Pos = { ...vIAside };
        a.Event.u.ClassName = TileClassGetName(tc, tc.Style, 'normal', tc.Mask, tc.MaskAlt);
      }
    }
  }
  for (let i = 0; i < doorGroupCount; i++) {
    const vI = svec2i_add(v, svec2i_scale(dv, i));
    MapGetTile(mb.Map, svec2i_subtract(vI, dAside))?.triggers.push(t);
    MapGetTile(mb.Map, svec2i_add(vI, dAside))?.triggers.push(t);
  }
  a = TriggerAddAction(t);
  a.Type = ACTION_EVENT;
  a.Event = GameEventNew(GAME_EVENT_SOUND_AT);
  a.Event.u.Sound = 'door';
  a.Event.u.Pos = Vec2CenterOfTile(svec2i_add(v, svec2i_scale(dv, f32(doorGroupCount / 2))));
  return t;
}

// ---------------------------------------------------------------------------------------------------------------
// map_classic.c

function MapClassicLoad(mb: MapBuilder): void {
  const C = mb.mission.Classic;
  MissionSetupTileClasses(mb.Map, gPicManager, C.TileClasses);
  MapFillRect(mb, Rect2iNew(svec2i_zero(), mb.mission.Size), C.TileClasses.Wall, C.TileClasses.Floor);
  const pad = MAX(C.CorridorWidth, 1);
  let count = 0;
  let i = 0;
  while (i < 1000 && count < C.Squares) {
    if (MapTryBuildSquare(mb)) count++;
    i++;
  }
  count = 0;
  for (i = 0; i < 1000 && count < C.Rooms.Count; i++) {
    const v = MapGetRandomTile(mb.Map);
    const doorMin = CLAMP(C.Doors.Min, 1, 6);
    const doorMax = CLAMP(C.Doors.Max, doorMin, 6);
    const size = MapGetRoomSize(C.Rooms, doorMin);
    const r = MapIsAreaClearForClassicRoom(mb, v, size, pad);
    if (!r.isClear) continue;
    MapBuildClassicRoom(mb, v, size, doorMin, doorMax, AreKeysAllowed(mb.mode), r.isOverlapRoom, r.overlapAccess);
    count++;
  }
  count = 0;
  i = 0;
  while (i < 1000 && count < C.Pillars.Count) {
    if (MapTryBuildPillar(mb, pad)) count++;
    i++;
  }
  count = 0;
  i = 0;
  while (i < 1000 && count < C.Walls) {
    if (MapTryBuildWall(mb, false, pad, C.WallLength, C.TileClasses.Wall, Rect2iZero())) count++;
    i++;
  }
}
function MapTryBuildSquare(mb: MapBuilder): boolean {
  const v = MapGetRandomTile(mb.Map);
  const sx = cmod(rand(), 9) + 8;
  const sy = cmod(rand(), 9) + 8;
  const size = svec2i(sx, sy);
  if (MapIsAreaClear(mb, v, size)) {
    const area = Rect2iNew(v, size);
    MapFillRect(mb, area, mb.mission.Classic.TileClasses.Floor, mb.mission.Classic.TileClasses.Floor);
    rectForEach(area, (p) => { MapBuilderSetLeaveFree(mb, p, true); });
    return true;
  }
  return false;
}
function edgeClear(mb: MapBuilder, pos: Vec2i, size: Vec2i, pad: number): { clearPos: Vec2i; clearSize: Vec2i; isEdge: boolean } {
  const clearPos = svec2i(pos.x - pad, pos.y - pad);
  const clearSize = svec2i(size.x + 2 * pad, size.y + 2 * pad);
  let isEdge = false;
  if (pos.x === 0 || pos.x === 1) {
    const dx = 1 - clearPos.x;
    clearPos.x += dx;
    clearSize.x -= dx;
    isEdge = true;
  } else if (pos.x + size.x === mb.Map.Size.x - 2 || pos.x + size.x === mb.Map.Size.x - 1) {
    clearSize.x = mb.Map.Size.x - 1 - pos.x;
    isEdge = true;
  }
  if (pos.y === 0 || pos.y === 1) {
    const dy = 1 - clearPos.y;
    clearPos.y += dy;
    clearSize.y -= dy;
    isEdge = true;
  } else if (pos.y + size.y === mb.Map.Size.y - 2 || pos.y + size.y === mb.Map.Size.y - 1) {
    clearSize.y = mb.Map.Size.y - 1 - pos.y;
    isEdge = true;
  }
  return { clearPos, clearSize, isEdge };
}
function MapIsAreaClearForClassicRoom(mb: MapBuilder, pos: Vec2i, size: Vec2i, pad: number):
  { isClear: boolean; isOverlapRoom: boolean; overlapAccess: number } {
  let clearPos = svec2i(pos.x - pad, pos.y - pad);
  let clearSize = svec2i(size.x + 2 * pad, size.y + 2 * pad);
  let isEdgeRoom = false;
  let isOverlapRoom = false;
  const overlapAccess = { v: 0 };
  if (mb.mission.Classic.Rooms.Edge) {
    const e = edgeClear(mb, pos, size, pad);
    clearPos = e.clearPos;
    clearSize = e.clearSize;
    isEdgeRoom = e.isEdge;
  }
  let isClear = MapIsAreaClear(mb, clearPos, clearSize);
  if (!isClear && !isEdgeRoom) {
    const isOverlap = mb.mission.Classic.Rooms.Overlap && MapIsAreaClearOrRoom(mb, clearPos, clearSize);
    const roomOverlapSize = MapGetRoomOverlapSize(mb, Rect2iNew(pos, size), overlapAccess);
    isClear = isOverlap && roomOverlapSize >= mb.mission.Classic.CorridorWidth;
    isOverlapRoom = true;
  }
  return { isClear, isOverlapRoom, overlapAccess: overlapAccess.v };
}
function MapBuildClassicRoom(mb: MapBuilder, pos: Vec2i, size: Vec2i, doorMin: number, doorMax: number,
  hasKeys: boolean, isOverlapRoom: boolean, overlapAccess: number): void {
  const C = mb.mission.Classic;
  const doormask = cmod(rand(), 15) + 1;
  let doorsUnplaced = 0;
  let accessMask = 0;
  MapMakeRoom(mb, pos, size, true, C.TileClasses.Wall, C.TileClasses.Room, true);
  const doors = MapFindAvailableDoors(mb, pos, size, doorMin);
  for (let i = 0; i < 4; i++) if ((doormask & (1 << i)) && !doors[i]) doorsUnplaced++;
  for (let i = 0; i < 4; i++) {
    if (!(doormask & (1 << i))) {
      if (doorsUnplaced === 0) doors[i] = false;
      else if (doors[i]) doorsUnplaced--;
    }
  }
  if (hasKeys && C.Doors.Enabled) {
    accessMask = isOverlapRoom ? overlapAccess : GenerateAccessMask(keyAccessRef(mb));
  }
  const r = Rect2iNew(pos, size);
  MapPlaceDoors(mb, r, C.Doors.Enabled, doors, doorMin, doorMax, accessMask, C.Doors.RandomPos, C.TileClasses.Door,
    C.TileClasses.Floor);
  MapMakeRoomWalls(mb, C.Rooms, C.TileClasses.Wall, r);
}
function MapTryBuildPillar(mb: MapBuilder, pad: number): boolean {
  const C = mb.mission.Classic;
  const pillarMin = C.Pillars.Min;
  const pillarMax = C.Pillars.Max;
  const sx = cmod(rand(), pillarMax - pillarMin + 1) + pillarMin;
  const sy = cmod(rand(), pillarMax - pillarMin + 1) + pillarMin;
  const size = svec2i(sx, sy);
  const pos = MapGetRandomTile(mb.Map);
  const e = edgeClear(mb, pos, size, pad);
  let isClear = MapIsAreaClear(mb, e.clearPos, e.clearSize);
  if (!isClear && !e.isEdge && MapIsAreaClearOrWall(mb, e.clearPos, e.clearSize)) {
    isClear = MapIsLessThanTwoWallOverlaps(mb, e.clearPos, e.clearSize);
  }
  if (isClear) {
    MapFillRect(mb, Rect2iNew(pos, size), C.TileClasses.Wall, gTileNothing);
    return true;
  }
  return false;
}
function FindWallRun(mb: MapBuilder, mid: Vec2i, d: Vec2i, len: number): number {
  let maxRun = 0;
  let run = 0;
  for (let i = 0; i < len; i++, run++) {
    const v = svec2i_add(mid, svec2i_scale(d, i));
    if (MapBuilderGetTile(mb, v)!.Type !== TILE_CLASS_WALL ||
      MapBuilderGetTile(mb, svec2i(v.x + d.y, v.y + d.x))!.Type === TILE_CLASS_WALL ||
      MapBuilderGetTile(mb, svec2i(v.x - d.y, v.y - d.x))!.Type === TILE_CLASS_WALL) {
      if (maxRun < run) maxRun = run;
      run = 0;
    }
  }
  return MAX(run, maxRun);
}
function MapFindAvailableDoors(mb: MapBuilder, pos: Vec2i, size: Vec2i, doorMin: number): boolean[] {
  const doors = [true, true, true, true];
  if (pos.x <= 1) doors[0] = false;
  else if (FindWallRun(mb, svec2i(pos.x, pos.y + 1), svec2i(0, 1), size.y - 2) < doorMin) doors[0] = false;
  if (pos.x + size.x >= mb.Map.Size.x - 2) doors[1] = false;
  else if (FindWallRun(mb, svec2i(pos.x + size.x - 1, pos.y + 1), svec2i(0, 1), size.y - 2) < doorMin) doors[1] = false;
  if (pos.y <= 1) doors[2] = false;
  else if (FindWallRun(mb, svec2i(pos.x + 1, pos.y), svec2i(1, 0), size.x - 2) < doorMin) doors[2] = false;
  if (pos.y >= mb.Map.Size.y - 2) doors[3] = false;
  else if (FindWallRun(mb, svec2i(pos.x + 1, pos.y + size.y - 1), svec2i(1, 0), size.x - 2) < doorMin) doors[3] = false;
  return doors;
}

// ---------------------------------------------------------------------------------------------------------------
// map_cave.c

function MapCaveLoad(mb: MapBuilder): void {
  const C = mb.mission.Cave;
  MissionSetupTileClasses(mb.Map, gPicManager, C.TileClasses);
  const n = idiv(C.FillPercent * mb.Map.Size.x * mb.Map.Size.y, 100);
  for (let i = 0; i < n; i++) MapBuilderSetTile(mb, svec2i(i % mb.Map.Size.x, idiv(i, mb.Map.Size.x)), C.TileClasses.Wall);
  CArrayShuffle(mb.tiles);
  for (let i = 0; i < C.Repeat; i++) CaveRep(mb, C.R1, C.R2);
  LinkDisconnectedAreas(mb);
  FixCorridors(mb, C.CorridorWidth);
  PlaceCaveSquares(mb, C.Squares);
  PlaceCaveRooms(mb);
}
function CountWallsAround(mb: MapBuilder, pos: Vec2i, d: number): number {
  let c = 0;
  rectForEach(Rect2iNew(svec2i_subtract(pos, svec2i(d, d)), svec2i(2 * d + 1, 2 * d + 1)), (v) => {
    if (!MapIsTileIn(mb.Map, v) || MapBuilderGetTile(mb, v)!.Type === TILE_CLASS_WALL) c++;
  });
  return c;
}
function CaveRep(mb: MapBuilder, r1: number, r2: number): void {
  const C = mb.mission.Cave;
  const buf: TileClass[] = [];
  rectForEach(Rect2iNew(svec2i_zero(), mb.Map.Size), (v, i) => {
    buf[i] = CountWallsAround(mb, v, 1) >= r1 || CountWallsAround(mb, v, 2) <= r2 ? C.TileClasses.Wall : C.TileClasses.Floor;
  });
  rectForEach(Rect2iNew(svec2i_zero(), mb.Map.Size), (v, i) => { MapBuilderSetTile(mb, v, buf[i]); });
}
function MapFloodFill(fl: number[], size: Vec2i, idx: number, elem: number): void {
  const indices = [idx];
  const floodTile = fl[idx];
  fl[idx] = elem;
  for (let k = 0; k < indices.length; k++) {
    const i = indices[k];
    const x = i % size.x;
    const y = idiv(i, size.x);
    let next = (y - 1) * size.x + x;
    if (y > 0 && fl[next] === floodTile) { indices.push(next); fl[next] = elem; }
    next = (y + 1) * size.x + x;
    if (y < size.y - 1 && fl[next] === floodTile) { indices.push(next); fl[next] = elem; }
    next = y * size.x + x - 1;
    if (x > 0 && fl[next] === floodTile) { indices.push(next); fl[next] = elem; }
    next = y * size.x + x + 1;
    if (x < size.x - 1 && fl[next] === floodTile) { indices.push(next); fl[next] = elem; }
  }
}
function AddCorridor(mb: MapBuilder, v1: Vec2i, v2: Vec2i, dInit: Vec2i, tile: TileClass): void {
  let start = v1;
  let end = v2;
  let d: Vec2i;
  let dAlt: Vec2i;
  let half: Vec2i;
  if (dInit.x > 0) {
    d = svec2i(1, 0);
    if (start.x > end.x) { const t = start; start = end; end = t; }
    dAlt = svec2i(0, 1);
    half = svec2i(idiv(end.x - start.x, 2) + start.x, end.y + 1);
    if (end.y < start.y) { dAlt.y = -1; half.y = end.y - 1; }
  } else {
    d = svec2i(0, 1);
    if (start.y > end.y) { const t = start; start = end; end = t; }
    dAlt = svec2i(1, 0);
    half = svec2i(end.x + 1, idiv(end.y - start.y, 2) + start.y);
    if (end.x < start.x) { dAlt.x = -1; half.x = end.x - 1; }
  }
  let v = start;
  for (; v.x !== half.x && v.y !== half.y; v = svec2i_add(v, d)) MapBuilderSetTile(mb, v, tile);
  for (; v.x !== end.x && v.y !== end.y; v = svec2i_add(v, dAlt)) MapBuilderSetTile(mb, v, tile);
  for (; v.x !== end.x || v.y !== end.y; v = svec2i_add(v, d)) MapBuilderSetTile(mb, v, tile);
  MapBuilderSetTile(mb, v, tile);
}
function LinkDisconnectedAreas(mb: MapBuilder): void {
  const fl = new Array(mb.tiles.length).fill(0);
  rectForEach(Rect2iNew(svec2i_zero(), mb.Map.Size), (v, i) => {
    if (MapBuilderGetTile(mb, v)!.Type === TILE_CLASS_WALL) fl[i] = -1;
  });
  let idx = 1;
  for (let i = 0; i < fl.length; i++) {
    if (fl[i] === 0) {
      MapFloodFill(fl, mb.Map.Size, i, idx);
      idx++;
    }
  }
  const numAreas = idx - 1;
  const areaTiles = fl.map((_, i) => i);
  CArrayShuffle(areaTiles);
  const areaStarts = new Array(numAreas).fill(0);
  for (const a of areaTiles) {
    const tile = fl[a] - 1;
    if (tile >= 0 && tile < numAreas && areaStarts[tile] === 0) areaStarts[tile] = a;
  }
  for (let i = 0; i < areaStarts.length - 1; i++) {
    const a1 = areaStarts[i];
    const a2 = areaStarts[i + 1];
    const v1 = svec2i(a1 % mb.Map.Size.x, idiv(a1, mb.Map.Size.x));
    const v2 = svec2i(a2 % mb.Map.Size.x, idiv(a2, mb.Map.Size.x));
    const dx = Math.abs(v1.x - v2.x) > Math.abs(v1.y - v2.y) ? 1 : 0;
    AddCorridor(mb, v1, v2, svec2i(dx, 1 - dx), mb.mission.Cave.TileClasses.Floor);
  }
}
function FixCorridors(mb: MapBuilder, corridorWidth: number): void {
  for (let y = corridorWidth; y < mb.Map.Size.y - corridorWidth; y++) {
    for (let x = corridorWidth; x < mb.Map.Size.x - corridorWidth; x++) {
      const v = svec2i(x, y);
      if (MapBuilderGetTile(mb, v)!.Type !== TILE_CLASS_WALL) continue;
      if (!CheckCorridorsAroundTile(mb, corridorWidth, v)) MapBuilderSetTile(mb, v, mb.mission.Cave.TileClasses.Floor);
    }
  }
}
function CheckCorridorsAroundTile(mb: MapBuilder, corridorWidth: number, v: Vec2i): boolean {
  for (let y1 = v.y - corridorWidth; y1 <= v.y + corridorWidth; y1++) {
    for (let x1 = v.x - corridorWidth; x1 <= v.x + corridorWidth; x1++) {
      if (y1 !== v.y - corridorWidth && y1 !== v.y + corridorWidth && x1 !== v.x - corridorWidth && x1 !== v.x + corridorWidth) {
        continue;
      }
      let counter = 0;
      let isFirstWall = false;
      let areAllFloors = true;
      BresenhamLineDraw(v, svec2i(x1, y1), (p) => {
        if (counter === 1) isFirstWall = MapBuilderGetTile(mb, p)!.Type === TILE_CLASS_WALL;
        if (counter > 0 && MapBuilderGetTile(mb, p)!.Type !== TILE_CLASS_FLOOR) areAllFloors = false;
        counter++;
      });
      if (!isFirstWall && !areAllFloors) return false;
    }
  }
  return true;
}
function MapIsAreaClearForCaveSquare(mb: MapBuilder, pos: Vec2i, size: Vec2i): boolean {
  if (!MapIsAreaInside(mb.Map, pos, size)) return false;
  let hasFloor = false;
  for (let y = pos.y; y < pos.y + size.y; y++) {
    for (let x = pos.x; x < pos.x + size.x; x++) {
      const v = svec2i(x, y);
      if (MapBuilderIsLeaveFree(mb, v)) return false;
      const t = MapBuilderGetTile(mb, v)!.Type;
      if (t === TILE_CLASS_FLOOR) hasFloor = true;
      else if (t !== TILE_CLASS_WALL) return false;
    }
  }
  return hasFloor;
}
function PlaceCaveSquares(mb: MapBuilder, squares: number): void {
  let count = 0;
  for (let i = 0; i < 1000 && count < squares; i++) {
    const v = MapGetRandomTile(mb.Map);
    const sx = cmod(rand(), 9) + 8;
    const sy = cmod(rand(), 9) + 8;
    const size = svec2i(sx, sy);
    if (!MapIsAreaClearForCaveSquare(mb, v, size)) continue;
    const area = Rect2iNew(v, size);
    MapFillRect(mb, area, mb.mission.Cave.TileClasses.Floor, mb.mission.Cave.TileClasses.Floor);
    rectForEach(area, (p) => { MapBuilderSetLeaveFree(mb, p, true); });
    count++;
  }
}
function CaveRoomInsideOk(mb: MapBuilder, v: Vec2i): boolean {
  const t = MapBuilderGetTile(mb, v);
  return t != null && t.IsRoom;
}
function CaveRoomOutsideOk(mb: MapBuilder, v: Vec2i): boolean {
  const t = MapBuilderGetTile(mb, v);
  return t != null && t.Type === TILE_CLASS_FLOOR;
}
function roomOutside(room: Rect2i, v: Vec2i) {
  const isTop = v.y === room.Pos.y;
  const isBottom = v.y === room.Pos.y + room.Size.y - 1;
  const isLeft = v.x === room.Pos.x;
  const isRight = v.x === room.Pos.x + room.Size.x - 1;
  const outside = svec2i(isLeft ? room.Pos.x - 1 : isRight ? room.Pos.x + room.Size.x : v.x,
    isTop ? room.Pos.y - 1 : isBottom ? room.Pos.y + room.Size.y : v.y);
  const outsideX = svec2i(isLeft || isRight ? outside.x : v.x, v.y);
  const outsideY = svec2i(v.x, isTop || isBottom ? outside.y : v.y);
  return { isTop, isBottom, isLeft, isRight, outside, outsideX, outsideY };
}
function MapIsAreaClearForCaveRoom(mb: MapBuilder, room: Rect2i): boolean {
  if (!MapIsAreaInside(mb.Map, room.Pos, room.Size)) return false;
  let hasFloor = false;
  let hasFloorAroundEdge = false;
  let isOverlapRoom = false;
  let bad = false;
  rectForEach(room, (v) => {
    const tile = MapBuilderGetTile(mb, v)!;
    if (MapBuilderIsLeaveFree(mb, v)) { bad = true; return true; }
    if (tile.Type === TILE_CLASS_FLOOR && !tile.IsRoom) {
      hasFloor = true;
      if (Rect2iIsAtEdge(room, v)) hasFloorAroundEdge = true;
    } else if (tile.IsRoom || tile.Type === TILE_CLASS_DOOR) {
      isOverlapRoom = true;
    } else if (tile.Type !== TILE_CLASS_WALL) {
      bad = true;
      return true;
    }
    return false;
  });
  if (bad) return false;
  if (!hasFloor || !hasFloorAroundEdge) return false;
  rectForEach(room, (v) => {
    if (!Rect2iIsAtEdge(room, v)) return false;
    const o = roomOutside(room, v);
    const tile = MapBuilderGetTile(mb, v)!;
    switch (tile.Type) {
      case TILE_CLASS_DOOR:
      case TILE_CLASS_WALL:
        if (CaveRoomInsideOk(mb, o.outside) || CaveRoomInsideOk(mb, o.outsideX) || CaveRoomInsideOk(mb, o.outsideY)) {
          isOverlapRoom = true;
        }
        break;
      case TILE_CLASS_FLOOR:
        if (!CaveRoomOutsideOk(mb, o.outside) || !CaveRoomOutsideOk(mb, o.outsideX) || !CaveRoomOutsideOk(mb, o.outsideY)) {
          bad = true;
          return true;
        }
        break;
      default:
        bad = true;
        return true;
    }
    return false;
  });
  if (bad) return false;
  if (isOverlapRoom) {
    if (!mb.mission.Cave.Rooms.Overlap) return false;
    if (MapGetRoomOverlapSize(mb, room, null) < mb.mission.Cave.CorridorWidth) return false;
  }
  return true;
}
function MapBuildCaveRoom(mb: MapBuilder, room: Rect2i): void {
  const C = mb.mission.Cave;
  rectForEach(room, (v) => {
    if (!Rect2iIsAtEdge(room, v)) return;
    const o = roomOutside(room, v);
    if ((o.isLeft || o.isRight) && (o.isTop || o.isBottom)) {
      MapBuilderSetTile(mb, v, C.TileClasses.Wall);
      return;
    }
    const atEdgeOfMap = v.y === 0 || v.y === mb.Map.Size.y - 1 || v.x === 0 || v.x === mb.Map.Size.x - 1;
    const tile = MapBuilderGetTile(mb, v)!;
    if (tile.Type === TILE_CLASS_DOOR) {
      if (!CaveRoomOutsideOk(mb, o.outside) && !CaveRoomOutsideOk(mb, o.outsideX) && !CaveRoomOutsideOk(mb, o.outsideY)) {
        MapBuilderSetTile(mb, v, C.TileClasses.Wall);
      }
    } else if (!atEdgeOfMap && (svec2i_is_equal(o.outside, v) || CaveRoomOutsideOk(mb, o.outside)) &&
      (svec2i_is_equal(o.outsideX, v) || CaveRoomOutsideOk(mb, o.outsideX)) &&
      (svec2i_is_equal(o.outsideY, v) || CaveRoomOutsideOk(mb, o.outsideY))) {
      MapBuilderSetTile(mb, v, C.DoorsEnabled ? C.TileClasses.Door : C.TileClasses.Room);
    } else {
      MapBuilderSetTile(mb, v, C.TileClasses.Wall);
    }
  });
  MapMakeRoom(mb, room.Pos, room.Size, false, C.TileClasses.Wall, C.TileClasses.Room, true);
  MapMakeRoomWalls(mb, C.Rooms, C.TileClasses.Wall, room);
}
function PlaceCaveRooms(mb: MapBuilder): void {
  const rooms: Rect2i[] = [];
  for (let i = 0; i < 1000 && rooms.length < mb.mission.Cave.Rooms.Count; i++) {
    const pos = MapGetRandomTile(mb.Map);
    const size = MapGetRoomSize(mb.mission.Cave.Rooms, 1);
    const room = Rect2iNew(pos, size);
    if (!MapIsAreaClearForCaveRoom(mb, room)) continue;
    MapBuildCaveRoom(mb, room);
    rooms.push(room);
  }
  if (AreKeysAllowed(mb.mode) && mb.mission.Cave.DoorsEnabled) {
    while (rooms.length > 0) {
      const accessMask = GenerateAccessMask(keyAccessRef(mb));
      MapSetRoomAccessMaskOverlap(mb, rooms, accessMask);
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// map_interior.c

const CORRIDOR_LEVEL_DIFF_BLOCK = 1;
const CRIT_PATH_NONE = 0;
const CRIT_PATH_LEFT = 1;
const CRIT_PATH_RIGHT = 2;
interface BSPArea {
  r: Rect2i; level: number; parent: number; child1: number; child2: number; horizontal: boolean; isCorridor: boolean;
  criticalPath: number;
}
function BSPAreaRoot(size: Vec2i): BSPArea {
  return {
    r: Rect2iNew(svec2i_zero(), size), level: 0, parent: -1, child1: -1, child2: -1, horizontal: false,
    isCorridor: false, criticalPath: CRIT_PATH_NONE,
  };
}
const BSPAreaIsLeaf = (b: BSPArea): boolean => b.child1 === -1 && b.child2 === -1;
class Adjacency {
  a: boolean[];
  dim: number;
  constructor(dim: number) {
    this.dim = dim;
    this.a = new Array(dim * dim).fill(false);
  }
  connect(i: number, j: number): void {
    this.a[i + j * this.dim] = true;
    this.a[j + i * this.dim] = true;
  }
  isConnected(i: number, j: number): boolean {
    return this.a[i + j * this.dim];
  }
  hasConnections(i: number): boolean {
    for (let j = 0; j < this.dim; j++) if (this.isConnected(i, j)) return true;
    return false;
  }
  disconnectAll(i: number): void {
    for (let j = 0; j < this.dim; j++) {
      this.a[i + j * this.dim] = false;
      this.a[j + i * this.dim] = false;
    }
  }
}
function MapInteriorLoad(mb: MapBuilder, missionIndex: number): void {
  const I = mb.mission.Interior;
  MissionSetupTileClasses(mb.Map, gPicManager, I.TileClasses);
  const areas: BSPArea[] = [BSPAreaRoot(mb.Map.Size)];
  SplitAreas(mb, areas);
  SplitLeafRooms(mb, areas);
  for (const a of areas) {
    if (!BSPAreaIsLeaf(a)) continue;
    MapMakeRoom(mb, a.r.Pos, a.r.Size, true, I.TileClasses.Wall, I.TileClasses.Room, false);
  }
  if (areas.length > 1) {
    const am = new Adjacency(areas.length);
    areas.forEach((a, i) => { if (a.isCorridor && a.parent !== -1) am.connect(i, a.parent); });
    AddDoorsToClosestCorridors(mb, areas, am);
    ConnectUnconnectedRooms(mb, areas, am);
    FindAndMarkCriticalPath(mb, areas, missionIndex);
    FillCorridors(mb, areas);
    const dCriticalPath = CalcDistanceToCriticalPath(areas, am);
    if (I.Doors.Enabled) PlaceKeys(mb, areas, am, dCriticalPath);
    AddPillars(mb, areas, am, dCriticalPath);
    for (const a of areas) {
      if (!BSPAreaIsLeaf(a)) continue;
      if (a.criticalPath === CRIT_PATH_NONE) MapMakeRoomWalls(mb, I.Rooms, I.TileClasses.Wall, a.r);
    }
  }
}
function BSPAreaTrySplit(areas: BSPArea[], horizontal: boolean, idx: number, minSize: number): [BSPArea, BSPArea] | null {
  const area = areas[idx];
  const r = horizontal ? area.r.Size.x - minSize * 2 : area.r.Size.y - minSize * 2;
  if (r < 0) return null;
  const a1 = BSPAreaRoot(svec2i_zero());
  const a2 = BSPAreaRoot(svec2i_zero());
  a1.level = a2.level = area.level + 1;
  a1.parent = a2.parent = idx;
  a1.horizontal = a2.horizontal = horizontal;
  if (horizontal) {
    const x = RAND_INT(0, r) + minSize;
    a1.r = Rect2iNew({ ...area.r.Pos }, svec2i(x, area.r.Size.y));
    a2.r = Rect2iNew(svec2i(area.r.Pos.x + x, area.r.Pos.y), svec2i(area.r.Size.x - x, area.r.Size.y));
  } else {
    const y = RAND_INT(0, r) + minSize;
    a1.r = Rect2iNew({ ...area.r.Pos }, svec2i(area.r.Size.x, y));
    a2.r = Rect2iNew(svec2i(area.r.Pos.x, area.r.Pos.y + y), svec2i(area.r.Size.x, area.r.Size.y - y));
  }
  return [a1, a2];
}
function SplitAreas(mb: MapBuilder, areas: BSPArea[]): void {
  const I = mb.mission.Interior;
  const hcount = RAND_INT(0, 2);
  const minSize = MIN(I.Rooms.Min + idiv(I.CorridorWidth, 2), MIN(mb.Map.Size.x, mb.Map.Size.y));
  for (let k = 0; k < areas.length; k++) {
    const a = areas[k];
    const horizontal = (hcount + a.level) % 2 === 1;
    const split = BSPAreaTrySplit(areas, horizontal, k, minSize);
    if (split) {
      const [a1, a2] = split;
      for (let i = 0; i < I.CorridorWidth; i++) {
        if (horizontal) {
          if (i % 2 === 0) a1.r.Size.x--;
          else { a2.r.Pos.x++; a2.r.Size.x--; }
        } else if (i % 2 === 0) a1.r.Size.y--;
        else { a2.r.Pos.y++; a2.r.Size.y--; }
      }
      a.isCorridor = true;
      if (horizontal) a.r = Rect2iNew(svec2i(a1.r.Pos.x + a1.r.Size.x, a1.r.Pos.y), svec2i(I.CorridorWidth, a1.r.Size.y));
      else a.r = Rect2iNew(svec2i(a1.r.Pos.x, a1.r.Pos.y + a1.r.Size.y), svec2i(a1.r.Size.x, I.CorridorWidth));
      a.horizontal = !horizontal;
      a.child1 = areas.length;
      a.child2 = areas.length + 1;
      areas.push(a1, a2);
    }
  }
}
function SplitLeafRooms(mb: MapBuilder, areas: BSPArea[]): void {
  const I = mb.mission.Interior;
  for (let k = 0; k < areas.length; k++) {
    const a = areas[k];
    if (a.isCorridor) continue;
    if (a.r.Size.x <= I.Rooms.Max && a.r.Size.y <= I.Rooms.Max) continue;
    const horizontal = a.r.Size.x > a.r.Size.y;
    const split = BSPAreaTrySplit(areas, horizontal, k, I.Rooms.Min);
    if (split) {
      const [a1, a2] = split;
      if (a1.horizontal) a1.r.Size.x++;
      else a1.r.Size.y++;
      a.child1 = areas.length;
      areas.push(a1);
      a.child2 = areas.length;
      areas.push(a2);
    }
  }
}
function AddDoorsToClosestCorridors(mb: MapBuilder, areas: BSPArea[], am: Adjacency): void {
  const I = mb.mission.Interior;
  for (let k = 0; k < areas.length; k++) {
    const a = areas[k];
    if (!BSPAreaIsLeaf(a)) continue;
    let corridor = a;
    let corridorI = k;
    while (!corridor.isCorridor && corridor.parent >= 0) {
      corridorI = corridor.parent;
      corridor = areas[corridorI];
    }
    for (let i = 0; i < 4; i++) {
      const doorPos = svec2i(a.r.Pos.x + idiv(a.r.Size.x, 2), a.r.Pos.y + idiv(a.r.Size.y, 2));
      let outsideDoor = { ...doorPos };
      switch (i) {
        case 0: doorPos.x = a.r.Pos.x; outsideDoor = svec2i(doorPos.x - 1, doorPos.y); break;
        case 1: doorPos.x = a.r.Pos.x + a.r.Size.x - 1; outsideDoor = svec2i(doorPos.x + 1, doorPos.y); break;
        case 2: doorPos.y = a.r.Pos.y; outsideDoor = svec2i(doorPos.x, doorPos.y - 1); break;
        default: doorPos.y = a.r.Pos.y + a.r.Size.y - 1; outsideDoor = svec2i(doorPos.x, doorPos.y + 1); break;
      }
      if (Rect2iIsInside(corridor.r, outsideDoor)) {
        const doors = [false, false, false, false];
        doors[i] = true;
        MapPlaceDoors(mb, a.r, I.Doors.Enabled, doors, I.Doors.Min, I.Doors.Max, 0, I.Doors.RandomPos, I.TileClasses.Door,
          I.TileClasses.Room);
        am.connect(k, corridorI);
        a.parent = corridorI;
        break;
      }
    }
  }
}
function RectIsAdjacent(r1: Rect2i, r2: Rect2i, overlapSize: number): boolean {
  if (r1.Pos.x - (r2.Pos.x + r2.Size.x) === 0 || r2.Pos.x - (r1.Pos.x + r1.Size.x) === 0) {
    return r1.Pos.y + overlapSize < r2.Pos.y + r2.Size.y && r2.Pos.y + overlapSize < r1.Pos.y + r1.Size.y;
  }
  if (r1.Pos.y - (r2.Pos.y + r2.Size.y) === 0 || r2.Pos.y - (r1.Pos.y + r1.Size.y) === 0) {
    return r1.Pos.x + overlapSize < r2.Pos.x + r2.Size.x && r2.Pos.x + overlapSize < r1.Pos.x + r1.Size.x;
  }
  return false;
}
function TryConnectRooms(mb: MapBuilder, areas: BSPArea[], am: Adjacency, a1: BSPArea, aIdx: number): boolean {
  const I = mb.mission.Interior;
  for (let k = 0; k < areas.length; k++) {
    const a2 = areas[k];
    if (!BSPAreaIsLeaf(a2) || a1 === a2 || !am.hasConnections(k)) continue;
    const r1 = Rect2iNew({ ...a1.r.Pos }, svec2i(a1.r.Size.x - 1, a1.r.Size.y - 1));
    const r2 = Rect2iNew({ ...a2.r.Pos }, svec2i(a2.r.Size.x - 1, a2.r.Size.y - 1));
    if (!RectIsAdjacent(r1, r2, 1)) continue;
    const doors = [false, false, false, false];
    if (a1.r.Pos.x > a2.r.Pos.x) doors[0] = true;
    else if (a1.r.Pos.x < a2.r.Pos.x) doors[1] = true;
    else if (a1.r.Pos.y > a2.r.Pos.y) doors[2] = true;
    else doors[3] = true;
    MapPlaceDoors(mb, a1.r, I.Doors.Enabled, doors, I.Doors.Min, I.Doors.Max, 0, I.Doors.RandomPos, I.TileClasses.Door,
      I.TileClasses.Room);
    am.connect(aIdx, k);
    a1.parent = k;
    return true;
  }
  return false;
}
function ConnectUnconnectedRooms(mb: MapBuilder, areas: BSPArea[], am: Adjacency): void {
  let numUnconnected: number;
  do {
    numUnconnected = 0;
    for (let k = 0; k < areas.length; k++) {
      const a = areas[k];
      if (am.hasConnections(k) || a.isCorridor || !BSPAreaIsLeaf(a)) continue;
      if (!TryConnectRooms(mb, areas, am, a, k)) numUnconnected++;
    }
  } while (numUnconnected > 0);
}
function FindDeepestRoomFrom(areas: BSPArea[], idx: number): number {
  if (idx === -1) return 0;
  const stack = [idx];
  let deepestChild = -1;
  let maxDepth = 0;
  while (stack.length > 0) {
    const i = stack.pop()!;
    const a = areas[i];
    if (BSPAreaIsLeaf(a) && a.level > maxDepth) {
      maxDepth = a.level;
      deepestChild = i;
    }
    if (a.child1 >= 0) stack.push(a.child1);
    if (a.child2 >= 0) stack.push(a.child2);
  }
  return deepestChild;
}
function MarkParentCorridors(areas: BSPArea[], idx: number, cp: number): void {
  for (let i = idx; i >= 0;) {
    areas[i].criticalPath = cp;
    i = areas[i].parent;
  }
}
function FindAndMarkCriticalPath(mb: MapBuilder, areas: BSPArea[], missionIndex: number): void {
  const root = areas[0];
  const deepestRoom1 = FindDeepestRoomFrom(areas, root.child1);
  const a1 = areas[deepestRoom1];
  mb.Map.start = svec2i_add(a1.r.Pos, svec2i_divide(a1.r.Size, svec2i(2, 2)));
  const deepestRoom2 = FindDeepestRoomFrom(areas, root.child2);
  const a2 = areas[deepestRoom2];
  if (mb.mission.Interior.ExitEnabled) {
    mb.Map.exits.push({
      R: Rect2iNew(svec2i_add(a2.r.Pos, svec2i_one()), svec2i_subtract(a2.r.Size, svec2i(3, 3))),
      Mission: missionIndex + 1, Hidden: false,
    });
  }
  MarkParentCorridors(areas, deepestRoom1, CRIT_PATH_LEFT);
  MarkParentCorridors(areas, deepestRoom2, CRIT_PATH_RIGHT);
}
const CorridorDAlong = (a: BSPArea): Vec2i => (a.horizontal ? svec2i(1, 0) : svec2i(0, 1));
const CorridorDAcross = (a: BSPArea): Vec2i => (a.horizontal ? svec2i(0, 1) : svec2i(1, 0));
function CapCorridor(mb: MapBuilder, areas: BSPArea[], a: BSPArea, end: Vec2i, dAcross: Vec2i, dAlong: Vec2i): void {
  const I = mb.mission.Interior;
  const outside = svec2i_subtract(end, dAlong);
  let capTile = I.TileClasses.Floor;
  if (!MapIsTileIn(mb.Map, outside)) capTile = I.TileClasses.Wall;
  else {
    for (const a2 of areas) {
      if (Rect2iIsInside(a2.r, outside)) {
        if (a.level - a2.level > CORRIDOR_LEVEL_DIFF_BLOCK) capTile = I.TileClasses.Wall;
        else if (I.Doors.Enabled) capTile = I.TileClasses.Door;
        break;
      }
    }
  }
  for (let j = 0; ; j++) {
    const endJ = svec2i_add(end, svec2i_multiply(dAlong, svec2i(j, j)));
    if (MapBuilderGetTile(mb, svec2i_add(endJ, svec2i_multiply(dAcross, svec2i(-1, -1))))!.Type !== TILE_CLASS_WALL ||
      MapBuilderGetTile(mb, svec2i_add(endJ, svec2i_multiply(dAcross, svec2i(I.CorridorWidth, I.CorridorWidth))))!.Type !==
        TILE_CLASS_WALL) break;
    for (let i = 0; i < I.CorridorWidth; i++) {
      MapBuilderSetTile(mb, svec2i_add(endJ, svec2i_multiply(dAcross, svec2i(i, i))), capTile);
    }
    if (capTile.Type !== TILE_CLASS_WALL) break;
  }
}
function FillCorridors(mb: MapBuilder, areas: BSPArea[]): void {
  for (let k = 0; k < areas.length; k++) {
    const a = areas[areas.length - k - 1];
    if (!a.isCorridor) continue;
    rectForEach(a.r, (v) => { MapBuilderSetTile(mb, v, mb.mission.Interior.TileClasses.Floor); });
    const end1 = a.r.Pos;
    const end2 = svec2i_add(end1, svec2i_subtract(a.r.Size, svec2i_one()));
    CapCorridor(mb, areas, a, end1, CorridorDAcross(a), CorridorDAlong(a));
    CapCorridor(mb, areas, a, end2, svec2i_scale(CorridorDAcross(a), -1), svec2i_scale(CorridorDAlong(a), -1));
  }
}
function FindAdjacentCriticalPath(areas: BSPArea[], am: Adjacency, d: number[], idx: number): number {
  for (let i = 0; i < areas.length; i++) {
    if (d[i] === 0) continue;
    if (am.isConnected(idx, i)) return d[i] + 1;
  }
  return 0;
}
function CalcDistanceToCriticalPath(areas: BSPArea[], am: Adjacency): number[] {
  const d = new Array(areas.length).fill(0);
  areas.forEach((a, i) => { if (a.criticalPath !== CRIT_PATH_NONE) d[i] = 1; });
  let newConnections: number;
  do {
    newConnections = 0;
    for (let i = 0; i < areas.length; i++) {
      const a = areas[i];
      if (d[i] > 0) continue;
      if (!a.isCorridor && !BSPAreaIsLeaf(a)) continue;
      const dd = FindAdjacentCriticalPath(areas, am, d, i);
      if (dd > 0) {
        d[i] = dd;
        newConnections++;
      }
    }
  } while (newConnections > 0);
  return d;
}
function FindRoomsFurthestFromCriticalPath(areas: BSPArea[], am: Adjacency, d: number[], fromIdx: number): number[] {
  const furthest = [fromIdx];
  for (let k = 0; k < furthest.length; k++) {
    const idx = furthest[k];
    let hasChildren = false;
    for (let i = 0; i < areas.length; i++) {
      if (i === idx || !am.isConnected(idx, i) || d[i] <= d[idx]) continue;
      furthest.push(i);
      hasChildren = true;
    }
    if (hasChildren || areas[idx].criticalPath !== CRIT_PATH_NONE) {
      furthest.splice(k, 1);
      k--;
    }
  }
  return furthest;
}
function PlaceKey(mb: MapBuilder, areas: BSPArea[], am: Adjacency, d: number[], idx: number, keyIndex: number, cp: number): void {
  const room = areas[idx];
  const keyPos = svec2i_add(room.r.Pos, svec2i_divide(room.r.Size, svec2i(2, 2)));
  MapPlaceKey(mb, keyPos, keyIndex);
  MapBuilderSetLeaveFree(mb, keyPos, true);
  room.criticalPath = cp;
  let dNext = d[idx];
  d[idx] = 1;
  let idxNext = idx;
  for (dNext--; dNext > 1; dNext--) {
    for (let i = 0; i < areas.length; i++) {
      if (am.isConnected(i, idxNext) && d[i] === dNext) {
        idxNext = i;
        areas[i].criticalPath = cp;
        d[idxNext] = 1;
        break;
      }
    }
  }
}
function PlaceKeys(mb: MapBuilder, areas: BSPArea[], am: Adjacency, d: number[]): void {
  const I = mb.mission.Interior;
  const candidates: number[] = [];
  for (let k = 0; k < areas.length; k++) {
    let a = areas[k];
    if (!a.isCorridor || a.criticalPath === CRIT_PATH_NONE || k === 0) continue;
    if (a.criticalPath === CRIT_PATH_RIGHT) {
      const c1 = areas[a.child1];
      const c2 = areas[a.child2];
      a = c1.criticalPath !== CRIT_PATH_NONE ? c1 : c2;
      if (!a.isCorridor) continue;
    }
    candidates.push(k);
  }
  while (candidates.length > KEY_COUNT) candidates.splice(RAND_INT(0, candidates.length), 1);
  candidates.forEach((idx, ci) => {
    let a = areas[idx];
    if (a.criticalPath === CRIT_PATH_RIGHT) {
      const c1 = areas[a.child1];
      const c2 = areas[a.child2];
      a = c1.criticalPath !== CRIT_PATH_NONE ? c1 : c2;
    }
    const accessMask = GetAccessMask(ci);
    const end1 = a.r.Pos;
    const end2 = svec2i_add(end1, svec2i_subtract(a.r.Size, svec2i_one()));
    for (let i = 0; i < I.CorridorWidth; i++) {
      if (MapBuilderGetTile(mb, end1)!.Type !== TILE_CLASS_WALL) {
        MapSetRoomAccessMask(mb, Rect2iNew(svec2i_add(end1, svec2i_multiply(CorridorDAcross(a), svec2i(i, i))), svec2i_one()), accessMask);
      }
      if (MapBuilderGetTile(mb, end2)!.Type !== TILE_CLASS_WALL) {
        MapSetRoomAccessMask(mb, Rect2iNew(svec2i_add(end2, svec2i_multiply(CorridorDAcross(a), svec2i(-i, -i))), svec2i_one()), accessMask);
      }
    }
    const furthestChildren = FindRoomsFurthestFromCriticalPath(areas, am, d, idx);
    CArrayShuffle(furthestChildren);
    const childIdx = furthestChildren[0];
    PlaceKey(mb, areas, am, d, childIdx, ci, a.criticalPath);
    // AddLockedRooms
    furthestChildren.forEach((ri, k) => {
      if (k === 0) return;
      if (RAND_BOOL()) {
        const room = areas[ri];
        MapSetRoomAccessMask(mb, Rect2iNew(svec2i_add(room.r.Pos, svec2i_one()), svec2i_subtract(room.r.Size, svec2i(2, 2))), accessMask);
      }
    });
  });
}
function AddPillars(mb: MapBuilder, areas: BSPArea[], am: Adjacency, d: number[]): void {
  const I = mb.mission.Interior;
  for (let count = 0; count < I.Pillars.Count;) {
    let allChildren: number[] = [];
    for (let i = 0; i < d.length; i++) {
      if (d[i] === 1) {
        allChildren = allChildren.concat(FindRoomsFurthestFromCriticalPath(areas, am, d, i));
        allChildren.sort((x, y) => y - x);
        allChildren = allChildren.filter((x, k) => k === 0 || x !== allChildren[k - 1]);
      }
    }
    if (allChildren.length === 0) break;
    CArrayShuffle(allChildren);
    for (const idx of allChildren) {
      if (count === I.Pillars.Count) break;
      const a = areas[idx];
      MapFillRect(mb, a.r, I.TileClasses.Wall, gTileNothing);
      MapSetRoomAccessMask(mb, a.r, 0);
      am.disconnectAll(idx);
      count++;
    }
  }
  rectForEach(Rect2iNew(svec2i_zero(), mb.Map.Size), (v) => {
    let all = true;
    rectForEach(Rect2iNew(svec2i_subtract(v, svec2i_one()), svec2i(3, 3)), (w) => {
      const tc = MapBuilderGetTile(mb, w);
      if (tc != null && tc.canWalk) {
        all = false;
        return true;
      }
      return false;
    });
    if (all) MapBuilderSetTile(mb, v, gTileNothing);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// map_static.c

function MapStaticLoad(mb: MapBuilder): void {
  for (const [, t] of mb.mission.Static.TileClasses.entries()) {
    t.StyleType = TileClassBaseStyleTypeLocal(t.Type);
    TileClassesAdd(mb.Map.TileClasses, gPicManager, t, t.Style, t.StyleType, t.Mask, t.MaskAlt);
    switch (t.Type) {
      case TILE_CLASS_DOOR: SetupDoorTileClasses(mb.Map, gPicManager, t); break;
      case TILE_CLASS_WALL: SetupWallTileClasses(mb.Map, gPicManager, t); break;
      case TILE_CLASS_FLOOR: SetupFloorTileClasses(mb.Map, gPicManager, t); break;
      default: break;
    }
  }
  rectForEach(Rect2iNew(svec2i_zero(), mb.Map.Size), (v) => { MapStaticLoadTile(mb, v); });
  mb.Map.start = { ...mb.mission.Static.Start };
  mb.Map.exits = mb.mission.Static.Exits.map((e) => ({ R: { Pos: { ...e.R.Pos }, Size: { ...e.R.Size } }, Mission: e.Mission, Hidden: e.Hidden }));
}
function TileClassBaseStyleTypeLocal(type: number): string {
  return type === TILE_CLASS_FLOOR ? 'normal' : type === TILE_CLASS_WALL ? 'o' : type === TILE_CLASS_DOOR ? 'normal_h' : '';
}
function MapStaticLoadTile(mb: MapBuilder, v: Vec2i): void {
  if (!MapIsTileIn(mb.Map, v)) return;
  const idx = v.y * mb.Map.Size.x + v.x;
  let tileAccess = mb.mission.Static.Access[idx] ?? 0;
  if (!AreKeysAllowed(mb.mode)) tileAccess = 0;
  MapBuilderSetTile(mb, v, MissionStaticGetTileClass(mb.mission.Static, mb.Map.Size, v));
  MapBuildSetAccess(mb, v, tileAccess);
}
function MapStaticLoadDynamic(mb: MapBuilder): void {
  const S = mb.mission.Static;
  for (const mop of S.Items) for (const pos of mop.Positions) MapTryPlaceOneObject(mb, pos, mop.M, 0, false);
  if (ModeHasNPCs(mb.mode)) {
    for (const cps of S.Characters) {
      const c = mb.characters.OtherChars[cps.Index];
      for (const cp of cps.Places) {
        const e = buildHooks.gameEventNewActorAdd(Vec2CenterOfTile(cp.Pos), c, null);
        e.u.CharId = cps.Index >>> 0;
        e.u.Direction = cp.Dir;
        GameEventsEnqueue(gGameEvents, e);
      }
    }
  }
  if (HasObjectives(mb.mode)) {
    for (const op of S.Objectives) {
      if (op.Index >= mb.mission.Objectives.length) continue;
      const o = mb.mission.Objectives[op.Index];
      for (const pi of op.PositionIndices) {
        if (!MapIsTileIn(mb.Map, pi.Position)) continue;
        const pos = Vec2CenterOfTile(pi.Position);
        switch (o.Type) {
          case OBJECTIVE_KILL: {
            const charId = mb.characters.specialIds[pi.Index];
            const c = mb.characters.OtherChars[charId];
            const e = buildHooks.gameEventNewActorAdd(pos, c, null);
            e.u.CharId = charId >>> 0;
            e.u.ThingFlags = ObjectiveToThing(op.Index) >>> 0;
            GameEventsEnqueue(gGameEvents, e);
            break;
          }
          case OBJECTIVE_COLLECT:
            MapPlaceCollectible(mb.mission, op.Index, pos);
            break;
          case OBJECTIVE_DESTROY:
            MapTryPlaceDestroyObject(mb, mb.mission, op.Index, pi.Position, false);
            break;
          case OBJECTIVE_RESCUE: {
            const charId = mb.characters.prisonerIds[pi.Index];
            const c = mb.characters.OtherChars[charId];
            const e = buildHooks.gameEventNewActorAdd(pos, c, null);
            e.u.CharId = charId >>> 0;
            e.u.ThingFlags = ObjectiveToThing(op.Index) >>> 0;
            GameEventsEnqueue(gGameEvents, e);
            break;
          }
          default:
            break;
        }
        o.placed++;
      }
    }
  }
  if (AreKeysAllowed(mb.mode)) for (const kp of S.Keys) for (const pos of kp.Positions) MapPlaceKey(mb, pos, kp.Index);
  for (const pp of S.Pickups) {
    for (const pos of pp.Positions) {
      const e = GameEventNew(GAME_EVENT_ADD_PICKUP);
      e.u.Pos = Vec2CenterOfTile(pos);
      e.u.PickupClass = pp.P.Name;
      GameEventsEnqueue(gGameEvents, e);
    }
  }
  buildHooks.handleGameEvents();
}

export { GAME_EVENT_ACTOR_ADD, TILE_CLASS_NOTHING, CharacterStoreGetRandomSpecialId, MapPosIsInLockedRoom };
