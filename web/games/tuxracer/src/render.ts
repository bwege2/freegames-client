// The 3D scene: the course (terrain with the original ice/rock/snow textures, trees and objects),
// the sky, the light and fog of the race condition, Tux and the original camera. Rendering is
// three.js; the geometry, textures, positions and colours come from the original's data and its
// course_render.c/tux.c numbers.
import * as THREE from 'three';
import { COURSES, CONDITIONS, assetUrl, skyFile, type ConditionInfo } from './assets.ts';
import { TREE_TYPES, ITEM_TYPES, type Course, type Item } from './course.ts';
import type { Physics } from './physics.ts';
import { rotateVector, rotationQuaternion, vec } from './math3.ts';
import { TuxView } from './tuxmodel.ts';

const DEG = Math.PI / 180;

export interface DrawOptions {
  /** the intro keyframe animation is still running */
  introTime?: number;
  introActive?: boolean;
  viewMode?: 0 | 1 | 2;
}

const crossGeometry = (() => {
  const g = new THREE.BufferGeometry();
  const p = [
    -1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0,
    0, 0, -1, 0, 0, 1, 0, 1, 1, 0, 1, -1,
  ];
  const uv = [0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1];
  const idx = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7];
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
})();

export class GameRenderer {
  readonly canvas: HTMLCanvasElement;
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly tux = new TuxView();
  private readonly host: HTMLElement;
  private readonly physics: Physics;
  private readonly course: Course;
  private readonly condition: ConditionInfo;
  private readonly items: { item: Item; sprite: THREE.Sprite }[] = [];
  private readonly resizeObserver: ResizeObserver;
  private disposed = false;
  private readonly sunDir = new THREE.Vector3();
  private readonly terrainMaterial: THREE.ShaderMaterial;
  private sky!: THREE.Mesh;

