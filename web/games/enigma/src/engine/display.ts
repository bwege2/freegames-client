// The display's model side (d_models.cc, display.cc's model layers and sprites): models are images,
// shaded models, animations (ticking every 10 ms, calling back the object at their end), composites,
// aliases and random choices. The model definitions come from models-32.lua (loaded by models.ts).
// The engine uses this headless; the renderer (render.ts) draws what the layers hold.

export interface ModelCallback { animcb(): void }

export interface ImageRef { file: string; x: number; y: number; w: number; h: number; xoff: number; yoff: number; whole: boolean }

export abstract class Model {
  abstract clone(display: Display): Model;
  expose(_l: ModelLayer) {}
  remove(_l: ModelLayer) {}
  setCallback(_cb: ModelCallback | null) {}
  reverse() {}
  restart() {}
  tick(_dt: number) {}
  isGarbage() { return false; }
  shadow(): Model | null { return null; }
}

export class ImageModel extends Model {
  img: ImageRef;
  constructor(img: ImageRef) { super(); this.img = img; }
  clone() { return new ImageModel(this.img); }
}

export class ShadowModel extends Model {
  model: Model; shade: Model;
  constructor(m: Model, s: Model) { super(); this.model = m; this.shade = s; }
  clone(d: Display) { return new ShadowModel(this.model.clone(d), this.shade.clone(d)); }
  expose(l: ModelLayer) { this.model.expose(l); this.shade.expose(l); }
  remove(l: ModelLayer) { this.shade.remove(l); this.model.remove(l); }
  setCallback(cb: ModelCallback | null) { this.model.setCallback(cb); }
  reverse() { this.model.reverse(); this.shade.reverse(); }
  restart() { this.model.restart(); this.shade.restart(); }
  shadow() { return this.shade; }
}

export class CompositeModel extends Model {
  bg: Model; fg: Model;
  constructor(b: Model, f: Model) { super(); this.bg = b; this.fg = f; }
  clone(d: Display) { return new CompositeModel(this.bg.clone(d), this.fg.clone(d)); }
  setCallback(cb: ModelCallback | null) { this.fg.setCallback(cb); }
  reverse() { this.fg.reverse(); }
  restart() { this.fg.restart(); }
  expose(l: ModelLayer) { this.fg.expose(l); }
  remove(l: ModelLayer) { this.fg.remove(l); }
  shadow() { return this.bg.shadow(); }
}

export class RandomModel extends Model {
  names: string[] = [];
  clone(d: Display): Model { return d.makeModel(this.names[d.randomInt(0, this.names.length - 1)]); }
}

export class AliasModel extends Model {
  name: string;
  constructor(n: string) { super(); this.name = n; }
  clone(d: Display): Model { return d.makeModel(this.name); }
}

interface AnimRep { frames: { model: Model; duration: number }[]; loop: boolean }
export class Anim2d extends Model {
  rep: AnimRep;
  curframe = 0; frametime = 0; finished = false; reversep = false;
  callback: ModelCallback | null = null;
  constructor(rep: AnimRep) { super(); this.rep = rep; }
  clone() { return new Anim2d(this.rep); }
  expose(l: ModelLayer) { l.activate(this); }
  remove(l: ModelLayer) { l.deactivate(this); }
  setCallback(cb: ModelCallback | null) { this.callback = cb; }
  reverse() { this.reversep = !this.reversep; }
  restart() { this.finished = false; this.frametime = 0; this.curframe = 0; }
  isGarbage() { return this.finished; }
  current(): Model | null { return this.finished ? null : this.rep.frames[this.curframe]?.model ?? null; }
  tick(dt: number) {
    this.frametime += dt;
    const dur = this.rep.frames[this.curframe].duration;
    if (this.frametime >= dur) {
      this.frametime -= dur;
      if (this.reversep) {
        if (this.curframe >= 1) this.curframe--;
        else if (this.rep.loop) this.curframe = this.rep.frames.length - 1;
        else this.finished = true;
      } else {
        if (this.curframe + 1 < this.rep.frames.length) this.curframe++;
        else if (this.rep.loop) this.curframe = 0;
        else this.finished = true;
      }
      if (this.finished && this.callback) this.callback.animcb();
    }
  }
}

