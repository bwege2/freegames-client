// ui.cpp
//
// screen_has_changed, message_ready_to_print, messages[] and last_message_id are defined here in C;
// in the port they are in globals.ts.
import { config } from './config.ts';
import {
  BTH_PER_PLUS_TO_HIT_ADJUST, ESCAPE, PLAYER_MAX_LEVEL, PlayerAttr, PlayerClassLevelAdj, SCREEN_HEIGHT, SCREEN_WIDTH,
  STAT_COLUMN, TILE_LIGHT_FLOOR,
} from './constants.ts';
import { character_races, class_level_adj, classes, magic_spells, spell_names } from './data_player.ts';
import { caveGetTileSymbol, dungeonLightRoom, dungeonMoveCharacterLight } from './dungeon.ts';
import { outputPlayerCharacterToFile } from './game_files.ts';
import { dg, game, py } from './globals.ts';
import { chr, i16, idiv, ref, type Ref, sprintf } from './libc.ts';
import { spellChanceOfSuccess } from './mage_spells.ts';
import { playerCalculateAllowedSpellsCount, playerGainMana, playerGetGenderLabel, playerRankTitle } from './player.ts';
import { playerEndRunning } from './player_run.ts';
import { playerCalculateHitPoints, playerDisarmAdjustment, playerStatAdjustmentWisdomIntelligence } from './player_stats.ts';
import type { Coord_t } from './structs.ts';
import {
  clearScreen, clearToBottom, eraseLine, getDefaultPlayerName, getKeyInput, getStringInput, panelPutTile, printMessage,
  putString, putStringClearToEOL, terminalBellSound,
} from './ui_io.ts';

const stat_names: readonly string[] = [
  'STR : ', 'INT : ', 'WIS : ', 'DEX : ', 'CON : ', 'CHR : ',
];
const BLANK_LENGTH = 24;
const blank_string = '                        ';

/** &blank_string[BLANK_LENGTH - n]: n blanks */
function blanks(n: number): string {
  return blank_string.slice(BLANK_LENGTH - n);
}

// Calculates current boundaries -RAK-
function panelBounds(): void {
  dg.panel.top = dg.panel.row * idiv(SCREEN_HEIGHT, 2);
  dg.panel.bottom = dg.panel.top + SCREEN_HEIGHT - 1;
  dg.panel.row_prt = dg.panel.top - 1;
  dg.panel.left = dg.panel.col * idiv(SCREEN_WIDTH, 2);
  dg.panel.right = dg.panel.left + SCREEN_WIDTH - 1;
  dg.panel.col_prt = dg.panel.left - 13;
}

// Given an row (y) and col (x), this routine detects -RAK-
// when a move off the screen has occurred and figures new borders.
// `force` forces the panel bounds to be recalculated, useful for 'W'here.
export function coordOutsidePanel(coord: Coord_t, force: boolean): boolean {
  const panel = { y: dg.panel.row, x: dg.panel.col };

  if (force || coord.y < dg.panel.top + 2 || coord.y > dg.panel.bottom - 2) {
    panel.y = idiv(coord.y - idiv(SCREEN_HEIGHT, 4), idiv(SCREEN_HEIGHT, 2)) | 0;

    if (panel.y > dg.panel.max_rows) {
      panel.y = dg.panel.max_rows;
    } else if (panel.y < 0) {
      panel.y = 0;
    }
  }

  if (force || coord.x < dg.panel.left + 3 || coord.x > dg.panel.right - 3) {
    panel.x = idiv(coord.x - idiv(SCREEN_WIDTH, 4), idiv(SCREEN_WIDTH, 2)) | 0;
    if (panel.x > dg.panel.max_cols) {
      panel.x = dg.panel.max_cols;
    } else if (panel.x < 0) {
      panel.x = 0;
    }
  }

  if (panel.y !== dg.panel.row || panel.x !== dg.panel.col) {
    dg.panel.row = panel.y;
    dg.panel.col = panel.x;
    panelBounds();

    // stop movement if any
    if (config.options.find_bound) {
      playerEndRunning();
    }

    // Yes, the coordinates are beyond the current panel boundary
    return true;
  }

  return false;
}

// Is the given coordinate within the screen panel boundaries -RAK-
export function coordInsidePanel(coord: Coord_t): boolean {
  const valid_y = coord.y >= dg.panel.top && coord.y <= dg.panel.bottom;
  const valid_x = coord.x >= dg.panel.left && coord.x <= dg.panel.right;

  return valid_y && valid_x;
}

