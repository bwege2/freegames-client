// chars.cpp, seq.cpp, ability.cpp: character types (def_char), their animation sequences and abilities
import { cache } from './cache.ts';
import type { TransImage } from './imlib/transimage.ts';
import type { figure } from './items.ts';
import { SPEC_CHARACTER2, SPEC_IMAGE } from './imlib/specs.ts';
import { dprintf } from './imlib/dprint.ts';
import { add_c_object, assoc, CAR, CDR, DEFINEDP, find_or_create, item_type, lbreak, lcar, lcdr, lisp_eval, list_length,
  lnumber_value, L_NUMBER, L_OBJECT_VAR, current_space, set_current_space, PERM_SPACE, L_STRING, L_SYMBOL, lstring_value, NILP, print, set_number, type LObj,
  LObjectVar, type LSymbol } from './lisp/lisp.ts';

// character_state
export const dead = 0, dieing = 1, stopped = 2, start_run_jump = 3, run_jump = 4, run_jump_fall = 5, end_run_jump = 6,
  flinch_up = 7, flinch_down = 8, morph_pose = 9, running = 10;
export const MAX_STATE = running + 1;
export const state_names = ['dead', 'dieing', 'stopped', 'start_run_jump', 'run_jump', 'run_jump_fall', 'end_run_jump',
  'flinch_up', 'flinch_down', 'morph_pose', 'running'];

export const TOTAL_CFLAGS = 11;
export const CFLAG_HURT_ALL = 0, CFLAG_IS_WEAPON = 1, CFLAG_STOPPABLE = 2, CFLAG_CAN_BLOCK = 3, CFLAG_HURTABLE = 4,
  CFLAG_PUSHABLE = 5, CFLAG_UNLISTABLE = 6, CFLAG_ADD_FRONT = 7, CFLAG_CACHED_IN = 8, CFLAG_NEED_CACHE_IN = 9,
  CFLAG_UNACTIVE_SHIELD = 10;
export const cflag_names = ['hurt_all', 'is_weapon', 'stoppable', 'can_block', 'hurtable', 'pushable', 'unlistable',
  'add_front', 'cached_in', 'need_cache_in', 'unactive_shield'];

export const TOTAL_OFUNS = 11;
export const OFUN_AI = 0, OFUN_MOVER = 1, OFUN_DRAW = 2, OFUN_MAP_DRAW = 3, OFUN_DAMAGE = 4, OFUN_NEXT_STATE = 5,
  OFUN_USER_FUN = 6, OFUN_CONSTRUCTOR = 7, OFUN_RELOAD = 8, OFUN_GET_CACHE_LIST = 9, OFUN_CHANGE_TYPE = 10;
export const ofun_names = ['ai_fun', 'move_fun', 'draw_fun', 'map_draw_fun', 'damage_fun', 'next_state_fun', 'user_fun',
  'constructor', 'reload_fun', 'get_cache_list_fun', 'type_change_fun'];

// ability.cpp
export const start_hp = 0, start_accel = 1, stop_accel = 2, jump_xvel = 3, jump_yvel = 4, run_top_speed = 5,
  jump_top_speed = 6, tint_color = 7, push_xrange = 8, walk_top_speed = 9;
export const TOTAL_ABILITIES = walk_top_speed + 1;
export const ability_names = ['start_hp', 'start_accel', 'stop_accel', 'jump_xvel', 'jump_yvel', 'run_top_speed',
  'jump_top_speed', 'tint_color', 'push_xrange', 'walk_top_speed'];
const abil_def = [6, 3, 4, 2, -16, 10, 6, 0, 0, 6];
export function get_ability_default(a: number): number { return abil_def[a]; }
export function get_ability(who: number, a: number): number { return figures[who].abil[a]; }

/** seq.cpp */
export class sequence {
  total: number;
  seq: number[];

  constructor(filename: string, pict_list: LObj) {
    this.total = item_type(pict_list) === L_STRING ? 1 : list_length(pict_list);
    this.seq = [];
    if (item_type(pict_list) === L_STRING) this.seq[0] = cache.reg_object(filename, pict_list, SPEC_CHARACTER2, 1);
    else {
      for (let i = 0; i < this.total; i++) {
        this.seq[i] = cache.reg_object(filename, lcar(pict_list), SPEC_CHARACTER2, 1);
        pict_list = lcdr(pict_list);
      }
    }
  }

  /** next_frame(short &current): returns [ok, new current] */
  next_frame(current: number): [number, number] {
    current = ((current + 1) << 16) >> 16;
    if (current >= this.total) return [0, 0];
    return [1, current];
  }
  last_frame(current: number): [number, number] {
    current = ((current - 1) << 16) >> 16;
    if (current < 0) return [0, this.total - 1];
    return [1, current];
  }
  get_frame(current: number, direction: number): TransImage {
    return direction > 0 ? cache.fig(this.seq[current]).forward : cache.fig(this.seq[current]).backward;
  }
  get_figure(current: number): figure { return cache.fig(this.seq[current]); }
  cache_in(): number {
    for (let i = 0; i < this.total; i++) cache.note_need(this.seq[i]);
    return 1;
  }
  x_center(current: number): number { return cache.fig(this.seq[current]).xcfg; }
  length(): number { return this.total; }
  get_advance(current: number): number { return cache.fig(this.seq[current]).advance; }
}

