// store.cpp: Store: entering, command interpreter, buying, selling
import { config } from './config.ts';
import {
  MAX_OWNERS, MAX_STORES, PlayerAttr, PlayerEquipment, SHRT_MAX, TV_AMULET, TV_ARROW, TV_BOLT, TV_BOOTS, TV_BOW, TV_CLOAK,
  TV_DIGGING, TV_FLASK, TV_FOOD, TV_GLOVES, TV_HAFTED, TV_HARD_ARMOR, TV_HELM, TV_LIGHT, TV_MAGIC_BOOK, TV_POLEARM, TV_POTION1,
  TV_POTION2, TV_PRAYER_BOOK, TV_RING, TV_SCROLL1, TV_SCROLL2, TV_SHIELD, TV_SLING_AMMO, TV_SOFT_ARMOR, TV_SPIKE, TV_STAFF,
  TV_SWORD, TV_WAND,
} from './constants.ts';
import {
  type Owner_t, speech_buying_haggle, speech_buying_haggle_final, speech_get_out_of_my_store, speech_haggling_try_again,
  speech_insulted_haggling_done, speech_sale_accepted, speech_selling_haggle, speech_selling_haggle_final, speech_sorry,
  store_owners,
} from './data_store_owners.ts';
import { race_gold_adjustments } from './data_stores.ts';
import { randomNumber } from './game.ts';
import { dg, game, globals, py, stores } from './globals.ts';
import { insertNumberIntoString, stringToNumber } from './helpers.ts';
import { itemDescription, itemIdentify, spellItemIdentifyAndRemoveRandomInscription } from './identification.ts';
import { inventoryCanCarryItemCount, inventoryCarryItem, inventoryDestroyItem, inventoryItemCopyTo, inventoryItemSingleStackable, inventoryTakeOneItem } from './inventory.ts';
import { chr, i16, i8, idiv, ord, ref, type Ref, sprintf } from './libc.ts';
import { playerStrength } from './player.ts';
import { playerStatAdjustmentCharisma } from './player_stats.ts';
import { onReset } from './reset.ts';
import { storeCarryItem, storeCheckPlayerItemsCount, storeDestroyItem, storeItemSellPrice, storeItemValue } from './store_inventory.ts';
import { Inventory_t, type Store_t } from './structs.ts';
import { drawCavePanel } from './ui.ts';
import { inventoryExecuteCommand, inventoryGetInputForItemId } from './ui_inventory.ts';
import {
  clearScreen, eraseLine, getCommand, getMenuItemId, getStringInput, messageLineClear, moveCursor, printMessage, putString,
  putStringClearToEOL, terminalBellSound,
} from './ui_io.ts';

// Save the store's last increment value. (int16_t)
let store_last_increment = 0;

onReset(() => {
  store_last_increment = 0;
});

// Initializes the stores with owners -RAK-
export function storeInitializeOwners(): void {
  const count = idiv(MAX_OWNERS, MAX_STORES);

  for (let store_id = 0; store_id < MAX_STORES; store_id++) {
    const store = stores[store_id];

    store.owner_id = MAX_STORES * (randomNumber(count) - 1) + store_id;
    store.insults_counter = 0;
    store.turns_left_before_closing = 0;
    store.unique_items_counter = 0;
    store.good_purchases = 0;
    store.bad_purchases = 0;

    for (const item of store.inventory) {
      inventoryItemCopyTo(config.dungeon.objects.OBJ_NOTHING, item.item);
      item.cost = 0;
    }
  }
}

// Comments vary. -RAK-
// Comment one : Finished haggling
async function printSpeechFinishedHaggling(): Promise<void> {
  await printMessage(speech_sale_accepted[randomNumber(14) - 1]);
}

// %A1 is offer, %A2 is asking.
async function printSpeechSellingHaggle(offer: number, asking: number, final: number): Promise<void> {
  const comment = ref('');

  if (final > 0) {
    comment.v = speech_selling_haggle_final[randomNumber(3) - 1];
  } else {
    comment.v = speech_selling_haggle[randomNumber(16) - 1];
  }

  insertNumberIntoString(comment, '%A1', offer, false);
  insertNumberIntoString(comment, '%A2', asking, false);
  await printMessage(comment.v);
}

async function printSpeechBuyingHaggle(offer: number, asking: number, final: number): Promise<void> {
  const comment = ref('');

  if (final > 0) {
    comment.v = speech_buying_haggle_final[randomNumber(3) - 1];
  } else {
    comment.v = speech_buying_haggle[randomNumber(15) - 1];
  }

  insertNumberIntoString(comment, '%A1', offer, false);
  insertNumberIntoString(comment, '%A2', asking, false);
  await printMessage(comment.v);
}

