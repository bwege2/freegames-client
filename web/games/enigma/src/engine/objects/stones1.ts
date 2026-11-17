// Stones: stones/StandardStones.cc, GlassStones.cc, GreenBrownStone.cc, SimpleStones.cc, DeathStone.cc,
// Door.cc, Switch.cc, BoxStone.cc.
import {
  Stone, Register, server, player, toStr, toBool, toInt, toDouble, GameTimer, GetFloor, GetItem, GetStone, SendMessage,
  KillStone, MakeFloor, SetFloor, IntegerRand, DoubleRand, ShatterActorsInsideField, NORTH, NODIR, WEST, EAST, SOUTH,
  ALL_DIRECTIONS, WESTBIT, EASTBIT, toBits, reverseDir, lightHooks, STONE_PASS, STONE_REBOUND, MOVABLE_PERSISTENT,
  MOVABLE_STANDARD, GameObject, IsLevelBorder, objValue, display, host, getObjectList, XLevelRuntime,
  type GridPos, type Message, type Value, type Actor, type StoneContact, type TimeHandler,
} from '../core.ts';

const HOLLOW_GLASSES = 2; // Glasses::HOLLOW (items/GlassesItem.hh)

/** stones with a hollow variant that glasses can make invisible */
abstract class HollowCapable extends Stone {
  hollow = false; movable = false; cloth = false; glasses = false;
  getAttr(key: string): Value {
    if (key === 'movable') return this.movable;
    if (key === 'hollow') return this.hollow;
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (this.hollow && m.message === '_glasses') {
      if (((toInt(m.value) & HOLLOW_GLASSES) !== 0) !== this.glasses) {
        this.glasses = !this.glasses;
        if (this.isDisplayable()) this.init_model();
      }
      return null;
    }
    return super.message(m);
  }
  setState(_s: number) {}
  is_floating() { return this.hollow; }
  collision_response(sc: StoneContact) { return this.hollow ? STONE_PASS : super.collision_response(sc); }
  collision_sound() { return this.cloth ? 'cloth' : 'stone'; }
}

const STD: [string, number][] = [
  ['st_granite', MOVABLE_PERSISTENT], ['st_granite', MOVABLE_STANDARD], ['st_darkgray', MOVABLE_PERSISTENT],
  ['st_purplemarble', MOVABLE_PERSISTENT], ['st_tigris', MOVABLE_PERSISTENT], ['st_purplegray', MOVABLE_PERSISTENT],
  ['st_greengray', MOVABLE_PERSISTENT], ['st_concrete', MOVABLE_PERSISTENT], ['st_ancient', MOVABLE_PERSISTENT],
  ['st_brownmarble', MOVABLE_PERSISTENT], ['st_redmarble', MOVABLE_PERSISTENT], ['st_bluegray', MOVABLE_PERSISTENT],
  ['st_brownie', MOVABLE_STANDARD], ['st_pinkbumps', MOVABLE_PERSISTENT], ['st_camouflage', MOVABLE_PERSISTENT],
  ['st_camouflage', MOVABLE_STANDARD], ['st_redbrown', MOVABLE_PERSISTENT], ['st_redbrown', MOVABLE_STANDARD],
  ['st_metal', MOVABLE_PERSISTENT], ['st_redrock', MOVABLE_PERSISTENT], ['st_woven', MOVABLE_PERSISTENT],
  ['st_yellow', MOVABLE_PERSISTENT], ['st_invisible', MOVABLE_PERSISTENT], ['st_invisible', MOVABLE_STANDARD],
];
class StandardStone extends HollowCapable {
  constructor(type: number, hollow: boolean, movable: boolean, cloth = false) {
    super(); this.state = type; this.hollow = hollow; this.movable = movable; this.cloth = cloth;
  }
  getClass() { return STD[this.state][0]; }
  movableTrait() { return STD[this.state][1]; }
  init_model() { this.set_model(this.glasses ? 'invisible' : this.getClass()); }
}
for (const [n, t, h, m, c] of [
  ['st_granite', 0, false, false], ['st_granite_hollow', 0, true, false], ['st_granite_movable', 1, false, true],
  ['st_darkgray', 2, false, false], ['st_darkgray_hollow', 2, true, false], ['st_purplemarble', 3, false, false],
  ['st_tigris', 4, false, false], ['st_purplegray', 5, false, false], ['st_greengray', 6, false, false],
  ['st_concrete', 7, false, false], ['st_ancient', 8, false, false], ['st_brownmarble', 9, false, false],
  ['st_redmarble', 10, false, false], ['st_bluegray', 11, false, false], ['st_bluegray_hollow', 11, true, false],
  ['st_brownie', 12, false, true, true], ['st_pinkbumps', 13, false, false], ['st_camouflage', 14, false, false, true],
  ['st_camouflage_hollow', 14, true, false], ['st_camouflage_movable', 15, false, true, true], ['st_redbrown', 16, false, false],
  ['st_redbrown_hollow', 16, true, false], ['st_redbrown_movable', 17, false, true], ['st_metal', 18, false, false],
  ['st_metal_hollow', 18, true, false], ['st_redrock', 19, false, false], ['st_woven', 20, false, false],
  ['st_yellow', 21, false, false], ['st_invisible', 22, false, false], ['st_invisible_hollow', 22, true, false],
  ['st_invisible_movable', 23, false, true],
] as [string, number, boolean, boolean, boolean?][]) Register(n, new StandardStone(t, h, m, c ?? false));

