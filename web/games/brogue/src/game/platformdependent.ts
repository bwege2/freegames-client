// @ts-nocheck
// Brogue CE 1.15.1 platformdependent.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { struct_PauseBehavior, struct_brogueScoreEntry, struct_pcell, struct_pos, struct_rogueEvent, struct_rogueHighScoresEntry, struct_rogueRun, struct_tcell, struct_windowpos } from './structs.ts';
import { $sadd, $sarr, $sat, $u64, G, P, R, S, fclose, fgets, fopen, fprintf, free, fscanf, isspace, localtime, memset, printf, sscanf, strcpy, strftime, strlen, strncat, strncpy, time, toupper } from '../rt/index.ts';
import { COLS, DCOLS, DROWS, G_ALTAR, G_AMULET, G_ANCIENT_SPIRIT, G_ARMOR, G_ASHES, G_BAD_MAGIC, G_BARRICADE, G_BAT, G_BEDROLL, G_BLOAT, G_BLOODWORT_POD, G_BLOODWORT_STALK, G_BOG, G_BOG_MONSTER, G_BONES, G_BRIDGE, G_CARPET, G_CENTAUR, G_CENTIPEDE, G_CHAIN_BOTTOM, G_CHAIN_BOTTOM_LEFT, G_CHAIN_BOTTOM_RIGHT, G_CHAIN_LEFT, G_CHAIN_RIGHT, G_CHAIN_TOP, G_CHAIN_TOP_LEFT, G_CHAIN_TOP_RIGHT, G_CHARM, G_CHASM, G_CLOSED_CAGE, G_CLOSED_COFFIN, G_CLOSED_DOOR, G_CLOSED_IRON_DOOR, G_CRACKED_STATUE, G_CRYSTAL, G_DAR_BATTLEMAGE, G_DAR_BLADEMASTER, G_DAR_PRIESTESS, G_DEMON, G_DEWAR, G_DOORWAY, G_DOWN_ARROW, G_DOWN_STAIRS, G_DRAGON, G_EEL, G_EGG, G_ELECTRIC_CRYSTAL, G_FIRE, G_FLAMEDANCER, G_FLOOR, G_FLOOR_ALT, G_FOLIAGE, G_FOOD, G_FURY, G_GEM, G_GOBLIN, G_GOBLIN_CHIEFTAN, G_GOBLIN_MAGIC, G_GOLD, G_GOLEM, G_GOOD_MAGIC, G_GRANITE, G_GRASS, G_GUARDIAN, G_IFRIT, G_IMP, G_JACKAL, G_JELLY, G_KEY, G_KOBOLD, G_KRAKEN, G_LEFT_TRIANGLE, G_LEVER, G_LEVER_PULLED, G_LICH, G_LICHEN, G_LIQUID, G_MAGIC_GLYPH, G_MONKEY, G_MOUND, G_NAGA, G_NET, G_OGRE, G_OGRE_MAGIC, G_OPEN_CAGE, G_OPEN_COFFIN, G_OPEN_DOOR, G_OPEN_IRON_DOOR, G_ORB_ALTAR, G_PEDESTAL, G_PHANTOM, G_PHOENIX, G_PIPES, G_PIXIE, G_PLAYER, G_PORTCULLIS, G_POTION, G_RAT, G_REVENANT, G_RING, G_RUBBLE, G_SAC_ALTAR, G_SALAMANDER, G_SCROLL, G_SPIDER, G_STAFF, G_STATUE, G_TENTACLE_HORROR, G_TOAD, G_TORCH, G_TOTEM, G_TRAP, G_TROLL, G_TURRET, G_UNDERWORM, G_UNICORN, G_UP_ARROW, G_UP_STAIRS, G_VAMPIRE, G_VENT, G_VINE, G_WALL, G_WALL_TOP, G_WAND, G_WARDEN, G_WEAPON, G_WEB, G_WINGED_GUARDIAN, G_WISP, G_WRAITH, G_ZOMBIE, HIGH_SCORES_COUNT, MESSAGE_LINES, ROWS, STAT_BAR_WIDTH, TEXT_GRAPHICS, U_ANKH, U_ARIES, U_CIRCLE, U_CIRCLE_BARS, U_CURRENCY, U_DIAMOND, U_DOWN_ARROW, U_ESZETT, U_FILLED_CIRCLE, U_FILLED_CIRCLE_BARS, U_FLIPPED_V, U_FOUR_DOTS, U_LEFT_TRIANGLE, U_LIGHTNING_BOLT, U_MIDDLE_DOT, U_MUSIC_NOTE, U_NEUTER, U_OMEGA, U_UP_ARROW, U_U_ACUTE, false_, true_ } from './consts.ts';


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

