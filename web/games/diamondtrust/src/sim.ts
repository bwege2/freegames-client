// Diamond Trust of London's rules. The reference is the open-source DS game
// by Jason Rohrer (gameSource/): 8 months, 18 money, 2 starting diamonds,
// 3 agents each, London/Antwerp home regions, 6 Angolan producers, hidden
// salaries/bribes, secret moves and bids, the UN inspector and the open
// market. This engine runs the local hot-seat and computer games; the server's
// authoritative copy for online rooms is server/.../diamondtrust/TrustGame.java.
export const REGION_NAMES = ['London', 'Antwerp', 'Uige', 'Lunda Norte', 'Malanje',
  'Lunda Sul', 'Moxico', 'Cuando Cubango'] as const;
export const NUM_REGIONS = 8;
export const NUM_UNITS = 6;
export const UNITS_PER_PLAYER = 3;
export const START_MONEY = 18;
export const START_DIAMONDS = 2;
export const START_MONTHS = 8;
export const MARKET_POOL = 24;
export const ALLOWANCE = 18;

/** Region colours in angola_map.png (the first row of the original map). */
export const REGION_COLORS: [number, number, number][] = [
  [77, 255, 77], [255, 77, 77], [165, 146, 182], [228, 255, 73],
  [109, 182, 146], [219, 146, 171], [184, 255, 146], [255, 199, 58],
];

export type Phase = 'salary' | 'moves' | 'peek' | 'adjust' | 'inspector'
  | 'sale' | 'market' | 'marketPeek' | 'marketAdjust' | 'roundEnd' | 'end';

export interface Unit {
  owner: 0 | 1;
  region: number;
  salary: number;
  bribe: number;
  /** global index of the last agent that paid a bribe to this unit */
  bribedBy: number | null;
  carrying: number;
}

export interface MoveChoice { dest: number; bid: number; bribe: number }
export interface PlayerChoices {
  salary: number[];
  bribe: number[];
  /** for each own agent, the local index (0..2) of the opponent agent it bribes */
  bribeTarget: number[];
  moves: MoveChoice[];
  sale: number;
}

export interface Leak {
  unit: number;
  dest: number;
  bid: number;
  bribe: number;
  salary: number;
  bribeTotal: number;
}

export interface GameResult { winner: 0 | 1 | null; reason: string }

export class DiamondGame {
  monthsLeft = START_MONTHS;
  round = 1;
  money: number[] = [START_MONEY, START_MONEY];
  diamonds: number[] = [START_DIAMONDS, START_DIAMONDS];
  regions: number[] = new Array(NUM_REGIONS).fill(0);
  units: Unit[] = [];
  inspector = 2;
  phase: Phase = 'salary';
  active: 0 | 1 = 0;
  pending: [PlayerChoices, PlayerChoices] = [emptyChoices(0), emptyChoices(1)];
  submitted: [boolean, boolean] = [false, false];
  leaks: [Leak[], Leak[]] = [[], []];
  saleLeaks: [number | null, number | null] = [null, null];
  inspectorWinnerSeat: 0 | 1 | null = null;
  lastSummary: string[] = [];
  result: GameResult | null = null;
  seed: number;

  static fromSnapshot(json: string): DiamondGame {
    const g = new DiamondGame(1);
    Object.assign(g, JSON.parse(json));
    return g;
  }

  constructor(seed = 0x51a7e) {
    this.seed = seed >>> 0 || 1;
    for (let p = 0; p < 2; p++) {
      for (let i = 0; i < UNITS_PER_PLAYER; i++) {
        this.units.push({ owner: p as 0 | 1, region: p, salary: 0, bribe: 0, bribedBy: null, carrying: 0 });
      }
    }
    // inspector starts in a random producing region (2..7)
    this.inspector = 2 + (this.seed % 6);
    this.pending = [emptyChoices(0), emptyChoices(1)];
    this.accumulate();
    this.phase = 'salary';
    this.active = 0;
  }

