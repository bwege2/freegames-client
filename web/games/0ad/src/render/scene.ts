// The renderer's glue: scene, light, terrain, the original sky, the map's entity views, the camera and
// picking. Every frame reads the simulation's Entity/World state; there is no second visual-only game state.
import * as THREE from 'three';
import type { World } from '../sim/world.ts';
import type { Entity } from '../sim/types.ts';
import type { Scenario } from '../data/map.ts';
import { RtsCamera } from './camera.ts';
import type { LightUniforms } from './materials.ts';
import { applySky, type SkyData } from './sky.ts';
import { createTerrainView, type TerrainView } from './terrain.ts';
import { ActorBank, ProjectileLayer, ResourceLayer, StaticView, UnitView } from './views.ts';
import { fetchJson } from '../assets.ts';

export class SceneView {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: RtsCamera;
  readonly terrain: TerrainView;
  readonly bank: ActorBank;
  readonly world: World;
  readonly host: HTMLElement;
  /** the player this view belongs to: its fog, and the units a box selects */
  readonly viewer: number;
  readonly light: LightUniforms;
  private readonly resources: ResourceLayer;
  private readonly resourceGroup = new THREE.Group();
  private readonly statics = new Map<number, StaticView>();
  private readonly units = new Map<number, UnitView>();
  private readonly projectiles: ProjectileLayer;
  private readonly selectionGroup = new THREE.Group();
  private readonly selection = new Set<number>();
  private readonly resizeObserver: ResizeObserver;
  private readonly raycaster = new THREE.Raycaster();
  private readonly ghost: THREE.Mesh;
  private disposed = false;
  private readonly pendingUnits = new Set<number>();
  private readonly pendingStatics = new Set<number>();

