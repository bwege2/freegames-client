// cop.cpp, cop.h: the main player's functions, translated from Lisp to C++ in the original because they
// are called every tick (the player's mover, the gun on top of it, the weapons' user functions, ladders,
// drawing with the special powers), and the net game's score screens
import { CAR, CDR, eval_function, find_or_create, item_type, lbreak, lisp_atan2, lisp_cos, lisp_eval, lisp_sin,
  lnumber_value, new_number, new_pointer, print, push_onto_list, symbol_value, true_symbol, L_1D_ARRAY, type LArray,
  type LObj } from './lisp/lisp.ts';
import { bad_guy_array, S_BFG_TOP, S_bright_tint, S_climb_off, S_climb_on, S_climbing, S_CLOUD, S_DFRIS_TOP,
  S_EXPLODE3, S_EXPLODE5, S_fast_end_run_jump, S_fast_image, S_fast_run_jump, S_fast_run_jump_fall, S_fast_running,
  S_fast_start_run_jump, S_fast_stopped, S_FIREBOMB_TOP, S_fly_end_run_jump, S_fly_image, S_fly_run_jump,
  S_fly_run_jump_fall, S_fly_running, S_FLY_SND, S_fly_start_run_jump, S_fly_stopped, S_GRENADE_TOP, S_health_image,
  S_LOW_HEALTH_SND, S_MGUN_TOP, S_ROCKET, S_ROCKET_TOP, S_sneaky_image, S_SPEED_SND } from './compiled.ts';
import { create, type game_object } from './objects.ts';
import { CFLAG_HURTABLE, CFLAG_UNACTIVE_SHIELD, dead, end_run_jump, figures, get_ability, jump_yvel, OFUN_USER_FUN,
  run_jump, run_jump_fall, running, start_run_jump, stopped, W } from './chars.ts';
import type { view } from './view.ts';
import { G } from './globals.ts';
import { L } from './lglobals.ts';
import { jrand, jrandom, R } from './imlib/jrand.ts';
import { JK_ENTER, JK_SPACE } from './imlib/keys.ts';
import { cache } from './cache.ts';
import { SPEC_IMAGE } from './imlib/specs.ts';
import { palette_load } from './sdlport/video.ts';
import { Timer } from './rt/platform.ts';
import { defer } from './rt/deferred.ts';
import { symbol_str } from './clisp.ts';
import { fade_out } from './game.ts';

// the top's vars
const point_angle = 0, fire_delay1 = 1;

const SHOTGUN = 10, GRENADE = 2, ROCKET = 3, PLASMA = 4, FIREBOMB = 5, DFRIS = 6, LSABER = 7;

/** x & y offset from character to end of gun (signed char[24*2]) */
export const small_fire_off = Int8Array.from([
  17, 20, // 1
  17, 23, // 2
  17, 28,
  15, 33,
  11, 39, // 5
  7, 43,
  -3, 44, // 7
  -10, 42,
  -16, 39,
  -20, 34,
  -20, 28,
  -20, 25,
  -19, 20,
  -19, 16,
  -16, 14,
  -14, 11,
  -11, 9,
  -7, 8,
  -3, 8,
  2, 8,
  6, 9,
  10, 10,
  14, 13,
  16, 15]);

export const large_fire_off = Int8Array.from([
  18, 25,
  17, 30,
  15, 34,
  14, 36,
  10, 39,
  7, 41,
  4, 42,
  -3, 41,
  -8, 39,
  -11, 37,
  -14, 33,
  -16, 30,
  -18, 25,
  -17, 21,
  -14, 17,
  -11, 15,
  -7, 13,
  -4, 12,
  3, 12,
  9, 12,
  12, 15,
  14, 16,
  15, 18,
  16, 21]);

// the player's (bottom's) vars
const in_climbing_area = 0, /* disable_top_draw = 1, just_hit = 2, ship_pan_x = 3, */ special_power = 4,
  used_special_power = 5, last1_x = 6, last1_y = 7, last2_x = 8, /* last2_y = 9, has_saved_this_level = 10, */
  r_ramp = 11, g_ramp = 12, b_ramp = 13, is_teleporting = 14, just_fired = 15;

// the shotgun bullet's vars
const sgb_speed = 0, sgb_angle = 1, sgb_lastx = 2, sgb_lasty = 3, /* sgb_bright_color = 4, sgb_medium_color = 5, */
  sgb_lifetime = 6;

const NO_POWER = 0, FAST_POWER = 1, FLY_POWER = 2, SNEAKY_POWER = 3, HEALTH_POWER = 4;

// the top's vars again (top_point_angle = 0, top_fire_delay1 = 1)
const top_just_fired = 2;

const iabs = (x: number): number => Math.abs(x | 0) | 0;

