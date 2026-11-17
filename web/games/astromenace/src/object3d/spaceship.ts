// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/object3d/space_ship/
// space_ship.h and space_ship.cpp: the flying part every ship shares (speeds, turning, weapon groups,
// engines, aiming). Changed for the browser by the freegames project, 2026.
import { Vec3, m33CalcPoint, rotatePoint, clamp } from '../core/math.ts';
import { type ParticleSystem, alive, releaseParticleSystem } from '../core/particles.ts';
import { Object3D, ObjectStatus, type Shake } from './object3d.ts';
import { world, releaseFrom } from './world.ts';
import { type Weapon, ReleaseWeaponLazy } from './weapon.ts';
import { FindTargetLocationWithPrediction, GetTurretOnTargetOrientation, GetWeaponOnTargetOrientation } from './targeting.ts';
import { GetCameraMovementDirection } from '../game/camera.ts';
import { G } from '../game/globals.ts';
import { ShipWeaponSlotAngle } from './earthfighter_data.ts';

export class ShipWeaponSlot {
  SetFire = false;
  Weapon: Weapon | null = null;
  Location = new Vec3();
  Type = 1;
  YAngle = 0;
  constructor(weaponOrType: Weapon | number | null = null, location = new Vec3()) {
    if (typeof weaponOrType === 'number') this.Type = weaponOrType;
    else this.Weapon = weaponOrType;
    this.Location = location.clone();
  }
  /** ~sShipWeaponSlot */
  release(): void {
    ReleaseWeaponLazy(this.Weapon);
  }
}

/** GetShipWeaponSlotAngle */
export function GetShipWeaponSlotAngle(ShipNum: number, SlotNum: number): [number, number] {
  return ShipWeaponSlotAngle[ShipNum]?.[SlotNum] ?? [0, 0];
}

export class SpaceShip extends Object3D {
  Velocity = new Vec3();
  NeedRotate = new Vec3();
  RotationSpeed = new Vec3(1, 1, 1);
  MaxSpeed = 0;
  MaxAcceler = 0;
  MaxSpeedRotate = 0;
  Speed = 0;
  NeedSpeed = 0;
  Acceler = 0;
  NeedAcceler = 1;
  SpeedLR = 0;
  NeedSpeedLR = 0;
  AccelerLR = 0;
  NeedAccelerLR = 1;
  SpeedUD = 0;
  NeedSpeedUD = 0;
  AccelerUD = 0;
  NeedAccelerUD = 1;
  SpeedByCamFB = 0;
  NeedSpeedByCamFB = 0;
  AccelerByCamFB = 0;
  NeedAccelerByCamFB = 1;
  SpeedByCamLR = 0;
  NeedSpeedByCamLR = 0;
  AccelerByCamLR = 0;
  NeedAccelerByCamLR = 1;
  SpeedByCamUD = 0;
  NeedSpeedByCamUD = 0;
  AccelerByCamUD = 0;
  NeedAccelerByCamUD = 1;
  MoveForward = 0;
  MoveBackward = 0;
  MoveLeft = 0;
  MoveRight = 0;
  MoveUp = 0;
  MoveDown = 0;
  ShipShake: Shake[] = [];
  WeaponSlots: ShipWeaponSlot[] = [];
  WeaponFireType = 2;
  WeaponGroupCurrentFireNum = -1;
  WeaponGroupCurrentFireDelay = 0;
  BossWeaponSlots: ShipWeaponSlot[] = [];
  BossWeaponFireType = 2;
  BossWeaponGroupCurrentFireNum = -1;
  BossWeaponGroupCurrentFireDelay = 0;
  FlareWeaponSlots: ShipWeaponSlot[] = [];
  EngineDestroyType = false;
  Engines: (ParticleSystem | null)[] = [];
  EnginesLocation: Vec3[] = [];
  EnginesLeft: (ParticleSystem | null)[] = [];
  EnginesLeftLocation: Vec3[] = [];
  EnginesRight: (ParticleSystem | null)[] = [];
  EnginesRightLocation: Vec3[] = [];

