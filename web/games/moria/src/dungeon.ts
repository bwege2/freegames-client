// dungeon.cpp: The main command interpreter, updating player status
import { config } from './config.ts';
import {
  MAX_CAVE_FLOOR, MAX_HEIGHT, MAX_OPEN_SPACE, MAX_WIDTH, MIN_CAVE_WALL, RATIO, SCREEN_HEIGHT, SCREEN_WIDTH, TILE_BLOCKED_FLOOR,
  TILE_BOUNDARY_WALL, TILE_CORR_FLOOR, TILE_DARK_FLOOR, TILE_GRANITE_WALL, TILE_LIGHT_FLOOR, TV_INVIS_TRAP, TV_MAX_VISIBLE,
  TV_MIN_DOORS, TV_MIN_VISIBLE, TV_SECRET_DOOR, TV_VIS_TRAP,
} from './constants.ts';
import { creatures_list } from './data_creatures.ts';
import { game_objects } from './data_treasure.ts';
import { los } from './dungeon_los.ts';
import { randomNumber } from './game.ts';
import { itemGetRandomObjectId, popt, pusht } from './game_objects.ts';
import { blank_monster, dg, game, globals, monsters, py, sorted_objects } from './globals.ts';
import { inventoryItemCopyTo } from './inventory.ts';
import { chr, idiv, sprintf, u8 } from './libc.ts';
import type { Coord_t } from './structs.ts';
import { magicTreasureMagicalAbility } from './treasure.ts';
import { coordInsidePanel } from './ui.ts';
import {
  addChar, clearScreen, getKeyInput, moveCursor, panelPutTile, printMessage, putString, terminalRestoreScreen, terminalSaveScreen,
} from './ui_io.ts';

// The Dungeon global (dg) is in globals.ts:
// Dungeon_t dg = Dungeon_t{0, 0, {}, -1, 0, true, {}};

// dungeonDisplayMap shrinks the dungeon to a single screen
export async function dungeonDisplayMap(): Promise<void> {
  // Save the game screen
  terminalSaveScreen();
  await clearScreen();

  const priority = new Int16Array(256);
  priority[60] = 5; // char '<'
  priority[62] = 5; // char '>'
  priority[64] = 10; // char '@'
  priority[35] = -5; // char '#'
  priority[46] = -10; // char '.'
  priority[92] = -3; // char '\'
  priority[32] = -15; // char ' '

  // Display highest priority object in the RATIO, by RATIO area
  const panel_width = u8(idiv(MAX_WIDTH, RATIO));
  const panel_height = u8(idiv(MAX_HEIGHT, RATIO));

  // char map[MAX_WIDTH / RATIO + 1] = {'\0'}: char codes
  const map = new Uint8Array(idiv(MAX_WIDTH, RATIO) + 1);
  let line_buffer: string;

  // the C string in map
  const mapString = (): string => {
    let s = '';
    for (let i = 0; i < map.length && map[i] !== 0; i++) {
      s += chr(map[i]);
    }
    return s;
  };

  // Add screen border
  addChar('+', { y: 0, x: 0 });
  addChar('+', { y: 0, x: panel_width + 1 });
  for (let i = 0; i < panel_width; i = u8(i + 1)) {
    addChar('-', { y: 0, x: i + 1 });
    addChar('-', { y: panel_height + 1, x: i + 1 });
  }
  for (let i = 0; i < panel_height; i = u8(i + 1)) {
    addChar('|', { y: i + 1, x: 0 });
    addChar('|', { y: i + 1, x: panel_width + 1 });
  }
  addChar('+', { y: panel_height + 1, x: 0 });
  addChar('+', { y: panel_height + 1, x: panel_width + 1 });
  putString('Hit any key to continue', { y: 23, x: 23 });

  let player_y = 0;
  let player_x = 0;
  let line = -1;

  // Shrink the dungeon!
  for (let y = 0; y < MAX_HEIGHT; y = u8(y + 1)) {
    const row = u8(idiv(y, RATIO));
    if (row !== line) {
      if (line >= 0) {
        line_buffer = sprintf('|%s|', mapString());
        putString(line_buffer, { y: line + 1, x: 0 });
      }
      for (let j = 0; j < panel_width; j = u8(j + 1)) {
        map[j] = 32; // ' '
      }
      line = row;
    }

    for (let x = 0; x < MAX_WIDTH; x = u8(x + 1)) {
      const col = u8(idiv(x, RATIO));
      const cave_char = caveGetTileSymbol({ y, x });
      if (priority[map[col]] < priority[u8(cave_char.charCodeAt(0))]) {
        map[col] = cave_char.charCodeAt(0) & 0xff;
      }
      if (map[col] === 64) { // '@'
        // +1 to account for border
        player_x = col + 1;
        player_y = row + 1;
      }
    }
  }

  if (line >= 0) {
    line_buffer = sprintf('|%s|', mapString());
    putString(line_buffer, { y: line + 1, x: 0 });
  }

  // Move cursor onto player character
  moveCursor({ y: player_y, x: player_x });

  // wait for any keypress
  await getKeyInput();

  // restore the game screen
  terminalRestoreScreen();
}

