// Objects: items/WormHole.cc, Sensor.cc, Umbrella.cc; stones/BoulderStone.cc, FourSwitch.cc, and the
// st_blur stones of SimpleStones.cc.
import {
  Item, Stone, Register, server, GameTimer, GetStone, GetFloor, KillStone, SendMessage, BroadcastMessage, WarpActor,
  display, world, toInt, toBool, toDouble, toStr, reverseDir, objValue, valueEquals, XLevelRuntime, V2,
  itf_static, itf_indestructible, itf_invisible, MOVABLE_IRREGULAR, ITEM_KEEP, ITEM_KILL, NORTH, EAST, SOUTH, WEST, NODIR,
  type GridPos, type Message, type Value, type Actor, type StoneContact, type Impulse, type TimeHandler, type ItemTraits,
} from '../core.ts';
import { destinationByIndex, wieldedItemIs } from './stones2.ts';
import { updateCurrentLightDirs } from './laser.ts';

const rotateCw = (d: number) => [3, 0, 1, 2][d];
const rotateCcw = (d: number) => [1, 2, 3, 0][d];
const SUFFIX = ['_w', '_s', '_e', '_n'];

// ----- wormholes
class WormHole extends Item implements TimeHandler {
  strength = 0.6 * 30; sqRange = 1000 * 1000;
  constructor(on: boolean) { super(); this.state = on ? 1 : 0; }
  traits(): ItemTraits { return { name: this.state % 2 === 1 ? 'it_wormhole_on' : 'it_wormhole_off', flags: itf_static | itf_indestructible, radius: 0 }; }
  getClass() { return 'it_wormhole'; }
  setAttr(key: string, val: Value) {
    if (key === 'range') { const r = val === null ? server.WormholeRange : toDouble(val); this.sqRange = r * r; }
    else if (key === 'strength') this.strength = 0.6 * (val === null ? server.WormholeForce : toDouble(val));
    super.setAttr(key, val);
  }
  message(m: Message): Value {
    if (m.message === '_updateglobals' && toStr(m.value) === 'it_wormhole') { this.globals(); return null; }
    return super.message(m);
  }
  private globals() {
    if (this.getAttr('range') === undefined) this.sqRange = server.WormholeRange * server.WormholeRange;
    if (this.getAttr('strength') === undefined) this.strength = 0.6 * server.WormholeForce;
  }
  externalState() { return this.state % 2; }
  setState(s: number) {
    if (s !== this.state % 2) {
      this.state = (this.state & ~1) + s;
      if (this.isDisplayable()) { if (s === 1) world.forces.push(this); else this.removeForce(); }
    }
  }
  private removeForce() { const i = world.forces.indexOf(this); if (i >= 0) world.forces.splice(i, 1); }
  on_creation(p: GridPos) {
    super.on_creation(p);
    this.globals();
    if (this.state % 2 === 1) world.forces.push(this);
  }
  on_removal(p: GridPos) {
    GameTimer.remove_alarm(this);
    this.state &= ~2;
    if (this.state % 2 === 1) this.removeForce();
    super.on_removal(p);
  }
  init_model() { if ((this.state & 3) === 1) this.set_anim('it_wormhole'); else this.set_model('it_wormhole_off'); }
  actor_hit(a: Actor) {
    if ((this.state & 4) !== 0) throw new XLevelRuntime('WormHole:: Recursion detected!');
    const c = this.pos.center();
    if ((this.state & 2) === 0 && (a.ai.pos.x - c.x) ** 2 + (a.ai.pos.y - c.y) ** 2 < 0.015625) {
      const t = destinationByIndexV(this, 0);
      if (t) {
        display.sparkle(c);
        this.sound_event('warp');
        const lat = toDouble(this.getAttr('interval'));
        if (lat > 0) { this.state |= 2; GameTimer.set_alarm(this, lat, false); this.init_model(); }
        this.state |= 4;
        if (toBool(this.getAttr('scissor'))) SendMessage(a, 'disconnect');
        WarpActor(a, t.x, t.y, false);
        this.state &= ~4;
      }
    }
    return false;
  }
  globalForce(a: Actor): V2 {
    const c = this.pos.center();
    const dx = c.x - a.ai.pos_force.x, dy = c.y - a.ai.pos_force.y;
    const sq = dx * dx + dy * dy;
    return sq >= 0.025 && sq < this.sqRange ? new V2(this.strength / sq * dx, this.strength / sq * dy) : new V2();
  }
  tick(_dt: number) {}
  alarm() { this.state &= ~2; this.init_model(); }
}
/** getDestinationByIndex: the centered position (actors land in the middle of the field) */
export function destinationByIndexV(o: Item | Stone, idx: number): V2 | null {
  const g = destinationByIndex(o as Stone, idx);
  if (!g) return null;
  // destinationByIndex gives the grid position of a centered position; recompute the exact point
  let i = 0;
  for (const t of tokenList(o)) {
    for (const p of posList(t, o)) {
      const cp = centered(p);
      if (cp.x >= 0 && cp.y >= 0 && cp.x < world.w && cp.y < world.h) { if (i === idx) return cp; i++; }
    }
  }
  return null;
}
import { toTokenList, getPositionList, centeredPos } from '../core.ts';
const tokenList = (o: Item | Stone) => toTokenList(o.getAttr('destination'));
const posList = (t: Value, o: Item | Stone) => getPositionList(t, o);
const centered = (p: Value) => centeredPos(p);
Register('it_wormhole', new WormHole(true)); Register('it_wormhole_off', new WormHole(false)); Register('it_wormhole_on', new WormHole(true));

