// dungeon_generate.cpp: Initialize/create a dungeon or town level
import { config } from './config.ts';
import {
  MAX_CAVE_FLOOR, MAX_HEIGHT, MAX_OPEN_SPACE, MAX_WIDTH, MIN_CAVE_WALL, MIN_CLOSED_SPACE, QUART_HEIGHT, QUART_WIDTH, SCREEN_HEIGHT,
  SCREEN_WIDTH, TILE_BLOCKED_FLOOR, TILE_BOUNDARY_WALL, TILE_CORR_FLOOR, TILE_DARK_FLOOR, TILE_GRANITE_WALL, TILE_LIGHT_FLOOR,
  TILE_MAGMA_WALL, TILE_NULL_WALL, TILE_QUARTZ_WALL, TMP1_WALL, TMP2_WALL,
} from './constants.ts';
import {
  coordCorridorWallsNextTo, coordInBounds, coordWallsNextTo, dungeonAllocateAndPlaceObject, dungeonDeleteObject, dungeonPlaceGold,
  dungeonPlaceRandomObjectAt, dungeonPlaceRandomObjectNear, dungeonSetTrap,
} from './dungeon.ts';
import { randomNumber, randomNumberNormalDistribution, seedResetToOldSeed, seedSet } from './game.ts';
import { popt } from './game_objects.ts';
import { blank_monster, dg, game, globals, monsters, py } from './globals.ts';
import { inventoryItemCopyTo } from './inventory.ts';
import { i16, idiv, ref, type Ref, u8 } from './libc.ts';
import { monsterPlaceNewWithinDistance, monsterPlaceWinning, monsterSummon } from './monster_manager.ts';
import { playerMovePosition } from './player.ts';
import { onReset } from './reset.ts';
import { storeMaintenance } from './store_inventory.ts';
import type { Coord_t, Tile_t } from './structs.ts';

let doors_tk: Coord_t[] = Array.from({ length: 100 }, () => ({ y: 0, x: 0 }));
let door_index = 0;

onReset(() => {
  doors_tk = Array.from({ length: 100 }, () => ({ y: 0, x: 0 }));
  door_index = 0;
});

// Returns a Dark/Light floor tile based on dg.current_level, and random number
function dungeonFloorTileForLevel(): number {
  if (dg.current_level <= randomNumber(25)) {
    return TILE_LIGHT_FLOOR;
  }
  return TILE_DARK_FLOOR;
}

// Always picks a correct direction
function pickCorrectDirection(vertical: Ref<number>, horizontal: Ref<number>, start: Coord_t, end: Coord_t): void {
  if (start.y < end.y) {
    vertical.v = 1;
  } else if (start.y === end.y) {
    vertical.v = 0;
  } else {
    vertical.v = -1;
  }

  if (start.x < end.x) {
    horizontal.v = 1;
  } else if (start.x === end.x) {
    horizontal.v = 0;
  } else {
    horizontal.v = -1;
  }

  if (vertical.v !== 0 && horizontal.v !== 0) {
    if (randomNumber(2) === 1) {
      vertical.v = 0;
    } else {
      horizontal.v = 0;
    }
  }
}

// Chance of wandering direction
function chanceOfRandomDirection(vertical: Ref<number>, horizontal: Ref<number>): void {
  const direction = randomNumber(4);

  if (direction < 3) {
    horizontal.v = 0;
    vertical.v = -3 + (direction << 1); // direction=1 -> y=-1; direction=2 -> y=1
  } else {
    vertical.v = 0;
    horizontal.v = -7 + (direction << 1); // direction=3 -> x=-1; direction=4 -> x=1
  }
}

// Blanks out entire cave -RAK-
function dungeonBlankEntireCave(): void {
  // memset((char *) &dg.floor[0][0], 0, sizeof(dg.floor));
  for (let y = 0; y < MAX_HEIGHT; y++) {
    for (let x = 0; x < MAX_WIDTH; x++) {
      const tile = dg.floor[y][x];
      tile.creature_id = 0;
      tile.treasure_id = 0;
      tile.feature_id = 0;
      tile.perma_lit_room = false;
      tile.field_mark = false;
      tile.permanent_light = false;
      tile.temporary_light = false;
    }
  }
}

// Fills in empty spots with desired rock -RAK-
// Note: 9 is a temporary value.
function dungeonFillEmptyTilesWith(rock_type: number): void {
  rock_type = u8(rock_type);

  // no need to check the border of the cave
  for (let y = dg.height - 2; y > 0; y--) {
    let x = 1;

    for (let j = dg.width - 2; j > 0; j--) {
      if (dg.floor[y][x].feature_id === TILE_NULL_WALL || dg.floor[y][x].feature_id === TMP1_WALL || dg.floor[y][x].feature_id === TMP2_WALL) {
        dg.floor[y][x].feature_id = rock_type;
      }
      x++;
    }
  }
}

// Places indestructible rock around edges of dungeon -RAK-
function dungeonPlaceBoundaryWalls(): void {
  // put permanent wall on leftmost row and rightmost row
  // (left_ptr walks dg.floor[i][0], right_ptr walks dg.floor[i][dg.width - 1])
  for (let i = 0; i < dg.height; i++) {
    dg.floor[i][0].feature_id = TILE_BOUNDARY_WALL;

    dg.floor[i][dg.width - 1].feature_id = TILE_BOUNDARY_WALL;
  }

  // put permanent wall on top row and bottom row
  // (top_ptr walks dg.floor[0][i], bottom_ptr walks dg.floor[dg.height - 1][i])
  for (let i = 0; i < dg.width; i++) {
    dg.floor[0][i].feature_id = TILE_BOUNDARY_WALL;

    dg.floor[dg.height - 1][i].feature_id = TILE_BOUNDARY_WALL;
  }
}

// Places "streamers" of rock through dungeon -RAK-
async function dungeonPlaceStreamerRock(rock_type: number, chance_of_treasure: number): Promise<void> {
  rock_type = u8(rock_type);

  // Choose starting point and direction
  const coord: Coord_t = {
    y: idiv(dg.height, 2) + 11 - randomNumber(23),
    x: idiv(dg.width, 2) + 16 - randomNumber(33),
  };

  // Get random direction. Numbers 1-4, 6-9
  let dir = randomNumber(8);
  if (dir > 4) {
    dir += 1;
  }

  // Place streamer into dungeon
  const t1 = 2 * config.dungeon.DUN_STREAMER_WIDTH + 1; // Constants
  const t2 = config.dungeon.DUN_STREAMER_WIDTH + 1;

  do {
    for (let i = 0; i < config.dungeon.DUN_STREAMER_DENSITY; i++) {
      const spot: Coord_t = {
        y: coord.y + randomNumber(t1) - t2,
        x: coord.x + randomNumber(t1) - t2,
      };

      if (coordInBounds(spot)) {
        if (dg.floor[spot.y][spot.x].feature_id === TILE_GRANITE_WALL) {
          dg.floor[spot.y][spot.x].feature_id = rock_type;

          if (randomNumber(chance_of_treasure) === 1) {
            await dungeonPlaceGold(spot);
          }
        }
      }
    }
  } while (playerMovePosition(dir, coord));
}

