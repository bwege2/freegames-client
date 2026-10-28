// identification.cpp: Handle object identification and descriptions
// ...mostly string handling code
import { config } from './config.ts';
import {
  ITEM_SINGLE_STACK_MIN, MAX_AMULETS, MAX_COLORS, MAX_METALS, MAX_MUSHROOMS, MAX_ROCKS, MAX_SYLLABLES, MAX_TITLES, MAX_WOODS,
  PLAYER_INVENTORY_SIZE, SpecialNameIds, TV_AMULET, TV_ARROW, TV_BOLT, TV_BOOTS, TV_BOW, TV_CHEST, TV_CLOAK, TV_CLOSED_DOOR,
  TV_DIGGING, TV_DOWN_STAIR, TV_FLASK, TV_FOOD, TV_GLOVES, TV_GOLD, TV_HAFTED, TV_HARD_ARMOR, TV_HELM, TV_INVIS_TRAP, TV_LIGHT,
  TV_MAGIC_BOOK, TV_MISC, TV_OPEN_DOOR, TV_POLEARM, TV_POTION1, TV_POTION2, TV_PRAYER_BOOK, TV_RING, TV_RUBBLE, TV_SCROLL1,
  TV_SCROLL2, TV_SECRET_DOOR, TV_SHIELD, TV_SLING_AMMO, TV_SOFT_ARMOR, TV_SPIKE, TV_STAFF, TV_STORE_DOOR, TV_SWORD, TV_UP_STAIR,
  TV_VIS_TRAP, TV_WAND,
} from './constants.ts';
import { creatures_list } from './data_creatures.ts';
import { amulets, colors, metals, mushrooms, rocks, syllables, woods } from './data_tables.ts';
import { game_objects, special_item_names } from './data_treasure.ts';
import { randomNumber, seedResetToOldSeed, seedSet } from './game.ts';
import { game, monsters, objects_identified, py } from './globals.ts';
import { insertStringIntoString, isVowel } from './helpers.ts';
import { ref, type Ref, sprintf } from './libc.ts';
import { inventoryItemCopyTo, inventoryItemIsCursed, inventoryItemSingleStackable } from './inventory.ts';
import { recallMonsterAttributes } from './recall.ts';
import { onReset } from './reset.ts';
import type { Inventory_t } from './structs.ts';
import { getStringInput, getTileCharacter, printMessage, putStringClearToEOL } from './ui_io.ts';
import { inventoryGetInputForItemId } from './ui_inventory.ts';

// char magic_item_titles[MAX_TITLES][10]
const magic_item_titles: string[] = new Array<string>(MAX_TITLES).fill('');

onReset(() => {
  magic_item_titles.fill('');
});

// Identified objects flags: objects_identified (globals.ts)

