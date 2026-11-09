// hyper-main.cpp of HyperRogue 13.1o (package P8): hyper_init (the program start) and the static initializers of
// all files. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// C++ runs the static initializers of hyper.cpp's one translation unit in include order before main; they
// register hooks (addHook: equal priorities are bumped in registration order, so the order matters) and fill
// tables. Each module exports `register_<file>()` doing that; register_all() calls them in hyper.cpp's include
// order, once, before anything else. A package that adds a register function adds its call here, at its file's
// place in the list below.
import { G } from './globals.ts';
import { callhandlers, hr_exception } from './hyper.ts';
import { register_classes } from './classes.ts';
import { register_heptagon } from './heptagon.ts';
import { register_euclid } from './euclid.ts';
import { register_geom_exp } from './geom-exp.ts';
import { register_fieldpattern } from './fieldpattern.ts';
import { register_geometry2 } from './geometry2.ts';
import { register_floorshapes } from './floorshapes.ts';
import { register_cell } from './cell.ts';
import { register_goldberg } from './goldberg.ts';
import { register_goldberg_sub } from './goldberg-sub.ts';
import { register_yendor } from './yendor.ts';
import { register_complex } from './complex.ts';
import { register_orbgen } from './orbgen.ts';
import { register_landlock } from './landlock.ts';
import { register_wfcgen } from './wfcgen.ts';
import { register_config } from './config.ts';
import { register_system, initAll, start_game, progress_warning, finishAll } from './system.ts';
import { register_debug } from './debug.ts';
import { register_sound } from './sound.ts';
import { register_history } from './history.ts';
import { register_graph } from './graph.ts';
import { register_animations } from './animations.ts';
import { register_blizzard } from './blizzard.ts';
import { register_achievement } from './achievement.ts';
import { register_complex2 } from './complex2.ts';
import { register_bigstuff } from './bigstuff.ts';
import { register_commandline, arg_init, arg_read, initializeCLI } from './commandline.ts';
import { mainloop, pushScreen } from './control.ts';
import { showStartMenu, register_menus } from './menus.ts';
import { startanims_pick } from './screenshot.ts';

let registered = false;

/** the static initializers, in hyper.cpp's include order */
export function register_all(): void {
  if (registered) return;
  registered = true;
  register_classes(); // classes.cpp
  // colors.cpp glhr.cpp shaders.cpp raycaster.cpp hprint.cpp util.cpp hyperpoint.cpp patterns.cpp
  register_fieldpattern(); // fieldpattern.cpp (added by P1b)
  register_heptagon(); // heptagon.cpp
  // binary-tiling.cpp nonisotropic.cpp asonov.cpp kite.cpp aperiodic-hat.cpp backed-map.cpp archimedean.cpp
  // arbitrile.cpp rulegen.cpp rulegen3.cpp
  register_euclid(); // euclid.cpp (added by G1: euhook)
  // sphere.cpp fake.cpp quotient.cpp crystal.cpp reg3.cpp
  // language.cpp
  register_cell(); // cell.cpp
  // locations.cpp expansion.cpp
  register_goldberg(); // goldberg.cpp (added by G2: hooksw)
  register_goldberg_sub(); // goldberg-sub.cpp (added by G2: hookc, the -gbs-* options)
  // irregular.cpp pattern2.cpp flags.cpp
  register_yendor(); // yendor.cpp
  register_complex(); // complex.cpp (added by P5)
  register_complex2(); // complex2.cpp (added by P4)
  // savemem.cpp game.cpp passable.cpp checkmove.cpp pcmove.cpp environment.cpp
  // monstermove.cpp mapeffects.cpp attack.cpp items.cpp
  register_orbgen(); // orbgen.cpp
  // monstergen.cpp
  register_landlock(); // landlock.cpp
  // landgen.cpp
  register_wfcgen(); // wfcgen.cpp
  // orbs.cpp inventory.cpp
  register_system(); // system.cpp
  register_debug(); // debug.cpp
  // geometry.cpp embeddings.cpp
  register_geometry2(); // geometry2.cpp (added by P1b)
  // polygons.cpp 3d-models.cpp
  register_floorshapes(); // floorshapes.cpp (added by D2: hrmap_standard::shvid)
  // usershapes.cpp drawing.cpp
  // mapeditor.cpp netgen.cpp nofont.cpp basegraph.cpp screenshot.cpp renderbuffer.cpp help.cpp legacy.cpp
  register_config(); // config.cpp
  // scores.cpp dialogs.cpp
  register_menus(); // menus.cpp (added by U2: ah_menu, the -d: options)
  register_geom_exp(); // geom-exp.cpp (added by G1: ah_geom)
  // quit.cpp multi.cpp shmup.cpp racing.cpp models.cpp
  register_history(); // history.cpp
  // rug.cpp control.cpp hud.cpp radar.cpp hypgraph.cpp textures.cpp
  register_graph(); // graph.cpp (added by D3: graphcm, hooksw)
  // graph-player.cpp
  register_animations(); // animations.cpp (added by D4: ahgf)
  // graph-wall.cpp graph-item.cpp graph-monster.cpp celldrawer.cpp sky.cpp
  register_blizzard(); // blizzard.cpp (added by D4: ccm_blizzard)
  register_sound(); // sound.cpp
  register_achievement(); // achievement.cpp
  // barriers.cpp surface.cpp tour.cpp
  register_commandline(); // commandline.cpp
  register_bigstuff(); // bigstuff.cpp (added by P4)
  // multigame.cpp inforder.cpp vr.cpp intra.cpp crossbow.cpp fundamental.cpp arbiquotient.cpp
  // rogueviz/rogueviz-all.cpp mobile.cpp hyper-main.cpp
}

