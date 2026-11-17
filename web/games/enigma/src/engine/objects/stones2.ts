// Stones: stones/ClusterStone.cc, FakeStone.cc, TimerStone.cc, PassageStone.cc, OneWayStone.cc,
// KeySwitch.cc, FloppySwitch.cc, CoinSlot.cc.
import {
  Stone, Register, server, player, toStr, toBool, toInt, toDouble, GameTimer, MakeItem, XLevelRuntime, STONE_PASS,
  STONE_REBOUND, ALL_DIRECTIONS, WEST, SOUTH, EAST, NORTH, NODIR, reverseDir, centeredPos, toTokenList, getPositionList,
  IsInsideLevel, GridPos, valueEquals,
  type Message, type Value, type StoneContact, type TimeHandler, type Inventory,
} from '../core.ts';

// ----- cluster stones (st_panel, st_brick, st_bluesand)
class ClusterStone extends Stone {
  constructor(cls: string, connections: string) {
    super();
    this.setAttr('connections', connections);
    this.setAttr('$class', cls);
  }
  getClass() { return toStr(this.getAttr('$class')); }
  setAttr(key: string, val: Value) {
    if (key === 'connections' || key === 'faces' || key === 'cluster') {
      super.setAttr(key, val);
      if (this.isDisplayable()) { this.autoLeaveCluster(); this.autoJoinCluster(); }
      return;
    }
    super.setAttr(key, val);
  }
  message(m: Message): Value { if (m.message === '_model_reanimated') this.init_model(); return super.message(m); }
  on_creation(p: GridPos) { this.autoJoinCluster(); super.on_creation(p); }
  on_removal(p: GridPos) { this.autoLeaveCluster(); super.on_removal(p); }
  getModelName() { return this.getClass() + this.getConnections(); }
  is_removable() { return this.getFaces() === ALL_DIRECTIONS; }
}
const CONN = ['', 'w', 's', 'sw', 'e', 'ew', 'es', 'esw', 'n', 'nw', 'ns', 'nsw', 'ne', 'new', 'nes', 'nesw'];
for (const cls of ['st_panel', 'st_brick', 'st_bluesand']) for (const c of CONN) Register(c ? `${cls}_${c}` : cls, new ClusterStone(cls, c));