  /** ~cSpaceShip, then the members' destructors (the weapon slots release their weapons lazily) */
  Destroy(): void {
    for (const list of [this.Engines, this.EnginesLeft, this.EnginesRight]) {
      for (const e of list) {
        const g = alive(e);
        if (!g) continue;
        if (!this.EngineDestroyType) {
          g.IsSuppressed = true;
          g.DestroyIfNoParticles = true;
        } else {
          releaseParticleSystem(g);
        }
      }
    }
    for (const s of this.WeaponSlots) s.release();
    for (const s of this.BossWeaponSlots) s.release();
    for (const s of this.FlareWeaponSlots) s.release();
  }

  private moveWeapons(l: Vec3): void {
    for (const slots of [this.WeaponSlots, this.BossWeaponSlots, this.FlareWeaponSlots]) {
      for (const s of slots) {
        const w = alive(s.Weapon);
        if (w) w.SetLocation(s.Location.add(l));
      }
    }
  }

  private moveEngines(l: Vec3): void {
    const pairs: [(ParticleSystem | null)[], Vec3[]][] = [[this.Engines, this.EnginesLocation], [this.EnginesLeft, this.EnginesLeftLocation], [this.EnginesRight, this.EnginesRightLocation]];
    for (const [list, locs] of pairs) {
      for (let i = 0; i < list.length; i++) {
        const g = alive(list[i]);
        if (g) {
          g.MoveSystem(l.add(locs[i]));
          g.SetStartLocation(locs[i].add(l));
        }
      }
    }
  }

  SetLocation(NewLocation: Vec3): void {
    super.SetLocation(NewLocation);
    this.moveWeapons(NewLocation);
    this.moveEngines(NewLocation);
  }

  SetLocationArcadePlayer(NewLocation: Vec3): void {
    super.SetLocation(NewLocation);
    this.moveWeapons(NewLocation);
    this.moveEngines(NewLocation);
  }

  SetRotation(NewRotation: Vec3): void {
    super.SetRotation(NewRotation);
    for (const slots of [this.WeaponSlots, this.BossWeaponSlots, this.FlareWeaponSlots]) {
      for (const s of slots) {
        m33CalcPoint(s.Location, this.OldInvRotationMat);
        m33CalcPoint(s.Location, this.CurrentRotationMat);
        const w = alive(s.Weapon);
        if (w) {
          w.SetRotation(NewRotation);
          w.SetLocation(this.Location.add(s.Location));
        }
      }
    }
    for (let i = 0; i < this.Engines.length; i++) {
      m33CalcPoint(this.EnginesLocation[i], this.OldInvRotationMat);
      m33CalcPoint(this.EnginesLocation[i], this.CurrentRotationMat);
      const g = alive(this.Engines[i]);
      if (g) {
        if (g.SpeedOnCreation === -1) {
          g.MoveSystem(this.EnginesLocation[i].add(this.Location));
          g.SetStartLocation(this.EnginesLocation[i].add(this.Location));
          g.RotateSystemAndParticlesByAngle(this.Rotation);
        } else {
          g.MoveSystemLocation(this.EnginesLocation[i].add(this.Location));
          g.RotateSystemByAngle(this.Rotation);
        }
      }
    }
    const pairs: [(ParticleSystem | null)[], Vec3[]][] = [[this.EnginesLeft, this.EnginesLeftLocation], [this.EnginesRight, this.EnginesRightLocation]];
    for (const [list, locs] of pairs) {
      for (let i = 0; i < list.length; i++) {
        m33CalcPoint(locs[i], this.OldInvRotationMat);
        m33CalcPoint(locs[i], this.CurrentRotationMat);
        const g = alive(list[i]);
        if (g) {
          g.MoveSystemLocation(locs[i].add(this.Location));
          g.SetStartLocation(locs[i].add(this.Location));
          g.RotateSystemByAngle(this.Rotation);
        }
      }
    }
  }

  private suppress(list: (ParticleSystem | null)[], v: boolean): void {
    for (const e of list) {
      const g = alive(e);
      if (g) g.IsSuppressed = v;
    }
  }

