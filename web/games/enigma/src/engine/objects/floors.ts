// Floors: floors/StandardFloors.cc, SimpleFloors.cc, FloodStream.cc, SlopeFloor.cc.
import {
  Floor, Register, server, player, toStr, toBool, toDouble, toInt, GameTimer, GetItem, KillItem, GetFloor, GetStone,
  SendMessage, IsInsideLevel, MakeFloor, SetFloor, NORTH, NODIR, reverseDir, type GridPos, type Message, type Value,
  type Actor, type V2, type TimeHandler,
} from '../core.ts';

const STANDARD: [string, string?][] = [
  ['fl_adhesionless'], ['fl_aquamarine'], ['fl_bast'], ['fl_bluegray'], ['fl_bluegreen'], ['fl_blueslab'], ['fl_brick'],
  ['fl_bright'], ['fl_concrete'], ['fl_dark'], ['fl_darkgray'], ['fl_dunes'], ['fl_gravel'], ['fl_gray'], ['fl_himalaya'],
  ['fl_ivory'], ['fl_lawn'], ['fl_lawn', 'fl_lawn_a'], ['fl_lawn', 'fl_lawn_b'], ['fl_lawn', 'fl_lawn_c1'], ['fl_lawn', 'fl_lawn_c2'],
  ['fl_lawn', 'fl_lawn_c3'], ['fl_lawn', 'fl_lawn_c4'], ['fl_lawn', 'fl_lawn_d1'], ['fl_lawn', 'fl_lawn_d2'], ['fl_lawn', 'fl_lawn_d3'],
  ['fl_lawn', 'fl_lawn_d4'], ['fl_lawn', 'fl_lawn_e1'], ['fl_lawn', 'fl_lawn_e2'], ['fl_lawn', 'fl_lawn_e3'], ['fl_lawn', 'fl_lawn_e4'],
  ['fl_marble'], ['fl_metal'], ['fl_metal', 'fl_metal_1'], ['fl_metal', 'fl_metal_2'], ['fl_metal', 'fl_metal_3'], ['fl_metal', 'fl_metal_4'],
  ['fl_metal', 'fl_metal_5'], ['fl_metal', 'fl_metal_6'], ['fl_metal', 'fl_metal_7'], ['fl_metal', 'fl_metal_7'], ['fl_mortar'],
  ['fl_pinkbumps'], ['fl_plank'], ['fl_platinum'], ['fl_red'], ['fl_redslab'], ['fl_rough'], ['fl_sahara'], ['fl_samba'],
  ['fl_samba', 'fl_samba_h'], ['fl_samba', 'fl_samba_v'], ['fl_sand'], ['fl_stone'], ['fl_tigris'], ['fl_white'], ['fl_woven'],
];

export class StandardFloor extends Floor {
  constructor(type: number, framed = false) {
    super();
    this.state = type;
    Floor.prototype.setAttr.call(this, 'faces', framed ? 'nesw' : '');
    if (type === 40) { this.setAttr('friction', 4.0); this.setAttr('adhesion', 2.0); }
  }
  getClass() { return STANDARD[this.state][0]; }
  externalState() { return 0; }
  setState(_s: number) {}
  getModelName() {
    const framed = toStr(this.getAttr('faces')) === 'nesw';
    const e = STANDARD[this.state];
    return (e[1] ?? e[0]) + (framed ? '_framed' : '');
  }
}
{
  const names: [number, string, boolean][] = [];
  const add = (t: number, n: string, framed = false) => names.push([t, n, framed]);
  const both = (t: number, n: string) => { add(t, n); add(t, n + '_framed', true); };
  add(0, 'fl_adhesionless');
  ['fl_aquamarine', 'fl_bast', 'fl_bluegray', 'fl_bluegreen', 'fl_blueslab', 'fl_brick', 'fl_bright', 'fl_concrete', 'fl_dark',
    'fl_darkgray', 'fl_dunes', 'fl_gravel', 'fl_gray', 'fl_himalaya', 'fl_ivory'].forEach((n, i) => both(i + 1, n));
  ['fl_lawn', 'fl_lawn_a', 'fl_lawn_b', 'fl_lawn_c1', 'fl_lawn_c2', 'fl_lawn_c3', 'fl_lawn_c4', 'fl_lawn_d1', 'fl_lawn_d2', 'fl_lawn_d3',
    'fl_lawn_d4', 'fl_lawn_e1', 'fl_lawn_e2', 'fl_lawn_e3', 'fl_lawn_e4'].forEach((n, i) => add(16 + i, n));
  both(31, 'fl_marble'); both(32, 'fl_metal');
  for (let i = 1; i <= 7; i++) both(32 + i, `fl_metal_${i}`);
  add(40, 'fl_metal_7n');
  ['fl_mortar', 'fl_pinkbumps', 'fl_plank', 'fl_platinum', 'fl_red', 'fl_redslab', 'fl_rough', 'fl_sahara', 'fl_samba', 'fl_samba_h',
    'fl_samba_v', 'fl_sand', 'fl_stone', 'fl_tigris', 'fl_white', 'fl_woven'].forEach((n, i) => both(41 + i, n));
  for (const [t, n, f] of names) Register(n, new StandardFloor(t, f));
}

