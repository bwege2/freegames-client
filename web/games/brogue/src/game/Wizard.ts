// @ts-nocheck
// Brogue CE 1.15.1 Wizard.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { cellHasTerrainFlag } from './Architect.ts';
import { buttonInputLoop, initializeButton } from './Buttons.ts';
import { killCreature } from './Combat.ts';
import { clearDisplayBuffer, confirm, confirmMessages, getInputTextString, message, messageWithColor, overlayDisplayBuffer, printString, rectangularShading, refreshDungeonCell, refreshSideBar, restoreDisplayBuffer, saveDisplayBuffer, temporaryMessage, upperCase } from './IO.ts';
import { addItemToPack, chooseTarget, deleteItem, generateItem, identify, itemKindCount, itemName, numberOfItemsInPack, tableForItemCategory } from './Items.ts';
import { rand_range } from './Math.ts';
import { fadeInMonster, generateMonster, initializeMonster, monsterAtLoc, mutateMonster } from './Monsters.ts';
import { becomeAllyWith } from './Movement.ts';
import { removeDeadMonsters, unflag } from './RogueMain.ts';
import { struct_brogueButton, struct_creature, struct_creatureType, struct_item, struct_pcell, struct_pos, struct_screenDisplayBuffer, struct_tcell, struct_windowpos } from './structs.ts';
import { $at2, $cs, $sadd, $sarr, $sat, $shl64, $u64, G, P, S, qsort, sprintf, sscanf, strcmp, strcpy, strlen, strncpy } from '../rt/index.ts';
import { ANY_KIND_OF_VISIBLE, ARMOR, AUTOTARGET_MODE_NONE, A_IMMUNITY, BROADSWORD, B_GRADIENT, B_WIDE_CLICK_AREA, CAN_BE_ENCHANTED, CHARM, COLS, DCOLS, DISCOVERED, DROWS, DUNGEON, FEAT_TONE, GEM, GOLD, GRANITE, G_TURRET, HAMMER, HAS_MONSTER, INTERFACE_OPACITY, ITEM_CAN_BE_IDENTIFIED, ITEM_CURSED, ITEM_RUNIC, KEYBOARD_LABELS, MAX_PACK_ITEMS, MA_NEVER_MUTATED, MESSAGE_LINES, MK_LICH, MK_PHOENIX, MK_PHOENIX_EGG, MK_PHYLACTERY, MONSTER_CLASS_COUNT, MONSTER_WANDERING, MONST_INANIMATE, MONST_INVULNERABLE, MONST_NEVER_MUTATED, NEVER_IDENTIFIABLE, NUMBER_ARMOR_ENCHANT_KINDS, NUMBER_GOOD_ARMOR_ENCHANT_KINDS, NUMBER_GOOD_WEAPON_ENCHANT_KINDS, NUMBER_ITEM_CATEGORIES, NUMBER_MONSTER_KINDS, NUMBER_MUTATORS, NUMBER_WEAPON_RUNIC_KINDS, PIKE, PLATE_MAIL, REFRESH_SIDEBAR, REQUIRE_ACKNOWLEDGMENT, RING, ROWS, STAFF, STAT_BAR_WIDTH, TEXT_INPUT_NORMAL, T_OBSTRUCTS_PASSABILITY, WALL, WAND, WAR_AXE, WEAPON, W_SLAYING, false_, true_ } from './consts.ts';


function signum(x: number): number {
  if (x === 0) {
    return 0;
  }
  return x > 0 ? 1 : -1;
}

function posEq(a: struct_pos, b: struct_pos): number {
  return (a.x === b.x && a.y === b.y ? 1 : 0) << 24 >> 24;
}

function coordinatesAreInMap(x: number, y: number): number {
  return (x >= 0 && DCOLS > x && y >= 0 && DROWS > y ? 1 : 0) << 24 >> 24;
}

function isPosInMap(p: struct_pos): number {
  return (p.x >= 0 && DCOLS > p.x && p.y >= 0 && DROWS > p.y ? 1 : 0) << 24 >> 24;
}

