// @ts-nocheck
// libGDX 1.14.0's core as the translated game sees it (com.badlogic.gdx: Gdx, Application, Files, Input,
// Preferences, ...). libGDX is Apache-2.0 (Copyright 2011 See AUTHORS file, github.com/libgdx/libgdx); the
// parts here follow its sources (orig/jars/gdx-1.14.0-sources.jar), written by hand for the port.
//
// The backend: as in libGDX, a backend assigns the Gdx.* fields (Gdx.app, Gdx.graphics, Gdx.audio, Gdx.input,
// Gdx.files, Gdx.net, Gdx.gl, Gdx.gl20) with objects that have libGDX's interface methods (Application,
// Graphics, Audio, Input, Files, Net, GL20). headless.ts is the backend without a screen (tests, level
// generation); a browser backend (WebGL, input, audio) assigns its own objects the same way.
import { $J, JObject, JEnum, defineLib, exc, RuntimeException } from '../jre/lang.ts';

/** com.badlogic.gdx.Gdx: the backend's objects (static fields, set by the backend). */
export class Gdx extends JObject {
  static app: any = null;
  static graphics: any = null;
  static audio: any = null;
  static input: any = null;
  static files: any = null;
  static net: any = null;
  static gl: any = null;
  static gl20: any = null;
  static gl30: any = null;
  static gl31: any = null;
  static gl32: any = null;
}
defineLib(Gdx, 'com.badlogic.gdx.Gdx');

/** An enum of the library: constants with Java's name() and ordinal(), values() and valueOf(). */
export function libEnum(name: string, javaName: string, constants: string[], ifaces: string[] = []): any {
  const C = { [name]: class extends JEnum {} }[name];
  defineLib(C, javaName, { kind: 'enum', ifaces });
  C.$VALUES = constants.map((c, i) => {
    const v = new C()._JEnum(c, i);
    C[c] = v;
    return v;
  });
  C.values = () => C.$VALUES.slice();
  C.valueOf = (n: string) => $J.enumValueOf(C, n);
  return C;
}

export const Application_ApplicationType = libEnum('Application_ApplicationType', 'com.badlogic.gdx.Application$ApplicationType',
  ['Android', 'Desktop', 'HeadlessDesktop', 'Applet', 'WebGL', 'iOS']);

export const Files_FileType = libEnum('Files_FileType', 'com.badlogic.gdx.Files$FileType',
  ['Classpath', 'Internal', 'External', 'Absolute', 'Local']);

export const Input_Peripheral = libEnum('Input_Peripheral', 'com.badlogic.gdx.Input$Peripheral',
  ['HardwareKeyboard', 'OnscreenKeyboard', 'MultitouchScreen', 'Vibrator', 'Compass', 'Accelerometer', 'Gyroscope',
    'RotationVector', 'Pressure']);

export const Input_OnscreenKeyboardType = libEnum('Input_OnscreenKeyboardType', 'com.badlogic.gdx.Input$OnscreenKeyboardType',
  ['Default', 'NumberPad', 'PhonePad', 'Email', 'Password', 'URI']);

export const Os = libEnum('Os', 'com.badlogic.gdx.utils.Os', ['Windows', 'Linux', 'MacOsX', 'Android', 'IOS']);

/** SharedLibraryLoader.os: the platform (the browser and node: Linux unless the backend says otherwise). */
export class SharedLibraryLoader extends JObject {
  static os: any = Os.Linux;
  static bitness: any = null;
  static architecture: any = null;
  /** Native libraries (gdx-freetype): none to load, their methods are in the runtime (freetype/). */
  load(_name: string) {}
}
defineLib(SharedLibraryLoader, 'com.badlogic.gdx.utils.SharedLibraryLoader');

/**
 * gdx-controllers' Controllers without controllers (the headless backend has none, as the oracle's: "No
 * controller manager is available for: HeadlessDesktop"); a browser backend may give the Gamepad API's.
 */
