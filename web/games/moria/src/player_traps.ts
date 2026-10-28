// player_traps.cpp: Player functions related to traps
import { config } from './config.ts';
import { PlayerAttr, PlayerClassLevelAdj, SpecialNameIds, TV_CHEST, TV_VIS_TRAP } from './constants.ts';
import { class_level_adj } from './data_player.ts';
import { diceRoll } from './dice.ts';
import { dungeonDeleteObject } from './dungeon.ts';
import { getDirectionWithMemory, randomNumber } from './game.ts';
import { dg, game, py } from './globals.ts';
import { objectBlockedByMonster, spellItemIdentified, spellItemIdentifyAndRemoveRandomInscription } from './identification.ts';
import { i16, idiv, ref } from './libc.ts';
import { monsterSummon } from './monster_manager.ts';
import { playerMovePosition, playerNoLight, playerTakesHit } from './player.ts';
import { playerMove } from './player_move.ts';
import { playerDisarmAdjustment, playerStatAdjustmentWisdomIntelligence, playerStatRandomDecrease } from './player_stats.ts';
import type { Coord_t, Inventory_t } from './structs.ts';
import { displayCharacterExperience } from './ui.ts';
import { printMessage, printMessageNoCommandInterrupt } from './ui_io.ts';

function playerTrapDisarmAbility(): number {
  let ability = py.misc.disarm;
  ability += 2;
  ability *= playerDisarmAdjustment();
  ability += playerStatAdjustmentWisdomIntelligence(PlayerAttr.A_INT);
  ability += idiv(class_level_adj[py.misc.class_id][PlayerClassLevelAdj.DISARM] * py.misc.level, 3);

  if (py.flags.blind > 0 || playerNoLight()) {
    ability = idiv(ability, 10);
  }

  if (py.flags.confused > 0) {
    ability = idiv(ability, 10);
  }

  if (py.flags.image > 0) {
    ability = idiv(ability, 10);
  }

  return ability;
}

async function playerDisarmFloorTrap(coord: Coord_t, total: number, level: number, dir: number, misc_use: number): Promise<void> {
  const confused = py.flags.confused;

  if (total + 100 - level > randomNumber(100)) {
    await printMessage('You have disarmed the trap.');
    py.misc.exp += misc_use;
    dungeonDeleteObject(coord);

    // make sure we move onto the trap even if confused
    py.flags.confused = 0;
    await playerMove(dir, false);
    py.flags.confused = i16(confused);

    await displayCharacterExperience();
    return;
  }

  // avoid randomNumber(0) call
  if (total > 5 && randomNumber(total) > 5) {
    await printMessageNoCommandInterrupt('You failed to disarm the trap.');
    return;
  }

  await printMessage('You set the trap off!');

  // make sure we move onto the trap even if confused
  py.flags.confused = 0;
  await playerMove(dir, false);
  py.flags.confused += confused;
}

async function playerDisarmChestTrap(coord: Coord_t, total: number, item: Inventory_t): Promise<void> {
  if (!spellItemIdentified(item)) {
    game.player_free_turn = true;
    await printMessage("I don't see a trap.");

    return;
  }

  if ((item.flags & config.treasure.chests.CH_TRAPPED) !== 0) {
    const level = item.depth_first_found;

    if (total - level > randomNumber(100)) {
      item.flags &= ~config.treasure.chests.CH_TRAPPED;

      if ((item.flags & config.treasure.chests.CH_LOCKED) !== 0) {
        item.special_name_id = SpecialNameIds.SN_LOCKED;
      } else {
        item.special_name_id = SpecialNameIds.SN_DISARMED;
      }

      await printMessage('You have disarmed the chest.');

      spellItemIdentifyAndRemoveRandomInscription(item);
      py.misc.exp += level;

      await displayCharacterExperience();
    } else if (total > 5 && randomNumber(total) > 5) {
      await printMessageNoCommandInterrupt('You failed to disarm the chest.');
    } else {
      await printMessage('You set a trap off!');
      spellItemIdentifyAndRemoveRandomInscription(item);
      await chestTrap(coord);
    }
    return;
  }

  await printMessage('The chest was not trapped.');
  game.player_free_turn = true;
}

