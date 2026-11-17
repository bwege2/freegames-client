// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/core/model3d/
// model3d.cpp (the VW3D loader, the model metadata, the explosion's small triangles) and the model
// list of src/assets/model3d.cpp. Changed for the browser by the freegames project, 2026.
import { Vec3, m33CalcPoint, m33CreateRotate, mat33 } from './math.ts';

export type BoundingBox = Vec3[]; // 8 points

export const newBox = (): BoundingBox => Array.from({ length: 8 }, () => new Vec3());

export interface OBB { Box: BoundingBox; Location: Vec3 }
export interface HitBB { Box: BoundingBox; Location: Vec3; Radius2: number; Size: Vec3 }

export const RI_3f_XYZ = 0x0000003;
export const RI_3f_NORMAL = 0x0000010;
export const RI_2f_TEX = 0x0000200;

export class Chunk3D {
  Location = new Vec3();
  Rotation = new Vec3();
  NeedGeometryAnimation = false;
  GeometryAnimation = new Vec3();
  NeedTextureAnimation = false;
  TextureAnimation = new Vec3();
  DrawType: 'normal' | 'blend' = 'normal';
  RangeStart = 0;
  VertexQuantity = 0;
  VertexArray: Float32Array = new Float32Array(0);
  VertexFormat = 0;
  VertexStride = 0; // in floats, as the file stores it
  IndexArray: Uint32Array | null = null;
  VertexArrayWithSmallTriangles: Float32Array = new Float32Array(0);
  VertexArrayWithSmallTrianglesCount = 0;
  /** the renderer's cached geometry */
  gpu: unknown = null;

  clone(): Chunk3D {
    const c = new Chunk3D();
    Object.assign(c, this);
    c.Location = this.Location.clone();
    c.Rotation = this.Rotation.clone();
    c.GeometryAnimation = this.GeometryAnimation.clone();
    c.TextureAnimation = this.TextureAnimation.clone();
    return c;
  }
}

export class Model3D {
  Chunks: Chunk3D[] = [];
  GlobalVertexArray: Float32Array = new Float32Array(0);
  GlobalVertexArrayCount = 0;
  GlobalIndexArray: Uint32Array | null = null;
  GlobalIndexArrayCount = 0;
  AABB: BoundingBox = newBox();
  OBB: OBB = { Box: newBox(), Location: new Vec3() };
  HitBB: HitBB[] = [];
  GeometryCenter = new Vec3();
  Radius = 0;
  Width = 1;
  Length = 1;
  Height = 1;
  name = '';

