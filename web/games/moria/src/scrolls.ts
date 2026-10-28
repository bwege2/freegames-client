// scrolls.cpp: reading scrolls
import { config } from './config.ts';
import { PlayerEquipment, TV_DIGGING, TV_HAFTED, TV_NOTHING, TV_SCROLL1, TV_SCROLL2 } from './constants.ts';
import { maxDiceRoll } from './dice.ts';
import { randomNumber } from './game.ts';
import { dg, game, py } from './globals.ts';
import { getAndClearFirstBit } from './helpers.ts';
import {
  itemDescription, itemIdentify, itemRemoveMagicNaming, itemSetAsTried, itemSetColorlessAsIdentified, itemTypeRemainingCountDescription,
} from './identification.ts';
import { inventoryDestroyItem, inventoryFindRange, inventoryItemRemoveCurse } from './inventory.ts';
import { i16, idiv, ref, type Ref, sprintf } from './libc.ts';
import { monsterSleep } from './monster.ts';
import { monsterSummon, monsterSummonUndead } from './monster_manager.ts';
import { playerAdjustBonusesForItem, playerNoLight, playerRecalculateBonuses, playerTeleport, playerWornItemIsCursed } from './player.ts';
import { playerBless, playerProtectEvil } from './player_magic.ts';
import {
  spellAggravateMonsters, spellCreateFood, spellDarkenArea, spellDestroyAdjacentDoorsTraps, spellDestroyArea, spellDetectInvisibleCreaturesWithinVicinity,
  spellDetectObjectsWithinVicinity, spellDetectSecretDoorssWithinVicinity, spellDetectTrapsWithinVicinity, spellDetectTreasureWithinVicinity,
  spellDispelCreature, spellEnchantItem, spellGenocide, spellIdentifyItem, spellLightArea, spellMapCurrentArea, spellMassGenocide,
  spellRechargeItem, spellRemoveCurseFromAllWornItems, spellSurroundPlayerWithDoors, spellSurroundPlayerWithTraps, spellWardingGlyph,
} from './spells.ts';
import type { Coord_t } from './structs.ts';
import { displayCharacterExperience } from './ui.ts';
import { inventoryGetInputForItemId } from './ui_inventory.ts';
import { printMessage } from './ui_io.ts';

// Note: naming of all the scroll functions needs verifying -MRC-

async function playerCanReadScroll(item_pos_start: Ref<number>, item_pos_end: Ref<number>): Promise<boolean> {
  if (py.flags.blind > 0) {
    await printMessage("You can't see to read the scroll.");
    return false;
  }

  if (playerNoLight()) {
    await printMessage('You have no light to read by.');
    return false;
  }

  if (py.flags.confused > 0) {
    await printMessage('You are too confused to read a scroll.');
    return false;
  }

  if (py.pack.unique_items === 0) {
    await printMessage('You are not carrying anything!');
    return false;
  }

  if (!inventoryFindRange(TV_SCROLL1, TV_SCROLL2, item_pos_start, item_pos_end)) {
    await printMessage('You are not carrying any scrolls!');
    return false;
  }

  return true;
}

