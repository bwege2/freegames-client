// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/object3d/explosion/
// (explosion.cpp, bullet_explosion.cpp, space_explosion.cpp, ground_explosion.cpp). The pieces of an
// exploding model fly apart in the explosion shader (UseGLSL120, as the original on OpenGL 2.1+):
// the vertex data carries each triangle's direction and speed, the update only advances the shader's
// range factor. Changed for the browser by the freegames project, 2026.
import {
  Vec3, fRand, fRand0, m33CalcPoint, m33CreateRotate, m33InverseRotate, m33Mult, mat33,
  mat44, m44CreateRotate, m44Mult, m44Translate, m44CalcPoint, rotatePoint as rotateVec,
} from '../core/math.ts';
import { type ParticleSystem, ParticleCreationType, createParticleSystem, createPointLight, alive, releaseParticleSystem } from '../core/particles.ts';
import { Chunk3D, Model3D } from '../core/model3d.ts';
import { boxInFrustum } from '../core/camera.ts';
import { Object3D, ObjectStatus, ObjectType, DeleteAfterLeaveScene } from './object3d.ts';
import { world } from './world.ts';
import { SetExplosionGFX } from './explosion_gfx.ts';
import { CreateProjectile, type Projectile } from './projectile.ts';
import { type SpaceObject, CreateSpaceDebris, ReleaseSpaceObject } from './spaceobject.ts';
import type { GroundObject } from './ground.ts';
import { G, GameSFX, audio, config } from '../game/globals.ts';
import { SetupCameraShake } from '../game/camera.ts';

interface ExplosionPiece { Velocity: Vec3; RemainTime: number }

export class Explosion extends Object3D {
  ExplosionType = 0;
  ExplosionTypeByClass = 0;
  ExplosionPieceData: ExplosionPiece[] = [];
  ExplosionGeometryMoveLastTime = -1;
  VelocityOrientation = new Vec3();
  OldSpeed = 0;
  NeedStop = true;
  AABBResizeSpeed = 0;
  GraphicFX: (ParticleSystem | null)[] = [];

  constructor() {
    super();
    this.ObjectStatus = ObjectStatus.Enemy;
    this.ObjectType = ObjectType.Explosion;
    this.NeedCullFaces = false;
    this.Lifetime = 0;
  }

  Destroy(): void {
    for (const t of this.GraphicFX) {
      const g = alive(t);
      if (g) {
        g.IsSuppressed = true;
        g.DestroyIfNoParticles = true;
      }
    }
  }

  protected newGFX(n: number): void {
    this.GraphicFX = Array.from({ length: n }, () => null);
  }

  Update(Time: number): boolean {
    if (!super.Update(Time)) {
      for (const t of this.GraphicFX) {
        const g = alive(t);
        if (g) {
          g.StopAllParticles();
          const e = this.ExplosionType;
          if (!(this.ExplosionTypeByClass === 2 && (e === 16 || e === 17 || e === 18 || e === 19 || e === 205 || e === 206 || e === 209 || e === 210))) {
            releaseParticleSystem(g);
          }
        }
      }
      return false;
    }
    const suppressAll = (): void => {
      for (const t of this.GraphicFX) {
        const g = alive(t);
        if (g && this.Lifetime < g.Life) g.IsSuppressed = true;
      }
    };
    if (this.ExplosionTypeByClass === 1) suppressAll();
    if (this.ExplosionTypeByClass === 2) {
      switch (Math.abs(this.ExplosionType)) {
        case 16: case 17: case 18: case 19: case 205: case 206: case 209: case 210: case 214: case 215: case 216: case 217:
          suppressAll();
          break;
      }
      const shrink = (g: ParticleSystem | null): void => {
        if (!alive(g)) return;
        g!.CreationSize.x -= g!.CreationSize.x * this.TimeDelta;
        g!.CreationSize.z -= g!.CreationSize.z * this.TimeDelta;
        g!.DeadZone -= g!.DeadZone * this.TimeDelta;
      };
      switch (this.ExplosionType) {
        case 16: case 17: case 205: case 206: case 18: case 209:
          shrink(this.GraphicFX[0]);
          break;
        case 19:
        case 210: {
          const g = alive(this.GraphicFX[0]);
          if (g) {
            g.CreationSize.x += 10 * this.TimeDelta;
            g.CreationSize.z += 10 * this.TimeDelta;
            g.DeadZone += 10 * this.TimeDelta;
          }
          shrink(this.GraphicFX[1]);
          break;
        }
      }
    }
    if (!config.UseGLSL120) {
      this.moveGeometry(Time);
    } else {
      this.ExplShaderRangeFactor += this.ExplShaderSpeedDelta * this.TimeDelta;
      this.ExplShaderSpeedDelta -= this.ExplShaderSpeedDelta * this.TimeDelta;
    }
    const AABBSpeedTmp = this.AABBResizeSpeed * this.TimeDelta;
    this.AABBResizeSpeed -= AABBSpeedTmp;
    if (this.Chunks.length) {
      const a = this.AABB;
      const minX = a[6].x - AABBSpeedTmp, maxX = a[0].x + AABBSpeedTmp;
      const minY = a[6].y - AABBSpeedTmp, maxY = a[0].y + AABBSpeedTmp;
      const minZ = a[6].z - AABBSpeedTmp, maxZ = a[0].z + AABBSpeedTmp;
      a[0] = new Vec3(maxX, maxY, maxZ); a[1] = new Vec3(minX, maxY, maxZ); a[2] = new Vec3(minX, maxY, minZ); a[3] = new Vec3(maxX, maxY, minZ);
      a[4] = new Vec3(maxX, minY, maxZ); a[5] = new Vec3(minX, minY, maxZ); a[6] = new Vec3(minX, minY, minZ); a[7] = new Vec3(maxX, minY, minZ);
    }
    const TMP2 = this.VelocityOrientation.mul(this.OldSpeed * this.TimeDelta);
    for (let i = 0; i < this.GraphicFX.length; i++) {
      const g = alive(this.GraphicFX[i]);
      if (!g) continue;
      const l = g.GetLocation().add(TMP2);
      if (this.ExplosionTypeByClass === 1 && this.ExplosionType === 2 && i === 1) g.MoveSystemLocation(l);
      else g.MoveSystem(l);
      g.SetStartLocation(l);
    }
    if (this.NeedStop) this.OldSpeed -= this.OldSpeed * this.TimeDelta;
    if (this.OldSpeed < 0) this.OldSpeed = 0;
    this.SetLocation(this.Location.add(TMP2));
    return true;
  }