// glass
const GLASS: [string, number][] = [['st_rawglass', MOVABLE_PERSISTENT], ['st_rawglass', MOVABLE_STANDARD], ['st_lightglass', MOVABLE_PERSISTENT],
  ['st_lightglass', MOVABLE_STANDARD], ['st_darkglass', MOVABLE_PERSISTENT], ['st_darkglass', MOVABLE_STANDARD], ['st_redfiber', MOVABLE_PERSISTENT],
  ['st_beads', MOVABLE_PERSISTENT]];
const LIGHT_MOVABLE = 3, DARK = 4, DARK_MOVABLE = 5, RED = 6, BEADS = 7;
class GlassStone extends HollowCapable {
  quad: boolean;
  constructor(type: number, hollow: boolean, movable: boolean, quad = false) { super(); this.state = type; this.hollow = hollow; this.movable = movable; this.quad = quad; }
  getClass() { return GLASS[this.state][0]; }
  movableTrait() { return GLASS[this.state][1]; }
  init_model() { this.set_model(this.glasses ? 'invisible' : this.getClass() + (this.quad ? '_quad' : '')); }
  is_sticky(a: Actor) { return !this.is_floating() && !a.is_invisible() && this.state !== BEADS; }
  is_transparent(_d: number) { return this.hollow || (this.state !== BEADS && this.state !== DARK); }
  collision_response(sc: StoneContact) {
    if (this.hollow || (sc.actor.is_invisible() && this.state !== LIGHT_MOVABLE && this.state !== DARK_MOVABLE && this.state !== RED)) return STONE_PASS;
    return STONE_REBOUND;
  }
}
for (const [n, t, h, m, q] of [['st_rawglass', 0, false, false], ['st_rawglass_quad', 0, false, false, true], ['st_rawglass_movable', 1, false, true],
  ['st_lightglass', 2, false, false], ['st_lightglass_hollow', 2, true, false], ['st_lightglass_movable', 3, false, true],
  ['st_darkglass', 4, false, false], ['st_darkglass_hollow', 4, true, false], ['st_darkglass_movable', 5, false, true],
  ['st_redfiber', 6, false, false], ['st_beads', 7, false, false]] as [string, number, boolean, boolean, boolean?][]) Register(n, new GlassStone(t, h, m, q ?? false));

