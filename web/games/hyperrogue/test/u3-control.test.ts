// Package U3: the browser events as SDL2 events (src/sdl.ts), the original's key rules (control.cpp handle_event:
// uni from sym and the modifiers), the mouse and the wheel, the main loop step (mainloopiter) headless: the game
// started as the desktop original starts it (hyper_main: the start menu, then the map), keys moving the player,
// Esc opening and closing the mission screen (quit.cpp), a resize of the window, and the trimming of the stored
// score file. No DOM: the events are fed as the DOM binding (sdl_attach) feeds them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/globals.ts';
import {
  sdl_window, sdl_dom_keydown, sdl_dom_keyup, sdl_keycode_of_dom, sdl_scancode_of_dom, sdl_mouse_button,
  sdl_mouse_wheel, sdl_wheel_steps, sdl_button_of_dom, sdl_window_event, SDL_PollEvent, sdl_clear_queue,
  SDL_GetKeyboardState, type dom_key,
  SDLK_KP_1, SDLK_UP, SDLK_F5, SDLK_ESCAPE, SDLK_RETURN, SDLK_LSHIFT, SDLK_F1, SDLK_KP_ENTER,
  SDL_EVENT_KEY_DOWN, SDL_EVENT_TEXT_INPUT, SDL_KMOD_NUM, SDL_KMOD_LSHIFT, SDL_WINDOWEVENT_RESIZED,
  SDL_SCANCODE_LSHIFT, PSEUDOKEY_WHEELUP, PSEUDOKEY_WHEELDOWN,
} from '../src/sdl.ts';
import { hyper_main_init } from '../src/hyper-main.ts';
import { mainloopiter, handle_event, handleKeyNormal } from '../src/control.ts';
import { showGameMenu, handleKeyQuit } from '../src/quit.ts';
import { addHook, delHook } from '../src/hyper.ts';
import { trim_scorefile, bytes_to_cstr, cstr_to_bytes } from '../src/cfile.ts';

const key = (k: string, code: string, mods: Partial<dom_key> = {}): dom_key =>
  ({ key: k, code, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false, ...mods });

/** the (sym, uni) pairs handle_event passes to handlekey for the queued events (caught by a hooks_handleKey
 *  handler, so the screens' own key handlers do not see them) */
function keys_of_queue(): [number, number][] {
  const got: [number, number][] = [];
  const hook = (s: number, u: number): boolean => { if (s || u) got.push([s, u]); return true; };
  const prio = addHook(G.hooks_handleKey, -1000, hook);
  try {
    for (let ev = SDL_PollEvent(); ev; ev = SDL_PollEvent()) { G.need_refresh = false; handle_event(ev); }
  } finally {
    delHook(G.hooks_handleKey, prio);
  }
  return got;
}

// the desktop start (hyper_main without its loop), in an 800x600 window
sdl_window.w = 800; sdl_window.h = 600;
const started = hyper_main_init(['hyperrogue', '-fixx', '1']);
// the movement arrows that the map shows after a key press (vid.axes 1) are package D4's drawing: off here, so
// that this test checks the control code alone
G.vid.axes = 0;

test('browser keys -> SDL2 keycodes and scancodes', () => {
  assert.equal(sdl_keycode_of_dom(key('a', 'KeyA')), 97);
  assert.equal(sdl_keycode_of_dom(key('A', 'KeyA', { shiftKey: true })), 97);
  assert.equal(sdl_keycode_of_dom(key('q', 'KeyA')), 113, 'AZERTY: the layout\'s letter');
  assert.equal(sdl_keycode_of_dom(key('!', 'Digit1', { shiftKey: true })), 49);
  assert.equal(sdl_keycode_of_dom(key('_', 'Minus', { shiftKey: true })), 45);
  assert.equal(sdl_keycode_of_dom(key('-', 'Minus')), 45);
  assert.equal(sdl_keycode_of_dom(key('End', 'Numpad1')), SDLK_KP_1, 'the numpad without NumLock');
  assert.equal(sdl_keycode_of_dom(key('1', 'Numpad1', { numLock: true })), SDLK_KP_1, 'the numpad with NumLock');
  assert.equal(sdl_keycode_of_dom(key('Enter', 'NumpadEnter')), SDLK_KP_ENTER);
  assert.equal(sdl_keycode_of_dom(key('ArrowUp', 'ArrowUp')), SDLK_UP);
  assert.equal(sdl_keycode_of_dom(key('F5', 'F5')), SDLK_F5);
  assert.equal(sdl_keycode_of_dom(key('Escape', 'Escape')), SDLK_ESCAPE);
  assert.equal(sdl_keycode_of_dom(key('Enter', 'Enter')), SDLK_RETURN);
  assert.equal(sdl_keycode_of_dom(key(' ', 'Space')), 32);
  assert.equal(sdl_keycode_of_dom(key('Shift', 'ShiftLeft')), SDLK_LSHIFT);
  assert.equal(sdl_scancode_of_dom('KeyA'), 4);
  assert.equal(sdl_scancode_of_dom('ArrowUp'), 82);
  assert.equal(sdl_button_of_dom(0), 1);
  assert.equal(sdl_button_of_dom(1), 2);
  assert.equal(sdl_button_of_dom(2), 3);
});

