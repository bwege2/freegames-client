// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the V3X scene manager, the part of the engine the
// game logic depends on: pointers and instances (V3XScene_Validate, V3XScene_CRC_Check, v3xscen2.c),
// the matrices of the objects and of the camera (V3XScene_MatrixBuild, v3x_render_camera, v3xscene.c),
// the per-frame pass with its plug-ins, distance sort and collisions (V3XScene_Viewport_Build) and the
// collision volumes (v3xcoll.c). Drawing is the renderer's (render3d.ts).
import * as m from './math.ts';
import {
  type Scene, type OVI, type Mesh, type Light, type Camera, type Cl, type ClItem, type Key, kPos, kTarget, kAngle,
  V3XOBJ_MESH, V3XOBJ_DUMMY, V3XOBJ_PORTAL, V3XOBJ_LIGHT, V3XOBJ_CAMERA, V3XOBJ_NONE,
  V3XMATRIX_Quaternion, V3XMATRIX_Vector, V3XMATRIX_Vector2, V3XMATRIX_Custom, V3XMATRIX_Euler,
  V3XSTATE_HIDDEN, V3XSTATE_HIDDENDISPLAY, V3XSTATE_CULLED, V3XSTATE_CULLEDOFR, V3XSTATE_MATRIXUPDATE, V3XSTATE_PROCESSED,
  V3XSTATE_TOPROCESS, V3XSTATE_PRSCOLLISION, V3XSTATE_GIANT, V3XSTATE_VALIDPOINTER, V3XSTATE_INSTANCED,
  V3XCTYPE_SPHERE, V3XCTYPE_AXISBOX, V3XCMODE_DONOTTESTSAMEID, V3XCMODE_INVERTCONDITION, V3XCMODE_REFLEX, V3XCMODE_DONTMOVE,
} from './vmx.ts';

const V3XSTATE_BSPCULLED = 0x2000;
const RESETMASK = ~(V3XSTATE_CULLEDOFR | V3XSTATE_CULLED | V3XSTATE_TOPROCESS | V3XSTATE_PROCESSED | V3XSTATE_PRSCOLLISION | V3XSTATE_BSPCULLED);

export interface V3XCamera {
  flags: number; matrix_Method: number; transposed: Float32Array; focal: number; M: Float32Array; Tk: Key;
}
/** the engine's globals (struct V3XSYSTEM) the game uses */
export const V3X = {
  Camera: { flags: 0, matrix_Method: V3XMATRIX_Vector, transposed: m.vec(), focal: 0, M: m.mtx(), Tk: new Float32Array(7) } as V3XCamera,
  ViewPort: { center: new Float32Array(2), Focal: 0, Ratio: 1, minVisibleRadius: 0, minTextureVisibleRadius: 0 },
  Clip: { Far: -65000, Near: -1, normalLeft: m.vec(), normalRight: m.vec(), normalTop: m.vec(), normalBottom: m.vec() },
  Light: { fogDistance: -15000, ambiant: [0, 0, 0] as number[], numSource: 0, lights: [] as Light[] },
  Setup: {
    flags: 0,
    add_poly: (): void => {}, add_lights: (): void => {}, pre_render: (): void => {}, post_render: (): void => {},
  },
  /** V3X.Buffer.OVI: the objects processed this frame, sorted by distance */
  objects: [] as OVI[],
  plugins: [] as ((o: OVI) => void)[],
  Time: { ms: 0 },
};
export const V3XOPTION_COLLISION = 0x8, V3XOPTION_AMBIANT = 0x4, V3XOPTION_USESAMELUT = 0x200, V3XOPTION_TRUECOLOR = 0x400;

/** the GX view: the screen the 3D view is projected on (GX.View) */
export const View = { xmin: 0, ymin: 0, xmax: 639, ymax: 479, lWidth: 640, lHeight: 480, lRatio: 16 };

export const meshOf = (o: OVI): Mesh => o.node as Mesh;
export const lightOf = (o: OVI): Light => o.node as Light;
export const matrixOf = (o: OVI): Float32Array => o.node.matrix;

