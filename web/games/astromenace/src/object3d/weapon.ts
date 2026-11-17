// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/object3d/weapon/
// weapon.cpp: the guns, launchers and turrets on the ships, vehicles and buildings.
// Changed for the browser by the freegames project, 2026.
import { Vec3, fRand, fRand0, m33CalcPoint, rotatePoint, rotatePointInv } from '../core/math.ts';
import { type ParticleSystem, ParticleCreationType, createParticleSystem, alive } from '../core/particles.ts';
import { Object3D, ObjectStatus, ObjectType, DeleteAfterLeaveScene, loadObjectData } from './object3d.ts';
import { world, releaseFrom } from './world.ts';
import { SetWeaponFire } from './weapon_gfx.ts';
import { CreateProjectile, ReleaseProjectile, type Projectile } from './projectile.ts';
import { FindTargetLocationWithPrediction, GetTurretOnTargetOrientation } from './targeting.ts';
import { G, GameSFX, audio } from '../game/globals.ts';

/** SFX, NeedRotateOnTargeting, Armor, WeaponLevel, EnergyUse, Ammo, NextFireTime, FireLocation, DestrFireLocation, model, texture, illum */
type WeaponData = [number, boolean, number, number, number, number, number, Vec3, Vec3, string, string, string];
const v = (x: number, y: number, z: number): Vec3 => new Vec3(x, y, z);
const S = GameSFX;
const ef = 'models/earthfighter/';