// Checks a co-ordinate for in bounds status -RAK-
export function coordInBounds(coord: Coord_t): boolean {
  const y = coord.y > 0 && coord.y < dg.height - 1;
  const x = coord.x > 0 && coord.x < dg.width - 1;

  return y && x;
}

// Distance between two points -RAK-
export function coordDistanceBetween(from: Coord_t, to: Coord_t): number {
  let dy = from.y - to.y;
  if (dy < 0) {
    dy = -dy;
  }

  let dx = from.x - to.x;
  if (dx < 0) {
    dx = -dx;
  }

  const a = (dy + dx) << 1;
  const b = dy > dx ? dx : dy;

  return (a - b) >> 1;
}

// Checks points north, south, east, and west for a wall -RAK-
// note that y,x is always coordInBounds(), i.e. 0 < y < dg.height-1,
// and 0 < x < dg.width-1
export function coordWallsNextTo(coord: Coord_t): number {
  let walls = 0;

  if (dg.floor[coord.y - 1][coord.x].feature_id >= MIN_CAVE_WALL) {
    walls++;
  }

  if (dg.floor[coord.y + 1][coord.x].feature_id >= MIN_CAVE_WALL) {
    walls++;
  }

  if (dg.floor[coord.y][coord.x - 1].feature_id >= MIN_CAVE_WALL) {
    walls++;
  }

  if (dg.floor[coord.y][coord.x + 1].feature_id >= MIN_CAVE_WALL) {
    walls++;
  }

  return walls;
}

// Checks all adjacent spots for corridors -RAK-
// note that y, x is always coordInBounds(), hence no need to check that
// j, k are coordInBounds(), even if they are 0 or cur_x-1 is still works
export function coordCorridorWallsNextTo(coord: Coord_t): number {
  let walls = 0;

  for (let y = coord.y - 1; y <= coord.y + 1; y++) {
    for (let x = coord.x - 1; x <= coord.x + 1; x++) {
      const tile_id = dg.floor[y][x].feature_id;
      const treasure_id = dg.floor[y][x].treasure_id;

      // should fail if there is already a door present
      if (tile_id === TILE_CORR_FLOOR && (treasure_id === 0 || game.treasure.list[treasure_id].category_id < TV_MIN_DOORS)) {
        walls++;
      }
    }
  }

  return walls;
}