// Prints the map of the dungeon -RAK-
export async function drawDungeonPanel(): Promise<void> {
  let line = 1;

  const coord = { y: 0, x: 0 };

  // Top to bottom
  for (coord.y = dg.panel.top; coord.y <= dg.panel.bottom; coord.y++) {
    await eraseLine({ y: line, x: 13 });
    line++;

    // Left to right
    for (coord.x = dg.panel.left; coord.x <= dg.panel.right; coord.x++) {
      const ch = caveGetTileSymbol(coord);
      if (ch !== ' ') {
        panelPutTile(ch, coord);
      }
    }
  }
}

// Draws entire screen -RAK-
export async function drawCavePanel(): Promise<void> {
  await clearScreen();
  printCharacterStatsBlock();
  await drawDungeonPanel();
  await printCharacterCurrentDepth();
}

// We need to reset the view of things. -CJS-
export async function dungeonResetView(): Promise<void> {
  const tile = dg.floor[py.pos.y][py.pos.x];

  // Check for new panel
  if (coordOutsidePanel(py.pos, false)) {
    await drawDungeonPanel();
  }

  // Move the light source
  dungeonMoveCharacterLight(py.pos, py.pos);

  // A room of light should be lit.
  if (tile.feature_id === TILE_LIGHT_FLOOR) {
    if (py.flags.blind < 1 && !tile.permanent_light) {
      dungeonLightRoom(py.pos);
    }
    return;
  }

  // In doorway of light-room?
  if (tile.perma_lit_room && py.flags.blind < 1) {
    for (let i = py.pos.y - 1; i <= py.pos.y + 1; i++) {
      for (let j = py.pos.x - 1; j <= py.pos.x + 1; j++) {
        if (dg.floor[i][j].feature_id === TILE_LIGHT_FLOOR && !dg.floor[i][j].permanent_light) {
          dungeonLightRoom({ y: i, x: j });
        }
      }
    }
  }
}

// Converts stat num into string
export function statsAsString(stat: number, stat_string: Ref<string>): void {
  const percentile = stat - 18;

  if (stat <= 18) {
    stat_string.v = sprintf('%6d', stat);
  } else if (percentile === 100) {
    stat_string.v = '18/100';
  } else {
    stat_string.v = sprintf(' 18/%02d', percentile);
  }
}

// Print character stat in given row, column -RAK-
export function displayCharacterStats(stat: number): void {
  const text = ref('');
  statsAsString(py.stats.used[stat], text);
  putString(stat_names[stat], { y: 6 + stat, x: STAT_COLUMN });
  putString(text.v, { y: 6 + stat, x: STAT_COLUMN + 6 });
}

// Print character info in given row, column -RAK-
// The longest title is 13 characters, so only pad to 13
function printCharacterInfoInField(info: string, coord: Coord_t): void {
  // blank out the current field space
  putString(blanks(13), coord);

  putString(info, coord);
}

// Print long number with header at given row, column
function printHeaderLongNumber(header: string, num: number, coord: Coord_t): void {
  const str = sprintf('%s: %6d', header, num);
  putString(str, coord);
}

// Print long number (7 digits of space) with header at given row, column
function printHeaderLongNumber7Spaces(header: string, num: number, coord: Coord_t): void {
  const str = sprintf('%s: %7d', header, num);
  putString(str, coord);
}

// Print number with header at given row, column -RAK-
function printHeaderNumber(header: string, num: number, coord: Coord_t): void {
  const str = sprintf('%s: %6d', header, num);
  putString(str, coord);
}

// Print long number at given row, column
function printLongNumber(num: number, coord: Coord_t): void {
  const str = sprintf('%6d', num);
  putString(str, coord);
}

// Print number at given row, column -RAK-
function printNumber(num: number, coord: Coord_t): void {
  const str = sprintf('%6d', num);
  putString(str, coord);
}

// Prints title of character -RAK-
export function printCharacterTitle(): void {
  printCharacterInfoInField(playerRankTitle(), { y: 4, x: STAT_COLUMN });
}

// Prints level -RAK-
export function printCharacterLevel(): void {
  printNumber(py.misc.level, { y: 13, x: STAT_COLUMN + 6 });
}

