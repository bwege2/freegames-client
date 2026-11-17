// items/Magnet.cc, TrapItem.cc, CrossItem.cc; stones/ChameleonStone.cc.
import {
  Item, Stone, Register, server, world, GameTimer, GetFloor, KillItem, SendMessage, toDouble, toStr, XLevelRuntime, V2,
  itf_static, itf_indestructible, itf_freezable, itf_fireproof, STONE_PASS,
  type GridPos, type Message, type Value, type Actor, type ItemTraits, type StoneContact, type TimeHandler,
} from '../core.ts';

// ----- it_magnet
class Magnet extends Item {
  strength = 0.6 * 30; sqRange = 1000 * 1000;
  constructor(on: boolean) { super(); this.state = on ? 1 : 0; }
  traits(): ItemTraits { return { name: this.state === 1 ? 'it_magnet_on' : 'it_magnet_off', flags: itf_static | itf_indestructible | itf_freezable, radius: 0 }; }
  getClass() { return 'it_magnet'; }
  setAttr(key: string, val: Value) {
    if (key === 'range') { const r = val === null || val === undefined ? server.MagnetRange : toDouble(val); this.sqRange = r * r; }
    else if (key === 'strength') this.strength = 0.6 * (val === null || val === undefined ? server.MagnetForce : toDouble(val));
    super.setAttr(key, val);
  }
  private globals() {
    if (!this.attribs.has('range')) this.sqRange = server.MagnetRange * server.MagnetRange;
    if (!this.attribs.has('strength')) this.strength = 0.6 * server.MagnetForce;
  }
  message(m: Message): Value {
    if (m.message === '_updateglobals' && toStr(m.value) === 'it_magnet') { this.globals(); return null; }
    return super.message(m);
  }
  setState(s: number) {
    if (s !== this.state) {
      this.state = s;
      if (this.isDisplayable()) { if (s === 1) world.forces.push(this); else this.removeForce(); this.init_model(); }
    }
  }
  private removeForce() { const i = world.forces.indexOf(this); if (i >= 0) world.forces.splice(i, 1); }
  init_model() { this.set_model(`it_magnet_${this.state === 1 ? 'on' : 'off'}`); }
  on_creation(p: GridPos) { this.globals(); if (this.state === 1) world.forces.push(this); super.on_creation(p); }
  on_removal(p: GridPos) { super.on_removal(p); if (this.state === 1) this.removeForce(); }
  globalForce(a: Actor): V2 {
    const c = this.pos.center();
    const dx = c.x - a.ai.pos_force.x, dy = c.y - a.ai.pos_force.y;
    const sq = dx * dx + dy * dy;
    return sq >= 0.04 && sq < this.sqRange ? new V2(this.strength / sq * dx, this.strength / sq * dy) : new V2();
  }
  tick(_dt: number) {}
}
Register('it_magnet', new Magnet(false)); Register('it_magnet_off', new Magnet(false)); Register('it_magnet_on', new Magnet(true));

// ----- it_trap
const GLASSES_TRAP = 32;
class TrapItem extends Item {
  traits(): ItemTraits { return { name: 'it_trap', flags: itf_static | itf_fireproof, radius: 0 }; }
  getClass() { return 'it_trap'; }
  message(m: Message): Value {
    if (m.message === '_glasses' && this.isDisplayable()) this.init_model();
    return super.message(m);
  }
  setState(s: number) { if (this.isDisplayable() && this.state === 0) { this.state = s; this.init_model(); } else this.state = s; }
  init_model() { this.set_model(this.state === 0 && (server.GlassesVisibility & GLASSES_TRAP) === 0 ? 'invisible' : 'it_trap'); }
  animcb() { this.init_model(); }
  actor_hit(a: Actor) {
    if (!a.is_flying()) {
      SendMessage(a, '_fall');
      if (this.state === 0) { this.state = 1; this.set_anim('it_trap_breaking'); }
    }
    return false;
  }
}
Register('it_trap', new TrapItem());

// ----- it_cross
class CrossItem extends Item implements TimeHandler {
  traits(): ItemTraits { return { name: 'it_cross', flags: itf_static | itf_indestructible, radius: 0 }; }
  getClass() { return 'it_cross'; }
  dispose() { GameTimer.remove_alarm(this); super.dispose(); }
  message(m: Message): Value {
    if (m.message === '_brush') { KillItem(this.pos); return null; }
    return super.message(m);
  }
  setState(_s: number) {}
  actor_enter(a: Actor) {
    const o = a.getAttr('owner');
    if (this.state === 0 && o !== undefined && o !== null) { this.state = 1; GameTimer.set_alarm(this, toDouble(this.getAttr('interval'))); }
  }
  actor_leave(_a: Actor) { if (this.state === 1) { GameTimer.remove_alarm(this); this.state = 0; } }
  alarm() { this.state = 0; this.performAction(true); }
}
Register('it_cross', new CrossItem());

// ----- st_chameleon
class ChameleonStone extends Stone {
  getClass() { return 'st_chameleon'; }
  message(m: Message): Value {
    if (m.message === '_model_reanimated') this.init_model();
    return super.message(m);
  }
  init_model() {
    const fl = GetFloor(this.pos);
    if (!fl) throw new XLevelRuntime('Chameleon Stone: Floor must be set before stone');
    this.set_model(fl.getModelName());
  }
  is_floating() { return true; }
  collision_response(_sc: StoneContact) { return STONE_PASS; }
}
Register('st_chameleon', new ChameleonStone());
