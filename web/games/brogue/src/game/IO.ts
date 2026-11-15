// @ts-nocheck
// Brogue CE 1.15.1 IO.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { cellHasTMFlag, cellHasTerrainFlag, zeroOutGrid } from './Architect.ts';
import { buttonInputLoop, initializeButton, initializeButtonState, smoothHiliteGradient } from './Buttons.ts';
import { displayCombatText, strLenWithoutEscapes } from './Combat.ts';
import { calculateDistances, dijkstraScan } from './Dijkstra.ts';
import { terrainFlags, terrainMechFlags } from './Globals.ts';
import { allocGrid, fillGrid, freeGrid } from './Grid.ts';
import { apply, armorValueIfUnenchanted, call, displayInventory, displayedArmorValue, drop, equip, getHallucinatedItemCategory, getItemCategoryGlyph, itemAtLoc, itemCanBeCalled, itemDetails, itemIsCarried, itemKindCount, itemMagicPolarity, itemName, magicCharDiscoverySuffix, moveCursor, nextTargetAfter, relabel, swapLastEquipment, tableForItemCategory, throwCommand, unequip } from './Items.ts';
import { playerInDarkness } from './Light.ts';
import { fp_sqrt, rand_range } from './Math.ts';
import { canDirectlySeeMonster, canSeeMonster, distanceBetween, dormantMonsterAtLoc, hasNextCreature, iterateCreatures, monsterAtLoc, monsterDetails, monsterHiddenBySubmersion, monsterIsHidden, monsterName, monsterRevealed, monstersAreEnemies, nextCreature } from './Monsters.ts';
import { adjacentFightingDir, autoPlayLevel, describedItemBasedOnParameters, diagonalBlocked, explore, getExploreMap, layerWithTMFlag, nextStep, playerMoves, playerRuns, populateCreatureCostMap, printLocationDescription, proposeOrConfirmLocation, travel, travelRoute, useStairs } from './Movement.ts';
import { characterForbiddenInFilename, executePlaybackInput, recallEvent, recordKeystroke, saveGame } from './Recordings.ts';
import { enableEasyMode, executeEvent, gameOver } from './RogueMain.ts';
import { autoRest, manualSearch, playerTurnEnded, scentDistance, updateFlavorText, updateSafetyMap } from './Time.ts';
import { dialogCreateItemOrMonster } from './Wizard.ts';
import { getHighScoresList, nextKeyOrMouseEvent, pauseForMilliseconds, plotChar, setGraphicsMode, takeScreenshot } from './platformdependent.ts';
import { struct_PauseBehavior, struct_SavedDisplayBuffer, struct_archivedMessage, struct_brogueButton, struct_buttonState, struct_cellDisplayBuffer, struct_color, struct_creature, struct_item, struct_pcell, struct_pos, struct_rogueEvent, struct_rogueHighScoresEntry, struct_screenDisplayBuffer, struct_tcell, struct_windowpos } from './structs.ts';
import { $arr, $at2, $cs, $mul64, $peq, $rd, $rows, $sadd, $sarr, $sarrOf, $sat, $ta, $u64, $wr, G, P, S, cos, free, lround, printf, sin, snprintf, sprintf, sqrt, strcat, strcmp, strcpy, strlen, strncat, strncpy } from '../rt/index.ts';
import { ACKNOWLEDGE_KEY, ALL_ITEMS, AMULET, ANY_KIND_OF_VISIBLE, APPLY_KEY, ARMOR, ASCEND_KEY, AUTOPLAY_KEY, AUTOTARGET_MODE_EXPLORE, AUTO_REST_KEY, BROGUE_HELP_KEY, BROGUE_HELP_LINE_COUNT, B_DRAW, B_ENABLED, B_KEYPRESS_HIGHLIGHT, B_WIDE_CLICK_AREA, CALL_KEY, CHARM, CHOKEMAP_DISPLAY_CUTOFF, CLAIRVOYANT_VISIBLE, COLOR_ESCAPE, COLOR_VALUE_INTERCEPT, COLS, CREATE_ITEM_MONSTER_KEY, DCOLS, DEFAULT_PLAYBACK_DELAY, DELETE_KEY, DESCEND_KEY, DIRECTION_COUNT, DISCOVERED, DISCOVERIES_KEY, DOWN, DOWNLEFT, DOWNLEFT_KEY, DOWNRIGHT, DOWNRIGHT_KEY, DOWN_ARROW, DOWN_KEY, DROP_KEY, DROWS, DUNGEON, DV_DARK, DV_LIT, EASY_MODE_KEY, EDT_CREATURE, EDT_ITEM, EDT_NOTHING, EDT_TERRAIN, EQUIP_KEY, ESCAPE_KEY, EVENT_ERROR, EXPLORE_KEY, FAINT_THRESHOLD, FEATS_KEY, FEAT_NAME_LENGTH, FLOOR, FOLDABLE, FOOD, FP_FACTOR, GAME_MODE_EASY, GAME_MODE_WIZARD, GAS, GRANITE, GRAPHICS_KEY, G_AMULET, G_BAD_MAGIC, G_CLOSED_DOOR, G_CLOSED_IRON_DOOR, G_DOORWAY, G_GOOD_MAGIC, G_GRANITE, G_LEVER, G_LEVER_PULLED, G_OPEN_DOOR, G_OPEN_IRON_DOOR, G_PORTCULLIS, G_POTION, G_RING, G_SCROLL, G_STAFF, G_TORCH, G_TURRET, G_UP_STAIRS, G_WALL, G_WALL_TOP, G_WAND, HAS_DORMANT_MONSTER, HAS_ITEM, HAS_MONSTER, HAS_PLAYER, HIGH_SCORES_COUNT, HUNGER_THRESHOLD, HYBRID_GRAPHICS, INTERFACE_OPACITY, INVENTORY_KEY, IN_FIELD_OF_VIEW, IN_LOOP, IS_CHOKEPOINT, IS_GATE_SITE, IS_IN_PATH, IS_IN_SHADOW, ITEM_DETECTED, ITEM_EQUIPPED, ITEM_IDENTIFIED, ITEM_MAGIC_DETECTED, KEYBOARD_LABELS, KEYSTROKE, LEFT, LEFT_KEY, LIGHT_SMOOTHING_THRESHOLD, LIQUID, LOAD_SAVED_GAME_KEY, MAGIC_MAPPED, MAX_MENU_BUTTON_COUNT, MAX_MESSAGE_REPEATS, MB_CAPTIVE, MB_FOLLOWER, MB_SUBMERGED, MB_WILL_FLASH, MESSAGE_ARCHIVE_ENTRIES, MESSAGE_ARCHIVE_LINES, MESSAGE_ARCHIVE_VIEW_LINES, MESSAGE_LINES, MIN_COLOR_DIFF, MIN_DEFAULT_INFO_PANEL_WIDTH, MONSTER_ALLY, MONSTER_FLEEING, MONSTER_SLEEPING, MONSTER_TRACKING_SCENT, MONSTER_WANDERING, MONST_ATTACKABLE_THRU_WALLS, MONST_IMMOBILE, MONST_INANIMATE, MONST_INVULNERABLE, MONST_NOT_LISTED_IN_SIDEBAR, MONST_RESTRICTED_TO_LIQUID, MOUSE_UP, NG_NEW_GAME, NOTHING, NO_DIRECTION, NUMBER_MONSTER_KINDS, NUMBER_OF_STATUS_EFFECTS, NUMBER_RING_KINDS, NUMBER_STAFF_KINDS, NUMBER_TERRAIN_LAYERS, NUMPAD_2, NUMPAD_8, POTION, QUIT_KEY, REFRESH_SIDEBAR, RELABEL_KEY, REQUIRE_ACKNOWLEDGMENT, REST_KEY, RETHROW_KEY, RETURN_KEY, RIGHT, RIGHT_ARROW, RIGHT_KEY, RIGHT_MOUSE_UP, RING, RNG_COSMETIC, ROWS, SAVE_GAME_KEY, SCROLL, SEARCH_KEY, SEED_KEY, STABLE_MEMORY, STAFF, STATUS_DONNING, STATUS_HALLUCINATING, STATUS_INVISIBLE, STATUS_LEVITATING, STATUS_NUTRITION, STATUS_POISONED, STATUS_SEARCHING, STATUS_TELEPATHIC, STATUS_WEAKENED, STAT_BAR_WIDTH, STEALTH_RANGE_KEY, STOMACH_SIZE, TAB_KEY, TELEPATHIC_VISIBLE, TERRAIN_COLORS_DANCING, TEXT_GRAPHICS, TEXT_INPUT_FILENAME, THROW_KEY, TILES_GRAPHICS, TM_ALLOWS_SUBMERGING, TM_BRIGHT_MEMORY, TM_INVERT_WHEN_HIGHLIGHTED, TM_IS_SECRET, TM_LIST_IN_SIDEBAR, TM_PROMOTES_ON_PLAYER_ENTRY, TM_VISUALLY_DISTINCT, TRUE_COLORS_KEY, T_LAVA_INSTA_DEATH, T_MOVES_ITEMS, T_OBSTRUCTS_ITEMS, T_OBSTRUCTS_PASSABILITY, T_WAYPOINT_BLOCKER, UNEQUIP_KEY, UP, UPLEFT, UPLEFT_KEY, UPRIGHT, UPRIGHT_KEY, UP_ARROW, UP_KEY, VIEW_RECORDING_KEY, VISIBLE, WAND, WEAK_THRESHOLD, WEAPON, false_, true_ } from './consts.ts';

let previouslyPlottedCells: struct_screenDisplayBuffer;
let randomAnimateMonster$listLength: number;
let randomAnimateMonster$animate: any;

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

export function getPlayerPathOnMap(path: struct_pos | null, map: Ptr | null, origin: struct_pos): number {
  let at = origin.$clone();
  let steps = 0;
  for (steps = 0; true_; ++steps) {
    let dir = nextStep(map, at, G.player, false_);
    if (dir === -1) {
      break;
    }
    at.$cp(posNeighborInDirection(at, dir));
    $sadd(path, steps).$cp(at);
    ;
  }
  return steps << 16 >> 16;
}

export function reversePath(path: struct_pos | null, steps: number): void {
  for (let i = 0; (steps / 2 | 0) > i; ++i) {
    let temp = $sadd(path, (steps - i - 1)).$clone();
    $sadd(path, (steps - i - 1)).$cp($sadd(path, i));
    $sadd(path, i).$cp(temp);
  }
}

export async function hilitePath(path: struct_pos | null, steps: number, unhilite: number): Promise<void> {
  let $t1: any, $t2: any;
  if (unhilite) {
    for (let i = 0; steps > i; ++i) {
      ;
      ($t1 = pmapAt($sadd(path, i)), $t1.flags = ($t1.flags & ~IS_IN_PATH >>> 0) >>> 0);
      await refreshDungeonCell($sadd(path, i).$clone());
    }
  } else {
    for (let i = 0; steps > i; ++i) {
      ;
      ($t2 = pmapAt($sadd(path, i)), $t2.flags = ($t2.flags | IS_IN_PATH) >>> 0);
      await refreshDungeonCell($sadd(path, i).$clone());
    }
  }
}

export async function clearCursorPath(): Promise<void> {
  let $t1: any;
  let i = 0;
  let j = 0;
  if (!G.rogue.playbackMode) {
    for (i = 1; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 1; DROWS > j; j = j + 1 << 16 >> 16) {
        if (($at2(G.pmap, i, j).flags & IS_IN_PATH) >>> 0) {
          ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags & ~IS_IN_PATH >>> 0) >>> 0);
          await refreshDungeonCell(struct_pos.$of(i, j));
        }
      }
    }
  }
}

export function hideCursor(): void {
  G.rogue.cursorMode = false_;
  G.rogue.cursorPathIntensity = (G.rogue.cursorMode ? 50 : 20) << 16 >> 16;
  G.rogue.cursorLoc.$cp(struct_pos.$of(-1, -1));
}

export function showCursor(): void {
  if (!isPosInMap(G.rogue.cursorLoc)) {
    G.rogue.cursorLoc.$cp(G.player.loc);
    G.rogue.cursorMode = true_;
    G.rogue.cursorPathIntensity = (G.rogue.cursorMode ? 50 : 20) << 16 >> 16;
  } else {
    G.rogue.cursorMode = true_;
    G.rogue.cursorPathIntensity = (G.rogue.cursorMode ? 50 : 20) << 16 >> 16;
  }
}

function getClosestValidLocationOnMap(map: Ptr | null, x: number, y: number): struct_pos {
  let answer = struct_pos.$of(-1, -1).$clone();
  let closestDistance = 10000;
  let lowestMapScore = 10000;
  for (let i = 1; DCOLS - 1 > i; ++i) {
    for (let j = 1; DROWS - 1 > j; ++j) {
      if ($rd(map.a[map.o + i], j) >= 0 && 30000 > $rd(map.a[map.o + i], j)) {
        let dist = Math.imul(i - x, i - x) + Math.imul(j - y, j - y);
        if (closestDistance > dist || dist === closestDistance && lowestMapScore > $rd(map.a[map.o + i], j)) {
          answer.$cp(struct_pos.$of(i << 16 >> 16, j << 16 >> 16));
          closestDistance = dist;
          lowestMapScore = $rd(map.a[map.o + i], j);
        }
      }
    }
  }
  return answer.$clone();
}

async function processSnapMap(map: Ptr | null): Promise<void> {
  let costMap = null;
  let dir = 0;
  let i = 0;
  let j = 0;
  let newX = 0;
  let newY = 0;
  costMap = allocGrid();
  await populateCreatureCostMap(costMap, G.player);
  fillGrid(map, 30000);
  $wr(map.a[map.o + G.player.loc.x], G.player.loc.y, 0);
  dijkstraScan(map, costMap, true_);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (cellHasTMFlag(struct_pos.$of(i, j), TM_INVERT_WHEN_HIGHLIGHTED)) {
        for (dir = 0; 4 > dir; ++dir) {
          newX = i + G.nbDirs[dir][0] << 16 >> 16;
          newY = j + G.nbDirs[dir][1] << 16 >> 16;
          if (coordinatesAreInMap(newX, newY) && $rd(map.a[map.o + newX], newY) >= 0 && $rd(map.a[map.o + i], j) > $rd(map.a[map.o + newX], newY)) {
            $wr(map.a[map.o + i], j, $rd(map.a[map.o + newX], newY));
          }
        }
      }
    }
  }
  freeGrid(costMap);
}

async function actionMenu(x: number, playingBack: number): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any;
  let buttonCount = 0;
  let y = 0;
  let takeActionOurselves = $ta(Int8Array, 34, [false_]);
  let theEvent = new struct_rogueEvent();
  let buttons = $sarrOf([struct_brogueButton.$of(new Int8Array(300), 0, 0, new Float64Array(10), new struct_color(), new struct_color(), new struct_color(), 0, new Int32Array(100)),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton()]);
  let yellowColorEscape = $cs("", 5);
  let whiteColorEscape = $cs("", 5);
  let darkGrayColorEscape = $cs("", 5);
  let i = 0;
  let j = 0;
  let longestName = 0;
  let buttonChosen = 0;
  encodeMessageColor(P(yellowColorEscape), 0, G.itemMessageColor);
  encodeMessageColor(P(whiteColorEscape), 0, G.white);
  encodeMessageColor(P(darkGrayColorEscape), 0, G.black);
  do {
    for (i = 0; ROWS > i; i = i + 1 << 16 >> 16) {
      initializeButton($sat(buttons, i));
      buttons[i].buttonColor.$cp(G.interfaceBoxColor);
      buttons[i].opacity = INTERFACE_OPACITY;
    }
    buttonCount = 0;
    if (playingBack) {
      if (KEYBOARD_LABELS) {
        sprintf(P(buttons[buttonCount].text), S("  %sk: %sFaster playback  "), P(yellowColorEscape), P(whiteColorEscape));
      } else {
        strcpy(P(buttons[buttonCount].text), S("  Faster playback  "));
      }
      buttons[buttonCount].hotkey[0] = UP_KEY;
      buttons[buttonCount].hotkey[1] = UP_ARROW;
      buttons[buttonCount].hotkey[2] = NUMPAD_8;
      buttonCount = buttonCount + 1 << 16 >> 16;
      if (KEYBOARD_LABELS) {
        sprintf(P(buttons[buttonCount].text), S("  %sj: %sSlower playback  "), P(yellowColorEscape), P(whiteColorEscape));
      } else {
        strcpy(P(buttons[buttonCount].text), S("  Slower playback  "));
      }
      buttons[buttonCount].hotkey[0] = DOWN_KEY;
      buttons[buttonCount].hotkey[1] = DOWN_ARROW;
      buttons[buttonCount].hotkey[2] = NUMPAD_2;
      buttonCount = buttonCount + 1 << 16 >> 16;
      sprintf(P(buttons[buttonCount].text), S("    %s---"), P(darkGrayColorEscape));
      ($t1 = buttons[buttonCount], $t1.flags = ($t1.flags & ~B_ENABLED >>> 0) >>> 0);
      buttonCount = buttonCount + 1 << 16 >> 16;
      if (KEYBOARD_LABELS) {
        sprintf(P(buttons[buttonCount].text), S("%s0-9: %sFast forward to turn  "), P(yellowColorEscape), P(whiteColorEscape));
      } else {
        strcpy(P(buttons[buttonCount].text), S("  Fast forward to turn  "));
      }
      buttons[buttonCount].hotkey[0] = 48;
      buttonCount = buttonCount + 1 << 16 >> 16;
      if (KEYBOARD_LABELS) {
        sprintf(P(buttons[buttonCount].text), S("  %s<:%s Previous Level  "), P(yellowColorEscape), P(whiteColorEscape));
      } else {
        strcpy(P(buttons[buttonCount].text), S("  Previous Level  "));
      }
      buttons[buttonCount].hotkey[0] = ASCEND_KEY;
      buttonCount = buttonCount + 1 << 16 >> 16;
      if (KEYBOARD_LABELS) {
        sprintf(P(buttons[buttonCount].text), S("  %s>:%s Next Level  "), P(yellowColorEscape), P(whiteColorEscape));
      } else {
        strcpy(P(buttons[buttonCount].text), S("  Next Level  "));
      }
      buttons[buttonCount].hotkey[0] = DESCEND_KEY;
      buttonCount = buttonCount + 1 << 16 >> 16;
      sprintf(P(buttons[buttonCount].text), S("    %s---"), P(darkGrayColorEscape));
      ($t2 = buttons[buttonCount], $t2.flags = ($t2.flags & ~B_ENABLED >>> 0) >>> 0);
      buttonCount = buttonCount + 1 << 16 >> 16;
    } else {
      if (KEYBOARD_LABELS) {
        sprintf(P(buttons[buttonCount].text), S("  %sZ: %sRest until better  "), P(yellowColorEscape), P(whiteColorEscape));
      } else {
        strcpy(P(buttons[buttonCount].text), S("  Rest until better  "));
      }
      buttons[buttonCount].hotkey[0] = AUTO_REST_KEY;
      buttonCount = buttonCount + 1 << 16 >> 16;
      if (KEYBOARD_LABELS) {
        sprintf(P(buttons[buttonCount].text), S("  %sA: %sAutopilot  "), P(yellowColorEscape), P(whiteColorEscape));
      } else {
        strcpy(P(buttons[buttonCount].text), S("  Autopilot  "));
      }
      buttons[buttonCount].hotkey[0] = AUTOPLAY_KEY;
      buttonCount = buttonCount + 1 << 16 >> 16;
      if (KEYBOARD_LABELS) {
        sprintf(P(buttons[buttonCount].text), S("  %sT: %sRe-throw at last monster  "), P(yellowColorEscape), P(whiteColorEscape));
      } else {
        strcpy(P(buttons[buttonCount].text), S("  Re-throw at last monster  "));
      }
      buttons[buttonCount].hotkey[0] = RETHROW_KEY;
      buttonCount = buttonCount + 1 << 16 >> 16;
      if (G.rogue.mode >>> 0 !== GAME_MODE_EASY) {
        if (KEYBOARD_LABELS) {
          sprintf(P(buttons[buttonCount].text), S("  %s&: %sEasy mode  "), P(yellowColorEscape), P(whiteColorEscape));
        } else {
          strcpy(P(buttons[buttonCount].text), S("  Easy mode  "));
        }
        buttons[buttonCount].hotkey[0] = EASY_MODE_KEY;
        buttonCount = buttonCount + 1 << 16 >> 16;
      }
      sprintf(P(buttons[buttonCount].text), S("    %s---"), P(darkGrayColorEscape));
      ($t3 = buttons[buttonCount], $t3.flags = ($t3.flags & ~B_ENABLED >>> 0) >>> 0);
      buttonCount = buttonCount + 1 << 16 >> 16;
    }
    if (KEYBOARD_LABELS) {
      sprintf(P(buttons[buttonCount].text), S("  %s\\: %s[%s] Hide color effects  "), P(yellowColorEscape), P(whiteColorEscape), G.rogue.trueColorMode ? S("X") : S(" "));
    } else {
      sprintf(P(buttons[buttonCount].text), S("  [%s] Hide color effects  "), G.rogue.trueColorMode ? S(" ") : S("X"));
    }
    buttons[buttonCount].hotkey[0] = TRUE_COLORS_KEY;
    takeActionOurselves[buttonCount] = true_;
    buttonCount = buttonCount + 1 << 16 >> 16;
    if (KEYBOARD_LABELS) {
      sprintf(P(buttons[buttonCount].text), S("  %s]: %s[%s] Display stealth range  "), P(yellowColorEscape), P(whiteColorEscape), G.rogue.displayStealthRangeMode ? S("X") : S(" "));
    } else {
      sprintf(P(buttons[buttonCount].text), S("  [%s] Show stealth range  "), G.rogue.displayStealthRangeMode ? S("X") : S(" "));
    }
    buttons[buttonCount].hotkey[0] = STEALTH_RANGE_KEY;
    takeActionOurselves[buttonCount] = true_;
    buttonCount = buttonCount + 1 << 16 >> 16;
    if (G.hasGraphics) {
      if (KEYBOARD_LABELS) {
        sprintf(P(buttons[buttonCount].text), S("  %sG: %s[%c] Enable graphics  "), P(yellowColorEscape), P(whiteColorEscape), S(" X~")[G.graphicsMode]);
      } else {
        sprintf(P(buttons[buttonCount].text), S("  [%c] Enable graphics  "), S(" X~")[G.graphicsMode]);
      }
      buttons[buttonCount].hotkey[0] = GRAPHICS_KEY;
      takeActionOurselves[buttonCount] = true_;
      buttonCount = buttonCount + 1 << 16 >> 16;
    }
    sprintf(P(buttons[buttonCount].text), S("    %s---"), P(darkGrayColorEscape));
    ($t4 = buttons[buttonCount], $t4.flags = ($t4.flags & ~B_ENABLED >>> 0) >>> 0);
    buttonCount = buttonCount + 1 << 16 >> 16;
    if (KEYBOARD_LABELS) {
      sprintf(P(buttons[buttonCount].text), S("  %sF: %sFeats             "), P(yellowColorEscape), P(whiteColorEscape));
    } else {
      strcpy(P(buttons[buttonCount].text), S("  Feats             "));
    }
    buttons[buttonCount].hotkey[0] = FEATS_KEY;
    buttonCount = buttonCount + 1 << 16 >> 16;
    if (KEYBOARD_LABELS) {
      sprintf(P(buttons[buttonCount].text), S("  %sD: %sDiscovered items  "), P(yellowColorEscape), P(whiteColorEscape));
    } else {
      strcpy(P(buttons[buttonCount].text), S("  Discovered items  "));
    }
    buttons[buttonCount].hotkey[0] = DISCOVERIES_KEY;
    if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD) {
      buttonCount = buttonCount + 1 << 16 >> 16;
      if (KEYBOARD_LABELS) {
        sprintf(P(buttons[buttonCount].text), S("  %sC: %sCreate item or monster  "), P(yellowColorEscape), P(whiteColorEscape));
      } else {
        strcpy(P(buttons[buttonCount].text), S("  Create item or monster  "));
      }
      buttons[buttonCount].hotkey[0] = CREATE_ITEM_MONSTER_KEY;
    }
    buttonCount = buttonCount + 1 << 16 >> 16;
    if (KEYBOARD_LABELS) {
      sprintf(P(buttons[buttonCount].text), S("  %s~: %sView dungeon seed  "), P(yellowColorEscape), P(whiteColorEscape));
    } else {
      strcpy(P(buttons[buttonCount].text), S("  View dungeon seed  "));
    }
    buttons[buttonCount].hotkey[0] = SEED_KEY;
    buttonCount = buttonCount + 1 << 16 >> 16;
    if (KEYBOARD_LABELS) {
      sprintf(P(buttons[buttonCount].text), S("  %s?: %sHelp  "), P(yellowColorEscape), P(whiteColorEscape));
      buttons[buttonCount].hotkey[0] = BROGUE_HELP_KEY;
      buttonCount = buttonCount + 1 << 16 >> 16;
    }
    sprintf(P(buttons[buttonCount].text), S("    %s---"), P(darkGrayColorEscape));
    ($t5 = buttons[buttonCount], $t5.flags = ($t5.flags & ~B_ENABLED >>> 0) >>> 0);
    buttonCount = buttonCount + 1 << 16 >> 16;
    if (!G.serverMode) {
      if (playingBack) {
        if (KEYBOARD_LABELS) {
          sprintf(P(buttons[buttonCount].text), S("  %sO: %sOpen saved game  "), P(yellowColorEscape), P(whiteColorEscape));
        } else {
          strcpy(P(buttons[buttonCount].text), S("  Open saved game  "));
        }
        buttons[buttonCount].hotkey[0] = LOAD_SAVED_GAME_KEY;
        buttonCount = buttonCount + 1 << 16 >> 16;
        if (KEYBOARD_LABELS) {
          sprintf(P(buttons[buttonCount].text), S("  %sV: %sView saved recording  "), P(yellowColorEscape), P(whiteColorEscape));
        } else {
          strcpy(P(buttons[buttonCount].text), S("  View saved recording  "));
        }
        buttons[buttonCount].hotkey[0] = VIEW_RECORDING_KEY;
        buttonCount = buttonCount + 1 << 16 >> 16;
      } else {
        if (KEYBOARD_LABELS) {
          sprintf(P(buttons[buttonCount].text), S("  %sS: %sSave and exit  "), P(yellowColorEscape), P(whiteColorEscape));
        } else {
          strcpy(P(buttons[buttonCount].text), S("  Save and exit  "));
        }
        buttons[buttonCount].hotkey[0] = SAVE_GAME_KEY;
        buttonCount = buttonCount + 1 << 16 >> 16;
      }
    }
    if (KEYBOARD_LABELS) {
      sprintf(P(buttons[buttonCount].text), S("  %sQ: %sQuit %s  "), P(yellowColorEscape), P(whiteColorEscape), playingBack ? S("to title screen") : S("and abandon game"));
    } else {
      sprintf(P(buttons[buttonCount].text), S("  Quit %s  "), playingBack ? S("to title screen") : S("and abandon game"));
    }
    buttons[buttonCount].hotkey[0] = QUIT_KEY;
    buttonCount = buttonCount + 1 << 16 >> 16;
    strcpy(P(buttons[buttonCount].text), S(" "));
    ($t6 = buttons[buttonCount], $t6.flags = ($t6.flags & ~B_ENABLED >>> 0) >>> 0);
    buttonCount = buttonCount + 1 << 16 >> 16;
    for (i = 0; buttonCount > i; i = i + 1 << 16 >> 16) {
      longestName = (longestName > strLenWithoutEscapes(P(buttons[i].text)) ? longestName : strLenWithoutEscapes(P(buttons[i].text))) << 16 >> 16;
    }
    if (x + longestName >= COLS) {
      x = COLS - longestName - 1 << 16 >> 16;
    }
    y = ROWS - buttonCount << 16 >> 16;
    for (i = 0; buttonCount > i; i = i + 1 << 16 >> 16) {
      buttons[i].x = x;
      buttons[i].y = y + i << 16 >> 16;
      for (j = strLenWithoutEscapes(P(buttons[i].text)); longestName > j; j = j + 1 << 16 >> 16) {
        strcat(P(buttons[i].text), S(" "));
      }
    }
    let rbuf = saveDisplayBuffer().$clone();
    let dbuf = new struct_screenDisplayBuffer();
    clearDisplayBuffer(dbuf);
    rectangularShading(x - 1 << 16 >> 16, y, longestName + 2 << 16 >> 16, buttonCount, G.black, (INTERFACE_OPACITY / 2 | 0) << 16 >> 16, dbuf);
    overlayDisplayBuffer(dbuf);
    buttonChosen = await buttonInputLoop(buttons[0], buttonCount, x - 1 << 16 >> 16, y, longestName + 2 << 16 >> 16, buttonCount, null);
    restoreDisplayBuffer(rbuf);
    if (buttonChosen === -1) {
      return -1;
    } else if (takeActionOurselves[buttonChosen]) {
      theEvent.eventType = KEYSTROKE;
      theEvent.param1 = buttons[buttonChosen].hotkey[0];
      theEvent.param2 = 0;
      theEvent.shiftKey = theEvent.controlKey = false_;
      await executeEvent(theEvent);
    } else {
      return buttons[buttonChosen].hotkey[0] << 16 >> 16;
    }
  } while (takeActionOurselves[buttonChosen]);
  ;
  return -1;
}

