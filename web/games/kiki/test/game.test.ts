// The Python half (pyworld.ts, from py/*.py): the highscore file and its unlocking rule, the configuration
// file, the menus' items, the levels' own callbacks (switches, mutants) and the exits.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Headless } from './harness.ts';
import { HIGHSCORE_USER, KikiPyWorld } from '../src/pyworld.ts';
import { LEVEL_LIST } from '../src/data/levels.gen.ts';
import { KikiMenu, KikiScrollMenu } from '../src/engine/gui.ts';
import { KikiGate, KikiSwitch, KikiPlayer, KikiMutant } from '../src/engine/objects.ts';

test('kiki.hsc: par moves from the original file, a solved level opens two more (py/highscore.py)', () => {
  const h = new Headless();
  const hs = h.game.highscore;
  assert.equal(hs.levelParMoves('start'), 13);
  assert.equal(hs.levelParMoves('electro'), 22);
  assert.equal(hs.levelParMoves('mutants'), 24);
  assert.equal(hs.getLastAvailableLevel(), -1, 'nothing solved yet');
  hs.levelFinished('start', 9);
  assert.equal(hs.levelUserMoves('start'), 9);
  assert.equal(hs.getLastAvailableLevel(), LEVEL_LIST.indexOf('steps'), 'min(-1 + 2, ...)');
  assert.equal(hs.getLastLevel(), LEVEL_LIST.indexOf('steps'));
  hs.levelFinished('start', 12);
  assert.equal(hs.levelUserMoves('start'), 9, 'only a better result is kept');
  hs.levelFinished('steps', 20);
  assert.equal(hs.getLastAvailableLevel(), LEVEL_LIST.indexOf('electro'), 'min(1 + 2, ...)');
  // the file is written in ConfigParser's format, the user's moves under the user's name
  const file = h.storage.load('kiki.hsc')!;
  assert.match(file, /^\[main\]\nlast_level = electro\ncurrent_level = move\n/m);
  assert.match(file, new RegExp(`\\[start\\]\\nmoves = 13\\n.*${HIGHSCORE_USER} = 9`, 's'));
  // and read back
  const h2 = new Headless();
  h2.storage.files.set('kiki.hsc', file);
  h2.game.highscore = new (h.game.highscore.constructor as never as new (s: unknown) => typeof hs)(h2.storage);
  assert.equal(h2.game.highscore.levelUserMoves('steps'), 20);
});

test('kiki.cfg: the defaults (py/kiki.cfg) apply speed, keys, volume; a saved file overrides them', () => {
  const h = new Headless();
  assert.equal(h.C.getSpeed(), 7);
  assert.equal(KikiPlayer.getKeyForAction('jump'), 'CTRL');
  assert.equal(h.C.sound.getSoundVolume(), 7 * 14);
  assert.equal(h.C.player.projection.getFov(), 90);
  h.game.config.apply('game', 'speed', 3);
  h.game.config.apply('keyboard', 'jump', 'j');
  h.game.config.save();
  const saved = h.storage.load('kiki.cfg')!;
  assert.match(saved, /\[game\]\nspeed = 3\n/);
  assert.match(saved, /jump = j\n/);
  const h2 = new Headless();
  h2.storage.files.set('kiki.cfg', saved);
  const cfg = new (h.game.config.constructor as never as new (g: unknown) => unknown)(h2.game);
  void cfg;
  assert.equal(h2.C.getSpeed(), 3);
  assert.equal(KikiPlayer.getKeyForAction('jump'), 'j');
});

test('main menu: the original\'s items, and continue/load level/statistics once a level is solved', () => {
  const h = new Headless({ menu: true });
  const menu = h.C.overlays.find((o) => o instanceof KikiMenu) as KikiMenu;
  const items = menu.menu_items.map((i) => i.item_text!.getText());
  assert.deepEqual(items, ['kiki the nano bot', '', 'new game', 'setup', 'story', 'about', 'quit']);
  assert.equal(menu.active_index, 2);
  // the preview: the first level in the upper 60 % of the screen, followed by the camera
  assert.equal(h.C.world.getName(), 'start');
  assert.deepEqual(h.C.world.getProjection().viewport, [0.0, 0.4, 1.0, 0.6]);
  // new game
  h.key('RETURN');
  h.run(100);
  assert.equal(h.game.levelWorld.v.level_name, 'start');
  assert.deepEqual(h.C.world.getProjection().viewport, [0, 0, 1, 1]);
  const h2 = new Headless({ menu: false });
  h2.game.highscore.levelFinished('start', 5);
  h2.game.display_main_menu();
  const m2 = h2.C.overlays.find((o) => o instanceof KikiMenu) as KikiMenu;
  assert.deepEqual(m2.menu_items.map((i) => i.item_text!.getText()),
    ['kiki the nano bot', '', 'continue', 'load level', 'statistics', 'new game', 'setup', 'story', 'about', 'quit']);
});

