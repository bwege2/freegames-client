// objects.cpp, extend.cpp, morpher.cpp: the game's objects (simple_object's variables with their C types,
// game_object's physics, drawing and Lisp hooks)
import { figures, get_ability, flinch_state, object_names, OFUN_AI, OFUN_CONSTRUCTOR, OFUN_CHANGE_TYPE, OFUN_DAMAGE,
  OFUN_DRAW, OFUN_MAP_DRAW, OFUN_MOVER, OFUN_NEXT_STATE, OFUN_RELOAD, CFLAG_HURT_ALL, CFLAG_STOPPABLE, CFLAG_CAN_BLOCK,
  CFLAG_HURTABLE, CFLAG_PUSHABLE, dead, dieing, stopped, start_run_jump, run_jump, run_jump_fall, end_run_jump,
  flinch_up, flinch_down, running, start_hp, jump_xvel, jump_yvel, run_top_speed, start_accel, stop_accel,
  jump_top_speed, walk_top_speed, push_xrange, type sequence } from './chars.ts';
import type { TransImage } from './imlib/transimage.ts';
import type { figure } from './items.ts';
import { jrandom } from './imlib/jrand.ts';
import { eval_function, eval_user_function, item_type, lbreak, LList, LNumber, lnumber_value, L_NUMBER, new_pointer,
  print, push_onto_list, symbol_value, true_symbol, type LObj, type LSymbol } from './lisp/lisp.ts';
import { cache } from './cache.ts';
import { G } from './globals.ts';
import { L } from './lglobals.ts';
import type { light_source } from './light.ts';
import type { view } from './view.ts';

export const NOT_BLOCKED = 0, BLOCKED_LEFT = 1, BLOCKED_RIGHT = 2, BLOCKED_UP = 4, BLOCKED_DOWN = 8;
export const FLAG_JUST_HIT = 1, FLAG_JUST_BLOCKED = 2, FLOATING_FLAG = 4, KNOWN_FLAG = 8;
export const RC_8 = 0, RC_16 = 1, RC_32 = 2;
export const TOTAL_OBJECT_VARS = 28;
export const object_descriptions: { name: string; type: number }[] = [
  { name: 'fade_dir', type: RC_8 }, { name: 'frame_dir', type: RC_8 }, { name: 'direction', type: RC_8 },
  { name: 'gravity_on', type: RC_8 }, { name: 'fade_count', type: RC_8 }, { name: 'fade_max', type: RC_8 },
  { name: 'active', type: RC_8 }, { name: 'flags', type: RC_8 }, { name: 'aitype', type: RC_8 },
  { name: 'xvel', type: RC_32 }, { name: 'fxvel', type: RC_8 }, { name: 'yvel', type: RC_32 },
  { name: 'fyvel', type: RC_8 }, { name: 'xacel', type: RC_32 }, { name: 'fxacel', type: RC_8 },
  { name: 'yacel', type: RC_32 }, { name: 'fyacel', type: RC_8 }, { name: 'x', type: RC_32 },
  { name: 'fx', type: RC_8 }, { name: 'y', type: RC_32 }, { name: 'fy', type: RC_8 }, { name: 'hp', type: RC_16 },
  { name: 'mp', type: RC_16 }, { name: 'fmp', type: RC_16 }, { name: 'cur_frame', type: RC_16 },
  { name: 'aistate', type: RC_16 }, { name: 'aistate_time', type: RC_16 }, { name: 'targetable', type: RC_8 }];

export function RC_type_size(type: number): number {
  return type === RC_8 ? 1 : type === RC_16 ? 2 : 4;
}

const s8 = (v: number): number => (v << 24) >> 24;
const s16 = (v: number): number => (v << 16) >> 16;

/** morpher.cpp: every character's morph_mask is -1 in this data (the def_char morph field is gone), so a
 *  morph shows nothing and ends at once */
export class morph_char {
  fleft = 0;
  constructor(who: game_object, to_type: number) {
    const t1 = figures[who.otype], t2 = figures[to_type];
    if (!(!t1.has_sequence(9) || t1.morph_mask < 0 || !t2.has_sequence(9) || t2.morph_mask < 0))
      throw new Error('morphing between pictures is not ported (no character of the data has a morph mask)');
  }
  draw(_who: game_object, _v: view): void {}
  frames_left(): number { return this.fleft; }
}

export class game_object {
  // simple_object (extend.h), with the C types of its members
  private _fade_dir = 0;
  private _fade_count = 0;
  private _fade_max = 16;
  private _flags = 0;
  private _grav_on = 1;
  private _targetable_on = 1;
  private _xvel = 0;
  private _yvel = 0;
  private _xacel = 0;
  private _yacel = 0;
  private _fx = 0;
  private _fy = 0;
  private _fxvel = 0;
  private _fyvel = 0;
  private _fxacel = 0;
  private _fyacel = 0;
  private _aitype = 0;
  private _aistate = 0;
  private _aistate_time = 0;
  private _hp = 0;
  private _mp = 0;
  private _fmp = 0;
  private _frame_dir = 1;
  _tint = -1;
  _team = -1;
  objs: game_object[] = [];
  lights: light_source[] = [];
  link: game_object | null = null;
  Controller: view | null = null;
  mc: morph_char | null = null;
  private _x = 0;
  private _y = 0;
  last_x = 0;
  last_y = 0;
  private _direction = 1;
  private _active = 0;
  private _otype = 0;
  state = stopped;
  private _current_frame = 0;

  // game_object
  next: game_object | null = null;
  next_active: game_object | null = null;
  lvars: Int32Array | null = null;

  get x(): number { return this._x; }
  set x(v: number) { this._x = v | 0; }
  get y(): number { return this._y; }
  set y(v: number) { this._y = v | 0; }
  get direction(): number { return this._direction; }
  set direction(v: number) { this._direction = s8(v); }
  get active(): number { return this._active; }
  set active(v: number) { this._active = s8(v); }
  get otype(): number { return this._otype; }
  set otype(v: number) { this._otype = v & 0xffff; }
  get current_frame(): number { return this._current_frame; }
  set current_frame(v: number) { this._current_frame = s16(v); }

