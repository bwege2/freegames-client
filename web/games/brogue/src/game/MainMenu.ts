// @ts-nocheck
// Brogue CE 1.15.1 MainMenu.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { buttonInputLoop, drawButton, drawButtonsInState, initializeButton, initializeButtonState, processButtonInput, setButtonText, smoothHiliteGradient } from './Buttons.ts';
import { strLenWithoutEscapes } from './Combat.ts';
import { applyColorAverage, blackOutScreen, clearDisplayBuffer, commitDraws, confirm, encodeMessageColor, getInputTextString, mainInputLoop, nextBrogueEvent, overlayDisplayBuffer, pauseBrogue, plotCharWithColor, printHighScores, printString, printTextBox, rectangularShading, restoreDisplayBuffer, saveDisplayBuffer, waitForKeystrokeOrMouseClick } from './IO.ts';
import { rand_range, seedRandomGenerator } from './Math.ts';
import { displayAnnotation, flushBufferToFile, getAvailableFilePath, loadSavedGame, pausePlayback, saveGameNoPrompt, saveRecordingNoPrompt } from './Recordings.ts';
import { executeEvent, freeEverything, initializeGameVariant, initializeRogue, openFile, startLevel } from './RogueMain.ts';
import { append } from './Utilities.ts';
import { tryParseUint64 } from './main.ts';
import { initializeLaunchArguments, isApplicationActive, loadRunHistory, saveResetRun } from './platformdependent.ts';
import { struct_PauseBehavior, struct_brogueButton, struct_buttonState, struct_color, struct_gameStats, struct_pcell, struct_pos, struct_rogueEvent, struct_rogueRun, struct_screenDisplayBuffer, struct_tcell, struct_windowpos } from './structs.ts';
import { $arr, $at2, $cs, $sadd, $sarr, $sat, $ta, $u64, G, P, S, difftime, free, listFiles, memset, mktime, qsort, snprintf, sprintf, strcat, strcmp, strcpy, strftime, strlen, strncat } from '../rt/index.ts';
import { ACKNOWLEDGE_KEY, BUTTON_NORMAL, BUTTON_PRESSED, BUTTON_TEXT_SIZE, B_DRAW, B_ENABLED, B_GRADIENT, B_WIDE_CLICK_AREA, COLS, DCOLS, DOWN_ARROW, DROWS, EXIT_STATUS_SUCCESS, FLYOUT_X, GAME_MODE_EASY, GAME_MODE_NORMAL, GAME_MODE_WIZARD, G_DOWN_ARROW, G_LEFT_TRIANGLE, G_UP_ARROW, INTERFACE_OPACITY, KEYBOARD_LABELS, KEYSTROKE, MAIN_MENU_BUTTON_COUNT, MAX_FILENAME_DISPLAY_LENGTH, MENU_FLAME_COLOR_DRIFT_SPEED, MENU_FLAME_COLOR_SOURCE_COUNT, MENU_FLAME_DENOMINATOR, MENU_FLAME_FADE_SPEED, MENU_FLAME_PRECISION_FACTOR, MENU_FLAME_RISE_SPEED, MENU_FLAME_ROW_PADDING, MENU_FLAME_SPREAD_SPEED, MENU_FLAME_UPDATE_DELAY, MENU_TITLE_OFFSET_X, MENU_TITLE_OFFSET_Y, MESSAGE_LINES, MOUSE_UP, NG_FLYOUT_OPTIONS, NG_FLYOUT_PLAY, NG_FLYOUT_VIEW, NG_GAME_MODE, NG_GAME_STATS, NG_GAME_VARIANT, NG_HIGH_SCORES, NG_NEW_GAME, NG_NEW_GAME_WITH_SEED, NG_NOTHING, NG_OPEN_GAME, NG_QUIT, NG_VIEW_RECORDING, NUMPAD_2, NUMPAD_8, PAGE_DOWN_KEY, PAGE_UP_KEY, RETURN_KEY, RNG_COSMETIC, RNG_SUBSTANTIVE, ROWS, STAT_BAR_WIDTH, TEXT_INPUT_NUMBERS, TEXT_MAX_LENGTH, UP_ARROW, VARIANT_BROGUE, VARIANT_BULLET_BROGUE, VARIANT_RAPID_BROGUE, false_, true_ } from './consts.ts';


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

function drawMenuFlames(flames: Ptr | null, mask: Ptr | null): void {
  let i = 0;
  let j = 0;
  let versionStringLength = 0;
  let gameModeStringLength = 0;
  let tempColor = struct_color.$of();
  let maskColor = G.black;
  let gameModeString = $cs("", 100);
  let dchar = 0;
  versionStringLength = strLenWithoutEscapes(G.gameConst.versionString);
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD) {
    strcpy(P(gameModeString), S("Wizard Mode"));
  } else if (G.rogue.mode >>> 0 === GAME_MODE_EASY) {
    strcpy(P(gameModeString), S("Easy Mode"));
  }
  gameModeStringLength = strLenWithoutEscapes(P(gameModeString));
  for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
    for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
      if (j === ROWS - 1 && i >= COLS - versionStringLength) {
        dchar = G.gameConst.versionString.a[G.gameConst.versionString.o + (i - (COLS - versionStringLength))];
      } else if (gameModeStringLength && j === ROWS - 1 && gameModeStringLength >= i) {
        dchar = gameModeString[i];
      } else {
        dchar = 32;
      }
      if (mask.a[mask.o + i][j] === 100) {
        plotCharWithColor(dchar, struct_windowpos.$of(i, j), G.veryDarkGray, maskColor);
      } else {
        tempColor.$cp(G.black);
        tempColor.red = (flames.a[flames.o + i][j][0] / MENU_FLAME_PRECISION_FACTOR | 0) << 16 >> 16;
        tempColor.green = (flames.a[flames.o + i][j][1] / MENU_FLAME_PRECISION_FACTOR | 0) << 16 >> 16;
        tempColor.blue = (flames.a[flames.o + i][j][2] / MENU_FLAME_PRECISION_FACTOR | 0) << 16 >> 16;
        if (mask.a[mask.o + i][j] > 0) {
          applyColorAverage(tempColor, maskColor, mask.a[mask.o + i][j]);
        }
        plotCharWithColor(dchar, struct_windowpos.$of(i, j), G.veryDarkGray, tempColor);
      }
    }
  }
}