function locIsInWindow(w: struct_windowpos): number {
  return (w.window_x >= 0 && COLS > w.window_x && w.window_y >= 0 && ROWS > w.window_y ? 1 : 0) << 24 >> 24;
}

function windowToMap(w: struct_windowpos): struct_pos {
  return struct_pos.$of(w.window_x - STAT_BAR_WIDTH - 1 << 16 >> 16, w.window_y - MESSAGE_LINES << 16 >> 16);
}

function mapToWindow(p: struct_pos): struct_windowpos {
  return struct_windowpos.$of(p.x + STAT_BAR_WIDTH + 1 << 16 >> 16, p.y + MESSAGE_LINES << 16 >> 16);
}

function tmapAt(p: struct_pos): struct_tcell | null {
  ;
  return $sat(G.tmap[p.x], p.y);
}

function pmapAt(p: struct_pos): struct_pcell | null {
  ;
  return $sat(G.pmap[p.x], p.y);
}

function posNeighborInDirection(p: struct_pos, direction_to_step: number): struct_pos {
  ;
  return struct_pos.$of(p.x + G.nbDirs[direction_to_step][0] << 16 >> 16, p.y + G.nbDirs[direction_to_step][1] << 16 >> 16);
}

function initializeCreateItemButton(button: struct_brogueButton | null, text: Ptr | null): void {
  let buttonText = new Int8Array(300);
  initializeButton(button);
  strcpy(P(buttonText), text);
  upperCase(P(buttonText));
  strcpy(P(button.text), P(buttonText));
}

async function dialogSelectEntryFromList(buttons: struct_brogueButton | null, buttonCount: number, windowTitle: Ptr | null): Promise<number> {
  let $t1: any;
  let x = 0;
  let y = 0;
  let width = 0;
  let height = 0;
  let dbuf = new struct_screenDisplayBuffer();
  let i = 0;
  let selectedButton = 0;
  let len = 0;
  let maxLen = 0;
  let buttonText = new Int8Array(100);
  maxLen = strlen(windowTitle) << 16 >> 16;
  for (i = 0; buttonCount > i; i = i + 1 << 16 >> 16) {
    ($t1 = $sadd(buttons, i), $t1.flags = ($t1.flags & ~(B_WIDE_CLICK_AREA | B_GRADIENT) >>> 0) >>> 0);
    $sadd(buttons, i).buttonColor.$cp(G.interfaceBoxColor);
    $sadd(buttons, i).hotkey[0] = 97 + i;
    $sadd(buttons, i).hotkey[1] = 65 + i;
    $sadd(buttons, i).x = G.WINDOW_POSITION_DUNGEON_TOP_LEFT.window_x;
    $sadd(buttons, i).y = G.WINDOW_POSITION_DUNGEON_TOP_LEFT.window_y + 1 + i << 16 >> 16;
    if (KEYBOARD_LABELS) {
      sprintf(P(buttonText), S("%c) %s"), $sadd(buttons, i).hotkey[0] | 0, P($sadd(buttons, i).text));
      strcpy(P($sadd(buttons, i).text), P(buttonText));
      len = strlen(P(buttonText)) << 16 >> 16;
      if (len > maxLen) {
        maxLen = len;
      }
    }
  }
  width = maxLen + 1 << 16 >> 16;
  height = buttonCount + 2 << 16 >> 16;
  x = G.WINDOW_POSITION_DUNGEON_TOP_LEFT.window_x;
  y = G.WINDOW_POSITION_DUNGEON_TOP_LEFT.window_y;
  clearDisplayBuffer(dbuf);
  printString(windowTitle, x, y - 1 << 16 >> 16, G.itemMessageColor, G.interfaceBoxColor, dbuf);
  rectangularShading(x - 1 << 16 >> 16, y - 1 << 16 >> 16, width + 1 << 16 >> 16, height + 1 << 16 >> 16, G.interfaceBoxColor, INTERFACE_OPACITY, dbuf);
  let rbuf = saveDisplayBuffer().$clone();
  overlayDisplayBuffer(dbuf);
  selectedButton = await buttonInputLoop(buttons, buttonCount, x, y, width, height, null);
  restoreDisplayBuffer(rbuf);
  return selectedButton;
}