  unit(player: 0 | 1, i: number): Unit { return this.units[player * UNITS_PER_PLAYER + i]; }
  ownIndex(player: 0 | 1, i: number): number { return player * UNITS_PER_PLAYER + i; }

  rate(region: number): number {
    if (region < 2) return 0;
    if (region === 7) return this.monthsLeft % 2 === 0 ? 1 : 2;
    if (region === 6) return 2;
    return 1;
  }

  accumulate(): void {
    for (let r = 2; r < NUM_REGIONS; r++) this.regions[r] += this.rate(r);
  }

  emptyFor(player: 0 | 1): PlayerChoices { return emptyChoices(player); }

  /** Copy the current choices so the UI can edit without touching the pending set. */
  choicesFor(player: 0 | 1): PlayerChoices { return cloneChoices(this.pending[player]); }

  setChoices(player: 0 | 1, choices: PlayerChoices): void {
    this.pending[player] = sanitizeChoices(this, player, choices);
  }

  cost(player: 0 | 1, choices: PlayerChoices): number {
    let cost = 0;
    for (let i = 0; i < UNITS_PER_PLAYER; i++) {
      cost += Math.max(0, choices.salary[i] | 0);
      cost += Math.max(0, choices.bribe[i] | 0);
      const m = choices.moves[i];
      const u = this.unit(player, i);
      cost += moveCost(u.region, m.dest);
      if (m.dest !== this.inspector) cost += Math.max(0, m.bid | 0);
      else cost += Math.max(0, m.bribe | 0);
    }
    return cost;
  }

  affordable(player: 0 | 1, choices: PlayerChoices): boolean {
    return this.cost(player, choices) <= this.money[player];
  }

  /** Salary is only paid at home; a bribe only to an opponent in the same producing region. */
  canSalary(player: 0 | 1, i: number): boolean {
    return this.unit(player, i).region === player;
  }
  canBribe(player: 0 | 1, i: number): boolean {
    const u = this.unit(player, i);
    return u.region >= 2 && this.units.some((o) => o.owner !== player && o.region === u.region);
  }

  bribeTargets(player: 0 | 1, i: number): number[] {
    const u = this.unit(player, i);
    return this.units.map((o, idx) => o.owner !== player && o.region === u.region ? idx : -1).filter((x) => x >= 0);
  }

  isBribed(unit: Unit): boolean { return unit.bribe > unit.salary; }

  /** What the opponent may see through this player's bribed units. */
  peekFor(player: 0 | 1): Leak[] {
    const out: Leak[] = [];
    const choices = this.pending[player];
    for (let i = 0; i < UNITS_PER_PLAYER; i++) {
      const u = this.unit(player, i);
      if (!this.isBribed(u)) continue;
      const m = choices.moves[i];
      out.push({ unit: i, dest: m.dest, bid: m.bid, bribe: m.bribe,
        salary: u.salary, bribeTotal: u.bribe });
    }
    return out;
  }

  salePeekFor(player: 0 | 1): number | null {
    const homeBribed = this.units.some((u) => u.owner === player && u.region === player && this.isBribed(u));
    return homeBribed ? this.pending[player].sale : null;
  }

  submitSalary(player: 0 | 1): boolean {
    if (this.phase !== 'salary') return false;
    const c = sanitizeChoices(this, player, this.pending[player]);
    if (!this.affordable(player, c)) return false;
    this.pending[player] = c;
    this.submitted[player] = true;
    if (this.submitted[0] && this.submitted[1]) this.applySalary();
    else this.active = player === 0 ? 1 : 0;
    return true;
  }

