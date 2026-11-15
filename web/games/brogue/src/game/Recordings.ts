// @ts-nocheck
// Brogue CE 1.15.1 Recordings.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { blackOutScreen, clearDisplayBuffer, commitDraws, confirm, confirmMessages, displayFeatsScreen, displayLevel, displayMessageArchive, displayMoreSign, encodeMessageColor, flashTemporaryAlert, getInputTextString, mainInputLoop, message, messageWithColor, nextBrogueEvent, overlayDisplayBuffer, pauseBrogue, printDiscoveriesScreen, printProgressBar, printSeed, printString, printTextBox, rectangularShading, refreshSideBar, restoreDisplayBuffer, saveDisplayBuffer, stripShiftFromMovementKeystroke, updateMessageDisplay, waitForAcknowledgment } from './IO.ts';
import { displayInventory } from './Items.ts';
import { dialogAlert, dialogChooseFile } from './MainMenu.ts';
import { rand_range, seedRandomGenerator } from './Math.ts';
import { chooseFile, executeEvent, fileExists, freeEverything, initializeRogue, openFile, startLevel } from './RogueMain.ts';
import { notifyEvent, setGraphicsMode } from './platformdependent.ts';
import { struct_PauseBehavior, struct_pcell, struct_pos, struct_rogueEvent, struct_screenDisplayBuffer, struct_tcell, struct_windowpos } from './structs.ts';
import { $at2, $cs, $rows, $sat, $ta, $u64, G, P, S, fclose, feof, fgets, fopen, fprintf, fread, fscanf, fseek, ftell, fwrite, printf, putc, remove, rename, rewind, snprintf, sprintf, sscanf, strcat, strcmp, strcpy, strlen } from '../rt/index.ts';
import { ACKNOWLEDGE_KEY, ALL_ITEMS, APPLY_KEY, ASCEND_KEY, AUTOPLAY_KEY, AUTO_REST_KEY, BROGUE_HELP_KEY, BROGUE_PATCH, CALL_KEY, COLS, DCOLS, DEFAULT_PLAYBACK_DELAY, DELETE_KEY, DELETE_SAVE_FILE_AFTER_LOADING, DESCEND_KEY, DISCOVERIES_KEY, DOWNLEFT_KEY, DOWNRIGHT_KEY, DOWN_ARROW, DOWN_KEY, DROP_KEY, DROWS, EASY_MODE_KEY, END_OF_RECORDING, EQUIP_KEY, ESCAPE_KEY, EVENT_ERROR, EXIT_STATUS_FAILURE_RECORDING_OOS, EXIT_STATUS_FAILURE_RECORDING_WRONG_VERSION, EXIT_STATUS_SUCCESS, EXPLORE_KEY, FEATS_KEY, GAMEOVER_RECORDING, GAME_MODE_EASY, GAME_MODE_WIZARD, HYBRID_GRAPHICS, INPUT_RECORD_BUFFER, INPUT_RECORD_BUFFER_MAX_SIZE, INTERFACE_OPACITY, INVENTORY_KEY, KEYBOARD_LABELS, KEYSTROKE, LEFT_ARROW, LEFT_KEY, MAX_TEXT_INPUT_FILENAME_LENGTH, MB_IS_DYING, MESSAGE_LINES, MOUSE_DOWN, MOUSE_ENTERED_CELL, MOUSE_UP, NG_NEW_GAME, NG_OPEN_GAME, NG_VIEW_RECORDING, NUMPAD_0, NUMPAD_1, NUMPAD_2, NUMPAD_3, NUMPAD_4, NUMPAD_5, NUMPAD_6, NUMPAD_7, NUMPAD_8, NUMPAD_9, PERIOD_KEY, PLAYBACK_HELP_LINE_COUNT, RECORDING_HEADER_LENGTH, RECORDING_SEEK_MODE_DEPTH, RECORDING_SEEK_MODE_TURN, RELABEL_KEY, REQUIRE_ACKNOWLEDGMENT, REST_KEY, RETURN_KEY, RIGHT_ARROW, RIGHT_KEY, RIGHT_MOUSE_DOWN, RIGHT_MOUSE_UP, RNG_CHECK, RNG_COSMETIC, RNG_SUBSTANTIVE, ROWS, SAVED_GAME_LOADED, SEARCH_KEY, SEED_KEY, SEEK_SET, STAT_BAR_WIDTH, TAB_KEY, TEXT_GRAPHICS, TEXT_INPUT_FILENAME, TEXT_INPUT_NUMBERS, THROW_KEY, TILES_GRAPHICS, UNEQUIP_KEY, UNKNOWN_KEY, UPLEFT_KEY, UPRIGHT_KEY, UP_ARROW, UP_KEY, VIEW_RECORDING_KEY, false_, true_ } from './consts.ts';

let keystrokeTable: any;
let keystrokeCount: number;

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

function recordChar(c: number): void {
  let $t1: any, $t2: any;
  if (INPUT_RECORD_BUFFER_MAX_SIZE > G.locationInRecordingBuffer) {
    G.inputRecordBuffer[($t2 = G.locationInRecordingBuffer, G.locationInRecordingBuffer = $t2 + 1 & 0xffff, $t2)] = c;
    G.recordingLocation = $u64(G.recordingLocation + 1);
  } else {
    printf(S("Recording buffer length exceeded at location %li! Turn number %li.\n"), G.recordingLocation - 1, G.rogue.playerTurnNumber);
  }
}

function considerFlushingBufferToFile(): void {
  if (G.locationInRecordingBuffer >= INPUT_RECORD_BUFFER) {
    flushBufferToFile();
  }
}

function compressKeystroke(c: number): number {
  let i = 0;
  for (i = 0; keystrokeCount > i; i = i + 1 << 16 >> 16) {
    if (keystrokeTable[i] === c) {
      return 128 + i & 0xff;
    }
  }
  if (256 > c) {
    return c & 0xff;
  }
  return UNKNOWN_KEY;
}

function numberToString(number: bigint, numberOfBytes: number, recordTo: Ptr | null): void {
  let i = 0;
  let n = 0n;
  n = number;
  for (i = numberOfBytes - 1 << 16 >> 16; i >= 0; i = i - 1 << 16 >> 16) {
    recordTo.a[recordTo.o + i] = Number(BigInt.asUintN(8, n % 256n));
    n = n / 256n;
  }
  ;
}

function recordNumber(number: number, numberOfBytes: number): void {
  let i = 0;
  let c = new Uint8Array(10);
  numberToString(BigInt.asUintN(64, BigInt(number)), numberOfBytes, P(c));
  for (i = 0; numberOfBytes > i; i = i + 1 << 16 >> 16) {
    recordChar(c[i]);
  }
}

export function recordEvent(event: struct_rogueEvent | null): void {
  let c = 0;
  if (G.rogue.playbackMode) {
    return;
  }
  recordChar(event.eventType & 0xff);
  if (event.eventType >>> 0 === KEYSTROKE) {
    c = compressKeystroke(event.param1);
    if (c === UNKNOWN_KEY) {
      return;
    }
    recordChar(c);
  } else {
    recordChar(event.param1 & 0xff);
    recordChar(event.param2 & 0xff);
  }
  c = 0;
  if (event.controlKey) {
    c = c + 2 & 0xff;
  }
  if (event.shiftKey) {
    c = c + 4 & 0xff;
  }
  recordChar(c);
}

export function recordKeystroke(keystroke: number, controlKey: number, shiftKey: number): void {
  let theEvent = new struct_rogueEvent();
  if (G.rogue.playbackMode) {
    return;
  }
  theEvent.eventType = KEYSTROKE;
  theEvent.param1 = keystroke;
  theEvent.controlKey = controlKey;
  theEvent.shiftKey = shiftKey;
  recordEvent(theEvent);
}