function initializeMenuButtons(state: struct_buttonState | null, buttons: struct_brogueButton | null): void {
  let $t1: any, $t2: any;
  let i = 0;
  let x = 0;
  let buttonCount = 0;
  let goldTextEscape = $cs("", 5);
  let whiteTextEscape = $cs("", 5);
  encodeMessageColor(P(goldTextEscape), 0, KEYBOARD_LABELS ? G.yellow : G.white);
  encodeMessageColor(P(whiteTextEscape), 0, G.white);
  for (i = 0; MAX_MENU_BUTTON_COUNT > i; i = i + 1 << 16 >> 16) {
    initializeButton($sadd(buttons, i));
    $sadd(buttons, i).opacity = 75;
    $sadd(buttons, i).buttonColor.$cp(G.interfaceButtonColor);
    $sadd(buttons, i).y = ROWS - 1;
    ($t1 = $sadd(buttons, i), $t1.flags = ($t1.flags | B_WIDE_CLICK_AREA) >>> 0);
    ($t2 = $sadd(buttons, i), $t2.flags = ($t2.flags & ~B_KEYPRESS_HIGHLIGHT >>> 0) >>> 0);
  }
  buttonCount = 0;
  if (G.rogue.playbackMode) {
    if (KEYBOARD_LABELS) {
      sprintf(P($sadd(buttons, buttonCount).text), S(" Unpause (%sspace%s) "), P(goldTextEscape), P(whiteTextEscape));
    } else {
      strcpy(P($sadd(buttons, buttonCount).text), S("     Unpause     "));
    }
    $sadd(buttons, buttonCount).hotkey[0] = ACKNOWLEDGE_KEY;
    buttonCount = buttonCount + 1 << 16 >> 16;
    if (KEYBOARD_LABELS) {
      sprintf(P($sadd(buttons, buttonCount).text), S("Omniscience (%stab%s)"), P(goldTextEscape), P(whiteTextEscape));
    } else {
      strcpy(P($sadd(buttons, buttonCount).text), S("   Omniscience   "));
    }
    $sadd(buttons, buttonCount).hotkey[0] = TAB_KEY;
    buttonCount = buttonCount + 1 << 16 >> 16;
    if (KEYBOARD_LABELS) {
      sprintf(P($sadd(buttons, buttonCount).text), S(" Next Turn (%sl%s) "), P(goldTextEscape), P(whiteTextEscape));
    } else {
      strcpy(P($sadd(buttons, buttonCount).text), S("   Next Turn   "));
    }
    $sadd(buttons, buttonCount).hotkey[0] = RIGHT_KEY;
    $sadd(buttons, buttonCount).hotkey[1] = RIGHT_ARROW;
    buttonCount = buttonCount + 1 << 16 >> 16;
    strcpy(P($sadd(buttons, buttonCount).text), S("  Menu  "));
    buttonCount = buttonCount + 1 << 16 >> 16;
  } else {
    sprintf(P($sadd(buttons, buttonCount).text), S("   E%sx%splore   "), P(goldTextEscape), P(whiteTextEscape));
    $sadd(buttons, buttonCount).hotkey[0] = EXPLORE_KEY;
    $sadd(buttons, buttonCount).hotkey[1] = 88;
    buttonCount = buttonCount + 1 << 16 >> 16;
    if (KEYBOARD_LABELS) {
      sprintf(P($sadd(buttons, buttonCount).text), S("   Rest (%sz%s)   "), P(goldTextEscape), P(whiteTextEscape));
    } else {
      strcpy(P($sadd(buttons, buttonCount).text), S("     Rest     "));
    }
    $sadd(buttons, buttonCount).hotkey[0] = REST_KEY;
    buttonCount = buttonCount + 1 << 16 >> 16;
    if (KEYBOARD_LABELS) {
      sprintf(P($sadd(buttons, buttonCount).text), S("  Search (%ss%s)  "), P(goldTextEscape), P(whiteTextEscape));
    } else {
      strcpy(P($sadd(buttons, buttonCount).text), S("    Search    "));
    }
    $sadd(buttons, buttonCount).hotkey[0] = SEARCH_KEY;
    buttonCount = buttonCount + 1 << 16 >> 16;
    strcpy(P($sadd(buttons, buttonCount).text), S("    Menu    "));
    buttonCount = buttonCount + 1 << 16 >> 16;
  }
  sprintf(P($sadd(buttons, 4).text), S("   %sI%snventory   "), P(goldTextEscape), P(whiteTextEscape));
  $sadd(buttons, 4).hotkey[0] = INVENTORY_KEY;
  $sadd(buttons, 4).hotkey[1] = 73;
  x = 0 + 20 + 1;
  for (i = 0; 5 > i; i = i + 1 << 16 >> 16) {
    $sadd(buttons, i).x = x;
    x = x + (strLenWithoutEscapes(P($sadd(buttons, i).text)) + 2) << 16 >> 16;
  }
  initializeButtonState(state, buttons, 5, 0 + 20 + 1, ROWS - 1, COLS - (0 + 20 + 1), 1);
}

export async function mainInputLoop(): Promise<void> {
  let oldTargetLoc = struct_pos.$of();
  let steps = 0;
  let oldRNG = 0;
  let dir = 0;
  let path = $sarr(struct_pos, 1000);
  let monst = null;
  let theItem = null;
  let rbuf = new struct_SavedDisplayBuffer();
  const canceled = new Int8Array(1);
  const targetConfirmed = new Int8Array(1);
  const tabKey = new Int8Array(1);
  let focusedOnMonster = 0;
  let focusedOnItem = 0;
  let focusedOnTerrain = 0;
  let playingBack = 0;
  let doEvent = 0;
  let textDisplayed = 0;
  let theEvent = new struct_rogueEvent();
  let costMap = null;
  let playerPathingMap = null;
  let cursorSnapMap = null;
  let buttons = $sarrOf([struct_brogueButton.$of(new Int8Array(300), 0, 0, new Float64Array(10), new struct_color(), new struct_color(), new struct_color(), 0, new Int32Array(100)),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton()]);
  let state = new struct_buttonState();
  let buttonInput = 0;
  let backupCost = 0;
  canceled[0] = false_;
  G.rogue.cursorMode = false_;
  steps = 0;
  G.rogue.cursorPathIntensity = (G.rogue.cursorMode ? 50 : 20) << 16 >> 16;
  initializeMenuButtons(state, buttons[0]);
  playingBack = G.rogue.playbackMode;
  G.rogue.playbackMode = false_;
  costMap = allocGrid();
  playerPathingMap = allocGrid();
  cursorSnapMap = allocGrid();
  G.rogue.cursorLoc.$cp(struct_pos.$of(-1, -1));
  while (!G.rogue.gameHasEnded && (!playingBack || !canceled[0])) {
    oldRNG = G.rogue.RNG;
    G.rogue.RNG = RNG_COSMETIC;
    focusedOnMonster = focusedOnItem = focusedOnTerrain = false_;
    steps = 0;
    await clearCursorPath();
    let originLoc = G.player.loc.$clone();
    if (playingBack && G.rogue.cursorMode) {
      await temporaryMessage(S("Examine what? (<hjklyubn>, mouse, or <tab>)"), 0);
    }
    if (!playingBack && posEq(G.player.loc, G.rogue.cursorLoc) && posEq(oldTargetLoc, G.rogue.cursorLoc)) {
      G.rogue.cursorMode = false_;
      G.rogue.cursorPathIntensity = (G.rogue.cursorMode ? 50 : 20) << 16 >> 16;
      G.rogue.cursorLoc.$cp(struct_pos.$of(-1, -1));
    }
    oldTargetLoc.$cp(G.rogue.cursorLoc);
    await populateCreatureCostMap(costMap, G.player);
    fillGrid(playerPathingMap, 30000);
    $wr(playerPathingMap.a[playerPathingMap.o + G.player.loc.x], G.player.loc.y, 0);
    dijkstraScan(playerPathingMap, costMap, true_);
    await processSnapMap(cursorSnapMap);
    do {
      textDisplayed = false_;
      if (isPosInMap(oldTargetLoc)) {
        await refreshDungeonCell(oldTargetLoc.$clone());
      }
      if (!playingBack) {
        if (isPosInMap(oldTargetLoc)) {
          await hilitePath(path[0], steps, true_);
        }
        if (isPosInMap(G.rogue.cursorLoc)) {
          let pathDestination = new struct_pos();
          if ($rd(cursorSnapMap.a[cursorSnapMap.o + G.rogue.cursorLoc.x], G.rogue.cursorLoc.y) >= 0 && 30000 > $rd(cursorSnapMap.a[cursorSnapMap.o + G.rogue.cursorLoc.x], G.rogue.cursorLoc.y)) {
            pathDestination.$cp(G.rogue.cursorLoc);
          } else {
            pathDestination.$cp(getClosestValidLocationOnMap(cursorSnapMap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y));
          }
          fillGrid(playerPathingMap, 30000);
          $wr(playerPathingMap.a[playerPathingMap.o + pathDestination.x], pathDestination.y, 0);
          backupCost = $rd(costMap.a[costMap.o + pathDestination.x], pathDestination.y);
          $wr(costMap.a[costMap.o + pathDestination.x], pathDestination.y, 1);
          dijkstraScan(playerPathingMap, costMap, true_);
          $wr(costMap.a[costMap.o + pathDestination.x], pathDestination.y, backupCost);
          steps = getPlayerPathOnMap(path[0], playerPathingMap, G.player.loc.$clone());
          if (steps >= 0) {
            path[steps].$cp(pathDestination);
          }
          steps = steps + 1 << 16 >> 16;
          if ($rd(playerPathingMap.a[playerPathingMap.o + G.player.loc.x], G.player.loc.y) !== 1 || !posEq(pathDestination, G.rogue.cursorLoc)) {
            await hilitePath(path[0], steps, false_);
          }
        }
      }
      if (isPosInMap(G.rogue.cursorLoc)) {
        await hiliteCell(G.rogue.cursorLoc.x, G.rogue.cursorLoc.y, G.white, (0 >= steps || posEq(path[steps - 1], G.rogue.cursorLoc) || !playingBack && distanceBetween(G.player.loc, G.rogue.cursorLoc) <= 1 ? 100 : 25) << 16 >> 16, true_);
        oldTargetLoc.$cp(G.rogue.cursorLoc);
        monst = monsterAtLoc(G.rogue.cursorLoc);
        theItem = await itemAtLoc(G.rogue.cursorLoc.$clone());
        if (!!monst && (canSeeMonster(monst) || G.rogue.playbackOmniscience)) {
          G.rogue.playbackMode = playingBack;
          await refreshSideBar(G.rogue.cursorLoc.x, G.rogue.cursorLoc.y, false_);
          G.rogue.playbackMode = false_;
          focusedOnMonster = true_;
          if (monst !== G.player && (!G.player.status[STATUS_HALLUCINATING] || G.rogue.playbackOmniscience || G.player.status[STATUS_TELEPATHIC])) {
            rbuf.$cp(saveDisplayBuffer());
            await printMonsterDetails(monst);
            textDisplayed = true_;
          }
        } else if (!!theItem && (($at2(G.pmap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y).flags & DISCOVERED) >>> 0))) {
          G.rogue.playbackMode = playingBack;
          await refreshSideBar(G.rogue.cursorLoc.x, G.rogue.cursorLoc.y, false_);
          G.rogue.playbackMode = false_;
          focusedOnItem = true_;
          if (!G.player.status[STATUS_HALLUCINATING] || G.rogue.playbackOmniscience) {
            rbuf.$cp(saveDisplayBuffer());
            await printFloorItemDetails(theItem);
            textDisplayed = true_;
          }
        } else if (cellHasTMFlag(G.rogue.cursorLoc, TM_LIST_IN_SIDEBAR) && (($at2(G.pmap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y).flags & DISCOVERED) >>> 0))) {
          G.rogue.playbackMode = playingBack;
          await refreshSideBar(G.rogue.cursorLoc.x, G.rogue.cursorLoc.y, false_);
          G.rogue.playbackMode = false_;
          focusedOnTerrain = true_;
        }
        await printLocationDescription(G.rogue.cursorLoc.x, G.rogue.cursorLoc.y);
      }
      G.rogue.playbackMode = playingBack;
      doEvent = await moveCursor(P(targetConfirmed, 0), P(canceled, 0), P(tabKey, 0), G.rogue.cursorLoc, theEvent, state, (!textDisplayed ? 1 : 0) << 24 >> 24, G.rogue.cursorMode, true_);
      G.rogue.playbackMode = false_;
      if (state.buttonChosen === 3) {
        buttonInput = await actionMenu(buttons[3].x - 4 << 16 >> 16, playingBack);
        if (buttonInput === -1) {
          doEvent = false_;
        } else {
          theEvent.eventType = KEYSTROKE;
          theEvent.param1 = buttonInput;
          theEvent.param2 = 0;
          theEvent.shiftKey = theEvent.controlKey = false_;
          doEvent = true_;
        }
      } else if (state.buttonChosen > -1) {
        theEvent.eventType = KEYSTROKE;
        theEvent.param1 = buttons[state.buttonChosen].hotkey[0];
        theEvent.param2 = 0;
      }
      state.buttonChosen = -1;
      if (playingBack) {
        if (canceled[0]) {
          G.rogue.cursorMode = false_;
          G.rogue.cursorPathIntensity = (G.rogue.cursorMode ? 50 : 20) << 16 >> 16;
        }
        if (theEvent.eventType >>> 0 === KEYSTROKE && theEvent.param1 === ACKNOWLEDGE_KEY) {
          canceled[0] = true_;
        } else {
          canceled[0] = false_;
        }
      }
      if (focusedOnMonster || focusedOnItem || focusedOnTerrain) {
        focusedOnMonster = false_;
        focusedOnItem = false_;
        focusedOnTerrain = false_;
        if (textDisplayed) {
          restoreDisplayBuffer(rbuf);
        }
        G.rogue.playbackMode = playingBack;
        await refreshSideBar(-1, -1, false_);
        G.rogue.playbackMode = false_;
      }
      if (tabKey[0] && !playingBack) {
        let newLoc = new struct_pos();
        if (await nextTargetAfter(null, newLoc, G.rogue.cursorLoc.$clone(), AUTOTARGET_MODE_EXPLORE, theEvent.shiftKey)) {
          G.rogue.cursorLoc.$cp(newLoc);
        }
      }
      if (theEvent.eventType >>> 0 === KEYSTROKE && (theEvent.param1 === ASCEND_KEY && G.rogue.cursorLoc.x === G.rogue.upLoc.x && G.rogue.cursorLoc.y === G.rogue.upLoc.y || theEvent.param1 === DESCEND_KEY && G.rogue.cursorLoc.x === G.rogue.downLoc.x && G.rogue.cursorLoc.y === G.rogue.downLoc.y)) {
        targetConfirmed[0] = true_;
        doEvent = false_;
      }
    } while (!targetConfirmed[0] && !canceled[0] && !doEvent && !G.rogue.gameHasEnded);
    if (isPosInMap(oldTargetLoc)) {
      await refreshDungeonCell(oldTargetLoc.$clone());
    }
    G.rogue.RNG = oldRNG;
    ;
    if (canceled[0] && !playingBack) {
      hideCursor();
      confirmMessages();
    } else if (targetConfirmed[0] && !playingBack && isPosInMap(G.rogue.cursorLoc)) {
      if (theEvent.eventType >>> 0 === MOUSE_UP && theEvent.controlKey && steps > 1) {
        for (dir = 0; DIRECTION_COUNT > dir && !posEq(posNeighborInDirection(G.player.loc, dir), path[0]); dir = dir + 1 << 16 >> 16) {
          ;
        }
        await playerMoves(dir);
      } else if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 1) {
        await travel(G.rogue.cursorLoc.$clone(), true_);
      } else {
        confirmMessages();
        if (posEq(originLoc, G.rogue.cursorLoc)) {
          confirmMessages();
        } else if (Math.abs(G.player.loc.x - G.rogue.cursorLoc.x) + Math.abs(G.player.loc.y - G.rogue.cursorLoc.y) === 1 || distanceBetween(G.player.loc, G.rogue.cursorLoc) === 1 && (!diagonalBlocked(G.player.loc.x, G.player.loc.y, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y, (!G.rogue.playbackOmniscience ? 1 : 0) << 24 >> 24) || (pmapAt(G.rogue.cursorLoc).flags & HAS_MONSTER) >>> 0 && (monsterAtLoc(G.rogue.cursorLoc).info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0 || (terrainFlags(G.rogue.cursorLoc) & T_OBSTRUCTS_PASSABILITY) >>> 0 && (terrainMechFlags(G.rogue.cursorLoc) & TM_PROMOTES_ON_PLAYER_ENTRY) >>> 0)) {
          for (dir = 0; DIRECTION_COUNT > dir && (G.player.loc.x + G.nbDirs[dir][0] !== G.rogue.cursorLoc.x || G.player.loc.y + G.nbDirs[dir][1] !== G.rogue.cursorLoc.y); dir = dir + 1 << 16 >> 16) {
            ;
          }
          await playerMoves(dir);
        } else if (steps) {
          await travelRoute(path[0], steps);
        }
      }
    } else if (doEvent) {
      ;
      if (playingBack) {
        G.rogue.playbackMode = true_;
        await executePlaybackInput(theEvent);
        playingBack = G.rogue.playbackMode;
        G.rogue.playbackMode = false_;
      } else {
        await executeEvent(theEvent);
        if (G.rogue.playbackMode) {
          playingBack = true_;
          G.rogue.playbackMode = false_;
          confirmMessages();
          break;
        }
      }
    }
  }
  G.rogue.playbackMode = playingBack;
  await refreshSideBar(-1, -1, false_);
  freeGrid(costMap);
  freeGrid(playerPathingMap);
  freeGrid(cursorSnapMap);
}

export function considerCautiousMode(): void {
}

export function commitDraws(): void {
  for (let j = 0; ROWS > j; ++j) {
    for (let i = 0; COLS > i; ++i) {
      let lastPlotted = $sat(previouslyPlottedCells.cells[i], j);
      let curr = $sat(G.displayBuffer.cells[i], j);
      let needsUpdate = (lastPlotted.character >>> 0 !== curr.character >>> 0 || lastPlotted.foreColorComponents[0] !== curr.foreColorComponents[0] || lastPlotted.foreColorComponents[1] !== curr.foreColorComponents[1] || lastPlotted.foreColorComponents[2] !== curr.foreColorComponents[2] || lastPlotted.backColorComponents[0] !== curr.backColorComponents[0] || lastPlotted.backColorComponents[1] !== curr.backColorComponents[1] || lastPlotted.backColorComponents[2] !== curr.backColorComponents[2] ? 1 : 0) << 24 >> 24;
      if (!needsUpdate) {
        continue;
      }
      plotChar(curr.character, i << 16 >> 16, j << 16 >> 16, curr.foreColorComponents[0], curr.foreColorComponents[1], curr.foreColorComponents[2], curr.backColorComponents[0], curr.backColorComponents[1], curr.backColorComponents[2]);
      lastPlotted.$cp(curr);
    }
  }
}

export function refreshScreen(): void {
  for (let i = 0; COLS > i; ++i) {
    for (let j = 0; ROWS > j; ++j) {
      let curr = $sat(G.displayBuffer.cells[i], j);
      plotChar(curr.character, i << 16 >> 16, j << 16 >> 16, curr.foreColorComponents[0], curr.foreColorComponents[1], curr.foreColorComponents[2], curr.backColorComponents[0], curr.backColorComponents[1], curr.backColorComponents[2]);
      $at2(previouslyPlottedCells.cells, i, j).$cp(curr);
    }
  }
}

export async function displayLevel(): Promise<void> {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = DROWS - 1; j >= 0; j = j - 1 << 16 >> 16) {
      await refreshDungeonCell(struct_pos.$of(i, j));
    }
  }
}

export function storeColorComponents(components: Ptr | null, theColor: struct_color | null): void {
  let rand = rand_range(0, theColor.rand) << 16 >> 16;
  components.a[components.o] = (0 > (100 < theColor.red + rand_range(0, theColor.redRand) + rand ? 100 : theColor.red + rand_range(0, theColor.redRand) + rand) ? 0 : 100 < theColor.red + rand_range(0, theColor.redRand) + rand ? 100 : theColor.red + rand_range(0, theColor.redRand) + rand) << 24 >> 24;
  components.a[components.o + 1] = (0 > (100 < theColor.green + rand_range(0, theColor.greenRand) + rand ? 100 : theColor.green + rand_range(0, theColor.greenRand) + rand) ? 0 : 100 < theColor.green + rand_range(0, theColor.greenRand) + rand ? 100 : theColor.green + rand_range(0, theColor.greenRand) + rand) << 24 >> 24;
  components.a[components.o + 2] = (0 > (100 < theColor.blue + rand_range(0, theColor.blueRand) + rand ? 100 : theColor.blue + rand_range(0, theColor.blueRand) + rand) ? 0 : 100 < theColor.blue + rand_range(0, theColor.blueRand) + rand ? 100 : theColor.blue + rand_range(0, theColor.blueRand) + rand) << 24 >> 24;
}

function bakeTerrainColors(foreColor: struct_color | null, backColor: struct_color | null, x: number, y: number): void {
  let $t1: any, $t2: any;
  let vals = null;
  let neutralColors = $ta(Int16Array, 8, [500, 500, 500, 500, 500, 500]);
  if (G.rogue.trueColorMode) {
    vals = P(neutralColors);
  } else {
    vals = P(G.terrainRandomValues[x][y], 0);
  }
  let foreRand = (Math.imul(foreColor.rand, vals.a[vals.o + 6]) / 1000 | 0) << 16 >> 16;
  let backRand = (Math.imul(backColor.rand, vals.a[vals.o + 7]) / 1000 | 0) << 16 >> 16;
  foreColor.red = foreColor.red + ((Math.imul(foreColor.redRand, vals.a[vals.o]) / 1000 | 0) + foreRand) << 16 >> 16;
  foreColor.green = foreColor.green + ((Math.imul(foreColor.greenRand, vals.a[vals.o + 1]) / 1000 | 0) + foreRand) << 16 >> 16;
  foreColor.blue = foreColor.blue + ((Math.imul(foreColor.blueRand, vals.a[vals.o + 2]) / 1000 | 0) + foreRand) << 16 >> 16;
  foreColor.redRand = foreColor.greenRand = foreColor.blueRand = foreColor.rand = 0;
  backColor.red = backColor.red + ((Math.imul(backColor.redRand, vals.a[vals.o + 3]) / 1000 | 0) + backRand) << 16 >> 16;
  backColor.green = backColor.green + ((Math.imul(backColor.greenRand, vals.a[vals.o + 4]) / 1000 | 0) + backRand) << 16 >> 16;
  backColor.blue = backColor.blue + ((Math.imul(backColor.blueRand, vals.a[vals.o + 5]) / 1000 | 0) + backRand) << 16 >> 16;
  backColor.redRand = backColor.greenRand = backColor.blueRand = backColor.rand = 0;
  if (foreColor.colorDances || backColor.colorDances) {
    ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags | TERRAIN_COLORS_DANCING) >>> 0);
  } else {
    ($t2 = $at2(G.pmap, x, y), $t2.flags = ($t2.flags & ~TERRAIN_COLORS_DANCING >>> 0) >>> 0);
  }
}

export function bakeColor(theColor: struct_color | null): void {
  let rand = 0;
  rand = rand_range(0, theColor.rand) << 16 >> 16;
  theColor.red = theColor.red + (rand_range(0, theColor.redRand) + rand) << 16 >> 16;
  theColor.green = theColor.green + (rand_range(0, theColor.greenRand) + rand) << 16 >> 16;
  theColor.blue = theColor.blue + (rand_range(0, theColor.blueRand) + rand) << 16 >> 16;
  theColor.redRand = theColor.greenRand = theColor.blueRand = theColor.rand = 0;
}

export async function shuffleTerrainColors(percentOfCells: number, refreshCells: number): Promise<void> {
  let $t1: any, $t2: any;
  let dir = 0;
  let i = 0;
  let j = 0;
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ((($at2(G.pmap, i, j).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, i, j).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, i, j).flags & DISCOVERED) >>> 0)) && (!G.rogue.automationActive || !(G.rogue.playerTurnNumber % 5)) && (($at2(G.pmap, i, j).flags & TERRAIN_COLORS_DANCING) >>> 0 || G.player.status[STATUS_HALLUCINATING] && ($at2(G.pmap, i, j).flags & VISIBLE) >>> 0) && (i !== G.rogue.cursorLoc.x || j !== G.rogue.cursorLoc.y) && (percentOfCells >= 100 || rand_range(1, 100) <= percentOfCells)) {
        for (dir = 0; DIRECTION_COUNT > dir; ++dir) {
          ($t1 = G.terrainRandomValues[i][j], $t2 = dir, $t1[$t2] = $t1[$t2] + rand_range(-600, 600) << 16 >> 16);
          G.terrainRandomValues[i][j][dir] = ((G.terrainRandomValues[i][j][dir] > 0 ? G.terrainRandomValues[i][j][dir] : 0) > 1000 ? 1000 : G.terrainRandomValues[i][j][dir] > 0 ? G.terrainRandomValues[i][j][dir] : 0) << 16 >> 16;
        }
        if (refreshCells) {
          await refreshDungeonCell(struct_pos.$of(i, j));
        }
      }
    }
  }
  G.rogue.RNG = oldRNG;
  ;
}

export function separateColors(fore: struct_color | null, back: struct_color | null): number {
  let f = new struct_color();
  let b = new struct_color();
  let modifier = null;
  let failsafe = 0;
  let madeChange = 0;
  f.$cp(fore);
  b.$cp(back);
  f.red = ((f.red > 0 ? f.red : 0) > 100 ? 100 : f.red > 0 ? f.red : 0) << 16 >> 16;
  f.green = ((f.green > 0 ? f.green : 0) > 100 ? 100 : f.green > 0 ? f.green : 0) << 16 >> 16;
  f.blue = ((f.blue > 0 ? f.blue : 0) > 100 ? 100 : f.blue > 0 ? f.blue : 0) << 16 >> 16;
  b.red = ((b.red > 0 ? b.red : 0) > 100 ? 100 : b.red > 0 ? b.red : 0) << 16 >> 16;
  b.green = ((b.green > 0 ? b.green : 0) > 100 ? 100 : b.green > 0 ? b.green : 0) << 16 >> 16;
  b.blue = ((b.blue > 0 ? b.blue : 0) > 100 ? 100 : b.blue > 0 ? b.blue : 0) << 16 >> 16;
  if (f.red + f.blue + f.green > 50 * 3) {
    modifier = G.black;
  } else {
    modifier = G.white;
  }
  madeChange = false_;
  failsafe = 10;
  while (MIN_COLOR_DIFF > Math.imul(f.red - b.red, f.red - b.red) * 0.21260000000000001 + Math.imul(f.green - b.green, f.green - b.green) * 0.71519999999999995 + Math.imul(f.blue - b.blue, f.blue - b.blue) * 0.0722 && (failsafe = failsafe - 1 << 16 >> 16)) {
    applyColorAverage(f, modifier, 20);
    madeChange = true_;
  }
  if (madeChange) {
    fore.$cp(f);
    return true_;
  } else {
    return false_;
  }
}

export function normColor(baseColor: struct_color | null, aggregateMultiplier: number, colorTranslation: number): void {
  baseColor.red = baseColor.red + colorTranslation << 16 >> 16;
  baseColor.green = baseColor.green + colorTranslation << 16 >> 16;
  baseColor.blue = baseColor.blue + colorTranslation << 16 >> 16;
  let vectorLength = baseColor.red + baseColor.green + baseColor.blue << 16 >> 16;
  if (vectorLength !== 0) {
    baseColor.red = (Math.imul(baseColor.red * 300 / vectorLength | 0, aggregateMultiplier) / 100 | 0) << 16 >> 16;
    baseColor.green = (Math.imul(baseColor.green * 300 / vectorLength | 0, aggregateMultiplier) / 100 | 0) << 16 >> 16;
    baseColor.blue = (Math.imul(baseColor.blue * 300 / vectorLength | 0, aggregateMultiplier) / 100 | 0) << 16 >> 16;
  }
  baseColor.redRand = 0;
  baseColor.greenRand = 0;
  baseColor.blueRand = 0;
  baseColor.rand = 0;
}

function glyphIsWallish(glyph: number): number {
  switch (glyph >>> 0) {
  case G_WALL:
  case G_OPEN_DOOR:
  case G_CLOSED_DOOR:
  case G_UP_STAIRS:
  case G_DOORWAY:
  case G_WALL_TOP:
  case G_LEVER:
  case G_LEVER_PULLED:
  case G_CLOSED_IRON_DOOR:
  case G_OPEN_IRON_DOOR:
  case G_TURRET:
  case G_GRANITE:
  case G_TORCH:
  case G_PORTCULLIS:
    return true_;
  default:
    return false_;
  }
}

