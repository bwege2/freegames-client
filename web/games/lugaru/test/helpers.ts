// Shared fixtures: the original data read from web/games/lugaru/assets, and small fake
// creatures/people for the formula and AI tests.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseSkeleton, type SkeletonData } from '../src/data/skeleton.ts';
import { parseSolid, transformSolid } from '../src/data/model.ts';
import { bakeCharacterModel } from '../src/data/skin.ts';
import type { AnimationData } from '../src/data/animation.ts';
import type { CreatureData } from '../src/sim/creatures.ts';
import { Person } from '../src/sim/person.ts';
import type { HeightMap } from '../src/data/heightmap.ts';
import type { MapData, MapPlayer } from '../src/data/map.ts';

export const ASSET_DIR = join(import.meta.dirname, '..', 'assets');

export function asset(path: string): Buffer {
  return readFileSync(join(ASSET_DIR, path));
}

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(ASSET_DIR, path), 'utf8')) as T;
}

export function rabbitSkeleton(): SkeletonData {
  return parseSkeleton(asset('Skeleton/BasicFigure'));
}

export function dummyAnimation(skeleton: SkeletonData): AnimationData {
  return {
    numJoints: skeleton.joints.length,
    height: 'middleheight',
    attack: 'neutral',
    offset: { x: 0, y: 0, z: 0 },
    frames: [{
      joints: skeleton.joints.map((j) => ({ position: { ...j.position }, twist: 0, twist2: 0, onGround: true })),
      speed: 1,
      label: 0,
      weaponTarget: { x: 0, y: 0, z: 0 },
    }],
  };
}

export function makeCreature(kind: 'rabbit' | 'wolf' = 'rabbit'): CreatureData {
  const skeleton = parseSkeleton(asset(`Skeleton/${kind === 'rabbit' ? 'BasicFigure' : 'BasicFigureWolf'}`));
  const model = transformSolid(parseSolid(asset(`Models/${kind === 'rabbit' ? 'Body.solid' : 'Wolf.solid'}`)), [180, 0, 0], 0.04);
  return {
    kind,
    skeleton,
    model,
    baked: bakeCharacterModel(model, skeleton),
    skins: [],
    defaultScale: kind === 'rabbit' ? 0.2 : 0.23,
    damageTolerance: kind === 'rabbit' ? 200 : 300,
    power: kind === 'rabbit' ? 1 : 2.5,
    maxRunSpeed: kind === 'rabbit' ? 55 : 75,
    hasClaws: kind === 'wolf',
    clothes: kind === 'rabbit',
  };
}

export function makePerson(creature: CreatureData, id: number, x: number, z: number, y = 0, yaw = 0): Person {
  const mapPlayer: MapPlayer = {
    creature: creature.kind === 'rabbit' ? 0 : 1,
    whichskin: 0,
    coords: [x, y, z],
    yaw,
    power: 1,
    speedmult: 1,
    armor: { head: 1, high: 1, low: 1 },
    protection: { head: 1, high: 1, low: 1 },
    metal: { head: false, high: false, low: false },
  };
  const animation = dummyAnimation(creature.skeleton);
  return new Person({
    id,
    creature: creature.kind === 'rabbit' ? 0 : 1,
    data: creature,
    mapPlayer,
    animations: () => animation,
    hostile: false,
  });
}

export function flatHeightmap(): HeightMap {
  return { size: 256, red: new Uint8Array(256 * 256) };
}

export function emptyMap(): MapData {
  return {
    map: {
      center: [0, 0, 0],
      radius: 100,
      type: 0,
      hostile: 0,
      environment: 1,
      viewdistance: 100,
      fadestart: 0.6,
      skybox: { texture: true, r: 1, g: 1, b: 1, lightr: 1, lightg: 1, lightb: 1 },
      objects: [],
      players: [],
    },
  };
}
