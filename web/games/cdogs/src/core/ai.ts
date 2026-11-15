// C-Dogs SDL 2.5.0, translated: the enemy AI (ai.c, ai_utils.c, ai_context.c), the path cache (path_cache.c)
// and A* (AStar.c, Sam Soff's MIT AStar). GPL-2.0-or-later / BSD-2-Clause / MIT (web/games/cdogs/LICENSE.md).
import {
  CMD_BUTTON1, CMD_DIRECTIONS, CMD_DOWN, CMD_LEFT, CMD_RIGHT, CMD_UP, Button1, Down, Left, MAX, MIN, Right, SQUARED, TILE_HEIGHT,
  TILE_WIDTH, Up, Vec2CenterOfTile, Vec2FromRadians, Vec2ToTile, Vec2iToTile, cmd2dir, dir2radians, f32, fabsf, rand,
  CmdToDirection, DirectionRotate, DirectionToCmd, DIRECTION_COUNT, DIRECTION_DOWN, DIRECTION_DOWNLEFT,
  DIRECTION_DOWNRIGHT, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP, DIRECTION_UPLEFT, DIRECTION_UPRIGHT,
  HasClearLineJMRaytrace, RAND_INT, svec2, svec2_add, svec2_distance_squared, svec2_scale, svec2i, svec2i_assign_vec2,
  svec2i_distance_squared, svec2i_is_equal, svec2i_zero, type Vec2, type Vec2i,
} from './base.ts';
import {
  ACTOR_H, ACTOR_W, CalcCollisionTeam, COLLISIONTEAM_NONE, FLAGS_GOOD_GUY, FLAGS_PRISONER, FLAGS_VICTIM,
  FLAGS_VISIBLE, gCollisionSystem, gMap, IsCollisionDiamond, IsThingInsideTile, MapGetDoorKeycardFlag, MapGetExitPos,
  MapGetTile, MapHasLockedRooms, MapIsTileInExit, MapSearchTileAround, OverlapGetFirstItem, pathCacheHooks,
  TileCanWalk, TileIsOpaque, TileIsShootable, type GameMap,
} from './map.ts';
import { THING_IMPASSABLE, KIND_CHARACTER, KIND_OBJECT, type AIContext, type AIGotoContext, type TActor, type TObject, type Thing, type Weapon } from './types.ts';
import { ALLYCOLLISION_NONE, ALLYCOLLISION_NORMAL, ALLYCOLLISION_REPEL, AICHATTER_ALWAYS, AICHATTER_NONE, AICHATTER_OFTEN,
  AICHATTER_SELDOM, ConfigGetEnum, ConfigGetInt, DIFFICULTY_EASY, DIFFICULTY_HARD, DIFFICULTY_VERYEASY, DIFFICULTY_VERYHARD } from './config.ts';
import { gActors, gCampaign, gMission, gObjs, gPlayerDatas, IsPVP } from './state.ts';
import { GAME_EVENT_ACTOR_BARK, GameEventNew, GameEventsEnqueue, gGameEvents } from './events.ts';
import { CharacterClassGetSound, CharacterIsPrisoner, CharacterStoreGetRandomBaddieId, CharacterStoreGetRandomSpecialId,
  WeaponClassCanShoot, WeaponClassGetRange, WeaponClassNumBarrels } from './classes.ts';
import { OBJECTIVE_KILL, OBJECTIVE_RESCUE, ObjectiveGetPlacementAccessFlags, ObjectiveToThing, type Mission } from './mission.ts';
import {
  ACTOR_GET_WEAPON, ActorGetAverageWeaponMuzzleOffset, ActorGetByUID, ActorGetCanFireBarrel, ActorGetCharacter,
  ActorIsGrimacing, ActorSetAIState, CommandActor, FLAGS_AWAKEALWAYS, FLAGS_DEAF, FLAGS_DETOURING, FLAGS_FOLLOWER,
  FLAGS_INVULNERABLE, FLAGS_PENALTY, FLAGS_RESCUED, FLAGS_RUNS_AWAY, FLAGS_SEETHROUGH, FLAGS_SLEEPING, FLAGS_SNEAKY,
  FLAGS_TRYRIGHT, FLAGS_WAKING, FLAGS_ALL_SEEING, GameEventNewActorAdd, PLACEMENT_ACCESS_ANY, PlaceAwayFromPlayers,
  PlacePrisoner,
} from './actors.ts';
import { WeaponGetUnlockedBarrel } from './weapon.ts';
import { ObjIsDangerous } from './objs.ts';
import { IsPlayerAlive } from './player.ts';
import { CanCompleteMission } from './missionrun.ts';
import { HandleGameEvents } from './handle.ts';

// --- AStar.c ---------------------------------------------------------------------------------------------------

interface NodeRecord {
  key: Vec2i;
  isClosed: boolean;
  isOpen: boolean;
  isGoal: boolean;
  hasParent: boolean;
  hasEstimatedCost: boolean;
  estimatedCost: number;
  cost: number;
  openIndex: number;
  parentIndex: number;
}
type NeighborsFn = (v: Vec2i, add: (n: Vec2i, cost: number) => void) => void;
type HeuristicFn = (a: Vec2i, b: Vec2i) => number;

