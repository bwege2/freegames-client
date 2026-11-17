// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/object3d/ground_object/:
// the pirates' tanks, wheeled vehicles, gun emplacements and the civilian buildings.
// Changed for the browser by the freegames project, 2026.
import { Vec3, fRandNum, rotatePoint, rotatePointInv, clamp } from '../core/math.ts';
import { alive } from '../core/particles.ts';
import { Object3D, ObjectStatus, ObjectType, type Shake, loadObjectData } from './object3d.ts';
import { world, releaseFrom } from './world.ts';
import { type Weapon, CreateWeapon, ReleaseWeaponLazy } from './weapon.ts';
import { FindTargetLocationWithPrediction, GetTurretOnTargetOrientation } from './targeting.ts';
import { G } from '../game/globals.ts';

/* eslint-disable no-var */
const Epsilon = 0.0001;
const MAX_WEAPONS = 6;

export class GroundWeaponSlot {
  SetFire = false;
  Weapon: Weapon | null = null;
  Location = new Vec3();
  Bound = new Vec3();
  constructor(w: Weapon | null = null, l = new Vec3()) {
    this.Weapon = w;
    this.Location = l.clone();
  }
}

export class GroundObject extends Object3D {
  WheelRotarySpeed = 0;
  SpeedToWheelRotarySpeedFactor = 0;
  WheelChunkNums: number[] = [];
  WheelShake: Shake[] = [];
  SteerableWheelChunkNums: number[] = [];
  MaxSteerableWheelAngle = 20;
  TrackChunkNum = -1;
  TrackRotationDirection = 1;
  NeedRotate = new Vec3();
  RotationSpeed = new Vec3(1, 1, 1);
  MaxSpeed = 0;
  Speed = 0;
  NeedSpeed = 0;
  MaxAcceler = 0;
  MaxSpeedRotate = 0;
  Acceler = 0;
  NeedAcceler = 1;
  WeaponSlots: GroundWeaponSlot[] = [];
  WeaponFireType = 2;
  WeaponGroupCurrentFireNum = -1;
  WeaponGroupCurrentFireDelay = 0;
  WeaponTargeting = false;
  BaseBound = new Vec3();
  MiddleBound = new Vec3();
  DoNotCalculateRotation = false;
  TargetHorizChunkNums: number[] = [];
  TargetHorizChunksCurrentAngle = 0;
  TargetHorizChunksNeedAngle = 0;
  TargetVertChunkNums: number[] = [];
  TargetVertChunksMaxAngle = 80;
  TargetVertChunksMinAngle = 0;
  TargetVertChunksCurrentAngle = 0;
  TargetVertChunksNeedAngle = 0;
  BarrelChunkNums: number[] = [];

  constructor() {
    super();
    this.ObjectStatus = ObjectStatus.Enemy;
  }

  Destroy(): void {
    for (const s of this.WeaponSlots) ReleaseWeaponLazy(s.Weapon);
  }

  SetLocation(NewLocation: Vec3): void {
    super.SetLocation(NewLocation);
    for (const s of this.WeaponSlots) {
      const w = alive(s.Weapon);
      if (w) w.SetLocation(NewLocation.add(s.Location));
    }
  }

  /** the weapon slots follow the turret chunks (SetRotation and the end of Update share this) */
  private placeWeapons(update: boolean): void {
    const BaseBoundTMP = this.BaseBound.clone();
    rotatePoint(BaseBoundTMP, this.Rotation);
    let RotationMiddle = this.Rotation.clone();
    const MiddleBoundTMP = this.MiddleBound.clone();
    if (this.TargetHorizChunkNums.length) RotationMiddle = this.Chunks[this.TargetHorizChunkNums[0]].Rotation.add(this.Rotation);
    rotatePoint(MiddleBoundTMP, RotationMiddle);
    let RotationWeapon = this.Rotation.clone();
    if (this.TargetVertChunkNums.length) RotationWeapon = this.Chunks[this.TargetVertChunkNums[0]].Rotation.add(this.Rotation);
    for (const s of this.WeaponSlots) {
      const WeaponBoundTMP = s.Bound.clone();
      rotatePoint(WeaponBoundTMP, RotationWeapon);
      s.Location = BaseBoundTMP.add(MiddleBoundTMP).add(WeaponBoundTMP);
      const w = alive(s.Weapon);
      if (w) {
        if (!this.TargetHorizChunkNums.length && !this.TargetVertChunkNums.length && !this.DoNotCalculateRotation) {
          // NOTE SetRotation adds the angles, Update subtracts them (as the original)
          if (update) RotationWeapon = this.Rotation.sub(new Vec3(this.TargetVertChunksNeedAngle, this.TargetHorizChunksNeedAngle, 0));
          else RotationWeapon = new Vec3(this.TargetVertChunksNeedAngle, this.TargetHorizChunksNeedAngle, 0).add(this.Rotation);
        }
        w.SetRotation(w.Rotation.mul(-1));
        w.SetRotation(RotationWeapon);
        w.SetLocation(this.Location.add(s.Location));
      }
    }
  }

