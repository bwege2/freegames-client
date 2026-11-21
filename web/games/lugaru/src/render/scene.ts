// The three.js scene: terrain, the map's objects, the characters, the skybox and the camera.
import * as THREE from 'three';
import { assetUrl } from '../assets.ts';
import { loadTexture } from '../load.ts';
import type { World } from '../sim/world.ts';
import { CharacterView } from './characters.ts';
import { createObjectView, loadEnvironmentTextures } from './objects.ts';
import { TerrainView } from './terrain.ts';

// CubeTexture order is +X, -X, +Y, -Y, +Z, -Z; the original names them Right, Left, Up,
// Down, Back, Front.
const SKYBOX = ['Right.jpg', 'Left.jpg', 'Up.jpg', 'Down.jpg', 'Back.jpg', 'Front.jpg'];

function skyboxFolder(environment: number): string {
  return environment === 0 ? 'Skybox(snow)' : environment === 2 ? 'Skybox(sand)' : 'Skybox(grass)';
}

function terrainPaths(environment: number): [string, string] {
  if (environment === 0) return ['Textures/Snow.jpg', 'Textures/Rock.jpg'];
  if (environment === 2) return ['Textures/Sand.jpg', 'Textures/SandSlope.jpg'];
  return ['Textures/GrassDirt.jpg', 'Textures/MossRock.jpg'];
}


export class SceneView {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  private readonly world: World;
  private readonly characters: CharacterView[] = [];
  private readonly objectMeshes: THREE.Mesh[] = [];
  private readonly terrain: TerrainView;
  private readonly blood: THREE.Points;
  private readonly bloodPositions: Float32Array;
  private readonly host: HTMLElement;
  private readonly resizeObserver: ResizeObserver;

  private constructor(host: HTMLElement, world: World, terrain: TerrainView, characters: CharacterView[], blood: THREE.Points, bloodPositions: Float32Array) {
    this.host = host;
    this.world = world;
    this.terrain = terrain;
    this.characters = characters;
    this.blood = blood;
    this.bloodPositions = bloodPositions;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setSize(host.clientWidth || 800, host.clientHeight || 600);
    this.renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    host.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(62, (host.clientWidth || 800) / (host.clientHeight || 600), 0.1, 2000);
    this.scene.add(this.terrain.mesh);
    this.scene.add(this.blood);
    for (const c of this.characters) c.addTo(this.scene);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
  }

  static async create(host: HTMLElement, world: World): Promise<SceneView> {
    const env = world.map.map.environment;
    const [tex1, tex2] = terrainPaths(env);
    const [t1, t2, objTex] = await Promise.all([
      loadTexture(tex1, { repeat: true }),
      loadTexture(tex2, { repeat: true }),
      loadEnvironmentTextures(env),
    ]);
    t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
    t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
    const light = new THREE.Vector3(0.4, 1, 0.25).normalize();
    const fogColor = new THREE.Color(env === 0 ? 0xaab0c0 : env === 2 ? 0xd8c090 : 0x8a9a80);
    const terrain = new TerrainView(world.heightmap, t1, t2, env, light, fogColor, 35, 110);

    // objects: 140 per level, each a small mesh; the model parse is cached by file
    const objects = await Promise.all(world.objects.map((o) => createObjectView(o, objTex)));

    const characters: CharacterView[] = [];
    for (const p of world.persons) characters.push(await CharacterView.create(p));

    const bloodPositions = new Float32Array(240 * 3);
    const bloodGeo = new THREE.BufferGeometry();
    bloodGeo.setAttribute('position', new THREE.BufferAttribute(bloodPositions, 3));
    const blood = new THREE.Points(bloodGeo, new THREE.PointsMaterial({ color: 0x8a0000, size: 0.09, sizeAttenuation: true }));
    blood.frustumCulled = false;

    const view = new SceneView(host, world, terrain, characters, blood, bloodPositions);
    // The constructor adds the terrain and characters; add the object meshes now.
    for (const o of objects) if (o) { view.scene.add(o); view.objectMeshes.push(o); }

    const sky = new THREE.CubeTextureLoader().load(
      SKYBOX.map((f) => assetUrl(`Textures/${skyboxFolder(env)}/${f}`)),
    );
    sky.colorSpace = THREE.SRGBColorSpace;
    view.scene.background = sky;
    view.scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    view.scene.add(new THREE.HemisphereLight(0xbcd0e8, 0x4a4a30, 1.2));
    const sun = new THREE.DirectionalLight(0xfff2dd, 2.4);
    sun.position.set(120, 240, 80);
    view.scene.add(sun);
    // The original's terrain shader has its own shading; keep the background/fog in the same
    // family so the horizon does not pop.
    view.scene.fog = new THREE.Fog(fogColor, 35, 110);
    return view;
  }

  resize(): void {
    const w = this.host.clientWidth || 800;
    const h = this.host.clientHeight || 600;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  update(): void {
    const w = this.world;
    for (const c of this.characters) c.update();
    const cam = w.cameraPosition();
    const target = w.cameraTarget();
    this.camera.position.set(cam.x, cam.y, cam.z);
    this.camera.lookAt(target.x, target.y, target.z);

    // blood particles: the last 80 events, fading by age
    const pos = this.bloodPositions;
    let n = 0;
    for (let i = Math.max(0, w.bloodEvents.length - 80); i < w.bloodEvents.length; i++) {
      const b = w.bloodEvents[i];
      const age = w.time - b.time;
      if (age > 2.5) continue;
      pos[n * 3] = b.position.x + Math.sin(i * 7.3) * 0.15;
      pos[n * 3 + 1] = b.position.y + 0.6 + age * 0.2;
      pos[n * 3 + 2] = b.position.z + Math.cos(i * 5.1) * 0.15;
      n++;
    }
    for (let i = n; i < 240; i++) {
      pos[i * 3] = 0; pos[i * 3 + 1] = -1000; pos[i * 3 + 2] = 0;
    }
    (this.blood.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.resizeObserver.disconnect();
    for (const c of this.characters) c.removeFrom(this.scene);
    for (const o of this.objectMeshes) {
      this.scene.remove(o);
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
    this.blood.geometry.dispose();
    (this.blood.material as THREE.Material).dispose();
    this.terrain.mesh.geometry.dispose();
    this.terrain.material.dispose();
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