test('level selection: the solved and open levels in columns of five, their score as par minus moves', () => {
  const h = new Headless();
  h.game.highscore.levelFinished('start', 10);
  h.game.highscore.levelFinished('steps', 30);
  h.game.levelSelection(0, null);
  const menu = h.C.overlays.find((o) => o instanceof KikiScrollMenu) as KikiScrollMenu;
  assert.equal(menu.all_menu_items.length, 4);
  assert.equal(menu.all_menu_items[0].item_text!.getText(), '1 ');
  assert.equal(menu.all_menu_items[0].value_text!.getText(), 'start');
  assert.equal(menu.all_menu_items[0].extra_text!.getText(), '3    ');
  assert.equal(menu.all_menu_items[2].extra_text!.getText(), 'new    ');
  assert.equal(menu.active_index, LEVEL_LIST.indexOf('electro'), 'index 0 is false in Python: the last open level');
});

test('switch level: shooting the four switches opens the exit (the level\'s own callbacks)', () => {
  const h = new Headless();
  h.level('switch');
  const switches = h.C.world.objects.filter((o) => o instanceof KikiSwitch && !(o instanceof KikiGate)) as KikiSwitch[];
  const exit = h.C.world.getObjectWithName('exit') as KikiGate;
  assert.equal(switches.length, 4);
  assert.equal(exit.isActive(), false);
  for (const s of switches.slice(0, 3)) s.bulletImpact();
  assert.equal(exit.isActive(), false);
  switches[3].bulletImpact();
  assert.equal(exit.isActive(), true);
  switches[0].bulletImpact();
  assert.equal(exit.isActive(), false, 'a switch shot again closes it');
});

test('entering an active exit finishes the level and builds the next one', () => {
  const h = new Headless();
  h.level('start');
  const exit = h.C.world.getObjectWithName('exit') as KikiGate;
  h.C.player.getStatus().setMoves(4);
  // the player arrives in the exit's cell
  h.C.world.objectWillMoveToPos(h.C.player, exit.getPos(), 100);
  h.C.player.setPosition(exit.getPosition());
  h.C.world.objectMovedFromPos(h.C.player, h.C.player.position);
  h.frame();
  h.frame();
  assert.equal(h.game.highscore.levelUserMoves('start'), 4);
  assert.equal(h.game.levelWorld.v.level_name, 'steps');
  assert.equal(h.C.player.getStatus().getMoves(), 0);
});

test('mutants: the exit opens when the last of the five mutants is dead', () => {
  const h = new Headless();
  h.level('mutants');
  const mutants = h.C.world.objects.filter((o) => o instanceof KikiMutant) as KikiMutant[];
  assert.equal(mutants.length, 5);
  const exit = h.C.world.getObjectWithName('exit') as KikiGate;
  for (const m of mutants) for (let i = 0; i < 10; i++) m.bulletImpact();
  h.run(3000);
  assert.ok(mutants.every((m) => m.died), 'ten hits of 0.1 kill a mutant');
  assert.equal(exit.isActive(), true);
});

test('every level builds and runs 10 s with the player driving around', () => {
  for (const name of LEVEL_LIST) {
    const h = new Headless();
    const w: KikiPyWorld = h.level(name);
    assert.equal(h.C.world.getName(), name);
    h.key('UP');
    h.run(3000, 17);
    h.key('CTRL');
    h.run(2000, 13);
    h.key('CTRL', false);
    h.key('LEFT');
    h.run(1000, 11);
    h.key('LEFT', false);
    h.key('UP', false);
    h.key('SPACE');
    h.run(1000, 19);
    h.key('SPACE', false);
    h.run(3000, 23);
    void w;
  }
});
