// ui_inventory.cpp
import { config } from './config.ts';
import {
  ESCAPE, ITEM_GROUP_MIN, ITEM_SINGLE_STACK_MAX, PLAYER_INVENTORY_SIZE, PlayerAttr, PlayerEquipment, Screen, TV_AMULET, TV_ARROW,
  TV_BOLT, TV_BOOTS, TV_BOW, TV_CLOAK, TV_DIGGING, TV_GLOVES, TV_HAFTED, TV_HARD_ARMOR, TV_HELM, TV_LIGHT, TV_MAX_WEAR,
  TV_MIN_WEAR, TV_NOTHING, TV_POLEARM, TV_RING, TV_SHIELD, TV_SLING_AMMO, TV_SOFT_ARMOR, TV_SPIKE, TV_SWORD,
} from './constants.ts';
import { dg, game, globals, py } from './globals.ts';
import { itemAppendToInscription, itemDescription } from './identification.ts';
import { inventoryCanCarryItemCount, inventoryCarryItem, inventoryDestroyItem, inventoryDropItem, inventoryItemIsCursed } from './inventory.ts';
import { chr, idiv, isupper, ord, ref, type Ref, sprintf, tolower } from './libc.ts';
import {
  playerAdjustBonusesForItem, playerCarryingLoadLimit, playerIsWieldingItem, playerLeftHandRingEmpty, playerRecalculateBonuses,
  playerRightHandRingEmpty, playerStrength, playerTakeOff, playerWornItemIsCursed,
} from './player.ts';
import {
  eraseLine, getCommand, getInputConfirmation, getInputConfirmationWithAbort, getKeyInput, getMenuItemId, messageLineClear,
  printMessage, putString, putStringClearToEOL, terminalBellSound, terminalRestoreScreen, terminalSaveScreen,
} from './ui_io.ts';

// sprintf(text, ...) into the caller's buffer: the text is returned
function inventoryItemWeightText(itemId: number): string {
  const totalWeight = py.inventory[itemId].weight * py.inventory[itemId].items_count;
  const quotient = idiv(totalWeight, 10);
  const remainder = totalWeight % 10;

  return sprintf('%3d.%d lb', quotient, remainder);
}

// Displays inventory items from `item_id_start` to `item_id_end` -RAK-
// Designed to keep the display as far to the right as possible. -CJS-
// The parameter col gives a column at which to start, but if the display
// does not fit, it may be moved left.  The return value is the left edge
// used. If mask is non-zero, then only display those items which have a
// non-zero entry in the mask array.
export async function displayInventoryItems(itemIdStart: number, itemIdEnd: number, weighted: boolean, column: number, mask: readonly number[] | null): Promise<number> {
  // vtype_t descriptions[23]
  const descriptions = new Array<string>(23).fill('');

  let len = 79 - column;

  let lim: number;
  if (weighted) {
    lim = 68;
  } else {
    lim = 76;
  }

  // Generate the descriptions text
  for (let i = itemIdStart; i <= itemIdEnd; i++) {
    if (mask !== null && (mask[i] === 0)) {
      continue;
    }

    const description = ref('');
    itemDescription(description, py.inventory[i], true);

    // Truncate if too long.
    description.v = description.v.slice(0, lim);

    descriptions[i] = sprintf('%c) %s', chr(97 + i), description.v); // 'a' + i

    let l = descriptions[i].length + 2;

    if (weighted) {
      l += 9;
    }

    if (l > len) {
      len = l;
    }
  }

  column = 79 - len;
  if (column < 0) {
    column = 0;
  }

  let currentLine = 1;

  // Print the descriptions
  for (let i = itemIdStart; i <= itemIdEnd; i++) {
    if (mask !== null && (mask[i] === 0)) {
      continue;
    }

    // don't need first two spaces if in first column
    if (column === 0) {
      await putStringClearToEOL(descriptions[i], { y: currentLine, x: column });
    } else {
      putString('  ', { y: currentLine, x: column });
      await putStringClearToEOL(descriptions[i], { y: currentLine, x: column + 2 });
    }

    if (weighted) {
      const text = inventoryItemWeightText(i);
      await putStringClearToEOL(text, { y: currentLine, x: 71 });
    }

    currentLine++;
  }

  return column;
}

// Return a string describing how a given equipment item is carried. -CJS-
export function playerItemWearingDescription(body_location: number): string {
  switch (body_location) {
    case PlayerEquipment.Wield:
      return 'wielding';
    case PlayerEquipment.Head:
      return 'wearing on your head';
    case PlayerEquipment.Neck:
      return 'wearing around your neck';
    case PlayerEquipment.Body:
      return 'wearing on your body';
    case PlayerEquipment.Arm:
      return 'wearing on your arm';
    case PlayerEquipment.Hands:
      return 'wearing on your hands';
    case PlayerEquipment.Right:
      return 'wearing on your right hand';
    case PlayerEquipment.Left:
      return 'wearing on your left hand';
    case PlayerEquipment.Feet:
      return 'wearing on your feet';
    case PlayerEquipment.Outer:
      return 'wearing about your body';
    case PlayerEquipment.Light:
      return 'using to light the way';
    case PlayerEquipment.Auxiliary:
      return 'holding ready by your side';
    default:
      return 'carrying in your pack';
  }
}