  tobjs(): number { return this.objs.length & 0xff; }
  targetable(): number { return this._targetable_on; }
  gravity(): number { return this._grav_on; }
  floating(): number { return this._flags & FLOATING_FLAG; }
  keep_ai_info(): number { return 1; }
  flags(): number { return this._flags; }
  xvel(): number { return this._xvel; }
  yvel(): number { return this._yvel; }
  xacel(): number { return this._xacel; }
  yacel(): number { return this._yacel; }
  fx(): number { return this._fx; }
  fy(): number { return this._fy; }
  fxvel(): number { return this._fxvel; }
  fyvel(): number { return this._fyvel; }
  fxacel(): number { return this._fxacel; }
  fyacel(): number { return this._fyacel; }
  sfx(): number { return this._fx; }
  sfy(): number { return this._fy; }
  // the "signed" accessors return uint8_t: -Fxvel wraps
  sfxvel(): number { return this._xvel >= 0 ? this._fxvel : -this._fxvel & 0xff; }
  sfyvel(): number { return this._yvel >= 0 ? this._fyvel : -this._fyvel & 0xff; }
  sfxacel(): number { return this._xacel >= 0 ? this._fxacel : -this._fxacel & 0xff; }
  sfyacel(): number { return this._yacel >= 0 ? this._fyacel : -this._fyacel & 0xff; }
  aitype(): number { return this._aitype; }
  aistate(): number { return this._aistate; }
  aistate_time(): number { return this._aistate_time; }
  hp(): number { return this._hp; }
  mp(): number { return this._mp; }
  fmp(): number { return this._fmp; }
  fade_dir(): number { return this._fade_dir; }
  frame_dir(): number { return this._frame_dir; }
  fade_count(): number { return this._fade_count; }
  fade_max(): number { return this._fade_max; }
  total_objects(): number { return this.objs.length & 0xff; }
  total_lights(): number { return this.lights.length & 0xff; }
  morph_status(): morph_char | null { return this.mc; }
  get_light(x: number): light_source {
    if (x >= this.lights.length) lbreak('bad x for light\n');
    return this.lights[x];
  }
  get_object(x: number): game_object {
    if (x >= this.objs.length) lbreak('bad x for object\n');
    return this.objs[x];
  }
  controller(): view | null { return this.Controller; }
  set_targetable(x: number): void { this._targetable_on = x & 0xff; }
  set_flags(f: number): void { this._flags = f & 0xff; }
  set_xvel(v: number): void { this._xvel = v | 0; }
  set_yvel(v: number): void { this._yvel = v | 0; }
  set_xacel(v: number): void { this._xacel = v | 0; }
  set_yacel(v: number): void { this._yacel = v | 0; }
  set_fx(v: number): void { this._fx = v & 0xff; }
  set_fy(v: number): void { this._fy = v & 0xff; }
  set_fxvel(v: number): void { this._fxvel = v & 0xff; }
  set_fyvel(v: number): void { this._fyvel = v & 0xff; }
  set_fxacel(v: number): void { this._fxacel = v & 0xff; }
  set_fyacel(v: number): void { this._fyacel = v & 0xff; }
  set_aitype(t: number): void { this._aitype = t & 0xff; }
  set_aistate(s: number): void { this._aistate = s & 0xffff; }
  set_aistate_time(t: number): void { this._aistate_time = t & 0xffff; }
  set_hp(h: number): void { this._hp = h & 0xffff; }
  set_mp(m: number): void { this._mp = m & 0xffff; }
  set_fmp(m: number): void { this._fmp = m & 0xffff; }
  set_fade_count(f: number): void { this._fade_count = f & 0xff; }
  set_fade_max(m: number): void { this._fade_max = m & 0xff; }
  set_fade_dir(d: number): void { this._fade_dir = s8(d); }
  set_frame_dir(d: number): void { this._frame_dir = s8(d); }
  set_controller(v: view | null): void { this.Controller = v; }
  set_gravity(x: number): void { this._grav_on = x & 0xff; }
  set_floating(x: number): void {
    if (x) this.set_flags(this.flags() | FLOATING_FLAG);
    else this.set_flags(this.flags() & (0xff - FLOATING_FLAG));
  }
  set_morph_status(mc: morph_char | null): void { this.mc = mc; }

  add_light(ls: light_source | null): void {
    if (!ls) return;
    ls.known = 1;
    for (const l of this.lights) if (l === ls) return;
    this.lights.push(ls);
  }

  add_object(o: game_object | null): void {
    if (!o) return;
    for (const p of this.objs) if (p === o) return;
    o.set_flags(o.flags() | KNOWN_FLAG);
    if (this._team !== -1) o.set_team(this._team);
    if (this._tint !== -1) o.set_tint(this._tint);
    this.objs.push(o);
  }

  remove_light(ls: light_source): void {
    const i = this.lights.indexOf(ls);
    if (i >= 0) this.lights.splice(i, 1);
  }

  remove_object(o: game_object): void {
    const i = this.objs.indexOf(o);
    if (i >= 0) this.objs.splice(i, 1);
  }

  /** ~simple_object: clean_up */
  clean_up(): void {
    this.lights = [];
    this.objs = [];
    if (this.Controller) this.Controller.focus = null;
  }

  total_vars(): number { return TOTAL_OBJECT_VARS; }
  var_name(x: number): string { return object_descriptions[x].name; }
  var_type(x: number): number { return object_descriptions[x].type; }