export const PresetEarthWeaponData: WeaponData[] = [
  [S.WeaponFire_Kinetic1, true, 25, 1, 1.5, 3000, 0.4, v(0, -0.613, 2.0), v(0, -0.65, 1.0), `${ef}weapon5.vw3d`, `${ef}sf-text00.vw2d`, `${ef}sf-illum01.vw2d`],
  [S.WeaponFire_Kinetic2, true, 25, 1, 3, 1500, 0.6, v(0, -0.613, 2.93), v(0, -0.6, 1.8), `${ef}weapon11.vw3d`, `${ef}sf-text00.vw2d`, `${ef}sf-illum01.vw2d`],
  [S.WeaponFire_Kinetic3, true, 30, 2, 3.5, 1000, 0.7, v(0, -0.613, 3.33), v(0, -0.6, 2.2), `${ef}weapon13.vw3d`, `${ef}sf-text00.vw2d`, `${ef}sf-illum01.vw2d`],
  [S.WeaponFire_Kinetic4, true, 30, 2, 5, 7000, 0.3, v(0, -0.613, 2.33), v(0, -0.6, 1.2), `${ef}weapon8.vw3d`, `${ef}sf-text00.vw2d`, `${ef}sf-illum01.vw2d`],
  [S.WeaponFire_Ion1, true, 10, 1, 7, 1000, 0.7, v(0, -0.43, 2.13), v(0, -0.45, 1.5), `${ef}weapon1.vw3d`, `${ef}sf-text04.vw2d`, `${ef}sf-illum02.vw2d`],
  [S.WeaponFire_Ion2, true, 10, 1, 10, 2000, 0.9, v(0, -0.53, 1.86), v(0, -0.5, 1.8), `${ef}weapon4.vw3d`, `${ef}sf-text04.vw2d`, `${ef}sf-illum02.vw2d`],
  [S.WeaponFire_Ion3, true, 15, 2, 11.5, 3000, 1.0, v(0, -0.63, 2.26), v(0, -0.65, 2.3), `${ef}weapon6.vw3d`, `${ef}sf-text04.vw2d`, `${ef}sf-illum02.vw2d`],
  [S.WeaponFire_Plasma1, true, 10, 2, 20, 2000, 0.6, v(0, -0.613, 2.0), v(0, -0.65, 1.8), `${ef}weapon3.vw3d`, `${ef}sf-text06.vw2d`, `${ef}sf-illum03.vw2d`],
  [S.WeaponFire_Plasma2, true, 15, 2, 30, 1000, 0.7, v(0, -0.8, 1.86), v(0, -0.8, 1.8), `${ef}weapon2.vw3d`, `${ef}sf-text06.vw2d`, `${ef}sf-illum03.vw2d`],
  [S.WeaponFire_Plasma3, true, 10, 3, 50, 800, 0.9, v(0, -0.613, 1.2), v(0, -0.7, 1.6), `${ef}weapon7.vw3d`, `${ef}sf-text06.vw2d`, `${ef}sf-illum03.vw2d`],
  [S.WeaponFire_Maser1, true, 10, 3, 50, 800, 3.0, v(0, -0.55, 2.1), v(0, -0.55, 1.4), `${ef}weapon10.vw3d`, `${ef}sf-text07.vw2d`, `${ef}sf-illum03.vw2d`],
  [S.WeaponFire_Maser2, true, 15, 4, 80, 1000, 2.4, v(0, -0.55, 2.5), v(0, -0.55, 1.8), `${ef}weapon9.vw3d`, `${ef}sf-text07.vw2d`, `${ef}sf-illum03.vw2d`],
  [S.WeaponFire_Antimatter, true, 20, 4, 50, 5000, 0.8, v(0, -0.65, 2.1), v(0, -0.65, 1.9), `${ef}weapon12.vw3d`, `${ef}sf-text09.vw2d`, `${ef}sf-illum02.vw2d`],
  [S.WeaponFire_Laser, true, 15, 5, 150, 800, 1.2, v(0, -0.6, 2.5), v(0, -0.6, 2.1), `${ef}weapon14.vw3d`, `${ef}sf-text05.vw2d`, `${ef}sf-illum03.vw2d`],
  [S.WeaponFire_Gauss, true, 20, 5, 150, 2000, 0.7, v(0, -0.65, 3.6), v(0, -0.55, 2.2), `${ef}weapon15.vw3d`, `${ef}sf-text08.vw2d`, `${ef}sf-illum03.vw2d`],
  [S.WeaponFire_SmallMissile, false, 30, 4, 5, 200, 3.0, v(0, -0.8, 4.7), v(0, -0.9, 1.5), `${ef}lnch1.vw3d`, `${ef}lnch12.tga`, ''],
  [S.WeaponFire_NormalMissile, false, 30, 4, 15, 400, 8.0, v(0.2, -0.95, 2.6), v(0, -0.6, 1.0), `${ef}lnch2.vw3d`, `${ef}lnch12.tga`, ''],
  [S.WeaponFire_Torpedo, false, 25, 5, 10, 50, 8.0, v(0, -0.95, 4.0), v(0, -0.9, 1.5), `${ef}lnch3.vw3d`, `${ef}lnch34.tga`, ''],
  [S.WeaponFire_Bomb, false, 30, 5, 15, 25, 10.0, v(0, -0.95, 5.0), v(0, -0.9, 1.8), `${ef}lnch4.vw3d`, `${ef}lnch34.tga`, ''],
];
const z = (): Vec3 => new Vec3();
const PresetAlienWeaponData: WeaponData[] = [
  [S.WeaponFire_Ion2, true, 1.0, 1, 1, 5000, 0.7, z(), z(), '', '', ''],
  [S.WeaponFire_Plasma1, false, 1.0, 1, 1, 2500, 3.0, z(), z(), '', '', ''],
  [S.WeaponFire_Plasma2, true, 1.0, 1, 1, 2500, 3.0, z(), z(), '', '', ''],
  [S.WeaponFire_Plasma2, false, 1.0, 1, 1, 2500, 2.5, z(), z(), '', '', ''],
  [S.WeaponFire_Plasma1, true, 1.0, 1, 1, 2500, 3.0, z(), z(), '', '', ''],
  [S.WeaponFire_Antimatter, false, 1.0, 1, 1, 50, 5.0, z(), z(), '', '', ''],
  [S.WeaponFire_Antimatter, false, 1.0, 1, 1, 50, 5.0, z(), z(), '', '', ''],
  [S.WeaponFire_Plasma3, true, 10, 3, 50, 800, 0.9, z(), z(), '', '', ''],
  [S.WeaponFire_Plasma2, true, 15, 2, 25, 1000, 0.8, z(), z(), '', '', ''],
  [S.WeaponFire_Laser, true, 15, 5, 150, 800, 1.2, z(), z(), '', '', ''],
];
const PresetPirateWeaponData: WeaponData[] = [
  [S.WeaponFire_Kinetic1, false, 10, 1, 1, 3000, 0.7, v(0, 1.5, 1.0), v(0, 1.5, 1.0), 'models/turret/turret-01.vw3d', 'models/turret/turrets.tga', ''],
  [S.WeaponFire_Kinetic2, false, 10, 1, 1, 3000, 0.7, v(0, 1.0, 0), v(0, 1.0, 0), 'models/turret/turret-02.vw3d', 'models/turret/turrets.tga', ''],
  [S.WeaponFire_Kinetic1, false, 1.0, 1, 1, 2500, 4.0, z(), z(), '', '', ''],
  [S.WeaponFire_Kinetic1, true, 10, 1, 1.7, 3000, 0.7, z(), z(), '', '', ''],
  [S.WeaponFire_SmallMissile, false, 80, 4, 5, 200, 5.0, z(), z(), '', '', ''],
  [S.WeaponFire_NormalMissile, false, 30, 4, 5, 800, 8.0, z(), z(), '', '', ''],
  [S.WeaponFire_Ion2, true, 10, 1, 10, 2000, 0.9, z(), z(), '', '', ''],
  [S.WeaponFire_Antimatter, true, 20, 4, 50, 5000, 0.8, z(), z(), '', '', ''],
  [S.WeaponFire_Torpedo, false, 25, 5, 10, 200, 8.0, z(), z(), '', '', ''],
  [S.WeaponFire_Bomb, false, 30, 5, 15, 100, 10.0, z(), z(), '', '', ''],
  [S.WeaponFire_Kinetic2, true, 25, 1, 3, 1500, 0.6, z(), z(), '', '', ''],
  [S.WeaponFire_Kinetic3, true, 30, 2, 3.5, 500, 0.7, z(), z(), '', '', ''],
  [S.WeaponFire_Plasma2, true, 15, 2, 25, 1000, 0.8, z(), z(), '', '', ''],
  [S.WeaponFire_Torpedo, false, 1.0, 1, 1, 2500, 4.0, z(), z(), '', '', ''],
  [S.WeaponFire_Torpedo, false, 1.0, 1, 1, 2500, 4.0, z(), z(), '', '', ''],
  [S.WeaponFire_Bomb, false, 1.0, 1, 1, 2500, 4.0, z(), z(), '', '', ''],
  [S.WeaponFire_Bomb, false, 1.0, 1, 1, 2500, 4.0, z(), z(), '', '', ''],
];