/** clisp.cpp's l_FIRE and l_fire_object (LSymbol::FindOrCreate("FIRE") / ("fire_object") in clisp_init);
 *  lglobals.ts has no field for them, and a symbol is the same object every time it is looked up */
const l_FIRE = (): LObj => find_or_create('FIRE');
const l_fire_object = (): LObj => find_or_create('fire_object');

/** ((LArray *)((LSymbol *)sym)->GetValue())->Get(x), with the original's TYPE_CHECKING */
function larray_get(sym: LObj, x: number): LObj {
  const a = symbol_value(sym);
  if (item_type(a) !== L_1D_ARRAY) {
    print(a);
    lbreak('is not an array\n');
  }
  const arr = a as LArray;
  if (x >= arr.len || x < 0) lbreak(`array reference out of bounds (${x})\n`);
  return arr.data[x];
}

function angle_diff(a1: number, a2: number): number {
  if (a1 < a2) {
    if ((a2 - a1) < 180) return a2 - a1;
    else return 360 - a2 + a1;
  } else {
    if ((a1 - a2) < 180) return a1 - a2;
    else return 360 - a1 + a2;
  }
}

export function top_ai(): LObj {
  const o = L.current_object;
  if (o.total_objects()) { // make sure we are linked to the main character
    const q = o.get_object(0);

    const v = q.controller();
    if (v) {
      if (!v.freeze_time) {
        o.direction = 1; // always face right

        if (q.direction < 0) q.x += 4;
        let i: number;
        const fire_off = o.otype === S_DFRIS_TOP ? large_fire_off :
          (o.otype === S_ROCKET_TOP ? large_fire_off :
            (o.otype === S_BFG_TOP ? large_fire_off : small_fire_off));
        // f and fb are indexes into fire_off (fb = -1 for NULL)
        let f = 0, fb = -1;
        let best_diff = 200, best_num = 0;
        const iy = fire_off[f + 1], ix = fire_off[f + 6 * 2];

        const best_angle = lisp_atan2((q.y - iy - v.pointer_y) | 0, (v.pointer_x - q.x - ix) | 0);
        for (i = 0; i < 24; i++, f += 2) { // check all the angles to see which would best fit animation wise
          const this_angle = lisp_atan2(fire_off[f + 1] - iy, fire_off[f] - ix);
          const this_diff = angle_diff(this_angle, best_angle);
          if (this_diff < best_diff) {
            best_diff = this_diff;
            best_num = i;
            fb = f;
          }
        }

        // if the pointer is too close to the player go with the angle shown, not the angle through the pointer
        const fb0 = fire_off[fb], fb1 = fire_off[fb + 1];
        if (iabs(q.y - fb1 - v.pointer_y) < 45 && iabs(v.pointer_x - q.x + fb0) < 40)
          o.lvars![point_angle] = lisp_atan2(fb1 - iy, fb0 - ix);
        else
          o.lvars![point_angle] = lisp_atan2((q.y - fb1 - v.pointer_y) | 0, (v.pointer_x - (q.x + fb0)) | 0);

        if (q.direction < 0) q.x -= 4;

        o.x = q.x;
        o.y = q.y + 29 - q.picture().h;

        // rand_on is an unsigned short
        R.rand_on = (R.rand_on + o.lvars![point_angle]) & 0xffff;
        o.current_frame = best_num;

        if (o.lvars![fire_delay1]) o.lvars![fire_delay1]--;

        o.otype = W.weapon_types[v.current_weapon]; // switch to correct top part
      }
    }
  }
  return true_symbol;
}

function player_fire_weapon(o: game_object, type: number, target: game_object | null, angle: number,
  fire_off: Int8Array): number {
  if (!o.total_objects()) return 0;
  const other = o.get_object(0);
  const ox = other.x, oy = other.y;
  if (other.direction < 0) other.x += 4;

  const firex = (other.x + fire_off[o.current_frame * 2]) | 0;
  const firey = (other.y - fire_off[o.current_frame * 2 + 1]) | 0;

  // fire try to move up to gun level

  let x2 = o.x, y2 = firey;
  //  current_level->foreground_intersect(other->x,other->y,x2,y2);      // find first location we can actuall "see"
  //  current_level->all_boundary_setback(o,other->x,other->y,x2,y2);       // to make we don't fire through walls
  other.y = y2;

  if (other.y === firey) { // now try to move out to end of gun if we were not blocked above
    x2 = firex;
    [x2, y2] = G.current_level.foreground_intersect(other.x, other.y, x2, y2); // find first location we can actuall "see"
    [, x2, y2] = G.current_level.all_boundary_setback(other, other.x, other.y, x2, y2); // to make we don't fire through walls
    o.x = x2;
  }

  const list = { v: null as LObj };
  push_onto_list(new_pointer(target), list);
  push_onto_list(new_number(angle), list);
  push_onto_list(new_number(y2), list);
  push_onto_list(new_number(x2), list);
  push_onto_list(new_number(type), list);
  push_onto_list(new_pointer(o.get_object(0)), list);
  eval_function(l_fire_object(), list.v);
  o.lvars![top_just_fired] = 1;
  other.lvars![just_fired] = 1;
  other.x = ox;
  other.y = oy;

  return 1;
}