export class ModelLayer {
  active: (Model | null)[] = [];
  activeNew: Model[] = [];
  activate(m: Model) { this.activeNew.push(m); }
  deactivate(m: Model) {
    const i = this.active.indexOf(m);
    if (i < 0) { const j = this.activeNew.indexOf(m); if (j >= 0) this.activeNew.splice(j, 1); }
    else this.active[i] = null;
  }
  newWorld() { this.active = []; this.activeNew = []; }
  tick(dt: number) {
    this.active = this.active.filter((m) => m !== null && !m.isGarbage());
    this.active.push(...this.activeNew);
    this.activeNew = [];
    for (let i = 0; i < this.active.length; i++) {
      const m = this.active[i];
      if (m) m.tick(dt);
    }
  }
}

export class GridLayer extends ModelLayer {
  w = 0; h = 0;
  models: (Model | null)[] = [];
  newWorld(w = 0, h = 0) { super.newWorld(); this.w = w; this.h = h; this.models = new Array(w * h).fill(null); }
  set(x: number, y: number, m: Model | null) {
    if (!(x >= 0 && y >= 0 && x < this.w && y < this.h)) return;
    const old = this.models[y * this.w + x];
    if (old !== m) {
      if (old) old.remove(this);
      this.models[y * this.w + x] = m;
      if (m) m.expose(this);
    }
  }
  get(x: number, y: number) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.models[y * this.w + x] : null; }
  yieldModel(x: number, y: number) {
    const m = this.get(x, y);
    if (m) m.remove(this);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.models[y * this.w + x] = null;
    return m;
  }
}

export interface Sprite { x: number; y: number; model: Model | null; visible: boolean; effect: boolean }

export class SpriteLayer extends ModelLayer {
  sprites: (Sprite | null)[] = [];
  newWorld() { super.newWorld(); this.sprites = []; }
  add(s: Sprite): number {
    let id = this.sprites.indexOf(null);
    if (id < 0) { id = this.sprites.length; this.sprites.push(s); } else this.sprites[id] = s;
    if (s.model) s.model.expose(this);
    return id;
  }
  replace(id: number, m: Model | null) {
    const s = this.sprites[id];
    if (!s) return;
    if (s.model) s.model.remove(this);
    s.model = m;
    if (m) m.expose(this);
  }
  kill(id: number) {
    const s = this.sprites[id];
    if (!s) return;
    if (s.model) s.model.remove(this);
    this.sprites[id] = null;
  }
  tick(dt: number) {
    for (let i = 0; i < this.sprites.length; i++) {
      const s = this.sprites[i];
      if (s && s.model && s.model.isGarbage() && s.effect) this.kill(i);
    }
    super.tick(dt);
  }
}

export class SpriteHandle {
  layer: SpriteLayer; id: number;
  constructor(layer: SpriteLayer, id: number) { this.layer = layer; this.id = id; }
  private get s() { return this.layer.sprites[this.id]; }
  move(p: { x: number; y: number }) { const s = this.s; if (s) { s.x = p.x; s.y = p.y; } }
  replace(m: Model | null) { this.layer.replace(this.id, m); }
  setCallback(cb: ModelCallback | null) { this.s?.model?.setCallback(cb); }
  hide() { const s = this.s; if (s) s.visible = false; }
  show() { const s = this.s; if (s) s.visible = true; }
  kill() { this.layer.kill(this.id); }
  model() { return this.s?.model ?? null; }
}