export class named_field {
  real_name: string;
  descript_name: string;
  constructor(real: string, fake: string) {
    this.real_name = real;
    this.descript_name = fake;
  }
}

export let figures: character_type[] = [];
export let object_names: string[] = [];
export const W = { total_weapons: 0, weapon_types: [] as number[] };

export function chars_reset(): void {
  figures = [];
  object_names = [];
  W.total_weapons = 0;
  W.weapon_types = [];
}

/** names of the 28 simple_object variables (objects.cpp object_descriptions) */
export const object_var_names = ['fade_dir', 'frame_dir', 'direction', 'gravity_on', 'fade_count', 'fade_max', 'active',
  'flags', 'aitype', 'xvel', 'fxvel', 'yvel', 'fyvel', 'xacel', 'fxacel', 'yacel', 'fyacel', 'x', 'fx', 'y', 'fy', 'hp',
  'mp', 'fmp', 'cur_frame', 'aistate', 'aistate_time', 'targetable'];

export class character_type {
  ts = 0;
  tiv = 0;
  tv = 0;
  seq: (sequence | null)[] = [];
  seq_syms: LObj[] = [];
  vars: (LObj)[] = [];
  var_index: number[] = [];
  abil: number[] = [];
  fun_table: LObj[] = new Array(TOTAL_OFUNS).fill(null);
  logo = -1;
  morph_mask = -1;
  morph_power = 0;
  rangex = 0;
  rangey = 0;
  draw_rangex = 0;
  draw_rangey = 0;
  cflags = 0;
  total_fields = 0;
  fields: named_field[] = [];

  get_fun(name: number): LObj { return this.fun_table[name]; }
  get_cflag(name: number): number { return this.cflags & (1 << name); }
  set_cflag(name: number, x: number): void {
    if (x) this.cflags |= 1 << name;
    else this.cflags &= ~(1 << name);
    this.cflags &= 0xffff;
  }
  has_sequence(s: number): boolean { return s < this.ts && this.seq[s] !== null; }

  add_state(symbol: LObj): number {
    if (item_type(symbol) !== L_SYMBOL) {
      print(symbol);
      lbreak('is not a symbol (in def_char)');
    }
    const val = (symbol as LSymbol).value;
    let num: number;
    if (DEFINEDP(val)) {
      if (item_type(val) !== L_NUMBER) {
        print(symbol);
        dprintf('expecting symbol value to be a number, instead got : ');
        print(val);
        lbreak('');
      }
      num = lnumber_value(val);
    } else {
      num = this.ts;
      if (num < MAX_STATE) num = MAX_STATE;
      set_number(symbol as LSymbol, num);
    }
    if (num < this.ts && this.seq[num]) {
      print(symbol);
      lbreak('symbol has been assigned value, but value already in use by state');
    } else if (num >= this.ts) {
      for (let i = this.ts; i <= num; i++) {
        this.seq[i] = null;
        this.seq_syms[i] = null;
      }
      this.ts = num + 1;
    }
    this.seq_syms[num] = symbol;
    return num;
  }

  cache_in(): number {
    if (this.get_cflag(CFLAG_CACHED_IN)) return 1;
    this.cflags |= 1 << CFLAG_CACHED_IN;
    for (let i = 0; i < this.ts; i++) if (this.seq[i]) this.seq[i]!.cache_in();
    return 1;
  }

  add_sequence(which: number, s: sequence): void { this.seq[which] = s; }

  /** get_sequence: the state's sequence, or the stopped one */
  get_sequence(s: number): sequence {
    const q = s < this.ts ? this.seq[s] : null;
    return q ? q : this.seq[stopped]!;
  }

  add_var(symbol: LObj, name: LObj): void {
    const s = symbol as LSymbol;
    if (DEFINEDP(s.value) && item_type(s.value) !== L_OBJECT_VAR) {
      print(symbol);
      lbreak('symbol already has a value, cannot instantiate an object varible');
    } else if (DEFINEDP(s.value)) {
      const index = (s.value as LObjectVar).index;
      if (index < this.tiv) {
        if (this.vars[index]) lbreak(`While defining object ${(name as LSymbol).name.str} : var previously defined`);
        else {
          this.var_index[index] = this.tv;
          this.vars[index] = symbol;
          this.tv++;
        }
      } else {
        const new_total = index + 1;
        for (let i = this.tiv; i < new_total; i++) {
          this.vars[i] = null;
          this.var_index[i] = 0;
        }
        this.tiv = new_total;
        this.var_index[index] = this.tv;
        this.vars[index] = symbol;
        this.tv++;
      }
    } else {
      let free_index = this.tiv;
      for (let i = 0; i < this.tiv; i++) if (!this.vars[i] && i < this.tiv) free_index = i;
      if (free_index === this.tiv) {
        this.vars[this.tiv] = null;
        this.var_index[this.tiv] = 0;
        this.tiv = free_index + 1;
      }
      const sp = current_space;
      set_current_space(PERM_SPACE);
      add_c_object(s, free_index);
      set_current_space(sp);
      this.vars[free_index] = symbol;
      this.var_index[free_index] = this.tv;
      this.tv++;
    }
  }