function equipmentPositionDescription(id: number, weight: number): string {
  switch (id) {
    case PlayerEquipment.Wield:
      if (py.stats.used[PlayerAttr.A_STR] * 15 < weight) {
        return 'Just lifting';
      }
      return 'Wielding';
    case PlayerEquipment.Head:
      return 'On head';
    case PlayerEquipment.Neck:
      return 'Around neck';
    case PlayerEquipment.Body:
      return 'On body';
    case PlayerEquipment.Arm:
      return 'On arm';
    case PlayerEquipment.Hands:
      return 'On hands';
    case PlayerEquipment.Right:
      return 'On right hand';
    case PlayerEquipment.Left:
      return 'On left hand';
    case PlayerEquipment.Feet:
      return 'On feet';
    case PlayerEquipment.Outer:
      return 'About body';
    case PlayerEquipment.Light:
      return 'Light source';
    case PlayerEquipment.Auxiliary:
      return 'Spare weapon';
    default:
      return 'Unknown equipment position ID';
  }
}

// Displays equipment items from r1 to end -RAK-
// Keep display as far right as possible. -CJS-
export async function displayEquipment(showWeights: boolean, column: number): Promise<number> {
  // vtype_t descriptions[PLAYER_INVENTORY_SIZE - PlayerEquipment::Wield]
  const descriptions = new Array<string>(PLAYER_INVENTORY_SIZE - PlayerEquipment.Wield).fill('');

  let len = 79 - column;

  let lim: number;
  if (showWeights) {
    lim = 52;
  } else {
    lim = 60;
  }

  // Range of equipment
  let line = 0;
  for (let i = PlayerEquipment.Wield; i < PLAYER_INVENTORY_SIZE; i++) {
    if (py.inventory[i].category_id === TV_NOTHING) {
      continue;
    }

    // Get position
    const equippedDescription = equipmentPositionDescription(i, py.inventory[i].weight);

    const description = ref('');
    itemDescription(description, py.inventory[i], true);

    // Truncate if necessary
    description.v = description.v.slice(0, lim);

    descriptions[line] = sprintf('%c) %-14s: %s', chr(line + 97), equippedDescription, description.v); // line + 'a'

    let l = descriptions[line].length + 2;

    if (showWeights) {
      l += 9;
    }

    if (l > len) {
      len = l;
    }

    line++;
  }

  column = 79 - len;
  if (column < 0) {
    column = 0;
  }

  // Range of equipment
  line = 0;
  for (let i = PlayerEquipment.Wield; i < PLAYER_INVENTORY_SIZE; i++) {
    if (py.inventory[i].category_id === TV_NOTHING) {
      continue;
    }

    // don't need first two spaces when using whole screen
    if (column === 0) {
      await putStringClearToEOL(descriptions[line], { y: line + 1, x: column });
    } else {
      putString('  ', { y: line + 1, x: column });
      await putStringClearToEOL(descriptions[line], { y: line + 1, x: column + 2 });
    }

    if (showWeights) {
      const text = inventoryItemWeightText(i);
      await putStringClearToEOL(text, { y: line + 1, x: 71 });
    }

    line++;
  }
  await eraseLine({ y: line + 1, x: column });

  return column;
}

async function showEquipmentHelpMenu(leftColumn: number): Promise<number> {
  if (leftColumn > 52) {
    leftColumn = 52;
  }

  await putStringClearToEOL('  ESC: exit', { y: 1, x: leftColumn });
  await putStringClearToEOL('  w  : wear or wield object', { y: 2, x: leftColumn });
  await putStringClearToEOL('  t  : take off item', { y: 3, x: leftColumn });
  await putStringClearToEOL('  d  : drop object', { y: 4, x: leftColumn });
  await putStringClearToEOL('  x  : exchange weapons', { y: 5, x: leftColumn });
  await putStringClearToEOL('  i  : inventory of pack', { y: 6, x: leftColumn });
  await putStringClearToEOL('  e  : list used equipment', { y: 7, x: leftColumn });

  return 7; // current line position
}

// TODO: Most of the functions below should probably not be part of the UI,
// TODO: but have dependencies on "screen state" variables, so need to be here for now.

// All inventory commands (wear, exchange, take off, drop, inventory and
// equipment) are handled in an alternative command input mode, which accepts
// any of the inventory commands.
//
// It is intended that this function be called several times in succession,
// as some commands take up a turn, and the rest of moria must proceed in the
// interim. A global variable is provided, game.doing_inventory_command, which is normally
// zero; however if on return from inventoryExecuteCommand() it is expected that
// inventoryExecuteCommand() should be called *again*, (being still in inventory command
// input mode), then game.doing_inventory_command is set to the inventory command character
// which should be used in the next call to inventoryExecuteCommand().
//
// On return, the screen is restored, but not flushed. Provided no flush of
// the screen takes place before the next call to inventoryExecuteCommand(), the inventory
// command screen is silently redisplayed, and no actual output takes place at
// all. If the screen is flushed before a subsequent call, then the player is
// prompted to see if we should continue. This allows the player to see any
// changes that take place on the screen during inventory command input.
//
// The global variable, screen_has_changed, is cleared by inventoryExecuteCommand(), and set
// when the screen is flushed. This is the means by which inventoryExecuteCommand() tell
// if the screen has been flushed.
//
// The display of inventory items is kept to the right of the screen to
// minimize the work done to restore the screen afterwards. -CJS-

