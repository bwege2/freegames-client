// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/object3d/
// object3d_collision.cpp: hits, rams, shock waves, shields and deflector, and the reward for kills.
// Changed for the browser by the freegames project, 2026.
import { Vec3, fRand, rotatePoint } from '../core/math.ts';
import {
  aabbAabbCollision, obbObbCollision, sphereAabbCollision, sphereObbCollision, sphereSphereCollision,
} from '../core/collision.ts';
import { alive } from '../core/particles.ts';
import {
  type Object3D, Damage, ObjectStatus, ObjectType, needCheckCollision, objectsStatusFoe,
  checkHitBBHitBBCollision, checkHitBBMeshCollision, checkHitBBOBBCollision, checkMeshSphereCollision,
} from './object3d.ts';
import { world, Cycle, PairCycle, forEachManaged, forEachPair } from './world.ts';
import type { SpaceShip } from './spaceship.ts';
import type { GroundObject } from './ground.ts';
import type { SpaceObject } from './spaceobject.ts';
import type { Projectile } from './projectile.ts';
import { CreateBulletExplosion, CreateGroundExplosion, CreateSpaceExplosion } from './explosion.ts';
import { G, VoicePhrase, audio } from '../game/globals.ts';
import { GetCameraSpeed } from '../game/camera.ts';

/** the game's counters this file changes (game.cpp globals) */
export const GS = {
  ShildEnergyStatus: 0,
  ShildStartHitStatus: 0,
  PlayerDeadObjectPieceNum: -1,
  AlienShipsKillQuant: 0,
  AlienShipsKillBonus: 0,
  AlienMotherShipsKillQuant: 0,
  AlienMotherShipsKillBonus: 0,
  PirateShipsKillQuant: 0,
  PirateShipsKillBonus: 0,
  PirateVehiclesKillQuant: 0,
  PirateVehiclesKillBonus: 0,
  PirateBuildingsKillQuant: 0,
  PirateBuildingsKillBonus: 0,
  AsteroidsKillQuant: 0,
  AsteroidsKillBonus: 0,
  /** GameConfig().Profile[CurrentProfile].MissionReplayCount[CurrentMission] */
  MissionReplayCount: 0,
  /** ProfileDifficulty(CurrentProfile) */
  ProfileDifficulty: 100,
  /** SetupHUDText(experience, money) */
  onScore: (_exp: number, _money: number): void => {},
};

function AddBonusForKilledEnemy(o: Object3D, KilledBy: number): void {
  if (KilledBy !== ObjectStatus.Player || o.ObjectStatus !== ObjectStatus.Enemy || o.ArmorInitialStatus <= 0) return;
  let bonus = o.ArmorInitialStatus * G.GameEnemyArmorPenalty;
  if (GS.MissionReplayCount > 0) bonus /= 2 * GS.MissionReplayCount;
  let exp = o.ArmorInitialStatus * G.GameEnemyArmorPenalty * GS.ProfileDifficulty / 100;
  switch (o.ObjectType) {
    case ObjectType.AlienFighter:
      bonus /= 1.8; exp /= 1.8; GS.AlienShipsKillBonus += bonus; GS.AlienShipsKillQuant++; break;
    case ObjectType.AlienMotherShip:
      bonus /= 1.8; exp /= 1.8; GS.AlienMotherShipsKillBonus += bonus; GS.AlienMotherShipsKillQuant++; break;
    case ObjectType.PirateShip:
      bonus /= 1.8; exp /= 1.8; GS.PirateShipsKillBonus += bonus; GS.PirateShipsKillQuant++; break;
    case ObjectType.PirateVehicle:
      bonus /= 1.8; exp /= 1.8; GS.PirateVehiclesKillBonus += bonus; GS.PirateVehiclesKillQuant++; break;
    case ObjectType.PirateBuilding:
      bonus /= 1.8; exp /= 1.8; GS.PirateBuildingsKillBonus += bonus; GS.PirateBuildingsKillQuant++; break;
    case ObjectType.SmallAsteroid:
      bonus /= 8; exp /= 8; GS.AsteroidsKillBonus += bonus; GS.AsteroidsKillQuant++; break;
    default:
      return;
  }
  G.GameMoney += bonus;
  G.GameExperience += exp;
  GS.onScore(Math.trunc(G.GameExperience), Math.trunc(G.GameMoney));
}

