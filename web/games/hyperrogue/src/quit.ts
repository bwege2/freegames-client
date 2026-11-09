// quit.cpp of HyperRogue 13.1o (stage 2, package U3): the mission screen (showGameMenu, showMissionScreen), the
// hints, the quit/restart keys (handleKeyQuit) and the confirmations. The actions that open other packages'
// screens (help, menus, settings, scores) call their stubs until those are ported.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import { G, pconf } from './globals.ts';
import { time, idiv, fmtF, fmtG } from './cpp.ts';
import { its } from './hprint.ts';
import { gold, in_lovasz, localTreasureType } from './items.ts';
import { tkills } from './attack.ts';
import { XLAT, spM, spI, spL } from './language.ts';
import { iinf, itOrbSafety, itOrbYendor, itHell, itHyperstone, itFernFlower, itGold, itEmerald, moPrincess,
  moBomberbird, moVizier, laHell, laGraveyard, laEmerald, laCamelot, laPrincessQuest, laCrossroads, laNone,
  waChasm, itOrbInvis, itOrbTeleport, itOrbAether, itInventory, type eLand } from './content.ts';
import { R10, R30, R60, R90, R100, U5 } from './content-req.ts';
import {
  dialog_init_t, dialog_addInfo, dialog_addHelp_s, dialog_addBreak, dialog_addItem, dialog_add_action,
  dialog_add_action_push, dialog_addBack, dialog_display, dialog_addHelp, dialog_handleNavigation,
  dialog_confirm_dialog, dialog_do_if_confirmed, dialog_never_keys,
} from './dialogs.ts';
import { gamescreen, sm, popScreen } from './graph.ts';
import { drawStats } from './hud.ts';
import { pushScreen, popScreenAll, doexiton } from './control.ts';
import { SDLK_ESCAPE, SDLK_F3, SDLK_F5, SDLK_F9, SDLK_F10, SDLK_HOME, SDLK_RETURN, SDLK_BACKSPACE } from './sdl.ts';
import { achievement_final, achievement_gain_once, specgeom_lovasz } from './achievement.ts';
import { mine_in_minesweeper } from './complex2.ts';
import { landUnlocked, lands_for_hell, generateLandList, isLandIngame, treasureType, isCrossroads, in_full_game,
  ls_any_order } from './landlock.ts';
import { restart_game, rg_inv, rg_nothing, stop_game, load_last_save, start_game, restore_all_golems,
  BRANCH_SCALE } from './system.ts';
import { addMessage, clearMessages } from './basegraph.ts';
import { gotoHelp } from './help.ts';
import { get_o_key, showOverview, showChangeMode, showCreative, showMessageLog, showStartMenu,
  showHalloween } from './menus.ts';
import { showSettings, inSpecialMode } from './config.ts';
import { models_model_menu } from './models.ts';
import { showCheatMenu } from './debug.ts';
import { inv_show } from './inventory.ts';
import { scores_load } from './scores.ts';
import { tour_start } from './tour.ts';
import { startanims_pick } from './screenshot.ts';
import { fullcenter } from './hypgraph.ts';
import { celldist } from './cell.ts';
import { sizes_known, get_expansion } from './expansion.ts';
import { sphere, euclid, gNormal } from './classes.ts';

/** bool quitsaves() */
export function quitsaves(): boolean {
  if (G.casual) return false;
  return !!(G.items[itOrbSafety] && true /* CAP_SAVE */);
}

/** bool needConfirmationEvenIfSaved() */
export function needConfirmationEvenIfSaved(): boolean {
  return G.canmove && (gold() >= 30 || tkills() >= 50) && !G.cheater;
}

/** bool needConfirmation() */
export function needConfirmation(): boolean {
  if (G.casual) return needConfirmationEvenIfSaved() && G.turncount > G.save_turns + 10;
  else return needConfirmationEvenIfSaved() && !quitsaves();
}

