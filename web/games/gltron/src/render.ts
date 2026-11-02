// GLtron's three.js scene: the original arena (720×720 grid, 144-high walls), floor/wall/skybox
// textures, the lightcycle models with their per-player materials, trail ribbons, the recognizer and
// the 2D HUD/map. Positions and camera formulas are translated from src/video and src/game/camera.c.
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { assetUrl, drawFtx, loadFtx, type FtxFont } from './assets.ts';
import { DIRS_X, DIRS_Y, SPEED_GONE, type GltronGame, type PlayerData } from './sim.ts';

const PLAYER_DIFFUSE = [
  [1.0, 0.55, 0.14], [0.75, 0.02, 0.02], [0.12, 0.52, 0.60], [0.80, 0.80, 0.80],
];
const PLAYER_SPECULAR = [
  [0.5, 0.5, 0.0], [0.75, 0.02, 0.02], [0.12, 0.52, 0.6], [1, 1, 1],
];
const PLAYER_TRAIL = [
  [1.0, 0.85, 0.14, 0.6], [0.75, 0.02, 0.02, 0.6], [0.12, 0.52, 0.6, 0.6], [0.7, 0.7, 0.7, 0.6],
];
const DIR_ANGLES = [0, -90, -180, 90, 180, -270];
// camera.c camAngles[], radians (the model's degrees are DIR_ANGLES)
const CAM_ANGLES = [Math.PI / 2, 0, (3 * Math.PI) / 2, Math.PI, 2 * Math.PI];

interface View { player: number; x: number; y: number; w: number; h: number }

export interface MenuLine {
  text: string;
  value?: string;
  active?: boolean;
  heading?: boolean;
}