export function glyphToUnicode(glyph: number): number {
  if (128 > glyph >>> 0) {
    return glyph >>> 0;
  }
  switch (glyph >>> 0) {
  case G_UP_ARROW:
    return U_UP_ARROW;
  case G_DOWN_ARROW:
    return U_DOWN_ARROW;
  case G_POTION:
    return 33;
  case G_GRASS:
    return 34;
  case G_WALL:
    return 35;
  case G_DEMON:
    return 38;
  case G_OPEN_DOOR:
    return 39;
  case G_GOLD:
    return 42;
  case G_CLOSED_DOOR:
    return 43;
  case G_RUBBLE:
    return 44;
  case G_KEY:
    return 45;
  case G_BOG:
    return 126;
  case G_CHAIN_TOP_LEFT:
  case G_CHAIN_BOTTOM_RIGHT:
    return 92;
  case G_CHAIN_TOP_RIGHT:
  case G_CHAIN_BOTTOM_LEFT:
    return 47;
  case G_CHAIN_TOP:
  case G_CHAIN_BOTTOM:
    return 124;
  case G_CHAIN_LEFT:
  case G_CHAIN_RIGHT:
    return 45;
  case G_FOOD:
    return 59;
  case G_UP_STAIRS:
    return 60;
  case G_VENT:
    return 61;
  case G_DOWN_STAIRS:
    return 62;
  case G_PLAYER:
    return 64;
  case G_BOG_MONSTER:
    return 66;
  case G_CENTAUR:
    return 67;
  case G_DRAGON:
    return 68;
  case G_FLAMEDANCER:
    return 70;
  case G_GOLEM:
    return 71;
  case G_TENTACLE_HORROR:
    return 72;
  case G_IFRIT:
    return 73;
  case G_JELLY:
    return 74;
  case G_KRAKEN:
    return 75;
  case G_LICH:
    return 76;
  case G_NAGA:
    return 78;
  case G_OGRE:
    return 79;
  case G_PHANTOM:
    return 80;
  case G_REVENANT:
    return 82;
  case G_SALAMANDER:
    return 83;
  case G_TROLL:
    return 84;
  case G_UNDERWORM:
    return 85;
  case G_VAMPIRE:
    return 86;
  case G_WRAITH:
    return 87;
  case G_ZOMBIE:
    return 90;
  case G_ARMOR:
    return 91;
  case G_STAFF:
    return 47;
  case G_WEB:
    return 58;
  case G_MOUND:
    return 97;
  case G_BLOAT:
    return 98;
  case G_CENTIPEDE:
    return 99;
  case G_DAR_BLADEMASTER:
    return 100;
  case G_EEL:
    return 101;
  case G_FURY:
    return 102;
  case G_GOBLIN:
    return 103;
  case G_IMP:
    return 105;
  case G_JACKAL:
    return 106;
  case G_KOBOLD:
    return 107;
  case G_MONKEY:
    return 109;
  case G_PIXIE:
    return 112;
  case G_RAT:
    return 114;
  case G_SPIDER:
    return 115;
  case G_TOAD:
    return 116;
  case G_BAT:
    return 118;
  case G_WISP:
    return 119;
  case G_PHOENIX:
    return 80;
  case G_ALTAR:
    return 124;
  case G_LIQUID:
    return 126;
  case G_FLOOR:
    return U_MIDDLE_DOT;
  case G_CHASM:
    return U_FOUR_DOTS;
  case G_TRAP:
    return U_DIAMOND;
  case G_FIRE:
    return U_FLIPPED_V;
  case G_FOLIAGE:
    return U_ARIES;
  case G_AMULET:
    return U_ANKH;
  case G_SCROLL:
    return U_MUSIC_NOTE;
  case G_RING:
    return U_CIRCLE;
  case G_WEAPON:
    return U_UP_ARROW;
  case G_GEM:
    return U_FILLED_CIRCLE;
  case G_TOTEM:
    return U_NEUTER;
  case G_GOOD_MAGIC:
    return U_FILLED_CIRCLE_BARS;
  case G_BAD_MAGIC:
    return U_CIRCLE_BARS;
  case G_DOORWAY:
    return U_OMEGA;
  case G_CHARM:
    return U_LIGHTNING_BOLT;
  case G_WALL_TOP:
    return 35;
  case G_DAR_PRIESTESS:
    return 100;
  case G_DAR_BATTLEMAGE:
    return 100;
  case G_GOBLIN_MAGIC:
    return 103;
  case G_GOBLIN_CHIEFTAN:
    return 103;
  case G_OGRE_MAGIC:
    return 79;
  case G_GUARDIAN:
    return U_ESZETT;
  case G_WINGED_GUARDIAN:
    return U_ESZETT;
  case G_EGG:
    return U_FILLED_CIRCLE;
  case G_WARDEN:
    return 89;
  case G_DEWAR:
    return 38;
  case G_ANCIENT_SPIRIT:
    return 77;
  case G_LEVER:
    return 47;
  case G_LEVER_PULLED:
    return 92;
  case G_BLOODWORT_STALK:
    return U_ARIES;
  case G_FLOOR_ALT:
    return U_MIDDLE_DOT;
  case G_UNICORN:
    return U_U_ACUTE;
  case G_TURRET:
    return U_FILLED_CIRCLE;
  case G_WAND:
    return 126;
  case G_GRANITE:
    return 35;
  case G_CARPET:
    return U_MIDDLE_DOT;
  case G_CLOSED_IRON_DOOR:
    return 43;
  case G_OPEN_IRON_DOOR:
    return 39;
  case G_TORCH:
    return 35;
  case G_CRYSTAL:
    return 35;
  case G_PORTCULLIS:
    return 35;
  case G_BARRICADE:
    return 35;
  case G_STATUE:
    return U_ESZETT;
  case G_CRACKED_STATUE:
    return U_ESZETT;
  case G_CLOSED_CAGE:
    return 35;
  case G_OPEN_CAGE:
    return 124;
  case G_PEDESTAL:
    return 124;
  case G_CLOSED_COFFIN:
    return 45;
  case G_OPEN_COFFIN:
    return 45;
  case G_MAGIC_GLYPH:
    return U_FOUR_DOTS;
  case G_BRIDGE:
    return 61;
  case G_BONES:
    return 44;
  case G_ELECTRIC_CRYSTAL:
    return U_CURRENCY;
  case G_ASHES:
    return 39;
  case G_BEDROLL:
    return 61;
  case G_BLOODWORT_POD:
    return 42;
  case G_VINE:
    return 58;
  case G_NET:
    return 58;
  case G_LICHEN:
    return 34;
  case G_PIPES:
    return 43;
  case G_SAC_ALTAR:
    return 124;
  case G_ORB_ALTAR:
    return 124;
  case G_LEFT_TRIANGLE:
    return U_LEFT_TRIANGLE;
  default:
    ;
    return 63;
  }
}