// Kick 'da bum out. -RAK-
async function printSpeechGetOutOfMyStore(): Promise<void> {
  const comment = randomNumber(5) - 1;
  await printMessage(speech_insulted_haggling_done[comment]);
  await printMessage(speech_get_out_of_my_store[comment]);
}

async function printSpeechTryAgain(): Promise<void> {
  await printMessage(speech_haggling_try_again[randomNumber(10) - 1]);
}

async function printSpeechSorry(): Promise<void> {
  await printMessage(speech_sorry[randomNumber(5) - 1]);
}

// Displays the set of commands -RAK-
async function displayStoreCommands(): Promise<void> {
  await putStringClearToEOL('You may:', { y: 20, x: 0 });
  await putStringClearToEOL(" p) Purchase an item.           b) Browse store's inventory.", { y: 21, x: 0 });
  await putStringClearToEOL(' s) Sell an item.               i/e/t/w/x) Inventory/Equipment Lists.', { y: 22, x: 0 });
  await putStringClearToEOL('ESC) Exit from Building.        ^R) Redraw the screen.', { y: 23, x: 0 });
}

// Displays the set of commands -RAK-
async function displayStoreHaggleCommands(haggle_type: number): Promise<void> {
  if (haggle_type === -1) {
    await putStringClearToEOL('Specify an asking-price in gold pieces.', { y: 21, x: 0 });
  } else {
    await putStringClearToEOL('Specify an offer in gold pieces.', { y: 21, x: 0 });
  }

  await putStringClearToEOL('ESC) Quit Haggling.', { y: 22, x: 0 });
  await eraseLine({ y: 23, x: 0 }); // clear last line
}

// Displays a store's inventory -RAK-
async function displayStoreInventory(store: Store_t, item_pos_start: number): Promise<void> {
  let item_pos_end = (idiv(item_pos_start, 12) + 1) * 12;
  if (item_pos_end > store.unique_items_counter) {
    item_pos_end = store.unique_items_counter;
  }

  let item_line_num: number;

  for (item_line_num = (item_pos_start % 12); item_pos_start < item_pos_end; item_line_num++) {
    const item = store.inventory[item_pos_start].item;

    // Save the current number of items
    let current_item_count = item.items_count;

    if (inventoryItemSingleStackable(item)) {
      item.items_count = 1;
    }

    const description = ref('');
    itemDescription(description, item, true);

    // Restore the number of items
    item.items_count = current_item_count;

    let msg = sprintf('%c) %s', chr(97 + item_line_num), description.v); // 'a' + item_line_num
    await putStringClearToEOL(msg, { y: item_line_num + 5, x: 0 });

    current_item_count = store.inventory[item_pos_start].cost;

    if (current_item_count <= 0) {
      let value = -current_item_count;
      value = idiv(value * playerStatAdjustmentCharisma(), 100);
      if (value <= 0) {
        value = 1;
      }
      msg = sprintf('%9d', value);
    } else {
      msg = sprintf('%9d [Fixed]', current_item_count);
    }

    await putStringClearToEOL(msg, { y: item_line_num + 5, x: 59 });
    item_pos_start++;
  }

  if (item_line_num < 12) {
    for (let i = 0; i < (11 - item_line_num + 1); i++) {
      // clear remaining lines
      await eraseLine({ y: i + item_line_num + 5, x: 0 });
    }
  }

  if (store.unique_items_counter > 12) {
    putString('- cont. -', { y: 17, x: 60 });
  } else {
    await eraseLine({ y: 17, x: 60 });
  }
}

// Re-displays only a single cost -RAK-
async function displaySingleCost(store_id: number, item_id: number): Promise<void> {
  const cost = stores[store_id].inventory[item_id].cost;

  let msg: string;
  if (cost < 0) {
    let c = -cost;
    c = idiv(c * playerStatAdjustmentCharisma(), 100);
    msg = sprintf('%d', c);
  } else {
    msg = sprintf('%9d [Fixed]', cost);
  }
  await putStringClearToEOL(msg, { y: (item_id % 12) + 5, x: 59 });
}

// Displays players gold -RAK-
async function displayPlayerRemainingGold(): Promise<void> {
  const msg = sprintf('Gold Remaining : %d', py.misc.au);
  await putStringClearToEOL(msg, { y: 18, x: 17 });
}

// Displays store -RAK-
async function displayStore(store: Store_t, owner_name: string, current_top_item_id: number): Promise<void> {
  await clearScreen();
  putString(owner_name, { y: 3, x: 9 });
  putString('Item', { y: 4, x: 3 });
  putString('Asking Price', { y: 4, x: 60 });
  await displayPlayerRemainingGold();
  await displayStoreCommands();
  await displayStoreInventory(store, current_top_item_id);
}

