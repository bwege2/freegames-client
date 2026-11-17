// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/game/
// game_player_ship.cpp: the player's ship (mouse and keyboard steering, the weapon groups, energy,
// shields and deflector, the warnings). Changed for the browser by the freegames project, 2026.
import { Vec3, fRand0, vwSqrtf } from '../core/math.ts';
import { type ParticleSystem, ParticleCreationType, createParticleSystem, alive } from '../core/particles.ts';
import { sphereAabbCollision, sphereObbCollision, sphereSphereCollision } from '../core/collision.ts';
import { getCameraLocation, setCameraLocation } from '../core/camera.ts';
import { ObjectStatus, ObjectType, Shake } from '../object3d/object3d.ts';
import { world, playerFighter } from '../object3d/world.ts';
import { ReleaseSpaceShip } from '../object3d/spaceship.ts';
import {
  CreateEarthSpaceFighter, GetEngineAcceleration, GetEnginePower, GetEngineRotatePower, SetEarthSpaceFighterArmor,
  SetEarthSpaceFighterEngine, SetEarthSpaceFighterWeapon,
} from '../object3d/earthfighter.ts';
import { CreateSpaceExplosion } from '../object3d/explosion.ts';
import { GS } from '../object3d/collisions.ts';
import { G, MenuSFX, MusicTheme, VoicePhrase, audio } from './globals.ts';
import { Cur, GameConfig } from './config.ts';
import { GetCameraCoveredDistance } from './camera.ts';
import { vw_GetKeyStatus, vw_GetMouseButtonStatus, vw_GetMousePos, vw_GetText } from '../engine/core.ts';
import { RGB, vw_DrawText, vw_SetFontSize, vw_TextWidth } from '../engine/draw2d.ts';

export const PS = {
  LastMouseX: -1,
  LastMouseY: -1,
  MoveFB: 0,
  MoveLR: 0,
  CurrentPlayerShipEnergy: 0,
  Shild1: null as ParticleSystem | null,
  Shild2: null as ParticleSystem | null,
  ShildRadius: 0,
  VoiceWarningCollisionDetected: 0,
  VoiceMissileDetected: 0,
  VoiceMissileDetectedStatus: false,
  VoiceWeaponMalfunction: 0,
  SoundLowLife: 0,
  CurrentMovementVel: new Vec3(),
  PrimaryGroupCurrentFireWeaponNum: 1,
  PrimaryGroupCurrentFireWeaponDelay: 0,
  SecondaryGroupCurrentFireWeaponNum: 1,
  SecondaryGroupCurrentFireWeaponDelay: 0,
  /** game.cpp's flashing values and the menu fade */
  CurrentAlert2: 1,
  CurrentAlert3: 1,
  GameContentTransp: 0,
  GameMissionCompleteStatus: false,
  /** SetupMissionFailedText (ui/game/text.cpp) */
  onPlayerDead: (): void => {},
};

export function GetShipMaxEnergy(n: number): number {
  return [0, 100, 200, 400, 800][n] ?? -1;
}
export function GetShipRechargeEnergy(n: number): number {
  return [0, 20, 50, 130, 250][n] ?? -1;
}
export function GetShipProtectionSystemEnergyUse(n: number): number {
  return [0, 10, 0, 50, 100][n] ?? 0;
}
export function GetShipEngineSystemEnergyUse(n: number): number {
  return [0, 5, 10, 30, 60][n] ?? 0;
}