  isa_var_name(name: string): number {
    if (object_var_names.includes(name)) return 1;
    for (let i = 0; i < this.tiv; i++) if (this.vars[i] && (this.vars[i] as LSymbol).name.str === name) return 1;
    return 0;
  }

  constructor(args: LObj, name: LObj, total_objects: number) {
    const l_abil = find_or_create('abilities'), l_funs = find_or_create('funs'), l_states = find_or_create('states'),
      l_flags = find_or_create('flags'), l_range = find_or_create('range'), l_draw_range = find_or_create('draw_range'),
      l_fields = find_or_create('fields'), l_logo = find_or_create('logo'), l_vars = find_or_create('vars');
    for (let i = 0; i < TOTAL_ABILITIES; i++) this.abil[i] = get_ability_default(i);
    for (let field = args; field; field = CDR(field)) {
      const f = CAR(CAR(field));
      if (f === l_abil) {
        const l = CDR(CAR(field));
        for (let i = 0; i < TOTAL_ABILITIES; i++) {
          const ab = assoc(find_or_create(ability_names[i]), l);
          if (!NILP(ab)) this.abil[i] = lnumber_value(lisp_eval(lcar(lcdr(ab))));
        }
      } else if (f === l_funs) {
        const l = CDR(CAR(field));
        for (let i = 0; i < TOTAL_OFUNS; i++) {
          const ab = assoc(find_or_create(ofun_names[i]), l);
          if (!NILP(ab) && lcar(lcdr(ab))) this.fun_table[i] = lcar(lcdr(ab));
        }
      } else if (f === l_flags) {
        const l = CDR(CAR(field));
        for (let i = 0; i < TOTAL_CFLAGS; i++) {
          const ab = assoc(find_or_create(cflag_names[i]), l);
          if (!NILP(ab) && lisp_eval(lcar(lcdr(ab)))) this.cflags |= 1 << i;
        }
        if (this.get_cflag(CFLAG_IS_WEAPON)) {
          W.total_weapons++;
          W.weapon_types[W.total_weapons - 1] = total_objects;
        }
      } else if (f === l_range) {
        this.rangex = lnumber_value(lisp_eval(lcar(lcdr(lcar(field)))));
        this.rangey = lnumber_value(lisp_eval(lcar(lcdr(lcdr(lcar(field))))));
      } else if (f === l_draw_range) {
        this.draw_rangex = lnumber_value(lisp_eval(lcar(lcdr(lcar(field)))));
        this.draw_rangey = lnumber_value(lisp_eval(lcar(lcdr(lcdr(lcar(field))))));
      } else if (f === l_states) {
        let l = CDR(CAR(field));
        const fn = lstring_value(lisp_eval(CAR(l)));
        l = CDR(l);
        while (l) {
          const index = this.add_state(CAR(CAR(l)));
          const e = lisp_eval(CAR(CDR(CAR(l))));
          this.seq[index] = new sequence(fn, e);
          l = CDR(l);
        }
      } else if (f === l_fields) {
        for (let mf = CDR(CAR(field)); !NILP(mf); mf = lcdr(mf)) {
          const real = lstring_value(lisp_eval(lcar(lcar(mf))));
          const fake = lstring_value(lisp_eval(lcar(lcdr(lcar(mf)))));
          if (!this.isa_var_name(real)) {
            print(field);
            lbreak(`fields : no such var name "${real}"\n`);
          }
          this.total_fields++;
          this.fields.push(new named_field(real, fake));
        }
      } else if (f === l_logo) {
        const fn = lstring_value(lisp_eval(CAR(CDR(CAR(field)))));
        const o = lstring_value(lisp_eval(CAR(CDR(CDR(CAR(field))))));
        this.logo = cache.reg(fn, o, SPEC_IMAGE, 1);
      } else if (f === l_vars) {
        for (let l = CDR(CAR(field)); l; l = CDR(l)) this.add_var(CAR(l), name);
      } else {
        print(lcar(field));
        lbreak('Unknown field for character definition');
      }
    }
    if (!this.seq[stopped]) lbreak(`object (${(name as LSymbol).name.str}) has no stopped state, please define one!\n`);
  }
}

export function flinch_state(state: number): number {
  return state === flinch_up || state === flinch_down ? 1 : 0;
}

/** def_char (clisp.cpp l_caller 23) */
export function def_char(args: LObj): number {
  const sym = lcar(args);
  if (item_type(sym) !== L_SYMBOL) lbreak('expecting first arg to def-character to be a symbol!\n');
  const total_objects = figures.length;
  set_number(sym as LSymbol, total_objects);
  object_names[total_objects] = (sym as LSymbol).name.str;
  figures[total_objects] = new character_type(CDR(args), sym, total_objects);
  return total_objects;
}