/** V3XViewport_Setup (v3xmaths.h, floating point) */
export function viewportSetup(): void {
  V3X.ViewPort.center[0] = (View.xmax + View.xmin) >> 1;
  V3X.ViewPort.center[1] = (View.ymax + View.ymin) >> 1;
  V3X.ViewPort.Focal = Math.fround(Math.fround(V3X.Camera.focal * (View.ymin - View.ymax)) / 480);
  V3X.ViewPort.Ratio = Math.fround(View.lRatio * (1 / 16));
}
/** V3XVector_ProjectWithCenter; returns false when the point is behind (z >= 0) */
export function projectWithCenter(R: Float32Array, A: Float32Array): void {
  R[2] = 1 / A[2];
  const sx = V3X.ViewPort.Focal * R[2];
  R[1] = V3X.ViewPort.center[1] - A[1] * sx;
  R[0] = V3X.ViewPort.center[0] + A[0] * (sx * V3X.ViewPort.Ratio);
}
/** V3XVector_TransformProject_pts */
export function transformProject(input: Float32Array, result: Float32Array): boolean {
  const vv = m.vec(), temp = m.vec();
  m.dif(vv, input, m.Pos(V3X.Camera.M));
  m.applyMatrix(temp, vv, V3X.Camera.M);
  let ok = true;
  if (temp[2] < 0) projectWithCenter(result, temp); else ok = false;
  result[2] = temp[2];
  return ok;
}
/** V3XMatrix_Transform: the object's matrix in camera space */
export function matrixTransform(Mat: Float32Array, MObj: Float32Array): void {
  const vv = m.vec();
  m.multiply3x3(Mat, V3X.Camera.M, MObj);
  m.dif(vv, m.Pos(MObj), m.Pos(V3X.Camera.M));
  m.applyMatrix(m.Pos(Mat), vv, V3X.Camera.M);
  m.applyTransposeMatrix(V3X.Camera.transposed, vv, MObj);
}
/** V3XVector_WorldPos: a point of an object in camera space */
export function worldPos(Mat: Float32Array, input: Float32Array, result: Float32Array): void {
  const t = m.mtx();
  matrixTransform(t, Mat);
  m.applyMatrixTrans(result, input, t);
}
export function to2D(Mat: Float32Array, input: Float32Array, result: Float32Array): boolean {
  const temp = m.vec();
  worldPos(Mat, input, temp);
  if (temp[2] < 0) { projectWithCenter(result, temp); return true; }
  return false;
}

// ---------------------------------------------------------------- loading
function copyMesh(src: Mesh, own: { matrix: Float32Array; Tk: Key }): Mesh {
  return { ...src, matrix: own.matrix, Tk: own.Tk };
}

/** V3XScene_GetFromFile after the parse: V3XScene_Validate + V3XScene_CRC_Check */
export function validate(scene: Scene): void {
  const { OVI, ORI, TVI, TRI } = scene;
  for (const o of OVI) {
    o.ORI = ORI[o.index_ORI] ?? null;
    if (o.index_TVI) {
      const tvi = TVI[o.index_TVI];
      if (tvi && tvi.index_TRI < TRI.length) { tvi.TRI = TRI[tvi.index_TRI]; o.TVI = tvi; } else o.TVI = null;
    } else o.TVI = null;
    o.Tk = o.node.Tk;
  }
  for (const o of OVI) {
    const p = o.index_PARENT;
    o.parent = p > 0 && p < 0xffff && p !== o.index ? OVI[p] : null;
    o.target = null;
  }
  for (const o of OVI) { o.child = OVI.filter((c) => c.parent === o); o.state |= V3XSTATE_VALIDPOINTER; }
  // CRC check: instances and the mesh / light of each OVI
  for (let i = 0; i < OVI.length; i++) {
    const o = OVI[i];
    if (i && o.ORI === ORI[0]) o.ORI = null;
    const n = o.ORI;
    if (!n || n.type === V3XOBJ_NONE) continue;
    if (o.index_INSTANCE > 0) {
      const c = ORI[o.index_INSTANCE];
      if (c && c !== n) {
        if (n.type === V3XOBJ_MESH) {
          if (c.node) n.node = { ...(c.node as Mesh) };
        } else if (c.node) n.node = { ...c.node };
        n.flags |= 1;
      }
    }
    switch (n.type) {
      case V3XOBJ_LIGHT: {
        const l = n.node as Light;
        if (!l) break;
        l.Tk = Float32Array.from(o.node.Tk);
        l.pos = Float32Array.from(kPos(o.node.Tk));
        o.node = { ...l, pos: Float32Array.from(l.pos), target: Float32Array.from(l.target), Tk: o.node.Tk, matrix: o.node.matrix };
        break;
      }
      case V3XOBJ_MESH:
        if (n.node) o.node = copyMesh(n.node as Mesh, o.node);
        break;
      case V3XOBJ_CAMERA:
        o.node = { flags: 0, matrix_Method: 0, focal: 0, matrix: o.node.matrix, Tk: o.node.Tk } as Camera;
        break;
    }
  }
  void V3XSTATE_INSTANCED;
}

