// Stones: stones/RotatorStone.cc, ThiefStone.cc; items/BagItem.cc.
import {
  Stone, Item, Actor, GameObject, Register, GameTimer, GetStone, GetItem, SetItem, YieldItem, KillStone, MakeItem,
  DisposeObject, IntegerRand, lightHooks, glassesHooks, player, toBool, toInt, XLevelRuntime,
  MOVABLE_PERSISTENT, MOVABLE_STANDARD, MOVABLE_BREAKABLE, OBJBIT_LIGHTNEWDIRS, itf_static, WEST, NORTH,
  GridPos, type Message, type Value, type StoneContact, type Impulse, type TimeHandler, type ItemTraits, type ItemHolder,
} from '../core.ts';
import { updateCurrentLightDirs } from './laser.ts';
import { wieldedItemIs } from './stones2.ts';

const rotateCw = (d: number) => [3, 0, 1, 2][d];
const rotateCcw = (d: number) => [1, 2, 3, 0][d];

// ----- st_rotator
const CW = 0, CCW = 1;
class RotatorStone extends Stone implements TimeHandler {
  movable: boolean; keptLight = 0;
  constructor(movable: boolean, ccw: boolean) { super(); this.movable = movable; this.state = ccw ? CCW : CW; }
  getClass() { return 'st_rotator'; }
  movableTrait() { return this.movable ? MOVABLE_STANDARD : MOVABLE_PERSISTENT; }
  dispose() { GameTimer.remove_alarm(this); super.dispose(); }
  setAttr(key: string, val: Value) {
    if (key === 'counterclock') {
      const n = toBool(val) ? CCW : CW;
      if (n !== this.state) { this.state = n; if (this.isDisplayable()) this.init_model(); }
    } else if (key === 'movable') this.movable = toBool(val);
    else super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'counterclock') return this.state === CCW;
    if (key === 'movable') return this.movable;
    return super.getAttr(key);
  }
  setState(s: number) {
    if (this.isDisplayable() && this.state !== s) { this.state = s; this.init_model(); } else this.state = s;
  }
  init_model() { this.set_anim(this.state === CW ? 'st_rotator_cw' : 'st_rotator_ccw'); }
  on_creation(p: GridPos) { updateCurrentLightDirs(this); this.activatePhoto(); super.on_creation(p); }
  on_removal(p: GridPos) {
    this.keptLight = this.objFlags & OBJBIT_LIGHTNEWDIRS;
    GameTimer.remove_alarm(this);
    super.on_removal(p);
  }
  lightDirChanged(o: number, n: number) { if ((n & ~o) !== 0) { this.state = 1 - this.state; this.init_model(); } }
  animcb() { this.init_model(); this.sendImpulses(); }
  actor_hit(sc: StoneContact) {
    if (wieldedItemIs(sc.actor, 'it_wrench')) { this.state = 1 - this.state; this.init_model(); }
    if (this.movable) super.actor_hit(sc);
  }
  on_impulse(impulse: Impulse) {
    if (this.movable) { this.move_stone_dir(impulse.dir); this.propagateImpulse(impulse); }
  }
  on_move(origin: GridPos) {
    this.objFlags = (this.objFlags & ~OBJBIT_LIGHTNEWDIRS) | this.keptLight;
    lightHooks.recalc();
    return super.on_move(origin);
  }
  alarm() {
    const p = this.pos;
    for (let i = WEST; i <= NORTH; i++) {
      const id = this.getAttr(`$neighbor${i}`);
      if (id !== undefined && id !== null) {
        const st = GetStone(p.move(i));
        if (st && toInt(id) === st.id) this.sendImpulse(p.move(i), this.state === CW ? rotateCw(i) : rotateCcw(i));
      }
    }
  }
  private sendImpulses() {
    for (let i = WEST; i <= NORTH; i++) {
      const st = GetStone(this.pos.move(i));
      super.objectSetAttr(`$neighbor${i}`, st === null ? null : st.id);
    }
    GameTimer.set_alarm(this, 0.1);
  }
}
Register('st_rotator', new RotatorStone(false, false)); Register('st_rotator_cw', new RotatorStone(false, false));
Register('st_rotator_ccw', new RotatorStone(false, true)); Register('st_rotator_cw_movable', new RotatorStone(true, false));
Register('st_rotator_ccw_movable', new RotatorStone(true, true));