function inventoryItemIdOfCursedEquipment(): number {
  let item_count = 0;
  const items: number[] = new Array<number>(6).fill(0);

  if (py.inventory[PlayerEquipment.Body].category_id !== TV_NOTHING) {
    items[item_count] = PlayerEquipment.Body;
    item_count++;
  }
  if (py.inventory[PlayerEquipment.Arm].category_id !== TV_NOTHING) {
    items[item_count] = PlayerEquipment.Arm;
    item_count++;
  }
  if (py.inventory[PlayerEquipment.Outer].category_id !== TV_NOTHING) {
    items[item_count] = PlayerEquipment.Outer;
    item_count++;
  }
  if (py.inventory[PlayerEquipment.Hands].category_id !== TV_NOTHING) {
    items[item_count] = PlayerEquipment.Hands;
    item_count++;
  }
  if (py.inventory[PlayerEquipment.Head].category_id !== TV_NOTHING) {
    items[item_count] = PlayerEquipment.Head;
    item_count++;
  }
  // also enchant boots
  if (py.inventory[PlayerEquipment.Feet].category_id !== TV_NOTHING) {
    items[item_count] = PlayerEquipment.Feet;
    item_count++;
  }

  let item_id = 0;

  if (item_count > 0) {
    item_id = items[randomNumber(item_count) - 1];
  }

  if (playerWornItemIsCursed(PlayerEquipment.Body)) {
    item_id = PlayerEquipment.Body;
  } else if (playerWornItemIsCursed(PlayerEquipment.Arm)) {
    item_id = PlayerEquipment.Arm;
  } else if (playerWornItemIsCursed(PlayerEquipment.Outer)) {
    item_id = PlayerEquipment.Outer;
  } else if (playerWornItemIsCursed(PlayerEquipment.Head)) {
    item_id = PlayerEquipment.Head;
  } else if (playerWornItemIsCursed(PlayerEquipment.Hands)) {
    item_id = PlayerEquipment.Hands;
  } else if (playerWornItemIsCursed(PlayerEquipment.Feet)) {
    item_id = PlayerEquipment.Feet;
  }

  return item_id;
}

async function scrollEnchantWeaponToHit(): Promise<boolean> {
  const item = py.inventory[PlayerEquipment.Wield];

  if (item.category_id === TV_NOTHING) {
    return false;
  }

  const desc = ref('');
  itemDescription(desc, item, false);

  const msg = sprintf('Your %s glows faintly!', desc.v);
  await printMessage(msg);

  const plusses = ref(item.to_hit);
  const enchanted = spellEnchantItem(plusses, 10);
  item.to_hit = plusses.v;
  if (enchanted) {
    inventoryItemRemoveCurse(item);
    playerRecalculateBonuses();
  } else {
    await printMessage('The enchantment fails.');
  }

  return true;
}

async function scrollEnchantWeaponToDamage(): Promise<boolean> {
  const item = py.inventory[PlayerEquipment.Wield];

  if (item.category_id === TV_NOTHING) {
    return false;
  }

  const desc = ref('');
  itemDescription(desc, item, false);

  const msg = sprintf('Your %s glows faintly!', desc.v);
  await printMessage(msg);

  let scroll_type: number;

  if (item.category_id >= TV_HAFTED && item.category_id <= TV_DIGGING) {
    scroll_type = i16(maxDiceRoll(item.damage));
  } else {
    // Bows' and arrows' enchantments should not be
    // limited by their low base damages
    scroll_type = 10;
  }

  const plusses = ref(item.to_damage);
  const enchanted = spellEnchantItem(plusses, scroll_type);
  item.to_damage = plusses.v;
  if (enchanted) {
    inventoryItemRemoveCurse(item);
    playerRecalculateBonuses();
  } else {
    await printMessage('The enchantment fails.');
  }

  return true;
}

async function scrollEnchantItemToAC(): Promise<boolean> {
  const item_id = inventoryItemIdOfCursedEquipment();

  if (item_id <= 0) {
    return false;
  }

  const item = py.inventory[item_id];

  const desc = ref('');
  itemDescription(desc, item, false);

  const msg = sprintf('Your %s glows faintly!', desc.v);
  await printMessage(msg);

  const plusses = ref(item.to_ac);
  const enchanted = spellEnchantItem(plusses, 10);
  item.to_ac = plusses.v;
  if (enchanted) {
    inventoryItemRemoveCurse(item);
    playerRecalculateBonuses();
  } else {
    await printMessage('The enchantment fails.');
  }

  return true;
}

async function scrollIdentifyItem(item_id: number, is_used_up: Ref<boolean>): Promise<number> {
  await printMessage('This is an identify scroll.');

  is_used_up.v = await spellIdentifyItem();

  // The identify may merge objects, causing the identify scroll
  // to move to a different place.  Check for that here.  It can
  // move arbitrarily far if an identify scroll was used on
  // another identify scroll, but it always moves down.
  let item = py.inventory[item_id];
  while (item_id > 0 && (item.category_id !== TV_SCROLL1 || item.flags !== 0x00000008)) {
    item_id--;
    item = py.inventory[item_id];
  }

  return item_id;
}