async function dungeonPlaceOpenDoor(coord: Coord_t): Promise<void> {
  const cur_pos = await popt();
  dg.floor[coord.y][coord.x].treasure_id = u8(cur_pos);
  inventoryItemCopyTo(config.dungeon.objects.OBJ_OPEN_DOOR, game.treasure.list[cur_pos]);
  dg.floor[coord.y][coord.x].feature_id = TILE_CORR_FLOOR;
}

async function dungeonPlaceBrokenDoor(coord: Coord_t): Promise<void> {
  const cur_pos = await popt();
  dg.floor[coord.y][coord.x].treasure_id = u8(cur_pos);
  inventoryItemCopyTo(config.dungeon.objects.OBJ_OPEN_DOOR, game.treasure.list[cur_pos]);
  dg.floor[coord.y][coord.x].feature_id = TILE_CORR_FLOOR;
  game.treasure.list[cur_pos].misc_use = 1;
}

async function dungeonPlaceClosedDoor(coord: Coord_t): Promise<void> {
  const cur_pos = await popt();
  dg.floor[coord.y][coord.x].treasure_id = u8(cur_pos);
  inventoryItemCopyTo(config.dungeon.objects.OBJ_CLOSED_DOOR, game.treasure.list[cur_pos]);
  dg.floor[coord.y][coord.x].feature_id = TILE_BLOCKED_FLOOR;
}

async function dungeonPlaceLockedDoor(coord: Coord_t): Promise<void> {
  const cur_pos = await popt();
  dg.floor[coord.y][coord.x].treasure_id = u8(cur_pos);
  inventoryItemCopyTo(config.dungeon.objects.OBJ_CLOSED_DOOR, game.treasure.list[cur_pos]);
  dg.floor[coord.y][coord.x].feature_id = TILE_BLOCKED_FLOOR;
  game.treasure.list[cur_pos].misc_use = i16(randomNumber(10) + 10);
}

async function dungeonPlaceStuckDoor(coord: Coord_t): Promise<void> {
  const cur_pos = await popt();
  dg.floor[coord.y][coord.x].treasure_id = u8(cur_pos);
  inventoryItemCopyTo(config.dungeon.objects.OBJ_CLOSED_DOOR, game.treasure.list[cur_pos]);
  dg.floor[coord.y][coord.x].feature_id = TILE_BLOCKED_FLOOR;
  game.treasure.list[cur_pos].misc_use = i16(-randomNumber(10) - 10);
}

async function dungeonPlaceSecretDoor(coord: Coord_t): Promise<void> {
  const cur_pos = await popt();
  dg.floor[coord.y][coord.x].treasure_id = u8(cur_pos);
  inventoryItemCopyTo(config.dungeon.objects.OBJ_SECRET_DOOR, game.treasure.list[cur_pos]);
  dg.floor[coord.y][coord.x].feature_id = TILE_BLOCKED_FLOOR;
}

async function dungeonPlaceDoor(coord: Coord_t): Promise<void> {
  let door_type = randomNumber(3);

  if (door_type === 1) {
    if (randomNumber(4) === 1) {
      await dungeonPlaceBrokenDoor(coord);
    } else {
      await dungeonPlaceOpenDoor(coord);
    }
  } else if (door_type === 2) {
    door_type = randomNumber(12);

    if (door_type > 3) {
      await dungeonPlaceClosedDoor(coord);
    } else if (door_type === 3) {
      await dungeonPlaceStuckDoor(coord);
    } else {
      await dungeonPlaceLockedDoor(coord);
    }
  } else {
    await dungeonPlaceSecretDoor(coord);
  }
}

// Place an up staircase at given y, x -RAK-
async function dungeonPlaceUpStairs(coord: Coord_t): Promise<void> {
  if (dg.floor[coord.y][coord.x].treasure_id !== 0) {
    dungeonDeleteObject(coord);
  }

  const cur_pos = await popt();
  dg.floor[coord.y][coord.x].treasure_id = u8(cur_pos);
  inventoryItemCopyTo(config.dungeon.objects.OBJ_UP_STAIR, game.treasure.list[cur_pos]);
}

// Place a down staircase at given y, x -RAK-
async function dungeonPlaceDownStairs(coord: Coord_t): Promise<void> {
  if (dg.floor[coord.y][coord.x].treasure_id !== 0) {
    dungeonDeleteObject(coord);
  }

  const cur_pos = await popt();
  dg.floor[coord.y][coord.x].treasure_id = u8(cur_pos);
  inventoryItemCopyTo(config.dungeon.objects.OBJ_DOWN_STAIR, game.treasure.list[cur_pos]);
}

// Places a staircase 1=up, 2=down -RAK-
async function dungeonPlaceStairs(stair_type: number, number: number, walls: number): Promise<void> {
  const coord1: Coord_t = { y: 0, x: 0 };
  const coord2: Coord_t = { y: 0, x: 0 };

  for (let i = 0; i < number; i++) {
    let placed = false;

    while (!placed) {
      let j = 0;

      do {
        // Note:
        // don't let y1/x1 be zero,
        // don't let y2/x2 be equal to dg.height-1/dg.width-1,
        // these values are always BOUNDARY_ROCK.
        coord1.y = randomNumber(dg.height - 14);
        coord1.x = randomNumber(dg.width - 14);
        coord2.y = coord1.y + 12;
        coord2.x = coord1.x + 12;

        do {
          do {
            if (dg.floor[coord1.y][coord1.x].feature_id <= MAX_OPEN_SPACE && dg.floor[coord1.y][coord1.x].treasure_id === 0 && coordWallsNextTo(coord1) >= walls) {
              placed = true;
              if (stair_type === 1) {
                await dungeonPlaceUpStairs({ y: coord1.y, x: coord1.x });
              } else {
                await dungeonPlaceDownStairs({ y: coord1.y, x: coord1.x });
              }
            }
            coord1.x++;
          } while (coord1.x !== coord2.x && !placed);

          coord1.x = coord2.x - 12;
          coord1.y++;
        } while (coord1.y !== coord2.y && !placed);

        j++;
      } while (!placed && j <= 30);

      walls--;
    }
  }
}

