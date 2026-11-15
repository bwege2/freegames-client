// The world of a level: world.cpp, collision_map.cpp, ground_map.cpp, pingu_holder.cpp, action_holder.cpp,
// goal_manager.cpp, server.cpp, pingus_level.cpp, worldobj.cpp, worldobj_factory.cpp, prefab_file.cpp and
// the particle holders (particles/*.cpp). One World is current at a time (WorldObj::set_world).
import {
  ACTIONS, type ActionName, GP_BRIDGE, GP_NOTHING, GP_OUTOFSCREEN, GP_SOLID, GP_WATER, Vec3, actionFromString, f32, globals,
  playSound,
} from './common.ts';
import { type Color, type SceneContext, rgba } from './gfx.ts';
import { PS_ALIVE, PS_DEAD, PS_EXITED, Pingu } from './pingu.ts';
import { CollisionMask, data } from './res.ts';
import { FileReader, OverrideReader, SExprReader } from './sexpr.ts';
import { Sprite } from './sprite.ts';
import { Surface, blitOntoRGBA } from './surface.ts';
import { createWorldObjs } from './worldobjs.ts';
import { type SmallMapLike, WorldObj, frand, getWorld, rand, setWorld } from './worldobj.ts';

export { WorldObj, getWorld, rand, frand, type SmallMapLike };

const tr = Math.trunc;

export class CollisionMap {
  serial = 0;
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
  constructor(w: number, h: number) { this.width = w; this.height = h; this.data = new Uint8Array(w * h); }
  getpixel(x: number, y: number): number {
    return x >= 0 && x < this.width && y >= 0 && y < this.height ? this.data[x + y * this.width] : GP_OUTOFSCREEN;
  }
  remove(mask: CollisionMask, xPos: number, yPos: number) {
    ++this.serial;
    const sw = mask.w, sh = mask.h, buf = mask.data;
    const sx = Math.max(0, -xPos), sy = Math.max(0, -yPos);
    const ex = Math.min(sw, this.width - xPos), ey = Math.min(sh, this.height - yPos);
    for (let y = sy; y < ey; ++y) {
      for (let x = sx; x < ex; ++x) {
        if (buf[y * sw + x]) {
          const i = (y + yPos) * this.width + (x + xPos);
          if (this.data[i] !== GP_SOLID) this.data[i] = GP_NOTHING;
        }
      }
    }
  }
  putPixel(x: number, y: number, p: number) {
    ++this.serial;
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) this.data[x + y * this.width] = p;
  }
  /** put(const CollisionMask&, ...) */
  put(mask: CollisionMask, sx: number, sy: number, pixel: number) {
    if (pixel === 2 /* GP_TRANSPARENT */) return;
    if (sx > this.width || sy > this.height) return;
    const src = mask.data;
    for (let y = 0; y < mask.h; ++y) {
      for (let x = 0; x < mask.w; ++x) {
        if (src[y * mask.w + x]) {
          if (pixel !== GP_BRIDGE || this.getpixel(x + sx, y + sy) === GP_NOTHING) this.putPixel(x + sx, y + sy, pixel);
        }
      }
    }
  }
}

/**
 * GroundMap: the drawn ground. The original keeps it in 32x32 tiles created on the first put; the pixels
 * are the same as one RGBA surface of the level's size rounded up to whole tiles, which this keeps, with
 * the area that changed since it was last drawn.
 */
