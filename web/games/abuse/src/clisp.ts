// clisp.cpp: the functions the game gives its Lisp (c_caller: arguments evaluated, returns a number;
// l_caller: arguments not evaluated, returns a Lisp object) and the object variables (l_obj_get/set)
import * as Lp from './lisp/lisp.ts';
import { CAR, CDR, DEFINEDP, find_or_create, item_type, lbreak, lcar, lcdr, lisp_eval, eval_block, eval_function,
  lnumber_value, lpointer_value, lstring_value, lfixed_point_value, lisp_atan2, lisp_cos, lisp_sin, new_pointer,
  push_onto_list, set_number, symbol_value, true_symbol, LNumber, LString, LFixedPoint, L_STRING, L_SYMBOL, type LObj,
  type LSymbol, print, add_c_function, add_c_bool_fun, add_lisp_function, set_lisp_hooks } from './lisp/lisp.ts';
import { dprintf } from './imlib/dprint.ts';
import { G, EDIT_MODE } from './globals.ts';
import { L } from './lglobals.ts';
import { R, jrandom } from './imlib/jrand.ts';
import { figures, object_names, def_char, get_ability, state_names, MAX_STATE, ability_names, TOTAL_ABILITIES,
  cflag_names, TOTAL_CFLAGS, OFUN_AI, OFUN_USER_FUN, W } from './chars.ts';
import { create, BLOCKED_DOWN, BLOCKED_LEFT, BLOCKED_RIGHT, BLOCKED_UP, type game_object } from './objects.ts';
import { add_light_source, LG, type light_source } from './light.ts';
import { add_panim, defun_pseq, scatter_line, ascatter_line } from './particle.ts';
import { cache } from './cache.ts';
import { SPEC_COLOR_TABLE, SPEC_EXTERN_SFX, SPEC_IMAGE, SPEC_PALETTE, open_file, spec_directory, get_save_filename_prefix } from './imlib/specs.ts';
import { palette } from './imlib/palette.ts';
import { ColorFilter } from './imlib/filter.ts';
import type { JCFont } from './imlib/fonts.ts';
import { S, song, MUSIC_INITIALIZED } from './sdlport/sound.ts';
import { DM, CUR } from './statbar.ts';
import { set_local_players, total_local_players, set_login, type view } from './view.ts';
import { level } from './level.ts';
import { palette_load } from './sdlport/video.ts';
import { answers, NeedInput } from './rt/needinput.ts';
import { cop_mover, top_ai, laser_ufun, top_ufun, plaser_ufun, player_rocket_ufun, lsaber_ufun, ladder_ai, top_draw,
  bottom_draw, mover_ai, sgun_ai, respawn_ai, score_draw, show_kills } from './cop.ts';
import { ant_ai, show_stats } from './ant.ts';
import { sensor_ai } from './sensor.ts';
import { load_game, last_savegame_name } from './loadgame.ts';
import { scene_director } from './director.ts';
import { load_tiles, LD } from './loader2.ts';
import { main_net_cfg, net_configuration, net_game } from './netcfg.ts';
import { get_keycode, morph } from './configuration.ts';

const ENGINE_MAJOR = 1, ENGINE_MINOR = 20;

export const CL = {
  chatting_enabled: 0,
  game_name: '',
};

export function symbol_str(name: string): string {
  let sym = find_or_create(name);
  if (sym.value && item_type(sym.value) === L_STRING) return lstring_value(sym.value);
  const sp = Lp.current_space;
  Lp.set_current_space(Lp.PERM_SPACE);
  Lp.eval_string("(setq section 'game_section)\n");
  if (!Lp.eval_string('(load "lisp/english.lsp")\n')) throw new Error('unable to open file lisp/english.lsp');
  Lp.set_current_space(sp);
  sym = find_or_create(name);
  if (sym.value && item_type(sym.value) === L_STRING) return lstring_value(sym.value);
  sym = find_or_create('missing_sym');
  if (sym.value && item_type(sym.value) === L_STRING) return lstring_value(sym.value);
  return 'Missing language symbol!';
}

export function get_lprop_number(symbol: LObj, def: number): number {
  const v = symbol_value(symbol);
  if (v) {
    switch (item_type(v)) {
      case Lp.L_FIXED_POINT:
      case Lp.L_NUMBER:
        return lnumber_value(v);
      default:
        return def;
    }
  }
  return def;
}

function lget_view(arg: LObj, msg: string): view {
  const o = lpointer_value(arg) as game_object;
  const c = o.controller();
  if (!c) {
    dprintf(`${msg} : object does not have a view\n`);
    lbreak('');
  }
  return c!;
}

const sym = (n: string): LSymbol => find_or_create(n);

