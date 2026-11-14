// PokerTH 1.1.2: CardsValue::determineHandName and CardsValue::translateCardsValueCode of
// src/engine/local_engine/cardsvalue.cpp, and guiLog::translateCardCode of src/gui/qt/gametable/log/guilog.cpp,
// translated line by line: the hand names the log writes ("Two Pairs, ..., fifth card ..."). Kicker words
// are added only where another shown hand of the same rank differs from this one there.
// AGPL-3.0-or-later, see ../../LICENSE.md.
import { PLAYER_ACTION_FOLD, idiv } from './defs.ts';
import type { LocalPlayer } from './player.ts';

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS = [
  '<font size=+1><b>&diams;</b></font>',
  '<font size=+1><b>&hearts;</b></font>',
  '<font size=+1><b>&spades;</b></font>',
  '<font size=+1><b>&clubs;</b></font>',
];
export const SUIT_NAMES = ['diams', 'hearts', 'spades', 'clubs'] as const;

/** guiLog::translateCardCode: [rank ("2".."9", "T", "J", "Q", "K", "A"), suit as the log's HTML] */
export function translateCardCode(cardCode: number): [string, string] {
  const value = cardCode % 13;
  const color = idiv(cardCode, 13);
  return [RANKS[value] ?? 'ERROR', SUITS[color] ?? 'ERROR'];
}

/**
 * One kicker loop of determineHandName: keep the entries of `same` whose value / div equals mine (equal),
 * erase the others (different). Returns [equal, different].
 */
function filterSame(same: number[], my: number, div: number): [boolean, boolean] {
  let equal = false;
  let different = false;
  for (let i = 0; i < same.length;) {
    if (idiv(same[i], div) === idiv(my, div)) {
      equal = true;
      i++;
    } else {
      different = true;
      same.splice(i, 1);
    }
  }
  return [equal, different];
}