function objectDescription(command: string): string {
  // every printing ASCII character is listed here, in the
  // order in which they appear in the ASCII character set.
  switch (command) {
    case ' ':
      return '  - An open pit.';
    case '!':
      return '! - A potion.';
    case '"':
      return '" - An amulet, periapt, or necklace.';
    case '#':
      return '# - A stone wall.';
    case '$':
      return '$ - Treasure.';
    case '%':
      if (!config.options.highlight_seams) {
        return '% - Not used.';
      }
      return '% - A magma or quartz vein.';
    case '&':
      return '& - Treasure chest.';
    case "'":
      return "' - An open door.";
    case '(':
      return '( - Soft armor.';
    case ')':
      return ') - A shield.';
    case '*':
      return '* - Gems.';
    case '+':
      return '+ - A closed door.';
    case ',':
      return ', - Food or mushroom patch.';
    case '-':
      return '- - A wand';
    case '.':
      return '. - Floor.';
    case '/':
      return '/ - A pole weapon.';
      //        case '0':
      //            return "0 - Not used.";
    case '1':
      return '1 - Entrance to General Store.';
    case '2':
      return '2 - Entrance to Armory.';
    case '3':
      return '3 - Entrance to Weaponsmith.';
    case '4':
      return '4 - Entrance to Temple.';
    case '5':
      return '5 - Entrance to Alchemy shop.';
    case '6':
      return '6 - Entrance to Magic-Users store.';
      // case '7':
      //     return "7 - Not used.";
      // case '8':
      //     return "8 - Not used.";
      // case '9':
      //     return "9 - Not used.";
    case ':':
      return ': - Rubble.';
    case ';':
      return '; - A loose rock.';
    case '<':
      return '< - An up staircase.';
    case '=':
      return '= - A ring.';
    case '>':
      return '> - A down staircase.';
    case '?':
      return '? - A scroll.';
    case '@':
      return py.misc.name;
    case 'A':
      return 'A - Giant Ant Lion.';
    case 'B':
      return 'B - The Balrog.';
    case 'C':
      return 'C - Gelatinous Cube.';
    case 'D':
      return 'D - An Ancient Dragon (Beware).';
    case 'E':
      return 'E - Elemental.';
    case 'F':
      return 'F - Giant Fly.';
    case 'G':
      return 'G - Ghost.';
    case 'H':
      return 'H - Hobgoblin.';
      // case 'I':
      //     return "I - Invisible Stalker.";
    case 'J':
      return 'J - Jelly.';
    case 'K':
      return 'K - Killer Beetle.';
    case 'L':
      return 'L - Lich.';
    case 'M':
      return 'M - Mummy.';
      // case 'N':
      //     return "N - Not used.";
    case 'O':
      return 'O - Ooze.';
    case 'P':
      return 'P - Giant humanoid.';
    case 'Q':
      return 'Q - Quylthulg (Pulsing Flesh Mound).';
    case 'R':
      return 'R - Reptile.';
    case 'S':
      return 'S - Giant Scorpion.';
    case 'T':
      return 'T - Troll.';
    case 'U':
      return 'U - Umber Hulk.';
    case 'V':
      return 'V - Vampire.';
    case 'W':
      return 'W - Wight or Wraith.';
    case 'X':
      return 'X - Xorn.';
    case 'Y':
      return 'Y - Yeti.';
      // case 'Z':
      //     return "Z - Not used.";
    case '[':
      return '[ - Hard armor.';
    case '\\':
      return '\\ - A hafted weapon.';
    case ']':
      return '] - Misc. armor.';
    case '^':
      return '^ - A trap.';
    case '_':
      return '_ - A staff.';
      // case '`':
      //     return "` - Not used.";
    case 'a':
      return 'a - Giant Ant.';
    case 'b':
      return 'b - Giant Bat.';
    case 'c':
      return 'c - Giant Centipede.';
    case 'd':
      return 'd - Dragon.';
    case 'e':
      return 'e - Floating Eye.';
    case 'f':
      return 'f - Giant Frog.';
    case 'g':
      return 'g - Golem.';
    case 'h':
      return 'h - Harpy.';
    case 'i':
      return 'i - Icky Thing.';
    case 'j':
      return 'j - Jackal.';
    case 'k':
      return 'k - Kobold.';
    case 'l':
      return 'l - Giant Louse.';
    case 'm':
      return 'm - Mold.';
    case 'n':
      return 'n - Naga.';
    case 'o':
      return 'o - Orc or Ogre.';
    case 'p':
      return 'p - Person (Humanoid).';
    case 'q':
      return 'q - Quasit.';
    case 'r':
      return 'r - Rodent.';
    case 's':
      return 's - Skeleton.';
    case 't':
      return 't - Giant Tick.';
      // case 'u':
      //     return "u - Not used.";
      // case 'v':
      //     return "v - Not used.";
    case 'w':
      return 'w - Worm or Worm Mass.';
      // case 'x':
      //     return "x - Not used.";
    case 'y':
      return 'y - Yeek.';
    case 'z':
      return 'z - Zombie.';
    case '{':
      return '{ - Arrow, bolt, or bullet.';
    case '|':
      return '| - A sword or dagger.';
    case '}':
      return '} - Bow, crossbow, or sling.';
    case '~':
      return '~ - Miscellaneous item.';
    default:
      return 'Not Used.';
  }
}