/** ASPathCreate: the node records are found by key (the original's sorted index only serves the lookup) */
export function ASPathCreate(neighbors: NeighborsFn, heuristic: HeuristicFn, start: Vec2i, goal: Vec2i): Vec2i[] | null {
  const records: NodeRecord[] = [];
  const byKey = new Map<number, number>();
  const open: number[] = [];
  const getNode = (k: Vec2i): number => {
    const key = (k.x + 0x8000) * 0x10000 + (k.y + 0x8000);
    const found = byKey.get(key);
    if (found !== undefined) return found;
    const idx = records.length;
    records.push({
      key: { x: k.x, y: k.y }, isClosed: false, isOpen: false, isGoal: false, hasParent: false, hasEstimatedCost: false,
      estimatedCost: 0, cost: 0, openIndex: 0, parentIndex: 0,
    });
    byKey.set(key, idx);
    return idx;
  };
  const rank = (n: number): number => f32(records[n].estimatedCost + records[n].cost);
  const rankCompare = (a: number, b: number): number => {
    const r1 = rank(a);
    const r2 = rank(b);
    return r1 < r2 ? -1 : r1 > r2 ? 1 : 0;
  };
  const swap = (i1: number, i2: number): void => {
    if (i1 !== i2) {
      const r1 = records[open[i1]];
      const r2 = records[open[i2]];
      const t = r1.openIndex;
      r1.openIndex = r2.openIndex;
      r2.openIndex = t;
      const tn = open[i1];
      open[i1] = open[i2];
      open[i2] = tn;
    }
  };
  const didRemove = (idx: number): void => {
    let smallest = idx;
    do {
      if (smallest !== idx) {
        swap(smallest, idx);
        idx = smallest;
      }
      const l = 2 * idx + 1;
      const r = 2 * idx + 2;
      if (l < open.length && rankCompare(open[l], open[smallest]) < 0) smallest = l;
      if (r < open.length && rankCompare(open[r], open[smallest]) < 0) smallest = r;
    } while (smallest !== idx);
  };
  const removeFromOpen = (n: number): void => {
    const rec = records[n];
    if (rec.isOpen) {
      const idx = rec.openIndex;
      rec.isOpen = false;
      swap(idx, open.length - 1);
      open.length--;
      didRemove(idx);
    }
  };
  const addToOpen = (n: number, cost: number, parent: number): void => {
    const rec = records[n];
    if (parent >= 0) {
      rec.hasParent = true;
      rec.parentIndex = parent;
    } else {
      rec.hasParent = false;
    }
    let idx = open.length;
    open.push(n);
    rec.openIndex = idx;
    rec.isOpen = true;
    rec.cost = cost;
    while (idx > 0) {
      const p = Math.floor((idx - 1) / 2);
      if (rankCompare(open[p], open[idx]) < 0) break;
      swap(p, idx);
      idx = p;
    }
  };
  let current = getNode(start);
  const goalNode = getNode(goal);
  records[goalNode].isGoal = true;
  records[current].estimatedCost = heuristic(records[current].key, records[goalNode].key);
  records[current].hasEstimatedCost = true;
  addToOpen(current, 0, -1);
  const list: { k: Vec2i; c: number }[] = [];
  while (open.length > 0) {
    current = open[0];
    if (records[current].isGoal) break;
    removeFromOpen(current);
    records[current].isClosed = true;
    list.length = 0;
    neighbors(records[current].key, (k, c) => list.push({ k, c }));
    for (const nb of list) {
      const cost = f32(records[current].cost + nb.c);
      const neighbor = getNode(nb.k);
      const nr = records[neighbor];
      if (!nr.hasEstimatedCost) {
        nr.estimatedCost = heuristic(nr.key, records[goalNode].key);
        nr.hasEstimatedCost = true;
      }
      if (nr.isOpen && cost < nr.cost) removeFromOpen(neighbor);
      if (nr.isClosed && cost < nr.cost) nr.isClosed = false;
      if (!nr.isOpen && !nr.isClosed) addToOpen(neighbor, cost, current);
    }
  }
  if (!records[current].isGoal) return null;
  const path: Vec2i[] = [];
  let n = current;
  for (;;) {
    path.push({ ...records[n].key });
    if (!records[n].hasParent) break;
    n = records[n].parentIndex;
  }
  path.reverse();
  return path;
}

// --- path_cache.c ---------------------------------------------------------------------------------------------------

export const PATH_CACHE_MAX = 128;
interface CachedPath { Path: Vec2i[] | null; from: Vec2i; to: Vec2i }
export const gPathCache = { paths: [] as CachedPath[], head: 0, map: gMap as GameMap };
export function PathCacheInit(m: GameMap): void {
  gPathCache.paths = [];
  gPathCache.head = 0;
  gPathCache.map = m;
}
export function PathCacheClearImpl(): void {
  gPathCache.paths.length = 0;
  gPathCache.head = 0;
}
pathCacheHooks.init = PathCacheInit;
pathCacheHooks.clear = PathCacheClearImpl;

export function PathCacheCreate(from: Vec2i, to: Vec2i, ignoreObjects: boolean, cache: boolean): Vec2i[] | null {
  const pc = gPathCache;
  for (const c of pc.paths) if (svec2i_is_equal(c.from, from) && svec2i_is_equal(c.to, to)) return c.Path;
  const map = pc.map;
  const isTileOk = ignoreObjects ? IsTileWalkable : IsTileWalkableAroundObjects;
  const path = ASPathCreate(
    (v, add) => {
      for (let y = v.y - 1; y <= v.y + 1; y++) {
        if (y < 0 || y >= map.Size.y) continue;
        for (let x = v.x - 1; x <= v.x + 1; x++) {
          if (x < 0 || x >= map.Size.x) continue;
          if (x === v.x && y === v.y) continue;
          if (!isTileOk(map, svec2i(x, y)) || !isTileOk(map, svec2i(v.x, y)) || !isTileOk(map, svec2i(x, v.y))) continue;
          let cost: number;
          if (x !== v.x && y !== v.y) cost = f32(TILE_WIDTH * f32(1.1));
          else if (x !== v.x) cost = TILE_WIDTH;
          else cost = TILE_HEIGHT;
          add(svec2i(x, y), cost);
        }
      }
    },
    (a, b) => MAX(Math.abs(a.x - b.x), Math.abs(a.y - b.y)),
    from, to,
  );
  const cp: CachedPath = { Path: path, from: { ...from }, to: { ...to } };
  if (cache) {
    if (pc.paths.length < PATH_CACHE_MAX) {
      pc.paths.push(cp);
    } else {
      pc.paths[pc.head] = cp;
      pc.head++;
      if (pc.head === pc.paths.length) pc.head = 0;
    }
  }
  return path;
}
const ASPathGetCount = (p: Vec2i[] | null): number => (p ? p.length : 0);

// --- ai_context.c ------------------------------------------------------------------------------------------------

export const AI_STATE_NONE = 0;
export const AI_STATE_IDLE = 1;
export const AI_STATE_DIE = 2;
export const AI_STATE_FOLLOW = 3;
export const AI_STATE_HUNT = 4;
export const AI_STATE_TRACK = 5;
export const AI_STATE_FLEE = 6;
export const AI_STATE_CONFUSED = 7;
export const AI_STATE_NEXT_OBJECTIVE = 8;
export const AI_CONFUSION_CONFUSED = 0;
export const AI_CONFUSION_CORRECT = 1;
export const AI_OBJECTIVE_TYPE_NORMAL = 0;
export const AI_OBJECTIVE_TYPE_KEY = 1;
export const AI_OBJECTIVE_TYPE_EXIT = 2;
export const AI_OBJECTIVE_TYPE_KILL = 3;
export const AI_OBJECTIVE_TYPE_PICKUP = 4;

