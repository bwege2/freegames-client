// game.cpp: Game initialization and maintenance related functions
import { config } from './config.ts';
import { CURRENT_VERSION_MAJOR, CURRENT_VERSION_MINOR, CURRENT_VERSION_PATCH, ESCAPE, NORMAL_TABLE_SD, NORMAL_TABLE_SIZE, SHRT_MAX } from './constants.ts';
import { normal_table } from './data_tables.ts';
import { game, py } from './globals.ts';
import { getCurrentUnixTime } from './helpers.ts';
import { idiv, ref, type Ref, sprintf } from './libc.ts';
import { ProgramExit } from './platform.ts';
import { onReset } from './reset.ts';
import { getRandomSeed, rnd, setRandomSeed } from './rng.ts';
import { eraseLine, flushInputBuffer, getCommand, getKeyInput, moveCursor, putString, putStringClearToEOL, terminalBellSound, terminalRestore } from './ui_io.ts';

// holds the previous rnd state
let old_seed = 0;

onReset(() => {
  old_seed = 0;
});

// gets a new random seed for the random number generator
export function seedsInitialize(seed: number): void {
  let clock_var: number;

  if (seed === 0) {
    clock_var = getCurrentUnixTime();
  } else {
    clock_var = seed >>> 0;
  }

  game.magic_seed = clock_var | 0;

  clock_var = (clock_var + 8762) >>> 0;
  game.town_seed = clock_var | 0;

  clock_var = (clock_var + 113452) >>> 0;
  setRandomSeed(clock_var);

  // make it a little more random
  for (clock_var = randomNumber(100) >>> 0; clock_var !== 0; clock_var--) {
    rnd();
  }
}

// change to different random number generator state
export function seedSet(seed: number): void {
  old_seed = getRandomSeed();

  // want reproducible state here
  setRandomSeed(seed);
}

// restore the normal random generator state
export function seedResetToOldSeed(): void {
  setRandomSeed(old_seed);
}

// Generates a random integer x where 1<=X<=MAXVAL -RAK-
export function randomNumber(max: number): number {
  if (max === 0) {
    throw new Error('randomNumber(0): division by zero');
  }
  return (rnd() % max) + 1;
}

// Generates a random integer number of NORMAL distribution -RAK-
export function randomNumberNormalDistribution(mean: number, standard: number): number {
  // alternate randomNumberNormalDistribution() code, slower but much smaller since no table
  // 2 per 1,000,000 will be > 4*SD, max is 5*SD
  //
  // tmp = diceRoll(8, 99);             // mean 400, SD 81
  // tmp = (tmp - 400) * standard / 81;
  // return tmp + mean;

  const tmp = randomNumber(SHRT_MAX);

  // off scale, assign random value between 4 and 5 times SD
  if (tmp === SHRT_MAX) {
    let offset = 4 * standard + randomNumber(standard);

    // one half are negative
    if (randomNumber(2) === 1) {
      offset = -offset;
    }

    return mean + offset;
  }

  // binary search normal normal_table to get index that
  // matches tmp this takes up to 8 iterations.
  let low = 0;
  let iindex = NORMAL_TABLE_SIZE >> 1;
  let high = NORMAL_TABLE_SIZE;

  for (;;) {
    if (normal_table[iindex] === tmp || high === low + 1) {
      break;
    }

    if (normal_table[iindex] > tmp) {
      high = iindex;
      iindex = low + ((iindex - low) >> 1);
    } else {
      low = iindex;
      iindex = iindex + ((high - iindex) >> 1);
    }
  }

  // might end up one below target, check that here
  if (normal_table[iindex] < tmp) {
    iindex = iindex + 1;
  }

  // normal_table is based on SD of 64, so adjust the
  // index value here, round the half way case up.
  let offset = idiv(standard * iindex + (NORMAL_TABLE_SD >> 1), NORMAL_TABLE_SD);

  // one half should be negative
  if (randomNumber(2) === 1) {
    offset = -offset;
  }

  return mean + offset;
}

type Option = keyof typeof config.options;

const game_options: [string, Option][] = [
  ['Running: cut known corners', 'run_cut_corners'],
  ['Running: examine potential corners', 'run_examine_corners'],
  ['Running: print self during run', 'run_print_self'],
  ['Running: stop when map sector changes', 'find_bound'],
  ['Running: run through open doors', 'run_ignore_doors'],
  ['Prompt to pick up objects', 'prompt_to_pickup'],
  ['Rogue like commands', 'use_roguelike_keys'],
  ['Show weights in inventory', 'show_inventory_weights'],
  ['Highlight and notice mineral seams', 'highlight_seams'],
  ['Beep for invalid character', 'error_beep_sound'],
  ['Display rest/repeat counts', 'display_counts'],
];