function updateMenuFlames(colors: Ptr | null, colorSources: Ptr | null, flames: Ptr | null): void {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any, $t12: any;
  let i = 0;
  let j = 0;
  let k = 0;
  let l = 0;
  let x = 0;
  let y = 0;
  let tempFlames = $arr(100, () => new Int16Array(3));
  let colorSourceNumber = 0;
  let rand = 0;
  colorSourceNumber = 0;
  for (j = 0; ROWS + MENU_FLAME_ROW_PADDING > j; j = j + 1 << 16 >> 16) {
    for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
      for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
        tempFlames[i][k] = flames.a[flames.o + i][j][k];
      }
    }
    for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
      for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
        flames.a[flames.o + i][j][k] = (100 * flames.a[flames.o + i][j][k] / MENU_FLAME_DENOMINATOR | 0) << 16 >> 16;
      }
      for (l = -1; 1 >= l; l = l + 2 << 16 >> 16) {
        x = i + l << 16 >> 16;
        if (x === -1) {
          x = COLS - 1;
        } else if (x === COLS) {
          x = 0;
        }
        for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
          ($t1 = flames.a[flames.o + i][j], $t2 = k, $t1[$t2] = $t1[$t2] + ((Math.imul(MENU_FLAME_SPREAD_SPEED, tempFlames[x][k]) / 2 | 0) / MENU_FLAME_DENOMINATOR | 0) << 16 >> 16);
        }
      }
      y = j + 1 << 16 >> 16;
      if (ROWS + MENU_FLAME_ROW_PADDING > y) {
        for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
          ($t3 = flames.a[flames.o + i][j], $t4 = k, $t3[$t4] = $t3[$t4] + (Math.imul(MENU_FLAME_RISE_SPEED, flames.a[flames.o + i][y][k]) / MENU_FLAME_DENOMINATOR | 0) << 16 >> 16);
        }
      }
      for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
        flames.a[flames.o + i][j][k] = (Math.imul(1000 - MENU_FLAME_FADE_SPEED, flames.a[flames.o + i][j][k]) / 1000 | 0) << 16 >> 16;
      }
      if (colors.a[colors.o + i][j]) {
        for (k = 0; 4 > k; k = k + 1 << 16 >> 16) {
          ($t5 = colorSources.a[colorSources.o + colorSourceNumber], $t6 = k, $t5[$t6] = $t5[$t6] + rand_range(-MENU_FLAME_COLOR_DRIFT_SPEED, MENU_FLAME_COLOR_DRIFT_SPEED) << 16 >> 16);
          colorSources.a[colorSources.o + colorSourceNumber][k] = ((colorSources.a[colorSources.o + colorSourceNumber][k] > 0 ? colorSources.a[colorSources.o + colorSourceNumber][k] : 0) > 1000 ? 1000 : colorSources.a[colorSources.o + colorSourceNumber][k] > 0 ? colorSources.a[colorSources.o + colorSourceNumber][k] : 0) << 16 >> 16;
        }
        rand = (Math.imul(colors.a[colors.o + i][j].rand, colorSources.a[colorSources.o + colorSourceNumber][0]) / 1000 | 0) << 16 >> 16;
        ($t7 = flames.a[flames.o + i][j], $t8 = 0, $t7[$t8] = $t7[$t8] + Math.imul(colors.a[colors.o + i][j].red + (Math.imul(colors.a[colors.o + i][j].redRand, colorSources.a[colorSources.o + colorSourceNumber][1]) / 1000 | 0) + rand, MENU_FLAME_PRECISION_FACTOR) << 16 >> 16);
        ($t9 = flames.a[flames.o + i][j], $t10 = 1, $t9[$t10] = $t9[$t10] + Math.imul(colors.a[colors.o + i][j].green + (Math.imul(colors.a[colors.o + i][j].greenRand, colorSources.a[colorSources.o + colorSourceNumber][2]) / 1000 | 0) + rand, MENU_FLAME_PRECISION_FACTOR) << 16 >> 16);
        ($t11 = flames.a[flames.o + i][j], $t12 = 2, $t11[$t12] = $t11[$t12] + Math.imul(colors.a[colors.o + i][j].blue + (Math.imul(colors.a[colors.o + i][j].blueRand, colorSources.a[colorSources.o + colorSourceNumber][3]) / 1000 | 0) + rand, MENU_FLAME_PRECISION_FACTOR) << 16 >> 16);
        colorSourceNumber = colorSourceNumber + 1 << 16 >> 16;
      }
    }
  }
}

function antiAlias(mask: Ptr | null): void {
  let i = 0;
  let j = 0;
  let x = 0;
  let y = 0;
  let dir = 0;
  let nbCount = 0;
  let intensity = $ta(Int16Array, 5, [0, 0, 35, 50, 60]);
  for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
      if (100 > mask.a[mask.o + i][j]) {
        nbCount = 0;
        for (dir = 0; 4 > dir; dir = dir + 1 << 16 >> 16) {
          x = i + G.nbDirs[dir][0] << 16 >> 16;
          y = j + G.nbDirs[dir][1] << 16 >> 16;
          if (locIsInWindow(struct_windowpos.$of(x, y)) && mask.a[mask.o + x][y] === 100) {
            nbCount = nbCount + 1 << 16 >> 16;
          }
        }
        mask.a[mask.o + i][j] = intensity[nbCount] & 0xff;
      }
    }
  }
}

function initializeMenuFlames(includeTitle: number, colors: Ptr | null, colorStorage: struct_color | null, colorSources: Ptr | null, flames: Ptr | null, mask: Ptr | null): void {
  let i = 0;
  let j = 0;
  let k = 0;
  let colorSourceCount = 0;
  for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
      mask.a[mask.o + i][j] = 0;
    }
  }
  for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; ROWS + MENU_FLAME_ROW_PADDING > j; j = j + 1 << 16 >> 16) {
      colors.a[colors.o + i][j] = null;
      for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
        flames.a[flames.o + i][j][k] = 0;
      }
    }
  }
  for (i = 0; MENU_FLAME_COLOR_SOURCE_COUNT > i; i = i + 1 << 16 >> 16) {
    for (k = 0; 4 > k; k = k + 1 << 16 >> 16) {
      colorSources.a[colorSources.o + i][k] = rand_range(0, 1000) << 16 >> 16;
    }
  }
  colorSourceCount = 0;
  for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
    $sadd(colorStorage, colorSourceCount).$cp(G.flameSourceColor);
    applyColorAverage($sadd(colorStorage, colorSourceCount), G.flameSourceColorSecondary, 100 - (smoothHiliteGradient(i, COLS - 1) + 25) << 16 >> 16);
    colors.a[colors.o + i][ROWS + MENU_FLAME_ROW_PADDING - 1] = $sadd(colorStorage, colorSourceCount);
    colorSourceCount = colorSourceCount + 1 << 16 >> 16;
  }
  if (includeTitle) {
    for (i = 0; G.gameConst.mainMenuTitleWidth > i; i = i + 1 << 16 >> 16) {
      for (j = 0; G.gameConst.mainMenuTitleHeight > j; j = j + 1 << 16 >> 16) {
        if (G.mainMenuTitle.a[G.mainMenuTitle.o + (Math.imul(j, G.gameConst.mainMenuTitleWidth) + i)] !== 32) {
          colors.a[colors.o + (((COLS - G.gameConst.mainMenuTitleWidth) / 2 | 0) + i + MENU_TITLE_OFFSET_X)][((ROWS - G.gameConst.mainMenuTitleHeight) / 2 | 0) + j + MENU_TITLE_OFFSET_Y] = G.flameTitleColor;
          colorSourceCount = colorSourceCount + 1 << 16 >> 16;
          mask.a[mask.o + (((COLS - G.gameConst.mainMenuTitleWidth) / 2 | 0) + i + MENU_TITLE_OFFSET_X)][((ROWS - G.gameConst.mainMenuTitleHeight) / 2 | 0) + j + MENU_TITLE_OFFSET_Y] = 100;
        }
      }
    }
    antiAlias(mask);
  }
  ;
  for (i = 0; 100 > i; i = i + 1 << 16 >> 16) {
    updateMenuFlames(colors, colorSources, flames);
  }
}

