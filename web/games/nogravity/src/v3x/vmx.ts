// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the scene files (.vmx), V3XScene_GetFromFile_VMX and
// its unpackers (rlx32/src/v3xscen2.c). A .vmx is a gzip stream of the 32-bit structures the engine
// keeps in memory (V3X'97 layout): a 28-byte scene header, the 228-byte V3XLAYER97, numORI V3XORI97 (64
// bytes), numOVI V3XOVI97 (64), numTRI V3XTRI (32), numTVI V3XTVI (16), then per ORI its node / mesh /
// light / camera, morph and collision data, per OVI its node (144 bytes), per TRI its keys.
// Pointer fields in the dumps only say whether data follows (non-zero) or not.
import { gunzipSync } from 'fflate';
import { mtx } from './math.ts';

export const V3XOBJ_VIEWPORT = 1, V3XOBJ_CAMERA = 2, V3XOBJ_LIGHT = 3, V3XOBJ_DUMMY = 4, V3XOBJ_MESH = 5,
  V3XOBJ_PORTAL = 6, V3XOBJ_NONE = 0xff;
export const V3XMATRIX_Euler = 0, V3XMATRIX_Vector = 1, V3XMATRIX_Custom = 2, V3XMATRIX_Euler2 = 3,
  V3XMATRIX_Vector2 = 4, V3XMATRIX_Quaternion = 5;
export const V3XKF_KEYEX = 0x4;
export const V3XMESH_FULLUPDATE = 0x1, V3XMESH_HASDYNLIGHT = 0x2, V3XMESH_NOZSHADING = 0x8,
  V3XMESH_HASSHADETABLE = 0x800, V3XMESH_FLATSHADE = 0x20000, V3XMESH_LOWDETAIL = 0x8000;
export const V3XENVMAPTYPE_DOUBLE = 0x8;
export const V3XCMODE_DONOTTESTSAMEID = 0x8, V3XCMODE_INVERTCONDITION = 0x10, V3XCMODE_NOFEEDBACK = 0x20,
  V3XCMODE_DONTMOVE = 0x40, V3XCMODE_REFLEX = 0x800;
export const V3XCTYPE_SPHERE = 1, V3XCTYPE_AXISBOX = 2;
export const V3XLIGHTCAPS_LENZFLARE = 0x1, V3XLIGHTCAPS_RANGE = 0x8;
export const V3XBLENDMODE_NONE = 0, V3XBLENDMODE_SUB = 1, V3XBLENDMODE_ALPHA = 2, V3XBLENDMODE_ADD = 3;

/** V3XMATERIAL (128 bytes); the bit field `info` unpacked */
export interface Material {
  info: {
    TwoSide: number; Opacity: number; Perspective: number; Filtering: number; Texturized: number;
    Transparency: number; Shade: number; Sprite: number; Environment: number; Dynamic: number;
    AlphaLight: number; Transparency2: number;
  };
  shift_size: number; alpha: number; shiness: number; strength: number;
  mat_name: string; ref_name: string; tex_name: string;
  ambient: [number, number, number]; diffuse: [number, number, number]; specular: [number, number, number];
  Properties: number; RenderID: number; Render: number; scale: number;
  /** the port's: the texture (set by the renderer) and a version counter for changes */
  tex?: unknown; version: number;
}

/** V3XKEY: 7 floats; info = {angle 0..2, pos 3..5}; vinfo = {target 0..2, pos 3..5, roll 6}; dinfo = {vect, pos, roll} */
export type Key = Float32Array;
export const kAngle = (k: Key): Float32Array => k.subarray(0, 3);
export const kTarget = kAngle, kVect = kAngle;
export const kPos = (k: Key): Float32Array => k.subarray(3, 6);

