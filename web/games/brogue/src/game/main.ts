// @ts-nocheck
// Brogue CE 1.15.1 main.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { printBrogueVersion } from './RogueMain.ts';
import { printSeedCatalog } from './SeedCatalog.ts';
import { append, endswith } from './Utilities.ts';
import { dumpScores, loadKeymap, setGraphicsMode } from './platformdependent.ts';
import { struct_brogueConsole, struct_pcell, struct_pos, struct_tcell, struct_windowpos } from './structs.ts';
import { $cs, $sat, $u64, G, P, R, S, atoi, printf, sprintf, sscanf, strcmp, strcpy, strlen, strncpy } from '../rt/index.ts';
import { COLS, DCOLS, DROWS, GAME_MODE_NORMAL, GAME_MODE_WIZARD, HYBRID_GRAPHICS, MESSAGE_LINES, NG_NEW_GAME, NG_NEW_GAME_WITH_SEED, NG_NOTHING, NG_OPEN_GAME, NG_VIEW_RECORDING, ROWS, STAT_BAR_WIDTH, TEXT_GRAPHICS, TILES_GRAPHICS, VARIANT_BULLET_BROGUE, VARIANT_RAPID_BROGUE, false_, true_ } from './consts.ts';


function signum(x: number): number {
  if (x === 0) {
    return 0;
  }
  return x > 0 ? 1 : -1;
}

function posEq(a: struct_pos, b: struct_pos): number {
  return (a.x === b.x && a.y === b.y ? 1 : 0) << 24 >> 24;
}

function coordinatesAreInMap(x: number, y: number): number {
  return (x >= 0 && DCOLS > x && y >= 0 && DROWS > y ? 1 : 0) << 24 >> 24;
}

function isPosInMap(p: struct_pos): number {
  return (p.x >= 0 && DCOLS > p.x && p.y >= 0 && DROWS > p.y ? 1 : 0) << 24 >> 24;
}

function locIsInWindow(w: struct_windowpos): number {
  return (w.window_x >= 0 && COLS > w.window_x && w.window_y >= 0 && ROWS > w.window_y ? 1 : 0) << 24 >> 24;
}

function windowToMap(w: struct_windowpos): struct_pos {
  return struct_pos.$of(w.window_x - STAT_BAR_WIDTH - 1 << 16 >> 16, w.window_y - MESSAGE_LINES << 16 >> 16);
}

function mapToWindow(p: struct_pos): struct_windowpos {
  return struct_windowpos.$of(p.x + STAT_BAR_WIDTH + 1 << 16 >> 16, p.y + MESSAGE_LINES << 16 >> 16);
}

function tmapAt(p: struct_pos): struct_tcell | null {
  ;
  return $sat(G.tmap[p.x], p.y);
}

function pmapAt(p: struct_pos): struct_pcell | null {
  ;
  return $sat(G.pmap[p.x], p.y);
}

function posNeighborInDirection(p: struct_pos, direction_to_step: number): struct_pos {
  ;
  return struct_pos.$of(p.x + G.nbDirs[direction_to_step][0] << 16 >> 16, p.y + G.nbDirs[direction_to_step][1] << 16 >> 16);
}

function printCommandlineHelp(): void {
  printf(S("%s"), S("--help         -h          print this help message and exit \n--version      -V          print the version and exit\n--scores                   dump scores to output and exit\n-n                         start a new game, skipping the menu\n-s seed                    start a new game with the specified numerical seed\n-o filename[.broguesave]   open a save file (extension optional)\n-v recording[.broguerec]   view a recording (extension optional)\n-vn recording[.broguerec]  view a recording non-interactively (extension optional)\n--variant variant_name     run a variant game (options: rapid_brogue, bullet_brogue)\n--stealth      -S          display stealth range\n--no-effects   -E          disable color effects\n--wizard       -W          run in wizard mode, invincible with powerful items\n--hide-seed                disable seed display in game\n[--csv] --print-seed-catalog [START NUM LEVELS]\n                           (optional csv format)\n                           prints a catalog of the first LEVELS levels of NUM\n                           seeds from seed START (defaults: 1 1000 5)\n--data-dir DIRECTORY       specify directory containing game resources (experimental)\n"));
  return;
}

function cliError(prefix: Ptr | null, errorMsg: Ptr | null): void {
  printf(S("%s%s\n\n"), prefix, errorMsg);
  printCommandlineHelp();
}

function badArgument(arg: Ptr | null): void {
  cliError(S("Bad argument: "), arg);
}

export function tryParseUint64(str: Ptr | null, num: Ptr | null): number {
  const n = new BigUint64Array(1);
  let buf = new Int8Array(100);
  if (strlen(str) && sscanf(str, S("%llu"), P(n, 0)) && sprintf(P(buf), S("%llu"), n[0]) && !strcmp(P(buf), str)) {
    num.a[num.o] = n[0];
    return true_;
  } else {
    return false_;
  }
}

