// wizard.cpp: Version history and info, and wizard mode debugging aids.
import { config } from './config.ts';
import { MAX_CAVE_FLOOR, PlayerAttr, SHRT_MAX } from './constants.ts';
import { coordInBounds, dungeonDeleteObject, dungeonPlaceRandomObjectNear } from './dungeon.ts';
import { randomNumber } from './game.ts';
import { popt } from './game_objects.ts';
import { dg, game, py } from './globals.ts';
import { stringToNumber } from './helpers.ts';
import { itemIdentify, itemReplaceInscription } from './identification.ts';
import { ord, ref, type Ref, sprintf } from './libc.ts';
import { inventoryItemCopyTo } from './inventory.ts';
import { monsterSummon } from './monster_manager.ts';
import { updateMonsters } from './monster.ts';
import { playerChangeSpeed } from './player.ts';
import { playerCureBlindness, playerCureConfusion, playerCurePoison, playerRemoveFear } from './player_magic.ts';
import { playerStatRestore } from './player_stats.ts';
import { spellRemoveCurseFromAllWornItems } from './spells.ts';
import { Inventory_t } from './structs.ts';
import { magicTreasureMagicalAbility } from './treasure.ts';
import {
  displayCharacterExperience, drawDungeonPanel, printCharacterCurrentHitPoints, printCharacterCurrentMana, printCharacterGoldValue,
  printCharacterMaxHitPoints, printCharacterSpeed,
} from './ui.ts';
import { getCommand, getInputConfirmation, getStringInput, messageLineClear, printMessage, putStringClearToEOL } from './ui_io.ts';

// lets anyone enter wizard mode after a disclaimer... -JEW-
export async function enterWizardMode(): Promise<boolean> {
  let answer = false;

  if (game.noscore === 0) {
    await printMessage('Wizard mode is for debugging and experimenting.');
    answer = await getInputConfirmation('The game will not be scored if you enter wizard mode. Are you sure?');
  }

  if (game.noscore !== 0 || answer) {
    game.noscore |= 0x2;
    game.wizard_mode = true;
    return true;
  }

  return false;
}

export async function wizardCureAll(): Promise<void> {
  spellRemoveCurseFromAllWornItems();
  playerCureBlindness();
  playerCureConfusion();
  playerCurePoison();
  playerRemoveFear();
  await playerStatRestore(PlayerAttr.A_STR);
  await playerStatRestore(PlayerAttr.A_INT);
  await playerStatRestore(PlayerAttr.A_WIS);
  await playerStatRestore(PlayerAttr.A_CON);
  await playerStatRestore(PlayerAttr.A_DEX);
  await playerStatRestore(PlayerAttr.A_CHR);

  if (py.flags.slow > 1) {
    py.flags.slow = 1;
  }
  if (py.flags.image > 1) {
    py.flags.image = 1;
  }
}

// Generate random items
export async function wizardDropRandomItems(): Promise<void> {
  let i: number;

  if (game.command_count > 0) {
    i = game.command_count;
    game.command_count = 0;
  } else {
    i = 1;
  }
  await dungeonPlaceRandomObjectNear(py.pos, i);

  await drawDungeonPanel();
}

// Go up/down to specified depth
export async function wizardJumpLevel(): Promise<void> {
  const i = ref(0);

  if (game.command_count > 0) {
    if (game.command_count > 99) {
      i.v = 0;
    } else {
      i.v = game.command_count;
    }
    game.command_count = 0;
  } else {
    i.v = -1;
    const input = ref('');

    await putStringClearToEOL('Go to which level (0-99) ? ', { y: 0, x: 0 });

    if (await getStringInput(input, { y: 0, x: 27 }, 10)) {
      stringToNumber(input.v, i);
    }
  }

  if (i.v >= 0) {
    dg.current_level = i.v;
    if (dg.current_level > 99) {
      dg.current_level = 99;
    }
    dg.generate_new_level = true;
  } else {
    messageLineClear();
  }
}

// Increase Experience
export async function wizardGainExperience(): Promise<void> {
  if (game.command_count > 0) {
    py.misc.exp = game.command_count;
    game.command_count = 0;
  } else if (py.misc.exp === 0) {
    py.misc.exp = 1;
  } else {
    py.misc.exp = py.misc.exp * 2;
  }
  await displayCharacterExperience();
}

// Summon a random monster
export async function wizardSummonMonster(): Promise<void> {
  const coord = { y: py.pos.y, x: py.pos.x };

  await monsterSummon(coord, true);

  await updateMonsters(false);
}

