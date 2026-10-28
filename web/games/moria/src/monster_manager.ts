// monster_manager.cpp: Monster management: generation, placement, cleanup
//
// The globals of this file (monsters, monster_levels, blank_monster, next_free_monster_id,
// monster_multiply_total) are in globals.ts.
import { config } from './config.ts';
import { MAX_OPEN_SPACE, MIN_CLOSED_SPACE, MON_MAX_LEVELS, MON_TOTAL_ALLOCATIONS } from './constants.ts';
import { creatures_list } from './data_creatures.ts';
import { diceRoll, maxDiceRoll } from './dice.ts';
import { coordDistanceBetween, coordInBounds, dungeonDeleteMonster, dungeonRemoveMonsterFromLevel } from './dungeon.ts';
import { randomNumber, randomNumberNormalDistribution } from './game.ts';
import { dg, game, globals, monster_levels, monsters, py } from './globals.ts';
import { abs, ord, u8 } from './libc.ts';
import type { Coord_t } from './structs.ts';
import { printMessage } from './ui_io.ts';

// Returns a pointer to next free space -RAK-
// Returns -1 if could not allocate a monster.
async function popm(): Promise<number> {
  if (globals.next_free_monster_id === MON_TOTAL_ALLOCATIONS) {
    if (!(await compactMonsters())) {
      return -1;
    }
  }
  return globals.next_free_monster_id++;
}

// Places a monster at given location -RAK-
export async function monsterPlaceNew(coord: Coord_t, creature_id: number, sleeping: boolean): Promise<boolean> {
  const monster_id = await popm();

  // Check for case where could not allocate space for the monster
  if (monster_id === -1) {
    return false;
  }

  const monster = monsters[monster_id];

  monster.pos.y = coord.y;
  monster.pos.x = coord.x;
  monster.creature_id = creature_id;

  if ((creatures_list[creature_id].defenses & config.monsters.defense.CD_MAX_HP) !== 0) {
    monster.hp = maxDiceRoll(creatures_list[creature_id].hit_die);
  } else {
    monster.hp = diceRoll(creatures_list[creature_id].hit_die);
  }

  // the creatures_list[] speed value is 10 greater, so that it can be a uint8_t
  monster.speed = creatures_list[creature_id].speed - 10 + py.flags.speed;
  monster.stunned_amount = 0;
  monster.distance_from_player = coordDistanceBetween(py.pos, coord);
  monster.lit = false;

  dg.floor[coord.y][coord.x].creature_id = u8(monster_id);

  if (sleeping) {
    if (creatures_list[creature_id].sleep_counter === 0) {
      monster.sleep_count = 0;
    } else {
      monster.sleep_count = creatures_list[creature_id].sleep_counter * 2 + randomNumber(creatures_list[creature_id].sleep_counter * 10);
    }
  } else {
    monster.sleep_count = 0;
  }

  return true;
}

// Places a monster at given location -RAK-
export async function monsterPlaceWinning(): Promise<void> {
  if (game.total_winner) {
    return;
  }

  const coord = { y: 0, x: 0 };

  do {
    coord.y = randomNumber(dg.height - 2);
    coord.x = randomNumber(dg.width - 2);
  } while (dg.floor[coord.y][coord.x].feature_id >= MIN_CLOSED_SPACE || //
    dg.floor[coord.y][coord.x].creature_id !== 0 || //
    dg.floor[coord.y][coord.x].treasure_id !== 0 || //
    coordDistanceBetween(coord, py.pos) <= config.monsters.MON_MAX_SIGHT //
  );

  const creature_id = randomNumber(config.monsters.MON_ENDGAME_MONSTERS) - 1 + monster_levels[MON_MAX_LEVELS];

  // TODO: duplicate code -MRC-
  // The following code is now exactly the same as monsterPlaceNew() except here
  // we `abort()` on failed placement, and do not set `monster->lit = false`.
  // Perhaps we can find a way to call `monsterPlaceNew()` instead of
  // duplicating everything here.

  const monster_id = await popm();

  // Check for case where could not allocate space for the win monster, this should never happen.
  if (monster_id === -1) {
    throw new Error('abort: monsterPlaceWinning: no space for the win monster');
  }

  const monster = monsters[monster_id];

  monster.pos.y = coord.y;
  monster.pos.x = coord.x;
  monster.creature_id = creature_id;

  if ((creatures_list[creature_id].defenses & config.monsters.defense.CD_MAX_HP) !== 0) {
    monster.hp = maxDiceRoll(creatures_list[creature_id].hit_die);
  } else {
    monster.hp = diceRoll(creatures_list[creature_id].hit_die);
  }

  // the creatures_list speed value is 10 greater, so that it can be a uint8_t
  monster.speed = creatures_list[creature_id].speed - 10 + py.flags.speed;
  monster.stunned_amount = 0;
  monster.distance_from_player = coordDistanceBetween(py.pos, coord);

  dg.floor[coord.y][coord.x].creature_id = u8(monster_id);

  monster.sleep_count = 0;
}

