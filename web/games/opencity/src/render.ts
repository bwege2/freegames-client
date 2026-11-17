// src/renderer.cpp, src/graphicmanager.cpp, src/model/model.cpp: the 3D view, with three.js.
//
// The original draws with OpenGL 1.x's fixed pipeline: one directional light fixed to the eye
// (position (0, 2, 1, 0)), light model ambient 0.7, light ambient (.6, .6, .4), diffuse (.8, .8, .6),
// glColorMaterial tracking ambient and diffuse, flat shading, GL_RESCALE_NORMAL with the models' and the
// terrain's unnormalised normals, textures modulated, no fog. The shaders below compute exactly that per
// vertex (FixedMaterial). The camera is the original's modelview: rotate 35° about x, translate
// (0, -18, -24), scale by the zoom, translate by the arrow keys, then the accumulated rotation; projection
// gluPerspective(50°, aspect, 1, 400) or, with 'o', glOrtho.
import * as THREE from 'three';
import type { Model, TriangleList } from './ac3d.ts';
import type { City } from './city.ts';
import { GC, OC, SC, TOOL } from './codes.ts';
import type { HeightMap } from './heightmap.ts';
import type { PropertyManager, Structure } from './structure.ts';
import type { Vehicle } from './vehicle.ts';

const VIEW_ANGLE = 50, Z_NEAR = 1, Z_FAR = 400, Z_NEAR_ORTHO = -10000, Z_FAR_ORTHO = 1000;
const INITIAL_SCALE = 12, INITIAL_DELTA_X = -25, INITIAL_DELTA_Z = -30, DELTA_X_STEP = 2, DELTA_Z_STEP = 2;
const Y_ROTATE_STEP = 10;
const LOD_HIGH = 0, LOD_MEDIUM = 1, LOD_LOW = 2;
const f32 = Math.fround;

const VERTEX = /* glsl */ `
in vec3 acolor;
uniform vec3 uAmbient;     // light model ambient + light ambient
uniform vec3 uDiffuse;     // light diffuse
uniform vec3 uLightDir;    // eye space, normalised
uniform bool uLit;
uniform float uAlpha;
uniform bool uUse3D;
in vec3 uvw;
out vec4 vColor;
out vec2 vUv;
out vec3 vUvw;
void main() {
  mat4 mv = modelViewMatrix;
#ifdef USE_INSTANCING
  mv = mv * instanceMatrix;
#endif
  gl_Position = projectionMatrix * mv * vec4(position, 1.0);
  vec3 c = acolor;
  if (uLit) {
    // the GL normal transform (n times the inverse modelview) and GL_RESCALE_NORMAL; the normal is
    // not normalised, as in the original
    mat3 inv = inverse(mat3(mv));
    vec3 n = normal * inv;
    n *= 1.0 / length(vec3(inv[0][2], inv[1][2], inv[2][2]));
    float d = max(dot(n, uLightDir), 0.0);
    c = clamp(c * uAmbient + d * c * uDiffuse, 0.0, 1.0);
  }
  vColor = vec4(c, uAlpha);
  vUv = uv;
  vUvw = uvw;
}`;

const FRAGMENT = /* glsl */ `
precision highp sampler3D;
uniform sampler2D map;
uniform sampler3D map3;
uniform bool uUseTex;
uniform bool uUse3D;
uniform float uAlphaTest;
in vec4 vColor;
in vec2 vUv;
in vec3 vUvw;
out highp vec4 fragColor;
void main() {
  vec4 c = vColor;
  if (uUse3D) c *= texture(map3, vUvw);
  else if (uUseTex) c *= texture(map, vUv);
  if (c.a <= uAlphaTest) discard;
  fragColor = c;
}`;

interface FixedOptions {
  map?: THREE.Texture | null;
  map3?: THREE.Data3DTexture | null;
  lit?: boolean;
  alpha?: number;
  alphaTest?: number;
  side?: THREE.Side;
  transparent?: boolean;
  depthTest?: boolean;
}

