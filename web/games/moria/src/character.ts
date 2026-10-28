// character.cpp: Generate a new player character
import { config } from './config.ts';
import { ESCAPE, PLAYER_MAX_CLASSES, PLAYER_MAX_LEVEL, PLAYER_MAX_RACES, PlayerAttr } from './constants.ts';
import { character_backgrounds, character_races, classes } from './data_player.ts';
import { exitProgram, randomNumber, randomNumberNormalDistribution } from './game.ts';
import { displayTextHelpFile } from './game_files.ts';
import { py } from './globals.ts';
import { idiv, ord, sprintf, u8 } from './libc.ts';
import { playerIsMale, playerSetGender } from './player.ts';
import {
  playerArmorClassAdjustment, playerDamageAdjustment, playerDisarmAdjustment, playerSetAndUseStat, playerStatAdjustmentConstitution,
  playerToHitAdjustment,
} from './player_stats.ts';
import {
  getCharacterName, printCharacterAbilities, printCharacterInformation, printCharacterLevelExperience, printCharacterStats,
  printCharacterVitalStatistics,
} from './ui.ts';
import { clearToBottom, eraseLine, getKeyInput, moveCursor, putString, putStringClearToEOL, terminalBellSound } from './ui_io.ts';

// Generates character's stats -JWT-
function characterGenerateStats(): void {
  let total: number;
  const dice = new Array<number>(18).fill(0);

  do {
    total = 0;
    for (let i = 0; i < 18; i++) {
      // Roll 3,4,5 sided dice once each
      dice[i] = randomNumber(3 + (i % 3));
      total += dice[i];
    }
  } while (total <= 42 || total >= 54);

  for (let i = 0; i < 6; i++) {
    py.stats.max[i] = u8(5 + dice[3 * i] + dice[3 * i + 1] + dice[3 * i + 2]);
  }
}

function decrementStat(adjustment: number, current_stat: number): number {
  let stat = current_stat; // uint8_t
  for (let i = 0; i > adjustment; i--) {
    if (stat > 108) {
      stat = u8(stat - 1);
    } else if (stat > 88) {
      stat = u8(stat + (-randomNumber(6) - 2));
    } else if (stat > 18) {
      stat = u8(stat + (-randomNumber(15) - 5));
      if (stat < 18) {
        stat = 18;
      }
    } else if (stat > 3) {
      stat = u8(stat - 1);
    }
  }
  return stat;
}

function incrementStat(adjustment: number, current_stat: number): number {
  let stat = current_stat; // uint8_t
  for (let i = 0; i < adjustment; i++) {
    if (stat < 18) {
      stat = u8(stat + 1);
    } else if (stat < 88) {
      stat = u8(stat + randomNumber(15) + 5);
    } else if (stat < 108) {
      stat = u8(stat + randomNumber(6) + 2);
    } else if (stat < 118) {
      stat = u8(stat + 1);
    }
  }
  return stat;
}

// Changes stats by given amount -JWT-
// During character creation we adjust player stats based
// on their Race and Class...with a little randomness!
function createModifyPlayerStat(stat: number, adjustment: number): number {
  if (adjustment < 0) {
    return decrementStat(adjustment, stat);
  }
  return incrementStat(adjustment, stat);
}

// generate all stats and modify for race. needed in a separate
// module so looping of character selection would be allowed -RGM-
async function characterGenerateStatsAndRace(): Promise<void> {
  const race = character_races[py.misc.race_id];

  characterGenerateStats();
  py.stats.max[PlayerAttr.A_STR] = createModifyPlayerStat(py.stats.max[PlayerAttr.A_STR], race.str_adjustment);
  py.stats.max[PlayerAttr.A_INT] = createModifyPlayerStat(py.stats.max[PlayerAttr.A_INT], race.int_adjustment);
  py.stats.max[PlayerAttr.A_WIS] = createModifyPlayerStat(py.stats.max[PlayerAttr.A_WIS], race.wis_adjustment);
  py.stats.max[PlayerAttr.A_DEX] = createModifyPlayerStat(py.stats.max[PlayerAttr.A_DEX], race.dex_adjustment);
  py.stats.max[PlayerAttr.A_CON] = createModifyPlayerStat(py.stats.max[PlayerAttr.A_CON], race.con_adjustment);
  py.stats.max[PlayerAttr.A_CHR] = createModifyPlayerStat(py.stats.max[PlayerAttr.A_CHR], race.chr_adjustment);

  py.misc.level = 1;

  for (let i = 0; i < 6; i++) {
    py.stats.current[i] = py.stats.max[i];
    await playerSetAndUseStat(i);
  }

  py.misc.chance_in_search = race.search_chance_base;
  py.misc.bth = race.base_to_hit;
  py.misc.bth_with_bows = race.base_to_hit_bows;
  py.misc.fos = race.fos;
  py.misc.stealth_factor = race.stealth;
  py.misc.saving_throw = race.saving_throw_base;
  py.misc.hit_die = race.hit_points_base;
  py.misc.plusses_to_damage = playerDamageAdjustment();
  py.misc.plusses_to_hit = playerToHitAdjustment();
  py.misc.magical_ac = 0;
  py.misc.ac = playerArmorClassAdjustment();
  py.misc.experience_factor = race.exp_factor_base;
  py.flags.see_infra = race.infra_vision;
}