test('a key down: SDL_KEYDOWN, then SDL_TEXTINPUT; the keyboard state and the modifiers', () => {
  sdl_clear_queue();
  sdl_dom_keydown(key('Shift', 'ShiftLeft', { shiftKey: true }));
  assert.equal(SDL_GetKeyboardState()[SDL_SCANCODE_LSHIFT], 1);
  assert.equal(G.sdl_shift_held, true);
  sdl_dom_keydown(key('A', 'KeyA', { shiftKey: true }));
  SDL_PollEvent(); // the Shift key itself
  const ev = SDL_PollEvent()!;
  assert.equal(ev.type, SDL_EVENT_KEY_DOWN);
  assert.equal(ev.key.keysym.sym, 97);
  assert.equal(ev.key.keysym.mod & SDL_KMOD_LSHIFT, SDL_KMOD_LSHIFT);
  const tx = SDL_PollEvent()!;
  assert.equal(tx.type, SDL_EVENT_TEXT_INPUT);
  assert.equal(tx.text.text, 'A');
  sdl_dom_keyup(key('A', 'KeyA', { shiftKey: true }));
  sdl_dom_keyup(key('Shift', 'ShiftLeft'));
  assert.equal(G.sdl_shift_held, false);
  sdl_clear_queue();
  // Ctrl: no text input
  sdl_dom_keydown(key('a', 'KeyA', { ctrlKey: true }));
  assert.equal(SDL_PollEvent()!.type, SDL_EVENT_KEY_DOWN);
  assert.equal(SDL_PollEvent(), null, 'no SDL_TEXTINPUT with Ctrl');
  sdl_dom_keyup(key('a', 'KeyA'));
  sdl_clear_queue();
});

test('handle_event: uni from sym and the modifiers, as the SDL2 build computes it', () => {
  assert.ok(started);
  sdl_clear_queue();
  sdl_dom_keydown(key('a', 'KeyA')); sdl_dom_keyup(key('a', 'KeyA'));
  sdl_dom_keydown(key('A', 'KeyA', { shiftKey: true })); sdl_dom_keyup(key('A', 'KeyA'));
  sdl_dom_keydown(key('a', 'KeyA', { ctrlKey: true })); sdl_dom_keyup(key('a', 'KeyA'));
  sdl_dom_keydown(key('!', 'Digit1', { shiftKey: true })); sdl_dom_keyup(key('!', 'Digit1'));
  sdl_dom_keydown(key('+', 'Equal', { shiftKey: true })); sdl_dom_keyup(key('+', 'Equal'));
  sdl_dom_keydown(key('End', 'Numpad1')); sdl_dom_keyup(key('End', 'Numpad1'));
  const got = keys_of_queue();
  assert.deepEqual(got, [[97, 97], [97, 65], [97, 1], [49, 33], [61, 43], [SDLK_KP_1, SDLK_KP_1]]);
  assert.equal(G.numlock_on, false);
  sdl_dom_keydown(key('1', 'Numpad1', { numLock: true })); sdl_dom_keyup(key('1', 'Numpad1', { numLock: true }));
  assert.deepEqual(keys_of_queue(), [[SDLK_KP_1, SDLK_KP_1]]);
  assert.equal(G.numlock_on, true);
  assert.equal(SDL_KMOD_NUM, 0x1000);
  // text input goes to the text handler
  let text = '';
  sdl_dom_keydown(key('x', 'KeyX'));
  for (let ev = SDL_PollEvent(); ev; ev = SDL_PollEvent()) {
    G.need_refresh = false;
    G.keyhandler = () => { };
    G.texthandler = (t) => { text += t; };
    handle_event(ev);
  }
  sdl_dom_keyup(key('x', 'KeyX'));
  sdl_clear_queue();
  assert.equal(text, 'x');
  G.numlock_on = false;
});

