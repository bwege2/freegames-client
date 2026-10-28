// store_inventory.cpp: Store: updating store inventory, pricing objects
import { config } from './config.ts';
import {
  ITEM_GROUP_MIN, ITEM_SINGLE_STACK_MIN, MAX_MUSHROOMS, MAX_STORES, STORE_MAX_DISCRETE_ITEMS, STORE_MAX_ITEM_TYPES,
  TV_AMULET, TV_BOOTS, TV_BOW, TV_DIGGING, TV_FOOD, TV_POTION1, TV_POTION2, TV_RING, TV_SCROLL1, TV_SCROLL2, TV_SLING_AMMO,
  TV_SOFT_ARMOR, TV_SPIKE, TV_STAFF, TV_SWORD, TV_WAND,
} from './constants.ts';
import { store_owners } from './data_store_owners.ts';
import { race_gold_adjustments, store_choices } from './data_stores.ts';
import { game_objects } from './data_treasure.ts';
import { randomNumber } from './game.ts';
import { popt, pusht } from './game_objects.ts';
import { game, py, stores } from './globals.ts';
import { itemIdentifyAsStoreBought, itemSetColorlessAsIdentified, spellItemIdentified } from './identification.ts';
import { inventoryItemCopyTo, inventoryItemSingleStackable, inventoryItemStackable } from './inventory.ts';
import { idiv, ref, type Ref, u8 } from './libc.ts';
import type { Inventory_t, Store_t } from './structs.ts';
import { magicTreasureMagicalAbility } from './treasure.ts';

// Store_t stores[MAX_STORES] is in globals.ts

// Initialize and up-keep the store's inventory. -RAK-
export async function storeMaintenance(): Promise<void> {
  for (let store_id = 0; store_id < MAX_STORES; store_id++) {
    const store = stores[store_id];

    store.insults_counter = 0;
    if (store.unique_items_counter >= config.stores.STORE_MIN_AUTO_SELL_ITEMS) {
      let turnaround = randomNumber(config.stores.STORE_STOCK_TURN_AROUND);
      if (store.unique_items_counter >= config.stores.STORE_MAX_AUTO_BUY_ITEMS) {
        turnaround += 1 + store.unique_items_counter - config.stores.STORE_MAX_AUTO_BUY_ITEMS;
      }
      turnaround--;
      while (turnaround >= 0) {
        storeDestroyItem(store_id, randomNumber(store.unique_items_counter) - 1, false);
        turnaround--;
      }
    }

    if (store.unique_items_counter <= config.stores.STORE_MAX_AUTO_BUY_ITEMS) {
      let turnaround = randomNumber(config.stores.STORE_STOCK_TURN_AROUND);
      if (store.unique_items_counter < config.stores.STORE_MIN_AUTO_SELL_ITEMS) {
        turnaround += config.stores.STORE_MIN_AUTO_SELL_ITEMS - store.unique_items_counter;
      }

      const max_cost = store_owners[store.owner_id].max_cost;

      turnaround--;
      while (turnaround >= 0) {
        await storeItemCreate(store_id, max_cost);
        turnaround--;
      }
    }
  }
}

// Returns the value for any given object -RAK-
export function storeItemValue(item: Inventory_t): number {
  let value: number;

  if ((item.identification & config.identification.ID_DAMD) !== 0) {
    // don't purchase known cursed items
    value = 0;
  } else if ((item.category_id >= TV_BOW && item.category_id <= TV_SWORD) || (item.category_id >= TV_BOOTS && item.category_id <= TV_SOFT_ARMOR)) {
    value = getWeaponArmorBuyPrice(item);
  } else if (item.category_id >= TV_SLING_AMMO && item.category_id <= TV_SPIKE) {
    value = getAmmoBuyPrice(item);
  } else if (item.category_id === TV_SCROLL1 || item.category_id === TV_SCROLL2 || item.category_id === TV_POTION1 || item.category_id === TV_POTION2) {
    value = getPotionScrollBuyPrice(item);
  } else if (item.category_id === TV_FOOD) {
    value = getFoodBuyPrice(item);
  } else if (item.category_id === TV_AMULET || item.category_id === TV_RING) {
    value = getRingAmuletBuyPrice(item);
  } else if (item.category_id === TV_STAFF || item.category_id === TV_WAND) {
    value = getWandStaffBuyPrice(item);
  } else if (item.category_id === TV_DIGGING) {
    value = getPickShovelBuyPrice(item);
  } else {
    value = item.cost;
  }

  // Multiply value by number of items if it is a group stack item.
  // Do not include torches here.
  if (item.sub_category_id > ITEM_GROUP_MIN) {
    value = value * item.items_count;
  }

  return value;
}

