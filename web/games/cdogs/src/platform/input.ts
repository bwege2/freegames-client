// C-Dogs SDL 2.5.0, translated: input (events.c, keyboard.c, joystick.c, mouse.c). Browser keys become SDL scancodes
// (the original keeps keys as scancodes and shows them by SDL_GetScancodeName), gamepads with the standard mapping
// become SDL game controllers. GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import {
  CMD_BUTTON1, CMD_BUTTON2, CMD_DOWN, CMD_ESC, CMD_GRENADE, CMD_LEFT, CMD_MAP, CMD_RIGHT, CMD_UP, AnyButton, Button1,
  type Vec2i,
} from '../core/base.ts';
import { ConfigGetInt } from '../core/config.ts';
import { INPUT_DEVICE_AI, INPUT_DEVICE_JOYSTICK, INPUT_DEVICE_KEYBOARD, INPUT_DEVICE_UNSET, type PlayerData } from '../core/types.ts';
import { gPlayerDatas } from '../core/state.ts';
import { platformHooks } from '../core/hooks.ts';

// SDL_scancode.h, by KeyboardEvent.code
const CODES: Record<string, number> = {};
const NAMES: Record<number, string> = {};
function sc(code: string, n: number, name: string): void {
  CODES[code] = n;
  NAMES[n] = name;
}
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c, i) => sc(`Key${c}`, 4 + i, c));
'1234567890'.split('').forEach((c, i) => sc(`Digit${c}`, 30 + i, c));
sc('Enter', 40, 'Return');
sc('Escape', 41, 'Escape');
sc('Backspace', 42, 'Backspace');
sc('Tab', 43, 'Tab');
sc('Space', 44, 'Space');
sc('Minus', 45, '-');
sc('Equal', 46, '=');
sc('BracketLeft', 47, '[');
sc('BracketRight', 48, ']');
sc('Backslash', 49, '\\');
sc('Semicolon', 51, ';');
sc('Quote', 52, "'");
sc('Backquote', 53, '`');
sc('Comma', 54, ',');
sc('Period', 55, '.');
sc('Slash', 56, '/');
sc('CapsLock', 57, 'CapsLock');
for (let i = 1; i <= 12; i++) sc(`F${i}`, 57 + i, `F${i}`);
sc('PrintScreen', 70, 'PrintScreen');
sc('ScrollLock', 71, 'ScrollLock');
sc('Pause', 72, 'Pause');
sc('Insert', 73, 'Insert');
sc('Home', 74, 'Home');
sc('PageUp', 75, 'PageUp');
sc('Delete', 76, 'Delete');
sc('End', 77, 'End');
sc('PageDown', 78, 'PageDown');
sc('ArrowRight', 79, 'Right');
sc('ArrowLeft', 80, 'Left');
sc('ArrowDown', 81, 'Down');
sc('ArrowUp', 82, 'Up');
sc('NumLock', 83, 'Numlock');
sc('NumpadDivide', 84, 'Keypad /');
sc('NumpadMultiply', 85, 'Keypad *');
sc('NumpadSubtract', 86, 'Keypad -');
sc('NumpadAdd', 87, 'Keypad +');
sc('NumpadEnter', 88, 'Keypad Enter');
'1234567890'.split('').forEach((c, i) => sc(`Numpad${c}`, 89 + i, `Keypad ${c}`));
sc('NumpadDecimal', 99, 'Keypad .');
sc('ControlLeft', 224, 'Left Ctrl');
sc('ShiftLeft', 225, 'Left Shift');
sc('AltLeft', 226, 'Left Alt');
sc('MetaLeft', 227, 'Left GUI');
sc('ControlRight', 228, 'Right Ctrl');
sc('ShiftRight', 229, 'Right Shift');
sc('AltRight', 230, 'Right Alt');
sc('MetaRight', 231, 'Right GUI');
export const SDL_SCANCODE_RETURN = 40;
export const SDL_SCANCODE_ESCAPE = 41;
export const SDL_SCANCODE_BACKSPACE = 42;
export const SDL_SCANCODE_LEFT = 80;
export const SDL_SCANCODE_RIGHT = 79;
export const SDL_SCANCODE_UP = 82;
export const SDL_SCANCODE_DOWN = 81;
export const SDL_SCANCODE_F9 = 66;
export const SDL_SCANCODE_F10 = 67;
const NUM = 512;
export const ARROW_UP = '\x1e';
export const ARROW_DOWN = '\x1f';
export const ARROW_LEFT = '\x11';
export const ARROW_RIGHT = '\x10';
export const BACKSPACE_CHAR = '\x08';
export const ENTER_CHAR = '\x0d';
export function SDL_GetScancodeName(k: number): string {
  return NAMES[k] ?? '';
}
function GetKeyName(k: number): string {
  switch (k) {
    case SDL_SCANCODE_LEFT: return ARROW_LEFT;
    case SDL_SCANCODE_RIGHT: return ARROW_RIGHT;
    case SDL_SCANCODE_UP: return ARROW_UP;
    case SDL_SCANCODE_DOWN: return ARROW_DOWN;
    default: return SDL_GetScancodeName(k);
  }
}
export function scancodeOf(code: string): number {
  return CODES[code] ?? 0;
}