// EX hookset<bool(int argc, char** argv)> hooks_main: G.hooks_main; EX bool initialized = false: G.initialized

/** convenience function for libhyper.so: initialize libhyper with given parameters. argv[0] is the program name. */
export function hyper_init(argv: string[] = []): number {
  register_all();
  // !ISWEB && !ISMOBILE
  arg_init(argv);
  if (callhandlers(false, G.hooks_main, argv.length, argv)) return 0;
  // ISLINUX: moreStack() (the JS stack is the host's)
  // CAP_COMMANDLINE
  initializeCLI();
  initAll();
  // CAP_COMMANDLINE
  arg_read(3);
  start_game();
  G.initialized = true;
  return 1;
}

/** convenience function for libhyper.so: play the game loop */
export function hyper_loop(): void {
  if (!G.initialized) hyper_init();
  G.quitmainloop = false;
  mainloop();
}

export function hyper_main(argv: string[]): number {
  try {
    if (!hyper_init(argv)) return 0;
    // !ISWEB
    if (G.showstartmenu && !G.vid.skipstart) {
      startanims_pick(); // CAP_STARTANIM
      pushScreen(showStartMenu);
    }
    progress_warning();
    mainloop();
    finishAll();
  } catch (e) {
    if (!(e instanceof hr_exception)) throw e;
    // println(hlog, "exception not caught: ", e.what());
  }
  return 0;
}

// --- stage 2, package U3: hyper_main for the browser, which cannot block in mainloop(): src/index.ts calls
// hyper_main_init, then mainloopiter once per animation frame until quitmainloop, then hyper_main_finish ---

/** hyper_main up to mainloop(): false if the program ended (an hr_exception, as hyper_main catches it) */
export function hyper_main_init(argv: string[]): boolean {
  try {
    if (!hyper_init(argv)) return false;
    // !ISWEB
    if (G.showstartmenu && !G.vid.skipstart) {
      startanims_pick(); // CAP_STARTANIM
      pushScreen(showStartMenu);
    }
    progress_warning();
    G.lastt = 0; // mainloop(): lastt = 0;
    return true;
  } catch (e) {
    if (!(e instanceof hr_exception)) throw e;
    return false;
  }
}

/** hyper_main after mainloop() */
export function hyper_main_finish(): void {
  try {
    finishAll();
  } catch (e) {
    if (!(e instanceof hr_exception)) throw e;
  }
}