export function cancelKeystroke(): void {
  ;
  G.locationInRecordingBuffer = G.locationInRecordingBuffer - 3 & 0xffff;
  G.recordingLocation = G.recordingLocation - 3;
}

export function recordKeystrokeSequence(keystrokeSequence: Ptr | null): void {
  let i = 0;
  for (i = 0; keystrokeSequence.a[keystrokeSequence.o + i] !== 0; i = i + 1 << 16 >> 16) {
    recordKeystroke(keystrokeSequence.a[keystrokeSequence.o + i], false_, false_);
  }
}

export function recordMouseClick(x: number, y: number, controlKey: number, shiftKey: number): void {
  let theEvent = new struct_rogueEvent();
  if (G.rogue.playbackMode) {
    return;
  }
  theEvent.eventType = MOUSE_UP;
  theEvent.param1 = x;
  theEvent.param2 = y;
  theEvent.controlKey = controlKey;
  theEvent.shiftKey = shiftKey;
  recordEvent(theEvent);
}

function writeHeaderInfo(path: Ptr | null): void {
  let c = new Uint8Array(36);
  let i = 0;
  let recordFile = null;
  for (i = 0; RECORDING_HEADER_LENGTH > i; i = i + 1 << 16 >> 16) {
    c[i] = 0;
  }
  for (i = 0; G.rogue.versionString[i] !== 0; i = i + 1 << 16 >> 16) {
    c[i] = G.rogue.versionString[i] & 0xff;
  }
  c[15] = G.rogue.mode & 0xff;
  i = 16;
  numberToString(G.rogue.seed, 8, P(c, i));
  i = i + 8 << 16 >> 16;
  numberToString(BigInt.asUintN(64, BigInt(G.rogue.playerTurnNumber)), 4, P(c, i));
  i = i + 4 << 16 >> 16;
  numberToString(BigInt.asUintN(64, BigInt(G.rogue.deepestLevel)), 4, P(c, i));
  i = i + 4 << 16 >> 16;
  numberToString(BigInt.asUintN(64, BigInt(G.lengthOfPlaybackFile)), 4, P(c, i));
  i = i + 4 << 16 >> 16;
  if (!fileExists(path)) {
    recordFile = fopen(path, S("wb"));
    if (recordFile) {
      fclose(recordFile);
    }
  }
  recordFile = fopen(path, S("r+b"));
  rewind(recordFile);
  for (i = 0; RECORDING_HEADER_LENGTH > i; i = i + 1 << 16 >> 16) {
    putc(c[i], recordFile);
  }
  if (recordFile) {
    fclose(recordFile);
  }
  if (RECORDING_HEADER_LENGTH > G.lengthOfPlaybackFile) {
    G.lengthOfPlaybackFile = RECORDING_HEADER_LENGTH;
  }
}

export function flushBufferToFile(): void {
  if (G.rogue.playbackMode) {
    return;
  }
  if ((!G.currentFilePath[0] ? 1 : 0) === 0) {
    let i = 0;
    let recordFile = null;
    G.lengthOfPlaybackFile = G.lengthOfPlaybackFile + G.locationInRecordingBuffer;
    writeHeaderInfo(P(G.currentFilePath));
    if (G.locationInRecordingBuffer !== 0) {
      recordFile = fopen(P(G.currentFilePath), S("ab"));
      for (i = 0; G.locationInRecordingBuffer > i; i = i + 1 << 16 >> 16) {
        putc(G.inputRecordBuffer[i], recordFile);
      }
      if (recordFile) {
        fclose(recordFile);
      }
    }
  }
  G.locationInRecordingBuffer = 0;
}

export function fillBufferFromFile(): void {
  let recordFile = null;
  recordFile = fopen(P(G.currentFilePath), S("rb"));
  fseek(recordFile, G.positionInPlaybackFile, SEEK_SET);
  fread(P(G.inputRecordBuffer), 1, INPUT_RECORD_BUFFER, recordFile);
  G.positionInPlaybackFile = $u64(ftell(recordFile));
  fclose(recordFile);
  G.locationInRecordingBuffer = 0;
}

function recallChar(): number {
  let $t1: any, $t2: any;
  let c = 0;
  if (G.recordingLocation > G.lengthOfPlaybackFile) {
    return END_OF_RECORDING;
  }
  c = G.inputRecordBuffer[($t2 = G.locationInRecordingBuffer, G.locationInRecordingBuffer = $t2 + 1 & 0xffff, $t2)];
  G.recordingLocation = $u64(G.recordingLocation + 1);
  if (G.locationInRecordingBuffer >= INPUT_RECORD_BUFFER) {
    fillBufferFromFile();
  }
  return c;
}

function uncompressKeystroke(c: number): number {
  if (c >= 128 && keystrokeCount > c - 128) {
    return keystrokeTable[c - 128];
  }
  return c;
}

function recallNumber(numberOfBytes: number): bigint {
  let i = 0;
  let n = 0n;
  n = 0n;
  for (i = 0; numberOfBytes > i; i = i + 1 << 16 >> 16) {
    n = BigInt.asUintN(64, n * 256n);
    n = BigInt.asUintN(64, n + BigInt.asUintN(64, BigInt(recallChar())));
  }
  return n;
}

async function playbackPanic(): Promise<void> {
  if (!G.rogue.playbackOOS) {
    G.rogue.playbackFastForward = false_;
    G.rogue.playbackPaused = true_;
    G.rogue.playbackOOS = true_;
    G.rogue.creaturesWillFlashThisTurn = false_;
    blackOutScreen();
    await displayLevel();
    await refreshSideBar(-1, -1, false_);
    confirmMessages();
    await message(S("Playback is out of sync."), 0);
    let rbuf = saveDisplayBuffer().$clone();
    await printTextBox(S("Playback of the recording has diverged from the originally recorded game.\n\nThis could be caused by recording or playing the file on a modified version of Brogue, or it could simply be the result of a bug.\n\nIf this is a different computer from the one on which the recording was saved, the recording might succeed on the original computer."), 0, 0, 0, G.white, G.black, null, 0);
    G.rogue.playbackMode = false_;
    await displayMoreSign();
    G.rogue.playbackMode = true_;
    restoreDisplayBuffer(rbuf);
    if (G.nonInteractivePlayback) {
      G.rogue.gameHasEnded = true_;
    }
    G.rogue.gameExitStatusCode = EXIT_STATUS_FAILURE_RECORDING_OOS;
    printf(S("Playback panic at location %li! Turn number %li.\n"), G.recordingLocation - 1, G.rogue.playerTurnNumber);
    restoreDisplayBuffer(rbuf);
    await mainInputLoop();
  }
}

export async function recallEvent(event: struct_rogueEvent | null): Promise<void> {
  let c = 0;
  let tryAgain = 0;
  do {
    tryAgain = false_;
    c = recallChar();
    event.eventType = c;
    switch (c) {
    case KEYSTROKE:
      event.param1 = uncompressKeystroke(recallChar());
      event.param2 = 0;
      break;
    case SAVED_GAME_LOADED:
      tryAgain = true_;
      await flashTemporaryAlert(S(" Saved game loaded "), 1000);
      break;
    case MOUSE_UP:
    case MOUSE_DOWN:
    case MOUSE_ENTERED_CELL:
    case RIGHT_MOUSE_UP:
    case RIGHT_MOUSE_DOWN:
      event.param1 = recallChar();
      event.param2 = recallChar();
      break;
    case RNG_CHECK:
    case END_OF_RECORDING:
    case EVENT_ERROR:
    default:
      await message(S("Unrecognized event type in playback."), REQUIRE_ACKNOWLEDGMENT);
      printf(S("Unrecognized event type in playback: event ID %i"), c);
      tryAgain = true_;
      await playbackPanic();
      break;
    }
  } while (tryAgain && !G.rogue.gameHasEnded);
  c = recallChar();
  event.controlKey = ((c & 2) >>> 0 ? true_ : false_) << 24 >> 24;
  event.shiftKey = ((c & 4) >>> 0 ? true_ : false_) << 24 >> 24;
}

