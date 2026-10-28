// player_bash.cpp: The running algorithm: -CJS-
import { config } from './config.ts';
import {
  BTH_PER_PLUS_TO_HIT_ADJUST, MIN_CAVE_WALL, PlayerAttr, PlayerClassLevelAdj, PlayerEquipment, TILE_CORR_FLOOR, TV_CHEST,
  TV_CLOSED_DOOR,
} from './constants.ts';
import { creatures_list } from './data_creatures.ts';
import { class_level_adj } from './data_player.ts';
import { diceRoll, maxDiceRoll } from './dice.ts';
import { dungeonLiteSpot } from './dungeon.ts';
import { getDirectionWithMemory, getRandomDirection, randomNumber } from './game.ts';
import { dg, game, monsters, py } from './globals.ts';
import { inventoryItemCopyTo } from './inventory.ts';
import { abs, idiv, ref, sprintf, toupper } from './libc.ts';
import { monsterTakeHit } from './monster.ts';
import { playerMovePosition, playerTestBeingHit, playerWeaponCriticalBlow } from './player.ts';
import { playerMove } from './player_move.ts';
import type { Coord_t, Inventory_t, Tile_t } from './structs.ts';
import { displayCharacterExperience } from './ui.ts';
import { printMessage, printMessageNoCommandInterrupt } from './ui_io.ts';

// Bash open a door or chest -RAK-
// Note: Affected by strength and weight of character
//
// For a closed door, `misc_use` is positive if locked; negative if stuck. A disarm spell
// unlocks and unjams doors!
//
// For an open door, `misc_use` is positive for a broken door.
//
// A closed door can be opened - harder if locked. Any door might be bashed open
// (and thereby broken). Bashing a door is (potentially) faster! You move into the
// door way. To open a stuck door, it must be bashed. A closed door can be jammed
// (which makes it stuck if previously locked).
//
// Creatures can also open doors. A creature with open door ability will (if not
// in the line of sight) move though a closed or secret door with no changes. If
// in the line of sight, closed door are opened, & secret door revealed. Whether
// in the line of sight or not, such a creature may unlock or unstick a door.
//
// A creature with no such ability will attempt to bash a non-secret door.
export async function playerBash(): Promise<void> {
  const dir = ref(0);
  if (!(await getDirectionWithMemory(null, dir))) {
    return;
  }

  if (py.flags.confused > 0) {
    await printMessage('You are confused.');
    dir.v = getRandomDirection();
  }

  const coord = { y: py.pos.y, x: py.pos.x };
  playerMovePosition(dir.v, coord);

  const tile = dg.floor[coord.y][coord.x];

  if (tile.creature_id > 1) {
    await playerBashPosition(coord);
    return;
  }

  if (tile.treasure_id !== 0) {
    const item = game.treasure.list[tile.treasure_id];

    if (item.category_id === TV_CLOSED_DOOR) {
      await playerBashClosedDoor(coord, dir.v, tile, item);
    } else if (item.category_id === TV_CHEST) {
      await playerBashClosedChest(item);
    } else {
      // Can't give free turn, or else player could try
      // directions until they find the invisible creature
      await printMessage('You bash it, but nothing interesting happens.');
    }
    return;
  }

  if (tile.feature_id < MIN_CAVE_WALL) {
    await printMessage('You bash at empty space.');
    return;
  }

  // same message for wall as for secret door
  await printMessage('You bash it, but nothing interesting happens.');
}

