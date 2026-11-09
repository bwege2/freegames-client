// help.cpp of HyperRogue 13.1o (stage 2, package U2): building and displaying the help texts (the help screen,
// the land/monster/item/wall help, the controls and credits, describeMouseover).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names (PORTING.md): the overloads of gotoHelpFor are gotoHelpFor (eLand), gotoHelpFor_i, gotoHelpFor_w,
// gotoHelpFor_m; set_help_to<T> is set_help_to_l/_w/_m/_i. help (string&) parameters are Ref<string>.
// add_reqs expands content.cpp's REQ clauses with help.cpp's macros: content-req.ts add_reqs_switch (generated).
// Not here: the CAP_RUG branch of gotoHelp (the hypersian rug: stage 3), crystal/Euclidean coordinates in
// describeMouseover (other geometries: stage 3), the tour slide titles (tour.cpp: stage 3).
import { S } from './sound.ts';
import { G } from './globals.ts';
import { XLAT, XLATN, XLAT1, spM, spL, spI, spW } from './language.ts';
import { its, fts, format } from './hprint.ts';
import { DEFAULTCONTROL, player_indices, isPlayerOn } from './pcmove.ts';
import { NotPorted, among, callhandlers, callhooks, VER, GEN_M } from './hyper.ts';
import type { Ref } from './cpp.ts';
import {
  iinf, minf, winf, linf, ittypes, motypes, landtypes, IC_ORB, IC_TREASURE,
  itOrbLife, itOrbFriend, itOrbUndeath, itOrbTeleport, itOrbSafety, itSavedPrincess, itOrbLove, itTrollEgg, itIvory,
  itAmethyst, itLotus, itMutant, itGreenStone, itOrbLightning, itOrbFlash, itOrbShield, itOrbWinter, itOrbIntensity,
  itOrbRecall, itOrbEmpathy, itOrbYendor, itHell, itFeather, itHolyGrail, itPower, itOrbLuck, itBone, itOrbFrog,
  itOrbPhasing, itOrbDash, itOrbSummon, itOrbPsi, itOrbStunning, itOrbMorph, itOrbIllusion, itOrbDragon, itOrbAir,
  itOrbEnergy, itOrb37, itOrbLava, itOrbSide1, itOrbSide2, itOrbSide3, itInventory, itHyperstone, itBarrow,
  itBabyTortoise, itCompass,
  moPrincess, moPlayer, moTroll, moTortoise, moMutant, moBat, moEagle, moAltDemon, moHexDemon, moHexSnake,
  moHexSnakeTail, moKrakenT, moKrakenH, moKnight,
  waMineMine, waMineUnknown, waMineOpen, waClosePlate, waOpenPlate, waInvisibleFloor, waFloorA, waFloorB, waRose,
  waTerraWarrior, waBigTree, waSmallTree, waSea, waPalace, waDeadfloor, waCavefloor, waCavewall,
  laPalace, laMinefield, laPower, laPrincessQuest, laWildWest, laBlizzard, laVolcano, laWhirlpool, laStorms,
  laCamelot, laCA, laTortoise, laTemple, laBrownian, laDryForest, laOcean, laGraveyard, laCursed, laDual, laMemory,
  laEmerald, laCaves, laAlchemist, laRose, laHunting,
  type eItem, type eMonster, type eWall, type eLand,
} from './content.ts';
import { add_reqs_switch } from './content-req.ts';
import {
  isShmupLifeOrb, orbcharges, intensify,
} from './orbs.ts';
import {
  isRangedOrb, isEmpathyOrb, isLuckyLand, itemclass, isThumper, isStunnable, isMonsterPart, isFriendly, isGhost,
  frog_power, isCoastal, isPureSealand, isHaunted, isGravityLand, isIcyLand, snakelevel, isAlch, isDie, isDie_w,
  isActivable, hasTimeout, isReptile, hasHitpoints, isMutantIvy, isWarpedType, isElectricLand,
} from './flags.ts';
import { getOLR, orbprizefun, orbcrossfun, getPrizeLand, olrPrize25, olrPrize3, olrGuest, olrMonster, olrAlways, olrHub, type orbinfo } from './orbgen.ts';
import {
  treasureType, treasureTypeUnlock, landMultiplier, in_full_game, required_for_hyperstones, isCrossroads,
  isRandland, land_validity, lv_display_in_help, nodisplay, ls_any_chaos,
} from './landlock.ts';
import { isNative } from './content-req.ts';
import { princessgender, lang } from './config.ts';
import { inv_osminfo, inv_compute, inv_helptext } from './inventory.ts';
import {
  dialog_init_t, dialog_addHelp_s, dialog_start_list, dialog_end_list, dialog_addSelItem, dialog_addItem,
  dialog_add_action, dialog_add_action_push, dialog_lastItem, dialog_display, dialog_handleNavigation, dialog_first_list_fake_key,
} from './dialogs.ts';
import { gamescreen, sm, popScreen } from './graph.ts';
import { pushScreen, doexiton } from './control.ts';
import { SDLK_ESCAPE, SDLK_F1 } from './sdl.ts';
import { in_line_of_sight, in_line_of_sight_for_player } from './environment.ts';
import { gravityLevel, lavatide, isWarped } from './mapeffects.ts';
import { celldistAlt, describeRPM, getBits } from './cell.ts';
import { temple_layer_size } from './bigstuff.ts';
import {
  heat_celsius, windmap_at, tortoise_seek, tortoise_measure, tortoise_getb, sword_at, elec_getCharge, ecCharged,
  ecGrounded, ecConductor, ecIsolator,
} from './complex.ts';
import { camelot_knight_name, dice_describe, ambush_size } from './complex2.ts';
import { conditional_flip_slime } from './attack.ts';
import { det } from './hyperpoint.ts';
import { itemHiddenFromSight, barrowCount } from './items.ts';
import { rosedist } from './passable.ts';
import { SHSIZE } from './monstermove.ts';
import { WDIM, GDIM, S7, BITRUNCATED, PURE, euclid, cryst } from './classes.ts';
import { euc_in } from './euclid.ts';
import { shmup_addShmupHelp } from './shmup.ts';
import { open_wiki } from './util.ts';
import { pseudohept } from './pattern2.ts';
import type { cell } from './locations.ts';

/** struct help_extension */
export class help_extension {
  key = 0;
  text = '';
  subtext = '';
  color: number;
  action: () => void = () => { };
  constructor(k?: number, t?: string, a?: () => void) {
    this.color = G.forecolor;
    if (k !== undefined) { this.key = k; this.text = t!; this.action = a!; }
  }
}

const ch = (c: string): number => c.charCodeAt(0);

/** classes.cpp: const char *trollhelp2, *rosedesc, *warpdesc (EX; not in content.ts's tables) */
export const trollhelp2 =
  ' Additionally, all items around the killed Troll will be destroyed.';
export const rosedesc =
  'Each eight turns, each rosebush at distance at most 5 from you will ' +
  'release a wave of alluring scent. Creatures on the frontwave ' +
  'will move towards where the scent came from. Even if it causes them ' +
  'to attack their friends or beautiful creatures, or move into water, fire, chasm, or thorns of the rosebush. ' +
  'Ivies, Ghosts, Rock Snakes, Rose Ladies and Lords, and monsters restricted to a specific ' +
  'terrain are immune to scents.';
