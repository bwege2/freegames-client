// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/object3d/projectile/
// projectile.cpp: every shot, beam, missile, flare and mine. Changed for the browser by the freegames
// project, 2026.
import { Vec3, fRand0, m33CalcPoint } from '../core/math.ts';
import { type ParticleSystem, createParticleSystem, alive, releaseParticleSystem } from '../core/particles.ts';
import { Object3D, Damage, ObjectStatus, ObjectType, loadObjectData } from './object3d.ts';
import { world, releaseFrom } from './world.ts';
import { SetProjectileGFX } from './projectile_gfx.ts';
import { projectileData } from './projectile_data.ts';
import { FindTargetAndInterceptCourse, CorrectTargetInterceptCourse, CheckMissileTarget, GetClosestTargetToMine } from './targeting.ts';
import { CreateBulletExplosion } from './explosion.ts';
import { G } from '../game/globals.ts';

export class Projectile extends Object3D {
  Num = 0;
  Damage = new Damage(0);
  ProjectileType = 0;
  Target: Object3D | null = null;
  ProjectileCenter = new Vec3();
  Speed = 0;
  SpeedStart = 0;
  SpeedEnd = 0;
  Age = 0;
  MineIData = 0;
  MineReloadTime = 1;
  MineNextFireTime = 1;
  GraphicFXDestroyType = false;
  GraphicFXLocation: Vec3[] = [];
  GraphicFX: (ParticleSystem | null)[] = [];
  NeedStopPartic = false;

