// control.cpp of HyperRogue 13.1o (stage 2, package U3): the main loop step (mainloopiter), the events
// (handle_event, SDL2 branch), keys (handlekey, handleKeyNormal, handle_movement, gmodekeys), the mouse
// (mousemovement, calcMousedest, fix_mouseh), panning, the camera keys, centering, the joystick code of the
// desktop build (no SDL joysticks in the browser: `sticks` stays empty) and ors:: (CAP_ORIENTATION is off on the
// desktop: only mode 0). (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// The SDL calls go to src/sdl.ts (the event queue filled from browser events, the keyboard and mouse state).
// The browser cannot block: the original's `while(!quitmainloop) mainloopiter();` is one mainloopiter per
// animation frame (src/index.ts); mainloop() below is the desktop loop, for completeness.
import { G } from './globals.ts';
import type { screen_t } from './globals.ts';
import { NotPorted, among, callhooks, callhandlers, isize, MD_DROP, MD_WAIT, movedir } from './hyper.ts';
import { cell } from './locations.ts';
import { GDIM, WDIM, embedded_plane, sl2, elliptic } from './classes.ts';
import {
  SDLK_ESCAPE, SDLK_F10, SDLK_KP_0, SDLK_KP_1, SDLK_KP_2, SDLK_KP_3, SDLK_KP_4, SDLK_KP_6, SDLK_KP_7, SDLK_KP_8,
  SDLK_KP_9, SDLK_END, SDLK_DOWN, SDLK_PAGEDOWN, SDLK_LEFT, SDLK_RIGHT, SDLK_HOME, SDLK_UP, SDLK_PAGEUP,
  SDLK_KP5, SDLK_F1, SDLK_F2, SDLK_F3, SDLK_F4, SDLK_F5, SDLK_TAB, SDLK_DELETE, SDLK_KP_PERIOD, SDLK_RETURN,
  SDLK_LSHIFT, SDLK_RSHIFT, SDLK_LCTRL, SDLK_RCTRL, SDLK_LALT, SDLK_RALT,
  PSEUDOKEY_EXIT, PSEUDOKEY_RELEASE, PSEUDOKEY_JOY, PSEUDOKEY_WHEELUP, PSEUDOKEY_WHEELDOWN, PSEUDOKEY_MENU,
  PSEUDOKEY_NOHINT, PSEUDOKEY_TOUCH, PSEUDOKEY_LIST_SLIDER, JOY_ID,
  SDL_Event, SDL_PollEvent, SDL_GetTicks, SDL_GetKeyboardState, SDL_GetMouseState, SDL_BUTTON_MMASK,
  SDL_BUTTON_LEFT, SDL_BUTTON_MIDDLE, SDL_BUTTON_RIGHT,
  SDL_SCANCODE_RCTRL, SDL_SCANCODE_RSHIFT, SDL_SCANCODE_LSHIFT, SDL_SCANCODE_LCTRL, SDL_SCANCODE_LALT,
  SDL_SCANCODE_RALT, SDL_SCANCODE_END, SDL_SCANCODE_HOME, SDL_SCANCODE_RIGHT, SDL_SCANCODE_LEFT, SDL_SCANCODE_UP,
  SDL_SCANCODE_DOWN, SDL_SCANCODE_PAGEUP, SDL_SCANCODE_PAGEDOWN,
  SDL_KMOD_LSHIFT, SDL_KMOD_RSHIFT, SDL_KMOD_LCTRL, SDL_KMOD_RCTRL, SDL_KMOD_LALT, SDL_KMOD_RALT, SDL_KMOD_NUM,
  SDL_EVENT_KEY_DOWN, SDL_EVENT_TEXT_INPUT, SDL_EVENT_MOUSE_BUTTON_DOWN, SDL_EVENT_MOUSE_BUTTON_UP,
  SDL_EVENT_MOUSE_WHEEL, SDL_EVENT_MOUSE_MOTION, SDL_EVENT_QUIT, SDL_WINDOWEVENT, SDL_WINDOWEVENT_ENTER,
  SDL_WINDOWEVENT_LEAVE, SDL_WINDOWEVENT_EXPOSED, SDL_WINDOWEVENT_RESIZED,
} from './sdl.ts';
import { normalscreen, drawscreen, popScreen, sm, in_perspective_v } from './graph.ts';
import { outofmap as outofmap_c, gethyper, panning, rotate_view, shift_view, fullcenter, centerpc, optimizeview,
  spinEdge } from './hypgraph.ts';
import { check_cgi, cgi } from './geometry.ts';
import { models_configure, models_quick_model } from './models.ts';
import {
  type hyperpoint, type transmatrix, type shiftpoint, tmul, tmulh, tmuls, tC0, tC0_sm, hdist_sp, smul, smulh,
  gpushxto0, rgpushxto0, hpxy, cspin, ctangent, ztangent, smalltangent, point2, tangent_length, geo_dist, direct_exp,
  lp_iapply, inverse, Mirror, C0,
} from './hyperpoint.ts';
import { spin, tile_center } from './embeddings.ts';
import { ggmatrix, ddspin } from './geometry2.ts';
import { flashMessages } from './basegraph.ts';
import { movepcto, DEFAULTCONTROL, numplayers } from './pcmove.ts';
import { applyCheat } from './debug.ts';
import { targetRangedOrb, roKeyboard, roMouse, roMouseForce } from './orbs.ts';
import { whirlwind_jumpDestination, tortoise_updateVals } from './complex.ts';
import { mine_performMarkCommand } from './complex2.ts';
import { bow_add_fire, bow_switch_fire_mode, bow_fire_on_mouse, bow_crossbow_mode } from './crossbow.ts';
import { multi_mousemovement, multi_handleMulti, multi_notremapped } from './multi.ts';
import { protect_memory, apply_memory_reserve, show_memory_menu, PSEUDOKEY_MEMORY } from './savemem.ts';
import { dialog_handleZooming } from './dialogs.ts';
import { showMissionScreen, needConfirmation, showGameMenu } from './quit.ts';
import { gotoHelp } from './help.ts';
import { get_o_key } from './menus.ts';
import { inv_show } from './inventory.ts';
import { shot_menu } from './screenshot.ts';
import { mapeditor_scaleall } from './mapeditor.ts';
import { shmup_turn } from './shmup.ts';
import { isGravityLand } from './flags.ts';
import { itStrongWind } from './content.ts';
import { pconf } from './globals.ts';
import { restart_game } from './system.ts';
import { apply_screen_settings } from './basegraph.ts';
import { S, handlemusic } from './sound.ts';

/** inline void popScreenAll() { while(isize(screens)>1) popScreen(); } (graph.cpp) */
export function popScreenAll(): void { while (G.screens.length > 1) G.screens.pop(); } // (real; U1)
/** template<class T> void pushScreen(const T& x) { screens.push_back(x); } (hyper.h; real since U1: `screens` is
 *  { normalscreen } in C++ from the start, G.screens gets it on first use) */
export function pushScreen(f: screen_t): void {
  if (!G.screens.length) G.screens.push(normalscreen);
  G.screens.push(f);
}

// EX int frames; EX bool outoffocus = false; EX int mousex, mousey; EX shiftpoint mouseh, mouseoh;
// EX bool pandora_leftclick, pandora_rightclick; EX bool lshiftclick, rshiftclick, lctrlclick, rctrlclick,
// anyshiftclick, anyctrlclick, wheelclick; EX bool targetclick, hiliteclick, forcetarget, numlock_on;
// EX bool gtouched; EX bool holdmouse; EX int mouse_state; EX int getcstat, lgetcstat; EX ld getcshift;
// EX bool inslider; EX bool invslider; EX int slider_x; keyhandler, joyhandler, texthandler: G.*

/** void ignore_text(const SDL_TextInputEvent&) {} */
export function ignore_text(_text: string): void { }

/** void reset_handlers() (joyhandler: no SDL joysticks in the browser) */
export function reset_handlers(): void {
  G.keyhandler = () => { };
  G.texthandler = ignore_text;
}