export interface InputKeys { left: number; right: number; up: number; down: number; button1: number; button2: number; grenade: number; map: number }
function KeyLoadPlayerKeys(i: number): InputKeys {
  const g = (n: string): number => ConfigGetInt(`Input.PlayerCodes${i}.${n}`);
  return { left: g('left'), right: g('right'), up: g('up'), down: g('down'), button1: g('button1'), button2: g('button2'), grenade: g('grenade'), map: g('map') };
}
export const MAX_KEYBOARD_CONFIGS = 2;
const KEYBOARD_REPEAT_DELAY = 1500;
const KEYBOARD_REPEAT_TICKS = 300;

interface Joystick { id: number; index: number; currentCmd: number; previousCmd: number; pressedCmd: number; lockedCmd: number; name: string }

/** gEventHandlers */
export const ev = {
  current: new Uint8Array(NUM),
  previous: new Uint8Array(NUM),
  pressed: new Uint8Array(NUM),
  locked: new Uint8Array(NUM),
  /** keys going down/up since the last poll (browser events between frames) */
  queue: [] as [number, boolean][],
  repeatedTicks: 0,
  isFirstRepeat: true,
  PlayerKeys: [] as InputKeys[],
  Typed: '',
  typedQueue: '',
  joysticks: [] as Joystick[],
  mouse: { pos: { x: 0, y: 0 }, previous: 0, current: 0, pressed: 0, wheel: { x: 0, y: 0 }, wheelQueue: { x: 0, y: 0 }, queue: [] as [number, boolean][], moved: false },
  HasQuit: false,
  HasLostFocus: false,
};

export function KeyInit(): void {
  ev.current.fill(0);
  ev.previous.fill(0);
  ev.pressed.fill(0);
  ev.locked.fill(0);
  ev.repeatedTicks = 0;
  ev.isFirstRepeat = true;
  ev.PlayerKeys = [];
  for (let i = 0; i < MAX_KEYBOARD_CONFIGS; i++) ev.PlayerKeys.push(KeyLoadPlayerKeys(i));
}
export function KeyLockKeys(): void {
  ev.locked.set(ev.current);
}
export function JoyLock(): void {
  for (const j of ev.joysticks) j.lockedCmd = j.currentCmd;
}
platformHooks.lockInput = () => {
  KeyLockKeys();
  JoyLock();
};
platformHooks.buttonName = (p: PlayerData, cmd: number) => InputGetButtonNameColor(p.inputDevice, p.deviceIndex, cmd).name;
platformHooks.hasGrenadeButton = (p: PlayerData) => InputHasGrenadeButton(p.inputDevice, p.deviceIndex);

/** browser key events go here (code: KeyboardEvent.code) */
export function onKey(code: string, down: boolean, repeat: boolean): boolean {
  const k = scancodeOf(code);
  if (!k) return false;
  if (down && repeat) return true;
  ev.queue.push([k, down]);
  return true;
}
export function onText(s: string): void {
  ev.typedQueue += s;
}