export interface Poly {
  matIndex: number; Mat: Material; faceTab: Uint32Array; numEdges: number;
  /** per edge shade (float) or rgb (4 bytes) */
  shade: Float32Array | null; rgb: Uint8Array | null;
  uv: Float32Array | null;
  flags: number;
}
/** V3XMESH (and V3XNODE, which shares its first 116 bytes' meaning for matrix and Tk) */
export interface Mesh {
  vertex: Float32Array; face: Poly[]; uv: Float32Array | null; normal: Float32Array | null;
  normal_face: Float32Array; material: Material[];
  matrix: Float32Array; Tk: Key; flags: number;
  numVerts: number; numMaterial: number; numFaces: number; selfIllumine: number;
  scale: number; rgb: Uint8Array | null; radius: number;
  /** id of the geometry (shared by the instances of one ORI), for the renderer */
  geomId: number;
}
export interface Light {
  pos: Float32Array; target: Float32Array; intensity: number; diminish: number; range: number; falloff: number;
  color: [number, number, number, number]; material: Material | null; flaresize: number;
  Tk: Key; type: number; flags: number; alpha: number; status: number;
  Timer: number; TimeOn: number; TimeOff: number;
  matrix: Float32Array;
}
export interface Camera { flags: number; matrix_Method: number; focal: number; matrix: Float32Array; Tk: Key }
export interface ClItem {
  type: number; center: Float32Array; _center: Float32Array; radius: number; min: Float32Array; max: Float32Array;
}
export interface Cl {
  numItem: number; weight: number; item: ClItem[]; global: ClItem; velocity: Float32Array;
  mesh_ref: Mesh | null; flags: number; ID: number; hitCount: number; hitID: number; reaction: number;
  last_hit: ClItem | null;
}
export interface Tween { numFrames: number; numVerts: number; numFaces: number; frame: Float32Array[] }

export type NodeData = Mesh | Light | Camera | { matrix: Float32Array; Tk: Key };

export interface ORI {
  flags: number; type: number; name: string;
  /** mesh, light, camera or plain node */
  node: NodeData | null;
  morph: Tween | null; Cs: Cl | null;
  global_center: Float32Array; global_rayon: number; index_color: number;
  /** from the '97 layout: parent index and matrix method */
  index_Parent: number; matrix_Method: number;
}
export interface OVI {
  index: number;
  state: number; matrix_Method: number;
  data: unknown;
  /** OVI->mesh / light / camera / node (a union in the original) */
  node: NodeData;
  ORI: ORI | null; index_ORI: number;
  parent: OVI | null; index_PARENT: number;
  target: OVI | null;
  index_INSTANCE: number;
  TVI: TVI | null; index_TVI: number;
  Tk: Key | null;
  child: OVI[];
  collisionList: OVI | null;
  distance: number;
  subDefinition: number;
}
export interface TRI {
  keys: Key[]; scale: Float32Array[] | null; numFrames: number; startFrame: number; numKeys: number; fps: number; flags: number;
  index_NEXT: number; index_CHAIN: number;
}
export interface TVI { TRI: TRI | null; index_TRI: number; frame: number; flags: number; fps: number; startTimer: number }
export interface Scene {
  signature: string;
  ORI: ORI[]; OVI: OVI[]; TRI: TRI[]; TVI: TVI[];
  layer: {
    palette: string; background: string; solidColor: [number, number, number, number];
    fogColor: [number, number, number]; fog: boolean; bgFlags: number;
  };
}

export const V3XSTATE_HIDDEN = 0x2, V3XSTATE_HIDDENDISPLAY = 0x4, V3XSTATE_CULLED = 0x8, V3XSTATE_CULLEDOFR = 0x10,
  V3XSTATE_MATRIXUPDATE = 0x20, V3XSTATE_PROCESSED = 0x40, V3XSTATE_TOPROCESS = 0x80, V3XSTATE_PRSCOLLISION = 0x100,
  V3XSTATE_CULLNEVER = 0x400, V3XSTATE_GIANT = 0x800, V3XSTATE_VALIDPOINTER = 0x1, V3XSTATE_INSTANCED = 0x8000;

let geomCounter = 1;

class Reader {
  p = 0;
  readonly dv: DataView;
  readonly b: Uint8Array;
  constructor(b: Uint8Array) { this.b = b; this.dv = new DataView(b.buffer, b.byteOffset, b.byteLength); }
  u8(o: number): number { return this.b[this.p + o]; }
  u16(o: number): number { return this.dv.getUint16(this.p + o, true); }
  i32(o: number): number { return this.dv.getInt32(this.p + o, true); }
  u32(o: number): number { return this.dv.getUint32(this.p + o, true); }
  f32(o: number): number { return this.dv.getFloat32(this.p + o, true); }
  f32a(o: number, n: number): Float32Array {
    const r = new Float32Array(n);
    for (let i = 0; i < n; i++) r[i] = this.dv.getFloat32(this.p + o + 4 * i, true);
    return r;
  }
  str(o: number, n: number): string {
    let s = '';
    for (let i = 0; i < n; i++) { const c = this.b[this.p + o + i]; if (!c) break; s += String.fromCharCode(c); }
    return s;
  }
  skip(n: number): void {
    if (this.p + n > this.b.length) throw new Error('vmx: unexpected end of file');
    this.p += n;
  }
}

