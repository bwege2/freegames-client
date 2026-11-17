// Stones: stones/KnightStone.cc, YieldingStone.cc, SwapStone.cc, PullStone.cc.
import {
  Stone, GameObject, Register, GameTimer, GetStone, SetStone, YieldStone, MakeObject, SendMessage, DisposeObject,
  IsInsideLevel, WarpActor, GetActorsInRange, IncMoveCounter, lightHooks, host, display, makeGroup, getObjectList,
  reverseDir, toBits, XLevelRuntime, STONE_PASS, STONE_REBOUND, MOVABLE_PERSISTENT, MOVABLE_IRREGULAR,
  NORTH, SOUTH, EAST, WEST, GridPos,
  type Actor, type StoneContact, type Impulse, type TimeHandler,
} from '../core.ts';
import { wieldedItemIs } from './stones2.ts';
import type { Model } from '../display.ts';

const SUFFIX = ['_w', '_s', '_e', '_n'];

// ----- st_knight
class KnightStone extends Stone {
  getClass() { return 'st_knight'; }
  movableTrait() { return MOVABLE_PERSISTENT; }
  maxState() { return 4; }
  setState(_s: number) {}
  init_model() { this.set_model(`st_knight${this.state + 1}`); }
  collision_response(_sc: StoneContact) { return this.state === this.maxState() ? STONE_PASS : STONE_REBOUND; }
  actor_hit(sc: StoneContact) {
    if (this.state !== this.maxState()) {
      if (wieldedItemIs(sc.actor, 'it_sword')) {
        this.state += 1;
        if (this.state === this.maxState()) {
          lightHooks.maybeRecalc(this.pos);
          host.showText("All right, we'll call it a draw");
        }
        this.init_model();
      } else SendMessage(sc.actor, '_shatter');
    }
  }
  is_floating() { return this.state === this.maxState(); }
}
Register('st_knight', new KnightStone());

// ----- YieldingStone: a stone that carries another stone (with its model) while it moves away
const IDLE = 0, APPEARING = 1, VANISHING = 2;
abstract class YieldingStone extends Stone implements TimeHandler {
  yieldedStone: Stone | null = null; yieldedModel: Model | null = null; origin = new GridPos();
  protected afterClone() { super.afterClone(); this.yieldedStone = null; this.yieldedModel = null; }
  abstract alarm(): void;
  dispose() {
    GameTimer.remove_alarm(this);
    if (this.yieldedStone) { SendMessage(this.yieldedStone, 'disconnect'); DisposeObject(this.yieldedStone); }
    this.yieldedStone = null; this.yieldedModel = null;
    super.dispose();
  }
  yieldStone(st: Stone | null) {
    if (!st) return;
    if (this.yieldedStone) throw new XLevelRuntime('YieldingStone: internal error of double yielding');
    this.yieldedStone = st;
    this.origin = st.pos;
    this.yieldedModel = display.stones.yieldModel(this.origin.x, this.origin.y);
    YieldStone(this.origin);
    st.setOwnerPos(this.pos);
  }
  setStone() {
    const p = this.pos;
    SendMessage(this, 'disconnect');
    YieldStone(p);
    const ys = this.yieldedStone;
    if (ys) {
      const id = ys.id;
      SetStone(p, ys);
      if (GameObject.getObject(id)) {
        display.stones.set(p.x, p.y, this.yieldedModel);
        ys.on_move(this.origin);
        if (GameObject.getObject(id)) SendMessage(ys, '_model_reanimated');
      }
      this.yieldedStone = null; this.yieldedModel = null;
    }
    DisposeObject(this);
  }
  setState(_s: number) {}
  is_floating() { return this.state === VANISHING && (this.yieldedStone === null || this.yieldedStone.is_floating()); }
  is_sticky(_a: Actor) { return true; }
  is_removable() { return this.state === IDLE; }
}