export class Controllers extends JObject {
  static listeners: any[] = [];
  static current: any = null;
  static getCurrent() { return Controllers.current; }
  static addListener(l: any) { Controllers.listeners.push(l); }
  static removeListener(l: any) { const i = Controllers.listeners.indexOf(l); if (i >= 0) Controllers.listeners.splice(i, 1); }
}
defineLib(Controllers, 'com.badlogic.gdx.controllers.Controllers');

export const GdxRuntimeException = exc('GdxRuntimeException', RuntimeException, 'com.badlogic.gdx.utils.GdxRuntimeException');

/** TimeUtils: the clock in milliseconds and nanoseconds (longs). */
export class TimeUtils extends JObject {
  static millis(): bigint { return $J.system_currentTimeMillis(); }
  static nanoTime(): bigint { return $J.system_nanoTime(); }
  static timeSinceMillis(prev: bigint): bigint { return TimeUtils.millis() - prev; }
  static timeSinceNanos(prev: bigint): bigint { return TimeUtils.nanoTime() - prev; }
  static nanosToMillis(n: bigint): bigint { return n / 1000000n; }
  static millisToNanos(n: bigint): bigint { return n * 1000000n; }
}
defineLib(TimeUtils, 'com.badlogic.gdx.utils.TimeUtils');

/** ClassReflection: Java reflection through the runtime's class objects. */
export class ClassReflection extends JObject {
  static forName(name: string) {
    try {
      return $J.load('java.lang.Class').forName(name);
    } catch (e) {
      throw new (ReflectionException())('Class not found: ' + name, e);
    }
  }
  static newInstance(c: any) {
    try {
      return c.getDeclaredConstructor().newInstance();
    } catch (e) {
      throw new (ReflectionException())('Could not instantiate instance of class: ' + c.getName(), e);
    }
  }
  static isMemberClass(c: any) { return c.$name.includes('$'); }
  /** A member class is static unless it keeps an enclosing instance (the translator's inner: true). */
  static isStaticClass(c: any) { const m = c.$c && Object.prototype.hasOwnProperty.call(c.$c, '$meta') ? c.$c.$meta : null; return !(m && m.inner); }
  static getSimpleName(c: any) { return c.getSimpleName(); }
  static isAssignableFrom(a: any, b: any) { return a.isAssignableFrom(b); }
  static isInstance(c: any, o: any) { return c.isInstance(o); }
}
defineLib(ClassReflection, 'com.badlogic.gdx.utils.reflect.ClassReflection');
let reflectionException: any = null;
function ReflectionException() {
  return (reflectionException ??= exc('ReflectionException', $J.load('java.lang.Exception'), 'com.badlogic.gdx.utils.reflect.ReflectionException'));
}

/* ------------------------------------------------------------------ input */

/** InputAdapter: an InputProcessor that ignores everything (the game's InputHandler extends it). */
export class InputAdapter extends JObject {
  _InputAdapter(): this { return this; }
  keyDown(_k: number) { return false; }
  keyUp(_k: number) { return false; }
  keyTyped(_c: number) { return false; }
  touchDown(_x: number, _y: number, _p: number, _b: number) { return false; }
  touchUp(_x: number, _y: number, _p: number, _b: number) { return false; }
  touchCancelled(_x: number, _y: number, _p: number, _b: number) { return false; }
  touchDragged(_x: number, _y: number, _p: number) { return false; }
  mouseMoved(_x: number, _y: number) { return false; }
  scrolled(_x: number, _y: number) { return false; }
}
defineLib(InputAdapter, 'com.badlogic.gdx.InputAdapter', { ifaces: ['com.badlogic.gdx.InputProcessor'] });

/** InputMultiplexer: hands each event to its processors in order until one handles it. */
export class InputMultiplexer extends JObject {
  processors: any[];
  constructor(...ps: any[]) {
    super();
    this.processors = ps;
  }
  addProcessor(a: any, b?: any) { if (b === undefined) this.processors.push(a); else this.processors.splice(a, 0, b); }
  removeProcessor(p: any) { const i = typeof p === 'number' ? p : this.processors.indexOf(p); if (i >= 0) this.processors.splice(i, 1); }
  size() { return this.processors.length; }
  clear() { this.processors.length = 0; }
}
for (const m of ['keyDown', 'keyUp', 'keyTyped', 'touchDown', 'touchUp', 'touchCancelled', 'touchDragged', 'mouseMoved', 'scrolled']) {
  (InputMultiplexer.prototype as any)[m] = function (...a: any[]) {
    for (const p of this.processors.slice()) if (p[m](...a)) return true;
    return false;
  };
}
defineLib(InputMultiplexer, 'com.badlogic.gdx.InputMultiplexer', { ifaces: ['com.badlogic.gdx.InputProcessor'] });