async function scrollRemoveCurse(): Promise<boolean> {
  if (spellRemoveCurseFromAllWornItems()) {
    await printMessage('You feel as if someone is watching over you.');
    return true;
  }
  return false;
}

async function scrollSummonMonster(): Promise<boolean> {
  let identified = false;
  const coord: Coord_t = { y: 0, x: 0 };

  for (let i = 0; i < randomNumber(3); i++) {
    coord.y = py.pos.y;
    coord.x = py.pos.x;
    // identified |= monsterSummon(coord, false): the call is always made
    const summoned = await monsterSummon(coord, false);
    identified = identified || summoned;
  }

  return identified;
}

function scrollTeleportLevel(): void {
  dg.current_level += (-3) + 2 * randomNumber(2);
  if (dg.current_level < 1) {
    dg.current_level = 1;
  }
  dg.generate_new_level = true;
}

async function scrollConfuseMonster(): Promise<boolean> {
  if (!py.flags.confuse_monster) {
    await printMessage('Your hands begin to glow.');
    py.flags.confuse_monster = true;
    return true;
  }
  return false;
}

async function scrollEnchantWeapon(): Promise<boolean> {
  const item = py.inventory[PlayerEquipment.Wield];

  if (item.category_id === TV_NOTHING) {
    return false;
  }

  const desc = ref('');
  itemDescription(desc, item, false);

  const msg = sprintf('Your %s glows brightly!', desc.v);
  await printMessage(msg);

  let enchanted = false;

  for (let i = 0; i < randomNumber(2); i++) {
    const plusses = ref(item.to_hit);
    const ok = spellEnchantItem(plusses, 10);
    item.to_hit = plusses.v;
    if (ok) {
      enchanted = true;
    }
  }

  let scroll_type: number;

  if (item.category_id >= TV_HAFTED && item.category_id <= TV_DIGGING) {
    scroll_type = i16(maxDiceRoll(item.damage));
  } else {
    // Bows' and arrows' enchantments should not be limited
    // by their low base damages
    scroll_type = 10;
  }

  for (let i = 0; i < randomNumber(2); i++) {
    const plusses = ref(item.to_damage);
    const ok = spellEnchantItem(plusses, scroll_type);
    item.to_damage = plusses.v;
    if (ok) {
      enchanted = true;
    }
  }

  if (enchanted) {
    inventoryItemRemoveCurse(item);
    playerRecalculateBonuses();
  } else {
    await printMessage('The enchantment fails.');
  }

  return true;
}

async function scrollCurseWeapon(): Promise<boolean> {
  const item = py.inventory[PlayerEquipment.Wield];

  if (item.category_id === TV_NOTHING) {
    return false;
  }

  const desc = ref('');
  itemDescription(desc, item, false);

  const msg = sprintf('Your %s glows black, fades.', desc.v);
  await printMessage(msg);

  itemRemoveMagicNaming(item);

  item.to_hit = -randomNumber(5) - randomNumber(5);
  item.to_damage = -randomNumber(5) - randomNumber(5);
  item.to_ac = 0;

  // Must call playerAdjustBonusesForItem() before set (clear) flags, and
  // must call playerRecalculateBonuses() after set (clear) flags, so that
  // all attributes will be properly turned off.
  await playerAdjustBonusesForItem(item, -1);
  item.flags = config.treasure.flags.TR_CURSED;
  playerRecalculateBonuses();

  return true;
}

async function scrollEnchantArmor(): Promise<boolean> {
  const item_id = inventoryItemIdOfCursedEquipment();

  if (item_id <= 0) {
    return false;
  }

  const item = py.inventory[item_id];

  const desc = ref('');
  itemDescription(desc, item, false);

  const msg = sprintf('Your %s glows brightly!', desc.v);
  await printMessage(msg);

  let enchanted = false;

  for (let i = 0; i < randomNumber(2) + 1; i++) {
    const plusses = ref(item.to_ac);
    const ok = spellEnchantItem(plusses, 10);
    item.to_ac = plusses.v;
    if (ok) {
      enchanted = true;
    }
  }

  if (enchanted) {
    inventoryItemRemoveCurse(item);
    playerRecalculateBonuses();
  } else {
    await printMessage('The enchantment fails.');
  }

  return true;
}