// Place a trap with a given displacement of point -RAK-
async function dungeonPlaceVaultTrap(coord: Coord_t, displacement: Coord_t, number: number): Promise<void> {
  const spot: Coord_t = { y: 0, x: 0 };

  for (let i = 0; i < number; i++) {
    let placed = false;

    for (let count = 0; !placed && count <= 5; count++) {
      spot.y = coord.y - displacement.y - 1 + randomNumber(2 * displacement.y + 1);
      spot.x = coord.x - displacement.x - 1 + randomNumber(2 * displacement.x + 1);

      if (dg.floor[spot.y][spot.x].feature_id !== TILE_NULL_WALL && dg.floor[spot.y][spot.x].feature_id <= MAX_CAVE_FLOOR && dg.floor[spot.y][spot.x].treasure_id === 0) {
        await dungeonSetTrap(spot, randomNumber(config.dungeon.objects.MAX_TRAPS) - 1);
        placed = true;
      }
    }
  }
}

// Place a trap with a given displacement of point -RAK-
async function dungeonPlaceVaultMonster(coord: Coord_t, number: number): Promise<void> {
  const spot: Coord_t = { y: 0, x: 0 };

  for (let i = 0; i < number; i++) {
    spot.y = coord.y;
    spot.x = coord.x;
    await monsterSummon(spot, true);
  }
}

// Builds a room at a row, column coordinate -RAK-
function dungeonBuildRoom(coord: Coord_t): void {
  const floor = dungeonFloorTileForLevel();

  const height = coord.y - randomNumber(4);
  const depth = coord.y + randomNumber(3);
  const left = coord.x - randomNumber(11);
  const right = coord.x + randomNumber(11);

  // the x dim of rooms tends to be much larger than the y dim,
  // so don't bother rewriting the y loop.

  let y: number, x: number;

  for (y = height; y <= depth; y++) {
    for (x = left; x <= right; x++) {
      dg.floor[y][x].feature_id = floor;
      dg.floor[y][x].perma_lit_room = true;
    }
  }

  for (y = height - 1; y <= depth + 1; y++) {
    dg.floor[y][left - 1].feature_id = TILE_GRANITE_WALL;
    dg.floor[y][left - 1].perma_lit_room = true;

    dg.floor[y][right + 1].feature_id = TILE_GRANITE_WALL;
    dg.floor[y][right + 1].perma_lit_room = true;
  }

  for (x = left; x <= right; x++) {
    dg.floor[height - 1][x].feature_id = TILE_GRANITE_WALL;
    dg.floor[height - 1][x].perma_lit_room = true;

    dg.floor[depth + 1][x].feature_id = TILE_GRANITE_WALL;
    dg.floor[depth + 1][x].perma_lit_room = true;
  }
}

// Builds a room at a row, column coordinate -RAK-
// Type 1 unusual rooms are several overlapping rectangular ones
function dungeonBuildRoomOverlappingRectangles(coord: Coord_t): void {
  const floor = dungeonFloorTileForLevel();

  const limit = 1 + randomNumber(2);

  for (let count = 0; count < limit; count++) {
    const height = coord.y - randomNumber(4);
    const depth = coord.y + randomNumber(3);
    const left = coord.x - randomNumber(11);
    const right = coord.x + randomNumber(11);

    // the x dim of rooms tends to be much larger than the y dim,
    // so don't bother rewriting the y loop.

    let y: number, x: number;

    for (y = height; y <= depth; y++) {
      for (x = left; x <= right; x++) {
        dg.floor[y][x].feature_id = floor;
        dg.floor[y][x].perma_lit_room = true;
      }
    }
    for (y = height - 1; y <= depth + 1; y++) {
      if (dg.floor[y][left - 1].feature_id !== floor) {
        dg.floor[y][left - 1].feature_id = TILE_GRANITE_WALL;
        dg.floor[y][left - 1].perma_lit_room = true;
      }

      if (dg.floor[y][right + 1].feature_id !== floor) {
        dg.floor[y][right + 1].feature_id = TILE_GRANITE_WALL;
        dg.floor[y][right + 1].perma_lit_room = true;
      }
    }

    for (x = left; x <= right; x++) {
      if (dg.floor[height - 1][x].feature_id !== floor) {
        dg.floor[height - 1][x].feature_id = TILE_GRANITE_WALL;
        dg.floor[height - 1][x].perma_lit_room = true;
      }

      if (dg.floor[depth + 1][x].feature_id !== floor) {
        dg.floor[depth + 1][x].feature_id = TILE_GRANITE_WALL;
        dg.floor[depth + 1][x].perma_lit_room = true;
      }
    }
  }
}

async function dungeonPlaceRandomSecretDoor(coord: Coord_t, depth: number, height: number, left: number, right: number): Promise<void> {
  switch (randomNumber(4)) {
    case 1:
      await dungeonPlaceSecretDoor({ y: height - 1, x: coord.x });
      break;
    case 2:
      await dungeonPlaceSecretDoor({ y: depth + 1, x: coord.x });
      break;
    case 3:
      await dungeonPlaceSecretDoor({ y: coord.y, x: left - 1 });
      break;
    default:
      await dungeonPlaceSecretDoor({ y: coord.y, x: right + 1 });
      break;
  }
}

function dungeonPlaceVault(coord: Coord_t): void {
  for (let y = coord.y - 1; y <= coord.y + 1; y++) {
    dg.floor[y][coord.x - 1].feature_id = TMP1_WALL;
    dg.floor[y][coord.x + 1].feature_id = TMP1_WALL;
  }

  dg.floor[coord.y - 1][coord.x].feature_id = TMP1_WALL;
  dg.floor[coord.y + 1][coord.x].feature_id = TMP1_WALL;
}

async function dungeonPlaceTreasureVault(coord: Coord_t, depth: number, height: number, left: number, right: number): Promise<void> {
  await dungeonPlaceRandomSecretDoor(coord, depth, height, left, right);
  dungeonPlaceVault(coord);

  // Place a locked door
  const offset = randomNumber(4);
  if (offset < 3) {
    // 1 -> y-1; 2 -> y+1
    await dungeonPlaceLockedDoor({ y: coord.y - 3 + (offset << 1), x: coord.x });
  } else {
    await dungeonPlaceLockedDoor({ y: coord.y, x: coord.x - 7 + (offset << 1) });
  }
}

