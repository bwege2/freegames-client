// @ts-nocheck
// Brogue CE 1.15.1 Items.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { cellHasTMFlag, cellHasTerrainFlag, passableArcCount, randomMatchingLocation, refreshWaypoint, setUpWaypoints, spawnDungeonFeature } from './Architect.ts';
import { buttonInputLoop, drawButton, drawButtonsInState, processButtonInput } from './Buttons.ts';
import { addPoison, applyArmorRunicEffect, attack, attackHit, combatMessage, displayCombatText, flashMonster, handlePaladinFeat, inflictDamage, inflictLethalDamage, killCreature, magicWeaponHit, moralAttack, netEnchant, splitMonster, strLenWithoutEscapes, strengthModifier } from './Combat.ts';
import { calculateDistances } from './Dijkstra.ts';
import { allocGrid, fillGrid, freeGrid, getQualifyingPathLocNear } from './Grid.ts';
import { applyColorAugment, applyColorAverage, applyColorMultiplier, clearCursorPath, clearDisplayBuffer, colorFlash, colorMultiplierFromDungeonLight, confirm, confirmMessages, displayGrid, displayLevel, dumpLevelToScreen, encodeMessageColor, getCellAppearance, getInputTextString, hiliteCell, message, messageColorFromVictim, messageWithColor, nextBrogueEvent, nextKeyPress, normColor, overlayDisplayBuffer, pauseAnimation, plotCharWithColor, printCarriedItemDetails, printString, refreshDungeonCell, refreshSideBar, restoreDisplayBuffer, saveDisplayBuffer, stripShiftFromMovementKeystroke, temporaryMessage, upperCase } from './IO.ts';
import { backUpLighting, createFlare, paintLight, restoreLighting, updateLighting, updateMinersLightRadius } from './Light.ts';
import { randClump, rand_percent, rand_range } from './Math.ts';
import { alertMonster, avoidedFlagsForMonster, canDirectlySeeMonster, canNegateCreatureStatusEffects, canSeeMonster, cloneMonster, demoteMonsterFromLeadership, disentangle, distanceBetween, empowerMonster, fadeInMonster, findAlternativeHomeFor, generateMonster, getQualifyingLocNear, getRandomMonsterSpawnLocation, hasNextCreature, initializeStatus, isPassableOrSecretDoor, iterateCreatures, monsterAtLoc, monsterIsHidden, monsterIsInClass, monsterName, monsterRevealed, monstersAreEnemies, monstersAreTeammates, negateCreatureStatusEffects, nextCreature, openPathBetween, perimeterCoords, resolvePronounEscapes, spawnHorde, stringsMatch, teleport, unAlly, wakeUp } from './Monsters.ts';
import { addScentToCell, becomeAllyWith, discover, freeCaptive, freeCaptivesEmbeddedAt, getLocationFlags, highestPriorityLayer, layerWithTMFlag, printLocationDescription, tileText, updateFieldOfViewDisplay } from './Movement.ts';
import { accuracyFraction, armorAbsorptionMax, armorImageCount, armorReprisalPercent, charmEffectDuration, charmGuardianLifespan, charmHealing, charmNegationRadius, charmProtection, charmRechargeDelay, charmShattering, damageFraction, reflectionChance, ringWisdomMultiplier, runicWeaponChance, staffBladeCount, staffBlinkDistance, staffDamage, staffDamageHigh, staffDamageLow, staffDiscordDuration, staffEntrancementDuration, staffHasteDuration, staffPoison, staffProtection, turnsForFullRegenInThousandths, wandDominate, weaponConfusionDuration, weaponForceDistance, weaponImageCount, weaponImageDuration, weaponParalysisDuration, weaponSlowDuration } from './PowerTables.ts';
import { recordKeystroke, recordKeystrokeSequence, recordMouseClick } from './Recordings.ts';
import { freeCreature, gameOver } from './RogueMain.ts';
import { activateMachine, applyInstantTileEffectsToCreature, armorStealthAdjustment, burnItem, circuitBreakersPreventActivation, currentStealthRange, demoteVisibility, discoverCell, exposeCreatureToFire, exposeTileToElectricity, exposeTileToFire, extinguishFireOnCreature, playerTurnEnded, promoteTile, staffChargeDuration, updateClairvoyance, updateVision } from './Time.ts';
import { struct_PauseBehavior, struct_bolt, struct_brogueButton, struct_buttonState, struct_color, struct_creature, struct_dungeonFeature, struct_item, struct_itemTable, struct_lightSource, struct_pcell, struct_pos, struct_rogueEvent, struct_screenDisplayBuffer, struct_tcell, struct_windowpos } from './structs.ts';
import { $arr, $at2, $cs, $mul64, $rd, $rows, $sadd, $sarr, $sarrOf, $sat, $shl64, $ta, $u64, $view8, $wr, G, P, S, free, llabs, memcpy, memset, printf, sprintf, strcat, strcpy, strlen, strncpy } from '../rt/index.ts';
import { ACKNOWLEDGE_KEY, ALL_ITEMS, AMULET, ANY_KIND_OF_VISIBLE, APPLY_KEY, ARMOR, AUTOTARGET_MODE_EXPLORE, AUTOTARGET_MODE_NONE, AUTOTARGET_MODE_THROW, AUTOTARGET_MODE_USE_STAFF_OR_WAND, AXE, A_ABSORPTION, A_BURDEN, A_DAMPENING, A_IMMOLATION, A_IMMUNITY, A_MULTIPLICITY, A_MUTUALITY, A_REFLECTION, A_REPRISAL, A_RESPIRATION, A_VULNERABILITY, BE_ATTACK, BE_BECKONING, BE_BLINKING, BE_CONJURATION, BE_DAMAGE, BE_DISCORD, BE_DOMINATION, BE_EMPOWERMENT, BE_ENTRANCEMENT, BE_HASTE, BE_HEALING, BE_INVISIBILITY, BE_NEGATION, BE_NONE, BE_OBSTRUCTION, BE_PLENTY, BE_POISON, BE_POLYMORPH, BE_SHIELDING, BE_SLOW, BE_TELEPORT, BE_TUNNELING, BF_DISPLAY_CHAR_ALONG_LENGTH, BF_ELECTRIC, BF_FIERY, BF_HALTS_BEFORE_OBSTRUCTION, BF_NEVER_REFLECTS, BF_NOT_NEGATABLE, BF_PASSES_THRU_CREATURES, BF_TARGET_ALLIES, BF_TARGET_ENEMIES, BOLT_BLINKING, BOLT_DISCORD, BOLT_DOMINATION, BOLT_ENTRANCEMENT, BOLT_HASTE, BOLT_INVISIBILITY, BOLT_LIGHT_SOURCE, BOLT_NEGATION, BOLT_NONE, BOLT_PLENTY, BOLT_POISON, BOLT_POLYMORPH, BOLT_SHIELDING, BOLT_SLOW, BUTTON_NORMAL, BUTTON_PRESSED, B_DRAW, B_ENABLED, B_GRADIENT, B_HOVER_ENABLED, B_KEYPRESS_HIGHLIGHT, CALL_KEY, CAN_BE_DETECTED, CAN_BE_SWAPPED, CHARM, CHARM_FIRE_IMMUNITY, CHARM_GUARDIAN, CHARM_HASTE, CHARM_HEALTH, CHARM_INVISIBILITY, CHARM_LEVITATION, CHARM_NEGATION, CHARM_PROTECTION, CHARM_RECHARGING, CHARM_SHATTERING, CHARM_TELEPATHY, CHARM_TELEPORTATION, COLOR_ESCAPE, COLS, CRYSTAL_WALL, DAGGER, DART, DCOLS, DF_CONFUSION_GAS_CLOUD_POTION, DF_DARKNESS_POTION, DF_DART_EXPLOSION, DF_FORCEFIELD, DF_HOLE_POTION, DF_INCINERATION_POTION, DF_LICHEN_PLANTED, DF_PARALYSIS_GAS_CLOUD_POTION, DF_POISON_GAS_CLOUD_POTION, DF_SACRED_GLYPHS, DF_SHATTERING_SPELL, DF_TUNNELIZE, DIRECTION_COUNT, DISCOVERED, DOOR, DOWN_ARROW, DOWN_KEY, DROP_KEY, DROWS, DUNGEON, EMPOWERMENT_LIGHT, EQUIP_KEY, ESCAPE_KEY, FEAT_PURE_WARRIOR, FEAT_SPECIALIST, FEAT_TONE, FLAIL, FLOOR, FOOD, FORCEFIELD, FP_FACTOR, FRUIT, GAME_MODE_WIZARD, GEM, GOLD, GRANITE, G_AMULET, G_ARMOR, G_BAD_MAGIC, G_CHARM, G_FOOD, G_GEM, G_GOLD, G_GOOD_MAGIC, G_KEY, G_POTION, G_RING, G_SCROLL, G_STAFF, G_WAND, G_WEAPON, HAMMER, HAS_INTRINSIC_POLARITY, HAS_ITEM, HAS_MONSTER, HAS_PLAYER, HAS_STAIRS, HORDE_IS_SUMMONED, HORDE_LEADER_CAPTIVE, HORDE_MACHINE_ONLY, HORDE_NO_PERIODIC_SPAWN, IMPREGNABLE, INCENDIARY_DART, INTERFACE_OPACITY, IN_FIELD_OF_VIEW, IN_LOOP, IS_CHOKEPOINT, IS_IN_MACHINE, ITEM_ATTACKS_ALL_ADJACENT, ITEM_ATTACKS_EXTEND, ITEM_ATTACKS_PENETRATE, ITEM_ATTACKS_QUICKLY, ITEM_ATTACKS_STAGGER, ITEM_CAN_BE_IDENTIFIED, ITEM_CURSED, ITEM_DETECTED, ITEM_EQUIPPED, ITEM_FLAMMABLE, ITEM_IDENTIFIED, ITEM_IS_KEY, ITEM_KIND_AUTO_ID, ITEM_LUNGE_ATTACKS, ITEM_MAGIC_DETECTED, ITEM_MAX_CHARGES_KNOWN, ITEM_PASS_ATTACKS, ITEM_PLAYER_AVOIDS, ITEM_PREPLACED, ITEM_PROTECTED, ITEM_RUNIC, ITEM_RUNIC_HINTED, ITEM_RUNIC_IDENTIFIED, ITEM_SNEAK_ATTACK_BONUS, JAVELIN, KEY, KEYBOARD_LABELS, KEYSTROKE, KEY_ID_MAXIMUM, KNOWN_TO_BE_TRAP_FREE, LIQUID, MACE, MAGIC_MAPPED, MAGIC_POLARITY_ANY, MAGIC_POLARITY_BENEVOLENT, MAGIC_POLARITY_MALEVOLENT, MAGIC_POLARITY_NEUTRAL, MAX_BOLT_LENGTH, MAX_PACK_ITEMS, MA_AVOID_CORRIDORS, MA_HIT_STEAL_FLEE, MA_NON_NEGATABLE_ABILITIES, MA_REFLECT_100, MB_BOUND_TO_LEADER, MB_CAPTIVE, MB_DOES_NOT_TRACK_LEADER, MB_FOLLOWER, MB_IS_DYING, MB_IS_FALLING, MB_JUST_SUMMONED, MB_SEIZED, MB_SEIZING, MB_SUBMERGED, MESSAGE_LINES, MK_CHARM_GUARDIAN, MK_SPECTRAL_BLADE, MK_WARDEN_OF_YENDOR, MODE_NORMAL, MODE_PERM_FLEEING, MONSTER_ALLY, MONSTER_CLASS_COUNT, MONSTER_FLEEING, MONSTER_SLEEPING, MONSTER_TRACKING_SCENT, MONST_ATTACKABLE_THRU_WALLS, MONST_DEFEND_DEGRADE_WEAPON, MONST_DIES_IF_NEGATED, MONST_FIERY, MONST_FLEES_NEAR_DEATH, MONST_IMMOBILE, MONST_IMMUNE_TO_FIRE, MONST_IMMUNE_TO_WEAPONS, MONST_INANIMATE, MONST_INVISIBLE, MONST_INVULNERABLE, MONST_MAINTAINS_DISTANCE, MONST_NO_POLYMORPH, MONST_REFLECT_50, MOUSE_ENTERED_CELL, MOUSE_UP, NEGATABLE_TRAITS, NEVER_IDENTIFIABLE, NOTHING, NUMBER_ARMOR_ENCHANT_KINDS, NUMBER_ARMOR_KINDS, NUMBER_FOOD_KINDS, NUMBER_GOOD_ARMOR_ENCHANT_KINDS, NUMBER_GOOD_STAFF_KINDS, NUMBER_GOOD_WEAPON_ENCHANT_KINDS, NUMBER_ITEM_CATEGORIES, NUMBER_ITEM_COLORS, NUMBER_ITEM_GEMS, NUMBER_ITEM_METALS, NUMBER_ITEM_TITLES, NUMBER_ITEM_WOODS, NUMBER_MONSTER_KINDS, NUMBER_RING_KINDS, NUMBER_STAFF_KINDS, NUMBER_TERRAIN_LAYERS, NUMBER_TITLE_PHONEMES, NUMBER_WEAPON_KINDS, NUMBER_WEAPON_RUNIC_KINDS, NUMPAD_2, NUMPAD_8, PIKE, POTION, POTION_CONFUSION, POTION_DARKNESS, POTION_DESCENT, POTION_DETECT_MAGIC, POTION_FIRE_IMMUNITY, POTION_HALLUCINATION, POTION_HASTE_SELF, POTION_INCINERATION, POTION_INVISIBILITY, POTION_LEVITATION, POTION_LICHEN, POTION_LIFE, POTION_PARALYSIS, POTION_POISON, POTION_STRENGTH, POTION_STRENGTH_LIGHT, POTION_TELEPATHY, PRENAMED_CATEGORY, PRESSURE_PLATE_DEPRESSED, RAPIER, RATION, REFRESH_SIDEBAR, RELABEL_KEY, REQUIRE_ACKNOWLEDGMENT, RETURN_KEY, RIGHT_MOUSE_UP, RING, RING_AWARENESS, RING_CLAIRVOYANCE, RING_LIGHT, RING_REAPING, RING_REGENERATION, RING_STEALTH, RING_TRANSFERENCE, RING_WISDOM, RNG_COSMETIC, ROWS, SCROLL, SCROLL_AGGRAVATE_MONSTER, SCROLL_DISCORD, SCROLL_ENCHANTING, SCROLL_ENCHANTMENT_LIGHT, SCROLL_IDENTIFY, SCROLL_MAGIC_MAPPING, SCROLL_NEGATION, SCROLL_PROTECTION_LIGHT, SCROLL_PROTECT_ARMOR, SCROLL_PROTECT_WEAPON, SCROLL_RECHARGING, SCROLL_REMOVE_CURSE, SCROLL_SANCTUARY, SCROLL_SHATTERING, SCROLL_SUMMON_MONSTER, SCROLL_TELEPORT, SECRET_DOOR, SPEAR, STABLE_MEMORY, STAFF, STAFF_BLINKING, STAFF_CONJURATION, STAFF_DISCORD, STAFF_ENTRANCEMENT, STAFF_FIRE, STAFF_HASTE, STAFF_HEALING, STAFF_LIGHTNING, STAFF_OBSTRUCTION, STAFF_POISON, STAFF_PROTECTION, STAFF_TUNNELING, STATUS_AGGRAVATING, STATUS_BURNING, STATUS_CONFUSED, STATUS_DARKNESS, STATUS_DISCORDANT, STATUS_DONNING, STATUS_ENTRANCED, STATUS_HALLUCINATING, STATUS_HASTED, STATUS_IMMUNE_TO_FIRE, STATUS_INVISIBLE, STATUS_LEVITATING, STATUS_LIFESPAN_REMAINING, STATUS_MAGICAL_FEAR, STATUS_NAUSEOUS, STATUS_NUTRITION, STATUS_POISONED, STATUS_SHIELDED, STATUS_SLOWED, STATUS_TELEPATHIC, STATUS_WEAKENED, STAT_BAR_WIDTH, STOMACH_SIZE, SWAP_KEY, TEXT_INPUT_NORMAL, THROW_KEY, TM_EXTINGUISHES_FIRE, TM_IS_SECRET, TM_LIST_IN_SIDEBAR, TM_PROMOTES_ON_ITEM, TM_PROMOTES_ON_ITEM_PICKUP, TM_PROMOTES_ON_PLAYER_ENTRY, TM_PROMOTES_WITHOUT_KEY, TM_REFLECTS_BOLTS, TM_STAND_IN_TILE, TM_SWAP_ENCHANTS_ACTIVATION, TURNS_FOR_FULL_REGEN, T_AUTO_DESCENT, T_DIVIDES_LEVEL, T_ENTANGLES, T_IS_DEEP_WATER, T_IS_DF_TRAP, T_IS_FIRE, T_IS_FLAMMABLE, T_LAVA_INSTA_DEATH, T_MOVES_ITEMS, T_OBSTRUCTS_DIAGONAL_MOVEMENT, T_OBSTRUCTS_ITEMS, T_OBSTRUCTS_PASSABILITY, T_OBSTRUCTS_VISION, T_PATHING_BLOCKER, T_SPONTANEOUSLY_IGNITES, UNEQUIP_KEY, UP_ARROW, UP_KEY, VISIBLE, WALL, WAND, WAR_AXE, WEAPON, WHIP, W_CONFUSION, W_FORCE, W_MERCY, W_MULTIPLICITY, W_PARALYSIS, W_SLAYING, W_SLOWING, W_SPEED, false_, true_ } from './consts.ts';


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

export function initializeItem(): struct_item | null {
  let i = 0;
  let theItem = null;
  theItem = new struct_item();
  memset(theItem, 0, 352);
  theItem.category = 0;
  theItem.kind = 0;
  theItem.flags = 0;
  theItem.displayChar = 38;
  theItem.foreColor = G.itemColor;
  theItem.inventoryColor = G.white;
  theItem.inventoryLetter = 0;
  theItem.armor = 0;
  theItem.strengthRequired = 0;
  theItem.enchant1 = 0;
  theItem.enchant2 = 0;
  theItem.timesEnchanted = 0;
  theItem.vorpalEnemy = 0;
  theItem.charges = 0;
  theItem.quantity = 1;
  theItem.quiverNumber = 0;
  theItem.originDepth = 0;
  theItem.inscription[0] = 0;
  theItem.lastUsed[0] = 0;
  theItem.lastUsed[1] = 0;
  theItem.lastUsed[2] = 0;
  theItem.nextItem = null;
  for (i = 0; KEY_ID_MAXIMUM > i; i = i + 1 << 16 >> 16) {
    theItem.keyLoc[i].loc.$cp(struct_pos.$of());
    theItem.keyLoc[i].machine = 0;
    theItem.keyLoc[i].disposableHere = false_;
  }
  return theItem;
}

export async function generateItem(theCategory: number, theKind: number): Promise<struct_item | null> {
  let theItem = initializeItem();
  await makeItemInto(theItem, theCategory, theKind);
  return theItem;
}

function pickItemCategory(theCategory: number): number {
  let i = 0;
  let sum = 0;
  let randIndex = 0;
  let correspondingCategories = $ta(Uint16Array, 13, [GOLD, SCROLL, POTION, STAFF, WAND, WEAPON, ARMOR, FOOD, RING, CHARM, AMULET, GEM, KEY]);
  sum = 0;
  for (i = 0; 13 > i; i = i + 1 << 16 >> 16) {
    if (0 >= theCategory || (theCategory & correspondingCategories[i]) >>> 0) {
      sum = sum + G.itemGenerationProbabilities.a[G.itemGenerationProbabilities.o + i] << 16 >> 16;
    }
  }
  if (sum === 0) {
    return theCategory;
  }
  randIndex = rand_range(1, sum) << 16 >> 16;
  for (i = 0; ; i = i + 1 << 16 >> 16) {
    if (0 >= theCategory || (theCategory & correspondingCategories[i]) >>> 0) {
      if (G.itemGenerationProbabilities.a[G.itemGenerationProbabilities.o + i] >= randIndex) {
        return correspondingCategories[i];
      }
      randIndex = randIndex - G.itemGenerationProbabilities.a[G.itemGenerationProbabilities.o + i] << 16 >> 16;
    }
  }
}

export function getHallucinatedItemCategory(): number {
  let itemCategories = $ta(Int32Array, 10, [FOOD, WEAPON, ARMOR, POTION, SCROLL, STAFF, WAND, RING, CHARM, GOLD]);
  return itemCategories[rand_range(0, 9)];
}

export function getItemCategoryGlyph(theCategory: number): number {
  switch (theCategory >>> 0) {
  case FOOD:
    return G_FOOD;
  case WEAPON:
    return G_WEAPON;
  case ARMOR:
    return G_ARMOR;
  case SCROLL:
    return G_SCROLL;
  case POTION:
    return G_POTION;
  case STAFF:
    return G_STAFF;
  case WAND:
    return G_WAND;
  case GEM:
    return G_GEM;
  case RING:
    return G_RING;
  case CHARM:
    return G_CHARM;
  case KEY:
    return G_KEY;
  case GOLD:
    return G_GOLD;
  case AMULET:
    return G_AMULET;
  default:
    break;
  }
  return 0;
}

function itemIsThrowingWeapon(theItem: struct_item | null): number {
  if (theItem && theItem.category === WEAPON && (theItem.kind === DART || theItem.kind === JAVELIN || theItem.kind === INCENDIARY_DART)) {
    return true_;
  }
  return false_;
}

export function itemIsHeavyWeapon(theItem: struct_item | null): number {
  if (theItem && theItem.category === WEAPON && !itemIsThrowingWeapon(theItem) && G.weaponTable[theItem.kind].strengthRequired > 15) {
    return true_;
  }
  return false_;
}

export function itemIsPositivelyEnchanted(theItem: struct_item | null): number {
  return (theItem.enchant1 > 0 ? 1 : 0) << 24 >> 24;
}

export async function makeItemInto(theItem: struct_item | null, itemCategory: number, itemKind: number): Promise<struct_item | null> {
  let theEntry = null;
  if (0 >= itemCategory) {
    itemCategory = ALL_ITEMS;
  }
  itemCategory = pickItemCategory(itemCategory);
  theItem.category = itemCategory & 0xffff;
  theItem.displayChar = getItemCategoryGlyph(theItem.category);
  switch (itemCategory) {
  case FOOD:
    if (0 > itemKind) {
      itemKind = chooseKind(G.foodTable[0], NUMBER_FOOD_KINDS);
    }
    theEntry = $sat(G.foodTable, itemKind);
    theItem.flags = (theItem.flags | ITEM_IDENTIFIED) >>> 0;
    break;
  case WEAPON:
    if (0 > itemKind) {
      itemKind = chooseKind(G.weaponTable[0], NUMBER_WEAPON_KINDS);
    }
    theEntry = $sat(G.weaponTable, itemKind);
    theItem.damage.$cp(G.weaponTable[itemKind].range);
    theItem.strengthRequired = G.weaponTable[itemKind].strengthRequired;
    switch (itemKind) {
    case DAGGER:
      theItem.flags = (theItem.flags | ITEM_SNEAK_ATTACK_BONUS) >>> 0;
      break;
    case MACE:
    case HAMMER:
      theItem.flags = (theItem.flags | ITEM_ATTACKS_STAGGER) >>> 0;
      break;
    case WHIP:
      theItem.flags = (theItem.flags | ITEM_ATTACKS_EXTEND) >>> 0;
      break;
    case RAPIER:
      theItem.flags = (theItem.flags | (ITEM_ATTACKS_QUICKLY | ITEM_LUNGE_ATTACKS)) >>> 0;
      break;
    case FLAIL:
      theItem.flags = (theItem.flags | ITEM_PASS_ATTACKS) >>> 0;
      break;
    case SPEAR:
    case PIKE:
      theItem.flags = (theItem.flags | ITEM_ATTACKS_PENETRATE) >>> 0;
      break;
    case AXE:
    case WAR_AXE:
      theItem.flags = (theItem.flags | ITEM_ATTACKS_ALL_ADJACENT) >>> 0;
      break;
    default:
      break;
    }
    if (rand_percent(40)) {
      theItem.enchant1 = theItem.enchant1 + rand_range(1, 3) << 16 >> 16;
      if (rand_percent(50)) {
        theItem.enchant1 = theItem.enchant1 * -1 << 16 >> 16;
        theItem.flags = (theItem.flags | ITEM_CURSED) >>> 0;
        if (rand_percent(33)) {
          theItem.enchant2 = rand_range(NUMBER_GOOD_WEAPON_ENCHANT_KINDS, NUMBER_WEAPON_RUNIC_KINDS - 1) << 16 >> 16;
          theItem.flags = (theItem.flags | ITEM_RUNIC) >>> 0;
        }
      } else if (Math.trunc(Math.trunc($mul64(rand_range(3, 10), (theItem.flags & ITEM_ATTACKS_STAGGER) >>> 0 ? 2 : 1) / ((theItem.flags & ITEM_ATTACKS_QUICKLY) >>> 0 ? 2 : 1)) / ((theItem.flags & ITEM_ATTACKS_EXTEND) >>> 0 ? 2 : 1)) > theItem.damage.lowerBound) {
        theItem.enchant2 = rand_range(0, NUMBER_GOOD_WEAPON_ENCHANT_KINDS - 1) << 16 >> 16;
        theItem.flags = (theItem.flags | ITEM_RUNIC) >>> 0;
        if (theItem.enchant2 === W_SLAYING) {
          theItem.vorpalEnemy = chooseVorpalEnemy();
        }
      } else {
        while (rand_percent(10)) {
          theItem.enchant1 = theItem.enchant1 + 1 << 16 >> 16;
        }
      }
    }
    if (itemKind === DART || itemKind === INCENDIARY_DART || itemKind === JAVELIN) {
      if (itemKind === INCENDIARY_DART) {
        theItem.quantity = rand_range(3, 6) << 16 >> 16;
      } else {
        theItem.quantity = rand_range(5, 18) << 16 >> 16;
      }
      theItem.quiverNumber = rand_range(1, 60000) & 0xffff;
      theItem.flags = (theItem.flags & ~(ITEM_CURSED | ITEM_RUNIC) >>> 0) >>> 0;
      theItem.enchant1 = 0;
    }
    theItem.charges = G.gameConst.weaponKillsToAutoID << 16 >> 16;
    break;
  case ARMOR:
    if (0 > itemKind) {
      itemKind = chooseKind(G.armorTable[0], NUMBER_ARMOR_KINDS);
    }
    theEntry = $sat(G.armorTable, itemKind);
    theItem.armor = randClump(G.armorTable[itemKind].range);
    theItem.strengthRequired = G.armorTable[itemKind].strengthRequired;
    theItem.charges = G.gameConst.armorDelayToAutoID << 16 >> 16;
    if (rand_percent(40)) {
      theItem.enchant1 = theItem.enchant1 + rand_range(1, 3) << 16 >> 16;
      if (rand_percent(50)) {
        theItem.enchant1 = theItem.enchant1 * -1 << 16 >> 16;
        theItem.flags = (theItem.flags | ITEM_CURSED) >>> 0;
        if (rand_percent(33)) {
          theItem.enchant2 = rand_range(NUMBER_GOOD_ARMOR_ENCHANT_KINDS, NUMBER_ARMOR_ENCHANT_KINDS - 1) << 16 >> 16;
          theItem.flags = (theItem.flags | ITEM_RUNIC) >>> 0;
        }
      } else if (rand_range(0, 95) > theItem.armor) {
        theItem.enchant2 = rand_range(0, NUMBER_GOOD_ARMOR_ENCHANT_KINDS - 1) << 16 >> 16;
        theItem.flags = (theItem.flags | ITEM_RUNIC) >>> 0;
        if (theItem.enchant2 === A_IMMUNITY) {
          theItem.vorpalEnemy = chooseVorpalEnemy();
        }
      } else {
        while (rand_percent(10)) {
          theItem.enchant1 = theItem.enchant1 + 1 << 16 >> 16;
        }
      }
    }
    break;
  case SCROLL:
    if (0 > itemKind) {
      itemKind = chooseKind(G.scrollTable, G.gameConst.numberScrollKinds << 16 >> 16);
    }
    theEntry = $sadd(G.scrollTable, itemKind);
    theItem.flags = (theItem.flags | ITEM_FLAMMABLE) >>> 0;
    break;
  case POTION:
    if (0 > itemKind) {
      itemKind = chooseKind(G.potionTable, G.gameConst.numberPotionKinds << 16 >> 16);
    }
    theEntry = $sadd(G.potionTable, itemKind);
    break;
  case STAFF:
    if (0 > itemKind) {
      itemKind = chooseKind(G.staffTable[0], NUMBER_STAFF_KINDS);
    }
    theEntry = $sat(G.staffTable, itemKind);
    theItem.charges = 2;
    if (rand_percent(50)) {
      theItem.charges = theItem.charges + 1 << 16 >> 16;
      if (rand_percent(15)) {
        theItem.charges = theItem.charges + 1 << 16 >> 16;
        while (rand_percent(10)) {
          theItem.charges = theItem.charges + 1 << 16 >> 16;
        }
      }
    }
    theItem.enchant1 = theItem.charges;
    theItem.enchant2 = (itemKind === STAFF_BLINKING || itemKind === STAFF_OBSTRUCTION ? 1000 : 500) << 16 >> 16;
    break;
  case WAND:
    if (0 > itemKind) {
      itemKind = chooseKind(G.wandTable, G.gameConst.numberWandKinds << 16 >> 16);
    }
    theEntry = $sadd(G.wandTable, itemKind);
    theItem.charges = randClump($sadd(G.wandTable, itemKind).range);
    break;
  case RING:
    if (0 > itemKind) {
      itemKind = chooseKind(G.ringTable[0], NUMBER_RING_KINDS);
    }
    theEntry = $sat(G.ringTable, itemKind);
    theItem.enchant1 = randClump(G.ringTable[itemKind].range);
    theItem.charges = G.gameConst.ringDelayToAutoID << 16 >> 16;
    if (rand_percent(16)) {
      theItem.enchant1 = theItem.enchant1 * -1 << 16 >> 16;
      theItem.flags = (theItem.flags | ITEM_CURSED) >>> 0;
    } else {
      while (rand_percent(10)) {
        theItem.enchant1 = theItem.enchant1 + 1 << 16 >> 16;
      }
    }
    break;
  case CHARM:
    if (0 > itemKind) {
      itemKind = chooseKind(G.charmTable, G.gameConst.numberCharmKinds << 16 >> 16);
    }
    theItem.charges = 0;
    theItem.enchant1 = randClump($sadd(G.charmTable, itemKind).range);
    while (rand_percent(7)) {
      theItem.enchant1 = theItem.enchant1 + 1 << 16 >> 16;
    }
    theItem.flags = (theItem.flags | ITEM_IDENTIFIED) >>> 0;
    break;
  case GOLD:
    theEntry = null;
    theItem.quantity = rand_range(50 + Math.imul(G.rogue.depthLevel * 10, G.gameConst.depthAccelerator), 100 + Math.imul(G.rogue.depthLevel * 15, G.gameConst.depthAccelerator)) << 16 >> 16;
    break;
  case AMULET:
    theEntry = null;
    itemKind = 0;
    theItem.flags = (theItem.flags | ITEM_IDENTIFIED) >>> 0;
    break;
  case GEM:
    theEntry = null;
    itemKind = 0;
    theItem.flags = (theItem.flags | ITEM_IDENTIFIED) >>> 0;
    break;
  case KEY:
    theEntry = null;
    theItem.flags = (theItem.flags | ITEM_IDENTIFIED) >>> 0;
    break;
  default:
    theEntry = null;
    await message(S("something has gone terribly wrong!"), REQUIRE_ACKNOWLEDGMENT);
    break;
  }
  if (theItem && !((theItem.flags & ITEM_IDENTIFIED) >>> 0) && (!(theItem.category & (POTION | SCROLL)) || theEntry && !theEntry.identified)) {
    theItem.flags = (theItem.flags | ITEM_CAN_BE_IDENTIFIED) >>> 0;
  }
  theItem.kind = itemKind;
  return theItem;
}

export function chooseKind(theTable: struct_itemTable | null, numKinds: number): number {
  let i = 0;
  let totalFrequencies = 0;
  let randomFrequency = 0;
  for (i = 0; numKinds > i; i = i + 1 << 16 >> 16) {
    totalFrequencies = totalFrequencies + (0 > $sadd(theTable, i).frequency ? 0 : $sadd(theTable, i).frequency) << 16 >> 16;
  }
  randomFrequency = rand_range(1, totalFrequencies) << 16 >> 16;
  for (i = 0; randomFrequency > $sadd(theTable, i).frequency; i = i + 1 << 16 >> 16) {
    randomFrequency = randomFrequency - (0 > $sadd(theTable, i).frequency ? 0 : $sadd(theTable, i).frequency) << 16 >> 16;
  }
  return i;
}

export async function placeItemAt(theItem: struct_item | null, dest: struct_pos): Promise<struct_item | null> {
  let $t1: any, $t2: any, $t3: any;
  let layer = 0;
  let theItemName = new Int8Array(79);
  let buf = new Int8Array(79);
  if (!isPosInMap(dest)) {
    randomMatchingLocation(dest, FLOOR, NOTHING, -1);
  }
  theItem.loc.$cp(dest);
  removeItemFromChain(theItem, G.floorItems);
  addItemToChain(theItem, G.floorItems);
  ($t1 = pmapAt(theItem.loc), $t1.flags = ($t1.flags | HAS_ITEM) >>> 0);
  if ((theItem.flags & ITEM_MAGIC_DETECTED) >>> 0 && itemMagicPolarity(theItem)) {
    ($t2 = pmapAt(theItem.loc), $t2.flags = ($t2.flags | ITEM_DETECTED) >>> 0);
  }
  if (cellHasTerrainFlag(dest, T_IS_DF_TRAP) && !cellHasTerrainFlag(dest, T_MOVES_ITEMS) && !((pmapAt(dest).flags & PRESSURE_PLATE_DEPRESSED) >>> 0)) {
    ($t3 = pmapAt(dest), $t3.flags = ($t3.flags | PRESSURE_PLATE_DEPRESSED) >>> 0);
    if (($at2(G.pmap, dest.x, dest.y).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
      if (cellHasTMFlag(dest, TM_IS_SECRET)) {
        await discover(dest.x, dest.y);
        await refreshDungeonCell(dest.$clone());
      }
      itemName(theItem, P(theItemName), false_, false_, null);
      sprintf(P(buf), S("a pressure plate clicks underneath the %s!"), P(theItemName));
      await message(P(buf), REQUIRE_ACKNOWLEDGMENT);
    }
    for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
      if ((G.tileCatalog[pmapAt(dest).layers[layer]].flags & T_IS_DF_TRAP) >>> 0) {
        await spawnDungeonFeature(dest.x, dest.y, $sat(G.dungeonFeatureCatalog, G.tileCatalog[pmapAt(dest).layers[layer]].fireType), true_, false_);
        await promoteTile(dest.x, dest.y, layer, false_);
      }
    }
  }
  return theItem;
}

function fillItemSpawnHeatMap(heatMap: Ptr | null, heatLevel: number, loc: struct_pos): void {
  if (pmapAt(loc).layers[DUNGEON] >>> 0 === DOOR) {
    heatLevel = heatLevel + 10 & 0xffff;
  } else if (pmapAt(loc).layers[DUNGEON] >>> 0 === SECRET_DOOR) {
    heatLevel = heatLevel + 3000 & 0xffff;
  }
  if (heatMap.a[heatMap.o + loc.x][loc.y] > heatLevel) {
    heatMap.a[heatMap.o + loc.x][loc.y] = heatLevel;
  }
  for (let dir = 0; 4 > dir; ++dir) {
    let neighbor = posNeighborInDirection(loc, dir).$clone();
    if (isPosInMap(neighbor) && !cellHasTerrainFlag(neighbor, T_IS_DEEP_WATER | T_LAVA_INSTA_DEATH | T_AUTO_DESCENT) && isPassableOrSecretDoor(neighbor) && heatMap.a[heatMap.o + neighbor.x][neighbor.y] > heatLevel) {
      fillItemSpawnHeatMap(heatMap, heatLevel, neighbor);
    }
  }
}

function coolHeatMapAt(heatMap: Ptr | null, loc: struct_pos, totalHeat: Ptr | null): void {
  let k = 0;
  let l = 0;
  let currentHeat = 0;
  currentHeat = heatMap.a[heatMap.o + loc.x][loc.y];
  if (currentHeat === 0) {
    return;
  }
  totalHeat.a[totalHeat.o] = totalHeat.a[totalHeat.o] - heatMap.a[heatMap.o + loc.x][loc.y];
  heatMap.a[heatMap.o + loc.x][loc.y] = 0;
  for (k = -5; 5 >= k; k = k + 1 << 16 >> 16) {
    for (l = -5; 5 >= l; l = l + 1 << 16 >> 16) {
      if (coordinatesAreInMap(loc.x + k << 16 >> 16, loc.y + l << 16 >> 16) && heatMap.a[heatMap.o + (loc.x + k)][loc.y + l] === currentHeat) {
        heatMap.a[heatMap.o + (loc.x + k)][loc.y + l] = (1 > (heatMap.a[heatMap.o + (loc.x + k)][loc.y + l] / 10 | 0) ? 1 : heatMap.a[heatMap.o + (loc.x + k)][loc.y + l] / 10 | 0) & 0xffff;
        totalHeat.a[totalHeat.o] = totalHeat.a[totalHeat.o] - $u64(currentHeat - heatMap.a[heatMap.o + (loc.x + k)][loc.y + l]);
      }
    }
  }
}

function getItemSpawnLoc(heatMap: Ptr | null, x: Ptr | null, y: Ptr | null, totalHeat: Ptr | null): number {
  let randIndex = 0;
  let currentHeat = 0;
  let i = 0;
  let j = 0;
  if (0 >= totalHeat.a[totalHeat.o]) {
    return false_;
  }
  randIndex = $u64(rand_range(1, totalHeat.a[totalHeat.o]));
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      currentHeat = heatMap.a[heatMap.o + i][j];
      if (currentHeat >= randIndex) {
        x.a[x.o] = i;
        y.a[y.o] = j;
        return true_;
      }
      randIndex = randIndex - currentHeat;
    }
  }
  ;
  return false_;
}

export async function populateItems(upstairs: struct_pos): Promise<void> {
  let $t1: any, $t2: any, $t3: any;
  if (!(!(G.rogue.mode >>> 0 === GAME_MODE_WIZARD) || 1)) {
    return;
  }
  let itemSpawnHeatMap = $arr(79, () => new Uint16Array(29));
  let numberOfItems = 0;
  let numberOfGoldPiles = 0;
  let goldBonusProbability = 0;
  const totalHeat = new Float64Array(1);
  let POW_GOLD = $ta(Int32Array, 26, [0, 1, 8, 28, 68, 135, 236, 378, 568, 813, 1122, 1500, 1956, 2497, 3131, 3864, 4705, 5660, 6738, 7946, 9292, 10783, 12427, 14232, 16204, 18353]);
  let POW_FOOD = $ta(Float64Array, 50, [65536, 167059, 288797, 425854, 575558, 736180, 906488, 1085553, 1272645, 1467168, 1668630, 1876612, 2090756, 2310749, 2536314, 2767208, 3003211, 3244126, 3489773, 3739989, 3994624, 4253540, 4516609, 4783712, 5054741, 5329591, 5608167, 5890379, 6176141, 6465373, 6758000, 7053950, 7353155, 7655551, 7961076, 8269672, 8581283, 8895856, 9213341, 9533687, 9856849, 10182782, 10511443, 10842789, 11176783, 11513384, 11852556, 12194264, 12538472, 12885148]);
  let potionTableCopy = $sarr(struct_itemTable, $u64(G.gameConst.numberPotionKinds))[0];
  let scrollTableCopy = $sarr(struct_itemTable, $u64(G.gameConst.numberScrollKinds))[0];
  memcpy(potionTableCopy, G.potionTable, $u64(G.gameConst.numberPotionKinds) * 1576);
  memcpy(scrollTableCopy, G.scrollTable, $u64(G.gameConst.numberScrollKinds) * 1576);
  if (G.rogue.depthLevel > G.gameConst.amuletLevel) {
    numberOfItems = G.lumenstoneDistribution.a[G.lumenstoneDistribution.o + (G.rogue.depthLevel - G.gameConst.amuletLevel - 1)];
    numberOfGoldPiles = 0;
  } else {
    for (let i = 0; G.gameConst.numberMeteredItems > i; ++i) {
      ($t1 = $sadd(G.rogue.meteredItems, i), $t1.frequency = $t1.frequency + $sadd(G.meteredItemsGenerationTable, i).incrementFrequency);
    }
    numberOfItems = 3;
    while (rand_percent(60)) {
      numberOfItems = numberOfItems + 1 << 16 >> 16;
    }
    if (2 >= G.rogue.depthLevel) {
      numberOfItems = numberOfItems + 2 << 16 >> 16;
    } else if (4 >= G.rogue.depthLevel) {
      numberOfItems = numberOfItems + 1 << 16 >> 16;
    }
    numberOfItems = numberOfItems + G.gameConst.extraItemsPerLevel << 16 >> 16;
    numberOfGoldPiles = ((Math.imul(G.rogue.depthLevel, G.gameConst.depthAccelerator) / 4 | 0) > 5 ? 5 : Math.imul(G.rogue.depthLevel, G.gameConst.depthAccelerator) / 4 | 0) << 16 >> 16;
    for (goldBonusProbability = 60; rand_percent(goldBonusProbability) && 10 >= numberOfGoldPiles; goldBonusProbability = goldBonusProbability - 15 << 16 >> 16) {
      numberOfGoldPiles = numberOfGoldPiles + 1 << 16 >> 16;
    }
    if (G.rogue.depthLevel >= G.gameConst.goldAdjustmentStartDepth) {
      if ($u64(POW_GOLD[Math.imul(G.rogue.depthLevel, G.gameConst.depthAccelerator) - 1] + 320 * (Math.imul(G.rogue.depthLevel, G.gameConst.depthAccelerator) - 1)) > G.rogue.goldGenerated) {
        numberOfGoldPiles = numberOfGoldPiles + 2 << 16 >> 16;
      } else if (G.rogue.goldGenerated > $u64(POW_GOLD[Math.imul(G.rogue.depthLevel, G.gameConst.depthAccelerator) - 1] + 420 * (Math.imul(G.rogue.depthLevel, G.gameConst.depthAccelerator) - 1))) {
        numberOfGoldPiles = numberOfGoldPiles - 2 << 16 >> 16;
      }
    }
  }
  for (let i = 0; DCOLS > i; ++i) {
    for (let j = 0; DROWS > j; ++j) {
      itemSpawnHeatMap[i][j] = 50000;
    }
  }
  fillItemSpawnHeatMap(P(itemSpawnHeatMap), 5, upstairs);
  totalHeat[0] = 0;
  for (let j = 0; DROWS > j; ++j) {
    for (let i = 0; DCOLS > i; ++i) {
      if (cellHasTerrainFlag(struct_pos.$of(i << 16 >> 16, j << 16 >> 16), T_OBSTRUCTS_ITEMS | T_PATHING_BLOCKER) || ($at2(G.pmap, i, j).flags & (IS_CHOKEPOINT | IN_LOOP | IS_IN_MACHINE)) >>> 0 || passableArcCount(i << 16 >> 16, j << 16 >> 16) > 1) {
        itemSpawnHeatMap[i][j] = 0;
      } else if (itemSpawnHeatMap[i][j] === 50000) {
        itemSpawnHeatMap[i][j] = 0;
        $at2(G.pmap, i, j).layers[DUNGEON] = WALL;
      }
      totalHeat[0] = totalHeat[0] + itemSpawnHeatMap[i][j];
    }
  }
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    let map = allocGrid();
    for (let i = 0; DCOLS > i; ++i) {
      for (let j = 0; DROWS > j; ++j) {
        $wr(map.a[map.o + i], j, itemSpawnHeatMap[i][j] * -1 << 16 >> 16);
      }
    }
    await dumpLevelToScreen();
    await displayGrid(map);
    freeGrid(map);
    await temporaryMessage(S("Item spawn heat map:"), REQUIRE_ACKNOWLEDGMENT);
  }
  let randomDepthOffset = 0;
  if (G.rogue.depthLevel > 2) {
    randomDepthOffset = rand_range(-1, 1) | 0;
    randomDepthOffset += rand_range(-1, 1);
  }
  for (let i = 0; numberOfItems > i; ++i) {
    let theCategory = ALL_ITEMS & ~GOLD;
    let theKind = -1;
    for (let j = 0; G.gameConst.numberMeteredItems > j; ++j) {
      if ($sadd(G.meteredItemsGenerationTable, j).incrementFrequency !== 0) {
        if (j >= G.gameConst.numberScrollKinds) {
          $sadd(G.potionTable, (j - G.gameConst.numberScrollKinds)).frequency = $sadd(G.rogue.meteredItems, j).frequency << 16 >> 16;
        } else {
          $sadd(G.scrollTable, j).frequency = $sadd(G.rogue.meteredItems, j).frequency << 16 >> 16;
        }
      }
    }
    if (Math.trunc($mul64($mul64(POW_FOOD[G.rogue.depthLevel - 1] + $mul64(randomDepthOffset, FP_FACTOR), G.foodTable[RATION].power), 45) / 100) >= $mul64($mul64(G.rogue.foodSpawned + (G.foodTable[RATION].power / 3 | 0), 4), FP_FACTOR)) {
      theCategory = FOOD;
      if (G.rogue.depthLevel > G.gameConst.amuletLevel) {
        numberOfItems = numberOfItems + 1 << 16 >> 16;
      }
    } else if (G.rogue.depthLevel > G.gameConst.amuletLevel) {
      theCategory = GEM;
    } else {
      for (let j = 0; G.gameConst.numberMeteredItems > j; ++j) {
        if ($sadd(G.meteredItemsGenerationTable, j).levelScaling !== 0 && Math.imul(G.rogue.depthLevel, $sadd(G.meteredItemsGenerationTable, j).levelScaling) + randomDepthOffset > Math.imul($sadd(G.rogue.meteredItems, j).numberSpawned, $sadd(G.meteredItemsGenerationTable, j).genMultiplier) + $sadd(G.meteredItemsGenerationTable, j).genIncrement) {
          theCategory = $sadd(G.meteredItemsGenerationTable, j).category << 16 >> 16;
          theKind = $sadd(G.meteredItemsGenerationTable, j).kind;
          break;
        }
        if (G.rogue.depthLevel === $sadd(G.meteredItemsGenerationTable, j).levelGuarantee && $sadd(G.meteredItemsGenerationTable, j).itemNumberGuarantee > $sadd(G.rogue.meteredItems, j).numberSpawned) {
          theCategory = $sadd(G.meteredItemsGenerationTable, j).category << 16 >> 16;
          theKind = $sadd(G.meteredItemsGenerationTable, j).kind;
          break;
        }
      }
    }
    let theItem = await generateItem(theCategory & 0xffff, theKind);
    theItem.originDepth = G.rogue.depthLevel;
    if (theItem.category & FOOD) {
      G.rogue.foodSpawned += G.foodTable[theItem.kind].power;
      if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
        printf(S("\n(:)  Depth %i: generated food"), G.rogue.depthLevel);
      }
    }
    let itemPlacementLoc = struct_pos.$of(-1, -1).$clone();
    if (theItem.category & FOOD || theItem.category & POTION && theItem.kind === POTION_STRENGTH) {
      do {
        randomMatchingLocation(itemPlacementLoc, FLOOR, NOTHING, -1);
      } while (passableArcCount(itemPlacementLoc.x, itemPlacementLoc.y) > 1);
    } else {
      getItemSpawnLoc(P(itemSpawnHeatMap), P(itemPlacementLoc, "x"), P(itemPlacementLoc, "y"), P(totalHeat, 0));
    }
    ;
    coolHeatMapAt(P(itemSpawnHeatMap), itemPlacementLoc, P(totalHeat, 0));
    for (let j = 0; G.gameConst.numberMeteredItems > j; ++j) {
      if (theItem.category & $sadd(G.meteredItemsGenerationTable, j).category && theItem.kind === $sadd(G.meteredItemsGenerationTable, j).kind) {
        if (j >= G.gameConst.numberScrollKinds) {
          if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
            printf(S("\n(!)  Depth %i: generated an %s potion at %i frequency"), G.rogue.depthLevel, $sadd(G.potionTable, (j - G.gameConst.numberScrollKinds)).name, $sadd(G.rogue.meteredItems, j).frequency);
          }
        } else {
          if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
            printf(S("\n(?)  Depth %i: generated an %s scroll at %i frequency"), G.rogue.depthLevel, $sadd(G.scrollTable, j).name, $sadd(G.rogue.meteredItems, j).frequency);
          }
        }
        ($t2 = $sadd(G.rogue.meteredItems, j), $t2.frequency = $t2.frequency - $sadd(G.meteredItemsGenerationTable, j).decrementFrequency);
        ($t3 = $sadd(G.rogue.meteredItems, j), $t3.numberSpawned = $t3.numberSpawned + 1);
      }
    }
    await placeItemAt(theItem, itemPlacementLoc.$clone());
    ;
    if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
      let map = allocGrid();
      let i2 = 0;
      let j2 = 0;
      for (i2 = 0; DCOLS > i2; i2 = i2 + 1 << 16 >> 16) {
        for (j2 = 0; DROWS > j2; j2 = j2 + 1 << 16 >> 16) {
          $wr(map.a[map.o + i2], j2, itemSpawnHeatMap[i2][j2] * -1 << 16 >> 16);
        }
      }
      await dumpLevelToScreen();
      await displayGrid(map);
      freeGrid(map);
      plotCharWithColor(theItem.displayChar, mapToWindow(itemPlacementLoc), G.black, G.purple);
      await temporaryMessage(S("Added an item."), REQUIRE_ACKNOWLEDGMENT);
    }
  }
  for (let i = 0; numberOfGoldPiles > i; ++i) {
    let theItem = await generateItem(GOLD, -1);
    let itemPlacementLoc = struct_pos.$of(-1, -1).$clone();
    getItemSpawnLoc(P(itemSpawnHeatMap), P(itemPlacementLoc, "x"), P(itemPlacementLoc, "y"), P(totalHeat, 0));
    coolHeatMapAt(P(itemSpawnHeatMap), itemPlacementLoc, P(totalHeat, 0));
    await placeItemAt(theItem, itemPlacementLoc.$clone());
    G.rogue.goldGenerated = G.rogue.goldGenerated + $u64(theItem.quantity);
  }
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    await dumpLevelToScreen();
    await temporaryMessage(S("Added gold."), REQUIRE_ACKNOWLEDGMENT);
  }
  memcpy(G.potionTable, potionTableCopy, $u64(G.gameConst.numberPotionKinds) * 1576);
  memcpy(G.scrollTable, scrollTableCopy, $u64(G.gameConst.numberScrollKinds) * 1576);
  free(potionTableCopy);
  free(scrollTableCopy);
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    printf(S("\n---- Depth %i: %lu gold generated so far."), G.rogue.depthLevel, G.rogue.goldGenerated);
  }
}

function itemWillStackWithPack(theItem: struct_item | null): number {
  let tempItem = null;
  if (theItem.category & GEM) {
    for (tempItem = G.packItems.nextItem; !!tempItem && !(tempItem.category & GEM && theItem.originDepth === tempItem.originDepth); tempItem = tempItem.nextItem) {
      ;
    }
    return (tempItem ? true_ : false_) << 24 >> 24;
  } else if (!theItem.quiverNumber) {
    return false_;
  } else {
    for (tempItem = G.packItems.nextItem; !!tempItem && tempItem.quiverNumber !== theItem.quiverNumber; tempItem = tempItem.nextItem) {
      ;
    }
    return (tempItem ? true_ : false_) << 24 >> 24;
  }
}

export async function removeItemAt(loc: struct_pos): Promise<void> {
  let $t1: any;
  ($t1 = pmapAt(loc), $t1.flags = ($t1.flags & ~HAS_ITEM >>> 0) >>> 0);
  if (cellHasTMFlag(loc, TM_PROMOTES_ON_ITEM_PICKUP)) {
    for (let layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
      if ((G.tileCatalog[pmapAt(loc).layers[layer]].mechFlags & TM_PROMOTES_ON_ITEM_PICKUP) >>> 0) {
        await promoteTile(loc.x, loc.y, layer, false_);
      }
    }
  }
}

export async function pickUpItemAt(loc: struct_pos): Promise<void> {
  let $t1: any, $t2: any;
  let theItem = null;
  let monst = null;
  let buf = new Int8Array(300);
  let buf2 = new Int8Array(300);
  const guardianX = new Int16Array(1);
  const guardianY = new Int16Array(1);
  G.rogue.disturbed = true_;
  theItem = await itemAtLoc(loc.$clone());
  if (!theItem) {
    await message(S("Error: Expected item; item not found."), REQUIRE_ACKNOWLEDGMENT);
    return;
  }
  if ((theItem.flags & ITEM_KIND_AUTO_ID) >>> 0 && tableForItemCategory(theItem.category) && !$sadd(tableForItemCategory(theItem.category), theItem.kind).identified) {
    identifyItemKind(theItem);
  }
  if (theItem.category & WAND && $sadd(G.wandTable, theItem.kind).identified && $sadd(G.wandTable, theItem.kind).range.lowerBound === $sadd(G.wandTable, theItem.kind).range.upperBound) {
    theItem.flags = (theItem.flags | ITEM_IDENTIFIED) >>> 0;
  }
  if (numberOfItemsInPack() < MAX_PACK_ITEMS || theItem.category & GOLD || itemWillStackWithPack(theItem)) {
    ($t1 = pmapAt(loc), $t1.flags = ($t1.flags & ~ITEM_DETECTED >>> 0) >>> 0);
    if (!removeItemFromChain(theItem, G.floorItems)) {
      ;
    }
    if (theItem.category & GOLD) {
      G.rogue.gold = G.rogue.gold + $u64(theItem.quantity);
      G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_TONE] = false_;
      sprintf(P(buf), S("you found %i pieces of gold."), theItem.quantity);
      await messageWithColor(P(buf), G.itemMessageColor, 0);
      deleteItem(theItem);
      await removeItemAt(loc.$clone());
      return;
    }
    if (theItem.category & AMULET && await numberOfMatchingPackItems(AMULET, 0, 0, false_)) {
      await message(S("you already have the Amulet of Yendor."), 0);
      deleteItem(theItem);
      return;
    }
    theItem = addItemToPack(theItem);
    itemName(theItem, P(buf2), true_, true_, null);
    sprintf(P(buf), S("you now have %s (%c)."), P(buf2), theItem.inventoryLetter);
    await messageWithColor(P(buf), G.itemMessageColor, 0);
    await removeItemAt(loc.$clone());
    if (theItem.category & AMULET && !G.rogue.yendorWarden) {
      for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
        let monst = nextCreature(it);
        if (monst.info.monsterID >>> 0 === MK_WARDEN_OF_YENDOR) {
          G.rogue.yendorWarden = monst;
          break;
        }
      }
      if (!G.rogue.yendorWarden) {
        getRandomMonsterSpawnLocation(P(guardianX, 0), P(guardianY, 0));
        monst = generateMonster(MK_WARDEN_OF_YENDOR, false_, false_);
        monst.loc.x = guardianX[0];
        monst.loc.y = guardianY[0];
        ($t2 = $at2(G.pmap, guardianX[0], guardianY[0]), $t2.flags = ($t2.flags | HAS_MONSTER) >>> 0);
        G.rogue.yendorWarden = monst;
      }
    }
  } else {
    theItem.flags = (theItem.flags | ITEM_PLAYER_AVOIDS) >>> 0;
    itemName(theItem, P(buf2), false_, true_, null);
    sprintf(P(buf), S("Your pack is too full to pick up %s."), P(buf2));
    await messageWithColor(P(buf), G.badMessageColor, 0);
  }
}

function conflateItemCharacteristics(newItem: struct_item | null, oldItem: struct_item | null): void {
  newItem.flags = (newItem.flags | (oldItem.flags & (ITEM_MAGIC_DETECTED | ITEM_IDENTIFIED | ITEM_PROTECTED | ITEM_RUNIC | ITEM_RUNIC_HINTED | ITEM_CAN_BE_IDENTIFIED | ITEM_MAX_CHARGES_KNOWN)) >>> 0) >>> 0;
  if (oldItem.enchant1 > newItem.enchant1) {
    newItem.enchant1 = oldItem.enchant1;
  }
  if (newItem.strengthRequired > oldItem.strengthRequired) {
    newItem.strengthRequired = oldItem.strengthRequired;
  }
  if (0 >= oldItem.originDepth || newItem.originDepth !== oldItem.originDepth) {
    newItem.originDepth = 0;
  }
}

function stackItems(newItem: struct_item | null, oldItem: struct_item | null): void {
  newItem.quantity = newItem.quantity + oldItem.quantity << 16 >> 16;
  conflateItemCharacteristics(newItem, oldItem);
  deleteItem(oldItem);
}

function inventoryLetterAvailable(proposedLetter: number): number {
  let theItem = null;
  if (proposedLetter >= 97 && 122 >= proposedLetter) {
    for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
      if (theItem.inventoryLetter === proposedLetter) {
        return false_;
      }
    }
    return true_;
  }
  return false_;
}

export function addItemToPack(theItem: struct_item | null): struct_item | null {
  let previousItem = null;
  let tempItem = null;
  let itemLetter = 0;
  if (theItem.category & (FOOD | POTION | SCROLL | GEM)) {
    for (tempItem = G.packItems.nextItem; !!tempItem; tempItem = tempItem.nextItem) {
      if (theItem.category === tempItem.category && theItem.kind === tempItem.kind && (!(theItem.category & GEM) || theItem.originDepth === tempItem.originDepth)) {
        stackItems(tempItem, theItem);
        return tempItem;
      }
    }
  } else if (theItem.category & WEAPON && theItem.quiverNumber > 0) {
    for (tempItem = G.packItems.nextItem; !!tempItem; tempItem = tempItem.nextItem) {
      if (theItem.category === tempItem.category && theItem.kind === tempItem.kind && theItem.quiverNumber === tempItem.quiverNumber) {
        stackItems(tempItem, theItem);
        return tempItem;
      }
    }
  }
  if (!inventoryLetterAvailable(theItem.inventoryLetter)) {
    itemLetter = nextAvailableInventoryCharacter();
    if (itemLetter) {
      theItem.inventoryLetter = itemLetter;
    }
  }
  for (previousItem = G.packItems; !!previousItem.nextItem && theItem.category >= previousItem.nextItem.category; previousItem = previousItem.nextItem) {
    ;
  }
  theItem.nextItem = previousItem.nextItem;
  previousItem.nextItem = theItem;
  return theItem;
}

export function numberOfItemsInPack(): number {
  let theCount = 0;
  let theItem = null;
  for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
    theCount = theCount + (theItem.category & (WEAPON | GEM) ? 1 : theItem.quantity) << 16 >> 16;
  }
  return theCount;
}

export function nextAvailableInventoryCharacter(): number {
  let charTaken = new Int8Array(26);
  let i = 0;
  let theItem = null;
  let c = 0;
  for (i = 0; 26 > i; i = i + 1 << 16 >> 16) {
    charTaken[i] = false_;
  }
  for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
    c = theItem.inventoryLetter;
    if (c >= 97 && 122 >= c) {
      charTaken[c - 97] = true_;
    }
  }
  for (i = 0; 26 > i; i = i + 1 << 16 >> 16) {
    if (!charTaken[i]) {
      return 97 + i << 24 >> 24;
    }
  }
  return 0;
}

export async function checkForDisenchantment(theItem: struct_item | null): Promise<void> {
  let buf = new Int8Array(100);
  let buf2 = new Int8Array(100);
  if ((theItem.flags & ITEM_RUNIC) >>> 0 && (theItem.category & WEAPON && NUMBER_GOOD_WEAPON_ENCHANT_KINDS > theItem.enchant2 || theItem.category & ARMOR && NUMBER_GOOD_ARMOR_ENCHANT_KINDS > theItem.enchant2) && 0 >= theItem.enchant1) {
    theItem.enchant2 = 0;
    theItem.flags = (theItem.flags & ~(ITEM_RUNIC | ITEM_RUNIC_HINTED | ITEM_RUNIC_IDENTIFIED) >>> 0) >>> 0;
    if ((theItem.flags & ITEM_IDENTIFIED) >>> 0) {
      identify(theItem);
      itemName(theItem, P(buf2), false_, false_, null);
      sprintf(P(buf), S("the runes fade from your %s."), P(buf2));
      await messageWithColor(P(buf), G.itemMessageColor, 0);
    }
  }
  if ((theItem.flags & ITEM_CURSED) >>> 0 && theItem.enchant1 >= 0) {
    theItem.flags = (theItem.flags & ~ITEM_CURSED >>> 0) >>> 0;
  }
}

function itemIsSwappable(theItem: struct_item | null): number {
  if (theItem.category & CAN_BE_SWAPPED && theItem.quiverNumber === 0) {
    return true_;
  } else {
    return false_;
  }
}

async function swapItemToEnchantLevel(theItem: struct_item | null, newEnchant: number, enchantmentKnown: number): Promise<void> {
  let $t1: any;
  let x = 0;
  let y = 0;
  let charmPercent = 0;
  let buf1 = new Int8Array(300);
  let buf2 = new Int8Array(300);
  if (theItem.category & STAFF && 2 > newEnchant || theItem.category & CHARM && 1 > newEnchant || theItem.category & WAND && 0 > newEnchant) {
    itemName(theItem, P(buf1), false_, true_, null);
    sprintf(P(buf2), S("%s shatter%s from the strain!"), P(buf1), theItem.quantity === 1 ? S("s") : S(""));
    x = theItem.loc.x;
    y = theItem.loc.y;
    removeItemFromChain(theItem, G.floorItems);
    ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags & ~(HAS_ITEM | ITEM_DETECTED) >>> 0) >>> 0);
    if (($at2(G.pmap, x, y).flags & (ANY_KIND_OF_VISIBLE | DISCOVERED | ITEM_DETECTED)) >>> 0) {
      await refreshDungeonCell(struct_pos.$of(x, y));
    }
    if (($at2(G.pmap, x, y).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
      await messageWithColor(P(buf2), G.itemMessageColor, 0);
    }
  } else {
    if (theItem.category & STAFF && theItem.charges > newEnchant) {
      theItem.charges = newEnchant;
    }
    if (theItem.category & CHARM) {
      charmPercent = (theItem.charges * 100 / charmRechargeDelay(theItem.kind, theItem.enchant1) | 0) << 16 >> 16;
      theItem.charges = (Math.imul(charmPercent, charmRechargeDelay(theItem.kind, newEnchant)) / 100 | 0) << 16 >> 16;
    }
    if (enchantmentKnown) {
      if (theItem.category & STAFF) {
        theItem.flags = (theItem.flags | ITEM_MAX_CHARGES_KNOWN) >>> 0;
      }
      theItem.flags = (theItem.flags | ITEM_IDENTIFIED) >>> 0;
    } else {
      theItem.flags = (theItem.flags & ~(ITEM_MAX_CHARGES_KNOWN | ITEM_IDENTIFIED) >>> 0) >>> 0;
      theItem.flags = (theItem.flags | ITEM_CAN_BE_IDENTIFIED) >>> 0;
      if (theItem.category & WEAPON) {
        theItem.charges = G.gameConst.weaponKillsToAutoID << 16 >> 16;
      } else if (theItem.category & ARMOR) {
        theItem.charges = G.gameConst.armorDelayToAutoID << 16 >> 16;
      } else if (theItem.category & RING) {
        theItem.charges = G.gameConst.ringDelayToAutoID << 16 >> 16;
      }
    }
    if (theItem.category & WAND) {
      theItem.charges = newEnchant;
    } else {
      theItem.enchant1 = newEnchant;
    }
    await checkForDisenchantment(theItem);
  }
}

function enchantLevelKnown(theItem: struct_item | null): number {
  if (theItem.category & STAFF && (theItem.flags & ITEM_MAX_CHARGES_KNOWN) >>> 0) {
    return true_;
  } else {
    return ((theItem.flags & ITEM_IDENTIFIED) >>> 0) << 24 >> 24;
  }
}

function effectiveEnchantLevel(theItem: struct_item | null): number {
  if (theItem.category & WAND) {
    return theItem.charges;
  } else {
    return theItem.enchant1;
  }
}

async function swapItemEnchants(machineNumber: number): Promise<number> {
  let lockedItem = null;
  let tempItem = null;
  let i = 0;
  let j = 0;
  let oldEnchant = 0;
  let enchantmentKnown = 0;
  lockedItem = null;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      tempItem = await itemAtLoc(struct_pos.$of(i, j));
      if (tempItem && $at2(G.pmap, i, j).machineNumber === machineNumber && cellHasTMFlag(struct_pos.$of(i, j), TM_SWAP_ENCHANTS_ACTIVATION) && itemIsSwappable(tempItem)) {
        if (lockedItem) {
          if (effectiveEnchantLevel(lockedItem) !== effectiveEnchantLevel(tempItem)) {
            oldEnchant = effectiveEnchantLevel(lockedItem);
            enchantmentKnown = enchantLevelKnown(lockedItem);
            await swapItemToEnchantLevel(lockedItem, effectiveEnchantLevel(tempItem), enchantLevelKnown(tempItem));
            await swapItemToEnchantLevel(tempItem, oldEnchant, enchantmentKnown);
            return true_;
          }
        } else {
          lockedItem = tempItem;
        }
      }
    }
  }
  return false_;
}

export async function updateFloorItems(): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let x = 0;
  let y = 0;
  let buf = new Int8Array(237);
  let buf2 = new Int8Array(237);
  let layer = 0;
  let theItem = null;
  let nextItem = null;
  for (theItem = G.floorItems.nextItem; !!theItem; theItem = nextItem) {
    nextItem = theItem.nextItem;
    x = theItem.loc.x;
    y = theItem.loc.y;
    if (theItem.spawnTurnNumber > G.rogue.absoluteTurnNumber) {
      continue;
    }
    if (cellHasTerrainFlag(struct_pos.$of(x, y), T_AUTO_DESCENT)) {
      if (($at2(G.pmap, x, y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, x, y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, x, y).flags & DISCOVERED) >>> 0)) {
        itemName(theItem, P(buf), false_, false_, null);
        sprintf(P(buf2), S("The %s plunge%s out of sight!"), P(buf), theItem.quantity > 1 ? S("") : S("s"));
        await messageWithColor(P(buf2), G.itemMessageColor, 0);
      }
      if (($at2(G.pmap, x, y).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
        await discover(x, y);
      }
      theItem.flags = (theItem.flags | ITEM_PREPLACED) >>> 0;
      removeItemFromChain(theItem, G.floorItems);
      ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags & ~(HAS_ITEM | ITEM_DETECTED) >>> 0) >>> 0);
      if (theItem.category === POTION || G.rogue.depthLevel === G.gameConst.deepestLevel) {
        deleteItem(theItem);
      } else {
        theItem.spawnTurnNumber = G.rogue.absoluteTurnNumber;
        theItem.nextItem = $sadd(G.levels, (G.rogue.depthLevel - 1 + 1)).items;
        $sadd(G.levels, (G.rogue.depthLevel - 1 + 1)).items = theItem;
      }
      await refreshDungeonCell(struct_pos.$of(x, y));
      continue;
    }
    if (cellHasTerrainFlag(struct_pos.$of(x, y), T_IS_FIRE) && (theItem.flags & ITEM_FLAMMABLE) >>> 0 || cellHasTerrainFlag(struct_pos.$of(x, y), T_LAVA_INSTA_DEATH) && !(theItem.category & AMULET)) {
      await burnItem(theItem);
      continue;
    }
    if (cellHasTerrainFlag(struct_pos.$of(x, y), T_MOVES_ITEMS)) {
      let loc = new struct_pos();
      getQualifyingLocNear(loc, struct_pos.$of(x, y), true_, null, T_OBSTRUCTS_ITEMS | T_OBSTRUCTS_PASSABILITY, HAS_ITEM, false_, false_);
      if (distanceBetween(struct_pos.$of(x, y), loc) === 1) {
        await removeItemAt(struct_pos.$of(x, y));
        ($t2 = pmapAt(loc), $t2.flags = ($t2.flags | HAS_ITEM) >>> 0);
        if (($at2(G.pmap, x, y).flags & ITEM_DETECTED) >>> 0) {
          ($t3 = $at2(G.pmap, x, y), $t3.flags = ($t3.flags & ~ITEM_DETECTED >>> 0) >>> 0);
          ($t4 = pmapAt(loc), $t4.flags = ($t4.flags | ITEM_DETECTED) >>> 0);
        }
        theItem.loc.$cp(loc);
        await refreshDungeonCell(struct_pos.$of(x, y));
        await refreshDungeonCell(loc.$clone());
        continue;
      }
    }
    if (cellHasTMFlag(struct_pos.$of(x, y), TM_PROMOTES_ON_ITEM)) {
      for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
        if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].mechFlags & TM_PROMOTES_ON_ITEM) >>> 0) {
          await promoteTile(x, y, layer, false_);
        }
      }
      continue;
    }
    if ($at2(G.pmap, x, y).machineNumber && $at2(G.pmap, x, y).machineNumber === pmapAt(G.player.loc).machineNumber && (theItem.flags & ITEM_KIND_AUTO_ID) >>> 0) {
      identifyItemKind(theItem);
    }
    if (cellHasTMFlag(struct_pos.$of(x, y), TM_SWAP_ENCHANTS_ACTIVATION) && $at2(G.pmap, x, y).machineNumber) {
      while (!!nextItem && $at2(G.pmap, x, y).machineNumber === pmapAt(nextItem.loc).machineNumber && cellHasTMFlag(nextItem.loc, TM_SWAP_ENCHANTS_ACTIVATION)) {
        nextItem = nextItem.nextItem;
      }
      if (!circuitBreakersPreventActivation($at2(G.pmap, x, y).machineNumber) && await swapItemEnchants($at2(G.pmap, x, y).machineNumber)) {
        await activateMachine($at2(G.pmap, x, y).machineNumber);
      }
    }
  }
}

async function inscribeItem(theItem: struct_item | null): Promise<number> {
  let itemText = new Int8Array(30);
  let buf = new Int8Array(300);
  let nameOfItem = new Int8Array(300);
  let oldInscription = new Int8Array(100);
  strcpy(P(oldInscription), P(theItem.inscription));
  theItem.inscription[0] = 0;
  itemName(theItem, P(nameOfItem), true_, true_, null);
  strcpy(P(theItem.inscription), P(oldInscription));
  sprintf(P(buf), S("inscribe: %s \""), P(nameOfItem));
  if (await getInputTextString(P(itemText), P(buf), (29 < 100 - 20 - 1 - strLenWithoutEscapes(P(buf)) - 1 ? 29 : 100 - 20 - 1 - strLenWithoutEscapes(P(buf)) - 1) << 16 >> 16, S(""), S("\""), TEXT_INPUT_NORMAL, false_)) {
    strcpy(P(theItem.inscription), P(itemText));
    confirmMessages();
    itemName(theItem, P(nameOfItem), true_, true_, null);
    sprintf(P(buf), S("%s %s."), theItem.quantity > 1 ? S("they're") : S("it's"), P(nameOfItem));
    await messageWithColor(P(buf), G.itemMessageColor, 0);
    return true_;
  } else {
    confirmMessages();
    return false_;
  }
}

export function itemCanBeCalled(theItem: struct_item | null): number {
  if (theItem.category & (WEAPON | ARMOR | SCROLL | RING | POTION | STAFF | WAND | CHARM)) {
    return true_;
  } else if (theItem.category & (POTION | SCROLL) && !$sadd(tableForItemCategory(theItem.category), theItem.kind).identified) {
    return true_;
  } else {
    return false_;
  }
}

export async function call(theItem: struct_item | null): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any, $t12: any, $t13: any, $t14: any, $t15: any, $t16: any;
  let itemText = new Int8Array(30);
  let buf = new Int8Array(300);
  let c = 0;
  let command = new Uint8Array(100);
  let tempItem = null;
  c = 0;
  command[($t2 = c, c = $t2 + 1 << 16 >> 16, $t2)] = CALL_KEY;
  if (!theItem) {
    for (tempItem = G.packItems.nextItem; !!tempItem; tempItem = tempItem.nextItem) {
      if (tempItem.category & (POTION | SCROLL) && $sadd(tableForItemCategory(tempItem.category), tempItem.kind).identified) {
        tempItem.flags = (tempItem.flags & ~ITEM_CAN_BE_IDENTIFIED >>> 0) >>> 0;
      } else {
        tempItem.flags = (tempItem.flags | ITEM_CAN_BE_IDENTIFIED) >>> 0;
      }
    }
    theItem = await promptForItemOfType(WEAPON | ARMOR | SCROLL | RING | POTION | STAFF | WAND | CHARM, ITEM_CAN_BE_IDENTIFIED, 0, KEYBOARD_LABELS ? S("Call what? (a-z, shift for more info; or <esc> to cancel)") : S("Call what?"), true_);
    updateIdentifiableItems();
  }
  if (!theItem) {
    return;
  }
  command[($t4 = c, c = $t4 + 1 << 16 >> 16, $t4)] = theItem.inventoryLetter & 0xff;
  confirmMessages();
  if ((theItem.flags & ITEM_IDENTIFIED) >>> 0 || theItem.category & (WEAPON | ARMOR | CHARM | FOOD | GOLD | AMULET | GEM)) {
    if (theItem.category & (WEAPON | ARMOR | CHARM | STAFF | WAND | RING)) {
      if (await inscribeItem(theItem)) {
        command[($t6 = c, c = $t6 + 1 << 16 >> 16, $t6)] = 0;
        strcat($view8(P(command), true), P(theItem.inscription));
        recordKeystrokeSequence(P(command));
        recordKeystroke(RETURN_KEY, false_, false_);
      }
    } else {
      await message(S("you already know what that is."), 0);
    }
    return;
  }
  if (theItem.category & (WEAPON | ARMOR | STAFF | WAND | RING)) {
    if ($sadd(tableForItemCategory(theItem.category), theItem.kind).identified) {
      if (await inscribeItem(theItem)) {
        command[($t8 = c, c = $t8 + 1 << 16 >> 16, $t8)] = 0;
        strcat($view8(P(command), true), P(theItem.inscription));
        recordKeystrokeSequence(P(command));
        recordKeystroke(RETURN_KEY, false_, false_);
      }
      return;
    } else if (await confirm(S("Inscribe this particular item instead of all similar items?"), true_)) {
      command[($t10 = c, c = $t10 + 1 << 16 >> 16, $t10)] = 121;
      if (await inscribeItem(theItem)) {
        command[($t12 = c, c = $t12 + 1 << 16 >> 16, $t12)] = 0;
        strcat($view8(P(command), true), P(theItem.inscription));
        recordKeystrokeSequence(P(command));
        recordKeystroke(RETURN_KEY, false_, false_);
      }
      return;
    } else {
      command[($t14 = c, c = $t14 + 1 << 16 >> 16, $t14)] = 110;
    }
  }
  if (tableForItemCategory(theItem.category) && !$sadd(tableForItemCategory(theItem.category), theItem.kind).identified) {
    if (await getInputTextString(P(itemText), S("call them: \""), 29, S(""), S("\""), TEXT_INPUT_NORMAL, false_)) {
      command[($t16 = c, c = $t16 + 1 << 16 >> 16, $t16)] = 0;
      strcat($view8(P(command), true), P(itemText));
      recordKeystrokeSequence(P(command));
      recordKeystroke(RETURN_KEY, false_, false_);
      if (itemText[0]) {
        strcpy(P($sadd(tableForItemCategory(theItem.category), theItem.kind).callTitle), P(itemText));
        $sadd(tableForItemCategory(theItem.category), theItem.kind).called = true_;
      } else {
        $sadd(tableForItemCategory(theItem.category), theItem.kind).callTitle[0] = 0;
        $sadd(tableForItemCategory(theItem.category), theItem.kind).called = false_;
      }
      confirmMessages();
      itemName(theItem, P(buf), false_, true_, null);
      await messageWithColor(P(buf), G.itemMessageColor, 0);
    }
  } else {
    await message(S("you already know what that is."), 0);
  }
}

export function itemName(theItem: struct_item | null, root: Ptr | null, includeDetails: number, includeArticle: number, baseColor: struct_color | null): void {
  let buf = new Int8Array(395);
  let pluralization = new Int8Array(10);
  let article = $cs("", 10);
  let runicName = new Int8Array(30);
  let grayEscapeSequence = new Int8Array(5);
  let purpleEscapeSequence = new Int8Array(5);
  let yellowEscapeSequence = new Int8Array(5);
  let baseEscapeSequence = new Int8Array(5);
  let tempColor = new struct_color();
  strcpy(P(pluralization), theItem.quantity > 1 ? S("s") : S(""));
  grayEscapeSequence[0] = 0;
  purpleEscapeSequence[0] = 0;
  yellowEscapeSequence[0] = 0;
  baseEscapeSequence[0] = 0;
  if (baseColor) {
    tempColor.$cp(G.backgroundMessageColor);
    applyColorMultiplier(tempColor, baseColor);
    encodeMessageColor(P(purpleEscapeSequence), 0, tempColor);
    tempColor.$cp(G.gray);
    encodeMessageColor(P(grayEscapeSequence), 0, tempColor);
    tempColor.$cp(G.itemMessageColor);
    applyColorMultiplier(tempColor, baseColor);
    encodeMessageColor(P(yellowEscapeSequence), 0, tempColor);
    encodeMessageColor(P(baseEscapeSequence), 0, baseColor);
  }
  switch (theItem.category) {
  case FOOD:
    if (theItem.kind === FRUIT) {
      sprintf(root, S("mango%s"), P(pluralization));
    } else {
      if (theItem.quantity === 1) {
        sprintf(P(article), S("some "));
        sprintf(root, S("food"));
      } else {
        sprintf(root, S("ration%s of food"), P(pluralization));
      }
    }
    break;
  case WEAPON:
    sprintf(root, S("%s%s"), G.weaponTable[theItem.kind].name, P(pluralization));
    if (includeDetails) {
      if ((theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
        sprintf(P(buf), S("%s%i %s"), 0 > theItem.enchant1 ? S("") : S("+"), theItem.enchant1, root);
        strcpy(root, P(buf));
      }
      if ((theItem.flags & ITEM_RUNIC) >>> 0) {
        if ((theItem.flags & ITEM_RUNIC_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
          itemRunicName(theItem, P(runicName));
          sprintf(P(buf), S("%s of %s%s"), root, P(runicName), P(grayEscapeSequence));
          strcpy(root, P(buf));
        } else if ((theItem.flags & (ITEM_IDENTIFIED | ITEM_RUNIC_HINTED)) >>> 0) {
          if (grayEscapeSequence[0]) {
            strcat(root, P(grayEscapeSequence));
          }
          strcat(root, S(" (unknown runic)"));
        }
      }
      sprintf(P(buf), S("%s%s <%i>"), root, P(grayEscapeSequence), theItem.strengthRequired);
      strcpy(root, P(buf));
    }
    break;
  case ARMOR:
    sprintf(root, S("%s"), G.armorTable[theItem.kind].name);
    if (includeDetails) {
      if ((theItem.flags & ITEM_RUNIC) >>> 0 && ((theItem.flags & ITEM_RUNIC_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience)) {
        itemRunicName(theItem, P(runicName));
        sprintf(P(buf), S("%s of %s%s"), root, P(runicName), P(grayEscapeSequence));
        strcpy(root, P(buf));
      }
      if ((theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
        sprintf(P(buf), S("%s%i %s%s [%i]<%i>"), 0 > theItem.enchant1 ? S("") : S("+"), theItem.enchant1, root, P(grayEscapeSequence), (theItem.armor / 10 | 0) + theItem.enchant1, theItem.strengthRequired);
        strcpy(root, P(buf));
      } else {
        sprintf(P(buf), S("%s%s <%i>"), root, P(grayEscapeSequence), theItem.strengthRequired);
        strcpy(root, P(buf));
      }
      if ((theItem.flags & ITEM_RUNIC) >>> 0 && (theItem.flags & (ITEM_IDENTIFIED | ITEM_RUNIC_HINTED)) >>> 0 && !((theItem.flags & ITEM_RUNIC_IDENTIFIED) >>> 0) && !G.rogue.playbackOmniscience) {
        strcat(root, S(" (unknown runic)"));
      }
    }
    break;
  case SCROLL:
    if ($sadd(G.scrollTable, theItem.kind).identified || G.rogue.playbackOmniscience) {
      sprintf(root, S("scroll%s of %s"), P(pluralization), $sadd(G.scrollTable, theItem.kind).name);
    } else if ($sadd(G.scrollTable, theItem.kind).called) {
      sprintf(root, S("scroll%s called %s%s%s"), P(pluralization), P(purpleEscapeSequence), P($sadd(G.scrollTable, theItem.kind).callTitle), P(baseEscapeSequence));
    } else {
      sprintf(root, S("scroll%s entitled %s\"%s\"%s"), P(pluralization), P(purpleEscapeSequence), $sadd(G.scrollTable, theItem.kind).flavor, P(baseEscapeSequence));
    }
    break;
  case POTION:
    if ($sadd(G.potionTable, theItem.kind).identified || G.rogue.playbackOmniscience) {
      sprintf(root, S("potion%s of %s"), P(pluralization), $sadd(G.potionTable, theItem.kind).name);
    } else if ($sadd(G.potionTable, theItem.kind).called) {
      sprintf(root, S("potion%s called %s%s%s"), P(pluralization), P(purpleEscapeSequence), P($sadd(G.potionTable, theItem.kind).callTitle), P(baseEscapeSequence));
    } else {
      sprintf(root, S("%s%s%s potion%s"), P(purpleEscapeSequence), $sadd(G.potionTable, theItem.kind).flavor, P(baseEscapeSequence), P(pluralization));
    }
    break;
  case WAND:
    if ($sadd(G.wandTable, theItem.kind).identified || G.rogue.playbackOmniscience) {
      sprintf(root, S("wand%s of %s"), P(pluralization), $sadd(G.wandTable, theItem.kind).name);
    } else if ($sadd(G.wandTable, theItem.kind).called) {
      sprintf(root, S("wand%s called %s%s%s"), P(pluralization), P(purpleEscapeSequence), P($sadd(G.wandTable, theItem.kind).callTitle), P(baseEscapeSequence));
    } else {
      sprintf(root, S("%s%s%s wand%s"), P(purpleEscapeSequence), $sadd(G.wandTable, theItem.kind).flavor, P(baseEscapeSequence), P(pluralization));
    }
    if (includeDetails) {
      if ((theItem.flags & (ITEM_IDENTIFIED | ITEM_MAX_CHARGES_KNOWN)) >>> 0 || G.rogue.playbackOmniscience) {
        sprintf(P(buf), S("%s%s [%i]"), root, P(grayEscapeSequence), theItem.charges);
        strcpy(root, P(buf));
      } else if (theItem.enchant2 > 2) {
        sprintf(P(buf), S("%s%s (used %i times)"), root, P(grayEscapeSequence), theItem.enchant2);
        strcpy(root, P(buf));
      } else if (theItem.enchant2) {
        sprintf(P(buf), S("%s%s (used %s)"), root, P(grayEscapeSequence), theItem.enchant2 === 2 ? S("twice") : S("once"));
        strcpy(root, P(buf));
      }
    }
    break;
  case STAFF:
    if (G.staffTable[theItem.kind].identified || G.rogue.playbackOmniscience) {
      sprintf(root, S("staff%s of %s"), P(pluralization), G.staffTable[theItem.kind].name);
    } else if (G.staffTable[theItem.kind].called) {
      sprintf(root, S("staff%s called %s%s%s"), P(pluralization), P(purpleEscapeSequence), P(G.staffTable[theItem.kind].callTitle), P(baseEscapeSequence));
    } else {
      sprintf(root, S("%s%s%s staff%s"), P(purpleEscapeSequence), G.staffTable[theItem.kind].flavor, P(baseEscapeSequence), P(pluralization));
    }
    if (includeDetails) {
      if ((theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
        sprintf(P(buf), S("%s%s [%i/%i]"), root, P(grayEscapeSequence), theItem.charges, theItem.enchant1);
        strcpy(root, P(buf));
      } else if ((theItem.flags & ITEM_MAX_CHARGES_KNOWN) >>> 0) {
        sprintf(P(buf), S("%s%s [?/%i]"), root, P(grayEscapeSequence), theItem.enchant1);
        strcpy(root, P(buf));
      }
    }
    break;
  case RING:
    if (G.ringTable[theItem.kind].identified || G.rogue.playbackOmniscience) {
      sprintf(root, S("ring%s of %s"), P(pluralization), G.ringTable[theItem.kind].name);
    } else if (G.ringTable[theItem.kind].called) {
      sprintf(root, S("ring%s called %s%s%s"), P(pluralization), P(purpleEscapeSequence), P(G.ringTable[theItem.kind].callTitle), P(baseEscapeSequence));
    } else {
      sprintf(root, S("%s%s%s ring%s"), P(purpleEscapeSequence), G.ringTable[theItem.kind].flavor, P(baseEscapeSequence), P(pluralization));
    }
    if (includeDetails && ((theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience)) {
      sprintf(P(buf), S("%s%i %s"), 0 > theItem.enchant1 ? S("") : S("+"), theItem.enchant1, root);
      strcpy(root, P(buf));
    }
    break;
  case CHARM:
    sprintf(root, S("%s charm%s"), $sadd(G.charmTable, theItem.kind).name, P(pluralization));
    if (includeDetails) {
      sprintf(P(buf), S("%s%i %s"), 0 > theItem.enchant1 ? S("") : S("+"), theItem.enchant1, root);
      strcpy(root, P(buf));
      if (theItem.charges) {
        sprintf(P(buf), S("%s %s(%i%%)"), root, P(grayEscapeSequence), (charmRechargeDelay(theItem.kind, theItem.enchant1) - theItem.charges) * 100 / charmRechargeDelay(theItem.kind, theItem.enchant1) | 0);
        strcpy(root, P(buf));
      } else {
        strcat(root, P(grayEscapeSequence));
        strcat(root, S(" (ready)"));
      }
    }
    break;
  case GOLD:
    sprintf(root, S("gold piece%s"), P(pluralization));
    break;
  case AMULET:
    sprintf(root, S("%sAmulet%s of Yendor%s"), P(yellowEscapeSequence), P(pluralization), P(baseEscapeSequence));
    break;
  case GEM:
    sprintf(root, S("%slumenstone%s%s from depth %i"), P(yellowEscapeSequence), P(pluralization), P(baseEscapeSequence), theItem.originDepth);
    break;
  case KEY:
    if (includeDetails && theItem.originDepth > 0 && theItem.originDepth !== G.rogue.depthLevel) {
      sprintf(root, S("%s%s%s from depth %i"), G.keyTable[theItem.kind].name, P(pluralization), P(grayEscapeSequence), theItem.originDepth);
    } else {
      sprintf(root, G.keyTable[theItem.kind].name, S("%s%s"), P(pluralization));
    }
    break;
  default:
    sprintf(root, S("unknown item%s"), P(pluralization));
    break;
  }
  if (includeArticle) {
    if (theItem.quantity > 1) {
      sprintf(P(article), S("%i "), theItem.quantity);
    } else if (theItem.category & AMULET) {
      sprintf(P(article), S("the "));
    } else if (!(theItem.category & ARMOR) && !(theItem.category & FOOD && theItem.kind === RATION)) {
      sprintf(P(article), S("a%s "), isVowelish(root) ? S("n") : S(""));
    }
  }
  if (includeArticle) {
    sprintf(P(buf), S("%s%s"), P(article), root);
    strcpy(root, P(buf));
  }
  if (includeDetails && theItem.inscription[0]) {
    sprintf(P(buf), S("%s %s\"%s\""), root, P(grayEscapeSequence), P(theItem.inscription));
    strcpy(root, P(buf));
  }
  return;
}

export function itemKindName(theItem: struct_item | null, kindName: Ptr | null): void {
  if (theItem.category & (ARMOR | CHARM | FOOD | POTION | RING | SCROLL | STAFF | WAND | WEAPON)) {
    strcpy(kindName, $sadd(tableForItemCategory(theItem.category), theItem.kind).name);
  } else {
    switch (theItem.category) {
    case KEY:
      strcpy(kindName, G.keyTable[theItem.kind].name);
      break;
    case GOLD:
      strcpy(kindName, S("gold pieces"));
      break;
    case AMULET:
      strcpy(kindName, S("amulet of yendor"));
      break;
    case GEM:
      strcpy(kindName, S("lumenstone"));
      break;
    default:
      strcpy(kindName, S("unknown"));
      break;
    }
  }
}

export function itemRunicName(theItem: struct_item | null, runicName: Ptr | null): void {
  let vorpalEnemyMonsterClass = $cs("", 15);
  if ((theItem.flags & ITEM_RUNIC) >>> 0) {
    if (theItem.category === ARMOR && theItem.enchant2 === A_IMMUNITY || theItem.category === WEAPON && theItem.enchant2 === W_SLAYING) {
      sprintf(P(vorpalEnemyMonsterClass), S("%s "), P(G.monsterClassCatalog[theItem.vorpalEnemy].name));
    }
    if (theItem.category === WEAPON) {
      sprintf(runicName, S("%s%s"), P(vorpalEnemyMonsterClass), P(G.weaponRunicNames[theItem.enchant2]));
    } else if (theItem.category === ARMOR) {
      sprintf(runicName, S("%s%s"), P(vorpalEnemyMonsterClass), P(G.armorRunicNames[theItem.enchant2]));
    }
  }
}

function enchantMagnitude(): number {
  return $sadd(tableForItemCategory(SCROLL), SCROLL_ENCHANTING).power;
}

export function tableForItemCategory(theCat: number): struct_itemTable | null {
  switch (theCat >>> 0) {
  case FOOD:
    return G.foodTable[0];
  case WEAPON:
    return G.weaponTable[0];
  case ARMOR:
    return G.armorTable[0];
  case POTION:
    return G.potionTable;
  case SCROLL:
    return G.scrollTable;
  case RING:
    return G.ringTable[0];
  case WAND:
    return G.wandTable;
  case STAFF:
    return G.staffTable[0];
  case CHARM:
    return G.charmTable;
  default:
    return null;
  }
}

export function isVowelish(theChar: Ptr | null): number {
  let i = 0;
  while (theChar.a[theChar.o] === COLOR_ESCAPE) {
    theChar = theChar.add(4);
  }
  let str = new Int8Array(30);
  strncpy(P(str), theChar, 30);
  str[29] = 0;
  for (i = 0; 29 > i; i = i + 1 << 16 >> 16) {
    upperCase(P(str, i));
  }
  if (stringsMatch(P(str), S("UNI")) || stringsMatch(P(str), S("EU"))) {
    return false_;
  } else {
    return (str[0] === 65 || str[0] === 69 || str[0] === 73 || str[0] === 79 || str[0] === 85 ? 1 : 0) << 24 >> 24;
  }
}

function enchantIncrement(theItem: struct_item | null): number {
  if (theItem.category & (WEAPON | ARMOR)) {
    if (theItem.strengthRequired === 0) {
      return FP_FACTOR;
    } else if (theItem.strengthRequired > G.rogue.strength - G.player.weaknessAmount) {
      return Math.trunc(2293760 / 10);
    } else {
      return Math.trunc(8192000 / 100);
    }
  } else {
    return FP_FACTOR;
  }
}

export function itemIsCarried(theItem: struct_item | null): number {
  let tempItem = null;
  for (tempItem = G.packItems.nextItem; !!tempItem; tempItem = tempItem.nextItem) {
    if (tempItem === theItem) {
      return true_;
    }
  }
  return false_;
}

function effectiveRingEnchant(theItem: struct_item | null): number {
  if (theItem.category !== RING) {
    return 0;
  }
  if ((theItem.flags & ITEM_IDENTIFIED) >>> 0) {
    return theItem.enchant1;
  } else {
    return (theItem.timesEnchanted + 1 > theItem.enchant1 ? theItem.enchant1 : theItem.timesEnchanted + 1) << 16 >> 16;
  }
}

function apparentRingBonus(kind: number): number {
  let rings = [G.rogue.ringLeft, G.rogue.ringRight];
  let ring = null;
  let retval = 0;
  let i = 0;
  if (G.ringTable[kind].identified) {
    for (i = 0; 2 > i; i = i + 1 << 16 >> 16) {
      ring = rings[i];
      if (ring && ring.kind >>> 0 === kind >>> 0) {
        retval = retval + effectiveRingEnchant(ring) << 16 >> 16;
      }
    }
  }
  return retval;
}

function monsterClassHasAcidicMonster(classID: number): number {
  for (let i = 0; G.monsterClassCatalog[classID].memberList[i] >>> 0 !== 0; ++i) {
    if ((G.monsterCatalog[G.monsterClassCatalog[classID].memberList[i]].flags & MONST_DEFEND_DEGRADE_WEAPON) >>> 0) {
      return true_;
    }
  }
  return false_;
}

export function itemDetails(buf: Ptr | null, theItem: struct_item | null): void {
  let buf2 = new Int8Array(1000);
  let buf3 = new Int8Array(1000);
  let theName = new Int8Array(500);
  let goodColorEscape = new Int8Array(20);
  let badColorEscape = new Int8Array(20);
  let whiteColorEscape = new Int8Array(20);
  let singular = 0;
  let carried = 0;
  let enchant = 0;
  let currentDamage = 0;
  let newDamage = 0;
  let nextLevelState = 0;
  let new_ = 0;
  let current = 0;
  let accuracyChange = 0;
  let damageChange = 0;
  let turnsSinceLatestUse = 0;
  let weaponRunicEffectDescriptions = $rows([$cs("time will stop while you take an extra turn", 79),
$cs("the enemy will die instantly", 79),
$cs("the enemy will be paralyzed", 79),
$cs("[multiplicity]", 79),
$cs("the enemy will be slowed", 79),
$cs("the enemy will be confused", 79),
$cs("the enemy will be flung", 79),
$cs("[slaying]", 79),
$cs("the enemy will be healed", 79),
$cs("the enemy will be cloned", 79)]);
  goodColorEscape[0] = badColorEscape[0] = whiteColorEscape[0] = 0;
  encodeMessageColor(P(goodColorEscape), 0, G.goodMessageColor);
  encodeMessageColor(P(badColorEscape), 0, G.badMessageColor);
  encodeMessageColor(P(whiteColorEscape), 0, G.white);
  singular = (theItem.quantity === 1 ? true_ : false_) << 24 >> 24;
  carried = itemIsCarried(theItem);
  itemName(theItem, P(theName), true_, true_, null);
  buf.a[buf.o] = 0;
  encodeMessageColor(buf, 0, G.itemMessageColor);
  upperCase(P(theName));
  strcat(buf, P(theName));
  if (carried) {
    sprintf(P(buf2), S(" (%c)"), theItem.inventoryLetter);
    strcat(buf, P(buf2));
  }
  encodeMessageColor(buf, strlen(buf) << 16 >> 16, G.white);
  strcat(buf, S("\n\n"));
  enchant = netEnchant(theItem);
  itemName(theItem, P(theName), false_, false_, null);
  if (tableForItemCategory(theItem.category) && ($sadd(tableForItemCategory(theItem.category), theItem.kind).identified || G.rogue.playbackOmniscience)) {
    strcat(buf, P($sadd(tableForItemCategory(theItem.category), theItem.kind).description));
    if (theItem.category === POTION && theItem.kind === POTION_LIFE) {
      sprintf(P(buf2), S("\n\nIt will increase your maximum health by %s%i%%%s."), P(goodColorEscape), ((G.player.info.maxHP + 10) * 100 / G.player.info.maxHP | 0) - 100, P(whiteColorEscape));
      strcat(buf, P(buf2));
    }
  } else {
    switch (theItem.category) {
    case POTION:
      sprintf(P(buf2), S("%s flask%s contain%s a swirling %s liquid. Who knows what %s will do when drunk or thrown?"), singular ? S("This") : S("These"), singular ? S("") : S("s"), singular ? S("s") : S(""), $sadd(tableForItemCategory(theItem.category), theItem.kind).flavor, singular ? S("it") : S("they"));
      break;
    case SCROLL:
      sprintf(P(buf2), S("%s parchment%s %s covered with indecipherable writing, and bear%s a title of \"%s.\" Who knows what %s will do when read aloud?"), singular ? S("This") : S("These"), singular ? S("") : S("s"), singular ? S("is") : S("are"), singular ? S("s") : S(""), $sadd(tableForItemCategory(theItem.category), theItem.kind).flavor, singular ? S("it") : S("they"));
      break;
    case STAFF:
      sprintf(P(buf2), S("This gnarled %s staff is warm to the touch. Who knows what it will do when used?"), $sadd(tableForItemCategory(theItem.category), theItem.kind).flavor);
      break;
    case WAND:
      sprintf(P(buf2), S("This thin %s wand is warm to the touch. Who knows what it will do when used?"), $sadd(tableForItemCategory(theItem.category), theItem.kind).flavor);
      break;
    case RING:
      sprintf(P(buf2), S("This metal band is adorned with a%s %s gem that glitters in the darkness. Who knows what effect it has when worn? "), isVowelish($sadd(tableForItemCategory(theItem.category), theItem.kind).flavor) ? S("n") : S(""), $sadd(tableForItemCategory(theItem.category), theItem.kind).flavor);
      break;
    case CHARM:
      strcat(P(buf2), S("What a perplexing charm!"));
      break;
    case AMULET:
      strcpy(P(buf2), S("Legends are told about this mysterious golden amulet, and legions of adventurers have perished in its pursuit. Unfathomable riches await anyone with the skill and ambition to carry it into the light of day."));
      break;
    case GEM:
      sprintf(P(buf2), S("Faint golden lights swirl and fluoresce beneath the stone%s surface. Lumenstones are said to contain mysterious properties of untold power, but for you, they mean one thing: riches."), singular ? S("'s") : S("s'"));
      break;
    case KEY:
      strcpy(P(buf2), P(G.keyTable[theItem.kind].description));
      break;
    case GOLD:
      sprintf(P(buf2), S("A pile of %i shining gold coins."), theItem.quantity);
      break;
    default:
      break;
    }
    strcat(buf, P(buf2));
  }
  if (carried && theItem.originDepth > 0) {
    sprintf(P(buf2), S(" (You found %s%s on depth %i.) "), singular ? S("it") : S("them"), (theItem.flags & ITEM_IS_KEY) >>> 0 && !(theItem.category & KEY) ? S(" in a vault") : S(""), theItem.originDepth);
    strcat(buf, P(buf2));
  }
  switch (theItem.category) {
  case FOOD:
    sprintf(P(buf2), S("\n\nYou are %shungry enough to fully enjoy a %s."), STOMACH_SIZE - G.player.status[STATUS_NUTRITION] >= G.foodTable[theItem.kind].power ? S("") : S("not yet "), G.foodTable[theItem.kind].name);
    strcat(buf, P(buf2));
    break;
  case WEAPON:
  case ARMOR:
    if ((theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
      if (theItem.enchant1) {
        if (theItem.enchant1 > 0) {
          sprintf(P(buf2), S("\n\nThe %s bear%s an intrinsic enchantment of %s+%i%s"), P(theName), singular ? S("s") : S(""), P(goodColorEscape), theItem.enchant1, P(whiteColorEscape));
        } else {
          sprintf(P(buf2), S("\n\nThe %s bear%s an intrinsic penalty of %s%i%s"), P(theName), singular ? S("s") : S(""), P(badColorEscape), theItem.enchant1, P(whiteColorEscape));
        }
      } else {
        sprintf(P(buf2), S("\n\nThe %s bear%s no intrinsic enchantment"), P(theName), singular ? S("s") : S(""));
      }
      strcat(buf, P(buf2));
      if (strengthModifier(theItem)) {
        sprintf(P(buf2), S(", %s %s %s %s%s%+.2f%s because of your %s strength. "), theItem.enchant1 ? S("and") : S("but"), singular ? S("carries") : S("carry"), theItem.enchant1 && (theItem.enchant1 > 0 ? 1 : 0) === (strengthModifier(theItem) > 0 ? 1 : 0) ? S("an additional") : S("a"), strengthModifier(theItem) > 0 ? S("bonus of ") : S("penalty of "), strengthModifier(theItem) > 0 ? P(goodColorEscape) : P(badColorEscape), strengthModifier(theItem) / FP_FACTOR, P(whiteColorEscape), strengthModifier(theItem) > 0 ? S("excess") : S("inadequate"));
        strcat(buf, P(buf2));
      } else {
        strcat(buf, S(". "));
      }
    } else {
      if (theItem.enchant1 > 0 && (theItem.flags & ITEM_MAGIC_DETECTED) >>> 0) {
        sprintf(P(buf2), S("\n\nYou can feel an %saura of benevolent magic%s radiating from the %s. "), P(goodColorEscape), P(whiteColorEscape), P(theName));
        strcat(buf, P(buf2));
      }
      if (strengthModifier(theItem)) {
        sprintf(P(buf2), S("\n\nThe %s %s%s a %s%s%+.2f%s because of your %s strength. "), P(theName), theItem.enchant1 > 0 && (theItem.flags & ITEM_MAGIC_DETECTED) >>> 0 ? S("also ") : S(""), singular ? S("carries") : S("carry"), strengthModifier(theItem) > 0 ? S("bonus of ") : S("penalty of "), strengthModifier(theItem) > 0 ? P(goodColorEscape) : P(badColorEscape), strengthModifier(theItem) / FP_FACTOR, P(whiteColorEscape), strengthModifier(theItem) > 0 ? S("excess") : S("inadequate"));
        strcat(buf, P(buf2));
      }
      if (theItem.category & WEAPON) {
        sprintf(P(buf2), S("It will reveal its secrets if you defeat %i%s %s with it. "), theItem.charges, theItem.charges === G.gameConst.weaponKillsToAutoID ? S("") : S(" more"), theItem.charges === 1 ? S("enemy") : S("enemies"));
      } else {
        sprintf(P(buf2), S("It will reveal its secrets if worn for %i%s turn%s. "), theItem.charges, theItem.charges === G.gameConst.armorDelayToAutoID ? S("") : S(" more"), theItem.charges === 1 ? S("") : S("s"));
      }
      strcat(buf, P(buf2));
    }
    if (!((theItem.flags & ITEM_EQUIPPED) >>> 0)) {
      if (theItem.category & WEAPON) {
        current = G.player.info.accuracy;
        if (G.rogue.weapon) {
          currentDamage = Math.trunc($mul64(G.rogue.weapon.damage.lowerBound + G.rogue.weapon.damage.upperBound, FP_FACTOR) / 2);
          if ((G.rogue.weapon.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
            current = Math.trunc($mul64(current, accuracyFraction(netEnchant(G.rogue.weapon))) / FP_FACTOR) << 16 >> 16;
            currentDamage = Math.trunc($mul64(currentDamage, damageFraction(netEnchant(G.rogue.weapon))) / FP_FACTOR);
          } else {
            current = Math.trunc($mul64(current, accuracyFraction(strengthModifier(G.rogue.weapon))) / FP_FACTOR) << 16 >> 16;
            currentDamage = Math.trunc($mul64(currentDamage, damageFraction(strengthModifier(G.rogue.weapon))) / FP_FACTOR);
          }
        } else {
          currentDamage = Math.trunc($mul64(G.player.info.damage.lowerBound + G.player.info.damage.upperBound, FP_FACTOR) / 2);
        }
        new_ = G.player.info.accuracy;
        newDamage = Math.trunc($mul64(theItem.damage.lowerBound + theItem.damage.upperBound, FP_FACTOR) / 2);
        if ((theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
          new_ = Math.trunc($mul64(new_, accuracyFraction(netEnchant(theItem))) / FP_FACTOR) << 16 >> 16;
          newDamage = Math.trunc($mul64(newDamage, damageFraction(netEnchant(theItem))) / FP_FACTOR);
        } else {
          new_ = Math.trunc($mul64(new_, accuracyFraction(strengthModifier(theItem))) / FP_FACTOR) << 16 >> 16;
          newDamage = Math.trunc($mul64(newDamage, damageFraction(strengthModifier(theItem))) / FP_FACTOR);
        }
        accuracyChange = (new_ * 100 / current | 0) - 100 << 16 >> 16;
        damageChange = Math.trunc($mul64(newDamage, 100) / currentDamage) - 100 << 16 >> 16;
        sprintf(P(buf2), S("Wielding the %s%s will %s your current accuracy by %s%i%%%s, and will %s your current damage by %s%i%%%s. "), P(theName), (theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience ? S("") : S(", assuming it has no hidden properties,"), 0 > accuracyChange ? S("decrease") : S("increase"), 0 > accuracyChange ? P(badColorEscape) : accuracyChange > 0 ? P(goodColorEscape) : S(""), Math.abs(accuracyChange), P(whiteColorEscape), 0 > damageChange ? S("decrease") : S("increase"), 0 > damageChange ? P(badColorEscape) : damageChange > 0 ? P(goodColorEscape) : S(""), Math.abs(damageChange), P(whiteColorEscape));
      } else {
        new_ = 0;
        if ((theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
          new_ = theItem.armor;
          new_ = new_ + Math.trunc($mul64(10, netEnchant(theItem)) / FP_FACTOR) << 16 >> 16;
          new_ = (new_ / 10 | 0) << 16 >> 16;
        } else {
          new_ = armorValueIfUnenchanted(theItem);
        }
        new_ = (0 > new_ ? 0 : new_) << 16 >> 16;
        sprintf(P(buf2), S("Wearing the %s%s will result in an armor rating of %s%i%s. "), P(theName), (theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience ? S("") : S(", assuming it has no hidden properties,"), new_ > displayedArmorValue() ? P(goodColorEscape) : new_ < displayedArmorValue() ? P(badColorEscape) : P(whiteColorEscape), new_, P(whiteColorEscape));
      }
      strcat(buf, P(buf2));
    }
    if ((theItem.flags & ITEM_PROTECTED) >>> 0) {
      sprintf(P(buf2), S("%sThe %s cannot be corroded by acid.%s "), P(goodColorEscape), P(theName), P(whiteColorEscape));
      strcat(buf, P(buf2));
    }
    current = armorStealthAdjustment(G.rogue.armor);
    if (theItem.category & ARMOR && !((theItem.flags & ITEM_EQUIPPED) >>> 0) && current !== armorStealthAdjustment(theItem)) {
      new_ = armorStealthAdjustment(theItem);
      if (G.rogue.armor) {
        new_ = new_ - armorStealthAdjustment(G.rogue.armor) << 16 >> 16;
      }
      sprintf(P(buf2), S("Equipping the %s will %s%s your stealth range by %i%s. "), P(theName), new_ > 0 ? P(badColorEscape) : P(goodColorEscape), new_ > 0 ? S("increase") : S("decrease"), Math.abs(new_), P(whiteColorEscape));
      strcat(buf, P(buf2));
    }
    if (theItem.category & WEAPON) {
      if ((theItem.flags & ITEM_RUNIC) >>> 0) {
        if ((theItem.flags & ITEM_RUNIC_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
          sprintf(P(buf2), S("\n\nGlowing runes of %s adorn the %s. "), P(G.weaponRunicNames[theItem.enchant2]), P(theName));
          strcat(buf, P(buf2));
          if (theItem.enchant2 === W_SLAYING) {
            describeMonsterClass(P(buf3), theItem.vorpalEnemy << 16 >> 16, false_);
            if (monsterClassHasAcidicMonster(theItem.vorpalEnemy << 16 >> 16)) {
              sprintf(P(buf2), S("It is impervious to corrosion when attacking a%s %s, and will never fail to slay one in a single stroke. "), isVowelish(P(buf3)) ? S("n") : S(""), P(buf3));
            } else {
              sprintf(P(buf2), S("It will never fail to slay a%s %s in a single stroke. "), isVowelish(P(buf3)) ? S("n") : S(""), P(buf3));
            }
            strcat(buf, P(buf2));
          } else if (theItem.enchant2 === W_MULTIPLICITY) {
            if ((theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
              sprintf(P(buf2), S("%i%% of the time that it hits an enemy, %i spectral %s%s will spring into being with accuracy and attack power equal to your own, and will dissipate %i turns later. (If the %s is enchanted, %i image%s will appear %i%% of the time, and will last %i turns.)"), runicWeaponChance(theItem, false_, 0), weaponImageCount(enchant), P(theName), weaponImageCount(enchant) > 1 ? S("s") : S(""), weaponImageDuration(enchant), P(theName), weaponImageCount(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem))), weaponImageCount(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem))) > 1 ? S("s") : S(""), runicWeaponChance(theItem, true_, enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem))), weaponImageDuration(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem))));
            } else {
              sprintf(P(buf2), S("Sometimes, when it hits an enemy, spectral %ss will spring into being with accuracy and attack power equal to your own, and will dissipate shortly thereafter."), P(theName));
            }
            strcat(buf, P(buf2));
          } else {
            if ((theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
              if (runicWeaponChance(theItem, false_, 0) < 2 && theItem.strengthRequired > G.rogue.strength - G.player.weaknessAmount) {
                strcpy(P(buf2), S("Its runic effect will almost never activate because of your inadequate strength, but sometimes, when"));
              } else {
                sprintf(P(buf2), S("%i%% of the time that"), runicWeaponChance(theItem, false_, 0));
              }
              strcat(buf, P(buf2));
            } else {
              strcat(buf, S("Sometimes, when"));
            }
            sprintf(P(buf2), S(" it hits an enemy, %s"), P(weaponRunicEffectDescriptions[theItem.enchant2]));
            strcat(buf, P(buf2));
            if ((theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
              switch (theItem.enchant2) {
              case W_SPEED:
                strcat(buf, S(". "));
                break;
              case W_PARALYSIS:
                sprintf(P(buf2), S(" for %i turns. "), weaponParalysisDuration(enchant));
                strcat(buf, P(buf2));
                nextLevelState = weaponParalysisDuration(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem))) << 16 >> 16;
                break;
              case W_SLOWING:
                sprintf(P(buf2), S(" for %i turns. "), weaponSlowDuration(enchant));
                strcat(buf, P(buf2));
                nextLevelState = weaponSlowDuration(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem)));
                break;
              case W_CONFUSION:
                sprintf(P(buf2), S(" for %i turns. "), weaponConfusionDuration(enchant));
                strcat(buf, P(buf2));
                nextLevelState = weaponConfusionDuration(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem)));
                break;
              case W_FORCE:
                sprintf(P(buf2), S(" up to %i spaces backward. If the enemy hits an obstruction, it (and any monster it hits) will take damage in proportion to the distance it flew. "), weaponForceDistance(enchant));
                strcat(buf, P(buf2));
                nextLevelState = weaponForceDistance(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem)));
                break;
              case W_MERCY:
                strcpy(P(buf2), S(" by 50% of its maximum health. "));
                strcat(buf, P(buf2));
                break;
              default:
                strcpy(P(buf2), S(". "));
                strcat(buf, P(buf2));
                break;
              }
              if (((theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) && runicWeaponChance(theItem, false_, 0) < runicWeaponChance(theItem, true_, enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem)))) {
                sprintf(P(buf2), S("(If the %s is enchanted, the chance will increase to %i%%"), P(theName), runicWeaponChance(theItem, true_, enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem))));
                strcat(buf, P(buf2));
                if (nextLevelState) {
                  if (theItem.enchant2 === W_FORCE) {
                    sprintf(P(buf2), S(" and the distance will increase to %i.)"), nextLevelState);
                  } else {
                    sprintf(P(buf2), S(" and the duration will increase to %i turns.)"), nextLevelState);
                  }
                } else {
                  strcpy(P(buf2), S(".)"));
                }
                strcat(buf, P(buf2));
              }
            } else {
              strcat(buf, S(". "));
            }
          }
        } else if ((theItem.flags & ITEM_IDENTIFIED) >>> 0) {
          sprintf(P(buf2), S("\n\nGlowing runes of an indecipherable language run down the length of the %s. "), P(theName));
          strcat(buf, P(buf2));
        }
      }
      if ((theItem.flags & ITEM_EQUIPPED) >>> 0) {
        sprintf(P(buf2), S("\n\nYou hold the %s at the ready%s. "), P(theName), (theItem.flags & ITEM_CURSED) >>> 0 ? S(", and because it is cursed, you are powerless to let go") : S(""));
        strcat(buf, P(buf2));
      } else if (((theItem.flags & (ITEM_IDENTIFIED | ITEM_MAGIC_DETECTED)) >>> 0 || G.rogue.playbackOmniscience) && (theItem.flags & ITEM_CURSED) >>> 0) {
        sprintf(P(buf2), S("\n\n%sYou can feel a malevolent magic lurking within the %s.%s "), P(badColorEscape), P(theName), P(whiteColorEscape));
        strcat(buf, P(buf2));
      }
    } else if (theItem.category & ARMOR) {
      if ((theItem.flags & ITEM_RUNIC) >>> 0) {
        if ((theItem.flags & ITEM_RUNIC_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
          sprintf(P(buf2), S("\n\nGlowing runes of %s adorn the %s. "), P(G.armorRunicNames[theItem.enchant2]), P(theName));
          strcat(buf, P(buf2));
          switch (theItem.enchant2) {
          case A_MULTIPLICITY:
            sprintf(P(buf2), S("When worn, 33%% of the time that an enemy's attack connects, %i allied spectral duplicate%s of your attacker will appear for 3 turns. "), armorImageCount(enchant), armorImageCount(enchant) === 1 ? S("") : S("s"));
            if (armorImageCount(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem))) > armorImageCount(enchant)) {
              sprintf(P(buf3), S("(If the %s is enchanted, the number of duplicates will increase to %i.) "), P(theName), armorImageCount(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem))));
              strcat(P(buf2), P(buf3));
            }
            break;
          case A_MUTUALITY:
            strcpy(P(buf2), S("When worn, the damage that you incur from physical attacks will be split evenly among yourself and all other adjacent enemies. "));
            break;
          case A_ABSORPTION:
            if ((theItem.flags & ITEM_IDENTIFIED) >>> 0) {
              sprintf(P(buf2), S("It will reduce the damage of inbound attacks by a random amount between 1 and %i, which is %i%% of your current maximum health. (If the %s is enchanted, this maximum amount will %s %i.) "), armorAbsorptionMax(enchant), 100 * armorAbsorptionMax(enchant) / G.player.info.maxHP | 0, P(theName), armorAbsorptionMax(enchant) === armorAbsorptionMax(enchant + enchantIncrement(theItem)) ? S("remain at") : S("increase to"), armorAbsorptionMax(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem))));
            } else {
              strcpy(P(buf2), S("It will reduce the damage of inbound attacks by a random amount determined by its enchantment level. "));
            }
            break;
          case A_REPRISAL:
            if ((theItem.flags & ITEM_IDENTIFIED) >>> 0) {
              sprintf(P(buf2), S("Any enemy that attacks you will itself be wounded by %i%% of the damage that it inflicts. (If the %s is enchanted, this percentage will increase to %i%%.) "), armorReprisalPercent(enchant), P(theName), armorReprisalPercent(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem))));
            } else {
              strcpy(P(buf2), S("Any enemy that attacks you will itself be wounded by a percentage (determined by enchantment level) of the damage that it inflicts. "));
            }
            break;
          case A_IMMUNITY:
            describeMonsterClass(P(buf3), theItem.vorpalEnemy << 16 >> 16, false_);
            sprintf(P(buf2), S("It offers complete protection from any attacking %s. "), P(buf3));
            break;
          case A_REFLECTION:
            if ((theItem.flags & ITEM_IDENTIFIED) >>> 0) {
              if (theItem.enchant1 > 0) {
                let reflectChance = reflectionChance(enchant);
                let reflectChance2 = reflectionChance(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem)));
                sprintf(P(buf2), S("When worn, you will deflect %i%% of incoming spells -- including directly back at their source %i%% of the time. (If the armor is enchanted, these will increase to %i%% and %i%%.) "), reflectChance, Math.imul(reflectChance, reflectChance) / 100 | 0, reflectChance2, Math.imul(reflectChance2, reflectChance2) / 100 | 0);
              } else if (0 > theItem.enchant1) {
                let reflectChance = reflectionChance(enchant);
                let reflectChance2 = reflectionChance(enchant + $mul64(enchantMagnitude(), enchantIncrement(theItem)));
                sprintf(P(buf2), S("When worn, %i%% of your own spells will deflect from their target -- including directly back at you %i%% of the time. (If the armor is enchanted, these will decrease to %i%% and %i%%.) "), reflectChance, Math.imul(reflectChance, reflectChance) / 100 | 0, reflectChance2, Math.imul(reflectChance2, reflectChance2) / 100 | 0);
              }
            } else {
              strcpy(P(buf2), S("When worn, you will deflect some percentage of incoming spells, determined by enchantment level. "));
            }
            break;
          case A_RESPIRATION:
            strcpy(P(buf2), S("When worn, it will maintain a pocket of fresh air around you, rendering you immune to the effects of steam and all toxic gases. "));
            break;
          case A_DAMPENING:
            strcpy(P(buf2), S("When worn, it will safely absorb the concussive impact of any explosions (though you may still be burned). "));
            break;
          case A_BURDEN:
            strcpy(P(buf2), S("10% of the time it absorbs a blow, its strength requirement will permanently increase. "));
            break;
          case A_VULNERABILITY:
            strcpy(P(buf2), S("While it is worn, inbound attacks will inflict twice as much damage. "));
            break;
          case A_IMMOLATION:
            strcpy(P(buf2), S("10% of the time it absorbs a blow, it will explode in flames. "));
            break;
          default:
            break;
          }
          strcat(buf, P(buf2));
        } else if ((theItem.flags & ITEM_IDENTIFIED) >>> 0) {
          sprintf(P(buf2), S("\n\nGlowing runes of an indecipherable language spiral around the %s. "), P(theName));
          strcat(buf, P(buf2));
        }
      }
      if ((theItem.flags & ITEM_EQUIPPED) >>> 0) {
        sprintf(P(buf2), S("\n\nYou are wearing the %s%s. "), P(theName), (theItem.flags & ITEM_CURSED) >>> 0 ? S(", and because it is cursed, you are powerless to remove it") : S(""));
        strcat(buf, P(buf2));
      } else if (((theItem.flags & (ITEM_IDENTIFIED | ITEM_MAGIC_DETECTED)) >>> 0 || G.rogue.playbackOmniscience) && (theItem.flags & ITEM_CURSED) >>> 0) {
        sprintf(P(buf2), S("\n\n%sYou can feel a malevolent magic lurking within the %s.%s "), P(badColorEscape), P(theName), P(whiteColorEscape));
        strcat(buf, P(buf2));
      }
    }
    break;
  case STAFF:
    new_ = apparentRingBonus(RING_WISDOM);
    if ((theItem.flags & ITEM_IDENTIFIED) >>> 0 || G.rogue.playbackOmniscience) {
      sprintf(P(buf2), S("\n\nThe %s has %i charges remaining out of a maximum of %i charges, and%s recovers a charge in approximately %lli turns. "), P(theName), theItem.charges, theItem.enchant1, new_ === 0 ? S("") : S(", with your current rings,"), Math.trunc($mul64(staffChargeDuration(theItem), 65536) / $mul64(10, ringWisdomMultiplier($mul64(new_, 65536)))));
      strcat(buf, P(buf2));
    } else if ((theItem.flags & ITEM_MAX_CHARGES_KNOWN) >>> 0) {
      sprintf(P(buf2), S("\n\nThe %s has a maximum of %i charges, and%s recovers a charge in approximately %lli turns. "), P(theName), theItem.enchant1, new_ === 0 ? S("") : S(", with your current rings,"), Math.trunc($mul64(staffChargeDuration(theItem), 65536) / $mul64(10, ringWisdomMultiplier($mul64(new_, 65536)))));
      strcat(buf, P(buf2));
    }
    if (theItem.lastUsed[0] > 0 && theItem.lastUsed[1] > 0 && theItem.lastUsed[2] > 0) {
      sprintf(P(buf2), S("You last used it %li, %li and %li turns ago. "), G.rogue.absoluteTurnNumber - theItem.lastUsed[0], G.rogue.absoluteTurnNumber - theItem.lastUsed[1], G.rogue.absoluteTurnNumber - theItem.lastUsed[2]);
      strcat(buf, P(buf2));
    } else if (theItem.lastUsed[0] > 0 && theItem.lastUsed[1] > 0) {
      sprintf(P(buf2), S("You last used it %li and %li turns ago. "), G.rogue.absoluteTurnNumber - theItem.lastUsed[0], G.rogue.absoluteTurnNumber - theItem.lastUsed[1]);
      strcat(buf, P(buf2));
    } else if (theItem.lastUsed[0] > 0) {
      turnsSinceLatestUse = G.rogue.absoluteTurnNumber - theItem.lastUsed[0];
      sprintf(P(buf2), S("You last used it %li turn%s ago. "), turnsSinceLatestUse, turnsSinceLatestUse === 1 ? S("") : S("s"));
      strcat(buf, P(buf2));
    }
    if ((theItem.flags & (ITEM_IDENTIFIED | ITEM_MAX_CHARGES_KNOWN)) >>> 0 && G.staffTable[theItem.kind].identified || G.rogue.playbackOmniscience) {
      switch (theItem.kind) {
      case STAFF_LIGHTNING:
        sprintf(P(buf2), S("This staff deals damage to every creature in its line of fire; nothing is immune. (If the staff is enchanted, its average damage will increase by %i%%.)"), (100 * (staffDamageLow(enchant + $mul64(enchantMagnitude(), FP_FACTOR)) + staffDamageHigh(enchant + $mul64(enchantMagnitude(), FP_FACTOR))) / (staffDamageLow(enchant) + staffDamageHigh(enchant)) | 0) - 100);
        break;
      case STAFF_FIRE:
        sprintf(P(buf2), S("This staff deals damage to any creature that it hits, unless the creature is immune to fire. (If the staff is enchanted, its average damage will increase by %i%%.) It also sets creatures and flammable terrain on fire."), (100 * (staffDamageLow(enchant + $mul64(enchantMagnitude(), FP_FACTOR)) + staffDamageHigh(enchant + $mul64(enchantMagnitude(), FP_FACTOR))) / (staffDamageLow(enchant) + staffDamageHigh(enchant)) | 0) - 100);
        break;
      case STAFF_POISON:
        sprintf(P(buf2), S("The bolt from this staff will poison any creature that it hits for %i turns. (If the staff is enchanted, this will increase to %i turns.)"), staffPoison(enchant), staffPoison(enchant + $mul64(enchantMagnitude(), FP_FACTOR)));
        break;
      case STAFF_TUNNELING:
        sprintf(P(buf2), S("The bolt from this staff will dissolve %i layers of obstruction. (If the staff is enchanted, this will increase to %i layers.)"), theItem.enchant1, theItem.enchant1 + enchantMagnitude());
        break;
      case STAFF_BLINKING:
        sprintf(P(buf2), S("This staff enables you to teleport up to %i spaces. (If the staff is enchanted, this will increase to %i spaces.)"), staffBlinkDistance(enchant), staffBlinkDistance(enchant + $mul64(enchantMagnitude(), FP_FACTOR)));
        break;
      case STAFF_ENTRANCEMENT:
        sprintf(P(buf2), S("This staff will compel its target to mirror your movements for %i turns. (If the staff is enchanted, this will increase to %i turns.)"), staffEntrancementDuration(enchant), staffEntrancementDuration(enchant + $mul64(enchantMagnitude(), FP_FACTOR)));
        break;
      case STAFF_HEALING:
        if (10 > Math.trunc(enchant / FP_FACTOR)) {
          sprintf(P(buf2), S("This staff will heal its target by %i%% of its maximum health. (If the staff is enchanted, this will increase to %i%%.)"), theItem.enchant1 * 10, (theItem.enchant1 + enchantMagnitude()) * 10);
        } else {
          strcpy(P(buf2), S("This staff will completely heal its target."));
        }
        break;
      case STAFF_HASTE:
        sprintf(P(buf2), S("This staff will cause its target to move twice as fast for %i turns. (If the staff is enchanted, this will increase to %i turns.)"), staffHasteDuration(enchant), staffHasteDuration(enchant + $mul64(enchantMagnitude(), FP_FACTOR)));
        break;
      case STAFF_OBSTRUCTION:
        strcpy(P(buf2), S(""));
        break;
      case STAFF_DISCORD:
        sprintf(P(buf2), S("This staff will cause discord for %i turns. (If the staff is enchanted, this will increase to %i turns.)"), staffDiscordDuration(enchant), staffDiscordDuration(enchant + $mul64(enchantMagnitude(), FP_FACTOR)));
        break;
      case STAFF_CONJURATION:
        sprintf(P(buf2), S("%i phantom blades will be called into service. (If the staff is enchanted, this will increase to %i blades.)"), staffBladeCount(enchant), staffBladeCount(enchant + $mul64(enchantMagnitude(), FP_FACTOR)));
        break;
      case STAFF_PROTECTION:
        sprintf(P(buf2), S("This staff will shield a creature for up to 20 turns against up to %i damage. (If the staff is enchanted, this will increase to %i damage.)"), staffProtection(enchant) / 10 | 0, staffProtection(enchant + $mul64(enchantMagnitude(), FP_FACTOR)) / 10 | 0);
        break;
      default:
        strcpy(P(buf2), S("No one knows what this staff does."));
        break;
      }
      if (buf2[0]) {
        strcat(buf, S("\n\n"));
        strcat(buf, P(buf2));
      }
    }
    break;
  case WAND:
    strcat(buf, S("\n\n"));
    if ((theItem.flags & (ITEM_IDENTIFIED | ITEM_MAX_CHARGES_KNOWN)) >>> 0 || G.rogue.playbackOmniscience) {
      if (theItem.charges) {
        sprintf(P(buf2), S("%i charge%s remain%s. Enchanting this wand will add %i charge%s."), theItem.charges, theItem.charges === 1 ? S("") : S("s"), theItem.charges === 1 ? S("s") : S(""), Math.imul($sadd(G.wandTable, theItem.kind).range.lowerBound, enchantMagnitude()), Math.imul($sadd(G.wandTable, theItem.kind).range.lowerBound, enchantMagnitude()) === 1 ? S("") : S("s"));
      } else {
        sprintf(P(buf2), S("No charges remain.  Enchanting this wand will add %i charge%s."), Math.imul($sadd(G.wandTable, theItem.kind).range.lowerBound, enchantMagnitude()), Math.imul($sadd(G.wandTable, theItem.kind).range.lowerBound, enchantMagnitude()) === 1 ? S("") : S("s"));
      }
    } else {
      if (theItem.enchant2) {
        sprintf(P(buf2), S("You have used this wand %i time%s, but do not know how many charges, if any, remain."), theItem.enchant2, theItem.enchant2 === 1 ? S("") : S("s"));
      } else {
        strcpy(P(buf2), S("You have not yet used this wand."));
      }
      if ($sadd(G.wandTable, theItem.kind).identified) {
        strcat(buf, P(buf2));
        sprintf(P(buf2), S(" Wands of this type can be found with %i to %i charges. Enchanting this wand will add %i charge%s."), $sadd(G.wandTable, theItem.kind).range.lowerBound, $sadd(G.wandTable, theItem.kind).range.upperBound, Math.imul($sadd(G.wandTable, theItem.kind).range.lowerBound, enchantMagnitude()), Math.imul($sadd(G.wandTable, theItem.kind).range.lowerBound, enchantMagnitude()) === 1 ? S("") : S("s"));
      }
    }
    strcat(buf, P(buf2));
    break;
  case RING:
    if ((theItem.flags & ITEM_IDENTIFIED) >>> 0 && G.ringTable[theItem.kind].identified || G.rogue.playbackOmniscience) {
      if (theItem.enchant1) {
        switch (theItem.kind) {
        case RING_CLAIRVOYANCE:
          if (theItem.enchant1 > 0) {
            sprintf(P(buf2), S("\n\nThis ring provides magical sight with a radius of %i. (If the ring is enchanted, this will increase to %i.)"), theItem.enchant1 + 1, theItem.enchant1 + 1 + enchantMagnitude());
          } else {
            sprintf(P(buf2), S("\n\nThis ring magically blinds you to a radius of %i. (If the ring is enchanted, this will decrease to %i.)"), theItem.enchant1 * -1 + 1, theItem.enchant1 * -1 + 1 - enchantMagnitude());
          }
          strcat(buf, P(buf2));
          break;
        case RING_REGENERATION:
          sprintf(P(buf2), S("\n\nWith this ring equipped, you will regenerate all of your health in %li turns (instead of %li). (If the ring is enchanted, this will decrease to %li turns.)"), Math.trunc(turnsForFullRegenInThousandths(enchant) / 1000), TURNS_FOR_FULL_REGEN, Math.trunc(turnsForFullRegenInThousandths(enchant + $mul64(enchantMagnitude(), FP_FACTOR)) / 1000));
          strcat(buf, P(buf2));
          break;
        case RING_TRANSFERENCE:
          sprintf(P(buf2), S("\n\nDealing direct damage to a creature (whether in melee or otherwise) will %s you by %i%% of the damage dealt. (If the ring is enchanted, this will %s to %i%%.)"), theItem.enchant1 >= 0 ? S("heal") : S("harm"), Math.abs(theItem.enchant1) * 5, theItem.enchant1 >= 0 ? S("increase") : S("decrease"), Math.abs(theItem.enchant1 + enchantMagnitude()) * 5);
          strcat(buf, P(buf2));
          break;
        case RING_WISDOM:
          sprintf(P(buf2), S("\n\nWhen worn, your staffs will recharge at %i%% of their normal rate. (If the ring is enchanted, the rate will increase to %i%% of the normal rate.)"), Math.trunc($mul64(100, ringWisdomMultiplier(enchant)) / FP_FACTOR) | 0, Math.trunc($mul64(100, ringWisdomMultiplier(enchant + $mul64(enchantMagnitude(), FP_FACTOR))) / FP_FACTOR) | 0);
          strcat(buf, P(buf2));
          break;
        case RING_REAPING:
          sprintf(P(buf2), S("\n\nEach blow that you land with a weapon will %s your staffs and charms by 0-%i turns per point of damage dealt. (If the ring is enchanted, this will %s to 0-%i turns per point of damage.)"), theItem.enchant1 >= 0 ? S("recharge") : S("drain"), Math.abs(theItem.enchant1), theItem.enchant1 >= 0 ? S("increase") : S("decrease"), Math.abs(theItem.enchant1 + enchantMagnitude()));
          strcat(buf, P(buf2));
          break;
        default:
          break;
        }
      }
    } else {
      sprintf(P(buf2), S("\n\nIt will reveal its secrets if worn for %i%s turn%s"), theItem.charges, theItem.charges === G.gameConst.ringDelayToAutoID ? S("") : S(" more"), theItem.charges === 1 ? S("") : S("s"));
      strcat(buf, P(buf2));
      if (!((theItem.flags & ITEM_IDENTIFIED) >>> 0) && (G.gameConst.ringDelayToAutoID > theItem.charges || (theItem.flags & ITEM_MAGIC_DETECTED) >>> 0)) {
        sprintf(P(buf2), S(", and until then it will function, at best, as a +%i ring."), theItem.timesEnchanted + 1);
        strcat(buf, P(buf2));
      } else {
        strcat(buf, S("."));
      }
    }
    if ((theItem.flags & ITEM_EQUIPPED) >>> 0) {
      sprintf(P(buf2), S("\n\nThe %s is on your finger%s. "), P(theName), (theItem.flags & ITEM_CURSED) >>> 0 ? S(", and because it is cursed, you are powerless to remove it") : S(""));
      strcat(buf, P(buf2));
    } else if (((theItem.flags & (ITEM_IDENTIFIED | ITEM_MAGIC_DETECTED)) >>> 0 || G.rogue.playbackOmniscience) && (theItem.flags & ITEM_CURSED) >>> 0) {
      sprintf(P(buf2), S("\n\n%sYou can feel a malevolent magic lurking within the %s.%s "), P(badColorEscape), P(theName), P(whiteColorEscape));
      strcat(buf, P(buf2));
    }
    break;
  case CHARM:
    switch (theItem.kind) {
    case CHARM_HEALTH:
      sprintf(P(buf2), S("\n\nWhen used, the charm will heal %i%% of your health and recharge in %i turns. (If the charm is enchanted, it will heal %i%% of your health and recharge in %i turns.)"), charmHealing(enchant), charmRechargeDelay(theItem.kind, theItem.enchant1), charmHealing(enchant + $mul64(enchantMagnitude(), FP_FACTOR)), charmRechargeDelay(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16));
      break;
    case CHARM_PROTECTION:
      sprintf(P(buf2), S("\n\nWhen used, the charm will shield you for up to 20 turns for up to %i%% of your total health and recharge in %i turns. (If the charm is enchanted, it will shield up to %i%% of your total health and recharge in %i turns.)"), (100 * charmProtection(enchant) / 10 | 0) / G.player.info.maxHP | 0, charmRechargeDelay(theItem.kind, theItem.enchant1), (100 * charmProtection(enchant + $mul64(enchantMagnitude(), FP_FACTOR)) / 10 | 0) / G.player.info.maxHP | 0, charmRechargeDelay(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16));
      break;
    case CHARM_HASTE:
      sprintf(P(buf2), S("\n\nWhen used, the charm will haste you for %i turns and recharge in %i turns. (If the charm is enchanted, the haste will last %i turns and it will recharge in %i turns.)"), charmEffectDuration(theItem.kind, theItem.enchant1), charmRechargeDelay(theItem.kind, theItem.enchant1), charmEffectDuration(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16), charmRechargeDelay(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16));
      break;
    case CHARM_FIRE_IMMUNITY:
      sprintf(P(buf2), S("\n\nWhen used, the charm will grant you immunity to fire for %i turns and recharge in %i turns. (If the charm is enchanted, the immunity will last %i turns and it will recharge in %i turns.)"), charmEffectDuration(theItem.kind, theItem.enchant1), charmRechargeDelay(theItem.kind, theItem.enchant1), charmEffectDuration(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16), charmRechargeDelay(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16));
      break;
    case CHARM_INVISIBILITY:
      sprintf(P(buf2), S("\n\nWhen used, the charm will turn you invisible for %i turns and recharge in %i turns. While invisible, monsters more than two spaces away cannot track you. (If the charm is enchanted, the invisibility will last %i turns and it will recharge in %i turns.)"), charmEffectDuration(theItem.kind, theItem.enchant1), charmRechargeDelay(theItem.kind, theItem.enchant1), charmEffectDuration(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16), charmRechargeDelay(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16));
      break;
    case CHARM_TELEPATHY:
      sprintf(P(buf2), S("\n\nWhen used, the charm will grant you telepathy for %i turns and recharge in %i turns. (If the charm is enchanted, the telepathy will last %i turns and it will recharge in %i turns.)"), charmEffectDuration(theItem.kind, theItem.enchant1), charmRechargeDelay(theItem.kind, theItem.enchant1), charmEffectDuration(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16), charmRechargeDelay(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16));
      break;
    case CHARM_LEVITATION:
      sprintf(P(buf2), S("\n\nWhen used, the charm will lift you off the ground for %i turns and recharge in %i turns. (If the charm is enchanted, the levitation will last %i turns and it will recharge in %i turns.)"), charmEffectDuration(theItem.kind, theItem.enchant1), charmRechargeDelay(theItem.kind, theItem.enchant1), charmEffectDuration(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16), charmRechargeDelay(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16));
      break;
    case CHARM_SHATTERING:
      sprintf(P(buf2), S("\n\nWhen used, the charm will dissolve the nearby walls up to %i spaces away, and recharge in %i turns. (If the charm is enchanted, it will reach up to %i spaces and recharge in %i turns.)"), charmShattering(enchant), charmRechargeDelay(theItem.kind, theItem.enchant1), charmShattering(enchant + $mul64(enchantMagnitude(), FP_FACTOR)), charmRechargeDelay(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16));
      break;
    case CHARM_GUARDIAN:
      sprintf(P(buf2), S("\n\nWhen used, a guardian will materialize for %i turns, and the charm will recharge in %i turns. (If the charm is enchanted, the guardian will last for %i turns and the charm will recharge in %i turns.)"), charmGuardianLifespan(enchant), charmRechargeDelay(theItem.kind, theItem.enchant1), charmGuardianLifespan(enchant + $mul64(enchantMagnitude(), FP_FACTOR)), charmRechargeDelay(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16));
      break;
    case CHARM_TELEPORTATION:
      sprintf(P(buf2), S("\n\nWhen used, the charm will teleport you elsewhere in the dungeon and recharge in %i turns. (If the charm is enchanted, it will recharge in %i turns.)"), charmRechargeDelay(theItem.kind, theItem.enchant1), charmRechargeDelay(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16));
      break;
    case CHARM_RECHARGING:
      sprintf(P(buf2), S("\n\nWhen used, the charm will recharge your staffs (though not your wands or charms), after which it will recharge in %i turns. (If the charm is enchanted, it will recharge in %i turns.)"), charmRechargeDelay(theItem.kind, theItem.enchant1), charmRechargeDelay(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16));
      break;
    case CHARM_NEGATION:
      sprintf(P(buf2), S("\n\nWhen used, the charm will emit a wave of anti-magic up to %i spaces away, negating all magical effects on you and on creatures and dropped items in your field of view. It will recharge in %i turns. (If the charm is enchanted, it will reach up to %i spaces and recharge in %i turns.)"), charmNegationRadius(enchant), charmRechargeDelay(theItem.kind, theItem.enchant1), charmNegationRadius(enchant + $mul64(enchantMagnitude(), FP_FACTOR)), charmRechargeDelay(theItem.kind, theItem.enchant1 + enchantMagnitude() << 16 >> 16));
      break;
    default:
      break;
    }
    strcat(buf, P(buf2));
    break;
  default:
    break;
  }
}

function displayMagicCharForItem(theItem: struct_item | null): number {
  if (!((theItem.flags & ITEM_MAGIC_DETECTED) >>> 0) || theItem.category & PRENAMED_CATEGORY) {
    return false_;
  } else {
    return true_;
  }
}

export async function displayInventory(categoryMask: number, requiredFlags: number, forbiddenFlags: number, waitForAcknowledge: number, includeButtons: number): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let theItem = null;
  let i = 0;
  let j = 0;
  let m = 0;
  let maxLength = 0;
  let itemNumber = 0;
  let itemCount = 0;
  let equippedItemCount = 0;
  let extraLineCount = 0;
  let itemList = new Array(29).fill(null);
  let buf = new Int8Array(300);
  let theKey = 0;
  let theEvent = new struct_rogueEvent();
  let magicDetected = 0;
  let repeatDisplay = 0;
  let highlightItemLine = 0;
  let itemSpaceRemaining = 0;
  let buttons = $sarrOf([struct_brogueButton.$of(new Int8Array(300), 0, 0, new Float64Array(10), new struct_color(), new struct_color(), new struct_color(), 0, new Int32Array(100)),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton(),
new struct_brogueButton()]);
  let actionKey = -1;
  let darkItemColor = new struct_color();
  let whiteColorEscapeSequence = new Int8Array(20);
  let grayColorEscapeSequence = new Int8Array(20);
  let yellowColorEscapeSequence = new Int8Array(20);
  let darkYellowColorEscapeSequence = new Int8Array(20);
  let goodColorEscapeSequence = new Int8Array(20);
  let badColorEscapeSequence = new Int8Array(20);
  let magicEscapePtr = null;
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  await clearCursorPath();
  let dbuf = new struct_screenDisplayBuffer();
  clearDisplayBuffer(dbuf);
  whiteColorEscapeSequence[0] = 0;
  encodeMessageColor(P(whiteColorEscapeSequence), 0, G.white);
  grayColorEscapeSequence[0] = 0;
  encodeMessageColor(P(grayColorEscapeSequence), 0, G.gray);
  yellowColorEscapeSequence[0] = 0;
  encodeMessageColor(P(yellowColorEscapeSequence), 0, G.itemColor);
  darkItemColor.$cp(G.itemColor);
  applyColorAverage(darkItemColor, G.black, 50);
  darkYellowColorEscapeSequence[0] = 0;
  encodeMessageColor(P(darkYellowColorEscapeSequence), 0, darkItemColor);
  goodColorEscapeSequence[0] = 0;
  encodeMessageColor(P(goodColorEscapeSequence), 0, G.goodMessageColor);
  badColorEscapeSequence[0] = 0;
  encodeMessageColor(P(badColorEscapeSequence), 0, G.badMessageColor);
  if (!G.packItems.nextItem) {
    confirmMessages();
    await message(S("Your pack is empty!"), 0);
    G.rogue.RNG = oldRNG;
    ;
    return 0;
  }
  magicDetected = false_;
  for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
    if (displayMagicCharForItem(theItem) && (theItem.flags & ITEM_MAGIC_DETECTED) >>> 0) {
      magicDetected = true_;
    }
  }
  itemNumber = 0;
  equippedItemCount = 0;
  if (G.rogue.weapon) {
    itemList[itemNumber] = G.rogue.weapon;
    itemNumber = itemNumber + 1 << 16 >> 16;
    equippedItemCount = equippedItemCount + 1 << 16 >> 16;
  }
  if (G.rogue.armor) {
    itemList[itemNumber] = G.rogue.armor;
    itemNumber = itemNumber + 1 << 16 >> 16;
    equippedItemCount = equippedItemCount + 1 << 16 >> 16;
  }
  if (G.rogue.ringLeft) {
    itemList[itemNumber] = G.rogue.ringLeft;
    itemNumber = itemNumber + 1 << 16 >> 16;
    equippedItemCount = equippedItemCount + 1 << 16 >> 16;
  }
  if (G.rogue.ringRight) {
    itemList[itemNumber] = G.rogue.ringRight;
    itemNumber = itemNumber + 1 << 16 >> 16;
    equippedItemCount = equippedItemCount + 1 << 16 >> 16;
  }
  for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
    if (!((theItem.flags & ITEM_EQUIPPED) >>> 0)) {
      itemList[itemNumber] = theItem;
      itemNumber = itemNumber + 1 << 16 >> 16;
    }
  }
  for (i = 0; (26 > 31 + 3 ? 26 : 31 + 3) > i; i = i + 1 << 16 >> 16) {
    buttons[i].y = i + (equippedItemCount && i >= equippedItemCount ? 1 : 0) + 3 << 16 >> 16;
    buttons[i].buttonColor.$cp(G.black);
    buttons[i].opacity = INTERFACE_OPACITY;
    ($t1 = buttons[i], $t1.flags = ($t1.flags | B_DRAW) >>> 0);
  }
  let closeParen = (KEYBOARD_LABELS ? 41 : 32) << 24 >> 24;
  for (i = 0; itemNumber > i; i = i + 1 << 16 >> 16) {
    theItem = itemList[i];
    ($t2 = buttons[i], $t2.flags = ($t2.flags | (B_DRAW | B_GRADIENT | B_ENABLED)) >>> 0);
    if (!waitForAcknowledge) {
      ($t3 = buttons[i], $t3.flags = ($t3.flags | B_KEYPRESS_HIGHLIGHT) >>> 0);
    }
    buttons[i].hotkey[0] = theItem.inventoryLetter;
    buttons[i].hotkey[1] = theItem.inventoryLetter + 65 - 97;
    if (theItem.category & categoryMask && !((~theItem.flags >>> 0 & requiredFlags) >>> 0) && !((theItem.flags & forbiddenFlags) >>> 0)) {
      ($t4 = buttons[i], $t4.flags = ($t4.flags | B_HOVER_ENABLED) >>> 0);
    }
    itemName(theItem, P(buf), true_, true_, (buttons[i].flags & B_HOVER_ENABLED) >>> 0 ? G.white : G.gray);
    upperCase(P(buf));
    if ((theItem.flags & ITEM_MAGIC_DETECTED) >>> 0 && !(theItem.category & AMULET)) {
      let polarity = itemMagicPolarity(theItem);
      if (polarity === 0) {
        buttons[i].symbol[0] = 45;
        magicEscapePtr = P(yellowColorEscapeSequence);
      } else if (polarity === 1) {
        buttons[i].symbol[0] = G_GOOD_MAGIC;
        magicEscapePtr = P(goodColorEscapeSequence);
      } else {
        buttons[i].symbol[0] = G_BAD_MAGIC;
        magicEscapePtr = P(badColorEscapeSequence);
      }
      sprintf(P(buttons[i].text), S(" %c%c %s* %s* %s%s%s%s"), KEYBOARD_LABELS ? theItem.inventoryLetter : 32, (theItem.flags & ITEM_PROTECTED) >>> 0 ? 125 : closeParen, magicEscapePtr, (buttons[i].flags & B_HOVER_ENABLED) >>> 0 ? P(yellowColorEscapeSequence) : P(darkYellowColorEscapeSequence), (buttons[i].flags & B_HOVER_ENABLED) >>> 0 ? P(whiteColorEscapeSequence) : P(grayColorEscapeSequence), P(buf), P(grayColorEscapeSequence), (theItem.flags & ITEM_EQUIPPED) >>> 0 ? theItem.category & WEAPON ? S(" (in hand) ") : S(" (worn) ") : S(""));
      buttons[i].symbol[1] = theItem.displayChar;
    } else {
      sprintf(P(buttons[i].text), S(" %c%c %s%s* %s%s%s%s"), KEYBOARD_LABELS ? theItem.inventoryLetter : 32, (theItem.flags & ITEM_PROTECTED) >>> 0 ? 125 : closeParen, magicDetected ? S("  ") : S(""), (buttons[i].flags & B_HOVER_ENABLED) >>> 0 ? P(yellowColorEscapeSequence) : P(darkYellowColorEscapeSequence), (buttons[i].flags & B_HOVER_ENABLED) >>> 0 ? P(whiteColorEscapeSequence) : P(grayColorEscapeSequence), P(buf), P(grayColorEscapeSequence), (theItem.flags & ITEM_EQUIPPED) >>> 0 ? theItem.category & WEAPON ? S(" (in hand) ") : S(" (worn) ") : S(""));
      buttons[i].symbol[0] = theItem.displayChar;
    }
    maxLength = (maxLength > strLenWithoutEscapes(P(buttons[i].text)) ? maxLength : strLenWithoutEscapes(P(buttons[i].text))) << 16 >> 16;
  }
  itemCount = itemNumber;
  if (!itemNumber) {
    confirmMessages();
    await message(S("Nothing of that type!"), 0);
    G.rogue.RNG = oldRNG;
    ;
    return 0;
  }
  if (waitForAcknowledge) {
    itemSpaceRemaining = MAX_PACK_ITEMS - numberOfItemsInPack() << 16 >> 16;
    if (itemSpaceRemaining) {
      sprintf(P(buttons[itemNumber + extraLineCount].text), S("%s%s    You have room for %i more item%s."), P(grayColorEscapeSequence), magicDetected ? S("  ") : S(""), itemSpaceRemaining, itemSpaceRemaining === 1 ? S("") : S("s"));
    } else {
      sprintf(P(buttons[itemNumber + extraLineCount].text), S("%s%s    Your pack is full."), P(grayColorEscapeSequence), magicDetected ? S("  ") : S(""));
    }
    maxLength = (maxLength > strLenWithoutEscapes(P(buttons[itemNumber + extraLineCount].text)) ? maxLength : strLenWithoutEscapes(P(buttons[itemNumber + extraLineCount].text))) << 16 >> 16;
    extraLineCount = extraLineCount + 1 << 16 >> 16;
    sprintf(P(buttons[itemNumber + extraLineCount].text), KEYBOARD_LABELS ? S("%s%s -- press (a-z) for more info -- ") : S("%s%s -- touch an item for more info -- "), P(grayColorEscapeSequence), magicDetected ? S("  ") : S(""));
    maxLength = (maxLength > strLenWithoutEscapes(P(buttons[itemNumber + extraLineCount].text)) ? maxLength : strLenWithoutEscapes(P(buttons[itemNumber + extraLineCount].text))) << 16 >> 16;
    extraLineCount = extraLineCount + 1 << 16 >> 16;
  }
  if (equippedItemCount) {
    sprintf(P(buttons[itemNumber + extraLineCount].text), S("      %s%s---"), magicDetected ? S("  ") : S(""), P(grayColorEscapeSequence));
    buttons[itemNumber + extraLineCount].y = equippedItemCount + 3 << 16 >> 16;
    extraLineCount = extraLineCount + 1 << 16 >> 16;
  }
  for (i = 0; itemNumber + extraLineCount > i; i = i + 1 << 16 >> 16) {
    buttons[i].x = COLS - maxLength << 16 >> 16;
    m = strlen(P(buttons[i].text)) << 16 >> 16;
    for (j = buttons[i].x + strLenWithoutEscapes(P(buttons[i].text)) << 16 >> 16; COLS > j; j = j + 1 << 16 >> 16) {
      buttons[i].text[m] = 32;
      m = m + 1 << 16 >> 16;
    }
    buttons[i].text[m] = 0;
    drawButton($sat(buttons, i), BUTTON_NORMAL, dbuf);
  }
  buttons[itemNumber + extraLineCount + 0].flags = B_ENABLED;
  buttons[itemNumber + extraLineCount + 0].hotkey[0] = NUMPAD_8;
  buttons[itemNumber + extraLineCount + 0].hotkey[1] = UP_ARROW;
  buttons[itemNumber + extraLineCount + 1].flags = B_ENABLED;
  buttons[itemNumber + extraLineCount + 1].hotkey[0] = NUMPAD_2;
  buttons[itemNumber + extraLineCount + 1].hotkey[1] = DOWN_ARROW;
  let rbuf = saveDisplayBuffer().$clone();
  overlayDisplayBuffer(dbuf);
  do {
    repeatDisplay = false_;
    highlightItemLine = -1;
    restoreDisplayBuffer(rbuf);
    highlightItemLine = await buttonInputLoop(buttons[0], itemCount + extraLineCount + 2 << 16 >> 16, COLS - maxLength << 16 >> 16, 0 + 3, maxLength, itemNumber + extraLineCount << 16 >> 16, theEvent);
    if (highlightItemLine === itemNumber + extraLineCount + 0) {
      highlightItemLine = itemNumber - 1 << 16 >> 16;
      theEvent.shiftKey = true_;
    } else if (highlightItemLine === itemNumber + extraLineCount + 1) {
      highlightItemLine = 0;
      theEvent.shiftKey = true_;
    }
    if (highlightItemLine >= 0) {
      theKey = itemList[highlightItemLine].inventoryLetter;
      theItem = itemList[highlightItemLine];
    } else {
      theKey = ESCAPE_KEY;
    }
    if (highlightItemLine > -1 && (waitForAcknowledge || theEvent.shiftKey || theEvent.controlKey)) {
      do {
        overlayDisplayBuffer(dbuf);
        drawButton($sat(buttons, highlightItemLine), BUTTON_PRESSED, null);
        if (theEvent.shiftKey || theEvent.controlKey || waitForAcknowledge) {
          actionKey = await printCarriedItemDetails(theItem, (2 > 100 - 20 - 1 - maxLength - 42 + 20 + 1 ? 2 : 100 - 20 - 1 - maxLength - 42 + 20 + 1) << 16 >> 16, 2 + 3, 40, includeButtons) << 16 >> 16;
          restoreDisplayBuffer(rbuf);
          if (actionKey === -1) {
            repeatDisplay = true_;
            overlayDisplayBuffer(dbuf);
          } else {
            G.rogue.RNG = oldRNG;
            ;
            repeatDisplay = false_;
            restoreDisplayBuffer(rbuf);
          }
          switch (actionKey) {
          case 97:
            await apply(theItem);
            break;
          case 101:
            await equip(theItem);
            break;
          case 114:
            await unequip(theItem);
            break;
          case 100:
            await drop(theItem);
            break;
          case 116:
            await throwCommand(theItem, false_);
            break;
          case 82:
            await relabel(theItem);
            break;
          case 99:
            await call(theItem);
            break;
          case 107:
            highlightItemLine = highlightItemLine - 1 << 16 >> 16;
            if (0 > highlightItemLine) {
              highlightItemLine = itemNumber - 1 << 16 >> 16;
            }
            break;
          case 106:
            highlightItemLine = highlightItemLine + 1 << 16 >> 16;
            if (highlightItemLine >= itemNumber) {
              highlightItemLine = 0;
            }
            break;
          default:
            break;
          }
          if (actionKey === UP_KEY || actionKey === DOWN_KEY) {
            theKey = itemList[highlightItemLine].inventoryLetter;
            theItem = itemList[highlightItemLine];
          } else if (actionKey > -1) {
            G.rogue.RNG = oldRNG;
            ;
            return 0;
          }
        }
      } while (actionKey === UP_KEY || actionKey === DOWN_KEY);
    }
  } while (repeatDisplay);
  restoreDisplayBuffer(rbuf);
  G.rogue.RNG = oldRNG;
  ;
  return theKey;
}

export async function numberOfMatchingPackItems(categoryMask: number, requiredFlags: number, forbiddenFlags: number, displayErrors: number): Promise<number> {
  let theItem = null;
  let matchingItemCount = 0;
  if (!G.packItems.nextItem) {
    if (displayErrors) {
      confirmMessages();
      await message(S("Your pack is empty!"), 0);
    }
    return 0;
  }
  for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
    if (theItem.category & categoryMask && !((~theItem.flags >>> 0 & requiredFlags) >>> 0) && !((theItem.flags & forbiddenFlags) >>> 0)) {
      matchingItemCount = matchingItemCount + 1 << 16 >> 16;
    }
  }
  if (matchingItemCount === 0) {
    if (displayErrors) {
      confirmMessages();
      await message(S("You have nothing suitable."), 0);
    }
    return 0;
  }
  return matchingItemCount;
}

export function updateEncumbrance(): void {
  let moveSpeed = 0;
  let attackSpeed = 0;
  moveSpeed = G.player.info.movementSpeed;
  attackSpeed = G.player.info.attackSpeed;
  if (G.player.status[STATUS_HASTED]) {
    moveSpeed = (moveSpeed / 2 | 0) << 16 >> 16;
    attackSpeed = (attackSpeed / 2 | 0) << 16 >> 16;
  } else if (G.player.status[STATUS_SLOWED]) {
    moveSpeed = moveSpeed * 2 << 16 >> 16;
    attackSpeed = attackSpeed * 2 << 16 >> 16;
  }
  G.player.movementSpeed = moveSpeed;
  G.player.attackSpeed = attackSpeed;
  recalculateEquipmentBonuses();
}

export function armorValueIfUnenchanted(theItem: struct_item | null): number {
  let averageValue = ((G.armorTable[theItem.kind].range.upperBound + G.armorTable[theItem.kind].range.lowerBound) / 2 | 0) << 16 >> 16;
  let strengthAdjusted = averageValue + Math.trunc($mul64(10, strengthModifier(theItem)) / FP_FACTOR) << 16 >> 16;
  return (0 > (strengthAdjusted / 10 | 0) ? 0 : strengthAdjusted / 10 | 0) << 16 >> 16;
}

export function displayedArmorValue(): number {
  if (!G.rogue.armor || (G.rogue.armor.flags & ITEM_IDENTIFIED) >>> 0) {
    return (G.player.info.defense / 10 | 0) << 16 >> 16;
  } else {
    return armorValueIfUnenchanted(G.rogue.armor);
  }
}

export async function strengthCheck(theItem: struct_item | null, noisy: number): Promise<void> {
  let buf1 = new Int8Array(100);
  let buf2 = new Int8Array(200);
  let strengthDeficiency = 0;
  updateEncumbrance();
  if (noisy && theItem) {
    if (theItem.category & WEAPON && theItem.strengthRequired > G.rogue.strength - G.player.weaknessAmount) {
      strengthDeficiency = theItem.strengthRequired - (0 > G.rogue.strength - G.player.weaknessAmount ? 0 : G.rogue.strength - G.player.weaknessAmount) << 16 >> 16;
      strcpy(P(buf1), S(""));
      itemName(theItem, P(buf1), false_, false_, null);
      sprintf(P(buf2), S("You can barely lift the %s; %i more strength would be ideal."), P(buf1), strengthDeficiency);
      await message(P(buf2), 0);
    }
    if (theItem.category & ARMOR && theItem.strengthRequired > G.rogue.strength - G.player.weaknessAmount) {
      strengthDeficiency = theItem.strengthRequired - (0 > G.rogue.strength - G.player.weaknessAmount ? 0 : G.rogue.strength - G.player.weaknessAmount) << 16 >> 16;
      strcpy(P(buf1), S(""));
      itemName(theItem, P(buf1), false_, false_, null);
      sprintf(P(buf2), S("You stagger under the weight of the %s; %i more strength would be ideal."), P(buf1), strengthDeficiency);
      await message(P(buf2), 0);
    }
  }
}

export async function equip(theItem: struct_item | null): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any;
  let command = new Uint8Array(10);
  let c = 0;
  let theItem2 = null;
  command[($t2 = c, c = $t2 + 1 << 16 >> 16, $t2)] = EQUIP_KEY;
  if (!theItem) {
    theItem = await promptForItemOfType(WEAPON | ARMOR | RING, 0, ITEM_EQUIPPED, KEYBOARD_LABELS ? S("Equip what? (a-z, shift for more info; or <esc> to cancel)") : S("Equip what?"), true_);
  }
  if (!theItem) {
    return;
  }
  theItem2 = null;
  command[($t4 = c, c = $t4 + 1 << 16 >> 16, $t4)] = theItem.inventoryLetter & 0xff;
  if (theItem.category & (WEAPON | ARMOR | RING)) {
    if (theItem.category & RING) {
      if ((theItem.flags & ITEM_EQUIPPED) >>> 0) {
        confirmMessages();
        await message(S("you are already wearing that ring."), 0);
        return;
      } else if (G.rogue.ringLeft && G.rogue.ringRight) {
        confirmMessages();
        theItem2 = await promptForItemOfType(RING, ITEM_EQUIPPED, 0, S("You are already wearing two rings; remove which first?"), true_);
        if (!theItem2 || theItem2.category !== RING || !((theItem2.flags & ITEM_EQUIPPED) >>> 0)) {
          if (theItem2) {
            await message(S("Invalid entry."), 0);
          }
          return;
        } else {
          command[($t6 = c, c = $t6 + 1 << 16 >> 16, $t6)] = theItem2.inventoryLetter & 0xff;
        }
      }
    }
    if ((theItem.flags & ITEM_EQUIPPED) >>> 0) {
      confirmMessages();
      await message(S("already equipped."), 0);
      return;
    }
    if (theItem.category & (WEAPON | ARMOR)) {
      theItem2 = theItem.category & WEAPON ? G.rogue.weapon : G.rogue.armor;
    }
    if (!await equipItem(theItem, false_, theItem2)) {
      return;
    }
    command[c] = 0;
    recordKeystrokeSequence(P(command));
    G.rogue.swappedOut = theItem2;
    G.rogue.swappedIn = G.rogue.swappedOut ? theItem : null;
    await playerTurnEnded();
  } else {
    confirmMessages();
    await message(S("You can't equip that."), 0);
  }
}

function keyMatchesLocation(theItem: struct_item | null, loc: struct_pos): number {
  if ((theItem.flags & ITEM_IS_KEY) >>> 0 && theItem.originDepth === G.rogue.depthLevel) {
    for (let i = 0; KEY_ID_MAXIMUM > i && (theItem.keyLoc[i].loc.x || theItem.keyLoc[i].machine); ++i) {
      if (posEq(theItem.keyLoc[i].loc, loc)) {
        return true_;
      } else if (theItem.keyLoc[i].machine === pmapAt(loc).machineNumber) {
        return true_;
      }
    }
  }
  return false_;
}

export function keyInPackFor(loc: struct_pos): struct_item | null {
  let theItem = null;
  for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
    if (keyMatchesLocation(theItem, loc)) {
      return theItem;
    }
  }
  return null;
}

export async function keyOnTileAt(loc: struct_pos): Promise<struct_item | null> {
  let theItem = null;
  let monst = null;
  if ((pmapAt(loc).flags & HAS_PLAYER) >>> 0 && posEq(G.player.loc, loc) && keyInPackFor(loc)) {
    return keyInPackFor(loc);
  }
  if ((pmapAt(loc).flags & HAS_ITEM) >>> 0) {
    theItem = await itemAtLoc(loc.$clone());
    if (keyMatchesLocation(theItem, loc)) {
      return theItem;
    }
  }
  if ((pmapAt(loc).flags & HAS_MONSTER) >>> 0) {
    monst = monsterAtLoc(loc);
    if (monst.carriedItem) {
      theItem = monst.carriedItem;
      if (keyMatchesLocation(theItem, loc)) {
        return theItem;
      }
    }
  }
  return null;
}

export async function aggravateMonsters(distance: number, x: number, y: number, flashColor: struct_color | null): Promise<void> {
  let i = 0;
  let j = 0;
  let grid = null;
  G.rogue.wpCoordinates[0].$cp(struct_pos.$of(x, y));
  refreshWaypoint(0);
  grid = allocGrid();
  fillGrid(grid, 0);
  calculateDistances(grid, x, y, T_PATHING_BLOCKER, null, true_, false_);
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if (distance >= $rd(grid.a[grid.o + monst.loc.x], monst.loc.y)) {
      if (monst.creatureState >>> 0 === MONSTER_SLEEPING) {
        wakeUp(monst);
      }
      if (monst.creatureState >>> 0 !== MONSTER_ALLY && monst.leader !== G.player) {
        alertMonster(monst);
        monst.info.flags = (monst.info.flags & ~MONST_MAINTAINS_DISTANCE >>> 0) >>> 0;
        monst.info.abilityFlags = (monst.info.abilityFlags & ~MA_AVOID_CORRIDORS >>> 0) >>> 0;
      }
    }
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($rd(grid.a[grid.o + i], j) >= 0 && distance >= $rd(grid.a[grid.o + i], j)) {
        $wr(G.scentMap.a[G.scentMap.o + i], j, 0);
        addScentToCell(i, j, 2 * $rd(grid.a[grid.o + i], j) << 16 >> 16);
      }
    }
  }
  if (G.player.loc.x === x && G.player.loc.y === y) {
    G.player.status[STATUS_AGGRAVATING] = G.player.maxStatus[STATUS_AGGRAVATING] = distance;
    G.rogue.stealthRange = currentStealthRange();
  }
  if ($rd(grid.a[grid.o + G.player.loc.x], G.player.loc.y) >= 0 && distance >= $rd(grid.a[grid.o + G.player.loc.x], G.player.loc.y)) {
    await discover(x, y);
    discoverCell(x, y);
    await colorFlash(flashColor, 0, DISCOVERED | MAGIC_MAPPED, 10, distance, x, y);
    if (!(($at2(G.pmap, x, y).flags & ANY_KIND_OF_VISIBLE) >>> 0)) {
      await message(S("You hear a piercing shriek; something must have triggered a nearby alarm."), 0);
    }
  }
  freeGrid(grid);
}

export function getLineCoordinates(listOfCoordinates: struct_pos | null, originLoc: struct_pos, targetLoc: struct_pos, theBolt: struct_bolt | null): number {
  let point = new Float64Array(2);
  let step = new Float64Array(2);
  let listLength = 0;
  let score = 0;
  let bestScore = 0;
  let offset = 0;
  let bestOffset = 0;
  let numOffsets = 21;
  let offsets = $rows([$ta(Float64Array, 2, [50, 50]),
$ta(Float64Array, 2, [40, 40]),
$ta(Float64Array, 2, [60, 40]),
$ta(Float64Array, 2, [60, 60]),
$ta(Float64Array, 2, [40, 60]),
$ta(Float64Array, 2, [50, 30]),
$ta(Float64Array, 2, [70, 50]),
$ta(Float64Array, 2, [50, 70]),
$ta(Float64Array, 2, [30, 50]),
$ta(Float64Array, 2, [50, 20]),
$ta(Float64Array, 2, [80, 50]),
$ta(Float64Array, 2, [50, 80]),
$ta(Float64Array, 2, [20, 50]),
$ta(Float64Array, 2, [50, 10]),
$ta(Float64Array, 2, [90, 50]),
$ta(Float64Array, 2, [50, 90]),
$ta(Float64Array, 2, [10, 50]),
$ta(Float64Array, 2, [50, 1]),
$ta(Float64Array, 2, [99, 50]),
$ta(Float64Array, 2, [50, 99]),
$ta(Float64Array, 2, [1, 50])]);
  if (originLoc.x === targetLoc.x && originLoc.y === targetLoc.y) {
    listOfCoordinates.$cp(struct_pos.$of(-1, -1));
    return 0;
  }
  for (offset = 0; numOffsets + 1 > offset; ++offset) {
    listLength = 0;
    point[0] = $mul64(originLoc.x, FP_FACTOR) + Math.trunc(FP_FACTOR / 2);
    point[1] = $mul64(originLoc.y, FP_FACTOR) + Math.trunc(FP_FACTOR / 2);
    step[0] = $mul64(targetLoc.x, FP_FACTOR) + Math.trunc($mul64(offsets[numOffsets > offset ? offset : bestOffset][0], FP_FACTOR) / 100) - point[0];
    step[1] = $mul64(targetLoc.y, FP_FACTOR) + Math.trunc($mul64(offsets[numOffsets > offset ? offset : bestOffset][1], FP_FACTOR) / 100) - point[1];
    let m = llabs(step[0]) > llabs(step[1]) ? llabs(step[0]) : llabs(step[1]);
    step[0] = Math.trunc($mul64(step[0], FP_FACTOR) / m);
    step[1] = Math.trunc($mul64(step[1], FP_FACTOR) / m);
    while (true_) {
      point[0] += step[0];
      point[1] += step[1];
      $sadd(listOfCoordinates, listLength).$cp(struct_pos.$of((0 > point[0] ? -1 : Math.trunc(point[0] / FP_FACTOR)) << 16 >> 16, (0 > point[1] ? -1 : Math.trunc(point[1] / FP_FACTOR)) << 16 >> 16));
      if (!isPosInMap($sadd(listOfCoordinates, listLength))) {
        break;
      }
      listLength = listLength + 1 << 16 >> 16;
    }
    ;
    if (offset === numOffsets) {
      break;
    }
    if (!theBolt) {
      break;
    }
    score = 0;
    let passesThroughUnknown = false_;
    for (let i = 0; listLength > i; ++i) {
      let x = $sadd(listOfCoordinates, i).x;
      let y = $sadd(listOfCoordinates, i).y;
      let isImpassable = cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY);
      let isOpaque = cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_VISION);
      let targetsEnemies = ((theBolt.flags & BF_TARGET_ENEMIES) >>> 0) << 24 >> 24;
      let targetsAllies = ((theBolt.flags & BF_TARGET_ALLIES) >>> 0) << 24 >> 24;
      let burningThrough = ((theBolt.flags & BF_FIERY) >>> 0 && cellHasTerrainFlag(struct_pos.$of(x, y), T_IS_FLAMMABLE) ? 1 : 0) << 24 >> 24;
      let isCastByPlayer = (originLoc.x === G.player.loc.x && originLoc.y === G.player.loc.y ? 1 : 0) << 24 >> 24;
      let caster = monsterAtLoc(originLoc);
      let monst = monsterAtLoc(struct_pos.$of(x, y));
      let isMonster = (monst && !((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0) && !monsterIsHidden(monst, caster) ? 1 : 0) << 24 >> 24;
      let isEnemyOfCaster = (monst && caster && monstersAreEnemies(monst, caster) ? 1 : 0) << 24 >> 24;
      let isAllyOfCaster = (monst && caster && monstersAreTeammates(monst, caster) ? 1 : 0) << 24 >> 24;
      score += 2;
      if (x === targetLoc.x && y === targetLoc.y) {
        if (!targetsEnemies && !targetsAllies || targetsEnemies && isMonster && isEnemyOfCaster || targetsAllies && isMonster && isAllyOfCaster) {
          score += passesThroughUnknown ? 2500 : 5000;
        }
        break;
      }
      if (isCastByPlayer && !(($at2(G.pmap, x, y).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0)) {
        passesThroughUnknown = true_;
        continue;
      }
      if (isImpassable && ($at2(G.pmap, x, y).flags & IMPREGNABLE) >>> 0) {
        break;
      }
      if (theBolt.boltEffect === BE_TUNNELING) {
        score += isImpassable ? 50 : isOpaque ? 10 : 0;
        continue;
      }
      if (isMonster && targetsEnemies) {
        score += isEnemyOfCaster ? 50 : -200;
      }
      if (isMonster && targetsAllies) {
        score += isAllyOfCaster ? 50 : -200;
      }
      if (burningThrough) {
        score -= 1;
      }
      if (isMonster && (theBolt.flags & BF_PASSES_THRU_CREATURES) >>> 0) {
        continue;
      }
      if (isMonster || isImpassable || isOpaque && !burningThrough) {
        break;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestOffset = offset;
    }
  }
  $sadd(listOfCoordinates, listLength).$cp(struct_pos.$of(-1, -1));
  return listLength;
}

export function getImpactLoc(returnLoc: struct_pos | null, originLoc: struct_pos, targetLoc: struct_pos, maxDistance: number, returnLastEmptySpace: number, theBolt: struct_bolt | null): void {
  let coords = $sarr(struct_pos, 80);
  let i = 0;
  let n = 0;
  let monst = null;
  n = getLineCoordinates(coords[0], originLoc.$clone(), targetLoc.$clone(), theBolt);
  n = (maxDistance > n ? n : maxDistance) << 16 >> 16;
  for (i = 0; n > i; i = i + 1 << 16 >> 16) {
    monst = monsterAtLoc(coords[i]);
    if (monst && !monsterIsHidden(monst, monsterAtLoc(originLoc)) && !((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
      break;
    }
    if (cellHasTerrainFlag(coords[i], T_OBSTRUCTS_VISION | T_OBSTRUCTS_PASSABILITY)) {
      break;
    }
  }
  if (i === maxDistance) {
    returnLoc.$cp(coords[i - 1]);
  } else if (returnLastEmptySpace) {
    if (i === 0) {
      returnLoc.$cp(originLoc);
    } else {
      returnLoc.$cp(coords[i - 1]);
    }
  } else {
    returnLoc.$cp(coords[i]);
  }
  ;
}

function impermissibleKinkBetween(x1: number, y1: number, x2: number, y2: number): number {
  ;
  ;
  if (cellHasTerrainFlag(struct_pos.$of(x1, y1), T_OBSTRUCTS_PASSABILITY) || cellHasTerrainFlag(struct_pos.$of(x2, y2), T_OBSTRUCTS_PASSABILITY)) {
    return false_;
  }
  if (Math.abs(x1 - x2) !== 1 || Math.abs(y1 - y2) !== 1) {
    return false_;
  }
  if (!cellHasTerrainFlag(struct_pos.$of(x2, y1), T_OBSTRUCTS_PASSABILITY) || !cellHasTerrainFlag(struct_pos.$of(x1, y2), T_OBSTRUCTS_PASSABILITY)) {
    return false_;
  }
  if (!cellHasTerrainFlag(struct_pos.$of(x2, y1), T_OBSTRUCTS_DIAGONAL_MOVEMENT) && !cellHasTerrainFlag(struct_pos.$of(x1, y2), T_OBSTRUCTS_DIAGONAL_MOVEMENT)) {
    return false_;
  }
  return true_;
}

async function tunnelize(x: number, y: number): Promise<number> {
  let layer = 0;
  let didSomething = false_;
  let monst = null;
  let x2 = 0;
  let y2 = 0;
  let dir = 0;
  if (($at2(G.pmap, x, y).flags & IMPREGNABLE) >>> 0) {
    return false_;
  }
  await freeCaptivesEmbeddedAt(x, y);
  if (x === 0 || x === DCOLS - 1 || y === 0 || y === DROWS - 1) {
    $at2(G.pmap, x, y).layers[DUNGEON] = CRYSTAL_WALL;
    didSomething = true_;
  } else {
    for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
      if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].flags & (T_OBSTRUCTS_PASSABILITY | T_OBSTRUCTS_VISION)) >>> 0) {
        $at2(G.pmap, x, y).layers[layer] = layer === DUNGEON ? FLOOR : NOTHING;
        didSomething = true_;
      }
    }
  }
  if (didSomething) {
    await spawnDungeonFeature(x, y, G.dungeonFeatureCatalog[DF_TUNNELIZE], true_, false_);
    if (($at2(G.pmap, x, y).flags & HAS_MONSTER) >>> 0) {
      monst = monsterAtLoc(struct_pos.$of(x, y));
      if ((monst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) {
        await inflictLethalDamage(null, monst);
        await killCreature(monst, false_);
      }
    }
  }
  if (!cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_DIAGONAL_MOVEMENT) && didSomething) {
    for (dir = 0; DIRECTION_COUNT > dir; ++dir) {
      x2 = x + G.nbDirs[dir][0] << 16 >> 16;
      y2 = y + G.nbDirs[dir][1] << 16 >> 16;
      if (coordinatesAreInMap(x2, y2) && impermissibleKinkBetween(x, y, x2, y2)) {
        if (($at2(G.pmap, x, y2).flags & IMPREGNABLE) >>> 0 || !(($at2(G.pmap, x2, y).flags & IMPREGNABLE) >>> 0) && rand_percent(50)) {
          await tunnelize(x2, y);
        } else {
          await tunnelize(x, y2);
        }
      }
    }
  }
  return didSomething;
}

function negationWillAffectMonster(monst: struct_creature | null, isBolt: number): number {
  if (isBolt && (monst.info.abilityFlags & MA_REFLECT_100) >>> 0 || (monst.info.flags & MONST_INVULNERABLE) >>> 0) {
    return false_;
  }
  if ((monst.info.abilityFlags & ~MA_NON_NEGATABLE_ABILITIES >>> 0) >>> 0 || (monst.bookkeepingFlags & MB_SEIZING) >>> 0 || (monst.info.flags & MONST_DIES_IF_NEGATED) >>> 0 || (monst.info.flags & NEGATABLE_TRAITS) >>> 0 || (monst.info.flags & MONST_IMMUNE_TO_FIRE) >>> 0 || (monst.info.flags & MONST_FIERY) >>> 0 && monst.status[STATUS_BURNING] || monst.status[STATUS_IMMUNE_TO_FIRE] || monst.status[STATUS_SLOWED] || monst.status[STATUS_HASTED] || monst.status[STATUS_CONFUSED] || monst.status[STATUS_ENTRANCED] || monst.status[STATUS_DISCORDANT] || monst.status[STATUS_SHIELDED] || monst.status[STATUS_INVISIBLE] || monst.status[STATUS_MAGICAL_FEAR] || monst.status[STATUS_LEVITATING] || monst.movementSpeed !== monst.info.movementSpeed || monst.attackSpeed !== monst.info.attackSpeed || monst.mutationIndex > -1 && G.mutationCatalog[monst.mutationIndex].canBeNegated) {
    return true_;
  }
  for (let i = 0; 20 > i; ++i) {
    if (monst.info.bolts[i] >>> 0 && !(($sadd(G.boltCatalog, monst.info.bolts[i]).flags & BF_NOT_NEGATABLE) >>> 0)) {
      return true_;
    }
  }
  return false_;
}

export async function negate(monst: struct_creature | null): Promise<number> {
  let i = 0;
  let j = 0;
  let backupBolts = new Int32Array(20);
  let buf = new Int8Array(237);
  let monstName = new Int8Array(79);
  let negated = false_;
  monsterName(P(monstName), monst, true_);
  if ((monst.info.abilityFlags & ~MA_NON_NEGATABLE_ABILITIES >>> 0) >>> 0) {
    monst.info.abilityFlags = (monst.info.abilityFlags & MA_NON_NEGATABLE_ABILITIES) >>> 0;
    negated = true_;
    monst.wasNegated = true_;
  }
  if ((monst.bookkeepingFlags & MB_SEIZING) >>> 0) {
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_SEIZING >>> 0) >>> 0;
    negated = true_;
  }
  if ((monst.info.flags & MONST_DIES_IF_NEGATED) >>> 0) {
    if (monst.status[STATUS_LEVITATING]) {
      sprintf(P(buf), S("%s dissipates into thin air"), P(monstName));
    } else if ((monst.info.flags & MONST_INANIMATE) >>> 0) {
      sprintf(P(buf), S("%s shatters into tiny pieces"), P(monstName));
    } else {
      sprintf(P(buf), S("%s falls to the ground, lifeless"), P(monstName));
    }
    await killCreature(monst, false_);
    await combatMessage(P(buf), messageColorFromVictim(monst));
    negated = true_;
  } else if (!((monst.info.flags & MONST_INVULNERABLE) >>> 0)) {
    if (canNegateCreatureStatusEffects(monst)) {
      negated = true_;
      await negateCreatureStatusEffects(monst);
    }
    if ((monst.info.flags & MONST_IMMUNE_TO_FIRE) >>> 0) {
      monst.info.flags = (monst.info.flags & ~MONST_IMMUNE_TO_FIRE >>> 0) >>> 0;
      monst.wasNegated = true_;
      negated = true_;
    }
    if (monst.movementSpeed !== monst.info.movementSpeed) {
      monst.movementSpeed = monst.info.movementSpeed;
      negated = true_;
    }
    if (monst.attackSpeed !== monst.info.attackSpeed) {
      monst.attackSpeed = monst.info.attackSpeed;
      negated = true_;
    }
    if (monst !== G.player && monst.mutationIndex > -1 && G.mutationCatalog[monst.mutationIndex].canBeNegated) {
      monst.mutationIndex = -1;
      negated = true_;
      monst.wasNegated = true_;
    }
    if (monst !== G.player && (monst.info.flags & NEGATABLE_TRAITS) >>> 0) {
      if ((monst.info.flags & MONST_FIERY) >>> 0 && monst.status[STATUS_BURNING]) {
        await extinguishFireOnCreature(monst);
      }
      monst.info.flags = (monst.info.flags & ~NEGATABLE_TRAITS >>> 0) >>> 0;
      negated = true_;
      monst.wasNegated = true_;
      await refreshDungeonCell(monst.loc.$clone());
      await refreshSideBar(-1, -1, false_);
    }
    for (i = 0; 20 > i; i = i + 1 << 16 >> 16) {
      backupBolts[i] = monst.info.bolts[i];
      if (monst.info.bolts[i] >>> 0 && !(($sadd(G.boltCatalog, monst.info.bolts[i]).flags & BF_NOT_NEGATABLE) >>> 0)) {
        monst.info.bolts[i] = BOLT_NONE;
        negated = true_;
        monst.wasNegated = true_;
      }
    }
    for (i = 0, j = 0; 20 > i && backupBolts[i] >>> 0; i = i + 1 << 16 >> 16) {
      if (($sadd(G.boltCatalog, backupBolts[i]).flags & BF_NOT_NEGATABLE) >>> 0) {
        monst.info.bolts[j] = backupBolts[i];
        j = j + 1 << 16 >> 16;
      }
    }
    monst.newPowerCount = monst.totalPowerCount;
    await applyInstantTileEffectsToCreature(monst);
  }
  if (negated && monst !== G.player && !((monst.info.flags & MONST_DIES_IF_NEGATED) >>> 0)) {
    sprintf(P(buf), S("%s is stripped of $HISHER special traits"), P(monstName));
    resolvePronounEscapes(P(buf), monst);
    await combatMessage(P(buf), messageColorFromVictim(monst));
  }
  return negated;
}

export async function weaken(monst: struct_creature | null, maxDuration: number): Promise<void> {
  if (10 > monst.weaknessAmount) {
    monst.weaknessAmount = monst.weaknessAmount + 1 << 16 >> 16;
  }
  monst.status[STATUS_WEAKENED] = (monst.status[STATUS_WEAKENED] > maxDuration ? monst.status[STATUS_WEAKENED] : maxDuration) << 16 >> 16;
  monst.maxStatus[STATUS_WEAKENED] = (monst.maxStatus[STATUS_WEAKENED] > maxDuration ? monst.maxStatus[STATUS_WEAKENED] : maxDuration) << 16 >> 16;
  if (monst === G.player) {
    await messageWithColor(S("your muscles weaken as an enervating toxin fills your veins."), G.badMessageColor, 0);
    await strengthCheck(G.rogue.weapon, true_);
    await strengthCheck(G.rogue.armor, true_);
  }
}

async function polymorph(monst: struct_creature | null): Promise<number> {
  let previousDamageTaken = 0;
  let healthFraction = 0;
  let newMonsterIndex = 0;
  if (monst === G.player || (monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0) {
    return false_;
  }
  if (monst.creatureState >>> 0 === MONSTER_FLEEING && (monst.info.flags & (MONST_MAINTAINS_DISTANCE | MONST_FLEES_NEAR_DEATH)) >>> 0 || (monst.info.abilityFlags & MA_HIT_STEAL_FLEE) >>> 0) {
    monst.creatureState = MONSTER_TRACKING_SCENT;
    monst.creatureMode = MODE_NORMAL;
  }
  unAlly(monst);
  monst.mutationIndex = -1;
  if (monst.carriedMonster) {
    freeCreature(monst.carriedMonster);
    monst.carriedMonster = null;
  }
  healthFraction = (monst.currentHP * 1000 / monst.info.maxHP | 0) << 16 >> 16;
  previousDamageTaken = monst.info.maxHP - monst.currentHP << 16 >> 16;
  do {
    newMonsterIndex = rand_range(1, NUMBER_MONSTER_KINDS - 1) << 16 >> 16;
  } while ((G.monsterCatalog[newMonsterIndex].flags & (MONST_INANIMATE | MONST_NO_POLYMORPH)) >>> 0 || newMonsterIndex >>> 0 === monst.info.monsterID >>> 0);
  monst.info.$cp(G.monsterCatalog[newMonsterIndex]);
  monst.info.turnsBetweenRegen = $mul64(monst.info.turnsBetweenRegen, 1000);
  monst.currentHP = (1 > ((Math.imul(healthFraction, monst.info.maxHP) / 1000 | 0) > monst.info.maxHP - previousDamageTaken ? Math.imul(healthFraction, monst.info.maxHP) / 1000 | 0 : monst.info.maxHP - previousDamageTaken) ? 1 : (Math.imul(healthFraction, monst.info.maxHP) / 1000 | 0) > monst.info.maxHP - previousDamageTaken ? Math.imul(healthFraction, monst.info.maxHP) / 1000 | 0 : monst.info.maxHP - previousDamageTaken) << 16 >> 16;
  monst.movementSpeed = monst.info.movementSpeed;
  monst.attackSpeed = monst.info.attackSpeed;
  if (monst.status[STATUS_HASTED]) {
    monst.movementSpeed = (monst.movementSpeed / 2 | 0) << 16 >> 16;
    monst.attackSpeed = (monst.attackSpeed / 2 | 0) << 16 >> 16;
  }
  if (monst.status[STATUS_SLOWED]) {
    monst.movementSpeed = monst.movementSpeed * 2 << 16 >> 16;
    monst.attackSpeed = monst.attackSpeed * 2 << 16 >> 16;
  }
  monst.wasNegated = false_;
  initializeStatus(monst);
  if ((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
    demoteMonsterFromLeadership(monst);
    monst.creatureState = MONSTER_TRACKING_SCENT;
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_CAPTIVE >>> 0) >>> 0;
  }
  monst.bookkeepingFlags = (monst.bookkeepingFlags & ~(MB_SEIZING | MB_SEIZED) >>> 0) >>> 0;
  monst.ticksUntilTurn = (monst.ticksUntilTurn > 101 ? monst.ticksUntilTurn : 101) << 16 >> 16;
  await refreshDungeonCell(monst.loc.$clone());
  if ($sadd(G.boltCatalog, BOLT_POLYMORPH).backColor) {
    flashMonster(monst, $sadd(G.boltCatalog, BOLT_POLYMORPH).backColor, 100);
  }
  return true_;
}

export async function slow(monst: struct_creature | null, turns: number): Promise<void> {
  if (!((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
    monst.status[STATUS_SLOWED] = monst.maxStatus[STATUS_SLOWED] = turns;
    monst.status[STATUS_HASTED] = 0;
    if (monst === G.player) {
      updateEncumbrance();
      await message(S("you feel yourself slow down."), 0);
    } else {
      monst.movementSpeed = monst.info.movementSpeed * 2 << 16 >> 16;
      monst.attackSpeed = monst.info.attackSpeed * 2 << 16 >> 16;
    }
  }
}

export async function haste(monst: struct_creature | null, turns: number): Promise<void> {
  if (monst && !((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
    monst.status[STATUS_SLOWED] = 0;
    monst.status[STATUS_HASTED] = monst.maxStatus[STATUS_HASTED] = turns;
    if (monst === G.player) {
      updateEncumbrance();
      await message(S("you feel yourself speed up."), 0);
    } else {
      monst.movementSpeed = (monst.info.movementSpeed / 2 | 0) << 16 >> 16;
      monst.attackSpeed = (monst.info.attackSpeed / 2 | 0) << 16 >> 16;
    }
  }
}

export async function heal(monst: struct_creature | null, percent: number, panacea: number): Promise<void> {
  let buf = new Int8Array(100);
  let monstName = new Int8Array(100);
  monst.currentHP = (monst.currentHP + (Math.imul(percent, monst.info.maxHP) / 100 | 0) > monst.info.maxHP ? monst.info.maxHP : monst.currentHP + (Math.imul(percent, monst.info.maxHP) / 100 | 0)) << 16 >> 16;
  if (panacea) {
    if (monst.status[STATUS_HALLUCINATING] > 1) {
      monst.status[STATUS_HALLUCINATING] = 1;
    }
    if (monst.status[STATUS_CONFUSED] > 1) {
      monst.status[STATUS_CONFUSED] = 1;
    }
    if (monst.status[STATUS_NAUSEOUS] > 1) {
      monst.status[STATUS_NAUSEOUS] = 1;
    }
    if (monst.status[STATUS_SLOWED] > 1) {
      monst.status[STATUS_SLOWED] = 1;
    }
    if (monst.status[STATUS_WEAKENED] > 1) {
      monst.weaknessAmount = 0;
      monst.status[STATUS_WEAKENED] = 0;
      updateEncumbrance();
    }
    if (monst.status[STATUS_POISONED]) {
      monst.poisonAmount = 0;
      monst.status[STATUS_POISONED] = 0;
    }
    if (monst.status[STATUS_DARKNESS] > 0) {
      monst.status[STATUS_DARKNESS] = 0;
      if (monst === G.player) {
        updateMinersLightRadius();
        await updateVision(true_);
      }
    }
  }
  if (canDirectlySeeMonster(monst) && monst !== G.player && !panacea) {
    monsterName(P(monstName), monst, true_);
    sprintf(P(buf), S("%s looks healthier"), P(monstName));
    await combatMessage(P(buf), null);
  }
}

async function makePlayerTelepathic(duration: number): Promise<void> {
  G.player.status[STATUS_TELEPATHIC] = G.player.maxStatus[STATUS_TELEPATHIC] = duration;
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    await refreshDungeonCell(monst.loc.$clone());
  }
  if (!hasNextCreature(iterateCreatures(G.monsters))) {
    await message(S("you can somehow tell that you are alone on this depth at the moment."), 0);
  } else {
    await message(S("you can somehow feel the presence of other creatures' minds!"), 0);
  }
}

async function rechargeItems(categories: number): Promise<void> {
  let tempItem = null;
  let x = 0;
  let y = 0;
  let z = 0;
  let i = 0;
  let categoryCount = 0;
  let buf = new Int8Array(237);
  x = y = z = 0;
  for (tempItem = G.packItems.nextItem; !!tempItem; tempItem = tempItem.nextItem) {
    if (((tempItem.category & categories) >>> 0 & STAFF) >>> 0) {
      x = x + 1 << 16 >> 16;
      tempItem.charges = tempItem.enchant1;
      tempItem.enchant2 = ((tempItem.kind === STAFF_BLINKING || tempItem.kind === STAFF_OBSTRUCTION ? 10000 : 5000) / tempItem.enchant1 | 0) << 16 >> 16;
    }
    if (((tempItem.category & categories) >>> 0 & WAND) >>> 0) {
      y = y + 1 << 16 >> 16;
      tempItem.charges = tempItem.charges + 1 << 16 >> 16;
    }
    if (((tempItem.category & categories) >>> 0 & CHARM) >>> 0) {
      z = z + 1 << 16 >> 16;
      tempItem.charges = 0;
    }
  }
  categoryCount = (x ? 1 : 0) + (y ? 1 : 0) + (z ? 1 : 0) << 16 >> 16;
  if (categoryCount) {
    i = 0;
    strcpy(P(buf), S("a surge of energy courses through your pack, recharging your "));
    if (x) {
      i = i + 1 << 16 >> 16;
      strcat(P(buf), x === 1 ? S("staff") : S("staffs"));
      if (i === categoryCount - 1) {
        strcat(P(buf), S(" and "));
      } else if (categoryCount - 2 >= i) {
        strcat(P(buf), S(", "));
      }
    }
    if (y) {
      i = i + 1 << 16 >> 16;
      strcat(P(buf), y === 1 ? S("wand") : S("wands"));
      if (i === categoryCount - 1) {
        strcat(P(buf), S(" and "));
      } else if (categoryCount - 2 >= i) {
        strcat(P(buf), S(", "));
      }
    }
    if (z) {
      strcat(P(buf), z === 1 ? S("charm") : S("charms"));
    }
    strcat(P(buf), S("."));
    await message(P(buf), 0);
  } else {
    await message(S("a surge of energy courses through your pack, but nothing happens."), 0);
  }
}

async function negationBlast(emitterName: Ptr | null, distance: number): Promise<void> {
  let $t1: any;
  let theItem = null;
  let buf = new Int8Array(79);
  sprintf(P(buf), S("%s emits a numbing torrent of anti-magic!"), emitterName);
  await messageWithColor(P(buf), G.itemMessageColor, 0);
  await colorFlash(G.pink, 0, IN_FIELD_OF_VIEW, 3 + (distance / 5 | 0) << 16 >> 16, distance, G.player.loc.x, G.player.loc.y);
  await negate(G.player);
  flashMonster(G.player, G.pink, 100);
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if ((pmapAt(monst.loc).flags & IN_FIELD_OF_VIEW) >>> 0 && Math.imul(distance, distance) >= Math.imul(G.player.loc.x - monst.loc.x, G.player.loc.x - monst.loc.x) + Math.imul(G.player.loc.y - monst.loc.y, G.player.loc.y - monst.loc.y)) {
      if (canSeeMonster(monst)) {
        flashMonster(monst, G.pink, 100);
      }
      await negate(monst);
    }
  }
  for (theItem = G.floorItems; !!theItem; theItem = theItem.nextItem) {
    if ((pmapAt(theItem.loc).flags & IN_FIELD_OF_VIEW) >>> 0 && Math.imul(distance, distance) >= Math.imul(G.player.loc.x - theItem.loc.x, G.player.loc.x - theItem.loc.x) + Math.imul(G.player.loc.y - theItem.loc.y, G.player.loc.y - theItem.loc.y)) {
      theItem.flags = (theItem.flags & ~(ITEM_MAGIC_DETECTED | ITEM_CURSED) >>> 0) >>> 0;
      switch (theItem.category) {
      case WEAPON:
      case ARMOR:
        theItem.enchant1 = theItem.enchant2 = theItem.charges = 0;
        theItem.flags = (theItem.flags & ~(ITEM_RUNIC | ITEM_RUNIC_HINTED | ITEM_RUNIC_IDENTIFIED | ITEM_PROTECTED) >>> 0) >>> 0;
        identify(theItem);
        ($t1 = pmapAt(theItem.loc), $t1.flags = ($t1.flags & ~ITEM_DETECTED >>> 0) >>> 0);
        await refreshDungeonCell(theItem.loc.$clone());
        break;
      case STAFF:
        theItem.charges = 0;
        break;
      case WAND:
        theItem.charges = 0;
        theItem.flags = (theItem.flags | ITEM_MAX_CHARGES_KNOWN) >>> 0;
        break;
      case RING:
        theItem.enchant1 = 0;
        theItem.flags = (theItem.flags | ITEM_IDENTIFIED) >>> 0;
        updateIdentifiableItems();
        break;
      case CHARM:
        theItem.charges = charmRechargeDelay(theItem.kind, theItem.enchant1);
        break;
      default:
        break;
      }
    }
  }
}

async function discordBlast(emitterName: Ptr | null, distance: number): Promise<void> {
  let buf = new Int8Array(79);
  sprintf(P(buf), S("%s emits a wave of unsettling purple radiation!"), emitterName);
  await messageWithColor(P(buf), G.itemMessageColor, 0);
  await colorFlash(G.discordColor, 0, IN_FIELD_OF_VIEW, 3 + (distance / 5 | 0) << 16 >> 16, distance, G.player.loc.x, G.player.loc.y);
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if ((pmapAt(monst.loc).flags & IN_FIELD_OF_VIEW) >>> 0 && Math.imul(distance, distance) >= Math.imul(G.player.loc.x - monst.loc.x, G.player.loc.x - monst.loc.x) + Math.imul(G.player.loc.y - monst.loc.y, G.player.loc.y - monst.loc.y)) {
      if (!((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
        if (canSeeMonster(monst)) {
          flashMonster(monst, G.discordColor, 100);
        }
        monst.status[STATUS_DISCORDANT] = monst.maxStatus[STATUS_DISCORDANT] = 30;
      }
    }
  }
}

async function crystalize(radius: number): Promise<void> {
  let i = 0;
  let j = 0;
  let monst = null;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (Math.imul(radius, radius) >= Math.imul(G.player.loc.x - i, G.player.loc.x - i) + Math.imul(G.player.loc.y - j, G.player.loc.y - j) && !(($at2(G.pmap, i, j).flags & IMPREGNABLE) >>> 0)) {
        if ((G.tileCatalog[$at2(G.pmap, i, j).layers[DUNGEON]].flags & (T_OBSTRUCTS_PASSABILITY | T_OBSTRUCTS_VISION)) >>> 0) {
          $at2(G.pmap, i, j).layers[DUNGEON] = FORCEFIELD;
          await spawnDungeonFeature(i, j, G.dungeonFeatureCatalog[DF_SHATTERING_SPELL], true_, false_);
          if (($at2(G.pmap, i, j).flags & HAS_MONSTER) >>> 0) {
            monst = monsterAtLoc(struct_pos.$of(i, j));
            if ((monst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) {
              await inflictLethalDamage(null, monst);
              await killCreature(monst, false_);
            } else {
              await freeCaptivesEmbeddedAt(i, j);
            }
          }
          if (i === 0 || i === DCOLS - 1 || j === 0 || j === DROWS - 1) {
            $at2(G.pmap, i, j).layers[DUNGEON] = CRYSTAL_WALL;
          }
        }
      }
    }
  }
  await updateVision(false_);
  await colorFlash(G.forceFieldColor, 0, 0, radius, radius, G.player.loc.x, G.player.loc.y);
  await displayLevel();
  await refreshSideBar(-1, -1, false_);
}

async function imbueInvisibility(monst: struct_creature | null, duration: number): Promise<number> {
  let autoID = false_;
  if (monst && !((monst.info.flags & (MONST_INANIMATE | MONST_INVISIBLE | MONST_INVULNERABLE)) >>> 0)) {
    if (monst === G.player || monst.creatureState >>> 0 === MONSTER_ALLY) {
      autoID = true_;
    } else if (canSeeMonster(monst) && monsterRevealed(monst)) {
      autoID = true_;
    }
    monst.status[STATUS_INVISIBLE] = monst.maxStatus[STATUS_INVISIBLE] = duration;
    await refreshDungeonCell(monst.loc.$clone());
    await refreshSideBar(-1, -1, false_);
    if ($sadd(G.boltCatalog, BOLT_POLYMORPH).backColor) {
      flashMonster(monst, $sadd(G.boltCatalog, BOLT_INVISIBILITY).backColor, 100);
    }
  }
  return autoID;
}

export function projectileReflects(attacker: struct_creature | null, defender: struct_creature | null): number {
  let prob = 0;
  let netReflectionLevel = 0;
  if (defender === G.player && G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0 && G.rogue.armor.enchant2 === A_IMMUNITY && monsterIsInClass(attacker, G.rogue.armor.vorpalEnemy << 16 >> 16) && monstersAreEnemies(attacker, defender)) {
    return true_;
  }
  if (defender === G.player && G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0 && G.rogue.armor.enchant2 === A_REFLECTION) {
    netReflectionLevel = netEnchant(G.rogue.armor);
  } else {
    netReflectionLevel = 0;
  }
  if (defender && (defender.info.abilityFlags & MA_REFLECT_100) >>> 0) {
    return true_;
  }
  if (defender && (defender.info.flags & MONST_REFLECT_50) >>> 0) {
    netReflectionLevel += 262144;
  }
  if (0 >= netReflectionLevel) {
    return false_;
  }
  prob = reflectionChance(netReflectionLevel);
  return rand_percent(prob);
}

export async function reflectBolt(targetX: number, targetY: number, listOfCoordinates: struct_pos | null, kinkCell: number, retracePath: number): Promise<number> {
  let needRandomTarget = (0 > targetX || 0 > targetY || targetX === $sadd(listOfCoordinates, kinkCell).x && targetY === $sadd(listOfCoordinates, kinkCell).y ? 1 : 0) << 24 >> 24;
  let finalLength = 0;
  if (retracePath) {
    for (let k = 1; kinkCell >= k && MAX_BOLT_LENGTH > kinkCell + k; ++k) {
      $sadd(listOfCoordinates, (kinkCell + k)).$cp($sadd(listOfCoordinates, (kinkCell - k)));
    }
    let origin = $sadd(listOfCoordinates, 2 * kinkCell).$clone();
    let target = struct_pos.$of(targetX + (targetX - $sadd(listOfCoordinates, kinkCell).x) << 16 >> 16, targetY + (targetY - $sadd(listOfCoordinates, kinkCell).y) << 16 >> 16).$clone();
    let newPath = $sarr(struct_pos, 79);
    let newPathLength = getLineCoordinates(newPath[0], origin.$clone(), target.$clone(), null);
    for (let k = 0; newPathLength >= k; ++k) {
      $sadd(listOfCoordinates, (2 * kinkCell + k + 1)).$cp(newPath[k]);
    }
    finalLength = 2 * kinkCell + newPathLength + 1 << 16 >> 16;
  } else {
    let failsafe = 50;
    let newPath = $sarr(struct_pos, 79);
    let newPathLength = 0;
    do {
      let target = new struct_pos();
      if (needRandomTarget) {
        target.$cp(await perimeterCoords(rand_range(0, 39) << 16 >> 16));
        target.x = target.x + $sadd(listOfCoordinates, kinkCell).x << 16 >> 16;
        target.y = target.y + $sadd(listOfCoordinates, kinkCell).y << 16 >> 16;
      } else {
        target.$cp(struct_pos.$of(targetX, targetY));
      }
      newPathLength = getLineCoordinates(newPath[0], $sadd(listOfCoordinates, kinkCell).$clone(), target.$clone(), null);
      if (newPathLength > 0 && !cellHasTerrainFlag(newPath[0], T_OBSTRUCTS_VISION | T_OBSTRUCTS_PASSABILITY)) {
        needRandomTarget = false_;
      }
    } while (needRandomTarget && (failsafe = failsafe - 1 << 16 >> 16));
    for (let k = 0; newPathLength > k; ++k) {
      $sadd(listOfCoordinates, (kinkCell + k + 1)).$cp(newPath[k]);
    }
    finalLength = kinkCell + newPathLength + 1 << 16 >> 16;
  }
  $sadd(listOfCoordinates, finalLength).$cp(struct_pos.$of(-1, -1));
  return finalLength;
}

export async function checkForMissingKeys(x: number, y: number): Promise<void> {
  let layer = 0;
  if (cellHasTMFlag(struct_pos.$of(x, y), TM_PROMOTES_WITHOUT_KEY) && !await keyOnTileAt(struct_pos.$of(x, y))) {
    for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; layer = layer + 1 << 16 >> 16) {
      if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].mechFlags & TM_PROMOTES_WITHOUT_KEY) >>> 0) {
        await promoteTile(x, y, layer, false_);
      }
    }
  }
}

async function beckonMonster(monst: struct_creature | null, x: number, y: number): Promise<void> {
  let theBolt = $sadd(G.boltCatalog, BOLT_BLINKING).$clone();
  if ((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
    await freeCaptive(monst);
  }
  let from = monst.loc.$clone();
  let to = struct_pos.$of(x, y).$clone();
  theBolt.magnitude = (1 > ((distanceBetween(struct_pos.$of(x, y), monst.loc) - 2) / 2 | 0) ? 1 : (distanceBetween(struct_pos.$of(x, y), monst.loc) - 2) / 2 | 0) << 16 >> 16;
  await zap(from.$clone(), to.$clone(), theBolt, false_, true_);
  if (G.player.attackSpeed + 1 > monst.ticksUntilTurn) {
    monst.ticksUntilTurn = G.player.attackSpeed + 1 << 16 >> 16;
  }
}

export function boltEffectForItem(theItem: struct_item | null): number {
  if (theItem.category & (STAFF | WAND)) {
    return $sadd(G.boltCatalog, $sadd(tableForItemCategory(theItem.category), theItem.kind).power).boltEffect;
  } else {
    return BE_NONE;
  }
}

export function boltForItem(theItem: struct_item | null): number {
  if (theItem.category & (STAFF | WAND)) {
    return $sadd(tableForItemCategory(theItem.category), theItem.kind).power;
  } else {
    return 0;
  }
}

async function updateBolt(theBolt: struct_bolt | null, caster: struct_creature | null, x: number, y: number, boltInView: number, alreadyReflected: number, autoID: Ptr | null, lightingChanged: Ptr | null): Promise<number> {
  let buf = new Int8Array(100);
  let monstName = new Int8Array(100);
  let monst = null;
  let newMonst = null;
  let terminateBolt = false_;
  let negated = false_;
  if (lightingChanged) {
    lightingChanged.a[lightingChanged.o] = false_;
  }
  monst = monsterAtLoc(struct_pos.$of(x, y));
  if (monst && !((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
    monsterName(P(monstName), monst, true_);
    switch (theBolt.boltEffect) {
    case BE_ATTACK:
      if (!cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY) || (monst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) {
        await attack(caster, monst, false_);
        if (autoID) {
          autoID.a[autoID.o] = true_;
        }
      }
      break;
    case BE_DAMAGE:
      if (autoID) {
        autoID.a[autoID.o] = true_;
      }
      if (monst && caster === G.player) {
        if ((theBolt.flags & BF_FIERY) >>> 0 && !(monst.status[STATUS_IMMUNE_TO_FIRE] > 0) || (theBolt.flags & BF_ELECTRIC) >>> 0) {
          handlePaladinFeat(monst);
        }
      }
      if ((theBolt.flags & BF_FIERY) >>> 0 && monst.status[STATUS_IMMUNE_TO_FIRE] > 0 || (monst.info.flags & MONST_INVULNERABLE) >>> 0) {
        if (canSeeMonster(monst)) {
          sprintf(P(buf), S("%s ignore%s %s %s"), P(monstName), monst === G.player ? S("") : S("s"), canSeeMonster(caster) ? S("the") : S("a"), P(theBolt.name));
          await combatMessage(P(buf), null);
        }
      } else if (await inflictDamage(caster, monst, staffDamage($mul64(theBolt.magnitude, FP_FACTOR)), theBolt.backColor, false_)) {
        if (0 >= G.player.currentHP) {
          await killCreature(monst, false_);
          if (caster === G.player) {
            sprintf(P(buf), S("Killed by a reflected %s"), P(theBolt.name));
            await gameOver(P(buf), true_);
          }
          terminateBolt = true_;
          return true_;
        }
        if (boltInView || canSeeMonster(monst)) {
          sprintf(P(buf), S("%s %s %s %s"), canSeeMonster(caster) ? S("the") : S("a"), P(theBolt.name), (monst.info.flags & MONST_INANIMATE) >>> 0 ? S("destroys") : S("kills"), P(monstName));
          await combatMessage(P(buf), messageColorFromVictim(monst));
        } else {
          sprintf(P(buf), S("you hear %s %s"), P(monstName), (monst.info.flags & MONST_INANIMATE) >>> 0 ? S("get destroyed") : S("die"));
          await combatMessage(P(buf), null);
        }
        await killCreature(monst, false_);
      } else {
        if (monst.creatureMode >>> 0 !== MODE_PERM_FLEEING && monst.creatureState >>> 0 !== MONSTER_ALLY && (monst.creatureState >>> 0 !== MONSTER_FLEEING || monst.status[STATUS_MAGICAL_FEAR])) {
          monst.creatureState = MONSTER_TRACKING_SCENT;
          monst.status[STATUS_MAGICAL_FEAR] = 0;
        }
        if (boltInView) {
          sprintf(P(buf), S("%s %s hits %s"), canSeeMonster(caster) ? S("the") : S("a"), P(theBolt.name), P(monstName));
          await combatMessage(P(buf), messageColorFromVictim(monst));
        }
        if ((theBolt.flags & BF_FIERY) >>> 0) {
          await exposeCreatureToFire(monst);
        }
        if (!alreadyReflected || caster !== G.player) {
          moralAttack(caster, monst);
          await splitMonster(monst, caster);
        }
      }
      if ((theBolt.flags & BF_FIERY) >>> 0) {
        await exposeTileToFire(x, y, true_);
      }
      break;
    case BE_TELEPORT:
      if (!((monst.info.flags & MONST_IMMOBILE) >>> 0)) {
        if ((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
          await freeCaptive(monst);
        }
        await teleport(monst, struct_pos.$of(-1, -1), false_);
      }
      break;
    case BE_BECKONING:
      if (!((monst.info.flags & MONST_IMMOBILE) >>> 0) && caster && distanceBetween(caster.loc, monst.loc) > 1) {
        if (canSeeMonster(monst) && autoID) {
          autoID.a[autoID.o] = true_;
        }
        await beckonMonster(monst, caster.loc.x, caster.loc.y);
        if (canSeeMonster(monst) && autoID) {
          autoID.a[autoID.o] = true_;
        }
      }
      break;
    case BE_SLOW:
      await slow(monst, theBolt.magnitude * 5 << 16 >> 16);
      if ($sadd(G.boltCatalog, BOLT_SLOW).backColor) {
        flashMonster(monst, $sadd(G.boltCatalog, BOLT_SLOW).backColor, 100);
      }
      if (autoID) {
        autoID.a[autoID.o] = true_;
      }
      break;
    case BE_HASTE:
      await haste(monst, staffHasteDuration($mul64(theBolt.magnitude, FP_FACTOR)));
      if ($sadd(G.boltCatalog, BOLT_HASTE).backColor) {
        flashMonster(monst, $sadd(G.boltCatalog, BOLT_HASTE).backColor, 100);
      }
      if (autoID) {
        autoID.a[autoID.o] = true_;
      }
      break;
    case BE_POLYMORPH:
      if (await polymorph(monst)) {
        if (!monst.status[STATUS_INVISIBLE]) {
          if (autoID) {
            autoID.a[autoID.o] = true_;
          }
        }
      }
      break;
    case BE_INVISIBILITY:
      if (await imbueInvisibility(monst, theBolt.magnitude * 15 << 16 >> 16) && autoID) {
        autoID.a[autoID.o] = true_;
      }
      break;
    case BE_DOMINATION:
      if (monst !== G.player && !((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
        if (rand_percent(wandDominate(monst))) {
          monst.status[STATUS_DISCORDANT] = 0;
          await becomeAllyWith(monst);
          await refreshDungeonCell(monst.loc.$clone());
          if (canSeeMonster(monst)) {
            if (autoID) {
              autoID.a[autoID.o] = true_;
            }
            sprintf(P(buf), S("%s is bound to your will!"), P(monstName));
            await message(P(buf), 0);
            if ($sadd(G.boltCatalog, BOLT_DOMINATION).backColor) {
              flashMonster(monst, $sadd(G.boltCatalog, BOLT_DOMINATION).backColor, 100);
            }
          }
        } else if (canSeeMonster(monst)) {
          if (autoID) {
            autoID.a[autoID.o] = true_;
          }
          sprintf(P(buf), S("%s resists the bolt of domination."), P(monstName));
          await message(P(buf), 0);
        }
      }
      break;
    case BE_NEGATION:
      negated = await negate(monst);
      if ($sadd(G.boltCatalog, BOLT_NEGATION).backColor) {
        flashMonster(monst, $sadd(G.boltCatalog, BOLT_NEGATION).backColor, 100);
      }
      if (negated && autoID && canSeeMonster(monst)) {
        autoID.a[autoID.o] = true_;
      }
      break;
    case BE_EMPOWERMENT:
      if (monst !== G.player && !((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
        await empowerMonster(monst);
        createFlare(monst.loc.x, monst.loc.y, EMPOWERMENT_LIGHT);
        if (canSeeMonster(monst) && autoID) {
          autoID.a[autoID.o] = true_;
        }
      }
      break;
    case BE_POISON:
      if (!((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
        await addPoison(monst, staffPoison($mul64(theBolt.magnitude, FP_FACTOR)) << 16 >> 16, 1);
        if (canSeeMonster(monst)) {
          if ($sadd(G.boltCatalog, BOLT_POISON).backColor) {
            flashMonster(monst, $sadd(G.boltCatalog, BOLT_POISON).backColor, 100);
          }
          if (autoID) {
            autoID.a[autoID.o] = true_;
          }
          if (monst !== G.player) {
            sprintf(P(buf), S("%s %s %s sick"), P(monstName), monst === G.player ? S("feel") : S("looks"), Math.imul(monst.status[STATUS_POISONED], monst.poisonAmount) >= monst.currentHP && !G.player.status[STATUS_HALLUCINATING] ? S("fatally") : S("very"));
            await combatMessage(P(buf), messageColorFromVictim(monst));
          }
        }
      }
      break;
    case BE_ENTRANCEMENT:
      if (monst === G.player) {
        flashMonster(monst, G.confusionGasColor, 100);
        monst.status[STATUS_CONFUSED] = staffEntrancementDuration($mul64(theBolt.magnitude, FP_FACTOR));
        monst.maxStatus[STATUS_CONFUSED] = (monst.status[STATUS_CONFUSED] > monst.maxStatus[STATUS_CONFUSED] ? monst.status[STATUS_CONFUSED] : monst.maxStatus[STATUS_CONFUSED]) << 16 >> 16;
        await message(S("the bolt hits you and you suddenly feel disoriented."), REQUIRE_ACKNOWLEDGMENT);
        if (autoID) {
          autoID.a[autoID.o] = true_;
        }
      } else if (!((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
        monst.status[STATUS_ENTRANCED] = monst.maxStatus[STATUS_ENTRANCED] = staffEntrancementDuration($mul64(theBolt.magnitude, FP_FACTOR));
        wakeUp(monst);
        if (canSeeMonster(monst)) {
          if ($sadd(G.boltCatalog, BOLT_ENTRANCEMENT).backColor) {
            flashMonster(monst, $sadd(G.boltCatalog, BOLT_ENTRANCEMENT).backColor, 100);
          }
          if (autoID) {
            autoID.a[autoID.o] = true_;
          }
          sprintf(P(buf), S("%s is entranced!"), P(monstName));
          await message(P(buf), 0);
        }
      }
      break;
    case BE_HEALING:
      await heal(monst, theBolt.magnitude * 10 << 16 >> 16, false_);
      if (canSeeMonster(monst)) {
        if (autoID) {
          autoID.a[autoID.o] = true_;
        }
      }
      break;
    case BE_PLENTY:
      if (!((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
        newMonst = await cloneMonster(monst, true_, true_);
        if (newMonst) {
          monst.currentHP = ((monst.currentHP + 1) / 2 | 0) << 16 >> 16;
          newMonst.currentHP = ((newMonst.currentHP + 1) / 2 | 0) << 16 >> 16;
          if ($sadd(G.boltCatalog, BOLT_PLENTY).backColor) {
            flashMonster(monst, $sadd(G.boltCatalog, BOLT_PLENTY).backColor, 100);
            flashMonster(newMonst, $sadd(G.boltCatalog, BOLT_PLENTY).backColor, 100);
          }
          if (autoID) {
            autoID.a[autoID.o] = true_;
          }
        }
      }
      break;
    case BE_DISCORD:
      if (!((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
        monst.status[STATUS_DISCORDANT] = monst.maxStatus[STATUS_DISCORDANT] = (staffDiscordDuration($mul64(theBolt.magnitude, 65536)) > monst.status[STATUS_DISCORDANT] ? staffDiscordDuration($mul64(theBolt.magnitude, 65536)) : monst.status[STATUS_DISCORDANT]) << 16 >> 16;
        if (canSeeMonster(monst)) {
          if ($sadd(G.boltCatalog, BOLT_DISCORD).backColor) {
            flashMonster(monst, $sadd(G.boltCatalog, BOLT_DISCORD).backColor, 100);
          }
          if (autoID) {
            autoID.a[autoID.o] = true_;
          }
        }
      }
      break;
    case BE_SHIELDING:
      if (staffProtection($mul64(theBolt.magnitude, FP_FACTOR)) > monst.status[STATUS_SHIELDED]) {
        monst.status[STATUS_SHIELDED] = staffProtection($mul64(theBolt.magnitude, FP_FACTOR)) << 16 >> 16;
      }
      monst.maxStatus[STATUS_SHIELDED] = monst.status[STATUS_SHIELDED];
      if ($sadd(G.boltCatalog, BOLT_SHIELDING).backColor) {
        flashMonster(monst, $sadd(G.boltCatalog, BOLT_SHIELDING).backColor, 100);
      }
      if (autoID) {
        autoID.a[autoID.o] = true_;
      }
      break;
    default:
      break;
    }
    if (!((theBolt.flags & BF_PASSES_THRU_CREATURES) >>> 0)) {
      terminateBolt = true_;
    }
  }
  switch (theBolt.boltEffect) {
  case BE_BLINKING:
    if (caster === G.player) {
      G.player.loc.x = x;
      G.player.loc.y = y;
      if (lightingChanged) {
        lightingChanged.a[lightingChanged.o] = true_;
      }
    }
    break;
  default:
    break;
  }
  if (theBolt.pathDF) {
    await spawnDungeonFeature(x, y, $sat(G.dungeonFeatureCatalog, theBolt.pathDF), true_, false_);
  }
  if ((theBolt.flags & BF_FIERY) >>> 0 && await exposeTileToFire(x, y, true_)) {
    if (lightingChanged) {
      lightingChanged.a[lightingChanged.o] = true_;
    }
    if (autoID) {
      autoID.a[autoID.o] = true_;
    }
  }
  if ((theBolt.flags & BF_ELECTRIC) >>> 0 && await exposeTileToElectricity(x, y)) {
    if (lightingChanged) {
      lightingChanged.a[lightingChanged.o] = true_;
    }
    if (autoID) {
      autoID.a[autoID.o] = true_;
    }
  }
  return terminateBolt;
}

async function detonateBolt(theBolt: struct_bolt | null, caster: struct_creature | null, x: number, y: number, autoID: Ptr | null): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any;
  let feat = new struct_dungeonFeature();
  let i = 0;
  const x2 = new Int16Array(1);
  const y2 = new Int16Array(1);
  let monst = null;
  let POW_OBSTRUCTION = $ta(Float64Array, 41, [41943, 33554, 26843, 21474, 17179, 13743, 10995, 8796, 7036, 5629, 4503, 3602, 2882, 2305, 1844, 1475, 1180, 944, 755, 604, 483, 386, 309, 247, 198, 158, 126, 101, 81, 64, 51, 41, 33, 26, 21, 17, 13, 10, 8, 6, 5]);
  switch (theBolt.boltEffect) {
  case BE_OBSTRUCTION:
    feat.$cp(G.dungeonFeatureCatalog[DF_FORCEFIELD]);
    feat.probabilityDecrement = (1 > Math.trunc($mul64(75, POW_OBSTRUCTION[(theBolt.magnitude > 40 ? 40 : theBolt.magnitude) - 2]) / 65536) ? 1 : Math.trunc($mul64(75, POW_OBSTRUCTION[(theBolt.magnitude > 40 ? 40 : theBolt.magnitude) - 2]) / 65536)) << 16 >> 16;
    await spawnDungeonFeature(x, y, feat, true_, false_);
    if (autoID) {
      autoID.a[autoID.o] = true_;
    }
    break;
  case BE_CONJURATION:
    for (i = 0; i < staffBladeCount($mul64(theBolt.magnitude, FP_FACTOR)); i = i + 1 << 16 >> 16) {
      monst = generateMonster(MK_SPECTRAL_BLADE, true_, false_);
      monst.loc.$cp(getQualifyingPathLocNear(struct_pos.$of(x, y), true_, ((T_DIVIDES_LEVEL & avoidedFlagsForMonster(monst.info)) >>> 0 & ~T_SPONTANEOUSLY_IGNITES >>> 0) >>> 0, HAS_PLAYER, (avoidedFlagsForMonster(monst.info) & ~T_SPONTANEOUSLY_IGNITES >>> 0) >>> 0, HAS_PLAYER | HAS_MONSTER | HAS_STAIRS, false_));
      monst.bookkeepingFlags = (monst.bookkeepingFlags | (MB_FOLLOWER | MB_BOUND_TO_LEADER | MB_DOES_NOT_TRACK_LEADER)) >>> 0;
      monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_JUST_SUMMONED >>> 0) >>> 0;
      monst.leader = G.player;
      monst.creatureState = MONSTER_ALLY;
      monst.ticksUntilTurn = monst.info.attackSpeed + 1 << 16 >> 16;
      ($t1 = pmapAt(monst.loc), $t1.flags = ($t1.flags | HAS_MONSTER) >>> 0);
      await fadeInMonster(monst);
    }
    await updateVision(true_);
    monst = null;
    if (autoID) {
      autoID.a[autoID.o] = true_;
    }
    break;
  case BE_BLINKING:
    if (($at2(G.pmap, x, y).flags & HAS_MONSTER) >>> 0) {
      caster.loc.$cp(struct_pos.$of(-1, -1));
      monst = monsterAtLoc(struct_pos.$of(x, y));
      findAlternativeHomeFor(monst, P(x2, 0), P(y2, 0), true_);
      if (x2[0] >= 0) {
        monst.loc.x = x2[0];
        monst.loc.y = y2[0];
        ($t2 = $at2(G.pmap, x, y), $t2.flags = ($t2.flags & ~HAS_MONSTER >>> 0) >>> 0);
        ($t3 = $at2(G.pmap, x2[0], y2[0]), $t3.flags = ($t3.flags | HAS_MONSTER) >>> 0);
      } else {
        await killCreature(monst, true_);
        ($t4 = $at2(G.pmap, x, y), $t4.flags = ($t4.flags & ~HAS_MONSTER >>> 0) >>> 0);
        monst = null;
      }
    }
    caster.bookkeepingFlags = (caster.bookkeepingFlags & ~MB_SUBMERGED >>> 0) >>> 0;
    ($t5 = $at2(G.pmap, x, y), $t5.flags = ($t5.flags | $u64(caster === G.player ? HAS_PLAYER : HAS_MONSTER)) >>> 0);
    caster.loc.x = x;
    caster.loc.y = y;
    await disentangle(caster);
    await applyInstantTileEffectsToCreature(caster);
    if (caster === G.player) {
      G.rogue.scentTurnNumber = G.rogue.scentTurnNumber + 30 & 0xffff;
      if ((pmapAt(G.player.loc).flags & HAS_ITEM) >>> 0) {
        await pickUpItemAt(G.player.loc.$clone());
      }
      await updateVision(true_);
    }
    if (autoID) {
      autoID.a[autoID.o] = true_;
    }
    break;
  case BE_TUNNELING:
    setUpWaypoints();
    break;
  }
  if (theBolt.targetDF) {
    await spawnDungeonFeature(x, y, $sat(G.dungeonFeatureCatalog, theBolt.targetDF), true_, false_);
  }
}

export async function zap(originLoc: struct_pos, targetLoc: struct_pos, theBolt: struct_bolt | null, hideDetails: number, reverseBoltDir: number): Promise<number> {
  let $t1: any;
  let listOfCoordinates = $sarr(struct_pos, 790);
  let i = 0;
  let j = 0;
  let k = 0;
  let x = 0;
  let y = 0;
  let x2 = 0;
  let y2 = 0;
  let numCells = 0;
  let blinkDistance = 0;
  let boltLength = 0;
  let initialBoltLength = 0;
  let lights = $arr(79, () => $arr(29, () => new Int16Array(3)));
  let monst = null;
  let shootingMonst = null;
  let buf = new Int8Array(100);
  let monstName = new Int8Array(100);
  const autoID = new Int8Array(1);
  autoID[0] = false_;
  const lightingChanged = new Int8Array(1);
  lightingChanged[0] = false_;
  let fastForward = false_;
  let alreadyReflected = false_;
  let boltInView = 0;
  let boltColor = null;
  let boltLightRadius = 0;
  const theChar = new Int32Array(1);
  let foreColor = new struct_color();
  let backColor = new struct_color();
  let multColor = new struct_color();
  let boltLights = $sarr(struct_lightSource, 500);
  let boltLightColors = $sarr(struct_color, 500);
  ;
  if (originLoc.x === targetLoc.x && originLoc.y === targetLoc.y) {
    return false_;
  }
  x = originLoc.x;
  y = originLoc.y;
  initialBoltLength = boltLength = 5 * theBolt.magnitude << 16 >> 16;
  if (reverseBoltDir) {
    let listOfCoordinatesTmp = $sarr(struct_pos, 790);
    let numCellsTmp = getLineCoordinates(listOfCoordinatesTmp[0], targetLoc.$clone(), originLoc.$clone(), hideDetails ? $sadd(G.boltCatalog, BOLT_NONE) : theBolt);
    numCells = -1;
    for (let i = 0; numCellsTmp > i; ++i) {
      if (listOfCoordinatesTmp[i].x === originLoc.x && listOfCoordinatesTmp[i].y === originLoc.y) {
        numCells = i + 1 << 16 >> 16;
        break;
      }
    }
    ;
    for (let i = 0; numCells - 1 > i; ++i) {
      listOfCoordinates[i].$cp(listOfCoordinatesTmp[numCells - 2 - i]);
    }
    listOfCoordinates[numCells - 1].$cp(targetLoc);
  } else {
    numCells = getLineCoordinates(listOfCoordinates[0], originLoc.$clone(), targetLoc.$clone(), hideDetails ? $sadd(G.boltCatalog, BOLT_NONE) : theBolt);
  }
  shootingMonst = monsterAtLoc(originLoc);
  if (hideDetails) {
    boltColor = G.gray;
  } else {
    boltColor = theBolt.backColor;
  }
  await refreshSideBar(-1, -1, false_);
  await displayCombatText();
  if (theBolt.boltEffect === BE_BLINKING) {
    if (cellHasTerrainFlag(listOfCoordinates[0], T_OBSTRUCTS_PASSABILITY | T_OBSTRUCTS_VISION) || (pmapAt(listOfCoordinates[0]).flags & (HAS_PLAYER | HAS_MONSTER)) >>> 0 && !((monsterAtLoc(listOfCoordinates[0]).bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
      return false_;
    }
    theBolt.foreColor = G.black;
    theBolt.theChar = shootingMonst.info.displayChar;
    ($t1 = pmapAt(originLoc), $t1.flags = ($t1.flags & ~(HAS_PLAYER | HAS_MONSTER) >>> 0) >>> 0);
    await refreshDungeonCell(originLoc.$clone());
    blinkDistance = theBolt.magnitude * 2 + 1 << 16 >> 16;
    await checkForMissingKeys(originLoc.x, originLoc.y);
  }
  if (boltColor) {
    for (i = 0; initialBoltLength > i; i = i + 1 << 16 >> 16) {
      boltLightColors[i].$cp(boltColor);
      boltLights[i].$cp(G.lightCatalog[BOLT_LIGHT_SOURCE]);
      boltLights[i].lightColor = $sat(boltLightColors, i);
      boltLightRadius = Math.trunc(Math.trunc($mul64($mul64(50, 196608 + Math.trunc($mul64($mul64(theBolt.magnitude, FP_FACTOR), 4) / 3)), initialBoltLength - i) / initialBoltLength) / FP_FACTOR);
      boltLights[i].lightRadius.lowerBound = boltLights[i].lightRadius.upperBound = boltLightRadius << 16 >> 16;
    }
  }
  if (theBolt.boltEffect === BE_TUNNELING) {
    await tunnelize(originLoc.x, originLoc.y);
  }
  backUpLighting(P(lights));
  boltInView = true_;
  for (i = 0; numCells > i; i = i + 1 << 16 >> 16) {
    x = listOfCoordinates[i].x;
    y = listOfCoordinates[i].y;
    monst = monsterAtLoc(listOfCoordinates[i]);
    if (monst && !((theBolt.flags & BF_NEVER_REFLECTS) >>> 0) && projectileReflects(shootingMonst, monst) && MAX_BOLT_LENGTH - (100 - 20 - 1 > 31 + 3 - 3 - 2 ? 100 - 20 - 1 : 31 + 3 - 3 - 2) > i) {
      if (projectileReflects(shootingMonst, monst)) {
        numCells = await reflectBolt(originLoc.x, originLoc.y, listOfCoordinates[0], i, (!alreadyReflected ? 1 : 0) << 24 >> 24);
      } else {
        numCells = await reflectBolt(-1, -1, listOfCoordinates[0], i, false_);
      }
      alreadyReflected = true_;
      if (boltInView) {
        monsterName(P(monstName), monst, true_);
        sprintf(P(buf), S("%s deflect%s the %s"), P(monstName), monst === G.player ? S("") : S("s"), hideDetails ? S("bolt") : P(theBolt.name));
        await combatMessage(P(buf), null);
      }
      if (monst === G.player && G.rogue.armor && G.rogue.armor.enchant2 === A_REFLECTION && !((G.rogue.armor.flags & ITEM_RUNIC_IDENTIFIED) >>> 0)) {
        await autoIdentify(G.rogue.armor);
      }
      continue;
    }
    if (await updateBolt(theBolt, shootingMonst, x, y, boltInView, alreadyReflected, P(autoID, 0), P(lightingChanged, 0))) {
      break;
    }
    if (lightingChanged[0]) {
      await updateVision(true_);
      backUpLighting(P(lights));
    }
    if (boltInView && boltColor) {
      demoteVisibility();
      restoreLighting(P(lights));
      for (k = (boltLength + 2 > i ? i : boltLength + 2) << 16 >> 16; k >= 0; k = k - 1 << 16 >> 16) {
        if (initialBoltLength > k) {
          paintLight($sat(boltLights, k), listOfCoordinates[i - k].x, listOfCoordinates[i - k].y, false_, false_);
        }
      }
    }
    boltInView = false_;
    await updateFieldOfViewDisplay(false_, true_);
    for (k = (boltLength + 2 > i ? i : boltLength + 2) << 16 >> 16; k >= 0; k = k - 1 << 16 >> 16) {
      x2 = listOfCoordinates[i - k].x;
      y2 = listOfCoordinates[i - k].y;
      if (($at2(G.pmap, x2, y2).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, x2, y2).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, x2, y2).flags & DISCOVERED) >>> 0)) {
        if (!fastForward) {
          await getCellAppearance(struct_pos.$of(x2, y2), P(theChar, 0), foreColor, backColor);
          if (boltColor) {
            applyColorAugment(foreColor, boltColor, (0 > 100 - (k * 100 / boltLength | 0) ? 0 : 100 - (k * 100 / boltLength | 0)) << 16 >> 16);
            applyColorAugment(backColor, boltColor, (0 > 100 - (k * 100 / boltLength | 0) ? 0 : 100 - (k * 100 / boltLength | 0)) << 16 >> 16);
          }
          let displayChar = (k === 0 || (theBolt.flags & BF_DISPLAY_CHAR_ALONG_LENGTH) >>> 0 ? 1 : 0) << 24 >> 24;
          if (displayChar) {
            if (theBolt.foreColor) {
              foreColor.$cp(theBolt.foreColor);
            }
            if (theBolt.theChar) {
              theChar[0] = theBolt.theChar;
            }
          }
          if (displayChar && theBolt.foreColor && theBolt.theChar >>> 0) {
            colorMultiplierFromDungeonLight(x2, y2, multColor);
            applyColorMultiplier(foreColor, multColor);
            plotCharWithColor(theChar[0], mapToWindow(struct_pos.$of(x2, y2)), foreColor, backColor);
          } else if (boltColor) {
            plotCharWithColor(theChar[0], mapToWindow(struct_pos.$of(x2, y2)), foreColor, backColor);
          } else if (k === 1 && theBolt.foreColor && theBolt.theChar >>> 0) {
            await refreshDungeonCell(struct_pos.$of(x2, y2));
          }
        }
        if (($at2(G.pmap, x2, y2).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
          boltInView = true_;
        }
      }
    }
    if (!fastForward && (boltInView || G.rogue.playbackOmniscience)) {
      fastForward = (G.rogue.playbackFastForward || await pauseAnimation(16, struct_PauseBehavior.$of()) ? 1 : 0) << 24 >> 24;
    }
    if (theBolt.boltEffect === BE_BLINKING) {
      theBolt.magnitude = ((blinkDistance - i) / 2 | 0) + 1 << 16 >> 16;
      boltLength = theBolt.magnitude * 5 << 16 >> 16;
      for (j = 0; i > j; j = j + 1 << 16 >> 16) {
        await refreshDungeonCell(listOfCoordinates[j].$clone());
      }
      if (i >= blinkDistance) {
        break;
      }
    }
    if ((theBolt.flags & BF_HALTS_BEFORE_OBSTRUCTION) >>> 0 && numCells > i + 1) {
      x2 = listOfCoordinates[i + 1].x;
      y2 = listOfCoordinates[i + 1].y;
      if (cellHasTerrainFlag(struct_pos.$of(x2, y2), T_OBSTRUCTS_VISION | T_OBSTRUCTS_PASSABILITY)) {
        break;
      }
      if (!((theBolt.flags & BF_PASSES_THRU_CREATURES) >>> 0)) {
        monst = monsterAtLoc(listOfCoordinates[i + 1]);
        if (monst && !((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
          break;
        }
      }
    }
    if (cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY | T_OBSTRUCTS_VISION) && theBolt.boltEffect === BE_TUNNELING && await tunnelize(x, y)) {
      await updateVision(true_);
      backUpLighting(P(lights));
      autoID[0] = true_;
      theBolt.magnitude = theBolt.magnitude - 1 << 16 >> 16;
      boltLength = theBolt.magnitude * 5 << 16 >> 16;
      for (j = 0; i > j; j = j + 1 << 16 >> 16) {
        await refreshDungeonCell(listOfCoordinates[j].$clone());
      }
      if (0 >= theBolt.magnitude) {
        await refreshDungeonCell(listOfCoordinates[i - 1].$clone());
        await refreshDungeonCell(struct_pos.$of(x, y));
        break;
      }
    }
    if (cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY | T_OBSTRUCTS_VISION)) {
      break;
    }
    if (numCells > i + 1 && !((theBolt.flags & BF_NEVER_REFLECTS) >>> 0)) {
      x2 = listOfCoordinates[i + 1].x;
      y2 = listOfCoordinates[i + 1].y;
      if (cellHasTerrainFlag(struct_pos.$of(x2, y2), T_OBSTRUCTS_VISION | T_OBSTRUCTS_PASSABILITY) && (projectileReflects(shootingMonst, null) || cellHasTMFlag(struct_pos.$of(x2, y2), TM_REFLECTS_BOLTS) || theBolt.boltEffect === BE_TUNNELING && ($at2(G.pmap, x2, y2).flags & IMPREGNABLE) >>> 0) && MAX_BOLT_LENGTH - (100 - 20 - 1 > 31 + 3 - 3 - 2 ? 100 - 20 - 1 : 31 + 3 - 3 - 2) > i) {
        sprintf(P(buf), S("the bolt reflects off of %s"), tileText(x2, y2));
        if (projectileReflects(shootingMonst, null)) {
          numCells = await reflectBolt(originLoc.x, originLoc.y, listOfCoordinates[0], i, (!alreadyReflected ? 1 : 0) << 24 >> 24);
        } else {
          numCells = await reflectBolt(-1, -1, listOfCoordinates[0], i, false_);
        }
        alreadyReflected = true_;
        if (boltInView) {
          await combatMessage(P(buf), null);
        }
      }
    }
  }
  if (!fastForward) {
    await refreshDungeonCell(struct_pos.$of(x, y));
    if (i > 0) {
      await refreshDungeonCell(listOfCoordinates[i - 1].$clone());
    }
  }
  if (($at2(G.pmap, x, y).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0) {
    monst = monsterAtLoc(struct_pos.$of(x, y));
    monsterName(P(monstName), monst, true_);
  } else {
    monst = null;
  }
  await detonateBolt(theBolt, shootingMonst, x, y, P(autoID, 0));
  updateLighting();
  backUpLighting(P(lights));
  boltInView = true_;
  await refreshSideBar(-1, -1, false_);
  if (boltLength > 0) {
    if (boltColor) {
      for (j = i; i + boltLength + 2 > j; j = j + 1 << 16 >> 16) {
        if (boltInView) {
          demoteVisibility();
          restoreLighting(P(lights));
          for (k = (boltLength + 2 > j ? j : boltLength + 2) << 16 >> 16; k >= j - i; k = k - 1 << 16 >> 16) {
            if (initialBoltLength > k) {
              paintLight($sat(boltLights, k), listOfCoordinates[j - k].x, listOfCoordinates[j - k].y, false_, false_);
            }
          }
          await updateFieldOfViewDisplay(false_, true_);
        }
        boltInView = false_;
        for (k = (boltLength + 2 > j ? j : boltLength + 2) << 16 >> 16; k >= j - i; k = k - 1 << 16 >> 16) {
          if (($at2(G.pmap, listOfCoordinates[j - k].x, listOfCoordinates[j - k].y).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
            if (boltColor) {
              await hiliteCell(listOfCoordinates[j - k].x, listOfCoordinates[j - k].y, boltColor, (0 > 100 - (k * 100 / boltLength | 0) ? 0 : 100 - (k * 100 / boltLength | 0)) << 16 >> 16, false_);
            }
            boltInView = true_;
          }
        }
        if (!fastForward && boltInView) {
          fastForward = (G.rogue.playbackFastForward || await pauseAnimation(16, struct_PauseBehavior.$of()) ? 1 : 0) << 24 >> 24;
        }
      }
    } else if ((theBolt.flags & BF_DISPLAY_CHAR_ALONG_LENGTH) >>> 0) {
      for (j = 0; i > j; j = j + 1 << 16 >> 16) {
        x2 = listOfCoordinates[j].x;
        y2 = listOfCoordinates[j].y;
        if (($at2(G.pmap, x2, y2).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, x2, y2).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, x2, y2).flags & DISCOVERED) >>> 0)) {
          await refreshDungeonCell(struct_pos.$of(x2, y2));
        }
      }
    }
  }
  return autoID[0];
}

function itemMagicPolarityIsKnown(theItem: struct_item | null, magicPolarity: number): number {
  let table = tableForItemCategory(theItem.category);
  if (theItem && (theItem.flags & (ITEM_MAGIC_DETECTED | ITEM_IDENTIFIED)) >>> 0 || table && ($sadd(table, theItem.kind).identified || $sadd(table, theItem.kind).magicPolarityRevealed)) {
    return (itemMagicPolarity(theItem) === magicPolarity ? 1 : 0) << 24 >> 24;
  }
  return false_;
}

function canAutoTargetMonster(monst: struct_creature | null, theItem: struct_item | null, targetingMode: number): number {
  let throw_ = (targetingMode >>> 0 === AUTOTARGET_MODE_THROW ? 1 : 0) << 24 >> 24;
  let use = (targetingMode >>> 0 === AUTOTARGET_MODE_USE_STAFF_OR_WAND ? 1 : 0) << 24 >> 24;
  if (!monst || !theItem || !throw_ && !use || monst.depth !== G.rogue.depthLevel || (monst.bookkeepingFlags & MB_IS_DYING) >>> 0 || use && theItem.category !== STAFF && theItem.category !== WAND || throw_ && theItem.category !== POTION && theItem.category !== WEAPON || throw_ && theItem.category === WEAPON && !itemIsThrowingWeapon(theItem) || throw_ && theItem.category === WEAPON && (monst.info.flags & MONST_INVULNERABLE) >>> 0 || throw_ && theItem.category === POTION && itemMagicPolarityIsKnown(theItem, MAGIC_POLARITY_BENEVOLENT) || !canSeeMonster(monst) || !openPathBetween(G.player.loc.$clone(), monst.loc.$clone()) || G.player.status[STATUS_HALLUCINATING] && !G.player.status[STATUS_TELEPATHIC] && !((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
    return false_;
  }
  let isAlly = (monstersAreTeammates(G.player, monst) || (monst.bookkeepingFlags & MB_CAPTIVE) >>> 0 ? 1 : 0) << 24 >> 24;
  let isEnemy = (!isAlly ? 1 : 0) << 24 >> 24;
  let itemKindIsKnown = $sadd(tableForItemCategory(theItem.category), theItem.kind).identified;
  if (throw_) {
    if (theItem.category === WEAPON) {
      if (theItem.kind === INCENDIARY_DART && monst.status[STATUS_IMMUNE_TO_FIRE] || theItem.kind !== INCENDIARY_DART && (monst.info.flags & MONST_IMMUNE_TO_WEAPONS) >>> 0) {
        return false_;
      }
    }
    if (itemKindIsKnown && theItem.category === POTION) {
      if (theItem.kind === POTION_INCINERATION && monst.status[STATUS_IMMUNE_TO_FIRE] || (monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0 && (theItem.kind === POTION_CONFUSION || theItem.kind === POTION_POISON)) {
        return false_;
      }
    }
    return isEnemy;
  }
  if (isEnemy && (monst.info.abilityFlags & MA_REFLECT_100) >>> 0) {
    return false_;
  }
  let theBolt = $sadd(G.boltCatalog, $sadd(tableForItemCategory(theItem.category), theItem.kind).power).$clone();
  let magicPolarityIsKnownBenevolent = itemMagicPolarityIsKnown(theItem, MAGIC_POLARITY_BENEVOLENT);
  let magicPolarityIsKnownMalevolent = itemMagicPolarityIsKnown(theItem, MAGIC_POLARITY_MALEVOLENT);
  let magicPolarityIsKnown = (magicPolarityIsKnownBenevolent || magicPolarityIsKnownMalevolent ? 1 : 0) << 24 >> 24;
  if (itemKindIsKnown) {
    if ((theBolt.forbiddenMonsterFlags & monst.info.flags) >>> 0 || isEnemy && theBolt.boltEffect === BE_DOMINATION && wandDominate(monst) <= 0 || isEnemy && theBolt.boltEffect === BE_BECKONING && distanceBetween(G.player.loc, monst.loc) <= 1 || isEnemy && theBolt.boltEffect === BE_DAMAGE && (theBolt.flags & BF_FIERY) >>> 0 && monst.status[STATUS_IMMUNE_TO_FIRE] || isAlly && theBolt.boltEffect === BE_HEALING && !((monst.info.flags & MONST_REFLECT_50) >>> 0) && monst.currentHP >= monst.info.maxHP) {
      return false_;
    } else if (isEnemy && theBolt.boltEffect === BE_NEGATION) {
      return negationWillAffectMonster(monst, true_);
    } else if (isEnemy && theBolt.boltEffect === BE_TUNNELING && (monst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) {
      return true_;
    } else if (isAlly && (theBolt.flags & BF_TARGET_ALLIES) >>> 0 || isEnemy && (theBolt.flags & BF_TARGET_ENEMIES) >>> 0) {
      return true_;
    }
  } else if (magicPolarityIsKnown) {
    if (isEnemy && magicPolarityIsKnownBenevolent || isAlly && magicPolarityIsKnownMalevolent) {
      return true_;
    }
  } else if (isEnemy) {
    return true_;
  }
  return false_;
}

export async function nextTargetAfter(theItem: struct_item | null, returnLoc: struct_pos | null, targetLoc: struct_pos, targetMode: number, reverseDirection: number): Promise<number> {
  if (targetMode >>> 0 === AUTOTARGET_MODE_NONE) {
    return false_;
  }
  let selectedIndex = 0;
  let deduplicatedTargetList = $sarr(struct_pos, 34);
  let targetCount = 0;
  for (let i = 0; ROWS > i; ++i) {
    if (isPosInMap(G.rogue.sidebarLocationList[i])) {
      if (targetCount === 0 || !posEq(deduplicatedTargetList[targetCount - 1], G.rogue.sidebarLocationList[i])) {
        deduplicatedTargetList[targetCount].$cp(G.rogue.sidebarLocationList[i]);
        if (posEq(G.rogue.sidebarLocationList[i], targetLoc)) {
          selectedIndex = targetCount << 16 >> 16;
        }
        ++targetCount;
      }
    }
  }
  for (let i = reverseDirection ? targetCount - 1 : 0; reverseDirection ? i >= 0 ? 1 : 0 : targetCount > i ? 1 : 0; reverseDirection ? i-- : i++) {
    let n = (selectedIndex + i) % targetCount;
    let newLoc = struct_pos.$of(deduplicatedTargetList[n].x, deduplicatedTargetList[n].y).$clone();
    if ((!posEq(newLoc, G.player.loc) || posEq(newLoc, G.player.loc) && targetMode >>> 0 === AUTOTARGET_MODE_EXPLORE && await itemAtLoc(G.player.loc.$clone())) && !posEq(newLoc, targetLoc) && (targetMode >>> 0 === AUTOTARGET_MODE_EXPLORE || openPathBetween(G.player.loc.$clone(), newLoc.$clone()))) {
      ;
      ;
      let monst = monsterAtLoc(newLoc);
      if (monst && canAutoTargetMonster(monst, theItem, targetMode) || targetMode >>> 0 === AUTOTARGET_MODE_EXPLORE) {
        returnLoc.$cp(newLoc);
        return true_;
      }
    }
  }
  return false_;
}

async function hiliteTrajectory(coordinateList: struct_pos | null, numCells: number, eraseHiliting: number, theBolt: struct_bolt | null, hiliteColor: struct_color | null): Promise<number> {
  let x = 0;
  let y = 0;
  let i = 0;
  let monst = null;
  let isFiery = (theBolt && (theBolt.flags & BF_FIERY) >>> 0 ? 1 : 0) << 24 >> 24;
  let isTunneling = (theBolt && theBolt.boltEffect === BE_TUNNELING ? 1 : 0) << 24 >> 24;
  let passThroughMonsters = (theBolt && (theBolt.flags & BF_PASSES_THRU_CREATURES) >>> 0 ? 1 : 0) << 24 >> 24;
  for (i = 0; numCells > i; i = i + 1 << 16 >> 16) {
    x = $sadd(coordinateList, i).x;
    y = $sadd(coordinateList, i).y;
    if (eraseHiliting) {
      await refreshDungeonCell(struct_pos.$of(x, y));
    } else {
      await hiliteCell(x, y, hiliteColor, 20, true_);
    }
    if (!(($at2(G.pmap, x, y).flags & DISCOVERED) >>> 0)) {
      if (isTunneling) {
        continue;
      } else {
        break;
      }
    } else if (!passThroughMonsters && ($at2(G.pmap, x, y).flags & HAS_MONSTER) >>> 0 && (($at2(G.pmap, x, y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.player.status[STATUS_TELEPATHIC])) {
      monst = monsterAtLoc(struct_pos.$of(x, y));
      if (!((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0) && !monsterIsHidden(monst, G.player)) {
        i = i + 1 << 16 >> 16;
        break;
      }
    } else if (cellHasTerrainFlag(struct_pos.$of(x, y), T_IS_FLAMMABLE) && isFiery) {
      continue;
    } else if (isTunneling && cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY) && ($at2(G.pmap, x, y).flags & IMPREGNABLE) >>> 0 || !isTunneling && cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_VISION | T_OBSTRUCTS_PASSABILITY)) {
      i = i + 1 << 16 >> 16;
      break;
    }
  }
  return i;
}

export async function moveCursor(targetConfirmed: Ptr | null, canceled: Ptr | null, tabKey: Ptr | null, targetLoc: struct_pos | null, event: struct_rogueEvent | null, state: struct_buttonState | null, colorsDance: number, keysMoveCursor: number, targetCanLeaveMap: number): Promise<number> {
  const keystroke = new Float64Array(1);
  let moveIncrement = 0;
  let buttonInput = 0;
  let cursorMovementCommand = 0;
  let again = 0;
  let movementKeystroke = 0;
  let sidebarHighlighted = 0;
  let theEvent = new struct_rogueEvent();
  let oldRNG = 0;
  G.rogue.cursorLoc.$cp(targetLoc);
  targetConfirmed.a[targetConfirmed.o] = canceled.a[canceled.o] = tabKey.a[tabKey.o] = false_;
  sidebarHighlighted = false_;
  do {
    again = false_;
    cursorMovementCommand = false_;
    movementKeystroke = false_;
    oldRNG = G.rogue.RNG;
    G.rogue.RNG = RNG_COSMETIC;
    if (state) {
      let dbuf = new struct_screenDisplayBuffer();
      clearDisplayBuffer(dbuf);
      drawButtonsInState(state, dbuf);
      let rbuf = saveDisplayBuffer().$clone();
      overlayDisplayBuffer(dbuf);
      await nextBrogueEvent(theEvent, false_, colorsDance, true_);
      buttonInput = await processButtonInput(state, null, theEvent);
      if (buttonInput !== -1) {
        state.buttonDepressed = state.buttonFocused = -1;
      }
      restoreDisplayBuffer(rbuf);
    } else {
      await nextBrogueEvent(theEvent, false_, colorsDance, true_);
    }
    G.rogue.RNG = oldRNG;
    ;
    if (theEvent.eventType >>> 0 === MOUSE_UP || theEvent.eventType >>> 0 === MOUSE_ENTERED_CELL) {
      if (theEvent.param1 >= 0 && 0 + 20 + 1 > theEvent.param1 && theEvent.param2 >= 0 && ROWS - 1 > theEvent.param2 && isPosInMap(G.rogue.sidebarLocationList[theEvent.param2])) {
        G.rogue.cursorLoc.$cp(G.rogue.sidebarLocationList[theEvent.param2]);
        sidebarHighlighted = true_;
        cursorMovementCommand = true_;
        await refreshSideBar(G.rogue.cursorLoc.x, G.rogue.cursorLoc.y, false_);
        if (theEvent.eventType >>> 0 === MOUSE_UP) {
          targetConfirmed.a[targetConfirmed.o] = true_;
        }
      } else if (coordinatesAreInMap(theEvent.param1 - 20 - 1 << 16 >> 16, theEvent.param2 - 3 << 16 >> 16) || targetCanLeaveMap && theEvent.eventType >>> 0 !== MOUSE_UP) {
        if (theEvent.eventType >>> 0 === MOUSE_UP && !theEvent.shiftKey && (theEvent.controlKey || G.rogue.cursorLoc.x === theEvent.param1 - 20 - 1 && G.rogue.cursorLoc.y === theEvent.param2 - 3)) {
          targetConfirmed.a[targetConfirmed.o] = true_;
        }
        G.rogue.cursorLoc.x = theEvent.param1 - 20 - 1 << 16 >> 16;
        G.rogue.cursorLoc.y = theEvent.param2 - 3 << 16 >> 16;
        cursorMovementCommand = true_;
      } else {
        cursorMovementCommand = false_;
        again = (theEvent.eventType >>> 0 !== MOUSE_UP ? 1 : 0) << 24 >> 24;
      }
    } else if (theEvent.eventType >>> 0 === KEYSTROKE) {
      keystroke[0] = theEvent.param1;
      moveIncrement = (theEvent.controlKey || theEvent.shiftKey ? 5 : 1) << 16 >> 16;
      stripShiftFromMovementKeystroke(P(keystroke, 0));
      switch (keystroke[0]) {
      case 63234:
      case 104:
      case 52:
        if (keysMoveCursor && G.rogue.cursorLoc.x > 0) {
          G.rogue.cursorLoc.x = G.rogue.cursorLoc.x - moveIncrement << 16 >> 16;
        }
        cursorMovementCommand = movementKeystroke = keysMoveCursor;
        break;
      case 63235:
      case 108:
      case 54:
        if (keysMoveCursor && DCOLS - 1 > G.rogue.cursorLoc.x) {
          G.rogue.cursorLoc.x = G.rogue.cursorLoc.x + moveIncrement << 16 >> 16;
        }
        cursorMovementCommand = movementKeystroke = keysMoveCursor;
        break;
      case 63232:
      case 107:
      case 56:
        if (keysMoveCursor && G.rogue.cursorLoc.y > 0) {
          G.rogue.cursorLoc.y = G.rogue.cursorLoc.y - moveIncrement << 16 >> 16;
        }
        cursorMovementCommand = movementKeystroke = keysMoveCursor;
        break;
      case 63233:
      case 106:
      case 50:
        if (keysMoveCursor && DROWS - 1 > G.rogue.cursorLoc.y) {
          G.rogue.cursorLoc.y = G.rogue.cursorLoc.y + moveIncrement << 16 >> 16;
        }
        cursorMovementCommand = movementKeystroke = keysMoveCursor;
        break;
      case 121:
      case 55:
        if (keysMoveCursor && G.rogue.cursorLoc.x > 0 && G.rogue.cursorLoc.y > 0) {
          G.rogue.cursorLoc.x = G.rogue.cursorLoc.x - moveIncrement << 16 >> 16;
          G.rogue.cursorLoc.y = G.rogue.cursorLoc.y - moveIncrement << 16 >> 16;
        }
        cursorMovementCommand = movementKeystroke = keysMoveCursor;
        break;
      case 117:
      case 57:
        if (keysMoveCursor && DCOLS - 1 > G.rogue.cursorLoc.x && G.rogue.cursorLoc.y > 0) {
          G.rogue.cursorLoc.x = G.rogue.cursorLoc.x + moveIncrement << 16 >> 16;
          G.rogue.cursorLoc.y = G.rogue.cursorLoc.y - moveIncrement << 16 >> 16;
        }
        cursorMovementCommand = movementKeystroke = keysMoveCursor;
        break;
      case 98:
      case 49:
        if (keysMoveCursor && G.rogue.cursorLoc.x > 0 && DROWS - 1 > G.rogue.cursorLoc.y) {
          G.rogue.cursorLoc.x = G.rogue.cursorLoc.x - moveIncrement << 16 >> 16;
          G.rogue.cursorLoc.y = G.rogue.cursorLoc.y + moveIncrement << 16 >> 16;
        }
        cursorMovementCommand = movementKeystroke = keysMoveCursor;
        break;
      case 110:
      case 51:
        if (keysMoveCursor && DCOLS - 1 > G.rogue.cursorLoc.x && DROWS - 1 > G.rogue.cursorLoc.y) {
          G.rogue.cursorLoc.x = G.rogue.cursorLoc.x + moveIncrement << 16 >> 16;
          G.rogue.cursorLoc.y = G.rogue.cursorLoc.y + moveIncrement << 16 >> 16;
        }
        cursorMovementCommand = movementKeystroke = keysMoveCursor;
        break;
      case 9:
      case 25:
      case 48:
        tabKey.a[tabKey.o] = true_;
        break;
      case 10:
        targetConfirmed.a[targetConfirmed.o] = true_;
        break;
      case 27:
      case 32:
        canceled.a[canceled.o] = true_;
        break;
      default:
        break;
      }
    } else if (theEvent.eventType >>> 0 === RIGHT_MOUSE_UP) {
    } else {
      again = true_;
    }
    if (sidebarHighlighted && (!((pmapAt(G.rogue.cursorLoc).flags & (HAS_PLAYER | HAS_MONSTER)) >>> 0) || !canSeeMonster(monsterAtLoc(G.rogue.cursorLoc))) && (!((pmapAt(G.rogue.cursorLoc).flags & HAS_ITEM) >>> 0) || !(($at2(G.pmap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y).flags & DISCOVERED) >>> 0))) && (!cellHasTMFlag(G.rogue.cursorLoc, TM_LIST_IN_SIDEBAR) || !(($at2(G.pmap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, G.rogue.cursorLoc.x, G.rogue.cursorLoc.y).flags & DISCOVERED) >>> 0)))) {
      await refreshSideBar(-1, -1, false_);
      sidebarHighlighted = false_;
    }
    if (targetCanLeaveMap && !movementKeystroke) {
      G.rogue.cursorLoc.x = ((G.rogue.cursorLoc.x > -1 ? G.rogue.cursorLoc.x : -1) > 100 - 20 - 1 ? 100 - 20 - 1 : G.rogue.cursorLoc.x > -1 ? G.rogue.cursorLoc.x : -1) << 16 >> 16;
      G.rogue.cursorLoc.y = ((G.rogue.cursorLoc.y > -1 ? G.rogue.cursorLoc.y : -1) > 31 + 3 - 3 - 2 ? 31 + 3 - 3 - 2 : G.rogue.cursorLoc.y > -1 ? G.rogue.cursorLoc.y : -1) << 16 >> 16;
    } else {
      G.rogue.cursorLoc.x = ((G.rogue.cursorLoc.x > 0 ? G.rogue.cursorLoc.x : 0) > 100 - 20 - 1 - 1 ? 100 - 20 - 1 - 1 : G.rogue.cursorLoc.x > 0 ? G.rogue.cursorLoc.x : 0) << 16 >> 16;
      G.rogue.cursorLoc.y = ((G.rogue.cursorLoc.y > 0 ? G.rogue.cursorLoc.y : 0) > 31 + 3 - 3 - 2 - 1 ? 31 + 3 - 3 - 2 - 1 : G.rogue.cursorLoc.y > 0 ? G.rogue.cursorLoc.y : 0) << 16 >> 16;
    }
  } while (again && (!event || !cursorMovementCommand));
  if (event) {
    event.$cp(theEvent);
  }
  if (sidebarHighlighted) {
    await refreshSideBar(-1, -1, false_);
    sidebarHighlighted = false_;
  }
  targetLoc.$cp(G.rogue.cursorLoc);
  return (!cursorMovementCommand ? 1 : 0) << 24 >> 24;
}

async function pullMouseClickDuringPlayback(): Promise<struct_pos> {
  let theEvent = new struct_rogueEvent();
  ;
  await nextBrogueEvent(theEvent, false_, false_, false_);
  return struct_pos.$of(theEvent.param1 - 20 - 1 << 16 >> 16, theEvent.param2 - 3 << 16 >> 16);
}

export async function chooseTarget(returnLoc: struct_pos | null, maxDistance: number, targetMode: number, theItem: struct_item | null): Promise<number> {
  let numCells = 0;
  let i = 0;
  let distance = 0;
  let coordinates = $sarr(struct_pos, 79);
  let monst = null;
  const canceled = new Int8Array(1);
  const targetConfirmed = new Int8Array(1);
  const tabKey = new Int8Array(1);
  let cursorInTrajectory = 0;
  let focusedOnSomething = false_;
  let event = struct_rogueEvent.$of();
  let oldRNG = 0;
  let stopAtTarget = (targetMode >>> 0 === AUTOTARGET_MODE_THROW ? 1 : 0) << 24 >> 24;
  let trajColor = new struct_color();
  let theBolt = new struct_bolt();
  if (theItem && targetMode >>> 0 === AUTOTARGET_MODE_USE_STAFF_OR_WAND && (theItem.category === STAFF || theItem.category === WAND)) {
    if ($sadd(tableForItemCategory(theItem.category), theItem.kind).identified) {
      theBolt.$cp($sadd(G.boltCatalog, boltForItem(theItem)));
      trajColor.$cp(!theBolt.backColor ? G.red : theBolt.backColor);
    } else {
      trajColor.$cp(G.gray);
    }
  } else if (theItem && targetMode >>> 0 === AUTOTARGET_MODE_THROW) {
    trajColor.$cp(G.red);
  } else {
    trajColor.$cp(G.white);
    theBolt.$cp($sadd(G.boltCatalog, BOLT_NONE));
  }
  normColor(trajColor, 100, 10);
  if (G.rogue.playbackMode) {
    returnLoc.$cp(await pullMouseClickDuringPlayback());
    G.rogue.cursorLoc.$cp(struct_pos.$of(-1, -1));
    return true_;
  }
  oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  let originLoc = G.player.loc.$clone();
  let oldTargetLoc = G.player.loc.$clone();
  let targetLoc = G.player.loc.$clone();
  let newLoc = new struct_pos();
  if (theItem && (targetMode >>> 0 === AUTOTARGET_MODE_USE_STAFF_OR_WAND || targetMode >>> 0 === AUTOTARGET_MODE_THROW)) {
    if (canAutoTargetMonster(G.rogue.lastTarget, theItem, targetMode)) {
      monst = G.rogue.lastTarget;
    } else {
      if (await nextTargetAfter(theItem, newLoc, targetLoc.$clone(), targetMode, false_)) {
        targetLoc.$cp(newLoc);
      }
      monst = monsterAtLoc(targetLoc);
    }
    if (monst) {
      targetLoc.$cp(monst.loc);
      await refreshSideBar(monst.loc.x, monst.loc.y, false_);
      focusedOnSomething = true_;
    }
  }
  numCells = getLineCoordinates(coordinates[0], originLoc.$clone(), targetLoc.$clone(), theBolt);
  if (maxDistance > 0) {
    numCells = (maxDistance > numCells ? numCells : maxDistance) << 16 >> 16;
  }
  if (stopAtTarget) {
    numCells = (numCells < distanceBetween(G.player.loc, targetLoc) ? numCells : distanceBetween(G.player.loc, targetLoc)) << 16 >> 16;
  }
  targetConfirmed[0] = canceled[0] = tabKey[0] = false_;
  do {
    await printLocationDescription(targetLoc.x, targetLoc.y);
    if (canceled[0]) {
      await refreshDungeonCell(oldTargetLoc.$clone());
      await hiliteTrajectory(coordinates[0], numCells, true_, theBolt, trajColor);
      confirmMessages();
      G.rogue.cursorLoc.$cp(struct_pos.$of(-1, -1));
      G.rogue.RNG = oldRNG;
      ;
      return false_;
    }
    if (tabKey[0]) {
      if (await nextTargetAfter(theItem, newLoc, targetLoc.$clone(), targetMode, event.shiftKey)) {
        targetLoc.$cp(newLoc);
      }
    }
    monst = monsterAtLoc(targetLoc);
    if (!!monst && monst !== G.player && canSeeMonster(monst)) {
      focusedOnSomething = true_;
    } else if ((($at2(G.pmap, targetLoc.x, targetLoc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, targetLoc.x, targetLoc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, targetLoc.x, targetLoc.y).flags & DISCOVERED) >>> 0)) && (pmapAt(targetLoc).flags & HAS_ITEM) >>> 0 || cellHasTMFlag(targetLoc, TM_LIST_IN_SIDEBAR)) {
      focusedOnSomething = true_;
    } else if (focusedOnSomething) {
      await refreshSideBar(-1, -1, false_);
      focusedOnSomething = false_;
    }
    if (focusedOnSomething) {
      await refreshSideBar(targetLoc.x, targetLoc.y, false_);
    }
    await refreshDungeonCell(oldTargetLoc.$clone());
    await hiliteTrajectory(coordinates[0], numCells, true_, theBolt, trajColor);
    if (!targetConfirmed[0]) {
      numCells = getLineCoordinates(coordinates[0], originLoc.$clone(), targetLoc.$clone(), theBolt);
      if (maxDistance > 0) {
        numCells = (maxDistance > numCells ? numCells : maxDistance) << 16 >> 16;
      }
      if (stopAtTarget) {
        numCells = (numCells < distanceBetween(G.player.loc, targetLoc) ? numCells : distanceBetween(G.player.loc, targetLoc)) << 16 >> 16;
      }
      distance = await hiliteTrajectory(coordinates[0], numCells, false_, theBolt, trajColor);
      cursorInTrajectory = false_;
      for (i = 0; distance > i; i = i + 1 << 16 >> 16) {
        if (coordinates[i].x === targetLoc.x && coordinates[i].y === targetLoc.y) {
          cursorInTrajectory = true_;
          break;
        }
      }
      await hiliteCell(targetLoc.x, targetLoc.y, G.white, (cursorInTrajectory ? 100 : 35) << 16 >> 16, true_);
    }
    oldTargetLoc.$cp(targetLoc);
    await moveCursor(P(targetConfirmed, 0), P(canceled, 0), P(tabKey, 0), targetLoc, event, null, false_, true_, false_);
    if (event.eventType >>> 0 === RIGHT_MOUSE_UP) {
      canceled[0] = true_;
    }
  } while (!targetConfirmed[0]);
  if (maxDistance > 0) {
    numCells = (maxDistance > numCells ? numCells : maxDistance) << 16 >> 16;
  }
  await hiliteTrajectory(coordinates[0], numCells, true_, theBolt, trajColor);
  await refreshDungeonCell(oldTargetLoc.$clone());
  if (posEq(originLoc, targetLoc)) {
    confirmMessages();
    G.rogue.RNG = oldRNG;
    ;
    G.rogue.cursorLoc.$cp(struct_pos.$of(-1, -1));
    return false_;
  }
  monst = monsterAtLoc(targetLoc);
  if (monst && monst !== G.player && canSeeMonster(monst)) {
    G.rogue.lastTarget = monst;
  }
  returnLoc.$cp(targetLoc);
  G.rogue.RNG = oldRNG;
  ;
  G.rogue.cursorLoc.$cp(struct_pos.$of(-1, -1));
  return true_;
}

export function itemKindCount(category: number, polarityConstraint: number): number {
  let kindCount = -1;
  let totalKinds = 0;
  let goodKinds = 0;
  switch (category >>> 0) {
  case SCROLL:
    totalKinds = G.gameConst.numberScrollKinds;
    goodKinds = G.gameConst.numberGoodScrollKinds;
    break;
  case POTION:
    totalKinds = G.gameConst.numberPotionKinds;
    goodKinds = G.gameConst.numberGoodPotionKinds;
    break;
  case WAND:
    totalKinds = G.gameConst.numberWandKinds;
    goodKinds = G.gameConst.numberGoodWandKinds;
    break;
  case STAFF:
    totalKinds = NUMBER_STAFF_KINDS;
    goodKinds = NUMBER_GOOD_STAFF_KINDS;
    break;
  case FOOD:
    totalKinds = NUMBER_FOOD_KINDS;
    goodKinds = 0;
    break;
  case WEAPON:
    totalKinds = NUMBER_WEAPON_KINDS;
    goodKinds = 0;
    break;
  case ARMOR:
    totalKinds = NUMBER_ARMOR_KINDS;
    goodKinds = 0;
    break;
  case RING:
    totalKinds = NUMBER_RING_KINDS;
    goodKinds = NUMBER_RING_KINDS;
    break;
  case CHARM:
    totalKinds = G.gameConst.numberCharmKinds;
    goodKinds = G.gameConst.numberCharmKinds;
    break;
  default:
    totalKinds = 0;
    goodKinds = 0;
    break;
  }
  switch (polarityConstraint) {
  case -1:
    if (goodKinds === 0) {
      kindCount = 0;
    } else {
      kindCount = totalKinds - goodKinds;
    }
    break;
  case 1:
    kindCount = goodKinds;
    break;
  default:
    kindCount = totalKinds;
    break;
  }
  return kindCount;
}

function tryGetLastUnidentifiedItemKind(category: number, polarityConstraint: number): number {
  let lastItemKind = -1;
  let totalItemKinds = itemKindCount(category, 0);
  let theItemTable = tableForItemCategory(category);
  if (theItemTable && totalItemKinds > 0) {
    for (let i = 0; totalItemKinds > i; ++i) {
      if (!$sadd(theItemTable, i).identified && ($sadd(theItemTable, i).magicPolarity === polarityConstraint || polarityConstraint === MAGIC_POLARITY_ANY)) {
        if (lastItemKind !== -1) {
          return -1;
        }
        lastItemKind = i;
      }
    }
  }
  return lastItemKind;
}

function magicPolarityRevealedItemKindCount(category: number, polarityConstraint: number): number {
  let kindCount = -1;
  let totalItemKinds = itemKindCount(category, 0);
  let theItemTable = tableForItemCategory(category);
  if (theItemTable && totalItemKinds > 0 && polarityConstraint) {
    kindCount = 0;
    for (let i = 0; totalItemKinds > i; ++i) {
      if ($sadd(theItemTable, i).magicPolarity === polarityConstraint && ($sadd(theItemTable, i).identified || $sadd(theItemTable, i).magicPolarityRevealed)) {
        kindCount += 1;
      }
    }
  }
  return kindCount;
}

function tryIdentifyLastItemKind(category: number, polarityConstraint: number): void {
  let theItemTable = tableForItemCategory(category);
  let lastItemKind = tryGetLastUnidentifiedItemKind(category, polarityConstraint);
  let oppositeCount = 0;
  let oppositeRevealedCount = 0;
  if (lastItemKind >= 0) {
    if (polarityConstraint === MAGIC_POLARITY_ANY) {
      $sadd(theItemTable, lastItemKind).identified = true_;
    } else {
      let oppositeMagicPolarity = polarityConstraint * -1;
      oppositeRevealedCount = magicPolarityRevealedItemKindCount(category, oppositeMagicPolarity);
      oppositeCount = itemKindCount(category, oppositeMagicPolarity);
      if ($sadd(theItemTable, lastItemKind).magicPolarityRevealed || oppositeRevealedCount === oppositeCount) {
        $sadd(theItemTable, lastItemKind).identified = true_;
      }
    }
  }
}

function tryIdentifyLastItemKinds(category: number): void {
  let loopCategory = 0;
  let categoryCount = 1;
  if (category >>> 0 === HAS_INTRINSIC_POLARITY) {
    categoryCount = NUMBER_ITEM_CATEGORIES;
  }
  for (let i = 0; categoryCount > i; ++i) {
    loopCategory = (categoryCount === 1 ? $u64(category) : $shl64(1, i)) | 0;
    if (((category >>> 0 & HAS_INTRINSIC_POLARITY) >>> 0 & loopCategory >>> 0) >>> 0) {
      tryIdentifyLastItemKind(loopCategory, MAGIC_POLARITY_BENEVOLENT);
      tryIdentifyLastItemKind(loopCategory, MAGIC_POLARITY_MALEVOLENT);
    }
  }
}

export function identifyItemKind(theItem: struct_item | null): void {
  let theTable = null;
  let tableCount = 0;
  theTable = tableForItemCategory(theItem.category);
  if (theTable) {
    theItem.flags = (theItem.flags & ~ITEM_KIND_AUTO_ID >>> 0) >>> 0;
    tableCount = 0;
    switch (theItem.category) {
    case SCROLL:
      tableCount = G.gameConst.numberScrollKinds << 16 >> 16;
      break;
    case POTION:
      tableCount = G.gameConst.numberPotionKinds << 16 >> 16;
      break;
    case WAND:
      tableCount = G.gameConst.numberWandKinds << 16 >> 16;
      break;
    case STAFF:
      tableCount = NUMBER_STAFF_KINDS;
      break;
    case RING:
      tableCount = NUMBER_RING_KINDS;
      break;
    default:
      break;
    }
    if (theItem.category & RING && 0 >= theItem.enchant1) {
      theItem.flags = (theItem.flags | ITEM_IDENTIFIED) >>> 0;
    }
    if (theItem.category & WAND && $sadd(theTable, theItem.kind).range.lowerBound === $sadd(theTable, theItem.kind).range.upperBound) {
      theItem.flags = (theItem.flags | ITEM_IDENTIFIED) >>> 0;
    }
    if (tableCount) {
      $sadd(theTable, theItem.kind).identified = true_;
      tryIdentifyLastItemKinds(theItem.category);
    }
  }
}

export async function autoIdentify(theItem: struct_item | null): Promise<void> {
  let quantityBackup = 0;
  let buf = new Int8Array(300);
  let oldName = new Int8Array(300);
  let newName = new Int8Array(300);
  if (tableForItemCategory(theItem.category) && !$sadd(tableForItemCategory(theItem.category), theItem.kind).identified) {
    identifyItemKind(theItem);
    quantityBackup = theItem.quantity;
    theItem.quantity = 1;
    itemName(theItem, P(newName), false_, true_, null);
    theItem.quantity = quantityBackup;
    sprintf(P(buf), S("(It must %s %s.)"), theItem.category & (POTION | SCROLL) ? S("have been") : S("be"), P(newName));
    await messageWithColor(P(buf), G.itemMessageColor, 0);
  }
  if (theItem.category & (WEAPON | ARMOR) && (theItem.flags & ITEM_RUNIC) >>> 0 && !((theItem.flags & ITEM_RUNIC_IDENTIFIED) >>> 0)) {
    itemName(theItem, P(oldName), false_, false_, null);
    theItem.flags = (theItem.flags | (ITEM_RUNIC_IDENTIFIED | ITEM_RUNIC_HINTED)) >>> 0;
    itemName(theItem, P(newName), true_, true_, null);
    sprintf(P(buf), S("(Your %s must be %s.)"), P(oldName), P(newName));
    await messageWithColor(P(buf), G.itemMessageColor, 0);
  }
}

async function hitMonsterWithProjectileWeapon(thrower: struct_creature | null, monst: struct_creature | null, theItem: struct_item | null): Promise<number> {
  let buf = new Int8Array(79);
  let theItemName = new Int8Array(79);
  let targetName = new Int8Array(79);
  let armorRunicString = new Int8Array(79);
  let thrownWeaponHit = 0;
  let equippedWeapon = null;
  const damage = new Int16Array(1);
  if (!(theItem.category & WEAPON)) {
    return false_;
  }
  if (thrower === G.player && !((monst.info.flags & MONST_IMMUNE_TO_WEAPONS) >>> 0)) {
    handlePaladinFeat(monst);
  }
  armorRunicString[0] = 0;
  itemName(theItem, P(theItemName), false_, false_, null);
  monsterName(P(targetName), monst, true_);
  monst.status[STATUS_ENTRANCED] = 0;
  if (monst !== G.player && monst.creatureMode >>> 0 !== MODE_PERM_FLEEING && (monst.creatureState >>> 0 !== MONSTER_FLEEING || monst.status[STATUS_MAGICAL_FEAR]) && !((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) && monst.creatureState >>> 0 !== MONSTER_ALLY) {
    monst.creatureState = MONSTER_TRACKING_SCENT;
    if (monst.status[STATUS_MAGICAL_FEAR]) {
      monst.status[STATUS_MAGICAL_FEAR] = 1;
    }
  }
  if (thrower === G.player) {
    equippedWeapon = G.rogue.weapon;
    await equipItem(theItem, true_, null);
    thrownWeaponHit = attackHit(G.player, monst);
    if (equippedWeapon) {
      await equipItem(equippedWeapon, true_, null);
    } else {
      await unequipItem(theItem, true_);
    }
  } else {
    thrownWeaponHit = attackHit(thrower, monst);
  }
  if (thrownWeaponHit) {
    damage[0] = ((monst.info.flags & (MONST_IMMUNE_TO_WEAPONS | MONST_INVULNERABLE)) >>> 0 ? 0 : Math.trunc($mul64(randClump(theItem.damage), damageFraction(netEnchant(theItem))) / FP_FACTOR)) << 16 >> 16;
    if (monst === G.player) {
      await applyArmorRunicEffect(P(armorRunicString), thrower, P(damage, 0), false_);
    }
    if (await inflictDamage(thrower, monst, damage[0], G.red, false_)) {
      sprintf(P(buf), S("the %s %s %s."), P(theItemName), (monst.info.flags & MONST_INANIMATE) >>> 0 ? S("destroyed") : S("killed"), P(targetName));
      await messageWithColor(P(buf), messageColorFromVictim(monst), 0);
      await killCreature(monst, false_);
    } else {
      sprintf(P(buf), S("the %s hit %s."), P(theItemName), P(targetName));
      if ((theItem.flags & ITEM_RUNIC) >>> 0) {
        await magicWeaponHit(monst, theItem, false_);
      }
      await messageWithColor(P(buf), messageColorFromVictim(monst), 0);
    }
    moralAttack(thrower, monst);
    await splitMonster(monst, thrower);
    if (armorRunicString[0]) {
      await message(P(armorRunicString), 0);
    }
    return true_;
  } else {
    theItem.flags = (theItem.flags & ~ITEM_PLAYER_AVOIDS >>> 0) >>> 0;
    sprintf(P(buf), S("the %s missed %s."), P(theItemName), P(targetName));
    await message(P(buf), 0);
    return false_;
  }
}

async function throwItem(theItem: struct_item | null, thrower: struct_creature | null, targetLoc: struct_pos, maxDistance: number): Promise<void> {
  let i = 0;
  let numCells = 0;
  let monst = null;
  let buf = new Int8Array(300);
  let buf2 = new Int8Array(300);
  let buf3 = new Int8Array(300);
  const displayChar = new Int32Array(1);
  let foreColor = new struct_color();
  let backColor = new struct_color();
  let multColor = new struct_color();
  let hitSomethingSolid = false_;
  let fastForward = false_;
  let layer = 0;
  theItem.flags = (theItem.flags | ITEM_PLAYER_AVOIDS) >>> 0;
  let originLoc = thrower.loc.$clone();
  let x = originLoc.x;
  let y = originLoc.y;
  let listOfCoordinates = $sarr(struct_pos, 790);
  numCells = getLineCoordinates(listOfCoordinates[0], originLoc.$clone(), targetLoc.$clone(), $sadd(G.boltCatalog, BOLT_NONE));
  thrower.ticksUntilTurn = thrower.attackSpeed;
  if (thrower !== G.player && (pmapAt(originLoc).flags & IN_FIELD_OF_VIEW) >>> 0) {
    monsterName(P(buf2), thrower, true_);
    itemName(theItem, P(buf3), false_, true_, null);
    sprintf(P(buf), S("%s hurls %s."), P(buf2), P(buf3));
    await message(P(buf), 0);
  }
  for (i = 0; numCells > i && maxDistance > i; i = i + 1 << 16 >> 16) {
    x = listOfCoordinates[i].x;
    y = listOfCoordinates[i].y;
    if (($at2(G.pmap, x, y).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0) {
      monst = monsterAtLoc(struct_pos.$of(x, y));
      if (!((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
        if (theItem.category & WEAPON && theItem.kind !== INCENDIARY_DART && await hitMonsterWithProjectileWeapon(thrower, monst, theItem)) {
          deleteItem(theItem);
          return;
        }
        break;
      }
    }
    if (cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY | T_OBSTRUCTS_VISION)) {
      if (theItem.category & WEAPON && theItem.kind === INCENDIARY_DART && (cellHasTerrainFlag(struct_pos.$of(x, y), T_IS_FLAMMABLE) || ($at2(G.pmap, x, y).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0)) {
      } else if (cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY) && cellHasTMFlag(struct_pos.$of(x, y), TM_PROMOTES_ON_PLAYER_ENTRY) && (G.tileCatalog[$at2(G.pmap, x, y).layers[layerWithTMFlag(x, y, TM_PROMOTES_ON_PLAYER_ENTRY)]].flags & T_OBSTRUCTS_PASSABILITY) >>> 0) {
        layer = layerWithTMFlag(x, y, TM_PROMOTES_ON_PLAYER_ENTRY);
        if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].flags & T_OBSTRUCTS_PASSABILITY) >>> 0) {
          await message(P(G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].flavorText), 0);
          await promoteTile(x, y, layer, false_);
        }
      } else {
        i = i - 1 << 16 >> 16;
        if (i >= 0) {
          x = listOfCoordinates[i].x;
          y = listOfCoordinates[i].y;
        } else {
          x = thrower.loc.x;
          y = thrower.loc.y;
        }
      }
      hitSomethingSolid = true_;
      break;
    }
    if (($at2(G.pmap, x, y).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
      await getCellAppearance(struct_pos.$of(x, y), P(displayChar, 0), foreColor, backColor);
      foreColor.$cp(theItem.foreColor);
      if (($at2(G.pmap, x, y).flags & VISIBLE) >>> 0) {
        colorMultiplierFromDungeonLight(x, y, multColor);
        applyColorMultiplier(foreColor, multColor);
      } else {
        applyColorMultiplier(foreColor, G.clairvoyanceColor);
      }
      plotCharWithColor(theItem.displayChar, mapToWindow(struct_pos.$of(x, y)), foreColor, backColor);
      if (!fastForward) {
        fastForward = (G.rogue.playbackFastForward || await pauseAnimation(25, struct_PauseBehavior.$of()) ? 1 : 0) << 24 >> 24;
      }
      await refreshDungeonCell(struct_pos.$of(x, y));
    }
    if (x === targetLoc.x && y === targetLoc.y) {
      break;
    }
  }
  if (theItem.category & POTION && (hitSomethingSolid || !cellHasTerrainFlag(struct_pos.$of(x, y), T_AUTO_DESCENT))) {
    if (theItem.kind === POTION_CONFUSION || theItem.kind === POTION_POISON || theItem.kind === POTION_PARALYSIS || theItem.kind === POTION_INCINERATION || theItem.kind === POTION_DARKNESS || theItem.kind === POTION_LICHEN || theItem.kind === POTION_DESCENT) {
      switch (theItem.kind) {
      case POTION_POISON:
        strcpy(P(buf), S("the flask shatters and a deadly purple cloud billows out!"));
        await spawnDungeonFeature(x, y, G.dungeonFeatureCatalog[DF_POISON_GAS_CLOUD_POTION], true_, false_);
        await message(P(buf), 0);
        break;
      case POTION_CONFUSION:
        strcpy(P(buf), S("the flask shatters and a multi-hued cloud billows out!"));
        await spawnDungeonFeature(x, y, G.dungeonFeatureCatalog[DF_CONFUSION_GAS_CLOUD_POTION], true_, false_);
        await message(P(buf), 0);
        break;
      case POTION_PARALYSIS:
        strcpy(P(buf), S("the flask shatters and a cloud of pink gas billows out!"));
        await spawnDungeonFeature(x, y, G.dungeonFeatureCatalog[DF_PARALYSIS_GAS_CLOUD_POTION], true_, false_);
        await message(P(buf), 0);
        break;
      case POTION_INCINERATION:
        strcpy(P(buf), S("the flask shatters and its contents burst violently into flame!"));
        await message(P(buf), 0);
        await spawnDungeonFeature(x, y, G.dungeonFeatureCatalog[DF_INCINERATION_POTION], true_, false_);
        break;
      case POTION_DARKNESS:
        strcpy(P(buf), S("the flask shatters and the lights in the area start fading."));
        await spawnDungeonFeature(x, y, G.dungeonFeatureCatalog[DF_DARKNESS_POTION], true_, false_);
        await message(P(buf), 0);
        break;
      case POTION_DESCENT:
        strcpy(P(buf), S("as the flask shatters, the ground vanishes!"));
        await message(P(buf), 0);
        await spawnDungeonFeature(x, y, G.dungeonFeatureCatalog[DF_HOLE_POTION], true_, false_);
        break;
      case POTION_LICHEN:
        strcpy(P(buf), S("the flask shatters and deadly spores spill out!"));
        await message(P(buf), 0);
        await spawnDungeonFeature(x, y, G.dungeonFeatureCatalog[DF_LICHEN_PLANTED], true_, false_);
        break;
      }
      await autoIdentify(theItem);
      await refreshDungeonCell(struct_pos.$of(x, y));
    } else {
      if (cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY)) {
        strcpy(P(buf2), S("against"));
      } else if ((G.tileCatalog[$at2(G.pmap, x, y).layers[highestPriorityLayer(x, y, false_)]].mechFlags & TM_STAND_IN_TILE) >>> 0) {
        strcpy(P(buf2), S("into"));
      } else {
        strcpy(P(buf2), S("on"));
      }
      sprintf(P(buf), S("the flask shatters and %s liquid splashes harmlessly %s %s."), $sadd(G.potionTable, theItem.kind).flavor, P(buf2), tileText(x, y));
      await message(P(buf), 0);
      if (theItem.kind === POTION_HALLUCINATION) {
        if ((theItem.flags & ITEM_MAGIC_DETECTED) >>> 0 || magicPolarityRevealedItemKindCount(theItem.category, 1) === G.gameConst.numberGoodPotionKinds) {
          await autoIdentify(theItem);
        }
      }
    }
    deleteItem(theItem);
    return;
  }
  if (theItem.category & WEAPON && theItem.kind === INCENDIARY_DART) {
    await spawnDungeonFeature(x, y, G.dungeonFeatureCatalog[DF_DART_EXPLOSION], true_, false_);
    if (($at2(G.pmap, x, y).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0) {
      await exposeCreatureToFire(monsterAtLoc(struct_pos.$of(x, y)));
    }
    deleteItem(theItem);
    return;
  }
  let dropLoc = new struct_pos();
  getQualifyingLocNear(dropLoc, struct_pos.$of(x, y), true_, null, T_OBSTRUCTS_ITEMS | T_OBSTRUCTS_PASSABILITY, HAS_ITEM, false_, false_);
  await placeItemAt(theItem, dropLoc.$clone());
  await refreshDungeonCell(dropLoc.$clone());
}

export async function throwCommand(theItem: struct_item | null, autoThrow: number): Promise<void> {
  let thrownItem = null;
  let buf = new Int8Array(100);
  let theName = new Int8Array(100);
  let command = new Uint8Array(10);
  let maxDistance = 0;
  let quantity = 0;
  command[0] = THROW_KEY;
  if (!theItem) {
    theItem = await promptForItemOfType(ALL_ITEMS, 0, 0, KEYBOARD_LABELS ? S("Throw what? (a-z, shift for more info; or <esc> to cancel)") : S("Throw what?"), true_);
  }
  if (!theItem) {
    return;
  }
  quantity = theItem.quantity;
  theItem.quantity = 1;
  itemName(theItem, P(theName), false_, false_, null);
  theItem.quantity = quantity;
  command[1] = theItem.inventoryLetter & 0xff;
  confirmMessages();
  if (((theItem.flags & ITEM_EQUIPPED) >>> 0 || theItem.timesEnchanted > 0) && 1 >= theItem.quantity) {
    sprintf(P(buf), S("Are you sure you want to throw your %s?"), P(theName));
    if (!await confirm(P(buf), false_)) {
      return;
    }
    if ((theItem.flags & ITEM_CURSED) >>> 0) {
      sprintf(P(buf), S("You cannot unequip your %s; it appears to be cursed."), P(theName));
      await messageWithColor(P(buf), G.itemMessageColor, 0);
      return;
    }
  }
  sprintf(P(buf), S("Throw %s %s where? (<hjklyubn>, mouse, or <tab>)"), theItem.quantity > 1 ? S("a") : S("your"), P(theName));
  await temporaryMessage(P(buf), REFRESH_SIDEBAR);
  maxDistance = 12 + 2 * (G.rogue.strength - G.player.weaknessAmount - 12 > 2 ? G.rogue.strength - G.player.weaknessAmount - 12 : 2) << 16 >> 16;
  let zapTarget = new struct_pos();
  if (autoThrow && canAutoTargetMonster(G.rogue.lastTarget, theItem, AUTOTARGET_MODE_THROW)) {
    zapTarget.$cp(G.rogue.lastTarget.loc);
  } else if (!await chooseTarget(zapTarget, maxDistance, AUTOTARGET_MODE_THROW, theItem)) {
    return;
  }
  if ((theItem.flags & ITEM_EQUIPPED) >>> 0 && 1 >= theItem.quantity) {
    await unequipItem(theItem, false_);
  }
  command[2] = 0;
  recordKeystrokeSequence(P(command));
  recordMouseClick(zapTarget.x + 20 + 1 << 16 >> 16, zapTarget.y + 3 << 16 >> 16, true_, false_);
  confirmMessages();
  thrownItem = await generateItem(ALL_ITEMS, -1);
  thrownItem.$cp(theItem);
  thrownItem.flags = (thrownItem.flags & ~ITEM_EQUIPPED >>> 0) >>> 0;
  thrownItem.quantity = 1;
  itemName(thrownItem, P(theName), false_, false_, null);
  await throwItem(thrownItem, G.player, zapTarget.$clone(), maxDistance);
  if (theItem.quantity > 1) {
    theItem.quantity = theItem.quantity - 1 << 16 >> 16;
    G.rogue.lastItemThrown = theItem;
  } else {
    G.rogue.lastItemThrown = null;
    if (G.rogue.swappedIn === theItem || G.rogue.swappedOut === theItem) {
      G.rogue.swappedIn = null;
      G.rogue.swappedOut = null;
    }
    removeItemFromChain(theItem, G.packItems);
    deleteItem(theItem);
  }
  await playerTurnEnded();
}

export async function relabel(theItem: struct_item | null): Promise<void> {
  let oldItem = null;
  let buf = new Int8Array(300);
  let theName = new Int8Array(100);
  let newLabel = 0;
  let command = new Uint8Array(10);
  if (!KEYBOARD_LABELS && !G.rogue.playbackMode) {
    return;
  }
  if (!theItem) {
    theItem = await promptForItemOfType(ALL_ITEMS, 0, 0, KEYBOARD_LABELS ? S("Relabel what? (a-z, shift for more info; or <esc> to cancel)") : S("Relabel what?"), true_);
  }
  if (!theItem) {
    return;
  }
  await temporaryMessage(S("New letter? (a-z)"), 0);
  newLabel = 0;
  do {
    newLabel = await nextKeyPress(true_);
  } while (!newLabel);
  if (newLabel >= 65 && 90 >= newLabel) {
    newLabel = newLabel + (97 - 65) << 24 >> 24;
  }
  if (newLabel >= 97 && 122 >= newLabel) {
    if (newLabel !== theItem.inventoryLetter) {
      command[0] = RELABEL_KEY;
      command[1] = theItem.inventoryLetter & 0xff;
      command[2] = newLabel & 0xff;
      command[3] = 0;
      recordKeystrokeSequence(P(command));
      oldItem = itemOfPackLetter(newLabel);
      if (oldItem) {
        oldItem.inventoryLetter = theItem.inventoryLetter;
        itemName(oldItem, P(theName), true_, true_, null);
        sprintf(P(buf), S("Relabeled %s as (%c);"), P(theName), oldItem.inventoryLetter);
        await messageWithColor(P(buf), G.itemMessageColor, 0);
      }
      theItem.inventoryLetter = newLabel;
      itemName(theItem, P(theName), true_, true_, null);
      sprintf(P(buf), S("%selabeled %s as (%c)."), oldItem ? S(" r") : S("R"), P(theName), newLabel);
      await messageWithColor(P(buf), G.itemMessageColor, 0);
    } else {
      itemName(theItem, P(theName), true_, true_, null);
      sprintf(P(buf), S("%s %s already labeled (%c)."), P(theName), theItem.quantity === 1 ? S("is") : S("are"), theItem.inventoryLetter);
      await messageWithColor(P(buf), G.itemMessageColor, 0);
    }
  }
}

export async function swapLastEquipment(): Promise<void> {
  let theItem = null;
  let command = new Uint8Array(10);
  if (!G.rogue.swappedIn || !G.rogue.swappedOut) {
    confirmMessages();
    await message(S("You have nothing to swap."), 0);
    return;
  }
  if (!await equipItem(G.rogue.swappedOut, false_, G.rogue.swappedIn)) {
    return;
  }
  command[0] = SWAP_KEY;
  command[1] = 0;
  recordKeystrokeSequence(P(command));
  theItem = G.rogue.swappedIn;
  G.rogue.swappedIn = G.rogue.swappedOut;
  G.rogue.swappedOut = theItem;
  await playerTurnEnded();
}

async function playerCancelsBlinking(originLoc: struct_pos, targetLoc: struct_pos, maxDistance: number): Promise<number> {
  let numCells = 0;
  let i = 0;
  let x = 0;
  let y = 0;
  let certainDeath = false_;
  let possibleDeath = false_;
  const tFlags = new Float64Array(1);
  const tmFlags = new Float64Array(1);
  if (G.rogue.playbackMode) {
    return false_;
  }
  if (G.player.status[STATUS_IMMUNE_TO_FIRE] || G.player.status[STATUS_LEVITATING]) {
    return false_;
  }
  let impactLoc = new struct_pos();
  getImpactLoc(impactLoc, originLoc.$clone(), targetLoc.$clone(), (maxDistance > 0 ? maxDistance : DCOLS) << 16 >> 16, true_, $sadd(G.boltCatalog, BOLT_BLINKING));
  getLocationFlags(impactLoc.x, impactLoc.y, P(tFlags, 0), P(tmFlags, 0), null, true_);
  if (maxDistance > 0) {
    if ((pmapAt(impactLoc).flags & DISCOVERED) >>> 0 && (tFlags[0] & T_LAVA_INSTA_DEATH) >>> 0 && !((tFlags[0] & (T_ENTANGLES | T_AUTO_DESCENT)) >>> 0) && !((tmFlags[0] & TM_EXTINGUISHES_FIRE) >>> 0)) {
      certainDeath = possibleDeath = true_;
    }
  } else {
    certainDeath = true_;
    let coordinates = $sarr(struct_pos, 79);
    numCells = getLineCoordinates(coordinates[0], originLoc.$clone(), targetLoc.$clone(), $sadd(G.boltCatalog, BOLT_BLINKING));
    for (i = 0; numCells > i; i = i + 1 << 16 >> 16) {
      x = coordinates[i].x;
      y = coordinates[i].y;
      if (($at2(G.pmap, x, y).flags & DISCOVERED) >>> 0) {
        getLocationFlags(x, y, P(tFlags, 0), null, null, true_);
        if ((tFlags[0] & T_LAVA_INSTA_DEATH) >>> 0 && !((tFlags[0] & (T_ENTANGLES | T_AUTO_DESCENT)) >>> 0) && !((tmFlags[0] & TM_EXTINGUISHES_FIRE) >>> 0)) {
          possibleDeath = true_;
        } else if (i >= staffBlinkDistance(131072) - 1) {
          certainDeath = false_;
        }
      }
      if (x === impactLoc.x && y === impactLoc.y) {
        break;
      }
    }
  }
  if (possibleDeath && certainDeath) {
    await message(S("that would be certain death!"), 0);
    return true_;
  }
  if (possibleDeath && !await confirm(S("Blink across lava with unknown range?"), false_)) {
    return true_;
  }
  return false_;
}

function recordApplyItemCommand(theItem: struct_item | null): void {
  if (!theItem) {
    return;
  }
  let command = new Uint8Array(3);
  command[0] = APPLY_KEY;
  command[1] = theItem.inventoryLetter & 0xff;
  recordKeystrokeSequence(P(command));
}

async function useStaffOrWand(theItem: struct_item | null): Promise<number> {
  let buf = new Int8Array(100);
  let buf2 = new Int8Array(100);
  let buf3 = new Int8Array(100);
  let maxDistance = 0;
  let autoID = 0;
  let confirmedTarget = 0;
  let theBolt = new struct_bolt();
  if (0 >= theItem.charges && (theItem.flags & ITEM_IDENTIFIED) >>> 0) {
    itemName(theItem, P(buf2), false_, false_, null);
    sprintf(P(buf), S("Your %s has no charges."), P(buf2));
    await messageWithColor(P(buf), G.itemMessageColor, 0);
    return false_;
  }
  await temporaryMessage(S("Direction? (<hjklyubn>, mouse, or <tab>; <return> to confirm)"), REFRESH_SIDEBAR);
  itemName(theItem, P(buf2), false_, false_, null);
  sprintf(P(buf), S("Zapping your %s:"), P(buf2));
  printString(P(buf), 0 + 20 + 1, 1, G.itemMessageColor, G.black, null);
  theBolt.$cp($sadd(G.boltCatalog, $sadd(tableForItemCategory(theItem.category), theItem.kind).power));
  if (theItem.category === STAFF) {
    theBolt.magnitude = theItem.enchant1;
  }
  if (theItem.category & STAFF && theItem.kind === STAFF_BLINKING && (theItem.flags & (ITEM_IDENTIFIED | ITEM_MAX_CHARGES_KNOWN)) >>> 0) {
    maxDistance = staffBlinkDistance(netEnchant(theItem));
  } else {
    maxDistance = -1;
  }
  let boltKnown = $sadd(tableForItemCategory(theItem.category), theItem.kind).identified;
  let originLoc = G.player.loc.$clone();
  let zapTarget = new struct_pos();
  confirmedTarget = await chooseTarget(zapTarget, maxDistance, AUTOTARGET_MODE_USE_STAFF_OR_WAND, theItem);
  if (confirmedTarget && boltKnown && theBolt.boltEffect === BE_BLINKING && await playerCancelsBlinking(originLoc.$clone(), zapTarget.$clone(), maxDistance)) {
    confirmedTarget = false_;
  }
  if (confirmedTarget) {
    recordApplyItemCommand(theItem);
    recordMouseClick(zapTarget.x + 20 + 1 << 16 >> 16, zapTarget.y + 3 << 16 >> 16, true_, false_);
    confirmMessages();
    G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_PURE_WARRIOR] = false_;
    if (theItem.charges > 0) {
      let monst = monsterAtLoc(zapTarget);
      if (monst) {
        monsterName(P(buf3), monst, true_);
        sprintf(P(buf), S("you zap your %s at %s."), P(buf2), P(buf3));
      } else {
        sprintf(P(buf), S("you zap your %s."), P(buf2));
      }
      await message(P(buf), 0);
      autoID = await zap(originLoc.$clone(), zapTarget.$clone(), theBolt, (!boltKnown ? 1 : 0) << 24 >> 24, false_);
      if (autoID) {
        if (!$sadd(tableForItemCategory(theItem.category), theItem.kind).identified) {
          sprintf(P(buf), S("(Your %s must be "), P(buf2));
          identifyItemKind(theItem);
          itemName(theItem, P(buf2), false_, true_, null);
          strcat(P(buf), P(buf2));
          strcat(P(buf), S(".)"));
          await messageWithColor(P(buf), G.itemMessageColor, 0);
        }
      }
    } else {
      if (theItem.category === STAFF) {
        sprintf(P(buf), S("Your %s fizzles; it must be out of charges for now."), P(buf2));
      } else {
        sprintf(P(buf), S("Your %s fizzles; it must be depleted."), P(buf2));
      }
      await messageWithColor(P(buf), G.itemMessageColor, 0);
      theItem.flags = (theItem.flags | ITEM_MAX_CHARGES_KNOWN) >>> 0;
      await playerTurnEnded();
      return false_;
    }
  } else {
    return false_;
  }
  if (theItem.category & STAFF) {
    theItem.lastUsed[2] = theItem.lastUsed[1];
    theItem.lastUsed[1] = theItem.lastUsed[0];
    theItem.lastUsed[0] = G.rogue.absoluteTurnNumber;
  }
  if (theItem.charges > 0) {
    theItem.charges = theItem.charges - 1 << 16 >> 16;
    if (theItem.category === WAND) {
      theItem.enchant2 = theItem.enchant2 + 1 << 16 >> 16;
    }
  }
  return true_;
}

async function summonGuardian(theItem: struct_item | null): Promise<void> {
  let $t1: any;
  let x = G.player.loc.x;
  let y = G.player.loc.y;
  let monst = null;
  monst = generateMonster(MK_CHARM_GUARDIAN, false_, false_);
  monst.loc.$cp(getQualifyingPathLocNear(struct_pos.$of(x, y), true_, ((T_DIVIDES_LEVEL & avoidedFlagsForMonster(monst.info)) >>> 0 & ~T_SPONTANEOUSLY_IGNITES >>> 0) >>> 0, HAS_PLAYER, (avoidedFlagsForMonster(monst.info) & ~T_SPONTANEOUSLY_IGNITES >>> 0) >>> 0, HAS_PLAYER | HAS_MONSTER | HAS_STAIRS, false_));
  monst.bookkeepingFlags = (monst.bookkeepingFlags | (MB_FOLLOWER | MB_BOUND_TO_LEADER | MB_DOES_NOT_TRACK_LEADER)) >>> 0;
  monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_JUST_SUMMONED >>> 0) >>> 0;
  monst.leader = G.player;
  monst.creatureState = MONSTER_ALLY;
  monst.ticksUntilTurn = monst.info.attackSpeed + 1 << 16 >> 16;
  monst.status[STATUS_LIFESPAN_REMAINING] = monst.maxStatus[STATUS_LIFESPAN_REMAINING] = charmGuardianLifespan(netEnchant(theItem));
  ($t1 = pmapAt(monst.loc), $t1.flags = ($t1.flags | HAS_MONSTER) >>> 0);
  await fadeInMonster(monst);
}

function consumePackItem(theItem: struct_item | null): void {
  if (theItem.quantity > 1) {
    theItem.quantity = theItem.quantity - 1 << 16 >> 16;
  } else {
    removeItemFromChain(theItem, G.packItems);
    deleteItem(theItem);
  }
}

export async function eat(theItem: struct_item | null, recordCommands: number): Promise<number> {
  if (!(theItem.category & FOOD)) {
    return false_;
  }
  if (G.foodTable[theItem.kind].power > STOMACH_SIZE - G.player.status[STATUS_NUTRITION]) {
    let buf = new Int8Array(300);
    sprintf(P(buf), S("You're not hungry enough to fully enjoy the %s. Eat it anyway?"), theItem.kind === RATION ? S("food") : S("mango"));
    if (!await confirm(P(buf), false_)) {
      return false_;
    }
  }
  G.player.status[STATUS_NUTRITION] = (2150 > G.foodTable[theItem.kind].power + G.player.status[STATUS_NUTRITION] ? G.foodTable[theItem.kind].power + G.player.status[STATUS_NUTRITION] : 2150) << 16 >> 16;
  if (theItem.kind === RATION) {
    await messageWithColor(S("That food tasted delicious!"), G.itemMessageColor, 0);
  } else {
    await messageWithColor(S("My, what a yummy mango!"), G.itemMessageColor, 0);
  }
  if (recordCommands) {
    recordApplyItemCommand(theItem);
  }
  consumePackItem(theItem);
  return true_;
}

async function useCharm(theItem: struct_item | null): Promise<number> {
  if (theItem.charges > 0) {
    let buf = new Int8Array(300);
    let buf2 = new Int8Array(300);
    itemName(theItem, P(buf2), false_, false_, null);
    sprintf(P(buf), S("Your %s hasn't finished recharging."), P(buf2));
    await messageWithColor(P(buf), G.itemMessageColor, 0);
    return false_;
  }
  let enchant = netEnchant(theItem);
  G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_PURE_WARRIOR] = false_;
  switch (theItem.kind) {
  case CHARM_HEALTH:
    await heal(G.player, charmHealing(enchant), false_);
    await message(S("You feel much healthier."), 0);
    break;
  case CHARM_PROTECTION:
    if (charmProtection(enchant) > G.player.status[STATUS_SHIELDED]) {
      G.player.status[STATUS_SHIELDED] = charmProtection(enchant) << 16 >> 16;
    }
    G.player.maxStatus[STATUS_SHIELDED] = G.player.status[STATUS_SHIELDED];
    if ($sadd(G.boltCatalog, BOLT_SHIELDING).backColor) {
      flashMonster(G.player, $sadd(G.boltCatalog, BOLT_SHIELDING).backColor, 100);
    }
    await message(S("A shimmering shield coalesces around you."), 0);
    break;
  case CHARM_HASTE:
    await haste(G.player, charmEffectDuration(theItem.kind, theItem.enchant1));
    break;
  case CHARM_FIRE_IMMUNITY:
    G.player.status[STATUS_IMMUNE_TO_FIRE] = G.player.maxStatus[STATUS_IMMUNE_TO_FIRE] = charmEffectDuration(theItem.kind, theItem.enchant1);
    if (G.player.status[STATUS_BURNING]) {
      await extinguishFireOnCreature(G.player);
    }
    await message(S("you no longer fear fire."), 0);
    break;
  case CHARM_INVISIBILITY:
    await imbueInvisibility(G.player, charmEffectDuration(theItem.kind, theItem.enchant1));
    await message(S("You shiver as a chill runs up your spine."), 0);
    break;
  case CHARM_TELEPATHY:
    await makePlayerTelepathic(charmEffectDuration(theItem.kind, theItem.enchant1));
    break;
  case CHARM_LEVITATION:
    G.player.status[STATUS_LEVITATING] = G.player.maxStatus[STATUS_LEVITATING] = charmEffectDuration(theItem.kind, theItem.enchant1);
    G.player.bookkeepingFlags = (G.player.bookkeepingFlags & ~MB_SEIZED >>> 0) >>> 0;
    await message(S("you float into the air!"), 0);
    break;
  case CHARM_SHATTERING:
    await messageWithColor(S("your charm emits a wave of turquoise light that pierces the nearby walls!"), G.itemMessageColor, 0);
    await crystalize(charmShattering(enchant));
    break;
  case CHARM_GUARDIAN:
    await messageWithColor(S("your charm flashes and the form of a mythical guardian coalesces!"), G.itemMessageColor, 0);
    await summonGuardian(theItem);
    break;
  case CHARM_TELEPORTATION:
    await teleport(G.player, struct_pos.$of(-1, -1), true_);
    break;
  case CHARM_RECHARGING:
    await rechargeItems(STAFF);
    break;
  case CHARM_NEGATION:
    await negationBlast(S("your charm"), charmNegationRadius(enchant) + 1 << 16 >> 16);
    break;
  default:
    break;
  }
  theItem.charges = charmRechargeDelay(theItem.kind, theItem.enchant1);
  recordApplyItemCommand(theItem);
  return true_;
}

export async function apply(theItem: struct_item | null): Promise<void> {
  let buf = new Int8Array(300);
  let buf2 = new Int8Array(300);
  if (!theItem) {
    theItem = await promptForItemOfType(SCROLL | FOOD | POTION | STAFF | WAND | CHARM, 0, 0, KEYBOARD_LABELS ? S("Apply what? (a-z, shift for more info; or <esc> to cancel)") : S("Apply what?"), true_);
  }
  if (!theItem) {
    return;
  }
  confirmMessages();
  switch (theItem.category) {
  case FOOD:
    if (await eat(theItem, true_)) {
      break;
    }
    return;
  case POTION:
    if (await drinkPotion(theItem)) {
      break;
    }
    return;
  case SCROLL:
    if (await readScroll(theItem)) {
      consumePackItem(theItem);
      break;
    }
    return;
  case STAFF:
  case WAND:
    if (await useStaffOrWand(theItem)) {
      break;
    }
    return;
  case CHARM:
    if (await useCharm(theItem)) {
      break;
    }
    return;
  default:
    itemName(theItem, P(buf2), false_, true_, null);
    sprintf(P(buf), S("you can't apply %s."), P(buf2));
    await message(P(buf), 0);
    return;
  }
  await playerTurnEnded();
}

export function identify(theItem: struct_item | null): void {
  theItem.flags = (theItem.flags | ITEM_IDENTIFIED) >>> 0;
  theItem.flags = (theItem.flags & ~ITEM_CAN_BE_IDENTIFIED >>> 0) >>> 0;
  if ((theItem.flags & ITEM_RUNIC) >>> 0) {
    theItem.flags = (theItem.flags | (ITEM_RUNIC_IDENTIFIED | ITEM_RUNIC_HINTED)) >>> 0;
  }
  if (theItem.category & RING) {
    updateRingBonuses();
  }
  identifyItemKind(theItem);
}

function lotteryDraw(frequencies: Ptr | null, itemCount: number): number {
  let i = 0;
  let maxFreq = 0;
  let randIndex = 0;
  maxFreq = 0;
  for (i = 0; itemCount > i; i = i + 1 << 16 >> 16) {
    maxFreq = maxFreq + frequencies.a[frequencies.o + i] << 16 >> 16;
  }
  ;
  randIndex = rand_range(0, maxFreq - 1) << 16 >> 16;
  for (i = 0; itemCount > i; i = i + 1 << 16 >> 16) {
    if (frequencies.a[frequencies.o + i] > randIndex) {
      return i;
    } else {
      randIndex = randIndex - frequencies.a[frequencies.o + i] << 16 >> 16;
    }
  }
  ;
  return 0;
}

export function chooseVorpalEnemy(): number {
  let i = 0;
  let frequencies = new Int16Array(15);
  for (i = 0; MONSTER_CLASS_COUNT > i; i = i + 1 << 16 >> 16) {
    if (0 >= G.monsterClassCatalog[i].maxDepth || G.monsterClassCatalog[i].maxDepth >= G.rogue.depthLevel) {
      frequencies[i] = G.monsterClassCatalog[i].frequency;
    } else {
      frequencies[i] = 0;
    }
  }
  return lotteryDraw(P(frequencies), MONSTER_CLASS_COUNT);
}

export function describeMonsterClass(buf: Ptr | null, classID: number, conjunctionAnd: number): void {
  let i = 0;
  let buf2 = new Int8Array(50);
  buf.a[buf.o] = 0;
  for (i = 0; G.monsterClassCatalog[classID].memberList[i] >>> 0 !== 0; i = i + 1 << 16 >> 16) {
    strcpy(P(buf2), P(G.monsterCatalog[G.monsterClassCatalog[classID].memberList[i]].monsterName));
    if (G.monsterClassCatalog[classID].memberList[i + 1] >>> 0 !== 0) {
      if (G.monsterClassCatalog[classID].memberList[i + 2] >>> 0 === 0) {
        strcat(P(buf2), conjunctionAnd ? S(" and ") : S(" or "));
      } else {
        strcat(P(buf2), S(", "));
      }
    }
    strcat(buf, P(buf2));
  }
}

export function updateIdentifiableItem(theItem: struct_item | null): void {
  if (theItem.category & SCROLL && $sadd(G.scrollTable, theItem.kind).identified) {
    theItem.flags = (theItem.flags & ~ITEM_CAN_BE_IDENTIFIED >>> 0) >>> 0;
  } else if (theItem.category & POTION && $sadd(G.potionTable, theItem.kind).identified) {
    theItem.flags = (theItem.flags & ~ITEM_CAN_BE_IDENTIFIED >>> 0) >>> 0;
  } else if (theItem.category & (RING | STAFF | WAND) && (theItem.flags & ITEM_IDENTIFIED) >>> 0 && $sadd(tableForItemCategory(theItem.category), theItem.kind).identified) {
    theItem.flags = (theItem.flags & ~ITEM_CAN_BE_IDENTIFIED >>> 0) >>> 0;
  } else if (theItem.category & (WEAPON | ARMOR) && (theItem.flags & ITEM_IDENTIFIED) >>> 0 && (!((theItem.flags & ITEM_RUNIC) >>> 0) || (theItem.flags & ITEM_RUNIC_IDENTIFIED) >>> 0)) {
    theItem.flags = (theItem.flags & ~ITEM_CAN_BE_IDENTIFIED >>> 0) >>> 0;
  } else if (theItem.category & NEVER_IDENTIFIABLE) {
    theItem.flags = (theItem.flags & ~ITEM_CAN_BE_IDENTIFIED >>> 0) >>> 0;
  }
}

export function updateIdentifiableItems(): void {
  let theItem = null;
  for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
    updateIdentifiableItem(theItem);
  }
  for (theItem = G.floorItems; !!theItem; theItem = theItem.nextItem) {
    updateIdentifiableItem(theItem);
  }
}

function magicMapCell(x: number, y: number): void {
  let $t1: any;
  ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags | MAGIC_MAPPED) >>> 0);
  $at2(G.pmap, x, y).rememberedTerrainFlags = (G.tileCatalog[$at2(G.pmap, x, y).layers[DUNGEON]].flags | G.tileCatalog[$at2(G.pmap, x, y).layers[LIQUID]].flags) >>> 0;
  $at2(G.pmap, x, y).rememberedTMFlags = (G.tileCatalog[$at2(G.pmap, x, y).layers[DUNGEON]].mechFlags | G.tileCatalog[$at2(G.pmap, x, y).layers[LIQUID]].mechFlags) >>> 0;
  if ($at2(G.pmap, x, y).layers[LIQUID] >>> 0 && G.tileCatalog[$at2(G.pmap, x, y).layers[DUNGEON]].drawPriority > G.tileCatalog[$at2(G.pmap, x, y).layers[LIQUID]].drawPriority) {
    $at2(G.pmap, x, y).rememberedTerrain = $at2(G.pmap, x, y).layers[LIQUID];
  } else {
    $at2(G.pmap, x, y).rememberedTerrain = $at2(G.pmap, x, y).layers[DUNGEON];
  }
}

function uncurse(theItem: struct_item | null): number {
  if ((theItem.flags & ITEM_CURSED) >>> 0) {
    theItem.flags = (theItem.flags & ~ITEM_CURSED >>> 0) >>> 0;
    return true_;
  }
  return false_;
}

export async function readScroll(theItem: struct_item | null): Promise<number> {
  let $t1: any, $t2: any;
  let i = 0;
  let j = 0;
  let x = 0;
  let y = 0;
  let numberOfMonsters = 0;
  let tempItem = null;
  let monst = null;
  let hadEffect = false_;
  let buf = new Int8Array(300);
  let buf2 = new Int8Array(300);
  let scrollKind = $sadd(tableForItemCategory(theItem.category), theItem.kind).$clone();
  if (magicCharDiscoverySuffix(theItem.category << 16 >> 16, theItem.kind) === -1 && ((theItem.flags & ITEM_MAGIC_DETECTED) >>> 0 || scrollKind.identified)) {
    if (scrollKind.identified) {
      sprintf(P(buf), S("Really read a scroll of %s?"), scrollKind.name);
    } else {
      sprintf(P(buf), S("Really read a cursed scroll?"));
    }
    if (!await confirm(P(buf), false_)) {
      return false_;
    }
  }
  recordApplyItemCommand(theItem);
  switch (theItem.kind) {
  case SCROLL_IDENTIFY:
    identify(theItem);
    updateIdentifiableItems();
    await messageWithColor(S("this is a scroll of identify."), G.itemMessageColor, REQUIRE_ACKNOWLEDGMENT);
    if (await numberOfMatchingPackItems(ALL_ITEMS, ITEM_CAN_BE_IDENTIFIED, 0, false_) === 0) {
      await message(S("everything in your pack is already identified."), 0);
      break;
    }
    do {
      theItem = await promptForItemOfType(ALL_ITEMS, ITEM_CAN_BE_IDENTIFIED, 0, KEYBOARD_LABELS ? S("Identify what? (a-z; shift for more info)") : S("Identify what?"), false_);
      if (G.rogue.gameHasEnded) {
        return false_;
      }
      if (theItem && !((theItem.flags & ITEM_CAN_BE_IDENTIFIED) >>> 0)) {
        confirmMessages();
        itemName(theItem, P(buf2), true_, true_, null);
        sprintf(P(buf), S("you already know %s %s."), theItem.quantity > 1 ? S("they're") : S("it's"), P(buf2));
        await messageWithColor(P(buf), G.itemMessageColor, 0);
      }
    } while (!theItem || !((theItem.flags & ITEM_CAN_BE_IDENTIFIED) >>> 0));
    recordKeystroke(theItem.inventoryLetter, false_, false_);
    confirmMessages();
    identify(theItem);
    itemName(theItem, P(buf), true_, true_, null);
    sprintf(P(buf2), S("%s %s."), theItem.quantity === 1 ? S("this is") : S("these are"), P(buf));
    await messageWithColor(P(buf2), G.itemMessageColor, 0);
    break;
  case SCROLL_TELEPORT:
    await teleport(G.player, struct_pos.$of(-1, -1), true_);
    break;
  case SCROLL_REMOVE_CURSE:
    for (tempItem = G.packItems.nextItem; !!tempItem; tempItem = tempItem.nextItem) {
      hadEffect = (hadEffect | uncurse(tempItem)) << 24 >> 24;
    }
    if (hadEffect) {
      await message(S("your pack glows with a cleansing light, and a malevolent energy disperses."), 0);
    } else {
      await message(S("your pack glows with a cleansing light, but nothing happens."), 0);
    }
    break;
  case SCROLL_ENCHANTING:
    identify(theItem);
    await messageWithColor(S("this is a scroll of enchanting."), G.itemMessageColor, REQUIRE_ACKNOWLEDGMENT);
    if (!await numberOfMatchingPackItems(WEAPON | ARMOR | RING | STAFF | WAND | CHARM, 0, 0, false_)) {
      confirmMessages();
      await message(S("you have nothing that can be enchanted."), 0);
      break;
    }
    do {
      theItem = await promptForItemOfType(WEAPON | ARMOR | RING | STAFF | WAND | CHARM, 0, 0, KEYBOARD_LABELS ? S("Enchant what? (a-z; shift for more info)") : S("Enchant what?"), false_);
      confirmMessages();
      if (!theItem || !(theItem.category & (WEAPON | ARMOR | RING | STAFF | WAND | CHARM))) {
        await message(S("Can't enchant that."), REQUIRE_ACKNOWLEDGMENT);
      }
      if (G.rogue.gameHasEnded) {
        return false_;
      }
    } while (!theItem || !(theItem.category & (WEAPON | ARMOR | RING | STAFF | WAND | CHARM)));
    recordKeystroke(theItem.inventoryLetter, false_, false_);
    confirmMessages();
    theItem.timesEnchanted = theItem.timesEnchanted + enchantMagnitude() << 16 >> 16;
    switch (theItem.category) {
    case WEAPON:
      theItem.strengthRequired = (0 > theItem.strengthRequired - enchantMagnitude() ? 0 : theItem.strengthRequired - enchantMagnitude()) << 16 >> 16;
      theItem.enchant1 = theItem.enchant1 + enchantMagnitude() << 16 >> 16;
      if (theItem.quiverNumber) {
        theItem.quiverNumber = rand_range(1, 60000) & 0xffff;
      }
      break;
    case ARMOR:
      theItem.strengthRequired = (0 > theItem.strengthRequired - enchantMagnitude() ? 0 : theItem.strengthRequired - enchantMagnitude()) << 16 >> 16;
      theItem.enchant1 = theItem.enchant1 + enchantMagnitude() << 16 >> 16;
      break;
    case RING:
      theItem.enchant1 = theItem.enchant1 + enchantMagnitude() << 16 >> 16;
      updateRingBonuses();
      if (theItem.kind === RING_CLAIRVOYANCE) {
        updateClairvoyance();
        await displayLevel();
      }
      break;
    case STAFF:
      theItem.enchant1 = theItem.enchant1 + enchantMagnitude() << 16 >> 16;
      theItem.charges = theItem.charges + enchantMagnitude() << 16 >> 16;
      theItem.enchant2 = (500 / theItem.enchant1 | 0) << 16 >> 16;
      break;
    case WAND:
      theItem.charges = theItem.charges + Math.imul($sadd(G.wandTable, theItem.kind).range.lowerBound, enchantMagnitude()) << 16 >> 16;
      break;
    case CHARM:
      theItem.enchant1 = theItem.enchant1 + enchantMagnitude() << 16 >> 16;
      theItem.charges = (theItem.charges > 0 ? 0 : theItem.charges) << 16 >> 16;
      break;
    default:
      break;
    }
    if (theItem.category & (WEAPON | ARMOR | STAFF | RING | CHARM) && theItem.enchant1 >= 16) {
      G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_SPECIALIST] = true_;
    }
    if ((theItem.flags & ITEM_EQUIPPED) >>> 0) {
      await equipItem(theItem, true_, null);
    }
    itemName(theItem, P(buf), false_, false_, null);
    sprintf(P(buf2), S("your %s gleam%s briefly in the darkness."), P(buf), theItem.quantity === 1 ? S("s") : S(""));
    await messageWithColor(P(buf2), G.itemMessageColor, 0);
    if (uncurse(theItem)) {
      sprintf(P(buf2), S("a malevolent force leaves your %s."), P(buf));
      await messageWithColor(P(buf2), G.itemMessageColor, 0);
    }
    createFlare(G.player.loc.x, G.player.loc.y, SCROLL_ENCHANTMENT_LIGHT);
    break;
  case SCROLL_RECHARGING:
    await rechargeItems(STAFF | CHARM);
    break;
  case SCROLL_PROTECT_ARMOR:
    if (G.rogue.armor) {
      tempItem = G.rogue.armor;
      tempItem.flags = (tempItem.flags | ITEM_PROTECTED) >>> 0;
      itemName(tempItem, P(buf2), false_, false_, null);
      sprintf(P(buf), S("a protective golden light covers your %s."), P(buf2));
      await messageWithColor(P(buf), G.itemMessageColor, 0);
      if (uncurse(tempItem)) {
        sprintf(P(buf), S("a malevolent force leaves your %s."), P(buf2));
        await messageWithColor(P(buf), G.itemMessageColor, 0);
      }
    } else {
      await message(S("a protective golden light surrounds you, but it quickly disperses."), 0);
    }
    createFlare(G.player.loc.x, G.player.loc.y, SCROLL_PROTECTION_LIGHT);
    break;
  case SCROLL_PROTECT_WEAPON:
    if (G.rogue.weapon) {
      tempItem = G.rogue.weapon;
      tempItem.flags = (tempItem.flags | ITEM_PROTECTED) >>> 0;
      itemName(tempItem, P(buf2), false_, false_, null);
      sprintf(P(buf), S("a protective golden light covers your %s."), P(buf2));
      await messageWithColor(P(buf), G.itemMessageColor, 0);
      if (uncurse(tempItem)) {
        sprintf(P(buf), S("a malevolent force leaves your %s."), P(buf2));
        await messageWithColor(P(buf), G.itemMessageColor, 0);
      }
      if (G.rogue.weapon.quiverNumber) {
        G.rogue.weapon.quiverNumber = rand_range(1, 60000) & 0xffff;
      }
    } else {
      await message(S("a protective golden light covers your empty hands, but it quickly disperses."), 0);
    }
    createFlare(G.player.loc.x, G.player.loc.y, SCROLL_PROTECTION_LIGHT);
    break;
  case SCROLL_SANCTUARY:
    await spawnDungeonFeature(G.player.loc.x, G.player.loc.y, G.dungeonFeatureCatalog[DF_SACRED_GLYPHS], true_, false_);
    await messageWithColor(S("sprays of color arc to the ground, forming glyphs where they alight."), G.itemMessageColor, 0);
    break;
  case SCROLL_MAGIC_MAPPING:
    confirmMessages();
    await messageWithColor(S("this scroll has a map on it!"), G.itemMessageColor, 0);
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET)) {
          await discover(i, j);
          magicMapCell(i, j);
          ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags & ~(STABLE_MEMORY | DISCOVERED) >>> 0) >>> 0);
        }
      }
    }
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (!(($at2(G.pmap, i, j).flags & DISCOVERED) >>> 0) && $at2(G.pmap, i, j).layers[DUNGEON] >>> 0 !== GRANITE) {
          magicMapCell(i, j);
        }
      }
    }
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (!cellHasTerrainFlag(struct_pos.$of(i, j), T_IS_DF_TRAP)) {
          ($t2 = $at2(G.pmap, i, j), $t2.flags = ($t2.flags | KNOWN_TO_BE_TRAP_FREE) >>> 0);
        }
      }
    }
    await colorFlash(G.magicMapFlashColor, 0, MAGIC_MAPPED, 15, DCOLS + DROWS, G.player.loc.x, G.player.loc.y);
    break;
  case SCROLL_AGGRAVATE_MONSTER:
    await aggravateMonsters(DCOLS + DROWS, G.player.loc.x, G.player.loc.y, G.gray);
    await message(S("the scroll emits a piercing shriek that echoes throughout the dungeon!"), 0);
    break;
  case SCROLL_SUMMON_MONSTER:
    for (j = 0; 25 > j && 3 > numberOfMonsters; j = j + 1 << 16 >> 16) {
      for (i = 0; 8 > i; i = i + 1 << 16 >> 16) {
        x = G.player.loc.x + G.nbDirs[i][0] << 16 >> 16;
        y = G.player.loc.y + G.nbDirs[i][1] << 16 >> 16;
        if (!cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY) && !(($at2(G.pmap, x, y).flags & HAS_MONSTER) >>> 0) && rand_percent(10) && 3 > numberOfMonsters) {
          monst = await spawnHorde(0, struct_pos.$of(x, y), HORDE_LEADER_CAPTIVE | HORDE_NO_PERIODIC_SPAWN | HORDE_IS_SUMMONED | HORDE_MACHINE_ONLY, 0);
          if (monst) {
            wakeUp(monst);
            await fadeInMonster(monst);
            numberOfMonsters = numberOfMonsters + 1 << 16 >> 16;
          }
        }
      }
    }
    if (numberOfMonsters > 1) {
      await message(S("the fabric of space ripples, and monsters appear!"), 0);
    } else if (numberOfMonsters === 1) {
      await message(S("the fabric of space ripples, and a monster appears!"), 0);
    } else {
      await message(S("the fabric of space boils violently around you, but nothing happens."), 0);
    }
    break;
  case SCROLL_NEGATION:
    await negationBlast(S("the scroll"), DCOLS);
    break;
  case SCROLL_SHATTERING:
    await messageWithColor(S("the scroll emits a wave of turquoise light that pierces the nearby walls!"), G.itemMessageColor, 0);
    await crystalize(9);
    break;
  case SCROLL_DISCORD:
    await discordBlast(S("the scroll"), DCOLS);
    break;
  }
  if (!scrollKind.identified && theItem.kind !== SCROLL_ENCHANTING && theItem.kind !== SCROLL_IDENTIFY) {
    await autoIdentify(theItem);
  }
  return true_;
}

function detectMagicOnItem(theItem: struct_item | null): void {
  if (theItem.category & HAS_INTRINSIC_POLARITY) {
    let theItemTable = tableForItemCategory(theItem.category);
    $sadd(theItemTable, theItem.kind).magicPolarityRevealed = true_;
  }
  theItem.flags = (theItem.flags | ITEM_MAGIC_DETECTED) >>> 0;
  if (theItem.category & (WEAPON | ARMOR) && theItem.enchant1 === 0 && !((theItem.flags & ITEM_RUNIC) >>> 0)) {
    identify(theItem);
  }
}

export async function drinkPotion(theItem: struct_item | null): Promise<number> {
  let $t1: any;
  let tempItem = null;
  let buf = $cs("", 1000);
  let magnitude = 0;
  ;
  let potionKind = $sadd(tableForItemCategory(theItem.category), theItem.kind).$clone();
  if (magicCharDiscoverySuffix(theItem.category << 16 >> 16, theItem.kind) === -1 && ((theItem.flags & ITEM_MAGIC_DETECTED) >>> 0 || potionKind.identified)) {
    if (potionKind.identified) {
      sprintf(P(buf), S("Really drink a potion of %s?"), potionKind.name);
    } else {
      sprintf(P(buf), S("Really drink a cursed potion?"));
    }
    if (!await confirm(P(buf), false_)) {
      return false_;
    }
  }
  confirmMessages();
  magnitude = randClump(potionKind.range);
  switch (theItem.kind) {
  case POTION_LIFE:
    sprintf(P(buf), S("%syour maximum health increases by %i%%."), G.player.info.maxHP > G.player.currentHP ? S("you heal completely and ") : S(""), ((G.player.info.maxHP + magnitude) * 100 / G.player.info.maxHP | 0) - 100);
    G.player.info.maxHP = G.player.info.maxHP + magnitude << 16 >> 16;
    await heal(G.player, 100, true_);
    updatePlayerRegenerationDelay();
    await messageWithColor(P(buf), G.advancementMessageColor, 0);
    break;
  case POTION_HALLUCINATION:
    G.player.status[STATUS_HALLUCINATING] = G.player.maxStatus[STATUS_HALLUCINATING] = magnitude << 16 >> 16;
    await message(S("colors are everywhere! The walls are singing!"), 0);
    break;
  case POTION_INCINERATION:
    await message(S("as you uncork the flask, it explodes in flame!"), 0);
    await spawnDungeonFeature(G.player.loc.x, G.player.loc.y, G.dungeonFeatureCatalog[DF_INCINERATION_POTION], true_, false_);
    await exposeCreatureToFire(G.player);
    break;
  case POTION_DARKNESS:
    G.player.status[STATUS_DARKNESS] = (magnitude > G.player.status[STATUS_DARKNESS] ? magnitude : G.player.status[STATUS_DARKNESS]) << 16 >> 16;
    G.player.maxStatus[STATUS_DARKNESS] = (magnitude > G.player.maxStatus[STATUS_DARKNESS] ? magnitude : G.player.maxStatus[STATUS_DARKNESS]) << 16 >> 16;
    updateMinersLightRadius();
    await updateVision(true_);
    await message(S("your vision flickers as a cloak of darkness settles around you!"), 0);
    break;
  case POTION_DESCENT:
    await colorFlash(G.darkBlue, 0, IN_FIELD_OF_VIEW, 3, 3, G.player.loc.x, G.player.loc.y);
    await message(S("vapor pours out of the flask and causes the floor to disappear!"), 0);
    await spawnDungeonFeature(G.player.loc.x, G.player.loc.y, G.dungeonFeatureCatalog[DF_HOLE_POTION], true_, false_);
    if (!G.player.status[STATUS_LEVITATING]) {
      G.player.bookkeepingFlags = (G.player.bookkeepingFlags | MB_IS_FALLING) >>> 0;
    }
    break;
  case POTION_STRENGTH:
    G.rogue.strength = G.rogue.strength + magnitude << 16 >> 16;
    if (G.player.status[STATUS_WEAKENED]) {
      G.player.status[STATUS_WEAKENED] = 1;
    }
    G.player.weaknessAmount = 0;
    updateEncumbrance();
    await messageWithColor(S("newfound strength surges through your body."), G.advancementMessageColor, 0);
    createFlare(G.player.loc.x, G.player.loc.y, POTION_STRENGTH_LIGHT);
    break;
  case POTION_POISON:
    await spawnDungeonFeature(G.player.loc.x, G.player.loc.y, G.dungeonFeatureCatalog[DF_POISON_GAS_CLOUD_POTION], true_, false_);
    await message(S("caustic gas billows out of the open flask!"), 0);
    break;
  case POTION_PARALYSIS:
    await spawnDungeonFeature(G.player.loc.x, G.player.loc.y, G.dungeonFeatureCatalog[DF_PARALYSIS_GAS_CLOUD_POTION], true_, false_);
    await message(S("your muscles stiffen as a cloud of pink gas bursts from the open flask!"), 0);
    break;
  case POTION_TELEPATHY:
    await makePlayerTelepathic(magnitude << 16 >> 16);
    break;
  case POTION_LEVITATION:
    G.player.status[STATUS_LEVITATING] = G.player.maxStatus[STATUS_LEVITATING] = magnitude << 16 >> 16;
    G.player.bookkeepingFlags = (G.player.bookkeepingFlags & ~MB_SEIZED >>> 0) >>> 0;
    await message(S("you float into the air!"), 0);
    break;
  case POTION_CONFUSION:
    await spawnDungeonFeature(G.player.loc.x, G.player.loc.y, G.dungeonFeatureCatalog[DF_CONFUSION_GAS_CLOUD_POTION], true_, false_);
    await message(S("a shimmering cloud of rainbow-colored gas billows out of the open flask!"), 0);
    break;
  case POTION_LICHEN:
    await message(S("a handful of tiny spores burst out of the open flask!"), 0);
    await spawnDungeonFeature(G.player.loc.x, G.player.loc.y, G.dungeonFeatureCatalog[DF_LICHEN_PLANTED], true_, false_);
    break;
  case POTION_DETECT_MAGIC:
    {
      let hadEffectOnLevel = false_;
      let hadEffectOnPack = false_;
      for (tempItem = G.floorItems.nextItem; !!tempItem; tempItem = tempItem.nextItem) {
        if (tempItem.category & CAN_BE_DETECTED) {
          detectMagicOnItem(tempItem);
          if (itemMagicPolarity(tempItem)) {
            ($t1 = pmapAt(tempItem.loc), $t1.flags = ($t1.flags | ITEM_DETECTED) >>> 0);
            hadEffectOnLevel = true_;
            await refreshDungeonCell(tempItem.loc.$clone());
          }
        }
      }
      for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
        let monst = nextCreature(it);
        if (monst.carriedItem && monst.carriedItem.category & CAN_BE_DETECTED) {
          detectMagicOnItem(monst.carriedItem);
          if (itemMagicPolarity(monst.carriedItem)) {
            hadEffectOnLevel = true_;
            await refreshDungeonCell(monst.loc.$clone());
          }
        }
      }
      for (tempItem = G.packItems.nextItem; !!tempItem; tempItem = tempItem.nextItem) {
        if (tempItem.category & CAN_BE_DETECTED) {
          detectMagicOnItem(tempItem);
          if (itemMagicPolarity(tempItem)) {
            if (tempItem !== theItem && (tempItem.flags & ITEM_MAGIC_DETECTED) >>> 0) {
              hadEffectOnPack = true_;
            }
          }
        }
      }
      if (hadEffectOnLevel || hadEffectOnPack) {
        tryIdentifyLastItemKinds(HAS_INTRINSIC_POLARITY);
        if (hadEffectOnLevel && hadEffectOnPack) {
          await message(S("you can somehow feel the presence of magic on the level and in your pack."), 0);
        } else if (hadEffectOnLevel) {
          await message(S("you can somehow feel the presence of magic on the level."), 0);
        } else {
          await message(S("you can somehow feel the presence of magic in your pack."), 0);
        }
      } else {
        await message(S("you can somehow feel the absence of magic on the level and in your pack."), 0);
      }
      break;
    }
  case POTION_HASTE_SELF:
    await haste(G.player, magnitude << 16 >> 16);
    break;
  case POTION_FIRE_IMMUNITY:
    G.player.status[STATUS_IMMUNE_TO_FIRE] = G.player.maxStatus[STATUS_IMMUNE_TO_FIRE] = magnitude << 16 >> 16;
    if (G.player.status[STATUS_BURNING]) {
      await extinguishFireOnCreature(G.player);
    }
    await message(S("a comforting breeze envelops you, and you no longer fear fire."), 0);
    break;
  case POTION_INVISIBILITY:
    G.player.status[STATUS_INVISIBLE] = G.player.maxStatus[STATUS_INVISIBLE] = magnitude << 16 >> 16;
    await message(S("you shiver as a chill runs up your spine."), 0);
    break;
  default:
    await message(S("you feel very strange, as though your body doesn't know how to react!"), REQUIRE_ACKNOWLEDGMENT);
  }
  if (!potionKind.identified) {
    await autoIdentify(theItem);
  }
  recordApplyItemCommand(theItem);
  consumePackItem(theItem);
  return true_;
}

export function magicCharDiscoverySuffix(category: number, kind: number): number {
  let result = 0;
  switch (category) {
  case SCROLL:
    switch (kind) {
    case SCROLL_AGGRAVATE_MONSTER:
    case SCROLL_SUMMON_MONSTER:
      result = -1;
      break;
    default:
      result = 1;
      break;
    }
    break;
  case POTION:
    switch (kind) {
    case POTION_HALLUCINATION:
    case POTION_INCINERATION:
    case POTION_DESCENT:
    case POTION_POISON:
    case POTION_PARALYSIS:
    case POTION_CONFUSION:
    case POTION_LICHEN:
    case POTION_DARKNESS:
      result = -1;
      break;
    default:
      result = 1;
      break;
    }
    break;
  case WAND:
  case STAFF:
    if (($sadd(G.boltCatalog, $sadd(tableForItemCategory(category), kind).power).flags & BF_TARGET_ALLIES) >>> 0) {
      result = -1;
    } else {
      result = 1;
    }
    break;
  case RING:
    result = 0;
    break;
  case CHARM:
    result = 1;
    break;
  }
  return result;
}

export function itemMagicPolarity(theItem: struct_item | null): number {
  let theItemTable = tableForItemCategory(theItem.category);
  switch (theItem.category) {
  case WEAPON:
  case ARMOR:
    if ((theItem.flags & ITEM_CURSED) >>> 0 || 0 > theItem.enchant1) {
      return MAGIC_POLARITY_MALEVOLENT;
    } else if (theItem.enchant1 > 0) {
      return MAGIC_POLARITY_BENEVOLENT;
    }
    return MAGIC_POLARITY_NEUTRAL;
  case WAND:
    if (theItem.charges === 0) {
      return MAGIC_POLARITY_NEUTRAL;
    }
  case SCROLL:
  case POTION:
  case CHARM:
  case STAFF:
    return $sadd(theItemTable, theItem.kind).magicPolarity;
  case RING:
    if ((theItem.flags & ITEM_CURSED) >>> 0 || 0 > theItem.enchant1) {
      return MAGIC_POLARITY_MALEVOLENT;
    } else if (theItem.enchant1 > 0) {
      return MAGIC_POLARITY_BENEVOLENT;
    } else {
      return MAGIC_POLARITY_NEUTRAL;
    }
  case AMULET:
    return MAGIC_POLARITY_BENEVOLENT;
  default:
    return MAGIC_POLARITY_NEUTRAL;
  }
}

export async function unequip(theItem: struct_item | null): Promise<void> {
  let buf = new Int8Array(300);
  let buf2 = new Int8Array(300);
  let command = new Uint8Array(3);
  command[0] = UNEQUIP_KEY;
  if (!theItem) {
    theItem = await promptForItemOfType(ALL_ITEMS, ITEM_EQUIPPED, 0, KEYBOARD_LABELS ? S("Remove (unequip) what? (a-z or <esc> to cancel)") : S("Remove (unequip) what?"), true_);
  }
  if (!theItem) {
    return;
  }
  command[1] = theItem.inventoryLetter & 0xff;
  command[2] = 0;
  if (!((theItem.flags & ITEM_EQUIPPED) >>> 0)) {
    itemName(theItem, P(buf2), false_, false_, null);
    sprintf(P(buf), S("your %s %s not equipped."), P(buf2), theItem.quantity === 1 ? S("was") : S("were"));
    confirmMessages();
    await messageWithColor(P(buf), G.itemMessageColor, 0);
    return;
  } else {
    if (!await unequipItem(theItem, false_)) {
      return;
    }
    recordKeystrokeSequence(P(command));
    itemName(theItem, P(buf2), true_, true_, null);
    if (strLenWithoutEscapes(P(buf2)) > 52) {
      itemName(theItem, P(buf2), false_, true_, null);
    }
    confirmMessages();
    sprintf(P(buf), S("you are no longer %s %s."), theItem.category & WEAPON ? S("wielding") : S("wearing"), P(buf2));
    await messageWithColor(P(buf), G.itemMessageColor, 0);
  }
  await playerTurnEnded();
}

function canDrop(): number {
  if (cellHasTerrainFlag(G.player.loc, T_OBSTRUCTS_ITEMS)) {
    return false_;
  }
  return true_;
}

export async function drop(theItem: struct_item | null): Promise<void> {
  let buf = new Int8Array(300);
  let buf2 = new Int8Array(300);
  let command = new Uint8Array(3);
  command[0] = DROP_KEY;
  if (!theItem) {
    theItem = await promptForItemOfType(ALL_ITEMS, 0, 0, KEYBOARD_LABELS ? S("Drop what? (a-z, shift for more info; or <esc> to cancel)") : S("Drop what?"), true_);
  }
  if (!theItem) {
    return;
  }
  command[1] = theItem.inventoryLetter & 0xff;
  command[2] = 0;
  if ((theItem.flags & ITEM_EQUIPPED) >>> 0 && (theItem.flags & ITEM_CURSED) >>> 0) {
    itemName(theItem, P(buf2), false_, false_, null);
    sprintf(P(buf), S("you can't; your %s appears to be cursed."), P(buf2));
    confirmMessages();
    await messageWithColor(P(buf), G.itemMessageColor, 0);
  } else if (canDrop()) {
    recordKeystrokeSequence(P(command));
    if ((theItem.flags & ITEM_EQUIPPED) >>> 0) {
      await unequipItem(theItem, false_);
    }
    theItem = await dropItem(theItem);
    theItem.flags = (theItem.flags | ITEM_PLAYER_AVOIDS) >>> 0;
    itemName(theItem, P(buf2), true_, true_, null);
    sprintf(P(buf), S("You dropped %s."), P(buf2));
    await messageWithColor(P(buf), G.itemMessageColor, 0);
    await playerTurnEnded();
  } else {
    confirmMessages();
    await message(S("There is already something there."), 0);
  }
}

export async function promptForItemOfType(category: number, requiredFlags: number, forbiddenFlags: number, prompt: Ptr | null, allowInventoryActions: number): Promise<struct_item | null> {
  let keystroke = 0;
  let theItem = null;
  if (!await numberOfMatchingPackItems(ALL_ITEMS, requiredFlags, forbiddenFlags, true_)) {
    return null;
  }
  await temporaryMessage(prompt, 0);
  keystroke = await displayInventory(category, requiredFlags, forbiddenFlags, false_, allowInventoryActions);
  if (!keystroke) {
    return null;
  }
  if (97 > keystroke || keystroke > 122) {
    confirmMessages();
    if (keystroke !== ESCAPE_KEY && keystroke !== ACKNOWLEDGE_KEY) {
      await message(S("Invalid entry."), 0);
    }
    return null;
  }
  theItem = itemOfPackLetter(keystroke);
  if (!theItem) {
    confirmMessages();
    await message(S("No such item."), 0);
    return null;
  }
  return theItem;
}

export function itemOfPackLetter(letter: number): struct_item | null {
  let theItem = null;
  for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
    if (theItem.inventoryLetter === letter) {
      return theItem;
    }
  }
  return null;
}

export async function itemAtLoc(loc: struct_pos): Promise<struct_item | null> {
  let $t1: any;
  let theItem = null;
  if (!((pmapAt(loc).flags & HAS_ITEM) >>> 0)) {
    return null;
  }
  for (theItem = G.floorItems.nextItem; !!theItem && !posEq(theItem.loc, loc); theItem = theItem.nextItem) {
    ;
  }
  if (!theItem) {
    ($t1 = pmapAt(loc), $t1.flags = ($t1.flags & ~HAS_ITEM >>> 0) >>> 0);
    await hiliteCell(loc.x, loc.y, G.white, 75, true_);
    G.rogue.automationActive = false_;
    await message(S("ERROR: An item was supposed to be here, but I couldn't find it."), REQUIRE_ACKNOWLEDGMENT);
    await refreshDungeonCell(loc.$clone());
  }
  return theItem;
}

export async function dropItem(theItem: struct_item | null): Promise<struct_item | null> {
  let itemFromTopOfStack = null;
  let itemOnFloor = null;
  if (cellHasTerrainFlag(G.player.loc, T_OBSTRUCTS_ITEMS)) {
    return null;
  }
  itemOnFloor = await itemAtLoc(G.player.loc.$clone());
  if (theItem.quantity > 1 && !(theItem.category & (WEAPON | GEM))) {
    itemFromTopOfStack = await generateItem(ALL_ITEMS, -1);
    itemFromTopOfStack.$cp(theItem);
    theItem.quantity = theItem.quantity - 1 << 16 >> 16;
    itemFromTopOfStack.quantity = 1;
    if (itemOnFloor) {
      itemOnFloor.inventoryLetter = theItem.inventoryLetter;
      await pickUpItemAt(G.player.loc.$clone());
    }
    await placeItemAt(itemFromTopOfStack, G.player.loc.$clone());
    return itemFromTopOfStack;
  } else {
    if (G.rogue.swappedIn === theItem || G.rogue.swappedOut === theItem) {
      G.rogue.swappedIn = null;
      G.rogue.swappedOut = null;
    }
    removeItemFromChain(theItem, G.packItems);
    if (itemOnFloor) {
      itemOnFloor.inventoryLetter = theItem.inventoryLetter;
      await pickUpItemAt(G.player.loc.$clone());
    }
    await placeItemAt(theItem, G.player.loc.$clone());
    return theItem;
  }
}

export function recalculateEquipmentBonuses(): void {
  let enchant = 0;
  let theItem = null;
  if (G.rogue.weapon) {
    theItem = G.rogue.weapon;
    enchant = netEnchant(theItem);
    G.player.info.damage.$cp(theItem.damage);
    G.player.info.damage.lowerBound = Math.trunc($mul64(G.player.info.damage.lowerBound, damageFraction(enchant)) / FP_FACTOR) << 16 >> 16;
    G.player.info.damage.upperBound = Math.trunc($mul64(G.player.info.damage.upperBound, damageFraction(enchant)) / FP_FACTOR) << 16 >> 16;
    if (1 > G.player.info.damage.lowerBound) {
      G.player.info.damage.lowerBound = 1;
    }
    if (1 > G.player.info.damage.upperBound) {
      G.player.info.damage.upperBound = 1;
    }
  }
  if (G.rogue.armor) {
    theItem = G.rogue.armor;
    enchant = netEnchant(theItem);
    enchant -= $mul64(G.player.status[STATUS_DONNING], FP_FACTOR);
    G.player.info.defense = Math.trunc(($mul64(theItem.armor, FP_FACTOR) + $mul64(enchant, 10)) / FP_FACTOR) << 16 >> 16;
    if (0 > G.player.info.defense) {
      G.player.info.defense = 0;
    }
  }
}

export async function equipItem(theItem: struct_item | null, force: number, unequipHint: struct_item | null): Promise<number> {
  let buf1 = new Int8Array(300);
  let buf2 = new Int8Array(300);
  let buf3 = new Int8Array(300);
  let previouslyEquippedItem = null;
  if (theItem.category & RING && (theItem.flags & ITEM_EQUIPPED) >>> 0) {
    return false_;
  }
  if (theItem.category & WEAPON) {
    previouslyEquippedItem = G.rogue.weapon;
  } else if (theItem.category & ARMOR) {
    previouslyEquippedItem = G.rogue.armor;
  } else if (theItem.category & RING && unequipHint && G.rogue.ringLeft && G.rogue.ringRight && (unequipHint === G.rogue.ringLeft || unequipHint === G.rogue.ringRight)) {
    previouslyEquippedItem = unequipHint;
  }
  if (previouslyEquippedItem && !await unequipItem(previouslyEquippedItem, force)) {
    return false_;
  }
  if (theItem.category & WEAPON) {
    G.rogue.weapon = theItem;
    await strengthCheck(theItem, (!force ? 1 : 0) << 24 >> 24);
  } else if (theItem.category & ARMOR) {
    if (!force) {
      G.player.status[STATUS_DONNING] = G.player.maxStatus[STATUS_DONNING] = (theItem.armor / 10 | 0) << 16 >> 16;
    }
    G.rogue.armor = theItem;
    await strengthCheck(theItem, (!force ? 1 : 0) << 24 >> 24);
  } else if (theItem.category & RING) {
    if (G.rogue.ringLeft && G.rogue.ringRight) {
      return false_;
    }
    if (G.rogue.ringLeft) {
      G.rogue.ringRight = theItem;
    } else {
      G.rogue.ringLeft = theItem;
    }
    updateRingBonuses();
    if (theItem.kind === RING_CLAIRVOYANCE) {
      updateClairvoyance();
      await displayLevel();
      identifyItemKind(theItem);
    } else if (theItem.kind === RING_LIGHT || theItem.kind === RING_STEALTH) {
      identifyItemKind(theItem);
    }
    updateEncumbrance();
  }
  theItem.flags = (theItem.flags | ITEM_EQUIPPED) >>> 0;
  itemName(theItem, P(buf2), true_, true_, null);
  if (!force) {
    if (previouslyEquippedItem) {
      itemName(previouslyEquippedItem, P(buf3), false_, false_, null);
      sprintf(P(buf1), S("Now %s %s instead of your %s."), theItem.category & WEAPON ? S("wielding") : S("wearing"), P(buf2), P(buf3));
    } else {
      sprintf(P(buf1), S("Now %s %s."), theItem.category & WEAPON ? S("wielding") : S("wearing"), P(buf2));
    }
    confirmMessages();
    await messageWithColor(P(buf1), G.itemMessageColor, false_);
    if ((theItem.flags & ITEM_CURSED) >>> 0) {
      itemName(theItem, P(buf2), false_, false_, null);
      switch (theItem.category) {
      case WEAPON:
        sprintf(P(buf1), S("you wince as your grip involuntarily tightens around your %s."), P(buf2));
        break;
      case ARMOR:
        sprintf(P(buf1), S("your %s constricts around you painfully."), P(buf2));
        break;
      case RING:
        sprintf(P(buf1), S("your %s tightens around your finger painfully."), P(buf2));
        break;
      default:
        sprintf(P(buf1), S("your %s seizes you with a malevolent force."), P(buf2));
        break;
      }
      await messageWithColor(P(buf1), G.itemMessageColor, 0);
    }
  }
  return true_;
}

export async function unequipItem(theItem: struct_item | null, force: number): Promise<number> {
  let buf = new Int8Array(300);
  let buf2 = new Int8Array(300);
  if (!theItem || !((theItem.flags & ITEM_EQUIPPED) >>> 0)) {
    return false_;
  }
  if ((theItem.flags & ITEM_CURSED) >>> 0 && !force) {
    itemName(theItem, P(buf2), false_, false_, null);
    sprintf(P(buf), S("you can't; your %s appear%s to be cursed."), P(buf2), theItem.quantity === 1 ? S("s") : S(""));
    confirmMessages();
    await messageWithColor(P(buf), G.itemMessageColor, 0);
    return false_;
  }
  theItem.flags = (theItem.flags & ~ITEM_EQUIPPED >>> 0) >>> 0;
  if (theItem.category & WEAPON) {
    G.player.info.damage.lowerBound = 1;
    G.player.info.damage.upperBound = 2;
    G.player.info.damage.clumpFactor = 1;
    G.rogue.weapon = null;
  }
  if (theItem.category & ARMOR) {
    G.player.info.defense = 0;
    G.rogue.armor = null;
    G.player.status[STATUS_DONNING] = 0;
  }
  if (theItem.category & RING) {
    if (G.rogue.ringLeft === theItem) {
      G.rogue.ringLeft = null;
    } else if (G.rogue.ringRight === theItem) {
      G.rogue.ringRight = null;
    }
    updateRingBonuses();
    if (theItem.kind === RING_CLAIRVOYANCE) {
      updateClairvoyance();
      await updateFieldOfViewDisplay(false_, false_);
      updateClairvoyance();
      await displayLevel();
    }
  }
  updateEncumbrance();
  return true_;
}

export function updateRingBonuses(): void {
  let i = 0;
  let rings = [G.rogue.ringLeft, G.rogue.ringRight];
  G.rogue.clairvoyance = G.rogue.stealthBonus = G.rogue.transference = G.rogue.awarenessBonus = G.rogue.regenerationBonus = G.rogue.wisdomBonus = G.rogue.reaping = 0;
  G.rogue.lightMultiplier = 1;
  for (i = 0; 1 >= i; i = i + 1 << 16 >> 16) {
    if (rings[i]) {
      switch (rings[i].kind) {
      case RING_CLAIRVOYANCE:
        G.rogue.clairvoyance = G.rogue.clairvoyance + effectiveRingEnchant(rings[i]) << 16 >> 16;
        break;
      case RING_STEALTH:
        G.rogue.stealthBonus = G.rogue.stealthBonus + effectiveRingEnchant(rings[i]) << 16 >> 16;
        break;
      case RING_REGENERATION:
        G.rogue.regenerationBonus = G.rogue.regenerationBonus + effectiveRingEnchant(rings[i]) << 16 >> 16;
        break;
      case RING_TRANSFERENCE:
        G.rogue.transference = G.rogue.transference + effectiveRingEnchant(rings[i]) << 16 >> 16;
        break;
      case RING_LIGHT:
        G.rogue.lightMultiplier = G.rogue.lightMultiplier + effectiveRingEnchant(rings[i]) << 16 >> 16;
        break;
      case RING_AWARENESS:
        G.rogue.awarenessBonus = G.rogue.awarenessBonus + 20 * effectiveRingEnchant(rings[i]) << 16 >> 16;
        break;
      case RING_WISDOM:
        G.rogue.wisdomBonus = G.rogue.wisdomBonus + effectiveRingEnchant(rings[i]) << 16 >> 16;
        break;
      case RING_REAPING:
        G.rogue.reaping = G.rogue.reaping + effectiveRingEnchant(rings[i]) << 16 >> 16;
        break;
      }
    }
  }
  if (0 >= G.rogue.lightMultiplier) {
    G.rogue.lightMultiplier = G.rogue.lightMultiplier - 1 << 16 >> 16;
  }
  updateMinersLightRadius();
  updatePlayerRegenerationDelay();
  if (0 > G.rogue.stealthBonus) {
    G.rogue.stealthBonus = G.rogue.stealthBonus * 4 << 16 >> 16;
  }
}

export function updatePlayerRegenerationDelay(): void {
  let maxHP = 0;
  let turnsForFull = 0;
  maxHP = G.player.info.maxHP;
  turnsForFull = turnsForFullRegenInThousandths($mul64(G.rogue.regenerationBonus, FP_FACTOR));
  G.player.regenPerTurn = 0;
  while (maxHP > Math.trunc(turnsForFull / 1000)) {
    G.player.regenPerTurn = G.player.regenPerTurn + 1 << 16 >> 16;
    maxHP = maxHP - Math.trunc(turnsForFull / 1000) << 16 >> 16;
  }
  G.player.info.turnsBetweenRegen = Math.trunc(turnsForFull / maxHP);
}

export function removeItemFromChain(theItem: struct_item | null, theChain: struct_item | null): number {
  let previousItem = null;
  for (previousItem = theChain; previousItem.nextItem; previousItem = previousItem.nextItem) {
    if (previousItem.nextItem === theItem) {
      previousItem.nextItem = theItem.nextItem;
      return true_;
    }
  }
  return false_;
}

export function addItemToChain(theItem: struct_item | null, theChain: struct_item | null): void {
  theItem.nextItem = theChain.nextItem;
  theChain.nextItem = theItem;
}

export function deleteItem(theItem: struct_item | null): void {
  free(theItem);
}

function resetItemTableEntry(theEntry: struct_itemTable | null): void {
  theEntry.identified = false_;
  theEntry.magicPolarityRevealed = false_;
  theEntry.called = false_;
  theEntry.callTitle[0] = 0;
}

export function shuffleFlavors(): void {
  let i = 0;
  let j = 0;
  let randIndex = 0;
  let randNumber = 0;
  let buf = new Int8Array(100);
  for (i = 0; G.gameConst.numberPotionKinds > i; i = i + 1 << 16 >> 16) {
    resetItemTableEntry($sadd(G.potionTable, i));
  }
  for (i = 0; NUMBER_STAFF_KINDS > i; i = i + 1 << 16 >> 16) {
    resetItemTableEntry($sadd(G.staffTable[0], i));
  }
  for (i = 0; G.gameConst.numberWandKinds > i; i = i + 1 << 16 >> 16) {
    resetItemTableEntry($sadd(G.wandTable, i));
  }
  for (i = 0; G.gameConst.numberScrollKinds > i; i = i + 1 << 16 >> 16) {
    resetItemTableEntry($sadd(G.scrollTable, i));
  }
  for (i = 0; NUMBER_RING_KINDS > i; i = i + 1 << 16 >> 16) {
    resetItemTableEntry($sadd(G.ringTable[0], i));
  }
  for (i = 0; NUMBER_ITEM_COLORS > i; i = i + 1 << 16 >> 16) {
    strcpy(P(G.itemColors[i]), P(G.itemColorsRef[i]));
  }
  for (i = 0; NUMBER_ITEM_COLORS > i; i = i + 1 << 16 >> 16) {
    randIndex = rand_range(0, NUMBER_ITEM_COLORS - 1) << 16 >> 16;
    if (randIndex !== i) {
      strcpy(P(buf), P(G.itemColors[i]));
      strcpy(P(G.itemColors[i]), P(G.itemColors[randIndex]));
      strcpy(P(G.itemColors[randIndex]), P(buf));
    }
  }
  for (i = 0; NUMBER_ITEM_WOODS > i; i = i + 1 << 16 >> 16) {
    strcpy(P(G.itemWoods[i]), P(G.itemWoodsRef[i]));
  }
  for (i = 0; NUMBER_ITEM_WOODS > i; i = i + 1 << 16 >> 16) {
    randIndex = rand_range(0, NUMBER_ITEM_WOODS - 1) << 16 >> 16;
    if (randIndex !== i) {
      strcpy(P(buf), P(G.itemWoods[i]));
      strcpy(P(G.itemWoods[i]), P(G.itemWoods[randIndex]));
      strcpy(P(G.itemWoods[randIndex]), P(buf));
    }
  }
  for (i = 0; NUMBER_ITEM_GEMS > i; i = i + 1 << 16 >> 16) {
    strcpy(P(G.itemGems[i]), P(G.itemGemsRef[i]));
  }
  for (i = 0; NUMBER_ITEM_GEMS > i; i = i + 1 << 16 >> 16) {
    randIndex = rand_range(0, NUMBER_ITEM_GEMS - 1) << 16 >> 16;
    if (randIndex !== i) {
      strcpy(P(buf), P(G.itemGems[i]));
      strcpy(P(G.itemGems[i]), P(G.itemGems[randIndex]));
      strcpy(P(G.itemGems[randIndex]), P(buf));
    }
  }
  for (i = 0; NUMBER_ITEM_METALS > i; i = i + 1 << 16 >> 16) {
    strcpy(P(G.itemMetals[i]), P(G.itemMetalsRef[i]));
  }
  for (i = 0; NUMBER_ITEM_METALS > i; i = i + 1 << 16 >> 16) {
    randIndex = rand_range(0, NUMBER_ITEM_METALS - 1) << 16 >> 16;
    if (randIndex !== i) {
      strcpy(P(buf), P(G.itemMetals[i]));
      strcpy(P(G.itemMetals[i]), P(G.itemMetals[randIndex]));
      strcpy(P(G.itemMetals[randIndex]), P(buf));
    }
  }
  for (i = 0; NUMBER_ITEM_TITLES > i; i = i + 1 << 16 >> 16) {
    G.itemTitles[i][0] = 0;
    randNumber = rand_range(3, 4) << 16 >> 16;
    for (j = 0; randNumber > j; j = j + 1 << 16 >> 16) {
      randIndex = rand_range(0, NUMBER_TITLE_PHONEMES - 1) << 16 >> 16;
      strcpy(P(buf), P(G.itemTitles[i]));
      sprintf(P(G.itemTitles[i]), S("%s%s%s"), P(buf), rand_percent(50) && j > 0 ? S(" ") : S(""), P(G.titlePhonemes[randIndex]));
    }
  }
}

export function itemValue(theItem: struct_item | null): number {
  switch (theItem.category) {
  case AMULET:
    return 35000;
    break;
  case GEM:
    return $u64(5000 * theItem.quantity);
    break;
  default:
    return 0;
    break;
  }
}

export function $init(): void {
}
