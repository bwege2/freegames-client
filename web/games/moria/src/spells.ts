// spells.cpp: Player/creature spells, breaths, wands, scrolls, etc. code
import { config } from './config.ts';
import {
  MAX_CAVE_FLOOR, MAX_OPEN_SPACE, MIN_CAVE_WALL, MIN_CLOSED_SPACE, MON_MAX_LEVELS, MagicSpellFlags, PLAYER_INVENTORY_SIZE, PlayerAttr,
  PlayerEquipment, SCREEN_HEIGHT, SCREEN_WIDTH, SpecialNameIds, TILE_BOUNDARY_WALL, TILE_BLOCKED_FLOOR, TILE_CORR_FLOOR, TILE_DARK_FLOOR,
  TILE_GRANITE_WALL, TILE_LIGHT_FLOOR, TILE_MAGMA_WALL, TILE_QUARTZ_WALL, TV_CHEST, TV_CLOSED_DOOR, TV_DOWN_STAIR, TV_GOLD, TV_INVIS_TRAP,
  TV_MAX_OBJECT, TV_MAX_VISIBLE, TV_MIN_VISIBLE, TV_OPEN_DOOR, TV_RUBBLE, TV_SECRET_DOOR, TV_STAFF, TV_UP_STAIR, TV_VIS_TRAP, TV_WAND,
} from './constants.ts';
import { creatures_list } from './data_creatures.ts';
import type { Creature_t } from './data_creatures.ts';
import { classes, magic_spells, spell_names } from './data_player.ts';
import { diceRoll } from './dice.ts';
import {
  caveTileVisible, coordDistanceBetween, coordInBounds, dungeonDeleteMonster, dungeonDeleteObject, dungeonLightRoom, dungeonLiteSpot,
  dungeonMoveCreatureRecord, dungeonPlaceRandomObjectAt, dungeonRemoveMonsterFromLevel, dungeonSetTrap, trapChangeVisibility,
} from './dungeon.ts';
import { los } from './dungeon_los.ts';
import { randomNumber } from './game.ts';
import { popt } from './game_objects.ts';
import { creature_recall, dg, game, globals, monster_levels, monsters, py } from './globals.ts';
import { getAndClearFirstBit } from './helpers.ts';
import {
  itemDescription, itemIdentificationClearEmpty, itemIdentify, spellItemIdentified, spellItemIdentifyAndRemoveRandomInscription,
  spellItemRemoveIdentification,
} from './identification.ts';
import {
  damageAcid, damageCold, damageFire, damageLightningBolt, damagePoisonedGas, inventoryDestroyItem, inventoryFindRange, inventoryItemCopyTo,
  setAcidDestroyableItems, setFireDestroyableItems, setFrostDestroyableItems, setLightningDestroyableItems, setNull,
} from './inventory.ts';
import { chr, i8, idiv, isalpha, islower, isupper, ord, ref, type Ref, sprintf } from './libc.ts';
import { spellChanceOfSuccess } from './mage_spells.ts';
import { monsterDeath, monsterMultiply, monsterNameDescription, monsterTakeHit, monsterUpdateVisibility, printMonsterActionText, updateMonsters } from './monster.ts';
import { monsterPlaceNew } from './monster_manager.ts';
import {
  playerCalculateAllowedSpellsCount, playerGainMana, playerMovePosition, playerRecalculateBonuses, playerTunnelWall, playerWornItemIsCursed,
  playerWornItemRemoveCurse,
} from './player.ts';
import { playerCalculateHitPoints, playerStatRandomDecrease } from './player_stats.ts';
import type { Coord_t, Inventory_t, Tile_t } from './structs.ts';
import {
  coordInsidePanel, displayCharacterExperience, displaySpellsList, drawDungeonPanel, dungeonResetView, printCharacterCurrentHitPoints,
  printCharacterLevel, printCharacterTitle,
} from './ui.ts';
import { inventoryGetInputForItemId, playerItemWearingDescription } from './ui_inventory.ts';
import {
  getInputConfirmation, getMenuItemId, getTileCharacter, messageLineClear, panelPutTile, printMessage, putQIO, terminalBellSound,
  terminalRestoreScreen, terminalSaveScreen,
} from './ui_io.ts';

// Returns spell pointer -RAK-
async function spellGetId(spell_ids: number[], number_of_choices: number, spell_id: Ref<number>, spell_chance: Ref<number>, prompt: string, first_spell: number): Promise<boolean> {
  spell_id.v = -1;

  const str = sprintf('(Spells %c-%c, *=List, <ESCAPE>=exit) %s', spell_ids[0] + ord('a') - first_spell, spell_ids[number_of_choices - 1] + ord('a') - first_spell, prompt);

  let spell_found = false;
  let redraw = false;

  const offset = (classes[py.misc.class_id].class_to_use_mage_spells === config.spells.SPELL_TYPE_MAGE ? config.spells.NAME_OFFSET_SPELLS : config.spells.NAME_OFFSET_PRAYERS);

  const spellChoice = ref('\0');

  while (!spell_found && (await getMenuItemId(str, spellChoice))) {
    if (isupper(spellChoice.v)) {
      spell_id.v = ord(spellChoice.v) - ord('A') + first_spell;

      // verify that this is in spells[], at most 22 entries in class_to_use_mage_spells[]
      let test_spell_id: number;
      for (test_spell_id = 0; test_spell_id < number_of_choices; test_spell_id++) {
        if (spell_id.v === spell_ids[test_spell_id]) {
          break;
        }
      }

      if (test_spell_id === number_of_choices) {
        spell_id.v = -2;
      } else {
        const spell = magic_spells[py.misc.class_id - 1][spell_id.v];

        const tmp_str = sprintf('Cast %s (%d mana, %d%% fail)?', spell_names[spell_id.v + offset], spell.mana_required, spellChanceOfSuccess(spell_id.v));
        if (await getInputConfirmation(tmp_str)) {
          spell_found = true;
        } else {
          spell_id.v = -1;
        }
      }
    } else if (islower(spellChoice.v)) {
      spell_id.v = ord(spellChoice.v) - ord('a') + first_spell;

      // verify that this is in spells[], at most 22 entries in class_to_use_mage_spells[]
      let test_spell_id: number;
      for (test_spell_id = 0; test_spell_id < number_of_choices; test_spell_id++) {
        if (spell_id.v === spell_ids[test_spell_id]) {
          break;
        }
      }

      if (test_spell_id === number_of_choices) {
        spell_id.v = -2;
      } else {
        spell_found = true;
      }
    } else if (spellChoice.v === '*') {
      // only do this drawing once
      if (!redraw) {
        terminalSaveScreen();
        redraw = true;
        await displaySpellsList(spell_ids, number_of_choices, false, first_spell);
      }
    } else if (isalpha(spellChoice.v)) {
      spell_id.v = -2;
    } else {
      spell_id.v = -1;
      await terminalBellSound();
    }

    if (spell_id.v === -2) {
      const tmp_str = sprintf("You don't know that %s.", (offset === config.spells.NAME_OFFSET_SPELLS ? 'spell' : 'prayer'));
      await printMessage(tmp_str);
    }
  }

  if (redraw) {
    terminalRestoreScreen();
  }

  messageLineClear();

  if (spell_found) {
    spell_chance.v = spellChanceOfSuccess(spell_id.v);
  }

  return spell_found;
}

// Return spell number and failure chance -RAK-
// returns -1 if no spells in book
// returns  1 if choose a spell in book to cast
// returns  0 if don't choose a spell, i.e. exit with an escape
// TODO: split into two functions; getting spell ID and casting an actual spell
export async function castSpellGetId(prompt: string, item_id: number, spell_id: Ref<number>, spell_chance: Ref<number>): Promise<number> {
  // NOTE: `flags` gets set again, since getAndClearFirstBit modified it
  const flags = ref(py.inventory[item_id].flags);
  const first_spell = getAndClearFirstBit(flags);

  // Get flags again since getAndClearFirstBit modified variable.
  flags.v = (py.inventory[item_id].flags & py.flags.spells_learnt) >>> 0;

  // TODO(cook) move access to `magic_spells[]` directly to the for loop it's used in, below?
  const spells = magic_spells[py.misc.class_id - 1];

  let spell_count = 0;
  const spell_list: number[] = new Array<number>(31).fill(0);

  while (flags.v !== 0) {
    const pos = getAndClearFirstBit(flags);

    if (spells[pos].level_required <= py.misc.level) {
      spell_list[spell_count] = pos;
      spell_count++;
    }
  }

  if (spell_count === 0) {
    return -1;
  }

  let result = 0;
  if (await spellGetId(spell_list, spell_count, spell_id, spell_chance, prompt, first_spell)) {
    result = 1;
  }

  if ((result !== 0) && magic_spells[py.misc.class_id - 1][spell_id.v].mana_required > py.misc.current_mana) {
    if (classes[py.misc.class_id].class_to_use_mage_spells === config.spells.SPELL_TYPE_MAGE) {
      result = (await getInputConfirmation('You summon your limited strength to cast this one! Confirm?')) ? 1 : 0;
    } else {
      result = (await getInputConfirmation('The gods may think you presumptuous for this! Confirm?')) ? 1 : 0;
    }
  }

  return result;
}

// Following are spell procedure/functions -RAK-
// These routines are commonly used in the scroll, potion, wands, and
// staves routines, and are occasionally called from other areas.
// Now included are creature spells also.           -RAK

// Detect any treasure on the current panel -RAK-
export function spellDetectTreasureWithinVicinity(): boolean {
  let detected = false;

  const coord: Coord_t = { y: 0, x: 0 };

  for (coord.y = dg.panel.top; coord.y <= dg.panel.bottom; coord.y++) {
    for (coord.x = dg.panel.left; coord.x <= dg.panel.right; coord.x++) {
      const tile = dg.floor[coord.y][coord.x];

      if (tile.treasure_id !== 0 && game.treasure.list[tile.treasure_id].category_id === TV_GOLD && !caveTileVisible(coord)) {
        tile.field_mark = true;
        dungeonLiteSpot(coord);
        detected = true;
      }
    }
  }

  return detected;
}