function randomAnimateMonster(): number {
  if (randomAnimateMonster$listLength === 0) {
    for (let i = 0; NUMBER_MONSTER_KINDS > i; ++i) {
      if (!((G.monsterCatalog[i].flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
        randomAnimateMonster$animate[randomAnimateMonster$listLength++] = i;
      }
    }
  }
  return randomAnimateMonster$animate[rand_range(0, randomAnimateMonster$listLength - 1)];
}

export async function getCellAppearance(loc: struct_pos, returnChar: Ptr | null, returnForeColor: struct_color | null, returnBackColor: struct_color | null): Promise<void> {
  let $t1: any;
  let bestBCPriority = 0;
  let bestFCPriority = 0;
  let bestCharPriority = 0;
  let distance = 0;
  let cellChar = 0;
  let cellForeColor = new struct_color();
  let cellBackColor = new struct_color();
  let lightMultiplierColor = G.black.$clone();
  let gasAugmentColor = new struct_color();
  let monsterWithDetectedItem = false_;
  let needDistinctness = false_;
  let gasAugmentWeight = 0;
  let monst = null;
  let theItem = null;
  let tile = NOTHING;
  let layer = 0;
  let maxLayer = 0;
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  ;
  if ((pmapAt(loc).flags & HAS_MONSTER) >>> 0) {
    monst = monsterAtLoc(loc);
  } else if ((pmapAt(loc).flags & HAS_DORMANT_MONSTER) >>> 0) {
    monst = dormantMonsterAtLoc(loc);
  }
  if (monst) {
    monsterWithDetectedItem = (monst.carriedItem && (monst.carriedItem.flags & ITEM_MAGIC_DETECTED) >>> 0 && itemMagicPolarity(monst.carriedItem) && !canSeeMonster(monst) ? 1 : 0) << 24 >> 24;
  }
  if (monsterWithDetectedItem) {
    theItem = monst.carriedItem;
  } else {
    theItem = await itemAtLoc(loc.$clone());
  }
  if (!(($at2(G.pmap, loc.x, loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, loc.x, loc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, loc.x, loc.y).flags & DISCOVERED) >>> 0)) && !((pmapAt(loc).flags & (ITEM_DETECTED | HAS_PLAYER)) >>> 0) && (!monst || !monsterRevealed(monst)) && !monsterWithDetectedItem && (pmapAt(loc).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0 && (pmapAt(loc).flags & STABLE_MEMORY) >>> 0) {
    cellChar = pmapAt(loc).rememberedAppearance.character;
    cellForeColor.$cp(colorFromComponents(P(pmapAt(loc).rememberedAppearance.foreColorComponents)));
    cellBackColor.$cp(colorFromComponents(P(pmapAt(loc).rememberedAppearance.backColorComponents)));
  } else {
    bestFCPriority = bestBCPriority = bestCharPriority = 10000;
    cellForeColor.$cp(G.tileCatalog[FLOOR].foreColor);
    cellBackColor.$cp(G.tileCatalog[FLOOR].backColor);
    cellChar = G.tileCatalog[FLOOR].displayChar;
    if (!((pmapAt(loc).flags & DISCOVERED) >>> 0) && !G.rogue.playbackOmniscience) {
      if ((pmapAt(loc).flags & MAGIC_MAPPED) >>> 0) {
        maxLayer = LIQUID + 1;
      } else {
        maxLayer = 0;
      }
    } else {
      maxLayer = NUMBER_TERRAIN_LAYERS;
    }
    for (layer = 0; maxLayer > layer; ++layer) {
      if (pmapAt(loc).layers[layer] >>> 0 && layer !== GAS) {
        tile = pmapAt(loc).layers[layer];
        if (G.rogue.playbackOmniscience && (G.tileCatalog[tile].mechFlags & TM_IS_SECRET) >>> 0) {
          tile = G.dungeonFeatureCatalog[G.tileCatalog[tile].discoverType].tile;
        }
        if (bestFCPriority > G.tileCatalog[tile].drawPriority && G.tileCatalog[tile].foreColor) {
          cellForeColor.$cp(G.tileCatalog[tile].foreColor);
          bestFCPriority = G.tileCatalog[tile].drawPriority;
        }
        if (bestBCPriority > G.tileCatalog[tile].drawPriority && G.tileCatalog[tile].backColor) {
          cellBackColor.$cp(G.tileCatalog[tile].backColor);
          bestBCPriority = G.tileCatalog[tile].drawPriority;
        }
        if (bestCharPriority > G.tileCatalog[tile].drawPriority && G.tileCatalog[tile].displayChar >>> 0) {
          cellChar = G.tileCatalog[tile].displayChar;
          bestCharPriority = G.tileCatalog[tile].drawPriority;
          needDistinctness = ((G.tileCatalog[tile].mechFlags & TM_VISUALLY_DISTINCT) >>> 0 ? true_ : false_) << 24 >> 24;
        }
      }
    }
    if (G.rogue.trueColorMode) {
      lightMultiplierColor.$cp(G.basicLightColor);
    } else {
      colorMultiplierFromDungeonLight(loc.x, loc.y, lightMultiplierColor);
    }
    if (pmapAt(loc).layers[GAS] >>> 0 && G.tileCatalog[pmapAt(loc).layers[GAS]].backColor) {
      gasAugmentColor.$cp(G.tileCatalog[pmapAt(loc).layers[GAS]].backColor);
      if (G.rogue.trueColorMode) {
        gasAugmentWeight = 30;
      } else {
        gasAugmentWeight = (90 < 30 + pmapAt(loc).volume ? 90 : 30 + pmapAt(loc).volume) << 16 >> 16;
      }
    }
    if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
      if (Math.imul(cellBackColor.red - G.black.red, cellBackColor.red - G.black.red) * 0.21260000000000001 + Math.imul(cellBackColor.green - G.black.green, cellBackColor.green - G.black.green) * 0.71519999999999995 + Math.imul(cellBackColor.blue - G.black.blue, cellBackColor.blue - G.black.blue) * 0.0722 > Math.imul(cellForeColor.red - G.black.red, cellForeColor.red - G.black.red) * 0.21260000000000001 + Math.imul(cellForeColor.green - G.black.green, cellForeColor.green - G.black.green) * 0.71519999999999995 + Math.imul(cellForeColor.blue - G.black.blue, cellForeColor.blue - G.black.blue) * 0.0722) {
        cellForeColor.$cp(cellBackColor);
      }
      cellBackColor.$cp(G.black);
      needDistinctness = true_;
    }
    if ((pmapAt(loc).flags & HAS_PLAYER) >>> 0) {
      cellChar = G.player.info.displayChar;
      cellForeColor.$cp(G.player.info.foreColor);
      needDistinctness = true_;
    } else if ((pmapAt(loc).flags & HAS_ITEM) >>> 0 && (pmapAt(loc).flags & ITEM_DETECTED) >>> 0 && itemMagicPolarity(theItem) && !(($at2(G.pmap, loc.x, loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, loc.x, loc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, loc.x, loc.y).flags & DISCOVERED) >>> 0)) || monsterWithDetectedItem) {
      let polarity = itemMagicPolarity(theItem);
      if (theItem.category === AMULET) {
        cellChar = G_AMULET;
        cellForeColor.$cp(G.white);
      } else if (polarity === -1) {
        cellChar = G_BAD_MAGIC;
        cellForeColor.$cp(G.badMessageColor);
      } else if (polarity === 1) {
        cellChar = G_GOOD_MAGIC;
        cellForeColor.$cp(G.goodMessageColor);
      } else {
        cellChar = 0;
        cellForeColor.$cp(G.white);
      }
      needDistinctness = true_;
    } else if ((pmapAt(loc).flags & HAS_MONSTER) >>> 0 && (($at2(G.pmap, loc.x, loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, loc.x, loc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, loc.x, loc.y).flags & DISCOVERED) >>> 0) || (monst.info.flags & MONST_IMMOBILE) >>> 0 && (pmapAt(loc).flags & DISCOVERED) >>> 0) && (!monsterIsHidden(monst, G.player) || G.rogue.playbackOmniscience)) {
      needDistinctness = true_;
      if (G.player.status[STATUS_HALLUCINATING] > 0 && !((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0) && !G.rogue.playbackOmniscience && !G.player.status[STATUS_TELEPATHIC]) {
        cellChar = G.monsterCatalog[randomAnimateMonster()].displayChar;
        cellForeColor.$cp(G.monsterCatalog[randomAnimateMonster()].foreColor);
      } else {
        cellChar = monst.info.displayChar;
        cellForeColor.$cp(monst.info.foreColor);
        if (monst.status[STATUS_INVISIBLE] || (monst.bookkeepingFlags & MB_SUBMERGED) >>> 0) {
          applyColorAverage(cellForeColor, cellBackColor, 75);
        } else {
          if (monst.creatureState >>> 0 === MONSTER_ALLY && !((monst.info.flags & MONST_INANIMATE) >>> 0)) {
            if (G.rogue.trueColorMode) {
              cellForeColor.$cp(G.white);
            } else {
              applyColorAverage(cellForeColor, G.pink, 50);
            }
          }
        }
      }
    } else if (monst && monsterRevealed(monst) && !canSeeMonster(monst)) {
      if (G.player.status[STATUS_HALLUCINATING] && !G.rogue.playbackOmniscience && !G.player.status[STATUS_TELEPATHIC]) {
        cellChar = rand_range(0, 1) ? 88 : 120;
      } else {
        cellChar = monst.info.isLarge ? 88 : 120;
      }
      cellForeColor.$cp(G.white);
      lightMultiplierColor.$cp(G.white);
      if (!((pmapAt(loc).flags & DISCOVERED) >>> 0)) {
        cellBackColor.$cp(G.black);
        gasAugmentColor.$cp(G.black);
      }
    } else if ((pmapAt(loc).flags & HAS_ITEM) >>> 0 && !cellHasTerrainFlag(loc, T_OBSTRUCTS_ITEMS) && (($at2(G.pmap, loc.x, loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, loc.x, loc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, loc.x, loc.y).flags & DISCOVERED) >>> 0) || (pmapAt(loc).flags & DISCOVERED) >>> 0 && !cellHasTerrainFlag(loc, T_MOVES_ITEMS))) {
      needDistinctness = true_;
      if (G.player.status[STATUS_HALLUCINATING] && !G.rogue.playbackOmniscience) {
        cellChar = getItemCategoryGlyph(getHallucinatedItemCategory());
        cellForeColor.$cp(G.itemColor);
      } else {
        theItem = await itemAtLoc(loc.$clone());
        cellChar = theItem.displayChar;
        cellForeColor.$cp(theItem.foreColor);
        pmapAt(loc).rememberedItemCategory = theItem.category;
        pmapAt(loc).rememberedItemKind = theItem.kind;
        pmapAt(loc).rememberedItemQuantity = theItem.quantity;
        pmapAt(loc).rememberedItemOriginDepth = theItem.originDepth;
      }
    } else if (($at2(G.pmap, loc.x, loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, loc.x, loc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, loc.x, loc.y).flags & DISCOVERED) >>> 0) || (pmapAt(loc).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0) {
      pmapAt(loc).rememberedItemCategory = 0;
      pmapAt(loc).rememberedItemKind = 0;
      pmapAt(loc).rememberedItemQuantity = 0;
      pmapAt(loc).rememberedItemOriginDepth = 0;
    } else {
      returnChar.a[returnChar.o] = 32;
      returnForeColor.$cp(G.black);
      returnBackColor.$cp(G.undiscoveredColor);
      if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
        returnBackColor.$cp(G.black);
      }
      G.rogue.RNG = oldRNG;
      ;
      return;
    }
    if (gasAugmentWeight && ((pmapAt(loc).flags & DISCOVERED) >>> 0 || G.rogue.playbackOmniscience)) {
      if (!G.rogue.trueColorMode || !needDistinctness) {
        applyColorAverage(cellForeColor, gasAugmentColor, gasAugmentWeight);
      }
      if ((pmapAt(loc).flags & HAS_MONSTER) >>> 0 && monst.status[STATUS_INVISIBLE] && (($at2(G.pmap, loc.x, loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, loc.x, loc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, loc.x, loc.y).flags & DISCOVERED) >>> 0)) && !monsterRevealed(monst) && !monsterHiddenBySubmersion(monst, G.player)) {
        if (G.player.status[STATUS_HALLUCINATING] && !G.rogue.playbackOmniscience && !G.player.status[STATUS_TELEPATHIC]) {
          cellChar = G.monsterCatalog[randomAnimateMonster()].displayChar;
        } else {
          cellChar = monst.info.displayChar;
        }
        cellForeColor.$cp(cellBackColor);
      }
      applyColorAverage(cellBackColor, gasAugmentColor, gasAugmentWeight);
    }
    if (!((pmapAt(loc).flags & (ANY_KIND_OF_VISIBLE | ITEM_DETECTED | HAS_PLAYER)) >>> 0) && !(($at2(G.pmap, loc.x, loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, loc.x, loc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, loc.x, loc.y).flags & DISCOVERED) >>> 0)) && (!monst || !monsterRevealed(monst)) && !monsterWithDetectedItem) {
      ($t1 = pmapAt(loc), $t1.flags = ($t1.flags | STABLE_MEMORY) >>> 0);
      pmapAt(loc).rememberedAppearance.character = cellChar;
      storeColorComponents(P(pmapAt(loc).rememberedAppearance.foreColorComponents), cellForeColor);
      storeColorComponents(P(pmapAt(loc).rememberedAppearance.backColorComponents), cellBackColor);
      applyColorAugment(lightMultiplierColor, G.basicLightColor, 100);
      applyColorMultiplier(cellForeColor, lightMultiplierColor);
      if (!G.rogue.trueColorMode || !needDistinctness) {
      }
      applyColorMultiplier(cellBackColor, lightMultiplierColor);
      bakeTerrainColors(cellForeColor, cellBackColor, loc.x, loc.y);
      cellForeColor.$cp(colorFromComponents(P(pmapAt(loc).rememberedAppearance.foreColorComponents)));
      cellBackColor.$cp(colorFromComponents(P(pmapAt(loc).rememberedAppearance.backColorComponents)));
    }
  }
  if ((cellChar >>> 0 === G_WALL || cellChar >>> 0 === G_GRANITE) && coordinatesAreInMap(loc.x, loc.y + 1 << 16 >> 16) && glyphIsWallish($at2(G.displayBuffer.cells, loc.x + 20 + 1, loc.y + 1 + 3).character)) {
    cellChar = G_WALL_TOP;
  }
  if (((pmapAt(loc).flags & ITEM_DETECTED) >>> 0 || monsterWithDetectedItem || monst && monsterRevealed(monst)) && !(($at2(G.pmap, loc.x, loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, loc.x, loc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, loc.x, loc.y).flags & DISCOVERED) >>> 0))) {
  } else if (!((pmapAt(loc).flags & VISIBLE) >>> 0) && (pmapAt(loc).flags & CLAIRVOYANT_VISIBLE) >>> 0) {
    applyColorAugment(lightMultiplierColor, G.basicLightColor, 100);
    applyColorMultiplier(cellForeColor, lightMultiplierColor);
    if (!G.rogue.trueColorMode || !needDistinctness) {
      applyColorMultiplier(cellForeColor, G.clairvoyanceColor);
    }
    applyColorMultiplier(cellBackColor, lightMultiplierColor);
    applyColorMultiplier(cellBackColor, G.clairvoyanceColor);
  } else if (!((pmapAt(loc).flags & VISIBLE) >>> 0) && (pmapAt(loc).flags & TELEPATHIC_VISIBLE) >>> 0) {
    applyColorAugment(lightMultiplierColor, G.basicLightColor, 100);
    applyColorMultiplier(cellForeColor, lightMultiplierColor);
    if (!G.rogue.trueColorMode || !needDistinctness) {
      applyColorMultiplier(cellForeColor, G.telepathyMultiplier);
    }
    applyColorMultiplier(cellBackColor, lightMultiplierColor);
    applyColorMultiplier(cellBackColor, G.telepathyMultiplier);
  } else if (!((pmapAt(loc).flags & DISCOVERED) >>> 0) && (pmapAt(loc).flags & MAGIC_MAPPED) >>> 0) {
    if (!G.rogue.playbackOmniscience) {
      needDistinctness = false_;
      if (!G.rogue.trueColorMode || !needDistinctness) {
        applyColorMultiplier(cellForeColor, G.magicMapColor);
      }
      applyColorMultiplier(cellBackColor, G.magicMapColor);
    }
  } else if (!((pmapAt(loc).flags & VISIBLE) >>> 0) && !G.rogue.playbackOmniscience) {
    needDistinctness = false_;
    if (G.rogue.inWater) {
      applyColorAverage(cellForeColor, G.black, 80);
      applyColorAverage(cellBackColor, G.black, 80);
    } else {
      if (!cellHasTMFlag(loc, TM_BRIGHT_MEMORY) && (!G.rogue.trueColorMode || !needDistinctness)) {
        applyColorMultiplier(cellForeColor, G.memoryColor);
        applyColorAverage(cellForeColor, G.memoryOverlay, 25);
      }
      applyColorMultiplier(cellBackColor, G.memoryColor);
      applyColorAverage(cellBackColor, G.memoryOverlay, 25);
    }
  } else if ((($at2(G.pmap, loc.x, loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, loc.x, loc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, loc.x, loc.y).flags & DISCOVERED) >>> 0)) && G.rogue.playbackOmniscience && !((pmapAt(loc).flags & ANY_KIND_OF_VISIBLE) >>> 0)) {
    applyColorAugment(lightMultiplierColor, G.basicLightColor, 100);
    applyColorMultiplier(cellForeColor, lightMultiplierColor);
    if (!G.rogue.trueColorMode || !needDistinctness) {
      applyColorMultiplier(cellForeColor, G.omniscienceColor);
    }
    applyColorMultiplier(cellBackColor, lightMultiplierColor);
    applyColorMultiplier(cellBackColor, G.omniscienceColor);
  } else {
    applyColorMultiplier(cellForeColor, lightMultiplierColor);
    applyColorMultiplier(cellBackColor, lightMultiplierColor);
    if (G.player.status[STATUS_HALLUCINATING] && !G.rogue.trueColorMode) {
      randomizeColor(cellForeColor, (40 * G.player.status[STATUS_HALLUCINATING] / 300 | 0) + 20 << 16 >> 16);
      randomizeColor(cellBackColor, (40 * G.player.status[STATUS_HALLUCINATING] / 300 | 0) + 20 << 16 >> 16);
    }
    if (G.rogue.inWater) {
      applyColorMultiplier(cellForeColor, G.deepWaterLightColor);
      applyColorMultiplier(cellBackColor, G.deepWaterLightColor);
    }
  }
  if ((pmapAt(loc).flags & IS_IN_PATH) >>> 0) {
    if (cellHasTMFlag(loc, TM_INVERT_WHEN_HIGHLIGHTED)) {
      swapColors(cellForeColor, cellBackColor);
    } else {
      if (!G.rogue.trueColorMode || !needDistinctness) {
        applyColorAverage(cellForeColor, G.yellow, G.rogue.cursorPathIntensity);
      }
      applyColorAverage(cellBackColor, G.yellow, G.rogue.cursorPathIntensity);
    }
    needDistinctness = true_;
  }
  bakeTerrainColors(cellForeColor, cellBackColor, loc.x, loc.y);
  if (G.rogue.displayStealthRangeMode && (pmapAt(loc).flags & IN_FIELD_OF_VIEW) >>> 0) {
    distance = (G.rogue.scentTurnNumber - $rd(G.scentMap.a[G.scentMap.o + loc.x], loc.y) < scentDistance(loc.x, loc.y, G.player.loc.x, G.player.loc.y) ? G.rogue.scentTurnNumber - $rd(G.scentMap.a[G.scentMap.o + loc.x], loc.y) : scentDistance(loc.x, loc.y, G.player.loc.x, G.player.loc.y)) << 16 >> 16;
    if (distance > G.rogue.stealthRange * 2) {
      applyColorAverage(cellForeColor, G.orange, 12);
      applyColorAverage(cellBackColor, G.orange, 12);
      applyColorAugment(cellForeColor, G.orange, 12);
      applyColorAugment(cellBackColor, G.orange, 12);
    }
  }
  if ((G.rogue.trueColorMode || G.rogue.displayStealthRangeMode) && (($at2(G.pmap, loc.x, loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, loc.x, loc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, loc.x, loc.y).flags & DISCOVERED) >>> 0))) {
    if (G.displayDetail[loc.x][loc.y] === DV_DARK) {
      applyColorMultiplier(cellForeColor, G.inDarknessMultiplierColor);
      applyColorMultiplier(cellBackColor, G.inDarknessMultiplierColor);
      applyColorAugment(cellForeColor, G.purple, 7);
      applyColorAugment(cellBackColor, G.white, -10);
      applyColorAverage(cellBackColor, G.purple, 17);
    } else if (G.displayDetail[loc.x][loc.y] === DV_LIT) {
      colorMultiplierFromDungeonLight(loc.x, loc.y, lightMultiplierColor);
      normColor(lightMultiplierColor, 175, 50);
      applyColorAugment(cellForeColor, lightMultiplierColor, 5);
      applyColorAugment(cellBackColor, lightMultiplierColor, 5);
    }
  }
  if (needDistinctness) {
    separateColors(cellForeColor, cellBackColor);
  }
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    if (G.rogue.scentTurnNumber > ($rd(G.scentMap.a[G.scentMap.o + loc.x], loc.y) & 0xffff)) {
      cellBackColor.red = G.rogue.scentTurnNumber - ($rd(G.scentMap.a[G.scentMap.o + loc.x], loc.y) & 0xffff) << 16 >> 16;
      cellBackColor.red = ((cellBackColor.red > 0 ? cellBackColor.red : 0) > 100 ? 100 : cellBackColor.red > 0 ? cellBackColor.red : 0) << 16 >> 16;
    } else {
      cellBackColor.green = Math.abs(G.rogue.scentTurnNumber - ($rd(G.scentMap.a[G.scentMap.o + loc.x], loc.y) & 0xffff)) << 16 >> 16;
      cellBackColor.green = ((cellBackColor.green > 0 ? cellBackColor.green : 0) > 100 ? 100 : cellBackColor.green > 0 ? cellBackColor.green : 0) << 16 >> 16;
    }
  }
  returnChar.a[returnChar.o] = cellChar;
  returnForeColor.$cp(cellForeColor);
  returnBackColor.$cp(cellBackColor);
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    returnBackColor.$cp(G.black);
  }
  G.rogue.RNG = oldRNG;
  ;
}

export async function refreshDungeonCell(loc: struct_pos): Promise<void> {
  const cellChar = new Int32Array(1);
  let foreColor = new struct_color();
  let backColor = new struct_color();
  ;
  await getCellAppearance(loc.$clone(), P(cellChar, 0), foreColor, backColor);
  plotCharWithColor(cellChar[0], mapToWindow(loc), foreColor, backColor);
}

export function applyColorMultiplier(baseColor: struct_color | null, multiplierColor: struct_color | null): void {
  baseColor.red = (Math.imul(baseColor.red, multiplierColor.red) / 100 | 0) << 16 >> 16;
  baseColor.redRand = (Math.imul(baseColor.redRand, multiplierColor.redRand) / 100 | 0) << 16 >> 16;
  baseColor.green = (Math.imul(baseColor.green, multiplierColor.green) / 100 | 0) << 16 >> 16;
  baseColor.greenRand = (Math.imul(baseColor.greenRand, multiplierColor.greenRand) / 100 | 0) << 16 >> 16;
  baseColor.blue = (Math.imul(baseColor.blue, multiplierColor.blue) / 100 | 0) << 16 >> 16;
  baseColor.blueRand = (Math.imul(baseColor.blueRand, multiplierColor.blueRand) / 100 | 0) << 16 >> 16;
  baseColor.rand = (Math.imul(baseColor.rand, multiplierColor.rand) / 100 | 0) << 16 >> 16;
  return;
}

export function applyColorAverage(baseColor: struct_color | null, newColor: struct_color | null, averageWeight: number): void {
  let weightComplement = 100 - averageWeight << 16 >> 16;
  baseColor.red = ((Math.imul(baseColor.red, weightComplement) + Math.imul(newColor.red, averageWeight)) / 100 | 0) << 16 >> 16;
  baseColor.redRand = ((Math.imul(baseColor.redRand, weightComplement) + Math.imul(newColor.redRand, averageWeight)) / 100 | 0) << 16 >> 16;
  baseColor.green = ((Math.imul(baseColor.green, weightComplement) + Math.imul(newColor.green, averageWeight)) / 100 | 0) << 16 >> 16;
  baseColor.greenRand = ((Math.imul(baseColor.greenRand, weightComplement) + Math.imul(newColor.greenRand, averageWeight)) / 100 | 0) << 16 >> 16;
  baseColor.blue = ((Math.imul(baseColor.blue, weightComplement) + Math.imul(newColor.blue, averageWeight)) / 100 | 0) << 16 >> 16;
  baseColor.blueRand = ((Math.imul(baseColor.blueRand, weightComplement) + Math.imul(newColor.blueRand, averageWeight)) / 100 | 0) << 16 >> 16;
  baseColor.rand = ((Math.imul(baseColor.rand, weightComplement) + Math.imul(newColor.rand, averageWeight)) / 100 | 0) << 16 >> 16;
  baseColor.colorDances = (baseColor.colorDances || newColor.colorDances ? 1 : 0) << 24 >> 24;
  return;
}

export function applyColorAugment(baseColor: struct_color | null, augmentingColor: struct_color | null, augmentWeight: number): void {
  baseColor.red = baseColor.red + (Math.imul(augmentingColor.red, augmentWeight) / 100 | 0) << 16 >> 16;
  baseColor.redRand = baseColor.redRand + (Math.imul(augmentingColor.redRand, augmentWeight) / 100 | 0) << 16 >> 16;
  baseColor.green = baseColor.green + (Math.imul(augmentingColor.green, augmentWeight) / 100 | 0) << 16 >> 16;
  baseColor.greenRand = baseColor.greenRand + (Math.imul(augmentingColor.greenRand, augmentWeight) / 100 | 0) << 16 >> 16;
  baseColor.blue = baseColor.blue + (Math.imul(augmentingColor.blue, augmentWeight) / 100 | 0) << 16 >> 16;
  baseColor.blueRand = baseColor.blueRand + (Math.imul(augmentingColor.blueRand, augmentWeight) / 100 | 0) << 16 >> 16;
  baseColor.rand = baseColor.rand + (Math.imul(augmentingColor.rand, augmentWeight) / 100 | 0) << 16 >> 16;
  return;
}

export function applyColorScalar(baseColor: struct_color | null, scalar: number): void {
  baseColor.red = (Math.imul(baseColor.red, scalar) / 100 | 0) << 16 >> 16;
  baseColor.redRand = (Math.imul(baseColor.redRand, scalar) / 100 | 0) << 16 >> 16;
  baseColor.green = (Math.imul(baseColor.green, scalar) / 100 | 0) << 16 >> 16;
  baseColor.greenRand = (Math.imul(baseColor.greenRand, scalar) / 100 | 0) << 16 >> 16;
  baseColor.blue = (Math.imul(baseColor.blue, scalar) / 100 | 0) << 16 >> 16;
  baseColor.blueRand = (Math.imul(baseColor.blueRand, scalar) / 100 | 0) << 16 >> 16;
  baseColor.rand = (Math.imul(baseColor.rand, scalar) / 100 | 0) << 16 >> 16;
}

export function applyColorBounds(baseColor: struct_color | null, lowerBound: number, upperBound: number): void {
  baseColor.red = ((baseColor.red > lowerBound ? baseColor.red : lowerBound) > upperBound ? upperBound : baseColor.red > lowerBound ? baseColor.red : lowerBound) << 16 >> 16;
  baseColor.redRand = ((baseColor.redRand > lowerBound ? baseColor.redRand : lowerBound) > upperBound ? upperBound : baseColor.redRand > lowerBound ? baseColor.redRand : lowerBound) << 16 >> 16;
  baseColor.green = ((baseColor.green > lowerBound ? baseColor.green : lowerBound) > upperBound ? upperBound : baseColor.green > lowerBound ? baseColor.green : lowerBound) << 16 >> 16;
  baseColor.greenRand = ((baseColor.greenRand > lowerBound ? baseColor.greenRand : lowerBound) > upperBound ? upperBound : baseColor.greenRand > lowerBound ? baseColor.greenRand : lowerBound) << 16 >> 16;
  baseColor.blue = ((baseColor.blue > lowerBound ? baseColor.blue : lowerBound) > upperBound ? upperBound : baseColor.blue > lowerBound ? baseColor.blue : lowerBound) << 16 >> 16;
  baseColor.blueRand = ((baseColor.blueRand > lowerBound ? baseColor.blueRand : lowerBound) > upperBound ? upperBound : baseColor.blueRand > lowerBound ? baseColor.blueRand : lowerBound) << 16 >> 16;
  baseColor.rand = ((baseColor.rand > lowerBound ? baseColor.rand : lowerBound) > upperBound ? upperBound : baseColor.rand > lowerBound ? baseColor.rand : lowerBound) << 16 >> 16;
}

export function desaturate(baseColor: struct_color | null, weight: number): void {
  let avg = 0;
  avg = ((baseColor.red + baseColor.green + baseColor.blue) / 3 | 0) + 1 << 16 >> 16;
  baseColor.red = (Math.imul(baseColor.red, 100 - weight) / 100 | 0) + (Math.imul(avg, weight) / 100 | 0) << 16 >> 16;
  baseColor.green = (Math.imul(baseColor.green, 100 - weight) / 100 | 0) + (Math.imul(avg, weight) / 100 | 0) << 16 >> 16;
  baseColor.blue = (Math.imul(baseColor.blue, 100 - weight) / 100 | 0) + (Math.imul(avg, weight) / 100 | 0) << 16 >> 16;
  avg = baseColor.redRand + baseColor.greenRand + baseColor.blueRand << 16 >> 16;
  baseColor.redRand = (Math.imul(baseColor.redRand, 100 - weight) / 100 | 0) << 16 >> 16;
  baseColor.greenRand = (Math.imul(baseColor.greenRand, 100 - weight) / 100 | 0) << 16 >> 16;
  baseColor.blueRand = (Math.imul(baseColor.blueRand, 100 - weight) / 100 | 0) << 16 >> 16;
  baseColor.rand = baseColor.rand + ((Math.imul(avg, weight) / 3 | 0) / 100 | 0) << 16 >> 16;
}

function randomizeByPercent(input: number, percent: number): number {
  return rand_range(Math.imul(input, 100 - percent) / 100 | 0, Math.imul(input, 100 + percent) / 100 | 0) << 16 >> 16;
}

export function randomizeColor(baseColor: struct_color | null, randomizePercent: number): void {
  baseColor.red = randomizeByPercent(baseColor.red, randomizePercent);
  baseColor.green = randomizeByPercent(baseColor.green, randomizePercent);
  baseColor.blue = randomizeByPercent(baseColor.blue, randomizePercent);
}

export function swapColors(color1: struct_color | null, color2: struct_color | null): void {
  let tempColor = color1.$clone();
  color1.$cp(color2);
  color2.$cp(tempColor);
}

function blendAppearances(fromForeColor: struct_color | null, fromBackColor: struct_color | null, fromChar: number, toForeColor: struct_color | null, toBackColor: struct_color | null, toChar: number, retForeColor: struct_color | null, retBackColor: struct_color | null, retChar: Ptr | null, percent: number): void {
  retBackColor.$cp(fromBackColor);
  applyColorAverage(retBackColor, toBackColor, percent);
  if (percent >= 50) {
    retChar.a[retChar.o] = toChar;
  } else {
    retChar.a[retChar.o] = fromChar;
  }
  if (fromChar >>> 0 === toChar >>> 0) {
    retForeColor.$cp(fromForeColor);
    applyColorAverage(retForeColor, toForeColor, percent);
  } else {
    if (percent >= 50) {
      retForeColor.$cp(retBackColor);
      applyColorAverage(retForeColor, toForeColor, (percent - 50) * 2 << 16 >> 16);
    } else {
      retForeColor.$cp(fromForeColor);
      applyColorAverage(retForeColor, retBackColor, percent * 2 << 16 >> 16);
    }
  }
}

export async function irisFadeBetweenBuffers(fromBuf: struct_screenDisplayBuffer | null, toBuf: struct_screenDisplayBuffer | null, x: number, y: number, frameCount: number, outsideIn: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let i = 0;
  let j = 0;
  let frame = 0;
  let percentBasis = 0;
  let thisCellPercent = 0;
  let fastForward = 0;
  let fromBackColor = new struct_color();
  let toBackColor = new struct_color();
  let fromForeColor = new struct_color();
  let toForeColor = new struct_color();
  let currentForeColor = new struct_color();
  let currentBackColor = new struct_color();
  let fromChar = 0;
  let toChar = 0;
  const currentChar = new Int32Array(1);
  let completionMap = $arr(100, () => new Int16Array(34));
  let maxDistance = 0;
  fastForward = false_;
  frame = 1;
  if ((COLS / 2 | 0) > x) {
    i = COLS - x << 16 >> 16;
  } else {
    i = x;
  }
  if ((ROWS / 2 | 0) > y) {
    j = ROWS - y << 16 >> 16;
  } else {
    j = y;
  }
  maxDistance = Math.imul(i, i) + Math.imul(j, j) << 16 >> 16;
  for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
      completionMap[i][j] = Math.imul(i - x, i - x) + Math.imul(j - y, j - y) << 16 >> 16;
      completionMap[i][j] = (100 * completionMap[i][j] / maxDistance | 0) << 16 >> 16;
      if (outsideIn) {
        ($t1 = completionMap[i], $t2 = j, $t1[$t2] = $t1[$t2] - 100 << 16 >> 16);
      } else {
        ($t3 = completionMap[i], $t4 = j, $t3[$t4] = $t3[$t4] * -1 << 16 >> 16);
      }
    }
  }
  do {
    percentBasis = (10000 * frame / frameCount | 0) << 16 >> 16;
    for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
        thisCellPercent = (percentBasis * 3 / 100 | 0) + completionMap[i][j] << 16 >> 16;
        fromBackColor.$cp(colorFromComponents(P($at2(fromBuf.cells, i, j).backColorComponents)));
        fromForeColor.$cp(colorFromComponents(P($at2(fromBuf.cells, i, j).foreColorComponents)));
        fromChar = $at2(fromBuf.cells, i, j).character;
        toBackColor.$cp(colorFromComponents(P($at2(toBuf.cells, i, j).backColorComponents)));
        toForeColor.$cp(colorFromComponents(P($at2(toBuf.cells, i, j).foreColorComponents)));
        toChar = $at2(toBuf.cells, i, j).character;
        blendAppearances(fromForeColor, fromBackColor, fromChar, toForeColor, toBackColor, toChar, currentForeColor, currentBackColor, P(currentChar, 0), ((thisCellPercent > 0 ? thisCellPercent : 0) > 100 ? 100 : thisCellPercent > 0 ? thisCellPercent : 0) << 16 >> 16);
        plotCharWithColor(currentChar[0], struct_windowpos.$of(i, j), currentForeColor, currentBackColor);
      }
    }
    fastForward = await pauseAnimation(16, struct_PauseBehavior.$of());
    frame = frame + 1 << 16 >> 16;
  } while (frameCount >= frame && !fastForward);
  overlayDisplayBuffer(toBuf);
}