// Light up the dungeon -RAK-
export async function wizardLightUpDungeon(): Promise<void> {
  const flag = !dg.floor[py.pos.y][py.pos.x].permanent_light;

  for (let y = 0; y < dg.height; y++) {
    for (let x = 0; x < dg.width; x++) {
      if (dg.floor[y][x].feature_id <= MAX_CAVE_FLOOR) {
        for (let yy = y - 1; yy <= y + 1; yy++) {
          for (let xx = x - 1; xx <= x + 1; xx++) {
            dg.floor[yy][xx].permanent_light = flag;
            if (!flag) {
              dg.floor[yy][xx].field_mark = false;
            }
          }
        }
      }
    }
  }

  await drawDungeonPanel();
}

// Wizard routine for gaining on stats -RAK-
export async function wizardCharacterAdjustment(): Promise<void> {
  const number = ref(0);
  const input = ref('');

  await putStringClearToEOL('(3 - 118) Strength     = ', { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: 25 }, 3)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > 2 && number.v < 119) {
      py.stats.max[PlayerAttr.A_STR] = number.v;
      await playerStatRestore(PlayerAttr.A_STR);
    }
  } else {
    return;
  }

  await putStringClearToEOL('(3 - 118) Intelligence = ', { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: 25 }, 3)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > 2 && number.v < 119) {
      py.stats.max[PlayerAttr.A_INT] = number.v;
      await playerStatRestore(PlayerAttr.A_INT);
    }
  } else {
    return;
  }

  await putStringClearToEOL('(3 - 118) Wisdom       = ', { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: 25 }, 3)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > 2 && number.v < 119) {
      py.stats.max[PlayerAttr.A_WIS] = number.v;
      await playerStatRestore(PlayerAttr.A_WIS);
    }
  } else {
    return;
  }

  await putStringClearToEOL('(3 - 118) Dexterity    = ', { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: 25 }, 3)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > 2 && number.v < 119) {
      py.stats.max[PlayerAttr.A_DEX] = number.v;
      await playerStatRestore(PlayerAttr.A_DEX);
    }
  } else {
    return;
  }

  await putStringClearToEOL('(3 - 118) Constitution = ', { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: 25 }, 3)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > 2 && number.v < 119) {
      py.stats.max[PlayerAttr.A_CON] = number.v;
      await playerStatRestore(PlayerAttr.A_CON);
    }
  } else {
    return;
  }

  await putStringClearToEOL('(3 - 118) Charisma     = ', { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: 25 }, 3)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > 2 && number.v < 119) {
      py.stats.max[PlayerAttr.A_CHR] = number.v;
      await playerStatRestore(PlayerAttr.A_CHR);
    }
  } else {
    return;
  }

  await putStringClearToEOL('(1 - 32767) Hit points = ', { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: 25 }, 5)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > 0 && number.v <= SHRT_MAX) {
      py.misc.max_hp = number.v;
      py.misc.current_hp = number.v;
      py.misc.current_hp_fraction = 0;
      printCharacterMaxHitPoints();
      printCharacterCurrentHitPoints();
    }
  } else {
    return;
  }

  await putStringClearToEOL('(0 - 32767) Mana       = ', { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: 25 }, 5)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > -1 && number.v <= SHRT_MAX) {
      py.misc.mana = number.v;
      py.misc.current_mana = number.v;
      py.misc.current_mana_fraction = 0;
      printCharacterCurrentMana();
    }
  } else {
    return;
  }

  input.v = sprintf('Current=%d  Gold = ', py.misc.au);
  number.v = input.v.length;
  await putStringClearToEOL(input.v, { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: number.v }, 7)) {
    const new_gold = ref(0);
    const valid_number = stringToNumber(input.v, new_gold);
    if (valid_number && new_gold.v > -1) {
      py.misc.au = new_gold.v;
      printCharacterGoldValue();
    }
  } else {
    return;
  }

  input.v = sprintf('Current=%d  (0-200) Searching = ', py.misc.chance_in_search);
  number.v = input.v.length;
  await putStringClearToEOL(input.v, { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: number.v }, 3)) {
    const new_gold = ref(0);
    const valid_number = stringToNumber(input.v, new_gold);
    if (valid_number && number.v > -1 && number.v < 201) {
      py.misc.chance_in_search = number.v;
    }
  } else {
    return;
  }

  input.v = sprintf('Current=%d  (-1-18) Stealth = ', py.misc.stealth_factor);
  number.v = input.v.length;
  await putStringClearToEOL(input.v, { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: number.v }, 3)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > -2 && number.v < 19) {
      py.misc.stealth_factor = number.v;
    }
  } else {
    return;
  }

  input.v = sprintf('Current=%d  (0-200) Disarming = ', py.misc.disarm);
  number.v = input.v.length;
  await putStringClearToEOL(input.v, { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: number.v }, 3)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > -1 && number.v < 201) {
      py.misc.disarm = number.v;
    }
  } else {
    return;
  }

  input.v = sprintf('Current=%d  (0-100) Save = ', py.misc.saving_throw);
  number.v = input.v.length;
  await putStringClearToEOL(input.v, { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: number.v }, 3)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > -1 && number.v < 201) {
      py.misc.saving_throw = number.v;
    }
  } else {
    return;
  }

  input.v = sprintf('Current=%d  (0-200) Base to hit = ', py.misc.bth);
  number.v = input.v.length;
  await putStringClearToEOL(input.v, { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: number.v }, 3)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > -1 && number.v < 201) {
      py.misc.bth = number.v;
    }
  } else {
    return;
  }

  input.v = sprintf('Current=%d  (0-200) Bows/Throwing = ', py.misc.bth_with_bows);
  number.v = input.v.length;
  await putStringClearToEOL(input.v, { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: number.v }, 3)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > -1 && number.v < 201) {
      py.misc.bth_with_bows = number.v;
    }
  } else {
    return;
  }

  input.v = sprintf('Current=%d  Weight = ', py.misc.weight);
  number.v = input.v.length;
  await putStringClearToEOL(input.v, { y: 0, x: 0 });
  if (await getStringInput(input, { y: 0, x: number.v }, 3)) {
    const valid_number = stringToNumber(input.v, number);
    if (valid_number && number.v > -1) {
      py.misc.weight = number.v;
    }
  } else {
    return;
  }

  // getCommand() writes the key into input[0]
  const command = ref(input.v.charAt(0));
  while (await getCommand('Alter speed? (+/-)', command)) {
    input.v = command.v + input.v.slice(1);
    if (command.v === '+') {
      playerChangeSpeed(-1);
    } else if (command.v === '-') {
      playerChangeSpeed(1);
    } else {
      break;
    }
    printCharacterSpeed();
  }
}