/** Input.Keys: libGDX's key codes and their names (Keys.toString). */
export class Input_Keys extends JObject {
  static names: Map<number, string> = null;
  static toString(code: number): string {
    const n = Input_Keys.names.get(code);
    return n === undefined ? null : n;
  }
  static valueOf(name: string): number {
    for (const [k, v] of Input_Keys.names) if (v === name) return k;
    return -1;
  }
}
defineLib(Input_Keys, 'com.badlogic.gdx.Input$Keys');
// Input.Keys (gdx-1.14.0 Input.java): the constants and the names Keys.toString gives them
const KEYS: [string, number, string][] = [
  ['ANY_KEY', -1, null], ['NUM_0', 7, '0'], ['NUM_1', 8, '1'], ['NUM_2', 9, '2'], ['NUM_3', 10, '3'], ['NUM_4', 11, '4'],
  ['NUM_5', 12, '5'], ['NUM_6', 13, '6'], ['NUM_7', 14, '7'], ['NUM_8', 15, '8'], ['NUM_9', 16, '9'], ['A', 29, 'A'],
  ['ALT_LEFT', 57, 'L-Alt'], ['ALT_RIGHT', 58, 'R-Alt'], ['APOSTROPHE', 75, "'"], ['AT', 77, '@'], ['B', 30, 'B'],
  ['BACK', 4, 'Back'], ['BACKSLASH', 73, '\\'], ['C', 31, 'C'], ['CALL', 5, 'Call'], ['CAMERA', 27, 'Camera'],
  ['CAPS_LOCK', 115, 'Caps Lock'], ['CLEAR', 28, 'Clear'], ['COMMA', 55, ','], ['D', 32, 'D'], ['DEL', 67, 'Delete'],
  ['BACKSPACE', 67, 'Delete'], ['FORWARD_DEL', 112, 'Forward Delete'], ['DPAD_CENTER', 23, 'Center'],
  ['DPAD_DOWN', 20, 'Down'], ['DPAD_LEFT', 21, 'Left'], ['DPAD_RIGHT', 22, 'Right'], ['DPAD_UP', 19, 'Up'],
  ['CENTER', 23, 'Center'], ['DOWN', 20, 'Down'], ['LEFT', 21, 'Left'], ['RIGHT', 22, 'Right'], ['UP', 19, 'Up'],
  ['E', 33, 'E'], ['ENDCALL', 6, 'End Call'], ['ENTER', 66, 'Enter'], ['ENVELOPE', 65, 'Envelope'], ['EQUALS', 70, '='],
  ['EXPLORER', 64, 'Explorer'], ['F', 34, 'F'], ['FOCUS', 80, 'Focus'], ['G', 35, 'G'], ['GRAVE', 68, '`'], ['H', 36, 'H'],
  ['HEADSETHOOK', 79, 'Headset Hook'], ['HOME', 3, 'Home'], ['I', 37, 'I'], ['J', 38, 'J'], ['K', 39, 'K'], ['L', 40, 'L'],
  ['LEFT_BRACKET', 71, '['], ['M', 41, 'M'], ['MEDIA_FAST_FORWARD', 90, 'Fast Forward'], ['MEDIA_NEXT', 87, 'Next Media'],
  ['MEDIA_PLAY_PAUSE', 85, 'Play/Pause'], ['MEDIA_PREVIOUS', 88, 'Prev Media'], ['MEDIA_REWIND', 89, 'Rewind'],
  ['MEDIA_STOP', 86, 'Stop Media'], ['MENU', 82, 'Menu'], ['MINUS', 69, '-'], ['MUTE', 91, 'Mute'], ['N', 42, 'N'],
  ['NOTIFICATION', 83, 'Notification'], ['NUM', 78, 'Num'], ['O', 43, 'O'], ['P', 44, 'P'], ['PERIOD', 56, '.'],
  ['PLUS', 81, 'Plus'], ['POUND', 18, '#'], ['POWER', 26, 'Power'], ['Q', 45, 'Q'], ['R', 46, 'R'],
  ['RIGHT_BRACKET', 72, ']'], ['S', 47, 'S'], ['SEARCH', 84, 'Search'], ['SEMICOLON', 74, ';'], ['SHIFT_LEFT', 59, 'L-Shift'],
  ['SHIFT_RIGHT', 60, 'R-Shift'], ['SLASH', 76, '/'], ['SOFT_LEFT', 1, 'Soft Left'], ['SOFT_RIGHT', 2, 'Soft Right'],
  ['SPACE', 62, 'Space'], ['STAR', 17, '*'], ['SYM', 63, 'SYM'], ['T', 48, 'T'], ['TAB', 61, 'Tab'], ['U', 49, 'U'],
  ['UNKNOWN', 0, 'Unknown'], ['V', 50, 'V'], ['VOLUME_DOWN', 25, 'Volume Down'], ['VOLUME_UP', 24, 'Volume Up'],
  ['W', 51, 'W'], ['X', 52, 'X'], ['Y', 53, 'Y'], ['Z', 54, 'Z'], ['META_ALT_LEFT_ON', 16, null], ['META_ALT_ON', 2, null],
  ['META_ALT_RIGHT_ON', 32, null], ['META_SHIFT_LEFT_ON', 64, null], ['META_SHIFT_ON', 1, null],
  ['META_SHIFT_RIGHT_ON', 128, null], ['META_SYM_ON', 4, null], ['CONTROL_LEFT', 129, 'L-Ctrl'], ['CONTROL_RIGHT', 130, 'R-Ctrl'],
  ['ESCAPE', 111, 'Escape'], ['END', 123, 'End'], ['INSERT', 124, 'Insert'], ['PAGE_UP', 92, 'Page Up'],
  ['PAGE_DOWN', 93, 'Page Down'], ['PICTSYMBOLS', 94, 'PICTSYMBOLS'], ['SWITCH_CHARSET', 95, 'SWITCH_CHARSET'],
  ['BUTTON_CIRCLE', 255, 'Circle Button'], ['BUTTON_A', 96, 'A Button'], ['BUTTON_B', 97, 'B Button'],
  ['BUTTON_C', 98, 'C Button'], ['BUTTON_X', 99, 'X Button'], ['BUTTON_Y', 100, 'Y Button'], ['BUTTON_Z', 101, 'Z Button'],
  ['BUTTON_L1', 102, 'L1 Button'], ['BUTTON_R1', 103, 'R1 Button'], ['BUTTON_L2', 104, 'L2 Button'],
  ['BUTTON_R2', 105, 'R2 Button'], ['BUTTON_THUMBL', 106, 'Left Thumb'], ['BUTTON_THUMBR', 107, 'Right Thumb'],
  ['BUTTON_START', 108, 'Start'], ['BUTTON_SELECT', 109, 'Select'], ['BUTTON_MODE', 110, 'Button Mode'],
  ['NUMPAD_0', 144, 'Numpad 0'], ['NUMPAD_1', 145, 'Numpad 1'], ['NUMPAD_2', 146, 'Numpad 2'], ['NUMPAD_3', 147, 'Numpad 3'],
  ['NUMPAD_4', 148, 'Numpad 4'], ['NUMPAD_5', 149, 'Numpad 5'], ['NUMPAD_6', 150, 'Numpad 6'], ['NUMPAD_7', 151, 'Numpad 7'],
  ['NUMPAD_8', 152, 'Numpad 8'], ['NUMPAD_9', 153, 'Numpad 9'], ['NUMPAD_DIVIDE', 154, 'Num /'],
  ['NUMPAD_MULTIPLY', 155, 'Num *'], ['NUMPAD_SUBTRACT', 156, 'Num -'], ['NUMPAD_ADD', 157, 'Num +'],
  ['NUMPAD_DOT', 158, 'Num .'], ['NUMPAD_COMMA', 159, 'Num ,'], ['NUMPAD_ENTER', 160, 'Num Enter'],
  ['NUMPAD_EQUALS', 161, 'Num ='], ['NUMPAD_LEFT_PAREN', 162, 'Num ('], ['NUMPAD_RIGHT_PAREN', 163, 'Num )'],
  ['NUM_LOCK', 143, 'Num Lock'], ['COLON', 243, ':'], ['F1', 131, 'F1'], ['F2', 132, 'F2'], ['F3', 133, 'F3'],
  ['F4', 134, 'F4'], ['F5', 135, 'F5'], ['F6', 136, 'F6'], ['F7', 137, 'F7'], ['F8', 138, 'F8'], ['F9', 139, 'F9'],
  ['F10', 140, 'F10'], ['F11', 141, 'F11'], ['F12', 142, 'F12'], ['F13', 183, 'F13'], ['F14', 184, 'F14'],
  ['F15', 185, 'F15'], ['F16', 186, 'F16'], ['F17', 187, 'F17'], ['F18', 188, 'F18'], ['F19', 189, 'F19'],
  ['F20', 190, 'F20'], ['F21', 191, 'F21'], ['F22', 192, 'F22'], ['F23', 193, 'F23'], ['F24', 194, 'F24'],
  ['MAX_KEYCODE', 255, null], ['PRINT_SCREEN', 120, 'Print'], ['SCROLL_LOCK', 116, 'Scroll Lock'], ['PAUSE', 121, 'Pause'],
];
Input_Keys.names = new Map();
for (const [n, code, name] of KEYS) {
  (Input_Keys as any)[n] = code;
  if (name != null && !Input_Keys.names.has(code)) Input_Keys.names.set(code, name);
}
Input_Keys.names.set(255, 'Circle Button'); // MAX_KEYCODE shares BUTTON_CIRCLE's code

