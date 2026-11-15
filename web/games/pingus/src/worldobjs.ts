// The objects of a level: src/pingus/worldobjs/*.cpp. Traps catch pingus in their update(), the exit turns
// them into exiters, the entrances release them; ground pieces, liquids, doors, ice and conveyor belts
// write the collision map at startup.
import { GP_NOTHING, GP_REMOVE, GP_SOLID, GP_WATER, GP_GROUND, LEFT, RIGHT, Vec3, f32, globals, groundtypeFromString, playSound } from './common.ts';
import { type Color, type SceneContext, rgba } from './gfx.ts';
import { PS_DEAD, PS_EXITED, type Pingu } from './pingu.ts';
import { CollisionMask, type ResDescriptor, loadSurface } from './res.ts';
import type { FileReader } from './sexpr.ts';
import { Sprite } from './sprite.ts';
import { type SmallMapLike, WorldObj, frand, rand } from './worldobj.ts';

const tr = Math.trunc;
const vec = (r: FileReader, name = 'position') => { const v = r.readVector(name); return v ? new Vec3(v.x, v.y, v.z) : new Vec3(); };
const desc = (r: FileReader, name = 'surface'): ResDescriptor => r.readDesc(name) ?? { name: '', modifier: 'ROT0' };

abstract class PosObj extends WorldObj {
  pos: Vec3;
  constructor(r: FileReader, readId = false) { super(r, readId); this.pos = vec(r); }
  getZPos() { return this.pos.z; }
  setPos(p: Vec3) { this.pos = p; }
  getPos() { return this.pos.clone(); }
}

class Groundpiece extends PosObj {
  private desc: ResDescriptor;
  private gptype: number;
  constructor(r: FileReader) {
    super(r);
    this.desc = desc(r);
    const t = r.readString('type');
    this.gptype = t === undefined ? GP_GROUND : groundtypeFromString(t);
  }
  onStartup() {
    const mask = new CollisionMask(this.desc);
    if (this.gptype === GP_REMOVE) this.world.remove(mask, tr(this.pos.x), tr(this.pos.y));
    else this.world.put(mask, tr(this.pos.x), tr(this.pos.y), this.gptype);
  }
}

class Entrance extends PosObj {
  private direction: 'left' | 'right' | 'misc' = 'misc';
  private releaseRate = 150;
  private owner = 0;
  private lastRelease: number;
  private lastDirection = 0;
  private smallmapSymbol = Sprite.load('core/misc/smallmap_entrance');
  constructor(r: FileReader) {
    super(r);
    this.owner = r.readInt('owner-id') ?? 0;
    this.releaseRate = r.readInt('release-rate') ?? 150;
    if (this.owner < 0 || this.owner > 3) this.owner = 0;
    const d = r.readString('direction') ?? '';
    this.direction = d === 'left' ? 'left' : d === 'right' ? 'right' : 'misc';
    this.lastRelease = 150 - this.releaseRate;
  }
  get ownerId() { return this.owner; }
  private pinguReady(): boolean {
    if (this.lastRelease + this.releaseRate < this.world.time) { this.lastRelease = this.world.time; return true; }
    return false;
  }
  update() {
    if (this.pinguReady() && !this.world.doArmageddon) {
      const p = this.world.pingus.createPingu(this.pos, this.owner);
      if (!p) return;
      if (this.direction === 'left') p.direction = LEFT;
      else if (this.direction === 'right') p.direction = RIGHT;
      else if (this.lastDirection) { p.direction = LEFT; this.lastDirection = 0; }
      else { p.direction = RIGHT; this.lastDirection = 1; }
    }
  }
  drawSmallmap(sm: SmallMapLike) { sm.drawSprite(this.smallmapSymbol, this.pos); }
}

