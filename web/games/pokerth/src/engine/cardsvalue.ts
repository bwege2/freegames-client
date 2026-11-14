// PokerTH 1.1.2: src/engine/local_engine/cardsvalue.cpp (CardsValue::cardsValue, holeCardsToIntCode),
// translated line by line. AGPL-3.0-or-later, see ../../LICENSE.md.
//
// A card is 0..51: card / 13 is the suit (0 diamonds, 1 hearts, 2 spades, 3 clubs), card % 13 the rank
// (0 = two ... 12 = ace). cardsValue takes 7 cards (the two hole cards first, then the five board cards)
// and returns the hand's value: class * 100000000 + rank weights; `position` (if given) gets the indices
// (into the 7 cards) of the five cards that make the hand.

// int array[7][3] and ktemp[3]: allocated once (the computer opponents call cardsValue tens of thousands of
// times per decision on the turn and river)
const array: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
const ktemp = [0, 0, 0];
function swap(a: number, b: number): void {
  ktemp[0] = array[a][0];
  ktemp[1] = array[a][1];
  ktemp[2] = array[a][2];
  array[a][0] = array[b][0];
  array[a][1] = array[b][1];
  array[a][2] = array[b][2];
  array[b][0] = ktemp[0];
  array[b][1] = ktemp[1];
  array[b][2] = ktemp[2];
}