function loadNextAnnotation(): void {
  const currentReadTurn = new Float64Array(1);
  let i = 0;
  let annotationFile = null;
  if (G.rogue.nextAnnotationTurn === -1 >>> 0) {
    return;
  }
  annotationFile = fopen(P(G.annotationPathname), S("r"));
  fseek(annotationFile, G.rogue.locationInAnnotationFile, SEEK_SET);
  for (; ; ) {
    if (fscanf(annotationFile, S("%lu\t"), P(currentReadTurn, 0)) !== 1) {
      if (feof(annotationFile)) {
        G.rogue.nextAnnotation[0] = 0;
        G.rogue.nextAnnotationTurn = -1 >>> 0;
        break;
      } else {
        fgets(P(G.rogue.nextAnnotation), 5000, annotationFile);
        continue;
      }
    }
    fgets(P(G.rogue.nextAnnotation), 5000, annotationFile);
    if (currentReadTurn[0] > G.rogue.playerTurnNumber || 1 >= currentReadTurn[0] && 1 >= G.rogue.playerTurnNumber && currentReadTurn[0] >= G.rogue.playerTurnNumber) {
      G.rogue.nextAnnotationTurn = currentReadTurn[0];
      G.rogue.nextAnnotation[strlen(P(G.rogue.nextAnnotation)) - 1] = 0;
      for (i = 0; 5000 > i && G.rogue.nextAnnotation[i]; i = i + 1 << 16 >> 16) {
        if (32 > G.rogue.nextAnnotation[i] || G.rogue.nextAnnotation[i] > 126) {
          G.rogue.nextAnnotation[i] = 32;
        }
      }
      break;
    }
  }
  G.rogue.locationInAnnotationFile = $u64(ftell(annotationFile));
  fclose(annotationFile);
}

export async function displayAnnotation(): Promise<void> {
  if (G.rogue.playbackMode && G.rogue.playerTurnNumber === G.rogue.nextAnnotationTurn) {
    if (!G.rogue.playbackFastForward) {
      await refreshSideBar(-1, -1, false_);
      let rbuf = saveDisplayBuffer().$clone();
      await printTextBox(P(G.rogue.nextAnnotation), G.player.loc.x, 0, 0, G.black, G.white, null, 0);
      G.rogue.playbackMode = false_;
      await displayMoreSign();
      G.rogue.playbackMode = true_;
      restoreDisplayBuffer(rbuf);
    }
    loadNextAnnotation();
  }
}

function getPatchVersion(versionString: Ptr | null, patchVersion: Ptr | null): number {
  return (sscanf(versionString, G.gameConst.patchVersionPattern, patchVersion) === 1 ? 1 : 0) << 24 >> 24;
}

export async function initRecording(): Promise<void> {
  if (G.currentFilePath[0] === 0) {
    return;
  }
  let i = 0;
  let mode = 0;
  const recPatch = new Uint16Array(1);
  let buf = new Int8Array(1000);
  let versionString = P(G.rogue.versionString);
  let recordFile = null;
  G.locationInRecordingBuffer = 0;
  G.positionInPlaybackFile = 0;
  G.recordingLocation = 0;
  G.maxLevelChanges = 0;
  G.rogue.playbackOOS = false_;
  G.rogue.playbackOmniscience = false_;
  G.rogue.nextAnnotationTurn = 0;
  G.rogue.nextAnnotation[0] = 0;
  G.rogue.locationInAnnotationFile = 0;
  G.rogue.patchVersion = 0;
  if (G.rogue.playbackMode) {
    G.lengthOfPlaybackFile = 100000;
    G.rogue.playbackDelayPerTurn = DEFAULT_PLAYBACK_DELAY;
    G.rogue.playbackDelayThisTurn = G.rogue.playbackDelayPerTurn;
    G.rogue.playbackPaused = false_;
    fillBufferFromFile();
    for (i = 0; 15 > i; i = i + 1 << 16 >> 16) {
      versionString.a[versionString.o + i] = recallChar() << 24 >> 24;
    }
    G.rogue.mode = recallChar();
    if (getPatchVersion(versionString, P(recPatch, 0)) && G.gameConst.patchVersion >= recPatch[0]) {
      G.rogue.patchVersion = recPatch[0];
    } else if (strcmp(versionString, G.gameConst.recordingVersionString) !== 0) {
      G.rogue.playbackMode = false_;
      G.rogue.playbackFastForward = false_;
      if (!G.nonInteractivePlayback) {
        snprintf(P(buf), 1000, S("This file is from version %s and cannot be opened in version %s."), versionString, G.gameConst.versionString);
        await dialogAlert(P(buf));
      } else {
        printf(S("This file is from version %s and cannot be opened in version %s."), versionString, G.gameConst.versionString);
      }
      G.rogue.playbackMode = true_;
      G.rogue.playbackPaused = true_;
      G.rogue.playbackFastForward = false_;
      G.rogue.playbackOOS = false_;
      G.rogue.gameHasEnded = true_;
      G.rogue.gameExitStatusCode = EXIT_STATUS_FAILURE_RECORDING_WRONG_VERSION;
    }
    G.rogue.seed = recallNumber(8);
    G.rogue.howManyTurns = Number(BigInt.asUintN(64, recallNumber(4)));
    G.maxLevelChanges = Number(BigInt.asUintN(64, recallNumber(4)));
    G.lengthOfPlaybackFile = Number(BigInt.asUintN(64, recallNumber(4)));
    seedRandomGenerator(G.rogue.seed);
    G.previousGameSeed = G.rogue.seed;
    if (fileExists(P(G.annotationPathname))) {
      loadNextAnnotation();
    } else {
      G.rogue.nextAnnotationTurn = -1 >>> 0;
    }
  } else {
    G.rogue.patchVersion = BROGUE_PATCH;
    strcpy(versionString, G.gameConst.recordingVersionString);
    G.lengthOfPlaybackFile = 1;
    remove(P(G.currentFilePath));
    recordFile = fopen(P(G.currentFilePath), S("wb"));
    fclose(recordFile);
    flushBufferToFile();
    G.rogue.recording = true_;
  }
  G.rogue.currentTurnNumber = 0;
}

export async function OOSCheck(x: number, numberOfBytes: number): Promise<void> {
  let eventType = 0;
  let recordedNumber = 0;
  if (G.rogue.playbackMode) {
    eventType = recallChar();
    recordedNumber = Number(BigInt.asUintN(64, recallNumber(numberOfBytes)));
    if (eventType !== RNG_CHECK || recordedNumber !== x) {
      if (eventType !== RNG_CHECK) {
        printf(S("Event type mismatch in RNG check.\n"));
        await playbackPanic();
      } else if (recordedNumber !== x) {
        printf(S("Expected RNG output of %li; got %i.\n"), recordedNumber, x | 0);
        await playbackPanic();
      }
    }
  } else {
    recordChar(RNG_CHECK);
    recordNumber(x, numberOfBytes);
    considerFlushingBufferToFile();
  }
}

export async function RNGCheck(): Promise<void> {
  let oldRNG = 0;
  let randomNumber = 0;
  oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_SUBSTANTIVE;
  randomNumber = $u64(rand_range(0, 255));
  await OOSCheck(randomNumber, 1);
  G.rogue.RNG = oldRNG;
}

async function unpause(): Promise<number> {
  if (G.rogue.playbackOOS) {
    await flashTemporaryAlert(S(" Out of sync "), 2000);
  } else if (G.rogue.playbackPaused) {
    G.rogue.playbackPaused = false_;
    return true_;
  }
  return false_;
}