function shieldSystem(s: ParticleSystem, c: [number, number, number], a: [number, number], size: [number, number, number],
  pps: number, magnet: number, loc: Vec3 | null): void {
  s.ColorStart = { r: c[0], g: c[1], b: c[2] };
  s.ColorEnd = { r: c[0], g: c[1], b: c[2] };
  s.AlphaStart = a[0];
  s.AlphaEnd = a[1];
  s.SizeStart = size[0];
  s.SizeVar = size[1];
  s.SizeEnd = size[2];
  s.Speed = 0;
  s.SpeedOnCreation = -1;
  s.Theta = 360;
  s.Life = 1;
  s.ParticlesPerSec = pps;
  s.CreationType = ParticleCreationType.Sphere;
  s.CreationSize = new Vec3(PS.ShildRadius, 0.05 * PS.ShildRadius, PS.ShildRadius);
  s.DeadZone = PS.ShildRadius - 0.05;
  s.AlphaShowHide = true;
  s.IsMagnet = true;
  s.MagnetFactor = magnet;
  s.Texture = 'gfx/flare1.tga';
  s.Direction = new Vec3(0, 0, -1);
  if (loc) s.SetStartLocation(loc);
}

export function InitGamePlayerShip(): void {
  PS.VoiceMissileDetected = 0;
  PS.VoiceMissileDetectedStatus = false;
  PS.VoiceWeaponMalfunction = 0;
  PS.SoundLowLife = 0;
  const prof = GameConfig().Profile[Cur.CurrentProfile];
  const tmpPenalty = G.GameEnemyArmorPenalty;
  G.GameEnemyArmorPenalty = 1;
  const p = CreateEarthSpaceFighter(prof.ShipHull);
  world.PlayerFighter = p;
  p.ShipShake.push(new Shake(new Vec3(0, 0, 1), 0, 0.035, () => fRand0() * 0.1));
  p.ObjectStatus = ObjectStatus.Player;
  p.ArmorInitialStatus *= prof.ShipHullUpgrade;
  p.ArmorCurrentStatus = prof.ArmorStatus;
  p.ShowStatus = false;
  for (let i = 0; i < p.WeaponSlots.length; i++) {
    if (prof.Weapon[i] !== 0 && SetEarthSpaceFighterWeapon(p, i + 1, prof.Weapon[i])) {
      const w = alive(p.WeaponSlots[i].Weapon);
      if (w) w.Ammo = prof.WeaponAmmo[i];
      p.WeaponSlots[i].YAngle = -prof.WeaponSlotYAngle[i];
    }
  }
  SetEarthSpaceFighterEngine(p, G.GameEngineSystem);
  SetEarthSpaceFighterArmor(p, prof.ShipHullUpgrade - 1);
  G.GameEnemyArmorPenalty = tmpPenalty;
  const w2 = p.Width / 2, l2 = p.Length / 2;
  PS.ShildRadius = vwSqrtf(w2 * w2 + l2 * l2);
  GS.ShildEnergyStatus = 0;
  GS.ShildStartHitStatus = 0;
  const at = p.Location.add(p.OBB.Location);
  if (prof.AdvancedProtectionSystem === 3) {
    PS.Shild1 = createParticleSystem();
    shieldSystem(PS.Shild1, [0.2, 0.5, 0.1], [1, 0], [0.6, 0.1, 0.1], Math.trunc(40 * PS.ShildRadius), -3, at);
    GS.ShildStartHitStatus = 100;
    GS.ShildEnergyStatus = 1;
  }
  if (prof.AdvancedProtectionSystem === 4) {
    PS.Shild1 = createParticleSystem();
    shieldSystem(PS.Shild1, [0.5, 0.5, 1], [0.5, 0], [0.4, 0.1, 0.2], Math.trunc(40 * PS.ShildRadius), 2.5, at);
    PS.Shild2 = createParticleSystem();
    shieldSystem(PS.Shild2, [0.5, 0.5, 1], [0.7, 0.1], [0.5, 0.1, 0.3], Math.trunc(5 * PS.ShildRadius), 20, null);
    PS.Shild2.AlphaShowHide = false;
    GS.ShildStartHitStatus = 150;
    GS.ShildEnergyStatus = 1;
  }
  PS.CurrentPlayerShipEnergy = GetShipMaxEnergy(G.GamePowerSystem);
  PS.LastMouseX = -1;
  PS.LastMouseY = -1;
  PS.MoveFB = 0;
  PS.MoveLR = 0;
  PS.CurrentMovementVel = new Vec3();
  PS.PrimaryGroupCurrentFireWeaponNum = 1;
  PS.PrimaryGroupCurrentFireWeaponDelay = 0;
  PS.SecondaryGroupCurrentFireWeaponNum = 1;
  PS.SecondaryGroupCurrentFireWeaponDelay = 0;
}