export async function identifyGameObject(): Promise<void> {
  // being an ASCII character representing the item/monster tile, e.g. `+` = Door.
  const itemId = ref('\0');

  if (!(await getTileCharacter('Enter character to be identified :', itemId))) {
    return;
  }

  await putStringClearToEOL(objectDescription(itemId.v), { y: 0, x: 0 });
  await recallMonsterAttributes(itemId.v);
}

// Initialize all Potions, wands, staves, scrolls, etc.
export function magicInitializeItemNames(): void {
  let id: number;

  seedSet(game.magic_seed);

  // The first 3 entries for colors are fixed, (slime & apple juice, water)
  for (let i = 3; i < MAX_COLORS; i++) {
    id = randomNumber(MAX_COLORS - 3) + 2;
    const color = colors[i];
    colors[i] = colors[id];
    colors[id] = color;
  }

  for (let i = 0; i < MAX_WOODS; i++) {
    id = randomNumber(MAX_WOODS) - 1;
    const wood = woods[i];
    woods[i] = woods[id];
    woods[id] = wood;
  }

  for (let i = 0; i < MAX_METALS; i++) {
    id = randomNumber(MAX_METALS) - 1;
    const metal = metals[i];
    metals[i] = metals[id];
    metals[id] = metal;
  }

  for (let i = 0; i < MAX_ROCKS; i++) {
    id = randomNumber(MAX_ROCKS) - 1;
    const rock = rocks[i];
    rocks[i] = rocks[id];
    rocks[id] = rock;
  }

  for (let i = 0; i < MAX_AMULETS; i++) {
    id = randomNumber(MAX_AMULETS) - 1;
    const amulet = amulets[i];
    amulets[i] = amulets[id];
    amulets[id] = amulet;
  }

  for (let i = 0; i < MAX_MUSHROOMS; i++) {
    id = randomNumber(MAX_MUSHROOMS) - 1;
    const mushroom = mushrooms[i];
    mushrooms[i] = mushrooms[id];
    mushrooms[id] = mushroom;
  }

  let k: number;
  let title = '';

  for (let t = 0; t < MAX_TITLES; t++) {
    title = '';
    k = randomNumber(2) + 1;

    for (let i = 0; i < k; i++) {
      for (let s = randomNumber(2); s > 0; s--) {
        title += syllables[randomNumber(MAX_SYLLABLES) - 1];
      }
      if (i < k - 1) {
        title += ' ';
      }
    }

    if (title.charAt(8) === ' ') {
      title = title.slice(0, 8);
    } else {
      title = title.slice(0, 9);
    }

    magic_item_titles[t] = title;
  }

  seedResetToOldSeed();
}

export function objectPositionOffset(category_id: number, sub_category_id: number): number {
  switch (category_id) {
    case TV_AMULET:
      return 0;
    case TV_RING:
      return 1;
    case TV_STAFF:
      return 2;
    case TV_WAND:
      return 3;
    case TV_SCROLL1:
    case TV_SCROLL2:
      return 4;
    case TV_POTION1:
    case TV_POTION2:
      return 5;
    case TV_FOOD:
      if ((sub_category_id & (ITEM_SINGLE_STACK_MIN - 1)) < MAX_MUSHROOMS) {
        return 6;
      }
      return -1;
    default:
      return -1;
  }
}

function clearObjectTriedFlag(id: number): void {
  objects_identified[id] &= ~config.identification.OD_TRIED;
}

function setObjectTriedFlag(id: number): void {
  objects_identified[id] |= config.identification.OD_TRIED;
}

function isObjectKnown(id: number): boolean {
  return (objects_identified[id] & config.identification.OD_KNOWN1) !== 0;
}

/**
 * `id <<= 6; id += (uint8_t)(sub_category_id & (ITEM_SINGLE_STACK_MIN - 1));` on the int16_t id of
 * objectPositionOffset() (0 to 6): the index into objects_identified (it never leaves int16_t's range).
 */
