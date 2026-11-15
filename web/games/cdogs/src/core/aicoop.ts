// C-Dogs SDL 2.5.0, translated: the AI of computer-controlled players (ai_coop.c). GPL-2.0-or-later /
// BSD-2-Clause (web/games/cdogs/LICENSE.md).
import {
  Button2, CMD_BUTTON1, CMD_BUTTON2, CMD_DOWN, CMD_HAS_DIRECTION, CMD_LEFT, CMD_RIGHT, CMD_UP, CmdGetReverse, MAX, SQUARED,
  Vec2CenterOfTile, Vec2ToTile, f32, fabsf, rand, svec2_distance_squared, svec2_is_zero, svec2_zero, svec2i_is_equal,
  type Vec2,
} from './base.ts';
import { gMap, MapGetExitPos, MapGetExploredPercentage, MapGetTile, MapSearchTileAround, MapTileIsUnexplored, TileCanWalk, FLAGS_PRISONER } from './map.ts';
import {
  GUNTYPE_GRENADE, GUNTYPE_NORMAL, KIND_MOBILEOBJECT, MAX_GRENADES, MAX_GUNS, MAX_WEAPONS, PICKUP_AMMO, PICKUP_GUN,
  PICKUP_HEALTH, PICKUP_JEWEL, PICKUP_KEYCARD, PICKUP_LIVES, PICKUP_SHOW_MAP, THING_OBJECTIVE, type PickupEffect,
  type PlayerData, type Pickup, type TActor, type WeaponClass,
} from './types.ts';
import { AmmoGetById, IdWeaponClass, StrWeaponClass } from './classes.ts';
import { gActors, gCampaign, gMission, gMobObjs, gObjs, gPickups, IsPVP } from './state.ts';
import { KeycardCount, OBJECTIVE_INVESTIGATE, OBJECTIVE_KILL, OBJECTIVE_RESCUE, ObjectiveFromThing, ObjectiveIsComplete, type Objective } from './mission.ts';
import {
  ACTOR_GET_WEAPON, ACTORACTION_EXITING, ActorFindGun, ActorGetByUID, ActorGetCanFireBarrel, ActorGetNumGrenades,
  ActorGetNumGuns, ActorSetAIState, ActorUsesAmmo, ActorWeaponGetAmmo,
} from './actors.ts';
import {
  AI_CONFUSION_CONFUSED, AI_CONFUSION_CORRECT, AI_OBJECTIVE_TYPE_EXIT, AI_OBJECTIVE_TYPE_KEY, AI_OBJECTIVE_TYPE_KILL,
  AI_OBJECTIVE_TYPE_NORMAL, AI_OBJECTIVE_TYPE_PICKUP, AI_STATE_CONFUSED, AI_STATE_FOLLOW, AI_STATE_HUNT, AI_STATE_IDLE,
  AI_STATE_NEXT_OBJECTIVE, AIAttack, AIContextNew, AIGetClosestVisibleEnemy, AIGetObjectRunningInto, AIGoto, AIGotoDirect,
  AIHasClearPath, AIHasClearShot, AIHasClearView, AIHasPath, AIHunt, AIIsFacing, AIMoveAwayFromLine, AIRetreatFrom,
} from './ai.ts';
import { ObjIsDangerous } from './objs.ts';
import { PickupGetByUID } from './pickups.ts';
import { CampaignGetMaxHP, IsPlayerAlive, PlayerDataGetByUID, PlayerHasWeapon } from './player.ts';
import { CanCompleteMission } from './missionrun.ts';

const CONFUSION_STATE_TICKS_MIN = 25;
const CONFUSION_STATE_TICKS_RANGE = 25;
const DISTANCE_TO_KEEP_OUT_OF_WAY = SQUARED(4 * 16);
const STUCK_TICKS = 70;

