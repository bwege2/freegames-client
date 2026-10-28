// inventory.cpp: Inventory and inventory items
import { config } from './config.ts';
import {
  ITEM_GROUP_MIN, ITEM_SINGLE_STACK_MAX, ITEM_SINGLE_STACK_MIN, PLAYER_INVENTORY_SIZE, PlayerEquipment, SpecialNameIds, TV_ARROW,
  TV_BOLT, TV_BOOTS, TV_BOW, TV_CHEST, TV_CLOAK, TV_CLOSED_DOOR, TV_FLASK, TV_FOOD, TV_GLOVES, TV_HAFTED, TV_HARD_ARMOR, TV_HELM,
  TV_MISC, TV_NOTHING, TV_OPEN_DOOR, TV_POLEARM, TV_POTION1, TV_POTION2, TV_RING, TV_SCROLL1, TV_SCROLL2, TV_SHIELD, TV_SOFT_ARMOR,
  TV_SPIKE, TV_STAFF, TV_SWORD, TV_WAND,
} from './constants.ts';
import { game_objects } from './data_treasure.ts';
import { dungeonDeleteObject } from './dungeon.ts';
import { randomNumber } from './game.ts';
import { popt } from './game_objects.ts';
import { dg, game, py } from './globals.ts';
import { itemAppendToInscription, itemDescription, itemSetColorlessAsIdentified, objectPositionOffset, spellItemIdentified } from './identification.ts';
import { i16, idiv, ref, type Ref, sprintf, u16, u8 } from './libc.ts';
import { playerCarryingLoadLimit, playerRecalculateBonuses, playerTakeOff, playerTakesHit } from './player.ts';
import type { Inventory_t } from './structs.ts';
import { printMessage } from './ui_io.ts';

export function inventoryCollectAllItemFlags(): number {
  let flags = 0;

  for (let i = PlayerEquipment.Wield; i < PlayerEquipment.Light; i++) {
    flags = (flags | py.inventory[i].flags) >>> 0;
  }

  return flags;
}

// Destroy an item in the inventory -RAK-
export function inventoryDestroyItem(item_id: number): void {
  const item = py.inventory[item_id];

  if (item.items_count > 1 && item.sub_category_id <= ITEM_SINGLE_STACK_MAX) {
    item.items_count--;
    py.pack.weight -= item.weight;
  } else {
    py.pack.weight -= item.weight * item.items_count;

    for (let i = item_id; i < py.pack.unique_items - 1; i++) {
      py.inventory[i].assign(py.inventory[i + 1]);
    }

    inventoryItemCopyTo(config.dungeon.objects.OBJ_NOTHING, py.inventory[py.pack.unique_items - 1]);
    py.pack.unique_items--;
  }

  py.flags.status |= config.player.status.PY_STR_WGT;
}

// Copies the object in the second argument over the first argument.
// However, the second always gets a number of one except for ammo etc.
export function inventoryTakeOneItem(to_item: Inventory_t, from_item: Inventory_t): void {
  to_item.assign(from_item);

  if (to_item.items_count > 1 && inventoryItemSingleStackable(to_item)) {
    to_item.items_count = 1;
  }
}

// Drops an item from inventory to given location -RAK-
export async function inventoryDropItem(item_id: number, drop_all: boolean): Promise<void> {
  if (dg.floor[py.pos.y][py.pos.x].treasure_id !== 0) {
    dungeonDeleteObject(py.pos);
  }

  const treasure_id = await popt();

  const item = py.inventory[item_id];
  game.treasure.list[treasure_id].assign(item);

  dg.floor[py.pos.y][py.pos.x].treasure_id = u8(treasure_id);

  if (item_id >= PlayerEquipment.Wield) {
    await playerTakeOff(item_id, -1);
  } else {
    if (drop_all || item.items_count === 1) {
      py.pack.weight -= item.weight * item.items_count;
      py.pack.unique_items--;

      while (item_id < py.pack.unique_items) {
        py.inventory[item_id].assign(py.inventory[item_id + 1]);
        item_id++;
      }

      inventoryItemCopyTo(config.dungeon.objects.OBJ_NOTHING, py.inventory[py.pack.unique_items]);
    } else {
      game.treasure.list[treasure_id].items_count = 1;
      py.pack.weight -= item.weight;
      item.items_count--;
    }

    const prt1 = ref('');
    itemDescription(prt1, game.treasure.list[treasure_id], true);
    const prt2 = sprintf('Dropped %s', prt1.v);
    await printMessage(prt2);
  }

  py.flags.status |= config.player.status.PY_STR_WGT;
}

