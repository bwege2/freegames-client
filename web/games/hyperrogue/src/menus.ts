// menus.cpp of HyperRogue 13.1o (stage 2, package U2): the generic menus (the start menu, the world overview,
// the special modes, creative mode, highlights, land structure, custom mode, the message log, the 'o' key).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// named_functionality is a [name, action] pair (U3's get_o_key API). Actions that lead into stage-3 code (other
// geometries, the editors, shmup, racing, the rug, textures: CAP_TEXTURE is 0 in the oracle's build) call the
// stubs of their modules. The edit items of config.cpp parameters (add_edit) are U4's: the items are drawn as
// config.cpp draws them, their actions are STAGE2-STUBs here (marked).
import { G } from './globals.ts';
import { time, idiv, type Ref } from './cpp.ts';
import { localtime } from './cfile.ts';
import { its } from './hprint.ts';
import { isize, callhooks, NotPorted } from './hyper.ts';
import {
  linf, iinf, winf, landtypes, ittypes, walltypes, itShard, itSavedPrincess, waMirror, laHell, laPrincessQuest,
  laPalace, laIce, laCanvas, laAsteroids, laMinefield, laMirrorOld, laDesert, laMotion, laCamelot, laEmerald,
  moVizier, moPrincess, itHolyGrail, type eLand,
} from './content.ts';
import { XLAT, XLAT1, XLATN, spM, spL, spI, dnameof_l, dnameof_i } from './language.ts';
import { restart_game, stop_game, start_game, rg_inv, rg_randpattern, rg_dualmode, rg_princess, rg_yendor,
  welcomeMessage, progress_warning, set_geometry, set_variation } from './system.ts';
import { addMessage, clearMessages, displaystr, displayButton, fullmsg, type msginfo } from './basegraph.ts';
import { pureHardcore } from './checkmove.ts';
import { popScreenAll, pushScreen, doexiton, get_direction_key, gmodekeys } from './control.ts';
import { popScreen, gamescreen, sm } from './graph.ts';
import {
  closed_or_bounded, GDIM, NONSTDVAR, CHANGED_VARIATION, gNormal, gKleinQuartic, gBring, gEuclid,
  gZebraQuotient, eVariation,
} from './classes.ts';
import {
  lsSingle, lsNiceWalls, lsNoWalls, lsGUARD, lsChaosRW, lsLandscape, lsCursedWalls, land_structure_name,
  ls_any_chaos, ls_horodisk_structure, fix_land_structure_choice, generateLandList, isLandIngame, landUnlocked,
  getLandForList, treasureType, landMultiplier, required_for_hyperstones, countHyperstoneQuest, lands_for_hell,
  in_full_game, customize_land_list, treasureTypeUnlock,
} from './landlock.ts';
import { yendor_get_land_structure, modecode, yendor_showMenu, tactic_showMenu, tactic_start, peace_showMenu,
  prepare_custom, list_saved_custom_modes, update_modename, yendor_chelp } from './yendor.ts';
import { nice_walls_available } from './bigstuff.ts';
import { tkills, killtypes } from './attack.ts';
import { gold, hiitems_at } from './items.ts';
import { orbsUnlocked, nativeOrbType, getOLR } from './orbgen.ts';
import {
  dialog_init, dialog_init_t, dialog_addItem, dialog_addSelItem, dialog_addBoolItem, dialog_addBreak,
  dialog_addInfo, dialog_addBack, dialog_display, dialog_add_action, dialog_add_action_push, dialog_handleNavigation,
  dialog_addBigItem, dialog_extend, dialog_add_confirmation, dialog_add_action_confirmed, dialog_cheat_if_confirmed,
  dialog_do_if_confirmed, dialog_push_confirm_dialog, dialog_addTitle, dialog_addHelp_s, dialog_editNumber,
  dialog_scaleSinh, dialog_handlePage, dialog_display_bottom_buttons, dialog_handlePageButtons,
  dialog_editInfix, dialog_hasInfix, dialog_helpToEdit, dialog_get_ne, dialog_get_di, dialog_bound_low,
  dialog_edit_string, dialog_openFileDialog, dialog_keyname, dialog_zoom_displayfr, displayfrZH, ONOFF, IFM,
  DB_BACK, DB_HELP,
} from './dialogs.ts';
import { gotoHelp, gotoHelpFor, generateHelpForItem, generateHelpForWall, help_extension } from './help.ts';
import { cheatMoveTo } from './debug.ts';
import { fullcenter } from './hypgraph.ts';
import { updatepinnedglyphs } from './hud.ts';
import { checkmove } from './checkmove.ts';
import { create_los } from './environment.ts';
import { update_lastexplore } from './landgen.ts';
import { have_current_settings, have_current_graph_settings, reset_graph_settings, resetModes } from './config.ts';
import { showGameMenu } from './quit.ts';
import { multi_configure, multi_showConfigureMultiplayer } from './multi.ts';
import { online_showMenu } from './online.ts';
import { bow_showMenu } from './crossbow.ts';
import { halloween_start_all } from './complex.ts';
import { history_history_menu } from './history.ts';
import { shot_menu, anims_any_on, anims_show, startanims_display, startanims_pick, startanims_explore,
  startanims_EXPLORE_START_ANIMATION } from './screenshot.ts';
import { linepatterns_showMenu } from './pattern2.ts';
import { mapeditor_showMapEditor, mapeditor_showDrawEditor, mapeditor_initdraw } from './mapeditor.ts';
import { runGeometryExperiments, activate_ge_land_selection, showEuclideanMenu } from './geom-exp.ts';
import { shmup_switch_shmup } from './shmup.ts';
import { racing_configure_race, racing_start_thurston } from './racing.ts';
import { tour_start } from './tour.ts';
import { dual_mayboth } from './multigame.ts';
import { crystal_set_crystal, crystal_crystal_knight_help } from './crystal.ts';
import { hiitemsMax } from './yendor.ts';
import { hrand } from './rand.ts';
import { save_mode_to_file, load_mode_from_file } from './system.ts';
import {
  SDLK_ESCAPE, SDLK_F1, SDLK_F5, SDLK_F10, SDLK_DOWN, SDLK_UP, SDLK_PAGEUP, SDLK_PAGEDOWN, PSEUDOKEY_WHEELDOWN,
  PSEUDOKEY_WHEELUP,
} from './sdl.ts';

const BLACKISH = 0x404040;
// #define REDDISH 0x400000 (unused)

