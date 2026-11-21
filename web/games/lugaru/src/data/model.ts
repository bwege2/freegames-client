// The original's .solid model files (Source/Graphic/Models.cpp Model::load):
//   int16 vertexNum, int16 triangleNum (big-endian)
//   vertexNum * (float x, float y, float z)
//   triangleNum * (int16 v0..v5, float u0..u2, float v0..v2)
// The triangle uses vertices 0, 2 and 4; 1, 3 and 5 are the decal vertices.
import { Reader } from './binary.ts';
import { doRotation, type Vec3 } from './math.ts';

export interface SolidTriangle {
  /** vertex indices, the original's vertex[0], vertex[2], vertex[4] */
  a: number;
  b: number;
  c: number;
  /** texture coordinates, the original's gx[0..2], gy[0..2] */
  ua: number;
  va: number;
  ub: number;
  vb: number;
  uc: number;
  vc: number;
}

export interface SolidModel {
  vertices: Vec3[];
  triangles: SolidTriangle[];
}

export function parseSolid(data: ArrayBuffer | Uint8Array): SolidModel {
  const r = new Reader(data);
  const vertexNum = r.i16();
  const triangleNum = r.i16();
  if (vertexNum < 0 || triangleNum < 0) throw new Error(`bad .solid counts ${vertexNum}/${triangleNum}`);
  const vertices: Vec3[] = new Array(vertexNum);
  for (let i = 0; i < vertexNum; i++) {
    vertices[i] = { x: r.f32(), y: r.f32(), z: r.f32() };
  }
  const triangles: SolidTriangle[] = new Array(triangleNum);
  for (let i = 0; i < triangleNum; i++) {
    const raw = [r.i16(), r.i16(), r.i16(), r.i16(), r.i16(), r.i16()];
    const ux = [r.f32(), r.f32(), r.f32()];
    const uy = [r.f32(), r.f32(), r.f32()];
    triangles[i] = {
      a: raw[0], b: raw[2], c: raw[4],
      ua: ux[0], va: uy[0], ub: ux[1], vb: uy[1], uc: ux[2], vc: uy[2],
    };
  }
  return { vertices, triangles };
}

/** A copy transformed by the original's Model::Rotate / Scale order. */
export function transformSolid(
  model: SolidModel,
  rotation: [number, number, number] = [0, 0, 0],
  scale = 1,
): SolidModel {
  const vertices = model.vertices.map((v) => {
    const r = doRotation(v, rotation[0], rotation[1], rotation[2]);
    return { x: r.x * scale, y: r.y * scale, z: r.z * scale };
  });
  return { vertices, triangles: model.triangles.map((t) => ({ ...t })) };
}