// Detect all objects on the current panel -RAK-
export function spellDetectObjectsWithinVicinity(): boolean {
  let detected = false;

  const coord: Coord_t = { y: 0, x: 0 };

  for (coord.y = dg.panel.top; coord.y <= dg.panel.bottom; coord.y++) {
    for (coord.x = dg.panel.left; coord.x <= dg.panel.right; coord.x++) {
      const tile = dg.floor[coord.y][coord.x];

      if (tile.treasure_id !== 0 && game.treasure.list[tile.treasure_id].category_id < TV_MAX_OBJECT && !caveTileVisible(coord)) {
        tile.field_mark = true;
        dungeonLiteSpot(coord);
        detected = true;
      }
    }
  }

  return detected;
}

// Locates and displays traps on current panel -RAK-
export function spellDetectTrapsWithinVicinity(): boolean {
  let detected = false;

  const coord: Coord_t = { y: 0, x: 0 };

  for (coord.y = dg.panel.top; coord.y <= dg.panel.bottom; coord.y++) {
    for (coord.x = dg.panel.left; coord.x <= dg.panel.right; coord.x++) {
      const tile = dg.floor[coord.y][coord.x];

      if (tile.treasure_id === 0) {
        continue;
      }

      if (game.treasure.list[tile.treasure_id].category_id === TV_INVIS_TRAP) {
        tile.field_mark = true;
        trapChangeVisibility(coord);
        detected = true;
      } else if (game.treasure.list[tile.treasure_id].category_id === TV_CHEST) {
        const item = game.treasure.list[tile.treasure_id];
        spellItemIdentifyAndRemoveRandomInscription(item);
      }
    }
  }

  return detected;
}

// Locates and displays all secret doors on current panel -RAK-
export function spellDetectSecretDoorssWithinVicinity(): boolean {
  let detected = false;

  const coord: Coord_t = { y: 0, x: 0 };

  for (coord.y = dg.panel.top; coord.y <= dg.panel.bottom; coord.y++) {
    for (coord.x = dg.panel.left; coord.x <= dg.panel.right; coord.x++) {
      const tile = dg.floor[coord.y][coord.x];

      if (tile.treasure_id === 0) {
        continue;
      }

      if (game.treasure.list[tile.treasure_id].category_id === TV_SECRET_DOOR) {
        // Secret doors

        tile.field_mark = true;
        trapChangeVisibility(coord);
        detected = true;
      } else if ((game.treasure.list[tile.treasure_id].category_id === TV_UP_STAIR || game.treasure.list[tile.treasure_id].category_id === TV_DOWN_STAIR) && !tile.field_mark) {
        // Staircases

        tile.field_mark = true;
        dungeonLiteSpot(coord);
        detected = true;
      }
    }
  }

  return detected;
}

// Locates and displays all invisible creatures on current panel -RAK-
export async function spellDetectInvisibleCreaturesWithinVicinity(): Promise<boolean> {
  let detected = false;

  for (let id = globals.next_free_monster_id - 1; id >= config.monsters.MON_MIN_INDEX_ID; id--) {
    const monster = monsters[id];

    if (coordInsidePanel({ y: monster.pos.y, x: monster.pos.x }) && ((creatures_list[monster.creature_id].movement & config.monsters.move.CM_INVISIBLE) !== 0)) {
      monster.lit = true;

      // works correctly even if hallucinating
      panelPutTile(chr(creatures_list[monster.creature_id].sprite), { y: monster.pos.y, x: monster.pos.x });

      detected = true;
    }
  }

  if (detected) {
    await printMessage('You sense the presence of invisible creatures!');
    await printMessage(null);

    // must unlight every monster just lighted
    await updateMonsters(false);
  }

  return detected;
}

// Light an area: -RAK-
//     1.  If corridor  light immediate area
//     2.  If room      light entire room plus immediate area.
export async function spellLightArea(coord: Coord_t): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  if (py.flags.blind < 1) {
    await printMessage('You are surrounded by a white light.');
  }

  // NOTE: this is not changed anywhere. A bug or correct? -MRC-
  const lit = true;

  if (dg.floor[coord.y][coord.x].perma_lit_room && dg.current_level > 0) {
    dungeonLightRoom(coord);
  }

  // Must always light immediate area, because one might be standing on
  // the edge of a room, or next to a destroyed area, etc.
  const spot: Coord_t = { y: 0, x: 0 };
  for (spot.y = coord.y - 1; spot.y <= coord.y + 1; spot.y++) {
    for (spot.x = coord.x - 1; spot.x <= coord.x + 1; spot.x++) {
      dg.floor[spot.y][spot.x].permanent_light = true;
      dungeonLiteSpot(spot);
    }
  }

  return lit;
}

// Darken an area, opposite of light area -RAK-
export async function spellDarkenArea(coord: Coord_t): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let darkened = false;

  const spot: Coord_t = { y: 0, x: 0 };

  if (dg.floor[coord.y][coord.x].perma_lit_room && dg.current_level > 0) {
    const half_height = idiv(SCREEN_HEIGHT, 2);
    const half_width = idiv(SCREEN_WIDTH, 2);
    const start_row = idiv(coord.y, half_height) * half_height + 1;
    const start_col = idiv(coord.x, half_width) * half_width + 1;
    const end_row = start_row + half_height - 1;
    const end_col = start_col + half_width - 1;

    for (spot.y = start_row; spot.y <= end_row; spot.y++) {
      for (spot.x = start_col; spot.x <= end_col; spot.x++) {
        const tile = dg.floor[spot.y][spot.x];

        if (tile.perma_lit_room && tile.feature_id <= MAX_CAVE_FLOOR) {
          tile.permanent_light = false;
          tile.feature_id = TILE_DARK_FLOOR;

          dungeonLiteSpot(spot);

          if (!caveTileVisible(spot)) {
            darkened = true;
          }
        }
      }
    }
  } else {
    for (spot.y = coord.y - 1; spot.y <= coord.y + 1; spot.y++) {
      for (spot.x = coord.x - 1; spot.x <= coord.x + 1; spot.x++) {
        const tile = dg.floor[spot.y][spot.x];

        if (tile.feature_id === TILE_CORR_FLOOR && tile.permanent_light) {
          // permanent_light could have been set by star-lite wand, etc
          tile.permanent_light = false;
          darkened = true;
        }
      }
    }
  }

  if (darkened && py.flags.blind < 1) {
    await printMessage('Darkness surrounds you.');
  }

  return darkened;
}

function dungeonLightAreaAroundFloorTile(coord: Coord_t): void {
  const spot: Coord_t = { y: 0, x: 0 };

  for (spot.y = coord.y - 1; spot.y <= coord.y + 1; spot.y++) {
    for (spot.x = coord.x - 1; spot.x <= coord.x + 1; spot.x++) {
      const tile = dg.floor[spot.y][spot.x];

      if (tile.feature_id >= MIN_CAVE_WALL) {
        tile.permanent_light = true;
      } else if (tile.treasure_id !== 0 && game.treasure.list[tile.treasure_id].category_id >= TV_MIN_VISIBLE &&
        game.treasure.list[tile.treasure_id].category_id <= TV_MAX_VISIBLE) {
        tile.field_mark = true;
      }
    }
  }
}

// Map the current area plus some -RAK-
export async function spellMapCurrentArea(): Promise<void> {
  const row_min = dg.panel.top - randomNumber(10);
  const row_max = dg.panel.bottom + randomNumber(10);
  const col_min = dg.panel.left - randomNumber(20);
  const col_max = dg.panel.right + randomNumber(20);

  const coord: Coord_t = { y: 0, x: 0 };

  for (coord.y = row_min; coord.y <= row_max; coord.y++) {
    for (coord.x = col_min; coord.x <= col_max; coord.x++) {
      if (coordInBounds(coord) && dg.floor[coord.y][coord.x].feature_id <= MAX_CAVE_FLOOR) {
        dungeonLightAreaAroundFloorTile(coord);
      }
    }
  }

  await drawDungeonPanel();
}

// Identify an object -RAK-
export async function spellIdentifyItem(): Promise<boolean> {
  const item_id = ref(0);
  if (!(await inventoryGetInputForItemId(item_id, 'Item you wish identified?', 0, PLAYER_INVENTORY_SIZE, null, null))) {
    return false;
  }

  await itemIdentify(py.inventory[item_id.v], item_id);

  const item = py.inventory[item_id.v];
  spellItemIdentifyAndRemoveRandomInscription(item);

  const description = ref('');
  itemDescription(description, item, true);

  let msg: string;
  if (item_id.v >= PlayerEquipment.Wield) {
    playerRecalculateBonuses();
    msg = sprintf('%s: %s', playerItemWearingDescription(item_id.v), description.v);
  } else {
    msg = sprintf('%c %s', item_id.v + 97, description.v);
  }
  await printMessage(msg);

  return true;
}

// Get all the monsters on the level pissed off. -RAK-
export async function spellAggravateMonsters(affect_distance: number): Promise<boolean> {
  let aggravated = false;

  for (let id = globals.next_free_monster_id - 1; id >= config.monsters.MON_MIN_INDEX_ID; id--) {
    const monster = monsters[id];
    monster.sleep_count = 0;

    if (monster.distance_from_player <= affect_distance && monster.speed < 2) {
      monster.speed++;
      aggravated = true;
    }
  }

  if (aggravated) {
    await printMessage('You hear a sudden stirring in the distance!');
  }

  return aggravated;
}

// Surround the fool with traps (chuckle) -RAK-
export async function spellSurroundPlayerWithTraps(): Promise<boolean> {
  const coord: Coord_t = { y: 0, x: 0 };

  for (coord.y = py.pos.y - 1; coord.y <= py.pos.y + 1; coord.y++) {
    for (coord.x = py.pos.x - 1; coord.x <= py.pos.x + 1; coord.x++) {
      // Don't put a trap under the player, since this can lead to
      // strange situations, e.g. falling through a trap door while
      // trying to rest, setting off a falling rock trap and ending
      // up under the rock.
      if (coord.y === py.pos.y && coord.x === py.pos.x) {
        continue;
      }

      const tile = dg.floor[coord.y][coord.x];

      if (tile.feature_id <= MAX_CAVE_FLOOR) {
        if (tile.treasure_id !== 0) {
          void dungeonDeleteObject(coord);
        }

        await dungeonSetTrap(coord, randomNumber(config.dungeon.objects.MAX_TRAPS) - 1);

        // don't let player gain exp from the newly created traps
        game.treasure.list[tile.treasure_id].misc_use = 0;

        // open pits are immediately visible, so call dungeonLiteSpot
        dungeonLiteSpot(coord);
      }
    }
  }

  // traps are always placed, so just return true
  return true;
}