async function uiCommandSwitchScreen(nextScreen: number): Promise<void> {
  if (nextScreen === game.screen.current_screen_id) {
    return;
  }
  game.screen.current_screen_id = nextScreen;

  let currentLinePos = 0;
  switch (nextScreen) {
    case Screen.Blank:
      break;
    case Screen.Help:
      currentLinePos = await showEquipmentHelpMenu(game.screen.screen_left_pos);
      break;
    case Screen.Inventory:
      game.screen.screen_left_pos = await displayInventoryItems(0, py.pack.unique_items - 1, config.options.show_inventory_weights, game.screen.screen_left_pos, null);
      currentLinePos = py.pack.unique_items;
      break;
    case Screen.Wear:
      game.screen.screen_left_pos = await displayInventoryItems(game.screen.wear_low_id, game.screen.wear_high_id, config.options.show_inventory_weights, game.screen.screen_left_pos, null);
      currentLinePos = game.screen.wear_high_id - game.screen.wear_low_id + 1;
      break;
    case Screen.Equipment:
      game.screen.screen_left_pos = await displayEquipment(config.options.show_inventory_weights, game.screen.screen_left_pos);
      currentLinePos = py.equipment_count;
      break;
    case Screen.Wrong:
    default:
      break;
  }

  if (currentLinePos >= game.screen.screen_bottom_pos) {
    game.screen.screen_bottom_pos = currentLinePos + 1;
    await eraseLine({ y: game.screen.screen_bottom_pos, x: game.screen.screen_left_pos });
    return;
  }
  currentLinePos++;

  while (currentLinePos <= game.screen.screen_bottom_pos) {
    await eraseLine({ y: currentLinePos, x: game.screen.screen_left_pos });
    currentLinePos++;
  }
}

// Used to verify if this really is the item we wish to wear or read. -CJS-
async function verifyAction(prompt: string, item: number): Promise<boolean> {
  const description = ref('');
  itemDescription(description, py.inventory[item], true);

  // change the period to a question mark
  description.v = description.v.slice(0, description.v.length - 1) + '?';

  const msg = sprintf('%s %s', prompt, description.v);

  return getInputConfirmation(msg);
}

async function requestAndShowInventoryScreen(recoverScreen: boolean): Promise<void> {
  if (game.doing_inventory_command === '\0') {
    game.screen.screen_left_pos = 50;
    game.screen.screen_bottom_pos = 0;
    game.screen.current_screen_id = Screen.Blank; // this forces exit of inventoryExecuteCommand() if selecting is not set true
    return;
  }

  // Take up where we left off after a previous inventory command. -CJS-

  // If the screen has been flushed, we need to redraw. If the command
  // is a simple ' ' to recover the screen, just quit. Otherwise, check
  // and see what the user wants.
  if (globals.screen_has_changed) {
    if (recoverScreen || !(await getInputConfirmation('Continuing with inventory command?'))) {
      game.doing_inventory_command = '\0';
      return;
    }
    game.screen.screen_left_pos = 50;
    game.screen.screen_bottom_pos = 0;
  }

  const currentScreen = game.screen.current_screen_id;
  game.screen.current_screen_id = Screen.Wrong;
  await uiCommandSwitchScreen(currentScreen);
}

async function uiCommandInventoryTakeOffItem(selecting: boolean): Promise<boolean> {
  if (py.equipment_count === 0) {
    await printMessage('You are not using any equipment.');
    // don't print message restarting inven command after taking off something, it is confusing
    return selecting;
  }

  if (py.pack.unique_items >= PlayerEquipment.Wield && (game.doing_inventory_command === '\0')) {
    await printMessage('You will have to drop something first.');
    return selecting;
  }

  if (game.screen.current_screen_id !== Screen.Blank) {
    await uiCommandSwitchScreen(Screen.Equipment);
  }

  return true;
}

async function uiCommandInventoryDropItem(command: Ref<string>, selecting: boolean): Promise<boolean> {
  if (py.pack.unique_items === 0 && py.equipment_count === 0) {
    await printMessage("But you're not carrying anything.");
    return selecting;
  }

  if (dg.floor[py.pos.y][py.pos.x].treasure_id !== 0) {
    await printMessage("There's no room to drop anything here.");
    return selecting;
  }

  if ((game.screen.current_screen_id === Screen.Equipment && py.equipment_count > 0) || py.pack.unique_items === 0) {
    if (game.screen.current_screen_id !== Screen.Blank) {
      await uiCommandSwitchScreen(Screen.Equipment);
    }
    command.v = 'r'; // Remove - or take off and drop.
  } else if (game.screen.current_screen_id !== Screen.Blank) {
    await uiCommandSwitchScreen(Screen.Inventory);
  }

  return true;
}

async function uiCommandInventoryWearWieldItem(selecting: boolean): Promise<boolean> {
  // Note: simple loop to get the global game.screen.wear_low_id value
  game.screen.wear_low_id = 0;
  while (game.screen.wear_low_id < py.pack.unique_items && py.inventory[game.screen.wear_low_id].category_id > TV_MAX_WEAR) {
    game.screen.wear_low_id++;
  }

  // Note: simple loop to get the global wear_high value
  game.screen.wear_high_id = game.screen.wear_low_id;
  while (game.screen.wear_high_id < py.pack.unique_items && py.inventory[game.screen.wear_high_id].category_id >= TV_MIN_WEAR) {
    game.screen.wear_high_id++;
  }
  game.screen.wear_high_id--;

  if (game.screen.wear_low_id > game.screen.wear_high_id) {
    await printMessage('You have nothing to wear or wield.');
    return selecting;
  }

  if (game.screen.current_screen_id !== Screen.Blank && game.screen.current_screen_id !== Screen.Inventory) {
    await uiCommandSwitchScreen(Screen.Wear);
  }

  return true;
}

