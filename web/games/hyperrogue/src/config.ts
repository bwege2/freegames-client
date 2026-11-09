// config.cpp of HyperRogue 13.1o: the parameter system (struct parameter and its kinds, param_*, add_edit,
// find_edit, the settings search), initConfig (every parameter of config.cpp and multi.cpp's player settings),
// the configuration file hyperrogue.ini (saveConfig, loadConfig, resetConfig), the settings screens of the 2D game
// (showSettings, interface, dialogs, HUD, graphics, screen, vector, animation speed, special effects, other,
// sight range, mouse, colours, the character), and the command line options of the configuration.
// Packages: P8 (stage 1: the defaults and the command line), U4 (stage 2: everything else).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Where a parameter's value lives: C++ keeps a reference (`T& val`) and compares addresses (`affects(void*)`,
// `find_edit(&x)`, `add_edit(x)`). The port keeps a `pref` (an object and a key) and compares those:
// `add_edit(V('grid'))` is `add_edit(vid.grid)`, `add_edit(P('menu_darkening'))` is `add_edit(menu_darkening)`.
// `params` is a std::map: iterated in the order of the names (saveConfig writes them in that order).
// `cld` (the complex value of a parameter) is a real number here: every parameter of the port is real.
//
// Not registered (their variables belong to stage-3 features that the port does not have yet; a line of
// hyperrogue.ini naming them gets the original's "unknown config variable" warning and is dropped): the
// line patterns and rulers, apeirogons and the tessellation converter, aperiodic hats, fake geometries,
// Euclidean embeddings and the 3D embedding switches, the rug's own settings, crystals, textures, irregular
// tilings but their cell count, Solv/SL2/Nil/Asonov/product settings, Archimedean symbols, animations, the
// canvas colourings (ccolor::all, "pattern", "canvas:*"), the tour, the sky, the parameters of other files
// (screenshot.cpp, history.cpp, floorshapes.cpp, racing.cpp, ...). The keys and joysticks of the configured input
// (multi::sconfig_savers) are registered by multi.ts. local_parameter_set (other games' parameter sets) is not ported.
import { G, pconf, videopar, projection_configuration } from './globals.ts';
import { GEN_F, GEN_M, addHook, callhooks, NotPorted, hr_exception, isize, among, VER, VERNUM_HEX } from './hyper.ts';
import {
  landtypes, motypes, ittypes, walltypes, minf, iinf, winf, moPrincess, itCoral, itPalace, itRoyalJelly,
  moPlayer, waMineMine, waMineUnknown, laBrownian, laIce, laCanvas, laMinefield, laTortoise,
} from './content.ts';
import { lsNiceWalls, ls_nice_walls, ls_std_chaos } from './landlock.ts';
import { los_none } from './environment.ts';
import { dshTiles } from './cell.ts';
import { parseint, parseld, parsecolor, parsecolortable, parsematrix, hr_parse_exception, eval_programmable_string, appears, util_late } from './util.ts';
import {
  arg_argis, arg_shift, arg_args, arg_argcs, arg_argi, arg_argcolor, arg_shift_arg_formula, arg_launch_dialog,
  PHASE, PHASEFROM,
} from './commandline.ts';
import {
  stop_game_and_switch_mode, rg_nothing, rg_shmup, rg_randpattern, rg_inv, rg_chaos, rg_dualmode, rg_peace,
  rg_tour, rg_yendor, rg_tactic, rg_heptagons, stop_game, start_game, set_geometry, set_variation,
} from './system.ts';
import { switchHardcore, switchHardcore_quiet, switchLOS_quiet, showGraphQuickKeys, enable_cheat } from './menus.ts';
import { apply_memory_reserve, show_memory_menu } from './savemem.ts';
import { hyperbolic, sphere, euclid, BITRUNCATED, mdDisk, gNormal, GDIM, WDIM, ginf, qELLIPTIC, gcSphere,
  gcEuclid, gcSL2, gcHyperbolic, gArchimedean, gBinary3, gCubeTiling, gCell120, gECell120, gRhombic3, gBitrunc3,
  gOctTet3, gSpace534, gSpace435, gCell5, gCell8, gECell8, gCell16, gECell16, gCell24, gECell24, gCell600, gECell600,
  gHoroTris, gHoroRec, gHoroHex, gKiteDart3, gField435, gField534, gSol, gNil, gNIH, gSolN, gCrystal344, gSpace344,
  gSpace336, eVariation, mdLiePerspective, mdPerspective, mdGeodesic } from './classes.ts';
import { tan_auto, atan_auto, type transmatrix, cspin, eqmatrix, M_PI, TAU, degree, tmul } from './hyperpoint.ts';
import { XLAT, XLAT1, spM, spI, NUMLAN, language_load_all } from './language.ts';
import { transcompleteness } from './language-data.ts';
import { geom3_apply_settings_light, propagate_scale_change, check_cgi, cgi, geom3_actual_wall_height,
  geom3_factor_to_projection, geom3_to_wh } from './geometry.ts';
import { its, fts, itsh6, itsh8, format } from './hprint.ts';
import { type Ref, idiv } from './cpp.ts';
import { cfs, fopen, fclose, fputs, printf, exit } from './cfile.ts';
import { addMessage, compute_fsize, font_filenames, font_names, apply_screen_settings, need_to_apply_screen_settings,
  do_request_resolution_change, sOFF, sAnaglyph, sLR, sODS, sPanini, sStereographic } from './basegraph.ts';
import {
  dialog_init_t, dialog_addItem, dialog_addSelItem, dialog_addBoolItem, dialog_addColorItem, dialog_addMatrixItem,
  dialog_addHelp_s, dialog_addInfo, dialog_addBreak, dialog_addBack, dialog_display, dialog_add_action,
  dialog_add_action_push, dialog_add_action_confirmed, dialog_lastItem, dialog_get_di, dialog_get_ne,
  dialog_editNumber, dialog_editNumber_n, dialog_editBool, dialog_edit_string, dialog_openFileDialog,
  dialog_openColorDialog, dialog_editMatrix, dialog_is_highlight, dialog_handleNavigation, dialog_bound_low,
  dialog_bound_up, dialog_scale_given, dialog_scaleLog, dialog_scaleSinh100, dialog_start_list, dialog_end_list,
  dialog_hasInfix, dialog_editInfix, dialog_setting_keyboard, dialog_addBoolItem_action,
  dialog_never_keys, dialog_number_dialog, ONOFF,
} from './dialogs.ts';
import { gamescreen, popScreen, sm, allowIncreasedSight, allowChangeRange } from './graph.ts';
import { pushScreen, doexiton, stub_screen_pop } from './control.ts';
import { updateglyphpinned, draw_crosshair } from './hud.ts';
import { checkmove } from './checkmove.ts';
import { getDistLimit } from './cell.ts';
import { gp_dist_2 } from './goldberg.ts';
import { doOvergenerate } from './landgen.ts';
import { hiitemsMax } from './yendor.ts';
import { playershapes, pshGUARD, pshPrincess, pshRatling, pshSkeleton, pshHyperbug, pshRogue } from './graph-player.ts';
import { drawMonsterType } from './graph-monster.ts';
import { NOCOLOR } from './colors.ts';
import { initquickqueue, quickqueue } from './drawing.ts';
import { atscreenpos, flat_model_enabler } from './hypgraph.ts';
import { numplayers } from './pcmove.ts';
import { special_colortable_for, prairie_colors, mountain_colors, tower_colors, westwall_colors, endorian_colors,
  canopy_colors, camelot_cheat_colors } from './celldrawer.ts';
import { minecolors, distcolors } from './graph-wall.ts';
import { quit_options } from './quit.ts';
import { gamestack_pushed, gamestack_pop, dual_disable } from './multigame.ts';
import { geom3_apply_always3 } from './embeddings.ts';
import { polygonal_solve, models_quick_model, register_models } from './models.ts';
import { menuitem_change_variation, menuitem_change_geometry, menuitem_binary_width, current_proj_name } from './geom-exp.ts';
import { bow_crossbow_mode } from './crossbow.ts';
import { multi_configure, multi_initConfig } from './multi.ts';
import { rand } from './rand.ts';
import { SDLK_F1, SDLK_F2, SDLK_F6 } from './sdl.ts';
import { Mix_VolumeMusic } from './sdlmixer.ts';

/** key_type (an int: a character or an SDL keycode) */
export type key_type = number;
const K = (c: string): number => c.charCodeAt(0);
type reaction_t = () => void;

// EX eCentering centering: G.centering
// EX function<bool()> auto_restrict: G.auto_restrict

/** EX bool return_false() */
export function return_false(): boolean { return false; }

// EX bool use_bool_dialog, unlock_all, linked_consequence, hr_hud_enabled = true, higher_contrast: G.*

/** EX void adjust_linked() (geometry.cpp's prepare_compute3 calls it). Two of vid.depth, vid.camera and
 *  pconf.alpha determine the third, by the vid.tc_* order (desktop defaults: depth is computed). */
export function adjust_linked(): void {
  // indenter ind(2);
  G.geom3_invalid = '';
  const lc = G.linked_consequence; G.linked_consequence = true;
  try {
    const vid = G.vid;
    if (vid.tc_alpha < vid.tc_depth && vid.tc_alpha < vid.tc_camera) {
      find_edit(PC('alpha'))!.set_cld(tan_auto(vid.depth) / tan_auto(vid.camera));
    }
    else if (vid.tc_depth < vid.tc_alpha && vid.tc_depth < vid.tc_camera) {
      let v = pconf().alpha * tan_auto(vid.camera);
      if (hyperbolic() && (v < 1e-6 - 12 || v > 1 - 1e-12)) {
        G.geom3_invalid = XLAT('cannot adjust depth');
        v = vid.camera;
      }
      else v = atan_auto(v);
      find_edit(V('depth'))!.set_cld(v);
    }
    else {
      let v = tan_auto(vid.depth) / pconf().alpha;
      if (hyperbolic() && (v < 1e-12 - 1 || v > 1 - 1e-12)) {
        G.geom3_invalid = XLAT('cannot adjust camera');
        v = vid.depth;
      }
      else v = atan_auto(v);
      find_edit(V('camera'))!.set_cld(v);
    }
  }
  finally { G.linked_consequence = lc; }
}

/** EX void update_linked(int& t) (t: the vid.tc_* field) */
export function update_linked(t: 'tc_alpha' | 'tc_depth' | 'tc_camera'): void {
  if (G.linked_consequence) return;
  G.vid[t] = G.ticks;
  adjust_linked();
}

/** EX void non_editable_pre() / non_editable_post() */
export function non_editable_pre(): void { if (G.game_active) stop_game(); }
export function non_editable_post(): void { if (!G.delayed_start) start_game(); }

// --- the parameters ---

/** a reference to a variable (C++ `T&`): an object and a key. Equal references are the same variable. */
export class pref<T> implements Ref<T> {
  readonly o: Record<string | number, unknown>;
  readonly k: string | number;
  constructor(o: object, k: string | number) { this.o = o as Record<string | number, unknown>; this.k = k; }
  get v(): T { return this.o[this.k] as T; }
  set v(x: T) { this.o[this.k] = x; }
  same(r: pref<unknown>): boolean { return this.o === r.o && this.k === r.k; }
}
/** a variable of G */
export const P = <K extends keyof typeof G>(k: K): pref<(typeof G)[K]> => new pref(G, k);
/** a field of vid (G.vid is never replaced: `vid = x` is videopar.assign) */
export const V = <K extends keyof videopar>(k: K): pref<videopar[K]> => new pref(G.vid, k);
/** a field of pconf (vid.projection_config) */
export const PC = <K extends keyof projection_configuration>(k: K): pref<projection_configuration[K]> => new pref(G.vid.projection_config, k);
/** an element of an array (or a field of any object) */
export const E = <T>(o: object, k: string | number): pref<T> => new pref<T>(o, k);

/** struct param_exception */
export class param_exception extends hr_exception {
  which: parameter | null;
  constructor(s = 'param_exception', p: parameter | null = null) { super(s); this.which = p; }
}

/** struct parameter_names: `string s` gives name = param_esc(s), legacy_config_name = s; a pair [p, s] gives
 *  name = p, legacy_config_name = s */
export type parameter_names = string | [string, string];
function pn_name(n: parameter_names): string { return typeof n === 'string' ? param_esc(n) : n[0]; }
function pn_legacy(n: parameter_names): string { return typeof n === 'string' ? n : n[1]; }

/** struct parameter */
export abstract class parameter {
  restrict: (() => boolean) | null;
  name = '';
  legacy_config_name = '';
  menu_item_name = '';
  menu_item_name_modified = false;
  help_text = '';
  pre_reaction: reaction_t | null = null;
  reaction: reaction_t | null = null;
  default_key: key_type = 0;
  is_editable = false;
  needs_confirm = false;
  sets: reaction_t | null = null;
  available(): boolean { if (this.restrict) return this.restrict(); return true; }
  affects(_v: pref<unknown>): boolean { return false; }
  /** show_edit_option() / show_edit_option(key) */
  show_edit_option(key: key_type = this.default_key): void {
    void key;
    // println(hlog, "warning: no edit option defined for ", name);
  }
  search_key(): string {
    return this.name + '|' + this.legacy_config_name + '|' + this.menu_item_name + '|' + this.help_text;
  }
  constructor() { this.restrict = G.auto_restrict; this.is_editable = false; this.needs_confirm = false; }
  be_non_editable(): this {
    this.pre_reaction = non_editable_pre;
    this.reaction = non_editable_post;
    return this;
  }
  check_change(): void { }
  set_sets(s: reaction_t): this { this.sets = s; return this; }
  set_extra(r: reaction_t): this {
    const s = this.sets; this.set_sets(() => { if (s) s(); dialog_get_di().extra_options = r; }); return this;
  }
  set_reaction(r: reaction_t): this { this.reaction = r; return this; }
  set_pre_reaction(r: reaction_t): this { this.pre_reaction = r; return this; }
  load_from_animation(s: string): boolean { this.load(s); return false; }
  load_as_animation(s: string): void { this.load(s); }
  anim_unchanged(): boolean { return true; }
  anim_restore(): void { }
  get_cld(): number { throw new param_exception('parameter has no complex value', this); }
  set_cld_raw(_x: number): void { throw new param_exception('parameter has no complex value', this); }
  set_cld(value: number): void {
    const bak = this.get_cld();
    if (value !== bak && this.pre_reaction) this.pre_reaction();
    this.set_cld_raw(value);
    if (value !== bak && this.reaction) this.reaction();
  }
  abstract save(): string;
  load(_s: string): void { throw new param_exception('parameter cannot be loaded', this); }
  abstract dosave(): boolean;
  abstract reset(): void;
  abstract swap_with(p: parameter): void;
  setup(n: parameter_names): void {
    this.name = pn_name(n);
    this.legacy_config_name = pn_legacy(n);
    this.menu_item_name = pn_legacy(n);
    this.menu_item_name_modified = false;
    // if(params.count(name)) println(hlog, "ERROR: repeated parameter name ", name);
    params.set(this.name, this);
    sorted_cache = null;
  }
}

/** EX paramlist params (map<string, shared_ptr<parameter>>): use sorted_params() where the order matters */
export const params = new Map<string, parameter>();
let sorted_cache: parameter[] | null = null;
/** the parameters in the order of std::map (the names, bytewise) */
export function sorted_params(): parameter[] {
  if (!sorted_cache) {
    const keys = [...params.keys()].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    sorted_cache = keys.map((k) => params.get(k)!);
  }
  return sorted_cache;
}

/** anims::animate_parameter (animations: stage 3; without an animation running it does nothing) */
function anims_animate_parameter(_p: parameter, _s: string): void { }

/** struct list_parameter */
export abstract class list_parameter extends parameter {
  manual_reaction: reaction_t | null = null;
  abstract get_value(): number;
  abstract set_value(i: number): void;
  options: [string, string][] = [];
  extras: reaction_t | null = null;
  editable(o: [string, string][], menu_item_name: string, key: key_type): this {
    this.is_editable = true;
    this.options = o;
    this.menu_item_name = menu_item_name;
    this.menu_item_name_modified = true;
    this.default_key = key;
    return this;
  }
  add_extra(r: reaction_t): this {
    if (this.extras) { const e = this.extras; this.extras = () => { e(); r(); }; }
    else this.extras = r;
    return this;
  }
  override show_edit_option(key: key_type = this.default_key): void {
    let opt: string;
    if (this.get_value() < 0 || this.get_value() >= isize(this.options)) opt = its(this.get_value());
    else opt = this.options[this.get_value()][0];
    dialog_addSelItem(XLAT(this.menu_item_name), XLAT(opt), key);
    const screen = (): void => {
      add_to_changed(this);
      G.cmode = sm.SIDE | sm.MAYDARK;
      gamescreen();
      dialog_init_t(XLAT(this.menu_item_name));
      dialog_addBreak(100);
      const q = isize(this.options);

      const need_list = q > 15 ? 2 : q > 10 ? 1 : 0;

      if (need_list >= 2) dialog_start_list(1500, 1500, K('a'));
      for (let i = 0; i < q; i++) {
        dialog_addBoolItem(XLAT(this.options[i][0]), this.get_value() === i, need_list >= 2 ? G.dialog_list_fake_key++ : K('a') + i);
        const action = (): void => {
          if (this.pre_reaction) this.pre_reaction(); this.set_value(i); if (need_list === 0) popScreen();
          if (this.manual_reaction) this.manual_reaction(); if (this.reaction) this.reaction();
        };
        if (this.needs_confirm)
          dialog_add_action_confirmed(action);
        else
          dialog_add_action(action);
        if (need_list === 0 && this.options[i][1] !== '') {
          dialog_addBreak(100);
          dialog_addHelp_s(XLAT(this.options[i][1]));
          dialog_addBreak(100);
        }
      }
      if (need_list >= 2) dialog_end_list();
      dialog_addBreak(100);

      // options[get_value()] (out of range: undefined behaviour in C++; nothing here)
      const cur = this.options[this.get_value()];
      if (need_list >= 1 && cur && cur[1] !== '') {
        const text = cur[1];
        dialog_addHelp_s(XLAT(text));
        dialog_addBreak(100);
      }

      if (this.extras) this.extras();
      dialog_addBack();
      dialog_display();
    };
    dialog_add_action_push(screen);
  }
}

/** template<class T> struct enum_parameter (T: an enum, stored as a number; or a bool, `is_bool`) */
export class enum_parameter extends list_parameter {
  value!: pref<number | boolean>;
  last_value: number | boolean = 0;
  dft: number | boolean = 0;
  anim_value: number | boolean = 0;
  /** the stored type is bool (nisot::geodesic_movement, neon_nofill) */
  is_bool = false;
  private conv(i: number): number | boolean { return this.is_bool ? i !== 0 : i; }
  get_value(): number { return Number(this.value.v); }
  set_value_to: (v: number | boolean) => void = () => { };
  set_value(i: number): void { this.set_value_to(this.conv(i)); }
  override affects(v: pref<unknown>): boolean { return this.value.same(v); }
  load_from_raw(s: string): void {
    const N = isize(this.options);
    for (let i = 0; i < N; i++) if (appears(this.options[i][0], s)) {
      this.set_value_to(this.conv(i));
      return;
    }
    this.value.v = this.conv(parseint(s));
  }
  override check_change(): void {
    if (this.value.v !== this.last_value) {
      this.last_value = this.value.v;
      add_to_changed(this);
    }
  }
  override load(s: string): void {
    const bak = this.value.v;
    this.load_from_raw(s);
    if (this.value.v !== bak && this.pre_reaction) { const nv = this.value.v; this.value.v = bak; this.pre_reaction(); this.value.v = nv; }
    if (this.value.v !== bak && this.reaction) this.reaction();
  }
  override load_from_animation(s: string): boolean {
    if (this.anim_value !== this.value.v) return false;
    this.load(s);
    const changed = this.anim_value !== this.value.v;
    this.anim_value = this.value.v;
    return changed;
  }
  override load_as_animation(s: string): void {
    this.load(s);
    this.anim_value = this.value.v;
    anims_animate_parameter(this, s);
  }
  set_need_confirm(): this { this.needs_confirm = true; return this; }
  override get_cld(): number { return this.get_value(); }
  dosave(): boolean { return this.value.v !== this.dft; }
  reset(): void { this.value.v = this.dft; }
  save(): string { return its(Number(this.value.v)); }
  swap_with(s: parameter): void { const o = (s as enum_parameter).value; const t = this.value.v; this.value.v = o.v; o.v = t; }
}

/** template<class T> struct val_parameter */
export abstract class val_parameter<T> extends parameter {
  value!: pref<T>;
  last_value!: T;
  anim_value!: T;
  dft!: T;
  /** `a != b` of T */
  ne(a: T, b: T): boolean { return a !== b; }
  /** `*r = b` of T (in place for matrices) */
  assign(r: pref<T>, b: T): void { r.v = b; }
  copy(a: T): T { return a; }
  dosave(): boolean { return this.ne(this.value.v, this.dft); }
  reset(): void { this.assign(this.value, this.dft); }
  override affects(v: pref<unknown>): boolean { return this.value.same(v); }
  override check_change(): void {
    if (this.ne(this.value.v, this.last_value)) {
      this.last_value = this.copy(this.value.v);
      add_to_changed(this);
    }
  }
  override anim_unchanged(): boolean { return !this.ne(this.value.v, this.anim_value); }
  override anim_restore(): void { this.assign(this.value, this.anim_value); if (this.reaction) this.reaction(); }
  load_from_raw(_s: string): void { throw new param_exception('load_from_raw not defined', this); }
  override load(s: string): void {
    const bak = this.copy(this.value.v);
    this.load_from_raw(s);
    if (this.ne(this.value.v, bak) && this.pre_reaction) {
      const nv = this.copy(this.value.v); this.assign(this.value, bak); this.pre_reaction(); this.assign(this.value, nv);
    }
    if (this.ne(this.value.v, bak) && this.reaction) this.reaction();
  }
  override load_from_animation(s: string): boolean {
    if (this.ne(this.anim_value, this.value.v)) return false;
    this.load(s);
    const changed = this.ne(this.anim_value, this.value.v);
    this.anim_value = this.copy(this.value.v);
    return changed;
  }
  override load_as_animation(s: string): void {
    this.load(s);
    this.anim_value = this.copy(this.value.v);
    anims_animate_parameter(this, s);
  }
  swap_with(s: parameter): void {
    const o = (s as val_parameter<T>).value; const t = this.copy(this.value.v);
    this.assign(this.value, o.v); this.assign(o, t);
  }
}

/** use_the_default_value (geometry.cpp's constant; float_parameter_dft) */
export const use_the_default_value = -20.0625;

/** struct float_parameter */
export class float_parameter extends val_parameter<number> {
  min_value = 0; max_value = 0; step = 0;
  unit = '';
  editable(min_value: number, max_value: number, step: number, menu_item_name: string, help_text: string, key: key_type): this {
    this.is_editable = true;
    this.min_value = min_value;
    this.max_value = max_value;
    this.menu_item_name = menu_item_name;
    this.menu_item_name_modified = true;
    this.help_text = help_text;
    this.step = step;
    this.default_key = key;
    return this;
  }
  modify_me: ((p: float_parameter) => void) | null = null;
  modif(r: (p: float_parameter) => void): this { this.modify_me = r; return this; }
  override show_edit_option(key: key_type = this.default_key): void {
    if (this.modify_me) this.modify_me(this);
    dialog_addSelItem(XLAT(this.menu_item_name), fts(this.value.v) + this.unit, key);
    if (this.value.v === use_the_default_value) dialog_lastItem().value = XLAT('default');
    dialog_add_action(() => {
      add_to_changed(this);
      dialog_editNumber(this.value, this.min_value, this.max_value, this.step, this.dft, XLAT(this.menu_item_name), this.help_text);
      if (this.sets) this.sets();
      if (this.reaction) dialog_get_di().reaction = this.reaction;
      if (!this.is_editable) dialog_get_di().extra_options = non_editable;
    });
  }
  override load_from_raw(s: string): void { this.value.v = parseld(s); }
  override get_cld(): number { return this.value.v; }
  override set_cld_raw(x: number): void { this.value.v = x; }
  save(): string { return fts(this.value.v, 10); }
}

