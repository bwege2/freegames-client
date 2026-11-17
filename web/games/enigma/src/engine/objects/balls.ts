// The marbles and pearls (actors/Balls.cc): states, falling, sinking, shattering, jumping, shields.
import {
  Actor, Register, server, toInt, toBool, GetFloor, GetItem, GetStone, SendMessage, GrabActor, ReleaseActor, display,
  GetPushDirection, NODIR, valueEquals, XLevelRuntime, len,
  type ActorTraits, type Message, type Value, type V2, type StoneContact,
} from '../core.ts';
import type { SpriteHandle } from '../display.ts';

const NO_STATE = 0, NORMAL = 1, SHATTERING = 2, DEAD = 3, BUBBLING = 4, FALLING = 5, JUMPING = 6, APPEARING = 7, DISAPPEARING = 8,
  FALLING_VORTEX = 9, RISING_VORTEX = 10, JUMP_VORTEX = 11, RESURRECTED = 12;
const NOHALO = 0, HALOBLINK = 1, HALONORMAL = 2;
const minSinkDepth = 0, maxSinkDepth = 7;
const GLASS = 2;
const SHIELD_TIME = 10.0;

export abstract class BasicBall extends Actor {
  sinkDepth = minSinkDepth; sinkModel = -1; lastshinep = false; vortex_normal_time = 0;
  halosprite: SpriteHandle | null = null;
  shield_rest_time = 0; halostate = NOHALO; drunk_rest_time = 0; invisible_rest_time = 0;
  constructor(tr: ActorTraits) { super(tr); this.state = NO_STATE; }
  message(m: Message): Value {
    let handled = false;
    switch (this.state) {
      case NORMAL:
        if (m.message === '_shatter') { this.changeStateNoShield(SHATTERING); handled = true; }
        else if (m.message === '_suicide') { this.inplaceRespawn = true; this.changeState(SHATTERING); handled = true; }
        else if (m.message === '_laserhit') { if (toInt(this.getAttr('color')) !== GLASS) { this.centerRespawn = false; this.changeStateNoShield(SHATTERING); } handled = true; }
        else if (m.message === '_fall') { this.changeStateNoShield(FALLING); handled = true; }
        else if (m.message === '_fallvortex') { this.changeState(FALLING_VORTEX); handled = true; }
        else if (m.message === '_jump') { this.changeState(JUMPING); handled = true; }
        else if (m.message === '_appear') { this.changeState(APPEARING); handled = true; }
        else if (m.message === '_disappear') { this.changeState(DISAPPEARING); handled = true; }
        else if (m.message === '_setcolor') {
          if (this.traits().name.startsWith('ac_pearl') && toInt(m.value) === GLASS) throw new XLevelRuntime('ac_pearl_glass not yet defined (will come soon).');
          this.setAttr('color', m.value);
          this.update_model();
          return true;
        }
        break;
      case JUMPING:
        if (m.message === '_shatter') { this.changeStateNoShield(SHATTERING); handled = true; }
        else if (m.message === '_disappear') { this.changeState(DISAPPEARING); handled = true; }
        break;
      case SHATTERING:
        if (m.message === '_levelfinish') { this.changeState(DEAD); handled = true; }
        break;
      case DEAD:
        if (m.message === '_resurrect') { this.changeState(RESURRECTED); handled = true; }
        break;
      case FALLING_VORTEX:
        if (m.message === '_rise') this.changeState(RISING_VORTEX);
        else if (m.message === '_appear') { this.changeState(APPEARING); handled = true; }
        break;
      case JUMP_VORTEX:
        if (m.message === '_laserhit') { this.changeState(SHATTERING); handled = true; }
        break;
      case APPEARING:
        if (m.message === '_init') { super.message(m); handled = true; }
        else if (m.message === '_shatter') { this.changeState(SHATTERING); handled = true; }
        break;
    }
    if (this.state !== DEAD) {
      if (m.message === '_shield' && this.getAttr('owner') !== undefined && toInt(this.getAttr('owner')) === toInt(m.value)) {
        this.shield_rest_time += SHIELD_TIME; this.update_halo(); return true;
      }
      if (m.message === '_invisibility') { this.invisible_rest_time += 8.0; return true; }
      if (m.message === '_booze') { this.drunk_rest_time += toInt(m.value); return true; }
    }
    return handled ? undefined : super.message(m);
  }
  externalState() { return this.state === DEAD ? 1 : 0; }
  setState(_s: number) {}
  is_dead() { return this.state === DEAD; }
  isMoribund() { return this.state === DEAD || this.state === SHATTERING || this.state === BUBBLING || this.state === FALLING || this.state === RESURRECTED; }
  is_movable() { return this.state !== DEAD && this.state !== RESURRECTED && this.state !== APPEARING && this.state !== DISAPPEARING; }
  is_flying() { return this.state === JUMPING; }
  is_on_floor() { return this.state === NORMAL || this.state === JUMP_VORTEX || this.state === APPEARING; }
  is_drunken() { return this.drunk_rest_time > 0; }
  is_invisible() { return this.invisible_rest_time > 0; }
  can_drop_items() { return this.state === NORMAL || this.state === JUMP_VORTEX || this.state === JUMPING; }
  can_pickup_items() { return this.state === NORMAL || this.state === JUMP_VORTEX; }
  can_be_warped() { return this.state === NORMAL; }
  has_shield() { return this.shield_rest_time > 0; }
  on_collision(a: Actor): boolean {
    if (toInt(this.getAttr('color')) === GLASS && !this.is_flying() && !a.is_flying()) {
      const dx = this.ai.vel.x - a.ai.vel.x, dy = this.ai.vel.y - a.ai.vel.y;
      if (dx * dx + dy * dy > 16) this.changeStateNoShield(SHATTERING);
    }
    return false;
  }
  on_creation(p: V2) {
    const recreation = this.ai.created;
    super.on_creation(p);
    if (server.CreatingPreview) this.changeState(NORMAL);
    else if (recreation) { this.changeState(NORMAL); ReleaseActor(this); }
    else this.changeState(APPEARING);
  }
  think(dt: number) {
    if (this.invisible_rest_time > 0) this.invisible_rest_time -= dt;
    if (this.shield_rest_time > 0) this.shield_rest_time -= dt;
    switch (this.state) {
      case NORMAL:
        if (this.drunk_rest_time > 0) this.drunk_rest_time -= dt;
        this.sink(dt);
        break;
      case JUMP_VORTEX:
        this.vortex_normal_time += dt;
        if (this.vortex_normal_time > 0.025 && this.vortex_normal_time > dt) this.changeState(JUMPING);
        break;
    }
    super.think(dt);
  }
  on_respawn(p: V2) {
    super.on_respawn(p);
    this.changeState(APPEARING);
    SendMessage(GetFloor(this.ai.gridpos), '_dying', false, this);
    SendMessage(GetItem(this.ai.gridpos), '_dying', false, this);
    SendMessage(GetStone(this.ai.gridpos), '_dying', false, this);
  }
  move_screen() { this.update_model(); this.update_halo(); super.move_screen(); }
  hide() { super.hide(); this.disable_shield(); }
  animcb() {
    const kind = this.getKind();
    switch (this.state) {
      case SHATTERING: this.set_model(kind + '-shattered'); this.changeState(DEAD); break;
      case BUBBLING: this.set_model('invisible'); this.changeState(DEAD); break;
      case FALLING:
        this.set_model(kind + '-fallen');
        this.sound_event(this.traits().name === 'ac_pearl_white' ? 'shattersmall' : 'shatter');
        this.changeState(DEAD);
        break;
      case JUMPING: this.set_model(kind); this.changeState(NORMAL); break;
      case APPEARING: this.set_model(kind); this.changeState(NORMAL); break;
      case DISAPPEARING: this.set_model('ring-anim'); break;
      case FALLING_VORTEX: this.set_model(kind + '-fallen'); break;
      case RISING_VORTEX: {
        this.set_model(kind);
        const it = GetItem(this.ai.gridpos);
        if (it && (it.getClass() === 'it_vortex' )) SendMessage(it, '_passed');
        this.changeState(JUMP_VORTEX);
        break;
      }
    }
  }
  sink(dt: number) {
    let sink = 0, raise = 0;
    const f = this.ai.field!;
    const fl = f.floor, it = f.item;
    if (!(it && it.covers_floor(this.ai.pos, this)) && fl) [sink, raise] = fl.get_sink_speed();
    if (sink === 0 || this.has_shield() || toInt(this.getAttr('color')) === GLASS) { this.sinkDepth = minSinkDepth; this.sinkModel = -1; }
    else {
      const ss = sink * (1 - len(this.ai.vel.x, this.ai.vel.y) / raise);
      this.sinkDepth += ss * dt;
      if (this.sinkDepth >= maxSinkDepth) {
        this.set_model(this.getKind() + '-sunk');
        this.ai.vel.x = 0; this.ai.vel.y = 0;
        this.sound_event('swamp');
        this.changeState(BUBBLING);
      } else if (this.sinkDepth < minSinkDepth) this.sinkDepth = minSinkDepth;
    }
  }
  disable_shield() { if (this.has_shield()) { this.shield_rest_time = 0; this.update_halo(); } }
  changeStateNoShield(ns: number) { if (!this.has_shield()) this.changeState(ns); }
  changeState(ns: number) {
    if (ns === this.state) return;
    const kind = this.getKind();
    const old = this.state;
    this.state = ns;
    if (old === JUMPING) {
      SendMessage(GetStone(this.ai.gridpos), '_jumping', false);
      SendMessage(GetItem(this.ai.gridpos), '_jumping', false);
      SendMessage(GetFloor(this.ai.gridpos), '_jumping', false);
    }
    this.sinkDepth = minSinkDepth;
    this.sinkModel = -1;
    switch (ns) {
      case NORMAL:
        if (old === APPEARING) { this.ai.forceacc.x = 0; this.ai.forceacc.y = 0; }
        ReleaseActor(this);
        break;
      case SHATTERING:
        this.sound_event(this.traits().name === 'ac_marble_white' ? 'shattersmall' : 'shatter');
        GrabActor(this);
        this.set_anim(kind + '-shatter');
        break;
      case BUBBLING:
        GrabActor(this);
        this.invisible_rest_time = 0;
        this.set_anim('ac-drowned');
        break;
      case FALLING: case FALLING_VORTEX:
        GrabActor(this);
        this.set_anim(kind + '-fall');
        break;
      case DEAD:
        this.disable_shield();
        this.drunk_rest_time = 0;
        this.invisible_rest_time = 0;
        SendMessage(GetFloor(this.ai.gridpos), '_dying', true, this);
        SendMessage(GetItem(this.ai.gridpos), '_dying', true, this);
        SendMessage(GetStone(this.ai.gridpos), '_dying', true, this);
        break;
      case JUMPING:
        this.sound_event('jump');
        this.set_anim(kind + '-jump');
        SendMessage(GetFloor(this.ai.gridpos), '_jumping', true);
        SendMessage(GetItem(this.ai.gridpos), '_jumping', true);
        SendMessage(GetStone(this.ai.gridpos), '_jumping', true);
        break;
      case APPEARING: case RISING_VORTEX:
        this.set_anim(kind + '-appear');
        GrabActor(this);
        break;
      case JUMP_VORTEX:
        if (old !== RISING_VORTEX) throw new XLevelRuntime('BasicBall: change to state JUMP_VORTEX but not RISING_VORTEX');
        this.vortex_normal_time = 0;
        this.set_model(kind);
        ReleaseActor(this);
        break;
      case DISAPPEARING:
        GrabActor(this);
        this.disable_shield();
        this.set_anim(kind + '-disappear');
        break;
      case RESURRECTED:
        this.disable_shield();
        this.sinkDepth = minSinkDepth;
        break;
    }
  }
  update_model() {
    if (this.invisible_rest_time > 0) this.sprite?.hide(); else this.sprite?.show();
    if (this.state === NORMAL) {
      if (this.sinkDepth > minSinkDepth && this.sinkDepth < maxSinkDepth) this.setSinkModel(this.getKind());
      else {
        const xp = roundNearest(this.ai.pos.x * 32.0), yp = roundNearest(this.ai.pos.y * 32.0);
        this.setShineModel((xp + yp) % 2 !== 0);
      }
    }
  }
  setSinkModel(m: string) {
    const n = Math.floor(this.sinkDepth);
    if (!this.has_shield() && n !== this.sinkModel) {
      this.set_model(m + '-sink' + n);
      this.sinkModel = n;
    }
  }
  setShineModel(shine: boolean) {
    if (shine !== this.lastshinep) {
      const n = this.getKind();
      this.set_model(shine ? n + '-shine' : n);
      this.lastshinep = shine;
    }
  }
  update_halo() {
    let ns: number;
    if (this.shield_rest_time <= 0) ns = NOHALO;
    else if (this.shield_rest_time <= 3.0) ns = HALOBLINK;
    else ns = HALONORMAL;
    if (ns !== this.halostate) {
      const r = this.ai.radius;
      const kind = r === 19.0 / 64 ? 'halo' : r === Math.fround(13.0 / 64) ? 'halo-small' : 'halo';
      if (this.halostate === NOHALO) this.halosprite = display.addSprite(this.ai.pos, kind);
      if (ns === NOHALO) { this.halosprite?.kill(); this.halosprite = null; }
      else if (ns === HALOBLINK) this.halosprite?.replace(display.makeModel(kind + '-blink'));
      else this.halosprite?.replace(display.makeModel(kind));
      this.halostate = ns;
    } else if (this.halostate !== NOHALO) this.halosprite?.move(this.ai.pos);
  }
  beforeStoneBounce(sc: StoneContact) {
    if (toInt(this.getAttr('color')) === GLASS) {
      if (GetPushDirection(sc) !== NODIR) { this.changeStateNoShield(SHATTERING); return; }
      if (sc.outerCorner && sc.is_contact) {
        const v = sc.actor.ai.vel;
        if (v.x * v.x + v.y * v.y > 3) this.changeStateNoShield(SHATTERING);
      }
    }
  }
}
function roundNearest(v: number) { return v > 0 ? Math.floor(v + 0.5) : -Math.floor(-v + 0.5); }