  /** the fixed function path (no GLSL): the triangles are moved on the CPU every 35 ms */
  private moveGeometry(Time: number): void {
    if (this.ExplosionGeometryMoveLastTime === -1) this.ExplosionGeometryMoveLastTime = Time;
    if (!(this.ExplosionGeometryMoveLastTime + 0.035 < Time)) return;
    const move = Time - this.ExplosionGeometryMoveLastTime;
    this.ExplosionGeometryMoveLastTime = Time;
    let Count = 0;
    for (const ch of this.Chunks) {
      const va = ch.VertexArray, s = ch.VertexStride;
      for (let i = 0; i < ch.VertexQuantity; i += 3) {
        const p = this.ExplosionPieceData[Count];
        if (p && p.RemainTime > 0) {
          const TMP = p.Velocity.mul(move);
          p.Velocity.subFrom(TMP);
          p.RemainTime -= move;
          if (p.RemainTime <= 0.001) {
            p.RemainTime = 0;
            for (const k of [1, 2]) for (let c = 0; c < 3; c++) va[(i + k) * s + c] = va[i * s + c];
          } else {
            for (const k of [1, 2]) {
              for (let c = 0; c < 3; c++) {
                const t = va[s * (i + k) + c] - va[s * i + c];
                va[s * (i + k) + c] -= (t / p.RemainTime) * move;
              }
            }
            for (const k of [0, 1, 2]) {
              va[(i + k) * s] += TMP.x;
              va[(i + k) * s + 1] += TMP.y;
              va[(i + k) * s + 2] += TMP.z;
            }
          }
        }
        Count++;
      }
      ch.gpu = null;
    }
  }
}

/** the model of the exploding object, with the GLSL explosion data (stride 12: xyz, normal, uv, direction, speed) */
function explosionChunk(src: Chunk3D): Chunk3D {
  const c = src.clone();
  c.gpu = null;
  c.RangeStart = 0;
  if (config.UseGLSL120) c.VertexStride = 3 + 3 + 6;
  return c;
}

function playBulletExplosionSFX(loc: Vec3, t: number): void {
  const p = (id: number, at = 1): void => { audio.playGameSFX(id, 1.0, loc, at); };
  switch (t) {
    case -16: case -17: case -18: case -19: case -205: case -206: case -209: case -210: case -214: case -215: case -216: case -217:
      p(GameSFX.Explosion_Medium); break;
    case 1: case 2: case 3: case 4: case 201: case 202: case 204: case 211: case 212:
      p(GameSFX.Hit_Kinetic); break;
    case 5: case 6: case 7: case 101: case 207:
      p(GameSFX.Hit_Ion); break;
    case 8: case 9: case 10: case 102: case 103: case 104: case 105: case 108: case 109: case 213:
      p(GameSFX.Hit_Plasma); break;
    case 13: case 106: case 107: case 208:
      p(GameSFX.Hit_Antimatter); break;
    case 15:
      p(GameSFX.Hit_Gauss); break;
    case 16: case 205: case 214: case 215: case 216: case 217: case 17: case 206:
      p(GameSFX.Explosion_Medium); break;
    case 18: case 209:
      p(GameSFX.Explosion_Big, 2); break;
    case 19: case 210:
      p(GameSFX.Explosion_Big_Energy, 2); break;
  }
}

/** the shrapnel the bigger explosions throw out (projectiles of kind 1, 2, 3 or 5) */
function shrapnel(ex: Explosion, P: Projectile, count: number, num: number, rot: () => Vec3, spread: number | null,
  setup: (sp: Projectile) => void): void {
  for (let i = 0; i < count; i++) {
    const sp = CreateProjectile(num);
    if (num !== 1) sp.Num = 1;
    sp.SetLocation(ex.Location);
    sp.SetRotation(rot());
    if (spread !== null) {
      const TM1 = P.Orientation.clone();
      sp.Orientation = TM1.add(sp.Orientation.mul(P.Radius * spread));
      sp.Orientation.Normalize();
    }
    setup(sp);
  }
}