// Disarms a trap -RAK-
export async function playerDisarmTrap(): Promise<void> {
  const dir = ref(0);
  if (!(await getDirectionWithMemory(null, dir))) {
    return;
  }

  const coord = { y: py.pos.y, x: py.pos.x };
  playerMovePosition(dir.v, coord);

  const tile = dg.floor[coord.y][coord.x];

  let no_disarm = false;

  if (tile.creature_id > 1 && tile.treasure_id !== 0 &&
    (game.treasure.list[tile.treasure_id].category_id === TV_VIS_TRAP || game.treasure.list[tile.treasure_id].category_id === TV_CHEST)) {
    await objectBlockedByMonster(tile.creature_id);
  } else if (tile.treasure_id !== 0) {
    const disarm_ability = playerTrapDisarmAbility();

    const item = game.treasure.list[tile.treasure_id];

    if (item.category_id === TV_VIS_TRAP) {
      await playerDisarmFloorTrap(coord, disarm_ability, item.depth_first_found, dir.v, item.misc_use);
    } else if (item.category_id === TV_CHEST) {
      await playerDisarmChestTrap(coord, disarm_ability, item);
    } else {
      no_disarm = true;
    }
  } else {
    no_disarm = true;
  }

  if (no_disarm) {
    await printMessage('I do not see anything to disarm there.');
    game.player_free_turn = true;
  }
}

async function chestLooseStrength(): Promise<void> {
  await printMessage('A small needle has pricked you!');

  if (py.flags.sustain_str) {
    await printMessage('You are unaffected.');
    return;
  }

  await playerStatRandomDecrease(PlayerAttr.A_STR);

  playerTakesHit(diceRoll({ dice: 1, sides: 4 }), 'a poison needle');

  await printMessage('You feel weakened!');
}

async function chestPoison(): Promise<void> {
  await printMessage('A small needle has pricked you!');

  playerTakesHit(diceRoll({ dice: 1, sides: 6 }), 'a poison needle');

  py.flags.poisoned += 10 + randomNumber(20);
}

async function chestParalysed(): Promise<void> {
  await printMessage('A puff of yellow gas surrounds you!');

  if (py.flags.free_action) {
    await printMessage('You are unaffected.');
    return;
  }

  await printMessage('You choke and pass out.');
  py.flags.paralysis = i16(10 + randomNumber(20));
}

async function chestSummonMonster(coord: Coord_t): Promise<void> {
  const position = { y: 0, x: 0 };

  for (let i = 0; i < 3; i++) {
    position.y = coord.y;
    position.x = coord.x;
    await monsterSummon(position, false);
  }
}

async function chestExplode(coord: Coord_t): Promise<void> {
  await printMessage('There is a sudden explosion!');

  dungeonDeleteObject(coord);

  playerTakesHit(diceRoll({ dice: 5, sides: 8 }), 'an exploding chest');
}

// Chests have traps too. -RAK-
// Note: Chest traps are based on the FLAGS value
export async function chestTrap(coord_in: Coord_t): Promise<void> {
  const coord = { y: coord_in.y, x: coord_in.x };
  const flags = game.treasure.list[dg.floor[coord.y][coord.x].treasure_id].flags;

  if ((flags & config.treasure.chests.CH_LOSE_STR) !== 0) {
    await chestLooseStrength();
  }

  if ((flags & config.treasure.chests.CH_POISON) !== 0) {
    await chestPoison();
  }

  if ((flags & config.treasure.chests.CH_PARALYSED) !== 0) {
    await chestParalysed();
  }

  if ((flags & config.treasure.chests.CH_SUMMON) !== 0) {
    await chestSummonMonster(coord);
  }

  if ((flags & config.treasure.chests.CH_EXPLODE) !== 0) {
    await chestExplode(coord);
  }
}
