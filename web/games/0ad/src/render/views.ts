// Entity views: static buildings and props, instanced Gaia scenery/resources, and skinned units
// driven by the original PMD skeleton + PSA clips. Everything is placed on the original terrain
// height and uses the actor's original texture and player colour.
import {
  Color, ConeGeometry, DynamicDrawUsage, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Object3D, Quaternion, Vector3,
  type Material, type ShaderMaterial,
} from 'three';
import type { World } from '../sim/world.ts';
import type { Entity } from '../sim/types.ts';
import { fetchJson } from '../assets.ts';
import type { ActorData, ActorProp, ActorVisual } from './actor.ts';
import { selectVisual } from './actor.ts';
import { loadPmd, buildGeometry, inverseBindMatrices } from './model.ts';
import { loadActorTexture } from './textures.ts';
import { makeModelMaterial, makeSkinnedMaterial, materialFlags, type LightUniforms } from './materials.ts';
import { parsePsa, samplePsa, type PsaAnimation, type PsaKey } from '../data/psa.ts';
import { fetchBuffer } from '../assets.ts';

export class ActorBank {
  private readonly data: Record<string, ActorData>;
  private readonly visualCache = new Map<string, ActorVisual | null>();
  constructor(data: Record<string, ActorData>) { this.data = data; }
  get(template: string, seed = 1): ActorVisual | null {
    const key = `${template}|${seed}`;
    if (this.visualCache.has(key)) return this.visualCache.get(key)!;
    const actor = this.data[template];
    const visual = actor ? selectVisual(actor, seed) : null;
    this.visualCache.set(key, visual);
    return visual;
  }
  raw(template: string): ActorData | undefined { return this.data[template]; }
}

export async function loadActorBank(): Promise<ActorBank> {
  return new ActorBank(await fetchJson<Record<string, ActorData>>('actors.json'));
}

let white: import('three').Texture | null = null;
async function whiteTexture(): Promise<import('three').Texture> {
  if (!white) {
    const { DataTexture, RGBAFormat, UnsignedByteType } = await import('three');
    const t = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, RGBAFormat, UnsignedByteType);
    t.needsUpdate = true;
    white = t;
  }
  return white;
}

function playerColor(world: World, e: Entity): Color {
  const p = world.players[e.player];
  return new Color(p?.color[0] ?? 1, p?.color[1] ?? 1, p?.color[2] ?? 1);
}

async function materialFor(
  world: World, e: Entity, material: string | null, texturePath: string | undefined | null, light: LightUniforms, skinned: boolean,
): Promise<ShaderMaterial> {
  const tex = texturePath ? await loadActorTexture(texturePath) : await whiteTexture();
  const flags = materialFlags(material);
  // 0 A.D.'s player_trans materials use the texture alpha as a team-colour mask on unit cloth
  // and shields. The slice shows the side with the selection ring and HUD colours; tinting the
  // whole texture would turn a building or a body into a flat team colour.
  const options = {
    map: tex,
    playerColor: playerColor(world, e),
    usePlayerColor: flags.player && e.kind === "unit",
    alphaTest: flags.alphaTest,
    doubleSide: flags.doubleSide,
    light,
  };
  return skinned ? makeSkinnedMaterial(options) : makeModelMaterial(options);
}

// ------------------------------------------------------------------------------ static models

export class StaticView {
  readonly group = new Group();
  readonly meshes: Mesh[] = [];
  constructor(private readonly e: Entity) {}

  static async create(world: World, e: Entity, bank: ActorBank, light: LightUniforms): Promise<StaticView | null> {
    const visual = bank.get(e.template, e.seed);
    if (!visual) return null;
    const view = new StaticView(e);
    const model = await loadPmd(visual.mesh);
    const geo = buildGeometry(model, false);
    const mat = await materialFor(world, e, visual.material, visual.texture, light, false);
    const body = new Mesh(geo, mat);
    body.frustumCulled = false;
    view.group.add(body);
    view.meshes.push(body);
    for (const prop of visual.props) {
      if (prop.attachpoint !== 'root') continue;
      const pv = await propMesh(world, e, prop, light);
      if (pv) view.group.add(pv);
    }
    return view;
  }