/** struct float_parameter_dft */
export class float_parameter_dft extends float_parameter {
  get_hint: () => number = () => 0;
  set_hint(f: () => number): this { this.get_hint = f; return this; }
  override show_edit_option(key: key_type = this.default_key): void {
    if (this.modify_me) this.modify_me(this);
    dialog_addSelItem(XLAT(this.menu_item_name), fts(this.value.v) + this.unit, key);
    if (this.value.v === use_the_default_value) dialog_lastItem().value = XLAT('default: ') + fts(this.get_hint());
    dialog_add_action(() => {
      add_to_changed(this);
      if (this.value.v === use_the_default_value) this.value.v = this.get_hint();
      dialog_editNumber(this.value, this.min_value, this.max_value, this.step, this.dft, XLAT(this.menu_item_name), this.help_text);
      if (this.sets) this.sets();
      if (this.reaction) dialog_get_di().reaction = this.reaction;
      if (!this.is_editable) dialog_get_di().extra_options = non_editable;
      const eo = dialog_get_di().extra_options;
      dialog_get_di().extra_options = () => {
        dialog_addSelItem(XLAT('use the default value'), '', K('D'));
        dialog_add_action(() => { this.value.v = use_the_default_value; });
        if (eo) eo();
      };
    });
  }
}

/** struct int_parameter */
export class int_parameter extends val_parameter<number> {
  min_value = 0; max_value = 0;
  step = 0;
  modify_me: ((p: int_parameter) => void) | null = null;
  modif(r: (p: int_parameter) => void): this { this.modify_me = r; return this; }
  override show_edit_option(key: key_type = this.default_key): void {
    if (this.modify_me) this.modify_me(this);
    dialog_addSelItem(XLAT(this.menu_item_name), its(this.value.v), key);
    dialog_add_action(() => {
      add_to_changed(this);
      dialog_editNumber_n(this.value, this.min_value, this.max_value, this.step, this.dft, XLAT(this.menu_item_name), this.help_text);
      if (this.sets) this.sets();
      if (this.reaction) dialog_get_di().reaction = this.reaction;
      if (!this.is_editable) dialog_get_di().extra_options = non_editable;
    });
  }
  editable(min_value: number, max_value: number, step: number, menu_item_name: string, help_text: string, key: key_type): this {
    this.is_editable = true;
    this.min_value = min_value;
    this.max_value = max_value;
    this.menu_item_name = menu_item_name;
    this.menu_item_name_modified = true;
    this.help_text = help_text;
    this.step = step;
    this.default_key = key;
    return this;
  }
  override get_cld(): number { return this.value.v; }
  override load_from_raw(s: string): void { this.value.v = parseint(s); }
  override set_cld_raw(x: number): void { this.value.v = Math.trunc(x + .5) | 0; }
  save(): string { return its(this.value.v); }
}

/** struct string_parameter */
export class string_parameter extends val_parameter<string> {
  editor: reaction_t | null = null;
  save(): string { return this.value.v; }
  override load_from_raw(s: string): void { this.value.v = s; }
  override show_edit_option(key: key_type = this.default_key): void {
    dialog_addSelItem(XLAT(this.menu_item_name), this.value.v, key);
    if (!this.editor) {
      if (dialog_is_highlight(G.dialog_items[G.dialog_items.length - 1])) G.mouseovers = XLAT('not editable');
    }
    else dialog_add_action(this.editor);
  }
  set_standard_editor(direct: boolean): this {
    const bak: Ref<string> = { v: '' };
    this.editor = () => {
      bak.v = this.value.v;
      dialog_edit_string(direct ? this.value : bak, this.menu_item_name, this.help_text);
      dialog_get_di().reaction = () => {
        if (!direct) if (this.pre_reaction) this.pre_reaction();
        if (!direct) this.value.v = bak.v;
        if (this.reaction) this.reaction();
      };
      if (this.sets) this.sets();
    };
    return this;
  }
  set_file_editor(ext: string): this {
    const bak: Ref<string> = { v: '' };
    this.editor = () => {
      bak.v = this.value.v;
      dialog_openFileDialog(bak, this.menu_item_name, ext, () => {
        if (this.pre_reaction) this.pre_reaction();
        this.value.v = bak.v;
        if (this.reaction) this.reaction();
        return true;
      });
    };
    return this;
  }
  editable(cap: string, help: string, key: key_type): this {
    this.is_editable = true;
    this.menu_item_name = cap;
    this.default_key = key;
    this.menu_item_name_modified = true;
    this.help_text = help;
    return this;
  }
}

/** struct bool_parameter */
export class bool_parameter extends val_parameter<boolean> {
  save(): string { return this.value.v ? 'yes' : 'no'; }
  switcher: reaction_t = () => { };
  editable(cap: string, key: key_type): this {
    this.is_editable = true;
    this.menu_item_name = cap; this.default_key = key;
    this.menu_item_name_modified = true;
    return this;
  }
  help(help: string): this {
    this.help_text = help;
    return this;
  }
  override show_edit_option(key: key_type = this.default_key): void {
    dialog_addBoolItem(XLAT(this.menu_item_name), this.value.v, key);
    if (dialog_is_highlight(G.dialog_items[G.dialog_items.length - 1]) && this.help_text !== this.menu_item_name) G.mouseovers = XLAT(this.help_text);
    dialog_add_action(() => {
      if (G.use_bool_dialog || G.hiliteclick) {
        const bd = dialog_editBool(this.value, this.dft, XLAT(this.menu_item_name), XLAT(this.help_text), this.switcher);
        if (this.sets) this.sets();
        if (this.reaction) bd.reaction = this.reaction;
        if (!this.is_editable) bd.extra_options = non_editable;
      }
      else {
        add_to_changed(this);
        this.switcher(); if (this.sets) this.sets();
        if (this.reaction) this.reaction();
      }
    });
  }
  override load_from_raw(s: string): void {
    if (s === 'yes') this.value.v = true;
    else if (s === 'no') this.value.v = false;
    else this.value.v = parseint(s) !== 0;
  }
  override get_cld(): number { return this.value.v ? 1 : 0; }
}

/** struct color_parameter */
export class color_parameter extends val_parameter<number> {
  has_alpha = false;
  override show_edit_option(key: key_type = this.default_key): void {
    dialog_addColorItem(XLAT(this.menu_item_name), this.has_alpha ? this.value.v : addalpha(this.value.v), key);
    dialog_add_action(() => {
      dialog_openColorDialog(this.value);
      G.dialog_colorAlpha = this.has_alpha;
      dialog_get_di().dialogflags |= sm.SIDE;
      if (this.sets) this.sets();
    });
  }
  editable(menu_item_name: string, help_text: string, key: key_type): this {
    this.is_editable = true;
    this.menu_item_name = menu_item_name;
    this.menu_item_name_modified = true;
    this.help_text = help_text;
    this.default_key = key;
    return this;
  }
  override get_cld(): number { return this.has_alpha ? this.value.v : (this.value.v * 256 + 0xFF) >>> 0; }
  override load_from_raw(s: string): void {
    try {
      this.value.v = parsecolor(s, this.has_alpha);
    } catch (e) {
      if (!(e instanceof hr_parse_exception)) throw e;
      // sscanf(s.c_str(), "%x", value): the hex digits at the start (none: the value stays)
      const m = /^\s*(0[xX])?([0-9a-fA-F]+)/.exec(s);
      if (m) this.value.v = Number(BigInt.asUintN(32, BigInt('0x' + m[2])));
    }
  }
  save(): string { return this.has_alpha ? itsh8(this.value.v) : itsh6(this.value.v); }
}

/** struct matrix_parameter (val_parameter<matrix_eq>: a transmatrix compared element by element; the value is
 *  copied into the variable's own array, which other structures may share) */
export class matrix_parameter extends val_parameter<transmatrix> {
  override ne(a: transmatrix, b: transmatrix): boolean {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (a[i][j] !== b[i][j]) return true;
    return false;
  }
  override assign(r: pref<transmatrix>, b: transmatrix): void {
    const a = r.v;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) a[i][j] = b[i][j];
  }
  override copy(a: transmatrix): transmatrix { return a.map((row) => [...row]); }
  override dosave(): boolean { return !eqmatrix(this.value.v, this.dft); }
  dim = 0;
  override show_edit_option(key: key_type = this.default_key): void {
    dialog_addMatrixItem(XLAT(this.menu_item_name), this.value, key, this.dim);
    dialog_add_action(() => {
      dialog_editMatrix(this.value, XLAT(this.menu_item_name), this.help_text, this.dim);
      if (this.sets) this.sets();
      if (this.reaction) dialog_get_di().reaction = this.reaction;
    });
  }
  editable(menu_item_name: string, help_text: string, key: key_type): this {
    this.is_editable = true;
    this.menu_item_name = menu_item_name;
    this.menu_item_name_modified = true;
    this.help_text = help_text;
    this.default_key = key;
    return this;
  }
  save(): string {
    // shstream ss; print(ss, "matrix "); for(...) print(ss, (*value)[a][b], " "); (print of an ld: fts)
    let s = 'matrix ';
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) s += fts(this.value.v[a][b]) + ' ';
    return s;
  }
  override load_from_raw(s: string): void {
    if (s.substring(0, 7) === 'matrix ') {
      // scan(ss, x): whitespace-separated numbers
      const parts = s.substring(7).trim().split(/\s+/);
      const M = this.value.v;
      let i = 0;
      for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
        const x = parts[i++];
        if (x !== undefined && x !== '') M[a][b] = Number.parseFloat(x);
      }
    }
    else {
      this.assign(this.value, parsematrix(s));
    }
  }
}

/** struct custom_parameter */
export class custom_parameter extends parameter {
  last_value = 0; anim_value = 0;
  custom_viewer: (key: key_type) => void = () => { };
  custom_value: () => number = () => 0;
  custom_set_value: ((x: number) => void) | null = null;
  custom_affect: (v: pref<unknown>) => boolean = () => false;
  custom_load: ((s: string) => void) | null = null;
  custom_save: (() => string) | null = null;
  custom_do_save: (() => boolean) | null = null;
  custom_reset: reaction_t | null = null;

  override show_edit_option(key: key_type = this.default_key): void { this.custom_viewer(key); }
  override affects(v: pref<unknown>): boolean { return this.custom_affect(v); }
  override check_change(): void {
    if (this.custom_value() !== this.last_value) {
      this.last_value = this.custom_value();
      add_to_changed(this);
    }
  }
  load_from_raw(s: string): void {
    if (!this.custom_load) {
      throw new param_exception('parameter cannot be loaded', this);
    }
    this.custom_load(s);
  }
  override load(s: string): void {
    const bak = this.get_cld();
    this.load_from_raw(s);
    if (bak !== this.get_cld() && this.reaction) this.reaction();
  }
  override load_from_animation(s: string): boolean {
    if (this.anim_value !== this.get_cld()) return false;
    this.load(s);
    const bak = this.anim_value;
    this.anim_value = this.get_cld();
    return this.anim_value !== bak;
  }
  override load_as_animation(s: string): void {
    this.load(s);
    this.anim_value = this.get_cld();
    anims_animate_parameter(this, s);
  }
  override get_cld(): number { return this.custom_value(); }
  override set_cld_raw(x: number): void { if (this.custom_set_value) return this.custom_set_value(x); }
  save(): string { if (this.custom_save) return this.custom_save(); else return 'not saveable'; }
  dosave(): boolean { if (this.custom_do_save) return this.custom_do_save(); else return false; }
  reset(): void { if (this.custom_reset) this.custom_reset(); }
  swap_with(_p: parameter): void { }
}

function non_editable(): void {
  dialog_addHelp_s('Warning: editing this value through this menu may not work correctly');
}

// --- param_* ---

export function param_f(val: pref<number>, n: parameter_names, dft: number = val.v): float_parameter {
  const u = new float_parameter();
  u.setup(n);
  u.value = val;
  u.last_value = dft;
  if (dft === 0) {
    u.min_value = -100;
    u.max_value = +100;
  }
  else {
    u.min_value = 0;
    u.max_value = 2 * dft;
  }
  u.step = dft / 10;
  u.dft = dft;
  val.v = dft;
  return u;
}

export function param_fd(val: pref<number>, n: parameter_names, dft = use_the_default_value): float_parameter_dft {
  const u = new float_parameter_dft();
  u.setup(n);
  u.value = val;
  u.last_value = dft;
  u.min_value = -100;
  u.max_value = +100;
  u.step = 1;
  u.dft = dft;
  val.v = dft;
  return u;
}

export function param_esc(s: string): string {
  let out = '';
  for (const c of s)
    if (c === ' ' || c === '-' || c === ':')
      out += '_';
    else
      out += c;
  return out;
}

export function param_i(val: pref<number>, n: parameter_names, dft: number = val.v): int_parameter {
  const u = new int_parameter();
  u.setup(n);
  u.value = val;
  u.last_value = dft;
  u.dft = dft;
  val.v = dft;
  if (dft === 0) {
    u.min_value = -100;
    u.max_value = +100;
  }
  else {
    u.min_value = 0;
    u.max_value = 2 * dft;
  }
  return u;
}

export function param_b(val: pref<boolean>, n: parameter_names, dft: boolean = val.v): bool_parameter {
  const u = new bool_parameter();
  u.setup(n);
  u.value = val;
  u.last_value = dft;
  u.dft = dft;
  u.switcher = () => { val.v = !val.v; };
  val.v = dft;
  return u;
}

export function param_color(val: pref<number>, n: parameter_names, has_alpha: boolean, dft: number = val.v): color_parameter {
  const u = new color_parameter();
  u.setup(n);
  u.value = val;
  u.last_value = dft;
  u.dft = dft;
  u.has_alpha = has_alpha;
  val.v = dft;
  return u;
}

export function param_matrix(val: pref<transmatrix>, n: parameter_names, dim: number): matrix_parameter {
  const u = new matrix_parameter();
  u.setup(n);
  u.value = val;
  u.last_value = u.copy(val.v);
  u.dft = u.copy(val.v);
  u.anim_value = u.copy(val.v);
  u.dim = dim;
  return u;
}

export function param_str(val: pref<string>, n: parameter_names, dft: string = val.v): string_parameter {
  const u = new string_parameter();
  u.setup(n);
  u.value = val;
  u.last_value = val.v;
  u.dft = dft;
  val.v = dft;
  return u;
}

/** param_enum(T& val, n, dft) (val: a number) */
export function param_enum(val: pref<number>, n: parameter_names, dft: number = val.v): enum_parameter {
  const u = new enum_parameter();
  u.setup(n);
  u.value = val as pref<number | boolean>;
  u.dft = dft;
  val.v = dft;
  u.last_value = dft;
  u.set_value_to = (v) => { u.value.v = v; };
  return u;
}
/** param_enum of a bool (template<class T> with T = bool) */
export function param_enum_b(val: pref<boolean>, n: parameter_names, dft: boolean = val.v): enum_parameter {
  const u = new enum_parameter();
  u.is_bool = true;
  u.setup(n);
  u.value = val as pref<number | boolean>;
  u.dft = dft;
  val.v = dft;
  u.last_value = dft;
  u.set_value_to = (v) => { u.value.v = v; };
  return u;
}

/** param_custom_int(T& val, n, menuitem, key) */
export function param_custom_int(val: pref<number>, n: parameter_names, menuitem: (key: key_type) => void, key: key_type): custom_parameter {
  const u = new custom_parameter();
  u.setup(n);
  const dft = Math.trunc(val.v);
  u.last_value = dft;
  u.custom_viewer = menuitem;
  u.custom_value = () => Math.trunc(val.v);
  u.custom_affect = (v) => val.same(v);
  u.custom_load = (s) => { val.v = parseint(s); };
  u.custom_save = () => its(Math.trunc(val.v));
  u.custom_do_save = () => Math.trunc(val.v) !== dft;
  u.custom_reset = () => { val.v = dft; };
  u.default_key = key;
  u.is_editable = true;
  return u;
}

export function param_custom_ld(val: pref<number>, n: parameter_names, menuitem: (key: key_type) => void, key: key_type): custom_parameter {
  const u = new custom_parameter();
  u.setup(n);
  const dft = val.v;
  u.last_value = dft;
  u.custom_viewer = menuitem;
  u.custom_value = () => val.v;
  u.custom_set_value = (x) => { val.v = x; };
  u.custom_affect = (v) => val.same(v);
  u.custom_load = (s) => { val.v = parseld(s); };
  u.custom_save = () => fts(val.v, 10);
  u.custom_do_save = () => val.v !== dft;
  u.custom_reset = () => { val.v = dft; };

  u.default_key = key;
  u.is_editable = true;
  return u;
}

/** param_colortable(colortable& val, n): a colortable is a number[] here (changed in place); its reference for
 *  add_edit is E(table, -1) */
export function param_colortable(val: number[], n: parameter_names): custom_parameter {
  const u = new custom_parameter();
  u.setup(n);
  const dft = [...val];
  u.last_value = -1;
  u.custom_viewer = (_key) => { };
  u.custom_value = () => -1;
  u.custom_affect = (v) => v.o === (val as unknown) && v.k === -1;
  u.custom_load = (s) => {
    const t = parsecolortable(s);
    val.length = 0; val.push(...t);
  };
  u.custom_save = () => {
    let first = true;
    let str = '';
    for (const v of val) { if (first) first = false; else str += ','; str += itsh6(v); }
    return str;
  };
  u.custom_do_save = () => val.length !== dft.length || val.some((x, i) => x !== dft[i]);
  u.custom_reset = () => { val.length = 0; val.push(...dft); };

  u.default_key = 0;
  u.is_editable = true;
  return u;
}

// EX ld bounded_mine_percentage = 0.1; EX int bounded_mine_quantity, bounded_mine_max: G
/** EX string conffile = "hyperrogue.ini" (initializeCLI may move it under $HOME; -c sets it) */
export const conffile_ref = { v: 'hyperrogue.ini' };
// EX array<ld, gGUARD+64> sightranges, EX bool logfog, EX videopar vid: G

const DEFAULT_WALLMODE = 5; // ISMOBILE ? 3 : 5
const DEFAULT_MONMODE = 4; // ISMOBILE ? 2 : 4

/** EX void android_settings_changed() (ISANDROID only) */
export function android_settings_changed(): void { }

/** struct charstyle (hyper.h) */
export interface charstyle {
  charid: number;
  skincolor: number; haircolor: number; dresscolor: number; swordcolor: number; dresscolor2: number;
  uicolor: number; eyecolor: number; bowcolor: number; bowcolor2: number;
  lefthanded: boolean;
}

/** EX charstyle& getcs(int id IS(multi::cpid)) */
export function getcs(id = G.multi_cpid): charstyle {
  if (G.multi_players > 1 && id >= 0 && id < G.multi_players)
    return G.multi_scs[id];
  else
    return G.vid.cs;
}

// hread/hwrite(hstream&, charstyle&): the binary formats of charstyle (the map editor's files: stage 3)

/** EX string csnameid(int id) */
export function csnameid(id: number): string {
  if (id === 0) return XLAT('male');
  if (id === 1) return XLAT('female');
  if (id === 2) return XLAT('Prince');
  if (id === 3) return XLAT('Princess');
  return XLAT(playershapes[id >> 1].name);
}

/** EX string csname(charstyle& cs) */
export function csname(cs: charstyle): string {
  return csnameid(cs.charid);
}

/** EX int playergender() */
export function playergender(): number {
  return (getcs().charid >= 0 && (getcs().charid & 1)) ? GEN_F : GEN_M;
}
/** EX int princessgender() */
export function princessgender(): number {
  const g = playergender();
  if (G.vid.samegender) return g;
  return g === GEN_M ? GEN_F : GEN_M;
}

// EX int default_language: G.default_language
/** EX int lang() */
export function lang(): number {
  if (G.vid.language >= 0)
    return G.vid.language;
  return G.default_language;
}

// EX bool autojoy = false, defaultjoy = true: G.autojoy, G.defaultjoy

/** EX void paramset(charstyle& cs, string s) */
export function paramset(cs: charstyle, s: string): void {
  param_i(E(cs, 'charid'), s + '.charid');
  param_color(E(cs, 'skincolor'), s + '.skincolor', true, cs.skincolor);
  param_color(E(cs, 'eyecolor'), s + '.eyecolor', true, cs.eyecolor);
  param_color(E(cs, 'bowcolor'), s + '.bowcolor', true, cs.bowcolor);
  param_color(E(cs, 'bowcolor2'), s + '.bowcolor2', true, cs.bowcolor2);
  param_color(E(cs, 'haircolor'), s + '.haircolor', true, cs.haircolor);
  param_color(E(cs, 'dresscolor'), s + '.dresscolor', true, cs.dresscolor);
  param_color(E(cs, 'swordcolor'), s + '.swordcolor', true, cs.swordcolor);
  param_color(E(cs, 'dresscolor2'), s + '.dresscolor2', true, cs.dresscolor2);
  param_color(E(cs, 'uicolor'), s + '.uicolor', true, cs.uicolor);
  param_b(E(cs, 'lefthanded'), s + '.lefthanded');
}

// R:239, G:208, B:207

/** the palettes of the character's colours (palette[0] is the count) */
const skincolors = [7, 0xD0D0D0FF, 0xEFD0C9FF, 0xC77A58FF, 0xA58869FF, 0x602010FF, 0xFFDCB1FF, 0xEDE4C8FF];
const haircolors = [8, 0x686868FF, 0x8C684AFF, 0xF2E1AEFF, 0xB55239FF, 0xFFFFFFFF, 0x804000FF, 0x502810FF, 0x301800FF];
const dresscolors = [6, 0xC00000FF, 0x00C000FF, 0x0000C0FF, 0xC0C000FF, 0xC0C0C0FF, 0x202020FF];
const dresscolors2 = [7, 0x8080FFC0, 0x80FF80C0, 0xFF8080C0, 0xFFFF80C0, 0xFF80FFC0, 0x80FFFFC0, 0xFFFFFF80];
const swordcolors = [6, 0xC0C0C0FF, 0xFFFFFFFF, 0xFFC0C0FF, 0xC0C0FFFF, 0x808080FF, 0x202020FF];
const eyecolors = [4, 0x00C000FF, 0x0000C0FF, 0xC00000FF, 0xC0C000FF, 0x804010FF, 0x00C000FF];

/** EX void initcs(charstyle &cs) */
export function initcs(cs: charstyle): void {
  cs.charid = 0;
  cs.skincolor = 0xD0D0D0FF;
  cs.haircolor = 0x686868FF;
  cs.dresscolor = 0xC00000FF;
  cs.swordcolor = 0xD0D0D0FF;
  cs.dresscolor2 = 0x8080FFC0;
  cs.uicolor = 0xFF0000FF;
  cs.eyecolor = 0x603000FF;
  cs.bowcolor = 0x603000FF;
  cs.bowcolor2 = 0xFFD500FF;
  cs.lefthanded = false;
}
/** a new charstyle with the initcs() values */
export function new_charstyle(): charstyle {
  const cs = {} as charstyle; initcs(cs); return cs;
}

// EX purehookset hooks_configfile: G.hooks_configfile
// EX ld mapfontscale = 100: G.mapfontscale

/** EX vector<int> get_display_modes(char which): the browser has no display modes (SDL_GetNumVideoDisplays
 *  gives none): the original's list for that case */
export function get_display_modes(which: string): number[] {
  return which === 'x' ? [640, 800, 1024, 1280, 1600, 1920] : [480, 600, 720, 800, 1200, 1080];
}

/** EX void font_reaction() (CAP_SDLTTF) */
export function font_reaction(): void {
  if (among(G.font_id, 5, 6)) {
    const fid = G.font_id;
    G.font_id = G.last_font_id;
    dialog_openFileDialog(E(font_filenames, fid), XLAT('font to use:'), fid === 5 ? '.ttf' : '.otf', () => {
      G.font_id = fid; return true;
    });
  }
}

// EX bool running_on_deck = false, detect_deck = true (the Steam Deck: never in the browser)

/** EX bool mode_demands_consistency() */
export function mode_demands_consistency(): boolean {
  return G.tactic_on || G.yendor_on || G.princess_challenge;
}

