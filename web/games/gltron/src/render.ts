// GLtron's three.js scene: the original arena (720x720 grid, 144-high walls), floor/wall/skybox
// textures, the lightcycle models with their per-player materials, trail ribbons, the recognizer and
// the 2D HUD/map. The geometry and camera numbers come from geometry.ts (translated from
// src/video and src/game/camera.c). The scene is built in the original's world units, z up, and
// drawn the way drawCam() does: skybox, floor and shadows without depth, then the world with depth.
// Colours are used as the fixed-function pipeline used them (no gamma): linear output, no colour
// management on textures.
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { assetUrl, drawFtx, loadFtx, textAsset, type FtxFont } from './assets.ts';
import {
  CAM_DEFAULTS, CAM_SPEED, EXP_RADIUS_MAX, RECOGNIZER_HEIGHT, REC_SCALE, SHADOW_ROWS,
  cycleAngle, cycleLean, floorQuads, observerCamera, playerCamera, recognizerAngle, recognizerState,
  trailLines, trailMesh, wallQuads, type Quad,
} from './geometry.ts';
import { SPEED_GONE, TRAIL_HEIGHT, TURN_LENGTH, type GltronGame } from './sim.ts';

// artpack.lua: model_diffuse_N, model_specular_N, trail_diffuse_N
const PLAYER_DIFFUSE = [
  [1.0, 0.55, 0.14], [0.75, 0.02, 0.02], [0.12, 0.52, 0.60], [0.80, 0.80, 0.80],
];
const PLAYER_SPECULAR = [
  [0.5, 0.5, 0.0], [0.75, 0.02, 0.02], [0.12, 0.52, 0.6], [1, 1, 1],
];
const PLAYER_TRAIL = [
  [1.0, 0.85, 0.14, 0.6], [0.75, 0.02, 0.02, 0.6], [0.12, 0.52, 0.6, 0.6], [0.7, 0.7, 0.7, 0.6],
];
const LOD_DIST = [100, 200, 400]; // gamegraphics.c lod_dist[1] (lod = 1, "high")
const REC_OUTLINE = [0.8, 0, 0];
// light0 and the light model's ambient is 0.1 (setupLights); three's lights need pi for the same level
const PI = Math.PI;

interface View { player: number; x: number; y: number; w: number; h: number }

export interface MenuLine {
  text: string;
  value?: string;
  active?: boolean;
  heading?: boolean;
}

interface ExplosionData { p0: Float32Array; n0: Float32Array; faceJ: Uint16Array }

const BLACK = (): THREE.MeshBasicMaterial => new THREE.MeshBasicMaterial({
  color: 0, side: THREE.DoubleSide, transparent: true, depthTest: false, depthWrite: false,
});

/** A cycle model with the original's materials (lightcycle.mtl) coloured for one seat. */
class CycleModel {
  readonly group = new THREE.Group();
  readonly spoke: THREE.MeshPhongMaterial[] = [];
  constructor(template: THREE.Object3D, seat: number, doubleSided: boolean) {
    const model = template.clone(true);
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      if (doubleSided) m.geometry = m.geometry.clone();
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      m.material = mats.map((source) => this.material(source.name.trim(), seat, doubleSided));
      m.frustumCulled = false;
    });
    this.group.add(model);
  }

  private material(name: string, seat: number, doubleSided: boolean): THREE.MeshPhongMaterial {
    // lightcycle.mtl: Kd, Ks, Ns per material; SetMaterialColor() recolours "Hull" per player
    let d = [0, 0, 0], s = [0, 0, 0], ns = 0;
    if (name.startsWith('Hull')) { d = PLAYER_DIFFUSE[seat]; s = PLAYER_SPECULAR[seat]; ns = 5; }
    else if (name.startsWith('Window')) { s = [1, 1, 1]; ns = 30; }
    else if (name.startsWith('Chassis')) { d = [0.5, 0.5, 0.5]; s = [0.3, 0.3, 0.3]; ns = 3; }
    else if (name.startsWith('Spoke')) ns = 30;
    const mat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(d[0], d[1], d[2]), specular: new THREE.Color(s[0], s[1], s[2]),
      shininess: ns, side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    });
    mat.name = name;
    if (name.startsWith('Spoke')) this.spoke.push(mat);
    return mat;
  }
}

function dist3(cam: THREE.Vector3, x: number, y: number): number {
  return Math.hypot(x - cam.x, y - cam.y, cam.z);
}

