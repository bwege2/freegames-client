// main.cpp: Initialization, main() function and main loop
//
// main(args) runs the program once with its command line (umoria [OPTIONS] SAVEGAME) on the platform
// set before (setPlatform), and resolves with its exit status. Every module's state is put back first,
// as a new process starts.
import { config } from './config.ts';
import { INT_MAX } from './constants.ts';
import { resetDataTables } from './data_tables.ts';
import { exitProgram } from './game.ts';
import { initializeScoreFile } from './game_files.ts';
import { startMoria } from './game_run.ts';
import { game } from './globals.ts';
import { stringToNumber } from './helpers.ts';
import { ref } from './libc.ts';
import { ProgramExit } from './platform.ts';
import { resetAll } from './reset.ts';
import { showScoresScreen } from './scores.ts';
import { checkFilePermissions, terminalInitialize, terminalRestore } from './ui_io.ts';

/** What the program prints on its standard output (the usage and version texts); the browser has none. */
export const stdout: string[] = [];

const usage_instructions = `
Usage:
    umoria [OPTIONS] SAVEGAME

SAVEGAME is an optional save game filename (default: game.sav)

Options:
    -n           Force start of new game
    -d           Display high scores and exit
    -s NUMBER    Game Seed, as a decimal number (max: 2147483647)

    -v           Print version info and exit
    -h           Display this message
`;

/** The options of config.cpp as the program starts (config.files.save_game and the options change). */
const initialOptions = { ...config.options };
const initialSaveGame = config.files.save_game;

function parseGameSeed(argv: string, seed: { v: number }): boolean {
  const value = ref(0);

  if (!stringToNumber(argv, value)) {
    return false;
  }
  if (value.v <= 0 || value.v > INT_MAX) {
    return false;
  }

  seed.v = value.v >>> 0;

  return true;
}

// Initialize, restore, and get the ball rolling. -RAK-
async function moriaMain(argv: string[]): Promise<number> {
  const seed = { v: 0 };
  let new_game = false;

  // call this routine to grab a file pointer to the high score file
  // and prepare things to relinquish setuid privileges
  if (!initializeScoreFile()) {
    stdout.push(`Can't open score file '${config.files.scores}'\n`);
    return 1;
  }

  // Make sure we have access to all files -MRC-
  if (!checkFilePermissions()) {
    return 1;
  }

  if (!terminalInitialize()) {
    return 1;
  }

  // check for user interface option
  let i = 0;
  for (; i < argv.length && argv[i][0] === '-'; i++) {
    switch (argv[i][1]) {
      case 'v':
        await terminalRestore();
        stdout.push('5.7.15\n');
        return 0;
      case 'n':
        new_game = true;
        break;
      case 'd':
        await showScoresScreen();
        await exitProgram();
        break;
      case 's':
        // No NUMBER provided?
        if (argv[i + 1] === undefined) {
          break;
        }

        // Move onto the NUMBER value
        i++;

        if (!parseGameSeed(argv[i], seed)) {
          await terminalRestore();
          stdout.push('Game seed must be a decimal number between 1 and 2147483647\n');
          return -1;
        }

        break;
      case 'w':
        game.to_be_wizard = true;
        break;
      default:
        await terminalRestore();

        stdout.push("Robert A. Koeneke's classic dungeon crawler.\n");
        stdout.push('Umoria 5.7.15 is released under a GPL v2 license.\n');
        stdout.push(usage_instructions);
        return 0;
    }
  }

  // Auto-restart of saved file
  if (i < argv.length) {
    config.files.save_game = argv[i];
  }

  await startMoria(seed.v, new_game);

  return 0;
}

/** Runs the program with its arguments; resolves with the exit status. */
export async function main(argv: string[]): Promise<number> {
  resetAll();
  resetDataTables();
  Object.assign(config.options, initialOptions);
  config.files.save_game = initialSaveGame;
  stdout.length = 0;
  try {
    return await moriaMain(argv);
  } catch (e) {
    if (e instanceof ProgramExit) return e.status;
    throw e;
  }
}