function readMaterials(r: Reader, n: number): Material[] {
  const out: Material[] = [];
  for (let i = 0; i < n; i++) {
    const lod = r.u32(0);
    const bits = (b: number, l: number): number => (lod >>> b) & ((1 << l) - 1);
    out.push({
      info: {
        TwoSide: bits(0, 1), Opacity: bits(1, 1), Perspective: bits(2, 1), Filtering: bits(3, 1), Texturized: bits(4, 2),
        Transparency: bits(6, 2), Shade: bits(8, 2), Sprite: bits(10, 2), Environment: bits(12, 4), Dynamic: bits(16, 1),
        AlphaLight: bits(18, 1), Transparency2: bits(19, 3),
      },
      shift_size: r.u8(4), alpha: r.u8(5), shiness: r.u8(6), strength: r.u8(7),
      mat_name: r.str(8, 16), ref_name: r.str(24, 16), tex_name: r.str(40, 16),
      ambient: [r.u8(112), r.u8(113), r.u8(114)], diffuse: [r.u8(115), r.u8(116), r.u8(117)],
      specular: [r.u8(118), r.u8(119), r.u8(120)],
      Properties: r.u8(121), RenderID: r.u8(122), Render: r.u8(123), scale: r.u8(124), version: 0,
    });
    r.skip(128);
  }
  return out;
}

function readNodeHeader(r: Reader): { matrix: Float32Array; Tk: Key } {
  const matrix = r.f32a(24, 16);
  const Tk = r.f32a(88, 7);
  return { matrix, Tk };
}

function readMesh(r: Reader): Mesh {
  const { matrix, Tk } = readNodeHeader(r);
  const hasUv = r.u32(8) !== 0, hasNormal = r.u32(12) !== 0;
  const flags = r.u32(116);
  const numVerts = r.u16(120), numMaterial = r.u16(122), numFaces = r.u16(124), selfIllumine = r.u16(126);
  let scale = r.f32(128);
  const radius = r.f32(136);
  r.skip(144);
  const mesh: Mesh = {
    vertex: new Float32Array(0), face: [], uv: null, normal: null, normal_face: new Float32Array(0), material: [],
    matrix, Tk, flags, numVerts, numMaterial, numFaces, selfIllumine, scale, rgb: null, radius, geomId: geomCounter++,
  };
  if (!numVerts) return mesh;
  mesh.vertex = r.f32a(0, numVerts * 3); r.skip(numVerts * 12);
  const faces: { matIndex: number; numEdges: number; flags: number }[] = [];
  for (let i = 0; i < numFaces; i++) {
    faces.push({ matIndex: r.i32(0), numEdges: r.u8(28), flags: r.u8(29) });
    r.skip(32);
  }
  if (hasUv) { mesh.uv = r.f32a(0, numVerts * 2); r.skip(numVerts * 8); }
  if (hasNormal) { mesh.normal = r.f32a(0, numVerts * 3); r.skip(numVerts * 12); }
  if (flags & V3XMESH_HASSHADETABLE) {
    const nb = flags & V3XMESH_FLATSHADE ? numFaces : numVerts;
    mesh.rgb = r.b.slice(r.p, r.p + nb * 4); r.skip(nb * 4);
  }
  if (!scale) scale = 1; // V3XOPTION_97 is set while loading a .vmx: the scale is always 1
  mesh.scale = 1;
  mesh.normal_face = r.f32a(0, numFaces * 3); r.skip(numFaces * 12);
  mesh.material = readMaterials(r, numMaterial);
  for (const fc of faces) {
    const matIndex = fc.matIndex - 1;
    if (matIndex < 0 || matIndex >= numMaterial) throw new Error('vmx: bad material index');
    const Mat = mesh.material[matIndex];
    const faceTab = new Uint32Array(fc.numEdges);
    for (let j = 0; j < fc.numEdges; j++) faceTab[j] = r.u32(4 * j);
    r.skip(4 * fc.numEdges);
    let shade: Float32Array | null = null, rgb: Uint8Array | null = null;
    if (Mat.info.Shade) {
      shade = r.f32a(0, fc.numEdges);
      rgb = r.b.slice(r.p, r.p + 4 * fc.numEdges);
      r.skip(4 * fc.numEdges);
    }
    let uv: Float32Array | null = null;
    if (Mat.info.Texturized) {
      uv = r.f32a(0, fc.numEdges * 2); r.skip(8 * fc.numEdges);
      for (let j = 0; j < uv.length; j++) uv[j] = Math.fround(uv[j] / 255);
      for (let j = 0; j < fc.numEdges; j++) if (faceTab[j] >= numVerts) throw new Error('vmx: bad vertex index');
    }
    mesh.face.push({ matIndex, Mat, faceTab, numEdges: fc.numEdges, shade, rgb, uv, flags: fc.flags });
  }
  return mesh;
}