// greenbrown
const GROWING_STATE = 1;
class GreenBrownStone extends HollowCapable {
  constructor(hollow: boolean, movable: boolean, initState = 0) { super(); this.state = initState; this.hollow = hollow; this.movable = movable; this.cloth = movable; }
  getClass() { return 'st_greenbrown'; }
  movableTrait() { return this.movable ? MOVABLE_STANDARD : MOVABLE_PERSISTENT; }
  init_model() {
    if (this.glasses) this.set_model('invisible');
    else if (this.state === GROWING_STATE) this.set_anim('st_greenbrown_growing');
    else this.set_model(this.getClass());
  }
  animcb() { this.state = 0; this.init_model(); }
  actor_hit(sc: StoneContact) { if (this.state === GROWING_STATE) SendMessage(sc.actor, '_shatter'); else super.actor_hit(sc); }
  actor_inside(a: Actor) { if (this.state === GROWING_STATE) SendMessage(a, '_shatter'); }
  actor_contact(a: Actor) { if (this.state === GROWING_STATE) SendMessage(a, '_shatter'); }
}
Register('st_greenbrown', new GreenBrownStone(false, false));
Register('st_greenbrown_hollow', new GreenBrownStone(true, false));
Register('st_greenbrown_movable', new GreenBrownStone(false, true));
Register('st_greenbrown_growing', new GreenBrownStone(false, false, 1));

