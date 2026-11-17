// The original's geometry: GLUT's and GLU's solids as kiki calls them (glutSolidCube, gluSphere with 8
// slices and stacks, gluCylinder, glutSolidTorus, glutSolidDodecahedron), the model headers
// (src/bots/body.h, tire.h, src/items/*.h), the gate's bars, the world's wall plates, the billboard
// quad, and the vector font with its bevel (src/gui/KikiCharacter.cpp).
import * as THREE from 'three';
import { FONT, MODELS } from '../data/models.gen.ts';
import { MatStack } from './gl.ts';

const cache = new Map<string, THREE.BufferGeometry>();
function cached(key: string, make: () => THREE.BufferGeometry): THREE.BufferGeometry {
  let g = cache.get(key);
  if (!g) { g = make(); cache.set(key, g); }
  return g;
}

function fromArrays(pos: number[], nor: number[], uv?: number[], alpha?: number[]): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  if (alpha) g.setAttribute('kcolor', new THREE.Float32BufferAttribute(alpha.flatMap((a) => [1, 1, 1, a]), 4));
  return g;
}

/** glutSolidCube(size): centred, flat faces */
export function cube(size: number): THREE.BufferGeometry {
  return cached(`cube${size}`, () => new THREE.BoxGeometry(size, size, size));
}

/** gluSphere(radius, n, n): poles on the z axis */
export function sphere(radius: number, n = 8): THREE.BufferGeometry {
  return cached(`sphere${radius},${n}`, () => new THREE.SphereGeometry(radius, n, n).rotateX(Math.PI / 2));
}

/** gluCylinder(base, top, height, slices, 1): open, from z = 0 to z = height */
export function cylinder(base: number, top: number, height: number, slices: number): THREE.BufferGeometry {
  return cached(`cyl${base},${top},${height},${slices}`, () =>
    new THREE.CylinderGeometry(top, base, height, slices, 1, true).rotateX(Math.PI / 2).translate(0, 0, height / 2));
}

/** glutSolidTorus(inner, outer, sides, rings): around the z axis */
export function torus(inner: number, outer: number, sides: number, rings: number): THREE.BufferGeometry {
  return cached(`torus${inner},${outer},${sides},${rings}`, () => new THREE.TorusGeometry(outer, inner, sides, rings));
}

/** glutSolidDodecahedron: circumradius sqrt(3), flat faces */
export function dodecahedron(): THREE.BufferGeometry {
  return cached('dodeca', () => new THREE.DodecahedronGeometry(Math.sqrt(3), 0));
}

/** the models of the original's headers, as the render_* macros draw them */
export function model(name: string): THREE.BufferGeometry {
  return cached(`model:${name}`, () => fromArrays(MODELS[name].positions, MODELS[name].normals));
}

/** glRectf(x1, y1, x2, y2) with normal (0, 0, 1) */
export function rect(x1: number, y1: number, x2: number, y2: number): THREE.BufferGeometry {
  return cached(`rect${x1},${y1},${x2},${y2}`, () => fromArrays(
    [x1, y1, 0, x2, y1, 0, x2, y2, 0, x1, y1, 0, x2, y2, 0, x1, y2, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]));
}

/** KikiBillBoard::displayTextureWithSize: a textured quad in the camera's plane */
export function billboard(size: number): THREE.BufferGeometry {
  const w = size / 2;
  const h = size / 2;
  return cached(`bb${size}`, () => fromArrays(
    [-w, h, 0, -w, -h, 0, w, -h, 0, -w, h, 0, w, -h, 0, w, h, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0]));
}

/** KikiWorld::initializeTextures: the 64x64 alpha gradient (lights, wire glow, fumes) */
export function gradientTexture(): THREE.DataTexture {
  const data = new Uint8Array(64 * 64 * 4);
  const set = (row: number, col: number, v: number): void => {
    const i = (row * 64 + col) * 4;
    data[i] = data[i + 1] = data[i + 2] = 255;
    data[i + 3] = v;
  };
  for (let x = 0; x < 32; x++) {
    for (let y = 0; y < 32; y++) {
      const value = Math.max(1.0 - Math.sqrt(x * x + y * y) / 32.0, 0.0);
      const c = Math.trunc(value * value * 255);
      set(32 + x, 32 + y, c);
      set(31 - x, 31 - y, c);
      set(32 + x, 31 - y, c);
      set(31 - x, 32 + y, c);
    }
  }
  const t = new THREE.DataTexture(data, 64, 64, THREE.RGBAFormat);
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
}