// Return a monster suitable to be placed at a given level. This
// makes high level monsters (up to the given level) slightly more
// common than low level monsters at any given level. -CJS-
function monsterGetOneSuitableForLevel(level: number): number {
  if (level === 0) {
    return randomNumber(monster_levels[0]) - 1;
  }

  if (level > MON_MAX_LEVELS) {
    level = MON_MAX_LEVELS;
  }

  if (randomNumber(config.monsters.MON_CHANCE_OF_NASTY) === 1) {
    const abs_distribution = abs(randomNumberNormalDistribution(0, 4));
    level += abs_distribution + 1;
    if (level > MON_MAX_LEVELS) {
      level = MON_MAX_LEVELS;
    }
  } else {
    // This code has been added to make it slightly more likely to get
    // the higher level monsters. Originally a uniform distribution over
    // all monsters of level less than or equal to the dungeon level.
    // This distribution makes a level n monster occur approx 2/n% of the
    // time on level n, and 1/n*n% are 1st level.
    const num = monster_levels[level] - monster_levels[0];
    let i = randomNumber(num) - 1;
    const j = randomNumber(num) - 1;
    if (j > i) {
      i = j;
    }
    level = creatures_list[i + monster_levels[0]].level;
  }

  return randomNumber(monster_levels[level] - monster_levels[level - 1]) - 1 + monster_levels[level - 1];
}

// Allocates a random monster -RAK-
export async function monsterPlaceNewWithinDistance(number: number, distance_from_source: number, sleeping: boolean): Promise<void> {
  const position = { y: 0, x: 0 };

  for (let i = 0; i < number; i++) {
    do {
      position.y = randomNumber(dg.height - 2);
      position.x = randomNumber(dg.width - 2);
    } while (dg.floor[position.y][position.x].feature_id >= MIN_CLOSED_SPACE || //
      dg.floor[position.y][position.x].creature_id !== 0 || //
      coordDistanceBetween(position, py.pos) <= distance_from_source //
    );

    const l = monsterGetOneSuitableForLevel(dg.current_level);

    // Dragons are always created sleeping here,
    // so as to give the player a sporting chance.
    if (creatures_list[l].sprite === ord('d') || creatures_list[l].sprite === ord('D')) {
      sleeping = true;
    }

    // Place_monster() should always return true here.
    // It does not matter if it fails though.
    await monsterPlaceNew(position, l, sleeping);
  }
}

async function placeMonsterAdjacentTo(monster_id: number, coord: Coord_t, slp: boolean): Promise<boolean> {
  let placed = false;

  const position = { y: 0, x: 0 };

  for (let i = 0; i <= 9; i++) {
    position.y = coord.y - 2 + randomNumber(3);
    position.x = coord.x - 2 + randomNumber(3);

    if (coordInBounds(position)) {
      if (dg.floor[position.y][position.x].feature_id <= MAX_OPEN_SPACE && dg.floor[position.y][position.x].creature_id === 0) {
        // Place_monster() should always return true here.
        if (!(await monsterPlaceNew(position, monster_id, slp))) {
          return false;
        }

        coord.y = position.y;
        coord.x = position.x;

        placed = true;
        i = 9;
      }
    }
  }

  return placed;
}

// Places creature adjacent to given location -RAK-
export async function monsterSummon(coord: Coord_t, sleeping: boolean): Promise<boolean> {
  const monster_id = monsterGetOneSuitableForLevel(dg.current_level + config.monsters.MON_SUMMONED_LEVEL_ADJUST);
  return placeMonsterAdjacentTo(monster_id, coord, sleeping);
}

// Places undead adjacent to given location -RAK-
export async function monsterSummonUndead(coord: Coord_t): Promise<boolean> {
  let monster_id: number;
  let max_levels = monster_levels[MON_MAX_LEVELS];

  do {
    monster_id = randomNumber(max_levels) - 1;
    for (let i = 0; i <= 19;) {
      if ((creatures_list[monster_id].defenses & config.monsters.defense.CD_UNDEAD) !== 0) {
        i = 20;
        max_levels = 0;
      } else {
        monster_id++;
        if (monster_id > max_levels) {
          i = 20;
        } else {
          i++;
        }
      }
    }
  } while (max_levels !== 0);

  return placeMonsterAdjacentTo(monster_id, coord, false);
}

// Compact monsters -RAK-
// Return true if any monsters were deleted, false if could not delete any monsters.
export async function compactMonsters(): Promise<boolean> {
  await printMessage('Compacting monsters...');

  let cur_dis = 66;
  let delete_any = false;

  while (!delete_any) {
    for (let i = globals.next_free_monster_id - 1; i >= config.monsters.MON_MIN_INDEX_ID; i--) {
      if (cur_dis < monsters[i].distance_from_player && randomNumber(3) === 1) {
        if ((creatures_list[monsters[i].creature_id].movement & config.monsters.move.CM_WIN) !== 0) {
          // Never compact away the Balrog!!
        } else if (globals.hack_monptr < i) {
          // In case this is called from within updateMonsters().
          // This is a horrible hack, the monsters/updateMonsters() code needs to be rewritten.
          dungeonDeleteMonster(i);
          delete_any = true;
        } else {
          // dungeonRemoveMonsterFromLevel() does not decrement next_free_monster_id,
          // so don't set delete_any if this was called.
          dungeonRemoveMonsterFromLevel(i);
        }
      }
    }

    if (!delete_any) {
      cur_dis -= 6;

      // Can't delete any monsters, return failure.
      if (cur_dis < 0) {
        return false;
      }
    }
  }

  return true;
}