  /** the speed regulation the original repeats for all six speeds: returns [speed, needSpeed, acceler, sign] */
  private regulate(need: number, speed: number, needAcceler: number): [number, number, number, number] {
    let sign = need < 0 ? -1 : 1;
    if (sign === 1) need = clamp(need, 0, this.MaxSpeed);
    else need = clamp(need, -this.MaxSpeed, 0);
    if (sign === 1) {
      if (need < speed) sign = -1;
    } else if (need > speed) {
      sign = 1;
    }
    const acc = sign * this.MaxAcceler * needAcceler;
    speed = speed + acc * this.TimeDelta;
    if (sign === 1) {
      if (need <= speed) {
        speed = need;
        need = 0;
      }
    } else if (need >= speed) {
      speed = need;
      need = 0;
    }
    return [speed, need, acc, sign];
  }

  /** the alternate fire of a weapon group (WeaponFireType 2) */
  private groupFire(slots: ShipWeaponSlot[], Time: number, boss: boolean): void {
    let PrimCount = 0;
    let PrimTime = 0;
    let FirstWeapon = slots.length;
    let LastWeapon = 0;
    if (boss) this.BossWeaponGroupCurrentFireDelay -= this.TimeDelta;
    else this.WeaponGroupCurrentFireDelay -= this.TimeDelta;
    for (let i = 0; i < slots.length; i++) {
      const w = alive(slots[i].Weapon);
      if (w) {
        PrimCount++;
        PrimTime += w.NextFireTime;
        if (FirstWeapon > i) FirstWeapon = i;
        if (LastWeapon < i) LastWeapon = i;
      }
    }
    let num = boss ? this.BossWeaponGroupCurrentFireNum : this.WeaponGroupCurrentFireNum;
    if (num === -1) num = FirstWeapon;
    for (let i = 0; i < slots.length; i++) {
      const delay = boss ? this.BossWeaponGroupCurrentFireDelay : this.WeaponGroupCurrentFireDelay;
      if (alive(slots[i].Weapon) && slots[i].SetFire && num === i && delay <= 0) {
        slots[i].Weapon!.WeaponFire(Time);
        const d = PrimTime / (PrimCount * PrimCount);
        if (boss) this.BossWeaponGroupCurrentFireDelay = d;
        else this.WeaponGroupCurrentFireDelay = d;
        num++;
        if (num > LastWeapon) num = FirstWeapon;
        if (!alive(slots[num]?.Weapon)) {
          for (;;) {
            num++;
            if (num > LastWeapon) num = FirstWeapon;
            if (alive(slots[num]?.Weapon)) break;
          }
        }
      }
    }
    if (boss) this.BossWeaponGroupCurrentFireNum = num;
    else this.WeaponGroupCurrentFireNum = num;
  }