function initializeMainMenuButton(button: struct_brogueButton | null, textWithHotkey: Ptr | null, hotkey1: number, hotkey2: number, command: number): void {
  initializeButton(button);
  let textWithoutHotkey = new Int8Array(300);
  snprintf(P(textWithoutHotkey), BUTTON_TEXT_SIZE - 1, textWithHotkey, S(""), S(""));
  setButtonText(button, textWithHotkey, P(textWithoutHotkey));
  button.hotkey[0] = hotkey1;
  button.hotkey[1] = hotkey2;
  button.flags = (button.flags | B_WIDE_CLICK_AREA) >>> 0;
  button.buttonColor.$cp(G.titleButtonColor);
  button.command = command;
}

function initializeMainMenuButtons(buttons: struct_brogueButton | null): void {
  initializeMainMenuButton(buttons, S("     %sN%sew Game     "), 110, 78, NG_NEW_GAME);
  initializeMainMenuButton($sadd(buttons, 1), S(" *     %sP%slay       "), 112, 80, NG_FLYOUT_PLAY);
  initializeMainMenuButton($sadd(buttons, 2), S(" *     %sV%siew       "), 118, 86, NG_FLYOUT_VIEW);
  initializeMainMenuButton($sadd(buttons, 3), S("       %sQ%suit       "), 113, 81, NG_QUIT);
  for (let i = 0; MAIN_MENU_BUTTON_COUNT - 1 > i; ++i) {
    $sadd(buttons, i).symbol[0] = G_LEFT_TRIANGLE;
  }
}

function stackButtons(buttons: struct_brogueButton | null, buttonCount: number, startPosition: struct_windowpos, spacing: number, topToBottomFlag: number): void {
  let y = startPosition.window_y;
  if (topToBottomFlag) {
    for (let i = 0; buttonCount > i; ++i) {
      $sadd(buttons, i).x = startPosition.window_x;
      $sadd(buttons, i).y = y;
      y = y + spacing << 16 >> 16;
    }
  } else {
    for (let i = buttonCount - 1; i >= 0; --i) {
      $sadd(buttons, i).x = startPosition.window_x;
      $sadd(buttons, i).y = y;
      y = y - spacing << 16 >> 16;
    }
  }
}

function initializeMenu(menu: struct_buttonState | null, buttons: struct_brogueButton | null, buttonCount: number, shadowBuf: struct_screenDisplayBuffer | null): void {
  memset(menu, 0, 42816);
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;
  minX = COLS;
  minY = ROWS;
  maxX = maxY = 0;
  for (let i = 0; buttonCount > i; ++i) {
    minX = ($sadd(buttons, i).x > minX ? minX : $sadd(buttons, i).x) << 16 >> 16;
    maxX = (maxX > $sadd(buttons, i).x + strLenWithoutEscapes(P($sadd(buttons, i).text)) ? maxX : $sadd(buttons, i).x + strLenWithoutEscapes(P($sadd(buttons, i).text))) << 16 >> 16;
    minY = ($sadd(buttons, i).y > minY ? minY : $sadd(buttons, i).y) << 16 >> 16;
    maxY = (maxY > $sadd(buttons, i).y ? maxY : $sadd(buttons, i).y) << 16 >> 16;
  }
  let width = maxX - minX << 16 >> 16;
  let height = maxY - minY << 16 >> 16;
  initializeButtonState(menu, buttons, buttonCount, minX, minY, width, height);
  clearDisplayBuffer(shadowBuf);
  rectangularShading(minX, minY, width, height + 1 << 16 >> 16, G.black, INTERFACE_OPACITY, shadowBuf);
}

function initializeMainMenu(menu: struct_buttonState | null, buttons: struct_brogueButton | null, position: struct_windowpos, shadowBuf: struct_screenDisplayBuffer | null): void {
  initializeMainMenuButtons(buttons);
  stackButtons(buttons, MAIN_MENU_BUTTON_COUNT, position, 2, false_);
  initializeMenu(menu, buttons, MAIN_MENU_BUTTON_COUNT, shadowBuf);
}

function initializeFlyoutMenu(menu: struct_buttonState | null, shadowBuf: struct_screenDisplayBuffer | null, buttons: struct_brogueButton | null, position: struct_windowpos): void {
  let buttonCount = 0;
  if (G.rogue.nextGame >>> 0 === NG_FLYOUT_PLAY) {
    buttonCount = 4;
    initializeMainMenuButton(buttons, S("  New %sS%seeded Game  "), 115, 83, NG_NEW_GAME_WITH_SEED);
    initializeMainMenuButton($sadd(buttons, 1), S("     %sL%soad Game     "), 108, 76, NG_OPEN_GAME);
    initializeMainMenuButton($sadd(buttons, 2), S("  Change V%sa%sriant   "), 97, 65, NG_GAME_VARIANT);
    initializeMainMenuButton($sadd(buttons, 3), S("   Change %sM%sode     "), 109, 77, NG_GAME_MODE);
  } else if (G.rogue.nextGame >>> 0 === NG_FLYOUT_VIEW) {
    buttonCount = 3;
    initializeMainMenuButton(buttons, S("   View %sR%secording  "), 114, 82, NG_VIEW_RECORDING);
    initializeMainMenuButton($sadd(buttons, 1), S("    %sH%sigh Scores    "), 104, 72, NG_HIGH_SCORES);
    initializeMainMenuButton($sadd(buttons, 2), S("    %sG%same Stats     "), 103, 71, NG_GAME_STATS);
  } else {
    return;
  }
  stackButtons(buttons, buttonCount, position, 2, false_);
  initializeMenu(menu, buttons, buttonCount, shadowBuf);
}