// ----- it_bag
const BAGSIZE = 13;
export class BagItem extends Item implements ItemHolder {
  contents: Item[] = [];
  traits(): ItemTraits { return { name: 'it_bag', flags: 0, radius: 0 }; }
  getClass() { return 'it_bag'; }
  clone(): GameObject {
    if (this.contents.length) throw new XLevelRuntime('Bag:: Clone of a full bag!');
    const c = super.clone() as BagItem; c.contents = []; return c;
  }
  dispose() { let it = this.yield_first(); while (it) { DisposeObject(it); it = this.yield_first(); } super.dispose(); }
  getAttr(key: string): Value {
    if (key === 'mass') {
      let mass = 0.0;
      for (const it of this.contents) { const v = it.getAttr('mass'); if (typeof v === 'number') mass += v; }
      return mass;
    }
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === '_init') for (const it of this.contents) it.message({ message: '_init', value: null, sender: null });
    return super.message(m);
  }
  on_creation(p: GridPos) { super.on_creation(p); for (const it of this.contents) it.setOwnerPos(p); }
  on_removal(p: GridPos) { super.on_removal(p); for (const it of this.contents) it.setOwner(-1); }
  setOwner(pl: number) { super.setOwner(pl); for (const it of this.contents ?? []) it.setOwner(pl); }
  setOwnerPos(p: GridPos) { super.setOwnerPos(p); for (const it of this.contents ?? []) it.setOwnerPos(p); }
  actor_hit(a: Actor) {
    if (super.actor_hit(a)) {
      const inv = player.mayPickup(a, null);
      if (inv) {
        const old = this.contents.length;
        inv.takeItemsFrom(this);
        glassesHooks.update();
        if (old !== this.contents.length && !inv.willAddItem(this)) {
          player.onInventory();
          this.sound_event('pickup');
        }
        return true;
      }
    }
    return false;
  }
  is_full() { return this.contents.length >= BAGSIZE; }
  add_item(it: Item) {
    this.contents.unshift(it);
    const o = this.getOwner();
    if (o === null) it.setOwnerPos(this.pos); else it.setOwner(toInt(o));
  }
  is_empty() { return this.contents.length === 0; }
  yield_first(): Item | null {
    const it = this.contents.shift();
    if (!it) return null;
    it.setOwnerPos(new GridPos(-1, -1));
    return it;
  }
  containsKind(kind: string): boolean {
    for (const it of this.contents) {
      if (it.isKind(kind)) return true;
      if ('containsKind' in it && (it as unknown as ItemHolder).containsKind(kind)) return true;
    }
    return false;
  }
}
Register('it_bag', new BagItem());

// ----- st_thief
const T_IDLE = 0, EMERGING = 1, RETREATING = 2, CAPTURE = 3, DRUNKEN = 4, DRUNKENCAPTURE = 5;
class ThiefStone extends Stone {
  victimId = 0; bag: BagItem | null = null;
  getClass() { return 'st_thief'; }
  movableTrait() { return MOVABLE_BREAKABLE; }
  protected afterClone() { super.afterClone(); this.bag = null; this.victimId = 0; }
  dispose() { if (this.bag) this.bag.dispose(); super.dispose(); }
  message(m: Message): Value {
    if (m.message === '_capture' && (this.state === T_IDLE || this.state === DRUNKEN) && this.isDisplayable()) {
      const it = GetItem(this.pos);
      if (it && !(it.traits().flags & itf_static) && this.bag) this.bag.add_item(YieldItem(this.pos)!);
      if (!GetItem(this.pos)) { SetItem(this.pos, this.bag); this.bag = null; }
      this.state = this.state === T_IDLE ? CAPTURE : DRUNKENCAPTURE;
      this.init_model();
      return true;
    }
    return super.message(m);
  }
  setState(_s: number) {}
  init_model() {
    switch (this.state) {
      case T_IDLE: this.set_model('st_thief'); break;
      case EMERGING: this.set_anim('st_thief_emerge'); break;
      case RETREATING: this.set_anim('st_thief_retreat'); break;
      case CAPTURE: case DRUNKENCAPTURE: this.set_anim('st_thief_capture'); break;
      case DRUNKEN: this.set_anim('st_thief_drunken'); break;
    }
  }
  animcb() {
    switch (this.state) {
      case EMERGING: this.doSteal(); if ((this.state as number) !== DRUNKEN) this.state = RETREATING; this.init_model(); break;
      case RETREATING: this.state = T_IDLE; this.init_model(); break;
      case CAPTURE: case DRUNKENCAPTURE: KillStone(this.pos); break;
      default: throw new XLevelRuntime('ThiefStone: animcb called with inconsistent state');
    }
  }
  collision_sound() { return 'cloth'; }
  actor_touch(sc: StoneContact) { this.actor_hit(sc); }
  actor_hit(sc: StoneContact) {
    if (this.state === T_IDLE) { this.state = EMERGING; this.victimId = sc.actor.id; this.init_model(); }
  }
  private doSteal() {
    const victim = GameObject.getObject(this.victimId);
    if (!(victim instanceof Actor)) return;
    const owner = victim.getAttr('owner');
    if (owner === undefined || owner === null || victim.has_shield()) return;
    const inv = player.inventory(toInt(owner));
    if (inv && inv.size() > 0) {
      if (!this.bag) { this.bag = MakeItem('it_bag') as BagItem; this.bag.setOwnerPos(this.pos); }
      const i = IntegerRand(0, inv.size() - 1);
      const it = inv.yield_item(i)!;
      this.bag.add_item(it);
      glassesHooks.update();
      player.onInventory();
      if (it.getKind() === 'it_bottle_idle') this.state = DRUNKEN;
      this.sound_event('thief');
    }
  }
}
Register('st_thief', new ThiefStone());