export class GroundMap extends WorldObj {
  readonly colmap: CollisionMap;
  readonly width: number;
  readonly height: number;
  readonly surface: Surface;
  constructor(w: number, h: number) {
    super();
    this.width = w;
    this.height = h;
    this.colmap = new CollisionMap(w, h);
    const ts = globals.tileSize;
    this.surface = Surface.rgba(Math.ceil(w / ts) * ts, Math.ceil(h / ts) * ts);
  }
  getZPos() { return 0; }
  setPos() {}
  getPos() { return new Vec3(); }
  private mark(x0: number, y0: number, x1: number, y1: number) {
    x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(this.surface.w, x1); y1 = Math.min(this.surface.h, y1);
    if (x1 <= x0 || y1 <= y0) return;
    const d = this.surface.dirty;
    this.surface.dirty = d ? { x0: Math.min(d.x0, x0), y0: Math.min(d.y0, y0), x1: Math.max(d.x1, x1), y1: Math.max(d.y1, y1) } : { x0, y0, x1, y1 };
  }
  /** put: SDL_BlitSurface onto every tile the source touches */
  put(src: Surface, x: number, y: number) {
    blitOntoRGBA(this.surface, src, x, y);
    this.mark(x, y, x + src.w, y + src.h);
  }
  /** remove: put_alpha_surface on the tiles; only 8-bit sources clear anything (others log an error) */
  remove(src: Surface, x: number, y: number) {
    if (src.bpp !== 1) return;
    const ts = globals.tileSize;
    // the tiles from x/32 to min((x+w)/32, (width-1)/32), clipped to each tile
    const tx0 = Math.max(tr(x / ts), 0), ty0 = Math.max(tr(y / ts), 0);
    const tx1 = Math.min(tr((x + src.w) / ts), tr((this.width - 1) / ts)), ty1 = Math.min(tr((y + src.h) / ts), tr((this.height - 1) / ts));
    const x0 = Math.max(x, tx0 * ts), y0 = Math.max(y, ty0 * ts);
    const x1 = Math.min(x + src.w, (tx1 + 1) * ts), y1 = Math.min(y + src.h, (ty1 + 1) * ts);
    const t = this.surface.px, tw = this.surface.w;
    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) {
        const s = src.px[(py - y) * src.w + (px - x)];
        if (src.colorkey >= 0 && s === src.colorkey) continue;
        if (this.colmap.getpixel(px, py) !== GP_SOLID) t[(py * tw + px) * 4 + 3] = 0;
      }
    }
    this.mark(x0, y0, x1, y1);
  }
  /** the tiles in view, as sprites at z 0 */
  draw(gc: SceneContext) {
    const c = gc.color().getWorldClipRect(), ts = globals.tileSize;
    const x0 = Math.max(0, tr(c.left / ts)) * ts, y0 = Math.max(0, tr(c.top / ts)) * ts;
    const x1 = Math.min(this.surface.w, x0 + (tr((c.right - c.left) / ts) + 2) * ts);
    const y1 = Math.min(this.surface.h, y0 + (tr((c.bottom - c.top) / ts) + 2) * ts);
    if (x1 > x0 && y1 > y0) gc.color().drawSurface(this.surface, { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, x0, y0, 0);
  }
}

// ---- particles (only drawn; they use rand() and read the collision map) ----

export class PinguParticleHolder extends WorldObj {
  private surface = Sprite.load('particles/pingu_explo');
  private particles: { live: number; frame2: boolean; pos: Vec3; vel: Vec3 }[] = [];
  getZPos() { return 1000; }
  setPos() {}
  getPos() { return new Vec3(); }
  private make(x: number, y: number) {
    const live = 50 + (rand() % 75);
    const frame2 = rand() % 5 === 0;
    const vx = f32(f32(frand() * 7) - f32(3.5));
    const vy = f32(frand() * -9);
    return { live, frame2, pos: new Vec3(x, y), vel: new Vec3(vx, vy) };
  }
  addParticle(x: number, y: number) {
    let i = 0;
    for (let k = 0; k < this.particles.length; k++) if (!this.particles[k].live) { this.particles[k] = this.make(x, y); ++i; }
    for (; i < 50; ++i) this.particles.push(this.make(x, y));
  }
  update() {
    const cm = this.world.colmap, g = this.world.gravity;
    const hit = (p: Vec3) => cm.getpixel(tr(p.x), tr(p.y)) !== 0;
    for (const it of this.particles) {
      if (!it.live) continue;
      it.vel.y = f32(it.vel.y + g);
      let add: number;
      if (it.vel.y > 0) {
        for (add = it.vel.y; add >= 1.0; add = f32(add - 1)) {
          if (hit(it.pos)) { it.vel.y = f32(it.vel.y * f32(-0.6)); add = -add; it.pos.y = f32(it.pos.y - 1); break; }
          it.pos.y = f32(it.pos.y + 1);
        }
        it.pos.y = f32(it.pos.y + add);
      } else {
        for (add = it.vel.y; add <= -1.0; add = f32(add + 1)) {
          if (hit(it.pos)) { it.vel.y = f32(it.vel.y * f32(-0.6)); add = -add; it.pos.y = f32(it.pos.y + 1); break; }
          it.pos.y = f32(it.pos.y - 1);
        }
        it.pos.y = f32(it.pos.y + add);
      }
      if (it.vel.x > 0) {
        for (add = it.vel.x; add >= 1.0; add = f32(add - 1)) {
          if (hit(it.pos)) { it.vel.x = f32(it.vel.x * f32(-0.3)); add = -add; it.pos.x = f32(it.pos.x - 1); break; }
          it.pos.x = f32(it.pos.x + 1);
        }
        it.pos.x = f32(it.pos.x + add);
      } else {
        for (add = it.vel.x; add <= -1.0; add = f32(add + 1)) {
          if (hit(it.pos)) { it.vel.x = f32(it.vel.x * f32(-0.3)); add = -add; it.pos.x = f32(it.pos.x + 1); break; }
          it.pos.x = f32(it.pos.x - 1);
        }
        it.pos.x = f32(it.pos.x + add);
      }
      --it.live;
    }
  }
  draw(gc: SceneContext) { for (const it of this.particles) if (it.live) gc.color().draw3(this.surface, it.pos); }
}