class BulletExplosion extends Explosion {
  constructor(Object: Object3D | null, P: Projectile, ExplType: number, ExplLocation: Vec3, Speed: number) {
    super();
    this.TimeLastUpdate = P.TimeLastUpdate;
    this.ExplosionTypeByClass = 2;
    let InternalExplosionType = 0;
    this.AABB = P.AABB.map((v) => v.clone());
    this.SetLocation(P.Location);
    this.Orientation = P.Orientation.clone();
    this.ObjectStatus = P.ObjectStatus;
    this.ExplosionType = ExplType;
    this.VelocityOrientation = P.Orientation.mul(-1);
    this.OldSpeed = Speed;
    const gfxDir = (sp: Projectile, f: (g: ParticleSystem) => void): void => {
      for (const t of sp.GraphicFX) {
        const g = alive(t);
        if (g) f(g);
      }
    };
    const rot3 = (): Vec3 => new Vec3(360 * fRand0(), 360 * fRand0(), 360 * fRand0());
    const rotY = (x: number) => (): Vec3 => new Vec3(x * fRand0(), 360 * fRand0(), 0);
    const debris = (sp: Projectile, endDiv: number, startDiv: number, life: number): void => {
      gfxDir(sp, (g) => {
        g.Direction = sp.Orientation.mul(-1);
        g.Speed = g.Speed / 2;
        g.SetStartLocation(this.Location);
      });
      sp.ObjectStatus = this.ObjectStatus;
      sp.SpeedEnd = sp.Speed / endDiv;
      sp.SpeedStart = sp.Speed / startDiv;
      sp.Lifetime = sp.Age = life + fRand0();
    };
    const hit = (): void => {
      if (Object !== null) this.VelocityOrientation = Object.Orientation.clone();
      this.OldSpeed = Speed;
      this.Lifetime = 0.5;
      if (P.GraphicFX.length && alive(P.GraphicFX[0])) {
        this.newGFX(1);
        this.GraphicFX[0] = createParticleSystem();
        const g = this.GraphicFX[0];
        const pg = P.GraphicFX[0]!;
        SetExplosionGFX(g, 0);
        const R = (pg.ColorStart.r + pg.ColorEnd.r) / 2, Gc = (pg.ColorStart.g + pg.ColorEnd.g) / 2, B = (pg.ColorStart.b + pg.ColorEnd.b) / 2;
        g.Light = createPointLight(new Vec3(), R, Gc, B, 0.0, 0.005);
        g.ColorStart = { ...pg.ColorStart };
        g.ColorEnd = { ...pg.ColorEnd };
        g.Speed = 150;
        g.ParticlesPerSec = pg.ParticlesPerSec;
        g.SizeStart = pg.SizeStart;
        g.SizeEnd = pg.SizeEnd;
        g.SizeVar = pg.SizeVar;
        g.Life = this.Lifetime;
        g.NeedStop = false;
        g.SetStartLocation(ExplLocation);
      }
      P.NeedStopPartic = true;
      this.NeedStop = false;
    };
    switch (ExplType) {
      case -16: case -17: case -18: case -19: case -205: case -206: case -209: case -210:
      case -214: case -215: case -216: case -217: {
        this.VelocityOrientation = P.Orientation.clone();
        this.OldSpeed = P.Speed - 0.5 * P.Radius;
        this.Lifetime = 2.0;
        this.newGFX(1);
        const g = createParticleSystem();
        this.GraphicFX[0] = g;
        SetExplosionGFX(g, 1);
        g.Speed = 0.5 * P.Radius;
        g.SpeedVar = fRand0();
        g.SetStartLocation(P.Location);
        if (P.Speed !== 0) g.Theta = 360;
        g.ParticlesPerSec = Math.trunc(30 * P.Radius);
        g.CreationType = ParticleCreationType.Sphere;
        g.CreationSize = new Vec3(this.AABB[0].x, this.AABB[0].y, this.AABB[0].z);
        g.RotateSystemAndParticlesByAngle(P.Rotation);
        const ttt = Math.trunc(3 * P.Radius) + Math.trunc(fRand0() * 3 * P.Radius);
        for (let i = 0; i < ttt; i++) {
          const sp = CreateProjectile(1);
          sp.SetLocation(this.Location);
          sp.SetRotation(rot3());
          const TM1 = P.Orientation.mul(P.Speed);
          sp.Orientation = TM1.add(sp.Orientation.mul(P.Radius * 6));
          sp.Orientation.Normalize();
          gfxDir(sp, (gg) => {
            gg.Direction = sp.Orientation.mul(-1);
            gg.Speed = 1.5;
            gg.SetStartLocation(this.Location);
          });
          sp.ObjectStatus = this.ObjectStatus;
          sp.Speed = P.Speed + P.Radius * 1.5 + 2 * fRand0();
          sp.SpeedEnd = 0;
          sp.SpeedStart = sp.Speed;
          // NOTE the original sets the exploding projectile's Age here, not the shrapnel's
          sp.Lifetime = P.Age = 2 + fRand0();
        }
        InternalExplosionType = 2;
        break;
      }
      case 101: case 102: case 103: case 104: case 105: case 203: case 204: case 211: case 212:
      case 1: case 2: case 3: case 4: case 13: case 106: case 107: case 208: case 15:
      case 5: case 6: case 7: case 207: case 8: case 9: case 10: case 108: case 109: case 213:
        hit();
        break;
      case 16: case 214: case 215: case 216: case 217: case 17: {
        this.VelocityOrientation = P.Orientation.mul(-1);
        this.OldSpeed = Speed = 0;
        this.Lifetime = 2.0;
        this.newGFX(1);
        const g = createParticleSystem();
        this.GraphicFX[0] = g;
        SetExplosionGFX(g, 10);
        if (ExplType === 17) {
          g.ParticlesPerSec = 30;
          g.CreationSize = new Vec3(2.0, 0.3, 2.0);
        }
        g.SetStartLocation(P.Location);
        const ttt = (ExplType === 17 ? 1 + fRand() : 3 + fRand()) * P.Radius;
        shrapnel(this, P, Math.ceil(ttt), 1, rotY(20), 2, (sp) => debris(sp, 7, 4, 2));
        InternalExplosionType = 2;
        break;
      }
      case 18: case 209: {
        this.VelocityOrientation = P.Orientation.mul(-1);
        this.OldSpeed = Speed = 0;
        this.Lifetime = 2.0;
        this.newGFX(1);
        const g = createParticleSystem();
        this.GraphicFX[0] = g;
        SetExplosionGFX(g, 8);
        g.SetStartLocation(P.Location);
        const ttt = (2 + fRand()) * P.Radius;
        shrapnel(this, P, Math.ceil(ttt), 2, rotY(20), 2, (sp) => debris(sp, 7, 4, 2));
        InternalExplosionType = 2;
        break;
      }
      case 19: case 210: {
        this.VelocityOrientation = P.Orientation.mul(-1);
        this.OldSpeed = Speed = 0;
        this.Lifetime = 2.0;
        this.newGFX(2);
        const g0 = createParticleSystem();
        this.GraphicFX[0] = g0;
        SetExplosionGFX(g0, 7);
        g0.SetStartLocation(P.Location);
        const g1 = createParticleSystem();
        this.GraphicFX[1] = g1;
        SetExplosionGFX(g1, 9);
        g1.SetStartLocation(P.Location);
        shrapnel(this, P, 4, 3, rotY(5), 4, (sp) => debris(sp, 6, 2, 3));
        let ttt = (3 + fRand()) * P.Radius;
        shrapnel(this, P, Math.ceil(ttt), 2, rotY(5), null, (sp) => debris(sp, 6, 2, 3));
        ttt = (3 + fRand()) * P.Radius;
        shrapnel(this, P, Math.ceil(ttt), 3, rotY(5), null, (sp) => debris(sp, 6, 2, 3));
        ttt = (3 + fRand() * 5) * P.Radius;
        shrapnel(this, P, Math.ceil(ttt), 1, rotY(5), null, (sp) => debris(sp, 6, 2, 3));
        ttt = (5 + fRand() * 3) * P.Radius;
        shrapnel(this, P, Math.ceil(ttt), 5, rotY(20), null, (sp) => debris(sp, 6, 2, 3));
        InternalExplosionType = 2;
        break;
      }
      case 205: case 206: {
        this.VelocityOrientation = P.Orientation.mul(-1);
        this.OldSpeed = Speed = 0;
        this.Lifetime = 2.0;
        this.newGFX(1);
        const g = createParticleSystem();
        this.GraphicFX[0] = g;
        SetExplosionGFX(g, 10);
        g.SetStartLocation(P.Location);
        InternalExplosionType = 2;
        break;
      }
    }
    if (InternalExplosionType === 2) {
      this.Texture = P.Texture.slice();
      this.Chunks = P.Chunks.map(explosionChunk);
      for (let i = 0; i < this.Chunks.length; i++) {
        const ch = this.Chunks[i], pc = P.Chunks[i];
        const va = new Float32Array(ch.VertexStride * ch.VertexQuantity);
        for (let j = 0; j < ch.VertexQuantity; j++) {
          const j1 = j * ch.VertexStride;
          const j2 = pc.IndexArray ? pc.IndexArray[pc.RangeStart + j] * pc.VertexStride : (pc.RangeStart + j) * pc.VertexStride;
          const T = new Vec3(pc.VertexArray[j2] + ch.Location.x, pc.VertexArray[j2 + 1] + ch.Location.y, pc.VertexArray[j2 + 2] + ch.Location.z);
          m33CalcPoint(T, P.CurrentRotationMat);
          va[j1] = T.x; va[j1 + 1] = T.y; va[j1 + 2] = T.z;
          const N = new Vec3(pc.VertexArray[j2 + 3], pc.VertexArray[j2 + 4], pc.VertexArray[j2 + 5]);
          m33CalcPoint(N, P.CurrentRotationMat);
          va[j1 + 3] = N.x; va[j1 + 4] = N.y; va[j1 + 5] = N.z;
          va[j1 + 6] = pc.VertexArray[j2 + 6];
          va[j1 + 7] = pc.VertexArray[j2 + 7];
        }
        ch.VertexArray = va;
        ch.Location = new Vec3();
        ch.IndexArray = null;
      }
      const tRadius2 = P.Radius / 1.5;
      const c0 = this.Chunks[0];
      for (let i = 0; i < c0.VertexQuantity; i += 3) {
        const i1 = c0.VertexStride * i;
        const v = new Vec3(c0.VertexArray[i1], c0.VertexArray[i1 + 1], c0.VertexArray[i1 + 2]);
        const VelocityTMP = fRand0() * tRadius2;
        if (config.UseGLSL120) {
          for (const k of [0, 1, 2]) {
            const ik = i1 + k * c0.VertexStride;
            c0.VertexArray[ik + 8] = v.x;
            c0.VertexArray[ik + 9] = v.y;
            c0.VertexArray[ik + 10] = v.z;
            c0.VertexArray[ik + 11] = VelocityTMP;
          }
        }
        const piece: ExplosionPiece = { Velocity: v.mul(VelocityTMP), RemainTime: 1 + fRand() / 2 };
        this.ExplosionPieceData.push(piece);
        const s = piece.Velocity.x * piece.Velocity.x + piece.Velocity.y * piece.Velocity.y + piece.Velocity.z * piece.Velocity.z;
        if (s > this.AABBResizeSpeed) this.AABBResizeSpeed = s;
      }
      this.AABBResizeSpeed = Math.sqrt(this.AABBResizeSpeed);
      if (config.UseGLSL120) {
        this.ShaderType = 2;
        this.ExplShaderSpeedDelta = 1;
        this.ExplShaderRangeFactor = 0;
      }
    }
    if (!boxInFrustum(this.Location.add(this.AABB[6]), this.Location.add(this.AABB[0]))) return;
    playBulletExplosionSFX(this.Location, ExplType);
    if (ExplType === 18 || ExplType === 209) SetupCameraShake(ExplLocation, 0.5);
    if (ExplType === 19 || ExplType === 210) SetupCameraShake(ExplLocation, 1.5);
  }
}