  /** sModel3D::MetadataInitialization */
  MetadataInitialization(): void {
    if (this.Chunks.length === 0) return;
    let all = 0;
    this.HitBB = [];
    for (let i = 0; i < this.Chunks.length; i++) {
      const ch = this.Chunks[i];
      const m = mat33();
      m33CreateRotate(m, ch.Rotation);
      const vtx = (j: number): Vec3 => {
        const off = ch.IndexArray ? ch.IndexArray[ch.RangeStart + j] * ch.VertexStride : (ch.RangeStart + j) * ch.VertexStride;
        const v = new Vec3(ch.VertexArray[off], ch.VertexArray[off + 1], ch.VertexArray[off + 2]);
        m33CalcPoint(v, m);
        return v;
      };
      let v = vtx(0);
      let minX = v.x, maxX = v.x, minY = v.y, maxY = v.y, minZ = v.z, maxZ = v.z;
      this.GeometryCenter.addTo(ch.Location.add(v));
      for (let j = 1; j < ch.VertexQuantity; j++) {
        v = vtx(j);
        if (minX > v.x) minX = v.x;
        if (minY > v.y) minY = v.y;
        if (minZ > v.z) minZ = v.z;
        if (maxX < v.x) maxX = v.x;
        if (maxY < v.y) maxY = v.y;
        if (maxZ < v.z) maxZ = v.z;
        this.GeometryCenter.addTo(ch.Location.add(v));
      }
      const h: HitBB = { Box: boxOf(minX, maxX, minY, maxY, minZ, maxZ), Location: new Vec3((maxX + minX) / 2, (maxY + minY) / 2, (maxZ + minZ) / 2), Radius2: 0, Size: new Vec3(Math.abs(maxX - minX), Math.abs(maxY - minY), Math.abs(maxZ - minZ)) };
      h.Radius2 = (h.Size.x / 2) * (h.Size.x / 2) + (h.Size.y / 2) * (h.Size.y / 2) + (h.Size.z / 2) * (h.Size.z / 2);
      for (const p of h.Box) p.subFrom(h.Location);
      h.Location.addTo(ch.Location);
      this.HitBB.push(h);
      all += ch.VertexQuantity;
    }
    if (all > 0) this.GeometryCenter = this.GeometryCenter.div(all);
    const hb = this.HitBB;
    let minX = hb[0].Box[6].x + hb[0].Location.x, maxX = hb[0].Box[0].x + hb[0].Location.x;
    let minY = hb[0].Box[6].y + hb[0].Location.y, maxY = hb[0].Box[0].y + hb[0].Location.y;
    let minZ = hb[0].Box[6].z + hb[0].Location.z, maxZ = hb[0].Box[0].z + hb[0].Location.z;
    for (let i = 1; i < this.Chunks.length; i++) {
      if (minX > hb[i].Box[6].x + hb[i].Location.x) minX = hb[i].Box[6].x + hb[i].Location.x;
      if (maxX < hb[i].Box[0].x + hb[i].Location.x) maxX = hb[i].Box[0].x + hb[i].Location.x;
      if (minY > hb[i].Box[6].y + hb[i].Location.y) minY = hb[i].Box[6].y + hb[i].Location.y;
      if (maxY < hb[i].Box[0].y + hb[i].Location.y) maxY = hb[i].Box[0].y + hb[i].Location.y;
      if (minZ > hb[i].Box[6].z + hb[i].Location.z) minZ = hb[i].Box[6].z + hb[i].Location.z;
      if (maxZ < hb[i].Box[0].z + hb[i].Location.z) maxZ = hb[i].Box[0].z + hb[i].Location.z;
    }
    this.AABB = boxOf(minX, maxX, minY, maxY, minZ, maxZ);
    this.OBB.Box = boxOf(minX, maxX, minY, maxY, minZ, maxZ);
    this.OBB.Location = new Vec3((maxX + minX) / 2, (maxY + minY) / 2, (maxZ + minZ) / 2);
    for (const p of this.OBB.Box) p.subFrom(this.OBB.Location);
    this.Width = Math.abs(maxX - minX);
    this.Height = Math.abs(maxY - minY);
    this.Length = Math.abs(maxZ - minZ);
    const w2 = this.Width / 2, l2 = this.Length / 2, h2 = this.Height / 2;
    // vw_sqrtf
    this.Radius = vwSqrt(w2 * w2 + l2 * l2 + h2 * h2);
  }
}

import { vwSqrtf as vwSqrt } from './math.ts';

export function boxOf(minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number): BoundingBox {
  return [
    new Vec3(maxX, maxY, maxZ), new Vec3(minX, maxY, maxZ), new Vec3(minX, maxY, minZ), new Vec3(maxX, maxY, minZ),
    new Vec3(maxX, minY, maxZ), new Vec3(minX, minY, maxZ), new Vec3(minX, minY, minZ), new Vec3(maxX, minY, minZ),
  ];
}