  /** set_var(int, uint32_t) */
  set_var(xx: number, v: number): void {
    switch (xx) {
      case 0: this.set_fade_dir(v); break;
      case 1: this.set_frame_dir(v); break;
      case 2: this.direction = v; break;
      case 3: this.set_gravity(v); break;
      case 4: this.set_fade_count(v); break;
      case 5: this.set_fade_max(v); break;
      case 6: this.active = v; break;
      case 7: this.set_flags(v); break;
      case 8: this.set_aitype(v); break;
      case 9: this.set_xvel(v); break;
      case 10: this.set_fxvel(v); break;
      case 11: this.set_yvel(v); break;
      case 12: this.set_fyvel(v); break;
      case 13: this.set_xacel(v); break;
      case 14: this.set_fxacel(v); break;
      case 15: this.set_yacel(v); break;
      case 16: this.set_fyacel(v); break;
      case 17: this.x = v; break;
      case 18: this.set_fx(v); break;
      case 19: this.y = v; break;
      case 20: this.set_fy(v); break;
      case 21: this.set_hp(v); break;
      case 22: this.set_mp(v); break;
      case 23: this.set_fmp(v); break;
      case 24: this.current_frame = v; break;
      case 25: this.set_aistate(v); break;
      case 26: this.set_aistate_time(v); break;
      case 27: this.set_targetable(v); break;
    }
  }

  get_var(xx: number): number {
    switch (xx) {
      case 0: return this.fade_dir();
      case 1: return this.frame_dir();
      case 2: return this.direction;
      case 3: return this.gravity();
      case 4: return this.fade_count();
      case 5: return this.fade_max();
      case 6: return this.active;
      case 7: return this.flags();
      case 8: return this.aitype();
      case 9: return this.xvel();
      case 10: return this.fxvel();
      case 11: return this.yvel();
      case 12: return this.fyvel();
      case 13: return this.xacel();
      case 14: return this.fxacel();
      case 15: return this.yacel();
      case 16: return this.fyacel();
      case 17: return this.x;
      case 18: return this.fx();
      case 19: return this.y;
      case 20: return this.fy();
      case 21: return this.hp();
      case 22: return this.mp();
      case 23: return this.fmp();
      case 24: return this.current_frame;
      case 25: return this.aistate();
      case 26: return this.aistate_time();
      case 27: return this.targetable();
    }
    return 0;
  }

  get_tint(): number { return this._tint; }
  set_tint(tint: number): void {
    for (let i = 0; i < this.tobjs(); i++) this.get_object(i)._tint = tint;
    this._tint = tint;
  }
  get_team(): number { return this._team; }
  set_team(team: number): void {
    for (let i = 0; i < this.tobjs(); i++) this.get_object(i)._team = team;
    this._team = team;
  }

  // ------------------------------------------------------------------ game_object
  constructor(Type: number, load = 0) {
    if (Type < 0xffff) {
      const t = figures[Type].tv;
      if (t) this.lvars = new Int32Array(t);
    }
    this.otype = Type;
    if (!load) this.defaults();
  }

  private current_sequence(): sequence { return figures[this.otype].get_sequence(this.state); }
  type(): number { return this.otype; }
  hurt_all(): number { return figures[this.otype].get_cflag(CFLAG_HURT_ALL); }
  stoppable(): number { return figures[this.otype].get_cflag(CFLAG_STOPPABLE); }
  can_block(): number { return figures[this.otype].get_cflag(CFLAG_CAN_BLOCK); }
  hurtable(): number { return figures[this.otype].get_cflag(CFLAG_HURTABLE); }
  pushable(): number { return figures[this.otype].get_cflag(CFLAG_PUSHABLE); }
  has_sequence(s: number): boolean { return figures[this.otype].has_sequence(s); }
  picture(): TransImage { return this.current_sequence().get_frame(this.current_frame, this.direction); }
  current_figure(): figure { return this.current_sequence().get_figure(this.current_frame); }
  total_frames(): number { return this.current_sequence().length(); }
  tx(x: number): number { return this.direction > 0 ? x - this.x_center() : this.x_center() - x; }
  ty(y: number): number { return y - this.picture().h + 1; }
  is_playable(): number { return this.hurtable(); }
  alive(): number { return this.state === dead || this.hp() <= 0 ? 0 : 1; }
  stop_acel(): void { this.set_xacel(0); this.set_yacel(0); this.set_fxacel(0); this.set_fyacel(0); }
  stop_vel(): void { this.set_xvel(0); this.set_yvel(0); this.set_fxvel(0); this.set_fyvel(0); }
  stop_x(): void { this.set_xvel(0); this.set_fxvel(0); this.set_xacel(0); this.set_fxacel(0); }
  stop(): void {
    this.set_xvel(0); this.set_yvel(0); this.set_fxvel(0); this.set_fyvel(0);
    this.set_xacel(0); this.set_yacel(0); this.set_fxacel(0); this.set_fyacel(0);
  }
  set_aimemory(p: game_object): void {
    this.add_object(p);
    p.set_flags(p.flags() | KNOWN_FLAG);
  }

  copy(): game_object {
    const o = create(this.otype, this.x, this.y);
    o.state = this.state;
    for (let i = 0; i < TOTAL_OBJECT_VARS; i++) o.set_var(i, this.get_var(i));
    if (this.lvars && o.lvars) o.lvars.set(this.lvars.subarray(0, figures[this.otype].tv));
    for (let i = 0; i < this.total_objects(); i++) o.add_object(this.get_object(i));
    for (let i = 0; i < this.total_lights(); i++) o.add_light(this.get_light(i));
    return o;
  }

  get_var_by_name(name: string): [number, number] {
    for (let i = 0; i < TOTAL_OBJECT_VARS; i++) if (object_descriptions[i].name === name) return [this.get_var(i), 0];
    const t = figures[this.otype];
    for (let i = 0; i < t.tiv; i++)
      if (t.vars[i] && symbol_name_of(t.vars[i]) === name) return [this.lvars![t.var_index[i]], 0];
    return [0, 1];
  }

  set_var_by_name(name: string, value: number): number {
    for (let i = 0; i < TOTAL_OBJECT_VARS; i++) {
      if (object_descriptions[i].name === name) {
        this.set_var(i, value);
        return 1;
      }
    }
    const t = figures[this.otype];
    for (let i = 0; i < t.tiv; i++)
      if (t.vars[i] && symbol_name_of(t.vars[i]) === name) {
        this.lvars![t.var_index[i]] = value;
        return 1;
      }
    return 0;
  }