export function AIContextNew(): AIContext {
  return {
    LastCmd: 0, Delay: 0, lastState: AI_STATE_NONE, State: AI_STATE_NONE,
    ConfusionState: { Type: AI_CONFUSION_CONFUSED, Cmd: 0 },
    ObjectiveState: { Type: AI_OBJECTIVE_TYPE_NORMAL, IsDestructible: false, Obj: null, UID: 0, LastDone: 0, Goal: svec2(0, 0) },
    LastTile: svec2i_zero(), IsStuckTooLong: false,
    Goto: { Goal: svec2i_zero(), Path: null, PathIndex: 0, IsFollowing: false },
    EnemyId: -1, GunRangeScalar: 1.0, OnGunId: 0,
  };
}
export function AIStateGetChatterText(s: number): string {
  return ['', 'zzz', 'blarg', "let's go!", '!', '?', 'aah!', '???', 'objective'][s] ?? '';
}
export function AIContextShowChatter(f: number): boolean {
  switch (f) {
    case AICHATTER_NONE: return false;
    case AICHATTER_SELDOM: return RAND_INT(0, 100) > 90;
    case AICHATTER_OFTEN: return RAND_INT(0, 100) > 50;
    case AICHATTER_ALWAYS: return true;
    default: return true;
  }
}
export function AIContextSetState(c: AIContext, s: number): boolean {
  c.lastState = c.State;
  c.State = s;
  return s !== c.lastState;
}

// --- ai_utils.c ------------------------------------------------------------------------------------------------

export function AIGetClosestPlayer(pos: Vec2): TActor | null {
  let minDistance2 = -1;
  let closest: TActor | null = null;
  for (let i = 0; i < gPlayerDatas.length; i++) {
    const pd = gPlayerDatas[i];
    if (!IsPlayerAlive(pd)) continue;
    const p = ActorGetByUID(pd.ActorUID)!;
    const d2 = svec2_distance_squared(pos, p.Pos);
    if (!closest || d2 < minDistance2) {
      closest = p;
      minDistance2 = d2;
    }
  }
  return closest;
}
function AIGetClosestActor(fromPos: Vec2, from: TActor | null, comp: (a: TActor, b: TActor | null) => boolean): TActor | null {
  let closest: TActor | null = null;
  let minDistance2 = -1;
  for (let i = 0; i < gActors.length; i++) {
    const a = gActors[i];
    if (!a.isInUse || a.dead) continue;
    if (a.flags & (FLAGS_INVULNERABLE | FLAGS_PENALTY)) continue;
    if (comp(a, from)) {
      const d2 = svec2_distance_squared(fromPos, a.Pos);
      if (!closest || d2 < minDistance2) {
        minDistance2 = d2;
        closest = a;
      }
    }
  }
  return closest;
}
const IsGood = (a: TActor): boolean => a.PlayerUID >= 0 || (a.flags & FLAGS_GOOD_GUY) !== 0;
const IsBad = (a: TActor): boolean => !IsGood(a);
const IsDifferent = (a: TActor, b: TActor | null): boolean => a !== b;
const IsGoodAndVisible = (a: TActor): boolean => IsGood(a) && (a.flags & FLAGS_VISIBLE) !== 0;
const IsBadAndVisible = (a: TActor): boolean => IsBad(a) && (a.flags & FLAGS_VISIBLE) !== 0;