export function laser_ufun(args: LObj): LObj {
  const o = L.current_object;
  const signal = CAR(args); args = CDR(args);
  let ret: LObj = null;

  if (signal === l_FIRE()) {
    if (!o.lvars![fire_delay1]) { // make sur we are not waiting of previous fire
      const value = lnumber_value(lisp_eval(CAR(args)));
      if (value) { // do we have ammo ?
        o.lvars![fire_delay1] = 3;
        if (player_fire_weapon(o, SHOTGUN, null, o.lvars![point_angle], small_fire_off)) ret = new_number(-1);
        else ret = new_number(0);
      } else {
        o.lvars![fire_delay1] = 5; // no ammo, set large fire delay for next shot
        player_fire_weapon(o, SHOTGUN, null, o.lvars![point_angle], small_fire_off);
        ret = new_number(0);
      }
    } else ret = new_number(0); // can't fire yet, return 0 ammo subtract
  }
  return ret;
}

function ammo_type(otype: number): number {
  if (otype === S_GRENADE_TOP) return GRENADE;
  else if (otype === S_FIREBOMB_TOP) return FIREBOMB;
  else if (otype === S_DFRIS_TOP) return DFRIS;
  else return SHOTGUN;
}

/** generic top character ai GRENADE && FIREBOMB */
export function top_ufun(args: LObj): LObj {
  const o = L.current_object;
  const signal = CAR(args); args = CDR(args);
  let ret: LObj = null;

  if (signal === l_FIRE()) {
    if (!o.lvars![fire_delay1]) { // make sur we are not waiting of previous fire
      const value = lnumber_value(lisp_eval(CAR(args)));
      if (value) { // do we have ammo ?
        o.lvars![fire_delay1] = 6;
        // the original compares otype with DFRIS (6, the ammo type), not S_DFRIS_TOP: kept
        if (player_fire_weapon(o, ammo_type(o.otype), null, o.lvars![point_angle],
          o.otype === DFRIS ? large_fire_off : small_fire_off)) ret = new_number(-1);
        else ret = new_number(0);
      } else ret = new_number(0);
    } else ret = new_number(0); // can't fire yet, return 0 ammo subtract
  }
  return ret;
}

export function plaser_ufun(args: LObj): LObj {
  const o = L.current_object;
  const signal = CAR(args); args = CDR(args);
  let ret: LObj = null;

  if (signal === l_FIRE()) {
    if (!o.lvars![fire_delay1]) { // make sur we are not waiting of previous fire
      const value = lnumber_value(lisp_eval(CAR(args)));
      if (value) { // do we have ammo ?
        o.lvars![fire_delay1] = 2;
        if (player_fire_weapon(o, PLASMA, null, o.lvars![point_angle], small_fire_off)) ret = new_number(-1);
        else ret = new_number(0);
      } else ret = new_number(0);
    } else ret = new_number(0); // can't fire yet, return 0 ammo subtract
  }
  return ret;
}

export function lsaber_ufun(args: LObj): LObj {
  const o = L.current_object;
  const signal = CAR(args); args = CDR(args);
  let ret: LObj = null;

  if (signal === l_FIRE()) {
    if (!o.lvars![fire_delay1]) { // make sur we are not waiting of previous fire
      const value = lnumber_value(lisp_eval(CAR(args)));
      if (value) { // do we have ammo ?
        o.lvars![fire_delay1] = 1;
        // int32 + (uint32 & 7) - 8 is computed unsigned and passed as an int: the same bits as signed
        if (player_fire_weapon(o, LSABER, null,
          (o.lvars![point_angle] + (G.current_level.tick_counter() & 7) - 8) | 0, small_fire_off)) ret = new_number(-1);
        else ret = new_number(0);
      } else ret = new_number(0);
    } else ret = new_number(0); // can't fire yet, return 0 ammo subtract
  }
  return ret;
}