/** static constexpr auto SKIPFAC = .4; (what part of the compass does 'skip turn') */
export const SKIPFAC = .4;

// EX bool mousing = true; EX int which_pointer = 0; EX bool mousepressed, mousemoved, actonrelease;
// EX bool mousepan, oldmousepan; EX ld mouseaim_x, mouseaim_y; EX ld mouseaim_sensitivity = 0.01;
// EX int timetowait; EX int joyx, joyy, panjoyx, panjoyy; EX movedir joydir; EX movedir mousedest;
// EX ld shiftmul = 1; EX cell *mouseover, *mouseover2, *lmouseover, *lmouseover_distant; EX ld modist, modist2;
// EX shiftmatrix mouseoverV; EX int lastt: G.*

/** bool mouseout() */
export function mouseout(): boolean {
  const m = '-'.charCodeAt(0);
  if ((G.getcstat !== m && G.getcstat) || (G.lgetcstat && G.lgetcstat !== m)) return true;
  return outofmap_c(G.mouseh.h);
}

/** bool mouseout2() */
export function mouseout2(): boolean {
  const m = '-'.charCodeAt(0);
  if ((G.getcstat && G.getcstat !== m) || (G.lgetcstat && G.lgetcstat !== m)) return true;
  return outofmap_c(G.mouseh.h) || outofmap_c(G.mouseoh.h);
}

/** movedir vectodir(hyperpoint P) */
export function vectodir(P: hyperpoint): movedir {
  let U = unshift_sm(ggmatrix(G.cwt.at));
  if (embedded_plane()) throw new NotPorted('vectodir: embedded plane (radar_transform)'); // STAGE2-STUB (3D)

  P = direct_exp(lp_iapply(P));

  const H = tmulh(G.sphereflip, tC0(U));
  const Centered = tmul(G.sphereflip, rgpushxto0(H));

  let binv = 99;

  const type = G.cwt.at.type;
  const dirdist: number[] = new Array(type).fill(0);

  const TC0 = tile_center();

  for (let i = 0; i < type; i++) {
    const T = G.currentmap.adj(G.cwt.at, G.cwt.clone().add(i).spin);
    const d1 = geo_dist(tmulh(tmuls(U, T), TC0), tmulh(Centered, P));
    const d2 = geo_dist(tmulh(tmuls(U, T), TC0), tmulh(Centered, C0()));
    dirdist[i] = d1 - d2;
  }

  const res = new movedir();
  res.d = -1;

  for (let i = 0; i < type; i++) {
    if (dirdist[i] < binv) {
      binv = dirdist[i];
      res.d = i;
      res.subdir = dirdist[(i + 1) % type] < dirdist[(i + type - 1) % type] ? 1 : -1;
    }
  }

  // if(euclid) bdir = (bdir + 3) % 6;
  U = U; // (U is not changed further)
  return res;
}
/** unshift(const shiftmatrix&) */
function unshift_sm(T: { T: transmatrix; shift: number }): transmatrix {
  if (T.shift) throw new NotPorted('unshift: shifted matrix (rotation spaces)'); // STAGE2-STUB
  return T.T;
}

/** void remission() */
export function remission(): void {
  if (!G.canmove && (G.cmode & sm.NORMAL) && !G.game_keys_scroll) showMissionScreen(true);
}

/** hyperpoint move_destination_vec(int d) */
export function move_destination_vec(d: number): hyperpoint {
  if (WDIM() === 2 && !embedded_plane()) return tmulh(spin(-d * 45 * Math.PI / 180), smalltangent());
  else if (d & 1) return tmulh(cspin(0, 1, d > 4 ? 45 * Math.PI / 180 : -45 * Math.PI / 180), smalltangent());
  else return tmulh(cspin(0, 2, d * 45 * Math.PI / 180), smalltangent());
}

// EX int keybd_subdir = 1; EX bool keybd_subdir_enabled = 0: G.*

/** void movepckeydir(int d) */
export function movepckeydir(d: number): void {
  // if(debug_graph) println(hlog, "movepckeydir(", d, ")");
  // EUCLIDEAN

  if (protect_memory()) return;

  const md = vectodir(move_destination_vec(d));
  if (G.keybd_subdir_enabled) md.subdir = G.keybd_subdir;

  if (!G.canmove) { movepcto(md.d, md.subdir); remission(); } else movepcto(md.d, md.subdir);
}

/** void movevrdir(hyperpoint vec) */
export function movevrdir(vec: hyperpoint): void {
  const md = vectodir(vec);
  if (!G.canmove) { movepcto(md.d, md.subdir); remission(); } else movepcto(md.d, md.subdir);
}

/** void calcMousedest() */
export function calcMousedest(): void {
  if (G.vid.revcontrol === true) { G.mouseh.h[0] = -G.mouseh.h[0]; G.mouseh.h[1] = -G.mouseh.h[1]; }
  let mousedist = hdist_sp(G.mouseh, tC0_sm(ggmatrix(G.cwt.at)));
  G.mousedest.d = -1;

  const bcwt = G.cwt.clone();

  const type = G.cwt.at.type;
  const dists: number[] = new Array(type).fill(0);

  const U = ggmatrix(G.cwt.at);

  for (let i = 0; i < type; i++) {
    const T = G.currentmap.adj(G.cwt.at, i);
    dists[i] = hdist_sp(G.mouseh, smulh(smul(U, T), C0()));
  }

  for (let i = 0; i < type; i++) if (dists[i] < mousedist) {
    mousedist = dists[i];
    G.mousedest.d = G.cwt.at.c.fix(i - G.cwt.spin);

    G.mousedest.subdir =
      dists[G.cwt.at.c.fix(i + 1)] < dists[G.cwt.at.c.fix(i - 1)] ? 1 : -1;

    if (G.cwt.mirrored) {
      G.mousedest.d = G.cwt.at.c.fix(-G.mousedest.d);
      G.mousedest.subdir = -G.mousedest.subdir;
    }
  }

  if (G.vid.revcontrol === true) { G.mouseh.h[0] = -G.mouseh.h[0]; G.mouseh.h[1] = -G.mouseh.h[1]; }
  G.cwt = bcwt;
}

/** enum class tmode { move, info, drag, fire, ranged }; */
export const tmode = { move: 0, info: 1, drag: 2, fire: 3, ranged: 4 } as const;

// EX bool touch_interface; EX ld drag_sensitivity; EX shiftpoint drag_start; EX bool not_started_dragging;
// EX tmode touchmode: G.*
export const touch_description = ['touch to move', 'touch for info', 'touch to drag', 'touch to aim', 'touch for ranged'];

/** void mousemovement() */
export function mousemovement(): void {

  // CAP_VR: vrhr (no VR)

  if (GDIM() === 3 && !G.which_pointer) {
    if (WDIM() === 2) {
      const View = G.current_display.view_matrix;
      if (View[2][2] < -0.75)
        movepcto(MD_DROP, 1);
      else if (View[2][2] > 0.75)
        movepcto(-1, 1);
      else
        movepckeydir(6);
      return;
    }
    movepckeydir(6);
    return;
  }

  if (protect_memory()) return;
  if (mouseout()) return;

  calcMousedest();
  if (!G.canmove) { movepcto(G.mousedest.d, G.mousedest.subdir); remission(); } else movepcto(G.mousedest.d, G.mousedest.subdir);
  G.lmouseover = null!;
}

// --- CAP_SDLJOY: the joysticks. The browser has no SDL joysticks: `sticks` stays empty, the axes stay 0; the
// code that reads them is kept (checkjoy is also reached by the '`' key). ---

/** vector<joydata> sticks */
export const sticks: unknown[] = [];

/** void initJoysticks_async() */
export function initJoysticks_async(): void {
  if (G.joy_init === 0 /* jiNoJoystick */) return;
  initJoysticks();
}

/** void initJoysticks(): SDL_InitSubSystem(SDL_INIT_JOYSTICK) has no devices in the browser */
export function initJoysticks(): void {
  countJoysticks();
  G.joysticks_initialized = true;
}