// Returns symbol for given row, column -RAK-
export function caveGetTileSymbol(coord: Coord_t): string {
  const tile = dg.floor[coord.y][coord.x];

  if (tile.creature_id === 1 && (py.running_tracker === 0 || config.options.run_print_self)) {
    return '@';
  }

  if ((py.flags.status & config.player.status.PY_BLIND) !== 0) {
    return ' ';
  }

  if (py.flags.image > 0 && randomNumber(12) === 1) {
    return chr(u8(randomNumber(95) + 31));
  }

  if (tile.creature_id > 1 && monsters[tile.creature_id].lit) {
    return chr(creatures_list[monsters[tile.creature_id].creature_id].sprite);
  }

  if (!tile.permanent_light && !tile.temporary_light && !tile.field_mark) {
    return ' ';
  }

  if (tile.treasure_id !== 0 && game.treasure.list[tile.treasure_id].category_id !== TV_INVIS_TRAP) {
    return chr(game.treasure.list[tile.treasure_id].sprite);
  }

  if (tile.feature_id <= MAX_CAVE_FLOOR) {
    return '.';
  }

  if (tile.feature_id === TILE_GRANITE_WALL || tile.feature_id === TILE_BOUNDARY_WALL || !config.options.highlight_seams) {
    return '#';
  }

  // Originally set highlight bit, but that is not portable,
  // now use the percent sign instead.
  return '%';
}

// Tests a spot for light or field mark status -RAK-
export function caveTileVisible(coord: Coord_t): boolean {
  return dg.floor[coord.y][coord.x].permanent_light || dg.floor[coord.y][coord.x].temporary_light || dg.floor[coord.y][coord.x].field_mark;
}

// Places a particular trap at location y, x -RAK-
export async function dungeonSetTrap(coord: Coord_t, sub_type_id: number): Promise<void> {
  const free_treasure_id = await popt();
  dg.floor[coord.y][coord.x].treasure_id = u8(free_treasure_id);
  inventoryItemCopyTo(config.dungeon.objects.OBJ_TRAP_LIST + sub_type_id, game.treasure.list[free_treasure_id]);
}

// Change a trap from invisible to visible -RAK-
// Note: Secret doors are handled here
export function trapChangeVisibility(coord: Coord_t): void {
  const treasure_id = u8(dg.floor[coord.y][coord.x].treasure_id);

  const item = game.treasure.list[treasure_id];

  if (item.category_id === TV_INVIS_TRAP) {
    item.category_id = TV_VIS_TRAP;
    dungeonLiteSpot(coord);
    return;
  }

  // change secret door to closed door
  if (item.category_id === TV_SECRET_DOOR) {
    item.id = config.dungeon.objects.OBJ_CLOSED_DOOR;
    item.category_id = game_objects[config.dungeon.objects.OBJ_CLOSED_DOOR].category_id;
    item.sprite = game_objects[config.dungeon.objects.OBJ_CLOSED_DOOR].sprite;
    dungeonLiteSpot(coord);
  }
}

// Places rubble at location y, x -RAK-
export async function dungeonPlaceRubble(coord: Coord_t): Promise<void> {
  const free_treasure_id = await popt();
  dg.floor[coord.y][coord.x].treasure_id = u8(free_treasure_id);
  dg.floor[coord.y][coord.x].feature_id = TILE_BLOCKED_FLOOR;
  inventoryItemCopyTo(config.dungeon.objects.OBJ_RUBBLE, game.treasure.list[free_treasure_id]);
}

// Places a treasure (Gold or Gems) at given row, column -RAK-
export async function dungeonPlaceGold(coord: Coord_t): Promise<void> {
  const free_treasure_id = await popt();

  let gold_type_id = idiv(randomNumber(dg.current_level + 2) + 2, 2) - 1;

  if (randomNumber(config.treasure.TREASURE_CHANCE_OF_GREAT_ITEM) === 1) {
    gold_type_id += randomNumber(dg.current_level + 1);
  }

  if (gold_type_id >= config.dungeon.objects.MAX_GOLD_TYPES) {
    gold_type_id = config.dungeon.objects.MAX_GOLD_TYPES - 1;
  }

  dg.floor[coord.y][coord.x].treasure_id = u8(free_treasure_id);
  inventoryItemCopyTo(config.dungeon.objects.OBJ_GOLD_LIST + gold_type_id, game.treasure.list[free_treasure_id]);
  game.treasure.list[free_treasure_id].cost += 8 * randomNumber(game.treasure.list[free_treasure_id].cost) + randomNumber(8);

  if (dg.floor[coord.y][coord.x].creature_id === 1) {
    await printMessage('You feel something roll beneath your feet.');
  }
}