export function isEnvironmentGlyph(glyph: number): number {
  switch (glyph >>> 0) {
  case G_AMULET:
  case G_ARMOR:
  case G_BEDROLL:
  case G_CHARM:
  case G_DEWAR:
  case G_EGG:
  case G_FOOD:
  case G_GEM:
  case G_BLOODWORT_POD:
  case G_GOLD:
  case G_KEY:
  case G_POTION:
  case G_RING:
  case G_SCROLL:
  case G_STAFF:
  case G_WAND:
  case G_WEAPON:
  case G_LEFT_TRIANGLE:
    return false_;
  case G_ANCIENT_SPIRIT:
  case G_BAT:
  case G_BLOAT:
  case G_BOG_MONSTER:
  case G_CENTAUR:
  case G_CENTIPEDE:
  case G_DAR_BATTLEMAGE:
  case G_DAR_BLADEMASTER:
  case G_DAR_PRIESTESS:
  case G_DEMON:
  case G_DRAGON:
  case G_EEL:
  case G_FLAMEDANCER:
  case G_FURY:
  case G_GOBLIN:
  case G_GOBLIN_CHIEFTAN:
  case G_GOBLIN_MAGIC:
  case G_GOLEM:
  case G_GUARDIAN:
  case G_IFRIT:
  case G_IMP:
  case G_JACKAL:
  case G_JELLY:
  case G_KOBOLD:
  case G_KRAKEN:
  case G_LICH:
  case G_MONKEY:
  case G_MOUND:
  case G_NAGA:
  case G_OGRE:
  case G_OGRE_MAGIC:
  case G_PHANTOM:
  case G_PHOENIX:
  case G_PIXIE:
  case G_PLAYER:
  case G_RAT:
  case G_REVENANT:
  case G_SALAMANDER:
  case G_SPIDER:
  case G_TENTACLE_HORROR:
  case G_TOAD:
  case G_TROLL:
  case G_UNDERWORM:
  case G_UNICORN:
  case G_VAMPIRE:
  case G_WARDEN:
  case G_WINGED_GUARDIAN:
  case G_WISP:
  case G_WRAITH:
  case G_ZOMBIE:
    return false_;
  default:
    return true_;
  }
}

