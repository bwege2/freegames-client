// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the screen. Draws a frame's commands (gx/gx.ts) in
// order with three.js: the 2D quads and lines on the 640x480 screen of the original (glOrtho of
// gl_gx.cpp), and the 3D views with V3X's projection (V3XVector_ProjectWithCenter: x = cx + X * F / -Z,
// y = cy - Y * F / -Z), the colours V3X computes (game/render.ts) and the textures of the scene.
import * as THREE from 'three';
import { GX, BLEND_PUT, BLEND_PSET, BLEND_ADD, BLEND_ALPHA, BLEND_SUB, type GxCommand, type Sheet } from './gx/gx.ts';
import { V3X, meshOf } from './v3x/scene.ts';
import {
  type Scene, type OVI, type Mesh, type Material, V3XOBJ_MESH, V3XSTATE_HIDDENDISPLAY, V3XSTATE_CULLED, V3XSTATE_GIANT,
  V3XBLENDMODE_ADD, V3XBLENDMODE_ALPHA, V3XBLENDMODE_SUB,
} from './v3x/vmx.ts';
import { lightMesh, textureOf, flcTextureOf } from './game/render.ts';
import { keyedRgba } from './gx/png.ts';

const W = 640, H = 480, NEAR = 1, FAR = 65000;
const MAXQ = 8192;

interface OviMesh {
  obj: THREE.Mesh; colors: Float32Array; colorAttr: THREE.BufferAttribute; geomId: number; mesh: Mesh;
  lit: Uint8Array; dyn: boolean; flat: boolean; sprites: THREE.Mesh | null;
}
interface GeomInfo { geom: THREE.BufferGeometry; corners: Int32Array; faceOf: Int32Array; matIndex: Int32Array; groups: { start: number; count: number; mat: Material }[] }

export class Screen {
  readonly renderer: THREE.WebGLRenderer;
  readonly canvas: HTMLCanvasElement;
  private readonly ortho = new THREE.OrthographicCamera(0, W, 0, H, -1, 1);
  private readonly scene2d = new THREE.Scene();
  private readonly batch: THREE.Mesh;
  private readonly pos = new Float32Array(MAXQ * 4 * 3);
  private readonly uv = new Float32Array(MAXQ * 4 * 2);
  private readonly col = new Float32Array(MAXQ * 4 * 4);
  private readonly textures = new Map<number, THREE.DataTexture>();
  private readonly mats2d = new Map<string, THREE.MeshBasicMaterial>();
  private readonly white: Sheet = { id: -1, width: 1, height: 1, rgba: new Uint8Array([255, 255, 255, 255]), version: 0 };
  private scene3d = new THREE.Scene();
  private current: Scene | null = null;
  private readonly ovis = new Map<OVI, OviMesh>();
  private readonly geoms = new Map<number, GeomInfo>();
  private readonly mats3d = new Map<Material, { m: THREE.MeshBasicMaterial; version: number }>();
  private readonly tex3d = new Map<string, THREE.DataTexture>();
  private readonly cam = new THREE.Camera();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.autoClear = false;
    this.renderer.sortObjects = false;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('uv', new THREE.BufferAttribute(this.uv, 2).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    const idx = new Uint32Array(MAXQ * 6);
    for (let i = 0; i < MAXQ; i++) idx.set([4 * i, 4 * i + 1, 4 * i + 2, 4 * i, 4 * i + 2, 4 * i + 3], 6 * i);
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    this.batch = new THREE.Mesh(g, []);
    this.batch.frustumCulled = false;
    this.scene2d.add(this.batch);
    this.cam.matrixAutoUpdate = false;
    this.cam.matrixWorldAutoUpdate = false;
  }

  resize(w: number, h: number, dpr: number): void {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
  }