// Surround the player with doors. -RAK-
export async function spellSurroundPlayerWithDoors(): Promise<boolean> {
  let created = false;

  const coord: Coord_t = { y: 0, x: 0 };

  for (coord.y = py.pos.y - 1; coord.y <= py.pos.y + 1; coord.y++) {
    for (coord.x = py.pos.x - 1; coord.x <= py.pos.x + 1; coord.x++) {
      // Don't put a door under the player!
      if (coord.y === py.pos.y && coord.x === py.pos.x) {
        continue;
      }

      const tile = dg.floor[coord.y][coord.x];

      if (tile.feature_id <= MAX_CAVE_FLOOR) {
        if (tile.treasure_id !== 0) {
          void dungeonDeleteObject(coord);
        }

        const free_id = await popt();
        tile.feature_id = TILE_BLOCKED_FLOOR;
        tile.treasure_id = free_id & 0xff;

        inventoryItemCopyTo(config.dungeon.objects.OBJ_CLOSED_DOOR, game.treasure.list[free_id]);
        dungeonLiteSpot(coord);

        created = true;
      }
    }
  }

  return created;
}

// Destroys any adjacent door(s)/trap(s) -RAK-
export async function spellDestroyAdjacentDoorsTraps(): Promise<boolean> {
  let destroyed = false;

  const coord: Coord_t = { y: 0, x: 0 };

  for (coord.y = py.pos.y - 1; coord.y <= py.pos.y + 1; coord.y++) {
    for (coord.x = py.pos.x - 1; coord.x <= py.pos.x + 1; coord.x++) {
      const tile = dg.floor[coord.y][coord.x];

      if (tile.treasure_id === 0) {
        continue;
      }

      const item = game.treasure.list[tile.treasure_id];

      if ((item.category_id >= TV_INVIS_TRAP && item.category_id <= TV_CLOSED_DOOR && item.category_id !== TV_RUBBLE) || item.category_id === TV_SECRET_DOOR) {
        if (dungeonDeleteObject(coord)) {
          destroyed = true;
        }
      } else if (item.category_id === TV_CHEST && item.flags !== 0) {
        // destroy traps on chest and unlock
        item.flags &= ~(config.treasure.chests.CH_TRAPPED | config.treasure.chests.CH_LOCKED);
        item.special_name_id = SpecialNameIds.SN_UNLOCKED;

        destroyed = true;

        await printMessage('You have disarmed the chest.');
        spellItemIdentifyAndRemoveRandomInscription(item);
      }
    }
  }

  return destroyed;
}

// Display all creatures on the current panel -RAK-
export async function spellDetectMonsters(): Promise<boolean> {
  let detected = false;

  for (let id = globals.next_free_monster_id - 1; id >= config.monsters.MON_MIN_INDEX_ID; id--) {
    const monster = monsters[id];

    if (coordInsidePanel({ y: monster.pos.y, x: monster.pos.x }) && (creatures_list[monster.creature_id].movement & config.monsters.move.CM_INVISIBLE) === 0) {
      monster.lit = true;
      detected = true;

      // works correctly even if hallucinating
      panelPutTile(chr(creatures_list[monster.creature_id].sprite), { y: monster.pos.y, x: monster.pos.x });
    }
  }

  if (detected) {
    await printMessage('You sense the presence of monsters!');
    await printMessage(null);

    // must unlight every monster just lighted
    await updateMonsters(false);
  }

  return detected;
}

// Update monster when light line spell touches it.
async function spellLightLineTouchesMonster(monster_id: number): Promise<void> {
  const monster = monsters[monster_id];
  const creature = creatures_list[monster.creature_id];

  // light up and draw monster
  await monsterUpdateVisibility(monster_id);

  const name = monsterNameDescription(creature.name, monster.lit);

  if ((creature.defenses & config.monsters.defense.CD_LIGHT) !== 0) {
    if (monster.lit) {
      creature_recall[monster.creature_id].defenses |= config.monsters.defense.CD_LIGHT;
    }

    if ((await monsterTakeHit(monster_id, diceRoll({ dice: 2, sides: 8 }))) >= 0) {
      await printMonsterActionText(name, 'shrivels away in the light!');
      await displayCharacterExperience();
    } else {
      await printMonsterActionText(name, 'cringes from the light!');
    }
  }
}

// Leave a line of light in given dir, blue light can sometimes hurt creatures. -RAK-
export async function spellLightLine(coord: Coord_t, direction: number): Promise<void> {
  coord = { y: coord.y, x: coord.x };

  let distance = 0;
  let finished = false;

  const tmp_coord: Coord_t = { y: 0, x: 0 };

  while (!finished) {
    const tile = dg.floor[coord.y][coord.x];

    if (distance > config.treasure.OBJECT_BOLTS_MAX_RANGE || tile.feature_id >= MIN_CLOSED_SPACE) {
      void playerMovePosition(direction, coord);
      finished = true;
      continue; // we're done here, break out of the loop
    }

    if (!tile.permanent_light && !tile.temporary_light) {
      // set permanent_light so that dungeonLiteSpot will work
      tile.permanent_light = true;

      // coord y/x need to be maintained, so copy them
      tmp_coord.y = coord.y;
      tmp_coord.x = coord.x;

      if (tile.feature_id === TILE_LIGHT_FLOOR) {
        if (coordInsidePanel(tmp_coord)) {
          dungeonLightRoom(tmp_coord);
        }
      } else {
        dungeonLiteSpot(tmp_coord);
      }
    }

    // set permanent_light in case temporary_light was true above
    tile.permanent_light = true;

    if (tile.creature_id > 1) {
      await spellLightLineTouchesMonster(tile.creature_id);
    }

    // move must be at end because want to light up current tmp_coord
    void playerMovePosition(direction, coord);
    distance++;
  }
}

// Light line in all directions -RAK-
export async function spellStarlite(coord: Coord_t): Promise<void> {
  coord = { y: coord.y, x: coord.x };

  if (py.flags.blind < 1) {
    await printMessage('The end of the staff bursts into a blue shimmering light.');
  }

  for (let dir = 1; dir <= 9; dir++) {
    if (dir !== 5) {
      await spellLightLine(coord, dir);
    }
  }
}

// Disarms all traps/chests in a given direction -RAK-
export async function spellDisarmAllInDirection(coord: Coord_t, direction: number): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let distance = 0;
  let disarmed = false;

  let tile: Tile_t;

  do {
    tile = dg.floor[coord.y][coord.x];

    // note, must continue up to and including the first non open space,
    // because secret doors have feature_id greater than MAX_OPEN_SPACE
    if (tile.treasure_id !== 0) {
      const item = game.treasure.list[tile.treasure_id];

      if (item.category_id === TV_INVIS_TRAP || item.category_id === TV_VIS_TRAP) {
        if (dungeonDeleteObject(coord)) {
          disarmed = true;
        }
      } else if (item.category_id === TV_CLOSED_DOOR) {
        // Locked or jammed doors become merely closed.
        item.misc_use = 0;
      } else if (item.category_id === TV_SECRET_DOOR) {
        tile.field_mark = true;
        trapChangeVisibility(coord);
        disarmed = true;
      } else if (item.category_id === TV_CHEST && item.flags !== 0) {
        disarmed = true;
        await printMessage('Click!');

        item.flags &= ~(config.treasure.chests.CH_TRAPPED | config.treasure.chests.CH_LOCKED);
        item.special_name_id = SpecialNameIds.SN_UNLOCKED;

        spellItemIdentifyAndRemoveRandomInscription(item);
      }
    }

    // move must be at end because want to light up current spot
    void playerMovePosition(direction, coord);

    distance++;
  } while (distance <= config.treasure.OBJECT_BOLTS_MAX_RANGE && tile.feature_id <= MAX_OPEN_SPACE);

  return disarmed;
}

type DestroyFunction = (item: Inventory_t) => boolean;

// Return flags for given type area affect -RAK-
async function spellGetAreaAffectFlags(spell_type: number, weapon_type: Ref<number>, harm_type: Ref<number>, destroy: Ref<DestroyFunction>): Promise<void> {
  switch (spell_type) {
    case MagicSpellFlags.MagicMissile:
      weapon_type.v = 0;
      harm_type.v = 0;
      destroy.v = setNull;
      break;
    case MagicSpellFlags.Lightning:
      weapon_type.v = config.monsters.spells.CS_BR_LIGHT;
      harm_type.v = config.monsters.defense.CD_LIGHT;
      destroy.v = setLightningDestroyableItems;
      break;
    case MagicSpellFlags.PoisonGas:
      weapon_type.v = config.monsters.spells.CS_BR_GAS;
      harm_type.v = config.monsters.defense.CD_POISON;
      destroy.v = setNull;
      break;
    case MagicSpellFlags.Acid:
      weapon_type.v = config.monsters.spells.CS_BR_ACID;
      harm_type.v = config.monsters.defense.CD_ACID;
      destroy.v = setAcidDestroyableItems;
      break;
    case MagicSpellFlags.Frost:
      weapon_type.v = config.monsters.spells.CS_BR_FROST;
      harm_type.v = config.monsters.defense.CD_FROST;
      destroy.v = setFrostDestroyableItems;
      break;
    case MagicSpellFlags.Fire:
      weapon_type.v = config.monsters.spells.CS_BR_FIRE;
      harm_type.v = config.monsters.defense.CD_FIRE;
      destroy.v = setFireDestroyableItems;
      break;
    case MagicSpellFlags.HolyOrb:
      weapon_type.v = 0;
      harm_type.v = config.monsters.defense.CD_EVIL;
      destroy.v = setNull;
      break;
    default:
      await printMessage('ERROR in spellGetAreaAffectFlags()\n');
  }
}

async function printBoltStrikesMonsterMessage(creature: Creature_t, bolt_name: string, is_lit: boolean): Promise<void> {
  let monster_name: string;
  if (is_lit) {
    monster_name = 'the ' + creature.name;
  } else {
    monster_name = 'it';
  }
  const msg = 'The ' + bolt_name + ' strikes ' + monster_name + '.';
  await printMessage(msg);
}