/** space_explosion.cpp and ground_explosion.cpp: an object falls apart into space debris (one per chunk) */
function breakIntoDebris(Object: Object3D, ObjectChunkNum: number, skipChunk: number,
  each: (d: SpaceObject, i: number) => number): void {
  const inv = Float64Array.from(Object.CurrentRotationMat);
  m33InverseRotate(inv);
  for (let i = 0; i < Object.Chunks.length; i++) {
    if (i === skipChunk) continue;
    const d = CreateSpaceDebris();
    d.ObjectType = ObjectType.SpaceDebris;
    d.DeleteAfterLeaveScene = DeleteAfterLeaveScene.enabled;
    d.Texture = [Object.Texture[i]];
    d.TextureIllum = [null];
    d.NormalMap = Object.NormalMap.length > i && Object.NormalMap[i] ? [Object.NormalMap[i]] : [];
    d.Chunks = [Object.Chunks[i].clone()];
    let LocalLocation = Object.Chunks[i].Location.clone();
    m33CalcPoint(LocalLocation, Object.CurrentRotationMat);
    LocalLocation = Object.HitBB[i].Location.sub(LocalLocation);
    m33CalcPoint(LocalLocation, inv);
    d.Chunks[0].Location = LocalLocation.mul(-1);
    metadataInitialization(d);
    d.SetLocation(Object.Location.add(Object.HitBB[i].Location));
    d.SetRotation(Object.Rotation);
    const explType = each(d, i);
    if (ObjectChunkNum !== -1 && ObjectChunkNum === i) {
      CreateSpaceExplosion(d, explType, d.Location, d.Speed, -1);
      ReleaseSpaceObject(d);
    }
  }
}