// Destroys a type of item on a given percent chance -RAK-
function inventoryDamageItem(item_type: (item: Inventory_t) => boolean, chance_percentage: number): number {
  let damage = 0;

  for (let i = 0; i < py.pack.unique_items; i++) {
    if (item_type(py.inventory[i]) && randomNumber(100) < chance_percentage) {
      inventoryDestroyItem(i);
      damage++;
    }
  }

  return damage;
}

export async function inventoryDiminishLightAttack(noticed: boolean): Promise<boolean> {
  const item = py.inventory[PlayerEquipment.Light];

  if (item.misc_use > 0) {
    item.misc_use -= 250 + randomNumber(250);

    if (item.misc_use < 1) {
      item.misc_use = 1;
    }

    if (py.flags.blind < 1) {
      await printMessage('Your light dims.');
    } else {
      noticed = false;
    }
  } else {
    noticed = false;
  }

  return noticed;
}

export async function inventoryDiminishChargesAttack(creature_level: number, monster_hp: Ref<number>, noticed: boolean): Promise<boolean> {
  creature_level = u8(creature_level);

  const item = py.inventory[randomNumber(py.pack.unique_items) - 1];

  const has_charges = item.category_id === TV_STAFF || item.category_id === TV_WAND;

  if (has_charges && item.misc_use > 0) {
    monster_hp.v = i16(monster_hp.v + creature_level * item.misc_use);
    item.misc_use = 0;
    if (!spellItemIdentified(item)) {
      itemAppendToInscription(item, config.identification.ID_EMPTY);
    }
    await printMessage('Energy drains from your pack!');
  } else {
    noticed = false;
  }

  return noticed;
}

export function executeDisenchantAttack(): boolean {
  let item_id: number;

  switch (randomNumber(7)) {
    case 1:
      item_id = PlayerEquipment.Wield;
      break;
    case 2:
      item_id = PlayerEquipment.Body;
      break;
    case 3:
      item_id = PlayerEquipment.Arm;
      break;
    case 4:
      item_id = PlayerEquipment.Outer;
      break;
    case 5:
      item_id = PlayerEquipment.Hands;
      break;
    case 6:
      item_id = PlayerEquipment.Head;
      break;
    case 7:
      item_id = PlayerEquipment.Feet;
      break;
    default:
      return false;
  }

  let success = false;
  const item = py.inventory[item_id];

  if (item.to_hit > 0) {
    item.to_hit -= randomNumber(2);

    // don't send it below zero
    if (item.to_hit < 0) {
      item.to_hit = 0;
    }
    success = true;
  }
  if (item.to_damage > 0) {
    item.to_damage -= randomNumber(2);

    // don't send it below zero
    if (item.to_damage < 0) {
      item.to_damage = 0;
    }
    success = true;
  }
  if (item.to_ac > 0) {
    item.to_ac -= randomNumber(2);

    // don't send it below zero
    if (item.to_ac < 0) {
      item.to_ac = 0;
    }
    success = true;
  }

  return success;
}

// this code must be identical to the inventoryCarryItem() code below
export function inventoryCanCarryItemCount(item: Inventory_t): boolean {
  if (py.pack.unique_items < PlayerEquipment.Wield) {
    return true;
  }

  if (!inventoryItemStackable(item)) {
    return false;
  }

  for (let i = 0; i < py.pack.unique_items; i++) {
    const same_character = py.inventory[i].category_id === item.category_id;
    const same_category = py.inventory[i].sub_category_id === item.sub_category_id;

    // make sure the number field doesn't overflow
    // NOTE: convert to bigger types before addition -MRC-
    const same_number = u16(py.inventory[i].items_count) + u16(item.items_count) < 256;

    // they always stack (sub_category_id < 192), or else they have same `misc_use`
    const same_group = item.sub_category_id < ITEM_GROUP_MIN || py.inventory[i].misc_use === item.misc_use;

    // only stack if both or neither are identified
    // TODO(cook): is it correct that they should be equal to each other, regardless of true/false value?
    const inventory_item_is_colorless = itemSetColorlessAsIdentified(py.inventory[i].category_id, py.inventory[i].sub_category_id, py.inventory[i].identification);
    const item_is_colorless = itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification);
    const identification = inventory_item_is_colorless === item_is_colorless;

    if (same_character && same_category && same_number && same_group && identification) {
      return true;
    }
  }

  return false;
}

