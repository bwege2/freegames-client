// Objects: items/Meditation.cc, stones/ActorImpulseStone.cc, QuakeStone.cc, StoneImpulse.cc, FlatStone.cc.
import {
  Item, Stone, Register, server, toInt, toBool, toDouble, GetFloor, GetObjectTemplate, SendMessage, KillStone,
  ChangeMeditation, DoubleRand, GetActorsInsideField, getObjectList, maybe_push_stone, display, len, reverseDir,
  STONE_PASS, STONE_REBOUND, MOVABLE_PERSISTENT, MOVABLE_STANDARD, MOVABLE_BREAKABLE, MOVABLE_IRREGULAR, NODIR, WEST, NORTH,
  GameObject, player, itf_static, itf_fireproof, itf_freezable,
  type GridPos, type Message, type Value, type Actor, type StoneContact, type Impulse, type V2, type ItemTraits,
} from '../core.ts';
import { wieldedItemIs } from './stones2.ts';
import { dirFromTo } from './stones1.ts';
import { updateCurrentLightDirs } from './laser.ts';

// ----- meditation hollows and hills
const CALDERA = -3, HOLLOW = -2, DENT = -1, BUMP = 1, HILL = 2, VOLCANO = 3;
const MED = ['it_meditation_caldera', 'it_meditation_hollow', 'it_meditation_dent', 'it_meditation_bump', 'it_meditation_hill', 'it_meditation_volcano'];
class Meditation extends Item {
  indispensable = false;
  whiteball: Actor | null = null;
  enterTime = 0;
  constructor(s: number) { super(); this.state = s; }
  traits(): ItemTraits { return { name: MED[this.state < 0 ? this.state + 3 : this.state + 2], flags: itf_static | itf_fireproof | itf_freezable, radius: 0 }; }
  getClass() { return 'it_meditation'; }
  setAttr(key: string, val: Value) {
    if (key === 'essential') {
      const ess = toInt(val) === 1;
      if (ess !== this.indispensable) {
        if (this.isDisplayable()) {
          if (this.whiteball && this.enterTime === -1) ChangeMeditation(0, 0, this.indispensable ? -1 : 1, this.indispensable ? 1 : -1);
          ChangeMeditation(0, ess ? 1 : -1, 0, 0);
        }
        this.indispensable = !this.indispensable;
      }
      return;
    }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value { return key === 'essential' ? (this.indispensable ? 1 : 0) : super.getAttr(key); }
  message(m: Message): Value {
    if (m.message === 'flip') { this.setState(-this.state); return null; }
    if (m.message === 'signal') { this.setState(toDouble(m.value) !== 0 ? Math.abs(this.state) : -Math.abs(this.state)); return null; }
    if (m.message === 'shovel') { this.shovel(); return null; }
    if (m.message === '_init') { this.checkActors(); return null; }
    if (m.message === '_dying') { if (this.whiteball === m.sender && toBool(m.value)) this.deregister(); return null; }
    return super.message(m);
  }
  minState() { return CALDERA; }
  maxState() { return VOLCANO; }
  toggleState() {
    const map: Record<number, number> = { [CALDERA]: HILL, [HOLLOW]: VOLCANO, [DENT]: BUMP, [BUMP]: DENT, [HILL]: CALDERA, [VOLCANO]: HOLLOW };
    this.setState(map[this.state]);
  }
  setState(s: number) { if (s !== this.state && s !== 0) { this.state = s; if (this.isDisplayable()) this.init_model(); } }
  on_creation(p: GridPos) {
    if (this.indispensable) ChangeMeditation(0, 1, 0, 0);
    if (server.WorldInitialized) this.checkActors();
    super.on_creation(p);
  }
  on_removal(p: GridPos) {
    if (this.indispensable) ChangeMeditation(0, -1, 0, 0);
    if (this.whiteball) this.deregister();
    super.on_removal(p);
  }
  actor_leave(a: Actor) { if (this.whiteball === a) this.deregister(); }
  on_stonehit() { this.shovel(); }
  actor_hit(a: Actor) {
    const pearl = a.traits().name === 'ac_pearl_white' || a.traits().name === 'ac_pearl_black';
    if (!this.whiteball && !a.is_flying() && !a.is_dead() && pearl && this.isMeditating(a)) { this.whiteball = a; this.enterTime = server.LevelTime; }
    else if (this.whiteball === a) {
      if (a.is_flying() || a.is_dead() || !this.isMeditating(a)) {
        this.whiteball = null;
        if (this.enterTime === -1) ChangeMeditation(0, 0, this.indispensable ? -1 : 0, this.indispensable ? 0 : -1);
      } else if (this.enterTime !== -1 && server.LevelTime - this.enterTime >= 1.0) {
        ChangeMeditation(0, 0, this.indispensable ? 1 : 0, this.indispensable ? 0 : 1);
        this.enterTime = -1;
      }
    }
    return false;
  }
  add_force(a: Actor, f: V2) {
    const c = this.pos.center();
    let vx = a.ai.pos.x - c.x, vy = a.ai.pos.y - c.y;
    const dist = len(vx, vy);
    if (dist > (Math.abs(this.state) > 1 ? 0.5 : 0.3)) return;
    if (dist <= 0 && len(a.ai.vel.x, a.ai.vel.y) <= 0) {
      let x = DoubleRand(-0.03, 0.05), y = DoubleRand(-0.03, 0.05);
      x = x < 0.01 ? x - 0.02 : x; y = y < 0.01 ? y - 0.02 : y;
      vx = x; vy = y;
    }
    const k = (this.state < 0 ? -1 : 1) * (Math.abs(this.state) === VOLCANO && dist < 0.3 ? -1 : 1) * 90 * server.HoleForce;
    f.x += k * vx; f.y += k * vy;
  }
  isMeditating(a: Actor) {
    const c = this.pos.center();
    const d = len(a.ai.pos.x - c.x, a.ai.pos.y - c.y);
    return d < 0.24 || ((this.state <= HOLLOW || this.state >= HILL) && d < 0.4);
  }
  shovel() { const ns = this.state > 0 ? this.state - 1 : this.state + 1; if (ns === 0) this.kill(); else this.setState(ns); }
  checkActors() {
    for (const a of GetActorsInsideField(this.pos)) {
      const pearl = a.traits().name === 'ac_pearl_white' || a.traits().name === 'ac_pearl_black';
      if (!a.is_flying() && !this.whiteball && pearl && this.isMeditating(a)) { this.whiteball = a; this.enterTime = server.LevelTime; break; }
    }
  }
  deregister() {
    if (this.whiteball && this.enterTime === -1) ChangeMeditation(0, 0, this.indispensable ? -1 : 0, this.indispensable ? 0 : -1);
    this.whiteball = null;
  }
}
for (const [n, s] of [['it_meditation', -2], ['it_meditation_caldera', -3], ['it_meditation_hollow', -2], ['it_meditation_dent', -1],
  ['it_meditation_bump', 1], ['it_meditation_hill', 2], ['it_meditation_volcano', 3]] as [string, number][]) Register(n, new Meditation(s));

// ----- actor impulse (bumper)
class ActorImpulseStone extends Stone {
  invisible: boolean;
  constructor(inv: boolean) { super(); this.invisible = inv; }
  getClass() { return 'st_actorimpulse'; }
  setAttr(key: string, val: Value) {
    if (key === 'invisible') { if (toBool(val) !== this.invisible) { this.invisible = !this.invisible; if (this.isDisplayable()) this.init_model(); } }
    else super.setAttr(key, val);
  }
  getAttr(key: string): Value { return key === 'invisible' ? this.invisible : super.getAttr(key); }
  message(m: Message): Value {
    if (m.message === '_model_reanimated') { this.state = 0; this.init_model(); }
    else if (m.message === '_trigger') {
      const b = m.sender;
      if (b && toBool(m.value)) {
        b.setAttr('orientation', reverseDir(toInt(b.getAttr('orientation'))));
        this.sound_event('bumper');
        this.state = 1;
        this.set_anim('st_actorimpulse_anim');
      }
    } else if (m.message === '_glasses') { this.init_model(); return null; }
    return super.message(m);
  }
  setState(_s: number) {}
  init_model() {
    if (this.state === 0) this.set_model(this.invisible && (server.GlassesVisibility & 4) === 0 ? 'invisible' : 'st_actorimpulse');
  }
  animcb() { if (this.state === 1) { this.state = 0; this.init_model(); } }
  actor_hit(sc: StoneContact) {
    if (this.invisible && wieldedItemIs(sc.actor, 'it_brush')) this.invisible = false;
    if (this.state === 0) {
      const f = toDouble(this.getDefaultedAttr('strength', server.BumperForce));
      const c = this.pos.center();
      let vx = sc.actor.ai.pos.x - c.x, vy = sc.actor.ai.pos.y - c.y;
      const l = len(vx, vy);
      if (l) { vx /= l; vy /= l; }
      const [fx, fy] = this.distortedVelocity(vx, vy, f);
      sc.actor.add_force(fx, fy);
      this.sound_event('bumper');
      this.state = 1;
      this.set_anim('st_actorimpulse_anim');
    }
  }
  collision_sound() { return ''; }
}
Register('st_actorimpulse', new ActorImpulseStone(false));
Register('st_actorimpulse_invisible', new ActorImpulseStone(true));

// ----- quake
const Q_IDLE = 0, Q_ACTIVE = 1, Q_BREAKING = 2, Q_ACTIVEBREAKING = 3;
class QuakeStone extends Stone {
  getClass() { return 'st_quake'; }
  movableTrait() { return MOVABLE_BREAKABLE; }
  message(m: Message): Value {
    if (m.message === 'toggle' || (m.message === 'signal' && toInt(m.value) !== 0) || (m.message === '_trigger' && toBool(m.value))) { this.setState(Q_ACTIVE); return null; }
    if (m.message === 'ignite' || m.message === '_explosion') { this.setState(Q_BREAKING); return null; }
    return super.message(m);
  }
  maxState() { return Q_BREAKING; }
  externalState() { return this.state === Q_ACTIVEBREAKING ? Q_BREAKING : this.state; }
  setState(s: number) {
    if (this.state === s) return;
    if ((this.state === Q_IDLE && s === 2) || (this.state === Q_ACTIVEBREAKING && s === 0)) {
      this.state = Q_BREAKING;
      if (this.isDisplayable()) { this.quake(); this.sound_event('stonedestroy'); }
    } else if (this.state === Q_IDLE && s === Q_ACTIVE) { this.state = Q_ACTIVE; if (this.isDisplayable()) this.quake(); }
    else if (this.state === Q_ACTIVE && s === Q_IDLE) this.state = Q_IDLE;
    else if (this.state === Q_ACTIVE && s === Q_BREAKING) this.state = Q_ACTIVEBREAKING;
    else return;
    if (this.isDisplayable()) this.init_model();
  }
  init_model() {
    switch (this.state) {
      case Q_IDLE: this.set_model('st_quake'); break;
      case Q_ACTIVEBREAKING: case Q_ACTIVE: this.set_anim('st_quaking'); break;
      case Q_BREAKING: this.set_anim('st_quakebreak_anim'); break;
    }
  }
  processLight(_d: number) { this.setState(Q_BREAKING); }
  animcb() {
    if (this.state === Q_ACTIVE || this.state === Q_ACTIVEBREAKING) this.setState(Q_IDLE);
    else if (this.state === Q_BREAKING) KillStone(this.pos);
  }
  actor_hit(sc: StoneContact) { this.setState(wieldedItemIs(sc.actor, 'it_hammer') ? Q_BREAKING : Q_ACTIVE); }
  quake() { SendMessage(GetObjectTemplate('st_oxyd'), 'closeall'); this.sound_event('quake'); }
}
Register('st_quake', new QuakeStone());

// ----- stone impulse
const I_IDLE = 0, I_EXPANDING = 1, I_SHRINKING = 2, I_BREAKING = 3;
class StoneImpulse extends Stone {
  steady: boolean; hollow: boolean; movable: boolean;
  nobackfire = false; repulse = false; propagate = false; laseridle = true;
  get lightDirs() { return this.objFlags & 15; }
  constructor(steady: boolean, hollow: boolean, movable: boolean, active: boolean) {
    super(); this.steady = steady; this.hollow = hollow; this.movable = movable;
    if (active) this.state = I_EXPANDING;
  }
  getClass() { return 'st_stoneimpulse'; }
  movableTrait() { return this.movable ? MOVABLE_STANDARD : MOVABLE_PERSISTENT; }
  isHollow() { return this.hollow && !this.movable; }
  setAttr(key: string, val: Value) {
    if (key === 'hollow') { if (!this.isDisplayable()) { if (toBool(val)) { this.hollow = true; this.movable = false; this.steady = false; } else this.hollow = false; } }
    else if (key === 'movable') { if (!this.isDisplayable()) { if (toBool(val)) { this.movable = true; this.hollow = false; } else this.movable = false; } }
    else if (key === 'steady') { if (!this.isDisplayable()) { if (toBool(val)) { this.steady = true; this.hollow = false; } else this.steady = false; } }
    else if (key === 'orientation') { if (!this.isDisplayable()) { super.setAttr('$incoming', reverseDir(toInt(val))); this.nobackfire = true; } }
    else super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'hollow') return this.isHollow();
    if (key === 'movable') return this.movable;
    if (key === 'steady') return this.steady;
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === '_trigger' && toBool(m.value)) {
      let incoming = NODIR;
      if (m.sender && 'pos' in m.sender) incoming = dirFromTo((m.sender as Stone).pos, this.pos);
      if (this.state === I_IDLE && incoming !== NODIR) this.nobackfire = true;
      this.setIState(I_EXPANDING, incoming);
      return null;
    }
    if (m.message === 'signal' && (toDouble(m.value) !== 0 || server.EnigmaCompatibility < 1.10)) { this.setIState(I_EXPANDING); return null; }
    if (m.message === '_init') {
      updateCurrentLightDirs(this);
      if (this.state === I_IDLE && this.steady && this.lightDirs) this.setIState(I_EXPANDING);
      return null;
    }
    if (m.message === '_cannonball') { this.setIState(I_EXPANDING); return null; }
    return super.message(m);
  }
  setState(_s: number) {}
  init_model() {
    if (this.state === I_IDLE) this.set_model(`st_stoneimpulse${this.isHollow() ? '_hollow' : this.steady ? '_steady' : ''}`);
    else if (this.state === I_BREAKING) this.set_anim('st_stoneimpulse_breaking');
    else this.set_anim(`st_stoneimpulse${this.isHollow() ? '_hollow' : ''}_anim${this.state === I_EXPANDING ? 1 : 2}`);
  }
  on_creation(p: GridPos) {
    updateCurrentLightDirs(this);
    if (!this.isHollow()) this.activatePhoto();
    if (this.state === I_IDLE && this.steady && this.lightDirs) this.setIState(I_EXPANDING);
    else if (!this.steady && !this.lightDirs) this.laseridle = false;
    super.on_creation(p);
  }
  lightDirChanged(o: number, n: number) { if ((n & ~o) !== 0) this.setIState(I_EXPANDING); }
  animcb() {
    if (this.state === I_BREAKING) KillStone(this.pos);
    else if (this.state === I_EXPANDING) this.setIState(I_SHRINKING);
    else {
      this.setIState(I_IDLE);
      if (this.steady && this.lightDirs) this.setIState(I_EXPANDING);
      else if (!this.steady && this.lightDirs) this.laseridle = true;
    }
  }
  is_floating() { return this.isHollow(); }
  collision_response(_sc: StoneContact) { return this.state !== I_IDLE || !this.isHollow() ? STONE_REBOUND : STONE_PASS; }
  actor_inside(a: Actor) { if (this.state !== I_IDLE && this.isHollow()) SendMessage(a, '_shatter'); }
  actor_hit(sc: StoneContact) {
    if (this.state !== I_BREAKING) {
      if (this.movable && maybe_push_stone(sc)) return;
      if (!this.isHollow()) sc.actor.sendImpulse(sc.stonepos, NODIR);
    }
  }
  on_impulse(imp: Impulse) {
    if (this.state === I_BREAKING) return;
    let hitman: Actor | null = null;
    if (this.movable && imp.dir !== NODIR) {
      const ym = display.stones.yieldModel(this.pos.x, this.pos.y);
      const old = this.state;
      const didMove = this.move_stone_dir(imp.dir);
      this.state = old;
      display.stones.set(this.pos.x, this.pos.y, ym);
      hitman = imp.sender && 'ai' in imp.sender ? imp.sender as Actor : null;
      if (!hitman || !wieldedItemIs(hitman, 'it_magicwand')) {
        if (this.state === I_IDLE) this.setIState(I_EXPANDING, imp.dir);
        else if (didMove && this.state !== I_EXPANDING) { super.setAttr('$incoming', imp.dir); this.repulse = true; }
      } else if (this.steady && this.lightDirs && this.state === I_IDLE) this.setIState(I_EXPANDING, imp.dir);
    } else this.setIState(I_EXPANDING, imp.dir);
    if (this.movable && imp.dir !== NODIR) {
      if (hitman) { this.propagate = false; this.propagateImpulse(imp); } else this.propagate = true;
    }
    this.setAttr('$impulse_source', imp.sender ? imp.sender.id : 0);
  }
  setIState(ns: number, incoming = NODIR) {
    if (ns === this.state || !this.isDisplayable() || this.state === I_BREAKING) return;
    switch (ns) {
      case I_IDLE:
        this.state = ns;
        if (this.repulse) { this.repulse = false; this.setIState(I_EXPANDING, toInt(this.getAttr('$incoming'))); }
        else this.init_model();
        break;
      case I_EXPANDING:
        if (this.state !== I_IDLE) return;
        this.laseridle = false;
        super.setAttr('$incoming', incoming);
        this.state = ns;
        this.init_model();
        this.sound_event('impulse');
        break;
      case I_SHRINKING: {
        if (this.state !== I_EXPANDING) return;
        this.state = ns;
        this.init_model();
        const p = this.pos;
        const origin = reverseDir(toInt(this.getAttr('$incoming')));
        for (let d = WEST; d <= NORTH; d++) if (!this.nobackfire || d !== origin) this.sendImpulse(p.move(d), d);
        if (!this.movable || this.propagate) this.propagateImpulse({ sender: this, dest: p, dir: toInt(this.getAttr('$incoming')), byWire: false });
        this.propagate = false;
        break;
      }
    }
  }
  propagateImpulse(imp: Impulse) {
    if (!imp.byWire && imp.dir !== NODIR) {
      const src = toInt(this.getDefaultedAttr('$impulse_source', 0));
      for (const f of getObjectList(this.getAttr('fellows'), null)) {
        if (f instanceof Stone && f.id !== src) f.on_impulse({ sender: this, dest: f.pos, dir: imp.dir, byWire: true });
      }
    }
    this.setAttr('$impulse_source', 0);
  }
}
Register('st_stoneimpulse', new StoneImpulse(false, false, false, false));
Register('st_stoneimpulse_steady', new StoneImpulse(true, false, false, false));
Register('st_stoneimpulse_hollow', new StoneImpulse(false, true, false, false));
Register('st_stoneimpulse_movable', new StoneImpulse(false, false, true, false));
Register('st_stoneimpulse_new', new StoneImpulse(false, false, false, true));