// Get the ID of a store item and return it's value -RAK-
// Returns true if the item was found.
async function storeGetItemId(item_id: Ref<number>, prompt: string, item_pos_start: number, item_pos_end: number): Promise<boolean> {
  item_id.v = -1;
  let item_found = false;

  const msg = sprintf('(Items %c-%c, ESC to exit) %s', chr(item_pos_start + 97), chr(item_pos_end + 97), prompt); // + 'a'

  const key = ref('');
  while (await getMenuItemId(msg, key)) {
    // a (signed) char: key_char -= 'a'
    const key_char = i8(ord(key.v) - 97);
    if (key_char >= item_pos_start && key_char <= item_pos_end) {
      item_found = true;
      item_id.v = key_char;
      break;
    }
    await terminalBellSound();
  }
  messageLineClear();

  return item_found;
}

// Increase the insult counter and get angry if too many -RAK-
async function storeIncreaseInsults(store_id: number): Promise<boolean> {
  const store = stores[store_id];

  store.insults_counter++;

  if (store.insults_counter <= store_owners[store.owner_id].max_insults) {
    return false;
  }

  // customer angered the store owner with too many insults!
  await printSpeechGetOutOfMyStore();
  store.insults_counter = 0;
  store.bad_purchases++;
  store.turns_left_before_closing = dg.game_turn + 2500 + randomNumber(2500);

  return true;
}

// Decrease insults -RAK-
function storeDecreaseInsults(store_id: number): void {
  if (stores[store_id].insults_counter !== 0) {
    stores[store_id].insults_counter--;
  }
}

// Have insulted while haggling -RAK-
// Returns true if the store owner was angered.
async function storeHaggleInsults(store_id: number): Promise<boolean> {
  if (await storeIncreaseInsults(store_id)) {
    return true;
  }

  await printSpeechTryAgain();

  // keep insult separate from rest of haggle
  await printMessage(null);

  return false;
}

// Returns true if the customer made a valid offer
async function storeGetHaggle(prompt: string, new_offer: Ref<number>, offer_count: number): Promise<boolean> {
  let valid_offer = true;

  if (offer_count === 0) {
    store_last_increment = 0;
  }

  let increment = false;
  const adjustment = ref(0);

  let prompt_len = prompt.length;
  const start_len = prompt_len;

  let p: number;
  const msg = ref('');
  let last_offer_str: string;

  // Get a customers new offer
  while (valid_offer && adjustment.v === 0) {
    await putStringClearToEOL(prompt, { y: 0, x: 0 });

    if ((offer_count !== 0) && store_last_increment !== 0) {
      const abs_store_last_increment = Math.abs(store_last_increment);

      last_offer_str = sprintf('[%c%d] ', (store_last_increment < 0) ? '-' : '+', abs_store_last_increment);
      await putStringClearToEOL(last_offer_str, { y: 0, x: start_len });

      prompt_len = start_len + last_offer_str.length;
    }

    if (!(await getStringInput(msg, { y: 0, x: prompt_len }, 40))) {
      // customer aborted, i.e. pressed escape
      valid_offer = false;
    }

    for (p = 0; msg.v[p] === ' '; p++) {
      // fast forward to next space character
    }
    if (msg.v[p] === '+' || msg.v[p] === '-') {
      increment = true;
    }

    if ((offer_count !== 0) && increment) {
      stringToNumber(msg.v, adjustment);

      // Don't accept a zero here.  Turn off increment if it was zero
      // because a zero will not exit.  This can be zero if the user
      // did not type a number after the +/- sign.
      if (adjustment.v === 0) {
        increment = false;
      } else {
        store_last_increment = i16(adjustment.v);
      }
    } else if ((offer_count !== 0) && msg.v.length === 0) {
      adjustment.v = store_last_increment;
      increment = true;
    } else {
      stringToNumber(msg.v, adjustment);
    }

    // don't allow incremental haggling, if player has not made an offer yet
    if (valid_offer && offer_count === 0 && increment) {
      await printMessage("You haven't even made your first offer yet!");
      adjustment.v = 0;
      increment = false;
    }
  }

  if (valid_offer) {
    if (increment) {
      new_offer.v += adjustment.v;
    } else {
      new_offer.v = adjustment.v;
    }
  } else {
    messageLineClear();
  }

  return valid_offer;
}

// The status of the customer bid.
// Note: a received bid may still result in a rejected offer.
const BidState = {
  Received: 0, // the big was received successfully
  Rejected: 1, // the bid was rejected, or cancelled by the customer
  Offended: 2, // customer tried to sell an undesirable item
  Insulted: 3, // the store owner was insulted too many times by the bid
} as const;

async function storeReceiveOffer(store_id: number, prompt: string, new_offer: Ref<number>, last_offer: number, offer_count: number, factor: number): Promise<number> {
  let status: number = BidState.Received;

  let done = false;
  while (!done) {
    if (await storeGetHaggle(prompt, new_offer, offer_count)) {
      // customer submitted valid offer
      if (new_offer.v * factor >= last_offer * factor) {
        done = true;
      } else if (await storeHaggleInsults(store_id)) {
        // customer angered the store owner!
        status = BidState.Insulted;
        done = true;
      } else {
        // new_offer rejected, reset new_offer so that incremental
        // haggling works correctly
        new_offer.v = last_offer;
      }
    } else {
      // customer aborted offer
      status = BidState.Rejected;
      done = true;
    }
  }

  return status;
}