/** sightranges[i] */
function sightrange(i: number): pref<number> { return E(G.sightranges, i); }

export function initConfig(): void {

  // DEBBI(debug_init_config, ("initconfig"));

  const qm = true; // !ISPANDORA

  // ISLINUX: detect_deck reads /sys/devices/virtual/dmi/id/board_{name,vendor}: never the Steam Deck in the
  // browser (running_on_deck stays false; detect_deck = false; if(running_on_deck) {...} never runs)

  // basic config
  param_i(V('flashtime'), 'flashtime', 8);

  param_i(V('msglimit'), 'message limit', 5);
  param_i(V('timeformat'), 'message log time format', 0);

  param_b(P('separate_status'), 'separate_status')
    .editable('separate status', K('s'))
    .help('Make quest status and main menu separate screens.');

  param_b(P('resizable'), 'resizable', true)
    .editable('resizable window', K('r'))
    .help('This lets your operating system resize the window.');

  param_b(P('no_find_player'), 'no_find_player')
    .help('Do not show the \'find player\' button even if the player seems to be lost.');
  param_b(P('game_keys_scroll'), 'game_keys_scroll')
    .editable('pure exploration (game keys scroll)', K('P'))
    .help('Enables easier control of the camera for watching visualizations (when you are not playing the game).');
  // param_b(reg3::cubes_reg3, "cubes_reg3"); param_f(linepatterns::tree_starter, "tree_starter"): stage 3

  // param_char(patterns::whichCanvas, "whichCanvas", 0); %TODO
  param_f(P('ccolor_rwalls'), 'randomwalls');
  param_b(P('patterns_innerwalls'), 'innerwalls')
    .help('In 3D modes, display all the walls, including the walls between adjacent wall tiles.');

  param_b(P('use_bool_dialog'), 'use_bool_dialog')
    .editable('on/off dialog/help', K('B'))
    .help(
      'Enable this for a full dialog when editing some on/off settings (otherwise, the dialog is not shown, we just switch). ' +
      'This lets you see an explanation of what the setting does. ' +
      'You can also press ALT while changing such settings.');

  param_b(P('higher_contrast'), 'higher_contrast')
    .editable('use higher contrast', K('h'))
    .help('Use higher contrast for some terrain elements.');

  param_b(V('grid'), 'grid')
    .editable('display grid', K('g'));
  param_b(P('models_desitter_projections'), 'desitter_projections', false);
  param_b(P('nonisotropic_weird_transforms'), 'nonisotropic_weird_transforms', false);

  // arb::apeirogon_consistent_coloring, apeirogon_hide_grid_edges, apeirogon_simplified_display,
  // arb::convert::minimize_on_convert, arb::convert::reverse_order: stage 3 (arbitrary tilings)

  param_b(E(quit_options, 'display_yasc_codes'), 'yasc', false)
    .editable('YASC codes', K('Y'))
    .help('YASC codes: Sides-Entity-Restrict-Threat-Wall');

  param_b(E(quit_options, 'display_semicasual'), 'semicasual', false)
    .editable('semicasual', K('S'))
    .help('display save/load counts in exit screen');

  param_b(V('relative_font'), 'relative_font', true)
    .editable('set relative font size', K('r'))
    .help('Font size is set as a relation to screen size.')
    .set_reaction(compute_fsize);
  param_i(V('fontscale'), 'fontscale', 100)
    .editable(25, 400, 10, 'font scale', '', K('b'))
    .set_reaction(compute_fsize)
    .set_sets(() => { dialog_bound_low(0); });

  param_f(P('mapfontscale'), 'mapfontscale', 100)
    .editable(-400, 400, 10, 'map font scale',
      'This affects the size of the characters on the ASCII map. This includes ASCII walls/monster display mode, the minimap, minefield values, and various debug features.', K('B'))
    .set_extra(() => {
      // dialog::get_di().extra_options = [] () { draw_radar(true); }: the radar (radar.cpp) is stage 3: the
      // dialog has no preview of the radar STAGE2-STUB
    });

  param_i(V('abs_fsize'), 'fsize', 12)
    .editable(1, 72, 1, 'font size', '', K('b'))
    .set_reaction(compute_fsize)
    .set_sets(() => { dialog_bound_low(0); });

  param_i(V('mobilecompasssize'), 'mobile compass size', 0); // ISMOBILE || ISPANDORA ? 30 : 0);
  param_i(V('radarsize'), 'radarsize size', 120);
  param_f(V('radarrange'), 'radarrange', 2.5);
  param_i(V('axes'), 'movement help', 1);
  param_b(V('axes3'), 'movement help3', true);
  param_i(V('shifttarget'), 'shift-targetting', 2);
  param_i(V('steamscore'), 'scores to Steam', 1);
  initcs(G.vid.cs); paramset(G.vid.cs, 'single');
  param_b(V('samegender'), 'princess choice', false);
  param_i(V('language'), 'language', -1);
  // CAP_SDLTTF
  param_enum(P('font_id'), 'font_id', 0)
    .editable(font_names, 'select font', K('f'))
    .manual_reaction = font_reaction;
  param_str(E(font_filenames, 5), 'ttf_font');
  param_str(E(font_filenames, 6), 'otf_font');
  param_b(V('drawmousecircle'), 'mouse circle', false); // ISMOBILE || ISPANDORA
  param_b(V('revcontrol'), 'reverse control', false);
  // CAP_AUDIO
  param_i(P('musicvolume'), 'music volume')
    .editable(0, 128, 10, 'background music volume', '', K('b'))
    .set_sets(sets_music_volume);
  // CAP_SDLAUDIO
  param_b(P('music_out_of_focus'), 'music out of focus', false);
  // CAP_AUDIO
  param_i(P('effvolume'), 'sound effect volume')
    .editable(0, 128, 10, 'sound effects volume', '', K('e'))
    .set_sets(sets_sfx_volume);

  param_b(P('touch_interface'), 'touch_interface')
    .editable('a button for easier touching', K('t'));

  param_enum(P('dialog_display_keys'), 'dialog_display_keys')
    .editable([['never', ''], ['when using keyboard', ''], ['always', ''], ['SteamDeck controls', '']], 'display keys in dialogs', K('K'));

  param_enum(V('faraway_highlight'), ['faraway_highlight', 'highlight faraway monsters'], 0 /* tlNoThreat */)
    .editable([['off', ''], ['spam', ''], ['normal monsters', ''], ['high-threat monsters only', '']], 'highlight faraway monsters', K('h'));

  param_i(V('faraway_highlight_color'), 'faraway_highlight_color', 50)
    .editable(0, 100, 10, 'faraway highlight color', '0 = monster color, 100 = red-light oscillation', K('c'));

  param_b(P('keybd_subdir_enabled'), 'keybd_subdir_enabled', false).editable('control the pushing direction with TAB', K('P')).help('If set, you control the off-heptagon pushing direction with TAB. Otherwise, you control it by rotating the screen.');

  param_str(P('pinnedglyphs'), 'pinned_glyphs', '')
    .set_standard_editor(true)
    .editable('pinned glyphs',
      'A list of glyphs to always sort at the front, ' +
      'and reserve space for even when they\'re not being displayed.',
      K('p'))
    .set_reaction(updateglyphpinned);

  param_enum(P('glyphsortorder'), ['glyph_sort', 'glyph sort order'], G.glyphsortorder)
    .editable([
      ['first on top', ''],
      ['first on bottom', ''],
      ['last on top', ''],
      ['last on bottom', ''],
      ['by land', ''],
      ['by number', ''],
    ], 'inventory/kill sorting', K('k'));

  param_enum(V('orbmode'), ['orb_mode', 'orb display mode'], 2)
    .editable([
      ['plain', ''],
      ['types', ''],
      ['icons', ''],
    ], 'orb display mode', K('o'));

  param_b(P('orb_treasure_gap'), 'orb_treasure_gap', false)
    .editable('gap between orbs and treasures', K('G'))
    .help('If set, a gap row will be left between orbs and treasures in the HUD')
    .set_reaction(() => { G.vid.killreduction = 0; });

  param_b(P('less_in_landscape'), 'less_in_landscape', false)
    .editable('less items/kills in landscape', K('L'))
    .help('If set, only the important items and kills will be shown')
    .set_reaction(() => { G.vid.killreduction = 0; });

  param_b(P('less_in_portrait'), 'less_in_portrait', false)
    .editable('less items/kills in portrait', K('P'))
    .help('If set, only the important items and kills will be shown')
    .set_reaction(() => { G.vid.killreduction = 0; });

  // basic graphics

  param_b(V('wantGL'), 'usingGL', true)
    .editable('openGL mode', K('o'));

  param_i(V('want_antialias'), 'antialias', 1 | 32 | 4 | 2); // AA_NOGL | AA_FONT | (ISWEB ? AA_MULTI : AA_LINES) | AA_VERSION
  param_b(V('fineline'), 'fineline', true).help('Disable this to make all line widths 1.');
  param_f(V('linewidth'), 'linewidth', 1);
  param_f(P('precise_width'), 'precisewidth', .5);
  param_i(P('perfect_linewidth'), 'perfect_linewidth', 1);
  // param_f(linepatterns::width, parameter_names("lpwidth", "pattern-linewidth"), 1): stage 3 (line patterns)
  param_b(P('fat_edges'), 'fat-edges').help('When this setting is ON, grid lines and various line patterns are drawn as pipes.');
  param_f(V('sspeed'), ['sspeed', 'scrollingspeed'], 0);
  param_f(V('mspeed'), ['mspeed', 'movement speed'], 1);
  param_f(V('ispeed'), ['ispeed', 'idle speed'], 1);
  param_i(V('aurastr'), 'aura strength', 128); // ISMOBILE ? 0 : 128
  param_i(V('aurasmoothen'), 'aura smoothen', 5);
  param_enum(V('graphglyph'), ['graphglyph', 'graphical items/kills'], 1)
    .editable([['letters', ''], ['auto', ''], ['images', '']], 'inventory/kill mode', K('d'));

  param_i(P('min_cells_drawn'), 'min_cells_drawn');

  param_str(P('menu_format'), 'menu_format', '')
    .set_standard_editor(true)
    .editable('menu line format',
      'Displays an arbitrary text instead of menu. ' +
      'You can use e.g. $(turncount) or $(gametime,2) ' +
      'to display the values of parameters and statistics.',
      K('T'))
    .set_extra(() => {
      dialog_addSelItem(XLAT('default'), '', SDLK_F1);
      dialog_add_action(() => { G.menu_format = ''; popScreen(); });
      dialog_addSelItem(XLAT('show turn count'), '', SDLK_F2);
      dialog_add_action(() => { G.menu_format = 't:$(turncount)'; popScreen(); });
      dialog_addSelItem(XLAT('testing'), eval_programmable_string(G.menu_format), 0);
    });
  param_i(P('menu_darkening'), 'menu_darkening', 2)
    .editable(0, 8, 1, 'menu map darkening', 'A larger number means darker game map in the background. Set to 8 to disable the background.', K('d'))
    .set_sets(() => { dialog_bound_low(0); dialog_bound_up(8); dialog_get_di().dialogflags |= sm.DARKEN; });
  param_b(P('centered_menus'), 'centered_menus')
    .editable('centered menus in widescreen', K('c'));
  param_f(P('dialog_dialog_font_scale'), 'dialog_font_scale')
    .editable(1, 5, 0.25, 'dialog font scale',
      'allow larger font in dialogs',
      K('D'));
  param_i(P('lands_per_page'), 'lands_per_page')
    .editable(10, 60, 5, 'lands per page',
      'lands per page shown in the World Overview',
      K('L'));

  param_i(P('scores_scale'), 'scores_scale').editable(1, 2, 1, 'scores scale', '', K('S'));

  param_b(P('startanims_enabled'), 'startanim', true)
    .editable('start animations', K('s'));

  param_b(V('flasheffects'), 'flasheffects', true)
    .editable('flashing effects', K('h'))
    .help('Disable if you are photosensitive. Replaces flashing effects such as Orb of Storms lightning with slow, adjustable animations.');

  G.vid.binary_width = 1;
  param_custom_ld(V('binary_width'), 'binary tiling width', menuitem_binary_width, K('v'));

  // param_b(fake::multiple_special_draw, "fake_multiple", true), hat::hat_param, hat::hat_param_imag: stage 3

  param_b(V('particles'), 'extra effects', true)
    .help('Disable if you do not want particle effects and similar.');
  param_i(V('framelimit'), 'frame limit', 999);

  param_b(P('festive_option'), 'festive', true)
    .editable('holiday options', K('h'))
    .help('Special graphical effects on holidays.');

  // !ISMOBWEB
  param_b(V('want_vsync'), 'vsync', true)
    .help('Disable if you want to see the actual framerate rendered by the engine.')
    .editable('vsync', K('v'));

  param_b(V('want_fullscreen'), 'fullscreen', false) // running_on_deck ? true : false
    .editable('fullscreen mode', K('f'));
  param_b(V('change_fullscr'), 'fullscreen_change', false)
    .editable('use specific fullscreen resolution', K('g'));
  param_b(V('relative_window_size'), 'window_relative', true)
    .editable('specify relative window size', K('g'));

  param_custom_int(V('xres'), 'xres', (_ch) => { }, 0).restrict = return_false;
  param_custom_int(V('yres'), 'yres', (_ch) => { }, 0).restrict = return_false;

  param_i(V('fullscreen_x'), 'fullscreen_x', 1280)
    .editable(640, 3840, 1, 'fullscreen resolution to use (X)', '', K('x'))
    .set_sets(() => {
      dialog_scale_given(get_display_modes('x'));
      dialog_bound_low(dialog_get_ne().vmin);
      dialog_get_di().reaction_final = do_request_resolution_change;
    });

  param_i(V('fullscreen_y'), 'fullscreen_y', 1024) // running_on_deck ? 800 : 1024
    .editable(480, 2160, 1, 'fullscreen resolution to use (Y)', '', K('x'))
    .set_sets(() => {
      dialog_scale_given(get_display_modes('y'));
      dialog_bound_low(dialog_get_ne().vmin);
      dialog_get_di().reaction_final = do_request_resolution_change;
    });

  param_i(V('window_x'), 'window_x', 1280)
    .editable(160, 3840, 40, 'window resolution to use (X)', '', K('x'))
    .set_sets(() => { dialog_bound_low(160); dialog_get_di().reaction_final = do_request_resolution_change; });

  param_i(V('window_y'), 'window_y', 1024) // running_on_deck ? 800 : 1024
    .editable(120, 2160, 40, 'window resolution to use (Y)', '', K('x'))
    .set_sets(() => { dialog_bound_low(120); dialog_get_di().reaction_final = do_request_resolution_change; });

  param_f(V('window_rel_x'), 'window_rel_x', .9) // running_on_deck ? 1 : .9
    .editable(.1, 1, .1, 'screen size percentage to use (X)', '', K('x'))
    .set_sets(() => { dialog_bound_low(.1); dialog_get_di().reaction_final = do_request_resolution_change; });

  param_f(V('window_rel_y'), 'window_rel_y', .9)
    .editable(.1, 1, .1, 'screen size percentage to use (Y)', '', K('x'))
    .set_sets(() => { dialog_bound_low(.1); dialog_get_di().reaction_final = do_request_resolution_change; });

  param_b(V('darkhepta'), 'mark heptagons', false);

  param_b(P('logfog'), 'logfog', false);

  // for(auto& lp: linepatterns::patterns) { "lpcolor-...", "lpwidth-..." }; rulers::ruler_color, ruler_width,
  // measuring_unit: stage 3 (line patterns, rulers)

  // special graphics

  param_i(V('monmode'), 'monster display mode', DEFAULT_MONMODE);
  param_i(V('wallmode'), 'wall display mode', DEFAULT_WALLMODE);
  param_b(P('zh_ascii'), 'chinese_ascii', false).editable('Chinese ASCII', K('Z'));
  param_i(V('highlightmode'), 'highlightmode');

  param_b(V('always3'), '3D always', false).switcher = geom3_switch_fpp;

  // geom3::euclid_embed_scale, euclid_embed_scale_y, euclid_embed_rotate: stage 3 (Euclidean embeddings)

  param_enum(P('embedded_shift_method_choice'), 'embedded_shift_method', 1 /* smcBoth */)
    .editable([
      ['geodesic', 'always move on geodesics'],
      ['keep levels', 'keep the vertical angle of the camera'],
      ['mixed', 'on geodesics when moving camera manually, keep level when auto-centering'],
    ], 'view shift for embedded planes', K('H'));

  // geom3::auto_configure, inverted_embedding, flat_embedding, want_spatial_embedding: stage 3 (3D)

  param_b(P('memory_saving_mode'), 'memory_saving_mode', false); // (ISMOBILE || ISPANDORA || ISWEB) ? 1 : 0
  param_i(P('reserve_limit'), 'memory_reserve', 128);
  param_b(P('show_memory_warning'), 'show_memory_warning');

  param_b(P('rug_renderonce'), 'rug-renderonce');
  // rug::rendernogl, rug::texturesize, rug::model_distance: stage 3 (the rug)

  param_b(V('backeffects'), 'background particle effects', true) // (ISMOBILE || ISPANDORA) ? false : true
    .help('Background particle effects, e.g., in the Blizzard.');
  // control

  // CAP_SDL (no joysticks in the browser: the values are kept, unused)
  param_enum(P('joy_init'), 'joyinit', 1 /* jiFast */)
    .editable([['off', 'do not use joysticks'], ['fast', 'do not wait until the joysticks are initialized'], ['wait', 'wait until the joysticks are initialized']], 'joystick initialization', K('j'));
  param_i(V('joyvalue'), 'vid.joyvalue', 4800);
  param_i(V('joyvalue2'), 'vid.joyvalue2', 5600);
  param_i(V('joysmooth'), 'vid.joysmooth', 200);
  param_i(V('joypanthreshold'), 'vid.joypanthreshold', 2500);
  param_f(V('joypanspeed'), 'vid.joypanspeed', 0.0001); // (ISPANDORA || SDLVER >= 2) ? 0.0001 : 0
  param_b(P('autojoy'), 'autojoy')
    .editable('joystick moves automatically', K('J'));
  param_b(P('defaultjoy'), 'defaultjoy')
    .editable('apply joystick movements', K('H'))
    .help('You may disable this on Steam controllers, if configured to also send key events, to avoid duplicated input. Press key ` (or assign it to the controller button in Steam) to move or accept menu options.');

  G.vid.killreduction = 0;

  param_b(V('skipstart'), 'skip the start menu', false);
  param_f(P('drag_sensitivity'), 'drag_sensitivity', 0)
    .editable(0, 100, 1, 'drag threshold', 'Drag automatically on touch movement. Only if quick mouse is off. Set to 0 to disable, large numbers are more sensitive.', K('T'));
  param_b(V('quickmouse'), 'quick mouse', qm)
    .help('Buttons activate when they are pressed (by clicking), not when they are released.');

  // colors

  param_f(P('crosshair_size'), 'size:crosshair')
    .set_extra(draw_crosshair);
  param_color(P('crosshair_color'), 'color:crosshair', true, G.crosshair_color)
    .set_extra(draw_crosshair);

  param_b(P('mapeditor_drawplayer'), 'drawplayer');

  param_color(P('backcolor'), 'color:background', false);
  param_color(P('forecolor'), 'color:foreground', false);
  param_color(P('bordcolor'), 'color:borders', false);
  param_color(P('ringcolor'), 'color:ring', true);
  param_f(V('multiplier_ring'), ['mring', 'mult:ring'], 1);
  param_color(P('modelcolor'), 'color:model', true);
  param_color(P('periodcolor'), 'color:period', true);
  param_color(P('stdgridcolor'), 'color:stdgrid', true);
  param_f(V('multiplier_grid'), ['mgrid', 'mult:grid'], 1);
  param_color(P('dialog_dialogcolor'), 'color:dialog', false);
  // for(auto p: ccolor::all) param_colortable(p->ctab, "canvas:"+p->name): stage 3 (the canvas colourings)
  param_colortable(distcolors, 'distance');
  param_colortable(minecolors, 'mines');
  // CAP_COMPLEX2
  param_colortable(G.brownian_colors, 'color:brown');

  param_colortable(prairie_colors, 'color:prairie');
  param_colortable(mountain_colors, 'color:mountain');
  param_colortable(tower_colors, 'color:tower');
  param_colortable(westwall_colors, 'color:freefall');
  param_colortable(endorian_colors, 'color:endorian');
  param_colortable(canopy_colors, 'color:canopy');
  param_colortable(camelot_cheat_colors, 'color:camelotcheat');

  for (let i = 0; i < motypes; i++)
    param_color(E(minf[i], 'color'), 'color:monster:' + its(i), false);
  for (let i = 0; i < ittypes; i++)
    param_color(E(iinf[i], 'color'), 'color:item:' + its(i), false);
  for (let i = 0; i < landtypes; i++)
    param_color(E(G.floorcolors, i), 'color:land:' + its(i), false);
  for (let i = 0; i < walltypes; i++)
    param_color(E(winf[i], 'color'), 'color:wall:' + its(i), false);

  // modes

  param_b(P('shmup_on'), 'mode-shmup', false).be_non_editable();
  param_b(P('hardcore'), 'mode-hardcore', false)
    .set_pre_reaction(() => { if (mode_demands_consistency()) stop_game(); })
    .set_reaction(() => { G.hardcore = !G.hardcore; switchHardcore_quiet(); if (!G.delayed_start) start_game(); });
  param_enum(P('land_structure'), 'mode-chaos', lsNiceWalls).be_non_editable();
  // CAP_INV
  param_b(P('inv_on'), 'mode-Orb Strategy').be_non_editable();
  param_b(P('peace_on'), 'mode-peace').be_non_editable();
  param_b(P('peace_otherpuzzles'), 'mode-peace-submode').be_non_editable();
  param_enum(P('specialland'), ['specialland', 'land for special modes'], G.specialland).be_non_editable();

  param_b(P('viewdists'), 'expansion mode');
  param_f(P('backbrightness'), ['back', 'brightness behind sphere']);
  param_b(P('auto_extend'), 'expansion_auto_extend')
    .editable('extend automatically', K('E'));

  param_f(V('ipd'), ['ipd', 'interpupilar-distance'], 0.05);
  param_f(V('lr_eyewidth'), ['lr', 'eyewidth-lr'], 0.5);
  param_f(V('anaglyph_eyewidth'), ['anaglyph', 'eyewidth-anaglyph'], 0.1);
  param_f(V('fov'), ['fov', 'field-of-vision'], 90);
  param_i(V('desaturate'), 'desaturate', 0);

  param_enum(V('stereo_mode'), 'stereo-mode', G.vid.stereo_mode)
    .editable([
      ['OFF', 'linear perspective'], ['anaglyph', 'for red-cyan glasses'], ['side-by-side', 'for mobile VR'],
      ['ODS', 'for rendering 360° VR videos (implemented only in raycaster and some other parts)'],
      ['Panini', 'Projection believed to be used by Italian painters. Allows very high FOV angles while rendering more straight lines as straight than the stereographic projection.'],
      ['stereographic', 'Stereographic projection allows very high FOV angles.'],
      ['equirectangular', 'for rendering 360° videos (implemented only in raycaster)'],
      ['cylindrical', 'full vertical (not implemented in raycaster)'],
    ], 'stereo/high-FOV mode', K('m'))
    .set_reaction(reset_all_shaders);

  param_enum(P('lineofsight'), 'mode-lineofsight', los_none)
    .editable([
      ['OFF', 'You see everything in range, but also everything in range sees you!'],
      ['geodesic', 'Graph geodesic: any sequence of tiles is OK for line-of-sight as long as there are no shortcuts'],
      ['geometric', 'Approximations of geometric straight lines.']],
    'line-of-sight mode', K('v'))
    .add_extra(() => { add_edit(P('neon_magic_vision')); })
    .set_pre_reaction(() => { if (mode_demands_consistency()) stop_game(); })
    .set_reaction(() => { switchLOS_quiet(); if (!G.delayed_start) start_game(); });

  param_b(P('lineofsight_cheat'), 'lineofsight_cheat', false)
    .help('If the cheat mode is active while in line-of-sight mode, you still see everything using \'magic vision\'.');

  param_f(V('plevel_factor'), 'plevel_factor', 0.7);

  param_b(P('nohud'), 'no-hud', false);
  param_b(P('nomap'), 'nomap', false);
  param_b(P('nofps'), 'no-fps', false);

  param_enum(P('music_reset'), 'music_reset', 0 /* music_reset_t::always */)
    .editable([
      ['always', 'even if both lands use the same music'],
      ['non-subland', 'except sublands using the same music'],
      ['if different', 'only if lands use different music']],
    'reset music when land changes', K('r'));

  // CAP_IRR: irr::density, quality, place_attempts, rearrange_max_attempts, rearrange_less: stage 3
  param_i(P('irr_cellcount'), 'irregular-cellcount', 150);

  param_i(V('linequality'), 'line quality', 0);

  // anims::animfile, rug::move_on_touch, crystal::compass_probability, crystal::view_coordinates,
  // texture::texture_aura, texture::raw_texture_opacity: stage 3

  param_f(V('smart_range_detail'), 'smart-range-detail', 8)
    .editable(1, 50, 1, 'minimum visible cell in pixels', '', K('d'))
    .set_extra(() => { add_cells_drawn(K('C')); });

  param_f(V('smart_range_detail_3'), 'smart-range-detail-3', 30)
    .editable(1, 50, 1, 'minimum visible cell in pixels', '', K('d'))
    .set_extra(() => { add_cells_drawn(K('C')); });

  param_b(V('smart_area_based'), 'smart-area-based', false);
  param_i(V('cells_drawn_limit'), 'limit on cells drawn', 10000);
  param_i(V('cells_generated_limit'), 'limit on cells generated', 250);

  param_enum(P('diskshape'), 'disk_shape', dshTiles)
    .editable([['distance in tiles', ''], ['distance in vertices', ''], ['geometric distance', ''],
    ], 'disk shape', K('S'))
    .set_reaction(() => { if (G.game_active) { stop_game(); start_game(); } });

  param_i(P('req_disksize'), 'disk_size')
    .editable(10, 100000, 10, 'disk size', 'Play on a disk. Enables the special game rules for small bounded spaces (especially relevant for e.g. Minefield and Halloween). The number given is the number of tiles to use; it is not used exactly, actually the smallest disk above this size is used. Set to 0 to disable.', K('d'))
    .set_sets(() => { dialog_bound_low(0); })
    .set_reaction(() => { if (G.game_active) { stop_game(); start_game(); } })
    .set_extra(() => {
      add_edit(P('diskshape'));
    });

  // CAP_SOLV sn::solrange_xy/z, slr::shader_iterations, slr::range_xy/z, arcm::euclidean_edge_length,
  // CAP_ARCM arcm::current.symbol, hybrid::underlying: stage 3 (other geometries)

  for (let i = 0; i < isize(ginf); i++) {
    if (ginf[i].flags & qELLIPTIC)
      G.sightranges[i] = M_PI;
    else if (ginf[i].g.kind === gcSphere)
      G.sightranges[i] = TAU;
    else if (ginf[i].g.kind === gcEuclid)
      G.sightranges[i] = 10;
    else if (ginf[i].g.kind === gcSL2)
      G.sightranges[i] = 4.5;
    else if (ginf[i].g.kind === gcHyperbolic && ginf[i].g.gameplay_dimension === 2)
      G.sightranges[i] = 4.5;
    else
      G.sightranges[i] = 5;
    G.sightranges[gArchimedean] = 10;
    if (i < gBinary3) param_f(sightrange(i), 'sight-g' + its(i));
  }

  const bonus = 0;
  const emul = 1;

  param_b(P('dialog_onscreen_keyboard'), 'onscreen_keyboard')
    .editable('onscreen keyboard', SDLK_F6);

  param_b(P('context_fog'), 'coolfog');

  param_f(sightrange(gBinary3), 'sight-binary3', 3.1 + bonus);
  param_f(sightrange(gCubeTiling), 'sight-cubes', 10);
  param_f(sightrange(gCell120), 'sight-120cell', TAU);
  param_f(sightrange(gECell120), 'sight-120cell-elliptic', M_PI);
  param_f(sightrange(gRhombic3), 'sight-rhombic', 10.5 * emul);
  param_f(sightrange(gBitrunc3), 'sight-bitrunc', 12 * emul);
  param_f(sightrange(gOctTet3), 'sight-octtet', 12 * emul);
  param_f(sightrange(gSpace534), 'sight-534', 4 + bonus);
  param_f(sightrange(gSpace435), 'sight-435', 3.8 + bonus);

  param_f(sightrange(gCell5), 'sight-5cell', TAU);
  param_f(sightrange(gCell8), 'sight-8cell', TAU);
  param_f(sightrange(gECell8), 'sight-8cell-elliptic', M_PI);
  param_f(sightrange(gCell16), 'sight-16cell', TAU);
  param_f(sightrange(gECell16), 'sight-16cell-elliptic', M_PI);
  param_f(sightrange(gCell24), 'sight-24cell', TAU);
  param_f(sightrange(gECell24), 'sight-24cell-elliptic', M_PI);
  param_f(sightrange(gCell600), 'sight-600cell', TAU);
  param_f(sightrange(gECell600), 'sight-600cell-elliptic', M_PI);
  param_f(sightrange(gHoroTris), 'sight-horotris', 2.9 + bonus);
  param_f(sightrange(gHoroRec), 'sight-hororec', 2.2 + bonus);
  param_f(sightrange(gHoroHex), 'sight-horohex', 2.75 + bonus);

  param_f(sightrange(gKiteDart3), 'sight-kd3', 2.25 + bonus);

  param_f(sightrange(gField435), 'sight-field435', 4 + bonus);
  param_f(sightrange(gField534), 'sight-field534', 3.8 + bonus);
  param_f(sightrange(gSol), 'sight-sol');
  param_f(sightrange(gNil), 'sight-nil', 6.5 + bonus);
  param_f(sightrange(gNIH), 'sight-nih');
  param_f(sightrange(gSolN), 'sight-solnih');

  param_f(sightrange(gCrystal344), 'sight-crystal344', 2.5); /* assume raycasting */
  param_f(sightrange(gSpace344), 'sight-344', 4.5);
  param_f(sightrange(gSpace336), 'sight-336', 4);

  param_b(V('sloppy_3d'), 'sloppy3d', true)
    .editable('sloppy range checking', K('s'))
    .help('Do not draw if their distance is greater than the sight range (although some points might be closer). This is faster.');

  param_i(V('texture_step'), 'wall-quality', 4);
  // add_texture_params(): stage 3 (textures)

  param_b(P('smooth_scrolling'), 'smooth-scrolling', false)
    .editable('smooth scrolling', K('c'));
  param_f(P('mouseaim_sensitivity'), 'mouseaim_sensitivity', 0.01);

  param_b(V('consider_shader_projection'), 'shader-projection', true)
    .editable('use GPU to compute projections', K('G'))
    .help('Computing projections using a GPU (vertex shader) is faster, but sometimes, some projections or their minor details are not available.');

  param_b(P('semidirect_rendering'), 'semidirect_rendering', false)
    .editable('semidirect_rendering (perspective on GPU)', K('k'));

  param_i(P('forced_center_down'), 'forced_center_down')
    .editable(0, 100, 10, 'forced center down', 'make the center not the actual screen center', K('d'));

  param_b(P('tortoise_shading_enabled'), 'tortoise_shading', true);

  param_f(P('bounded_mine_percentage'), 'bounded_mine_freq')
    .editable(0, 1, 0.01, 'fraction of mine in bounded minefield', '', K('%'))
    .set_reaction(() => {
      if (G.game_active) { stop_game(); start_game(); }
    });

  param_enum_b(P('nisot_geodesic_movement'), 'solv_geodesic_movement', true)
    .editable([['Lie group', 'light, camera, and objects move in lines of constant direction, in the Lie group sense'], ['geodesics', 'light, camera, and objects always take the shortest path']], 'straight lines', K('G'))
    .set_reaction(() => {
      const pc = pconf();
      if (pc.model === mdLiePerspective && G.nisot_geodesic_movement) pc.model = hyperbolic() ? mdPerspective : mdGeodesic;
      if (among(pc.model, mdGeodesic, mdPerspective) && !G.nisot_geodesic_movement) pc.model = mdLiePerspective;
    });

  // s2xe::qrings, hybrid::underlying_scale, hybrid::underlying_as_pc: stage 3

  param_b(V('bubbles_special'), 'bubbles-special', true);
  param_b(V('bubbles_threshold'), 'bubbles-threshold', true);
  param_b(V('bubbles_all'), 'bubbles-all', false);

  // CAP_SHMUP
  multi_initConfig();

  // asonov::period_xy, period_z, nilv::nilperiod[0..2]: stage 3

  const neon_options: [string, string][] = [['OFF', ''], ['standard', ''], ['no boundary mode', ''], ['neon mode II', ''], ['illustration mode', '']];

  param_enum(P('neon_mode'), 'neon_mode', G.neon_mode).editable(neon_options, 'neon mode', K('M'));

  param_enum(P('neon_magic_vision'), 'neon_magic_vision', G.neon_magic_vision).editable(neon_options, 'neon mode in magic vision', K('V'))
    .add_extra(() => { dialog_addHelp_s(XLAT('Some Orbs let you see tiles you would not normally see. Such tiles can be shown differently.')); });

  param_enum(P('bow_weapon'), 'pc_class', G.bow_weapon)
    .editable([['blade', 'Standard Rogue weapon. Bump into a monster to hit. Most monsters attack you the same way.'],
      ['crossbow', 'Hits all monsters in a straight line, but slow to reload.']],
    'weapon selection', K('w'))
    .set_need_confirm()
    .set_value_to = (wpn) => {
      const b = G.game_active; if (wpn !== G.bow_weapon) stop_game(); G.bow_weapon = wpn as number;
      G.peace_on = false; if (G.dual_state) dual_disable(); if (G.multi_players > 1 && !G.shmup_on) G.multi_players = 1;
      if (b) start_game();
    };
  param_enum(P('bow_style'), 'bow_style', G.bow_style)
    .editable([['bull line', 'Can go in either direction on odd shapes. 3 turns to reload.'],
      ['geodesic', 'Graph geodesic: any sequence of tiles is OK as long as there are no shortcuts. 4 turns to reload.'],
      ['geometric', 'Approximations of geometric straight lines.']],
    'crossbow straight line style', K('l'))
    .set_need_confirm()
    .set_value_to = (s) => { const b = G.game_active; if (s !== G.bow_style) stop_game(); G.bow_style = s as number; if (b) start_game(); };
  param_b(P('bow_bump_to_shoot'), 'bump_to_shoot', true).editable('bump to shoot', K('b'));
  param_enum(P('bow_mouse_fire_mode'), 'mouse_fire_mode', 1 /* bow::mfmPriority */)
    .editable([['explicit', 'You need to click crossbow or be close to fire.'],
      ['priority', 'Click on a faraway monster to fire if possible, or move if not.'],
      ['always', 'Clicking on a faraway monster always means an attempt to fire.']],
    'mouse auto-fire mode', K('m'));

  param_enum(V('msgleft'), 'message_style', 2)
    .editable([['centered', ''], ['left-aligned', ''], ['line-broken', '']], 'message style', K('a'));

  param_enum_b(P('neon_nofill'), 'neon_nofill', G.neon_nofill);
  param_b(P('noshadow'), 'noshadow');
  param_b(P('bright'), 'bright');
  param_b(P('cblind'), 'cblind');

  param_i(P('berger_limit'), 'berger_limit');

  param_enum(P('centering'), 'centering', G.centering);

  param_f(P('camera_speed'), ['camspd', 'camera-speed'], 1);
  param_f(P('camera_rot_speed'), ['camrot', 'camera-rot-speed'], 1);
  param_f(P('third_person_rotation'), 'third_person_rotation', 0);

  param_f(V('stereo_param'), 'stereo_param', 0.9)
    .editable(-1, 1, 0.9, 'stereographic/Panini parameter', '1 for full stereographic/Panini projection. Lower values reduce the effect.\n\n' +
      'HyperRogue uses ' +
      'a quick implementation, so parameter values too close to 1 may ' +
      'be buggy (outside of raycasting); try e.g. 0.9 instead.', K('d'))
    .set_reaction(reset_all_shaders);

  callhooks(G.hooks_configfile);

  // CAP_SHOT
  param_f(P('levellines'), 'levellines', 0);

  // CAP_CONFIG
  for (const s of sorted_params()) s.reset();

  param_custom_int(P('sightrange_bonus'), 'sightrange_bonus', menuitem_sightrange_bonus, K('r'));
  param_custom_int(V('use_smart_range'), 'sightrange_style', menuitem_sightrange_style, K('s'));

  param_custom_int(E(G.gp_param, 0), 'Goldberg x', menuitem_change_variation, 0);
  param_custom_int(E(G.gp_param, 1), 'Goldberg y', menuitem_change_variation, 0);
  param_custom_int(P('variation'), ['variation', 'mode-variation'], menuitem_change_variation, K('v'))
    .help_text = 'variation|dual|bitruncated';
  param_custom_int(P('geometry'), ['geometry', 'mode-geometry'], menuitem_change_geometry, 0)
    .help_text = 'hyperbolic|spherical|Euclidean';

  param_i(P('stamplen'), 'stamplen');
  // param_f(anims::period, "animperiod"): stage 3 (animations)

  param_b(P('unlock_all'), 'unlock_all')
    .editable('allow access to all unlockable content', K('U'));

  param_b(P('use_custom_land_list'), 'customland_use').be_non_editable();
  for (let i = 0; i < landtypes; i++) {
    G.custom_land_list[i] = true;
    G.custom_land_treasure[i] = 100;
    G.custom_land_difficulty[i] = 100;
    G.custom_land_wandering[i] = 100;
    param_b(E(G.custom_land_list, i), 'customland' + its(i) + 'i', true).be_non_editable();
    param_i(E(G.custom_land_treasure, i), 'customland' + its(i) + 't', 100).be_non_editable();
    param_i(E(G.custom_land_difficulty, i), 'customland' + its(i) + 'd', 100).be_non_editable();
    param_i(E(G.custom_land_wandering, i), 'customland' + its(i) + 'w', 100).be_non_editable();
    param_i(E(G.custom_land_ptm_runs, i), 'customland' + its(i) + 'r', 100).be_non_editable();
    param_i(E(G.custom_land_ptm_mult, i), 'customland' + its(i) + 'm', 100).be_non_editable();
  }
}