export async function colorBlendCell(x: number, y: number, hiliteColor: struct_color | null, hiliteStrength: number): Promise<void> {
  const displayChar = new Int32Array(1);
  let foreColor = new struct_color();
  let backColor = new struct_color();
  await getCellAppearance(struct_pos.$of(x, y), P(displayChar, 0), foreColor, backColor);
  applyColorAverage(foreColor, hiliteColor, hiliteStrength);
  applyColorAverage(backColor, hiliteColor, hiliteStrength);
  plotCharWithColor(displayChar[0], mapToWindow(struct_pos.$of(x, y)), foreColor, backColor);
}

export async function hiliteCell(x: number, y: number, hiliteColor: struct_color | null, hiliteStrength: number, distinctColors: number): Promise<void> {
  const displayChar = new Int32Array(1);
  let foreColor = new struct_color();
  let backColor = new struct_color();
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  await getCellAppearance(struct_pos.$of(x, y), P(displayChar, 0), foreColor, backColor);
  applyColorAugment(foreColor, hiliteColor, hiliteStrength);
  applyColorAugment(backColor, hiliteColor, hiliteStrength);
  if (distinctColors) {
    separateColors(foreColor, backColor);
  }
  plotCharWithColor(displayChar[0], mapToWindow(struct_pos.$of(x, y)), foreColor, backColor);
  G.rogue.RNG = oldRNG;
  ;
}

function adjustedLightValue(x: number): number {
  if (LIGHT_SMOOTHING_THRESHOLD >= x) {
    return x;
  } else {
    return Math.trunc($mul64(fp_sqrt(Math.trunc($mul64(x, FP_FACTOR) / LIGHT_SMOOTHING_THRESHOLD)), LIGHT_SMOOTHING_THRESHOLD) / FP_FACTOR) << 16 >> 16;
  }
}

export function colorMultiplierFromDungeonLight(x: number, y: number, editColor: struct_color | null): void {
  editColor.red = editColor.redRand = adjustedLightValue((0 > $at2(G.tmap, x, y).light[0] ? 0 : $at2(G.tmap, x, y).light[0]) << 16 >> 16);
  editColor.green = editColor.greenRand = adjustedLightValue((0 > $at2(G.tmap, x, y).light[1] ? 0 : $at2(G.tmap, x, y).light[1]) << 16 >> 16);
  editColor.blue = editColor.blueRand = adjustedLightValue((0 > $at2(G.tmap, x, y).light[2] ? 0 : $at2(G.tmap, x, y).light[2]) << 16 >> 16);
  editColor.rand = adjustedLightValue(((0 > $at2(G.tmap, x, y).light[0] + $at2(G.tmap, x, y).light[1] + $at2(G.tmap, x, y).light[2] ? 0 : $at2(G.tmap, x, y).light[0] + $at2(G.tmap, x, y).light[1] + $at2(G.tmap, x, y).light[2]) / 3 | 0) << 16 >> 16);
  editColor.colorDances = false_;
}

export function plotCharWithColor(inputChar: number, loc: struct_windowpos, cellForeColor: struct_color | null, cellBackColor: struct_color | null): void {
  let oldRNG = 0;
  let foreRed = cellForeColor.red;
  let foreGreen = cellForeColor.green;
  let foreBlue = cellForeColor.blue;
  let backRed = cellBackColor.red;
  let backGreen = cellBackColor.green;
  let backBlue = cellBackColor.blue;
  let foreRand = 0;
  let backRand = 0;
  ;
  if (!locIsInWindow(loc)) {
    return;
  }
  if (G.rogue.gameHasEnded || G.rogue.playbackFastForward) {
    return;
  }
  oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  foreRand = rand_range(0, cellForeColor.rand) << 16 >> 16;
  backRand = rand_range(0, cellBackColor.rand) << 16 >> 16;
  foreRed = foreRed + (rand_range(0, cellForeColor.redRand) + foreRand) << 16 >> 16;
  foreGreen = foreGreen + (rand_range(0, cellForeColor.greenRand) + foreRand) << 16 >> 16;
  foreBlue = foreBlue + (rand_range(0, cellForeColor.blueRand) + foreRand) << 16 >> 16;
  backRed = backRed + (rand_range(0, cellBackColor.redRand) + backRand) << 16 >> 16;
  backGreen = backGreen + (rand_range(0, cellBackColor.greenRand) + backRand) << 16 >> 16;
  backBlue = backBlue + (rand_range(0, cellBackColor.blueRand) + backRand) << 16 >> 16;
  foreRed = ((0 > foreRed ? 0 : foreRed) > 100 ? 100 : 0 > foreRed ? 0 : foreRed) << 16 >> 16;
  foreGreen = ((0 > foreGreen ? 0 : foreGreen) > 100 ? 100 : 0 > foreGreen ? 0 : foreGreen) << 16 >> 16;
  foreBlue = ((0 > foreBlue ? 0 : foreBlue) > 100 ? 100 : 0 > foreBlue ? 0 : foreBlue) << 16 >> 16;
  backRed = ((0 > backRed ? 0 : backRed) > 100 ? 100 : 0 > backRed ? 0 : backRed) << 16 >> 16;
  backGreen = ((0 > backGreen ? 0 : backGreen) > 100 ? 100 : 0 > backGreen ? 0 : backGreen) << 16 >> 16;
  backBlue = ((0 > backBlue ? 0 : backBlue) > 100 ? 100 : 0 > backBlue ? 0 : backBlue) << 16 >> 16;
  if (inputChar >>> 0 !== 32 && foreRed === backRed && foreGreen === backGreen && foreBlue === backBlue) {
    inputChar = 32;
  }
  let target = $sat(G.displayBuffer.cells[loc.window_x], loc.window_y);
  target.character = inputChar;
  target.foreColorComponents[0] = foreRed << 24 >> 24;
  target.foreColorComponents[1] = foreGreen << 24 >> 24;
  target.foreColorComponents[2] = foreBlue << 24 >> 24;
  target.backColorComponents[0] = backRed << 24 >> 24;
  target.backColorComponents[1] = backGreen << 24 >> 24;
  target.backColorComponents[2] = backBlue << 24 >> 24;
  G.rogue.RNG = oldRNG;
  ;
}

export function plotCharToBuffer(inputChar: number, loc: struct_windowpos, foreColor: struct_color | null, backColor: struct_color | null, dbuf: struct_screenDisplayBuffer | null): void {
  let oldRNG = 0;
  if (!dbuf) {
    plotCharWithColor(inputChar, loc, foreColor, backColor);
    return;
  }
  ;
  if (!locIsInWindow(loc)) {
    return;
  }
  oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  let cell = $sat(dbuf.cells[loc.window_x], loc.window_y);
  cell.foreColorComponents[0] = foreColor.red + rand_range(0, foreColor.redRand) + rand_range(0, foreColor.rand) << 24 >> 24;
  cell.foreColorComponents[1] = foreColor.green + rand_range(0, foreColor.greenRand) + rand_range(0, foreColor.rand) << 24 >> 24;
  cell.foreColorComponents[2] = foreColor.blue + rand_range(0, foreColor.blueRand) + rand_range(0, foreColor.rand) << 24 >> 24;
  cell.backColorComponents[0] = backColor.red + rand_range(0, backColor.redRand) + rand_range(0, backColor.rand) << 24 >> 24;
  cell.backColorComponents[1] = backColor.green + rand_range(0, backColor.greenRand) + rand_range(0, backColor.rand) << 24 >> 24;
  cell.backColorComponents[2] = backColor.blue + rand_range(0, backColor.blueRand) + rand_range(0, backColor.rand) << 24 >> 24;
  cell.character = inputChar;
  G.rogue.RNG = oldRNG;
  ;
}

export async function plotForegroundChar(inputChar: number, x: number, y: number, foreColor: struct_color | null, affectedByLighting: number): Promise<void> {
  let multColor = new struct_color();
  let myColor = new struct_color();
  let backColor = new struct_color();
  let ignoredColor = new struct_color();
  const ignoredChar = new Int32Array(1);
  myColor.$cp(foreColor);
  await getCellAppearance(struct_pos.$of(x, y), P(ignoredChar, 0), ignoredColor, backColor);
  if (affectedByLighting) {
    colorMultiplierFromDungeonLight(x, y, multColor);
    applyColorMultiplier(myColor, multColor);
  }
  plotCharWithColor(inputChar, mapToWindow(struct_pos.$of(x, y)), myColor, backColor);
}

export async function dumpLevelToScreen(): Promise<void> {
  let $t1: any;
  let i = 0;
  let j = 0;
  let backup = new struct_pcell();
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($at2(G.pmap, i, j).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, i, j).flags & DISCOVERED) >>> 0) {
        backup.$cp($at2(G.pmap, i, j));
        ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags | (VISIBLE | DISCOVERED)) >>> 0);
        $at2(G.tmap, i, j).light[0] = 100;
        $at2(G.tmap, i, j).light[1] = 100;
        $at2(G.tmap, i, j).light[2] = 100;
        await refreshDungeonCell(struct_pos.$of(i, j));
        $at2(G.pmap, i, j).$cp(backup);
      } else {
        plotCharWithColor(32, mapToWindow(struct_pos.$of(i, j)), G.white, G.black);
      }
    }
  }
  G.rogue.RNG = oldRNG;
  ;
}

export function hiliteCharGrid(hiliteCharGrid: Ptr | null, hiliteColor: struct_color | null, hiliteStrength: number): void {
  let i = 0;
  let j = 0;
  let x = 0;
  let y = 0;
  let hCol = new struct_color();
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  if (hiliteColor) {
    hCol.$cp(hiliteColor);
  } else {
    hCol.$cp(G.yellow);
  }
  bakeColor(hCol);
  if (!hiliteStrength) {
    hiliteStrength = 75;
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (hiliteCharGrid.a[hiliteCharGrid.o + i][j]) {
        x = i + 20 + 1 << 16 >> 16;
        y = j + 3 << 16 >> 16;
        let cell = $sat(G.displayBuffer.cells[x], y);
        cell.backColorComponents[0] = ((cell.backColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) > 0 ? cell.backColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) : 0) > 100 ? 100 : cell.backColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) > 0 ? cell.backColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) : 0) << 24 >> 24;
        cell.backColorComponents[1] = ((cell.backColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) > 0 ? cell.backColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) : 0) > 100 ? 100 : cell.backColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) > 0 ? cell.backColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) : 0) << 24 >> 24;
        cell.backColorComponents[2] = ((cell.backColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) > 0 ? cell.backColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) : 0) > 100 ? 100 : cell.backColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) > 0 ? cell.backColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) : 0) << 24 >> 24;
        cell.foreColorComponents[0] = ((cell.foreColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) > 0 ? cell.foreColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) : 0) > 100 ? 100 : cell.foreColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) > 0 ? cell.foreColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) : 0) << 24 >> 24;
        cell.foreColorComponents[1] = ((cell.foreColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) > 0 ? cell.foreColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) : 0) > 100 ? 100 : cell.foreColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) > 0 ? cell.foreColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) : 0) << 24 >> 24;
        cell.foreColorComponents[2] = ((cell.foreColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) > 0 ? cell.foreColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) : 0) > 100 ? 100 : cell.foreColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) > 0 ? cell.foreColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) : 0) << 24 >> 24;
      }
    }
  }
  G.rogue.RNG = oldRNG;
  ;
}

export function blackOutScreen(): void {
  let i = 0;
  let j = 0;
  for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
      plotCharWithColor(32, struct_windowpos.$of(i, j), G.black, G.black);
    }
  }
}

export function colorOverDungeon(color: struct_color | null): void {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      plotCharWithColor(32, mapToWindow(struct_pos.$of(i, j)), color, color);
    }
  }
}

export function copyDisplayBuffer(toBuf: struct_screenDisplayBuffer | null, fromBuf: struct_screenDisplayBuffer | null): void {
  toBuf.$cp(fromBuf);
}

export function clearDisplayBuffer(dbuf: struct_screenDisplayBuffer | null): void {
  let i = 0;
  let j = 0;
  let k = 0;
  for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
      $at2(dbuf.cells, i, j).character = 32;
      for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
        $at2(dbuf.cells, i, j).foreColorComponents[k] = 0;
        $at2(dbuf.cells, i, j).backColorComponents[k] = 0;
      }
      $at2(dbuf.cells, i, j).opacity = 0;
    }
  }
}

export function colorFromComponents(rgb: Ptr | null): struct_color {
  let theColor = G.black.$clone();
  theColor.red = rgb.a[rgb.o];
  theColor.green = rgb.a[rgb.o + 1];
  theColor.blue = rgb.a[rgb.o + 2];
  return theColor.$clone();
}

export function saveDisplayBuffer(): struct_SavedDisplayBuffer {
  return struct_SavedDisplayBuffer.$of(G.displayBuffer.$clone());
}

export function restoreDisplayBuffer(savedBuf: struct_SavedDisplayBuffer | null): void {
  G.displayBuffer.$cp(savedBuf.savedScreen);
}

export function overlayDisplayBuffer(overBuf: struct_screenDisplayBuffer | null): void {
  for (let i = 0; COLS > i; ++i) {
    for (let j = 0; ROWS > j; ++j) {
      if ($at2(overBuf.cells, i, j).opacity !== 0) {
        let foreColor = new struct_color();
        let backColor = new struct_color();
        let tempColor = new struct_color();
        let character = 0;
        backColor.$cp(colorFromComponents(P($at2(overBuf.cells, i, j).backColorComponents)));
        if ($at2(overBuf.cells, i, j).character >>> 0 === 32) {
          character = $at2(G.displayBuffer.cells, i, j).character;
          foreColor.$cp(colorFromComponents(P($at2(G.displayBuffer.cells, i, j).foreColorComponents)));
          applyColorAverage(foreColor, backColor, $at2(overBuf.cells, i, j).opacity);
        } else {
          character = $at2(overBuf.cells, i, j).character;
          foreColor.$cp(colorFromComponents(P($at2(overBuf.cells, i, j).foreColorComponents)));
        }
        tempColor.$cp(colorFromComponents(P($at2(G.displayBuffer.cells, i, j).backColorComponents)));
        applyColorAverage(backColor, tempColor, 100 - $at2(overBuf.cells, i, j).opacity << 16 >> 16);
        plotCharWithColor(character, struct_windowpos.$of(i << 16 >> 16, j << 16 >> 16), foreColor, backColor);
      }
    }
  }
}

export async function flashForeground(x: Ptr | null, y: Ptr | null, flashColor: Ptr | null, flashStrength: Ptr | null, count: number, frames: number): Promise<void> {
  let i = 0;
  let j = 0;
  let percent = 0;
  let displayChar = null;
  let bColor = null;
  let fColor = null;
  let newColor = new struct_color();
  let oldRNG = 0;
  if (0 >= count) {
    return;
  }
  oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  displayChar = P(new Int32Array($u64(count) * 4 / 4));
  fColor = $sarr(struct_color, $u64(count) * 16 / 16)[0];
  bColor = $sarr(struct_color, $u64(count) * 16 / 16)[0];
  for (i = 0; count > i; i = i + 1 << 16 >> 16) {
    await getCellAppearance(struct_pos.$of(x.a[x.o + i], y.a[y.o + i]), displayChar.add(i), $sadd(fColor, i), $sadd(bColor, i));
    bakeColor($sadd(fColor, i));
    bakeColor($sadd(bColor, i));
  }
  for (j = frames; j >= 0; j = j - 1 << 16 >> 16) {
    for (i = 0; count > i; i = i + 1 << 16 >> 16) {
      percent = (Math.imul(flashStrength.a[flashStrength.o + i], j) / frames | 0) << 16 >> 16;
      newColor.$cp($sadd(fColor, i));
      applyColorAverage(newColor, flashColor.a[flashColor.o + i], percent);
      plotCharWithColor(displayChar.a[displayChar.o + i], mapToWindow(struct_pos.$of(x.a[x.o + i], y.a[y.o + i])), newColor, $sadd(bColor, i));
    }
    if (j) {
      if (await pauseAnimation(16, struct_PauseBehavior.$of())) {
        j = 1;
      }
    }
  }
  free(displayChar);
  free(fColor);
  free(bColor);
  G.rogue.RNG = oldRNG;
  ;
}

export async function flashCell(theColor: struct_color | null, frames: number, x: number, y: number): Promise<void> {
  let i = 0;
  let interrupted = false_;
  for (i = 0; frames > i && !interrupted; i = i + 1 << 16 >> 16) {
    await colorBlendCell(x, y, theColor, 100 - (100 * i / frames | 0) << 16 >> 16);
    interrupted = await pauseAnimation(50, struct_PauseBehavior.$of());
  }
  await refreshDungeonCell(struct_pos.$of(x, y));
}

export async function colorFlash(theColor: struct_color | null, reqTerrainFlags: number, reqTileFlags: number, frames: number, maxRadius: number, x: number, y: number): Promise<void> {
  let i = 0;
  let j = 0;
  let k = 0;
  let intensity = 0;
  let currentRadius = 0;
  let fadeOut = 0;
  let localRadius = $arr(79, () => new Int16Array(29));
  let tileQualifies = $arr(79, () => new Int8Array(29));
  let aTileQualified = 0;
  let fastForward = 0;
  aTileQualified = false_;
  fastForward = false_;
  for (i = (x - maxRadius > 0 ? x - maxRadius : 0) << 16 >> 16; (100 - 20 - 1 - 1 > x + maxRadius ? x + maxRadius : 100 - 20 - 1 - 1) >= i; i = i + 1 << 16 >> 16) {
    for (j = (y - maxRadius > 0 ? y - maxRadius : 0) << 16 >> 16; (31 + 3 - 3 - 2 - 1 > y + maxRadius ? y + maxRadius : 31 + 3 - 3 - 2 - 1) >= j; j = j + 1 << 16 >> 16) {
      if ((!reqTerrainFlags || cellHasTerrainFlag(struct_pos.$of(reqTerrainFlags << 16 >> 16, i), $u64(j))) && (!reqTileFlags || ($at2(G.pmap, i, j).flags & reqTileFlags) >>> 0) && Math.imul(maxRadius, maxRadius) >= Math.imul(i - x, i - x) + Math.imul(j - y, j - y)) {
        tileQualifies[i][j] = true_;
        localRadius[i][j] = Math.trunc(fp_sqrt($mul64(Math.imul(i - x, i - x) + Math.imul(j - y, j - y), FP_FACTOR)) / FP_FACTOR) << 16 >> 16;
        aTileQualified = true_;
      } else {
        tileQualifies[i][j] = false_;
      }
    }
  }
  if (!aTileQualified) {
    return;
  }
  for (k = 1; frames >= k; k = k + 1 << 16 >> 16) {
    currentRadius = (1 > (Math.imul(maxRadius, k) / frames | 0) ? 1 : Math.imul(maxRadius, k) / frames | 0) << 16 >> 16;
    fadeOut = (((frames - k) * 100 * 5 / frames | 0) > 100 ? 100 : (frames - k) * 100 * 5 / frames | 0) << 16 >> 16;
    for (i = (x - maxRadius > 0 ? x - maxRadius : 0) << 16 >> 16; (100 - 20 - 1 - 1 > x + maxRadius ? x + maxRadius : 100 - 20 - 1 - 1) >= i; i = i + 1 << 16 >> 16) {
      for (j = (y - maxRadius > 0 ? y - maxRadius : 0) << 16 >> 16; (31 + 3 - 3 - 2 - 1 > y + maxRadius ? y + maxRadius : 31 + 3 - 3 - 2 - 1) >= j; j = j + 1 << 16 >> 16) {
        if (tileQualifies[i][j] && currentRadius >= localRadius[i][j]) {
          intensity = 100 - (100 * (currentRadius - localRadius[i][j] - 2) / currentRadius | 0) << 16 >> 16;
          intensity = (Math.imul(fadeOut, intensity) / 100 | 0) << 16 >> 16;
          await hiliteCell(i, j, theColor, intensity, false_);
        }
      }
    }
    if (!fastForward && (G.rogue.playbackFastForward || await pauseAnimation(50, struct_PauseBehavior.$of()))) {
      k = frames - 1 << 16 >> 16;
      fastForward = true_;
    }
  }
}

export async function funkyFade(displayBuf: struct_screenDisplayBuffer | null, colorStart: struct_color | null, colorEnd: struct_color | null, stepCount: number, x: number, y: number, invert: number): Promise<void> {
  let i = 0;
  let j = 0;
  let n = 0;
  let weight = 0;
  let x2 = 0;
  let y2 = 0;
  let weightGrid = $arr(100, () => $arr(34, () => new Float64Array(3)));
  let percentComplete = 0;
  let tempColor = new struct_color();
  let colorMid = new struct_color();
  let foreColor = new struct_color();
  let backColor = new struct_color();
  let tempChar = 0;
  let distanceMap = null;
  let fastForward = 0;
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  fastForward = false_;
  distanceMap = allocGrid();
  fillGrid(distanceMap, 0);
  calculateDistances(distanceMap, G.player.loc.x, G.player.loc.y, T_OBSTRUCTS_PASSABILITY, null, true_, true_);
  for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
    x2 = (i - x) * 5 / COLS;
    for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
      y2 = (j - y) * 2.5 / ROWS;
      weightGrid[i][j][0] = (((x2 * x2 + y2 * y2) * (x2 * x2 + y2 * y2) + 11) / (10 * ((x2 * x2 + y2 * y2) * (x2 * x2 + y2 * y2) + 1)) - 0.10000000000000001) * (0.69999999999999996 + 0.29999999999999999 * cos(5 * x2 * x2) * cos(5 * y2 * y2));
      weightGrid[i][j][1] = (((x2 * x2 + y2 * y2) * (x2 * x2 + y2 * y2) + 11) / (10 * ((x2 * x2 + y2 * y2) * (x2 * x2 + y2 * y2) + 1)) - 0.10000000000000001) * (0.69999999999999996 + 0.29999999999999999 * sin(5 * x2 * x2) * cos(5 * y2 * y2));
      weightGrid[i][j][2] = ((x2 * x2 + y2 * y2) * (x2 * x2 + y2 * y2) + 11) / (10 * ((x2 * x2 + y2 * y2) * (x2 * x2 + y2 * y2) + 1)) - 0.10000000000000001;
    }
  }
  for (n = (invert ? stepCount - 1 : 0) << 16 >> 16; invert ? n >= 0 ? 1 : 0 : stepCount >= n ? 1 : 0; n = n + (invert ? -1 : 1) << 16 >> 16) {
    for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
        percentComplete = n * 100 / stepCount;
        colorMid.$cp(colorStart);
        if (colorEnd) {
          applyColorAverage(colorMid, colorEnd, (n * 100 / stepCount | 0) << 16 >> 16);
        }
        if (!invert && coordinatesAreInMap(i - 20 - 1 << 16 >> 16, j - 3 << 16 >> 16) && $rd(distanceMap.a[distanceMap.o + (i - 20 - 1)], (j - 3)) >= 0 && 30000 > $rd(distanceMap.a[distanceMap.o + (i - 20 - 1)], (j - 3))) {
          percentComplete = percentComplete * (1 + (100 - ($rd(distanceMap.a[distanceMap.o + (i - 20 - 1)], (j - 3)) > 100 ? 100 : $rd(distanceMap.a[distanceMap.o + (i - 20 - 1)], (j - 3)))) / 100);
        }
        weight = Math.trunc(percentComplete + weightGrid[i][j][2] * percentComplete * 10) << 16 >> 16;
        weight = (weight > 100 ? 100 : weight) << 16 >> 16;
        tempColor.$cp(G.black);
        tempColor.red = (Math.imul(Math.trunc(percentComplete + weightGrid[i][j][0] * percentComplete * 10) << 16 >> 16, colorMid.red) / 100 | 0) << 16 >> 16;
        tempColor.red = (tempColor.red > colorMid.red ? colorMid.red : tempColor.red) << 16 >> 16;
        tempColor.green = (Math.imul(Math.trunc(percentComplete + weightGrid[i][j][1] * percentComplete * 10) << 16 >> 16, colorMid.green) / 100 | 0) << 16 >> 16;
        tempColor.green = (tempColor.green > colorMid.green ? colorMid.green : tempColor.green) << 16 >> 16;
        tempColor.blue = (Math.imul(Math.trunc(percentComplete + weightGrid[i][j][2] * percentComplete * 10) << 16 >> 16, colorMid.blue) / 100 | 0) << 16 >> 16;
        tempColor.blue = (tempColor.blue > colorMid.blue ? colorMid.blue : tempColor.blue) << 16 >> 16;
        backColor.$cp(G.black);
        backColor.red = $at2(displayBuf.cells, i, j).backColorComponents[0];
        backColor.green = $at2(displayBuf.cells, i, j).backColorComponents[1];
        backColor.blue = $at2(displayBuf.cells, i, j).backColorComponents[2];
        foreColor.$cp(invert ? G.white : G.black);
        if (j === MESSAGE_LINES - 1 && i >= 0 + 20 + 1 && i < strLenWithoutEscapes(P(G.displayedMessage[3 - j - 1])) + 20 + 1) {
          tempChar = G.displayedMessage[MESSAGE_LINES - j - 1][i - 20 - 1];
        } else {
          tempChar = $at2(displayBuf.cells, i, j).character;
          foreColor.red = $at2(displayBuf.cells, i, j).foreColorComponents[0];
          foreColor.green = $at2(displayBuf.cells, i, j).foreColorComponents[1];
          foreColor.blue = $at2(displayBuf.cells, i, j).foreColorComponents[2];
          applyColorAverage(foreColor, tempColor, weight);
        }
        applyColorAverage(backColor, tempColor, weight);
        plotCharWithColor(tempChar, struct_windowpos.$of(i, j), foreColor, backColor);
      }
    }
    if (!fastForward && await pauseAnimation(16, struct_PauseBehavior.$of())) {
      let event = new struct_rogueEvent();
      await nextKeyOrMouseEvent(event, false_, false_);
      fastForward = true_;
      n = (invert ? 1 : stepCount - 2) << 16 >> 16;
    }
  }
  freeGrid(distanceMap);
  G.rogue.RNG = oldRNG;
  ;
}

async function displayWaypoints(): Promise<void> {
  let i = 0;
  let j = 0;
  let w = 0;
  let lowestDistance = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      lowestDistance = 30000;
      for (w = 0; G.rogue.wpCount > w; w = w + 1 << 16 >> 16) {
        if (lowestDistance > $rd($rd(G.rogue.wpDistance[w], i), j)) {
          lowestDistance = $rd($rd(G.rogue.wpDistance[w], i), j);
        }
      }
      if (10 > lowestDistance) {
        await hiliteCell(i, j, G.white, ((100 - lowestDistance * 15 > 0 ? 100 - lowestDistance * 15 : 0) > 100 ? 100 : 100 - lowestDistance * 15 > 0 ? 100 - lowestDistance * 15 : 0) << 16 >> 16, true_);
      }
    }
  }
  await temporaryMessage(S("Waypoints:"), REQUIRE_ACKNOWLEDGMENT);
  await displayLevel();
}

async function displayMachines(): Promise<void> {
  let i = 0;
  let j = 0;
  let foreColor = new struct_color();
  let backColor = new struct_color();
  let machineColors = $sarr(struct_color, 50);
  const dchar = new Int32Array(1);
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  for (i = 0; 50 > i; i = i + 1 << 16 >> 16) {
    machineColors[i].$cp(G.black);
    machineColors[i].red = rand_range(0, 100) << 16 >> 16;
    machineColors[i].green = rand_range(0, 100) << 16 >> 16;
    machineColors[i].blue = rand_range(0, 100) << 16 >> 16;
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($at2(G.pmap, i, j).machineNumber) {
        await getCellAppearance(struct_pos.$of(i, j), P(dchar, 0), foreColor, backColor);
        applyColorAugment(backColor, $sat(machineColors, $at2(G.pmap, i, j).machineNumber), 50);
        if (10 > $at2(G.pmap, i, j).machineNumber) {
          dchar[0] = 48 + $at2(G.pmap, i, j).machineNumber;
        } else if (10 + 26 > $at2(G.pmap, i, j).machineNumber) {
          dchar[0] = 97 + $at2(G.pmap, i, j).machineNumber - 10;
        } else {
          dchar[0] = 65 + $at2(G.pmap, i, j).machineNumber - 10 - 26;
        }
        plotCharWithColor(dchar[0], mapToWindow(struct_pos.$of(i, j)), foreColor, backColor);
      }
    }
  }
  await temporaryMessage(S("Machines:"), REQUIRE_ACKNOWLEDGMENT);
  await displayLevel();
  G.rogue.RNG = oldRNG;
  ;
}

async function displayChokeMap(): Promise<void> {
  let i = 0;
  let j = 0;
  let foreColor = new struct_color();
  let backColor = new struct_color();
  const dchar = new Int32Array(1);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (CHOKEMAP_DISPLAY_CUTOFF > $rd(G.chokeMap.a[G.chokeMap.o + i], j)) {
        if (($at2(G.pmap, i, j).flags & IS_GATE_SITE) >>> 0) {
          await getCellAppearance(struct_pos.$of(i, j), P(dchar, 0), foreColor, backColor);
          applyColorAugment(backColor, G.teal, 50);
          plotCharWithColor(dchar[0], mapToWindow(struct_pos.$of(i, j)), foreColor, backColor);
        } else if (CHOKEMAP_DISPLAY_CUTOFF > $rd(G.chokeMap.a[G.chokeMap.o + i], j)) {
          await getCellAppearance(struct_pos.$of(i, j), P(dchar, 0), foreColor, backColor);
          applyColorAugment(backColor, G.red, 100 - ($rd(G.chokeMap.a[G.chokeMap.o + i], j) * 100 / CHOKEMAP_DISPLAY_CUTOFF | 0) << 16 >> 16);
          plotCharWithColor(dchar[0], mapToWindow(struct_pos.$of(i, j)), foreColor, backColor);
        }
      }
    }
  }
  await temporaryMessage(S("Choke map:"), REQUIRE_ACKNOWLEDGMENT);
  await displayLevel();
}