export function player_rocket_ufun(args: LObj): LObj {
  const o = L.current_object;
  const signal = CAR(args); args = CDR(args);
  let ret: LObj = null;
  let xd: number, yd: number, cl = 0xfffffff, d: number;
  if (signal === l_FIRE()) {
    if (!o.lvars![fire_delay1]) { // make sur we are not waiting of previous fire
      const value = lnumber_value(lisp_eval(CAR(args)));
      if (value) { // do we have ammo ?
        o.lvars![fire_delay1] = 6;
        let target: game_object | null = null, p: game_object | null;
        const bot = o.total_objects() ? o.get_object(0) : null;
        if (bad_guy_array) {
          const other = L.current_object.total_objects() ? L.current_object.get_object(0) : null;
          for (p = G.current_level.first_active_object(); p; p = p.next_active) {
            xd = iabs(p.x - o.x);
            yd = iabs(p.y - o.y);
            // bad_guy_array has total_objects entries when compiled_init ran; an otype defined later
            // reads past it in the original (undefined, heap memory); here it reads as 0
            if (xd < 160 && yd < 130 && bad_guy_array[p.otype] && p !== other) {
              if (p.targetable() &&
                !(p.otype === S_ROCKET && p.total_objects() && p.get_object(0) === bot)) { // don't track onto own missles
                d = (xd * xd + yd * yd) | 0;
                if (d < cl) {
                  cl = d;
                  target = p;
                }
              }
            }
          }
        }
        if (player_fire_weapon(o, ROCKET, target, o.lvars![point_angle], large_fire_off)) ret = new_number(-1);
        else ret = new_number(0);
      } else ret = new_number(0);
    } else ret = new_number(0); // can't fire yet, return 0 ammo subtract
  }
  return ret;
}

function player_move(o: game_object, xm: number, ym: number, but: number): number {
  if (!o.lvars![in_climbing_area]) {
    if (o.state === S_climbing) {
      o.set_gravity(1);
      o.set_state(run_jump_fall);
    }
    o.next_picture();
    return o.mover(xm, ym, but);
  } else return climb_handler(o, xm, ym, but);
}

function undo_special_power(o: game_object): void {
  switch (o.lvars![special_power]) {
    case SNEAKY_POWER: {
      if (o.lvars![used_special_power] > 0) o.lvars![used_special_power]--;
    } break;
    case FAST_POWER: {
      o.lvars![used_special_power] = 0;
    } break;
  }
}

function do_special_power(o: game_object, xm: number, ym: number, but: number, _top: game_object): void {
  switch (o.lvars![special_power]) {
    case FLY_POWER: {
      // the only call in the arguments with a side effect is jrand()
      const cloud = create(S_CLOUD, (o.x + o.direction * -10) | 0, (o.y + jrand() % 5) | 0);
      if (G.current_level) G.current_level.add_object(cloud);
      o.set_state(run_jump);
      o.set_gravity(1);
      o.set_yacel(0);
      if (o.yvel() > 0) o.set_yvel((o.yvel() / 2) | 0);
      if (ym < 0) o.set_yvel(o.yvel() - 3);
      else o.set_yvel(o.yvel() - 2);
      G.the_game.play_sound(S_FLY_SND, 32, o.x, o.y);
    } break;
    case FAST_POWER: {
      if ((G.current_level.tick_counter() % 16) === 0) G.the_game.play_sound(S_SPEED_SND, 100, o.x, o.y);

      o.lvars![used_special_power] = 1;
      o.lvars![last1_x] = o.x;
      o.lvars![last1_y] = o.y;
      const oyvel = o.yvel();
      const inn = o.lvars![in_climbing_area];

      player_move(o, xm, ym, but);
      if (ym < 0 && !oyvel && o.yvel() < 0) // if they just jumped, make them go higher
        o.set_yvel(o.yvel() + ((o.yvel() / 3) | 0));
      o.lvars![in_climbing_area] = inn;

      o.lvars![last2_x] = o.x;
      o.lvars![last2_x] = o.y; // sic: the original stores y into last2_x too (last2_y stays)
    } break;
    case SNEAKY_POWER: {
      if (o.lvars![used_special_power] < 15) o.lvars![used_special_power]++;
    } break;
  }
}

function climb_off_handler(o: game_object): number {
  // controller() is not NULL for the player; the original would crash if it were
  if (o.next_picture()) o.controller()!.pan_y = (o.controller()!.pan_y - 4) | 0;
  else {
    o.y -= 28;
    o.controller()!.pan_y = (o.controller()!.pan_y + 28) | 0;
    o.controller()!.last_y = (o.controller()!.last_y - 28) | 0;
    o.set_state(stopped);
  }
  return 0;
}

function climb_on_handler(o: game_object): number {
  if (o.next_picture()) o.controller()!.pan_y = (o.controller()!.pan_y + 4) | 0;
  else o.set_state(S_climbing);
  return 0;
}