// Prints players current mana points. -RAK-
export function printCharacterCurrentMana(): void {
  printNumber(py.misc.current_mana, { y: 15, x: STAT_COLUMN + 6 });
}

// Prints Max hit points -RAK-
export function printCharacterMaxHitPoints(): void {
  printNumber(py.misc.max_hp, { y: 16, x: STAT_COLUMN + 6 });
}

// Prints players current hit points -RAK-
export function printCharacterCurrentHitPoints(): void {
  printNumber(py.misc.current_hp, { y: 17, x: STAT_COLUMN + 6 });
}

// prints current AC -RAK-
export function printCharacterCurrentArmorClass(): void {
  printNumber(py.misc.display_ac, { y: 19, x: STAT_COLUMN + 6 });
}

// Prints current gold -RAK-
export function printCharacterGoldValue(): void {
  printLongNumber(py.misc.au, { y: 20, x: STAT_COLUMN + 6 });
}

// Prints depth in stat area -RAK-
export async function printCharacterCurrentDepth(): Promise<void> {
  let depths: string;

  const depth = dg.current_level * 50;

  if (depth === 0) {
    depths = 'Town level';
  } else {
    depths = sprintf('%d feet', depth);
  }

  await putStringClearToEOL(depths, { y: 23, x: 65 });
}

// Prints status of hunger -RAK-
export function printCharacterHungerStatus(): void {
  if ((py.flags.status & config.player.status.PY_WEAK) !== 0) {
    putString('Weak  ', { y: 23, x: 0 });
  } else if ((py.flags.status & config.player.status.PY_HUNGRY) !== 0) {
    putString('Hungry', { y: 23, x: 0 });
  } else {
    putString(blanks(6), { y: 23, x: 0 });
  }
}

// Prints Blind status -RAK-
export function printCharacterBlindStatus(): void {
  if ((py.flags.status & config.player.status.PY_BLIND) !== 0) {
    putString('Blind', { y: 23, x: 7 });
  } else {
    putString(blanks(5), { y: 23, x: 7 });
  }
}

// Prints Confusion status -RAK-
export function printCharacterConfusedState(): void {
  if ((py.flags.status & config.player.status.PY_CONFUSED) !== 0) {
    putString('Confused', { y: 23, x: 13 });
  } else {
    putString(blanks(8), { y: 23, x: 13 });
  }
}

// Prints Fear status -RAK-
export function printCharacterFearState(): void {
  if ((py.flags.status & config.player.status.PY_FEAR) !== 0) {
    putString('Afraid', { y: 23, x: 22 });
  } else {
    putString(blanks(6), { y: 23, x: 22 });
  }
}

// Prints Poisoned status -RAK-
export function printCharacterPoisonedState(): void {
  if ((py.flags.status & config.player.status.PY_POISONED) !== 0) {
    putString('Poisoned', { y: 23, x: 29 });
  } else {
    putString(blanks(8), { y: 23, x: 29 });
  }
}

// Prints Searching, Resting, Paralysis, or 'count' status -RAK-
export function printCharacterMovementState(): void {
  py.flags.status &= ~config.player.status.PY_REPEAT;

  if (py.flags.paralysis > 1) {
    putString('Paralysed', { y: 23, x: 38 });
    return;
  }

  if ((py.flags.status & config.player.status.PY_REST) !== 0) {
    let rest_string: string;

    if (py.flags.rest < 0) {
      rest_string = 'Rest *';
    } else if (config.options.display_counts) {
      rest_string = sprintf('Rest %-5d', py.flags.rest);
    } else {
      rest_string = 'Rest';
    }

    putString(rest_string, { y: 23, x: 38 });

    return;
  }

  if (game.command_count > 0) {
    let repeat_string: string;

    if (config.options.display_counts) {
      repeat_string = sprintf('Repeat %-3d', game.command_count);
    } else {
      repeat_string = 'Repeat';
    }

    py.flags.status |= config.player.status.PY_REPEAT;

    putString(repeat_string, { y: 23, x: 38 });

    if ((py.flags.status & config.player.status.PY_SEARCH) !== 0) {
      putString('Search', { y: 23, x: 38 });
    }

    return;
  }

  if ((py.flags.status & config.player.status.PY_SEARCH) !== 0) {
    putString('Searching', { y: 23, x: 38 });
    return;
  }

  // "repeat 999" is 10 characters
  putString(blanks(10), { y: 23, x: 38 });
}