export function AICoopGetCmd(actor: TActor, ticks: number): number {
  if (actor.aiContext == null) actor.aiContext = AIContextNew();
  let cmd = 0;
  if (actor.confused) {
    const s = actor.aiContext.ConfusionState;
    actor.aiContext.Delay = MAX(0, actor.aiContext.Delay - ticks);
    if (actor.aiContext.Delay === 0) {
      actor.aiContext.Delay = CONFUSION_STATE_TICKS_MIN + (rand() % CONFUSION_STATE_TICKS_RANGE);
      if (s.Type === AI_CONFUSION_CONFUSED) {
        s.Type = AI_CONFUSION_CORRECT;
      } else {
        ActorSetAIState(actor, AI_STATE_CONFUSED);
        s.Type = AI_CONFUSION_CONFUSED;
        s.Cmd = rand() & (CMD_LEFT | CMD_RIGHT | CMD_UP | CMD_DOWN | CMD_BUTTON1 | CMD_BUTTON2);
      }
    }
    switch (s.Type) {
      case AI_CONFUSION_CONFUSED: cmd = s.Cmd; break;
      case AI_CONFUSION_CORRECT: cmd = CmdGetReverse(AICoopGetCmdNormal(actor)); break;
      default: break;
    }
    if (Button2(cmd) && CMD_HAS_DIRECTION(cmd)) cmd &= ~CMD_BUTTON2;
  } else {
    cmd = AICoopGetCmdNormal(actor);
  }
  return cmd;
}