test('mouse: the right button is help (F1), the wheel is PSEUDOKEY_WHEELUP/DOWN', () => {
  sdl_clear_queue();
  // (in a corner, off the map: the movement arrows under the mouse are package D4's)
  sdl_mouse_button(3, true, 3, 590);
  sdl_mouse_button(3, false, 3, 590);
  const got = keys_of_queue();
  assert.deepEqual(got[0], [SDLK_F1, 0]);
  assert.equal(G.mousex, 3);
  assert.equal(G.mousey, 590);
  // the wheel: Firefox's line mode is one click per event, pixels are summed (50 per click)
  assert.equal(sdl_wheel_steps(3, 1), -1);
  assert.equal(sdl_wheel_steps(-3, 1), 1);
  assert.equal(sdl_wheel_steps(-30, 0), 0);
  assert.equal(sdl_wheel_steps(-30, 0), 1);
  sdl_mouse_wheel(1, 3, 590);
  sdl_mouse_wheel(-1, 3, 590);
  assert.deepEqual(keys_of_queue(), [[PSEUDOKEY_WHEELUP, PSEUDOKEY_WHEELUP], [PSEUDOKEY_WHEELDOWN, PSEUDOKEY_WHEELDOWN]]);
});

test('the main loop: the start menu gives way to the map; keys move; Esc opens and closes the mission screen', () => {
  sdl_clear_queue();
  mainloopiter();
  mainloopiter();
  // the start menu (menus.cpp showStartMenu, package U2): Escape starts the game with the current settings
  assert.equal(G.screens.length, 2, 'the start menu');
  sdl_dom_keydown(key('Escape', 'Escape')); sdl_dom_keyup(key('Escape', 'Escape'));
  mainloopiter();
  mainloopiter();
  assert.equal(G.screens.length, 1, 'normalscreen only');
  assert.equal(G.keyhandler, handleKeyNormal);
  assert.equal(G.vid.xres, 800);
  assert.equal(G.vid.yres, 600);
  assert.ok(G.frames >= 1);

  // 'l' (vi keys: east) moves the player one cell
  const at = G.cwt.at, turns = G.turncount;
  sdl_dom_keydown(key('l', 'KeyL')); sdl_dom_keyup(key('l', 'KeyL'));
  mainloopiter();
  assert.notEqual(G.cwt.at, at);
  assert.equal(G.turncount, turns + 1);
  // '.' waits
  sdl_dom_keydown(key('.', 'Period')); sdl_dom_keyup(key('.', 'Period'));
  mainloopiter();
  assert.equal(G.turncount, turns + 2);

  // Esc: the mission screen (quit.cpp showGameMenu), drawn in the next frame with its key handler
  sdl_dom_keydown(key('Escape', 'Escape')); sdl_dom_keyup(key('Escape', 'Escape'));
  mainloopiter();
  assert.equal(G.screens.length, 2);
  assert.equal(G.screens[1], showGameMenu);
  mainloopiter();
  assert.equal(G.keyhandler, handleKeyQuit);
  sdl_dom_keydown(key('Escape', 'Escape')); sdl_dom_keyup(key('Escape', 'Escape'));
  mainloopiter();
  assert.equal(G.screens.length, 1);
  assert.equal(G.quitmainloop, false);
});

test('a resize of the window: the game resizes as with SDL_WINDOWEVENT_RESIZED', () => {
  sdl_clear_queue();
  sdl_window_event(SDL_WINDOWEVENT_RESIZED, 1024, 700);
  mainloopiter();
  mainloopiter();
  assert.equal(G.vid.xres, 1024);
  assert.equal(G.vid.yres, 700);
  assert.equal(G.vid.fsize, Math.min(Math.trunc(700 * 100 / 3200), Math.trunc(1024 * 100 / 4800)));
  assert.equal(G.current_display.xcenter, 512);
});

test('F10 quits (no confirmation at the start of a game)', () => {
  sdl_clear_queue();
  sdl_dom_keydown(key('F10', 'F10')); sdl_dom_keyup(key('F10', 'F10'));
  mainloopiter();
  assert.equal(G.quitmainloop, true);
  G.quitmainloop = false;
});

test('the stored score file: the oldest entries are dropped above the limit, never the last', () => {
  const entry = (n: number): string => `HyperRogue: game statistics (version 13.1o)\n13.1o ${n}\n${'x'.repeat(90)}\n\n\n`;
  let log = '';
  for (let i = 0; i < 10; i++) log += entry(i);
  assert.equal(trim_scorefile(log, 10000), log);
  const t = trim_scorefile(log, 400);
  assert.ok(t.length <= 400);
  assert.ok(t.startsWith('HyperRogue: game statistics'));
  assert.ok(t.endsWith(entry(9)));
  assert.equal(trim_scorefile(log, 10), entry(9), 'the last entry stays even when it alone is too large');
  const b = new Uint8Array([0, 65, 200, 255]);
  assert.deepEqual(cstr_to_bytes(bytes_to_cstr(b)), b);
});