// Places an object at given row, column co-ordinate -RAK-
export async function dungeonPlaceRandomObjectAt(coord: Coord_t, must_be_small: boolean): Promise<void> {
  const free_treasure_id = await popt();

  dg.floor[coord.y][coord.x].treasure_id = u8(free_treasure_id);

  const object_id = itemGetRandomObjectId(dg.current_level, must_be_small);
  inventoryItemCopyTo(sorted_objects[object_id], game.treasure.list[free_treasure_id]);

  magicTreasureMagicalAbility(free_treasure_id, dg.current_level);

  if (dg.floor[coord.y][coord.x].creature_id === 1) {
    await printMessage('You feel something roll beneath your feet.'); // -CJS-
  }
}

// Allocates an object for tunnels and rooms -RAK-
export async function dungeonAllocateAndPlaceObject(set_function: (a0: number) => boolean, object_type: number, number: number): Promise<void> {
  const coord: Coord_t = { y: 0, x: 0 };

  for (let i = 0; i < number; i++) {
    // don't put an object beneath the player, this could cause
    // problems if player is standing under rubble, or on a trap.
    do {
      coord.y = randomNumber(dg.height) - 1;
      coord.x = randomNumber(dg.width) - 1;
    } while (!set_function(dg.floor[coord.y][coord.x].feature_id) || dg.floor[coord.y][coord.x].treasure_id !== 0 || (coord.y === py.pos.y && coord.x === py.pos.x));

    switch (object_type) {
      case 1:
        await dungeonSetTrap(coord, randomNumber(config.dungeon.objects.MAX_TRAPS) - 1);
        break;
      case 2:
      // NOTE: object_type == 2 is no longer used - it used to be visible traps.
      // FIXME: there was no `break` here so `case 3` catches it? -MRC-
      // falls through
      case 3:
        await dungeonPlaceRubble(coord);
        break;
      case 4:
        await dungeonPlaceGold(coord);
        break;
      case 5:
        await dungeonPlaceRandomObjectAt(coord, false);
        break;
      default:
        break;
    }
  }
}

// Creates objects nearby the coordinates given -RAK-
export async function dungeonPlaceRandomObjectNear(coord: Coord_t, tries: number): Promise<void> {
  do {
    for (let i = 0; i <= 10; i++) {
      const at: Coord_t = {
        y: coord.y - 3 + randomNumber(5),
        x: coord.x - 4 + randomNumber(7),
      };

      if (coordInBounds(at) && dg.floor[at.y][at.x].feature_id <= MAX_CAVE_FLOOR && dg.floor[at.y][at.x].treasure_id === 0) {
        if (randomNumber(100) < 75) {
          await dungeonPlaceRandomObjectAt(at, false);
        } else {
          await dungeonPlaceGold(at);
        }
        i = 9;
      }
    }

    tries--;
  } while (tries !== 0);
}

// Moves creature record from one space to another -RAK-
// this always works correctly, even if y1==y2 and x1==x2
export function dungeonMoveCreatureRecord(from: Coord_t, to: Coord_t): void {
  const id = dg.floor[from.y][from.x].creature_id;
  dg.floor[from.y][from.x].creature_id = 0;
  dg.floor[to.y][to.x].creature_id = u8(id);
}

