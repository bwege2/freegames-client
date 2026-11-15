// The story's worldmap: worldmap/worldmap.cpp, pingus_worldmap.cpp, path_graph.cpp (with its edge reading,
// which takes the "positions" of the edges section, not of each edge, so every edge is a straight line),
// pathfinder.hpp (Dijkstra over a std::priority_queue), pingus.cpp (the walking pingu), path.cpp, level_dot.cpp,
// story_dot.cpp, sprite_drawable.cpp, worldmap_screen.cpp and worldmap_component.cpp.
import { Vec3, playMusic, playSound, stopMusic } from './common.ts';
import { Fonts } from './fonts.ts';
import { type DrawingContext, SceneContext, rect, rgba } from './gfx.ts';
import { Component, GUIScreen, SCREEN_H, SCREEN_W, ScreenManager, TickButton } from './gui.ts';
import { StoryScreen } from './menus.ts';
import { data } from './res.ts';
import { SavegameManager, StatManager } from './saves.ts';
import { type FileReader, SExprReader } from './sexpr.ts';
import { StartScreen } from './session.ts';
import { Sprite, StateSprite } from './sprite.ts';
import { type PingusLevel, loadLevel } from './world.ts';

const tr = Math.trunc, f = Math.fround;
const NO = -1;

const dist2d = (a: Vec3, b: Vec3) => { const x = f(a.x - b.x), y = f(a.y - b.y); return f(Math.sqrt(f(f(x * x) + f(y * y)))); };

/** Path: a polyline with its length (Vector3f::distance2d) and positions along it */
class Path {
  vec: Vec3[] = [];
  private len: number | null = null;
  push(v: Vec3) { this.vec.push(v); this.len = null; }
  length(): number {
    if (this.len === null) {
      let l = 0;
      for (let i = 1; i < this.vec.length; i++) l = f(l + dist2d(this.vec[i - 1], this.vec[i]));
      this.len = l;
    }
    return this.len;
  }
  at(pos: number): Vec3 {
    let comp = 0;
    for (let i = 0; i + 1 < this.vec.length; i++) {
      const a = this.vec[i], b = this.vec[i + 1], l = dist2d(a, b);
      if (f(comp + l) > pos) {
        const p = f(f(pos - comp) / l);
        return new Vec3(f(a.x + f(f(b.x - a.x) * p)), f(a.y + f(f(b.y - a.y) * p)), f(a.z + f(f(b.z - a.z) * p)));
      }
      comp = f(comp + l);
    }
    return this.vec[this.vec.length - 1];
  }
  reverse() { this.vec.reverse(); }
  clear() { this.vec = []; this.len = null; }
}

interface Edge { data: Path; source: number; destination: number; cost: number }

abstract class Dot {
  pos: Vec3;
  name: string;
  constructor(r: FileReader) {
    const p = r.readVector('position') ?? { x: 0, y: 0, z: 0 };
    this.pos = new Vec3(p.x, p.y, p.z);
    this.name = r.readString('name') ?? '';
  }
  abstract draw(gc: DrawingContext, map: Worldmap): void;
  abstract drawHover(gc: DrawingContext): void;
  abstract onClick(): void;
  abstract accessible(): boolean;
  abstract finished(): boolean;
  abstract unlock(): void;
  update(_d: number) {}
}