export class RainParticleHolder extends WorldObj {
  private rain1 = Sprite.load('particles/rain1');
  private rain2 = Sprite.load('particles/rain2');
  private splash = Sprite.load('particles/rain_splash');
  private particles: { alive: boolean; splash: boolean; rain2: boolean; counter: number; frame: number; pos: Vec3 }[] = [];
  getZPos() { return 1000; }
  setPos() {}
  getPos() { return new Vec3(); }
  addParticle(x: number, y: number) {
    const rain2 = rand() % 3 === 0;
    const p = { alive: true, splash: false, rain2, counter: 0, frame: 0, pos: new Vec3(x, y, f32(1 + f32(frand() * 3))) };
    const i = this.particles.findIndex((q) => !q.alive);
    if (i >= 0) this.particles[i] = p; else this.particles.push(p);
  }
  update() {
    const w = this.world;
    for (const it of this.particles) {
      if (!it.alive) continue;
      if (it.splash) {
        if (it.frame >= this.splash.frameCount) { it.alive = false; continue; }
        it.frame = f32(it.frame + f32(f32(10 * globals.gameSpeed) / 1000));
        if (it.counter === 3) it.alive = false; else ++it.counter;
      } else {
        const px = w.colmap.getpixel(tr(it.pos.x), tr(it.pos.y));
        if (px !== GP_NOTHING && px !== GP_OUTOFSCREEN && rand() % 2 === 0) {
          it.splash = true;
        } else {
          if (it.pos.y > w.height) { it.alive = false; continue; }
          it.pos.x = f32(it.pos.x - f32(5 * it.pos.z));
          it.pos.y = f32(it.pos.y + f32(16 * it.pos.z));
        }
      }
    }
  }
  draw(gc: SceneContext) {
    for (const it of this.particles) {
      if (!it.alive || it.pos.x > this.world.width) continue;
      if (it.splash) {
        // set_frame on the one shared sprite: the requests draw what it holds when they are rendered
        this.splash.setFrame(tr(it.frame));
        gc.color().draw3(this.splash, it.pos);
      } else {
        gc.color().draw(it.rain2 ? this.rain2 : this.rain1, tr(it.pos.x), tr(f32(it.pos.y - this.rain1.height)));
      }
    }
  }
}

export class SmokeParticleHolder extends WorldObj {
  private surf1 = Sprite.load('particles/smoke');
  private surf2 = Sprite.load('particles/smoke2');
  private particles: { live: number; surf2: boolean; pos: Vec3; vel: Vec3 }[] = [];
  getZPos() { return 1000; }
  setPos() {}
  getPos() { return new Vec3(); }
  addParticle(x: number, y: number, vx: number, vy: number) {
    const live = 25 + (rand() % 10);
    const surf2 = rand() % 2 !== 0;
    const p = { live, surf2, pos: new Vec3(x, y), vel: new Vec3(vx, vy) };
    const i = this.particles.findIndex((q) => !q.live);
    if (i >= 0) this.particles[i] = p; else this.particles.push(p);
  }
  update() {
    for (const it of this.particles) {
      if (!it.live) continue;
      it.pos.x = f32(it.pos.x + it.vel.x);
      it.pos.y = f32(it.pos.y + it.vel.y);
      it.pos.z = 1000;
      --it.live;
    }
  }
  draw(gc: SceneContext) { for (const it of this.particles) if (it.live) gc.color().draw3(it.surf2 ? this.surf2 : this.surf1, it.pos); }
}