// Prints the speed of a character. -CJS-
export function printCharacterSpeed(): void {
  let speed = py.flags.speed;

  // Search mode.
  if ((py.flags.status & config.player.status.PY_SEARCH) !== 0) {
    speed--;
  }

  if (speed > 1) {
    putString('Very Slow', { y: 23, x: 49 });
  } else if (speed === 1) {
    putString('Slow     ', { y: 23, x: 49 });
  } else if (speed === 0) {
    putString(blanks(9), { y: 23, x: 49 });
  } else if (speed === -1) {
    putString('Fast     ', { y: 23, x: 49 });
  } else {
    putString('Very Fast', { y: 23, x: 49 });
  }
}

export function printCharacterStudyInstruction(): void {
  py.flags.status &= ~config.player.status.PY_STUDY;

  if (py.flags.new_spells_to_learn === 0) {
    putString(blanks(5), { y: 23, x: 59 });
  } else {
    putString('Study', { y: 23, x: 59 });
  }
}

// Prints winner status on display -RAK-
export function printCharacterWinner(): void {
  if ((game.noscore & 0x2) !== 0) {
    if (game.wizard_mode) {
      putString('Is wizard  ', { y: 22, x: 0 });
    } else {
      putString('Was wizard ', { y: 22, x: 0 });
    }
  } else if ((game.noscore & 0x1) !== 0) {
    putString('Resurrected', { y: 22, x: 0 });
  } else if ((game.noscore & 0x4) !== 0) {
    putString('Duplicate', { y: 22, x: 0 });
  } else if (game.total_winner) {
    putString('*Winner*   ', { y: 22, x: 0 });
  }
}

// Prints character-screen info -RAK-
export function printCharacterStatsBlock(): void {
  printCharacterInfoInField(character_races[py.misc.race_id].name, { y: 2, x: STAT_COLUMN });
  printCharacterInfoInField(classes[py.misc.class_id].title, { y: 3, x: STAT_COLUMN });
  printCharacterInfoInField(playerRankTitle(), { y: 4, x: STAT_COLUMN });

  for (let i = 0; i < 6; i++) {
    displayCharacterStats(i);
  }

  printHeaderNumber('LEV ', py.misc.level, { y: 13, x: STAT_COLUMN });
  printHeaderLongNumber('EXP ', py.misc.exp, { y: 14, x: STAT_COLUMN });
  printHeaderNumber('MANA', py.misc.current_mana, { y: 15, x: STAT_COLUMN });
  printHeaderNumber('MHP ', py.misc.max_hp, { y: 16, x: STAT_COLUMN });
  printHeaderNumber('CHP ', py.misc.current_hp, { y: 17, x: STAT_COLUMN });
  printHeaderNumber('AC  ', py.misc.display_ac, { y: 19, x: STAT_COLUMN });
  printHeaderLongNumber('GOLD', py.misc.au, { y: 20, x: STAT_COLUMN });
  printCharacterWinner();

  const status = py.flags.status;

  if (((config.player.status.PY_HUNGRY | config.player.status.PY_WEAK) & status) !== 0) {
    printCharacterHungerStatus();
  }

  if ((status & config.player.status.PY_BLIND) !== 0) {
    printCharacterBlindStatus();
  }

  if ((status & config.player.status.PY_CONFUSED) !== 0) {
    printCharacterConfusedState();
  }

  if ((status & config.player.status.PY_FEAR) !== 0) {
    printCharacterFearState();
  }

  if ((status & config.player.status.PY_POISONED) !== 0) {
    printCharacterPoisonedState();
  }

  if (((config.player.status.PY_SEARCH | config.player.status.PY_REST) & status) !== 0) {
    printCharacterMovementState();
  }

  // if speed non zero, print it, modify speed if Searching
  const speed = i16(py.flags.speed - i16((status & config.player.status.PY_SEARCH) >>> 8));
  if (speed !== 0) {
    printCharacterSpeed();
  }

  // display the study field
  printCharacterStudyInstruction();
}

