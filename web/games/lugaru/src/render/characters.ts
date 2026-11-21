// A Lugaru character: the original Body/Wolf mesh deformed by the skeleton animation
// (Skeleton::Load / Person::DrawSkeleton), fur blended with the map's clothes, and the
// currently held weapon.
import * as THREE from 'three';
import { doRotation, type Vec3 } from '../data/math.ts';
import { deformCharacter } from '../data/skin.ts';
import type { SolidModel } from '../data/model.ts';
import { parseSolid } from '../data/model.ts';
import type { Person } from '../sim/person.ts';
import { compositeSkin, loadBinary, loadTexture } from '../load.ts';

export interface WeaponAsset {
  model: SolidModel;
  texture: THREE.Texture;
}

const weaponCache = new Map<number, Promise<WeaponAsset>>();

const WEAPON_FILE: Record<number, string> = { 1: 'ThrowingKnife.solid', 2: 'Sword.solid', 3: 'Staff.solid' };
const WEAPON_TEXTURE: Record<number, string> = { 1: 'Textures/Knife.png', 2: 'Textures/Sword.jpg', 3: 'Textures/Staff.jpg' };

function loadWeapon(type: number): Promise<WeaponAsset> {
  let p = weaponCache.get(type);
  if (!p) {
    p = Promise.all([
      loadBinary(`Models/${WEAPON_FILE[type]}`).then((b) => parseSolid(b)),
      loadTexture(WEAPON_TEXTURE[type]),
    ]).then(([model, texture]) => ({ model, texture }));
    weaponCache.set(type, p);
  }
  return p;
}

function weaponGeometry(model: SolidModel, type: number): THREE.BufferGeometry {
  const s = type === 3 ? 0.005 : 0.001;
  const triCount = model.triangles.length;
  const positions = new Float32Array(triCount * 9);
  const uvs = new Float32Array(triCount * 6);
  const transform = (index: number): Vec3 => {
    let v: Vec3 = { x: model.vertices[index].x * s, y: model.vertices[index].y * s, z: model.vertices[index].z * s };
    v = doRotation(v, 90, 0, 0);
    v = doRotation(v, 0, 90, 0);
    if (type !== 1) v = doRotation(v, 0, 0, 90);
    return v;
  };
  for (let i = 0; i < triCount; i++) {
    const t = model.triangles[i];
    const a = transform(t.a), b = transform(t.b), c = transform(t.c);
    positions.set([a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z], i * 9);
    uvs.set([t.ua, t.va, t.ub, t.vb, t.uc, t.vc], i * 6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

export class CharacterView {
  readonly group: THREE.Group;
  readonly mesh: THREE.Mesh;
  readonly weapons = new Map<number, THREE.Mesh>();
  private readonly person: Person;
  private readonly positions: Float32Array;
  private readonly renderPositions: Float32Array;
  private readonly geometry: THREE.BufferGeometry;

  private constructor(person: Person, texture: THREE.Texture, weapons: { asset: WeaponAsset; type: number }[]) {
    this.person = person;
    this.group = new THREE.Group();
    this.group.name = `person-${person.id}`;
    const model = person.model;
    this.positions = new Float32Array(model.vertices.length * 3);
    for (let i = 0; i < model.vertices.length; i++) {
      this.positions[i * 3] = model.vertices[i].x;
      this.positions[i * 3 + 1] = model.vertices[i].y;
      this.positions[i * 3 + 2] = model.vertices[i].z;
    }
    const triCount = model.triangles.length;
    this.renderPositions = new Float32Array(triCount * 9);
    const uvs = new Float32Array(triCount * 6);
    for (let i = 0; i < triCount; i++) {
      const t = model.triangles[i];
      const a = model.vertices[t.a], b = model.vertices[t.b], c = model.vertices[t.c];
      this.renderPositions.set([a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z], i * 9);
      uvs.set([t.ua, t.va, t.ub, t.vb, t.uc, t.vc], i * 6);
    }
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.renderPositions, 3));
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    this.geometry.computeVertexNormals();
    this.geometry.computeBoundingSphere();
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false;
    this.group.add(this.mesh);
    this.group.scale.setScalar(person.scale);
    this.group.position.set(person.coords.x, person.coords.y, person.coords.z);
    this.group.rotation.y = (person.yaw * Math.PI) / 180;

    for (const weapon of weapons) {
      const geo = weaponGeometry(weapon.asset.model, weapon.type);
      const mat = new THREE.MeshLambertMaterial({ map: weapon.asset.texture, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      mesh.visible = false;
      this.weapons.set(weapon.type, mesh);
    }
  }

  static async create(person: Person): Promise<CharacterView> {
    const skin = person.data.skins[Math.abs(person.mapPlayer.whichskin ?? 0) % person.data.skins.length];
    const clothes = (person.mapPlayer.clothes ?? []).filter((c) => c && c.path);
    const canvas = await compositeSkin(skin, clothes);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const types = [...new Set(person.weapons)].filter((t) => t >= 1 && t <= 3);
    const weapons = await Promise.all(types.map(async (type) => ({ asset: await loadWeapon(type), type })));
    return new CharacterView(person, tex, weapons);
  }

  addTo(scene: THREE.Scene): void {
    scene.add(this.group);
    for (const w of this.weapons.values()) scene.add(w);
  }

  removeFrom(scene: THREE.Scene): void {
    scene.remove(this.group);
    for (const w of this.weapons.values()) {
      scene.remove(w);
      w.geometry.dispose();
      (w.material as THREE.Material).dispose();
    }
    this.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }

  update(): void {
    const p = this.person;
    const joints = p.joints();
    deformCharacter(p.baked, p.skeleton, joints, this.positions);
    const tris = p.model.triangles;
    for (let i = 0; i < tris.length; i++) {
      const t = tris[i];
      const a = this.positions, r = this.renderPositions;
      r[i * 9] = a[t.a * 3]; r[i * 9 + 1] = a[t.a * 3 + 1]; r[i * 9 + 2] = a[t.a * 3 + 2];
      r[i * 9 + 3] = a[t.b * 3]; r[i * 9 + 4] = a[t.b * 3 + 1]; r[i * 9 + 5] = a[t.b * 3 + 2];
      r[i * 9 + 6] = a[t.c * 3]; r[i * 9 + 7] = a[t.c * 3 + 1]; r[i * 9 + 8] = a[t.c * 3 + 2];
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
    this.geometry.computeBoundingSphere();
    this.group.position.set(p.coords.x, p.coords.y, p.coords.z);
    this.group.rotation.y = (p.yaw * Math.PI) / 180;
    const active = p.weaponType;
    for (const [type, w] of this.weapons) {
      w.visible = type === active && !p.dead;
      if (w.visible) {
        const hand = joints[9]?.position ?? { x: 0, y: 5, z: 0 };
        const yaw = (p.yaw * Math.PI) / 180;
        const hx = hand.x * p.scale;
        const hy = hand.y * p.scale;
        const hz = hand.z * p.scale;
        w.position.set(
          p.coords.x + hx * Math.cos(yaw) + hz * Math.sin(yaw),
          p.coords.y + hy,
          p.coords.z - hx * Math.sin(yaw) + hz * Math.cos(yaw),
        );
        w.rotation.set(0, yaw, 0);
      }
    }
  }
}