export class SnowParticleHolder extends WorldObj {
  private snow = [1, 2, 3, 4, 5].map((i) => Sprite.load(`particles/snow${i}`));
  private ground = new CollisionMask('particles/ground_snow');
  private particles: { alive: boolean; colliding: boolean; type: number; pos: Vec3; vel: Vec3 }[] = [];
  getZPos() { return 1000; }
  setPos() {}
  getPos() { return new Vec3(); }
  addParticle(x: number, y: number, colliding = false) {
    const vel = new Vec3(0, f32(1 + f32(frand() * f32(3.5))));
    let type: number;
    switch (rand() % 10) {
      case 0: type = 0; break;
      case 1: type = 1; break;
      case 2: case 3: type = 2; break;
      default: type = 4; break; // cases 5 and 6 fall through to Snow5 as well
    }
    const p = { alive: true, colliding, type, pos: new Vec3(x, y), vel };
    const i = this.particles.findIndex((q) => !q.alive);
    if (i >= 0) this.particles[i] = p; else this.particles.push(p);
  }
  update() {
    const w = this.world;
    for (const it of this.particles) {
      if (!it.alive) continue;
      it.pos.x = f32(it.pos.x + it.vel.x);
      it.pos.y = f32(it.pos.y + it.vel.y);
      if (it.pos.y > w.height) { it.alive = false; continue; }
      it.vel.x = f32(it.vel.x + f32(f32(frand() - f32(0.5)) / 10));
      if (it.colliding) {
        const px = w.colmap.getpixel(tr(it.pos.x), tr(it.pos.y));
        if (px !== GP_NOTHING && px !== GP_WATER && px !== GP_OUTOFSCREEN) {
          w.gfxMap.put(this.ground.surface, tr(f32(it.pos.x - 1)), tr(f32(it.pos.y - 1)));
          it.alive = false;
        }
      }
    }
  }
  draw(gc: SceneContext) { for (const it of this.particles) if (it.alive) gc.color().draw3(this.snow[it.type], it.pos); }
}

// ---- the level ----

export class PingusLevel {
  resname = '';
  checksum = '';
  levelname = '';
  description = '';
  ambientLight: Color = rgba(255, 255, 255, 255);
  size = { width: 0, height: 0 };
  numberOfPingus = 0;
  numberToSave = 0;
  actions = new Map<string, number>();
  time = 0;
  author = '';
  music = '';
  objects: FileReader[] = [];

  /** PingusLevel::load */
  static parse(resname: string, text: string): PingusLevel {
    const l = new PingusLevel();
    l.resname = resname;
    const r = SExprReader.parse(text);
    if (r.getName() !== 'pingus-level') throw new Error(`${resname}: not a 'pingus-level' file`);
    const head = r.readSection('head');
    if (!head) throw new Error(`Error: (head) section not found in '${resname}'`);
    l.levelname = head.readString('levelname') ?? l.levelname;
    l.description = head.readString('description') ?? l.description;
    l.size = head.readSize('levelsize') ?? l.size;
    l.music = head.readString('music') ?? l.music;
    l.time = head.readInt('time') ?? l.time;
    l.numberOfPingus = head.readInt('number-of-pingus') ?? l.numberOfPingus;
    l.numberToSave = head.readInt('number-to-save') ?? l.numberToSave;
    l.ambientLight = head.readColorf('ambient-light') ?? l.ambientLight;
    l.author = head.readString('author') ?? l.author;
    const actions = head.readSection('actions');
    if (!actions) throw new Error(`Error: (pingus-level head actions) not found in '${resname}'`);
    const names = actions.getSectionNames();
    for (const n of [...names].sort()) {
      const c = actions.readInt(n);
      if (c !== undefined) l.actions.set(n, c);
    }
    l.objects = r.section('objects').getSections();
    return l;
  }
}

/** PLFResMgr::load_plf: "tutorial/x" → levels/tutorial/x.pingus */
export function loadLevel(resname: string): PingusLevel {
  const text = data().text(`levels/${resname}.pingus`);
  if (text === null) throw new Error(`level not found: ${resname}`);
  return PingusLevel.parse(resname, text);
}