// return false if picking up an object would change the players speed
export function inventoryCanCarryItem(item: Inventory_t): boolean {
  let limit = playerCarryingLoadLimit();
  const new_weight = item.items_count * item.weight + py.pack.weight;

  if (limit < new_weight) {
    limit = idiv(new_weight, limit + 1);
  } else {
    limit = 0;
  }

  return py.pack.heaviness === limit;
}

// Add an item to players inventory.  Return the
// item position for a description if needed. -RAK-
// this code must be identical to the inventoryCanCarryItemCount() code above
export function inventoryCarryItem(new_item: Inventory_t): number {
  const is_known = itemSetColorlessAsIdentified(new_item.category_id, new_item.sub_category_id, new_item.identification);
  const is_always_known = objectPositionOffset(new_item.category_id, new_item.sub_category_id) === -1;

  let slot_id: number;

  // Now, check to see if player can carry object
  for (slot_id = 0; slot_id < PLAYER_INVENTORY_SIZE; slot_id++) {
    const item = py.inventory[slot_id];

    const is_same_category = new_item.category_id === item.category_id;
    const is_same_sub_category = new_item.sub_category_id === item.sub_category_id;
    const not_too_many_items = new_item.items_count + item.items_count < 256;

    // only stack if both or neither are identified
    const same_known_status = itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification) === is_known;

    const is_stackable = inventoryItemStackable(new_item);
    const is_same_group = new_item.sub_category_id < ITEM_GROUP_MIN || item.misc_use === new_item.misc_use;

    if (is_same_category && is_same_sub_category && is_stackable && not_too_many_items && is_same_group && same_known_status) {
      item.items_count += new_item.items_count;
      break;
    }

    if ((is_same_category && new_item.sub_category_id < item.sub_category_id && is_always_known) || new_item.category_id > item.category_id) {
      // For items which are always `is_known`, i.e. never have a 'color',
      // insert them into the inventory in sorted order.
      for (let i = py.pack.unique_items - 1; i >= slot_id; i--) {
        py.inventory[i + 1].assign(py.inventory[i]);
      }
      py.inventory[slot_id].assign(new_item);
      py.pack.unique_items++;
      break;
    }
  }

  py.pack.weight += new_item.items_count * new_item.weight;
  py.flags.status |= config.player.status.PY_STR_WGT;

  return slot_id;
}

// Finds range of item in inventory list -RAK-
export function inventoryFindRange(item_id_start: number, item_id_end: number, j: Ref<number>, k: Ref<number>): boolean {
  j.v = -1;
  k.v = -1;

  let at_end_of_range = false;

  for (let i = 0; i < py.pack.unique_items; i++) {
    const item_id = py.inventory[i].category_id;

    if (!at_end_of_range) {
      if (item_id === item_id_start || item_id === item_id_end) {
        at_end_of_range = true;
        j.v = i;
      }
    } else {
      if (item_id !== item_id_start && item_id !== item_id_end) {
        k.v = i - 1;
        break;
      }
    }
  }

  if (at_end_of_range && k.v === -1) {
    k.v = py.pack.unique_items - 1;
  }

  return at_end_of_range;
}

export function inventoryItemCopyTo(from_item_id: number, to_item: Inventory_t): void {
  const from = game_objects[from_item_id];

  to_item.id = u16(from_item_id);
  to_item.special_name_id = SpecialNameIds.SN_NULL;
  to_item.inscription = '';
  to_item.flags = from.flags;
  to_item.category_id = from.category_id;
  to_item.sprite = from.sprite;
  to_item.misc_use = from.misc_use;
  to_item.cost = from.cost;
  to_item.sub_category_id = from.sub_category_id;
  to_item.items_count = from.items_count;
  to_item.weight = from.weight;
  to_item.to_hit = from.to_hit;
  to_item.to_damage = from.to_damage;
  to_item.ac = from.ac;
  to_item.to_ac = from.to_ac;
  to_item.damage.dice = from.damage.dice;
  to_item.damage.sides = from.damage.sides;
  to_item.depth_first_found = from.depth_first_found;
  to_item.identification = 0;
}

// Checks if an item is stackable, only as a singles object.
export function inventoryItemSingleStackable(item: Inventory_t): boolean {
  return item.sub_category_id >= ITEM_SINGLE_STACK_MIN && item.sub_category_id <= ITEM_SINGLE_STACK_MAX;
}