/** void countJoysticks() (SDLVER == 1 only) */
export function countJoysticks(): void { }

/** void closeJoysticks() */
export function closeJoysticks(): void { sticks.length = 0; }

let joytime = 0;
// EX bool joy_ignore_next = false: G

/** void read_joy_axes() */
export function read_joy_axes(): void {
  G.joyx = G.joyy = G.panjoyx = G.panjoyy = 0;
  // for(auto& s: sticks) ...: no sticks
}

/** EX bool autojoy (config.cpp; param_b "autojoy", false) */
const autojoy = false;
let checkjoy_laststate = 0;
let checkjoy_lt: number | null = null;

/** void checkjoy() */
export function checkjoy(): void {
  // indenter_finish(debug_joy, "checkjoy");
  if (!DEFAULTCONTROL()) return;
  const joyvalue1 = G.vid.joyvalue * G.vid.joyvalue;
  const joyvalue2 = G.vid.joyvalue2 * G.vid.joyvalue2;

  const jx = G.joyx;
  const jy = G.joyy;
  const sq = jx * jx + jy * jy;

  const curstate = sq < joyvalue1 ? 0 : sq < joyvalue2 ? 1 : 2;
  if (curstate !== checkjoy_laststate) { flashMessages(); checkjoy_laststate = curstate; }

  if (checkjoy_lt === null) checkjoy_lt = G.ticks; // static int lt = ticks;
  const delta = G.ticks - checkjoy_lt;
  checkjoy_lt = G.ticks;

  if (autojoy) {
    if (sq < joyvalue1) { if (G.joydir.d >= 0 && !G.joy_ignore_next) movepcto(G.joydir.d, G.joydir.subdir); G.joydir.d = -1; joytime = 0; G.joy_ignore_next = false; return; }
    if (sq < joyvalue2 && G.joydir.d === -1) return;
  }
  else {
    if (sq < joyvalue1) { G.joydir.d = -1; return; }
  }

  const new_joydir = vectodir(tangent_length(point2(jx, jy), 0.01));
  if (new_joydir.d === G.joydir.d && new_joydir.subdir === G.joydir.subdir) {
    joytime += delta;
    if (joytime > G.vid.joysmooth) joytime = G.vid.joysmooth;
  }
  else {
    joytime -= delta;
    if (joytime < 0) { joytime = -joytime; G.joydir = new_joydir; }
  }
}

/** void checkpanjoy(double t) */
export function checkpanjoy(t: number): void {
  if (G.shmup_on) return;

  if (G.vid.joypanspeed < 1e-7) return;

  if (G.panjoyx * G.panjoyx + G.panjoyy * G.panjoyy < G.vid.joypanthreshold * G.vid.joypanthreshold)
    return;

  const jx = G.panjoyx * t * G.vid.joypanspeed;
  const jy = G.panjoyy * t * G.vid.joypanspeed;

  G.playermoved = false;
  G.current_display.view_matrix = tmul(gpushxto0(hpxy(jx, jy)), G.current_display.view_matrix);
}

// EX bool quitmainloop = false: G.quitmainloop

/** bool doexiton(int sym, int uni) */
export function doexiton(sym: number, uni: number): boolean {
  if (sym === SDLK_ESCAPE) return true;
  if (sym === SDLK_F10) return true;
  if (sym === PSEUDOKEY_EXIT) return true;
  if (sym === PSEUDOKEY_RELEASE) return false;
  if (is_joy_index(sym, deck.escape)) return true;
  // !FAKE_SDL
  if (sym === SDLK_LSHIFT) return false;
  if (sym === SDLK_RSHIFT) return false;
  if (sym === SDLK_LCTRL) return false;
  if (sym === SDLK_RCTRL) return false;
  if (sym === SDLK_LALT) return false;
  if (sym === SDLK_RALT) return false;
  if (uni !== 0 && uni < 128) return true;
  return false;
}

// EX bool didsomething; EX bool smooth_scrolling = false: G.*

/** transmatrix zforward_push(ld z) */
function zforward_push(z: number): transmatrix {
  if (!sl2()) throw new NotPorted('zforward_push: zpush (3D)'); // STAGE2-STUB (3D)
  const T: transmatrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  T[2][3] = z;
  return T;
}
void zforward_push;

/** bool rug::rug_control() (rug.cpp: the hypersian rug is stage 3; false while not rugged) */
function rug_control(): boolean {
  if (G.rug_rugged) throw new NotPorted('rug::rug_control (the hypersian rug)'); // STAGE2-STUB
  return false;
}

/** void zoom_or_fov(ld t) */
export function zoom_or_fov(t: number): void {
  if (in_perspective_v()) {
    throw new NotPorted('zoom_or_fov: perspective (3D)'); // STAGE2-STUB (3D)
  }
  else
    pconf().scale *= t;
}

// EX ld camera_speed = 1; EX ld camera_rot_speed = 1: G.*

/** void full_forward_camera(ld t) */
export function full_forward_camera(t: number): void {
  if (t) G.currently_scrolling = true;
  if (G.anyshiftclick)
    zoom_or_fov(Math.exp(-t / 10.));
  else if (GDIM() === 3) {
    shift_view(ctangent(2, t * G.camera_speed));
    G.didsomething = true;
    G.playermoved = false;
  }
}

/** void full_cstrafe_camera(int dir, ld t) */
export function full_cstrafe_camera(dir: number, t: number): void {
  if (GDIM() === 3) {
    shift_view(ctangent(dir, t * G.camera_speed));
    G.didsomething = true;
    G.playermoved = false;
    if (t) G.currently_scrolling = true;
  }
}

export function full_strafe_camera(t: number): void { full_cstrafe_camera(0, t); }

/** void full_ystrafe_camera(ld t) */
export function full_ystrafe_camera(t: number): void {
  if (G.walking_on) throw new NotPorted('full_ystrafe_camera: walking::eye_level (3D)'); // STAGE2-STUB (3D)
  else full_cstrafe_camera(1, t);
}

// EX ld third_person_rotation = 0: G

/** void full_rotate_camera(int dir, ld val) */
export function full_rotate_camera(dir: number, val: number): void {
  if (!val) return;
  G.currently_scrolling = true;
  if (rug_control() && G.lshiftclick) {
    throw new NotPorted('full_rotate_camera: rug'); // STAGE2-STUB
  }
  else if (G.history_on)
    G.history_lvspeed += (dir ? 1 : -1) * val / 2;
  else if (GDIM() === 3 && G.rshiftclick) {
    shift_view(ctangent(dir, -val * G.camera_speed)); G.didsomething = true; G.playermoved = false; /* -val because shift reverses */
  }
  // CAP_CRYSTAL && CAP_RUG: rug::in_crystal (not rugged)
  else if (GDIM() === 3) {
    throw new NotPorted('full_rotate_camera: 3D'); // STAGE2-STUB (3D)
  }
  else {
    shift_view(ctangent(dir, val * G.camera_speed)); G.playermoved = false; G.didsomething = true;
  }
}

/** void full_rotate_view(ld h, ld v) */
export function full_rotate_view(h: number, v: number): void {
  if (v) G.currently_scrolling = true;
  if (G.history_on && !rug_control())
    throw new NotPorted('full_rotate_view: history (models::rotation)'); // STAGE2-STUB (the band/history mode)
  else {
    rotate_view(cspin(0, 1, v * G.camera_rot_speed));
    G.didsomething = true;
    if (isGravityLand(G.cwt.at.land) && !rug_control())
      G.playermoved = false;
  }
  void h;
}