// simple stones
class GrateStone extends Stone {
  constructor(t: number) { super(); this.state = t; }
  getClass() { return 'st_grate'; }
  setAttr(key: string, val: Value) {
    if (key === 'flavor') {
      const f = toStr(val);
      if (f === 'cross') this.state = 0; else if (f === 'framed') this.state = 1;
      else throw new XLevelRuntime(`Grate stone set known flavor${f}`);
      if (this.isDisplayable()) this.init_model();
      return;
    }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value { return key === 'flavor' ? (this.state === 0 ? 'cross' : 'framed') : super.getAttr(key); }
  setState(_s: number) {}
  init_model() { this.set_model(this.state === 0 ? 'st_grate_cross' : 'st_grate_framed'); }
  is_floating() { return true; }
  is_transparent() { return true; }
  collision_response(sc: StoneContact) { return sc.actor.is_on_floor() ? STONE_PASS : STONE_REBOUND; }
}
Register('st_grate', new GrateStone(0));
Register('st_grate_cross', new GrateStone(0));
Register('st_grate_framed', new GrateStone(1));

class BrownPyramid extends Stone {
  getClass() { return 'st_brownpyramid'; }
  message(m: Message): Value { if (m.message === '_cannonball') { KillStone(this.pos); return null; } return super.message(m); }
}
Register('st_brownpyramid', new BrownPyramid());

class ChargeStone extends Stone {
  constructor(c: number) { super(); this.objectSetAttr('charge', c); }
  getClass() { return 'st_charge'; }
  setAttr(key: string, val: Value) { super.setAttr(key, val); if (key === 'charge' && this.isDisplayable()) this.init_model(); }
  getAttr(key: string): Value {
    if (key === '$chargesign') { const c = toDouble(this.getAttr('charge')); return c === 0 ? 0 : c > 0 ? 1 : -1; }
    return super.getAttr(key);
  }
  private sign() { const c = toDouble(this.getAttr('charge')); return c === 0 ? 'zero' : c > 0 ? 'plus' : 'minus'; }
  init_model() { this.set_model('st_charge_' + this.sign()); }
  animcb() { this.init_model(); }
  actor_hit(sc: StoneContact) { sc.actor.setAttr('charge', toDouble(this.getAttr('charge'))); this.set_anim(`st_charge_${this.sign()}_anim`); }
}
Register('st_charge', new ChargeStone(0)); Register('st_charge_zero', new ChargeStone(0));
Register('st_charge_plus', new ChargeStone(1)); Register('st_charge_minus', new ChargeStone(-1));

class PlopStone extends Stone {
  getClass() { return 'st_plop'; }
  movableTrait() { return MOVABLE_STANDARD; }
  init_model() { this.set_model('st_plop_slate'); }
  on_floor_change() {
    const fl = GetFloor(this.pos);
    if (fl) {
      const k = fl.getClass();
      if (k === 'fl_water' || k === 'fl_abyss' || k === 'fl_swamp') {
        this.sound_event('drown');
        display.sparkle(this.pos.center());
        KillStone(this.pos);
      }
    }
  }
}
Register('st_plop', new PlopStone()); Register('st_plop_slate', new PlopStone());

class YinyangStone extends Stone {
  constructor(s: number, instant = false) { super(); this.state = s; if (instant) this.setAttr('instant', true); }
  getClass() { return 'st_yinyang'; }
  message(m: Message): Value {
    if (m.message === '_cannonball') { this.hit(); return null; }
    return super.message(m);
  }
  maxState() { return 2; }
  toggleState() { if (this.state === 0) this.setState(1); }
  setState(s: number) {
    if (!this.isDisplayable()) this.state = s;
    else if (this.state === 0) { this.state = s; this.init_model(); }
  }
  init_model() {
    if (this.state === 0) this.set_model('st_yinyang');
    else if (this.state === 2) this.set_model('st_yinyang_inactive');
    else this.set_anim('st_yinyang-anim');
  }
  animcb() {
    this.state = toBool(this.getAttr('loop')) ? 0 : 2;
    this.init_model();
    if (!toBool(this.getAttr('instant'))) this.switchPlayer();
  }
  private hit() {
    if (this.state === 0) { this.state = 1; this.init_model(); if (toBool(this.getAttr('instant'))) this.switchPlayer(); }
  }
  actor_hit(_sc: StoneContact) { this.hit(); }
  switchPlayer() {
    if (player.numberOfRealPlayers() >= 2) player.setCurrent(1 - player.current);
    const c = this.pos.center();
    host.sound('switchplayer', c.x, c.y, 1);
    this.performAction(true);
  }
}
Register('st_yinyang', new YinyangStone(0)); Register('st_yinyang_instant', new YinyangStone(0, true));
Register('st_yinyang_active', new YinyangStone(1)); Register('st_yinyang_inactive', new YinyangStone(2));

class DocumentStone extends Stone {
  name0: string;
  constructor(n = 'st_document') { super(); this.name0 = n; }
  getClass() { return this.name0; }
  message(m: Message): Value {
    if ((this.name0 === 'st_document' && m.message === '_scissors') || (this.name0 === 'st_pebble' && m.message === '_paper')) this.doBreak();
    return super.message(m);
  }
  init_model() { if (this.state === 2) this.set_anim(this.name0 + '_breaking'); else this.set_model(this.name0); }
  animcb() { KillStone(this.pos); }
  actor_hit(_sc: StoneContact) {
    if (this.state !== 0) return;
    const msg = this.name0 === 'st_document' ? '_paper' : '_pebble';
    if (this.name0 === 'st_document') {
      const v = this.getAttr('text');
      if (v !== undefined) host.showText(levelText(toStr(v)));
    }
    for (let i = WEST; i <= NORTH; i++) { const st = GetStone(this.pos.move(i)); if (st) SendMessage(st, msg); }
    for (const f of getObjectList(this.getAttr('fellows'), null)) if (f instanceof Stone) SendMessage(f, msg);
  }
  doBreak() { if (this.state === 0) { this.state = 2; this.sound_event('stonedestroy'); this.init_model(); } }
}
Register('st_document', new DocumentStone());
Register('st_pebble', new DocumentStone('st_pebble'));

/** the level's localized strings (it_document, st_document); set by the level session */
export const textSource = { get: (key: string) => key };
export function levelText(key: string) { return textSource.get(key); }

// death
class DeathStone extends Stone implements TimeHandler {
  invisible: boolean; movable: boolean;
  constructor(inv: boolean, mov = false) { super(); this.invisible = inv; this.movable = mov; }
  getClass() { return 'st_death'; }
  movableTrait() { return this.invisible ? MOVABLE_PERSISTENT : this.movable ? MOVABLE_STANDARD : MOVABLE_PERSISTENT; }
  is_movable() { return this.movableTrait() >= MOVABLE_STANDARD; }
  dispose() { GameTimer.remove_alarm(this); super.dispose(); }
  setAttr(key: string, val: Value) {
    if (key === 'invisible') {
      if (toBool(val) !== this.invisible) { this.invisible = !this.invisible; if (this.isDisplayable()) this.init_model(); }
      if (this.invisible) this.movable = false;
    } else if (key === 'movable') {
      GameTimer.remove_alarm(this);
      if (toBool(val)) { this.movable = true; this.invisible = false; if (this.isDisplayable()) this.setAlarm(); }
      else this.movable = false;
      if (this.isDisplayable()) this.init_model();
    } else super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'invisible') return this.invisible;
    if (key === 'movable') return this.movable;
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === '_model_reanimated') { this.state = 0; this.init_model(); }
    else if (m.message === '_glasses') { if (this.state === 0) this.init_model(); return null; }
    else if (m.message === '_trigger' && !toBool(m.value) && this.movable) {
      if (m.sender && 'pos' in m.sender) {
        const sp = (m.sender as Stone).pos;
        const d = dirFromTo(sp, this.pos);
        if (d !== NODIR) this.move_stone_dir(d);
      }
      return null;
    }
    return super.message(m);
  }
  setState(s: number) { if (this.state === 0 && s === 1 && this.isDisplayable()) { this.state = 1; this.set_anim('st-death-anim'); } }
  init_model() {
    const gv = server.GlassesVisibility & 2; // Glasses::DEATH
    if (this.state === 0) {
      if (this.invisible && gv === 0) this.set_model('invisible');
      else if (this.movable && gv !== 0) this.set_model('st_death_light');
      else this.set_model('st_death');
    } else if (this.movable && gv !== 0) this.set_anim('st_death_light-anim');
    else this.set_anim('st_death-anim');
  }
  on_creation(p: GridPos) { if (this.movable) this.setAlarm(); super.on_creation(p); }
  on_removal(p: GridPos) { if (this.movable) GameTimer.remove_alarm(this); super.on_removal(p); }
  animcb() { if (this.state === 1) { this.state = 0; this.init_model(); } }
  actor_hit(sc: StoneContact) { this.actor_touch(sc); if (sc.actor.has_shield()) super.actor_hit(sc); }
  actor_touch(sc: StoneContact) { SendMessage(sc.actor, '_shatter'); if (this.state === 0) { this.state = 1; this.init_model(); } }
  alarm() { if (this.state === 0) { this.state = 1; this.init_model(); } this.setAlarm(); }
  setAlarm() {
    let dt = toDouble(this.getAttr('interval'));
    if (dt > 0) { dt *= DoubleRand(0.8, 1.2); GameTimer.set_alarm(this, dt, false); }
  }
}
export function dirFromTo(a: GridPos, b: GridPos): number {
  if (a.x === b.x) { if (a.y === b.y - 1) return SOUTH; if (a.y === b.y + 1) return NORTH; }
  if (a.y === b.y) { if (a.x === b.x - 1) return EAST; if (a.x === b.x + 1) return WEST; }
  return NODIR;
}
Register('st_death', new DeathStone(false));
Register('st_death_invisible', new DeathStone(true));
Register('st_death_movable', new DeathStone(false, true));

