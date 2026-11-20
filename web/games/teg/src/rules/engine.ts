// The rules of TEG 0.13.0, translated from the server (server/play.cpp, helper.cpp, turno.cpp,
// missions.cpp, countries.cpp, player.cpp) and the client's state machine (client/*.cpp). This is a
// pure state machine: no DOM, no timers, no socket. The browser UI and the robot drive it; the
// tests replay the original's transcripts through it.
import {
  CARD_VALUE, CONTINENTS, COUNTRIES, COUNTRY_COUNT, MAX_CARDS, MAX_PLAYERS, MISSION_COMMON,
  MISSION_CONQWORLD, MISSIONS, missionName, type CardKind,
} from './data.ts';
import { GlibcRand } from './rng.ts';

export type Phase = 'place1' | 'place2' | 'reinforce' | 'attack' | 'regroup' | 'card' | 'move' | 'over';

export interface GameOptions {
  /** the original's `mission` option: play with secret missions instead of conquering the world */
  secretMissions: boolean;
  /** the original's `common_mission`: the 30-country common mission is also a way to win */
  commonMission: boolean;
  fogOfWar: boolean;
  /** g_game.fichas: the armies of the first initial placement (5 in the server's defaults) */
  startArmies: number;
  /** g_game.fichas2: the armies of the second initial placement (3) */
  secondArmies: number;
}

export const DEFAULT_OPTIONS: GameOptions = {
  secretMissions: false, commonMission: true, fogOfWar: false, startArmies: 5, secondArmies: 3,
};

export interface PlayerSetup {
  name: string;
  color: number;
  human: boolean;
}

export interface PlayerStats {
  countriesWon: number;
  armiesKilled: number;
  continentsTurn: number[];
  playersKilled: number;
}

export interface Player {
  /** 0..n-1, the original's numjug; the player list is in seat order */
  seat: number;
  name: string;
  color: number;
  human: boolean;
  /** still playing (not eliminated and not surrendered) */
  active: boolean;
  eliminated: boolean;
  mission: number;
  exchanges: number;
  hasExchanged: boolean;
  /** countries conquered during this turn (turno_conq) */
  conquered: number;
  stats: PlayerStats;
  score: number;
  /** the online snapshot's public counts; -1 in a local game (the board has everything) */
  knownCountries: number;
  knownArmies: number;
  knownCards: number;
}

export interface CountryState {
  owner: number;
  armies: number;
  /** armies moved here by regrouping this turn (ejer_reagrupe) */
  regrouped: number;
  /** the country's card: tarjeta.numjug, -1 when nobody holds it */
  cardOwner: number;
  /** tarjeta.usada */
  cardUsed: boolean;
}

export interface DiceRoll {
  src: number;
  dst: number;
  /** the dice as the original sorts them: descending, absent dice 0 */
  srcDice: number[];
  dstDice: number[];
  srcLost: number;
  dstLost: number;
}

export type LogKind =
  | 'info' | 'error' | 'attack' | 'dice' | 'conquest' | 'card' | 'exchange' | 'turn'
  | 'round' | 'win' | 'lost' | 'place' | 'regroup' | 'move' | 'mission' | 'chat';

export interface LogEntry {
  kind: LogKind;
  text: string;
  seat?: number;
}

export interface PendingMove {
  src: number;
  dst: number;
  /** the amount the original's `tropas` message offers, at most 2 (the 1 automatic army is
   *  already in dst) */
  max: number;
}

const MAX_LOG = 300;

/** cards_for_this_exchange() in common/common.cpp */
export function cardsForExchange(exchanges: number): number {
  switch (exchanges) {
    case 0: return 0;
    case 1: return 4;
    case 2: return 7;
    case 3: return 10;
    default: return (exchanges - 1) * 5;
  }
}

/** can_trade_cards() in common/tarjeta.cpp */
export function canTradeCards(a: CardKind, b: CardKind, c: CardKind): boolean {
  const r = CARD_VALUE[a] | CARD_VALUE[b] | CARD_VALUE[c];
  return (r & CARD_VALUE.joker) !== 0
    || r === CARD_VALUE.galleon
    || r === CARD_VALUE.cannon
    || r === CARD_VALUE.balloon
    || r === (CARD_VALUE.galleon | CARD_VALUE.cannon | CARD_VALUE.balloon);
}

/** the original's `country_libre` / `tarjeta_es_libre` style predicate, with the exact fallback
 *  search of get_random_country() in server/helper.cpp */