export class RubberHandle {
  d: Display; id: number;
  constructor(d: Display, id: number) { this.d = d; this.id = id; }
  update_first(p: { x: number; y: number }) { const l = this.d.rubbers.get(this.id); if (l) { l.x1 = p.x; l.y1 = p.y; } }
  update_second(p: { x: number; y: number }) { const l = this.d.rubbers.get(this.id); if (l) { l.x2 = p.x; l.y2 = p.y; } }
  kill() { this.d.rubbers.delete(this.id); }
}

export class Display {
  templates = new Map<string, Model>();
  floor = new GridLayer(); items = new GridLayer(); stones = new GridLayer();
  sprites = new SpriteLayer(); effects = new SpriteLayer();
  lines = new ModelLayer();
  /** DL_Lines: rubber bands and wires, world coordinates and colour */
  rubbers = new Map<number, { x1: number; y1: number; x2: number; y2: number; r: number; g: number; b: number; thick: boolean }>();
  private rubberId = 1;
  addRubber(p1: { x: number; y: number }, p2: { x: number; y: number }, r: number, g: number, b: number, thick: boolean): RubberHandle {
    const id = this.rubberId++;
    this.rubbers.set(id, { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, r, g, b, thick });
    return new RubberHandle(this, id);
  }
  private rnd = 1;
  /** a model name the level asked for that has no definition */
  missing = new Set<string>();

  randomInt(min: number, max: number) {
    // the system random generator of enigma.cc (Rand(false)), separate from the level's
    this.rnd = (Math.imul(this.rnd, 1103515245) + 12345) & 0x7fffffff;
    return Math.floor((max - min + 1) * (this.rnd / 2147483648)) + min;
  }
  define(name: string, m: Model) { this.templates.set(name, m); }
  has(name: string) { return this.templates.has(name); }
  makeModel(name: string): Model {
    const t = this.templates.get(name);
    if (t) return t.clone(this);
    this.missing.add(name);
    const d = this.templates.get('dummy');
    return d ? d.clone(this) : new ImageModel({ file: 'dummy', x: 0, y: 0, w: 32, h: 32, xoff: 0, yoff: 0, whole: true });
  }
  newWorld(w: number, h: number) {
    this.floor.newWorld(w, h); this.items.newWorld(w, h); this.stones.newWorld(w, h);
    this.sprites.newWorld(); this.effects.newWorld(); this.lines.newWorld();
    this.rubbers.clear(); this.rubberId = 1;
  }
  gridLayer(layer: number) { return layer === 0 ? this.floor : layer === 1 ? this.items : this.stones; }
  setModel(layer: number, x: number, y: number, name: string): Model {
    const m = this.makeModel(name);
    this.gridLayer(layer).set(x, y, m);
    return m;
  }
  getModel(layer: number, x: number, y: number) { return this.gridLayer(layer).get(x, y); }
  killModel(layer: number, x: number, y: number) { this.gridLayer(layer).yieldModel(x, y); }
  addSprite(p: { x: number; y: number }, name: string | null): SpriteHandle {
    const m = name ? this.makeModel(name) : null;
    return new SpriteHandle(this.sprites, this.sprites.add({ x: p.x, y: p.y, model: m, visible: true, effect: false }));
  }
  addEffect(p: { x: number; y: number }, name: string): SpriteHandle {
    const live = this.effects.sprites.filter((s) => s).length;
    if (live >= 70) return new SpriteHandle(this.effects, -1);
    return new SpriteHandle(this.effects, this.effects.add({ x: p.x, y: p.y, model: this.makeModel(name), visible: true, effect: true }));
  }
  sparkle(p: { x: number; y: number }) { if (this.has('ring-anim')) this.addEffect(p, 'ring-anim'); }
  /** display::Tick: the layers in the original's order (floor, items, shadows, sprites, stones, lines, effects) */
  tick(dt: number) {
    this.floor.tick(dt); this.items.tick(dt); this.sprites.tick(dt); this.stones.tick(dt); this.lines.tick(dt); this.effects.tick(dt);
  }
}