async function scrollCurseArmor(): Promise<boolean> {
  let item_id: number;

  if (py.inventory[PlayerEquipment.Body].category_id !== TV_NOTHING && randomNumber(4) === 1) {
    item_id = PlayerEquipment.Body;
  } else if (py.inventory[PlayerEquipment.Arm].category_id !== TV_NOTHING && randomNumber(3) === 1) {
    item_id = PlayerEquipment.Arm;
  } else if (py.inventory[PlayerEquipment.Outer].category_id !== TV_NOTHING && randomNumber(3) === 1) {
    item_id = PlayerEquipment.Outer;
  } else if (py.inventory[PlayerEquipment.Head].category_id !== TV_NOTHING && randomNumber(3) === 1) {
    item_id = PlayerEquipment.Head;
  } else if (py.inventory[PlayerEquipment.Hands].category_id !== TV_NOTHING && randomNumber(3) === 1) {
    item_id = PlayerEquipment.Hands;
  } else if (py.inventory[PlayerEquipment.Feet].category_id !== TV_NOTHING && randomNumber(3) === 1) {
    item_id = PlayerEquipment.Feet;
  } else if (py.inventory[PlayerEquipment.Body].category_id !== TV_NOTHING) {
    item_id = PlayerEquipment.Body;
  } else if (py.inventory[PlayerEquipment.Arm].category_id !== TV_NOTHING) {
    item_id = PlayerEquipment.Arm;
  } else if (py.inventory[PlayerEquipment.Outer].category_id !== TV_NOTHING) {
    item_id = PlayerEquipment.Outer;
  } else if (py.inventory[PlayerEquipment.Head].category_id !== TV_NOTHING) {
    item_id = PlayerEquipment.Head;
  } else if (py.inventory[PlayerEquipment.Hands].category_id !== TV_NOTHING) {
    item_id = PlayerEquipment.Hands;
  } else if (py.inventory[PlayerEquipment.Feet].category_id !== TV_NOTHING) {
    item_id = PlayerEquipment.Feet;
  } else {
    item_id = 0;
  }

  if (item_id <= 0) {
    return false;
  }

  const item = py.inventory[item_id];

  const desc = ref('');
  itemDescription(desc, item, false);

  const msg = sprintf('Your %s glows black, fades.', desc.v);
  await printMessage(msg);

  itemRemoveMagicNaming(item);

  item.flags = config.treasure.flags.TR_CURSED;
  item.to_hit = 0;
  item.to_damage = 0;
  item.to_ac = -randomNumber(5) - randomNumber(5);

  playerRecalculateBonuses();

  return true;
}

async function scrollSummonUndead(): Promise<boolean> {
  let identified = false;
  const coord: Coord_t = { y: 0, x: 0 };

  for (let i = 0; i < randomNumber(3); i++) {
    coord.y = py.pos.y;
    coord.x = py.pos.x;
    // identified |= monsterSummonUndead(coord): the call is always made
    const summoned = await monsterSummonUndead(coord);
    identified = identified || summoned;
  }

  return identified;
}

async function scrollWordOfRecall(): Promise<void> {
  if (py.flags.word_of_recall === 0) {
    py.flags.word_of_recall = 25 + randomNumber(30);
  }
  await printMessage('The air about you becomes charged.');
}