export function clisp_init(): void {
  L.l_easy = sym('easy');
  L.l_medium = sym('medium');
  L.l_hard = sym('hard');
  L.l_extreme = sym('extreme');
  L.l_logo = sym('logo');
  L.l_morph = sym('morph');
  sym('pushx');
  sym('pushy');
  sym('dist');
  sym('state_art');
  sym('abilities');
  sym('default_abilities');
  sym('state_sfx');
  sym('filename');
  sym('sfx_directory');
  L.l_default_font = sym('default_font');
  L.l_console_font = sym('console_font');
  sym('default_ai');
  sym('tile_files');
  L.l_empty_cache = sym('empty_cache');
  sym('range');
  L.l_difficulty = sym('difficulty');
  sym('death_handler');
  L.l_title_screen = sym('title_screen');
  sym('fields');
  sym('FIRE');
  sym('fire_object');
  sym('cop_dead_parts');
  (L.l_difficulty as LSymbol).value = L.l_hard;
  L.l_restart_player = sym('restart_player');
  L.l_help_screens = sym('help_screens');
  L.l_save_order = sym('save_order');
  L.l_next_song = sym('next_song');
  L.l_player_draw = sym('player_draw');
  L.l_sneaky_draw = sym('sneaky_draw');
  L.l_keep_backup = sym('keep_backup');
  L.l_level_loaded = sym('level_loaded');
  L.l_draw_fast = sym('draw_fast');
  L.l_player_tints = sym('player_tints');
  L.l_max_hp = sym('max_hp');
  set_number(L.l_max_hp as LSymbol, 200);
  L.l_max_power = sym('max_power');
  L.l_main_menu = sym('main_menu');
  set_number(L.l_max_power as LSymbol, 999);
  set_number(sym('run_state'), 0);
  set_number(sym('pause_state'), 1);
  set_number(sym('menu_state'), 6);
  set_number(sym('scene_state'), 7);
  L.l_statbar_ammo_x = sym('statbar_ammo_x');
  L.l_statbar_ammo_y = sym('statbar_ammo_y');
  L.l_statbar_ammo_w = sym('statbar_ammo_w');
  L.l_statbar_ammo_h = sym('statbar_ammo_h');
  L.l_statbar_ammo_bg_color = sym('statbar_ammo_bg_color');
  L.l_statbar_health_x = sym('statbar_health_x');
  L.l_statbar_health_y = sym('statbar_health_y');
  L.l_statbar_health_w = sym('statbar_health_w');
  L.l_statbar_health_h = sym('statbar_health_h');
  L.l_statbar_health_bg_color = sym('statbar_health_bg_color');
  L.l_statbar_logo_x = sym('statbar_logo_x');
  L.l_statbar_logo_y = sym('statbar_logo_y');
  L.l_object = sym('object');
  L.l_tile = sym('tile');
  L.l_cdc_logo = sym('logo');
  L.l_switch_to_powerful = sym('switch_to_powerful');
  L.l_mouse_can_switch = sym('mouse_can_switch');
  L.l_ask_save_slot = sym('ask_save_slot');
  L.l_level_load_start = sym('level_load_start');
  L.l_level_load_end = sym('level_load_end');
  L.l_get_local_input = sym('get_local_input');
  L.l_chat_input = sym('chat_input');
  L.l_player_text_color = sym('player_text_color');
  for (let i = 0; i < MAX_STATE; i++) set_number(sym(state_names[i]), i);
  for (let i = 0; i < TOTAL_ABILITIES; i++) set_number(sym(ability_names[i]), i);
  for (let i = 0; i < TOTAL_CFLAGS; i++) set_number(sym(cflag_names[i]), i);
  L.l_song_list = sym('song_list');
  L.l_post_render = sym('post_render');

  const C: [string, number, number, number][] = [
    ['distx', 0, 0, 1], ['disty', 0, 0, 2]];
  for (const [n, a, b, k] of C) add_c_function(n, a, b, k);
  add_c_bool_fun('key_pressed', 1, 1, 3);
  add_c_bool_fun('local_key_pressed', 1, 1, 4);
  const list: [string, number, number, number, boolean][] = [
    ['bg_state', 0, 0, 5, false], ['aitype', 0, 0, 6, false], ['aistate', 0, 0, 7, false], ['set_aistate', 1, 1, 8, false],
    ['random', 1, 1, 9, false], ['state_time', 0, 0, 10, false], ['state', 0, 0, 11, false], ['toward', 0, 0, 12, false],
    ['move', 3, 3, 13, false], ['facing', 0, 0, 14, false], ['otype', 0, 0, 15, false], ['next_picture', 0, 0, 16, true],
    ['set_fade_dir', 1, 1, 17, true], ['mover', 3, 3, 18, false], ['set_fade_count', 1, 1, 19, true],
    ['fade_count', 0, 0, 20, false], ['fade_dir', 0, 0, 21, false], ['touching_bg', 0, 0, 22, true],
    ['add_power', 1, 1, 23, false], ['add_hp', 1, 1, 24, false], ['draw', 0, 0, 27, true], ['edit_mode', 0, 0, 28, true],
    ['draw_above', 0, 0, 29, true], ['x', 0, 0, 30, false], ['y', 0, 0, 31, false], ['set_x', 1, 1, 32, true],
    ['set_y', 1, 1, 33, true], ['push_characters', 2, 2, 34, true], ['set_state', 1, 1, 37, true],
    ['bg_x', 0, 0, 38, false], ['bg_y', 0, 0, 39, false], ['set_aitype', 1, 1, 40, true], ['xvel', 0, 0, 42, false],
    ['yvel', 0, 0, 43, false], ['set_xvel', 1, 1, 44, true], ['set_yvel', 1, 1, 45, true], ['away', 0, 0, 46, false],
    ['blocked_left', 1, 1, 47, true], ['blocked_right', 1, 1, 48, true], ['add_palette', 1, -1, 50, false],
    ['screen_shot', 1, 1, 51, true], ['set_zoom', 1, 1, 52, true], ['show_help', 1, 1, 55, false],
    ['direction', 0, 0, 56, false], ['set_direction', 1, 1, 57, false], ['freeze_player', 1, 1, 58, true],
    ['menu', 1, -1, 59, false], ['do_command', 1, 1, 60, true], ['set_game_state', 1, 1, 61, true],
    ['scene:set_text_region', 4, 4, 62, true], ['scene:set_frame_speed', 1, 1, 63, true],
    ['scene:set_scroll_speed', 1, 1, 64, true], ['scene:set_pan_speed', 1, 1, 65, true],
    ['scene:scroll_text', 1, 1, 66, true], ['scene:pan', 3, 3, 67, true], ['scene:wait', 1, 1, 68, true],
    ['level:new', 3, 3, 74, true], ['do_damage', 2, 4, 75, true], ['hp', 0, 0, 76, false],
    ['set_shift_down', 2, 2, 77, true], ['set_shift_right', 2, 2, 78, true], ['set_gravity', 1, 1, 79, true],
    ['tick', 0, 0, 80, false], ['set_xacel', 1, 1, 81, true], ['set_yacel', 1, 1, 82, true],
    ['set_local_players', 1, 1, 84, true], ['local_players', 0, 0, 85, false], ['set_light_detail', 1, 1, 86, true],
    ['light_detail', 0, 0, 87, false], ['set_morph_detail', 1, 1, 88, true], ['morph_detail', 0, 0, 89, false],
    ['morph_into', 3, 3, 90, true], ['link_object', 1, 1, 91, true], ['draw_line', 5, 5, 92, true],
    ['dark_color', 0, 0, 93, false], ['medium_color', 0, 0, 94, false], ['bright_color', 0, 0, 95, false],
    ['remove_object', 1, 1, 99, true], ['link_light', 1, 1, 100, true], ['remove_light', 1, 1, 101, true],
    ['total_objects', 0, 0, 102, false], ['total_lights', 0, 0, 103, false], ['set_light_r1', 2, 2, 104, true],
    ['set_light_r2', 2, 2, 105, true], ['set_light_x', 2, 2, 106, true], ['set_light_y', 2, 2, 107, true],
    ['set_light_xshift', 2, 2, 108, true], ['set_light_yshift', 2, 2, 109, true], ['light_r1', 1, 1, 110, false],
    ['light_r2', 1, 1, 111, false], ['light_x', 1, 1, 112, false], ['light_y', 1, 1, 113, false],
    ['light_xshift', 1, 1, 114, false], ['light_yshift', 1, 1, 115, false], ['xacel', 0, 0, 116, false],
    ['yacel', 0, 0, 117, false], ['delete_light', 1, 1, 118, true], ['set_fx', 1, 1, 119, true],
    ['set_fy', 1, 1, 120, true], ['set_fxvel', 1, 1, 121, true], ['set_fyvel', 1, 1, 122, true],
    ['set_fxacel', 1, 1, 123, true], ['set_fyacel', 1, 1, 124, true], ['picture_width', 0, 0, 125, false],
    ['picture_height', 0, 0, 126, false], ['trap', 0, 0, 127, true], ['platform_push', 2, 2, 128, true],
    ['def_sound', 1, 2, 133, false], ['play_sound', 1, 4, 134, true], ['def_particle', 2, 2, 137, false],
    ['add_panim', 4, 4, 138, false], ['weapon_to_type', 1, 1, 142, false], ['hurt_radius', 6, 6, 143, true],
    ['add_ammo', 2, 2, 144, true], ['ammo_total', 1, 1, 145, false], ['current_weapon', 0, 0, 146, false],
    ['current_weapon_type', 0, 0, 147, false], ['blocked_up', 1, 1, 148, true], ['blocked_down', 1, 1, 149, true],
    ['give_weapon', 1, 1, 150, true], ['get_ability', 1, 1, 151, false], ['reset_player', 0, 0, 152, true],
    ['site_angle', 1, 1, 153, false], ['set_course', 2, 2, 154, true], ['set_frame_angle', 3, 3, 155, true],
    ['jump_state', 1, 1, 156, true], ['morphing', 0, 0, 168, true], ['damage_fun', 6, 6, 169, true],
    ['gravity', 0, 0, 170, true], ['make_view_solid', 1, 1, 171, true], ['find_rgb', 3, 3, 172, false],
    ['player_x_suggest', 0, 0, 173, false], ['player_y_suggest', 0, 0, 174, false],
    ['player_b1_suggest', 0, 0, 175, false], ['player_b2_suggest', 0, 0, 176, false],
    ['player_b3_suggest', 0, 0, 177, false], ['set_bg_scroll', 4, 4, 178, true], ['set_ambient_light', 2, 2, 179, true],
    ['ambient_light', 1, 1, 180, false], ['has_object', 1, 1, 181, true], ['set_otype', 1, 1, 182, true],
    ['current_frame', 0, 0, 184, false], ['fx', 0, 0, 185, false], ['fy', 0, 0, 186, false], ['fxvel', 0, 0, 187, false],
    ['fyvel', 0, 0, 188, false], ['fxacel', 0, 0, 189, false], ['fyacel', 0, 0, 190, false],
    ['set_stat_bar', 2, 2, 191, true], ['set_fg_tile', 3, 3, 192, true], ['fg_tile', 2, 2, 193, false],
    ['set_bg_tile', 3, 3, 194, true], ['bg_tile', 2, 2, 195, false], ['load_tiles', 1, -1, 196, true],
    ['load_palette', 1, 1, 197, true], ['load_color_filter', 1, 1, 198, true], ['create_players', 1, 1, 199, true],
    ['try_move', 2, 3, 200, true], ['sequence_length', 1, 1, 201, false], ['can_see', 5, 5, 202, true],
    ['load_big_font', 2, 2, 203, false], ['load_small_font', 2, 2, 204, false], ['load_console_font', 2, 2, 205, false],
    ['set_current_frame', 1, 1, 206, false], ['draw_transparent', 2, 2, 208, true], ['draw_tint', 1, 1, 209, true],
    ['draw_predator', 0, 0, 210, true], ['shift_down', 1, 1, 211, false], ['shift_right', 1, 1, 212, false],
    ['set_no_scroll_range', 5, 5, 213, true], ['def_image', 2, 2, 215, false], ['put_image', 3, 3, 216, true],
    ['view_x1', 0, 0, 217, false], ['view_y1', 0, 0, 218, false], ['view_x2', 0, 0, 219, false],
    ['view_y2', 0, 0, 220, false], ['view_push_down', 1, 1, 221, false], ['local_player', 0, 0, 222, true],
    ['save_game', 1, 1, 223, true], ['set_hp', 1, 1, 224, true], ['request_level_load', 1, 1, 225, true],
    ['set_first_level', 1, 1, 226, true], ['def_tint', 1, 1, 227, false], ['tint_palette', 3, 3, 228, false],
    ['player_number', 0, 0, 229, false], ['set_current_weapon', 1, 1, 230, true], ['has_weapon', 1, 1, 231, true],
    ['ambient_ramp', 1, 1, 232, true], ['total_players', 0, 0, 233, false], ['scatter_line', 6, 6, 234, true],
    ['game_tick', 0, 0, 235, false], ['isa_player', 0, 0, 236, true], ['shift_rand_table', 1, 1, 237, true],
    ['total_frames', 0, 0, 238, false], ['raise', 0, 0, 239, false], ['lower', 0, 0, 240, false],
    ['player_pointer_x', 0, 0, 241, false], ['player_pointer_y', 0, 0, 242, false], ['frame_panic', 0, 0, 243, true],
    ['ascatter_line', 7, 7, 244, true], ['rand_on', 0, 0, 245, false], ['set_rand_on', 1, 1, 246, false],
    ['bar', 5, 5, 247, false], ['argc', 0, 0, 248, false], ['play_song', 1, 1, 249, true], ['stop_song', 0, 0, 250, true],
    ['targetable', 0, 0, 251, true], ['set_targetable', 1, 1, 252, true], ['show_stats', 0, 0, 253, true],
    ['kills', 0, 0, 254, false], ['tkills', 0, 0, 255, false], ['secrets', 0, 0, 256, false], ['tsecrets', 0, 0, 257, false],
    ['set_kills', 1, 1, 258, true], ['set_tkills', 1, 1, 259, true], ['set_secrets', 1, 1, 260, true],
    ['set_tsecrets', 1, 1, 261, true], ['request_end_game', 0, 0, 262, true], ['get_save_slot', 0, 0, 263, false],
    ['mem_report', 0, 0, 264, true], ['major_version', 0, 0, 265, false], ['minor_version', 0, 0, 266, false],
    ['draw_double_tint', 2, 2, 267, true], ['image_width', 1, 1, 268, false], ['image_height', 1, 1, 269, false],
    ['foreground_width', 0, 0, 270, false], ['foreground_height', 0, 0, 271, false],
    ['background_width', 0, 0, 272, false], ['background_height', 0, 0, 273, false], ['get_key_code', 1, 1, 274, false],
    ['set_cursor_shape', 3, 3, 275, true], ['start_server', 0, 0, 276, true], ['put_string', 4, 5, 277, true],
    ['font_width', 1, 1, 278, false], ['font_height', 1, 1, 279, false], ['chat_print', 1, 1, 280, true],
    ['set_player_name', 1, 1, 281, true], ['draw_bar', 5, 5, 282, true], ['draw_rect', 5, 5, 283, true],
    ['get_option', 1, 1, 284, true], ['set_delay_on', 1, 1, 288, true], ['set_login', 1, 1, 289, true],
    ['enable_chatting', 0, 0, 290, true], ['demo_break_enable', 0, 0, 291, true], ['am_a_client', 0, 0, 292, true],
    ['time_for_next_level', 0, 0, 293, true], ['reset_kills', 0, 0, 294, true], ['set_game_name', 1, 1, 295, true],
    ['set_net_min_players', 1, 1, 296, true], ['set_object_tint', 1, 1, 1001, true], ['get_object_tint', 0, 0, 1002, false],
    ['set_object_team', 1, 1, 1003, true], ['get_object_team', 0, 0, 1004, false]];
  for (const [n, a, b, k, bool] of list) {
    if (bool) add_c_bool_fun(n, a, b, k);
    else add_c_function(n, a, b, k);
  }
  const lf: [string, number, number, number][] = [
    ['go_state', 1, 1, 0], ['with_object', 2, -1, 1], ['bmove', 0, 1, 2], ['me', 0, 0, 3], ['bg', 0, 0, 4],
    ['find_closest', 1, 1, 5], ['find_xclosest', 1, 1, 6], ['find_xrange', 2, 2, 7], ['add_object', 3, 4, 8],
    ['first_focus', 0, 0, 9], ['next_focus', 1, 1, 10], ['get_object', 1, 1, 11], ['get_light', 1, 1, 12],
    ['with_objects', 1, 1, 13], ['add_light', 7, 7, 14], ['find_enemy', 1, 1, 15], ['user_fun', 0, -1, 16],
    ['time', 2, 2, 17], ['name', 0, 0, 18], ['float_tick', 0, 0, 19], ['find_object_in_area', 5, 5, 20],
    ['find_object_in_angle', 3, 3, 21], ['add_object_after', 3, 4, 22], ['def_char', 2, -1, 23], ['see_dist', 4, 4, 24],
    ['platform', 0, 0, 25], ['level_name', 0, 0, 26], ['ant_ai', 0, 0, 27], ['sensor_ai', 0, 0, 28],
    ['dev_draw', 0, 0, 29], ['top_ai', 0, 0, 30], ['laser_ufun', 2, 2, 31], ['top_ufun', 2, 2, 32],
    ['player_rocket_ufun', 2, 2, 34], ['plaser_ufun', 2, 2, 33], ['lsaber_ufun', 2, 2, 35], ['cop_mover', 3, 3, 36],
    ['latter_ai', 0, 0, 37], ['with_obj0', -1, -1, 38], ['activated', 0, 0, 39], ['top_draw', 0, 0, 40],
    ['bottom_draw', 0, 0, 41], ['mover_ai', 0, 0, 42], ['sgun_ai', 0, 0, 43], ['last_savegame_name', 0, 0, 44],
    ['next_savegame_name', 0, 0, 45], ['argv', 1, 1, 46], ['joy_stat', 0, 0, 47], ['mouse_stat', 0, 0, 48],
    ['mouse_to_game', 2, 2, 49], ['game_to_mouse', 2, 2, 50], ['get_main_font', 0, 0, 51], ['player_name', 0, 0, 52],
    ['get_cwd', 0, 0, 54], ['system', 1, 1, 55], ['convert_slashes', 2, 2, 56], ['get_directory', 1, 1, 58],
    ['respawn_ai', 0, 0, 60], ['score_draw', 0, 0, 61], ['show_kills', 0, 0, 62], ['mkptr', 1, 1, 63], ['seq', 3, 3, 64]];
  for (const [n, a, b, k] of lf) add_lisp_function(n, a, b, k);
}