/** int getgametime() */
export function getgametime(): number {
  return (G.savetime + (G.timerstopped ? 0 : (time() - G.timerstart))) | 0;
}

/** ld getgametime_precise() */
export function getgametime_precise(): number {
  return G.savetime + (G.timerstopped ? 0 : (G.ticks - G.tickstart) / 1000.);
}

/** string getgametime_s(int timespent IS(getgametime())): "%d:%02d" */
export function getgametime_s(timespent = getgametime()): string {
  return `${idiv(timespent, 60)}:${String(timespent % 60).padStart(2, '0')}`;
}

/** EX bool display_yasc_codes, display_semicasual */
export const quit_options = { display_yasc_codes: false, display_semicasual: false };

/** string formatted_yasc_code() */
export function formatted_yasc_code(): string {
  if (G.yasc_code < 100000) return its(G.yasc_code);
  let y = G.yasc_code;
  let out = '';
  while (y >= 100) {
    out = '-' + its(y % 100) + out;
    y = (y / 100) | 0;
  }
  return its(y) + out;
}

/** string timeline() */
function timeline(): string {
  let s: string;
  if (G.shmup_on)
    s = XLAT('%1 knives (%2)', its(G.turncount), getgametime_s());
  else {
    s = XLAT('%1 turns (%2)', its(G.turncount), getgametime_s());
    if (quit_options.display_yasc_codes)
      s += XLAT(' YASC code: ') + formatted_yasc_code();
  }
  if (G.casual && G.loadcount >= 0 && quit_options.display_semicasual) {
    const val = Math.exp(G.load_branching / BRANCH_SCALE);
    s += XLAT(' saves: %1 loads: %2 branching: %3', its(G.savecount), its(G.loadcount), val < 1e6 ? fmtF(val, 0) : fmtG(val, 4));
  }
  return s;
}

export function noaction(): void { }

/** EX function<void()> cancel = noaction */
let cancel: () => void = noaction;

/** struct hint { time_t last; function<bool()> usable; function<void()> display; } */
export interface hint { last: number; usable: () => boolean; display: () => void }

const ch = (s: string): number => s.charCodeAt(0);