  SetRotation(NewRotation: Vec3): void {
    super.SetRotation(NewRotation);
    this.placeWeapons(false);
  }

  /** the end of the constructors: the turret chunks' bounds */
  protected setupBounds(): void {
    if (this.TargetHorizChunkNums.length) this.BaseBound = this.Chunks[this.TargetHorizChunkNums[0]].Location.clone();
    if (this.TargetVertChunkNums.length) {
      if (this.TargetHorizChunkNums.length) this.MiddleBound = this.Chunks[this.TargetVertChunkNums[0]].Location.sub(this.Chunks[this.TargetHorizChunkNums[0]].Location);
      else this.MiddleBound = this.Chunks[this.TargetVertChunkNums[0]].Location.clone();
    }
    for (const s of this.WeaponSlots) {
      if (this.TargetVertChunkNums.length) s.Bound = s.Location.sub(this.Chunks[this.TargetVertChunkNums[0]].Location);
      else if (this.TargetHorizChunkNums.length) s.Bound = s.Location.sub(this.Chunks[this.TargetHorizChunkNums[0]].Location);
      else s.Bound = s.Location.clone();
    }
  }

  private groupFire(Time: number, type: number): void {
    let PrimCount = 0;
    let PrimTime = 0;
    let FirstWeapon = MAX_WEAPONS;
    let LastWeapon = 0;
    this.WeaponGroupCurrentFireDelay -= this.TimeDelta;
    for (let i = 0; i < this.WeaponSlots.length; i++) {
      const w = alive(this.WeaponSlots[i].Weapon);
      if (w) {
        PrimCount++;
        PrimTime += w.NextFireTime;
        if (FirstWeapon > i) FirstWeapon = i;
        if (LastWeapon < i) LastWeapon = i;
      }
    }
    if (this.WeaponGroupCurrentFireNum === -1) this.WeaponGroupCurrentFireNum = FirstWeapon;
    for (let i = 0; i < this.WeaponSlots.length; i++) {
      const s = this.WeaponSlots[i];
      if (alive(s.Weapon) && s.SetFire && this.WeaponGroupCurrentFireNum === i && this.WeaponGroupCurrentFireDelay <= 0) {
        s.Weapon!.WeaponFire(Time);
        if (type === 2) this.WeaponGroupCurrentFireDelay = (PrimTime / PrimCount) * ((1 + G.GameEnemyWeaponPenalty) / 2);
        else this.WeaponGroupCurrentFireDelay = PrimTime / (PrimCount * PrimCount);
        this.WeaponGroupCurrentFireNum++;
        if (this.WeaponGroupCurrentFireNum > LastWeapon) this.WeaponGroupCurrentFireNum = FirstWeapon;
        if (!alive(this.WeaponSlots[this.WeaponGroupCurrentFireNum]?.Weapon)) {
          for (;;) {
            this.WeaponGroupCurrentFireNum++;
            if (this.WeaponGroupCurrentFireNum > LastWeapon) this.WeaponGroupCurrentFireNum = FirstWeapon;
            if (alive(this.WeaponSlots[this.WeaponGroupCurrentFireNum]?.Weapon)) break;
          }
        }
      }
    }
  }

