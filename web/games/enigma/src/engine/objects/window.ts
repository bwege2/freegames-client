// st_window (stones/WindowStone.cc): stones with glass faces on some sides.
import {
  Stone, Actor, Register, GetStone, GetItem, GetFloor, SetItem, YieldItem, MakeItem, KillStone, SendMessage, WarpActor,
  GetActorsInRange, TouchStone, toBool, toInt, toStr, toPosition, ALL_DIRECTIONS, NODIRBIT, NORTHBIT, EASTBIT, SOUTHBIT,
  WESTBIT, NORTH, EAST, SOUTH, WEST, NODIR, toBits, reverseDir, STONE_PASS, STONE_REBOUND, MOVABLE_BREAKABLE, GridPos,
  type Message, type Value, type StoneContact,
} from '../core.ts';
import { wieldedItemIs } from './stones2.ts';

const IDLE = 0, BREAK = 1, FINALBREAK = 2;
const hasDir = (bits: number, d: number) => (bits & toBits(d)) !== 0;
class WindowStone extends Stone {
  secure = false; scratches = 0;
  constructor(faces: string) { super(); this.setAttr('faces', faces); }
  getClass() { return 'st_window'; }
  movableTrait() { return MOVABLE_BREAKABLE; }
  setAttr(key: string, val: Value) {
    if (key === 'secure') {
      if (toBool(val) !== this.secure) {
        this.secure = toBool(val);
        if (this.isDisplayable()) this.init_model();
        return;
      }
    } else if (key === 'scratches') {
      const vs = toStr(val);
      let d = NODIRBIT;
      if (vs.includes('n')) d |= NORTHBIT;
      if (vs.includes('e')) d |= EASTBIT;
      if (vs.includes('s')) d |= SOUTHBIT;
      if (vs.includes('w')) d |= WESTBIT;
      this.scratches = d & this.getFaces();
      if (this.isDisplayable()) this.init_model();
      return;
    }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'secure') return this.secure;
    if (key === 'scratches') {
      let r = '';
      if (this.scratches & NORTHBIT) r += 'n';
      if (this.scratches & EASTBIT) r += 'e';
      if (this.scratches & SOUTHBIT) r += 's';
      if (this.scratches & WESTBIT) r += 'w';
      return r;
    }
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === 'inner_pull') return this.tryInnerPull(toInt(m.value), null);
    if (m.message === '_explosion') {
      const pv = toPosition(m.value);
      const expl = new GridPos(Math.floor(pv.x), Math.floor(pv.y));
      const faces = this.getFaces();
      const p = this.pos;
      for (const [bit, d] of [[WESTBIT, WEST], [SOUTHBIT, SOUTH], [EASTBIT, EAST], [NORTHBIT, NORTH]]) {
        if ((faces & bit) && (p.move(d).eq(expl) || p.eq(expl)) && (!this.secure || (this.scratches & bit))) this.breakFaces(bit);
      }
      return null;
    }
    return super.message(m);
  }
  externalState() { return 0; }
  setState(_s: number) {}
  getFaces(actorInvisible = false) { return !actorInvisible || this.secure ? super.getFaces(actorInvisible) : NODIRBIT; }
  init_model() {
    if (this.state !== IDLE) return;
    if (this.getFaces() === NODIRBIT) { KillStone(this.pos); return; }
    this.set_model(`st_window_${this.secure ? 'green' : 'blue'}${this.getFaces() & ~this.scratches}_${this.scratches}`);
  }
  animcb() {
    this.postFaceChange();
    if (this.state === FINALBREAK) KillStone(this.pos);
    else { this.state = IDLE; this.init_model(); }
  }
  allowsSpreading(d: number, _flood = false) { return d !== NODIR ? !hasDir(this.getFaces(), d) : true; }
  actor_hit(sc: StoneContact) {
    const a = sc.actor;
    if (this.state !== IDLE) return;
    const impulse = -(a.ai.vel.x * sc.normal.x + a.ai.vel.y * sc.normal.y) * a.ai.mass;
    let threshold = 22;
    if (wieldedItemIs(a, 'it_hammer')) threshold -= 7;
    if (this.scratches & sc.faces) threshold -= 10;
    if (impulse > 35 && !this.secure) SendMessage(a, '_shatter');
    else if (!this.secure && impulse > threshold) this.breakFaces(sc.faces);
    else if (wieldedItemIs(a, 'it_wrench')) {
      if (sc.faces === WESTBIT && sc.normal.x < 0) this.tryInnerPull(EAST, a);
      else if (sc.faces === EASTBIT && sc.normal.x > 0) this.tryInnerPull(WEST, a);
      else if (sc.faces === SOUTHBIT && sc.normal.y > 0) this.tryInnerPull(NORTH, a);
      else if (sc.faces === NORTHBIT && sc.normal.y < 0) this.tryInnerPull(SOUTH, a);
    } else if (wieldedItemIs(a, 'it_ring')) {
      this.scratches |= sc.faces & this.getFaces();
      this.sound_event('crack');
      this.init_model();
    }
  }
  is_sticky(_a: Actor) { return false; }
  on_move(_o: GridPos) { return true; }
  collision_response(sc: StoneContact) {
    const fw = 3.0 / 32.0;
    if (!this.secure && sc.actor.is_invisible()) return STONE_PASS;
    const f = this.getFaces(), p = this.pos, c = sc.contact_point;
    if ((c.x <= p.x + fw && (f & WESTBIT)) || (c.x >= p.x + 1 - fw && (f & EASTBIT)) ||
      (c.y <= p.y + fw && (f & NORTHBIT)) || (c.y >= p.y + 1 - fw && (f & SOUTHBIT))) return STONE_REBOUND;
    return STONE_PASS;
  }
  private breakFaces(faces: number) {
    const remaining = this.getFaces() & ~faces;
    this.scratches &= ~faces;
    this.objectSetAttr('$connections', ALL_DIRECTIONS ^ remaining);
    this.sound_event('shatter');
    this.state = remaining === NODIRBIT ? FINALBREAK : BREAK;
    this.set_anim(`st_window_${this.secure ? 'green' : 'blue'}${this.getFaces() & ~this.scratches}_${this.scratches}_anim`);
  }
  private tryInnerPull(dir: number, initiator: Actor | null): boolean {
    const eps = 3.0 / 32;
    const faces = this.getFaces();
    const wp = this.pos, wn = wp.move(dir);
    if (hasDir(faces, dir) || !hasDir(faces, reverseDir(dir))) return false;
    const stone = GetStone(wn);
    if (stone && !(stone.getClass() === 'st_window' && !hasDir(stone.getFaces(), reverseDir(dir)))) return false;
    const remaining = (faces & ~toBits(reverseDir(dir))) | toBits(dir);
    this.objectSetAttr('$connections', ALL_DIRECTIONS ^ remaining);
    if (this.scratches & toBits(reverseDir(dir))) this.scratches |= toBits(dir);
    this.scratches &= ~toBits(reverseDir(dir));
    this.init_model();
    const it = GetItem(wp), itn = GetItem(wn);
    if (it && !it.isStatic()) { if (!itn) SetItem(wn, YieldItem(wp)); else SetItem(wp, MakeItem('it_squashed')); }
    const blocks = (o: Stone | null, a: Actor, face: number) => o !== null && ((o.getClass() === 'st_window' && hasDir(o.getFaces(), face)) || o.is_sticky(a));
    for (const a of GetActorsInRange(wp.center(), 1.415 + Actor.max_radius)) {
      if (a === initiator) continue;
      let dx = a.ai.pos.x, dy = a.ai.pos.y;
      const ap = GridPos.of(a.ai.pos), r = a.ai.radius;
      if (ap.eq(wp) || (dir === EAST && dx - r < wp.x + 1 && ap.eq(wn)) || (dir === WEST && dx + r > wp.x && ap.eq(wn)) ||
        (dir === SOUTH && dy - r < wp.y + 1 && ap.eq(wn)) || (dir === NORTH && dy + r > wp.y && ap.eq(wn))) {
        if (dir === EAST || dir === WEST) {
          dx = dir === EAST ? wp.x + 1 + r : wp.x - r;
          if (stone && hasDir(stone.getFaces(), NORTH)) dy = Math.max(dy, wp.y + r + eps);
          else if (blocks(GetStone(wn.move(NORTH)), a, SOUTH)) dy = Math.max(dy, wp.y + r);
          if (stone && hasDir(stone.getFaces(), SOUTH)) dy = Math.min(dy, wp.y + 1 - r - eps);
          else if (blocks(GetStone(wn.move(SOUTH)), a, NORTH)) dy = Math.min(dy, wp.y + 1 - r);
        } else {
          dy = dir === SOUTH ? wp.y + 1 + r : dir === NORTH ? wp.y - r : dy;
          if (stone && hasDir(stone.getFaces(), WEST)) dx = Math.max(dx, wp.x + r + eps);
          else if (blocks(GetStone(wn.move(WEST)), a, EAST)) dx = Math.max(dx, wp.x + r);
          if (stone && hasDir(stone.getFaces(), EAST)) dx = Math.min(dx, wp.x + 1 - r - eps);
          else if (blocks(GetStone(wn.move(EAST)), a, WEST)) dx = Math.min(dx, wp.x + 1 - r);
        }
        WarpActor(a, dx, dy, true);
      }
    }
    TouchStone(this.pos);
    this.postFaceChange();
    return true;
  }
  private postFaceChange() {
    SendMessage(GetFloor(this.pos), '_checkflood');
    for (let d = NORTH; d !== NODIR; d--) SendMessage(GetFloor(this.pos.move(d)), '_checkflood');
  }
}
for (const f of ['w', 's', 'sw', 'e', 'ew', 'es', 'esw', 'n', 'nw', 'ns', 'nsw', 'ne', 'new', 'nes', 'nesw']) Register(`st_window_${f}`, new WindowStone(f));
Register('st_window', new WindowStone('s'));