class LevelDot extends Dot {
  private green = Sprite.load('core/worldmap/dot_green');
  private red = Sprite.load('core/worldmap/dot_red');
  private invalid = Sprite.load('core/worldmap/dot_invalid');
  private greenHl = Sprite.load('core/worldmap/dot_green_hl');
  private redHl = Sprite.load('core/worldmap/dot_red_hl');
  readonly plf: PingusLevel;
  constructor(r: FileReader) {
    super(r.section('dot'));
    this.plf = loadLevel(r.readString('levelname') ?? '');
  }
  draw(gc: DrawingContext, map: Worldmap) {
    const m = gc.screenToWorld(map.pointer.x, map.pointer.y);
    const x = f(m.x - this.pos.x), y = f(m.y - this.pos.y);
    const hl = f(Math.sqrt(f(f(x * x) + f(y * y)))) < 30;
    const s = SavegameManager.instance.get(this.plf.resname);
    if (s && (s.status === 'finished' || s.status === 'accessible')) {
      if (s.status === 'finished') gc.draw3(hl ? this.greenHl : this.green, this.pos);
      else gc.draw3(hl ? this.redHl : this.red, this.pos);
    } else {
      gc.draw3(this.invalid, this.pos);
    }
  }
  onClick() { ScreenManager.instance.push(new StartScreen(this.plf)); }
  finished() { return SavegameManager.instance.get(this.plf.resname)?.status === 'finished'; }
  accessible() { const s = SavegameManager.instance.get(this.plf.resname); return !!s && s.status !== 'none'; }
  drawHover(gc: DrawingContext) {
    gc.printCenter(Fonts.pingusSmall, tr(this.pos.x), tr(this.pos.y) - 44, this.accessible() ? this.plf.levelname : '???', 10000);
  }
  unlock() {
    const s = SavegameManager.instance.get(this.plf.resname);
    if (!s || s.status === 'none') SavegameManager.instance.store({ filename: this.plf.resname, status: 'accessible', time: 0, saved: 0 });
  }
}

class StoryDot extends Dot {
  private hl = Sprite.load('core/worldmap/story_dot_highlight');
  private dot = Sprite.load('core/worldmap/story_dot');
  private title: string;
  private story: string;
  private credits: boolean;
  constructor(r: FileReader) {
    super(r.section('dot'));
    this.title = r.readString('name') ?? '';
    this.story = r.readString('story') ?? '';
    this.credits = r.readBool('credits') ?? false;
  }
  draw(gc: DrawingContext) { gc.draw3(this.dot, this.pos); }
  drawHover(gc: DrawingContext) {
    gc.draw3(this.hl, this.pos);
    gc.printCenter(Fonts.pingusSmall, tr(this.pos.x), tr(this.pos.y) - 44, this.title, 10000);
  }
  onClick() {
    const t = data().text(this.story);
    if (t !== null) ScreenManager.instance.push(new StoryScreen(SExprReader.parse(t), this.credits));
  }
  // story_dot.hpp: a story dot is always accessible and finished (so it unlocks its neighbours)
  accessible() { return true; }
  finished() { return true; }
  unlock() {}
}

/** Pathfinder: Dijkstra with libstdc++'s std::priority_queue (a binary heap over the live costs) */
class Pathfinder {
  private stat: { status: 'unknown' | 'open'; parent: number; cost: number }[];
  private start: number;
  constructor(g: PathGraph, s: number) {
    this.start = s;
    this.stat = g.nodes.map(() => ({ status: 'unknown' as 'unknown' | 'open', parent: -1, cost: 0 }));
    const heap: number[] = [];
    const less = (a: number, b: number) => this.stat[a].cost > this.stat[b].cost; // CostComp: a "less" b
    const push = (v: number) => {
      heap.push(v);
      let i = heap.length - 1; // __push_heap
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (!less(heap[p], v)) break;
        heap[i] = heap[p]; i = p;
      }
      heap[i] = v;
    };
    const pop = (): number => {
      const top = heap[0];
      const v = heap.pop()!;
      if (heap.length) {
        // __adjust_heap from the root with the last element, then __push_heap
        const n = heap.length;
        let hole = 0, child = 0;
        while (child < (n - 1) >> 1) {
          child = 2 * (child + 1);
          if (less(heap[child], heap[child - 1])) child--;
          heap[hole] = heap[child]; hole = child;
        }
        if ((n & 1) === 0 && child === (n - 2) >> 1) {
          child = 2 * (child + 1);
          heap[hole] = heap[child - 1]; hole = child - 1;
        }
        let i = hole;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (!less(heap[p], v)) break;
          heap[i] = heap[p]; i = p;
        }
        heap[i] = v;
      }
      return top;
    };
    const open = (h: number) => { push(h); this.stat[h].status = 'open'; };
    open(s);
    while (heap.length) {
      const cur = pop();
      for (const e of g.nodes[cur].next) {
        const edge = g.edges[e];
        const child = edge.destination;
        const st = this.stat[child];
        const nc = f(this.stat[cur].cost + edge.cost);
        if (!(st.status === 'open' && st.cost <= nc)) {
          st.parent = cur;
          st.cost = nc;
          if (st.status !== 'open') open(child);
        }
      }
    }
  }
  /** the nodes to the end in reverse (the end first, the start last), empty if unreachable */
  result(end: number): { path: number[]; cost: number } {
    const path: number[] = [];
    let h = end;
    for (;;) {
      path.push(h);
      if (h === this.start) return { path, cost: this.stat[end].cost };
      if (h === -1) return { path: [], cost: end >= 0 ? this.stat[end].cost : 0 };
      h = this.stat[h].parent;
    }
  }
}