  Update(Time: number): boolean {
    if (!super.Update(Time)) return false;
    const ts = this.TimeSheetList[0];
    if (ts && !ts.InUse) {
      ts.InUse = true;
      this.NeedSpeed = ts.Speed;
      this.NeedAcceler = ts.Acceler;
      this.NeedRotate = ts.Rotation.clone();
      this.RotationSpeed = ts.RotationAcceler.clone();
      this.WeaponTargeting = ts.Targeting;
      for (const s of this.WeaponSlots) if (alive(s.Weapon)) s.SetFire = ts.Fire;
    }
    if (this.TimeDelta === 0) return true;
    if (this.WeaponTargeting) {
      let WeapNum = 204;
      let FirePos = new Vec3();
      if (this.WeaponSlots.length) {
        const w0 = alive(this.WeaponSlots[0].Weapon);
        if (w0) WeapNum = w0.InternalType;
        let Count = 0;
        for (const s of this.WeaponSlots) {
          if (alive(s.Weapon)) {
            FirePos.addTo(s.Location);
            Count++;
          }
        }
        FirePos = FirePos.mul(1 / Count);
      }
      const NeedAngle = new Vec3(this.TargetVertChunksNeedAngle, this.TargetHorizChunksNeedAngle, 0);
      const target = FindTargetLocationWithPrediction(this.ObjectStatus, this.Location.add(FirePos), WeapNum);
      if (target && GetTurretOnTargetOrientation(this.Location.add(FirePos), this.Rotation, this.CurrentRotationMat, target, NeedAngle)) {
        this.TargetHorizChunksNeedAngle = NeedAngle.y;
        this.TargetVertChunksNeedAngle = NeedAngle.x;
      } else {
        this.TargetVertChunksNeedAngle = this.TargetVertChunksMaxAngle * 0.5;
      }
    } else {
      this.TargetHorizChunksNeedAngle = 0;
      this.TargetVertChunksNeedAngle = 0;
    }
    const pen = G.GameEnemyTargetingSpeedPenalty;
    if (this.TargetHorizChunkNums.length && this.TargetHorizChunksNeedAngle !== this.TargetHorizChunksCurrentAngle) {
      if (Math.abs(this.TargetHorizChunksNeedAngle - this.TargetHorizChunksCurrentAngle) > 180) {
        if (this.TargetHorizChunksCurrentAngle - this.TargetHorizChunksNeedAngle > 180) this.TargetHorizChunksCurrentAngle -= 360;
        if (this.TargetHorizChunksNeedAngle - this.TargetHorizChunksCurrentAngle > 180) this.TargetHorizChunksCurrentAngle += 360;
      }
      let n = this.TargetHorizChunksCurrentAngle;
      if (this.TargetHorizChunksNeedAngle > this.TargetHorizChunksCurrentAngle) {
        n += 80 * this.TimeDelta / pen;
        if (n > this.TargetHorizChunksNeedAngle) n = this.TargetHorizChunksNeedAngle;
      } else {
        n -= 80 * this.TimeDelta / pen;
        if (n < this.TargetHorizChunksNeedAngle) n = this.TargetHorizChunksNeedAngle;
      }
      this.TargetHorizChunksCurrentAngle = n;
      for (const c of this.TargetHorizChunkNums) {
        const l = this.Chunks[c].Location.sub(this.Chunks[this.TargetHorizChunkNums[0]].Location);
        rotatePointInv(l, this.Chunks[c].Rotation.mul(-1));
        this.SetChunkRotation(new Vec3(this.Chunks[c].Rotation.x, -n, this.Chunks[c].Rotation.z), c);
        rotatePoint(l, this.Chunks[c].Rotation);
        this.SetChunkLocation(l.add(this.Chunks[this.TargetHorizChunkNums[0]].Location), c);
      }
    }
    if (this.TargetVertChunkNums.length && this.TargetVertChunksNeedAngle !== this.TargetVertChunksCurrentAngle) {
      let n = this.TargetVertChunksCurrentAngle;
      if (this.TargetVertChunksNeedAngle > this.TargetVertChunksCurrentAngle) {
        n += 80 * this.TimeDelta / pen;
        if (n > this.TargetVertChunksNeedAngle) n = this.TargetVertChunksNeedAngle;
        if (n > this.TargetVertChunksMaxAngle) n = this.TargetVertChunksMaxAngle;
      } else {
        n -= 80 * this.TimeDelta / pen;
        if (n < this.TargetVertChunksNeedAngle) n = this.TargetVertChunksNeedAngle;
        if (n < this.TargetVertChunksMinAngle) n = this.TargetVertChunksMinAngle;
      }
      this.TargetVertChunksCurrentAngle = n;
      for (const c of this.TargetVertChunkNums) {
        const l = this.Chunks[c].Location.sub(this.Chunks[this.TargetVertChunkNums[0]].Location);
        rotatePointInv(l, this.Chunks[c].Rotation.mul(-1));
        this.SetChunkRotation(new Vec3(-n, this.Chunks[c].Rotation.y, this.Chunks[c].Rotation.z), c);
        rotatePoint(l, this.Chunks[c].Rotation);
        this.SetChunkLocation(l.add(this.Chunks[this.TargetVertChunkNums[0]].Location), c);
      }
    }
    this.placeWeapons(true);
    if (this.WeaponSlots.length) {
      if (this.WeaponFireType === 1) {
        for (const s of this.WeaponSlots) {
          if (s.SetFire) {
            const w = alive(s.Weapon);
            if (w) w.WeaponFire(Time);
          }
        }
      } else if (this.WeaponFireType === 2 || this.WeaponFireType === 3) {
        this.groupFire(Time, this.WeaponFireType);
      }
    }
    for (const c of this.BarrelChunkNums) {
      this.Chunks[c].NeedGeometryAnimation = true;
      this.Chunks[c].GeometryAnimation.z += 500 * this.TimeDelta;
      if (this.Chunks[c].GeometryAnimation.z > 360) this.Chunks[c].GeometryAnimation.z -= 360;
    }
    if (this.WheelChunkNums.length && Math.abs(this.WheelRotarySpeed) >= Epsilon) {
      for (const c of this.WheelChunkNums) {
        this.Chunks[c].Rotation.x += this.WheelRotarySpeed * this.TimeDelta;
        if (this.Chunks[c].Rotation.x > 360) this.Chunks[c].Rotation.x -= 360;
        if (this.Chunks[c].Rotation.x < -360) this.Chunks[c].Rotation.x += 360;
      }
    }
    if (this.TrackChunkNum !== -1 && Math.abs(this.WheelRotarySpeed) >= Epsilon) {
      const ch = this.Chunks[this.TrackChunkNum];
      ch.NeedTextureAnimation = true;
      ch.TextureAnimation.x += (this.WheelRotarySpeed / 500) * this.TimeDelta * this.TrackRotationDirection;
      if (ch.TextureAnimation.x > 1) ch.TextureAnimation.x -= 1;
      if (ch.TextureAnimation.x < -1) ch.TextureAnimation.x += 1;
    }
    const nr = this.NeedRotate;
    if (nr.x !== 0 || nr.y !== 0 || nr.z !== 0) {
      const tmp = new Vec3();
      for (const axis of ['x', 'y', 'z'] as const) {
        if (nr[axis] === 0) continue;
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
      }
      this.SetRotation(tmp);
      for (const c of this.SteerableWheelChunkNums) {
        let r = this.Chunks[c].Rotation.y;
        if (this.Chunks[c].Rotation.y > nr.y) {
          r -= 90 * this.TimeDelta;
          if (r < nr.y) r = nr.y;
        } else if (this.Chunks[c].Rotation.y < nr.y) {
          r += 90 * this.TimeDelta;
          if (r > nr.y) r = nr.y;
        }
        if (r > this.MaxSteerableWheelAngle) r = this.MaxSteerableWheelAngle;
        if (r < -this.MaxSteerableWheelAngle) r = -this.MaxSteerableWheelAngle;
        this.SetChunkRotation(new Vec3(this.Chunks[c].Rotation.x, r, this.Chunks[c].Rotation.z), c);
      }
    }
    if (this.NeedSpeed !== 0) {
      let sign = this.NeedSpeed < 0 ? -1 : 1;
      if (sign === 1) this.NeedSpeed = clamp(this.NeedSpeed, 0, this.MaxSpeed);
      else this.NeedSpeed = clamp(this.NeedSpeed, -this.MaxSpeed, 0);
      if (sign === 1) {
        if (this.NeedSpeed < this.Speed) sign = -1;
      } else if (this.NeedSpeed > this.Speed) {
        sign = 1;
      }
      this.Acceler = sign * this.MaxAcceler * this.NeedAcceler;
      this.Speed = this.Speed + this.Acceler * this.TimeDelta;
      if (sign === 1) {
        if (this.NeedSpeed <= this.Speed) {
          this.Speed = this.NeedSpeed;
          this.NeedSpeed = 0;
        }
      } else if (this.NeedSpeed >= this.Speed) {
        this.Speed = this.NeedSpeed;
        this.NeedSpeed = 0;
      }
    }
    for (const sh of this.WheelShake) {
      sh.Update(this.TimeDelta, (inc, dir, chunk) => {
        this.SetChunkLocation(this.Chunks[chunk].Location.add(dir.mul(inc)), chunk);
      });
    }
    const shift = this.Orientation.mul(this.Speed * this.TimeDelta);
    if (shift.x !== 0 || shift.y !== 0 || shift.z !== 0) {
      this.WheelRotarySpeed = this.Speed * this.SpeedToWheelRotarySpeedFactor;
      this.SetLocation(this.Location.add(shift));
    }
    return true;
  }
}

