// player_throw.cpp: Player throw functions
import { config } from './config.ts';
import {
  BTH_PER_PLUS_TO_HIT_ADJUST, MAX_OPEN_SPACE, PlayerAttr, PlayerClassLevelAdj, PlayerEquipment, TV_ARROW, TV_BOLT, TV_BOW,
  TV_NOTHING, TV_SLING_AMMO,
} from './constants.ts';
import { creatures_list } from './data_creatures.ts';
import { class_level_adj } from './data_player.ts';
import { diceRoll } from './dice.ts';
import { coordInBounds, dungeonLiteSpot } from './dungeon.ts';
import { getDirectionWithMemory, getRandomDirection, randomNumber } from './game.ts';
import { popt } from './game_objects.ts';
import { dg, game, monsters, py } from './globals.ts';
import { itemDescription, itemTypeRemainingCountDescription } from './identification.ts';
import { inventoryDestroyItem } from './inventory.ts';
import { chr, idiv, ref, type Ref, sprintf, u8 } from './libc.ts';
import { monsterTakeHit } from './monster.ts';
import { playerMovePosition, playerTestBeingHit, playerWeaponCriticalBlow } from './player.ts';
import { itemMagicAbilityDamage } from './player_magic.ts';
import { type Coord_t, Inventory_t } from './structs.ts';
import { coordInsidePanel, displayCharacterExperience } from './ui.ts';
import { inventoryGetInputForItemId } from './ui_inventory.ts';
import { panelPutTile, printMessage, putQIO } from './ui_io.ts';

function inventoryThrow(item_id: number, treasure: Inventory_t): void {
  const item = py.inventory[item_id];

  treasure.assign(item);

  if (item.items_count > 1) {
    treasure.items_count = 1;
    item.items_count--;
    py.pack.weight -= item.weight;
    py.flags.status |= config.player.status.PY_STR_WGT;
  } else {
    inventoryDestroyItem(item_id);
  }
}

// Obtain the hit and damage bonuses and the maximum distance for a thrown missile.
function weaponMissileFacts(item: Inventory_t, base_to_hit: Ref<number>, plus_to_hit: Ref<number>, damage: Ref<number>, distance: Ref<number>): void {
  let weight = item.weight;
  if (weight < 1) {
    weight = 1;
  }

  // Throwing objects
  damage.v = diceRoll(item.damage) + item.to_damage;
  base_to_hit.v = idiv(py.misc.bth_with_bows * 75, 100);
  plus_to_hit.v = py.misc.plusses_to_hit + item.to_hit;

  // Add this back later if the correct throwing device. -CJS-
  if (py.inventory[PlayerEquipment.Wield].category_id !== TV_NOTHING) {
    plus_to_hit.v -= py.inventory[PlayerEquipment.Wield].to_hit;
  }

  distance.v = idiv((py.stats.used[PlayerAttr.A_STR] + 20) * 10, weight);
  if (distance.v > 10) {
    distance.v = 10;
  }

  // multiply damage bonuses instead of adding, when have proper
  // missile/weapon combo, this makes them much more useful

  // Using Bows, slings, or crossbows?
  if (py.inventory[PlayerEquipment.Wield].category_id !== TV_BOW) {
    return;
  }

  switch (py.inventory[PlayerEquipment.Wield].misc_use) {
    case 1:
      if (item.category_id === TV_SLING_AMMO) { // Sling and ammo
        base_to_hit.v = py.misc.bth_with_bows;
        plus_to_hit.v += 2 * py.inventory[PlayerEquipment.Wield].to_hit;
        damage.v += py.inventory[PlayerEquipment.Wield].to_damage;
        damage.v = damage.v * 2;
        distance.v = 20;
      }
      break;
    case 2:
      if (item.category_id === TV_ARROW) { // Short Bow and Arrow
        base_to_hit.v = py.misc.bth_with_bows;
        plus_to_hit.v += 2 * py.inventory[PlayerEquipment.Wield].to_hit;
        damage.v += py.inventory[PlayerEquipment.Wield].to_damage;
        damage.v = damage.v * 2;
        distance.v = 25;
      }
      break;
    case 3:
      if (item.category_id === TV_ARROW) { // Long Bow and Arrow
        base_to_hit.v = py.misc.bth_with_bows;
        plus_to_hit.v += 2 * py.inventory[PlayerEquipment.Wield].to_hit;
        damage.v += py.inventory[PlayerEquipment.Wield].to_damage;
        damage.v = damage.v * 3;
        distance.v = 30;
      }
      break;
    case 4:
      if (item.category_id === TV_ARROW) { // Composite Bow and Arrow
        base_to_hit.v = py.misc.bth_with_bows;
        plus_to_hit.v += 2 * py.inventory[PlayerEquipment.Wield].to_hit;
        damage.v += py.inventory[PlayerEquipment.Wield].to_damage;
        damage.v = damage.v * 4;
        distance.v = 35;
      }
      break;
    case 5:
      if (item.category_id === TV_BOLT) { // Light Crossbow and Bolt
        base_to_hit.v = py.misc.bth_with_bows;
        plus_to_hit.v += 2 * py.inventory[PlayerEquipment.Wield].to_hit;
        damage.v += py.inventory[PlayerEquipment.Wield].to_damage;
        damage.v = damage.v * 3;
        distance.v = 25;
      }
      break;
    case 6:
      if (item.category_id === TV_BOLT) { // Heavy Crossbow and Bolt
        base_to_hit.v = py.misc.bth_with_bows;
        plus_to_hit.v += 2 * py.inventory[PlayerEquipment.Wield].to_hit;
        damage.v += py.inventory[PlayerEquipment.Wield].to_damage;
        damage.v = damage.v * 4;
        distance.v = 35;
      }
      break;
    default:
      // NOOP
      break;
  }
}

