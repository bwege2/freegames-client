// PokerTH 1.1.2: LocalPlayer::flopCardsValue and LocalPlayer::turnCardsValue of src/engine/local_engine/localplayer.cpp,
// translated line by line (without DEBUG_MODE blocks and commented-out code). AGPL-3.0-or-later, see ../../../LICENSE.md.
//
// Neither function reads the player's state. flopCardsValue gets the two hole cards and the three flop cards and
// returns the hand code that calcMyOdds looks up in FlopValues (80000: a made hand, odds 100).
//
// Two spots where the C++ is undefined: temp2Array has two elements, but (1) it is read at [0] when no hole card
// was stored (a straight draw of four board cards; C++ reads an uninitialised stack value), and (2) after a flush
// or straight draw has counted `temp`, the two-pair test can store at temp2Array[2] and [3] (C++ writes past the
// array). The port starts temp2Array as [0, 0] and lets it grow; reads stay at [0] and [1].

function makeArray(cards: ArrayLike<number>, n: number): number[][] {
  const array: number[][] = [];
  for (let j1 = 0; j1 < n; j1++) array.push([Math.trunc(cards[j1] / 13), cards[j1] % 13, j1]);
  return array;
}

function swap(array: number[][], a: number, b: number): void {
  const t0 = array[a][0];
  const t1 = array[a][1];
  const t2 = array[a][2];
  array[a][0] = array[b][0];
  array[a][1] = array[b][1];
  array[a][2] = array[b][2];
  array[b][0] = t0;
  array[b][1] = t1;
  array[b][2] = t2;
}

/** sort by suit (descending), then within a suit by rank (descending) */
function sortBySuit(array: number[][], n: number): void {
  for (let k1 = 0; k1 < n; k1++) {
    for (let k2 = k1 + 1; k2 < n; k2++) {
      if (array[k1][0] < array[k2][0]) swap(array, k1, k2);
    }
  }
  for (let k1 = 0; k1 < n; k1++) {
    for (let k2 = k1 + 1; k2 < n; k2++) {
      if (array[k1][0] === array[k2][0] && array[k1][1] < array[k2][1]) swap(array, k1, k2);
    }
  }
}

function sortByRank(array: number[][], n: number): void {
  for (let k1 = 0; k1 < n; k1++) {
    for (let k2 = k1 + 1; k2 < n; k2++) {
      if (array[k1][1] < array[k2][1]) swap(array, k1, k2);
    }
  }
}