class CivilianBuilding extends GroundObject {
  constructor(n: number) {
    super();
    if (n <= 0 || n > 11) return;
    this.ObjectType = ObjectType.CivilianBuilding;
    this.InternalType = n;
    this.ShowStatus = false;
    this.PromptDrawDist2 = 100;
    loadObjectData(`models/building/bld-${String(n).padStart(2, '0')}.vw3d`, this);
    for (let i = 0; i < this.Chunks.length; i++) {
      this.Texture[i] = 'models/building/bld.vw2d';
      this.TextureIllum[i] = 'models/building/bld_illum.vw2d';
      this.NormalMap[i] = 'models/normalmap/buildings_nm.tga';
    }
    this.ArmorCurrentStatus = this.ArmorInitialStatus = 150 / G.GameEnemyArmorPenalty;
  }
}

/** Armor, model, texture */
const PresetMilitaryBuildingData: [number, string, string][] = [
  [80, 'aa-gun-01', 'gr-01'], [120, 'aa-gun-02', 'gr-01'], [80, 'aa-gun-03', 'gr-02'], [150, 'aa-gun-04', 'gr-01'],
  [250, 'aa-gun-05', 'gr-03'], [50, 'artiler-gun-01', 'gr-03'], [200, 'artiler-gun-02', 'gr-01'],
];