/** sModel3D::MetadataInitialization on an object (the debris gets the boxes of its one chunk) */
function metadataInitialization(o: Object3D): void {
  const m = new Model3D();
  m.Chunks = o.Chunks;
  m.MetadataInitialization();
  o.AABB = m.AABB;
  o.OBB = m.OBB;
  o.HitBB = m.HitBB;
  o.GeometryCenter = m.GeometryCenter;
  o.Radius = m.Radius;
  o.Width = m.Width;
  o.Length = m.Length;
  o.Height = m.Height;
}

class SpaceExplosion extends Explosion {
  constructor(Object: Object3D, ExplType: number, ExplLocation: Vec3, Speed: number, ObjectChunkNum: number) {
    super();
    this.TimeLastUpdate = Object.TimeLastUpdate;
    this.ExplosionTypeByClass = 1;
    let InternalExplosionType = 0;
    let CurrentPenalty = 1.0;
    // NOTE ObjectStatus is still the constructor's Enemy here, so the penalty always applies
    if (this.ObjectStatus === ObjectStatus.Enemy) CurrentPenalty = G.GameEnemyWeaponPenalty + 1.0;
    this.ObjectStatus = Object.ObjectStatus;
    this.ExplosionType = ExplType;
    let MeshAcc = 0;
    const R = Object.Radius;
    const start = (life: number, acc: number, gfx: number): void => {
      InternalExplosionType = 2;
      this.OldSpeed = Speed;
      this.Lifetime = life;
      MeshAcc = acc;
      this.SetLocation(Object.Location);
      this.Orientation = Object.Orientation.clone();
      this.newGFX(gfx);
    };
    const theta = (g: ParticleSystem, min: boolean): void => {
      if (min ? Speed > 0.01 : Speed !== 0) g.Theta = 360 / (Speed / 8);
    };
    const pieces = (count: number, spread: number, speedAdd: number, life: number, f: (g: ParticleSystem) => void): void => {
      for (let i = 0; i < count; i++) {
        const sp = CreateProjectile(1);
        sp.SetLocation(this.Location);
        sp.SetRotation(new Vec3(360 * fRand0(), 360 * fRand0(), 360 * fRand0()));
        const TM1 = Object.Orientation.mul(Speed);
        sp.Orientation = TM1.add(sp.Orientation.mul(spread));
        sp.Orientation.Normalize();
        for (const t of sp.GraphicFX) {
          const g = alive(t);
          if (g) {
            g.Direction = sp.Orientation.mul(-1);
            f(g);
          }
        }
        sp.ObjectStatus = this.ObjectStatus;
        sp.Speed = Speed + speedAdd + 2 * fRand0();
        sp.SpeedEnd = 0;
        sp.SpeedStart = sp.Speed;
        sp.Lifetime = sp.Age = life + fRand0();
        sp.Damage.divBy(CurrentPenalty);
      }
    };
    if (ExplType === 1) {
      start(2.0, 10.0, 1);
      const tRadius = R / 2;
      const g = createParticleSystem();
      this.GraphicFX[0] = g;
      SetExplosionGFX(g, 1);
      g.Speed = 1.5 * R;
      g.SpeedVar = fRand0();
      g.MoveSystem(Object.Location);
      g.ParticlesPerSec = Math.trunc(20 * R);
      g.Direction = Object.Orientation.clone();
      g.CreationType = ParticleCreationType.Sphere;
      g.CreationSize = new Vec3(tRadius, tRadius, tRadius);
      g.Life = 1.5;
      g.SizeStart = tRadius / 1.5;
      const ttt = Math.trunc(3 * R) + Math.trunc(fRand0() * 3 * R);
      pieces(ttt, R * 6, R * 2, 1.0, (gg) => { gg.Speed = 1.5; });
    }
    if (ExplType === 2) {
      start(3.0, 20.0, 3);
      let g = createParticleSystem();
      this.GraphicFX[1] = g;
      SetExplosionGFX(g, 3);
      g.MoveSystem(Object.Location);
      g.ParticlesPerSec = Math.trunc(5 * R);
      g.Direction = Object.Orientation.clone();
      g.CreationSize = new Vec3(R / 4, R / 4, R / 4);
      g = createParticleSystem();
      this.GraphicFX[2] = g;
      SetExplosionGFX(g, 4);
      g.Speed = R / 3;
      g.SpeedVar = fRand0();
      g.MoveSystem(Object.Location);
      theta(g, false);
      g.ParticlesPerSec = Math.trunc(5 * R);
      g.Direction = Object.Orientation.clone();
      g.NeedStop = false;
      g = createParticleSystem();
      this.GraphicFX[0] = g;
      SetExplosionGFX(g, 2);
      g.Speed = R * 1.2;
      g.SpeedVar = fRand0();
      g.MoveSystem(Object.Location);
      theta(g, false);
      g.ParticlesPerSec = Math.trunc(10 * R);
      g.Direction = Object.Orientation.clone();
      const ttt = Math.trunc(R) + Math.trunc(fRand0() * R);
      pieces(ttt, R / 4, R / 2, 1.5, (gg) => {
        gg.Speed = 2.5;
        gg.ColorStart = { r: 0.3, g: 1.0, b: 1.0 };
        gg.ColorEnd = { r: 0.0, g: 1.0, b: 1.0 };
      });
    }
    if (ExplType === 31 || ExplType === 33) InternalExplosionType = 1;
    const twoGFX = (gfx1: number, div1: number, gfx0: number, min: boolean): void => {
      start(3.0, 20.0, 2);
      let g = createParticleSystem();
      this.GraphicFX[1] = g;
      SetExplosionGFX(g, gfx1);
      g.Speed = R / div1;
      g.SpeedVar = fRand0();
      g.MoveSystem(Object.Location);
      theta(g, min);
      g.ParticlesPerSec = Math.trunc(15 * R);
      g.Direction = Object.Orientation.clone();
      g = createParticleSystem();
      this.GraphicFX[0] = g;
      SetExplosionGFX(g, gfx0);
      g.Speed = R * 1.1;
      g.SpeedVar = fRand0();
      g.MoveSystem(Object.Location);
      theta(g, min);
      g.ParticlesPerSec = Math.trunc(15 * R);
      g.Direction = Object.Orientation.clone();
    };
    if (ExplType === 32) twoGFX(6, 1.4, 5, true);
    if (ExplType === 34) twoGFX(12, 1.4, 11, false);
    if (ExplType === 3) {
      twoGFX(6, 1.3, 5, false);
      const ttt = Math.trunc(0.5 * R) + Math.trunc(fRand0() * R);
      pieces(ttt, R / 2, R / 2, 1.5, (gg) => { gg.Speed = 2.5; });
    }
    if (ExplType === 4) {
      InternalExplosionType = 2;
      this.OldSpeed = Speed / 5;
      this.Lifetime = 1.0;
      MeshAcc = 5.0;
    }
    if (InternalExplosionType === 1) {
      breakIntoDebris(Object, ObjectChunkNum, -1, (d) => {
        d.Speed = Speed - 2 * fRand();
        d.RotationSpeed.x = 2 * fRand0();
        d.RotationSpeed.y = 2 * fRand0();
        d.ArmorInitialStatus = d.ArmorCurrentStatus = 1;
        d.ObjectStatus = Object.ObjectStatus;
        d.ShowStatus = false;
        let t = 32;
        if (ExplType === 33) {
          d.BossPartCountDown = 3 * fRand();
          t = 34;
        }
        return t;
      });
      this.Lifetime = 0;
    }
    if (InternalExplosionType === 2) this.meshExplosion(Object, MeshAcc);
    if (!boxInFrustum(this.Location.add(this.AABB[6]), this.Location.add(this.AABB[0]))) return;
    switch (ExplType) {
      case 1: audio.playGameSFX(GameSFX.Explosion_Small, 1, ExplLocation, 2); break;
      case 2: audio.playGameSFX(GameSFX.Explosion_Big, 1, ExplLocation, 2); break;
      case 3: audio.playGameSFX(GameSFX.Explosion_Big_Energy, 1, ExplLocation, 2); break;
      case 32: audio.playGameSFX(GameSFX.Explosion_Big_Energy, 1, ExplLocation, 2); break;
      case 34: audio.playGameSFX(GameSFX.Explosion_Big, 1, ExplLocation, 2); break;
    }
    switch (ExplType) {
      case 1: SetupCameraShake(ExplLocation, 0.2); break;
      case 2: case 3: case 32: case 34: SetupCameraShake(ExplLocation, 0.5); break;
    }
  }