function storePurchaseCustomerAdjustment(min_sell: Ref<number>, max_sell: Ref<number>): void {
  const charisma = playerStatAdjustmentCharisma();

  max_sell.v = idiv(max_sell.v * charisma, 100);
  if (max_sell.v <= 0) {
    max_sell.v = 1;
  }

  min_sell.v = idiv(min_sell.v * charisma, 100);
  if (min_sell.v <= 0) {
    min_sell.v = 1;
  }
}

// Haggling routine -RAK-
async function storePurchaseHaggle(store_id: number, price: Ref<number>, item: Inventory_t): Promise<number> {
  let status: number = BidState.Received;

  let new_price = 0;

  const store = stores[store_id];
  const owner = store_owners[store.owner_id];

  const max_sell = ref(0);
  const min_sell = ref(0);
  const cost = storeItemSellPrice(store, min_sell, max_sell, item);

  storePurchaseCustomerAdjustment(min_sell, max_sell);

  // cast max_inflate to signed so that subtraction works correctly
  let max_buy = idiv(cost * (200 - owner.max_inflate), 100);
  if (max_buy <= 0) {
    max_buy = 1;
  }

  await displayStoreHaggleCommands(1);

  const final_asking_price = min_sell.v;
  let current_asking_price = max_sell.v;

  let comment = 'Asking';
  let accepted_without_haggle = false;
  let offers_count = 0; // this prevents incremental haggling on first try

  // go right to final price if player has bargained well
  if (storeNoNeedToBargain(stores[store_id], final_asking_price)) {
    await printMessage('After a long bargaining session, you agree upon the price.');
    current_asking_price = min_sell.v;
    comment = 'Final offer';
    accepted_without_haggle = true;

    // Set up automatic increment, so that a return will accept the final price.
    store_last_increment = i16(min_sell.v);
    offers_count = 1;
  }

  const min_offer = max_buy;
  let last_offer = min_offer;
  const new_offer = ref(0);

  const min_per = owner.haggles_per;
  const max_per = min_per * 3;

  let final_flag = 0;

  let rejected = false;
  let bidding_open: boolean;

  while (!rejected) {
    do {
      bidding_open = true;

      const msg = sprintf('%s :  %d', comment, current_asking_price);
      putString(msg, { y: 1, x: 0 });

      status = await storeReceiveOffer(store_id, 'What do you offer? ', new_offer, last_offer, offers_count, 1);

      if (status !== BidState.Received) {
        rejected = true;
      } else {
        // review the received bid

        if (new_offer.v > current_asking_price) {
          await printSpeechSorry();

          // rejected, reset new_offer for incremental haggling
          new_offer.v = last_offer;

          // If the automatic increment is large enough to overflow,
          // then the player must have made a mistake.  Clear it
          // because it is useless.
          if (last_offer + store_last_increment > current_asking_price) {
            store_last_increment = 0;
          }
        } else if (new_offer.v === current_asking_price) {
          rejected = true;
          new_price = new_offer.v;
        } else {
          bidding_open = false;
        }
      }
    } while (!rejected && bidding_open);

    if (!rejected) {
      let adjustment = idiv((new_offer.v - last_offer) * 100, current_asking_price - last_offer);

      if (adjustment < min_per) {
        rejected = await storeHaggleInsults(store_id);
        if (rejected) {
          status = BidState.Insulted;
        }
      } else if (adjustment > max_per) {
        adjustment = idiv(adjustment * 75, 100);
        if (adjustment < max_per) {
          adjustment = max_per;
        }
      }

      adjustment = idiv((current_asking_price - new_offer.v) * (adjustment + randomNumber(5) - 3), 100) + 1;

      // don't let the price go up
      if (adjustment > 0) {
        current_asking_price -= adjustment;
      }

      if (current_asking_price < final_asking_price) {
        current_asking_price = final_asking_price;
        comment = 'Final Offer';

        // Set the automatic haggle increment so that RET will give
        // a new_offer equal to the final_asking_price price.
        store_last_increment = i16(final_asking_price - new_offer.v);
        final_flag++;

        if (final_flag > 3) {
          if (await storeIncreaseInsults(store_id)) {
            status = BidState.Insulted;
          } else {
            status = BidState.Rejected;
          }
          rejected = true;
        }
      } else if (new_offer.v >= current_asking_price) {
        rejected = true;
        new_price = new_offer.v;
      }

      if (!rejected) {
        last_offer = new_offer.v;
        offers_count++; // enable incremental haggling

        await eraseLine({ y: 1, x: 0 });
        const msg = sprintf('Your last offer : %d', last_offer);
        putString(msg, { y: 1, x: 39 });

        await printSpeechSellingHaggle(last_offer, current_asking_price, final_flag);

        // If the current increment would take you over the store's
        // price, then decrease it to an exact match.
        if (current_asking_price - last_offer < store_last_increment) {
          store_last_increment = i16(current_asking_price - last_offer);
        }
      }
    }
  }

  // update bargaining info
  if (status === BidState.Received && !accepted_without_haggle) {
    storeUpdateBargainingSkills(stores[store_id], new_price, final_asking_price);
  }

  price.v = new_price; // update callers price before returning

  return status;
}

