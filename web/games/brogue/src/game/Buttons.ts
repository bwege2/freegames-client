// @ts-nocheck
// Brogue CE 1.15.1 Buttons.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { strLenWithoutEscapes } from './Combat.ts';
import { applyColorAverage, bakeColor, clearDisplayBuffer, decodeMessageColor, encodeMessageColor, nextBrogueEvent, overlayDisplayBuffer, pauseAnimation, pauseBrogue, plotCharToBuffer, restoreDisplayBuffer, saveDisplayBuffer, separateColors } from './IO.ts';
import { struct_PauseBehavior, struct_brogueButton, struct_buttonState, struct_pcell, struct_pos, struct_rogueEvent, struct_screenDisplayBuffer, struct_tcell, struct_windowpos } from './structs.ts';
import { $at2, $cs, $sadd, $sarr, $sat, G, P, memset, sin, snprintf, strcat, strcpy, strncpy } from '../rt/index.ts';
import { ACKNOWLEDGE_KEY, BUTTON_HOVER, BUTTON_NORMAL, BUTTON_PRESSED, BUTTON_TEXT_SIZE, B_DRAW, B_ENABLED, B_GRADIENT, B_HOVER_ENABLED, B_KEYPRESS_HIGHLIGHT, B_WIDE_CLICK_AREA, COLOR_ESCAPE, COLS, DCOLS, DROWS, ESCAPE_KEY, KEYBOARD_LABELS, KEYSTROKE, MESSAGE_LINES, MOUSE_DOWN, MOUSE_ENTERED_CELL, MOUSE_UP, RNG_COSMETIC, ROWS, STAT_BAR_WIDTH, false_, true_ } from './consts.ts';


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

export function smoothHiliteGradient(currentXValue: number, maxXValue: number): number {
  return Math.trunc(100 * sin(3.1415926500000002 * currentXValue / maxXValue)) << 16 >> 16;
}

export function drawButton(button: struct_brogueButton | null, highlight: number, dbuf: struct_screenDisplayBuffer | null): void {
  if (!((button.flags & B_DRAW) >>> 0)) {
    return;
  }
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  let width = strLenWithoutEscapes(P(button.text));
  let bColorBase = button.buttonColor.$clone();
  let fColorBase = ((button.flags & B_ENABLED) >>> 0 ? G.white : G.gray).$clone();
  if (highlight >>> 0 === BUTTON_HOVER && (button.flags & B_HOVER_ENABLED) >>> 0) {
    applyColorAverage(fColorBase, G.buttonHoverColor, 25);
    applyColorAverage(bColorBase, G.buttonHoverColor, 25);
  }
  let bColorEdge = bColorBase.$clone();
  let bColorMid = bColorBase.$clone();
  applyColorAverage(bColorEdge, G.black, 50);
  if (highlight >>> 0 === BUTTON_PRESSED) {
    applyColorAverage(bColorMid, G.black, 75);
    if (50 > Math.imul(bColorMid.red - bColorBase.red, bColorMid.red - bColorBase.red) * 0.21260000000000001 + Math.imul(bColorMid.green - bColorBase.green, bColorMid.green - bColorBase.green) * 0.71519999999999995 + Math.imul(bColorMid.blue - bColorBase.blue, bColorMid.blue - bColorBase.blue) * 0.0722) {
      bColorMid.$cp(bColorBase);
      applyColorAverage(bColorMid, G.buttonHoverColor, 50);
    }
  }
  let bColor = bColorMid.$clone();
  let opacity = button.opacity;
  if (highlight >>> 0 === BUTTON_HOVER || highlight >>> 0 === BUTTON_PRESSED) {
    opacity = 100 - (Math.imul(100 - opacity, opacity) / 100 | 0) << 16 >> 16;
  }
  let symbolNumber = 0;
  for (let i = 0, textLoc = 0; width > i && COLS > i + button.x; ++i, ++textLoc) {
    while (button.text[textLoc] === COLOR_ESCAPE) {
      textLoc = decodeMessageColor(P(button.text), textLoc << 16 >> 16, fColorBase);
    }
    let fColor = fColorBase.$clone();
    if ((button.flags & B_GRADIENT) >>> 0) {
      let midPercent = smoothHiliteGradient(i << 16 >> 16, width - 1 << 16 >> 16);
      bColor.$cp(bColorEdge);
      applyColorAverage(bColor, bColorMid, midPercent << 16 >> 16);
    }
    if (highlight >>> 0 === BUTTON_PRESSED) {
      applyColorAverage(fColor, bColor, 30);
    }
    if (100 > button.opacity) {
      applyColorAverage(fColor, bColor, 100 - opacity << 16 >> 16);
    }
    bakeColor(fColor);
    bakeColor(bColor);
    separateColors(fColor, bColor);
    let displayCharacter = button.text[textLoc];
    if (button.text[textLoc] === 42) {
      if (button.symbol[symbolNumber]) {
        displayCharacter = button.symbol[symbolNumber];
      }
      symbolNumber = symbolNumber + 1 << 16 >> 16;
    }
    if (locIsInWindow(struct_windowpos.$of(button.x + i << 16 >> 16, button.y))) {
      plotCharToBuffer(displayCharacter, struct_windowpos.$of(button.x + i << 16 >> 16, button.y), fColor, bColor, dbuf);
      if (dbuf) {
        $at2(dbuf.cells, button.x + i, button.y).opacity = opacity << 24 >> 24;
      }
    }
  }
  G.rogue.RNG = oldRNG;
  ;
}