const cur = (): game_object => L.current_object;
const num = (x: number): LObj => new LNumber(x);
function list_of(...vals: number[]): LObj {
  const r = { v: null as LObj };
  for (let i = vals.length - 1; i >= 0; i--) push_onto_list(num(vals[i]), r);
  return r.v;
}

/** l_caller: the arguments have not been evaluated yet */
export function l_caller(number: number, args: LObj): LObj {
  switch (number) {
    case 0: {
      cur().set_aistate(lnumber_value(lisp_eval(CAR(args))));
      cur().set_aistate_time(0);
      const ai = figures[cur().otype].get_fun(OFUN_AI);
      if (!ai) lbreak('hrump... call to go_state, and no ai function defined?\n');
      return eval_function(ai, null);
    }
    case 1: {
      const old_cur = L.current_object;
      L.current_object = lpointer_value(lisp_eval(CAR(args))) as game_object;
      const ret = eval_block(CDR(args));
      L.current_object = old_cur;
      return ret;
    }
    case 2: {
      const o = args ? (lpointer_value(lisp_eval(CAR(args))) as game_object) : cur();
      const [hit, whit] = cur().bmove(o);
      if (hit) return new_pointer(hit);
      if (whit) return null;
      return true_symbol;
    }
    case 3: return new_pointer(cur());
    case 4:
      if (L.player_list!.next) return new_pointer(G.current_level.attacker(cur()));
      return new_pointer(L.player_list!.focus);
    case 5: return new_pointer(G.current_level.find_closest(cur().x, cur().y, lnumber_value(lisp_eval(CAR(args))), cur()));
    case 6: return new_pointer(G.current_level.find_xclosest(cur().x, cur().y, lnumber_value(lisp_eval(CAR(args))), cur()));
    case 7: {
      const n1 = lnumber_value(lisp_eval(CAR(args)));
      const n2 = lnumber_value(lisp_eval(CAR(CDR(args))));
      return new_pointer(G.current_level.find_xrange(cur().x, cur().y, n1, n2));
    }
    case 8:
    case 22: {
      const type = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const x = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const y = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const o = args ? create(type, x, y, 0, lnumber_value(lisp_eval(CAR(args)))) : create(type, x, y);
      if (G.current_level) {
        if (number === 8) G.current_level.add_object(o);
        else G.current_level.add_object_after(o, cur());
      }
      return new_pointer(o);
    }
    case 9: return new_pointer(G.the_game.first_view!.focus);
    case 10: {
      const v = (lpointer_value(lisp_eval(CAR(args))) as game_object).controller()!.next;
      return v ? new_pointer(v.focus) : null;
    }
    case 11: return new_pointer(cur().get_object(lnumber_value(lisp_eval(CAR(args)))));
    case 12: return new_pointer(cur().get_light(lnumber_value(lisp_eval(CAR(args)))));
    case 13: {
      const old_cur = L.current_object;
      let ret: LObj = null;
      for (let i = 0; i < old_cur.total_objects(); i++) {
        L.current_object = old_cur.get_object(i);
        ret = lisp_eval(CAR(args));
      }
      L.current_object = old_cur;
      return ret;
    }
    case 14: {
      const t = lnumber_value(lisp_eval(CAR(args)));
      args = lcdr(args);
      const x = lnumber_value(lisp_eval(CAR(args)));
      args = lcdr(args);
      const y = lnumber_value(lisp_eval(CAR(args)));
      args = lcdr(args);
      const r1 = lnumber_value(lisp_eval(CAR(args)));
      args = lcdr(args);
      const r2 = lnumber_value(lisp_eval(CAR(args)));
      args = lcdr(args);
      const xs = lnumber_value(lisp_eval(CAR(args)));
      args = lcdr(args);
      const ys = lnumber_value(lisp_eval(CAR(args)));
      return new_pointer(add_light_source(t, x, y, r1, r2, xs, ys));
    }
    case 15: break;
    case 16: {
      const f = figures[cur().otype].get_fun(OFUN_USER_FUN);
      if (!f) return null;
      return eval_function(f, args);
    }
    case 17: {
      const trials = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      for (let x = 0; x < trials; x++) lisp_eval(CAR(args));
      return new LFixedPoint(0);
    }
    case 18: return new LString(object_names[cur().otype]);
    case 19: return cur().float_tick();
    case 20: {
      const x1 = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const y1 = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const x2 = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const y2 = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const list = lisp_eval(CAR(args));
      const find = G.current_level.find_object_in_area(cur().x, cur().y, x1, y1, x2, y2, list, cur());
      return find ? new_pointer(find) : null;
    }
    case 21: {
      const a1 = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const a2 = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const list = lisp_eval(CAR(args));
      const find = G.current_level.find_object_in_angle(cur().x, cur().y, a1, a2, list, cur());
      return find ? new_pointer(find) : null;
    }
    case 23: return new LNumber(def_char(args));
    case 24: {
      const x1 = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const y1 = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      let x2 = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      let y2 = lnumber_value(lisp_eval(CAR(args)));
      [x2, y2] = G.current_level.foreground_intersect(x1, y1, x2, y2);
      const ret = { v: null as LObj };
      push_onto_list(num(y2), ret);
      push_onto_list(num(x2), ret);
      return ret.v;
    }
    case 25: return find_or_create('LINUX');
    case 26: return new LString(G.current_level.name());
    case 27: return ant_ai();
    case 28: return sensor_ai();
    case 29: if (G.dev & EDIT_MODE) cur().drawer(); break;
    case 30: return top_ai();
    case 31: return laser_ufun(args);
    case 32: return top_ufun(args);
    case 33: return plaser_ufun(args);
    case 34: return player_rocket_ufun(args);
    case 35: return lsaber_ufun(args);
    case 36: {
      const xm = lnumber_value(CAR(args));
      args = CDR(args);
      const ym = lnumber_value(CAR(args));
      args = CDR(args);
      const but = lnumber_value(CAR(args));
      return cop_mover(xm, ym, but);
    }
    case 37: return ladder_ai();
    case 38: {
      const old_cur = L.current_object;
      L.current_object = L.current_object.get_object(0);
      const ret = eval_block(args);
      L.current_object = old_cur;
      return ret;
    }
    case 39:
      if (cur().total_objects() === 0) return true_symbol;
      if (cur().get_object(0).aistate()) return true_symbol;
      return null;
    case 40: top_draw(); break;
    case 41: bottom_draw(); break;
    case 42: return mover_ai();
    case 43: return sgun_ai();
    case 44: return new LString(last_savegame_name());
    case 45: {
      const n = take_answer(async () => load_game(1, symbol_str('LOAD')));
      G.the_game.reset_keymap();
      return new LString(`save${String(n).padStart(4, '0')}.pcx`);
    }
    case 46: return new LString(G.start_argv[lnumber_value(lisp_eval(CAR(args)))] ?? '');
    case 47: return list_of(0, 0, 0, 0, 0);
    case 48: return list_of(DM.last_demo_mx, DM.last_demo_my, (DM.last_demo_mbut & 1) === 1 ? 1 : 0,
      (DM.last_demo_mbut & 2) === 2 ? 1 : 0, (DM.last_demo_mbut & 4) === 4 ? 1 : 0);
    case 49: {
      const x = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const y = lnumber_value(lisp_eval(CAR(args)));
      const [rx, ry] = G.the_game.mouse_to_game(x, y, null);
      return list_of(rx, ry);
    }
    case 50: {
      const x = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const y = lnumber_value(lisp_eval(CAR(args)));
      const [rx, ry] = G.the_game.game_to_mouse(x, y, L.current_view!);
      return list_of(rx, ry);
    }
    case 51: return new_pointer(G.wm.font());
    case 52: {
      const c = cur().controller();
      if (!c) lbreak('object is not a player, cannot return name');
      return new LString(c!.name);
    }
    case 54: return new LString('/abuse');
    case 55: break; // system(): nothing to run in the browser
    case 56: {
      const fn = lisp_eval(CAR(args));
      args = CDR(args);
      const slash = lstring_value(lisp_eval(CAR(args)));
      const filename = lstring_value(fn);
      let tmp = '';
      for (const c of filename) tmp += c === '/' || c === '\\' ? (slash[0] ?? '\0') : c;
      return new LString(tmp);
    }
    case 58: return null;
    case 60: return respawn_ai();
    case 61: return score_draw();
    case 62: return show_kills();
    case 63: return null;
    case 64: {
      const name = lstring_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const first = lnumber_value(lisp_eval(CAR(args)));
      args = CDR(args);
      const last = lnumber_value(lisp_eval(CAR(args)));
      const ret = { v: null as LObj };
      const nm = (i: number): LObj => new LString(`${name}${String(i).padStart(4, '0')}.pcx`);
      if (last >= first) for (let i = last; i >= first; i--) push_onto_list(nm(i), ret);
      else for (let i = last; i <= first; i++) push_onto_list(nm(i), ret);
      return ret.v;
    }
  }
  return null;
}

