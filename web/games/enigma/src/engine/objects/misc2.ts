// stones/LaserSwitch.cc, floors/ScalesFloor.cc, actors/KillerActor.cc.
import {
  Stone, Floor, Actor, Register, server, GetItem, GetStone, GetActorsInsideField, SendMessage, toStr, toDouble, toInt,
  XLevelRuntime, NODIRBIT,
  type GridPos, type Message, type Value,
} from '../core.ts';
import { updateCurrentLightDirs } from './laser.ts';

// ----- st_laserswitch
const OFF = 0, ON = 1, NEW = 2;
class LaserSwitch extends Stone {
  constructor() { super(); this.state = NEW; }
  getClass() { return 'st_laserswitch'; }
  message(m: Message): Value {
    if (m.message === '_model_reanimated') this.init_model();
    else if (m.message === '_init') { if (updateCurrentLightDirs(this) !== NODIRBIT) { this.state = ON; this.init_model(); } }
    return super.message(m);
  }
  externalState() { return this.state % 2; }
  setState(_s: number) {}
  init_model() { this.set_model(`st_laserswitch${this.state === ON ? 1 : 0}`); }
  on_creation(p: GridPos) {
    const n = updateCurrentLightDirs(this) !== NODIRBIT ? ON : OFF;
    if (this.state === NEW) this.state = n;
    else if (n !== this.state) this.lightDirChanged(NODIRBIT, NODIRBIT);
    this.activatePhoto();
    super.on_creation(p);
  }
  lightDirChanged(o: number, n: number) {
    if (this.state === OFF && o === 0) { this.state = ON; this.init_model(); this.performAction(true); }
    else if (this.state === ON && n === 0) { this.state = OFF; this.init_model(); this.performAction(false); }
  }
  collision_sound() { return 'metal'; }
}
Register('st_laserswitch', new LaserSwitch());

// ----- fl_scales
const FLAVORS = ['brick', 'bridgewood', 'concrete', 'darkgray', 'gray', 'platinum'];
class ScalesFloor extends Floor {
  constructor(flavor: string) {
    super();
    Floor.prototype.setAttr.call(this, 'flavor', flavor);
    Floor.prototype.setAttr.call(this, '$mass', 0.0);
    Floor.prototype.setAttr.call(this, 'burnable', flavor === 'bridgewood');
    this.state = OFF;
  }
  getClass() { return 'fl_scales'; }
  setAttr(key: string, val: Value) {
    if (key === 'flavor') {
      const f = toStr(val);
      if (!FLAVORS.includes(f)) throw new XLevelRuntime('ScalesFloor illegal flavor value');
      super.setAttr('flavor', val);
      super.setAttr('burnable', f === 'bridgewood');
      if (this.isDisplayable()) this.init_model();
      return;
    }
    super.setAttr(key, val);
  }
  message(m: Message): Value {
    if (m.message === '_init') {
      const it = GetItem(this.pos);
      if (it) { const v = it.getAttr('mass'); if (typeof v === 'number') super.setAttr('$mass', v); }
      this.updateIState(true);
      return null;
    } else if (m.message === '_jumping' || m.message === '_update_mass') this.updateIState();
    else if (m.message === '_dying') { if (m.sender instanceof Actor) this.updateIState(); }
    else if (m.message === '_add_mass') {
      if (server.WorldInitialized) { super.setAttr('$mass', toDouble(this.getAttr('$mass')) + toDouble(m.value)); this.updateIState(); }
    }
    return super.message(m);
  }
  setState(_s: number) {}
  getModelName() { return `fl_scales_${toStr(this.getAttr('flavor'))}${this.state === ON ? '_pressed' : '_released'}`; }
  on_creation(p: GridPos) { this.state = OFF; this.updateIState(true); super.on_creation(p); }
  actor_enter(a: Actor) { if (!(a.is_flying() || a.isMoribund())) this.updateIState(!server.WorldInitialized); }
  actor_leave(a: Actor) { if (!(a.is_flying() || a.isMoribund())) this.updateIState(!server.WorldInitialized); }
  stone_change(_st: Stone | null) { this.updateIState(); }
  private weightActors() {
    let mass = toDouble(this.getAttr('$mass'));
    for (const a of GetActorsInsideField(this.pos)) if (!(a.is_flying() || a.isMoribund())) mass += a.ai.mass;
    return mass >= toDouble(this.getAttr('min'));
  }
  private updateIState(refuseAction = false) {
    const old = this.state;
    this.state = OFF;
    const st = GetStone(this.pos);
    if (st && (!st.is_floating() || st.getClass() === 'st_puzzle')) this.state = ON;
    if (this.weightActors()) this.state = ON;
    if (old !== this.state) {
      this.init_model();
      if (!refuseAction) {
        if (this.state !== OFF) { this.sound_event('triggerdown'); this.performAction(true); }
        else { this.sound_event('triggerup'); this.performAction(false); }
      }
    }
  }
}
Register('fl_scales', new ScalesFloor('darkgray'));
for (const f of FLAVORS) Register(`fl_scales_${f}`, new ScalesFloor(f));

// ----- ac_killer
const KILLER = [{ name: 'ac_killer_white', radius: 13.0 / 64, mass: 0.7 }, { name: 'ac_killer_black', radius: 13.0 / 64, mass: 0.7 }];
class Killer extends Actor {
  constructor(color: number) {
    super(KILLER[color]);
    this.setAttr('adhesion', 2.0);
    this.setAttr('color', color);
    this.setAttr('controllers', 3);
  }
  traits() { return KILLER[toInt(this.getAttr('color'))]; } // traits[color] as in the original (names swapped there too)
  getClass() { return 'ac_killer'; }
  is_dead() { return false; }
  on_collision(a: Actor) { if (a.is_on_floor()) SendMessage(a, '_shatter'); return false; }
}
Register('ac_killer', new Killer(1)); Register('ac_killer_white', new Killer(1)); Register('ac_killer_black', new Killer(0));