// ---------------------------------------------------------------- matrices
function evalMatrix(obj: { matrix: Float32Array; Tk: Key }, method: number): void {
  const M = obj.matrix, Tk = obj.Tk;
  switch (method) {
    case V3XMATRIX_Quaternion: {
      const x = Tk[0], y = Tk[1], z = Tk[2], w = Tk[6];
      const x2 = 2 * x * x, y2 = 2 * y * y, z2 = 2 * z * z, xy = 2 * x * y, xz = 2 * x * z, xw = 2 * x * w, yz = 2 * y * z, yw = 2 * y * w, zw = 2 * z * w;
      M[0] = 1 - y2 - z2; M[1] = xy + zw; M[2] = xz - yw;
      M[3] = xy - zw; M[4] = 1 - x2 - z2; M[5] = yz + xw;
      M[6] = xz + yw; M[7] = yz - xw; M[8] = 1 - x2 - y2;
      m.cpy(m.Pos(M), kPos(Tk));
      break;
    }
    case V3XMATRIX_Vector: {
      const dir = m.vec(), M0 = Float32Array.from(M);
      m.dif(dir, kTarget(Tk), kPos(Tk));
      m.buildFromVector(M0, dir, Tk[6] | 0);
      m.transpose(M, M0);
      m.cpy(m.Pos(M), kPos(Tk));
      break;
    }
    case V3XMATRIX_Vector2: {
      const M0 = Float32Array.from(M);
      m.buildFromNVector(M0, kTarget(Tk), Tk[6] | 0);
      m.transpose(M, M0);
      m.cpy(m.Pos(M), kPos(Tk));
      break;
    }
    case V3XMATRIX_Custom: break;
    case V3XMATRIX_Euler:
      m.rotXYZ(M, kAngle(Tk));
      m.cpy(m.Pos(M), kPos(Tk));
      break;
    default: m.setIdentity(M); break;
  }
}

/** V3XMatrix_MeshTransform for the camera */
export function cameraMeshTransform(): void {
  const C = V3X.Camera;
  switch (C.matrix_Method) {
    case V3XMATRIX_Vector: {
      const dir = m.vec();
      m.dif(dir, kPos(C.Tk), kTarget(C.Tk));
      m.buildFromVector(C.M, dir, C.Tk[6] | 0);
      m.cpy(m.Pos(C.M), kPos(C.Tk));
      break;
    }
    case V3XMATRIX_Euler:
      m.rotXYZ(C.M, kAngle(C.Tk));
      m.cpy(m.Pos(C.M), kPos(C.Tk));
      break;
  }
}
function renderCamera(s: Key | null): void {
  switch (V3X.Camera.matrix_Method) {
    case V3XMATRIX_Euler: case V3XMATRIX_Vector:
      if (s) V3X.Camera.Tk.set(s);
      cameraMeshTransform();
      break;
  }
}
/** V3XScene_Camera_Select */
export function cameraSelect(o: OVI | null): void {
  if (!o) return;
  V3X.Camera.matrix_Method = V3XMATRIX_Vector;
  V3X.Camera.Tk.set(o.node.Tk);
  cameraMeshTransform();
}