// Light up, draw, and check for monster damage when Fire Bolt touches it.
async function spellFireBoltTouchesMonster(tile: Tile_t, damage: number, harm_type: number, weapon_id: number, bolt_name: string): Promise<void> {
  const monster = monsters[tile.creature_id];
  const creature = creatures_list[monster.creature_id];

  // light up monster and draw monster, temporarily set
  // permanent_light so that `monsterUpdateVisibility()` will work
  const saved_lit_status = tile.permanent_light;
  tile.permanent_light = true;
  await monsterUpdateVisibility(tile.creature_id);
  tile.permanent_light = saved_lit_status;

  // draw monster and clear previous bolt
  await putQIO();

  await printBoltStrikesMonsterMessage(creature, bolt_name, monster.lit);

  if ((harm_type & creature.defenses) !== 0) {
    damage = damage * 2;
    if (monster.lit) {
      creature_recall[monster.creature_id].defenses |= harm_type;
    }
  } else if ((weapon_id & creature.spells) !== 0) {
    damage = idiv(damage, 4);
    if (monster.lit) {
      creature_recall[monster.creature_id].spells |= weapon_id;
    }
  }

  const name = monsterNameDescription(creature.name, monster.lit);

  if ((await monsterTakeHit(tile.creature_id, damage)) >= 0) {
    await printMonsterActionText(name, 'dies in a fit of agony.');
    await displayCharacterExperience();
  } else if (damage > 0) {
    await printMonsterActionText(name, 'screams in agony.');
  }
}

// Shoot a bolt in a given direction -RAK-
export async function spellFireBolt(coord: Coord_t, direction: number, damage_hp: number, spell_type: number, spell_name: string): Promise<void> {
  coord = { y: coord.y, x: coord.x };

  const dummy = ref<DestroyFunction>(setNull);
  const harm_type = ref(0);
  const weapon_type = ref(0);
  await spellGetAreaAffectFlags(spell_type, weapon_type, harm_type, dummy);

  const old_coord: Coord_t = { y: 0, x: 0 };

  let distance = 0;
  let finished = false;

  while (!finished) {
    old_coord.y = coord.y;
    old_coord.x = coord.x;
    void playerMovePosition(direction, coord);

    distance++;

    const tile = dg.floor[coord.y][coord.x];

    dungeonLiteSpot(old_coord);

    if (distance > config.treasure.OBJECT_BOLTS_MAX_RANGE || tile.feature_id >= MIN_CLOSED_SPACE) {
      finished = true;
      continue; // we're done here, break out of the loop
    }

    if (tile.creature_id > 1) {
      finished = true;
      await spellFireBoltTouchesMonster(tile, damage_hp, harm_type.v, weapon_type.v, spell_name);
    } else if (coordInsidePanel(coord) && py.flags.blind < 1) {
      panelPutTile('*', coord);

      // show the bolt
      await putQIO();
    }
  }
}

// Shoot a ball in a given direction.  Note that balls have an area affect. -RAK-
export async function spellFireBall(coord: Coord_t, direction: number, damage_hp: number, spell_type: number, spell_name: string): Promise<void> {
  coord = { y: coord.y, x: coord.x };

  let total_hits = 0;
  let total_kills = 0;
  const max_distance = 2;

  const destroy = ref<DestroyFunction>(setNull);
  const harm_type = ref(0);
  const weapon_type = ref(0);
  await spellGetAreaAffectFlags(spell_type, weapon_type, harm_type, destroy);

  const old_coord: Coord_t = { y: 0, x: 0 };
  const spot: Coord_t = { y: 0, x: 0 };

  let distance = 0;
  let finished = false;

  while (!finished) {
    old_coord.y = coord.y;
    old_coord.x = coord.x;
    void playerMovePosition(direction, coord);

    distance++;

    dungeonLiteSpot(old_coord);

    if (distance > config.treasure.OBJECT_BOLTS_MAX_RANGE) {
      finished = true;
      continue;
    }

    let tile = dg.floor[coord.y][coord.x];

    if (tile.feature_id >= MIN_CLOSED_SPACE || tile.creature_id > 1) {
      finished = true;

      if (tile.feature_id >= MIN_CLOSED_SPACE) {
        coord.y = old_coord.y;
        coord.x = old_coord.x;
      }

      // The ball hits and explodes.

      // The explosion.
      for (let row = coord.y - max_distance; row <= coord.y + max_distance; row++) {
        for (let col = coord.x - max_distance; col <= coord.x + max_distance; col++) {
          spot.y = row;
          spot.x = col;

          if (coordInBounds(spot) && coordDistanceBetween(coord, spot) <= max_distance && los(coord, spot)) {
            tile = dg.floor[spot.y][spot.x];

            if (tile.treasure_id !== 0 && destroy.v(game.treasure.list[tile.treasure_id])) {
              void dungeonDeleteObject(spot);
            }

            if (tile.feature_id <= MAX_OPEN_SPACE) {
              if (tile.creature_id > 1) {
                const monster = monsters[tile.creature_id];
                const creature = creatures_list[monster.creature_id];

                // lite up creature if visible, temp set permanent_light so that monsterUpdateVisibility works
                const saved_lit_status = tile.permanent_light;
                tile.permanent_light = true;
                await monsterUpdateVisibility(tile.creature_id);

                total_hits++;
                let damage = damage_hp;

                if ((harm_type.v & creature.defenses) !== 0) {
                  damage = damage * 2;
                  if (monster.lit) {
                    creature_recall[monster.creature_id].defenses |= harm_type.v;
                  }
                } else if ((weapon_type.v & creature.spells) !== 0) {
                  damage = idiv(damage, 4);
                  if (monster.lit) {
                    creature_recall[monster.creature_id].spells |= weapon_type.v;
                  }
                }

                damage = idiv(damage, coordDistanceBetween(spot, coord) + 1);

                if ((await monsterTakeHit(tile.creature_id, damage)) >= 0) {
                  total_kills++;
                }
                tile.permanent_light = saved_lit_status;
              } else if (coordInsidePanel(spot) && py.flags.blind < 1) {
                panelPutTile('*', spot);
              }
            }
          }
        }
      }

      // show ball of whatever
      await putQIO();

      for (let row = (coord.y - 2); row <= (coord.y + 2); row++) {
        for (let col = (coord.x - 2); col <= (coord.x + 2); col++) {
          spot.y = row;
          spot.x = col;

          if (coordInBounds(spot) && coordInsidePanel(spot) && coordDistanceBetween(coord, spot) <= max_distance) {
            dungeonLiteSpot(spot);
          }
        }
      }
      // End explosion.

      if (total_hits === 1) {
        await printMessage('The ' + spell_name + ' envelops a creature!');
      } else if (total_hits > 1) {
        await printMessage('The ' + spell_name + ' envelops several creatures!');
      }

      if (total_kills === 1) {
        await printMessage('There is a scream of agony!');
      } else if (total_kills > 1) {
        await printMessage('There are several screams of agony!');
      }

      if (total_kills >= 0) {
        await displayCharacterExperience();
      }
      // End ball hitting.
    } else if (coordInsidePanel(coord) && py.flags.blind < 1) {
      panelPutTile('*', coord);

      // show bolt
      await putQIO();
    }
  }
}

// Breath weapon works like a spellFireBall(), but affects the player.
// Note the area affect. -RAK-
export async function spellBreath(coord: Coord_t, monster_id: number, damage_hp: number, spell_type: number, spell_name: string): Promise<void> {
  coord = { y: coord.y, x: coord.x };

  const max_distance = 2;

  const destroy = ref<DestroyFunction>(setNull);
  const harm_type = ref(0);
  const weapon_type = ref(0);
  await spellGetAreaAffectFlags(spell_type, weapon_type, harm_type, destroy);

  const location: Coord_t = { y: 0, x: 0 };

  for (location.y = coord.y - 2; location.y <= coord.y + 2; location.y++) {
    for (location.x = coord.x - 2; location.x <= coord.x + 2; location.x++) {
      if (coordInBounds(location) && coordDistanceBetween(coord, location) <= max_distance && los(coord, location)) {
        const tile = dg.floor[location.y][location.x];

        if (tile.treasure_id !== 0 && destroy.v(game.treasure.list[tile.treasure_id])) {
          void dungeonDeleteObject(location);
        }

        if (tile.feature_id <= MAX_OPEN_SPACE) {
          // must test status bit, not py.flags.blind here, flag could have
          // been set by a previous monster, but the breath should still
          // be visible until the blindness takes effect
          if (coordInsidePanel(location) && ((py.flags.status & config.player.status.PY_BLIND) === 0)) {
            panelPutTile('*', location);
          }

          if (tile.creature_id > 1) {
            const monster = monsters[tile.creature_id];
            const creature = creatures_list[monster.creature_id];

            let damage = damage_hp;

            if ((harm_type.v & creature.defenses) !== 0) {
              damage = damage * 2;
            } else if ((weapon_type.v & creature.spells) !== 0) {
              damage = idiv(damage, 4);
            }

            damage = idiv(damage, coordDistanceBetween(location, coord) + 1);

            // can not call monsterTakeHit here, since player does not
            // get experience for kill
            monster.hp = monster.hp - damage;
            monster.sleep_count = 0;

            if (monster.hp < 0) {
              let treasure_id = (await monsterDeath({ y: monster.pos.y, x: monster.pos.x }, creature.movement)) >>> 0;

              if (monster.lit) {
                const tmp = ((creature_recall[monster.creature_id].movement & config.monsters.move.CM_TREASURE) >>> config.monsters.move.CM_TR_SHIFT) >>> 0;
                if (tmp > (((treasure_id & config.monsters.move.CM_TREASURE) >>> config.monsters.move.CM_TR_SHIFT) >>> 0)) {
                  treasure_id = ((treasure_id & ~config.monsters.move.CM_TREASURE) | (tmp << config.monsters.move.CM_TR_SHIFT)) >>> 0;
                }
                creature_recall[monster.creature_id].movement =
                  (treasure_id | (creature_recall[monster.creature_id].movement & ~config.monsters.move.CM_TREASURE)) >>> 0;
              }

              // It ate an already processed monster. Handle normally.
              if (monster_id < tile.creature_id) {
                dungeonDeleteMonster(tile.creature_id);
              } else {
                // If it eats this monster, an already processed monster
                // will take its place, causing all kinds of havoc.
                // Delay the kill a bit.
                dungeonRemoveMonsterFromLevel(tile.creature_id);
              }
            }
          } else if (tile.creature_id === 1) {
            let damage = idiv(damage_hp, coordDistanceBetween(location, coord) + 1);

            // let's do at least one point of damage
            // prevents randomNumber(0) problem with damagePoisonedGas, also
            if (damage === 0) {
              damage = 1;
            }

            switch (spell_type) {
              case MagicSpellFlags.Lightning:
                await damageLightningBolt(damage, spell_name);
                break;
              case MagicSpellFlags.PoisonGas:
                damagePoisonedGas(damage, spell_name);
                break;
              case MagicSpellFlags.Acid:
                await damageAcid(damage, spell_name);
                break;
              case MagicSpellFlags.Frost:
                await damageCold(damage, spell_name);
                break;
              case MagicSpellFlags.Fire:
                await damageFire(damage, spell_name);
                break;
              default:
                break;
            }
          }
        }
      }
    }
  }

  // show the ball of gas
  await putQIO();

  const spot: Coord_t = { y: 0, x: 0 };
  for (spot.y = (coord.y - 2); spot.y <= (coord.y + 2); spot.y++) {
    for (spot.x = (coord.x - 2); spot.x <= (coord.x + 2); spot.x++) {
      if (coordInBounds(spot) && coordInsidePanel(spot) && coordDistanceBetween(coord, spot) <= max_distance) {
        dungeonLiteSpot(spot);
      }
    }
  }
}