class PathGraph {
  nodes: { data: Dot; next: number[] }[] = [];
  edges: Edge[] = [];
  dots: Dot[] = [];
  private nodeLookup = new Map<string, number>();
  private cache = new Map<number, Pathfinder>();
  constructor(map: Worldmap, r: FileReader) {
    for (const s of r.section('nodes').getSections()) {
      let dot: Dot;
      if (s.getName() === 'storydot') dot = new StoryDot(s);
      else if (s.getName() === 'leveldot') dot = new LevelDot(s);
      else throw new Error(`DotFactory: unknown tag: ${s.getName()}`);
      this.nodes.push({ data: dot, next: [] });
      this.nodeLookup.set(dot.name, this.nodes.length - 1);
      map.drawables.push(dot);
      this.dots.push(dot);
    }
    const edgesReader = r.section('edges');
    for (const e of edgesReader.getSections()) {
      if (e.getName() !== 'edge') throw new Error('PathGraph: unhandled: ');
      const src = this.lookup(e.readString('source') ?? ''), dst = this.lookup(e.readString('destination') ?? '');
      const path = new Path();
      for (const p of edgesReader.section('positions').getSections()) {
        if (p.getName() === 'position') path.push(new Vec3(p.readFloat('x') ?? 0, p.readFloat('y') ?? 0, p.readFloat('z') ?? 0));
      }
      const full = new Path();
      full.push(this.nodes[src].data.pos);
      for (const v of path.vec) full.push(v);
      full.push(this.nodes[dst].data.pos);
      const cost = full.length();
      this.addEdge(path, dst, src, cost);
      const path2 = new Path();
      for (const v of [...path.vec].reverse()) path2.push(v);
      this.addEdge(path2, src, dst, cost);
    }
  }
  private addEdge(data: Path, a: number, b: number, cost: number) { this.edges.push({ data, source: a, destination: b, cost }); this.nodes[a].next.push(this.edges.length - 1); }
  lookup(name: string): number { return this.nodeLookup.get(name) ?? NO; }
  getPath(start: number, end: number) {
    let p = this.cache.get(start);
    if (!p) { p = new Pathfinder(this, start); this.cache.set(start, p); }
    return p.result(end);
  }
  dotAt(x: number, y: number): Dot | null {
    for (const d of this.dots) {
      const dx = f(x - d.pos.x), dy = f(y - d.pos.y);
      if (f(Math.sqrt(f(f(dx * dx) + f(dy * dy)))) < 30) return d;
    }
    return null;
  }
  edge(src: number, dst: number): Edge { return this.edges.find((e) => e.source === src && e.destination === dst)!; }
}