async function dialogCreateItemChooseVorpalEnemy(): Promise<number> {
  let buttonText = new Int8Array(100);
  let i = 0;
  let buttons = $sarr(struct_brogueButton, 26);
  for (i = 0; MONSTER_CLASS_COUNT > i; i = i + 1 << 16 >> 16) {
    strcpy(P(buttonText), P(G.monsterClassCatalog[i].name));
    initializeCreateItemButton($sat(buttons, i), P(buttonText));
  }
  return await dialogSelectEntryFromList(buttons[0], i, S("Choose a vorpal enemy:"));
}

async function dialogCreateItemChooseRunic(theItem: struct_item | null): Promise<void> {
  let buttonText = new Int8Array(100);
  let i = 0;
  let runicOffset = 0;
  let noRunic = 0;
  let selectedRunic = 0;
  let selectedVorpalEnemy = 0;
  let buttons = $sarr(struct_brogueButton, 26);
  if (!(theItem.category & (WEAPON | ARMOR))) {
    return;
  }
  if (theItem.category === WEAPON) {
    if (theItem.kind === HAMMER || theItem.kind === WAR_AXE || theItem.kind === PIKE || theItem.kind === BROADSWORD) {
      for (i = 0; NUMBER_WEAPON_RUNIC_KINDS - NUMBER_GOOD_WEAPON_ENCHANT_KINDS > i; i = i + 1 << 16 >> 16) {
        strcpy(P(buttonText), P(G.weaponRunicNames[i + NUMBER_GOOD_WEAPON_ENCHANT_KINDS]));
        initializeCreateItemButton($sat(buttons, i), P(buttonText));
      }
      runicOffset = NUMBER_GOOD_WEAPON_ENCHANT_KINDS;
    } else if (theItem.quiverNumber === 0) {
      for (i = 0; NUMBER_WEAPON_RUNIC_KINDS > i; i = i + 1 << 16 >> 16) {
        strcpy(P(buttonText), P(G.weaponRunicNames[i]));
        initializeCreateItemButton($sat(buttons, i), P(buttonText));
      }
    } else {
      return;
    }
  } else if (theItem.category === ARMOR) {
    if (theItem.kind === PLATE_MAIL) {
      for (i = 0; NUMBER_ARMOR_ENCHANT_KINDS - NUMBER_GOOD_ARMOR_ENCHANT_KINDS > i; i = i + 1 << 16 >> 16) {
        strcpy(P(buttonText), P(G.armorRunicNames[i + NUMBER_GOOD_ARMOR_ENCHANT_KINDS]));
        initializeCreateItemButton($sat(buttons, i), P(buttonText));
      }
      runicOffset = NUMBER_GOOD_ARMOR_ENCHANT_KINDS;
    } else {
      for (i = 0; NUMBER_ARMOR_ENCHANT_KINDS > i; i = i + 1 << 16 >> 16) {
        strcpy(P(buttonText), P(G.armorRunicNames[i]));
        initializeCreateItemButton($sat(buttons, i), P(buttonText));
      }
    }
  }
  initializeCreateItemButton($sat(buttons, i), S("No Runic"));
  noRunic = i;
  selectedRunic = await dialogSelectEntryFromList(buttons[0], i + 1 << 16 >> 16, S("Choose a runic:"));
  if (selectedRunic >= 0 && selectedRunic !== noRunic) {
    theItem.enchant2 = selectedRunic + runicOffset << 16 >> 16;
    theItem.flags = (theItem.flags | ITEM_RUNIC) >>> 0;
    if (theItem.enchant2 === W_SLAYING && theItem.category === WEAPON || theItem.enchant2 === A_IMMUNITY && theItem.category === ARMOR) {
      selectedVorpalEnemy = await dialogCreateItemChooseVorpalEnemy();
      if (selectedVorpalEnemy >= 0) {
        theItem.vorpalEnemy = selectedVorpalEnemy;
      } else {
        theItem.enchant2 = 0;
        theItem.flags = (theItem.flags & ~ITEM_RUNIC >>> 0) >>> 0;
      }
    }
  } else if (selectedRunic === noRunic) {
    theItem.enchant2 = 0;
    theItem.flags = (theItem.flags & ~ITEM_RUNIC >>> 0) >>> 0;
  }
}