function identIndex(offset: number, sub_category_id: number): number {
  let id = offset;
  id <<= 6;
  id += (sub_category_id & (ITEM_SINGLE_STACK_MIN - 1)) & 0xff;
  return id;
}

// Remove "Secret" symbol for identity of object
export function itemSetAsIdentified(category_id: number, sub_category_id: number): void {
  const offset = objectPositionOffset(category_id, sub_category_id);

  if (offset < 0) {
    return;
  }

  const id = identIndex(offset, sub_category_id);

  objects_identified[id] |= config.identification.OD_KNOWN1;

  // clear the tried flag, since it is now known
  clearObjectTriedFlag(id);
}

// Remove an automatically generated inscription. -CJS-
function unsample(item: Inventory_t): void {
  // this also used to clear config::identification::ID_DAMD flag, but I think it should remain set
  item.identification &= ~(config.identification.ID_MAGIK | config.identification.ID_EMPTY);

  const offset = objectPositionOffset(item.category_id, item.sub_category_id);

  if (offset < 0) {
    return;
  }

  const id = identIndex(offset, item.sub_category_id);

  // clear the tried flag, since it is now known
  clearObjectTriedFlag(id);
}

// Remove "Secret" symbol for identity of plusses
export function spellItemIdentifyAndRemoveRandomInscription(item: Inventory_t): void {
  unsample(item);
  item.identification |= config.identification.ID_KNOWN2;
}

export function spellItemIdentified(item: Inventory_t): boolean {
  return (item.identification & config.identification.ID_KNOWN2) !== 0;
}

export function spellItemRemoveIdentification(item: Inventory_t): void {
  item.identification &= ~config.identification.ID_KNOWN2;
}

export function itemIdentificationClearEmpty(item: Inventory_t): void {
  item.identification &= ~config.identification.ID_EMPTY;
}

export function itemIdentifyAsStoreBought(item: Inventory_t): void {
  item.identification |= config.identification.ID_STORE_BOUGHT;
  spellItemIdentifyAndRemoveRandomInscription(item);
}

function itemStoreBought(identification: number): boolean {
  return (identification & config.identification.ID_STORE_BOUGHT) !== 0;
}

// Items which don't have a 'color' are always known / itemSetAsIdentified(),
// so that they can be carried in order in the inventory.
export function itemSetColorlessAsIdentified(category_id: number, sub_category_id: number, identification: number): boolean {
  const offset = objectPositionOffset(category_id, sub_category_id);

  if (offset < 0) {
    return config.identification.OD_KNOWN1 !== 0;
  }
  if (itemStoreBought(identification)) {
    return config.identification.OD_KNOWN1 !== 0;
  }

  const id = identIndex(offset, sub_category_id);

  return isObjectKnown(id);
}

// Somethings been sampled -CJS-
export function itemSetAsTried(item: Inventory_t): void {
  const offset = objectPositionOffset(item.category_id, item.sub_category_id);

  if (offset < 0) {
    return;
  }

  const id = identIndex(offset, item.sub_category_id);

  setObjectTriedFlag(id);
}

// Somethings been identified.
// Extra complexity by CJS so that it can merge store/dungeon objects when appropriate.
export async function itemIdentify(item: Inventory_t, item_id: Ref<number>): Promise<void> {
  if (inventoryItemIsCursed(item)) {
    itemAppendToInscription(item, config.identification.ID_DAMD);
  }

  if (itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
    return;
  }

  itemSetAsIdentified(item.category_id, item.sub_category_id);

  // no merging possible
  if (!inventoryItemSingleStackable(item)) {
    return;
  }

  let j: number;

  for (let i = 0; i < py.pack.unique_items; i++) {
    const t_ptr = py.inventory[i];

    const matching_cat = t_ptr.category_id === item.category_id;
    const matching_sub_cat = t_ptr.sub_category_id === item.sub_category_id;
    const total_items_count = t_ptr.items_count + item.items_count;

    if (matching_cat && matching_sub_cat && i !== item_id.v && total_items_count < 256) {
      // make *item_id the smaller number
      if (item_id.v > i) {
        j = item_id.v;
        item_id.v = i;
        i = j;
      }

      await printMessage('You combine similar objects from the shop and dungeon.');

      py.inventory[item_id.v].items_count += py.inventory[i].items_count;
      py.pack.unique_items--;

      for (j = i; j < py.pack.unique_items; j++) {
        py.inventory[j].assign(py.inventory[j + 1]);
      }

      inventoryItemCopyTo(config.dungeon.objects.OBJ_NOTHING, py.inventory[j]);
    }
  }
}