// ----- sensors
class Sensor extends Item {
  filter: boolean; exit: boolean; invisible: boolean;
  constructor(inverse: boolean, filter = false, exit = false) {
    super();
    this.objectSetAttr('inverse', inverse);
    this.filter = filter; this.invisible = filter; this.exit = exit;
  }
  traits(): ItemTraits {
    let idx = toBool(this.getAttr('inverse')) ? 1 : 0;
    if (this.filter) idx += 2;
    if (this.exit) idx = 4;
    const names = ['it_sensor', 'it_sensor_inverse', 'it_sensor_filter1', 'it_sensor_filter0', 'it_sensor_exit'];
    return { name: names[idx], flags: itf_static | itf_indestructible | (idx === 2 || idx === 3 ? itf_invisible : 0), radius: 0 };
  }
  getClass() { return 'it_sensor'; }
  message(m: Message): Value {
    if (m.message === '_hit') { this.setAttr('$hitactor', m.value); this.performAction(true); this.setAttr('$hitactor', objValue(null)); return null; }
    if (m.message === '_hitactor') return this.getAttr('$hitactor');
    if (m.message === '_glasses') { if (this.isDisplayable()) this.init_model(); }
    else if (m.message === 'signal' && this.filter) { if (toInt(m.value) === 1) this.performAction(true); return null; }
    return super.message(m);
  }
  setAttr(key: string, val: Value) {
    if (key === 'invisible') { this.invisible = toBool(val); if (this.isDisplayable()) this.init_model(); return; }
    if (key === 'exit') { this.exit = toBool(val); if (this.isDisplayable()) this.init_model(); return; }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'invisible') return this.invisible;
    if (key === 'exit') return this.exit;
    return super.getAttr(key);
  }
  init_model() {
    if (this.invisible && (server.GlassesVisibility & 8) === 0) this.set_model('invisible');
    else this.set_model(this.exit ? 'it_sensor_exit' : 'it_sensor');
  }
  actor_enter(a: Actor) {
    if (!this.exit && !a.is_dead()) { if (!this.invisible) this.set_anim('it_sensor_hit'); this.performAction(objValue(a)); }
  }
  actor_leave(a: Actor) {
    if (this.exit && !a.is_dead()) { if (!this.invisible) this.set_anim('it_sensor_exit_hit'); this.performAction(objValue(a)); }
  }
  animcb() { this.init_model(); }
}
Register('it_sensor', new Sensor(false)); Register('it_sensor_inverse', new Sensor(true)); Register('it_sensor_filter1', new Sensor(false, true));
Register('it_sensor_filter0', new Sensor(true, true)); Register('it_sensor_exit', new Sensor(false, false, true));