/** EX hint hints[] */
export const hints: hint[] = [

  {
    last: 0,
    usable: () => !G.inv_on && G.items[localTreasureType()] >= 18 && in_full_game(),
    display: () => {
      dialog_addHelp_s(XLAT(
        'If you collect too many treasures in a given land, it will become ' +
        'extremely dangerous. Try other lands once you have enough!'));
    },
  },

  {
    last: 0,
    usable: () => !dialog_never_keys(),
    display: () => {
      dialog_addHelp_s(XLAT(
        'Remember that you can right click almost anything for more information.'));
      // ISMAC: no
    },
  },

  {
    last: 0,
    usable: () => !G.canmove,
    display: () => {
      dialog_addHelp_s(XLAT(
        'Want to understand the geometry in HyperRogue? Try the Guided Tour!',
      ));
      dialog_addBreak(50);
      dialog_addItem(XLAT('guided tour'), ch('z'));
      dialog_add_action(() => {
        // CAP_TOUR
        tour_start();
      });
    },
  },

  {
    last: 0,
    usable: () => !G.inv_on && in_full_game(),
    display: () => {
      dialog_addHelp_s(XLAT(
        'Collecting 25 treasures in a given land may be dangerous, ' +
        'but allows magical Orbs of this land to appear in other places!',
      ));
    },
  },

  {
    last: 0,
    usable: () => !G.canmove && G.dialog_display_keys !== 3,
    display: () => {
      dialog_addInfo(XLAT(
        'Press ESC to view this screen during the game.',
      ));
    },
  },
  {
    last: 0,
    usable: () => in_full_game(),
    display: () => {
      dialog_addInfo(dialog_never_keys() ?
        XLAT("The 'world overview' shows all the lands in HyperRogue.")
        :
        XLAT("Press 'o' to see all the lands in HyperRogue."),
      );
      dialog_addBreak(50);
      dialog_addItem(XLAT('world overview') + ' ', ch('z'));
      dialog_add_action_push(showOverview);
    },
  },
  {
    last: 0,
    usable: () => !G.canmove,
    display: () => {
      dialog_addHelp_s(XLAT(
        'Want another type of game? Want more challenge?\n' +
        'HyperRogue has many special modes and challenges that ' +
        'significantly change the gameplay. Try them!',
      ));
      dialog_addBreak(50);
      dialog_addItem(XLAT('special game modes'), ch('z'));
      dialog_add_action_push(showChangeMode);
    },
  },
  {
    last: 0,
    usable: () => true,
    display: () => {
      dialog_addInfo(XLAT(
        'Hyperbolic geometry can be shown in many ways.',
      ));
      dialog_addBreak(50);
      dialog_addItem(XLAT('special display modes'), ch('z'));
      dialog_add_action_push(models_model_menu);
    },
  },

  {
    last: 0,
    usable: () => !G.canmove && !G.inv_on,
    display: () => {
      dialog_addHelp_s(XLAT(
        'You do not want to lose the game from a single mistake?\n' +
        'Do you want to use the Orbs strategically?\n' +
        'Try the Orb Strategy mode!'),
      );
      dialog_addBreak(50);
      dialog_addItem(XLAT('Orb Strategy mode'), ch('z'));
      dialog_add_action(() => {
        // CAP_INV
        restart_game(rg_inv);
      });
    },
  },
  {
    last: 0,
    usable: () => true /* CAP_RUG */ && G.geometry === gNormal,
    display: () => {
      dialog_addHelp_s(XLAT(
        'Do you think you are playing on a ball? ' +
        'This is far from the truth!\n',
      ));
      dialog_addBreak(50);
      dialog_addItem(XLAT('hypersian rug mode'), ch('z'));
      dialog_add_action(() => {
        // CAP_RUG: popScreen(); rug::init(); wallmode 3, monmode 2, cancel = rug::close... (the hypersian rug is
        // stage 3: the item is shown, the action does nothing yet)
        // STAGE2-STUB
      });
    },
  },

  {
    last: 0,
    usable: () => !G.canmove && G.geometry === gNormal && celldist(G.cwt.at) >= 50,
    display: () => {
      dialog_addHelp_s(XLAT(
        'Did you know that the path you take during the game ' +
        'is usually very close to a straight line?\n',
      ));
      dialog_addBreak(50);
      dialog_addItem(XLAT('Show me!'), ch('z'));
      dialog_add_action(() => {
        // popScreen(); pmodel = mdBand; models::rotation = Id; history::includeHistory = true;
        // history::create_playerpath(); cancel = [...] { history::clear(); ... fullcenter(); }
        // (the band model and the player's path are stage 3: the action does nothing yet) STAGE2-STUB
      });
    },
  },

  {
    last: 0,
    usable: () => !G.canmove && sizes_known() && celldist(G.cwt.at) >= 50,
    display: () => {
      const d = celldist(G.cwt.at);
      const s = get_expansion().approximate_descendants(d, 10000);
      dialog_addHelp_s(XLAT(
        'You are %1 cells away from the starting point, or ' +
        'the place where you used an Orb of Safety last time. ' +
        'There are %2 such cells.\n',
        its(d), s,
      ));
      dialog_addBreak(50);
      dialog_addItem(XLAT('expansion'), ch('z'));
      dialog_add_action(() => {
        G.viewdists = !G.viewdists;
        popScreen();
        cancel = () => { G.viewdists = false; };
      });
    },
  },

  {
    last: 0,
    usable: () => !G.canmove && showHalloween(),
    display: () => {
      dialog_addItem(XLAT('Halloween mini-game'), ch('z'));
      dialog_add_action(() => {
        // if(!sphere) { resetModes(); stop_game(); specialland = laHalloween; set_geometry(gSphere); start_game();
        // pconf.alpha = 999; pconf.scale = 998; } else { resetModes(); pconf.alpha = 1; pconf.scale = 1; }
        // (the spherical geometry is stage 3: the action does nothing yet) STAGE2-STUB
      });
    },
  },

  { last: -1, usable: () => false, display: noaction },
];