/** geom3::switch_fpp (the first-person 3D view: stage 3) */
function geom3_switch_fpp(): void { throw new NotPorted('geom3::switch_fpp (3D, stage 3)'); } // STAGE2-STUB (3D)
/** reset_all_shaders() (GL: the port has no shaders) */
function reset_all_shaders(): void { }

// multi::initConfig: multi.ts

/** EX int config3 = addHook(hooks_configfile, 100, ...) */
function config3(): void {
  param_f(V('eye'), 'eyelevel', 0)
    .editable(-5, 5, .1, 'eye level', '', K('E'))
    .set_extra(() => {
      dialog_get_di().dialogflags |= sm.CENTER;

      dialog_addHelp_s(XLAT('In the FPP mode, the camera will be set at this altitude (before applying shifts).'));

      dialog_addBoolItem(XLAT('auto-adjust to eyes on the player model'), G.vid.auto_eye, K('O'));
      dialog_get_di().reaction = () => { G.vid.auto_eye = false; };
      dialog_add_action(() => {
        G.vid.auto_eye = !G.vid.auto_eye;
        throw new NotPorted('geom3::do_auto_eye (3D, stage 3)'); // STAGE2-STUB (3D)
      });
    })
    .set_reaction(() => { update_linked('tc_camera'); });

  param_b(V('auto_eye'), 'auto-eyelevel', false);

  param_b(P('nomenukey'), 'nomenukey');
  param_b(P('showstartmenu'), 'showstartmenu');
  param_b(P('draw_centerover'), 'draw_centerover');

  param_enum(P('nohelp'), 'help_messages', 0)
    .editable([
      ['all', 'all context help/welcome messages'],
      ['none', 'no context help/welcome messages'],
      ['automatic', 'I know I can press F1 for help'],
    ], 'context help', K('H'));

  param_f(V('creature_scale'), ['creature_scale', '3d-creaturescale'], 1)
    .editable(0, 1, .1, 'Creature scale', '', K('C'))
    .set_extra(() => { dialog_addInfo(XLAT('changing this during shmup is counted as cheating')); })
    .set_reaction(() => { propagate_scale_change(); if (G.shmup_on) G.cheater++; });
  param_f(V('height_width'), ['heiwi', '3d-heightwidth'], 1.5)
    .editable(0, 1, .1, 'Height to width', '', K('h'));
  param_f(V('yshift'), ['yshift', 'Y shift'], 0)
    .editable(0, 1, .1, 'Y shift', 'Don\'t center on the player character.', K('y'))
    .set_extra(() => {
      if (WDIM() === 3 && pconf().model === mdPerspective)
        dialog_addBoolItem_action(XLAT('reduce if walls on the way'), V('use_wall_radar'), K('R'));
    });
  param_b(V('use_wall_radar'), 'wallradar', true);
  param_b(V('fixed_facing'), 'fixed facing', false);
  param_f(V('fixed_facing_dir'), 'fixed facing dir', 90);
  param_b(V('fixed_yz'), 'fixed YZ', true);
  param_b(P('frustum_culling'), 'frustum_culling');
  param_b(P('numerical_minefield'), 'numerical_minefield')
    .editable('toggle numerical display', K('n'));
  param_b(P('mine_hollow'), 'mine_hollow')
    .editable('hollow mine symbols', K('h'));
  param_b(P('mine_markers'), 'mine_markers')
    .editable('markers on possible mines', K('m'));
  param_i(P('mine_opacity'), 'minefield opacity', 255)
    .editable(0, 255, 51, 'opacity of undiscovered minefield', '3D modes only\n\n0 = invisible, 255 = fully opaque', K('o'));
  param_enum(P('mine_zero_display'), 'minefield_zero', 1)
    .editable([['OFF', 'never display zeros'], ['3D', 'only in 3D modes'], ['ON', 'always display zeros']], 'display zeros in minefield', K('z'));
  param_b(P('dont_display_minecount'), 'dont_display_minecount');
  // MAXMDIM >= 4: draw_sky, use_euclidean_infinity (the sky: stage 3)
  // linepatterns::parallel_count, parallel_max, mp_ori, meridian_*, dual_length, dual_angle(3): stage 3

  param_f(P('twopoint_xscale'), 'twopoint_xscale');
  param_i(P('twopoint_xshape'), 'twopoint_xshape');
  param_f(P('twopoint_xwidth'), 'twopoint_xwidth');
  param_f(P('periodwidth'), 'periodwidth', 1);

  param_b(P('draw_plain_floors'), 'draw_plain_floors', false)
    .editable('draw plain floors in 3D', K('p'));
  param_i(P('default_flooralpha'), 'floor_alpha')
    .editable(0, 255, 15, 'floor alpha', '255 = opaque', K('a'));

  param_f(V('depth_bonus'), 'depth_bonus', 0)
    .editable(-5, 5, .1, 'depth bonus in pseudohedral', '', K('b'));
  param_enum(V('pseudohedral'), 'pseudohedral', 0 /* phOFF */)
    .editable(
      [['OFF', 'the tiles are curved'],
        ['inscribed', 'the tiles are inscribed'],
        ['circumscribed', 'the tiles are circumscribed']],
      'make the tiles flat', K('p'));
  param_f(V('depth'), ['depth', '3D depth'], 1)
    .editable(0, 5, .1, 'Ground level below the plane', '', K('d'))
    .set_extra(() => {
      G.help = XLAT(
        'Ground level is actually an equidistant surface, ' +
        '%1 absolute units below the plane P. ' +
        'Theoretically, this value affects the world -- ' +
        'for example, eagles could fly %2 times faster by ' +
        'flying above the ground level, on the plane P -- ' +
        'but the actual game mechanics are not affected. ', fts(G.vid.depth), fts(Math.cosh(G.vid.depth)));
      if (GDIM() === 2)
        G.help += XLAT(
          '(Distances reported by the vector graphics editor ' +
          'are not about points on the ground level, but ' +
          'about the matching points on the plane P -- ' +
          'divide them by the factor above to get actual ' +
          'distances.)',
        );
      if (GDIM() === 3 && pconf().model === mdPerspective && !euclid())
        throw new NotPorted('the depth help in 3D (radar_transform)'); // STAGE2-STUB (3D)
      dialog_addHelp_s(G.help);
    })
    .set_reaction(() => {
      update_linked('tc_depth');
      geom3_apply_settings_light();
    });
  param_f(V('camera'), ['camera', '3D camera level'], 1)
    .editable(0, 5, .1, '', '', K('c'))
    .modif((x) => { x.menu_item_name = (GDIM() === 2 ? 'Camera level above the plane' : 'Z shift'); })
    .set_extra(() => {
      if (GDIM() === 2)
        dialog_addHelp_s(XLAT(
          'Camera is placed %1 absolute units above a plane P in a three-dimensional ' +
          'world. Ground level is actually an equidistant surface, %2 absolute units ' +
          'below the plane P. The plane P (as well as the ground level or any ' +
          'other equidistant surface below it) is viewed at an angle of %3 ' +
          '(the tangent of the angle between the point in ' +
          'the center of your vision and a faraway location is 1/cosh(c) = %4).',
          fts(G.vid.camera),
          fts(G.vid.depth),
          fts(Math.atan(1 / Math.cosh(G.vid.camera)) * 2 / degree),
          fts(1 / Math.cosh(G.vid.camera))));
      if (GDIM() === 3)
        dialog_addHelp_s(XLAT('Look from behind.'));
      if (GDIM() === 3 && pconf().model === mdPerspective)
        dialog_addBoolItem_action(XLAT('reduce if walls on the way'), V('use_wall_radar'), K('R'));
    })
    .set_reaction(() => {
      update_linked('tc_camera');
    });
  param_f(V('wall_height'), ['wall_height', '3D wall height'], .3)
    .editable(0, 1, .1, 'Height of walls', '', K('w'))
    .set_extra(() => {
      dialog_addHelp_s(GDIM() === 3 ? '' : XLAT(
        'The height of walls, in absolute units. For the current values of g and c, ' +
        'wall height of %1 absolute units corresponds to projection value of %2.',
        fts(geom3_actual_wall_height()), fts(geom3_factor_to_projection(cgi().WALL))));
      dialog_addBoolItem(XLAT('auto-adjust in Goldberg grids'), G.vid.gp_autoscale_heights, K('O'));
      dialog_add_action(() => {
        G.vid.gp_autoscale_heights = !G.vid.gp_autoscale_heights;
      });
    })
    .set_reaction(geom3_apply_settings_light);
  param_f(V('rock_wall_ratio'), ['rock_wall_ratio', '3D rock-wall ratio'], .9)
    .editable(0, 1, .1, 'Rock-III to wall ratio', '', K('r'))
    .set_extra(() => {
      dialog_addHelp_s(XLAT(
        'The ratio of Rock III to walls is %1, so Rock III are %2 absolute units high. ' +
        'Length of paths on the Rock III level is %3 of the corresponding length on the ' +
        'ground level.',
        fts(G.vid.rock_wall_ratio), fts(G.vid.wall_height * G.vid.rock_wall_ratio),
        fts(Math.cosh(G.vid.depth - G.vid.wall_height * G.vid.rock_wall_ratio) / Math.cosh(G.vid.depth))));
    });
  param_f(V('human_wall_ratio'), ['human_wall_ratio', '3D human-wall ratio'], .7)
    .editable(0, 1, .1, 'Human to wall ratio', '', K('h'))
    .set_extra(() => {
      dialog_addHelp_s(XLAT(
        'Humans are %1 ' +
        'absolute units high. Your head travels %2 times the distance travelled by your ' +
        'feet.',
        fts(G.vid.wall_height * G.vid.human_wall_ratio),
        fts(Math.cosh(G.vid.depth - G.vid.wall_height * G.vid.human_wall_ratio) / Math.cosh(G.vid.depth))),
      );
    });
  const unitwarn =
    'The unit this value is given in is wall height. ' +
    'Note that, in exponentially expanding spaces, too high values could cause rendering issues. So ' +
    'if you want infinity, values of 5 or similar should be used -- there is no visible difference ' +
    'from infinity and glitches are avoided.';
  param_f(V('lake_top'), ['lake_top', '3D lake top'], .25)
    .editable(0, 1, .1, 'Level of water surface', unitwarn, K('l'));
  param_f(V('lake_shallow'), ['lake_shallow', '3D lake shallow'], .4)
    .editable(0, 1, .1, 'Level of shallow water', unitwarn, K('s'));
  param_f(V('lake_bottom'), ['lake_bottom', '3D lake bottom'], .9)
    .editable(0, 1, .1, 'Level of water bottom', unitwarn, K('k'));
  param_f(V('wall_height2'), 'wall_height2', 2)
    .editable(0, 5, .1, 'ratio of high walls to normal walls', unitwarn, K('2'));
  param_f(V('wall_height3'), 'wall_height3', 3)
    .editable(0, 5, .1, 'ratio of very high walls to normal walls', unitwarn, K('3'));
  param_f(V('lowsky_height'), 'lowsky_height', 2)
    .editable(0, 5, .1, 'sky fake height', 'Sky is rendered at the distance computed based on ' +
      'the sky height, which might be beyond the range visible in fog. To prevent this, ' +
      'the intensity of the fog effect depends on the value here rather than the actual distance. ' +
      'Stars are affected similarly.', K('4'));
  // MAXMDIM >= 4
  param_fd(V('sky_height'), 'sky_height')
    .set_hint(() => geom3_to_wh(cgi().SKY))
    .editable(0, 10, .1, 'altitude of the sky', unitwarn, K('5'))
    .set_reaction(delete_sky);
  param_fd(V('star_height'), 'star_height')
    .set_hint(() => geom3_to_wh(cgi().STAR))
    .editable(0, 10, .1, 'altitude of the stars', unitwarn, K('6'));
  param_fd(V('infdeep_height'), 'infdeep_height')
    .set_hint(() => geom3_to_wh(cgi().INFDEEP))
    .editable(0, 10, .1, 'infinite depth', unitwarn, K('7'));
  param_f(V('sun_size'), 'sun_size', 8)
    .editable(0, 10, .1, 'sun size (relative to item sizes)', '', K('8'));
  param_f(V('star_size'), 'star_size', 0.75)
    .editable(0, 10, .1, 'night star size (relative to item sizes)', '', K('9'));
  // MAXMDIM >= 4: star_prob (the sky: stage 3)
  param_b(V('height_limits'), 'height_limits', true)
    .editable('prevent exceeding recommended altitudes', K('l'));
  // auto_remove_roofs (3D: stage 3)
  param_i(V('tc_depth'), '3D TC depth', 1);
  param_i(V('tc_camera'), '3D TC camera', 2);
  param_i(V('tc_alpha'), '3D TC alpha', 3);
  param_f(V('highdetail'), ['highdetail', '3D highdetail'], 8)
    .editable(0, 5, .5, 'High detail range', '', K('n'))
    .set_extra(explain_detail)
    .set_reaction(() => {
      if (G.vid.highdetail > G.vid.middetail) G.vid.middetail = G.vid.highdetail;
    });
  param_f(V('middetail'), ['middetail', '3D middetail'], 8)
    .editable(0, 5, .5, 'Mid detail range', '', K('m'))
    .set_extra(explain_detail)
    .set_reaction(() => {
      if (G.vid.highdetail > G.vid.middetail) G.vid.highdetail = G.vid.middetail;
    });
  param_i(P('debug_tiles'), 'debug_tiles').editable(0, 2, 1,
    'display tile debug values',
    'Display cell type IDs, as well as vertex and edge identifiers.\n\n' +
    'Setting 1 uses the internal shape IDs, while setting 2 in tes files uses ' +
    'the original IDs in case if extra tile types were added to ' +
    'separate mirror images or different football types.', K('d'));
  param_b(P('debug_voronoi'), 'debug_voronoi').editable(
    'display Voronoi tie debug values', K('d'));
  param_i(P('horodisk_from'), 'horodisk_from', -2).editable(-10, 10, 1,
    'land size in horodisk mode',
    'Set this to -2 to get perfect horodisks. Smaller values yield less dense horodisks, and ' +
    'larger values might produce horodisks with errors or crashing into each other.', K('H'));
  param_i(P('randomwalk_size'), 'randomwalk_size', 10).editable(2, 100, 1,
    'land size in randomwalk mode',
    'The average size of a land in randomwalk mode.', K('R'))
    .set_reaction(() => { if (G.game_active) { stop_game(); start_game(); } });
  param_i(P('landscape_div'), 'landscape_div').editable(1, 100, 1,
    'land size in landscape structure',
    'Each cell gets three coordinates, each of which change smoothly, using the same method as used for the generation of landscapes e.g. in Dragon Chasms. ' +
    'Then, we find a cell of the bitruncated cubic honeycomb at these cordinates, and this cell determines which land it is. The bigger the value, the larger the lands.', K('R'))
    .set_sets(() => { dialog_bound_low(1); })
    .set_reaction(() => { if (G.game_active) { stop_game(); start_game(); } });

  param_enum(P('warn_before_killing_friends'), 'warn_before_killing_friends', 2)
    .editable([['OFF', 'never warn'], ['TAME_BOMBERBIRDS', 'warn only for Tame Bomberbirds'], ['ON', 'always warn']], 'warn before killing friendly monsters', K('W'));

  param_i(P('curse_percentage'), 'curse_percentage').editable(0, 100, 1,
    'curse percentage',
    'The percentage of towers in Cursed Walls mode to be manned by Canyon Hags', K('R'))
    .set_reaction(() => { if (G.game_active) { stop_game(); start_game(); } });

  param_f(P('global_boundary_ratio'), 'global_boundary_ratio')
    .editable(0, 5, 0.1, 'Width of cell boundaries',
      'How wide should the cell boundaries be.', K('0'));
  param_b(V('gp_autoscale_heights'), '3D Goldberg autoscaling', true);
  const scf = param_str(P('scorefile'), 'savefile');
  scf.be_non_editable(); scf.reaction = () => { if (G.save_loaded) exit(1); };
  param_b(P('savefile_selection'), 'savefile_selection')
    .editable('select the score/save file on startup', K('s'))
    .set_reaction(() => {
      if (G.savefile_selection)
        addMessage(XLAT('Save the config and restart to select another score/save file.'));
      else if (G.scorefile === '')
        addMessage(XLAT('Save the config to always play without recording your progress.'));
      else
        addMessage(XLAT('Save the config to always use %1.', G.scorefile));
    });

  // param_i(tour::tour_value, "tval"), param_ccolor(ccolor::which, "pattern"): stage 3 (the tour, the canvas)
  param_b(P('ccolor_live_canvas'), 'live_canvas')
    .editable('apply color/pattern changes to canvas automatically', K('l'));
  param_str(P('ccolor_color_formula'), 'color_formula')
    .editor = () => { throw new NotPorted('ccolor::config_formula (the canvas colourings: stage 3)'); }; // STAGE2-STUB

  param_i(P('count_max_cells'), 'count_max_cells', 100000).editable(100, 1000000, Math.log(10), 'max cells to count',
    'Counting stops if that many cells are reached.', K('c'))
    .set_sets(() => { dialog_scaleLog(); });

  param_i(P('count_max_dist'), 'count_max_dist', 999).editable(5, 1000, 1, 'max distance to check',
    'Counting stops if this distance is reached.', K('d'));

  param_b(P('use_analyzer'), 'count_use_analyzer', true).editable('use analyzer if possible', K('a'));
  param_b(P('use_sight_range_instead'), 'count_use_sight', true).editable('use sight range instead', K('s'));
}