function pollGamepads(): void {
  const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
  const seen = new Set<number>();
  for (const gp of pads) {
    if (!gp || gp.mapping !== 'standard') continue;
    seen.add(gp.index);
    let j = ev.joysticks.find((x) => x.index === gp.index);
    if (!j) {
      j = { id: gp.index, index: gp.index, currentCmd: 0, previousCmd: 0, pressedCmd: 0, lockedCmd: 0, name: gp.id };
      ev.joysticks.push(j);
      for (const p of gPlayerDatas) {
        if (p.inputDevice === INPUT_DEVICE_UNSET) {
          p.inputDevice = INPUT_DEVICE_JOYSTICK;
          p.deviceIndex = j.id;
          break;
        }
      }
    }
    const b = (i: number): boolean => !!gp.buttons[i] && gp.buttons[i].pressed;
    const ax = (i: number): number => gp.axes[i] ?? 0;
    const DEAD = 0.5;
    const cmds: [number, boolean][] = [
      [CMD_BUTTON1, b(0) || (gp.buttons[7]?.value ?? 0) > DEAD], [CMD_BUTTON2, b(1)], [CMD_MAP, b(8)], [CMD_ESC, b(9)],
      [CMD_GRENADE, b(5)], [CMD_UP, b(12) || ax(1) < -DEAD], [CMD_DOWN, b(13) || ax(1) > DEAD],
      [CMD_LEFT, b(14) || ax(0) < -DEAD], [CMD_RIGHT, b(15) || ax(0) > DEAD],
    ];
    for (const [cmd, down] of cmds) {
      if (down) j.currentCmd |= cmd;
      else {
        if ((j.currentCmd & cmd) && !(j.previousCmd & cmd)) j.pressedCmd |= cmd;
        j.currentCmd &= ~cmd;
        j.lockedCmd &= ~cmd;
      }
    }
  }
  for (let i = ev.joysticks.length - 1; i >= 0; i--) {
    const j = ev.joysticks[i];
    if (!seen.has(j.index)) {
      ev.joysticks.splice(i, 1);
      for (const p of gPlayerDatas) {
        if (p.inputDevice === INPUT_DEVICE_JOYSTICK && p.deviceIndex === j.id) {
          p.inputDevice = INPUT_DEVICE_UNSET;
          p.deviceIndex = 0;
          break;
        }
      }
    }
  }
}

/** EventPoll */
export function EventPoll(ticks: number): void {
  ev.previous.set(ev.current);
  ev.Typed = ev.typedQueue;
  ev.typedQueue = '';
  for (const j of ev.joysticks) {
    j.pressedCmd = 0;
    j.previousCmd = j.currentCmd;
  }
  const m = ev.mouse;
  m.previous = m.current;
  m.wheel = m.wheelQueue;
  m.wheelQueue = { x: 0, y: 0 };
  for (const [k, down] of ev.queue) {
    ev.current[k] = down ? 1 : 0;
    if (!down) ev.locked[k] = 0;
  }
  ev.queue.length = 0;
  for (const [b, down] of m.queue) {
    if (down) m.current |= 1 << b;
    else m.current &= ~(1 << b);
  }
  m.queue.length = 0;
  m.pressed = m.current & ~m.previous;
  pollGamepads();
  // KeyPostPoll
  let same = true;
  for (let i = 0; i < NUM; i++) {
    if (ev.previous[i] !== ev.current[i]) {
      same = false;
      break;
    }
  }
  if (same) ev.repeatedTicks += ticks;
  else {
    ev.repeatedTicks = 0;
    ev.isFirstRepeat = true;
  }
  let isRepeating = false;
  if (ev.repeatedTicks > KEYBOARD_REPEAT_DELAY && ev.isFirstRepeat) {
    ev.repeatedTicks -= KEYBOARD_REPEAT_DELAY;
    isRepeating = true;
  } else if (ev.repeatedTicks > KEYBOARD_REPEAT_TICKS && !ev.isFirstRepeat) {
    ev.repeatedTicks -= KEYBOARD_REPEAT_TICKS;
    isRepeating = true;
  }
  if (isRepeating) {
    ev.pressed.set(ev.current);
    ev.isFirstRepeat = false;
    ev.pressed[83] = 0;
    ev.pressed[57] = 0;
    ev.pressed[71] = 0;
  } else {
    for (let i = 0; i < NUM; i++) ev.pressed[i] = ev.current[i] && !ev.previous[i] ? 1 : 0;
  }
}
export const KeyIsDown = (k: number): boolean => !ev.locked[k] && !!ev.current[k];
export const KeyIsPressed = (k: number): boolean => !!ev.pressed[k];
export function KeyGetPressed(): number {
  for (let i = 0; i < NUM; i++) if (ev.pressed[i]) return i;
  return 0;
}
function joy(id: number): Joystick | undefined {
  return ev.joysticks.find((j) => j.id === id);
}
const JoyIsDown = (id: number, cmd: number): boolean => {
  const j = joy(id);
  return !!j && !!(j.currentCmd & cmd) && !(j.lockedCmd & cmd);
};
const JoyIsPressed = (id: number, cmd: number): boolean => JoyIsDown(id, cmd) && !(joy(id)!.previousCmd & cmd);

