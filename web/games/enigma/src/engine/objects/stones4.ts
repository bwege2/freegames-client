// Stones: stones/PlasterStone.cc, BreakStone.cc.
import {
  Stone, Register, KillStone, toInt, STONE_PASS, MOVABLE_PERSISTENT, MOVABLE_BREAKABLE, MOVABLE_STANDARD, MOVABLE_IRREGULAR,
  type Message, type Value, type StoneContact,
} from '../core.ts';
import { wieldedItemIs } from './stones2.ts';

const HOLLOW_GLASSES = 2; // Glasses::HOLLOW (items/GlassesItem.hh)
const IDLE = 0, BREAKING = 1;

// ----- st_plaster
class PlasterStone extends Stone {
  hollow: boolean; movable: boolean; breakable: boolean; glasses = false;
  constructor(hollow: boolean, movable: boolean, breakable = false) { super(); this.hollow = hollow; this.movable = movable; this.breakable = breakable; }
  getClass() { return 'st_plaster'; }
  movableTrait() { return [MOVABLE_PERSISTENT, MOVABLE_BREAKABLE, MOVABLE_STANDARD, MOVABLE_IRREGULAR][(this.breakable ? 1 : 0) + (this.movable ? 2 : 0)]; }
  getAttr(key: string): Value {
    if (key === 'movable') return this.movable;
    if (key === 'hollow') return this.hollow;
    if (key === 'breakable') return this.breakable;
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (this.hollow && m.message === '_glasses') {
      if (((toInt(m.value) & HOLLOW_GLASSES) !== 0) !== this.glasses) { this.glasses = !this.glasses; if (this.isDisplayable()) this.init_model(); }
      return null;
    }
    if (this.breakable && (m.message === 'ignite' || m.message === '_explosion')) { this.doBreak(); return null; }
    return super.message(m);
  }
  setState(_s: number) {}
  init_model() {
    if (this.glasses) this.set_model('invisible');
    else if (this.state === BREAKING) this.set_anim('st_plaster_breaking');
    else this.set_model(this.getClass());
  }
  processLight(d: number) { if (this.breakable) this.doBreak(); else super.processLight(d); }
  animcb() { KillStone(this.pos); }
  is_floating() { return this.hollow; }
  is_movable() { return this.state !== BREAKING ? super.is_movable() : false; }
  collision_response(sc: StoneContact) { return this.hollow ? STONE_PASS : super.collision_response(sc); }
  collision_sound() { return 'stone'; }
  actor_hit(sc: StoneContact) {
    if (this.breakable && wieldedItemIs(sc.actor, 'it_hammer')) this.doBreak(); else super.actor_hit(sc);
  }
  private doBreak() {
    if (this.state === IDLE) { this.state = BREAKING; this.sound_event('stonedestroy'); if (this.isDisplayable()) this.init_model(); }
  }
}
Register('st_plaster', new PlasterStone(false, false));
Register('st_plaster_hollow', new PlasterStone(true, false));
Register('st_plaster_movable', new PlasterStone(false, true));
Register('st_plaster_breakable', new PlasterStone(false, false, true));
Register('st_plaster_movebreakable', new PlasterStone(false, true, true));

// ----- st_break
const PLAIN = 0, ACBLACK = 1, ACWHITE = 2, OXYDC = 3, BOULDER = 4, BUG = 5;
const BREAK_NAMES = ['st_break_plain', 'st_break_black', 'st_break_white', 'st_break_oxydc', 'st_break_boulder', 'st_break_bug', 'st_break_laser'];
class BreakStone extends Stone {
  typ: number;
  constructor(typ: number) { super(); this.typ = typ; }
  getClass() { return 'st_break'; }
  movableTrait() { return MOVABLE_BREAKABLE; }
  getAttr(key: string): Value {
    if (key === 'flavor') return BREAK_NAMES[this.typ].slice(9);
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === 'ignite' || m.message === '_explosion') { if (this.typ !== BUG) this.doBreak(); return null; }
    if (m.message === '_trigger') { if (this.typ === BOULDER) this.doBreak(); return null; }
    return super.message(m);
  }
  setState(_s: number) {}
  init_model() {
    if (this.state === BREAKING) this.set_anim(BREAK_NAMES[this.typ] + '-anim');
    else this.set_model(BREAK_NAMES[this.typ]);
  }
  processLight(_d: number) { if (this.typ !== BUG) this.doBreak(); }
  animcb() { KillStone(this.pos); }
  actor_hit(sc: StoneContact) {
    const t = this.typ;
    const color = sc.actor.getAttr('color');
    const c = color === undefined || color === null ? -1 : toInt(color);
    if ((wieldedItemIs(sc.actor, 'it_hammer') && (t === PLAIN || t === OXYDC || t === BOULDER ||
      (c >= 0 && ((c === 0 && t === ACBLACK) || (c === 1 && t === ACWHITE))))) || (t === BUG && sc.actor.getClass() === 'ac_bug')) this.doBreak();
    else super.actor_hit(sc);
  }
  collision_sound() { return 'stone'; }
  private doBreak() {
    if (this.state === IDLE) { this.state = BREAKING; this.sound_event('stonedestroy'); this.init_model(); }
  }
}
Register('st_break', new BreakStone(0));
BREAK_NAMES.forEach((n, i) => Register(n, new BreakStone(i)));