/** LocalPlayer::flopCardsValue(int* cards) */
export function flopCardsValue(cards: number[]): number {
  const array = makeArray(cards, 5);
  let j1: number, j2: number, j3: number, j4: number, j5: number;
  let temp = 0;
  let temp1 = 0;
  let temp2 = 0;
  const temp2Array: number[] = [0, 0];
  let tempValue = -1;
  let breakLoop = false;

  sortBySuit(array, 5);

  // Flush
  if (array[0][0] === array[1][0] && array[0][0] === array[2][0] && array[0][0] === array[3][0] && array[0][0] === array[4][0]) {
    // (straight flush, 5-4-3-2-A straight flush and flush all give 80000)
    return 80000;
  }

  // Flush draw
  for (j1 = 0; j1 < 2 && !breakLoop; j1++) {
    if (array[j1][0] === array[j1 + 1][0] && array[j1][0] === array[j1 + 2][0] && array[j1][0] === array[j1 + 3][0]) {
      if (array[j1][1] - 3 === array[j1 + 3][1]) {
        if (array[j1][1] === 12) {
          for (j2 = 0; j2 < 4; j2++) if (array[j1 + j2][2] <= 1) temp++;
          return 70012 + temp * 100;
        } else {
          for (j2 = 0; j2 < 4; j2++) if (array[j1 + j2][2] <= 1) temp++;
          return 70000 + temp * 100 + array[j1][1];
        }
      } else {
        if (array[j1][1] - 4 === array[j1 + 3][1]) {
          for (j2 = 0; j2 < 4; j2++) if (array[j1 + j2][2] <= 1) temp++;
          return 71000 + temp * 100 + array[j1][1];
        } else {
          if (array[j1][1] === 12 && (array[j1 + 1][1] <= 3 || (j1 === 0 && array[j1 + 2][1] <= 3 && array[j1][0] === array[j1 + 4][0]))) {
            for (j2 = 0; j2 < 4; j2++) if (array[j1 + j2][2] <= 1) temp++;
            return 71012 + temp * 100;
          } else {
            for (j2 = 0; j2 < 4; j2++) {
              if (array[j1 + j2][2] <= 1) {
                temp2Array[temp] = array[j1 + j2][1];
                temp++;
              }
            }
            if (temp === 2) {
              for (j2 = 0; j2 < 4; j2++) {
                if (temp2Array[1] > array[j1 + j2][1]) temp1++;
                if (temp2Array[0] > array[j1 + j2][1]) temp2++;
              }
              return 60000 + temp1 * 1000 + temp2 * 100 + array[j1][1];
            } else {
              for (j2 = 0; j2 < 4; j2++) {
                if (j1 === 0) {
                  if (array[4][1] < array[j1 + j2][1]) temp1++;
                } else {
                  if (array[0][1] < array[j1 + j2][1]) temp1++;
                }
              }
              if (temp1 >= 2) temp1 = 1;
              if (temp1 === 4) temp1 = 2;
              for (j2 = 0; j2 < 4; j2++) {
                if (temp2Array[0] < array[j1 + j2][1]) temp2++;
              }
              tempValue = 50000 + temp1 * 1000 + temp2 * 100 + temp2Array[0];
              breakLoop = true;
            }
          }
        }
      }
    }
  }

  sortByRank(array, 5);

  // Four of a kind
  for (j1 = 0; j1 < 2; j1++) {
    if (array[j1][1] === array[j1 + 1][1] && array[j1][1] === array[j1 + 2][1] && array[j1][1] === array[j1 + 3][1]) {
      return 80000;
    }
  }

  // Straight
  if ((array[0][1] - 1 === array[1][1] || array[0][1] - 9 === array[1][1]) && array[1][1] - 1 === array[2][1] && array[2][1] - 1 === array[3][1] && array[3][1] - 1 === array[4][1]) {
    return 80000;
  }

  // Full House
  if ((array[0][1] === array[1][1] && array[0][1] === array[2][1] && array[3][1] === array[4][1]) || (array[2][1] === array[3][1] && array[2][1] === array[4][1] && array[0][1] === array[1][1])) {
    return 80000;
  }

  /** the hole cards among the four draw cards go to temp2Array; temp1 counts draw cards below temp2Array[0] */
  const collect = () => {
    if (array[j1][2] <= 1) { temp2Array[temp] = array[j1][1]; temp++; }
    if (array[j2][2] <= 1) { temp2Array[temp] = array[j2][1]; temp++; }
    if (array[j3][2] <= 1) { temp2Array[temp] = array[j3][1]; temp++; }
    if (array[j4][2] <= 1) { temp2Array[temp] = array[j4][1]; temp++; }
  };
  const countBelow = () => {
    if (temp2Array[0] > array[j1][1]) temp1++;
    if (temp2Array[0] > array[j2][1]) temp1++;
    if (temp2Array[0] > array[j3][1]) temp1++;
    if (temp2Array[0] > array[j4][1]) temp1++;
  };
  const fifthCard = () => {
    for (j5 = 0; j5 < 5; j5++) {
      if (j5 !== j1 && j5 !== j2 && j5 !== j3 && j5 !== j4) {
        if (array[j5][1] < array[j4][1]) temp2 = 0;
        else temp2 = 1;
      }
    }
  };

  // Straight draw
  for (j1 = 0; j1 < 5 && !breakLoop; j1++) {
    for (j2 = j1 + 1; j2 < 5 && !breakLoop; j2++) {
      for (j3 = j2 + 1; j3 < 5 && !breakLoop; j3++) {
        for (j4 = j3 + 1; j4 < 5 && !breakLoop; j4++) {
          const a1 = array[j1][1], a2 = array[j2][1], a3 = array[j3][1], a4 = array[j4][1];
          // open-ended (or A-5-4-3 / A-K-Q-J)
          if ((a1 - 1 === a2 || (a1 - 9 === a2 && a1 === 12)) && a2 - 1 === a3 && a3 - 1 === a4) {
            if (a1 === 12) {
              collect();
              if (temp === 2) {
                countBelow();
                if (temp1 >= 3) temp1 = 2;
                tempValue = 40012 + temp1 * 2000;
              } else {
                countBelow();
                if (temp1 >= 1) temp1 = 2;
                tempValue = 40012 + (temp1 + 1) * 1000;
              }
              breakLoop = true;
            } else {
              collect();
              if (temp === 2) {
                countBelow();
                if (temp1 >= 3) temp1 = 2;
                tempValue = 40000 + (temp1 + 2) * 2000 + array[j1][1];
              } else {
                countBelow();
                if (temp1 >= 1) temp1 = 2;
                fifthCard();
                tempValue = 40000 + (temp1 + 5) * 1000 + temp2 * 100 + array[j1][1];
              }
              breakLoop = true;
            }
          } else {
            // gutshot
            if ((a1 - 2 === a2 && a2 - 1 === a3 && a3 - 1 === a4) || (a1 - 1 === a2 && a2 - 2 === a3 && a3 - 1 === a4) || (a1 - 1 === a2 && a2 - 1 === a3 && a3 - 2 === a4)) {
              collect();
              if (temp === 2) {
                countBelow();
                if (temp1 >= 3) temp1 = 2;
                tempValue = 40000 + temp1 * 2000 + array[j1][1];
              } else {
                countBelow();
                if (temp1 >= 1) temp1 = 2;
                fifthCard();
                tempValue = 40000 + (temp1 + 1) * 1000 + temp2 * 100 + array[j1][1];
              }
              breakLoop = true;
            } else {
              // gutshot with the ace low
              if (a1 === 12 && ((a1 - 9 === a2 && a2 - 1 === a3 && a3 - 1 === a4) || (a1 - 9 === a2 && a2 - 1 === a3 && a3 - 2 === a4) || (a1 - 9 === a2 && a2 - 2 === a3 && a3 - 1 === a4) || (a1 - 10 === a2 && a2 - 1 === a3 && a3 - 1 === a4))) {
                collect();
                if (temp === 2) {
                  countBelow();
                  if (temp1 >= 3) temp1 = 2;
                  tempValue = 40012 + temp1 * 2000;
                } else {
                  countBelow();
                  if (temp1 >= 1) temp1 = 2;
                  tempValue = 40004 + (temp1 + 1) * 1000 + 100;
                }
                breakLoop = true;
              }
            }
          }
        }
      }
    }
  }

  // Three of a kind
  for (j1 = 0; j1 < 3; j1++) {
    if (array[j1][1] === array[j1 + 1][1] && array[j1][1] === array[j1 + 2][1]) {
      for (j2 = 0; j2 < 3; j2++) if (array[j1 + j2][2] <= 1) temp++;
      if (temp >= 1) {
        return 80000;
      } else {
        if (j1 === 0) return 30000 + array[j1 + 3][1];
        else return 30100 + array[0][1];
      }
    }
  }

  // Two pairs
  for (j1 = 0; j1 < 2; j1++) {
    for (j2 = j1 + 2; j2 < 4; j2++) {
      if (array[j1][1] === array[j1 + 1][1] && array[j2][1] === array[j2 + 1][1]) {
        for (j3 = 0; j3 < 2; j3++) {
          if (array[j1 + j3][2] <= 1) {
            temp2Array[temp] = array[j1 + j3][1];
            temp++;
          }
        }
        for (j3 = 0; j3 < 2; j3++) {
          if (array[j2 + j3][2] <= 1) {
            temp2Array[temp] = array[j2 + j3][1];
            temp++;
          }
        }
        if (temp === 2) {
          if (temp2Array[0] !== temp2Array[1]) {
            return 22200 + temp2Array[0];
          } else {
            if (temp2Array[0] === array[j1][1]) return 22100 + temp2Array[0];
            else return 22000 + temp2Array[0];
          }
        } else {
          if (temp2Array[0] === array[j1][1]) return 21100 + array[j1][1];
          else return 21000 + array[j2][1];
        }
      }
    }
  }

  temp = 0;
  temp1 = 0;
  temp2 = 0;

  // One pair
  for (j1 = 0; j1 < 4; j1++) {
    if (array[j1][1] === array[j1 + 1][1]) {
      if (!breakLoop) {
        for (j2 = 0; j2 < 2; j2++) if (array[j1 + j2][2] <= 1) temp++;
        if (temp === 2) {
          return 12000 + j1 * 100 + array[j1][1];
        } else {
          if (temp === 1) {
            for (j2 = 0; j2 < 5; j2++) {
              if (array[j2][2] >= 2 && array[j2][1] > array[j1][1]) temp1++;
            }
            return 11000 + temp1 * 100 + array[j1][1];
          } else {
            for (j2 = 0; j2 < 5; j2++) {
              if (array[j2][2] <= 1 && array[j2][1] > temp1) temp1 = array[j2][1];
            }
            for (j2 = 0; j2 < 5; j2++) {
              if (array[j2][2] >= 2 && array[j2][1] > temp1) temp2++;
            }
            if (temp2 === 2) temp2 = 1;
            if (temp2 === 3) temp2 = 2;
            return 10000 + temp2 * 100 + temp1;
          }
        }
      } else {
        if (Math.trunc(tempValue / 10000) === 4) {
          return Math.trunc(tempValue / 1000) * 1000 + 200 + (tempValue - Math.trunc(tempValue / 100) * 100);
        } else {
          return Math.trunc(tempValue / 10000) * 10000 + 3000 + (tempValue - Math.trunc(tempValue / 1000) * 1000);
        }
      }
    }
  }

  // High card
  if (!breakLoop) {
    for (j1 = 0; j1 < 5; j1++) {
      if (array[j1][2] <= 1) {
        temp2Array[temp] = array[j1][1];
        temp++;
      }
    }
    for (j1 = 0; j1 < 5; j1++) {
      if (temp2Array[1] > array[j1][1]) temp1++;
      if (temp2Array[0] > array[j1][1]) temp2++;
    }
    return temp1 * 1000 + temp2 * 100 + array[0][1];
  } else {
    return tempValue;
  }
}

