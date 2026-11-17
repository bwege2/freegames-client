// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/object3d/object3d.h,
// object3d.cpp (without the OpenGL drawing, which is in render/), object3_functions.cpp,
// collision_detection.cpp and shake.h. Changed for the browser by the freegames project, 2026.
import {
  Vec3, type Mat33, mat33, m33InverseRotate, m33CalcPoint, m33CreateRotate, m33Mult, vwSqrtf,
  mat44, m44Identity, m44CreateRotate, m44Translate, m44Mult, m44CalcPoint,
} from '../core/math.ts';
import { type BoundingBox, type Chunk3D, type HitBB, type Model3D, type OBB, boxOf } from '../core/model3d.ts';
import { sphereMeshCollision } from '../core/collision.ts';
import type { XMLDocument } from '../core/xml.ts';

export const ObjectStatus = { none: 0, Enemy: 1, Ally: 2, Player: 3 };
export type ObjectStatus = number;

export function objectsStatusFoe(a: ObjectStatus, b: ObjectStatus): boolean {
  return (a === ObjectStatus.Enemy && (b === ObjectStatus.Ally || b === ObjectStatus.Player))
    || (b === ObjectStatus.Enemy && (a === ObjectStatus.Ally || a === ObjectStatus.Player));
}

export const ObjectType = { none: 0, EarthFighter: 1, AlienFighter: 2, AlienMotherShip: 3, PirateShip: 4, PirateVehicle: 5, PirateBuilding: 6, SmallAsteroid: 7, SpaceDebris: 8, ShipWeapon: 9, Projectile: 10, Explosion: 11, CivilianBuilding: 12, BasePart: 13, Planet: 14, Planetoid: 15, BigAsteroid: 16 };
export type ObjectType = number;

export const DeleteAfterLeaveScene = { disabled: 0, enabled: 1, showed: 2, need_delete: 3, wait_delay: 4 };
export type DeleteAfterLeaveScene = number;
export const DeleteAfterLeaveSceneDelay = 1.0;

/** cDamage */
export class Damage {
  Kinetic: number;
  EM: number;
  constructor(kinetic = 0, em = kinetic) {
    this.Kinetic = kinetic;
    this.EM = em;
  }
  set(v: number): this { this.Kinetic = v; this.EM = v; return this; }
  divBy(v: number): this { this.Kinetic /= v; this.EM /= v; return this; }
  mulBy(v: number): this { this.Kinetic *= v; this.EM *= v; return this; }
  mul(v: number): Damage { return new Damage(this.Kinetic * v, this.EM * v); }
  full(): number { return this.Kinetic + this.EM; }
  clone(): Damage { return new Damage(this.Kinetic, this.EM); }
}

/** sTimeSheet (script.h) */
export class TimeSheet {
  InUse = false;
  Time = 0;
  AI_Mode = 0;
  xmlAI: XMLDocument | null = null;
  Speed = 0;
  Acceler = 1;
  SpeedLR = 0;
  AccelerLR = 1;
  SpeedUD = 0;
  AccelerUD = 1;
  SpeedByCamFB = 0;
  AccelerByCamFB = 1;
  SpeedByCamLR = 0;
  AccelerByCamLR = 1;
  SpeedByCamUD = 0;
  AccelerByCamUD = 1;
  Rotation = new Vec3();
  RotationAcceler = new Vec3(1, 1, 1);
  SetAngle = new Vec3();
  NeedSetAngle = false;
  Fire = false;
  BossFire = false;
  Targeting = false;
  clone(): TimeSheet {
    const t = new TimeSheet();
    Object.assign(t, this);
    t.Rotation = this.Rotation.clone();
    t.RotationAcceler = this.RotationAcceler.clone();
    t.SetAngle = this.SetAngle.clone();
    return t;
  }
}

/** set by script.ts (UnpackAIMode), to avoid an import cycle */
export const hooks = {
  unpackAIMode: (_list: TimeSheet[]): void => {},
};

let nextId = 1;