class MilitaryBuilding extends GroundObject {
  constructor(MilitaryBuildingNum: number) {
    super();
    if (MilitaryBuildingNum <= 0 || MilitaryBuildingNum > PresetMilitaryBuildingData.length) return;
    const d = PresetMilitaryBuildingData[MilitaryBuildingNum - 1];
    this.ObjectType = ObjectType.PirateBuilding;
    this.InternalType = MilitaryBuildingNum;
    loadObjectData(`models/militarybuilding/${d[1]}.vw3d`, this);
    for (let i = 0; i < this.Chunks.length; i++) this.Texture[i] = `models/${d[2]}.vw2d`;
    this.ArmorCurrentStatus = this.ArmorInitialStatus = d[0] / G.GameEnemyArmorPenalty;
    switch (MilitaryBuildingNum) {
        case 1:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(0.3, 4.6, 2.6)));
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(-0.3, 4.6, 2.6)));
            this.WeaponFireType = 2;
            this.TargetHorizChunkNums.push(1);
            this.TargetHorizChunkNums.push(2);
            this.TargetHorizChunkNums.push(3);
            this.TargetHorizChunkNums.push(4);
            this.TargetVertChunkNums.push(2);
            this.TargetVertChunkNums.push(3);
            this.TargetVertChunkNums.push(4);
            this.TargetVertChunksMaxAngle = 60.0;
            break;
        case 2:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(0.0, 4.6, 4.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 3.0;
            }
            this.WeaponFireType = 2;
            this.TargetHorizChunkNums.push(1);
            this.TargetHorizChunkNums.push(2);
            this.TargetHorizChunkNums.push(3);
            this.TargetHorizChunkNums.push(4);
            this.TargetVertChunkNums.push(2);
            this.TargetVertChunkNums.push(3);
            this.TargetVertChunkNums.push(4);
            this.TargetVertChunksMaxAngle = 60.0;
            this.BarrelChunkNums.push(4);
            break;
        case 3:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(205), new Vec3(2.8, 5.3, 7.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(205), new Vec3(-2.8, 5.3, 7.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponFireType = 3;
            this.TargetHorizChunkNums.push(1);
            this.TargetHorizChunkNums.push(2);
            this.TargetVertChunkNums.push(2);
            this.TargetVertChunksMaxAngle = 60.0;
            break;
        case 4:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(3.6, 8.5, 4.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(-3.6, 8.5, 4.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponFireType = 2;
            this.TargetHorizChunkNums.push(1);
            this.TargetHorizChunkNums.push(2);
            this.TargetHorizChunkNums.push(3);
            this.TargetHorizChunkNums.push(4);
            this.TargetVertChunkNums.push(2);
            this.TargetVertChunkNums.push(3);
            this.TargetVertChunkNums.push(4);
            this.TargetVertChunksMaxAngle = 60.0;
            this.BarrelChunkNums.push(3);
            this.BarrelChunkNums.push(4);
            break;
        case 5:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(1.95, 6.5, 3.7)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 3.0;
            }
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(-1.95, 6.5, 3.7)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 3.0;
            }
            this.WeaponFireType = 2;
            this.TargetHorizChunkNums.push(1);
            this.TargetHorizChunkNums.push(2);
            this.TargetVertChunkNums.push(2);
            this.TargetVertChunksMaxAngle = 60.0;
            break;
        case 6:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(0.0, 3.0, 7.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 3.5;
            }
            this.TargetHorizChunkNums.push(2);
            this.TargetHorizChunkNums.push(1);
            this.TargetVertChunkNums.push(1);
            this.TargetVertChunksMaxAngle = 80.0;
            break;
        case 7:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(211), new Vec3(0.0, 5.2, 10.3)));
            this.TargetHorizChunkNums.push(4);
            this.TargetHorizChunkNums.push(2);
            this.TargetHorizChunkNums.push(3);
            this.TargetHorizChunkNums.push(1);
            this.TargetVertChunkNums.push(3);
            this.TargetVertChunkNums.push(2);
            this.TargetVertChunkNums.push(1);
            this.TargetVertChunksMaxAngle = 60.0;
            this.BarrelChunkNums.push(1);
            break;
        }
    this.setupBounds();
  }
}

/** Armor, SpeedToWheelRotarySpeedFactor, model, texture */
const PresetWheeledData: [number, number, string, string][] = [
  [120, 50, 'jeep-01', 'gr-02'], [70, 50, 'jeep-02', 'gr-02'], [100, 50, 'jeep-03', 'gr-02'], [100, 50, 'jeep-04', 'gr-07'],
  [150, 50, 'jeep-05', 'gr-03'], [250, 30, 'apc-02', 'gr-03'], [200, 30, 'apc-04', 'gr-01'], [400, 34, 'r-launcher-01', 'gr-02'],
];