export function plotChar(inputChar: number, xLoc: number, yLoc: number, foreRed: number, foreGreen: number, foreBlue: number, backRed: number, backGreen: number, backBlue: number): void {
  G.currentConsole.plotChar(inputChar, xLoc, yLoc, foreRed, foreGreen, foreBlue, backRed, backGreen, backBlue);
}

export function shiftKeyIsDown(): number {
  return G.currentConsole.modifierHeld(0);
}

export function controlKeyIsDown(): number {
  return G.currentConsole.modifierHeld(1);
}

export async function nextKeyOrMouseEvent(returnEvent: struct_rogueEvent | null, textInput: number, colorsDance: number): Promise<void> {
  await G.currentConsole.nextKeyOrMouseEvent(returnEvent, textInput, colorsDance);
}

export async function pauseForMilliseconds(milliseconds: number, behavior: struct_PauseBehavior): Promise<number> {
  return await G.currentConsole.pauseForMilliseconds(milliseconds, behavior.$clone());
}

export function notifyEvent(eventId: number, data1: number, data2: number, str1: Ptr | null, str2: Ptr | null): void {
  if (G.currentConsole.notifyEvent) {
    G.currentConsole.notifyEvent(eventId, data1, data2, str1, str2);
  }
}

export function takeScreenshot(): number {
  if (G.currentConsole.takeScreenshot) {
    return G.currentConsole.takeScreenshot();
  } else {
    return false_;
  }
}

export function setGraphicsMode(mode: number): number {
  if (G.currentConsole.setGraphicsMode) {
    return G.currentConsole.setGraphicsMode(mode);
  } else {
    return TEXT_GRAPHICS;
  }
}

function initScores(): void {
  let i = 0;
  let scoresFile = null;
  let highScoresFilename = new Int8Array(4096);
  setHighScoresFilename(P(highScoresFilename), 4096 > 1024 * 4 ? 1024 * 4 : 4096);
  scoresFile = fopen(P(highScoresFilename), S("w"));
  for (i = 0; HIGH_SCORES_COUNT > i; i = i + 1 << 16 >> 16) {
    fprintf(scoresFile, S("%li\t%li\t%s"), 0, 0, S("(empty entry)\n"));
  }
  fclose(scoresFile);
}

function sortScoreBuffer(): number {
  let i = 0;
  let j = 0;
  let highestUnsortedLine = 0;
  let mostRecentSortedLine = 0;
  let highestUnsortedScore = 0;
  let mostRecentDate = 0;
  let sortedScoreBuffer = $sarr(struct_brogueScoreEntry, 30);
  let lineSorted = new Int8Array(30);
  mostRecentDate = 0;
  for (i = 0; HIGH_SCORES_COUNT > i; i = i + 1 << 16 >> 16) {
    lineSorted[i] = false_;
  }
  for (i = 0; HIGH_SCORES_COUNT > i; i = i + 1 << 16 >> 16) {
    highestUnsortedLine = 0;
    highestUnsortedScore = 0;
    for (j = 0; HIGH_SCORES_COUNT > j; j = j + 1 << 16 >> 16) {
      if (!lineSorted[j] && G.scoreBuffer[j].score >= highestUnsortedScore) {
        highestUnsortedLine = j;
        highestUnsortedScore = G.scoreBuffer[j].score;
      }
    }
    sortedScoreBuffer[i].$cp(G.scoreBuffer[highestUnsortedLine]);
    lineSorted[highestUnsortedLine] = true_;
  }
  for (i = 0; HIGH_SCORES_COUNT > i; i = i + 1 << 16 >> 16) {
    G.scoreBuffer[i].$cp(sortedScoreBuffer[i]);
    if (G.scoreBuffer[i].dateNumber > mostRecentDate) {
      mostRecentDate = G.scoreBuffer[i].dateNumber;
      mostRecentSortedLine = i;
    }
  }
  return mostRecentSortedLine;
}