export class Object3D {
  readonly id = nextId++;
  // sModel3D
  Chunks: Chunk3D[] = [];
  GlobalVertexArrayCount = 0;
  GlobalIndexArrayCount = 0;
  Model: Model3D | null = null;
  AABB: BoundingBox = boxOf(0, 0, 0, 0, 0, 0);
  OBB: OBB = { Box: boxOf(0, 0, 0, 0, 0, 0), Location: new Vec3() };
  HitBB: HitBB[] = [];
  GeometryCenter = new Vec3();
  Radius = 0;
  Width = 1;
  Length = 1;
  Height = 1;

  NeedCullFaces = true;
  NeedAlphaTest = false;
  ObjectStatus = ObjectStatus.none;
  ObjectType = ObjectType.none;
  InternalType = 0;
  DeleteAfterLeaveScene = DeleteAfterLeaveScene.disabled;
  Lifetime = -1;
  Orientation = new Vec3(0, 0, 1);
  Rotation = new Vec3();
  OldRotationInv = new Vec3();
  Location = new Vec3();
  PrevLocation = new Vec3();
  TimeLastUpdate = -1;
  TimeDelta = 0;
  Texture: (string | null)[] = [];
  TextureIllum: (string | null)[] = [];
  NormalMap: (string | null)[] = [];
  PromptDrawDist2 = -1;
  InternalLights = 0;
  Diffuse = [1, 1, 1, 1];
  Specular = [1, 1, 1, 1];
  Ambient = [0.1, 0.1, 0.1, 0.1];
  Power = 64;
  ArmorCurrentStatus = 0;
  ArmorInitialStatus = 0;
  ShieldCurrentStatus = 0;
  ShieldInitialStatus = 0;
  ShieldRechargeRate = 0;
  ShowStatus = true;
  ShowStatusAllTime = false;
  CurrentRotationMat: Mat33 = mat33();
  OldInvRotationMat: Mat33 = mat33();
  TimeSheetList: TimeSheet[] = [];
  ShaderType = 1;
  ExplShaderSpeedDelta = 0;
  ExplShaderRangeFactor = 0;
  /** the renderer's objects */
  view: unknown = null;
  /** erased from its list (a weak_ptr to it has expired) */
  released = false;

  /** the destructor */
  Destroy(): void {}

  SetChunkLocation(newLocation: Vec3, n: number): void {
    if (this.HitBB.length) {
      const inv = Float64Array.from(this.CurrentRotationMat);
      m33InverseRotate(inv);
      m33CalcPoint(this.HitBB[n].Location, inv);
      this.HitBB[n].Location.subFrom(this.Chunks[n].Location.sub(newLocation));
      m33CalcPoint(this.HitBB[n].Location, this.CurrentRotationMat);
      this.recalcBoxes(inv);
    }
    this.Chunks[n].Location = newLocation.clone();
  }

  SetChunkRotation(newRotation: Vec3, n: number): void {
    if (this.HitBB.length) {
      const cur2 = mat33();
      m33CreateRotate(cur2, newRotation);
      const oldInv2 = mat33();
      m33CreateRotate(oldInv2, this.Chunks[n].Rotation);
      m33InverseRotate(oldInv2);
      const inv = Float64Array.from(this.CurrentRotationMat);
      m33InverseRotate(inv);
      const h = this.HitBB[n];
      m33CalcPoint(h.Location, inv);
      h.Location.subFrom(this.Chunks[n].Location);
      m33CalcPoint(h.Location, oldInv2);
      m33CalcPoint(h.Location, cur2);
      h.Location.addTo(this.Chunks[n].Location);
      m33CalcPoint(h.Location, this.CurrentRotationMat);
      for (const p of h.Box) {
        m33CalcPoint(p, inv);
        m33CalcPoint(p, oldInv2);
        m33CalcPoint(p, cur2);
        m33CalcPoint(p, this.CurrentRotationMat);
      }
      this.recalcBoxes(inv);
    }
    this.Chunks[n].Rotation = newRotation.clone();
  }