class Exit extends PosObj {
  private desc: ResDescriptor;
  private owner: number;
  private sprite: Sprite;
  private flag: Sprite;
  private smallmapSymbol = Sprite.load('core/misc/smallmap_exit');
  constructor(r: FileReader) {
    super(r);
    this.desc = desc(r);
    this.owner = r.readInt('owner-id') ?? 0;
    if (this.owner < 0 || this.owner > 3) this.owner = 0;
    this.flag = Sprite.load(`core/misc/flag${this.owner}`);
    this.sprite = Sprite.load(this.desc);
  }
  onStartup() {
    const mask = new CollisionMask(this.desc);
    this.world.colmap.remove(mask, tr(this.pos.x) - tr(this.sprite.width / 2), tr(this.pos.y) - this.sprite.height);
  }
  draw(gc: SceneContext) {
    gc.color().draw3(this.sprite, this.pos);
    gc.color().draw3(this.flag, this.pos.add(new Vec3(40, 0)));
  }
  drawSmallmap(sm: SmallMapLike) { sm.drawSprite(this.smallmapSymbol, this.pos); }
  update() {
    this.sprite.update();
    for (const p of this.world.pingus.pingus) {
      if (p.owner !== this.owner) continue;
      if (p.x > f32(this.pos.x - 1) && p.x < f32(this.pos.x + 1) && p.y > f32(this.pos.y - 5) && p.y < f32(this.pos.y + 5)) {
        if (p.status !== PS_EXITED && p.status !== PS_DEAD && p.actionName !== 'exiter') p.setAction('exiter');
      }
    }
  }
}

class FakeExit extends PosObj {
  private surface = Sprite.load('traps/fake_exit');
  private smallmapSymbol = Sprite.load('core/misc/smallmap_exit');
  private smashing = false;
  constructor(r: FileReader) {
    super(r);
    this.pos = this.pos.sub(new Vec3(f32(this.surface.width) / 2, this.surface.height));
  }
  draw(gc: SceneContext) { gc.color().draw3(this.surface, this.pos); }
  update() {
    for (const p of this.world.pingus.pingus) this.catchPingu(p);
    if (this.smashing) this.surface.update();
  }
  private catchPingu(p: Pingu) {
    if (this.surface.isFinished()) this.smashing = false;
    const x = this.pos.x, y = this.pos.y;
    if (p.x > f32(x + 31) && p.x < f32(f32(x + 31) + 15) && p.y > f32(y + 56) && p.y < f32(f32(y + 56) + 56)) {
      if (p.actionName !== 'splashed') {
        if (!this.smashing) { this.surface.restart(); this.smashing = true; }
        if (this.surface.frame === 4) p.setAction('splashed');
      }
    }
  }
  drawSmallmap(sm: SmallMapLike) { sm.drawSprite(this.smallmapSymbol, this.pos); }
}

class Guillotine extends PosObj {
  private killRight = Sprite.load('traps/guillotinekill/right');
  private killLeft = Sprite.load('traps/guillotinekill/left');
  private idle = Sprite.load('traps/guillotineidle');
  private direction = 0;
  private killing = false;
  constructor(r: FileReader) {
    super(r);
    this.killRight.setPlayLoop(false);
    this.killLeft.setPlayLoop(false);
    this.idle.setPlayLoop(true);
  }
  draw(gc: SceneContext) {
    gc.color().draw3(this.killing ? (this.direction === LEFT ? this.killLeft : this.killRight) : this.idle, this.pos);
  }
  update() {
    if (this.killLeft.isFinished()) this.killing = false;
    for (const p of this.world.pingus.pingus) this.catchPingu(p);
    if (this.killing) {
      this.killLeft.update();
      this.killRight.update();
      if (this.killLeft.frame === 7) this.world.playSound('splash', this.pos);
    } else {
      this.idle.update();
    }
  }
  private catchPingu(p: Pingu) {
    if (this.killing) return;
    const x = this.pos.x, y = this.pos.y;
    if (p.isInside(tr(f32(x + 38)), tr(f32(y + 90)), tr(f32(x + 42)), tr(f32(y + 98)))) {
      this.killing = true;
      p.status = PS_DEAD;
      this.direction = p.direction;
      this.killLeft.restart();
      this.killRight.restart();
    }
  }
}