/** delete_sky() (the sky: stage 3; nothing to delete) */
function delete_sky(): void { }

/** EX bool inSpecialMode() */
export function inSpecialMode(): boolean {
  const p = pconf();
  return !ls_nice_walls() || G.ineligible_starting_land || !BITRUNCATED() || G.peace_on ||
    // CAP_TOUR
    G.tour_on ||
    G.yendor_on || G.tactic_on || G.randomPatternsMode ||
    G.geometry !== gNormal || p.model !== mdDisk || p.alpha !== 1 || p.scale !== 1 ||
    G.rug_rugged || G.vid.monmode !== DEFAULT_MONMODE ||
    G.vid.wallmode !== DEFAULT_WALLMODE;
}

/** EX bool have_current_settings() */
export function have_current_settings(): boolean {
  let modecount = 0;
  if (G.inv_on) modecount++;
  if (G.shmup_on) modecount += 10;
  // CAP_TOUR
  if (G.tour_on) modecount += 10;
  if (!ls_nice_walls()) modecount += 10;
  if (!BITRUNCATED()) modecount += 10;
  if (G.peace_on) modecount += 10;
  if (G.yendor_on) modecount += 10;
  if (G.tactic_on) modecount += 10;
  if (G.randomPatternsMode) modecount += 10;
  if (G.geometry !== gNormal) modecount += 10;

  if (modecount > 1)
    return true;

  return false;
}

/** EX bool have_current_graph_settings() */
export function have_current_graph_settings(): boolean {
  const p = pconf();
  if (p.xposition || p.yposition || p.alpha !== 1 || p.scale !== 1)
    return true;
  if (p.model !== mdDisk || G.vid.monmode !== DEFAULT_MONMODE || G.vid.wallmode !== DEFAULT_WALLMODE)
    return true;
  if (G.firstland !== laIce || G.multi_players !== 1 || G.rug_rugged)
    return true;

  return false;
}

/** EX void reset_graph_settings() */
export function reset_graph_settings(): void {
  const p = pconf();
  p.model = mdDisk; p.alpha = 1; p.scale = 1;
  p.xposition = p.yposition = 0;
  // CAP_RUG
  if (G.rug_rugged) throw new NotPorted('rug::close (the hypersian rug: stage 3)'); // STAGE2-STUB

  G.vid.monmode = DEFAULT_MONMODE;
  G.vid.wallmode = DEFAULT_WALLMODE;
}

/** EX void resetModes(char leave IS('c')) (leave: an rg:: mode letter) */
export function resetModes(leave: number = K('c')): void {
  while (G.game_active || gamestack_pushed()) {
    if (G.game_active) stop_game();
    if (gamestack_pushed()) gamestack_pop();
  }
  if (G.shmup_on !== (leave === rg_shmup)) stop_game_and_switch_mode(rg_shmup);
  if (G.inv_on !== (leave === rg_inv)) stop_game_and_switch_mode(rg_inv);

  /* we do this twice to make sure that stop_game_and_switch_mode switches to the correct land_structure */
  for (let i = 0; i < 2; i++) {
    if (leave === rg_chaos && !ls_std_chaos()) stop_game_and_switch_mode(rg_chaos);
    if (leave !== rg_chaos && !ls_nice_walls()) stop_game_and_switch_mode(rg_chaos);
  }

  if ((!!G.dual_state) !== (leave === rg_dualmode)) stop_game_and_switch_mode(rg_dualmode);

  if (G.peace_on !== (leave === rg_peace)) stop_game_and_switch_mode(rg_peace);
  // CAP_TOUR
  if (G.tour_on !== (leave === rg_tour)) stop_game_and_switch_mode(rg_tour);
  if (G.yendor_on !== (leave === rg_yendor)) stop_game_and_switch_mode(rg_yendor);
  if (G.tactic_on !== (leave === rg_tactic)) stop_game_and_switch_mode(rg_tactic);
  if (G.randomPatternsMode !== (leave === rg_randpattern)) stop_game_and_switch_mode(rg_randpattern);
  if (G.multi_players !== 1) {
    stop_game_and_switch_mode(); G.multi_players = 1;
  }
  if (G.firstland !== laIce || G.specialland !== laIce) {
    stop_game();
    G.firstland = laIce; G.specialland = laIce; stop_game_and_switch_mode();
  }

  set_geometry(gNormal);
  set_variation(leave === rg_heptagons ? eVariation.pure : eVariation.bitruncated);

  // CAP_TEXTURE: texture::config.tstate = texture::tsOff; (textures: stage 3, always off)

  G.mapeditor_drawplayer = true;
  start_game();
}

// CAP_CONFIG
/** EX void resetConfig() */
export function resetConfig(): void {
  const vid = G.vid;
  const rx = vid.xres, ry = vid.yres, rf = vid.fsize, rfs = vid.full;
  vid.xres = 0; vid.yres = 0; vid.fsize = 0; vid.full = false;
  try {
    for (const s of sorted_params())
      if (s.legacy_config_name.substring(0, 5) !== 'mode-')
        s.reset();
  }
  finally { vid.xres = rx; vid.yres = ry; vid.fsize = rf; vid.full = rfs; }
}

// EX debugflag debug_init_config = {"init_config", true};

/** EX void saveConfig() */
export function saveConfig(): void {
  // indenter_finish(debug_init_config, "saveConfig");
  const f = fopen(conffile_ref.v, 'wt');
  if (!f) {
    addMessage('Could not open the config file: ' + conffile_ref.v);
    return;
  }

  {
    const vid = G.vid;
    let pt_depth = 0, pt_camera = 0, pt_alpha = 0;
    if (vid.tc_depth > vid.tc_camera) pt_depth++;
    if (vid.tc_depth < vid.tc_camera) pt_camera++;
    if (vid.tc_depth > vid.tc_alpha) pt_depth++;
    if (vid.tc_depth < vid.tc_alpha) pt_alpha++;
    if (vid.tc_alpha > vid.tc_camera) pt_alpha++;
    if (vid.tc_alpha < vid.tc_camera) pt_camera++;
    vid.tc_alpha = pt_alpha;
    vid.tc_camera = pt_camera;
    vid.tc_depth = pt_depth;
  }

  // fprintf(f, "%s=%s\n", ...) for each parameter (one write: the storage gets the file once)
  let out = '';
  for (const s of sorted_params()) if (s.dosave())
    out += s.name + '=' + s.save() + '\n';
  fputs(out, f);

  fclose(f);
  // !ISMOBILE
  addMessage('Configuration saved to: ' + conffile_ref.v);
}

// void readf(FILE *f, ld& x): the legacy (CAP_LEGACY) format

/** map<string, shared_ptr<parameter>> allconfigs (file-local) */
const allconfigs = new Map<string, parameter>();

/** EX void parseline(const string& str) */
export function parseline(str: string): void {
  if (str[0] === '#') return;
  for (let i = 0; i < str.length; i++) if (str[i] === "=") {
    const cname = str.substring(0, i);
    if (!allconfigs.has(cname)) {
      printf('Warning: unknown config variable: ' + str + '\n');
      return;
    }
    const sav = allconfigs.get(cname)!;
    sav.load(str.substring(i + 1));
    return;
  }
  printf('Warning: config line without equality sign: ' + str + '\n');
}

/** EX void loadNewConfig(FILE *f): the rest of the file, from where fscanf stopped (given as text) */
export function loadNewConfig(text: string): void {
  const ds = G.delayed_start; G.delayed_start = true;
  try {
    for (const c of sorted_params()) { allconfigs.set(c.name, c); allconfigs.set(c.legacy_config_name, c); }
    let rd = '';
    for (const ch of text) {
      const c = ch.charCodeAt(0);
      if (c === 10 || c === 13) {
        if (rd !== '') parseline(rd);
        rd = '';
      }
      else rd += ch;
    }
    allconfigs.clear();
  }
  finally { G.delayed_start = ds; }
}

/** EX void loadConfig() */
export function loadConfig(): void {

  // indenter_finish(debug_init_config, "loadConfig");
  G.vid.xres = 9999; G.vid.yres = 9999; G.vid.framelimit = 999;
  const data = cfs.files.get(conffile_ref.v);
  if (data !== undefined) { // FILE *f = fopen(conffile.c_str(), "rt")
    // err=fscanf(f, "%d%d%d%d", &vid.xres, &vid.yres, &fs, &vid.fsize): the legacy format starts with four
    // numbers; the new one with a name, where the first %d fails and the file stays at the start of that word
    const sc = scan_ints(data, 4);
    if (sc.vals.length >= 1) G.vid.xres = sc.vals[0];
    if (sc.vals.length >= 2) G.vid.yres = sc.vals[1];
    if (sc.vals.length >= 4) G.vid.fsize = sc.vals[3];
    if (sc.vals.length !== 4)
      loadNewConfig(data.substring(sc.pos));
    else {
      G.vid.full = sc.vals[2] !== 0;
      // CAP_LEGACY: loadOldConfig(f) (the configuration files of HyperRogue before 10.0: not ported)
    }

    // if(debug_init_config) println(hlog, "Loaded configuration: ", conffile);
  }

  geom3_apply_always3();
  polygonal_solve();
  check_cgi();
  cgi().require_basics();
}

/** fscanf(f, "%d%d...") of n numbers: the values read and the position where it stopped (glibc skips the
 *  whitespace and fails on the first character that does not start a number; a failed conversion consumes
 *  nothing but the whitespace) */
function scan_ints(s: string, n: number): { vals: number[]; pos: number } {
  const vals: number[] = [];
  let i = 0;
  for (let k = 0; k < n; k++) {
    while (i < s.length && /\s/.test(s[i])) i++;
    let j = i;
    if (s[j] === '+' || s[j] === '-') j++;
    const ds = j;
    while (j < s.length && s[j] >= '0' && s[j] <= '9') j++;
    if (j === ds) break;
    vals.push(Number(BigInt.asIntN(32, BigInt(s.substring(i, j)))));
    i = j;
  }
  return { vals, pos: i };
}

/** EX void add_cells_drawn(char c IS('C')) */
export function add_cells_drawn(c: number = K('C')): void {
  dialog_addSelItem(XLAT('cells drawn'), (G.noclipped ? its(G.cells_drawn) + ' (' + its(G.noclipped) + ')' : its(G.cells_drawn)) + ' / ' + its(G.vid.cells_drawn_limit), c);
  dialog_add_action(() => {
    dialog_editNumber_n(V('cells_drawn_limit'), 100, 1000000, Math.log(10), 10000, XLAT('limit on cells drawn'),
      XLAT('This limit exists to protect the engine from freezing when too many cells would be drawn according to the current options.'),
    );
    dialog_scaleLog();
  });
  if (WDIM() === 3 || G.vid.use_smart_range === 2) {
    dialog_addSelItem(XLAT('limit generated cells per frame'), its(G.vid.cells_generated_limit), K('L'));
    dialog_add_action(() => {
      dialog_editNumber_n(V('cells_generated_limit'), 1, 1000, Math.log(10), 25, XLAT('limit generated cells per frame'),
        XLAT('In the 3D mode, lowering this value may help if the game lags while exploring new areas.'),
      );
    });
  }
}

// string solhelp(): CAP_SOLV (Solv: stage 3)

/** EX void menuitem_sightrange_bonus(key_type c) */
export function menuitem_sightrange_bonus(c: key_type): void {
  dialog_addSelItem(XLAT('sight range bonus'), its(G.sightrange_bonus), c);
  dialog_add_action(() => {
    dialog_editNumber_n(P('sightrange_bonus'), -5, allowIncreasedSight() ? 3 : 0, 1, 0, XLAT('sight range'),
      XLAT('Roughly 42% cells are on the edge of your sight range. Reducing ' +
        'the sight range makes HyperRogue work faster, but also makes ' +
        'the game effectively harder.'));
    dialog_get_di().reaction = doOvergenerate;
    dialog_bound_low(1 - getDistLimit());
    dialog_bound_up(allowIncreasedSight() ? euclid() ? 99 : gp_dist_2() * 5 : 0);
  });
}

/** EX void edit_sightrange_3d(key_type key, bool fog) */
export function edit_sightrange_3d(key: key_type, fog: boolean): void {
  dialog_addSelItem(fog ? XLAT('3D sight range for the fog effect') : ('3D sight range'), fts(G.sightranges[G.geometry]), key);
  dialog_add_action(() => {
    dialog_editNumber(sightrange(G.geometry), 0, TAU, 0.5, M_PI, XLAT('3D sight range'),
      XLAT(
        'Sight range for 3D geometries is specified in the absolute units. This value also affects the fog effect.\n\n' +
        'In spherical geometries, the sight range of 2π will let you see things behind you as if they were in front of you, ' +
        'and the sight range of π (or more) will let you see things on the antipodal point just as if they were close to you.\n\n' +
        'In hyperbolic geometries, the number of cells to render depends exponentially on the sight range. More cells to drawn ' +
        'reduces the performance.\n\n' +
        'Sight range affects the gameplay, and monsters act iff they are visible. Monster generation takes this into account.',
      ),
    );
    dialog_get_di().extra_options = () => { add_cells_drawn(K('C')); };
  });
}

/** EX void edit_sightrange() */
export function edit_sightrange(): void {
  G.cmode = sm.SIDE;
  gamescreen();
  dialog_init_t('sight range settings');
  add_edit(V('use_smart_range'));
  const wdim = WDIM();
  // CAP_RUG: USING_NATIVE_GEOMETRY_IN_RUG (the rug: stage 3)
  if (G.vid.use_smart_range) {
    add_edit(wdim === 2 ? V('smart_range_detail') : V('smart_range_detail_3'));
    if (GDIM() === 3) edit_sightrange_3d(K('r'), true);
  }
  else {
    if (wdim === 2) {
      add_edit(P('sightrange_bonus'));
      if (GDIM() === 3) edit_sightrange_3d(K('r'), true);
    }
    if (wdim === 3) edit_sightrange_3d(K('r'), false);
  }
  // CAP_SOLV: the Solv ranges (models::is_perspective(pmodel) && sol), sl2: stage 3
  if (G.vid.use_smart_range && wdim === 2) {
    dialog_addBoolItem_action(XLAT('area-based range'), V('smart_area_based'), K('a'));
  }
  if (G.vid.use_smart_range === 0 && allowChangeRange() && wdim === 2) {
    dialog_addSelItem(XLAT('generation range bonus'), its(G.genrange_bonus), K('o'));
    dialog_add_action(() => { G.genrange_bonus = G.sightrange_bonus; doOvergenerate(); });
    dialog_addSelItem(XLAT('game range bonus'), its(G.gamerange_bonus), K('s'));
    dialog_add_action(() => { G.gamerange_bonus = G.sightrange_bonus; doOvergenerate(); });
  }
  if (wdim === 3 && !G.vid.use_smart_range) {
    add_edit(V('sloppy_3d'));
  }
  if (GDIM() === 3 && !G.vid.use_smart_range) {
    dialog_addSelItem(XLAT('limit generation'), fts(G.extra_generation_distance), K('e'));
    dialog_add_action(() => {
      dialog_editNumber(P('extra_generation_distance'), 0, 999, 0.5, 999, XLAT('limit generation'),
        'Cells over this distance will not be generated, but they will be drawn if they are already generated and in the sight range.',
      );
    });
  }
  add_cells_drawn(K('c'));
  dialog_display();
}

/** EX void menuitem_sightrange_style(key_type c IS('c')) */
export function menuitem_sightrange_style(c: key_type = K('c')): void {
  dialog_addSelItem(XLAT('draw range based on'),
    G.vid.use_smart_range === 0 ? XLAT('distance') :
      G.vid.use_smart_range === 1 ? XLAT('size (no gen)') :
        XLAT('size'),
    c,
  );
  dialog_add_action_push(() => {
    G.cmode = sm.VR_MENU | sm.NOSCR;
    gamescreen();
    dialog_init_t(XLAT('draw range based on'));
    dialog_addBoolItem(XLAT('draw range based on distance'), G.vid.use_smart_range === 0, K('d'));
    dialog_add_action(() => { G.vid.use_smart_range = 0; popScreen(); edit_sightrange(); });
    if (WDIM() === 2 && allowIncreasedSight()) {
      dialog_addBoolItem(XLAT('draw based on size in the projection (no generation)'), G.vid.use_smart_range === 1, K('n'));
      dialog_add_action(() => { G.vid.use_smart_range = 1; popScreen(); edit_sightrange(); });
    }
    if (allowChangeRange() && allowIncreasedSight()) {
      dialog_addBoolItem(XLAT('draw based on size in the projection (generation)'), G.vid.use_smart_range === 2, K('g'));
      dialog_add_action(() => { G.vid.use_smart_range = 2; popScreen(); edit_sightrange(); });
    }
    if (!allowChangeRange() || !allowIncreasedSight()) {
      dialog_addItem(XLAT('enable the cheat mode for additional options'), K('X'));
      dialog_add_action(enable_cheat);
    }
    dialog_display();
  });
}