/** CardsValue::determineHandName(int myCardsValueInt, PlayerList activePlayerList) */
export function determineHandName(myCardsValueInt: number, activePlayerList: LocalPlayer[]): string {
  const shownCardsValueInt: number[] = [];
  let same: number[] = [];
  let different = false;
  let equal = false;

  // collect cardsValueInt of all players who will show their cards
  for (const p of activePlayerList) {
    if (p.getMyAction() !== PLAYER_ACTION_FOLD) shownCardsValueInt.push(p.getMyCardsValueInt());
  }
  // erase own cardsValueInt (the first one equal to it)
  const own = shownCardsValueInt.indexOf(myCardsValueInt);
  if (own >= 0) shownCardsValueInt.splice(own, 1);

  const cardString = translateCardsValueCode(myCardsValueInt);
  let c = 0;
  // *cardStringIt_c past the end of the std::list is undefined in C++; it does not happen for valid codes
  const cs = () => cardString[c] ?? '';
  let handName = '';
  // same hand detection
  const sameAs = (div: number) => shownCardsValueInt.filter((v) => idiv(v, div) === idiv(myCardsValueInt, div));

  switch (idiv(myCardsValueInt, 100000000)) {
    // Royal Flush
    case 9:
      handName = cs();
      break;
    // Straight Flush
    case 8:
      handName = cs();
      c++;
      handName += cs();
      break;
    // Four of a kind
    case 7:
      handName = cs();
      c++;
      handName += cs();
      same = sameAs(1000000);
      if (same.length) {
        [equal, different] = filterSame(same, myCardsValueInt, 10000);
        if (different) {
          c++;
          handName += ', fifth card ' + cs();
        }
      }
      break;
    // Full House
    case 6:
      handName = cs();
      c++;
      handName += cs();
      c++;
      handName += cs();
      break;
    // Flush
    case 5:
      handName = cs();
      c++;
      handName += cs();
      same = sameAs(1000000);
      if (same.length) {
        [equal, different] = filterSame(same, myCardsValueInt, 10000);
        c++;
        if (different) handName += ', second card ' + cs();
        if (equal) {
          [equal, different] = filterSame(same, myCardsValueInt, 100);
          c++;
          if (different) handName += ', third card ' + cs();
          if (equal) {
            [equal, different] = filterSame(same, myCardsValueInt, 10);
            c++;
            if (different) handName += ', fourth card ' + cs();
            if (equal) {
              [equal, different] = filterSame(same, myCardsValueInt, 1);
              if (different) {
                c++;
                handName += ', fifth card ' + cs();
              }
            }
          }
        }
      }
      break;
    // Straight
    case 4:
      handName = cs();
      c++;
      handName += cs();
      break;
    // Three of a kind
    case 3:
      handName = cs();
      c++;
      handName += cs();
      same = sameAs(1000000);
      if (same.length) {
        [equal, different] = filterSame(same, myCardsValueInt, 10000);
        c++;
        if (different) handName += ', fourth card ' + cs();
        if (equal) {
          [equal, different] = filterSame(same, myCardsValueInt, 100);
          if (different) {
            c++;
            handName += ', fifth card ' + cs();
          }
        }
      }
      break;
    // Two Pair
    case 2:
      handName = cs();
      c++;
      handName += cs();
      c++;
      handName += cs();
      same = sameAs(10000);
      if (same.length) {
        [equal, different] = filterSame(same, myCardsValueInt, 100);
        if (different) {
          c++;
          handName += ', fifth card ' + cs();
        }
      }
      break;
    // Pair
    case 1:
      handName = cs();
      c++;
      handName += cs();
      same = sameAs(1000000);
      if (same.length) {
        [equal, different] = filterSame(same, myCardsValueInt, 10000);
        c++;
        if (different) handName += ', third card ' + cs();
        if (equal) {
          [equal, different] = filterSame(same, myCardsValueInt, 100);
          c++;
          if (different) handName += ', fourth card ' + cs();
          if (equal) {
            [equal, different] = filterSame(same, myCardsValueInt, 1);
            if (different) {
              c++;
              handName += ', fifth card ' + cs();
            }
          }
        }
      }
      break;
    // highestCard
    case 0:
      handName = cs();
      c++;
      handName += cs();
      same = sameAs(1000000);
      if (same.length) {
        [equal, different] = filterSame(same, myCardsValueInt, 10000);
        c++;
        if (different) handName += ', second card ' + cs();
        if (equal) {
          [equal, different] = filterSame(same, myCardsValueInt, 100);
          c++;
          if (different) handName += ', third card ' + cs();
          if (equal) {
            [equal, different] = filterSame(same, myCardsValueInt, 10);
            c++;
            if (different) handName += ', fourth card ' + cs();
            if (equal) {
              [, different] = filterSame(same, myCardsValueInt, 1);
              if (different) {
                c++;
                handName += ', fifth card ' + cs();
              }
            }
          }
        }
      }
      break;
  }
  return handName;
}

