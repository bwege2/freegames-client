// ui_io.cpp: Terminal I/O code, uses the curses package
import { config } from './config.ts';
import { CTRL_KEY, DELETE, ESCAPE, MESSAGE_HISTORY_SIZE, MORIA_MESSAGE_SIZE, MSG_LINE } from './constants.ts';
import * as curses from './curses.ts';
import { endGame } from './game_death.ts';
import { saveGame } from './game_save.ts';
import { dg, game, globals, messages } from './globals.ts';
import { chr, cstr, isprint, type Ref } from './libc.ts';
import { platform } from './platform.ts';
import { playerDisturb } from './player.ts';
import { onReset } from './reset.ts';
import type { Coord_t } from './structs.ts';

const ERR = curses.ERR;
const EOF = -1;

let curses_on = false;

// Spare window for saving the screen. -CJS-
let save_screen: curses.Window = curses.newwin();

onReset(() => {
  curses_on = false;
  save_screen = curses.newwin();
});

/** abort(): a curses call failed where the original aborts */
function abort(what: string): never {
  throw new Error(`abort(): ${what}`);
}

// Set up the terminal into a suitable state -MRC-
function moriaTerminalInitialize(): void {
  // raw(), noecho(), nonl(), keypad(stdscr, false): the platform delivers the bytes of every key
  curses_on = true;
}

// initializes the terminal / curses routines
export function terminalInitialize(): boolean {
  // initscr(); the screen is 80x24
  save_screen = curses.newwin();

  moriaTerminalInitialize();

  curses.clear();
  void curses.refresh();

  return true;
}

// Put the terminal in the original mode. -CJS-
export async function terminalRestore(): Promise<void> {
  if (!curses_on) {
    return;
  }

  // Dump any remaining buffer
  await putQIO();

  // this moves curses to bottom right corner; exit curses (endwin)
  platform().endwin(curses.stdscr);

  curses_on = false;
}

export function terminalSaveScreen(): void {
  curses.overwrite(curses.stdscr, save_screen);
}

export function terminalRestoreScreen(): void {
  curses.overwrite(save_screen, curses.stdscr);
}

export async function terminalBellSound(): Promise<number> {
  await putQIO();

  // The player can turn off beeps if they find them annoying.
  if (config.options.error_beep_sound) {
    platform().bell();
    return 1;
  }

  return 0;
}

// Dump the IO buffer to terminal -RAK-
export async function putQIO(): Promise<void> {
  // Let inventoryExecuteCommand() know something has changed.
  globals.screen_has_changed = true;

  await curses.refresh();
}

// Flush the buffer -RAK-
export function flushInputBuffer(): void {
  if (globals.eof_flag !== 0) {
    return;
  }

  while (checkForNonBlockingKeyPress(0));
}

// Clears screen
export async function clearScreen(): Promise<void> {
  if (globals.message_ready_to_print) {
    await printMessage(null);
  }
  curses.clear();
}

export function clearToBottom(row: number): void {
  curses.move(row, 0);
  curses.clrtobot();
}

// move cursor to a given y, x position
export function moveCursor(coord: Coord_t): void {
  curses.move(coord.y, coord.x);
}

export function addChar(ch: string, coord: Coord_t): void {
  if (curses.mvaddch(coord.y, coord.x, ch) === ERR) {
    abort('addChar');
  }
}

// Dump IO to buffer -RAK-
export function putString(out_str: string, coord: Coord_t): void {
  let x = coord.x;
  // truncate the string, to make sure that it won't go past right edge of screen.
  if (x > 79) {
    x = 79;
  }

  const str = cstr(out_str).slice(0, 79 - x);

  if (curses.mvaddstr(coord.y, x, str) === ERR) {
    abort('putString');
  }
}

// Outputs a line to a given y, x position -RAK-
export async function putStringClearToEOL(str: string, coord: Coord_t): Promise<void> {
  if (coord.y === MSG_LINE && globals.message_ready_to_print) {
    await printMessage(null);
  }

  curses.move(coord.y, coord.x);
  curses.clrtoeol();
  putString(str, coord);
}

// Clears given line of text -RAK-
export async function eraseLine(coord: Coord_t): Promise<void> {
  if (coord.y === MSG_LINE && globals.message_ready_to_print) {
    await printMessage(null);
  }

  curses.move(coord.y, coord.x);
  curses.clrtoeol();
}

// Moves the cursor to a given interpolated y, x position -RAK-
export function panelMoveCursor(coord: Coord_t): void {
  // Real coords convert to screen positions
  const y = coord.y - dg.panel.row_prt;
  const x = coord.x - dg.panel.col_prt;

  if (curses.move(y, x) === ERR) {
    abort('panelMoveCursor');
  }
}