// Make a bash attack on someone. -CJS-
// Used to be part of bash above.
async function playerBashAttack(coord: Coord_t): Promise<void> {
  const monster_id = dg.floor[coord.y][coord.x].creature_id;

  const monster = monsters[monster_id];
  const creature = creatures_list[monster.creature_id];

  monster.sleep_count = 0;

  // Does the player know what they're fighting?
  let name: string;
  if (!monster.lit) {
    name = 'it';
  } else {
    name = sprintf('the %s', creature.name);
  }

  let base_to_hit = py.stats.used[PlayerAttr.A_STR];
  base_to_hit += idiv(py.inventory[PlayerEquipment.Arm].weight, 2);
  base_to_hit += idiv(py.misc.weight, 10);

  if (!monster.lit) {
    base_to_hit = idiv(base_to_hit, 2);
    base_to_hit -= py.stats.used[PlayerAttr.A_DEX] * (BTH_PER_PLUS_TO_HIT_ADJUST - 1);
    base_to_hit -= idiv(py.misc.level * class_level_adj[py.misc.class_id][PlayerClassLevelAdj.BTH], 2);
  }

  if (await playerTestBeingHit(base_to_hit, py.misc.level, py.stats.used[PlayerAttr.A_DEX], creature.ac, PlayerClassLevelAdj.BTH)) {
    let msg = sprintf('You hit %s.', name);
    await printMessage(msg);

    let damage = diceRoll(py.inventory[PlayerEquipment.Arm].damage);
    damage = await playerWeaponCriticalBlow(idiv(py.inventory[PlayerEquipment.Arm].weight, 4) + py.stats.used[PlayerAttr.A_STR], 0, damage, PlayerClassLevelAdj.BTH);
    damage += idiv(py.misc.weight, 60);
    damage += 3;

    if (damage < 0) {
      damage = 0;
    }

    // See if we done it in.
    if ((await monsterTakeHit(monster_id, damage)) >= 0) {
      msg = sprintf('You have slain %s.', name);
      await printMessage(msg);
      await displayCharacterExperience();
    } else {
      name = toupper(name[0]) + name.slice(1); // Capitalize

      // Can not stun Balrog
      let avg_max_hp: number;
      if ((creature.defenses & config.monsters.defense.CD_MAX_HP) !== 0) {
        avg_max_hp = maxDiceRoll(creature.hit_die);
      } else {
        // TODO: use maxDiceRoll(), just be careful about the bit shift
        avg_max_hp = (creature.hit_die.dice * (creature.hit_die.sides + 1)) >> 1;
      }

      if (100 + randomNumber(400) + randomNumber(400) > monster.hp + avg_max_hp) {
        monster.stunned_amount += randomNumber(3) + 1;
        if (monster.stunned_amount > 24) {
          monster.stunned_amount = 24;
        }

        msg = sprintf('%s appears stunned!', name);
      } else {
        msg = sprintf('%s ignores your bash!', name);
      }
      await printMessage(msg);
    }
  } else {
    const msg = sprintf('You miss %s.', name);
    await printMessage(msg);
  }

  if (randomNumber(150) > py.stats.used[PlayerAttr.A_DEX]) {
    await printMessage('You are off balance.');
    py.flags.paralysis = 1 + randomNumber(2);
  }
}

async function playerBashPosition(coord: Coord_t): Promise<void> {
  // Is a Coward?
  if (py.flags.afraid > 0) {
    await printMessage('You are afraid!');
    return;
  }

  await playerBashAttack(coord);
}

async function playerBashClosedDoor(coord: Coord_t, dir: number, tile: Tile_t, item: Inventory_t): Promise<void> {
  await printMessageNoCommandInterrupt('You smash into the door!');

  const chance = py.stats.used[PlayerAttr.A_STR] + idiv(py.misc.weight, 2);

  // Use (roughly) similar method as for monsters.
  const abs_misc_use = abs(item.misc_use);
  if (randomNumber(chance * (20 + abs_misc_use)) < 10 * (chance - abs_misc_use)) {
    await printMessage('The door crashes open!');

    inventoryItemCopyTo(config.dungeon.objects.OBJ_OPEN_DOOR, game.treasure.list[tile.treasure_id]);

    // 50% chance of breaking door
    item.misc_use = 1 - randomNumber(2);

    tile.feature_id = TILE_CORR_FLOOR;

    if (py.flags.confused === 0) {
      await playerMove(dir, false);
    } else {
      dungeonLiteSpot(coord);
    }

    return;
  }

  if (randomNumber(150) > py.stats.used[PlayerAttr.A_DEX]) {
    await printMessage('You are off-balance.');
    py.flags.paralysis = 1 + randomNumber(2);
    return;
  }

  if (game.command_count === 0) {
    await printMessage('The door holds firm.');
  }
}

async function playerBashClosedChest(item: Inventory_t): Promise<void> {
  if (randomNumber(10) === 1) {
    await printMessage('You have destroyed the chest.');
    await printMessage('and its contents!');

    item.id = config.dungeon.objects.OBJ_RUINED_CHEST;
    item.flags = 0;

    return;
  }

  if ((item.flags & config.treasure.chests.CH_LOCKED) !== 0 && randomNumber(10) === 1) {
    await printMessage('The lock breaks open!');

    item.flags &= ~config.treasure.chests.CH_LOCKED;

    return;
  }

  await printMessageNoCommandInterrupt('The chest holds firm.');
}