async function displayLoops(): Promise<void> {
  let i = 0;
  let j = 0;
  let foreColor = new struct_color();
  let backColor = new struct_color();
  const dchar = new Int32Array(1);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (($at2(G.pmap, i, j).flags & IN_LOOP) >>> 0) {
        await getCellAppearance(struct_pos.$of(i, j), P(dchar, 0), foreColor, backColor);
        applyColorAugment(backColor, G.yellow, 50);
        plotCharWithColor(dchar[0], mapToWindow(struct_pos.$of(i, j)), foreColor, backColor);
      }
      if (($at2(G.pmap, i, j).flags & IS_CHOKEPOINT) >>> 0) {
        await getCellAppearance(struct_pos.$of(i, j), P(dchar, 0), foreColor, backColor);
        applyColorAugment(backColor, G.teal, 50);
        plotCharWithColor(dchar[0], mapToWindow(struct_pos.$of(i, j)), foreColor, backColor);
      }
    }
  }
  await temporaryMessage(S("Loops:"), REQUIRE_ACKNOWLEDGMENT);
  await displayLevel();
}

async function exploreKey(controlKey: number): Promise<void> {
  let x = 0;
  let y = 0;
  let finalX = 0;
  let finalY = 0;
  let exploreMap = null;
  let dir = 0;
  let tooDark = false_;
  dir = adjacentFightingDir();
  if (dir === NO_DIRECTION) {
    for (dir = 0; DIRECTION_COUNT > dir; ++dir) {
      x = G.player.loc.x + G.nbDirs[dir][0] << 16 >> 16;
      y = G.player.loc.y + G.nbDirs[dir][1] << 16 >> 16;
      if (coordinatesAreInMap(x, y) && !(($at2(G.pmap, x, y).flags & DISCOVERED) >>> 0)) {
        tooDark = true_;
        break;
      }
    }
    if (!tooDark) {
      x = finalX = G.player.loc.x;
      y = finalY = G.player.loc.y;
      exploreMap = allocGrid();
      await getExploreMap(exploreMap, false_);
      do {
        dir = nextStep(exploreMap, struct_pos.$of(x, y), null, false_);
        if (dir !== NO_DIRECTION) {
          x = x + G.nbDirs[dir][0] << 16 >> 16;
          y = y + G.nbDirs[dir][1] << 16 >> 16;
          if (($at2(G.pmap, x, y).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0) {
            finalX = x;
            finalY = y;
          }
        }
      } while (dir !== NO_DIRECTION);
      freeGrid(exploreMap);
    }
  } else {
    x = finalX = G.player.loc.x + G.nbDirs[dir][0] << 16 >> 16;
    y = finalY = G.player.loc.y + G.nbDirs[dir][1] << 16 >> 16;
  }
  if (tooDark) {
    await message(S("It's too dark to explore!"), 0);
  } else if (x === G.player.loc.x && y === G.player.loc.y) {
    await message(S("I see no path for further exploration."), 0);
  } else if (await proposeOrConfirmLocation(struct_pos.$of(finalX, finalY), S("I see no path for further exploration."))) {
    await explore((controlKey ? 1 : 20) << 16 >> 16);
    hideCursor();
    await exploreKey(controlKey);
  }
}

export async function pauseBrogue(milliseconds: number, behavior: struct_PauseBehavior): Promise<number> {
  commitDraws();
  if (G.rogue.playbackMode && G.rogue.playbackFastForward) {
    return true_;
  }
  while (milliseconds > 100) {
    if (await pauseForMilliseconds(50, behavior.$clone())) {
      return true_;
    }
    milliseconds = milliseconds - 50 << 16 >> 16;
  }
  return await pauseForMilliseconds(milliseconds, behavior.$clone());
}

export async function pauseAnimation(milliseconds: number, behavior: struct_PauseBehavior): Promise<number> {
  if (G.rogue.playbackMode && !G.rogue.playbackPaused && milliseconds > 0) {
    let factor = G.rogue.playbackDelayPerTurn / DEFAULT_PLAYBACK_DELAY;
    if (factor > 1) {
      factor = sqrt(factor);
    }
    milliseconds = (1 > lround(milliseconds * factor) ? 1 : lround(milliseconds * factor)) << 16 >> 16;
  }
  return await pauseBrogue(milliseconds, behavior.$clone());
}

export async function nextBrogueEvent(returnEvent: struct_rogueEvent | null, textInput: number, colorsDance: number, realInputEvenInPlayback: number): Promise<void> {
  let recordingInput = new struct_rogueEvent();
  let repeatAgain = 0;
  let interaction = 0;
  let pauseDuration = 0;
  returnEvent.eventType = EVENT_ERROR;
  if (G.rogue.playbackMode && !realInputEvenInPlayback) {
    do {
      repeatAgain = false_;
      if (!G.rogue.playbackFastForward && G.rogue.playbackBetweenTurns || G.rogue.playbackOOS) {
        pauseDuration = (G.rogue.playbackPaused ? DEFAULT_PLAYBACK_DELAY : G.rogue.playbackDelayThisTurn) << 16 >> 16;
        if (pauseDuration && await pauseBrogue(pauseDuration, struct_PauseBehavior.$of())) {
          await nextBrogueEvent(recordingInput, false_, false_, true_);
          interaction = await executePlaybackInput(recordingInput);
          repeatAgain = (!G.rogue.playbackPaused && interaction ? 1 : 0) << 24 >> 24;
        }
      }
    } while ((repeatAgain || G.rogue.playbackOOS) && !G.rogue.gameHasEnded);
    G.rogue.playbackDelayThisTurn = G.rogue.playbackDelayPerTurn;
    await recallEvent(returnEvent);
  } else {
    commitDraws();
    if (G.rogue.creaturesWillFlashThisTurn) {
      await displayMonsterFlashes(true_);
    }
    do {
      await nextKeyOrMouseEvent(returnEvent, textInput, colorsDance);
    } while (returnEvent.eventType >>> 0 === MOUSE_UP && !locIsInWindow(struct_windowpos.$of(returnEvent.param1 << 16 >> 16, returnEvent.param2 << 16 >> 16)));
  }
  if (returnEvent.eventType >>> 0 === EVENT_ERROR) {
    G.rogue.playbackPaused = G.rogue.playbackMode;
    await message(S("Event error!"), REQUIRE_ACKNOWLEDGMENT);
  }
}

export async function executeMouseClick(theEvent: struct_rogueEvent | null): Promise<void> {
  let mouse = struct_windowpos.$of(theEvent.param1 << 16 >> 16, theEvent.param2 << 16 >> 16);
  let autoConfirm = theEvent.controlKey;
  if (theEvent.eventType >>> 0 === RIGHT_MOUSE_UP) {
    await displayInventory(ALL_ITEMS, 0, 0, true_, true_);
  } else if (isPosInMap(windowToMap(mouse))) {
    if (autoConfirm) {
      await travel(windowToMap(mouse), autoConfirm);
    } else {
      G.rogue.cursorLoc.$cp(windowToMap(mouse));
      await mainInputLoop();
    }
  } else if (mouse.window_x - 20 - 1 >= 0 && DCOLS > mouse.window_x - 20 - 1 && mouse.window_y >= 0 && MESSAGE_LINES > mouse.window_y) {
    await displayMessageArchive();
  }
}

export async function executeKeystroke(keystroke$: number, controlKey: number, shiftKey: number): Promise<void> {
  const keystroke = new Float64Array(1);
  keystroke[0] = keystroke$;
  let direction = -1;
  confirmMessages();
  stripShiftFromMovementKeystroke(P(keystroke, 0));
  switch (keystroke[0]) {
  case 107:
  case 63232:
  case 56:
    direction = UP;
    break;
  case 106:
  case 63233:
  case 50:
    direction = DOWN;
    break;
  case 104:
  case 63234:
  case 52:
    direction = LEFT;
    break;
  case 108:
  case 63235:
  case 54:
    direction = RIGHT;
    break;
  case 55:
  case 121:
    direction = UPLEFT;
    break;
  case 117:
  case 57:
    direction = UPRIGHT;
    break;
  case 98:
  case 49:
    direction = DOWNLEFT;
    break;
  case 110:
  case 51:
    direction = DOWNRIGHT;
    break;
  case 62:
    considerCautiousMode();
    if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 1) {
      recordKeystroke(DESCEND_KEY, false_, false_);
      await useStairs(1);
    } else if (await proposeOrConfirmLocation(G.rogue.downLoc.$clone(), S("I see no way down."))) {
      await travel(G.rogue.downLoc.$clone(), true_);
    }
    break;
  case 60:
    considerCautiousMode();
    if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 1) {
      recordKeystroke(ASCEND_KEY, false_, false_);
      await useStairs(-1);
    } else if (await proposeOrConfirmLocation(G.rogue.upLoc.$clone(), S("I see no way up."))) {
      await travel(G.rogue.upLoc.$clone(), true_);
    }
    break;
  case 10:
    showCursor();
    break;
  case 122:
  case 46:
  case 53:
    considerCautiousMode();
    G.rogue.justRested = true_;
    recordKeystroke(REST_KEY, false_, false_);
    await playerTurnEnded();
    break;
  case 90:
    G.rogue.justRested = true_;
    await autoRest();
    break;
  case 115:
    if (controlKey) {
      G.rogue.disturbed = false_;
      G.rogue.automationActive = true_;
      do {
        await manualSearch();
        if (await pauseAnimation(80, struct_PauseBehavior.$of())) {
          G.rogue.disturbed = true_;
        }
      } while (5 > G.player.status[STATUS_SEARCHING] && !G.rogue.disturbed);
      G.rogue.automationActive = false_;
    } else {
      await manualSearch();
    }
    break;
  case 105:
    await displayInventory(ALL_ITEMS, 0, 0, true_, true_);
    break;
  case 101:
    await equip(null);
    break;
  case 114:
    await unequip(null);
    break;
  case 100:
    await drop(null);
    break;
  case 97:
    await apply(null);
    break;
  case 116:
    await throwCommand(null, false_);
    break;
  case 84:
    if (!!G.rogue.lastItemThrown && itemIsCarried(G.rogue.lastItemThrown)) {
      await throwCommand(G.rogue.lastItemThrown, true_);
    }
    break;
  case 82:
    await relabel(null);
    break;
  case 119:
    await swapLastEquipment();
    break;
  case 92:
    G.rogue.trueColorMode = (!G.rogue.trueColorMode ? 1 : 0) << 24 >> 24;
    await displayLevel();
    await refreshSideBar(-1, -1, false_);
    if (G.rogue.trueColorMode) {
      await messageWithColor(KEYBOARD_LABELS ? S("Color effects disabled. Press '\\' again to enable.") : S("Color effects disabled."), G.teal, 0);
    } else {
      await messageWithColor(KEYBOARD_LABELS ? S("Color effects enabled. Press '\\' again to disable.") : S("Color effects enabled."), G.teal, 0);
    }
    break;
  case 93:
    G.rogue.displayStealthRangeMode = (!G.rogue.displayStealthRangeMode ? 1 : 0) << 24 >> 24;
    await displayLevel();
    await refreshSideBar(-1, -1, false_);
    if (G.rogue.displayStealthRangeMode) {
      await messageWithColor(KEYBOARD_LABELS ? S("Stealth range displayed. Press ']' again to hide.") : S("Stealth range displayed."), G.teal, 0);
    } else {
      await messageWithColor(KEYBOARD_LABELS ? S("Stealth range hidden. Press ']' again to display.") : S("Stealth range hidden."), G.teal, 0);
    }
    break;
  case 99:
    await call(null);
    break;
  case 120:
    considerCautiousMode();
    await exploreKey(controlKey);
    break;
  case 65:
    if (await confirm(S("Turn on autopilot?"), false_)) {
      await autoPlayLevel(controlKey);
    }
    break;
  case 77:
    await displayMessageArchive();
    break;
  case 63:
    await printHelpScreen();
    break;
  case 70:
    await displayFeatsScreen();
    break;
  case 68:
    await printDiscoveriesScreen();
    break;
  case 67:
    if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD) {
      await dialogCreateItemOrMonster();
    }
    break;
  case 83:
    if (G.rogue.playbackMode || G.serverMode) {
      return;
    }
    if (await confirm(S("Save this game and exit?"), false_)) {
      await saveGame();
    }
    break;
  case 78:
    if (50 > G.rogue.playerTurnNumber || await confirm(S("End this game and begin a new game?"), false_)) {
      G.rogue.nextGame = NG_NEW_GAME;
      G.rogue.gameHasEnded = true_;
    }
    break;
  case 81:
    if (await confirm(S("Quit and abandon this game? (The save will be deleted.)"), false_)) {
      recordKeystroke(QUIT_KEY, false_, false_);
      G.rogue.quit = true_;
      await gameOver(S("Quit"), true_);
    }
    break;
  case 71:
    if (G.hasGraphics) {
      G.graphicsMode = setGraphicsMode(((G.graphicsMode >>> 0) + 1 >>> 0) % 3 | 0);
      switch (G.graphicsMode >>> 0) {
      case TEXT_GRAPHICS:
        await messageWithColor(KEYBOARD_LABELS ? S("Switched to text mode. Press 'G' again to enable tiles.") : S("Switched to text mode."), G.teal, 0);
        break;
      case TILES_GRAPHICS:
        await messageWithColor(KEYBOARD_LABELS ? S("Switched to graphical tiles. Press 'G' again to enable hybrid mode.") : S("Switched to graphical tiles."), G.teal, 0);
        break;
      case HYBRID_GRAPHICS:
        await messageWithColor(KEYBOARD_LABELS ? S("Switched to hybrid mode. Press 'G' again to disable tiles.") : S("Switched to hybrid mode."), G.teal, 0);
        break;
      }
    }
    break;
  case 126:
    if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD) {
      await displayLoops();
    }
    if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD) {
      await displayChokeMap();
    }
    if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD) {
      await displayMachines();
    }
    if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD) {
      await displayWaypoints();
    }
    await printSeed();
    break;
  case 38:
    await enableEasyMode();
    break;
  case 44:
    if (takeScreenshot()) {
      await flashTemporaryAlert(S(" Screenshot saved in save directory "), 2000);
    }
    break;
  default:
    break;
  }
  if (direction >= 0) {
    hideCursor();
    considerCautiousMode();
    if (controlKey || shiftKey) {
      await playerRuns(direction);
    } else {
      await playerMoves(direction);
    }
    await refreshSideBar(-1, -1, false_);
  }
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    await displayGrid(G.safetyMap);
  }
  if (G.rogue.trueColorMode || G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    await displayLevel();
  }
  G.rogue.cautiousMode = false_;
}

export async function getInputTextString(inputText: Ptr | null, prompt: Ptr | null, maxLength: number, defaultEntry: Ptr | null, promptSuffix: Ptr | null, textEntryType: number, useDialogBox: number): Promise<number> {
  let charNum = 0;
  let i = 0;
  let x = 0;
  let y = 0;
  let promptSuffixLen = 0;
  let defaultEntrylengthOverflow = 0;
  let keystroke = 0;
  let suffix = new Int8Array(100);
  let textEntryBounds = $rows([$ta(Int16Array, 2, [32, 126]), $ta(Int16Array, 2, [32, 126]), $ta(Int16Array, 2, [48, 57])]);
  let dbuf = new struct_screenDisplayBuffer();
  let rbuf = new struct_SavedDisplayBuffer();
  promptSuffixLen = strlen(promptSuffix) << 16 >> 16;
  defaultEntrylengthOverflow = strlen(defaultEntry) + $u64(promptSuffixLen) - $u64(maxLength) << 16 >> 16;
  if (defaultEntrylengthOverflow > 0) {
    defaultEntry.a[defaultEntry.o + (strlen(defaultEntry) - $u64(defaultEntrylengthOverflow))] = 0;
  }
  if (useDialogBox) {
    x = ((COLS - (maxLength > strLenWithoutEscapes(prompt) ? maxLength : strLenWithoutEscapes(prompt))) / 2 | 0) << 16 >> 16;
    y = (ROWS / 2 | 0) - 1 << 16 >> 16;
    clearDisplayBuffer(dbuf);
    rectangularShading(x - 1 << 16 >> 16, y - 2 << 16 >> 16, (maxLength > strLenWithoutEscapes(prompt) ? maxLength : strLenWithoutEscapes(prompt)) + 2 << 16 >> 16, 4, G.interfaceBoxColor, INTERFACE_OPACITY, dbuf);
    rbuf.$cp(saveDisplayBuffer());
    overlayDisplayBuffer(dbuf);
    printString(prompt, x, y - 1 << 16 >> 16, G.white, G.interfaceBoxColor, null);
    for (i = 0; maxLength > i; i = i + 1 << 16 >> 16) {
      plotCharWithColor(32, struct_windowpos.$of(x + i << 16 >> 16, y), G.black, G.black);
    }
    printString(defaultEntry, x, y, G.white, G.black, null);
  } else {
    confirmMessages();
    x = strLenWithoutEscapes(prompt) + 20 + 1 << 16 >> 16;
    y = MESSAGE_LINES - 1;
    await temporaryMessage(prompt, 0);
    printString(defaultEntry, x, y, G.white, G.black, null);
  }
  maxLength = (100 - x > maxLength ? maxLength : 100 - x) << 16 >> 16;
  if (!$peq(inputText, defaultEntry)) {
    strcpy(inputText, defaultEntry);
  }
  charNum = strLenWithoutEscapes(inputText);
  for (i = charNum; maxLength > i; i = i + 1 << 16 >> 16) {
    inputText.a[inputText.o + i] = 32;
  }
  if (promptSuffix.a[promptSuffix.o] === 0) {
    strcpy(P(suffix), S(" "));
  } else {
    strcpy(P(suffix), promptSuffix);
  }
  do {
    printString(P(suffix), charNum + x << 16 >> 16, y, G.gray, G.black, null);
    plotCharWithColor(suffix[0] ? suffix[0] : 32, struct_windowpos.$of(x + charNum << 16 >> 16, y), G.black, G.white);
    keystroke = await nextKeyPress(true_);
    if (keystroke === DELETE_KEY && charNum > 0) {
      printString(P(suffix), charNum + x - 1 << 16 >> 16, y, G.gray, G.black, null);
      plotCharWithColor(32, struct_windowpos.$of($u64(x + charNum) + strlen(P(suffix)) - 1 << 16 >> 16, y), G.black, G.black);
      charNum = charNum - 1 << 16 >> 16;
      inputText.a[inputText.o + charNum] = 32;
    } else if (keystroke >= textEntryBounds[textEntryType][0] && textEntryBounds[textEntryType][1] >= keystroke) {
      if (textEntryType === TEXT_INPUT_FILENAME && characterForbiddenInFilename(keystroke)) {
        keystroke = 45;
      }
      inputText.a[inputText.o + charNum] = keystroke;
      plotCharWithColor(keystroke, struct_windowpos.$of(x + charNum << 16 >> 16, y), G.white, G.black);
      if (maxLength - promptSuffixLen > charNum) {
        printString(P(suffix), charNum + x + 1 << 16 >> 16, y, G.gray, G.black, null);
        charNum = charNum + 1 << 16 >> 16;
      }
    }
  } while (keystroke !== RETURN_KEY && keystroke !== ESCAPE_KEY);
  if (useDialogBox) {
    restoreDisplayBuffer(rbuf);
  }
  inputText.a[inputText.o + charNum] = 0;
  if (keystroke === ESCAPE_KEY) {
    return false_;
  }
  strcat(P(G.displayedMessage[0]), inputText);
  strcat(P(G.displayedMessage[0]), P(suffix));
  return true_;
}

export function displayCenteredAlert(message: Ptr | null): void {
  printString(message, ((COLS - strLenWithoutEscapes(message)) / 2 | 0) << 16 >> 16, (ROWS / 2 | 0) << 16 >> 16, G.teal, G.black, null);
}

export async function flashMessage(message: Ptr | null, x: number, y: number, time: number, fColor: struct_color | null, bColor: struct_color | null): Promise<void> {
  let fastForward = 0;
  let i = 0;
  let j = 0;
  let messageLength = 0;
  let percentComplete = 0;
  let previousPercentComplete = 0;
  let backColors = $sarr(struct_color, 100);
  let backColor = new struct_color();
  let foreColor = new struct_color();
  let dbufs = $sarr(struct_cellDisplayBuffer, 100);
  let dchar = 0;
  let oldRNG = 0;
  let stepInMs = 16;
  if (G.rogue.playbackFastForward) {
    return;
  }
  oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  messageLength = strLenWithoutEscapes(message);
  fastForward = false_;
  for (j = 0; messageLength > j; ++j) {
    backColors[j].$cp(colorFromComponents(P($at2(G.displayBuffer.cells, j + x, y).backColorComponents)));
    dbufs[j].$cp($at2(G.displayBuffer.cells, j + x, y));
  }
  previousPercentComplete = -1;
  for (i = 0; time > i && fastForward === false_; i += stepInMs) {
    percentComplete = 100 * i / time | 0;
    percentComplete = Math.imul(percentComplete, percentComplete) / 100 | 0;
    if (previousPercentComplete !== percentComplete) {
      for (j = 0; messageLength > j; ++j) {
        if (i === 0) {
          backColors[j].$cp(colorFromComponents(P($at2(G.displayBuffer.cells, j + x, y).backColorComponents)));
          dbufs[j].$cp($at2(G.displayBuffer.cells, j + x, y));
        }
        backColor.$cp(backColors[j]);
        applyColorAverage(backColor, bColor, 100 - percentComplete << 16 >> 16);
        if (50 > percentComplete) {
          dchar = message.a[message.o + j];
          foreColor.$cp(fColor);
          applyColorAverage(foreColor, backColor, percentComplete * 2 << 16 >> 16);
        } else {
          dchar = dbufs[j].character;
          foreColor.$cp(colorFromComponents(P(dbufs[j].foreColorComponents)));
          applyColorAverage(foreColor, backColor, (100 - percentComplete) * 2 << 16 >> 16);
        }
        plotCharWithColor(dchar, struct_windowpos.$of(j + x << 16 >> 16, y), foreColor, backColor);
      }
    }
    previousPercentComplete = percentComplete;
    fastForward = await pauseBrogue(stepInMs << 16 >> 16, struct_PauseBehavior.$of());
  }
  for (j = 0; messageLength > j; ++j) {
    foreColor.$cp(colorFromComponents(P(dbufs[j].foreColorComponents)));
    plotCharWithColor(dbufs[j].character, struct_windowpos.$of(j + x << 16 >> 16, y), foreColor, $sat(backColors, j));
  }
  G.rogue.RNG = oldRNG;
  ;
}

export async function flashTemporaryAlert(message: Ptr | null, time: number): Promise<void> {
  await flashMessage(message, ((COLS - strLenWithoutEscapes(message)) / 2 | 0) << 16 >> 16, (ROWS / 2 | 0) << 16 >> 16, time, G.teal, G.black);
}

export async function waitForAcknowledgment(): Promise<void> {
  let theEvent = new struct_rogueEvent();
  if (G.rogue.autoPlayingLevel || G.rogue.playbackMode && !G.rogue.playbackOOS || G.nonInteractivePlayback) {
    return;
  }
  do {
    await nextBrogueEvent(theEvent, false_, false_, false_);
    if (theEvent.eventType >>> 0 === KEYSTROKE && theEvent.param1 !== ACKNOWLEDGE_KEY && theEvent.param1 !== ESCAPE_KEY) {
      await flashTemporaryAlert(S(" -- Press space or click to continue -- "), 500);
    }
  } while (!(theEvent.eventType >>> 0 === KEYSTROKE && (theEvent.param1 === ACKNOWLEDGE_KEY || theEvent.param1 === ESCAPE_KEY) || theEvent.eventType >>> 0 === MOUSE_UP));
}

export async function waitForKeystrokeOrMouseClick(): Promise<void> {
  let theEvent = new struct_rogueEvent();
  do {
    await nextBrogueEvent(theEvent, false_, false_, false_);
  } while (theEvent.eventType >>> 0 !== KEYSTROKE && theEvent.eventType >>> 0 !== MOUSE_UP);
}

export async function confirm(prompt: Ptr | null, alsoDuringPlayback: number): Promise<number> {
  let retVal = 0;
  let buttons = $sarrOf([struct_brogueButton.$of(new Int8Array(300), 0, 0, new Float64Array(10), new struct_color(), new struct_color(), new struct_color(), 0, new Int32Array(100)), new struct_brogueButton()]);
  let whiteColorEscape = $cs("", 20);
  let yellowColorEscape = $cs("", 20);
  if (G.rogue.autoPlayingLevel || !alsoDuringPlayback && G.rogue.playbackMode) {
    return true_;
  }
  encodeMessageColor(P(whiteColorEscape), 0, G.white);
  encodeMessageColor(P(yellowColorEscape), 0, KEYBOARD_LABELS ? G.yellow : G.white);
  initializeButton(buttons[0]);
  sprintf(P(buttons[0].text), S("     %sY%ses     "), P(yellowColorEscape), P(whiteColorEscape));
  buttons[0].hotkey[0] = 121;
  buttons[0].hotkey[1] = 89;
  buttons[0].hotkey[2] = RETURN_KEY;
  buttons[0].flags = (buttons[0].flags | (B_WIDE_CLICK_AREA | B_KEYPRESS_HIGHLIGHT)) >>> 0;
  initializeButton(buttons[1]);
  sprintf(P(buttons[1].text), S("     %sN%so      "), P(yellowColorEscape), P(whiteColorEscape));
  buttons[1].hotkey[0] = 110;
  buttons[1].hotkey[1] = 78;
  buttons[1].hotkey[2] = ACKNOWLEDGE_KEY;
  buttons[1].hotkey[3] = ESCAPE_KEY;
  buttons[1].flags = (buttons[1].flags | (B_WIDE_CLICK_AREA | B_KEYPRESS_HIGHLIGHT)) >>> 0;
  let rbuf = saveDisplayBuffer().$clone();
  retVal = await printTextBox(prompt, (COLS / 3 | 0) << 16 >> 16, (ROWS / 3 | 0) << 16 >> 16, (COLS / 3 | 0) << 16 >> 16, G.white, G.interfaceBoxColor, buttons[0], 2);
  restoreDisplayBuffer(rbuf);
  if (retVal === -1 || retVal === 1) {
    return false_;
  } else {
    return true_;
  }
  confirmMessages();
  return retVal << 24 >> 24;
}

export async function displayMonsterFlashes(flashingEnabled: number): Promise<void> {
  let x = new Int16Array(100);
  let y = new Int16Array(100);
  let strength = new Int16Array(100);
  let count = 0;
  let flashColor = new Array(100).fill(null);
  G.rogue.creaturesWillFlashThisTurn = false_;
  if (G.rogue.autoPlayingLevel || G.rogue.blockCombatText) {
    return;
  }
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  let handledPlayer = false_;
  for (let it = iterateCreatures(G.monsters); !handledPlayer || hasNextCreature(it); ) {
    let monst = !handledPlayer ? G.player : nextCreature(it);
    handledPlayer = true_;
    if ((monst.bookkeepingFlags & MB_WILL_FLASH) >>> 0) {
      monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_WILL_FLASH >>> 0) >>> 0;
      if (flashingEnabled && canSeeMonster(monst) && 100 > count) {
        x[count] = monst.loc.x;
        y[count] = monst.loc.y;
        strength[count] = monst.flashStrength;
        flashColor[count] = monst.flashColor;
        count = count + 1 << 16 >> 16;
      }
    }
  }
  await flashForeground(P(x), P(y), P(flashColor), P(strength), count, 20);
  G.rogue.RNG = oldRNG;
  ;
}

async function dequeueEvent(): Promise<void> {
  let returnEvent = new struct_rogueEvent();
  await nextBrogueEvent(returnEvent, false_, false_, true_);
}

export function clearMessageArchive(): void {
  G.messageArchivePosition = 0;
}

function getArchivedMessage(back: number): struct_archivedMessage | null {
  return $sat(G.messageArchive, (G.messageArchivePosition + MESSAGE_ARCHIVE_ENTRIES - back) % MESSAGE_ARCHIVE_ENTRIES);
}

function formatCountedMessage(buffer: Ptr | null, size: number, m: struct_archivedMessage | null): number {
  let length = 0;
  if (1 >= m.count) {
    length = snprintf(buffer, size, S("%s"), P(m.message));
  } else if (m.count >= MAX_MESSAGE_REPEATS) {
    length = snprintf(buffer, size, S("%s (many)"), P(m.message));
  } else {
    length = snprintf(buffer, size, S("%s (x%d)"), P(m.message), m.count);
  }
  return length;
}

function foldMessages(buffer: Ptr | null, offset: number, turnOutput: Ptr | null): number {
  let i = 0;
  let folded = 0;
  let messageLength = 0;
  let lineLength = 0;
  let length = 0;
  let turn = 0;
  let counted = new Int8Array(200);
  let m = null;
  folded = 0;
  m = getArchivedMessage(offset + folded + 1 << 16 >> 16);
  if (!m.message[0]) {
    return folded;
  }
  folded = folded + 1 << 16 >> 16;
  turn = m.turn;
  if (turnOutput) {
    turnOutput.a[turnOutput.o] = turn;
  }
  if (!((m.flags & FOLDABLE) >>> 0)) {
    formatCountedMessage(buffer, COLS * 2, m);
    return folded;
  }
  m = getArchivedMessage(offset + folded + 1 << 16 >> 16);
  while (MESSAGE_ARCHIVE_ENTRIES > folded && m.message[0] && (m.flags & FOLDABLE) >>> 0 && turn === m.turn) {
    folded = folded + 1 << 16 >> 16;
    m = getArchivedMessage(offset + folded + 1 << 16 >> 16);
  }
  lineLength = 0;
  length = 0;
  buffer.a[buffer.o + length] = 0;
  for (i = folded; i >= 1; i = i - 1 << 16 >> 16) {
    m = getArchivedMessage(offset + i << 16 >> 16);
    formatCountedMessage(P(counted), COLS * 2, m);
    messageLength = strLenWithoutEscapes(P(counted));
    if (length === 0) {
      length = snprintf(buffer, COLS * 20, S("%s"), P(counted)) << 16 >> 16;
      lineLength = messageLength;
    } else if (DCOLS >= lineLength + 3 + messageLength) {
      length = length + snprintf(buffer.add(length), $u64(COLS * 20 - length), S("; %s"), P(counted)) << 16 >> 16;
      lineLength = lineLength + (2 + messageLength) << 16 >> 16;
    } else {
      length = length + snprintf(buffer.add(length), $u64(COLS * 20 - length), S(".\n%s"), P(counted)) << 16 >> 16;
      lineLength = messageLength;
    }
  }
  snprintf(buffer.add(length), $u64(COLS * 20 - length), S("."));
  return folded;
}

