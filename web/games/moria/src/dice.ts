// dice.cpp
import { randomNumber } from './game.ts';

/** Dice_t as a parameter: the struct (structs.ts) or a data table's entry */
export interface DiceLike {
  readonly dice: number;
  readonly sides: number;
}

// generates damage for 2d6 style dice rolls
export function diceRoll(dice: DiceLike): number {
  let sum = 0;
  for (let i = 0; i < dice.dice; i++) {
    sum += randomNumber(dice.sides);
  }
  return sum;
}

// Returns max dice roll value -RAK-
export function maxDiceRoll(dice: DiceLike): number {
  return dice.dice * dice.sides;
}
