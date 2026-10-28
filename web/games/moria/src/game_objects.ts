// game_objects.cpp: Game object management
import { config } from './config.ts';
import {
  LEVEL_MAX_OBJECTS, TREASURE_MAX_LEVELS, TV_BOW, TV_CHEST, TV_CLOSED_DOOR, TV_DIGGING, TV_DOWN_STAIR, TV_HAFTED, TV_HARD_ARMOR, TV_INVIS_TRAP,
  TV_OPEN_DOOR, TV_POLEARM, TV_RUBBLE, TV_SECRET_DOOR, TV_SOFT_ARMOR, TV_STAFF, TV_STORE_DOOR, TV_SWORD, TV_UP_STAIR, TV_VIS_TRAP,
} from './constants.ts';
import { type DungeonObject_t, game_objects } from './data_treasure.ts';
import { coordDistanceBetween, dungeonDeleteObject } from './dungeon.ts';
import { randomNumber } from './game.ts';
import { dg, game, py, sorted_objects, treasure_levels } from './globals.ts';
import { inventoryItemCopyTo } from './inventory.ts';
import { idiv, u8 } from './libc.ts';
import type { Coord_t } from './structs.ts';
import { drawDungeonPanel } from './ui.ts';
import { printMessage } from './ui_io.ts';

// int16_t sorted_objects[MAX_DUNGEON_OBJECTS] and int16_t treasure_levels[TREASURE_MAX_LEVELS + 1]
// are in globals.ts.

// If too many objects on floor level, delete some of them-RAK-
async function compactObjects(): Promise<void> {
  await printMessage('Compacting objects...');

  let counter = 0;
  let current_distance = 66;

  const coord: Coord_t = { y: 0, x: 0 };

  while (counter <= 0) {
    for (coord.y = 0; coord.y < dg.height; coord.y++) {
      for (coord.x = 0; coord.x < dg.width; coord.x++) {
        if (dg.floor[coord.y][coord.x].treasure_id !== 0 && coordDistanceBetween(coord, py.pos) > current_distance) {
          let chance: number;

          switch (game.treasure.list[dg.floor[coord.y][coord.x].treasure_id].category_id) {
            case TV_VIS_TRAP:
              chance = 15;
              break;
            case TV_INVIS_TRAP:
            case TV_RUBBLE:
            case TV_OPEN_DOOR:
            case TV_CLOSED_DOOR:
              chance = 5;
              break;
            case TV_UP_STAIR:
            case TV_DOWN_STAIR:
            case TV_STORE_DOOR:
              // Stairs, don't delete them.
              // Shop doors, don't delete them.
              chance = 0;
              break;
            case TV_SECRET_DOOR: // secret doors
              chance = 3;
              break;
            default:
              chance = 10;
          }
          if (randomNumber(100) <= chance) {
            dungeonDeleteObject(coord);
            counter++;
          }
        }
      }
    }

    if (counter === 0) {
      current_distance -= 6;
    }
  }

  if (current_distance < 66) {
    await drawDungeonPanel();
  }
}

// Gives pointer to next free space -RAK-
export async function popt(): Promise<number> {
  if (game.treasure.current_id === LEVEL_MAX_OBJECTS) {
    await compactObjects();
  }

  return game.treasure.current_id++;
}

// Pushes a record back onto free space list -RAK-
// `dungeonDeleteObject()` should always be called instead, unless the object
// in question is not in the dungeon, e.g. in store1.c and files.c
export function pusht(treasure_id: number): void {
  treasure_id = u8(treasure_id);

  if (treasure_id !== game.treasure.current_id - 1) {
    game.treasure.list[treasure_id].assign(game.treasure.list[game.treasure.current_id - 1]);

    // must change the treasure_id in the cave of the object just moved
    for (let y = 0; y < dg.height; y++) {
      for (let x = 0; x < dg.width; x++) {
        if (dg.floor[y][x].treasure_id === game.treasure.current_id - 1) {
          dg.floor[y][x].treasure_id = treasure_id;
        }
      }
    }
  }
  game.treasure.current_id--;

  inventoryItemCopyTo(config.dungeon.objects.OBJ_NOTHING, game.treasure.list[game.treasure.current_id]);
}

// Item too large to fit in chest? -DJG-
// Use a DungeonObject_t since the item has not yet been created
function itemBiggerThanChest(obj: DungeonObject_t): boolean {
  switch (obj.category_id) {
    case TV_CHEST:
    case TV_BOW:
    case TV_POLEARM:
    case TV_HARD_ARMOR:
    case TV_SOFT_ARMOR:
    case TV_STAFF:
      return true;
    case TV_HAFTED:
    case TV_SWORD:
    case TV_DIGGING:
      return obj.weight > 150;
    default:
      return false;
  }
}

// Returns the array number of a random object -RAK-
export function itemGetRandomObjectId(level: number, must_be_small: boolean): number {
  if (level === 0) {
    return randomNumber(treasure_levels[0]) - 1;
  }

  if (level >= TREASURE_MAX_LEVELS) {
    level = TREASURE_MAX_LEVELS;
  } else if (randomNumber(config.treasure.TREASURE_CHANCE_OF_GREAT_ITEM) === 1) {
    level = idiv(level * TREASURE_MAX_LEVELS, randomNumber(TREASURE_MAX_LEVELS)) + 1;
    if (level > TREASURE_MAX_LEVELS) {
      level = TREASURE_MAX_LEVELS;
    }
  }

  let object_id: number;

  // This code has been added to make it slightly more likely to get the
  // higher level objects.  Originally a uniform distribution over all
  // objects less than or equal to the dungeon level. This distribution
  // makes a level n objects occur approx 2/n% of the time on level n,
  // and 1/2n are 0th level.
  do {
    if (randomNumber(2) === 1) {
      object_id = randomNumber(treasure_levels[level]) - 1;
    } else {
      // Choose three objects, pick the highest level.
      object_id = randomNumber(treasure_levels[level]) - 1;

      let j = randomNumber(treasure_levels[level]) - 1;

      if (object_id < j) {
        object_id = j;
      }

      j = randomNumber(treasure_levels[level]) - 1;

      if (object_id < j) {
        object_id = j;
      }

      const found_level = game_objects[sorted_objects[object_id]].depth_first_found;

      if (found_level === 0) {
        object_id = randomNumber(treasure_levels[0]) - 1;
      } else {
        object_id = randomNumber(treasure_levels[found_level] - treasure_levels[found_level - 1]) - 1 + treasure_levels[found_level - 1];
      }
    }
  } while (must_be_small && itemBiggerThanChest(game_objects[sorted_objects[object_id]]));

  return object_id;
}