function getRandomCountry(rng: GlibcRand, pred: (i: number) => boolean): number {
  for (;;) {
    let i = rng.between(0, COUNTRY_COUNT - 1);
    if (pred(i)) return i;
    const r = rng.between(0, 2);
    if (r === 0) {
      for (; i >= 0; i--) if (pred(i)) return i;
      for (i = COUNTRY_COUNT - 1; i >= 0; i--) if (pred(i)) return i;
      return 0;
    }
    if (r === 1) {
      for (; i < COUNTRY_COUNT; i++) if (pred(i)) return i;
      for (i = 0; i < COUNTRY_COUNT; i++) if (pred(i)) return i;
      return 0;
    }
    // r === 2: search again
  }
}

export interface SnapshotCountry {
  id: number;
  owner: number;
  armies: number;
  regrouped: number;
  cardOwner: number;
  cardUsed: boolean;
}
export interface SnapshotPlayer {
  seat: number;
  name: string;
  color: number;
  active: boolean;
  eliminated: boolean;
  countries: number;
  armies: number;
  cards: number;
  mission: number;
  exchanges: number;
  hasExchanged: boolean;
  conquered: number;
  score: number;
}
export interface SnapshotEvent {
  seq: number;
  kind: string;
  text: string;
  seat: number;
  src: number;
  dst: number;
  srcDice: number[];
  dstDice: number[];
  card: number;
  amount: number;
}
export interface Snapshot {
  countries: SnapshotCountry[];
  players: SnapshotPlayer[];
  turn: number;
  phase: Phase;
  round: number;
  roundStarter: number;
  pending: PendingMove | null;
  winner: number;
  winnerMission: number;
  event: SnapshotEvent | null;
  options: GameOptions;
}
function snapshotKind(k: string): LogKind {
  switch (k) {
    case 'error': return 'error';
    case 'attack': return 'attack';
    case 'dice': return 'dice';
    case 'conquest': return 'conquest';
    case 'card': return 'card';
    case 'exchange': return 'exchange';
    case 'turn': return 'turn';
    case 'round': return 'round';
    case 'win': return 'win';
    case 'lost': return 'lost';
    case 'place': return 'place';
    case 'regroup': return 'regroup';
    case 'move': return 'move';
    case 'mission': return 'mission';
    case 'chat': return 'chat';
    default: return 'info';
  }
}

export class TegGame {
  readonly countries: CountryState[] = [];
  readonly players: Player[] = [];
  readonly options: GameOptions;
  readonly rng: GlibcRand;
  /** the position in `players` whose turn it is */
  turn = 0;
  round = 1;
  phase: Phase = 'place1';
  /** the player index who started this round (g_game.empieza_turno) */
  roundStarter = 0;
  /** the previous player of the round (g_game.old_turn), -1 before the first turn change */
  oldTurn = -1;
  /** players still in the game (g_game.playing) */
  playing = 0;
  pendingMove: PendingMove | null = null;
  lastDice: DiceRoll | null = null;
  winner: number | null = null;
  winnerMission = -1;
  /** which player holds which mission (g_missions[].player_number), -1 free; 0/1 are reserved */
  readonly missionOwner: number[] = [];
  /** incremented on every change; the UI redraws when it changes */
  version = 0;
  readonly log: LogEntry[] = [];

