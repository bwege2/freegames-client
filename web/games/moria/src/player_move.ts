// player_move.cpp: Game initialization and maintenance related functions
import { config } from './config.ts';
import {
  CLASS_MISC_HIT, MAX_OPEN_SPACE, MIN_CLOSED_SPACE, PlayerAttr, TILE_LIGHT_FLOOR, TV_GOLD, TV_INVIS_TRAP, TV_MAX_PICK_UP,
  TV_CLOSED_DOOR, TV_RUBBLE, TV_STORE_DOOR, TV_VIS_TRAP,
} from './constants.ts';
import { diceRoll } from './dice.ts';
import {
  dungeonDeleteObject, dungeonLightRoom, dungeonMoveCharacterLight, dungeonMoveCreatureRecord, dungeonPlaceRandomObjectAt,
  dungeonPlaceRubble, dungeonSetTrap, trapChangeVisibility,
} from './dungeon.ts';
import { randomNumber } from './game.ts';
import { dg, game, monsters, py } from './globals.ts';
import { itemDescription } from './identification.ts';
import {
  damageAcid, damageCorrodingGas, damageFire, damagePoisonedGas, inventoryCanCarryItem, inventoryCanCarryItemCount,
  inventoryCarryItem,
} from './inventory.ts';
import { ord, ref, sprintf } from './libc.ts';
import { monsterSummon } from './monster_manager.ts';
import { playerAttackPosition, playerMovePosition, playerSearch, playerTakesHit, playerTestBeingHit } from './player.ts';
import { playerAreaAffect, playerEndRunning } from './player_run.ts';
import { playerStatRandomDecrease } from './player_stats.ts';
import { storeEnter } from './store.ts';
import type { Coord_t, Inventory_t } from './structs.ts';
import { coordOutsidePanel, drawDungeonPanel, printCharacterGoldValue } from './ui.ts';
import { getInputConfirmation, printMessage } from './ui_io.ts';

async function trapOpenPit(item: Inventory_t, dam: number): Promise<void> {
  await printMessage('You fell into a pit!');

  if (py.flags.free_fall) {
    await printMessage('You gently float down.');
    return;
  }

  const description = ref('');
  itemDescription(description, item, true);
  playerTakesHit(dam, description.v);
}