  /** the part SetChunkLocation and SetChunkRotation share: OBB, size, radius and AABB from the HitBBs */
  private recalcBoxes(inv: Mat33): void {
    let minX = 10000, maxX = -10000, minY = 10000, maxY = -10000, minZ = 10000, maxZ = -10000;
    for (let i = 0; i < this.Chunks.length; i++) {
      const h = this.HitBB[i];
      m33CalcPoint(h.Location, inv);
      for (const p of h.Box) {
        m33CalcPoint(p, inv);
        const x = p.x + h.Location.x, y = p.y + h.Location.y, z = p.z + h.Location.z;
        if (minX > x) minX = x;
        if (maxX < x) maxX = x;
        if (minY > y) minY = y;
        if (maxY < y) maxY = y;
        if (minZ > z) minZ = z;
        if (maxZ < z) maxZ = z;
        m33CalcPoint(p, this.CurrentRotationMat);
      }
      m33CalcPoint(h.Location, this.CurrentRotationMat);
    }
    this.OBB.Box = boxOf(minX, maxX, minY, maxY, minZ, maxZ);
    this.Width = Math.abs(maxX - minX);
    this.Height = Math.abs(maxY - minY);
    this.Length = Math.abs(maxZ - minZ);
    const w2 = this.Width / 2, l2 = this.Length / 2, h2 = this.Height / 2;
    this.Radius = vwSqrtf(w2 * w2 + l2 * l2 + h2 * h2);
    this.OBB.Location = new Vec3((maxX + minX) / 2, (maxY + minY) / 2, (maxZ + minZ) / 2);
    for (const p of this.OBB.Box) {
      p.subFrom(this.OBB.Location);
      m33CalcPoint(p, this.CurrentRotationMat);
    }
    m33CalcPoint(this.OBB.Location, this.CurrentRotationMat);
    this.aabbFromObb();
  }

  private aabbFromObb(init10000 = false): void {
    let minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number;
    const o = this.OBB;
    if (init10000) {
      minX = 10000; maxX = -10000; minY = 10000; maxY = -10000; minZ = 10000; maxZ = -10000;
    } else {
      minX = maxX = o.Box[0].x + o.Location.x;
      minY = maxY = o.Box[0].y + o.Location.y;
      minZ = maxZ = o.Box[0].z + o.Location.z;
    }
    for (const p of o.Box) {
      const x = p.x + o.Location.x, y = p.y + o.Location.y, z = p.z + o.Location.z;
      if (minX > x) minX = x;
      if (minY > y) minY = y;
      if (minZ > z) minZ = z;
      if (maxX < x) maxX = x;
      if (maxY < y) maxY = y;
      if (maxZ < z) maxZ = z;
    }
    this.AABB = boxOf(minX, maxX, minY, maxY, minZ, maxZ);
  }

  SetLocation(newLocation: Vec3): void {
    this.PrevLocation = this.Location;
    this.Location = newLocation.clone();
  }

  SetRotation(newRotation: Vec3): void {
    this.OldRotationInv = new Vec3(-this.Rotation.x, -this.Rotation.y, -this.Rotation.z);
    this.Rotation = this.Rotation.add(newRotation);
    this.OldInvRotationMat = Float64Array.from(this.CurrentRotationMat);
    m33InverseRotate(this.OldInvRotationMat);
    m33CreateRotate(this.CurrentRotationMat, this.Rotation);
    m33CalcPoint(this.Orientation, this.OldInvRotationMat);
    m33CalcPoint(this.Orientation, this.CurrentRotationMat);
    if (this.HitBB.length) {
      for (let i = 0; i < this.Chunks.length; i++) {
        m33CalcPoint(this.HitBB[i].Location, this.OldInvRotationMat);
        m33CalcPoint(this.HitBB[i].Location, this.CurrentRotationMat);
        for (const p of this.HitBB[i].Box) {
          m33CalcPoint(p, this.OldInvRotationMat);
          m33CalcPoint(p, this.CurrentRotationMat);
        }
      }
    }
    m33CalcPoint(this.OBB.Location, this.OldInvRotationMat);
    m33CalcPoint(this.OBB.Location, this.CurrentRotationMat);
    for (const p of this.OBB.Box) {
      m33CalcPoint(p, this.OldInvRotationMat);
      m33CalcPoint(p, this.CurrentRotationMat);
    }
    this.aabbFromObb(true);
  }