// ----- umbrella
class Umbrella extends Item implements TimeHandler {
  isNew: boolean;
  constructor(n: boolean) { super(); this.isNew = n; }
  traits(): ItemTraits { return { name: 'it_umbrella', flags: 0, radius: 0 }; }
  on_creation(p: GridPos) { if (this.isNew) GameTimer.set_alarm(this, 0.2, false); else this.activatePhoto(); super.on_creation(p); }
  on_removal(p: GridPos) { GameTimer.remove_alarm(this); this.isNew = false; super.on_removal(p); }
  lightDirChanged(o: number, n: number) { if ((n & ~o) !== 0) { this.sound_event('itemtransform'); this.replace('it_explosion_nil'); } }
  activate(a: Actor, _p: GridPos) {
    if (a.isMoribund()) return ITEM_KEEP;
    BroadcastMessage('_shield', a.getAttr('owner'), false, false, false, true);
    return ITEM_KILL;
  }
  alarm() { this.isNew = false; updateCurrentLightDirs(this); this.activatePhoto(); }
  dispose() { GameTimer.remove_alarm(this); super.dispose(); }
}
Register('it_umbrella', new Umbrella(false)); Register('it_umbrella_new', new Umbrella(true));

// ----- boulders
const B_INIT = 0, B_IDLE = 1, B_ACTIVE = 2, B_FALLING = 3;
class BoulderStone extends Stone {
  constructor(dir = NORTH) { super(); this.state = B_INIT; this.objectSetAttr('orientation', dir); }
  getClass() { return 'st_boulder'; }
  movableTrait() { return MOVABLE_IRREGULAR; }
  setAttr(key: string, val: Value) {
    if (key === 'orientation') { if (this.isDisplayable()) this.setDir(toInt(val)); else this.objectSetAttr(key, val); return; }
    super.setAttr(key, val);
  }
  message(m: Message): Value {
    if (m.message === 'orientate' && this.state !== B_FALLING && this.isDisplayable()) { this.setDir(toInt(m.value)); return null; }
    if ((m.message === 'turn' || m.message === 'turnback') && this.state !== B_FALLING && this.isDisplayable()) {
      const cc = toBool(this.getAttr('counterclock'));
      this.setDir((m.message === 'turn' && !cc) || (m.message === 'turnback' && cc) ? rotateCw(this.dir()) : rotateCcw(this.dir()));
      return null;
    }
    if (m.message === 'flip' && this.state !== B_FALLING && this.isDisplayable()) { this.setDir(reverseDir(this.dir())); return null; }
    if (m.message === '_model_reanimated') this.state = B_IDLE;
    return super.message(m);
  }
  externalState() { return 0; }
  setState(_s: number) {}
  on_creation(p: GridPos) { updateCurrentLightDirs(this); this.activatePhoto(); super.on_creation(p); }
  init_model() { this.set_anim('st_boulder' + SUFFIX[this.dir()] + (this.state === B_FALLING ? '_fall_anim' : '')); }
  animcb() {
    const m = this.get_model();
    const d = this.dir();
    switch (this.state) {
      case B_FALLING: KillStone(this.pos); break;
      case B_INIT:
        this.state = B_IDLE;
        if (!this.obstacle(d)) { this.move_stone_dir(d); this.init_model(); } else m?.restart();
        break;
      case B_IDLE:
        if (!this.obstacle(d)) this.state = B_ACTIVE;
        m?.restart();
        break;
      case B_ACTIVE:
        this.trigger(d, false);
        if (!this.move_stone_dir(d)) this.state = B_IDLE;
        this.init_model();
        break;
    }
  }
  lightDirChanged(o: number, n: number) { if ((n & ~o) !== 0) this.setDir(reverseDir(this.dir())); }
  actor_hit(sc: StoneContact) {
    if (this.state === B_FALLING) return;
    if (wieldedItemIs(sc.actor, 'it_magicwand')) this.setDir(reverseDir(this.dir()));
  }
  on_floor_change() { const fl = GetFloor(this.pos); if (fl && fl.getClass() === 'fl_abyss') { this.state = B_FALLING; this.init_model(); } }
  on_move(o: GridPos) {
    this.state = B_ACTIVE;
    this.trigger(this.dir(), true);
    return super.on_move(o);
  }
  on_impulse(imp: Impulse) {
    if (this.state === B_FALLING) return;
    if (imp.sender && imp.sender.getClass() === 'st_rotator') this.setDir(imp.dir);
    this.move_stone_dir(imp.dir);
    this.propagateImpulse(imp);
  }
  dir() { return toInt(this.getAttr('orientation')); }
  setDir(d: number) {
    if (d !== this.dir() && this.state !== B_FALLING) {
      this.objectSetAttr('orientation', d);
      this.state = B_ACTIVE;
      this.trigger(this.dir(), true);
      this.init_model();
    }
  }
  obstacle(d: number) { return GetStone(this.pos.move(d)) !== null; }
  trigger(d: number, raising: boolean) { const st = GetStone(this.pos.move(d)); if (st) SendMessage(st, '_trigger', raising, this); }
}
Register('st_boulder', new BoulderStone()); Register('st_boulder_n', new BoulderStone(NORTH)); Register('st_boulder_e', new BoulderStone(EAST));
Register('st_boulder_s', new BoulderStone(SOUTH)); Register('st_boulder_w', new BoulderStone(WEST));