export function AIGetClosestEnemy(from: Vec2, a: TActor | null, flags: number): TActor | null {
  if (IsPVP(gCampaign.Entry.Mode)) return AIGetClosestActor(from, a, IsDifferent);
  if ((!a || a.PlayerUID < 0) && !(flags & FLAGS_GOOD_GUY)) return AIGetClosestActor(from, a, IsGood);
  return AIGetClosestActor(from, a, IsBad);
}
export function AIGetClosestVisibleEnemy(from: TActor, isPlayer: boolean): TActor | null {
  if (IsPVP(gCampaign.Entry.Mode)) return AIGetClosestActor(from.Pos, from, IsDifferent);
  if (!isPlayer && !(from.flags & FLAGS_GOOD_GUY)) return AIGetClosestActor(from.Pos, from, IsGoodAndVisible);
  return AIGetClosestActor(from.Pos, from, IsBadAndVisible);
}
export function AIGetClosestPlayerPos(pos: Vec2): Vec2 {
  const p = AIGetClosestPlayer(pos);
  return p ? p.Pos : pos;
}
export function AIReverseDirection(cmd: number): number {
  if (cmd & (CMD_LEFT | CMD_RIGHT)) cmd ^= CMD_LEFT | CMD_RIGHT;
  if (cmd & (CMD_UP | CMD_DOWN)) cmd ^= CMD_UP | CMD_DOWN;
  return cmd;
}
export function AIHasClearPath(from: Vec2, to: Vec2, ignoreObjects: boolean): boolean {
  const f = ignoreObjects ? (v: Vec2i) => !IsTileWalkable(gMap, v) : (v: Vec2i) => !IsTileWalkableAroundObjects(gMap, v);
  return HasClearLineJMRaytrace(Vec2ToTile(from), Vec2ToTile(to), f);
}
function IsTileWalkableOrOpenable(map: GameMap, pos: Vec2i): boolean {
  const tile = MapGetTile(map, pos);
  if (tile == null) return false;
  if (TileCanWalk(tile)) return true;
  if (tile.Class.Type === 2 /* TILE_CLASS_DOOR */) {
    const keycard = MapGetDoorKeycardFlag(map, pos);
    if (!keycard) return true;
    return (keycard & gMission.KeyFlags) !== 0;
  }
  return false;
}
export function IsTileWalkable(map: GameMap, pos: Vec2i): boolean {
  if (!IsTileWalkableOrOpenable(map, pos)) return false;
  const t = MapGetTile(map, pos)!;
  for (let i = 0; i < t.things.length; i++) {
    const tid = t.things[i];
    if (tid.Kind !== KIND_OBJECT) continue;
    if (ObjIsDangerous(gObjs[tid.Id])) return false;
  }
  return true;
}
export function IsTileWalkableAroundObjects(map: GameMap, pos: Vec2i): boolean {
  if (!IsTileWalkableOrOpenable(map, pos)) return false;
  const t = MapGetTile(map, pos)!;
  for (let i = 0; i < t.things.length; i++) {
    const tid = t.things[i];
    if (tid.Kind === KIND_OBJECT) {
      if ((gObjs[tid.Id] as TObject).Health > 0) return false;
    } else if (tid.Kind === KIND_CHARACTER) {
      switch (gCollisionSystem.allyCollision) {
        case ALLYCOLLISION_NORMAL: return false;
        case ALLYCOLLISION_REPEL: break;
        case ALLYCOLLISION_NONE: continue;
        default: break;
      }
    }
  }
  return true;
}
export function AIHasClearView(a: TActor, to: Vec2, sightRange: number): boolean {
  if (svec2_distance_squared(a.Pos, to) > SQUARED(sightRange)) return false;
  return HasClearLineJMRaytrace(svec2i_assign_vec2(a.Pos), svec2i_assign_vec2(to),
    (pos) => TileIsOpaque(MapGetTile(gMap, Vec2iToTile(pos))));
}
export function AICanSee(a: TActor, target: Vec2, d: number): boolean {
  const sightRange = ConfigGetInt('Game.SightRange') * TILE_WIDTH;
  if ((a.flags & FLAGS_ALL_SEEING) || AIIsFacing(a, target, d)) {
    return AIHasClearView(a, target, Math.trunc((sightRange * 2) / 3));
  } else if (AIIsFacing(a, target, DirectionRotate(d, 1)) || AIIsFacing(a, target, DirectionRotate(d, -1))) {
    return AIHasClearView(a, target, Math.trunc(sightRange / 3));
  }
  return false;
}
const IsPosShootable = (pos: Vec2i): boolean => TileIsShootable(MapGetTile(gMap, Vec2iToTile(pos))!);
export function AIHasClearShot(from: Vec2, to: Vec2): boolean {
  const pad = 2;
  const fromOffset = { x: from.x, y: from.y };
  const line = (): boolean => HasClearLineJMRaytrace(svec2i_assign_vec2(fromOffset), svec2i_assign_vec2(to), IsPosShootable);
  fromOffset.x = f32(from.x - Math.trunc((ACTOR_W + pad) / 2));
  if (Vec2ToTile(fromOffset).x >= 0 && !line()) return false;
  fromOffset.x = f32(from.x + Math.trunc((ACTOR_W + pad) / 2));
  if (Vec2ToTile(fromOffset).x < gMap.Size.x && !line()) return false;
  fromOffset.x = from.x;
  fromOffset.y = f32(from.y - Math.trunc((ACTOR_H + pad) / 2));
  if (Vec2ToTile(fromOffset).y >= 0 && !line()) return false;
  fromOffset.y = f32(from.y + Math.trunc((ACTOR_H + pad) / 2));
  if (Vec2ToTile(fromOffset).y < gMap.Size.y && !line()) return false;
  return true;
}
export function AIGetObjectRunningInto(a: TActor, cmd: number): TObject | null {
  const frontPos = { x: a.Pos.x, y: a.Pos.y };
  if (Left(cmd)) frontPos.x = f32(frontPos.x - 1);
  else if (Right(cmd)) frontPos.x = f32(frontPos.x + 1);
  if (Up(cmd)) frontPos.y = f32(frontPos.y - 1);
  else if (Down(cmd)) frontPos.y = f32(frontPos.y + 1);
  const item = OverlapGetFirstItem(a.thing, frontPos, a.thing.size, a.thing.Vel, {
    ThingMask: THING_IMPASSABLE, Team: CalcCollisionTeam(true, a), IsPVP: IsPVP(gCampaign.Entry.Mode), AllActors: false,
  });
  if (!item || item.kind !== KIND_OBJECT) return null;
  return gObjs[item.id];
}
export function AIIsFacing(a: TActor, target: Vec2, d: number): boolean {
  const isUpperOrLowerOctants = fabsf(f32(a.Pos.x - target.x)) < fabsf(f32(a.Pos.y - target.y));
  const isRight = a.Pos.x < target.x;
  const isAbove = a.Pos.y > target.y;
  switch (d) {
    case DIRECTION_UP: return isAbove && isUpperOrLowerOctants;
    case DIRECTION_UPLEFT: return !isRight && isAbove;
    case DIRECTION_LEFT: return !isRight && !isUpperOrLowerOctants;
    case DIRECTION_DOWNLEFT: return !isRight && !isAbove;
    case DIRECTION_DOWN: return !isAbove && isUpperOrLowerOctants;
    case DIRECTION_DOWNRIGHT: return isRight && !isAbove;
    case DIRECTION_RIGHT: return isRight && !isUpperOrLowerOctants;
    case DIRECTION_UPRIGHT: return isRight && isAbove;
    default: return false;
  }
}
function AIHasFriendliesInLine(a: TActor, dir: number): boolean {
  const tileStart = Vec2ToTile(a.Pos);
  const d = Vec2FromRadians(dir2radians[dir]);
  const wc = ACTOR_GET_WEAPON(a).Gun!;
  const gunRange = WeaponClassGetRange(wc);
  const posEnd = svec2_add(a.Pos, svec2_scale(d, gunRange));
  const tileEnd = Vec2ToTile(posEnd);
  const ct = CalcCollisionTeam(true, a);
  let hasFriendly = false;
  HasClearLineJMRaytrace(tileStart, tileEnd, (tile) => {
    const t = MapGetTile(gMap, tile);
    if (t == null) return true;
    for (let i = 0; i < t.things.length; i++) {
      const tid = t.things[i];
      if (tid.Kind !== KIND_CHARACTER) continue;
      const other = gActors[tid.Id];
      if (a.uid === other.uid) continue;
      if (other.flags & (FLAGS_PRISONER | FLAGS_VICTIM)) {
        hasFriendly = true;
        return true;
      }
      const ctOther = CalcCollisionTeam(true, other);
      if (ct !== COLLISIONTEAM_NONE && ctOther !== COLLISIONTEAM_NONE && ct === ctOther) {
        hasFriendly = true;
        return true;
      }
      return true;
    }
    return false;
  });
  return hasFriendly;
}
export function AIHasPath(from: Vec2, to: Vec2, ignoreObjects: boolean): boolean {
  if (AIHasClearPath(from, to, ignoreObjects)) return true;
  const fromTile = Vec2ToTile(from);
  const toTile = MapSearchTileAround(gMap, Vec2ToTile(to), ignoreObjects ? IsTileWalkable : IsTileWalkableAroundObjects);
  return ASPathGetCount(PathCacheCreate(fromTile, toTile, ignoreObjects, true)) >= 1;
}
export function AIGotoDirect(a: Vec2, p: Vec2): number {
  let cmd = 0;
  if (f32(a.x + 1) < p.x) cmd |= CMD_RIGHT;
  else if (a.x > f32(p.x + 1)) cmd |= CMD_LEFT;
  if (f32(a.y + 1) < p.y) cmd |= CMD_DOWN;
  else if (a.y > f32(p.y + 1)) cmd |= CMD_UP;
  return cmd;
}
function AStarFollow(c: AIGotoContext, currentTile: Vec2i, i: Thing, a: Vec2): number {
  let pathTile = c.Path![c.PathIndex];
  c.IsFollowing = true;
  if (svec2i_is_equal(currentTile, pathTile) && IsThingInsideTile(i, currentTile)) {
    c.PathIndex++;
    pathTile = c.Path![MIN(c.PathIndex, c.Path!.length - 1)];
  }
  // past the end the original reads NULL; the path always ends at the goal, which is never followed past
  return AIGotoDirect(a, Vec2CenterOfTile(pathTile));
}
function AStarCloseToPath(c: AIGotoContext, currentTile: Vec2i, goalTile: Vec2i): boolean {
  if (c.PathIndex >= ASPathGetCount(c.Path) - 1) return false;
  const pathTile = c.Path![c.PathIndex];
  if (svec2i_distance_squared(currentTile, pathTile) > 4) return false;
  const pathEnd = c.Path![c.Path!.length - 1];
  if (svec2i_distance_squared(goalTile, pathEnd) > 0) return false;
  return true;
}
export function AIGoto(actor: TActor, p: Vec2, ignoreObjects: boolean): number {
  const currentTile = Vec2ToTile(actor.Pos);
  const goalTile = Vec2ToTile(p);
  const c = actor.aiContext!.Goto;
  if (svec2i_is_equal(currentTile, goalTile)) return AIGotoDirect(actor.Pos, p);
  if (c.IsFollowing && AStarCloseToPath(c, currentTile, goalTile)) {
    return AStarFollow(c, currentTile, actor.thing, actor.Pos);
  } else if (AIHasClearPath(actor.Pos, p, ignoreObjects)) {
    return AIGotoDirect(actor.Pos, p);
  }
  c.Goal = MapSearchTileAround(gMap, goalTile, ignoreObjects ? IsTileWalkable : IsTileWalkableAroundObjects);
  c.PathIndex = 1;
  c.Path = PathCacheCreate(currentTile, c.Goal, ignoreObjects, true);
  if (ASPathGetCount(c.Path) <= 1) return AIGotoDirect(actor.Pos, p);
  return AStarFollow(c, currentTile, actor.thing, actor.Pos);
}
export function AIHunt(actor: TActor, targetPos: Vec2): number {
  const pos = svec2_add(actor.Pos, ActorGetAverageWeaponMuzzleOffset(actor));
  const dx = fabsf(f32(targetPos.x - pos.x));
  const dy = fabsf(f32(targetPos.y - pos.y));
  let cmd = 0;
  if (f32(2 * dx) > dy) {
    if (pos.x < targetPos.x) cmd |= CMD_RIGHT;
    else if (pos.x > targetPos.x) cmd |= CMD_LEFT;
  }
  if (f32(2 * dy) > dx) {
    if (pos.y < targetPos.y) cmd |= CMD_DOWN;
    else if (pos.y > targetPos.y) cmd |= CMD_UP;
  }
  if (actor.flags & FLAGS_RUNS_AWAY) cmd = AIReverseDirection(cmd);
  return cmd;
}
export function AIHuntClosest(actor: TActor): number {
  let targetPos = actor.Pos;
  if (!(actor.PlayerUID >= 0 || (actor.flags & FLAGS_GOOD_GUY))) targetPos = AIGetClosestPlayerPos(actor.Pos);
  if (actor.flags & FLAGS_VISIBLE) {
    const a = AIGetClosestVisibleEnemy(actor, actor.PlayerUID >= 0);
    if (a) targetPos = a.Pos;
  }
  return AIHunt(actor, targetPos);
}
export function AIAttack(a: TActor, targetPos: Vec2): number {
  let cmd = 0;
  const w: Weapon = ACTOR_GET_WEAPON(a);
  const wc = w.Gun!;
  const gunRange = WeaponClassGetRange(wc);
  const distanceSquared = svec2_distance_squared(a.Pos, targetPos);
  const canFire = WeaponClassCanShoot(wc) && WeaponGetUnlockedBarrel(w) >= 0;
  const r3 = f32(gunRange * 3);
  const r2 = f32(gunRange * 2);
  if (distanceSquared < f32(r3 * r3) * a.aiContext!.GunRangeScalar && !canFire) {
    cmd = AIRetreatFrom(a, targetPos);
  } else if (distanceSquared > f32(r2 * r2)) {
    cmd = AIHunt(a, targetPos);
  } else {
    const willFire = canFire && (distanceSquared < f32(r2 * r2) || distanceSquared > 30 * 30);
    cmd = willFire ? AIHunt(a, targetPos) : AITrack(a, targetPos);
    const d = cmd2dir[cmd & CMD_DIRECTIONS];
    if (willFire && !AIHasFriendliesInLine(a, d)) cmd |= CMD_BUTTON1;
  }
  return cmd;
}
export function AIRetreatFrom(actor: TActor, from: Vec2): number {
  return AIReverseDirection(AIHunt(actor, from));
}
export function AITrack(actor: TActor, targetPos: Vec2): number {
  const pos = svec2_add(actor.Pos, ActorGetAverageWeaponMuzzleOffset(actor));
  const dx = fabsf(f32(targetPos.x - pos.x));
  const dy = fabsf(f32(targetPos.y - pos.y));
  let cmd = 0;
  const p1 = f32(0.1);
  const xException = dy < f32(2 * dx) && dy > f32(dx * f32(1.1));
  if (!xException) {
    const d = f32(pos.x - targetPos.x);
    if (d < f32(-dy * p1)) cmd |= CMD_RIGHT;
    else if (d > f32(dy * p1)) cmd |= CMD_LEFT;
  }
  const yException = dx < f32(2 * dy) && dx > f32(dy * f32(1.1));
  if (!yException) {
    const d = f32(pos.y - targetPos.y);
    if (d < f32(-dx * p1)) cmd |= CMD_DOWN;
    else if (d > f32(dx * p1)) cmd |= CMD_UP;
  }
  return cmd;
}
export function AIMoveAwayFromLine(pos: Vec2, lineStart: Vec2, lineD: number): number {
  const dv = { x: f32(pos.x - lineStart.x), y: f32(pos.y - lineStart.y) };
  switch (lineD) {
    case DIRECTION_UP:
    case DIRECTION_DOWN:
      return dv.x < 0 ? CMD_LEFT : CMD_RIGHT;
    case DIRECTION_UPLEFT:
    case DIRECTION_DOWNRIGHT:
      return dv.x > dv.y ? CMD_RIGHT | CMD_UP : CMD_LEFT | CMD_DOWN;
    case DIRECTION_LEFT:
    case DIRECTION_RIGHT:
      return dv.y < 0 ? CMD_UP : CMD_DOWN;
    case DIRECTION_DOWNLEFT:
    case DIRECTION_UPRIGHT:
      return dv.x < -dv.y ? CMD_LEFT | CMD_UP : CMD_RIGHT | CMD_DOWN;
    default:
      return 0;
  }
}