export function matrixBuild(o: OVI): void {
  const ORI = o.ORI;
  if (!ORI || o.state & V3XSTATE_PROCESSED) return;
  V3X.objects.push(o);
  o.state |= V3XSTATE_PROCESSED;
  const obj = o.node as Mesh;
  const OCs = ORI.Cs;
  let p = o.parent;
  while (!(p === null || o.state & V3XSTATE_MATRIXUPDATE)) {
    if (p.state & V3XSTATE_MATRIXUPDATE) o.state |= V3XSTATE_MATRIXUPDATE;
    p = p.parent;
  }
  if (o.state & V3XSTATE_MATRIXUPDATE) {
    switch (ORI.type) {
      case V3XOBJ_MESH: case V3XOBJ_DUMMY: case V3XOBJ_PORTAL:
        if (o.state & V3XSTATE_GIANT) {
          m.setIdentity(obj.matrix);
          m.cpy(m.Pos(obj.matrix), m.Pos(V3X.Camera.M));
          m.cpy(kPos(obj.Tk), m.Pos(obj.matrix));
        } else evalMatrix(obj, o.matrix_Method);
        break;
      case V3XOBJ_LIGHT:
        if (!o.parent) {
          const l = o.node as Light;
          m.cpy(l.pos, kPos(l.Tk));
          m.cpy(l.target, kTarget(l.Tk));
        }
        break;
      case V3XOBJ_CAMERA:
        renderCamera(o.Tk);
        break;
    }
  }
  const op = o.parent;
  if (op && o.state & V3XSTATE_MATRIXUPDATE) {
    const objP = op.node;
    if ((op.state & V3XSTATE_PROCESSED) === 0) matrixBuild(op);
    switch (ORI.type) {
      case V3XOBJ_MESH: case V3XOBJ_DUMMY: case V3XOBJ_PORTAL:
        switch (op.ORI?.type) {
          case V3XOBJ_MESH: case V3XOBJ_DUMMY: case V3XOBJ_PORTAL: {
            const M = Float32Array.from(obj.matrix);
            m.multiply3x4(obj.matrix, objP.matrix, M);
            break;
          }
          case V3XOBJ_CAMERA:
            m.sum(m.Pos(obj.matrix), kPos(obj.Tk), kPos(objP.Tk));
            break;
        }
        break;
      case V3XOBJ_LIGHT: {
        const l = o.node as Light, s = o.Tk!;
        if (op.state & V3XSTATE_GIANT) {
          m.sum(l.pos, m.Pos(V3X.Camera.M), kPos(s));
          m.sum(l.target, m.Pos(V3X.Camera.M), kTarget(s));
        } else {
          const mat = op.ORI?.type === V3XOBJ_CAMERA ? V3X.Camera.M : op.node.matrix;
          m.applyMatrixTrans(l.pos, kPos(s), mat);
          if (l.type === 1) m.applyMatrixTrans(l.target, kTarget(s), mat);
        }
        break;
      }
      case V3XOBJ_CAMERA:
        switch (op.ORI?.type) {
          case V3XOBJ_MESH: case V3XOBJ_DUMMY: {
            const a = Float32Array.from(kPos(o.Tk!));
            m.applyMatrixTrans(kPos(V3X.Camera.Tk), a, objP.matrix);
            renderCamera(null);
            break;
          }
        }
        break;
    }
  }
  if (V3X.Setup.flags & V3XOPTION_COLLISION && (o.state & V3XSTATE_HIDDEN) === 0) {
    o.collisionList = null;
    if (OCs) {
      o.state |= V3XSTATE_PRSCOLLISION;
      OCs.hitCount = 0; OCs.hitID = 0; OCs.last_hit = null;
      if (ORI.type === V3XOBJ_CAMERA) { OCs.mesh_ref = null; clXformNoRef(OCs, kPos(o.Tk!)); } else { OCs.mesh_ref = obj; clXform(OCs); }
    }
  }
  o.state &= ~(V3XSTATE_MATRIXUPDATE | V3XSTATE_TOPROCESS);
}