/** a dialog's answer inside a Lisp call: the first call throws NeedInput, the repeated call takes the answer */
function take_answer(ask: () => Promise<number>): number {
  if (answers.length) return answers.shift()!;
  throw new NeedInput(async () => {
    answers.push(await ask());
  });
}

/** c_caller: the arguments are evaluated */
export function c_caller(number: number, args: LObj): number {
  const o = cur();
  switch (number) {
    case 1: return Math.abs(o.x - G.current_level.attacker(o).x);
    case 2: return Math.abs(o.y - G.current_level.attacker(o).y);
    case 3:
      if (!o.controller()) lbreak('object is not a player, cannot determine keypresses');
      return o.controller()!.key_down(lnumber_value(CAR(args)));
    case 4: return G.the_game.key_down(lnumber_value(CAR(args)));
    case 5: return G.current_level.attacker(o).state;
    case 6: return o.aitype();
    case 7:
      if (!o.keep_ai_info()) o.set_aistate(0);
      return o.aistate();
    case 8: {
      const ns = lnumber_value(CAR(args));
      o.set_aistate_time(0);
      o.set_aistate(ns);
      return 1;
    }
    case 9: return jrandom(lnumber_value(CAR(args)));
    case 10: return o.aistate_time();
    case 11: return o.state;
    case 12: return G.current_level.attacker(o).x > o.x ? 1 : -1;
    case 13: return o.move(lnumber_value(CAR(args)), lnumber_value(CAR(CDR(args))), lnumber_value(CAR(CDR(CDR(args)))));
    case 14: return o.direction > 0 ? 1 : -1;
    case 15: return o.otype;
    case 16: return o.next_picture();
    case 17: o.set_fade_dir(lnumber_value(CAR(args))); return 1;
    case 18: {
      const cx = lnumber_value(CAR(args));
      args = CDR(args);
      const cy = lnumber_value(CAR(args));
      args = CDR(args);
      const but = lnumber_value(CAR(args));
      return o.mover(cx, cy, but);
    }
    case 19: o.set_fade_count(lnumber_value(CAR(args))); return 1;
    case 20: return o.fade_count();
    case 21: return o.fade_dir();
    case 22: {
      const [x1, y1, x2, y2] = G.current_level.attacker(o).picture_space();
      const [xp1, yp1, xp2, yp2] = o.picture_space();
      return xp1 > x2 || xp2 < x1 || yp1 > y2 || yp2 < y1 ? 0 : 1;
    }
    case 23: o.add_power(lnumber_value(CAR(args))); break;
    case 24: o.add_hp(lnumber_value(CAR(args))); break;
    case 27: o.drawer(); return 1;
    case 28: return G.dev & EDIT_MODE;
    case 29: o.draw_above(L.current_view!); return 1;
    case 30: return o.x;
    case 31: return o.y;
    case 32: o.x = lnumber_value(CAR(args)); return 1;
    case 33: o.y = lnumber_value(CAR(args)); return 1;
    case 34: return G.current_level.push_characters(o, lnumber_value(CAR(args)), lnumber_value(CAR(CDR(args))));
    case 37: {
      const s = lnumber_value(CAR(args));
      o.set_state(s);
      return s === o.state ? 1 : 0;
    }
    case 38: return G.current_level.attacker(o).x;
    case 39: return G.current_level.attacker(o).y;
    case 40: o.change_aitype(lnumber_value(CAR(args))); return 1;
    case 42: return o.xvel();
    case 43: return o.yvel();
    case 44: o.set_xvel(lnumber_value(CAR(args))); return 1;
    case 45: o.set_yvel(lnumber_value(CAR(args))); return 1;
    case 46: return G.current_level.attacker(o).x > o.x ? -1 : 1;
    case 47: return lnumber_value(CAR(args)) & BLOCKED_LEFT;
    case 48: return lnumber_value(CAR(args)) & BLOCKED_RIGHT;
    case 50: break; // dev_cont->add_palette: the editor's palettes
    case 51: break; // write_PCX(screen): a screen shot
    case 52: G.the_game.zoom = lnumber_value(CAR(args)); G.the_game.draw(); break;
    case 55: G.the_game.show_help(lstring_value(CAR(args))); break;
    case 56: return o.direction;
    case 57: o.direction = lnumber_value(CAR(args)); break;
    case 58: {
      const x1 = lnumber_value(CAR(args));
      if (!o.controller()) lbreak('set_freeze_time : object is not a focus\n');
      else o.controller()!.freeze_time = x1;
      return 1;
    }
    case 59: throw new Error('the Lisp (menu ...) is not used by the data and not ported');
    case 60: {
      const st = lstring_value(CAR(args));
      if (st[0] === '(') Lp.eval_string(st);
      return 1;
    }
    case 61: G.the_game.set_state(lnumber_value(CAR(args))); break;
    case 62: {
      const x1 = lnumber_value(CAR(args));
      args = CDR(args);
      const y1 = lnumber_value(CAR(args));
      args = CDR(args);
      const x2 = lnumber_value(CAR(args));
      args = CDR(args);
      const y2 = lnumber_value(CAR(args));
      scene_director.set_text_region(x1, y1, x2, y2);
      break;
    }
    case 63: scene_director.set_frame_speed(lnumber_value(CAR(args))); break;
    case 64: scene_director.set_scroll_speed(lnumber_value(CAR(args))); break;
    case 65: scene_director.set_pan_speed(lnumber_value(CAR(args))); break;
    case 66: scene_director.scroll_text(lstring_value(CAR(args))); break;
    case 67: scene_director.set_pan(lnumber_value(CAR(args)), lnumber_value(CAR(CDR(args))), lnumber_value(CAR(CDR(CDR(args))))); break;
    case 68: throw new Error('scene:wait is not used by the data and not ported');
    case 73: G.the_game.set_level(level.blank(lnumber_value(CAR(args)), lnumber_value(CAR(CDR(args))), lstring_value(CAR(CDR(CDR(args)))))); break;
    case 74:
      if (G.current_level) G.current_level.destroy();
      G.current_level = level.blank(100, 100, 'new_level');
      break;
    case 75: {
      const amount = lnumber_value(CAR(args));
      args = CDR(args);
      const target = lpointer_value(CAR(args)) as game_object;
      args = CDR(args);
      let xv = 0, yv = 0;
      if (args) {
        xv = lnumber_value(CAR(args));
        args = CDR(args);
        yv = lnumber_value(CAR(args));
      }
      target.do_damage(amount, o, o.x, o.y, xv, yv);
      break;
    }
    case 76: return o.hp();
    case 77: case 78: {
      const t = lpointer_value(CAR(args)) as game_object;
      if (!t.controller()) dprintf('set shift : object is not a focus\n');
      else if (number === 77) t.controller()!.shift_down = lnumber_value(CAR(CDR(args)));
      else t.controller()!.shift_right = lnumber_value(CAR(CDR(args)));
      return 1;
    }
    case 79: o.set_gravity(lnumber_value(CAR(args))); return 1;
    case 80: return o.tick();
    case 81: o.set_xacel(lnumber_value(CAR(args))); return 1;
    case 82: o.set_yacel(lnumber_value(CAR(args))); return 1;
    case 84: set_local_players(lnumber_value(CAR(args))); return 1;
    case 85: return total_local_players();
    case 86: LG.light_detail = lnumber_value(CAR(args)); return 1;
    case 87: return LG.light_detail;
    case 88: morph.morph_detail = lnumber_value(CAR(args)); return 1;
    case 89: return morph.morph_detail;
    case 90: o.morph_into(lnumber_value(CAR(args)), lnumber_value(CAR(CDR(args))), lnumber_value(CAR(CDR(CDR(args))))); return 1;
    case 91: o.add_object(lpointer_value(CAR(args)) as game_object); return 1;
    case 92: {
      const x1 = lnumber_value(CAR(args));
      args = lcdr(args);
      const y1 = lnumber_value(CAR(args));
      args = lcdr(args);
      const x2 = lnumber_value(CAR(args));
      args = lcdr(args);
      const y2 = lnumber_value(CAR(args));
      args = lcdr(args);
      const c = lnumber_value(CAR(args));
      const [cx1, cy1] = G.the_game.game_to_mouse(x1, y1, L.current_view!);
      const [cx2, cy2] = G.the_game.game_to_mouse(x2, y2, L.current_view!);
      G.screen.line(cx1, cy1, cx2, cy2, c);
      return 1;
    }
    case 93: return G.wm.dark_color();
    case 94: return G.wm.medium_color();
    case 95: return G.wm.bright_color();
    case 99: o.remove_object(lpointer_value(CAR(args)) as game_object); return 1;
    case 100: o.add_light(lpointer_value(CAR(args)) as light_source); return 1;
    case 101: o.remove_light(lpointer_value(CAR(args)) as light_source); return 1;
    case 102: return o.total_objects();
    case 103: return o.total_lights();
    case 104: case 105: case 106: case 107: case 108: case 109: {
      const l = lpointer_value(CAR(args)) as light_source;
      const x = lnumber_value(CAR(CDR(args)));
      if (number === 104) { if (x >= 1) l.inner_radius = x; }
      else if (number === 105) { if (x > l.inner_radius) l.outer_radius = x; }
      else if (number === 106) l.x = x;
      else if (number === 107) l.y = x;
      else if (number === 108) l.xshift = x;
      else l.yshift = x;
      l.calc_range();
      return 1;
    }
    case 110: return (lpointer_value(CAR(args)) as light_source).inner_radius;
    case 111: return (lpointer_value(CAR(args)) as light_source).outer_radius;
    case 112: return (lpointer_value(CAR(args)) as light_source).x;
    case 113: return (lpointer_value(CAR(args)) as light_source).y;
    case 114: return (lpointer_value(CAR(args)) as light_source).xshift;
    case 115: return (lpointer_value(CAR(args)) as light_source).yshift;
    case 116: return o.xacel();
    case 117: return o.yacel();
    case 118: G.current_level.remove_light(lpointer_value(CAR(args)) as light_source); break;
    case 119: o.set_fx(lnumber_value(CAR(args))); break;
    case 120: o.set_fy(lnumber_value(CAR(args))); break;
    case 121: o.set_fxvel(lnumber_value(CAR(args))); break;
    case 122: o.set_fyvel(lnumber_value(CAR(args))); break;
    case 123: o.set_fxacel(lnumber_value(CAR(args))); break;
    case 124: o.set_fyacel(lnumber_value(CAR(args))); break;
    case 125: return o.picture().w;
    case 126: return o.picture().h;
    case 127: dprintf('trap\n'); break;
    case 128: return G.current_level.platform_push(o, lnumber_value(CAR(args)), lnumber_value(CAR(CDR(args))));
    case 133: {
      let s: LSymbol | null = null;
      if (CDR(args)) {
        s = lcar(args) as LSymbol;
        if (item_type(s) !== L_SYMBOL) lbreak('expecting first arg to def-character to be a symbol!\n');
        args = CDR(args);
      }
      const id = cache.reg(lstring_value(lcar(args)), null, SPEC_EXTERN_SFX, 1);
      if (s) set_number(s, id);
      return id;
    }
    case 134: {
      let a = args;
      const id = lnumber_value(lcar(a));
      if (id < 0) return 0;
      a = CDR(a);
      if (!a) cache.sfx(id).play(127);
      else {
        const vol = lnumber_value(lcar(a));
        a = CDR(a);
        if (a) {
          const x = lnumber_value(lcar(a));
          a = CDR(a);
          if (!a) {
            print(args);
            lbreak('expecting y after x in play_sound\n');
          }
          const y = lnumber_value(lcar(a));
          G.the_game.play_sound(id, vol, x, y);
        } else cache.sfx(id).play(vol);
      }
      break;
    }
    case 137: return defun_pseq(args);
    case 138: {
      const id = lnumber_value(CAR(args));
      args = CDR(args);
      const x = lnumber_value(CAR(args));
      args = CDR(args);
      const y = lnumber_value(CAR(args));
      args = CDR(args);
      const dir = lnumber_value(CAR(args));
      add_panim(id, x, y, dir);
      break;
    }
    case 142: {
      const x = lnumber_value(CAR(args));
      if (x < 0 || x >= W.total_weapons) lbreak(`weapon out of range (${x})\n`);
      return W.weapon_types[x];
    }
    case 143: {
      const x = lnumber_value(CAR(args));
      args = CDR(args);
      const y = lnumber_value(CAR(args));
      args = CDR(args);
      const r = lnumber_value(CAR(args));
      args = CDR(args);
      const m = lnumber_value(CAR(args));
      args = CDR(args);
      const ex = lpointer_value(CAR(args)) as game_object | null;
      args = CDR(args);
      const mp = lnumber_value(CAR(args));
      G.current_level.hurt_radius(x, y, r, m, o, ex, mp);
      break;
    }
    case 144: {
      const v = o.controller();
      if (!v) dprintf("Can't add weapons for non-players\n");
      else {
        const x = lnumber_value(CAR(args));
        args = CDR(args);
        const y = lnumber_value(CAR(args));
        if (x < 0 || x >= W.total_weapons) lbreak(`weapon out of range (${x})\n`);
        v.add_ammo(x, y);
      }
      break;
    }
    case 145: {
      const v = o.controller();
      return v ? v.weapon_total(lnumber_value(CAR(args))) : 0;
    }
    case 146: {
      const v = o.controller();
      return v ? v.current_weapon : 0;
    }
    case 147: {
      const v = o.controller();
      if (!v) lbreak('current_weapon_type : object cannot hold weapons\n');
      return v!.current_weapon;
    }
    case 148: return lnumber_value(CAR(args)) & BLOCKED_UP;
    case 149: return lnumber_value(CAR(args)) & BLOCKED_DOWN;
    case 150: {
      const v = o.controller();
      const x = lnumber_value(CAR(args));
      if (x < 0 || x >= W.total_weapons) lbreak(`weapon out of range (${x})\n`);
      if (v) v.give_weapon(x);
      break;
    }
    case 151: {
      const a = lnumber_value(CAR(args));
      if (a < 0 || a >= TOTAL_ABILITIES) lbreak('bad ability number for get_ability\n');
      return get_ability(o.otype, a);
    }
    case 152: {
      const v = o.controller();
      if (!v) dprintf("Can't use reset_player on non-players\n");
      else v.reset_player();
      break;
    }
    case 153: {
      const t = lpointer_value(CAR(args)) as game_object;
      const x = (t.x - o.x) | 0;
      const y = -((t.y - ((t.picture().h / 2) | 0) - (o.y - ((o.picture().h / 2) | 0))) | 0) | 0;
      return lisp_atan2(y, x);
    }
    case 154: {
      const ang = lnumber_value(CAR(args));
      args = CDR(args);
      const mag = lfixed_point_value(CAR(args)) | 0;
      const xvel = Math.imul(lisp_cos(ang) >> 8, mag >> 8);
      o.set_xvel(xvel >> 16);
      o.set_fxvel((xvel & 0xffff) >> 8);
      const yvel = Math.imul(-(lisp_sin(ang) >> 8), mag >> 8);
      o.set_yvel(yvel >> 16);
      o.set_fyvel((yvel & 0xffff) >> 8);
      break;
    }
    case 155: {
      const tframes = o.total_frames();
      let f: number;
      let ang1 = lnumber_value(CAR(args));
      args = CDR(args);
      if (ang1 < 0) ang1 = (ang1 % 360) + 360;
      else if (ang1 >= 360) ang1 = ang1 % 360;
      let ang2 = lnumber_value(CAR(args));
      args = CDR(args);
      if (ang2 < 0) ang2 = (ang2 % 360) + 360;
      else if (ang2 >= 360) ang2 = ang2 % 360;
      const ang = (lnumber_value(CAR(args)) + ((90 / tframes) | 0)) % 360;
      if (ang1 > ang2) {
        if (ang < ang1 && ang > ang2) return 0;
        else if (ang >= ang1) f = (((ang - ang1) * tframes) / (359 - ang1 + ang2 + 1)) | 0;
        else f = (((359 - ang1 + ang) * tframes) / (359 - ang1 + ang2 + 1)) | 0;
      } else if (ang < ang1 || ang > ang2) return 0;
      else f = (((ang - ang1) * tframes) / (ang2 - ang1 + 1)) | 0;
      if (o.direction > 0) o.current_frame = f;
      else o.current_frame = tframes - f - 1;
      return 1;
    }
    case 156: {
      const x = o.current_frame;
      o.set_state(lnumber_value(CAR(args)));
      o.current_frame = x;
      break;
    }
    case 168: return o.morph_status() ? 1 : 0;
    case 169: {
      const am = lnumber_value(CAR(args));
      args = CDR(args);
      const from = lpointer_value(CAR(args)) as game_object;
      args = CDR(args);
      const hitx = lnumber_value(CAR(args));
      args = CDR(args);
      const hity = lnumber_value(CAR(args));
      args = CDR(args);
      const px = lnumber_value(CAR(args));
      args = CDR(args);
      const py = lnumber_value(CAR(args));
      o.damage_fun(am, from, hitx, hity, px, py);
      break;
    }
    case 170: return o.gravity();
    case 171: {
      const v = o.controller();
      if (!v) dprintf('make_view_solid : object has no view\n');
      else v.draw_solid = lnumber_value(CAR(args));
      break;
    }
    case 172: {
      let a = args;
      const r = lnumber_value(CAR(a));
      a = CDR(a);
      const g = lnumber_value(CAR(a));
      a = CDR(a);
      const b = lnumber_value(CAR(a));
      if (r < 0 || b < 0 || g < 0 || r > 255 || g > 255 || b > 255) lbreak('color out of range (0..255) in color lookup\n');
      return G.color_table.Lookup(r >> 3, g >> 3, b >> 3);
    }
    case 173: case 174: case 175: case 176: case 177: {
      const v = o.controller();
      if (!v) {
        print(args);
        dprintf('get_player_inputs : object has no view!\n');
        return 0;
      }
      return [v.x_suggestion, v.y_suggestion, v.b1_suggestion, v.b2_suggestion, v.b3_suggestion][number - 173];
    }
    case 178: {
      G.bg_xmul = lnumber_value(CAR(args));
      args = CDR(args);
      G.bg_xdiv = lnumber_value(CAR(args));
      args = CDR(args);
      G.bg_ymul = lnumber_value(CAR(args));
      args = CDR(args);
      G.bg_ydiv = lnumber_value(CAR(args));
      if (G.bg_xdiv === 0) G.bg_xdiv = 1;
      if (G.bg_ydiv === 0) G.bg_ydiv = 1;
      break;
    }
    case 179: {
      const v = lget_view(CAR(args), 'set_ambient_light');
      args = CDR(args);
      const x = lnumber_value(CAR(args));
      if (x >= 0 && x < 64) v.ambient = x;
      break;
    }
    case 180: return lget_view(CAR(args), 'ambient_light').ambient;
    case 181: {
      const x = o.total_objects();
      const who = lpointer_value(CAR(args));
      for (let i = 0; i < x; i++) if (o.get_object(i) === who) return 1;
      return 0;
    }
    case 182: o.change_type(lnumber_value(CAR(args))); break;
    case 184: return o.current_frame;
    case 185: return o.fx();
    case 186: return o.fy();
    case 187: return o.fxvel();
    case 188: return o.fyvel();
    case 189: return o.fxacel();
    case 190: return o.fyacel();
    case 191: break;
    case 192: case 194: {
      const x = lnumber_value(CAR(args));
      args = CDR(args);
      const y = lnumber_value(CAR(args));
      args = CDR(args);
      const type = lnumber_value(CAR(args));
      const lv = G.current_level;
      const w = number === 192 ? lv.foreground_width() : lv.background_width();
      if (x < 0 || y < 0 || x >= w || y >= w) lbreak(`${x} ${y} is out of range of fg map`);
      else if (number === 192) lv.put_fg(x, y, type);
      else lv.put_bg(x, y, type);
      break;
    }
    case 193: case 195: {
      const x = lnumber_value(CAR(args));
      args = CDR(args);
      const y = lnumber_value(CAR(args));
      const lv = G.current_level;
      const w = number === 193 ? lv.foreground_width() : lv.background_width();
      if (x < 0 || y < 0 || x >= w || y >= w) lbreak(`${x} ${y} is out of range of fg map`);
      return number === 193 ? lv.get_fg(x, y) : lv.get_bg(x, y);
    }
    case 196: load_tiles(args); break;
    case 197: {
      const fp = open_file(lstring_value(CAR(args)), 'rb');
      if (fp.open_failure()) {
        fp.close();
        lbreak(`load_palette : could not open file ${lstring_value(CAR(args))} for reading`);
      } else {
        const sd = new spec_directory(fp);
        const se = sd.find_type(2);
        if (!se) lbreak(`File ${lstring_value(CAR(args))} has no palette!\n`);
        else G.pal = palette.fromFile(fp, se);
        fp.close();
      }
      break;
    }
    case 198: {
      const fp = open_file(lstring_value(CAR(args)), 'rb');
      if (fp.open_failure()) {
        fp.close();
        lbreak(`load_color_filter : could not open file ${lstring_value(CAR(args))} for reading`);
      } else {
        const sd = new spec_directory(fp);
        const se = sd.find_type(SPEC_COLOR_TABLE);
        if (!se) lbreak(`File ${lstring_value(CAR(args))} has no color filter!`);
        else G.color_table = ColorFilter.fromFile(se, fp);
        fp.close();
      }
      break;
    }
    case 199:
      L.current_start_type = lnumber_value(CAR(args)) & 0xffff;
      set_local_players(1);
      break;
    case 200: {
      let xv = lnumber_value(CAR(args));
      args = CDR(args);
      let yv = lnumber_value(CAR(args));
      args = CDR(args);
      let top = 2;
      if (args) if (!CAR(args)) top = 0;
      const oxv = xv, oyv = yv;
      [, xv, yv] = o.try_move(o.x, o.y, xv, yv, 1 | top);
      o.x = o.x + xv;
      o.y = o.y + yv;
      return oxv === xv && oyv === yv ? 1 : 0;
    }
    case 201: return figures[o.otype].get_sequence(lnumber_value(CAR(args))).length();
    case 202: {
      const x1 = lnumber_value(CAR(args));
      args = CDR(args);
      const y1 = lnumber_value(CAR(args));
      args = CDR(args);
      let x2 = lnumber_value(CAR(args));
      args = CDR(args);
      let y2 = lnumber_value(CAR(args));
      args = CDR(args);
      const block_all = CAR(args);
      const nx2 = x2, ny2 = y2;
      [x2, y2] = G.current_level.foreground_intersect(x1, y1, x2, y2);
      if (x2 !== nx2 || y2 !== ny2) return 0;
      if (block_all) [, x2, y2] = G.current_level.all_boundary_setback(o, x1, y1, x2, y2);
      else [, x2, y2] = G.current_level.boundary_setback(o, x1, y1, x2, y2);
      return x2 === nx2 && y2 === ny2 ? 1 : 0;
    }
    case 203: case 204: case 205: {
      const fn = lstring_value(CAR(args));
      args = CDR(args);
      const name = lstring_value(CAR(args));
      const id = cache.reg(fn, name, SPEC_IMAGE, 1);
      if (number === 203) G.big_font_pict = id;
      else if (number === 204) G.small_font_pict = id;
      else G.console_font_pict = id;
      break;
    }
    case 206: {
      const x = lnumber_value(CAR(args));
      if (x < o.total_frames()) o.current_frame = x;
      else lbreak(`${x} out of range for set_current_frame`);
      break;
    }
    case 208: o.draw_trans(lnumber_value(CAR(args)), lnumber_value(CAR(CDR(args)))); break;
    case 209: o.draw_tint(lnumber_value(CAR(args))); break;
    case 210: o.draw_predator(); break;
    case 211: return lget_view(CAR(args), 'shift_down').shift_right;
    case 212: return lget_view(CAR(args), 'shift_right').shift_down;
    case 213: {
      const v = lget_view(CAR(args), 'set_no_scroll_range');
      args = CDR(args);
      v.no_xleft = lnumber_value(CAR(args));
      args = CDR(args);
      v.no_ytop = lnumber_value(CAR(args));
      args = CDR(args);
      v.no_xright = lnumber_value(CAR(args));
      args = CDR(args);
      v.no_ybottom = lnumber_value(CAR(args));
      break;
    }
    case 215: {
      const fn = lstring_value(CAR(args));
      args = CDR(args);
      const name = lstring_value(CAR(args));
      return cache.reg(fn, name, SPEC_IMAGE, 1);
    }
    case 216: {
      const x1 = lnumber_value(CAR(args));
      args = lcdr(args);
      const y1 = lnumber_value(CAR(args));
      args = lcdr(args);
      const id = lnumber_value(CAR(args));
      cache.img(id).put_image(G.screen, x1, y1, 1);
      break;
    }
    case 217: case 218: case 219: case 220: {
      const v = o.controller();
      if (!v) lbreak('object has no view : view_x1');
      return [v!.cx1, v!.cy1, v!.cx2, v!.cy2][number - 217];
    }
    case 221: {
      const v = o.controller();
      if (!v) lbreak('object has no view : view_push_down');
      else v.last_y -= lnumber_value(CAR(args));
      break;
    }
    case 222: {
      const v = o.controller();
      if (!v) lbreak('object has no view : local_player');
      return v!.local_player();
    }
    case 223: G.current_level.save(lstring_value(CAR(args)), 1); break;
    case 224: o.set_hp(lnumber_value(CAR(args))); break;
    case 225: {
      const s = lstring_value(CAR(args));
      G.the_game.request_level_load(s.startsWith('save') ? `${get_save_filename_prefix()}${s}` : s);
      break;
    }
    case 226: G.level_file = lstring_value(CAR(args)); break;
    case 227: return cache.reg(lstring_value(CAR(args)), 'palette', SPEC_PALETTE, 1);
    case 228: {
      const p = G.pal.copy();
      const a = p.addr();
      const ra = lnumber_value(CAR(args));
      args = CDR(args);
      const ga = lnumber_value(CAR(args));
      args = CDR(args);
      const ba = lnumber_value(CAR(args));
      for (let i = 0; i < 256; i++) {
        const add = [ra, ga, ba];
        for (let k = 0; k < 3; k++) {
          let v = a[i * 3 + k] + add[k];
          if (v > 255) v = 255;
          else if (v < 0) v = 0;
          a[i * 3 + k] = v;
        }
      }
      palette_load(p);
      break;
    }
    case 229: {
      const v = o.controller();
      if (!v) lbreak('object has no view : local_player');
      return v!.player_number;
    }
    case 230: {
      const v = o.controller();
      if (!v) lbreak('object has no view : local_player');
      else {
        const x = lnumber_value(CAR(args));
        if (x < 0 || x >= W.total_weapons) lbreak(`weapon out of range (${x})\n`);
        v.current_weapon = x;
      }
      break;
    }
    case 231: {
      const v = o.controller();
      if (!v) lbreak('object has no view : local_player');
      return v!.has_weapon(lnumber_value(CAR(args)));
    }
    case 232: LG.ambient_ramp = ((LG.ambient_ramp + lnumber_value(CAR(args))) << 16) >> 16; break;
    case 233: {
      let x = 0;
      for (let v = L.player_list; v; v = v.next) x++;
      return x;
    }
    case 234: case 244: {
      const x1 = lnumber_value(CAR(args));
      args = lcdr(args);
      const y1 = lnumber_value(CAR(args));
      args = lcdr(args);
      const x2 = lnumber_value(CAR(args));
      args = lcdr(args);
      const y2 = lnumber_value(CAR(args));
      args = lcdr(args);
      const c1 = lnumber_value(CAR(args));
      args = lcdr(args);
      const c2 = number === 244 ? lnumber_value(CAR(args)) : 0;
      if (number === 244) args = lcdr(args);
      const s = lnumber_value(CAR(args));
      const [cx1, cy1] = G.the_game.game_to_mouse(x1, y1, L.current_view!);
      const [cx2, cy2] = G.the_game.game_to_mouse(x2, y2, L.current_view!);
      if (number === 234) scatter_line(cx1, cy1, cx2, cy2, c1, s);
      else ascatter_line(cx1, cy1, cx2, cy2, c1, c2, s);
      return 1;
    }
    case 235: return G.current_level ? G.current_level.tick_counter() | 0 : 0;
    case 236: return o.controller() !== null ? 1 : 0;
    case 237: R.rand_on = (R.rand_on + lnumber_value(CAR(args))) & 0xffff; return 1;
    case 238: return o.total_frames();
    case 239: G.current_level.to_front(o); break;
    case 240: G.current_level.to_back(o); break;
    case 241: case 242: {
      const v = o.controller();
      if (!v) {
        print(args);
        dprintf('get_player_inputs : object has no view!\n');
        return 0;
      }
      return number === 241 ? v.pointer_x : v.pointer_y;
    }
    case 243:
      if (L.player_list!.next || G.the_game.demo_state() !== 0) return 0;
      return G.frame_panic > 10 ? 1 : 0;
    case 245: return R.rand_on;
    case 246: R.rand_on = lnumber_value(CAR(args)) & 0xffff; break;
    case 247: {
      const cx1 = lnumber_value(CAR(args));
      args = lcdr(args);
      const cy1 = lnumber_value(CAR(args));
      args = lcdr(args);
      const cx2 = lnumber_value(CAR(args));
      args = lcdr(args);
      const cy2 = lnumber_value(CAR(args));
      args = lcdr(args);
      const c1 = lnumber_value(CAR(args));
      G.screen.bar(cx1, cy1, cx2, cy2, c1);
      break;
    }
    case 248: return G.start_argv.length;
    case 249:
      if (S.sound_avail & MUSIC_INITIALIZED) {
        const fn = lstring_value(CAR(args));
        if (G.current_song) {
          if (G.current_song.playing()) G.current_song.stop();
          G.current_song.destroy();
        }
        G.current_song = new song(fn);
        G.current_song.play(S.music_volume);
        dprintf(`Playing ${fn} at volume ${S.music_volume}\n`);
      }
      break;
    case 250:
      if (G.current_song && G.current_song.playing()) G.current_song.stop();
      if (G.current_song) G.current_song.destroy();
      G.current_song = null;
      break;
    case 251: return o.targetable();
    case 252: o.set_targetable(CAR(args) === null ? 0 : 1); break;
    case 253: show_stats(); break;
    case 254: case 255: case 256: case 257: case 258: case 259: case 260: case 261: {
      const v = o.controller();
      if (!v) {
        print(args);
        dprintf('get_player_inputs : object has no view!\n');
        return 0;
      }
      switch (number) {
        case 254: return v.kills;
        case 255: return v.tkills;
        case 256: return v.secrets;
        case 257: return v.tsecrets;
        case 258: v.kills = lnumber_value(CAR(args)); break;
        case 259: v.tkills = lnumber_value(CAR(args)); break;
        case 260: v.secrets = lnumber_value(CAR(args)); break;
        case 261: v.tsecrets = lnumber_value(CAR(args)); break;
      }
      break;
    }
    case 262: G.the_game.request_end(); break;
    case 263: {
      G.the_game.reset_keymap();
      return take_answer(async () => load_game(1, symbol_str('SAVE')));
    }
    case 264: dprintf('mem_report is deprecated\n'); break;
    case 265: return ENGINE_MAJOR;
    case 266: return ENGINE_MINOR;
    case 267: o.draw_double_tint(lnumber_value(CAR(args)), lnumber_value(CAR(CDR(args)))); break;
    case 268: return cache.img(lnumber_value(CAR(args))).w;
    case 269: return cache.img(lnumber_value(CAR(args))).h;
    case 270: return G.current_level.foreground_width();
    case 271: return G.current_level.foreground_height();
    case 272: return G.current_level.background_width();
    case 273: return G.current_level.background_height();
    case 274: return get_keycode(lstring_value(CAR(args)));
    case 275: {
      const id = lnumber_value(CAR(args));
      args = CDR(args);
      const x = lnumber_value(CAR(args));
      args = CDR(args);
      const y = lnumber_value(CAR(args));
      CUR.c_target = id;
      if (G.screen) G.wm.set_mouse_shape(cache.img(CUR.c_target).copy(), x, y);
      break;
    }
    case 276: return main_net_cfg ? 1 : 0; // become_server: the lobby made the room already
    case 277: {
      const fnt = lpointer_value(CAR(args)) as JCFont;
      args = CDR(args);
      const x = lnumber_value(CAR(args));
      args = CDR(args);
      const y = lnumber_value(CAR(args));
      args = CDR(args);
      const st = lstring_value(CAR(args));
      args = CDR(args);
      let color = -1;
      if (args) color = lnumber_value(CAR(args));
      fnt.put_string(G.screen, x, y, st, color);
      break;
    }
    case 278: return (lpointer_value(CAR(args)) as JCFont).width();
    case 279: return (lpointer_value(CAR(args)) as JCFont).height();
    case 280: G.the_game.chat_put_all(lstring_value(CAR(args))); break;
    case 281: {
      const v = o.controller();
      if (!v) lbreak('get_player_name : object has no view!\n');
      else v.name = lstring_value(CAR(args));
      break;
    }
    case 282: case 283: {
      const x1 = lnumber_value(CAR(args));
      args = CDR(args);
      const y1 = lnumber_value(CAR(args));
      args = CDR(args);
      const x2 = lnumber_value(CAR(args));
      args = CDR(args);
      const y2 = lnumber_value(CAR(args));
      args = CDR(args);
      const c = lnumber_value(CAR(args));
      if (number === 282) G.screen.bar(x1, y1, x2, y2, c);
      else G.screen.rectangle(x1, y1, x2, y2, c);
      break;
    }
    case 284: return G.the_game.get_option(lstring_value(CAR(args))) ? 1 : 0;
    case 288: G.the_game.set_delay(CAR(args) ? 1 : 0); break;
    case 289: set_login(lstring_value(CAR(args))); break;
    case 290: CL.chatting_enabled = 1; break;
    case 291: G.demo_start = 1; break;
    case 292:
      if (main_net_cfg && main_net_cfg.state === net_configuration.CLIENT) return 1;
      break;
    case 293:
      if (net_game()) {
        for (let v = L.player_list; v; v = v.next) if (v.kills >= main_net_cfg!.kills) return 1;
      } else return 0;
      break;
    case 294: {
      for (let v = L.player_list; v; v = v.next) {
        v.tkills += v.kills;
        v.kills = 0;
        const oo = L.current_object;
        L.current_object = v.focus!;
        eval_function(L.l_restart_player, null);
        v.reset_player();
        v.focus!.set_aistate(0);
        L.current_object = oo;
      }
      break;
    }
    case 295: CL.game_name = lstring_value(CAR(args)).slice(0, 49); break;
    case 296: if (main_net_cfg) main_net_cfg.min_players = lnumber_value(CAR(args)); break;
    case 1001: if (o.Controller) o.Controller.set_tint(lnumber_value(CAR(args))); else o.set_tint(lnumber_value(CAR(args))); break;
    case 1002: return o.Controller ? o.Controller.get_tint() : o.get_tint();
    case 1003: if (o.Controller) o.Controller.set_team(lnumber_value(CAR(args))); else o.set_team(lnumber_value(CAR(args))); break;
    case 1004: return o.Controller ? o.Controller.get_team() : o.get_team();
    default:
      dprintf(`Undefined c function ${number}\n`);
      return 0;
  }
  return 0;
}