// ----- fake stones
const FAKE = ['quake', 'oxyda', 'oxydb', 'oxydc', 'oxydd', 'oxyde'];
class FakeStone extends Stone {
  typ: number;
  constructor(typ: number, s = 0) { super(); this.typ = typ; this.state = s; }
  getClass() { return 'st_fake'; }
  setAttr(key: string, val: Value) {
    if (key === 'flavor') {
      const i = FAKE.indexOf(toStr(val));
      if (i < 0) throw new XLevelRuntime(`Fake stone with illegal flavor value: ${toStr(val)}`);
      this.typ = i;
      if (this.isDisplayable()) this.init_model();
      return;
    }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value { return key === 'flavor' ? FAKE[this.typ] : super.getAttr(key); }
  setState(s: number) {
    if (this.isDisplayable()) {
      // FakeStone::setState tests the subtype shifted by 25 bits: true for the quake and oxyda flavors
      if ((this.typ >> 1) === 0 && this.state !== s) { this.state = s; this.init_model(); }
    } else super.setState(s);
  }
  init_model() {
    if (this.typ === 0) { if (this.state === 1) this.set_anim('st_quaking'); else this.set_model('st_quake'); }
    else this.set_model(`st_fake_${FAKE[this.typ]}${this.state === 0 ? '' : '_open'}`);
  }
  animcb() { this.state = 0; this.init_model(); }
  collision_sound() { return this.typ === 0 ? 'metal' : 'stone'; }
  actor_hit(sc: StoneContact) {
    if (this.typ === 0 && this.state === 0) { this.sound_event('fakeoxyd'); this.state = 1; this.init_model(); }
    else super.actor_hit(sc);
  }
}
Register('st_fake_quake', new FakeStone(0)); Register('st_fake_oxyda', new FakeStone(1)); Register('st_fake_oxydb', new FakeStone(2));
Register('st_fake_oxydc', new FakeStone(3)); Register('st_fake_oxydc_open', new FakeStone(3, 1)); Register('st_fake_oxydd', new FakeStone(4));
Register('st_fake_oxyde', new FakeStone(5));

// ----- timer
const T_OFF = 0, T_ON = 1, T_ON_TRUE = 3;
class TimerStone extends Stone implements TimeHandler {
  constructor() { super(); this.state = T_ON; }
  getClass() { return 'st_timer'; }
  dispose() { GameTimer.remove_alarm(this); super.dispose(); }
  message(m: Message): Value { if (m.message === '_model_reanimated') { this.init_model(); return null; } return super.message(m); }
  externalState() { return this.state === T_OFF ? 0 : 1; }
  setState(s: number) {
    if (this.isDisplayable()) {
      if (s !== this.externalState()) {
        this.state = s;
        if (s === 1) this.updateAlarm(); else GameTimer.remove_alarm(this);
        this.init_model();
      }
    } else this.state = s;
  }
  init_model() {
    if (toBool(this.getAttr('invisible'))) this.set_model('invisible');
    else this.set_model(this.state === T_OFF ? 'st_timeroff' : 'st_timer');
  }
  on_creation(p: GridPos) { this.updateAlarm(); super.on_creation(p); }
  alarm() {
    const v = this.state === T_ON_TRUE;
    this.state ^= 1;
    if (!toBool(this.getAttr('loop'))) { this.setState(T_OFF); if (this.isDisplayable()) this.init_model(); }
    this.performAction(v);
  }
  updateAlarm() {
    if (this.state === T_ON) {
      this.state = T_ON_TRUE;
      GameTimer.set_alarm(this, toDouble(this.getAttr('interval')), toBool(this.getAttr('loop')));
    }
  }
}
Register('st_timer', new TimerStone());

// ----- passages
const PFL = ['square', 'slash', 'cross', 'frame'];
class PassageStone extends Stone {
  flavor: number;
  constructor(color: number, fl: number) { super(); this.state = color; this.flavor = fl; }
  getClass() { return 'st_passage'; }
  setAttr(key: string, val: Value) {
    if (key === 'color') { super.setAttr('state', val); return; }
    if (key === 'flavor') {
      const fi = PFL.indexOf(toStr(val));
      if (fi !== -1 && fi !== this.flavor) { this.flavor = fi; if (this.isDisplayable()) this.init_model(); }
      return;
    }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'color') return this.state;
    if (key === 'flavor') return PFL[this.flavor];
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === 'signal' || m.message === '_trigger') { this.toggleState(); return null; }
    return super.message(m);
  }
  init_model() { this.set_model(`st_passage_${this.state === 0 ? 'black' : 'white'}_${PFL[this.flavor]}`); }
  is_floating() { return true; }
  is_transparent() { return true; }
  collision_response(sc: StoneContact) {
    const c = sc.actor.getAttr('color');
    return c !== undefined && toInt(c) === this.state ? STONE_PASS : STONE_REBOUND;
  }
}
for (const [n, c, f] of [['st_passage', 0, 0], ['st_passage_black', 0, 0], ['st_passage_black_square', 0, 0], ['st_passage_black_slash', 0, 1],
  ['st_passage_black_cross', 0, 2], ['st_passage_black_frame', 0, 3], ['st_passage_white', 1, 0], ['st_passage_white_square', 1, 0],
  ['st_passage_white_slash', 1, 1], ['st_passage_white_cross', 1, 2], ['st_passage_white_frame', 1, 3]] as [string, number, number][]) Register(n, new PassageStone(c, f));