  applySalary(): void {
    for (let p = 0; p < 2; p++) {
      const c = this.pending[p];
      let cost = 0;
      for (let i = 0; i < UNITS_PER_PLAYER; i++) {
        const u = this.unit(p as 0 | 1, i);
        const sal = Math.max(0, c.salary[i] | 0);
        const br = Math.max(0, c.bribe[i] | 0);
        if (sal && u.region === p) { u.salary += sal; cost += sal; }
        if (br) {
          const targets = this.bribeTargets(p as 0 | 1, i);
          if (targets.length > 0) {
            const wanted = Math.min(UNITS_PER_PLAYER - 1, Math.max(0, c.bribeTarget[i] | 0));
            const target = targets.includes((1 - p) * UNITS_PER_PLAYER + wanted)
              ? (1 - p) * UNITS_PER_PLAYER + wanted : targets[0];
            const opp = this.units[target];
            opp.bribe += br; opp.bribedBy = p * UNITS_PER_PLAYER + i; cost += br;
          }
        }
      }
      this.money[p] -= cost;
    }
    this.phase = 'moves';
    this.active = 0;
    this.submitted = [false, false];
    this.pending = [emptyChoices(0), emptyChoices(1)];
    for (let p = 0; p < 2; p++) {
      for (let i = 0; i < UNITS_PER_PLAYER; i++) {
        this.pending[p as 0 | 1].moves[i] = { dest: this.unit(p as 0 | 1, i).region, bid: 0, bribe: 0 };
      }
    }
  }

  submitMoves(player: 0 | 1): boolean {
    if (this.phase !== 'moves' && this.phase !== 'adjust') return false;
    const c = sanitizeChoices(this, player, this.pending[player]);
    if (!this.affordable(player, c)) return false;
    this.pending[player] = c;
    this.submitted[player] = true;
    if (this.submitted[0] && this.submitted[1]) {
      if (this.phase === 'moves') this.enterPeek();
      else this.applyMoves();
    } else this.active = player === 0 ? 1 : 0;
    return true;
  }

  enterPeek(): void {
    this.leaks = [this.peekFor(1), this.peekFor(0)];
    this.phase = 'peek';
    this.active = 0;
    this.submitted = [false, false];
  }

  /** After the peek screen, the player may adjust. */
  startAdjust(player: 0 | 1): void {
    if (this.phase !== 'peek' || player !== this.active) return;
    this.phase = 'adjust';
    this.active = player;
    this.submitted = [false, false];
    this.pending[0] = cloneChoices(this.pending[0]);
    this.pending[1] = cloneChoices(this.pending[1]);
  }

  applyMoves(): void {
    for (let p = 0; p < 2; p++) {
      const c = this.pending[p];
      let cost = 0;
      for (let i = 0; i < UNITS_PER_PLAYER; i++) {
        const u = this.unit(p as 0 | 1, i);
        const m = c.moves[i];
        cost += moveCost(u.region, m.dest);
        if (m.dest !== this.inspector) cost += Math.max(0, m.bid | 0);
        else cost += Math.max(0, m.bribe | 0);
        u.region = m.dest;
        this.pending[p].moves[i] = { ...m };
      }
      this.money[p] -= cost;
    }
    // deposits for units that came home
    for (const u of this.units) {
      if (u.region === u.owner && u.carrying) { this.diamonds[u.owner] += u.carrying; u.carrying = 0; }
    }
    const winner = this.inspectorWinner();
    this.inspectorWinnerSeat = winner;
    if (winner !== null) { this.phase = 'inspector'; this.active = winner; }
    else this.resolveInspector(-1);
  }

  inspectorWinner(): 0 | 1 | null {
    let best = 0, winner: 0 | 1 | null = null;
    for (const u of this.units) {
      if (u.region !== this.inspector) continue;
      const i = this.units.indexOf(u) - u.owner * UNITS_PER_PLAYER;
      const b = this.pending[u.owner].moves[i]?.bribe ?? 0;
      if (b > best) { best = b; winner = u.owner; }
      else if (b === best && b > 0) winner = null;
    }
    return winner;
  }

  resolveInspector(region: number): void {
    if (region >= 0) {
      this.inspector = region;
      for (const u of this.units) if (u.region === region && u.carrying) u.carrying = 0;
    }
    this.sellDiamonds();
  }