// Room is lit, make it appear -RAK-
export function dungeonLightRoom(coord: Coord_t): void {
  const height_middle = idiv(SCREEN_HEIGHT, 2);
  const width_middle = idiv(SCREEN_WIDTH, 2);

  const top = idiv(coord.y, height_middle) * height_middle;
  const left = idiv(coord.x, width_middle) * width_middle;
  const bottom = top + height_middle - 1;
  const right = left + width_middle - 1;

  const location: Coord_t = { y: 0, x: 0 };

  for (location.y = top; location.y <= bottom; location.y++) {
    for (location.x = left; location.x <= right; location.x++) {
      const tile = dg.floor[location.y][location.x];

      if (tile.perma_lit_room && !tile.permanent_light) {
        tile.permanent_light = true;

        if (tile.feature_id === TILE_DARK_FLOOR) {
          tile.feature_id = TILE_LIGHT_FLOOR;
        }
        if (!tile.field_mark && tile.treasure_id !== 0) {
          const treasure_id = game.treasure.list[tile.treasure_id].category_id;
          if (treasure_id >= TV_MIN_VISIBLE && treasure_id <= TV_MAX_VISIBLE) {
            tile.field_mark = true;
          }
        }
        panelPutTile(caveGetTileSymbol(location), location);
      }
    }
  }
}

// Lights up given location -RAK-
export function dungeonLiteSpot(coord: Coord_t): void {
  if (!coordInsidePanel(coord)) {
    return;
  }

  const symbol = caveGetTileSymbol(coord);
  panelPutTile(symbol, coord);
}

// Normal movement
// When FIND_FLAG,  light only permanent features
function sub1MoveLight(from: Coord_t, to: Coord_t): void {
  if (py.temporary_light_only) {
    // Turn off lamp light
    for (let y = from.y - 1; y <= from.y + 1; y++) {
      for (let x = from.x - 1; x <= from.x + 1; x++) {
        dg.floor[y][x].temporary_light = false;
      }
    }
    if (py.running_tracker !== 0 && !config.options.run_print_self) {
      py.temporary_light_only = false;
    }
  } else if (py.running_tracker === 0 || config.options.run_print_self) {
    py.temporary_light_only = true;
  }

  for (let y = to.y - 1; y <= to.y + 1; y++) {
    for (let x = to.x - 1; x <= to.x + 1; x++) {
      const tile = dg.floor[y][x];

      // only light up if normal movement
      if (py.temporary_light_only) {
        tile.temporary_light = true;
      }

      if (tile.feature_id >= MIN_CAVE_WALL) {
        tile.permanent_light = true;
      } else if (!tile.field_mark && tile.treasure_id !== 0) {
        const tval = game.treasure.list[tile.treasure_id].category_id;

        if (tval >= TV_MIN_VISIBLE && tval <= TV_MAX_VISIBLE) {
          tile.field_mark = true;
        }
      }
    }
  }

  // From uppermost to bottom most lines player was on.
  let top: number, left: number, bottom: number, right: number;

  if (from.y < to.y) {
    top = from.y - 1;
    bottom = to.y + 1;
  } else {
    top = to.y - 1;
    bottom = from.y + 1;
  }
  if (from.x < to.x) {
    left = from.x - 1;
    right = to.x + 1;
  } else {
    left = to.x - 1;
    right = from.x + 1;
  }

  const coord: Coord_t = { y: 0, x: 0 };
  for (coord.y = top; coord.y <= bottom; coord.y++) {
    // Leftmost to rightmost do
    for (coord.x = left; coord.x <= right; coord.x++) {
      panelPutTile(caveGetTileSymbol(coord), coord);
    }
  }
}

// When blinded,  move only the player symbol.
// With no light,  movement becomes involved.
function sub3MoveLight(from: Coord_t, to: Coord_t): void {
  if (py.temporary_light_only) {
    const coord: Coord_t = { y: 0, x: 0 };

    for (coord.y = from.y - 1; coord.y <= from.y + 1; coord.y++) {
      for (coord.x = from.x - 1; coord.x <= from.x + 1; coord.x++) {
        dg.floor[coord.y][coord.x].temporary_light = false;
        panelPutTile(caveGetTileSymbol(coord), coord);
      }
    }

    py.temporary_light_only = false;
  } else if (py.running_tracker === 0 || config.options.run_print_self) {
    panelPutTile(caveGetTileSymbol(from), from);
  }

  if (py.running_tracker === 0 || config.options.run_print_self) {
    panelPutTile('@', to);
  }
}