// Outputs a char to a given interpolated y, x position -RAK-
// sign bit of a character used to indicate standout mode. -CJS
export function panelPutTile(ch: string, coord: Coord_t): void {
  // Real coords convert to screen positions
  const y = coord.y - dg.panel.row_prt;
  const x = coord.x - dg.panel.col_prt;

  if (curses.mvaddch(y, x, ch) === ERR) {
    abort('panelPutTile');
  }
}

function currentCursorPosition(): Coord_t {
  return curses.getyx();
}

// messageLinePrintMessage will print a line of text to the message line (0,0).
// first clearing the line of any text!
export function messageLinePrintMessage(message: string): void {
  // save current cursor position
  const coord = currentCursorPosition();

  // move to beginning of message line, and clear it
  curses.move(0, 0);
  curses.clrtoeol();

  // truncate message if it's too long!
  message = cstr(message).slice(0, 79);

  curses.addstr(message);

  // restore cursor to old position
  curses.move(coord.y, coord.x);
}

// deleteMessageLine will delete all text from the message line (0,0).
// The current cursor position will be maintained.
export function messageLineClear(): void {
  // save current cursor position
  const coord = currentCursorPosition();

  // move to beginning of message line, and clear it
  curses.move(0, 0);
  curses.clrtoeol();

  // restore cursor to old position
  curses.move(coord.y, coord.x);
}

// Outputs message to top line of screen
// These messages are kept for later reference.
export async function printMessage(msg: string | null): Promise<void> {
  let new_len = 0;
  let old_len = 0;
  let combine_messages = false;

  if (globals.message_ready_to_print) {
    old_len = messages[globals.last_message_id].length + 1;

    // If the new message and the old message are short enough,
    // we want display them together on the same line.  So we
    // don't flush the old message in this case.

    if (msg !== null) {
      new_len = cstr(msg).length;
    } else {
      new_len = 0;
    }

    if (msg === null || new_len + old_len + 2 >= 73) {
      // ensure that the complete -more- message is visible.
      if (old_len > 73) {
        old_len = 73;
      }

      putString(' -more-', { y: MSG_LINE, x: old_len });

      let key: string;
      do {
        key = await getKeyInput();
      } while (key !== ' ' && key !== ESCAPE && key !== '\n' && key !== '\r');
    } else {
      combine_messages = true;
    }
  }

  if (!combine_messages) {
    curses.move(MSG_LINE, 0);
    curses.clrtoeol();
  }

  // Make the null string a special case. -CJS-

  if (msg === null) {
    globals.message_ready_to_print = false;
    return;
  }

  game.command_count = 0;
  globals.message_ready_to_print = true;

  // If the new message and the old message are short enough,
  // display them on the same line.

  if (combine_messages) {
    putString(msg, { y: MSG_LINE, x: old_len + 2 });
    // strcat into a vtype_t: the message history keeps what C's buffer can hold
    messages[globals.last_message_id] = messages[globals.last_message_id] + '  ' + cstr(msg);
  } else {
    messageLinePrintMessage(msg);
    globals.last_message_id++;

    if (globals.last_message_id >= MESSAGE_HISTORY_SIZE) {
      globals.last_message_id = 0;
    }

    messages[globals.last_message_id] = cstr(msg).slice(0, MORIA_MESSAGE_SIZE - 1);
  }
}

// Print a message so as not to interrupt a counted command. -CJS-
export async function printMessageNoCommandInterrupt(msg: string): Promise<void> {
  // Save command count value
  const i = game.command_count;

  await printMessage(msg);

  // Restore count value
  game.command_count = i;
}

// Returns a single character input from the terminal. -CJS-
//
// This silently consumes ^R to redraw the screen and reset the
// terminal, so that this operation can always be performed at
// any input prompt. getKeyInput() never returns ^R.
export async function getKeyInput(): Promise<string> {
  await putQIO(); // Dump IO buffer
  game.command_count = 0; // Just to be safe -CJS-

  for (;;) {
    const ch = await curses.getch();

    // some machines may not sign extend.
    if (ch === EOF) {
      // avoid infinite loops while trying to call getKeyInput() for a -more- prompt.
      globals.message_ready_to_print = false;

      globals.eof_flag++;

      await curses.refresh();

      if (!game.character_generated || game.character_saved) {
        await endGame();
      }

      await playerDisturb(1, 0);

      if (globals.eof_flag > 100) {
        // just in case, to make sure that the process eventually dies
        globals.panic_save = true;

        game.character_died_from = '(end of input: panic saved)';
        if (!(await saveGame())) {
          game.character_died_from = 'panic: unexpected eof';
          game.character_is_dead = true;
        }
        await endGame();
      }
      return ESCAPE;
    }

    if (chr(ch) !== CTRL_KEY('R')) {
      return chr(ch);
    }

    // wrefresh(curscr): the screen is drawn again
    moriaTerminalInitialize();
  }
}