// ----- st_swap
class SwapStone extends YieldingStone {
  getClass() { return 'st_swap'; }
  movableTrait() { return MOVABLE_IRREGULAR; }
  init_model() { this.set_model('st_swap'); }
  is_transparent(d: number) { return this.state === VANISHING && this.yieldedStone !== null && this.yieldedStone.is_transparent(d); }
  on_impulse(impulse: Impulse) {
    if (this.state !== IDLE) return;
    const oldPos = this.pos;
    const newPos = oldPos.move(impulse.dir);
    const other = GetStone(newPos);
    if (!IsInsideLevel(newPos) || !other || !other.is_removable()) { this.propagateImpulse(impulse); return; }
    const vanish = MakeObject('st_swap') as SwapStone;
    vanish.state = VANISHING;
    YieldStone(oldPos);
    SetStone(oldPos, vanish);
    vanish.yieldStone(other);
    vanish.set_model('st_swap' + SUFFIX[reverseDir(impulse.dir)]);
    GameTimer.set_alarm(vanish, 0.1, false);
    SetStone(newPos, this);
    this.state = APPEARING;
    this.set_model('st_swap' + SUFFIX[impulse.dir]);
    GameTimer.set_alarm(this, 0.1, false);
    IncMoveCounter();
    this.sound_event('moveslow');
    this.propagateImpulse(impulse);
  }
  alarm() {
    if (this.state === APPEARING) { this.state = IDLE; if (this.isDisplayable()) this.init_model(); }
    else if (this.state === VANISHING) this.setStone();
    else throw new XLevelRuntime('SwapStone: alarm called with inconsistent state');
  }
}
Register('st_swap', new SwapStone());

// ----- st_pull
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
function blocks(st: Stone | null, a: Actor, face: number) {
  return st !== null && ((st.getClass() === 'st_window' && (st.getFaces() & toBits(face)) !== 0) || st.is_sticky(a));
}
class PullStone extends YieldingStone {
  getClass() { return 'st_pull'; }
  movableTrait() { return MOVABLE_IRREGULAR; }
  init_model() { this.set_model('st_pull'); }
  is_transparent(d: number) { return this.state !== VANISHING || (this.yieldedStone !== null && this.yieldedStone.is_transparent(d)); }
  on_impulse(impulse: Impulse) {
    if (this.state !== IDLE) return;
    const oldPos = this.pos;
    const dir = reverseDir(impulse.dir);
    const newPos = oldPos.move(dir);
    const other = GetStone(newPos);
    if (!IsInsideLevel(newPos) || (other && !other.is_removable())) { this.propagateImpulse(impulse); return; }
    const vanish = MakeObject('st_pull') as PullStone;
    vanish.state = VANISHING;
    YieldStone(oldPos);
    SetStone(oldPos, vanish);
    vanish.yieldStone(other);
    vanish.set_model('st_pull' + SUFFIX[impulse.dir]);
    GameTimer.set_alarm(vanish, 0.09, false);
    SetStone(newPos, this);
    this.state = APPEARING;
    this.set_model('st_pull' + SUFFIX[reverseDir(impulse.dir)]);
    GameTimer.set_alarm(this, 0.09, false);
    const frozen: Actor[] = [];
    for (const a of GetActorsInRange(newPos.center(), 1.415)) {
      const ap = GridPos.of(a.ai.pos);
      const r = a.ai.radius;
      if (ap.eq(newPos)) {
        frozen.push(a);
        SendMessage(a, '_freeze');
        let dx = clamp(a.ai.pos.x, oldPos.x + 0.01, oldPos.x + 0.99);
        let dy = clamp(a.ai.pos.y, oldPos.y + 0.01, oldPos.y + 0.99);
        if (dir === EAST || dir === WEST) {
          if (blocks(GetStone(oldPos.move(NORTH)), a, SOUTH)) dy = Math.max(dy, oldPos.y + r);
          if (blocks(GetStone(oldPos.move(SOUTH)), a, NORTH)) dy = Math.min(dy, oldPos.y + 1 - r);
        } else if (dir === NORTH || dir === SOUTH) {
          if (blocks(GetStone(oldPos.move(WEST)), a, EAST)) dx = Math.max(dx, oldPos.x + r);
          if (blocks(GetStone(oldPos.move(EAST)), a, WEST)) dx = Math.min(dx, oldPos.x + 1 - r);
        }
        WarpActor(a, dx, dy, false);
      }
    }
    vanish.setAttr('$frozen_actors', makeGroup(frozen));
    this.sound_event('moveslow');
    this.propagateImpulse(impulse);
  }
  alarm() {
    if (this.state === APPEARING) { this.state = IDLE; if (this.isDisplayable()) this.init_model(); }
    else if (this.state === VANISHING) {
      for (const a of getObjectList(this.getAttr('$frozen_actors'), null)) if (a) SendMessage(a, '_revive');
      this.setStone();
    } else throw new XLevelRuntime('PullStone: alarm called with inconsistent state');
  }
}
Register('st_pull', new PullStone());