const ch = (c: string): number => c.charCodeAt(0);
/** #define DKEY (get_direction_key(sym, uni)) */
const DKEY = (sym: number, uni: number): number => get_direction_key(sym, uni);
/** displayfrZ: dialog::zoom::displayfr */
const displayfrZ = dialog_zoom_displayfr;

/** int PREC(ld x) */
export function PREC(x: number): number {
  const sh = G.shiftmul;
  if (sh > -.2 && sh < .2) x = 10.01;
  return Math.trunc(G.shiftmul * x);
}

/** void showOverview() */
export function showOverview(): void {
  G.cmode = sm.ZOOMABLE | sm.OVERVIEW;
  // indenter_finish dif(debug_graph, "show overview");

  if (G.dialog_infix !== '')
    G.mouseovers = G.dialog_infix;
  else {
    G.mouseovers = XLAT('world overview');
    G.mouseovers += '       ';
    G.mouseovers += XLAT(' kills: %1/%2', its(tkills()), its(killtypes()));
    G.mouseovers += XLAT(' $$$: %1', its(gold()));
    if (G.randomPatternsMode) { /* */ }
    else if (landUnlocked(laHell)) {
      const i1: Ref<number> = { v: 0 }, i2: Ref<number> = { v: 0 }; countHyperstoneQuest(i1, i2);
      G.mouseovers += XLAT(' Hyperstone: %1/%2', its(i1.v), its(i2.v));
    }
    else
      G.mouseovers += XLAT(' Hell: %1/%2', its(orbsUnlocked()), its(lands_for_hell()));
  }

  {
    const ds = G.dual_state;
    G.dual_state = G.dual_state ? 2 : 0;
    try { generateLandList(isLandIngame); }
    finally { G.dual_state = ds; }
  }

  let not_in_game = false;

  let displayed_landlist = [...G.landlist];

  if (G.dialog_infix !== '') {
    const land_matches = (l: eLand): boolean => {
      let s = dnameof_l(l);
      s += '@';
      s += dnameof_i(treasureType(l));
      s += '@';
      s += dnameof_i(nativeOrbType(l));
      return dialog_hasInfix(s);
    };

    const filtered: eLand[] = [];
    for (const l of G.landlist) if (land_matches(l)) filtered.push(l);
    if (filtered.length)
      displayed_landlist = filtered;
    else {
      for (let i = 0; i < landtypes; i++) if (land_matches(i)) filtered.push(i);
      if (filtered.length) displayed_landlist = filtered, not_in_game = true;
    }
  }

  let nl = isize(displayed_landlist), nlm: number;

  let lstart = 0;

  const numpages = idiv(nl - 1, G.lands_per_page) + 1;

  if (numpages > 1) {
    const p = dialog_handlePage(nl, G.lands_per_page, numpages);
    lstart += p.ret; nl = p.nl; nlm = p.nlm;
  }
  else nlm = nl;

  if (nlm <= 0) nlm = 1;

  const vf = Math.min(idiv(G.vid.yres - 64 - G.vid.fsize * 2, nlm) + (not_in_game ? 1 : 0), idiv(G.vid.xres, 40));

  const curland = getLandForList(G.cwt.at);

  G.getcstat = ch('0');

  if (not_in_game) {
    const i0 = 56 + G.vid.fsize + nl * vf;
    displayfrZ(64, i0, 1, vf - 4, '(these lands are not in game)', G.forecolor, 0);
  }

  for (let i = 0; i < nl; i++) {
    const l = displayed_landlist[lstart + i];
    const xr = Math.min(idiv(G.vid.xres, 64), vf);
    const i0 = 56 + G.vid.fsize + i * vf;
    let col: number;
    if (landUnlocked(l)) col = linf[l].color; else col = 0x404040;
    if (l === curland)
      displayfrZ(1, i0, 1, vf - 4, '*', G.forecolor, 0);
    if (displayfrZH(xr * 1, i0, 1, vf - 4, XLAT1(linf[l].name), col, 0))
      G.getcstat = 1000 + l;
    const c8 = idiv(vf + 2, 3);
    const it = treasureType(l);
    const lv = Math.imul(G.items[it], landMultiplier(l));
    if (it) {
      if (lv >= 25) col = 0xFFD500;
      else if (lv && it === itSavedPrincess) col = 0xFFD500;
      else if (lv >= 10) col = 0x00D500;
      else if (G.items[it]) col = 0xC0C0C0;
      else col = BLACKISH;
      if (displayfrZH(xr * 24 - c8 * 6, i0, 1, vf - 4, (required_for_hyperstones(it) ? '' : '*') + its(G.items[it]), col, 16))
        G.getcstat = 2000 + it;
      if (!G.cheater)
        if (displayfrZH(xr * 24, i0, 1, vf - 4, its(hiitems_at(modecode())[it]), col, 16))
          G.getcstat = 2000 + it;
      if (G.items[it]) col = iinf[it].color; else col = BLACKISH;
      if (displayfrZH(xr * 24 + c8 * 4, i0, 1, vf - 4, String.fromCharCode(iinf[it].glyph), col, 16))
        G.getcstat = 2000 + it;
      if (displayfrZH(xr * 24 + c8 * 5, i0, 1, vf - 4, XLAT1(iinf[it].name), col, 0))
        G.getcstat = 2000 + it;
    }
    const io = nativeOrbType(l);
    if (io === itShard) {
      if (G.items[it] >= 10) col = winf[waMirror].color; else col = BLACKISH;
      if (displayfrZH(xr * 46, i0, 1, vf - 4, XLAT1(winf[waMirror].name), col, 0))
        G.getcstat = 3000 + waMirror;
      if (G.getcstat === 3000 + waMirror) {
        const olrdesc = G.olrDescriptions[getOLR(io, G.cwt.at.land)];
        G.mouseovers = XLAT(olrdesc, spL(G.cwt.at.land), spI(it), spI(treasureTypeUnlock(curland, io)));
      }
    }
    else if (io) {
      if (lv >= 25) col = 0xFFD500;
      else if (lv >= 10) col = 0xC0C0C0;
      else col = BLACKISH;
      if (displayfrZH(xr * 46 - c8 * 4, i0, 1, vf - 4, its(G.items[io]), col, 16))
        G.getcstat = 2000 + io;
      if (lv >= 10) col = iinf[io].color; else col = BLACKISH;
      if (displayfrZH(xr * 46 - c8, i0, 1, vf - 4, String.fromCharCode(iinf[io].glyph), col, 16))
        G.getcstat = 2000 + io;
      if (displayfrZH(xr * 46, i0, 1, vf - 4, XLAT1(iinf[io].name), col, 0))
        G.getcstat = 2000 + io;
      if (G.getcstat === 2000 + io) {
        const olrdesc = G.olrDescriptions[getOLR(io, curland)];
        G.mouseovers = XLAT(olrdesc, spL(curland), spI(it), spI(treasureTypeUnlock(curland, io)));
      }
    }
  }

  dialog_display_bottom_buttons(numpages, DB_BACK | DB_HELP);

  G.keyhandler = (sym: number, uni: number) => {
    const umod = uni % 1000;
    const udiv = Math.trunc(uni / 1000);
    if (udiv === 1 && umod < landtypes) {
      const l = umod;
      gotoHelp(''); gotoHelpFor(l);
      if (G.cheater) {
        const hex = new help_extension();
        hex.key = ch('t');
        hex.text = XLAT('teleport');
        hex.action = () => {
          G.cheater++;
          const princ = (l === laPrincessQuest);
          if (princ) {
            if (G.kills[moVizier] === 0) G.kills[moVizier] = 1;
            G.princess_forceMouse = true;
            G.princess_gotoPrincess = true;
            cheatMoveTo(laPalace);
          }
          else cheatMoveTo(l);
          G.canmove = true;
          if (princ) fullcenter();
          popScreen();
          popScreen();
        };
        G.help_extensions.push(hex);
      }
    }
    else if (udiv === 2 && umod < ittypes) {
      gotoHelp(generateHelpForItem(umod));
      G.help_extensions.push(new help_extension(ch('p'), G.glyphpinned[umod] ? XLAT('unpin from HUD') : XLAT('pin to HUD'), () => {
        if (G.glyphpinned[umod]) {
          G.revglyphpinned = G.revglyphpinned.filter((x) => x !== umod);
          G.glyphpinned[umod] = 0;
        }
        else {
          G.revglyphpinned.push(umod);
          G.glyphpinned[umod] = G.revglyphpinned.length;
        }
        updatepinnedglyphs();
        popScreen();
      }));
      if (G.cheater) {
        dialog_helpToEdit({ get v() { return G.items[umod]; }, set v(x: number) { G.items[umod] = x; } }, 0, 200, 10, 10);
        dialog_get_ne().reaction = () => {
          if (G.hardcore) G.canmove = true;
          else checkmove(false);
          G.cheater++;
        };
        dialog_bound_low(0);
      }
    }
    else if (udiv === 3 && umod < walltypes) gotoHelp(generateHelpForWall(umod));
    else if (uni === SDLK_F1) gotoHelp(
      'This displays all lands available in the game. ' +
      'Bonus lands (available only in separate challenges) ' +
      'are not included. Lands written in dark have to be ' +
      'unlocked, and lands in dark red are unavailable ' +
      'because of using special options. Click on any ' +
      'land or item to get information about it. Hover over ' +
      'an Orb to know its relation to the current land. ' +
      'Cheaters can click to move between lands, and use the ' +
      'mousewheel to gain or lose treasures and orbs quickly (Ctrl = precise, Shift = reverse).',
    );
    else if (dialog_handlePageButtons(sym, uni, true, numpages)) { /* */ }
    else if (dialog_editInfix(sym, uni)) G.dialog_list_skip = 0;
    else if (doexiton(sym, uni)) popScreen();
  };
}