async function dialogCreateItemChooseKind(category: number): Promise<number> {
  let buttonText = new Int8Array(100);
  let i = 0;
  let buttons = $sarr(struct_brogueButton, 26);
  let kindTable = null;
  let kindCount = 0;
  let title = $cs("", 50);
  kindTable = tableForItemCategory(category);
  kindCount = itemKindCount(category, 0);
  for (i = 0; kindCount > i; i = i + 1 << 16 >> 16) {
    strncpy(P(buttonText), $sadd(kindTable, i).name, COLS);
    initializeCreateItemButton($sat(buttons, i), P(buttonText));
  }
  sprintf(P(title), S("Create %s:"), P(G.itemCategoryNames[unflag($u64(category))]));
  return await dialogSelectEntryFromList(buttons[0], i, P(title));
}

async function dialogCreateItemChooseEnchantmentLevel(theItem: struct_item | null): Promise<void> {
  let minVal = 0;
  let maxVal = 50;
  let defaultVal = 0;
  let maxInputLength = 2;
  let prompt = new Int8Array(100);
  let buf = new Int8Array(100);
  let inputBuf = $cs("", 100);
  defaultVal = theItem.enchant1;
  if (theItem.category === WAND) {
    minVal = 0;
    defaultVal = theItem.charges;
  } else if (theItem.category === CHARM) {
    minVal = 1;
  } else if (theItem.category === STAFF) {
    minVal = 2;
  } else if (theItem.category === RING) {
    minVal = -3;
  } else if (theItem.category & (WEAPON | ARMOR)) {
    if (!((theItem.flags & ITEM_RUNIC) >>> 0)) {
      minVal = -3;
    } else {
      if (theItem.category === ARMOR && theItem.enchant2 >= NUMBER_GOOD_ARMOR_ENCHANT_KINDS || theItem.category === WEAPON && theItem.enchant2 >= NUMBER_GOOD_WEAPON_ENCHANT_KINDS) {
        minVal = -3;
        maxVal = -1;
        theItem.enchant1 = rand_range(-3, -1) << 16 >> 16;
      } else {
        minVal = 1;
        if (1 > theItem.enchant1) {
          theItem.enchant1 = rand_range(1, 3) << 16 >> 16;
        }
      }
      defaultVal = theItem.enchant1;
    }
  }
  sprintf(P(prompt), S("How many enchants (%d to %d) [default %d]?"), minVal, maxVal, defaultVal);
  await getInputTextString(P(inputBuf), P(prompt), maxInputLength, S(""), S(""), TEXT_INPUT_NORMAL, true_);
  const enchants = new Int32Array(1);
  if (strlen(P(inputBuf)) && sscanf(P(inputBuf), S("%d"), P(enchants, 0)) && sprintf(P(buf), S("%d"), enchants[0]) && strcmp(P(buf), P(inputBuf)) === 0) {
    if (enchants[0] > maxVal) {
      enchants[0] = maxVal;
    } else if (minVal > enchants[0]) {
      enchants[0] = defaultVal;
    }
    if (theItem.category === WAND) {
      theItem.charges = enchants[0] << 16 >> 16;
    } else if (theItem.category === STAFF) {
      theItem.charges = theItem.enchant1 = enchants[0] << 16 >> 16;
    } else {
      theItem.enchant1 = enchants[0] << 16 >> 16;
    }
  }
  if (0 > theItem.enchant1) {
    theItem.flags = (theItem.flags | ITEM_CURSED) >>> 0;
  }
}