export const warpdesc =
  'This part of the world is warped, restricting the movement somewhat. ' +
  '"Diagonal" movement and attacking between triangular cells is not allowed. ' +
  'Flash, Storms, and Freedom spells ignore this, and Ghosts can move, attack, and ' +
  'be attacked diagonally.';

const quick_keys = [
  '1 = orthogonal/Gans model/FPP',
  '2 = small Poincare model/stereographic projection/SPP',
  '3 = big Poincare model/stereographic projection/TPP',
  '4 = Klein model/gnomonic projection',
  '5 = change wall display mode',
  '6 = change grid',
  '7 = change heptagon marking',
  '8 = monster display mode',
];

const normal_keys = [
  'qweasdzxc, hjklyubn, numpad = move/skip turn',
  'g = drop a Dead Orb',
  't = use a ranged Orb (target center of the screen)',
];

const extra_keys = [
  'o = world overview (or another meaning in special modes)',
  'v = menu',
  'F1 = help',
  'F5 = restart game',
  'F10 = quit game',
  'Esc = quest status',
  'Alt+Enter = full screen',
  'Alt = highlight interesting stuff',
  'click left mouse button = move/skip',
  '[shift+]click left mouse button = use ranged Orb (depending on mouse settings)',
  'click right mouse button = context help',
  'mousewheel up = panning',
  'hold middle mouse button = panning',
  'lctrl + hold middle button = move the screen',
  'mousewheel down = move/skip',
  'rshift + mousewheel = change projection',
  'lshift + mousewheel = change zoom (lctrl to keep center)',
  'lctrl + mousewheel = reset the map center',
  'shift + F2 = disable the HUD',
  'shift + F3 = disable the FPS',
  'shift + F4 = disable the map',
  'space = recenter',
  'ctrl + <key> = more precision',
];

const extra_keys_2d = [
  'arrows = panning',
  'PageUp/Down = rotate the screen',
];

const extra_keys_3d = [
  'arrows = rotate the camera',
  'rshift+arrows = strafe',
  'lshift+arrows = rotate the model (in rug mode)',
  'end = move camera forward',
  'home = move camera backward',
  'shift+Home/End = zoom',
  'PageUp/Down = rotate the screen',
  'move mouse = rotate camera (in rug, only with lctrl)',
];

/** void build_controls() */
export function build_controls(): void {
  G.help = '';
  if (DEFAULTCONTROL() && G.dialog_display_keys === 3)
    G.help += XLAT(
      'To move, aim with the left joystick then press Ⓐ. Press Ⓑ for menu, Steam+Ⓧ for keyboard, Ⓨ to center. Ⓡ to highlight important things on the map.\n\n' +
      'For ranged attacks, use the DPad to aim, then push the left joystick to target an orb or the right joystick to target a ranged weapon. ' +
      'Alternatively, you can also use the right trackpad.\n\n' +
      'Press L5 to drop a dead orb. R4/R5 to rotate the screen.\n\n',
    );
  else
  if (DEFAULTCONTROL() && !G.game_keys_scroll)
    G.help += XLAT(
      "Move with mouse, num pad, qweadzxc, or hjklyubn. Wait by pressing 's' or '.'. Spin the world with arrows, PageUp/Down, and Space. " +
      "To save the game you need an Orb of Safety. Press 'v' for the main menu (configuration, special modes, etc.), ESC for the quest status.\n\n",
    );
  else if (DEFAULTCONTROL() && WDIM() === 2)
    G.help += XLAT(
      'You are currently in a visualization. Press wasd to scroll, qe to rotate. You can also use the arrow keys. ESC for menu.\n\n');
  else if (DEFAULTCONTROL() && WDIM() === 3)
    G.help += XLAT(
      'You are currently in a visualization. Press wasdqe to rotate the camera, ijklyh to move. You can also use the arrow keys and Home/End and PgUp/PgDn. ESC for menu.\n\n');

  if (G.dialog_display_keys !== 3) G.help += XLAT(
    'You can right click any element to get more information about it.\n\n',
  );
  else G.help += XLAT(
    'You can use trackpad to point at things, then press the right trigger, to get more information about things.\n\n',
  );
  // ISMAC: no
}

/** void buildHelpText() */
export function buildHelpText(): void {
  if (callhandlers(false, G.hooks_build_help)) return;
  // DEBBI(debug_graph, ("buildHelpText"));

  G.help = XLAT('Welcome to HyperRogue');
  G.help += XLAT('! (version %1)\n\n', VER);

  if (!G.game_keys_scroll) G.help += XLAT(
    'You have been trapped in a strange, non-Euclidean world. Collect as much treasure as possible ' +
    'before being caught by monsters. The more treasure you collect, the more ' +
    'monsters come to hunt you, as long as you are in the same land type. The ' +
    'Orbs of Yendor are the ultimate treasure; get at least one of them to win the game!',
  );
  if (!G.game_keys_scroll && G.dialog_display_keys !== 3) G.help += XLAT(' (press ESC for some hints about it).');
  if (!G.game_keys_scroll) G.help += '\n\n';

  if (!G.shmup_on && !G.hardcore && !G.game_keys_scroll)
    G.help += XLAT(
      'You can fight most monsters by moving into their location. ' +
      'The monster could also kill you by moving into your location, but the game ' +
      'automatically cancels all moves which result in that.\n\n',
    );

  if (G.shmup_on && !G.game_keys_scroll) {
    G.help += XLAT(
      "Shmup (shoot'em up) mode: You can play a hyperbolic shoot'em up game. The game is based " +
      'on the usual turn-based grid-based HyperRogue, but there are some changes. You fight by ' +
      'throwing knives, and you have three extra lives. There are no allies, so all Orbs ' +
      'related to allies give you extra lives instead (up to 5). Some other rules have been ' +
      'adapted too.\n\n');
  }

  if (G.shmup_on && G.multi_players > 1 && !G.game_keys_scroll) {
    G.help += XLAT(
      'Multiplayer: Play cooperatively (locally); treasures, kills, and deaths are calculated ' +
      'for each player too, for more competitive play. Orbs and treasures are shared, orbs drain ' +
      'faster, knives recharge slower, and player characters are not allowed to separate.\n\n');
  }

  if (G.multi_players > 1 && !G.shmup_on && !G.game_keys_scroll) {
    G.help += XLAT(
      'Turn-based multiplayer: Turns are executed in parallel. A player can leave the game ' +
      'by pressing a designated key (useful when about to get killed or lost). The following ' +
      'Orbs work to bring such players back: ');

    G.help += XLATN(iinf[itOrbLife].name); G.help += ', ';
    G.help += XLATN(iinf[itOrbFriend].name); G.help += ', ';
    G.help += XLATN(iinf[itOrbUndeath].name); G.help += ', ';
    G.help += XLATN(iinf[itOrbTeleport].name); G.help += ', ';
    G.help += XLATN(iinf[itOrbSafety].name); G.help += '\n\n';
  }

  // CAP_INV
  if (G.inv_on && !G.game_keys_scroll)
    G.help += XLAT(
      inv_helptext,
    );
  else if (!G.game_keys_scroll)
    G.help += XLAT(
      'There are many lands in HyperRogue. Collect 10 treasure ' +
      'in the given land type to complete it; this enables you to ' +
      'find the magical Orbs of this land, and in some cases ' +
      'get access to new lands. At 25 treasures ' +
      "this type of Orbs starts appearing in other lands as well. Press 'o' to " +
      'get the details of all the Lands.\n\n');
  if (!G.game_keys_scroll) G.help += '\n\n';

  G.help_extensions.length = 0;

  G.help_extensions.push(new help_extension(ch('c'), XLAT('credits'), () => { buildCredits(); }));

  G.help_extensions.push(new help_extension(ch('k'), XLAT('controls'), () => {
    build_controls();
    G.help_extensions.length = 2; // help_extensions.resize(2) (it has at least 2)
    // ISMOBILE == 0
    G.help_extensions.push(new help_extension(ch('k'), XLAT('advanced keyboard shortcuts'), () => {
      G.help = '';
      for (const s of normal_keys) G.help += s, G.help += '\n';
      for (const s of extra_keys) G.help += s, G.help += '\n';
      G.help += '\n\nQuick keys:\n';
      for (const s of quick_keys) G.help += s, G.help += '\n';
      if (GDIM() === 3 || G.rug_rugged) {
        G.help += '\n\nIn 3D modes:\n';
        for (const s of extra_keys_3d) G.help += s, G.help += '\n';
      }
      else {
        G.help += '\n\nIn 2D modes:\n';
        for (const s of extra_keys_2d) G.help += s, G.help += '\n';
      }
    }));
  }));
}

