// The robot of TEG 0.13.0, translated from robot/ai.cpp and robot/ai_fichas.cpp. It uses the same
// scores, the same tie-breaking (the first maximum), the same random dice for hopeless attacks and
// the same order of countries, so a game with the same seed and the same state makes the same moves.
import { CONTINENTS, COUNTRIES, COUNTRY_COUNT } from './data.ts';
import type { TegGame } from './engine.ts';

export class Robot {
  readonly game: TegGame;
  readonly seat: number;
  private readonly puntaje = new Int32Array(COUNTRY_COUNT);
  private readonly sorted = new Int32Array(COUNTRY_COUNT * 10);
  private readonly attackDst = new Int32Array(COUNTRY_COUNT).fill(-1);
  /** the turn this robot is currently playing (round:turn), to reset the per-turn plan */
  private plan = '';
  private didRegroup = false;

  constructor(game: TegGame, seat: number) {
    this.game = game;
    this.seat = seat;
  }

  // ---------------------------------------------------------------- the original's score helpers
  private clean(): void {
    for (let i = 0; i < COUNTRY_COUNT; i++) this.puntaje[i] = -10000;
  }

  /** ai_many_country_enemigo(): enemy neighbours of p */
  private manyEnemy(p: number): number {
    let n = 0;
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (this.game.countries[i].owner !== this.seat && COUNTRIES[p].adj.includes(i)) n++;
    }
    return n;
  }

  /** ai_is_country_border(): p has a neighbour on another continent */
  private isBorder(p: number): boolean {
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (COUNTRIES[i].adj.includes(p) && COUNTRIES[i].continent !== COUNTRIES[p].continent) return true;
    }
    return false;
  }

  /** ai_own_continent() */
  private ownContinent(cont: number): boolean {
    let n = 0;
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (this.game.countries[i].owner === this.seat && COUNTRIES[i].continent === cont) n++;
    }
    return n === CONTINENTS[cont].countries;
  }

  /** ai_is_country_peligroso(): the owner of dst has not played yet and could hit src back */
  private dangerous(src: number, dst: number): boolean {
    let sawStarter = false;
    let dstPlayed = false;
    const starterSeat = this.game.players[this.game.roundStarter].seat;
    for (const p of this.game.players) {
      if (p.seat === starterSeat) sawStarter = true;
      if (p.seat === this.game.countries[dst].owner) {
        dstPlayed = sawStarter;
        break;
      }
    }
    if (dstPlayed) return false;
    const tmp = this.game.countries[src].armies > 3 ? 3 : this.game.countries[src].armies - 1;
    return this.game.countries[dst].armies > this.game.countries[src].armies - tmp;
  }

  /** ai_puntaje_atacar_warning() */
  private attackWarning(src: number): number {
    let p = 0;
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (COUNTRIES[src].adj.includes(i) && this.game.countries[src].owner !== this.game.countries[i].owner
          && this.dangerous(src, i)) {
        p += this.game.countries[i].armies - this.game.countries[src].armies;
      }
    }
    return -(5 + 2 * p);
  }

  /** ai_puntaje_atacar_country() */
  private attackCountry(src: number, dst: number): number {
    let p = 0;
    if (this.game.countries[src].armies > this.game.countries[dst].armies) {
      if (COUNTRIES[src].continent === COUNTRIES[dst].continent) p++;
      p += 10 + this.game.countries[src].armies - this.game.countries[dst].armies;
    } else {
      const r = this.game.rng.between(1, 10);
      if (r > 7 && this.game.countries[src].armies > 7) p++;
    }
    return p;
  }

  /** ai_puntaje_atacar() */
  private scoreAttack(country: number): void {
    let p = 0;
    let dst = -1;
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (COUNTRIES[country].adj.includes(i) && this.game.countries[i].owner !== this.seat) {
        let tmp = this.attackCountry(country, i);
        tmp += this.attackWarning(country);
        if (tmp > p) {
          p = tmp;
          dst = i;
        }
      }
    }
    if (dst >= 0) {
      this.puntaje[country] = p;
      this.attackDst[country] = dst;
    }
  }

  /** ai_puntaje_atacar_country() as ai_fichas_calc_puntaje_conquer() uses the continent counts */
  private calcConquer(country: number): void {
    if (this.ownContinent(COUNTRIES[country].continent)) return;
    const pc = CONTINENTS[COUNTRIES[country].continent].countries;
    let pe = 0, ee = 0, pm = 0, em = 0, ple = 0;
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (COUNTRIES[country].continent !== COUNTRIES[i].continent) continue;
      if (this.game.countries[i].owner === this.seat) {
        pm++;
        em += this.game.countries[i].armies;
      } else {
        pe++;
        ee += this.game.countries[i].armies;
        if (COUNTRIES[country].adj.includes(i)) ple++;
      }
    }
    if (pc !== pm) {
      if (pc >= 12) {
        if (pm >= 10) this.puntaje[country] += 1;
        if (pm >= 11) this.puntaje[country] += 2;
        if (pm >= 12) this.puntaje[country] += 7;
        if (pm < 7) this.puntaje[country] -= 5;
      } else if (pc >= 8) {
        if (pm >= 5) this.puntaje[country] += 1;
        if (pm >= 7) this.puntaje[country] += 2;
        if (pm >= 8) this.puntaje[country] += 7;
      } else if (pc >= 6) {
        if (pm >= 4) this.puntaje[country] += 2;
        if (pm >= 5) this.puntaje[country] += 7;
      }
      if (pc >= 4) {
        if (pm >= 2) this.puntaje[country] += 2;
        if (pm >= 3) this.puntaje[country] += 3;
      }
      this.puntaje[country] += ple;
      if (em > ee) this.puntaje[country] += 3;
      if (ple === 0) this.puntaje[country] -= 50;
    }
  }

  /** ai_fichas_calc_puntaje_defense() */
  private calcDefense(country: number): void {
    const c = COUNTRIES[country].continent;
    if (!this.ownContinent(c)) return;
    let suma = 0;
    let f = 0;
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (COUNTRIES[i].adj.includes(country) && COUNTRIES[i].continent !== c) {
        if (this.game.countries[i].owner !== this.seat) {
          suma += 5;
          if (this.game.countries[i].armies > this.game.countries[country].armies) suma += 6;
        } else {
          suma += 1;
        }
        if (this.game.countries[country].armies < 4) suma += 3;
        f++;
      }
    }
    if (f === 0) this.puntaje[country] -= 50;
    this.puntaje[country] += suma + Math.floor(f / 2);
  }

  /** ai_fichas_calc_puntaje_fichas() */
  private calcFichas(country: number): void {
    let p1 = 0, p2 = 0, suma = 0;
    const cant = CONTINENTS[COUNTRIES[country].continent].countries;
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (this.game.countries[i].owner !== this.seat && COUNTRIES[i].adj.includes(country)) {
        suma += 3;
        if (this.game.countries[country].armies >= this.game.countries[i].armies) {
          p2 += 2 + this.game.countries[country].armies - this.game.countries[i].armies;
        } else {
          p1 += this.game.countries[i].armies - this.game.countries[country].armies;
        }
      }
    }
    if (suma === 0) return;
    suma += Math.floor(p1 / 2) + Math.floor(p2 / 2);
    if (cant >= 12) suma -= 1;
    else if (cant >= 8) suma += 1;
    else if (cant >= 6) suma += 3;
    if (cant >= 4) suma += 3;
    this.puntaje[country] += suma;
  }

  private calcPuntaje(country: number): void {
    this.calcConquer(country);
    this.calcFichas(country);
    this.calcDefense(country);
  }

  /** ai_puntaje_sort(): the first `cant` picks, each pick lowering the score by 2 */
  private sort(cant: number): boolean {
    if (cant > COUNTRY_COUNT * 10) return false;
    for (let j = 0; j < cant; j++) {
      let max = 0;
      for (let i = 0; i < COUNTRY_COUNT; i++) if (this.puntaje[i] > this.puntaje[max]) max = i;
      this.sorted[j] = max;
      this.puntaje[max] -= 2;
    }
    return true;
  }

  /** ai_fichas_helper(): place `cant` armies by the all-round score */
  private fichasHelper(counts: Map<number, number>, cant: number): boolean {
    this.clean();
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (this.game.countries[i].owner === this.seat) {
        this.puntaje[i] = 0;
        this.calcPuntaje(i);
      }
    }
    if (!this.sort(cant)) return false;
    for (let i = 0; i < cant; i++) {
      const c = this.sorted[i];
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return true;
  }

  /** ai_fichas_en_cont(): the continent's bonus armies on its best defended countries */
  private fichasInContinent(counts: Map<number, number>, cont: number, cant: number): void {
    this.clean();
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (COUNTRIES[i].continent === cont) {
        this.puntaje[i] = 0;
        this.calcDefense(i);
      }
    }
    if (!this.sort(cant)) return;
    for (let i = 0; i < cant; i++) {
      const c = this.sorted[i];
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
  }

  /** ai_fichas(): initial placement */
  private fichas(cant: number): boolean {
    const counts = new Map<number, number>();
    if (!this.fichasHelper(counts, cant)) return false;
    return this.game.place(this.seat, counts);
  }

  /** ai_fichasc(): continent bonuses and the regular armies */
  private fichasc(): boolean {
    const seat = this.seat;
    // ai_puedocanje(): exchange the first possible set before placing
    if (this.game.canExchange(seat)) {
      const set = this.game.findExchange(seat);
      if (set) this.game.exchange(seat, set[0], set[1], set[2]);
    }
    const r = this.game.reinforcement(seat);
    const counts = new Map<number, number>();
    for (let c = 0; c < CONTINENTS.length; c++) {
      if (r.conts & (1 << c)) this.fichasInContinent(counts, c, CONTINENTS[c].bonus);
    }
    if (!this.fichasHelper(counts, r.base + r.exchange)) return false;
    return this.game.place(seat, counts);
  }

  // ---------------------------------------------------------------- the turn
  /** ai_turno(): one attack, or false when there is none worth making */
  private turno(): boolean {
    this.clean();
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (this.game.countries[i].owner === this.seat && this.game.countries[i].armies > 1) this.scoreAttack(i);
    }
    let max = 0;
    for (let i = 0; i < COUNTRY_COUNT; i++) if (this.puntaje[i] > this.puntaje[max]) max = i;
    this.sorted[0] = max;
    const src = this.sorted[0];
    const dst = this.attackDst[src];
    if (this.puntaje[src] > 0 && dst >= 0) {
      this.game.attack(this.seat, src, dst);
      return true;
    }
    return false;
  }

  /** ai_reagrupe(): move armies from safe countries to frontiers */
  private reagrupe(): void {
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (this.game.countries[i].owner !== this.seat) continue;
      if (this.manyEnemy(i) !== 0) continue;
      const p = this.game.countries[i].armies - this.game.countries[i].regrouped;
      if (p < 2) continue;
      this.reagrupeOne(i, p - 1);
    }
  }

  /** __ai_reagrupe() */
  private reagrupeOne(p: number, cant: number): boolean {
    const own = this.ownContinent(COUNTRIES[p].continent);
    if (own) {
      let newCant = cant;
      for (let i = 0; i < COUNTRY_COUNT; i++) {
        if (this.game.countries[i].owner !== this.seat && COUNTRIES[i].adj.includes(p)
            && this.game.countries[i].armies > this.game.countries[p].armies) {
          return this.game.regroup(this.seat, p, i, cant);
        }
      }
      if (this.game.countries[p].armies - this.game.countries[p].regrouped - cant < 3) newCant -= 2;
      for (let i = 0; i < COUNTRY_COUNT && newCant > 0; i++) {
        if (this.game.countries[i].owner === this.seat && COUNTRIES[i].adj.includes(p)
            && COUNTRIES[i].continent !== COUNTRIES[p].continent) {
          return this.game.regroup(this.seat, p, i, newCant);
        }
      }
    }
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (this.game.countries[i].owner === this.seat && COUNTRIES[i].adj.includes(p)
          && COUNTRIES[i].continent === COUNTRIES[p].continent && this.isBorder(i)) {
        return this.game.regroup(this.seat, p, i, cant);
      }
    }
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      if (this.game.countries[i].owner === this.seat && COUNTRIES[i].adj.includes(p)
          && COUNTRIES[i].continent === COUNTRIES[p].continent) {
        return this.game.regroup(this.seat, p, i, cant);
      }
    }
    return false;
  }

  /** ai_tropas(): how many armies to move into a conquered country */
  private tropas(src: number, dst: number, max: number): void {
    this.clean();
    this.calcPuntaje(src);
    this.calcPuntaje(dst);
    let c = 0;
    for (let i = 0; i < max; i++) if (this.puntaje[dst] > this.puntaje[src] + i) c++;
    this.game.moveAfterConquest(this.seat, c);
  }

  // ---------------------------------------------------------------- one step of the robot
  /**
   * Performs one action for this robot if it is its turn. Returns a short description (for the UI
   * log) or null when the robot has nothing to do right now. The caller repeats it (with a delay
   * for the player to watch) until it returns null.
   */
  step(): string | null {
    const g = this.game;
    if (g.phase === 'over' || !g.player(this.seat).active) return null;
    if (g.turn !== this.seat) return null;
    const key = `${g.round}:${g.turn}`;
    if (key !== this.plan) {
      this.plan = key;
      this.didRegroup = false;
    }
    switch (g.phase) {
      case 'place1':
      case 'place2':
        return this.fichas(g.requiredArmies(this.seat)) ? 'placed armies' : null;
      case 'reinforce':
        return this.fichasc() ? 'placed reinforcements' : null;
      case 'move': {
        const m = g.pendingMove;
        if (!m) return null;
        this.tropas(m.src, m.dst, m.max);
        return 'moved armies into the conquered country';
      }
      case 'attack':
        if (this.turno()) return 'attacked';
        if (!this.didRegroup) {
          this.didRegroup = true;
          this.reagrupe();
          return 'regrouped armies';
        }
        if (g.canDrawCard(this.seat)) {
          g.drawCard(this.seat);
          return 'took a card';
        }
        g.endTurn(this.seat);
        return 'ended the turn';
      case 'regroup':
        if (g.canDrawCard(this.seat)) {
          g.drawCard(this.seat);
          return 'took a card';
        }
        g.endTurn(this.seat);
        return 'ended the turn';
      case 'card':
        for (const c of g.cardsOf(this.seat)) {
          if (!g.countries[c].cardUsed && g.countries[c].owner === this.seat) g.useCard(this.seat, c);
        }
        g.endTurn(this.seat);
        return 'used its cards and ended the turn';
      default:
        return null;
    }
  }
}