// ----- flat stones
const F_IDLE = 0, F_CRACKED = 1, F_BREAKING = 2, F_FALLING = 3;
class FlatStone extends Stone {
  hollow: boolean; movable: boolean; breakable: boolean; burnable: boolean; glasses = false;
  constructor(hollow: boolean, movable: boolean, breakable = false, cracked = false, burnable = false, breaking = false) {
    super(); this.hollow = hollow; this.movable = movable; this.breakable = breakable; this.burnable = burnable;
    if (cracked) this.state = F_CRACKED;
    if (breaking) this.state = F_BREAKING;
  }
  getClass() { return 'st_flat'; }
  movableTrait() { return [MOVABLE_PERSISTENT, MOVABLE_BREAKABLE, MOVABLE_STANDARD, MOVABLE_IRREGULAR][(this.breakable || this.state === F_CRACKED ? 1 : 0) + (this.movable ? 2 : 0)]; }
  getAttr(key: string): Value {
    if (key === 'movable') return this.movable;
    if (key === 'hollow') return this.hollow;
    if (key === 'breakable') return this.breakable;
    if (key === 'burnable') return this.burnable;
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === '_glasses') {
      if (((toInt(m.value) & 1) !== 0) !== this.glasses) { this.glasses = !this.glasses; if (this.isDisplayable()) this.init_model(); }
      return null;
    }
    if ((this.breakable || this.movable || this.state === F_CRACKED) && (m.message === 'ignite' || m.message === '_explosion')) { this.doBreak(); return null; }
    if ((m.message === '_trigger' || m.message === 'signal') && this.state === F_IDLE) {
      if (!(this.breakable || this.movable || this.hollow || this.burnable)) this.hollow = true;
      else if (this.hollow) this.hollow = false;
      if (this.isDisplayable()) this.init_model();
      return null;
    }
    if (m.message === '_fire' && this.burnable) { this.doBreak(); return true; }
    if (m.message === 'heat' && this.burnable && !this.movable) { this.doBreak(); return true; }
    return super.message(m);
  }
  setState(_s: number) {}
  init_model() {
    if (this.glasses && this.hollow) this.set_model('invisible');
    else if (this.state === F_BREAKING) this.set_anim('st_flat_breaking');
    else if (this.state === F_FALLING) this.set_anim('st_flat_falling');
    else if (this.state === F_CRACKED) this.set_model('st_flat_cracked');
    else if (this.burnable) this.set_model('st_flat_fire');
    else this.set_model('st_flat');
  }
  processLight(d: number) {
    if (this.state === F_IDLE && this.breakable) this.doBreak();
    else if (this.state === F_IDLE && !(this.breakable || this.movable || this.hollow || this.burnable)) { this.state = F_CRACKED; this.init_model(); }
    else super.processLight(d);
  }
  animcb() { if (this.state === F_FALLING) this.sound_event('stonedestroy'); KillStone(this.pos); }
  is_floating() { return this.hollow; }
  on_floor_change() {
    if (this.state === F_IDLE && (this.breakable || this.movable)) {
      const fl = GetFloor(this.pos);
      if (fl) {
        if (fl.isKind('fl_abyss')) { this.state = F_FALLING; this.init_model(); }
        else if (this.movable && (fl.getClass() === 'fl_swamp' || fl.getClass() === 'fl_water')) {
          this.sound_event('drown'); display.sparkle(this.pos.center()); KillStone(this.pos);
        }
      }
    }
  }
  collision_response(sc: StoneContact) { return this.hollow ? STONE_PASS : super.collision_response(sc); }
  collision_sound() { return this.state === F_BREAKING || this.state === F_CRACKED || this.breakable ? 'metal' : 'stone'; }
  actor_hit(sc: StoneContact) {
    if ((this.breakable || this.state === F_CRACKED) && wieldedItemIs(sc.actor, 'it_hammer')) this.doBreak();
    else if (this.state === F_IDLE && !(this.breakable || this.hollow) && wieldedItemIs(sc.actor, 'it_pencil')) {
      const pinv = playerInv(sc.actor);
      if (pinv && pinv.size() > 0) {
        pinv.yield_item(0)?.dispose();
        this.sound_event('stonepaint');
        this.burnable = true;
        this.init_model();
      }
    } else if (this.state === F_IDLE && this.burnable && wieldedItemIs(sc.actor, 'it_brush')) {
      this.sound_event('stonepaint'); this.burnable = false; this.init_model();
    } else super.actor_hit(sc);
  }
  doBreak() {
    if (this.state <= F_CRACKED) {
      this.state = F_BREAKING;
      this.sound_event('stonedestroy');
      if (this.isDisplayable()) this.init_model();
    }
  }
}
function playerInv(a: Actor) { const inv = player.inventoryOf(a); if (inv) player.onInventory(); return inv; }
Register('st_flat', new FlatStone(false, false)); Register('st_flat_hollow', new FlatStone(true, false));
Register('st_flat_movable', new FlatStone(false, true)); Register('st_flat_breakable', new FlatStone(false, false, true));
Register('st_flat_cracked', new FlatStone(false, false, false, true)); Register('st_flat_burnable', new FlatStone(false, false, false, false, true));
Register('st_flat_moveburnable', new FlatStone(false, true, false, false, true)); Register('st_flat_breaking', new FlatStone(false, false, true, false, false, true));
export const _keep = [GameObject];