// -- display modes --

/** void editScale() */
export function editScale(): void {
  const p = G.vid.projection_config; // vpconf
  dialog_editNumber({ get v() { return p.scale; }, set v(x: number) { p.scale = x; } }, .001, 1000, .1, 1, XLAT('scale factor'),
    XLAT('Scale the displayed model.'));
  dialog_scaleSinh();
}

export const wdmodes = ['ASCII', 'black', 'plain', 'Escher', 'plain/3D', 'Escher/3D', 'ASCII/3D'];
export const mdmodes = ['ASCII', 'items only', 'items and monsters', '3D', '?', '?'];
export const hlmodes = ['press Alt', 'highlight', 'super-highlight'];

/** void showGraphQuickKeys() */
export function showGraphQuickKeys(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();

  dialog_init_t(XLAT('quick options'));

  dialog_addItem('quick projection', ch('1'));

  dialog_addSelItem(XLAT('wall display mode'), XLAT(wdmodes[G.vid.wallmode]), ch('5'));

  dialog_addSelItem(XLAT('monster display mode'), XLAT(mdmodes[G.vid.monmode]), ch('8'));

  dialog_addSelItem(XLAT('highlight stuff'), XLAT(hlmodes[G.vid.highlightmode]), 508);

  dialog_addBoolItem(XLAT('draw the grid'), (G.vid.grid), ch('6'));
  dialog_addBoolItem(XLAT('mark heptagons'), (G.vid.darkhepta), ch('7'));

  dialog_addBreak(50);
  dialog_addInfo(XLAT('Hint: these keys usually work during the game'));
  dialog_addInfo(XLAT('also hold Alt during the game to toggle high contrast'));

  dialog_addBreak(50);
  dialog_addBack();
  dialog_display();

  G.keyhandler = (sym: number, uni: number) => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;

    if (gmodekeys(sym, uni)) { /* */ }
    else if (doexiton(sym, uni)) popScreen();
  };
}

/** void enable_cheat() */
export function enable_cheat(): void {
  if (G.tactic_on && gold()) {
    addMessage(XLAT('Not available in the pure tactics mode!'));
  }
  else if (G.daily_on) {
    addMessage(XLAT('Not available in the daily challenge!'));
  }
  else if (!G.cheater) dialog_cheat_if_confirmed(() => {
    G.cheater++;
    addMessage(XLAT('You activate your demonic powers!'));
    // !ISMOBILE
    addMessage(XLAT('Shift+F, Shift+O, Shift+T, Shift+L, Shift+U, etc.'));
    popScreen();
  });
  else {
    popScreen();
    G.specialland = G.firstland = G.princess_challenge ? laPalace : laIce;
    restart_game();
  }
}

// -- game modes --

/** void switchHardcore_quiet() */
export function switchHardcore_quiet(): void {
  if (G.hardcore && !G.canmove) {
    if (G.delayed_start) stop_game(); else restart_game();
    G.hardcore = false;
  }
  else if (G.hardcore && G.canmove) { G.hardcore = false; }
  else { G.hardcore = true; G.canmove = true; G.hardcoreAt = G.turncount; }
}

/** void switchLOS_quiet() */
export function switchLOS_quiet(): void {
  G.lineofsightAt = G.turncount;
  create_los();
}

/** void switchHardcore() */
export function switchHardcore(): void {
  switchHardcore_quiet();
  if (G.hardcore)
    addMessage(XLAT('One wrong move and it is game over!'));
  else
    addMessage(XLAT('Not so hardcore?'));
  if (pureHardcore()) popScreenAll();
}

