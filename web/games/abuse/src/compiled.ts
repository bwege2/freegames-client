// compiled.cpp, compiled.h: the state and object numbers that the C++ AI (cop.cpp, ant.cpp, sensor.cpp)
// takes from the Lisp data once it is loaded (compiled_init), and the bad guy flags the player's
// rockets use to find targets.
// The S_* numbers are exported `let` bindings: importers see the values compiled_init assigns.
import { CAR, DEFINEDP, find_or_create, find_symbol, item_type, lbreak, lcdr, lnumber_value, L_NUMBER, symbol_value,
  type LObj } from './lisp/lisp.ts';
import { figures } from './chars.ts';

/** list flaging each character saying they are a bad bug or not, mainly used by the rocket to find
 *  targets (uint8_t *bad_guy_array, NULL until compiled_init finds bad_guy_list) */
export let bad_guy_array: Uint8Array | null = null;

export let S_fall_start = 0, S_falling = 0, S_landing = 0, S_pounce_wait = 0,
  S_turn_around = 0, S_fire_wait = 0, S_ceil_fire = 0, S_top_walk = 0,
  S_blown_back_dead = 0, S_jump_up = 0, S_hiding = 0, S_weapon_fire = 0,
  S_hanging = 0, S_blocking = 0, S_rotate = 0, S_climbing = 0, S_climb_off = 0,
  S_fly_stopped = 0, S_fast_stopped = 0, S_fast_running = 0, S_fly_running = 0,
  S_fly_start_run_jump = 0, S_fly_run_jump = 0, S_fly_run_jump_fall = 0, S_fly_end_run_jump = 0,
  S_fast_start_run_jump = 0, S_fast_run_jump = 0, S_fast_run_jump_fall = 0, S_fast_end_run_jump = 0,
  S_bright_tint = 0, S_climb_on = 0,
  S_ASCREAM_SND = 0, S_ALAND_SND = 0, S_ASLASH_SND = 0, S_ROCKET_TOP = 0, S_BFG_TOP = 0,
  S_GRENADE_TOP = 0, S_FIREBOMB_TOP = 0, S_DFRIS_TOP = 0, S_ANT_ROOF = 0,
  S_MGUN_TOP = 0, S_CLOUD = 0, S_HIDDEN_ANT = 0,
  S_health_image = 0, S_fly_image = 0, S_fast_image = 0,
  S_sneaky_image = 0, S_EXPLODE3 = 0, S_EXPLODE5 = 0, S_ROCKET = 0, S_SCARE_SND = 0,
  S_TRACK_GUN = 0, S_SPRAY_GUN = 0, S_LPING_SND = 0, S_FLY_SND = 0, S_SPEED_SND = 0, S_LOW_HEALTH_SND = 0,
  S_BUTTON_PRESS_SND = 0,
  S_LINK_SND = 0, S_DELETE_SND = 0;

export let compile_error = 0;

/** loadgame.cpp's int last_save_game_number, which compiled_init sets; kept here because no other
 *  module of the port declares it yet (an ES module cannot assign another module's binding) */
export const CMP = { last_save_game_number: 0 };

function c_state(name: string): number {
  const sym = find_symbol(name);
  if (sym) {
    if (item_type(sym.value) !== L_NUMBER) compile_error = 1;
    else return lnumber_value(sym.value);
  } else compile_error = 1;
  return 0;
}