function fixedMaterial(o: FixedOptions): THREE.ShaderMaterial {
  const lightDir = new THREE.Vector3(0, 2, 1).normalize();
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: {
      uAmbient: { value: new THREE.Vector3(0.7 + 0.6, 0.7 + 0.6, 0.7 + 0.4) },
      uDiffuse: { value: new THREE.Vector3(0.8, 0.8, 0.6) },
      uLightDir: { value: lightDir },
      uLit: { value: o.lit ?? true },
      uAlpha: { value: o.alpha ?? 1 },
      uAlphaTest: { value: o.alphaTest ?? -1 },
      uUseTex: { value: !!o.map },
      uUse3D: { value: !!o.map3 },
      map: { value: o.map ?? null },
      map3: { value: o.map3 ?? null },
    },
    side: o.side ?? THREE.FrontSide,
    transparent: o.transparent ?? false,
    depthTest: o.depthTest ?? true,
    depthWrite: true,
    blending: o.transparent ? THREE.CustomBlending : THREE.NoBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  });
}

const GRID_VERTEX = /* glsl */ `
in vec3 dir;
uniform vec2 uViewport;
flat out int vMajorX;
void main() {
  vec4 a = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 b = projectionMatrix * modelViewMatrix * vec4(position + dir, 1.0);
  vec2 d = (b.xy / b.w - a.xy / a.w) * uViewport;
  vMajorX = abs(d.x) >= abs(d.y) ? 1 : 0;
  gl_Position = a;
}`;
const GRID_FRAGMENT = /* glsl */ `
flat in int vMajorX;
out highp vec4 fragColor;
void main() {
  // glLineStipple(1, 0x3333): two pixels on, two off, counted along the line's major axis
  float p = vMajorX == 1 ? gl_FragCoord.x : gl_FragCoord.y;
  if (mod(floor(p), 4.0) >= 2.0) discard;
  fragColor = vec4(120.0 / 255.0, 120.0 / 255.0, 120.0 / 255.0, 1.0);
}`;

/** a model's three display lists as geometries */
interface ModelGeometry {
  opaque: THREE.BufferGeometry | null;
  twoSide: THREE.BufferGeometry | null;
  alpha: THREE.BufferGeometry | null;
  texture: THREE.Texture | null;
  lists: TriangleList[];
  box: THREE.Box3;
}