/** void switch_casual() */
export function switch_casual(): void {
  if (G.savecount > 0) {
    dialog_push_confirm_dialog(() => {
      restart_game();
      G.casual = !G.casual;
    }, XLAT('Switching casual allowed only before saving the game. Do you want to restart?'));
    return;
  }
  else
    G.casual = !G.casual;
  if (G.casual) {
    addMessage(XLAT('You are in the casual mode! Achievements are disabled.'));
    addMessage(XLAT('Collect an Orb of Safety to save a checkpoint.'));
  }
  popScreenAll();
}

/** void showCreative() */
export function showCreative(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('creative mode'));

  // CAP_EDIT
  dialog_addItem(XLAT('map editor'), ch('m'));
  dialog_add_action(() => {
    dialog_cheat_if_confirmed(() => {
      G.cheater++;
      pushScreen(mapeditor_showMapEditor);
      update_lastexplore();
      addMessage(XLAT('You activate your terraforming powers!'));
    });
  });

  // CAP_EDIT
  dialog_addItem(XLAT('shape editor'), ch('g'));
  dialog_add_action(() => {
    G.mapeditor_drawing_tool = false;
    G.mapeditor_intexture = false;
    pushScreen(mapeditor_showDrawEditor);
    mapeditor_initdraw(G.cwt.at);
  });

  // CAP_EDIT
  dialog_addItem(XLAT('drawing tool'), ch('d'));
  dialog_add_action(() => {
    dialog_cheat_if_confirmed(() => {
      G.cheater++;
      G.mapeditor_drawing_tool = true;
      G.mapeditor_intexture = false;
      pushScreen(mapeditor_showDrawEditor);
      mapeditor_initdraw(G.cwt.at);
      addMessage(XLAT('You activate your imagination powers!'));
    });
  });

  // display modes
  // CAP_MODEL
  if (GDIM() === 2) {
    dialog_addItem(XLAT('paper model creator'), ch('n'));
    dialog_add_action(() => { throw new NotPorted('netgen::run (the paper model creator, stage 3)'); }); // STAGE2-STUB
  }

  // CAP_SHOT
  dialog_addItem(XLAT('screenshots'), ch('s'));
  dialog_add_action_push(shot_menu);

  // CAP_ANIMATIONS
  dialog_addBoolItem(XLAT('animations'), anims_any_on(), ch('a'));
  dialog_add_action_push(anims_show);

  dialog_addBoolItem(XLAT('history mode'), G.history_on || G.history_includeHistory, ch('h'));
  dialog_add_action_push(history_history_menu);

  // CAP_TEXTURE = 0

  dialog_addItem(XLAT('line patterns'), ch('l'));
  dialog_add_action_push(linepatterns_showMenu);

  //  dialog::addBoolItem(XLAT("expansion"), viewdists, 'x');

  dialog_addBreak(50);
  dialog_addBack();
  dialog_display();
}

/** void show_achievement_eligibility() (CAP_ACHIEVE = 0) */
export function show_achievement_eligibility(): void {
  dialog_addInfo(XLAT('no achievements/leaderboards in this version'), 0XFF8000);
}

/** add_edit(horodisk_from), add_edit(randomwalk_size), add_edit(landscape_div), add_edit(curse_percentage),
 *  add_edit(lineofsight): config.cpp's parameters (U4) */
function add_edit_horodisk_from(): void { add_edit(P('horodisk_from')); }
function add_edit_randomwalk_size(): void { add_edit(P('randomwalk_size')); }
function add_edit_landscape_div(): void { add_edit(P('landscape_div')); }
function add_edit_curse_percentage(): void { add_edit(P('curse_percentage')); }
function add_edit_lineofsight(): void { add_edit(P('lineofsight')); }
import { add_edit, P } from './config.ts';

/** void show_chaos() */
export function show_chaos(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('land structure'));
  G.chaosUnlocked = G.chaosUnlocked || G.unlock_all || G.autocheat;

  dialog_addHelp_s(
    XLAT('In the Chaos mode, lands change very often, and ' +
    'there are no walls between them. ' +
    'Some lands are incompatible with this.' +
    '\n\nYou need to reach Crossroads IV to unlock the Chaos mode.'),
  );

  dialog_addBreak(100);

  const key = ch('a');
  for (let i = 0; i < lsGUARD; i++) {
    const backup = G.land_structure; // dynamicval<eLandStructure> dls(land_structure)
    try {
      const li = i;
      G.land_structure = li;
      fix_land_structure_choice();
      if (ls_any_chaos() && !G.chaosUnlocked) continue;
      if (li === lsNoWalls && G.geometry === gNormal && !G.chaosUnlocked) continue;
      if (G.land_structure === i) {
        dialog_addBoolItem(land_structure_name(false), G.land_structure === backup, key + i);
        dialog_add_action(dual_mayboth(() => {
          dialog_do_if_confirmed(() => {
            stop_game();
            G.land_structure = li;
            start_game();
          });
        }));
      }
    }
    finally { G.land_structure = backup; }
  }

  dialog_addBreak(100);
  dialog_addSelItem(XLAT('land'), XLAT1(linf[G.specialland].name), ch('l'));
  dialog_add_action(activate_ge_land_selection);

  show_achievement_eligibility();

  dialog_addBreak(100);
  if (ls_horodisk_structure())
    add_edit_horodisk_from();
  else if (G.land_structure === lsChaosRW)
    add_edit_randomwalk_size();
  else if (G.land_structure === lsLandscape)
    add_edit_landscape_div();
  else if (G.land_structure === lsCursedWalls)
    add_edit_curse_percentage();
  else
    dialog_addBreak(100);
  dialog_addBack();
  dialog_display();
}

const customfile = { v: 'custom.hrm' };

const name_to_edit = { v: '' };