/** string standard_help() */
export function standard_help(): string {
  if (G.nohelp === 2 || G.dialog_display_keys === 3) return '';
  return XLAT('Press F1 or right click for help');
}

/** void buildCredits() */
export function buildCredits(): void {
  G.help = '';
  G.help += XLAT('game design, programming, texts and graphics by Zeno Rogue <zeno@attnam.com>\n\n');
  if (lang() !== 0)
    G.help += XLAT('add credits for your translation here');
  // !NOLICENSE
  G.help += XLAT(
    'released under GNU General Public License version 2 and thus ' +
    'comes with absolutely no warranty; see COPYING for details\n\n',
  );
  G.help += XLAT(
    'special thanks to the following people for their bug reports, feature requests, porting, and other help:\n\n%1\n\n',
    'Konstantin Stupnik, ortoslon, chrysn, Adam Borowski, Damyan Ivanov, Ryan Farnsley, mcobit, Darren Grey, tricosahedron, Maciej Chojecki, Marek Čtrnáct, ' +
    'wonderfullizardofoz, Piotr Migdał, Tehora Rogue, Michael Heerdegen, Sprite Guard, zelda0x181e, Vipul, snowyowl0, Patashu, phenomist, Alan Malloy, Tom Fryers, Sinquetica, _monad, CtrlAltDestroy, jruderman, ' +
    "Kojiguchi Kazuki, baconcow, Alan, SurelyYouJest, hotdogPi, DivisionByZero, xXxWeedGokuxXx, jpystynen, Dmitry Marakasov, Alexandre Moine, Arthur O'Dwyer, " +
    'Triple_Agent_AAA, bluetailedgnat, Allalinor, Shitford, KittyTac, Christopher King, KosGD, TravelDemon, Bubbles, rdococ, frozenlake, MagmaMcFry, ' +
    'Snakebird Priestess, roaringdragon2, Stopping Dog, bengineer8, Sir Light IJIJ, ShadeBlade, Saplou, shnourok, Ralith, madasa, 6% remaining, Chimera245, Remik Pi, alien foxcat thing, ' +
    'Piotr Grochowski, Ann, still-flow, tyzone, Paradoxica, LottieRatWorld, aismallard, albatross, EncodedSpirit, Jacob Mandelson, CrashTuvai, cvoight, jennlbw, Kali Ranya, spiritbackup, Dylan, L_Lord, AntiRogue, ' +
    'masonlgreen, A human, Pasu4, inbetween selves, CodeParade, Existentialistic, blejanre, Esme, Joshua Murphy, josephcsible, googobbug, garnet420, wlatendresse, jdemeyer, swooboo, pengvado',
  );
  // EXTRALICENSE: not defined
  // !ISMOBILE
  G.help += XLAT(
    '\n\nSee sounds/credits.txt for credits for sound effects',
  );
  if (S.musiclicense !== '') G.help += S.musiclicense;
}

function pushtext(p: string): string {
  let s = XLAT(
    '\n\nNote: when pushing %the1 off a heptagonal cell, you can control the pushing direction ' +
    'by clicking left or right half of the heptagon.', p);
  // !ISMOBILE
  s += XLAT(' With the keyboard, you can press Tab to invert the way the pushing direction leans, or Shift+Tab to decide based on how the view is rotated.');
  return s;
}

function princedesc(): string {
  if (princessgender() === GEN_M)
    return XLAT("Apparently a prince is kept locked somewhere, but you won't ever find him in this hyperbolic palace. ");
  else
    return XLAT("Apparently a princess is kept locked somewhere, but you won't ever find her in this hyperbolic palace. ");
}

/** string helptitle(string s, color_t col) */
export function helptitle(s: string, col: number): string {
  return '@' + its(col) + '\t' + s + '\n';
}

function princessReviveHelp(): string {
  if (G.inv_on) return '';
  let h = '\n\n' +
    XLAT('Killed %1 can be revived with an Orb of Love, after you collect 20 more $$$.', spM(moPrincess));
  if (G.princess_reviveAt)
    h += '\n\n' +
    XLAT('%The1 will be revivable at %2 $$$', spM(moPrincess), its(G.princess_reviveAt));
  return h;
}

function describeOrb(help: Ref<string>, oi: orbinfo): void {
  if (G.inv_on) return;
  const olr = getOLR(oi.orb, getPrizeLand());
  let tr = treasureType(oi.l);
  const tt = treasureTypeUnlock(G.cwt.at.land, oi.orb);
  if (olr === olrGuest) {
    for (const oi1 of G.orbinfos)
      if (oi1.is_native() && oi1.orb === oi.orb)
        tr = treasureType(oi1.l);
  }
  help.v += '\n\n' + XLAT(G.olrDescriptions[olr], spL(G.cwt.at.land), spI(tr), spI(tt));
  const t = Math.imul(G.items[tr], landMultiplier(oi.l));
  if (t >= 25)
    if (olr === olrPrize25 || olr === olrPrize3 || olr === olrGuest || olr === olrMonster || olr === olrAlways) {
      for (const oi1 of G.orbinfos)
        if (oi1.is_native() && oi1.orb === oi.orb) {
          help.v += XLAT('\nSpawn rate (as prize Orb): %1%/%2\n',
            its(Math.trunc(.5 + 100 * orbprizefun(t))),
            its(oi1.gchance));
        }
    }
  if (t >= 10)
    if (olr === olrHub) {
      help.v += XLAT('\nSpawn rate (in Hubs): %1%/%2\n',
        its(Math.trunc(.5 + 100 * orbcrossfun(t))),
        its(oi.gchance));
    }
}

function other_geometry(): string {
  return XLAT('Note: the rules above correspond to the standard geometry; actual rules in other geometries may be different. ');
}

function other_land(): string {
  return XLAT('Note: the rules refer to colors which are not visible in other lands. ');
}