// EX int hinttoshow: G.hinttoshow

function contstr(): string {
  return G.canmove ? XLAT('continue') : XLAT('see how it ended');
}

function nextHyperstone(): eLand {
  generateLandList(isLandIngame);
  for (const l of G.landlist)
    if (G.items[treasureType(l)] < R10() && !isCrossroads(l) && l !== laPrincessQuest && l !== laCamelot)
      return l;
  if (G.items[itHyperstone] >= 10) return laNone;
  return laCrossroads;
}

// EX bool separate_status = false: G.separate_status
/** EX bool showing_status = true */
let showing_status = true;

/** void showGameMenu() */
export function showGameMenu(): void {

  G.cmode = sm.DOTOUR | sm.MISSION | sm.CENTER | sm.MAYDARK | sm.SIDE;
  gamescreen(); drawStats();
  G.getcstat = SDLK_ESCAPE;

  const skip_status = G.separate_status && !showing_status;

  if (skip_status) dialog_init_t(XLAT('main menu'));

  else dialog_init_t(
    // CAP_TOUR
    G.tour_on ? (G.canmove ? XLAT('guided tour') : XLAT('GAME OVER')) :
      (G.cheater && !G.autocheat) ? XLAT('cheats active') :
        G.racing_on ? 'racing mode' :
          (G.canmove && G.princess_challenge) ? XLAT('%1 Challenge', spM(moPrincess)) :
            G.canmove ? XLAT('Quest status') :
              XLAT('GAME OVER'),
    0xC00000, 200, 100,
  );

  if (!G.canmove && G.yasc_message !== '' && !skip_status) dialog_addInfo(G.yasc_message);

  // CAP_COMPLEX2
  const sweeper = mine_in_minesweeper();

  if (!G.peace_on && !G.racing_on && !sweeper && !in_lovasz() && !skip_status)
    dialog_addInfo(XLAT('Your score: %1', its(gold())));
  if (!G.peace_on && !G.racing_on && !sweeper && !in_lovasz() && !skip_status)
    dialog_addInfo(XLAT('Enemies killed: %1', its(tkills())));

  const congrats = G.cheater ? XLAT('cheaters never win') : XLAT('CONGRATULATIONS!');

  // CAP_TOUR
  if (G.tour_on) { /* */ } else
  if (skip_status) { /* */ } else
  if (G.items[itOrbYendor]) {
    dialog_addInfo(XLAT('Orbs of Yendor found: %1', its(G.items[itOrbYendor])), iinf[itOrbYendor].color);
    dialog_addInfo(congrats, iinf[itOrbYendor].color);
  }
  // CAP_COMPLEX2
  else if (mine_in_minesweeper()) {
    const to_uncover = G.kills[moBomberbird];
    if (to_uncover) {
      dialog_addInfo(XLAT('Uncover all cells which do not contain mines'));
      dialog_addInfo(XLAT('Cells to uncover: %1', its(to_uncover)));
    }
    else {
      dialog_addInfo(congrats, iinf[itOrbYendor].color);
      dialog_addInfo(XLAT('You won in %1', getgametime_s(G.mine_victory_time)));
    }
  }
  else if (in_lovasz()) {
    let score = 0, all = 0;
    for (const c of G.currentmap.allcells()) {
      if (c.wall === waChasm || c.item === itOrbInvis)
        score++;
      all++;
    }
    dialog_addInfo(XLAT('Dropped floors: %1/%2', its(score), its(all)));
    if (score === all) dialog_addInfo(congrats, iinf[itOrbYendor].color);
    if (score === all) achievement_gain_once('LOVASZ', specgeom_lovasz());
  }
  else {
    // CAP_TOUR
    if (G.tour_on) { /* */ }
    else if (G.racing_on) { /* */ }
    else if (G.princess_challenge)
      dialog_addInfo(XLAT('Follow the Mouse and escape with %the1!', spM(moPrincess)));
    else if (!in_full_game()) { /* */ }
    else if (G.casual && G.savecount === 0) {
      dialog_addInfo(XLAT('Find an Orb of Safety to save your game'));
    }
    else if (gold() < R30())
      dialog_addInfo(XLAT('Collect %1 $$$ to access more worlds', its(R30())));
    else if (gold() < R60())
      dialog_addInfo(XLAT('Collect %1 $$$ to access even more lands', its(R60())));
    else if (!landUnlocked(laHell))
      dialog_addInfo(XLAT('Collect at least %1 treasures in each of %2 types to access Hell', its(R10()), its(lands_for_hell())));
    else if (G.items[itHell] < R10())
      dialog_addInfo(XLAT('Collect at least %1 Demon Daisies to find the Orbs of Yendor', its(R10())));
    else if (G.yendor_yi.length === 0)
      dialog_addInfo(XLAT('Look for the Orbs of Yendor in Hell or in the Crossroads!'));
    else
      dialog_addInfo(XLAT('Unlock the Orb of Yendor!'));
  }

  if (!G.timerstopped && !G.canmove) {
    G.savetime += time() - G.timerstart;
    G.timerstopped = true;
  }
  if (G.canmove && !G.timerstart)
    G.timerstart = time();

  if (skip_status) { /* */ }
  else if (G.princess_challenge) { /* */ }
  // CAP_TOUR
  else if (G.tour_on) { /* */ }
  else if (G.peace_on) { /* */ }
  else if (G.racing_on) { /* */ }
  else if (!in_full_game()) { /* */ }
  else if (tkills() < R100() && isLandIngame(laGraveyard))
    dialog_addInfo(XLAT('Defeat %1 enemies to access the Graveyard', its(R100())));
  else if (G.kills[moVizier] === 0 && (G.items[itFernFlower] < U5() || G.items[itGold] < U5()) && isLandIngame(laEmerald))
    dialog_addInfo(XLAT('Kill a Vizier in the Palace to access Emerald Mine'));
  else if (G.items[itEmerald] < U5() && isLandIngame(laCamelot))
    dialog_addInfo(XLAT('Collect 5 Emeralds to access Camelot'));
  else if (landUnlocked(laHell) && ls_any_order()) {
    const l = nextHyperstone();
    if (l)
      dialog_addInfo(
        l ? XLAT('Hyperstone Quest: collect at least %3 points in %the2', spI(treasureType(l)), spL(l), its(R10()))
          : XLAT('Hyperstone Quest: collect at least %3 %1 in %the2', spI(treasureType(l)), spL(l), its(R10())),
      );
    else
      dialog_addInfo(XLAT('Hyperstone Quest completed!'), iinf[itHyperstone].color);
  }
  else dialog_addInfo(XLAT('Some lands unlock at specific treasures or kills'));
  if (G.cheater && !G.autocheat && !skip_status) {
    dialog_addInfo(XLAT('you have cheated %1 times', its(G.cheater)), 0xFF2020);
  }
  if (!G.racing_on && !skip_status) {
    dialog_addInfo(timeline(), G.dialog_dialogcolor);
  }

  if (!skip_status) dialog_addBreak(100);

  // CAP_TOUR
  if (!G.tour_on && !skip_status) {
    hints[G.hinttoshow].display();
    dialog_addBreak(100);
  }

  let intour = false;

  // CAP_TOUR
  intour = G.tour_on;

  if (G.separate_status && showing_status) {
    dialog_addItem(XLAT('menu'), ch('v'));
    dialog_add_action(() => { showing_status = false; });
    dialog_addBack();
    dialog_display();
    return;
  }

  if (skip_status) {
    dialog_addItem(XLAT('show the status screen'), ch('v'));
    dialog_add_action(() => { showing_status = !showing_status; });
  }

  if (intour) {
    // CAP_TOUR
    if (G.canmove) {
      if (sphere()) {
        dialog_addItem(XLAT('return to your game'), ch('1'));
        dialog_addItem(pconf().alpha < 2 ? XLAT('orthogonal projection') : XLAT('stereographic projection'), ch('3'));
      }
      else if (euclid()) {
        dialog_addItem(XLAT('return to your game'), ch('2'));
        dialog_addBreak(100);
      }
      else {
        dialog_addItem(XLAT('spherical geometry'), ch('1'));
        dialog_addItem(XLAT('Euclidean geometry'), ch('2'));
      }
      // dialog::addItem(XLAT("more curved hyperbolic geometry"), '3');
    }
    if (!G.items[itOrbTeleport])
      dialog_addItem(XLAT('teleport away'), ch('4'));
    else if (!G.items[itOrbAether])
      dialog_addItem(XLAT('move through walls'), ch('4'));
    else
      dialog_addItem(XLAT('flash'), ch('4'));
    if (G.canmove) {
      // if(tour::slidecommand != "") dialog::addItem(tour::slidecommand, '5'); (tour: stage 3)
      dialog_addItem(XLAT('static mode'), ch('6'));
      dialog_addItem(XLAT('enable/disable texts'), ch('7'));
      dialog_addItem(XLAT('next slide'), SDLK_RETURN);
      dialog_addItem(XLAT('previous slide'), SDLK_BACKSPACE);
      dialog_addItem(XLAT('list of slides'), ch('9'));
      dialog_addItem(XLAT('leave the tour mode'), ch('0'));
    }
    else
      dialog_addBreak(200);
    dialog_addItem('continue', SDLK_ESCAPE);
  }
  else {
    dialog_addItem(contstr(), SDLK_ESCAPE);
    dialog_addItem(get_o_key()[0], ch('o'));
    dialog_add_action(() => {
      clearMessages();
      get_o_key()[1]();
    });
    // CAP_INV
    if (G.inv_on && G.items[itInventory]) {
      dialog_addItem(XLAT('inventory'), ch('i'));
      dialog_add_action(() => {
        clearMessages();
        pushScreen(inv_show);
      });
    }
    if (G.casual /* || ISMOBILE */) {
      if (G.casual && G.savecount)
        dialog_addItem(XLAT('load (%1 turns passed)', its(G.turncount - G.save_turns)), SDLK_F9);
      else
        dialog_addItem(XLAT('how to find an Orb of Safety?'), SDLK_F9);
    }
    // CAP_ANDROIDSHARE: no
  }
  dialog_addItem(XLAT('message log'), ch('l'));

  if (G.cheater) {
    dialog_addItem(XLAT('cheats'), ch('C'));
    dialog_add_action_push(showCheatMenu);
  }
  dialog_addItem(XLAT('settings'), ch('s'));
  dialog_add_action_push(showSettings);
  dialog_addItem(XLAT('creative mode'), ch('c'));
  dialog_add_action_push(showCreative);
  if (!intour) {
    dialog_addItem(XLAT('special modes'), ch('m'));
    dialog_add_action_push(showChangeMode);
  }
  // CAP_SAVE
  if (!intour) {
    dialog_addItem(XLAT('local highscores'), ch('t'));
    dialog_add_action(() => { scores_load(); });
  }
  // ISMOBILE: no
  dialog_addHelp();
  dialog_add_action(() => { gotoHelp('@'); });
  if (!intour) {
    dialog_addItem(XLAT('restart'), SDLK_F5);
    dialog_addItem(inSpecialMode() ? XLAT('reset special modes') : XLAT('back to the start menu'), ch('R'));
    dialog_add_action(() => {
      dialog_do_if_confirmed(() => {
        // CAP_STARTANIM
        startanims_pick();
        popScreenAll(); pushScreen(showStartMenu);
      });
    });
  }
  // !ISMOBILE
  dialog_addItem(quitsaves() ? XLAT('save') : XLAT('quit'), SDLK_F10);

  G.keyhandler = handleKeyQuit;
  dialog_display();
}