function getWeaponArmorBuyPrice(item: Inventory_t): number {
  if (!spellItemIdentified(item)) {
    return game_objects[item.id].cost;
  }

  if (item.category_id >= TV_BOW && item.category_id <= TV_SWORD) {
    if (item.to_hit < 0 || item.to_damage < 0 || item.to_ac < 0) {
      return 0;
    }

    return item.cost + (item.to_hit + item.to_damage + item.to_ac) * 100;
  }

  if (item.to_ac < 0) {
    return 0;
  }

  return item.cost + item.to_ac * 100;
}

function getAmmoBuyPrice(item: Inventory_t): number {
  if (!spellItemIdentified(item)) {
    return game_objects[item.id].cost;
  }

  if (item.to_hit < 0 || item.to_damage < 0 || item.to_ac < 0) {
    return 0;
  }

  // use 5, because missiles generally appear in groups of 20,
  // so 20 * 5 == 100, which is comparable to weapon bonus above
  return item.cost + (item.to_hit + item.to_damage + item.to_ac) * 5;
}

function getPotionScrollBuyPrice(item: Inventory_t): number {
  if (!itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
    return 20;
  }

  return item.cost;
}

function getFoodBuyPrice(item: Inventory_t): number {
  if (item.sub_category_id < ITEM_SINGLE_STACK_MIN + MAX_MUSHROOMS && !itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
    return 1;
  }

  return item.cost;
}

function getRingAmuletBuyPrice(item: Inventory_t): number {
  // player does not know what type of ring/amulet this is
  if (!itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
    return 45;
  }

  // player knows what type of ring, but does not know whether it
  // is cursed or not, if refuse to buy cursed objects here, then
  // player can use this to 'identify' cursed objects
  if (!spellItemIdentified(item)) {
    return game_objects[item.id].cost;
  }

  return item.cost;
}

function getWandStaffBuyPrice(item: Inventory_t): number {
  if (!itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
    if (item.category_id === TV_WAND) {
      return 50;
    }

    return 70;
  }

  if (spellItemIdentified(item)) {
    return item.cost + idiv(item.cost, 20) * item.misc_use;
  }

  return item.cost;
}

function getPickShovelBuyPrice(item: Inventory_t): number {
  if (!spellItemIdentified(item)) {
    return game_objects[item.id].cost;
  }

  if (item.misc_use < 0) {
    return 0;
  }

  // some digging tools start with non-zero `misc_use` values, so only
  // multiply the plusses by 100, make sure result is positive
  let value = item.cost + (item.misc_use - game_objects[item.id].misc_use) * 100;

  if (value < 0) {
    value = 0;
  }

  return value;
}

// Asking price for an item -RAK-
export function storeItemSellPrice(store: Store_t, min_price: Ref<number>, max_price: Ref<number>, item: Inventory_t): number {
  let price = storeItemValue(item);

  // check `item.cost` in case it is cursed, check `price` in case it is damaged
  // don't let the item get into the store inventory
  if (item.cost < 1 || price < 1) {
    return 0;
  }

  const owner = store_owners[store.owner_id];

  price = idiv(price * race_gold_adjustments[owner.race][py.misc.race_id], 100);
  if (price < 1) {
    price = 1;
  }

  max_price.v = idiv(price * owner.max_inflate, 100);
  min_price.v = idiv(price * owner.min_inflate, 100);

  if (min_price.v > max_price.v) {
    min_price.v = max_price.v;
  }

  return price;
}

// Check to see if they will be carrying too many objects -RAK-
export function storeCheckPlayerItemsCount(store: Store_t, item: Inventory_t): boolean {
  if (store.unique_items_counter < STORE_MAX_DISCRETE_ITEMS) {
    return true;
  }

  if (!inventoryItemStackable(item)) {
    return false;
  }

  let store_check = false;

  for (let i = 0; i < store.unique_items_counter; i++) {
    const store_item = store.inventory[i].item;

    // note: items with sub_category_id of gte ITEM_SINGLE_STACK_MAX only stack
    // if their `sub_category_id`s match
    if (store_item.category_id === item.category_id && store_item.sub_category_id === item.sub_category_id && store_item.items_count + item.items_count < 256 &&
      (item.sub_category_id < ITEM_GROUP_MIN || store_item.misc_use === item.misc_use)) {
      store_check = true;
    }
  }

  return store_check;
}