function climb_handler(o: game_object, xm: number, ym: number, but: number): number {
  const yd = o.lvars![in_climbing_area]; // see how from the top we are
  o.lvars![in_climbing_area] = 0; // set 0, ladders will set back to proper if still in area
  if (o.state === S_climb_off) climb_off_handler(o);
  else if (o.state === S_climb_on) climb_on_handler(o);
  else {
    if (o.state === S_climbing) {
      if (ym > 0) { // going down
        if (o.current_frame === 0) o.current_frame = 9;
        o.current_frame--;

        /*    if (o->lvars[special_power]==FAST_POWER) { ... }  else */
        o.y += 3;
      } else if (ym < 0) {
        if (yd < 32) o.set_state(S_climb_off);
        else {
          if (!o.next_picture()) o.set_state(S_climbing);
          o.y -= 3;
        }
      }
      if (xm) { // trying to get off the ladder, check to see if that's ok
        let x2 = 0, y2 = -20;
        [, x2, y2] = o.try_move(o.x, o.y, x2, y2, 3);
        if (y2 === -20) {
          o.set_gravity(1);
          if (ym >= 0) o.set_state(run_jump_fall);
          else {
            o.set_state(run_jump);
            o.set_yvel(get_ability(o.otype, jump_yvel));
          }
        }
      }
    } else if (ym > 0 && yd < 10) {
      o.y += 28;
      o.controller()!.pan_y = (o.controller()!.pan_y - 28) | 0;
      o.controller()!.last_y = (o.controller()!.last_y + 28) | 0;
      o.set_state(S_climb_on);
    } else if (o.yvel() >= 0 && (ym > 0 || (ym < 0 && yd > 8))) {
      o.set_state(S_climbing);
      o.set_gravity(0);
      o.set_xvel(0);
      o.set_yvel(0);
      o.set_xacel(0);
      o.set_yacel(0);
      return 0;
    } else {
      o.next_picture();
      return o.mover(xm, ym, but);
    }
  }
  return 0;
}

export function cop_mover(xm: number, ym: number, but: number): LObj {
  let ret = 0;
  const o = L.current_object;
  let top: game_object;
  if (o.controller() && o.controller()!.freeze_time) {
    o.controller()!.freeze_time = (o.controller()!.freeze_time - 1) | 0;
    if (but || o.controller()!.key_down(JK_SPACE) || o.controller()!.key_down(JK_ENTER))
      o.controller()!.freeze_time = 0;
  } else {
    if (!o.total_objects()) { // if no top create one
      top = create(S_MGUN_TOP, o.x, o.y, 0, 0);
      G.current_level.add_object_after(top, o);
      o.add_object(top);
      top.add_object(o);
    } else top = o.get_object(0);

    if (o.yvel() > 10) {
      o.set_yacel(0);
      o.set_yvel(o.yvel() - 1); // terminal velocity
    }

    if (o.aistate() === 0) { // just started, wait for button
      o.set_aistate(1);
    } else if (o.aistate() === 1) { // normal play
      if (o.hp() === 0) {
        o.set_aistate(2); // go to deing state
        o.set_state(dead);
      } else {
        if (o.hp() < 40 && (G.current_level.tick_counter() % 16) === 0) // if low on health play heart beat
          G.the_game.play_sound(S_LOW_HEALTH_SND, 127, o.x, o.y);
        else if (o.hp() < 15 && (G.current_level.tick_counter() % 8) === 0) // if low on health play heart beat
          G.the_game.play_sound(S_LOW_HEALTH_SND, 127, o.x, o.y);
        else if (o.hp() < 7 && (G.current_level.tick_counter() % 4) === 0) // if low on health play heart beat
          G.the_game.play_sound(S_LOW_HEALTH_SND, 127, o.x, o.y);

        if (but & 1) do_special_power(o, xm, ym, but, top);
        else undo_special_power(o);
        ret = player_move(o, xm, ym, but);
        top.x = o.x;
        top.y = o.y + 29 - top.picture().h;

        if ((but & 2) && !o.lvars![is_teleporting] && o.state !== S_climbing && o.state !== S_climb_off) {
          const args = { v: null as LObj };
          const v = o.controller()!;

          push_onto_list(new_number(v.weapon_total(v.current_weapon)), args);
          push_onto_list(l_FIRE(), args);

          L.current_object = top;
          const fret = eval_function(figures[top.otype].get_fun(OFUN_USER_FUN), args.v);
          L.current_object = o;
          v.add_ammo(v.current_weapon, lnumber_value(fret));
        }
      }
    } else if (o.aistate() === 3) {
      if (!o.controller() || o.controller()!.key_down(JK_SPACE)) {
        // call the user function to reset the player
        eval_function(L.l_restart_player, null);
        // with no controller the original dereferences NULL here (a crash); the player always has one
        o.controller()!.reset_player();
        o.set_aistate(0);
      } else if (o.controller() && o.controller()!.local_player())
        G.the_game.show_help(symbol_str('space_cont'));
    } else o.set_aistate(o.aistate() + 1);
  }

  return new_number(ret);
}