class Hammer extends PosObj {
  private sprite = Sprite.load('traps/hammer');
  private down = true;
  private count = 0;
  draw(gc: SceneContext) { gc.color().draw3(this.sprite, this.pos); }
  update() {
    if (this.down) {
      this.count += 1;
      this.sprite.setFrame(this.count);
      if (this.count === this.sprite.frameCount - 1) {
        const x = this.pos.x, y = this.pos.y;
        for (const p of this.world.pingus.pingus) {
          if (p.actionName !== 'splashed' && p.x > f32(x + 55) && p.x < f32(x + 77) && p.y > f32(y + 146) && p.y < f32(y + 185)) {
            p.setAction('splashed');
          }
        }
        this.down = false;
      }
    } else {
      this.count -= 1;
      this.sprite.setFrame(this.count);
      if (this.count === 0) this.down = true;
    }
  }
}

class Hotspot extends PosObj {
  private sprite: Sprite;
  constructor(r: FileReader) { super(r); this.sprite = Sprite.load(desc(r)); }
  update() { this.sprite.update(); }
  draw(gc: SceneContext) { gc.color().draw3(this.sprite, this.pos); }
}

class IceBlock extends PosObj {
  private thickness = 1;
  private finished = false;
  private lastContact = 0;
  private sur = Sprite.load('worldobjs/iceblock');
  private cmap = new CollisionMask('worldobjs/iceblock_cmap');
  // its "repeat" (or old "width") is read and never used
  onStartup() { this.world.put(this.cmap, tr(this.pos.x), tr(this.pos.y), GP_GROUND); }
  draw(gc: SceneContext) { if (!this.finished) gc.color().draw3(this.sur, this.pos); }
  update() {
    if (this.finished) return;
    const x = this.pos.x, y = this.pos.y, w = this.world;
    for (const p of w.pingus.pingus) {
      if (p.x > x && p.x < f32(x + this.sur.width) && p.y > f32(y - 4) && p.y < f32(y + this.sur.height)) this.lastContact = w.time;
    }
    if (this.lastContact && this.lastContact + 1000 > w.time) {
      this.thickness = f32(this.thickness - f32(0.01));
      if (this.thickness < 0) {
        this.finished = true;
        this.thickness = 0;
        w.remove(this.cmap, tr(x), tr(y));
      }
    }
  }
}

class ConveyorBelt extends PosObj {
  private left = Sprite.load('worldobjs/conveyorbelt_left');
  private right = Sprite.load('worldobjs/conveyorbelt_right');
  private middle = Sprite.load('worldobjs/conveyorbelt_middle');
  private width: number;
  private speed: number;
  constructor(r: FileReader) {
    super(r);
    this.width = r.readInt('repeat') ?? r.readInt('width') ?? 0;
    this.speed = r.readFloat('speed') ?? 0;
  }
  draw(gc: SceneContext) {
    const c = gc.color();
    c.draw3(this.left, this.pos);
    for (let i = 0; i < this.width; ++i) {
      c.draw3(this.middle, { x: f32(this.pos.x + (this.left.width + i * this.middle.width)), y: this.pos.y });
    }
    c.draw3(this.right, { x: f32(this.pos.x + (this.left.width + this.width * this.middle.width)), y: this.pos.y });
  }
  onStartup() {
    const mask = new CollisionMask('worldobjs/conveyorbelt_cmap');
    for (let i = 0; i < this.width + 2; ++i) this.world.put(mask, tr(this.pos.x) + 15 * i, tr(this.pos.y), GP_SOLID);
  }
  update() {
    this.left.update();
    this.middle.update();
    this.right.update();
    const x = this.pos.x, y = this.pos.y;
    for (const p of this.world.pingus.pingus) {
      if (p.x > x && p.x < f32(x + f32(15 * (this.width + 2))) && p.y > f32(y - 2) && p.y < f32(y + 10)) {
        p.x = f32(p.x - f32(this.speed * f32(0.025)));
      }
    }
  }
}

