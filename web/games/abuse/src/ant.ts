// ant.cpp, ant.h: the ant's AI (translated from Lisp to C++ in the original because it runs every tick),
// and show_stats, the "level complete" screen
import { eval_user_function, find_or_create, lisp_atan2, new_number, new_pointer, push_onto_list, symbol_value,
  true_symbol, type LObj } from './lisp/lisp.ts';
import { S_ALAND_SND, S_ANT_ROOF, S_ASCREAM_SND, S_ASLASH_SND, S_ceil_fire, S_fall_start, S_falling, S_fire_wait,
  S_hanging, S_HIDDEN_ANT, S_jump_up, S_landing, S_pounce_wait, S_SCARE_SND, S_top_walk, S_weapon_fire } from './compiled.ts';
import { BLOCKED_DOWN, type game_object } from './objects.ts';
import { dead, flinch_down, flinch_up, get_ability, run_jump, run_top_speed, running, stopped } from './chars.ts';
import { G } from './globals.ts';
import { L } from './lglobals.ts';
import { jrand } from './imlib/jrand.ts';
import { cache } from './cache.ts';
import { SPEC_IMAGE } from './imlib/specs.ts';
import { Timer } from './rt/platform.ts';
import { defer } from './rt/deferred.ts';
import { symbol_str } from './clisp.ts';
import { fade_in, fade_out } from './game.ts';

// enum { ANT_START, ANT_HANGING=15, ... } (ant.h)
export const ANT_START = 0, ANT_HANGING = 15, ANT_HIDING = 16, ANT_FALL_DOWN = 1, ANT_LANDING = 9, ANT_RUNNING = 2,
  ANT_POUNCE_WAIT = 4, ANT_JUMP = 6, ANT_FIRE = 8, ANT_JUMP_ROOF = 12, ANT_ROOF_WALK = 13, ANT_CEIL_SHOOT = 14;

// ant vars
const ANT_need_to_dodge = 0, ANT_no_see_time = 1, ANT_hide_flag = 2;

const iabs = (x: number): number => Math.abs(x | 0) | 0;

export function can_see(o: game_object, x1: number, y1: number, x2: number, y2: number): number {
  const nx2 = x2, ny2 = y2;
  [x2, y2] = G.current_level.foreground_intersect(x1, y1, x2, y2);
  if (x2 !== nx2 || y2 !== ny2) return 0;

  [, x2, y2] = G.current_level.boundary_setback(o, x1, y1, x2, y2);
  return x2 === nx2 && y2 === ny2 ? 1 : 0;
}

/** the closest player (in a net game) or the only one: the code every case of ant_ai repeats */
function target_player(): game_object {
  if (L.player_list!.next) return G.current_level.attacker(L.current_object);
  return L.player_list!.focus!;
}

// if we first saw the player or it's been a while since we've seen the player then do a scream
function scream_check(o: game_object, b: game_object): void {
  const lv = o.lvars!;
  if (can_see(o, o.x, o.y, b.x, b.y)) {
    if (lv[ANT_no_see_time] === 0 || lv[ANT_no_see_time] > 20)
      G.the_game.play_sound(S_ASCREAM_SND, 127, o.x, o.y);
    lv[ANT_no_see_time] = 1;
  } else lv[ANT_no_see_time]++;
}

function ant_congestion(o: game_object): number {
  for (let d = G.current_level.first_active_object(); d; d = d.next_active) {
    // the original compares o->x with d->y (a typo); kept, and o itself is in the active list too
    if (d.otype === o.otype && iabs(o.x - d.x) < 30 && iabs(o.x - d.y) < 20) return 1;
  }
  return 0;
}

function ant_dodge(o: game_object): number {
  const lv = o.lvars!;
  if (lv[ANT_need_to_dodge] === 1) {
    lv[ANT_need_to_dodge] = 0;
    if ((jrand() % 2) === 0) {
      o.set_state(stopped);
      o.set_aistate(ANT_JUMP);
      if (!can_see(o, o.x, o.y, o.x, o.y - 120)) { // is there a roof above?
        o.set_yvel(-17);
        o.set_xvel(0);
        o.set_aistate(ANT_JUMP_ROOF);
        ant_ai();
      } else {
        o.set_yvel(-12);
        if (o.direction > 0) o.set_xvel(22);
        else o.set_xvel(-22);
        o.set_aistate(ANT_JUMP);
      }
    }
    return 1;
  } else return 0;
}

function alien_wait_time(): number {
  const v = symbol_value(L.l_difficulty);
  if (v === L.l_easy) return 6;
  else if (v === L.l_medium) return 4;
  else if (v === L.l_hard) return 2;
  else return 1;
}

