// The translated headless simulation initializes its globals (the first step before a scenario tick).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initGlobals } from '../src/sim/index.ts';
import { $ } from '../src/rt/registry.ts';

test('the translated headless simulation initializes', () => {
  initGlobals(true);
  assert.ok($.Game, 'Game');
  assert.ok($.Config, 'Config');
  assert.ok($.Landscape, 'Landscape');
  assert.ok($.MaterialMap, 'MaterialMap');
  assert.ok($.Objects, 'Objects');
  assert.ok($.ScriptEngine, 'ScriptEngine');
  $.Game.Ticks();
  assert.equal($.Game.Time, 0);
});