class WorldmapPingus {
  private path: PathGraph;
  private sprite = new StateSprite();
  private standing = Sprite.load('core/worldmap/pingus_standing');
  private arrow = Sprite.load('core/worldmap/arrow');
  current = NO;
  private source = NO;
  private target = NO;
  private finalTarget = NO;
  private nodePath: number[] = [];
  private edgePath = new Path();
  private edgePos = 0;
  pos = new Vec3();
  private lastPos = new Vec3();
  constructor(p: PathGraph) {
    this.path = p;
    this.sprite.load(-1, 'core/worldmap/pingus/left');
    this.sprite.load(1, 'core/worldmap/pingus/right');
  }
  draw(gc: DrawingContext) {
    if (this.finalTarget !== NO && this.current === NO) gc.draw3(this.arrow, this.path.nodes[this.finalTarget].data.pos.add(new Vec3(0, 0, 10)));
    if (!this.walking) gc.draw3(this.standing, this.pos);
    else {
      const d = this.direction();
      gc.draw3(this.sprite.get(d >= 0 && d < 180 ? 1 : -1), this.pos.add(new Vec3(0, 0, 10)));
    }
  }
  update(delta: number) {
    const d = this.direction();
    this.sprite.get(d >= 0 && d < 180 ? 1 : -1).update(delta);
    if (this.walking) this.updateWalk(delta);
  }
  private updateWalk(delta: number) {
    this.edgePos = f(this.edgePos + f(70 * delta));
    if (this.edgePos > this.edgePath.length()) {
      if (!this.nodePath.length) { this.current = this.target; this.finalTarget = NO; }
      else this.updateEdgePath();
    }
    this.lastPos = this.pos;
    this.pos = this.calcPos();
  }
  private direction(): number {
    return f(f(f(Math.atan2(f(this.lastPos.x - this.pos.x), -f(this.lastPos.y - this.pos.y))) / f(Math.PI) * 180) + 180);
  }
  get walking() { return this.current === NO; }
  walkTo(target: number): boolean {
    this.finalTarget = target;
    if (this.current === target) return true;
    if (this.current !== NO) {
      const res = this.path.getPath(this.current, target);
      if (!res.path.length) return false;
      this.nodePath = res.path;
      this.target = this.nodePath.pop()!;
      this.updateEdgePath();
      this.current = NO;
      return true;
    }
    if (this.target === target) { this.nodePath = []; return true; }
    if (this.source === target) {
      [this.target, this.source] = [this.source, this.target];
      this.edgePath.reverse();
      this.edgePos = f(this.edgePath.length() - this.edgePos);
      this.nodePath = [];
      return true;
    }
    const p1 = this.path.getPath(this.source, target), p2 = this.path.getPath(this.target, target);
    if (!p1.path.length) {
      if (!p2.path.length) return false;
      this.nodePath = p2.path;
    } else if (f(p1.cost + this.edgePos) < f(p2.cost + f(this.edgePath.length() - this.edgePos))) {
      this.nodePath = p1.path;
      [this.target, this.source] = [this.source, this.target];
      this.edgePath.reverse();
      this.edgePos = f(this.edgePath.length() - this.edgePos);
    } else {
      this.nodePath = p2.path;
    }
    this.nodePath.pop();
    return true;
  }
  private calcPos(): Vec3 { return this.current !== NO ? this.path.nodes[this.current].data.pos : this.edgePath.at(this.edgePos); }
  setPosition(n: number) { this.pos = this.path.nodes[n].data.pos; this.current = n; }
  private updateEdgePath() {
    this.source = this.target;
    this.target = this.nodePath.pop()!;
    this.edgePos = 0;
    this.edgePath = new Path();
    const partial = this.path.edge(this.source, this.target).data;
    this.edgePath.push(this.path.nodes[this.source].data.pos);
    for (const v of [...partial.vec].reverse()) this.edgePath.push(v);
    this.edgePath.push(this.path.nodes[this.target].data.pos);
  }
}

interface Drawable { draw(gc: DrawingContext, map: Worldmap): void; update(d: number): void }

class SpriteDrawable implements Drawable {
  private sprite: Sprite;
  private pos: Vec3;
  private autoUncover: boolean;
  constructor(r: FileReader) {
    const p = r.readVector('position') ?? { x: 0, y: 0, z: 0 };
    this.pos = new Vec3(p.x, p.y, p.z);
    this.autoUncover = r.readBool('auto-uncover') ?? false;
    this.sprite = Sprite.load(r.readDesc('surface') ?? { name: '', modifier: 'ROT0' });
  }
  update() {}
  draw(gc: DrawingContext, map: Worldmap) {
    if (this.autoUncover) {
      const pp = map.pingus.pos, s = this.sprite;
      if (!(pp.x > this.pos.x && pp.x < f(this.pos.x + s.width) && pp.y > this.pos.y && pp.y < f(this.pos.y + s.height))) gc.draw3(s, this.pos);
      else if (pp.z > f(this.pos.z + 1000)) gc.draw3(s, this.pos);
    } else {
      gc.draw3(this.sprite, this.pos);
    }
  }
}