/** PrefabFile::from_resource */
export function loadPrefab(name: string): FileReader[] {
  const text = data().text(`${name}.prefab`);
  if (text === null) throw new Error(`prefab not found: ${name}`);
  const r = SExprReader.parse(text);
  if (r.getName() !== 'pingus-prefab') throw new Error(`${name}: not a 'pingus-prefab' file`);
  const objects = r.section('objects').getSections();
  if (objects.length === 0) throw new Error(`${name}: empty prefab file`);
  return objects;
}

/** WorldObjFactory::create, with its group and prefab factories */
export function createObjects(reader: FileReader): WorldObj[] {
  const name = reader.getName();
  if (name === 'group') return reader.section('objects').getSections().flatMap((s) => createObjects(s));
  if (name === 'prefab') {
    const pname = reader.readString('name') ?? '';
    const pos = reader.readVector('position') ?? { x: 0, y: 0, z: 0 };
    const overrides = reader.section('overrides');
    const out: WorldObj[] = [];
    for (const o of loadPrefab(pname)) {
      for (const obj of createObjects(new OverrideReader(o, overrides))) {
        obj.setPos(obj.getPos().add(new Vec3(pos.x, pos.y, pos.z)));
        out.push(obj);
      }
    }
    return out;
  }
  return createWorldObjs(reader);
}

export class PinguHolder extends WorldObj {
  readonly allowed: number;
  exited = 0;
  readonly all: Pingu[] = [];
  /** the pingus still in the world, in release order (std::list) */
  pingus: Pingu[] = [];
  constructor(plf: PingusLevel) { super(); this.allowed = plf.numberOfPingus; }
  getZPos() { return 50; }
  setPos() {}
  getPos() { return new Vec3(); }
  createPingu(pos: Vec3, owner: number): Pingu | null {
    if (this.allowed > this.released) {
      const p = new Pingu(this.all.length, pos, owner);
      this.all.push(p);
      this.pingus.push(p);
      return p;
    }
    return null;
  }
  draw(gc: SceneContext) {
    for (const p of this.pingus) if (p.actionName === 'walker') p.draw(gc);
    for (const p of this.pingus) if (p.actionName !== 'walker') p.draw(gc);
  }
  update() {
    // std::list: erasing the current element and going on with the next, elements added meanwhile included
    for (let i = 0; i < this.pingus.length;) {
      const p = this.pingus[i];
      p.update();
      if (p.status === PS_DEAD) this.pingus.splice(i, 1);
      else if (p.status === PS_EXITED) { this.exited += 1; this.pingus.splice(i, 1); }
      else ++i;
    }
  }
  getPingu(id: number): Pingu | null {
    if (id < this.all.length) { const p = this.all[id]; return p.status === PS_ALIVE ? p : null; }
    return null;
  }
  get killed() { return this.all.length - this.pingus.length - this.exited; }
  get alive() { return this.pingus.length; }
  get released() { return this.all.length; }
  get endId() { return this.all.length; }
}

export class ActionHolder {
  /** ordered by ActionName::Enum */
  readonly actions = new Map<ActionName, { available: number; used: number }>();
  constructor(plf: PingusLevel) {
    // std::map: set in the level's (sorted by name) order, the last of equal enums wins, the map is enum-sorted
    const tmp = new Map<ActionName, number>();
    for (const [k, v] of [...plf.actions].map(([k, v]) => [actionFromString(k), v] as [ActionName, number])) tmp.set(k, v);
    for (const a of ACTIONS) if (tmp.has(a)) this.actions.set(a, { available: tmp.get(a)!, used: 0 });
  }
  availableActions(): ActionName[] { return [...this.actions.keys()]; }
  pushAction(a: ActionName) {
    let c = this.actions.get(a);
    if (!c) { c = { available: 0, used: 0 }; this.insertSorted(a, c); }
    c.available += 1; c.used -= 1;
  }
  private insertSorted(a: ActionName, c: { available: number; used: number }) {
    const all = [...this.actions, [a, c] as [ActionName, { available: number; used: number }]];
    all.sort((x, y) => ACTIONS.indexOf(x[0]) - ACTIONS.indexOf(y[0]));
    this.actions.clear();
    for (const [k, v] of all) this.actions.set(k, v);
  }
  popAction(a: ActionName): boolean {
    const c = this.actions.get(a);
    if (!c) return false;
    if (c.available > 0 || globals.developerMode) { c.available -= 1; c.used += 1; return true; }
    return false;
  }
  getAvailable(a: ActionName) { return this.actions.get(a)?.available ?? 0; }
  getUsed(a: ActionName) { return this.actions.get(a)?.used ?? 0; }
}

