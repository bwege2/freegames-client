// The page's own parts around the engine (src/scenarios.ts, src/timer.ts, src/keys.ts, src/input.ts), each against
// the original: the scenario list reads Title.txt and the cores as C4ScenarioListLoader does and orders them by its
// EntrySortFunc; the game timer runs the original's 26 ms ticks and SetGameSpeed; every browser key reaches the K_
// code the original's SDL build gives the same key (C4AppSDL.cpp's table, C4KeyboardInput.cpp's names); a key press
// reaches the local player's controls.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { re, planet } from './oracle.ts';
import { pack, packMissing, packedGroups } from './content.ts';
import { readScenarioFolder, compareFolders, languageString } from '../src/scenarios.ts';
import { GameTimer, GAME_TIMER_DELAY, MAX_EVENTS } from '../src/timer.ts';
import { KEY_NAMES } from '../src/keys.ts';
import { keyEvent, keyCodeByName, translatedPath } from '../src/input.ts';
import { boot } from '../src/boot.ts';
import { initGlobals } from '../src/sim/index.ts';
import { $ } from '../src/rt/registry.ts';

const FOLDERS = ['Tutorials.ocf', 'Missions.ocf', 'Worlds.ocf', 'Parkour.ocf', 'Defense.ocf', 'Arena.ocf'];
const src = path.join(re, 'orig/openclonk/src');

test('the scenario list: titles from Title.txt, folders by their index, scenarios by icon, difficulty and name', { skip: packMissing(FOLDERS) || (fs.existsSync(planet) ? false : 'no reference source') }, () => {
  const folders = FOLDERS.map((f) => readScenarioFolder(f, new Uint8Array(fs.readFileSync(path.join(pack, f)))));
  // every scenario of planet/ is there, with the title its Title.txt gives for US
  for (const f of folders) {
    const dirs = fs.readdirSync(path.join(planet, f.name)).filter((d) => d.endsWith('.ocs')).sort();
    assert.deepEqual(f.scenarios.map((s) => s.path.split('/')[1]).sort(), dirs, f.name);
    for (const s of f.scenarios) {
      const t = path.join(planet, s.path, 'Title.txt');
      if (fs.existsSync(t)) assert.equal(s.title, languageString(fs.readFileSync(t, 'utf8')), s.path);
    }
  }
  assert.deepEqual([...folders].sort(compareFolders).map((f) => f.title), ['Tutorials', 'Missions', 'Worlds', 'Parkour', 'Defense', 'Arena']);
  const tutorials = folders[0];
  assert.deepEqual(tutorials.scenarios.map((s) => s.path.split('/')[1]),
    ['Tutorial01.ocs', 'Tutorial02.ocs', 'Tutorial03.ocs', 'Tutorial04.ocs', 'Tutorial05.ocs', 'Tutorial06.ocs', 'Tutorial07.ocs', 'Tutorial08.ocs', 'Sandbox.ocs'],
    'standard icons 2..9 first, then the rest by difficulty');
  assert.equal(tutorials.scenarios[0].title, 'Wandering Wipf');
  // within a folder without standard icons: by Difficulty, then by name
  for (const f of folders) {
    for (let i = 1; i < f.scenarios.length; i++) {
      const a = f.scenarios[i - 1], b = f.scenarios[i];
      if (a.icon >= 2 && a.icon <= 11) continue;
      if (a.difficulty && b.difficulty) assert.ok(a.difficulty <= b.difficulty, `${a.path} before ${b.path}`);
    }
  }
});

test('the game timer: one tick per 26 ms on any display rate; SetGameSpeed as C4ApplicationGameTimer::SetGameTickDelay', () => {
  const ticks = (t: GameTimer, fps: number, ms: number) => {
    let n = 0;
    for (let time = 0; time <= ms; time += 1000 / fps) n += t.frame(time, () => {});
    return n;
  };
  for (const fps of [30, 60, 120, 144]) {
    const n = ticks(new GameTimer(), fps, 10_000);
    assert.ok(Math.abs(n - 10_000 / GAME_TIMER_DELAY) <= 2, `${fps} Hz: ${n} ticks in 10 s`);
  }
  // SetGameSpeed(50): 1000 / 50 = 20 ms < MaxRefreshDelay
  const fast = new GameTimer();
  fast.SetGameTickDelay(20);
  assert.ok(Math.abs(ticks(fast, 144, 10_000) - 500) <= 2);
  // SetGameSpeed(10): 100 ms >= 30: the timer runs every 30 ms, the extra delay is never consulted (see timer.ts)
  const slow = new GameTimer();
  slow.SetGameTickDelay(100);
  assert.equal(slow.delay, 30);
  assert.equal(slow.extraGameTickDelay, 100);
  assert.ok(Math.abs(ticks(slow, 60, 10_000) - 333) <= 2);
  // a hidden tab: at most MAX_EVENTS ticks catch up, the rest are dropped like late timerfd expirations
  const t = new GameTimer();
  t.frame(0, () => {});
  assert.equal(t.frame(5_000, () => {}), MAX_EVENTS);
  assert.equal(t.frame(5_016, () => {}), 0);
  assert.equal(t.frame(5_030, () => {}), 1);
});