function can_hit_player(o: game_object, b: game_object): number {
  return can_see(o, o.x + (o.direction > 0 ? 15 : -15), o.y - 15, b.x, b.y - 15);
}

function fire_at_player(o: game_object, b: game_object): void {
  const firex = (o.x + (o.direction > 0 ? 15 : -15)) | 0, firey = (o.y - 15) | 0,
    playerx = (b.x + Math.imul(b.xvel(), 8)) | 0, playery = (b.y - 15 + Math.imul(b.yvel(), 2)) | 0;
  if (can_see(o, o.x, o.y, firex, firey) && can_see(o, firex, firey, playerx, playery)) {
    const angle = lisp_atan2((firey - playery) | 0, (playerx - firex) | 0);
    const call_list = { v: null as LObj };
    push_onto_list(new_pointer(b), call_list);
    push_onto_list(new_number(angle), call_list);
    push_onto_list(new_number(firey), call_list);
    push_onto_list(new_number(firex), call_list);
    push_onto_list(new_number(o.aitype()), call_list);
    push_onto_list(new_pointer(o), call_list);
    // ((LSymbol *)l_fire_object)->EvalUserFunction(call_list); l_fire_object is clisp.cpp's
    // LSymbol::FindOrCreate("fire_object")
    eval_user_function(find_or_create('fire_object'), call_list.v);
    o.set_state(S_weapon_fire);
  }
}