export function ladder_ai(): LObj {
  let f = L.player_list;
  const o = L.current_object;
  if (o.total_objects()) {
    const other = o.get_object(0);
    for (; f; f = f.next) {
      const mex = f.focus!.x;
      const mey = f.focus!.y;

      if (o.x <= mex && o.y <= mey && other.x >= mex && other.y >= mey) {
        if (f.focus!.state === S_climbing) f.focus!.x = ((o.x + other.x) | 0) / 2;
        f.focus!.lvars![in_climbing_area] = mey - o.y;
      }
    }
  }
  return true_symbol;
}

export function player_draw(just_fired_var: number, num: number): LObj {
  const o = L.current_object;
  if (num === 0) {
    if (o.lvars![just_fired_var]) {
      o.draw_tint(S_bright_tint);
      o.lvars![just_fired_var] = 0;
    } else o.drawer();
  } else {
    if (o.lvars![just_fired_var]) {
      o.draw_double_tint(lnumber_value(larray_get(L.l_player_tints, num)), S_bright_tint);
      o.lvars![just_fired_var] = 0;
    } else o.draw_tint(lnumber_value(larray_get(L.l_player_tints, num)));
  }
  return null;
}

export function top_draw(): LObj {
  const o = L.current_object;
  if (o.total_objects()) {
    const bot = o.get_object(0);
    if (bot.state === stopped || bot.state === running ||
      bot.state === run_jump || bot.state === run_jump_fall ||
      bot.state === end_run_jump) {
      const oldy = o.y;
      o.x = bot.x;
      if (bot.direction < 0) o.x += 4;
      o.y = bot.y + 29 - bot.picture().h;

      const ret = { v: null as LObj };

      push_onto_list(new_number(bot.get_tint()), ret);

      if (bot.lvars![special_power] === SNEAKY_POWER) {
        if (bot.lvars![used_special_power] === 0) player_draw(top_just_fired, bot.get_tint());
        else if (bot.lvars![used_special_power] < 15) o.draw_trans(bot.lvars![used_special_power], 16);
        else o.draw_predator();
      } else eval_function(L.l_player_draw, ret.v);

      o.y = oldy;
      if (bot.direction < 0) o.x -= 4;
    }
  }
  return null;
}

export function bottom_draw(): LObj {
  const o = L.current_object;
  const lv = (): Int32Array => o.lvars!;

  if (lv()[r_ramp] || lv()[g_ramp] || lv()[b_ramp]) {
    let r = lv()[r_ramp];
    if (r > 7) r -= 7;
    else r = 0;
    lv()[r_ramp] = r;

    let g = lv()[g_ramp];
    if (g > 7) g -= 7;
    else g = 0;
    lv()[g_ramp] = g;

    let b = lv()[b_ramp];
    if (b > 7) b -= 7;
    else b = 0;
    lv()[b_ramp] = b;

    const p = G.pal.copy();
    const addr = p.addr();
    let a = 0;
    let ra: number, ga: number, ba: number;

    for (let i = 0; i < 256; i++) {
      // the original resets r, g, b (not ra, ga, ba) when the sum is negative; r, g, b are never
      // negative here, so that branch is never taken
      ra = addr[a] + r; if (ra > 255) ra = 255; else if (ra < 0) r = 0; addr[a] = ra & 0xff; a++;
      ga = addr[a] + g; if (ga > 255) ga = 255; else if (ga < 0) g = 0; addr[a] = ga & 0xff; a++;
      ba = addr[a] + b; if (ba > 255) ba = 255; else if (ba < 0) b = 0; addr[a] = ba & 0xff; a++;
    }
    palette_load(p);
  }

  if (o.aistate() > 0) {
    switch (lv()[special_power]) {
      case NO_POWER: { player_draw(just_fired, o.get_tint()); } break;

      case HEALTH_POWER: {
        player_draw(just_fired, o.get_tint());
        if (o.controller() && o.controller()!.local_player())
          cache.img(S_health_image).put_image(G.screen, o.controller()!.cx2 - 20, o.controller()!.cy1 + 5, 1);
      } break;
      case FAST_POWER: {
        eval_function(L.l_draw_fast, null);
        const old_state = o.state;
        switch (o.state) {
          case stopped: o.state = S_fast_stopped; break;
          case running: o.state = S_fast_running; break;
          case start_run_jump: o.state = S_fast_start_run_jump; break;
          case run_jump: o.state = S_fast_run_jump; break;
          case run_jump_fall: o.state = S_fast_run_jump_fall; break;
          case end_run_jump: o.state = S_fast_end_run_jump; break;
          default: break;
        }

        player_draw(just_fired, o.get_tint());
        o.state = old_state;
        if (o.controller() && o.controller()!.local_player())
          cache.img(S_fast_image).put_image(G.screen, o.controller()!.cx2 - 20, o.controller()!.cy1 + 5, 1);
      } break;
      case FLY_POWER: {
        const old_state = o.state;
        switch (o.state) {
          case stopped: o.state = S_fly_stopped; break;
          case running: o.state = S_fly_running; break;
          case start_run_jump: o.state = S_fly_start_run_jump; break;
          case run_jump: o.state = S_fly_run_jump; break;
          case run_jump_fall: o.state = S_fly_run_jump_fall; break;
          case end_run_jump: o.state = S_fly_end_run_jump; break;
          default: break;
        }

        player_draw(just_fired, o.get_tint());
        o.state = old_state;

        if (o.controller() && o.controller()!.local_player())
          cache.img(S_fly_image).put_image(G.screen, o.controller()!.cx2 - 20, o.controller()!.cy1 + 5, 1);
      } break;
      case SNEAKY_POWER: {
        if (lv()[used_special_power] === 0) player_draw(just_fired, o.get_tint());
        else if (lv()[used_special_power] < 15) o.draw_trans(lv()[used_special_power], 16);
        else o.draw_predator();

        if (o.controller() && o.controller()!.local_player())
          cache.img(S_sneaky_image).put_image(G.screen, o.controller()!.cx2 - 20, o.controller()!.cy1 + 5, 1);
      } break;
    }
  }
  return null;
}

