// PokerTH 1.1.2: src/engine/local_engine/localboard.cpp, translated line by line.
// AGPL-3.0-or-later, see ../../LICENSE.md.
import { EngineError, MAX_NUMBER_OF_PLAYERS, PLAYER_ACTION_FOLD } from './defs.ts';
import type { LocalPlayer } from './player.ts';

/** std::list<unsigned>::sort() then unique() */
function sortUnique(a: number[]): number[] {
  const s = [...a].sort((x, y) => x - y);
  return s.filter((v, i) => i === 0 || v !== s[i - 1]);
}

export class LocalBoard {
  seatsList: LocalPlayer[] = [];
  activePlayerList: LocalPlayer[] = [];
  runningPlayerList: LocalPlayer[] = [];
  myCards = [0, 0, 0, 0, 0];
  pot = 0;
  sets = 0;
  allInCondition = false;
  lastActionPlayerID = 0;
  winners: number[] = [];
  playerNeedToShowCards: number[] = [];

  setPlayerLists(sl: LocalPlayer[], apl: LocalPlayer[], rpl: LocalPlayer[]): void {
    this.seatsList = sl;
    this.activePlayerList = apl;
    this.runningPlayerList = rpl;
  }

  setMyCards(c: ArrayLike<number>): void {
    for (let i = 0; i < 5; i++) this.myCards[i] = c[i];
  }
  getMyCards(out: number[]): void {
    for (let i = 0; i < 5; i++) out[i] = this.myCards[i];
  }
  getPot(): number { return this.pot; }
  setPot(v: number): void { this.pot = v; }
  getSets(): number { return this.sets; }
  setAllInCondition(v: boolean): void { this.allInCondition = v; }
  setLastActionPlayerID(v: number): void { this.lastActionPlayerID = v; }
  getWinners(): number[] { return this.winners; }
  getPlayerNeedToShowCards(): number[] { return this.playerNeedToShowCards; }

  collectSets(): void {
    this.sets = 0;
    for (const p of this.seatsList) this.sets += p.getMySet();
  }

  collectPot(): void {
    this.pot += this.sets;
    this.sets = 0;
    for (const p of this.seatsList) p.setMySetNull();
  }

  distributePot(dealerPosition: number): void {
    this.winners = [];
    let i: number, j: number, k: number, l: number;

    // filling player sets vector
    const playerSets: number[] = [];
    for (const p of this.seatsList) {
      if (p.getMyActiveStatus()) playerSets.push(p.getMyRoundStartCash() - p.getMyCash());
      else playerSets.push(0);
      p.setLastMoneyWon(0);
    }
    // sort player sets asc
    let playerSetsSort = [...playerSets].sort((a, b) => a - b);
    // potLevel[0] = amount, potLevel[1] = sum, potLevel[2..n] = winner
    let potLevel: number[] = [];
    let highestCardsValue: number;
    let winnerCount: number;
    let finalPot: boolean;
    let potCarryOver = 0;
    let mod: number;
    let winnerHit: boolean;
    const seats = this.seatsList;

    // level loop
    for (i = 0; i < playerSetsSort.length; i++) {
      highestCardsValue = 0;
      if (playerSetsSort[i] > 0) {
        potLevel.push(playerSetsSort[i]);
        potLevel.push((playerSetsSort.length - i) * potLevel[0] + potCarryOver);
        // determine level highestCardsValue
        for (j = 0; j < seats.length; j++) {
          const p = seats[j];
          if (p.getMyActiveStatus() && p.getMyCardsValueInt() > highestCardsValue && p.getMyAction() !== PLAYER_ACTION_FOLD && playerSets[j] >= potLevel[0]) {
            highestCardsValue = p.getMyCardsValueInt();
          }
        }
        // level winners
        for (j = 0; j < seats.length; j++) {
          const p = seats[j];
          if (p.getMyActiveStatus() && highestCardsValue === p.getMyCardsValueInt() && p.getMyAction() !== PLAYER_ACTION_FOLD && playerSets[j] >= potLevel[0]) {
            potLevel.push(p.getMyUniqueID());
          }
        }
        winnerCount = potLevel.length - 2;
        if (!winnerCount) throw new EngineError('ERR_NO_WINNER');

        // check if this is the final pot level for at least one winner
        finalPot = false;
        for (j = 2; j < potLevel.length; j++) {
          for (k = 0; k < seats.length; k++) {
            if (seats[k].getMyUniqueID() === potLevel[j] && potLevel[0] === playerSets[k]) {
              finalPot = true;
              break;
            }
          }
          if (finalPot) break;
        }

        if (finalPot) {
          mod = potLevel[1] % winnerCount;
          const share = Math.floor(potLevel[1] / winnerCount);
          if (mod === 0) {
            for (j = 2; j < potLevel.length; j++) {
              const p = seats.find((s) => s.getMyUniqueID() === potLevel[j]);
              if (!p) throw new EngineError('ERR_SEAT_NOT_FOUND');
              p.setMyCash(p.getMyCash() + share);
              this.winners.push(p.getMyUniqueID());
              p.setLastMoneyWon(p.getLastMoneyWon() + share);
            }
          } else {
            // pot level sum not divisible by winnerCount --> distribution after smallBlind
            let it = seats.findIndex((s) => s.getMyUniqueID() === dealerPosition);
            if (it < 0) throw new EngineError('ERR_SEAT_NOT_FOUND');
            for (j = 0; j < winnerCount; j++) {
              winnerHit = false;
              for (k = 0; k < MAX_NUMBER_OF_PLAYERS && !winnerHit; k++) {
                it++;
                if (it === seats.length) it = 0;
                for (l = 2; l < potLevel.length; l++) {
                  if (seats[it].getMyActiveStatus() && seats[it].getMyUniqueID() === potLevel[l]) winnerHit = true;
                }
              }
              const p = seats[it];
              if (j < mod) {
                p.setMyCash(p.getMyCash() + share + 1);
                this.winners.push(p.getMyUniqueID());
                p.setLastMoneyWon(p.getLastMoneyWon() + share + 1);
              } else {
                p.setMyCash(p.getMyCash() + share);
                this.winners.push(p.getMyUniqueID());
                p.setLastMoneyWon(p.getLastMoneyWon() + share);
              }
            }
          }
          potCarryOver = 0;
          this.pot -= potLevel[1];
        } else {
          potCarryOver = potLevel[1];
        }

        // reevaluate the player sets
        for (j = 0; j < playerSets.length; j++) {
          if (playerSets[j] > 0) playerSets[j] -= potLevel[0];
        }
        playerSetsSort = [...playerSets].sort((a, b) => a - b);
        potLevel = [];
      }
    }
    this.winners = sortUnique(this.winners);
    if (this.pot !== 0) console.error(`localboard.cpp: distributePot-ERROR: Pot = ${this.pot}`);
  }