export function ant_ai(): LObj {
  const o = L.current_object;
  let b: game_object;

  if (o.hp() === 0) { // if we are dead return NULL and get deleted
    if (o.state === dead) return null;
    else o.set_state(dead);
    return true_symbol;
  }

  if (o.state === flinch_up || o.state === flinch_down) {
    o.next_picture();
    return true_symbol;
  }

  switch (o.aistate()) {
    case ANT_START: {
      o.set_state(S_hanging);
      if (o.lvars![ANT_hide_flag]) o.set_aistate(ANT_HIDING);
      else o.set_aistate(ANT_HANGING);
    } break;
    case ANT_HIDING: {
      if ((jrand() % 128) === 0) G.the_game.play_sound(S_SCARE_SND, 127, o.x, o.y);
      if (o.otype !== S_HIDDEN_ANT) {
        o.change_type(S_HIDDEN_ANT); // switch types so noone hurts us.
        o.set_state(stopped);
        o.set_aistate(ANT_HIDING);
      }

      let fall = 0;
      if (o.total_objects() === 0) {
        b = target_player();
        if (iabs(b.x - o.x) < 130 && o.y < b.y) fall = 1;
      } else if (o.get_object(0).aistate() !== 0) fall = 1;

      if (fall) {
        o.change_type(S_ANT_ROOF);
        o.set_state(S_falling);
        o.set_aistate(ANT_FALL_DOWN);
        o.set_targetable(1);
      } else o.set_targetable(0);
    } break;
    case ANT_HANGING: {
      let fall = 0;
      if ((jrand() % 128) === 0) G.the_game.play_sound(S_SCARE_SND, 127, o.x, o.y);
      if (o.lvars![ANT_hide_flag]) o.set_aistate(ANT_HIDING);
      else {
        o.set_state(S_hanging);
        if (o.total_objects()) {
          if (o.get_object(0).aistate() !== 0) fall = 1;
        } else {
          b = target_player();
          if (iabs(b.x - o.x) < 130 && o.y < b.y) fall = 1;
        }
        if (fall) {
          o.set_state(S_fall_start);
          o.set_aistate(ANT_FALL_DOWN);
          o.set_targetable(1);
        } else o.set_targetable(0);
      }
    } break;
    case ANT_FALL_DOWN: {
      o.set_state(S_falling);

      b = target_player();

      scream_check(o, b);
      const ret = o.mover(0, 0, 0);
      if ((ret & BLOCKED_DOWN) || !can_see(o, o.x, o.y, o.x, o.y + 1)) {
        o.set_state(S_landing);
        G.the_game.play_sound(S_ALAND_SND, 127, o.x, o.y);
        o.set_aistate(ANT_LANDING);
      }
    } break;
    case ANT_LANDING: {
      if (!o.next_picture()) {
        let xv = 0, yv = 2;
        [, xv, yv] = o.try_move(o.x, o.y, xv, yv, 1);
        if (yv !== 0) {
          o.set_gravity(1);
          o.set_aistate(ANT_FALL_DOWN);
        } else {
          o.set_state(stopped);
          o.set_aistate(ANT_RUNNING);
          // return (void *)ant_ai: the address of the function, which the caller only tests for
          // being non-NULL (the object stays alive); any non-nil value does the same
          return true_symbol;
        }
      }
    } break;
    case ANT_RUNNING: {
      b = target_player();
      scream_check(o, b);

      if ((jrand() % 16) === 0) o.lvars![ANT_need_to_dodge] = 1;
      if (!ant_dodge(o)) {
        if ((o.x > b.x && o.direction === -1) || (o.x < b.x && o.direction === 1)) {
          o.next_picture();
          if ((jrand() % 4) === 0 && iabs(o.x - b.x) < 180 && iabs(o.y - b.y) < 100 && can_hit_player(o, b)) {
            o.set_state(S_weapon_fire);
            o.set_aistate(ANT_FIRE);
          } else if (iabs(o.x - b.x) < 100 && iabs(o.y - b.y) < 10 && (jrand() % 4) === 0)
            o.set_aistate(ANT_POUNCE_WAIT);
          else if (iabs(o.x - b.x) > 140 && !ant_congestion(o))
            o.set_aistate(ANT_JUMP);
          else {
            const xm = o.direction > 0 ? get_ability(o.otype, run_top_speed) : -get_ability(o.otype, run_top_speed) | 0;
            let ym = 0, new_xm = xm;
            if (o.state !== running) o.set_state(running);

            [, new_xm, ym] = o.try_move(o.x, o.y, new_xm, ym, 3);
            if (new_xm !== xm) { // blocked, see if we can climb ramp
              new_xm = xm;
              ym = -iabs(xm) | 0;
              [, new_xm, ym] = o.try_move(o.x, o.y, new_xm, ym, 3);
              if (new_xm === xm) {
                o.x += new_xm;
                o.y += ym;
                new_xm = 0;
                ym = iabs(xm); // now get back on the ground
                [, new_xm, ym] = o.try_move(o.x, o.y, new_xm, ym, 3);
                o.x += new_xm;
                o.y += ym;
              } else {
                o.direction = 0 - o.direction;
                o.set_aistate(ANT_JUMP);
              }
            } else o.x += new_xm;
            new_xm = 0;
            ym = 10; // see if we should fall
            [, new_xm, ym] = o.try_move(o.x, o.y, new_xm, ym, 3);
            if (ym === 10) o.set_aistate(ANT_FALL_DOWN);
            else o.y += ym;
          }
        } else {
          o.direction = o.x > b.x ? -1 : 1;
          o.set_aistate(ANT_LANDING);
        }
      }
    } break;

    case ANT_POUNCE_WAIT: {
      if (!ant_dodge(o)) {
        o.set_state(S_pounce_wait);
        if (o.aistate_time() > alien_wait_time()) {
          G.the_game.play_sound(S_ASLASH_SND, 127, o.x, o.y);
          o.set_state(stopped);
          o.set_aistate(ANT_JUMP);
        }
      }
    } break;

    case ANT_JUMP: {
      o.lvars![ANT_need_to_dodge] = 0;
      if (o.move(o.direction, -1, 0) & BLOCKED_DOWN) o.set_aistate(ANT_RUNNING);
    } break;
    case ANT_FIRE: {
      if (!ant_dodge(o)) {
        if (o.state === S_fire_wait) {
          if (!o.next_picture() || symbol_value(L.l_difficulty) === L.l_extreme) {
            b = target_player();
            fire_at_player(o, b);
            o.set_state(stopped);
            o.set_aistate(ANT_RUNNING);
          }
        } else o.set_state(S_fire_wait);
      }
    } break;
    case ANT_JUMP_ROOF: {
      o.lvars![ANT_need_to_dodge] = 0;
      o.set_state(S_jump_up);
      // o->set_yvel(o->yvel()+1);
      o.set_xacel(0);
      let xv = 0, yv = o.yvel();
      o.y -= 31;
      [, xv, yv] = o.try_move(o.x, o.y, xv, yv, 1);
      o.y += 31 + yv;
      if (yv !== o.yvel()) {
        if (o.yvel() > 0) {
          o.set_state(stopped);
          o.set_aistate(ANT_RUNNING);
        } else {
          o.set_state(S_top_walk);
          o.set_aistate(ANT_ROOF_WALK);
        }
        o.set_yvel(0);
      }
    } break;
    case ANT_ROOF_WALK: {
      b = target_player();
      scream_check(o, b);
      if (((jrand() % 8) === 0 && iabs(o.x - b.x) < 10 && o.y < b.y) || o.lvars![ANT_need_to_dodge] === 1) {
        o.set_gravity(1);
        o.set_state(run_jump);
        o.set_aistate(ANT_JUMP);
        ant_ai();
      } else {
        if ((o.x > b.x && o.direction > 0) || (o.x < b.x && o.direction < 0)) o.direction = -o.direction;
        else if (iabs(o.x - b.x) < 120 && (jrand() % 4) === 0) {
          o.set_state(S_ceil_fire);
          o.set_aistate(ANT_CEIL_SHOOT);
          ant_ai();
        } else {
          const speed = o.direction > 0 ? get_ability(o.otype, run_top_speed) : -get_ability(o.otype, run_top_speed) | 0;
          if (can_see(o, o.x, o.y - 31, o.x + speed, o.y - 31) &&
            !can_see(o, o.x + speed, o.y - 31, o.x + speed, o.y - 32)) {
            o.x += speed;
            if (!o.next_picture()) o.set_state(S_top_walk);
          } else o.set_aistate(ANT_FALL_DOWN);
        }
      }
    } break;
    case ANT_CEIL_SHOOT: {
      if (!o.next_picture()) {
        b = target_player();
        fire_at_player(o, b);
        o.set_state(S_top_walk);
        o.set_aistate(ANT_ROOF_WALK);
      }
    } break;
  }

  return true_symbol;
}