function dungeonPlaceInnerPillars(coord: Coord_t): void {
  let y: number, x: number;

  for (y = coord.y - 1; y <= coord.y + 1; y++) {
    for (x = coord.x - 1; x <= coord.x + 1; x++) {
      dg.floor[y][x].feature_id = TMP1_WALL;
    }
  }

  if (randomNumber(2) !== 1) {
    return;
  }

  const offset = randomNumber(2);

  for (y = coord.y - 1; y <= coord.y + 1; y++) {
    for (x = coord.x - 5 - offset; x <= coord.x - 3 - offset; x++) {
      dg.floor[y][x].feature_id = TMP1_WALL;
    }
  }

  for (y = coord.y - 1; y <= coord.y + 1; y++) {
    for (x = coord.x + 3 + offset; x <= coord.x + 5 + offset; x++) {
      dg.floor[y][x].feature_id = TMP1_WALL;
    }
  }
}

function dungeonPlaceMazeInsideRoom(depth: number, height: number, left: number, right: number): void {
  for (let y = height; y <= depth; y++) {
    for (let x = left; x <= right; x++) {
      if ((0x1 & (x + y)) !== 0) {
        dg.floor[y][x].feature_id = TMP1_WALL;
      }
    }
  }
}

async function dungeonPlaceFourSmallRooms(coord: Coord_t, depth: number, height: number, left: number, right: number): Promise<void> {
  for (let y = height; y <= depth; y++) {
    dg.floor[y][coord.x].feature_id = TMP1_WALL;
  }

  for (let x = left; x <= right; x++) {
    dg.floor[coord.y][x].feature_id = TMP1_WALL;
  }

  // place random secret door
  if (randomNumber(2) === 1) {
    const offset = randomNumber(10);
    await dungeonPlaceSecretDoor({ y: height - 1, x: coord.x - offset });
    await dungeonPlaceSecretDoor({ y: height - 1, x: coord.x + offset });
    await dungeonPlaceSecretDoor({ y: depth + 1, x: coord.x - offset });
    await dungeonPlaceSecretDoor({ y: depth + 1, x: coord.x + offset });
  } else {
    const offset = randomNumber(3);
    await dungeonPlaceSecretDoor({ y: coord.y + offset, x: left - 1 });
    await dungeonPlaceSecretDoor({ y: coord.y - offset, x: left - 1 });
    await dungeonPlaceSecretDoor({ y: coord.y + offset, x: right + 1 });
    await dungeonPlaceSecretDoor({ y: coord.y - offset, x: right + 1 });
  }
}

// Type 2 unusual rooms all have an inner room:
//   1 - Just an inner room with one door
//   2 - An inner room within an inner room
//   3 - An inner room with pillar(s)
//   4 - Inner room has a maze
//   5 - A set of four inner rooms
const InnerRoomTypes = {
  Plain: 1,
  TreasureVault: 2,
  Pillars: 3,
  Maze: 4,
  FourSmallRooms: 5,
} as const;

// Builds a type 2 unusual room at a row, column coordinate -RAK-
async function dungeonBuildRoomWithInnerRooms(coord: Coord_t): Promise<void> {
  const floor = dungeonFloorTileForLevel();

  let height = coord.y - 4;
  let depth = coord.y + 4;
  let left = coord.x - 11;
  let right = coord.x + 11;

  // the x dim of rooms tends to be much larger than the y dim,
  // so don't bother rewriting the y loop.

  for (let i = height; i <= depth; i++) {
    for (let j = left; j <= right; j++) {
      dg.floor[i][j].feature_id = floor;
      dg.floor[i][j].perma_lit_room = true;
    }
  }

  for (let i = height - 1; i <= depth + 1; i++) {
    dg.floor[i][left - 1].feature_id = TILE_GRANITE_WALL;
    dg.floor[i][left - 1].perma_lit_room = true;

    dg.floor[i][right + 1].feature_id = TILE_GRANITE_WALL;
    dg.floor[i][right + 1].perma_lit_room = true;
  }

  for (let i = left; i <= right; i++) {
    dg.floor[height - 1][i].feature_id = TILE_GRANITE_WALL;
    dg.floor[height - 1][i].perma_lit_room = true;

    dg.floor[depth + 1][i].feature_id = TILE_GRANITE_WALL;
    dg.floor[depth + 1][i].perma_lit_room = true;
  }

  // The inner room
  height = height + 2;
  depth = depth - 2;
  left = left + 2;
  right = right - 2;

  for (let i = height - 1; i <= depth + 1; i++) {
    dg.floor[i][left - 1].feature_id = TMP1_WALL;
    dg.floor[i][right + 1].feature_id = TMP1_WALL;
  }

  for (let i = left; i <= right; i++) {
    dg.floor[height - 1][i].feature_id = TMP1_WALL;
    dg.floor[depth + 1][i].feature_id = TMP1_WALL;
  }

  // Inner room variations
  switch (randomNumber(5)) {
    case InnerRoomTypes.Plain:
      await dungeonPlaceRandomSecretDoor(coord, depth, height, left, right);
      await dungeonPlaceVaultMonster(coord, 1);
      break;
    case InnerRoomTypes.TreasureVault:
      await dungeonPlaceTreasureVault(coord, depth, height, left, right);

      // Guard the treasure well
      await dungeonPlaceVaultMonster(coord, 2 + randomNumber(3));

      // If the monsters don't get 'em.
      await dungeonPlaceVaultTrap(coord, { y: 4, x: 10 }, 2 + randomNumber(3));
      break;
    case InnerRoomTypes.Pillars:
      await dungeonPlaceRandomSecretDoor(coord, depth, height, left, right);

      dungeonPlaceInnerPillars(coord);

      if (randomNumber(3) !== 1) {
        break;
      }

      // Inner rooms
      for (let i = coord.x - 5; i <= coord.x + 5; i++) {
        dg.floor[coord.y - 1][i].feature_id = TMP1_WALL;
        dg.floor[coord.y + 1][i].feature_id = TMP1_WALL;
      }
      dg.floor[coord.y][coord.x - 5].feature_id = TMP1_WALL;
      dg.floor[coord.y][coord.x + 5].feature_id = TMP1_WALL;

      await dungeonPlaceSecretDoor({ y: coord.y - 3 + (randomNumber(2) << 1), x: coord.x - 3 });
      await dungeonPlaceSecretDoor({ y: coord.y - 3 + (randomNumber(2) << 1), x: coord.x + 3 });

      if (randomNumber(3) === 1) {
        await dungeonPlaceRandomObjectAt({ y: coord.y, x: coord.x - 2 }, false);
      }

      if (randomNumber(3) === 1) {
        await dungeonPlaceRandomObjectAt({ y: coord.y, x: coord.x + 2 }, false);
      }

      await dungeonPlaceVaultMonster({ y: coord.y, x: coord.x - 2 }, randomNumber(2));
      await dungeonPlaceVaultMonster({ y: coord.y, x: coord.x + 2 }, randomNumber(2));
      break;
    case InnerRoomTypes.Maze:
      await dungeonPlaceRandomSecretDoor(coord, depth, height, left, right);

      dungeonPlaceMazeInsideRoom(depth, height, left, right);

      // Monsters just love mazes.
      await dungeonPlaceVaultMonster({ y: coord.y, x: coord.x - 5 }, randomNumber(3));
      await dungeonPlaceVaultMonster({ y: coord.y, x: coord.x + 5 }, randomNumber(3));

      // Traps make them entertaining.
      await dungeonPlaceVaultTrap({ y: coord.y, x: coord.x - 3 }, { y: 2, x: 8 }, randomNumber(3));
      await dungeonPlaceVaultTrap({ y: coord.y, x: coord.x + 3 }, { y: 2, x: 8 }, randomNumber(3));

      // Mazes should have some treasure too..
      for (let i = 0; i < 3; i++) {
        await dungeonPlaceRandomObjectNear(coord, 1);
      }
      break;
    case InnerRoomTypes.FourSmallRooms:
      await dungeonPlaceFourSmallRooms(coord, depth, height, left, right);

      // Treasure in each one.
      await dungeonPlaceRandomObjectNear(coord, 2 + randomNumber(2));

      // Gotta have some monsters.
      await dungeonPlaceVaultMonster({ y: coord.y + 2, x: coord.x - 4 }, randomNumber(2));
      await dungeonPlaceVaultMonster({ y: coord.y + 2, x: coord.x + 4 }, randomNumber(2));
      await dungeonPlaceVaultMonster({ y: coord.y - 2, x: coord.x - 4 }, randomNumber(2));
      await dungeonPlaceVaultMonster({ y: coord.y - 2, x: coord.x + 4 }, randomNumber(2));
      break;
    default:
      // All cases are handled, so this should never be reached!
      break;
  }
}

