// st_puzzle (stones/PuzzleStone.cc): blue and yellow puzzle stones, their clusters, rotations and
// explosions, and bridges where a complete cluster sinks into water or abyss.
import {
  Stone, Register, server, GameTimer, GetStone, GetFloor, GetItem, SetStone, YieldStone, SetItem, SetFloor, KillStone,
  MakeItem, MakeFloor, IntegerRand, SendMessage, ShatterActorsInsideField, GetPushDirection, contact_face, reverseDir,
  host, objValue, makeGroup, toInt, toBool, toStr, toBits, valueEquals,
  NODIR, NORTH, SOUTH, EAST, WEST, STONE_PASS, STONE_REBOUND, MOVABLE_IRREGULAR,
  type GridPos, type Message, type Value, type Actor, type StoneContact, type Impulse, type TimeHandler,
} from '../core.ts';
import { wieldedItemIs } from './stones2.ts';
import { updateCurrentLightDirs } from './laser.ts';
import { dirFromTo } from './stones1.ts';

const BLUE = 3, YELLOW = 4;
const P_IDLE = 0, P_FALLING = 1, P_FALLEN = 2, P_PENDING = 3, P_IGNITED = 4, P_EXPLODING = 5;

class PuzzleStone extends Stone implements TimeHandler {
  hollow = false; initDone = false; visited = false; single = false;
  sourcePos: GridPos | null = null;
  constructor(color: number, connections: string, hollow = false) {
    super();
    this.setAttr('color', color);
    this.setAttr('connections', connections);
    this.setAttr('hollow', hollow);
  }
  getClass() { return 'st_puzzle'; }
  movableTrait() { return MOVABLE_IRREGULAR; }
  dispose() { GameTimer.remove_alarm(this); super.dispose(); }
  color() { return toInt(this.getAttr('color')); }
  setAttr(key: string, val: Value) {
    if (key === 'hollow') { this.hollow = toBool(val); return; }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value { return key === 'hollow' ? this.hollow : super.getAttr(key); }
  message(m: Message): Value {
    switch (m.message) {
      case '_scramble': {
        const line = this.findLine(toInt(m.value), this.color());
        if (line.length >= 2) { let c = IntegerRand(0, line.length - 1); while (c--) rotateLine(line); }
        return null;
      }
      case 'get_adjacents': return makeGroup(this.findAdjacents());
      case 'get_cluster': { const f: PuzzleStone[] = []; this.findFragment(f); return makeGroup(f); }
      case 'is_complete': return this.findFragment([]);
      case 'pull_rotate': this.rotateLineDir(toInt(m.value), false); return null;
      case 'push_rotate': this.rotateLineDir(toInt(m.value), true); return null;
      case '_init': updateCurrentLightDirs(this); return null;
      case '_cannonball': this.explodeCluster(); return null;
    }
    return super.message(m);
  }
  setState(_s: number) {}
  init_model() {
    if (this.state === P_EXPLODING) { this.set_anim('it_explosion'); return; }
    let m = this.getConnections();
    if (this.color() === YELLOW) m += 16;
    if (this.hollow) m += 32;
    this.set_model(`st_puzzle${m}`);
  }
  on_creation(p: GridPos) {
    if (!this.initDone) { this.autoJoinCluster(); this.initDone = true; }
    this.activatePhoto();
    updateCurrentLightDirs(this);
    super.on_creation(p);
  }
  lightDirChanged(o: number, n: number) {
    if (this.state === P_IDLE && !this.hollow) {
      const add = n & ~o;
      if (add !== 0 && !this.explodeCluster() && this.color() === YELLOW) {
        const p = this.pos;
        if (add & toBits(SOUTH)) this.rotateLineDir(SOUTH);
        if (p.eq(this.pos) && (add & toBits(WEST))) this.rotateLineDir(WEST);
        if (p.eq(this.pos) && (add & toBits(NORTH))) this.rotateLineDir(NORTH);
        if (p.eq(this.pos) && (add & toBits(EAST))) this.rotateLineDir(EAST);
        if (!p.eq(this.pos) && toBool(GetStone(p)?.getAttr('hollow'))) this.objFlags |= toBits(dirFromTo(p, this.pos));
      }
    }
  }
  animcb() { KillStone(this.pos); }
  is_transparent() { return this.hollow; }
  is_sticky(_a: Actor) { return !(this.hollow || this.state === P_EXPLODING); }
  allowsSpreading() { return this.hollow; }
  is_removable() { return this.state === P_IDLE; }
  isConnectable(o: Stone | null) { return o !== null && o.getClass() === this.getClass() && valueEquals(o.getAttr('color'), this.getAttr('color')); }
  collision_response(_sc: StoneContact) { return this.hollow || this.state === P_EXPLODING ? STONE_PASS : STONE_REBOUND; }
  actor_hit(sc: StoneContact) {
    if (this.hollow || this.state !== P_IDLE) return;
    const rot = reverseDir(contact_face(sc));
    const mv = GetPushDirection(sc);
    if (this.color() === YELLOW) {
      if (this.explodeCluster()) return;
      if (this.single && mv !== NODIR) {
        const dest = this.pos.move(mv);
        if (!GetStone(dest)) {
          const from = this.pos;
          const pz = YieldStone(from)!;
          SetStone(dest, pz);
          pz.on_move(from);
          this.sound_event('movesmall');
        } else this.rotateLineDir(rot);
      } else this.rotateLineDir(rot);
    } else {
      const wand = wieldedItemIs(sc.actor, 'it_magicwand');
      if (wand && this.explodeCluster()) return;
      if (mv !== NODIR && this.moveCluster(true, mv, true)) { sc.actor.sendImpulse(this.pos, mv); return; }
      if (wand) this.rotateLineDir(rot);
      else if (mv !== NODIR) sc.actor.sendImpulse(this.pos, mv);
    }
  }
  actor_contact(a: Actor) { if (this.state === P_EXPLODING || this.state === P_IGNITED) SendMessage(a, '_shatter'); }
  on_impulse(imp: Impulse) {
    if (this.state === P_IDLE) {
      const wand = imp.sender && 'ai' in imp.sender ? wieldedItemIs(imp.sender as Actor, 'it_magicwand') : false;
      this.moveCluster(!wand, imp.dir);
    }
    this.propagateImpulse(imp);
  }
  on_move(_o: GridPos) { if (!this.hollow) ShatterActorsInsideField(this.pos); return true; }
  on_floor_change() {
    if (this.state !== P_FALLING) return;
    const p = this.pos;
    this.state = P_FALLEN;
    const fp = server.FallenPuzzle;
    if (fp.startsWith('=')) host.callLua('enigma.settile', fp.slice(1), this, true);
    else if (fp === 'it_strip' || fp === 'it_pipe') {
      let con = toStr(this.getAttr('connections'));
      const it = GetItem(p);
      if (it && it.getClass() === fp) con = fp === 'it_strip' ? con + toStr(it.getAttr('connections')) : toStr(it.getAttr('connections'));
      const ni = MakeItem(fp);
      ni.setAttr('connections', con);
      SetItem(p, ni);
    } else if (fp.startsWith('fl_')) SetFloor(p, MakeFloor(fp));
    KillStone(p);
  }
  alarm() { this.explodeStone(); }

  private checkConnected(todo: PuzzleStone[], src: PuzzleStone, d: number, color: number) {
    const pz = GetStone(src.pos.move(d));
    if (!(pz instanceof PuzzleStone) || pz.color() !== color) return false;
    if (pz.getConnections() & toBits(reverseDir(d))) {
      if (!pz.visited) { pz.visited = true; todo.push(pz); }
      return true;
    }
    return false;
  }
  findFragment(cluster: PuzzleStone[], keepMarked = false): boolean {
    let complete = true;
    const todo: PuzzleStone[] = [this];
    this.visited = true;
    const color = this.color();
    while (todo.length) {
      const pz = todo.pop()!;
      cluster.push(pz);
      const c = pz.getConnections();
      if (c & toBits(NORTH)) complete = this.checkConnected(todo, pz, NORTH, color) && complete;
      if (c & toBits(EAST)) complete = this.checkConnected(todo, pz, EAST, color) && complete;
      if (c & toBits(SOUTH)) complete = this.checkConnected(todo, pz, SOUTH, color) && complete;
      if (c & toBits(WEST)) complete = this.checkConnected(todo, pz, WEST, color) && complete;
    }
    if (!keepMarked) for (const p of cluster) p.visited = false;
    return complete;
  }
  findAdjacents(): PuzzleStone[] {
    const huddle: PuzzleStone[] = [];
    const todo: PuzzleStone[] = [this];
    this.visited = true;
    const color = this.color();
    while (todo.length) {
      const pz = todo.pop()!;
      huddle.push(pz);
      for (const d of [NORTH, SOUTH, EAST, WEST]) {
        const n = GetStone(pz.pos.move(d));
        if (n instanceof PuzzleStone && !n.visited && n.color() === color) { n.visited = true; todo.push(n); }
      }
    }
    for (const p of huddle) p.visited = false;
    return huddle;
  }
  findLine(d: number, color: number): PuzzleStone[] {
    if (d === NODIR) throw new Error('PuzzleStone: no direction in find_row_or_column_cluster');
    const line: PuzzleStone[] = [];
    let p = this.pos;
    for (;;) {
      const pz = GetStone(p);
      if (!(pz instanceof PuzzleStone) || pz.color() !== color) break;
      line.push(pz);
      p = p.move(d);
    }
    return line;
  }
  moveCluster(waterSink: boolean, d: number, checkOnly = false): boolean {
    if (d === NODIR) return false;
    const cluster: PuzzleStone[] = [];
    const complete = this.findFragment(cluster, true);
    let ok = true;
    for (const pz of cluster) {
      const st = GetStone(pz.pos.move(d));
      if (st && (!(st instanceof PuzzleStone) || !st.visited)) { ok = false; break; }
    }
    for (const pz of cluster) pz.visited = false;
    if (checkOnly || !ok) return ok;
    let bridge = true;
    for (const pz of cluster) {
      const fl = GetFloor(pz.pos.move(d));
      if (fl && !((fl.getClass() === 'fl_abyss' && complete) || (fl.getClass() === 'fl_water' && (complete || waterSink)))) { bridge = false; break; }
    }
    this.sound_event('movebig');
    for (const pz of cluster) { pz.sourcePos = pz.pos; YieldStone(pz.sourcePos); }
    for (const pz of cluster) { SetStone(pz.sourcePos!.move(d), pz); pz.on_move(pz.sourcePos!); }
    server.moveCounter += cluster.length;
    if (bridge) for (const pz of cluster) pz.state = P_FALLING;
    return true;
  }
  explodeCluster(): boolean {
    let exploded = false;
    let cluster: PuzzleStone[] = [];
    if (this.findFragment(cluster)) {
      if (this.findAdjacents().length === cluster.length) exploded = true;
    }
    if (exploded) {
      cluster = [];
      if (this.color() === BLUE) cluster = this.findAdjacents(); else this.findFragment(cluster);
      for (const pz of cluster) pz.state = P_PENDING;
      this.explodeStone();
    } else if (this.color() === YELLOW) this.single = cluster.length === 1;
    return exploded;
  }
  explodeStone() {
    const p = this.pos, color = this.color();
    this.sound_event('stonedestroy');
    this.state = P_EXPLODING;
    this.init_model();
    for (const d of [NORTH, SOUTH, EAST, WEST]) {
      const pz = GetStone(p.move(d));
      if (pz instanceof PuzzleStone && pz.state === P_PENDING && pz.color() === color) {
        pz.state = P_IGNITED;
        GameTimer.set_alarm(pz, 0.2, false);
      }
    }
  }
  rotateLineDir(d: number, forward = true) {
    if (d !== NODIR) { const line = this.findLine(d, this.color()); if (line.length >= 2) rotateLine(line, forward); }
  }
}

function rotateLine(line: PuzzleStone[], forward = true) {
  let pz1 = line[0];
  if (line.length < 2) return;
  let p1 = pz1.pos;
  YieldStone(p1);
  for (let i = 1; i < line.length; i++) {
    const pz2 = line[i];
    const p2 = pz2.pos;
    YieldStone(p2);
    if (forward) { SetStone(p2, pz1); pz1 = pz2; }
    else { SetStone(p1, pz2); p1 = p2; }
  }
  SetStone(p1, pz1);
}

const CONN = ['w', 's', 'sw', 'e', 'ew', 'es', 'esw', 'n', 'nw', 'ns', 'nsw', 'ne', 'new', 'nes', 'nesw'];
Register('st_puzzle', new PuzzleStone(BLUE, ''));
Register('st_puzzle_blue', new PuzzleStone(BLUE, ''));
Register('st_puzzle_yellow', new PuzzleStone(YELLOW, ''));
for (const [col, cn] of [[BLUE, 'blue'], [YELLOW, 'yellow']] as [number, string][]) {
  for (const c of CONN) Register(`st_puzzle_${cn}_${c}`, new PuzzleStone(col, c));
  Register(`st_puzzle_${cn}_nesw_hollow`, new PuzzleStone(col, 'nesw', true));
}
export const _keep = [objValue];