async function printPlaybackHelpScreen(): Promise<void> {
  let i = 0;
  let j = 0;
  let dbuf = new struct_screenDisplayBuffer();
  let helpText = $rows([$cs("Commands:", 80),
$cs("", 80),
$cs("         <space>: ****pause or unpause playback", 80),
$cs("   k or up arrow: ****play back faster", 80),
$cs(" j or down arrow: ****play back slower", 80),
$cs("               <: ****go to previous level", 80),
$cs("               >: ****go to next level", 80),
$cs("             0-9: ****skip to specified turn number", 80),
$cs("l or right arrow: ****advance one turn (shift for 5 turns; control for 20)", 80),
$cs("", 80),
$cs("           <tab>: ****enable or disable omniscience", 80),
$cs("          return: ****examine surroundings", 80),
$cs("               i: ****display inventory", 80),
$cs("               D: ****display discovered items", 80),
$cs("               V: ****view saved recording", 80),
$cs("               O: ****open and resume saved game", 80),
$cs("               N: ****begin a new game", 80),
$cs("               Q: ****quit to title screen", 80),
$cs("", 80),
$cs("        -- press any key to continue --", 80)]);
  for (i = 0; PLAYBACK_HELP_LINE_COUNT > i; i = i + 1 << 16 >> 16) {
    for (j = 0; helpText[i][j]; j = j + 1 << 16 >> 16) {
      if (helpText[i][j] === 42) {
        j = encodeMessageColor(P(helpText[i]), j, G.white);
      }
    }
  }
  clearDisplayBuffer(dbuf);
  for (i = 0; PLAYBACK_HELP_LINE_COUNT > i; i = i + 1 << 16 >> 16) {
    printString(P(helpText[i]), 5 + 20 + 1, i + 3 << 16 >> 16, G.itemMessageColor, G.black, dbuf);
  }
  for (i = 0; COLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; ROWS > j; j = j + 1 << 16 >> 16) {
      $at2(dbuf.cells, i, j).opacity = (STAT_BAR_WIDTH > i ? 0 : INTERFACE_OPACITY) << 24 >> 24;
    }
  }
  let rbuf = saveDisplayBuffer().$clone();
  overlayDisplayBuffer(dbuf);
  G.rogue.playbackMode = false_;
  await waitForAcknowledgment();
  G.rogue.playbackMode = true_;
  restoreDisplayBuffer(rbuf);
}

async function resetPlayback(): Promise<void> {
  let omniscient = 0;
  let stealth = 0;
  let trueColors = 0;
  omniscient = G.rogue.playbackOmniscience;
  stealth = G.rogue.displayStealthRangeMode;
  trueColors = G.rogue.trueColorMode;
  freeEverything();
  G.randomNumbersGenerated = 0;
  G.rogue.playbackMode = true_;
  await initializeRogue(0n);
  G.rogue.playbackOmniscience = omniscient;
  G.rogue.displayStealthRangeMode = stealth;
  G.rogue.trueColorMode = trueColors;
  G.rogue.playbackFastForward = false_;
  blackOutScreen();
  G.rogue.playbackFastForward = true_;
  await startLevel(G.rogue.depthLevel, 1);
}

async function seek(seekTarget: number, seekMode: number): Promise<void> {
  let progressBarRefreshInterval = 1;
  let startTurnNumber = 0;
  let targetTurnNumber = 0;
  let avgTurnsPerLevel = 1;
  let theEvent = new struct_rogueEvent();
  let pauseState = 0;
  let useProgressBar = false_;
  let arrivedAtDestination = false_;
  let dbuf = new struct_screenDisplayBuffer();
  pauseState = G.rogue.playbackPaused;
  switch (seekMode >>> 0) {
  case RECORDING_SEEK_MODE_DEPTH:
    if (G.maxLevelChanges > 0) {
      avgTurnsPerLevel = Math.trunc(G.rogue.howManyTurns / G.maxLevelChanges);
    }
    if ($u64(G.rogue.depthLevel) >= seekTarget) {
      startTurnNumber = 0;
      targetTurnNumber = avgTurnsPerLevel * seekTarget;
    } else {
      startTurnNumber = G.rogue.playerTurnNumber;
      targetTurnNumber = G.rogue.playerTurnNumber + avgTurnsPerLevel;
    }
    break;
  case RECORDING_SEEK_MODE_TURN:
    if (G.rogue.playerTurnNumber > seekTarget) {
      startTurnNumber = 0;
      targetTurnNumber = seekTarget;
    } else {
      startTurnNumber = G.rogue.playerTurnNumber;
      targetTurnNumber = seekTarget;
    }
    break;
  }
  if (targetTurnNumber - startTurnNumber > 100) {
    useProgressBar = true_;
    progressBarRefreshInterval = 1 > Math.trunc(targetTurnNumber / 500) ? 1 : Math.trunc(targetTurnNumber / 500);
  }
  if (seekMode >>> 0 === RECORDING_SEEK_MODE_TURN && G.rogue.playerTurnNumber > seekTarget || seekMode >>> 0 === RECORDING_SEEK_MODE_DEPTH && $u64(G.rogue.depthLevel) >= seekTarget) {
    await resetPlayback();
    if (seekMode >>> 0 === RECORDING_SEEK_MODE_DEPTH && seekTarget === 1 || seekMode >>> 0 === RECORDING_SEEK_MODE_TURN && seekTarget === 0) {
      arrivedAtDestination = true_;
    }
  }
  if (useProgressBar) {
    clearDisplayBuffer(dbuf);
    rectangularShading(((COLS - 20) / 2 | 0) << 16 >> 16, (ROWS / 2 | 0) << 16 >> 16, 20, 1, G.black, INTERFACE_OPACITY, dbuf);
    overlayDisplayBuffer(dbuf);
    commitDraws();
  }
  G.rogue.playbackFastForward = true_;
  while (!arrivedAtDestination && !G.rogue.gameHasEnded && !G.rogue.playbackOOS) {
    if (useProgressBar && !(G.rogue.playerTurnNumber % progressBarRefreshInterval)) {
      G.rogue.playbackFastForward = false_;
      printProgressBar(((COLS - 20) / 2 | 0) << 16 >> 16, (ROWS / 2 | 0) << 16 >> 16, S("[     Loading...   ]"), G.rogue.playerTurnNumber - startTurnNumber, targetTurnNumber - startTurnNumber, G.darkPurple, false_);
      while (await pauseBrogue(0, struct_PauseBehavior.$of())) {
        if (G.rogue.gameHasEnded) {
          return;
        }
        G.rogue.creaturesWillFlashThisTurn = false_;
        await nextBrogueEvent(theEvent, true_, false_, true_);
      }
      G.rogue.playbackFastForward = true_;
    }
    G.rogue.RNG = RNG_COSMETIC;
    G.rogue.playbackDelayThisTurn = 0;
    await nextBrogueEvent(theEvent, false_, true_, false_);
    G.rogue.RNG = RNG_SUBSTANTIVE;
    await executeEvent(theEvent);
    if (seekMode >>> 0 === RECORDING_SEEK_MODE_DEPTH && $u64(G.rogue.depthLevel) === seekTarget || seekMode >>> 0 === RECORDING_SEEK_MODE_TURN && G.rogue.playerTurnNumber >= seekTarget) {
      arrivedAtDestination = true_;
    }
  }
  G.rogue.playbackPaused = pauseState;
  G.rogue.playbackFastForward = false_;
  confirmMessages();
  updateMessageDisplay();
  await refreshSideBar(-1, -1, false_);
  await displayLevel();
}