function capitalizeAndPunctuateSentences(text: Ptr | null, length: number): void {
  let i = 0;
  let newSentence = 0;
  newSentence = true_;
  for (i = 0; length > i + 1 && text.a[text.o + i] !== 0 && text.a[text.o + (i + 1)] !== 0; i = i + 1 << 16 >> 16) {
    if (text.a[text.o + i] === COLOR_ESCAPE) {
      i = i + 3 << 16 >> 16;
    } else if (text.a[text.o + i] === 34 && (text.a[text.o + (i + 1)] === 46 || text.a[text.o + (i + 1)] === 44)) {
      text.a[text.o + i] = text.a[text.o + (i + 1)];
      text.a[text.o + (i + 1)] = 34;
    } else if (text.a[text.o + i] === 10) {
      newSentence = true_;
    } else if (newSentence) {
      upperCase(text.add(i));
      newSentence = false_;
    }
  }
}

function splitLines(lines: number, wrapped: Ptr | null, buffer: Ptr | null, bufferCursor: number): void {
  let linesSeen = 0;
  let color = new Int8Array(5);
  let line = new Int8Array(200);
  let start = null;
  let end = null;
  start = wrapped.add(0);
  color[0] = 0;
  line[0] = 0;
  for (end = start, linesSeen = 0; end.a[end.o]; end = end.add(1)) {
    if (end.a[end.o] === COLOR_ESCAPE) {
      strncpy(P(color), end, 4);
      color[4] = 0;
      end = end.add(4);
    } else if (end.a[end.o] === 10) {
      end.a[end.o] = 0;
      if (bufferCursor + 1 - lines + linesSeen >= 0) {
        strncpy(P(line), P(color), 5);
        strncat(P(line), start, COLS * 2 - strlen(P(line)) - 1);
        line[COLS * 2 - 1] = 0;
        strncpy(P(buffer.a[buffer.o + (bufferCursor + 1 - lines + linesSeen)]), P(line), COLS * 2);
        line[0] = 0;
      }
      linesSeen = linesSeen + 1 << 16 >> 16;
      start = end.add(1);
    }
  }
  strncpy(P(line), P(color), 5);
  strncat(P(line), start, COLS * 2 - strlen(P(line)) - 1);
  line[COLS * 2 - 1] = 0;
  strncpy(P(buffer.a[buffer.o + bufferCursor]), P(line), COLS * 2);
}

export function formatRecentMessages(buffer: Ptr | null, height: number, linesFormatted: Ptr | null, latestMessageLines: Ptr | null): void {
  let $t1: any;
  let lines = 0;
  let bufferCursor = 0;
  let messagesFolded = 0;
  let messagesFormatted = 0;
  const turn = new Float64Array(1);
  let folded = new Int8Array(2000);
  let wrapped = new Int8Array(2000);
  bufferCursor = height - 1 << 16 >> 16;
  messagesFormatted = 0;
  if (latestMessageLines) {
    latestMessageLines.a[latestMessageLines.o] = 0;
  }
  while (bufferCursor >= 0 && MESSAGE_ARCHIVE_ENTRIES > messagesFormatted) {
    messagesFolded = foldMessages(P(folded), messagesFormatted, P(turn, 0));
    if (messagesFolded === 0) {
      break;
    }
    capitalizeAndPunctuateSentences(P(folded), COLS * 20);
    lines = wrapText(P(wrapped), P(folded), DCOLS);
    splitLines(lines, P(wrapped), buffer, bufferCursor);
    if (latestMessageLines && turn[0] === G.rogue.playerTurnNumber) {
      latestMessageLines.a[latestMessageLines.o] = latestMessageLines.a[latestMessageLines.o] + lines << 16 >> 16;
    }
    bufferCursor = bufferCursor - lines << 16 >> 16;
    messagesFormatted = messagesFormatted + messagesFolded << 16 >> 16;
  }
  if (linesFormatted) {
    linesFormatted.a[linesFormatted.o] = height - 1 - $u64(bufferCursor) << 16 >> 16;
  }
  while (bufferCursor >= 0) {
    buffer.a[buffer.o + ($t1 = bufferCursor, bufferCursor = $t1 - 1 << 16 >> 16, $t1)][0] = 0;
  }
}

export function displayRecentMessages(): void {
  let i = 0;
  let messageBuffer = $arr(3, () => new Int8Array(200));
  formatRecentMessages(P(messageBuffer), MESSAGE_LINES, null, P(G, "messagesUnconfirmed"));
  for (i = 0; MESSAGE_LINES > i; i = i + 1 << 16 >> 16) {
    strcpy(P(G.displayedMessage[i]), P(messageBuffer[MESSAGE_LINES - i - 1]));
  }
  updateMessageDisplay();
}

function drawMessageArchive(messages: Ptr | null, length: number, offset: number, height: number): void {
  let i = 0;
  let j = 0;
  let k = 0;
  let fadePercent = 0;
  let dbuf = new struct_screenDisplayBuffer();
  clearDisplayBuffer(dbuf);
  for (i = 0; MESSAGE_ARCHIVE_LINES > MESSAGE_ARCHIVE_LINES - offset + i && ROWS > i && height > i; ++i) {
    printString(P(messages.a[messages.o + (MESSAGE_ARCHIVE_LINES - offset + i)]), 0 + 20 + 1, i << 16 >> 16, G.white, G.black, dbuf);
    fadePercent = (50 * (length - offset + i) / length | 0) + 50;
    for (j = 0; DCOLS > j; ++j) {
      $at2(dbuf.cells, j + 20 + 1, i).opacity = INTERFACE_OPACITY;
      if ($at2(dbuf.cells, j + 20 + 1, i).character >>> 0 !== 32) {
        for (k = 0; 3 > k; ++k) {
          $at2(dbuf.cells, j + 20 + 1, i).foreColorComponents[k] = (Math.imul($at2(dbuf.cells, j + 20 + 1, i).foreColorComponents[k], fadePercent) / 100 | 0) << 24 >> 24;
        }
      }
    }
  }
  overlayDisplayBuffer(dbuf);
}

async function animateMessageArchive(opening: number, messages: Ptr | null, length: number, offset: number, height: number): Promise<void> {
  let i = 0;
  let fastForward = 0;
  fastForward = false_;
  for (i = (opening ? MESSAGE_LINES : height) << 16 >> 16; opening ? height >= i ? 1 : 0 : i >= MESSAGE_LINES ? 1 : 0; i = i + (opening ? 1 : -1) << 16 >> 16) {
    let rbuf = saveDisplayBuffer().$clone();
    drawMessageArchive(messages, length, offset - height + i << 16 >> 16, i);
    if (!fastForward && await pauseBrogue((opening ? 2 : 1) << 16 >> 16, struct_PauseBehavior.$of())) {
      fastForward = true_;
      await dequeueEvent();
      i = (opening ? height - 1 : MESSAGE_LINES + 1) << 16 >> 16;
    }
    restoreDisplayBuffer(rbuf);
  }
}

async function scrollMessageArchive(messages: Ptr | null, length: number, offset: number, height: number): Promise<number> {
  let lastOffset = offset - 1 << 16 >> 16;
  let exit = 0;
  let theEvent = new struct_rogueEvent();
  const keystroke = new Float64Array(1);
  if (G.rogue.autoPlayingLevel || G.rogue.playbackMode && !G.rogue.playbackOOS) {
    return offset;
  }
  let rbuf = saveDisplayBuffer().$clone();
  exit = false_;
  do {
    if (offset !== lastOffset) {
      restoreDisplayBuffer(rbuf);
      drawMessageArchive(messages, length, offset, height);
    }
    lastOffset = offset;
    await nextBrogueEvent(theEvent, false_, false_, false_);
    if (theEvent.eventType >>> 0 === KEYSTROKE) {
      keystroke[0] = theEvent.param1;
      stripShiftFromMovementKeystroke(P(keystroke, 0));
      switch (keystroke[0]) {
      case 107:
      case 63232:
      case 56:
        if (theEvent.controlKey) {
          offset = length;
        } else if (theEvent.shiftKey) {
          offset = offset + 1 << 16 >> 16;
        } else {
          offset = offset + (MESSAGE_ARCHIVE_VIEW_LINES / 3 | 0) << 16 >> 16;
        }
        break;
      case 106:
      case 63233:
      case 50:
        if (theEvent.controlKey) {
          offset = height;
        } else if (theEvent.shiftKey) {
          offset = offset - 1 << 16 >> 16;
        } else {
          offset = offset - (MESSAGE_ARCHIVE_VIEW_LINES / 3 | 0) << 16 >> 16;
        }
        break;
      case 32:
      case 27:
        exit = true_;
        break;
      default:
        await flashTemporaryAlert(S(" -- Press space or click to continue -- "), 500);
      }
    }
    if (theEvent.eventType >>> 0 === MOUSE_UP) {
      exit = true_;
    }
    offset = (height > (length > offset ? offset : length) ? height : length > offset ? offset : length) << 16 >> 16;
  } while (!exit);
  restoreDisplayBuffer(rbuf);
  return offset;
}

export async function displayMessageArchive(): Promise<void> {
  const length = new Int16Array(1);
  let offset = 0;
  let height = 0;
  let messageBuffer = $arr(340, () => new Int8Array(200));
  formatRecentMessages(P(messageBuffer), MESSAGE_ARCHIVE_LINES, P(length, 0), null);
  if (MESSAGE_LINES >= length[0]) {
    return;
  }
  height = (31 + 3 > length[0] ? length[0] : 31 + 3) << 16 >> 16;
  offset = height;
  await animateMessageArchive(true_, P(messageBuffer), length[0], offset, height);
  offset = await scrollMessageArchive(P(messageBuffer), length[0], offset, height);
  await animateMessageArchive(false_, P(messageBuffer), length[0], offset, height);
  await updateFlavorText();
  confirmMessages();
  updateMessageDisplay();
}

export async function temporaryMessage(msg: Ptr | null, flags: number): Promise<void> {
  let message = new Int8Array(100);
  let i = 0;
  let j = 0;
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  strcpy(P(message), msg);
  for (i = 0; message[i] === COLOR_ESCAPE; i = i + 4 << 16 >> 16) {
    upperCase(P(message, i));
  }
  if ((flags & REFRESH_SIDEBAR) >>> 0) {
    await refreshSideBar(-1, -1, false_);
  }
  for (i = 0; MESSAGE_LINES > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DCOLS > j; j = j + 1 << 16 >> 16) {
      plotCharWithColor(32, struct_windowpos.$of(j + 20 + 1 << 16 >> 16, i), G.black, G.black);
    }
  }
  printString(P(message), 0 + 20 + 1, -1 + 3, G.white, G.black, null);
  if ((flags & REQUIRE_ACKNOWLEDGMENT) >>> 0) {
    await waitForAcknowledgment();
    updateMessageDisplay();
  }
  G.rogue.RNG = oldRNG;
  ;
}

export async function messageWithColor(msg: Ptr | null, theColor: struct_color | null, flags: number): Promise<void> {
  let buf = $cs("", 200);
  let i = 0;
  i = 0;
  i = encodeMessageColor(P(buf), i, theColor);
  strcpy(P(buf, i), msg);
  await message(P(buf), flags);
}

export function flavorMessage(msg: Ptr | null): void {
  let i = 0;
  let text = new Int8Array(2000);
  for (i = 0; COLS * 2 > i && msg.a[msg.o + i] !== 0; i = i + 1 << 16 >> 16) {
    text[i] = msg.a[msg.o + i];
  }
  text[i] = 0;
  for (i = 0; text[i] === COLOR_ESCAPE; i = i + 4 << 16 >> 16) {
    ;
  }
  upperCase(P(text, i));
  printString(P(text), 0 + 20 + 1, ROWS - 2, G.flavorTextColor, G.black, null);
  for (i = strLenWithoutEscapes(P(text)); DCOLS > i; i = i + 1 << 16 >> 16) {
    plotCharWithColor(32, struct_windowpos.$of(i + 20 + 1 << 16 >> 16, ROWS - 2), G.black, G.black);
  }
}

export async function message(msg: Ptr | null, flags: number): Promise<void> {
  let i = 0;
  let archiveEntry = null;
  let newMessage = 0;
  if (!msg || !msg.a[msg.o]) {
    return;
  }
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  G.rogue.disturbed = true_;
  if ((flags & REQUIRE_ACKNOWLEDGMENT) >>> 0 || (flags & REFRESH_SIDEBAR) >>> 0) {
    await refreshSideBar(-1, -1, false_);
  }
  await displayCombatText();
  newMessage = true_;
  for (i = 1; MESSAGE_ARCHIVE_ENTRIES > i; i = i + 1 << 16 >> 16) {
    archiveEntry = getArchivedMessage(i);
    if (!(i === 1 && !((flags & FOLDABLE) >>> 0) || archiveEntry.turn === G.rogue.playerTurnNumber)) {
      break;
    }
    if (strcmp(P(archiveEntry.message), msg) === 0) {
      newMessage = false_;
      archiveEntry.turn = G.rogue.playerTurnNumber;
      if (MAX_MESSAGE_REPEATS > archiveEntry.count) {
        archiveEntry.count = archiveEntry.count + 1 & 0xff;
      }
      break;
    }
  }
  if (newMessage) {
    archiveEntry = $sat(G.messageArchive, G.messageArchivePosition);
    strcpy(P(archiveEntry.message), msg);
    archiveEntry.count = 1;
    archiveEntry.turn = G.rogue.playerTurnNumber;
    archiveEntry.flags = flags;
    G.messageArchivePosition = (G.messageArchivePosition + 1) % MESSAGE_ARCHIVE_ENTRIES << 16 >> 16;
  }
  displayRecentMessages();
  if ((flags & REQUIRE_ACKNOWLEDGMENT) >>> 0 || G.rogue.cautiousMode) {
    await displayMoreSign();
    confirmMessages();
    G.rogue.cautiousMode = false_;
  }
  if (G.rogue.playbackMode) {
    G.rogue.playbackDelayThisTurn = G.rogue.playbackDelayThisTurn + (G.rogue.playbackDelayPerTurn * 5 > 2000 ? 2000 : G.rogue.playbackDelayPerTurn * 5) << 16 >> 16;
  }
  G.rogue.RNG = oldRNG;
  ;
}

export function displayMoreSignWithoutWaitingForAcknowledgment(): void {
  if (strLenWithoutEscapes(P(G.displayedMessage[0])) < DCOLS - 8 || G.messagesUnconfirmed > 0) {
    printString(S("--MORE--"), COLS - 8, MESSAGE_LINES - 1, G.black, G.white, null);
  } else {
    printString(S("--MORE--"), COLS - 8, MESSAGE_LINES, G.black, G.white, null);
  }
}

export async function displayMoreSign(): Promise<void> {
  let i = 0;
  if (G.rogue.autoPlayingLevel) {
    return;
  }
  if (strLenWithoutEscapes(P(G.displayedMessage[0])) < DCOLS - 8 || G.messagesUnconfirmed > 0) {
    printString(S("--MORE--"), COLS - 8, MESSAGE_LINES - 1, G.black, G.white, null);
    await waitForAcknowledgment();
    printString(S("        "), COLS - 8, MESSAGE_LINES - 1, G.black, G.black, null);
  } else {
    printString(S("--MORE--"), COLS - 8, MESSAGE_LINES, G.black, G.white, null);
    await waitForAcknowledgment();
    for (i = 1; 8 >= i; i = i + 1 << 16 >> 16) {
      await refreshDungeonCell(struct_pos.$of(DCOLS - i << 16 >> 16));
    }
  }
}

export function encodeMessageColor(msg: Ptr | null, i: number, theColor: struct_color | null): number {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let needTerminator = false_;
  let col = theColor.$clone();
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  bakeColor(col);
  col.red = ((col.red > 0 ? col.red : 0) > 100 ? 100 : col.red > 0 ? col.red : 0) << 16 >> 16;
  col.green = ((col.green > 0 ? col.green : 0) > 100 ? 100 : col.green > 0 ? col.green : 0) << 16 >> 16;
  col.blue = ((col.blue > 0 ? col.blue : 0) > 100 ? 100 : col.blue > 0 ? col.blue : 0) << 16 >> 16;
  needTerminator = (!msg.a[msg.o + i] || !msg.a[msg.o + (i + 1)] || !msg.a[msg.o + (i + 2)] || !msg.a[msg.o + (i + 3)] ? 1 : 0) << 24 >> 24;
  msg.a[msg.o + ($t1 = i, i = $t1 + 1 << 16 >> 16, $t1)] = COLOR_ESCAPE;
  msg.a[msg.o + ($t2 = i, i = $t2 + 1 << 16 >> 16, $t2)] = COLOR_VALUE_INTERCEPT + col.red << 24 >> 24;
  msg.a[msg.o + ($t3 = i, i = $t3 + 1 << 16 >> 16, $t3)] = COLOR_VALUE_INTERCEPT + col.green << 24 >> 24;
  msg.a[msg.o + ($t4 = i, i = $t4 + 1 << 16 >> 16, $t4)] = COLOR_VALUE_INTERCEPT + col.blue << 24 >> 24;
  if (needTerminator) {
    msg.a[msg.o + i] = 0;
  }
  G.rogue.RNG = oldRNG;
  ;
  return i;
}

export function decodeMessageColor(msg: Ptr | null, i: number, returnColor: struct_color | null): number {
  let $t1: any, $t2: any, $t3: any;
  if (msg.a[msg.o + i] !== COLOR_ESCAPE) {
    printf(S("\nAsked to decode a color escape that didn't exist!"));
    returnColor.$cp(G.white);
  } else {
    i = i + 1 << 16 >> 16;
    returnColor.$cp(G.black);
    returnColor.red = msg.a[msg.o + ($t1 = i, i = $t1 + 1 << 16 >> 16, $t1)] - COLOR_VALUE_INTERCEPT << 16 >> 16;
    returnColor.green = msg.a[msg.o + ($t2 = i, i = $t2 + 1 << 16 >> 16, $t2)] - COLOR_VALUE_INTERCEPT << 16 >> 16;
    returnColor.blue = msg.a[msg.o + ($t3 = i, i = $t3 + 1 << 16 >> 16, $t3)] - COLOR_VALUE_INTERCEPT << 16 >> 16;
    returnColor.red = ((returnColor.red > 0 ? returnColor.red : 0) > 100 ? 100 : returnColor.red > 0 ? returnColor.red : 0) << 16 >> 16;
    returnColor.green = ((returnColor.green > 0 ? returnColor.green : 0) > 100 ? 100 : returnColor.green > 0 ? returnColor.green : 0) << 16 >> 16;
    returnColor.blue = ((returnColor.blue > 0 ? returnColor.blue : 0) > 100 ? 100 : returnColor.blue > 0 ? returnColor.blue : 0) << 16 >> 16;
  }
  return i;
}

export function messageColorFromVictim(monst: struct_creature | null): struct_color | null {
  if (monst === G.player) {
    return G.badMessageColor;
  } else if (G.player.status[STATUS_HALLUCINATING] && !G.rogue.playbackOmniscience) {
    return G.white;
  } else if (monst.creatureState >>> 0 === MONSTER_ALLY) {
    return G.badMessageColor;
  } else if (monstersAreEnemies(G.player, monst)) {
    return G.goodMessageColor;
  } else {
    return G.white;
  }
}

export function updateMessageDisplay(): void {
  let i = 0;
  let j = 0;
  let m = 0;
  let messageColor = new struct_color();
  for (i = 0; MESSAGE_LINES > i; i = i + 1 << 16 >> 16) {
    messageColor.$cp(G.white);
    if (i >= G.messagesUnconfirmed) {
      applyColorAverage(messageColor, G.black, 50);
      applyColorAverage(messageColor, G.black, (75 * i / MESSAGE_LINES | 0) << 16 >> 16);
    }
    for (j = m = 0; G.displayedMessage[i][m] && DCOLS > j; j = j + 1 << 16 >> 16, m = m + 1 << 16 >> 16) {
      while (G.displayedMessage[i][m] === COLOR_ESCAPE) {
        m = decodeMessageColor(P(G.displayedMessage[i]), m, messageColor);
        if (i >= G.messagesUnconfirmed) {
          applyColorAverage(messageColor, G.black, 50);
          applyColorAverage(messageColor, G.black, (75 * i / MESSAGE_LINES | 0) << 16 >> 16);
        }
      }
      plotCharWithColor(G.displayedMessage[i][m], struct_windowpos.$of(j + 20 + 1 << 16 >> 16, MESSAGE_LINES - i - 1 << 16 >> 16), messageColor, G.black);
    }
    for (; DCOLS > j; j = j + 1 << 16 >> 16) {
      plotCharWithColor(32, struct_windowpos.$of(j + 20 + 1 << 16 >> 16, MESSAGE_LINES - i - 1 << 16 >> 16), G.black, G.black);
    }
  }
}

export function deleteMessages(): void {
  let i = 0;
  for (i = 0; MESSAGE_LINES > i; i = i + 1 << 16 >> 16) {
    G.displayedMessage[i][0] = 0;
  }
  confirmMessages();
}

export function confirmMessages(): void {
  G.messagesUnconfirmed = 0;
  updateMessageDisplay();
}

export function stripShiftFromMovementKeystroke(keystroke: Ptr | null): void {
  let newKey = keystroke.a[keystroke.o] - (65 - 97) & 0xffff;
  if (newKey === LEFT_KEY || newKey === RIGHT_KEY || newKey === DOWN_KEY || newKey === UP_KEY || newKey === UPLEFT_KEY || newKey === UPRIGHT_KEY || newKey === DOWNLEFT_KEY || newKey === DOWNRIGHT_KEY) {
    keystroke.a[keystroke.o] -= 65 - 97;
  }
}

export function upperCase(theChar: Ptr | null): void {
  if (theChar.a[theChar.o] >= 97 && 122 >= theChar.a[theChar.o]) {
    theChar.a[theChar.o] = theChar.a[theChar.o] + (65 - 97) << 24 >> 24;
  }
}

export async function refreshSideBar(focusX: number, focusY: number, focusedEntityMustGoFirst: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any;
  let $g = 0;
  let printY = 0;
  let oldPrintY = 0;
  let shortestDistance = 0;
  let i = 0;
  let j = 0;
  let k = 0;
  let px = 0;
  let py = 0;
  let x = 0;
  let y = 0;
  let displayEntityCount = 0;
  let indirectVision = 0;
  let closestMonst = null;
  let theItem = null;
  let closestItem = null;
  let buf = new Int8Array(100);
  let entityList = new Array(34).fill(null);
  let focusEntity = null;
  let entityType = new Int32Array(34);
  let focusEntityType = 0;
  let terrainLocationMap = $sarr(struct_pos, 34);
  let gotFocusedEntityOnScreen = 0;
  let addedEntity = $arr(79, () => new Int8Array(29));
  let oldRNG = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      x = 0;
      y = 0;
      closestMonst = null;
      closestItem = null;
      buf = new Int8Array(100);
      entityList = [null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null];
      focusEntity = null;
      entityType = new Int32Array(34);
      focusEntityType = EDT_NOTHING;
      terrainLocationMap = $sarr(struct_pos, 34);
      gotFocusedEntityOnScreen = (focusX >= 0 ? false_ : true_) << 24 >> 24;
      addedEntity = $arr(79, () => new Int8Array(29));
      if (G.rogue.gameHasEnded || G.rogue.playbackFastForward) {
        return;
      }
      oldRNG = G.rogue.RNG;
      G.rogue.RNG = RNG_COSMETIC;
      if (0 > focusX) {
        focusedEntityMustGoFirst = false_;
      } else {
        if (($at2(G.pmap, focusX, focusY).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0) {
          let monst = monsterAtLoc(struct_pos.$of(focusX, focusY));
          if (canSeeMonster(monst) || G.rogue.playbackOmniscience) {
            focusEntity = monst;
            focusEntityType = EDT_CREATURE;
          }
        }
        if (!focusEntity && ($at2(G.pmap, focusX, focusY).flags & HAS_ITEM) >>> 0) {
          theItem = await itemAtLoc(struct_pos.$of(focusX, focusY));
          if (($at2(G.pmap, focusX, focusY).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, focusX, focusY).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, focusX, focusY).flags & DISCOVERED) >>> 0)) {
            focusEntity = theItem;
            focusEntityType = EDT_ITEM;
          }
        }
        if (!focusEntity && cellHasTMFlag(struct_pos.$of(focusX, focusY), TM_LIST_IN_SIDEBAR) && (($at2(G.pmap, focusX, focusY).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, focusX, focusY).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, focusX, focusY).flags & DISCOVERED) >>> 0))) {
          focusEntity = P(G.tileCatalog[$at2(G.pmap, focusX, focusY).layers[layerWithTMFlag(focusX, focusY, TM_LIST_IN_SIDEBAR)]].description);
          focusEntityType = EDT_TERRAIN;
        }
      }
      printY = 0;
      px = G.player.loc.x;
      py = G.player.loc.y;
      zeroOutGrid(P(addedEntity));
      if (G.rogue.playbackMode) {
        printString(S("   -- PLAYBACK --   "), 0, ($t1 = printY, printY = $t1 + 1 << 16 >> 16, $t1), G.white, G.black, null);
        if (G.rogue.howManyTurns > 0) {
          sprintf(P(buf), S("Turn %li/%li"), G.rogue.playerTurnNumber, G.rogue.howManyTurns);
          printProgressBar(0, ($t2 = printY, printY = $t2 + 1 << 16 >> 16, $t2), P(buf), G.rogue.playerTurnNumber, G.rogue.howManyTurns, G.darkPurple, false_);
        }
        if (G.rogue.playbackOOS) {
          printString(S("    [OUT OF SYNC]   "), 0, ($t3 = printY, printY = $t3 + 1 << 16 >> 16, $t3), G.badMessageColor, G.black, null);
        } else if (G.rogue.playbackPaused) {
          printString(S("      [PAUSED]      "), 0, ($t4 = printY, printY = $t4 + 1 << 16 >> 16, $t4), G.gray, G.black, null);
        }
        printString(S("                    "), 0, ($t5 = printY, printY = $t5 + 1 << 16 >> 16, $t5), G.white, G.black, null);
      }
      displayEntityCount = 0;
      for (i = 0; ROWS * 2 > i; i = i + 1 << 16 >> 16) {
        G.rogue.sidebarLocationList[i].$cp(struct_pos.$of(-1, -1));
      }
      entityList[displayEntityCount] = G.player;
      entityType[displayEntityCount] = EDT_CREATURE;
      displayEntityCount = displayEntityCount + 1 << 16 >> 16;
      addedEntity[G.player.loc.x][G.player.loc.y] = true_;
      theItem = await itemAtLoc(G.player.loc.$clone());
      if (theItem) {
        entityList[displayEntityCount] = theItem;
        entityType[displayEntityCount] = EDT_ITEM;
        displayEntityCount = displayEntityCount + 1 << 16 >> 16;
      }
      if (focusedEntityMustGoFirst && !addedEntity[focusX][focusY]) {
        addedEntity[focusX][focusY] = true_;
        entityList[displayEntityCount] = focusEntity;
        entityType[displayEntityCount] = focusEntityType;
        terrainLocationMap[displayEntityCount].$cp(struct_pos.$of(focusX, focusY));
        displayEntityCount = displayEntityCount + 1 << 16 >> 16;
      }
      indirectVision = 0;
    case 2:
      if (!(2 > indirectVision)) { $g = 4; continue $L; }
      do {
        shortestDistance = 10000;
        for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
          let monst = nextCreature(it);
          if ((canDirectlySeeMonster(monst) || indirectVision && (canSeeMonster(monst) || G.rogue.playbackOmniscience)) && !addedEntity[monst.loc.x][monst.loc.y] && !((monst.info.flags & MONST_NOT_LISTED_IN_SIDEBAR) >>> 0) && shortestDistance > Math.imul(px - monst.loc.x, px - monst.loc.x) + Math.imul(py - monst.loc.y, py - monst.loc.y)) {
            shortestDistance = Math.imul(px - monst.loc.x, px - monst.loc.x) + Math.imul(py - monst.loc.y, py - monst.loc.y) << 16 >> 16;
            closestMonst = monst;
          }
        }
        if (10000 > shortestDistance) {
          addedEntity[closestMonst.loc.x][closestMonst.loc.y] = true_;
          entityList[displayEntityCount] = closestMonst;
          entityType[displayEntityCount] = EDT_CREATURE;
          displayEntityCount = displayEntityCount + 1 << 16 >> 16;
        }
      } while (10000 > shortestDistance && ROWS > displayEntityCount * 2);
      do {
        shortestDistance = 10000;
        for (theItem = G.floorItems.nextItem; !!theItem; theItem = theItem.nextItem) {
          if ((($at2(G.pmap, theItem.loc.x, theItem.loc.y).flags & VISIBLE) >>> 0 || indirectVision && (($at2(G.pmap, theItem.loc.x, theItem.loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, theItem.loc.x, theItem.loc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, theItem.loc.x, theItem.loc.y).flags & DISCOVERED) >>> 0) || G.rogue.playbackOmniscience)) && !addedEntity[theItem.loc.x][theItem.loc.y] && shortestDistance > Math.imul(px - theItem.loc.x, px - theItem.loc.x) + Math.imul(py - theItem.loc.y, py - theItem.loc.y)) {
            shortestDistance = Math.imul(px - theItem.loc.x, px - theItem.loc.x) + Math.imul(py - theItem.loc.y, py - theItem.loc.y) << 16 >> 16;
            closestItem = theItem;
          }
        }
        if (10000 > shortestDistance) {
          addedEntity[closestItem.loc.x][closestItem.loc.y] = true_;
          entityList[displayEntityCount] = closestItem;
          entityType[displayEntityCount] = EDT_ITEM;
          displayEntityCount = displayEntityCount + 1 << 16 >> 16;
        }
      } while (10000 > shortestDistance && ROWS > displayEntityCount * 2);
      for (k = 0; (31 + 3 - 3 - 2 > 100 - 20 - 1 ? 31 + 3 - 3 - 2 : 100 - 20 - 1) > k; k = k + 1 << 16 >> 16) {
        for (i = px - k << 16 >> 16; px + k >= i; i = i + 1 << 16 >> 16) {
          let step = (i === px - k || i === px + k ? 1 : 2 * k) << 16 >> 16;
          for (j = py - k << 16 >> 16; py + k >= j; j = j + step << 16 >> 16) {
            if (displayEntityCount >= ROWS - 1) {
              { $g = 1; continue $L; }
            }
            if (coordinatesAreInMap(i, j) && !addedEntity[i][j] && cellHasTMFlag(struct_pos.$of(i, j), TM_LIST_IN_SIDEBAR) && (($at2(G.pmap, i, j).flags & VISIBLE) >>> 0 || indirectVision && (($at2(G.pmap, i, j).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, i, j).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, i, j).flags & DISCOVERED) >>> 0) || G.rogue.playbackOmniscience))) {
              addedEntity[i][j] = true_;
              entityList[displayEntityCount] = P(G.tileCatalog[$at2(G.pmap, i, j).layers[layerWithTMFlag(i, j, TM_LIST_IN_SIDEBAR)]].description);
              entityType[displayEntityCount] = EDT_TERRAIN;
              terrainLocationMap[displayEntityCount].$cp(struct_pos.$of(i, j));
              displayEntityCount = displayEntityCount + 1 << 16 >> 16;
            }
          }
        }
      }
    case 1: // no_space_for_more_entities
      ;
    case 3:
      indirectVision = indirectVision + 1 << 16 >> 16;
      { $g = 2; continue $L; }
    case 4:
      for (i = 0; displayEntityCount > i && ROWS - 1 > printY; i = i + 1 << 16 >> 16) {
        oldPrintY = printY;
        if (entityType[i] >>> 0 === EDT_CREATURE) {
          x = entityList[i].loc.x;
          y = entityList[i].loc.y;
          printY = await printMonsterInfo(entityList[i], printY, (focusEntity && (x !== focusX || y !== focusY) ? 1 : 0) << 24 >> 24, (x === focusX && y === focusY ? 1 : 0) << 24 >> 24);
        } else if (entityType[i] >>> 0 === EDT_ITEM) {
          x = entityList[i].loc.x;
          y = entityList[i].loc.y;
          printY = await printItemInfo(entityList[i], printY, (focusEntity && (x !== focusX || y !== focusY) ? 1 : 0) << 24 >> 24, (x === focusX && y === focusY ? 1 : 0) << 24 >> 24);
        } else if (entityType[i] >>> 0 === EDT_TERRAIN) {
          x = terrainLocationMap[i].x;
          y = terrainLocationMap[i].y;
          printY = await printTerrainInfo(x, y, printY, entityList[i], (focusEntity && (x !== focusX || y !== focusY) ? 1 : 0) << 24 >> 24, (x === focusX && y === focusY ? 1 : 0) << 24 >> 24);
        }
        if (focusEntity && (x === focusX && y === focusY) && ROWS > printY) {
          gotFocusedEntityOnScreen = true_;
        }
        for (j = oldPrintY; printY > j; j = j + 1 << 16 >> 16) {
          G.rogue.sidebarLocationList[j].$cp(struct_pos.$of(x, y));
        }
      }
      if (gotFocusedEntityOnScreen) {
        for (i = printY; ROWS - 1 > i; i = i + 1 << 16 >> 16) {
          printString(S("                    "), 0, i, G.white, G.black, null);
        }
        sprintf(P(buf), S("  -- Depth: %i --%s   "), G.rogue.depthLevel, 10 > G.rogue.depthLevel ? S(" ") : S(""));
        printString(P(buf), 0, ROWS - 1, G.white, G.black, null);
      } else if (!focusedEntityMustGoFirst) {
        await refreshSideBar(focusX, focusY, true_);
      }
      G.rogue.RNG = oldRNG;
      ;
    }
    break;
  }
}