function SetupSpaceExplosion(o: SpaceObject): void {
  if (o.ObjectType === ObjectType.SmallAsteroid) CreateSpaceExplosion(o, 1, o.Location, o.Speed, -1);
  else if (o.ObjectType === ObjectType.SpaceDebris) CreateSpaceExplosion(o, 32, o.Location, o.Speed, -1);
}

function SetupSpaceShipExplosion(s: SpaceShip, piece: number): void {
  switch (s.ObjectType) {
    case ObjectType.AlienFighter: CreateSpaceExplosion(s, 2, s.Location, s.Speed, piece); break;
    case ObjectType.EarthFighter: CreateSpaceExplosion(s, 31, s.Location, s.Speed, piece); break;
    case ObjectType.AlienMotherShip: CreateSpaceExplosion(s, 33, s.Location, s.Speed, piece === -1 ? 0 : piece); break;
    case ObjectType.PirateShip:
      if (s.InternalType <= 5) CreateSpaceExplosion(s, 3, s.Location, s.Speed, piece);
      else CreateSpaceExplosion(s, 31, s.Location, s.Speed, piece === -1 ? 0 : piece);
      break;
  }
}

function SetupGroundExplosion(g: GroundObject, piece: number): void {
  if (g.ObjectType === ObjectType.PirateBuilding) CreateGroundExplosion(g, 1, g.Location, piece);
  else if (g.ObjectType === ObjectType.PirateVehicle) CreateGroundExplosion(g, 2, g.Location, piece);
}

/** CheckDistanceBetweenPoints: the distance factor, or -1 when out of range */
function distanceFactor(p1: Vec3, p2: Vec3, d2: number): number {
  const r = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2;
  return r <= d2 ? r / d2 : -1;
}

function DamageAllNearObjectsByShockWave(dont: Object3D, epi: Vec3, r2: number, dmg: number, status: number): void {
  dmg = dmg * 0.75;
  forEachManaged(world.SpaceObjectList, (o) => {
    if (!needCheckCollision(o) || !objectsStatusFoe(status, o.ObjectStatus) || dont === o) return Cycle.Continue;
    const f = distanceFactor(o.Location, epi, r2);
    if (f < 0) return Cycle.Continue;
    if (o.ObjectType === ObjectType.SpaceDebris && fRand() > 0.5) return Cycle.Continue;
    o.ArmorCurrentStatus -= dmg * (1 - f);
    if (o.ArmorCurrentStatus <= 0) {
      AddBonusForKilledEnemy(o, status);
      SetupSpaceExplosion(o);
      return Cycle.DeleteObjectAndContinue;
    }
    return Cycle.Continue;
  });
  forEachManaged(world.ShipList, (s) => {
    if (!needCheckCollision(s) || !objectsStatusFoe(status, s.ObjectStatus) || dont === s) return Cycle.Continue;
    const f = distanceFactor(s.Location, epi, r2);
    if (f < 0) return Cycle.Continue;
    s.ShieldCurrentStatus = 0;
    s.ArmorCurrentStatus -= dmg * (1 - f);
    if (s.ArmorCurrentStatus <= 0 && s.ObjectStatus !== ObjectStatus.Player) {
      AddBonusForKilledEnemy(s, status);
      SetupSpaceShipExplosion(s, -1);
      return Cycle.DeleteObjectAndContinue;
    }
    return Cycle.Continue;
  });
  forEachManaged(world.GroundObjectList, (g) => {
    if (!needCheckCollision(g) || !objectsStatusFoe(status, g.ObjectStatus) || dont === g) return Cycle.Continue;
    const f = distanceFactor(g.Location, epi, r2);
    if (f < 0) return Cycle.Continue;
    g.ArmorCurrentStatus -= dmg * (1 - f);
    if (g.ArmorCurrentStatus <= 0) {
      AddBonusForKilledEnemy(g, status);
      SetupGroundExplosion(g, -1);
      return Cycle.DeleteObjectAndContinue;
    }
    return Cycle.Continue;
  });
}

function InteractWithPlayerShield(pd: Damage, d: Damage): boolean {
  let cur = GS.ShildEnergyStatus * GS.ShildStartHitStatus;
  cur -= pd.Kinetic / 5;
  cur -= pd.EM * 2;
  if (cur < 0) cur = 0;
  GS.ShildEnergyStatus = cur / GS.ShildStartHitStatus;
  d.set(0);
  return true;
}