function storeSellCustomerAdjustment(owner: Owner_t, cost: Ref<number>, min_buy: Ref<number>, max_buy: Ref<number>, max_sell: Ref<number>): void {
  cost.v = idiv(cost.v * (200 - playerStatAdjustmentCharisma()), 100);
  cost.v = idiv(cost.v * (200 - race_gold_adjustments[owner.race][py.misc.race_id]), 100);
  if (cost.v < 1) {
    cost.v = 1;
  }

  max_sell.v = idiv(cost.v * owner.max_inflate, 100);

  // cast max_inflate to signed so that subtraction works correctly
  max_buy.v = idiv(cost.v * (200 - owner.max_inflate), 100);
  min_buy.v = idiv(cost.v * (200 - owner.min_inflate), 100);
  if (min_buy.v < 1) {
    min_buy.v = 1;
  }
  if (max_buy.v < 1) {
    max_buy.v = 1;
  }
  if (min_buy.v < max_buy.v) {
    min_buy.v = max_buy.v;
  }
}

// Haggling routine -RAK-
async function storeSellHaggle(store_id: number, price: Ref<number>, item: Inventory_t): Promise<number> {
  let status: number = BidState.Received;

  let new_price = 0;

  const store = stores[store_id];
  const cost = ref(storeItemValue(item));

  let rejected = false;

  let max_gold = 0;
  let min_per = 0;
  let max_per = 0;
  const max_sell = ref(0);
  const min_buy = ref(0);
  const max_buy = ref(0);

  if (cost.v < 1) {
    status = BidState.Offended;
    rejected = true;
  } else {
    const owner = store_owners[store.owner_id];

    storeSellCustomerAdjustment(owner, cost, min_buy, max_buy, max_sell);

    min_per = owner.haggles_per;
    max_per = min_per * 3;
    max_gold = owner.max_cost;
  }

  let final_asking_price = 0;
  let current_asking_price = 0;

  let final_flag = 0;

  let comment: string | null = null;
  let accepted_without_haggle = false;

  if (!rejected) {
    await displayStoreHaggleCommands(-1);

    let offer_count = 0; // this prevents incremental haggling on first try

    if (max_buy.v > max_gold) {
      final_flag = 1;
      comment = 'Final Offer';

      // Disable the automatic haggle increment on RET.
      store_last_increment = 0;
      current_asking_price = max_gold;
      final_asking_price = max_gold;
      await printMessage('I am sorry, but I have not the money to afford such a fine item.');
      accepted_without_haggle = true;
    } else {
      current_asking_price = max_buy.v;
      final_asking_price = min_buy.v;

      if (final_asking_price > max_gold) {
        final_asking_price = max_gold;
      }

      comment = 'Offer';

      // go right to final price if player has bargained well
      if (storeNoNeedToBargain(stores[store_id], final_asking_price)) {
        await printMessage('After a long bargaining session, you agree upon the price.');
        current_asking_price = final_asking_price;
        comment = 'Final offer';
        accepted_without_haggle = true;

        // Set up automatic increment, so that a return
        // will accept the final price.
        store_last_increment = i16(final_asking_price);
        offer_count = 1;
      }
    }

    const min_offer = max_sell.v;
    let last_offer = min_offer;
    const new_offer = ref(0);

    if (current_asking_price < 1) {
      current_asking_price = 1;
    }

    let bidding_open: boolean;

    do {
      do {
        bidding_open = true;

        const msg = sprintf('%s :  %d', comment, current_asking_price);
        putString(msg, { y: 1, x: 0 });

        status = await storeReceiveOffer(store_id, 'What price do you ask? ', new_offer, last_offer, offer_count, -1);

        if (status !== BidState.Received) {
          rejected = true;
        } else {
          // review the received bid

          if (new_offer.v < current_asking_price) {
            await printSpeechSorry();

            // rejected, reset new_offer for incremental haggling
            new_offer.v = last_offer;

            // If the automatic increment is large enough to
            // overflow, then the player must have made a mistake.
            // Clear it because it is useless.
            if (last_offer + store_last_increment < current_asking_price) {
              store_last_increment = 0;
            }
          } else if (new_offer.v === current_asking_price) {
            rejected = true;
            new_price = new_offer.v;
          } else {
            bidding_open = false;
          }
        }
      } while (!rejected && bidding_open);

      if (!rejected) {
        let adjustment = idiv((last_offer - new_offer.v) * 100, last_offer - current_asking_price);

        if (adjustment < min_per) {
          rejected = await storeHaggleInsults(store_id);
          if (rejected) {
            status = BidState.Insulted;
          }
        } else if (adjustment > max_per) {
          adjustment = idiv(adjustment * 75, 100);
          if (adjustment < max_per) {
            adjustment = max_per;
          }
        }

        adjustment = idiv((new_offer.v - current_asking_price) * (adjustment + randomNumber(5) - 3), 100) + 1;

        // don't let the price go down
        if (adjustment > 0) {
          current_asking_price += adjustment;
        }

        if (current_asking_price > final_asking_price) {
          current_asking_price = final_asking_price;
          comment = 'Final Offer';

          // Set the automatic haggle increment so that RET will give
          // a new_offer equal to the final_asking_price price.
          store_last_increment = i16(final_asking_price - new_offer.v);
          final_flag++;

          if (final_flag > 3) {
            if (await storeIncreaseInsults(store_id)) {
              status = BidState.Insulted;
            } else {
              status = BidState.Rejected;
            }
            rejected = true;
          }
        } else if (new_offer.v <= current_asking_price) {
          rejected = true;
          new_price = new_offer.v;
        }

        if (!rejected) {
          last_offer = new_offer.v;
          offer_count++; // enable incremental haggling

          await eraseLine({ y: 1, x: 0 });
          const msg = sprintf('Your last bid %d', last_offer);
          putString(msg, { y: 1, x: 39 });

          await printSpeechBuyingHaggle(current_asking_price, last_offer, final_flag);

          // If the current decrement would take you under the store's
          // price, then increase it to an exact match.
          if (current_asking_price - last_offer > store_last_increment) {
            store_last_increment = i16(current_asking_price - last_offer);
          }
        }
      }
    } while (!rejected);
  }

  // update bargaining info
  if (status === BidState.Received && !accepted_without_haggle) {
    storeUpdateBargainingSkills(stores[store_id], new_price, final_asking_price);
  }

  price.v = new_price; // update callers price before returning

  return status;
}

