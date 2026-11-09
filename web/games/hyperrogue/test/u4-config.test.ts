// Package U4: the configuration (config.cpp, models.cpp's menus) headless: hyperrogue.ini written and read back
// through cfs.files (the website's storage), the legacy first line, unknown lines, the parameter kinds' file
// formats, and the key handling of the settings screens (switches, a list, a number dialog, the bool dialog,
// the search, the recently changed settings, the reset, the models menu). The oracle checks the file format and
// twelve settings screens (scenarios config-ini, config-screens).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/globals.ts';
import { sdl_window } from '../src/sdl.ts';
import { SDLK_ESCAPE, SDLK_RETURN } from '../src/sdl.ts';
import { hyper_main_init } from '../src/hyper-main.ts';
import { handlekey, popScreenAll, pushScreen } from '../src/control.ts';
import { drawscreen } from '../src/graph.ts';
import { cfs } from '../src/cfile.ts';
import {
  saveConfig, loadConfig, resetConfig, conffile_ref, params, showSettings, find_edit, P, V, PC, E,
  parseline, loadNewConfig, getcs, playergender, princessgender,
} from '../src/config.ts';
import { dialog_number_dialog, dialog_bool_dialog } from '../src/dialogs.ts';
import { parsecolor, parsecolortable, eval_programmable_string } from '../src/util.ts';
import { minecolors } from '../src/graph-wall.ts';
import { GEN_F, GEN_M } from '../src/hyper.ts';
import { mdBand, mdDisk } from '../src/classes.ts';

sdl_window.w = 640; sdl_window.h = 480;
const started = hyper_main_init(['hyperrogue', '-fixx', '1']);
G.vid.axes = 0;
const k = (c: string): number => c.charCodeAt(0);

/** one key press as the main loop handles it: the screen is drawn (it sets keyhandler), then handlekey */
function press(sym: number | string, uni?: number): void {
  const s = typeof sym === 'string' ? k(sym) : sym;
  drawscreen();
  handlekey(s, uni ?? s);
}
const top = (): unknown => G.screens[G.screens.length - 1];
const title = (): string => { drawscreen(); return G.dialog_items[0]?.body ?? ''; };

test('the game starts with the configuration of initConfig', () => {
  assert.ok(started);
  popScreenAll();
  assert.ok(params.size > 1500);
  assert.equal(G.vid.fontscale, 100);
  assert.equal(G.menu_darkening, 2);
  assert.equal(G.vid.cs.skincolor, 0xD0D0D0FF);
  assert.equal(G.multi_scs[2].charid, 4, 'multi::initConfig: rudy');
  assert.equal(playergender(), GEN_M);
  assert.equal(princessgender(), GEN_F);
  assert.ok(find_edit(V('grid')));
  assert.equal(find_edit(V('grid'))!.name, 'grid');
  assert.equal(find_edit(PC('alpha'))!.name, 'projection');
});