function InteractWithPlayerDeflector(status: number, p: Projectile): boolean {
  const pen = G.GameEnemyWeaponPenalty;
  p.ObjectStatus = status;
  p.SetRotation(p.Rotation.mul(-1));
  for (const t of p.GraphicFX) {
    const g = alive(t);
    if (g) {
      g.ParticlesPerSec = Math.trunc(g.ParticlesPerSec * pen);
      g.Speed = g.Speed * pen;
      g.Life = g.Life / pen;
      g.MagnetFactor = g.MagnetFactor * pen * pen;
    }
  }
  p.SpeedStart = p.Speed * pen;
  p.SpeedEnd = (p.Speed * pen) / 4;
  p.Age = p.Age / pen;
  p.Lifetime = p.Lifetime / pen;
  let cur = GS.ShildEnergyStatus * GS.ShildStartHitStatus;
  cur -= p.Damage.Kinetic / 5;
  cur -= p.Damage.EM * 2;
  if (cur < 0) cur = 0;
  GS.ShildEnergyStatus = cur / GS.ShildStartHitStatus;
  p.Damage.mulBy(pen);
  return false;
}

/** DetectProjectileCollision: hit or not; the piece and the damage come back in `out` */
function DetectProjectileCollision(o: Object3D, out: { piece: number }, p: Projectile, d: Damage, ObjectSpeed: number): boolean {
  if (!objectsStatusFoe(o.ObjectStatus, p.ObjectStatus) && needCheckCollision(o)) return false;
  if (o.ObjectStatus === ObjectStatus.Player) ObjectSpeed += GetCameraSpeed();
  const shield = GS.ShildEnergyStatus * GS.ShildStartHitStatus;
  const pen = G.GameEnemyWeaponPenalty;
  switch (p.ProjectileType) {
    case 0:
      if (shield >= p.Damage.full() * pen && o.ObjectStatus === ObjectStatus.Player) {
        if (sphereSphereCollision(o.Radius, o.Location, p.Radius, p.Location, p.PrevLocation)) {
          if (G.GameAdvancedProtectionSystem === 4) return InteractWithPlayerDeflector(o.ObjectStatus, p);
          CreateBulletExplosion(o, p, p.Num, p.Location, ObjectSpeed);
          return InteractWithPlayerShield(p.Damage, d);
        }
      } else if (sphereSphereCollision(o.Radius, o.Location, p.Radius, p.Location, p.PrevLocation)
        && sphereAabbCollision(o.AABB, o.Location, p.Radius, p.Location, p.PrevLocation)
        && sphereObbCollision(o.OBB.Box, o.OBB.Location, o.Location, o.CurrentRotationMat, p.Radius, p.Location, p.PrevLocation)) {
        const hit = checkMeshSphereCollision(o, p);
        if (hit) {
          out.piece = hit[1];
          if (needCheckCollision(o)) {
            d.Kinetic = p.Damage.Kinetic;
            d.EM = p.Damage.EM;
            CreateBulletExplosion(o, p, p.Num, hit[0], ObjectSpeed);
          } else {
            d.set(0);
            CreateBulletExplosion(o, p, p.Num, hit[0], 0);
          }
          return true;
        }
      }
      break;
    case 1:
      if (shield >= p.Damage.full() * pen && o.ObjectStatus === ObjectStatus.Player) {
        if (sphereSphereCollision(o.Radius, o.Location, p.Radius, p.Location, p.PrevLocation)) {
          CreateBulletExplosion(o, p, -p.Num, p.Location, ObjectSpeed);
          return InteractWithPlayerShield(p.Damage, d);
        }
      } else if (sphereSphereCollision(o.Radius, o.Location, p.Radius, p.Location, p.PrevLocation)
        && sphereAabbCollision(o.AABB, o.Location, p.Radius, p.Location, p.PrevLocation)
        && sphereObbCollision(o.OBB.Box, o.OBB.Location, o.Location, o.CurrentRotationMat, p.Radius, p.Location, p.PrevLocation)
        && obbObbCollision(o.OBB.Box, o.OBB.Location, o.Location, o.CurrentRotationMat, p.OBB.Box, p.OBB.Location, p.Location, p.CurrentRotationMat)) {
        const piece = checkHitBBOBBCollision(o, p);
        if (piece < 0) break;
        out.piece = piece;
        const hit = checkMeshSphereCollision(o, p);
        if (!hit) break;
        out.piece = hit[1];
        if (p.Num === 18 || p.Num === 209) DamageAllNearObjectsByShockWave(o, p.Location, 75 * 75, p.Damage.Kinetic, p.ObjectStatus);
        if (p.Num === 19 || p.Num === 210) DamageAllNearObjectsByShockWave(o, p.Location, 150 * 150, p.Damage.Kinetic, p.ObjectStatus);
        if (needCheckCollision(o)) {
          d.Kinetic = p.Damage.Kinetic;
          d.EM = p.Damage.EM;
          CreateBulletExplosion(o, p, p.Num, p.Location, p.Speed);
        } else {
          d.set(0);
          CreateBulletExplosion(o, p, p.Num, p.Location, 0);
        }
        return true;
      }
      break;
    case 2:
      if (shield >= p.Damage.full() * o.TimeDelta * pen && o.ObjectStatus === ObjectStatus.Player) {
        if (sphereObbCollision(p.OBB.Box, p.OBB.Location, p.Location, p.CurrentRotationMat, o.Radius, o.Location, o.PrevLocation)) {
          return InteractWithPlayerShield(p.Damage, d);
        }
      } else if (aabbAabbCollision(o.AABB, o.Location, p.AABB, p.Location)
        && sphereObbCollision(p.OBB.Box, p.OBB.Location, p.Location, p.CurrentRotationMat, o.Radius, o.Location, o.PrevLocation)
        && obbObbCollision(p.OBB.Box, p.OBB.Location, p.Location, p.CurrentRotationMat, o.OBB.Box, o.OBB.Location, o.Location, o.CurrentRotationMat)) {
        const piece = checkHitBBOBBCollision(o, p);
        if (piece < 0) break;
        out.piece = piece;
        const pd = p.Damage.mul(o.TimeDelta);
        d.Kinetic = pd.Kinetic;
        d.EM = pd.EM;
        return true;
      }
      break;
  }
  return false;
}