// Prints the following information on the screen. -JWT-
export async function printCharacterInformation(): Promise<void> {
  await clearScreen();

  putString('Name        :', { y: 2, x: 1 });
  putString('Race        :', { y: 3, x: 1 });
  putString('Sex         :', { y: 4, x: 1 });
  putString('Class       :', { y: 5, x: 1 });

  if (!game.character_generated) {
    return;
  }

  putString(py.misc.name, { y: 2, x: 15 });
  putString(character_races[py.misc.race_id].name, { y: 3, x: 15 });
  putString((playerGetGenderLabel()), { y: 4, x: 15 });
  putString(classes[py.misc.class_id].title, { y: 5, x: 15 });
}

// Prints the following information on the screen. -JWT-
export function printCharacterStats(): void {
  for (let i = 0; i < 6; i++) {
    const buf = ref('');

    statsAsString(py.stats.used[i], buf);
    putString(stat_names[i], { y: 2 + i, x: 61 });
    putString(buf.v, { y: 2 + i, x: 66 });

    if (py.stats.max[i] > py.stats.current[i]) {
      statsAsString(py.stats.max[i], buf);
      putString(buf.v, { y: 2 + i, x: 73 });
    }
  }

  printHeaderNumber('+ To Hit    ', py.misc.display_to_hit, { y: 9, x: 1 });
  printHeaderNumber('+ To Damage ', py.misc.display_to_damage, { y: 10, x: 1 });
  printHeaderNumber('+ To AC     ', py.misc.display_to_ac, { y: 11, x: 1 });
  printHeaderNumber('  Total AC  ', py.misc.display_ac, { y: 12, x: 1 });
}

// Returns a rating of x depending on y -JWT-
export function statRating(coord: Coord_t): string {
  switch (idiv(coord.x, coord.y) | 0) {
    case -3:
    case -2:
    case -1:
      return 'Very Bad';
    case 0:
    case 1:
      return 'Bad';
    case 2:
      return 'Poor';
    case 3:
    case 4:
      return 'Fair';
    case 5:
      return 'Good';
    case 6:
      return 'Very Good';
    case 7:
    case 8:
      return 'Excellent';
    default:
      return 'Superb';
  }
}

// Prints age, height, weight, and SC -JWT-
export function printCharacterVitalStatistics(): void {
  printHeaderNumber('Age          ', py.misc.age, { y: 2, x: 38 });
  printHeaderNumber('Height       ', py.misc.height, { y: 3, x: 38 });
  printHeaderNumber('Weight       ', py.misc.weight, { y: 4, x: 38 });
  printHeaderNumber('Social Class ', py.misc.social_class, { y: 5, x: 38 });
}

// Prints the following information on the screen. -JWT-
export async function printCharacterLevelExperience(): Promise<void> {
  printHeaderLongNumber7Spaces('Level      ', py.misc.level, { y: 9, x: 28 });
  printHeaderLongNumber7Spaces('Experience ', py.misc.exp, { y: 10, x: 28 });
  printHeaderLongNumber7Spaces('Max Exp    ', py.misc.max_exp, { y: 11, x: 28 });

  if (py.misc.level >= PLAYER_MAX_LEVEL) {
    await putStringClearToEOL('Exp to Adv.: *******', { y: 12, x: 28 });
  } else {
    // uint32_t arithmetic (base_exp_levels), cast to int32_t
    printHeaderLongNumber7Spaces('Exp to Adv.', idiv(py.base_exp_levels[py.misc.level - 1] * py.misc.experience_factor, 100) | 0, { y: 12, x: 28 });
  }

  printHeaderLongNumber7Spaces('Gold       ', py.misc.au, { y: 13, x: 28 });
  printHeaderNumber('Max Hit Points ', py.misc.max_hp, { y: 9, x: 52 });
  printHeaderNumber('Cur Hit Points ', py.misc.current_hp, { y: 10, x: 52 });
  printHeaderNumber('Max Mana       ', py.misc.mana, { y: 11, x: 52 });
  printHeaderNumber('Cur Mana       ', py.misc.current_mana, { y: 12, x: 52 });
}

