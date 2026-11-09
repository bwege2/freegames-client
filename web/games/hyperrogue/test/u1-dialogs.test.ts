// Package U1: the dialog system (dialogs.ts) and the text functions (basegraph.ts) headless: layout from
// textwidth, the recorded text of displayfr (outlines), key names, navigation, the number dialog's screen.
// (The oracle has no dialog commands yet: U2 adds `key`; the HUD and the messages are checked by draw-screen.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/globals.ts';
import { register_all } from '../src/hyper-main.ts';
import { init_font, compute_fsize, textwidth, displayfr, drawmessage } from '../src/basegraph.ts';
import { ttf_record, type text_record } from '../src/sdlttf.ts';
import {
  dialog_init_t, dialog_addItem, dialog_addSelItem, dialog_addBreak, dialog_addHelp_s, dialog_add_action,
  dialog_display, dialog_keyname, dialog_handleNavigation, ONOFF, dialog_editNumber, dialog_get_ne,
  dialog_bound_low, dialog_human_simplify, dialog_has_substring, dialog_displayLong,
} from '../src/dialogs.ts';
import { SDLK_ESCAPE, SDLK_F1, SDLK_DOWN, SDLK_RETURN } from '../src/sdl.ts';

register_all();
init_font();
G.vid.xres = 800; G.vid.yres = 600;
compute_fsize();

function record(f: () => void): text_record[] {
  const out: text_record[] = [];
  ttf_record.on = (t) => { out.push(t); };
  try { f(); } finally { ttf_record.on = null; }
  return out;
}

test('displayfr: the outline is drawn first, the text last, at the aligned rectangle', () => {
  G.poly_outline = 0x123456FF;
  const r = record(() => displayfr(100, 50, 2, 16, 'abc', 0xFFFFFF, 8));
  assert.equal(r.length, 9);
  const w = textwidth(16, 'abc');
  assert.deepEqual(r[8], { x: 100 - Math.trunc(w * 8 / 16), y: 50 - 9, w, h: 19, size: 16, col: 0xFFFFFF, str: 'abc' });
  assert.equal(r[0].col, 0x123456);
  assert.equal(r[0].x, r[8].x - 2);
});

test('drawmessage splits a message that does not fit into "... " lines', () => {
  G.current_display.radius = 0; G.current_display.xcenter = 400; G.current_display.ycenter = 300;
  const r = record(() => drawmessage('one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen', 580, 0xFFFFFF));
  assert.ok(r.length > 0);
  const texts = [...new Set(r.map((t) => t.str))];
  assert.equal(texts.length, 2); // wider than 800 pixels at 16: the end on the bottom line, the start above it
  assert.ok(texts[0].startsWith('... ') && !texts[1].startsWith('... '));
  assert.ok(r[0].y > r[r.length - 1].y);
});

test('dialog: layout, highlight and actions', () => {
  let acted = 0;
  const build = (): void => {
    dialog_init_t('Test dialog');
    dialog_addItem('first item', 'a'.charCodeAt(0));
    dialog_add_action(() => { acted++; });
    dialog_addSelItem('second item', ONOFF(true), 'b'.charCodeAt(0));
    dialog_addBreak(100);
    dialog_addHelp_s('A help text that is long enough to be broken into several lines by displayLong, ' +
      'because the width of the help is 61.8% of the window, which is about 494 pixels at 800x600.');
  };
  build();
  const r = record(() => dialog_display());
  const title = r.find((t) => t.str === 'Test dialog' && t.col === 0xE8E8E8)!;
  assert.ok(title);
  assert.equal(title.size, 24); // dfsize * 150 / 100
  assert.equal(title.x, 400 - Math.trunc(title.w * 8 / 16));
  const on = r.find((t) => t.str === 'ON' && t.col === 0x40FF40);
  assert.ok(on, 'the ON value in dialogcolor_off');
  const help = r.filter((t) => t.col === 0xC0C0C0 && t.x === Math.trunc(800 * 186 / 1000) && t.size === 16);
  assert.ok(help.length >= 2, 'the help text is broken into lines');
  for (const h of help) assert.ok(h.w <= Math.trunc(800 * 618 / 1000));
  // navigation: down highlights the first item, Enter runs its action
  const k = { sym: SDLK_DOWN, uni: 0 };
  dialog_handleNavigation(k);
  assert.equal(G.dialog_highlight_text, 'first item');
  const k2 = { sym: SDLK_RETURN, uni: 13 };
  dialog_handleNavigation(k2);
  assert.equal(acted, 1);
  // the key of an action
  const k3 = { sym: 'a'.charCodeAt(0), uni: 'a'.charCodeAt(0) };
  dialog_handleNavigation(k3);
  assert.equal(acted, 2);
  assert.equal(k3.sym, 0);
});

test('dialog: key names, human_simplify, has_substring, displayLong measure', () => {
  assert.equal(dialog_keyname(SDLK_ESCAPE), 'Esc');
  assert.equal(dialog_keyname(SDLK_F1), 'F1');
  assert.equal(dialog_keyname(1), 'Ctrl+A');
  assert.equal(dialog_keyname(32), 'space');
  assert.equal(dialog_keyname('x'.charCodeAt(0)), 'x');
  assert.equal(dialog_keyname(10001), '');
  assert.equal(dialog_human_simplify('Żółw straße', false), 'ZOLWSTRASSE');
  assert.equal(dialog_has_substring('HYPERROGUE', 'HRG'), true);
  assert.equal(dialog_has_substring('HYPERROGUE', 'GH'), false);
  assert.equal(dialog_displayLong('short', 16, 0, true), 16 + 8);
});

test('editNumber pushes a number dialog; bound_low clamps', () => {
  const x = { v: 5 };
  const n = Math.max(G.screens.length, 1); // screens = { normalscreen } (G.screens gets it on the first push)
  const ne = dialog_editNumber(x, 0, 10, 1, 3, 'title', 'help');
  assert.equal(G.screens.length, n + 1);
  assert.equal(dialog_get_ne(), ne);
  assert.equal(ne.s, '5');
  dialog_bound_low(2);
  x.v = 1;
  ne.reaction!();
  assert.equal(x.v, 2);
  ne.popfinal();
  assert.equal(G.screens.length, n);
});