/** void show_custom() */
export function show_custom(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('custom mode'));

  list_saved_custom_modes();
  dialog_addBreak(100);
  if (G.custom_welcome !== '') {
    dialog_addInfo('custom welcome message:');
    dialog_addInfo(G.custom_welcome);
    dialog_addItem('edit', ch('/'));
  }
  else {
    dialog_addItem('custom welcome message', ch('/'));
  }
  dialog_add_action(() => {
    dialog_edit_string({ get v() { return G.custom_welcome; }, set v(x) { G.custom_welcome = x; } }, 'custom welcome message', '');
  });
  dialog_addBreak(100);
  const m = G.modename.get(G.current_modecode); // at_or_null(modename, current_modecode)
  dialog_addSelItem('name custom mode', m !== undefined ? m : '', ch('N'));
  dialog_add_action(() => {
    modecode();
    // modename[current_modecode]: operator[] inserts ""
    if (!G.modename.has(G.current_modecode)) G.modename.set(G.current_modecode, '');
    name_to_edit.v = G.modename.get(G.current_modecode)!;
    dialog_edit_string(name_to_edit, 'name custom mode', '');
    dialog_get_di().reaction_final = () => { update_modename(name_to_edit.v); };
  });

  dialog_addItem('save custom mode', ch('S'));
  dialog_add_action(() => {
    dialog_openFileDialog(customfile, XLAT('file to save:'), '.hrm', () => {
      try {
        save_mode_to_file(customfile.v);
        addMessage(XLAT('Mode saved to %1', customfile.v));
        return true;
      }
      catch (e) {
        if (e instanceof NotPorted) throw e;
        addMessage(XLAT('Failed to save mode to %1', customfile.v));
        return false;
      }
    });
  });
  dialog_addItem('load custom mode', ch('L'));
  dialog_add_action(() => {
    dialog_openFileDialog(customfile, XLAT('file to load:'), '.hrm', () => {
      try {
        load_mode_from_file(customfile.v);
        addMessage(XLAT('Loaded mode from %1', customfile.v));
        return true;
      }
      catch (e) {
        if (e instanceof NotPorted) throw e;
        addMessage(XLAT('Failed to load mode from %1', customfile.v));
        return false;
      }
    });
  });
  dialog_addBack();
  dialog_display();
}

/** void mode_higlights() (the actions that leave the standard geometry reach the stubs of stage 3) */
export function mode_higlights(): void {
  G.cmode = sm.NOSCR;
  gamescreen();
  dialog_init_t(XLAT('highlights & achievements'));

  dialog_addBigItem(XLATN('Space Rocks'), ch('r'));
  dialog_add_action(dialog_add_confirmation(() => {
    popScreenAll();
    stop_game();
    resetModes();
    G.specialland = laAsteroids;
    set_geometry(gKleinQuartic);
    set_variation(eVariation.bitruncated);
    G.land_structure = lsSingle;
    G.shmup_on = true;
    start_game();
  }));
  dialog_addInfo(XLAT('classic game except hyperbolic'));
  dialog_extend();

  dialog_addBigItem(XLATN('hyperbolic Minesweeper'), ch('e'));
  dialog_add_action(() => {
    dialog_do_if_confirmed(() => {
      resetModes();
      G.specialland = G.firstland = laMinefield;
      if (!closed_or_bounded()) {
        set_geometry(gBring);
        G.gp_param = [2, 1];
        set_variation(eVariation.goldberg);
        G.mine_adjacency_rule = 1;
        G.bounded_mine_percentage = .2;
      }
      start_game();
      popScreenAll();
    });
  });
  dialog_addInfo(XLAT('yet another classic game'));
  dialog_extend();

  // CAP_RACING && MAXMDIM >= 4
  dialog_addBigItem(XLAT('Racing in Thurston geometries'), ch('t') - 96);
  dialog_add_action(dialog_add_confirmation(racing_start_thurston));
  dialog_addInfo(XLAT('race through a maze in exotic 3D geometry!'));
  dialog_extend();

  dialog_addBigItem(XLAT1('Halloween'), ch('Z'));
  dialog_add_action(dialog_add_confirmation(halloween_start_all));
  dialog_addInfo(XLAT('Halloween mini-game'));
  dialog_extend();

  dialog_addBigItem(XLAT1('heptagonal mode'), ch('H'));
  dialog_add_action(dialog_add_confirmation(() => {
    popScreenAll();
    resetModes(ch('7'));
    G.land_structure = lsNiceWalls;
    start_game();
    clearMessages();
    welcomeMessage();
  }));
  dialog_addInfo(XLAT('can you find the Heptagonal Grail?'));
  dialog_extend();

  dialog_addBreak(100);
  dialog_addBigItem(XLAT1('other achievements:'), 0);
  dialog_addItem(XLAT('General Euclid'), ch('e'));
  dialog_add_action(dialog_add_confirmation(() => {
    popScreenAll();
    resetModes();
    set_geometry(gEuclid);
    G.firstland = G.specialland = laMirrorOld;
    G.land_structure = lsSingle;
    start_game();
    clearMessages();
    welcomeMessage();
  }));

  dialog_addItem(XLAT('Worm of the World'), ch('w'));
  dialog_add_action(dialog_add_confirmation(() => {
    popScreenAll();
    resetModes();
    set_geometry(gZebraQuotient);
    G.firstland = G.specialland = laDesert;
    G.land_structure = lsSingle;
    start_game();
    clearMessages();
    welcomeMessage();
  }));

  dialog_addItem(XLAT('Lovász Conjecture'), ch('L'));
  dialog_add_action(dialog_add_confirmation(() => {
    popScreenAll();
    resetModes();
    set_geometry(gKleinQuartic);
    G.gp_param = [1, 1];
    set_variation(eVariation.untruncated);

    G.firstland = G.specialland = laMotion;
    G.land_structure = lsSingle;
    start_game();
    clearMessages();
    welcomeMessage();
  }));

  // CAP_CRYSTAL
  if (hiitemsMax(itHolyGrail) || G.cheater || G.autocheat) {
    dialog_addItem(XLAT('Knight of the 16-Cell Table'), ch('1'));
    dialog_add_action(dialog_add_confirmation(() => {
      popScreenAll();
      resetModes();
      crystal_set_crystal(8);
      G.firstland = G.specialland = laCamelot;
      G.land_structure = lsSingle;
      start_game();
      clearMessages();
      welcomeMessage();
      pushScreen(crystal_crystal_knight_help);
    }));

    dialog_addItem(XLAT('Knight of the 3-Spherical Table'), ch('3'));
    dialog_add_action(dialog_add_confirmation(() => {
      popScreenAll();
      resetModes();
      crystal_set_crystal(8);
      set_variation(eVariation.bitruncated);
      set_variation(eVariation.bitruncated);
      G.land_structure = lsSingle;
      G.firstland = G.specialland = laCamelot;
      start_game();
      clearMessages();
      welcomeMessage();
      pushScreen(crystal_crystal_knight_help);
    }));
  }
  else {
    dialog_addItem('(locked until you find a Holy Grail)', 0);
  }

  // MAXMDIM >= 4
  dialog_addBreak(100);
  dialog_addBigItem(XLAT1('some cool visualizations'), 0);
  dialog_addItem(XLAT('Emerald Mine in {5,3,4}'), ch('5'));
  dialog_add_action(dialog_add_confirmation(() => {
    popScreenAll();
    resetModes();
    G.specialland = laEmerald;
    G.land_structure = lsSingle;
    throw new NotPorted('the Emerald Mine in {5,3,4} (set_geometry(gSpace534), field quotients: stage 3)'); // STAGE2-STUB
  }));

  dialog_addBreak(100);
  dialog_addBack();
  dialog_display();
}