  /** the "InternalExplosionType 2" part: the object's model split into its small triangles, some left out */
  private meshExplosion(Object: Object3D, MeshAcc: number): void {
    this.AABB = Object.AABB.map((v) => v.clone());
    this.VelocityOrientation = Object.Orientation.clone();
    let TotalCount = 0;
    this.Texture = Object.Texture.slice();
    this.Chunks = Object.Chunks.map((c) => c.clone());
    const NeedIn = config.VisualEffectsQuality;
    for (let i = 0; i < this.Chunks.length; i++) {
      const ch = this.Chunks[i], oc = Object.Chunks[i];
      ch.gpu = null;
      ch.RangeStart = 0;
      ch.IndexArray = null;
      ch.VertexArrayWithSmallTriangles = new Float32Array(0);
      ch.VertexArrayWithSmallTrianglesCount = 0;
      ch.VertexQuantity = 0;
      let k = 0;
      let NeedInCur = NeedIn;
      let tricount = 0;
      ch.VertexStride = oc.VertexStride;
      if (config.UseGLSL120) ch.VertexStride = 3 + 3 + 6;
      const va = new Float32Array(ch.VertexStride * oc.VertexArrayWithSmallTrianglesCount);
      const rm = Object.CurrentRotationMat;
      const TransMat = new Float64Array([rm[0], rm[1], rm[2], 0, rm[3], rm[4], rm[5], 0, rm[6], rm[7], rm[8], 0, 0, 0, 0, 1]);
      const TransMatTMP = mat44();
      const TransMatNorm = mat33();
      if (oc.Rotation.x !== 0 || oc.Rotation.y !== 0 || oc.Rotation.z !== 0) {
        m44CreateRotate(TransMatTMP, oc.Rotation);
        m33CreateRotate(TransMatNorm, oc.Rotation);
      }
      if (oc.GeometryAnimation.x !== 0 || oc.GeometryAnimation.y !== 0 || oc.GeometryAnimation.z !== 0) {
        const a = mat44();
        m44CreateRotate(a, oc.GeometryAnimation);
        m44Mult(TransMatTMP, a);
        const an = mat33();
        m33CreateRotate(an, oc.GeometryAnimation);
        m33Mult(TransMatNorm, an);
      }
      m44Translate(TransMatTMP, ch.Location);
      m44Mult(TransMat, TransMatTMP);
      m33Mult(TransMatNorm, rm);
      const src = oc.VertexArrayWithSmallTriangles, ss = oc.VertexStride;
      for (let j = 0; j < oc.VertexArrayWithSmallTrianglesCount; j++) {
        if (NeedInCur <= 0) {
          const j1 = k * ch.VertexStride, j2 = j * ss;
          const T = new Vec3(src[j2], src[j2 + 1], src[j2 + 2]);
          m44CalcPoint(T, TransMat);
          va[j1] = T.x; va[j1 + 1] = T.y; va[j1 + 2] = T.z;
          const N = new Vec3(src[j2 + 3], src[j2 + 4], src[j2 + 5]);
          m33CalcPoint(N, TransMatNorm);
          va[j1 + 3] = N.x; va[j1 + 4] = N.y; va[j1 + 5] = N.z;
          va[j1 + 6] = src[j2 + 6];
          va[j1 + 7] = src[j2 + 7];
          ch.VertexQuantity++;
          k++;
          if (tricount === 2) NeedInCur = NeedIn;
        } else if (tricount === 2) {
          NeedInCur--;
        }
        tricount++;
        if (tricount >= 3) tricount = 0;
      }
      ch.VertexArray = va;
      ch.Location = new Vec3();
      ch.Rotation = new Vec3();
      ch.GeometryAnimation = new Vec3();
      TotalCount += ch.VertexQuantity;
    }
    const Dist = Object.Length * Object.Length + Object.Height * Object.Height + Object.Width * Object.Width;
    void TotalCount;
    for (const ch of this.Chunks) {
      const va = ch.VertexArray, s = ch.VertexStride;
      for (let i = 0; i < ch.VertexQuantity; i += 3) {
        const i1 = s * i, i2 = i1 + s, i3 = i2 + s;
        const v = new Vec3(
          (va[i1] + va[i2] + va[i3]) / 3,
          (va[i1 + 1] + va[i2 + 1] + va[i3 + 1]) / 3,
          (va[i1 + 2] + va[i2 + 2] + va[i3 + 2]) / 3,
        );
        const Shift = v.x * v.x + v.y * v.y + v.z * v.z + fRand0();
        let Acc = (MeshAcc / 1000) * (Dist / Shift) * (MeshAcc / Object.Radius);
        if (Acc > MeshAcc) Acc = MeshAcc + fRand0();
        if (Acc < -MeshAcc) Acc = -MeshAcc - fRand0();
        let speed = Acc;
        if (config.UseGLSL120) {
          if (Shift / Dist < 0.01) speed = Acc + 4 * fRand0();
          for (const ik of [i1, i2, i3]) {
            va[ik + 8] = v.x; va[ik + 9] = v.y; va[ik + 10] = v.z;
            va[ik + 11] = speed;
          }
        }
        const piece: ExplosionPiece = { Velocity: v.clone(), RemainTime: 0 };
        if (Shift / Dist < 0.01) piece.Velocity = piece.Velocity.mul(Acc + 4 * fRand0());
        else piece.Velocity = piece.Velocity.mul(Acc);
        piece.RemainTime = (this.Lifetime - 1) + fRand();
        if (piece.RemainTime < 0) piece.RemainTime = 0;
        this.ExplosionPieceData.push(piece);
        const sp = piece.Velocity.x ** 2 + piece.Velocity.y ** 2 + piece.Velocity.z ** 2;
        if (sp > this.AABBResizeSpeed) this.AABBResizeSpeed = sp;
      }
    }
    if (config.UseGLSL120) {
      this.ShaderType = 2;
      this.ExplShaderSpeedDelta = 1;
      this.ExplShaderRangeFactor = 0;
    }
    this.AABBResizeSpeed = Math.sqrt(this.AABBResizeSpeed);
  }
}