/** CardsValue::translateCardsValueCode(int cardsValueCode) */
export function translateCardsValueCode(cardsValueCode: number): string[] {
  const cardString: string[] = [];
  //erste Ziffer : Blattname
  const firstPart = idiv(cardsValueCode, 100000000);
  //zweite und dritte Ziffer : Kicker, highest Card, usw.
  const secondPart = idiv(cardsValueCode, 1000000) - firstPart*100;
  //vierte und fuenfte Ziffer
  const thirdPart = idiv(cardsValueCode, 10000) - firstPart*10000 - secondPart*100;
  // usw
  const fourthPart = idiv(cardsValueCode, 100) - firstPart*1000000 - secondPart*10000 - thirdPart*100;
  //
  const fifthPart = cardsValueCode - firstPart*100000000 - secondPart*1000000 - thirdPart*10000 - fourthPart*100;
  // fuer highest Card
  const fifthPartA = idiv(cardsValueCode, 10) - firstPart*10000000 - secondPart*100000 - thirdPart*1000 - fourthPart*10;
  const fifthPartB = cardsValueCode - firstPart*100000000 - secondPart*1000000 - thirdPart*10000 - fourthPart*100 - fifthPartA*10;
  switch (firstPart) {
  // Royal Flush
  case 9:
    cardString.push('Royal Flush');
    break;
  // Straight Flush
  case 8: {
    cardString.push('Straight Flush, ');
    switch (secondPart) {
    case 11:
      cardString.push('King high');
      break;
    case 10:
      cardString.push('Queen high');
      break;
    case 9:
      cardString.push('Jack high');
      break;
    case 8:
      cardString.push('Ten high');
      break;
    case 7:
      cardString.push('Nine high');
      break;
    case 6:
      cardString.push('Eight high');
      break;
    case 5:
      cardString.push('Seven high');
      break;
    case 4:
      cardString.push('Six high');
      break;
    case 3:
      cardString.push('Five high');
      break;
    default:
      cardString.push('ERROR');
    }
  }
  break;
  // Four of a Kind
  case 7: {
    cardString.push('Four of a Kind, ');
    switch (secondPart) {
    case 12:
      cardString.push('Aces');
      break;
    case 11:
      cardString.push('Kings');
      break;
    case 10:
      cardString.push('Queens');
      break;
    case 9:
      cardString.push('Jacks');
      break;
    case 8:
      cardString.push('Tens');
      break;
    case 7:
      cardString.push('Nines');
      break;
    case 6:
      cardString.push('Eights');
      break;
    case 5:
      cardString.push('Sevens');
      break;
    case 4:
      cardString.push('Sixes');
      break;
    case 3:
      cardString.push('Fives');
      break;
    case 2:
      cardString.push('Fours');
      break;
    case 1:
      cardString.push('Threes');
      break;
    case 0:
      cardString.push('Deuces');
      break;
    default:
      cardString.push('ERROR');
    }
    // Kicker
    switch (thirdPart) {
    case 12:
      cardString.push('Ace');
      break;
    case 11:
      cardString.push('King');
      break;
    case 10:
      cardString.push('Queen');
      break;
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
  }
  break;
  // Full House
  case 6: {
    cardString.push('Full House, ');
    //Drilling
    switch (secondPart) {
    case 12:
      cardString.push('Aces full of ');
      break;
    case 11:
      cardString.push('Kings full of ');
      break;
    case 10:
      cardString.push('Queens full of ');
      break;
    case 9:
      cardString.push('Jacks full of ');
      break;
    case 8:
      cardString.push('Tens full of ');
      break;
    case 7:
      cardString.push('Nines full of ');
      break;
    case 6:
      cardString.push('Eights full of ');
      break;
    case 5:
      cardString.push('Sevens full of ');
      break;
    case 4:
      cardString.push('Sixes full of ');
      break;
    case 3:
      cardString.push('Fives full of ');
      break;
    case 2:
      cardString.push('Fours full of ');
      break;
    case 1:
      cardString.push('Threes full of ');
      break;
    case 0:
      cardString.push('Deuces full of ');
      break;
    default:
      cardString.push('ERROR');
    }
    //Paerchen
    switch (thirdPart) {
    case 12:
      cardString.push('Aces');
      break;
    case 11:
      cardString.push('Kings');
      break;
    case 10:
      cardString.push('Queens');
      break;
    case 9:
      cardString.push('Jacks');
      break;
    case 8:
      cardString.push('Tens');
      break;
    case 7:
      cardString.push('Nines');
      break;
    case 6:
      cardString.push('Eights');
      break;
    case 5:
      cardString.push('Sevens');
      break;
    case 4:
      cardString.push('Sixes');
      break;
    case 3:
      cardString.push('Fives');
      break;
    case 2:
      cardString.push('Fours');
      break;
    case 1:
      cardString.push('Threes');
      break;
    case 0:
      cardString.push('Deuces');
      break;
    default:
      cardString.push('ERROR');
    }
  }
  break;
  // Flush
  case 5: {
    cardString.push('Flush, ');
    //highest Card
    switch (secondPart) {
    case 12:
      cardString.push('Ace high');
      break;
    case 11:
      cardString.push('King high');
      break;
    case 10:
      cardString.push('Queen high');
      break;
    case 9:
      cardString.push('Jack high');
      break;
    case 8:
      cardString.push('Ten high');
      break;
    case 7:
      cardString.push('Nine high');
      break;
    case 6:
      cardString.push('Eight high');
      break;
    case 5:
      cardString.push('Seven high');
      break;
    case 4:
      cardString.push('Six high');
      break;
    default:
      cardString.push('ERROR');
    }
    // Kicker 1
    switch (thirdPart) {
    case 12:
      cardString.push('Ace');
      break;
    case 11:
      cardString.push('King');
      break;
    case 10:
      cardString.push('Queen');
      break;
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
    //Kicker 2
    switch (fourthPart) {
    case 12:
      cardString.push('Ace');
      break;
    case 11:
      cardString.push('King');
      break;
    case 10:
      cardString.push('Queen');
      break;
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
    //Kicker 3
    switch (fifthPartA) {
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
    //Kicker 4
    switch (fifthPartB) {
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
  }
  break;
  // Straight
  case 4: {
    cardString.push('Straight, ');
    switch (secondPart) {
    case 12:
      cardString.push('Ace high');
      break;
    case 11:
      cardString.push('King high');
      break;
    case 10:
      cardString.push('Queen high');
      break;
    case 9:
      cardString.push('Jack high');
      break;
    case 8:
      cardString.push('Ten high');
      break;
    case 7:
      cardString.push('Nine high');
      break;
    case 6:
      cardString.push('Eight high');
      break;
    case 5:
      cardString.push('Seven high');
      break;
    case 4:
      cardString.push('Six high');
      break;
    case 3:
      cardString.push('Five high');
      break;
    default:
      cardString.push('ERROR');
    }
  }
  break;
  // Three of a Kind
  case 3: {
    cardString.push('Three of a Kind, ');
    switch (secondPart) {
    case 12:
      cardString.push('Aces');
      break;
    case 11:
      cardString.push('Kings');
      break;
    case 10:
      cardString.push('Queens');
      break;
    case 9:
      cardString.push('Jacks');
      break;
    case 8:
      cardString.push('Tens');
      break;
    case 7:
      cardString.push('Nines');
      break;
    case 6:
      cardString.push('Eights');
      break;
    case 5:
      cardString.push('Sevens');
      break;
    case 4:
      cardString.push('Sixes');
      break;
    case 3:
      cardString.push('Fives');
      break;
    case 2:
      cardString.push('Fours');
      break;
    case 1:
      cardString.push('Threes');
      break;
    case 0:
      cardString.push('Deuces');
      break;
    default:
      cardString.push('ERROR');
    }
    //Kicker 1
    switch (thirdPart) {
    case 12:
      cardString.push('Ace');
      break;
    case 11:
      cardString.push('King');
      break;
    case 10:
      cardString.push('Queen');
      break;
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
    //Kicker 2
    switch (fourthPart) {
    case 12:
      cardString.push('Ace');
      break;
    case 11:
      cardString.push('King');
      break;
    case 10:
      cardString.push('Queen');
      break;
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
  }
  break;
  // Two Pair
  case 2: {
    cardString.push('Two Pair, ');
    // erster Pair
    switch (secondPart) {
    case 12:
      cardString.push('Aces and ');
      break;
    case 11:
      cardString.push('Kings and ');
      break;
    case 10:
      cardString.push('Queens and ');
      break;
    case 9:
      cardString.push('Jacks and ');
      break;
    case 8:
      cardString.push('Tens and ');
      break;
    case 7:
      cardString.push('Nines and ');
      break;
    case 6:
      cardString.push('Eights and ');
      break;
    case 5:
      cardString.push('Sevens and ');
      break;
    case 4:
      cardString.push('Sixes and ');
      break;
    case 3:
      cardString.push('Fives and ');
      break;
    case 2:
      cardString.push('Fours and ');
      break;
    case 1:
      cardString.push('Threes and ');
      break;
    case 0:
      cardString.push('Deuces and ');
      break;
    default:
      cardString.push('ERROR');
    }
    // zweiter Pair
    switch (thirdPart) {
    case 12:
      cardString.push('Aces');
      break;
    case 11:
      cardString.push('Kings');
      break;
    case 10:
      cardString.push('Queens');
      break;
    case 9:
      cardString.push('Jacks');
      break;
    case 8:
      cardString.push('Tens');
      break;
    case 7:
      cardString.push('Nines');
      break;
    case 6:
      cardString.push('Eights');
      break;
    case 5:
      cardString.push('Sevens');
      break;
    case 4:
      cardString.push('Sixes');
      break;
    case 3:
      cardString.push('Fives');
      break;
    case 2:
      cardString.push('Fours');
      break;
    case 1:
      cardString.push('Threes');
      break;
    case 0:
      cardString.push('Deuces');
      break;
    default:
      cardString.push('ERROR');
    }
    //Kicker
    switch (fourthPart) {
    case 12:
      cardString.push('Ace');
      break;
    case 11:
      cardString.push('King');
      break;
    case 10:
      cardString.push('Queen');
      break;
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
  }
  break;
  // One Pair
  case 1: {
    cardString.push('One Pair, ');
    // Pair
    switch (secondPart) {
    case 12:
      cardString.push('Aces');
      break;
    case 11:
      cardString.push('Kings');
      break;
    case 10:
      cardString.push('Queens');
      break;
    case 9:
      cardString.push('Jacks');
      break;
    case 8:
      cardString.push('Tens');
      break;
    case 7:
      cardString.push('Nines');
      break;
    case 6:
      cardString.push('Eights');
      break;
    case 5:
      cardString.push('Sevens');
      break;
    case 4:
      cardString.push('Sixes');
      break;
    case 3:
      cardString.push('Fives');
      break;
    case 2:
      cardString.push('Fours');
      break;
    case 1:
      cardString.push('Threes');
      break;
    case 0:
      cardString.push('Deuces');
      break;
    default:
      cardString.push('ERROR');
    }
    // Kicker 1
    switch (thirdPart) {
    case 12:
      cardString.push('Ace');
      break;
    case 11:
      cardString.push('King');
      break;
    case 10:
      cardString.push('Queen');
      break;
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
    //Kicker 2
    switch (fourthPart) {
    case 12:
      cardString.push('Ace');
      break;
    case 11:
      cardString.push('King');
      break;
    case 10:
      cardString.push('Queen');
      break;
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
    //Kicker 3
    switch (fifthPart) {
    case 12:
      cardString.push('Ace');
      break;
    case 11:
      cardString.push('King');
      break;
    case 10:
      cardString.push('Queen');
      break;
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
  }
  break;
  // Highest Card
  case 0:  {
    cardString.push('High Card, ');
    // Kicker 1
    switch (secondPart) {
    case 12:
      cardString.push('Ace');
      break;
    case 11:
      cardString.push('King');
      break;
    case 10:
      cardString.push('Queen');
      break;
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuces');
      break;
    default:
      cardString.push('ERROR');
    }
    // Kicker 2
    switch (thirdPart) {
    case 12:
      cardString.push('Ace');
      break;
    case 11:
      cardString.push('King');
      break;
    case 10:
      cardString.push('Queen');
      break;
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
    //Kicker 3
    switch (fourthPart) {
    case 12:
      cardString.push('Ace');
      break;
    case 11:
      cardString.push('King');
      break;
    case 10:
      cardString.push('Queen');
      break;
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
    //Kicker 4
    switch (fifthPartA) {
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
    //Kicker 5
    switch (fifthPartB) {
    case 9:
      cardString.push('Jack');
      break;
    case 8:
      cardString.push('Ten');
      break;
    case 7:
      cardString.push('Nine');
      break;
    case 6:
      cardString.push('Eight');
      break;
    case 5:
      cardString.push('Seven');
      break;
    case 4:
      cardString.push('Six');
      break;
    case 3:
      cardString.push('Five');
      break;
    case 2:
      cardString.push('Four');
      break;
    case 1:
      cardString.push('Three');
      break;
    case 0:
      cardString.push('Deuce');
      break;
    default:
      cardString.push('ERROR');
    }
  }
  break;
  default:
    cardString.push('ERROR');
  }
  return cardString;
}