class LaserExit extends PosObj {
  private surface = Sprite.load('traps/laser_exit');
  private killing = false;
  draw(gc: SceneContext) { gc.color().draw3(this.surface, this.pos); }
  update() {
    for (const p of this.world.pingus.pingus) this.catchPingu(p);
    if (this.killing) {
      if (this.surface.isFinished()) { this.surface.restart(); this.killing = false; }
      else this.surface.update();
    }
  }
  private catchPingu(p: Pingu) {
    if (this.killing) return;
    const x = this.pos.x, y = this.pos.y;
    if (p.x < f32(f32(x + 34) + 10) && p.x > f32(x + 34) && p.y < f32(f32(y + 43) + 20) && p.y > f32(y + 43)) {
      if (p.actionName !== 'laserkill') { this.killing = true; p.setAction('laserkill'); }
    }
  }
}

class Liquid extends PosObj {
  private sur: Sprite;
  private width: number;
  constructor(r: FileReader) {
    super(r);
    const d = desc(r);
    this.width = r.readInt('repeat') ?? 0;
    this.sur = Sprite.load(d);
    this.width = this.width * this.sur.width;
  }
  onStartup() {
    const mask = new CollisionMask('liquids/water_cmap');
    for (let i = 0; i < this.width; ++i) this.world.colmap.put(mask, tr(f32(this.pos.x + i)), tr(this.pos.y), GP_WATER);
  }
  draw(gc: SceneContext) {
    for (let x = tr(this.pos.x); x < tr(this.pos.x) + this.width; x += this.sur.width) {
      gc.color().draw3(this.sur, { x, y: this.pos.y, z: 0 });
    }
  }
  update() { this.sur.update(0.033); }
}

class RainGenerator extends WorldObj {
  private doThunder = false;
  private thunderCount = 0;
  private waiterCount = 0;
  getZPos() { return 1000; }
  setPos() {}
  getPos() { return new Vec3(); }
  draw(gc: SceneContext) {
    if (this.doThunder) {
      if (this.thunderCount < 0) { this.doThunder = false; this.thunderCount = 0; this.waiterCount = 1; }
      gc.color().fillScreen(rgba(255, 255, 255, tr(f32(this.thunderCount * 255)) & 0xff));
    }
  }
  update() {
    if (this.waiterCount < 0 && rand() % 150 === 0) {
      this.doThunder = true;
      this.thunderCount = 1;
      this.waiterCount = 1;
      playSound('thunder');
    }
    if (this.doThunder) this.thunderCount = f32(this.thunderCount - f32(10 * f32(0.025)));
    this.waiterCount = f32(this.waiterCount - f32(20 * f32(0.025)));
    for (let i = 0; i < 16; ++i) this.world.rainParticles.addParticle(rand() % (this.world.width * 2), -32);
  }
}

class SnowGenerator extends WorldObj {
  private intensity: number;
  constructor(r: FileReader) { super(r); this.intensity = r.readFloat('intensity') ?? 1; }
  getZPos() { return 1000; }
  setPos() {}
  getPos() { return new Vec3(); }
  update() {
    const w = this.world;
    const add = () => {
      if (rand() % 3 !== 0) w.snowParticles.addParticle(rand() % w.width, -globals.tileSize, false);
      else w.snowParticles.addParticle(rand() % w.width, -globals.tileSize, true);
    };
    for (let i = 0; i < Math.floor(this.intensity); ++i) add();
    if (f32(this.intensity - tr(this.intensity)) > frand()) add();
  }
}

class Smasher extends PosObj {
  private sprite = Sprite.load('traps/smasher');
  private smashing = false;
  private downwards = false;
  private count = 0;
  update() {
    const w = this.world;
    for (const p of w.pingus.pingus) this.catchPingu(p);
    if (!this.smashing) return;
    this.sprite.setFrame(this.count);
    if (this.downwards) {
      if (this.count >= 5) {
        this.downwards = false;
        --this.count;
        playSound('tenton');
        for (let i = 0; i < 20; ++i) {
          const x = f32(f32(this.pos.x + 20) + f32(rand() % 260));
          w.smokeParticles.addParticle(x, f32(this.pos.y + 180), f32(frand() - f32(0.5)), f32(frand() - f32(0.5)));
        }
        const x = this.pos.x, y = this.pos.y;
        for (const p of w.pingus.pingus) {
          if (p.isInside(tr(f32(x + 30)), tr(f32(y + 90)), tr(f32(x + 250)), tr(f32(y + 190))) && p.actionName !== 'splashed') {
            p.setAction('splashed');
          }
        }
      } else {
        ++this.count;
      }
    } else if (this.count <= 0) {
      this.count = 0;
      this.smashing = false;
    } else {
      --this.count;
    }
  }
  onStartup() { this.world.put(new CollisionMask('traps/smasher_cmap'), tr(this.pos.x), tr(this.pos.y), GP_SOLID); }
  draw(gc: SceneContext) { gc.color().draw3(this.sprite, this.pos); }
  private catchPingu(p: Pingu) {
    const x = this.pos.x;
    if ((p.direction === LEFT && p.x > f32(x + 65) && p.x < f32(x + 85)) || (p.direction === RIGHT && p.x > f32(x + 190) && p.x < f32(x + 210))) {
      if (p.actionName !== 'splashed' && !this.smashing) { this.count = 0; this.downwards = true; this.smashing = true; }
    }
  }
}