  sellDiamonds(): void {
    for (let r = 2; r < NUM_REGIONS; r++) {
      if (r === this.inspector || this.regions[r] <= 0) continue;
      let best = 0, winner: Unit | null = null, tie = false;
      for (const u of this.units) {
        if (u.region !== r) continue;
        const i = this.units.indexOf(u) - u.owner * UNITS_PER_PLAYER;
        const bid = this.pending[u.owner].moves[i]?.bid ?? 0;
        if (bid > best) { best = bid; winner = u; tie = false; }
        else if (bid === best && bid > 0) tie = true;
      }
      if (winner && !tie) { winner.carrying += this.regions[r]; this.regions[r] = 0; }
    }
    this.phase = 'market';
    this.active = 0;
    this.submitted = [false, false];
    for (let p = 0; p < 2; p++) this.pending[p as 0 | 1].sale = 0;
  }

  submitSale(player: 0 | 1): boolean {
    if (this.phase !== 'market' && this.phase !== 'marketAdjust') return false;
    const sale = Math.max(0, Math.min(this.diamonds[player], this.pending[player].sale | 0));
    this.pending[player].sale = sale;
    this.submitted[player] = true;
    if (this.submitted[0] && this.submitted[1]) {
      if (this.phase === 'market') {
        this.saleLeaks = [this.salePeekFor(1), this.salePeekFor(0)];
        this.phase = 'marketPeek'; this.active = 0; this.submitted = [false, false];
      } else this.applyMarket();
    } else this.active = player === 0 ? 1 : 0;
    return true;
  }

  startMarketAdjust(player: 0 | 1): void {
    if (this.phase !== 'marketPeek' || player !== this.active) return;
    this.phase = 'marketAdjust'; this.active = player; this.submitted = [false, false];
  }

  applyMarket(): void {
    const s0 = this.pending[0].sale, s1 = this.pending[1].sale;
    const total = s0 + s1;
    for (let p = 0; p < 2; p++) {
      const sale = this.pending[p as 0 | 1].sale;
      const earn = sale === 0 ? ALLOWANCE : total > 0 ? Math.floor((MARKET_POOL * sale) / total) : 0;
      this.money[p] += earn;
      this.diamonds[p] -= sale;
    }
    this.monthsLeft--;
    if (this.monthsLeft <= 0) {
      // final return home and deposit
      for (const u of this.units) {
        if (u.carrying) { this.diamonds[u.owner] += u.carrying; u.carrying = 0; }
        u.region = u.owner;
      }
      this.phase = 'end';
      let winner: 0 | 1 | null = null;
      if (this.diamonds[0] !== this.diamonds[1]) winner = this.diamonds[0] > this.diamonds[1] ? 0 : 1;
      else if (this.money[0] !== this.money[1]) winner = this.money[0] > this.money[1] ? 0 : 1;
      this.result = { winner, reason: winner === null ? 'Tie: equal diamonds and money' : `Player ${winner + 1} wins on diamonds` };
    } else {
      this.round++;
      this.accumulate();
      this.phase = 'roundEnd';
      this.active = 0;
      this.submitted = [false, false];
    }
  }

  beginMarket(): void {
    if (this.phase !== 'sale') return;
    this.phase = 'market'; this.active = 0; this.submitted = [false, false];
    for (let p = 0; p < 2; p++) this.pending[p as 0 | 1].sale = 0;
  }

  nextRound(): void {
    if (this.phase !== 'roundEnd') return;
    this.phase = 'salary'; this.active = 0; this.submitted = [false, false];
    this.pending = [emptyChoices(0), emptyChoices(1)];
    for (let p = 0; p < 2; p++) for (let i = 0; i < UNITS_PER_PLAYER; i++) {
      this.pending[p as 0 | 1].moves[i] = { dest: this.unit(p as 0 | 1, i).region, bid: 0, bribe: 0 };
    }
  }

  visibleMoney(player: 0 | 1): number | null {
    // The opponent's money is unknown unless a bribed unit is at their home.
    return player === this.active ? this.money[player] : null;
  }

  describe(): string[] {
    const out: string[] = [];
    out.push(`Month ${this.round} / ${START_MONTHS} — ${this.phase}`);
    out.push(`London diamonds ${this.diamonds[0]}, Antwerp diamonds ${this.diamonds[1]}`);
    out.push(`Inspector: ${REGION_NAMES[this.inspector]}`);
    for (let r = 2; r < NUM_REGIONS; r++) {
      if (this.regions[r]) out.push(`${REGION_NAMES[r]}: ${this.regions[r]} diamonds (${this.rate(r)}/month)`);
    }
    return out;
  }
}