async function chooseGameVariant(): Promise<void> {
  let gameVariantChoice = 0;
  let textBuf = $cs("", 6800);
  let tmpBuf = $cs("", 6800);
  let goldColorEscape = $cs("", 5);
  let whiteColorEscape = $cs("", 5);
  encodeMessageColor(P(goldColorEscape), 0, G.yellow);
  encodeMessageColor(P(whiteColorEscape), 0, G.white);
  snprintf(P(textBuf), TEXT_MAX_LENGTH, S("%sBrogue%s\n"), P(goldColorEscape), P(whiteColorEscape));
  append(P(textBuf), S("Classic Brogue. The endlessly captivating masterpiece of dungeon adventuring.\n\n"), TEXT_MAX_LENGTH);
  snprintf(P(tmpBuf), TEXT_MAX_LENGTH, S("%sRapid Brogue%s\n"), P(goldColorEscape), P(whiteColorEscape));
  append(P(textBuf), P(tmpBuf), TEXT_MAX_LENGTH);
  append(P(textBuf), S("Die faster and more often in this quarter-length version of the classic game!\n\n"), TEXT_MAX_LENGTH);
  snprintf(P(tmpBuf), TEXT_MAX_LENGTH, S("%sBullet Brogue%s\n"), P(goldColorEscape), P(whiteColorEscape));
  append(P(textBuf), P(tmpBuf), TEXT_MAX_LENGTH);
  append(P(textBuf), S("No time? Death wish? Bullet Brogue is for you. Not best for new players!\n\n"), TEXT_MAX_LENGTH);
  let buttons = $sarr(struct_brogueButton, 3);
  initializeMainMenuButton(buttons[0], S("  %sR%sapid Brogue     "), 114, 82, NG_NOTHING);
  initializeMainMenuButton(buttons[1], S("     %sB%srogue        "), 98, 66, NG_NOTHING);
  initializeMainMenuButton(buttons[2], S("   Bu%sl%slet Brogue   "), 108, 76, NG_NOTHING);
  let rbuf = saveDisplayBuffer().$clone();
  gameVariantChoice = await printTextBox(P(textBuf), 20, 7, 45, G.white, G.black, buttons[0], 3);
  restoreDisplayBuffer(rbuf);
  if (gameVariantChoice === 0) {
    G.gameVariant = VARIANT_RAPID_BROGUE;
  } else if (gameVariantChoice === 1) {
    G.gameVariant = VARIANT_BROGUE;
  } else if (gameVariantChoice === 2) {
    G.gameVariant = VARIANT_BULLET_BROGUE;
  } else {
    G.rogue.nextGame = NG_NOTHING;
  }
}

async function chooseGameMode(): Promise<void> {
  let gameMode = 0;
  let textBuf = $cs("", 6800);
  let tmpBuf = $cs("", 6800);
  let goldColorEscape = $cs("", 5);
  let whiteColorEscape = $cs("", 5);
  encodeMessageColor(P(goldColorEscape), 0, G.yellow);
  encodeMessageColor(P(whiteColorEscape), 0, G.white);
  snprintf(P(textBuf), TEXT_MAX_LENGTH, S("%sNormal Mode%s\n"), P(goldColorEscape), P(whiteColorEscape));
  append(P(textBuf), S("Punishingly difficult. Maliciously alluring. Perfectly normal.\n\n"), TEXT_MAX_LENGTH);
  snprintf(P(tmpBuf), TEXT_MAX_LENGTH, S("%sEasy Mode%s\n"), P(goldColorEscape), P(whiteColorEscape));
  append(P(textBuf), P(tmpBuf), TEXT_MAX_LENGTH);
  append(P(textBuf), S("Succumb to temptation and transform into a powerful demon, taking 20% as much damage. But great power comes at a great price -- you keep only 10% of your score.\n\n"), TEXT_MAX_LENGTH);
  snprintf(P(tmpBuf), TEXT_MAX_LENGTH, S("%sWizard Mode%s\n"), P(goldColorEscape), P(whiteColorEscape));
  append(P(textBuf), P(tmpBuf), TEXT_MAX_LENGTH);
  append(P(textBuf), S("Play as an invincible wizard that starts with legendary items and is magically reborn after every death. Summon monsters and make them friend or foe. Conjure any item out of thin air. (Your score is not saved.)"), TEXT_MAX_LENGTH);
  let buttons = $sarr(struct_brogueButton, 3);
  initializeMainMenuButton(buttons[0], S("      %sW%sizard       "), 119, 87, NG_NOTHING);
  initializeMainMenuButton(buttons[1], S("       %sE%sasy        "), 101, 69, NG_NOTHING);
  initializeMainMenuButton(buttons[2], S("      %sN%sormal       "), 110, 78, NG_NOTHING);
  let rbuf = saveDisplayBuffer().$clone();
  gameMode = await printTextBox(P(textBuf), 10, 5, 66, G.white, G.black, buttons[0], 3);
  restoreDisplayBuffer(rbuf);
  if (gameMode === 0) {
    G.rogue.mode = GAME_MODE_WIZARD;
  } else if (gameMode === 1) {
    G.rogue.mode = GAME_MODE_EASY;
  } else if (gameMode === 2) {
    G.rogue.mode = GAME_MODE_NORMAL;
  }
  G.rogue.nextGame = NG_NOTHING;
}

function isFlyoutActive(): number {
  return (G.rogue.nextGame >= NG_FLYOUT_PLAY && NG_FLYOUT_OPTIONS >= G.rogue.nextGame >>> 0 ? 1 : 0) << 24 >> 24;
}

function getNextGameButtonPos(buttons: struct_brogueButton | null): struct_windowpos {
  for (let i = 0; MAIN_MENU_BUTTON_COUNT > i; ++i) {
    if ($sadd(buttons, i).command >>> 0 === G.rogue.nextGame >>> 0) {
      return struct_windowpos.$of($sadd(buttons, i).x, $sadd(buttons, i).y);
    }
  }
  return mapToWindow(struct_pos.$of(-1, -1));
}

function redrawMainMenuButtons(menu: struct_buttonState | null, button_dbuf: struct_screenDisplayBuffer | null): void {
  let drawState = 0;
  if (G.rogue.nextGame >>> 0 === NG_NOTHING) {
    drawButtonsInState(menu, button_dbuf);
  } else {
    for (let i = 0; MAIN_MENU_BUTTON_COUNT > i; ++i) {
      drawState = menu.buttons[i].command >>> 0 === G.rogue.nextGame >>> 0 ? BUTTON_NORMAL : BUTTON_PRESSED;
      drawButton($sat(menu.buttons, i), drawState, button_dbuf);
    }
  }
}