export class Weapon extends Object3D {
  WeaponLevel = 1;
  Ammo = 100;
  AmmoStart = 100;
  NextFireTime = 0.3;
  LastFireTime = -10;
  EnergyUse = 1;
  CurrentEnergyAccumulated = 0;
  SwarmNum = 0;
  FlaresNum = 0;
  NeedRotateOnTargeting = true;
  LaserMaser: Projectile | null = null;
  LaserMaserSoundNum = 0;
  WeaponTurret = false;
  BaseBound = new Vec3();
  MiddleBound = new Vec3();
  WeaponBound = new Vec3();
  TargetHorizChunkNum = -1;
  TargetHorizChunkCurrentAngle = 0;
  TargetHorizChunkNeedAngle = 0;
  TargetVertChunkNum = -1;
  TargetVertChunkMaxAngle = 80;
  TargetVertChunkMinAngle = 0;
  TargetVertChunkCurrentAngle = 0;
  TargetVertChunkNeedAngle = 0;
  Fire: ParticleSystem | null = null;
  FireLocation = new Vec3();
  SFX = 0;
  DestroyedFire: ParticleSystem | null = null;
  DestroyedSmoke: ParticleSystem | null = null;
  DestroyedFireLocation = new Vec3();

  constructor(WeaponNum: number) {
    super();
    this.ObjectStatus = ObjectStatus.Ally;
    this.ObjectType = ObjectType.ShipWeapon;
    this.ShowStatus = false;
    if (WeaponNum <= 0) return;
    if (WeaponNum >= 1 && WeaponNum <= 99 && WeaponNum > PresetEarthWeaponData.length) return;
    if (WeaponNum >= 101 && WeaponNum <= 199 && WeaponNum - 100 > PresetAlienWeaponData.length) return;
    if (WeaponNum >= 201 && WeaponNum <= 299 && WeaponNum - 200 > PresetPirateWeaponData.length) return;
    this.InternalType = WeaponNum;
    const set = (d: WeaponData): void => {
      this.ArmorCurrentStatus = this.ArmorInitialStatus = d[2];
      this.WeaponLevel = d[3];
      this.Ammo = this.AmmoStart = d[5];
      this.NextFireTime = d[6];
      this.SFX = d[0];
      this.NeedRotateOnTargeting = d[1];
      this.CurrentEnergyAccumulated = this.EnergyUse = d[4];
      this.FireLocation = d[7].clone();
    };
    if (WeaponNum >= 1 && WeaponNum <= 99) {
      const d = PresetEarthWeaponData[WeaponNum - 1];
      this.ObjectStatus = ObjectStatus.Ally;
      set(d);
      this.DestroyedFireLocation = d[8].clone();
      this.Fire = createParticleSystem();
      this.Fire.SetStartLocation(this.FireLocation);
      this.Fire.Direction = new Vec3(0, 0, 1);
      SetWeaponFire(this.Fire, WeaponNum);
      loadObjectData(d[9], this);
      for (let i = 0; i < this.Chunks.length; i++) {
        this.Texture[i] = d[10];
        if (WeaponNum < 16) this.TextureIllum[i] = d[11];
      }
    } else if (WeaponNum >= 101 && WeaponNum <= 199) {
      this.ObjectStatus = ObjectStatus.Enemy;
      set(PresetAlienWeaponData[WeaponNum - 101]);
    } else if (WeaponNum >= 201 && WeaponNum <= 299) {
      const d = PresetPirateWeaponData[WeaponNum - 201];
      this.ObjectStatus = ObjectStatus.Enemy;
      set(d);
      if (WeaponNum === 201 || WeaponNum === 202) {
        this.WeaponTurret = true;
        this.TargetHorizChunkNum = 0;
        this.TargetVertChunkNum = 1;
        this.TargetVertChunkMaxAngle = 89;
        this.TargetVertChunkMinAngle = WeaponNum === 201 ? 0 : 20;
        loadObjectData(d[9], this);
        for (let i = 0; i < this.Chunks.length; i++) {
          this.Texture[i] = d[10];
          this.TextureIllum[i] = null;
        }
        this.BaseBound = this.Chunks[this.TargetHorizChunkNum].Location.clone();
        this.MiddleBound = this.Chunks[this.TargetVertChunkNum].Location.sub(this.Chunks[this.TargetHorizChunkNum].Location);
        this.WeaponBound = this.FireLocation.sub(this.Chunks[this.TargetVertChunkNum].Location);
      }
    }
  }

