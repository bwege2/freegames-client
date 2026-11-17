// Items: items/Dynamite.cc, Bomb.cc, Crack.cc.
import {
  Item, Register, server, GameTimer, GetFloor, GetItem, SetItem, SetFloor, MakeItem, MakeFloor, KillItem, SendMessage,
  SendExplosionEffect, DoubleRand, toInt, toStr, toDouble, XLevelRuntime, NORTH, NODIR,
  EXPLOSION_DYNAMITE, EXPLOSION_BLACKBOMB, EXPLOSION_WHITEBOMB,
  itf_static, itf_indestructible, itf_fireproof, itf_portable, itf_freezable,
  type Message, type Value, type ItemTraits, type Actor, type Stone, type TimeHandler,
} from '../core.ts';

const IDLE = 0, BURNING = 1;

// ----- it_dynamite
class Dynamite extends Item {
  constructor(s: number) { super(); this.state = s; }
  traits(): ItemTraits { return { name: 'it_dynamite', flags: itf_indestructible | itf_fireproof, radius: 0 }; }
  getClass() { return 'it_dynamite'; }
  message(m: Message): Value {
    if (m.message === 'ignite' || m.message === '_explosion' || m.message === '_dispenser') { if (this.isDisplayable()) this.burn(); return null; }
    if (m.message === 'explode' || m.message === '_cannonball') { if (this.isDisplayable()) this.explode(); return null; }
    if (m.message === 'heat') { if (this.isDisplayable()) this.burn(); return true; }
    if (m.message === '_freeze' && this.state === BURNING) { this.state = IDLE; this.init_model(); }
    return super.message(m);
  }
  setState(s: number) { if (this.state === IDLE && s === 1) { this.state = BURNING; if (this.isDisplayable()) this.init_model(); } }
  init_model() { if (this.state === IDLE) this.set_model('it_dynamite'); else this.set_anim('it_dynamite_burning'); }
  processLight(_d: number) { this.burn(); }
  animcb() { this.explode(); }
  isStatic() { return this.state === BURNING; }
  on_drop(_a: Actor) { this.burn(); }
  private burn() { if (this.state === IDLE) { this.state = BURNING; this.init_model(); } }
  private explode() {
    const p = this.pos;
    SendExplosionEffect(p, EXPLOSION_DYNAMITE);
    this.sound_event('dynamite');
    const fl = GetFloor(p)!;
    this.replace(fl.getClass() === 'fl_ice' ? 'it_explosion_crack' : 'it_explosion_hollow');
  }
}
Register('it_dynamite', new Dynamite(0)); Register('it_dynamite_burning', new Dynamite(1));

// ----- it_bomb
const BLACK = 0;
class Bomb extends Item implements TimeHandler {
  constructor(color: number, burning = false) { super(); super.objectSetAttr('color', color); if (burning) this.state = BURNING; }
  traits(): ItemTraits {
    return this.state === IDLE
      ? { name: 'it_bomb', flags: itf_static | itf_indestructible | itf_fireproof | itf_portable | itf_freezable, radius: 0 }
      : { name: 'it_bomb_burning', flags: itf_static | itf_indestructible | itf_fireproof | itf_freezable, radius: 0 };
  }
  getClass() { return 'it_bomb'; }
  dispose() { GameTimer.remove_alarm(this); super.dispose(); }
  private colorName() { return toInt(this.getAttr('color')) === BLACK ? 'black' : 'white'; }
  setAttr(key: string, val: Value) {
    if (key === 'color') { super.setAttr('color', val); if (this.isDisplayable()) this.init_model(); return; }
    super.setAttr(key, val);
  }
  message(m: Message): Value {
    if (m.message === 'ignite' || m.message === '_explosion') { if (this.isDisplayable()) this.burn(); return null; }
    if (m.message === 'explode' || m.message === '_cannonball') { if (this.isDisplayable()) this.explode(); return null; }
    if (m.message === 'heat') { if (this.isDisplayable()) this.burn(); return true; }
    return super.message(m);
  }
  setState(s: number) { if (this.state === IDLE && s === 1) { this.state = BURNING; if (this.isDisplayable()) this.init_model(); } }
  init_model() {
    if (this.state === IDLE) this.set_model(`it_bomb_${this.colorName()}`); else this.set_anim(`it_bomb_${this.colorName()}_burning`);
  }
  processLight(_d: number) { this.explode(); }
  animcb() { this.explode(); }
  get_inventory_model() { return `it_bomb_${this.colorName()}`; }
  on_stonehit(st: Stone) { if (!st.isKind('st_box_hay')) this.ignite(); }
  alarm() { GameTimer.remove_alarm(this); this.explode(); }
  private burn() { if (this.state === IDLE) { this.state = BURNING; this.init_model(); } }
  private ignite() { this.state = IDLE; this.init_model(); GameTimer.set_alarm(this, 0.01, false); }
  private explode() {
    const p = this.pos;
    const black = toInt(this.getAttr('color')) === BLACK;
    this.sound_event(black ? 'bomb_black' : 'bomb_white');
    const n = MakeItem('it_explosion_debris')!;
    this.transferName(n);
    SendExplosionEffect(p, black ? EXPLOSION_BLACKBOMB : EXPLOSION_WHITEBOMB);
    SetItem(p, n);
  }
}
Register('it_bomb', new Bomb(0)); Register('it_bomb_black', new Bomb(0)); Register('it_bomb_black_burning', new Bomb(0, true));
Register('it_bomb_white', new Bomb(1)); Register('it_bomb_white_burning', new Bomb(1, true));

