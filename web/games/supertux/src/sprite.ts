// SuperTux .sprite files (src/sprite): actions, frames, fps, loops, mirror- and clone-actions.
import { imageReady, loadImage, loadText } from './resources.ts';
import { parseSexp, child, children, num, atom, type Sexp } from './sexp.ts';

interface Frame { path: string; mirrored: boolean }

export interface SpriteAction {
  name: string;
  fps: number;
  loops: number;
  xOffset: number;
  yOffset: number;
  width: number;
  height: number;
  frames: Frame[];
  hasHitbox: boolean;
  mirrorOf?: string;
  cloneOf?: string;
}

function join(dir: string, file: string): string {
  if (file.startsWith('/')) return file.slice(1);
  if (file.startsWith('images/')) return file;
  return `${dir}/${file}`;
}

export class Sprite {
  readonly path: string;
  readonly actions = new Map<string, SpriteAction>();
  action: SpriteAction;
  frame = 0;
  frameTime = 0;
  angle = 0;
  private loopCount = -1;

  constructor(path: string, actions: Map<string, SpriteAction>) {
    this.path = path;
    this.actions = actions;
    this.action = actions.values().next().value as SpriteAction;
    for (const a of actions.values()) for (const f of a.frames) void loadImage(f.path);
  }

  setAction(name: string, loops = -2): boolean {
    const a = this.actions.get(name);
    if (!a) return false;
    if (a !== this.action) {
      this.action = a;
      this.frame = 0;
      this.frameTime = 0;
      this.loopCount = loops === -2 ? a.loops : loops;
    } else if (loops !== -2) this.loopCount = loops;
    return true;
  }

  /** set the action only when it differs, like Sprite::set_action_continued */
  setActionContinued(name: string): void {
    if (this.action.name !== name) {
      const a = this.actions.get(name);
      if (a) { this.action = a; this.frame = 0; this.frameTime = 0; this.loopCount = a.loops; }
    }
  }

  async ready(): Promise<void> {
    for (const a of this.actions.values()) for (const f of a.frames) await loadImage(f.path);
    for (const a of this.actions.values()) {
      if (a.hasHitbox) continue;
      if (a.mirrorOf || a.cloneOf) {
        const base = this.actions.get(a.mirrorOf ?? a.cloneOf!);
        if (base) {
          a.width = base.width; a.height = base.height;
          if (!a.hasHitbox) { a.xOffset = base.xOffset; a.yOffset = base.yOffset; }
        }
        continue;
      }
      let w = 0, h = 0;
      for (const f of a.frames) {
        const img = imageReady(f.path);
        if (img) { w = Math.max(w, img.width); h = Math.max(h, img.height); }
      }
      a.width = Math.max(0, w - a.xOffset);
      a.height = Math.max(0, h - a.yOffset);
    }
    if (this.action.frames.length === 0) throw new Error(`${this.path}: empty action`);
  }

  setAngle(degrees: number): void { this.angle = degrees; }

  setFrame(f: number): void { this.frame = Math.max(0, Math.min(f, this.action.frames.length - 1)); }
  get frames(): number { return this.action.frames.length; }
  get currentFrame(): number { return this.frame; }
  get actionName(): string { return this.action.name; }
  get currentFrameProgress(): number { return this.action.fps > 0 ? this.frameTime * this.action.fps : 0; }

  update(dt: number): void {
    const a = this.action;
    if (a.frames.length <= 1 || a.fps <= 0) return;
    this.frameTime += dt;
    const step = 1 / a.fps;
    while (this.frameTime >= step) {
      this.frameTime -= step;
      if (this.frame + 1 < a.frames.length) this.frame++;
      else if (this.loopCount < 0 || this.loopCount > 0) {
        if (this.loopCount > 0) this.loopCount--;
        this.frame = 0;
      } else this.frame = a.frames.length - 1;
    }
  }

  animationDone(): boolean {
    return this.frame >= this.action.frames.length - 1 && this.loopCount === 0;
  }

  hitbox(): { x: number; y: number; w: number; h: number } {
    return { x: this.action.xOffset, y: this.action.yOffset, w: this.action.width, h: this.action.height };
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const a = this.action;
    const f = a.frames[this.frame];
    if (!f) return;
    const img = imageReady(f.path);
    if (!img) return;
    const px = x - a.xOffset;
    const py = y - a.yOffset;
    if (this.angle !== 0) {
      ctx.save();
      ctx.translate(px + img.width / 2, py + img.height / 2);
      ctx.rotate(this.angle * Math.PI / 180);
      if (f.mirrored) ctx.scale(-1, 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
    } else if (f.mirrored) {
      ctx.save();
      ctx.translate(px + img.width, py);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(img, px, py);
    }
  }
}

const cache = new Map<string, Promise<Sprite>>();
const dummySpriteText = `(supertux-sprite (action (name "default") (fps 10) (hitbox 0 0 32 32) (images "missing.png")))`;

export function loadSprite(path: string): Promise<Sprite> {
  const clean = path.replace(/^\/+/, '');
  let p = cache.get(clean);
  if (!p) {
    p = loadText(clean)
      .catch(() => dummySpriteText)
      .then((text) => parseSprite(clean, text))
      .then(async (sprite) => { await sprite.ready(); return sprite; })
      .catch(() => parseSprite(clean, dummySpriteText));
    cache.set(clean, p);
  }
  return p;
}

export function parseSprite(path: string, text: string): Sprite {
  const doc = parseSexp(text);
  const dir = path.slice(0, path.lastIndexOf('/'));
  const actions = new Map<string, SpriteAction>();
  const rawActions = children(doc, 'action');
  for (const raw of rawActions) {
    const name = atom(raw, 'name');
    if (!name) throw new Error(`${path}: action without name`);
    const hb = child(raw, 'hitbox');
    const nums = hb ? hb.slice(1).map(Number) : [];
    let xOffset = 0, yOffset = 0, width = 0, height = 0;
    if (nums.length >= 2) { xOffset = nums[0]; yOffset = nums[1]; }
    if (nums.length >= 4) { width = nums[2]; height = nums[3]; }
    const fps = num(raw, 'fps', 10);
    const loops = child(raw, 'loops') ? Number(child(raw, 'loops')![1]) : -1;
    const mirror = atom(raw, 'mirror-action');
    const clone = atom(raw, 'clone-action');
    let frames: Frame[] = [];
    const hasHitbox = width >= 1 && height >= 1;
    if (mirror) {
      const base = actions.get(mirror);
      if (!base) throw new Error(`${path}: mirror-action ${mirror} before it`);
      frames = base.frames.map((f) => ({ path: f.path, mirrored: !f.mirrored }));
    } else if (clone) {
      const base = actions.get(clone);
      if (!base) throw new Error(`${path}: clone-action ${clone} before it`);
      frames = base.frames.slice();
    } else {
      const imgs = child(raw, 'images');
      if (imgs) {
        for (const v of imgs.slice(1)) {
          if (typeof v !== 'string') continue;
          frames.push({ path: join(dir, v), mirrored: false });
        }
      }
    }
    actions.set(name, { name, fps, loops: loops === -1 ? -1 : loops, xOffset, yOffset, width, height, frames, hasHitbox, mirrorOf: mirror, cloneOf: clone });
  }
  if (actions.size === 0) throw new Error(`${path}: sprite without actions`);
  return new Sprite(path, actions);
}

export type { Sexp };
