// Items: items/Vortex.cc, SeedItem.cc.
import {
  Item, Actor, Register, server, GameTimer, GetItem, GetStone, SetStone, MakeStone, SendMessage,
  BroadcastMessage, WarpActor, display, toBool, toInt, toStr, objValue, toObject, XLevelRuntime, GridPos, V2,
  itf_static, itf_fireproof, itf_indestructible,
  type Message, type Value, type TimeHandler, type ItemTraits, type Stone,
} from '../core.ts';
import { destinationByIndexV } from './misc.ts';

// ----- it_vortex
const OPEN = 0, CLOSED = 1, OPENING = 2, CLOSING = 3, WARPING = 4, EMITTING = 5, SWALLOWING = 6;
const dist = (a: V2, b: V2) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
class Vortex extends Item implements TimeHandler {
  constructor(open: boolean) {
    super();
    this.state = open ? OPEN : CLOSED;
    this.setAttr('$dest_idx', 0);
    this.setAttr('$dest_vortex', objValue(null));
    this.setAttr('$grabbed_actor', objValue(null));
  }
  traits(): ItemTraits {
    return { name: this.externalState() === 1 ? 'it_vortex_open' : 'it_vortex_closed', flags: itf_static | itf_fireproof | itf_indestructible, radius: 0 };
  }
  getClass() { return 'it_vortex'; }
  dispose() {
    GameTimer.remove_alarm(this);
    const a = toObject(this.getAttr('$grabbed_actor'));
    if (a instanceof Actor) SendMessage(a, '_rise');
    super.dispose();
  }
  message(m: Message): Value {
    if (m.message === '_passed' && toBool(this.getAttr('autoclose'))) {
      this.setState(0);
      this.performAction(this.getAttr('$grabbed_actor'));
      return null;
    }
    return super.message(m);
  }
  externalState() { return this.state >= CLOSED && this.state <= CLOSING ? 0 : 1; }
  setState(ext: number) {
    if (this.isDisplayable()) {
      if (ext === 1) {
        if (this.state === CLOSING) { this.state = OPENING; this.get_model()?.reverse(); }
        else if (this.state === CLOSED) { this.state = OPENING; this.sound_event('vortexopen'); this.init_model(); }
      } else if (ext === 0) {
        if (this.state === OPENING) { this.state = CLOSING; this.get_model()?.reverse(); }
        else if (this.state === OPEN) { this.state = CLOSING; this.sound_event('vortexclose'); this.init_model(); }
      }
    } else if (ext <= 1 && ext >= 0) this.state = 1 - ext;
  }
  toggleState() { if (this.state === OPEN || this.state === OPENING) this.setState(0); else this.setState(1); }
  init_model() {
    switch (this.state) {
      case WARPING: case OPEN: case EMITTING: case SWALLOWING: this.set_model('it_vortex_open'); break;
      case CLOSED: this.set_model('it_vortex_closed'); break;
      case OPENING: this.set_anim('it_vortex_opening'); break;
      case CLOSING: this.set_anim('it_vortex_closing'); break;
    }
  }
  on_removal(p: GridPos) {
    super.on_removal(p);
    if (this.state === WARPING || this.state === SWALLOWING || this.state === EMITTING) throw new XLevelRuntime('Tried to kill a busy vortex. Please use another way.');
  }
  animcb() {
    if (this.state === CLOSING) { this.state = CLOSED; this.init_model(); }
    else if (this.state === OPENING) { this.state = OPEN; this.init_model(); BroadcastMessage('_checkflood', true, true, false, false); }
  }
  covers_floor(pos: V2, _a: Actor) {
    if (!GridPos.of(pos).eq(this.pos)) return false;
    return dist(pos, this.pos.center()) < 0.25;
  }
  actor_hit(a: Actor) {
    if (this.state === OPEN && dist(a.ai.pos, this.pos.center()) < 0.25 && a.can_be_warped()) this.prepareForWarp(a);
    else if (this.state === CLOSED && dist(a.ai.pos, this.pos.center()) > 0.25 && toBool(this.getAttr('autoopen'))) this.toggleState();
    return false;
  }
  warpSpreadPos(_isWater: boolean): GridPos[] {
    const out: GridPos[] = [];
    if (this.externalState() > 0) {
      let idx = 0, t: V2 | null;
      while ((t = destinationByIndexV(this, idx++))) {
        const g = GridPos.of(t);
        const v = GetItem(g);
        if (v instanceof Vortex) { if (v.externalState() === 1) out.push(g); } else out.push(g);
      }
    }
    return out;
  }
  alarm() {
    if (this.state === WARPING) this.performWarp();
    else if (this.state === EMITTING) { const d = toObject(this.getAttr('$dest_vortex')); this.emitActor(d instanceof Vortex ? d : null); }
    else if (this.state === SWALLOWING) { this.state = WARPING; this.sound_event('hitfloor'); this.performWarp(); }
    else throw new XLevelRuntime('Vortex: alarm called with inconsistent state');
  }
  private grabbed(): Actor | null { const a = toObject(this.getAttr('$grabbed_actor')); return a instanceof Actor ? a : null; }
  private isScissor() {
    const v = this.getAttr('scissor');
    return v !== undefined && v !== null ? toBool(v) : server.EnigmaCompatibility >= 1.10;
  }
  private prepareForWarp(a: Actor) {
    SendMessage(a, '_fallvortex');
    this.setAttr('$dest_idx', 0);
    this.setAttr('$grabbed_actor', objValue(a));
    this.state = SWALLOWING;
    GameTimer.set_alarm(this, 0.4, false);
  }
  private emitActor(dest: Vortex | null) {
    if (!dest) dest = this;
    const v = dest.pos.center();
    const a = this.grabbed();
    if (a) {
      WarpActor(a, v.x, v.y, false);
      SendMessage(a, '_rise');
      if (dest !== this && this.isScissor()) SendMessage(a, 'disconnect');
    }
    this.state = OPEN;
    if (this !== dest && toBool(this.getAttr('autoclose'))) this.setState(0);
    if (this !== dest) this.performAction(this.getAttr('$grabbed_actor'));
    this.setAttr('$grabbed_actor', objValue(null));
  }
  private warpTo(t: V2) {
    display.sparkle(t);
    const a = this.grabbed();
    if (a) {
      WarpActor(a, t.x, t.y, false);
      SendMessage(a, '_appear');
      if (this.isScissor()) SendMessage(a, 'disconnect');
    }
    this.state = OPEN;
    if (toBool(this.getAttr('autoclose'))) this.setState(0);
    this.performAction(this.getAttr('$grabbed_actor'));
    this.setAttr('$grabbed_actor', objValue(null));
  }
  private performWarp() {
    const a = this.grabbed();
    if (!a) return;
    if (this.state !== WARPING) throw new XLevelRuntime('Vortex: perform_warp called with inconsistent state');
    const idx = toInt(this.getAttr('$dest_idx'));
    const t = destinationByIndexV(this, idx);
    if (t) {
      const g = GridPos.of(t);
      const v = GetItem(g);
      if (v instanceof Vortex) {
        const st = GetStone(g);
        if (st && st.is_sticky(a)) {
          this.setAttr('$dest_idx', idx + 1);
          display.sparkle(g.center());
          WarpActor(a, t.x, t.y, false);
          GameTimer.set_alarm(this, 0.8, false);
        } else {
          switch (v.state) {
            case OPEN: case OPENING: this.emitActor(v); break;
            case CLOSED: case CLOSING:
              SendMessage(v, 'open');
              this.setAttr('$dest_vortex', objValue(v));
              this.state = EMITTING;
              GameTimer.set_alarm(this, 0.4, false);
              break;
            default: this.emitActor(this);
          }
        }
      } else this.warpTo(t);
    } else this.emitActor(this);
  }
}
Register('it_vortex', new Vortex(true)); Register('it_vortex_closed', new Vortex(false)); Register('it_vortex_open', new Vortex(true));

