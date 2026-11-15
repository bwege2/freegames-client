// The single-player opponent: legal, affordable choices and a complete game.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DiamondGame, NUM_REGIONS, UNITS_PER_PLAYER, emptyChoices, type Phase,
} from '../src/sim.ts';
import { aiChoices, aiInspectorRegion } from '../src/ai.ts';

function submitAI(g: DiamondGame, player: 0 | 1): boolean {
  g.setChoices(player, aiChoices(g, player));
  if (g.phase === 'salary') return g.submitSalary(player);
  if (g.phase === 'moves' || g.phase === 'adjust') return g.submitMoves(player);
  if (g.phase === 'market' || g.phase === 'marketAdjust') return g.submitSale(player);
  return false;
}

test('the AI only makes legal, affordable choices', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const g = new DiamondGame(seed * 7919);
    for (let month = 0; month < 3 && g.phase !== 'end'; month++) {
      // salary phase
      let c = aiChoices(g, 0);
      assert.ok(g.affordable(0, c), `seed ${seed}: affordable salary`);
      for (let i = 0; i < UNITS_PER_PLAYER; i++) {
        if (!g.canSalary(0, i)) assert.equal(c.salary[i], 0);
        if (!g.canBribe(0, i)) assert.equal(c.bribe[i], 0);
      }
      g.setChoices(0, c); assert.equal(g.submitSalary(0), true);
      assert.equal(submitAI(g, 1), true);
      // moves phase
      c = aiChoices(g, 0);
      assert.ok(g.affordable(0, c), `seed ${seed}: affordable moves`);
      const dests = c.moves.filter((m) => m.dest >= 2).map((m) => m.dest);
      assert.equal(new Set(dests).size, dests.length, 'one agent per region');
      for (let i = 0; i < UNITS_PER_PLAYER; i++) {
        assert.notEqual(c.moves[i].dest, 1, 'never enter the enemy home');
        if (c.moves[i].dest === g.inspector) assert.equal(c.moves[i].bid, 0);
      }
      g.setChoices(0, c); assert.equal(g.submitMoves(0), true);
      assert.equal(submitAI(g, 1), true);
      // peek and adjust
      if (g.phase === 'peek') { g.startAdjust(0); assert.equal(submitAI(g, 0), true); }
      if (g.phase === 'adjust') assert.equal(submitAI(g, 1), true);
      // play out any remaining phases of the month
      while (g.phase !== 'salary' && (g.phase as Phase) !== 'end') {
        if (g.phase === 'peek') g.startAdjust(g.active);
        else if (g.phase === 'marketPeek') g.startMarketAdjust(g.active);
        else if (g.phase === 'inspector') g.resolveInspector(aiInspectorRegion(g, g.active));
        else if (g.phase === 'sale') g.beginMarket();
        else if (g.phase === 'roundEnd') g.nextRound();
        else assert.equal(submitAI(g, g.active), true, `phase ${g.phase}`);
      }
    }
  }
});

test('a full AI-vs-AI year finishes', () => {
  for (const seed of [12345, 777, 424242]) {
    const g = new DiamondGame(seed);
    for (let step = 0; step < 2000 && g.phase !== 'end'; step++) {
      if (g.phase === 'salary' || g.phase === 'moves' || g.phase === 'adjust'
        || g.phase === 'market' || g.phase === 'marketAdjust') {
        assert.equal(submitAI(g, g.active), true, `${seed}: ${g.phase}`);
      } else if (g.phase === 'peek') g.startAdjust(g.active);
      else if (g.phase === 'marketPeek') g.startMarketAdjust(g.active);
      else if (g.phase === 'inspector') g.resolveInspector(aiInspectorRegion(g, g.active));
      else if (g.phase === 'sale') g.beginMarket();
      else if (g.phase === 'roundEnd') g.nextRound();
      else assert.fail(`${seed}: unknown phase ${g.phase}`);
    }
    assert.equal(g.phase, 'end');
    assert.equal(g.monthsLeft, 0);
    assert.ok(g.result);
  }
});

test('the AI beats a player who does nothing', () => {
  for (const seed of [7919, 15838]) {
    const g = new DiamondGame(seed);
    for (let step = 0; step < 2000 && g.phase !== 'end'; step++) {
      const p = g.active;
      if (g.phase === 'salary' || g.phase === 'moves' || g.phase === 'adjust'
        || g.phase === 'market' || g.phase === 'marketAdjust') {
        g.setChoices(p, p === 0 ? emptyChoices(0) : aiChoices(g, p));
        const ok = g.phase === 'salary' ? g.submitSalary(p)
          : (g.phase === 'moves' || g.phase === 'adjust') ? g.submitMoves(p) : g.submitSale(p);
        assert.equal(ok, true);
      } else if (g.phase === 'peek') g.startAdjust(p);
      else if (g.phase === 'marketPeek') g.startMarketAdjust(p);
      else if (g.phase === 'inspector') g.resolveInspector(aiInspectorRegion(g, p));
      else if (g.phase === 'sale') g.beginMarket();
      else if (g.phase === 'roundEnd') g.nextRound();
      else assert.fail(`unknown phase ${g.phase}`);
    }
    assert.equal(g.phase, 'end');
    assert.equal(g.result?.winner, 1);
    assert.ok(g.diamonds[1] > g.diamonds[0]);
  }
});

test('the inspector is sent onto enemy diamonds, not its own', () => {
  const g = new DiamondGame(1);
  g.unit(1, 0).region = 4;
  g.unit(1, 0).carrying = 5;
  g.unit(0, 0).region = 4;
  g.unit(0, 0).carrying = 3;
  assert.equal(aiInspectorRegion(g, 0), 4);
  g.unit(1, 0).carrying = 0;
  g.unit(0, 0).carrying = 0;
  g.regions[5] = 4;
  assert.equal(aiInspectorRegion(g, 0), 5);
  void NUM_REGIONS;
});