/** cModel3DWrapper::LoadVW3D (strides in the file are in bytes) */
export function parseVW3D(buf: ArrayBuffer, name = ''): Model3D {
  const dv = new DataView(buf);
  if (dv.getUint32(0, true) !== 0x44335756) throw new Error(`${name}: not a VW3D model`);
  const model = new Model3D();
  model.name = name;
  const n = dv.getUint32(4, true);
  let p = 8;
  model.GlobalIndexArrayCount = 0;
  for (let i = 0; i < n; i++) {
    const ch = new Chunk3D();
    ch.RangeStart = model.GlobalIndexArrayCount;
    ch.VertexFormat = dv.getInt32(p, true);
    ch.VertexStride = dv.getUint32(p + 4, true);
    ch.VertexQuantity = dv.getUint32(p + 8, true);
    p += 12;
    model.GlobalIndexArrayCount += ch.VertexQuantity;
    ch.Location.set(dv.getFloat32(p, true), dv.getFloat32(p + 4, true), dv.getFloat32(p + 8, true));
    ch.Rotation.set(dv.getFloat32(p + 12, true), dv.getFloat32(p + 16, true), dv.getFloat32(p + 20, true));
    p += 24;
    model.Chunks.push(ch);
  }
  model.GlobalVertexArrayCount = dv.getUint32(p, true);
  p += 4;
  const stride = model.Chunks[0].VertexStride;
  model.GlobalVertexArray = new Float32Array(buf.slice(p, p + model.GlobalVertexArrayCount * stride * 4));
  p += model.GlobalVertexArrayCount * stride * 4;
  model.GlobalIndexArray = new Uint32Array(buf.slice(p, p + model.GlobalIndexArrayCount * 4));
  for (const ch of model.Chunks) {
    ch.VertexArray = model.GlobalVertexArray;
    ch.IndexArray = model.GlobalIndexArray;
  }
  model.MetadataInitialization();
  return model;
}

/** CreateChunkBuffers: every chunk gets its own unindexed vertex array */
function createChunkBuffers(model: Model3D): void {
  for (const ch of model.Chunks) {
    const out = new Float32Array(ch.VertexStride * ch.VertexQuantity);
    for (let j = 0; j < ch.VertexQuantity; j++) {
      const off = ch.IndexArray ? ch.IndexArray[ch.RangeStart + j] * ch.VertexStride : (ch.RangeStart + j) * ch.VertexStride;
      out.set(model.GlobalVertexArray.subarray(off, off + ch.VertexStride), ch.VertexStride * j);
    }
    ch.VertexArray = out;
    ch.IndexArray = null;
    ch.RangeStart = 0;
  }
}

type P8 = number[];

function recursiveTriangles(p1: P8, p2: P8, p3: P8, out: number[][] | null, limit: number): number {
  const f = Math.fround;
  // all in float, as the original (sqrtf of float products): doubles make some sides equal that are not in float
  const d = (a: P8, b: P8): number => {
    const x = f(a[0] - b[0]), y = f(a[1] - b[1]), z = f(a[2] - b[2]);
    return f(Math.sqrt(f(f(f(x * x) + f(y * y)) + f(z * z))));
  };
  const d1 = d(p1, p2), d2 = d(p2, p3), d3 = d(p3, p1);
  if (d1 <= limit && d2 <= limit && d3 <= limit) {
    if (out) out.push(p1, p2, p3);
    return 1;
  }
  const mid = (a: P8, b: P8): P8 => a.map((v, i) => Math.fround((v + b[i]) / 2));
  if (d1 > d2 && d1 > d3) {
    const a = mid(p1, p2);
    return recursiveTriangles(p1, a, p3, out, limit) + recursiveTriangles(a, p2, p3, out, limit);
  } else if (d2 > d1 && d2 > d3) {
    const a = mid(p2, p3);
    return recursiveTriangles(p1, p2, a, out, limit) + recursiveTriangles(p1, a, p3, out, limit);
  }
  const a = mid(p3, p1);
  return recursiveTriangles(p1, p2, a, out, limit) + recursiveTriangles(a, p2, p3, out, limit);
}

