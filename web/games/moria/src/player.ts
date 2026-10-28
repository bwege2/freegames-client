// player.cpp: Player specific variable definitions
//
// The player record itself (Player_t py) is in globals.ts.
import { config } from './config.ts';
import {
  BTH_PER_PLUS_TO_HIT_ADJUST, CLASS_MISC_HIT, MAX_CAVE_ROOM, MAX_HEIGHT, MAX_WIDTH, MIN_CLOSED_SPACE, MON_MAX_LEVELS,
  PLAYER_MAX_LEVEL, PlayerAttr, PlayerClassLevelAdj, PlayerEquipment, SHRT_MAX, SpecialNameIds, TILE_BLOCKED_FLOOR,
  TILE_CORR_FLOOR, TV_BOW, TV_CHEST, TV_CLOSED_DOOR, TV_INVIS_TRAP, TV_MAGIC_BOOK, TV_NOTHING, TV_OPEN_DOOR, TV_SECRET_DOOR,
  TV_SLING_AMMO, TV_SPIKE,
} from './constants.ts';
import type { Creature_t } from './data_creatures.ts';
import { creatures_list } from './data_creatures.ts';
import { class_level_adj, class_rank_titles, classes, magic_spells, spell_names, type Spell_t } from './data_player.ts';
import { diceRoll } from './dice.ts';
import { coordDistanceBetween, dungeonLiteSpot, dungeonMoveCreatureRecord, trapChangeVisibility } from './dungeon.ts';
import { getDirectionWithMemory, randomNumber } from './game.ts';
import { creature_recall, dg, game, globals, monsters, py } from './globals.ts';
import { isVowel, stringToNumber } from './helpers.ts';
import { itemDescription, objectBlockedByMonster, spellItemIdentified, spellItemIdentifyAndRemoveRandomInscription } from './identification.ts';
import { inventoryCollectAllItemFlags, inventoryItemCopyTo, inventoryItemIsCursed, inventoryItemRemoveCurse } from './inventory.ts';
import { i16, i32, idiv, ord, ref, type Ref, sprintf } from './libc.ts';
import { monsterDeath, monsterTakeHit, updateMonsters } from './monster.ts';
import { itemMagicAbilityDamage } from './player_magic.ts';
import { playerEndRunning } from './player_run.ts';
import {
  playerArmorClassAdjustment, playerAttackBlows, playerDamageAdjustment, playerDisarmAdjustment, playerStatAdjustmentWisdomIntelligence,
  playerStatBoost, playerToHitAdjustment,
} from './player_stats.ts';
import { chestTrap } from './player_traps.ts';
import type { Coord_t, Inventory_t } from './structs.ts';
import {
  coordInsidePanel, displayCharacterExperience, displaySpellsList, dungeonResetView, printCharacterCurrentHitPoints,
  printCharacterMovementState, printCharacterSpeed,
} from './ui.ts';
import {
  eraseLine, flushInputBuffer, getMenuItemId, getStringInput, messageLineClear, printMessage, printMessageNoCommandInterrupt,
  putQIO, putStringClearToEOL, terminalBellSound, terminalRestoreScreen, terminalSaveScreen,
} from './ui_io.ts';

function playerResetFlags(): void {
  py.flags.see_invisible = false;
  py.flags.teleport = false;
  py.flags.free_action = false;
  py.flags.slow_digest = false;
  py.flags.aggravate = false;
  py.flags.sustain_str = false;
  py.flags.sustain_int = false;
  py.flags.sustain_wis = false;
  py.flags.sustain_con = false;
  py.flags.sustain_dex = false;
  py.flags.sustain_chr = false;
  py.flags.resistant_to_fire = false;
  py.flags.resistant_to_acid = false;
  py.flags.resistant_to_cold = false;
  py.flags.regenerate_hp = false;
  py.flags.resistant_to_light = false;
  py.flags.free_fall = false;
}

export function playerIsMale(): boolean {
  return py.misc.gender;
}

export function playerSetGender(is_male: boolean): void {
  py.misc.gender = is_male;
}

export function playerGetGenderLabel(): string {
  if (playerIsMale()) {
    return 'Male';
  }
  return 'Female';
}

// Given direction "dir", returns new row, column location -RAK-
export function playerMovePosition(dir: number, coord: Coord_t): boolean {
  const new_coord: Coord_t = { y: 0, x: 0 };

  switch (dir) {
    case 1:
      new_coord.y = coord.y + 1;
      new_coord.x = coord.x - 1;
      break;
    case 2:
      new_coord.y = coord.y + 1;
      new_coord.x = coord.x;
      break;
    case 3:
      new_coord.y = coord.y + 1;
      new_coord.x = coord.x + 1;
      break;
    case 4:
      new_coord.y = coord.y;
      new_coord.x = coord.x - 1;
      break;
    case 5:
      new_coord.y = coord.y;
      new_coord.x = coord.x;
      break;
    case 6:
      new_coord.y = coord.y;
      new_coord.x = coord.x + 1;
      break;
    case 7:
      new_coord.y = coord.y - 1;
      new_coord.x = coord.x - 1;
      break;
    case 8:
      new_coord.y = coord.y - 1;
      new_coord.x = coord.x;
      break;
    case 9:
      new_coord.y = coord.y - 1;
      new_coord.x = coord.x + 1;
      break;
    default:
      new_coord.y = 0;
      new_coord.x = 0;
      break;
  }

  let can_move = false;

  if (new_coord.y >= 0 && new_coord.y < dg.height && new_coord.x >= 0 && new_coord.x < dg.width) {
    coord.y = new_coord.y;
    coord.x = new_coord.x;
    can_move = true;
  }

  return can_move;
}

// Teleport the player to a new location -RAK-
export async function playerTeleport(new_distance: number): Promise<void> {
  const location: Coord_t = { y: 0, x: 0 };

  do {
    location.y = randomNumber(dg.height) - 1;
    location.x = randomNumber(dg.width) - 1;

    while (coordDistanceBetween(location, py.pos) > new_distance) {
      location.y += idiv(py.pos.y - location.y, 2);
      location.x += idiv(py.pos.x - location.x, 2);
    }
  } while (dg.floor[location.y][location.x].feature_id >= MIN_CLOSED_SPACE || dg.floor[location.y][location.x].creature_id >= 2);

  dungeonMoveCreatureRecord(py.pos, location);

  const spot: Coord_t = { y: 0, x: 0 };
  for (spot.y = py.pos.y - 1; spot.y <= py.pos.y + 1; spot.y++) {
    for (spot.x = py.pos.x - 1; spot.x <= py.pos.x + 1; spot.x++) {
      dg.floor[spot.y][spot.x].temporary_light = false;
      dungeonLiteSpot(spot);
    }
  }

  dungeonLiteSpot(py.pos);

  py.pos.y = location.y;
  py.pos.x = location.x;

  await dungeonResetView();
  await updateMonsters(false);

  game.teleport_player = false;
}

