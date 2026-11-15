// Sprite and StateSprite: engine/display/sprite.cpp, sprite_impl.cpp and pingus/state_sprite.cpp. The frame
// logic is part of the game: actions and traps act on frame numbers and on is_finished(), and every one of
// them advances its sprite once per world tick by 0.033 s (33 ms).
import { type ResDescriptor, type SpriteDescription, calcOrigin, loadImageFile, NOT_FOUND, spriteDescription } from './res.ts';
import type { Surface } from './surface.ts';

const f32 = Math.fround;

export class Sprite {
  surface: Surface;
  offset = { x: 0, y: 0 };
  framePos = { x: 0, y: 0 };
  frameW = 0;
  frameH = 0;
  frameDelay = 0;
  arrayW = 1;
  arrayH = 1;
  loop = true;
  loopLastCycle = false;
  finished = false;
  frame = 0;
  tickCount = 0;

  private constructor(surface: Surface) { this.surface = surface; }

  /** Sprite(const std::string&) and Sprite(const ResDescriptor&) */
  static load(res: string | ResDescriptor): Sprite {
    const r = typeof res === 'string' ? { name: res, modifier: 'ROT0' } : res;
    const desc = spriteDescription(r.name);
    if (desc) return Sprite.fromDesc(desc, r.modifier);
    return Sprite.fromDesc({
      filename: NOT_FOUND, offset: { x: 0, y: 0 }, origin: 'top_left', loop: true, speed: 100,
      array: { width: 1, height: 1 }, framePos: { x: 0, y: 0 }, frameSize: { width: -1, height: -1 },
    }, 'ROT0');
  }

  static fromDesc(desc: SpriteDescription, modifier = 'ROT0'): Sprite {
    let surface = loadImageFile(desc.filename);
    if (modifier !== 'ROT0') surface = surface.mod(modifier);
    const s = new Sprite(surface);
    s.framePos = { ...desc.framePos };
    s.arrayW = desc.array.width;
    s.arrayH = desc.array.height;
    s.frameW = desc.frameSize.width === -1 ? Math.trunc(surface.w / s.arrayW) : desc.frameSize.width;
    s.frameH = desc.frameSize.height === -1 ? Math.trunc(surface.h / s.arrayH) : desc.frameSize.height;
    s.frameDelay = desc.speed;
    s.loop = desc.loop;
    const o = calcOrigin(desc.origin, s.frameW, s.frameH);
    s.offset = { x: o.x - desc.offset.x, y: o.y - desc.offset.y };
    return s;
  }

  /** Sprite(const Surface&) */
  static fromSurface(surface: Surface): Sprite {
    const s = new Sprite(surface);
    s.frameW = surface.w;
    s.frameH = surface.h;
    return s;
  }

  get width() { return this.frameW; }
  get height() { return this.frameH; }
  get frameCount() { return this.arrayW * this.arrayH; }

  /** SpriteImpl::update(float delta), 0.033 by default */
  update(delta = 0.033): void {
    if (this.finished || this.frameDelay === 0) return;
    const total = this.frameDelay * (this.arrayW * this.arrayH);
    this.tickCount += Math.trunc(f32(f32(delta) * 1000));
    if (this.tickCount >= total) {
      if (this.loop) {
        this.loopLastCycle = true;
        this.tickCount = this.tickCount % total;
        this.frame = Math.trunc(this.tickCount / this.frameDelay);
      } else {
        this.finished = true;
      }
    } else {
      this.loopLastCycle = false;
      this.frame = Math.trunc(this.tickCount / this.frameDelay);
    }
  }

  setFrame(i: number) { this.frame = i; }
  setPlayLoop(loop: boolean) { this.loop = loop; }
  restart() { this.finished = false; this.loopLastCycle = false; this.frame = 0; this.tickCount = 0; }
  finish() { this.finished = true; }
  isFinished() { return this.finished; }
  isLooping() { return this.loopLastCycle; }
  setHotspot(origin: Parameters<typeof calcOrigin>[0], x: number, y: number) {
    const o = calcOrigin(origin, this.frameW, this.frameH);
    this.offset = { x: o.x - x, y: o.y - y };
  }
  /** the source rectangle of the current frame (SpriteImpl::render) */
  frameRect(): { x: number; y: number; w: number; h: number } {
    return {
      x: this.framePos.x + this.frameW * (this.frame % this.arrayW),
      y: this.framePos.y + this.frameH * Math.trunc(this.frame / this.arrayW),
      w: this.frameW, h: this.frameH,
    };
  }
}

/** StateSprite: one sprite per state (direction), all advanced together by update() */
export class StateSprite {
  private sprites = new Map<number, Sprite>();
  load(state: number, s: string | Sprite) { this.sprites.set(state, typeof s === 'string' ? Sprite.load(s) : s); }
  update(delta = 0.033) { for (const k of [...this.sprites.keys()].sort((a, b) => a - b)) this.sprites.get(k)!.update(delta); }
  get(state: number): Sprite {
    const s = this.sprites.get(state);
    if (!s) throw new Error(`StateSprite error: state ${state} not available`);
    return s;
  }
}