/** CreateVertexArrayLimitedBySizeTriangles */
function createSmallTriangles(model: Model3D, limit: number): void {
  for (const ch of model.Chunks) {
    if (limit <= 0) {
      ch.VertexArrayWithSmallTrianglesCount = ch.VertexQuantity;
      ch.VertexArrayWithSmallTriangles = ch.VertexArray;
      continue;
    }
    const tris: number[][] = [];
    const s = ch.VertexStride;
    const pt = (j: number): P8 => Array.from(ch.VertexArray.subarray(s * j, s * j + 8));
    for (let j = 0; j < ch.VertexQuantity; j += 3) recursiveTriangles(pt(j), pt(j + 1), pt(j + 2), tris, limit);
    ch.VertexArrayWithSmallTrianglesCount = tris.length;
    if (tris.length === ch.VertexQuantity) {
      ch.VertexArrayWithSmallTriangles = ch.VertexArray;
    } else {
      const arr = new Float32Array(tris.length * s);
      tris.forEach((p, k) => arr.set(p, k * s));
      ch.VertexArrayWithSmallTriangles = arr;
    }
  }
}

/** vw_LoadModel3D without the tangents (the port's shaders do not use normal maps; README.md) */
export function loadModel3D(buf: ArrayBuffer, name: string, triangleSizeLimit: number): Model3D {
  const m = parseVW3D(buf, name);
  createChunkBuffers(m);
  createSmallTriangles(m, triangleSizeLimit);
  return m;
}

/** src/assets/model3d.cpp Model3DMap: file -> TriangleSizeLimit */
export const MODEL3D_ASSETS: Record<string, number> = (() => {
  const r: Record<string, number> = {};
  const add = (names: string[], limit: number): void => { for (const n of names) r[n] = limit; };
  const seq = (pre: string, from: number, to: number, pad = 2, post = '.vw3d'): string[] => {
    const a: string[] = [];
    for (let i = from; i <= to; i++) a.push(`${pre}${String(i).padStart(pad, '0')}${post}`);
    return a;
  };
  add(seq('models/mine/mine-', 1, 4), 2);
  add(seq('models/earthfighter/sf-', 1, 22), 2);
  add(seq('models/earthfighter/weapon', 1, 15, 1), 2);
  add(seq('models/earthfighter/lnch', 1, 4, 1), 2);
  add(['missile', 'swarm', 'torpedo', 'nuke'].map((n) => `models/earthfighter/${n}.vw3d`), 2);
  add(seq('models/alienfighter/al-', 1, 17), 2);
  add(['gunship-01', 'bomber-07', 'gunship-03', 'gunship-04', 'gunship-02', 'bomber-03', 'bomber-02', 'bomber-04', 'bomber-05', 'bomber-06'].map((n) => `models/pirateship/${n}.vw3d`), 2);
  add(['models/turret/turret-01.vw3d', 'models/turret/turret-02.vw3d'], 2);
  add(['engineering-01', 'apc-aa-02', 'apc-aa-01', 'apc-03', 'apc-01', 'tank-11', 'tank-10', 'tank-09', 'tank-08', 'tank-07', 'tank-06', 'tank-05', 'tank-03', 'tank-01'].map((n) => `models/tracked/${n}.vw3d`), 2);
  add(['r-launcher-01', 'apc-04', 'apc-02', 'jeep-05', 'jeep-04', 'jeep-03', 'jeep-02', 'jeep-01'].map((n) => `models/wheeled/${n}.vw3d`), 2);
  add(['artiler-gun-02', 'artiler-gun-01', 'aa-gun-05', 'aa-gun-04', 'aa-gun-03', 'aa-gun-02', 'aa-gun-01'].map((n) => `models/militarybuilding/${n}.vw3d`), 2);
  for (const b of [1, 2, 6, 8]) add(seq(`models/spacebase/${b}/`, 1, 5, 1), -1);
  for (const b of [3, 4, 5, 7]) add([`models/spacebase/${b}/1.vw3d`], -1);
  add(seq('models/space/bigasteroid-', 1, 5), -1);
  add(seq('models/space/asteroid-01', 0, 19, 1), -1);
  add(['aplanet', 'dplanet', 'gplanet', 'moon', 'planet5', 'planet6'].map((n) => `models/planet/${n}.vw3d`), -1);
  add(seq('models/alienmothership/alm-', 1, 8), 2);
  add(seq('models/building/bld-', 1, 11), -1);
  return r;
})();