function other_geometry_land(): string {
  if (S7() !== 7 || !BITRUNCATED()) return other_geometry();
  else return other_land();
}

function forbidden_marked(): string {
  return XLAT("When the 'mark heptagons' option (hotkey '7') is on, forbidden moves are marked.");
}

function forbidden_unmarked(): string {
  return XLAT("When the 'mark heptagons' option (hotkey '7') is on, moves between unmarked cells are forbidden.");
}

const hyperstone_optional = 'Completing the quest in this land is not necessary for the Hyperstone Quest.';

const power_help =
  'The amount of Orbs obtained by using Orbs of Mirroring is ' +
  'multiplied by sqrt(1+p/20), where p is the number of Powerstones ' +
  'collected. This also affects the mirrorings which happened before ' +
  'collecting the Powerstones.';

/** string ranged_click_help() (desktop branch) */
export function ranged_click_help(): string {
  let s: string;
  if (G.vid.shifttarget & 1)
    s = XLAT('\nRanged Orbs can be targeted by shift-clicking the desired location. ');
  else
    s = XLAT('\nRanged Orbs can be targeted by clicking the desired location. ');
  if (DEFAULTCONTROL())
    s += XLAT("You can also scroll to the desired location and then press 't'.");
  return s;
}

/** string generateHelpForItem(eItem it) */
export function generateHelpForItem(it: eItem): string {

  let help = helptitle(XLATN(iinf[it].name), iinf[it].color);

  if (G.shmup_on && isShmupLifeOrb(it)) {
    let cnt = 0;
    help += XLAT(
      'The following Orbs act an extra lives in the shmup mode:');
    for (let i = 0; i < ittypes; i++) {
      const it2 = i;
      if (isShmupLifeOrb(it2)) help += cnt++ ? XLAT(', %1', spI(it2)) : XLAT(' %1', spI(it2));
    }
  }

  else
  // CAP_CRYSTAL
  if (it === itCompass && cryst())
    throw new NotPorted('crystal::compass_help (crystal geometries: stage 3)'); // STAGE2-STUB
  else
    help += XLAT(iinf[it].help);

  if (it === itSavedPrincess || it === itOrbLove) if (!G.inv_on)
    help += princessReviveHelp();

  if (it === itTrollEgg)
    help += XLAT('\n\nAfter the Trolls leave, you have 750 turns to collect %the1, or it gets stolen.', spI(it));

  if (it === itIvory || it === itAmethyst || it === itLotus || it === itMutant) {
    help += XLAT(
      '\n\nEasy %1 might disappear when you collect more of its kind.', spI(it));
    if (it !== itMutant) help += XLAT(
      ' You need to go deep to collect lots of them.');
  }

  // !ISMOBILE
  if (it === itOrbSafety)
    help += XLAT('Thus, it is potentially useful for extremely long games, which would eat all the memory on your system otherwise.\n');

  if (isRangedOrb(it)) {
    help += XLAT('\nThis is a ranged Orb. \n');
    help += ranged_click_help();
    help += XLAT('\nYou can never target cells which are adjacent to the player character, or ones out of the sight range.');
  }

  // !ISMOBILE
  if (it === itGreenStone)
    help += XLAT("You can press 'g' or click them in the list to drop a Dead Orb.");
  if (it === itOrbLightning || it === itOrbFlash)
    help += XLAT('\n\nThis Orb is triggered on your first direct melee attack or illegal move.');
  if (it === itOrbShield)
    help += XLAT('\n\nThis Orb protects you from attacks, scents, and insulates you ' +
      'from electricity. It does not let you go through deadly terrain, but ' +
      'if you are attacked with fire, it lets you stay in place in it.');

  if (it === itOrbWinter)
    help += XLAT('\n\nThis orb also allows you to collect items encased in ice.');

  if (it === itOrbIntensity && G.inv_on)
    help += XLAT('\n\nIn the Orb Strategy Mode, the effect is increased to +100%.');

  if (it === itOrbRecall)
    help += XLAT('\n\nOther active orbs extend the duration of this orb.');

  if (it === itOrbEmpathy) {
    let cnt = 0;
    for (let i = 0; i < ittypes; i++) {
      const it2 = i;
      if (isEmpathyOrb(it2)) {
        help += cnt ? XLAT(', %1', spI(it2)) : XLAT(' %1', spI(it2));
        cnt++;
      }
    }
    help += XLAT('\n\nAdditionally, your allies are protected from your indirect attacks.');
  }

  // CAP_INV
  if (G.inv_on) {
    if (it === itOrbYendor || it === itHell) {
      help += XLAT(
        '\n\nIn the Orb Strategy Mode, Orbs of Yendor appear in Hell after ' +
        'you collect 25 Demon Daisies in Hell, in Crossroads/Ocean after you collect 50, ' +
        'and everywhere after you collect 100.');
    }

    if (it === itFeather || it === itOrbSafety) {
      help += XLAT(
        '\n\nIn the Orb Strategy Mode, Orbs of Safety can be gained by ' +
        'collecting Phoenix Feathers in the Land of Eternal Motion. ' +
        'You can also find unlimited Orbs of Safety in the Crossroads ' +
        'and the Ocean (after collecting 25 Phoenix Feathers) ' +
        'and in the Prairie.',
      );
    }

    if (it === itOrbYendor || it === itHolyGrail)
      help += XLAT(
        '\n\nCollect %the1 to gain an extra Orb of the Mirror. ' +
        'You can gain further Orbs of the Mirror by collecting 2, 4, 8...',
        spI(it),
      );

    if (it === itPower)
      help += '\n\n' + XLAT(power_help);

    if (it === itOrbLuck)
      help += XLAT(
        '\n\nIn the Orb Strategy Mode, the Orb of Luck also ' +
        'significantly increases the frequency of Great Walls, Crossroads IV, ' +
        'and sub-lands.',
      );

    if (it === itBone)
      help += XLAT(
        "\n\nIn the Orb Strategy Mode, each 25 Necromancer's Totems " +
        'you are given a random offensive Orb.',
      );

    if (G.inv_remaining[it] || G.inv_usedup[it]) help += '\n\n' + inv_osminfo(it);
    G.inv_whichorbinfo = it;
    inv_compute();
    if (G.inv_orbinfoline !== '') help += '\n\n' + G.inv_orbinfoline;
    if (G.inv_extra !== '') help += '\n\nExtras:' + G.inv_extra;
  }

  if (it === itOrbLuck) {
    help += XLAT('\n\nAdditionally, the probabilities of generating terrain features are subtly changed in the following lands:');

    let cnt = 0;
    for (let i = 0; i < landtypes; i++) {
      const land = i;
      if (isLuckyLand(land)) {
        help += cnt ? XLAT(', %1', spL(land)) : XLAT(' %1', spL(land));
        cnt++;
      }
    }
  }

  const h: Ref<string> = { v: help };
  if (itemclass(it) === IC_ORB || it === itGreenStone || it === itOrbYendor) {
    for (const oi of G.orbinfos) {
      if (oi.orb === it && oi.is_native()) describeOrb(h, oi);
    }
  }

  if (itemclass(it) === IC_TREASURE) {
    for (const oi of G.orbinfos) {
      if (treasureType(oi.l) === it) {
        if (oi.gchance > 0) {
          h.v += '\n\n';
          h.v += XLAT('\n\nOrb unlocked: %1', spI(oi.orb));
          describeOrb(h, oi);
        }
        else if (oi.l === G.cwt.at.land || G.inv_on) {
          h.v += '\n\n';
          h.v += XLAT('Secondary orb: %1', spI(oi.orb));
          describeOrb(h, oi);
        }
      }
    }
  }
  help = h.v;

  const oc = orbcharges(it); if (oc) {

    if (G.items[itOrbIntensity]) {
      const oc2 = intensify(oc);
      help += XLAT('\n\nOrb charges gained on pickup: %1 (increased to %2 by %the3)', its(oc), its(oc2), spI(itOrbIntensity));
    }
    else
      help += XLAT('\n\nOrb charges gained on pickup: %1', its(oc));
  }

  let ac = 0;
  if (among(it, itOrbFrog, itOrbPhasing, itOrbDash)) ac = 5;
  if (among(it, itOrbSummon)) ac = 20;
  if (among(it, itOrbPsi)) ac = 30;
  if (among(it, itOrbStunning)) ac = 10;
  if (among(it, itOrbMorph)) ac = 3;
  if (among(it, itOrbIllusion)) ac = 5;
  if (among(it, itOrbDragon)) ac = 5;
  if (among(it, itOrbAir)) ac = 1;

  if (ac) {
    if (G.items[itOrbEnergy])
      help += XLAT('\n\nActivation cost: %1 charges (reduced to %2 by %the3)\n', its(ac), its((1 + ac) >> 1), spI(itOrbEnergy));
    else if (ac === 1)
      help += XLAT('\n\nActivation cost: 1 charge\n', its(ac));
    else
      help += XLAT('\n\nActivation cost: %1 charges\n', its(ac));
  }

  if (it === itOrb37 && (S7() !== 7 || !BITRUNCATED()))
    help += '\n\n' + other_geometry() + forbidden_unmarked();

  if (it === itOrbLava && (S7() !== 7 || !BITRUNCATED()))
    help += '\n\n' + other_geometry() + forbidden_unmarked();

  if (among(it, itOrbSide2, itOrbSide3) && !among(S7(), 6, 7))
    help += '\n\n' + other_geometry() + XLAT('This orb lets you attack adjacent cells %1 steps from the primary target.', its(it - itOrbSide1 + 1));

  // CAP_INV
  if (G.inv_on && it === itInventory)
    help += '\n\n' + XLAT(inv_helptext);

  if (in_full_game() && !required_for_hyperstones(it) && it !== itHyperstone)
    help += '\n\n' + XLAT(hyperstone_optional);

  // CAP_DAILY = 0

  return help;
}