/** V3XPlug_CollisionMove: the plug-in that moves an object by its collision velocity */
export function plugCollisionMove(o: OVI): void {
  const OCs = o.ORI?.Cs;
  if (OCs && V3X.Setup.flags & V3XOPTION_COLLISION && !(OCs.flags & V3XCMODE_DONTMOVE)) {
    const p = OCs.velocity;
    if (p[0] || p[1] || p[2]) {
      const pos = kPos(o.Tk!);
      m.madd(pos, p, pos, OCs.reaction);
      m.scl(p, p, 1 - OCs.reaction);
      o.state |= V3XSTATE_MATRIXUPDATE;
    }
  }
}

function testAllCollision(): void {
  const list = V3X.objects;
  for (let i = 0; i < list.length - 1; i++) {
    const o = list[i], ORI = o.ORI!;
    if (!(o.state & V3XSTATE_PRSCOLLISION)) continue;
    const OCs = ORI.Cs!;
    OCs.mesh_ref = ORI.type === V3XOBJ_CAMERA ? null : (o.node as Mesh);
    clXform(OCs);
    for (let j = i + 1; j < list.length; j++) {
      const o2 = list[j];
      const OC2s = o2.ORI!.Cs!;
      if (o2.state & V3XSTATE_PRSCOLLISION && o2.parent !== o && o.parent !== o2 &&
        ((OCs.flags & V3XCMODE_DONOTTESTSAMEID) === 0 || OCs.ID !== OC2s.ID)) {
        OC2s.mesh_ref = ORI.type === V3XOBJ_CAMERA ? null : (o2.node as Mesh);
        clXform(OC2s);
        if (clTest(OCs, OC2s)) {
          OC2s.hitID = i; OCs.hitID = j;
          OCs.hitCount++; OC2s.hitCount++;
          o2.collisionList = o; o.collisionList = o2;
        }
      }
    }
    o.state |= V3XSTATE_PROCESSED;
  }
}

/** V3XScene_Viewport_Build: matrices, plug-ins, sort, collisions (the geometry is the renderer's) */
export function viewportBuild(scene: Scene): void {
  V3X.objects = [];
  for (const o of scene.OVI) {
    const ORI = o.ORI;
    o.state &= RESETMASK;
    if (!ORI) continue;
    switch (ORI.type) {
      case V3XOBJ_MESH: case V3XOBJ_DUMMY:
        o.state |= o.state & V3XSTATE_HIDDEN ? 0 : V3XSTATE_TOPROCESS;
        break;
      case V3XOBJ_NONE: o.distance = -10; break;
      case V3XOBJ_LIGHT: case V3XOBJ_CAMERA:
        o.state |= o.state & V3XSTATE_HIDDEN ? 0 : V3XSTATE_TOPROCESS;
        o.distance = m.CST_MAX;
        break;
      default: o.state |= V3XSTATE_TOPROCESS; o.distance = m.CST_MAX; break;
    }
  }
  for (const o of scene.OVI) {
    if (o.state & V3XSTATE_TOPROCESS && o.ORI && o.parent && o.parent.state & V3XSTATE_MATRIXUPDATE) o.state |= V3XSTATE_MATRIXUPDATE | V3XSTATE_TOPROCESS;
  }
  for (const o of scene.OVI) if (o.state & V3XSTATE_TOPROCESS) matrixBuild(o);
  for (const o of scene.OVI) for (const p of V3X.plugins) p(o);
  // distances for the sort (computed by the culling of the previous build in the original)
  for (const o of V3X.objects) {
    if (o.ORI?.type === V3XOBJ_MESH) {
      const c = m.vec();
      worldPos(o.node.matrix, o.ORI.global_center, c);
      o.distance = -c[2];
    }
  }
  V3X.objects.sort((a, b) => (a.distance === b.distance ? 0 : b.distance > a.distance ? 1 : -1));
  testAllCollision();
  // V3x_render_buildGeometry: the lights of the frame and the culling of the objects
  hooks.geometry(scene);
}
/** set by the game: what V3x_render_buildGeometry does besides the polygons (lights, culling) */
export const hooks = { geometry: (_s: Scene): void => {} };