/** eLandStructure default_land_structure() */
export function default_land_structure(): number {
  if (closed_or_bounded()) return lsSingle;
  if (G.tactic_on || G.princess_challenge) return lsSingle;
  if (G.yendor_on) return yendor_get_land_structure();
  if (G.specialland === laCanvas) return lsSingle;
  if (nice_walls_available()) return lsNiceWalls;
  return lsNoWalls;
}

/** void menuitem_land_structure(key_type key) */
export function menuitem_land_structure(key: number): void {

  if (default_land_structure() === G.land_structure && !G.ineligible_starting_land)
    dialog_addBoolItem(XLAT('land structure'), false, key);
  else
    dialog_addSelItem(XLAT('land structure'), land_structure_name(true), key);
  dialog_add_action_push(show_chaos);
}

/** #define SHMUPTITLE "shoot'em up mode" */
const SHMUPTITLE = "shoot'em up mode";

/** void showChangeMode() */
export function showChangeMode(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('special modes'));

  dialog_addBoolItem(XLAT('experiment with geometry'), !!(G.geometry || CHANGED_VARIATION() || G.viewdists), ch('e'));
  dialog_add_action(runGeometryExperiments);

  dialog_addBoolItem(XLAT(SHMUPTITLE), G.shmup_on, ch('s'));
  dialog_add_action_confirmed(shmup_switch_shmup);

  dialog_addBoolItem(XLAT('multiplayer'), G.multi_players > 1, ch('m'));
  dialog_add_action_push(multi_showConfigureMultiplayer);

  // CAP_SAVE
  dialog_addSelItem(XLAT('casual mode'), ONOFF(G.casual), ch('C'));
  dialog_add_action(switch_casual);

  if (!G.shmup_on) {
    dialog_addSelItem(XLAT('hardcore mode'),
      G.hardcore && !pureHardcore() ? XLAT('PARTIAL') : ONOFF(G.hardcore), ch('h'));
    dialog_add_action(switchHardcore);
  }
  if (G.getcstat === ch('h'))
    G.mouseovers = XLAT('One wrong move and it is game over!');

  G.multi_cpid = 0;
  menuitem_land_structure(ch('l'));

  dialog_addBoolItem(XLAT('custom land list'), G.use_custom_land_list, ch('L'));
  dialog_add_action_push(customize_land_list);

  dialog_addBoolItem(XLAT('weapon selection'), !!G.bow_weapon, ch('b'));
  dialog_add_action_push(bow_showMenu);

  dialog_addBoolItem(XLAT('puzzle/exploration mode'), G.peace_on, ch('p'));
  dialog_add_action_push(peace_showMenu);

  dialog_addBoolItem(XLAT('Orb Strategy mode'), (G.inv_on), ch('i'));
  dialog_add_action_confirmed(() => { restart_game(rg_inv); });

  dialog_addBoolItem(XLAT('random pattern mode'), (G.randomPatternsMode), ch('r'));
  dialog_add_action_confirmed(() => {
    stop_game();
    G.firstland = laIce;
    restart_game(rg_randpattern);
  });

  // CAP_ARCM && !ISWEB
  if (G.multi_players === 1) {
    dialog_addBoolItem(XLAT('dual geometry mode'), !!G.dual_state, ch('D'));
    dialog_add_action_confirmed(() => { restart_game(rg_dualmode); });
  }

  dialog_addBoolItem(XLAT('cheat mode'), !!(G.cheater), ch('c'));
  dialog_add_action(enable_cheat);

  dialog_addBreak(50);
  // CAP_TOUR
  dialog_addBoolItem(XLAT('guided tour'), G.tour_on, ch('T'));
  dialog_add_action_confirmed(tour_start);
  // CAP_DAILY = 0
  dialog_addBoolItem(XLAT('%1 Challenge', spM(moPrincess)), (G.princess_challenge), ch('P'));
  dialog_add_action_confirmed(() => {
    if (!G.princess_everSaved && !G.autocheat && !G.unlock_all)
      addMessage(XLAT('Save %the1 first to unlock this challenge!', spM(moPrincess)));
    else restart_game(rg_princess);
  });
  dialog_addBoolItem(XLAT('pure tactics mode'), (G.tactic_on), ch('t'));
  dialog_add_action(tactic_start);

  dialog_addBoolItem(XLAT('Yendor Challenge'), (G.yendor_on), ch('y'));
  dialog_add_action(() => {
    clearMessages();
    if (G.yendor_everwon || G.autocheat || G.unlock_all)
      pushScreen(yendor_showMenu);
    else if (G.yendor_on) restart_game(rg_yendor);
    else gotoHelp(yendor_chelp);
  });
  // CAP_RACING
  dialog_addBoolItem(XLAT('racing mode'), G.racing_on, ch('R'));
  dialog_add_action(racing_configure_race);

  add_edit_lineofsight();

  show_achievement_eligibility();

  dialog_addBreak(50);
  // !RVCOL
  dialog_addItem(XLAT('highlights & achievements'), ch('h'));
  dialog_add_action_push(mode_higlights);
  dialog_addItem(XLAT('custom mode manager'), ch('m'));
  dialog_add_action(prepare_custom);
  dialog_addBack();
  dialog_display();
}

/** bool showHalloween() */
export function showHalloween(): boolean {
  const tm = localtime(time());
  const month = tm.tm_mon + 1;
  const day = tm.tm_mday;
  if (month === 10 && day >= 24) return true;
  if (month === 11 && day <= 7) return true;
  return false;
}

/** bool showFestive() */
export function showFestive(): boolean {
  const tm = localtime(time());
  const month = tm.tm_mon + 1;
  const day = tm.tm_mday;
  if (month === 12 && day >= 24 && day <= 26) return true;
  return false;
}

let daily_mode = 0;

function announce_random(): void {
  dialog_addBreak(100);
  dialog_addTitle('(random option)', 0x808080, 100);
}

function announce_nothing(): void {
  dialog_addBreak(100);
  dialog_addTitle('', 0x808080, 100);
}

function announce_seasonal(): void {
  dialog_addBreak(100);
  dialog_addTitle('(seasonal option)', 0x808080, 100);
}