  private constructor(seed: number, setups: readonly PlayerSetup[], options: GameOptions) {
    if (setups.length < 2 || setups.length > MAX_PLAYERS) throw new Error(`2..${MAX_PLAYERS} players`);
    this.options = { ...options };
    this.rng = new GlibcRand(seed);
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      this.countries.push({ owner: -1, armies: 0, regrouped: 0, cardOwner: -1, cardUsed: false });
    }
    for (let i = 0; i < setups.length; i++) {
      const s = setups[i];
      this.players.push({
        seat: i, name: s.name.slice(0, 24), color: s.color, human: s.human, active: true,
        eliminated: false, mission: -1, exchanges: 0, hasExchanged: false, conquered: 0,
        stats: { countriesWon: 0, armiesKilled: 0, continentsTurn: [0, 0, 0, 0, 0, 0], playersKilled: 0 },
        score: 0, knownCountries: -1, knownArmies: -1, knownCards: -1,
      });
    }
    for (let i = 0; i < MISSIONS.length; i++) this.missionOwner.push(i === MISSION_CONQWORLD || i === MISSION_COMMON ? 0 : -1);
    this.playing = this.players.length;
    // token_start(): countries_repartir(), turno_init(), the first player places the 5 armies.
    this.distributeCountries();
    this.turn = this.players[this.rng.between(0, this.playing - 1)].seat;
    this.roundStarter = this.turn;
    this.phase = 'place1';
    this.add('info', `The game starts: ${this.player(this.turn).name} places the first armies.`);
  }

  static create(seed: number, setups: readonly PlayerSetup[], options: Partial<GameOptions> = {}): TegGame {
    const o = { ...DEFAULT_OPTIONS, ...options };
    if (o.startArmies < 1 || o.secondArmies < 1) throw new Error('armies must be positive');
    return new TegGame(seed >>> 0, setups, o);
  }

  // ---------------------------------------------------------------- small queries
  player(i: number): Player { return this.players[i]; }
  turnPlayer(): Player { return this.players[this.turn]; }
  countriesOf(seat: number): number[] {
    const out: number[] = [];
    for (let i = 0; i < COUNTRY_COUNT; i++) if (this.countries[i].owner === seat) out.push(i);
    return out;
  }
  armiesOf(seat: number): number {
    let n = 0;
    for (const c of this.countries) if (c.owner === seat) n += c.armies;
    return n;
  }
  cardsOf(seat: number): number[] {
    const out: number[] = [];
    for (let i = 0; i < COUNTRY_COUNT; i++) if (this.countries[i].cardOwner === seat) out.push(i);
    return out;
  }
  cardCount(seat: number): number {
    const p = this.player(seat);
    return p.knownCards >= 0 ? p.knownCards : this.cardsOf(seat).length;
  }
  /** the status table: the online snapshot's counts, or the board's own */
  displayCountries(seat: number): number {
    const p = this.player(seat);
    return p.knownCountries >= 0 ? p.knownCountries : this.countriesOf(seat).length;
  }
  displayArmies(seat: number): number {
    const p = this.player(seat);
    return p.knownArmies >= 0 ? p.knownArmies : this.armiesOf(seat);
  }
  countriesInContinent(seat: number, cont: number): number {
    let n = 0;
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (this.countries[i].owner === seat && COUNTRIES[i].continent === cont) n++;
    }
    return n;
  }
  /** player_listar_conts(): bitfield of complete continents */
  completeContinents(seat: number): number {
    let bits = 0;
    for (const c of CONTINENTS) if (this.countriesInContinent(seat, c.id) === c.countries) bits |= 1 << c.id;
    return bits;
  }
  continentBonus(seat: number): number {
    let n = 0;
    for (const c of CONTINENTS) if (this.completeContinents(seat) & (1 << c.id)) n += c.bonus;
    return n;
  }
  /** player_fichasc_cant(): 3 armies, or half of the countries above six */
  baseReinforcement(seat: number): number {
    const n = this.countriesOf(seat).length;
    return n <= 6 ? 3 : Math.floor(n / 2);
  }
  exchangeBonus(seat: number): number {
    const p = this.player(seat);
    return p.hasExchanged ? cardsForExchange(p.exchanges) : 0;
  }
  reinforcement(seat: number): { base: number; conts: number; bonus: number; exchange: number; total: number } {
    const base = this.baseReinforcement(seat);
    const conts = this.completeContinents(seat);
    const bonus = this.continentBonus(seat);
    const exchange = this.exchangeBonus(seat);
    return { base, conts, bonus, exchange, total: base + bonus + exchange };
  }

  // ---------------------------------------------------------------- the RNG and the start
  private distributeCountries(): void {
    const playing = this.playing;
    const rest = COUNTRY_COUNT % playing;
    let j = 0;
    for (let i = 0; i < COUNTRY_COUNT - rest; i++) {
      const c = getRandomCountry(this.rng, (k) => this.countries[k].owner === -1);
      this.countries[c].owner = this.players[j].seat;
      this.countries[c].armies = 1;
      j = (j + 1) % playing;
    }
    if (rest) {
      j = this.rng.between(0, playing - 1);
      for (let i = 0; i < rest; i++) {
        const c = getRandomCountry(this.rng, (k) => this.countries[k].owner === -1);
        this.countries[c].owner = this.players[j].seat;
        this.countries[c].armies = 1;
        j = (j + 1) % playing;
      }
    }
    for (const p of this.players) this.updateScore(p.seat);
  }

  // ---------------------------------------------------------------- logging and scores
  private add(kind: LogKind, text: string, seat?: number): void {
    this.log.push({ kind, text, seat });
    if (this.log.length > MAX_LOG) this.log.splice(0, this.log.length - MAX_LOG);
    this.version++;
  }
  private fail(text: string): false {
    this.add('error', text);
    return false;
  }
  updateScore(seat: number): void {
    const p = this.player(seat);
    let s = p.stats.countriesWon * 5 + p.stats.armiesKilled * 2;
    for (let i = 0; i < CONTINENTS.length; i++) s += p.stats.continentsTurn[i] * CONTINENTS[i].bonus;
    p.score = s;
  }

  // ---------------------------------------------------------------- turn order
  nextActive(seat: number): number {
    const n = this.players.length;
    for (let k = 1; k <= n; k++) {
      const p = this.players[(seat + k) % n];
      if (p.active) return p.seat;
    }
    return seat;
  }
  private beginAttackRound(index: number): void {
    this.turn = index;
    this.phase = 'attack';
    this.pendingMove = null;
    this.add('turn', `${this.player(index).name} has the turn to attack.`, index);
  }
  private afterPlacement(): void {
    const next = this.nextActive(this.turn);
    if (this.phase === 'place1') {
      if (next === this.roundStarter) {
        this.phase = 'place2';
        this.turn = this.roundStarter;
        this.add('place', `${this.player(this.turn).name} places the second armies.`, this.turn);
      } else {
        this.turn = next;
        this.add('place', `${this.player(this.turn).name} places the first armies.`, this.turn);
      }
      return;
    }
    if (this.phase === 'place2') {
      if (next === this.roundStarter) this.beginAttackRound(this.roundStarter);
      else {
        this.turn = next;
        this.add('place', `${this.player(this.turn).name} places the second armies.`, this.turn);
      }
      return;
    }
    // reinforce
    if (next === this.roundStarter) this.beginAttackRound(this.roundStarter);
    else {
      this.turn = next;
      this.add('place', `${this.player(this.turn).name} places armies.`, this.turn);
    }
  }

  // ---------------------------------------------------------------- placing armies
  /** the total the player must place in the current phase, or -1 */
  requiredArmies(seat: number): number {
    if (seat !== this.turn) return -1;
    if (this.phase === 'place1') return this.options.startArmies;
    if (this.phase === 'place2') return this.options.secondArmies;
    if (this.phase === 'reinforce') return this.reinforcement(seat).total;
    return -1;
  }

  /**
   * What is wrong with a whole placement, or null when it is legal (the checks of token_fichas inside).
   * The page asks this before it sends a placement, so a refused plan keeps its armies where they are.
   */
  checkPlacement(seat: number, placements: ReadonlyMap<number, number>): string | null {
    if (seat !== this.turn) return 'It is not your turn to place armies.';
    if (this.phase !== 'place1' && this.phase !== 'place2' && this.phase !== 'reinforce') {
      return 'It is not the moment to place armies.';
    }
    const required = this.requiredArmies(seat);
    const counts = new Array<number>(COUNTRY_COUNT).fill(0);
    let total = 0;
    for (const [country, n] of placements) {
      if (!Number.isInteger(country) || country < 0 || country >= COUNTRY_COUNT) return 'Unknown country.';
      if (!Number.isInteger(n) || n < 0) return 'Invalid number of armies.';
      if (this.countries[country].owner !== seat) return 'You can only place armies in your own countries.';
      counts[country] += n;
      total += n;
    }
    if (total !== required) return `You must place exactly ${required} armies (you placed ${total}).`;
    if (this.phase === 'reinforce') {
      const conts = this.completeContinents(seat);
      for (const c of CONTINENTS) {
        if (!(conts & (1 << c.id))) continue;
        let n = 0;
        for (let i = 0; i < COUNTRY_COUNT; i++) if (COUNTRIES[i].continent === c.id) n += counts[i];
        if (n < c.bonus) return `The ${c.bonus} armies of ${c.name} must be placed in ${c.name}.`;
      }
    }
    return null;
  }

  /** token_fichas / token_fichas2 / token_fichasc: a whole placement in one command */
  place(seat: number, placements: ReadonlyMap<number, number>): boolean {
    const wrong = this.checkPlacement(seat, placements);
    if (wrong != null) return this.fail(wrong);
    const counts = new Array<number>(COUNTRY_COUNT).fill(0);
    let total = 0;
    for (const [country, n] of placements) {
      counts[country] += n;
      total += n;
    }
    if (this.phase === 'reinforce') this.player(seat).hasExchanged = false;
    for (let i = 0; i < COUNTRY_COUNT; i++) if (counts[i]) this.countries[i].armies += counts[i];
    const name = this.player(seat).name;
    const list = [...placements].filter(([, n]) => n > 0)
      .map(([c, n]) => `${COUNTRIES[c].name} ${n}`).join(', ');
    this.add('place', `${name} placed ${total} armies${list ? `: ${list}` : ''}.`, seat);
    this.afterPlacement();
    return true;
  }

  // ---------------------------------------------------------------- attacking
  /** aux_token_attack(): roll and compare the dice, without changing the game */
  rollAttack(src: number, dst: number): DiceRoll {
    const a = Math.min(this.countries[src].armies - 1, 3);
    const d = Math.min(this.countries[dst].armies, 3);
    const srcDice: number[] = [];
    const dstDice: number[] = [];
    for (let i = 0; i < a; i++) srcDice.push(this.rng.between(1, 6));
    for (let i = 0; i < d; i++) dstDice.push(this.rng.between(1, 6));
    srcDice.sort((x, y) => y - x);
    dstDice.sort((x, y) => y - x);
    let srcLost = 0;
    let dstLost = 0;
    for (let i = 0; i < 3 && i < srcDice.length && i < dstDice.length; i++) {
      if (srcDice[i] > dstDice[i]) dstLost++;
      else srcLost++;
    }
    return { src, dst, srcDice, dstDice, srcLost, dstLost };
  }

  canAttack(seat: number, src: number, dst: number): boolean {
    if (seat !== this.turn) return false;
    if (this.phase !== 'attack' && this.phase !== 'move') return false;
    if (src < 0 || src >= COUNTRY_COUNT || dst < 0 || dst >= COUNTRY_COUNT || src === dst) return false;
    if (this.countries[src].owner !== seat || this.countries[dst].owner === seat) return false;
    if (this.countries[src].armies < 2 || this.countries[dst].armies < 1) return false;
    return COUNTRIES[src].adj.includes(dst);
  }

  /** token_attack: one attack from src to dst; returns the dice or null if refused */
  attack(seat: number, src: number, dst: number): DiceRoll | null {
    if (this.phase === 'move') {
      // token_attack() accepts a player in TROPAS: it skips the extra move
      this.pendingMove = null;
      this.phase = 'attack';
    }
    if (!this.canAttack(seat, src, dst)) {
      this.fail('That attack is not possible.');
      return null;
    }
    const roll = this.rollAttack(src, dst);
    this.lastDice = roll;
    const a = this.countries[src];
    const d = this.countries[dst];
    const aPlayer = this.player(seat);
    const dSeat = d.owner;
    const dPlayer = this.player(dSeat);
    a.armies -= roll.srcLost;
    d.armies -= roll.dstLost;
    aPlayer.stats.armiesKilled += roll.dstLost;
    dPlayer.stats.armiesKilled += roll.srcLost;
    this.add('dice', `${COUNTRIES[src].name} ${roll.srcDice.join(' ') || '-'} vs ${COUNTRIES[dst].name} ${roll.dstDice.join(' ') || '-'}: ${roll.srcLost} lost, ${roll.dstLost} lost.`, seat);
    if (d.armies === 0) {
      aPlayer.conquered++;
      aPlayer.stats.countriesWon++;
      d.owner = seat;
      d.armies++;
      a.armies--;
      this.add('conquest', `${aPlayer.name} conquered ${COUNTRIES[dst].name} from ${dPlayer.name}.`, seat);
      if (this.countriesOf(dSeat).length === 0) {
        dPlayer.active = false;
        dPlayer.eliminated = true;
        this.playing--;
        if (this.roundStarter === dSeat) this.roundStarter = this.nextActive(dSeat);
        this.add('lost', `${dPlayer.name} has no countries left and is out of the game.`, dSeat);
      }
      this.updateScore(seat);
      this.updateScore(dSeat);
      const missionWon = this.checkMission(seat);
      if (this.playing < 2 || missionWon) {
        this.endGame(seat);
        return roll;
      }
      const max = Math.min(a.armies - 1, 2);
      this.pendingMove = { src, dst, max };
      this.phase = 'move';
      this.add('move', `1 army moved to ${COUNTRIES[dst].name}; choose how many more (0..${max}).`, seat);
    } else {
      this.updateScore(seat);
      this.updateScore(dSeat);
    }
    this.version++;
    return roll;
  }

  /** token_tropas: move 0..max armies into the country just conquered */
  moveAfterConquest(seat: number, n: number): boolean {
    if (seat !== this.turn || this.phase !== 'move' || !this.pendingMove) return this.fail('There is no conquered country to move armies into.');
    const { src, dst } = this.pendingMove;
    if (!Number.isInteger(n) || n < 0) return this.fail('Invalid number of armies.');
    const max = Math.min(this.countries[src].armies - 1, 3);
    if (n > max) return this.fail(`At most ${max} armies can be moved.`);
    if (n > 0) {
      this.countries[src].armies -= n;
      this.countries[dst].armies += n;
      this.add('move', `${this.player(seat).name} moved ${n} more armies from ${COUNTRIES[src].name} to ${COUNTRIES[dst].name}.`, seat);
    } else {
      this.add('move', `${this.player(seat).name} moved no more armies into ${COUNTRIES[dst].name}.`, seat);
    }
    this.pendingMove = null;
    this.phase = 'attack';
    this.version++;
    return true;
  }

  // ---------------------------------------------------------------- regrouping
  canRegroup(seat: number, src: number, dst: number, n: number): boolean {
    if (seat !== this.turn || (this.phase !== 'attack' && this.phase !== 'regroup')) return false;
    if (src < 0 || src >= COUNTRY_COUNT || dst < 0 || dst >= COUNTRY_COUNT || src === dst) return false;
    if (this.countries[src].owner !== seat || this.countries[dst].owner !== seat) return false;
    if (!COUNTRIES[src].adj.includes(dst)) return false;
    if (!Number.isInteger(n) || n <= 0) return false;
    return n <= this.countries[src].armies - this.countries[src].regrouped - 1;
  }

  /** token_regroup: move armies between two own neighbouring countries */
  regroup(seat: number, src: number, dst: number, n: number): boolean {
    if (!this.canRegroup(seat, src, dst, n)) return this.fail('Those armies cannot be regrouped.');
    const s = this.countries[src];
    const d = this.countries[dst];
    s.armies -= n;
    d.armies += n;
    d.regrouped += n;
    this.phase = 'regroup';
    this.add('regroup', `${this.player(seat).name} regrouped ${n} armies from ${COUNTRIES[src].name} to ${COUNTRIES[dst].name}.`, seat);
    this.version++;
    return true;
  }

  // ---------------------------------------------------------------- cards
  canDrawCard(seat: number): boolean {
    if (seat !== this.turn) return false;
    if (this.phase !== 'attack' && this.phase !== 'move' && this.phase !== 'regroup') return false;
    const p = this.player(seat);
    if (this.cardCount(seat) >= MAX_CARDS) return false;
    if (p.conquered < 1) return false;
    if (p.exchanges > 3 && p.conquered < 2) return false;
    return this.countries.some((c) => c.cardOwner === -1);
  }

  /** token_card: draw one free card after a conquest; if its country is yours, +2 armies */
  drawCard(seat: number): number | false {
    if (!this.canDrawCard(seat)) return this.fail('You cannot take a card now.');
    const p = this.player(seat);
    const country = getRandomCountry(this.rng, (i) => this.countries[i].cardOwner === -1);
    this.countries[country].cardOwner = seat;
    if (this.countries[country].owner === seat) {
      this.countries[country].armies += 2;
      this.countries[country].cardUsed = true;
      this.add('card', `${p.name} received the card of ${COUNTRIES[country].name} and 2 armies were placed there.`, seat);
    } else {
      this.add('card', `${p.name} received the card of ${COUNTRIES[country].name}.`, seat);
    }
    this.pendingMove = null;
    this.phase = 'card';
    this.version++;
    return country;
  }

  /** token_ejer2: put the 2 armies of a card the player owns on its country */
  useCard(seat: number, country: number): boolean {
    if (seat !== this.turn || this.phase !== 'card') return this.fail('It is not the moment to use a card.');
    if (country < 0 || country >= COUNTRY_COUNT) return this.fail('Unknown country.');
    const c = this.countries[country];
    if (c.cardOwner !== seat || c.cardUsed) return this.fail('You cannot use that card.');
    if (c.owner !== seat) return this.fail('You do not own the card\'s country.');
    c.armies += 2;
    c.cardUsed = true;
    this.add('card', `${this.player(seat).name} put 2 armies on ${COUNTRIES[country].name} with its card.`, seat);
    this.version++;
    return true;
  }

  canExchange(seat: number): boolean {
    if (seat !== this.turn || this.phase !== 'reinforce') return false;
    if (this.player(seat).hasExchanged) return false;
    const cards = this.cardsOf(seat);
    if (cards.length < 3) return false;
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (canTradeCards(COUNTRIES[cards[i]].card, COUNTRIES[cards[j]].card, COUNTRIES[cards[k]].card)) return true;
        }
      }
    }
    return false;
  }

  /** canje_puedo(): the first combination in country-card order, or null */
  findExchange(seat: number): [number, number, number] | null {
    const cards = this.cardsOf(seat);
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (canTradeCards(COUNTRIES[cards[i]].card, COUNTRIES[cards[j]].card, COUNTRIES[cards[k]].card)) {
            return [cards[i], cards[j], cards[k]];
          }
        }
      }
    }
    return null;
  }

  /** token_canje: exchange three cards for armies (one exchange per placement turn) */
  exchange(seat: number, a: number, b: number, c: number): boolean {
    if (seat !== this.turn || this.phase !== 'reinforce') return this.fail('It is not the moment to exchange cards.');
    const p = this.player(seat);
    if (p.hasExchanged) return this.fail('You can exchange only one set of cards per turn.');
    if (a === b || b === c || a === c) return this.fail('Choose three different cards.');
    for (const x of [a, b, c]) {
      if (x < 0 || x >= COUNTRY_COUNT || this.countries[x].cardOwner !== seat) return this.fail('Those cards are not yours.');
    }
    if (!canTradeCards(COUNTRIES[a].card, COUNTRIES[b].card, COUNTRIES[c].card)) {
      return this.fail('The cards must be all equal, or all different.');
    }
    for (const x of [a, b, c]) {
      this.countries[x].cardOwner = -1;
      this.countries[x].cardUsed = false;
    }
    p.exchanges++;
    p.hasExchanged = true;
    const n = cardsForExchange(p.exchanges);
    this.add('exchange', `${p.name} exchanged three cards for ${n} armies.`, seat);
    this.version++;
    return true;
  }

  // ---------------------------------------------------------------- missions
  /** mission_asignar(): assign a secret mission, or the world-conquest mission */
  requestMission(seat: number): number {
    const p = this.player(seat);
    if (p.mission >= 0) return p.mission;
    if (!this.options.secretMissions) {
      p.mission = MISSION_CONQWORLD;
      this.add('mission', `${p.name} plays to conquer the world.`, seat);
      return p.mission;
    }
    const obj = this.rng.between(0, MISSIONS.length - 1);
    for (let k = 0; k < MISSIONS.length; k++) {
      const i = (obj + k) % MISSIONS.length;
      if (this.missionOwner[i] === -1) {
        this.missionOwner[i] = seat;
        p.mission = i;
        this.add('mission', `${p.name} received a secret mission.`, seat);
        return i;
      }
    }
    p.mission = MISSION_CONQWORLD;
    return p.mission;
  }

  /** mission_chequear(): true when the player has accomplished the mission */
  checkMission(seat: number): boolean {
    const p = this.player(seat);
    if (p.mission < 0) this.requestMission(seat);
    if (this.options.commonMission && p.mission !== MISSION_CONQWORLD) {
      if (this.countriesOf(seat).length >= MISSIONS[MISSION_COMMON].total) {
        p.mission = MISSION_COMMON;
        this.add('mission', `${p.name} accomplished the common mission.`, seat);
        return true;
      }
    }
    const mission = MISSIONS[p.mission];
    for (let i = 0; i < CONTINENTS.length; i++) {
      if (this.countriesInContinent(seat, i) < mission.continents[i]) return false;
    }
    if (mission.frontier) {
      let ok = false;
      for (const j of this.countriesOf(seat)) {
        let n = 0;
        for (const k of this.countriesOf(seat)) if (COUNTRIES[j].adj.includes(k)) n++;
        if (n >= mission.frontier) { ok = true; break; }
      }
      if (!ok) return false;
    }
    this.add('mission', `${p.name} accomplished the mission: ${missionName(p.mission)}.`, seat);
    return true;
  }

  // ---------------------------------------------------------------- ending a turn
  canEndTurn(seat: number): boolean {
    return seat === this.turn
      && (this.phase === 'attack' || this.phase === 'move' || this.phase === 'regroup' || this.phase === 'card');
  }

  /** token_turno: end the turn (after checking the mission) and advance */
  endTurn(seat: number): boolean {
    if (!this.canEndTurn(seat)) return this.fail('It is not your turn to end.');
    this.pendingMove = null;
    if (this.checkMission(seat)) {
      this.endGame(seat);
      return true;
    }
    this.finishPlayerTurn(seat);
    return true;
  }

  private finishPlayerTurn(seat: number): void {
    const p = this.player(seat);
    p.conquered = 0;
    p.hasExchanged = false;
    for (let i = 0; i < COUNTRY_COUNT; i++) if (this.countries[i].owner === seat) this.countries[i].regrouped = 0;
    this.oldTurn = this.turn;
    const next = this.nextActive(this.turn);
    if (next === this.roundStarter) {
      // turno_initialize_new_round()
      this.roundStarter = this.nextActive(this.roundStarter);
      this.turn = this.roundStarter;
      this.round++;
      for (const q of this.players) {
        if (!q.active) continue;
        const conts = this.completeContinents(q.seat);
        for (let i = 0; i < CONTINENTS.length; i++) if (conts & (1 << i)) q.stats.continentsTurn[i]++;
        this.updateScore(q.seat);
      }
      this.phase = 'reinforce';
      this.add('round', `Round ${this.round}: ${this.player(this.turn).name} places the new armies.`, this.turn);
    } else {
      this.beginAttackRound(next);
    }
    this.version++;
  }

  // ---------------------------------------------------------------- leaving and the end
  /** token_surrender / a player who left the room */
  surrender(seat: number): boolean {
    const p = this.player(seat);
    if (!p.active) return this.fail('That player is not in the game.');
    const wasStarter = this.roundStarter === seat;
    const wasTurn = this.turn === seat;
    p.active = false;
    p.eliminated = true;
    this.playing--;
    if (wasStarter) this.roundStarter = this.nextActive(seat);
    this.add('lost', `${p.name} left the game.`, seat);
    if (this.phase === 'over') return true;
    if (this.playing < 2) {
      const winner = this.players.find((q) => q.active);
      if (winner) this.endGame(winner.seat);
      else { this.phase = 'over'; this.winner = null; this.version++; }
      return true;
    }
    if (wasTurn) {
      this.pendingMove = null;
      if (this.phase === 'place1' || this.phase === 'place2' || this.phase === 'reinforce') {
        const next = this.nextActive(seat);
        this.turn = next;
        if (!wasStarter && next === this.roundStarter) {
          if (this.phase === 'place1') {
            this.phase = 'place2';
            this.turn = this.roundStarter;
            this.add('place', `${this.player(this.turn).name} places the second armies.`, this.turn);
          } else {
            this.beginAttackRound(this.roundStarter);
          }
        } else {
          this.add('place', `${this.player(this.turn).name} places armies.`, this.turn);
        }
      } else {
        this.finishPlayerTurn(seat);
      }
    }
    this.version++;
    return true;
  }

  /** game_end(): the scores are final. The original's game_end() adds 350/round to the winner,
   *  but player_insert_scores() then calls stats_score(), which recomputes the score from the
   *  statistics and overwrites the bonus; the status sent to the players is sent after that. The
   *  bonus never reaches the high-score table, so the port does not add it either. */
  endGame(winner: number): void {
    if (this.phase === 'over') return;
    const p = this.player(winner);
    if (p.mission < 0) this.requestMission(winner);
    this.winner = winner;
    this.winnerMission = p.mission;
    this.phase = 'over';
    this.pendingMove = null;
    for (const q of this.players) this.updateScore(q.seat);
    this.add('win', `${p.name} won the game after round ${this.round}.`, winner);
    this.version++;
  }

  // ---------------------------------------------------------------- a server snapshot (online)
  /**
   * Applies the authoritative state of the online round. The local rules are not run in online
   * play: the module decides, and this view exists so the board, the cards and the menus can use the
   * same read-only queries as a local game.
   */
  applySnapshot(s: Snapshot): void {
    for (const pc of s.countries) {
      const c = this.countries[pc.id];
      if (!c) continue;
      c.owner = pc.owner;
      c.armies = pc.armies;
      c.regrouped = pc.regrouped;
      c.cardOwner = pc.cardOwner;
      c.cardUsed = pc.cardUsed;
    }
    for (const ps of s.players) {
      const p = this.players.find((q) => q.seat === ps.seat);
      if (!p) continue;
      p.name = ps.name;
      p.color = ps.color;
      p.active = ps.active;
      p.eliminated = ps.eliminated;
      p.mission = ps.mission;
      p.exchanges = ps.exchanges;
      p.hasExchanged = ps.hasExchanged;
      p.conquered = ps.conquered;
      p.score = ps.score;
      p.knownCountries = ps.countries === 0xffff ? -1 : ps.countries;
      p.knownArmies = ps.armies === 0xffff ? -1 : ps.armies;
      p.knownCards = ps.cards;
      p.human = true;
    }
    const ti = this.players.findIndex((p) => p.seat === s.turn);
    this.turn = ti >= 0 ? ti : 0;
    const ri = this.players.findIndex((p) => p.seat === s.roundStarter);
    this.roundStarter = ri >= 0 ? ri : 0;
    this.round = s.round;
    this.phase = s.phase;
    this.pendingMove = s.pending;
    const wi = this.players.findIndex((p) => p.seat === s.winner);
    this.winner = s.winner >= 0 && wi >= 0 ? wi : null;
    this.winnerMission = s.winnerMission;
    Object.assign(this.options, s.options);
    this.lastDice = s.event && (s.event.kind === 'dice' || s.event.kind === 'attack')
      && s.event.src >= 0 && s.event.dst >= 0
      ? { src: s.event.src, dst: s.event.dst, srcDice: s.event.srcDice, dstDice: s.event.dstDice, srcLost: 0, dstLost: 0 }
      : this.lastDice;
    if (s.event && s.event.seq > this.snapshotSeq) {
      this.snapshotSeq = s.event.seq;
      if (s.event.text) this.log.push({ kind: snapshotKind(s.event.kind), text: s.event.text, seat: s.event.seat });
      if (this.log.length > MAX_LOG) this.log.splice(0, this.log.length - MAX_LOG);
    }
    this.version++;
  }
  private snapshotSeq = 0;

  // ---------------------------------------------------------------- what the UI may do
  isOver(): boolean { return this.phase === 'over'; }
  currentMission(seat: number): string { return missionName(this.player(seat).mission); }
  /** fow_can_player_see_country(): your countries and their neighbours */
  canSee(seat: number, country: number): boolean {
    if (!this.options.fogOfWar) return true;
    if (this.countries[country].owner === seat) return true;
    for (const c of this.countriesOf(seat)) if (COUNTRIES[c].adj.includes(country)) return true;
    return false;
  }
  /** the player numbers of the players who still play, for the status line */
  activeSeats(): number[] { return this.players.filter((p) => p.active).map((p) => p.seat); }
}