/** void handlePanning(int sym, int uni) */
export function handlePanning(sym: number, _uni: number): void {
  if (G.mousepan && G.dual_state) throw new NotPorted('handlePanning: dual::split'); // STAGE2-STUB (dual)
  if (GDIM() === 3) {
    if (sym === PSEUDOKEY_WHEELUP) { shift_view(scale_h(ztangent(-0.05 * G.shiftmul), G.camera_speed)); G.didsomething = true; G.playermoved = false; G.currently_scrolling = true; }
    if (sym === PSEUDOKEY_WHEELDOWN) { shift_view(scale_h(ztangent(0.05 * G.shiftmul), G.camera_speed)); G.didsomething = true; G.playermoved = false; G.currently_scrolling = true; }
  }

  // CAP_RUG: rug::using_rugview urv; (not rugged)

  // !ISPANDORA
  if (!G.smooth_scrolling) {
    if (sym === SDLK_END) full_forward_camera(-0.2 * G.shiftmul);
    if (sym === SDLK_HOME) full_forward_camera(0.2 * G.shiftmul);
    if (sym === SDLK_RIGHT) full_rotate_camera(0, -0.2 * G.shiftmul);
    if (sym === SDLK_LEFT) full_rotate_camera(0, 0.2 * G.shiftmul);
    if (sym === SDLK_UP) full_rotate_camera(1, 0.2 * G.shiftmul);
    if (sym === SDLK_DOWN) full_rotate_camera(1, -0.2 * G.shiftmul);
  }
  if (!G.smooth_scrolling && !G.tour_on) {
    if (sym === SDLK_PAGEUP) full_rotate_view(1, cgi().S_step * G.shiftmul);
    if (sym === SDLK_PAGEDOWN) full_rotate_view(-1, -cgi().S_step * G.shiftmul);
    if (sym === SDLK_PAGEUP || sym === SDLK_PAGEDOWN)
      if (isGravityLand(G.cwt.at.land) && !rug_control()) G.playermoved = false;
  }

  if (sym === PSEUDOKEY_WHEELUP && GDIM() === 2) {
    const cd = G.current_display;
    const jx = (G.mousex - cd.xcenter - .0) / cd.radius / 10;
    const jy = (G.mousey - cd.ycenter - .0) / cd.radius / 10;
    G.playermoved = false; G.currently_scrolling = true;
    rotate_view(gpushxto0(hpxy(jx * G.camera_speed, jy * G.camera_speed)));
    sym = 1;
  }
}
function scale_h(h: hyperpoint, k: number): hyperpoint { return h.map((x) => x * k); }

// EX purehookset hooks_fixticks: G
// EX array<int, 8> keys_vi, keys_wasd, keys_numpad: G.*

/** void handle_movement(int sym, int uni) */
export function handle_movement(sym: number, uni: number): void {
  const A = 'A'.charCodeAt(0), Z = 'Z'.charCodeAt(0), d0 = '0'.charCodeAt(0), d9 = '9'.charCodeAt(0);
  if (!(uni >= A && uni <= Z) && DEFAULTCONTROL() && !G.game_keys_scroll) {
    for (let i = 0; i < 8; i++)
      if (among(sym, G.keys_vi[i], G.keys_wasd[i], (uni >= d0 && uni <= d9 /* && !ISMAC */) ? -1 : G.keys_numpad[i]))
        movepckeydir(i);
  }
  // ISPANDORA: no
}

/** #define DEFAULTNOR(sym) (DEFAULTCONTROL || multi::notremapped(sym)) */
export function DEFAULTNOR(sym: number): boolean { return DEFAULTCONTROL() || multi_notremapped(sym); }

const ch = (s: string): number => s.charCodeAt(0);

/** void handleKeyNormal(int sym, int uni) */
export function handleKeyNormal(sym: number, uni: number): void {

  if (G.cheater && sym < 256 && sym > 0 && !G.dialog_key_actions.has(uni)) {
    if (applyCheat(uni))
      uni = sym = 0;
  }

  // CAP_SHOT
  if (uni === ch('A') && !G.dialog_key_actions.has(ch('A'))) { pushScreen(shot_menu); uni = sym = 0; }

  if (DEFAULTNOR(sym)) handlePanning(sym, uni);

  // SCALETUNER: no

  handle_movement(sym, uni);

  // CAP_COMPLEX2
  if (DEFAULTNOR(sym)) {
    gmodekeys(sym, uni);
    // (the online game: marking a mine changes the board in one browser only, so it is off there)
    if (uni === ch('m') && G.canmove && !G.online_lockstep && (G.current_display.precise_center === G.cwt.at ? G.mouseover : G.current_display.precise_center))
      mine_performMarkCommand(G.mouseover);
  }

  if (DEFAULTCONTROL() && !G.game_keys_scroll) {
    if (sym === ch('.') || sym === ch('s')) movepcto(-1, 1);
    if ((sym === SDLK_DELETE || sym === SDLK_KP_PERIOD || sym === ch('g') || is_joy_index(sym, deck.key_g)) && uni !== ch('G') && uni !== ch('G') - 64)
      movepcto(MD_DROP, 1);
    if ((sym === ch('t') || is_joy_index(sym, deck.key_t)) && uni !== ch('T') && uni !== ch('T') - 64 && G.canmove) {
      let target: cell = GDIM() === 3 ? G.mouseover : G.current_display.precise_center;
      if (G.playermoved && G.items[itStrongWind]) {
        const c = whirlwind_jumpDestination(G.cwt.at);
        if (c) target = c;
      }
      if (G.bow_fire_mode) bow_add_fire(target);
      else targetRangedOrb(target, roKeyboard);
      sym = 0; uni = 0;
    }
    if (sym === ch('f') || is_joy_index(sym, deck.key_f)) bow_switch_fire_mode();
    if (sym === ch('`') || is_joy_index(sym, deck.enter)) {
      flashMessages();
      movepcto(G.joydir.d, G.joydir.subdir);
      G.joy_ignore_next = true;
      joytime = -1;
      checkjoy();
    }
  }

  if (sym === SDLK_KP5 && DEFAULTCONTROL() && !G.game_keys_scroll) movepcto(-1, 1);

  if (sym === SDLK_F5) {
    // CAP_DAILY: no
    if (needConfirmation())
      pushScreen(showGameMenu);
    else restart_game();
  }

  if (sym === SDLK_TAB) {
    G.keybd_subdir_enabled = !G.anyshiftclick;
    G.keybd_subdir *= -1;
  }

  if (sym === SDLK_ESCAPE || (is_joy_index(sym, deck.escape) && DEFAULTNOR(sym))) {
    if (G.bow_fire_mode)
      bow_switch_fire_mode();
    else if (G.viewdists)
      G.viewdists = false;
    else
      showMissionScreen(true);
  }

  if (sym === SDLK_F10) {
    // CAP_DAILY: no
    if (needConfirmation()) pushScreen(showGameMenu);
    else G.quitmainloop = true;
  }

  if (uni === ch('o') && DEFAULTNOR(sym)) get_o_key()[1]();
  // CAP_INV
  if (uni === ch('i') && DEFAULTNOR(sym) && G.inv_on && !G.game_keys_scroll)
    pushScreen(inv_show);

  if ((sym === SDLK_F3 || sym === ch(' ')) && DEFAULTNOR(sym)) {
    if (rug_control())
      throw new NotPorted('rug::reset_view'); // STAGE2-STUB
    else
      fullcenter();
  }

  if ((sym === ch('v') || (is_joy_index(sym, deck.alt_enter) && !G.tour_on)) && DEFAULTNOR(sym))
    showMissionScreen(false);

  if (sym === PSEUDOKEY_MENU)
    showMissionScreen(false);

  if (sym === PSEUDOKEY_NOHINT)
    G.no_find_player = true;

  if (sym === PSEUDOKEY_TOUCH) {
    let invalid: boolean;
    do {
      G.touchmode = (1 + G.touchmode) % 5;
      invalid = G.touchmode === tmode.fire && !bow_crossbow_mode();
      if (!G.mapeditor_drawplayer && G.touchmode === tmode.ranged) invalid = true;
      if (G.game_keys_scroll && G.touchmode === tmode.move) invalid = true;
      if (G.drag_sensitivity && G.touchmode === tmode.drag) invalid = true;
    }
    while (invalid);
  }

  if (sym === ch('-') || sym === PSEUDOKEY_WHEELDOWN) {
    G.actonrelease = false;

    G.multi_cpid = 0;
    const adr = G.drag_sensitivity && !G.vid.quickmouse && G.mouse_state !== 2;
    if (adr) {
      if (G.holdmouse && G.not_started_dragging) {
        const d = hdist_sp(G.drag_start, G.mouseh);
        if (d < 1 / G.drag_sensitivity) G.actonrelease = true;
        else { panning(G.drag_start, G.mouseh); G.not_started_dragging = false; }
      }
      else if (G.holdmouse) {
        panning(G.mouseoh, G.mouseh);
      }
      else if (!G.holdmouse) {
        G.drag_start = copy_sp(G.mouseh); G.not_started_dragging = true; G.actonrelease = true;
      }
      G.holdmouse = true;
    }
    else if (G.touchmode === tmode.drag) {
      if (G.holdmouse) panning(G.mouseoh, G.mouseh);
      G.holdmouse = true;
    }
    else if (G.touchmode === tmode.info)
      gotoHelp(G.help);
    else if (G.touchmode === tmode.ranged) {
      if (G.shmup_on ? numplayers() === 1 && shmup_pc0_dead() : true)
        targetRangedOrb(G.mouseover, roMouseForce);
    }
    else if (G.bow_fire_mode || (G.touchmode === tmode.fire && bow_crossbow_mode())) {
      if (G.mouseover) bow_add_fire(G.mouseover);
    }
    else if (G.mouseover &&
      G.targetclick && (G.shmup_on ? numplayers() === 1 && shmup_pc0_dead() : true) && targetRangedOrb(G.mouseover, G.forcetarget ? roMouseForce : roMouse)) {
      /* */
    }
    else if (bow_fire_on_mouse(G.mouseover)) { /* */ }
    else if (G.forcetarget) { /* */ }
    else if (G.rug_rugged && G.rug_renderonce) { /* */ }
    else if (!DEFAULTCONTROL()) {
      if (!G.shmup_on)
        multi_mousemovement(G.mouseover);
    }
    else if (handleCompass()) { /* */ }
    else
      mousemovement();
  }

  if (sym === SDLK_F1) gotoHelp(G.help);

  if (sym === PSEUDOKEY_MEMORY) pushScreen(show_memory_menu);
}
function copy_sp(h: shiftpoint): shiftpoint { return { h: [...h.h], shift: h.shift }; }
/** !shmup::pc[0]->dead (shmup is stage 3) */
function shmup_pc0_dead(): boolean { throw new NotPorted('shmup::pc'); } // STAGE2-STUB (shmup)

