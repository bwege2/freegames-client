// The online wire format: the server's authoritative state becomes the same
// DiamondGame view the local UI draws, and a UI choice becomes a Cap'n Proto
// Action sent to Target.server. No JSON and no rules run on the client; the
// server hides the other seat's money, salaries, bribes, moves and bids.
import { packGame } from '../../../src/sdk/index.ts';
import {
  DiamondGame, NUM_REGIONS, UNITS_PER_PLAYER, emptyChoices,
  type Leak, type Phase as SimPhase, type PlayerChoices,
} from './sim.ts';
import {
  Msg, Phase as WirePhase, Reason, Result as WireResult,
  type State,
} from './proto/diamondtrust.ts';

const PHASES: Record<number, SimPhase> = {
  [WirePhase.SALARY]: 'salary',
  [WirePhase.MOVES]: 'moves',
  [WirePhase.PEEK]: 'peek',
  [WirePhase.ADJUST]: 'adjust',
  [WirePhase.INSPECTOR]: 'inspector',
  [WirePhase.SALE]: 'sale',
  [WirePhase.MARKET]: 'market',
  [WirePhase.MARKET_PEEK]: 'marketPeek',
  [WirePhase.MARKET_ADJUST]: 'marketAdjust',
  [WirePhase.ROUND_END]: 'roundEnd',
  [WirePhase.END]: 'end',
};

function resultOf(state: State): 0 | 1 | null | undefined {
  if (state.result === WireResult.NONE) return undefined;
  if (state.result === WireResult.LONDON) return 0;
  if (state.result === WireResult.ANTWERP) return 1;
  return null;
}

function resultReason(state: State, winner: 0 | 1 | null): string {
  if (state.reason === Reason.LEFT) return 'The other player left the game.';
  if (state.reason === Reason.MONEY) return `Player ${(winner ?? 0) + 1} wins on money`;
  if (state.reason === Reason.TIE) return 'Tie: equal diamonds and money';
  return `Player ${(winner ?? 0) + 1} wins on diamonds`;
}

/** One seat's server state as the local view object (read-only for online). */
export function gameFromState(state: State, seat: 0 | 1): DiamondGame {
  const g = new DiamondGame(1);
  g.monthsLeft = state.monthsLeft;
  g.round = state.round;
  g.phase = PHASES[state.phase] ?? 'salary';
  g.active = (state.active === 1 ? 1 : 0) as 0 | 1;
  g.inspector = state.inspector;
  const ownMoney = state.yourMoney;
  const oppMoney = state.opponentMoney >= 0 ? state.opponentMoney : -1;
  g.money = seat === 0 ? [ownMoney, oppMoney] : [oppMoney, ownMoney];
  const ownDiamonds = state.yourDiamonds;
  const oppDiamonds = state.opponentDiamonds;
  g.diamonds = seat === 0 ? [ownDiamonds, oppDiamonds] : [oppDiamonds, ownDiamonds];
  g.regions = [];
  for (let r = 0; r < NUM_REGIONS; r++) g.regions.push(state.regions.get(r));
  g.units = [];
  for (let i = 0; i < 6; i++) {
    const u = state.units.get(i);
    g.units.push({ owner: (u.owner === 1 ? 1 : 0) as 0 | 1, region: u.region,
      salary: 0, bribe: 0, bribedBy: null, carrying: u.carrying });
  }
  for (let i = 0; i < UNITS_PER_PLAYER; i++) {
    const u = g.unit(seat, i);
    u.salary = state.yourSalary.get(i);
    u.bribe = state.yourBribe.get(i);
    u.bribedBy = state.yourBribedBy.get(i) >= 0 ? state.yourBribedBy.get(i) : null;
  }
  g.pending = [emptyChoices(0), emptyChoices(1)];
  if (state._hasYourChoices()) {
    const c = state.yourChoices;
    const out: PlayerChoices = g.pending[seat];
    if (c._hasSalary()) for (let i = 0; i < UNITS_PER_PLAYER; i++) out.salary[i] = c.salary.get(i);
    if (c._hasBribe()) for (let i = 0; i < UNITS_PER_PLAYER; i++) out.bribe[i] = c.bribe.get(i);
    if (c._hasBribeTarget()) for (let i = 0; i < UNITS_PER_PLAYER; i++) out.bribeTarget[i] = c.bribeTarget.get(i);
    if (c._hasMoves()) for (let i = 0; i < UNITS_PER_PLAYER; i++) {
      const m = c.moves.get(i);
      out.moves[i] = { dest: m.dest, bid: m.bid, bribe: m.bribe };
    }
    out.sale = c.sale;
  }
  g.leaks = [[], []];
  for (let i = 0; i < state.leaks.length; i++) {
    const l = state.leaks.get(i);
    g.leaks[seat].push({ unit: l.unit, dest: l.dest, bid: l.bid, bribe: l.bribe,
      salary: l.salary, bribeTotal: l.bribeTotal } as Leak);
  }
  g.saleLeaks = [null, null];
  g.saleLeaks[seat] = state.saleLeak >= 0 ? state.saleLeak : null;
  g.inspectorWinnerSeat = g.phase === 'inspector' ? g.active : null;
  const winner = resultOf(state);
  g.result = winner === undefined ? null : { winner, reason: resultReason(state, winner) };
  return g;
}

function fillSalary(a: ReturnType<ReturnType<Msg['_initAction']>['_initSalary']>, c: PlayerChoices): void {
  const salary = a._initSalary(UNITS_PER_PLAYER);
  const bribe = a._initBribe(UNITS_PER_PLAYER);
  const target = a._initBribeTarget(UNITS_PER_PLAYER);
  for (let i = 0; i < UNITS_PER_PLAYER; i++) {
    salary.set(i, c.salary[i]);
    bribe.set(i, c.bribe[i]);
    target.set(i, c.bribeTarget[i]);
  }
}

export function packSalary(c: PlayerChoices): Uint8Array {
  return packGame(Msg, (m) => fillSalary(m._initAction()._initSalary(), c));
}

export function packMoves(c: PlayerChoices): Uint8Array {
  return packGame(Msg, (m) => {
    const moves = m._initAction()._initMoves()._initMoves(UNITS_PER_PLAYER);
    for (let i = 0; i < UNITS_PER_PLAYER; i++) {
      const out = moves.get(i);
      out.dest = c.moves[i].dest;
      out.bid = c.moves[i].bid;
      out.bribe = c.moves[i].bribe;
    }
  });
}

export function packSale(sale: number): Uint8Array {
  return packGame(Msg, (m) => { m._initAction().sale = Math.max(0, sale | 0); });
}

export function packInspector(region: number): Uint8Array {
  return packGame(Msg, (m) => { m._initAction().inspector = region; });
}

export function packAdjust(): Uint8Array {
  return packGame(Msg, (m) => { m._initAction().adjust = true; });
}

export function packMarketAdjust(): Uint8Array {
  return packGame(Msg, (m) => { m._initAction().marketAdjust = true; });
}

export function packNext(): Uint8Array {
  return packGame(Msg, (m) => { m._initAction().next = true; });
}

export function packSync(): Uint8Array {
  return packGame(Msg, (m) => { m._initAction().sync = true; });
}