  /**
   * The part of cObject3D::Draw that changes the game: an object outside the view frustum that was
   * shown gets deleted (DeleteAfterLeaveScene), and the status bars stay once the object was hit.
   * `inFrustum` is vw_BoxInFrustum(Location + AABB[6], Location + AABB[0]).
   */
  DrawLogic(inFrustum: boolean): boolean {
    if (!this.Chunks.length) return false;
    if (!inFrustum) {
      if (this.DeleteAfterLeaveScene === DeleteAfterLeaveScene.showed) this.DeleteAfterLeaveScene = DeleteAfterLeaveScene.need_delete;
      return false;
    }
    if (this.DeleteAfterLeaveScene === DeleteAfterLeaveScene.enabled) this.DeleteAfterLeaveScene = DeleteAfterLeaveScene.showed;
    if (this.DeleteAfterLeaveScene === DeleteAfterLeaveScene.wait_delay) {
      this.DeleteAfterLeaveScene = DeleteAfterLeaveScene.showed;
      this.Lifetime = -1;
    }
    if (this.ShowStatus && this.ArmorInitialStatus > 0
      && !(this.ArmorCurrentStatus === this.ArmorInitialStatus && this.ShieldCurrentStatus === this.ShieldInitialStatus && !this.ShowStatusAllTime)) {
      this.ShowStatusAllTime = true;
    }
    return true;
  }

  UpdateWithTimeSheetList(time: number): boolean {
    if (this.TimeLastUpdate === -1) {
      this.TimeLastUpdate = time;
      return true;
    }
    let tmp = time - this.TimeLastUpdate;
    while (tmp > 0) {
      if (!this.TimeSheetList.length) {
        this.TimeDelta = tmp;
        this.TimeLastUpdate = time;
        return this.Update(time);
      }
      while (this.TimeSheetList[0].AI_Mode !== 0) hooks.unpackAIMode(this.TimeSheetList);
      const front = this.TimeSheetList[0];
      if (front.Time === -1) {
        this.TimeDelta = tmp;
        this.TimeLastUpdate = time;
        return this.Update(time);
      }
      if (front.Time > tmp) {
        this.TimeDelta = tmp;
        this.TimeLastUpdate = time;
        front.Time -= this.TimeDelta;
        return this.Update(time);
      }
      this.TimeDelta = front.Time;
      tmp -= this.TimeDelta;
      this.TimeLastUpdate += this.TimeDelta;
      if (!this.Update(this.TimeLastUpdate)) return false;
      this.TimeSheetList.shift();
    }
    return true;
  }

  Update(_time: number): boolean {
    if (this.DeleteAfterLeaveScene === DeleteAfterLeaveScene.need_delete) {
      this.Lifetime = DeleteAfterLeaveSceneDelay;
      this.DeleteAfterLeaveScene = DeleteAfterLeaveScene.wait_delay;
    }
    if (this.Lifetime > -1) {
      this.Lifetime -= this.TimeDelta;
      if (this.Lifetime <= 0) return false;
    }
    if (this.ShieldInitialStatus > 0 && this.ShieldCurrentStatus < this.ShieldInitialStatus) {
      this.ShieldCurrentStatus += this.ShieldRechargeRate * this.TimeDelta;
      if (this.ShieldCurrentStatus > this.ShieldInitialStatus) this.ShieldCurrentStatus = this.ShieldInitialStatus;
    }
    return true;
  }
}

/** NeedCheckCollision */
export function needCheckCollision(o: Object3D): boolean {
  switch (o.ObjectType) {
    case ObjectType.EarthFighter: case ObjectType.AlienFighter: case ObjectType.AlienMotherShip: case ObjectType.PirateShip:
    case ObjectType.PirateVehicle: case ObjectType.PirateBuilding: case ObjectType.SmallAsteroid: case ObjectType.SpaceDebris:
    case ObjectType.ShipWeapon: case ObjectType.Projectile:
      return true;
    default:
      return false;
  }
}

/** the preloaded models (src/assets/model3d.cpp GetPreloadedModel3DAsset) */
export const models = new Map<string, Model3D>();