async function titleMenu(): Promise<void> {
  let flames = $arr(100, () => $arr(36, () => new Int16Array(3)));
  let colorSources = $arr(1136, () => new Int16Array(4));
  let colors = $arr(100, () => new Array(36).fill(null));
  let colorStorage = $sarr(struct_color, 100);
  let mask = $arr(100, () => new Uint8Array(34));
  let mainMenu = new struct_buttonState();
  let mainButtons = $sarr(struct_brogueButton, 4);
  let mainShadowBuf = new struct_screenDisplayBuffer();
  let flyoutMenu = new struct_buttonState();
  let flyoutButtons = $sarr(struct_brogueButton, 10);
  let flyoutShadowBuf = new struct_screenDisplayBuffer();
  seedRandomGenerator(0n);
  G.rogue.nextGamePath[0] = 0;
  G.rogue.nextGameSeed = 0n;
  blackOutScreen();
  let quitButtonPosition = struct_windowpos.$of(COLS - 20, ROWS - 3);
  initializeMainMenu(mainMenu, mainButtons[0], quitButtonPosition.$clone(), mainShadowBuf);
  initializeMenuFlames(true_, P(colors), colorStorage[0], P(colorSources), P(flames), P(mask));
  G.rogue.creaturesWillFlashThisTurn = false_;
  let theEvent = new struct_rogueEvent();
  let mainIndex = -1;
  let flyoutIndex = -1;
  let bPos = new struct_windowpos();
  do {
    if (isFlyoutActive()) {
      bPos.$cp(getNextGameButtonPos(mainButtons[0]));
      initializeFlyoutMenu(flyoutMenu, flyoutShadowBuf, flyoutButtons[0], struct_windowpos.$of(FLYOUT_X, bPos.window_y));
    }
    do {
      if (isApplicationActive()) {
        updateMenuFlames(P(colors), P(colorSources), P(flames));
        drawMenuFlames(P(flames), P(mask));
        overlayDisplayBuffer(mainShadowBuf);
        let dbuf = new struct_screenDisplayBuffer();
        clearDisplayBuffer(dbuf);
        redrawMainMenuButtons(mainMenu, dbuf);
        overlayDisplayBuffer(dbuf);
        if (isFlyoutActive()) {
          overlayDisplayBuffer(flyoutShadowBuf);
          let flyout_dbuf = new struct_screenDisplayBuffer();
          clearDisplayBuffer(flyout_dbuf);
          drawButtonsInState(flyoutMenu, flyout_dbuf);
          overlayDisplayBuffer(flyout_dbuf);
          mainMenu.buttonDepressed = -1;
          mainMenu.buttonFocused = -1;
        }
        if (await pauseBrogue(MENU_FLAME_UPDATE_DELAY, struct_PauseBehavior.$of(true_))) {
          await nextBrogueEvent(theEvent, true_, false_, true_);
          if (theEvent.eventType >>> 0 === KEYSTROKE && (theEvent.param1 === 110 || theEvent.param1 === 78)) {
            G.rogue.nextGame = NG_NEW_GAME;
            break;
          }
          if (isFlyoutActive()) {
            flyoutIndex = await processButtonInput(flyoutMenu, null, theEvent);
            if (flyoutIndex !== -1 && (theEvent.eventType >>> 0 === MOUSE_UP || theEvent.eventType >>> 0 === KEYSTROKE)) {
              G.rogue.nextGame = flyoutButtons[flyoutIndex].command;
            }
            if (G.rogue.nextGame >>> 0 === NG_GAME_MODE) {
              await chooseGameMode();
            } else if (G.rogue.nextGame >>> 0 === NG_GAME_VARIANT) {
              await chooseGameVariant();
            }
          }
          mainIndex = await processButtonInput(mainMenu, null, theEvent);
          if (theEvent.eventType >>> 0 === MOUSE_UP || theEvent.eventType >>> 0 === KEYSTROKE) {
            if (mainIndex !== -1 && G.rogue.nextGame >>> 0 !== mainButtons[mainIndex].command >>> 0) {
              G.rogue.nextGame = mainButtons[mainIndex].command;
            } else if (flyoutIndex === -1) {
              G.rogue.nextGame = NG_NOTHING;
            }
          }
        }
      } else {
        await pauseBrogue(64, struct_PauseBehavior.$of());
      }
    } while (theEvent.eventType >>> 0 !== MOUSE_UP && theEvent.eventType >>> 0 !== KEYSTROKE && (isFlyoutActive() || G.rogue.nextGame >>> 0 === NG_NOTHING));
  } while (isFlyoutActive() || G.rogue.nextGame >>> 0 === NG_NOTHING);
  drawMenuFlames(P(flames), P(mask));
}

export function quitImmediately(): number {
  if (G.rogue.recording) {
    flushBufferToFile();
    if (G.rogue.gameInProgress && !G.rogue.quit && !G.rogue.gameHasEnded) {
      saveGameNoPrompt();
    } else {
      let path = new Int8Array(4096);
      saveRecordingNoPrompt(P(path));
    }
  }
  return EXIT_STATUS_SUCCESS;
}

export async function dialogAlert(message: Ptr | null): Promise<void> {
  let OKButton = new struct_brogueButton();
  initializeButton(OKButton);
  strcpy(P(OKButton.text), S("     OK     "));
  OKButton.hotkey[0] = RETURN_KEY;
  OKButton.hotkey[1] = ACKNOWLEDGE_KEY;
  let rbuf = saveDisplayBuffer().$clone();
  await printTextBox(message, (COLS / 3 | 0) << 16 >> 16, (ROWS / 3 | 0) << 16 >> 16, (COLS / 3 | 0) << 16 >> 16, G.white, G.interfaceBoxColor, OKButton, 1);
  restoreDisplayBuffer(rbuf);
}

function stringsExactlyMatch(string1: Ptr | null, string2: Ptr | null): number {
  let i = 0;
  for (i = 0; string1.a[string1.o + i] && string2.a[string2.o + i]; i = i + 1 << 16 >> 16) {
    if (string1.a[string1.o + i] !== string2.a[string2.o + i]) {
      return false_;
    }
  }
  return (string1.a[string1.o + i] === string2.a[string2.o + i] ? 1 : 0) << 24 >> 24;
}

function fileEntryCompareDates(a: any, b: any): number {
  let f1 = a;
  let f2 = b;
  let t1 = 0;
  let t2 = 0;
  let diff = 0;
  t1 = mktime(f1.date);
  t2 = mktime(f2.date);
  diff = difftime(t2, t1);
  return Math.trunc(diff) | 0;
}