const isdigit = (c: string): boolean => c >= '0' && c <= '9';

/**
 * show_stats: the "level complete" screen between two levels (called from Lisp, next_level_ai).
 * The original, inside the Lisp call:
 *   fade_out(8)                      the game's last frame fades to black (8 x 25 ms, flushing the screen
 *                                    each step), then the screen is cleared and flushed, palette restored
 *   wm->set_mouse_position(0,0)
 *   screen->clear(); end_level_screen image at 0,0
 *   fade_in(NULL,16)                 that picture fades in (16 x 25 ms)
 *   a framed box with "<lev_complete> : <level number>"; wm->flush_screen()
 *   Timer now; now.WaitMs(500)
 * and returns to the Lisp, which then requests the next level's load.
 * The port computes here, at the original's point, everything that reads game state (the level's name,
 * the language string, the image from the cache, the positions) and queues the rest, which only draws,
 * fades and waits, on rt/deferred.ts. The main loop runs it after this tick and before it draws again.
 * Nothing between this call and that point draws on the screen or flushes it (the rest of the tick
 * moves objects, sbar.step() only sets view suggestions; the requested level is loaded at the start
 * of the next loop), so the screen holds the game's last frame when the fade-out starts, as in the
 * original, and the frames shown are the same in the same order. The mouse is moved inside the task,
 * after the fade-out, because flush_screen draws the cursor where the mouse is.
 */
export function show_stats(): void {
  if (G.current_level) {
    const im = cache.img(cache.reg('art/frame.spe', 'end_level_screen', SPEC_IMAGE, 1));
    const screen = G.screen, wm = G.wm;

    const x1 = im.Size().x + 1, y1 = 0, x2 = G.xres, y2 = screen.Size().y;

    const name = G.current_level.original_name();
    // name[strlen(name)-strlen(".spe")-2] and -1; a name shorter than 6 characters reads before the
    // buffer in the original (undefined); here such a character is '' and not a digit
    const dig1 = name.charAt(name.length - 4 - 2);
    const dig2 = name.charAt(name.length - 4 - 1);

    let msg: string;
    if (isdigit(dig1) && isdigit(dig2)) {
      if (dig1 !== '0') msg = `${symbol_str('lev_complete')} : ${dig1}${dig2}`;
      else msg = `${symbol_str('lev_complete')} : ${dig2}`;
    } else msg = `${symbol_str('lev_complete')} : ${G.current_level.original_name()}`;

    const w = Math.imul(wm.font().width(), msg.length), h = wm.font().height();
    const x = ((((x1 + x2) / 2) | 0) - ((w / 2) | 0)) | 0, y = ((((y1 + y2) / 2) | 0) - ((h / 2) | 0)) | 0;

    defer(async () => {
      await fade_out(8);
      wm.set_mouse_position(0, 0);
      screen.clear();
      im.put_image(screen, 0, 0);
      await fade_in(null, 16);

      screen.bar(x - 10, y - 10, x + w + 10, y + h + 10, wm.bright_color());
      screen.bar(x - 9, y - 9, x + w + 9, y + h + 9, wm.medium_color());

      wm.font().put_string(screen, x + 1, y + 1, msg, wm.dark_color());
      wm.font().put_string(screen, x, y, msg, wm.bright_color());
      wm.flush_screen();
      const now = new Timer();
      await now.WaitMs(500);
    });
  }
}