/** LocalPlayer::turnCardsValue(int* cards); 1.1.2 calls it nowhere (only in commented-out code) */
export function turnCardsValue(cards: number[]): number {
  const array = makeArray(cards, 6);
  let j1: number, j2: number, j3: number, j4: number, j5: number;

  sortBySuit(array, 6);

  // Straight Flush, Royal Flush
  for (j1 = 0; j1 < 2; j1++) {
    if (array[j1][0] === array[j1 + 1][0] && array[j1][0] === array[j1 + 2][0] && array[j1][0] === array[j1 + 3][0] && array[j1][0] === array[j1 + 4][0]) {
      if (array[j1][1] - 4 === array[j1 + 4][1]) {
        return 100;
      } else {
        for (j2 = j1 + 1; j2 < 3; j2++) {
          if (array[j1][1] - 9 === array[j2][1] && array[j2][1] - 1 === array[j2 + 1][1] && array[j2 + 1][1] - 1 === array[j2 + 2][1] && array[j2 + 2][1] - 1 === array[j2 + 3][1] && array[j1][0] === array[j2 + 2][0] && array[j1][0] === array[j2 + 3][0]) {
            return 99;
          }
        }
      }
    }
  }

  // Flush
  for (j1 = 0; j1 < 2; j1++) {
    if (array[j1][0] === array[j1 + 1][0] && array[j1][0] === array[j1 + 2][0] && array[j1][0] === array[j1 + 3][0] && array[j1][0] === array[j1 + 4][0]) {
      return 70;
    }
  }

  // (the original's flush-draw loop here only breaks out of itself in every branch: no effect)

  sortByRank(array, 6);

  // Four of a kind
  for (j1 = 0; j1 < 3; j1++) {
    if (array[j1][1] === array[j1 + 1][1] && array[j1][1] === array[j1 + 2][1] && array[j1][1] === array[j1 + 3][1]) {
      return 100;
    }
  }

  // Straight, Full House
  for (j1 = 0; j1 < 6; j1++) {
    for (j2 = j1 + 1; j2 < 6; j2++) {
      for (j3 = j2 + 1; j3 < 6; j3++) {
        for (j4 = j3 + 1; j4 < 6; j4++) {
          for (j5 = j4 + 1; j5 < 6; j5++) {
            if ((array[j1][1] - 1 === array[j2][1] || array[j1][1] - 9 === array[j2][1]) && array[j2][1] - 1 === array[j3][1] && array[j3][1] - 1 === array[j4][1] && array[j4][1] - 1 === array[j5][1]) {
              return 70;
            }
            if ((array[j1][1] === array[j2][1] && array[j1][1] === array[j3][1] && array[j4][1] === array[j5][1]) || (array[j3][1] === array[j4][1] && array[j3][1] === array[j5][1] && array[j1][1] === array[j2][1])) {
              return 70;
            }
          }
        }
      }
    }
  }

  // (the original's straight-draw loops here only break out of the innermost loop: no effect)

  // Three of a kind
  for (j1 = 0; j1 < 4; j1++) {
    if (array[j1][1] === array[j1 + 1][1] && array[j1][1] === array[j1 + 2][1]) return 50;
  }

  // Two pairs
  for (j1 = 0; j1 < 3; j1++) {
    for (j2 = j1 + 2; j2 < 5; j2++) {
      if (array[j1][1] === array[j1 + 1][1] && array[j2][1] === array[j2 + 1][1]) return 40;
    }
  }

  // One pair
  for (j1 = 0; j1 < 5; j1++) {
    if (array[j1][1] === array[j1 + 1][1]) return 30;
  }

  return 10;
}