// ----- it_crack
const INVISIBLE = -1, DISSOLVING = 3;
const CRACK_NAMES = ['it_crack_i', 'it_crack_s', 'it_crack_m', 'it_crack_l'];
class Crack extends Item {
  water: boolean;
  constructor(type: number, water = false) { super(); this.state = type; this.water = water; }
  traits(): ItemTraits { return { name: CRACK_NAMES[this.state < DISSOLVING ? this.state + 1 : 3], flags: itf_static | itf_fireproof | itf_indestructible, radius: 0 }; }
  getClass() { return 'it_crack'; }
  setAttr(key: string, val: Value) {
    if (key === 'flavor') {
      const f = toStr(val);
      if (f !== 'abyss' && f !== 'water') throw new XLevelRuntime('Crack illegal flavor value');
      this.water = f === 'water';
      if (this.isDisplayable()) this.init_model();
      return;
    }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'flavor') return this.water ? 'water' : 'abyss';
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === 'crack' || m.message === 'ignite') { this.crack(); return null; }
    if (m.message === 'heat' || m.message === '_explosion' || m.message === '_cannonball') {
      this.sound_event('crack');
      this.replace(this.water ? 'it_debris_water' : 'it_debris');
      return true;
    }
    if (m.message === '_freeze') { this.kill(); return null; }
    return super.message(m);
  }
  maxState() { return DISSOLVING; }
  minState() { return INVISIBLE; }
  toggleState() { if (this.state < DISSOLVING) this.setState(this.state + 1); }
  init_model() {
    const fl = this.water ? 'water' : 'abyss';
    if (this.state === INVISIBLE) this.set_model('invisible');
    else if (this.state < DISSOLVING) this.set_model(`it_crack_${fl}${this.state + 1}`);
    else { this.sound_event('floordestroy'); this.set_anim(`it_crack_${fl}_anim`); }
  }
  actor_enter(a: Actor) {
    if (!a.is_on_floor()) return;
    this.crack();
    if (this.state < DISSOLVING) {
      for (let d = NORTH; d !== NODIR; d--) {
        const p = this.pos.move(d);
        const fl = GetFloor(p);
        if (fl && fl.is_destructible() && (!this.water || !fl.isKind('fl_space'))) {
          const it = GetItem(p);
          if (it) { if (!this.water) SendMessage(it, 'crack'); }
          else {
            const spreading = toDouble(this.getDefaultedAttr('spreading', server.CrackSpreading));
            if (DoubleRand(0, 0.9999) < spreading) {
              const n = MakeItem('it_crack_i')!;
              n.setAttr('flavor', this.getAttr('flavor'));
              let v = this.getAttr('fragility'); if (v !== undefined && v !== null) n.setAttr('fragility', v);
              v = this.getAttr('spreading'); if (v !== undefined && v !== null) n.setAttr('spreading', v);
              SetItem(p, n);
            }
          }
        }
      }
    }
  }
  animcb() {
    const p = this.pos;
    SetFloor(p, MakeFloor(this.water ? 'fl_water' : 'fl_abyss'));
    KillItem(p);
  }
  private crack() {
    const fl = GetFloor(this.pos);
    if (fl && fl.is_destructible()) {
      const v = fl.getAttr('fragility');
      const fragility = toDouble(this.getDefaultedAttr('fragility', v !== undefined && v !== null ? v : server.Fragility));
      const spreading = toDouble(this.getDefaultedAttr('spreading', server.CrackSpreading));
      if ((this.state === INVISIBLE && DoubleRand(0, 0.9999) < spreading) || DoubleRand(0, 0.9999) < fragility) {
        this.toggleState();
        this.sound_event('crack');
      }
    }
  }
}
Register('it_crack', new Crack(0)); Register('it_crack_i', new Crack(-1)); Register('it_crack_s', new Crack(0));
Register('it_crack_s_water', new Crack(0, true)); Register('it_crack_m', new Crack(1)); Register('it_crack_m_water', new Crack(1, true));
Register('it_crack_l', new Crack(2));