const MARBLE_TRAITS: ActorTraits[] = [
  { name: 'ac_marble_black', radius: 19.0 / 64, mass: 1.0 },
  { name: 'ac_marble_white', radius: 19.0 / 64, mass: 1.0 },
  { name: 'ac_marble_glass', radius: 19.0 / 64, mass: 0.5 },
];
export class Marble extends BasicBall {
  constructor(color: number) {
    super(MARBLE_TRAITS[color]);
    this.setAttr('adhesion', 1.0);
    this.setAttr('color', color);
    this.setAttr('owner', color === 1 ? 1 : 0);
    this.setAttr('controllers', color === 1 ? 2 : 1);
  }
  getClass() { return 'ac_marble'; }
  traits() { return MARBLE_TRAITS[Math.max(0, Math.min(2, toInt(this.getAttr('color'))))]; }
}
const PEARL_TRAITS: ActorTraits[] = [
  { name: 'ac_pearl_black', radius: 13.0 / 64, mass: 0.7 },
  { name: 'ac_pearl_white', radius: 13.0 / 64, mass: 0.7 },
];
export class Pearl extends BasicBall {
  constructor(color: number) {
    super(PEARL_TRAITS[color]);
    this.setAttr('adhesion', 1.0);
    this.setAttr('color', color);
    this.setAttr('owner', 0);
    this.setAttr('controllers', 3);
  }
  getClass() { return 'ac_pearl'; }
  traits() { return PEARL_TRAITS[toInt(this.getAttr('color')) === 0 ? 0 : 1]; }
}
Register('ac_marble', new Marble(0)); Register('ac_marble_black', new Marble(0)); Register('ac_marble_white', new Marble(1));
Register('ac_marble_glass', new Marble(2)); Register('ac_pearl', new Pearl(1)); Register('ac_pearl_white', new Pearl(1));
Register('ac_pearl_black', new Pearl(0));
export const _keep = [valueEquals, toBool];
