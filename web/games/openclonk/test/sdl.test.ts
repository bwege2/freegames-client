// SDL for the translated platform layer (src/rt/sdl.ts): the list for the translator (re/openclonk/tools/sdl.txt) and
// the module agree, every SDL call of the original's SDL platform files is there, the page's events come out of
// SDL_PollEvent in order, and the key names are the build's SDL's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { re } from './oracle.ts';
import * as SDL from '../src/rt/sdl.ts';
import { SDL_FUNCTIONS, SCANCODES } from '../src/rt/sdl.ts';
import { $str } from '../src/rt/ptr.ts';

const src = path.join(re, 'orig/openclonk/src');

test('sdl.txt lists the functions sdl.ts provides, each as sdl$<name>', () => {
  const listed = fs.readFileSync(path.join(re, 'tools/sdl.txt'), 'utf8').split('\n').filter((l) => l && !l.startsWith('#'));
  assert.deepEqual(listed, [...SDL_FUNCTIONS]);
  for (const n of SDL_FUNCTIONS) assert.equal(typeof (SDL as Record<string, unknown>)['sdl$' + n], 'function', `sdl$${n}`);
  const exported = Object.keys(SDL).filter((k) => k.startsWith('sdl$')).map((k) => k.slice(4)).sort();
  assert.deepEqual(exported, [...SDL_FUNCTIONS].sort());
});

test('every SDL call of the original\'s SDL platform layer is provided (SDL_GL_* by rt/gl.ts)', { skip: fs.existsSync(src) ? false : 'no reference source (re/openclonk/fetch.sh)' }, () => {
  const called = new Set<string>();
  for (const f of ['platform/C4AppSDL.cpp', 'platform/C4WindowSDL.cpp', 'gui/C4KeyboardInput.cpp', 'platform/C4GamePadCon.cpp']) {
    const text = fs.readFileSync(path.join(src, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of text.matchAll(/\b(SDL_\w+)\s*\(/g)) called.add(m[1]);
  }
  // macros: SDL_BITSPERPIXEL is arithmetic; SDL_VERSION expands to SDL_GetVersion in sdl2-compat
  called.delete('SDL_BITSPERPIXEL');
  // C4GamePadControl::Execute's own SDL_PollEvent loop runs only in the editor (USE_SDL_MAINLOOP: the game's events come
  // through C4AppSDL), and SDL_PollEvent is there anyway
  called.delete('SDL_VERSION');
  const missing = [...called].filter((n) => !n.startsWith('SDL_GL_') && !SDL_FUNCTIONS.includes(n));
  assert.deepEqual(missing, []);
});

test('events come out of SDL_PollEvent in the order the page pushed them', () => {
  SDL.sdlReset();
  SDL.sdlPushEvent({ type: SDL.SDL_KEYDOWN, key: { keysym: { scancode: SCANCODES.KeyA, sym: 0, mod: 0 }, repeat: 0, state: 1 } });
  SDL.sdlPushEvent({ type: SDL.SDL_MOUSEMOTION, motion: { x: 3, y: 4, state: 0 } });
  const e: any = {};
  assert.equal(SDL.sdl$SDL_PollEvent(e), 1);
  assert.equal(e.type, SDL.SDL_KEYDOWN);
  assert.equal(e.key.keysym.scancode, 4);
  assert.equal(SDL.sdl$SDL_PollEvent(e), 1);
  assert.deepEqual([e.type, e.motion.x, e.motion.y], [SDL.SDL_MOUSEMOTION, 3, 4]);
  assert.equal(SDL.sdl$SDL_PollEvent(e), 0);
});

test('scancode names are SDL\'s, and found again case-insensitively', () => {
  assert.equal($str(SDL.sdl$SDL_GetScancodeName(SCANCODES.Space)), 'Space');
  assert.equal($str(SDL.sdl$SDL_GetScancodeName(SCANCODES.ShiftLeft)), 'Left Shift');
  assert.equal($str(SDL.sdl$SDL_GetScancodeName(SCANCODES.Enter)), 'Return');
  assert.equal(SDL.sdl$SDL_GetScancodeFromName('left shift' as any), SCANCODES.ShiftLeft);
  assert.equal(SDL.sdl$SDL_GetScancodeFromName('nonsense' as any), 0);
});

test('the browser\'s gamepads become SDL game controller events and controllers', () => {
  SDL.sdlReset();
  const pad = { index: 0, id: 'Pad', connected: true, mapping: 'standard', axes: [0, 0, 0, 0],
    buttons: Array.from({ length: 17 }, () => ({ value: 0, pressed: false })) };
  SDL.sdlSetGamepadSource(() => [pad]);
  try {
    SDL.sdlPollGamepads();
    const e: any = {};
    assert.equal(SDL.sdl$SDL_PollEvent(e), 1);
    assert.deepEqual([e.type, e.cdevice.which], [SDL.SDL_CONTROLLERDEVICEADDED, 0]);
    assert.equal(SDL.sdl$SDL_NumJoysticks(), 1);
    assert.equal(SDL.sdl$SDL_IsGameController(0), 1);
    const c = SDL.sdl$SDL_GameControllerOpen(0);
    assert.equal(SDL.sdl$SDL_JoystickInstanceID(SDL.sdl$SDL_GameControllerGetJoystick(c)), 0);
    assert.equal($str(SDL.sdl$SDL_JoystickName(c)), 'Pad');
    // A pressed (SDL_CONTROLLER_BUTTON_A 0), the left stick right (SDL_CONTROLLER_AXIS_LEFTX 0), the left trigger (axis 4)
    pad.buttons[0] = { value: 1, pressed: true };
    pad.axes[0] = 1;
    pad.buttons[6] = { value: 0.5, pressed: true };
    SDL.sdlPollGamepads();
    const got: any[] = [];
    while (SDL.sdl$SDL_PollEvent(e)) got.push(JSON.parse(JSON.stringify(e)));
    assert.deepEqual(got.map((x) => x.type), [SDL.SDL_CONTROLLERBUTTONDOWN, SDL.SDL_CONTROLLERAXISMOTION, SDL.SDL_CONTROLLERAXISMOTION]);
    assert.deepEqual([got[0].cbutton.button, got[1].caxis.axis, got[1].caxis.value, got[2].caxis.axis, got[2].caxis.value], [0, 0, 32767, 4, 16384]);
    SDL.sdlSetGamepadSource(() => []);
    SDL.sdlPollGamepads();
    assert.equal(SDL.sdl$SDL_PollEvent(e), 1);
    assert.equal(e.type, SDL.SDL_CONTROLLERDEVICEREMOVED);
    assert.equal(SDL.sdl$SDL_GameControllerGetAttached(c), 0);
  } finally {
    SDL.sdlSetGamepadSource(() => []);
    SDL.sdlReset();
  }
});