  reload_notify(): void {
    const ns = figures[this.otype].get_fun(OFUN_RELOAD);
    if (ns) {
      const o = L.current_object;
      L.current_object = this;
      eval_function(ns, null);
      L.current_object = o;
    }
  }

  next_sequence(): void {
    const ns = figures[this.otype].get_fun(OFUN_NEXT_STATE);
    if (ns) {
      L.current_object = this;
      eval_function(ns, null);
    } else {
      switch (this.state) {
        case dieing: this.set_state(dead); break;
        case end_run_jump: this.set_state(running); break;
        case dead:
        case run_jump:
        case run_jump_fall:
        case running:
          this.set_state(this.state);
          break;
        case start_run_jump:
          this.set_yvel(get_ability(this.type(), jump_yvel));
          if (this.xvel() > 0) this.set_xvel(get_ability(this.type(), jump_xvel));
          else if (this.xvel() < 0) this.set_xvel(-get_ability(this.type(), jump_xvel));
          this.set_xacel(0);
          this.set_fxacel(0);
          this.set_gravity(1);
          this.set_state(run_jump);
          break;
        case flinch_up:
        case flinch_down:
          if (this.gravity()) {
            if (this.has_sequence(end_run_jump)) this.set_state(end_run_jump);
            else this.set_state(stopped);
          } else this.set_state(stopped);
          break;
        default:
          this.set_state(stopped);
      }
    }
  }

  add_power(amount: number): void {
    const max_power = lnumber_value(symbol_value(L.l_max_power));
    let n = this.mp() + amount;
    if (n < 0) n = 0;
    if (n > max_power) n = max_power;
    this.set_mp(n);
  }

  add_hp(amount: number): void {
    if (this.controller() && this.controller()!.god) return;
    const max_hp = lnumber_value(symbol_value(L.l_max_hp));
    let n = this.hp() + amount;
    if (n < 0) n = 0;
    if (n > max_hp) n = max_hp;
    this.set_hp(n);
  }

  can_morph_into(type: number): number {
    return type !== this.otype && this.mp() >= figures[type].morph_power ? 1 : 0;
  }

  morph_into(type: number, anneal: number, frames: number): void {
    void anneal;
    void frames;
    this.set_morph_status(new morph_char(this, type));
    this.otype = type;
    this.set_state(stopped);
  }

  draw_above(v: view): void {
    const [x1, y1] = this.picture_space();
    const [sx, sy2v] = G.the_game.game_to_mouse(x1, y1, v);
    let sy2 = sy2v;
    if (sy2 >= v.cy1) {
      const draw_to = y1 - (sy2 - v.cy1);
      const r = G.current_level.foreground_intersect(this.x, y1, this.x, draw_to);
      let [, sy1] = G.the_game.game_to_mouse(x1, r[1], v);
      sy1 = Math.max(v.cy1, sy1);
      sy2 = Math.min(v.cy2, sy2);
      const p = this.picture();
      for (let i = sy1; i <= sy2; i++) p.PutScanLine(G.screen, sx, i, 0);
    }
  }

  push_range(): number { return get_ability(this.otype, push_xrange); }

  /** decide(): returns 0 if the object wants to be deleted */
  decide(): number {
    const ai = figures[this.otype].get_fun(OFUN_AI);
    if (ai) {
      const old_aistate = this.aistate();
      L.current_object = this;
      const ret = eval_function(ai, null);
      if (this.keep_ai_info()) {
        if (this.aistate() !== old_aistate) this.set_aistate_time(0);
        else this.set_aistate_time(this.aistate_time() + 1);
      }
      return ret !== null ? 1 : 0;
    }
    this.move(0, 0, 0);
    return 1;
  }

  can_hurt(who: game_object): number {
    const is_attacker = G.current_level.is_attacker(this);
    if (who.hurtable() && (this._team === -1 || this._team !== who.get_team()) &&
        (is_attacker || G.current_level.is_attacker(who) || this.hurt_all())) return 1;
    return 0;
  }

  note_attack(_whom: game_object): void {}

  do_flinch(_from: game_object): void {
    if (jrandom(2) && this.has_sequence(flinch_down)) this.set_state(flinch_down);
    else if (this.has_sequence(flinch_up)) this.set_state(flinch_up);
  }

  do_damage(amount: number, from: game_object, hitx: number, hity: number, push_xvel: number, push_yvel: number): void {
    if (this._team !== -1 && this._team === from.get_team()) return;
    const d = figures[this.otype].get_fun(OFUN_DAMAGE);
    if (d) {
      const o = L.current_object;
      L.current_object = this;
      const am = new LList(), frm = new LList(), hx = new LList(), hy = new LList(), px = new LList(), py = new LList();
      am.car = new LNumber(amount);
      frm.car = new_pointer(from);
      hx.car = new LNumber(hitx);
      hy.car = new LNumber(hity);
      px.car = new LNumber(push_xvel);
      py.car = new LNumber(push_yvel);
      px.cdr = py;
      hy.cdr = px;
      hx.cdr = hy;
      frm.cdr = hx;
      am.cdr = frm;
      eval_user_function(d as LSymbol, am);
      L.current_object = o;
    } else this.damage_fun(amount, from, hitx, hity, push_xvel, push_yvel);
  }

  damage_fun(amount: number, from: game_object, _hitx: number, _hity: number, push_xvel: number, push_yvel: number): void {
    if (!this.hurtable() || !this.alive()) return;
    this.add_hp(-amount);
    this.set_flags(this.flags() | FLAG_JUST_HIT);
    this.do_flinch(from);
    this.set_xvel(this.xvel() + push_xvel);
    if (push_yvel < 0 && !this.gravity()) this.set_gravity(1);
    this.set_yvel(this.yvel() + push_yvel);
    const c = this.controller();
    if (c && this.hp() <= 0) {
      let v = from.controller();
      if (v) v.kills++;
      else if (from.total_objects() > 0) {
        v = from.get_object(0).controller();
        if (v && v !== c) v.kills++;
        else {
          v = c;
          if (v) v.kills--;
        }
      }
    }
  }