// Recharge a wand, staff, or rod.  Sometimes the item breaks. -RAK-
export async function spellRechargeItem(number_of_charges: number): Promise<boolean> {
  const item_pos_start = ref(0);
  const item_pos_end = ref(0);
  if (!inventoryFindRange(TV_STAFF, TV_WAND, item_pos_start, item_pos_end)) {
    await printMessage('You have nothing to recharge.');
    return false;
  }

  const item_id = ref(0);
  if (!(await inventoryGetInputForItemId(item_id, 'Recharge which item?', item_pos_start.v, item_pos_end.v, null, null))) {
    return false;
  }

  const item = py.inventory[item_id.v];

  // recharge  I = recharge(20) = 1/6  failure for empty 10th level wand
  // recharge II = recharge(60) = 1/10 failure for empty 10th level wand
  //
  // make it harder to recharge high level, and highly charged wands,
  // note that `fail_chance` can be negative, so check its value before
  // trying to call randomNumber().
  let fail_chance = number_of_charges + 50 - item.depth_first_found - item.misc_use;

  // Automatic failure.
  if (fail_chance < 19) {
    fail_chance = 1;
  } else {
    fail_chance = randomNumber(idiv(fail_chance, 10));
  }

  if (fail_chance === 1) {
    await printMessage('There is a bright flash of light.');
    inventoryDestroyItem(item_id.v);
  } else {
    number_of_charges = idiv(number_of_charges, item.depth_first_found + 2) + 1;
    item.misc_use += 2 + randomNumber(number_of_charges);

    if (spellItemIdentified(item)) {
      spellItemRemoveIdentification(item);
    }

    itemIdentificationClearEmpty(item);
  }

  return true;
}

// Increase or decrease a creatures hit points -RAK-
export async function spellChangeMonsterHitPoints(coord: Coord_t, direction: number, damage_hp: number): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let distance = 0;
  let changed = false;
  let finished = false;

  while (!finished) {
    void playerMovePosition(direction, coord);
    distance++;

    const tile = dg.floor[coord.y][coord.x];

    if (distance > config.treasure.OBJECT_BOLTS_MAX_RANGE || tile.feature_id >= MIN_CLOSED_SPACE) {
      finished = true;
      continue;
    }

    if (tile.creature_id > 1) {
      finished = true;

      const monster = monsters[tile.creature_id];
      const creature = creatures_list[monster.creature_id];

      const name = monsterNameDescription(creature.name, monster.lit);

      if ((await monsterTakeHit(tile.creature_id, damage_hp)) >= 0) {
        await printMonsterActionText(name, 'dies in a fit of agony.');
        await displayCharacterExperience();
      } else if (damage_hp > 0) {
        await printMonsterActionText(name, 'screams in agony.');
      }

      changed = true;
    }
  }

  return changed;
}

// Drains life; note it must be living. -RAK-
export async function spellDrainLifeFromMonster(coord: Coord_t, direction: number): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let distance = 0;
  let drained = false;
  let finished = false;

  while (!finished) {
    void playerMovePosition(direction, coord);
    distance++;

    const tile = dg.floor[coord.y][coord.x];

    if (distance > config.treasure.OBJECT_BOLTS_MAX_RANGE || tile.feature_id >= MIN_CLOSED_SPACE) {
      finished = true;
      continue;
    }

    if (tile.creature_id > 1) {
      finished = true;

      const monster = monsters[tile.creature_id];
      const creature = creatures_list[monster.creature_id];

      if ((creature.defenses & config.monsters.defense.CD_UNDEAD) === 0) {
        const name = monsterNameDescription(creature.name, monster.lit);

        if ((await monsterTakeHit(tile.creature_id, 75)) >= 0) {
          await printMonsterActionText(name, 'dies in a fit of agony.');
          await displayCharacterExperience();
        } else {
          await printMonsterActionText(name, 'screams in agony.');
        }

        drained = true;
      } else {
        creature_recall[monster.creature_id].defenses |= config.monsters.defense.CD_UNDEAD;
      }
    }
  }

  return drained;
}

// Increase or decrease a creatures speed -RAK-
// NOTE: cannot slow a winning creature (BALROG)
export async function spellSpeedMonster(coord: Coord_t, direction: number, speed: number): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let distance = 0;
  let changed = false;
  let finished = false;

  while (!finished) {
    void playerMovePosition(direction, coord);
    distance++;

    const tile = dg.floor[coord.y][coord.x];

    if (distance > config.treasure.OBJECT_BOLTS_MAX_RANGE || tile.feature_id >= MIN_CLOSED_SPACE) {
      finished = true;
      continue;
    }

    if (tile.creature_id > 1) {
      finished = true;

      const monster = monsters[tile.creature_id];
      const creature = creatures_list[monster.creature_id];

      const name = monsterNameDescription(creature.name, monster.lit);

      if (speed > 0) {
        monster.speed += speed;
        monster.sleep_count = 0;

        changed = true;

        await printMonsterActionText(name, 'starts moving faster.');
      } else if (randomNumber(MON_MAX_LEVELS) > creature.level) {
        monster.speed += speed;
        monster.sleep_count = 0;

        changed = true;

        await printMonsterActionText(name, 'starts moving slower.');
      } else {
        monster.sleep_count = 0;

        await printMonsterActionText(name, 'is unaffected.');
      }
    }
  }

  return changed;
}

// Confuse a creature -RAK-
export async function spellConfuseMonster(coord: Coord_t, direction: number): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let distance = 0;
  let confused = false;
  let finished = false;

  while (!finished) {
    void playerMovePosition(direction, coord);
    distance++;

    const tile = dg.floor[coord.y][coord.x];

    if (distance > config.treasure.OBJECT_BOLTS_MAX_RANGE || tile.feature_id >= MIN_CLOSED_SPACE) {
      finished = true;
      continue;
    }

    if (tile.creature_id > 1) {
      finished = true;

      const monster = monsters[tile.creature_id];
      const creature = creatures_list[monster.creature_id];

      const name = monsterNameDescription(creature.name, monster.lit);

      if (randomNumber(MON_MAX_LEVELS) < creature.level || ((creature.defenses & config.monsters.defense.CD_NO_SLEEP) !== 0)) {
        if (monster.lit && ((creature.defenses & config.monsters.defense.CD_NO_SLEEP) !== 0)) {
          creature_recall[monster.creature_id].defenses |= config.monsters.defense.CD_NO_SLEEP;
        }

        // Monsters which resisted the attack should wake up.
        // Monsters with innate resistance ignore the attack.
        if ((creature.defenses & config.monsters.defense.CD_NO_SLEEP) === 0) {
          monster.sleep_count = 0;
        }

        await printMonsterActionText(name, 'is unaffected.');
      } else {
        if (monster.confused_amount !== 0) {
          monster.confused_amount += 3;
        } else {
          monster.confused_amount = 2 + randomNumber(16);
        }
        monster.sleep_count = 0;

        confused = true;

        await printMonsterActionText(name, 'appears confused.');
      }
    }
  }

  return confused;
}

// Sleep a creature. -RAK-
export async function spellSleepMonster(coord: Coord_t, direction: number): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let distance = 0;
  let asleep = false;
  let finished = false;

  while (!finished) {
    void playerMovePosition(direction, coord);
    distance++;

    const tile = dg.floor[coord.y][coord.x];

    if (distance > config.treasure.OBJECT_BOLTS_MAX_RANGE || tile.feature_id >= MIN_CLOSED_SPACE) {
      finished = true;
      continue;
    }

    if (tile.creature_id > 1) {
      finished = true;

      const monster = monsters[tile.creature_id];
      const creature = creatures_list[monster.creature_id];

      const name = monsterNameDescription(creature.name, monster.lit);

      if (randomNumber(MON_MAX_LEVELS) < creature.level || ((creature.defenses & config.monsters.defense.CD_NO_SLEEP) !== 0)) {
        if (monster.lit && ((creature.defenses & config.monsters.defense.CD_NO_SLEEP) !== 0)) {
          creature_recall[monster.creature_id].defenses |= config.monsters.defense.CD_NO_SLEEP;
        }

        await printMonsterActionText(name, 'is unaffected.');
      } else {
        monster.sleep_count = 500;

        asleep = true;

        await printMonsterActionText(name, 'falls asleep.');
      }
    }
  }

  return asleep;
}