// ----------------------------------------------------------------------------------------- gate bars
/** KikiGate::renderBar(r, b, h): a square frame, quad strips on top and bottom, quads inside and out */
export function gateBar(r: number, b: number, h: number): THREE.BufferGeometry {
  return cached(`bar${r},${b},${h}`, () => {
    const pos: number[] = [];
    const nor: number[] = [];
    const strip = (vs: number[][], n: number[]): void => {
      for (let i = 0; i + 3 < vs.length; i += 2) {
        const [a, bb, c, d] = [vs[i], vs[i + 1], vs[i + 3], vs[i + 2]];
        for (const v of [a, bb, c, a, c, d]) { pos.push(...v); nor.push(...n); }
      }
    };
    const quad = (vs: number[][], n: number[]): void => {
      for (const v of [vs[0], vs[1], vs[2], vs[0], vs[2], vs[3]]) { pos.push(...v); nor.push(...n); }
    };
    strip([[-r, h, -r], [-b, h, -b], [r, h, -r], [b, h, -b], [r, h, r], [b, h, b], [-r, h, r], [-b, h, b], [-r, h, -r], [-b, h, -b]], [0, 1, 0]);
    strip([[-b, -h, -b], [-r, -h, -r], [b, -h, -b], [r, -h, -r], [b, -h, b], [r, -h, r], [-b, -h, b], [-r, -h, r], [-b, -h, -b], [-r, -h, -r]], [0, -1, 0]);
    quad([[-r, -h, -r], [-r, h, -r], [r, h, -r], [r, -h, -r]], [0, 0, -1]);
    quad([[r, -h, -r], [r, h, -r], [r, h, r], [r, -h, r]], [1, 0, 0]);
    quad([[r, -h, r], [r, h, r], [-r, h, r], [-r, -h, r]], [0, 0, 1]);
    quad([[-r, -h, r], [-r, h, r], [-r, h, -r], [-r, -h, -r]], [-1, 0, 0]);
    quad([[-b, h, -b], [-b, -h, -b], [b, -h, -b], [b, h, -b]], [0, 0, 1]);
    quad([[b, h, -b], [b, -h, -b], [b, -h, b], [b, h, b]], [-1, 0, 0]);
    quad([[b, h, b], [b, -h, b], [-b, -h, b], [-b, h, b]], [0, 0, -1]);
    quad([[-b, h, b], [-b, -h, b], [-b, -h, -b], [-b, h, -b]], [1, 0, 0]);
    return fromArrays(pos, nor);
  });
}

/** KikiWall::render's six plates (s = 0.45 at d = 0.5) */
export function wallPlates(): THREE.BufferGeometry {
  return cached('wallplates', () => {
    const s = 0.45;
    const d = 0.5;
    const pos: number[] = [];
    const nor: number[] = [];
    const quad = (n: number[], vs: number[][]): void => {
      for (const v of [vs[0], vs[1], vs[2], vs[0], vs[2], vs[3]]) { pos.push(...v); nor.push(...n); }
    };
    quad([0, 0, 1], [[s, -s, d], [s, s, d], [-s, s, d], [-s, -s, d]]);
    quad([0, 0, -1], [[-s, -s, -d], [-s, s, -d], [s, s, -d], [s, -s, -d]]);
    quad([0, 1, 0], [[-s, d, -s], [-s, d, s], [s, d, s], [s, d, -s]]);
    quad([0, -1, 0], [[s, -d, -s], [s, -d, s], [-s, -d, s], [-s, -d, -s]]);
    quad([1, 0, 0], [[d, s, -s], [d, s, s], [d, -s, s], [d, -s, -s]]);
    quad([-1, 0, 0], [[-d, -s, -s], [-d, -s, s], [-d, s, s], [-d, s, -s]]);
    return fromArrays(pos, nor);
  });
}