// Scrolls for the reading -RAK-
export async function scrollRead(): Promise<void> {
  game.player_free_turn = true;

  const item_pos_start = ref(0);
  const item_pos_end = ref(0);
  if (!(await playerCanReadScroll(item_pos_start, item_pos_end))) {
    return;
  }

  const item_id = ref(0);
  if (!(await inventoryGetInputForItemId(item_id, 'Read which scroll?', item_pos_start.v, item_pos_end.v, null, null))) {
    return;
  }

  // From here on, no free turn for the player
  game.player_free_turn = false;

  const used_up = ref(true);
  let identified = false;

  let item = py.inventory[item_id.v];
  const item_flags = ref(item.flags);

  while (item_flags.v !== 0) {
    let scroll_type = getAndClearFirstBit(item_flags) + 1;

    if (item.category_id === TV_SCROLL2) {
      scroll_type += 32;
    }

    switch (scroll_type) {
      case 1:
        identified = await scrollEnchantWeaponToHit();
        break;
      case 2:
        identified = await scrollEnchantWeaponToDamage();
        break;
      case 3:
        identified = await scrollEnchantItemToAC();
        break;
      case 4:
        item_id.v = await scrollIdentifyItem(item_id.v, used_up);
        identified = true;
        break;
      case 5:
        identified = await scrollRemoveCurse();
        break;
      case 6:
        identified = await spellLightArea(py.pos);
        break;
      case 7:
        identified = await scrollSummonMonster();
        break;
      case 8:
        await playerTeleport(10); // Teleport Short, aka Phase Door
        identified = true;
        break;
      case 9:
        await playerTeleport(100); // Teleport Long
        identified = true;
        break;
      case 10:
        scrollTeleportLevel();
        identified = true;
        break;
      case 11:
        identified = await scrollConfuseMonster();
        break;
      case 12:
        await spellMapCurrentArea();
        identified = true;
        break;
      case 13:
        identified = await monsterSleep({ y: py.pos.y, x: py.pos.x });
        break;
      case 14:
        await spellWardingGlyph();
        identified = true;
        break;
      case 15:
        identified = spellDetectTreasureWithinVicinity();
        break;
      case 16:
        identified = spellDetectObjectsWithinVicinity();
        break;
      case 17:
        identified = spellDetectTrapsWithinVicinity();
        break;
      case 18:
        identified = spellDetectSecretDoorssWithinVicinity();
        break;
      case 19:
        await printMessage('This is a mass genocide scroll.');
        void spellMassGenocide();
        identified = true;
        break;
      case 20:
        identified = await spellDetectInvisibleCreaturesWithinVicinity();
        break;
      case 21:
        await printMessage('There is a high pitched humming noise.');
        void (await spellAggravateMonsters(20));
        identified = true;
        break;
      case 22:
        identified = await spellSurroundPlayerWithTraps();
        break;
      case 23:
        identified = await spellDestroyAdjacentDoorsTraps();
        break;
      case 24:
        identified = await spellSurroundPlayerWithDoors();
        break;
      case 25:
        await printMessage('This is a Recharge-Item scroll.');
        used_up.v = await spellRechargeItem(60);
        identified = true;
        break;
      case 26:
        await printMessage('This is a genocide scroll.');
        void (await spellGenocide());
        identified = true;
        break;
      case 27:
        identified = await spellDarkenArea(py.pos);
        break;
      case 28:
        identified = playerProtectEvil();
        break;
      case 29:
        await spellCreateFood();
        identified = true;
        break;
      case 30:
        identified = await spellDispelCreature(config.monsters.defense.CD_UNDEAD, 60);
        break;
      case 33:
        identified = await scrollEnchantWeapon();
        break;
      case 34:
        identified = await scrollCurseWeapon();
        break;
      case 35:
        identified = await scrollEnchantArmor();
        break;
      case 36:
        identified = await scrollCurseArmor();
        break;
      case 37:
        identified = await scrollSummonUndead();
        break;
      case 38:
        playerBless(randomNumber(12) + 6);
        identified = true;
        break;
      case 39:
        playerBless(randomNumber(24) + 12);
        identified = true;
        break;
      case 40:
        playerBless(randomNumber(48) + 24);
        identified = true;
        break;
      case 41:
        await scrollWordOfRecall();
        identified = true;
        break;
      case 42:
        await spellDestroyArea(py.pos);
        identified = true;
        break;
      default:
        await printMessage('Internal error in scroll()');
        break;
    }
  }

  item = py.inventory[item_id.v];

  if (identified) {
    if (!itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
      // round half-way case up
      py.misc.exp += idiv(item.depth_first_found + (py.misc.level >> 1), py.misc.level);
      await displayCharacterExperience();

      await itemIdentify(py.inventory[item_id.v], item_id);
    }
  } else if (!itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
    itemSetAsTried(item);
  }

  if (used_up.v) {
    await itemTypeRemainingCountDescription(item_id.v);
    inventoryDestroyItem(item_id.v);
  }
}