/** V3XScene_Verify: the first build of a loaded scene */
export function verify(scene: Scene): void {
  V3X.objects = [];
  for (const o of scene.OVI) {
    if (!o.ORI) o.ORI = scene.ORI[0];
    const ORI = o.ORI;
    o.state |= V3XSTATE_TOPROCESS | V3XSTATE_MATRIXUPDATE;
    if (ORI.type === V3XOBJ_MESH && ORI.node) (o.node as Mesh).radius = ORI.global_rayon;
    else if (ORI.type === V3XOBJ_LIGHT) { const l = o.node as Light; if (!l.diminish) l.diminish = 1 / 2000; }
  }
  for (const o of scene.OVI) {
    const ORI = o.ORI!;
    o.Tk = ORI.type !== V3XOBJ_NONE ? o.node.Tk : null;
    if (ORI.Cs) m.set(ORI.Cs.velocity, 0, 0, 0);
    if (ORI.type !== V3XOBJ_NONE) {
      matrixBuild(o);
      o.state |= V3XSTATE_MATRIXUPDATE;
    }
  }
  viewportSetup();
  const flags = V3X.Setup.flags;
  V3X.Setup.flags = 0;
  viewportBuild(scene);
  V3X.Setup.flags = flags;
}

export function oviByName(scene: Scene, name: string): OVI | null {
  const n = name.toLowerCase();
  for (const o of scene.OVI) {
    const ORI = o.ORI ?? scene.ORI[o.index_ORI];
    if (ORI && ORI.name.toLowerCase() === n) return o;
  }
  return null;
}
/** V3XScene_Camera_GetByName: shows that camera, hides the others */
export function cameraByName(scene: Scene, name: string): OVI | null {
  let f: OVI | null = null;
  const n = name.toLowerCase();
  for (const o of scene.OVI) {
    if (o.ORI && o.ORI.type === V3XOBJ_CAMERA) {
      if (o.ORI.name.toLowerCase() === n) { o.state &= ~V3XSTATE_HIDDEN; f = o; } else o.state |= V3XSTATE_HIDDEN;
    }
  }
  return f;
}