function dungeonPlaceLargeMiddlePillar(coord: Coord_t): void {
  for (let y = coord.y - 1; y <= coord.y + 1; y++) {
    for (let x = coord.x - 1; x <= coord.x + 1; x++) {
      dg.floor[y][x].feature_id = TMP1_WALL;
    }
  }
}

// Builds a room at a row, column coordinate -RAK-
// Type 3 unusual rooms are cross shaped
async function dungeonBuildRoomCrossShaped(coord: Coord_t): Promise<void> {
  const floor = dungeonFloorTileForLevel();

  let random_offset = 2 + randomNumber(2);

  let height = coord.y - random_offset;
  let depth = coord.y + random_offset;
  let left = coord.x - 1;
  let right = coord.x + 1;

  for (let i = height; i <= depth; i++) {
    for (let j = left; j <= right; j++) {
      dg.floor[i][j].feature_id = floor;
      dg.floor[i][j].perma_lit_room = true;
    }
  }

  for (let i = height - 1; i <= depth + 1; i++) {
    dg.floor[i][left - 1].feature_id = TILE_GRANITE_WALL;
    dg.floor[i][left - 1].perma_lit_room = true;

    dg.floor[i][right + 1].feature_id = TILE_GRANITE_WALL;
    dg.floor[i][right + 1].perma_lit_room = true;
  }

  for (let i = left; i <= right; i++) {
    dg.floor[height - 1][i].feature_id = TILE_GRANITE_WALL;
    dg.floor[height - 1][i].perma_lit_room = true;

    dg.floor[depth + 1][i].feature_id = TILE_GRANITE_WALL;
    dg.floor[depth + 1][i].perma_lit_room = true;
  }

  random_offset = 2 + randomNumber(9);

  height = coord.y - 1;
  depth = coord.y + 1;
  left = coord.x - random_offset;
  right = coord.x + random_offset;

  for (let i = height; i <= depth; i++) {
    for (let j = left; j <= right; j++) {
      dg.floor[i][j].feature_id = floor;
      dg.floor[i][j].perma_lit_room = true;
    }
  }

  for (let i = height - 1; i <= depth + 1; i++) {
    if (dg.floor[i][left - 1].feature_id !== floor) {
      dg.floor[i][left - 1].feature_id = TILE_GRANITE_WALL;
      dg.floor[i][left - 1].perma_lit_room = true;
    }

    if (dg.floor[i][right + 1].feature_id !== floor) {
      dg.floor[i][right + 1].feature_id = TILE_GRANITE_WALL;
      dg.floor[i][right + 1].perma_lit_room = true;
    }
  }

  for (let i = left; i <= right; i++) {
    if (dg.floor[height - 1][i].feature_id !== floor) {
      dg.floor[height - 1][i].feature_id = TILE_GRANITE_WALL;
      dg.floor[height - 1][i].perma_lit_room = true;
    }

    if (dg.floor[depth + 1][i].feature_id !== floor) {
      dg.floor[depth + 1][i].feature_id = TILE_GRANITE_WALL;
      dg.floor[depth + 1][i].perma_lit_room = true;
    }
  }

  // Special features.
  switch (randomNumber(4)) {
    case 1: // Large middle pillar
      dungeonPlaceLargeMiddlePillar(coord);
      break;
    case 2: // Inner treasure vault
      dungeonPlaceVault(coord);

      // Place a secret door
      random_offset = randomNumber(4);
      if (random_offset < 3) {
        await dungeonPlaceSecretDoor({ y: coord.y - 3 + (random_offset << 1), x: coord.x });
      } else {
        await dungeonPlaceSecretDoor({ y: coord.y, x: coord.x - 7 + (random_offset << 1) });
      }

      // Place a treasure in the vault
      await dungeonPlaceRandomObjectAt(coord, false);

      // Let's guard the treasure well.
      await dungeonPlaceVaultMonster(coord, 2 + randomNumber(2));

      // Traps naturally
      await dungeonPlaceVaultTrap(coord, { y: 4, x: 4 }, 1 + randomNumber(3));
      break;
    case 3:
      if (randomNumber(3) === 1) {
        dg.floor[coord.y - 1][coord.x - 2].feature_id = TMP1_WALL;
        dg.floor[coord.y + 1][coord.x - 2].feature_id = TMP1_WALL;
        dg.floor[coord.y - 1][coord.x + 2].feature_id = TMP1_WALL;
        dg.floor[coord.y + 1][coord.x + 2].feature_id = TMP1_WALL;
        dg.floor[coord.y - 2][coord.x - 1].feature_id = TMP1_WALL;
        dg.floor[coord.y - 2][coord.x + 1].feature_id = TMP1_WALL;
        dg.floor[coord.y + 2][coord.x - 1].feature_id = TMP1_WALL;
        dg.floor[coord.y + 2][coord.x + 1].feature_id = TMP1_WALL;
        if (randomNumber(3) === 1) {
          await dungeonPlaceSecretDoor({ y: coord.y, x: coord.x - 2 });
          await dungeonPlaceSecretDoor({ y: coord.y, x: coord.x + 2 });
          await dungeonPlaceSecretDoor({ y: coord.y - 2, x: coord.x });
          await dungeonPlaceSecretDoor({ y: coord.y + 2, x: coord.x });
        }
      } else if (randomNumber(3) === 1) {
        dg.floor[coord.y][coord.x].feature_id = TMP1_WALL;
        dg.floor[coord.y - 1][coord.x].feature_id = TMP1_WALL;
        dg.floor[coord.y + 1][coord.x].feature_id = TMP1_WALL;
        dg.floor[coord.y][coord.x - 1].feature_id = TMP1_WALL;
        dg.floor[coord.y][coord.x + 1].feature_id = TMP1_WALL;
      } else if (randomNumber(3) === 1) {
        dg.floor[coord.y][coord.x].feature_id = TMP1_WALL;
      }
      break;
    // handled by the default case
    // case 4:
    //     // no special feature!
    //     break;
    default:
      break;
  }
}