/** void showStartMenu() */
export function showStartMenu(): void {
  if (!daily_mode) {
    daily_mode = hrand(10) + 1;
    if (showHalloween())
      daily_mode = 20;
  }

  G.getcstat = ch(' ');

  // CAP_STARTANIM
  G.cmode = sm.DARKEN;
  startanims_display();

  dialog_init();

  dialog_addInfo(XLAT('Welcome to HyperRogue!'));
  dialog_addBreak(100);

  dialog_addBigItem(XLAT('HyperRogue classic'), ch('c'));
  dialog_addInfo(XLAT('explore the world, collect treasures'));
  dialog_addInfo(XLAT('do not get checkmated'));

  // CAP_INV
  dialog_addBreak(100);
  dialog_addBigItem(XLAT('Orb Strategy mode'), ch('i'));
  dialog_addInfo(XLAT('use your Orbs in tough situations'));

  // CAP_TOUR
  dialog_addBreak(100);
  dialog_addBigItem(XLAT('guided tour'), ch('t'));
  dialog_addInfo(XLAT('learn about hyperbolic geometry!'));

  // the online game (port only, ONLINE.md; the browser shows it, the oracle's scenarios do not)
  if (G.online_menu) {
    dialog_addBreak(100);
    dialog_addBigItem(XLAT('online multiplayer'), ch('n'));
    dialog_addInfo(XLAT('2 to 7 players, each at their own computer'));
  }

  if (have_current_settings()) {
    dialog_addBreak(100);
    dialog_addBigItem(XLAT1('use current/saved settings'), SDLK_ESCAPE);
  }

  if (have_current_graph_settings()) {
    dialog_addBreak(100);
    dialog_addBigItem(XLAT1('reset the graphics settings'), ch('r'));
    dialog_add_action(() => { reset_graph_settings(); });
  }

  dialog_addBreak(100);
  dialog_addBigItem(XLAT('main menu'), ch('m'));
  dialog_addInfo(XLAT('more options'));

  switch (daily_mode) {
    case 1:
      // CAP_SHMUP_GOOD
      announce_random();
      dialog_addBigItem(XLAT("shoot'em up mode"), ch('s'));
      dialog_addInfo(XLAT('continuous spacetime'));
      // CAP_ACHIEVE = 0
      break;

    case 2:
      announce_random();
      dialog_addBigItem(XLAT('heptagonal mode'), ch('7'));
      dialog_addInfo(XLAT('more curvature'));
      dialog_addInfo(XLAT('(most achievements are not available)'));
      break;

    case 3:
      announce_random();
      dialog_addBigItem(XLAT('experiment with geometry'), ch('g'));
      dialog_addInfo(XLAT('(most achievements are not available)'));
      break;

    case 4:
      if (G.chaosUnlocked) {
        announce_random();
        dialog_addBigItem(XLAT('Chaos mode'), ch('C'));
        dialog_addInfo(XLAT('(most achievements are not available)'));
      }
      break;

    // CAP_RUG
    case 5:
      announce_random();
      dialog_addBigItem(XLAT('hypersian rug mode'), ch('M'));
      dialog_addInfo(XLAT('see the true form'));
      break;

    // CAP_TEXTURE && CAP_EDIT: 0 (case 6 is the default); CAP_DAILY: 0 (case 7 is the default)

    // CAP_RACING
    case 8:
      announce_random();
      dialog_addBigItem(XLAT('Racing'), ch('r') - 96);
      dialog_addInfo(XLAT('how fast can you reach the end?'));
      break;

    case 9:
      announce_random();
      dialog_addBigItem(XLAT('Racing in Thurston geometries'), ch('t') - 96);
      dialog_addInfo(XLAT('race through a maze in exotic 3D geometry!'));
      break;

    case 20:
      announce_seasonal();
      dialog_addBigItem(XLAT1('Halloween'), ch('Z'));
      dialog_addInfo(XLAT('Halloween mini-game'));
      break;

    default:
      announce_nothing();
      dialog_addBigItem('', 0);
      dialog_addInfo('');
      break;
  }

  dialog_display();
  clearMessages();

  G.timerstart = time();

  G.keyhandler = (sym: number, uni: number) => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;
    if (uni === ch('o')) uni = ch('i');
    // CAP_STARTANIM
    else if (uni === startanims_EXPLORE_START_ANIMATION)
      startanims_explore();
    // CAP_RUG
    else if (uni === ch('M')) {
      throw new NotPorted('the hypersian rug (rug::init: stage 3)'); // STAGE2-STUB
    }
    // CAP_TEXTURE && CAP_EDIT: 0
    else if (uni === ch('g')) {
      popScreenAll();
      resetModes(ch('c'));
      clearMessages();
      welcomeMessage();
      pushScreen(showEuclideanMenu);
    }
    else if (uni === ch('c') || uni === ch('i') || uni === ch('s') || uni === ch('C') || uni === ch('7')) {
      if (uni === ch('C') && !G.chaosUnlocked) {
        return;
      }
      popScreenAll();
      resetModes(uni);
      clearMessages();
      welcomeMessage();
      progress_warning();
      G.stampbase = G.ticks;
      if (uni === ch('s'))
        multi_configure();
    }
    else if (uni === ch('n') && G.online_menu) {
      popScreenAll();
      pushScreen(online_showMenu);
    }
    else if (uni === ch('Z'))
      halloween_start_all();
    // CAP_RACING && MAXMDIM >= 4
    else if (uni === ch('r') - 96) {
      throw new NotPorted('racing from the start menu (racing: stage 3)'); // STAGE2-STUB
    }
    else if (uni === ch('t') - 96)
      racing_start_thurston();
    // CAP_TOUR
    else if (uni === ch('t')) {
      popScreenAll();
      resetModes(ch('c'));
      tour_start();
    }
    // CAP_DAILY = 0
    else if (uni === ch('m')) {
      popScreen();
      pushScreen(showGameMenu);
    }
    else if (sym === SDLK_F10)
      G.quitmainloop = true;
    else if (sym === SDLK_F1)
      gotoHelp('@');
    else if (sym === SDLK_ESCAPE || uni === ch(' ')) {
      popScreen();
      G.timerstart = time();
      G.stampbase = G.ticks;
      clearMessages();
      welcomeMessage();
      progress_warning();
    }
    else if (sym === SDLK_F5) {
      // CAP_STARTANIM
      startanims_pick();
      daily_mode = 0;
    }
  };
}

// -- overview --