async function uiCommandInventoryUnwieldItem(): Promise<void> {
  if (!playerIsWieldingItem()) {
    await printMessage('But you are wielding no weapons.');
    return;
  }

  if (playerWornItemIsCursed(PlayerEquipment.Wield)) {
    const description = ref('');
    itemDescription(description, py.inventory[PlayerEquipment.Wield], false);

    const msg = sprintf('The %s you are wielding appears to be cursed.', description.v);

    await printMessage(msg);

    return;
  }

  game.player_free_turn = false;

  // swap auxiliary and wield items
  const savedItem = py.inventory[PlayerEquipment.Auxiliary].clone();
  py.inventory[PlayerEquipment.Auxiliary].assign(py.inventory[PlayerEquipment.Wield]);
  py.inventory[PlayerEquipment.Wield].assign(savedItem);

  if (game.screen.current_screen_id === Screen.Equipment) {
    game.screen.screen_left_pos = await displayEquipment(config.options.show_inventory_weights, game.screen.screen_left_pos);
  }

  await playerAdjustBonusesForItem(py.inventory[PlayerEquipment.Auxiliary], -1); // Subtract bonuses
  await playerAdjustBonusesForItem(py.inventory[PlayerEquipment.Wield], 1); // Add bonuses

  if (py.inventory[PlayerEquipment.Wield].category_id !== TV_NOTHING) {
    let label = 'Primary weapon   : ';

    const description = ref('');
    itemDescription(description, py.inventory[PlayerEquipment.Wield], true);

    label += description.v;
    await printMessage(label);
  } else {
    await printMessage('No primary weapon.');
  }

  // this is a new weapon, so clear the heavy flag
  py.weapon_is_heavy = false;
  await playerStrength();
}

// look for item whose inscription matches `which`
function inventoryGetItemMatchingInscription(which: string, command: string, from: number, to: number): number {
  let itemId: number;

  if (which >= '0' && which <= '9' && command !== 'r' && command !== 't') {
    // Note: simple loop to get id
    let m = from;
    // (inscription[0] != which) || (inscription[1] != '\0'): the inscription is not just `which`
    while (m <= to && m < PLAYER_INVENTORY_SIZE && py.inventory[m].inscription !== which) {
      m++;
    }

    if (m <= to) {
      itemId = m;
    } else {
      itemId = -1;
    }
  } else if (which >= 'A' && which <= 'Z') {
    itemId = ord(which) - 65; // which - 'A'
  } else {
    itemId = ord(which) - 97; // which - 'a' (which is a signed char in C)
    if (ord(which) >= 128) {
      itemId -= 256;
    }
  }

  return itemId;
}

// sprintf(str, ...) into the caller's buffer: the text is returned
function buildCommandHeading(from: number, to: number, swap: string, command: string, prompt: string): string {
  from += 97; // 'a'
  to += 97; // 'a'

  let list = '';
  if (game.screen.current_screen_id === Screen.Blank) {
    list = ', * to list';
  }

  let digits = '';
  if (command === 'w' || command === 'd') {
    digits = ', 0-9';
  }

  return sprintf('(%c-%c%s%s%s, space to break, ESC to exit) %s which one?', from, to, list, swap, digits, prompt);
}

async function changeScreenForCommand(command: string): Promise<void> {
  if (command === 't' || command === 'r') {
    await uiCommandSwitchScreen(Screen.Equipment);
  } else if (command === 'w' && game.screen.current_screen_id !== Screen.Inventory) {
    await uiCommandSwitchScreen(Screen.Wear);
  } else {
    await uiCommandSwitchScreen(Screen.Inventory);
  }
}

async function flipInventoryEquipmentScreens(): Promise<void> {
  if (game.screen.current_screen_id === Screen.Equipment) {
    await uiCommandSwitchScreen(Screen.Inventory);
  } else if (game.screen.current_screen_id === Screen.Inventory) {
    await uiCommandSwitchScreen(Screen.Equipment);
  }
}

async function requestPutRingOnWhichHand(): Promise<number> {
  let hand = 0;

  // Rings. Give choice over where they go.
  do {
    const query = ref('');
    if (!(await getMenuItemId('Put ring on which hand (l/r/L/R)?', query))) {
      hand = -1;
    } else if (query.v === 'l') {
      hand = PlayerEquipment.Left;
    } else if (query.v === 'r') {
      hand = PlayerEquipment.Right;
    } else {
      if (query.v === 'L') {
        hand = PlayerEquipment.Left;
      } else if (query.v === 'R') {
        hand = PlayerEquipment.Right;
      } else {
        await terminalBellSound();
      }
      if ((hand !== 0) && !(await verifyAction('Replace', hand))) {
        hand = 0;
      }
    }
  } while (hand === 0);

  return hand;
}