  facing_attacker(attackerx: number): number {
    return (attackerx < this.x && this.direction < 0) || (attackerx >= this.x && this.direction > 0) ? 1 : 0;
  }

  /** picture_space: [x1, y1, x2, y2] */
  picture_space(): [number, number, number, number] {
    const xc = this.x_center(), p = this.picture(), w = p.w, h = p.h;
    const x1 = this.direction > 0 ? this.x - xc : this.x - (w - xc - 1);
    return [x1 | 0, (this.y - h + 1) | 0, (x1 + w - 1) | 0, this.y];
  }

  next_picture(): number {
    let ret = 1;
    if (this.frame_dir() > 0) {
      const [ok, cur] = this.current_sequence().next_frame(this.current_frame);
      this.current_frame = cur;
      if (!ok) {
        this.next_sequence();
        ret = 0;
      }
    } else {
      const [ok, cur] = this.current_sequence().last_frame(this.current_frame);
      this.current_frame = cur;
      if (!ok) {
        this.next_sequence();
        ret = 0;
      }
    }
    this.frame_advance();
    return ret;
  }

  x_center(): number { return this.current_sequence().x_center(this.current_frame); }

  draw(): void {
    const f = figures[this.otype].get_fun(OFUN_DRAW);
    if (f) {
      L.current_object = this;
      eval_function(f, null);
    } else this.drawer();
  }

  map_draw(): void {
    const f = figures[this.otype].get_fun(OFUN_MAP_DRAW);
    if (f) {
      L.current_object = this;
      eval_function(f, null);
    }
  }

  private draw_pos(cpict: TransImage): [number, number] {
    return [(this.direction < 0 ? this.x - (cpict.w - this.x_center() - 1) : this.x - this.x_center()) - L.current_vxadd,
      this.y - cpict.h + 1 - L.current_vyadd];
  }

  draw_trans(count: number, max: number): void {
    const p = this.picture();
    const [x, y] = this.draw_pos(p);
    p.PutFade(G.screen, x, y, count, max, G.color_table, G.the_game.current_palette());
  }

  draw_tint(tint_id: number): void {
    const p = this.picture();
    const [x, y] = this.draw_pos(p);
    if (this.fade_count())
      p.PutFadeTint(G.screen, x, y, this.fade_count(), this.fade_max(), cache.ctint(tint_id).data, G.color_table, G.the_game.current_palette());
    else p.PutRemap(G.screen, x, y, cache.ctint(tint_id).data);
  }

  draw_double_tint(tint_id: number, tint2: number): void {
    const p = this.picture();
    const [x, y] = this.draw_pos(p);
    if (this.fade_count())
      p.PutFadeTint(G.screen, x, y, this.fade_count(), this.fade_max(), cache.ctint(tint_id).data, G.color_table, G.the_game.current_palette());
    else p.PutDoubleRemap(G.screen, x, y, cache.ctint(tint_id).data, cache.ctint(tint2).data);
  }

  draw_predator(): void {
    const p = this.picture();
    const [x, y] = this.draw_pos(p);
    p.PutPredator(G.screen, x, y);
  }

  drawer(): void {
    if (this.morph_status()) {
      this.morph_status()!.draw(this, L.current_view!);
      if (this.morph_status()!.frames_left() < 1) this.set_morph_status(null);
    } else {
      if (this.fade_count()) this.draw_trans(this.fade_count(), this.fade_max());
      else {
        const p = this.picture();
        const [x, y] = this.draw_pos(p);
        p.PutImage(G.screen, x, y);
      }
    }
  }

  /** try_move(x, y, &xv, &yv, checks): returns [hit object, xv, yv] */
  try_move(x: number, y: number, xv: number, yv: number, checks: number): [game_object | null, number, number] {
    if (xv || yv) {
      let who1: game_object | null = null, who2: game_object | null = null;
      const lev = G.current_level;
      if (checks & 1) {
        let [x2, y2] = lev.foreground_intersect(x, y, (x + xv) | 0, (y + yv) | 0);
        let r: [game_object | null, number, number];
        if (!this.stoppable()) r = lev.boundary_setback(this, x, y, x2, y2);
        else r = lev.all_boundary_setback(this, x, y, x2, y2);
        [who1, x2, y2] = r;
        xv = (x2 - x) | 0;
        yv = (y2 - y) | 0;
      }
      if (checks & 2) {
        const h = this.picture().h;
        let [x2, y2] = lev.foreground_intersect(x, (y - h + 1) | 0, (x + xv) | 0, (y - h + 1 + yv) | 0);
        let r: [game_object | null, number, number];
        if (!this.stoppable()) r = lev.all_boundary_setback(this, x, (y - h + 1) | 0, x2, y2);
        else r = lev.boundary_setback(this, x, (y - h + 1) | 0, x2, y2);
        [who2, x2, y2] = r;
        xv = (x2 - x) | 0;
        yv = (y2 - y + h - 1) | 0;
      }
      return [who2 ? who2 : who1, xv, yv];
    }
    return [null, xv, yv];
  }