// Prints ratings on certain abilities -RAK-
export function printCharacterAbilities(): void {
  clearToBottom(14);

  const xbth = py.misc.bth + py.misc.plusses_to_hit * BTH_PER_PLUS_TO_HIT_ADJUST + (class_level_adj[py.misc.class_id][PlayerClassLevelAdj.BTH] * py.misc.level);
  const xbthb = py.misc.bth_with_bows + py.misc.plusses_to_hit * BTH_PER_PLUS_TO_HIT_ADJUST + (class_level_adj[py.misc.class_id][PlayerClassLevelAdj.BTHB] * py.misc.level);

  // this results in a range from 0 to 29
  let xfos = 40 - py.misc.fos;
  if (xfos < 0) {
    xfos = 0;
  }

  const xsrh = py.misc.chance_in_search;

  // this results in a range from 0 to 9
  const xstl = py.misc.stealth_factor + 1;
  const xdis = py.misc.disarm + 2 * playerDisarmAdjustment() + playerStatAdjustmentWisdomIntelligence(PlayerAttr.A_INT) +
    idiv(class_level_adj[py.misc.class_id][PlayerClassLevelAdj.DISARM] * py.misc.level, 3);
  const xsave =
    py.misc.saving_throw + playerStatAdjustmentWisdomIntelligence(PlayerAttr.A_WIS) + idiv(class_level_adj[py.misc.class_id][PlayerClassLevelAdj.SAVE] * py.misc.level, 3);
  const xdev =
    py.misc.saving_throw + playerStatAdjustmentWisdomIntelligence(PlayerAttr.A_INT) + idiv(class_level_adj[py.misc.class_id][PlayerClassLevelAdj.DEVICE] * py.misc.level, 3);

  const xinfra = sprintf('%d feet', py.flags.see_infra * 10);

  putString('(Miscellaneous Abilities)', { y: 15, x: 25 });
  putString('Fighting    :', { y: 16, x: 1 });
  putString(statRating({ y: 12, x: xbth }), { y: 16, x: 15 });
  putString('Bows/Throw  :', { y: 17, x: 1 });
  putString(statRating({ y: 12, x: xbthb }), { y: 17, x: 15 });
  putString('Saving Throw:', { y: 18, x: 1 });
  putString(statRating({ y: 6, x: xsave }), { y: 18, x: 15 });

  putString('Stealth     :', { y: 16, x: 28 });
  putString(statRating({ y: 1, x: xstl }), { y: 16, x: 42 });
  putString('Disarming   :', { y: 17, x: 28 });
  putString(statRating({ y: 8, x: xdis }), { y: 17, x: 42 });
  putString('Magic Device:', { y: 18, x: 28 });
  putString(statRating({ y: 6, x: xdev }), { y: 18, x: 42 });

  putString('Perception  :', { y: 16, x: 55 });
  putString(statRating({ y: 3, x: xfos }), { y: 16, x: 69 });
  putString('Searching   :', { y: 17, x: 55 });
  putString(statRating({ y: 6, x: xsrh }), { y: 17, x: 69 });
  putString('Infra-Vision:', { y: 18, x: 55 });
  putString(xinfra, { y: 18, x: 69 });
}

// Used to display the character on the screen. -RAK-
export async function printCharacter(): Promise<void> {
  await printCharacterInformation();
  printCharacterVitalStatistics();
  printCharacterStats();
  await printCharacterLevelExperience();
  printCharacterAbilities();
}

// Gets a name for the character -JWT-
export async function getCharacterName(): Promise<void> {
  await putStringClearToEOL("Enter your player's name  [press <RETURN> when finished]", { y: 21, x: 2 });

  putString(blanks(23), { y: 2, x: 15 });

  const name = ref(py.misc.name);
  const entered = await getStringInput(name, { y: 2, x: 15 }, 23);
  py.misc.name = name.v;
  if (!entered || py.misc.name.length === 0) {
    getDefaultPlayerName(name);
    py.misc.name = name.v;
    putString(py.misc.name, { y: 2, x: 15 });
  }

  clearToBottom(20);
}

// Changes the name of the character -JWT-
export async function changeCharacterName(): Promise<void> {
  const temp = ref('');
  let flag = false;

  await printCharacter();

  while (!flag) {
    await putStringClearToEOL('<f>ile character description. <c>hange character name.', { y: 21, x: 2 });

    switch (await getKeyInput()) {
      case 'c':
        await getCharacterName();
        flag = true;
        break;
      case 'f':
        await putStringClearToEOL('File name:', { y: 0, x: 0 });

        if ((await getStringInput(temp, { y: 0, x: 10 }, 60)) && (temp.v.length !== 0)) {
          if (await outputPlayerCharacterToFile(temp.v)) {
            flag = true;
          }
        }
        break;
      case ESCAPE:
      case ' ':
      case '\n':
      case '\r':
        flag = true;
        break;
      default:
        await terminalBellSound();
        break;
    }
  }
}