// If an object has lost magical properties,
// remove the appropriate portion of the name. -CJS-
export function itemRemoveMagicNaming(item: Inventory_t): void {
  item.special_name_id = SpecialNameIds.SN_NULL;
}

export function bowDamageValue(misc_use: number): number {
  if (misc_use === 1 || misc_use === 2) {
    return 2;
  }
  if (misc_use === 3 || misc_use === 5) {
    return 3;
  }
  if (misc_use === 4 || misc_use === 6) {
    return 4;
  }
  return -1;
}

// determines how the `item.misc_use` field is printed
const ItemMiscUse = {
  Ignored: 0,
  Charges: 1,
  Plusses: 2,
  Light: 3,
  Flags: 4,
  ZPlusses: 5,
} as const;

// Set the `description` for an inventory item.
// The `add_prefix` param indicates that an article must be added.
// Note that since out_val can easily exceed 80 characters, itemDescription
// must always be called with a obj_desc_t as the first parameter.
export function itemDescription(description: Ref<string>, item: Inventory_t, add_prefix: boolean): void {
  let indexx = item.sub_category_id & (ITEM_SINGLE_STACK_MIN - 1);

  // base name, modifier string
  let basenm: string = game_objects[item.id].name;
  let modstr: string | null = null;

  let damstr = '';

  let append_name = false;
  const modify = !itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification);
  let misc_type: number = ItemMiscUse.Ignored;

  switch (item.category_id) {
    case TV_MISC:
    case TV_CHEST:
      break;
    case TV_SLING_AMMO:
    case TV_BOLT:
    case TV_ARROW:
      damstr = sprintf(' (%dd%d)', item.damage.dice, item.damage.sides);
      break;
    case TV_LIGHT:
      misc_type = ItemMiscUse.Light;
      break;
    case TV_SPIKE:
      break;
    case TV_BOW:
      damstr = sprintf(' (x%d)', bowDamageValue(item.misc_use));
      break;
    case TV_HAFTED:
    case TV_POLEARM:
    case TV_SWORD:
      damstr = sprintf(' (%dd%d)', item.damage.dice, item.damage.sides);
      misc_type = ItemMiscUse.Flags;
      break;
    case TV_DIGGING:
      misc_type = ItemMiscUse.ZPlusses;
      damstr = sprintf(' (%dd%d)', item.damage.sides, item.damage.sides);
      break;
    case TV_BOOTS:
    case TV_GLOVES:
    case TV_CLOAK:
    case TV_HELM:
    case TV_SHIELD:
    case TV_HARD_ARMOR:
    case TV_SOFT_ARMOR:
      break;
    case TV_AMULET:
      if (modify) {
        basenm = '& %s Amulet';
        modstr = amulets[indexx];
      } else {
        basenm = '& Amulet';
        append_name = true;
      }
      misc_type = ItemMiscUse.Plusses;
      break;
    case TV_RING:
      if (modify) {
        basenm = '& %s Ring';
        modstr = rocks[indexx];
      } else {
        basenm = '& Ring';
        append_name = true;
      }
      misc_type = ItemMiscUse.Plusses;
      break;
    case TV_STAFF:
      if (modify) {
        basenm = '& %s Staff';
        modstr = woods[indexx];
      } else {
        basenm = '& Staff';
        append_name = true;
      }
      misc_type = ItemMiscUse.Charges;
      break;
    case TV_WAND:
      if (modify) {
        basenm = '& %s Wand';
        modstr = metals[indexx];
      } else {
        basenm = '& Wand';
        append_name = true;
      }
      misc_type = ItemMiscUse.Charges;
      break;
    case TV_SCROLL1:
    case TV_SCROLL2:
      if (modify) {
        basenm = '& Scroll~ titled "%s"';
        modstr = magic_item_titles[indexx];
      } else {
        basenm = '& Scroll~';
        append_name = true;
      }
      break;
    case TV_POTION1:
    case TV_POTION2:
      if (modify) {
        basenm = '& %s Potion~';
        modstr = colors[indexx];
      } else {
        basenm = '& Potion~';
        append_name = true;
      }
      break;
    case TV_FLASK:
      break;
    case TV_FOOD:
      if (modify) {
        if (indexx <= 15) {
          basenm = '& %s Mushroom~';
        } else if (indexx <= 20) {
          basenm = '& Hairy %s Mold~';
        }
        if (indexx <= 20) {
          modstr = mushrooms[indexx];
        }
      } else {
        append_name = true;
        if (indexx <= 15) {
          basenm = '& Mushroom~';
        } else if (indexx <= 20) {
          basenm = '& Hairy Mold~';
        } else {
          // Ordinary food does not have a name appended.
          append_name = false;
        }
      }
      break;
    case TV_MAGIC_BOOK:
      modstr = basenm;
      basenm = '& Book~ of Magic Spells %s';
      break;
    case TV_PRAYER_BOOK:
      modstr = basenm;
      basenm = '& Holy Book~ of Prayers %s';
      break;
    case TV_OPEN_DOOR:
    case TV_CLOSED_DOOR:
    case TV_SECRET_DOOR:
    case TV_RUBBLE:
      break;
    case TV_GOLD:
    case TV_INVIS_TRAP:
    case TV_VIS_TRAP:
    case TV_UP_STAIR:
    case TV_DOWN_STAIR:
      description.v = game_objects[item.id].name;
      description.v += '.';
      return;
    case TV_STORE_DOOR:
      description.v = sprintf('the entrance to the %s.', game_objects[item.id].name);
      return;
    default:
      description.v = 'Error in objdes()';
      return;
  }

  const tmp_val = ref('');

  if (modstr !== null) {
    tmp_val.v = sprintf(basenm, modstr);
  } else {
    tmp_val.v = basenm;
  }

  if (append_name) {
    tmp_val.v += ' of ';
    tmp_val.v += game_objects[item.id].name;
  }

  if (item.items_count !== 1) {
    insertStringIntoString(tmp_val, 'ch~', 'ches');
    insertStringIntoString(tmp_val, '~', 's');
  } else {
    insertStringIntoString(tmp_val, '~', null);
  }

  if (!add_prefix) {
    if (tmp_val.v.startsWith('some')) {
      description.v = tmp_val.v.slice(5);
    } else if (tmp_val.v[0] === '&') {
      // eliminate the '& ' at the beginning
      description.v = tmp_val.v.slice(2);
    } else {
      description.v = tmp_val.v;
    }
    return;
  }

  let tmp_str = '';

  // TODO(cook): `spellItemIdentified()` is called several times in this
  // function, but `item` is immutable, so we should be able to call and
  // assign it once, then use that value everywhere below.
  if (item.special_name_id !== SpecialNameIds.SN_NULL && spellItemIdentified(item)) {
    tmp_val.v += ' ';
    tmp_val.v += special_item_names[item.special_name_id] ?? '';
  }

  if (damstr.length !== 0) {
    tmp_val.v += damstr;
  }

  if (spellItemIdentified(item)) {
    const abs_to_hit = Math.abs(item.to_hit);
    const abs_to_damage = Math.abs(item.to_damage);

    if ((item.identification & config.identification.ID_SHOW_HIT_DAM) !== 0) {
      tmp_str = sprintf(' (%c%d,%c%d)', item.to_hit < 0 ? '-' : '+', abs_to_hit, item.to_damage < 0 ? '-' : '+', abs_to_damage);
    } else if (item.to_hit !== 0) {
      tmp_str = sprintf(' (%c%d)', item.to_hit < 0 ? '-' : '+', abs_to_hit);
    } else if (item.to_damage !== 0) {
      tmp_str = sprintf(' (%c%d)', item.to_damage < 0 ? '-' : '+', abs_to_damage);
    } else {
      tmp_str = '';
    }
    tmp_val.v += tmp_str;
  }

  // Crowns have a zero base AC, so make a special test for them.
  const abs_to_ac = Math.abs(item.to_ac);
  if (item.ac !== 0 || item.category_id === TV_HELM) {
    tmp_str = sprintf(' [%d', item.ac);
    tmp_val.v += tmp_str;
    if (spellItemIdentified(item)) {
      // originally used %+d, but several machines don't support it
      tmp_str = sprintf(',%c%d', item.to_ac < 0 ? '-' : '+', abs_to_ac);
      tmp_val.v += tmp_str;
    }
    tmp_val.v += ']';
  } else if (item.to_ac !== 0 && spellItemIdentified(item)) {
    // originally used %+d, but several machines don't support it
    tmp_str = sprintf(' [%c%d]', item.to_ac < 0 ? '-' : '+', abs_to_ac);
    tmp_val.v += tmp_str;
  }

  // override defaults, check for `misc_type` flags in the `item.identification` field
  if ((item.identification & config.identification.ID_NO_SHOW_P1) !== 0) {
    misc_type = ItemMiscUse.Ignored;
  } else if ((item.identification & config.identification.ID_SHOW_P1) !== 0) {
    misc_type = ItemMiscUse.ZPlusses;
  }

  tmp_str = '';

  if (misc_type === ItemMiscUse.Light) {
    tmp_str = sprintf(' with %d turns of light', item.misc_use);
  } else if (misc_type === ItemMiscUse.Ignored) {
    // NOOP
  } else if (spellItemIdentified(item)) {
    const abs_misc_use = Math.abs(item.misc_use);

    if (misc_type === ItemMiscUse.ZPlusses) {
      // originally used %+d, but several machines don't support it
      tmp_str = sprintf(' (%c%d)', item.misc_use < 0 ? '-' : '+', abs_misc_use);
    } else if (misc_type === ItemMiscUse.Charges) {
      tmp_str = sprintf(' (%d charges)', item.misc_use);
    } else if (item.misc_use !== 0) {
      if (misc_type === ItemMiscUse.Plusses) {
        tmp_str = sprintf(' (%c%d)', item.misc_use < 0 ? '-' : '+', abs_misc_use);
      } else if (misc_type === ItemMiscUse.Flags) {
        if ((item.flags & config.treasure.flags.TR_STR) !== 0) {
          tmp_str = sprintf(' (%c%d to STR)', item.misc_use < 0 ? '-' : '+', abs_misc_use);
        } else if ((item.flags & config.treasure.flags.TR_STEALTH) !== 0) {
          tmp_str = sprintf(' (%c%d to stealth)', item.misc_use < 0 ? '-' : '+', abs_misc_use);
        }
      }
    }
  }
  tmp_val.v += tmp_str;

  // ampersand is always the first character
  if (tmp_val.v[0] === '&') {
    // use &tmp_val[1], so that & does not appear in output
    if (item.items_count > 1) {
      description.v = sprintf('%d%s', item.items_count, tmp_val.v.slice(1));
    } else if (item.items_count < 1) {
      description.v = sprintf('%s%s', 'no more', tmp_val.v.slice(1));
    } else if (isVowel(tmp_val.v.charAt(2))) {
      description.v = sprintf('an%s', tmp_val.v.slice(1));
    } else {
      description.v = sprintf('a%s', tmp_val.v.slice(1));
    }
  } else if (item.items_count < 1) {
    // handle 'no more' case specially

    // check for "some" at start
    if (tmp_val.v.startsWith('some')) {
      description.v = sprintf('no more %s', tmp_val.v.slice(5));
    } else {
      // here if no article
      description.v = sprintf('no more %s', tmp_val.v);
    }
  } else {
    description.v = tmp_val.v;
  }

  tmp_str = '';

  if ((indexx = objectPositionOffset(item.category_id, item.sub_category_id)) >= 0) {
    indexx <<= 6;
    indexx += item.sub_category_id & (ITEM_SINGLE_STACK_MIN - 1);

    // don't print tried string for store bought items
    if ((objects_identified[indexx] & config.identification.OD_TRIED) !== 0 && !itemStoreBought(item.identification)) {
      tmp_str += 'tried ';
    }
  }

  if ((item.identification & (config.identification.ID_MAGIK | config.identification.ID_EMPTY | config.identification.ID_DAMD)) !== 0) {
    if ((item.identification & config.identification.ID_MAGIK) !== 0) {
      tmp_str += 'magik ';
    }
    if ((item.identification & config.identification.ID_EMPTY) !== 0) {
      tmp_str += 'empty ';
    }
    if ((item.identification & config.identification.ID_DAMD) !== 0) {
      tmp_str += 'damned ';
    }
  }

  if (item.inscription.length !== 0) {
    tmp_str += item.inscription;
  } else if ((indexx = tmp_str.length) > 0) {
    // remove the extra blank at the end
    tmp_str = tmp_str.slice(0, indexx - 1);
  }

  if (tmp_str.length !== 0) {
    tmp_val.v = sprintf(' {%s}', tmp_str);
    description.v += tmp_val.v;
  }

  description.v += '.';
}