// ---------------------------------------------------------------- collisions (v3xcoll.c)
export function clNew(): Cl {
  const item = (): ClItem => ({ type: 0, center: m.vec(), _center: m.vec(), radius: 0, min: m.vec(), max: m.vec() });
  return { numItem: 1, weight: 0, item: [item()], global: item(), velocity: m.vec(), mesh_ref: null, flags: 0, ID: 0, hitCount: 0, hitID: 0, reaction: 0, last_hit: null };
}
/** V3XCL_findGlobalSphere */
export function findGlobalSphere(obj: Mesh, Cs: ClItem): void {
  const v = obj.vertex, n = obj.numVerts;
  const at = (j: number): Float32Array => v.subarray(3 * j, 3 * j + 3);
  let xmin = at(0), xmax = at(0), ymin = at(0), ymax = at(0), zmin = at(0), zmax = at(0);
  for (let j = 0; j < n; j++) {
    const c = at(j);
    if (c[0] < xmin[0]) xmin = c; if (c[0] > xmax[0]) xmax = c;
    if (c[1] < ymin[1]) ymin = c; if (c[1] > ymax[1]) ymax = c;
    if (c[2] < zmin[2]) zmin = c; if (c[2] > zmax[2]) zmax = c;
  }
  const d = m.vec(), span = m.vec();
  m.dif(d, xmax, xmin); span[0] = m.lengthSq(d);
  m.dif(d, ymax, ymin); span[1] = m.lengthSq(d);
  m.dif(d, zmax, zmin); span[2] = m.lengthSq(d);
  let maxspan = span[0], dia1 = xmin, dia2 = xmax;
  if (span[1] > maxspan) { maxspan = span[1]; dia1 = ymin; dia2 = ymax; }
  if (span[2] > maxspan) { dia1 = zmin; dia2 = zmax; }
  const cen = m.vec();
  m.avg(cen, dia1, dia2);
  m.dif(d, dia2, cen);
  let radSq = m.lengthSq(d);
  let rad = Math.fround(Math.sqrt(radSq));
  for (let j = 0; j < n; j++) {
    const c = at(j);
    m.dif(d, c, cen);
    const oldSq = m.lengthSq(d);
    if (oldSq > radSq) {
      const old = Math.fround(Math.sqrt(oldSq));
      rad = Math.fround((rad + old) / 2);
      const toNew = Math.fround(old - rad);
      cen[0] = (rad * cen[0] + toNew * c[0]) / old;
      cen[1] = (rad * cen[1] + toNew * c[1]) / old;
      cen[2] = (rad * cen[2] + toNew * c[2]) / old;
    }
  }
  m.cpy(Cs._center, cen);
  Cs.radius = Math.fround(rad * obj.scale);
  void radSq; radSq = 0;
}
/** V3XCL_NewFromMesh(obj, V3XCTYPE_SPHERE) */
export function clNewFromMesh(obj: Mesh): Cl {
  const Cs = clNew();
  findGlobalSphere(obj, Cs.global);
  const it = Cs.item[0];
  it.type = V3XCTYPE_SPHERE; it.radius = Cs.global.radius; m.cpy(it._center, Cs.global._center); m.cpy(it.center, Cs.global.center);
  return Cs;
}
export function clXform(Cs: Cl): void {
  const ref = Cs.mesh_ref;
  if (ref) m.applyMatrixTrans(Cs.global.center, Cs.global._center, ref.matrix);
  for (const a of Cs.item) {
    if (ref) {
      if (a.type === V3XCTYPE_SPHERE) { m.cpy(a.max, a.center); m.applyMatrixTrans(a.center, a._center, ref.matrix); }
      else if (a.type === V3XCTYPE_AXISBOX) m.applyMatrixTrans(a.center, a._center, ref.matrix);
    } else if (a.type === V3XCTYPE_SPHERE || a.type === V3XCTYPE_AXISBOX) m.cpy(a.center, a._center);
  }
}
export function clXformNoRef(Cs: Cl, pos: Float32Array): void {
  m.cpy(Cs.global.center, pos);
  for (const a of Cs.item) {
    if (a.type === V3XCTYPE_SPHERE) { m.cpy(a.max, a.center); m.cpy(a.center, pos); }
    else if (a.type === V3XCTYPE_AXISBOX) m.cpy(a.center, pos);
  }
}
function sphSph(a: Cl, b: Cl, aa: ClItem, bb: ClItem): boolean {
  const inv = a.flags & V3XCMODE_INVERTCONDITION || b.flags & V3XCMODE_INVERTCONDITION ? 1 : 0;
  const k1 = m.vec();
  m.dif(k1, bb.center, aa.center);
  const d = m.normalize(k1, k1);
  let r = Math.fround(aa.radius + bb.radius);
  if (r < m.CST_EPSILON) r = m.CST_EPSILON;
  if (Number(r >= d) ^ inv) {
    let c: Cl, kk: number;
    if (a.weight < b.weight) { c = a; kk = -1; } else { c = b; kk = 1; }
    if (a.flags & V3XCMODE_REFLEX && b.flags & V3XCMODE_REFLEX) {
      let f = Math.fround(r - d);
      if ((inv && kk === -1) || kk < 0) f = -f;
      m.madd(c.velocity, k1, c.velocity, f);
    }
    return true;
  }
  return false;
}
function bumpBox(a: Cl, mini: Float32Array, maxi: Float32Array, Min2: Float32Array, Max2: Float32Array, inv: boolean): void {
  const c1 = m.vec(), c2 = m.vec(), p = m.vec();
  m.dif(c1, maxi, Min2); m.dif(c2, mini, Max2);
  for (let k = 0; k < 3; k++) p[k] = (Math.abs(c1[k]) < Math.abs(c2[k]) ? c2[k] : c1[k]) / 8;
  if (inv) m.dec(a.velocity, p); else m.inc(a.velocity, p);
}
function overlap(mini: Float32Array, maxi: Float32Array, Min2: Float32Array, Max2: Float32Array): boolean {
  for (let k = 0; k < 3; k++) if (maxi[k] < Min2[k] || Max2[k] < mini[k]) return false;
  return true;
}
function boxBox(a: Cl, b: Cl, m1: ClItem, m2: ClItem): boolean {
  const inv = !!(a.flags & V3XCMODE_INVERTCONDITION || b.flags & V3XCMODE_INVERTCONDITION);
  const mini = m.vec(), maxi = m.vec(), Min2 = m.vec(), Max2 = m.vec();
  m.sum(mini, m1.min, m1.center); m.sum(maxi, m1.max, m1.center); m.sum(Min2, m2.min, m2.center); m.sum(Max2, m2.max, m2.center);
  const hit = overlap(mini, maxi, Min2, Max2);
  if (hit) {
    if (a.weight < b.weight) { if (a.flags & V3XCMODE_REFLEX) bumpBox(a, mini, maxi, Min2, Max2, inv); }
    else if (b.flags & V3XCMODE_INVERTCONDITION) bumpBox(b, Min2, Max2, mini, maxi, inv);
  }
  return hit !== inv;
}
function boxSph(a: Cl, b: Cl, m1: ClItem, m2: ClItem): boolean {
  const inv = !!(a.flags & V3XCMODE_INVERTCONDITION || b.flags & V3XCMODE_INVERTCONDITION);
  const mini = m.vec(), maxi = m.vec(), Min2 = m.vec(), Max2 = m.vec(), r = m.vec(m2.radius, m2.radius, m2.radius);
  m.sum(mini, m1.min, m1.center); m.sum(maxi, m1.max, m1.center);
  m.sum(Max2, m2.center, r); m.dif(Min2, m2.center, r);
  const hit = overlap(mini, maxi, Min2, Max2);
  if (hit) {
    if (a.weight < b.weight) bumpBox(a, mini, maxi, Min2, Max2, inv);
    else bumpBox(b, Min2, Max2, mini, maxi, inv);
  }
  return hit !== inv;
}
/** V3XCL_Test */
export function clTest(a: Cl, b: Cl): boolean {
  let mm = false;
  for (const aa of a.item) {
    for (const bb of b.item) {
      let hit = false;
      if (aa.type === V3XCTYPE_SPHERE) {
        if (bb.type === V3XCTYPE_SPHERE) hit = sphSph(a, b, aa, bb);
        else if (bb.type === V3XCTYPE_AXISBOX) hit = boxSph(b, a, bb, aa);
      } else if (aa.type === V3XCTYPE_AXISBOX) {
        if (bb.type === V3XCTYPE_AXISBOX) hit = boxBox(a, b, aa, bb);
        else if (bb.type === V3XCTYPE_SPHERE) hit = boxSph(a, b, aa, bb);
      }
      if (hit) { a.last_hit = bb; b.last_hit = aa; mm = true; }
    }
  }
  return mm;
}

/** V3XVECTOR_IsVisible: is the segment start..end free of visible meshes? (used by the sun's flare) */
export function isVisible(scene: Scene, start: Float32Array, end: Float32Array, skip: OVI | null): boolean {
  for (const o of scene.OVI) {
    const ORI = o.ORI;
    if (!ORI || ORI.type !== V3XOBJ_MESH || o === skip) continue;
    if (o.state & (V3XSTATE_HIDDENDISPLAY | V3XSTATE_HIDDEN | V3XSTATE_GIANT)) continue;
    if (ORI.global_rayon < m.CST_EPSILON) continue;
    const c = m.vec();
    m.applyMatrixTrans(c, ORI.global_center, o.node.matrix);
    if (m.intersectSphereSegment(ORI.global_rayon / 2, c, start, end)) return false;
  }
  return true;
}