function AICoopGetCmdNormal(actor: TActor): number {
  const ai = actor.aiContext!;
  const actorTilePos = Vec2ToTile(actor.Pos);
  let dangerBulletPos = svec2_zero();
  for (let x = actorTilePos.x - 1; x <= actorTilePos.x + 1 && svec2_is_zero(dangerBulletPos); x++) {
    for (let y = actorTilePos.y - 1; y <= actorTilePos.y + 1 && svec2_is_zero(dangerBulletPos); y++) {
      const t = MapGetTile(gMap, { x, y });
      if (t == null) continue;
      for (const tid of t.things) {
        if (tid.Kind !== KIND_MOBILEOBJECT) continue;
        const mo = gMobObjs[tid.Id];
        if (mo.bulletClass.HurtAlways) {
          dangerBulletPos = mo.thing.Pos;
          break;
        }
      }
    }
  }
  if (!svec2_is_zero(dangerBulletPos)) return AIRetreatFrom(actor, dangerBulletPos);
  let lowAmmoGun = -1;
  if (gCampaign.Setting.Ammo && ai.OnGunId === -1) {
    let mostPreferredWeaponWithAmmo = -1;
    let mostPreferredWeaponHasAmmo = false;
    for (let i = 0; i < MAX_GUNS; i++) {
      const w = actor.guns[i];
      if (w.Gun == null || w.Gun.Type !== GUNTYPE_NORMAL) continue;
      const ammoAmount = ActorWeaponGetAmmo(actor, w.Gun, 0);
      if ((mostPreferredWeaponWithAmmo === -1 && ammoAmount !== 0) || (!mostPreferredWeaponHasAmmo && ammoAmount > 0)) {
        mostPreferredWeaponWithAmmo = i;
        mostPreferredWeaponHasAmmo = ammoAmount > 0;
      }
      if (w.Gun.Normal.AmmoId !== -1) {
        const ammo = AmmoGetById(w.Gun.Normal.AmmoId)!;
        if (lowAmmoGun === -1 && ammoAmount < ammo.Amount) lowAmmoGun = i;
      }
    }
    if (mostPreferredWeaponWithAmmo !== -1 && mostPreferredWeaponWithAmmo !== actor.gunIndex) {
      return actor.lastCmd === CMD_BUTTON2 ? 0 : CMD_BUTTON2;
    }
  }
  if (ai.OnGunId !== -1) {
    const wc = IdWeaponClass(ai.OnGunId)!;
    if ((lowAmmoGun !== -1 && ActorFindGun(actor, wc) < 0) ||
      (wc.Type === GUNTYPE_GRENADE ? ActorGetNumGrenades(actor) < MAX_GRENADES : ActorGetNumGuns(actor) < MAX_GUNS)) {
      ai.OnGunId = -1;
      return actor.lastCmd === CMD_BUTTON2 ? 0 : CMD_BUTTON2;
    }
    ai.OnGunId = -1;
  }
  let closestPlayer: TActor | null = null;
  let minDistance2 = -1;
  if (!IsPVP(gCampaign.Entry.Mode)) {
    for (let uid = 0; uid < actor.PlayerUID; uid++) {
      const pd = PlayerDataGetByUID(uid);
      if (pd == null || !IsPlayerAlive(pd)) continue;
      const p = ActorGetByUID(pd.ActorUID)!;
      const distance2 = svec2_distance_squared(actor.Pos, p.Pos);
      if (!closestPlayer || distance2 < minDistance2) {
        minDistance2 = distance2;
        closestPlayer = p;
      }
      if (distance2 < DISTANCE_TO_KEEP_OUT_OF_WAY && AIIsFacing(p, actor.Pos, p.direction)) {
        return AIMoveAwayFromLine(actor.Pos, p.Pos, p.direction);
      }
    }
  }
  let distanceTooFarFromPlayer = 8.0;
  if (closestPlayer && closestPlayer.action === ACTORACTION_EXITING) distanceTooFarFromPlayer = 2.0;
  if (closestPlayer && minDistance2 > SQUARED(f32(distanceTooFarFromPlayer * 16))) {
    ActorSetAIState(actor, AI_STATE_FOLLOW);
    return SmartGoto(actor, closestPlayer.Pos, minDistance2);
  }
  const closestEnemy = AIGetClosestVisibleEnemy(actor, true);
  if (closestEnemy) {
    const minEnemyDistance = MAX(fabsf(f32(actor.Pos.x - closestEnemy.Pos.x)), fabsf(f32(actor.Pos.y - closestEnemy.Pos.y)));
    if (minEnemyDistance > 0 && minEnemyDistance < 12 * 16 && AIHasClearShot(actor.Pos, closestEnemy.Pos)) {
      ActorSetAIState(actor, AI_STATE_HUNT);
      if (closestEnemy.uid !== ai.EnemyId) {
        ai.EnemyId = closestEnemy.uid;
        ai.GunRangeScalar = 1.0;
      } else {
        ai.GunRangeScalar *= 0.99;
      }
      return AIAttack(actor, closestEnemy.Pos);
    }
  }
  const out = { cmd: 0 };
  if (TryCompleteNearbyObjective(actor, closestPlayer, distanceTooFarFromPlayer, out)) return out.cmd;
  if (closestPlayer) {
    if (minDistance2 > SQUARED(2 * 16)) {
      ActorSetAIState(actor, AI_STATE_FOLLOW);
      return SmartGoto(actor, closestPlayer.Pos, minDistance2);
    } else if (minDistance2 < SQUARED(Math.trunc((4 * 16) / 3))) {
      return CmdGetReverse(AIGotoDirect(actor.Pos, closestPlayer.Pos));
    }
  }
  ActorSetAIState(actor, AI_STATE_IDLE);
  return 0;
}
function SmartGoto(actor: TActor, pos: Vec2, minDistance2: number): number {
  const ai = actor.aiContext!;
  let cmd = AIGoto(actor, pos, true);
  if (CMD_HAS_DIRECTION(cmd) && AIHasClearPath(actor.Pos, pos, !ai.IsStuckTooLong) && minDistance2 > SQUARED(7 * 16)) {
    cmd |= CMD_BUTTON2;
  }
  const o = AIGetObjectRunningInto(actor, cmd);
  const tilePos = Vec2ToTile(actor.Pos);
  if (o && ObjIsDangerous(o) && svec2i_is_equal(tilePos, ai.LastTile)) {
    cmd = AIGoto(actor, o.thing.Pos, true);
    if (ActorGetCanFireBarrel(actor, ACTOR_GET_WEAPON(actor)) >= 0) cmd |= CMD_BUTTON1;
  }
  if (svec2i_is_equal(tilePos, ai.LastTile)) {
    ai.Delay++;
    if (ai.Delay >= STUCK_TICKS) {
      if (!ai.IsStuckTooLong) ai.Goto.IsFollowing = false;
      ai.IsStuckTooLong = true;
      cmd = AIGoto(actor, pos, !ai.IsStuckTooLong);
    }
  } else {
    ai.Delay = 0;
    ai.IsStuckTooLong = false;
  }
  ai.LastTile = tilePos;
  return cmd;
}