  private constructor(host: HTMLElement, physics: Physics, condition: ConditionInfo) {
    this.host = host;
    this.physics = physics;
    this.course = physics.course;
    this.condition = condition;
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'display:block;width:100%;height:100%';
    host.append(this.canvas);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(host.clientWidth, host.clientHeight, false);
    this.camera = new THREE.PerspectiveCamera(60, host.clientWidth / Math.max(1, host.clientHeight), 0.25, 250);
    this.camera.up.set(0, 1, 0);

    const sun = condition.lights[0];
    const [sx, sy, sz] = sun?.position ?? [1, 1, 0, 0];
    this.sunDir.set(sx, sy, sz).normalize();
    const amb = sun?.ambient ?? [0.45, 0.53, 0.75, 1];
    const dif = sun?.diffuse ?? [1, 0.9, 1, 1];
    this.scene.add(new THREE.AmbientLight(new THREE.Color(amb[0], amb[1], amb[2]), 1));
    const dir = new THREE.DirectionalLight(new THREE.Color(dif[0], dif[1], dif[2]), 1);
    dir.position.set(sx, sy, sz);
    this.scene.add(dir);
    const f = condition.fog;
    this.scene.fog = new THREE.Fog(new THREE.Color(f.colour[0], f.colour[1], f.colour[2]), f.start, f.end);

    this.terrainMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ice: { value: null }, rock: { value: null }, snow: { value: null },
        sunDir: { value: this.sunDir },
        ambient: { value: new THREE.Vector3(amb[0], amb[1], amb[2]) },
        diffuse: { value: new THREE.Vector3(dif[0], dif[1], dif[2]) },
        fogColor: { value: new THREE.Color(f.colour[0], f.colour[1], f.colour[2]) },
        fogNear: { value: f.start }, fogFar: { value: f.end },
      },
      vertexShader: `
        attribute vec3 weights;
        varying vec3 vWeights;
        varying vec3 vWorld;
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          vWeights = weights;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          vNormal = normalize(mat3(modelMatrix) * normal);
          vUv = vec2(wp.x, wp.z) / 6.0;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        uniform sampler2D ice, rock, snow;
        uniform vec3 sunDir, ambient, diffuse, fogColor;
        uniform float fogNear, fogFar;
        varying vec3 vWeights;
        varying vec3 vWorld;
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          vec3 base = texture2D(ice, vUv).rgb * vWeights.x +
                      texture2D(rock, vUv).rgb * vWeights.y +
                      texture2D(snow, vUv).rgb * vWeights.z;
          float light = max(dot(normalize(vNormal), normalize(sunDir)), 0.0);
          vec3 col = base * clamp(ambient + diffuse * light, 0.0, 1.0);
          float d = length(cameraPosition - vWorld);
          float fog = smoothstep(fogNear, fogFar, d);
          gl_FragColor = vec4(mix(col, fogColor, fog), 1.0);
        }`,
    });
    this.scene.add(this.tux.root);
    this.loadCourse();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
  }

  static async create(host: HTMLElement, physics: Physics, conditionName: string, signal: AbortSignal): Promise<GameRenderer> {
    const condition = CONDITIONS[conditionName] ?? CONDITIONS.sunny;
    const r = new GameRenderer(host, physics, condition);
    await r.loadTextures(signal);
    return r;
  }

  private async loadTextures(signal: AbortSignal): Promise<void> {
    const loader = new THREE.TextureLoader();
    const load = async (path: string): Promise<THREE.Texture> => {
      const tex = await loader.loadAsync(assetUrl(path), undefined);
      void signal;
      return tex;
    };
    const [ice, rock, snow] = await Promise.all([
      load('common/ice.png'), load('common/rock.png'), load('common/snow.png'),
    ]);
    for (const t of [ice, rock, snow]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    }
    this.terrainMaterial.uniforms.ice.value = ice;
    this.terrainMaterial.uniforms.rock.value = rock;
    this.terrainMaterial.uniforms.snow.value = snow;

    // trees: the original's two crossed, alpha-tested quads per tree
    const treeTextures = await Promise.all(TREE_TYPES.map((t) => load(`common/${t.texture}.png`)));
    treeTextures.forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; });
    TREE_TYPES.forEach((_type, i) => {
      const list = this.course.trees.filter((t) => t.type === i);
      if (!list.length) return;
      const material = new THREE.MeshBasicMaterial({ map: treeTextures[i], alphaTest: 0.5, side: THREE.DoubleSide, fog: true });
      const mesh = new THREE.InstancedMesh(crossGeometry, material, list.length);
      const m = new THREE.Matrix4();
      list.forEach((tree, k) => {
        m.makeScale(tree.diam / 2, tree.height, tree.diam / 2);
        m.setPosition(tree.x, tree.y, tree.z);
        mesh.setMatrixAt(k, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
      this.scene.add(mesh);
    });

    // objects (herring, flags, start and finish): billboards with the original's textures
    const itemTextures = await Promise.all(ITEM_TYPES.map((t) => t.drawable ? load(`common/${t.texture}.png`) : Promise.resolve(null)));
    itemTextures.forEach((t) => { if (t) t.colorSpace = THREE.SRGBColorSpace; });
    for (const item of this.course.items) {
      if (!item.drawable) continue;
      const tex = itemTextures[item.type];
      if (!tex) continue;
      const material = new THREE.SpriteMaterial({ map: tex, alphaTest: 0.5, fog: true });
      const sprite = new THREE.Sprite(material);
      sprite.position.set(item.x, item.y + item.height / 2, item.z);
      sprite.scale.set(item.diam, item.height, 1);
      this.scene.add(sprite);
      this.items.push({ item, sprite });
    }

    // sky box, six faces: +x right, -x left, +y top, -y bottom, +z back, -z front
    const sky = this.condition.sky;
    const faces = ['sky_right', 'sky_left', 'sky_top', 'sky_bottom', 'sky_back', 'sky_front'];
    const skyTextures = await Promise.all(faces.map((k) => load(skyFile(sky[k]))));
    skyTextures.forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; });
    const skyMaterials = skyTextures.map((t) => new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, depthWrite: false, fog: false }));
    this.sky = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), skyMaterials);
    this.sky.scale.setScalar(150);
    this.sky.renderOrder = -1;
    this.scene.add(this.sky);
    (window as any).__tuxDebug = { scene: this.scene, renderer: this.renderer, tux: this.tux, physics: this.physics };
  }

  private loadCourse(): void {
    const c = this.course;
    const n = c.nx * c.ny;
    const positions = new Float32Array(n * 3);
    const normals = new Float32Array(n * 3);
    const weights = new Float32Array(n * 3);
    for (let y = 0; y < c.ny; y++) {
      for (let x = 0; x < c.nx; x++) {
        const i = x + c.nx * y;
        positions[i * 3] = (x / (c.nx - 1)) * c.cfg.width;
        positions[i * 3 + 1] = c.elevationAt(x, y);
        positions[i * 3 + 2] = -(y / (c.ny - 1)) * c.cfg.length;
        const nml = c.normals[i];
        normals[i * 3] = nml.x; normals[i * 3 + 1] = nml.y; normals[i * 3 + 2] = nml.z;
        const t = c.terrain[i];
        weights[i * 3 + t] = 1;
      }
    }
    const indices: number[] = [];
    for (let y = 0; y < c.ny - 1; y++) {
      for (let x = 0; x < c.nx - 1; x++) {
        const i00 = x + c.nx * y, i10 = (x + 1) + c.nx * y;
        const i01 = x + c.nx * (y + 1), i11 = (x + 1) + c.nx * (y + 1);
        if ((x + y) % 2 === 0) {
          indices.push(i00, i10, i11, i00, i11, i01);
        } else {
          indices.push(i00, i10, i01, i11, i01, i10);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    g.setAttribute('weights', new THREE.BufferAttribute(weights, 3));
    g.setIndex(indices);
    g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, this.terrainMaterial);
    this.scene.add(mesh);
  }

  /** Called for every rendered frame. */
  draw(dt: number, opts: DrawOptions = {}): void {
    if (this.disposed) return;
    const p = this.physics.player;
    // Tux: position and orientation (the original's set_tux_pos and adjust_orientation)
    this.tux.root.position.set(p.pos.x, p.pos.y + 0.33, p.pos.z);
    if (opts.introActive) {
      this.tux.resetJoints();
      this.tux.setKeyFrame(opts.introTime ?? 0, (x, z) => this.course.findY(x, z), this.course.cfg.startX, -this.course.cfg.startY);
    } else {
      const q = new THREE.Quaternion(p.orientation.x, p.orientation.y, p.orientation.z, p.orientation.w);
      const roll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.control.barrelRollFactor * Math.PI * 2);
      const flip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), p.control.flipFactor * Math.PI * 2);
      q.multiply(roll).multiply(flip);
      this.tux.root.quaternion.copy(q);
      const local = rotateVector({ x: -p.orientation.x, y: -p.orientation.y, z: -p.orientation.z, w: p.orientation.w }, p.netForce);
      const paddlingFactor = p.control.isPaddling
        ? Math.min(1, (this.physics.time - p.control.paddleTime) / 0.4) : 0;
      this.tux.resetJoints();
      this.tux.applyJoints({
        turnFact: p.control.turnFact, braking: p.control.isBraking,
        paddlingFactor, speed: this.physics.speed, localForceZ: local.z,
        flapFactor: p.control.jumping ? Math.min(1, (this.physics.time - p.control.jumpStartTime) / 0.2) : 0,
      });
    }
    for (const { item, sprite } of this.items) sprite.visible = item.drawable && !item.collected;

    this.updateCamera(opts.viewMode ?? 1);
    if (this.sky) this.sky.position.copy(this.camera.position);
    this.renderer.render(this.scene, this.camera);
    void dt;
  }

  private updateCamera(mode: 0 | 1 | 2): void {
    const p = this.physics.player;
    const angle = this.course.cfg.angle;
    const horiz = vec(p.vel.x, 0, p.vel.z);
    const len = Math.hypot(horiz.x, horiz.z);
    const dir = len > 0.001 ? vec(horiz.x / len, 0, horiz.z / len) : vec(0, 0, -1);
    const rot = rotationQuaternion(vec(0, 0, -1), dir);
    let elevation: number;
    if (mode === 2) elevation = 60;
    else if (mode === 0) elevation = angle - 10 + 20;
    else elevation = angle - 10 + 20;
    let off = rotateVector(rot, vec(0, Math.sin(elevation * DEG), Math.cos(elevation * DEG)));
    if (mode === 2) off = rotateVector(rot, vec(0, Math.sin(70 * DEG), Math.cos(70 * DEG)));
    const dist = 4;
    const pos = {
      x: p.pos.x + off.x * dist,
      y: p.pos.y + off.y * dist,
      z: p.pos.z + off.z * dist,
    };
    const ground = this.course.findY(pos.x, pos.z) + 0.3;
    if (pos.y < ground) pos.y = ground;
    this.camera.position.set(pos.x, pos.y, pos.z);
    this.camera.lookAt(p.pos.x, p.pos.y + 0.5, p.pos.z);
  }

  resize(): void {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    this.disposed = true;
    this.resizeObserver.disconnect();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.renderer.dispose();
    this.canvas.remove();
  }

  /** The course's parameters, for the HUD. */
  get config() { return COURSES[this.course.cfg.id] ?? this.course.cfg; }
}