/** LoadObjectData: the object shares the model's chunks (std::vector copy of sChunk3D) and copies its boxes */
export function loadObjectData(file: string, o: Object3D): void {
  const m = models.get(file);
  if (!m) throw new Error(`model not loaded: ${file}`);
  o.Model = m;
  o.GlobalVertexArrayCount = m.GlobalVertexArrayCount;
  o.GlobalIndexArrayCount = m.GlobalIndexArrayCount;
  o.Chunks = m.Chunks.map((c) => c.clone());
  o.Texture = m.Chunks.map(() => null);
  o.TextureIllum = m.Chunks.map(() => null);
  o.NormalMap = m.Chunks.map(() => null);
  o.AABB = m.AABB.map((p) => p.clone());
  o.OBB = { Box: m.OBB.Box.map((p) => p.clone()), Location: m.OBB.Location.clone() };
  o.HitBB = m.HitBB.map((h) => ({ Box: h.Box.map((p) => p.clone()), Location: h.Location.clone(), Radius2: h.Radius2, Size: h.Size.clone() }));
  o.GeometryCenter = m.GeometryCenter.clone();
  o.Radius = m.Radius;
  o.Width = m.Width;
  o.Length = m.Length;
  o.Height = m.Height;
}

// ---- object3d/collision_detection.cpp

function segmentHitBB(h: HitBB, o1: Object3D, o2: Object3D): boolean {
  const mid = o2.Location.add(o2.PrevLocation).div(2);
  const dir = o2.Location.sub(o2.PrevLocation);
  const hl = dir.Length() / 2;
  dir.Normalize();
  const T = o1.Location.add(h.Location).sub(mid);
  const b = h.Box[0];
  const abs = Math.abs;
  if (abs(T.x) > b.x + hl * abs(dir.x) || abs(T.y) > b.y + hl * abs(dir.y) || abs(T.z) > b.z + hl * abs(dir.z)) return false;
  let r = b.y * abs(dir.z) + b.z * abs(dir.y);
  if (abs(T.y * dir.z - T.z * dir.y) > r) return false;
  r = b.x * abs(dir.z) + b.z * abs(dir.x);
  if (abs(T.z * dir.x - T.x * dir.z) > r) return false;
  r = b.x * abs(dir.y) + b.y * abs(dir.x);
  if (abs(T.x * dir.y - T.y * dir.x) > r) return false;
  return true;
}

/** CheckMeshSphereCollisionDetection: returns [point, piece] or null */
export function checkMeshSphereCollision(o1: Object3D, o2: Object3D): [Vec3, number] | null {
  if (!o1.Chunks.length) return null;
  for (let j = 0; j < o1.Chunks.length; j++) {
    if (o1.HitBB.length) {
      const h = o1.HitBB[j];
      const dx = o1.Location.x + h.Location.x - o2.Location.x;
      const dy = o1.Location.y + h.Location.y - o2.Location.y;
      const dz = o1.Location.z + h.Location.z - o2.Location.z;
      if (dx * dx + dy * dy + dz * dz > h.Radius2 + o2.Radius * o2.Radius) {
        if (!segmentHitBB(h, o1, o2)) continue;
      }
    }
    const p = sphereMeshCollision(o1.Location, o1.Chunks[j], o1.CurrentRotationMat, o2.Radius, o2.Location, o2.PrevLocation);
    if (p) return [p, j];
  }
  return null;
}