class SolidColorBackground extends WorldObj {
  private color: Color;
  constructor(r: FileReader) { super(r); this.color = r.readColori('colori') ?? r.readColorf('color') ?? rgba(0, 0, 0, 255); }
  getZPos() { return -10; }
  setPos() {}
  getPos() { return new Vec3(); }
  draw(gc: SceneContext) { gc.color().fillScreen(this.color); }
}

class Spike extends PosObj {
  private surface = Sprite.load('traps/spike');
  private killing = false;
  draw(gc: SceneContext) { if (this.killing) gc.color().draw3(this.surface, this.pos); }
  update() {
    if (this.killing) this.surface.update();
    for (const p of this.world.pingus.pingus) this.catchPingu(p);
    if (this.surface.frame === this.surface.frameCount - 1) this.killing = false;
  }
  private catchPingu(p: Pingu) {
    const x = this.pos.x, y = this.pos.y;
    if (!this.killing) {
      if (p.x > f32(f32(x + 16) - 5) && p.x < f32(f32(x + 16) + 5) && p.y > y && p.y < f32(y + 32)) {
        this.surface.restart();
        this.killing = true;
      }
    } else if (this.surface.frame === 3 && p.x > f32(f32(x + 16) - 12) && p.x < f32(f32(x + 16) + 12) && p.y > y && p.y < f32(y + 32)) {
      p.status = PS_DEAD;
    }
  }
}

class StarfieldBackground extends WorldObj {
  private stars: { sur: Sprite; x: number; y: number; xAdd: number; yAdd: number }[] = [];
  constructor(r: FileReader) {
    super(r);
    const small = r.readInt('small-stars') ?? 100, middle = r.readInt('middle-stars') ?? 50, large = r.readInt('large-stars') ?? 25;
    const w = this.world;
    const make = (name: string) => {
      const x = f32(rand() % w.width), y = f32(rand() % w.height), xAdd = f32(f32(rand() % 5) + 1);
      this.stars.push({ sur: Sprite.load(name), x, y, xAdd, yAdd: 0 });
    };
    for (let i = 0; i < small; i++) make('game/stars/small_star');
    for (let i = 0; i < middle; i++) make('game/stars/middle_star');
    for (let i = 0; i < large; i++) make('game/stars/large_star');
  }
  getZPos() { return -10; }
  setPos() {}
  getPos() { return new Vec3(); }
  update() {
    const w = this.world;
    for (const s of this.stars) {
      s.x = f32(s.x + s.xAdd);
      s.y = f32(s.y + s.yAdd);
      if (s.x > w.width) { s.x = -globals.tileSize; s.y = f32(rand() % w.height); }
    }
  }
  draw(gc: SceneContext) { for (const s of this.stars) gc.color().draw3(s.sur, { x: s.x, y: s.y, z: 0 }); }
}