/** CardsValue::cardsValue(int* cards, int* position) */
export function cardsValue(cards: ArrayLike<number>, position: number[] | null): number {
  let j1: number, j2: number, j3: number, j4: number, j5: number, k1: number, k2: number;

  // Kartenwerte umwandeln
  for (j1 = 0; j1 < 7; j1++) {
    array[j1][0] = (cards[j1] / 13) | 0;
    array[j1][1] = cards[j1] % 13;
    array[j1][2] = j1;
  }

  // Karten nach Farben sortieren: Kreuz - Pik - Herz - Karo
  for (k1 = 0; k1 < 7; k1++) {
    for (k2 = k1 + 1; k2 < 7; k2++) {
      if (array[k1][0] < array[k2][0]) swap(k1, k2);
    }
  }

  // Karten innerhalb der Farben nach der Groesse sortieren
  for (k1 = 0; k1 < 7; k1++) {
    for (k2 = k1 + 1; k2 < 7; k2++) {
      if (array[k1][0] === array[k2][0] && array[k1][1] < array[k2][1]) swap(k1, k2);
    }
  }

  // auf Royal Flush (Klasse 9) und Straight Flush (Klasse 8) testen
  for (j1 = 0; j1 < 3; j1++) {
    if (array[j1][0] === array[j1 + 1][0] && array[j1][0] === array[j1 + 2][0] && array[j1][0] === array[j1 + 3][0] && array[j1][0] === array[j1 + 4][0]) {
      if (array[j1][1] - 1 === array[j1 + 1][1] && array[j1 + 1][1] - 1 === array[j1 + 2][1] && array[j1 + 2][1] - 1 === array[j1 + 3][1] && array[j1 + 3][1] - 1 === array[j1 + 4][1]) {
        if (array[j1][1] === 12) {
          if (position) {
            for (j2 = 0; j2 < 5; j2++) position[j2] = array[j1 + j2][2];
          }
          return 900000000;
        } else {
          if (position) {
            for (j2 = 0; j2 < 5; j2++) position[j2] = array[j1 + j2][2];
          }
          return 800000000 + array[j1][1] * 1000000;
        }
      }
    }
  }

  // Straight Flush Ausnahme: 5-4-3-2-A
  for (j1 = 0; j1 < 3; j1++) {
    if (array[j1][0] === array[j1 + 1][0] && array[j1][0] === array[j1 + 2][0] && array[j1][0] === array[j1 + 3][0] && array[j1][0] === array[j1 + 4][0]) {
      for (j2 = j1 + 1; j2 < 4; j2++) {
        if (array[j1][1] - 9 === array[j2][1] && array[j2][1] - 1 === array[j2 + 1][1] && array[j2 + 1][1] - 1 === array[j2 + 2][1] && array[j2 + 2][1] - 1 === array[j2 + 3][1] && array[j1][0] === array[j2 + 2][0] && array[j1][0] === array[j2 + 3][0]) {
          if (position) {
            position[0] = array[j1][2];
            for (j3 = 0; j3 < 4; j3++) position[j3 + 1] = array[j2 + j3][2];
          }
          return 800000000 + 3 * 1000000;
        }
      }
    }
  }

  // auf Flush (Klasse 5) testen
  for (j1 = 0; j1 < 3; j1++) {
    if (array[j1][0] === array[j1 + 1][0] && array[j1][0] === array[j1 + 2][0] && array[j1][0] === array[j1 + 3][0] && array[j1][0] === array[j1 + 4][0]) {
      if (position) {
        for (j2 = 0; j2 < 5; j2++) position[j2] = array[j1 + j2][2];
      }
      return 500000000 + array[j1][1] * 1000000 + array[j1 + 1][1] * 10000 + array[j1 + 2][1] * 100 + array[j1 + 3][1] * 10 + array[j1 + 4][1];
    }
  }

  // Karten fuer den Vierling-, Full-House-, Drilling- und Paartest umsortieren
  for (k1 = 0; k1 < 7; k1++) {
    for (k2 = k1 + 1; k2 < 7; k2++) {
      if (array[k1][1] < array[k2][1]) swap(k1, k2);
    }
  }

  // nach Position sortieren: erst board, dann hole cards
  for (k1 = 0; k1 < 7; k1++) {
    for (k2 = k1 + 1; k2 < 7; k2++) {
      if (array[k1][1] === array[k2][1] && array[k1][2] < array[k2][2]) swap(k1, k2);
    }
  }

  // auf Vierling (Klasse 7) testen
  for (j1 = 0; j1 < 4; j1++) {
    if (array[j1][1] === array[j1 + 1][1] && array[j1][1] === array[j1 + 2][1] && array[j1][1] === array[j1 + 3][1]) {
      if (j1 === 0) {
        if (position) {
          for (j2 = 0; j2 < 5; j2++) position[j2] = array[j2][2];
        }
        return 700000000 + array[j1][1] * 1000000 + array[j1 + 4][1] * 10000;
      } else {
        if (position) {
          for (j2 = 0; j2 < 4; j2++) position[j2] = array[j1 + j2][2];
          position[4] = array[0][2];
        }
        return 700000000 + array[j1][1] * 1000000 + array[0][1] * 10000;
      }
    }
  }

  let drei: number, zwei: number;

  // auf Straight (Klasse 4) und Full House (Klasse 6) testen
  for (j1 = 0; j1 < 7; j1++) {
    for (j2 = j1 + 1; j2 < 7; j2++) {
      for (j3 = j2 + 1; j3 < 7; j3++) {
        for (j4 = j3 + 1; j4 < 7; j4++) {
          for (j5 = j4 + 1; j5 < 7; j5++) {
            // Straight
            if (array[j1][1] - 1 === array[j2][1] && array[j2][1] - 1 === array[j3][1] && array[j3][1] - 1 === array[j4][1] && array[j4][1] - 1 === array[j5][1]) {
              if (position) {
                position[0] = array[j1][2];
                position[1] = array[j2][2];
                position[2] = array[j3][2];
                position[3] = array[j4][2];
                position[4] = array[j5][2];
              }
              return 400000000 + array[j1][1] * 1000000;
            }
            // Full House
            if ((array[j1][1] === array[j2][1] && array[j1][1] === array[j3][1] && array[j4][1] === array[j5][1]) || (array[j3][1] === array[j4][1] && array[j3][1] === array[j5][1] && array[j1][1] === array[j2][1])) {
              if (position) {
                position[0] = array[j1][2];
                position[1] = array[j2][2];
                position[2] = array[j3][2];
                position[3] = array[j4][2];
                position[4] = array[j5][2];
              }
              if (array[j3][1] === array[j1][1]) {
                drei = array[j1][1];
                zwei = array[j4][1];
              } else {
                drei = array[j4][1];
                zwei = array[j1][1];
              }
              return 600000000 + drei * 1000000 + zwei * 10000;
            }
          }
        }
      }
    }
  }

  // auf Straight-Spezialfall ( 5 4 3 2 A ) testen
  for (j1 = 0; j1 < 7; j1++) {
    for (j2 = j1 + 1; j2 < 7; j2++) {
      for (j3 = j2 + 1; j3 < 7; j3++) {
        for (j4 = j3 + 1; j4 < 7; j4++) {
          for (j5 = j4 + 1; j5 < 7; j5++) {
            if (array[j1][1] - 9 === array[j2][1] && array[j2][1] - 1 === array[j3][1] && array[j3][1] - 1 === array[j4][1] && array[j4][1] - 1 === array[j5][1]) {
              if (position) {
                position[0] = array[j1][2];
                position[1] = array[j2][2];
                position[2] = array[j3][2];
                position[3] = array[j4][2];
                position[4] = array[j5][2];
              }
              return 400000000 + array[j2][1] * 1000000;
            }
          }
        }
      }
    }
  }

  // auf Drilling (Klasse 3) testen
  for (j1 = 0; j1 < 5; j1++) {
    if (array[j1][1] === array[j1 + 1][1] && array[j1][1] === array[j1 + 2][1]) {
      if (j1 === 0) {
        if (position) {
          for (j2 = 0; j2 < 5; j2++) position[j2] = array[j2][2];
        }
        return 300000000 + array[j1][1] * 1000000 + array[j1 + 3][1] * 10000 + array[j1 + 4][1] * 100;
      } else {
        if (j1 === 1) {
          if (position) {
            for (j2 = 0; j2 < 5; j2++) position[j2] = array[j2][2];
          }
          return 300000000 + array[j1][1] * 1000000 + array[j1 - 1][1] * 10000 + array[j1 + 3][1] * 100;
        } else {
          if (position) {
            for (j2 = 0; j2 < 3; j2++) position[j2] = array[j1 + j2][2];
            position[3] = array[0][2];
            position[4] = array[1][2];
          }
          return 300000000 + array[j1][1] * 1000000 + array[0][1] * 10000 + array[1][1] * 100;
        }
      }
    }
  }

  // auf Zwei Paare (Klasse 2) testen
  for (j1 = 0; j1 < 4; j1++) {
    for (j2 = j1 + 2; j2 < 6; j2++) {
      if (array[j1][1] === array[j1 + 1][1] && array[j2][1] === array[j2 + 1][1]) {
        if (j1 === 0) {
          if (j2 === 2) {
            if (position) {
              position[0] = array[j1][2];
              position[1] = array[j1 + 1][2];
              position[2] = array[j2][2];
              position[3] = array[j2 + 1][2];
              position[4] = array[j2 + 2][2];
            }
            return 200000000 + array[j1][1] * 1000000 + array[j2][1] * 10000 + array[j2 + 2][1] * 100;
          } else {
            if (position) {
              position[0] = array[j1][2];
              position[1] = array[j1 + 1][2];
              position[2] = array[j2][2];
              position[3] = array[j2 + 1][2];
              position[4] = array[j1 + 2][2];
            }
            return 200000000 + array[j1][1] * 1000000 + array[j2][1] * 10000 + array[j1 + 2][1] * 100;
          }
        } else {
          if (position) {
            position[0] = array[j1][2];
            position[1] = array[j1 + 1][2];
            position[2] = array[j2][2];
            position[3] = array[j2 + 1][2];
            position[4] = array[0][2];
          }
          return 200000000 + array[j1][1] * 1000000 + array[j2][1] * 10000 + array[0][1] * 100;
        }
      }
    }
  }

  // auf Paar (Klasse 1) testen
  for (j1 = 0; j1 < 6; j1++) {
    if (array[j1][1] === array[j1 + 1][1]) {
      if (j1 === 0) {
        if (position) {
          for (j2 = 0; j2 < 5; j2++) position[j2] = array[j2][2];
        }
        return 100000000 + array[j1][1] * 1000000 + array[j1 + 2][1] * 10000 + array[j1 + 3][1] * 100 + array[j1 + 4][1];
      }
      if (j1 === 1) {
        if (position) {
          for (j2 = 0; j2 < 5; j2++) position[j2] = array[j2][2];
        }
        return 100000000 + array[j1][1] * 1000000 + array[j1 - 1][1] * 10000 + array[j1 + 2][1] * 100 + array[j1 + 3][1];
      }
      if (j1 === 2) {
        if (position) {
          for (j2 = 0; j2 < 5; j2++) position[j2] = array[j2][2];
        }
        return 100000000 + array[j1][1] * 1000000 + array[j1 - 2][1] * 10000 + array[j1 - 1][1] * 100 + array[j1 + 2][1];
      } else {
        if (position) {
          for (j2 = 0; j2 < 2; j2++) position[j2] = array[j1 + j2][2];
          position[2] = array[0][2];
          position[3] = array[1][2];
          position[4] = array[2][2];
        }
        return 100000000 + array[j1][1] * 1000000 + array[0][1] * 10000 + array[1][1] * 100 + array[2][1];
      }
    }
  }

  // Highest Card (Klasse 0) + Kicker
  if (position) {
    for (j2 = 0; j2 < 5; j2++) position[j2] = array[j2][2];
  }
  return array[0][1] * 1000000 + array[1][1] * 10000 + array[2][1] * 100 + array[3][1] * 10 + array[4][1];
}

/** CardsValue::holeCardsToIntCode(int* cards) */
export function holeCardsToIntCode(cards: ArrayLike<number>): number {
  if (cards[0] % 13 === cards[1] % 13) {
    return (cards[0] % 13) * 1000 + (cards[0] % 13) * 10;
  } else {
    if (cards[0] % 13 < cards[1] % 13) {
      if (Math.trunc(cards[0] / 13) === Math.trunc(cards[1] / 13)) {
        return (cards[0] % 13) * 1000 + (cards[1] % 13) * 10 + 1;
      } else {
        return (cards[0] % 13) * 1000 + (cards[1] % 13) * 10;
      }
    } else {
      if (Math.trunc(cards[0] / 13) === Math.trunc(cards[1] / 13)) {
        return (cards[1] % 13) * 1000 + (cards[0] % 13) * 10 + 1;
      } else {
        return (cards[1] % 13) * 1000 + (cards[0] % 13) * 10;
      }
    }
  }
}