/** the separating-axis test both box functions share: half sizes a (object 1 frame), b (rotated by matB) */
function boxesSeparated(vPosB: Vec3, matB: Mat33, a: Vec3, b: Vec3): boolean {
  const abs = Math.abs;
  const X = new Vec3(matB[0], matB[3], matB[6]);
  const Y = new Vec3(matB[1], matB[4], matB[7]);
  const Z = new Vec3(matB[2], matB[5], matB[8]);
  if (abs(vPosB.x) > a.x + b.x * abs(X.x) + b.y * abs(X.y) + b.z * abs(X.z)) return true;
  if (abs(vPosB.y) > a.y + b.x * abs(Y.x) + b.y * abs(Y.y) + b.z * abs(Y.z)) return true;
  if (abs(vPosB.z) > a.z + b.x * abs(Z.x) + b.y * abs(Z.y) + b.z * abs(Z.z)) return true;
  if (abs(vPosB.x * X.x + vPosB.y * Y.x + vPosB.z * Z.x) > b.x + a.x * abs(X.x) + a.y * abs(Y.x) + a.z * abs(Z.x)) return true;
  if (abs(vPosB.x * X.y + vPosB.y * Y.y + vPosB.z * Z.y) > b.y + a.x * abs(X.y) + a.y * abs(Y.y) + a.z * abs(Z.y)) return true;
  if (abs(vPosB.x * X.z + vPosB.y * Y.z + vPosB.z * Z.z) > b.z + a.x * abs(X.z) + a.y * abs(Y.z) + a.z * abs(Z.z)) return true;
  if (abs(vPosB.z * Y.x - vPosB.y * Z.x) > a.y * abs(Z.x) + a.z * abs(Y.x) + b.y * abs(X.z) + b.z * abs(X.y)) return true;
  if (abs(vPosB.z * Y.y - vPosB.y * Z.y) > a.y * abs(Z.y) + a.z * abs(Y.y) + b.x * abs(X.z) + b.z * abs(X.x)) return true;
  if (abs(vPosB.z * Y.z - vPosB.y * Z.z) > a.y * abs(Z.z) + a.z * abs(Y.z) + b.x * abs(X.y) + b.y * abs(X.x)) return true;
  if (abs(vPosB.x * Z.x - vPosB.z * X.x) > a.x * abs(Z.x) + a.z * abs(X.x) + b.y * abs(Y.z) + b.z * abs(Y.y)) return true;
  if (abs(vPosB.x * Z.y - vPosB.z * X.y) > a.x * abs(Z.y) + a.z * abs(X.y) + b.x * abs(Y.z) + b.z * abs(Y.x)) return true;
  if (abs(vPosB.x * Z.z - vPosB.z * X.z) > a.x * abs(Z.z) + a.z * abs(X.z) + b.x * abs(Y.y) + b.y * abs(Y.x)) return true;
  if (abs(vPosB.y * X.x - vPosB.x * Y.x) > a.x * abs(Y.x) + a.y * abs(X.x) + b.y * abs(Z.z) + b.z * abs(Z.y)) return true;
  if (abs(vPosB.y * X.y - vPosB.x * Y.y) > a.x * abs(Y.y) + a.y * abs(X.y) + b.x * abs(Z.z) + b.z * abs(Z.x)) return true;
  if (abs(vPosB.y * X.z - vPosB.x * Y.z) > a.x * abs(Y.z) + a.y * abs(X.z) + b.x * abs(Z.y) + b.y * abs(Z.x)) return true;
  return false;
}

/** CheckHitBBHitBBCollisionDetection: [piece1, piece2] or null */
export function checkHitBBHitBBCollision(o1: Object3D, o2: Object3D): [number, number] | null {
  for (let i = 0; i < o1.Chunks.length; i++) {
    for (let j = 0; j < o2.Chunks.length; j++) {
      const h1 = o1.HitBB[i], h2 = o2.HitBB[j];
      const dx = o1.Location.x + h1.Location.x - o2.Location.x - h2.Location.x;
      const dy = o1.Location.y + h1.Location.y - o2.Location.y - h2.Location.y;
      const dz = o1.Location.z + h1.Location.z - o2.Location.z - h2.Location.z;
      if (dx * dx + dy * dy + dz * dz > h2.Radius2 + h1.Radius2) continue;
      const inv = Float64Array.from(o1.CurrentRotationMat);
      m33InverseRotate(inv);
      const matB = Float64Array.from(o2.CurrentRotationMat);
      m33Mult(matB, inv);
      const vPosB = o2.Location.add(h2.Location).sub(o1.Location.add(h1.Location));
      m33CalcPoint(vPosB, inv);
      if (boxesSeparated(vPosB, matB, h1.Size.div(2), h2.Size.div(2))) continue;
      return [i, j];
    }
  }
  return null;
}

/** CheckHitBBOBBCollisionDetection: piece of object 1 or -1 */
export function checkHitBBOBBCollision(o1: Object3D, o2: Object3D): number {
  for (let i = 0; i < o1.Chunks.length; i++) {
    const inv = Float64Array.from(o2.CurrentRotationMat);
    m33InverseRotate(inv);
    const matB = Float64Array.from(o1.CurrentRotationMat);
    m33Mult(matB, inv);
    const vPosB = o1.Location.add(o1.HitBB[i].Location).sub(o2.Location.add(o2.OBB.Location));
    m33CalcPoint(vPosB, inv);
    if (boxesSeparated(vPosB, matB, new Vec3(o2.Width / 2, o2.Height / 2, o2.Length / 2), o1.HitBB[i].Size.div(2))) continue;
    return i;
  }
  return -1;
}