// Prompts (optional) and returns ord value of input char
// Function returns false if <ESCAPE> is input
export async function getCommand(prompt: string, command: Ref<string>): Promise<boolean> {
  if (prompt.length !== 0) {
    await putStringClearToEOL(prompt, { y: 0, x: 0 });
  }
  command.v = await getKeyInput();

  messageLineClear();

  return command.v !== ESCAPE;
}

// NOTE: currently this just wraps the getCommand() function, but better defines the different usages. -MRC-
export async function getTileCharacter(prompt: string, command: Ref<string>): Promise<boolean> {
  return getCommand(prompt, command);
}
// NOTE: currently this just wraps the getCommand() function, but better defines the different usages. -MRC-
export async function getMenuItemId(prompt: string, command: Ref<string>): Promise<boolean> {
  return getCommand(prompt, command);
}

// Gets a string terminated by <RETURN>
// Function returns false if <ESCAPE> is input
export async function getStringInput(in_str: Ref<string>, coord_in: Coord_t, slen: number): Promise<boolean> {
  const coord = { y: coord_in.y, x: coord_in.x };
  curses.move(coord.y, coord.x);

  for (let i = slen; i > 0; i--) {
    curses.addch(' ');
  }

  curses.move(coord.y, coord.x);

  const start_col = coord.x;
  let end_col = coord.x + slen - 1;

  if (end_col > 79) {
    end_col = 79;
  }

  // the characters typed (the C code writes them into in_str through p)
  let p = '';

  let flag = false;
  let aborted = false;

  while (!flag && !aborted) {
    const key = await getKeyInput();
    switch (key) {
      case ESCAPE:
        aborted = true;
        break;
      case CTRL_KEY('J'):
      case CTRL_KEY('M'):
        flag = true;
        break;
      case DELETE:
      case CTRL_KEY('H'):
        if (coord.x > start_col) {
          coord.x--;
          putString(' ', coord);
          moveCursor(coord);
          p = p.slice(0, -1);
        }
        break;
      default:
        if (!isprint(key) || coord.x > end_col) {
          await terminalBellSound();
        } else {
          curses.mvaddch(coord.y, coord.x, key);
          p += key;
          coord.x++;
        }
        break;
    }
  }

  if (aborted) {
    return false;
  }

  // Remove trailing blanks
  in_str.v = p.replace(/ +$/, '');

  return true;
}

// Used to verify a choice - user gets the chance to abort choice. -CJS-
export async function getInputConfirmation(prompt: string): Promise<boolean> {
  const confirmed = await getInputConfirmationWithAbort(0, prompt);
  return confirmed === 1;
}

// Used to verify a choice, with the option of aborting (useful for "drop all items")
// and with the option of setting the column for displaying the prompt.
export async function getInputConfirmationWithAbort(column: number, prompt: string): Promise<number> {
  await putStringClearToEOL(prompt, { y: 0, x: column });

  const { x } = curses.getyx();

  if (x > 73) {
    curses.move(0, 73);
  }

  curses.addstr(' [y/n]');

  let key = ' ';
  while (key === ' ') {
    key = await getKeyInput();
  }

  messageLineClear();

  if (key === 'N' || key === 'n') {
    return 0;
  } else if (key === 'Y' || key === 'y') {
    return 1;
  } else {
    return -1;
  }
}

// Pauses for user response before returning -RAK-
export async function waitForContinueKey(line_number: number): Promise<void> {
  await putStringClearToEOL('[ press any key to continue ]', { y: line_number, x: 23 });
  await getKeyInput();
  await eraseLine({ y: line_number, x: 0 });
}

// Provides for a timeout on input. Does a non-blocking read, consuming the data if
// any, and then returns 1 if data was read, zero otherwise.
export function checkForNonBlockingKeyPress(microseconds: number): boolean {
  void microseconds;
  return platform().keyWaiting();
}

// Find a default user name from the system.
export function getDefaultPlayerName(buffer: Ref<string>): void {
  // Gotta have some name
  const default_name = 'X';

  const p = platform().login();

  buffer.v = p.length !== 0 ? p : default_name;
}

// Check user permissions on Unix based systems,
// or if on Windows just return. -MRC-
export function checkFilePermissions(): boolean {
  return true;
}