export function moveCost(from: number, to: number): number {
  if (from === to) return 0;
  if (from < 2 || to < 2) return 2;
  return 1;
}

export function emptyChoices(player: 0 | 1): PlayerChoices {
  const salaries = [0, 0, 0], bribes = [0, 0, 0];
  const moves: MoveChoice[] = [];
  for (let i = 0; i < UNITS_PER_PLAYER; i++) moves.push({ dest: player, bid: 0, bribe: 0 });
  return { salary: salaries, bribe: bribes, bribeTarget: [0, 0, 0], moves, sale: 0 };
}

export function cloneChoices(c: PlayerChoices): PlayerChoices {
  return { salary: c.salary.slice(), bribe: c.bribe.slice(),
    bribeTarget: c.bribeTarget.slice(), moves: c.moves.map((m) => ({ ...m })), sale: c.sale };
}

/** Clamp values and enforce the unit/region constraints; never lets money go negative. */
export function sanitizeChoices(game: DiamondGame, player: 0 | 1, input: PlayerChoices): PlayerChoices {
  const out = cloneChoices(input);
  const usedDest = new Set<number>();
  for (let i = 0; i < UNITS_PER_PLAYER; i++) {
    out.salary[i] = game.canSalary(player, i) ? Math.max(0, out.salary[i] | 0) : 0;
    out.bribe[i] = game.canBribe(player, i) ? Math.max(0, out.bribe[i] | 0) : 0;
    out.bribeTarget[i] = Math.min(UNITS_PER_PLAYER - 1, Math.max(0, out.bribeTarget[i] | 0));
    const targets = game.bribeTargets(player, i);
    const wanted = (1 - player) * UNITS_PER_PLAYER + out.bribeTarget[i];
    if (!targets.includes(wanted)) out.bribeTarget[i] = targets.length > 0
      ? targets[0] - (1 - player) * UNITS_PER_PLAYER : 0;
    const m = out.moves[i];
    m.bid = Math.max(0, m.bid | 0);
    m.bribe = Math.max(0, m.bribe | 0);
    if (m.dest === 1 - player) m.dest = game.unit(player, i).region;
    if (m.dest < 0 || m.dest >= NUM_REGIONS) m.dest = game.unit(player, i).region;
    if (m.dest >= 2) {
      if (usedDest.has(m.dest)) m.dest = player;
      else usedDest.add(m.dest);
    }
    if (m.dest === game.inspector) { m.bid = 0; }
    else m.bribe = 0;
    if (m.dest < 2) { m.bid = 0; m.bribe = 0; }
  }
  // trim payments from the end until affordable
  const cost = game.cost(player, out);
  let over = cost - game.money[player];
  for (let i = UNITS_PER_PLAYER - 1; i >= 0 && over > 0; i--) {
    const take = Math.min(over, out.moves[i].bid + out.moves[i].bribe + out.salary[i] + out.bribe[i]);
    if (!take) continue;
    let left = take;
    const fields: ('bid' | 'bribe' | 'salary' | 'bribePay')[] = ['bid', 'bribe', 'salary', 'bribePay'];
    for (const f of fields) {
      if (left <= 0) break;
      if (f === 'bid') { const v = Math.min(left, out.moves[i].bid); out.moves[i].bid -= v; left -= v; }
      else if (f === 'bribe') { const v = Math.min(left, out.moves[i].bribe); out.moves[i].bribe -= v; left -= v; }
      else if (f === 'salary') { const v = Math.min(left, out.salary[i]); out.salary[i] -= v; left -= v; }
      else { const v = Math.min(left, out.bribe[i]); out.bribe[i] -= v; left -= v; }
    }
    over -= take;
  }
  out.sale = Math.max(0, Math.min(game.diamonds[player], out.sale | 0));
  return out;
}