function creatureTypeCompareMonsterNames(a: any, b: any): number {
  let c1 = a;
  let c2 = b;
  let name1 = new Int8Array(100);
  let name2 = new Int8Array(100);
  strncpy(P(name1), P(c1.monsterName), COLS);
  strncpy(P(name2), P(c2.monsterName), COLS);
  upperCase(P(name1));
  upperCase(P(name2));
  return strcmp(P(name1), P(name2));
}

async function dialogCreateMonsterChooseMutation(theMonster: struct_creature | null): Promise<void> {
  let buttonText = new Int8Array(100);
  let i = 0;
  let j = 0;
  let noMutation = 0;
  let selectedMutation = 0;
  let buttons = $sarr(struct_brogueButton, 26);
  for (i = 0; NUMBER_MUTATORS > i; i = i + 1 << 16 >> 16) {
    if (!((theMonster.info.flags & G.mutationCatalog[i].forbiddenFlags) >>> 0) && !((theMonster.info.abilityFlags & G.mutationCatalog[i].forbiddenAbilityFlags) >>> 0)) {
      strncpy(P(buttonText), P(G.mutationCatalog[i].title), COLS);
      initializeCreateItemButton($sat(buttons, j), P(buttonText));
      j = j + 1 << 16 >> 16;
    }
  }
  initializeCreateItemButton($sat(buttons, j), S("No mutation"));
  noMutation = j;
  selectedMutation = await dialogSelectEntryFromList(buttons[0], j + 1 << 16 >> 16, S("Choose a mutation:"));
  if (selectedMutation !== noMutation) {
    mutateMonster(theMonster, selectedMutation);
  }
}

