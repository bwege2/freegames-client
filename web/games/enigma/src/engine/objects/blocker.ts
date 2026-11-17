// st_blocker (stones/BlockerStone.cc) and it_blocker (items/BlockerItem.cc): the blocker that a boulder opens
// and that grows back when the boulder has passed.
import {
  Stone, Item, GameObject, Register, GameTimer, GetStone, SetStone, SetItem, MakeItem, MakeStone, KillStone, SendMessage,
  NameObject, toBool, XLevelRuntime, STONE_PASS, STONE_REBOUND, MOVABLE_BREAKABLE, itf_static, itf_indestructible,
  type GridPos, type Actor, type StoneContact, type TimeHandler, type Message, type Value, type ItemTraits,
} from '../core.ts';

const B_SOLID = 0, B_SHRINKING = 1, B_GROWING = 2;
class BlockerStone extends Stone {
  constructor(solid: boolean) { super(); this.state = solid ? B_SOLID : B_GROWING; }
  getClass() { return 'st_blocker'; }
  movableTrait() { return MOVABLE_BREAKABLE; }
  clone(): GameObject { const d = super.clone(); NameObject(d, '$BlockerStone#'); return d; }
  message(m: Message): Value {
    if (m.message === '_trigger') { this.setIState(B_SHRINKING); return null; }
    if (m.message === '_performaction') { this.performAction(false); return null; }
    return super.message(m);
  }
  toggleState() { if (this.state === B_SHRINKING) this.setIState(B_GROWING); else this.setIState(B_SHRINKING); }
  externalState() { return 0; }
  setState(ext: number) {
    if (ext === 1 && !this.isDisplayable()) throw new XLevelRuntime('There is no open st_blocker. Use it_blocker instead.');
    if (ext === 1) this.setIState(B_SHRINKING);
    else if (this.state === B_SHRINKING) this.setIState(B_GROWING);
  }
  init_model() {
    if (this.state === B_SOLID) this.set_model('st_blocker');
    else if (this.state === B_SHRINKING) this.set_anim('st_blocker_shrinking');
    else this.set_anim('st_blocker_growing');
  }
  animcb() {
    if (this.state === B_SHRINKING) {
      const it = MakeItem('it_blocker_new')!;
      SetItem(this.pos, it);
      this.transferIdentity(it);
      const v = this.getAttr('autoclose');
      if (v !== undefined && v !== null) it.setAttr('autoclose', v);
      SendMessage(it, '_performaction');
      KillStone(this.pos);
    } else if (this.state === B_GROWING) this.setIState(B_SOLID);
    else throw new XLevelRuntime('BlockerStone: animcb called with inconsistent state');
  }
  collision_response(_sc: StoneContact) { return this.state === B_SHRINKING ? STONE_PASS : STONE_REBOUND; }
  actor_contact(a: Actor) {
    if (!toBool(this.getDefaultedAttr('autoclose', false)) && this.state === B_GROWING) SendMessage(a, '_shatter');
  }
  actor_inside(a: Actor) { if (this.state === B_GROWING) SendMessage(a, '_shatter'); }
  private setIState(n: number) {
    if (this.state === n) return;
    if (this.state === B_GROWING && n === B_SHRINKING) { this.state = B_SHRINKING; this.get_model()?.reverse(); }
    else if (this.state === B_SHRINKING && n === B_GROWING) { this.state = B_GROWING; this.get_model()?.reverse(); }
    else {
      this.state = n;
      this.init_model();
      if (n === B_SOLID) this.objectSetAttr('kind', 'st_blocker');
    }
  }
}
Register('st_blocker', new BlockerStone(true)); Register('st_blocker_new', new BlockerStone(false));

const I_IDLE = 0, I_NEW = 1, I_LOCKED = 2, I_UNLOCKED = 3;
class BlockerItem extends Item implements TimeHandler {
  constructor(recent: boolean) { super(); this.state = recent ? I_NEW : I_IDLE; }
  traits(): ItemTraits { return { name: 'it_blocker', flags: itf_static | itf_indestructible, radius: 0 }; }
  getClass() { return 'it_blocker'; }
  clone(): GameObject { const d = super.clone(); NameObject(d, '$BlockerItem#'); return d; }
  dispose() { GameTimer.remove_alarm(this); super.dispose(); }
  message(m: Message): Value {
    if (m.message === '_init') {
      const st = GetStone(this.pos);
      if (st && st.getClass() === 'st_boulder') {
        if (this.state === I_IDLE) this.setIState(I_UNLOCKED);
        else this.setIState(I_LOCKED);
      }
      return super.message(m);
    }
    if (m.message === '_performaction') { this.performAction(true); return null; }
    return super.message(m);
  }
  toggleState() { if (this.state === I_UNLOCKED) this.setIState(I_LOCKED); else this.setState(0); }
  externalState() { return 1; }
  setState(ext: number) {
    if (this.isDisplayable()) this.stone_change(GetStone(this.pos));
    if (ext === 1) { if (this.state === I_UNLOCKED) this.setIState(I_LOCKED); }
    else {
      if (!this.isDisplayable()) throw new XLevelRuntime("Blocker item: attempt to set initial state CLOSED - use 'st_blocker'.");
      if (this.state === I_LOCKED) this.setIState(I_UNLOCKED);
      else if (this.state === I_IDLE || this.state === I_NEW) this.grow();
    }
  }
  on_creation(p: GridPos) { if (this.state === I_NEW) GameTimer.set_alarm(this, 0.5, false); super.on_creation(p); }
  on_removal(p: GridPos) { this.setIState(I_IDLE); super.on_removal(p); }
  init_model() { this.set_model('it_blocker'); }
  actor_leave(_a: Actor) { const v = this.getAttr('autoclose'); if (v !== undefined && v !== null && toBool(v)) this.setState(0); }
  stone_change(st: Stone | null) {
    if (st) {
      if (st.getClass() === 'st_boulder') {
        if (this.state === I_IDLE) this.setIState(I_UNLOCKED); else if (this.state === I_NEW) this.setIState(I_LOCKED);
      } else if (this.state !== I_UNLOCKED) this.setIState(I_LOCKED);
    } else if (this.state === I_LOCKED) this.setIState(I_IDLE);
    else if (this.state === I_UNLOCKED) this.grow();
  }
  alarm() { if (this.state === I_NEW) this.setIState(I_IDLE); }
  private setIState(n: number) {
    if (this.state !== n) {
      if (this.state === I_NEW) GameTimer.remove_alarm(this); else if (n === I_NEW) GameTimer.set_alarm(this, 0.5, false);
      this.state = n;
    }
  }
  private grow() {
    const st = MakeStone('st_blocker_new')!;
    SetStone(this.pos, st);
    this.transferIdentity(st);
    const v = this.getAttr('autoclose');
    if (v !== undefined && v !== null) st.setAttr('autoclose', v);
    SendMessage(st, '_performaction');
    this.kill();
  }
}
Register('it_blocker', new BlockerItem(false)); Register('it_blocker_new', new BlockerItem(true));