export function sgun_ai(): LObj {
  const o = L.current_object;

  if (o.lvars![sgb_lifetime] === 0) return null;
  o.lvars![sgb_lifetime]--;

  o.lvars![sgb_lastx] = o.x;
  o.lvars![sgb_lasty] = o.y;
  o.lvars![sgb_speed] = (Math.imul(o.lvars![sgb_speed], 6) / 5) | 0;

  const ang = o.lvars![sgb_angle];
  const mag = o.lvars![sgb_speed];

  const xvel = Math.imul(lisp_cos(ang), mag);
  L.current_object.set_xvel(xvel >> 16);
  L.current_object.set_fxvel((xvel & 0xffff) >> 8);
  const yvel = Math.imul(-lisp_sin(ang) | 0, mag);
  L.current_object.set_yvel(yvel >> 16);
  L.current_object.set_fyvel((yvel & 0xffff) >> 8);

  const [who, whit] = o.bmove(o.total_objects() ? o.get_object(0) : null);

  if (whit || (who && figures[who.otype].get_cflag(CFLAG_UNACTIVE_SHIELD) && who.total_objects() &&
    who.get_object(0).aistate() === 0)) {
    o.lvars![sgb_lifetime] = 0;
    // clang evaluates the arguments left to right: the x draw comes first
    const n = create(S_EXPLODE5, (o.x + jrand() % 4) | 0, (o.y + jrand() % 4) | 0);
    G.current_level.add_object(n);
  } else if (who && figures[who.otype].get_cflag(CFLAG_HURTABLE)) {
    o.lvars![sgb_lifetime] = 0;
    const n = create(S_EXPLODE3, (o.x + jrand() % 4) | 0, (o.y + jrand() % 4) | 0);
    G.current_level.add_object(n);
    who.do_damage(5, o, o.x, o.y, Math.imul(lisp_cos(ang), 10) >> 16, Math.imul(lisp_sin(ang), 10) >> 16);
  }
  return true_symbol;
}

export function mover_ai(): LObj {
  const o = L.current_object;
  if (o.total_objects() === 2) {
    if (o.aistate() < 2) {
      const obj = o.get_object(1);
      o.remove_object(obj);
      const d = o.get_object(0);
      d.add_object(obj);
      d.set_aistate(d.aitype());
    } else {
      o.set_aistate(o.aistate() - 1);
      const d = o.get_object(0);
      const obj = o.get_object(1);

      // aitype 0 divides by zero (SIGFPE) in the original; the data never gives a mover aitype 0
      obj.x = d.x - ((Math.imul((d.x - o.x) | 0, o.aistate()) / o.aitype()) | 0);
      obj.y = d.y - ((Math.imul((d.y - o.y) | 0, o.aistate()) / o.aitype()) | 0);
    }
  }
  return true_symbol;
}

export function respawn_ai(): LObj {
  const o = L.current_object;
  const x = o.total_objects();
  if (x) {
    const last = o.get_object(x - 1);
    if (last.x === o.x && last.y === o.y) {
      if (last.fade_count()) last.set_fade_count(last.fade_count() - 1);
      o.set_aistate_time(0);
    } else if (o.aistate_time() > o.xvel()) {
      const type = o.get_object(jrandom(x)).otype;
      const n = create(type, o.x, o.y);
      G.current_level.add_object(n);
      o.add_object(n);
      n.set_fade_count(15);
      o.set_aistate_time(0);
    }
  }
  return true_symbol;
}