class NamedFloor extends Floor {
  cls: string;
  constructor(cls: string) { super(); this.cls = cls; }
  getClass() { return this.cls; }
}
class Abyss extends NamedFloor {
  constructor() { super('fl_abyss'); }
  is_destructible() { return false; }
  actor_contact(a: Actor) { SendMessage(a, '_fall'); }
}
class FlavoredFloor extends NamedFloor {
  prefix: string;
  constructor(cls: string, flavor: string) { super(cls); this.prefix = cls + '_'; this.setAttr('flavor', flavor); }
  getModelName() { return this.prefix + toStr(this.getAttr('flavor')); }
}
class Space extends NamedFloor {
  withForce: boolean;
  constructor(f: boolean) { super('fl_space'); this.withForce = f; }
  add_force(a: Actor | null, f: V2) { if (this.withForce) f.y -= server.FlatForce; super.add_force(a, f); }
}
class Swamp extends NamedFloor {
  constructor() { super('fl_swamp'); }
  is_destructible() { return false; }
  get_sink_speed(): [number, number] { return [server.SwampSinkSpeed, 6.0]; }
}
class YinyangFloor extends NamedFloor {
  invisible: boolean;
  constructor(s: number, inv = false) { super('fl_yinyang'); this.state = s; this.invisible = inv; }
  setAttr(key: string, val: Value) {
    if (key === 'invisible') { this.invisible = toBool(val); if (this.isDisplayable()) this.init_model(); return; }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value { return key === 'invisible' ? this.invisible : super.getAttr(key); }
  getModelName() { return `fl_yinyang_${this.state === 0 ? 'yin' : 'yang'}${this.invisible ? '_invisible' : ''}`; }
  process_mouseforce(_a: Actor, fx: number, fy: number): [number, number] {
    if (player.current === this.state) { const ad = this.getAdhesion(); return [ad * fx, ad * fy]; }
    return [0, 0];
  }
}
Register('fl_abyss', new Abyss());
Register('fl_dummy', new NamedFloor('fl_dummy'));
Register('fl_fake', new FlavoredFloor('fl_fake', 'abyss'));
Register('fl_fake_abyss', new FlavoredFloor('fl_fake', 'abyss'));
Register('fl_fake_trigger', new FlavoredFloor('fl_fake', 'trigger'));
Register('fl_ice', new NamedFloor('fl_ice'));
Register('fl_inverse', new FlavoredFloor('fl_inverse', 'white'));
Register('fl_inverse_white', new FlavoredFloor('fl_inverse', 'white'));
Register('fl_inverse_gray', new FlavoredFloor('fl_inverse', 'gray'));
Register('fl_space', new Space(false));
Register('fl_space_force', new Space(true));
Register('fl_swamp', new Swamp());
Register('fl_yinyang', new YinyangFloor(0));
Register('fl_yinyang_yin', new YinyangFloor(0));
Register('fl_yinyang_yin_invisible', new YinyangFloor(0, true));
Register('fl_yinyang_yang', new YinyangFloor(1));
Register('fl_yinyang_yang_invisible', new YinyangFloor(1, true));
// fl_fake's default flavor (objects.xml) is abyss; FakeFloor() without flavor keeps the default

// ------------------------------------------------------------------ FloodStream (water, wood, hay, rock)
const WATER = 0, WOOD = 1, HAY = 2, ROCK = 3;
const IDLE = 0, FLOODING = 1;
export class FloodStream extends Floor implements TimeHandler {
  typ: number; model: number;
  constructor(typ: number, model: number, framed: boolean, source = false) {
    super();
    this.typ = typ; this.model = model;
    this.state = source ? FLOODING : IDLE;
    Floor.prototype.setAttr.call(this, 'faces', framed ? 'nesw' : '');
  }
  getClass() { return ['fl_water', 'fl_wood', 'fl_hay', 'fl_rock'][this.typ]; }
  dispose() { GameTimer.remove_alarm(this); super.dispose(); }
  message(m: Message): Value {
    if (m.message === '_checkflood') {
      const it = GetItem(this.pos);
      if (this.state === FLOODING && (toBool(m.value) !== true || (it && it.isKind('it_vortex_open'))))
        GameTimer.set_alarm(this, toDouble(this.getAttr('interval')), false);
      return null;
    }
    return super.message(m);
  }
  setState(s: number) {
    if (this.isDisplayable() && s === FLOODING && this.state === IDLE) {
      if (this.typ === WATER || toStr(this.getAttr('faces')) === 'nesw') {
        this.state = FLOODING;
        GameTimer.set_alarm(this, toDouble(this.getAttr('interval')), false);
      }
    } else if (s === IDLE) { this.state = IDLE; GameTimer.remove_alarm(this); }
    else this.state = s;
  }
  getModelName() {
    let base = this.getClass();
    if (toStr(this.getAttr('faces')) === 'nesw') base += '_framed';
    if (this.typ === WOOD) base += this.model === 0 ? '' : String(this.model);
    return base;
  }
  on_creation(p: GridPos) {
    super.on_creation(p);
    if (this.typ === WATER) {
      const it = GetItem(p);
      if (it && (it.isKind('it_meditation_hollow') || it.isKind('it_meditation_dent') || it.isKind('it_meditation_caldera') ||
        it.isKind('it_crack') || it.isKind('it_burnable_ash'))) KillItem(p);
    }
    if (this.state === FLOODING) GameTimer.set_alarm(this, toDouble(this.getAttr('interval')), false);
  }
  is_destructible() { return this.typ !== WATER; }
  get_sink_speed(): [number, number] { return this.typ === WATER ? [server.WaterSinkSpeed, 1000] : [0, 0]; }
  stone_change(st: import('../core.ts').Stone | null) {
    if (this.typ === WATER || toStr(this.getAttr('faces')) === 'nesw') {
      SendMessage(GetFloor(this.pos), '_checkflood');
      for (let d = NORTH; d !== NODIR; d--) SendMessage(GetFloor(this.pos.move(d)), '_checkflood');
    } else super.stone_change(st);
  }
  alarm() {
    if (!this.isDisplayable()) return;
    const st = GetStone(this.pos);
    for (let d = NORTH; d !== NODIR; d--) if (!st || st.allowsSpreading(d)) this.tryFlood(this.pos.move(d), reverseDir(d));
    const it = GetItem(this.pos);
    if (it) for (const p of it.warpSpreadPos(true)) this.tryFlood(p, NODIR);
  }
  tryFlood(p: GridPos, from: number) {
    if (!IsInsideLevel(p)) return;
    const f = GetFloor(p);
    if (f && f instanceof FloodStream && (toStr(f.getAttr('faces')) === 'nesw' || f.isKind('fl_water'))) {
      if (f.isKind('fl_water') && toInt(f.getAttr('state')) === IDLE) {
        this.init_model();
        const it = GetItem(p);
        if (it && (it.isKind('it_crack') || (it.isKind('it_burnable') && !it.isKind('it_burnable_oil')))) KillItem(p);
      }
      f.setAttr('interval', this.getAttr('interval'));
      f.setAttr('state', FLOODING);
    } else if (f && toBool(f.getAttr('floodable'))) {
      const st = GetStone(p);
      if (!st || from === NODIR || st.allowsSpreading(from, true)) {
        const nf = MakeFloor('fl_water_source');
        nf.setAttr('interval', this.getAttr('interval'));
        SetFloor(p, nf);
        const it = GetItem(p);
        if (it && (it.isKind('it_crack') || (it.isKind('it_burnable') && !it.isKind('it_burnable_oil')))) KillItem(p);
      }
    }
  }
}
Register('fl_water', new FloodStream(WATER, 0, false));
Register('fl_water_source', new FloodStream(WATER, 0, false, true));
Register('fl_wood', new FloodStream(WOOD, 0, false));
Register('fl_wood_h', new FloodStream(WOOD, 1, false));
Register('fl_wood_v', new FloodStream(WOOD, 2, false));
Register('fl_wood_framed', new FloodStream(WOOD, 0, true));
Register('fl_wood_framed_h', new FloodStream(WOOD, 1, true));
Register('fl_wood_framed_v', new FloodStream(WOOD, 2, true));
Register('fl_hay', new FloodStream(HAY, 0, false));
Register('fl_hay_framed', new FloodStream(HAY, 0, true));
Register('fl_rock', new FloodStream(ROCK, 0, false));
Register('fl_rock_framed', new FloodStream(ROCK, 0, true));

// ------------------------------------------------------------------ slopes
const SHAPES = new Set(['', 'pw', 'ps', 'pe', 'pn', 'inw', 'isw', 'ise', 'ine', 'onw', 'osw', 'ose', 'one', 'tw', 'ts', 'te', 'tn',
  'twl', 'tsl', 'tel', 'tnl', 'twr', 'tsr', 'ter', 'tnr']);
const XF = [-1, 0, 1, 0, -1, -1, 1, 1], YF = [0, 1, 0, -1, -1, 1, 1, -1];
class SlopeFloor extends Floor {
  mode: 0 | 1 | 2 = 0; // 0 default, 1 strength, 2 force
  constructor(slope: number, shape: string) {
    super();
    this.state = slope;
    Floor.prototype.setAttr.call(this, 'shape', shape);
  }
  getClass() { return 'fl_slope'; }
  setAttr(key: string, val: Value) {
    if (key === 'shape') {
      const s = toStr(val);
      if (SHAPES.has(s)) { super.setAttr('shape', s); if (this.isDisplayable()) this.init_model(); }
    } else if (key === 'slope') { const s = toInt(val); if (s >= -1 && s <= 7) this.state = s; }
    else if (key === 'strength') { this.forceX = toDouble(val); this.mode = 1; }
    else if (key === 'force_x') { this.forceX = toDouble(val); this.mode = 2; }
    else if (key === 'force_y') { this.forceY = toDouble(val); this.mode = 2; }
    else super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'slope') return this.state;
    if (key === 'strength') return this.forceX;
    return super.getAttr(key);
  }
  setState(_s: number) {}
  getModelName() { const s = toStr(this.getAttr('shape')); return s === '' ? 'fl_slope' : 'fl_slope_' + s; }
  add_force(a: Actor | null, f: V2) {
    if (this.mode === 2) { super.add_force(a, f); return; }
    let fx = 0, fy = 0;
    if (this.state !== NODIR) {
      fx = XF[this.state]; fy = YF[this.state];
      const l = Math.sqrt(fx * fx + fy * fy);
      fx /= l; fy /= l;
    }
    const k = this.mode === 1 ? this.forceX : server.SlopeForce;
    f.x += k * fx; f.y += k * fy;
  }
}
const SLOPES: [number, string][] = [[-1, ''], [0, 'pw'], [1, 'ps'], [2, 'pe'], [3, 'pn'], [4, 'inw'], [5, 'isw'], [6, 'ise'], [7, 'ine'],
  [4, 'onw'], [5, 'osw'], [6, 'ose'], [7, 'one'], [0, 'tw'], [1, 'ts'], [2, 'te'], [3, 'tn'], [4, 'twl'], [5, 'tsl'], [6, 'tel'], [7, 'tnl'],
  [5, 'twr'], [6, 'tsr'], [7, 'ter'], [4, 'tnr']];
for (const [s, shape] of SLOPES) Register(shape ? 'fl_slope_' + shape : 'fl_slope', new SlopeFloor(s, shape));