  Destroy(): void {
    for (const ps of [this.Fire, this.DestroyedFire, this.DestroyedSmoke]) {
      const g = alive(ps);
      if (g) {
        g.IsSuppressed = true;
        g.DestroyIfNoParticles = true;
      }
    }
    if (alive(this.LaserMaser)) {
      ReleaseProjectile(this.LaserMaser);
      if (audio.isSoundAvailable(this.LaserMaserSoundNum)) audio.stopSound(this.LaserMaserSoundNum, 150);
    }
  }

  Update(Time: number): boolean {
    const lm = alive(this.LaserMaser);
    if (lm && lm.Lifetime <= 0) ReleaseProjectile(lm);
    if (!super.Update(Time)) return false;
    if (this.LastFireTime + this.TimeDelta <= Time) {
      const f = alive(this.Fire);
      if (f) f.IsSuppressed = true;
    }
    if (this.InternalType >= 1 && this.InternalType <= 99 && this.ArmorCurrentStatus < this.ArmorInitialStatus && !alive(this.DestroyedFire)) {
      const g = createParticleSystem();
      this.DestroyedFire = g;
      g.ColorStart = { r: 1.0, g: 0.7, b: 0.3 };
      g.ColorEnd = { r: 1.0, g: 0.0, b: 0.0 };
      g.AlphaStart = 1.0;
      g.AlphaEnd = 0.1;
      g.SizeStart = 0.2;
      g.SizeVar = 0.1;
      g.SizeEnd = 0.1;
      g.Speed = 8.0;
      g.SpeedVar = 2.0;
      g.Theta = 5.0;
      g.Life = 0.5 * this.Length / 3;
      g.ParticlesPerSec = 70;
      g.Texture = 'gfx/flare1.tga';
      g.CreationType = ParticleCreationType.Cube;
      g.CreationSize.set(this.Width / 2, this.Width / 2, 0.1);
      g.Direction.set(0, 0, -1);
      g.SetStartLocation(this.DestroyedFireLocation);
    }
    if (this.InternalType >= 1 && this.InternalType <= 99 && this.ArmorCurrentStatus <= 0 && !alive(this.DestroyedSmoke)) {
      const g = createParticleSystem();
      this.DestroyedSmoke = g;
      g.ColorStart = { r: 1, g: 1, b: 1 };
      g.ColorEnd = { r: 1, g: 1, b: 1 };
      g.AlphaStart = 0.2;
      g.AlphaEnd = 0.0;
      g.SizeStart = 0.25;
      g.SizeVar = 0.1;
      g.SizeEnd = 0.0;
      g.Speed = 0.0;
      g.SpeedVar = 0.0;
      g.Theta = 35.0;
      g.Life = 2.0 * this.Length / 3;
      g.ParticlesPerSec = 300;
      g.Texture = 'gfx/flare1.tga';
      g.CreationType = ParticleCreationType.Point;
      g.CreationSize.set(this.Width / 2.5, this.Width / 2.5, 0.1);
      g.Direction.set(0, 0, -1);
      g.SetStartLocation(this.DestroyedFireLocation);
    }
    if (this.InternalType === 17 && this.SwarmNum > 0 && this.LastFireTime + 0.15 < Time && (this.Ammo > 0 || !G.GameUnlimitedAmmo)) {
      this.LastFireTime = Time;
      if (!G.GameUnlimitedAmmo) this.Ammo -= 1;
      let CurrentPenalty = 1.0;
      if (this.ObjectStatus === ObjectStatus.Enemy) CurrentPenalty = G.GameEnemyWeaponPenalty;
      const swarm: Record<number, [number, number, number]> = {
        9: [-0.5, -0.5, 2.6], 8: [0.5, -0.8, 2.6], 7: [-0.5, -0.8, 2.6], 6: [0.5, -0.5, 2.6], 5: [-0.2, -0.95, 2.6],
        4: [0.2, -0.65, 2.6], 3: [-0.2, -0.3, 2.6], 2: [0.2, -0.65, 2.6], 1: [0.2, -0.3, 2.6],
      };
      const sl = swarm[this.SwarmNum];
      if (sl) this.FireLocation.set(sl[0], sl[1], sl[2]);
      m33CalcPoint(this.FireLocation, this.CurrentRotationMat);
      const p = CreateProjectile(this.InternalType);
      p.SetLocation(this.Location.add(this.FireLocation));
      p.SetRotation(this.Rotation);
      for (const t of p.GraphicFX) {
        const g = alive(t);
        if (!g) continue;
        const f = alive(this.Fire);
        if (f) g.Direction = f.Direction.mul(-1);
        if (CurrentPenalty === 2) g.ParticlesPerSec -= Math.trunc(g.ParticlesPerSec * 0.33);
        else if (CurrentPenalty === 3) g.ParticlesPerSec -= Math.trunc(g.ParticlesPerSec * 0.5);
        g.Speed = g.Speed / CurrentPenalty;
        g.Life = g.Life * CurrentPenalty;
        g.MagnetFactor = g.MagnetFactor / (CurrentPenalty * CurrentPenalty);
      }
      p.ObjectStatus = this.ObjectStatus;
      p.SpeedStart = p.SpeedEnd = p.SpeedStart / CurrentPenalty;
      p.Age = p.Lifetime = p.Age * CurrentPenalty;
      p.Damage.divBy(CurrentPenalty);
      if (this.SFX !== GameSFX.none) audio.playGameSFX(this.SFX, 1.0, p.Location);
      this.SwarmNum--;
    }
    if (this.InternalType === 203 && this.FlaresNum > 0 && this.LastFireTime + 0.4 < Time && (this.Ammo > 0 || !G.GameUnlimitedAmmo)) {
      this.LastFireTime = Time;
      if (!G.GameUnlimitedAmmo) this.Ammo -= 1;
      const p = CreateProjectile(this.InternalType);
      p.SetLocation(this.Location.add(this.FireLocation));
      const rx = fRand0() * 30;
      const rz = fRand0() * 30;
      p.SetRotation(this.Rotation.add(new Vec3(rx, 0, rz)));
      for (const t of p.GraphicFX) {
        const g = alive(t);
        if (g) g.Direction = this.Orientation.mul(-1);
      }
      p.ObjectStatus = this.ObjectStatus;
      if (this.SFX !== GameSFX.none) audio.playGameSFX(this.SFX, 1.0, p.Location);
      this.FlaresNum--;
    }
    if (this.WeaponTurret) {
      const NeedAngle = new Vec3(this.TargetVertChunkNeedAngle, this.TargetHorizChunkNeedAngle, 0);
      const target = FindTargetLocationWithPrediction(this.ObjectStatus, this.Location.add(this.FireLocation), this.InternalType);
      if (target) GetTurretOnTargetOrientation(this.Location.add(this.FireLocation), this.Rotation, this.CurrentRotationMat, target, NeedAngle);
      this.TargetHorizChunkNeedAngle = NeedAngle.y;
      this.TargetVertChunkNeedAngle = NeedAngle.x;
      if (this.TargetHorizChunkNum !== -1 && this.TargetHorizChunkNeedAngle !== this.TargetHorizChunkCurrentAngle) {
        if (Math.abs(this.TargetHorizChunkNeedAngle - this.TargetHorizChunkCurrentAngle) > 180) {
          if (this.TargetHorizChunkCurrentAngle - this.TargetHorizChunkNeedAngle > 180) this.TargetHorizChunkCurrentAngle -= 360;
          if (this.TargetHorizChunkNeedAngle - this.TargetHorizChunkCurrentAngle > 180) this.TargetHorizChunkCurrentAngle += 360;
        }
        let NeedRotate = this.TargetHorizChunkCurrentAngle;
        if (this.TargetHorizChunkNeedAngle > this.TargetHorizChunkCurrentAngle) {
          NeedRotate += 80 * this.TimeDelta / G.GameEnemyTargetingSpeedPenalty;
          if (NeedRotate > this.TargetHorizChunkNeedAngle) NeedRotate = this.TargetHorizChunkNeedAngle;
        } else {
          NeedRotate -= 80 * this.TimeDelta / G.GameEnemyTargetingSpeedPenalty;
          if (NeedRotate < this.TargetHorizChunkNeedAngle) NeedRotate = this.TargetHorizChunkNeedAngle;
        }
        this.TargetHorizChunkCurrentAngle = NeedRotate;
        const base = this.Chunks[this.TargetHorizChunkNum].Location.clone();
        for (const ch of this.Chunks) {
          const tmp = ch.Location.sub(base);
          rotatePointInv(tmp, ch.Rotation.mul(-1));
          ch.Rotation.y = -NeedRotate;
          rotatePoint(tmp, ch.Rotation);
          ch.Location = tmp.add(base);
        }
      }
      if (this.TargetVertChunkNum !== -1 && this.TargetVertChunkNeedAngle !== this.TargetVertChunkCurrentAngle) {
        let NeedRotate = this.TargetVertChunkCurrentAngle;
        if (this.TargetVertChunkNeedAngle > this.TargetVertChunkCurrentAngle) {
          NeedRotate += 80 * this.TimeDelta / G.GameEnemyTargetingSpeedPenalty;
          if (NeedRotate > this.TargetVertChunkNeedAngle) NeedRotate = this.TargetVertChunkNeedAngle;
          if (NeedRotate > this.TargetVertChunkMaxAngle) NeedRotate = this.TargetVertChunkMaxAngle;
        } else {
          NeedRotate -= 80 * this.TimeDelta / G.GameEnemyTargetingSpeedPenalty;
          if (NeedRotate < this.TargetVertChunkNeedAngle) NeedRotate = this.TargetVertChunkNeedAngle;
          if (NeedRotate < this.TargetVertChunkMinAngle) NeedRotate = this.TargetVertChunkMinAngle;
        }
        this.TargetVertChunkCurrentAngle = NeedRotate;
        this.Chunks[this.TargetVertChunkNum].Rotation.x = -NeedRotate;
      }
      this.updateTurretFireLocation();
    }
    return true;
  }