// Prints a list of the available races: Human, Elf, etc.,
// shown during the character creation screens.
function displayCharacterRaces(): void {
  clearToBottom(20);
  putString('Choose a race (? for Help):', { y: 20, x: 2 });

  const coord = { y: 21, x: 2 };

  for (let i = 0; i < PLAYER_MAX_RACES; i++) {
    const description = sprintf('%c) %s', i + ord('a'), character_races[i].name);
    putString(description, coord);

    coord.x += 15;
    if (coord.x > 70) {
      coord.x = 2;
      coord.y++;
    }
  }
}

// Allows player to select a race -JWT-
async function characterChooseRace(): Promise<void> {
  displayCharacterRaces();

  let id: number;
  while (true) {
    moveCursor({ y: 20, x: 30 });
    const key = await getKeyInput();

    id = ord(key) - 97; // ASCII `a`, setting id between 0 and 7
    if (id >= 0 && id < PLAYER_MAX_RACES) {
      break;
    } else if (key === '?') {
      await displayTextHelpFile(config.files.welcome_screen);
    } else {
      await terminalBellSound();
    }
  }
  py.misc.race_id = id;

  putString(character_races[id].name, { y: 3, x: 15 });
}

// Will print the history of a character -JWT-
async function displayCharacterHistory(): Promise<void> {
  putString('Character Background', { y: 14, x: 27 });

  for (let i = 0; i < 4; i++) {
    await putStringClearToEOL(py.misc.history[i], { y: i + 15, x: 10 });
  }
}

// Clear the previous history strings
function playerClearHistory(): void {
  for (let i = 0; i < py.misc.history.length; i++) {
    py.misc.history[i] = '';
  }
}

// Get the racial history, determines social class -RAK-
//
// Assumptions:
//   - Each race has init history beginning at (race-1)*3+1
//   - All history parts are in ascending order
function characterGetHistory(): void {
  let history_id = py.misc.race_id * 3 + 1;
  let social_class = randomNumber(4);

  let history_block = '';

  let background_id = 0;

  // Get a block of history text
  do {
    let flag = false;
    while (!flag) {
      if (character_backgrounds[background_id].chart === history_id) {
        const test_roll = randomNumber(100);

        while (test_roll > character_backgrounds[background_id].roll) {
          background_id++;
        }

        const background = character_backgrounds[background_id];

        history_block += background.info;
        social_class += background.bonus - 50;

        if (history_id > background.next) {
          background_id = 0;
        }

        history_id = background.next;
        flag = true;
      } else {
        background_id++;
      }
    }
  } while (history_id >= 1);

  playerClearHistory();

  // the character of history_block at an index ('\0' past its end)
  const at = (i: number): string => (i >= 0 && i < history_block.length ? history_block[i] : '\0');

  // Process block of history text for pretty output
  let cursor_start = 0;
  let cursor_end = history_block.length - 1;
  while (at(cursor_end) === ' ') {
    cursor_end--;
  }

  let line_number = 0;
  let new_cursor_start = 0;
  let current_cursor_position = 0;

  let flag = false;
  while (!flag) {
    while (at(cursor_start) === ' ') {
      cursor_start++;
    }

    current_cursor_position = cursor_end - cursor_start + 1;

    if (current_cursor_position > 60) {
      current_cursor_position = 60;

      while (at(cursor_start + current_cursor_position - 1) !== ' ') {
        current_cursor_position--;
      }

      new_cursor_start = cursor_start + current_cursor_position;

      while (at(cursor_start + current_cursor_position - 1) === ' ') {
        current_cursor_position--;
      }
    } else {
      flag = true;
    }

    // strncpy(py.misc.history[line_number], &history_block[cursor_start], current_cursor_position) + terminator
    py.misc.history[line_number] = history_block.slice(cursor_start, cursor_start + current_cursor_position);

    line_number++;
    cursor_start = new_cursor_start;
  }

  // Compute social class for player
  if (social_class > 100) {
    social_class = 100;
  } else if (social_class < 1) {
    social_class = 1;
  }

  py.misc.social_class = social_class;
}