export function initializeButton(button: struct_brogueButton | null): void {
  memset(button, 0, 856);
  button.text[0] = 0;
  button.flags = (button.flags | (B_ENABLED | B_GRADIENT | B_HOVER_ENABLED | B_DRAW | B_KEYPRESS_HIGHLIGHT)) >>> 0;
  button.buttonColor.$cp(G.interfaceButtonColor);
  button.opacity = 100;
  button.textColor.$cp(G.white);
  button.hotkeytextColor.$cp(KEYBOARD_LABELS ? G.itemMessageColor : G.white);
}

export function setButtonText(button: struct_brogueButton | null, textWithHotkey: Ptr | null, textWithoutHotkey: Ptr | null): void {
  let textColorEscape = $cs("", 5);
  let hotkeyColorEscape = $cs("", 5);
  let textBuf = new Int8Array(300);
  let textBuf2 = new Int8Array(300);
  encodeMessageColor(P(textColorEscape), 0, button.textColor);
  encodeMessageColor(P(hotkeyColorEscape), 0, button.hotkeytextColor);
  strcpy(P(textBuf), P(textColorEscape));
  if (KEYBOARD_LABELS) {
    snprintf(P(textBuf2), BUTTON_TEXT_SIZE - 5 - 1, textWithHotkey, P(hotkeyColorEscape), P(textColorEscape));
  } else {
    strncpy(P(textBuf2), textWithoutHotkey, BUTTON_TEXT_SIZE - 1);
  }
  strcat(P(textBuf), P(textBuf2));
  strncpy(P(button.text), P(textBuf), BUTTON_TEXT_SIZE - 1);
}

export function drawButtonsInState(state: struct_buttonState | null, dbuf: struct_screenDisplayBuffer | null): void {
  for (let i = 0; state.buttonCount > i; ++i) {
    if ((state.buttons[i].flags & B_DRAW) >>> 0) {
      let buttonDrawState = BUTTON_NORMAL;
      if (i === state.buttonFocused) {
        buttonDrawState = BUTTON_HOVER;
      }
      if (i === state.buttonDepressed) {
        buttonDrawState = BUTTON_PRESSED;
      }
      drawButton($sat(state.buttons, i), buttonDrawState, dbuf);
    }
  }
}

export function initializeButtonState(state: struct_buttonState | null, buttons: struct_brogueButton | null, buttonCount: number, winX: number, winY: number, winWidth: number, winHeight: number): void {
  state.buttonChosen = state.buttonFocused = state.buttonDepressed = -1;
  state.buttonCount = buttonCount;
  state.winX = winX;
  state.winY = winY;
  state.winWidth = winWidth;
  state.winHeight = winHeight;
  for (let i = 0; state.buttonCount > i; ++i) {
    state.buttons[i].$cp($sadd(buttons, i));
  }
}

