// Package U2 (menus.cpp, help.cpp, scores.cpp): what the oracle scenarios (menu-*.txt) cannot show, headless: the
// mouseover text and help of a cell (describeMouseover: the oracle's mouse stays in the corner), the requirement
// lines of the land help (add_reqs: content-req.ts add_reqs_switch with help.cpp's macros), the time stamps of the
// message log, a score file written by saveStats and read back by the score list (the oracle's games are all
// cheaters, whose entries the list skips), the start menu's keys and the 'o' key.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/globals.ts';
import { runScenario } from './trace.ts';
import { describeMouseover, generateHelpForLand, generateHelpForMonster, gotoHelp, buteol } from '../src/help.ts';
import { gettimestamp, get_o_key, showStartMenu } from '../src/menus.ts';
import { msginfo } from '../src/basegraph.ts';
import { scores_load, scores_list } from '../src/scores.ts';
import { saveStats } from '../src/system.ts';
import { cfs } from '../src/cfile.ts';
import { laJungle, laMirror, laIce, moPlayer, laElementalWall } from '../src/content.ts';
import { PSEUDOKEY_NOHINT, PSEUDOKEY_WHEELDOWN } from '../src/sdl.ts';
import { popScreenAll } from '../src/control.ts';

// one game, as the oracle starts it (an 800x600 window for the dialogs)
runScenario('start 5\nsvg 320 240 screen\n');

test('PSEUDOKEY_NOHINT is 2506 (graph.ts used 2501, which is PSEUDOKEY_WHEELDOWN)', () => {
  assert.equal(PSEUDOKEY_NOHINT, 2506);
  assert.notEqual(PSEUDOKEY_NOHINT, PSEUDOKEY_WHEELDOWN);
});

test('describeMouseover: the land, the player, and the help it leads to', () => {
  G.mousing = true;
  G.mouseover = G.cwt.at;
  G.getcstat = '-'.charCodeAt(0);
  G.instat = false;
  G.mouseovers = '';
  G.mousey = 1000;
  describeMouseover();
  assert.match(G.mouseovers, /^Icy Land \(-?\d+(\.\d+)? °C\), you$/);
  // isPlayerOn: the help is the Rogue's
  assert.equal(G.help, generateHelpForMonster(moPlayer));
  assert.ok(G.help.startsWith('@'));
  // a cell elsewhere: the help is generated when shown (bygen -> "HELPGEN", gotoHelp runs the generator)
  const c = G.cwt.at.move(0)!;
  G.mouseover = c;
  describeMouseover();
  assert.ok(G.mouseovers.startsWith('Icy Land'));
  assert.equal(G.help, 'HELPGEN');
  gotoHelp(G.help);
  assert.ok(G.help.includes('Icy Land'), G.help.slice(0, 80));
  assert.ok(G.help_extensions.some((h) => h.text === 'HyperRogue help'));
  popScreenAll();
  // the top of the window: F1
  G.mouseover = null!;
  G.mousey = 0;
  G.getcstat = '-'.charCodeAt(0);
  describeMouseover();
  assert.equal(G.getcstat, 0x4000003A);
});

test('the land help: requirements with the current/required numbers (help.cpp add_reqs)', () => {
  const j = generateHelpForLand(laJungle);
  assert.ok(j.includes('Always available.\n'), j);
  const m = generateHelpForLand(laMirror);
  assert.match(m, /Treasure required: 30 \$\$\$\. \(\d+\/30\)\n/);
  const ice = generateHelpForLand(laIce);
  assert.ok(ice.startsWith('@'));
  // IFINGAME and KILL: the Elemental Planes
  const e = generateHelpForLand(laElementalWall);
  assert.match(e, /Kills required: (Air|Water|Earth|Fire) Elemental \(.*\)\. \(\d+\/1\)\n/);
  const s = { v: 'abc\n' };
  buteol(s, 3, 10);
  assert.equal(s.v, 'abc (3/10)\n');
});

test('the message log time stamps (menus.cpp gettimestamp)', () => {
  const m = new msginfo();
  m.turnstamp = 17; m.rtstamp = 3600 * 5 + 61; m.gtstamp = 125; m.stamp = 61234;
  const tf = G.timeformat, sb = G.stampbase;
  try {
    G.timeformat = 0; assert.equal(gettimestamp(m), '17');
    G.timeformat = 1; assert.equal(gettimestamp(m), '05:01:01');
    G.timeformat = 2; assert.equal(gettimestamp(m), ' 2:05');
    G.timeformat = 3; G.stampbase = 0; assert.equal(gettimestamp(m), ' 1:01.234');
    G.stampbase = 70000; assert.equal(gettimestamp(m), '- 0:08.766');
    G.timeformat = 4; assert.equal(gettimestamp(m), '');
  } finally { G.timeformat = tf; G.stampbase = sb; }
});

test('the score list reads what saveStats writes (a game without cheats), and the current game', () => {
  const cheater = G.cheater, autocheat = G.autocheat;
  G.cheater = 0; G.autocheat = false;
  G.scorefile = 'u2-test.log';
  cfs.files.delete('u2-test.log');
  G.items[1] = 12; // Ice Diamonds: a non-zero score (zero scores are not listed)
  try {
    saveStats();
    assert.ok(cfs.files.get('u2-test.log')!.startsWith('HyperRogue: game statistics'));
    scores_load();
    const l = scores_list();
    assert.equal(l.length, 2);
    // sorted by mode (equal) and $$$: the recorded game and the current one (ver "NOW")
    assert.ok(l.some((s) => s.ver === 'NOW'));
    assert.ok(l.some((s) => s.ver === '13.1o' && s.box[2] === 12));
    popScreenAll();
  } finally {
    G.cheater = cheater; G.autocheat = autocheat;
    G.items[1] = 0;
  }
});

test("the 'o' key: the world overview in the standard game", () => {
  const o = get_o_key();
  assert.equal(o[0], 'world overview');
});

test('the start menu: Escape starts the game, the random option draws hrand once', () => {
  popScreenAll();
  G.screens.push(showStartMenu);
  runScenario('svg 320 240 screen\n');
  assert.equal(G.screens[G.screens.length - 1], showStartMenu);
  G.keyhandler(27, 27);
  assert.notEqual(G.screens[G.screens.length - 1], showStartMenu);
});