/** EX void menuitem_sightrange(key_type c IS('c')) */
export function menuitem_sightrange(c: key_type = K('c')): void {
  // CAP_SOLV: if(pmodel == mdGeodesic && sol) (Solv: stage 3)
  if (G.vid.use_smart_range)
    dialog_addSelItem(XLAT('sight range settings'), fts(WDIM() === 3 ? G.vid.smart_range_detail_3 : G.vid.smart_range_detail) + ' px', c);
  else if (WDIM() === 3)
    dialog_addSelItem(XLAT('sight range settings'), fts(G.sightranges[G.geometry]) + 'au', c);
  else
    dialog_addSelItem(XLAT('sight range settings'), format('%+d', G.sightrange_bonus), c);
  dialog_add_action_push(edit_sightrange);
}

/** EX void sets_sfx_volume() (CAP_AUDIO) */
export function sets_sfx_volume(): void {
  dialog_get_di().dialogflags = sm.NOSCR;
  dialog_bound_low(0);
  dialog_bound_up(128); // MIX_MAX_VOLUME
}

/** EX void sets_music_volume() (CAP_AUDIO) */
export function sets_music_volume(): void {
  dialog_get_di().dialogflags = sm.NOSCR;
  dialog_get_di().reaction = () => {
    // CAP_SDLAUDIO
    Mix_VolumeMusic(G.musicvolume);
  };
  dialog_bound_low(0);
  dialog_bound_up(128); // MIX_MAX_VOLUME
  // CAP_SDLAUDIO
  dialog_get_di().extra_options = () => {
    dialog_addBoolItem_action(XLAT('play music when out of focus'), P('music_out_of_focus'), K('A'));
  };
}

/** EX void showSpecialEffects() */
export function showSpecialEffects(): void {
  G.cmode = G.vid.xres > G.vid.yres * 1.4 ? sm.SIDE : sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('extra graphical effects'));

  dialog_addBoolItem_action(XLAT('particles on attack'), V('particles'), K('p'));
  dialog_addBoolItem_action(XLAT('floating bubbles: special'), V('bubbles_special'), K('s'));
  dialog_addBoolItem_action(XLAT('floating bubbles: treasure thresholds'), V('bubbles_threshold'), K('t'));
  dialog_addBoolItem_action(XLAT('floating bubbles: all treasures'), V('bubbles_all'), K('a'));
  dialog_addBoolItem_action(XLAT('background particle effects'), V('backeffects'), K('b'));

  add_edit(P('festive_option'));

  dialog_addBreak(50);
  dialog_addBack();
  dialog_display();
}

/** EX void show_vector_settings() */
export function show_vector_settings(): void {
  G.cmode = G.vid.xres > G.vid.yres * 1.4 ? sm.SIDE : sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('vector settings'));

  dialog_addSelItem(XLAT('line width'), fts(G.vid.linewidth), K('w'));
  dialog_add_action(() => {
    dialog_editNumber(V('linewidth'), 0, 10, 0.1, 1, XLAT('line width'),
      G.vid.usingGL ? '' : XLAT('Line width setting is only taken into account in OpenGL.'));
  });

  dialog_addSelItem(XLAT('line quality'), its(G.vid.linequality), K('l'));
  dialog_add_action(() => {
    dialog_editNumber_n(V('linequality'), -3, 5, 1, 1, XLAT('line quality'),
      XLAT('Higher numbers make the curved lines smoother, but reduce the performance.'));
  });

  dialog_addBoolItem('perfect width', G.perfect_linewidth === 2, K('p'));
  if (G.perfect_linewidth === 1)
    dialog_lastItem().value = XLAT('shots only');
  dialog_add_action(() => { G.perfect_linewidth = (1 + G.perfect_linewidth) % 3; });

  dialog_addBoolItem_action('finer lines at the boundary', V('fineline'), K('O'));

  if (G.vid.fineline) {
    dialog_addSelItem('variable width', fts(G.precise_width), K('m'));
    dialog_add_action(() => {
      dialog_editNumber(P('precise_width'), 0, 2, 0.1, 0.5,
        XLAT('variable width'), XLAT('lines longer than this value will be split into shorter lines, with width computed separately for each of them.'),
      );
    });
  }
  else dialog_addBreak(100);

  add_edit(P('neon_mode'));
  dialog_addBreak(100);
  dialog_addInfo(XLAT('hint: press Alt while testing modes'));
  dialog_addBreak(100);
  dialog_addBoolItem_action(XLAT('disable shadows'), P('noshadow'), K('f'));
  dialog_addBoolItem_action(XLAT('bright mode'), P('bright'), K('g'));
  dialog_addBoolItem_action(XLAT('colorblind simulation'), P('cblind'), K('h'));

  dialog_addBoolItem_action(XLAT('no fill in neon mode'), P('neon_nofill'), K('n'));

  dialog_addBreak(50);
  dialog_addBack();
  dialog_display();
}

/** void show_animation_speed_settings() */
function show_animation_speed_settings(): void {
  G.cmode = G.vid.xres > G.vid.yres * 1.4 ? sm.SIDE : sm.MAYDARK;
  gamescreen();

  dialog_init_t(XLAT('animation speed'));

  dialog_addSelItem(XLAT('scrolling speed'), fts(G.vid.sspeed), K('a'));
  dialog_add_action(() => {
    dialog_editNumber(V('sspeed'), -5, 5, 1, 0,
      XLAT('scrolling speed'),
      XLAT('+5 = center instantly, -5 = do not center the map') +
      '\n\n' +
      XLAT('press Space or Home to center on the PC'));
  });

  dialog_addSelItem(XLAT('camera movement speed'), fts(G.camera_speed), K('c'));
  dialog_add_action(() => {
    dialog_editNumber(P('camera_speed'), -10, 10, 0.1, 1, XLAT('camera movement speed'),
      'This affects:\n\nin 2D: scrolling with arrow keys and Wheel Up\n\nin 3D: camera movement with Home/End.',
    );
  });
  dialog_addSelItem(XLAT('camera rotation speed'), fts(G.camera_rot_speed), K('r'));
  dialog_add_action(() => {
    dialog_editNumber(P('camera_rot_speed'), -10, 10, 0.1, 1, XLAT('camera rotation speed'),
      'This affects view rotation with Page Up/Down, and in 3D, camera rotation with arrow keys or mouse.',
    );
  });

  dialog_addSelItem(XLAT('movement animation speed'), fts(G.vid.mspeed), K('m'));
  dialog_add_action(() => {
    dialog_editNumber(V('mspeed'), -5, 5, 1, 0,
      XLAT('movement animation speed'),
      XLAT('+5 = move instantly'));
  });

  dialog_addSelItem(XLAT('idle animation speed'), fts(G.vid.ispeed), K('i'));
  dialog_add_action(() => {
    dialog_editNumber(V('ispeed'), 0, 4, 0.1, 1,
      XLAT('idle animation speed'),
      '0 = disable\n\nThis affects non-movement animations such as orb effects, item rotation, and more.',
    );
  });

  dialog_addBreak(50);
  dialog_addBack();
  dialog_display();
}

/** EX void showScreenConfig(). The window of the port is the page's area: the window and full screen settings
 *  are shown as on the desktop and have no effect (README.md). */
export function showScreenConfig(): void {
  G.cmode = G.vid.xres > G.vid.yres * 1.4 ? sm.SIDE : sm.MAYDARK;
  gamescreen();

  dialog_init_t(XLAT('screen configuration'));

  // !ISIOS && !ISWEB
  add_edit(V('want_fullscreen'));

  // !ISANDROID && !ISFAKEMOBILE
  if (G.vid.want_fullscreen) {
    add_edit(V('change_fullscr'));
    if (G.vid.change_fullscr) {
      add_edit(V('fullscreen_x')); add_edit(V('fullscreen_y'));
    }
    else
      dialog_addBreak(200);
  }
  else {
    add_edit(V('relative_window_size'));
    if (G.vid.relative_window_size) {
      add_edit(V('window_rel_x')); add_edit(V('window_rel_y'));
    }
    else {
      add_edit(V('window_x')); add_edit(V('window_y'));
    }
  }

  // CAP_GLORNOT: "openGL mode" is shown only when both renderers exist. The port has only the software
  // renderer, as a build without GL: hidden.

  // !ISIOS && !ISANDROID && !ISFAKEMOBILE
  if (!G.vid.usingGL) {
    dialog_addBoolItem(XLAT('anti-aliasing'), (G.vid.want_antialias & 1 /* AA_NOGL */) !== 0, K('O'));
    dialog_add_action(() => {
      if (!G.vid.usingGL)
        G.vid.want_antialias ^= 1 | 32; // AA_NOGL | AA_FONT
    });
  }
  else {
    throw new NotPorted('showScreenConfig: GL anti-aliasing'); // STAGE2-STUB (GL: usingGL is always false)
  }

  // !ISIOS && !ISANDROID && !ISFAKEMOBILE
  if (G.vid.usingGL) {
    // if(vrhr::active()) dialog::addInfo(XLAT("(vsync disabled in VR)")); else
    add_edit(V('want_vsync'));
  }
  else
    dialog_addBreak(100);

  if (need_to_apply_screen_settings()) {
    dialog_addItem(XLAT('apply changes'), K('A'));
    dialog_add_action(apply_screen_settings);
    dialog_addBreak(100);
  }
  else
    dialog_addBreak(200);

  dialog_display();
}

/** EX void showGraphConfig() */
export function showGraphConfig(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();

  dialog_init_t(XLAT('graphics configuration'));

  dialog_addSelItem(XLAT('screen settings'), its(G.current_display.xsize) + 'x' + its(G.current_display.ysize), K('s'));
  dialog_add_action_push(showScreenConfig);

  add_edit(P('mapfontscale'));

  dialog_addSelItem(XLAT('vector settings'), XLAT('width') + ' ' + fts(G.vid.linewidth), K('w'));
  dialog_add_action_push(show_vector_settings);

  // CAP_FRAMELIMIT
  dialog_addSelItem(XLAT('framerate limit'), its(G.vid.framelimit), K('l'));
  if (G.getcstat === K('l'))
    G.mouseovers = XLAT('Reduce the framerate limit to conserve CPU energy');

  dialog_addItem(XLAT('animation speed settings'), K('a'));
  dialog_add_action_push(show_animation_speed_settings);

  add_edit(V('flasheffects'));

  dialog_addItem(XLAT('extra graphical effects'), K('u'));

  dialog_addBreak(50);
  dialog_addBack();
  dialog_display();

  G.keyhandler = (sym: number, uni: number): void => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;

    // char xuni = uni | 96; (a signed char)
    let xuni = ((uni | 96) << 24) >> 24;

    if ((uni >= 32 && uni < 64) || uni === K('L') || uni === K('C')) xuni = (uni << 24) >> 24;

    if (xuni === K('u')) pushScreen(showSpecialEffects);

    // CAP_FRAMELIMIT
    else if (xuni === K('l')) {
      dialog_editNumber_n(V('framelimit'), 5, 300, 10, 300, XLAT('framerate limit'), '');
      dialog_bound_low(5);
    }

    else if (xuni === K('p'))
      G.vid.backeffects = !G.vid.backeffects;

    else if (doexiton(sym, uni)) popScreen();
  };
}

/** EX void edit_whatever(char type, int index) */
export function edit_whatever(type: string, index: number): void {
  if (type === 'f') {
    dialog_editNumber(E(G.whatever, index), -10, 10, 1, 0, XLAT('whatever'),
      'f:' + its(index));
  }
  else {
    dialog_editNumber_n(E(G.whateveri, index), -10, 10, 1, 0, XLAT('whatever'),
      'i:' + its(index));
  }
  dialog_get_di().extra_options = () => {
    dialog_addItem(XLAT('integer'), K('X'));
    dialog_add_action(() => { popScreen(); edit_whatever('i', index); });
    dialog_addItem(XLAT('float'), K('Y'));
    dialog_add_action(() => { popScreen(); edit_whatever('f', index); });
    for (let x = 0; x < 8; x++) {
      dialog_addSelItem(its(x), type === 'i' ? its(G.whateveri[x]) : fts(G.whatever[x]), K('A') + x);
      dialog_add_action(() => { popScreen(); edit_whatever(type, x); });
    }
  };
}

/** EX void configureOther() */
export function configureOther(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();

  dialog_init_t(XLAT('other settings'));

  // ISSTEAM: send scores to Steam leaderboards (not the Steam build)

  dialog_addBoolItem_action(XLAT('skip the start menu'), V('skipstart'), K('m'));

  dialog_addItem(XLAT('memory configuration'), K('y'));
  dialog_add_action_push(show_memory_menu);

  // dialog::addBoolItem_action(XLAT("forget faraway cells"), memory_saving_mode, 'y');

  // CAP_AUDIO
  add_edit(P('musicvolume'));
  add_edit(P('effvolume'));
  add_edit(P('music_reset'));

  menuitem_sightrange(K('r'));

  add_edit(V('faraway_highlight'));
  add_edit(V('faraway_highlight_color'));

  // #ifdef WHATEVER (not defined in the release build)

  add_edit(P('savefile_selection'));

  dialog_addBreak(50);
  dialog_addBack();

  dialog_display();
}

/** EX void configure_dialogs() */
export function configure_dialogs(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('dialogs'));

  add_edit(P('menu_darkening'));
  add_edit(P('centered_menus'));
  add_edit(P('dialog_dialog_font_scale'));
  add_edit(P('lands_per_page'));
  add_edit(P('use_bool_dialog'));
  add_edit(P('dialog_display_keys'));

  dialog_addBreak(50);
  dialog_addBack();

  dialog_display();
}

/** EX void configure_hud() */
export function configure_hud(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();

  dialog_init_t(XLAT('HUD settings'));

  dialog_addSelItem(XLAT('message flash time'), its(G.vid.flashtime), K('t'));
  dialog_add_action(() => {
    dialog_editNumber_n(V('flashtime'), 0, 64, 1, 8, XLAT('message flash time'),
      XLAT('How long should the messages stay on the screen.'));
    dialog_bound_low(0);
  });

  dialog_addSelItem(XLAT('limit messages shown'), its(G.vid.msglimit), K('z'));
  dialog_add_action(() => {
    dialog_editNumber_n(V('msglimit'), 0, 64, 1, 5, XLAT('limit messages shown'),
      XLAT('Maximum number of messages on screen.'));
    dialog_bound_low(0);
  });

  add_edit(P('nohelp'));
  add_edit(P('menu_format'));

  add_edit(V('msgleft'));

  if (G.hr_hud_enabled) {
    add_edit(P('glyphsortorder'));
    add_edit(V('graphglyph'));
    add_edit(P('orb_treasure_gap'));
    add_edit(P('less_in_landscape'));
    add_edit(P('less_in_portrait'));
    add_edit(E(quit_options, 'display_yasc_codes'));
    if (G.casual) add_edit(E(quit_options, 'display_semicasual'));
    add_edit(V('orbmode'));
  }

  dialog_addBreak(50);
  dialog_addBack();

  dialog_display();
}

/** EX void configureInterface() */
export function configureInterface(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('interface'));

  // CAP_TRANS
  dialog_addSelItem(XLAT('language'), XLAT('EN'), K('l'));
  dialog_add_action_push(selectLanguageScreen);

  // CAP_SDLTTF
  add_edit(P('font_id'));

  dialog_addSelItem(XLAT('player character'), numplayers() > 1 ? '' : csname(G.vid.cs), K('g'));
  dialog_add_action_push(showCustomizeChar);
  if (G.getcstat === K('g')) G.mouseovers = XLAT('Affects looks and grammar');

  add_edit(P('zh_ascii'));

  dialog_addSelItem(XLAT('draw crosshair'), G.crosshair_size > 0 ? fts(G.crosshair_size) : ONOFF(false), K('x'));
  dialog_add_action(() => {
    dialog_editNumber(P('crosshair_size'), 0, 100, 1, 10, XLAT('crosshair size'), XLAT(
      'Display a targetting reticle in the center of the screen. Might be useful when exploring 3D modes, ' +
      'as it precisely shows the direction we are going. However, the option is available in all modes.',
    ));
    dialog_bound_low(0);
    dialog_get_di().extra_options = () => {
      draw_crosshair();
      dialog_addColorItem(XLAT('crosshair color'), G.crosshair_color, K('X'));
      dialog_add_action(() => {
        dialog_openColorDialog(P('crosshair_color'));
        dialog_get_di().extra_options = draw_crosshair;
      });
    };
  });

  add_edit(P('startanims_enabled'));

  add_edit(V('relative_font'));
  if (G.vid.relative_font)
    add_edit(V('fontscale'));
  else
    add_edit(V('abs_fsize'));

  dialog_addItem('configure dialogs', K('d'));
  dialog_add_action_push(configure_dialogs);

  dialog_addItem('configure HUD', K('h'));
  dialog_add_action_push(configure_hud);

  dialog_addBreak(50);
  dialog_addBack();

  dialog_display();
}

// CAP_SDLJOY: showJoyConfig (the old style joystick configuration: multi.cpp shows it only when SDL found
// joysticks; there are none in the browser)

/** EX void projectionDialog() */
export function projectionDialog(): void {
  dialog_editNumber(PC('alpha'), -5, 5, .1, 1,
    XLAT('projection distance'),
    XLAT('HyperRogue uses the Minkowski hyperboloid model internally. ' +
      'Klein and Poincaré models can be obtained by perspective, ' +
      'and the Gans model is obtained by orthogonal projection. ' +
      'See also the conformal mode (in the special modes menu) ' +
      'for more models.'));
  dialog_get_di().extra_options = () => {
    dialog_addBreak(100);
    if (GDIM() === 2) dialog_addHelp_s(XLAT(
      'If we are viewing an equidistant g absolute units below a plane, ' +
      'from a point c absolute units above the plane, this corresponds ' +
      'to viewing a Minkowski hyperboloid from a point ' +
      'tanh(g)/tanh(c) units below the center. This in turn corresponds to ' +
      'the Poincaré model for g=c, and Klein-Beltrami model for g=0.'));
    dialog_addSelItem(sphere() ? 'stereographic' : 'Poincaré model', '1', K('P'));
    dialog_add_action(() => { dialog_get_ne().editwhat.v = 1; pconf().scale = 1; dialog_get_ne().s = '1'; });
    dialog_addSelItem(sphere() ? 'gnomonic' : 'Klein model', '0', K('K'));
    dialog_add_action(() => { dialog_get_ne().editwhat.v = 0; pconf().scale = 1; dialog_get_ne().s = '0'; });
    if (hyperbolic()) {
      dialog_addSelItem('inverted Poincaré model', '-1', K('I'));
      dialog_add_action(() => { dialog_get_ne().editwhat.v = -1; pconf().scale = 1; dialog_get_ne().s = '-1'; });
    }
    dialog_addItem(sphere() ? 'orthographic' : 'Gans model', K('O'));
    dialog_add_action(() => { pconf().alpha = pconf().scale = 999; dialog_get_ne().reset_str(); });
    dialog_addItem(sphere() ? 'towards orthographic' : 'towards Gans model', K('T'));
    dialog_add_action(() => { const d = 1.1; pconf().alpha *= d; pconf().scale *= d; dialog_get_ne().reset_str(); });
  };
  dialog_get_di().reaction = () => { update_linked('tc_alpha'); };
}

/** EX void menuitem_projection_distance(key_type key) */
export function menuitem_projection_distance(key: key_type): void {
  dialog_addSelItem(XLAT('projection distance'), fts(pconf().alpha) + ' (' + current_proj_name() + ')', key);
  dialog_add_action(projectionDialog);
}

/** EX void explain_detail() */
export function explain_detail(): void {
  dialog_addHelp_s(XLAT(
    'Objects at distance less than %1 absolute units ' +
    'from the center will be displayed with high ' +
    'detail, and at distance at least %2 with low detail.',
    fts(G.vid.highdetail), fts(G.vid.middetail),
  ));
}

/** get_stereo_param() (basegraph.cpp: the parameter of the Panini and stereographic modes) */
function get_stereo_param(): number {
  if (among(G.vid.stereo_mode, sPanini, sStereographic)) return G.vid.stereo_param;
  return 0;
}

/** EX ld max_fov_angle() */
export function max_fov_angle(): number {
  const p = get_stereo_param();
  if (p >= 1 || p <= -1) return 360;
  return Math.acos(-p) * 2 / degree;
}

/** EX void edit_fov_screen() */
export function edit_fov_screen(): void {
  dialog_editNumber(V('fov'), 1, max_fov_angle(), 1, 90, 'field of view',
    XLAT(
      'Horizontal field of view, in angles. ' +
      'This affects the Hypersian Rug mode (even when stereo is OFF) ' +
      'and non-disk models.') + '\n\n' +
    XLAT(
      'Must be less than %1°. Panini projection can be used to get higher values.',
      fts(max_fov_angle()),
    ),
  );
  dialog_bound_low(1e-8);
  dialog_bound_up(max_fov_angle() - 0.01);
  dialog_get_di().extra_options = () => {
    const ptr = G.screens[G.screens.length - 1].target;
    if (ptr instanceof dialog_number_dialog && ptr.vmax !== max_fov_angle()) { popScreen(); edit_fov_screen(); return; }
    add_edit(V('stereo_mode'), K('M'));
    if (among(G.vid.stereo_mode, sPanini, sStereographic)) {
      add_edit(V('stereo_param'), K('P'));
    }
  };
}

/** EX void add_edit_fov(key_type key IS('f')) */
export function add_edit_fov(key: key_type = K('f')): void {

  let sfov = fts(G.vid.fov) + '°';
  if (get_stereo_param()) {
    sfov += ' / ' + fts(max_fov_angle()) + '°';
  }
  dialog_addSelItem(XLAT('field of view'), sfov, key);
  dialog_add_action(edit_fov_screen);
}

/** bool supported_ods() (CAP_ODS is 0 in the desktop build) */
function supported_ods(): boolean {
  return false;
}

/** EX void showStereo() (the stereo modes draw with GL: the port's renderer does not draw the anaglyph and
 *  side-by-side views; the settings are kept) */
export function showStereo(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('stereo vision config'));

  add_edit(V('stereo_mode'));

  dialog_addSelItem(XLAT('pupillary distance'), fts(G.vid.ipd), K('e'));

  switch (G.vid.stereo_mode) {
    case sAnaglyph:
      dialog_addSelItem(XLAT('distance between images'), fts(G.vid.anaglyph_eyewidth), K('d'));
      break;
    case sLR:
      dialog_addSelItem(XLAT('distance between images'), fts(G.vid.lr_eyewidth), K('d'));
      break;
    case sPanini: case sStereographic:
      add_edit(V('stereo_param'));
      break;
    default:
      dialog_addBreak(100);
      break;
  }

  dialog_addSelItem(XLAT('desaturate colors'), its(G.vid.desaturate) + '%', K('c'));
  dialog_add_action(() => {
    dialog_editNumber_n(V('desaturate'), 0, 100, 10, 0, XLAT('desaturate colors'),
      XLAT('Make the game colors less saturated. This is useful in the anaglyph mode.'),
    );
  });

  add_edit_fov(K('f'));

  dialog_addBack();
  dialog_display();

  G.keyhandler = (sym: number, uni: number): void => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;

    const help3 = XLAT(
      'This allows you to view the world of HyperRogue in three dimensions. ' +
      'Best used with the Hypersian Rug mode. When used in the disk model, ' +
      'this lets you look at the Minkowski hyperboloid (which means the ' +
      'depth of terrain features is actually reversed). It also works with non-disk models, ' +
      'from the conformal menu.',
    ) + ' ' + XLAT(
      'Currently, red-cyan anaglyph glasses and mobile VR googles are supported.',
    ) + '\n\n';

    if (uni === K('m')) {
      G.vid.stereo_mode = (1 + G.vid.stereo_mode) % 4;
      if (G.vid.stereo_mode === sODS && !supported_ods()) G.vid.stereo_mode = sOFF;
    }

    else if (uni === K('e')) {
      dialog_editNumber(V('ipd'), -10, 10, 0.01, 0, XLAT('pupillary distance'),
        help3 +
        XLAT('The distance between your eyes in the represented 3D object. This is given in absolute units.'),
      ); dialog_scaleSinh100();
    }

    else if (uni === K('d') && G.vid.stereo_mode === sAnaglyph)
      dialog_editNumber(V('anaglyph_eyewidth'), -1, 1, 0.01, 0, XLAT('distance between images'),
        help3 +
        XLAT('The distance between your eyes. 1 is the width of the screen.'));

    else if (uni === K('d') && G.vid.stereo_mode === sLR)
      dialog_editNumber(V('lr_eyewidth'), -1, 1, 0.01, 0, XLAT('distance between images'),
        help3 +
        XLAT('The distance between your eyes. 1 is the width of the screen.'));

    else if (doexiton(sym, uni)) popScreen();
  };
}