/** void mine_dialog() (real since U4) */
function mine_dialog(): void {
  G.cmode = sm.SIDE;
  gamescreen();
  dialog_init_t('Minefield graphics');
  add_edit(P('numerical_minefield'));
  add_edit(P('mine_zero_display'));
  add_edit(P('mine_opacity'));
  add_edit(P('mine_hollow'));
  add_edit(P('mine_markers'));
  dialog_addItem(XLAT('minefield colors'), 'c'.charCodeAt(0));
  dialog_add_action_push(() => { edit_color_table(minecolors); });
  dialog_display();
}
import { add_edit, P, edit_color_table } from './config.ts';
import { minecolors } from './graph-wall.ts';

function addMinefieldExplanation(s: Ref<string>): void {

  s.v += XLAT(
    '\n\nOnce you collect a Bomberbird Egg, ' +
    'stepping on a cell with no adjacent mines also reveals the adjacent cells. ' +
    'Collecting even more Eggs will increase the radius.',
  );

  s.v += '\n\n';
  // !ISMOBILE
  s.v += XLAT("Known mines may be marked by pressing 'm'. Your allies won't step on marked mines.");

  G.help_extensions.push(new help_extension(ch('c'), XLAT('configure'), () => { pushScreen(mine_dialog); }));
}

/** string generateHelpForWall(eWall w) */
export function generateHelpForWall(w: eWall): string {

  const s: Ref<string> = { v: helptitle(XLATN(winf[w].name), winf[w].color) };

  s.v += XLAT(winf[w].help);
  if (w === waMineMine || w === waMineUnknown || w === waMineOpen)
    addMinefieldExplanation(s);
  if (isThumper(w)) s.v += pushtext(spW(w));
  if ((w === waClosePlate || w === waOpenPlate) && PURE())
    s.v += '\n\n(For the heptagonal mode, the radius has been reduced to 2 for closing plates.)';
  return s.v;
}

/** void buteol(string& s, int current, int req) (used by content-req.ts add_reqs_switch) */
export function buteol(s: Ref<string>, current: number, req: number): void {
  const siz = s.v.length; // isize(s): only the last character is looked at
  if (s.v[siz - 1] === '\n') s.v = s.v.slice(0, siz - 1);
  s.v += format(' (%d/%d)\n', current, req);
}

/** string generateHelpForMonster(eMonster m) */
export function generateHelpForMonster(m: eMonster): string {
  let s = helptitle(XLATN(minf[m].name), minf[m].color);

  if (m === moPlayer) {
    // CAP_TOUR
    if (G.tour_on || G.peace_on)
      return s + XLAT(
        "A tourist from another world. They mutter something about the 'tutorial', " +
        'and claim that they are here just to learn, and to leave without any treasures. ' +
        'Do not kill them!',
      );

    s += XLAT(
      'This monster has come from another world, presumably to steal our treasures. ' +
      'Not as fast as an Eagle, not as resilient as the guards from the Palace, ' +
      'and not as huge as the Mutant Ivy from the Clearing; however, ' +
      'they are very dangerous because of their intelligence, ' +
      'and access to magical powers.\n\n');

    if (G.cheater)
      s += XLAT('Actually, their powers appear god-like...\n\n');

    else if (!G.hardcore)
      s += XLAT(
        'Rogues will never make moves which result in their immediate death. ' +
        'Even when cornered, they are able to instantly teleport back to their ' +
        'home world at any moment, taking the treasures forever... but ' +
        'at least they will not steal anything further!\n\n',
      );

    if (!euclid())
      s += XLAT(
        'Despite this intelligence, Rogues appear extremely surprised ' +
        'by the most basic facts about geometry. They must come from ' +
        'some really strange world.\n\n',
      );

    if (G.shmup_on)
      s += XLAT("In the Shoot'em Up mode, you are armed with thrown Knives.");

    return s;
  }

  s += XLAT(minf[m].help);
  if (isStunnable(m))
    s += pushtext(spM(m));
  if (m === moTroll) s += XLAT(trollhelp2);

  if (isMonsterPart(m))
    s += XLAT('\n\nThis is a part of a monster. It does not count for your total kills.', spM(m));

  if (isFriendly(m))
    s += XLAT('\n\nThis is a friendly being. It does not count for your total kills.', spM(m));

  if (m === moTortoise)
    s += XLAT('\n\nTortoises are not monsters! They are just annoyed. They do not count for your total kills.', spM(m));

  if (isGhost(m))
    s += XLAT('\n\nA Ghost never moves to a cell which is adjacent to another Ghost of the same kind.', spM(m));

  if (m === moMutant) {
    // using namespace clearing;
    if (G.clearing_direct)
      s += XLAT('\n\nLeaves cut directly: %1', its(G.clearing_direct));
    if (G.kills[moMutant])
      s += XLAT('\n\nLeaves cut onscreen: %1', its(G.kills[moMutant]));
    if (G.clearing_imputed && G.clearing_imputed.nonzero())
      s += XLAT('\n\nLeaves cut offscreen (approximately): %1', G.clearing_imputed.get_str(10000));
  }

  const it = frog_power(m);
  if (it) {
    s += XLAT('\n\nThis Frog uses the power of %the1. You get 5 charges yourself for killing it.', spI(it));

    s += XLAT('\n\nFrogs move first, and after they use their jumping power, they stun adjacent non-frog monsters which are not friendly to the player for 2 turns.');
  }

  if (m === moBat || m === moEagle)
    s += XLAT('\n\nFast flying creatures may attack or go against gravity only in their first move.', spM(m));

  if (m === moAltDemon)
    s += '\n\n' + other_geometry_land() + forbidden_unmarked();

  if (among(m, moHexDemon, moHexSnake, moHexSnakeTail))
    s += '\n\n' + other_geometry_land() + forbidden_marked();

  if (among(m, moKrakenT, moKrakenH) && (S7() !== 7 || !BITRUNCATED()))
    s += '\n\n' + other_geometry() + XLAT('Forbidden cells are marked with a different color.');

  return s;
}