// doors
const D_CLOSED = 0, D_OPEN = 1, D_OPENING = 2, D_CLOSING = 3;
class Door extends Stone {
  constructor(flavor: string, s: number, faces = '') {
    super();
    this.state = s;
    this.setAttr('flavor', flavor);
    this.setAttr('faces', faces);
  }
  getClass() { return 'st_door'; }
  setAttr(key: string, val: Value) {
    if (key === 'flavor') {
      super.setAttr(key, val);
      if (toStr(val) !== 'd') super.setAttr('faces', 'nesw');
      if (this.isDisplayable() && this.state <= D_OPEN) this.init_model();
      return;
    }
    if (key === 'faces' && toStr(this.getAttr('flavor')) === 'd') {
      super.setAttr(key, val);
      const f = toStr(super.getAttr(key));
      if (!(f === 'ns' || f === 'ew')) throw new XLevelRuntime("Door type d supports only face 'ns' and 'ew'");
    }
    super.setAttr(key, val);
  }
  externalState() { return this.state === D_OPEN ? 1 : 0; }
  setState(s: number) {
    if (this.isDisplayable()) {
      if (s === 1 && (this.state === D_CLOSED || this.state === D_CLOSING)) this.setIState(D_OPENING);
      else if (s === 0 && (this.state === D_OPEN || this.state === D_OPENING)) this.setIState(D_CLOSING);
    } else this.state = s;
  }
  toggleState() { this.setIState(this.state === D_OPEN || this.state === D_OPENING ? D_CLOSING : D_OPENING); }
  init_model() {
    let m = this.basename();
    if (this.state === D_CLOSED) m += '_closed'; else if (this.state === D_OPEN) m += '_open';
    this.set_model(m);
  }
  animcb() { if (this.state === D_OPENING) this.setIState(D_OPEN); else if (this.state === D_CLOSING) this.setIState(D_CLOSED); }
  is_floating() { return true; }
  is_transparent(d: number) {
    if (this.state === D_OPEN) return true;
    const faces = ALL_DIRECTIONS ^ this.getConnections();
    return !(faces & toBits(d)) && !(faces & toBits(reverseDir(d)));
  }
  allowsSpreading(d: number) { return this.state !== D_CLOSED || (d !== NODIR ? !(this.getFaces() & toBits(d)) : toStr(this.getAttr('flavor')) === 'd'); }
  collision_response(sc: StoneContact) {
    if (this.state === D_OPEN) return STONE_PASS;
    const f = ALL_DIRECTIONS ^ this.getConnections();
    const ap = sc.actor.ai.pos;
    if (((f & toBits(WEST)) && this.pos.x >= ap.x) || ((f & toBits(SOUTH)) && this.pos.y + 1 <= ap.y) ||
      ((f & toBits(EAST)) && this.pos.x + 1 <= ap.x) || ((f & toBits(NORTH)) && this.pos.y >= ap.y)) return STONE_REBOUND;
    return STONE_PASS;
  }
  actor_hit(sc: StoneContact) {
    if (toStr(this.getAttr('flavor')) === 'd' && this.state === D_CLOSED) {
      const it = GetItem(this.pos);
      if (it && server.EnigmaCompatibility < 1.10) SendMessage(it, '_hit', null, sc.actor);
      else this.performAction(objValueOf(sc.actor));
    }
  }
  collision_sound() { return toStr(this.getAttr('flavor')) === 'd' ? 'electric' : 'stone'; }
  basename() {
    const f = toStr(this.getAttr('flavor'));
    if (f !== 'd') return 'st_door_' + f;
    return this.getConnections() === (WESTBIT | EASTBIT) ? 'st_door_d_ns' : 'st_door_d_ew';
  }
  setIState(ns: number) {
    if (this.isDisplayable()) {
      const base = this.basename();
      const isD = toStr(this.getAttr('flavor')) === 'd';
      switch (ns) {
        case D_OPEN:
          this.set_model(base + '_open');
          lightHooks.maybeRecalc(this.pos);
          SendMessage(GetFloor(this.pos), '_checkflood');
          for (let d = NORTH; d !== NODIR; d--) SendMessage(GetFloor(this.pos.move(d)), '_checkflood');
          break;
        case D_CLOSED:
          this.set_model(base + '_closed');
          ShatterActorsInsideField(this.pos);
          lightHooks.maybeRecalc(this.pos);
          break;
        case D_OPENING:
          this.sound_event(isD ? 'dooropen' : '');
          if (this.state === D_CLOSING) this.get_model()?.reverse(); else this.set_anim(base + '_opening');
          break;
        case D_CLOSING:
          this.sound_event(isD ? 'doorclose' : '');
          if (this.state === D_OPENING) this.get_model()?.reverse(); else this.set_anim(base + '_closing');
          ShatterActorsInsideField(this.pos);
          lightHooks.maybeRecalc(this.pos);
          break;
      }
    }
    this.state = ns;
  }
}
function objValueOf(a: GameObject): Value { return objValue(a); }
Register('st_door', new Door('d', 0, 'ns')); Register('st_door_d', new Door('d', 0, 'ns'));
Register('st_door_a', new Door('a', 0)); Register('st_door_b', new Door('b', 0)); Register('st_door_c', new Door('c', 0));
Register('st_door_c_open', new Door('c', 1)); Register('st_door_d_open', new Door('d', 1, 'ns'));
Register('st_door_d_ew', new Door('d', 0, 'ew')); Register('st_door_d_ew_open', new Door('d', 1, 'ew'));