class Wheeled extends GroundObject {
  constructor(WheeledNum: number) {
    super();
    if (WheeledNum <= 0 || WheeledNum > PresetWheeledData.length) return;
    const d = PresetWheeledData[WheeledNum - 1];
    this.ObjectType = ObjectType.PirateVehicle;
    this.InternalType = WheeledNum;
    this.MaxSpeed = 20;
    this.MaxAcceler = 5;
    this.MaxSpeedRotate = 20;
    loadObjectData(`models/wheeled/${d[2]}.vw3d`, this);
    for (let i = 0; i < this.Chunks.length; i++) this.Texture[i] = `models/${d[3]}.vw2d`;
    this.SpeedToWheelRotarySpeedFactor = d[1];
    this.ArmorCurrentStatus = this.ArmorInitialStatus = d[0] / G.GameEnemyArmorPenalty;
    switch (WheeledNum) {
        case 1:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(206), new Vec3(0.3, 4.5, -1.5)));
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(206), new Vec3(-0.3, 4.5, -1.5)));
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(206), new Vec3(0.9, 4.5, -1.5)));
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(206), new Vec3(-0.9, 4.5, -1.5)));
            this.WeaponFireType = 3;
            this.WheelChunkNums.push(0);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.SteerableWheelChunkNums.push(3);
            this.SteerableWheelChunkNums.push(4);
            this.MaxSteerableWheelAngle = 30.0;
            this.TargetVertChunkNums.push(5);
            this.TargetVertChunksMaxAngle = 30.0;
            break;
        case 2:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(206), new Vec3(1.3, 3.5, -1.5)));
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(206), new Vec3(-1.3, 3.5, -1.5)));
            this.WeaponFireType = 3;
            this.DoNotCalculateRotation = true;
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.SteerableWheelChunkNums.push(1);
            this.SteerableWheelChunkNums.push(4);
            this.MaxSteerableWheelAngle = 20.0;
            break;
        case 3:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(0.8, 4.2, -1.0)));
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(-0.8, 4.2, -1.0)));
            this.WeaponFireType = 2;
            this.WheelChunkNums.push(0);
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(5);
            this.SteerableWheelChunkNums.push(0);
            this.SteerableWheelChunkNums.push(1);
            this.MaxSteerableWheelAngle = 20.0;
            this.TargetHorizChunkNums.push(3);
            this.TargetHorizChunkNums.push(6);
            this.TargetVertChunkNums.push(6);
            this.TargetVertChunksMaxAngle = 60.0;
            break;
        case 4:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(207), new Vec3(0.0, 4.5, -4.0)));
            this.WheelChunkNums.push(0);
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.SteerableWheelChunkNums.push(0);
            this.SteerableWheelChunkNums.push(3);
            this.MaxSteerableWheelAngle = 20.0;
            break;
        case 5:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(208), new Vec3(0.0, 4.5, -4.0)));
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.SteerableWheelChunkNums.push(1);
            this.SteerableWheelChunkNums.push(2);
            this.MaxSteerableWheelAngle = 30.0;
            break;
        case 6:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(0.0, 6.0, -3.0)));
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.SteerableWheelChunkNums.push(1);
            this.SteerableWheelChunkNums.push(4);
            this.MaxSteerableWheelAngle = 30.0;
            this.TargetHorizChunkNums.push(5);
            this.TargetHorizChunkNums.push(6);
            this.TargetVertChunkNums.push(6);
            this.TargetVertChunksMaxAngle = 40.0;
            break;
        case 7:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(0.1, 5.0, -1.0)));
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(-0.1, 5.0, -1.0)));
            this.WeaponFireType = 2;
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.SteerableWheelChunkNums.push(1);
            this.SteerableWheelChunkNums.push(4);
            this.MaxSteerableWheelAngle = 20.0;
            this.TargetHorizChunkNums.push(5);
            this.TargetHorizChunkNums.push(6);
            this.TargetVertChunkNums.push(6);
            this.TargetVertChunksMaxAngle = 40.0;
            break;
        case 8:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(210), new Vec3(1.5, 5.2, 7.0)));
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(210), new Vec3(-1.5, 5.2, 7.0)));
            this.WeaponFireType = 3;
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.WheelChunkNums.push(9);
            this.SteerableWheelChunkNums.push(1);
            this.SteerableWheelChunkNums.push(3);
            this.SteerableWheelChunkNums.push(6);
            this.SteerableWheelChunkNums.push(7);
            this.MaxSteerableWheelAngle = 20.0;
            this.TargetVertChunkNums.push(2);
            this.TargetVertChunksMaxAngle = 90.0;
            break;
        }
    for (const c of this.WheelChunkNums) this.Chunks[c].Rotation.x = fRandNum(360);
    this.setupBounds();
  }
}

/** Armor, SpeedToWheelRotarySpeedFactor, model, texture */
const PresetTrackedData: [number, number, string, string][] = [
  [250, 60, 'tank-01', 'gr-01'], [200, 45, 'tank-03', 'gr-01'], [300, 45, 'tank-05', 'gr-06'], [300, 55, 'tank-06', 'gr-03'],
  [400, 60, 'tank-07', 'gr-06'], [250, 70, 'tank-08', 'gr-01'], [400, 60, 'tank-09', 'gr-01'], [300, 60, 'tank-10', 'gr-03'],
  [350, 60, 'tank-11', 'gr-03'], [300, 60, 'apc-01', 'gr-03'], [400, 60, 'apc-03', 'gr-03'], [250, 60, 'apc-aa-01', 'gr-03'],
  [200, 42, 'apc-aa-02', 'gr-02'], [50, 50, 'engineering-01', 'gr-03'],
];