  float_tick(): LObj {
    let ret = 0;
    if (this.hp() <= 0) {
      if (this.state !== dead) {
        this.set_xacel(0);
        this.set_fxacel(0);
        if (this.has_sequence(dieing)) {
          if (this.state !== dieing) {
            this.set_state(dieing);
            this.set_xvel(0);
          }
        } else {
          this.set_xvel(0);
          this.set_fxvel(0);
          if (this.has_sequence(dead)) this.set_state(dead);
          else return null;
        }
      }
    }
    const fxv = this.sfxvel() + this.sfxacel(), fyv = this.sfyvel() + this.sfyacel();
    const xv = (this.xvel() + this.xacel() + (fxv >> 8)) | 0, yv = (this.yvel() + this.yacel() + (fyv >> 8)) | 0;
    if (xv !== this.xvel() || yv !== this.yvel()) {
      this.set_xvel(xv);
      this.set_yvel(yv);
    }
    if (fxv !== this.sfxvel() || fyv !== this.sfyvel()) {
      this.set_fxvel(fxv & 0xff);
      this.set_fyvel(fyv & 0xff);
    }
    if (fxv || fyv || xv || yv) {
      const ffx = this.fx() + this.sfxvel(), ffy = this.fy() + this.sfyvel();
      let nxv = (this.xvel() + (ffx >> 8)) | 0;
      let nyv = (this.yvel() + (ffy >> 8)) | 0;
      this.set_fx(ffx & 0xff);
      this.set_fy(ffy & 0xff);
      const old_nxv = nxv, old_nyv = nyv;
      let hit_object: game_object | null;
      [hit_object, nxv, nyv] = this.try_move(this.x, this.y, nxv, nyv, 3);
      this.x = this.x + nxv;
      this.y = this.y + nyv;
      if (old_nxv !== nxv || old_nyv !== nyv) {
        const lx = L.last_tile_hit_x, ly = L.last_tile_hit_y;
        this.stop();
        if (old_nxv === 0) {
          if (old_nyv > 0) ret |= BLOCKED_DOWN;
          else if (old_nyv < 0) ret |= BLOCKED_UP;
        } else if (old_nyv === 0) {
          if (old_nxv > 0) ret |= BLOCKED_RIGHT;
          else if (old_nxv < 0) ret |= BLOCKED_LEFT;
        } else {
          let tx = old_nxv > 0 ? 1 : -1, ty = 0;
          [, tx, ty] = this.try_move(this.x, this.y, tx, ty, 3);
          if (!tx) ret |= old_nxv > 0 ? BLOCKED_RIGHT : BLOCKED_LEFT;
          else tx = 0;
          ty = old_nyv > 0 ? 1 : -1;
          [, tx, ty] = this.try_move(this.x, this.y, tx, ty, 3);
          if (!ty) ret |= old_nyv > 0 ? BLOCKED_DOWN : BLOCKED_UP;
          if (!ret) ret |= (old_nyv > 0 ? BLOCKED_DOWN : BLOCKED_UP) | (old_nxv > 0 ? BLOCKED_RIGHT : BLOCKED_LEFT);
        }
        const rlist = { v: null as LObj };
        if (hit_object) {
          push_onto_list(new_pointer(hit_object), rlist);
          push_onto_list(L.l_object, rlist);
        } else {
          push_onto_list(new LNumber(ly), rlist);
          push_onto_list(new LNumber(lx), rlist);
          push_onto_list(L.l_tile, rlist);
        }
        push_onto_list(new LNumber(ret), rlist);
        return rlist.v;
      }
      return true_symbol;
    }
    return true_symbol;
  }

  /** tick(): the physics; returns the blocked status */
  tick(): number {
    let blocked = 0;
    let xt = 0, yt = 2;
    [, xt, yt] = this.try_move(this.x, this.y - 2, xt, yt, 1);
    this.y = this.y - 2 + yt;
    if (this.flags() & FLAG_JUST_BLOCKED) this.set_flags(this.flags() - FLAG_JUST_BLOCKED);
    if (this.gravity() && !this.floating()) {
      const fya = this.yacel() >= 0 ? this.sfyacel() + 200 : this.sfyacel() - 200;
      this.set_yacel(this.yacel() + (fya >> 8));
      this.set_fyacel(fya & 255);
    }
    const xa = this.xacel(), ya = this.yacel(), fxa = this.sfxacel(), fya = this.sfyacel();
    if (xa || ya || fxa || fya) {
      let fxv = this.sfxvel(), fyv = this.sfyvel();
      fxv += fxa;
      fyv += fya;
      this.set_xvel(this.xvel() + xa + (fxv >> 8));
      this.set_yvel(this.yvel() + ya + (fyv >> 8));
      this.set_fxvel(fxv & 0xff);
      this.set_fyvel(fyv & 0xff);
    }
    const old_vy = this.yvel(), old_vx = this.xvel();
    if (old_vx || old_vy) {
      let up = 0;
      if (this.yvel() <= 0) up = 2;
      let xv = this.xvel(), yv = this.yvel();
      let h: game_object | null;
      [h, xv, yv] = this.try_move(this.x, this.y, xv, yv, 1 | up);
      this.set_xvel(xv);
      this.set_yvel(yv);
      this.x = this.x + xv;
      this.y = this.y + yv;
      if (h && this.stoppable()) return BLOCKED_LEFT | BLOCKED_RIGHT;
      if (xv !== old_vx || yv !== old_vy) {
        if (this.gravity()) {
          let fall_xv = 0, fall_vy: number;
          const old_fall_vy = fall_vy = (old_vy - this.yvel()) | 0;
          [, fall_xv, fall_vy] = this.try_move(this.x, this.y, fall_xv, fall_vy, 1 | up);
          if (old_vy > 0 && fall_vy < old_fall_vy) {
            if (old_vy > 0) {
              blocked |= BLOCKED_DOWN;
              if (!this.xvel() && this.has_sequence(end_run_jump)) {
                this.set_xvel(old_vx);
                this.set_state(end_run_jump);
              } else this.set_state(stopped);
            } else blocked |= BLOCKED_UP;
            if (this.state === run_jump_fall) {
              if (this.has_sequence(running)) this.set_state(running);
              else {
                this.stop_x();
                this.set_state(stopped);
              }
            } else {
              this.set_yacel(0);
              this.set_fyacel(0);
              this.set_yvel(0);
              this.set_fyvel(0);
              this.set_gravity(0);
            }
          } else {
            if (old_vy !== 0) {
              let testx = old_vx < 0 ? -1 : 1, testy = 0;
              [, testx, testy] = this.try_move(this.x, this.y, testx, testy, 1 | up);
              if (testx === 0) {
                if (old_vx < 0) blocked |= BLOCKED_LEFT;
                else blocked |= BLOCKED_RIGHT;
              } else if (old_vy < 0) blocked |= BLOCKED_UP;
              else if (old_vy > 0) blocked |= BLOCKED_DOWN;
            } else if (old_vx < 0) blocked |= BLOCKED_LEFT;
            else blocked |= BLOCKED_RIGHT;
            this.set_xvel(0);
            this.set_fxvel(0);
            if (old_vy < 0 && fall_vy > 0) this.set_yvel(this.yvel() + fall_vy);
            else this.set_yvel(this.yvel() + fall_vy);
          }
          this.y = this.y + fall_vy;
        } else {
          const ox = this.x, oy = this.y;
          let climb_xvel = 0, climb_yvel = -5;
          [, climb_xvel, climb_yvel] = this.try_move(this.x, this.y, climb_xvel, climb_yvel, 3);
          this.y = this.y + climb_yvel;
          climb_xvel = (old_vx - this.xvel()) | 0;
          climb_yvel = -Math.abs(climb_xvel);
          [, climb_xvel, climb_yvel] = this.try_move(this.x, this.y, climb_xvel, climb_yvel, 3);
          if (Math.abs(climb_xvel) > 0) {
            blocked = blocked & ~(BLOCKED_LEFT | BLOCKED_RIGHT);
            this.x = this.x + climb_xvel;
            this.y = this.y + climb_yvel;
            this.set_xvel(this.xvel() + climb_xvel);
            this.set_yvel(0);
            this.set_fyvel(0);
            climb_yvel = Math.abs(climb_xvel) + 5;
            climb_xvel = 0;
            [, climb_xvel, climb_yvel] = this.try_move(this.x, this.y, climb_xvel, climb_yvel, 1);
            if (climb_yvel) this.y = this.y + climb_yvel;
          } else {
            if (old_vx < 0) blocked |= BLOCKED_LEFT;
            else blocked |= BLOCKED_RIGHT;
            this.set_state(stopped);
            this.x = ox;
            this.y = oy;
          }
        }
        if (this.xvel() !== old_vx && this.state !== run_jump_fall && this.state !== end_run_jump) {
          this.set_xacel(0);
          this.set_fxacel(0);
        }
      }
    }
    if (this.yacel() === 0 && !this.gravity()) {
      let nvx = 0, nvy = (this.yvel() + 12) | 0;
      [, nvx, nvy] = this.try_move(this.x, this.y, nvx, nvy, 1);
      if (nvy > 11) {
        if (this.state !== run_jump_fall) {
          if (this.has_sequence(run_jump_fall)) this.set_state(run_jump_fall);
          this.set_gravity(1);
        }
      } else if (nvy) {
        this.y = this.y + nvy;
        blocked |= BLOCKED_DOWN;
      }
    }
    return blocked;
  }