class SurfaceBackground extends WorldObj {
  private paraX: number;
  private paraY: number;
  private pos: Vec3;
  private scrollX: number;
  private scrollY: number;
  private sprite: Sprite;
  private scrollOx = 0;
  private scrollOy = 0;
  constructor(r: FileReader) {
    super(r);
    const p = r.readVector('position');
    this.pos = p ? new Vec3(p.x, p.y, p.z) : new Vec3(0, 0, -150);
    const d = desc(r);
    const color = r.readColori('colori') ?? r.readColorf('color') ?? rgba(0, 0, 0, 0);
    this.paraX = r.readFloat('para-x') ?? f32(0.5);
    this.paraY = r.readFloat('para-y') ?? f32(0.5);
    this.scrollX = r.readFloat('scroll-x') ?? 0;
    this.scrollY = r.readFloat('scroll-y') ?? 0;
    const sx = r.readBool('stretch-x') ?? false, sy = r.readBool('stretch-y') ?? false, keep = r.readBool('keep-aspect') ?? false;
    if (!sx && !sy && color.a === 0) {
      this.sprite = Sprite.load(d);
    } else {
      let s = loadSurface(d).clone();
      if (color.a !== 0 && s.indexed) s = s.colorkey >= 0 ? s.convertToRGBA() : s.convertToRGB();
      s.fill(color);
      const w = this.world;
      if (sx && sy) s = s.scale(w.width, w.height);
      else if (sx) s = keep ? s.scale(w.width, tr(f32(w.width * f32(f32(s.h) / f32(s.w))))) : s.scale(w.width, s.h);
      else if (sy) s = keep ? s.scale(tr(f32(w.height * f32(f32(s.w) / f32(s.h)))), w.height) : s.scale(s.w, w.height);
      this.sprite = Sprite.fromSurface(s);
    }
  }
  getZPos() { return this.pos.z; }
  setPos() {}
  getPos() { return new Vec3(); }
  update() {
    this.sprite.update();
    if (globals.staticGraphics) return;
    const w = this.sprite.width, h = this.sprite.height;
    if (this.scrollX) {
      this.scrollOx = f32(this.scrollOx + this.scrollX);
      if (this.scrollOx > w) this.scrollOx = f32(this.scrollOx - w);
      else if (-this.scrollOx > w) this.scrollOx = f32(this.scrollOx + w);
    }
    if (this.scrollY) {
      this.scrollOy = f32(this.scrollOy + this.scrollY);
      if (this.scrollOy > h) this.scrollOy = f32(this.scrollOy - h);
      else if (-this.scrollOy > h) this.scrollOy = f32(this.scrollOy + h);
    }
  }
  draw(gc: SceneContext) {
    const c = gc.color();
    const o = c.worldToScreen(0, 0);
    o.x -= c.rect.left;
    o.y -= c.rect.top;
    let sx = tr(f32(f32(o.x * this.paraX) + this.scrollOx));
    let sy = tr(f32(f32(o.y * this.paraY) + this.scrollOy));
    const w = this.sprite.width, h = this.sprite.height;
    if (sx > 0) sx = (sx % w) - w;
    if (sy > 0) sy = (sy % h) - h;
    const ww = this.world.width, wh = this.world.height;
    for (let y = sy; y < wh; y += h) for (let x = sx; x < ww; x += w) c.draw(this.sprite, x - o.x, y - o.y, this.pos.z);
  }
}

class SwitchDoorDoor extends WorldObj {
  pos: Vec3;
  private height: number;
  private box = Sprite.load('worldobjs/switchdoor_box');
  private boxCmap = new CollisionMask('worldobjs/switchdoor_box');
  private tile = Sprite.load('worldobjs/switchdoor_tile');
  private tileCmap = new CollisionMask('worldobjs/switchdoor_tile_cmap');
  private opening = false;
  private current: number;
  constructor(r: FileReader) {
    super(r, true);
    this.pos = vec(r);
    this.height = r.readInt('height') ?? 0;
    this.current = this.height;
  }
  getZPos() { return 100; }
  setPos(p: Vec3) { this.pos = p; }
  getPos() { return this.pos.clone(); }
  onStartup() { this.putCmap(GP_SOLID); }
  private putCmap(type: number) {
    const cm = this.world.colmap, x = tr(this.pos.x), y = tr(this.pos.y);
    cm.put(this.boxCmap, x, y, type);
    for (let i = 0; i < this.height; ++i) cm.put(this.tileCmap, x, y + i * this.tile.height + this.box.height, type);
  }
  draw(gc: SceneContext) {
    gc.color().draw3(this.box, this.pos);
    for (let i = 0; i < this.current; ++i) {
      gc.color().draw3(this.tile, { x: this.pos.x, y: f32(this.pos.y + (i * this.tile.height + this.box.height)), z: 0 });
    }
  }
  update() {
    if (this.current > 0 && this.opening) {
      --this.current;
      if (this.current + 10 < this.height) this.putCmap(GP_NOTHING);
    }
  }
  openDoor() { this.opening = true; }
}