async function inventoryDropOrThrowItem(coord: Coord_t, item: Inventory_t): Promise<void> {
  const position = { y: coord.y, x: coord.x };

  let flag = false;

  if (randomNumber(10) > 1) {
    for (let k = 0; !flag && k <= 9;) {
      if (coordInBounds(position)) {
        if (dg.floor[position.y][position.x].feature_id <= MAX_OPEN_SPACE && dg.floor[position.y][position.x].treasure_id === 0) {
          flag = true;
        }
      }

      if (!flag) {
        position.y = coord.y + randomNumber(3) - 2;
        position.x = coord.x + randomNumber(3) - 2;
        k++;
      }
    }
  }

  if (flag) {
    const cur_pos = await popt();
    dg.floor[position.y][position.x].treasure_id = u8(cur_pos);
    game.treasure.list[cur_pos].assign(item);
    dungeonLiteSpot(position);
  } else {
    const description = ref('');
    itemDescription(description, item, false);

    const msg = sprintf('The %s disappears.', description.v);
    await printMessage(msg);
  }
}

// Throw an object across the dungeon. -RAK-
// Note: Flasks of oil do fire damage
// Note: Extra damage and chance of hitting when missiles are used
// with correct weapon. i.e. wield bow and throw arrow.
export async function playerThrowItem(): Promise<void> {
  if (py.pack.unique_items === 0) {
    await printMessage('But you are not carrying anything.');
    game.player_free_turn = true;
    return;
  }

  const item_id = ref(0);
  if (!(await inventoryGetInputForItemId(item_id, 'Fire/Throw which one?', 0, py.pack.unique_items - 1, null, null))) {
    return;
  }

  const dir = ref(0);
  if (!(await getDirectionWithMemory(null, dir))) {
    return;
  }

  await itemTypeRemainingCountDescription(item_id.v);

  if (py.flags.confused > 0) {
    await printMessage('You are confused.');
    dir.v = getRandomDirection();
  }

  const thrown_item = new Inventory_t();
  inventoryThrow(item_id.v, thrown_item);

  const tbth = ref(0);
  const tpth = ref(0);
  const tdam = ref(0);
  const tdis = ref(0);
  weaponMissileFacts(thrown_item, tbth, tpth, tdam, tdis);

  const tile_char = chr(thrown_item.sprite);
  let visible: boolean;
  let current_distance = 0;

  const coord = { y: py.pos.y, x: py.pos.x };
  const old_coord = { y: py.pos.y, x: py.pos.x };

  let flag = false;

  while (!flag) {
    playerMovePosition(dir.v, coord);
    current_distance++;
    dungeonLiteSpot(old_coord);

    if (current_distance > tdis.v) {
      flag = true;
    }

    const tile = dg.floor[coord.y][coord.x];

    if (tile.feature_id <= MAX_OPEN_SPACE && !flag) {
      if (tile.creature_id > 1) {
        flag = true;

        const m_ptr = monsters[tile.creature_id];

        tbth.v -= current_distance;

        // if monster not lit, make it much more difficult to hit, subtract
        // off most bonuses, and reduce bth_with_bows depending on distance.
        if (!m_ptr.lit) {
          tbth.v = idiv(tbth.v, current_distance + 2);
          tbth.v -= idiv(py.misc.level * class_level_adj[py.misc.class_id][PlayerClassLevelAdj.BTHB], 2);
          tbth.v -= tpth.v * (BTH_PER_PLUS_TO_HIT_ADJUST - 1);
        }

        if (await playerTestBeingHit(tbth.v, py.misc.level, tpth.v, creatures_list[m_ptr.creature_id].ac, PlayerClassLevelAdj.BTHB)) {
          let damage = m_ptr.creature_id;

          const description = ref('');
          let msg: string;
          itemDescription(description, thrown_item, false);

          // Does the player know what they're fighting?
          if (!m_ptr.lit) {
            msg = sprintf('You hear a cry as the %s finds a mark.', description.v);
            visible = false;
          } else {
            msg = sprintf('The %s hits the %s.', description.v, creatures_list[damage].name);
            visible = true;
          }
          await printMessage(msg);

          tdam.v = itemMagicAbilityDamage(thrown_item, tdam.v, damage);
          tdam.v = await playerWeaponCriticalBlow(thrown_item.weight, tpth.v, tdam.v, PlayerClassLevelAdj.BTHB);

          if (tdam.v < 0) {
            tdam.v = 0;
          }

          damage = await monsterTakeHit(tile.creature_id, tdam.v);

          if (damage >= 0) {
            if (!visible) {
              await printMessage('You have killed something!');
            } else {
              msg = sprintf('You have killed the %s.', creatures_list[damage].name);
              await printMessage(msg);
            }
            await displayCharacterExperience();
          }
        } else {
          await inventoryDropOrThrowItem(old_coord, thrown_item);
        }
      } else {
        // do not test tile.field_mark here

        if (coordInsidePanel(coord) && py.flags.blind < 1 && (tile.temporary_light || tile.permanent_light)) {
          panelPutTile(tile_char, coord);
          await putQIO(); // show object moving
        }
      }
    } else {
      flag = true;
      await inventoryDropOrThrowItem(old_coord, thrown_item);
    }

    old_coord.y = coord.y;
    old_coord.x = coord.x;
  }
}