  defaults(): void {
    this.set_state(this.state);
    if (this.otype !== 0xffff) {
      const s = get_ability(this.otype, start_hp);
      if (s !== 0) this.set_hp(s);
    }
  }

  frame_advance(): void {
    const ad = this.current_sequence().get_advance(this.current_frame);
    if (ad && G.current_level) {
      let xv = this.direction > 0 ? ad : -ad;
      let yv = 0;
      [, xv, yv] = this.try_move(this.x, this.y, xv, yv, 3);
      void yv;
      this.x = this.x + xv;
    }
  }

  set_state(s: number, frame_direction = 1): void {
    if (this.has_sequence(s)) this.state = s;
    else this.state = stopped;
    this.current_frame = 0;
    if (frame_direction !== 1) this.set_frame_dir(frame_direction);
    this.frame_advance();
  }

  move(cx: number, cy: number, button: number): number {
    let ret = 0;
    const mf = figures[this.otype].get_fun(OFUN_MOVER);
    if (mf) {
      const o = L.current_object;
      L.current_object = this;
      const lcx = new LList(), lcy = new LList(), lb = new LList();
      lcx.car = new LNumber(cx);
      lcy.car = new LNumber(cy);
      lb.car = new LNumber(button);
      lcx.cdr = lcy;
      lcy.cdr = lb;
      const r = eval_function(mf, lcx);
      if (item_type(r) !== L_NUMBER) {
        print(r);
        lbreak(`Object ${object_names[this.otype]} did not return a number from its mover function!`);
      }
      ret |= lnumber_value(r);
      L.current_object = o;
    } else ret |= this.mover(cx, cy, button);
    return ret;
  }