  determinePlayerNeedToShowCards(): void {
    this.playerNeedToShowCards = [];
    const apl = this.activePlayerList;
    if (this.allInCondition) {
      // in All In Condition everybody have to show the cards
      for (const p of apl) {
        if (p.getMyAction() !== PLAYER_ACTION_FOLD) this.playerNeedToShowCards.push(p.getMyUniqueID());
      }
    } else {
      // all winners have to show their cards
      const level: [number, number][] = [];
      let lastActionPlayerIt = -1;
      let it_c: number;
      for (it_c = 0; it_c < apl.length; it_c++) {
        if (apl[it_c].getMyUniqueID() === this.lastActionPlayerID && apl[it_c].getMyAction() !== PLAYER_ACTION_FOLD) {
          lastActionPlayerIt = it_c;
          break;
        }
      }
      if (it_c === apl.length) {
        for (it_c = 0; it_c < apl.length; it_c++) {
          if (apl[it_c].getMyAction() !== PLAYER_ACTION_FOLD) {
            lastActionPlayerIt = it_c;
            break;
          }
        }
      }
      const first = apl[lastActionPlayerIt];
      // the player who has done the last action has to show his cards first
      this.playerNeedToShowCards.push(first.getMyUniqueID());
      level.push([first.getMyCardsValueInt(), first.getMyRoundStartCash() - first.getMyCash()]);

      it_c = lastActionPlayerIt + 1;
      for (let i = 0; i < apl.length; i++) {
        if (it_c === apl.length) it_c = 0;
        const p = apl[it_c];
        if (p.getMyAction() !== PLAYER_ACTION_FOLD) {
          const bet = p.getMyRoundStartCash() - p.getMyCash();
          for (let li = 0; li < level.length; li++) {
            if (p.getMyCardsValueInt() > level[li][0]) {
              if (li + 1 === level.length) {
                this.playerNeedToShowCards.push(p.getMyUniqueID());
                level.push([p.getMyCardsValueInt(), bet]);
                break;
              }
            } else {
              if (p.getMyCardsValueInt() === level[li][0]) {
                if (li + 1 === level.length || bet > level[li + 1][1]) {
                  this.playerNeedToShowCards.push(p.getMyUniqueID());
                  if (bet > level[li][1]) level[li][1] = bet;
                }
                break;
              } else {
                if (bet > level[li][1]) {
                  this.playerNeedToShowCards.push(p.getMyUniqueID());
                  level.splice(li, 0, [p.getMyCardsValueInt(), bet]);
                  break;
                }
              }
            }
          }
        }
        it_c++;
      }
    }
    this.playerNeedToShowCards = sortUnique(this.playerNeedToShowCards);
  }
}