export class Renderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly overlay: HTMLCanvasElement;
  private readonly g: CanvasRenderingContext2D;
  private readonly host: HTMLElement;
  /** skybox, floor and shadows: drawn without depth (drawCam) */
  private readonly back = new THREE.Scene();
  /** walls, recognizer, cycles, trails, glow: drawn with depth */
  private readonly scene = new THREE.Scene();
  private readonly cameras: THREE.PerspectiveCamera[] = [];
  private readonly camPhi = [0, 0, 0, 0];
  private readonly camTypeNow = [-1, -1, -1, -1];
  private readonly lod: CycleModel[][] = [[], [], [], []];
  private readonly explosion: CycleModel[] = [];
  private explosionData!: ExplosionData;
  private readonly shadows: THREE.Group[] = [];
  private readonly trailMeshes: THREE.Mesh[] = [];
  private readonly trailShadows: THREE.Mesh[] = [];
  private readonly trailLineObjs: THREE.LineSegments[] = [];
  private readonly glows: THREE.Mesh[] = [];
  private readonly spokeTime = [0, 0, 0, 0];
  private readonly spokeState = [0, 0, 0, 0];
  private readonly trailKeys: string[] = [];
  private readonly light = new THREE.PointLight(0xffffff, PI, 0, 0);
  private readonly ambient = new THREE.AmbientLight(0xffffff, 0.1 * PI);
  private readonly shadowMatrix = new THREE.Matrix4().fromArray(SHADOW_ROWS).transpose();
  private readonly worldWalls = new THREE.Group();
  private env = new THREE.Group();
  private envGrid = 0;
  private floorTex!: THREE.Texture;
  private wallTex: THREE.Texture[] = [];
  private trailTex!: THREE.Texture;
  private skyTex: THREE.Texture[] = [];
  private font!: FtxFont;
  private menuFont!: FtxFont;
  private logo!: HTMLImageElement;
  private cycleTemplates: THREE.Object3D[] = [];
  private recognizer!: THREE.Object3D;
  private recognizerOutline!: THREE.LineSegments;
  private recognizerShadow!: THREE.Object3D;
  private recWidth = 1;
  private cycleHeight: number[] = [1, 1, 1];
  private recognizerAlpha = 0;
  private readonly resize: ResizeObserver;
  private width = 1;
  private height = 1;
  private dpr = 1;
  camType = 1;
  showScores = true;
  showAi = true;
  showRecognizer = true;
  mapRatio = 0.333;
  trailAlpha = 1;
  glance = [0, 0, 0, 0];

  constructor(host: HTMLElement) {
    this.host = host;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.autoClear = false;
    this.renderer.domElement.className = 'gltron-canvas';
    this.overlay = document.createElement('canvas');
    this.overlay.className = 'gltron-hud';
    host.append(this.renderer.domElement, this.overlay);
    this.g = this.overlay.getContext('2d')!;
    this.resize = new ResizeObserver(() => this.resizeCanvas());
    this.resize.observe(host);
    this.resizeCanvas();
  }

  async load(): Promise<void> {
    const loader = new OBJLoader();
    const loadObj = async (path: string): Promise<THREE.Object3D> => loader.parse(await textAsset(path));
    this.cycleTemplates = await Promise.all(['high', 'med', 'low'].map((q) => loadObj(`data/lightcycle-${q}.obj`)));
    this.recognizer = await loadObj('data/recognizer.obj');
    const tex = (path: string, repeatT: boolean) => {
      const t = new THREE.TextureLoader().load(assetUrl(path));
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = repeatT ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
      t.minFilter = THREE.LinearMipmapLinearFilter; // mipmap_filter 3 (trilinear)
      t.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
      return t;
    };
    this.floorTex = tex('art/gltron_floor.png', true);
    this.wallTex = [1, 2, 3, 4].map((n) => tex(`art/gltron_wall_${n}.png`, false));
    this.trailTex = tex('art/gltron_traildecal.png', false);
    this.skyTex = [0, 1, 2, 3, 4, 5].map((i) => {
      const t = new THREE.TextureLoader().load(assetUrl(`art/skybox${i}.png`));
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      return t;
    });
    this.font = await loadFtx('data/xenotron.ftx');
    this.menuFont = await loadFtx('data/babbage.ftx');
    this.logo = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = assetUrl('art/gltron_logo.png');
    });
    this.cycleHeight = this.cycleTemplates.map((t) => new THREE.Box3().setFromObject(t).getSize(new THREE.Vector3()).z);
    this.recWidth = new THREE.Box3().setFromObject(this.recognizer).getSize(new THREE.Vector3()).x;
    this.explosionData = this.explosionOf(this.cycleTemplates[0]);
    await this.buildRecognizer();
    this.buildScene();
  }

  /** Per face data for drawModelExplosion(): the face's first normal and its index within its material. */
  private explosionOf(template: THREE.Object3D): ExplosionData {
    const meshes: THREE.Mesh[] = [];
    template.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
    let tris = 0;
    for (const m of meshes) tris += m.geometry.getAttribute('position').count / 3;
    const out: ExplosionData = { p0: new Float32Array(tris * 9), n0: new Float32Array(tris * 3), faceJ: new Uint16Array(tris) };
    const count = new Map<string, number>();
    let f = 0;
    for (const m of meshes) {
      const pos = m.geometry.getAttribute('position'), nor = m.geometry.getAttribute('normal');
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      const groups = m.geometry.groups.length ? m.geometry.groups : [{ start: 0, count: pos.count, materialIndex: 0 }];
      for (const grp of groups) {
        const name = mats[grp.materialIndex ?? 0].name.trim();
        for (let v = grp.start; v < grp.start + grp.count; v += 3, f++) {
          for (let k = 0; k < 3; k++) {
            out.p0[f * 9 + k * 3] = pos.getX(v + k);
            out.p0[f * 9 + k * 3 + 1] = pos.getY(v + k);
            out.p0[f * 9 + k * 3 + 2] = pos.getZ(v + k);
          }
          out.n0[f * 3] = nor.getX(v); out.n0[f * 3 + 1] = nor.getY(v); out.n0[f * 3 + 2] = nor.getZ(v);
          const j = count.get(name) ?? 0;
          count.set(name, j + 1);
          out.faceJ[f] = j;
        }
      }
    }
    return out;
  }

  /** drawRecognizer(): black body (the lights leave only a faint specular), red outline from the quad model. */
  private async buildRecognizer(): Promise<void> {
    this.recognizer.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.material = new THREE.MeshBasicMaterial({ color: 0x010401, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
        m.frustumCulled = false;
      }
    });
    this.recognizer.scale.setScalar(REC_SCALE);
    const shadow = this.recognizer.clone(true);
    shadow.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) { m.material = BLACK(); m.renderOrder = 5; }
    });
    shadow.matrixAutoUpdate = false;
    this.recognizerShadow = shadow;
    // recognizer_quad.obj: GL_LINE polygon mode draws the quad edges only
    const text = await textAsset('data/recognizer_quad.obj');
    const verts: number[][] = [];
    const lines: number[] = [];
    for (const line of text.split(/\r?\n/)) {
      if (line.startsWith('v ')) verts.push(line.trim().split(/\s+/).slice(1, 4).map(Number));
      else if (line.startsWith('f ')) {
        const ix = line.trim().split(/\s+/).slice(1).map((s) => parseInt(s.split('/')[0], 10) - 1);
        for (let k = 0; k < ix.length; k++) lines.push(...verts[ix[k]], ...verts[ix[(k + 1) % ix.length]]);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
    this.recognizerOutline = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: new THREE.Color(REC_OUTLINE[0], REC_OUTLINE[1], REC_OUTLINE[2]) }));
    this.recognizerOutline.scale.setScalar(REC_SCALE);
    this.recognizerOutline.frustumCulled = false;
  }

  private quadGeometry(quads: Quad[]): THREE.BufferGeometry {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    quads.forEach((q, i) => {
      pos.push(...q.pos); uv.push(...q.uv);
      idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    return geo;
  }

  /** The grid-size dependent parts: skybox (3 grid sizes out), floor and the four walls. */
  private buildEnvironment(grid: number): void {
    for (const group of [this.env, this.worldWalls]) {
      group.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.geometry.dispose(); });
    }
    this.back.remove(this.env);
    this.worldWalls.clear();
    this.env = new THREE.Group();
    this.envGrid = grid;
    // drawSkybox(): z up, x front; d = grid * 3; the box faces in three's order +x -x +y -y +z -z
    // carry the original's front, back, left, right, top, bottom textures
    const order = [0, 5, 2, 3, 1, 4];
    const skyMats = order.map((i) => new THREE.MeshBasicMaterial({
      map: this.skyTex[i], side: THREE.BackSide, transparent: true, depthTest: false, depthWrite: false,
    }));
    const box = new THREE.Mesh(new THREE.BoxGeometry(grid * 6, grid * 6, grid * 6), skyMats);
    box.renderOrder = 0;
    box.frustumCulled = false;
    this.env.add(box);
    const floor = new THREE.Mesh(this.quadGeometry(floorQuads(grid)), new THREE.MeshBasicMaterial({
      map: this.floorTex, transparent: true, depthTest: false, depthWrite: false,
    }));
    floor.renderOrder = 1;
    floor.frustumCulled = false;
    this.env.add(floor);
    this.back.add(this.env);
    wallQuads(grid).forEach((q, i) => {
      const mesh = new THREE.Mesh(this.quadGeometry([q]), new THREE.MeshBasicMaterial({ map: this.wallTex[i] }));
      mesh.frustumCulled = false;
      this.worldWalls.add(mesh);
    });
  }

  private buildScene(): void {
    this.scene.add(this.worldWalls, this.ambient, this.light, this.recognizer, this.recognizerOutline);
    this.back.add(this.recognizerShadow);
    for (let i = 0; i < 4; i++) {
      const cam = new THREE.PerspectiveCamera(105, 1, 0.5, 4700);
      cam.up.set(0, 0, 1);
      this.cameras.push(cam);
      for (let q = 0; q < 3; q++) {
        const m = new CycleModel(this.cycleTemplates[q], i, false);
        m.group.matrixAutoUpdate = false;
        m.group.visible = false;
        this.scene.add(m.group);
        this.lod[i].push(m);
      }
      const ex = new CycleModel(this.cycleTemplates[0], i, true);
      ex.group.matrixAutoUpdate = false;
      ex.group.visible = false;
      this.scene.add(ex.group);
      this.explosion.push(ex);
      // shadow: the high model in black, projected with shadow_matrix (not while exploding)
      const sh = new THREE.Group();
      sh.matrixAutoUpdate = false;
      const shCycle = this.cycleTemplates[0].clone(true);
      shCycle.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) { m.material = BLACK(); m.frustumCulled = false; m.renderOrder = 2; }
      });
      sh.add(shCycle);
      this.back.add(sh);
      this.shadows.push(sh);

      const trail = new THREE.Mesh(new THREE.BufferGeometry(), this.decalMaterial());
      trail.frustumCulled = false;
      this.scene.add(trail);
      this.trailMeshes.push(trail);
      const tshadow = new THREE.Mesh(trail.geometry, BLACK());
      tshadow.matrixAutoUpdate = false;
      tshadow.matrix.copy(this.shadowMatrix);
      tshadow.frustumCulled = false;
      tshadow.renderOrder = 3;
      this.back.add(tshadow);
      this.trailShadows.push(tshadow);
      this.trailKeys.push('');
      const line = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff }));
      line.frustumCulled = false;
      this.scene.add(line);
      this.trailLineObjs.push(line);
      this.glows.push(this.makeGlow(i));
    }
    this.buildEnvironment(720);
  }

  /** trailStatesNormal(): GL_DECAL, so the vertex colour shows where the decal is transparent. */
  private decalMaterial(): THREE.MeshBasicMaterial {
    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true, map: this.trailTex, side: THREE.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
    });
    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <map_fragment>', 'vec4 decal = texture2D( map, vMapUv ); diffuseColor.rgb = mix( vColor.rgb, decal.rgb, decal.a );')
        .replace('#include <color_fragment>', '');
    };
    return mat;
  }

  /** drawGlow(): a fan facing the camera, additive, fading in between 30 and 100 units. */
  private makeGlow(seat: number): THREE.Mesh {
    const dim = TRAIL_HEIGHT * 4, h = TRAIL_HEIGHT;
    const c = PLAYER_DIFFUSE[seat];
    const pts: [number, number][] = [];
    for (const a of [-0.2, 1.0, 2.0, 3.0, 4.0, 5.2]) {
      pts.push([dim * Math.cos((a * 3.1415) / 5), h / 2 + dim * Math.sin((a * 3.1415) / 5)]);
    }
    const pos: number[] = [], col: number[] = [];
    const vert = (x: number, y: number, lit: boolean) => { pos.push(x, y, 0); col.push(...(lit ? c : [0, 0, 0])); };
    for (let k = 0; k < pts.length - 1; k++) {
      vert(0, h / 2, true); vert(pts[k][0], pts[k][1], false); vert(pts[k + 1][0], pts[k + 1][1], false);
    }
    vert(0, h / 2, true); vert(0, -h / 4, false); vert(pts[0][0], pts[0][1], false);
    vert(0, h / 2, true); vert(pts[5][0], pts[5][1], false); vert(0, -h / 4, false);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    }));
    mesh.frustumCulled = false;
    mesh.visible = false;
    mesh.renderOrder = 10;
    this.scene.add(mesh);
    return mesh;
  }

  private resizeCanvas(): void {
    this.width = Math.max(1, this.host.clientWidth);
    this.height = Math.max(1, this.host.clientHeight);
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.renderer.setSize(this.width, this.height);
    this.overlay.width = Math.round(this.width * this.dpr);
    this.overlay.height = Math.round(this.height * this.dpr);
    this.overlay.style.width = `${this.width}px`;
    this.overlay.style.height = `${this.height}px`;
    this.g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /** setupViewports/autoConfigureDisplay from src/video/video.c. */
  static viewports(type: number, humans: number[], w: number, h: number): View[] {
    const auto = type === 3;
    let t = type;
    if (auto) t = humans.length >= 4 ? 2 : humans.length === 2 ? 1 : 0;
    const fx = w / 32, fy = h / 24;
    const content = t === 2 ? [0, 1, 2, 3] : t === 1 ? [0, 1] : [0];
    if (auto && (t === 0 || t === 1)) for (let i = 0; i < content.length && i < humans.length; i++) content[i] = humans[i];
    if (t === 0) return [{ player: content[0], x: 0, y: 0, w: 32 * fx, h: 24 * fy }];
    if (t === 1) return [
      { player: content[0], x: 1 * fx, y: 0.5 * fy, w: 30 * fx, h: 11.5 * fy },
      { player: content[1], x: 1 * fx, y: 12.5 * fy, w: 30 * fx, h: 11.5 * fy },
    ];
    const xs = [1, 16, 1, 16], ys = [1, 1, 12.5, 12.5];
    return content.map((p, i) => ({ player: p, x: xs[i] * fx, y: ys[i] * fy, w: 14 * fx, h: 10.5 * fy }));
  }

  render(game: GltronGame, viewType: number, humans: number[], now: number, paused: boolean, dt: number): void {
    const views = Renderer.viewports(viewType, humans, this.width, this.height);
    if (this.envGrid !== game.settings.gridSize) this.buildEnvironment(game.settings.gridSize);
    this.updateScene(game, now, dt, paused);
    this.renderer.setScissorTest(false);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.clear(true, true, false);
    this.renderer.setScissorTest(true);
    for (const v of views) {
      this.updateCamera(game, v.player, dt);
      const cam = this.cameras[v.player];
      cam.aspect = v.w / v.h;
      cam.updateProjectionMatrix();
      cam.updateMatrixWorld();
      this.renderer.setViewport(v.x, v.y, v.w, v.h);
      this.renderer.setScissor(v.x, v.y, v.w, v.h);
      this.prepareView(game, v.player);
      this.renderer.clearDepth();
      this.renderer.render(this.back, cam);
      this.renderer.clearDepth();
      this.renderer.render(this.scene, cam);
    }
    this.renderer.setScissorTest(false);
    this.drawHud(game, views, now, paused);
  }

  private updateCamera(game: GltronGame, i: number, dt: number): void {
    const p = game.players[i];
    const d = p.data;
    const cam = this.cameras[i];
    const type = p.ai.active === 1 ? 0 : this.camType;
    if (this.camTypeNow[i] !== type) { this.camTypeNow[i] = type; this.camPhi[i] = CAM_DEFAULTS[type].phi; }
    let res;
    if (d.speed === SPEED_GONE) {
      res = observerCamera(recognizerState(this.recognizerAlpha, game.settings.gridSize, this.recWidth));
    } else {
      const pos = game.position(i);
      if (type === 0) this.camPhi[i] += CAM_SPEED * dt;
      res = playerCamera(type, { x: pos.x, y: pos.y, dir: d.dir, lastDir: d.lastDir, turnTime: d.turnTime },
        game.time, this.camPhi[i], this.glance[i]);
    }
    cam.position.set(res.cam[0], res.cam[1], res.cam[2]);
    cam.up.set(0, 0, 1);
    cam.lookAt(res.target[0], res.target[1], res.target[2]);
    cam.fov = 105;
    cam.near = 0.5;
    cam.far = game.settings.gridSize * 6.5;
  }

  /** What depends on the viewer: the light at the eye, LOD, shadows hidden while others turn, glow. */
  private prepareView(game: GltronGame, viewer: number): void {
    const cam = this.cameras[viewer];
    this.light.position.copy(cam.position);
    for (let i = 0; i < 4; i++) {
      const d = game.players[i].data;
      const pos = game.position(i);
      const dist = Math.hypot(cam.position.x - pos.x, cam.position.y - pos.y, cam.position.z);
      let q = 0;
      while (q < 3 && dist >= LOD_DIST[q]) q++; // playerVisible(): beyond the last distance nothing is drawn
      const alive = d.speed !== SPEED_GONE;
      const exploding = alive && d.expRadius !== 0;
      const t = game.time - d.turnTime;
      const hideTurn = t < TURN_LENGTH && this.camType === 2 && i === viewer;
      // the models are indexed by the original's lod (0 = high, 1 = med, 2 = low); q is the first
      // distance not yet passed, so q = 3 means too far
      const lodIndex = q;
      for (let k = 0; k < 3; k++) this.lod[i][k].group.visible = alive && !exploding && lodIndex === k && !hideTurn;
      this.explosion[i].group.visible = exploding && d.expRadius < EXP_RADIUS_MAX && lodIndex < 3;
      this.shadows[i].visible = alive && !exploding && lodIndex < 3 && !(t < TURN_LENGTH && i !== viewer);
      const glow = this.glows[i];
      glow.visible = i !== viewer && d.speed > 0;
      if (glow.visible) {
        glow.position.set(pos.x, pos.y, 0);
        glow.quaternion.copy(cam.quaternion);
        const a = dist3(cam.position, pos.x, pos.y);
        (glow.material as THREE.MeshBasicMaterial).opacity = a < 30 ? 0 : a > 100 ? 1 : (a - 30) / 70;
      }
    }
    const show = this.showRecognizer && game.players[viewer].data.speed !== SPEED_GONE;
    this.recognizer.visible = this.recognizerOutline.visible = show;
    this.recognizerShadow.visible = this.showRecognizer;
  }

  private updateScene(game: GltronGame, now: number, dt: number, paused: boolean): void {
    if (!paused) this.recognizerAlpha += dt / 2000;
    const rec = recognizerState(this.recognizerAlpha, game.settings.gridSize, this.recWidth);
    const ang = (recognizerAngle(rec.vx) * Math.PI) / 180;
    for (const o of [this.recognizer, this.recognizerOutline]) {
      o.position.set(rec.x, rec.y, RECOGNIZER_HEIGHT);
      o.rotation.set(0, 0, ang);
    }
    this.recognizerShadow.matrix.copy(this.shadowMatrix).multiply(
      new THREE.Matrix4().compose(new THREE.Vector3(rec.x, rec.y, RECOGNIZER_HEIGHT),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), ang),
        new THREE.Vector3(REC_SCALE, REC_SCALE, REC_SCALE)));
    for (let i = 0; i < 4; i++) {
      const d = game.players[i].data;
      const pos = game.position(i);
      const t = game.time - d.turnTime;
      const angle = (cycleAngle(d.dir, d.lastDir, t) * Math.PI) / 180;
      const lean = (cycleLean(d.dir, d.lastDir, t) * Math.PI) / 180;
      const at = new THREE.Matrix4().makeTranslation(pos.x, pos.y, 0);
      const rot = new THREE.Matrix4().makeRotationZ(angle).multiply(new THREE.Matrix4().makeRotationY(lean));
      const lift = (q: number) => new THREE.Matrix4().makeTranslation(0, 0, this.cycleHeight[q] / 2);
      const placed = at.clone().multiply(rot);
      for (let q = 0; q < 3; q++) this.lod[i][q].group.matrix.copy(placed).multiply(lift(q));
      this.explosion[i].group.matrix.copy(placed).multiply(lift(0));
      this.shadows[i].matrix.copy(at).multiply(this.shadowMatrix).multiply(rot).multiply(lift(0));
      // spokes flash white about every 140 ms - 10 ms per speed unit while the game runs
      if (!paused && d.speed > 0 && now - this.spokeTime[i] > 140 - d.speed * 10) {
        this.spokeState[i] ^= 1;
        this.spokeTime[i] = now;
        const on = this.spokeState[i] === 0;
        for (const m of this.lod[i].flatMap((c) => c.spoke)) {
          m.specular.setScalar(on ? 1 : 0);
          m.emissive.setScalar(on ? 0.1 : 0);
        }
      }
      if (d.speed !== SPEED_GONE && d.expRadius !== 0 && d.expRadius < EXP_RADIUS_MAX) this.explode(i, d.expRadius);
      const last = d.trails[d.trailOffset];
      const key = `${d.trailOffset}:${last.dx}:${last.dy}:${d.trailHeight}:${d.dir}:${this.trailAlpha}`;
      if (key !== this.trailKeys[i]) {
        this.trailKeys[i] = key;
        this.buildTrail(i, game);
      }
    }
  }

  /** drawModelExplosion(): every face flies off along its normal plus a fixed vector. */
  private explode(i: number, radius: number): void {
    const vectors = [
      [0.03, -0.06, -0.07], [0.04, 0.08, -0.03], [0.10, -0.04, -0.07], [0.06, -0.09, -0.10], [-0.03, -0.05, 0.02],
      [0.07, 0.08, -0.00], [0.01, -0.04, 0.10], [-0.01, -0.07, 0.09], [0.01, -0.01, -0.09], [-0.04, 0.04, 0.02],
    ];
    const data = this.explosionData;
    let f = 0;
    this.explosion[i].group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const pos = m.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let v = 0; v < pos.count; v += 3, f++) {
        const w = vectors[data.faceJ[f] % 10];
        const tx = radius * (data.n0[f * 3] + w[0]), ty = radius * (data.n0[f * 3 + 1] + w[1]);
        const tz = Math.abs(radius * (data.n0[f * 3 + 2] + w[2]));
        for (let k = 0; k < 3; k++) {
          pos.setXYZ(v + k, data.p0[f * 9 + k * 3] + tx, data.p0[f * 9 + k * 3 + 1] + ty, data.p0[f * 9 + k * 3 + 2] + tz);
        }
      }
      pos.needsUpdate = true;
    });
  }

  private buildTrail(i: number, game: GltronGame): void {
    const d = game.players[i].data;
    const mesh = this.trailMeshes[i], line = this.trailLineObjs[i];
    mesh.visible = line.visible = this.trailShadows[i].visible = d.trailHeight > 0;
    if (d.trailHeight <= 0) return;
    const t = trailMesh(d, PLAYER_TRAIL[i].slice(0, 3), PLAYER_DIFFUSE[i]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(t.pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(t.uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(t.color, 3));
    geo.setIndex(t.index);
    mesh.geometry.dispose();
    mesh.geometry = geo;
    this.trailShadows[i].geometry = geo;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    const transparent = this.trailAlpha < 1;
    if (mat.transparent !== transparent) { mat.transparent = transparent; mat.needsUpdate = true; }
    mat.opacity = this.trailAlpha;
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry();
    line.geometry.setAttribute('position', new THREE.Float32BufferAttribute(trailLines(d), 3));
  }

  /** drawScore/drawAI/drawPause (graphics_hud.c): rasonly() puts the origin at the viewport's bottom left. */
  private drawHud(game: GltronGame, views: View[], now: number, paused: boolean): void {
    const g = this.g;
    g.clearRect(0, 0, this.width, this.height);
    const text = (v: View, s: string, x: number, y: number, size: number, color: string) =>
      drawFtx(g, this.font, s, v.x + x, this.height - (v.y + y + size), size, color);
    for (const v of views) {
      const d = game.players[v.player].data;
      if (this.showScores) text(v, String(d.score), 5, 5, 32, 'rgb(255,255,51)');
      if (this.showAi && game.players[v.player].ai.active === 1) {
        const ai = 'computer player';
        text(v, ai, v.w / 4, 10, v.w / (2 * ai.length), '#ffffff');
      }
      if (this.mapRatio > 0) this.drawMap(game, v);
    }
    if (paused && views.length) {
      const v = views[0];
      const s = (Math.sin(now / 500) + 1) / 2;
      let color = `rgb(255,${Math.round(s * 255)},${Math.round(s * 255)})`;
      let msg = 'Game is paused';
      if (game.finished) {
        if (game.winner >= 0) {
          const c = PLAYER_TRAIL[game.winner];
          color = `rgb(${[0, 1, 2].map((k) => Math.round((c[k] + s * (1 - c[k])) * 255)).join(',')})`;
          msg = `Player ${game.winner + 1} wins!`;
        } else msg = 'No one wins!';
      }
      const size = v.w / ((6 / 4) * msg.length);
      drawFtx(g, this.font, msg, v.w / 6, this.height - (20 + size), size, color);
    }
  }

  /** draw2D(): the grid square, letterboxed in a map_ratio sized viewport 20 px from the corner. */
  private drawMap(game: GltronGame, v: View): void {
    const g = this.g;
    const mw = v.w * this.mapRatio, mh = v.h * this.mapRatio;
    if (mw < 16 || mh < 16) return;
    const gs = game.settings.gridSize;
    const aspect = mw / mh;
    let width: number, height: number, bl = 0, bb = 0;
    if (mw / gs < mh / gs) { width = gs + 1; height = width / aspect; bb = (height - gs) / 2; }
    else { height = gs + 1; width = height * aspect; bl = (width - gs) / 2; }
    const sx = mw / width, sy = mh / height;
    const ox = v.x + 20, oy = this.height - (v.y + 20 + mh); // canvas top-left of the map viewport
    const X = (x: number) => ox + (x + bl) * sx;
    const Y = (y: number) => oy + mh - (y + bb) * sy;
    g.save();
    g.beginPath();
    g.rect(ox, oy, mw, mh);
    g.clip();
    g.fillStyle = 'rgba(179,179,179,0.3)';
    g.fillRect(X(0), Y(gs), gs * sx, gs * sy);
    g.strokeStyle = '#ffffff';
    g.lineWidth = 1;
    g.strokeRect(X(0), Y(gs), gs * sx, gs * sy);
    g.globalCompositeOperation = 'lighter'; // glBlendFunc(GL_ONE, GL_ONE)
    for (let i = 0; i < 4; i++) {
      const d = game.players[i].data;
      if (d.trailHeight <= 0) continue;
      const c = PLAYER_TRAIL[i];
      const a = d.trailHeight < TRAIL_HEIGHT ? d.trailHeight / TRAIL_HEIGHT : 1;
      const color = `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;
      g.strokeStyle = color;
      g.fillStyle = color;
      g.beginPath();
      for (let k = 0; k < d.trailOffset; k++) {
        const t = d.trails[k];
        g.moveTo(X(t.x), Y(t.y));
        g.lineTo(X(t.x + t.dx), Y(t.y + t.dy));
      }
      const p = game.position(i);
      const last = d.trails[d.trailOffset];
      const prev = d.trailOffset > 0 ? d.trails[d.trailOffset - 1] : null;
      g.moveTo(X(prev ? prev.x + prev.dx : last.x), Y(prev ? prev.y + prev.dy : last.y));
      g.lineTo(X(Math.floor(p.x)), Y(Math.floor(p.y)));
      g.stroke();
      g.fillRect(X(p.x) - 1, Y(p.y) - 1, 2, 2);
    }
    g.restore();
  }

  drawMenu(lines: MenuLine[], title: string, footer: string): void {
    const g = this.g;
    g.fillStyle = '#05070a';
    g.fillRect(0, 0, this.width, this.height);
    const logoW = Math.min(420, this.width * 0.5);
    const logoH = logoW * (this.logo.height / this.logo.width);
    g.drawImage(this.logo, (this.width - logoW) / 2, this.height * 0.04, logoW, logoH);
    const size = Math.max(14, Math.min(26, this.width / 40));
    let y = this.height * 0.04 + logoH + 30;
    if (title) {
      drawFtx(g, this.menuFont, title, 40, y, size, '#ffcc33');
      y += size + 14;
    }
    for (const line of lines) {
      const color = line.heading ? '#ffcc33' : line.active ? '#66ff33' : '#ffffff';
      drawFtx(g, this.menuFont, line.text, 60, y, size, color);
      if (line.value) drawFtx(g, this.menuFont, line.value, this.width * 0.62, y, size, color);
      y += size + 10;
    }
    if (footer) drawFtx(g, this.font, footer, 20, this.height - 30, 12, '#888888');
  }


  dispose(): void {
    this.resize.disconnect();
    for (const scene of [this.scene, this.back]) {
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
    }
    this.renderer.dispose();
    this.overlay.remove();
    this.renderer.domElement.remove();
  }
}