// EX bool need_mouseh = false: G

/** void fix_mouseh() */
export function fix_mouseh(): void {
  if (G.rug_rugged) {
    throw new NotPorted('fix_mouseh: rug::gethyper'); // STAGE2-STUB
  }
  // CAP_VR: no
  else {
    if (G.dual_state) {
      throw new NotPorted('fix_mouseh: dual'); // STAGE2-STUB (dual)
    }
    else G.mouseh = gethyper(G.mousex, G.mousey);
  }
  G.need_mouseh = false;
}

/** void handlekey(int sym, int uni) */
export function handlekey(sym: number, uni: number): void {

  if (callhandlers(false, G.hooks_handleKey, sym, uni)) return;

  G.keyhandler(sym, uni);
}

// EX bool game_keys_scroll; EX bool currently_scrolling; EX bool stillscreen: G.*

// CAP_SDL

/** int cframelimit = 1000 */
let cframelimit = 1000;

/** void resize_screen_to(int x, int y) */
export function resize_screen_to(x: number, y: number): void {
  // if(debug_control) println(hlog, "resize_screen_to ", tie(x, y));
  // dual::split_or_do (one player)
  {
    G.vid.killreduction = 0;
    if (!G.vid.want_fullscreen) {
      if (G.vid.relative_window_size) {
        G.vid.window_rel_x = x * 1. / G.vid.xscr;
        G.vid.window_rel_y = y * 1. / G.vid.yscr;
      }
      else {
        G.vid.window_x = x;
        G.vid.window_y = y;
      }
    }
  }
  if (!G.vid.want_fullscreen) apply_screen_settings();
}

let lastframe = 0;

// EX int sc_ticks, sc_ticks2: G.*

/** bool mouseaiming(bool shmupon) */
export function mouseaiming(shmupon: boolean): boolean {
  return (GDIM() === 3 && !shmupon) || (G.rug_rugged && rug_control()) || !!(G.cmode & sm.MOUSEAIM);
}

// EX purehookset hooks_control: G; EX debugflag debug_control

/** bool is_joy_any(int sym) */
export function is_joy_any(sym: number): boolean { return (sym & (-PSEUDOKEY_JOY)) === PSEUDOKEY_JOY; }
/** bool is_joy_index(int sym, int index) */
export function is_joy_index(sym: number, index: number): boolean { return is_joy_any(sym) && (sym & (JOY_ID - 1)) === index; }

/** namespace deck: the default meaning of the Steam Deck buttons */
export const deck = {
  enter: 0, escape: 1, show_keyboard: 2, space: 3, alt_enter: 4, key_t: 7, key_f: 8, key_control: 9, key_alt: 10,
  key_pageup: 12, key_pagedown: 14, key_g: 15, key_shift: 13,
} as const;

/** eMovementAnimation anims::ma (animations.cpp's animation menu, stage 3: anmaOff) */
const anims_ma = 0;

