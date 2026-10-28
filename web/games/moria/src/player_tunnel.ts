// player_tunnel.cpp: Player throw functions
import { config } from './config.ts';
import {
  MIN_CAVE_WALL, PlayerAttr, PlayerEquipment, TILE_BOUNDARY_WALL, TILE_GRANITE_WALL, TILE_MAGMA_WALL, TILE_QUARTZ_WALL, TV_NOTHING, TV_RUBBLE,
  TV_SECRET_DOOR,
} from './constants.ts';
import { maxDiceRoll } from './dice.ts';
import { caveTileVisible, dungeonDeleteObject, dungeonLiteSpot, dungeonPlaceRandomObjectAt } from './dungeon.ts';
import { randomNumber } from './game.ts';
import { dg, game, py } from './globals.ts';
import { objectBlockedByMonster } from './identification.ts';
import { playerAttackPosition, playerMovePosition, playerSearch, playerTunnelWall } from './player.ts';
import type { Coord_t, Inventory_t } from './structs.ts';
import { printMessage, printMessageNoCommandInterrupt } from './ui_io.ts';

// Don't let the player tunnel somewhere illegal, this is necessary to
// prevent the player from getting a free attack by trying to tunnel
// somewhere where it has no effect.
async function playerCanTunnel(treasure_id: number, tile_id: number): Promise<boolean> {
  if (tile_id < MIN_CAVE_WALL &&
    (treasure_id === 0 || (game.treasure.list[treasure_id].category_id !== TV_RUBBLE && game.treasure.list[treasure_id].category_id !== TV_SECRET_DOOR))) {
    game.player_free_turn = true;

    if (treasure_id === 0) {
      await printMessage('Tunnel through what?  Empty air?!?');
    } else {
      await printMessage("You can't tunnel through that.");
    }

    return false;
  }

  return true;
}

// Compute the digging ability of player; based on strength, and type of tool used
function playerDiggingAbility(weapon: Inventory_t): number {
  let digging_ability = py.stats.used[PlayerAttr.A_STR];

  if ((weapon.flags & config.treasure.flags.TR_TUNNEL) !== 0) {
    digging_ability += 25 + weapon.misc_use * 50;
  } else {
    digging_ability += maxDiceRoll(weapon.damage) + weapon.to_hit + weapon.to_damage;

    // divide by two so that digging without shovel isn't too easy
    digging_ability >>= 1;
  }

  // If this weapon is too heavy for the player to wield properly,
  // then also make it harder to dig with it.
  if (py.weapon_is_heavy) {
    digging_ability += py.stats.used[PlayerAttr.A_STR] * 15 - weapon.weight;

    if (digging_ability < 0) {
      digging_ability = 0;
    }
  }

  return digging_ability;
}

async function dungeonDigGraniteWall(coord: Coord_t, digging_ability: number): Promise<void> {
  const i = randomNumber(1200) + 80;

  if (await playerTunnelWall(coord, digging_ability, i)) {
    await printMessage('You have finished the tunnel.');
  } else {
    await printMessageNoCommandInterrupt('You tunnel into the granite wall.');
  }
}

async function dungeonDigMagmaWall(coord: Coord_t, digging_ability: number): Promise<void> {
  const i = randomNumber(600) + 10;

  if (await playerTunnelWall(coord, digging_ability, i)) {
    await printMessage('You have finished the tunnel.');
  } else {
    await printMessageNoCommandInterrupt('You tunnel into the magma intrusion.');
  }
}

async function dungeonDigQuartzWall(coord: Coord_t, digging_ability: number): Promise<void> {
  const i = randomNumber(400) + 10;

  if (await playerTunnelWall(coord, digging_ability, i)) {
    await printMessage('You have finished the tunnel.');
  } else {
    await printMessageNoCommandInterrupt('You tunnel into the quartz vein.');
  }
}

async function dungeonDigRubble(coord: Coord_t, digging_ability: number): Promise<void> {
  if (digging_ability > randomNumber(180)) {
    dungeonDeleteObject(coord);
    await printMessage('You have removed the rubble.');

    if (randomNumber(10) === 1) {
      await dungeonPlaceRandomObjectAt(coord, false);

      if (caveTileVisible(coord)) {
        await printMessage('You have found something!');
      }
    }

    dungeonLiteSpot(coord);
  } else {
    await printMessageNoCommandInterrupt('You dig in the rubble.');
  }
}

// Dig regular walls; Granite, magma intrusion, quartz vein
// Don't forget the boundary walls, made of titanium (255)
// Return `true` if a wall was dug at
async function dungeonDigAtLocation(coord: Coord_t, wall_type: number, digging_ability: number): Promise<boolean> {
  switch (wall_type) {
    case TILE_GRANITE_WALL:
      await dungeonDigGraniteWall(coord, digging_ability);
      break;
    case TILE_MAGMA_WALL:
      await dungeonDigMagmaWall(coord, digging_ability);
      break;
    case TILE_QUARTZ_WALL:
      await dungeonDigQuartzWall(coord, digging_ability);
      break;
    case TILE_BOUNDARY_WALL:
      await printMessage('This seems to be permanent rock.');
      break;
    default:
      return false;
  }
  return true;
}

// Tunnels through rubble and walls -RAK-
// Must take into account: secret doors, special tools
export async function playerTunnel(direction: number): Promise<void> {
  // Confused?                    75% random movement
  if (py.flags.confused > 0 && randomNumber(4) > 1) {
    direction = randomNumber(9);
  }

  const coord = { y: py.pos.y, x: py.pos.x };
  playerMovePosition(direction, coord);

  const tile = dg.floor[coord.y][coord.x];
  const item = py.inventory[PlayerEquipment.Wield];

  if (!(await playerCanTunnel(tile.treasure_id, tile.feature_id))) {
    return;
  }

  if (tile.creature_id > 1) {
    await objectBlockedByMonster(tile.creature_id);
    await playerAttackPosition(coord);
    return;
  }

  if (item.category_id !== TV_NOTHING) {
    const digging_ability = playerDiggingAbility(item);

    if (!(await dungeonDigAtLocation(coord, tile.feature_id, digging_ability))) {
      // Is there an object in the way?  (Rubble and secret doors)
      if (tile.treasure_id !== 0) {
        if (game.treasure.list[tile.treasure_id].category_id === TV_RUBBLE) {
          await dungeonDigRubble(coord, digging_ability);
        } else if (game.treasure.list[tile.treasure_id].category_id === TV_SECRET_DOOR) {
          // Found secret door!
          await printMessageNoCommandInterrupt('You tunnel into the granite wall.');
          await playerSearch({ y: py.pos.y, x: py.pos.x }, py.misc.chance_in_search);
        } else {
          throw new Error('abort: playerTunnel');
        }
      } else {
        throw new Error('abort: playerTunnel');
      }
    }

    return;
  }

  await printMessage('You dig with your hands, making no progress.');
}