// Request user input to get the array index of the `game_objects[]`
async function wizardRequestObjectId(id: Ref<number>, label: string, start_id: number, end_id: number): Promise<boolean> {
  const id_str = String(start_id) + '-' + String(end_id);

  const msg = label + ' ID (' + id_str + '): ';
  await putStringClearToEOL(msg, { y: 0, x: 0 });

  const input = ref('');
  if (!(await getStringInput(input, { y: 0, x: msg.length }, 3))) {
    return false;
  }

  const given_id = ref(0);
  if (!stringToNumber(input.v, given_id)) {
    return false;
  }

  if (given_id.v < start_id || given_id.v > end_id) {
    await putStringClearToEOL('Invalid ID. Must be ' + id_str, { y: 0, x: 0 });
    return false;
  }
  id.v = given_id.v;

  return true;
}

// Simplified wizard routine for creating an object
export async function wizardGenerateObject(): Promise<void> {
  const id = ref(0);
  if (!(await wizardRequestObjectId(id, 'Dungeon/Store object', 0, 366))) {
    return;
  }

  const coord = { y: 0, x: 0 };

  for (let i = 0; i < 10; i++) {
    coord.y = py.pos.y - 3 + randomNumber(5);
    coord.x = py.pos.x - 4 + randomNumber(7);

    if (coordInBounds(coord) && dg.floor[coord.y][coord.x].feature_id <= MAX_CAVE_FLOOR && dg.floor[coord.y][coord.x].treasure_id === 0) {
      // delete any object at location, before call popt()
      if (dg.floor[coord.y][coord.x].treasure_id !== 0) {
        dungeonDeleteObject(coord);
      }

      // place the object
      const free_treasure_id = ref(await popt());
      dg.floor[coord.y][coord.x].treasure_id = free_treasure_id.v & 0xff;
      inventoryItemCopyTo(id.v, game.treasure.list[free_treasure_id.v]);
      magicTreasureMagicalAbility(free_treasure_id.v, dg.current_level);

      // auto identify the item
      await itemIdentify(game.treasure.list[free_treasure_id.v], free_treasure_id);

      i = 9;
    }
  }
}