/** struct named_functionality: [first, second] (U3's API of get_o_key) */
export type named_functionality = [string, () => void];
/** inline named_functionality named_dialog(string x, reaction_t dialog) */
export function named_dialog(x: string, dialog: () => void): named_functionality { return [x, () => { pushScreen(dialog); }]; }

/** named_functionality get_o_key() */
export function get_o_key(): named_functionality {
  const res: named_functionality[] = [];
  callhooks(G.hooks_o_key, res);

  if (in_full_game() && !G.yendor_on)
    res.push(named_dialog(XLAT('world overview'), showOverview));

  // CAP_DAILY = 0

  if (G.viewdists)
    res.push([XLAT('experiment with geometry'), runGeometryExperiments]);

  if (G.tactic_on)
    res.push(named_dialog(XLAT('pure tactics mode'), tactic_showMenu));

  if (G.yendor_on)
    res.push(named_dialog(XLAT('Yendor Challenge'), yendor_showMenu));

  if (G.peace_on)
    res.push(named_dialog(XLAT('puzzles and exploration'), peace_showMenu));

  // CAP_TEXTURE = 0

  G.dialog_infix = '';

  if ((G.geometry !== gNormal || NONSTDVAR() || G.disksize) && !G.daily_on)
    res.push([XLAT('experiment with geometry'), runGeometryExperiments]);

  if (res.length === 0) return named_dialog(XLAT('world overview'), showOverview);

  if (isize(res) === 1) return res[0];

  return named_dialog(res[0][0] + '/...', () => {
    G.cmode = sm.VR_MENU | sm.NOSCR;
    gamescreen();
    dialog_init();
    let id = ch('o');
    for (const r of res) {
      dialog_addItem(r[0], id++);
      dialog_add_action(() => { popScreen(); r[1](); });
    }
    dialog_display();
  });
}

const pad2 = (n: number, w: number, c = ' '): string => String(n).padStart(w, c);

/** string gettimestamp(msginfo& m) */
export function gettimestamp(m: msginfo): string {
  switch (G.timeformat) {
    case 0:
      return its(m.turnstamp);
    case 1: {
      // strftime(buf, 128, "%H:%M:%S", localtime(&m.rtstamp))
      const d = new Date(m.rtstamp * 1000);
      return pad2(d.getHours(), 2, '0') + ':' + pad2(d.getMinutes(), 2, '0') + ':' + pad2(d.getSeconds(), 2, '0');
    }
    case 2:
      // snprintf(buf, 128, "%2d:%02d", m.gtstamp/60, m.gtstamp % 60)
      return pad2(Math.trunc(m.gtstamp / 60), 2) + ':' + pad2(m.gtstamp % 60, 2, '0');
    case 3:
      { let t = (m.stamp - G.stampbase) | 0;
        const sign = t < 0;
        if (sign) t = -t;
        // snprintf(buf, 128, "%2d:%02d.%03d", t/60000, (t/1000) % 60, t % 1000)
        let s = pad2(Math.trunc(t / 60000), 2) + ':' + pad2(Math.trunc(t / 1000) % 60, 2, '0') + '.' + pad2(t % 1000, 3, '0');
        if (sign) s = '-' + s;
        return s;
      }
  }
  return '';
}

/** void showMessageLog() */
export function showMessageLog(): void {
  // indenter_finish dif(debug_graph, "showMessageLog");

  const lines = idiv(G.vid.yres, G.vid.fsize) - 2;
  const maxpos = isize(G.gamelog) - lines;
  G.messagelogpos = Math.min(G.messagelogpos, maxpos);
  G.messagelogpos = Math.max(G.messagelogpos, 0);

  for (let y = 0; y < lines && G.messagelogpos + y < isize(G.gamelog); y++) {
    const m = G.gamelog[G.messagelogpos + y];
    displaystr(G.vid.fsize * 8, G.vid.fsize * (y + 1), 0, G.vid.fsize, fullmsg(m), 0xC0C0C0, 0);
    displaystr(G.vid.fsize * 7, G.vid.fsize * (y + 1), 0, G.vid.fsize, gettimestamp(m), 0xC0C0C0, 16);
  }

  const i0 = G.vid.yres - G.vid.fsize;
  const xr = idiv(G.vid.xres, 80);

  const timeformats = ['turns', 'real time', 'game time', 'precise', 'no time'];

  displayButton(xr * 70, i0, IFM(dialog_keyname(SDLK_ESCAPE) + ' - ') + XLAT('go back'), SDLK_ESCAPE, 8);
  displayButton(xr * 10, i0, IFM('c - ') + XLAT('clear'), ch('c'), 8);
  displayButton(xr * 40, i0, IFM('t - ') + XLAT(timeformats[G.timeformat]), ch('t'), 8);

  G.keyhandler = (sym: number, uni: number) => {
    if (uni === PSEUDOKEY_WHEELDOWN) G.messagelogpos++;
    else if (uni === PSEUDOKEY_WHEELUP) G.messagelogpos--;
    else if (DKEY(sym, uni) === SDLK_DOWN) G.messagelogpos++;
    else if (DKEY(sym, uni) === SDLK_UP) G.messagelogpos--;
    else if (DKEY(sym, uni) === SDLK_PAGEUP) G.messagelogpos -= lines;
    else if (DKEY(sym, uni) === SDLK_PAGEDOWN) G.messagelogpos -= lines;
    else if (uni === ch('c')) G.gamelog.length = 0;
    else if (uni === ch('t')) { G.timeformat++; G.timeformat %= 5; }
    else if (doexiton(sym, uni)) popScreen();
  };
}

/** int read_menu_args() (CAP_COMMANDLINE): registered by register_menus on hooks_args */
import { arg_argis, arg_launch_dialog, PHASEFROM } from './commandline.ts';
import { addHook } from './hyper.ts';
function read_menu_args(): number {
  // using namespace arg;

  if (arg_argis('-d:over')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(showOverview);
  }
  else if (arg_argis('-d:main')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(showGameMenu);
  }
  else if (arg_argis('-d:mode')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(showChangeMode);
  }
  else if (arg_argis('-d:custom')) {
    if (PHASEFROM(3)) return 2;
    prepare_custom();
  }
  else if (arg_argis('-d:history')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(history_history_menu);
  }
  else if (arg_argis('-d:shmup')) {
    if (PHASEFROM(2)) return 2; arg_launch_dialog(); multi_configure();
  }
  else return 1;
  return 0;
}

/** the static initializers of menus.cpp: auto ah_menu = addHook(hooks_args, 0, read_menu_args) */
export function register_menus(): void {
  addHook(G.hooks_args, 0, read_menu_args);
}

export { land_structure_name };