/** string safety_help() */
export function safety_help(): string {
  return XLAT(
    'To save the game you need an Orb of Safety.\n\n' +
    'Orbs of Safety appear:\n\n' +
    '* in the Crossroads and the Land of Eternal Motion, after you collect %1 Phoenix Feathers in the Land of Eternal Motion\n\n' +
    '* in the Ocean after you unlock it (%2 treasures)\n\n' +
    '* in the Prairie after you unlock it (%3 treasures)\n\n',
    its(G.inv_on ? 25 : 10),
    its(R30()), its(R90()),
  );
}

/** void handleKeyQuit(int sym, int uni) */
export function handleKeyQuit(sym: number, uni: number): void {
  const k = { sym, uni };
  dialog_handleNavigation(k);
  sym = k.sym; uni = k.uni;
  // ignore the camera movement keys

  // CAP_RUG: if(rug::rugged && (arrows, page keys)) sym = 0; (not rugged)

  if (sym === SDLK_F10) {
    if (needConfirmation()) pushScreen(() => {
      dialog_confirm_dialog(
        XLAT('This will exit HyperRogue without saving your current game. Are you sure?') + '\n\n' +
        safety_help(),
        () => {
          G.quitmainloop = true;
        });
    });
    else G.quitmainloop = true;
  }
  else if (uni === ch('r') || sym === SDLK_F5) dialog_do_if_confirmed(() => {
    restart_game(rg_nothing);
    G.msgs.length = 0;
  });
  else if (uni === ch('l')) { popScreenAll(); pushScreen(showMessageLog); G.messagelogpos = G.gamelog.length; }
  // CAP_SAVE
  else if (sym === SDLK_F9) {
    if (G.casual && G.savecount) {
      stop_game();
      load_last_save();
      start_game();
      restore_all_golems();
    }
    else
      gotoHelp(safety_help());
  }
  else if (sym === SDLK_F3 || (sym === ch(' ') || sym === SDLK_HOME))
    fullcenter();
  else if (uni === ch('o')) get_o_key()[1]();
  // CAP_INV
  else if (uni === ch('i') && G.inv_on)
    pushScreen(inv_show);
  // CAP_SAVE
  else if (uni === ch('t')) {
    G.msgs.length = 0;
    scores_load();
  }

  // CAP_TOUR: else if(tour::on && tour::handleKeyTour(sym, uni)) ; (tour::on is off: stage 3)

  else if (doexiton(sym, uni) && !G.didsomething) {
    popScreen();
    G.msgs.length = 0;
    if (!G.canmove) {
      if (G.yasc_message !== '') addMessage(XLAT('GAME OVER') + ': ' + G.yasc_message);
      else addMessage(XLAT('GAME OVER'));
      addMessage(timeline());
    }
  }
}

/** int counthints() */
export function counthints(): number {
  for (let h = 0; ; h++) if (hints[h].last < 0) return h;
}

/** void showMissionScreen(bool start_showing_status) */
export function showMissionScreen(start_showing_status: boolean): void {
  cancel(); cancel = noaction;
  popScreenAll();
  achievement_final(false);

  if (G.daily_on) {
    // CAP_DAILY: no
  }
  else {
    showing_status = start_showing_status;
    pushScreen(showGameMenu);
  }

  // CAP_TOUR
  if (!G.tour_on) {
    const chn = counthints();
    G.hinttoshow = chn;
    let h: number;
    for (h = 0; h < chn; h++) {
      if (!hints[h].usable()) continue;
      if (G.hinttoshow === chn || hints[h].last < hints[G.hinttoshow].last) G.hinttoshow = h;
    }
    hints[G.hinttoshow].last = time();
  }

  G.dialog_highlight_text = contstr();
}