/** KeyboardEvent.code -> SDL_Scancode (both are the key's USB HID usage) */
const SDL_OF_CODE: Record<string, string> = {
  ShiftLeft: 'LSHIFT', ShiftRight: 'RSHIFT', ControlLeft: 'LCTRL', ControlRight: 'RCTRL', AltLeft: 'LALT', AltRight: 'RALT',
  NumpadAdd: 'KP_PLUS', NumpadSubtract: 'KP_MINUS', NumpadMultiply: 'KP_MULTIPLY', Escape: 'ESCAPE', Pause: 'PAUSE', Tab: 'TAB', Enter: 'RETURN',
  Delete: 'DELETE', Insert: 'INSERT', Backspace: 'BACKSPACE', Space: 'SPACE', ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
  Home: 'HOME', End: 'END', ScrollLock: 'SCROLLLOCK', PageUp: 'PAGEUP', PageDown: 'PAGEDOWN', Minus: 'MINUS', Equal: 'EQUALS',
  BracketLeft: 'LEFTBRACKET', BracketRight: 'RIGHTBRACKET', Semicolon: 'SEMICOLON', Quote: 'APOSTROPHE', Backquote: 'GRAVE', Backslash: 'BACKSLASH',
  Comma: 'COMMA', Period: 'PERIOD', Slash: 'SLASH', CapsLock: 'CAPSLOCK', NumLock: 'NUMLOCKCLEAR', NumpadDecimal: 'KP_PERIOD',
  IntlBackslash: 'NONUSBACKSLASH', NumpadEnter: 'KP_ENTER', NumpadDivide: 'KP_DIVIDE', MetaLeft: 'LGUI', MetaRight: 'RGUI', OSLeft: 'LGUI', OSRight: 'RGUI',
  PrintScreen: 'PRINTSCREEN', ContextMenu: 'APPLICATION',
};
for (let i = 1; i <= 12; i++) SDL_OF_CODE[`F${i}`] = `F${i}`;
for (const d of '0123456789') SDL_OF_CODE[`Digit${d}`] = d;
for (const d of '0123456789') SDL_OF_CODE[`Numpad${d}`] = `KP_${d}`;
for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') SDL_OF_CODE[`Key${c}`] = c;

test('every browser key reaches the K_ code of the original\'s SDL build (C4AppSDL.cpp, C4KeyboardInput.cpp)', { skip: fs.existsSync(src) ? false : 'no reference source' }, () => {
  const appSdl = fs.readFileSync(path.join(src, 'platform/C4AppSDL.cpp'), 'utf8');
  const sdlToK = new Map([...appSdl.matchAll(/X\(SDL_SCANCODE_(\w+), (K_\w+)\)/g)].map((m) => [m[1], m[2]]));
  assert.ok(sdlToK.size > 90);
  const kbd = fs.readFileSync(path.join(src, 'gui/C4KeyboardInput.cpp'), 'utf8');
  const table = kbd.slice(kbd.indexOf('const C4KeyCodeMapEntry KeyCodeMap[] = {'), kbd.indexOf('{0x00,'));
  const kToName = new Map([...table.matchAll(/\{(K_\w+),\s*"([^"]*)"/g)].map((m) => [m[1], m[2]]));
  const expected: Record<string, string> = {};
  for (const [code, sdl] of Object.entries(SDL_OF_CODE)) {
    const k = sdlToK.get(sdl);
    if (k) expected[code] = kToName.get(k)!;
  }
  assert.deepEqual(KEY_NAMES, expected);
  // the SDL keys no browser code reaches: the Menu key (USB 0x76; the browser's ContextMenu is Application, 0x65,
  // which the original does not map either)
  const reached = new Set(Object.values(SDL_OF_CODE));
  assert.deepEqual([...sdlToK.keys()].filter((s) => !reached.has(s)), ['MENU']);
  assert.equal(KEY_NAMES.ContextMenu, undefined);
});

test('the key names resolve in the translated engine (C4KeyCodeEx::String2KeyCode)', () => {
  initGlobals(true);
  const codes = new Map<string, number>();
  for (const name of new Set(Object.values(KEY_NAMES))) {
    const code = keyCodeByName($, name);
    assert.ok(code !== null && code > 0, `${name}: ${code}`);
    codes.set(name, code!);
  }
  assert.equal(codes.get('D'), 32, 'D is K_D, 32');
  assert.equal(codes.get('Left'), 105, 'Left is the console build\'s K_LEFT');
});

const GROUPS = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Objects.ocd', 'Decoration.ocd', 'Missions.ocf'];
test('a key press reaches the local player\'s controls (C4PlayerControl::ProcessKeyDown via keyEvent)', { skip: packMissing(GROUPS) }, () => {
  const game = boot({ groups: packedGroups(GROUPS), scenario: 'Missions.ocf/AcidDrilling.ocs', seed: 1793690358, playerName: 'Clonk' });
  const e = game.engine;
  for (let i = 0; i < 5; i++) game.tick();
  assert.ok(e.Players.First?.LocalControl, 'a local player');
  assert.equal(translatedPath(e), false, 'the GUI and the key-binding callbacks are not translated yet: the fallback path');
  assert.equal(keyEvent(e, 'KeyD', true, false, false, false, false), true, 'D (Right in the WASD set) is taken');
  assert.equal(e.Game.KeyboardInput.GetLastKeyExtraData().iStrength, 100);
  assert.equal(keyEvent(e, 'KeyD', false, false, false, false, false), true, 'and released');
  assert.equal(e.Game.KeyboardInput.GetLastKeyExtraData().iStrength, 0);
  assert.equal(keyEvent(e, 'F13', true, false, false, false, false), false, 'a key the original has no code for');
  for (let i = 0; i < 5; i++) game.tick();
});