  /** the turret's fire location and orientation from its base, middle and gun chunks; returns the gun's rotation */
  private updateTurretFireLocation(setOrientation = true): Vec3 {
    const BaseBoundTMP = this.BaseBound.clone();
    rotatePoint(BaseBoundTMP, this.Rotation);
    let RotationMiddle = this.Rotation.clone();
    const MiddleBoundTMP = this.MiddleBound.clone();
    if (this.TargetHorizChunkNum !== -1) RotationMiddle = this.Chunks[this.TargetHorizChunkNum].Rotation.add(this.Rotation);
    rotatePoint(MiddleBoundTMP, RotationMiddle);
    let RotationWeapon = this.Rotation.clone();
    if (this.TargetVertChunkNum !== -1) RotationWeapon = this.Chunks[this.TargetVertChunkNum].Rotation.add(this.Rotation);
    const WeaponBoundTMP = this.WeaponBound.clone();
    rotatePoint(WeaponBoundTMP, RotationWeapon);
    this.FireLocation = BaseBoundTMP.add(MiddleBoundTMP).add(WeaponBoundTMP);
    if (this.TargetHorizChunkNum === -1 && this.TargetVertChunkNum === -1) {
      RotationWeapon = new Vec3(this.TargetVertChunkNeedAngle, this.TargetHorizChunkNeedAngle, 0).add(this.Rotation);
    }
    if (setOrientation) {
      this.Orientation = new Vec3(0, 0, 1);
      rotatePoint(this.Orientation, RotationWeapon);
    }
    return RotationWeapon;
  }