function compare_players(a: view, b: view): number {
  if (a.kills > b.kills) return -1;
  else if (a.kills < b.kills) return 1;
  else if (a.player_number > b.player_number) return -1;
  else if (a.player_number < b.player_number) return 1;
  else return 0;
}

/** printf's %3ld */
const ld3 = (n: number): string => String(n).padStart(3, ' ');

export function score_draw(): LObj {
  const sorted_players: view[] = [];
  let local: view | null = null;
  let tp = 0;
  let f = L.player_list;
  for (; f; f = f.next) {
    sorted_players[tp] = f;
    tp++;
    if (f.local_player()) local = f;
  }

  const fnt = G.wm.font();
  if (local) {
    // qsort: compare_players orders by kills, then by player number, which no two views share, so
    // any sorting algorithm gives the same order
    sorted_players.sort(compare_players);

    const x = local.cx1;
    let y = local.cy1;
    let msg: string;

    let i: number;
    for (i = 0; i < tp; i++) {
      const color = lnumber_value(larray_get(L.l_player_text_color, sorted_players[i].get_tint()));
      msg = `${ld3(sorted_players[i].kills)} ${sorted_players[i].name}`;
      if (sorted_players[i] === local) msg += ' <<';

      fnt.put_string(G.screen, x, y, msg, color);
      y += fnt.height();
    }
  }
  return null;
}

/**
 * show_kills: the net game's score table at the end of a round (called from Lisp, the player's damage
 * function, right before (reset_kills) and the next level's load request). The original, inside the
 * Lisp call:
 *   fade_out(8)                      the game's last frame fades to black (8 x 25 ms, flushing the screen
 *                                    each step), then the screen is cleared and flushed, palette restored
 *   wm->set_mouse_position(0,0)
 *   screen->clear(); end_level_screen image at 0,0
 *   the header, a widget bar under it, one line per player (name, kills, total kills)
 *   wm->flush_screen(); Timer now; now.WaitMs(4000)
 * The port reads everything from the game here, at the original's point (the kills must be read before
 * the Lisp's (reset_kills) right after this call clears them), and queues the drawing, fading and
 * waiting on rt/deferred.ts, which the main loop runs after this tick and before it draws again.
 * Nothing between this call and that point draws on the screen or flushes it, so the fade-out starts
 * from the game's last frame as in the original and the same frames appear in the same order. The
 * mouse is moved inside the task, after the fade-out, because flush_screen draws the cursor where the
 * mouse is.
 */
export function show_kills(): LObj {
  const screen = G.screen, wm = G.wm;
  const im = cache.img(cache.reg('art/frame.spe', 'end_level_screen', SPEC_IMAGE, 1));
  const x1 = im.Size().x + 1, y1 = 0, y2 = screen.Size().y;
  const fnt = wm.font();

  let v: view | null = L.player_list;
  let tp = 0, i: number;
  for (v = L.player_list; v; v = v.next) tp++;

  let y = ((((y1 + y2) / 2) | 0) - ((Math.imul(tp + 2, fnt.height()) / 2) | 0)) | 0;
  const x = x1 + 10;
  const header_str = symbol_str('score_header');
  const header_y = y;
  y += fnt.height();

  const bar = [x, y + 2, x + Math.imul(header_str.length, fnt.width()), y + fnt.height() - 3];
  y += fnt.height();
  v = L.player_list;
  const lines: { y: number; msg: string; color: number }[] = [];
  for (i = 0; i < tp; i++) {
    const NAME_LEN = 18;
    const color = lnumber_value(larray_get(L.l_player_text_color, v!.get_tint()));
    // strncpy(max_name, name, NAME_LEN-1); max_name[NAME_LEN-1] = 0
    const max_name = v!.name.slice(0, NAME_LEN - 1);

    const msg = `${max_name.padEnd(17, ' ')} ${ld3(v!.kills)}  ${ld3((v!.tkills + v!.kills) | 0)}`;
    lines.push({ y, msg, color });

    y += fnt.height();
    v = v!.next;
  }

  defer(async () => {
    await fade_out(8);
    wm.set_mouse_position(0, 0);
    screen.clear();
    im.put_image(screen, 0, 0);
    fnt.put_string(screen, x, header_y, header_str, wm.bright_color());
    screen.widget_bar(bar[0], bar[1], bar[2], bar[3], wm.bright_color(), wm.medium_color(), wm.dark_color());
    for (const l of lines) fnt.put_string(screen, x, l.y, l.msg, l.color);

    wm.flush_screen();
    const now = new Timer();
    await now.WaitMs(4000); // wait 4 seconds
  });

  return null;
}