export function printString(theString: Ptr | null, x: number, y: number, foreColor: struct_color | null, backColor: struct_color | null, dbuf: struct_screenDisplayBuffer | null): void {
  let i = 0;
  let fColor = foreColor.$clone();
  for (i = 0; theString.a[theString.o + i] !== 0 && COLS > x; i = i + 1 << 16 >> 16, x = x + 1 << 16 >> 16) {
    while (theString.a[theString.o + i] === COLOR_ESCAPE) {
      i = decodeMessageColor(theString, i, fColor);
      if (!theString.a[theString.o + i]) {
        return;
      }
    }
    plotCharToBuffer(theString.a[theString.o + i], struct_windowpos.$of(x, y), fColor, backColor, dbuf);
  }
}

function breakUpLongWordsIn(sourceText: Ptr | null, width: number, useHyphens: number): void {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any, $t12: any, $t13: any, $t14: any;
  let buf = $cs("", 6800);
  let i = 0;
  let m = 0;
  let nextChar = 0;
  let wordWidth = 0;
  wordWidth = 0;
  for (i = 0, m = 0; sourceText.a[sourceText.o + i] !== 0; ) {
    if (sourceText.a[sourceText.o + i] === COLOR_ESCAPE) {
      strncpy(P(buf, m), sourceText.add(i), 4);
      i = i + 4 << 16 >> 16;
      m = m + 4 << 16 >> 16;
    } else if (sourceText.a[sourceText.o + i] === 32 || sourceText.a[sourceText.o + i] === 10) {
      wordWidth = 0;
      ($t4 = sourceText.a[sourceText.o + ($t3 = i, i = $t3 + 1 << 16 >> 16, $t3)], buf[($t2 = m, m = $t2 + 1 << 16 >> 16, $t2)] = $t4);
    } else {
      if (!useHyphens && wordWidth >= width) {
        buf[($t6 = m, m = $t6 + 1 << 16 >> 16, $t6)] = 10;
        wordWidth = 0;
      } else if (useHyphens && wordWidth >= width - 1) {
        nextChar = i + 1 << 16 >> 16;
        while (sourceText.a[sourceText.o + nextChar] === COLOR_ESCAPE) {
          nextChar = nextChar + 4 << 16 >> 16;
        }
        if (sourceText.a[sourceText.o + nextChar] && sourceText.a[sourceText.o + nextChar] !== 32 && sourceText.a[sourceText.o + nextChar] !== 10) {
          buf[($t8 = m, m = $t8 + 1 << 16 >> 16, $t8)] = 45;
          buf[($t10 = m, m = $t10 + 1 << 16 >> 16, $t10)] = 10;
          wordWidth = 0;
        }
      }
      ($t14 = sourceText.a[sourceText.o + ($t13 = i, i = $t13 + 1 << 16 >> 16, $t13)], buf[($t12 = m, m = $t12 + 1 << 16 >> 16, $t12)] = $t14);
      wordWidth = wordWidth + 1 << 16 >> 16;
    }
  }
  buf[m] = 0;
  strcpy(sourceText, P(buf));
}

export function wrapText(to: Ptr | null, sourceText: Ptr | null, width: number): number {
  let i = 0;
  let w = 0;
  let textLength = 0;
  let lineCount = 0;
  let printString = new Int8Array(6800);
  let spaceLeftOnLine = 0;
  let wordWidth = 0;
  strcpy(P(printString), sourceText);
  breakUpLongWordsIn(P(printString), width, true_);
  textLength = strlen(P(printString)) << 16 >> 16;
  lineCount = 1;
  for (i = 0; printString[i] === COLOR_ESCAPE; i = i + 4 << 16 >> 16) {
    ;
  }
  spaceLeftOnLine = width;
  while (textLength > i) {
    wordWidth = 0;
    for (w = i + 1 << 16 >> 16; textLength > w && printString[w] !== 32 && printString[w] !== 10; ) {
      if (printString[w] === COLOR_ESCAPE) {
        w = w + 4 << 16 >> 16;
      } else {
        w = w + 1 << 16 >> 16;
        wordWidth = wordWidth + 1 << 16 >> 16;
      }
    }
    if (1 + wordWidth > spaceLeftOnLine || printString[i] === 10) {
      printString[i] = 10;
      lineCount = lineCount + 1 << 16 >> 16;
      spaceLeftOnLine = width - wordWidth << 16 >> 16;
    } else {
      spaceLeftOnLine = spaceLeftOnLine - (1 + wordWidth) << 16 >> 16;
    }
    i = w;
  }
  if (to) {
    strcpy(to, P(printString));
  }
  return lineCount;
}

export function printStringWithWrapping(theString: Ptr | null, x: number, y: number, width: number, foreColor: struct_color | null, backColor: struct_color | null, dbuf: struct_screenDisplayBuffer | null): number {
  let fColor = new struct_color();
  let printString = new Int8Array(6800);
  let i = 0;
  let px = 0;
  let py = 0;
  wrapText(P(printString), theString, width);
  px = x;
  py = y;
  fColor.$cp(foreColor);
  for (i = 0; printString[i] !== 0; i = i + 1 << 16 >> 16) {
    if (printString[i] === 10) {
      px = x;
      if (ROWS - 1 > py) {
        py = py + 1 << 16 >> 16;
      } else {
        break;
      }
      continue;
    } else if (printString[i] === COLOR_ESCAPE) {
      i = decodeMessageColor(P(printString), i, fColor) - 1 << 16 >> 16;
      continue;
    }
    if (locIsInWindow(struct_windowpos.$of(px, py))) {
      plotCharToBuffer(printString[i], struct_windowpos.$of(px, py), fColor, backColor, dbuf);
    }
    px = px + 1 << 16 >> 16;
  }
  return py;
}

export async function nextKeyPress(textInput: number): Promise<number> {
  let theEvent = new struct_rogueEvent();
  do {
    await nextBrogueEvent(theEvent, textInput, false_, false_);
  } while (theEvent.eventType >>> 0 !== KEYSTROKE);
  return theEvent.param1 << 24 >> 24;
}

export async function printHelpScreen(): Promise<void> {
  let i = 0;
  let j = 0;
  let helpText = $rows([$cs("", 237),
$cs("", 237),
$cs("          -- Commands --", 237),
$cs("", 237),
$cs("          mouse  ****move cursor (including to examine monsters and terrain)", 237),
$cs("          click  ****travel", 237),
$cs("  control-click  ****advance one space", 237),
$cs("       <return>  ****enable keyboard cursor control", 237),
$cs("    <space/esc>  ****disable keyboard cursor control", 237),
$cs("hjklyubn, arrow keys, or numpad  ****move or attack (control or shift to run)", 237),
$cs("", 237),
$cs("a/e/r/t/d/c/R/w  ****apply/equip/remove/throw/drop/call/relabel/swap an item", 237),
$cs("              T  ****re-throw last item at last monster", 237),
$cs(" i, right-click  ****view inventory", 237),
$cs("              D  ****list discovered items", 237),
$cs("", 237),
$cs("              z  ****rest once", 237),
$cs("              Z  ****rest for 100 turns or until something happens", 237),
$cs("              s  ****search for secrets (control-s: long search)", 237),
$cs("           <, >  ****travel to stairs", 237),
$cs("              x  ****auto-explore (control-x: fast forward)", 237),
$cs("              A  ****autopilot (control-A: fast forward)", 237),
$cs("              M  ****display old messages", 237),
$cs("              G  ****toggle graphical tiles (when available)", 237),
$cs("", 237),
$cs("              S  ****save and exit", 237),
$cs("              Q  ****quit and abandon game", 237),
$cs("", 237),
$cs("              \\  ****disable/enable color effects", 237),
$cs("              ]  ****display/hide stealth range", 237),
$cs("    <space/esc>  ****clear message or cancel command", 237),
$cs("", 237),
$cs("        -- press space or click to continue --", 237)]);
  for (i = 0; BROGUE_HELP_LINE_COUNT > i; i = i + 1 << 16 >> 16) {
    for (j = 0; helpText[i][j]; j = j + 1 << 16 >> 16) {
      if (helpText[i][j] === 42) {
        j = encodeMessageColor(P(helpText[i]), j, G.white);
      }
    }
  }
  let rbuf = saveDisplayBuffer().$clone();
  let dbuf = new struct_screenDisplayBuffer();
  clearDisplayBuffer(dbuf);
  for (i = 0; BROGUE_HELP_LINE_COUNT > i && ROWS > i; i = i + 1 << 16 >> 16) {
    printString(P(helpText[i]), 1 + 20 + 1, i, G.itemMessageColor, G.black, dbuf);
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
      $at2(dbuf.cells, i + 20 + 1, j).opacity = INTERFACE_OPACITY;
    }
  }
  overlayDisplayBuffer(dbuf);
  await waitForAcknowledgment();
  restoreDisplayBuffer(rbuf);
  await updateFlavorText();
  updateMessageDisplay();
}

function printDiscoveries(category: number, count: number, itemCharacter: number, x: number, y: number, dbuf: struct_screenDisplayBuffer | null): void {
  let goodColor = new struct_color();
  let badColor = new struct_color();
  let theColor = null;
  let buf = new Int8Array(100);
  let buf2 = new Int8Array(100);
  let i = 0;
  let magic = 0;
  let totalFrequency = 0;
  let theTable = tableForItemCategory(category);
  goodColor.$cp(G.goodMessageColor);
  applyColorAverage(goodColor, G.black, 50);
  badColor.$cp(G.badMessageColor);
  applyColorAverage(badColor, G.black, 50);
  totalFrequency = 0;
  for (i = 0; count > i; i = i + 1 << 16 >> 16) {
    if (!$sadd(theTable, i).identified) {
      totalFrequency = totalFrequency + $sadd(theTable, i).frequency << 16 >> 16;
    }
  }
  for (i = 0; count > i; i = i + 1 << 16 >> 16) {
    if ($sadd(theTable, i).identified) {
      theColor = G.white;
      plotCharToBuffer(itemCharacter, struct_windowpos.$of(x, y + i << 16 >> 16), G.itemColor, G.black, dbuf);
    } else {
      theColor = G.darkGray;
      magic = magicCharDiscoverySuffix(category, i);
      if (magic === 1) {
        plotCharToBuffer(G_GOOD_MAGIC, struct_windowpos.$of(x, y + i << 16 >> 16), goodColor, G.black, dbuf);
      } else if (magic === -1) {
        plotCharToBuffer(G_BAD_MAGIC, struct_windowpos.$of(x, y + i << 16 >> 16), badColor, G.black, dbuf);
      }
    }
    strcpy(P(buf), $sadd(theTable, i).name);
    if (!$sadd(theTable, i).identified && $sadd(theTable, i).frequency > 0 && totalFrequency > 0) {
      sprintf(P(buf2), S(" (%i%%)"), $sadd(theTable, i).frequency * 100 / totalFrequency | 0);
      strcat(P(buf), P(buf2));
    }
    upperCase(P(buf));
    strcat(P(buf), S(" "));
    printString(P(buf), x + 2 << 16 >> 16, y + i << 16 >> 16, theColor, G.black, dbuf);
  }
}

export async function displayFeatsScreen(): Promise<void> {
  let availableColorEscape = $cs("", 5);
  let achievedColorEscape = $cs("", 5);
  let failedColorEscape = $cs("", 5);
  encodeMessageColor(P(availableColorEscape), 0, G.white);
  encodeMessageColor(P(achievedColorEscape), 0, G.advancementMessageColor);
  encodeMessageColor(P(failedColorEscape), 0, G.badMessageColor);
  let dbuf = new struct_screenDisplayBuffer();
  clearDisplayBuffer(dbuf);
  let buf = $cs("-- FEATS --", 200);
  let y = 1;
  printString(P(buf), ((100 - 20 - 1 - 15 - strLenWithoutEscapes(P(buf))) / 2 | 0) + 20 + 1 << 16 >> 16, y, G.flavorTextColor, G.black, dbuf);
  let featColorEscape = $cs("", 5);
  let featStatusChar = new Int8Array(2);
  for (let i = 0; G.gameConst.numberFeats > i; ++i) {
    if (G.rogue.featRecord.a[G.rogue.featRecord.o + i] === $sadd(G.featTable, i).initialValue) {
      strcpy(P(featColorEscape), P(availableColorEscape));
      strcpy(P(featStatusChar), S(" "));
    } else if (G.rogue.featRecord.a[G.rogue.featRecord.o + i]) {
      strcpy(P(featColorEscape), P(achievedColorEscape));
      strcpy(P(featStatusChar), S("+"));
    } else {
      strcpy(P(featColorEscape), P(failedColorEscape));
      strcpy(P(featStatusChar), S("-"));
    }
    sprintf(P(buf), S("%*s %s%s %s"), FEAT_NAME_LENGTH, P($sadd(G.featTable, i).name), P(featColorEscape), P(featStatusChar), P($sadd(G.featTable, i).description));
    printString(P(buf), 0 + 20 + 1, y + i + 1 << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  }
  strcpy(P(buf), S("-- LEGEND --"));
  printString(P(buf), ((100 - 20 - 1 - 15 - strLenWithoutEscapes(P(buf))) / 2 | 0) + 20 + 1 << 16 >> 16, ROWS - 5, G.gray, G.black, dbuf);
  sprintf(P(buf), S("%sFailed(-)  %sAchieved(+)  "), P(failedColorEscape), P(achievedColorEscape));
  printString(P(buf), ((100 - 20 - 1 - 15 - strLenWithoutEscapes(P(buf))) / 2 | 0) + 20 + 1 << 16 >> 16, ROWS - 4, G.white, G.black, dbuf);
  strcpy(P(buf), KEYBOARD_LABELS ? S("-- press any key to continue --") : S("-- touch anywhere to continue --"));
  printString(P(buf), ((100 - 20 - 1 - 15 - strLenWithoutEscapes(P(buf))) / 2 | 0) + 20 + 1 << 16 >> 16, ROWS - 2, G.itemMessageColor, G.black, dbuf);
  for (let i = 0; COLS > i; ++i) {
    for (let j = 0; ROWS > j; ++j) {
      $at2(dbuf.cells, i, j).opacity = (STAT_BAR_WIDTH > i ? 0 : INTERFACE_OPACITY) << 24 >> 24;
    }
  }
  let rbuf = saveDisplayBuffer().$clone();
  overlayDisplayBuffer(dbuf);
  await waitForKeystrokeOrMouseClick();
  restoreDisplayBuffer(rbuf);
}

export async function printDiscoveriesScreen(): Promise<void> {
  let i = 0;
  let j = 0;
  let y = 0;
  let rbuf = saveDisplayBuffer().$clone();
  let dbuf = new struct_screenDisplayBuffer();
  clearDisplayBuffer(dbuf);
  printString(S("-- SCROLLS --"), 2 + 20 + 1, y = 1 + 3, G.flavorTextColor, G.black, dbuf);
  printDiscoveries(SCROLL, G.gameConst.numberScrollKinds << 16 >> 16, G_SCROLL, 3 + 20 + 1, y = y + 1 << 16 >> 16, dbuf);
  printString(S("-- RINGS --"), 2 + 20 + 1, y = y + (G.gameConst.numberScrollKinds + 1) << 16 >> 16, G.flavorTextColor, G.black, dbuf);
  printDiscoveries(RING, NUMBER_RING_KINDS, G_RING, 3 + 20 + 1, y = y + 1 << 16 >> 16, dbuf);
  printString(S("-- POTIONS --"), 29 + 20 + 1, y = 1 + 3, G.flavorTextColor, G.black, dbuf);
  printDiscoveries(POTION, G.gameConst.numberPotionKinds << 16 >> 16, G_POTION, 30 + 20 + 1, y = y + 1 << 16 >> 16, dbuf);
  printString(S("-- STAFFS --"), 53 + 20 + 1, y = 1 + 3, G.flavorTextColor, G.black, dbuf);
  printDiscoveries(STAFF, NUMBER_STAFF_KINDS, G_STAFF, 54 + 20 + 1, y = y + 1 << 16 >> 16, dbuf);
  printString(S("-- WANDS --"), 53 + 20 + 1, y = y + (NUMBER_STAFF_KINDS + 1) << 16 >> 16, G.flavorTextColor, G.black, dbuf);
  printDiscoveries(WAND, G.gameConst.numberWandKinds << 16 >> 16, G_WAND, 54 + 20 + 1, y = y + 1 << 16 >> 16, dbuf);
  printString(KEYBOARD_LABELS ? S("-- press any key to continue --") : S("-- touch anywhere to continue --"), 20 + 20 + 1, 31 + 3 - 3 - 2 - 2 + 3, G.itemMessageColor, G.black, dbuf);
  for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
      $at2(dbuf.cells, i, j).opacity = (STAT_BAR_WIDTH > i ? 0 : INTERFACE_OPACITY) << 24 >> 24;
    }
  }
  overlayDisplayBuffer(dbuf);
  await waitForKeystrokeOrMouseClick();
  restoreDisplayBuffer(rbuf);
}

export async function printHighScores(hiliteMostRecent: number): Promise<void> {
  let i = 0;
  let hiliteLineNum = 0;
  let maxLength = 0;
  let leftOffset = 0;
  let list = $sarrOf([struct_rogueHighScoresEntry.$of(0, new Int8Array(100), new Int8Array(79)),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry(),
new struct_rogueHighScoresEntry()]);
  let buf = new Int8Array(237);
  let scoreColor = new struct_color();
  hiliteLineNum = getHighScoresList(list[0]);
  if (!hiliteMostRecent) {
    hiliteLineNum = -1;
  }
  blackOutScreen();
  for (i = 0; HIGH_SCORES_COUNT > i && list[i].score > 0; i = i + 1 << 16 >> 16) {
    if (strLenWithoutEscapes(P(list[i].description)) > maxLength) {
      maxLength = strLenWithoutEscapes(P(list[i].description));
    }
  }
  leftOffset = ((100 / 5 | 0) > 100 - maxLength - 23 - 1 ? 100 - maxLength - 23 - 1 : 100 / 5 | 0) << 16 >> 16;
  scoreColor.$cp(G.black);
  applyColorAverage(scoreColor, G.itemMessageColor, 100);
  printString(S("-- HIGH SCORES --"), ((COLS - 17 + 1) / 2 | 0) << 16 >> 16, 0, scoreColor, G.black, null);
  for (i = 0; HIGH_SCORES_COUNT > i && list[i].score > 0; i = i + 1 << 16 >> 16) {
    scoreColor.$cp(G.black);
    if (i === hiliteLineNum) {
      applyColorAverage(scoreColor, G.itemMessageColor, 100);
    } else {
      applyColorAverage(scoreColor, G.white, 100);
      applyColorAverage(scoreColor, G.black, (i * 50 / 24 | 0) << 16 >> 16);
    }
    sprintf(P(buf), S("%s%i)"), 10 > i + 1 ? S(" ") : S(""), i + 1);
    printString(P(buf), leftOffset, i + 2 << 16 >> 16, scoreColor, G.black, null);
    sprintf(P(buf), S("%li"), list[i].score);
    printString(P(buf), leftOffset + 5 << 16 >> 16, i + 2 << 16 >> 16, scoreColor, G.black, null);
    printString(P(list[i].date), leftOffset + 12 << 16 >> 16, i + 2 << 16 >> 16, scoreColor, G.black, null);
    printString(P(list[i].description), leftOffset + 23 << 16 >> 16, i + 2 << 16 >> 16, scoreColor, G.black, null);
  }
  scoreColor.$cp(G.black);
  applyColorAverage(scoreColor, G.goodMessageColor, 100);
  printString(KEYBOARD_LABELS ? S("Press space to continue.") : S("Touch anywhere to continue."), ((COLS - strLenWithoutEscapes(KEYBOARD_LABELS ? S("Press space to continue.") : S("Touch anywhere to continue."))) / 2 | 0) << 16 >> 16, ROWS - 1, scoreColor, G.black, null);
  commitDraws();
  await waitForAcknowledgment();
}

export async function displayGrid(map: Ptr | null): Promise<void> {
  let i = 0;
  let j = 0;
  let score = 0;
  let topRange = 0;
  let bottomRange = 0;
  let tempColor = new struct_color();
  let foreColor = new struct_color();
  let backColor = new struct_color();
  const dchar = new Int32Array(1);
  topRange = -30000;
  bottomRange = 30000;
  tempColor.$cp(G.black);
  if ($peq(map, G.safetyMap) && !G.rogue.updatedSafetyMapThisTurn) {
    updateSafetyMap();
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (cellHasTerrainFlag(struct_pos.$of(i, j), T_WAYPOINT_BLOCKER) || $rd(map.a[map.o + i], j) === $rd(map.a[map.o]) || i === G.player.loc.x && j === G.player.loc.y) {
        continue;
      }
      if ($rd(map.a[map.o + i], j) > topRange) {
        topRange = $rd(map.a[map.o + i], j);
      }
      if (bottomRange > $rd(map.a[map.o + i], j)) {
        bottomRange = $rd(map.a[map.o + i], j);
      }
    }
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_PASSABILITY | T_LAVA_INSTA_DEATH) || $rd(map.a[map.o + i], j) === $rd(map.a[map.o]) || i === G.player.loc.x && j === G.player.loc.y) {
        continue;
      }
      score = 300 - (($rd(map.a[map.o + i], j) - bottomRange) * 300 / (1 > topRange - bottomRange ? 1 : topRange - bottomRange) | 0) << 16 >> 16;
      tempColor.blue = ((100 > score ? score : 100) > 0 ? 100 > score ? score : 100 : 0) << 16 >> 16;
      score = score - 100 << 16 >> 16;
      tempColor.red = ((100 > score ? score : 100) > 0 ? 100 > score ? score : 100 : 0) << 16 >> 16;
      score = score - 100 << 16 >> 16;
      tempColor.green = ((100 > score ? score : 100) > 0 ? 100 > score ? score : 100 : 0) << 16 >> 16;
      await getCellAppearance(struct_pos.$of(i, j), P(dchar, 0), foreColor, backColor);
      plotCharWithColor(dchar[0], mapToWindow(struct_pos.$of(i, j)), foreColor, tempColor);
    }
  }
}

export async function printSeed(): Promise<void> {
  let buf = new Int8Array(100);
  let mode = $cs("", 14);
  if (G.rogue.mode >>> 0 === GAME_MODE_EASY) {
    strcpy(P(mode), S("easy mode; "));
  } else if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD) {
    strcpy(P(mode), S("wizard mode; "));
  }
  if (G.rogue.hideSeed) {
    snprintf(P(buf), COLS, S("Dungeon seed HIDDEN; turn #%lu; %sversion %s"), G.rogue.playerTurnNumber, P(mode), G.gameConst.versionString);
  } else {
    snprintf(P(buf), COLS, S("Dungeon seed #%llu; turn #%lu; %sversion %s"), G.rogue.seed, G.rogue.playerTurnNumber, P(mode), G.gameConst.versionString);
  }
  await message(P(buf), 0);
}

export function printProgressBar(x: number, y: number, barLabel: Ptr | null, amtFilled: number, amtMax: number, fillColor: struct_color | null, dim: number): void {
  let barText = $cs("                    ", 21);
  let i = 0;
  let labelOffset = 0;
  let currentFillColor = new struct_color();
  let textColor = new struct_color();
  let progressBarColor = new struct_color();
  let darkenedBarColor = new struct_color();
  if (y >= ROWS - 1) {
    return;
  }
  if (amtFilled > amtMax) {
    amtFilled = amtMax;
  }
  if (0 >= amtMax) {
    amtMax = 1;
  }
  progressBarColor.$cp(fillColor);
  if (!(y % 2)) {
    applyColorAverage(progressBarColor, G.black, 25);
  }
  if (dim) {
    applyColorAverage(progressBarColor, G.black, 50);
  }
  darkenedBarColor.$cp(progressBarColor);
  applyColorAverage(darkenedBarColor, G.black, 75);
  labelOffset = Math.trunc((20 - strlen(barLabel)) / 2) << 16 >> 16;
  for (i = 0; i < strlen(barLabel) << 16 >> 16; i = i + 1 << 16 >> 16) {
    barText[i + labelOffset] = barLabel.a[barLabel.o + i];
  }
  amtFilled = (amtFilled > 0 ? amtFilled : 0) > amtMax ? amtMax : amtFilled > 0 ? amtFilled : 0;
  if (10000000 > amtMax) {
    amtFilled = $mul64(amtFilled, 100);
    amtMax = $mul64(amtMax, 100);
  }
  for (i = 0; 20 > i; i = i + 1 << 16 >> 16) {
    currentFillColor.$cp(Math.trunc($mul64(20, amtFilled) / amtMax) >= i ? progressBarColor : darkenedBarColor);
    if (i === Math.trunc($mul64(20, amtFilled) / amtMax)) {
      applyColorAverage(currentFillColor, G.black, 75 - Math.trunc($mul64(75, amtFilled % Math.trunc(amtMax / 20)) / Math.trunc(amtMax / 20)) << 16 >> 16);
    }
    textColor.$cp(dim ? G.gray : G.white);
    applyColorAverage(textColor, currentFillColor, (dim ? 50 : 33) << 16 >> 16);
    plotCharWithColor(barText[i], struct_windowpos.$of(x + i << 16 >> 16, y), textColor, currentFillColor);
  }
}

export function highlightScreenCell(x: number, y: number, highlightColor: struct_color | null, strength: number): void {
  let tempColor = new struct_color();
  tempColor.$cp(colorFromComponents(P($at2(G.displayBuffer.cells, x, y).foreColorComponents)));
  applyColorAugment(tempColor, highlightColor, strength);
  storeColorComponents(P($at2(G.displayBuffer.cells, x, y).foreColorComponents), tempColor);
  tempColor.$cp(colorFromComponents(P($at2(G.displayBuffer.cells, x, y).backColorComponents)));
  applyColorAugment(tempColor, highlightColor, strength);
  storeColorComponents(P($at2(G.displayBuffer.cells, x, y).backColorComponents), tempColor);
}

function estimatedArmorValue(): number {
  let retVal = armorValueIfUnenchanted(G.rogue.armor) - G.player.status[STATUS_DONNING] << 16 >> 16;
  return (0 > retVal ? 0 : retVal) << 16 >> 16;
}

function creatureHealthChangePercent(monst: struct_creature | null): number {
  if (0 >= monst.previousHealthPoints) {
    return 0;
  }
  return (100 * (monst.currentHP - (monst.info.maxHP > monst.previousHealthPoints ? monst.previousHealthPoints : monst.info.maxHP)) / monst.info.maxHP | 0) << 16 >> 16;
}