// Gets the character's gender -JWT-
async function characterSetGender(): Promise<void> {
  clearToBottom(20);
  putString('Choose a sex (? for Help):', { y: 20, x: 2 });
  putString('m) Male       f) Female', { y: 21, x: 2 });

  while (true) {
    moveCursor({ y: 20, x: 29 });
    const key = await getKeyInput();

    if (key === 'f' || key === 'F') {
      playerSetGender(false);
      putString('Female', { y: 4, x: 15 });
      break;
    } else if (key === 'm' || key === 'M') {
      playerSetGender(true);
      putString('Male', { y: 4, x: 15 });
      break;
    } else if (key === '?') {
      await displayTextHelpFile(config.files.welcome_screen);
    } else {
      await terminalBellSound();
    }
  }
}

// Computes character's age, height, and weight -JWT-
function characterSetAgeHeightWeight(): void {
  const race = character_races[py.misc.race_id];

  py.misc.age = race.base_age + randomNumber(race.max_age);

  let height_base: number, height_mod: number, weight_base: number, weight_mod: number;
  if (playerIsMale()) {
    height_base = race.male_height_base;
    height_mod = race.male_height_mod;
    weight_base = race.male_weight_base;
    weight_mod = race.male_weight_mod;
  } else {
    height_base = race.female_height_base;
    height_mod = race.female_height_mod;
    weight_base = race.female_weight_base;
    weight_mod = race.female_weight_mod;
  }

  py.misc.height = randomNumberNormalDistribution(height_base, height_mod);
  py.misc.weight = randomNumberNormalDistribution(weight_base, weight_mod);
  py.misc.disarm = race.disarm_chance_base + playerDisarmAdjustment();
}

// Prints the classes for a given race: Rogue, Mage, Priest, etc.,
// shown during the character creation screens.
function displayRaceClasses(race_id: number, class_list: Uint8Array): number {
  const coord = { y: 21, x: 2 };

  let class_id = 0;

  let description: string;
  let mask = 0x1; // uint32_t

  clearToBottom(20);
  putString('Choose a class (? for Help):', { y: 20, x: 2 });

  for (let i = 0; i < PLAYER_MAX_CLASSES; i++) {
    if ((character_races[race_id].classes_bit_field & mask) !== 0) {
      description = sprintf('%c) %s', class_id + ord('a'), classes[i].title);
      putString(description, coord);
      class_list[class_id] = i;

      coord.x += 15;
      if (coord.x > 70) {
        coord.x = 2;
        coord.y++;
      }
      class_id++;
    }
    mask = (mask << 1) >>> 0;
  }

  return class_id;
}

async function generateCharacterClass(class_id: number): Promise<void> {
  py.misc.class_id = class_id;

  const klass = classes[py.misc.class_id];

  clearToBottom(20);
  putString(klass.title, { y: 5, x: 15 });

  // Adjust the stats for the class adjustment -RAK-
  py.stats.max[PlayerAttr.A_STR] = createModifyPlayerStat(py.stats.max[PlayerAttr.A_STR], klass.strength);
  py.stats.max[PlayerAttr.A_INT] = createModifyPlayerStat(py.stats.max[PlayerAttr.A_INT], klass.intelligence);
  py.stats.max[PlayerAttr.A_WIS] = createModifyPlayerStat(py.stats.max[PlayerAttr.A_WIS], klass.wisdom);
  py.stats.max[PlayerAttr.A_DEX] = createModifyPlayerStat(py.stats.max[PlayerAttr.A_DEX], klass.dexterity);
  py.stats.max[PlayerAttr.A_CON] = createModifyPlayerStat(py.stats.max[PlayerAttr.A_CON], klass.constitution);
  py.stats.max[PlayerAttr.A_CHR] = createModifyPlayerStat(py.stats.max[PlayerAttr.A_CHR], klass.charisma);

  for (let i = 0; i < 6; i++) {
    py.stats.current[i] = py.stats.max[i];
    await playerSetAndUseStat(i);
  }

  // Real values
  py.misc.plusses_to_damage = playerDamageAdjustment();
  py.misc.plusses_to_hit = playerToHitAdjustment();
  py.misc.magical_ac = playerArmorClassAdjustment();
  py.misc.ac = 0;

  // Displayed values
  py.misc.display_to_damage = py.misc.plusses_to_damage;
  py.misc.display_to_hit = py.misc.plusses_to_hit;
  py.misc.display_to_ac = py.misc.magical_ac;
  py.misc.display_ac = py.misc.ac + py.misc.display_to_ac;

  // now set misc stats, do this after setting stats because of playerStatAdjustmentConstitution() for hit-points
  py.misc.hit_die += klass.hit_points;
  py.misc.max_hp = playerStatAdjustmentConstitution() + py.misc.hit_die;
  py.misc.current_hp = py.misc.max_hp;
  py.misc.current_hp_fraction = 0;

  // Initialize hit_points array.
  // Put bounds on total possible hp, only succeed
  // if it is within 1/8 of average value.
  const min_value = (idiv(PLAYER_MAX_LEVEL * 3, 8) * (py.misc.hit_die - 1)) + PLAYER_MAX_LEVEL;
  const max_value = (idiv(PLAYER_MAX_LEVEL * 5, 8) * (py.misc.hit_die - 1)) + PLAYER_MAX_LEVEL;
  py.base_hp_levels[0] = py.misc.hit_die;

  do {
    for (let i = 1; i < PLAYER_MAX_LEVEL; i++) {
      py.base_hp_levels[i] = randomNumber(py.misc.hit_die);
      py.base_hp_levels[i] += py.base_hp_levels[i - 1];
    }
  } while (py.base_hp_levels[PLAYER_MAX_LEVEL - 1] < min_value || py.base_hp_levels[PLAYER_MAX_LEVEL - 1] > max_value);

  py.misc.bth += klass.base_to_hit;
  py.misc.bth_with_bows += klass.base_to_hit_with_bows; // RAK
  py.misc.chance_in_search += klass.searching;
  py.misc.disarm += klass.disarm_traps;
  py.misc.fos += klass.fos;
  py.misc.stealth_factor += klass.stealth;
  py.misc.saving_throw += klass.saving_throw;
  py.misc.experience_factor += klass.experience_factor;
}