  // ---------------------------------------------------------------- 2D
  private texture(s: Sheet): THREE.DataTexture {
    let t = this.textures.get(s.id);
    if (!t) {
      t = new THREE.DataTexture(s.rgba, s.width, s.height, THREE.RGBAFormat);
      t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
      t.colorSpace = THREE.NoColorSpace;
      t.needsUpdate = true;
      t.userData.version = s.version;
      this.textures.set(s.id, t);
    } else if (t.userData.version !== s.version) { t.image.data = s.rgba; t.needsUpdate = true; t.userData.version = s.version; }
    return t;
  }
  private material2d(s: Sheet, blend: number): THREE.MeshBasicMaterial {
    const k = `${s.id}|${blend}`;
    let m = this.mats2d.get(k);
    if (m) return m;
    m = new THREE.MeshBasicMaterial({ map: this.texture(s), vertexColors: true, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide });
    switch (blend) {
      case BLEND_PSET: m.blending = THREE.NoBlending; break;
      case BLEND_ADD: case BLEND_SUB:
        m.blending = THREE.CustomBlending; m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneFactor; m.blendEquation = THREE.AddEquation; break;
      default: m.blending = THREE.CustomBlending; m.blendSrc = THREE.SrcAlphaFactor; m.blendDst = THREE.OneMinusSrcAlphaFactor; break;
    }
    this.mats2d.set(k, m);
    return m;
  }
  private draw2d(cmds: GxCommand[]): void {
    if (!cmds.length) return;
    const g = this.batch.geometry;
    g.clearGroups();
    const mats: THREE.Material[] = [];
    const matIndex = new Map<THREE.Material, number>();
    let q = 0, groupStart = 0;
    let cur: THREE.Material | null = null;
    const push = (m: THREE.Material): void => {
      if (m !== cur) {
        if (cur && q > groupStart) g.addGroup(groupStart * 6, (q - groupStart) * 6, matIndex.get(cur)!);
        cur = m; groupStart = q;
        if (!matIndex.has(m)) { matIndex.set(m, mats.length); mats.push(m); }
      }
    };
    const setColor = (i: number, c: number, a: number): void => {
      this.col[4 * i] = ((c >> 16) & 255) / 255; this.col[4 * i + 1] = ((c >> 8) & 255) / 255; this.col[4 * i + 2] = (c & 255) / 255; this.col[4 * i + 3] = a / 255;
    };
    for (const c of cmds) {
      if (q >= MAXQ) break;
      if (c.k === 'q') {
        push(this.material2d(c.sheet ?? this.white, c.sheet ? c.blend : c.blend === BLEND_ALPHA ? BLEND_ALPHA : BLEND_PSET));
        const v = 4 * q;
        this.pos.set([c.x0, c.y0, 0, c.x0, c.y1, 0, c.x1, c.y1, 0, c.x1, c.y0, 0], 3 * v);
        this.uv.set([c.u0, c.v0, c.u0, c.v1, c.u1, c.v1, c.u1, c.v0], 2 * v);
        for (let k = 0; k < 4; k++) setColor(v + k, c.c, c.a);
        q++;
      } else if (c.k === 'l') {
        push(this.material2d(this.white, BLEND_PUT));
        let dx = c.x1 - c.x0, dy = c.y1 - c.y0;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len; dy /= len;
        const nx = -dy * 0.5, ny = dx * 0.5;
        const x0 = c.x0 + 0.5, y0 = c.y0 + 0.5, x1 = c.x1 + 0.5, y1 = c.y1 + 0.5;
        const v = 4 * q;
        this.pos.set([x0 + nx, y0 + ny, 0, x0 - nx, y0 - ny, 0, x1 - nx, y1 - ny, 0, x1 + nx, y1 + ny, 0], 3 * v);
        this.uv.set([0, 0, 0, 1, 1, 1, 1, 0], 2 * v);
        setColor(v, c.c0, c.a0); setColor(v + 1, c.c0, c.a0); setColor(v + 2, c.c1, c.a1); setColor(v + 3, c.c1, c.a1);
        q++;
      }
    }
    if (cur && q > groupStart) g.addGroup(groupStart * 6, (q - groupStart) * 6, matIndex.get(cur)!);
    this.batch.material = mats;
    for (const name of ['position', 'uv', 'color']) {
      const a = g.getAttribute(name) as THREE.BufferAttribute;
      a.clearUpdateRanges();
      a.addUpdateRange(0, q * 4 * a.itemSize);
      a.needsUpdate = true;
    }
    g.setDrawRange(0, q * 6);
    this.renderer.setScissorTest(false);
    this.setViewport(0, 0, W, H);
    this.renderer.render(this.scene2d, this.ortho);
  }
  private setViewport(x: number, y: number, w: number, h: number): void {
    // 640x480 screen coordinates (y down) -> GL viewport (y up) of the canvas
    const cw = this.canvas.width / this.renderer.getPixelRatio(), ch = this.canvas.height / this.renderer.getPixelRatio();
    const sx = cw / W, sy = ch / H;
    this.renderer.setViewport(x * sx, ch - (y + h) * sy, w * sx, h * sy);
    this.renderer.setScissor(x * sx, ch - (y + h) * sy, w * sx, h * sy);
  }