// ----- four switch
class FourSwitch extends Stone {
  inactiveSoFar = true;
  constructor() { super(); this.state = NORTH; }
  getClass() { return 'st_fourswitch'; }
  message(m: Message): Value {
    if (m.message === 'signal') { if (toInt(m.value) % 2 === 1 || server.EnigmaCompatibility < 1.10) this.turn(); return null; }
    if (m.message === '_trigger') { if (!toBool(m.value)) this.turn(); return null; }
    return super.message(m);
  }
  invertActionValue(v: Value): Value { return typeof v === 'number' ? 3 - toInt(v) : !toBool(v); }
  maxState() { return 3; }
  toggleState() { this.turn(); }
  setState(s: number) { this.turn((this.state - s + 4) % 4, true); }
  init_model() { this.set_model('st_fourswitch' + SUFFIX[this.state]); }
  actor_hit(_sc: StoneContact) { this.turn(); }
  collision_sound() { return 'metal'; }
  turn(num = 1, fixedCw = false) {
    if (num === 0) return;
    const global = this.getAttr('target') !== undefined;
    if (this.isDisplayable()) {
      if (!this.inactiveSoFar && !global) this.performAction(false);
      else this.inactiveSoFar = false;
    }
    const cw = !toBool(this.getDefaultedAttr('counterclock', false));
    for (let i = 0; i < num; i++) this.state = cw || fixedCw ? rotateCw(this.state) : rotateCcw(this.state);
    if (this.isDisplayable()) {
      this.init_model();
      this.sound_event('fourswitch');
      if (global) this.performAction(server.EnigmaCompatibility < 1.10 ? this.state % 2 === 0 : this.state);
      else this.performAction(true);
    }
  }
}
Register('st_fourswitch', new FourSwitch());

// ----- blur stones (SimpleStones.cc)
class BlurStone extends Stone {
  constructor(t: number) { super(); this.state = t; }
  getClass() { return 'st_blur'; }
  setAttr(key: string, val: Value) {
    if (key === 'flavor') {
      const f = toStr(val);
      if (f === 'straight') this.state = 0; else if (f === 'cross') this.state = 1; else if (f === 'magic') this.state = 2;
      else throw new XLevelRuntime(`Blur stone set known flavor${f}`);
      if (this.isDisplayable()) this.init_model();
      return;
    }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value { return key === 'flavor' ? ['straight', 'cross', 'magic'][this.state] : super.getAttr(key); }
  setState(_s: number) {}
  init_model() { this.set_model(this.state === 0 ? 'st_blur_straight' : 'st_blur_cross'); }
  actor_hit(sc: StoneContact) {
    const c = sc.actor.getAttr('color');
    if (this.state !== 2 || wieldedItemIs(sc.actor, 'it_magicwand') || wieldedItemIs(sc.actor, 'it_brush')) {
      if (c !== undefined && ((this.state === 0 && valueEquals(c, 1)) || (this.state >= 1 && valueEquals(c, 0)))) { this.sound_event('yinyang'); this.transform('st_passage_white_square'); }
      else if (c !== undefined && ((this.state === 0 && valueEquals(c, 0)) || (this.state >= 1 && valueEquals(c, 1)))) { this.sound_event('yinyang'); this.transform('st_passage_black_square'); }
    }
  }
}
Register('st_blur', new BlurStone(0)); Register('st_blur_straight', new BlurStone(0)); Register('st_blur_cross', new BlurStone(1)); Register('st_blur_magic', new BlurStone(2));
export const _keep = [NODIR];