/** CheckHitBBMeshCollisionDetection: piece of object 1 or -1 */
export function checkHitBBMeshCollision(o1: Object3D, o2: Object3D): number {
  const rm = o2.CurrentRotationMat;
  const trans = new Float64Array([rm[0], rm[1], rm[2], 0, rm[3], rm[4], rm[5], 0, rm[6], rm[7], rm[8], 0, o2.Location.x, o2.Location.y, o2.Location.z, 1]);
  for (let i = 0; i < o1.Chunks.length; i++) {
    const max = o1.HitBB[i].Box[0].clone();
    const min = o1.HitBB[i].Box[6].clone();
    const inv = Float64Array.from(o1.CurrentRotationMat);
    m33InverseRotate(inv);
    m33CalcPoint(max, inv);
    m33CalcPoint(min, inv);
    const center = o1.HitBB[i].Location.add(o1.Location);
    m33CalcPoint(center, inv);
    for (const ch of o2.Chunks) {
      const local = ch.Location.clone();
      m33CalcPoint(local, o2.CurrentRotationMat);
      const objTrans = Float64Array.from(trans);
      if (ch.Rotation.x !== 0 || ch.Rotation.y !== 0 || ch.Rotation.z !== 0) {
        const t = mat44();
        m44Identity(t);
        m44CreateRotate(t, ch.Rotation);
        m44Translate(t, local);
        m44Mult(objTrans, t);
      } else {
        m44Translate(objTrans, local);
      }
      const va = ch.VertexArray, s = ch.VertexStride;
      const pt = (idx: number): Vec3 => {
        const vp = ch.IndexArray ? ch.IndexArray[idx] * s : idx * s;
        const p = new Vec3(va[vp], va[vp + 1], va[vp + 2]);
        m44CalcPoint(p, objTrans);
        m33CalcPoint(p, inv);
        return p;
      };
      const inBox = (p: Vec3): boolean => Math.abs(center.x - p.x) <= max.x && Math.abs(center.y - p.y) <= max.y && Math.abs(center.z - p.z) <= max.z;
      for (let k = 0; k < ch.VertexQuantity; k += 3) {
        const p1 = pt(ch.RangeStart + k), p2 = pt(ch.RangeStart + k + 1), p3 = pt(ch.RangeStart + k + 2);
        if (inBox(p1) || inBox(p2) || inBox(p3)) return i;
        const mx = new Vec3(Math.max(p1.x, p2.x, p3.x), Math.max(p1.y, p2.y, p3.y), Math.max(p1.z, p2.z, p3.z));
        const mn = new Vec3(Math.min(p1.x, p2.x, p3.x), Math.min(p1.y, p2.y, p3.y), Math.min(p1.z, p2.z, p3.z));
        const c2 = new Vec3((mx.x + mn.x) / 2, (mx.y + mn.y) / 2, (mx.z + mn.z) / 2);
        mx.subFrom(c2);
        if (Math.abs(center.x - c2.x) > max.x + mx.x) continue;
        if (Math.abs(center.y - c2.y) > max.y + mx.y) continue;
        if (Math.abs(center.z - c2.z) > max.z + mx.z) continue;
        return i;
      }
    }
  }
  return -1;
}

/** cShake */
export class Shake {
  private need: number;
  private current = 0;
  Direction: Vec3;
  ChunkNum: number;
  private shiftPerSecond: number;
  private generateRand: () => number;
  constructor(direction: Vec3, chunkNum: number, shiftPerSecond: number, generateRand: () => number) {
    this.Direction = direction;
    this.ChunkNum = chunkNum;
    this.shiftPerSecond = shiftPerSecond;
    this.generateRand = generateRand;
    this.need = generateRand();
  }
  Update(timeDelta: number, fn: (inc: number, dir: Vec3, chunk: number) => void): void {
    let sign = 1;
    if (this.need < this.current) sign = -1;
    let inc = sign * this.shiftPerSecond * timeDelta;
    if ((sign > 0 && this.need <= this.current + inc) || (sign < 0 && this.need >= this.current + inc)) {
      inc += this.current + inc - this.need;
      this.need = this.generateRand();
    }
    this.current += inc;
    fn(inc, this.Direction, this.ChunkNum);
  }
}