export async function dialogChooseFile(path: Ptr | null, suffix: Ptr | null, prompt: Ptr | null): Promise<number> {
  let $t1: any, $t2: any, $t3: any;
  let i = 0;
  let j = 0;
  const count = new Int16Array(1);
  let x = 0;
  let y = 0;
  let width = 0;
  let height = 0;
  let suffixLength = 0;
  let pathLength = 0;
  let maxPathLength = 0;
  let currentPageStart = 0;
  let buttons = $sarr(struct_brogueButton, 28);
  let files = null;
  let retval = false_;
  let again = 0;
  let dbuf = new struct_screenDisplayBuffer();
  let dialogColor = G.interfaceBoxColor;
  const membuf = [null];
  let fileDate = new Int8Array(11);
  suffixLength = strlen(suffix) << 16 >> 16;
  files = listFiles(P(count, 0), P(membuf, 0));
  let rbuf = saveDisplayBuffer().$clone();
  maxPathLength = strLenWithoutEscapes(prompt);
  for (i = 0, j = 0; count[0] > i; i = i + 1 << 16 >> 16) {
    pathLength = strlen($sadd(files, i).path) << 16 >> 16;
    if (stringsExactlyMatch($sadd(files, i).path.add(0 > pathLength - suffixLength ? 0 : pathLength - suffixLength), suffix)) {
      if (i > j) {
        $sadd(files, j).$cp($sadd(files, i));
      }
      j = j + 1 << 16 >> 16;
      if ((53 > pathLength ? pathLength : 53) + 10 > maxPathLength) {
        maxPathLength = (53 > pathLength ? pathLength : 53) + 10 << 16 >> 16;
      }
    }
  }
  count[0] = j;
  qsort(files, $u64(count[0]), 64, fileEntryCompareDates);
  currentPageStart = 0;
  do {
    again = false_;
    for (i = 0; ((31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) > count[0] - currentPageStart ? count[0] - currentPageStart : 31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) > i; i = i + 1 << 16 >> 16) {
      initializeButton($sat(buttons, i));
      ($t1 = buttons[i], $t1.flags = ($t1.flags & ~(B_WIDE_CLICK_AREA | B_GRADIENT) >>> 0) >>> 0);
      buttons[i].buttonColor.$cp(dialogColor);
      if (KEYBOARD_LABELS) {
        sprintf(P(buttons[i].text), S("%c) "), 97 + i);
      } else {
        buttons[i].text[0] = 0;
      }
      strncat(P(buttons[i].text), $sadd(files, (currentPageStart + i)).path, MAX_FILENAME_DISPLAY_LENGTH);
      buttons[i].text[strlen(P(buttons[i].text)) - $u64(suffixLength)] = 0;
      buttons[i].hotkey[0] = 97 + i;
      buttons[i].hotkey[1] = 65 + i;
      if (strlen(P(buttons[i].text)) > MAX_FILENAME_DISPLAY_LENGTH) {
        strcpy(P(buttons[i].text, MAX_FILENAME_DISPLAY_LENGTH - 3), S("..."));
      }
    }
    x = ((COLS - maxPathLength) / 2 | 0) << 16 >> 16;
    width = maxPathLength;
    height = ((31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) > count[0] - currentPageStart ? count[0] - currentPageStart : 31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) + 2 << 16 >> 16;
    y = (4 > ((31 + 3 - height) / 2 | 0) ? 4 : (31 + 3 - height) / 2 | 0) << 16 >> 16;
    for (i = 0; ((31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) > count[0] - currentPageStart ? count[0] - currentPageStart : 31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) > i; i = i + 1 << 16 >> 16) {
      pathLength = strlen(P(buttons[i].text)) << 16 >> 16;
      for (j = pathLength; width - 10 > j; j = j + 1 << 16 >> 16) {
        buttons[i].text[j] = 32;
      }
      buttons[i].text[j] = 0;
      strftime(P(fileDate), 11, S("%Y-%m-%d"), $sadd(files, (currentPageStart + i)).date);
      strcpy(P(buttons[i].text, j), P(fileDate));
      buttons[i].x = x;
      buttons[i].y = y + 1 + i << 16 >> 16;
    }
    if (count[0] > (31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7)) {
      initializeButton($sat(buttons, i));
      strcpy(P(buttons[i].text), S("     *     "));
      buttons[i].symbol[0] = G_UP_ARROW;
      if (0 >= currentPageStart) {
        ($t2 = buttons[i], $t2.flags = ($t2.flags & ~(B_ENABLED | B_DRAW) >>> 0) >>> 0);
      } else {
        buttons[i].hotkey[0] = UP_ARROW;
        buttons[i].hotkey[1] = NUMPAD_8;
        buttons[i].hotkey[2] = PAGE_UP_KEY;
      }
      buttons[i].x = x + ((width - 11) / 2 | 0) << 16 >> 16;
      buttons[i].y = y;
      i = i + 1 << 16 >> 16;
      initializeButton($sat(buttons, i));
      strcpy(P(buttons[i].text), S("     *     "));
      buttons[i].symbol[0] = G_DOWN_ARROW;
      if (currentPageStart + (31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) >= count[0]) {
        ($t3 = buttons[i], $t3.flags = ($t3.flags & ~(B_ENABLED | B_DRAW) >>> 0) >>> 0);
      } else {
        buttons[i].hotkey[0] = DOWN_ARROW;
        buttons[i].hotkey[1] = NUMPAD_2;
        buttons[i].hotkey[2] = PAGE_DOWN_KEY;
      }
      buttons[i].x = x + ((width - 11) / 2 | 0) << 16 >> 16;
      buttons[i].y = y + i << 16 >> 16;
    }
    if (count[0]) {
      clearDisplayBuffer(dbuf);
      printString(prompt, x, y - 1 << 16 >> 16, G.itemMessageColor, dialogColor, dbuf);
      rectangularShading(x - 1 << 16 >> 16, y - 1 << 16 >> 16, width + 1 << 16 >> 16, height + 1 << 16 >> 16, dialogColor, INTERFACE_OPACITY, dbuf);
      overlayDisplayBuffer(dbuf);
      i = await buttonInputLoop(buttons[0], ((31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) > count[0] - currentPageStart ? count[0] - currentPageStart : 31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) + (count[0] > (31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) ? 2 : 0) << 16 >> 16, x, y, width, height, null);
      restoreDisplayBuffer(rbuf);
      if (((31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) > count[0] - currentPageStart ? count[0] - currentPageStart : 31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) > i) {
        if (i >= 0) {
          retval = true_;
          strcpy(path, $sadd(files, (currentPageStart + i)).path);
        } else {
          retval = false_;
        }
      } else if (i === ((31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) > count[0] - currentPageStart ? count[0] - currentPageStart : 31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7)) {
        again = true_;
        currentPageStart = currentPageStart - (31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) << 16 >> 16;
      } else if (i === ((31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) > count[0] - currentPageStart ? count[0] - currentPageStart : 31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) + 1) {
        again = true_;
        currentPageStart = currentPageStart + (31 + 3 - 7 > 26 ? 26 : 31 + 3 - 7) << 16 >> 16;
      }
    }
  } while (again);
  free(files);
  free(membuf[0]);
  if (count[0] === 0) {
    await dialogAlert(S("No applicable files found."));
    return false_;
  } else {
    return retval;
  }
}