async function inventoryGetSlotToWearEquipment(categoryId: number): Promise<number> {
  let slot = -1;

  // Slot for equipment
  switch (categoryId) {
    case TV_SLING_AMMO:
    case TV_BOLT:
    case TV_ARROW:
    case TV_BOW:
    case TV_HAFTED:
    case TV_POLEARM:
    case TV_SWORD:
    case TV_DIGGING:
    case TV_SPIKE:
      slot = PlayerEquipment.Wield;
      break;
    case TV_LIGHT:
      slot = PlayerEquipment.Light;
      break;
    case TV_BOOTS:
      slot = PlayerEquipment.Feet;
      break;
    case TV_GLOVES:
      slot = PlayerEquipment.Hands;
      break;
    case TV_CLOAK:
      slot = PlayerEquipment.Outer;
      break;
    case TV_HELM:
      slot = PlayerEquipment.Head;
      break;
    case TV_SHIELD:
      slot = PlayerEquipment.Arm;
      break;
    case TV_HARD_ARMOR:
    case TV_SOFT_ARMOR:
      slot = PlayerEquipment.Body;
      break;
    case TV_AMULET:
      slot = PlayerEquipment.Neck;
      break;
    case TV_RING:
      if (playerRightHandRingEmpty()) {
        slot = PlayerEquipment.Right;
      } else if (playerLeftHandRingEmpty()) {
        slot = PlayerEquipment.Left;
      } else {
        slot = await requestPutRingOnWhichHand();
      }
      break;
    default:
      await printMessage("IMPOSSIBLE: I don't see how you can use that.");
      break;
  }

  return slot;
}

async function inventoryItemIsCursedMessage(itemId: number): Promise<void> {
  const description = ref('');
  itemDescription(description, py.inventory[itemId], false);

  let msg = sprintf('The %s you are ', description.v);

  if (itemId === PlayerEquipment.Head) {
    msg += 'wielding ';
  } else {
    msg += 'wearing ';
  }

  msg += 'appears to be cursed.';
  await printMessage(msg);
}

// Get its place in the equipment list.
async function executeRemoveItemCommand(selecting: boolean, itemId: number, command: Ref<string>, which: string, prompt: string): Promise<boolean> {
  let itemIdToTakeOff = itemId;
  itemId = 21;

  do {
    itemId++;
    if (py.inventory[itemId].category_id !== TV_NOTHING) {
      itemIdToTakeOff--;
    }
  } while (itemIdToTakeOff >= 0);

  if (isupper(which) && !(await verifyAction(prompt, itemId))) {
    itemId = -1;
  } else if (inventoryItemIsCursed(py.inventory[itemId])) {
    itemId = -1;
    await printMessage('Hmmm, it seems to be cursed.');
  } else if (command.v === 't' && !inventoryCanCarryItemCount(py.inventory[itemId])) {
    if (dg.floor[py.pos.y][py.pos.x].treasure_id !== 0) {
      itemId = -1;
      await printMessage("You can't carry it.");
    } else if (await getInputConfirmation("You can't carry it.  Drop it?")) {
      command.v = 'r';
    } else {
      itemId = -1;
    }
  }

  if (itemId >= 0) {
    if (command.v === 'r') {
      await inventoryDropItem(itemId, true);
      // As a safety measure, set the player's inven
      // weight to 0, when the last object is dropped.
      if (py.pack.unique_items === 0 && py.equipment_count === 0) {
        py.pack.weight = 0;
      }
    } else {
      await playerTakeOff(itemId, inventoryCarryItem(py.inventory[itemId]));
    }

    await playerStrength();
    game.player_free_turn = false;

    if (command.v === 'r') {
      selecting = false;
    }
  }

  return selecting;
}

// Wearing. Go to a bit of trouble over replacing existing equipment.
async function executeWearItemCommand(itemId: number, which: string, prompt: string): Promise<void> {
  let slot = 0;

  if (isupper(which) && !(await verifyAction(prompt, itemId))) {
    itemId = -1;
  } else {
    slot = await inventoryGetSlotToWearEquipment(py.inventory[itemId].category_id);
    if (slot === -1) {
      itemId = -1;
    }
  }

  if (itemId >= 0 && py.inventory[slot].category_id !== TV_NOTHING) {
    if (inventoryItemIsCursed(py.inventory[slot])) {
      await inventoryItemIsCursedMessage(slot);
      itemId = -1;
    } else if (py.inventory[itemId].sub_category_id === ITEM_GROUP_MIN && py.inventory[itemId].items_count > 1 && !inventoryCanCarryItemCount(py.inventory[slot])) {
      // this can happen if try to wield a torch,
      // and have more than one in inventory
      await printMessage('You will have to drop something first.');
      itemId = -1;
    }
  }

  if (itemId === -1) {
    return;
  }

  // OK. Wear it.
  game.player_free_turn = false;

  //
  // 1. remove new item from inventory
  //
  const savedItem = py.inventory[itemId].clone();
  let item = savedItem;

  game.screen.wear_high_id--;

  // Fix for torches
  if (item.items_count > 1 && item.sub_category_id <= ITEM_SINGLE_STACK_MAX) {
    item.items_count = 1;
    game.screen.wear_high_id++;
  }

  py.pack.weight += item.weight * item.items_count;
  inventoryDestroyItem(itemId); // Subtracts weight

  //
  // 2. add old item to inv and remove from equipment list, if necessary.
  //
  item = py.inventory[slot];
  if (item.category_id !== TV_NOTHING) {
    const uniqItems = py.pack.unique_items;

    const id = inventoryCarryItem(item);

    // If item removed did not stack with anything
    // in inventory, then increment wear_high.
    if (py.pack.unique_items !== uniqItems) {
      game.screen.wear_high_id++;
    }

    await playerTakeOff(slot, id);
  }

  //
  // 3. wear new item
  //
  item.assign(savedItem);
  py.equipment_count++;

  await playerAdjustBonusesForItem(item, 1);

  let text: string;
  if (slot === PlayerEquipment.Wield) {
    text = 'You are wielding';
  } else if (slot === PlayerEquipment.Light) {
    text = 'Your light source is';
  } else {
    text = 'You are wearing';
  }

  const description = ref('');
  itemDescription(description, item, true);

  // Get the right equipment letter.
  let itemIdToTakeOff = PlayerEquipment.Wield as number;
  itemId = 0;

  while (itemIdToTakeOff !== slot) {
    if (py.inventory[itemIdToTakeOff++].category_id !== TV_NOTHING) {
      itemId++;
    }
  }

  const msg = sprintf('%s %s (%c)', text, description.v, chr(97 + itemId)); // 'a' + itemId
  await printMessage(msg);

  // this is a new weapon, so clear heavy flag
  if (slot === PlayerEquipment.Wield) {
    py.weapon_is_heavy = false;
  }
  await playerStrength();

  if (inventoryItemIsCursed(item)) {
    await printMessage('Oops! It feels deathly cold!');
    itemAppendToInscription(item, config.identification.ID_DAMD);

    // To force a cost of 0, even if unidentified.
    item.cost = -1;
  }
}