async function promptToAdvanceToLocation(keystroke: number): Promise<void> {
  let entryText = new Int8Array(30);
  let buf = new Int8Array(79);
  const destinationFrame = new Float64Array(1);
  let enteredText = 0;
  if (G.rogue.playbackOOS || !G.rogue.playbackPaused || await unpause()) {
    buf[0] = (keystroke === 48 ? 0 : keystroke) << 24 >> 24;
    buf[1] = 0;
    G.rogue.playbackMode = false_;
    enteredText = await getInputTextString(P(entryText), S("Go to turn number: "), 9, P(buf), S(""), TEXT_INPUT_NUMBERS, false_);
    confirmMessages();
    G.rogue.playbackMode = true_;
    if (enteredText && entryText[0] !== 0) {
      sscanf(P(entryText), S("%lu"), P(destinationFrame, 0));
      if (G.rogue.playbackOOS && destinationFrame[0] > G.rogue.playerTurnNumber) {
        await flashTemporaryAlert(S(" Out of sync "), 3000);
      } else if (destinationFrame[0] === G.rogue.playerTurnNumber) {
        sprintf(P(buf), S(" Already at turn %li "), destinationFrame[0]);
        await flashTemporaryAlert(P(buf), 1000);
      } else {
        await seek(G.rogue.howManyTurns > destinationFrame[0] ? destinationFrame[0] : G.rogue.howManyTurns, RECORDING_SEEK_MODE_TURN);
      }
      G.rogue.playbackPaused = true_;
    }
  }
}

export async function pausePlayback(): Promise<void> {
  if (!G.rogue.playbackPaused) {
    G.rogue.playbackPaused = true_;
    await messageWithColor(KEYBOARD_LABELS ? S("recording paused. Press space to play.") : S("recording paused."), G.teal, 0);
    await refreshSideBar(-1, -1, false_);
    await mainInputLoop();
    await messageWithColor(S("recording unpaused."), G.teal, 0);
    G.rogue.playbackPaused = false_;
    await refreshSideBar(-1, -1, false_);
    G.rogue.playbackDelayThisTurn = DEFAULT_PLAYBACK_DELAY;
  }
}

export async function executePlaybackInput(recordingInput: struct_rogueEvent | null): Promise<number> {
  const key = new Float64Array(1);
  let newDelay = 0;
  let frameCount = 0;
  let x = 0;
  let y = 0;
  let destinationFrame = 0;
  let proceed = 0;
  let path = new Int8Array(4096);
  if (!G.rogue.playbackMode) {
    return false_;
  }
  if (G.nonInteractivePlayback) {
    return false_;
  }
  if (recordingInput.eventType >>> 0 === KEYSTROKE) {
    key[0] = recordingInput.param1;
    stripShiftFromMovementKeystroke(P(key, 0));
    switch (key[0]) {
    case 63232:
    case 107:
      newDelay = (1 > (G.rogue.playbackDelayPerTurn - 1 > (G.rogue.playbackDelayPerTurn * 2 / 3 | 0) ? G.rogue.playbackDelayPerTurn * 2 / 3 | 0 : G.rogue.playbackDelayPerTurn - 1) ? 1 : G.rogue.playbackDelayPerTurn - 1 > (G.rogue.playbackDelayPerTurn * 2 / 3 | 0) ? G.rogue.playbackDelayPerTurn * 2 / 3 | 0 : G.rogue.playbackDelayPerTurn - 1) << 16 >> 16;
      if (newDelay !== G.rogue.playbackDelayPerTurn) {
        await flashTemporaryAlert(S(" Faster "), 300);
      }
      G.rogue.playbackDelayPerTurn = newDelay;
      G.rogue.playbackDelayThisTurn = G.rogue.playbackDelayPerTurn;
      return true_;
    case 63233:
    case 106:
      newDelay = (((G.rogue.playbackDelayPerTurn * 3 / 2 | 0) > G.rogue.playbackDelayPerTurn + 1 ? G.rogue.playbackDelayPerTurn * 3 / 2 | 0 : G.rogue.playbackDelayPerTurn + 1) > 3000 ? 3000 : (G.rogue.playbackDelayPerTurn * 3 / 2 | 0) > G.rogue.playbackDelayPerTurn + 1 ? G.rogue.playbackDelayPerTurn * 3 / 2 | 0 : G.rogue.playbackDelayPerTurn + 1) << 16 >> 16;
      if (newDelay !== G.rogue.playbackDelayPerTurn) {
        await flashTemporaryAlert(S(" Slower "), 300);
      }
      G.rogue.playbackDelayPerTurn = newDelay;
      G.rogue.playbackDelayThisTurn = G.rogue.playbackDelayPerTurn;
      return true_;
    case 32:
      if (G.rogue.playbackOOS && G.rogue.playbackPaused) {
        await flashTemporaryAlert(S(" Out of sync "), 2000);
      } else {
        G.rogue.playbackPaused = (!G.rogue.playbackPaused ? 1 : 0) << 24 >> 24;
      }
      return true_;
    case 9:
      G.rogue.playbackOmniscience = (!G.rogue.playbackOmniscience ? 1 : 0) << 24 >> 24;
      await displayLevel();
      await refreshSideBar(-1, -1, false_);
      if (G.rogue.playbackOmniscience) {
        await messageWithColor(S("Omniscience enabled."), G.teal, 0);
      } else {
        await messageWithColor(S("Omniscience disabled."), G.teal, 0);
      }
      return true_;
    case 60:
      await seek($u64(G.rogue.depthLevel - 1 > 1 ? G.rogue.depthLevel - 1 : 1), RECORDING_SEEK_MODE_DEPTH);
      return true_;
    case 62:
      if ($u64(G.rogue.depthLevel) === G.maxLevelChanges) {
        await flashTemporaryAlert(S(" Already reached deepest depth explored "), 2000);
        return false_;
      }
      await seek($u64(G.rogue.depthLevel + 1), RECORDING_SEEK_MODE_DEPTH);
      return true_;
    case 105:
      G.rogue.playbackMode = false_;
      await displayInventory(ALL_ITEMS, 0, 0, true_, false_);
      G.rogue.playbackMode = true_;
      return true_;
    case 108:
    case 63235:
    case 104:
    case 63234:
      if (key[0] === RIGHT_KEY || key[0] === RIGHT_ARROW) {
        frameCount = 1;
      } else {
        frameCount = -1;
      }
      if (recordingInput.shiftKey) {
        frameCount = frameCount * 5 << 16 >> 16;
      }
      if (recordingInput.controlKey) {
        frameCount = frameCount * 20 << 16 >> 16;
      }
      if (0 > frameCount) {
        if ($u64(frameCount * -1) > G.rogue.playerTurnNumber) {
          destinationFrame = 0;
        } else {
          destinationFrame = G.rogue.playerTurnNumber + $u64(frameCount);
        }
      } else {
        destinationFrame = G.rogue.howManyTurns > G.rogue.playerTurnNumber + $u64(frameCount) ? G.rogue.playerTurnNumber + $u64(frameCount) : G.rogue.howManyTurns;
      }
      if (destinationFrame === G.rogue.playerTurnNumber) {
        await flashTemporaryAlert(S(" Already at end of recording "), 1000);
      } else if (0 > frameCount) {
        G.rogue.playbackMode = false_;
        proceed = (100 > G.rogue.playerTurnNumber || await confirm(S("Rewind?"), true_) ? 1 : 0) << 24 >> 24;
        G.rogue.playbackMode = true_;
        if (proceed) {
          await seek(destinationFrame, RECORDING_SEEK_MODE_TURN);
        }
      } else {
        await seek(destinationFrame, RECORDING_SEEK_MODE_TURN);
      }
      return true_;
    case 63:
      await printPlaybackHelpScreen();
      return true_;
    case 70:
      G.rogue.playbackMode = false_;
      await displayFeatsScreen();
      G.rogue.playbackMode = true_;
      return true_;
    case 68:
      G.rogue.playbackMode = false_;
      await printDiscoveriesScreen();
      G.rogue.playbackMode = true_;
      return true_;
    case 77:
      G.rogue.playbackMode = false_;
      await displayMessageArchive();
      G.rogue.playbackMode = true_;
      return true_;
    case 86:
      confirmMessages();
      G.rogue.playbackMode = false_;
      if (await dialogChooseFile(P(path), S(".broguerec"), S("View recording: "))) {
        if (fileExists(P(path))) {
          strcpy(P(G.rogue.nextGamePath), P(path));
          strcpy(P(G.rogue.currentGamePath), P(path));
          G.rogue.nextGame = NG_VIEW_RECORDING;
          G.rogue.gameHasEnded = true_;
          G.rogue.gameExitStatusCode = EXIT_STATUS_SUCCESS;
        } else {
          await message(S("File not found."), 0);
        }
      }
      G.rogue.playbackMode = true_;
      return true_;
    case 79:
      confirmMessages();
      G.rogue.playbackMode = false_;
      if (await dialogChooseFile(P(path), S(".broguesave"), S("Open saved game: "))) {
        if (fileExists(P(path))) {
          strcpy(P(G.rogue.nextGamePath), P(path));
          strcpy(P(G.rogue.currentGamePath), P(path));
          G.rogue.nextGame = NG_OPEN_GAME;
          G.rogue.gameHasEnded = true_;
        } else {
          await message(S("File not found."), 0);
        }
      }
      G.rogue.playbackMode = true_;
      return true_;
    case 78:
      G.rogue.playbackMode = false_;
      if (await confirm(S("Close recording and begin a new game?"), true_)) {
        G.rogue.nextGame = NG_NEW_GAME;
        G.rogue.gameHasEnded = true_;
      }
      G.rogue.playbackMode = true_;
      return true_;
    case 81:
      G.rogue.gameHasEnded = true_;
      G.rogue.gameExitStatusCode = EXIT_STATUS_SUCCESS;
      G.rogue.playbackOOS = false_;
      G.rogue.creaturesWillFlashThisTurn = false_;
      notifyEvent(GAMEOVER_RECORDING, 0, 0, S("recording ended"), S("none"));
      return true_;
    case 92:
      G.rogue.trueColorMode = (!G.rogue.trueColorMode ? 1 : 0) << 24 >> 24;
      await displayLevel();
      await refreshSideBar(-1, -1, false_);
      if (G.rogue.trueColorMode) {
        await messageWithColor(KEYBOARD_LABELS ? S("Color effects disabled. Press '\\' again to enable.") : S("Color effects disabled."), G.teal, 0);
      } else {
        await messageWithColor(KEYBOARD_LABELS ? S("Color effects enabled. Press '\\' again to disable.") : S("Color effects enabled."), G.teal, 0);
      }
      return true_;
    case 93:
      G.rogue.displayStealthRangeMode = (!G.rogue.displayStealthRangeMode ? 1 : 0) << 24 >> 24;
      await displayLevel();
      await refreshSideBar(-1, -1, false_);
      if (G.rogue.displayStealthRangeMode) {
        await messageWithColor(KEYBOARD_LABELS ? S("Stealth range displayed. Press ']' again to hide.") : S("Stealth range displayed."), G.teal, 0);
      } else {
        await messageWithColor(KEYBOARD_LABELS ? S("Stealth range hidden. Press ']' again to display.") : S("Stealth range hidden."), G.teal, 0);
      }
      return true_;
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
      return true_;
    case 126:
      await printSeed();
      return true_;
    case 80:
      return false_;
    case 27:
      if (!G.rogue.playbackPaused) {
        G.rogue.playbackPaused = true_;
        return true_;
      }
      return false_;
    default:
      if (key[0] >= 48 && 57 >= key[0] || key[0] >= NUMPAD_0 && NUMPAD_9 >= key[0]) {
        await promptToAdvanceToLocation(key[0] << 16 >> 16);
        return true_;
      }
      return false_;
    }
  } else if (recordingInput.eventType >>> 0 === MOUSE_UP) {
    x = recordingInput.param1 << 16 >> 16;
    y = recordingInput.param2 << 16 >> 16;
    if (x - 20 - 1 >= 0 && DCOLS > x - 20 - 1 && y >= 0 && MESSAGE_LINES > y) {
      G.rogue.playbackMode = false_;
      await displayMessageArchive();
      G.rogue.playbackMode = true_;
      return true_;
    } else if (!G.rogue.playbackPaused) {
      G.rogue.playbackPaused = true_;
      return true_;
    }
  } else if (recordingInput.eventType >>> 0 === RIGHT_MOUSE_UP) {
    G.rogue.playbackMode = false_;
    await displayInventory(ALL_ITEMS, 0, 0, true_, false_);
    G.rogue.playbackMode = true_;
    return true_;
  }
  return false_;
}