class SwitchDoorSwitch extends WorldObj {
  pos: Vec3;
  private sur = Sprite.load('worldobjs/switchdoor_switch');
  private target: string;
  private triggered = false;
  private door: SwitchDoorDoor | null = null;
  constructor(r: FileReader) { super(r); this.target = r.readString('target-id') ?? ''; this.pos = vec(r); }
  getZPos() { return 100; }
  setPos(p: Vec3) { this.pos = p; }
  getPos() { return this.pos.clone(); }
  onStartup() {
    if (!this.target) return;
    const d = this.world.getWorldObj(this.target);
    this.door = d instanceof SwitchDoorDoor ? d : null;
  }
  draw(gc: SceneContext) { gc.color().draw3(this.sur, this.pos); }
  update() {
    if (this.triggered || !this.door) return;
    const x = this.pos.x, y = this.pos.y;
    for (const p of this.world.pingus.pingus) {
      if (p.x > x && p.x < f32(x + this.sur.width) && p.y > y && p.y < f32(y + this.sur.height)) {
        this.triggered = true;
        this.door.openDoor();
        break;
      }
    }
  }
}

class TeleporterTarget extends PosObj {
  private sprite = Sprite.load('worldobjs/teleportertarget');
  constructor(r: FileReader) { super(r, true); }
  draw(gc: SceneContext) { gc.color().draw3(this.sprite, this.pos); }
  update() { this.sprite.update(); }
  used() { this.sprite.restart(); }
}

class Teleporter extends PosObj {
  private sprite = Sprite.load('worldobjs/teleporter');
  private targetId: string;
  private target: TeleporterTarget | null = null;
  constructor(r: FileReader) { super(r); this.targetId = r.readString('target-id') ?? ''; }
  draw(gc: SceneContext) { gc.color().draw3(this.sprite, this.pos); }
  onStartup() {
    if (!this.targetId) return;
    const t = this.world.getWorldObj(this.targetId);
    this.target = t instanceof TeleporterTarget ? t : null;
  }
  update() {
    this.sprite.update();
    if (!this.target) return;
    const x = this.pos.x, y = this.pos.y;
    for (const p of this.world.pingus.pingus) {
      if (p.x > f32(x - 3) && p.x < f32(x + 3) && p.y > f32(y - 52) && p.y < y) {
        p.setPos(this.target.pos.x, this.target.pos.y);
        this.target.used();
        this.sprite.restart();
      }
    }
  }
}

const FACTORIES: Record<string, new (r: FileReader) => WorldObj> = {
  liquid: Liquid, hotspot: Hotspot, entrance: Entrance, exit: Exit, fake_exit: FakeExit, guillotine: Guillotine,
  hammer: Hammer, laser_exit: LaserExit, smasher: Smasher, spike: Spike, 'switchdoor-switch': SwitchDoorSwitch,
  'switchdoor-door': SwitchDoorDoor, iceblock: IceBlock, conveyorbelt: ConveyorBelt, teleporter: Teleporter,
  'teleporter-target': TeleporterTarget, 'surface-background': SurfaceBackground, 'starfield-background': StarfieldBackground,
  'solidcolor-background': SolidColorBackground, 'snow-generator': SnowGenerator, 'rain-generator': RainGenerator,
  snow: SnowGenerator, rain: RainGenerator, groundpiece: Groundpiece,
};

export function createWorldObjs(r: FileReader): WorldObj[] {
  const F = FACTORIES[r.getName()];
  return F ? [new F(r)] : [];
}

export { Entrance };