/** EX void add_edit_wall_quality(char c) */
export function add_edit_wall_quality(c: number): void {
  dialog_addSelItem(XLAT('wall quality'), its(G.vid.texture_step), c);
  dialog_add_action(() => {
    dialog_editNumber_n(V('texture_step'), 1, 16, 1, 1, XLAT('wall quality'),
      XLAT(
        'Controls the number of triangles used for wall surfaces. ' +
        'Higher numbers reduce the performance. ' +
        'This has a strong effect when the walls are curved indeed ' +
        '(floors in 2D geometries, honeycombs based on horospheres, and projections other than native perspective), ' +
        'but otherwise, usually it can be set to 1 without significant adverse effects other ' +
        'than slightly incorrect texturing.',
      ),
    );
    dialog_bound_low(1);
    dialog_bound_up(128);
    dialog_get_di().reaction = () => {
      // MAXMDIM >= 4: delete floor_textures (the GL floor textures: none)
    };
  });
}

// edit_levellines (the raycaster's level lines), shown_spatial_embedding, in_tpp, display_embedded_errors,
// show_spatial_embedding, menuitem_spatial_embedding, show3D_height_details, show3D: the 3D configuration
// (stage 3; "3D configuration" in the settings shows the stub screen)

/** EX void show3D() (the 3D configuration: stage 3) */
export function show3D(): void { stub_screen_pop(); } // STAGE2-STUB (3D)

// param_ccolor(ccolor::data*& val, ...): the canvas colourings (stage 3)

/** EX void switchcolor(unsigned int& c, unsigned int* cs) */
export function switchcolor(c: Ref<number>, cs: number[]): void {
  dialog_openColorDialog(c, cs);
}

/** double cc_footphase; int lmousex, lmousey (file-local) */
let cc_footphase = 0;
let lmousex = 0, lmousey = 0;

/** EX void pick_player_shape() */
export function pick_player_shape(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('Choose character'));
  const cs = getcs();
  for (let i = 0; i < pshGUARD; i++) {
    dialog_addBoolItem(XLAT(playershapes[i].name), i === (cs.charid >> 1), K('a') + i);
    if ((i === pshPrincess && !G.princess_everSaved) ||
      (i === pshRatling && hiitemsMax(itCoral) < 25) ||
      (i === pshSkeleton && hiitemsMax(itPalace) < 25) ||
      (i === pshHyperbug && hiitemsMax(itRoyalJelly) < 25)
    ) dialog_lastItem().value = '(locked)';
    dialog_add_action(() => {
      if (i === pshPrincess) {
        if (!G.princess_everSaved && !G.autocheat && !G.unlock_all) {
          addMessage(XLAT('Save %the1 first!', spM(moPrincess)));
          return;
        }
      }
      if (i === pshRatling) {
        if (hiitemsMax(itCoral) < 25 && !G.unlock_all && !G.autocheat) {
          addMessage(XLAT('Collect 25 %1 to unlock first!', spI(itCoral)));
          return;
        }
      }
      if (i === pshSkeleton) {
        if (hiitemsMax(itPalace) < 25 && !G.unlock_all && !G.autocheat) {
          addMessage(XLAT('Collect 25 %1 to unlock first!', spI(itPalace)));
          return;
        }
      }
      if (i === pshHyperbug) {
        if (hiitemsMax(itRoyalJelly) < 25 && !G.unlock_all && !G.autocheat) {
          addMessage(XLAT('Collect 25 %1 to unlock first!', spI(itRoyalJelly)));
          return;
        }
      }
      cs.charid = (cs.charid & 1) | (i << 1);
    });
  }
  dialog_addSelItem('variant', XLAT((cs.charid & 1) ? 'female' : 'male'), K('x'));
  dialog_add_action(() => { cs.charid ^= 1; });
  dialog_addBack();
  dialog_display();
}

/** struct hstream_exception */
class hstream_exception extends hr_exception { constructor() { super('hstream_exception'); } }

/** EX void save_customchar(charstyle& cs, const string& fname) */
export function save_customchar(cs: charstyle, fname: string): void {
  const f = fopen(fname, 'wt');
  if (!f) throw new hstream_exception();
  const h8 = (x: number): string => (x >>> 0).toString(16).padStart(8, '0');
  fputs((VERNUM_HEX >>> 0).toString(16) + '\n', f);
  fputs(its(cs.charid) + ' ' + its(cs.lefthanded ? 1 : 0) + '\n' +
    [cs.skincolor, cs.haircolor, cs.dresscolor, cs.swordcolor, cs.dresscolor2, cs.uicolor, cs.eyecolor, cs.bowcolor, cs.bowcolor2].map(h8).join(' ') + '\n', f);
  fputs('HyperRogue ' + VER + ' custom character file\n', f);
  fputs('Colors are: skin, hair, dress, sword, dress2, ui, eye, bow, bow2\n', f);
  fclose(f);
}

/** EX void load_customchar(charstyle& cs, const string& fname) */
export function load_customchar(cs: charstyle, fname: string): void {
  const data = cfs.files.get(fname);
  if (data === undefined) throw new hstream_exception();
  // fscanf(f, "%x", &vernum); fscanf(f, "%d %d\n%08x ... %08x\n", ...): 0 only when the first conversion
  // fails; the fields read before a failure are kept
  const words = data.trim().split(/\s+/);
  if (!words.length || !/^[0-9a-fA-F]/.test(words[0])) throw new hstream_exception();
  const num = (w: string | undefined, hex: boolean): number | null => {
    if (w === undefined) return null;
    const m = (hex ? /^[0-9a-fA-F]{1,8}/ : /^[+-]?\d+/).exec(w);
    if (!m) return null;
    return hex ? parseInt(m[0], 16) >>> 0 : parseInt(m[0], 10) | 0;
  };
  const charid = num(words[1], false);
  if (charid === null) throw new hstream_exception();
  cs.charid = charid;
  const lh = num(words[2], false);
  const fields = ['skincolor', 'haircolor', 'dresscolor', 'swordcolor', 'dresscolor2', 'uicolor', 'eyecolor', 'bowcolor', 'bowcolor2'] as const;
  if (lh !== null) {
    for (let i = 0; i < fields.length; i++) {
      const v = num(words[3 + i], true);
      if (v === null) break;
      cs[fields[i]] = v;
    }
  }
  cs.lefthanded = (lh ?? 0) !== 0;
}

// EX string charfile = "custom.hch": G.charfile

/** EX void showCustomizeChar() */
export function showCustomizeChar(): void {

  cc_footphase += Math.hypot(G.mousex - lmousex, G.mousey - lmousey);
  lmousex = G.mousex; lmousey = G.mousey;

  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('Customize character'));

  if (G.shmup_on || G.multi_players) G.multi_cpid = G.multi_cpid_edit % G.multi_players;
  const cs = getcs();
  const id = cs.charid >> 1;

  dialog_addSelItem(XLAT('character'), csname(cs), K('g'));
  dialog_addColorItem(XLAT('skin color'), cs.skincolor, K('s'));
  dialog_addColorItem(XLAT('eye color'), cs.eyecolor, K('e'));
  dialog_addColorItem(XLAT('weapon color'), cs.swordcolor, K('w'));
  dialog_addColorItem(XLAT('hair color'), cs.haircolor, K('h'));
  if (bow_crossbow_mode()) {
    dialog_addColorItem(XLAT('bow color'), cs.bowcolor, K('b'));
    dialog_addColorItem(XLAT('bowstring color'), cs.bowcolor2, K('c'));
  }

  if (id !== pshRogue || cs.charid === 1) dialog_addColorItem(XLAT('dress color'), cs.dresscolor, K('d'));
  else dialog_addBreak(100);
  if (cs.charid === 3 || id === pshRatling) dialog_addColorItem(XLAT('dress color II'), cs.dresscolor2, K('f'));
  else dialog_addBreak(100);

  dialog_addColorItem(XLAT('movement color'), cs.uicolor, K('u'));

  if (!G.shmup_on && G.multi_players === 1) dialog_addSelItem(XLAT('save whom'), XLAT1(minf[moPrincess].name), K('p'));

  if (numplayers() > 1) dialog_addSelItem(XLAT('player'), its(G.multi_cpid + 1), K('a'));

  dialog_addBoolItem_action(XLAT('left-handed'), E(cs, 'lefthanded'), K('l'));

  dialog_addBreak(50);
  dialog_addItem('save', K('S'));
  dialog_add_action(() => {
    dialog_openFileDialog(P('charfile'), XLAT('character file to save:'), '.hch',
      () => { try { save_customchar(cs, G.charfile); return true; } catch (e) { if (!(e instanceof hstream_exception)) throw e; addMessage('Failed to save!'); return false; } });
  });
  dialog_addItem('load', K('L'));
  dialog_add_action(() => {
    dialog_openFileDialog(P('charfile'), XLAT('character file to load:'), '.hch',
      () => { try { load_customchar(cs, G.charfile); return true; } catch (e) { if (!(e instanceof hstream_exception)) throw e; addMessage('Failed to load!'); return false; } });
  });
  dialog_addBack();
  dialog_display();

  const firsty = Math.trunc(G.dialog_items[0].position / 2);
  const scale = firsty - 2 * G.vid.fsize;

  const fme = flat_model_enabler();
  try {
    initquickqueue();
    let Vm = atscreenpos(G.dialog_dcenter, firsty, scale);
    const alpha = Math.atan2(G.mousex - G.vid.xres / 2, G.mousey - firsty) - 90 * degree;
    Vm = { T: tmul(Vm.T, cspin(0, 1, alpha)), shift: Vm.shift }; // V * spin(alpha)
    drawMonsterType(moPlayer, null, Vm, 0, cc_footphase / scale, NOCOLOR);
    quickqueue();
  }
  finally { fme.restore(); }

  G.keyhandler = (sym: number, uni: number): void => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;

    if (G.shmup_on || G.multi_players) G.multi_cpid = G.multi_cpid_edit % G.multi_players;
    const cs = getcs();
    const cat = cs.charid >= 4;
    if (uni === K('a')) { G.multi_cpid_edit++; G.multi_cpid_edit %= 60; }
    else if (uni === K('g')) pushScreen(pick_player_shape);
    else if (uni === K('p')) G.vid.samegender = !G.vid.samegender;
    else if (uni === K('s')) switchcolor(E(cs, 'skincolor'), cat ? haircolors : skincolors);
    else if (uni === K('h')) switchcolor(E(cs, 'haircolor'), haircolors);
    else if (uni === K('w')) switchcolor(E(cs, 'swordcolor'), swordcolors);
    else if (uni === K('d')) switchcolor(E(cs, 'dresscolor'), cat ? haircolors : dresscolors);
    else if (uni === K('f')) switchcolor(E(cs, 'dresscolor2'), dresscolors2);
    else if (uni === K('u')) switchcolor(E(cs, 'uicolor'), eyecolors);
    else if (uni === K('e')) switchcolor(E(cs, 'eyecolor'), eyecolors);
    else if (uni === K('b')) switchcolor(E(cs, 'bowcolor'), swordcolors);
    else if (uni === K('c')) switchcolor(E(cs, 'bowcolor2'), eyecolors);
    else if (doexiton(sym, uni)) popScreen();
  };
}

/** EX void refresh_canvas() */
export function refresh_canvas(): void { G.ccolor_live_canvas = true; }

/** EX color_t addalpha(color_t c) */
export function addalpha(c: number): number { return ((c << 8) | 0xFF) >>> 0; }

/** EX void edit_color_table(colortable& ct, const reaction_t& r IS(reaction_t()), bool has_bit IS(false)) */
export function edit_color_table(ct: number[], r: reaction_t | null = null, has_bit = false): void {
  G.cmode = sm.SIDE;
  gamescreen();
  dialog_init_t(XLAT('colors & aura'));

  for (let i = 0; i < isize(ct); i++) {
    dialog_addColorItem(its(i), addalpha(ct[i]), K('a') + i);
    if (WDIM() === 3 && has_bit && !(ct[i] & 0x1000000)) dialog_lastItem().value = XLAT('(no wall)');
    dialog_add_action(() => {
      if (WDIM() === 3 && has_bit) {
        ct[i] ^= 0x1000000;
        if (!(ct[i] & 0x1000000)) return;
      }
      dialog_openColorDialog(E(ct, i));
      if (r) dialog_get_di().reaction = r;
      G.dialog_colorAlpha = false;
      dialog_get_di().dialogflags |= sm.SIDE;
    });
  }

  dialog_addItem('add a color', K('A'));
  dialog_add_action(() => {
    ct.push(rand() & 0x1FFFFFF);
    if (r) r();
  });

  if (isize(ct) > 2) {
    dialog_addItem('delete a color', K('D'));
    dialog_add_action(() => {
      ct.pop();
      if (r) r();
    });
  }

  dialog_addBack();
  dialog_display();
}

/** void color_handler(int sym, int uni) */
function color_handler(sym: number, uni: number): void {
  if (uni === K('-')) {
    const c = G.mouseover;
    if (!c) return;
    else if (c === G.cwt.at) {
      pushScreen(showCustomizeChar);
      return;
    }
    else if (c.monst)
      dialog_openColorDialog(E(minf[c.monst], 'color'));
    else if (c.item)
      dialog_openColorDialog(E(iinf[c.item], 'color'));
    else {
      const tab = special_colortable_for(c);
      if (tab) { pushScreen(() => { edit_color_table(tab); }); return; }
      else if (c.wall)
        dialog_openColorDialog(E(winf[c.wall === waMineMine ? waMineUnknown : c.wall], 'color'));
      // CAP_COMPLEX2
      else if (c.land === laBrownian)
        dialog_openColorDialog(brownian_get_color_edit(c.landparam));
      else
        dialog_openColorDialog(E(G.floorcolors, c.land));
    }
    G.dialog_colorAlpha = false;
    dialog_get_di().dialogflags |= sm.SIDE;
    return;
  }
  else {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;
  }
  if (doexiton(sym, uni)) popScreen();
}

/** brownian::get_color_edit(int v) (complex2.cpp): the colortable entry of level v (colortable's operator[]
 *  is cyclic) */
function brownian_get_color_edit(v: number): Ref<number> {
  const ct = G.brownian_colors;
  const i = ((v % ct.length) + ct.length) % ct.length;
  return E(ct, i);
}

/** EX void show_color_dialog_projection() */
export function show_color_dialog_projection(): void {
  G.cmode = sm.SIDE | sm.DIALOG_STRICT_X | sm.MAYDARK;
  G.getcstat = K('-');
  gamescreen();

  dialog_init_t(XLAT('projection colors & aura'));

  dialog_addColorItem(XLAT('projection boundary'), G.ringcolor, K('r'));
  dialog_add_action(() => { dialog_openColorDialog(P('ringcolor')); dialog_get_di().dialogflags |= sm.SIDE; });

  dialog_addSelItem(XLAT('boundary width multiplier'), fts(G.vid.multiplier_ring), K('R'));
  dialog_add_action(() => { dialog_editNumber(V('multiplier_ring'), 0, 10, 1, 1, XLAT('boundary width multiplier'), ''); });

  dialog_addColorItem(XLAT('projection background'), G.modelcolor, K('c'));
  dialog_add_action(() => { dialog_openColorDialog(P('modelcolor')); dialog_get_di().dialogflags |= sm.SIDE; });

  dialog_addSelItem(XLAT('brightness behind the sphere'), fts(G.backbrightness), K('i'));
  dialog_add_action(() => {
    dialog_editNumber(P('backbrightness'), 0, 1, .01, 0.25, XLAT('brightness behind the sphere'),
      XLAT('In the orthogonal projection, objects on the other side of the sphere are drawn darker.')); dialog_bound_low(0);
  });

  dialog_addColorItem(XLAT('projection period'), G.periodcolor, K('p'));
  dialog_add_action(() => { dialog_openColorDialog(P('periodcolor')); dialog_get_di().dialogflags |= sm.SIDE; });

  dialog_addBreak(50);

  dialog_addSelItem(XLAT('aura brightness'), its(G.vid.aurastr), K('a'));
  dialog_add_action(() => { dialog_editNumber_n(V('aurastr'), 0, 256, 10, 128, XLAT('aura brightness'), ''); dialog_bound_low(0); });

  dialog_addSelItem(XLAT('aura smoothening factor'), its(G.vid.aurasmoothen), K('s'));
  dialog_add_action(() => { dialog_editNumber_n(V('aurasmoothen'), 1, 180, 1, 5, XLAT('aura smoothening factor'), ''); dialog_bound_low(1); });

  dialog_addBreak(50);
  dialog_addBack();
  dialog_display();

  G.keyhandler = color_handler;
}

/** EX void show_color_dialog_game() */
export function show_color_dialog_game(): void {
  G.cmode = sm.SIDE | sm.DIALOG_STRICT_X;
  G.getcstat = K('-');
  gamescreen();

  dialog_init_t(XLAT('game colors'));

  add_edit(V('grid'));

  dialog_addColorItem(XLAT('standard grid color'), G.stdgridcolor, K('g'));
  dialog_add_action(() => { G.vid.grid = true; dialog_openColorDialog(P('stdgridcolor')); dialog_get_di().dialogflags |= sm.SIDE; });

  dialog_addSelItem(XLAT('grid width multiplier'), fts(G.vid.multiplier_grid), K('G'));
  dialog_add_action(() => { dialog_editNumber(V('multiplier_grid'), 0, 10, 1, 1, XLAT('grid width multiplier'), ''); });

  dialog_addBreak(50);
  if (G.specialland === laCanvas) {
    // && ccolor::which->ctab.size(): "pattern colors", "unreversed colors", live_canvas: the canvas colourings
    // are stage 3 (no colour table is selected in the port)
  }

  if (G.cwt.at.land === laMinefield) {
    dialog_addItem(XLAT('minefield colors'), K('m'));
    dialog_add_action_push(() => { edit_color_table(minecolors); });
  }

  if (G.viewdists) {
    dialog_addItem(XLAT('distance colors'), K('d'));
    dialog_add_action_push(() => { edit_color_table(distcolors); });
  }

  // CAP_CRYSTAL: if(cryst && cheater) (crystal geometries: stage 3)

  if (G.cwt.at.land === laTortoise) {
    dialog_addBoolItem_action(XLAT('Galápagos shading'), P('tortoise_shading_enabled'), K('T'));
  }

  dialog_addBoolItem_action(XLAT('higher contrast'), P('higher_contrast'), K('h'));

  dialog_addInfo(XLAT('colors of some game objects'));
  dialog_addInfo(dialog_never_keys() ? XLAT('can be edited by touching them.') : XLAT('can be edited by clicking them.'));

  dialog_addBreak(50);
  dialog_addBack();
  dialog_display();

  G.keyhandler = color_handler;
}

/** EX void show_color_dialog() */
export function show_color_dialog(): void {
  G.cmode = sm.SIDE | sm.DIALOG_STRICT_X | sm.MAYDARK;
  G.getcstat = K('-');
  gamescreen();
  dialog_init_t(XLAT('colors & aura'));

  dialog_addColorItem(XLAT('background'), addalpha(G.backcolor), K('b'));
  dialog_add_action(() => { dialog_openColorDialog(P('backcolor')); G.dialog_colorAlpha = false; dialog_get_di().dialogflags |= sm.SIDE; });

  if (WDIM() === 2 && GDIM() === 3 && hyperbolic())
    dialog_addBoolItem_action(XLAT('cool fog effect'), P('context_fog'), K('B'));

  dialog_addColorItem(XLAT('foreground'), addalpha(G.forecolor), K('f'));
  dialog_add_action(() => { dialog_openColorDialog(P('forecolor')); G.dialog_colorAlpha = false; dialog_get_di().dialogflags |= sm.SIDE; });

  dialog_addColorItem(XLAT('borders'), addalpha(G.bordcolor), K('o'));
  dialog_add_action(() => { dialog_openColorDialog(P('bordcolor')); G.dialog_colorAlpha = false; dialog_get_di().dialogflags |= sm.SIDE; });

  dialog_addColorItem(XLAT('dialogs'), addalpha(G.dialog_dialogcolor), K('d'));
  dialog_add_action(() => { dialog_openColorDialog(P('dialog_dialogcolor')); G.dialog_colorAlpha = false; dialog_get_di().dialogflags |= sm.SIDE; });

  dialog_addItem(XLAT('projection colors & aura'), K('p'));
  dialog_add_action_push(show_color_dialog_projection);

  dialog_addItem(XLAT('grid & game colors'), K('g'));
  dialog_add_action_push(show_color_dialog_game);

  dialog_addBreak(50);
  dialog_addBack();
  dialog_display();

  // (the original first sets a keyhandler equal to color_handler, then replaces it with color_handler)
  G.keyhandler = color_handler;
}

// CAP_CONFIG
// EX bool allow_reset_config = true: G.allow_reset_config

/** EX void resetConfigMenu() */
export function resetConfigMenu(): void {
  G.cmode = sm.VR_MENU | sm.NOSCR;
  gamescreen();
  dialog_init_t(XLAT('reset all configuration'));
  dialog_addInfo('Are you sure?');
  dialog_addItem('yes, and delete the config file', K('d'));
  dialog_addItem('yes', K('y'));
  dialog_addItem('cancel', K('n'));
  dialog_addItem('reset the special game modes', K('r'));
  dialog_display();
  G.keyhandler = (sym: number, uni: number): void => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;

    if (uni === K('d')) {
      resetConfig();
      // unlink(conffile.c_str());
      if (cfs.files.delete(conffile_ref.v)) cfs.onwrite(conffile_ref.v);
      popScreen();
    }
    else if (uni === K('y')) {
      printf('resetting config\n');
      resetConfig();
      printf('config reset\n');
      popScreen();
    }
    else if (uni === K('r'))
      resetModes();
    else if (uni === K('n') || doexiton(sym, uni))
      popScreen();

  };
}

/** EX void selectLanguageScreen() (CAP_TRANS). Each language's name is its own translation of "EN": the screen
 *  starts loading all languages (language.ts; until one has arrived, its line shows "EN") */
export function selectLanguageScreen(): void {
  void language_load_all();
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t('select language'); // intentionally not translated

  const v = G.vid.language;
  const d = G.vid.language; G.vid.language = -1;
  try {
    for (let i = 0; i < NUMLAN; i++) {
      G.vid.language = i;
      dialog_addSelItem(XLAT('EN'), its(idiv(100 * transcompleteness[i], transcompleteness[0])) + '%', K('a') + i);
    }

    dialog_addBreak(50);
    G.vid.language = -1;
    dialog_addBoolItem(XLAT('default') + ': ' + XLAT('EN'), v === -1, K('0'));
    dialog_addBack();

    dialog_addBreak(50);

    G.vid.language = v;
    if (lang() >= 1)
      dialog_addHelp_s(XLAT('add credits for your translation here'));
    else
      dialog_addHelp_s(XLAT('original language'));

    if (lang() !== 0) {
      let tw = '';
      let s = XLAT('TRANSLATIONWARNING');
      if (s !== '' && s !== 'TRANSLATIONWARNING') tw += s;
      s = XLAT('TRANSLATIONWARNING2');
      if (s !== '' && s !== 'TRANSLATIONWARNING2') { if (tw !== '') tw += ' '; tw += s; }
      if (tw !== '') {
        dialog_addHelp_s(tw);
        dialog_lastItem().color = 0xFF0000;
      }
    }
  }
  finally { G.vid.language = d; }

  dialog_display();

  G.keyhandler = (sym: number, uni: number): void => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;

    if (uni === K('0')) {
      G.vid.language = -1;
      android_settings_changed();
    }

    else if (uni >= K('a') && uni < K('a') + NUMLAN) {
      G.vid.language = uni - K('a');
      android_settings_changed();
    }

    else if (doexiton(sym, uni))
      popScreen();
  };
}