function readLight(r: Reader): Light {
  const l: Light = {
    pos: r.f32a(0, 3), target: r.f32a(12, 3), intensity: r.f32(48), diminish: r.f32(52), range: r.f32(56),
    falloff: r.f32(60), color: [r.u8(64), r.u8(65), r.u8(66), r.u8(67)], material: null, flaresize: r.f32(72),
    Tk: r.f32a(88, 7), type: r.u8(116), flags: r.u8(117), alpha: r.u8(118), status: r.u8(119),
    Timer: r.u32(120), TimeOn: r.u32(124), TimeOff: r.u32(128), matrix: mtx(),
  };
  const hasMat = r.u32(68) !== 0;
  r.skip(144);
  if (l.flags & V3XLIGHTCAPS_LENZFLARE && hasMat) l.material = readMaterials(r, 1)[0];
  else l.flags &= ~V3XLIGHTCAPS_LENZFLARE;
  l.flags |= V3XLIGHTCAPS_RANGE;
  return l;
}

function readCamera(r: Reader): Camera {
  const c: Camera = { flags: r.u32(0), matrix_Method: r.u32(4), focal: r.f32(20), matrix: r.f32a(24, 16), Tk: r.f32a(88, 7) };
  r.skip(144);
  return c;
}

function readClItem(r: Reader): ClItem {
  return {
    type: r.i32(0), center: r.f32a(4, 3), _center: r.f32a(16, 3), radius: r.f32(28),
    min: r.f32a(40, 3), max: r.f32a(52, 3),
  };
}

function readCollide(r: Reader): Cl {
  const numItem = r.u32(0), weight = r.u32(4);
  const save = r.p;
  r.p = save + 12;
  const g = { type: r.i32(0), center: r.f32a(4, 3), _center: r.f32a(16, 3), radius: r.f32(28), min: new Float32Array(3), max: new Float32Array(3) };
  r.p = save;
  const velocity = r.f32a(48, 3);
  const flags = r.u32(64), ID = r.u32(68), old0 = r.u8(72);
  const reaction = r.f32(80);
  r.skip(88);
  const item: ClItem[] = [];
  for (let i = 0; i < numItem; i++) { item.push(readClItem(r)); r.skip(64); }
  const Cs: Cl = { numItem, weight, item, global: g, velocity, mesh_ref: null, flags, ID, hitCount: 0, hitID: 0, reaction, last_hit: null };
  if (old0) Cs.flags |= V3XCMODE_INVERTCONDITION;
  return Cs;
}

function readMorph(r: Reader): Tween | null {
  const numFrames = r.u32(4), numVerts = r.u32(8), numFaces = r.u32(12);
  r.skip(16);
  if (!numFrames || !numVerts) return null;
  const frame: Float32Array[] = [];
  for (let i = 0; i < numFrames; i++) { frame.push(r.f32a(0, numVerts * 3)); r.skip(numVerts * 12); }
  return { numFrames, numVerts, numFaces, frame };
}