// Get the number of store items to display on the screen
function storeItemsToDisplay(store_counter: number, current_top_item_id: number): number {
  if (current_top_item_id === 12) {
    return store_counter - 1 - 12;
  }

  if (store_counter > 11) {
    return 11;
  }

  return store_counter - 1;
}

// Buy an item from a store -RAK-
// Returns true is the owner kicks out the customer
async function storePurchaseAnItem(store_id: number, current_top_item_id: Ref<number>): Promise<boolean> {
  let kick_customer = false; // don't kick them out of the store!

  const store = stores[store_id];

  if (store.unique_items_counter < 1) {
    await printMessage('I am currently out of stock.');
    return false;
  }

  const item_id_ref = ref(0);
  const item_count = storeItemsToDisplay(store.unique_items_counter, current_top_item_id.v);
  if (!(await storeGetItemId(item_id_ref, 'Which item are you interested in? ', 0, item_count))) {
    return false;
  }

  // Get the item number to be bought

  const item_id = item_id_ref.v + current_top_item_id.v; // true item_id

  const sell_item = new Inventory_t();
  inventoryTakeOneItem(sell_item, store.inventory[item_id].item);

  if (!inventoryCanCarryItemCount(sell_item)) {
    await putStringClearToEOL('You cannot carry that many different items.', { y: 0, x: 0 });
    return false;
  }

  let status: number = BidState.Received;
  const price = ref(0);

  if (store.inventory[item_id].cost > 0) {
    price.v = store.inventory[item_id].cost;
  } else {
    status = await storePurchaseHaggle(store_id, price, sell_item);
  }

  if (status === BidState.Insulted) {
    kick_customer = true;
  } else if (status === BidState.Received) {
    if (py.misc.au >= price.v) {
      await printSpeechFinishedHaggling();
      storeDecreaseInsults(store_id);
      py.misc.au -= price.v;

      const new_item_id = inventoryCarryItem(sell_item);
      const saved_store_counter = store.unique_items_counter;

      storeDestroyItem(store_id, item_id, true);

      const description = ref('');
      itemDescription(description, py.inventory[new_item_id], true);

      const msg = sprintf('You have %s (%c)', description.v, chr(new_item_id + 97)); // + 'a'
      await putStringClearToEOL(msg, { y: 0, x: 0 });

      await playerStrength();

      if (current_top_item_id.v >= store.unique_items_counter) {
        current_top_item_id.v = 0;
        await displayStoreInventory(stores[store_id], current_top_item_id.v);
      } else {
        const store_item = store.inventory[item_id];

        if (saved_store_counter === store.unique_items_counter) {
          if (store_item.cost < 0) {
            store_item.cost = price.v;
            await displaySingleCost(store_id, item_id);
          }
        } else {
          await displayStoreInventory(stores[store_id], item_id);
        }
      }
      await displayPlayerRemainingGold();
    } else {
      if (await storeIncreaseInsults(store_id)) {
        kick_customer = true;
      } else {
        await printSpeechFinishedHaggling();
        await printMessage('Liar!  You have not the gold!');
      }
    }
  }

  // Less intuitive, but looks better here than in storePurchaseHaggle.
  await displayStoreCommands();
  await eraseLine({ y: 1, x: 0 });

  return kick_customer;
}

