// PokerTH 1.1.2: LocalPlayer::preflopEngine of src/engine/local_engine/localplayer.cpp, translated line by
// line (without the DEBUG_MODE block). AGPL-3.0-or-later, see ../../../LICENSE.md.
import {
  PLAYER_ACTION_CALL, PLAYER_ACTION_CHECK, PLAYER_ACTION_FOLD, PLAYER_ACTION_RAISE, PLAYER_TYPE_HUMAN, idiv,
} from '../defs.ts';
import type { LocalPlayer } from '../player.ts';

export function preflopEngine(p: LocalPlayer): void {
  const h = p.hand();
  const bero = h.getCurrentBeRo();
  const bet = 0;
  let raise = 0;
  const apl = h.getActivePlayerList();

  let players = apl.length;
  if (players > 5) players = 5;

  // myOdds ermitteln
  p.calcMyOdds();

  // Niveaus setzen + Dude + Anzahl Gegenspieler
  // 1. Fold -- Call
  p.myNiveau[0] = 43 + p.myDude4 - 6 * (players - 2);
  // 3. Call -- Raise
  p.myNiveau[2] = 54 + p.myDude4 - 7 * (players - 2);

  // eigenes mögliches highestSet
  let individualHighestSet = bero.getHighestSet();
  if (individualHighestSet > p.myCash) individualHighestSet = p.myCash;

  // Verhaeltnis Cash zu Höhe des zu setzenden Betrags
  if (idiv(p.myCash, individualHighestSet) >= 25) {
    p.myNiveau[0] += idiv(25 - idiv(p.myCash, individualHighestSet), 10);
  } else {
    p.myNiveau[0] += idiv(25 - idiv(p.myCash, individualHighestSet), 3);
  }
  if (idiv(p.myCash, individualHighestSet) < 11) {
    p.myNiveau[2] += idiv(21 - idiv(p.myCash, individualHighestSet), 2);
  }

  // Aggressivität des humanPlayers auslesen
  let countHumanPlayers = 0;
  for (const q of apl) if (q.getMyType() === PLAYER_TYPE_HUMAN) countHumanPlayers++;
  if (countHumanPlayers) {
    if (countHumanPlayers === 1) {
      for (const q of apl) {
        if (q.getMyType() === PLAYER_TYPE_HUMAN && q.getMyAction() !== PLAYER_ACTION_FOLD) {
          const aggValue = Math.trunc(((q.getMyAggressive() * 1.0) / 7.0 - 1.0 / apl.length) * 21.0);
          p.myNiveau[0] -= aggValue;
          p.myNiveau[2] -= aggValue;
        }
      }
    } else {
      p.myNiveau[0] -= 3;
      p.myNiveau[2] -= 3;
    }
  }

  // Check-Bluff generieren
  const cBluff = p.rng.getRand(1, 100);

  // Prüfung, ob Raise sinnvoll
  if (p.myOdds >= p.myNiveau[2]) {
    // bestimmte Hände
    if (bero.getHighestSet() >= 12 * h.getSmallBlind()) {
      if (p.myOdds >= p.myNiveau[2] + 8) {
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
      raise = idiv(Math.trunc(p.myOdds) - p.myNiveau[2], 2) * 2 * h.getSmallBlind();
      if (idiv(p.myCash, 2 * h.getSmallBlind()) <= 6 || raise >= idiv(p.myCash * 4, 5)) {
        raise = p.myCash;
      }
      p.myAction = PLAYER_ACTION_RAISE;
    }

    // Check-Bluff
    if (cBluff > 90) {
      p.myAction = PLAYER_ACTION_CALL;
      if (p.myButton === 3 && p.mySet === bero.getHighestSet()) p.myAction = PLAYER_ACTION_CHECK;
    }
    if (cBluff > 80 && p.myOdds >= p.myNiveau[2] + 4) {
      p.myAction = PLAYER_ACTION_CALL;
      if (p.myButton === 3 && p.mySet === bero.getHighestSet()) p.myAction = PLAYER_ACTION_CHECK;
    }
    if (cBluff > 70 && p.myOdds >= p.myNiveau[2] + 8) {
      p.myAction = PLAYER_ACTION_CALL;
      if (p.myButton === 3 && p.mySet === bero.getHighestSet()) p.myAction = PLAYER_ACTION_CHECK;
    }
    if (cBluff > 60 && p.myOdds >= p.myNiveau[2] + 12) {
      p.myAction = PLAYER_ACTION_CALL;
      if (p.myButton === 3 && p.mySet === bero.getHighestSet()) p.myAction = PLAYER_ACTION_CHECK;
    }
  } else {
    // Prüfung, ob Call sinnvoll
    if (p.myOdds >= p.myNiveau[0] || (p.mySet >= idiv(bero.getHighestSet(), 2) && p.myOdds >= p.myNiveau[0] - 8)) {
      if (p.myButton === 3 && p.mySet === bero.getHighestSet()) {
        p.myAction = PLAYER_ACTION_CHECK;
      } else {
        // all in bei knappem eigenen Geld
        if (p.myCash - bero.getHighestSet() <= idiv(p.myCash * 1, 5)) {
          raise = p.myCash;
          p.myAction = PLAYER_ACTION_RAISE;
        } else {
          p.myAction = PLAYER_ACTION_CALL;
        }
      }
    } else {
      // Fold bzw. Check
      if (p.myButton === 3 && p.mySet === bero.getHighestSet()) p.myAction = PLAYER_ACTION_CHECK;
      else p.myAction = PLAYER_ACTION_FOLD;
    }
  }

  // Bluff, Small-Bluff
  if (
    (p.sBluff < idiv(100, (apl.length - 2) * 6 + 3) && p.myOdds < p.myNiveau[2] && bero.getHighestSet() === 2 * h.getSmallBlind() && !p.sBluffStatus) ||
    p.sBluffStatus
  ) {
    p.sBluffStatus = true;
    if (bero.getHighestSet() >= 4 * h.getSmallBlind()) {
      // all in bei knappem eigenen Geld
      if (p.myCash - bero.getHighestSet() <= idiv(p.myCash * 1, 6)) {
        raise = p.myCash;
        p.myAction = PLAYER_ACTION_RAISE;
      } else {
        p.myAction = PLAYER_ACTION_CALL;
        if (p.myButton === 3 && p.mySet === bero.getHighestSet()) p.myAction = PLAYER_ACTION_CHECK;
      }
    } else {
      raise = idiv(p.sBluff, 8 - Math.min(7, apl.length)) * h.getSmallBlind();
      if (idiv(p.myCash, 2 * h.getSmallBlind()) <= 6 || raise >= idiv(p.myCash * 4, 5)) {
        raise = p.myCash;
      }
      p.myAction = PLAYER_ACTION_RAISE;
    }
    if ((bero.getHighestSet() >= 12 * h.getSmallBlind() && p.myOdds < p.myNiveau[0]) || (bero.getHighestSet() >= 20 * h.getSmallBlind() && p.myOdds < p.myNiveau[2])) {
      p.myAction = PLAYER_ACTION_FOLD;
    }
  }

  p.evaluation(bet, raise);
}