/** void mainloopiter() */
export function mainloopiter(): void {
  // indenter_finish(debug_control, "mainloopiter");
  // GLWRAP;

  // CAP_SDLGFX || CAP_GL: the wall and monster modes stay
  // CAP_VR: no

  if (!G.outoffocus) check_cgi();
  cgi().require_basics();

  if (!G.outoffocus) optimizeview();

  if (!G.outoffocus) models_configure();

  G.lastt = G.ticks;
  G.ticks = SDL_GetTicks();
  callhooks(G.hooks_fixticks);

  G.timetowait = lastframe + Math.trunc(1000 / cframelimit) - G.ticks;

  cframelimit = G.vid.framelimit;
  if (G.stillscreen && cframelimit > 10) cframelimit = 10;
  if (G.outoffocus && cframelimit > 10) cframelimit = 10;

  const normal = (G.cmode & sm.NORMAL) !== 0n;

  if (!G.outoffocus) shmup_turn(G.ticks - G.lastt);

  // (the online game: the players are in other browsers; their decisions come from src/net.ts)
  if (!G.shmup_on && (G.multi_alwaysuse || G.multi_players > 1) && normal && !G.online_lockstep) {
    G.timetowait = 0; multi_handleMulti(G.ticks - G.lastt);
  }

  if (G.vid.sspeed >= 5 && G.current_display.cellmatrices.has(G.cwt.at) && !elliptic() && !G.shmup_on) {
    G.current_display.player_matrix = smul(ggmatrix(G.cwt.at), ddspin(G.cwt.at, G.cwt.spin));
    if (G.cwt.mirrored) G.playerV = smul(G.playerV, Mirror);
  }

  G.mousepan = (G.cmode & sm.NORMAL) !== 0n;
  if ((G.cmode & sm.PANNING) && !G.hiliteclick) G.mousepan = true;
  if (G.cmode & sm.MOUSEAIM) G.mousepan = true;
  if (G.cmode & sm.SHOWCURSOR) G.mousepan = false;
  G.mousepan = G.mousepan && mouseaiming(false) && !!G.mouseaim_sensitivity;
  if (G.mousepan !== G.oldmousepan) {
    G.oldmousepan = G.mousepan;
    // CAP_MOUSEGRAB: SDL_SetRelativeMouseMode (the pointer lock: only in 3D and the rug, stage 3)
    G.mouseaim_x = G.mouseaim_y = 0;
  }

  // ISWEB: timetowait = 0 (the Emscripten build); the port keeps the desktop's frame limit

  if (G.timetowait > 0) {
    // SDLVER == 1: SDL_Delay(timetowait);
  }
  else {
    ors_check_orientation();
    if (G.cmode & sm.CENTER) {
      const aspd = (G.ticks - G.lastt) / 1000.0 * Math.exp(G.vid.sspeed);
      if (G.playermoved && G.vid.sspeed > -4.99 && !G.outoffocus)
        centerpc(aspd);
      else if (GDIM() === 3)
        spinEdge(aspd);
      // CAP_SDLJOY
      if (G.panjoyx || G.panjoyy)
        checkpanjoy((G.ticks - G.lastt) / 1000.0);
    }
    tortoise_updateVals(G.ticks - G.lastt);
    G.frames++;
    if (!G.outoffocus) {
      drawscreen();
      G.need_refresh = false;
    }
    lastframe = G.ticks;
  }

  G.wheelclick = false;

  G.getcshift = 1;

  const keystate = SDL_GetKeyboardState();

  // SDLVER >= 2
  G.pandora_rightclick = !!keystate[SDL_SCANCODE_RCTRL];
  G.pandora_leftclick = !!keystate[SDL_SCANCODE_RSHIFT];

  G.lshiftclick = !!keystate[SDL_SCANCODE_LSHIFT];
  G.rshiftclick = !!keystate[SDL_SCANCODE_RSHIFT];

  G.lctrlclick = !!keystate[SDL_SCANCODE_LCTRL];
  G.rctrlclick = !!keystate[SDL_SCANCODE_RCTRL];

  G.hiliteclick = !!(keystate[SDL_SCANCODE_LALT] | keystate[SDL_SCANCODE_RALT]);

  // if(defaultjoy) for(auto& s: sticks) ...: no sticks

  G.anyshiftclick = G.lshiftclick || G.rshiftclick;
  G.anyctrlclick = G.lctrlclick || G.rctrlclick;

  if (G.anyshiftclick) G.getcshift = -1;
  if (G.anyctrlclick) G.getcshift /= 10;
  if (G.hiliteclick) G.getcshift *= 10;

  G.forcetarget = G.anyshiftclick;

  G.didsomething = false;
  G.currently_scrolling = false;

  if (G.vid.shifttarget & 1) {
    // !ISPANDORA
    G.targetclick = !!(keystate[SDL_SCANCODE_RSHIFT] | keystate[SDL_SCANCODE_LSHIFT]);
  }
  else {
    G.targetclick = true;
  }

  // CAP_SDLAUDIO
  if (S.audio) handlemusic();
  apply_memory_reserve();

  // if(debug_control) println(hlog, "polling for events");

  // CAP_VR: no

  if (mouseaiming(G.shmup_on) && !(G.cmode & sm.MOUSEAIM)) {
    // CAP_MOUSEGRAB
    const ds = G.didsomething;
    full_rotate_camera(0, -G.mouseaim_x);
    full_rotate_camera(1, -G.mouseaim_y);
    G.mouseaim_x = G.mouseaim_y = 0;
    G.didsomething = ds;
  }

  if (G.smooth_scrolling && !G.shmup_on && (G.cmode & (sm.NORMAL | sm.PANNING))) {
    // rug::using_rugview urv;
    const t = (G.ticks - G.sc_ticks) * G.shiftmul / 1000.;
    G.sc_ticks = G.ticks;

    // SDLVER >= 2
    if (keystate[SDL_SCANCODE_END] && GDIM() === 3 && DEFAULTNOR(SDL_SCANCODE_END)) full_forward_camera(-t);
    if (keystate[SDL_SCANCODE_HOME] && GDIM() === 3 && DEFAULTNOR(SDL_SCANCODE_HOME)) full_forward_camera(t);
    if (keystate[SDL_SCANCODE_RIGHT] && DEFAULTNOR(SDL_SCANCODE_RIGHT)) full_rotate_camera(0, -t);
    if (keystate[SDL_SCANCODE_LEFT] && DEFAULTNOR(SDL_SCANCODE_LEFT)) full_rotate_camera(0, t);
    if (keystate[SDL_SCANCODE_UP] && DEFAULTNOR(SDL_SCANCODE_UP)) full_rotate_camera(1, t);
    if (keystate[SDL_SCANCODE_DOWN] && DEFAULTNOR(SDL_SCANCODE_DOWN)) full_rotate_camera(1, -t);
    if (keystate[SDL_SCANCODE_PAGEUP] && DEFAULTNOR(SDL_SCANCODE_PAGEUP)) full_rotate_view(t / (Math.PI / 180), t);
    if (keystate[SDL_SCANCODE_PAGEDOWN] && DEFAULTNOR(SDL_SCANCODE_PAGEDOWN)) full_rotate_view(-t / (Math.PI / 180), -t);
  }
  else G.sc_ticks = G.ticks;

  if (G.game_keys_scroll && !G.shmup_on && (G.cmode & sm.NORMAL) && !keystate[SDL_SCANCODE_LALT] && !keystate[SDL_SCANCODE_RALT]) {
    // rug::using_rugview urv;
    const t = (G.ticks - G.sc_ticks2) * G.shiftmul / 1000.;
    G.sc_ticks2 = G.ticks;

    // SDLVER >= 2: #define dkey(x) keystate[int(x - 'a' + 4)] && DEFAULTNOR(x - 'a' + 4)
    const dkey = (x: string): boolean => !!keystate[ch(x) - ch('a') + 4] && DEFAULTNOR(ch(x) - ch('a') + 4);

    if (dkey('d')) full_rotate_camera(0, -t);
    if (dkey('a')) full_rotate_camera(0, t);
    if (dkey('w')) full_rotate_camera(1, t);
    if (dkey('s')) full_rotate_camera(1, -t);
    if (dkey('q')) full_rotate_view(t / (Math.PI / 180), t);
    if (dkey('e')) full_rotate_view(-t / (Math.PI / 180), -t);

    if (GDIM() === 3 && dkey('i')) full_forward_camera(-t);
    if (GDIM() === 3 && dkey('k')) full_forward_camera(t);
    if (GDIM() === 3 && dkey('l')) full_strafe_camera(-t);
    if (GDIM() === 3 && dkey('j')) full_strafe_camera(t);
    if (GDIM() === 3 && dkey('h')) full_ystrafe_camera(-t);
    if (GDIM() === 3 && dkey('y')) full_ystrafe_camera(t);
  }

  // CAP_VR: no

  callhooks(G.hooks_control);

  for (const d of G.dialog_key_queue) {
    // println(hlog, "handling key ", d);
    handlekey(d, d);
    G.dialog_key_queue.splice(0, 1);
    break;
  }

  if ((G.cmode & (sm.DRAW | sm.MAP)) && G.holdmouse && anims_ma && G.mouseover)
    handlekey(G.getcstat, G.getcstat);

  if ((SDL_GetMouseState() & SDL_BUTTON_MMASK) && !mouseout2())
    G.currently_scrolling = true;

  G.ignore_textinput = false;
  G.ui_mousex = G.mousex; G.ui_mousey = G.mousey;
  // SDLVER >= 2
  if (G.timetowait > 0) {
    // SDL_WaitEventTimeout(&ev, timetowait): the browser cannot wait; an event already queued is handled
    const ev = SDL_PollEvent();
    if (ev) handle_event(ev);
  }
  for (let ev = SDL_PollEvent(); ev; ev = SDL_PollEvent()) handle_event(ev);
  fix_mouseh();

  // CAP_SDLJOY
  if (G.joydir.d !== -1) checkjoy();
  // CAP_THREAD: the joystick thread (none)
}

// EX bool need_refresh; EX int ui_mousex, ui_mousey; EX bool ignore_textinput: G.*

/** void refresh_if_needed() */
export function refresh_if_needed(): void {
  if (!G.need_refresh) return;
  G.just_refreshing = 1;
  reset_handlers();
  G.screens[G.screens.length - 1]();
  G.just_refreshing = 0;
}