async function executeDropItemCommand(itemId: number, which: string, prompt: string): Promise<void> {
  let confirmed = -1;

  if (py.inventory[itemId].items_count > 1) {
    const description = ref('');
    itemDescription(description, py.inventory[itemId], true);
    description.v = description.v.slice(0, description.v.length - 1) + '?'; // replace period with question

    let msg = sprintf('Drop all %s', description.v);
    // msg[strlen(description) - 1] = '.': the original writes the period at the position the
    // question mark has in `description`, not in `msg` (a stray '.' inside the prompt)
    const at = description.v.length - 1;
    msg = msg.slice(0, at) + '.' + msg.slice(at + 1);

    // request command from player
    confirmed = await getInputConfirmationWithAbort(0, msg);
    // if aborted
    if (confirmed === -1) {
      itemId = -1;
    }
  } else if (isupper(which) && !(await verifyAction(prompt, itemId))) {
    itemId = -1;
  }

  if (itemId >= 0) {
    game.player_free_turn = false;

    await inventoryDropItem(itemId, confirmed === 1);
    await playerStrength();
  }

  // As a safety measure, set the player's inven weight
  // to 0, when the last object is dropped.
  if (py.pack.unique_items === 0 && py.equipment_count === 0) {
    py.pack.weight = 0;
  }
}

async function selectItemCommands(command: Ref<string>, which: Ref<string>, selecting: boolean): Promise<boolean> {
  let fromLine = 0;
  let toLine = 0;
  let prompt = '';
  let swap: string;

  while (selecting && game.player_free_turn) {
    swap = '';

    if (command.v === 'w') {
      fromLine = game.screen.wear_low_id;
      toLine = game.screen.wear_high_id;
      prompt = 'Wear/Wield';
    } else {
      fromLine = 0;
      if (command.v === 'd') {
        toLine = py.pack.unique_items - 1;
        prompt = 'Drop';

        if (py.equipment_count > 0) {
          swap = ', / for Equip';
        }
      } else {
        toLine = py.equipment_count - 1;

        if (command.v === 't') {
          prompt = 'Take off';
        } else {
          // command == 'r'

          prompt = 'Throw off';
          if (py.pack.unique_items > 0) {
            swap = ', / for Inven';
          }
        }
      }
    }

    if (fromLine > toLine) {
      selecting = false;
      continue;
    }

    const headingMsg = buildCommandHeading(fromLine, toLine, swap, command.v, prompt);

    // Abort everything.
    if (!(await getCommand(headingMsg, which))) {
      which.v = ESCAPE;
      selecting = false;
      continue;
    }

    // Draw the screen and maybe exit toLine main prompt.
    if (which.v === ' ' || which.v === '*') {
      await changeScreenForCommand(command.v);
      if (which.v === ' ') {
        selecting = false;
      }
      continue;
    }

    // Swap screens (for drop)
    if (which.v === '/' && (swap.length !== 0)) {
      if (command.v === 'd') {
        command.v = 'r';
      } else {
        command.v = 'd';
      }
      await flipInventoryEquipmentScreens();
      continue;
    }

    // look for item whose inscription matches "which"
    const itemId = inventoryGetItemMatchingInscription(which.v, command.v, fromLine, toLine);
    if (itemId < fromLine || itemId > toLine) {
      await terminalBellSound();
      continue;
    }

    //
    // Found an item - do something with it!
    //
    if (command.v === 'r' || command.v === 't') {
      // Get its place in the equipment list.
      selecting = await executeRemoveItemCommand(selecting, itemId, command, which.v, prompt);
    } else if (command.v === 'w') {
      await executeWearItemCommand(itemId, which.v, prompt);
    } else {
      // command == 'd'
      await executeDropItemCommand(itemId, which.v, prompt);
      selecting = false;
    }

    if (!game.player_free_turn && game.screen.current_screen_id === Screen.Blank) {
      selecting = false;
    }
  }

  return selecting;
}