export function setHighScoresFilename(buffer: Ptr | null, bufferMaxLength: number): void {
  strncpy(buffer, G.gameConst.variantName, $u64(bufferMaxLength));
  strncat(buffer, S("HighScores.txt"), $u64(bufferMaxLength));
  buffer.a[buffer.o] = toupper(buffer.a[buffer.o]) << 24 >> 24;
}

function loadScoreBuffer(): number {
  let i = 0;
  let scoresFile = null;
  const rawtime = new Float64Array(1);
  let timeinfo = null;
  let highScoresFilename = new Int8Array(4096);
  setHighScoresFilename(P(highScoresFilename), 4096 > 1024 * 4 ? 1024 * 4 : 4096);
  scoresFile = fopen(P(highScoresFilename), S("r"));
  if (!scoresFile) {
    initScores();
    scoresFile = fopen(P(highScoresFilename), S("r"));
  }
  for (i = 0; HIGH_SCORES_COUNT > i; i = i + 1 << 16 >> 16) {
    fscanf(scoresFile, S("%li\t%li\t"), P(G.scoreBuffer[i], "score"), P(G.scoreBuffer[i], "dateNumber"));
    fgets(P(G.scoreBuffer[i].description), COLS, scoresFile);
    G.scoreBuffer[i].description[strlen(P(G.scoreBuffer[i].description)) - 1] = 0;
    rawtime[0] = G.scoreBuffer[i].dateNumber;
    timeinfo = localtime(P(rawtime, 0));
    strftime(P(G.scoreBuffer[i].dateText), DCOLS, S("%Y-%m-%d"), timeinfo);
  }
  fclose(scoresFile);
  return sortScoreBuffer();
}

export function loadKeymap(): void {
  let i = 0;
  let f = null;
  let buffer = new Int8Array(512);
  f = fopen(S("keymap.txt"), S("r"));
  if (!!f) {
    while (!!fgets(P(buffer), 512, f)) {
      let mode = 1;
      let input_name = null;
      let output_name = null;
      for (i = 0; buffer[i]; ++i) {
        if (isspace(buffer[i])) {
          buffer[i] = 0;
          mode = 1;
        } else {
          if (mode) {
            if (!input_name) {
              input_name = P(buffer).add(i);
            } else if (!output_name) {
              output_name = P(buffer).add(i);
            }
          }
          mode = 0;
        }
      }
      if (!!input_name && !!output_name) {
        if (input_name.a[input_name.o] === 35) {
          continue;
        }
        if (G.currentConsole.remap) {
          G.currentConsole.remap(input_name, output_name);
        }
      }
    }
    fclose(f);
  }
}

function saveScoreBuffer(): void {
  let i = 0;
  let scoresFile = null;
  let highScoresFilename = new Int8Array(4096);
  setHighScoresFilename(P(highScoresFilename), 4096 > 1024 * 4 ? 1024 * 4 : 4096);
  scoresFile = fopen(P(highScoresFilename), S("w"));
  for (i = 0; HIGH_SCORES_COUNT > i; i = i + 1 << 16 >> 16) {
    fprintf(scoresFile, S("%li\t%li\t%s\n"), G.scoreBuffer[i].score, G.scoreBuffer[i].dateNumber, P(G.scoreBuffer[i].description));
  }
  fclose(scoresFile);
}

export function dumpScores(): void {
  let i = 0;
  let list = $sarr(struct_rogueHighScoresEntry, 30);
  getHighScoresList(list[0]);
  for (i = 0; HIGH_SCORES_COUNT > i; ++i) {
    if (list[i].score > 0) {
      printf(S("%d\t%s\t%s\n"), list[i].score | 0, P(list[i].date), P(list[i].description));
    }
  }
}

export function getHighScoresList(returnList: struct_rogueHighScoresEntry | null): number {
  let i = 0;
  let mostRecentLineNumber = 0;
  mostRecentLineNumber = loadScoreBuffer();
  for (i = 0; HIGH_SCORES_COUNT > i; i = i + 1 << 16 >> 16) {
    $sadd(returnList, i).score = G.scoreBuffer[i].score;
    strcpy(P($sadd(returnList, i).date), P(G.scoreBuffer[i].dateText));
    strcpy(P($sadd(returnList, i).description), P(G.scoreBuffer[i].description));
  }
  return mostRecentLineNumber;
}