/** void handle_event(SDL_Event& ev) */
export function handle_event(ev: SDL_Event): void {
  const normal = (G.cmode & sm.NORMAL) !== 0n;
  // indenter_finish(debug_control, "got event type #" + its(ev.type));
  let sym = 0;
  let uni = 0;
  G.shiftmul = 1;
  G.mouse_state = 0;

  // SDLVER >= 2 && CAP_SDLJOY: SDL_JOYDEVICEADDED / REMOVED (no SDL joysticks in the browser)

  // SDLVER == 2
  if (ev.type === SDL_WINDOWEVENT) {
    const w = ev.window.event;
    if (w === SDL_WINDOWEVENT_ENTER)
      G.outoffocus = false;
    if (w === SDL_WINDOWEVENT_LEAVE)
      G.outoffocus = true;
    if (w === SDL_WINDOWEVENT_EXPOSED)
      drawscreen();
    if (w === SDL_WINDOWEVENT_RESIZED)
      resize_screen_to(ev.window.data1, ev.window.data2);
  }

  // CAP_SDLJOY: the joystick and controller events (none in the browser); joyhandler is the default (false)

  if (ev.type === SDL_EVENT_KEY_DOWN) {
    flashMessages();
    G.mousing = false;
    sym = ev.key.keysym.sym;
    const mod = ev.key.keysym.mod;
    // SDLVER >= 2
    uni = ev.key.keysym.sym;
    const shift = (mod & (SDL_KMOD_LSHIFT | SDL_KMOD_RSHIFT)) !== 0;
    if (uni === ch('=') && shift) uni = ch('+');
    if (uni === ch('1') && shift) uni = ch('!');
    if (uni === ch('2') && shift) uni = ch('@');
    if (uni === ch('3') && shift) uni = ch('#');
    if (uni === ch('4') && shift) uni = ch('$');
    if (uni === ch('5') && shift) uni = ch('%');
    if (uni === ch('6') && shift) uni = ch('^');
    if (uni === ch('7') && shift) uni = ch('&');
    if (uni === ch('8') && shift) uni = ch('*');
    if (uni === ch('9') && shift) uni = ch('(');
    if (uni === ch('0') && shift) uni = ch(')');
    if (uni >= ch('a') && uni <= ch('z')) {
      if (shift) uni -= 32;
      else if (mod & (SDL_KMOD_LCTRL | SDL_KMOD_RCTRL)) uni -= 96;
    }
    G.numlock_on = (mod & SDL_KMOD_NUM) !== 0;
    if (sym === SDLK_RETURN && (mod & (SDL_KMOD_LALT | SDL_KMOD_RALT))) {
      sym = 0; uni = 0;
      G.vid.want_fullscreen = !G.vid.want_fullscreen;
      apply_screen_settings();
    }
  }

  // SDLVER >= 2
  if (ev.type === SDL_EVENT_TEXT_INPUT) {
    refresh_if_needed();
    if (G.ignore_textinput) G.ignore_textinput = false;
    else G.texthandler(ev.text.text);
  }

  dialog_handleZooming(ev);

  if (sym === SDLK_F1 && normal && G.playermoved)
    G.help = '@';

  const rollchange = (G.cmode & sm.OVERVIEW) && G.getcstat >= 2000 && G.cheater;

  // SDL12(, || ev.type == SDL_EVENT_MOUSE_WHEEL): with SDL2 the wheel is in this branch
  if (ev.type === SDL_EVENT_MOUSE_BUTTON_DOWN || ev.type === SDL_EVENT_MOUSE_BUTTON_UP || ev.type === SDL_EVENT_MOUSE_WHEEL) {

    let current_mouse_x = ev.button.x, current_mouse_y = ev.button.y;

    // SDLVER == 2
    if (ev.type === SDL_EVENT_MOUSE_WHEEL) { current_mouse_x = ev.wheel.mouseX; current_mouse_y = ev.wheel.mouseY; }

    if (current_mouse_x !== G.ui_mousex || current_mouse_y !== G.ui_mousey) {
      G.mousex = G.ui_mousex = current_mouse_x;
      G.mousey = G.ui_mousey = current_mouse_y;
      fix_mouseh();
      G.just_refreshing = 2;
      reset_handlers();
      G.screens[G.screens.length - 1]();
      G.just_refreshing = 0;
      G.need_refresh = false;
    }

    G.mousepressed = ev.type === SDL_EVENT_MOUSE_BUTTON_DOWN;
    if (G.mousepressed) flashMessages();
    G.mousing = true;
    G.which_pointer = 0;
    const was_holdmouse = G.holdmouse;
    G.holdmouse = false;
    G.invslider = false;

    const down = ev.type === SDL_EVENT_MOUSE_BUTTON_DOWN || ev.type === SDL_EVENT_MOUSE_WHEEL;
    const up = ev.type === SDL_EVENT_MOUSE_BUTTON_UP;

    let act = false;
    G.mouse_state = down ? 1 : up ? 2 : 0;

    const startdrag = G.getcstat === ch('-') &&
      (G.touchmode === tmode.drag || (!G.vid.quickmouse && !!G.drag_sensitivity && !was_holdmouse));

    if (G.vid.quickmouse || G.getcstat === PSEUDOKEY_LIST_SLIDER || startdrag) {
      act = down;
    }
    else {
      act = G.actonrelease && up;
      G.actonrelease = down;
    }

    fix_mouseh();

    if (was_holdmouse && up)
      sym = uni = PSEUDOKEY_RELEASE;

    /* simulate RMB and MMB for Mac users etc. */
    if (ev.button.button === SDL_BUTTON_LEFT) {
      if (/* ISPANDORA ? pandora_rightclick : */ G.lctrlclick)
        ev.button.button = SDL_BUTTON_MIDDLE;
      else if (/* ISPANDORA ? pandora_leftclick : */ G.lshiftclick && !(G.vid.shifttarget & 1) && !(G.cmode & sm.MAP))
        ev.button.button = SDL_BUTTON_RIGHT;
    }

    // (a wheel event's ev.button.button is the low byte of ev.wheel.x, the horizontal scroll: 0 here)
    if (!act) { /* */ }

    else if (ev.button.button === SDL_BUTTON_RIGHT)
      sym = SDLK_F1;
    else if (ev.button.button === SDL_BUTTON_MIDDLE) {
      sym = 1; G.didsomething = true;
    }
    else if (ev.button.button === SDL_BUTTON_LEFT) {
      sym = G.getcstat; uni = G.getcstat; G.shiftmul = G.getcshift;
    }

    else if (ev.type === SDL_EVENT_MOUSE_WHEEL) {
      // SDLVER >= 2
      const dir = ev.wheel.y * 0.25;
      if (G.lshiftclick && G.rshiftclick && !G.rug_rugged && GDIM() === 2) {
        mapeditor_scaleall(Math.pow(2, dir), G.lctrlclick);
        pconf().alpha *= Math.pow(2, dir);
      }
      else if (G.lshiftclick && GDIM() === 2)
        mapeditor_scaleall(Math.pow(2, dir), G.lctrlclick);
      else if (G.rshiftclick && !G.rug_rugged && GDIM() === 2)
        pconf().alpha -= dir;
      else if (G.lctrlclick) {
        const cd = G.current_display;
        if (dir > 0) {
          pconf().xposition += (.0 + G.mousex - cd.xcenter) / pconf().scale / cd.scrsize;
          pconf().yposition += (.0 + G.mousey - cd.ycenter) / pconf().scale / cd.scrsize;
        }
        else
          pconf().xposition = pconf().yposition = 0;
      }
      else if (rollchange) {
        sym = G.getcstat; uni = G.getcstat; G.shiftmul = -dir * 4 * G.getcshift; G.wheelclick = true;
      }
      else {
        sym = uni = dir > 0 ? PSEUDOKEY_WHEELUP : PSEUDOKEY_WHEELDOWN;
      }
    }
  }

  if (ev.type === SDL_EVENT_MOUSE_MOTION) {
    G.mouseoh = copy_sp(G.mouseh);

    const lmousex = G.mousex, lmousey = G.mousey;

    G.mousing = true;
    G.which_pointer = 0;
    G.mousemoved = true;
    G.mousex = ev.motion.x;
    G.mousey = ev.motion.y;

    if (G.mousepan) {
      G.mousex = G.vid.xres >> 1;
      G.mousey = G.vid.yres >> 1;
      G.mouseaim_x += ev.motion.xrel * G.mouseaim_sensitivity;
      G.mouseaim_y += ev.motion.yrel * G.mouseaim_sensitivity;
    }

    G.need_mouseh = true;

    if (G.holdmouse && G.getcstat === ch('-')) { sym = uni = G.getcstat; fix_mouseh(); G.mouse_state = 3; }

    if ((SDL_GetMouseState() & SDL_BUTTON_MMASK) && !mouseout2()) {
      fix_mouseh();
      if (G.lctrlclick) {
        pconf().xposition += (G.mousex - lmousex) * 1. / G.current_display.scrsize;
        pconf().yposition += (G.mousey - lmousey) * 1. / G.current_display.scrsize;
      }
      else if (G.mouseh.h[2 /* LDIM */] < 50 && G.mouseoh.h[2] < 50) {
        panning(G.mouseoh, G.mouseh);
      }
    }

    // SIMULATE_JOYSTICK: no

    if (G.mousepressed && G.inslider) {
      sym = G.getcstat; uni = G.getcstat; G.shiftmul = G.getcshift;
    }
  }

  if (ev.type === SDL_EVENT_QUIT) {
    // CAP_DAILY: no
    if (needConfirmation() && !(G.cmode & sm.MISSION)) showMissionScreen(false);
    else G.quitmainloop = true;
  }

  if (sym === SDLK_F4 && G.anyshiftclick) {
    G.nomap = !G.nomap;
    sym = 0;
  }

  if (sym === SDLK_F2 && G.anyshiftclick) {
    G.nohud = !G.nohud;
    sym = 0;
  }

  if (sym === SDLK_F3 && G.anyshiftclick) {
    G.nofps = !G.nofps;
    sym = 0;
  }

  if (sym || uni) {
    refresh_if_needed();
    G.need_refresh = true;
  }

  handlekey(sym, uni);
}