// Returns true if player has no light -RAK-
export function playerNoLight(): boolean {
  return !dg.floor[py.pos.y][py.pos.x].temporary_light && !dg.floor[py.pos.y][py.pos.x].permanent_light;
}

// Something happens to disturb the player. -CJS-
// The first arg indicates a major disturbance, which affects search.
// The second arg indicates a light change.
export async function playerDisturb(major_disturbance: number, light_disturbance: number): Promise<void> {
  game.command_count = 0;

  if ((major_disturbance !== 0) && ((py.flags.status & config.player.status.PY_SEARCH) !== 0)) {
    await playerSearchOff();
  }

  if (py.flags.rest !== 0) {
    await playerRestOff();
  }

  if ((light_disturbance !== 0) || (py.running_tracker !== 0)) {
    py.running_tracker = 0;
    await dungeonResetView();
  }

  flushInputBuffer();
}

// Search Mode enhancement -RAK-
export function playerSearchOn(): void {
  playerChangeSpeed(1);

  py.flags.status |= config.player.status.PY_SEARCH;

  printCharacterMovementState();
  printCharacterSpeed();

  py.flags.food_digested++;
}

export async function playerSearchOff(): Promise<void> {
  await dungeonResetView();
  playerChangeSpeed(-1);

  py.flags.status &= ~config.player.status.PY_SEARCH;

  printCharacterMovementState();
  printCharacterSpeed();
  py.flags.food_digested--;
}

// Resting allows a player to safely restore his hp -RAK-
export async function playerRestOn(): Promise<void> {
  let rest_num: number;

  if (game.command_count > 0) {
    rest_num = game.command_count;
    game.command_count = 0;
  } else {
    rest_num = 0;
    const rest_str = ref('');

    await putStringClearToEOL('Rest for how long? ', { y: 0, x: 0 });

    if (await getStringInput(rest_str, { y: 0, x: 19 }, 5)) {
      if (rest_str.v[0] === '*') {
        rest_num = -SHRT_MAX;
      } else {
        const number = ref(rest_num);
        stringToNumber(rest_str.v, number);
        rest_num = number.v;
      }
    }
  }

  // check for reasonable value, must be positive number
  // in range of a short, or must be -MAX_SHORT
  if (rest_num === -SHRT_MAX || (rest_num > 0 && rest_num <= SHRT_MAX)) {
    if ((py.flags.status & config.player.status.PY_SEARCH) !== 0) {
      await playerSearchOff();
    }

    py.flags.rest = i16(rest_num);
    py.flags.status |= config.player.status.PY_REST;
    printCharacterMovementState();
    py.flags.food_digested--;

    await putStringClearToEOL('Press any key to stop resting...', { y: 0, x: 0 });
    await putQIO();

    return;
  }

  // Something went wrong
  if (rest_num !== 0) {
    await printMessage('Invalid rest count.');
  }
  messageLineClear();

  game.player_free_turn = true;
}

export async function playerRestOff(): Promise<void> {
  py.flags.rest = 0;
  py.flags.status &= ~config.player.status.PY_REST;

  printCharacterMovementState();

  // flush last message, or delete "press any key" message
  await printMessage(null);

  py.flags.food_digested++;
}

// For "DIED_FROM" string
export function playerDiedFromString(description: Ref<string>, monster_name: string, move: number): void {
  if ((move & config.monsters.move.CM_WIN) !== 0) {
    description.v = sprintf('The %s', monster_name);
  } else if (isVowel(monster_name[0] ?? '\0')) {
    description.v = sprintf('an %s', monster_name);
  } else {
    description.v = sprintf('a %s', monster_name);
  }
}