export function saveHighScore(theEntry: struct_rogueHighScoresEntry): number {
  let i = 0;
  let lowestScoreIndex = -1;
  let lowestScore = -1;
  loadScoreBuffer();
  for (i = 0; HIGH_SCORES_COUNT > i; i = i + 1 << 16 >> 16) {
    if (lowestScore > G.scoreBuffer[i].score || i === 0) {
      lowestScore = G.scoreBuffer[i].score;
      lowestScoreIndex = i;
    }
  }
  if (lowestScore > theEntry.score) {
    return false_;
  }
  G.scoreBuffer[lowestScoreIndex].score = theEntry.score;
  G.scoreBuffer[lowestScoreIndex].dateNumber = time(null);
  strcpy(P(G.scoreBuffer[lowestScoreIndex].description), P(theEntry.description));
  saveScoreBuffer();
  return true_;
}

function setRunHistoryFilename(buffer: Ptr | null, bufferMaxLength: number): void {
  strncpy(buffer, G.gameConst.variantName, $u64(bufferMaxLength));
  strncat(buffer, S("RunHistory.txt"), $u64(bufferMaxLength));
  buffer.a[buffer.o] = toupper(buffer.a[buffer.o]) << 24 >> 24;
}

export function saveRunHistory(result: Ptr | null, killedBy: Ptr | null, score: number, lumenstones: number): void {
  let runHistoryFile = null;
  let runHistoryFilename = new Int8Array(4096);
  setRunHistoryFilename(P(runHistoryFilename), 4096 > 1024 * 4 ? 1024 * 4 : 4096);
  runHistoryFile = fopen(P(runHistoryFilename), S("a"));
  fprintf(runHistoryFile, S("%llu\t%li\t%s\t%s\t%i\t%i\t%i\t%i\t%i\n"), G.rogue.seed, time(null), result, killedBy, score, G.rogue.gold | 0, lumenstones, G.rogue.deepestLevel, G.rogue.playerTurnNumber | 0);
  fclose(runHistoryFile);
}

export function saveResetRun(): void {
  let runHistoryFile = null;
  let runHistoryFilename = new Int8Array(4096);
  setRunHistoryFilename(P(runHistoryFilename), 4096 > 1024 * 4 ? 1024 * 4 : 4096);
  runHistoryFile = fopen(P(runHistoryFilename), S("a"));
  fprintf(runHistoryFile, S("%i\t%li\t%s\t%s\t%i\t%i\t%i\t%i\t%i\n"), 0, time(null), S("Reset"), S("-"), 0, 0, 0, 0, 0);
  fclose(runHistoryFile);
}

export function loadRunHistory(): struct_rogueRun | null {
  let runHistoryFile = null;
  let runHistoryFilename = new Int8Array(4096);
  setRunHistoryFilename(P(runHistoryFilename), 4096 > 1024 * 4 ? 1024 * 4 : 4096);
  runHistoryFile = fopen(P(runHistoryFilename), S("r"));
  if (!runHistoryFile) {
    runHistoryFile = fopen(P(runHistoryFilename), S("w"));
    fclose(runHistoryFile);
    runHistoryFile = fopen(P(runHistoryFilename), S("r"));
  }
  let runHistory = null;
  let current = null;
  let line = new Int8Array(1024);
  while (!!fgets(P(line), 1024, runHistoryFile)) {
    let run = new struct_rogueRun();
    memset(run, 0, 208);
    run.nextRun = null;
    let vals = sscanf(P(line), S("%llu\t%li\t%s\t%[^\t]\t%i\t%i\t%i\t%i\t%i\n"), P(run, "seed"), P(run, "dateNumber"), P(run.result), P(run.killedBy), P(run, "score"), P(run, "gold"), P(run, "lumenstones"), P(run, "deepestLevel"), P(run, "turns"));
    if (vals === 9) {
      if (!runHistory) {
        runHistory = run;
        current = run;
      } else {
        current.nextRun = run;
        current = run;
      }
    } else {
      fprintf(R.stderr, S("Error parsing line: %s\n"), P(line));
      free(run);
    }
  }
  fclose(runHistoryFile);
  return runHistory;
}

export function initializeLaunchArguments(command: Ptr | null, path: Ptr | null, seed: Ptr | null): void {
}

export function isApplicationActive(): number {
  return true_;
}

export function $init(): void {
  G.scoreBuffer = $sarr(struct_brogueScoreEntry, 30);
}