/** void add_reqs(eLand l, string& s): the REQ clauses of content.cpp with help.cpp's macros */
function add_reqs(l: eLand, s: Ref<string>): void {
  // back:
  for (;;) {
    const next = add_reqs_switch(l, s);
    if (next === null) return;
    l = next; // goto back;
  }
}

/** string generateHelpForLand(eLand l) */
export function generateHelpForLand(l: eLand): string {
  const s: Ref<string> = { v: helptitle(XLATN(linf[l].name), linf[l].color) };

  if (l === laPalace) s.v += princedesc();

  s.v += XLAT(linf[l].help);

  if (l === laMinefield) addMinefieldExplanation(s);

  s.v += '\n\n';

  add_reqs(l, s);

  if (l === laPower && G.inv_on)
    G.help += XLAT(power_help) + '\n\n';

  if (isCoastal(l))
    s.v += XLAT('Coastal region -- connects inland and aquatic regions.\n');

  if (isPureSealand(l))
    s.v += XLAT('Aquatic region -- accessible only from coastal regions and other aquatic regions.\n');

  if (in_full_game() && !required_for_hyperstones(treasureType(l)) && !isCrossroads(l))
    s.v += XLAT(hyperstone_optional);

  const rl = isRandland(l);
  if (rl === 2)
    s.v += XLAT('Variants of %the1 are always available in the Random Pattern Mode.', spL(l));
  else if (rl === 1)
    s.v += XLAT(
      'Variants of %the1 are available in the Random Pattern Mode after ' +
      'getting a highscore of at least 10 %2.', spL(l), spI(treasureType(l)));

  if (l === laPrincessQuest) {
    s.v += XLAT('Unavailable in the shmup mode.\n');
    s.v += XLAT('Unavailable in the multiplayer mode.\n');
  }

  if (l === laWildWest)
    s.v += XLAT('Bonus land, available only in some special modes.\n');

  if (among(l, laBlizzard, laVolcano) && G.windmap_wind_failed)
    s.v += XLAT('Failed to construct a wind/lava pattern. This land will not work correctly.\n');

  if (l === laWhirlpool)
    s.v += XLAT('Orbs of Safety always appear here, and may be used to escape.\n');

  if (l === laStorms) {
    if (G.elec_lightningfast === 0) s.v += XLAT('\nSpecial conduct (still valid)\n');
    else s.v += XLAT('\nSpecial conduct failed:\n');

    s.v += XLAT(
      'Avoid escaping from a discharge ("That was close").');
  }

  if (isHaunted(l)) {
    if (G.survivalist) s.v += XLAT('\nSpecial conduct (still valid)\n');
    else s.v += XLAT('\nSpecial conduct failed:\n');

    s.v += XLAT(
      'Avoid chopping trees, using Orbs, and non-graveyard monsters in the Haunted Woods.',
    );
  }

  // CAP_CRYSTAL
  if (l === laCamelot && cryst()) {
    if (!G.crystal_used_compass_inside) s.v += XLAT('\nSpecial conduct (still valid)\n');
    else s.v += XLAT('\nSpecial conduct failed:\n');

    s.v += XLAT(
      'Do not use compases.\n\n');

    s.v += XLAT("Crystal Camelot is an octahedron in 'pure' 3D crystal geometry (and a similar polytope in other pure crystals), " +
      'and an Euclidean ball in bitruncated/Goldberg crystals.');
  }

  const lv = land_validity(l);
  if (lv.flags & lv_display_in_help)
    s.v += '\n\n' + XLAT(lv.msg);

  // !ISMOBILE
  if (l === laCA) {
    s.v += XLAT('\n\nOption -mineadj 1 can be added for Moore neighborhoods.');
    s.v += XLAT("\n\nHint: use 'm' to toggle cells quickly");
  }

  return s.v;
}

function turnstring(i: number): string {
  if (i === 1) return XLAT('1 turn');
  else return XLAT('%1 turns', its(i));
}

let helpgenerator: () => void = () => { };
/** string bygen(reaction_t h) */
export function bygen(h: () => void): string {
  helpgenerator = h;
  return 'HELPGEN';
}

/** void gotoHelpFor(eItem i) */
function gotoHelpFor_i(i: eItem): void {
  G.help = generateHelpForItem(i);
}

/** void gotoHelpFor(eWall w) */
function gotoHelpFor_w(w: eWall): void {
  G.help = generateHelpForWall(w);
}

/** void gotoHelpFor(eMonster m) */
function gotoHelpFor_m(m: eMonster): void {
  G.help = generateHelpForMonster(m);
}

/** void appendHelp(string s) */
export function appendHelp(s: string): void {
  const h = helpgenerator;
  if (G.help === 'HELPGEN')
    bygen(() => { h(); G.help += s; });
  else
    G.help += s;
}

// unsigned char lastval; int windtotal;
let lastval = 0;
let windtotal = 0;

/** template<class T> void set_help_to(T t) */
function set_help_to(goto_t: () => void): void {
  G.help = bygen(() => {
    goto_t();
    G.help_extensions.push(new help_extension(ch('h'), XLAT('HyperRogue help'), () => { buildHelpText(); }));
  });
}
const set_help_to_l = (l: eLand): void => { set_help_to(() => { gotoHelpFor(l); }); };
const set_help_to_w = (w: eWall): void => { set_help_to(() => { gotoHelpFor_w(w); }); };
const set_help_to_m = (m: eMonster): void => { set_help_to(() => { gotoHelpFor_m(m); }); };
const set_help_to_i = (i: eItem): void => { set_help_to(() => { gotoHelpFor_i(i); }); };