export async function playerTestAttackHits(attack_id: number, level: number): Promise<boolean> {
  let success = false;

  switch (attack_id) {
    case 1: // Normal attack
      if (await playerTestBeingHit(60, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 2: // Lose Strength
      if (await playerTestBeingHit(-3, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 3: // Confusion attack
    case 4: // Fear attack
    case 5: // Fire attack
      if (await playerTestBeingHit(10, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 6: // Acid attack
      if (await playerTestBeingHit(0, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 7: // Cold attack
    case 8: // Lightning attack
      if (await playerTestBeingHit(10, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 9: // Corrosion attack
      if (await playerTestBeingHit(0, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 10: // Blindness attack
    case 11: // Paralysis attack
      if (await playerTestBeingHit(2, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 12: // Steal Money
      if ((await playerTestBeingHit(5, level, 0, py.misc.level, CLASS_MISC_HIT)) && py.misc.au > 0) {
        success = true;
      }
      break;
    case 13: // Steal Object
      if ((await playerTestBeingHit(2, level, 0, py.misc.level, CLASS_MISC_HIT)) && py.pack.unique_items > 0) {
        success = true;
      }
      break;
    case 14: // Poison
      if (await playerTestBeingHit(5, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 15: // Lose dexterity
    case 16: // Lose constitution
      if (await playerTestBeingHit(0, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 17: // Lose intelligence
    case 18: // Lose wisdom
      if (await playerTestBeingHit(2, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 19: // Lose experience
      if (await playerTestBeingHit(5, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 20: // Aggravate monsters
      success = true;
      break;
    case 21: // Disenchant
      if (await playerTestBeingHit(20, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 22: // Eat food
    case 23: // Eat light
      if (await playerTestBeingHit(5, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) {
        success = true;
      }
      break;
    case 24: // Eat charges
      // check to make sure an object exists
      if ((await playerTestBeingHit(15, level, 0, py.misc.ac + py.misc.magical_ac, CLASS_MISC_HIT)) && py.pack.unique_items > 0) {
        success = true;
      }
      break;
    case 99:
      success = true;
      break;
    default:
      break;
  }

  return success;
}

// Changes speed of monsters relative to player -RAK-
// Note: When the player is sped up or slowed down, I simply change
// the speed of all the monsters. This greatly simplified the logic.
export function playerChangeSpeed(speed: number): void {
  py.flags.speed += speed;
  py.flags.status |= config.player.status.PY_SPEED;

  for (let i = globals.next_free_monster_id - 1; i >= config.monsters.MON_MIN_INDEX_ID; i--) {
    monsters[i].speed += speed;
  }
}

// Player bonuses -RAK-
//
// When an item is worn or taken off, this re-adjusts the player bonuses.
//     Factor =  1 : wear
//     Factor = -1 : removed
//
// Only calculates properties with cumulative effect.  Properties that
// depend on everything being worn are recalculated by playerRecalculateBonuses() -CJS-
export async function playerAdjustBonusesForItem(item: Inventory_t, factor: number): Promise<void> {
  const amount = item.misc_use * factor;

  if ((item.flags & config.treasure.flags.TR_STATS) !== 0) {
    for (let i = 0; i < 6; i++) {
      if (((1 << i) & item.flags) !== 0) {
        await playerStatBoost(i, amount);
      }
    }
  }

  if ((item.flags & config.treasure.flags.TR_SEARCH) !== 0) {
    py.misc.chance_in_search += amount;
    py.misc.fos -= amount;
  }

  if ((item.flags & config.treasure.flags.TR_STEALTH) !== 0) {
    py.misc.stealth_factor += amount;
  }

  if ((item.flags & config.treasure.flags.TR_SPEED) !== 0) {
    playerChangeSpeed(-amount);
  }

  if (((item.flags & config.treasure.flags.TR_BLIND) !== 0) && factor > 0) {
    py.flags.blind += 1000;
  }

  if (((item.flags & config.treasure.flags.TR_TIMID) !== 0) && factor > 0) {
    py.flags.afraid += 50;
  }

  if ((item.flags & config.treasure.flags.TR_INFRA) !== 0) {
    py.flags.see_infra += amount;
  }
}

function playerRecalculateBonusesFromInventory(): void {
  for (let i: number = PlayerEquipment.Wield; i < PlayerEquipment.Light; i++) {
    const item = py.inventory[i];

    if (item.category_id !== TV_NOTHING) {
      py.misc.plusses_to_hit += item.to_hit;

      // Bows can't damage. -CJS-
      if (item.category_id !== TV_BOW) {
        py.misc.plusses_to_damage += item.to_damage;
      }

      py.misc.magical_ac += item.to_ac;
      py.misc.ac += item.ac;

      if (spellItemIdentified(item)) {
        py.misc.display_to_hit += item.to_hit;

        // Bows can't damage. -CJS-
        if (item.category_id !== TV_BOW) {
          py.misc.display_to_damage += item.to_damage;
        }

        py.misc.display_to_ac += item.to_ac;
        py.misc.display_ac += item.ac;
      } else if (!inventoryItemIsCursed(item)) {
        // Base AC values should always be visible,
        // as long as the item is not cursed.
        py.misc.display_ac += item.ac;
      }
    }
  }
}

function playerRecalculateSustainStatsFromInventory(): void {
  for (let i: number = PlayerEquipment.Wield; i < PlayerEquipment.Light; i++) {
    if ((py.inventory[i].flags & config.treasure.flags.TR_SUST_STAT) === 0) {
      continue;
    }

    switch (py.inventory[i].misc_use) {
      case 1:
        py.flags.sustain_str = true;
        break;
      case 2:
        py.flags.sustain_int = true;
        break;
      case 3:
        py.flags.sustain_wis = true;
        break;
      case 4:
        py.flags.sustain_con = true;
        break;
      case 5:
        py.flags.sustain_dex = true;
        break;
      case 6:
        py.flags.sustain_chr = true;
        break;
      default:
        break;
    }
  }
}

// Recalculate the effect of all the stuff we use. -CJS-
export function playerRecalculateBonuses(): void {
  // Temporarily adjust food_digested
  if (py.flags.slow_digest) {
    py.flags.food_digested++;
  }
  if (py.flags.regenerate_hp) {
    py.flags.food_digested -= 3;
  }

  const saved_display_ac = py.misc.display_ac;

  playerResetFlags();

  // Real values
  py.misc.plusses_to_hit = playerToHitAdjustment();
  py.misc.plusses_to_damage = playerDamageAdjustment();
  py.misc.magical_ac = playerArmorClassAdjustment();
  py.misc.ac = 0;

  // Display values
  py.misc.display_to_hit = py.misc.plusses_to_hit;
  py.misc.display_to_damage = py.misc.plusses_to_damage;
  py.misc.display_ac = 0;
  py.misc.display_to_ac = py.misc.magical_ac;

  playerRecalculateBonusesFromInventory();

  py.misc.display_ac += py.misc.display_to_ac;

  if (py.weapon_is_heavy) {
    py.misc.display_to_hit += (py.stats.used[PlayerAttr.A_STR] * 15 - py.inventory[PlayerEquipment.Wield].weight);
  }

  // Add in temporary spell increases
  if (py.flags.invulnerability > 0) {
    py.misc.ac += 100;
    py.misc.display_ac += 100;
  }

  if (py.flags.blessed > 0) {
    py.misc.ac += 2;
    py.misc.display_ac += 2;
  }

  if (py.flags.detect_invisible > 0) {
    py.flags.see_invisible = true;
  }

  // can't print AC here because might be in a store
  if (saved_display_ac !== py.misc.display_ac) {
    py.flags.status |= config.player.status.PY_ARMOR;
  }

  const item_flags = inventoryCollectAllItemFlags();

  if ((item_flags & config.treasure.flags.TR_SLOW_DIGEST) !== 0) {
    py.flags.slow_digest = true;
  }
  if ((item_flags & config.treasure.flags.TR_AGGRAVATE) !== 0) {
    py.flags.aggravate = true;
  }
  if ((item_flags & config.treasure.flags.TR_TELEPORT) !== 0) {
    py.flags.teleport = true;
  }
  if ((item_flags & config.treasure.flags.TR_REGEN) !== 0) {
    py.flags.regenerate_hp = true;
  }
  if ((item_flags & config.treasure.flags.TR_RES_FIRE) !== 0) {
    py.flags.resistant_to_fire = true;
  }
  if ((item_flags & config.treasure.flags.TR_RES_ACID) !== 0) {
    py.flags.resistant_to_acid = true;
  }
  if ((item_flags & config.treasure.flags.TR_RES_COLD) !== 0) {
    py.flags.resistant_to_cold = true;
  }
  if ((item_flags & config.treasure.flags.TR_FREE_ACT) !== 0) {
    py.flags.free_action = true;
  }
  if ((item_flags & config.treasure.flags.TR_SEE_INVIS) !== 0) {
    py.flags.see_invisible = true;
  }
  if ((item_flags & config.treasure.flags.TR_RES_LIGHT) !== 0) {
    py.flags.resistant_to_light = true;
  }
  if ((item_flags & config.treasure.flags.TR_FFALL) !== 0) {
    py.flags.free_fall = true;
  }

  playerRecalculateSustainStatsFromInventory();

  // Reset food_digested values
  if (py.flags.slow_digest) {
    py.flags.food_digested--;
  }
  if (py.flags.regenerate_hp) {
    py.flags.food_digested += 3;
  }
}

// Remove item from equipment list -RAK-
export async function playerTakeOff(item_id: number, pack_position_id: number): Promise<void> {
  py.flags.status |= config.player.status.PY_STR_WGT;

  const item = py.inventory[item_id];

  py.pack.weight -= item.weight * item.items_count;
  py.equipment_count--;

  let p: string;
  if (item_id === PlayerEquipment.Wield || item_id === PlayerEquipment.Auxiliary) {
    p = 'Was wielding ';
  } else if (item_id === PlayerEquipment.Light) {
    p = 'Light source was ';
  } else {
    p = 'Was wearing ';
  }

  const description = ref('');
  itemDescription(description, item, true);

  let msg: string;
  if (pack_position_id >= 0) {
    msg = sprintf('%s%s (%c)', p, description.v, ord('a') + pack_position_id);
  } else {
    msg = sprintf('%s%s', p, description.v);
  }
  await printMessage(msg);

  // For secondary weapon
  if (item_id !== PlayerEquipment.Auxiliary) {
    await playerAdjustBonusesForItem(item, -1);
  }

  inventoryItemCopyTo(config.dungeon.objects.OBJ_NOTHING, item);
}

// Attacker's level and plusses,  defender's AC -RAK-
export async function playerTestBeingHit(base_to_hit: number, level: number, plus_to_hit: number, armor_class: number, attack_type_id: number): Promise<boolean> {
  await playerDisturb(1, 0);

  // `plus_to_hit` could be less than 0 if player wielding weapon too heavy for them
  const hit_chance = base_to_hit + plus_to_hit * BTH_PER_PLUS_TO_HIT_ADJUST + (level * class_level_adj[py.misc.class_id][attack_type_id]);

  // always miss 1 out of 20, always hit 1 out of 20
  const die = randomNumber(20);

  // normal hit
  return (die !== 1 && (die === 20 || (hit_chance > 0 && randomNumber(hit_chance) > armor_class)));
}

// Decreases players hit points and sets game.character_is_dead flag if necessary -RAK-
export function playerTakesHit(damage: number, creature_name_label: string): void {
  if (py.flags.invulnerability > 0) {
    damage = 0;
  }
  py.misc.current_hp -= damage;

  if (py.misc.current_hp >= 0) {
    printCharacterCurrentHitPoints();
    return;
  }

  if (!game.character_is_dead) {
    game.character_is_dead = true;

    game.character_died_from = creature_name_label;

    game.total_winner = false;
  }

  dg.generate_new_level = true;
}

// Searches for hidden things. -RAK-
export async function playerSearch(coord: Coord_t, chance: number): Promise<void> {
  coord = { y: coord.y, x: coord.x };

  if (py.flags.confused > 0) {
    chance = idiv(chance, 10);
  }

  if (py.flags.blind > 0 || playerNoLight()) {
    chance = idiv(chance, 10);
  }

  if (py.flags.image > 0) {
    chance = idiv(chance, 10);
  }

  const spot: Coord_t = { y: 0, x: 0 };
  for (spot.y = coord.y - 1; spot.y <= coord.y + 1; spot.y++) {
    for (spot.x = coord.x - 1; spot.x <= coord.x + 1; spot.x++) {
      // always coordInBounds() here
      if (randomNumber(100) >= chance) {
        continue;
      }

      if (dg.floor[spot.y][spot.x].treasure_id === 0) {
        continue;
      }

      // Search for hidden objects

      const item = game.treasure.list[dg.floor[spot.y][spot.x].treasure_id];

      if (item.category_id === TV_INVIS_TRAP) {
        // Trap on floor?

        const description = ref('');
        itemDescription(description, item, true);

        const msg = sprintf('You have found %s', description.v);
        await printMessage(msg);

        trapChangeVisibility(spot);
        playerEndRunning();
      } else if (item.category_id === TV_SECRET_DOOR) {
        // Secret door?

        await printMessage('You have found a secret door.');

        trapChangeVisibility(spot);
        playerEndRunning();
      } else if (item.category_id === TV_CHEST) {
        // Chest is trapped?

        // mask out the treasure bits
        if ((item.flags & config.treasure.chests.CH_TRAPPED) > 1) {
          if (!spellItemIdentified(item)) {
            spellItemIdentifyAndRemoveRandomInscription(item);
            await printMessage('You have discovered a trap on the chest!');
          } else {
            await printMessage('The chest is trapped!');
          }
        }
      }
    }
  }
}

// Computes current weight limit -RAK-
export function playerCarryingLoadLimit(): number {
  let weight_cap = py.stats.used[PlayerAttr.A_STR] * config.player.PLAYER_WEIGHT_CAP + py.misc.weight;

  if (weight_cap > 3000) {
    weight_cap = 3000;
  }

  return weight_cap;
}

// Are we strong enough for the current pack and weapon? -CJS-
export async function playerStrength(): Promise<void> {
  const item = py.inventory[PlayerEquipment.Wield];

  if (item.category_id !== TV_NOTHING && py.stats.used[PlayerAttr.A_STR] * 15 < item.weight) {
    if (!py.weapon_is_heavy) {
      await printMessage('You have trouble wielding such a heavy weapon.');
      py.weapon_is_heavy = true;
      playerRecalculateBonuses();
    }
  } else if (py.weapon_is_heavy) {
    py.weapon_is_heavy = false;
    if (item.category_id !== TV_NOTHING) {
      await printMessage('You are strong enough to wield your weapon.');
    }
    playerRecalculateBonuses();
  }

  let limit = playerCarryingLoadLimit();

  if (limit < py.pack.weight) {
    limit = idiv(py.pack.weight, limit + 1);
  } else {
    limit = 0;
  }

  if (py.pack.heaviness !== limit) {
    if (py.pack.heaviness < limit) {
      await printMessage('Your pack is so heavy that it slows you down.');
    } else {
      await printMessage('You move more easily under the weight of your pack.');
    }
    playerChangeSpeed(limit - py.pack.heaviness);
    py.pack.heaviness = i16(limit);
  }

  py.flags.status &= ~config.player.status.PY_STR_WGT;
}

export function playerLeftHandRingEmpty(): boolean {
  return py.inventory[PlayerEquipment.Left].category_id === TV_NOTHING;
}

export function playerRightHandRingEmpty(): boolean {
  return py.inventory[PlayerEquipment.Right].category_id === TV_NOTHING;
}

export function playerIsWieldingItem(): boolean {
  if (py.inventory[PlayerEquipment.Wield].category_id === TV_NOTHING && py.inventory[PlayerEquipment.Auxiliary].category_id === TV_NOTHING) {
    return false;
  }
  return true;
}

export function playerWornItemIsCursed(id: number): boolean {
  return inventoryItemIsCursed(py.inventory[id]);
}

export function playerWornItemRemoveCurse(id: number): void {
  inventoryItemRemoveCurse(py.inventory[id]);
}

async function playerCanRead(): Promise<boolean> {
  if (py.flags.blind > 0) {
    await printMessage("You can't see to read your spell book!");
    return false;
  }

  if (playerNoLight()) {
    await printMessage('You have no light to read by.');
    return false;
  }

  return true;
}

function lastKnownSpell(): number {
  for (let last_known = 0; last_known < 32; last_known++) {
    if (py.flags.spells_learned_order[last_known] === 99) {
      return last_known;
    }
  }

  // We should never actually reach this, but just in case... -MRC-
  return 0;
}

function playerDetermineLearnableSpells(): number {
  let spell_flag = 0;

  for (let i = 0; i < py.pack.unique_items; i++) {
    if (py.inventory[i].category_id === TV_MAGIC_BOOK) {
      spell_flag = (spell_flag | py.inventory[i].flags) >>> 0;
    }
  }

  return spell_flag;
}

// gain spells when player wants to -JW-
export async function playerGainSpells(): Promise<void> {
  if (py.flags.confused > 0) {
    await printMessage('You are too confused.');
    return;
  }

  let new_spells = py.flags.new_spells_to_learn;
  let diff_spells = 0;

  // TODO(cook) move access to `magic_spells[]` directly to the for loop it's used in, below?
  const spells: readonly Spell_t[] = magic_spells[py.misc.class_id - 1];

  let stat: number;
  let offset: number;

  // Priests don't need light because they get spells from their god, so only
  // fail when can't see if player has SPELL_TYPE_MAGE spells. This check is done below.
  if (classes[py.misc.class_id].class_to_use_mage_spells === config.spells.SPELL_TYPE_MAGE) {
    // People with SPELL_TYPE_MAGE spells can't learn spell_bank if they can't read their books.
    if (!(await playerCanRead())) {
      return;
    }
    stat = PlayerAttr.A_INT;
    offset = config.spells.NAME_OFFSET_SPELLS;
  } else {
    stat = PlayerAttr.A_WIS;
    offset = config.spells.NAME_OFFSET_PRAYERS;
  }

  let last_known = lastKnownSpell();

  if (new_spells === 0) {
    const tmp_str = sprintf("You can't learn any new %ss!", (stat === PlayerAttr.A_INT ? 'spell' : 'prayer'));
    await printMessage(tmp_str);

    game.player_free_turn = true;
    return;
  }

  let spell_flag: number;

  // determine which spells player can learn
  // mages need the book to learn a spell, priests do not need the book
  if (stat === PlayerAttr.A_INT) {
    spell_flag = playerDetermineLearnableSpells();
  } else {
    spell_flag = 0x7FFFFFFF;
  }

  // clear bits for spells already learned
  spell_flag = (spell_flag & ~py.flags.spells_learnt) >>> 0;

  let spell_id = 0;
  // int spell_bank[31] (one more element: the shifts below read spell_bank[spell_id])
  const spell_bank: number[] = new Array<number>(32).fill(0);
  let mask = 0x1;

  for (let i = 0; spell_flag !== 0; mask = (mask << 1) >>> 0, i++) {
    if ((spell_flag & mask) !== 0) {
      spell_flag = (spell_flag & ~mask) >>> 0;
      if (spells[i].level_required <= py.misc.level) {
        spell_bank[spell_id] = i;
        spell_id++;
      }
    }
  }

  if (new_spells > spell_id) {
    await printMessage('You seem to be missing a book.');

    diff_spells = new_spells - spell_id;
    new_spells = spell_id;
  }

  if (new_spells === 0) {
    // do nothing
  } else if (stat === PlayerAttr.A_INT) {
    // get to choose which mage spells will be learned
    terminalSaveScreen();
    await displaySpellsList(spell_bank, spell_id, false, -1);

    const query = ref('');
    while ((new_spells !== 0) && (await getMenuItemId('Learn which spell?', query))) {
      let c = ord(query.v) - ord('a');

      // test j < 23 in case i is greater than 22, only 22 spells
      // are actually shown on the screen, so limit choice to those
      if (c >= 0 && c < spell_id && c < 22) {
        new_spells--;

        py.flags.spells_learnt |= 1 << spell_bank[c];
        py.flags.spells_learned_order[last_known] = spell_bank[c];
        last_known++;

        for (; c <= spell_id - 1; c++) {
          spell_bank[c] = spell_bank[c + 1];
        }

        spell_id--;

        await eraseLine({ y: c + 1, x: 31 });
        await displaySpellsList(spell_bank, spell_id, false, -1);
      } else {
        await terminalBellSound();
      }
    }

    terminalRestoreScreen();
  } else {
    // pick a prayer at random
    while (new_spells !== 0) {
      let id = randomNumber(spell_id) - 1;
      py.flags.spells_learnt |= 1 << spell_bank[id];
      py.flags.spells_learned_order[last_known] = spell_bank[id];
      last_known++;

      const tmp_str = sprintf('You have learned the prayer of %s.', spell_names[spell_bank[id] + offset]);
      await printMessage(tmp_str);

      for (; id <= spell_id - 1; id++) {
        spell_bank[id] = spell_bank[id + 1];
      }

      spell_id--;
      new_spells--;
    }
  }

  py.flags.new_spells_to_learn = new_spells + diff_spells;

  if (py.flags.new_spells_to_learn === 0) {
    py.flags.status |= config.player.status.PY_STUDY;
  }

  // set the mana for first level characters when they learn their first spell.
  if (py.misc.mana === 0) {
    playerGainMana(stat);
  }
}

function newMana(stat: number): number {
  const levels = py.misc.level - classes[py.misc.class_id].min_level_for_spell_casting + 1;

  switch (playerStatAdjustmentWisdomIntelligence(stat)) {
    case 1:
    case 2:
      return 1 * levels;
    case 3:
      return idiv(3 * levels, 2);
    case 4:
      return 2 * levels;
    case 5:
      return idiv(5 * levels, 2);
    case 6:
      return 3 * levels;
    case 7:
      return 4 * levels;
    default:
      return 0;
  }
}

// Gain some mana if you know at least one spell -RAK-
export function playerGainMana(stat: number): void {
  if (py.flags.spells_learnt !== 0) {
    let new_mana = newMana(stat);

    // increment mana by one, so that first level chars have 2 mana
    if (new_mana > 0) {
      new_mana++;
    }

    // mana can be zero when creating character
    if (py.misc.mana !== new_mana) {
      if (py.misc.mana !== 0) {
        // change current mana proportionately to change of max mana,
        // divide first to avoid overflow, little loss of accuracy
        const value = i32(idiv(i32((py.misc.current_mana << 16) + py.misc.current_mana_fraction), py.misc.mana) * new_mana);
        py.misc.current_mana = i16(value >> 16);
        py.misc.current_mana_fraction = value & 0xFFFF;
      } else {
        py.misc.current_mana = i16(new_mana);
        py.misc.current_mana_fraction = 0;
      }

      py.misc.mana = i16(new_mana);

      // can't print mana here, may be in store or inventory mode
      py.flags.status |= config.player.status.PY_MANA;
    }
  } else if (py.misc.mana !== 0) {
    py.misc.mana = 0;
    py.misc.current_mana = 0;

    // can't print mana here, may be in store or inventory mode
    py.flags.status |= config.player.status.PY_MANA;
  }
}

// Critical hits, Nasty way to die. -RAK-
export async function playerWeaponCriticalBlow(weapon_weight: number, plus_to_hit: number, damage: number, attack_type_id: number): Promise<number> {
  let critical = damage;

  // Weight of weapon, plusses to hit, and character level all
  // contribute to the chance of a critical
  if (randomNumber(5000) <= weapon_weight + 5 * plus_to_hit + (class_level_adj[py.misc.class_id][attack_type_id] * py.misc.level)) {
    weapon_weight += randomNumber(650);

    if (weapon_weight < 400) {
      critical = 2 * damage + 5;
      await printMessage('It was a good hit! (x2 damage)');
    } else if (weapon_weight < 700) {
      critical = 3 * damage + 10;
      await printMessage('It was an excellent hit! (x3 damage)');
    } else if (weapon_weight < 900) {
      critical = 4 * damage + 15;
      await printMessage('It was a superb hit! (x4 damage)');
    } else {
      critical = 5 * damage + 20;
      await printMessage('It was a *GREAT* hit! (x5 damage)');
    }
  }

  return critical;
}

// Saving throws for player character. -RAK-
export function playerSavingThrow(): boolean {
  const class_level_adjustment = idiv(class_level_adj[py.misc.class_id][PlayerClassLevelAdj.SAVE] * py.misc.level, 3);

  const saving = py.misc.saving_throw + playerStatAdjustmentWisdomIntelligence(PlayerAttr.A_WIS) + class_level_adjustment;

  return randomNumber(100) <= saving;
}

export function playerGainKillExperience(creature: Creature_t): void {
  const exp = i32(creature.kill_exp_value * creature.level);

  let quotient = idiv(exp, py.misc.level);
  let remainder = exp % py.misc.level;

  remainder = i32(remainder * 0x10000);
  remainder = idiv(remainder, py.misc.level);
  remainder += py.misc.exp_fraction;

  if (remainder >= 0x10000) {
    quotient++;
    py.misc.exp_fraction = remainder - 0x10000;
  } else {
    py.misc.exp_fraction = remainder;
  }

  py.misc.exp += quotient;
}

function playerCalculateToHitBlows(weapon_id: number, weapon_weight: number, blows: Ref<number>, total_to_hit: Ref<number>): void {
  if (weapon_id !== TV_NOTHING) {
    // Proper weapon
    blows.v = playerAttackBlows(weapon_weight, total_to_hit);
  } else {
    // Bare hands?
    blows.v = 2;
    total_to_hit.v = -3;
  }

  // Fix for arrows
  if (weapon_id >= TV_SLING_AMMO && weapon_id <= TV_SPIKE) {
    blows.v = 1;
  }

  total_to_hit.v += py.misc.plusses_to_hit;
}

function playerCalculateBaseToHit(creature_lit: boolean, tot_tohit: number): number {
  if (creature_lit) {
    return py.misc.bth;
  }

  // creature not lit, make it more difficult to hit
  let bth: number;

  bth = idiv(py.misc.bth, 2);
  bth -= tot_tohit * (BTH_PER_PLUS_TO_HIT_ADJUST - 1);
  bth -= idiv(py.misc.level * class_level_adj[py.misc.class_id][PlayerClassLevelAdj.BTH], 2);

  return bth;
}

// Player attacks a (poor, defenseless) creature -RAK-
async function playerAttackMonster(coord: Coord_t): Promise<void> {
  const creature_id = dg.floor[coord.y][coord.x].creature_id;

  const monster = monsters[creature_id];
  const creature = creatures_list[monster.creature_id];
  const item = py.inventory[PlayerEquipment.Wield];

  monster.sleep_count = 0;

  // Does the player know what they're fighting?
  let name: string;
  if (!monster.lit) {
    name = 'it';
  } else {
    name = sprintf('the %s', creature.name);
  }

  const blows = ref(0);
  const total_to_hit = ref(0);
  playerCalculateToHitBlows(item.category_id, item.weight, blows, total_to_hit);

  const base_to_hit = playerCalculateBaseToHit(monster.lit, total_to_hit.v);

  let damage: number;
  let msg: string;

  // Loop for number of blows, trying to hit the critter.
  // Note: blows will always be greater than 0 at the start of the loop -MRC-
  for (let i = blows.v; i > 0; i--) {
    if (!(await playerTestBeingHit(base_to_hit, py.misc.level, total_to_hit.v, creature.ac, PlayerClassLevelAdj.BTH))) {
      msg = sprintf('You miss %s.', name);
      await printMessage(msg);
      continue;
    }

    msg = sprintf('You hit %s.', name);
    await printMessage(msg);

    if (item.category_id !== TV_NOTHING) {
      damage = diceRoll(item.damage);
      damage = itemMagicAbilityDamage(item, damage, monster.creature_id);
      damage = await playerWeaponCriticalBlow(item.weight, total_to_hit.v, damage, PlayerClassLevelAdj.BTH);
    } else {
      // Bare hands!?
      damage = diceRoll({ dice: 1, sides: 1 });
      damage = await playerWeaponCriticalBlow(1, 0, damage, PlayerClassLevelAdj.BTH);
    }

    damage += py.misc.plusses_to_damage;
    if (damage < 0) {
      damage = 0;
    }

    if (py.flags.confuse_monster) {
      py.flags.confuse_monster = false;

      await printMessage('Your hands stop glowing.');

      if (((creature.defenses & config.monsters.defense.CD_NO_SLEEP) !== 0) || randomNumber(MON_MAX_LEVELS) < creature.level) {
        msg = sprintf('%s is unaffected.', name);
      } else {
        msg = sprintf('%s appears confused.', name);
        if (monster.confused_amount !== 0) {
          monster.confused_amount += 3;
        } else {
          monster.confused_amount = 2 + randomNumber(16);
        }
      }
      await printMessage(msg);

      if (monster.lit && randomNumber(4) === 1) {
        creature_recall[monster.creature_id].defenses |= creature.defenses & config.monsters.defense.CD_NO_SLEEP;
      }
    }

    // See if we done it in.
    if ((await monsterTakeHit(creature_id, damage)) >= 0) {
      msg = sprintf('You have slain %s.', name);
      await printMessage(msg);
      await displayCharacterExperience();

      return;
    }

    // Use missiles up
    if (item.category_id >= TV_SLING_AMMO && item.category_id <= TV_SPIKE) {
      item.items_count--;
      py.pack.weight -= item.weight;
      py.flags.status |= config.player.status.PY_STR_WGT;

      if (item.items_count === 0) {
        py.equipment_count--;
        await playerAdjustBonusesForItem(item, -1);
        inventoryItemCopyTo(config.dungeon.objects.OBJ_NOTHING, item);
        playerRecalculateBonuses();
      }
    }
  }
}

function playerLockPickingSkill(): number {
  let skill = py.misc.disarm;

  skill = i16(skill + 2);
  skill = i16(skill * playerDisarmAdjustment());
  skill = i16(skill + playerStatAdjustmentWisdomIntelligence(PlayerAttr.A_INT));
  skill = i16(skill + idiv(class_level_adj[py.misc.class_id][PlayerClassLevelAdj.DISARM] * py.misc.level, 3));

  return skill;
}

async function openClosedDoor(coord: Coord_t): Promise<void> {
  const tile = dg.floor[coord.y][coord.x];
  const item = game.treasure.list[tile.treasure_id];

  if (item.misc_use > 0) {
    // It's locked.

    if (py.flags.confused > 0) {
      await printMessage('You are too confused to pick the lock.');
    } else if (playerLockPickingSkill() - item.misc_use > randomNumber(100)) {
      await printMessage('You have picked the lock.');
      py.misc.exp++;
      await displayCharacterExperience();
      item.misc_use = 0;
    } else {
      await printMessageNoCommandInterrupt('You failed to pick the lock.');
    }
  } else if (item.misc_use < 0) {
    // It's stuck

    await printMessage('It appears to be stuck.');
  }

  if (item.misc_use === 0) {
    inventoryItemCopyTo(config.dungeon.objects.OBJ_OPEN_DOOR, game.treasure.list[tile.treasure_id]);
    tile.feature_id = TILE_CORR_FLOOR;
    dungeonLiteSpot(coord);
    game.command_count = 0;
  }
}

async function openClosedChest(coord: Coord_t): Promise<void> {
  const tile = dg.floor[coord.y][coord.x];
  const item = game.treasure.list[tile.treasure_id];

  let success = false;

  if ((item.flags & config.treasure.chests.CH_LOCKED) !== 0) {
    if (py.flags.confused > 0) {
      await printMessage('You are too confused to pick the lock.');
    } else if (playerLockPickingSkill() - item.depth_first_found > randomNumber(100)) {
      await printMessage('You have picked the lock.');

      py.misc.exp += item.depth_first_found;
      await displayCharacterExperience();

      success = true;
    } else {
      await printMessageNoCommandInterrupt('You failed to pick the lock.');
    }
  } else {
    success = true;
  }

  if (success) {
    item.flags &= ~config.treasure.chests.CH_LOCKED;
    item.special_name_id = SpecialNameIds.SN_EMPTY;
    spellItemIdentifyAndRemoveRandomInscription(item);
    item.cost = 0;
  }

  // Was chest still trapped?
  if ((item.flags & config.treasure.chests.CH_LOCKED) !== 0) {
    return;
  }

  // Oh, yes it was...   (Snicker)
  await chestTrap(coord);

  if (tile.treasure_id !== 0) {
    // Chest treasure is allocated as if a creature had been killed.
    // clear the cursed chest/monster win flag, so that people
    // can not win by opening a cursed chest
    inventoryItemRemoveCurse(game.treasure.list[tile.treasure_id]);

    await monsterDeath(coord, game.treasure.list[tile.treasure_id].flags);

    game.treasure.list[tile.treasure_id].flags = 0;
  }
}

// Opens a closed door or closed chest. -RAK-
export async function playerOpenClosedObject(): Promise<void> {
  const dir = ref(0);
  if (!(await getDirectionWithMemory(null, dir))) {
    return;
  }

  const coord = { y: py.pos.y, x: py.pos.x };
  playerMovePosition(dir.v, coord);

  let no_object = false;

  const tile = dg.floor[coord.y][coord.x];
  const item = game.treasure.list[tile.treasure_id];

  if (tile.creature_id > 1 && tile.treasure_id !== 0 && (item.category_id === TV_CLOSED_DOOR || item.category_id === TV_CHEST)) {
    await objectBlockedByMonster(tile.creature_id);
  } else if (tile.treasure_id !== 0) {
    if (item.category_id === TV_CLOSED_DOOR) {
      await openClosedDoor(coord);
    } else if (item.category_id === TV_CHEST) {
      await openClosedChest(coord);
    } else {
      no_object = true;
    }
  } else {
    no_object = true;
  }

  if (no_object) {
    game.player_free_turn = true;
    await printMessage('I do not see anything you can open there.');
  }
}

// Closes an open door. -RAK-
export async function playerCloseDoor(): Promise<void> {
  const dir = ref(0);

  if (!(await getDirectionWithMemory(null, dir))) {
    return;
  }

  const coord = { y: py.pos.y, x: py.pos.x };
  playerMovePosition(dir.v, coord);

  const tile = dg.floor[coord.y][coord.x];
  const item = game.treasure.list[tile.treasure_id];

  let no_object = false;

  if (tile.treasure_id !== 0) {
    if (item.category_id === TV_OPEN_DOOR) {
      if (tile.creature_id === 0) {
        if (item.misc_use === 0) {
          inventoryItemCopyTo(config.dungeon.objects.OBJ_CLOSED_DOOR, item);
          tile.feature_id = TILE_BLOCKED_FLOOR;
          dungeonLiteSpot(coord);
        } else {
          await printMessage('The door appears to be broken.');
        }
      } else {
        await objectBlockedByMonster(tile.creature_id);
      }
    } else {
      no_object = true;
    }
  } else {
    no_object = true;
  }

  if (no_object) {
    game.player_free_turn = true;
    await printMessage('I do not see anything you can close there.');
  }
}

// Tunneling through real wall: 10, 11, 12 -RAK-
// Used by TUNNEL and WALL_TO_MUD
export async function playerTunnelWall(coord: Coord_t, digging_ability: number, digging_chance: number): Promise<boolean> {
  if (digging_ability <= digging_chance) {
    return false;
  }

  coord = { y: coord.y, x: coord.x };

  const tile = dg.floor[coord.y][coord.x];

  if (tile.perma_lit_room) {
    // Should become a room space, check to see whether
    // it should be TILE_LIGHT_FLOOR or TILE_DARK_FLOOR.
    let found = false;

    for (let y = coord.y - 1; y <= coord.y + 1 && y < MAX_HEIGHT; y++) {
      for (let x = coord.x - 1; x <= coord.x + 1 && x < MAX_WIDTH; x++) {
        if (dg.floor[y][x].feature_id <= MAX_CAVE_ROOM) {
          tile.feature_id = dg.floor[y][x].feature_id;
          tile.permanent_light = dg.floor[y][x].permanent_light;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      tile.feature_id = TILE_CORR_FLOOR;
      tile.permanent_light = false;
    }
  } else {
    // should become a corridor space
    tile.feature_id = TILE_CORR_FLOOR;
    tile.permanent_light = false;
  }

  tile.field_mark = false;

  if (coordInsidePanel(coord) && (tile.temporary_light || tile.permanent_light) && tile.treasure_id !== 0) {
    await printMessage('You have found something!');
  }

  dungeonLiteSpot(coord);

  return true;
}

// let the player attack the creature
export async function playerAttackPosition(coord: Coord_t): Promise<void> {
  // Is a Coward?
  if (py.flags.afraid > 0) {
    await printMessage('You are too afraid!');
    return;
  }

  await playerAttackMonster({ y: coord.y, x: coord.x });
}

// check to see if know any spells greater than level, eliminate them
async function eliminateKnownSpellsGreaterThanLevel(msp_ptr: readonly Spell_t[], p: string, offset: number): Promise<void> {
  let mask = 0x80000000;

  for (let i = 31; mask !== 0; mask >>>= 1, i--) {
    if ((mask & py.flags.spells_learnt) !== 0) {
      if (msp_ptr[i].level_required > py.misc.level) {
        py.flags.spells_learnt &= ~mask;
        py.flags.spells_forgotten |= mask;

        const msg = sprintf('You have forgotten the %s of %s.', p, spell_names[i + offset]);
        await printMessage(msg);
      } else {
        break;
      }
    }
  }
}

function numberOfSpellsAllowed(stat: number): number {
  const levels = py.misc.level - classes[py.misc.class_id].min_level_for_spell_casting + 1;

  let allowed: number;

  switch (playerStatAdjustmentWisdomIntelligence(stat)) {
    case 1:
    case 2:
    case 3:
      allowed = 1 * levels;
      break;
    case 4:
    case 5:
      allowed = idiv(3 * levels, 2);
      break;
    case 6:
      allowed = 2 * levels;
      break;
    case 7:
      allowed = idiv(5 * levels, 2);
      break;
    default:
      allowed = 0;
      break;
  }

  return allowed;
}

function numberOfSpellsKnown(): number {
  let known = 0;

  for (let mask = 0x1; mask !== 0; mask = (mask << 1) >>> 0) {
    if ((mask & py.flags.spells_learnt) !== 0) {
      known++;
    }
  }

  return known;
}

// remember forgotten spells while forgotten spells exist of new_spells_to_learn positive,
// remember the spells in the order that they were learned
async function rememberForgottenSpells(msp_ptr: readonly Spell_t[], allowed_spells: number, new_spells: number, p: string, offset: number): Promise<number> {
  let mask: number;

  for (let n = 0; ((py.flags.spells_forgotten !== 0) && (new_spells !== 0) && (n < allowed_spells) && (n < 32)); n++) {
    // order ID is (i+1)th spell learned
    const order_id = py.flags.spells_learned_order[n];

    // shifting by amounts greater than number of bits in long gives
    // an undefined result, so don't shift for unknown spells
    if (order_id === 99) {
      mask = 0x0;
    } else {
      mask = (1 << order_id) >>> 0;
    }

    if ((mask & py.flags.spells_forgotten) !== 0) {
      if (msp_ptr[order_id].level_required <= py.misc.level) {
        new_spells--;
        py.flags.spells_forgotten &= ~mask;
        py.flags.spells_learnt |= mask;

        const msg = sprintf('You have remembered the %s of %s.', p, spell_names[order_id + offset]);
        await printMessage(msg);
      } else {
        allowed_spells++;
      }
    }
  }

  return new_spells;
}

// determine which spells player can learn must check all spells here,
// in gain_spell() we actually check if the books are present
function learnableSpells(msp_ptr: readonly Spell_t[], new_spells: number): number {
  let spell_flag = (0x7FFFFFFF & ~py.flags.spells_learnt) >>> 0;

  let id = 0;
  let mask = 0x1;

  for (let i = 0; spell_flag !== 0; mask = (mask << 1) >>> 0, i++) {
    if ((spell_flag & mask) !== 0) {
      spell_flag = (spell_flag & ~mask) >>> 0;
      if (msp_ptr[i].level_required <= py.misc.level) {
        id++;
      }
    }
  }

  if (new_spells > id) {
    new_spells = id;
  }

  return new_spells;
}

// forget spells until new_spells_to_learn zero or no more spells know,
// spells are forgotten in the opposite order that they were learned
// NOTE: newSpells is always a negative value
async function forgetSpells(new_spells: number, p: string, offset: number): Promise<void> {
  let mask: number;

  for (let i = 31; (new_spells !== 0) && (py.flags.spells_learnt !== 0); i--) {
    // orderID is the (i+1)th spell learned
    const order_id = py.flags.spells_learned_order[i];

    // shifting by amounts greater than number of bits in long gives
    // an undefined result, so don't shift for unknown spells
    if (order_id === 99) {
      mask = 0x0;
    } else {
      mask = (1 << order_id) >>> 0;
    }

    if ((mask & py.flags.spells_learnt) !== 0) {
      py.flags.spells_learnt &= ~mask;
      py.flags.spells_forgotten |= mask;
      new_spells++;

      const msg = sprintf('You have forgotten the %s of %s.', p, spell_names[order_id + offset]);
      await printMessage(msg);
    }
  }
}

// calculate number of spells player should have, and
// learn forget spells until that number is met -JEW-
export async function playerCalculateAllowedSpellsCount(stat: number): Promise<void> {
  const spell: readonly Spell_t[] = magic_spells[py.misc.class_id - 1];

  let magic_type_str: string;
  let offset: number;

  if (stat === PlayerAttr.A_INT) {
    magic_type_str = 'spell';
    offset = config.spells.NAME_OFFSET_SPELLS;
  } else {
    magic_type_str = 'prayer';
    offset = config.spells.NAME_OFFSET_PRAYERS;
  }

  // check to see if know any spells greater than level, eliminate them
  await eliminateKnownSpellsGreaterThanLevel(spell, magic_type_str, offset);

  // calc number of spells allowed
  const num_allowed = numberOfSpellsAllowed(stat);
  const num_known = numberOfSpellsKnown();
  let new_spells = num_allowed - num_known;

  if (new_spells > 0) {
    new_spells = await rememberForgottenSpells(spell, num_allowed, new_spells, magic_type_str, offset);

    // If `new_spells_to_learn` is still greater than zero
    if (new_spells > 0) {
      new_spells = learnableSpells(spell, new_spells);
    }
  } else if (new_spells < 0) {
    await forgetSpells(new_spells, magic_type_str, offset);
    new_spells = 0;
  }

  if (new_spells !== py.flags.new_spells_to_learn) {
    if (new_spells > 0 && py.flags.new_spells_to_learn === 0) {
      const msg = sprintf('You can learn some new %ss now.', magic_type_str);
      await printMessage(msg);
    }

    py.flags.new_spells_to_learn = new_spells;
    py.flags.status |= config.player.status.PY_STUDY;
  }
}

export function playerRankTitle(): string {
  let p: string;

  if (py.misc.level < 1) {
    p = 'Babe in arms';
  } else if (py.misc.level <= PLAYER_MAX_LEVEL) {
    p = class_rank_titles[py.misc.class_id][py.misc.level - 1];
  } else if (playerIsMale()) {
    p = '**KING**';
  } else {
    p = '**QUEEN**';
  }

  return p;
}