function addRuntoGameStats(run: struct_rogueRun | null, stats: struct_gameStats | null): void {
  ++stats.games;
  stats.cumulativeScore = stats.cumulativeScore + $u64(run.score);
  stats.cumulativeGold = stats.cumulativeGold + $u64(run.gold);
  stats.cumulativeLumenstones += run.lumenstones;
  stats.cumulativeLevels += run.deepestLevel;
  stats.cumulativeTurns = stats.cumulativeTurns + $u64(run.turns);
  stats.highestScore = run.score > stats.highestScore ? run.score : stats.highestScore;
  stats.mostGold = run.gold > stats.mostGold ? run.gold : stats.mostGold;
  stats.mostLumenstones = run.lumenstones > stats.mostLumenstones ? run.lumenstones : stats.mostLumenstones;
  stats.deepestLevel = run.deepestLevel > stats.deepestLevel ? run.deepestLevel : stats.deepestLevel;
  if (strcmp(P(run.result), S("Escaped")) === 0 || strcmp(P(run.result), S("Mastered")) === 0) {
    if (stats.fewestTurnsWin === 0 || stats.fewestTurnsWin > run.turns) {
      stats.fewestTurnsWin = run.turns;
    }
    ++stats.won;
    ++stats.currentWinStreak;
    if (strcmp(P(run.result), S("Mastered")) === 0) {
      ++stats.currentMasteryStreak;
      ++stats.mastered;
    } else {
      stats.currentMasteryStreak = 0;
      ++stats.escaped;
    }
  } else {
    stats.currentWinStreak = stats.currentMasteryStreak = 0;
  }
  if (stats.currentWinStreak > stats.longestWinStreak) {
    stats.longestWinStreak = stats.currentWinStreak;
  }
  if (stats.currentMasteryStreak > stats.longestMasteryStreak) {
    stats.longestMasteryStreak = stats.currentMasteryStreak;
  }
  if (stats.games === 0) {
    stats.winRate = 0;
  } else {
    stats.winRate = stats.won / stats.games * 100;
  }
}