export function l_obj_get(number: number): LObj {
  const t = figures[cur().otype];
  if (t.tiv <= number || !t.vars[number]) lbreak('access : variable does not exsist for this class\n');
  return new LNumber(cur().lvars![t.var_index[number]]);
}

export function l_obj_set(number: number, arg: LObj): void {
  const t = figures[cur().otype];
  if (t.tiv <= number || !t.vars[number]) lbreak('set : variable does not exsist for this class\n');
  cur().lvars![t.var_index[number]] = lnumber_value(arg);
}

export function l_obj_print(number: number): void {
  const t = figures[cur().otype];
  if (t.tiv <= number || !t.vars[number]) lbreak('access : variable does not exsist for this class\n');
  dprintf(String(cur().lvars![t.var_index[number]]));
}

/** connects the interpreter to the game (lisp_init calls clisp_init through these) */
export function clisp_connect(status?: { push(s: string): void; update(p: number): void; pop(): void }): void {
  set_lisp_hooks({
    c_caller, l_caller, l_obj_get, l_obj_set, l_obj_print, clisp_init,
    status_push: status ? (s) => status.push(s) : undefined,
    status_update: status ? (p) => status.update(p) : undefined,
    status_pop: status ? () => status.pop() : undefined,
  });
}

export { LD };
void DEFINEDP;