/** sscanf(input, "%lx", &input_number): a hexadecimal number (as strtoul reads it) or no change */
function scanHex(input: string, input_number: Ref<number>): void {
  const m = /^[ \t\n\v\f\r]*([+-]?)(?:0[xX](?=[0-9a-fA-F]))?([0-9a-fA-F]+)/.exec(input);
  if (m === null) {
    return;
  }
  let value = 0;
  for (const c of m[2]) {
    value = (value * 16 + parseInt(c, 16)) % 0x100000000;
  }
  if (m[1] === '-') {
    value = (0x100000000 - value) % 0x100000000;
  }
  input_number.v = value | 0;
}

// Wizard routine for creating objects -RAK-
export async function wizardCreateObjects(): Promise<void> {
  const number = ref(0);
  const input = ref('');

  await printMessage('Warning: This routine can cause a fatal error.');

  const forge = new Inventory_t();
  const item = forge;

  item.id = config.dungeon.objects.OBJ_WIZARD;
  item.special_name_id = 0;
  itemReplaceInscription(item, 'wizard item');
  item.identification = config.identification.ID_KNOWN2 | config.identification.ID_STORE_BOUGHT;

  await putStringClearToEOL('Tval   : ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 9 }, 3))) {
    return;
  }
  if (stringToNumber(input.v, number)) {
    item.category_id = number.v;
  }

  await putStringClearToEOL('Tchar  : ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 9 }, 1))) {
    return;
  }
  item.sprite = ord(input.v.charAt(0));

  await putStringClearToEOL('Subval : ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 9 }, 5))) {
    return;
  }
  if (stringToNumber(input.v, number)) {
    item.sub_category_id = number.v;
  }

  await putStringClearToEOL('Weight : ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 9 }, 5))) {
    return;
  }
  if (stringToNumber(input.v, number)) {
    item.weight = number.v;
  }

  await putStringClearToEOL('Number : ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 9 }, 5))) {
    return;
  }
  if (stringToNumber(input.v, number)) {
    item.items_count = number.v;
  }

  await putStringClearToEOL('Damage (dice): ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 15 }, 3))) {
    return;
  }
  if (stringToNumber(input.v, number)) {
    item.damage.dice = number.v;
  }

  await putStringClearToEOL('Damage (sides): ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 16 }, 3))) {
    return;
  }
  if (stringToNumber(input.v, number)) {
    item.damage.sides = number.v;
  }

  await putStringClearToEOL('+To hit: ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 9 }, 3))) {
    return;
  }
  if (stringToNumber(input.v, number)) {
    item.to_hit = number.v;
  }

  await putStringClearToEOL('+To dam: ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 9 }, 3))) {
    return;
  }
  if (stringToNumber(input.v, number)) {
    item.to_damage = number.v;
  }

  await putStringClearToEOL('AC     : ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 9 }, 3))) {
    return;
  }
  if (stringToNumber(input.v, number)) {
    item.ac = number.v;
  }

  await putStringClearToEOL('+To AC : ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 9 }, 3))) {
    return;
  }
  if (stringToNumber(input.v, number)) {
    item.to_ac = number.v;
  }

  await putStringClearToEOL('P1     : ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 9 }, 5))) {
    return;
  }
  if (stringToNumber(input.v, number)) {
    item.misc_use = number.v;
  }

  await putStringClearToEOL('Flags (In HEX): ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 16 }, 8))) {
    return;
  }

  // can't be constant string, this causes problems with
  // the GCC compiler and some scanf routines.
  // (the original reads "%lx" into an int32_t; its value is uninitialized when nothing is read: 0 here)
  const input_number = ref(0);
  scanHex(input.v, input_number);
  item.flags = input_number.v >>> 0;

  await putStringClearToEOL('Cost : ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 9 }, 8))) {
    return;
  }
  if (stringToNumber(input.v, input_number)) {
    item.cost = input_number.v;
  }

  await putStringClearToEOL('Level : ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 10 }, 3))) {
    return;
  }
  if (stringToNumber(input.v, number)) {
    item.depth_first_found = number.v;
  }

  if (await getInputConfirmation('Allocate?')) {
    // delete object first if any, before call popt()
    const tile = dg.floor[py.pos.y][py.pos.x];

    if (tile.treasure_id !== 0) {
      dungeonDeleteObject(py.pos);
    }

    number.v = await popt();

    game.treasure.list[number.v].assign(forge);
    tile.treasure_id = number.v & 0xff;

    await printMessage('Allocated.');
  } else {
    await printMessage('Aborted.');
  }
}