async function trapArrow(item: Inventory_t, dam: number): Promise<void> {
  if (await playerTestBeingHit(125, 0, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
    const description = ref('');
    itemDescription(description, item, true);
    playerTakesHit(dam, description.v);

    await printMessage('An arrow hits you.');
    return;
  }

  await printMessage('An arrow barely misses you.');
}

async function trapCoveredPit(item: Inventory_t, dam: number, coord: Coord_t): Promise<void> {
  await printMessage('You fell into a covered pit.');

  if (py.flags.free_fall) {
    await printMessage('You gently float down.');
  } else {
    const description = ref('');
    itemDescription(description, item, true);
    playerTakesHit(dam, description.v);
  }

  await dungeonSetTrap(coord, 0);
}

async function trapDoor(item: Inventory_t, dam: number): Promise<void> {
  dg.generate_new_level = true;
  dg.current_level++;

  await printMessage('You fell through a trap door!');

  if (py.flags.free_fall) {
    await printMessage('You gently float down.');
  } else {
    const description = ref('');
    itemDescription(description, item, true);
    playerTakesHit(dam, description.v);
  }

  // Force the messages to display before starting to generate the next level.
  await printMessage(null);
}

async function trapSleepingGas(): Promise<void> {
  if (py.flags.paralysis !== 0) {
    return;
  }

  await printMessage('A strange white mist surrounds you!');

  if (py.flags.free_action) {
    await printMessage('You are unaffected.');
    return;
  }

  py.flags.paralysis += randomNumber(10) + 4;
  await printMessage('You fall asleep.');
}

async function trapHiddenObject(coord: Coord_t): Promise<void> {
  dungeonDeleteObject(coord);

  await dungeonPlaceRandomObjectAt(coord, false);

  await printMessage('Hmmm, there was something under this rock.');
}

async function trapStrengthDart(item: Inventory_t, dam: number): Promise<void> {
  if (await playerTestBeingHit(125, 0, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
    if (!py.flags.sustain_str) {
      await playerStatRandomDecrease(PlayerAttr.A_STR);

      const description = ref('');
      itemDescription(description, item, true);
      playerTakesHit(dam, description.v);

      await printMessage('A small dart weakens you!');
    } else {
      await printMessage('A small dart hits you.');
    }
  } else {
    await printMessage('A small dart barely misses you.');
  }
}

async function trapTeleport(coord: Coord_t): Promise<void> {
  game.teleport_player = true;

  await printMessage('You hit a teleport trap!');

  // Light up the teleport trap, before we teleport away.
  dungeonMoveCharacterLight(coord, coord);
}

async function trapRockfall(coord: Coord_t, dam: number): Promise<void> {
  playerTakesHit(dam, 'a falling rock');

  dungeonDeleteObject(coord);
  await dungeonPlaceRubble(coord);

  await printMessage('You are hit by falling rock.');
}

async function trapCorrodeGas(): Promise<void> {
  await printMessage('A strange red gas surrounds you.');

  await damageCorrodingGas('corrosion gas');
}

async function trapSummonMonster(coord: Coord_t): Promise<void> {
  // Rune disappears.
  dungeonDeleteObject(coord);

  const num = 2 + randomNumber(3);

  const location: Coord_t = { y: 0, x: 0 };

  for (let i = 0; i < num; i++) {
    location.y = coord.y;
    location.x = coord.x;
    await monsterSummon(location, false);
  }
}

async function trapFire(dam: number): Promise<void> {
  await printMessage('You are enveloped in flames!');

  await damageFire(dam, 'a fire trap');
}

async function trapAcid(dam: number): Promise<void> {
  await printMessage('You are splashed with acid!');

  await damageAcid(dam, 'an acid trap');
}

async function trapPoisonGas(dam: number): Promise<void> {
  await printMessage('A pungent green gas surrounds you!');

  damagePoisonedGas(dam, 'a poison gas trap');
}

async function trapBlindGas(): Promise<void> {
  await printMessage('A black gas surrounds you!');

  py.flags.blind += randomNumber(50) + 50;
}

async function trapConfuseGas(): Promise<void> {
  await printMessage('A gas of scintillating colors surrounds you!');

  py.flags.confused += randomNumber(15) + 15;
}

async function trapSlowDart(item: Inventory_t, dam: number): Promise<void> {
  if (await playerTestBeingHit(125, 0, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
    const description = ref('');
    itemDescription(description, item, true);
    playerTakesHit(dam, description.v);

    await printMessage('A small dart hits you!');

    if (py.flags.free_action) {
      await printMessage('You are unaffected.');
    } else {
      py.flags.slow += randomNumber(20) + 10;
    }
  } else {
    await printMessage('A small dart barely misses you.');
  }
}

async function trapConstitutionDart(item: Inventory_t, dam: number): Promise<void> {
  if (await playerTestBeingHit(125, 0, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
    if (!py.flags.sustain_con) {
      await playerStatRandomDecrease(PlayerAttr.A_CON);

      const description = ref('');
      itemDescription(description, item, true);
      playerTakesHit(dam, description.v);

      await printMessage('A small dart saps your health!');
    } else {
      await printMessage('A small dart hits you.');
    }
  } else {
    await printMessage('A small dart barely misses you.');
  }
}

/** enum class TrapTypes */
const TrapTypes = {
  OpenPit: 1,
  ArrowPit: 2,
  CoveredPit: 3,
  TrapDoor: 4,
  SleepingGas: 5,
  HiddenObject: 6,
  DartOfStr: 7,
  Teleport: 8,
  Rockfall: 9,
  CorrodingGas: 10,
  SummonMonster: 11,
  FireTrap: 12,
  AcidTrap: 13,
  PoisonGasTrap: 14, // TODO: name would clash with MagicSpellFlags::PoisonGas
  BlindingGas: 15,
  ConfuseGas: 16,
  SlowDart: 17,
  DartOfCon: 18,
  SecretDoor: 19,
  ScareMonster: 99,
  GeneralStore: 101,
  Armory: 102,
  Weaponsmith: 103,
  Temple: 104,
  Alchemist: 105,
  MagicShop: 106,
} as const;

// Player hit a trap.  (Chuckle) -RAK-
async function playerStepsOnTrap(coord: Coord_t): Promise<void> {
  coord = { y: coord.y, x: coord.x };

  playerEndRunning();
  trapChangeVisibility(coord);

  const item = game.treasure.list[dg.floor[coord.y][coord.x].treasure_id];

  const damage = diceRoll(item.damage);

  switch (item.sub_category_id) {
    case TrapTypes.OpenPit:
      await trapOpenPit(item, damage);
      break;
    case TrapTypes.ArrowPit:
      await trapArrow(item, damage);
      break;
    case TrapTypes.CoveredPit:
      await trapCoveredPit(item, damage, coord);
      break;
    case TrapTypes.TrapDoor:
      await trapDoor(item, damage);
      break;
    case TrapTypes.SleepingGas:
      await trapSleepingGas();
      break;
    case TrapTypes.HiddenObject:
      await trapHiddenObject(coord);
      break;
    case TrapTypes.DartOfStr:
      await trapStrengthDart(item, damage);
      break;
    case TrapTypes.Teleport:
      await trapTeleport(coord);
      break;
    case TrapTypes.Rockfall:
      await trapRockfall(coord, damage);
      break;
    case TrapTypes.CorrodingGas:
      await trapCorrodeGas();
      break;
    case TrapTypes.SummonMonster:
      await trapSummonMonster(coord);
      break;
    case TrapTypes.FireTrap:
      await trapFire(damage);
      break;
    case TrapTypes.AcidTrap:
      await trapAcid(damage);
      break;
    case TrapTypes.PoisonGasTrap:
      await trapPoisonGas(damage);
      break;
    case TrapTypes.BlindingGas:
      await trapBlindGas();
      break;
    case TrapTypes.ConfuseGas:
      await trapConfuseGas();
      break;
    case TrapTypes.SlowDart:
      await trapSlowDart(item, damage);
      break;
    case TrapTypes.DartOfCon:
      await trapConstitutionDart(item, damage);
      break;
    case TrapTypes.SecretDoor:
    case TrapTypes.ScareMonster:
      break;

    // Town level traps are special, the stores.
    case TrapTypes.GeneralStore:
      await storeEnter(0);
      break;
    case TrapTypes.Armory:
      await storeEnter(1);
      break;
    case TrapTypes.Weaponsmith:
      await storeEnter(2);
      break;
    case TrapTypes.Temple:
      await storeEnter(3);
      break;
    case TrapTypes.Alchemist:
      await storeEnter(4);
      break;
    case TrapTypes.MagicShop:
      await storeEnter(5);
      break;

    default:
      // All cases are handled, so this should never be reached!
      await printMessage('Unknown trap value.');
      break;
  }
}

function playerRandomMovement(dir: number): boolean {
  // Never random if sitting
  if (dir === 5) {
    return false;
  }

  // 75% random movement
  const player_random_move = randomNumber(4) > 1;

  const player_is_confused = py.flags.confused > 0;

  return player_is_confused && player_random_move;
}

// Player is on an object. Many things can happen based -RAK-
// on the TVAL of the object. Traps are set off, money and most objects
// are picked up. Some objects, such as open doors, just sit there.
async function carry(coord: Coord_t, pickup: boolean): Promise<void> {
  coord = { y: coord.y, x: coord.x };

  const item = game.treasure.list[dg.floor[coord.y][coord.x].treasure_id];

  const tile_flags = game.treasure.list[dg.floor[coord.y][coord.x].treasure_id].category_id;

  if (tile_flags > TV_MAX_PICK_UP) {
    if (tile_flags === TV_INVIS_TRAP || tile_flags === TV_VIS_TRAP || tile_flags === TV_STORE_DOOR) {
      // OOPS!
      await playerStepsOnTrap(coord);
    }
    return;
  }

  const description = ref('');
  let msg = '';

  playerEndRunning();

  // There's GOLD in them thar hills!
  if (tile_flags === TV_GOLD) {
    py.misc.au += item.cost;

    itemDescription(description, item, true);
    msg = sprintf('You have found %d gold pieces worth of %s', item.cost, description.v);

    printCharacterGoldValue();
    dungeonDeleteObject(coord);

    await printMessage(msg);

    return;
  }

  // Too many objects?
  if (inventoryCanCarryItemCount(item)) {
    // Okay,  pick it up
    if (pickup && config.options.prompt_to_pickup) {
      itemDescription(description, item, true);

      // change the period to a question mark
      description.v = description.v.slice(0, description.v.length - 1) + '?';
      pickup = await getInputConfirmation('Pick up ' + description.v);
    }

    // Check to see if it will change the players speed.
    if (pickup && !inventoryCanCarryItem(item)) {
      itemDescription(description, item, true);

      // change the period to a question mark
      description.v = description.v.slice(0, description.v.length - 1) + '?';
      pickup = await getInputConfirmation('Exceed your weight limit to pick up ' + description.v);
    }

    // Attempt to pick up an object.
    if (pickup) {
      const locn = inventoryCarryItem(item);

      itemDescription(description, py.inventory[locn], true);
      msg = sprintf('You have %s (%c)', description.v, locn + ord('a'));
      await printMessage(msg);
      dungeonDeleteObject(coord);
    }
  } else {
    itemDescription(description, item, true);
    msg = sprintf("You can't carry %s", description.v);
    await printMessage(msg);
  }
}

// Moves player from one space to another. -RAK-
export async function playerMove(direction: number, do_pickup: boolean): Promise<void> {
  if (playerRandomMovement(direction)) {
    direction = randomNumber(9);
    playerEndRunning();
  }

  const coord = { y: py.pos.y, x: py.pos.x };

  // Legal move?
  if (!playerMovePosition(direction, coord)) {
    return;
  }

  const tile = dg.floor[coord.y][coord.x];
  const monster = monsters[tile.creature_id];

  // if there is no creature, or an unlit creature in the walls then...
  // disallow attacks against unlit creatures in walls because moving into
  // a wall is a free turn normally, hence don't give player free turns
  // attacking each wall in an attempt to locate the invisible creature,
  // instead force player to tunnel into walls which always takes a turn
  if (tile.creature_id < 2 || (!monster.lit && tile.feature_id >= MIN_CLOSED_SPACE)) {
    // Open floor spot
    if (tile.feature_id <= MAX_OPEN_SPACE) {
      // Make final assignments of char coords
      const old_coord = { y: py.pos.y, x: py.pos.x };

      py.pos.y = coord.y;
      py.pos.x = coord.x;

      // Move character record (-1)
      dungeonMoveCreatureRecord(old_coord, py.pos);

      // Check for new panel
      if (coordOutsidePanel(py.pos, false)) {
        await drawDungeonPanel();
      }

      // Check to see if they should stop
      if (py.running_tracker !== 0) {
        playerAreaAffect(direction, py.pos);
      }

      // Check to see if they've noticed something
      // fos may be negative if have good rings of searching
      if (py.misc.fos <= 1 || randomNumber(py.misc.fos) === 1 || ((py.flags.status & config.player.status.PY_SEARCH) !== 0)) {
        await playerSearch(py.pos, py.misc.chance_in_search);
      }

      if (tile.feature_id === TILE_LIGHT_FLOOR) {
        // A room of light should be lit.

        if (!tile.permanent_light && (py.flags.blind === 0)) {
          dungeonLightRoom(py.pos);
        }
      } else if (tile.perma_lit_room && py.flags.blind < 1) {
        // In doorway of light-room?

        for (let row = (py.pos.y - 1); row <= (py.pos.y + 1); row++) {
          for (let col = (py.pos.x - 1); col <= (py.pos.x + 1); col++) {
            if (dg.floor[row][col].feature_id === TILE_LIGHT_FLOOR && !dg.floor[row][col].permanent_light) {
              dungeonLightRoom({ y: row, x: col });
            }
          }
        }
      }

      // Move the light source
      dungeonMoveCharacterLight(old_coord, py.pos);

      // An object is beneath them.
      if (tile.treasure_id !== 0) {
        await carry(py.pos, do_pickup);

        // if stepped on falling rock trap, and space contains
        // rubble, then step back into a clear area
        if (game.treasure.list[tile.treasure_id].category_id === TV_RUBBLE) {
          dungeonMoveCreatureRecord(py.pos, old_coord);
          dungeonMoveCharacterLight(py.pos, old_coord);

          py.pos.y = old_coord.y;
          py.pos.x = old_coord.x;

          // check to see if we have stepped back onto another trap, if so, set it off
          const id = dg.floor[py.pos.y][py.pos.x].treasure_id;
          if (id !== 0) {
            const val = game.treasure.list[id].category_id;
            if (val === TV_INVIS_TRAP || val === TV_VIS_TRAP || val === TV_STORE_DOOR) {
              await playerStepsOnTrap(py.pos);
            }
          }
        }
      }
    } else {
      // Can't move onto floor space

      if ((py.running_tracker === 0) && tile.treasure_id !== 0) {
        if (game.treasure.list[tile.treasure_id].category_id === TV_RUBBLE) {
          await printMessage('There is rubble blocking your way.');
        } else if (game.treasure.list[tile.treasure_id].category_id === TV_CLOSED_DOOR) {
          await printMessage('There is a closed door blocking your way.');
        }
      } else {
        playerEndRunning();
      }
      game.player_free_turn = true;
    }
  } else {
    // Attacking a creature!

    const old_find_flag = py.running_tracker;

    playerEndRunning();

    // if player can see monster, and was in find mode, then nothing
    if (monster.lit && (old_find_flag !== 0)) {
      // did not do anything this turn
      game.player_free_turn = true;
    } else {
      await playerAttackPosition(coord);
    }
  }
}