/** EX void configureMouse() */
export function configureMouse(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('mouse & touchscreen'));

  dialog_addBoolItem_action(XLAT('reverse pointer control'), V('revcontrol'), K('r'));

  dialog_addBoolItem_action(XLAT('draw circle around the target'), V('drawmousecircle'), K('d'));

  if (GDIM() === 3) {
    dialog_addBoolItem_action(XLAT('highlight the cell forward'), V('axes3'), K('f'));
  }

  // !ISMOBILE
  if (dialog_never_keys())
    dialog_addBoolItem(XLAT('automatically target ranged Orbs by touch'), !(G.vid.shifttarget & 1), K('i'));
  else
    dialog_addBoolItem(XLAT('targetting ranged Orbs Shift+click only'), (G.vid.shifttarget & 1) !== 0, K('i'));
  dialog_add_action(() => { G.vid.shifttarget = G.vid.shifttarget ^ 3; });

  // !ISMOBILE
  dialog_addBoolItem_action(XLAT('quick mouse'), V('quickmouse'), K('M'));

  add_edit(P('drag_sensitivity'));

  dialog_addSelItem(XLAT('move by clicking on compass'), its(G.vid.mobilecompasssize), K('C'));
  dialog_add_action(() => {
    dialog_editNumber_n(V('mobilecompasssize'), 0, 100, 10, 20, XLAT('compass size'), XLAT('0 to disable'));
    // we need to check the moves
    dialog_get_di().reaction = () => { checkmove(false); };
    dialog_bound_low(0);
  });

  // CAP_ORIENTATION: scrolling by device rotation (mobile only)

  dialog_addBack();
  dialog_display();
}

/** vector<parameter*> last_changed (file-local) */
const last_changed: parameter[] = [];

/** EX void add_to_changed(parameter *f) */
export function add_to_changed(f: parameter): void {
  const orig_f = f;
  for (let i = 0; i < isize(last_changed); i++) {
    if (last_changed[i] === f)
      return;
    const t = last_changed[i]; last_changed[i] = f; f = t;
    if (f === orig_f) return;
  }
  last_changed.push(f);
}

/** EX parameter *find_edit(void *val) */
export function find_edit(val: pref<unknown>): parameter | null {
  for (const fs of sorted_params()) {
    fs.check_change();
    if (fs.affects(val))
      return fs;
  }
  return null;
}

/** anims::find_param(void *x) (screenshot.cpp): the parameter of a variable (find_edit without check_change) */
export function anims_find_param(x: pref<unknown>): parameter | null {
  for (const fs of sorted_params())
    if (fs.affects(x))
      return fs;
  return null;
}

/** EX void add_edit_ptr(void *val) / add_edit_ptr(void *val, key_type key); template add_edit(T& val[, key]) */
export function add_edit(val: pref<unknown>, key?: key_type): void {
  let found = 0;
  for (const fs of sorted_params()) {
    fs.check_change();
    if (fs.affects(val)) {
      if (key === undefined) fs.show_edit_option(); else fs.show_edit_option(key);
      found++;
    }
  }
  // if(found != 1) println(hlog, "found = ", found);
  void found;
}

/** EX void find_parameter() */
export function find_parameter(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();

  dialog_init_t(XLAT('find a setting'));

  dialog_start_list(900, 900, K('1'));

  let found = 0;

  for (const fs of sorted_params()) {
    const key = fs.search_key();
    if (fs.available() && dialog_hasInfix(key)) {
      fs.show_edit_option(G.dialog_list_fake_key++);
      found++;
    }
  }

  dialog_end_list();

  dialog_addBreak(100);
  add_edit(P('dialog_onscreen_keyboard'));

  if (G.dialog_onscreen_keyboard) dialog_setting_keyboard();

  dialog_addSelItem(XLAT('matching items'), its(found), 0);

  dialog_addBack();
  dialog_display();

  if (G.dialog_infix !== '') G.mouseovers = G.dialog_infix;

  G.keyhandler = (sym: number, uni: number): void => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;
    if (dialog_editInfix(sym, uni)) G.dialog_list_skip = 0;
    else if (doexiton(sym, uni)) popScreen();
  };
}

/** EX void edit_all_parameters() */
export function edit_all_parameters(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('recently changed settings'));

  for (const fs of sorted_params()) fs.check_change();

  dialog_start_list(1000, 1000, K('a'));
  for (const l of last_changed)
    if (l.available())
      l.show_edit_option(G.dialog_list_fake_key++);
  dialog_end_list();

  dialog_addBreak(100);
  dialog_addItem(XLAT('find a setting'), K('/'));
  dialog_add_action_push(find_parameter);
  dialog_addBack();
  dialog_display();
}

/** EX void showSettings() */
export function showSettings(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('settings'));

  dialog_addItem(XLAT('interface'), K('i'));
  dialog_add_action_push(configureInterface);

  dialog_addItem(XLAT('general graphics'), K('g'));
  dialog_add_action_push(showGraphConfig);

  dialog_addItem(XLAT('3D configuration'), K('9'));
  dialog_add_action_push(show3D);

  dialog_addItem(XLAT('quick options'), K('q'));
  dialog_add_action_push(showGraphQuickKeys);

  dialog_addItem(XLAT('models & projections'), K('p'));
  dialog_add_action_push(models_quick_model);

  dialog_addItem(XLAT('colors & aura'), K('c'));
  dialog_add_action_push(show_color_dialog);

  // CAP_SHMUP && !ISMOBILE
  dialog_addSelItem(XLAT('keyboard & joysticks'), '', K('k'));
  dialog_add_action(multi_configure);

  dialog_addSelItem(XLAT('mouse & touchscreen'), '', K('m'));
  dialog_add_action_push(configureMouse);

  dialog_addItem(XLAT('other settings'), K('o'));
  dialog_add_action_push(configureOther);

  dialog_addBreak(100);

  // CAP_CONFIG
  dialog_addItem(XLAT('find a setting'), K('/'));
  dialog_add_action_push(edit_all_parameters);

  dialog_addItem(XLAT('save the current config'), K('s'));
  dialog_add_action(saveConfig);

  if (G.allow_reset_config) {
    dialog_addItem(XLAT('reset all configuration'), K('R'));
    dialog_add_action_push(resetConfigMenu);
  }

  if (G.getcstat === K('s')) G.mouseovers = XLAT('Config file: %1', conffile_ref.v);

  dialog_addBack();
  dialog_display();
}

// --- the command line (CAP_COMMANDLINE) ---

/** a stage-3 option */
function later(opt: string): never { throw new NotPorted(opt + ' (3D options: stage 3)'); }

export function read_color_args(): number {
  if (arg_argis('-back')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.backcolor = arg_argcolor(24);
  }
  else if (arg_argis('-fillmodel')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.modelcolor = arg_argcolor(32);
  }
  else if (arg_argis('-apeirocolor')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.ccolor_apeirogonal_color = arg_argcolor(32);
  }
  else if (arg_argis('-ring')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.ringcolor = arg_argcolor(32);
  }
  else if (arg_argis('-ringw')) {
    if (PHASEFROM(2)) return 2; arg_shift_arg_formula(V('multiplier_ring'));
  }
  else if (arg_argis('-stdgrid')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.stdgridcolor = arg_argcolor(32);
  }
  else if (arg_argis('-gridw')) {
    if (PHASEFROM(2)) return 2; arg_shift_arg_formula(V('multiplier_grid'));
  }
  else if (arg_argis('-period')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.periodcolor = arg_argcolor(32);
  }
  else if (arg_argis('-crosshair')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.crosshair_color = arg_argcolor(32);
    arg_shift_arg_formula(P('crosshair_size'));
  }
  else if (arg_argis('-borders')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.bordcolor = arg_argcolor(24);
  }
  else if (arg_argis('-fore')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.forecolor = arg_argcolor(24);
  }
  else if (arg_argis('-title')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.titlecolor = arg_argcolor(24);
  }
  else if (arg_argis('-dialog')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.dialog_dialogcolor = arg_argcolor(24);
  }
  else if (arg_argis('-d:color'))
    arg_launch_dialog(show_color_dialog);
  else return 1;
  return 0;
}

export function read_config_args(): number {
  if (arg_argis('-c')) { if (PHASE(1)) return 2; arg_shift(); conffile_ref.v = arg_argcs(); }
  // change the configuration from the command line
  else if (arg_argis('-aa')) { if (PHASEFROM(2)) return 2; arg_shift(); G.vid.want_antialias = arg_argi(); apply_screen_settings(); }
  else if (arg_argis('-lw')) { if (PHASEFROM(2)) return 2; arg_shift_arg_formula(V('linewidth')); }
  else if (arg_argis('-wm')) { if (PHASEFROM(2)) return 2; arg_shift(); G.vid.wallmode = arg_argi(); }
  else if (arg_argis('-mm')) { if (PHASEFROM(2)) return 2; arg_shift(); G.vid.monmode = arg_argi(); }

  else if (arg_argis('-noshadow')) { G.noshadow = true; }
  else if (arg_argis('-bright')) { G.bright = true; }
  else if (arg_argis('-gridon')) { G.vid.grid = true; }
  else if (arg_argis('-gridoff')) { G.vid.grid = false; }

  // non-configurable options
  else if (arg_argis('-vsync_off')) {
    G.vid.want_vsync = false;
    apply_screen_settings();
  }
  else if (arg_argis('-aura')) {
    if (PHASEFROM(2)) return 2;
    arg_shift(); G.vid.aurastr = arg_argi();
    arg_shift(); G.vid.aurasmoothen = arg_argi();
  }
  else if (arg_argis('-nofps')) {
    if (PHASEFROM(2)) return 2;
    G.nofps = true;
  }
  else if (arg_argis('-nohud')) {
    if (PHASEFROM(2)) return 2;
    G.nohud = true;
  }
  else if (arg_argis('-nomenu')) {
    if (PHASEFROM(2)) return 2;
    G.nomenukey = true;
  }
  else if (arg_argis('-nomsg')) {
    if (PHASEFROM(2)) return 2;
    G.nomsg = true;
  }
  // MAXMDIM >= 4
  else if (arg_argis('-switch-fpp')) { if (PHASEFROM(2)) return 2; later('-switch-fpp'); }
  else if (arg_argis('-switch-tpp')) { if (PHASEFROM(2)) return 2; later('-switch-tpp'); }
  // MAXMDIM >= 4
  else if (arg_argis('-switch-3d')) { if (PHASEFROM(2)) return 2; later('-switch-3d'); }
  else if (arg_argis('-nohelp')) {
    if (PHASEFROM(2)) return 2;
    G.nohelp = 1; // nohelp = true
  }
  else if (arg_argis('-dont_face_pc')) {
    if (PHASEFROM(2)) return 2;
    G.dont_face_pc = true;
  }

  // CAP_TRANS
  else if (arg_argis('-lang')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.vid.language = arg_argi();
  }
  else if (arg_argis('-vlq')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.vid.linequality = arg_argi();
  }
  else if (arg_argis('-fov')) {
    if (PHASEFROM(2)) return 2; arg_shift_arg_formula(V('fov'));
  }
  else if (arg_argis('-r')) {
    if (PHASEFROM(2)) return 2;
    arg_shift();
    const vid = G.vid;
    // sscanf(argcs(), "%dx%dx%d", ...)
    const ints = (): number[] => {
      const r: number[] = [];
      const m = /^\s*([+-]?\d+)(?:x\s*([+-]?\d+)(?:x\s*([+-]?\d+))?)?/.exec(arg_argcs());
      if (m) for (let i = 1; i <= 3; i++) if (m[i] !== undefined) r.push(parseInt(m[i], 10) | 0);
      return r;
    };
    if (vid.want_fullscreen) {
      const r = ints();
      const clWidth = r[0] ?? 0, clHeight = r[1] ?? 0, clFont = r[2] ?? 0;
      vid.change_fullscr = clWidth !== 0;
      if (clWidth) vid.fullscreen_x = clWidth;
      if (clHeight) vid.fullscreen_y = clHeight;
      if (clFont) { vid.abs_fsize = clFont; vid.relative_font = true; }
    }
    else if (arg_args().indexOf('.') !== -1) {
      vid.relative_window_size = true;
      const m = /^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)(?:x\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?))?/.exec(arg_argcs());
      const dWidth = m ? Number.parseFloat(m[1]) : 0, dHeight = m && m[2] !== undefined ? Number.parseFloat(m[2]) : 0;
      if (dWidth) vid.window_rel_x = dWidth;
      if (dHeight) vid.window_rel_y = dHeight;
    }
    else {
      vid.want_fullscreen = false;
      vid.relative_window_size = false;
      const r = ints();
      if (r.length >= 1) vid.window_x = r[0];
      if (r.length >= 2) vid.window_y = r[1];
      const clFont = r[2] ?? 0;
      if (clFont) { vid.abs_fsize = clFont; vid.relative_font = true; }
    }
  }
  else if (arg_argis('-msm')) {
    if (PHASEFROM(2)) return 2; G.memory_saving_mode = true;
  }
  else if (arg_argis('-mrsv')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.reserve_limit = arg_argi(); apply_memory_reserve();
  }
  else if (arg_argis('-pside')) {
    if (PHASEFROM(2)) return 2;
    G.permaside = true;
  }
  else if (arg_argis('-xy')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('xposition'));
    arg_shift_arg_formula(PC('yposition'));
  }
  else if (arg_argis('-fixdir')) {
    if (PHASEFROM(2)) return 2;
    G.vid.fixed_facing = true;
    arg_shift_arg_formula(V('fixed_facing_dir'));
  }
  else if (arg_argis('-fixdiroff')) {
    if (PHASEFROM(2)) return 2;
    G.vid.fixed_facing = false;
  }
  else if (arg_argis('-msmoff')) {
    if (PHASEFROM(2)) return 2; G.memory_saving_mode = false;
  }
  else if (arg_argis('-levellines')) {
    if (PHASEFROM(2)) return 2; arg_shift_arg_formula(P('levellines'));
  }
  else if (arg_argis('-level-notexture')) { if (PHASEFROM(2)) return 2; later('-level-notexture'); }
  else if (arg_argis('-level-texture')) { if (PHASEFROM(2)) return 2; later('-level-texture'); }
  else if (arg_argis('-msens')) {
    if (PHASEFROM(2)) return 2; arg_shift_arg_formula(P('mouseaim_sensitivity'));
  }
  // TOGGLE('o', vid.wantGL, ...), TOGGLE('f', vid.want_fullscreen, ...)
  else if (TOGGLE_test('o')) {
    return TOGGLE('o', G.vid.wantGL, () => { G.vid.wantGL = !G.vid.wantGL; apply_screen_settings(); });
  }
  else if (TOGGLE_test('f')) {
    return TOGGLE('f', G.vid.want_fullscreen, () => { G.vid.want_fullscreen = !G.vid.want_fullscreen; apply_screen_settings(); });
  }
  else if (arg_argis('-noshaders')) {
    if (PHASE(1)) return 2;
    // glhr::noshaders = true; (no GL)
  }
  else if (arg_argis('-d:sight')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(); edit_sightrange();
  }
  else if (arg_argis('-d:char')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(showCustomizeChar);
  }
  else if (arg_argis('-d:3')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(show3D);
  }
  else if (arg_argis('-d:stereo')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(showStereo);
  }
  else if (arg_argis('-d:iface')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(configureInterface);
  }
  else if (arg_argis('-d:graph')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(showGraphConfig);
  }
  else if (arg_argis('-tstep')) {
    if (PHASEFROM(2)) return 2; arg_shift(); G.vid.texture_step = arg_argi();
  }
  else if (arg_argis('-csc')) {
    if (PHASEFROM(2)) return 2; arg_shift_arg_formula(V('creature_scale'));
  }
  else if (arg_argis('-neon')) {
    if (PHASEFROM(2)) return 2;
    arg_shift(); G.neon_mode = arg_argi();
  }
  else if (arg_argis('-dmc')) {
    if (PHASEFROM(2)) return 2;
    arg_shift(); G.vid.drawmousecircle = arg_argi() !== 0;
  }
  else if (arg_argis('-smooths')) {
    if (PHASEFROM(2)) return 2;
    arg_shift(); G.smooth_scrolling = arg_argi() !== 0;
  }
  else if (arg_argis('-via-shader')) {
    if (PHASEFROM(2)) return 2;
    arg_shift(); G.vid.consider_shader_projection = arg_argi() !== 0;
  }
  else if (arg_argis('-neonnf')) {
    if (PHASEFROM(2)) return 2;
    arg_shift(); G.neon_nofill = arg_argi() !== 0;
  }
  else if (arg_argis('-precw')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(P('precise_width'));
  }
  else if (arg_argis('-d:all')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(edit_all_parameters);
  }
  else if (arg_argis('-d:find')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(find_parameter);
  }
  else if (arg_argis('-d:param')) {
    if (PHASEFROM(2)) return 2;
    arg_shift();
    const s = arg_args();
    G.cmode |= sm.SIDE;
    for (const fs of sorted_params()) if (fs.name === s) {
      G.dialog_items.length = 0;
      G.dialog_key_actions.clear();
      fs.show_edit_option();
      // for(auto p: dialog::key_actions) { p.second(); return 0; } (std::map: the lowest key)
      for (const p of [...G.dialog_key_actions.keys()].sort((a, b) => a - b)) { G.dialog_key_actions.get(p)!(); return 0; }
      // println(hlog, "no key action");
      return 0;
    }
    // println(hlog, "unknown param to edit: ", s);
  }
  else if (arg_argis('-char')) {
    const cs = G.vid.cs;
    arg_shift();
    const s = arg_args();
    set_char_by_name(cs, s);
  }
  else if (arg_argis('-char-multi')) {
    arg_shift();
    const i = arg_argi();
    const cs = G.multi_scs[((i % 7) + 7) % 7];
    arg_shift();
    const s = arg_args();
    set_char_by_name(cs, s);
  }
  else return 1;
  return 0;
}

/** EX void set_char_by_name(charstyle& cs, const string& s) */
export function set_char_by_name(cs: charstyle, s: string): void {
  if (s === 'dodek') {
    cs.charid = 4;
    cs.lefthanded = false;
    cs.skincolor = 0x202020FF;
    cs.eyecolor = 0x20C000FF;
    cs.haircolor = 0x202020FF;
    cs.dresscolor = 0x424242FF;
    cs.swordcolor = 0xF73333FF;
  }
  else if (s === 'rudy') {
    cs.charid = 4;
    cs.lefthanded = false;
    cs.skincolor = 0xA44139FF;
    cs.eyecolor = 0xD59533FF;
    cs.haircolor = 0xC6634AFF;
    cs.dresscolor = 0xC6634AFF;
    cs.swordcolor = 0x3CBB33FF;
  }
  else if (s === 'running') {
    cs.charid = 6;
    cs.lefthanded = false;
    cs.skincolor = 0xFFFFFFFF;
    cs.eyecolor = 0xFF;
    cs.haircolor = 0xFFFFFFFF;
    cs.dresscolor = 0xFFFFFFFF;
    cs.swordcolor = 0xFF0000FF;
  }
  else if (s === 'princess') {
    cs.charid = 3;
    cs.lefthanded = true;
    cs.skincolor = 0xEFD0C9FF;
    cs.haircolor = 0x301800FF;
    cs.eyecolor = 0xC000FF;
    cs.dresscolor = 0x408040FF;
    cs.swordcolor = 0xFFFFFFFF;
  }
  else if (s === 'worker') {
    cs.charid = 2;
    cs.skincolor = 0xC77A58FF;
    cs.haircolor = 0x502810FF;
    cs.dresscolor = 0xC0C000FF;
    cs.eyecolor = 0x500040FF;
    cs.swordcolor = 0x808080FF;
  }
  else if (s === 'felix') {
    cs.charid = 12;
    cs.skincolor = 0xD0D0D0FF;
    cs.haircolor = 0xF0F0F0FF;
    cs.dresscolor = 0xF0F0F0FF;
    cs.eyecolor = 0xFF0000FF;
    cs.swordcolor = 0x808080FF;
  }
  else {
    // atoi(s.c_str())
    const m = /^\s*([+-]?\d+)/.exec(s);
    cs.charid = m ? parseInt(m[1], 10) | 0 : 0;
    cs.lefthanded = cs.charid >= 100;
    cs.charid %= 100;
    cs.charid %= (2 * pshGUARD);
  }
}

export function read_param_args(): number {
  const s = arg_args();
  const pos = s.indexOf('=');
  if (pos === -1) return 1;
  const name = s.substring(0, pos);
  const value = s.substring(pos + 1);
  if (PHASEFROM(2)) return 2;
  if (!params.has(name)) {
    // println(hlog, "parameter unknown: ", name); (the port lacks the parameters of the stage-3 features)
    exit(1);
  }
  params.get(name)!.load_as_animation(value);
  return 0;
}

// mode changes:

/** the option has the form of TOGGLE(x, ...): -x, -x1 or -x0 */
function TOGGLE_test(x: string): boolean {
  const a = arg_args();
  return a[0] === '-' && a[1] === x && (a.length === 2 || ((a[2] === '1' || a[2] === '0') && a.length === 3));
}

/** TOGGLE(x, param, act) (commandline.cpp): -x switches, -x1 turns on, -x0 turns off; returns 2 for a later
 *  phase, 0 when handled, 1 when the option is not -x */
function TOGGLE(x: string, param: boolean, act: () => void): number {
  const a = arg_args();
  if (a[0] === '-' && a[1] === x && a.length === 2) { if (PHASEFROM(2)) return 2; G.showstartmenu = false; act(); return 0; }
  else if (a[0] === '-' && a[1] === x && a[2] === '1' && a.length === 3) { if (PHASEFROM(2)) return 2; G.showstartmenu = false; if (!param) act(); return 0; }
  else if (a[0] === '-' && a[1] === x && a[2] === '0' && a.length === 3) { if (PHASEFROM(2)) return 2; G.showstartmenu = false; if (param) act(); return 0; }
  return 1;
}

export function read_gamemode_args(): number {
  let r: number;
  if (arg_argis('-P')) {
    if (PHASE(2)) return 2; arg_shift();
    stop_game_and_switch_mode(rg_nothing);
    G.multi_players = arg_argi();
  }
  else if ((r = TOGGLE('S', G.shmup_on, () => stop_game_and_switch_mode(rg_shmup))) !== 1) return r;
  else if ((r = TOGGLE('H', G.hardcore, () => switchHardcore())) !== 1) return r;
  else if ((r = TOGGLE('R', G.randomPatternsMode, () => stop_game_and_switch_mode(rg_randpattern))) !== 1) return r;
  else if ((r = TOGGLE('i', G.inv_on, () => stop_game_and_switch_mode(rg_inv))) !== 1) return r;

  else return 1;
  return 0;
}

// local parameter sets (local_parameter_set, lps_enable, lps_add: the parameter sets of other games built on
// HyperRogue): not ported

/** the static initializers of config.cpp, in source order: config3 (hooks_configfile, 100), then ah_config
 *  (hooks_args, 0: read_config_args, read_param_args, read_gamemode_args, read_color_args). models.cpp's
 *  add_model_config (hooks_configfile, 100) comes later in hyper.cpp: register_models (called from here, as
 *  hyper-main registers config.cpp's file group). */
export function register_config(): void {
  util_late.find_param = (name: string): parameter | null => params.get(name) ?? null;
  addHook(G.hooks_configfile, 100, config3);
  addHook(G.hooks_args, 0, read_config_args);
  addHook(G.hooks_args, 0, read_param_args);
  addHook(G.hooks_args, 0, read_gamemode_args);
  addHook(G.hooks_args, 0, read_color_args);
  register_models();
}