test('hyperrogue.ini: written, reset, read back (the storage holds cfs.files)', () => {
  conffile_ref.v = 'hyperrogue.ini';
  cfs.files.delete('hyperrogue.ini');
  const written: string[] = [];
  const onw = cfs.onwrite;
  cfs.onwrite = (n) => { written.push(n); };
  try {
    G.vid.fontscale = 150;
    G.vid.grid = true;
    G.backcolor = 0x102030;
    G.vid.linewidth = 2.5;
    G.pinnedglyphs = '$*';
    G.vid.cs.lefthanded = true;
    G.vid.msgleft = 1;
    minecolors[0] = 0x123456;
    saveConfig();
  } finally { cfs.onwrite = onw; }
  assert.ok(written.includes('hyperrogue.ini'));
  const ini = cfs.files.get('hyperrogue.ini')!;
  const lines = ini.trimEnd().split('\n');
  assert.deepEqual([...lines].sort(), lines, 'sorted by the names (std::map)');
  for (const l of ['color_background=102030', 'fontscale=150', 'grid=yes', 'linewidth=2.5', 'pinned_glyphs=$*',
    'single.lefthanded=yes', 'message_style=1'])
    assert.ok(lines.includes(l), l);
  assert.ok(lines.some((l) => l.startsWith('mines=123456,')));

  resetConfig();
  assert.equal(G.vid.fontscale, 100);
  assert.equal(G.vid.grid, false);
  assert.equal(G.backcolor, 0);
  assert.equal(G.vid.cs.lefthanded, false);
  assert.notEqual(minecolors[0], 0x123456);

  loadConfig();
  assert.equal(G.vid.fontscale, 150);
  assert.equal(G.vid.grid, true);
  assert.equal(G.backcolor, 0x102030);
  assert.equal(G.vid.linewidth, 2.5);
  assert.equal(G.pinnedglyphs, '$*');
  assert.equal(G.vid.cs.lefthanded, true);
  assert.equal(minecolors[0], 0x123456);
  assert.equal(G.vid.xres, 640, 'loadConfig: xres = 9999, then the file\'s xres');
  G.vid.xres = 640; G.vid.yres = 480;

  saveConfig();
  // the same file, but for depth: the computed 0.9999999999999999 is written as 1 (fts, 10 digits) and read back
  // as exactly 1, the default (as in the original)
  const nodepth = (t: string): string => t.split('\n').filter((l) => !l.startsWith('depth=')).join('\n');
  assert.equal(cfs.files.get('hyperrogue.ini'), nodepth(ini), 'the round trip writes the same file');
  resetConfig();
  cfs.files.delete('hyperrogue.ini');
});

test('hyperrogue.ini: legacy names, unknown lines, the legacy first line', () => {
  const out: string[] = [];
  const so = cfs.stdout;
  cfs.stdout = (s) => { out.push(s); };
  try {
    loadNewConfig('# comment\r\nfont scale=120\nmessage limit=7\nno such thing=1\nwithout equality\ncolor:monster:7=ABCDEF\n');
  } finally { cfs.stdout = so; }
  assert.equal(G.vid.msglimit, 7, 'the legacy name "message limit"');
  assert.deepEqual(out, ['Warning: unknown config variable: font scale=120\n', 'Warning: unknown config variable: no such thing=1\n',
    'Warning: config line without equality sign: without equality\n']);
  cfs.files.set('old.ini', '800 600 1 14\nanything');
  conffile_ref.v = 'old.ini';
  loadConfig();
  assert.equal(G.vid.xres, 800); assert.equal(G.vid.yres, 600); assert.equal(G.vid.full, true); assert.equal(G.vid.fsize, 14);
  conffile_ref.v = 'hyperrogue.ini';
  cfs.files.delete('old.ini');
  G.vid.xres = 640; G.vid.yres = 480; G.vid.full = false;
  resetConfig();
  assert.equal(G.vid.msglimit, 5);
});

test('the file formats of the parameter kinds', () => {
  assert.equal(parsecolor('FF0000', false), 0xFF0000);
  assert.equal(parsecolor('FF000080', true), 0xFF000080);
  assert.equal(parsecolor('rgb(1,0.5,0.25)', true), 0xFF8040FF);
  assert.equal(parsecolor('lerp(000000FF,FFFFFFFF,0.5)', true), 0x7F7F7FFF);
  assert.deepEqual(parsecolortable('FF0000,00FF00'), [0xFF0000, 0x00FF00]);
  parseline_all('glyph sort order=by land');
  assert.equal(G.glyphsortorder, 4, 'an enum by the name of its option');
  parseline_all('orb_mode=1');
  assert.equal(G.vid.orbmode, 1);
  parseline_all('mapfontscale=1/3');
  assert.equal(params.get('mapfontscale')!.save(), '0.3333333333');
  parseline_all('rotation=matrix 1 0 0 0 0 -1 0 0 0 0 1 0 0 0 0 1 ');
  assert.equal(G.models_rotation!.v2[1][1], -1);
  assert.match(params.get('rotation')!.save(), /^matrix 1 0 0 0 0 -1 /);
  assert.equal(eval_programmable_string('t:$(turncount)'), 't:' + G.turncount);
  assert.equal(eval_programmable_string('$(1/3,2)'), '0.33');
  resetConfig();
  assert.equal(params.get('glyph_sort')!.dosave(), false);
  assert.equal(G.models_rotation!.v2[1][1], 1);
});
function parseline_all(l: string): void { loadNewConfig(l + '\n'); void parseline; }