/** void mainloop() (the desktop loop; the browser calls mainloopiter once per animation frame, src/index.ts) */
export function mainloop(): void {
  if (G.noGUI) return;
  G.lastt = 0;
  // !ISWEB
  while (!G.quitmainloop) mainloopiter();
}

/** bool interpret_as_direction(int sym, int uni). Note: with SDL2, SDLK_KP0 (SDLK_KP_0) is above SDLK_KP9, so the
 *  range is empty and this is always false, as in the original's SDL2 build */
export function interpret_as_direction(sym: number, _uni: number): boolean {
  return (sym >= SDLK_KP_0 && sym <= SDLK_KP_9 && !G.numlock_on);
}

/** int get_direction_key(int sym, int uni) (the DKEY macro; the original tests SDLK_KP8 twice) */
export function get_direction_key(sym: number, uni: number): number {
  if (interpret_as_direction(sym, uni)) {
    if (sym === SDLK_KP_1) return SDLK_END;
    if (sym === SDLK_KP_2) return SDLK_DOWN;
    if (sym === SDLK_KP_3) return SDLK_PAGEDOWN;
    if (sym === SDLK_KP_4) return SDLK_LEFT;
    if (sym === SDLK_KP_6) return SDLK_RIGHT;
    if (sym === SDLK_KP_7) return SDLK_HOME;
    if (sym === SDLK_KP_8) return SDLK_UP;
    if (sym === SDLK_KP_8) return SDLK_PAGEUP;
    return 0;
  }
  return sym;
}

/** #define DIRECTIONKEY (interpret_as_direction(sym, uni) ? uni : 0) */
export function DIRECTIONKEY(sym: number, uni: number): number { return interpret_as_direction(sym, uni) ? uni : 0; }

/** #define NUMBERKEY (interpret_as_direction(sym, uni) ? 0 : uni) */
export function NUMBERKEY(sym: number, uni: number): number { return interpret_as_direction(sym, uni) ? 0 : uni; }

/** bool gmodekeys(int sym, int uni) */
export function gmodekeys(sym: number, uni: number): boolean {
  // CAP_RUG: if(rug::rugged && rug::handlekeys(sym, uni)) return true;
  if (G.rug_rugged) throw new NotPorted('gmodekeys: rug::handlekeys'); // STAGE2-STUB

  const vid = G.vid;
  const NK = NUMBERKEY(sym, uni);
  if (NK === ch('6')) { vid.grid = !vid.grid; return true; }
  if (NK === ch('7')) { vid.darkhepta = !vid.darkhepta; return true; }

  if (NK === ch('1'))
    pushScreen(models_quick_model);

  if (GDIM() === 2) {
    if (NK === ch('5')) { vid.wallmode += 60 + (G.shiftmul > 0 ? 1 : -1); vid.wallmode %= 7; }
    else if ((NK === ch('8') && G.hiliteclick) || NK === 508) {
      vid.highlightmode += 60 + (G.shiftmul > 0 ? 1 : -1); vid.highlightmode %= 3;
    }
    else if (NK === ch('8')) {
      vid.monmode += 60 + (G.shiftmul > 0 ? 1 : -1); vid.monmode %= 4;
    }

    else if (uni === ch('%')) {
      if (vid.wallmode === 0) vid.wallmode = 6;
      vid.wallmode--;
    }
    else return false;
    return true;
  }
  else {
    if (NK === ch('5')) { vid.wallmode = vid.wallmode === 5 ? 4 : 5; }
    else if (NK === ch('8')) {
      if (vid.monmode === 0) vid.monmode = 1;
      else if (vid.monmode === 1) vid.monmode = 3;
      else vid.monmode = 0;
    }
    else return false;
    return true;
  }
}

/** bool haveMobileCompass() (desktop: forcetarget) */
export function haveMobileCompass(): boolean {
  if (G.forcetarget) return false;
  if (GDIM() === 3) return false;
  return G.canmove && !G.shmup_on && G.vid.mobilecompasssize > 0 && isize(G.screens) === 1;
}

/** bool handleCompass() */
export function handleCompass(): boolean {
  if (!haveMobileCompass()) return false;
  // using namespace shmupballs: hud.cpp's calcshmupballs (the mobile compass: off on the desktop, size 0)
  throw new NotPorted('handleCompass: shmupballs (the mobile compass)'); // STAGE2-STUB
  void MD_WAIT;
}

// --- namespace ors (orientation sensors; CAP_ORIENTATION is off on the desktop: mode stays 0) ---

// EX int mode: G.ors_mode; double sensitivity: G.ors_sensitivity
export const ors_choices = ['OFF', 'relative', 'absolute'];

/** void ors::reset() (CAP_ORIENTATION: off) */
export function ors_reset(): void { }

/** ors::unrotate(transmatrix& T): `if(mode == 1) T = inverse(relative_matrix) * T;` returns the new T
 *  (relative_matrix stays Id without CAP_ORIENTATION) */
export function ors_unrotate(T: transmatrix): transmatrix {
  if (G.ors_mode === 1) return tmul(inverse(ors_relative_matrix), T);
  return T;
}
/** ors::rerotate(transmatrix& T): `if(mode == 1) T = relative_matrix * T;` returns the new T */
export function ors_rerotate(T: transmatrix): transmatrix {
  if (G.ors_mode === 1) return tmul(ors_relative_matrix, T);
  return T;
}
/** transmatrix relative_matrix = Id */
const ors_relative_matrix: transmatrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];

/** void ors::check_orientation() (CAP_ORIENTATION: off) */
export function ors_check_orientation(): void { }


/** The screen of a later package (STAGE2-STUB): a stub screen calls this, which takes it off the stack and draws
 *  the screen below in its place, so that the call is kept and nothing visible happens (U2 menus/help, U4
 *  settings, stage 3). */
export function stub_screen_pop(): void {
  popScreen();
  if (G.screens.length) G.screens[G.screens.length - 1]();
}