export class World {
  readonly ambientLight: Color;
  readonly gfxMap: GroundMap;
  gameTime = 0;
  doArmageddon = false;
  armageddonCount = 0;
  readonly objs: WorldObj[] = [];
  readonly pinguParticles: PinguParticleHolder;
  readonly rainParticles: RainParticleHolder;
  readonly smokeParticles: SmokeParticleHolder;
  readonly snowParticles: SnowParticleHolder;
  readonly pingus: PinguHolder;
  readonly colmap: CollisionMap;
  readonly gravity = f32(0.2);

  constructor(plf: PingusLevel) {
    setWorld(this);
    this.ambientLight = plf.ambientLight;
    this.gfxMap = new GroundMap(plf.size.width, plf.size.height);
    this.pingus = new PinguHolder(plf);
    this.colmap = this.gfxMap.colmap;
    this.pinguParticles = new PinguParticleHolder();
    this.rainParticles = new RainParticleHolder();
    this.smokeParticles = new SmokeParticleHolder();
    this.snowParticles = new SnowParticleHolder();
    this.objs.push(this.gfxMap, this.pinguParticles, this.rainParticles, this.smokeParticles, this.snowParticles);
    for (const o of plf.objects) for (const obj of createObjects(o)) this.objs.push(obj);
    this.objs.push(this.pingus);
    // std::stable_sort by z
    const sorted = this.objs.map((o, i) => ({ o, i, z: o.getZPos() })).sort((a, b) => a.z - b.z || a.i - b.i).map((e) => e.o);
    this.objs.length = 0;
    this.objs.push(...sorted);
    for (const o of this.objs) o.onStartup();
  }

  activate() { setWorld(this); }
  get width() { return this.gfxMap.width; }
  get height() { return this.gfxMap.height; }
  get time() { return this.gameTime; }

  update() {
    setWorld(this);
    this.gameTime += 1;
    if (this.doArmageddon && this.gameTime % 4 === 0) {
      while (this.armageddonCount < this.pingus.endId) {
        const p = this.pingus.getPingu(this.armageddonCount);
        if (p && p.status === PS_ALIVE) { p.requestSetAction('bomber'); break; }
        ++this.armageddonCount;
      }
      ++this.armageddonCount;
    }
    for (const o of this.objs) o.update();
  }

  draw(gc: SceneContext) {
    setWorld(this);
    gc.light().fillScreen(this.ambientLight);
    for (const o of this.objs) o.draw(gc);
  }
  drawSmallmap(sm: SmallMapLike) { setWorld(this); for (const o of this.objs) o.drawSmallmap(sm); }

  armageddon() { playSound('goodidea'); this.doArmageddon = true; this.armageddonCount = 0; }
  playSound(name: string, _pos: Vec3, volume = 0.5) { playSound(name, volume, 0); }

  /** the pingu under a world position: the nearest whose box holds it */
  getPinguAt(x: number, y: number): Pingu | null {
    let cur: Pingu | null = null, dist = -1;
    const ix = tr(x), iy = tr(y);
    for (const p of this.pingus.pingus) {
      if (p.isOver(ix, iy)) {
        const d = p.dist(ix, iy);
        if (dist === -1 || dist >= d) { cur = p; dist = d; }
      }
    }
    return cur;
  }

  put(mask: CollisionMask, x: number, y: number, type: number) {
    this.gfxMap.put(mask.surface, x, y);
    this.colmap.put(mask, x, y, type);
  }
  remove(mask: CollisionMask, x: number, y: number) {
    this.gfxMap.remove(mask.surface, x, y);
    this.colmap.remove(mask, x, y);
  }
  getWorldObj(id: string): WorldObj | null { return this.objs.find((o) => o.id === id) ?? null; }
}

export type Goal = 'none' | 'aborted' | 'out_of_time' | 'no_pingus' | 'armageddon';