export async function printMonsterInfo(monst: struct_creature | null, y: number, dim: number, highlight: number): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any, $t12: any, $t13: any, $t14: any, $t15: any, $t16: any, $t17: any, $t18: any, $t19: any, $t20: any, $t21: any, $t22: any, $t23: any, $t24: any, $t25: any, $t26: any, $t27: any, $t28: any, $t29: any, $t30: any, $t31: any, $t32: any;
  let buf = new Int8Array(200);
  let buf2 = new Int8Array(200);
  let monstName = new Int8Array(100);
  let tempColorEscape = new Int8Array(5);
  let grayColorEscape = new Int8Array(5);
  const monstChar = new Int32Array(1);
  let monstForeColor = new struct_color();
  let monstBackColor = new struct_color();
  let healthBarColor = new struct_color();
  let tempColor = new struct_color();
  let initialY = 0;
  let i = 0;
  let j = 0;
  let highlightStrength = 0;
  let percent = 0;
  let inPath = 0;
  let oldRNG = 0;
  let hallucinationStrings = $rows([$cs("     (Dancing)      ", 100),
$cs("     (Singing)      ", 100),
$cs("  (Pontificating)   ", 100),
$cs("     (Skipping)     ", 100),
$cs("     (Spinning)     ", 100),
$cs("      (Crying)      ", 100),
$cs("     (Laughing)     ", 100),
$cs("     (Humming)      ", 100),
$cs("    (Whistling)     ", 100),
$cs("    (Quivering)     ", 100),
$cs("    (Muttering)     ", 100),
$cs("    (Gibbering)     ", 100),
$cs("     (Giggling)     ", 100),
$cs("     (Moaning)      ", 100),
$cs("    (Shrieking)     ", 100),
$cs("   (Caterwauling)   ", 100)]);
  if (y >= ROWS - 1) {
    return ROWS - 1;
  }
  initialY = y;
  oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  if (ROWS - 1 > y) {
    printString(S("                    "), 0, y, G.white, G.black, null);
    inPath = ((pmapAt(monst.loc).flags & IS_IN_PATH) >>> 0 ? true_ : false_) << 24 >> 24;
    ($t1 = pmapAt(monst.loc), $t1.flags = ($t1.flags & ~IS_IN_PATH >>> 0) >>> 0);
    await getCellAppearance(monst.loc.$clone(), P(monstChar, 0), monstForeColor, monstBackColor);
    applyColorBounds(monstForeColor, 0, 100);
    applyColorBounds(monstBackColor, 0, 100);
    if (inPath) {
      ($t2 = pmapAt(monst.loc), $t2.flags = ($t2.flags | IS_IN_PATH) >>> 0);
    }
    if (dim) {
      applyColorAverage(monstForeColor, G.black, 50);
      applyColorAverage(monstBackColor, G.black, 50);
    } else if (highlight) {
      applyColorAugment(monstForeColor, G.black, 100);
      applyColorAugment(monstBackColor, G.black, 100);
    }
    plotCharWithColor(monstChar[0], struct_windowpos.$of(0, y), monstForeColor, monstBackColor);
    if (monst.carriedItem) {
      plotCharWithColor(monst.carriedItem.displayChar, struct_windowpos.$of(1, y), G.itemColor, G.black);
    }
    monsterName(P(monstName), monst, false_);
    upperCase(P(monstName));
    if (monst === G.player) {
      strcat(P(monstName), S(" xxxx"));
      encodeMessageColor(P(monstName), strlen(P(monstName)) - 4 << 16 >> 16, monstForeColor);
      if (G.player.status[STATUS_INVISIBLE]) {
        strcat(P(monstName), S("(invisible)"));
      } else if (playerInDarkness()) {
        strcat(P(monstName), S("(dark)"));
      } else if (!((pmapAt(G.player.loc).flags & IS_IN_SHADOW) >>> 0)) {
        strcat(P(monstName), S("(lit)"));
      }
    }
    sprintf(P(buf), S(": %s"), P(monstName));
    printString(P(buf), (monst.carriedItem ? 2 : 1) << 16 >> 16, ($t3 = y, y = $t3 + 1 << 16 >> 16, $t3), dim ? G.gray : G.white, G.black, null);
  }
  if (ROWS - 1 > y && monst.mutationIndex >= 0 && (!G.player.status[STATUS_HALLUCINATING] || G.rogue.playbackOmniscience)) {
    strcpy(P(buf), S("                    "));
    sprintf(P(buf2), S("xxxx(%s)"), P(G.mutationCatalog[monst.mutationIndex].title));
    tempColor.$cp(G.mutationCatalog[monst.mutationIndex].textColor);
    if (dim) {
      applyColorAverage(tempColor, G.black, 50);
    }
    encodeMessageColor(P(buf2), 0, tempColor);
    strcpy(P(buf).add((strLenWithoutEscapes(P(buf)) - strLenWithoutEscapes(P(buf2))) / 2 | 0), P(buf2));
    for (i = strlen(P(buf)) << 16 >> 16; 20 + 4 > i; i = i + 1 << 16 >> 16) {
      buf[i] = 32;
    }
    buf[24] = 0;
    printString(P(buf), 0, ($t4 = y, y = $t4 + 1 << 16 >> 16, $t4), dim ? G.gray : G.white, G.black, null);
  }
  if (monst.info.maxHP > 1 && !((monst.info.flags & MONST_INVULNERABLE) >>> 0)) {
    if (monst === G.player) {
      healthBarColor.$cp(G.redBar);
      applyColorAverage(healthBarColor, G.blueBar, ((100 * G.player.currentHP / G.player.info.maxHP | 0) > 100 ? 100 : 100 * G.player.currentHP / G.player.info.maxHP | 0) << 16 >> 16);
    } else {
      healthBarColor.$cp(G.blueBar);
    }
    percent = creatureHealthChangePercent(monst);
    if (0 >= monst.currentHP) {
      strcpy(P(buf), S("Dead"));
    } else if (percent !== 0) {
      strcpy(P(buf), S("       Health       "));
      sprintf(P(buf2), S("(%s%i%%)"), percent > 0 ? S("+") : S(""), percent);
      strcpy(P(buf, 20 - strlen(P(buf2))), P(buf2));
    } else {
      strcpy(P(buf), S("Health"));
    }
    printProgressBar(0, ($t5 = y, y = $t5 + 1 << 16 >> 16, $t5), P(buf), monst.currentHP, monst.info.maxHP, healthBarColor, dim);
  }
  if (monst === G.player) {
    if (G.player.status[STATUS_NUTRITION] > HUNGER_THRESHOLD) {
      printProgressBar(0, ($t6 = y, y = $t6 + 1 << 16 >> 16, $t6), S("Nutrition"), G.player.status[STATUS_NUTRITION], STOMACH_SIZE, G.blueBar, dim);
    } else if (G.player.status[STATUS_NUTRITION] > WEAK_THRESHOLD) {
      printProgressBar(0, ($t7 = y, y = $t7 + 1 << 16 >> 16, $t7), S("Nutrition (Hungry)"), G.player.status[STATUS_NUTRITION], STOMACH_SIZE, G.blueBar, dim);
    } else if (G.player.status[STATUS_NUTRITION] > FAINT_THRESHOLD) {
      printProgressBar(0, ($t8 = y, y = $t8 + 1 << 16 >> 16, $t8), S("Nutrition (Weak)"), G.player.status[STATUS_NUTRITION], STOMACH_SIZE, G.blueBar, dim);
    } else if (G.player.status[STATUS_NUTRITION] > 0) {
      printProgressBar(0, ($t9 = y, y = $t9 + 1 << 16 >> 16, $t9), S("Nutrition (Faint)"), G.player.status[STATUS_NUTRITION], STOMACH_SIZE, G.blueBar, dim);
    } else if (ROWS - 1 > y) {
      printString(S("      STARVING      "), 0, ($t10 = y, y = $t10 + 1 << 16 >> 16, $t10), G.badMessageColor, G.black, null);
    }
  }
  if (!G.player.status[STATUS_HALLUCINATING] || G.rogue.playbackOmniscience || monst === G.player) {
    for (i = 0; NUMBER_OF_STATUS_EFFECTS > i; i = i + 1 << 16 >> 16) {
      if (i === STATUS_WEAKENED && monst.status[i] > 0) {
        sprintf(P(buf), S("%s%i"), P(G.statusEffectCatalog[STATUS_WEAKENED].name), monst.weaknessAmount);
        printProgressBar(0, ($t11 = y, y = $t11 + 1 << 16 >> 16, $t11), P(buf), monst.status[i], monst.maxStatus[i], G.redBar, dim);
      } else if (i === STATUS_LEVITATING && monst.status[i] > 0) {
        printProgressBar(0, ($t12 = y, y = $t12 + 1 << 16 >> 16, $t12), monst === G.player ? S("Levitating") : S("Flying"), monst.status[i], monst.maxStatus[i], G.redBar, dim);
      } else if (i === STATUS_POISONED && monst.status[i] > 0) {
        if (Math.imul(monst.status[i], monst.poisonAmount) >= monst.currentHP) {
          strcpy(P(buf), S("Fatal Poison"));
        } else {
          strcpy(P(buf), S("Poisoned"));
        }
        if (monst.poisonAmount === 1) {
          printProgressBar(0, ($t13 = y, y = $t13 + 1 << 16 >> 16, $t13), P(buf), monst.status[i], monst.maxStatus[i], G.redBar, dim);
        } else {
          sprintf(P(buf2), S("%s (x%i)"), P(buf), monst.poisonAmount);
          printProgressBar(0, ($t14 = y, y = $t14 + 1 << 16 >> 16, $t14), P(buf2), monst.status[i], monst.maxStatus[i], G.redBar, dim);
        }
      } else if (G.statusEffectCatalog[i].name[0] && monst.status[i] > 0) {
        printProgressBar(0, ($t15 = y, y = $t15 + 1 << 16 >> 16, $t15), P(G.statusEffectCatalog[i].name), monst.status[i], monst.maxStatus[i], G.redBar, dim);
      }
    }
    if (posEq(monst.targetCorpseLoc, monst.loc)) {
      printProgressBar(0, ($t16 = y, y = $t16 + 1 << 16 >> 16, $t16), P(G.monsterText[monst.info.monsterID].absorbStatus), monst.corpseAbsorptionCounter, 20, G.redBar, dim);
    }
  }
  if (monst === G.player) {
    if (ROWS - 1 > y) {
      tempColorEscape[0] = 0;
      grayColorEscape[0] = 0;
      if (G.player.status[STATUS_WEAKENED]) {
        tempColor.$cp(G.red);
        if (dim) {
          applyColorAverage(tempColor, G.black, 50);
        }
        encodeMessageColor(P(tempColorEscape), 0, tempColor);
        encodeMessageColor(P(grayColorEscape), 0, dim ? G.darkGray : G.gray);
      }
      if (!G.rogue.armor || (G.rogue.armor.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
        sprintf(P(buf), S("Str: %s%i%s  Armor: %i"), P(tempColorEscape), G.rogue.strength - G.player.weaknessAmount, P(grayColorEscape), displayedArmorValue());
      } else {
        sprintf(P(buf), S("Str: %s%i%s  Armor: %i?"), P(tempColorEscape), G.rogue.strength - G.player.weaknessAmount, P(grayColorEscape), estimatedArmorValue());
      }
      printString(S("                    "), 0, y, G.white, G.black, null);
      printString(P(buf), ((20 - strLenWithoutEscapes(P(buf))) / 2 | 0) << 16 >> 16, ($t17 = y, y = $t17 + 1 << 16 >> 16, $t17), dim ? G.darkGray : G.gray, G.black, null);
    }
    if (ROWS - 1 > y && G.rogue.gold) {
      sprintf(P(buf), S("Gold: %li"), G.rogue.gold);
      buf[20] = 0;
      printString(S("                    "), 0, y, G.white, G.black, null);
      printString(P(buf), ((20 - strLenWithoutEscapes(P(buf))) / 2 | 0) << 16 >> 16, ($t18 = y, y = $t18 + 1 << 16 >> 16, $t18), dim ? G.darkGray : G.gray, G.black, null);
    }
    if (ROWS - 1 > y) {
      tempColorEscape[0] = 0;
      grayColorEscape[0] = 0;
      tempColor.$cp(G.playerInShadowColor);
      percent = ((G.rogue.stealthRange - 2) * 100 / 28 | 0) << 16 >> 16;
      applyColorAverage(tempColor, G.black, percent);
      applyColorAugment(tempColor, G.playerInLightColor, percent);
      if (dim) {
        applyColorAverage(tempColor, G.black, 50);
      }
      encodeMessageColor(P(tempColorEscape), 0, tempColor);
      encodeMessageColor(P(grayColorEscape), 0, dim ? G.darkGray : G.gray);
      sprintf(P(buf), S("%sStealth range: %i%s"), P(tempColorEscape), G.rogue.stealthRange, P(grayColorEscape));
      printString(S("                    "), 0, y, G.white, G.black, null);
      printString(P(buf), 1, ($t19 = y, y = $t19 + 1 << 16 >> 16, $t19), dim ? G.darkGray : G.gray, G.black, null);
    }
  } else if (ROWS - 1 > y) {
    if (monst.wasNegated && monst.newPowerCount === monst.totalPowerCount && (!G.player.status[STATUS_HALLUCINATING] || G.rogue.playbackOmniscience)) {
      printString(S("      Negated       "), 0, ($t20 = y, y = $t20 + 1 << 16 >> 16, $t20), dim ? G.darkPink : G.pink, G.black, null);
    }
    if (!((monst.info.flags & MONST_INANIMATE) >>> 0) && ROWS - 1 > y) {
      if (G.player.status[STATUS_HALLUCINATING] && !G.rogue.playbackOmniscience) {
        printString(P(hallucinationStrings[rand_range(0, 9)]), 0, ($t21 = y, y = $t21 + 1 << 16 >> 16, $t21), dim ? G.darkGray : G.gray, G.black, null);
      } else if ((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
        printString(S("     (Captive)      "), 0, ($t22 = y, y = $t22 + 1 << 16 >> 16, $t22), dim ? G.darkGray : G.gray, G.black, null);
      } else if ((monst.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0 && !cellHasTMFlag(monst.loc, TM_ALLOWS_SUBMERGING)) {
        printString(S("     (Helpless)     "), 0, ($t23 = y, y = $t23 + 1 << 16 >> 16, $t23), dim ? G.darkGray : G.gray, G.black, null);
      } else if (monst.creatureState >>> 0 === MONSTER_SLEEPING) {
        printString(S("     (Sleeping)     "), 0, ($t24 = y, y = $t24 + 1 << 16 >> 16, $t24), dim ? G.darkGray : G.gray, G.black, null);
      } else if (monst.creatureState >>> 0 === MONSTER_ALLY) {
        printString(S("       (Ally)       "), 0, ($t25 = y, y = $t25 + 1 << 16 >> 16, $t25), dim ? G.darkGray : G.gray, G.black, null);
      } else if (monst.creatureState >>> 0 === MONSTER_FLEEING) {
        printString(S("     (Fleeing)      "), 0, ($t26 = y, y = $t26 + 1 << 16 >> 16, $t26), dim ? G.darkGray : G.gray, G.black, null);
      } else if (monst.creatureState >>> 0 === MONSTER_WANDERING) {
        if ((monst.bookkeepingFlags & MB_FOLLOWER) >>> 0 && monst.leader && (monst.leader.info.flags & MONST_IMMOBILE) >>> 0) {
          printString(S("    (Worshiping)    "), 0, ($t27 = y, y = $t27 + 1 << 16 >> 16, $t27), dim ? G.darkGray : G.gray, G.black, null);
        } else if ((monst.bookkeepingFlags & MB_FOLLOWER) >>> 0 && monst.leader && (monst.leader.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
          printString(S("     (Guarding)     "), 0, ($t28 = y, y = $t28 + 1 << 16 >> 16, $t28), dim ? G.darkGray : G.gray, G.black, null);
        } else {
          printString(S("    (Wandering)     "), 0, ($t29 = y, y = $t29 + 1 << 16 >> 16, $t29), dim ? G.darkGray : G.gray, G.black, null);
        }
      } else if (monst.ticksUntilTurn > (0 > G.player.ticksUntilTurn ? 0 : G.player.ticksUntilTurn) + G.player.movementSpeed) {
        printString(S("   (Off balance)    "), 0, ($t30 = y, y = $t30 + 1 << 16 >> 16, $t30), dim ? G.darkGray : G.gray, G.black, null);
      } else if (monst.creatureState >>> 0 === MONSTER_TRACKING_SCENT) {
        printString(S("     (Hunting)      "), 0, ($t31 = y, y = $t31 + 1 << 16 >> 16, $t31), dim ? G.darkGray : G.gray, G.black, null);
      }
    }
  }
  if (ROWS - 1 > y) {
    printString(S("                    "), 0, ($t32 = y, y = $t32 + 1 << 16 >> 16, $t32), dim ? G.darkGray : G.gray, G.black, null);
  }
  if (highlight) {
    for (i = 0; 20 > i; i = i + 1 << 16 >> 16) {
      highlightStrength = (smoothHiliteGradient(i, 20 - 1) / 10 | 0) << 16 >> 16;
      for (j = initialY; (y === ROWS - 1 ? y : 31 + 3 - 1 > y - 1 ? y - 1 : 31 + 3 - 1) > j; j = j + 1 << 16 >> 16) {
        highlightScreenCell(i, j, G.white, highlightStrength);
      }
    }
  }
  G.rogue.RNG = oldRNG;
  ;
  return y;
}

export function describeHallucinatedItem(buf: Ptr | null): void {
  let kind = 0;
  let maxKinds = 0;
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  let cat = getHallucinatedItemCategory();
  maxKinds = itemKindCount(cat, 0) << 16 >> 16;
  kind = rand_range(0, maxKinds - 1) << 16 >> 16;
  describedItemBasedOnParameters(cat << 16 >> 16, kind, 1, 1, buf);
  G.rogue.RNG = oldRNG;
  ;
}

export async function printItemInfo(theItem: struct_item | null, y: number, dim: number, highlight: number): Promise<number> {
  let $t1: any, $t2: any;
  let name = new Int8Array(300);
  const itemChar = new Int32Array(1);
  let itemForeColor = new struct_color();
  let itemBackColor = new struct_color();
  let initialY = 0;
  let i = 0;
  let j = 0;
  let highlightStrength = 0;
  let lineCount = 0;
  let inPath = 0;
  let oldRNG = 0;
  if (y >= ROWS - 1) {
    return ROWS - 1;
  }
  initialY = y;
  oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  if (ROWS - 1 > y) {
    inPath = ((pmapAt(theItem.loc).flags & IS_IN_PATH) >>> 0 ? true_ : false_) << 24 >> 24;
    ($t1 = pmapAt(theItem.loc), $t1.flags = ($t1.flags & ~IS_IN_PATH >>> 0) >>> 0);
    await getCellAppearance(theItem.loc.$clone(), P(itemChar, 0), itemForeColor, itemBackColor);
    if (theItem.loc.x === G.player.loc.x && theItem.loc.y === G.player.loc.y) {
      if (G.player.status[STATUS_HALLUCINATING] && !G.rogue.playbackOmniscience) {
        itemChar[0] = getItemCategoryGlyph(getHallucinatedItemCategory());
        itemForeColor.$cp(G.itemColor);
      } else {
        itemChar[0] = theItem.displayChar;
        itemForeColor.$cp(theItem.foreColor);
      }
    }
    applyColorBounds(itemForeColor, 0, 100);
    applyColorBounds(itemBackColor, 0, 100);
    if (inPath) {
      ($t2 = pmapAt(theItem.loc), $t2.flags = ($t2.flags | IS_IN_PATH) >>> 0);
    }
    if (dim) {
      applyColorAverage(itemForeColor, G.black, 50);
      applyColorAverage(itemBackColor, G.black, 50);
    }
    plotCharWithColor(itemChar[0], struct_windowpos.$of(0, y), itemForeColor, itemBackColor);
    printString(S(":                  "), 1, y, dim ? G.gray : G.white, G.black, null);
    if (G.rogue.playbackOmniscience || !G.player.status[STATUS_HALLUCINATING]) {
      itemName(theItem, P(name), true_, true_, dim ? G.gray : G.white);
    } else {
      describeHallucinatedItem(P(name));
    }
    upperCase(P(name));
    lineCount = wrapText(null, P(name), 20 - 3);
    for (i = initialY + 1 << 16 >> 16; initialY + lineCount + 1 >= i && ROWS - 1 > i; i = i + 1 << 16 >> 16) {
      printString(S("                    "), 0, i, dim ? G.darkGray : G.gray, G.black, null);
    }
    y = printStringWithWrapping(P(name), 3, y, 20 - 3, dim ? G.gray : G.white, G.black, null);
  }
  if (highlight) {
    for (i = 0; 20 > i; i = i + 1 << 16 >> 16) {
      highlightStrength = (smoothHiliteGradient(i, 20 - 1) / 10 | 0) << 16 >> 16;
      for (j = initialY; y >= j && ROWS - 1 > j; j = j + 1 << 16 >> 16) {
        highlightScreenCell(i, j, G.white, highlightStrength);
      }
    }
  }
  y = y + 2 << 16 >> 16;
  G.rogue.RNG = oldRNG;
  ;
  return y;
}

export async function printTerrainInfo(x: number, y: number, py: number, description: Ptr | null, dim: number, highlight: number): Promise<number> {
  let $t1: any, $t2: any;
  const displayChar = new Int32Array(1);
  let foreColor = new struct_color();
  let backColor = new struct_color();
  let initialY = 0;
  let i = 0;
  let j = 0;
  let highlightStrength = 0;
  let lineCount = 0;
  let inPath = 0;
  let name = new Int8Array(158);
  let textColor = new struct_color();
  let oldRNG = 0;
  if (py >= ROWS - 1) {
    return ROWS - 1;
  }
  initialY = py;
  oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  if (ROWS - 1 > py) {
    inPath = (($at2(G.pmap, x, y).flags & IS_IN_PATH) >>> 0 ? true_ : false_) << 24 >> 24;
    ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags & ~IS_IN_PATH >>> 0) >>> 0);
    await getCellAppearance(struct_pos.$of(x, y), P(displayChar, 0), foreColor, backColor);
    applyColorBounds(foreColor, 0, 100);
    applyColorBounds(backColor, 0, 100);
    if (inPath) {
      ($t2 = $at2(G.pmap, x, y), $t2.flags = ($t2.flags | IS_IN_PATH) >>> 0);
    }
    if (dim) {
      applyColorAverage(foreColor, G.black, 50);
      applyColorAverage(backColor, G.black, 50);
    }
    plotCharWithColor(displayChar[0], struct_windowpos.$of(0, py), foreColor, backColor);
    printString(S(":                  "), 1, py, dim ? G.gray : G.white, G.black, null);
    strcpy(P(name), description);
    upperCase(P(name));
    lineCount = wrapText(null, P(name), 20 - 3);
    for (i = initialY + 1 << 16 >> 16; initialY + lineCount + 1 >= i && ROWS - 1 > i; i = i + 1 << 16 >> 16) {
      printString(S("                    "), 0, i, dim ? G.darkGray : G.gray, G.black, null);
    }
    textColor.$cp(G.flavorTextColor);
    if (dim) {
      applyColorScalar(textColor, 50);
    }
    py = printStringWithWrapping(P(name), 3, py, 20 - 3, textColor, G.black, null);
  }
  if (highlight) {
    for (i = 0; 20 > i; i = i + 1 << 16 >> 16) {
      highlightStrength = (smoothHiliteGradient(i, 20 - 1) / 10 | 0) << 16 >> 16;
      for (j = initialY; py >= j && ROWS - 1 > j; j = j + 1 << 16 >> 16) {
        highlightScreenCell(i, j, G.white, highlightStrength);
      }
    }
  }
  py = py + 2 << 16 >> 16;
  G.rogue.RNG = oldRNG;
  ;
  return py;
}

export function rectangularShading(x: number, y: number, width: number, height: number, backColor: struct_color | null, opacity: number, dbuf: struct_screenDisplayBuffer | null): void {
  let i = 0;
  let j = 0;
  let dist = 0;
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
      storeColorComponents(P($at2(dbuf.cells, i, j).backColorComponents), backColor);
      if (i >= x && x + width > i && j >= y && y + height > j) {
        $at2(dbuf.cells, i, j).opacity = (opacity > 100 ? 100 : opacity) << 24 >> 24;
      } else {
        dist = 0;
        dist = dist + (0 > (x - i > i - x - width + 1 ? x - i : i - x - width + 1) ? 0 : x - i > i - x - width + 1 ? x - i : i - x - width + 1) << 16 >> 16;
        dist = dist + (0 > (y - j > j - y - height + 1 ? y - j : j - y - height + 1) ? 0 : y - j > j - y - height + 1 ? y - j : j - y - height + 1) << 16 >> 16;
        $at2(dbuf.cells, i, j).opacity = ((opacity - 10) / (1 > dist ? 1 : dist) | 0) << 24 >> 24;
        if (3 > $at2(dbuf.cells, i, j).opacity) {
          $at2(dbuf.cells, i, j).opacity = 0;
        }
      }
    }
  }
  G.rogue.RNG = oldRNG;
  ;
}

export async function printTextBox(textBuf: Ptr | null, x: number, y: number, width: number, foreColor: struct_color | null, backColor: struct_color | null, buttons: struct_brogueButton | null, buttonCount: number): Promise<number> {
  let x2 = 0;
  let y2 = 0;
  let lineCount = 0;
  let i = 0;
  let bx = 0;
  let by = 0;
  let padLines = 0;
  if (0 >= width) {
    if ((DCOLS / 2 | 0) - 1 > x) {
      x2 = x + 10 + 20 + 1 << 16 >> 16;
      width = DCOLS - x - 20 << 16 >> 16;
    } else {
      x2 = 10 + 20 + 1;
      width = x - 20 << 16 >> 16;
    }
    y2 = 2 + 3;
    if (MIN_DEFAULT_INFO_PANEL_WIDTH > width) {
      x2 = x2 - ((MIN_DEFAULT_INFO_PANEL_WIDTH - width) / 2 | 0) << 16 >> 16;
      width = MIN_DEFAULT_INFO_PANEL_WIDTH;
    }
  } else {
    y2 = y;
    x2 = x;
  }
  while ((lineCount = wrapText(null, textBuf, width)) + y2 >= ROWS - 2 && COLS - 5 > width) {
    width = width + 1 << 16 >> 16;
    if (x2 + (width / 2 | 0) > (COLS / 2 | 0)) {
      x2 = x2 - 1 << 16 >> 16;
    }
  }
  if (buttonCount > 0) {
    padLines = 2;
    bx = x2 + width << 16 >> 16;
    by = y2 + lineCount + 1 << 16 >> 16;
    for (i = 0; buttonCount > i; i = i + 1 << 16 >> 16) {
      if (($sadd(buttons, i).flags & B_DRAW) >>> 0) {
        bx = bx - (strLenWithoutEscapes(P($sadd(buttons, i).text)) + 2) << 16 >> 16;
        $sadd(buttons, i).x = bx;
        $sadd(buttons, i).y = by;
        if (x2 > bx) {
          bx = x2 + width - (strLenWithoutEscapes(P($sadd(buttons, i).text)) + 2) << 16 >> 16;
          by = by + 2 << 16 >> 16;
          padLines = padLines + 2 << 16 >> 16;
          $sadd(buttons, i).x = bx;
          $sadd(buttons, i).y = by;
        }
      }
    }
  } else {
    padLines = 0;
  }
  let dbuf = new struct_screenDisplayBuffer();
  clearDisplayBuffer(dbuf);
  printStringWithWrapping(textBuf, x2, y2, width, foreColor, backColor, dbuf);
  rectangularShading(x2, y2, width, lineCount + padLines << 16 >> 16, backColor, INTERFACE_OPACITY, dbuf);
  overlayDisplayBuffer(dbuf);
  if (buttonCount > 0) {
    return await buttonInputLoop(buttons, buttonCount, x2, y2, width, by - y2 + 1 + padLines << 16 >> 16, null);
  } else {
    return -1;
  }
}

export async function printMonsterDetails(monst: struct_creature | null): Promise<void> {
  let textBuf = new Int8Array(10000);
  monsterDetails(P(textBuf), monst);
  await printTextBox(P(textBuf), monst.loc.x, 0, 0, G.white, G.black, null, 0);
}

export async function printCarriedItemDetails(theItem: struct_item | null, x: number, y: number, width: number, includeButtons: number): Promise<number> {
  let $t1: any;
  let textBuf = new Int8Array(10000);
  let goldColorEscape = $cs("", 5);
  let whiteColorEscape = $cs("", 5);
  let buttons = $sarrOf([struct_brogueButton.$of(new Int8Array(300), 0, 0, new Float64Array(10), new struct_color(), new struct_color(), new struct_color(), 0, new Int32Array(100)),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton()]);
  let b = 0;
  itemDetails(P(textBuf), theItem);
  for (b = 0; 20 > b; b = b + 1 << 16 >> 16) {
    initializeButton($sat(buttons, b));
    ($t1 = buttons[b], $t1.flags = ($t1.flags | B_WIDE_CLICK_AREA) >>> 0);
  }
  b = 0;
  if (includeButtons) {
    encodeMessageColor(P(goldColorEscape), 0, KEYBOARD_LABELS ? G.yellow : G.white);
    encodeMessageColor(P(whiteColorEscape), 0, G.white);
    if (theItem.category & (FOOD | SCROLL | POTION | WAND | STAFF | CHARM)) {
      sprintf(P(buttons[b].text), S("   %sa%spply   "), P(goldColorEscape), P(whiteColorEscape));
      buttons[b].hotkey[0] = APPLY_KEY;
      b = b + 1 << 16 >> 16;
    }
    if (theItem.category & (ARMOR | WEAPON | RING)) {
      if ((theItem.flags & ITEM_EQUIPPED) >>> 0) {
        sprintf(P(buttons[b].text), S("  %sr%semove   "), P(goldColorEscape), P(whiteColorEscape));
        buttons[b].hotkey[0] = UNEQUIP_KEY;
        b = b + 1 << 16 >> 16;
      } else {
        sprintf(P(buttons[b].text), S("   %se%squip   "), P(goldColorEscape), P(whiteColorEscape));
        buttons[b].hotkey[0] = EQUIP_KEY;
        b = b + 1 << 16 >> 16;
      }
    }
    sprintf(P(buttons[b].text), S("   %sd%srop    "), P(goldColorEscape), P(whiteColorEscape));
    buttons[b].hotkey[0] = DROP_KEY;
    b = b + 1 << 16 >> 16;
    sprintf(P(buttons[b].text), S("   %st%shrow   "), P(goldColorEscape), P(whiteColorEscape));
    buttons[b].hotkey[0] = THROW_KEY;
    b = b + 1 << 16 >> 16;
    if (itemCanBeCalled(theItem)) {
      sprintf(P(buttons[b].text), S("   %sc%sall    "), P(goldColorEscape), P(whiteColorEscape));
      buttons[b].hotkey[0] = CALL_KEY;
      b = b + 1 << 16 >> 16;
    }
    if (KEYBOARD_LABELS) {
      sprintf(P(buttons[b].text), S("  %sR%selabel  "), P(goldColorEscape), P(whiteColorEscape));
      buttons[b].hotkey[0] = RELABEL_KEY;
      b = b + 1 << 16 >> 16;
    }
  }
  buttons[b].flags = B_ENABLED;
  buttons[b].hotkey[0] = UP_KEY;
  buttons[b].hotkey[1] = NUMPAD_8;
  buttons[b].hotkey[2] = UP_ARROW;
  b = b + 1 << 16 >> 16;
  buttons[b].flags = B_ENABLED;
  buttons[b].hotkey[0] = DOWN_KEY;
  buttons[b].hotkey[1] = NUMPAD_2;
  buttons[b].hotkey[2] = DOWN_ARROW;
  b = b + 1 << 16 >> 16;
  b = await printTextBox(P(textBuf), x, y, width, G.white, G.interfaceBoxColor, buttons[0], b);
  if (b >= 0) {
    return $u64(buttons[b].hotkey[0]);
  } else {
    return -1 >>> 0;
  }
}

export async function printFloorItemDetails(theItem: struct_item | null): Promise<void> {
  let textBuf = new Int8Array(10000);
  itemDetails(P(textBuf), theItem);
  await printTextBox(P(textBuf), theItem.loc.x, 0, 0, G.white, G.black, null, 0);
}

export function $init(): void {
  previouslyPlottedCells = new struct_screenDisplayBuffer();
  randomAnimateMonster$listLength = 0;
  randomAnimateMonster$animate = new Int32Array(68);
}