export class Worldmap {
  private head: FileReader;
  shortName: string;
  music: string;
  width: number;
  height: number;
  introStory: FileReader | null = null;
  endStory: FileReader | null = null;
  drawables: (Drawable | Dot)[] = [];
  graph: PathGraph;
  pingus: WorldmapPingus;
  private defaultNode: number;
  private finalNode: number;
  pointer = { x: 0, y: 0 };
  private offset = { x: 0, y: 0 };
  constructor(file: string) {
    const r = SExprReader.parse(data().text(file) ?? '');
    if (r.getName() !== 'pingus-worldmap') throw new Error(`Worldmap:${file}: not a Worldmap file`);
    const graph = r.readSection('graph');
    if (!graph) throw new Error(`Worldmap: ${file} is missed 'graph' section`);
    this.head = r.section('head');
    this.music = this.head.readString('music') ?? '';
    this.shortName = this.head.readString('short-name') ?? '';
    this.width = this.head.readInt('width') ?? 0;
    this.height = this.head.readInt('height') ?? 0;
    const intro = r.readString('intro-story'), end = r.readString('end-story');
    if (intro !== undefined) this.introStory = SExprReader.parse(data().text(intro) ?? '');
    if (end !== undefined) this.endStory = SExprReader.parse(data().text(end) ?? '');
    for (const o of r.section('objects').getSections()) if (o.getName() === 'surface') this.drawables.push(new SpriteDrawable(o));
    this.graph = new PathGraph(this, graph);
    this.defaultNode = this.graph.lookup(this.head.readString('default-node') ?? '');
    this.finalNode = this.graph.lookup(this.head.readString('final-node') ?? '');
    this.pingus = new WorldmapPingus(this.graph);
    this.setStartingNode();
    this.drawables.push({ draw: (gc) => this.pingus.draw(gc), update: (d) => this.pingus.update(d) });
  }
  /** the view: GraphicContextState limited to the map, centred on the pingu */
  draw(gc: DrawingContext) {
    let px = tr(this.pingus.pos.x), py = tr(this.pingus.pos.y);
    const w = this.width, h = this.height, gw = gc.width, gh = gc.height;
    let min: number, max: number;
    if (w >= gw) { min = tr(gw / 2); max = w - tr(gw / 2); } else { min = w - tr(gw / 2); max = tr(gw / 2); }
    px = Math.max(min, Math.min(px, max));
    if (h >= gh) { min = tr(gh / 2); max = h - tr(gh / 2); } else { min = h - tr(gh / 2); max = tr(gh / 2); }
    py = Math.max(min, Math.min(py, max));
    let ox = -px + tr(gw / 2), oy = -py + tr(gh / 2);
    if (-ox < 0) ox = 0; else if (-ox + gw > w) ox = w > gw ? -(w - gw) : 0;
    if (-oy < 0) oy = 0; else if (-oy + gh > h) oy = h > gh ? -(h - gh) : 0;
    this.offset = { x: ox, y: oy };
    gc.pushModelview();
    gc.translateBy(ox, oy);
    for (const d of this.drawables) d.draw(gc, this);
    const m = this.toWorld(this.pointer.x, this.pointer.y);
    this.graph.dotAt(m.x, m.y)?.drawHover(gc);
    gc.popModelview();
  }
  private toWorld(x: number, y: number) { return { x: x - this.offset.x, y: y - this.offset.y }; }
  update(delta: number) { for (const d of this.drawables) d.update(delta); }
  onStartup() { playMusic(this.music); this.updateLockedNodes(); }
  onPointerMove(x: number, y: number) { this.pointer = { x, y }; }
  onPrimaryButtonPress(x: number, y: number) {
    const c = this.toWorld(x, y);
    const dot = this.graph.dotAt(c.x, c.y);
    if (!dot) return;
    if (this.graph.lookup(dot.name) === this.pingus.current) dot.onClick();
    else if (dot.accessible()) {
      if (this.pingus.walkTo(this.graph.lookup(dot.name))) StatManager.instance.setString(`${this.shortName}-current-node`, dot.name);
    } else {
      playSound('chink');
    }
  }
  private updateLockedNodes() {
    for (const n of this.graph.nodes) {
      if (n.data.finished()) {
        for (const e of n.next) {
          const edge = this.graph.edges[e];
          this.graph.nodes[edge.source].data.unlock();
          this.graph.nodes[edge.destination].data.unlock();
        }
      }
    }
  }
  private setStartingNode() {
    const name = StatManager.instance.getString(`${this.shortName}-current-node`);
    let id = name !== undefined ? this.graph.lookup(name) : this.defaultNode;
    if (id === NO) id = this.defaultNode;
    this.pingus.setPosition(id);
    const d = this.graph.nodes[id].data;
    if (d instanceof LevelDot) d.unlock();
  }
  isFinalMap() { return this.pingus.current === this.finalNode; }
}