class GroundExplosion extends Explosion {
  constructor(Object: GroundObject, ExplType: number, ExplLocation: Vec3, ObjectChunkNum: number) {
    super();
    this.TimeLastUpdate = Object.TimeLastUpdate;
    this.ExplosionTypeByClass = 3;
    if (ExplType === 1 || ExplType === 2) {
      breakIntoDebris(Object, ObjectChunkNum, Object.TrackChunkNum, (d, i) => {
        d.ShaderType = 1;
        if (ExplType === 1) {
          d.Speed = 0;
          const v = d.Location.sub(ExplLocation);
          d.Velocity = d.Radius !== 0 ? v.mul(1 / d.Radius) : v.mul(1 + 5 * fRand());
          d.RotationSpeed.x = 2 * fRand0();
          d.RotationSpeed.y = 2 * fRand0();
        }
        if (ExplType === 2) {
          const wheel = Object.WheelChunkNums.includes(i);
          const v = d.Location.sub(Object.Location);
          if (wheel) {
            const rx = -5 - 15 * fRand();
            const ry = 10 * fRand0();
            rotateVec(v, new Vec3(rx, ry, 0));
            d.Velocity = d.Radius !== 0 ? v.mul((1 + 5 * fRand()) / d.Radius) : v.mul(1 + 5 * fRand());
            d.RotationSpeed.x = 40 + 80 * fRand0();
            d.RotationSpeed.y = 40 + 80 * fRand0();
            d.RotationSpeed.z = 40 + 80 * fRand0();
          } else {
            d.Velocity = d.Radius !== 0 ? v.mul(5 / d.Radius) : v.mul(1 + 5 * fRand());
            d.RotationSpeed.x = 2 * fRand0();
            d.RotationSpeed.y = 2 * fRand0();
            d.RotationSpeed.z = 2 * fRand0();
          }
        }
        d.ArmorInitialStatus = d.ArmorCurrentStatus = 1;
        d.ObjectStatus = Object.ObjectStatus;
        d.ShowStatus = false;
        return 32;
      });
      this.Lifetime = 0;
    }
    if (!boxInFrustum(this.Location.add(this.AABB[6]), this.Location.add(this.AABB[0]))) return;
    if (ExplType === 1 || ExplType === 2) {
      SetupCameraShake(ExplLocation, 0.5);
      audio.playGameSFX(GameSFX.Explosion_Big_Energy, 1, ExplLocation, 2);
    }
  }
}

export function CreateBulletExplosion(Object: Object3D | null, P: Projectile, ExplType: number, ExplLocation: Vec3, Speed: number): void {
  world.ExplosionList.unshift(new BulletExplosion(Object, P, ExplType, ExplLocation, Speed));
}

export function CreateGroundExplosion(Object: GroundObject, ExplType: number, ExplLocation: Vec3, ObjectChunkNum: number): void {
  world.ExplosionList.unshift(new GroundExplosion(Object, ExplType, ExplLocation, ObjectChunkNum));
}

export function CreateSpaceExplosion(Object: Object3D, ExplType: number, ExplLocation: Vec3, Speed: number, ObjectChunkNum: number): void {
  world.ExplosionList.unshift(new SpaceExplosion(Object, ExplType, ExplLocation, Speed, ObjectChunkNum));
}