/** the space object or ground object rams something: damage both ways */
function ram(a: Object3D, b: Object3D, aFactor: number): void {
  if (!needCheckCollision(b)) {
    a.ArmorCurrentStatus -= (a.ArmorInitialStatus / aFactor) * a.TimeDelta;
  } else {
    const s = a.ArmorCurrentStatus;
    a.ArmorCurrentStatus -= b.ArmorCurrentStatus;
    b.ArmorCurrentStatus -= s;
  }
  if (!needCheckCollision(a)) b.ArmorCurrentStatus = 0;
}

/** what a projectile cycle returns when the outer object was deleted */
function breakAfter(cmd: number): number {
  if (cmd === Cycle.Continue) return Cycle.Break;
  if (cmd === Cycle.DeleteObjectAndContinue) return Cycle.DeleteObjectAndBreak;
  return cmd;
}

export function DetectCollisionAllObject3D(): void {
  forEachManaged(world.ShipList, (ship) => {
    let ShipCmd = Cycle.Continue;
    forEachManaged(world.ProjectileList, (p) => {
      let PCmd = Cycle.Continue;
      const d = new Damage(0);
      const out = { piece: -1 };
      if (DetectProjectileCollision(ship, out, p, d, ship.Speed)) {
        if (ship.ObjectStatus === ObjectStatus.Player && G.GameAdvancedProtectionSystem === 2) {
          d.Kinetic /= 4;
          d.EM /= 5;
        }
        if (ship.ShieldCurrentStatus >= d.EM) {
          ship.ShieldCurrentStatus -= d.EM;
          d.EM = 0;
        } else {
          d.EM -= ship.ShieldCurrentStatus;
          ship.ShieldCurrentStatus = 0;
        }
        if (ship.ShieldCurrentStatus >= d.Kinetic) {
          ship.ShieldCurrentStatus -= d.Kinetic;
          d.Kinetic = 0;
        } else {
          d.Kinetic -= ship.ShieldCurrentStatus;
          ship.ShieldCurrentStatus = 0;
        }
        if (ship.ShieldCurrentStatus < 0) ship.ShieldCurrentStatus = 0;
        ship.ArmorCurrentStatus -= d.Kinetic;
        ship.ArmorCurrentStatus -= d.EM * fRand();
        if (d.EM > 0 && ship.ObjectType === ObjectType.AlienFighter && fRand() > 0.7) ship.ArmorCurrentStatus = 0;
        if (ship.ArmorCurrentStatus <= 0) {
          AddBonusForKilledEnemy(ship, p.ObjectStatus);
          if (ship.ObjectStatus !== ObjectStatus.Player) {
            SetupSpaceShipExplosion(ship, out.piece);
            ShipCmd = Cycle.DeleteObjectAndContinue;
          } else {
            GS.PlayerDeadObjectPieceNum = out.piece;
          }
        } else if (ship.ObjectStatus !== ObjectStatus.Player && ship.ObjectType !== ObjectType.AlienMotherShip && d.EM > 0) {
          const r = fRand();
          if (r > 0.7) ship.MaxSpeed = ship.MaxSpeed / 2;
          else if (r > 0.5) ship.MaxSpeedRotate = ship.MaxSpeedRotate / 2;
          else if (r > 0.2 && ship.FlareWeaponSlots.length) {
            for (const s of ship.FlareWeaponSlots) s.release();
            ship.FlareWeaponSlots = [];
          }
        }
        if (p.ProjectileType !== 2) PCmd = Cycle.DeleteObjectAndContinue;
        if (ShipCmd === Cycle.DeleteObjectAndContinue) PCmd = breakAfter(PCmd);
      }
      if (PCmd !== Cycle.Continue) return PCmd;
      if (ship.ObjectStatus === ObjectStatus.Player && p.ObjectStatus === ObjectStatus.Enemy && !G.GameUndestroyableWeapon && ship.WeaponSlots.length) {
        for (const ws of ship.WeaponSlots) {
          const w = alive(ws.Weapon);
          if (!w) continue;
          const o2 = { piece: -1 };
          if (w.ArmorCurrentStatus > 0 && DetectProjectileCollision(w, o2, p, d, ship.Speed)) {
            w.ArmorCurrentStatus -= d.Kinetic;
            if (w.ArmorCurrentStatus <= 0) {
              w.ArmorCurrentStatus = 0;
              audio.playVoicePhrase(VoicePhrase.WeaponDestroyed, 1);
            } else {
              audio.playVoicePhrase(VoicePhrase.WeaponDamaged, 1);
            }
            if (p.ProjectileType !== 2) return Cycle.DeleteObjectAndContinue;
          }
        }
      }
      return Cycle.Continue;
    });
    if (ShipCmd === Cycle.DeleteObjectAndContinue) return ShipCmd;
    forEachManaged(world.SpaceObjectList, (o) => {
      let OCmd = Cycle.Continue;
      if (!(sphereSphereCollision(ship.Radius, ship.Location, o.Radius, o.Location, o.PrevLocation)
        && sphereAabbCollision(ship.AABB, ship.Location, o.Radius, o.Location, o.PrevLocation)
        && sphereObbCollision(ship.OBB.Box, ship.OBB.Location, ship.Location, ship.CurrentRotationMat, o.Radius, o.Location, o.PrevLocation))) return OCmd;
      let piece = checkHitBBOBBCollision(ship, o);
      if (piece < 0) return OCmd;
      if (o.ObjectType === ObjectType.BasePart || o.ObjectType === ObjectType.BigAsteroid) {
        const p2 = checkHitBBMeshCollision(ship, o);
        if (p2 < 0) return OCmd;
        piece = p2;
      }
      ram(ship, o, ship.ObjectStatus !== ObjectStatus.Player ? 0.5 : 2.0);
      if (needCheckCollision(o) && o.ArmorCurrentStatus <= 0) {
        AddBonusForKilledEnemy(o, ship.ObjectStatus);
        SetupSpaceExplosion(o);
        OCmd = Cycle.DeleteObjectAndContinue;
      }
      if (needCheckCollision(ship) && ship.ArmorCurrentStatus <= 0) {
        if (ship.ObjectStatus !== ObjectStatus.Player) {
          SetupSpaceShipExplosion(ship, piece);
          ShipCmd = Cycle.DeleteObjectAndContinue;
          OCmd = breakAfter(OCmd);
        } else {
          GS.PlayerDeadObjectPieceNum = piece;
        }
      }
      return OCmd;
    });
    if (ShipCmd === Cycle.DeleteObjectAndContinue) return ShipCmd;
    forEachManaged(world.GroundObjectList, (g) => {
      let GCmd = Cycle.Continue;
      if (!(sphereSphereCollision(ship.Radius, ship.Location, g.Radius, g.Location, g.PrevLocation)
        && sphereAabbCollision(ship.AABB, ship.Location, g.Radius, g.Location, g.PrevLocation)
        && sphereObbCollision(ship.OBB.Box, ship.OBB.Location, ship.Location, ship.CurrentRotationMat, g.Radius, g.Location, g.PrevLocation))) return GCmd;
      const hh = checkHitBBHitBBCollision(ship, g);
      if (!hh) return GCmd;
      let [piece1, piece2] = hh;
      if (g.ObjectType === ObjectType.CivilianBuilding) {
        // NOTE the original passes ObjectPieceNum2 here, so the ship's piece number ends up in it
        const p = checkHitBBMeshCollision(ship, g);
        if (p < 0) return GCmd;
        piece2 = p;
      }
      ram(ship, g, ship.ObjectStatus !== ObjectStatus.Player ? 0.5 : 2.0);
      if (needCheckCollision(g) && g.ArmorCurrentStatus <= 0) {
        AddBonusForKilledEnemy(g, ship.ObjectStatus);
        SetupGroundExplosion(g, piece2);
        GCmd = Cycle.DeleteObjectAndContinue;
      }
      if (needCheckCollision(ship) && ship.ArmorCurrentStatus <= 0) {
        if (ship.ObjectStatus !== ObjectStatus.Player) {
          SetupSpaceShipExplosion(ship, piece1);
          ShipCmd = Cycle.DeleteObjectAndContinue;
          GCmd = breakAfter(GCmd);
        } else {
          GS.PlayerDeadObjectPieceNum = piece1;
        }
      }
      return GCmd;
    });
    return ShipCmd;
  });
  forEachPair(world.ShipList, (a, b) => {
    let cmd = PairCycle.Continue;
    if (!(sphereSphereCollision(a.Radius, a.Location, b.Radius, b.Location, b.PrevLocation)
      && aabbAabbCollision(a.AABB, a.Location, b.AABB, b.Location)
      && obbObbCollision(a.OBB.Box, a.OBB.Location, a.Location, a.CurrentRotationMat, b.OBB.Box, b.OBB.Location, b.Location, b.CurrentRotationMat))) return cmd;
    const hh = checkHitBBHitBBCollision(a, b);
    if (!hh) return cmd;
    const [p1, p2] = hh;
    const s = a.ArmorCurrentStatus;
    a.ArmorCurrentStatus -= b.ArmorCurrentStatus;
    b.ArmorCurrentStatus -= s;
    if (!needCheckCollision(b)) a.ArmorCurrentStatus = 0;
    if (!needCheckCollision(a)) b.ArmorCurrentStatus = 0;
    if (needCheckCollision(b) && b.ArmorCurrentStatus <= 0) AddBonusForKilledEnemy(b, a.ObjectStatus);
    if (needCheckCollision(a) && a.ArmorCurrentStatus <= 0) AddBonusForKilledEnemy(a, b.ObjectStatus);
    if (needCheckCollision(b) && b.ArmorCurrentStatus <= 0) {
      if (b.ObjectStatus !== ObjectStatus.Player) {
        SetupSpaceShipExplosion(b, p2);
        cmd = PairCycle.DeleteSecondObjectAndContinue;
      } else {
        GS.PlayerDeadObjectPieceNum = p2;
      }
    }
    if (needCheckCollision(a) && a.ArmorCurrentStatus <= 0) {
      if (a.ObjectStatus !== ObjectStatus.Player) {
        SetupSpaceShipExplosion(a, p1);
        cmd = cmd === PairCycle.DeleteSecondObjectAndContinue ? PairCycle.DeleteBothObjectsAndContinue : PairCycle.DeleteFirstObjectAndContinue;
      } else {
        GS.PlayerDeadObjectPieceNum = p1;
      }
    }
    return cmd;
  });
  forEachManaged(world.GroundObjectList, (g) => {
    let GCmd = Cycle.Continue;
    forEachManaged(world.ProjectileList, (p) => {
      let PCmd = Cycle.Continue;
      const d = new Damage(0);
      const out = { piece: -1 };
      if (DetectProjectileCollision(g, out, p, d, g.Speed)) {
        if (needCheckCollision(g)) {
          g.ArmorCurrentStatus -= d.Kinetic;
          if (g.ArmorCurrentStatus <= 0) {
            AddBonusForKilledEnemy(g, p.ObjectStatus);
            SetupGroundExplosion(g, out.piece);
            GCmd = Cycle.DeleteObjectAndContinue;
          }
        }
        if (p.ProjectileType !== 2) PCmd = Cycle.DeleteObjectAndContinue;
        if (GCmd === Cycle.DeleteObjectAndContinue) PCmd = breakAfter(PCmd);
      }
      return PCmd;
    });
    if (GCmd === Cycle.DeleteObjectAndContinue) return GCmd;
    forEachManaged(world.SpaceObjectList, (o) => {
      let OCmd = Cycle.Continue;
      if (!(o.ObjectType !== ObjectType.BasePart && (needCheckCollision(g) || needCheckCollision(o))
        && sphereSphereCollision(g.Radius, g.Location, o.Radius, o.Location, o.PrevLocation)
        && sphereAabbCollision(g.AABB, g.Location, o.Radius, o.Location, o.PrevLocation)
        && sphereObbCollision(g.OBB.Box, g.OBB.Location, g.Location, g.CurrentRotationMat, o.Radius, o.Location, o.PrevLocation))) return OCmd;
      const piece = checkHitBBOBBCollision(g, o);
      if (piece < 0) return OCmd;
      ram(g, o, 0.5);
      if (needCheckCollision(o) && o.ArmorCurrentStatus <= 0) {
        AddBonusForKilledEnemy(o, g.ObjectStatus);
        SetupSpaceExplosion(o);
        OCmd = Cycle.DeleteObjectAndContinue;
      }
      if (needCheckCollision(g) && g.ArmorCurrentStatus <= 0) {
        SetupGroundExplosion(g, piece);
        GCmd = Cycle.DeleteObjectAndContinue;
        OCmd = breakAfter(OCmd);
      }
      return OCmd;
    });
    return GCmd;
  });
  forEachManaged(world.SpaceObjectList, (o) => {
    let OCmd = Cycle.Continue;
    forEachManaged(world.ProjectileList, (p) => {
      let PCmd = Cycle.Continue;
      const d = new Damage(0);
      const out = { piece: -1 };
      if (DetectProjectileCollision(o, out, p, d, o.Speed)) {
        if (needCheckCollision(o)) {
          o.ArmorCurrentStatus -= d.Kinetic;
          if (o.ArmorCurrentStatus <= 0) {
            AddBonusForKilledEnemy(o, p.ObjectStatus);
            SetupSpaceExplosion(o);
            OCmd = Cycle.DeleteObjectAndContinue;
          }
        }
        if (p.ProjectileType !== 2) PCmd = Cycle.DeleteObjectAndContinue;
        if (OCmd === Cycle.DeleteObjectAndContinue) PCmd = breakAfter(PCmd);
      }
      return PCmd;
    });
    return OCmd;
  });
  forEachPair(world.SpaceObjectList, (a, b) => {
    let cmd = PairCycle.Continue;
    if (!((needCheckCollision(b) || needCheckCollision(a))
      && sphereSphereCollision(a.Radius, a.Location, b.Radius, b.Location, b.PrevLocation)
      && obbObbCollision(a.OBB.Box, a.OBB.Location, a.Location, a.CurrentRotationMat, b.OBB.Box, b.OBB.Location, b.Location, b.CurrentRotationMat))) return cmd;
    if ((a.ObjectType === ObjectType.BasePart && b.ObjectType === ObjectType.SpaceDebris)
      || (a.ObjectType === ObjectType.SpaceDebris && b.ObjectType === ObjectType.BasePart)) {
      if (a.ObjectType === ObjectType.SpaceDebris) rotatePoint(a.Orientation, new Vec3(0, 180, 0));
      if (b.ObjectType === ObjectType.SpaceDebris) rotatePoint(b.Orientation, new Vec3(0, 180, 0));
      return cmd;
    }
    if (b.ObjectType !== ObjectType.SpaceDebris || a.ObjectType !== ObjectType.SpaceDebris) {
      if (a.ObjectType === ObjectType.BasePart && checkHitBBMeshCollision(b, a) < 0) return cmd;
      if (b.ObjectType === ObjectType.BasePart && checkHitBBMeshCollision(a, b) < 0) return cmd;
      if (needCheckCollision(b) && (b.ObjectType === ObjectType.SmallAsteroid || b.ObjectType === ObjectType.SpaceDebris)) {
        SetupSpaceExplosion(b);
        cmd = PairCycle.DeleteSecondObjectAndContinue;
      }
      if (needCheckCollision(a) && (a.ObjectType === ObjectType.SmallAsteroid || a.ObjectType === ObjectType.SpaceDebris)) {
        SetupSpaceExplosion(a);
        cmd = cmd === PairCycle.DeleteSecondObjectAndContinue ? PairCycle.DeleteBothObjectsAndContinue : PairCycle.DeleteFirstObjectAndContinue;
      }
    }
    return cmd;
  });
  forEachPair(world.ProjectileList, (a, b) => {
    let cmd = PairCycle.Continue;
    if (!objectsStatusFoe(a.ObjectStatus, b.ObjectStatus)) return cmd;
    const m1 = a.ProjectileType === 1 || a.ProjectileType === 4;
    const m2 = b.ProjectileType === 1 || b.ProjectileType === 4;
    const blow = (p: Projectile): void => {
      p.Speed = 0;
      CreateBulletExplosion(null, p, -p.Num, p.Location, p.Speed);
    };
    if (m1 && m2) {
      if (sphereSphereCollision(a.Radius, a.Location, b.Radius, b.Location, b.PrevLocation)
        && sphereAabbCollision(a.AABB, a.Location, b.Radius, b.Location, b.PrevLocation)
        && sphereObbCollision(a.OBB.Box, a.OBB.Location, a.Location, a.CurrentRotationMat, b.Radius, b.Location, b.PrevLocation)
        && obbObbCollision(a.OBB.Box, a.OBB.Location, a.Location, a.CurrentRotationMat, b.OBB.Box, b.OBB.Location, b.Location, b.CurrentRotationMat)) {
        blow(a);
        cmd = PairCycle.DeleteFirstObjectAndContinue;
        blow(b);
        cmd = PairCycle.DeleteBothObjectsAndContinue;
      }
    } else if (m1 && b.ProjectileType === 2) {
      if (sphereObbCollision(b.OBB.Box, b.OBB.Location, b.Location, b.CurrentRotationMat, a.Radius, a.Location, a.PrevLocation)
        && obbObbCollision(a.OBB.Box, a.OBB.Location, a.Location, a.CurrentRotationMat, b.OBB.Box, b.OBB.Location, b.Location, b.CurrentRotationMat)) {
        blow(a);
        cmd = PairCycle.DeleteFirstObjectAndContinue;
      }
    } else if (m2 && a.ProjectileType === 2) {
      if (sphereObbCollision(a.OBB.Box, a.OBB.Location, a.Location, a.CurrentRotationMat, b.Radius, b.Location, b.PrevLocation)
        && obbObbCollision(a.OBB.Box, a.OBB.Location, a.Location, a.CurrentRotationMat, b.OBB.Box, b.OBB.Location, b.Location, b.CurrentRotationMat)) {
        blow(b);
        cmd = PairCycle.DeleteSecondObjectAndContinue;
      }
    } else if (m1) {
      if (sphereSphereCollision(a.Radius, a.Location, b.Radius, b.Location, b.PrevLocation)
        && sphereAabbCollision(a.AABB, a.Location, b.Radius, b.Location, b.PrevLocation)
        && sphereObbCollision(a.OBB.Box, a.OBB.Location, a.Location, a.CurrentRotationMat, b.Radius, b.Location, b.PrevLocation)) {
        blow(a);
        cmd = PairCycle.DeleteFirstObjectAndContinue;
      }
    } else if (m2) {
      if (sphereSphereCollision(b.Radius, b.Location, a.Radius, a.Location, a.PrevLocation)
        && sphereAabbCollision(b.AABB, b.Location, a.Radius, a.Location, a.PrevLocation)
        && sphereObbCollision(b.OBB.Box, b.OBB.Location, b.Location, b.CurrentRotationMat, a.Radius, a.Location, a.PrevLocation)) {
        blow(b);
        cmd = PairCycle.DeleteSecondObjectAndContinue;
      }
    }
    return cmd;
  });
}