export async function processButtonInput(state: struct_buttonState | null, canceled: Ptr | null, event: struct_rogueEvent | null): Promise<number> {
  let buttonUsed = false_;
  if (event.eventType >>> 0 === MOUSE_DOWN || event.eventType >>> 0 === MOUSE_UP || event.eventType >>> 0 === MOUSE_ENTERED_CELL) {
    let x = event.param1 | 0;
    let y = event.param2 | 0;
    if (state.buttonFocused >= 0) {
      state.buttonFocused = -1;
    }
    let focusIndex = 0;
    for (focusIndex = 0; state.buttonCount > focusIndex; ++focusIndex) {
      if ((state.buttons[focusIndex].flags & B_DRAW) >>> 0 && (state.buttons[focusIndex].flags & B_ENABLED) >>> 0 && (state.buttons[focusIndex].y === y || (state.buttons[focusIndex].flags & B_WIDE_CLICK_AREA) >>> 0 && Math.abs(state.buttons[focusIndex].y - y) <= 1) && x >= state.buttons[focusIndex].x && x < state.buttons[focusIndex].x + strLenWithoutEscapes(P(state.buttons[focusIndex].text))) {
        state.buttonFocused = focusIndex << 16 >> 16;
        if (event.eventType >>> 0 === MOUSE_DOWN) {
          state.buttonDepressed = focusIndex << 16 >> 16;
        }
        break;
      }
    }
    if (focusIndex === state.buttonCount) {
      state.buttonFocused = -1;
    }
    if (event.eventType >>> 0 === MOUSE_UP) {
      if (state.buttonDepressed === state.buttonFocused && state.buttonFocused >= 0) {
        buttonUsed = true_;
      } else {
        if (0 > state.buttonDepressed && !(x >= state.winX && state.winX + state.winWidth > x && y >= state.winY && state.winY + state.winHeight > y)) {
          if (canceled) {
            canceled.a[canceled.o] = true_;
          }
        }
        state.buttonDepressed = -1;
      }
    }
  }
  if (event.eventType >>> 0 === KEYSTROKE) {
    for (let i = 0; state.buttonCount > i; ++i) {
      for (let k = 0; 10 > k && state.buttons[i].hotkey[k]; ++k) {
        if (event.param1 === state.buttons[i].hotkey[k]) {
          if ((state.buttons[i].flags & B_DRAW) >>> 0) {
            if ((state.buttons[i].flags & B_KEYPRESS_HIGHLIGHT) >>> 0) {
              let rbuf = saveDisplayBuffer().$clone();
              let dbuf = new struct_screenDisplayBuffer();
              clearDisplayBuffer(dbuf);
              drawButtonsInState(state, dbuf);
              overlayDisplayBuffer(dbuf);
              if (!G.rogue.playbackMode || G.rogue.playbackPaused) {
                await pauseBrogue(50, struct_PauseBehavior.$of());
              } else {
                await pauseAnimation(1000, struct_PauseBehavior.$of());
              }
              restoreDisplayBuffer(rbuf);
            }
          }
          state.buttonDepressed = i << 16 >> 16;
          buttonUsed = true_;
          break;
        }
      }
    }
    if (!buttonUsed && (event.param1 === ESCAPE_KEY || event.param1 === ACKNOWLEDGE_KEY)) {
      if (canceled) {
        canceled.a[canceled.o] = true_;
      }
    }
  }
  if (buttonUsed) {
    state.buttonChosen = state.buttonDepressed;
    return state.buttonChosen;
  } else {
    return -1;
  }
}

export async function buttonInputLoop(buttons: struct_brogueButton | null, buttonCount: number, winX: number, winY: number, winWidth: number, winHeight: number, returnEvent: struct_rogueEvent | null): Promise<number> {
  let button = 0;
  const canceled = new Int8Array(1);
  let theEvent = new struct_rogueEvent();
  let state = struct_buttonState.$of(0, 0, 0, 0, $sarr(struct_brogueButton, 50));
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  canceled[0] = false_;
  initializeButtonState(state, buttons, buttonCount, winX, winY, winWidth, winHeight);
  do {
    let dbuf = new struct_screenDisplayBuffer();
    clearDisplayBuffer(dbuf);
    drawButtonsInState(state, dbuf);
    let rbuf = saveDisplayBuffer().$clone();
    overlayDisplayBuffer(dbuf);
    await nextBrogueEvent(theEvent, true_, false_, false_);
    button = await processButtonInput(state, P(canceled, 0), theEvent);
    restoreDisplayBuffer(rbuf);
  } while (button === -1 && !canceled[0]);
  if (returnEvent) {
    returnEvent.$cp(theEvent);
  }
  G.rogue.RNG = oldRNG;
  ;
  return button;
}

export function $init(): void {
}