test('the settings screens: switches, a list parameter, a number dialog, the bool dialog', () => {
  popScreenAll();
  pushScreen(showSettings);
  assert.equal(title(), 'settings');
  press('g'); assert.equal(title(), 'graphics configuration');
  press('w'); assert.equal(title(), 'vector settings');
  const b = G.bright;
  press('g'); assert.equal(G.bright, !b, 'bright mode switches');
  press('g'); assert.equal(G.bright, b);
  press(SDLK_ESCAPE); press(SDLK_ESCAPE);
  assert.equal(title(), 'settings');
  press('i'); assert.equal(title(), 'interface');
  press('h'); assert.equal(title(), 'HUD settings');
  press('a'); assert.equal(title(), 'message style', 'a list parameter opens its list');
  press('c');
  assert.equal(G.vid.msgleft, 2);
  assert.equal(title(), 'HUD settings', 'choosing closes the list');
  press(SDLK_ESCAPE);
  // the font scale: a number dialog of an int parameter
  press('b');
  assert.ok((top() as { target?: unknown }).target instanceof dialog_number_dialog);
  const ne = (top() as { target: dialog_number_dialog }).target;
  ne.s = '125'; ne.apply_edit(); // what typing 125 does
  press(SDLK_RETURN);
  assert.equal(G.vid.fontscale, 125);
  assert.equal(title(), 'interface');
  // with use_bool_dialog, a switch opens the bool dialog
  G.use_bool_dialog = true;
  try {
    press('d'); assert.equal(title(), 'dialogs');
    press('c');
    assert.ok((top() as { target?: unknown }).target instanceof dialog_bool_dialog);
    press(SDLK_ESCAPE);
  } finally { G.use_bool_dialog = false; }
  popScreenAll();
  pushScreen(showSettings);
  // the recently changed settings list the font scale; the search finds the grid
  press('/'); assert.equal(title(), 'recently changed settings');
  assert.ok(G.dialog_items.some((it) => it.body === 'font scale'));
  press('/'); assert.equal(title(), 'find a setting');
  for (const c of 'grid') press(c);
  assert.equal(G.dialog_infix, 'GRID');
  drawscreen();
  assert.ok(G.dialog_items.some((it) => it.body === 'display grid'));
  G.dialog_infix = '';
  popScreenAll();
  resetConfig();
  assert.equal(G.vid.fontscale, 100);
});

test('the models menu: the quick models and the model list', () => {
  popScreenAll();
  pushScreen(showSettings);
  press('p'); assert.equal(title(), 'models & projections');
  press('3');
  assert.equal(G.vid.projection_config.alpha, 0, 'Beltrami-Klein');
  press('p'); press('a'); press('m');
  drawscreen();
  assert.ok(G.dialog_items.some((it) => it.body === 'band'));
  assert.ok(!G.dialog_items.some((it) => it.body === 'polygonal'), 'models the port does not draw are not offered');
  const band = G.dialog_items.find((it) => it.body === 'band')!;
  press(band.key);
  assert.equal(G.vid.projection_config.model, mdBand);
  popScreenAll();
  const pc = G.vid.projection_config;
  pc.model = mdDisk; pc.alpha = 1; pc.scale = 1;
});

test('the character and the reset of the configuration', () => {
  popScreenAll();
  pushScreen(showSettings);
  press('i'); press('g'); assert.equal(title(), 'Customize character');
  press('g'); assert.equal(title(), 'Choose character');
  press('x');
  assert.equal(getcs().charid, 1, 'the female variant');
  assert.equal(playergender(), GEN_F);
  popScreenAll();
  pushScreen(showSettings);
  press('R'); assert.equal(title(), 'reset all configuration');
  press('y');
  assert.equal(getcs().charid, 0);
  assert.equal(title(), 'settings');
  popScreenAll();
  void E; void P;
});