  mover(cx: number, cy: number, button: number): number {
    if (this.hp() <= 0) return this.tick();
    if (flinch_state(this.state)) cx = cy = button = 0;
    void button;
    const T = this.type();
    if (cx) {
      if (this.state === stopped) {
        if (this.has_sequence(running)) {
          if (cx > 0) {
            this.direction = 1;
            this.set_xvel(get_ability(T, run_top_speed));
          } else {
            this.direction = -1;
            this.set_xacel(-get_ability(T, run_top_speed));
          }
          this.set_state(running);
        }
      } else if (this.state === run_jump || this.state === run_jump_fall) {
        if (cx > 0) {
          this.direction = 1;
          this.set_xacel(get_ability(T, start_accel));
        } else {
          this.direction = -1;
          this.set_xacel(-get_ability(T, start_accel));
        }
      } else {
        if ((cx > 0 && this.direction < 0) || (cx < 0 && this.direction > 0)) this.direction = -this.direction;
      }
    } else if (!this.gravity() && this.state !== start_run_jump) {
      if (this.xvel() < 0) {
        const stop_acel = get_ability(T, stop_accel);
        if (this.xvel() + stop_acel >= 0) {
          this.stop_x();
          if (!this.gravity()) this.set_state(stopped);
        } else this.set_xacel(stop_acel);
      } else if (this.xvel() > 0) {
        const stop_acel = -get_ability(T, stop_accel);
        if (this.xvel() + stop_acel <= 0) {
          this.stop_x();
          if (!this.gravity()) this.set_state(stopped);
        } else this.set_xacel(stop_acel);
      } else if (!this.gravity()) {
        this.set_xacel(0);
        this.set_fxacel(0);
        if (this.state === running) this.set_state(stopped);
      }
    }
    if (cy < 0 && !this.floating() && !this.gravity()) {
      this.set_gravity(1);
      this.set_yvel(get_ability(T, jump_yvel));
      this.set_state(run_jump);
      if (this.xvel() !== 0) {
        if (this.direction > 0) this.set_xvel(get_ability(T, jump_top_speed));
        else this.set_xvel(-get_ability(T, jump_top_speed));
      }
      this.set_xacel(0);
    }
    if (this.state === run_jump && this.yvel() > 0) this.set_state(run_jump_fall);
    if (cx > 0) this.set_xacel(get_ability(T, start_accel));
    else if (cx < 0) this.set_xacel(-get_ability(T, start_accel));
    let top_speed: number;
    if (this.state === stopped || this.state === end_run_jump) top_speed = get_ability(T, walk_top_speed);
    else if (this.state === running) top_speed = get_ability(T, run_top_speed);
    else if (this.state === run_jump || this.state === run_jump_fall || this.state === start_run_jump) {
      top_speed = get_ability(T, jump_top_speed);
      if (!cx) top_speed = 0;
    } else top_speed = 1000;
    if (Math.abs(this.xvel() + this.xacel()) > top_speed) {
      if (this.xacel() < 0) this.set_xacel(-top_speed - this.xvel());
      else this.set_xacel(top_speed - this.xvel());
    }
    const old_state = this.state;
    const old_frame = this.current_frame;
    const tick_stat = this.tick();
    if (!tick_stat && old_state === start_run_jump) {
      this.set_state(old_state);
      this.current_frame = old_frame;
      this.next_picture();
    }
    return tick_stat;
  }

  /** bmove(int &whit, exclude): returns [hit object, whit] */
  bmove(exclude: game_object | null): [game_object | null, number] {
    const xa = this.xacel(), ya = this.yacel(), fxa = this.sfxacel(), fya = this.sfyacel();
    if (xa || ya || fxa || fya) {
      let fxv = this.sfxvel(), fyv = this.sfyvel();
      fxv += fxa;
      fyv += fya;
      this.set_xvel(this.xvel() + xa + (fxv >> 8));
      this.set_yvel(this.yvel() + ya + (fyv >> 8));
      this.set_fxvel(fxv & 0xff);
      this.set_fyvel(fyv & 0xff);
    }
    let nx = (this.x + this.xvel()) | 0, ny = (this.y + this.yvel()) | 0;
    const nfx = this.fx() + this.fxvel(), nfy = this.fy() + this.fyvel();
    nx = (nx + (nfx >> 8)) | 0;
    ny = (ny + (nfy >> 8)) | 0;
    const ox2 = nx, oy2 = ny;
    [nx, ny] = G.current_level.foreground_intersect(this.x, this.y, nx, ny);
    let ret: game_object | null;
    [ret, nx, ny] = G.current_level.all_boundary_setback(exclude, this.x, this.y, nx, ny);
    this.x = nx;
    this.y = ny;
    this.set_fx(nfx & 0xff);
    this.set_fy(nfy & 0xff);
    if (ret) {
      if (!ret.hurtable()) return [null, 1];
      return [ret, 0];
    }
    return [null, nx !== ox2 || ny !== oy2 ? 1 : 0];
  }

  reduced_state(): number {
    let x = 0;
    for (let i = 0; i < figures[this.otype].ts; i++) {
      if (i === this.state) return x;
      else if (figures[this.otype].seq[i]) x++;
    }
    return 0;
  }

  change_aitype(new_type: number): void {
    this.set_aitype(new_type);
    if (this.otype < 0xffff) {
      const f = figures[this.otype].get_fun(OFUN_CHANGE_TYPE);
      if (f) {
        const o = L.current_object;
        L.current_object = this;
        eval_user_function(f as LSymbol, null);
        L.current_object = o;
      }
    }
  }

  change_type(new_type: number): void {
    this.lvars = null;
    if (this.otype < 0xffff) {
      const t = figures[new_type].tv;
      if (t) this.lvars = new Int32Array(t);
    } else return;
    this.otype = new_type;
    const f = figures[new_type].get_fun(OFUN_CONSTRUCTOR);
    if (f) {
      const o = L.current_object;
      L.current_object = this;
      eval_function(f, null);
      L.current_object = o;
    }
  }
}

function symbol_name_of(s: LObj): string { return (s as unknown as { name: { str: string } }).name.str; }

/** create(type, x, y, skip_constructor, aitype) */
export function create(type: number, x: number, y: number, skip_constructor = 0, aitype = 0): game_object {
  const g = new game_object(type, skip_constructor);
  g.x = x;
  g.y = y;
  g.last_x = x | 0;
  g.last_y = y | 0;
  if (aitype) g.set_aitype(aitype);
  const f = figures[type].get_fun(OFUN_CONSTRUCTOR);
  if (f && !skip_constructor) {
    const o = L.current_object;
    L.current_object = g;
    eval_function(f, null);
    L.current_object = o;
  }
  return g;
}

export function base_size(): number { return 1 + 1 * 8 + 2 * 5 + 4 * 7; }

export class object_node {
  me: game_object;
  next: object_node | null;
  constructor(me: game_object, next: object_node | null) {
    this.me = me;
    this.next = next;
  }
}

export function object_to_number_in_list(who: game_object | null, list: object_node | null): number {
  let x = 1;
  while (list) {
    if (who === list.me) return x;
    list = list.next;
    x++;
  }
  return 0;
}

export function number_to_object_in_list(x: number, list: object_node | null): game_object | null {
  if (!x) return null;
  x--;
  while (x && list) {
    list = list.next;
    x--;
  }
  return list ? list.me : null;
}