// switches
const S_OFF = 0, S_ON = 1, S_TURNON = 2, S_TURNOFF = 3;
class Switch extends Stone {
  constructor(color: Value, instant = false) {
    super();
    if (color !== null) this.setAttr('color', color);
    if (instant) this.setAttr('instant', true);
    this.state = S_OFF;
  }
  getClass() { return 'st_switch'; }
  setAttr(key: string, val: Value) {
    if (this.isDisplayable() && key === 'color' && this.state <= S_ON) { super.setAttr(key, val); this.init_model(); return; }
    super.setAttr(key, val);
  }
  externalState() { return this.isInstant() ? (this.state === S_ON || this.state === S_TURNON ? 1 : 0) : this.state % 2; }
  setState(s: number) {
    if (this.isDisplayable()) {
      if (this.state <= S_ON && s !== this.state) {
        this.sound_event('switchon');
        this.state += 2;
        this.set_anim(`st_switch${this.colorName()}${s ? '_turnon' : '_turnoff'}`);
        if (this.isInstant()) this.performAction(this.externalState() === S_ON);
      } else if (this.state === S_TURNON && s === S_OFF) {
        this.state = S_TURNOFF; this.get_model()?.reverse();
        if (this.isInstant()) this.performAction(false);
      } else if (this.state === S_TURNOFF && s === S_ON) {
        this.state = S_TURNON; this.get_model()?.reverse();
        if (this.isInstant()) this.performAction(true);
      }
    } else this.state = s;
  }
  init_model() { this.set_model(`st_switch${this.colorName()}${this.state === S_ON ? '_on' : '_off'}`); }
  animcb() { this.state = S_TURNOFF - this.state; this.init_model(); if (!this.isInstant()) this.performAction(this.state === S_ON); }
  actor_hit(sc: StoneContact) {
    const ic = this.iColor();
    const ac = sc.actor.getAttr('color');
    const acc = ac !== undefined ? toInt(ac) + 1 : 0;
    if (ic === 0 || ic === acc) this.setState(S_ON - this.state);
  }
  collision_sound() { return 'metal'; }
  iColor() { const v = this.getAttr('color'); return v !== undefined ? toInt(v) + 1 : 0; }
  colorName() { const c = this.iColor(); return c === 1 ? '_black' : c === 2 ? '_white' : ''; }
  isInstant() { return toBool(this.getDefaultedAttr('instant', false)); }
}
Register('st_switch', new Switch(null)); Register('st_switch_black', new Switch(0)); Register('st_switch_white', new Switch(1));
Register('st_switch_instant', new Switch(null, true)); Register('st_switch_black_instant', new Switch(0, true));
Register('st_switch_white_instant', new Switch(1, true));