// Package for moving the character's light about the screen
// Four cases : Normal, Finding, Blind, and No light -RAK-
export function dungeonMoveCharacterLight(from: Coord_t, to: Coord_t): void {
  if (py.flags.blind > 0 || !py.carrying_light) {
    sub3MoveLight(from, to);
  } else {
    sub1MoveLight(from, to);
  }
}

// Deletes a monster entry from the level -RAK-
//
// If used within updateMonsters(), deleting a monster while scanning the
// monsters causes two problems;
//   1. monsters might get two turns
//   2. m_ptr/monptr might be invalid after running this function
// Hence a two step process is provided for updateMonsters().
export function dungeonDeleteMonster(id: number): void {
  dungeonRemoveMonsterFromLevel(id);
  dungeonDeleteMonsterRecord(id);
}

// dungeonRemoveMonsterFromLevel ensures the monster has no HP before removing
// its ID from the dungeon level.
// This is called in breath(), and a couple of places in creatures.c.
export function dungeonRemoveMonsterFromLevel(id: number): void {
  const monster = monsters[id];

  // Force the HP negative to ensure that the monster is dead. For example, if the
  // monster was just eaten by another, it will still have positive hit points.
  monster.hp = -1;

  dg.floor[monster.pos.y][monster.pos.x].creature_id = 0;

  if (monster.lit) {
    dungeonLiteSpot({ y: monster.pos.y, x: monster.pos.x });
  }

  if (globals.monster_multiply_total > 0) {
    globals.monster_multiply_total--;
  }
}

// dungeonDeleteMonsterRecord delete the monster record from the monsters list.
// Called by updateMonsters() and dungeonDeleteMonster() only.
export function dungeonDeleteMonsterRecord(id: number): void {
  const last_id = globals.next_free_monster_id - 1;
  const monster = monsters[last_id];

  if (id !== last_id) {
    dg.floor[monster.pos.y][monster.pos.x].creature_id = u8(id);
    monsters[id].assign(monsters[last_id]);
  }

  monsters[last_id].assign(blank_monster);
  globals.next_free_monster_id--;
}

// Creates objects nearby the coordinates given -RAK-
export async function dungeonSummonObject(coord: Coord_t, amount: number, object_type: number): Promise<number> {
  let real_type: number;

  if (object_type === 1 || object_type === 5) {
    real_type = 1; // object_type == 1 -> objects
  } else {
    real_type = 256; // object_type == 2 -> gold
  }

  let result = 0;

  do {
    for (let tries = 0; tries <= 20; tries++) {
      const at: Coord_t = {
        y: coord.y - 3 + randomNumber(5),
        x: coord.x - 3 + randomNumber(5),
      };

      if (coordInBounds(at) && los(coord, at)) {
        if (dg.floor[at.y][at.x].feature_id <= MAX_OPEN_SPACE && dg.floor[at.y][at.x].treasure_id === 0) {
          // object_type == 3 -> 50% objects, 50% gold
          if (object_type === 3 || object_type === 7) {
            if (randomNumber(100) < 50) {
              real_type = 1;
            } else {
              real_type = 256;
            }
          }

          if (real_type === 1) {
            await dungeonPlaceRandomObjectAt(at, object_type >= 4);
          } else {
            await dungeonPlaceGold(at);
          }

          dungeonLiteSpot(at);

          if (caveTileVisible(at)) {
            result += real_type;
          }

          tries = 20;
        }
      }
    }

    amount--;
  } while (amount !== 0);

  return result;
}

// Deletes object from given location -RAK-
export function dungeonDeleteObject(coord: Coord_t): boolean {
  const tile = dg.floor[coord.y][coord.x];

  if (tile.feature_id === TILE_BLOCKED_FLOOR) {
    tile.feature_id = TILE_CORR_FLOOR;
  }

  pusht(tile.treasure_id);

  tile.treasure_id = 0;
  tile.field_mark = false;

  dungeonLiteSpot(coord);

  return caveTileVisible(coord);
}