class WorldmapComponent extends Component {
  private screen: WorldmapScreen;
  private sc = new SceneContext(rect(0, 0, SCREEN_W, SCREEN_H));
  fastForward = false;
  constructor(s: WorldmapScreen) { super(); this.screen = s; }
  draw(gc: DrawingContext) {
    const map = this.screen.worldmap, clip = this.screen.transRect();
    this.sc.setRect(clip);
    this.sc.clear();
    this.sc.pushModelview();
    map.draw(this.sc.color());
    gc.drawScene(this.sc, -1000);
    this.sc.popModelview();
    if (clip.left !== 0 || clip.top !== 0 || clip.right !== SCREEN_W || clip.bottom !== SCREEN_H) {
      const black = rgba(0, 0, 0);
      gc.drawFillrect(rect(0, 0, SCREEN_W, clip.top), black);
      gc.drawFillrect(rect(0, clip.bottom, SCREEN_W, SCREEN_H), black);
      gc.drawFillrect(rect(0, clip.top, clip.left, clip.bottom), black);
      gc.drawFillrect(rect(clip.right, clip.top, SCREEN_W, clip.bottom), black);
    }
  }
  update(delta: number) {
    const n = this.fastForward ? 4 : 1;
    for (let i = 0; i < n; i++) this.screen.worldmap.update(delta);
  }
  isAt() { return true; }
  onPrimaryButtonPress(x: number, y: number) { const c = this.screen.transRect(); this.screen.worldmap.onPrimaryButtonPress(x - c.left, y - c.top); }
  onPointerMove(x: number, y: number) { const c = this.screen.transRect(); this.screen.worldmap.onPointerMove(x - c.left, y - c.top); }
}

class LeaveButton extends TickButton {
  draw(gc: DrawingContext) { super.draw(gc); gc.printCenter(Fonts.chalkSmall, 44, SCREEN_H - 25, 'Leave?'); }
}

export class WorldmapScreen extends GUIScreen {
  worldmap!: Worldmap;
  private exit = false;
  private comp: WorldmapComponent;
  constructor() {
    super();
    this.comp = this.gui.add(new WorldmapComponent(this));
    this.gui.add(new LeaveButton(0, SCREEN_H - 37, 'core/worldmap/leave_button_normal', () => ScreenManager.instance.pop(), ['', '']));
  }
  load(file: string) {
    this.worldmap = new Worldmap(file);
    // the "Show Ending?" credits button is never added in 0.7.6 (credits_unlocked is always false)
  }
  onStartup() { this.exit = false; stopMusic(); this.worldmap?.onStartup(); }
  onEscapePress() { this.exit = true; }
  update(delta: number) {
    super.update(delta);
    if (this.exit) ScreenManager.instance.pop();
  }
  transRect() {
    const w = this.worldmap.width, h = this.worldmap.height;
    const x = Math.max(tr((SCREEN_W - w) / 2), 0), y = Math.max(tr((SCREEN_H - h) / 2), 0);
    return rect(x, y, x + Math.min(SCREEN_W, w), y + Math.min(SCREEN_H, h));
  }
  onFastForwardPress() { this.comp.fastForward = true; }
  onFastForwardRelease() { this.comp.fastForward = false; }
}

/** PingusMenu::do_start: the worldmap, and the intro story the first time */
export function startWorldmap(file: string) {
  const s = new WorldmapScreen();
  s.load(file);
  ScreenManager.instance.push(s);
  if (!(StatManager.instance.getBool('tutorial-startstory-seen') ?? false)) {
    const t = data().text('stories/tutorial_intro.story');
    if (t !== null) ScreenManager.instance.push(new StoryScreen(SExprReader.parse(t)));
    StatManager.instance.setBool('tutorial-startstory-seen', true);
  }
}