async function dialogCreateMonster(): Promise<void> {
  let $t1: any;
  let buttons = $sarr(struct_brogueButton, 26);
  let buttonText = new Int8Array(100);
  let selectedPosition = new struct_pos();
  let locationIsValid = true_;
  let i = 0;
  let j = 0;
  let selectedMonster = 0;
  let monsterOffset = 0;
  let buttonCount = 0;
  let MONSTERS_PER_PAGE = 24;
  let CREATABLE_MONSTER_KINDS = NUMBER_MONSTER_KINDS - 2;
  let theMessage = $cs("", 100);
  let monsterRangeText = new Int8Array(100);
  let theMonster = null;
  let oldMonster = null;
  let monsterKinds = $sarr(struct_creatureType, 68);
  for (i = 0; NUMBER_MONSTER_KINDS > i; i = i + 1 << 16 >> 16) {
    if (!(G.monsterCatalog[i].monsterID >>> 0 === MK_LICH) && !(G.monsterCatalog[i].monsterID >>> 0 === MK_PHOENIX)) {
      monsterKinds[j].$cp(G.monsterCatalog[i]);
      upperCase(P(monsterKinds[j].monsterName));
      j = j + 1 << 16 >> 16;
    }
  }
  qsort(monsterKinds[0], $u64(CREATABLE_MONSTER_KINDS), 264, creatureTypeCompareMonsterNames);
  for (i = 0; CREATABLE_MONSTER_KINDS > i; i = i + MONSTERS_PER_PAGE << 16 >> 16) {
    if (CREATABLE_MONSTER_KINDS > i + MONSTERS_PER_PAGE) {
      sprintf(P(monsterRangeText), S("%s - %s"), P(monsterKinds[i].monsterName), P(monsterKinds[i + MONSTERS_PER_PAGE - 1].monsterName));
    } else {
      sprintf(P(monsterRangeText), S("%s - %s"), P(monsterKinds[i].monsterName), P(monsterKinds[CREATABLE_MONSTER_KINDS - 1].monsterName));
    }
    initializeCreateItemButton($sat(buttons, buttonCount), P(monsterRangeText));
    buttonCount = buttonCount + 1 << 16 >> 16;
  }
  monsterOffset = await dialogSelectEntryFromList(buttons[0], buttonCount, S("Create monster:"));
  if (monsterOffset === -1) {
    return;
  }
  monsterOffset = Math.imul(monsterOffset, MONSTERS_PER_PAGE) << 16 >> 16;
  buttonCount = 0;
  for (i = monsterOffset; monsterOffset + MONSTERS_PER_PAGE > i && CREATABLE_MONSTER_KINDS > i; i = i + 1 << 16 >> 16) {
    strncpy(P(buttonText), P(monsterKinds[i].monsterName), COLS);
    initializeCreateItemButton($sat(buttons, buttonCount), P(buttonText));
    buttonCount = buttonCount + 1 << 16 >> 16;
  }
  selectedMonster = await dialogSelectEntryFromList(buttons[0], buttonCount, S("Create monster:"));
  if (selectedMonster === -1) {
    return;
  }
  selectedMonster = selectedMonster + monsterOffset << 16 >> 16;
  theMonster = generateMonster(monsterKinds[selectedMonster].monsterID << 16 >> 16, false_, false_);
  if (!((theMonster.info.flags & MONST_NEVER_MUTATED) >>> 0) && !((theMonster.info.abilityFlags & MA_NEVER_MUTATED) >>> 0)) {
    await dialogCreateMonsterChooseMutation(theMonster);
  }
  initializeMonster(theMonster, false_);
  if (theMonster.info.displayChar >>> 0 === G_TURRET) {
    sprintf(P(theMessage), S("Create %s where? Choose a visible wall."), P(theMonster.info.monsterName));
  } else {
    sprintf(P(theMessage), S("Create %s where? Choose a visible unobstructed location."), P(theMonster.info.monsterName));
  }
  await temporaryMessage(P(theMessage), REFRESH_SIDEBAR);
  if (await chooseTarget(selectedPosition, 0, AUTOTARGET_MODE_NONE, null)) {
    confirmMessages();
    if (!(($at2(G.pmap, selectedPosition.x, selectedPosition.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, selectedPosition.x, selectedPosition.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, selectedPosition.x, selectedPosition.y).flags & DISCOVERED) >>> 0))) {
      locationIsValid = false_;
    }
    if (theMonster.info.displayChar >>> 0 === G_TURRET && !(pmapAt(selectedPosition).layers[DUNGEON] >>> 0 === WALL)) {
      locationIsValid = false_;
    }
    if (!(theMonster.info.displayChar >>> 0 === G_TURRET) && cellHasTerrainFlag(selectedPosition, T_OBSTRUCTS_PASSABILITY)) {
      locationIsValid = false_;
    }
    if (!locationIsValid) {
      sprintf(P(theMessage), S("Invalid location. %s"), KEYBOARD_LABELS ? S("-- Press space or click to continue --") : S("-- Touch anywhere to continue --"));
      await temporaryMessage(P(theMessage), REQUIRE_ACKNOWLEDGMENT);
      await killCreature(theMonster, true_);
      removeDeadMonsters();
      return;
    }
    oldMonster = monsterAtLoc(selectedPosition);
    if (oldMonster) {
      await killCreature(oldMonster, true_);
      removeDeadMonsters();
    }
    theMonster.loc.$cp(selectedPosition);
    ($t1 = pmapAt(theMonster.loc), $t1.flags = ($t1.flags | HAS_MONSTER) >>> 0);
    theMonster.creatureState = MONSTER_WANDERING;
    await fadeInMonster(theMonster);
    await refreshSideBar(-1, -1, false_);
    await refreshDungeonCell(theMonster.loc.$clone());
    if (!((theMonster.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0) || theMonster.info.monsterID >>> 0 === MK_PHOENIX_EGG || theMonster.info.monsterID >>> 0 === MK_PHYLACTERY) {
      sprintf(P(theMessage), S("Make the %s your ally?"), P(theMonster.info.monsterName));
      if (await confirm(P(theMessage), false_)) {
        await becomeAllyWith(theMonster);
        sprintf(P(theMessage), S("Allied %s created."), P(theMonster.info.monsterName));
      } else {
        sprintf(P(theMessage), S("%s created."), P(theMonster.info.monsterName));
      }
    } else {
      sprintf(P(theMessage), S("%s created."), P(theMonster.info.monsterName));
    }
    await message(P(theMessage), 0);
  } else {
    confirmMessages();
    await killCreature(theMonster, true_);
    removeDeadMonsters();
  }
  await refreshSideBar(-1, -1, false_);
}