  SetRotation(NewRotation: Vec3): void {
    super.SetRotation(NewRotation);
    if (!this.WeaponTurret) {
      m33CalcPoint(this.FireLocation, this.OldInvRotationMat);
      m33CalcPoint(this.FireLocation, this.CurrentRotationMat);
      const f = alive(this.Fire);
      if (f) {
        f.MoveSystem(this.Location.add(this.FireLocation));
        f.SetStartLocation(this.Location.add(this.FireLocation));
        f.RotateSystemByAngle(this.Rotation);
      }
    } else {
      this.updateTurretFireLocation();
    }
    const df = alive(this.DestroyedFire);
    if (df) {
      m33CalcPoint(this.DestroyedFireLocation, this.OldInvRotationMat);
      m33CalcPoint(this.DestroyedFireLocation, this.CurrentRotationMat);
      df.MoveSystem(this.Location.add(this.DestroyedFireLocation));
      df.SetStartLocation(this.Location.add(this.DestroyedFireLocation));
      df.RotateSystemByAngle(this.Rotation);
    }
    const ds = alive(this.DestroyedSmoke);
    if (ds) {
      ds.MoveSystemLocation(this.Location.add(this.DestroyedFireLocation));
      ds.RotateSystemByAngle(this.Rotation);
    }
    const lm = alive(this.LaserMaser);
    if (lm) {
      m33CalcPoint(lm.ProjectileCenter, this.OldInvRotationMat);
      m33CalcPoint(lm.ProjectileCenter, this.CurrentRotationMat);
      lm.SetLocation(this.Location.add(this.FireLocation).add(lm.ProjectileCenter));
      lm.SetRotation(NewRotation);
    }
  }