// Turn stone to mud, delete wall. -RAK-
export async function spellWallToMud(coord: Coord_t, direction: number): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let distance = 0;
  let turned = false;
  let finished = false;

  while (!finished) {
    void playerMovePosition(direction, coord);
    distance++;

    const tile = dg.floor[coord.y][coord.x];

    // note, this ray can move through walls as it turns them to mud
    if (distance === config.treasure.OBJECT_BOLTS_MAX_RANGE) {
      finished = true;
    }

    if (tile.feature_id >= MIN_CAVE_WALL && tile.feature_id !== TILE_BOUNDARY_WALL) {
      finished = true;

      void (await playerTunnelWall(coord, 1, 0));

      if (caveTileVisible(coord)) {
        turned = true;
        await printMessage('The wall turns into mud.');
      }
    } else if (tile.treasure_id !== 0 && tile.feature_id >= MIN_CLOSED_SPACE) {
      finished = true;

      if (coordInsidePanel(coord) && caveTileVisible(coord)) {
        turned = true;

        const description = ref('');
        itemDescription(description, game.treasure.list[tile.treasure_id], false);

        const out_val = sprintf('The %s turns into mud.', description.v);
        await printMessage(out_val);
      }

      if (game.treasure.list[tile.treasure_id].category_id === TV_RUBBLE) {
        void dungeonDeleteObject(coord);
        if (randomNumber(10) === 1) {
          await dungeonPlaceRandomObjectAt(coord, false);
          if (caveTileVisible(coord)) {
            await printMessage('You have found something!');
          }
        }
        dungeonLiteSpot(coord);
      } else {
        void dungeonDeleteObject(coord);
      }
    }

    if (tile.creature_id > 1) {
      const monster = monsters[tile.creature_id];
      const creature = creatures_list[monster.creature_id];

      if ((creature.defenses & config.monsters.defense.CD_STONE) !== 0) {
        const name = monsterNameDescription(creature.name, monster.lit);

        // Should get these messages even if the monster is not visible.
        const creature_id = await monsterTakeHit(tile.creature_id, 100);
        if (creature_id >= 0) {
          creature_recall[creature_id].defenses |= config.monsters.defense.CD_STONE;
          await printMonsterActionText(name, 'dissolves!');
          await displayCharacterExperience(); // print msg before calling prt_exp
        } else {
          creature_recall[monster.creature_id].defenses |= config.monsters.defense.CD_STONE;
          await printMonsterActionText(name, 'grunts in pain!');
        }
        finished = true;
      }
    }
  }

  return turned;
}

// Destroy all traps and doors in a given direction -RAK-
export async function spellDestroyDoorsTrapsInDirection(coord: Coord_t, direction: number): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let destroyed = false;
  let distance = 0;

  let tile: Tile_t;

  do {
    void playerMovePosition(direction, coord);
    distance++;

    tile = dg.floor[coord.y][coord.x];

    // must move into first closed spot, as it might be a secret door
    if (tile.treasure_id !== 0) {
      const item = game.treasure.list[tile.treasure_id];

      if (item.category_id === TV_INVIS_TRAP || item.category_id === TV_CLOSED_DOOR || item.category_id === TV_VIS_TRAP || item.category_id === TV_OPEN_DOOR ||
        item.category_id === TV_SECRET_DOOR) {
        if (dungeonDeleteObject(coord)) {
          destroyed = true;
          await printMessage('There is a bright flash of light!');
        }
      } else if (item.category_id === TV_CHEST && item.flags !== 0) {
        destroyed = true;
        await printMessage('Click!');

        item.flags &= ~(config.treasure.chests.CH_TRAPPED | config.treasure.chests.CH_LOCKED);
        item.special_name_id = SpecialNameIds.SN_UNLOCKED;

        spellItemIdentifyAndRemoveRandomInscription(item);
      }
    }
  } while ((distance <= config.treasure.OBJECT_BOLTS_MAX_RANGE) || tile.feature_id <= MAX_OPEN_SPACE);

  return destroyed;
}

// Polymorph a monster -RAK-
// NOTE: cannot polymorph a winning creature (BALROG)
export async function spellPolymorphMonster(coord: Coord_t, direction: number): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let distance = 0;
  let morphed = false;
  let finished = false;

  while (!finished) {
    void playerMovePosition(direction, coord);
    distance++;

    const tile = dg.floor[coord.y][coord.x];

    if (distance > config.treasure.OBJECT_BOLTS_MAX_RANGE || tile.feature_id >= MIN_CLOSED_SPACE) {
      finished = true;
      continue;
    }

    if (tile.creature_id > 1) {
      const monster = monsters[tile.creature_id];
      const creature = creatures_list[monster.creature_id];

      if (randomNumber(MON_MAX_LEVELS) > creature.level) {
        finished = true;

        dungeonDeleteMonster(tile.creature_id);

        // Place_monster() should always return true here.
        morphed = await monsterPlaceNew({ y: coord.y, x: coord.x }, randomNumber(monster_levels[MON_MAX_LEVELS] - monster_levels[0]) - 1 + monster_levels[0], false);

        // don't test tile.field_mark here, only permanent_light/temporary_light
        if (morphed && coordInsidePanel(coord) && (tile.temporary_light || tile.permanent_light)) {
          morphed = true;
        }
      } else {
        const name = monsterNameDescription(creature.name, monster.lit);
        await printMonsterActionText(name, 'is unaffected.');
      }
    }
  }

  return morphed;
}

// Create a wall. -RAK-
export async function spellBuildWall(coord: Coord_t, direction: number): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let distance = 0;
  let built = false;
  let finished = false;

  while (!finished) {
    void playerMovePosition(direction, coord);
    distance++;

    const tile = dg.floor[coord.y][coord.x];

    if (distance > config.treasure.OBJECT_BOLTS_MAX_RANGE || tile.feature_id >= MIN_CLOSED_SPACE) {
      finished = true;
      continue; // we're done here, break out of the loop
    }

    if (tile.treasure_id !== 0) {
      void dungeonDeleteObject(coord);
    }

    if (tile.creature_id > 1) {
      finished = true;

      const monster = monsters[tile.creature_id];
      const creature = creatures_list[monster.creature_id];

      if ((creature.movement & config.monsters.move.CM_PHASE) === 0) {
        // monster does not move, can't escape the wall
        let damage: number;
        if ((creature.movement & config.monsters.move.CM_ATTACK_ONLY) !== 0) {
          // this will kill everything
          damage = 3000;
        } else {
          damage = diceRoll({ dice: 4, sides: 8 });
        }

        const name = monsterNameDescription(creature.name, monster.lit);

        await printMonsterActionText(name, 'wails out in pain!');

        if ((await monsterTakeHit(tile.creature_id, damage)) >= 0) {
          await printMonsterActionText(name, 'is embedded in the rock.');
          await displayCharacterExperience();
        }
      } else if (creature.sprite === ord('E') || creature.sprite === ord('X')) {
        // must be an earth elemental, an earth spirit,
        // or a Xorn to increase its hit points
        monster.hp += diceRoll({ dice: 4, sides: 8 });
      }
    }

    tile.feature_id = TILE_MAGMA_WALL;
    tile.field_mark = false;

    // Permanently light this wall if it is lit by player's lamp.
    tile.permanent_light = (tile.temporary_light || tile.permanent_light);
    dungeonLiteSpot(coord);

    built = true;
  }

  return built;
}

// Replicate a creature -RAK-
export async function spellCloneMonster(coord: Coord_t, direction: number): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let distance = 0;
  let finished = false;

  while (!finished) {
    void playerMovePosition(direction, coord);
    distance++;

    const tile = dg.floor[coord.y][coord.x];

    if (distance > config.treasure.OBJECT_BOLTS_MAX_RANGE || tile.feature_id >= MIN_CLOSED_SPACE) {
      finished = true;
    } else if (tile.creature_id > 1) {
      monsters[tile.creature_id].sleep_count = 0;

      // monptr of 0 is safe here, since can't reach here from creatures
      return monsterMultiply(coord, monsters[tile.creature_id].creature_id, 0);
    }
  }

  return false;
}

// Move the creature record to a new location -RAK-
export async function spellTeleportAwayMonster(monster_id: number, distance_from_player: number): Promise<void> {
  let counter = 0;

  const coord: Coord_t = { y: 0, x: 0 };
  const monster = monsters[monster_id];

  do {
    do {
      coord.y = monster.pos.y + (randomNumber(2 * distance_from_player + 1) - (distance_from_player + 1));
      coord.x = monster.pos.x + (randomNumber(2 * distance_from_player + 1) - (distance_from_player + 1));
    } while (!coordInBounds(coord));

    counter++;
    if (counter > 9) {
      counter = 0;
      distance_from_player += 5;
    }
  } while ((dg.floor[coord.y][coord.x].feature_id >= MIN_CLOSED_SPACE) || (dg.floor[coord.y][coord.x].creature_id !== 0));

  dungeonMoveCreatureRecord({ y: monster.pos.y, x: monster.pos.x }, coord);
  dungeonLiteSpot({ y: monster.pos.y, x: monster.pos.x });

  monster.pos.y = coord.y;
  monster.pos.x = coord.x;

  // this is necessary, because the creature is
  // not currently visible in its new position.
  monster.lit = false;
  monster.distance_from_player = coordDistanceBetween(py.pos, coord);

  await monsterUpdateVisibility(monster_id);
}

// Teleport player to spell casting creature -RAK-
export async function spellTeleportPlayerTo(coord: Coord_t): Promise<void> {
  coord = { y: coord.y, x: coord.x };

  let distance = 1;
  let counter = 0;

  const rnd_coord: Coord_t = { y: 0, x: 0 };

  do {
    rnd_coord.y = coord.y + (randomNumber(2 * distance + 1) - (distance + 1));
    rnd_coord.x = coord.x + (randomNumber(2 * distance + 1) - (distance + 1));
    counter++;
    if (counter > 9) {
      counter = 0;
      distance++;
    }
  } while (!coordInBounds(rnd_coord) || (dg.floor[rnd_coord.y][rnd_coord.x].feature_id >= MIN_CLOSED_SPACE) || (dg.floor[rnd_coord.y][rnd_coord.x].creature_id >= 2));

  dungeonMoveCreatureRecord(py.pos, rnd_coord);

  const spot: Coord_t = { y: 0, x: 0 };
  for (spot.y = py.pos.y - 1; spot.y <= py.pos.y + 1; spot.y++) {
    for (spot.x = py.pos.x - 1; spot.x <= py.pos.x + 1; spot.x++) {
      dg.floor[spot.y][spot.x].temporary_light = false;
      dungeonLiteSpot(spot);
    }
  }

  dungeonLiteSpot(py.pos);

  py.pos.y = rnd_coord.y;
  py.pos.x = rnd_coord.x;

  await dungeonResetView();

  // light creatures
  await updateMonsters(false);
}

// Teleport all creatures in a given direction away -RAK-
export async function spellTeleportAwayMonsterInDirection(coord: Coord_t, direction: number): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  let distance = 0;
  let teleported = false;
  let finished = false;

  while (!finished) {
    void playerMovePosition(direction, coord);
    distance++;

    const tile = dg.floor[coord.y][coord.x];

    if (distance > config.treasure.OBJECT_BOLTS_MAX_RANGE || tile.feature_id >= MIN_CLOSED_SPACE) {
      finished = true;
      continue;
    }

    if (tile.creature_id > 1) {
      // wake it up
      monsters[tile.creature_id].sleep_count = 0;

      await spellTeleportAwayMonster(tile.creature_id, config.monsters.MON_MAX_SIGHT);

      teleported = true;
    }
  }

  return teleported;
}