async function dialogCreateItem(): Promise<void> {
  let buttons = $sarr(struct_brogueButton, 26);
  let buttonText = new Int8Array(100);
  let i = 0;
  let selectedCategory = 0;
  let selectedKind = 0;
  let message = $cs("", 100);
  let theItem = null;
  let theItemName = $cs("", 100);
  if (numberOfItemsInPack() === MAX_PACK_ITEMS) {
    await messageWithColor(S("Your pack is already full."), G.itemMessageColor, 0);
    return;
  }
  for (i = 0; NUMBER_ITEM_CATEGORIES > i; i = i + 1 << 16 >> 16) {
    strncpy(P(buttonText), P(G.itemCategoryNames[i]), COLS);
    initializeCreateItemButton($sat(buttons, i), P(buttonText));
  }
  selectedCategory = await dialogSelectEntryFromList(buttons[0], i, S("Create item:"));
  if (tableForItemCategory($shl64(1, selectedCategory) | 0)) {
    selectedKind = await dialogCreateItemChooseKind($shl64(1, selectedCategory) | 0);
  } else if (selectedCategory === -1) {
    return;
  } else {
    selectedKind = 0;
  }
  if (selectedKind >= 0) {
    theItem = await generateItem($shl64(1, selectedCategory) & 0xffff, selectedKind);
    theItem.flags = (theItem.flags & ~ITEM_CURSED >>> 0) >>> 0;
  } else {
    return;
  }
  if ($shl64(1, selectedCategory) === GEM) {
    theItem.originDepth = G.rogue.depthLevel;
  }
  if ($shl64(1, selectedCategory) === GOLD) {
    G.rogue.gold = G.rogue.gold + $u64(theItem.quantity);
    sprintf(P(message), S("you found %i pieces of gold.%s"), theItem.quantity, G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_TONE] ? S(".. and strike a tone of disappointment.") : S(""));
    G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_TONE] = false_;
    await messageWithColor(P(message), G.itemMessageColor, 0);
    deleteItem(theItem);
    return;
  }
  if (($shl64(1, selectedCategory) & (ARMOR | WEAPON)) >>> 0) {
    await dialogCreateItemChooseRunic(theItem);
  }
  if (($shl64(1, selectedCategory) & CAN_BE_ENCHANTED) >>> 0 && theItem.quiverNumber === 0) {
    await dialogCreateItemChooseEnchantmentLevel(theItem);
  }
  if ((theItem.flags & ITEM_CAN_BE_IDENTIFIED) >>> 0 && !(($shl64(1, selectedCategory) & NEVER_IDENTIFIABLE) >>> 0)) {
    if (await confirm(S("Identify the item?"), false_)) {
      identify(theItem);
    }
  }
  theItem = addItemToPack(theItem);
  itemName(theItem, P(theItemName), true_, true_, null);
  sprintf(P(message), S("you now have %s (%c)."), P(theItemName), theItem.inventoryLetter);
  await messageWithColor(P(message), G.itemMessageColor, 0);
}

export async function dialogCreateItemOrMonster(): Promise<void> {
  let buttons = $sarr(struct_brogueButton, 26);
  let selectedType = 0;
  initializeCreateItemButton(buttons[0], S("Item"));
  initializeCreateItemButton(buttons[1], S("Monster"));
  selectedType = await dialogSelectEntryFromList(buttons[0], 2, S("Create:"));
  if (selectedType === 0) {
    await dialogCreateItem();
  } else if (selectedType === 1) {
    await dialogCreateMonster();
  }
}

export function $init(): void {
}