/** void describeMouseover() */
export function describeMouseover(): void {
  // DEBBI(debug_graph, ("describeMouseover"));

  if (callhandlers(false, G.hooks_global_mouseover)) return;

  const c: cell | null = G.mousing ? G.mouseover : G.playermoved ? null : G.current_display.precise_center;
  // string& out = mouseovers;
  const out: Ref<string> = { get v() { return G.mouseovers; }, set v(x: string) { G.mouseovers = x; } };
  if (!c || G.instat || G.getcstat !== ch('-')) { /* */ }
  else if (!in_line_of_sight_for_player(c)) {
    out.v = XLAT('you cannot see this place');
    G.help = XLAT('You cannot currently see this tile.\n\nThis also means that most enemies will not try to reach you through this tile.\n\n');
    G.help += XLAT('Enemies which ignore this restriction:');
    G.help += XLAT('ice wolves, ghosts, demon sharks, hyperbugs');
  }
  else if (c.wall !== waInvisibleFloor) {
    out.v = XLAT1(linf[c.land].name);
    set_help_to_l(c.land);

    if (WDIM() === 3 && isGravityLand(c.land)) out.v += ' [' + its(gravityLevel(c)) + ']';

    if (c.land === laTemple && c.master.alt) {
      const lev = -celldistAlt(c);
      const ts = temple_layer_size();
      out.v += ' (' + its(Math.trunc(lev / ts) + 1) + ':' + its(lev % ts) + ')';
    }
    if (isIcyLand(c))
      out.v += ' (' + fts(heat_celsius(c)) + ' °C)';
    if (c.land === laBrownian && c.wall === 0 /* waNone */)
      out.v += XLAT(' (level %1)', its(snakelevel(c)));
    if (c.land === laDryForest && c.landparam)
      out.v += ' (' + its(c.landparam) + '/10)';
    if (c.land === laOcean && ls_any_chaos())
      out.v += ' (' + its(c.LHU.byte(2)) + 'S' + its(c.LHU.byte(0)) + 'L' + its(c.LHU.byte(1)) + ')'; // CHAOSPARAM, SEADIST, LANDDIST
    else if (c.land === laOcean && c.landparam <= 25) {
      if (G.shmup_on)
        out.v += ' (' + its(c.landparam) + ')';
      else {
        const tide = G.tide, tidalsize = G.tidalsize;
        const b = c.landparam >= tide[G.turncount % tidalsize];
        let t = 1;
        for (; t < 1000 && b === (c.landparam >= tide[(G.turncount + t) % tidalsize]); t++);
        if (b)
          out.v += ' (' + turnstring(t) + XLAT(' to surface') + ')';
        else
          out.v += ' (' + turnstring(t) + XLAT(' to submerge') + ')';
      }
    }
    // CAP_FIELD
    else if (c.land === laVolcano) {
      const id = Math.trunc(lavatide(c, 0) / 4);
      if (id < 96 / 4)
        out.v += ' (' + turnstring(96 / 4 - id) + XLAT(' to go cold') + ')';
      else
        out.v += ' (' + turnstring(256 / 4 - id) + XLAT(' to submerge') + ')';
    }
    else if (c.land === laBlizzard) {
      const wm = windmap_at(c);
      windtotal = (windtotal + ((((wm - lastval) & 0xFF) << 24) >> 24)) | 0; // (signed char) (wm-lastval)
      lastval = wm & 0xFF;
      if (c === G.cwt.at) windtotal = 0;
      out.v += ' [' + its(windtotal) + ']';
    }

    if (c.land === laTortoise && tortoise_seek()) out.v += ' ' + tortoise_measure(getBits(c));

    // describe the shadow path
    if (among(c.land, laGraveyard, laCursed) && G.shpos.length) {
      let shadowtimes = '';
      for (let s = 1; s < SHSIZE; s++) {
        let shadow = false;
        for (const p of player_indices())
          if (G.shpos[(G.cshpos + s) % SHSIZE][p] === c)
            shadow = true;
        if (shadow) {
          if (shadowtimes === '')
            shadowtimes = its(s);
          else
            shadowtimes += ' ' + its(s);
        }
      }
      if (shadowtimes !== '')
        out.v += XLAT(' (shadow in %1)', shadowtimes);
    }

    if (G.buggyGeneration) {
      // hr::format(" %p H=%d M=%d", hr::voidp(c), ...): the pointer is the cell's creation serial (debugging only)
      out.v += ' 0x' + c._id.toString(16) + format(' H=%d M=%d', c.landparam, c.mpdist);
    }

    if (G.randomPatternsMode)
      out.v += ' ' + describeRPM(c.land);

    if (G.cheater && euc_in(2))
      throw new NotPorted('describeMouseover: Euclidean coordinates (stage 3)'); // STAGE2-STUB

    if (G.cheater && euc_in(3))
      throw new NotPorted('describeMouseover: Euclidean coordinates (stage 3)'); // STAGE2-STUB

    // CAP_CRYSTAL: geometry == gCrystal344 (stage 3)

    if (c.wall && !(c.land === laDual && pseudohept(c)) &&
      !(c.land === laMemory) &&
      !((c.wall === waFloorA || c.wall === waFloorB) && c.item)) {

      let w = c.wall;
      if (isAlch(w))
        w = conditional_flip_slime(G.mousing ? det(G.mouseoverV.T) < 0 : det(G.current_display.view_matrix) < 0, w);

      out.v += ', '; out.v += XLAT1(winf[w].name);

      if (c.wall === waRose) out.v += ' (' + its(7 - G.rosephase) + ')';
      if (c.wall === waTerraWarrior) out.v += ' (' + its(c.wparam) + ')';
      // CAP_COMPLEX2
      if (isDie_w(c.wall)) out.v += ' (' + dice_describe(c) + ')';

      if ((c.wall === waBigTree || c.wall === waSmallTree) && c.land !== laDryForest)
        G.help =
          'Trees in this forest can be chopped down. Big trees take two turns to chop down.';
      else
        if (c.wall !== waSea && c.wall !== waPalace && c.wall !== waDeadfloor)
          if (!((c.wall === waCavefloor || c.wall === waCavewall) && (c.land === laEmerald || c.land === laCaves)))
            if (!((isAlch(c.wall) && c.land === laAlchemist)))
              set_help_to_w(c.wall);
    }

    if (isActivable(c)) out.v += XLAT(' (touch to activate)');

    if (hasTimeout(c)) out.v += ' [' + turnstring(c.wparam) + ']';

    if (isReptile(c.wall))
      out.v += ' [' + turnstring(c.wparam & 0xFF) + ']';

    // CAP_COMPLEX2
    if (c.monst === moKnight)
      out.v += XLAT(', %1 the Knight', camelot_knight_name(c));

    else if (c.monst) {
      out.v += ', '; out.v += XLAT1(minf[c.monst].name);
      // CAP_COMPLEX2
      if (isDie(c.monst))
        out.v += ' (' + dice_describe(c) + ')';
      if (hasHitpoints(c.monst))
        out.v += ' (' + its(c.hitpoints) + ' HP)';
      if (isMutantIvy(c))
        out.v += ' (' + its((c.stuntime - G.mutantphase) & 15) + '*)';
      else if (c.stuntime)
        out.v += ' (' + its(c.stuntime) + '*)';

      if (c.monst === moTortoise && tortoise_seek())
        out.v += ' ' + tortoise_measure(tortoise_getb(c));

      set_help_to_m(c.monst);
    }

    if (c.item && !itemHiddenFromSight(c)) {
      out.v += ', ';
      out.v += XLAT1(iinf[c.item].name);
      if (c.item === itBarrow) out.v += ' (x' + its(barrowCount(c)) + ')';
      // CAP_COMPLEX2
      if (c.land === laHunting) {
        const i = ambush_size(c, c.item);
        if (i) out.v += ' (' + XLAT('ambush:') + ' ' + its(i) + ')';
      }
      if (c.item === itBabyTortoise && tortoise_seek()) {
        // tortoise::babymap[c]: operator[] inserts 0
        if (!G.tortoise_babymap.has(c)) G.tortoise_babymap.set(c, 0);
        out.v += ' ' + tortoise_measure(G.tortoise_babymap.get(c)!);
      }
      if (!c.monst) set_help_to_i(c.item);
    }

    if (isPlayerOn(c) && !G.shmup_on && G.mapeditor_drawplayer)
      out.v += XLAT(', you'), G.help = generateHelpForMonster(moPlayer);

    shmup_addShmupHelp(out);

    if (rosedist(c) === 1)
      out.v += ', wave of scent (front)';

    if (rosedist(c) === 2)
      out.v += ', wave of scent (back)';

    if (sword_at(c)) out.v += ', Energy Sword';

    if (rosedist(c) || c.land === laRose || c.wall === waRose)
      appendHelp('\n\n' + rosedesc);

    if (isWarped(c) && !isWarpedType(c.land))
      out.v += ', warped';

    if (!in_line_of_sight(c)) {
      out.v += ' (magical vision)';
      appendHelp("\n\nWhile you magically know what is there, most enemies won't track you through here.");
    }

    if (isWarped(c)) {
      appendHelp('\n\n' + XLAT(warpdesc));

      if (S7() !== 7 || !BITRUNCATED()) if (c.item !== itOrb37)
        appendHelp('\n\n' + other_geometry() + forbidden_unmarked());
    }

    if (isElectricLand(c) || isElectricLand(G.cwt.at.land)) {
      // using namespace elec;
      const chg = elec_getCharge(c);
      if (chg === ecCharged) appendHelp('\n\nThis cell is charged.');
      if (chg === ecGrounded) appendHelp('\n\nThis cell is grounded.');
      if (chg === ecConductor) appendHelp('\n\nThis cell is currently conductive.');
      if (chg === ecIsolator) appendHelp('\n\nThis cell is currently not conductive.');
    }
  }
  else {
    shmup_addShmupHelp(out);
  }

  callhooks(G.hooks_mouseover, c!);

  if (G.mousey < idiv2(G.vid.fsize * 3) && G.getcstat === ch('-') && !G.instat) G.getcstat = SDLK_F1;
  // CAP_TOUR
  if (G.tour_on && !G.tour_texts)
    throw new NotPorted('describeMouseover: the tour slide titles (tour.cpp: stage 3)'); // STAGE2-STUB
}