// Gets a character class -JWT-
async function characterGetClass(): Promise<void> {
  const class_list = new Uint8Array(PLAYER_MAX_CLASSES);
  for (let i = 0; i < class_list.length; i++) {
    class_list[i] = 0;
  }
  const class_count = displayRaceClasses(py.misc.race_id, class_list);

  // Reset the class ID
  py.misc.class_id = 0;

  while (true) {
    moveCursor({ y: 20, x: 31 });
    const key = await getKeyInput();

    const id = ord(key) - 97; // ASCII `a`, setting id to 0-5
    if (id >= 0 && id < class_count) {
      await generateCharacterClass(class_list[id]);
      break;
    } else if (key === '?') {
      await displayTextHelpFile(config.files.welcome_screen);
    } else {
      await terminalBellSound();
    }
  }
}

// Given a stat value, return a monetary value,
// which affects the amount of gold a player has.
function monetaryValueCalculatedFromStat(stat: number): number {
  return 5 * (stat - 10);
}

function playerCalculateStartGold(): void {
  let value = monetaryValueCalculatedFromStat(py.stats.max[PlayerAttr.A_STR]);
  value += monetaryValueCalculatedFromStat(py.stats.max[PlayerAttr.A_INT]);
  value += monetaryValueCalculatedFromStat(py.stats.max[PlayerAttr.A_WIS]);
  value += monetaryValueCalculatedFromStat(py.stats.max[PlayerAttr.A_CON]);
  value += monetaryValueCalculatedFromStat(py.stats.max[PlayerAttr.A_DEX]);

  // Social Class adjustment
  let new_gold = py.misc.social_class * 6 + randomNumber(25) + 325;

  // Stat adjustment
  new_gold -= value;

  // Charisma adjustment
  new_gold += monetaryValueCalculatedFromStat(py.stats.max[PlayerAttr.A_CHR]);

  // She charmed the banker into it! -CJS-
  if (!playerIsMale()) {
    new_gold += 50;
  }

  // Minimum
  if (new_gold < 80) {
    new_gold = 80;
  }

  py.misc.au = new_gold;
}

// Main Character Creation Routine -JWT-
export async function characterCreate(): Promise<void> {
  await printCharacterInformation();
  await characterChooseRace();
  await characterSetGender();

  // here we start a loop giving a player a choice of characters -RGM-
  let done = false;
  while (!done) {
    await characterGenerateStatsAndRace();
    characterGetHistory();
    characterSetAgeHeightWeight();
    await displayCharacterHistory();
    printCharacterVitalStatistics();
    printCharacterStats();

    clearToBottom(20);
    putString('Hit space to re-roll or ESC to accept characteristics: ', { y: 20, x: 2 });

    while (true) {
      const key = await getKeyInput();
      if (key === ESCAPE) {
        done = true;
        break;
      } else if (key === ' ') {
        break;
      } else {
        await terminalBellSound();
      }
    }
  }

  await characterGetClass();
  playerCalculateStartGold();
  printCharacterStats();
  await printCharacterLevelExperience();
  printCharacterAbilities();
  await getCharacterName();

  await putStringClearToEOL('[ press any key to continue, or Q to exit ]', { y: 23, x: 17 });
  if ((await getKeyInput()) === 'Q') {
    await exitProgram();
  }
  await eraseLine({ y: 23, x: 0 });
}