// Delete all creatures within max_sight distance -RAK-
// NOTE : Winning creatures cannot be killed by genocide.
export function spellMassGenocide(): boolean {
  let killed = false;

  for (let id = globals.next_free_monster_id - 1; id >= config.monsters.MON_MIN_INDEX_ID; id--) {
    const monster = monsters[id];
    const creature = creatures_list[monster.creature_id];

    if (monster.distance_from_player <= config.monsters.MON_MAX_SIGHT && (creature.movement & config.monsters.move.CM_WIN) === 0) {
      killed = true;
      dungeonDeleteMonster(id);
    }
  }

  return killed;
}

// Delete all creatures of a given type from level. -RAK-
// This does not keep creatures of type from appearing later.
// NOTE : Winning creatures can not be killed by genocide.
export async function spellGenocide(): Promise<boolean> {
  const creature_char = ref('\0');
  if (!(await getTileCharacter('Which type of creature do you wish exterminated?', creature_char))) {
    return false;
  }

  let killed = false;

  for (let id = globals.next_free_monster_id - 1; id >= config.monsters.MON_MIN_INDEX_ID; id--) {
    const monster = monsters[id];
    const creature = creatures_list[monster.creature_id];

    // a char against the uint8_t sprite: the char is signed
    if (i8(ord(creature_char.v)) === creatures_list[monster.creature_id].sprite) {
      if ((creature.movement & config.monsters.move.CM_WIN) === 0) {
        killed = true;
        dungeonDeleteMonster(id);
      } else {
        // genocide is a powerful spell, so we will let the player
        // know the names of the creatures they did not destroy,
        // this message makes no sense otherwise
        await printMessage('The ' + creature.name + ' is unaffected.');
      }
    }
  }

  return killed;
}

// Change speed of any creature . -RAK-
// NOTE: cannot slow a winning creature (BALROG)
export async function spellSpeedAllMonsters(speed: number): Promise<boolean> {
  let speedy = false;

  for (let id = globals.next_free_monster_id - 1; id >= config.monsters.MON_MIN_INDEX_ID; id--) {
    const monster = monsters[id];
    const creature = creatures_list[monster.creature_id];

    const name = monsterNameDescription(creature.name, monster.lit);

    if (monster.distance_from_player > config.monsters.MON_MAX_SIGHT || !los(py.pos, monster.pos)) {
      continue; // do nothing
    }

    if (speed > 0) {
      monster.speed += speed;
      monster.sleep_count = 0;

      if (monster.lit) {
        speedy = true;
        await printMonsterActionText(name, 'starts moving faster.');
      }
    } else if (randomNumber(MON_MAX_LEVELS) > creature.level) {
      monster.speed += speed;
      monster.sleep_count = 0;

      if (monster.lit) {
        speedy = true;
        await printMonsterActionText(name, 'starts moving slower.');
      }
    } else if (monster.lit) {
      monster.sleep_count = 0;
      await printMonsterActionText(name, 'is unaffected.');
    }
  }

  return speedy;
}

// Sleep any creature . -RAK-
export async function spellSleepAllMonsters(): Promise<boolean> {
  let asleep = false;

  for (let id = globals.next_free_monster_id - 1; id >= config.monsters.MON_MIN_INDEX_ID; id--) {
    const monster = monsters[id];
    const creature = creatures_list[monster.creature_id];

    const name = monsterNameDescription(creature.name, monster.lit);

    if (monster.distance_from_player > config.monsters.MON_MAX_SIGHT || !los(py.pos, monster.pos)) {
      continue; // do nothing
    }

    if (randomNumber(MON_MAX_LEVELS) < creature.level || ((creature.defenses & config.monsters.defense.CD_NO_SLEEP) !== 0)) {
      if (monster.lit) {
        if ((creature.defenses & config.monsters.defense.CD_NO_SLEEP) !== 0) {
          creature_recall[monster.creature_id].defenses |= config.monsters.defense.CD_NO_SLEEP;
        }
        await printMonsterActionText(name, 'is unaffected.');
      }
    } else {
      monster.sleep_count = 500;
      if (monster.lit) {
        asleep = true;
        await printMonsterActionText(name, 'falls asleep.');
      }
    }
  }

  return asleep;
}

// Polymorph any creature that player can see. -RAK-
// NOTE: cannot polymorph a winning creature (BALROG)
export async function spellMassPolymorph(): Promise<boolean> {
  let morphed = false;
  const coord: Coord_t = { y: 0, x: 0 };

  for (let id = globals.next_free_monster_id - 1; id >= config.monsters.MON_MIN_INDEX_ID; id--) {
    const monster = monsters[id];

    if (monster.distance_from_player <= config.monsters.MON_MAX_SIGHT) {
      const creature = creatures_list[monster.creature_id];

      if ((creature.movement & config.monsters.move.CM_WIN) === 0) {
        coord.y = monster.pos.y;
        coord.x = monster.pos.x;
        dungeonDeleteMonster(id);

        // Place_monster() should always return true here.
        morphed = await monsterPlaceNew({ y: coord.y, x: coord.x }, randomNumber(monster_levels[MON_MAX_LEVELS] - monster_levels[0]) - 1 + monster_levels[0], false);
      }
    }
  }

  return morphed;
}

// Display evil creatures on current panel -RAK-
export async function spellDetectEvil(): Promise<boolean> {
  let detected = false;

  for (let id = globals.next_free_monster_id - 1; id >= config.monsters.MON_MIN_INDEX_ID; id--) {
    const monster = monsters[id];

    if (coordInsidePanel({ y: monster.pos.y, x: monster.pos.x }) && ((creatures_list[monster.creature_id].defenses & config.monsters.defense.CD_EVIL) !== 0)) {
      monster.lit = true;

      detected = true;

      // works correctly even if hallucinating
      panelPutTile(chr(creatures_list[monster.creature_id].sprite), { y: monster.pos.y, x: monster.pos.x });
    }
  }

  if (detected) {
    await printMessage('You sense the presence of evil!');
    await printMessage(null);

    // must unlight every monster just lighted
    await updateMonsters(false);
  }

  return detected;
}

// Change players hit points in some manner -RAK-
export async function spellChangePlayerHitPoints(adjustment: number): Promise<boolean> {
  if (py.misc.current_hp >= py.misc.max_hp) {
    return false;
  }

  py.misc.current_hp += adjustment;
  if (py.misc.current_hp > py.misc.max_hp) {
    py.misc.current_hp = py.misc.max_hp;
    py.misc.current_hp_fraction = 0;
  }
  printCharacterCurrentHitPoints();

  adjustment = idiv(adjustment, 5);

  if (adjustment < 3) {
    if (adjustment === 0) {
      await printMessage('You feel a little better.');
    } else {
      await printMessage('You feel better.');
    }
  } else {
    if (adjustment < 7) {
      await printMessage('You feel much better.');
    } else {
      await printMessage('You feel very good.');
    }
  }

  return true;
}

async function earthquakeHitsMonster(monster_id: number): Promise<void> {
  const monster = monsters[monster_id];
  const creature = creatures_list[monster.creature_id];

  if ((creature.movement & config.monsters.move.CM_PHASE) === 0) {
    let damage: number;
    if ((creature.movement & config.monsters.move.CM_ATTACK_ONLY) !== 0) {
      // this will kill everything
      damage = 3000;
    } else {
      damage = diceRoll({ dice: 4, sides: 8 });
    }

    const name = monsterNameDescription(creature.name, monster.lit);

    await printMonsterActionText(name, 'wails out in pain!');

    if ((await monsterTakeHit(monster_id, damage)) >= 0) {
      await printMonsterActionText(name, 'is embedded in the rock.');
      await displayCharacterExperience();
    }
  } else if (creature.sprite === ord('E') || creature.sprite === ord('X')) {
    // must be an earth elemental or an earth spirit, or a
    // Xorn increase its hit points
    monster.hp += diceRoll({ dice: 4, sides: 8 });
  }
}

// This is a fun one.  In a given block, pick some walls and
// turn them into open spots.  Pick some open spots and dg.game_turn
// them into walls.  An "Earthquake" effect. -RAK-
export async function spellEarthquake(): Promise<void> {
  const coord: Coord_t = { y: 0, x: 0 };

  for (coord.y = py.pos.y - 8; coord.y <= py.pos.y + 8; coord.y++) {
    for (coord.x = py.pos.x - 8; coord.x <= py.pos.x + 8; coord.x++) {
      if ((coord.y !== py.pos.y || coord.x !== py.pos.x) && coordInBounds(coord) && randomNumber(8) === 1) {
        const tile = dg.floor[coord.y][coord.x];

        if (tile.treasure_id !== 0) {
          void dungeonDeleteObject(coord);
        }

        if (tile.creature_id > 1) {
          await earthquakeHitsMonster(tile.creature_id);
        }

        if (tile.feature_id >= MIN_CAVE_WALL && tile.feature_id !== TILE_BOUNDARY_WALL) {
          tile.feature_id = TILE_CORR_FLOOR;
          tile.permanent_light = false;
          tile.field_mark = false;
        } else if (tile.feature_id <= MAX_CAVE_FLOOR) {
          const tmp = randomNumber(10);

          if (tmp < 6) {
            tile.feature_id = TILE_QUARTZ_WALL;
          } else if (tmp < 9) {
            tile.feature_id = TILE_MAGMA_WALL;
          } else {
            tile.feature_id = TILE_GRANITE_WALL;
          }

          tile.field_mark = false;
        }
        dungeonLiteSpot(coord);
      }
    }
  }
}

// Create some high quality mush for the player. -RAK-
export async function spellCreateFood(): Promise<void> {
  // Note: must take reference to this location as dungeonPlaceRandomObjectAt()
  // below, changes the tile values.
  const tile = dg.floor[py.pos.y][py.pos.x];

  // take no action here, don't want to destroy object under player
  if (tile.treasure_id !== 0) {
    // set player_free_turn so that scroll/spell points won't be used
    game.player_free_turn = true;

    await printMessage('There is already an object under you.');

    return;
  }

  await dungeonPlaceRandomObjectAt(py.pos, false);
  inventoryItemCopyTo(config.dungeon.objects.OBJ_MUSH, game.treasure.list[tile.treasure_id]);
}