  // ---------------------------------------------------------------- 3D
  setScene(scene: Scene | null): void {
    if (this.current === scene) return;
    for (const om of this.ovis.values()) { om.obj.geometry.dispose(); }
    for (const g of this.geoms.values()) g.geom.dispose();
    for (const m of this.mats3d.values()) m.m.dispose();
    for (const t of this.tex3d.values()) t.dispose();
    for (const a of this.anims.values()) for (const t of a.frames) t.dispose();
    this.ovis.clear(); this.geoms.clear(); this.mats3d.clear(); this.tex3d.clear(); this.anims.clear();
    this.scene3d = new THREE.Scene();
    this.current = scene;
  }
  private geometry(mesh: Mesh): GeomInfo {
    let gi = this.geoms.get(mesh.geomId);
    if (gi) return gi;
    // triangle fans (0, a, b) as gl_v3x.cpp draws them, turned so their winding agrees with the face normal
    const tris: number[] = [], faceOf: number[] = [];
    const order = mesh.face.map((f, i) => ({ f, i })).sort((a, b) => a.f.matIndex - b.f.matIndex);
    const groups: GeomInfo['groups'] = [];
    const v = mesh.vertex;
    for (const { f, i } of order) {
      if (f.Mat.info.Sprite) continue;
      const nf = mesh.normal_face.subarray(3 * i, 3 * i + 3);
      let flip = false;
      if (f.numEdges >= 3) {
        const a = f.faceTab[0], b = f.faceTab[1], c = f.faceTab[2];
        const ux = v[3 * b] - v[3 * a], uy = v[3 * b + 1] - v[3 * a + 1], uz = v[3 * b + 2] - v[3 * a + 2];
        const wx = v[3 * c] - v[3 * a], wy = v[3 * c + 1] - v[3 * a + 1], wz = v[3 * c + 2] - v[3 * a + 2];
        const n0 = uy * wz - uz * wy, n1 = uz * wx - ux * wz, n2 = ux * wy - uy * wx;
        flip = n0 * nf[0] + n1 * nf[1] + n2 * nf[2] < 0;
      }
      let g = groups[groups.length - 1];
      if (!g || g.mat !== f.Mat) { g = { start: tris.length, count: 0, mat: f.Mat }; groups.push(g); }
      for (let t = 0; t + 2 < f.numEdges; t++) {
        const k = [0, t + 1, t + 2];
        if (flip) k.reverse();
        for (const e of k) { tris.push(i * 256 + e); faceOf.push(i); }
        g.count += 3;
      }
    }
    const n = tris.length;
    const pos = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    const corners = new Int32Array(n), matIndex = new Int32Array(n);
    for (let j = 0; j < n; j++) {
      const fi = tris[j] >> 8, e = tris[j] & 255, f = mesh.face[fi];
      const vi = f.faceTab[e];
      corners[j] = tris[j];
      pos.set(v.subarray(3 * vi, 3 * vi + 3), 3 * j);
      if (f.uv) { uv[2 * j] = f.uv[2 * e]; uv[2 * j + 1] = f.uv[2 * e + 1]; }
      matIndex[j] = f.matIndex;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geom.computeBoundingSphere();
    gi = { geom, corners, faceOf: Int32Array.from(faceOf), matIndex, groups };
    this.geoms.set(mesh.geomId, gi);
    return gi;
  }
  /** animated textures: the frames and V3XResources_Animated's clock */
  private readonly anims = new Map<string, { frames: THREE.DataTexture[]; speed: number; last: number; idx: number; users: THREE.MeshBasicMaterial[] }>();
  private animTex(name: string, keyed: boolean): THREE.DataTexture | null {
    const k = `${name}|${keyed}`;
    let a = this.anims.get(k);
    if (!a) {
      const f = flcTextureOf(name);
      if (!f) return null;
      const frames = f.frames.map((fr) => {
        const rgba = new Uint8Array(f.width * f.height * 4);
        for (let i = 0; i < fr.pixels.length; i++) {
          const c = fr.pixels[i] * 3;
          rgba[4 * i] = fr.palette[c]; rgba[4 * i + 1] = fr.palette[c + 1]; rgba[4 * i + 2] = fr.palette[c + 2];
          rgba[4 * i + 3] = keyed && !fr.pixels[i] ? 0 : 255;
        }
        const t = new THREE.DataTexture(rgba, f.width, f.height, THREE.RGBAFormat);
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter;
        t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true;
        return t;
      });
      if (!frames.length) return null;
      a = { frames, speed: f.speed, last: 0, idx: 0, users: [] };
      this.anims.set(k, a);
    }
    return a.frames[a.idx];
  }
  private animate(): void {
    const t = V3X.Time.ms;
    for (const a of this.anims.values()) {
      if (t > a.last) {
        a.last = t + a.speed;
        a.idx = (a.idx + 1) % a.frames.length;
        for (const m of a.users) m.map = a.frames[a.idx];
      }
    }
  }
  private tex(name: string, keyed: boolean): THREE.DataTexture | null {
    const k = `${name}|${keyed}`;
    let t = this.tex3d.get(k);
    if (t) return t;
    if (name.toLowerCase().endsWith('.flc')) return this.animTex(name, keyed);
    const p = textureOf(name);
    if (!p) return null;
    t = new THREE.DataTexture(keyed ? keyedRgba(p) : p.rgba, p.width, p.height, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true;
    t.colorSpace = THREE.NoColorSpace;
    t.needsUpdate = true;
    this.tex3d.set(k, t);
    return t;
  }
  private material(mat: Material, giant: boolean): THREE.MeshBasicMaterial {
    let e = this.mats3d.get(mat);
    if (!e) {
      const map = mat.info.Texturized ? this.tex(mat.tex_name, !!mat.info.Opacity) : null;
      const m = new THREE.MeshBasicMaterial({ map, vertexColors: true, side: mat.info.TwoSide ? THREE.DoubleSide : THREE.FrontSide });
      if (map && mat.info.Opacity) m.alphaTest = 0.5;
      this.anims.get(`${mat.tex_name}|${!!mat.info.Opacity}`)?.users.push(m);
      e = { m, version: -1 };
      this.mats3d.set(mat, e);
    }
    if (e.version !== mat.version) {
      const m = e.m;
      const t = mat.info.Transparency;
      if (t === V3XBLENDMODE_ADD || t === V3XBLENDMODE_SUB) {
        m.transparent = true; m.depthWrite = false; m.blending = THREE.CustomBlending;
        m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneFactor; m.blendEquation = THREE.AddEquation;
      } else if (t === V3XBLENDMODE_ALPHA) {
        m.transparent = true; m.depthWrite = false; m.blending = THREE.NormalBlending; m.opacity = mat.alpha / 255;
      } else { m.transparent = false; m.depthWrite = true; m.blending = THREE.NormalBlending; m.opacity = 1; }
      if (giant) { m.depthWrite = false; m.depthTest = false; }
      m.side = mat.info.TwoSide ? THREE.DoubleSide : THREE.FrontSide;
      m.needsUpdate = true;
      e.version = mat.version;
    }
    return e.m;
  }
  private oviMesh(o: OVI): OviMesh | null {
    let om = this.ovis.get(o);
    if (om !== undefined) return om;
    const mesh = meshOf(o);
    if (!mesh.numFaces || !mesh.vertex.length) { this.ovis.set(o, null as unknown as OviMesh); return null; }
    const gi = this.geometry(mesh);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', gi.geom.getAttribute('position'));
    geom.setAttribute('uv', gi.geom.getAttribute('uv'));
    const colors = new Float32Array(gi.corners.length * 4);
    const colorAttr = new THREE.BufferAttribute(colors, 4).setUsage(THREE.DynamicDrawUsage);
    geom.setAttribute('color', colorAttr);
    geom.boundingSphere = gi.geom.boundingSphere;
    gi.groups.forEach((g, i) => geom.addGroup(g.start, g.count, i));
    const giant = !!(o.state & V3XSTATE_GIANT) || (o.ORI?.name ?? '').toLowerCase() === 'sky_';
    const obj = new THREE.Mesh(geom, gi.groups.map((g) => this.material(g.mat, giant)));
    obj.matrixAutoUpdate = false; obj.matrixWorldAutoUpdate = false;
    obj.frustumCulled = !giant;
    if (giant) obj.renderOrder = -1;
    const dyn = mesh.face.some((f) => f.Mat.info.Shade && f.shade);
    let flat = !!(mesh.flags & 0x20000);
    if (!flat && !mesh.normal) flat = true;
    om = { obj, colors, colorAttr, geomId: mesh.geomId, mesh, lit: new Uint8Array(4 * Math.max(mesh.numVerts, mesh.numFaces)), dyn, flat, sprites: null };
    // sprite faces (Material.Sprite): billboards
    const spriteFaces = mesh.face.filter((f) => f.Mat.info.Sprite);
    if (spriteFaces.length) {
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(spriteFaces.length * 18), 3).setUsage(THREE.DynamicDrawUsage));
      const suv = new Float32Array(spriteFaces.length * 12);
      for (let i = 0; i < spriteFaces.length; i++) suv.set([0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0], 12 * i);
      sg.setAttribute('uv', new THREE.BufferAttribute(suv, 2));
      const scol = new Float32Array(spriteFaces.length * 24).fill(1);
      sg.setAttribute('color', new THREE.BufferAttribute(scol, 4).setUsage(THREE.DynamicDrawUsage));
      spriteFaces.forEach((_f, i) => sg.addGroup(6 * i, 6, i));
      const sm = new THREE.Mesh(sg, spriteFaces.map((f) => {
        const m = this.material(f.Mat, false).clone();
        m.map = this.tex(f.Mat.tex_name, true);
        this.anims.get(`${f.Mat.tex_name}|true`)?.users.push(m);
        m.alphaTest = f.Mat.info.Transparency ? 0 : 0.5; m.side = THREE.DoubleSide; m.depthWrite = false;
        return m;
      }));
      sm.frustumCulled = false; sm.matrixAutoUpdate = false; sm.matrixWorldAutoUpdate = false;
      sm.userData.faces = spriteFaces;
      om.sprites = sm;
      this.scene3d.add(sm);
    }
    this.scene3d.add(obj);
    this.ovis.set(o, om);
    return om;
  }
  /** the vertex colours of a mesh this frame (SET_DIFFUSE / SET_CONSTANT of gl_v3x.cpp) */
  private shade(om: OviMesh): void {
    const mesh = om.mesh, gi = this.geoms.get(om.geomId)!;
    if (om.dyn) lightMesh(mesh, om.lit);
    const c = om.colors;
    for (let j = 0; j < gi.corners.length; j++) {
      const fi = gi.corners[j] >> 8, e = gi.corners[j] & 255, f = mesh.face[fi], M = f.Mat;
      let r: number, g: number, b: number, a: number;
      if (M.info.Shade === 0) { r = M.diffuse[0]; g = M.diffuse[2]; b = M.diffuse[1]; a = M.alpha; }
      else {
        const ee = M.info.Shade === 1 ? 0 : e;
        let sr: number, sg: number, sb: number, sa: number;
        if (om.dyn) {
          const k = om.flat ? fi : f.faceTab[ee];
          sr = om.lit[4 * k]; sg = om.lit[4 * k + 1]; sb = om.lit[4 * k + 2]; sa = om.lit[4 * k + 3];
        } else if (f.rgb) { sr = f.rgb[4 * ee]; sg = f.rgb[4 * ee + 1]; sb = f.rgb[4 * ee + 2]; sa = f.rgb[4 * ee + 3]; }
        else { sr = sg = sb = 255; sa = 0; }
        r = Math.min(255, (M.ambient[0] >> 2) + ((sr * M.diffuse[0]) >>> 8));
        g = Math.min(255, (M.ambient[1] >> 2) + ((sg * M.diffuse[1]) >>> 8));
        b = Math.min(255, (M.ambient[2] >> 2) + ((sb * M.diffuse[2]) >>> 8));
        a = sa;
      }
      c[4 * j] = r / 255; c[4 * j + 1] = g / 255; c[4 * j + 2] = b / 255; c[4 * j + 3] = M.info.Transparency === V3XBLENDMODE_ALPHA ? a / 255 : 1;
    }
    om.colorAttr.needsUpdate = true;
  }
  private updateSprites(om: OviMesh, camM: Float32Array): void {
    const sm = om.sprites!;
    const faces = sm.userData.faces as Mesh['face'];
    const pos = (sm.geometry.getAttribute('position') as THREE.BufferAttribute).array as Float32Array;
    const v = om.mesh.vertex, M = om.mesh.matrix;
    const I = [camM[0], camM[1], camM[2]], Jv = [camM[3], camM[4], camM[5]];
    faces.forEach((f, i) => {
      const n0 = f.faceTab[0], n2 = f.faceTab[2] ?? f.faceTab[0];
      const lx = v[3 * n0] - v[3 * n2], ly = v[3 * n0 + 1] - v[3 * n2 + 1], lz = v[3 * n0 + 2] - v[3 * n2 + 2];
      let ax = lx === 0 ? Math.abs(lz) : Math.abs(lx), ay = ly === 0 ? Math.abs(lz) : Math.abs(ly);
      if (f.Mat.scale) { const z = f.Mat.scale / 128; ax *= z; ay *= z; }
      const cx = (v[3 * n0] + v[3 * n2]) / 2, cy = (v[3 * n0 + 1] + v[3 * n2 + 1]) / 2, cz = (v[3 * n0 + 2] + v[3 * n2 + 2]) / 2;
      const wx = M[0] * cx + M[1] * cy + M[2] * cz + M[9], wy = M[3] * cx + M[4] * cy + M[5] * cz + M[10], wz = M[6] * cx + M[7] * cy + M[8] * cz + M[11];
      const corner = (sx: number, sy: number): number[] => [
        wx + I[0] * sx * ax / 2 + Jv[0] * sy * ay / 2, wy + I[1] * sx * ax / 2 + Jv[1] * sy * ay / 2, wz + I[2] * sx * ax / 2 + Jv[2] * sy * ay / 2];
      const tl = corner(-1, 1), bl = corner(-1, -1), br = corner(1, -1), tr = corner(1, 1);
      pos.set([...tl, ...bl, ...br, ...tl, ...br, ...tr], 18 * i);
    });
    (sm.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    sm.geometry.computeBoundingSphere();
  }
  private draw3d(c: Extract<GxCommand, { k: 'v' }>): void {
    const scene = this.current;
    if (!scene) return;
    const only = c.only as OVI | null;
    const allowed = new Set<OVI>();
    if (only) { const add = (o: OVI): void => { allowed.add(o); o.child.forEach(add); }; add(only); }
    const processed = new Set(V3X.objects);
    if (!only && c.fill === null) this.animate();
    for (const o of scene.OVI) {
      if (o.ORI?.type !== V3XOBJ_MESH || !o.ORI.node) continue;
      const om = this.oviMesh(o);
      if (!om) continue;
      const visible = processed.has(o) && !(o.state & (V3XSTATE_HIDDENDISPLAY | V3XSTATE_CULLED)) && (!only || allowed.has(o));
      om.obj.visible = visible;
      if (om.sprites) om.sprites.visible = visible;
      if (!visible) continue;
      const M = om.mesh.matrix, s = om.mesh.scale;
      om.obj.matrixWorld.set(M[0] * s, M[1] * s, M[2] * s, M[9], M[3] * s, M[4] * s, M[5] * s, M[10], M[6] * s, M[7] * s, M[8] * s, M[11], 0, 0, 0, 1);
      (om.obj.material as THREE.Material[]).forEach((mm, i) => { const g = this.geoms.get(om.geomId)!.groups[i]; this.material(g.mat, om.obj.renderOrder < 0); void mm; });
      this.shade(om);
      if (om.sprites) { om.sprites.matrixWorld.identity(); this.updateSprites(om, c.camera); }
    }
    // the camera: rows I, J, K of the V3X camera matrix are its axes; projection as V3X projects
    const C = c.camera;
    this.cam.matrixWorld.set(C[0], C[3], C[6], C[9], C[1], C[4], C[7], C[10], C[2], C[5], C[8], C[11], 0, 0, 0, 1);
    this.cam.matrixWorldInverse.copy(this.cam.matrixWorld).invert();
    const F = -c.focal; // V3X's Focal is negative (ymin - ymax)
    const vw = c.view.xmax - c.view.xmin + 1, vh = c.view.ymax - c.view.ymin + 1;
    // screen x = cx + F X / -Z within the full 640x480 screen; the viewport is the view's rectangle
    const sx = (2 * F) / vw, sy = (2 * F) / vh;
    const ox = (2 * (c.cx - c.view.xmin)) / vw - 1, oy = 1 - (2 * (c.cy - c.view.ymin)) / vh;
    const a = -(FAR + NEAR) / (FAR - NEAR), b = (-2 * FAR * NEAR) / (FAR - NEAR);
    this.cam.projectionMatrix.set(sx, 0, -ox, 0, 0, sy, -oy, 0, 0, 0, a, b, 0, 0, -1, 0);
    this.cam.projectionMatrixInverse.copy(this.cam.projectionMatrix).invert();
    this.renderer.setScissorTest(true);
    this.setViewport(c.view.xmin, c.view.ymin, vw, vh);
    if (c.fill !== null) {
      const [r, g, b2] = scene.layer.solidColor;
      this.renderer.setClearColor(new THREE.Color(r / 255, g / 255, b2 / 255), 1);
      this.renderer.clear(true, true, false);
    } else this.renderer.clear(false, true, false);
    this.renderer.sortObjects = true; // the sky first (renderOrder -1), transparent objects back to front
    this.renderer.render(this.scene3d, this.cam);
    this.renderer.sortObjects = false; // the 2D batch keeps the order of its commands
    this.renderer.setScissorTest(false);
  }

  /** draws the commands of the frame; returns false when there were none (the last frame stays) */
  present(): boolean {
    const cmds = GX.commands;
    if (!cmds.length) return false;
    GX.commands = [];
    this.renderer.setRenderTarget(null);
    this.renderer.setScissorTest(false);
    this.renderer.setViewport(0, 0, this.canvas.width / this.renderer.getPixelRatio(), this.canvas.height / this.renderer.getPixelRatio());
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.clear(true, true, false);
    let seg: GxCommand[] = [];
    for (const c of cmds) {
      if (c.k === 'v') { this.draw2d(seg); seg = []; this.draw3d(c); }
      else seg.push(c);
    }
    this.draw2d(seg);
    return true;
  }
  dispose(): void {
    this.setScene(null);
    for (const t of this.textures.values()) t.dispose();
    for (const m of this.mats2d.values()) m.dispose();
    this.batch.geometry.dispose();
    this.renderer.dispose();
  }
}
export { BLEND_PSET, BLEND_ADD, BLEND_ALPHA, BLEND_SUB, BLEND_PUT };