// Constructs a tunnel between two points
async function dungeonBuildTunnel(start_in: Coord_t, end_in: Coord_t): Promise<void> {
  // Coord_t start, Coord_t end: passed by value
  const start: Coord_t = { y: start_in.y, x: start_in.x };
  const end: Coord_t = { y: end_in.y, x: end_in.x };

  const tunnels_tk: Coord_t[] = Array.from({ length: 1000 }, () => ({ y: 0, x: 0 }));
  const walls_tk: Coord_t[] = Array.from({ length: 1000 }, () => ({ y: 0, x: 0 }));

  // Main procedure for Tunnel
  // Note: 9 is a temporary value
  let door_flag = false;
  let stop_flag = false;
  let main_loop_count = 0;
  const start_row = start.y;
  const start_col = start.x;
  let tunnel_index = 0;
  let wall_index = 0;

  const y_direction = ref(0);
  const x_direction = ref(0);
  pickCorrectDirection(y_direction, x_direction, start, end);

  do {
    // prevent infinite loops, just in case
    main_loop_count++;
    if (main_loop_count > 2000) {
      stop_flag = true;
    }

    if (randomNumber(100) > config.dungeon.DUN_DIR_CHANGE) {
      if (randomNumber(config.dungeon.DUN_RANDOM_DIR) === 1) {
        chanceOfRandomDirection(y_direction, x_direction);
      } else {
        pickCorrectDirection(y_direction, x_direction, start, end);
      }
    }

    let tmp_row = start.y + y_direction.v;
    let tmp_col = start.x + x_direction.v;

    while (!coordInBounds({ y: tmp_row, x: tmp_col })) {
      if (randomNumber(config.dungeon.DUN_RANDOM_DIR) === 1) {
        chanceOfRandomDirection(y_direction, x_direction);
      } else {
        pickCorrectDirection(y_direction, x_direction, start, end);
      }
      tmp_row = start.y + y_direction.v;
      tmp_col = start.x + x_direction.v;
    }

    switch (dg.floor[tmp_row][tmp_col].feature_id) {
      case TILE_NULL_WALL:
        start.y = tmp_row;
        start.x = tmp_col;
        if (tunnel_index < 1000) {
          tunnels_tk[tunnel_index].y = start.y;
          tunnels_tk[tunnel_index].x = start.x;
          tunnel_index++;
        }
        door_flag = false;
        break;
      case TMP2_WALL:
        // do nothing
        break;
      case TILE_GRANITE_WALL:
        start.y = tmp_row;
        start.x = tmp_col;

        if (wall_index < 1000) {
          walls_tk[wall_index].y = start.y;
          walls_tk[wall_index].x = start.x;
          wall_index++;
        }

        for (let y = start.y - 1; y <= start.y + 1; y++) {
          for (let x = start.x - 1; x <= start.x + 1; x++) {
            if (coordInBounds({ y, x })) {
              // values 11 and 12 are impossible here, dungeonPlaceStreamerRock
              // is never run before dungeonBuildTunnel
              if (dg.floor[y][x].feature_id === TILE_GRANITE_WALL) {
                dg.floor[y][x].feature_id = TMP2_WALL;
              }
            }
          }
        }
        break;
      case TILE_CORR_FLOOR:
      case TILE_BLOCKED_FLOOR:
        start.y = tmp_row;
        start.x = tmp_col;

        if (!door_flag) {
          if (door_index < 100) {
            doors_tk[door_index].y = start.y;
            doors_tk[door_index].x = start.x;
            door_index++;
          }
          door_flag = true;
        }

        if (randomNumber(100) > config.dungeon.DUN_TUNNELING) {
          // make sure that tunnel has gone a reasonable distance
          // before stopping it, this helps prevent isolated rooms
          tmp_row = start.y - start_row;
          if (tmp_row < 0) {
            tmp_row = -tmp_row;
          }

          tmp_col = start.x - start_col;
          if (tmp_col < 0) {
            tmp_col = -tmp_col;
          }

          if (tmp_row > 10 || tmp_col > 10) {
            stop_flag = true;
          }
        }
        break;
      default:
        // none of: NULL, TMP2, GRANITE, CORR
        start.y = tmp_row;
        start.x = tmp_col;
    }
  } while ((start.y !== end.y || start.x !== end.x) && !stop_flag);

  for (let i = 0; i < tunnel_index; i++) {
    dg.floor[tunnels_tk[i].y][tunnels_tk[i].x].feature_id = TILE_CORR_FLOOR;
  }

  for (let i = 0; i < wall_index; i++) {
    const tile = dg.floor[walls_tk[i].y][walls_tk[i].x];

    if (tile.feature_id === TMP2_WALL) {
      if (randomNumber(100) < config.dungeon.DUN_ROOM_DOORS) {
        await dungeonPlaceDoor({ y: walls_tk[i].y, x: walls_tk[i].x });
      } else {
        // these have to be doorways to rooms
        tile.feature_id = TILE_CORR_FLOOR;
      }
    }
  }
}