export function getAvailableFilePath(returnPath: Ptr | null, defaultPath: Ptr | null, suffix: Ptr | null): void {
  let fullPath = new Int8Array(4096);
  let fileNameIterator = 2;
  strcpy(returnPath, defaultPath);
  sprintf(P(fullPath), S("%s%s"), returnPath, suffix);
  while (fileExists(P(fullPath))) {
    sprintf(returnPath, S("%s (%i)"), defaultPath, fileNameIterator);
    sprintf(P(fullPath), S("%s%s"), returnPath, suffix);
    fileNameIterator = fileNameIterator + 1 << 16 >> 16;
  }
}

export function characterForbiddenInFilename(theChar: number): number {
  if (theChar === 47 || theChar === 92 || theChar === 58) {
    return true_;
  } else {
    return false_;
  }
}

function getDefaultFilePath(defaultPath: Ptr | null, gameOver: number): void {
  let seed = new Int8Array(21);
  sprintf(P(seed), S("%llu"), G.rogue.seed);
  if (strlen(P(seed)) > 11) {
    sprintf(P(seed).add(3), S("...%05lu"), G.rogue.seed % 100000n);
  }
  if (G.serverMode) {
    sprintf(defaultPath, S("#%s"), P(seed));
    return;
  }
  if (!gameOver) {
    sprintf(defaultPath, S("Saved %s #%s at depth %d"), G.gameConst.versionString, P(seed), G.rogue.depthLevel);
  } else if (G.rogue.quit) {
    sprintf(defaultPath, S("%s #%s Quit at depth %d"), G.gameConst.versionString, P(seed), G.rogue.depthLevel);
  } else if ((G.player.bookkeepingFlags & MB_IS_DYING) >>> 0) {
    sprintf(defaultPath, S("%s #%s Died at depth %d"), G.gameConst.versionString, P(seed), G.rogue.depthLevel);
  } else if (G.rogue.depthLevel > 26) {
    sprintf(defaultPath, S("%s #%s Mastered the dungeons"), G.gameConst.versionString, P(seed));
  } else {
    sprintf(defaultPath, S("%s #%s Escaped the dungeons"), G.gameConst.versionString, P(seed));
  }
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD) {
    strcat(defaultPath, S(" (wizard)"));
  } else if (G.rogue.mode >>> 0 === GAME_MODE_EASY) {
    strcat(defaultPath, S(" (easy)"));
  }
}

export function saveGameNoPrompt(): void {
  let filePath = new Int8Array(4096);
  let defaultPath = new Int8Array(4096);
  if (G.rogue.playbackMode) {
    return;
  }
  getDefaultFilePath(P(defaultPath), false_);
  getAvailableFilePath(P(filePath), P(defaultPath), S(".broguesave"));
  flushBufferToFile();
  strcat(P(filePath), S(".broguesave"));
  rename(P(G.currentFilePath), P(filePath));
  strcpy(P(G.currentFilePath), P(filePath));
  G.rogue.gameHasEnded = true_;
  G.rogue.gameExitStatusCode = EXIT_STATUS_SUCCESS;
  G.rogue.recording = false_;
}