function geometry(list: TriangleList | null): THREE.BufferGeometry | null {
  if (!list || list.position.length === 0) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(list.position, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(list.normal, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(list.uv, 2));
  g.setAttribute('acolor', new THREE.Float32BufferAttribute(list.color, 3));
  g.setAttribute('uvw', new THREE.Float32BufferAttribute(new Float32Array((list.position.length / 3) * 3), 3));
  g.computeBoundingSphere();
  return g;
}

/** Model::DisplayList(w, l, tabY, mask): the model sheared to the square's slope */
function shearMatrix(w: number, l: number, t: [number, number, number, number], lift: number, out: THREE.Matrix4): THREE.Matrix4 {
  const a = t[3] - t[0], b = t[1] - t[0];
  // glTranslatef(0, lift, 0) * shear * glTranslatef(w, t0 - w*a - l*b, l)
  const ty = t[0] - w * a - l * b;
  // shear S: x' = x, y' = y + a*x + b*z, z' = z ; then translation applied first
  return out.set(
    1, 0, 0, w,
    a, 1, b, a * w + ty + b * l + lift,
    0, 0, 1, l,
    0, 0, 0, 1,
  );
}

export interface ViewToggles { terrain: boolean; water: boolean; structure: boolean; grid: boolean; compass: boolean; wireframe: boolean }

export class Renderer {
  readonly gl: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.Camera();
  width = 750;
  height = 560;
  // view state (renderer.h)
  scaleRatio = INITIAL_SCALE;
  xTransDelta = DELTA_X_STEP;
  zTransDelta = DELTA_Z_STEP;
  deltaX = INITIAL_DELTA_X;
  deltaZ = INITIAL_DELTA_Z;
  yRotateAngle = 0;
  rotate = new THREE.Matrix4();
  perspective = true;
  lod = LOD_HIGH;
  readonly show: ViewToggles = { terrain: true, water: true, structure: true, grid: true, compass: true, wireframe: false };

  private readonly models = new Map<number, ModelGeometry>();
  private readonly pm: PropertyManager;
  private terrain: THREE.Mesh | null = null;
  private water: THREE.Mesh;
  private grid: THREE.LineSegments | null = null;
  private readonly structureRoot = new THREE.Group();
  private readonly instanced = new Map<string, THREE.InstancedMesh>();
  private readonly vehicleRoot = new THREE.Group();
  private readonly overlayRoot = new THREE.Group();
  private readonly terrainTex: THREE.Data3DTexture;
  private readonly materials: THREE.Material[] = [];

  constructor(canvas: HTMLCanvasElement, pm: PropertyManager, models: Map<number, Model>,
    textures: Map<string, THREE.Texture>, terrain3D: THREE.Data3DTexture, waterTex: THREE.Texture, cloud: THREE.Texture) {
    this.pm = pm;
    THREE.ColorManagement.enabled = false;
    this.gl = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    this.gl.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.gl.setPixelRatio(1);
    this.gl.sortObjects = true;
    this.camera.matrixAutoUpdate = false;
    this.camera.matrixWorldAutoUpdate = false;
    this.scene.matrixWorldAutoUpdate = true;
    // the cloud, drawn over the whole window behind everything (_DisplayCompass's quad at the far plane)
    this.scene.background = cloud;
    this.terrainTex = terrain3D;
    for (const [gc, model] of models) {
      const tex = model.texture ? textures.get(`${gc}`) ?? null : null;
      const lists = [model.opaque, model.twoSide, ...(model.alpha ? [model.alpha] : [])];
      const box = new THREE.Box3();
      for (const list of lists) for (let i = 0; i < list.position.length; i += 3)
        box.expandByPoint(new THREE.Vector3(list.position[i], list.position[i + 1], list.position[i + 2]));
      this.models.set(gc, {
        opaque: geometry(model.opaque), twoSide: geometry(model.twoSide), alpha: geometry(model.alpha),
        texture: tex, lists, box,
      });
    }
    // water: one quad at -0.15 over the city, the texture repeated on every square, blended
    const W = 50, L = 50, WATER = -0.15;
    const wg = new THREE.BufferGeometry();
    const wp = [0, WATER, 0, 0, WATER, L, W, WATER, 0, W, WATER, 0, 0, WATER, L, W, WATER, L];
    wg.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3));
    wg.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
    wg.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 0, L, W, 0, W, 0, 0, L, W, L], 2));
    wg.setAttribute('acolor', new THREE.Float32BufferAttribute(new Array(6).fill([0.3, 0.25, 0.2]).flat(), 3));
    wg.setAttribute('uvw', new THREE.Float32BufferAttribute(new Float32Array(18), 3));
    waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
    const wm = this.track(fixedMaterial({ map: waterTex, side: THREE.DoubleSide, transparent: true }));
    this.water = new THREE.Mesh(wg, wm);
    this.water.renderOrder = 3;
    this.scene.add(this.structureRoot, this.water, this.vehicleRoot, this.overlayRoot);
    this.home();
  }

  private track<T extends THREE.Material>(m: T): T { this.materials.push(m); return m; }

  dispose(): void {
    this.scene.traverse((o) => { if ((o as THREE.Mesh).geometry) (o as THREE.Mesh).geometry.dispose(); });
    for (const m of this.materials) m.dispose();
    this.gl.dispose();
  }

  setSize(w: number, h: number): void {
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);
    this.gl.setSize(this.width, this.height, false);
  }

  // ------------------------------------------------------------------ view (renderer.cpp)

  home(): void {
    this.scaleRatio = INITIAL_SCALE;
    this.xTransDelta = DELTA_X_STEP;
    this.zTransDelta = DELTA_Z_STEP;
    this.deltaX = INITIAL_DELTA_X;
    this.deltaZ = INITIAL_DELTA_Z;
    this.yRotateAngle = 0;
    this.rotate.identity();
    this.setLOD();
  }

  private rotateBy(angle: number): void {
    this.yRotateAngle = Math.trunc(this.yRotateAngle + angle) % 360;
    const m = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(angle));
    m.multiply(new THREE.Matrix4().makeTranslation(this.deltaX, 0, this.deltaZ));
    m.multiply(this.rotate);
    this.deltaX = 0;
    this.deltaZ = 0;
    this.rotate.copy(m);
  }

  rotateLeft(factor = 1): void { this.rotateBy(Y_ROTATE_STEP * factor); }
  rotateRight(factor = 1): void { this.rotateBy(-Y_ROTATE_STEP * factor); }
  moveLeft(factor = 1): void { this.deltaX = this.deltaX - f32(this.xTransDelta * factor); }
  moveRight(factor = 1): void { this.deltaX = this.deltaX + f32(this.xTransDelta * factor); }
  moveUp(factor = 1): void { this.deltaZ = this.deltaZ - f32(this.zTransDelta * factor); }
  moveDown(factor = 1): void { this.deltaZ = this.deltaZ + f32(this.zTransDelta * factor); }

  zoomIn(): void {
    if (this.scaleRatio >= 140) return;
    this.scaleRatio += 1;
    if (this.scaleRatio < 30) { this.xTransDelta = f32(this.xTransDelta - f32(0.09)); this.zTransDelta = f32(this.zTransDelta - f32(0.09)); }
    this.setLOD();
  }

  zoomOut(): void {
    if (this.scaleRatio <= 2) return;
    this.scaleRatio -= 1;
    if (this.scaleRatio < 30) { this.xTransDelta = f32(this.xTransDelta + f32(0.09)); this.zTransDelta = f32(this.zTransDelta + f32(0.09)); }
    this.setLOD();
  }

  private setLOD(): void {
    if (this.scaleRatio >= INITIAL_SCALE) this.lod = LOD_HIGH;
    else if (this.scaleRatio >= INITIAL_SCALE - 8) this.lod = LOD_MEDIUM;
    else if (this.scaleRatio >= INITIAL_SCALE - 10) this.lod = LOD_LOW;
  }

  /** _PrepareView's modelview (without the model's own transform) */
  viewMatrix(): THREE.Matrix4 {
    const m = new THREE.Matrix4();
    const deg = THREE.MathUtils.degToRad;
    if (this.perspective) {
      m.makeRotationX(deg(35));
      m.multiply(new THREE.Matrix4().makeTranslation(0, -18, -24));
    } else {
      m.makeRotationX(deg(45));
      m.multiply(new THREE.Matrix4().makeTranslation(this.width / 2, -5, -this.height / 2));
      m.multiply(new THREE.Matrix4().makeScale(24, 24, 24));
    }
    const r = f32(this.scaleRatio / 10);
    m.multiply(new THREE.Matrix4().makeScale(r, r, r));
    m.multiply(new THREE.Matrix4().makeTranslation(this.deltaX, 0, this.deltaZ));
    m.multiply(this.rotate);
    return m;
  }

  projectionMatrix(): THREE.Matrix4 {
    const m = new THREE.Matrix4();
    if (this.perspective) {
      const f = 1 / Math.tan(THREE.MathUtils.degToRad(VIEW_ANGLE) / 2);
      const aspect = f32(this.width / this.height);
      m.set(f / aspect, 0, 0, 0, 0, f, 0, 0,
        0, 0, (Z_FAR + Z_NEAR) / (Z_NEAR - Z_FAR), (2 * Z_FAR * Z_NEAR) / (Z_NEAR - Z_FAR), 0, 0, -1, 0);
    } else {
      const W = this.width, H = this.height, n = Z_NEAR_ORTHO, fa = Z_FAR_ORTHO;
      m.set(2 / W, 0, 0, -1, 0, 2 / H, 0, -1, 0, 0, -2 / (fa - n), -(fa + n) / (fa - n), 0, 0, 0, 1);
    }
    return m;
  }

  // ------------------------------------------------------------------ scene content

  /** _DisplayTerrain: one triangle strip, flat shaded (each triangle takes its last vertex's normal) */
  rebuildTerrain(map: HeightMap): void {
    if (this.terrain) { this.scene.remove(this.terrain); this.terrain.geometry.dispose(); }
    if (this.grid) { this.scene.remove(this.grid); this.grid.geometry.dispose(); this.grid = null; }
    const W = map.width, L = map.length;
    const strip: { p: number[]; n: number[]; t: number[] }[] = [];
    const r = (h: number) => h >= 0 ? f32(f32(f32(h / OC.MAP_HEIGHT_MAX) * 55 / 64) + 9.0 / 64)
      : f32(f32((OC.MAP_HEIGHT_MAX + h) / OC.MAP_HEIGHT_MAX) * 8 / 64);
    const push = (n: number[], w: number, h: number, l: number, tex: number[]) => strip.push({ p: [w, h, l], n: [...n], t: tex });
    for (let l = 0; l < L; l++) {
      let n1: number[], n2: number[];
      if (l % 2 === 0) {
        let w = 0;
        let t = map.squareHeight(w, l);
        n1 = [-(t[3] - t[0]), 1, -(t[1] - t[0])];
        n2 = [-(t[2] - t[1]), 1, t[3] - t[2]];
        push(n1, w, t[0], l, [w, l, r(t[0])]);
        push(n1, w, t[1], l + 1, [w, l + 1, r(t[1])]);
        for (w = 1; w < W; w++) {
          t = map.squareHeight(w, l);
          push(n1, w, t[0], l, [w, l, r(t[0])]);
          push(n2, w, t[1], l + 1, [w, l + 1, r(t[1])]);
          n1 = [-(t[3] - t[0]), 1, -(t[1] - t[0])];
          n2 = [-(t[2] - t[1]), 1, t[3] - t[2]];
        }
        push(n1, w, t[3], l, [w, l, r(t[3])]);
        push(n2, w, t[2], l + 1, [w, l + 1, r(t[2])]);
        push(n2, w, t[2], l + 1, [w, l + 1, r(t[2])]);
      } else {
        let w = W - 1;
        let t = map.squareHeight(w, l);
        n1 = [t[0] - t[3], 1, -(t[2] - t[3])];
        n2 = [-(t[2] - t[1]), 1, t[0] - t[1]];
        push(n1, w + 1, t[3], l, [w + 1, l, r(t[3])]);
        push(n1, w + 1, t[2], l + 1, [w + 1, l + 1, r(t[2])]);
        for (w = W - 2; w >= 0; w--) {
          t = map.squareHeight(w, l);
          push(n1, w + 1, t[3], l, [w + 1, l, r(t[3])]);
          push(n2, w + 1, t[2], l + 1, [w + 1, l + 1, r(t[2])]);
          n1 = [t[0] - t[3], 1, -(t[2] - t[3])];
          n2 = [-(t[2] - t[1]), 1, t[0] - t[1]];
        }
        push(n1, w + 1, t[0], l, [w + 1, l, r(t[0])]);
        push(n2, w + 1, t[1], l + 1, [w + 1, l + 1, r(t[1])]);
        push(n2, w + 1, t[1], l + 1, [w + 1, l + 1, r(t[1])]);
      }
    }
    // the strip's triangles, each with GL's winding for its parity, coloured by its last vertex
    const pos: number[] = [], nor: number[] = [], uvw: number[] = [];
    for (let i = 0; i + 2 < strip.length; i++) {
      const tri = i % 2 === 0 ? [strip[i], strip[i + 1], strip[i + 2]] : [strip[i + 1], strip[i], strip[i + 2]];
      const n = strip[i + 2].n;
      for (const v of tri) { pos.push(...v.p); nor.push(...n); uvw.push(...v.t); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uvw', new THREE.Float32BufferAttribute(uvw, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
    const col = new Float32Array(pos.length);
    for (let i = 0; i < col.length; i += 3) { col[i] = 0.8; col[i + 1] = 0.7; col[i + 2] = 0.6; }
    g.setAttribute('acolor', new THREE.BufferAttribute(col, 3));
    this.terrain = new THREE.Mesh(g, this.track(fixedMaterial({ map3: this.terrainTex, alpha: 0.8, side: THREE.FrontSide })));
    this.terrain.renderOrder = 2;
    this.scene.add(this.terrain);

    // _DisplayMapGrid: lines along both axes through every corner, 0.05 up, unlit
    const gp: number[] = [], gd: number[] = [];
    const line = (a: number[], b: number[]) => {
      const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      gp.push(...a, ...b); gd.push(...d, ...d);
    };
    const hAt = (w: number, l: number) => map.heights[l * (W + 1) + w];
    for (let l = 0; l <= L; l++) for (let w = 0; w < W; w++) line([w, hAt(w, l) + 0.05, l], [w + 1, hAt(w + 1, l) + 0.05, l]);
    for (let w = 0; w <= W; w++) for (let l = 0; l < L; l++) line([w, hAt(w, l) + 0.05, l], [w, hAt(w, l + 1) + 0.05, l + 1]);
    const gg = new THREE.BufferGeometry();
    gg.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
    gg.setAttribute('dir', new THREE.Float32BufferAttribute(gd, 3));
    const gm = this.track(new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, vertexShader: GRID_VERTEX, fragmentShader: GRID_FRAGMENT,
      uniforms: { uViewport: { value: new THREE.Vector2(this.width / 2, this.height / 2) } },
    }));
    this.grid = new THREE.LineSegments(gg, gm);
    this.grid.renderOrder = 1;
    this.scene.add(this.grid);
  }

  private meshFor(key: string, geo: THREE.BufferGeometry, tex: THREE.Texture | null, kind: 'opaque' | 'twoSide' | 'alpha'): THREE.InstancedMesh {
    let m = this.instanced.get(key);
    if (m) return m;
    const mat = this.track(fixedMaterial({
      map: tex,
      side: kind === 'opaque' ? THREE.FrontSide : THREE.DoubleSide,
      transparent: kind === 'alpha',
      alphaTest: kind === 'alpha' ? 0.2 : -1,
    }));
    m = new THREE.InstancedMesh(geo, mat, 2500);
    m.count = 0;
    m.frustumCulled = false;
    m.renderOrder = kind === 'alpha' ? 4 : 0;
    this.instanced.set(key, m);
    this.structureRoot.add(m);
    return m;
  }

  /** every main structure's model on its square (GraphicManager::DisplayStructure), 0.05 up */
  rebuildStructures(city: City): void {
    for (const m of this.instanced.values()) m.count = 0;
    const tmp = new THREE.Matrix4();
    const layer = city.layer;
    for (let l = 0; l < layer.length; l++)
      for (let w = 0; w < layer.width; w++) {
        const s = layer.cells[l * layer.width + w];
        if (s === null || s.main !== null) continue;
        const gc = s.gc;
        const mg = this.models.get(gc);
        if (!mg) continue;
        shearMatrix(w, l, city.map.squareHeight(w, l), 0.05, tmp);
        for (const kind of ['opaque', 'twoSide', 'alpha'] as const) {
          const geo = mg[kind];
          if (!geo) continue;
          const m = this.meshFor(`${gc}:${kind}`, geo, mg.texture, kind);
          m.setMatrixAt(m.count++, tmp);
        }
      }
    for (const m of this.instanced.values()) m.instanceMatrix.needsUpdate = true;
  }

  private applyLOD(): void {
    for (const [key, m] of this.instanced) {
      const kind = key.split(':')[1];
      m.visible = this.show.structure && (kind === 'opaque' || (kind === 'twoSide' && this.lod <= LOD_MEDIUM) ||
        (kind === 'alpha' && this.lod === LOD_HIGH));
    }
  }

  /** the vehicles: GraphicManager::Display(w, l, h, movement) */
  updateVehicles(vehicles: (Vehicle | null)[]): void {
    this.clearGroup(this.vehicleRoot, false);
    const deg = THREE.MathUtils.degToRad;
    for (const v of vehicles) {
      if (v === null) continue;
      const g = this.modelGroup(v.gc, false);
      if (!g) continue;
      const m = new THREE.Matrix4().makeTranslation(v.w + v.tx, v.h + v.ty + 0.05, v.l + v.tz);
      m.multiply(new THREE.Matrix4().makeRotationY(deg(v.ry)));
      m.multiply(new THREE.Matrix4().makeRotationX(deg(v.rx)));
      m.multiply(new THREE.Matrix4().makeRotationZ(deg(v.rz)));
      g.matrixAutoUpdate = false;
      g.matrix.copy(m);
      this.vehicleRoot.add(g);
    }
  }

  private readonly groupCache = new Map<number, THREE.Group[]>();
  private readonly groupsInUse: THREE.Group[] = [];

  /** a model with all its lists (Model::DisplayList()), from a small pool */
  private modelGroup(gc: number, unlit: boolean): THREE.Group | null {
    const mg = this.models.get(gc);
    if (!mg) return null;
    const key = gc * 2 + (unlit ? 1 : 0);
    const pool = this.groupCache.get(key) ?? [];
    this.groupCache.set(key, pool);
    let g = pool.pop();
    if (!g) {
      g = new THREE.Group();
      g.userData.key = key;
      for (const kind of ['opaque', 'twoSide', 'alpha'] as const) {
        const geo = mg[kind];
        if (!geo) continue;
        const mesh = new THREE.Mesh(geo, this.track(fixedMaterial({
          map: mg.texture, side: kind === 'opaque' ? THREE.FrontSide : THREE.DoubleSide,
          transparent: kind === 'alpha', alphaTest: kind === 'alpha' ? 0.2 : -1,
        })));
        mesh.renderOrder = kind === 'alpha' ? 4 : 0;
        mesh.frustumCulled = false;
        g.add(mesh);
      }
    }
    this.groupsInUse.push(g);
    return g;
  }

  private clearGroup(root: THREE.Group, _dispose: boolean): void {
    for (const g of [...root.children] as THREE.Group[]) {
      root.remove(g);
      const key = g.userData.key as number;
      this.groupCache.get(key)?.push(g);
    }
  }

  /** DisplayHighlight (while the left button drags a tool) and DisplayBuildPreview */
  updateOverlay(city: City, drag: { tool: number; w1: number; l1: number; w2: number; l2: number } | null,
    preview: { w: number; l: number; gc: number; ok: boolean } | null): void {
    for (const c of [...this.overlayRoot.children]) {
      this.overlayRoot.remove(c);
      if (c.userData.key !== undefined) this.groupCache.get(c.userData.key as number)?.push(c as THREE.Group);
      else { (c as THREE.Mesh).geometry.dispose(); }
    }
    if (drag) {
      let { w1, l1, w2, l2 } = drag;
      if (w1 > w2) [w1, w2] = [w2, w1];
      if (l1 > l2) [l1, l2] = [l2, l1];
      let rgb: [number, number, number];
      switch (drag.tool) {
        case TOOL.ZONE_RES: rgb = [0.2, 0.5, 0.2]; break;
        case TOOL.ZONE_COM: rgb = [0.2, 0.2, 0.5]; break;
        case TOOL.ZONE_IND: rgb = [0.5, 0.5, 0.2]; break;
        case TOOL.ROAD: rgb = [0.5, 0.65, 0.5]; break;
        case TOOL.ELINE: rgb = [0.55, 0.55, 0.45]; break;
        default: rgb = [0.1, 0.1, 0.1];
      }
      const pos: number[] = [];
      for (let l = l1; l <= l2; l++)
        for (let w = w1; w <= w2; w++) {
          const t = city.map.squareHeight(w, l);
          const a = [0.1 + w, t[0] + 0.1, 0.1 + l], b = [0.1 + w, t[1] + 0.1, 0.9 + l];
          const c = [0.9 + w, t[2] + 0.1, 0.9 + l], d = [0.9 + w, t[3] + 0.1, 0.1 + l];
          pos.push(...a, ...b, ...c, ...a, ...c, ...d);
        }
      this.overlayRoot.add(this.flatMesh(pos, rgb, 1, 5));
    }
    if (preview) {
      const t = city.map.squareHeight(preview.w, preview.l);
      const g = this.modelGroup(preview.gc, false);
      if (g) {
        g.matrixAutoUpdate = false;
        g.matrix.makeTranslation(preview.w, t[0] + 0.15, preview.l);
        this.overlayRoot.add(g);
      }
      const iH = city.map.squareMaxHeight(preview.w, preview.l);
      const [sw, sl] = this.pm.getWLH(preview.gc, 4, 4, 1);
      const y = iH + 0.15 + 0.1;
      const W = preview.w, L = preview.l;
      const pos = [W, y, L, W, y, L + sl, W + sw, y, L + sl, W, y, L, W + sw, y, L + sl, W + sw, y, L];
      this.overlayRoot.add(this.flatMesh(pos, preview.ok ? [0, 1, 0] : [1, 0, 0], 64 / 255, 6));
    }
  }

  private flatMesh(pos: number[], rgb: [number, number, number], alpha: number, order: number): THREE.Mesh {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
    g.setAttribute('uvw', new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3));
    const col = new Float32Array(pos.length);
    for (let i = 0; i < col.length; i += 3) col.set(rgb, i);
    g.setAttribute('acolor', new THREE.BufferAttribute(col, 3));
    const key = `flat:${alpha < 1}`;
    let mat = this.flatMaterials.get(key);
    if (!mat) {
      mat = this.track(fixedMaterial({ lit: false, alpha, side: THREE.DoubleSide, transparent: alpha < 1 }));
      this.flatMaterials.set(key, mat);
    }
    const m = new THREE.Mesh(g, mat);
    m.renderOrder = order;
    return m;
  }
  private readonly flatMaterials = new Map<string, THREE.ShaderMaterial>();

  render(): void {
    const view = this.viewMatrix();
    this.camera.matrixWorldInverse.copy(view);
    this.camera.matrixWorld.copy(view).invert();
    this.camera.projectionMatrix.copy(this.projectionMatrix());
    this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();
    if (this.terrain) this.terrain.visible = this.show.terrain;
    if (this.grid) {
      this.grid.visible = this.show.grid;
      ((this.grid.material as THREE.ShaderMaterial).uniforms.uViewport.value as THREE.Vector2).set(this.width / 2, this.height / 2);
    }
    this.water.visible = this.show.water;
    this.applyLOD();
    for (const m of this.materials) (m as THREE.ShaderMaterial).wireframe = this.show.wireframe && m !== this.grid?.material;
    this.gl.render(this.scene, this.camera);
  }

  // ------------------------------------------------------------------ picking (GetSelectedWLFrom)

  /** the square under the window point (x, y from the top left): the nearest terrain square or structure */
  pick(city: City, x: number, y: number): [number, number] | null {
    const vp = new THREE.Matrix4().multiplyMatrices(this.projectionMatrix(), this.viewMatrix());
    const inv = vp.clone().invert();
    const nx = (x + 0.5) / this.width * 2 - 1, ny = 1 - (y + 0.5) / this.height * 2;
    const a = new THREE.Vector3(nx, ny, -1).applyMatrix4(inv);
    const b = new THREE.Vector3(nx, ny, 1).applyMatrix4(inv);
    const ray = new THREE.Ray(a, b.clone().sub(a).normalize());
    let best = Infinity;
    let hit: [number, number] | null = null;
    const tmp = new THREE.Vector3();
    const v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();
    const test = (p: THREE.Vector3, q: THREE.Vector3, r: THREE.Vector3, w: number, l: number) => {
      const res = ray.intersectTriangle(p, q, r, false, tmp);
      if (res) {
        const d = res.distanceTo(ray.origin);
        if (d < best) { best = d; hit = [w, l]; }
      }
    };
    const map = city.map;
    for (let l = 0; l < map.length; l++)
      for (let w = 0; w < map.width; w++) {
        const t = map.squareHeight(w, l);
        v0.set(w, t[0] + 0.05, l); v1.set(w, t[1] + 0.05, l + 1); v2.set(w + 1, t[2] + 0.05, l + 1); v3.set(w + 1, t[3] + 0.05, l);
        test(v0, v1, v2, w, l);
        test(v0, v2, v3, w, l);
      }
    if (this.show.structure) {
      const m = new THREE.Matrix4(), mi = new THREE.Matrix4();
      const local = new THREE.Ray();
      const layer = city.layer;
      for (let l = 0; l < layer.length; l++)
        for (let w = 0; w < layer.width; w++) {
          const s: Structure | null = layer.cells[l * layer.width + w];
          if (s === null || s.main !== null) continue;
          const mg = this.models.get(s.gc);
          if (!mg) continue;
          shearMatrix(w, l, map.squareHeight(w, l), 0.05, m);
          mi.copy(m).invert();
          local.copy(ray).applyMatrix4(mi);
          if (mg.box.isEmpty() || !local.intersectsBox(mg.box)) continue;
          for (const list of mg.lists) {
            const p = list.position;
            for (let i = 0; i < p.length; i += 9) {
              v0.set(p[i], p[i + 1], p[i + 2]); v1.set(p[i + 3], p[i + 4], p[i + 5]); v2.set(p[i + 6], p[i + 7], p[i + 8]);
              const res = local.intersectTriangle(v0, v1, v2, false, tmp);
              if (res) {
                const d = res.applyMatrix4(m).distanceTo(ray.origin);
                if (d < best) { best = d; hit = [w, l]; }
              }
            }
          }
        }
    }
    return hit;
  }
}

export { GC, SC };