function dungeonIsNextTo(coord: Coord_t): boolean {
  if (coordCorridorWallsNextTo(coord) > 2) {
    const vertical = dg.floor[coord.y - 1][coord.x].feature_id >= MIN_CAVE_WALL && dg.floor[coord.y + 1][coord.x].feature_id >= MIN_CAVE_WALL;
    const horizontal = dg.floor[coord.y][coord.x - 1].feature_id >= MIN_CAVE_WALL && dg.floor[coord.y][coord.x + 1].feature_id >= MIN_CAVE_WALL;

    return vertical || horizontal;
  }

  return false;
}

// Places door at y, x position if at least 2 walls found
async function dungeonPlaceDoorIfNextToTwoWalls(coord: Coord_t): Promise<void> {
  if (dg.floor[coord.y][coord.x].feature_id === TILE_CORR_FLOOR && randomNumber(100) > config.dungeon.DUN_TUNNEL_DOORS && dungeonIsNextTo(coord)) {
    await dungeonPlaceDoor(coord);
  }
}

// Returns random co-ordinates -RAK-
function dungeonNewSpot(coord: Coord_t): void {
  let tile: Tile_t;
  const position: Coord_t = { y: 0, x: 0 };

  do {
    position.y = randomNumber(dg.height - 2);
    position.x = randomNumber(dg.width - 2);
    tile = dg.floor[position.y][position.x];
  } while (tile.feature_id >= MIN_CLOSED_SPACE || tile.creature_id !== 0 || tile.treasure_id !== 0);

  coord.y = position.y;
  coord.x = position.x;
}

// Functions to emulate the original Pascal sets
function setRooms(tile_id: number): boolean {
  return tile_id === TILE_DARK_FLOOR || tile_id === TILE_LIGHT_FLOOR;
}

function setCorridors(tile_id: number): boolean {
  return tile_id === TILE_CORR_FLOOR || tile_id === TILE_BLOCKED_FLOOR;
}

function setFloors(tile_id: number): boolean {
  return tile_id <= MAX_CAVE_FLOOR;
}

// Cave logic flow for generation of new dungeon
async function dungeonGenerate(): Promise<void> {
  // Room initialization
  const row_rooms = 2 * idiv(dg.height, SCREEN_HEIGHT);
  const col_rooms = 2 * idiv(dg.width, SCREEN_WIDTH);

  const room_map: boolean[][] = Array.from({ length: 20 }, () => new Array<boolean>(20).fill(false));
  for (let row = 0; row < row_rooms; row++) {
    for (let col = 0; col < col_rooms; col++) {
      room_map[row][col] = false;
    }
  }

  const random_room_count = randomNumberNormalDistribution(config.dungeon.DUN_ROOMS_MEAN, 2);
  for (let i = 0; i < random_room_count; i++) {
    // the row's randomNumber() is called first (as g++ does)
    const row = randomNumber(row_rooms) - 1;
    const col = randomNumber(col_rooms) - 1;
    room_map[row][col] = true;
  }

  // Build rooms
  let location_id = 0;
  const locations: Coord_t[] = Array.from({ length: 400 }, () => ({ y: 0, x: 0 }));

  for (let row = 0; row < row_rooms; row++) {
    for (let col = 0; col < col_rooms; col++) {
      if (room_map[row][col]) {
        locations[location_id].y = row * (SCREEN_HEIGHT >> 1) + QUART_HEIGHT;
        locations[location_id].x = col * (SCREEN_WIDTH >> 1) + QUART_WIDTH;
        if (dg.current_level > randomNumber(config.dungeon.DUN_UNUSUAL_ROOMS)) {
          const room_type = randomNumber(3);

          if (room_type === 1) {
            dungeonBuildRoomOverlappingRectangles(locations[location_id]);
          } else if (room_type === 2) {
            await dungeonBuildRoomWithInnerRooms(locations[location_id]);
          } else {
            await dungeonBuildRoomCrossShaped(locations[location_id]);
          }
        } else {
          dungeonBuildRoom(locations[location_id]);
        }
        location_id++;
      }
    }
  }

  for (let i = 0; i < location_id; i++) {
    const pick1 = randomNumber(location_id) - 1;
    const pick2 = randomNumber(location_id) - 1;

    const y = locations[pick1].y;
    const x = locations[pick1].x;
    locations[pick1].y = locations[pick2].y;
    locations[pick1].x = locations[pick2].x;
    locations[pick2].y = y;
    locations[pick2].x = x;
  }

  door_index = 0;

  // move zero entry to location_id, so that can call dungeonBuildTunnel all location_id times
  locations[location_id].y = locations[0].y;
  locations[location_id].x = locations[0].x;

  for (let i = 0; i < location_id; i++) {
    await dungeonBuildTunnel(locations[i + 1], locations[i]);
  }

  // Generate walls and streamers
  dungeonFillEmptyTilesWith(TILE_GRANITE_WALL);
  for (let i = 0; i < config.dungeon.DUN_MAGMA_STREAMER; i++) {
    await dungeonPlaceStreamerRock(TILE_MAGMA_WALL, config.dungeon.DUN_MAGMA_TREASURE);
  }
  for (let i = 0; i < config.dungeon.DUN_QUARTZ_STREAMER; i++) {
    await dungeonPlaceStreamerRock(TILE_QUARTZ_WALL, config.dungeon.DUN_QUARTZ_TREASURE);
  }
  dungeonPlaceBoundaryWalls();

  // Place intersection doors
  for (let i = 0; i < door_index; i++) {
    await dungeonPlaceDoorIfNextToTwoWalls({ y: doors_tk[i].y, x: doors_tk[i].x - 1 });
    await dungeonPlaceDoorIfNextToTwoWalls({ y: doors_tk[i].y, x: doors_tk[i].x + 1 });
    await dungeonPlaceDoorIfNextToTwoWalls({ y: doors_tk[i].y - 1, x: doors_tk[i].x });
    await dungeonPlaceDoorIfNextToTwoWalls({ y: doors_tk[i].y + 1, x: doors_tk[i].x });
  }

  let alloc_level = idiv(dg.current_level, 3);
  if (alloc_level < 2) {
    alloc_level = 2;
  } else if (alloc_level > 10) {
    alloc_level = 10;
  }

  await dungeonPlaceStairs(2, randomNumber(2) + 2, 3);
  await dungeonPlaceStairs(1, randomNumber(2), 3);

  // Set up the character coords, used by monsterPlaceNewWithinDistance, monsterPlaceWinning
  const coord: Coord_t = { y: 0, x: 0 };
  dungeonNewSpot(coord);
  py.pos.y = coord.y;
  py.pos.x = coord.x;

  await monsterPlaceNewWithinDistance(randomNumber(8) + config.monsters.MON_MIN_PER_LEVEL + alloc_level, 0, true);
  await dungeonAllocateAndPlaceObject(setCorridors, 3, randomNumber(alloc_level));
  await dungeonAllocateAndPlaceObject(setRooms, 5, randomNumberNormalDistribution(config.dungeon.objects.LEVEL_OBJECTS_PER_ROOM, 3));
  await dungeonAllocateAndPlaceObject(setFloors, 5, randomNumberNormalDistribution(config.dungeon.objects.LEVEL_OBJECTS_PER_CORRIDOR, 3));
  await dungeonAllocateAndPlaceObject(setFloors, 4, randomNumberNormalDistribution(config.dungeon.objects.LEVEL_TOTAL_GOLD_AND_GEMS, 3));
  await dungeonAllocateAndPlaceObject(setFloors, 1, randomNumber(alloc_level));

  if (dg.current_level >= config.monsters.MON_ENDGAME_LEVEL) {
    await monsterPlaceWinning();
  }
}