// Put an appropriate header message (on message line).
async function inventoryDisplayAppropriateHeader(): Promise<void> {
  if (game.screen.current_screen_id === Screen.Inventory) {
    let msg: string;
    const weightQuotient = idiv(py.pack.weight, 10);
    const weightRemainder = py.pack.weight % 10;

    if (!config.options.show_inventory_weights || py.pack.unique_items === 0) {
      msg = sprintf('You are carrying %d.%d pounds. In your pack there is %s', weightQuotient, weightRemainder, (py.pack.unique_items === 0 ? 'nothing.' : '-'));
    } else {
      const capacityQuotient = idiv(playerCarryingLoadLimit(), 10);
      const capacityRemainder = playerCarryingLoadLimit() % 10;

      msg = sprintf('You are carrying %d.%d pounds. Your capacity is %d.%d pounds. In your pack is -', weightQuotient, weightRemainder, capacityQuotient, capacityRemainder);
    }

    await putStringClearToEOL(msg, { y: 0, x: 0 });
  } else if (game.screen.current_screen_id === Screen.Wear) {
    if (game.screen.wear_high_id < game.screen.wear_low_id) {
      await putStringClearToEOL('You have nothing you could wield.', { y: 0, x: 0 });
    } else {
      await putStringClearToEOL('You could wield -', { y: 0, x: 0 });
    }
  } else if (game.screen.current_screen_id === Screen.Equipment) {
    if (py.equipment_count === 0) {
      await putStringClearToEOL('You are not using anything.', { y: 0, x: 0 });
    } else {
      await putStringClearToEOL('You are using -', { y: 0, x: 0 });
    }
  } else {
    await putStringClearToEOL('Allowed commands:', { y: 0, x: 0 });
  }

  await eraseLine({ y: game.screen.screen_bottom_pos, x: game.screen.screen_left_pos });
}

async function uiCommandDisplayInventory(): Promise<void> {
  if (py.pack.unique_items === 0) {
    await printMessage('You are not carrying anything.');
  } else {
    await uiCommandSwitchScreen(Screen.Inventory);
  }
}

async function uiCommandDisplayEquipment(): Promise<void> {
  if (py.equipment_count === 0) {
    await printMessage('You are not using any equipment.');
  } else {
    await uiCommandSwitchScreen(Screen.Equipment);
  }
}

// This does all the work.
export async function inventoryExecuteCommand(command_in: string): Promise<void> {
  const command = ref(command_in);

  game.player_free_turn = true;

  terminalSaveScreen();

  let recoverScreen = false;
  if (command.v === ' ') {
    recoverScreen = true;
  }
  await requestAndShowInventoryScreen(recoverScreen);

  do {
    if (isupper(command.v)) {
      command.v = tolower(command.v);
    }

    // Simple command getting and screen selection.
    let selecting = false;
    switch (command.v) {
      case 'i':
        await uiCommandDisplayInventory();
        break;
      case 'e':
        await uiCommandDisplayEquipment();
        break;
      case 't':
        selecting = await uiCommandInventoryTakeOffItem(selecting);
        break;
      case 'd':
        selecting = await uiCommandInventoryDropItem(command, selecting);
        break;
      case 'w':
        selecting = await uiCommandInventoryWearWieldItem(selecting);
        break;
      case 'x':
        await uiCommandInventoryUnwieldItem();
        break;
      case '?':
        await uiCommandSwitchScreen(Screen.Help);
        break;
      case ' ':
        // Dummy command to return again to main prompt.
        break;
      default:
        // Nonsense command
        await terminalBellSound();
        break;
    }

    // Clear the game.doing_inventory_command flag here, instead of at beginning, so that
    // can use it to control when messages above appear.
    game.doing_inventory_command = '\0';

    // Keep looking for objects to drop/wear/take off/throw off
    const which = ref('z');

    selecting = await selectItemCommands(command, which, selecting);

    if (which.v === ESCAPE || game.screen.current_screen_id === Screen.Blank) {
      command.v = ESCAPE;
    } else if (!game.player_free_turn) {
      // Save state for recovery if they want to call us again next turn.
      // Otherwise, set a dummy command to recover screen.
      if (selecting) {
        game.doing_inventory_command = command.v;
      } else {
        game.doing_inventory_command = ' ';
      }

      // flush last message before clearing screen_has_changed and exiting
      await printMessage(null);

      // This lets us know if the world changes
      globals.screen_has_changed = false;

      command.v = ESCAPE;
    } else {
      await inventoryDisplayAppropriateHeader();

      putString('e/i/t/w/x/d/?/ESC:', { y: game.screen.screen_bottom_pos, x: 60 });
      command.v = await getKeyInput();

      await eraseLine({ y: game.screen.screen_bottom_pos, x: game.screen.screen_left_pos });
    }
  } while (command.v !== ESCAPE);

  if (game.screen.current_screen_id !== Screen.Blank) {
    terminalRestoreScreen();
  }

  playerRecalculateBonuses();
}

// enum class PackMenu
const PackMenu = {
  CloseMenu: 0,
  Equipment: 1,
  Inventory: 2,
} as const;

// Switch between Equipment/Inventory menu.
// Returns true when menu has changed
async function inventorySwitchPackMenu(prompt: string, menu: Ref<number>, menuActive: boolean, itemIdEnd: Ref<number>): Promise<boolean> {
  if (menu.v === PackMenu.Inventory) {
    let changed = false;

    if (py.equipment_count === 0) {
      await putStringClearToEOL("But you're not using anything -more-", { y: 0, x: 0 });
      await getKeyInput();
    } else {
      menu.v = PackMenu.Equipment;
      changed = true;

      if (menuActive) {
        itemIdEnd.v = py.equipment_count;

        while (itemIdEnd.v < py.pack.unique_items) {
          itemIdEnd.v++;
          await eraseLine({ y: itemIdEnd.v, x: 0 });
        }
      }
      itemIdEnd.v = py.equipment_count - 1;
    }

    await putStringClearToEOL(prompt, { y: 0, x: 0 });
    return changed;
  }

  if (py.pack.unique_items === 0) {
    await putStringClearToEOL("But you're not carrying anything -more-", { y: 0, x: 0 });
    await getKeyInput();
    return false;
  }

  menu.v = PackMenu.Inventory;
  if (menuActive) {
    itemIdEnd.v = py.pack.unique_items;

    while (itemIdEnd.v < py.equipment_count) {
      itemIdEnd.v++;
      await eraseLine({ y: itemIdEnd.v, x: 0 });
    }
  }
  itemIdEnd.v = py.pack.unique_items - 1;
  return true;
}