export async function main(argc: number, argv: Ptr | null): Promise<number> {
  G.currentConsole.$cp(R.nullConsole);
  G.rogue.nextGame = NG_NOTHING;
  G.rogue.nextGamePath[0] = 0;
  G.rogue.nextGameSeed = 0n;
  G.rogue.mode = GAME_MODE_NORMAL;
  G.rogue.displayStealthRangeMode = false_;
  G.rogue.trueColorMode = false_;
  let initialGraphics = TEXT_GRAPHICS;
  let i = 0;
  for (i = 1; argc > i; ++i) {
    if (strcmp(argv.a[argv.o + i], S("--scores")) === 0) {
      dumpScores();
      return 0;
    }
    if (strcmp(argv.a[argv.o + i], S("--seed")) === 0 || strcmp(argv.a[argv.o + i], S("-s")) === 0) {
      const seed = new BigUint64Array(1);
      if (i + 1 === argc || !tryParseUint64(argv.a[argv.o + (i + 1)], P(seed, 0))) {
        printf(S("Invalid seed, please specify a number between 1 and 18446744073709551615\n"));
        return 1;
      }
      if (seed[0] !== 0n) {
        G.rogue.nextGameSeed = seed[0];
        G.rogue.nextGame = NG_NEW_GAME_WITH_SEED;
      }
      ++i;
      continue;
    }
    if (strcmp(argv.a[argv.o + i], S("-n")) === 0) {
      if (G.rogue.nextGameSeed === 0n) {
        G.rogue.nextGame = NG_NEW_GAME;
      } else {
        G.rogue.nextGame = NG_NEW_GAME_WITH_SEED;
      }
      continue;
    }
    if (strcmp(argv.a[argv.o + i], S("-o")) === 0 || strcmp(argv.a[argv.o + i], S("--open")) === 0) {
      if (argc > i + 1) {
        strncpy(P(G.rogue.nextGamePath), argv.a[argv.o + (i + 1)], $u64(4096 > 1024 * 4 ? 1024 * 4 : 4096));
        G.rogue.nextGamePath[(4096 > 1024 * 4 ? 1024 * 4 : 4096) - 1] = 0;
        G.rogue.nextGame = NG_OPEN_GAME;
        if (!endswith(P(G.rogue.nextGamePath), S(".broguesave"))) {
          append(P(G.rogue.nextGamePath), S(".broguesave"), 4096 > 1024 * 4 ? 1024 * 4 : 4096);
        }
        ++i;
        continue;
      }
    }
    if (strcmp(argv.a[argv.o + i], S("-v")) === 0 || strcmp(argv.a[argv.o + i], S("--view")) === 0) {
      if (argc > i + 1) {
        strncpy(P(G.rogue.nextGamePath), argv.a[argv.o + (i + 1)], $u64(4096 > 1024 * 4 ? 1024 * 4 : 4096));
        G.rogue.nextGamePath[(4096 > 1024 * 4 ? 1024 * 4 : 4096) - 1] = 0;
        G.rogue.nextGame = NG_VIEW_RECORDING;
        if (!endswith(P(G.rogue.nextGamePath), S(".broguerec"))) {
          append(P(G.rogue.nextGamePath), S(".broguerec"), 4096 > 1024 * 4 ? 1024 * 4 : 4096);
        }
        ++i;
        continue;
      }
    }
    if (strcmp(argv.a[argv.o + i], S("--variant")) === 0) {
      if (argc > i + 1) {
        if (!strcmp(S("rapid_brogue"), argv.a[argv.o + (i + 1)])) {
          G.gameVariant = VARIANT_RAPID_BROGUE;
        }
        if (!strcmp(S("bullet_brogue"), argv.a[argv.o + (i + 1)])) {
          G.gameVariant = VARIANT_BULLET_BROGUE;
        }
        ++i;
        continue;
      }
    }
    if (strcmp(argv.a[argv.o + i], S("-vn")) === 0) {
      if (argc > i + 1) {
        strncpy(P(G.rogue.nextGamePath), argv.a[argv.o + (i + 1)], $u64(4096 > 1024 * 4 ? 1024 * 4 : 4096));
        G.rogue.nextGamePath[(4096 > 1024 * 4 ? 1024 * 4 : 4096) - 1] = 0;
        G.rogue.nextGame = NG_VIEW_RECORDING;
        if (!endswith(P(G.rogue.nextGamePath), S(".broguerec"))) {
          append(P(G.rogue.nextGamePath), S(".broguerec"), 4096 > 1024 * 4 ? 1024 * 4 : 4096);
        }
        G.currentConsole.$cp(R.nullConsole);
        G.nonInteractivePlayback = true_;
        ++i;
        continue;
      }
    }
    if (strcmp(argv.a[argv.o + i], S("--print-seed-catalog")) === 0) {
      const startingSeed = new BigUint64Array(1);
      const numberOfSeeds = new BigUint64Array(1);
      let numberOfLevels = 0;
      if (argc > i + 3) {
        numberOfLevels = atoi(argv.a[argv.o + (i + 3)]);
        if (!tryParseUint64(argv.a[argv.o + (i + 1)], P(startingSeed, 0))) {
          cliError(S("Bad params for seed catalog, starting seed: "), argv.a[argv.o + (i + 1)]);
          return 1;
        }
        if (!tryParseUint64(argv.a[argv.o + (i + 2)], P(numberOfSeeds, 0))) {
          cliError(S("Bad params for seed catalog, number of seeds: "), argv.a[argv.o + (i + 2)]);
          return 1;
        }
      } else {
        startingSeed[0] = 1n;
        numberOfSeeds[0] = 1000n;
        numberOfLevels = 5;
      }
      let errorCode = 0;
      let errorMessage = new Int8Array(100);
      errorCode = await printSeedCatalog(startingSeed[0], numberOfSeeds[0], numberOfLevels >>> 0, G.isCsvFormat, P(errorMessage));
      if (errorCode) {
        cliError(S("Bad params for seed catalog, "), P(errorMessage));
      }
      return errorCode;
    }
    if (strcmp(argv.a[argv.o + i], S("-V")) === 0 || strcmp(argv.a[argv.o + i], S("--version")) === 0) {
      printBrogueVersion();
      return 0;
    }
    if (!(strcmp(argv.a[argv.o + i], S("-?")) && strcmp(argv.a[argv.o + i], S("-h")) && strcmp(argv.a[argv.o + i], S("--help")))) {
      printCommandlineHelp();
      return 0;
    }
    if (strcmp(argv.a[argv.o + i], S("-G")) === 0 || strcmp(argv.a[argv.o + i], S("--graphics")) === 0) {
      initialGraphics = TILES_GRAPHICS;
      continue;
    }
    if (strcmp(argv.a[argv.o + i], S("-H")) === 0 || strcmp(argv.a[argv.o + i], S("--hybrid")) === 0) {
      initialGraphics = HYBRID_GRAPHICS;
      continue;
    }
    if (strcmp(argv.a[argv.o + i], S("--csv")) === 0) {
      G.isCsvFormat = true_;
      continue;
    }
    if (strcmp(argv.a[argv.o + i], S("--stealth")) === 0 || strcmp(argv.a[argv.o + i], S("-S")) === 0) {
      G.rogue.displayStealthRangeMode = true_;
      continue;
    }
    if (strcmp(argv.a[argv.o + i], S("--no-effects")) === 0 || strcmp(argv.a[argv.o + i], S("-E")) === 0) {
      G.rogue.trueColorMode = true_;
      continue;
    }
    if (strcmp(argv.a[argv.o + i], S("--wizard")) === 0 || strcmp(argv.a[argv.o + i], S("-W")) === 0) {
      G.rogue.mode = GAME_MODE_WIZARD;
      continue;
    }
    if (strcmp(argv.a[argv.o + i], S("--hide-seed")) === 0) {
      G.rogue.hideSeed = true_;
      continue;
    }
    if (strcmp(argv.a[argv.o + i], S("--data-dir")) === 0) {
      if (argc > i + 1) {
        strcpy(P(G.dataDirectory), argv.a[argv.o + ++i]);
        continue;
      }
    }
    if (endswith(argv.a[argv.o + i], S(".broguesave"))) {
      strncpy(P(G.rogue.nextGamePath), argv.a[argv.o + i], $u64(4096 > 1024 * 4 ? 1024 * 4 : 4096));
      G.rogue.nextGamePath[(4096 > 1024 * 4 ? 1024 * 4 : 4096) - 1] = 0;
      G.rogue.nextGame = NG_OPEN_GAME;
      continue;
    }
    if (endswith(argv.a[argv.o + i], S(".broguerec"))) {
      strncpy(P(G.rogue.nextGamePath), argv.a[argv.o + i], $u64(4096 > 1024 * 4 ? 1024 * 4 : 4096));
      G.rogue.nextGamePath[(4096 > 1024 * 4 ? 1024 * 4 : 4096) - 1] = 0;
      G.rogue.nextGame = NG_VIEW_RECORDING;
      continue;
    }
    badArgument(argv.a[argv.o + i]);
    return 1;
  }
  G.hasGraphics = (!!G.currentConsole.setGraphicsMode ? 1 : 0) << 24 >> 24;
  G.graphicsMode = setGraphicsMode(initialGraphics);
  loadKeymap();
  await G.currentConsole.gameLoop();
  return 0;
}

export function $init(): void {
  G.currentConsole = new struct_brogueConsole();
  G.dataDirectory = $cs(".", 4096);
  G.serverMode = false_;
  G.nonInteractivePlayback = false_;
  G.hasGraphics = false_;
  G.graphicsMode = TEXT_GRAPHICS;
  G.isCsvFormat = false_;
}