export function GetKeyboardCmd(kbIndex: number, isPressed: boolean): number {
  const f = isPressed ? KeyIsPressed : KeyIsDown;
  const keys = ev.PlayerKeys[kbIndex];
  if (!keys) return 0;
  let cmd = 0;
  if (f(keys.left)) cmd |= CMD_LEFT;
  else if (f(keys.right)) cmd |= CMD_RIGHT;
  if (f(keys.up)) cmd |= CMD_UP;
  else if (f(keys.down)) cmd |= CMD_DOWN;
  if (f(keys.button1)) cmd |= CMD_BUTTON1;
  if (f(keys.button2)) cmd |= CMD_BUTTON2;
  if (f(keys.grenade)) cmd |= CMD_GRENADE;
  return cmd;
}
function GetJoystickCmd(id: number, isPressed: boolean): number {
  const f = isPressed ? JoyIsPressed : JoyIsDown;
  let cmd = 0;
  if (f(id, CMD_LEFT)) cmd |= CMD_LEFT;
  else if (f(id, CMD_RIGHT)) cmd |= CMD_RIGHT;
  if (f(id, CMD_UP)) cmd |= CMD_UP;
  else if (f(id, CMD_DOWN)) cmd |= CMD_DOWN;
  for (const c of [CMD_BUTTON1, CMD_BUTTON2, CMD_GRENADE, CMD_MAP, CMD_ESC]) if (f(id, c)) cmd |= c;
  return cmd;
}
export function GetGameCmd(p: PlayerData): number {
  switch (p.inputDevice) {
    case INPUT_DEVICE_KEYBOARD: return GetKeyboardCmd(p.deviceIndex, false);
    case INPUT_DEVICE_JOYSTICK: return GetJoystickCmd(p.deviceIndex, false);
    default: return 0;
  }
}
export function GetOnePlayerCmd(isPressed: boolean, device: number, deviceIndex: number): number {
  switch (device) {
    case INPUT_DEVICE_KEYBOARD: return GetKeyboardCmd(deviceIndex, isPressed);
    case INPUT_DEVICE_JOYSTICK: return GetJoystickCmd(deviceIndex, isPressed);
    default: return 0;
  }
}
/** GetPlayerCmds: for the local players with a device, the pressed commands */
export function GetPlayerCmds(): number[] {
  const cmds = [0, 0, 0, 0];
  let idx = 0;
  for (const p of gPlayerDatas) {
    if (!p.IsLocal || !p.isOwn) continue;
    if (p.inputDevice !== INPUT_DEVICE_UNSET && idx < 4) cmds[idx] = GetOnePlayerCmd(true, p.inputDevice, p.deviceIndex);
    idx++;
  }
  return cmds;
}
export function MouseIsPressed(b: number): boolean {
  return !!(ev.mouse.pressed & (1 << b));
}
export function MouseIsDown(b: number): boolean {
  return !!(ev.mouse.current & (1 << b));
}
export const SDL_BUTTON_LEFT = 1;
export const SDL_BUTTON_RIGHT = 3;
export function GetMenuCmd(useMouse: boolean): number {
  const firstJoy = ev.joysticks[0];
  const firstJoyPressedEsc = firstJoy ? JoyIsPressed(firstJoy.id, CMD_ESC) : false;
  if (KeyIsPressed(SDL_SCANCODE_ESCAPE) || firstJoyPressedEsc) return CMD_ESC;
  let cmd = GetOnePlayerCmd(true, INPUT_DEVICE_KEYBOARD, 0);
  if (!cmd) {
    if (KeyIsPressed(SDL_SCANCODE_LEFT)) cmd |= CMD_LEFT;
    else if (KeyIsPressed(SDL_SCANCODE_RIGHT)) cmd |= CMD_RIGHT;
    if (KeyIsPressed(SDL_SCANCODE_UP)) cmd |= CMD_UP;
    else if (KeyIsPressed(SDL_SCANCODE_DOWN)) cmd |= CMD_DOWN;
    if (KeyIsPressed(SDL_SCANCODE_RETURN)) cmd |= CMD_BUTTON1;
    if (KeyIsPressed(SDL_SCANCODE_BACKSPACE)) cmd |= CMD_BUTTON2;
  }
  if (!cmd && firstJoy) cmd = GetOnePlayerCmd(true, INPUT_DEVICE_JOYSTICK, firstJoy.id);
  if (!cmd) {
    if (MouseIsPressed(SDL_BUTTON_LEFT) && useMouse) cmd |= CMD_BUTTON1;
    else if (MouseIsPressed(SDL_BUTTON_RIGHT)) cmd |= CMD_BUTTON2;
  }
  return cmd;
}
export function InputGetButtonNameColor(d: number, dIndex: number, cmd: number): { name: string; color: { r: number; g: number; b: number; a: number } } {
  const color = { r: 255, g: 255, b: 255, a: 255 };
  switch (d) {
    case INPUT_DEVICE_KEYBOARD: {
      const k = ev.PlayerKeys[dIndex] ?? KeyLoadPlayerKeys(dIndex);
      const m: Record<number, number> = {
        [CMD_LEFT]: k.left, [CMD_RIGHT]: k.right, [CMD_UP]: k.up, [CMD_DOWN]: k.down, [CMD_BUTTON1]: k.button1,
        [CMD_BUTTON2]: k.button2, [CMD_GRENADE]: k.grenade, [CMD_MAP]: k.map, [CMD_ESC]: SDL_SCANCODE_ESCAPE,
      };
      return { name: m[cmd] !== undefined ? GetKeyName(m[cmd]) : '', color };
    }
    case INPUT_DEVICE_JOYSTICK: {
      // SDL_JoystickButtonNames: the standard layout's names
      const names: Record<number, string> = {
        [CMD_BUTTON1]: 'A', [CMD_BUTTON2]: 'B', [CMD_GRENADE]: 'RB', [CMD_MAP]: 'Back', [CMD_ESC]: 'Start',
        [CMD_UP]: ARROW_UP, [CMD_DOWN]: ARROW_DOWN, [CMD_LEFT]: ARROW_LEFT, [CMD_RIGHT]: ARROW_RIGHT,
      };
      const colors: Record<number, [number, number, number]> = { [CMD_BUTTON1]: [96, 192, 96], [CMD_BUTTON2]: [192, 96, 96] };
      const c = colors[cmd];
      return { name: names[cmd] ?? '?', color: c ? { r: c[0], g: c[1], b: c[2], a: 255 } : color };
    }
    default:
      return { name: '', color };
  }
}
export function InputHasGrenadeButton(d: number, dIndex: number): boolean {
  switch (d) {
    case INPUT_DEVICE_UNSET: return false;
    case INPUT_DEVICE_KEYBOARD: return (ev.PlayerKeys[dIndex] ?? KeyLoadPlayerKeys(dIndex)).grenade !== 0;
    case INPUT_DEVICE_JOYSTICK: return true;
    case INPUT_DEVICE_AI: return false;
    default: return true;
  }
}
export function JoyName(id: number): string {
  return joy(id)?.name ?? '';
}
export const EVENT_WAIT_CONTINUE = 0;
export const EVENT_WAIT_OK = 1;
export const EVENT_WAIT_CANCEL = 2;
export function EventIsEscape(cmds: number[], menuCmd: number): boolean {
  if (cmds.some((c) => c & CMD_ESC)) return true;
  if (KeyIsPressed(SDL_SCANCODE_ESCAPE) || ev.HasQuit) return true;
  return (menuCmd & CMD_ESC) !== 0;
}
export function EventWaitForAnyKeyOrButton(): number {
  const cmds = GetPlayerCmds();
  for (const c of cmds) if (AnyButton(c)) return Button1(c) ? EVENT_WAIT_OK : EVENT_WAIT_CANCEL;
  const menuCmd = GetMenuCmd(true);
  if (AnyButton(menuCmd)) return Button1(menuCmd) ? EVENT_WAIT_OK : EVENT_WAIT_CANCEL;
  if (EventIsEscape(cmds, menuCmd)) return EVENT_WAIT_CANCEL;
  return EVENT_WAIT_CONTINUE;
}
export function JoystickIds(): number[] {
  return ev.joysticks.map((j) => j.id);
}
export function mouseMove(p: Vec2i): void {
  ev.mouse.pos = p;
  ev.mouse.moved = true;
}
export function mouseButton(b: number, down: boolean): void {
  ev.mouse.queue.push([b, down]);
}
export function mouseWheel(x: number, y: number): void {
  ev.mouse.wheelQueue = { x: ev.mouse.wheelQueue.x + x, y: ev.mouse.wheelQueue.y + y };
}
