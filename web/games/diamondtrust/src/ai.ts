// A computer opponent for Diamond Trust. The DS original's AI (ai/ai.cpp and
// ai/gameState.cpp, about 4,700 lines of hidden-information Monte-Carlo
// search) is not ported line by line. This is a deterministic, rule-aware
// opponent for the single-player mode: it keeps its own money, protects agents
// with salary, sends carriers home, bids for the best producing regions, and
// uses the peek leaks after the move commit. Its eval follows the original's
// priorities (vault diamonds first, money only as a tie-break).
import {
  DiamondGame, NUM_REGIONS, UNITS_PER_PLAYER, emptyChoices, moveCost,
  sanitizeChoices, type MoveChoice, type PlayerChoices,
} from './sim.ts';

interface Candidate {
  region: number;
  score: number;
  bid: number;
  bribe: number;
}

function leakedAt(game: DiamondGame, player: 0 | 1, region: number): { dest: number; bid: number } | null {
  if (game.phase !== 'adjust' && game.phase !== 'marketAdjust') return null;
  for (const leak of game.leaks[player]) {
    if (leak.dest === region) return { dest: leak.dest, bid: leak.bid };
  }
  return null;
}

/**
 * Choose this player's whole turn: salaries/bribes in the salary phase, and
 * destinations plus bids in the move phase. `game.active` must be `player`.
 */
export function aiChoices(game: DiamondGame, player: 0 | 1): PlayerChoices {
  const choices = emptyChoices(player);
  let left = game.money[player];

  // Salaries are paid at home before an agent leaves; they stay on the agent
  // and protect it from enemy bribes. Bribes to a co-located enemy agent buy a
  // peek at its committed move. Keep most money for moves and bids.
  const home = [] as number[];
  const canBribe = [] as number[];
  for (let i = 0; i < UNITS_PER_PLAYER; i++) {
    if (game.canSalary(player, i)) home.push(i);
    if (game.canBribe(player, i)) canBribe.push(i);
  }
  const salaryBudget = Math.min(left, Math.max(0, Math.min(6, Math.floor(left / 3))));
  for (let k = 0; k < home.length && salaryBudget > 0; k++) {
    const i = home[k];
    // A small permanent salary is enough to beat a probing bribe; the DS AI
    // also treats a bribed agent as a loss of information, not of control.
    const pay = Math.min(2, salaryBudget);
    choices.salary[i] = pay;
    left -= pay;
  }
  if (game.monthsLeft > 2 && left >= 8 && canBribe.length > 0) {
    const i = canBribe[0];
    choices.bribe[i] = 1;
    left -= 1;
  }

  // Move every agent: carriers go home to deposit, the others take the best
  // free producing region. Bids are sunk, so never spend the last few coins.
  const used = new Set<number>();
  for (let i = 0; i < UNITS_PER_PLAYER; i++) {
    const unit = game.unit(player, i);
    if (unit.carrying > 0) {
      const move: MoveChoice = { dest: player, bid: 0, bribe: 0 };
      choices.moves[i] = move;
      continue;
    }
    const candidates: Candidate[] = [];
    for (let r = 2; r < NUM_REGIONS; r++) {
      if (used.has(r)) continue;
      const cost = moveCost(unit.region, r);
      if (cost > left) continue;
      const leak = leakedAt(game, player, r);
      let score = game.regions[r] * 3 + game.rate(r) * 2 - cost;
      if (unit.region === r) score += 2;
      if (game.units.some((o) => o.owner !== player && o.region === r)) score -= 3;
      if (r === game.inspector) score -= 14;
      // The original AI treats the inspector as a tool: it is often worth
      // bribing to move it off a rich region or onto enemy carriers. Keep the
      // simple case here: pay a small inspector bribe when it is cheap.
      let bid = 0;
      let bribe = 0;
      if (r === game.inspector) {
        bribe = left > 12 ? Math.min(2, left - cost - 4) : 0;
        if (bribe < 0) bribe = 0;
      } else if (game.regions[r] > 0) {
        const base = Math.max(1, Math.min(left - cost - 3, game.regions[r] + game.rate(r)));
        bid = Math.max(0, base);
        if (leak) {
          // We have paid for this agent's peek: outbid it exactly when the
          // region is still worth it, otherwise leave the bid at zero.
          if (leak.bid + 1 <= left - cost - 2) bid = leak.bid + 1;
          else if (leak.bid > 0) score -= 10;
        }
      }
      candidates.push({ region: r, score, bid, bribe });
    }
    // Staying home is free and keeps an agent safe; use it when nothing is
    // worth the trip or the money is gone.
    if (unit.region === player) candidates.push({ region: player, score: 1, bid: 0, bribe: 0 });
    else candidates.push({ region: player, score: -2 - moveCost(unit.region, player), bid: 0, bribe: 0 });
    candidates.sort((a, b) => b.score - a.score || a.region - b.region);
    let pick = candidates[0];
    if (!pick) {
      choices.moves[i] = { dest: unit.region, bid: 0, bribe: 0 };
      continue;
    }
    // Never spend more than the money left; if the best bid does not fit,
    // fall back to the same destination without a bid.
    const total = moveCost(unit.region, pick.region) + pick.bid + pick.bribe;
    if (total > left) pick = { region: pick.region, score: pick.score, bid: 0, bribe: 0 };
    used.add(pick.region);
    choices.moves[i] = { dest: pick.region, bid: pick.bid, bribe: pick.bribe };
    left -= moveCost(unit.region, pick.region) + pick.bid + pick.bribe;
  }

  // Vault diamonds are the victory condition and the 18-money allowance is
  // always available for selling nothing, so the AI only sells when it is
  // desperate for move money.
  choices.sale = left < 2 && game.diamonds[player] > 0 && game.monthsLeft > 1
    ? 1 : 0;
  return sanitizeChoices(game, player, choices);
}

/**
 * The AI's inspector destination: move the inspector onto enemy carriers or
 * away from a rich region it is blocking; otherwise stay.
 */
export function aiInspectorRegion(game: DiamondGame, player: 0 | 1 = 1): number {
  let best = game.inspector;
  let bestScore = -1e9;
  const opponent = 1 - player;
  for (let r = 2; r < NUM_REGIONS; r++) {
    let score = game.regions[r] * 0.5;
    for (const u of game.units) {
      if (u.region !== r) continue;
      if (u.owner === opponent) score += u.carrying * 6 + 2;
      else score -= u.carrying * 8 + 2;
    }
    // Staying is free; only move for a clear gain.
    if (r === game.inspector) score += 1;
    if (score > bestScore) { bestScore = score; best = r; }
  }
  return best;
}
