// WorldObj (worldobj.cpp): the base of everything in a world, and which World is current
// (WorldObj::set_world); the C library's rand() for the visual effects.
import type { Vec3 } from './common.ts';
import { f32 } from './common.ts';
import type { SceneContext } from './gfx.ts';
import { GlibcRand, RAND_MAX } from './glibcRand.ts';
import type { FileReader } from './sexpr.ts';
import type { Sprite } from './sprite.ts';
import type { World } from './world.ts';

let current: World | null = null;
export function setWorld(w: World) { current = w; }
/** the C library's rand(), never seeded by Pingus: particles, stars, weather */
export const crand = new GlibcRand(1);
export const rand = () => crand.next();
/** Math::frand */
export const frand = () => f32(f32(rand()) / f32(f32(RAND_MAX) + 1));

export function getWorld(): World {
  if (!current) throw new Error('no world');
  return current;
}

export abstract class WorldObj {
  id = '';
  constructor(reader?: FileReader, readId = false) { if (reader && readId) this.id = reader.readString('id') ?? ''; }
  get world(): World { return getWorld(); }
  abstract getZPos(): number;
  abstract setPos(p: Vec3): void;
  abstract getPos(): Vec3;
  onStartup(): void {}
  update(): void {}
  draw(_gc: SceneContext): void {}
  drawSmallmap(_sm: SmallMapLike): void {}
}

export interface SmallMapLike { drawSprite(s: Sprite, pos: Vec3): void }