export function compiled_init(): void {
  S_fall_start = c_state('fall_start');
  S_falling = c_state('falling');
  S_landing = c_state('landing');
  S_pounce_wait = c_state('pounce_wait');
  S_turn_around = c_state('turn_around');
  S_fire_wait = c_state('fire_wait');
  S_ceil_fire = c_state('ceil_fire');
  S_top_walk = c_state('top_walk');
  S_jump_up = c_state('jump_up');
  S_rotate = c_state('rotate');
  S_hiding = c_state('hiding');
  S_weapon_fire = c_state('weapon_fire');
  S_climbing = c_state('climbing');
  S_climb_off = c_state('climb_off');
  S_blown_back_dead = c_state('blown_back_dead');
  S_hanging = c_state('hanging');
  S_blocking = c_state('blocking');

  S_fly_stopped = c_state('fly_stopped');
  S_fast_stopped = c_state('fast_stopped');
  S_fast_running = c_state('fast_running');
  S_fly_running = c_state('fly_running');

  S_fly_start_run_jump = c_state('fly_start_run_jump');
  S_fly_run_jump = c_state('fly_run_jump');
  S_fly_run_jump_fall = c_state('fly_run_jump_fall');
  S_fly_end_run_jump = c_state('fly_end_run_jump');

  S_fast_start_run_jump = c_state('fast_start_run_jump');
  S_fast_run_jump = c_state('fast_run_jump');
  S_fast_run_jump_fall = c_state('fast_run_jump_fall');
  S_fast_end_run_jump = c_state('fast_end_run_jump');
  S_bright_tint = c_state('bright_tint');
  S_climb_on = c_state('climb_on');

  S_ALAND_SND = c_state('ALAND_SND');
  S_ASCREAM_SND = c_state('ASCREAM_SND');
  S_ASLASH_SND = c_state('ASLASH_SND');
  S_GRENADE_TOP = c_state('GRENADE_TOP');
  S_FIREBOMB_TOP = c_state('FIREBOMB_TOP');
  S_ANT_ROOF = c_state('ANT_ROOF');
  S_MGUN_TOP = c_state('MGUN_TOP');
  S_DFRIS_TOP = c_state('DFRIS_TOP');
  S_ROCKET_TOP = c_state('ROCKET_TOP');
  S_BFG_TOP = c_state('BFG_TOP');
  S_CLOUD = c_state('CLOUD');
  S_HIDDEN_ANT = c_state('HIDDEN_ANT');
  S_health_image = c_state('health_image');
  S_fly_image = c_state('fly_image');
  S_sneaky_image = c_state('sneaky_image');
  S_fast_image = c_state('fast_image');
  S_EXPLODE5 = c_state('EXPLODE5');
  S_EXPLODE3 = c_state('EXPLODE3');
  S_ROCKET = c_state('ROCKET');
  S_TRACK_GUN = c_state('TRACK_GUN');
  S_SPRAY_GUN = c_state('SPRAY_GUN');
  S_LPING_SND = c_state('LPING_SND');
  S_FLY_SND = c_state('FLY_SND');
  S_SPEED_SND = c_state('SPEED_SND');
  S_LOW_HEALTH_SND = c_state('LOW_HEALTH_SND');
  S_SCARE_SND = c_state('SCARE_SND');
  S_BUTTON_PRESS_SND = c_state('BUTTON_PRESS_SND');
  S_LINK_SND = c_state('LINK_OBJECT_SND');
  S_DELETE_SND = c_state('DEL_OBJECT_SND');

  let b: LObj = find_or_create('bad_guy_list');
  if (b && DEFINEDP(symbol_value(b))) {
    b = symbol_value(b);
    // extern int total_objects (chars.cpp): the number of characters defined so far
    const total_objects = figures.length;
    // malloc + memset(0)
    bad_guy_array = new Uint8Array(total_objects);
    while (b) {
      const x = lnumber_value(CAR(b));
      if (x >= 0 && x < total_objects) bad_guy_array[x] = 1;
      else lbreak(`objetc number out of range ${x}\n`);
      b = lcdr(b);
    }
  }

  const v = find_or_create('last_save_game').value;
  if (DEFINEDP(v)) CMP.last_save_game_number = lnumber_value(v);
  else CMP.last_save_game_number = 0;
}

export function compiled_uninit(): void {
  if (bad_guy_array) bad_guy_array = null;
}