// Checks if an item is stackable; either singles objects or group items.
export function inventoryItemStackable(item: Inventory_t): boolean {
  return item.sub_category_id >= ITEM_SINGLE_STACK_MIN;
}

export function inventoryItemIsCursed(item: Inventory_t): boolean {
  return (item.flags & config.treasure.flags.TR_CURSED) !== 0;
}

export function inventoryItemRemoveCurse(item: Inventory_t): void {
  item.flags &= ~config.treasure.flags.TR_CURSED;
}

// AC gets worse -RAK-
// Note: This routine affects magical AC bonuses so
// that stores can detect the damage.
async function damageMinusAC(typ_dam: number): Promise<boolean> {
  let items_count = 0;
  const items = new Uint8Array(6);

  if (py.inventory[PlayerEquipment.Body].category_id !== TV_NOTHING) {
    items[items_count] = PlayerEquipment.Body;
    items_count++;
  }

  if (py.inventory[PlayerEquipment.Arm].category_id !== TV_NOTHING) {
    items[items_count] = PlayerEquipment.Arm;
    items_count++;
  }

  if (py.inventory[PlayerEquipment.Outer].category_id !== TV_NOTHING) {
    items[items_count] = PlayerEquipment.Outer;
    items_count++;
  }

  if (py.inventory[PlayerEquipment.Hands].category_id !== TV_NOTHING) {
    items[items_count] = PlayerEquipment.Hands;
    items_count++;
  }

  if (py.inventory[PlayerEquipment.Head].category_id !== TV_NOTHING) {
    items[items_count] = PlayerEquipment.Head;
    items_count++;
  }

  // also affect boots
  if (py.inventory[PlayerEquipment.Feet].category_id !== TV_NOTHING) {
    items[items_count] = PlayerEquipment.Feet;
    items_count++;
  }

  let minus = false;

  if (items_count === 0) {
    return minus;
  }

  const item_id = items[randomNumber(items_count) - 1];

  const description = ref('');
  let msg: string;

  if ((py.inventory[item_id].flags & typ_dam) !== 0) {
    minus = true;

    itemDescription(description, py.inventory[item_id], false);
    msg = sprintf('Your %s resists damage!', description.v);
    await printMessage(msg);
  } else if (py.inventory[item_id].ac + py.inventory[item_id].to_ac > 0) {
    minus = true;

    itemDescription(description, py.inventory[item_id], false);
    msg = sprintf('Your %s is damaged!', description.v);
    await printMessage(msg);

    py.inventory[item_id].to_ac--;
    playerRecalculateBonuses();
  }

  return minus;
}

// Functions to emulate the original Pascal sets
export function setNull(item: Inventory_t): boolean {
  void item; // silence warnings
  return false;
}

function setCorrodableItems(item: Inventory_t): boolean {
  switch (item.category_id) {
    case TV_SWORD:
    case TV_HELM:
    case TV_SHIELD:
    case TV_HARD_ARMOR:
    case TV_WAND:
      return true;
    default:
      return false;
  }
}

function setFlammableItems(item: Inventory_t): boolean {
  switch (item.category_id) {
    case TV_ARROW:
    case TV_BOW:
    case TV_HAFTED:
    case TV_POLEARM:
    case TV_BOOTS:
    case TV_GLOVES:
    case TV_CLOAK:
    case TV_SOFT_ARMOR:
      // Items of (RF) should not be destroyed.
      return (item.flags & config.treasure.flags.TR_RES_FIRE) === 0;
    case TV_STAFF:
    case TV_SCROLL1:
    case TV_SCROLL2:
      return true;
    default:
      return false;
  }
}

function setAcidAffectedItems(item: Inventory_t): boolean {
  switch (item.category_id) {
    case TV_MISC:
    case TV_CHEST:
      return true;
    case TV_BOLT:
    case TV_ARROW:
    case TV_BOW:
    case TV_HAFTED:
    case TV_POLEARM:
    case TV_BOOTS:
    case TV_GLOVES:
    case TV_CLOAK:
    case TV_SOFT_ARMOR:
      return (item.flags & config.treasure.flags.TR_RES_ACID) === 0;
    default:
      return false;
  }
}

export function setFrostDestroyableItems(item: Inventory_t): boolean {
  return item.category_id === TV_POTION1 || item.category_id === TV_POTION2 || item.category_id === TV_FLASK;
}