/** the world's border plates (KikiWorld::display / displayWall), as one mesh in world coordinates */
export function borderPlates(sx: number, sy: number, sz: number, raster: boolean, rasterSize = 0.1): THREE.BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  const m = new MatStack();
  let l = rasterSize / 2.0;
  let t = 1.0 - l;
  if (!raster) { l = 0.0; t = 1.0; }
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();
  const wall = (width: number, height: number): void => {
    normalMatrix.getNormalMatrix(m.m);
    n.set(0, 0, 1).applyMatrix3(normalMatrix).normalize();
    for (let w = 0; w < width; w++) {
      for (let h = 0; h < height; h++) {
        const c = [[w + l, h + l], [w + t, h + l], [w + t, h + t], [w + l, h + l], [w + t, h + t], [w + l, h + t]];
        for (const [x, y] of c) {
          v.set(x, y, 0).applyMatrix4(m.m);
          pos.push(v.x, v.y, v.z);
          nor.push(n.x, n.y, n.z);
        }
      }
    }
  };
  m.translate(-0.5, -0.5, -0.5);
  wall(sx, sy); // xy+z
  m.rotate(180.0, 0.0, 1.0, 0.0); m.translate(-sx, 0.0, -sz);
  wall(sx, sy); // xy-z
  m.rotate(90.0, 1.0, 0.0, 0.0); m.translate(0.0, 0.0, -sy);
  wall(sx, sz); // xz-y
  m.rotate(180.0, 0.0, 1.0, 0.0); m.translate(-sx, 0.0, -sy);
  wall(sx, sz); // xz+y
  m.rotate(-90.0, 0.0, 1.0, 0.0); m.translate(0.0, 0.0, -sx);
  wall(sy, sz); // yz+x
  m.rotate(180.0, 1.0, 0.0, 0.0); m.translate(0.0, -sz, -sx);
  wall(sy, sz); // yz-x
  return fromArrays(pos, nor);
}

// ---------------------------------------------------------------------------------------------- font
export const BEVEL_DEPTH = 4.0;

function inside(p: number[], poly: number[][]): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** KikiCharacter::renderCharacter(c): the front (the tessellated contours, odd winding, normal +z) and
 * the bevel (a quad per edge from z = 0 to z = -bevel_depth, its back vertices transparent) */
export function glyph(c: number): THREE.BufferGeometry | null {
  const data = FONT[c];
  if (!data) return null;
  return cached(`glyph${c}`, () => {
    const contours = data.filter((ct) => ct.length >= 3);
    const pos: number[] = [];
    const nor: number[] = [];
    const alpha: number[] = [];
    // front: contours inside the first are holes of it, the others are separate shapes
    const outer = contours[0];
    if (outer) {
      const holes: number[][][] = [];
      const others: number[][][] = [];
      for (const ct of contours.slice(1)) {
        const mid = [ct.reduce((s, p) => s + p[0], 0) / ct.length, ct.reduce((s, p) => s + p[1], 0) / ct.length];
        if (inside(mid, outer) || inside(ct[0], outer)) holes.push(ct); else others.push(ct);
      }
      for (const [shape, hs] of [[outer, holes], ...others.map((o) => [o, []])] as [number[][], number[][][]][]) {
        const v2 = (p: number[]): THREE.Vector2 => new THREE.Vector2(p[0], p[1]);
        const tris = THREE.ShapeUtils.triangulateShape(shape.map(v2), hs.map((h) => h.map(v2)));
        const all = [...shape, ...hs.flat()];
        for (const tri of tris) {
          // counter-clockwise, facing +z
          const [a, b, cc] = tri.map((i) => all[i]);
          const cross = (b[0] - a[0]) * (cc[1] - a[1]) - (b[1] - a[1]) * (cc[0] - a[0]);
          const order = cross >= 0 ? [a, b, cc] : [a, cc, b];
          for (const p of order) { pos.push(p[0], p[1], 0); nor.push(0, 0, 1); alpha.push(1); }
        }
      }
    }
    // bevel
    for (const ct of data) {
      for (let i = 0; i < ct.length; i++) {
        const [x, y] = ct[i];
        const [nx, ny] = ct[(i + 1) % ct.length];
        const n = [ny - y, -(nx - x), 0];
        const len = Math.hypot(n[0], n[1]) || 1;
        const nn = [n[0] / len, n[1] / len, 0];
        const q = [[x, y, 0, 1], [x, y, -BEVEL_DEPTH, 0], [nx, ny, -BEVEL_DEPTH, 0], [nx, ny, 0, 1]];
        for (const k of [0, 1, 2, 0, 2, 3]) {
          pos.push(q[k][0], q[k][1], q[k][2]);
          nor.push(...nn);
          alpha.push(q[k][3]);
        }
      }
    }
    return fromArrays(pos, nor, undefined, alpha);
  });
}