function warning(text: string, count: number, color: { r: number; g: number; b: number }): void {
  vw_SetFontSize(24);
  const t = vw_GetText(text);
  const x = Math.trunc((GameConfig().InternalWidth - vw_TextWidth(t)) / 2);
  vw_DrawText(x, 720 - 40 * count, 0, 0, 1, color, PS.CurrentAlert3, t);
  vw_SetFontSize(16);
}

export function GamePlayerShip(): void {
  const p = playerFighter();
  if (!p) return;
  const C = GameConfig();
  const prof = C.Profile[Cur.CurrentProfile];
  if (p.ArmorCurrentStatus <= 0) {
    CreateSpaceExplosion(p, 31, p.Location, p.Speed + 10, GS.PlayerDeadObjectPieceNum);
    audio.playMusicTheme(MusicTheme.FAILED, 2000, 2000);
    ReleaseSpaceShip(p);
    PS.onPlayerDead();
    return;
  }
  if (PS.GameContentTransp < 0.99 && !PS.GameMissionCompleteStatus) {
    let count = 0;
    let targeted = false;
    for (const pr of world.ProjectileList) {
      if (alive(pr.Target) === p && (pr.Num < 26 || pr.Num > 29)) targeted = true;
    }
    if (targeted) {
      if (!audio.isSoundAvailable(PS.VoiceMissileDetected) && !PS.VoiceMissileDetectedStatus) {
        PS.VoiceMissileDetected = audio.playVoicePhrase(VoicePhrase.MissileDetected, 1);
        PS.VoiceMissileDetectedStatus = true;
      }
      warning('Missile Detected', count, RGB.orange);
      count++;
    } else if (PS.CurrentAlert3 === 1) {
      PS.VoiceMissileDetectedStatus = false;
    } else if (PS.VoiceMissileDetectedStatus) {
      warning('Missile Detected', count, RGB.orange);
      count++;
    }
    let collision = false;
    for (const o of world.SpaceObjectList) {
      if (o.ObjectType === ObjectType.BigAsteroid
        && sphereSphereCollision(p.Radius, p.Location, o.Radius, o.Location, o.PrevLocation)
        && sphereAabbCollision(o.AABB, o.Location, p.Radius, p.Location, p.PrevLocation)) {
        collision = true;
        break;
      }
    }
    for (const g of world.GroundObjectList) {
      if (g.ObjectType === ObjectType.CivilianBuilding
        && sphereSphereCollision(p.Radius, p.Location, g.Radius, g.Location, g.PrevLocation)
        && sphereAabbCollision(g.AABB, g.Location, p.Radius, p.Location, p.PrevLocation)
        && sphereObbCollision(g.OBB.Box, g.OBB.Location, g.Location, g.CurrentRotationMat, p.Radius, p.Location, p.PrevLocation)) {
        collision = true;
        break;
      }
    }
    if (collision) {
      if (!audio.isSoundAvailable(PS.VoiceWarningCollisionDetected)) PS.VoiceWarningCollisionDetected = audio.playVoicePhrase(VoicePhrase.Warning, 1);
      warning('Collision Course Detected', count, RGB.red);
      count++;
    }
    for (const s of p.WeaponSlots) {
      const w = alive(s.Weapon);
      if (w && s.SetFire && w.Ammo <= 0 && !audio.isSoundAvailable(PS.VoiceWeaponMalfunction)) {
        PS.VoiceWeaponMalfunction = audio.playVoicePhrase(VoicePhrase.WeaponMalfunction, 1);
      }
    }
    if (p.ArmorCurrentStatus < p.ArmorInitialStatus / 10 && !audio.isSoundAvailable(PS.SoundLowLife)) {
      PS.SoundLowLife = audio.playMenuSFX(MenuSFX.WarningLowLife, 1);
    }
  }
  if (PS.GameContentTransp < 1) {
    let NeedSkip = false;
    if (C.MouseControl) {
      const [X, Y] = vw_GetMousePos();
      if (PS.LastMouseX === -1 && PS.LastMouseY === -1) {
        PS.LastMouseX = X;
        PS.LastMouseY = Y;
      } else {
        if (X !== PS.LastMouseX || Y !== PS.LastMouseY) {
          const Koef = 0.9 + C.ControlSensivity / 10;
          const AWw2 = C.InternalWidth / 2, AHw2 = C.InternalHeight / 2;
          PS.MoveFB += (-(Y - PS.LastMouseY) / AHw2) * Koef;
          PS.MoveLR += ((X - PS.LastMouseX) / AWw2) * Koef;
          NeedSkip = true;
        }
        PS.LastMouseX = X;
        PS.LastMouseY = Y;
      }
    }
    if (!NeedSkip) {
      const k = 2 * (C.ControlSensivity / 10) * p.TimeDelta;
      if (vw_GetKeyStatus(C.KeyBoardDown)) PS.MoveFB -= k;
      if (vw_GetKeyStatus(C.KeyBoardUp)) PS.MoveFB += k;
      if (vw_GetKeyStatus(C.KeyBoardLeft)) PS.MoveLR -= k;
      if (vw_GetKeyStatus(C.KeyBoardRight)) PS.MoveLR += k;
    }
    PS.MoveFB = Math.max(-1, Math.min(1, PS.MoveFB));
    PS.MoveLR = Math.max(-1, Math.min(1, PS.MoveLR));
    let end: Vec3;
    if (C.InternalWidth === 1024) {
      end = new Vec3(-(73.15 - p.Width / 2 + PS.MoveFB * (20.05 - p.Length / 6)) * PS.MoveLR, 0, (46 - p.Length / 2) * PS.MoveFB);
    } else {
      end = new Vec3(-(70 - p.Width / 2 + PS.MoveFB * (23.2 - p.Length / 6)) * PS.MoveLR, 0, (46 - p.Length / 2) * PS.MoveFB);
    }
    end.addTo(GetCameraCoveredDistance());
    if (G.GameEngineSystem !== 0) {
      G.PlayerFighterLeftEng = false;
      G.PlayerFighterRightEng = false;
      if (Math.trunc(p.Location.x) > Math.trunc(end.x)) G.PlayerFighterLeftEng = true;
      else if (Math.trunc(p.Location.x) < Math.trunc(end.x)) G.PlayerFighterRightEng = true;
      const dir = end.sub(p.Location);
      const dist = dir.Length();
      dir.Normalize();
      let sim = dist;
      const arcade = prof.SpaceShipControlMode === 1;
      const lim = arcade ? 30 : p.MaxSpeed;
      if (sim > lim) sim = lim;
      sim = sim * (arcade ? 4 : p.MaxAcceler / 14) * p.TimeDelta;
      PS.CurrentMovementVel = dir.mul(sim);
      let max = PS.CurrentMovementVel.Length();
      PS.CurrentMovementVel.Normalize();
      if (max > lim) max = lim;
      PS.CurrentMovementVel = PS.CurrentMovementVel.mul(max);
    }
    const v = p.Location.add(PS.CurrentMovementVel);
    v.y = 0;
    p.SetLocationArcadePlayer(v);
    if (C.InternalWidth === 1024) {
      const Dev = 14.55;
      let diff = p.Location.x / 3.5;
      if (p.Location.x < 0) {
        if (diff < -Dev) diff = -Dev;
      } else if (diff > Dev) {
        diff = Dev;
      }
      const cl = getCameraLocation();
      cl.x = diff;
      setCameraLocation(cl);
    }
  }
  if (PS.GameContentTransp < 0.5 && p.WeaponSlots.length) {
    let PrimCount = 0, PrimTime = 0, SecCount = 0, SecTime = 0;
    PS.PrimaryGroupCurrentFireWeaponDelay -= p.TimeDelta;
    PS.SecondaryGroupCurrentFireWeaponDelay -= p.TimeDelta;
    for (let i = 0; i < p.WeaponSlots.length; i++) {
      if (prof.Weapon[i] === 0) continue;
      const w = alive(p.WeaponSlots[i].Weapon);
      if (prof.WeaponControl[i] === 1 || prof.WeaponControl[i] === 3) {
        if (w) { PrimCount++; PrimTime += w.NextFireTime; }
      }
      if (prof.WeaponControl[i] === 2 || prof.WeaponControl[i] === 3) {
        if (w) { SecCount++; SecTime += w.NextFireTime; }
      }
    }
    let PrimNum = 0, SecNum = 0;
    const primary = (i: number): void => {
      if (prof.PrimaryWeaponFireMode === 1) {
        p.WeaponSlots[i].SetFire = true;
      } else {
        PrimNum++;
        if (PS.PrimaryGroupCurrentFireWeaponNum === PrimNum && PS.PrimaryGroupCurrentFireWeaponDelay <= 0) {
          PS.PrimaryGroupCurrentFireWeaponDelay = PrimTime / (PrimCount * PrimCount);
          p.WeaponSlots[i].SetFire = true;
          PS.PrimaryGroupCurrentFireWeaponNum++;
          if (PS.PrimaryGroupCurrentFireWeaponNum > PrimCount) PS.PrimaryGroupCurrentFireWeaponNum = 1;
        }
      }
    };
    const secondary = (i: number): void => {
      if (prof.SecondaryWeaponFireMode === 1) {
        p.WeaponSlots[i].SetFire = true;
      } else {
        SecNum++;
        if (PS.SecondaryGroupCurrentFireWeaponNum === SecNum && PS.SecondaryGroupCurrentFireWeaponDelay <= 0) {
          PS.SecondaryGroupCurrentFireWeaponDelay = SecTime / (SecCount * SecCount);
          p.WeaponSlots[i].SetFire = true;
          PS.SecondaryGroupCurrentFireWeaponNum++;
          if (PS.SecondaryGroupCurrentFireWeaponNum > SecCount) PS.SecondaryGroupCurrentFireWeaponNum = 1;
        }
      }
    };
    for (let i = 0; i < p.WeaponSlots.length; i++) {
      if (prof.Weapon[i] === 0) continue;
      p.WeaponSlots[i].SetFire = false;
      const pf = prof.WeaponControl[i] === 1 || prof.WeaponControl[i] === 3;
      const sf = prof.WeaponControl[i] === 2 || prof.WeaponControl[i] === 3;
      if (C.MouseControl) {
        if (pf && vw_GetMouseButtonStatus(C.MousePrimary)) primary(i);
        if (sf && vw_GetMouseButtonStatus(C.MouseSecondary)) secondary(i);
        if (prof.WeaponAltControl[i] === 2 && vw_GetMouseButtonStatus(prof.WeaponAltControlData[i])) p.WeaponSlots[i].SetFire = true;
      }
      if (pf && vw_GetKeyStatus(C.KeyBoardPrimary)) primary(i);
      if (sf && vw_GetKeyStatus(C.KeyBoardSecondary)) secondary(i);
      if (prof.WeaponAltControl[i] === 1 && vw_GetKeyStatus(prof.WeaponAltControlData[i])) p.WeaponSlots[i].SetFire = true;
    }
  }
  const engineUse = GetShipEngineSystemEnergyUse(G.GameEngineSystem) * p.TimeDelta;
  if (G.GameSpaceShipControlMode !== 1) {
    const all = [...p.Engines, ...p.EnginesLeft, ...p.EnginesRight];
    if (PS.CurrentPlayerShipEnergy < engineUse) {
      p.MaxSpeed = 0;
      p.MaxAcceler = 0;
      p.MaxSpeedRotate = 0;
      for (const e of all) { const g = alive(e); if (g) g.IsSuppressed = true; }
    } else {
      p.MaxSpeed = GetEnginePower(G.GameEngineSystem);
      p.MaxAcceler = GetEngineAcceleration(G.GameEngineSystem);
      p.MaxSpeedRotate = GetEngineRotatePower(G.GameEngineSystem);
      for (const e of all) { const g = alive(e); if (g) g.IsSuppressed = false; }
      PS.CurrentPlayerShipEnergy -= engineUse;
    }
  }
  for (let i = 0; i < p.WeaponSlots.length; i++) {
    if (prof.Weapon[i] === 0) continue;
    const w = alive(p.WeaponSlots[i].Weapon);
    if (w && w.CurrentEnergyAccumulated < w.EnergyUse) {
      if (PS.CurrentPlayerShipEnergy < w.EnergyUse) {
        w.LastFireTime += p.TimeDelta;
        const f = alive(w.Fire);
        if (f) f.IsSuppressed = true;
      } else {
        w.CurrentEnergyAccumulated = w.EnergyUse;
        PS.CurrentPlayerShipEnergy -= w.EnergyUse;
      }
    }
  }
  if (PS.CurrentPlayerShipEnergy >= engineUse) {
    const use = GetShipProtectionSystemEnergyUse(G.GameAdvancedProtectionSystem) * p.TimeDelta;
    switch (G.GameAdvancedProtectionSystem) {
      case 1:
        if (p.ArmorCurrentStatus < p.ArmorInitialStatus) {
          PS.CurrentPlayerShipEnergy -= use;
          p.ArmorCurrentStatus += (p.ArmorInitialStatus / 200) * p.TimeDelta;
          if (p.ArmorCurrentStatus > p.ArmorInitialStatus) p.ArmorCurrentStatus = p.ArmorInitialStatus;
        }
        break;
      case 3:
      case 4:
        if (GS.ShildEnergyStatus < 1) {
          PS.CurrentPlayerShipEnergy -= use;
          GS.ShildEnergyStatus += (G.GameAdvancedProtectionSystem === 3 ? 0.02 : 0.03) * p.TimeDelta;
          if (GS.ShildEnergyStatus > 1) GS.ShildEnergyStatus = 1;
        }
        break;
    }
  }
  const s1 = alive(PS.Shild1);
  if (s1) {
    const l = p.Location.add(p.OBB.Location);
    s1.MoveSystem(l);
    s1.SetStartLocation(l);
    s1.RotateSystemAndParticlesByAngle(p.Rotation);
    s1.ParticlesPerSec = Math.trunc(40 * GS.ShildEnergyStatus * PS.ShildRadius);
  }
  const s2 = alive(PS.Shild2);
  if (s2) {
    const l = p.Location.add(p.OBB.Location);
    s2.MoveSystem(l);
    s2.SetStartLocation(l);
    s2.RotateSystemAndParticlesByAngle(p.Rotation);
    s2.ParticlesPerSec = Math.trunc(5 * GS.ShildEnergyStatus * PS.ShildRadius);
  }
  PS.CurrentPlayerShipEnergy += GetShipRechargeEnergy(G.GamePowerSystem) * p.TimeDelta;
  if (PS.CurrentPlayerShipEnergy > GetShipMaxEnergy(G.GamePowerSystem)) PS.CurrentPlayerShipEnergy = GetShipMaxEnergy(G.GamePowerSystem);
}