export function setLightningDestroyableItems(item: Inventory_t): boolean {
  return item.category_id === TV_RING || item.category_id === TV_WAND || item.category_id === TV_SPIKE;
}

export function setAcidDestroyableItems(item: Inventory_t): boolean {
  switch (item.category_id) {
    case TV_ARROW:
    case TV_BOW:
    case TV_HAFTED:
    case TV_POLEARM:
    case TV_BOOTS:
    case TV_GLOVES:
    case TV_CLOAK:
    case TV_HELM:
    case TV_SHIELD:
    case TV_HARD_ARMOR:
    case TV_SOFT_ARMOR:
      return (item.flags & config.treasure.flags.TR_RES_ACID) === 0;
    case TV_STAFF:
    case TV_SCROLL1:
    case TV_SCROLL2:
    case TV_FOOD:
    case TV_OPEN_DOOR:
    case TV_CLOSED_DOOR:
      return true;
    default:
      return false;
  }
}

export function setFireDestroyableItems(item: Inventory_t): boolean {
  switch (item.category_id) {
    case TV_ARROW:
    case TV_BOW:
    case TV_HAFTED:
    case TV_POLEARM:
    case TV_BOOTS:
    case TV_GLOVES:
    case TV_CLOAK:
    case TV_SOFT_ARMOR:
      return (item.flags & config.treasure.flags.TR_RES_FIRE) === 0;
    case TV_STAFF:
    case TV_SCROLL1:
    case TV_SCROLL2:
    case TV_POTION1:
    case TV_POTION2:
    case TV_FLASK:
    case TV_FOOD:
    case TV_OPEN_DOOR:
    case TV_CLOSED_DOOR:
      return true;
    default:
      return false;
  }
}

// Corrode the unsuspecting person's armor -RAK-
export async function damageCorrodingGas(creature_name: string): Promise<void> {
  if (!(await damageMinusAC(config.treasure.flags.TR_RES_ACID))) {
    playerTakesHit(randomNumber(8), creature_name);
  }

  if (inventoryDamageItem(setCorrodableItems, 5) > 0) {
    await printMessage('There is an acrid smell coming from your pack.');
  }
}

// Poison gas the idiot. -RAK-
export function damagePoisonedGas(damage: number, creature_name: string): void {
  playerTakesHit(damage, creature_name);

  py.flags.poisoned += 12 + randomNumber(damage);
}

// Burn the fool up. -RAK-
export async function damageFire(damage: number, creature_name: string): Promise<void> {
  if (py.flags.resistant_to_fire) {
    damage = idiv(damage, 3);
  }

  if (py.flags.heat_resistance > 0) {
    damage = idiv(damage, 3);
  }

  playerTakesHit(damage, creature_name);

  if (inventoryDamageItem(setFlammableItems, 3) > 0) {
    await printMessage('There is smoke coming from your pack!');
  }
}

// Freeze them to death. -RAK-
export async function damageCold(damage: number, creature_name: string): Promise<void> {
  if (py.flags.resistant_to_cold) {
    damage = idiv(damage, 3);
  }

  if (py.flags.cold_resistance > 0) {
    damage = idiv(damage, 3);
  }

  playerTakesHit(damage, creature_name);

  if (inventoryDamageItem(setFrostDestroyableItems, 5) > 0) {
    await printMessage('Something shatters inside your pack!');
  }
}

// Lightning bolt the sucker away. -RAK-
export async function damageLightningBolt(damage: number, creature_name: string): Promise<void> {
  if (py.flags.resistant_to_light) {
    damage = idiv(damage, 3);
  }

  playerTakesHit(damage, creature_name);

  if (inventoryDamageItem(setLightningDestroyableItems, 3) > 0) {
    await printMessage('There are sparks coming from your pack!');
  }
}

// Throw acid on the hapless victim -RAK-
export async function damageAcid(damage: number, creature_name: string): Promise<void> {
  let flag = 0;

  if (await damageMinusAC(config.treasure.flags.TR_RES_ACID)) {
    flag = 1;
  }

  if (py.flags.resistant_to_acid) {
    flag += 2;
  }

  playerTakesHit(idiv(damage, flag + 1), creature_name);

  if (inventoryDamageItem(setAcidAffectedItems, 3) > 0) {
    await printMessage('There is an acrid smell coming from your pack!');
  }
}