/** vid.fsize * 3/2 (int division) */
function idiv2(x: number): number { return Math.trunc(x / 2); }

/** void addHelpWithTitle() */
export function addHelpWithTitle(): void {
  if (G.help[0] === '@') {
    const iv = G.help.indexOf('\t');
    const id = G.help.indexOf('\n');
    dialog_init_t(G.help.substring(iv + 1, id), atoi(G.help.slice(1)), 120, 100);
    dialog_addHelp_s(G.help.slice(id + 1));
  }
  else {
    dialog_init_t('help', G.forecolor, 120, 100);
    dialog_addHelp_s(G.help);
  }
}

/** atoi */
function atoi(s: string): number {
  const m = /^\s*[-+]?\d+/.exec(s);
  return m ? parseInt(m[0], 10) | 0 : 0;
}

/** void showHelp() */
export function showHelp(): void {
  G.cmode = sm.HELP | sm.DOTOUR | sm.DARKEN;
  G.getcstat = SDLK_ESCAPE;
  if (G.help === 'HELPFUN') {
    G.help_delegate();
    return;
  }

  gamescreen();
  addHelpWithTitle();

  let in_list = false;

  for (const he of G.help_extensions) {
    if (!in_list && he.key === dialog_first_list_fake_key) {
      dialog_start_list(1000, 1000, ch('a'));
      in_list = true;
    }
    if (in_list && (he.key < dialog_first_list_fake_key || he.key > dialog_first_list_fake_key + 1000)) {
      in_list = false;
      dialog_end_list();
    }

    if (he.subtext !== '')
      dialog_addSelItem(he.text, he.subtext, he.key);
    else
      dialog_addItem(he.text, he.key);
    dialog_add_action(he.action);
    dialog_lastItem().color = he.color;
  }
  if (in_list) dialog_end_list();

  dialog_display();

  G.keyhandler = (sym: number, uni: number) => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;

    if (sym === SDLK_F1) {
      const i = G.help;
      buildHelpText();
      if (G.help === i) popScreen();
    }
    else if (doexiton(sym, uni))
      popScreen();
  };
}

/** void gotoHelp(const string& h) */
export function gotoHelp(h: string): void {
  G.help = h;
  G.help_extensions.length = 0;
  pushScreen(showHelp);
  if (G.help === '@') {

    if (callhandlers(false, G.hooks_default_help)) return;

    // CAP_RUG
    if (G.rug_rugged) throw new NotPorted('gotoHelp: rug::makehelp (the hypersian rug: stage 3)'); // STAGE2-STUB

    buildHelpText();
  }
  if (G.help === 'HELPGEN') helpgenerator();
}

/** void subhelp(const string& h) */
export function subhelp(h: string): void {
  const oldhelp = G.help;
  const ext = [...G.help_extensions];
  const back = (): void => {
    G.help = oldhelp;
    G.help_extensions = [...ext];
  };
  G.help = h;
  G.help_extensions.length = 0;
  if (G.help === 'HELPGEN') helpgenerator();
  G.help_extensions.push(new help_extension(ch('z'), XLAT('back'), back));
}

/** void gotoHelpFor(eLand l) */
export function gotoHelpFor(l: eLand): void {
  G.help = generateHelpForLand(l);

  let beastcount = 0;
  for (let m0 = 0; m0 < motypes; m0++)
    if (isNative(l, m0) && !nodisplay(m0)) beastcount++;

  const listbeasts = (): void => {
    let nextmonster = ch('a');
    for (let m0 = 0; m0 < motypes; m0++) {
      const m = m0;
      if (isNative(l, m) && !nodisplay(m)) {
        const hex = new help_extension();
        hex.key = nextmonster++;
        hex.text = XLATN(minf[m].name);
        hex.action = () => {
          subhelp(bygen(() => { gotoHelpFor_m(m); }));
        };
        G.help_extensions.push(hex);
      }
    }
  };

  if (beastcount > 3)
    G.help_extensions.push(new help_extension(ch('b'), XLAT('bestiary of %the1', spL(l)), () => {
      subhelp(helptitle(XLAT('bestiary of %the1', spL(l)), 0xC00000));
      listbeasts();
    }));
  else listbeasts();

  if (l === laTortoise)
    G.help_extensions.push(new help_extension(ch('s'), XLAT('Galápagos shading'), () => {
      G.tortoise_shading_enabled = !G.tortoise_shading_enabled;
    }));

  G.help_extensions.push(new help_extension(ch('w'), XLAT('wiki'), () => {
    open_wiki(linf[l].name);
  }));
}

export { gotoHelpFor_i, gotoHelpFor_w, gotoHelpFor_m };