// ----- it_seed
const FLAVORS = ['wood', 'greenbrown', 'volcano', 'hay'];
const SEED_IDLE = 0, SEED_ACTIVE = 1;
class SeedItem extends Item {
  flavor: number;
  constructor(flavor: number) { super(); this.flavor = flavor; }
  traits(): ItemTraits { return { name: `it_seed_${FLAVORS[this.flavor]}`, flags: itf_static, radius: 0.2 }; }
  getClass() { return 'it_seed'; }
  setAttr(key: string, val: Value) {
    if (key === 'flavor') {
      const f = FLAVORS.indexOf(toStr(val));
      if (f < 0) throw new XLevelRuntime(`Seed: illegal flavor value ${toStr(val)}`);
      this.flavor = f;
      if (this.isDisplayable()) this.init_model();
      return;
    }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'flavor') return FLAVORS[this.flavor];
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === 'grow' || m.message === 'signal') { if (this.isDisplayable()) this.startGrowing(); return null; }
    return super.message(m);
  }
  setState(s: number) { this.state = s; if (this.state === SEED_ACTIVE && this.isDisplayable()) this.startGrowing(); }
  init_model() { if (this.state === SEED_IDLE) this.set_model('it_seed'); else this.set_anim('it_seed_growing'); }
  processLight(_d: number) { this.startGrowing(); }
  animcb() {
    const p = this.pos;
    const kind = ['st_box_wood_growing', 'st_greenbrown_growing', 'st_volcano_growing', 'st_box_hay_growing'][this.flavor];
    const st = MakeStone(kind) as Stone | null;
    if (!st) throw new XLevelRuntime('SeedItem - failure on stone creation');
    this.transferIdentity(st);
    const v = this.getAttr('secure');
    if (v !== undefined && v !== null) st.setAttr('secure', v);
    SetStone(p, st);
    this.kill();
  }
  get_inventory_model() { return 'it_seed'; }
  isStatic() { return this.state === SEED_ACTIVE; }
  on_drop(_a: Actor) { this.startGrowing(); }
  on_stonehit(_st: Stone) { this.startGrowing(); }
  actor_hit(a: Actor) { if (this.state === SEED_ACTIVE) return false; return super.actor_hit(a); }
  private startGrowing() {
    if (this.state === SEED_IDLE) { this.state = SEED_ACTIVE; this.sound_event('seedgrow'); this.set_anim('it_seed_growing'); }
  }
}
Register('it_seed', new SeedItem(0)); Register('it_seed_wood', new SeedItem(0)); Register('it_seed_greenbrown', new SeedItem(1));
Register('it_seed_volcano', new SeedItem(2)); Register('it_seed_hay', new SeedItem(3));