class Tracked extends GroundObject {
  constructor(TrackedNum: number) {
    super();
    if (TrackedNum <= 0 || TrackedNum > PresetTrackedData.length) return;
    const d = PresetTrackedData[TrackedNum - 1];
    this.ObjectType = ObjectType.PirateVehicle;
    this.MaxSpeed = 20;
    this.MaxAcceler = 5;
    this.MaxSpeedRotate = 20;
    this.InternalType = TrackedNum;
    this.NeedCullFaces = false;
    loadObjectData(`models/tracked/${d[2]}.vw3d`, this);
    for (let i = 0; i < this.Chunks.length; i++) this.Texture[i] = `models/${d[3]}.vw2d`;
    this.SpeedToWheelRotarySpeedFactor = d[1];
    this.ArmorCurrentStatus = this.ArmorInitialStatus = d[0] / G.GameEnemyArmorPenalty;
    switch (TrackedNum) {
        case 1:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(211), new Vec3(0.0, 5.5, 9.0)));
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.WheelChunkNums.push(9);
            this.WheelChunkNums.push(10);
            this.WheelChunkNums.push(11);
            this.WheelChunkNums.push(12);
            this.WheelChunkNums.push(13);
            this.WheelChunkNums.push(14);
            this.WheelChunkNums.push(15);
            this.WheelChunkNums.push(16);
            this.WheelChunkNums.push(17);
            this.WheelChunkNums.push(18);
            this.TargetHorizChunkNums.push(1);
            this.TargetHorizChunkNums.push(5);
            this.TargetVertChunkNums.push(5);
            this.TargetVertChunksMaxAngle = 50.0;
            this.TrackChunkNum = 19;
            break;
        case 2:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(0.1, 6.1, -0.4)));
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(-0.1, 6.1, -0.4)));
            this.WeaponFireType = 2;
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.WheelChunkNums.push(9);
            this.WheelChunkNums.push(10);
            this.TargetHorizChunkNums.push(11);
            this.TargetHorizChunkNums.push(12);
            this.TargetVertChunkNums.push(12);
            this.TargetVertChunksMaxAngle = 50.0;
            this.TrackChunkNum = 13;
            break;
        case 3:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(213), new Vec3(0.0, 5.2, 3.7)));
            this.WheelChunkNums.push(0);
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(10);
            this.WheelChunkNums.push(11);
            this.WheelChunkNums.push(12);
            this.WheelChunkNums.push(13);
            this.WheelChunkNums.push(14);
            this.WheelChunkNums.push(15);
            this.WheelChunkNums.push(16);
            this.TargetHorizChunkNums.push(8);
            this.TargetHorizChunkNums.push(9);
            this.TargetVertChunkNums.push(9);
            this.TargetVertChunksMaxAngle = 50.0;
            this.TrackChunkNum = 17;
            break;
        case 4:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(208), new Vec3(0.0, 5.3, 6.5)));
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.WheelChunkNums.push(9);
            this.WheelChunkNums.push(10);
            this.WheelChunkNums.push(11);
            this.WheelChunkNums.push(12);
            this.WheelChunkNums.push(13);
            this.WheelChunkNums.push(14);
            this.WheelChunkNums.push(15);
            this.WheelChunkNums.push(16);
            this.TargetHorizChunkNums.push(17);
            this.TargetHorizChunkNums.push(18);
            this.TargetHorizChunkNums.push(19);
            this.TargetVertChunkNums.push(18);
            this.TargetVertChunksMaxAngle = 50.0;
            this.TrackChunkNum = 20;
            break;
        case 5:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(208), new Vec3(0.0, 5.8, 4.5)));
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(10);
            this.WheelChunkNums.push(11);
            this.WheelChunkNums.push(12);
            this.WheelChunkNums.push(13);
            this.WheelChunkNums.push(14);
            this.WheelChunkNums.push(15);
            this.WheelChunkNums.push(16);
            this.TargetHorizChunkNums.push(9);
            this.TargetHorizChunkNums.push(8);
            this.TargetVertChunkNums.push(8);
            this.TargetVertChunksMaxAngle = 30.0;
            this.TrackChunkNum = 17;
            break;
        case 6:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(211), new Vec3(0.0, 4.9, 4.0)));
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.WheelChunkNums.push(9);
            this.WheelChunkNums.push(10);
            this.WheelChunkNums.push(11);
            this.WheelChunkNums.push(12);
            this.WheelChunkNums.push(13);
            this.WheelChunkNums.push(14);
            this.WheelChunkNums.push(15);
            this.WheelChunkNums.push(16);
            this.WheelChunkNums.push(17);
            this.TargetHorizChunkNums.push(1);
            this.TargetHorizChunkNums.push(18);
            this.TargetVertChunkNums.push(18);
            this.TargetVertChunksMaxAngle = 50.0;
            this.TrackChunkNum = 19;
            break;
        case 7:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(212), new Vec3(0.0, 7.6, 5.5)));
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.WheelChunkNums.push(9);
            this.WheelChunkNums.push(10);
            this.WheelChunkNums.push(13);
            this.WheelChunkNums.push(14);
            this.WheelChunkNums.push(15);
            this.WheelChunkNums.push(16);
            this.WheelChunkNums.push(17);
            this.WheelChunkNums.push(18);
            this.TargetHorizChunkNums.push(12);
            this.TargetHorizChunkNums.push(11);
            this.TargetVertChunkNums.push(11);
            this.TargetVertChunksMaxAngle = 50.0;
            this.TrackChunkNum = 19;
            break;
        case 8:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(208), new Vec3(0.0, 7.0, 8.5)));
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.WheelChunkNums.push(9);
            this.WheelChunkNums.push(10);
            this.WheelChunkNums.push(11);
            this.WheelChunkNums.push(12);
            this.WheelChunkNums.push(13);
            this.WheelChunkNums.push(14);
            this.WheelChunkNums.push(15);
            this.WheelChunkNums.push(16);
            this.TargetHorizChunkNums.push(17);
            this.TargetHorizChunkNums.push(18);
            this.TargetVertChunkNums.push(18);
            this.TargetVertChunksMaxAngle = 50.0;
            this.TrackChunkNum = 19;
            break;
        case 9:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(211), new Vec3(0.0, 6.7, 6.8)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.WheelChunkNums.push(9);
            this.WheelChunkNums.push(10);
            this.WheelChunkNums.push(11);
            this.WheelChunkNums.push(12);
            this.WheelChunkNums.push(13);
            this.WheelChunkNums.push(14);
            this.WheelChunkNums.push(15);
            this.WheelChunkNums.push(16);
            this.TargetHorizChunkNums.push(18);
            this.TargetHorizChunkNums.push(0);
            this.TargetVertChunkNums.push(0);
            this.TargetVertChunksMaxAngle = 50.0;
            this.TrackChunkNum = 19;
            break;
        case 10:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(204), new Vec3(0.0, 6.1, 0.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.WheelChunkNums.push(9);
            this.WheelChunkNums.push(10);
            this.WheelChunkNums.push(11);
            this.WheelChunkNums.push(12);
            this.WheelChunkNums.push(13);
            this.WheelChunkNums.push(14);
            this.WheelChunkNums.push(15);
            this.WheelChunkNums.push(16);
            this.TargetHorizChunkNums.push(18);
            this.TargetHorizChunkNums.push(0);
            this.TargetVertChunkNums.push(0);
            this.TargetVertChunksMaxAngle = 50.0;
            this.TrackChunkNum = 19;
            break;
        case 11:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(209), new Vec3(2.2, 5.4, 7.0)));
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(209), new Vec3(-2.2, 5.4, 7.0)));
            this.WeaponFireType = 3;
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.WheelChunkNums.push(9);
            this.WheelChunkNums.push(10);
            this.WheelChunkNums.push(11);
            this.WheelChunkNums.push(12);
            this.WheelChunkNums.push(13);
            this.WheelChunkNums.push(14);
            this.WheelChunkNums.push(15);
            this.WheelChunkNums.push(16);
            this.TargetVertChunkNums.push(0);
            this.TargetVertChunksMaxAngle = 55.0;
            this.TrackChunkNum = 18;
            break;
        case 12:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(206), new Vec3(0.55, 5.0, 2.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(206), new Vec3(-0.55, 5.0, 2.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(206), new Vec3(1.65, 5.0, 2.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(206), new Vec3(-1.65, 5.0, 2.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponFireType = 3;
            this.WheelChunkNums.push(1);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.WheelChunkNums.push(9);
            this.WheelChunkNums.push(10);
            this.WheelChunkNums.push(11);
            this.WheelChunkNums.push(12);
            this.WheelChunkNums.push(13);
            this.WheelChunkNums.push(14);
            this.WheelChunkNums.push(15);
            this.WheelChunkNums.push(16);
            this.TargetVertChunkNums.push(18);
            this.TargetVertChunkNums.push(0);
            this.TargetVertChunksMaxAngle = 40.0;
            this.TrackChunkNum = 19;
            break;
        case 13:
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(206), new Vec3(1.4, 5.0, 0.4)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new GroundWeaponSlot(CreateWeapon(206), new Vec3(-1.4, 5.0, 0.4)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponFireType = 3;
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.WheelChunkNums.push(9);
            this.WheelChunkNums.push(10);
            this.WheelChunkNums.push(11);
            this.WheelChunkNums.push(12);
            this.WheelChunkNums.push(13);
            this.WheelChunkNums.push(14);
            this.WheelChunkNums.push(15);
            this.TargetHorizChunkNums.push(0);
            this.TargetHorizChunkNums.push(16);
            this.TargetVertChunkNums.push(16);
            this.TargetVertChunksMaxAngle = 50.0;
            this.TrackChunkNum = 17;
            break;
        case 14:
            this.WheelChunkNums.push(0);
            this.WheelChunkNums.push(2);
            this.WheelChunkNums.push(3);
            this.WheelChunkNums.push(4);
            this.WheelChunkNums.push(5);
            this.WheelChunkNums.push(6);
            this.WheelChunkNums.push(7);
            this.WheelChunkNums.push(8);
            this.TrackChunkNum = 10;
            this.TrackRotationDirection = -1;
            break;
        }
    this.Texture[this.TrackChunkNum] = 'models/track.vw2d';
    for (const c of this.WheelChunkNums) this.Chunks[c].Rotation.x = fRandNum(360);
    this.setupBounds();
  }
}

function add<T extends GroundObject>(o: T): T {
  world.GroundObjectList.unshift(o);
  return o;
}

export const CreateCivilianBuilding = (n: number): GroundObject => add(new CivilianBuilding(n));
export const CreateMilitaryBuilding = (n: number): GroundObject => add(new MilitaryBuilding(n));
export const CreateWheeled = (n: number): GroundObject => add(new Wheeled(n));
export const CreateTracked = (n: number): GroundObject => add(new Tracked(n));

export function ReleaseGroundObject(o: GroundObject | null): void {
  releaseFrom(world.GroundObjectList, o);
}