  update(world: World, viewer = 1): void {
    const e = this.e;
    this.group.visible = e.alive && world.entityVisible(e, viewer);
    this.group.position.set(e.x, world.terrain.heightAt(e.x, e.z), e.z);
    this.group.rotation.y = e.yaw;
    if (e.construction) {
      const p = Math.max(0.05, e.construction.progress);
      this.group.scale.set(1, 0.18 + 0.82 * p, 1);
    } else {
      this.group.scale.set(1, 1, 1);
    }
  }

  dispose(): void {
    for (const m of this.meshes) { m.geometry.dispose(); (m.material as Material).dispose(); }
    this.group.clear();
  }
}

async function propMesh(world: World, e: Entity, prop: ActorProp, light: LightUniforms): Promise<Mesh | null> {
  try {
    const model = await loadPmd(prop.mesh);
    const geo = buildGeometry(model, false);
    const mat = await materialFor(world, e, prop.material, prop.textures[0], light, false);
    const mesh = new Mesh(geo, mat);
    mesh.frustumCulled = false;
    return mesh;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------------------ instanced scenery

export class ResourceLayer {
  readonly groups: { mesh: InstancedMesh; entries: Map<number, number>; ids: number[] }[] = [];
  private readonly all = new Map<number, { group: number; index: number }>();

  static async create(world: World, bank: ActorBank, light: LightUniforms, viewer = 1): Promise<ResourceLayer> {
    const layer = new ResourceLayer();
    const byKey = new Map<string, { visual: ActorVisual; ids: number[] }>();
    for (const e of world.entities.values()) {
      if (!e.alive || (e.kind !== 'resource' && e.kind !== 'scenery')) continue;
      const visual = bank.get(e.template, e.seed);
      if (!visual) continue;
      const key = `${visual.mesh}|${visual.texture}|${visual.material}`;
      let group = byKey.get(key);
      if (!group) { group = { visual, ids: [] }; byKey.set(key, group); }
      group.ids.push(e.id);
    }
    for (const { visual, ids } of byKey.values()) {
      try {
        const model = await loadPmd(visual.mesh);
        const geo = buildGeometry(model, false);
        const e0 = world.entity(ids[0])!;
        const mat = await materialFor(world, e0, visual.material, visual.texture, light, false);
        const mesh = new InstancedMesh(geo, mat, ids.length);
        mesh.instanceMatrix.setUsage(DynamicDrawUsage);
        mesh.frustumCulled = false;
        const entries = new Map<number, number>();
        ids.forEach((id, i) => entries.set(id, i));
        layer.groups.push({ mesh, entries, ids });
        for (const [id, index] of entries) layer.all.set(id, { group: layer.groups.length - 1, index });
      } catch {
        // a missing model leaves its instances out; the simulation still has the resource
      }
    }
    layer.update(world, viewer);
    return layer;
  }

  update(world: World, viewer = 1): void {
    const zero = new Matrix4().makeScale(0, 0, 0);
    const m = new Matrix4();
    const q = new Quaternion();
    const s = new Vector3(1, 1, 1);
    for (const [id, loc] of this.all) {
      const e = world.entity(id);
      const group = this.groups[loc.group];
      if (!e || !e.alive || !world.entityVisible(e, viewer)) {
        group.mesh.setMatrixAt(loc.index, zero);
        continue;
      }
      q.setFromAxisAngle(new Vector3(0, 1, 0), e.yaw);
      m.compose(new Vector3(e.x, world.terrain.heightAt(e.x, e.z), e.z), q, s);
      group.mesh.setMatrixAt(loc.index, m);
    }
    for (const g of this.groups) g.mesh.instanceMatrix.needsUpdate = true;
  }

  entityAt(mesh: Object3D, instanceId: number | undefined): number | null {
    if (instanceId === undefined) return null;
    for (const g of this.groups) if (g.mesh === mesh) return g.ids[instanceId] ?? null;
    return null;
  }

  addTo(parent: Object3D): void { for (const g of this.groups) parent.add(g.mesh); }
  dispose(): void { for (const g of this.groups) { g.mesh.geometry.dispose(); (g.mesh.material as Material).dispose(); } }
}

// ------------------------------------------------------------------------------ skinned units

interface ClipEntry { anim: PsaAnimation; speed: number }
const clipCache = new Map<string, Promise<Map<string, ClipEntry[]>>>();

async function loadClips(visual: ActorVisual): Promise<Map<string, ClipEntry[]>> {
  const key = visual.mesh + '|' + [...visual.clips.keys()].sort().join(',');
  let p = clipCache.get(key);
  if (!p) {
    p = (async () => {
      const out = new Map<string, ClipEntry[]>();
      for (const [name, files] of visual.clips) {
        const entries: ClipEntry[] = [];
        for (const f of files) {
          try {
            const anim = parsePsa(await fetchBuffer(`animations/${f.file}`));
            entries.push({ anim, speed: f.speed / 100 });
          } catch {
            // a missing clip is skipped; the idle fallback remains
          }
        }
        if (entries.length) out.set(name, entries);
      }
      return out;
    })();
    clipCache.set(key, p);
  }
  return p;
}

export class UnitView {
  readonly group = new Group();
  private body: Mesh | null = null;
  private bodyMaterial: ShaderMaterial | null = null;
  private bones: Matrix4[] = [];
  private pose: Matrix4[] = [];
  private inverse: Matrix4[] = [];
  private props: { mesh: Mesh; matrix: Matrix4; point: Matrix4; bone: number }[] = [];
  private clips = new Map<string, ClipEntry[]>();
  private clipName = '';
  private clipTime = 0;
  private readonly sampleKeys: PsaKey[] = [];

  constructor(private readonly e: Entity) {}

  static async create(world: World, e: Entity, bank: ActorBank, light: LightUniforms): Promise<UnitView | null> {
    const visual = bank.get(e.template, e.seed);
    if (!visual) return null;
    const view = new UnitView(e);
    const model = await loadPmd(visual.mesh);
    view.clips = await loadClips(visual);
    view.inverse = inverseBindMatrices(model);
    view.pose = model.bones.map(() => new Matrix4());
    view.bones = model.bones.map(() => new Matrix4());
    const geo = buildGeometry(model, true);
    view.bodyMaterial = await materialFor(world, e, visual.material, visual.texture, light, true);
    view.body = new Mesh(geo, view.bodyMaterial);
    view.body.frustumCulled = false;
    view.group.add(view.body);
    for (const prop of visual.props) {
      const point = model.propPoints.find((p) => p.name === prop.attachpoint);
      if (!point) continue;
      const pv = await propMesh(world, e, prop, light);
      if (!pv) continue;
      const pointMatrix = new Matrix4().compose(
        new Vector3(point.translation[0], point.translation[1], point.translation[2]),
        new Quaternion(point.rotation[0], point.rotation[1], point.rotation[2], point.rotation[3]),
        new Vector3(1, 1, 1),
      );
      pv.matrixAutoUpdate = false;
      view.group.add(pv);
      view.props.push({ mesh: pv, matrix: new Matrix4(), point: pointMatrix, bone: point.bone });
    }
    view.applyAnimation(0);
    return view;
  }

  private pickClip(name: string): ClipEntry | null {
    const list = this.clips.get(name);
    if (!list || !list.length) return null;
    return list[Math.abs(this.e.seed + name.length) % list.length];
  }

  private desiredClip(): string {
    const o = this.e.order;
    if (this.e.path.length > 0) return 'walk';
    if (o?.type === 'attack' || this.e.pendingAttack) return this.e.info.attack.ranged && !this.e.info.attack.melee ? 'attack_ranged' : 'attack_melee';
    if (o?.type === 'build') return 'build';
    if (o?.type === 'gather') return `gather_${o.specific || 'tree'}`;
    return 'idle';
  }

  private applyAnimation(dt: number, forced?: string): void {
    const name = forced ?? this.desiredClip();
    const entry = this.pickClip(name) ?? this.pickClip('idle') ?? this.pickClip('walk');
    if (entry) {
      if (name !== this.clipName) { this.clipName = name; this.clipTime = 0; }
      this.clipTime += dt * entry.speed * 1000;
      if (name === 'death') this.clipTime = Math.min(this.clipTime, Math.max(0, entry.anim.duration - entry.anim.frameTime));
      else if (this.clipTime > entry.anim.duration) this.clipTime %= entry.anim.duration;
      samplePsa(entry.anim, this.clipTime, name !== 'death', this.sampleKeys);
      for (let i = 0; i < this.pose.length; i++) {
        const k = this.sampleKeys[i];
        if (k) this.pose[i].compose(k.translation, k.rotation, new Vector3(1, 1, 1));
        else this.pose[i].identity();
        this.bones[i].multiplyMatrices(this.pose[i], this.inverse[i]);
      }
    }
    if (this.bodyMaterial) {
      const value = this.bodyMaterial.uniforms['boneMatrices'].value as Matrix4[];
      for (let i = 0; i < value.length; i++) value[i].copy(this.bones[i] ?? new Matrix4());
    }
    for (const p of this.props) {
      if (p.bone < this.pose.length) p.matrix.multiplyMatrices(this.pose[p.bone], p.point);
      else p.matrix.copy(p.point);
      p.mesh.matrix.copy(p.matrix);
      p.mesh.matrixWorldNeedsUpdate = true;
    }
  }

  updateDeath(dt: number): void {
    this.group.visible = true;
    this.applyAnimation(dt, 'death');
  }

  update(world: World, dt: number, viewer = 1): void {
    const e = this.e;
    this.group.visible = e.alive && world.entityVisible(e, viewer);
    this.group.position.set(e.x, world.terrain.heightAt(e.x, e.z), e.z);
    this.group.rotation.y = e.yaw;
    this.applyAnimation(dt);
  }

  dispose(): void {
    if (this.body) { this.body.geometry.dispose(); (this.body.material as Material).dispose(); }
    for (const p of this.props) { p.mesh.geometry.dispose(); (p.mesh.material as Material).dispose(); }
    this.group.clear();
  }
}

// ------------------------------------------------------------------------------ projectiles

export class ProjectileLayer {
  readonly group = new Group();
  private readonly geometry = new ConeGeometry(0.07, 0.8, 5);
  private readonly material = new MeshBasicMaterial({ color: 0x6b4a2b });
  private readonly meshes = new Map<number, Mesh>();
  private readonly up = new Vector3(0, 1, 0);

  update(world: World): void {
    const seen = new Set<number>();
    for (const p of world.projectiles) {
      seen.add(p.id);
      let mesh = this.meshes.get(p.id);
      if (!mesh) {
        mesh = new Mesh(this.geometry, this.material);
        mesh.frustumCulled = false;
        this.meshes.set(p.id, mesh);
        this.group.add(mesh);
      }
      mesh.position.set(p.x, p.y, p.z);
      const dir = new Vector3(p.vx, p.vy, p.vz).normalize();
      mesh.quaternion.setFromUnitVectors(this.up, dir);
    }
    for (const [id, mesh] of this.meshes) {
      if (!seen.has(id)) {
        this.group.remove(mesh);
        this.meshes.delete(id);
      }
    }
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.group.clear();
  }
}