interface ClosestObjective {
  Distance2: number;
  Objective: Objective | null;
  UID: number;
  Pos: Vec2;
  IsDestructible: boolean;
  Type: number;
}
function newCO(): ClosestObjective {
  return { Distance2: 0, Objective: null, UID: 0, Pos: svec2_zero(), IsDestructible: false, Type: AI_OBJECTIVE_TYPE_NORMAL };
}
function TryCompleteNearbyObjective(actor: TActor, closestPlayer: TActor | null, distanceTooFarFromPlayer: number,
  out: { cmd: number }): boolean {
  const context = actor.aiContext!;
  const objState = context.ObjectiveState;
  if (context.State === AI_STATE_NEXT_OBJECTIVE) {
    let hasNoUpdates = true;
    switch (objState.Type) {
      case AI_OBJECTIVE_TYPE_KEY:
        hasNoUpdates = objState.LastDone === KeycardCount(gMission.KeyFlags);
        break;
      case AI_OBJECTIVE_TYPE_NORMAL:
        hasNoUpdates = objState.Obj != null && objState.LastDone === (objState.Obj as Objective).done;
        break;
      case AI_OBJECTIVE_TYPE_KILL: {
        const target = ActorGetByUID(objState.UID)!;
        hasNoUpdates = target.health > 0;
        objState.Goal = target.thing.Pos;
        break;
      }
      case AI_OBJECTIVE_TYPE_PICKUP: {
        const p = PickupGetByUID(objState.UID);
        hasNoUpdates = p != null && p.isInUse;
        break;
      }
      default:
        break;
    }
    if (hasNoUpdates) {
      const cmd = GotoObjective(actor, 0);
      if (CMD_HAS_DIRECTION(cmd)) {
        out.cmd = cmd;
        return true;
      }
    }
  }
  if (CanCompleteMission(gMission)) {
    for (let i = 0; i < gMap.exits.length; i++) {
      const exitPos = MapGetExitPos(gMap, i);
      if (CanGetObjective(exitPos, actor.Pos, closestPlayer, distanceTooFarFromPlayer)) {
        ActorSetAIState(actor, AI_STATE_NEXT_OBJECTIVE);
        objState.Type = AI_OBJECTIVE_TYPE_EXIT;
        objState.Goal = exitPos;
        out.cmd = GotoObjective(actor, 0);
        return true;
      }
    }
  }
  const objectives = FindObjectivesSortedByDistance(actor, closestPlayer);
  for (const c of objectives) {
    if (CanGetObjective(c.Pos, actor.Pos, closestPlayer, distanceTooFarFromPlayer)) {
      ActorSetAIState(actor, AI_STATE_NEXT_OBJECTIVE);
      objState.Type = c.Type;
      objState.IsDestructible = c.IsDestructible;
      switch (c.Type) {
        case AI_OBJECTIVE_TYPE_KEY:
          objState.LastDone = KeycardCount(gMission.KeyFlags);
          break;
        case AI_OBJECTIVE_TYPE_NORMAL:
          objState.Obj = c.Objective;
          objState.LastDone = c.Objective!.done;
          break;
        case AI_OBJECTIVE_TYPE_KILL:
        case AI_OBJECTIVE_TYPE_PICKUP:
          objState.UID = c.UID;
          break;
        default:
          break;
      }
      objState.Goal = c.Pos;
      out.cmd = GotoObjective(actor, c.Distance2);
      return true;
    }
  }
  return false;
}
function GetPickupObjectiveType(p: Pickup, uid: { v: number }, actor: TActor, closestPlayer: TActor | null): number {
  for (const pe of p.class.Effects) {
    switch (pe.Type) {
      case PICKUP_KEYCARD:
        return AI_OBJECTIVE_TYPE_KEY;
      case PICKUP_JEWEL:
        uid.v = p.UID;
        return AI_OBJECTIVE_TYPE_PICKUP;
      case PICKUP_HEALTH:
        if (actor.health > Math.trunc(CampaignGetMaxHP(gCampaign) / 4) || (closestPlayer != null && actor.health >= closestPlayer.health)) continue;
        uid.v = p.UID;
        return AI_OBJECTIVE_TYPE_PICKUP;
      case PICKUP_AMMO: {
        const ammoId = pe.Ammo.Id;
        const ammo = AmmoGetById(ammoId)!;
        const ammoAmount = actor.ammo[ammoId];
        if (!ActorUsesAmmo(actor, ammoId) || ammoAmount > ammo.Amount ||
          (closestPlayer != null && ActorUsesAmmo(closestPlayer, ammoId) && ammoAmount > closestPlayer.ammo[ammoId])) continue;
        uid.v = p.UID;
        return AI_OBJECTIVE_TYPE_PICKUP;
      }
      case PICKUP_GUN:
        if (ShouldPickupGun(pe, actor, closestPlayer)) {
          uid.v = p.UID;
          return AI_OBJECTIVE_TYPE_PICKUP;
        }
        break;
      case PICKUP_SHOW_MAP:
        uid.v = p.UID;
        return AI_OBJECTIVE_TYPE_PICKUP;
      case PICKUP_LIVES:
        if (closestPlayer != null && PlayerDataGetByUID(actor.PlayerUID)!.Lives >= PlayerDataGetByUID(closestPlayer.PlayerUID)!.Lives) continue;
        uid.v = p.UID;
        return AI_OBJECTIVE_TYPE_PICKUP;
      default:
        continue;
    }
  }
  return AI_OBJECTIVE_TYPE_NORMAL;
}
function FindObjectivesSortedByDistance(actor: TActor, closestPlayer: TActor | null): ClosestObjective[] {
  const objectives: ClosestObjective[] = [];
  if (IsPVP(gCampaign.Entry.Mode)) {
    const closestEnemy = AIGetClosestVisibleEnemy(actor, true);
    if (closestEnemy != null) {
      const co = newCO();
      co.Pos = closestEnemy.thing.Pos;
      co.Type = AI_OBJECTIVE_TYPE_KILL;
      co.Distance2 = svec2_distance_squared(actor.Pos, co.Pos);
      co.UID = closestEnemy.uid;
      objectives.push(co);
    }
  }
  for (const p of gPickups) {
    if (!p.isInUse) continue;
    const co = newCO();
    co.Pos = p.thing.Pos;
    const uid = { v: 0 };
    co.Type = GetPickupObjectiveType(p, uid, actor, closestPlayer);
    co.UID = uid.v;
    if (co.Type === AI_OBJECTIVE_TYPE_NORMAL) continue;
    if (!TileCanWalk(MapGetTile(gMap, Vec2ToTile(co.Pos)))) continue;
    co.Distance2 = svec2_distance_squared(actor.Pos, co.Pos);
    objectives.push(co);
  }
  for (const o of gObjs) {
    if (!o.isInUse) continue;
    if (!(o.thing.flags & THING_OBJECTIVE)) continue;
    const co = newCO();
    co.Pos = o.thing.Pos;
    co.IsDestructible = true;
    co.Distance2 = svec2_distance_squared(actor.Pos, co.Pos);
    co.Objective = gMission.missionData!.Objectives[ObjectiveFromThing(o.thing.flags)];
    objectives.push(co);
  }
  for (const a of gActors) {
    if (!a.isInUse) continue;
    const ti = a.thing;
    if (!(ti.flags & THING_OBJECTIVE)) continue;
    const o = gMission.missionData!.Objectives[ObjectiveFromThing(ti.flags)];
    if (o.Type !== OBJECTIVE_KILL && o.Type !== OBJECTIVE_RESCUE) continue;
    if (o.Type === OBJECTIVE_RESCUE && !(a.flags & FLAGS_PRISONER)) continue;
    const co = newCO();
    co.Pos = ti.Pos;
    co.Distance2 = svec2_distance_squared(actor.Pos, co.Pos);
    co.Objective = o;
    objectives.push(co);
  }
  for (const o of gMission.missionData!.Objectives) {
    if (o.Type !== OBJECTIVE_INVESTIGATE) continue;
    if (ObjectiveIsComplete(o) || MapGetExploredPercentage(gMap) === 100) continue;
    const unexploredTile = MapSearchTileAround(gMap, Vec2ToTile(actor.Pos), MapTileIsUnexplored);
    const co = newCO();
    co.Pos = Vec2CenterOfTile(unexploredTile);
    co.Distance2 = svec2_distance_squared(actor.Pos, co.Pos);
    co.Objective = o;
    objectives.push(co);
  }
  // glibc's qsort sorts with a merge sort (stable), as Array.prototype.sort
  objectives.sort((c1, c2) => (c1.Distance2 < c2.Distance2 ? -1 : c1.Distance2 > c2.Distance2 ? 1 : 0));
  return objectives;
}
function ShouldPickupGun(pe: PickupEffect, actor: TActor, closestPlayer: TActor | null): boolean {
  if (!gCampaign.Setting.Ammo) return false;
  const pickupGun = IdWeaponClass(pe.GunId)!;
  const start = pickupGun.Type === GUNTYPE_GRENADE ? MAX_GUNS : 0;
  const end = pickupGun.Type === GUNTYPE_GRENADE ? MAX_WEAPONS : MAX_GUNS;
  let hasGunLowOnAmmo = false;
  for (let i = start; i < end; i++) {
    const wc = actor.guns[i].Gun;
    if (wc == null) {
      hasGunLowOnAmmo = true;
      break;
    }
    if (wc.Type !== GUNTYPE_NORMAL) continue;
    const ammoId = wc.Normal.AmmoId;
    if (ammoId < 0) continue;
    const ammo = AmmoGetById(ammoId)!;
    const ammoAmount = actor.ammo[ammoId];
    if (ammoAmount >= ammo.Amount || (closestPlayer != null && ActorUsesAmmo(closestPlayer, ammoId) && ammoAmount > closestPlayer.ammo[ammoId])) continue;
    hasGunLowOnAmmo = true;
  }
  if (!hasGunLowOnAmmo) return false;
  return ActorFindGun(actor, IdWeaponClass(pe.GunId)!) < 0;
}
function CanGetObjective(objPos: Vec2, actorPos: Vec2, player: TActor | null, distanceTooFarFromPlayer: number): boolean {
  if (!player) return AIHasPath(actorPos, objPos, true);
  const distanceMax2 = SQUARED(f32(distanceTooFarFromPlayer * 16));
  if (!(svec2_distance_squared(objPos, player.Pos) < distanceMax2)) return false;
  return AIHasClearPath(actorPos, objPos, true);
}
function GotoObjective(actor: TActor, objDistance2: number): number {
  const objState = actor.aiContext!.ObjectiveState;
  const goal = objState.Goal;
  let cmd = 0;
  const isDestruction = objState.Type === AI_OBJECTIVE_TYPE_NORMAL && objState.IsDestructible;
  if (!isDestruction || svec2_distance_squared(actor.Pos, goal) > SQUARED(3 * 16) || !AIHasClearView(actor, goal, 10 * 16)) {
    cmd = SmartGoto(actor, goal, objDistance2);
  } else if (isDestruction && ActorGetCanFireBarrel(actor, ACTOR_GET_WEAPON(actor)) >= 0) {
    cmd = AIHunt(actor, goal);
    if (AIHasClearShot(actor.Pos, goal)) cmd |= CMD_BUTTON1;
  }
  return cmd;
}
export function AICoopSelectWeapons(p: PlayerData, player: number, weapons: WeaponClass[]): void {
  const startIdx = (player * MAX_GUNS) % weapons.length;
  let gunCount = 0;
  for (let i = 0; gunCount < MAX_GUNS; i++) {
    const idx = (startIdx + i) % weapons.length;
    if (idx === startIdx && i > 0) break;
    const wc = weapons[idx];
    if (wc.Type !== GUNTYPE_NORMAL) continue;
    p.guns[gunCount] = wc;
    gunCount++;
  }
  if (gCampaign.Setting.Ammo) {
    const pistol = StrWeaponClass('Pistol');
    if (!PlayerHasWeapon(p, pistol)) {
      if (gunCount === MAX_GUNS) p.guns[MAX_GUNS - 1] = pistol;
      else {
        p.guns[gunCount] = pistol;
        gunCount++;
      }
    }
  }
}
export function AICoopOnPickupGun(a: TActor, gunId: number): void {
  a.aiContext!.OnGunId = gunId;
}