async function viewGameStats(): Promise<void> {
  let allTimeStats = struct_gameStats.$of();
  let recentStats = struct_gameStats.$of();
  let runHistory = loadRunHistory();
  let run = runHistory;
  while (!!run) {
    if (run.seed !== 0n) {
      addRuntoGameStats(run, allTimeStats);
      addRuntoGameStats(run, recentStats);
    } else {
      memset(recentStats, 0, 96);
    }
    run = run.nextRun;
  }
  run = runHistory;
  let next = null;
  while (!!run) {
    next = run.nextRun;
    free(run);
    run = next;
  }
  let rbuf = saveDisplayBuffer().$clone();
  blackOutScreen();
  let dbuf = new struct_screenDisplayBuffer();
  clearDisplayBuffer(dbuf);
  let buf = new Int8Array(300);
  let i = 4;
  let offset = 21;
  let whiteColorEscape = $cs("", 5);
  let yellowColorEscape = $cs("", 5);
  encodeMessageColor(P(whiteColorEscape), 0, G.white);
  encodeMessageColor(P(yellowColorEscape), 0, G.itemMessageColor);
  let titleColor = G.black.$clone();
  applyColorAverage(titleColor, G.itemMessageColor, 100);
  printString(S("-- GAME STATS --"), ((COLS - 17 + 1) / 2 | 0) << 16 >> 16, 0, titleColor, G.black, dbuf);
  sprintf(P(buf), S("%-30s%16s%16s"), S(""), S("All Time"), S("Recent"));
  printString(P(buf), offset << 16 >> 16, i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  sprintf(P(buf), S("%-30s%s%16i%16i"), S("Games Played"), P(whiteColorEscape), allTimeStats.games, recentStats.games);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  ++i;
  sprintf(P(buf), S("%-30s%s%16i%16i"), S("Won"), P(whiteColorEscape), allTimeStats.won, recentStats.won);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  sprintf(P(buf), S("%-30s%s%16.1f%16.1f"), S("Win Rate (%)"), P(whiteColorEscape), allTimeStats.winRate, recentStats.winRate);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  sprintf(P(buf), S("%-30s%s%16i%16i"), S("Escaped"), P(whiteColorEscape), allTimeStats.escaped, recentStats.escaped);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  sprintf(P(buf), S("%-30s%s%16i%16i"), S("Mastered"), P(whiteColorEscape), allTimeStats.mastered, recentStats.mastered);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  ++i;
  sprintf(P(buf), S("%-30s%s%16i%16i"), S("High Score"), P(whiteColorEscape), allTimeStats.highestScore, recentStats.highestScore);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  sprintf(P(buf), S("%-30s%s%16i%16i"), S("Most Gold"), P(whiteColorEscape), allTimeStats.mostGold, recentStats.mostGold);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  sprintf(P(buf), S("%-30s%s%16i%16i"), S("Most Lumenstones"), P(whiteColorEscape), allTimeStats.mostLumenstones, recentStats.mostLumenstones);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  ++i;
  sprintf(P(buf), S("%-30s%s%16i%16i"), S("Deepest Level"), P(whiteColorEscape), allTimeStats.deepestLevel, recentStats.deepestLevel);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  let allTimeAverageDepth = 0;
  let recentAverageDepth = 0;
  if (allTimeStats.games > 0) {
    allTimeAverageDepth = allTimeStats.cumulativeLevels / allTimeStats.games;
  }
  if (recentStats.games > 0) {
    recentAverageDepth = recentStats.cumulativeLevels / recentStats.games;
  }
  sprintf(P(buf), S("%-30s%s%16.1f%16.1f"), S("Average Depth"), P(whiteColorEscape), allTimeAverageDepth, recentAverageDepth);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  let allTimeFewestTurns = $cs("-", 20);
  let recentFewestTurns = $cs("-", 20);
  if (allTimeStats.fewestTurnsWin > 0) {
    sprintf(P(allTimeFewestTurns), S("%i"), allTimeStats.fewestTurnsWin);
  }
  if (recentStats.fewestTurnsWin > 0) {
    sprintf(P(recentFewestTurns), S("%i"), recentStats.fewestTurnsWin);
  }
  sprintf(P(buf), S("%-30s%s%16s%16s"), S("Shortest Win (Turns)"), P(whiteColorEscape), P(allTimeFewestTurns), P(recentFewestTurns));
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  ++i;
  sprintf(P(buf), S("%-30s%s%16i%16i"), S("Longest Win Streak"), P(whiteColorEscape), allTimeStats.longestWinStreak, recentStats.longestWinStreak);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  sprintf(P(buf), S("%-30s%s%16i%16i"), S("Longest Mastery Streak"), P(whiteColorEscape), allTimeStats.longestMasteryStreak, recentStats.longestMasteryStreak);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  ++i;
  sprintf(P(buf), S("%-30s%s%32i"), S("Current Win Streak"), P(whiteColorEscape), recentStats.currentWinStreak);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  sprintf(P(buf), S("%-30s%s%32i"), S("Current Mastery Streak"), P(whiteColorEscape), recentStats.currentMasteryStreak);
  printString(P(buf), offset << 16 >> 16, ++i << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  ++i;
  for (let i = 0; COLS > i; ++i) {
    for (let j = 0; ROWS > j; ++j) {
      $at2(dbuf.cells, i, j).opacity = INTERFACE_OPACITY;
    }
  }
  overlayDisplayBuffer(dbuf);
  let continueColor = G.black.$clone();
  applyColorAverage(continueColor, G.goodMessageColor, 100);
  printString(KEYBOARD_LABELS ? S("Press space or click to continue.") : S("Touch anywhere to continue."), ((COLS - strLenWithoutEscapes(KEYBOARD_LABELS ? S("Press space or click to continue.") : S("Touch anywhere to continue."))) / 2 | 0) << 16 >> 16, ROWS - 1, continueColor, G.black, null);
  commitDraws();
  if (recentStats.games > 0) {
    ++i;
    let buttons = $sarr(struct_brogueButton, 1);
    initializeButton(buttons[0]);
    if (KEYBOARD_LABELS) {
      sprintf(P(buttons[0].text), S("  %sR%seset  "), P(yellowColorEscape), P(whiteColorEscape));
    } else {
      strcpy(P(buttons[0].text), S("  Reset  "));
    }
    buttons[0].hotkey[0] = 82;
    buttons[0].hotkey[1] = 114;
    buttons[0].x = 74;
    buttons[0].y = i << 16 >> 16;
    if (await buttonInputLoop(buttons[0], 1, 74, 25, 10, 3, null) === 0 && await confirm(S("Reset recent stats?"), false_)) {
      saveResetRun();
    }
  } else {
    await waitForKeystrokeOrMouseClick();
  }
  restoreDisplayBuffer(rbuf);
}

export async function mainBrogueJunction(): Promise<void> {
  let theEvent = new struct_rogueEvent();
  let path = new Int8Array(4096);
  let buf = new Int8Array(100);
  let seedDefault = new Int8Array(100);
  let i = 0;
  let j = 0;
  let k = 0;
  for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
      $at2(G.displayBuffer.cells, i, j).character = 0;
      $at2(G.displayBuffer.cells, i, j).opacity = 100;
      for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
        $at2(G.displayBuffer.cells, i, j).foreColorComponents[k] = 0;
        $at2(G.displayBuffer.cells, i, j).backColorComponents[k] = 0;
      }
      plotCharWithColor(32, struct_windowpos.$of(i, j), G.black, G.black);
    }
  }
  initializeGameVariant();
  initializeLaunchArguments(P(G.rogue, "nextGame"), P(G.rogue.nextGamePath), P(G.rogue, "nextGameSeed"));
  do {
    G.rogue.gameHasEnded = false_;
    G.rogue.playbackFastForward = false_;
    G.rogue.playbackMode = false_;
    switch (G.rogue.nextGame >>> 0) {
    case NG_NOTHING:
      await titleMenu();
      break;
    case NG_GAME_VARIANT:
      G.rogue.nextGame = NG_NOTHING;
      initializeGameVariant();
      break;
    case NG_NEW_GAME:
    case NG_NEW_GAME_WITH_SEED:
      G.rogue.nextGamePath[0] = 0;
      G.randomNumbersGenerated = 0;
      G.rogue.playbackMode = false_;
      G.rogue.playbackFastForward = false_;
      G.rogue.playbackBetweenTurns = false_;
      getAvailableFilePath(P(path), S("LastGame"), S(".broguesave"));
      strcat(P(path), S(".broguesave"));
      strcpy(P(G.currentFilePath), P(path));
      if (G.rogue.nextGame >>> 0 === NG_NEW_GAME_WITH_SEED) {
        if (G.rogue.nextGameSeed === 0n) {
          if (G.previousGameSeed === 0n) {
            seedDefault[0] = 0;
          } else {
            sprintf(P(seedDefault), S("%llu"), G.previousGameSeed);
          }
          if (await getInputTextString(P(buf), S("Generate dungeon with seed number:"), 20, P(seedDefault), S(""), TEXT_INPUT_NUMBERS, true_) && buf[0] !== 0) {
            if (!tryParseUint64(P(buf), P(G.rogue, "nextGameSeed"))) {
              G.rogue.nextGameSeed = 18446744073709551615n;
            }
          } else {
            G.rogue.nextGame = NG_NOTHING;
            break;
          }
        }
      } else {
        G.rogue.nextGameSeed = 0n;
      }
      G.rogue.nextGame = NG_NOTHING;
      await initializeRogue(G.rogue.nextGameSeed);
      await startLevel(G.rogue.depthLevel, 1);
      await mainInputLoop();
      if (G.serverMode) {
        G.rogue.nextGame = NG_QUIT;
      }
      freeEverything();
      break;
    case NG_OPEN_GAME:
      G.rogue.nextGame = NG_NOTHING;
      path[0] = 0;
      if (G.rogue.nextGamePath[0]) {
        strcpy(P(path), P(G.rogue.nextGamePath));
        strcpy(P(G.rogue.currentGamePath), P(G.rogue.nextGamePath));
        G.rogue.nextGamePath[0] = 0;
      } else {
        await dialogChooseFile(P(path), S(".broguesave"), S("Open saved game:"));
      }
      if (openFile(P(path))) {
        if (await loadSavedGame()) {
          await mainInputLoop();
        }
        freeEverything();
      } else {
      }
      G.rogue.playbackMode = false_;
      G.rogue.playbackOOS = false_;
      if (G.serverMode) {
        G.rogue.nextGame = NG_QUIT;
      }
      break;
    case NG_VIEW_RECORDING:
      G.rogue.nextGame = NG_NOTHING;
      path[0] = 0;
      if (G.rogue.nextGamePath[0]) {
        strcpy(P(path), P(G.rogue.nextGamePath));
        strcpy(P(G.rogue.currentGamePath), P(G.rogue.nextGamePath));
        G.rogue.nextGamePath[0] = 0;
      } else {
        await dialogChooseFile(P(path), S(".broguerec"), S("View recording:"));
      }
      if (openFile(P(path))) {
        G.randomNumbersGenerated = 0;
        G.rogue.playbackMode = true_;
        await initializeRogue(0n);
        if (!G.rogue.gameHasEnded) {
          await startLevel(G.rogue.depthLevel, 1);
          if (G.nonInteractivePlayback) {
            G.rogue.playbackPaused = false_;
          } else {
            G.rogue.playbackPaused = true_;
          }
          await displayAnnotation();
        }
        while (!G.rogue.gameHasEnded && G.rogue.playbackMode) {
          if (G.rogue.playbackPaused) {
            G.rogue.playbackPaused = false_;
            await pausePlayback();
          }
          G.rogue.RNG = RNG_COSMETIC;
          G.rogue.playbackBetweenTurns = true_;
          await nextBrogueEvent(theEvent, false_, true_, false_);
          G.rogue.RNG = RNG_SUBSTANTIVE;
          await executeEvent(theEvent);
        }
        freeEverything();
      } else {
      }
      G.rogue.playbackMode = false_;
      G.rogue.playbackOOS = false_;
      if (G.serverMode || G.nonInteractivePlayback) {
        G.rogue.nextGame = NG_QUIT;
      }
      break;
    case NG_HIGH_SCORES:
      G.rogue.nextGame = NG_NOTHING;
      await printHighScores(false_);
      break;
    case NG_GAME_STATS:
      G.rogue.nextGame = NG_NOTHING;
      await viewGameStats();
      break;
    case NG_QUIT:
      break;
    default:
      break;
    }
  } while (G.rogue.nextGame >>> 0 !== NG_QUIT);
}

export function $init(): void {
}