// Builds a store at a row, column coordinate
async function dungeonBuildStore(store_id: number, coord: Coord_t): Promise<void> {
  const yval = coord.y * 10 + 5;
  const xval = coord.x * 16 + 16;
  const height = yval - randomNumber(3);
  const depth = yval + randomNumber(4);
  const left = xval - randomNumber(6);
  const right = xval + randomNumber(6);

  let y: number, x: number;

  for (y = height; y <= depth; y++) {
    for (x = left; x <= right; x++) {
      dg.floor[y][x].feature_id = TILE_BOUNDARY_WALL;
    }
  }

  const tmp = randomNumber(4);
  if (tmp < 3) {
    y = randomNumber(depth - height) + height - 1;

    if (tmp === 1) {
      x = left;
    } else {
      x = right;
    }
  } else {
    x = randomNumber(right - left) + left - 1;

    if (tmp === 3) {
      y = depth;
    } else {
      y = height;
    }
  }

  dg.floor[y][x].feature_id = TILE_CORR_FLOOR;

  const cur_pos = await popt();
  dg.floor[y][x].treasure_id = u8(cur_pos);

  inventoryItemCopyTo(config.dungeon.objects.OBJ_STORE_DOOR + store_id, game.treasure.list[cur_pos]);
}

// Link all free space in treasure list together
function treasureLinker(): void {
  for (const item of game.treasure.list) {
    inventoryItemCopyTo(config.dungeon.objects.OBJ_NOTHING, item);
  }
  game.treasure.current_id = config.treasure.MIN_TREASURE_LIST_ID;
}

// Link all free space in monster list together
function monsterLinker(): void {
  for (const monster of monsters) {
    monster.assign(blank_monster);
  }
  globals.next_free_monster_id = config.monsters.MON_MIN_INDEX_ID;
}

async function dungeonPlaceTownStores(): Promise<void> {
  const rooms = new Array<number>(6);
  for (let i = 0; i < 6; i++) {
    rooms[i] = i;
  }

  let rooms_count = 6;

  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 3; x++) {
      const room_id = randomNumber(rooms_count) - 1;
      await dungeonBuildStore(rooms[room_id], { y, x });

      for (let i = room_id; i < rooms_count - 1; i++) {
        rooms[i] = rooms[i + 1];
      }

      rooms_count--;
    }
  }
}

function isNighTime(): boolean {
  return (0x1 & idiv(dg.game_turn, 5000)) !== 0;
}

// Light town based on whether it is Night time, or day time.
async function lightTown(): Promise<void> {
  if (isNighTime()) {
    for (let y = 0; y < dg.height; y++) {
      for (let x = 0; x < dg.width; x++) {
        if (dg.floor[y][x].feature_id !== TILE_DARK_FLOOR) {
          dg.floor[y][x].permanent_light = true;
        }
      }
    }
    await monsterPlaceNewWithinDistance(config.monsters.MON_MIN_TOWNSFOLK_NIGHT, 3, true);
  } else {
    // ...it is day time
    for (let y = 0; y < dg.height; y++) {
      for (let x = 0; x < dg.width; x++) {
        dg.floor[y][x].permanent_light = true;
      }
    }
    await monsterPlaceNewWithinDistance(config.monsters.MON_MIN_TOWNSFOLK_DAY, 3, true);
  }
}

// I may have written the town level code, but I'm not exactly
// proud of it.   Adding the stores required some real slucky
// hooks which I have not had time to re-think. -RAK-

// Town logic flow for generation of new town
async function townGeneration(): Promise<void> {
  seedSet(game.town_seed);

  await dungeonPlaceTownStores();

  dungeonFillEmptyTilesWith(TILE_DARK_FLOOR);

  // make stairs before seedResetToOldSeed, so that they don't move around
  dungeonPlaceBoundaryWalls();
  await dungeonPlaceStairs(2, 1, 0);

  seedResetToOldSeed();

  // Set up the character coords, used by monsterPlaceNewWithinDistance below
  const coord: Coord_t = { y: 0, x: 0 };
  dungeonNewSpot(coord);
  py.pos.y = coord.y;
  py.pos.x = coord.x;

  await lightTown();

  await storeMaintenance();
}

// Generates a random dungeon level -RAK-
export async function generateCave(): Promise<void> {
  dg.panel.top = 0;
  dg.panel.bottom = 0;
  dg.panel.left = 0;
  dg.panel.right = 0;

  py.pos.y = -1;
  py.pos.x = -1;

  treasureLinker();
  monsterLinker();
  dungeonBlankEntireCave();

  // We're in the dungeon more than the town, so let's default to that -MRC-
  dg.height = MAX_HEIGHT;
  dg.width = MAX_WIDTH;

  if (dg.current_level === 0) {
    dg.height = SCREEN_HEIGHT;
    dg.width = SCREEN_WIDTH;
  }

  dg.panel.max_rows = i16(idiv(dg.height, SCREEN_HEIGHT) * 2 - 2);
  dg.panel.max_cols = i16(idiv(dg.width, SCREEN_WIDTH) * 2 - 2);

  dg.panel.row = dg.panel.max_rows;
  dg.panel.col = dg.panel.max_cols;

  if (dg.current_level === 0) {
    await townGeneration();
  } else {
    await dungeonGenerate();
  }
}