/** parse a .vmx (gzip-compressed or already inflated) */
export function parseVmx(file: Uint8Array): Scene {
  const raw = file[0] === 0x1f && file[1] === 0x8b ? gunzipSync(file) : file;
  const r = new Reader(raw);
  const signature = r.str(0, 4);
  const numOVI = r.u16(4), numTVI = r.u16(6), numTRI = r.u16(8), numORI = r.u16(10);
  r.skip(28);
  // V3XLAYER97
  const layer = {
    background: r.str(0, 16), palette: r.str(48, 16),
    solidColor: [r.u8(176), r.u8(177), r.u8(178), r.u8(179)] as [number, number, number, number],
    fogColor: [r.u8(192), r.u8(193), r.u8(194)] as [number, number, number], fog: r.u8(195) !== 0, bgFlags: 2,
  };
  r.skip(228);
  // v3xORI_Convert97
  const objTable = [V3XOBJ_NONE, V3XOBJ_MESH, V3XOBJ_DUMMY, V3XOBJ_LIGHT, V3XOBJ_NONE, V3XOBJ_CAMERA, V3XOBJ_VIEWPORT, 0];
  const oriRaw: { node: boolean; morph: boolean; Cs: boolean }[] = [];
  const ORI: ORI[] = [];
  for (let i = 0; i < numORI; i++) {
    let type = objTable[r.u8(20) & 7];
    if (type === 0) type = V3XOBJ_NONE;
    oriRaw.push({ node: r.u32(0) !== 0, morph: r.u32(4) !== 0, Cs: r.u32(8) !== 0 });
    ORI.push({
      flags: 0, type, name: r.str(28, 16), node: null, morph: null, Cs: null,
      global_center: r.f32a(44, 3), global_rayon: r.f32(16), index_color: r.u8(22),
      index_Parent: r.u16(24), matrix_Method: r.u8(21),
    });
    r.skip(64);
  }
  // v3xOVI_Convert97
  const OVI: OVI[] = [];
  for (let i = 0; i < numOVI; i++) {
    let state = V3XSTATE_MATRIXUPDATE;
    if (r.u8(48)) state |= V3XSTATE_CULLNEVER;
    if (r.u8(49)) state |= V3XSTATE_HIDDEN;
    const index_ORI = r.u16(38);
    OVI.push({
      index: i, state, matrix_Method: ORI[index_ORI]?.matrix_Method ?? 0, data: null,
      node: { matrix: mtx(), Tk: new Float32Array(7) }, ORI: null, index_ORI,
      parent: null, index_PARENT: ORI[index_ORI]?.index_Parent ?? 0, target: null,
      index_INSTANCE: r.u16(36), TVI: null, index_TVI: r.u16(40), Tk: null, child: [], collisionList: null,
      distance: 0, subDefinition: 0,
    });
    r.skip(64);
  }
  for (const ovi of OVI) {
    const j = ovi.index_PARENT;
    if (j) {
      const name = ORI[j].name.toLowerCase();
      ovi.index_PARENT = OVI.findIndex((o) => (ORI[o.index_ORI]?.name ?? '').toLowerCase() === name);
      if (ovi.index_PARENT < 0) ovi.index_PARENT = 0xffff;
    }
  }
  const TRIraw: { keys: boolean; index_NEXT: number; index_CHAIN: number; numFrames: number; startFrame: number; numKeys: number; fps: number; flags: number }[] = [];
  for (let i = 0; i < numTRI; i++) {
    TRIraw.push({
      keys: r.u32(0) !== 0, index_NEXT: r.i32(4), index_CHAIN: r.i32(12), numFrames: r.u16(20), startFrame: r.u16(22),
      numKeys: r.u16(24), fps: r.u8(26), flags: r.u8(27),
    });
    r.skip(32);
  }
  const TVI: TVI[] = [];
  for (let i = 0; i < numTVI; i++) {
    TVI.push({ TRI: null, index_TRI: r.u16(8), frame: r.f32(4), flags: r.u8(10), fps: r.u8(11), startTimer: r.u32(12) });
    r.skip(16);
  }
  for (let i = 0; i < numORI; i++) {
    const o = ORI[i], raw0 = oriRaw[i];
    if (o.type === V3XOBJ_NONE) continue;
    if (raw0.node) {
      switch (o.type) {
        case V3XOBJ_LIGHT: o.node = readLight(r); break;
        case V3XOBJ_CAMERA: o.node = readCamera(r); break;
        case V3XOBJ_MESH: o.node = readMesh(r); break;
        default: o.node = readNodeHeader(r); r.skip(144); break;
      }
    }
    if (raw0.morph) o.morph = readMorph(r);
    if (raw0.Cs) o.Cs = readCollide(r);
  }
  for (const ovi of OVI) { ovi.node = readNodeHeader(r); r.skip(144); }
  const TRI: TRI[] = [];
  for (const t of TRIraw) {
    const keys: Key[] = [];
    let scale: Float32Array[] | null = null;
    if (t.keys) {
      if (t.flags & V3XKF_KEYEX) {
        scale = [];
        for (let i = 0; i < t.numKeys; i++) { keys.push(r.f32a(0, 7)); scale.push(r.f32a(28, 3)); r.skip(44); }
      } else {
        for (let i = 0; i < t.numFrames; i++) { keys.push(r.f32a(0, 7)); r.skip(28); }
      }
    }
    TRI.push({ keys, scale, numFrames: t.numFrames, startFrame: t.startFrame, numKeys: t.numKeys, fps: t.fps, flags: t.flags, index_NEXT: t.index_NEXT, index_CHAIN: t.index_CHAIN });
  }
  if (r.p !== raw.length) throw new Error(`vmx: ${raw.length - r.p} bytes left over`);
  return { signature, ORI, OVI, TRI, TVI, layer };
}