// Set or unset various boolean config::options::display_counts -CJS-
export async function setGameOptions(): Promise<void> {
  await putStringClearToEOL('  ESC when finished, y/n to set options, <return> or - to move cursor', { y: 0, x: 0 });

  let max: number;
  for (max = 0; max < game_options.length; max++) {
    const str = sprintf('%-38s: %s', game_options[max][0], config.options[game_options[max][1]] ? 'yes' : 'no ');
    await putStringClearToEOL(str, { y: max + 1, x: 0 });
  }
  await eraseLine({ y: max + 1, x: 0 });

  let option_id = 0;
  for (;;) {
    moveCursor({ y: option_id + 1, x: 40 });

    switch (await getKeyInput()) {
      case ESCAPE:
        return;
      case '-':
        if (option_id > 0) {
          option_id--;
        } else {
          option_id = max - 1;
        }
        break;
      case ' ':
      case '\n':
      case '\r':
        if (option_id + 1 < max) {
          option_id++;
        } else {
          option_id = 0;
        }
        break;
      case 'y':
      case 'Y':
        putString('yes', { y: option_id + 1, x: 40 });

        config.options[game_options[option_id][1]] = true;

        if (option_id + 1 < max) {
          option_id++;
        } else {
          option_id = 0;
        }
        break;
      case 'n':
      case 'N':
        putString('no ', { y: option_id + 1, x: 40 });

        config.options[game_options[option_id][1]] = false;

        if (option_id + 1 < max) {
          option_id++;
        } else {
          option_id = 0;
        }
        break;
      default:
        await terminalBellSound();
        break;
    }
  }
}

// Support for Umoria 5.2.2 up to 5.7.x.
// The save file format was frozen as of version 5.2.2.
export function validGameVersion(major: number, minor: number, patch: number): boolean {
  if (major !== 5) {
    return false;
  }

  if (minor < 2) {
    return false;
  }

  if (minor === 2 && patch < 2) {
    return false;
  }

  return minor <= 7;
}

export function isCurrentGameVersion(major: number, minor: number, patch: number): boolean {
  return major === CURRENT_VERSION_MAJOR && minor === CURRENT_VERSION_MINOR && patch === CURRENT_VERSION_PATCH;
}

export function getRandomDirection(): number {
  let dir: number;

  do {
    dir = randomNumber(9);
  } while (dir === 5);

  return dir;
}

// map roguelike direction commands into numbers
function mapRoguelikeKeysToKeypad(command: string): string {
  switch (command) {
    case 'h':
      return '4';
    case 'y':
      return '7';
    case 'k':
      return '8';
    case 'u':
      return '9';
    case 'l':
      return '6';
    case 'n':
      return '3';
    case 'j':
      return '2';
    case 'b':
      return '1';
    case '.':
      return '5';
    default:
      return command;
  }
}

// Prompts for a direction -RAK-
// Direction memory added, for repeated commands.  -CJS
export async function getDirectionWithMemory(prompt: string | null, direction: Ref<number>): Promise<boolean> {
  // used in counted commands. -CJS-
  if (game.use_last_direction) {
    direction.v = py.prev_dir;
    return true;
  }

  if (prompt === null) {
    prompt = 'Which direction?';
  }

  const command = ref('');

  for (;;) {
    // Don't end a counted command. -CJS-
    const oldCount = game.command_count;
    if (!(await getCommand(prompt, command))) {
      game.player_free_turn = true;
      return false;
    }
    game.command_count = oldCount;

    if (config.options.use_roguelike_keys) {
      command.v = mapRoguelikeKeysToKeypad(command.v);
    }

    if (command.v >= '1' && command.v <= '9' && command.v !== '5') {
      py.prev_dir = command.v.charCodeAt(0) - 48;
      direction.v = py.prev_dir;
      return true;
    }

    await terminalBellSound();
  }
}

// Similar to getDirectionWithMemory(), except that no memory exists,
// and it is allowed to enter the null direction. -CJS-
export async function getAllDirections(prompt: string, direction: Ref<number>): Promise<boolean> {
  const command = ref('');

  for (;;) {
    if (!(await getCommand(prompt, command))) {
      game.player_free_turn = true;
      return false;
    }

    if (config.options.use_roguelike_keys) {
      command.v = mapRoguelikeKeysToKeypad(command.v);
    }

    if (command.v >= '1' && command.v <= '9') {
      direction.v = command.v.charCodeAt(0) - 48;
      return true;
    }

    await terminalBellSound();
  }
}

// Restore the terminal and exit
export async function exitProgram(): Promise<never> {
  flushInputBuffer();
  await terminalRestore();
  throw new ProgramExit(0);
}

// Abort the program with a message displayed on the terminal.
export async function abortProgram(msg: string): Promise<never> {
  flushInputBuffer();
  await terminalRestore();

  console.error(`Program was manually aborted with the message:\n${msg}`);

  throw new ProgramExit(0);
}