export async function saveGame(): Promise<void> {
  let filePathWithoutSuffix = new Int8Array(4084);
  let filePath = new Int8Array(4096);
  let defaultPath = new Int8Array(4096);
  let askAgain = 0;
  if (G.rogue.playbackMode) {
    return;
  }
  getDefaultFilePath(P(defaultPath), false_);
  getAvailableFilePath(P(filePathWithoutSuffix), P(defaultPath), S(".broguesave"));
  filePath[0] = 0;
  do {
    askAgain = false_;
    if (await getInputTextString(P(filePathWithoutSuffix), S("Save game as (<esc> to cancel): "), MAX_TEXT_INPUT_FILENAME_LENGTH, P(filePathWithoutSuffix), S(".broguesave"), TEXT_INPUT_FILENAME, true_)) {
      snprintf(P(filePath), $u64(4096 > 1024 * 4 ? 1024 * 4 : 4096), S("%s%s"), P(filePathWithoutSuffix), S(".broguesave"));
      if (!fileExists(P(filePath)) || await confirm(S("File of that name already exists. Overwrite?"), true_)) {
        remove(P(filePath));
        flushBufferToFile();
        rename(P(G.currentFilePath), P(filePath));
        strcpy(P(G.currentFilePath), P(filePath));
        G.rogue.recording = false_;
        await message(S("Saved."), REQUIRE_ACKNOWLEDGMENT);
        G.rogue.gameHasEnded = true_;
        G.rogue.gameExitStatusCode = EXIT_STATUS_SUCCESS;
      } else {
        askAgain = true_;
      }
    }
  } while (askAgain);
}

export function saveRecordingNoPrompt(filePath: Ptr | null): void {
  let defaultPath = new Int8Array(4096);
  if (G.rogue.playbackMode) {
    return;
  }
  getDefaultFilePath(P(defaultPath), true_);
  getAvailableFilePath(filePath, P(defaultPath), S(".broguerec"));
  strcat(filePath, S(".broguerec"));
  remove(filePath);
  rename(P(G.currentFilePath), filePath);
  G.rogue.recording = false_;
}

export async function saveRecording(filePathWithoutSuffix: Ptr | null): Promise<void> {
  let filePath = new Int8Array(4096);
  let defaultPath = new Int8Array(4096);
  let askAgain = 0;
  if (G.rogue.playbackMode) {
    return;
  }
  getDefaultFilePath(P(defaultPath), true_);
  getAvailableFilePath(filePathWithoutSuffix, P(defaultPath), S(".broguerec"));
  filePath[0] = 0;
  do {
    askAgain = false_;
    if (await getInputTextString(filePathWithoutSuffix, S("Save recording as (<esc> to cancel): "), MAX_TEXT_INPUT_FILENAME_LENGTH, filePathWithoutSuffix, S(".broguerec"), TEXT_INPUT_FILENAME, true_)) {
      snprintf(P(filePath), $u64(4096 > 1024 * 4 ? 1024 * 4 : 4096), S("%s%s"), filePathWithoutSuffix, S(".broguerec"));
      if (!fileExists(P(filePath)) || await confirm(S("File of that name already exists. Overwrite?"), true_)) {
        remove(P(filePath));
        rename(P(G.currentFilePath), P(filePath));
        G.rogue.recording = false_;
      } else {
        askAgain = true_;
      }
    } else {
      snprintf(P(filePath), $u64(4096 > 1024 * 4 ? 1024 * 4 : 4096), S("%s%s"), S("LastRecording"), S(".broguerec"));
      if (fileExists(P(filePath))) {
        remove(P(filePath));
      }
      rename(P(G.currentFilePath), P(filePath));
      G.rogue.recording = false_;
    }
  } while (askAgain);
}

function copyFile(fromFilePath: Ptr | null, toFilePath: Ptr | null, fromFileLength: number): void {
  let m = 0;
  let n = 0;
  let fileBuffer = new Uint8Array(1000);
  let fromFile = null;
  let toFile = null;
  remove(toFilePath);
  fromFile = fopen(fromFilePath, S("rb"));
  toFile = fopen(toFilePath, S("wb"));
  for (n = 0; fromFileLength > n; n = n + m) {
    m = fromFileLength - n > 1000 ? 1000 : fromFileLength - n;
    fread(P(fileBuffer), 1, m, fromFile);
    fwrite(P(fileBuffer), 1, m, toFile);
  }
  fclose(fromFile);
  fclose(toFile);
}

export async function switchToPlaying(): Promise<void> {
  let lastGamePath = new Int8Array(4096);
  getAvailableFilePath(P(lastGamePath), S("LastGame"), S(".broguesave"));
  strcat(P(lastGamePath), S(".broguesave"));
  G.rogue.playbackMode = false_;
  G.rogue.playbackFastForward = false_;
  G.rogue.playbackOmniscience = false_;
  G.rogue.recording = true_;
  G.locationInRecordingBuffer = 0;
  copyFile(P(G.currentFilePath), P(lastGamePath), G.recordingLocation);
  if (DELETE_SAVE_FILE_AFTER_LOADING) {
    remove(P(G.currentFilePath));
  }
  strcpy(P(G.currentFilePath), P(lastGamePath));
  blackOutScreen();
  await refreshSideBar(-1, -1, false_);
  updateMessageDisplay();
  await displayLevel();
}

export async function loadSavedGame(): Promise<number> {
  let progressBarInterval = 0;
  let previousRecordingLocation = 0;
  let theEvent = new struct_rogueEvent();
  let dbuf = new struct_screenDisplayBuffer();
  G.randomNumbersGenerated = 0;
  G.rogue.playbackMode = true_;
  G.rogue.playbackFastForward = true_;
  await initializeRogue(0n);
  if (!G.rogue.gameHasEnded) {
    blackOutScreen();
    await startLevel(G.rogue.depthLevel, 1);
  }
  if (G.rogue.howManyTurns > 0) {
    progressBarInterval = 1 > Math.trunc(G.lengthOfPlaybackFile / 100) ? 1 : Math.trunc(G.lengthOfPlaybackFile / 100);
    previousRecordingLocation = -1 >>> 0;
    clearDisplayBuffer(dbuf);
    rectangularShading(((COLS - 20) / 2 | 0) << 16 >> 16, (ROWS / 2 | 0) << 16 >> 16, 20, 1, G.black, INTERFACE_OPACITY, dbuf);
    G.rogue.playbackFastForward = false_;
    overlayDisplayBuffer(dbuf);
    G.rogue.playbackFastForward = true_;
    while (G.lengthOfPlaybackFile > G.recordingLocation && G.rogue.howManyTurns > G.rogue.playerTurnNumber && !G.rogue.gameHasEnded && !G.rogue.playbackOOS) {
      G.rogue.RNG = RNG_COSMETIC;
      await nextBrogueEvent(theEvent, false_, true_, false_);
      G.rogue.RNG = RNG_SUBSTANTIVE;
      await executeEvent(theEvent);
      if (Math.trunc(G.recordingLocation / progressBarInterval) !== Math.trunc(previousRecordingLocation / progressBarInterval) && !G.rogue.playbackOOS) {
        G.rogue.playbackFastForward = false_;
        printProgressBar(((COLS - 20) / 2 | 0) << 16 >> 16, (ROWS / 2 | 0) << 16 >> 16, S("[     Loading...   ]"), G.recordingLocation, G.lengthOfPlaybackFile, G.darkPurple, false_);
        while (await pauseBrogue(0, struct_PauseBehavior.$of())) {
          G.rogue.creaturesWillFlashThisTurn = false_;
          await nextBrogueEvent(theEvent, true_, false_, true_);
          if (G.rogue.gameHasEnded || theEvent.eventType >>> 0 === KEYSTROKE && theEvent.param1 === ESCAPE_KEY) {
            return false_;
          }
        }
        G.rogue.playbackFastForward = true_;
        previousRecordingLocation = G.recordingLocation;
      }
    }
  }
  if (!G.rogue.gameHasEnded && !G.rogue.playbackOOS) {
    await switchToPlaying();
    recordChar(SAVED_GAME_LOADED);
  }
  return true_;
}