// Insert INVEN_MAX at given location
function storeItemInsert(store_id: number, pos: number, i_cost: number, item: Inventory_t): void {
  const store = stores[store_id];

  for (let i = store.unique_items_counter - 1; i >= pos; i--) {
    store.inventory[i + 1].assign(store.inventory[i]);
  }

  store.inventory[pos].item.assign(item);
  store.inventory[pos].cost = -i_cost;
  store.unique_items_counter++;
}

// Add the item in INVEN_MAX to stores inventory. -RAK-
export function storeCarryItem(store_id: number, index_id: Ref<number>, item: Inventory_t): void {
  index_id.v = -1;

  const store = stores[store_id];

  const item_cost = ref(0);
  const dummy = ref(0);
  if (storeItemSellPrice(store, dummy, item_cost, item) < 1) {
    return;
  }

  let item_id = 0;
  const item_num = item.items_count;
  const item_category = item.category_id;
  const item_sub_catagory = item.sub_category_id;

  let flag = false;
  do {
    const store_item = store.inventory[item_id].item;

    if (item_category === store_item.category_id) {
      if (item_sub_catagory === store_item.sub_category_id && // Adds to other item
        item_sub_catagory >= ITEM_SINGLE_STACK_MIN && (item_sub_catagory < ITEM_GROUP_MIN || store_item.misc_use === item.misc_use)) {
        index_id.v = item_id;
        store_item.items_count += item_num;

        // must set new cost for group items, do this only for items
        // strictly greater than group_min, not for torches, this
        // must be recalculated for entire group
        if (item_sub_catagory > ITEM_GROUP_MIN) {
          storeItemSellPrice(store, dummy, item_cost, store_item);
          store.inventory[item_id].cost = -item_cost.v;
        } else if (store_item.items_count > 24) {
          // must let group objects (except torches) stack over 24
          // since there may be more than 24 in the group
          store_item.items_count = 24;
        }
        flag = true;
      }
    } else if (item_category > store_item.category_id) { // Insert into list
      storeItemInsert(store_id, item_id, item_cost.v, item);
      flag = true;
      index_id.v = item_id;
    }
    item_id++;
  } while (item_id < store.unique_items_counter && !flag);

  // Becomes last item in list
  if (!flag) {
    storeItemInsert(store_id, store.unique_items_counter, item_cost.v, item);
    index_id.v = store.unique_items_counter - 1;
  }
}

// Destroy an item in the stores inventory.  Note that if
// `only_one_of` is false, an entire slot is destroyed -RAK-
export function storeDestroyItem(store_id: number, item_id: number, only_one_of: boolean): void {
  const store = stores[store_id];
  const store_item = store.inventory[item_id].item;

  let number: number;

  // for single stackable objects, only destroy one half on average,
  // this will help ensure that general store and alchemist have
  // reasonable selection of objects
  if (inventoryItemSingleStackable(store_item)) {
    if (only_one_of) {
      number = 1;
    } else {
      number = u8(randomNumber(store_item.items_count));
    }
  } else {
    number = store_item.items_count;
  }

  if (number !== store_item.items_count) {
    store_item.items_count -= number;
  } else {
    for (let i = item_id; i < store.unique_items_counter - 1; i++) {
      store.inventory[i].assign(store.inventory[i + 1]);
    }
    inventoryItemCopyTo(config.dungeon.objects.OBJ_NOTHING, store.inventory[store.unique_items_counter - 1].item);
    store.inventory[store.unique_items_counter - 1].cost = 0;
    store.unique_items_counter--;
  }
}

// Creates an item and inserts it into store's inven -RAK-
async function storeItemCreate(store_id: number, max_cost: number): Promise<void> {
  const free_id = await popt();

  for (let tries = 0; tries <= 3; tries++) {
    const id = store_choices[store_id][randomNumber(STORE_MAX_ITEM_TYPES) - 1];
    inventoryItemCopyTo(id, game.treasure.list[free_id]);
    magicTreasureMagicalAbility(free_id, config.treasure.LEVEL_TOWN_OBJECTS);

    const item = game.treasure.list[free_id];

    if (storeCheckPlayerItemsCount(stores[store_id], item)) {
      // Item must be good: cost > 0.
      if (item.cost > 0 && item.cost < max_cost) {
        // equivalent to calling spellIdentifyItem(),
        // except will not change the objects_identified array.
        itemIdentifyAsStoreBought(item);

        const dummy = ref(0);
        storeCarryItem(store_id, dummy, item);

        tries = 10;
      }
    }
  }

  pusht(u8(free_id));
}