export class Renderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly overlay: HTMLCanvasElement;
  private readonly g: CanvasRenderingContext2D;
  private readonly host: HTMLElement;
  private readonly scene = new THREE.Scene();
  private readonly arena = new THREE.Group();
  private readonly cameras: THREE.PerspectiveCamera[] = [];
  private readonly cycleModels: THREE.Object3D[] = [];
  private readonly trailMeshes: THREE.Mesh[] = [];
  private readonly trailLines: THREE.LineSegments[] = [];
  private readonly shadows: THREE.Mesh[] = [];
  private readonly trailKeys: string[] = [];
  private readonly camState = Array.from({ length: 4 }, () => ({ r: 17, chi: Math.PI / 3, phi: 0, type: 1 }));
  private floorTex!: THREE.Texture;
  private wallTex: THREE.Texture[] = [];
  private trailTex!: THREE.Texture;
  private font!: FtxFont;
  private menuFont!: FtxFont;
  private logo!: HTMLImageElement;
  private cycleTemplate!: THREE.Object3D;
  private recognizer!: THREE.Object3D;
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
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
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
    const loadObj = async (path: string): Promise<THREE.Object3D> =>
      loader.parse(await (await fetch(assetUrl(path))).text());
    this.cycleTemplate = await loadObj('data/lightcycle-high.obj');
    this.recognizer = await loadObj('data/recognizer.obj');
    const tex = (path: string, srgb = true) => {
      const t = new THREE.TextureLoader().load(assetUrl(path));
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    };
    this.floorTex = tex('art/gltron_floor.png');
    this.wallTex = [1, 2, 3, 4].map((n) => tex(`art/gltron_wall_${n}.png`));
    this.trailTex = tex('art/gltron_traildecal.png');
    this.font = await loadFtx('data/xenotron.ftx');
    this.menuFont = await loadFtx('data/babbage.ftx');
    this.logo = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = assetUrl('art/gltron_logo.png');
    });
    this.buildScene();
    for (let i = 0; i < 4; i++) {
      const cam = new THREE.PerspectiveCamera(105, 1, 0.5, 6000);
      cam.up.set(0, 0, 1);
      this.cameras.push(cam);
      const model = this.cycleTemplate.clone(true);
      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        m.material = mats.map((source) => {
          const mat = (source as THREE.MeshPhongMaterial).clone();
          const name = mat.name;
          mat.color = new THREE.Color(...(PLAYER_DIFFUSE[i] as [number, number, number]));
          if (name === 'Window' || name === 'Spoke' || name === 'Rim') mat.color.setRGB(0, 0, 0);
          if (name === 'Chassis') mat.color.setRGB(0.3, 0.3, 0.3);
          mat.specular = new THREE.Color(...(PLAYER_SPECULAR[i] as [number, number, number]));
          mat.shininess = 30;
          return mat;
        });
      });
      model.visible = false;
      this.arena.add(model);
      this.cycleModels.push(model);
      const trail = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({
        map: this.trailTex, transparent: true, opacity: PLAYER_TRAIL[i][3], side: THREE.DoubleSide,
        color: new THREE.Color(PLAYER_TRAIL[i][0], PLAYER_TRAIL[i][1], PLAYER_TRAIL[i][2]),
      }));
      this.arena.add(trail);
      this.trailMeshes.push(trail);
      this.trailKeys.push('');
      const line = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.9,
      }));
      this.arena.add(line);
      this.trailLines.push(line);
      const shadow = new THREE.Mesh(new THREE.CircleGeometry(3, 16), new THREE.MeshBasicMaterial({
        color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false,
      }));
      shadow.position.z = 0.05;
      this.arena.add(shadow);
      this.shadows.push(shadow);
    }
  }

  private buildScene(): void {
    this.scene.add(this.arena);
    const grid = 720;
    const floorGeo = new THREE.PlaneGeometry(grid, grid);
    this.floorTex.repeat.set(48, 48);
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshBasicMaterial({ map: this.floorTex }));
    floor.position.set(grid / 2, grid / 2, 0);
    this.arena.add(floor);

    const h = (grid / 240) * 48;
    const walls: [number, number, number, number, number][] = [
      [grid / 2, 0, 0, grid, 1], [grid, grid / 2, 1, grid, 2],
      [grid / 2, grid, 2, grid, 3], [0, grid / 2, 3, grid, 4],
    ];
    for (const [x, y, plane, len, n] of walls) {
      const tex = this.wallTex[n - 1].clone();
      tex.needsUpdate = true;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 1);
      const geo = new THREE.PlaneGeometry(len, h);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      mesh.position.set(x, y, h / 2);
      if (plane === 0) mesh.rotation.set(0, 0, 0);
      if (plane === 1) mesh.rotation.set(0, Math.PI / 2, 0);
      if (plane === 2) mesh.rotation.set(0, Math.PI, 0);
      if (plane === 3) mesh.rotation.set(0, -Math.PI / 2, 0);
      this.arena.add(mesh);
    }

    const sky = new THREE.BoxGeometry(grid * 6, grid * 6, grid * 6);
    const skyMats: THREE.MeshBasicMaterial[] = [];
    for (let i = 0; i < 6; i++) {
      const t = new THREE.TextureLoader().load(assetUrl(`art/skybox${i}.png`));
      t.colorSpace = THREE.SRGBColorSpace;
      skyMats.push(new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide }));
    }
    const box = new THREE.Mesh(sky, skyMats);
    box.position.set(grid / 2, grid / 2, 0);
    this.arena.add(box);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const light = new THREE.DirectionalLight(0xffffff, 1.1);
    light.position.set(0, 0, 1000);
    this.scene.add(light);
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
    this.renderer.setScissorTest(false);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.clear(true, true, false);
    this.renderer.setScissorTest(true);
    for (const v of views) {
      this.updateCamera(game, v.player, dt, now);
      const cam = this.cameras[v.player];
      cam.aspect = v.w / v.h;
      cam.updateProjectionMatrix();
      this.renderer.setViewport(v.x, v.y, v.w, v.h);
      this.renderer.setScissor(v.x, v.y, v.w, v.h);
      this.renderer.render(this.scene, cam);
    }
    this.renderer.setScissorTest(false);
    this.updateScene(game, now, dt);
    this.drawHud(game, views, now, paused);
  }

  private updateCamera(game: GltronGame, i: number, dt: number, _now: number): void {
    const p = game.players[i];
    const d = p.data;
    const cam = this.cameras[i];
    const c = this.camState[i];
    const type = p.ai.active === 1 ? 0 : this.camType;
    let x = 0, y = 0;
    if (d.speed !== SPEED_GONE) {
      const pos = game.position(i);
      x = pos.x; y = pos.y;
    }
    if (type === 0) { c.phi += 0.000349 * dt; c.chi = Math.PI / 3; c.r = 17; }
    else if (type === 2) { c.chi = Math.PI / 8; c.r = 4; }
    else { c.chi = Math.PI / 4; c.r = 18; }
    let ang = c.phi;
    if (type !== 0) ang = followAngle(game, i, c.phi);
    ang += this.glance[i];
    let destX = x + c.r * Math.cos(ang) * Math.sin(c.chi);
    let destY = y + c.r * Math.sin(ang) * Math.sin(c.chi);
    let destZ = c.r * Math.cos(c.chi);
    let tx = x, ty = y, tz = 0;
    if (type === 2) {
      destX = x + 4 * DIRS_X[d.dir] + 2 * Math.cos(ang);
      destY = y + 4 * DIRS_Y[d.dir] + 2 * Math.sin(ang);
      destZ = 4;
      tx = x + 4 * DIRS_X[d.dir] + 0.1 * Math.cos(ang);
      ty = y + 4 * DIRS_Y[d.dir] + 0.1 * Math.sin(ang);
      tz = 4.1;
    }
    if (d.speed === SPEED_GONE) {
      const r = this.recognizerPos(game);
      destX = r.x; destY = r.y; destZ = 50; tx = r.x + r.vx; ty = r.y + r.vy; tz = 48;
    }
    const ws = game.settings.gridSize / 720;
    cam.position.set(destX * ws, destY * ws, destZ * ws);
    tx *= ws; ty *= ws; tz *= ws;
    cam.up.set(0, 0, 1);
    cam.lookAt(tx, ty, tz);
    cam.fov = 105;
    cam.near = 0.5 * ws;
    cam.far = game.settings.gridSize * 6.5;
  }

  private recognizerPos(game: GltronGame): { x: number; y: number; vx: number; vy: number } {
    const g = game.settings.gridSize;
    const a = this.recognizerAlpha;
    const xv = [0.5, 0.3245, 0.6, 0.5, 0.68, -0.3];
    const yv = [0.8, 1.0, 0.0, 0.2, 0.2, 0.0];
    const x = xv[0] * Math.sin(xv[1] * a + xv[2]) - xv[3] * Math.sin(xv[4] * a + xv[5]);
    const y = yv[0] * Math.cos(yv[1] * a + yv[2]) - yv[3] * Math.sin(yv[4] * a + yv[5]);
    const max = 60 * 0.25;
    const bound = g - max;
    return { x: (max + (x + 1) * bound) / 2, y: (max + (y + 1) * bound) / 2, vx: 0, vy: 0 };
  }

  private updateScene(game: GltronGame, now: number, dt: number): void {
    this.recognizerAlpha += dt / 2000;
    const g = game.settings.gridSize;
    this.arena.scale.set(g / 720, g / 720, 1);
    for (let i = 0; i < 4; i++) {
      const d = game.players[i].data;
      const model = this.cycleModels[i];
      const shadow = this.shadows[i];
      shadow.visible = d.speed > 0;
      if (d.speed > 0) { const p = game.position(i); shadow.position.set(p.x, p.y, 0.05); }
      if (d.speed === SPEED_GONE) { model.visible = false; }
      else {
        model.visible = true;
        const p = game.position(i);
        model.position.set(p.x, p.y, 0);
        model.rotation.z = turnAngle(game, i);
        const scale = d.speed === -1 ? 1 + d.expRadius / 12 : 1;
        model.scale.setScalar(scale);
      }
      const key = `${d.trailOffset}:${d.trails[d.trailOffset].dx}:${d.trails[d.trailOffset].dy}:${d.trailHeight}`;
      if (key !== this.trailKeys[i]) {
        this.trailKeys[i] = key;
        this.buildTrail(i, d);
      }
    }
    if (this.recognizer) {
      this.recognizer.visible = this.showRecognizer;
      const p = this.recognizerPos(game);
      this.recognizer.position.set(p.x, p.y, 50);
      this.recognizer.scale.setScalar(0.25);
      this.recognizer.rotation.z = this.recognizerAlpha;
      this.arena.add(this.recognizer);
    }
    void now;
  }

  private buildTrail(i: number, d: PlayerData): void {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    let v = 0, u = 0;
    for (let k = 0; k < d.trailOffset + 1; k++) {
      const s = d.trails[k];
      const len = Math.hypot(s.dx, s.dy);
      if (len < 1e-6) continue;
      const h = Math.max(0, d.trailHeight);
      pos.push(s.x, s.y, 0, s.x, s.y, h, s.x + s.dx, s.y + s.dy, h, s.x + s.dx, s.y + s.dy, 0);
      uv.push(u / 20, 0, u / 20, 1, (u + len) / 20, 1, (u + len) / 20, 0);
      idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
      v += 4; u += len;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mesh = this.trailMeshes[i];
    (mesh.material as THREE.MeshBasicMaterial).opacity = this.trailAlpha;
    mesh.geometry = geo;
    mesh.visible = pos.length > 0;
  }

  private drawHud(game: GltronGame, views: View[], now: number, paused: boolean): void {
    const g = this.g;
    g.clearRect(0, 0, this.width, this.height);
    for (const v of views) {
      const top = this.height - (v.y + v.h);
      const d = game.players[v.player].data;
      if (this.showScores) drawFtx(g, this.font, String(d.score), v.x + 5, top + 5, 32, '#ffff33');
      if (this.showAi && game.players[v.player].ai.active === 1) {
        drawFtx(g, this.font, 'computer player', v.x + v.w / 4, top + 10, 12, '#ffffff');
      }
      if (this.mapRatio > 0 && v.w > 80) this.drawMap(game, v, top);
      if (paused) {
        const msg = game.finished
          ? game.winner >= 0 ? `Player ${game.winner + 1} wins!` : 'No one wins!'
          : 'Game is paused';
        const size = Math.max(16, Math.min(42, v.w / 18));
        drawFtx(g, this.font, msg, v.x + v.w / 2 - (msg.length * size) / 2, top + v.h / 2, size, '#ffdd55');
      }
    }
    void now;
  }

  private drawMap(game: GltronGame, v: View, top: number): void {
    const g = this.g;
    const mw = v.w * this.mapRatio, mh = v.h * this.mapRatio;
    const x = v.x + 20, y = top + v.h - 20 - mh;
    g.fillStyle = 'rgba(180,180,180,0.3)';
    g.fillRect(x, y, mw, mh);
    g.strokeStyle = '#ffffff';
    g.lineWidth = 1;
    g.strokeRect(x, y, mw, mh);
    const s = mw / game.settings.gridSize;
    for (let i = 0; i < 4; i++) {
      const d = game.players[i].data;
      if (d.trailHeight <= 0) continue;
      g.strokeStyle = `rgba(${PLAYER_TRAIL[i].slice(0, 3).map((c) => Math.round(c * 255)).join(',')},0.9)`;
      g.beginPath();
      for (let k = 0; k < d.trailOffset + 1; k++) {
        const t = d.trails[k];
        g.moveTo(x + t.x * s, y + mh - t.y * s);
        g.lineTo(x + (t.x + t.dx) * s, y + mh - (t.y + t.dy) * s);
      }
      g.stroke();
      if (d.speed > 0) {
        const p = game.position(i);
        g.fillStyle = '#fff';
        g.fillRect(x + p.x * s - 1, y + mh - p.y * s - 1, 2, 2);
      }
    }
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
    this.renderer.dispose();
    this.overlay.remove();
    this.renderer.domElement.remove();
    for (const m of this.trailMeshes) m.geometry.dispose();
    for (const l of this.trailLines) l.geometry.dispose();
  }
}

function followAngle(game: GltronGame, i: number, base: number): number {
  const d = game.players[i].data;
  const time = game.time - d.turnTime;
  let angle: number;
  if (time < 200) {
    let last = d.lastDir;
    if (d.dir === 3 && last === 2) last = 4;
    if (d.dir === 2 && last === 3) last = 5;
    angle = ((200 - time) * CAM_ANGLES[last] + time * CAM_ANGLES[d.dir]) / 200;
  } else angle = CAM_ANGLES[d.dir];
  return base + angle;
}

function turnAngle(game: GltronGame, i: number): number {
  const d = game.players[i].data;
  const time = game.time - d.turnTime;
  let last = d.lastDir;
  if (d.dir === 3 && last === 2) last = 4;
  if (d.dir === 2 && last === 3) last = 5;
  if (time < 200) {
    return (((200 - time) * DIR_ANGLES[last] + time * DIR_ANGLES[d.dir]) / 200) * Math.PI / 180;
  }
  return (DIR_ANGLES[d.dir] * Math.PI) / 180;
}