/* ------------------------------------------------------------------ Preferences */

/**
 * Preferences kept in memory (libGDX's headless and desktop backends keep them in a properties file; the
 * browser's in localStorage or server storage: a backend gives getPreferences its own object). Values are
 * stored as libGDX's desktop backend stores them, as strings, and read back with its conversions.
 */
export class MemoryPreferences extends JObject {
  values = new Map<string, string>();
  /** Called by flush() (a backend persists the preferences here). */
  onFlush: ((p: MemoryPreferences) => void) | null = null;
  putBoolean(k: string, v: boolean) { this.values.set(k, String(v)); return this; }
  putInteger(k: string, v: number) { this.values.set(k, String(v)); return this; }
  putLong(k: string, v: bigint) { this.values.set(k, String(v)); return this; }
  putFloat(k: string, v: number) { this.values.set(k, $J.fstr(v)); return this; }
  putString(k: string, v: string) { this.values.set(k, v); return this; }
  getBoolean(k: string, def = false) { const v = this.values.get(k); return v === undefined ? def : v.toLowerCase() === 'true'; }
  getInteger(k: string, def = 0) { const v = this.values.get(k); if (v === undefined) return def; try { return $J.parseInt(v); } catch { return def; } }
  getLong(k: string, def: bigint = 0n) { const v = this.values.get(k); if (v === undefined) return def; try { return $J.parseLong(v); } catch { return def; } }
  getFloat(k: string, def = 0) { const v = this.values.get(k); if (v === undefined) return def; try { return Math.fround($J.parseDouble(v)); } catch { return def; } }
  getString(k: string, def = '') { const v = this.values.get(k); return v === undefined ? def : v; }
  contains(k: string) { return this.values.has(k); }
  remove(k: string) { this.values.delete(k); }
  clear() { this.values.clear(); }
  flush() { if (this.onFlush) this.onFlush(this); }
}
defineLib(MemoryPreferences, 'com.badlogic.gdx.Preferences', { kind: 'interface' });

/** An in-memory clipboard. */
export class MemoryClipboard extends JObject {
  text: string = null;
  hasContents() { return this.text != null && this.text.length > 0; }
  getContents() { return this.text; }
  setContents(s: string) { this.text = s; }
}