// Functions to emulate the original Pascal sets
function setGeneralStoreItems(item_id: number): boolean {
  switch (item_id) {
    case TV_DIGGING:
    case TV_BOOTS:
    case TV_CLOAK:
    case TV_FOOD:
    case TV_FLASK:
    case TV_LIGHT:
    case TV_SPIKE:
      return true;
    default:
      return false;
  }
}

function setArmoryItems(item_id: number): boolean {
  switch (item_id) {
    case TV_BOOTS:
    case TV_GLOVES:
    case TV_HELM:
    case TV_SHIELD:
    case TV_HARD_ARMOR:
    case TV_SOFT_ARMOR:
      return true;
    default:
      return false;
  }
}

function setWeaponsmithItems(item_id: number): boolean {
  switch (item_id) {
    case TV_SLING_AMMO:
    case TV_BOLT:
    case TV_ARROW:
    case TV_BOW:
    case TV_HAFTED:
    case TV_POLEARM:
    case TV_SWORD:
      return true;
    default:
      return false;
  }
}

function setTempleItems(item_id: number): boolean {
  switch (item_id) {
    case TV_HAFTED:
    case TV_SCROLL1:
    case TV_SCROLL2:
    case TV_POTION1:
    case TV_POTION2:
    case TV_PRAYER_BOOK:
      return true;
    default:
      return false;
  }
}

function setAlchemistItems(item_id: number): boolean {
  switch (item_id) {
    case TV_SCROLL1:
    case TV_SCROLL2:
    case TV_POTION1:
    case TV_POTION2:
      return true;
    default:
      return false;
  }
}

function setMagicShopItems(item_id: number): boolean {
  switch (item_id) {
    case TV_AMULET:
    case TV_RING:
    case TV_STAFF:
    case TV_WAND:
    case TV_SCROLL1:
    case TV_SCROLL2:
    case TV_POTION1:
    case TV_POTION2:
    case TV_MAGIC_BOOK:
      return true;
    default:
      return false;
  }
}

// Each store will buy only certain items, based on TVAL
export const store_buy: readonly ((item_id: number) => boolean)[] = [
  setGeneralStoreItems, setArmoryItems, setWeaponsmithItems, setTempleItems, setAlchemistItems, setMagicShopItems,
];

// Sell an item to the store -RAK-
// Returns true is the owner kicks out the customer
async function storeSellAnItem(store_id: number, current_top_item_id: Ref<number>): Promise<boolean> {
  let kick_customer = false; // don't kick them out of the store!

  let first_item = py.pack.unique_items;
  let last_item = -1;

  // char mask[PlayerEquipment::Wield] (the entries past the pack are not set in C)
  const mask = new Array<number>(PlayerEquipment.Wield).fill(0);

  for (let counter = 0; counter < py.pack.unique_items; counter++) {
    const flag = store_buy[store_id](py.inventory[counter].category_id);

    if (flag) {
      mask[counter] = 1;

      if (counter < first_item) {
        first_item = counter;
      }
      if (counter > last_item) {
        last_item = counter;
      }
    } else {
      mask[counter] = 0;
    }
  }

  if (last_item === -1) {
    await printMessage('You have nothing to sell to this store!');
    return false;
  }

  const item_id = ref(0);
  if (!(await inventoryGetInputForItemId(item_id, 'Which one? ', first_item, last_item, mask, 'I do not buy such items.'))) {
    return false;
  }

  const sold_item = new Inventory_t();
  inventoryTakeOneItem(sold_item, py.inventory[item_id.v]);

  const description = ref('');
  itemDescription(description, sold_item, true);

  let msg = sprintf('Selling %s (%c)', description.v, chr(item_id.v + 97)); // + 'a'
  await printMessage(msg);

  if (!storeCheckPlayerItemsCount(stores[store_id], sold_item)) {
    await printMessage('I have not the room in my store to keep it.');
    return false;
  }

  const price = ref(0);

  const status = await storeSellHaggle(store_id, price, sold_item);

  if (status === BidState.Insulted) {
    kick_customer = true;
  } else if (status === BidState.Offended) {
    await printMessage('How dare you!');
    await printMessage('I will not buy that!');
    kick_customer = await storeIncreaseInsults(store_id);
  } else if (status === BidState.Received) {
    // bid received, and accepted!

    await printSpeechFinishedHaggling();
    storeDecreaseInsults(store_id);
    py.misc.au += price.v;

    // identify object in inventory to set objects_identified array
    await itemIdentify(py.inventory[item_id.v], item_id);

    // retake sold_item so that it will be identified
    inventoryTakeOneItem(sold_item, py.inventory[item_id.v]);

    // call spellItemIdentifyAndRemoveRandomInscription for store item, so charges/pluses are known
    spellItemIdentifyAndRemoveRandomInscription(sold_item);
    inventoryDestroyItem(item_id.v);

    itemDescription(description, sold_item, true);
    msg = sprintf("You've sold %s", description.v);
    await printMessage(msg);

    const item_pos_id = ref(0);
    storeCarryItem(store_id, item_pos_id, sold_item);

    await playerStrength();

    if (item_pos_id.v >= 0) {
      if (item_pos_id.v < 12) {
        if (current_top_item_id.v < 12) {
          await displayStoreInventory(stores[store_id], item_pos_id.v);
        } else {
          current_top_item_id.v = 0;
          await displayStoreInventory(stores[store_id], current_top_item_id.v);
        }
      } else if (current_top_item_id.v > 11) {
        await displayStoreInventory(stores[store_id], item_pos_id.v);
      } else {
        current_top_item_id.v = 12;
        await displayStoreInventory(stores[store_id], current_top_item_id.v);
      }
    }
    await displayPlayerRemainingGold();
  }

  // Less intuitive, but looks better here than in storeSellHaggle.
  await eraseLine({ y: 1, x: 0 });
  await displayStoreCommands();

  return kick_customer;
}