export class GoalManager {
  private server: Server;
  goal: Goal = 'none';
  exitTime = 0;
  constructor(s: Server) { this.server = s; }
  isFinished(): boolean {
    switch (this.goal) {
      case 'none': return false;
      case 'aborted': return true;
      default:
        if (this.exitTime === 0) { this.exitTime = this.server.time + 125; return false; }
        return this.exitTime < this.server.time;
    }
  }
  update() {
    if (this.exitTime !== 0) return;
    const w = this.server.world, p = w.pingus, plf = this.server.plf;
    if (p.allowed === p.released && p.alive === 0) this.goal = 'no_pingus';
    else if (p.alive === 0 && w.doArmageddon) this.goal = 'armageddon';
    else if (plf.time !== -1 && plf.time <= this.server.time) this.goal = 'out_of_time';
  }
  setAbortGoal() { this.goal = 'aborted'; }
}

/** a ServerEvent as the demo files and the recorder write them */
export type ServerEvent =
  | { type: 'armageddon'; time: number }
  | { type: 'finish'; time: number }
  | { type: 'end'; time: number }
  | { type: 'pingu-action'; time: number; id: number; action: ActionName; rawX?: string; rawY?: string };

export class Server {
  readonly plf: PingusLevel;
  readonly world: World;
  readonly actionHolder: ActionHolder;
  readonly goalManager: GoalManager;
  /** the demo recording (Server::record): one s-expression per line */
  readonly demo: string[] | null;
  constructor(plf: PingusLevel, record = false) {
    this.plf = plf;
    this.world = new World(plf);
    this.actionHolder = new ActionHolder(plf);
    this.goalManager = new GoalManager(this);
    this.demo = record ? [`(level\n  (name "${plf.resname}")\n  (checksum "${plf.checksum}"))`] : null;
  }
  get time() { return this.world.time; }
  update() { this.world.update(); this.goalManager.update(); }
  isFinished() { return this.goalManager.isFinished(); }
  sendArmageddonEvent() { this.record(`(armageddon (time ${this.time}))`); this.world.armageddon(); }
  sendPinguActionEvent(p: Pingu, action: ActionName) {
    this.record(`(pingu-action (time ${this.time}) (id ${p.id}) (raw-x "${floatHex(p.x)}") (raw-y "${floatHex(p.y)}") (action "${action}"))`);
    if (this.actionHolder.popAction(action)) {
      if (!p.requestSetAction(action)) this.actionHolder.pushAction(action);
    }
  }
  sendFinishEvent() { this.record(`(finish (time ${this.time}))`); this.goalManager.setAbortGoal(); }
  private record(line: string) { this.demo?.push(line); }
  /** ServerEvent::send */
  send(ev: ServerEvent) {
    switch (ev.type) {
      case 'armageddon': this.sendArmageddonEvent(); break;
      case 'finish': this.sendFinishEvent(); break;
      case 'end': break;
      case 'pingu-action': {
        const p = this.world.pingus.getPingu(ev.id);
        if (p) this.sendPinguActionEvent(p, ev.action);
        break;
      }
    }
  }
}

/** Math::float2string: the float's bytes in memory order as hex */
export function floatHex(v: number): string {
  const b = new Uint8Array(new Float32Array([v]).buffer);
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/** PingusDemo: the level's resource name and the events of a .pingus-demo file */
export function parseDemo(text: string): { level: string; checksum: string; events: ServerEvent[] } {
  const lines = SExprReader.parseMany(text);
  if (lines.length === 0) throw new Error('demo file is empty');
  let level = '', checksum = '';
  if (lines[0].getName() === 'level') {
    level = lines[0].readString('name') ?? '';
    checksum = lines[0].readString('checksum') ?? '';
  }
  const events: ServerEvent[] = [];
  for (const r of lines.slice(1)) {
    const n = r.getName();
    if (n === 'checksum') continue;
    const time = r.readInt('time') ?? 0;
    if (n === 'armageddon' || n === 'finish' || n === 'end') events.push({ type: n, time });
    else if (n === 'pingu-action') events.push({ type: n, time, id: r.readInt('id') ?? 0, action: actionFromString(r.readString('action') ?? 'walker') });
    else throw new Error(`ServerEvent: Parse error: Unknown event: ${n}`);
  }
  return { level, checksum, events };
}