  Update(Time: number): boolean {
    if (!super.Update(Time)) return false;
    const ts = this.TimeSheetList[0];
    if (ts && !ts.InUse) {
      ts.InUse = true;
      this.NeedSpeed = ts.Speed;
      this.NeedAcceler = ts.Acceler;
      this.NeedSpeedLR = ts.SpeedLR;
      this.NeedAccelerLR = ts.AccelerLR;
      this.NeedSpeedUD = ts.SpeedUD;
      this.NeedAccelerUD = ts.AccelerUD;
      this.NeedSpeedByCamFB = ts.SpeedByCamFB;
      this.NeedAccelerByCamFB = ts.AccelerByCamFB;
      this.NeedSpeedByCamLR = ts.SpeedByCamLR;
      this.NeedAccelerByCamLR = ts.AccelerByCamLR;
      this.NeedSpeedByCamUD = ts.SpeedByCamUD;
      this.NeedAccelerByCamUD = ts.AccelerByCamUD;
      this.NeedRotate = ts.Rotation.clone();
      this.RotationSpeed = ts.RotationAcceler.clone();
      if (ts.NeedSetAngle) this.SetRotation(ts.SetAngle);
      for (const s of this.WeaponSlots) if (alive(s.Weapon)) s.SetFire = ts.Fire;
      for (const s of this.BossWeaponSlots) if (alive(s.Weapon)) s.SetFire = ts.BossFire;
    }
    if (this.TimeDelta === 0) return true;
    if (this.FlareWeaponSlots.length) {
      let NeedFlare = false;
      for (const p of world.ProjectileList) {
        if (alive(p.Target) === this) {
          NeedFlare = true;
          p.Target = null;
        }
      }
      if (NeedFlare) {
        for (const s of this.FlareWeaponSlots) {
          const w = alive(s.Weapon);
          if (w) w.WeaponFire(Time);
        }
      }
    }
    if (this.ObjectStatus === ObjectStatus.Player) {
      if (this.MoveForward > 0 || this.MoveBackward > 0) this.NeedSpeed = this.MaxSpeed * this.MoveForward - this.MaxSpeed * this.MoveBackward;
      else this.NeedSpeed = 0;
      if (this.MoveLeft > 0 || this.MoveRight > 0) this.NeedRotate.y = this.MaxAcceler * this.MaxSpeed * this.MoveRight - this.MaxAcceler * this.MaxSpeed * this.MoveLeft;
      else this.NeedRotate.y = 0;
      if (this.MoveUp > 0 || this.MoveDown > 0) this.NeedRotate.x = this.MaxAcceler * this.MaxSpeed * this.MoveUp - this.MaxAcceler * this.MaxSpeed * this.MoveDown;
      else this.NeedRotate.x = 0;
    }
    if (this.ObjectStatus !== ObjectStatus.Player) {
      this.suppress(this.EnginesLeft, true);
      this.suppress(this.EnginesRight, true);
      const nr = this.NeedRotate;
      if (nr.x !== 0 || nr.y !== 0 || nr.z !== 0) {
        const tmp = new Vec3();
        const step = (axis: 'x' | 'y' | 'z'): void => {
          if (nr[axis] === 0) return;
          const sign = nr[axis] < 0 ? -1 : 1;
          tmp[axis] = sign * this.MaxSpeedRotate * this.RotationSpeed[axis] * this.TimeDelta;
          if (sign === 1) {
            if (tmp[axis] >= nr[axis]) {
              tmp[axis] = nr[axis];
              nr[axis] = 0;
            }
          } else if (tmp[axis] <= nr[axis]) {
            tmp[axis] = nr[axis];
            nr[axis] = 0;
          }
          if (nr[axis] !== 0) nr[axis] -= tmp[axis];
        };
        step('x');
        if (nr.y !== 0) {
          step('y');
          if (nr.y < 0) this.suppress(this.EnginesLeft, false);
          else this.suppress(this.EnginesRight, false);
        }
        step('z');
        this.SetRotation(tmp);
      }
    } else {
      this.suppress(this.EnginesLeft, !G.PlayerFighterLeftEng);
      this.suppress(this.EnginesRight, !G.PlayerFighterRightEng);
    }
    if (this.NeedSpeed !== 0 || (this.ObjectStatus === ObjectStatus.Player && this.Speed !== 0)) {
      let sign: number;
      [this.Speed, this.NeedSpeed, this.Acceler, sign] = this.regulate(this.NeedSpeed, this.Speed, this.NeedAcceler);
      if (sign === -1) {
        this.suppress(this.EnginesLeft, false);
        this.suppress(this.EnginesRight, false);
      }
    }
    if (this.NeedSpeedLR !== 0) [this.SpeedLR, this.NeedSpeedLR, this.AccelerLR] = this.regulate(this.NeedSpeedLR, this.SpeedLR, this.NeedAccelerLR);
    if (this.NeedSpeedUD !== 0) [this.SpeedUD, this.NeedSpeedUD, this.AccelerUD] = this.regulate(this.NeedSpeedUD, this.SpeedUD, this.NeedAccelerUD);
    if (this.NeedSpeedByCamFB !== 0) [this.SpeedByCamFB, this.NeedSpeedByCamFB, this.AccelerByCamFB] = this.regulate(this.NeedSpeedByCamFB, this.SpeedByCamFB, this.NeedAccelerByCamFB);
    if (this.NeedSpeedByCamLR !== 0) [this.SpeedByCamLR, this.NeedSpeedByCamLR, this.AccelerByCamLR] = this.regulate(this.NeedSpeedByCamLR, this.SpeedByCamLR, this.NeedAccelerByCamLR);
    if (this.NeedSpeedByCamUD !== 0) [this.SpeedByCamUD, this.NeedSpeedByCamUD, this.AccelerByCamUD] = this.regulate(this.NeedSpeedByCamUD, this.SpeedByCamUD, this.NeedAccelerByCamUD);
    if (this.WeaponSlots.length) {
      if (this.WeaponFireType === 1 || this.ObjectStatus === ObjectStatus.Player) {
        for (const s of this.WeaponSlots) {
          if (s.SetFire) {
            const w = alive(s.Weapon);
            if (w) w.WeaponFire(Time);
          }
        }
      } else {
        this.groupFire(this.WeaponSlots, Time, false);
      }
    }
    if (this.BossWeaponSlots.length) {
      if (this.BossWeaponFireType === 1) {
        for (const s of this.BossWeaponSlots) {
          if (s.SetFire) {
            const w = alive(s.Weapon);
            if (w) w.WeaponFire(Time);
          }
        }
      } else {
        this.groupFire(this.BossWeaponSlots, Time, true);
      }
    }
    if (this.ShipShake.length) {
      this.ShipShake[0].Update(this.TimeDelta, (inc, dir) => {
        this.SetRotation(dir.mul(inc * 50));
      });
    }
    this.Velocity = this.Orientation.mul(this.Speed * this.TimeDelta);
    if (Math.abs(this.SpeedLR) > 0.01) {
      const t = new Vec3(this.SpeedLR * this.TimeDelta, 0, 0);
      m33CalcPoint(t, this.CurrentRotationMat);
      this.Velocity.addTo(t);
    }
    if (Math.abs(this.SpeedUD) > 0.01) {
      const t = new Vec3(0, this.SpeedUD * this.TimeDelta, 0);
      m33CalcPoint(t, this.CurrentRotationMat);
      this.Velocity.addTo(t);
    }
    if (Math.abs(this.SpeedByCamFB) > 0.01) this.Velocity.addTo(GetCameraMovementDirection().mul(this.SpeedByCamFB * this.TimeDelta));
    if (Math.abs(this.SpeedByCamLR) > 0.01) {
      const t = GetCameraMovementDirection().mul(this.SpeedByCamLR * this.TimeDelta);
      rotatePoint(t, new Vec3(0, -90, 0));
      this.Velocity.addTo(t);
    }
    if (Math.abs(this.SpeedByCamUD) > 0.01) {
      const t = GetCameraMovementDirection().mul(this.SpeedByCamUD * this.TimeDelta);
      rotatePoint(t, new Vec3(90, 0, 0));
      this.Velocity.addTo(t);
    }
    if (this.Velocity.x !== 0 || this.Velocity.y !== 0 || this.Velocity.z !== 0) this.SetLocation(this.Location.add(this.Velocity));
    if (this.Engines.length) {
      let s = this.Speed;
      if (s > 6) s = 6;
      else if (s < -6) s = -6;
      s /= 2;
      for (const e of this.Engines) {
        const g = alive(e);
        if (g && g.SpeedOnCreation !== -1) g.Speed = g.SpeedOnCreation + s;
      }
    }
    const NeedFire = this.WeaponSlots.some((s) => alive(s.Weapon) && s.SetFire);
    const NeedBossFire = this.BossWeaponSlots.some((s) => alive(s.Weapon) && s.SetFire);
    const turretAim = (slots: ShipWeaponSlot[]): void => {
      for (const s of slots) {
        const w = alive(s.Weapon);
        if (!w || !w.NeedRotateOnTargeting) continue;
        const NeedAngle = new Vec3();
        const wl = s.Location.add(w.FireLocation).add(this.Location);
        const target = FindTargetLocationWithPrediction(this.ObjectStatus, wl, w.InternalType);
        if (target && GetTurretOnTargetOrientation(wl, this.Rotation, this.CurrentRotationMat, target, NeedAngle)) {
          w.SetRotation(new Vec3(-w.Rotation.x - NeedAngle.x, 0, 0));
        }
      }
    };
    if (this.ObjectStatus === ObjectStatus.Enemy && NeedFire && this.WeaponSlots.length) turretAim(this.WeaponSlots);
    if (this.ObjectStatus === ObjectStatus.Enemy && NeedBossFire && this.BossWeaponSlots.length) turretAim(this.BossWeaponSlots);
    if (this.ObjectStatus === ObjectStatus.Ally) this.aimWeapons(1, false);
    if (this.ObjectStatus === ObjectStatus.Player) this.aimWeapons(G.GameTargetingMechanicSystem, true);
    return true;
  }