  constructor(ProjectileNum: number) {
      super();
      this.ObjectStatus = ObjectStatus.Ally;
      this.ObjectType = ObjectType.Projectile;
      this.Radius = 0.0;
      this.Ambient[0] = this.Ambient[1] = this.Ambient[2] = this.Ambient[3] = 0.35;
      const d = projectileData(ProjectileNum);
      if (ProjectileNum <= 0 || !d) {
          return;
      }
      this.Num = ProjectileNum;
      this.Radius = d[0];
      this.Damage.Kinetic = d[1];
      this.Damage.EM = d[2];
      this.ProjectileType = d[3];
      this.SpeedStart = this.SpeedEnd = this.Speed = d[4];
      this.Age = this.Lifetime = d[5];
      const GraphicFXQuantity = d[6];
      for (let i = 0; i < GraphicFXQuantity; i++) {
          this.GraphicFXLocation.push(new Vec3());
          this.GraphicFX.push(null);
      }
      if (this.ProjectileType == 1) {
          this.ArmorCurrentStatus = this.ArmorInitialStatus = 1.0;
      }      switch (ProjectileNum) {
      case 1:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 1);
          }
          break;
      case 2:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 2);
          }
          break;
      case 3:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 3);
          }
          break;
      case 4:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 4);
          }
          break;
      case 5:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 5);
          }
          break;
      case 6:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 6);
          }
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 5);
              sharedGFX.CreationSize = new Vec3(2.5, 2.5, 0.5);
              sharedGFX.DeadZone = 1.9;
          }
          break;
      case 7:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 12);
          }
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 5);
          }
          break;
      case 8:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 7);
          }
          break;
      case 9:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 10);
          }
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 8);
          }
          this.GraphicFX[2] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[2]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 9);
          }
          break;
      case 10:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 8);
          }
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 9);
          }
          this.GraphicFX[2] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[2]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 11);
          }
          break;
      case 11:
          this.ProjectileCenter = new Vec3(0.0, 0.0, 50.0);
          this.NeedStopPartic = true;
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 17);
              sharedGFX.CreationSize = new Vec3(0.8, 0.8, 100.0);
              let MinX = -sharedGFX.CreationSize.x / 2;
              let MaxX = sharedGFX.CreationSize.x / 2;
              let MinY = -sharedGFX.CreationSize.y / 2;
              let MaxY = sharedGFX.CreationSize.y / 2;
              let MinZ = -sharedGFX.CreationSize.z / 2;
              let MaxZ = sharedGFX.CreationSize.z / 2;
              this.OBB.Box[0] = new Vec3(MaxX, MaxY, MaxZ);
              this.AABB[0] = new Vec3(MaxX, MaxY, MaxZ);
              this.OBB.Box[1] = new Vec3(MinX, MaxY, MaxZ);
              this.AABB[1] = new Vec3(MinX, MaxY, MaxZ);
              this.OBB.Box[2] = new Vec3(MinX, MaxY, MinZ);
              this.AABB[2] = new Vec3(MinX, MaxY, MinZ);
              this.OBB.Box[3] = new Vec3(MaxX, MaxY, MinZ);
              this.AABB[3] = new Vec3(MaxX, MaxY, MinZ);
              this.OBB.Box[4] = new Vec3(MaxX, MinY, MaxZ);
              this.AABB[4] = new Vec3(MaxX, MinY, MaxZ);
              this.OBB.Box[5] = new Vec3(MinX, MinY, MaxZ);
              this.AABB[5] = new Vec3(MinX, MinY, MaxZ);
              this.OBB.Box[6] = new Vec3(MinX, MinY, MinZ);
              this.AABB[6] = new Vec3(MinX, MinY, MinZ);
              this.OBB.Box[7] = new Vec3(MaxX, MinY, MinZ);
              this.AABB[7] = new Vec3(MaxX, MinY, MinZ);
              this.OBB.Location = new Vec3(0.0, 0.0, 0.0);
              this.Width = Math.abs(MaxX - MinX);
              this.Height = Math.abs(MaxY - MinY);
              this.Length = Math.abs(MaxZ - MinZ);
          }
          break;
      case 12:
          this.ProjectileCenter = new Vec3(0.0, 0.0, 55.0);
          this.NeedStopPartic = true;
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 18);
              sharedGFX.CreationSize = new Vec3(1.6, 1.6, 110.0);
          }
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 17);
              sharedGFX.CreationSize = new Vec3(0.8, 0.8, 110.0);
              let MinX = -sharedGFX.CreationSize.x / 2;
              let MaxX = sharedGFX.CreationSize.x / 2;
              let MinY = -sharedGFX.CreationSize.y / 2;
              let MaxY = sharedGFX.CreationSize.y / 2;
              let MinZ = -sharedGFX.CreationSize.z / 2;
              let MaxZ = sharedGFX.CreationSize.z / 2;
              this.OBB.Box[0] = new Vec3(MaxX, MaxY, MaxZ);
              this.AABB[0] = new Vec3(MaxX, MaxY, MaxZ);
              this.OBB.Box[1] = new Vec3(MinX, MaxY, MaxZ);
              this.AABB[1] = new Vec3(MinX, MaxY, MaxZ);
              this.OBB.Box[2] = new Vec3(MinX, MaxY, MinZ);
              this.AABB[2] = new Vec3(MinX, MaxY, MinZ);
              this.OBB.Box[3] = new Vec3(MaxX, MaxY, MinZ);
              this.AABB[3] = new Vec3(MaxX, MaxY, MinZ);
              this.OBB.Box[4] = new Vec3(MaxX, MinY, MaxZ);
              this.AABB[4] = new Vec3(MaxX, MinY, MaxZ);
              this.OBB.Box[5] = new Vec3(MinX, MinY, MaxZ);
              this.AABB[5] = new Vec3(MinX, MinY, MaxZ);
              this.OBB.Box[6] = new Vec3(MinX, MinY, MinZ);
              this.AABB[6] = new Vec3(MinX, MinY, MinZ);
              this.OBB.Box[7] = new Vec3(MaxX, MinY, MinZ);
              this.AABB[7] = new Vec3(MaxX, MinY, MinZ);
              this.OBB.Location = new Vec3(0.0, 0.0, 0.0);
              this.Width = Math.abs(MaxX - MinX);
              this.Height = Math.abs(MaxY - MinY);
              this.Length = Math.abs(MaxZ - MinZ);
          }
          break;
      case 13:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 19);
          }
          break;
      case 14:
          this.ProjectileCenter = new Vec3(0.0, 0.0, 60.0);
          this.NeedStopPartic = true;
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 20);
              sharedGFX.CreationSize = new Vec3(0.4, 0.4, 120.0);
              let MinX = -sharedGFX.CreationSize.x / 2;
              let MaxX = sharedGFX.CreationSize.x / 2;
              let MinY = -sharedGFX.CreationSize.y / 2;
              let MaxY = sharedGFX.CreationSize.y / 2;
              let MinZ = -sharedGFX.CreationSize.z / 2;
              let MaxZ = sharedGFX.CreationSize.z / 2;
              this.OBB.Box[0] = new Vec3(MaxX, MaxY, MaxZ);
              this.AABB[0] = new Vec3(MaxX, MaxY, MaxZ);
              this.OBB.Box[1] = new Vec3(MinX, MaxY, MaxZ);
              this.AABB[1] = new Vec3(MinX, MaxY, MaxZ);
              this.OBB.Box[2] = new Vec3(MinX, MaxY, MinZ);
              this.AABB[2] = new Vec3(MinX, MaxY, MinZ);
              this.OBB.Box[3] = new Vec3(MaxX, MaxY, MinZ);
              this.AABB[3] = new Vec3(MaxX, MaxY, MinZ);
              this.OBB.Box[4] = new Vec3(MaxX, MinY, MaxZ);
              this.AABB[4] = new Vec3(MaxX, MinY, MaxZ);
              this.OBB.Box[5] = new Vec3(MinX, MinY, MaxZ);
              this.AABB[5] = new Vec3(MinX, MinY, MaxZ);
              this.OBB.Box[6] = new Vec3(MinX, MinY, MinZ);
              this.AABB[6] = new Vec3(MinX, MinY, MinZ);
              this.OBB.Box[7] = new Vec3(MaxX, MinY, MinZ);
              this.AABB[7] = new Vec3(MaxX, MinY, MinZ);
              this.OBB.Location = new Vec3(0.0, 0.0, 0.0);
              this.Width = Math.abs(MaxX - MinX);
              this.Height = Math.abs(MaxY - MinY);
              this.Length = Math.abs(MaxZ - MinZ);
          }
          break;
      case 15:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 21);
          }
          break;
      case 16:
          {
              const tmpHash = "models/earthfighter/missile.vw3d";
              loadObjectData(tmpHash, this);
          }
          {
              const tmpHash = "models/earthfighter/rockets.tga";
              this.Texture[0] = tmpHash;
          }
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 13);
          }
          this.GraphicFXLocation[0] = new Vec3(0.0, 0.0, -this.Length / 2.0);
          this.NeedStopPartic = true;
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 101);
          }
          this.GraphicFXLocation[1] = this.GraphicFXLocation[0].clone();
          break;
      case 17:
          {
              const tmpHash = "models/earthfighter/swarm.vw3d";
              loadObjectData(tmpHash, this);
          }
          {
              const tmpHash = "models/earthfighter/rockets.tga";
              this.Texture[0] = tmpHash;
          }
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 16);
          }
          this.GraphicFXLocation[0] = new Vec3(0.0, 0.0, -this.Length / 2.0);
          this.NeedStopPartic = true;
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 101);
              sharedGFX.Life = 1.00;
          }
          this.GraphicFXLocation[1] = this.GraphicFXLocation[0].clone();
          break;
      case 18:
          {
              const tmpHash = "models/earthfighter/torpedo.vw3d";
              loadObjectData(tmpHash, this);
          }
          {
              const tmpHash = "models/earthfighter/rockets.tga";
              this.Texture[0] = tmpHash;
          }
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 14);
          }
          this.GraphicFXLocation[0] = new Vec3(0.0, 0.0, -this.Length / 2.0);
          this.NeedStopPartic = true;
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 101);
          }
          this.GraphicFXLocation[1] = this.GraphicFXLocation[0].clone();
          break;
      case 19:
          {
              const tmpHash = "models/earthfighter/nuke.vw3d";
              loadObjectData(tmpHash, this);
          }
          {
              const tmpHash = "models/earthfighter/rockets.tga";
              this.Texture[0] = tmpHash;
          }
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 15);
          }
          this.GraphicFXLocation[0] = new Vec3(0.0, 0.0, -this.Length / 2.0);
          this.NeedStopPartic = true;
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 101);
          }
          this.GraphicFXLocation[1] = this.GraphicFXLocation[0].clone();
          break;
      case 101:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 22);
          }
          break;
      case 102:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 23);
          }
          this.NeedStopPartic = true;
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 102);
          }
          break;
      case 103:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 24);
          }
          break;
      case 104:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 24);
          }
          this.NeedStopPartic = true;
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 102);
          }
          break;
      case 105:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 23);
          }
          break;
      case 106:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 36);
          }
          break;
      case 107:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 37);
          }
          break;
      case 108:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 8);
          }
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 9);
          }
          this.GraphicFX[2] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[2]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 11);
          }
          break;
      case 109:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 10);
          }
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 8);
          }
          this.GraphicFX[2] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[2]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 9);
          }
          break;
      case 110:
          this.ProjectileCenter = new Vec3(0.0, 0.0, 55.0);
          this.NeedStopPartic = true;
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 38);
              sharedGFX.CreationSize = new Vec3(2.0, 2.0, 110.0);
              let MinX = -sharedGFX.CreationSize.x/2;
              let MaxX = sharedGFX.CreationSize.x/2;
              let MinY = -sharedGFX.CreationSize.y/2;
              let MaxY = sharedGFX.CreationSize.y/2;
              let MinZ = -sharedGFX.CreationSize.z/2;
              let MaxZ = sharedGFX.CreationSize.z/2;
              this.OBB.Box[0] = new Vec3(MaxX, MaxY, MaxZ);
              this.AABB[0] = new Vec3(MaxX, MaxY, MaxZ);
              this.OBB.Box[1] = new Vec3(MinX, MaxY, MaxZ);
              this.AABB[1] = new Vec3(MinX, MaxY, MaxZ);
              this.OBB.Box[2] = new Vec3(MinX, MaxY, MinZ);
              this.AABB[2] = new Vec3(MinX, MaxY, MinZ);
              this.OBB.Box[3] = new Vec3(MaxX, MaxY, MinZ);
              this.AABB[3] = new Vec3(MaxX, MaxY, MinZ);
              this.OBB.Box[4] = new Vec3(MaxX, MinY, MaxZ);
              this.AABB[4] = new Vec3(MaxX, MinY, MaxZ);
              this.OBB.Box[5] = new Vec3(MinX, MinY, MaxZ);
              this.AABB[5] = new Vec3(MinX, MinY, MaxZ);
              this.OBB.Box[6] = new Vec3(MinX, MinY, MinZ);
              this.AABB[6] = new Vec3(MinX, MinY, MinZ);
              this.OBB.Box[7] = new Vec3(MaxX, MinY, MinZ);
              this.AABB[7] = new Vec3(MaxX, MinY, MinZ);
              this.OBB.Location = new Vec3(0.0, 0.0, 0.0);
              this.Width = Math.abs(MaxX-MinX);
              this.Height = Math.abs(MaxY-MinY);
              this.Length = Math.abs(MaxZ-MinZ);
          }
          break;
      case 201:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 26);
          }
          break;
      case 202:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 34);
          }
          break;
      case 203:
          this.Orientation = new Vec3(0.0, 0.5, 0.5);
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 25);
          }
          break;
      case 204:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 26);
          }
          break;
      case 205:
          {
              const tmpHash = "models/earthfighter/missile.vw3d";
              loadObjectData(tmpHash, this);
          }
          {
              const tmpHash = "models/earthfighter/rockets.tga";
              this.Texture[0] = tmpHash;
          }
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 27);
          }
          this.GraphicFXLocation[0] = new Vec3(0.0, 0.0, -this.Length / 2.0);
          this.NeedStopPartic = true;
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 101);
          }
          this.GraphicFXLocation[1] = this.GraphicFXLocation[0].clone();
          break;
      case 206:
          {
              const tmpHash = "models/earthfighter/swarm.vw3d";
              loadObjectData(tmpHash, this);
          }
          {
              const tmpHash = "models/earthfighter/rockets.tga";
              this.Texture[0] = tmpHash;
          }
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 31);
          }
          this.GraphicFXLocation[0] = new Vec3(0.0, 0.0, -this.Length / 2.0);
          this.NeedStopPartic = true;
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 101);
          }
          this.GraphicFXLocation[1] = this.GraphicFXLocation[0].clone();
          break;
      case 207:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 6);
          }
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 5);
              sharedGFX.CreationSize = new Vec3(2.5, 2.5, 0.5);
              sharedGFX.DeadZone = 1.9;
          }
          break;
      case 208:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 19);
          }
          break;
      case 209:
          {
              const tmpHash = "models/earthfighter/torpedo.vw3d";
              loadObjectData(tmpHash, this);
          }
          {
              const tmpHash = "models/earthfighter/rockets.tga";
              this.Texture[0] = tmpHash;
          }
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 32);
          }
          this.GraphicFXLocation[0] = new Vec3(0.0, 0.0, -this.Length / 2.0);
          this.NeedStopPartic = true;
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 101);
          }
          this.GraphicFXLocation[1] = this.GraphicFXLocation[0].clone();
          break;
      case 210:
          {
              const tmpHash = "models/earthfighter/nuke.vw3d";
              loadObjectData(tmpHash, this);
          }
          {
              const tmpHash = "models/earthfighter/rockets.tga";
              this.Texture[0] = tmpHash;
          }
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 33);
          }
          this.GraphicFXLocation[0] = new Vec3(0.0, 0.0, -this.Length / 2.0);
          this.NeedStopPartic = true;
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 101);
          }
          this.GraphicFXLocation[1] = this.GraphicFXLocation[0].clone();
          break;
      case 211:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 34);
          }
          break;
      case 212:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 35);
          }
          break;
      case 213:
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 10);
          }
          this.GraphicFX[1] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 8);
          }
          this.GraphicFX[2] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[2]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 9);
          }
          break;
      case 214:
          this.MineIData = 0.0;
          this.ArmorCurrentStatus = this.ArmorInitialStatus = 10.0;
          {
              const tmpHash = "models/mine/mine-01.vw3d";
              loadObjectData(tmpHash, this);
          }
          {
              const tmpHash = "models/mine/mine1.tga";
              this.Texture[0] = tmpHash;
              const tmpIllumHash = "models/mine/mine1i.tga";
              this.TextureIllum[0] = tmpIllumHash;
          }
          break;
      case 215:
          this.MineIData = 0.0;
          this.ArmorCurrentStatus = this.ArmorInitialStatus = 15.0;
          {
              const tmpHash = "models/mine/mine-02.vw3d";
              loadObjectData(tmpHash, this);
          }
          {
              const tmpHash = "models/mine/mine2.tga";
              this.Texture[0] = tmpHash;
              const tmpIllumHash = "models/mine/mine2i.tga";
              this.TextureIllum[0] = tmpIllumHash;
          }
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 28);
          }
          this.GraphicFXLocation[0] = new Vec3(0.0, -0.8, 0.0);
          this.NeedStopPartic = true;
          break;
      case 216:
          this.MineIData = 0.0;
          this.ArmorCurrentStatus = this.ArmorInitialStatus = 20.0;
          this.MineReloadTime = this.MineNextFireTime = 1.0;
          {
              const tmpHash = "models/mine/mine-03.vw3d";
              loadObjectData(tmpHash, this);
          }
          {
              const tmpHash = "models/mine/mine3.tga";
              this.Texture[0] = tmpHash;
              const tmpIllumHash = "models/mine/mine3i.tga";
              this.TextureIllum[0] = tmpIllumHash;
          }
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 29);
          }
          this.GraphicFXLocation[0] = new Vec3(0.0, -2.5, 0.0);
          this.NeedStopPartic = true;
          break;
      case 217:
          this.MineIData = 0.0;
          this.ArmorCurrentStatus = this.ArmorInitialStatus = 40.0;
          this.MineReloadTime = this.MineNextFireTime = 3.0;
          {
              const tmpHash = "models/mine/mine-04.vw3d";
              loadObjectData(tmpHash, this);
          }
          {
              const tmpHash = "models/mine/mine4.tga";
              this.Texture[0] = tmpHash;
              const tmpIllumHash = "models/mine/mine4i.tga";
              this.TextureIllum[0] = tmpIllumHash;
          }
          this.GraphicFX[0] = createParticleSystem();
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              SetProjectileGFX(sharedGFX, 30);
          }
          this.GraphicFXLocation[0] = new Vec3(0.0, -0.7, 0.0);
          this.NeedStopPartic = true;
          break;
      default:
      }
  }
  Destroy(): void {
      for (let i = 0; i < this.GraphicFX.length; i++) {
          const sharedGFX = alive(this.GraphicFX[i]);
          if (!sharedGFX) {
              continue;
          }
          if (this.GraphicFXDestroyType) {
              releaseParticleSystem(this.GraphicFX[i]);
              continue;
          }
          sharedGFX.IsSuppressed = true;
          sharedGFX.DestroyIfNoParticles = true;
          if (!this.NeedStopPartic) {
              sharedGFX.ChangeSpeed(this.Orientation.mul(this.Speed));
              continue;
          }
          sharedGFX.StopAllParticles();
          if (i != 1) {
              continue;
          }
          let effective_dist2 = 300;
          switch (this.Num) {
          case 16:
          case 205:
              effective_dist2 = 500.0;
              break;
          case 18:
          case 209:
              effective_dist2 = 1000.0;
              break;
          case 19:
          case 210:
              effective_dist2 = 2000.0;
              break;
          }
          switch (this.Num) {
          case 16:
          case 17:
          case 18:
          case 19:
          case 205:
          case 206:
          case 209:
          case 210:
              for (const p of sharedGFX.ParticlesList) {
                  const Dist2 = p.Location.sub(this.Location);
                  let fDist2 = Dist2.x * Dist2.x + Dist2.y * Dist2.y + Dist2.z * Dist2.z;
                  if (fDist2 < 1.0) {
                      fDist2 = 3.0;
                  }
                  if (fDist2 < effective_dist2) {
                      p.Velocity = new Vec3(Dist2.x + 10.0 * fRand0(), Dist2.y + 10.0 * fRand0(), Dist2.z + 10.0 * fRand0());
                      p.Velocity.Normalize();
                      p.Velocity = p.Velocity.mul(effective_dist2 / fDist2);
                      p.NeedStop = true;
                  }
              }
              break;
          }
      }
  }
  SetRotation(NewRotation: Vec3): void {
      super.SetRotation(NewRotation);
      for (let i = 0; i < this.GraphicFX.length; i++) {
          var sharedGFX = alive(this.GraphicFX[i]); if (sharedGFX) {
              m33CalcPoint(this.GraphicFXLocation[i], this.OldInvRotationMat);
              m33CalcPoint(this.GraphicFXLocation[i], this.CurrentRotationMat);
              if (this.ProjectileType == 2) {
                  sharedGFX.RotateSystemAndParticlesByAngle(this.Rotation);
              } else {
                  sharedGFX.RotateSystemByAngle(this.Rotation);
              }
          }
      }
  }
  SetLocation(NewLocation: Vec3): void {
      super.SetLocation(NewLocation);
      if ((this.GraphicFX.length === 0)) {
          return;
      }
      switch (this.Num) {
      case 1:
      case 2:
      case 3:
      case 4:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 5:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 6:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[1].add(this.Location));
          }
          break;
      case 7:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[1].add(this.Location));
          }
          break;
      case 8:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 9:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[1].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[2]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[2].add(this.Location));
          }
          break;
      case 10:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[1].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[2]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[2].add(this.Location));
          }
          break;
      case 11:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
              sharedGFX.SetStartLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 12:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
              sharedGFX.SetStartLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[1].add(this.Location));
              sharedGFX.SetStartLocation(this.GraphicFXLocation[1].add(this.Location));
          }
          break;
      case 13:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 14:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
              sharedGFX.SetStartLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 15:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 16:
      case 17:
      case 18:
      case 19:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[1].add(this.Location));
          }
          break;
      case 101:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 102:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[1].add(this.Location));
          }
          break;
      case 103:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 104:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[1].add(this.Location));
          }
          break;
      case 105:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 106:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 107:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 108:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[1].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[2]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[2].add(this.Location));
          }
          break;
      case 109:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[1].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[2]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[2].add(this.Location));
          }
          break;
      case 110:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
              sharedGFX.SetStartLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 201:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 202:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 203:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 204:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 205: // pirate, like missile
      case 206: // pirate, like swarm
      case 209: // pirate, like torpedo
      case 210: // pirate, like bomb
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[1].add(this.Location));
          }
          break;
      case 207:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[1].add(this.Location));
          }
          break;
      case 208:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 211:
      case 212:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystemLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 213:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[1]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[1].add(this.Location));
          }
          var sharedGFX = alive(this.GraphicFX[2]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[2].add(this.Location));
          }
          break;
      case 214:
          break;
      case 215:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
              sharedGFX.SetStartLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 216:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
              sharedGFX.SetStartLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      case 217:
          var sharedGFX = alive(this.GraphicFX[0]); if (sharedGFX) {
              sharedGFX.MoveSystem(this.GraphicFXLocation[0].add(this.Location));
              sharedGFX.SetStartLocation(this.GraphicFXLocation[0].add(this.Location));
          }
          break;
      }
  }
  Update(Time: number): boolean {
    if (!super.Update(Time)) {
      if (this.ProjectileType === 2) return true;
      CreateBulletExplosion(null, this, -this.Num, this.Location, this.Speed);
      return false;
    }
    if (this.TimeDelta === 0) return true;
    this.Speed = this.SpeedStart * (this.Lifetime / this.Age) + this.SpeedEnd * ((this.Age - this.Lifetime) / this.Age);
    const Velocity = this.Orientation.mul(this.Speed * this.TimeDelta);
    this.SetLocation(this.Location.add(Velocity));
    let CurrentPenalty = 1.0;
    if (this.ObjectStatus === ObjectStatus.Enemy) CurrentPenalty = G.GameEnemyWeaponPenalty;
    let RotationSpeed = 0;
    const spinX = (k: number): void => {
      const g = alive(this.GraphicFX[k]);
      if (g) g.RotateSystemAndParticlesByAngle(new Vec3(g.Angle.x - 360.0 * this.TimeDelta, g.Angle.y, g.Angle.z));
    };
    const suppressAtEnd = (g: ParticleSystem): void => {
      if (this.Lifetime <= g.Life / 1.5) g.IsSuppressed = true;
    };
    const missile = (): void => {
      RotationSpeed /= CurrentPenalty;
      const NeedAngle = this.Rotation.clone();
      let EffectiveRange = 1000000.0;
      if (this.ObjectStatus === ObjectStatus.Player) EffectiveRange = this.Lifetime * this.Speed;
      if (!alive(this.Target)) {
        this.Target = FindTargetAndInterceptCourse(this.ObjectStatus, this.Location, this.Rotation, this.CurrentRotationMat, NeedAngle, EffectiveRange);
      } else if (CheckMissileTarget(this.Target, this.Location, this.CurrentRotationMat)) {
        if (!CorrectTargetInterceptCourse(this.Location, this.Rotation, this.CurrentRotationMat, this.Target, NeedAngle)) {
          this.Target = FindTargetAndInterceptCourse(this.ObjectStatus, this.Location, this.Rotation, this.CurrentRotationMat, NeedAngle, EffectiveRange);
        }
      } else {
        this.Target = FindTargetAndInterceptCourse(this.ObjectStatus, this.Location, this.Rotation, this.CurrentRotationMat, NeedAngle, EffectiveRange);
      }
      this.turnTowards(NeedAngle, RotationSpeed, true);
      this.SetRotation(NeedAngle.sub(this.Rotation));
    };
    const mineBlink = (illum: string): void => {
      this.MineIData += this.TimeDelta;
      if (this.MineIData >= 0.1) {
        this.TextureIllum[0] = this.TextureIllum[0] ? null : illum;
        this.MineIData = 0.0;
      }
    };
    const mineSpin = (speed: number): void => {
      this.Chunks[0].Rotation.y += speed * this.TimeDelta;
      while (this.Chunks[0].Rotation.y > 360.0) this.Chunks[0].Rotation.y -= 360.0;
    };
    /** the mines' common part: turn towards the target (180 degrees a second), follow its height */
    const mineFollow = (yOffset: number, fireNum: number, fireOffset: Vec3): void => {
      RotationSpeed = 180.0;
      const NeedAngle = this.Rotation.clone();
      this.Target = FindTargetAndInterceptCourse(this.ObjectStatus, this.Location, this.Rotation, this.CurrentRotationMat, NeedAngle, 1000000);
      this.turnTowards(NeedAngle, RotationSpeed, false);
      NeedAngle.z = this.Rotation.z;
      NeedAngle.x = this.Rotation.x;
      this.SetRotation(NeedAngle.sub(this.Rotation));
      const sharedTarget = alive(this.Target);
      if (sharedTarget) {
        const MineSpeed = 5.0;
        const NeedPoint = sharedTarget.Location.clone();
        let SpeedTmp = MineSpeed * this.TimeDelta;
        if (SpeedTmp > Math.abs(this.Location.y + yOffset - NeedPoint.y)) SpeedTmp = Math.abs(this.Location.y + yOffset - NeedPoint.y);
        if (SpeedTmp !== 0.0) {
          if (this.Location.y + yOffset > NeedPoint.y) SpeedTmp *= -1.0;
          this.SetLocation(this.Location.add(new Vec3(0.0, SpeedTmp, 0.0)));
        }
        if (fireNum) {
          this.MineNextFireTime -= this.TimeDelta;
          if (this.MineNextFireTime <= 0.0) {
            // NOTE the original creates this projectile with "new" and never puts it into the projectile
            // list: it is never updated and never hits anything, only its particle system stays
            const p = new Projectile(fireNum);
            p.SetLocation(this.Location.add(fireOffset));
            p.SetRotation(this.Rotation);
            for (const tmpGFX of p.GraphicFX) {
              const g = alive(tmpGFX);
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
            this.MineNextFireTime = this.MineReloadTime;
          }
        }
      }
      if (this.GraphicFX.length) {
        const g = alive(this.GraphicFX[0]);
        if (g) g.SetStartLocation(this.GraphicFXLocation[0].add(this.Location));
      }
      this.Target = null;
    };
    switch (this.Num) {
      case 9:
      case 109:
        spinX(1);
        spinX(2);
        break;
      case 10:
      case 108:
      case 213:
        spinX(0);
        spinX(1);
        break;
      case 11: {
        const g = alive(this.GraphicFX[0]);
        if (g) {
          g.RotateParticlesByAngle(new Vec3(0.0, 0.0, 360.0 * this.TimeDelta * 3.0));
          suppressAtEnd(g);
        }
        break;
      }
      case 12: {
        const g0 = alive(this.GraphicFX[0]);
        if (g0) {
          g0.RotateParticlesByAngle(new Vec3(0.0, 0.0, 360.0 * this.TimeDelta * 4.0));
          suppressAtEnd(g0);
        }
        const g1 = alive(this.GraphicFX[1]);
        if (g1) {
          g1.RotateParticlesByAngle(new Vec3(0.0, 0.0, -360.0 * this.TimeDelta * 2.0));
          suppressAtEnd(g1);
        }
        break;
      }
      case 13:
      case 208: {
        const g = alive(this.GraphicFX[0]);
        if (g) g.RotateSystemAndParticlesByAngle(new Vec3(g.Angle.x, g.Angle.y - 360.0 * this.TimeDelta * 2.0, g.Angle.z));
        break;
      }
      case 14:
      case 110: {
        const g = alive(this.GraphicFX[0]);
        if (g) suppressAtEnd(g);
        break;
      }
      case 15: {
        const g = alive(this.GraphicFX[0]);
        if (g) g.RotateParticlesByAngle(new Vec3(0.0, 0.0, 360.0 * this.TimeDelta * 6.0));
        break;
      }
      case 16: RotationSpeed = 50.0; missile(); break;
      case 17: RotationSpeed = 60.0; missile(); break;
      case 18: RotationSpeed = 35.0; missile(); break;
      case 19: RotationSpeed = 20.0; missile(); break;
      case 102: RotationSpeed = 50.0; missile(); break;
      case 104: RotationSpeed = 60.0; missile(); break;
      case 205: RotationSpeed = 50.0; missile(); break;
      case 206: RotationSpeed = 60.0; missile(); break;
      case 209: RotationSpeed = 50.0; missile(); break;
      case 210: RotationSpeed = 30.0; missile(); break;
      case 214:
        mineBlink('models/mine/mine1i.tga');
        mineSpin(90.0);
        break;
      case 106: {
        const sharedTarget = GetClosestTargetToMine(this.ObjectStatus, this.Location);
        if (sharedTarget) {
          const MineSpeed = 5.0;
          let SpeedTmp = MineSpeed * this.TimeDelta;
          if (SpeedTmp > Math.abs(this.Location.y - sharedTarget.Location.y)) SpeedTmp = Math.abs(this.Location.y - sharedTarget.Location.y);
          if (SpeedTmp !== 0.0) {
            if (this.Location.y > sharedTarget.Location.y) SpeedTmp *= -1.0;
            this.SetLocation(this.Location.add(new Vec3(0.0, SpeedTmp, 0.0)));
          }
        }
        if (this.GraphicFX.length) {
          const g = alive(this.GraphicFX[0]);
          if (g) g.SetStartLocation(this.GraphicFXLocation[0].add(this.Location));
        }
        break;
      }
      case 215:
        mineBlink('models/mine/mine2i.tga');
        mineSpin(90.0);
        break;
      case 107:
        mineFollow(0, 0, new Vec3());
        break;
      case 216:
        mineBlink('models/mine/mine3i.tga');
        mineSpin(120.0);
        mineFollow(-2.0, 204, new Vec3(0.0, -2.0, 0.0));
        break;
      case 217:
        mineBlink('models/mine/mine4i.tga');
        mineSpin(90.0);
        mineFollow(2.0, 206, new Vec3(0.0, 0.0, 0.0));
        break;
    }
    return true;
  }

  /** the angle steps of the missiles and mines (y, then x for missiles) */
  private turnTowards(NeedAngle: Vec3, RotationSpeed: number, withX: boolean): void {
    if (this.Rotation.y < NeedAngle.y) {
      let n = this.Rotation.y + RotationSpeed * this.TimeDelta;
      if (n > NeedAngle.y) n = NeedAngle.y;
      NeedAngle.y = n;
    }
    if (this.Rotation.y > NeedAngle.y) {
      let n = this.Rotation.y - RotationSpeed * this.TimeDelta;
      if (n < NeedAngle.y) n = NeedAngle.y;
      NeedAngle.y = n;
    }
    if (!withX) return;
    if (this.Rotation.x < NeedAngle.x) {
      let n = this.Rotation.x + RotationSpeed * this.TimeDelta;
      if (n > NeedAngle.x) n = NeedAngle.x;
      NeedAngle.x = n;
    }
    if (this.Rotation.x > NeedAngle.x) {
      let n = this.Rotation.x - RotationSpeed * this.TimeDelta;
      if (n < NeedAngle.x) n = NeedAngle.x;
      NeedAngle.x = n;
    }
  }
}

export function CreateProjectile(num: number): Projectile {
  const p = new Projectile(num);
  world.ProjectileList.unshift(p);
  return p;
}

export function ReleaseProjectile(p: Projectile | null): void {
  releaseFrom(world.ProjectileList, p);
}
