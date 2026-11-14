// PokerTH 1.1.2: LocalPlayer::turnEngine of src/engine/local_engine/localplayer.cpp, translated line by line
// (without the DEBUG_MODE blocks and commented-out code). AGPL-3.0-or-later, see ../../../LICENSE.md.
import {
  PLAYER_ACTION_BET, PLAYER_ACTION_CALL, PLAYER_ACTION_CHECK, PLAYER_ACTION_FOLD, PLAYER_ACTION_RAISE, PLAYER_TYPE_HUMAN, idiv,
} from '../defs.ts';
import type { LocalPlayer } from '../player.ts';

export function turnEngine(p: LocalPlayer): void {
  const h = p.hand();
  const bero = h.getCurrentBeRo();
  let raise = 0;
  let bet = 0;
  let rand: number;
  let pBluff: number;

  p.calcMyOdds();

  // Niveaus setzen + Dude (the number of opponents is commented out in the original)
  p.myNiveau[0] = 53 + p.myDude4;
  p.myNiveau[1] = 56 + p.myDude4;
  p.myNiveau[2] = 69 + p.myDude4;

  // Aggressivität des humanPlayers auslesen
  let countHumanPlayers = 0;
  for (const q of h.getActivePlayerList()) {
    if (q.getMyType() === PLAYER_TYPE_HUMAN) countHumanPlayers++;
  }
  if (countHumanPlayers) {
    if (countHumanPlayers === 1) {
      for (const q of h.getActivePlayerList()) {
        if (q.getMyType() === PLAYER_TYPE_HUMAN && q.getMyAction() !== PLAYER_ACTION_FOLD) {
          // double arithmetic: getMyAggressive()*1.0/7.0 - 1.0/size()
          const aggValue = Math.trunc(((q.getMyAggressive() * 1.0) / 7.0 - 1.0 / h.getActivePlayerList().length) * 21.0);
          p.myNiveau[0] -= aggValue;
          p.myNiveau[1] -= aggValue;
          p.myNiveau[2] -= aggValue;
        }
      }
    } else {
      p.myNiveau[0] -= 3;
      p.myNiveau[1] -= 3;
      p.myNiveau[2] -= 3;
    }
  }

  // eigenes mögliches highestSet
  let individualHighestSet = bero.getHighestSet();
  if (individualHighestSet > p.myCash) individualHighestSet = p.myCash;

  // Check-Bluff generieren
  const cBluff = p.rng.getRand(1, 100);

  // aktive oder passive Situation ? -> im Flop nur passiv oder aktiv
  if (bero.getHighestSet() > 0) {
    // Verhaeltnis Cash zu Einsatz
    if (idiv(p.myCash, individualHighestSet) >= 25) {
      p.myNiveau[0] += idiv(25 - idiv(p.myCash, individualHighestSet), 10);
    } else {
      p.myNiveau[0] += idiv(25 - idiv(p.myCash, individualHighestSet), 2);
    }
    if (idiv(p.myCash, individualHighestSet) < 11) {
      p.myNiveau[2] += idiv(21 - idiv(p.myCash, individualHighestSet), 2);
    }

    // raise (bei hohem Niveau)
    if (p.myOdds >= p.myNiveau[2]) {
      // raise-Betrag ermitteln
      if (bero.getHighestSet() >= 12 * h.getSmallBlind()) {
        if (p.myOdds >= p.myNiveau[2] + 15) {
          raise = p.myCash;
          p.myAction = PLAYER_ACTION_RAISE;
        } else {
          if (p.myCash - bero.getHighestSet() <= idiv(p.myCash * 1, 5)) {
            raise = p.myCash;
            p.myAction = PLAYER_ACTION_RAISE;
          } else {
            p.myAction = PLAYER_ACTION_CALL;
          }
        }
      } else {
        raise = idiv(Math.trunc(p.myOdds) - p.myNiveau[2], 4) * 2 * h.getSmallBlind();
        // raise-Betrag zu klein -> mindestens Standard-raise
        if (idiv(p.myCash, 2 * h.getSmallBlind()) <= 6 || raise >= (p.myCash * 4.0) / 5.0) {
          raise = p.myCash;
        }
        p.myAction = PLAYER_ACTION_RAISE;
      }

      // auf cBluff testen --> call statt raise
      if (cBluff > 90) p.myAction = PLAYER_ACTION_CALL;
      if (cBluff > 80 && p.myOdds >= p.myNiveau[2] + 5) p.myAction = PLAYER_ACTION_CALL;
      if (cBluff > 70 && p.myOdds >= p.myNiveau[2] + 10) p.myAction = PLAYER_ACTION_CALL;
      if (cBluff > 60 && p.myOdds >= p.myNiveau[2] + 15) p.myAction = PLAYER_ACTION_CALL;
    } else {
      // call -> wenn hoher Einsatz bereits, call bei niedrigerem Niveau
      // (myNiveau[0]-3 is an int used as a bool: true unless it is 0)
      if (p.myOdds >= p.myNiveau[0] || (p.mySet >= idiv(bero.getHighestSet(), 2) && p.myOdds >= p.myNiveau[0] - 5) ||
        (p.myRoundStartCash - p.myCash > individualHighestSet && p.myNiveau[0] - 3 !== 0)) {
        // all in bei knappem Cash
        if (bero.getHighestSet() > (p.myCash * 3.0) / 4.0) {
          raise = p.myCash;
          p.myAction = PLAYER_ACTION_RAISE;
        } else p.myAction = PLAYER_ACTION_CALL;
      } else {
        // fold
        p.myAction = PLAYER_ACTION_FOLD;
      }
    }
  } else {
    // aktive Situation
    // bet
    if (p.myOdds >= p.myNiveau[1]) {
      // bet-Betrag ermitteln
      bet = idiv(Math.trunc(p.myOdds) - p.myNiveau[1], 6) * 2 * h.getSmallBlind();
      // bet-Betrag zu klein -> mindestens Standard-bet
      if (bet === 0) {
        bet = 2 * h.getSmallBlind();
      }
      // all in bei nur wenigen Chips
      if (idiv(p.myCash, 2 * h.getSmallBlind()) <= 6) {
        bet = p.myCash;
      }
      // all in bei knappem Cash
      if (bet > (p.myCash * 4.0) / 5.0) {
        bet = p.myCash;
      }
      p.myAction = PLAYER_ACTION_BET;

      // auf cBluff testen --> check statt bet (the original compares with myNiveau[2] here)
      if (cBluff > 90) p.myAction = PLAYER_ACTION_CHECK;
      if (cBluff > 80 && p.myOdds >= p.myNiveau[2] + 5) p.myAction = PLAYER_ACTION_CHECK;
      if (cBluff > 70 && p.myOdds >= p.myNiveau[2] + 10) p.myAction = PLAYER_ACTION_CHECK;
      if (cBluff > 60 && p.myOdds >= p.myNiveau[2] + 15) p.myAction = PLAYER_ACTION_CHECK;
    } else {
      // check
      p.myAction = PLAYER_ACTION_CHECK;
      // Position-Bluff generieren (als Dealer)
      if (p.myButton === 1) {
        pBluff = p.rng.getRand(1, 100);
        if (pBluff <= 16) {
          bet = idiv(pBluff, 4) * 2 * h.getSmallBlind();
          if (bet === 0) {
            bet = 2 * h.getSmallBlind();
          }
          if (idiv(p.myCash, 2 * h.getSmallBlind()) <= 6) {
            bet = p.myCash;
          }
          if (bet > (p.myCash * 4.0) / 5.0) {
            bet = p.myCash;
          }
          p.myAction = PLAYER_ACTION_BET;
        }
      }
    }
  }

  // sBluffStatus aktivieren
  if (bero.getHighestSet() > 0) {
    if (p.sBluffStatus && p.myOdds < p.myNiveau[2]) {
      // genügend Chips, um Bluff anzunehmen
      if (bero.getHighestSet() >= 4 * h.getSmallBlind()) {
        p.myAction = PLAYER_ACTION_CALL;
      } else {
        rand = p.rng.getRand(1, 8);
        raise = rand * h.getSmallBlind();
        if (idiv(p.myCash, 2 * h.getSmallBlind()) <= 6 || raise >= idiv(p.myCash * 4, 5)) {
          raise = p.myCash;
        }
        p.myAction = PLAYER_ACTION_RAISE;
      }
      if (bero.getHighestSet() >= 10 * h.getSmallBlind()) {
        p.myAction = PLAYER_ACTION_FOLD;
      }
    }
  } else {
    if (p.sBluffStatus && p.myOdds < p.myNiveau[1]) {
      rand = p.rng.getRand(1, 8);
      bet = rand * h.getSmallBlind();
      if (bet < 2 * h.getSmallBlind()) {
        bet = 2 * h.getSmallBlind();
      }
      if (idiv(p.myCash, 2 * h.getSmallBlind()) <= 6) {
        bet = p.myCash;
      }
      if (bet > (p.myCash * 4.0) / 5.0) {
        bet = p.myCash;
      }
      p.myAction = PLAYER_ACTION_BET;
    }
  }

  p.evaluation(bet, raise);
}