  /** the allies' and the player's weapon aiming (the end of cSpaceShip::Update) */
  private aimWeapons(TargetingSpeed: number, player: boolean): void {
    const WeaponAvLocation = new Vec3();
    let used = 0;
    for (const s of this.WeaponSlots) {
      const w = alive(s.Weapon);
      if (w) {
        WeaponAvLocation.copy(WeaponAvLocation.add(s.Location).add(w.FireLocation).add(this.Location));
        used++;
      }
    }
    WeaponAvLocation.x /= used;
    WeaponAvLocation.y /= used;
    WeaponAvLocation.z /= used;
    for (let i = 0; i < this.WeaponSlots.length; i++) {
      const s = this.WeaponSlots[i];
      const w = alive(s.Weapon);
      if (!w || !w.NeedRotateOnTargeting) continue;
      const NeedAngle = this.Rotation.clone();
      NeedAngle.y += s.YAngle;
      const wl = this.Location.add(s.Location).add(w.FireLocation);
      if (!player) {
        GetWeaponOnTargetOrientation(this.ObjectStatus, wl, wl, this.Rotation, this.Length, this.CurrentRotationMat, NeedAngle, true, w.InternalType);
      } else {
        switch (G.GameTargetingSystem) {
          case 1:
            GetWeaponOnTargetOrientation(this.ObjectStatus, wl, WeaponAvLocation, this.Rotation, this.Length, this.CurrentRotationMat, NeedAngle, false, w.InternalType);
            break;
          case 2:
            GetWeaponOnTargetOrientation(this.ObjectStatus, wl, WeaponAvLocation, this.Rotation, this.Length, this.CurrentRotationMat, NeedAngle, true, w.InternalType);
            break;
          case 3:
            GetWeaponOnTargetOrientation(this.ObjectStatus, wl, wl, w.Rotation, this.Length, w.CurrentRotationMat, NeedAngle, false, w.InternalType);
            break;
          case 4:
            GetWeaponOnTargetOrientation(this.ObjectStatus, wl, wl, new Vec3(w.Rotation.x, s.YAngle, w.Rotation.z), this.Length, w.CurrentRotationMat, NeedAngle, true, w.InternalType);
            break;
        }
      }
      const NeedAngleTmp = NeedAngle.clone();
      if (w.Rotation.x < NeedAngle.x) {
        let n = w.Rotation.x + 40 * TargetingSpeed * this.TimeDelta;
        if (n > NeedAngle.x) n = NeedAngle.x;
        NeedAngle.x = n;
      }
      if (w.Rotation.x > NeedAngle.x) {
        let n = w.Rotation.x - 40 * TargetingSpeed * this.TimeDelta;
        if (n < NeedAngle.x) n = NeedAngle.x;
        NeedAngle.x = n;
      }
      const [Min, Max] = GetShipWeaponSlotAngle(G.ShipHull, i);
      if (w.Rotation.y < NeedAngle.y) {
        let n = w.Rotation.y + 40 * TargetingSpeed * this.TimeDelta;
        if (n > NeedAngle.y) n = NeedAngle.y;
        NeedAngle.y = n;
        if (NeedAngle.y > Max + this.Rotation.y) NeedAngle.y = Max + this.Rotation.y;
      }
      if (w.Rotation.y > NeedAngle.y) {
        let n = w.Rotation.y - 40 * TargetingSpeed * this.TimeDelta;
        if (n < NeedAngle.y) n = NeedAngle.y;
        NeedAngle.y = n;
        if (NeedAngle.y < Min + this.Rotation.y) NeedAngle.y = Min + this.Rotation.y;
      }
      if (G.GameWeaponTargetingMode === 1) NeedAngle.copy(NeedAngleTmp);
      if (player || w.InternalType < 16) {
        w.SetRotation(w.Rotation.mul(-1));
        w.SetRotation(NeedAngle);
      }
    }
  }
}

export function ReleaseSpaceShip(s: SpaceShip | null): void {
  releaseFrom(world.ShipList, s);
}