// --- ai.c ----------------------------------------------------------------------------------------------------------

const AI_WAKE_SOUND_RANGE = 8 * TILE_WIDTH;
const AI_WAKE_SOUND_RANGE_INDIRECT = 4 * TILE_WIDTH;
export const aiState = { gBaddieCount: 0, sAreGoodGuysPresent: false };

function IsFacingPlayer(actor: TActor, d: number): boolean {
  for (let i = 0; i < gPlayerDatas.length; i++) {
    const p = gPlayerDatas[i];
    if (!IsPlayerAlive(p)) continue;
    if (AIIsFacing(actor, ActorGetByUID(p.ActorUID)!.Pos, d)) return true;
  }
  return false;
}
function IsCloseToPlayer(pos: Vec2, distance: number): boolean {
  const closest = AIGetClosestPlayer(pos);
  const distance2 = f32(distance * distance);
  return closest != null && svec2_distance_squared(pos, closest.Pos) < distance2;
}
function CanSeeActor(a: TActor, target: TActor): boolean {
  const d2 = svec2_distance_squared(a.Pos, target.Pos);
  return d2 < 32 * 32 || AICanSee(a, target.Pos, a.direction);
}
function CanSeeAPlayer(a: TActor): boolean {
  for (let i = 0; i < gPlayerDatas.length; i++) {
    const p = gPlayerDatas[i];
    if (!IsPlayerAlive(p)) continue;
    if (CanSeeActor(a, ActorGetByUID(p.ActorUID)!)) return true;
  }
  return false;
}
function CanSeeActorBeingAttacked(a: TActor): boolean {
  for (let i = 0; i < gActors.length; i++) {
    const target = gActors[i];
    if (!target.isInUse) continue;
    if (!ActorIsGrimacing(target) && target.dead === 0) continue;
    if (CanSeeActor(a, target)) return true;
  }
  return false;
}
function IsPosOK(actor: TActor, pos: Vec2): boolean {
  if (IsCollisionDiamond(gMap, pos, actor.thing.size)) return false;
  if (OverlapGetFirstItem(actor.thing, pos, actor.thing.size, actor.thing.Vel, {
    ThingMask: THING_IMPASSABLE, Team: CalcCollisionTeam(true, actor), IsPVP: IsPVP(gCampaign.Entry.Mode), AllActors: false,
  })) return false;
  return true;
}
const STEPSIZE = 4;
function IsDirectionOK(a: TActor, dir: number): boolean {
  const ok = (dx: number, dy: number): boolean => IsPosOK(a, svec2_add(a.Pos, svec2(dx, dy)));
  const S = STEPSIZE;
  switch (dir) {
    case DIRECTION_UP: return ok(0, -S);
    case DIRECTION_UPLEFT: return ok(-S, -S) || ok(-S, 0) || ok(0, -S);
    case DIRECTION_LEFT: return ok(-S, 0);
    case DIRECTION_DOWNLEFT: return ok(-S, S) || ok(-S, 0) || ok(0, S);
    case DIRECTION_DOWN: return ok(0, S);
    case DIRECTION_DOWNRIGHT: return ok(S, S) || ok(S, 0) || ok(0, S);
    case DIRECTION_RIGHT: return ok(S, 0);
    case DIRECTION_UPRIGHT: return ok(S, -S) || ok(S, 0) || ok(0, -S);
  }
  return false;
}
function BrightWalk(actor: TActor, roll: number): number {
  const bot = ActorGetCharacter(actor).bot!;
  if ((actor.flags & FLAGS_VISIBLE) && roll < bot.probabilityToTrack) {
    actor.flags &= ~FLAGS_DETOURING;
    return AIHuntClosest(actor);
  }
  if (actor.flags & FLAGS_TRYRIGHT) {
    if (IsDirectionOK(actor, (actor.direction + 7) % 8)) {
      actor.direction = (actor.direction + 7) % 8;
      actor.turns--;
      if (actor.turns === 0) actor.flags &= ~FLAGS_DETOURING;
    } else if (!IsDirectionOK(actor, actor.direction)) {
      actor.direction = (actor.direction + 1) % 8;
      actor.turns++;
      if (actor.turns === 4) {
        actor.flags &= ~(FLAGS_DETOURING | FLAGS_TRYRIGHT);
        actor.turns = 0;
      }
    }
  } else {
    if (IsDirectionOK(actor, (actor.direction + 1) % 8)) {
      actor.direction = (actor.direction + 1) % 8;
      actor.turns--;
      if (actor.turns === 0) actor.flags &= ~FLAGS_DETOURING;
    } else if (!IsDirectionOK(actor, actor.direction)) {
      actor.direction = (actor.direction + 7) % 8;
      actor.turns++;
      if (actor.turns === 4) {
        actor.flags &= ~(FLAGS_DETOURING | FLAGS_TRYRIGHT);
        actor.turns = 0;
      }
    }
  }
  return DirectionToCmd(actor.direction);
}
function WillFire(actor: TActor, roll: number): boolean {
  const bot = ActorGetCharacter(actor).bot!;
  if ((actor.flags & FLAGS_VISIBLE) !== 0 && roll < bot.probabilityToShoot &&
    ActorGetCanFireBarrel(actor, ACTOR_GET_WEAPON(actor)) >= 0) {
    if ((actor.flags & FLAGS_GOOD_GUY) !== 0) return true;
    if (aiState.sAreGoodGuysPresent) return true;
    return IsFacingPlayer(actor, actor.direction);
  }
  return false;
}
export function Detour(actor: TActor): void {
  actor.flags |= FLAGS_DETOURING;
  actor.turns = 1;
  if (actor.flags & FLAGS_TRYRIGHT) actor.direction = (CmdToDirection(actor.lastCmd) + 1) % 8;
  else actor.direction = (CmdToDirection(actor.lastCmd) + 7) % 8;
}
function DidPlayerShoot(): boolean {
  for (let i = 0; i < gPlayerDatas.length; i++) {
    const p = gPlayerDatas[i];
    if (!IsPlayerAlive(p)) continue;
    if (Button1(ActorGetByUID(p.ActorUID)!.lastCmd)) return true;
  }
  return false;
}
function IsAIEnabled(a: TActor): boolean {
  return a.isInUse && a.PlayerUID < 0 && !a.dead && !ActorGetCharacter(a).Class!.Vehicle;
}
export function AICommand(ticks: number): number {
  let count = 0;
  let delayModifier: number;
  let rollLimit: number;
  switch (ConfigGetEnum('Game.Difficulty')) {
    case DIFFICULTY_VERYEASY: delayModifier = 4; rollLimit = 300; break;
    case DIFFICULTY_EASY: delayModifier = 2; rollLimit = 200; break;
    case DIFFICULTY_HARD: delayModifier = 1; rollLimit = 75; break;
    case DIFFICULTY_VERYHARD: delayModifier = 1; rollLimit = 50; break;
    default: delayModifier = 1; rollLimit = 100; break;
  }
  for (let i = 0; i < gActors.length; i++) {
    const actor = gActors[i];
    if (!IsAIEnabled(actor)) continue;
    let cmd = 0;
    if (!(actor.flags & FLAGS_PRISONER)) {
      if (actor.flags & (FLAGS_VICTIM | FLAGS_GOOD_GUY)) aiState.sAreGoodGuysPresent = true;
      cmd = GetCmd(actor, delayModifier, rollLimit);
      actor.aiContext!.Delay = MAX(0, actor.aiContext!.Delay - ticks);
    }
    actor.aiContext!.LastCmd = CommandActor(actor, cmd, ticks);
    count++;
  }
  return count;
}
function GetCmd(actor: TActor, delayModifier: number, rollLimit: number): number {
  const bot = ActorGetCharacter(actor).bot!;
  let cmd = 0;
  const ai = actor.aiContext!;
  if ((actor.flags & FLAGS_SLEEPING) && (actor.flags & FLAGS_VISIBLE) && ai.Delay === 0 &&
    (CanSeeAPlayer(actor) || CanSeeActorBeingAttacked(actor))) {
    AIWake(actor, delayModifier);
  }
  if ((actor.flags & FLAGS_WAKING) && ai.Delay === 0) actor.flags &= ~FLAGS_WAKING;
  if (!(actor.flags & FLAGS_SLEEPING) && ai.Delay === 0 && !(actor.flags & FLAGS_AWAKEALWAYS)) {
    if (!IsCloseToPlayer(actor.Pos, 40 * 16)) {
      actor.flags |= FLAGS_SLEEPING;
      actor.flags &= ~FLAGS_WAKING;
      ActorSetAIState(actor, AI_STATE_IDLE);
    }
  }
  if (actor.flags & (FLAGS_SLEEPING | FLAGS_WAKING)) return cmd;
  let bypass = false;
  const roll = rand() % rollLimit;
  if (actor.flags & FLAGS_FOLLOWER) {
    cmd = Follow(actor);
  } else if ((actor.flags & FLAGS_SNEAKY) && (actor.flags & FLAGS_VISIBLE) && DidPlayerShoot()) {
    cmd = AIHuntClosest(actor) | CMD_BUTTON1;
    if (actor.flags & FLAGS_RUNS_AWAY) cmd = AIReverseDirection(cmd);
    bypass = true;
    ActorSetAIState(actor, AI_STATE_HUNT);
  } else if (actor.flags & FLAGS_DETOURING) {
    cmd = BrightWalk(actor, roll);
    ActorSetAIState(actor, AI_STATE_TRACK);
  } else if (actor.flags & FLAGS_RESCUED) {
    if (!CanCompleteMission(gMission) || gMap.exits.length > 1) {
      cmd = Follow(actor);
    } else if (gMap.exits.length === 1) {
      cmd = AIGoto(actor, MapGetExitPos(gMap, 0), false);
    }
  } else if (ai.Delay > 0) {
    cmd = actor.lastCmd & ~CMD_BUTTON1;
  } else {
    if (roll < bot.probabilityToTrack) {
      cmd = AIHuntClosest(actor);
      ActorSetAIState(actor, AI_STATE_HUNT);
    } else if (roll < bot.probabilityToMove) {
      cmd = DirectionToCmd(rand() & 7);
      ActorSetAIState(actor, AI_STATE_TRACK);
    }
    ai.Delay = bot.actionDelay * delayModifier;
  }
  if (!bypass) {
    if (WillFire(actor, roll)) {
      cmd |= CMD_BUTTON1;
      if ((actor.flags & FLAGS_FOLLOWER) && (actor.flags & FLAGS_GOOD_GUY)) {
        for (let j = 0; j < 10; j++) {
          const d = rand() % DIRECTION_COUNT;
          if (!IsFacingPlayer(actor, d)) {
            cmd = DirectionToCmd(d) | CMD_BUTTON1;
            break;
          }
        }
      }
      if (actor.flags & FLAGS_RUNS_AWAY) cmd |= AIReverseDirection(AIHuntClosest(actor));
      ActorSetAIState(actor, AI_STATE_HUNT);
    } else {
      if ((actor.flags & FLAGS_VISIBLE) === 0) {
        const w = ACTOR_GET_WEAPON(actor);
        for (let i = 0; i < WeaponClassNumBarrels(w.Gun!); i++) w.barrels[i].lock = 40;
      }
      if (cmd && !IsDirectionOK(actor, CmdToDirection(cmd)) && (actor.flags & FLAGS_DETOURING) === 0) {
        Detour(actor);
        cmd = 0;
        ActorSetAIState(actor, AI_STATE_TRACK);
      }
    }
  }
  return cmd;
}
export function AIWake(a: TActor, delayModifier: number): void {
  if (!a.aiContext || !(a.flags & FLAGS_SLEEPING)) return;
  a.flags &= ~FLAGS_SLEEPING;
  a.flags |= FLAGS_WAKING;
  ActorSetAIState(a, AI_STATE_NONE);
  const bot = ActorGetCharacter(a).bot;
  if (bot == null) return;
  a.aiContext.Delay = bot.actionDelay * delayModifier;
  if (!(a.flags & FLAGS_SEETHROUGH)) {
    const es = GameEventNew(GAME_EVENT_ACTOR_BARK);
    es.u.Sound = CharacterClassGetSound(ActorGetCharacter(a).Class!, 'alert');
    es.u.UID = a.uid;
    GameEventsEnqueue(gGameEvents, es);
  }
}
function Follow(a: TActor): number {
  const ch = ActorGetCharacter(a);
  const store = gCampaign.Setting.characters;
  if (CharacterIsPrisoner(store, ch) && CanCompleteMission(gMission)) {
    const exit = MapIsTileInExit(gMap, a.thing, -1);
    if (exit !== -1) {
      for (let i = 0; i < gPlayerDatas.length; i++) {
        const pd = gPlayerDatas[i];
        if (!IsPlayerAlive(pd)) continue;
        const p = ActorGetByUID(pd.ActorUID)!;
        if (MapIsTileInExit(gMap, p.thing, -1) === exit) {
          a.flags &= ~FLAGS_FOLLOWER;
          a.flags |= FLAGS_RESCUED;
          return 0;
        }
      }
    }
  }
  if (IsCloseToPlayer(a.Pos, 32)) {
    ActorSetAIState(a, AI_STATE_IDLE);
    return 0;
  }
  ActorSetAIState(a, AI_STATE_FOLLOW);
  return AIGoto(a, AIGetClosestPlayerPos(a.Pos), true);
}
export function AICommandLast(ticks: number): void {
  for (let i = 0; i < gActors.length; i++) {
    const actor = gActors[i];
    if (!IsAIEnabled(actor)) continue;
    const cmd = actor.aiContext!.LastCmd;
    actor.aiContext!.Delay = MAX(0, actor.aiContext!.Delay - ticks);
    CommandActor(actor, cmd, ticks);
  }
}
export function AIWakeOnSoundAt(pos: Vec2): void {
  for (let i = 0; i < gActors.length; i++) {
    const actor = gActors[i];
    if (!actor.isInUse || actor.PlayerUID >= 0 || actor.dead || !(actor.flags & FLAGS_SLEEPING) || (actor.flags & FLAGS_DEAF)) continue;
    const d = MAX(fabsf(f32(pos.x - actor.Pos.x)), fabsf(f32(pos.y - actor.Pos.y)));
    if (d > AI_WAKE_SOUND_RANGE) continue;
    if (d > AI_WAKE_SOUND_RANGE_INDIRECT && !AIHasClearView(actor, pos, AI_WAKE_SOUND_RANGE_INDIRECT)) continue;
    AIWake(actor, 1);
  }
}
export function AIAddRandomEnemies(enemies: number, m: Mission): void {
  if (m.Enemies.length > 0 && m.EnemyDensity > 0 &&
    enemies < MAX(1, Math.trunc((m.EnemyDensity * ConfigGetInt('Game.EnemyDensity')) / 100))) {
    const charId = CharacterStoreGetRandomBaddieId(gCampaign.Setting.characters);
    const c = gCampaign.Setting.characters.OtherChars[charId];
    const pos = PlaceAwayFromPlayers(gMap, true, PLACEMENT_ACCESS_ANY);
    const e = GameEventNewActorAdd(pos, c, null);
    e.u.CharId = charId;
    GameEventsEnqueue(gGameEvents, e);
    aiState.gBaddieCount++;
  }
}
export function InitializeBadGuys(): void {
  const objs = gMission.missionData!.Objectives;
  for (let idx = 0; idx < objs.length; idx++) {
    const o = objs[idx];
    const paFlags = ObjectiveGetPlacementAccessFlags(o);
    if (o.Type === OBJECTIVE_KILL && gMission.missionData!.SpecialChars.length > 0) {
      for (; o.placed < o.Count; o.placed++) {
        const charId = CharacterStoreGetRandomSpecialId(gCampaign.Setting.characters);
        const c = gCampaign.Setting.characters.OtherChars[charId];
        const pos = PlaceAwayFromPlayers(gMap, false, paFlags);
        const e = GameEventNewActorAdd(pos, c, null);
        e.u.CharId = charId;
        e.u.ThingFlags = ObjectiveToThing(idx);
        GameEventsEnqueue(gGameEvents, e);
        HandleGameEvents(gGameEvents, null, null, null);
      }
    } else if (o.Type === OBJECTIVE_RESCUE) {
      const charId = gCampaign.Setting.characters.prisonerIds[0];
      const c = gCampaign.Setting.characters.OtherChars[charId];
      for (; o.placed < o.Count; o.placed++) {
        const pos = MapHasLockedRooms(gMap) ? PlacePrisoner(gMap) : PlaceAwayFromPlayers(gMap, false, paFlags);
        const e = GameEventNewActorAdd(pos, c, null);
        e.u.CharId = charId;
        e.u.ThingFlags = ObjectiveToThing(idx);
        GameEventsEnqueue(gGameEvents, e);
        HandleGameEvents(gGameEvents, null, null, null);
      }
    }
  }
  aiState.gBaddieCount = gMission.index * 4;
  aiState.sAreGoodGuysPresent = false;
}
export function CreateEnemies(): void {
  if (gCampaign.Setting.characters.baddieIds.length === 0) return;
  const density = gMission.missionData!.EnemyDensity * ConfigGetInt('Game.EnemyDensity');
  for (let i = 0; i < Math.trunc(density / 100); i++) {
    const charId = CharacterStoreGetRandomBaddieId(gCampaign.Setting.characters);
    const c = gCampaign.Setting.characters.OtherChars[charId];
    const pos = PlaceAwayFromPlayers(gMap, true, PLACEMENT_ACCESS_ANY);
    const e = GameEventNewActorAdd(pos, c, null);
    e.u.CharId = charId;
    GameEventsEnqueue(gGameEvents, e);
    aiState.gBaddieCount++;
    HandleGameEvents(gGameEvents, null, null, null);
  }
}