// Attempts to destroy a type of creature.  Success depends on
// the creatures level VS. the player's level -RAK-
export async function spellDispelCreature(creature_defense: number, damage: number): Promise<boolean> {
  let dispelled = false;

  for (let id = globals.next_free_monster_id - 1; id >= config.monsters.MON_MIN_INDEX_ID; id--) {
    const monster = monsters[id];

    if (monster.distance_from_player <= config.monsters.MON_MAX_SIGHT && ((creature_defense & creatures_list[monster.creature_id].defenses) !== 0) &&
      los(py.pos, monster.pos)) {
      const creature = creatures_list[monster.creature_id];

      creature_recall[monster.creature_id].defenses |= creature_defense;

      dispelled = true;

      const name = monsterNameDescription(creature.name, monster.lit);

      const hit = await monsterTakeHit(id, randomNumber(damage));

      // Should get these messages even if the monster is not visible.
      if (hit >= 0) {
        await printMonsterActionText(name, 'dissolves!');
      } else {
        await printMonsterActionText(name, 'shudders.');
      }

      if (hit >= 0) {
        await displayCharacterExperience();
      }
    }
  }

  return dispelled;
}

// Attempt to turn (confuse) undead creatures. -RAK-
export async function spellTurnUndead(): Promise<boolean> {
  let turned = false;

  for (let id = globals.next_free_monster_id - 1; id >= config.monsters.MON_MIN_INDEX_ID; id--) {
    const monster = monsters[id];
    const creature = creatures_list[monster.creature_id];

    if (monster.distance_from_player <= config.monsters.MON_MAX_SIGHT && ((creature.defenses & config.monsters.defense.CD_UNDEAD) !== 0) && los(py.pos, monster.pos)) {
      const name = monsterNameDescription(creature.name, monster.lit);

      if (py.misc.level + 1 > creature.level || randomNumber(5) === 1) {
        if (monster.lit) {
          creature_recall[monster.creature_id].defenses |= config.monsters.defense.CD_UNDEAD;

          turned = true;

          await printMonsterActionText(name, 'runs frantically!');
        }

        monster.confused_amount = py.misc.level;
      } else if (monster.lit) {
        await printMonsterActionText(name, 'is unaffected.');
      }
    }
  }

  return turned;
}

// Leave a glyph of warding. Creatures will not pass over! -RAK-
export async function spellWardingGlyph(): Promise<void> {
  if (dg.floor[py.pos.y][py.pos.x].treasure_id === 0) {
    const free_id = await popt();
    dg.floor[py.pos.y][py.pos.x].treasure_id = free_id & 0xff;
    inventoryItemCopyTo(config.dungeon.objects.OBJ_SCARE_MON, game.treasure.list[free_id]);
  }
}

// Lose a strength point. -RAK-
export async function spellLoseSTR(): Promise<void> {
  if (!py.flags.sustain_str) {
    void (await playerStatRandomDecrease(PlayerAttr.A_STR));
    await printMessage('You feel very sick.');
  } else {
    await printMessage('You feel sick for a moment,  it passes.');
  }
}

// Lose an intelligence point. -RAK-
export async function spellLoseINT(): Promise<void> {
  if (!py.flags.sustain_int) {
    void (await playerStatRandomDecrease(PlayerAttr.A_INT));
    await printMessage('You become very dizzy.');
  } else {
    await printMessage('You become dizzy for a moment,  it passes.');
  }
}

// Lose a wisdom point. -RAK-
export async function spellLoseWIS(): Promise<void> {
  if (!py.flags.sustain_wis) {
    void (await playerStatRandomDecrease(PlayerAttr.A_WIS));
    await printMessage('You feel very naive.');
  } else {
    await printMessage('You feel naive for a moment,  it passes.');
  }
}

// Lose a dexterity point. -RAK-
export async function spellLoseDEX(): Promise<void> {
  if (!py.flags.sustain_dex) {
    void (await playerStatRandomDecrease(PlayerAttr.A_DEX));
    await printMessage('You feel very sore.');
  } else {
    await printMessage('You feel sore for a moment,  it passes.');
  }
}

// Lose a constitution point. -RAK-
export async function spellLoseCON(): Promise<void> {
  if (!py.flags.sustain_con) {
    void (await playerStatRandomDecrease(PlayerAttr.A_CON));
    await printMessage('You feel very sick.');
  } else {
    await printMessage('You feel sick for a moment,  it passes.');
  }
}

// Lose a charisma point. -RAK-
export async function spellLoseCHR(): Promise<void> {
  if (!py.flags.sustain_chr) {
    void (await playerStatRandomDecrease(PlayerAttr.A_CHR));
    await printMessage('Your skin starts to itch.');
  } else {
    await printMessage('Your skin starts to itch, but feels better now.');
  }
}

// Lose experience -RAK-
export async function spellLoseEXP(adjustment: number): Promise<void> {
  if (adjustment > py.misc.exp) {
    py.misc.exp = 0;
  } else {
    py.misc.exp -= adjustment;
  }
  await displayCharacterExperience();

  let exp = 0;
  // (signed) (uint32_t * uint8_t / 100): unsigned arithmetic
  while ((idiv((py.base_exp_levels[exp] * py.misc.experience_factor) >>> 0, 100) | 0) <= py.misc.exp) {
    exp++;
  }

  // increment exp once more, because level 1 exp is stored in player_base_exp_levels[0]
  exp++;

  if (py.misc.level !== exp) {
    py.misc.level = exp;

    playerCalculateHitPoints();

    const character_class = classes[py.misc.class_id];

    if (character_class.class_to_use_mage_spells === config.spells.SPELL_TYPE_MAGE) {
      await playerCalculateAllowedSpellsCount(PlayerAttr.A_INT);
      playerGainMana(PlayerAttr.A_INT);
    } else if (character_class.class_to_use_mage_spells === config.spells.SPELL_TYPE_PRIEST) {
      await playerCalculateAllowedSpellsCount(PlayerAttr.A_WIS);
      playerGainMana(PlayerAttr.A_WIS);
    }
    printCharacterLevel();
    printCharacterTitle();
  }
}

// Slow Poison -RAK-
export async function spellSlowPoison(): Promise<boolean> {
  if (py.flags.poisoned > 0) {
    py.flags.poisoned = idiv(py.flags.poisoned, 2);
    if (py.flags.poisoned < 1) {
      py.flags.poisoned = 1;
    }
    await printMessage('The effect of the poison has been reduced.');
    return true;
  }

  return false;
}

function replaceSpot(coord: Coord_t, typ: number): void {
  const tile = dg.floor[coord.y][coord.x];

  switch (typ) {
    case 1:
    case 2:
    case 3:
      tile.feature_id = TILE_CORR_FLOOR;
      break;
    case 4:
    case 7:
    case 10:
      tile.feature_id = TILE_GRANITE_WALL;
      break;
    case 5:
    case 8:
    case 11:
      tile.feature_id = TILE_MAGMA_WALL;
      break;
    case 6:
    case 9:
    case 12:
      tile.feature_id = TILE_QUARTZ_WALL;
      break;
    default:
      break;
  }

  tile.permanent_light = false;
  tile.field_mark = false;
  tile.perma_lit_room = false; // this is no longer part of a room

  if (tile.treasure_id !== 0) {
    void dungeonDeleteObject(coord);
  }

  if (tile.creature_id > 1) {
    dungeonDeleteMonster(tile.creature_id);
  }
}

// The spell of destruction. -RAK-
// NOTE:
//   Winning creatures that are deleted will be considered as teleporting to another level.
//   This will NOT win the game.
export async function spellDestroyArea(coord: Coord_t): Promise<void> {
  coord = { y: coord.y, x: coord.x };

  if (dg.current_level > 0) {
    const spot: Coord_t = { y: 0, x: 0 };

    for (spot.y = coord.y - 15; spot.y <= coord.y + 15; spot.y++) {
      for (spot.x = coord.x - 15; spot.x <= coord.x + 15; spot.x++) {
        if (coordInBounds(spot) && dg.floor[spot.y][spot.x].feature_id !== TILE_BOUNDARY_WALL) {
          const distance = coordDistanceBetween(spot, coord);

          // clear player's spot, but don't put wall there
          if (distance === 0) {
            replaceSpot(spot, 1);
          } else if (distance < 13) {
            replaceSpot(spot, randomNumber(6));
          } else if (distance < 16) {
            replaceSpot(spot, randomNumber(9));
          }
        }
      }
    }
  }

  await printMessage('There is a searing blast of light!');
  py.flags.blind += 10 + randomNumber(10);
}

// Enchants a plus onto an item. -RAK-
// `limit` param is the maximum bonus allowed; usually 10,
// but weapon's maximum damage when enchanting melee weapons to damage.
export function spellEnchantItem(plusses: Ref<number>, max_bonus_limit: number): boolean {
  // the parameter is an int16_t
  max_bonus_limit = (max_bonus_limit << 16) >> 16;

  // avoid randomNumber(0) call
  if (max_bonus_limit <= 0) {
    return false;
  }

  let chance = 0;

  if (plusses.v > 0) {
    chance = plusses.v;

    // very rarely allow enchantment over limit
    if (randomNumber(100) === 1) {
      chance = randomNumber(chance) - 1;
    }
  }

  if (randomNumber(max_bonus_limit) > chance) {
    plusses.v = ((plusses.v + 1) << 16) >> 16;
    return true;
  }

  return false;
}

// Removes curses from items in inventory -RAK-
export function spellRemoveCurseFromAllWornItems(): boolean {
  let removed = false;

  for (let id = PlayerEquipment.Wield; id <= PlayerEquipment.Outer; id++) {
    if (playerWornItemIsCursed(id)) {
      playerWornItemRemoveCurse(id);
      playerRecalculateBonuses();
      removed = true;
    }
  }

  return removed;
}

// Restores any drained experience -RAK-
export async function spellRestorePlayerLevels(): Promise<boolean> {
  if (py.misc.max_exp > py.misc.exp) {
    await printMessage('You feel your life energies returning.');

    // this while loop is not redundant, ptr_exp may reduce the exp level
    while (py.misc.exp < py.misc.max_exp) {
      py.misc.exp = py.misc.max_exp;
      await displayCharacterExperience();
    }

    return true;
  }

  return false;
}