// Get the ID of an item and return the CTR value of it -RAK-
export async function inventoryGetInputForItemId(commandKeyId: Ref<number>, prompt: string, itemIdStart: number, itemIdEnd: number, mask: readonly number[] | null, message: string | null): Promise<boolean> {
  const menu = ref<number>(PackMenu.Inventory);
  const itemEnd = ref(itemIdEnd);
  let packFull = false;

  if (itemEnd.v > PlayerEquipment.Wield) {
    packFull = true;

    if (py.pack.unique_items === 0) {
      menu.v = PackMenu.Equipment;
      itemEnd.v = py.equipment_count - 1;
    } else {
      itemEnd.v = py.pack.unique_items - 1;
    }
  }

  if (py.pack.unique_items < 1 && (!packFull || py.equipment_count < 1)) {
    await putStringClearToEOL('You are not carrying anything.', { y: 0, x: 0 });
    return false;
  }

  commandKeyId.v = 0;

  let itemFound = false;
  let menuActive = false;

  do {
    if (menuActive) {
      if (menu.v === PackMenu.Inventory) {
        await displayInventoryItems(itemIdStart, itemEnd.v, false, 80, mask);
      } else {
        await displayEquipment(false, 80);
      }
    }

    let description: string;

    if (packFull) {
      description = sprintf(
        '(%s: %c-%c,%s%s / for %s, or ESC) %s',
        (menu.v === PackMenu.Inventory ? 'Inven' : 'Equip'),
        chr(itemIdStart + 97), // + 'a'
        chr(itemEnd.v + 97), // + 'a'
        (menu.v === PackMenu.Inventory ? ' 0-9,' : ''),
        (menuActive ? '' : ' * to see,'),
        (menu.v === PackMenu.Inventory ? 'Equip' : 'Inven'),
        prompt,
      );
    } else {
      description = sprintf(
        '(Items %c-%c,%s%s ESC to exit) %s',
        chr(itemIdStart + 97), // + 'a'
        chr(itemEnd.v + 97), // + 'a'
        (menu.v === PackMenu.Inventory ? ' 0-9,' : ''),
        (menuActive ? '' : ' * for inventory list,'),
        prompt,
      );
    }

    await putStringClearToEOL(description, { y: 0, x: 0 });

    let done = false;
    while (!done) {
      const which = await getKeyInput();

      switch (which) {
        case ESCAPE:
          menu.v = PackMenu.CloseMenu;
          done = true;
          game.player_free_turn = true;
          break;
        case '/':
          done = await inventorySwitchPackMenu(description, menu, menuActive, itemEnd);

          break;
        case '*': // activate menu if required
          if (!menuActive) {
            done = true;
            terminalSaveScreen();
            menuActive = true;
          }
          break;
        default:
          // look for item whose inscription matches "which"
          if (which >= '0' && which <= '9' && menu.v !== PackMenu.Equipment) {
            let m: number;

            // Note: loop to find the inventory item
            // (inscription[0] != which || inscription[1] != '\0'): the inscription is not just `which`
            for (m = itemIdStart; m < PlayerEquipment.Wield && py.inventory[m].inscription !== which; m++)
              ;

            if (m < PlayerEquipment.Wield) {
              commandKeyId.v = m;
            } else {
              commandKeyId.v = -1;
            }
          } else if (isupper(which)) {
            commandKeyId.v = ord(which) - 65; // which - 'A'
          } else {
            // which - 'a' (which is a signed char in C)
            commandKeyId.v = (ord(which) >= 128 ? ord(which) - 256 : ord(which)) - 97;
          }

          if (commandKeyId.v >= itemIdStart && commandKeyId.v <= itemEnd.v && (mask === null || (mask[commandKeyId.v] !== 0))) {
            if (menu.v === PackMenu.Equipment) {
              itemIdStart = 21;
              itemEnd.v = commandKeyId.v;

              do {
                // Note: a simple loop to find first inventory item
                itemIdStart++;
                while (py.inventory[itemIdStart].category_id === TV_NOTHING) {
                  itemIdStart++;
                }

                itemEnd.v--;
              } while (itemEnd.v >= 0);

              commandKeyId.v = itemIdStart;
            }

            if (isupper(which) && !(await verifyAction('Try', commandKeyId.v))) {
              menu.v = PackMenu.CloseMenu;
              done = true;

              game.player_free_turn = true;

              break;
            }

            menu.v = PackMenu.CloseMenu;
            done = true;

            itemFound = true;
          } else if (message !== null) {
            await printMessage(message);

            // Set `done` to force redraw of the question.
            done = true;
          } else {
            await terminalBellSound();
          }
          break;
      }
    }
  } while (menu.v !== PackMenu.CloseMenu);

  if (menuActive) {
    terminalRestoreScreen();
  }

  messageLineClear();

  return itemFound;
}