// Print list of spells -RAK-
// if non_consecutive is  -1: spells numbered consecutively from 'a' to 'a'+num
//                       >=0: spells numbered by offset from non_consecutive
export async function displaySpellsList(spell_ids: readonly number[], number_of_choices: number, comment: boolean, non_consecutive: number): Promise<void> {
  let col: number;
  if (comment) {
    col = 22;
  } else {
    col = 31;
  }

  let consecutive_offset: number;
  if (classes[py.misc.class_id].class_to_use_mage_spells === config.spells.SPELL_TYPE_MAGE) {
    consecutive_offset = config.spells.NAME_OFFSET_SPELLS;
  } else {
    consecutive_offset = config.spells.NAME_OFFSET_PRAYERS;
  }

  await eraseLine({ y: 1, x: col });
  putString('Name', { y: 1, x: col + 5 });
  putString('Lv Mana Fail', { y: 1, x: col + 35 });

  // only show the first 22 choices
  if (number_of_choices > 22) {
    number_of_choices = 22;
  }

  for (let i = 0; i < number_of_choices; i++) {
    const spell_id = spell_ids[i];
    const spell = magic_spells[py.misc.class_id - 1][spell_id];

    let p: string;
    if (!comment) {
      p = '';
    } else if ((py.flags.spells_forgotten & (1 << spell_id)) !== 0) {
      p = ' forgotten';
    } else if ((py.flags.spells_learnt & (1 << spell_id)) === 0) {
      p = ' unknown';
    } else if ((py.flags.spells_worked & (1 << spell_id)) === 0) {
      p = ' untried';
    } else {
      p = '';
    }

    // determine whether or not to leave holes in character choices, non_consecutive -1
    // when learning spells, consecutive_offset>=0 when asking which spell to cast.
    let spell_char: string;
    if (non_consecutive === -1) {
      spell_char = chr(97 + i); // 'a' + i
    } else {
      spell_char = chr(97 + spell_id - non_consecutive); // 'a' + spell_id - non_consecutive
    }

    const out_val = sprintf('  %c) %-30s%2d %4d %3d%%%s', spell_char, spell_names[spell_id + consecutive_offset], spell.level_required, spell.mana_required,
      spellChanceOfSuccess(spell_id), p);
    await putStringClearToEOL(out_val, { y: 2 + i, x: col });
  }
}

// Increases hit points and level -RAK-
async function playerGainLevel(): Promise<void> {
  py.misc.level++;

  const msg = sprintf('Welcome to level %d.', py.misc.level);
  await printMessage(msg);

  playerCalculateHitPoints();

  // uint32_t arithmetic (base_exp_levels), stored in an int32_t
  const new_exp = idiv(py.base_exp_levels[py.misc.level - 1] * py.misc.experience_factor, 100) | 0;

  if (py.misc.exp > new_exp) {
    // lose some of the 'extra' exp when gaining several levels at once
    const dif_exp = py.misc.exp - new_exp;
    py.misc.exp = new_exp + idiv(dif_exp, 2);
  }

  printCharacterLevel();
  printCharacterTitle();

  const player_class = classes[py.misc.class_id];

  if (player_class.class_to_use_mage_spells === config.spells.SPELL_TYPE_MAGE) {
    await playerCalculateAllowedSpellsCount(PlayerAttr.A_INT);
    playerGainMana(PlayerAttr.A_INT);
  } else if (player_class.class_to_use_mage_spells === config.spells.SPELL_TYPE_PRIEST) {
    await playerCalculateAllowedSpellsCount(PlayerAttr.A_WIS);
    playerGainMana(PlayerAttr.A_WIS);
  }
}

// Prints experience -RAK-
export async function displayCharacterExperience(): Promise<void> {
  if (py.misc.exp > config.player.PLAYER_MAX_EXP) {
    py.misc.exp = config.player.PLAYER_MAX_EXP;
  }

  while ((py.misc.level < PLAYER_MAX_LEVEL) && (idiv(py.base_exp_levels[py.misc.level - 1] * py.misc.experience_factor, 100) | 0) <= py.misc.exp) {
    await playerGainLevel();
  }

  if (py.misc.exp > py.misc.max_exp) {
    py.misc.max_exp = py.misc.exp;
  }

  printLongNumber(py.misc.exp, { y: 14, x: STAT_COLUMN + 6 });
}