  SetLocation(NewLocation: Vec3): void {
    super.SetLocation(NewLocation);
    const f = alive(this.Fire);
    if (f) {
      f.MoveSystem(NewLocation.add(this.FireLocation));
      f.SetStartLocation(NewLocation.add(this.FireLocation));
    }
    const df = alive(this.DestroyedFire);
    if (df) {
      df.MoveSystem(NewLocation.add(this.DestroyedFireLocation));
      df.SetStartLocation(NewLocation.add(this.DestroyedFireLocation));
    }
    const ds = alive(this.DestroyedSmoke);
    if (ds) ds.MoveSystemLocation(NewLocation.add(this.DestroyedFireLocation));
    const lm = alive(this.LaserMaser);
    if (lm) lm.SetLocation(this.Location.add(this.FireLocation).add(lm.ProjectileCenter));
    if (audio.isSoundAvailable(this.LaserMaserSoundNum)) audio.setSoundLocation(this.LaserMaserSoundNum, this.Location.x, this.Location.y, this.Location.z);
  }

  WeaponFire(Time: number): boolean {
    if (this.InternalType === 0) return false;
    let CurrentPenalty = 1.0;
    if (this.ObjectStatus === ObjectStatus.Enemy) CurrentPenalty = G.GameEnemyWeaponPenalty;
    if (this.InternalType === 203) CurrentPenalty = 1.0;
    if (Time < this.LastFireTime + this.NextFireTime * CurrentPenalty) return false;
    this.LastFireTime = Time;
    if (this.InternalType >= 1 && this.InternalType <= 99) {
      let Misfire = false;
      if (this.ArmorCurrentStatus < this.ArmorInitialStatus && this.ArmorCurrentStatus / this.ArmorInitialStatus > fRand()) Misfire = true;
      if (this.ArmorCurrentStatus <= 0 || this.Ammo === 0 || Misfire) {
        const t = this.InternalType;
        let sfx = 0;
        if (t >= 1 && t <= 4) sfx = GameSFX.WeaponMalfunction_Kinetic;
        else if (t >= 5 && t <= 10) sfx = GameSFX.WeaponMalfunction_Particle;
        else if (t === 11 || t === 12 || t === 14) sfx = GameSFX.WeaponMalfunction_Beam;
        else if (t === 13 || t === 15) sfx = GameSFX.WeaponMalfunction_Energy;
        else if (t >= 16 && t <= 19) sfx = GameSFX.WeaponMalfunction_Launcher;
        if (sfx) audio.playGameSFX(sfx, 1.0, this.Location);
        return false;
      }
      if (this.ObjectStatus === ObjectStatus.Player) {
        if (this.CurrentEnergyAccumulated < this.EnergyUse) return false;
        this.CurrentEnergyAccumulated = 0;
      }
      if (!G.GameUnlimitedAmmo) this.Ammo -= 1;
      if (this.InternalType < 16) {
        const f = alive(this.Fire);
        if (f) f.IsSuppressed = false;
      }
    }
    let RotationWeapon = this.Rotation.clone();
    if (this.WeaponTurret) RotationWeapon = this.updateTurretFireLocation(false);
    const p = CreateProjectile(this.InternalType);
    if (p.ProjectileType === 2) {
      if (alive(this.LaserMaser)) ReleaseProjectile(this.LaserMaser);
      this.LaserMaser = p;
      m33CalcPoint(p.ProjectileCenter, this.CurrentRotationMat);
      p.SetLocation(this.Location.add(this.FireLocation).add(p.ProjectileCenter));
    } else if (p.ProjectileType === 0) {
      const AddPos = this.WeaponTurret ? new Vec3(0, 0, 2) : new Vec3(0, 0, 4);
      rotatePoint(AddPos, RotationWeapon);
      p.SetLocation(this.Location.add(this.FireLocation).add(AddPos));
    } else {
      p.SetLocation(this.Location.add(this.FireLocation));
    }
    if (p.ProjectileType === 3 || p.ProjectileType === 4) {
      p.SetRotation(RotationWeapon);
      for (const t of p.GraphicFX) {
        const g = alive(t);
        if (g) g.Direction = this.Orientation.clone();
      }
      p.ObjectStatus = this.ObjectStatus;
      p.SpeedStart = p.SpeedEnd = p.SpeedStart / CurrentPenalty;
      p.Age = p.Lifetime = p.Age;
      p.Damage.divBy(CurrentPenalty);
      p.ProjectileType = p.ProjectileType - 3;
    } else {
      p.SetRotation(RotationWeapon);
      for (const t of p.GraphicFX) {
        const g = alive(t);
        if (g) {
          g.Direction = this.Orientation.clone();
          g.ParticlesPerSec = Math.trunc(g.ParticlesPerSec / CurrentPenalty);
          g.Speed = g.Speed / CurrentPenalty;
          g.Life = g.Life * CurrentPenalty;
          g.MagnetFactor = g.MagnetFactor / (CurrentPenalty * CurrentPenalty);
        }
      }
      p.ObjectStatus = this.ObjectStatus;
      p.SpeedStart = p.SpeedEnd = p.SpeedStart / CurrentPenalty;
      p.Age = p.Lifetime = p.Age * CurrentPenalty;
      p.Damage.divBy(CurrentPenalty);
    }
    if (this.SFX !== GameSFX.none) {
      this.LaserMaserSoundNum = audio.playGameSFX(this.SFX, 1.0, this.Location.add(this.FireLocation));
      if (!alive(this.LaserMaser)) this.LaserMaserSoundNum = 0;
    }
    if (this.InternalType === 17) this.SwarmNum = 9;
    if (this.InternalType === 203) this.FlaresNum = 4;
    return true;
  }
}

export function CreateWeapon(num: number): Weapon {
  const w = new Weapon(num);
  world.WeaponList.unshift(w);
  return w;
}

export function ReleaseWeapon(w: Weapon | null): void {
  releaseFrom(world.WeaponList, w);
}

/** ReleaseWeaponLazy: deleted by its next update */
export function ReleaseWeaponLazy(w: Weapon | null): void {
  const s = alive(w);
  if (!s) return;
  s.DeleteAfterLeaveScene = DeleteAfterLeaveScene.disabled;
  s.Lifetime = 0;
}