// ----- one-way stones
const SUFFIX = ['_w', '_s', '_e', '_n'];
class OneWayStone extends Stone {
  constructor(color: Value, dir: number) { super(); this.state = dir; this.setAttr('color', color); }
  getClass() { return 'st_oneway'; }
  setAttr(key: string, val: Value) {
    if (key === 'color' && this.isDisplayable()) { super.setAttr(key, val); this.init_model(); return; }
    if (key === 'orientation') { const v = toInt(val); if (v >= this.minState() && v <= this.maxState()) this.setState(v); }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value { return key === 'orientation' ? this.state : super.getAttr(key); }
  message(m: Message): Value {
    if (m.message === 'orientate') { this.setAttr('state', m.value); return null; }
    if (m.message === 'signal' || m.message === 'flip') { this.setState(reverseDir(this.state)); return null; }
    return super.message(m);
  }
  maxState() { return 3; }
  init_model() { this.set_model(`st_oneway${this.colorName()}${SUFFIX[this.state]}`); }
  is_floating() { return true; }
  collision_response(sc: StoneContact) {
    const c = this.getAttr('color');
    const ac = sc.actor.getAttr('color');
    if (!sc.actor.is_flying() && (c === undefined || valueEquals(c, ac))) {
      const ap = sc.actor.ai.pos;
      if ((this.state === WEST && this.pos.x >= ap.x) || (this.state === SOUTH && this.pos.y + 1 <= ap.y) ||
        (this.state === EAST && this.pos.x + 1 <= ap.x) || (this.state === NORTH && this.pos.y >= ap.y)) return STONE_REBOUND;
      return STONE_PASS;
    }
    return STONE_REBOUND;
  }
  actor_hit(sc: StoneContact) {
    if (this.getAttr('color') === undefined && wieldedItemIs(sc.actor, 'it_magicwand')) this.setState(reverseDir(this.state));
  }
  colorName() { const v = this.getAttr('color'); const c = v !== undefined ? toInt(v) + 1 : 0; return c === 1 ? '_black' : c === 2 ? '_white' : ''; }
}
export function wieldedItemIs(a: import('../core.ts').Actor, kind: string) {
  const inv = player.inventoryOf(a);
  const it = inv?.get_item(0);
  return !!it && it.isKind(kind);
}
for (const [n, c, d] of [['st_oneway', null, NORTH], ['st_oneway_n', null, NORTH], ['st_oneway_e', null, EAST], ['st_oneway_s', null, SOUTH],
  ['st_oneway_w', null, WEST], ['st_oneway_black', 0, NORTH], ['st_oneway_black_n', 0, NORTH], ['st_oneway_black_e', 0, EAST],
  ['st_oneway_black_s', 0, SOUTH], ['st_oneway_black_w', 0, WEST], ['st_oneway_white', 1, NORTH], ['st_oneway_white_n', 1, NORTH],
  ['st_oneway_white_e', 1, EAST], ['st_oneway_white_s', 1, SOUTH], ['st_oneway_white_w', 1, WEST]] as [string, Value, number][]) Register(n, new OneWayStone(c, d));

/** Object::getDestinationByIndex */
export function destinationByIndex(o: Stone, idx: number): GridPos | null {
  let i = 0;
  for (const t of toTokenList(o.getAttr('destination'))) {
    for (const p of getPositionList(t, o)) {
      const c = centeredPos(p);
      if (IsInsideLevel(GridPos.of(c))) { if (i === idx) return GridPos.of(c); i++; }
    }
  }
  return null;
}
function secureBlocked(o: Stone, apos: GridPos) {
  if (server.EnigmaCompatibility >= 1.10 && toBool(o.getAttr('secure'))) {
    for (let idx = 0; ; idx++) { const d = destinationByIndex(o, idx); if (!d) break; if (d.eq(apos)) return true; }
  }
  return false;
}

// ----- key switch
class KeySwitch extends Stone {
  getClass() { return 'st_key'; }
  setAttr(key: string, val: Value) {
    if (key === 'target') { super.setAttr('destination', val); }
    else if (key === 'invisible') {
      if (this.isDisplayable() && toBool(this.getAttr('invisible')) !== toBool(val)) { super.setAttr(key, val); this.init_model(); return; }
    } else if (key === 'code') { super.setAttr(key, val); if (this.isDisplayable()) this.init_model(); return; }
    super.setAttr(key, val);
  }
  setState(s: number) {
    if (this.isDisplayable()) {
      if (s !== this.state) { this.sound_event('switchon'); this.state = 1 - this.state; this.init_model(); this.performAction(this.state); }
    } else this.state = s;
  }
  init_model() {
    const show = !toBool(this.getAttr('invisible'));
    const code = toInt(this.getAttr('code'));
    this.set_model(show && code >= 1 && code <= 8 ? `st_key_${code}_${this.state === 1 ? 'on' : 'off'}` : `st_key_${this.state === 1 ? 'on' : 'off'}`);
  }
  actor_hit(sc: StoneContact) {
    const inv = player.inventoryOf(sc.actor);
    if (!inv) return;
    let toggle = false;
    if (!secureBlocked(this, sc.actor.ai.gridpos)) {
      if (this.state === 1) {
        if (!inv.is_full()) {
          const key = MakeItem('it_key');
          key.setAttr('code', this.getAttr('code'));
          key.setAttr('invisible', this.getAttr('invisible'));
          inv.add_item(key);
          toggle = true;
        }
      } else if (this.matchingKey(inv)) {
        const it = inv.yield_first()!;
        if (!toBool(it.getAttr('invisible'))) this.setAttr('invisible', false);
        it.dispose();
        toggle = true;
      }
      if (inv === player.inventory(player.current)) player.onInventory();
    }
    if (toggle) this.setState(1 - this.state);
  }
  collision_sound() { return 'metal'; }
  matchingKey(inv: Inventory) { const it = inv.get_item(0); return !!it && it.isKind('it_key') && valueEquals(it.getAttr('code'), this.getAttr('code')); }
}
Register('st_key', new KeySwitch());

class FloppySwitch extends Stone {
  getClass() { return 'st_floppy'; }
  setAttr(key: string, val: Value) { if (key === 'target') super.setAttr('destination', val); super.setAttr(key, val); }
  setState(s: number) {
    if (this.isDisplayable()) {
      if (s !== this.state) { this.sound_event('switchon'); this.state = 1 - this.state; this.init_model(); this.performAction(this.state === 1); }
    } else this.state = s;
  }
  init_model() { this.set_model(`st_floppy_${this.state === 1 ? 'on' : 'off'}`); }
  actor_hit(sc: StoneContact) {
    const inv = player.inventoryOf(sc.actor);
    if (!inv) return;
    if (!secureBlocked(this, sc.actor.ai.gridpos)) {
      if (this.state === 1) { if (!inv.is_full()) { inv.add_item(MakeItem('it_floppy')); this.setState(0); } }
      else if (wieldedItemIs(sc.actor, 'it_floppy')) { inv.yield_first()?.dispose(); this.setState(1); }
      if (inv === player.inventory(player.current)) player.onInventory();
    }
  }
  collision_sound() { return 'metal'; }
}
Register('st_floppy', new FloppySwitch());

// ----- coin slot
const C_OFF = 0, C_ON = 1, C_INSERT_OFF = 2, C_INSERT_ON = 3;
class CoinSlot extends Stone implements TimeHandler {
  instant: boolean;
  constructor(instant: boolean) { super(); this.instant = instant; this.state = C_OFF; this.setAttr('$addTime', 0); }
  getClass() { return 'st_coinslot'; }
  dispose() { GameTimer.remove_alarm(this); super.dispose(); }
  getAttr(key: string): Value { return key === 'instant' ? this.instant : super.getAttr(key); }
  setAttr(key: string, val: Value) { if (key === 'instant') { this.instant = toBool(val); return; } super.setAttr(key, val); }
  message(m: Message): Value { if (m.message === '_model_reanimated' && this.state <= C_ON) this.init_model(); return super.message(m); }
  externalState() { return this.state % 2; }
  setState(_s: number) {}
  init_model() { if (this.state <= C_ON) this.set_model(this.state === C_ON ? 'st_coinslot_active' : 'st_coinslot'); }
  animcb() {
    if (this.state < C_INSERT_OFF) throw new XLevelRuntime('Coinslot - animcb on wrong state');
    let rest = GameTimer.remove_alarm(this);
    let ns = C_ON;
    if (!this.instant) { rest += toDouble(this.getAttr('$addTime')); this.setAttr('$addTime', 0); }
    else if (rest === 0) ns = C_OFF;
    if (rest > 0) GameTimer.set_alarm(this, toDouble(this.getAttr('$addTime')) + rest, false);
    this.setIState(ns);
  }
  actor_hit(sc: StoneContact) {
    if (this.state >= C_INSERT_OFF && !this.instant) return;
    const inv = player.inventoryOf(sc.actor);
    const it = inv?.get_item(0);
    if (!inv || !it || it.getClass() !== 'it_coin') return;
    const kind = it.traits().name;
    let interval: number;
    if (server.EnigmaCompatibility < 1.10) interval = toDouble(it.getAttr('coin_value'));
    else {
      interval = toDouble(this.getAttr(kind === 'it_coin_s' ? 'interval_s' : kind === 'it_coin_m' ? 'interval_m' : 'interval_l'));
      if (interval === -2) return;
    }
    if (interval > 0) {
      if (this.instant) { const rest = GameTimer.remove_alarm(this); GameTimer.set_alarm(this, interval + rest, false); }
      else this.setAttr('$addTime', toDouble(this.getAttr('$addTime')) + interval);
    }
    inv.yield_first();
    if (inv === player.inventory(player.current)) player.onInventory();
    it.dispose();
    if (interval > 0) this.setIState(this.instant ? C_INSERT_ON : this.state + 2);
  }
  collision_sound() { return 'metal'; }
  alarm() {
    if ((this.state & 1) !== C_ON) throw new XLevelRuntime('Coinslot - alarm of not active slot');
    this.setIState(this.state === C_ON ? C_OFF : C_INSERT_OFF);
  }
  setIState(ns: number) {
    let doAction = false, value = false, doInit = false;
    switch (this.state) {
      case C_OFF:
        if (ns === C_ON) throw new XLevelRuntime('Coinslot - illegal state change from OFF to ON');
        value = true; doAction = ns === C_INSERT_ON;
        this.set_anim('st_coinslot_insert');
        break;
      case C_ON:
        if (ns === C_INSERT_ON) this.set_anim('st_coinslot_insert');
        else if (ns === C_OFF) { value = false; doAction = true; doInit = true; }
        else throw new XLevelRuntime('Coinslot - illegal state change');
        break;
      case C_INSERT_OFF:
        if (ns !== C_ON) throw new XLevelRuntime('Coinslot - illegal state change');
        doInit = true; value = true; doAction = true;
        break;
      case C_INSERT_ON:
        switch (ns) {
          case C_INSERT_ON: this.set_anim('st_coinslot_insert'); break;
          case C_ON: doInit = true; break;
          case C_OFF: doInit = true; value = false; doAction = true; break;
          case C_INSERT_OFF: value = false; doAction = true; break;
        }
        break;
    }
    this.state = ns;
    if (doInit && this.isDisplayable()) this.init_model();
    if (doAction) this.performAction(value);
  }
}
Register('st_coinslot', new CoinSlot(false));
Register('st_coinslot_instant', new CoinSlot(true));
export const _keep = [NODIR, toDouble];