// boxes
const B_WOOD = 0, B_WOOD1 = 1, B_WOOD2 = 2, B_HAY = 3, B_ROCK = 4;
const B_IDLE = 0, B_GROWING = 1, B_FALLING = 2, B_FALLEN = 3;
class BoxStone extends Stone {
  typ: number;
  constructor(typ: number, s = 0) { super(); this.typ = typ; this.state = s; }
  clone(): GameObject {
    if (this.typ === B_WOOD) {
      const c = super.clone() as BoxStone;
      c.typ = IntegerRand(0, 1) === 0 ? B_WOOD1 : B_WOOD2;
      return c;
    }
    return super.clone();
  }
  getClass() { return 'st_box'; }
  movableTrait() { return this.state === B_IDLE ? MOVABLE_STANDARD : MOVABLE_PERSISTENT; }
  getAttr(key: string): Value {
    if (key === 'flavor') return this.typ <= B_WOOD2 ? 'wood' : this.typ === B_HAY ? 'hay' : 'rock';
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === '_fire' && this.typ !== B_ROCK) { KillStone(this.pos); return true; }
    if (m.message === 'heat') return this.typ === B_ROCK;
    if (m.message === '_fall') { this.maybeFall(); return null; }
    return super.message(m);
  }
  setState(_s: number) {}
  init_model() {
    switch (this.typ) {
      case B_WOOD1: if (this.state === B_GROWING) this.set_anim('st_box_wood_growing'); else this.set_model('st_box_wood1'); break;
      case B_WOOD2: if (this.state === B_GROWING) this.set_anim('st_box_wood_growing'); else this.set_model('st_box_wood2'); break;
      case B_HAY: if (this.state === B_GROWING) this.set_anim('st_box_hay_growing'); else this.set_model('st_box_hay'); break;
      case B_ROCK: this.set_model('st_box_rock'); break;
      default: throw new XLevelRuntime('Wood stone init model state error');
    }
  }
  animcb() { this.state = B_IDLE; this.init_model(); this.maybeFall(); }
  allowsSpreading(_d: number, flood = false) { return flood; }
  actor_hit(sc: StoneContact) { if (this.state === B_GROWING) SendMessage(sc.actor, '_shatter'); else super.actor_hit(sc); }
  actor_inside(a: Actor) { if (this.state === B_GROWING) SendMessage(a, '_shatter'); }
  actor_contact(a: Actor) { if (this.state === B_GROWING) SendMessage(a, '_shatter'); }
  on_move(o: GridPos) { super.on_move(o); this.maybeFall(true); return true; }
  on_floor_change() { this.maybeFall(false, true); }
  maybeFall(onMove = false, _onFloorChange = false) {
    const p = this.pos;
    const old = GetFloor(p);
    if (!old) return;
    const k = old.getClass();
    if (this.typ === B_ROCK) SendMessage(old, 'stopfire');
    if (k === 'fl_abyss' || k === 'fl_water' || k === 'fl_swamp') {
      if (onMove) this.state = B_FALLING;
      else {
        this.state = B_FALLEN;
        const nf = MakeFloor(this.typ === B_HAY ? 'fl_hay_framed' : this.typ === B_ROCK ? 'fl_rock_framed' : this.typ === B_WOOD1 ? 'fl_wood_framed_h' : 'fl_wood_framed_v');
        this.transferIdentity(nf);
        const sec = this.getAttr('secure');
        if (sec !== undefined) nf.setAttr('secure', sec);
        if (k === 'fl_water') { nf.setAttr('interval', old.getAttr('interval')); nf.setAttr('state', old.getAttr('state')); }
        SetFloor(p, nf);
        KillStone(p);
      }
    }
  }
}
Register('st_box', new BoxStone(B_WOOD)); Register('st_box_wood', new BoxStone(B_WOOD));
Register('st_box_wood_growing', new BoxStone(B_WOOD, B_GROWING)); Register('st_box_wood_h', new BoxStone(B_WOOD1));
Register('st_box_wood_v', new BoxStone(B_WOOD2)); Register('st_box_hay', new BoxStone(B_HAY));
Register('st_box_hay_growing', new BoxStone(B_HAY, B_GROWING)); Register('st_box_rock', new BoxStone(B_ROCK));
export const _keep = [IsLevelBorder, B_FALLEN];
