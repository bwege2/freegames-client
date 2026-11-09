// Package P8 (system): the parts that run without the later packages -- the C file emulation (cfile.ts), the
// command line (commandline.ts), version comparison and the box layout of the score file (system.ts), cheats
// (debug.ts), multiplayer bookkeeping (multi.ts). The full start/save/load cycle is checked by the oracle
// scenarios once the land generation and the rules are ported.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/globals.ts';
import { cfs, fopen, fputs, fgets, fscanf_d, fscanf_s, feof, sscanf, ftell, truncate, c_exit, strftime_c } from '../src/cfile.ts';
import { verless, MAXBOX, POSSCORE, MODECODE_BOX, LOADCOUNT_BOX, CURRENT_LOADCOUNT_BOX } from '../src/system.ts';
import { arg_init, arg_read, arg_readland, arg_readItem, arg_readMonster, arg_argis } from '../src/commandline.ts';
import { register_all } from '../src/hyper-main.ts';
import { applyCheat } from '../src/debug.ts';
import { multi_player_count_name, multi_activePlayers, multi_playerActive, multi_resetScores } from '../src/multi.ts';
import { formatted_yasc_code, counthints } from '../src/quit.ts';
import { laJungle, laCrossroads2, itDiamond, moYeti, moPike, moPlayer } from '../src/content.ts';

register_all();

test('cfile: append, read back with fgets/fscanf, truncate', () => {
  cfs.files.clear();
  const f = fopen('t.log', 'at')!;
  fputs('Hy line\n', f);
  fputs('13.1o 1 2 -3\nPlayed on: x\n', f);
  assert.equal(ftell(f), 34);
  const g = fopen('t.log', 'rt')!;
  assert.equal(fgets(12000, g), 'Hy line\n');
  assert.equal(fscanf_s(g, 9999), '13.1o');
  assert.equal(fscanf_d(g), 1);
  assert.equal(fscanf_d(g), 2);
  assert.equal(fscanf_d(g), -3);
  assert.equal(fscanf_d(g), null); // "Played" is not a number
  assert.equal(fgets(12000, g), 'Played on: x\n');
  assert.equal(fgets(12000, g), null);
  assert.ok(feof(g));
  assert.equal(fopen('missing', 'r'), null);
  truncate('t.log', 8);
  assert.equal(cfs.files.get('t.log'), 'Hy line\n');
  assert.deepEqual(sscanf('TACTICS 13.1o 5 12 3', '%70s%9s%d%d%d%d'), ['TACTICS', '13.1o', 5, 12, 3]);
  assert.equal(strftime_c(0).length, 24);
});

test('system: verless and the box layout constants', () => {
  assert.equal(verless('9.4', '10.0'), true);
  assert.equal(verless('10.0', '9.3b'), false);
  assert.equal(verless('4.3', '4.4'), true);
  assert.equal(verless('13.1o', '13.1o'), false);
  assert.ok(POSSCORE < MAXBOX && MODECODE_BOX < LOADCOUNT_BOX && LOADCOUNT_BOX < CURRENT_LOADCOUNT_BOX);
  assert.equal(counthints(), 13);
  G.yasc_code = 1234567; assert.equal(formatted_yasc_code(), '1-23-45-67');
  G.yasc_code = 99; assert.equal(formatted_yasc_code(), '99');
});

test('commandline: phases and readers', () => {
  assert.equal(arg_readland('Jungle'), laJungle);
  assert.equal(arg_readland('II'), laCrossroads2);
  assert.equal(arg_readland(String(laJungle)), laJungle);
  assert.equal(arg_readItem('Diamond'), itDiamond);
  assert.equal(arg_readMonster('Pike'), moPike);
  assert.equal(arg_readMonster('Yeti'), moYeti);

  G.arg_argument = []; G.arg_pos = 0;
  arg_init(['hyperrogue', '-nogui', '-fixx', '42', '-W', 'Jungle']);
  arg_read(1);
  assert.equal(G.noGUI, true);
  assert.equal(G.fixseed, true);
  assert.equal(G.autocheat, true);
  assert.equal(G.startseed, 42);
  assert.ok(arg_argis('-W')); // a phase-2 option stops phase 1

  G.arg_argument = []; G.arg_pos = 0;
  arg_init(['hyperrogue', '--bogus']);
  assert.throws(() => arg_read(1), (e) => e instanceof c_exit && e.code === 3);
});

test('debug: cheat keys', () => {
  const k = G.kills[moYeti], ch = G.cheater;
  G.kills[moPlayer] = 5;
  assert.equal(applyCheat('K'.charCodeAt(0)), true);
  assert.equal(G.kills[moYeti], k + 10);
  assert.equal(G.kills[moPlayer], 0);
  assert.equal(G.cheater, ch + 1);
  assert.equal(G.gamelog[G.gamelog.length - 1].msg, 'Kills gained!');
  assert.equal(applyCheat('q'.charCodeAt(0)), false);
});

test('multi: player bookkeeping', () => {
  assert.equal(multi_player_count_name(3), 'three players');
  assert.equal(multi_player_count_name(1), 'one player');
  G.multi_players = 1;
  assert.equal(multi_playerActive(0), true);
  assert.equal(multi_activePlayers(), 1);
  G.multi_deaths[2] = 4; multi_resetScores(); assert.equal(G.multi_deaths[2], 0);
});