// Describe number of remaining charges. -RAK-
export async function itemChargesRemainingDescription(item_id: number): Promise<void> {
  if (!spellItemIdentified(py.inventory[item_id])) {
    return;
  }

  const rem_num = py.inventory[item_id].misc_use;

  const out_val = sprintf('You have %d charges remaining.', rem_num);
  await printMessage(out_val);
}

// Describe amount of item remaining. -RAK-
export async function itemTypeRemainingCountDescription(item_id: number): Promise<void> {
  const item = py.inventory[item_id];

  item.items_count--;

  const tmp_str = ref('');
  itemDescription(tmp_str, item, true);

  item.items_count++;

  // the string already has a dot at the end.
  const out_val = sprintf('You have %s', tmp_str.v);
  await printMessage(out_val);
}

// Add a comment to an object description. -CJS-
export async function itemInscribe(): Promise<void> {
  if (py.pack.unique_items === 0 && py.equipment_count === 0) {
    await printMessage('You are not carrying anything to inscribe.');
    return;
  }

  const item_id = ref(0);
  if (!(await inventoryGetInputForItemId(item_id, 'Which one? ', 0, PLAYER_INVENTORY_SIZE, null, null))) {
    return;
  }

  const msg = ref('');
  itemDescription(msg, py.inventory[item_id.v], true);

  const inscription = ref('');
  inscription.v = sprintf('Inscribing %s', msg.v);

  await printMessage(inscription.v);

  if (py.inventory[item_id.v].inscription.length !== 0) {
    inscription.v = sprintf('Replace %s New inscription:', py.inventory[item_id.v].inscription);
  } else {
    inscription.v = 'Inscription: ';
  }

  let msg_len = 78 - msg.v.length;
  if (msg_len > 12) {
    msg_len = 12;
  }

  await putStringClearToEOL(inscription.v, { y: 0, x: 0 });

  if (await getStringInput(inscription, { y: 0, x: inscription.v.length }, msg_len)) {
    itemReplaceInscription(py.inventory[item_id.v], inscription.v);
  }
}

// Append an additional comment to an object description. -CJS-
export function itemAppendToInscription(item: Inventory_t, item_ident_type: number): void {
  item.identification |= item_ident_type;
}

// Replace any existing comment in an object description with a new one. -CJS-
export function itemReplaceInscription(item: Inventory_t, inscription: string): void {
  item.inscription = inscription;
}

export async function objectBlockedByMonster(monster_id: number): Promise<void> {
  let description: string;

  const monster = monsters[monster_id];
  const name = creatures_list[monster.creature_id].name;

  if (monster.lit) {
    description = sprintf('The %s', name);
  } else {
    description = 'Something';
  }

  const msg = sprintf('%s is in your way!', description);
  await printMessage(msg);
}