  private constructor(host: HTMLElement, world: World, bank: ActorBank, light: LightUniforms, terrain: TerrainView, resources: ResourceLayer, viewer: number) {
    this.host = host;
    this.world = world;
    this.viewer = viewer;
    this.bank = bank;
    this.light = light;
    this.terrain = terrain;
    this.resources = resources;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setSize(host.clientWidth || 800, host.clientHeight || 600, false);
    this.renderer.domElement.className = 'ad-canvas';
    this.renderer.domElement.tabIndex = 0;
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    host.prepend(this.renderer.domElement);
    this.scene.add(terrain.mesh);
    this.resourceGroup.add(...resources.groups.map((g) => g.mesh));
    this.scene.add(this.resourceGroup);
    this.scene.add(this.selectionGroup);
    this.projectiles = new ProjectileLayer();
    this.scene.add(this.projectiles.group);
    this.camera = new RtsCamera(world.terrain, (host.clientWidth || 800) / (host.clientHeight || 600));
    const cc = world.entitiesOf(viewer).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'));
    if (cc) this.camera.focus(cc.x + 6, cc.z + 10);
    this.ghost = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 0.2, 20),
      new THREE.MeshBasicMaterial({ color: 0x70ff90, transparent: true, opacity: 0.45, depthWrite: false }),
    );
    this.ghost.visible = false;
    this.scene.add(this.ghost);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
  }

  /** Build the scene from the world and the original actor bank. */
  static async create(host: HTMLElement, world: World, bank: ActorBank, scenario: Scenario, light: LightUniforms, viewer = 1): Promise<SceneView> {
    const env = scenario.environment;
    light.sunDir.value.set(
      Math.sin(env.sunRotation) * Math.cos(env.sunElevation),
      -Math.sin(env.sunElevation),
      Math.cos(env.sunRotation) * Math.cos(env.sunElevation),
    ).normalize();
    light.sunColor.value.setRGB(...env.sunColor).multiplyScalar(0.9);
    light.ambient.value.setRGB(...env.ambientColor).multiplyScalar(0.55);
    light.fogColor.value.setRGB(...env.fog.color);
    light.fogNear.value = Math.max(80, 220 - env.fog.factor * 10000);
    light.fogFar.value = 1100;
    const water = env.water ? { height: env.water.height, color: env.water.color } : null;
    const terrain = await createTerrainView(world.terrain, light, water);
    const resources = await ResourceLayer.create(world, bank, light, viewer);
    const scene = new SceneView(host, world, bank, light, terrain, resources, viewer);
    scene.scene.fog = new THREE.Fog(light.fogColor.value.clone(), light.fogNear.value, light.fogFar.value);
    try {
      applySky(scene.scene, await fetchJson<SkyData>('sky/sky.json'));
    } catch {
      scene.scene.background = new THREE.Color(0x8ea8c4);
    }
    for (const e of world.aliveEntities()) {
      if (e.kind === 'building') {
        const view = await StaticView.create(world, e, bank, light);
        if (view) { view.group.userData.entityId = e.id; scene.statics.set(e.id, view); scene.scene.add(view.group); }
      } else if (e.kind === 'unit') {
        const view = await UnitView.create(world, e, bank, light);
        if (view) { view.group.userData.entityId = e.id; scene.units.set(e.id, view); scene.scene.add(view.group); }
      }
    }
    return scene;
  }

  updateVisibility(): void {
    this.terrain.updateVisibility(this.world.explored[this.viewer], this.world.visible[this.viewer], this.world.fogSize, 4);
  }

  /** Update the scene; the game drives the camera's keyboard state. */
  sync(dt: number, keys: Record<string, boolean> = {}): void {
    if (this.disposed) return;
    this.camera.pan(dt, keys);
    this.resources.update(this.world, this.viewer);
    for (const e of this.world.aliveEntities()) {
      if (e.kind === 'building' && !this.statics.has(e.id)) { void this.addStatic(e); }
      else if (e.kind === 'unit' && !this.units.has(e.id)) { void this.addUnit(e); }
    }
    for (const [id, view] of this.statics) {
      const e = this.world.entity(id);
      if (!e || !e.alive) { this.scene.remove(view.group); view.dispose(); this.statics.delete(id); continue; }
      view.update(this.world, this.viewer);
    }
    for (const [id, view] of this.units) {
      const e = this.world.entity(id);
      if (!e) { this.scene.remove(view.group); view.dispose(); this.units.delete(id); continue; }
      if (!e.alive) { view.updateDeath(dt); continue; }
      view.update(this.world, dt, this.viewer);
    }
    this.projectiles.update(this.world);
    this.updateVisibility();
    this.updateSelection();
    this.renderer.render(this.scene, this.camera.camera);
  }

  private async addStatic(e: Entity): Promise<void> {
    if (this.statics.has(e.id) || this.pendingStatics.has(e.id)) return;
    this.pendingStatics.add(e.id);
    const view = await StaticView.create(this.world, e, this.bank, this.light);
    this.pendingStatics.delete(e.id);
    if (!view || this.disposed || this.statics.has(e.id)) return;
    view.group.userData.entityId = e.id;
    this.statics.set(e.id, view);
    this.scene.add(view.group);
  }

  private async addUnit(e: Entity): Promise<void> {
    if (this.units.has(e.id) || this.pendingUnits.has(e.id)) return;
    this.pendingUnits.add(e.id);
    const view = await UnitView.create(this.world, e, this.bank, this.light);
    this.pendingUnits.delete(e.id);
    if (!view || this.disposed || this.units.has(e.id)) return;
    view.group.userData.entityId = e.id;
    this.units.set(e.id, view);
    this.scene.add(view.group);
  }

  private updateSelection(): void {
    for (const child of this.selectionGroup.children) {
      const mesh = child as THREE.Mesh;
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    this.selectionGroup.clear();
    for (const id of this.selection) {
      const e = this.world.entity(id);
      if (!e || !e.alive) { this.selection.delete(id); continue; }
      const r = Math.max(0.8, e.radius * 1.2);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r, r + 0.28, 24),
        new THREE.MeshBasicMaterial({
          color: e.player === 1 ? 0x6a9cff : e.player === 2 ? 0xff6a5a : 0xf0d47a,
          transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(e.x, this.world.terrain.heightAt(e.x, e.z) + 0.08, e.z);
      ring.renderOrder = 6;
      this.selectionGroup.add(ring);
    }
  }

  setSelection(ids: Iterable<number>): void {
    this.selection.clear();
    for (const id of ids) this.selection.add(id);
    this.updateSelection();
  }

  selected(): number[] { return [...this.selection]; }

  /** Pick an entity under a client point, including instanced resources. */
  pick(clientX: number, clientY: number, _player = 1): Entity | null {
    this.setRay(clientX, clientY);
    const objects: THREE.Object3D[] = [this.resourceGroup];
    for (const v of this.statics.values()) objects.push(v.group);
    for (const v of this.units.values()) objects.push(v.group);
    const hits = this.raycaster.intersectObjects(objects, true);
    for (const hit of hits) {
      if (hit.object instanceof THREE.InstancedMesh) {
        const id = this.resources.entityAt(hit.object, hit.instanceId);
        if (id !== null) return this.world.entity(id) ?? null;
      }
      let o: THREE.Object3D | null = hit.object;
      while (o && o.userData.entityId === undefined) o = o.parent;
      if (o && typeof o.userData.entityId === 'number') return this.world.entity(o.userData.entityId) ?? null;
    }
    return null;
  }

  pickGround(clientX: number, clientY: number): THREE.Vector3 | null {
    this.setRay(clientX, clientY);
    const hit = this.raycaster.intersectObject(this.terrain.mesh, false)[0];
    return hit?.point ?? null;
  }

  private setRay(clientX: number, clientY: number): void {
    const r = this.host.getBoundingClientRect();
    const nx = ((clientX - r.left) / r.width) * 2 - 1;
    const ny = -((clientY - r.top) / r.height) * 2 + 1;
    this.raycaster.setFromCamera(new THREE.Vector2(nx, ny), this.camera.camera);
  }

  unitsInBox(x0: number, y0: number, x1: number, y1: number, player = this.viewer): number[] {
    const rect = this.host.getBoundingClientRect();
    const out: number[] = [];
    const v = new THREE.Vector3();
    for (const e of this.world.entitiesOf(player)) {
      if (e.kind !== 'unit') continue;
      v.set(e.x, this.world.terrain.heightAt(e.x, e.z) + e.height * 0.4, e.z).project(this.camera.camera);
      const x = rect.left + (v.x * 0.5 + 0.5) * rect.width;
      const y = rect.top + (-v.y * 0.5 + 0.5) * rect.height;
      if (v.z < 1 && x >= x0 && x <= x1 && y >= y0 && y <= y1) out.push(e.id);
    }
    return out;
  }

  setGhost(template: string | null, x: number, z: number, valid: boolean): void {
    if (!template) { this.ghost.visible = false; return; }
    const info = this.world.template(template);
    const r = Math.max(info.footprint.radius || 0, Math.max(info.footprint.width, info.footprint.depth) / 2, 1);
    this.ghost.geometry.dispose();
    this.ghost.geometry = new THREE.CylinderGeometry(r, r, 0.2, 20);
    (this.ghost.material as THREE.MeshBasicMaterial).color.setHex(valid ? 0x70ff90 : 0xff6455);
    this.ghost.position.set(x, this.world.terrain.heightAt(x, z) + 0.1, z);
    this.ghost.visible = true;
  }

  focus(x: number, z: number): void { this.camera.focus(x, z); }

  resize(): void {
    const w = this.host.clientWidth || 800, h = this.host.clientHeight || 600;
    this.renderer.setSize(w, h, false);
    this.camera.setAspect(w / Math.max(1, h));
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.resizeObserver.disconnect();
    this.resources.dispose();
    for (const v of this.statics.values()) v.dispose();
    for (const v of this.units.values()) v.dispose();
    this.projectiles.dispose();
    this.terrain.dispose();
    for (const child of this.selectionGroup.children) {
      const mesh = child as THREE.Mesh;
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    this.selectionGroup.clear();
    this.ghost.geometry.dispose();
    (this.ghost.material as THREE.Material).dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.scene.clear();
  }
}
