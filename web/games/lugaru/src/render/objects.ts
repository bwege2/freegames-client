// The map's objects (Object::Object and Object::draw): the original .solid models, scaled by
// .3 * map scale, rotated 90/1/1, and textured with the environment's tree/bush/rock/box image.
import * as THREE from 'three';
import { doRotation, type Vec3 } from '../data/math.ts';
import { parseSolid, type SolidModel } from '../data/model.ts';
import { OBJECT_TYPE } from '../data/map.ts';
import type { WorldObject } from '../sim/world.ts';
import { loadBinary, loadTexture } from '../load.ts';

const MODEL_FILES: Record<number, string> = {
  [OBJECT_TYPE.box]: 'Box.solid',
  [OBJECT_TYPE.weird]: 'Weird.solid',
  [OBJECT_TYPE.spike]: 'Spike.solid',
  [OBJECT_TYPE.treeTrunk]: 'TreeTrunk.solid',
  [OBJECT_TYPE.treeLeaves]: 'Leaves.solid',
  [OBJECT_TYPE.bush]: 'Bush.solid',
  [OBJECT_TYPE.rock]: 'Rock.solid',
  [OBJECT_TYPE.wall]: 'Wall.solid',
  [OBJECT_TYPE.chimney]: 'Chimney.solid',
  [OBJECT_TYPE.platform]: 'Platform.solid',
  [OBJECT_TYPE.tunnel]: 'Tunnel.solid',
  [OBJECT_TYPE.cool]: 'Cool.solid',
};

export interface EnvironmentTextures {
  tree: THREE.Texture;
  bush: THREE.Texture;
  rock: THREE.Texture;
  box: THREE.Texture;
}

export function environmentPaths(environment: number): { tree: string; bush: string; rock: string; box: string } {
  if (environment === 0) {
    return { tree: 'Textures/SnowTree.png', bush: 'Textures/BushSnow.png', rock: 'Textures/BoulderSnow.jpg', box: 'Textures/SnowBox.jpg' };
  }
  if (environment === 2) {
    return { tree: 'Textures/DesertTree.png', bush: 'Textures/BushDesert.png', rock: 'Textures/BoulderDesert.jpg', box: 'Textures/DesertBox.jpg' };
  }
  return { tree: 'Textures/Tree.png', bush: 'Textures/Bush.png', rock: 'Textures/Boulder.jpg', box: 'Textures/GrassBox.jpg' };
}

export async function loadEnvironmentTextures(environment: number): Promise<EnvironmentTextures> {
  const p = environmentPaths(environment);
  const [tree, bush, rock, box] = await Promise.all([
    loadTexture(p.tree, { repeat: false }),
    loadTexture(p.bush, { repeat: false }),
    loadTexture(p.rock, { repeat: false }),
    loadTexture(p.box, { repeat: false }),
  ]);
  for (const t of [tree, bush, rock, box]) t.colorSpace = THREE.SRGBColorSpace;
  return { tree, bush, rock, box };
}

const modelCache = new Map<string, Promise<SolidModel>>();

function loadModel(file: string): Promise<SolidModel> {
  let p = modelCache.get(file);
  if (!p) {
    p = loadBinary(`Models/${file}`).then((b) => parseSolid(b));
    modelCache.set(file, p);
  }
  return p;
}

/** The original's Object::Object transform: scale .3*scale, Rotate(90,1,1), Rotate(pitch), rock yaw*5. */
function objectGeometry(model: SolidModel, obj: WorldObject): THREE.BufferGeometry {
  const s = 0.3 * (obj.scale || 1);
  const triCount = model.triangles.length;
  const positions = new Float32Array(triCount * 9);
  const uvs = new Float32Array(triCount * 6);
  const transform = (index: number): Vec3 => {
    let v: Vec3 = { x: model.vertices[index].x * s, y: model.vertices[index].y * s, z: model.vertices[index].z * s };
    v = doRotation(v, 90, 1, 1);
    v = doRotation(v, obj.pitch, 0, 0);
    if (obj.type === OBJECT_TYPE.rock) v = doRotation(v, obj.yaw * 5, 0, 0);
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

export async function createObjectView(obj: WorldObject, tex: EnvironmentTextures): Promise<THREE.Mesh | null> {
  const file = MODEL_FILES[obj.type];
  if (!file) return null;
  const model = await loadModel(file);
  const geo = objectGeometry(model, obj);
  const isFoliage = obj.type === OBJECT_TYPE.treeLeaves || obj.type === OBJECT_TYPE.bush;
  const map = obj.type === OBJECT_TYPE.treeTrunk || obj.type === OBJECT_TYPE.treeLeaves ? tex.tree
    : obj.type === OBJECT_TYPE.bush ? tex.bush
      : obj.type === OBJECT_TYPE.rock ? tex.rock
        : tex.box;
  const material = isFoliage
    ? new THREE.MeshLambertMaterial({ map, alphaTest: 0.45, side: THREE.DoubleSide })
    : new THREE.MeshLambertMaterial({ map, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
  mesh.rotation.y = (obj.yaw * Math.PI) / 180;
  mesh.frustumCulled = false;
  mesh.name = `object-${obj.type}`;
  return mesh;
}