// Entering a store -RAK-
export async function storeEnter(store_id: number): Promise<void> {
  const store = stores[store_id];

  if (store.turns_left_before_closing >= dg.game_turn) {
    await printMessage('The doors are locked.');
    return;
  }

  const current_top_item_id = ref(0);
  await displayStore(stores[store_id], store_owners[store.owner_id].name, current_top_item_id.v);

  let exit_store = false;
  while (!exit_store) {
    moveCursor({ y: 20, x: 9 });

    // clear the msg flag just like we do in dungeon.c
    globals.message_ready_to_print = false;

    const command = ref('');
    if (await getCommand('', command)) {
      let saved_chr: number;

      switch (command.v) {
        case 'b':
          if (current_top_item_id.v === 0) {
            if (store.unique_items_counter > 12) {
              current_top_item_id.v = 12;
              await displayStoreInventory(stores[store_id], current_top_item_id.v);
            } else {
              await printMessage('Entire inventory is shown.');
            }
          } else {
            current_top_item_id.v = 0;
            await displayStoreInventory(stores[store_id], current_top_item_id.v);
          }
          break;
        case 'E':
        case 'e': // Equipment List
        case 'I':
        case 'i': // Inventory
        case 'T':
        case 't': // Take off
        case 'W':
        case 'w': // Wear
        case 'X':
        case 'x': // Switch weapon
          saved_chr = py.stats.used[PlayerAttr.A_CHR];

          do {
            await inventoryExecuteCommand(command.v);
            command.v = game.doing_inventory_command;
          } while (command.v !== '\0');

          // redisplay store prices if charisma changes
          if (saved_chr !== py.stats.used[PlayerAttr.A_CHR]) {
            await displayStoreInventory(stores[store_id], current_top_item_id.v);
          }

          game.player_free_turn = false; // No free moves here. -CJS-
          break;
        case 'p':
          exit_store = await storePurchaseAnItem(store_id, current_top_item_id);
          break;
        case 's':
          exit_store = await storeSellAnItem(store_id, current_top_item_id);
          break;
        default:
          await terminalBellSound();
          break;
      }
    } else {
      exit_store = true;
    }
  }

  // Can't save and restore the screen because inventoryExecuteCommand() does that.
  await drawCavePanel();
}

// eliminate need to bargain if player has haggled well in the past -DJB-
function storeNoNeedToBargain(store: Store_t, min_price: number): boolean {
  if (store.good_purchases === SHRT_MAX) {
    return true;
  }

  const record = (store.good_purchases - 3 * store.bad_purchases - 5);

  return ((record > 0) && (record * record > idiv(min_price, 50)));
}

// update the bargain info -DJB-
function storeUpdateBargainingSkills(store: Store_t, price: number, min_price: number): void {
  if (min_price < 10) {
    return;
  }

  if (price === min_price) {
    if (store.good_purchases < SHRT_MAX) {
      store.good_purchases++;
    }
  } else {
    if (store.bad_purchases < SHRT_MAX) {
      store.bad_purchases++;
    }
  }
}