function describeKeystroke(key: number, description: Ptr | null): void {
  let i = 0;
  let c = 0;
  let keyList = $ta(Float64Array, 51, [UP_KEY, DOWN_KEY, LEFT_KEY, RIGHT_KEY, UP_ARROW, LEFT_ARROW, DOWN_ARROW, RIGHT_ARROW, UPLEFT_KEY, UPRIGHT_KEY, DOWNLEFT_KEY, DOWNRIGHT_KEY, DESCEND_KEY, ASCEND_KEY, REST_KEY, AUTO_REST_KEY, SEARCH_KEY, INVENTORY_KEY, ACKNOWLEDGE_KEY, EQUIP_KEY, UNEQUIP_KEY, APPLY_KEY, THROW_KEY, RELABEL_KEY, DROP_KEY, CALL_KEY, BROGUE_HELP_KEY, FEATS_KEY, DISCOVERIES_KEY, RETURN_KEY, EXPLORE_KEY, AUTOPLAY_KEY, SEED_KEY, EASY_MODE_KEY, ESCAPE_KEY, RETURN_KEY, DELETE_KEY, TAB_KEY, PERIOD_KEY, VIEW_RECORDING_KEY, NUMPAD_0, NUMPAD_1, NUMPAD_2, NUMPAD_3, NUMPAD_4, NUMPAD_5, NUMPAD_6, NUMPAD_7, NUMPAD_8, NUMPAD_9, UNKNOWN_KEY]);
  let descList = $rows([$cs("up", 30),
$cs("down", 30),
$cs("left", 30),
$cs("right", 30),
$cs("up arrow", 30),
$cs("left arrow", 30),
$cs("down arrow", 30),
$cs("right arrow", 30),
$cs("upleft", 30),
$cs("upright", 30),
$cs("downleft", 30),
$cs("downright", 30),
$cs("descend", 30),
$cs("ascend", 30),
$cs("rest", 30),
$cs("auto rest", 30),
$cs("search", 30),
$cs("inventory", 30),
$cs("acknowledge", 30),
$cs("equip", 30),
$cs("unequip", 30),
$cs("apply", 30),
$cs("throw", 30),
$cs("relabel", 30),
$cs("drop", 30),
$cs("call", 30),
$cs("help", 30),
$cs("discoveries", 30),
$cs("repeat travel", 30),
$cs("explore", 30),
$cs("autoplay", 30),
$cs("seed", 30),
$cs("easy mode", 30),
$cs("escape", 30),
$cs("return", 30),
$cs("delete", 30),
$cs("tab", 30),
$cs("period", 30),
$cs("open file", 30),
$cs("numpad 0", 30),
$cs("numpad 1", 30),
$cs("numpad 2", 30),
$cs("numpad 3", 30),
$cs("numpad 4", 30),
$cs("numpad 5", 30),
$cs("numpad 6", 30),
$cs("numpad 7", 30),
$cs("numpad 8", 30),
$cs("numpad 9", 30),
$cs("unknown", 30),
$cs("ERROR", 30)]);
  c = uncompressKeystroke(key);
  for (i = 0; 50 > i && keyList[i] !== c; i = i + 1 << 16 >> 16) {
    ;
  }
  if (key >= 32 && 126 >= key) {
    sprintf(description, S("Key: %c\t(%s)"), key, P(descList[i]));
  } else {
    sprintf(description, S("Key: %i\t(%s)"), key, P(descList[i]));
  }
}

function appendModifierKeyDescription(description: Ptr | null): void {
  let c = recallChar();
  if ((c & 2) >>> 0) {
    strcat(description, S(" + CRTL"));
  }
  if ((c & 4) >>> 0) {
    strcat(description, S(" + SHIFT"));
  }
}

async function selectFile(prompt: Ptr | null, defaultName: Ptr | null, suffix: Ptr | null): Promise<number> {
  let retval = 0;
  let newFilePath = new Int8Array(4096);
  retval = false_;
  if (await chooseFile(P(newFilePath), prompt, defaultName, suffix)) {
    if (openFile(P(newFilePath))) {
      retval = true_;
    } else {
      confirmMessages();
      await message(S("File not found."), 0);
      retval = false_;
    }
  }
  return retval;
}

export async function parseFile(): Promise<void> {
  let descriptionFile = null;
  let oldFileLoc = 0;
  let oldRecLoc = 0;
  let oldLength = 0;
  let oldBufLoc = 0;
  let i = 0;
  let numTurns = 0;
  let numDepths = 0;
  let fileLength = 0;
  let startLoc = 0;
  let seed = 0n;
  let c = 0;
  let description = new Int8Array(1000);
  let versionString = new Int8Array(500);
  let x = 0;
  let y = 0;
  if (await selectFile(S("Parse recording: "), S("Recording.broguerec"), S(""))) {
    oldFileLoc = G.positionInPlaybackFile;
    oldRecLoc = G.recordingLocation;
    oldBufLoc = G.locationInRecordingBuffer;
    oldLength = G.lengthOfPlaybackFile;
    G.positionInPlaybackFile = 0;
    G.locationInRecordingBuffer = 0;
    G.recordingLocation = 0;
    G.lengthOfPlaybackFile = 10000000;
    fillBufferFromFile();
    descriptionFile = fopen(S("Recording Description.txt"), S("w"));
    for (i = 0; 16 > i; i = $u64(i + 1)) {
      versionString[i] = recallChar() << 24 >> 24;
    }
    seed = recallNumber(8);
    numTurns = Number(BigInt.asUintN(64, recallNumber(4)));
    numDepths = Number(BigInt.asUintN(64, recallNumber(4)));
    fileLength = Number(BigInt.asUintN(64, recallNumber(4)));
    fprintf(descriptionFile, S("Parsed file \"%s\":\n\tVersion: %s\n\tSeed: %lld\n\tNumber of turns: %lu\n\tNumber of depth changes: %lu\n\tFile length: %lu\n"), P(G.currentFilePath), P(versionString), seed, numTurns, numDepths, fileLength);
    for (i = 0; fileLength > G.recordingLocation; i = $u64(i + 1)) {
      startLoc = G.recordingLocation;
      c = recallChar();
      switch (c) {
      case KEYSTROKE:
        describeKeystroke(recallChar(), P(description));
        appendModifierKeyDescription(P(description));
        break;
      case MOUSE_UP:
      case MOUSE_DOWN:
      case MOUSE_ENTERED_CELL:
        x = recallChar();
        y = recallChar();
        sprintf(P(description), S("Mouse click: (%i, %i)"), x, y);
        appendModifierKeyDescription(P(description));
        break;
      case RNG_CHECK:
        sprintf(P(description), S("\tRNG check: %i"), recallChar());
        break;
      case SAVED_GAME_LOADED:
        strcpy(P(description), S("Saved game loaded"));
        break;
      default:
        sprintf(P(description), S("UNKNOWN EVENT TYPE: %i"), c);
        break;
      }
      fprintf(descriptionFile, S("\nEvent %li, loc %li, length %li:%s\t%s"), i, startLoc, G.recordingLocation - startLoc, 10 > i ? S(" ") : S(""), P(description));
    }
    fclose(descriptionFile);
    G.positionInPlaybackFile = oldFileLoc;
    G.recordingLocation = oldRecLoc;
    G.lengthOfPlaybackFile = oldLength;
    G.locationInRecordingBuffer = oldBufLoc & 0xffff;
    await message(S("File parsed."), 0);
  } else {
    confirmMessages();
  }
}

export function RNGLog(message: Ptr | null): void {
}

export function $init(): void {
  keystrokeTable = $ta(Float64Array, 18, [UP_ARROW, LEFT_ARROW, DOWN_ARROW, RIGHT_ARROW, ESCAPE_KEY, RETURN_KEY, DELETE_KEY, TAB_KEY, NUMPAD_0, NUMPAD_1, NUMPAD_2, NUMPAD_3, NUMPAD_4, NUMPAD_5, NUMPAD_6, NUMPAD_7, NUMPAD_8, NUMPAD_9]);
  keystrokeCount = Math.trunc(144 / 8) | 0;
}
