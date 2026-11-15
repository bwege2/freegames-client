// @ts-nocheck
// Brogue CE 1.15.1 RogueMain.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { cellHasTerrainFlag, digDungeon, initializeLevel, placeStairs, resetDFMessageEligibility, restoreItems, restoreMonster, setUpWaypoints, updateMapToShore, zeroOutGrid } from './Architect.ts';
import { strLenWithoutEscapes } from './Combat.ts';
import { calculateDistances, pathingDistance } from './Dijkstra.ts';
import { initializeGameVariantBrogue } from './GlobalsBrogue.ts';
import { initializeGameVariantBulletBrogue } from './GlobalsBulletBrogue.ts';
import { initializeGameVariantRapidBrogue } from './GlobalsRapidBrogue.ts';
import { allocGrid, fillGrid, freeGrid, getQualifyingPathLocNear } from './Grid.ts';
import { applyColorAverage, blackOutScreen, clearDisplayBuffer, clearMessageArchive, confirm, confirmMessages, deleteMessages, displayLevel, displayMoreSign, displayMoreSignWithoutWaitingForAcknowledgment, encodeMessageColor, executeKeystroke, executeMouseClick, flashTemporaryAlert, flavorMessage, funkyFade, getInputTextString, hideCursor, message, messageWithColor, nextBrogueEvent, plotCharToBuffer, printHighScores, printString, refreshDungeonCell, refreshSideBar, shuffleTerrainColors, upperCase } from './IO.ts';
import { addItemToPack, deleteItem, displayInventory, equipItem, generateItem, identify, isVowelish, itemAtLoc, itemName, itemValue, numberOfMatchingPackItems, placeItemAt, recalculateEquipmentBonuses, shuffleFlavors, updateRingBonuses } from './Items.ts';
import { deleteAllFlares } from './Light.ts';
import { mainBrogueJunction } from './MainMenu.ts';
import { rand_64bits, rand_range, seedRandomGenerator } from './Math.ts';
import { createCreatureList, distanceBetween, freeCreatureList, getQualifyingLocNear, hasNextCreature, initializeGender, initializeStatus, iterateCreatures, nextCreature, prependCreature, removeCreature, setPlayerDisplayChar, updateMonsterState } from './Monsters.ts';
import { describedItemName, storeMemories } from './Movement.ts';
import { RNGCheck, flushBufferToFile, initRecording, recordKeystroke, saveRecording, saveRecordingNoPrompt } from './Recordings.ts';
import { currentStealthRange, discoverCell, synchronizePlayerTimeState, updateEnvironment, updateVision } from './Time.ts';
import { notifyEvent, saveHighScore, saveRunHistory } from './platformdependent.ts';
import { struct_creature, struct_creatureList, struct_item, struct_levelData, struct_meteredItem, struct_pcell, struct_pos, struct_rogueEvent, struct_rogueHighScoresEntry, struct_screenDisplayBuffer, struct_tcell, struct_windowpos } from './structs.ts';
import { $at2, $cs, $mul64, $rd, $sadd, $sarr, $sat, $shr64, $u64, $wr, G, P, S, exit, fclose, fopen, free, memset, printf, sprintf, strcat, strcpy, strlen } from '../rt/index.ts';
import { ACKNOWLEDGE_KEY, ALL_ITEMS, AMULET, ANY_KIND_OF_VISIBLE, ARMOR, A_REFLECTION, COLS, DAGGER, DART, DCOLS, DISCOVERED, DROWS, EASY_MODE_KEY, ESCAPE_KEY, EXIT_STATUS_SUCCESS, FOOD, GAMEOVER_DEATH, GAMEOVER_QUIT, GAMEOVER_RECORDING, GAMEOVER_SUPERVICTORY, GAMEOVER_VICTORY, GAME_MODE_EASY, GAME_MODE_NORMAL, GAME_MODE_WIZARD, GEM, G_AMULET, G_GOLD, HAS_ITEM, HAS_MONSTER, HAS_PLAYER, HAS_STAIRS, INVENTORY_KEY, IS_IN_MACHINE, ITEM_CURSED, ITEM_MAGIC_DETECTED, ITEM_PROTECTED, ITEM_RUNIC, ITEM_RUNIC_HINTED, KEYBOARD_LABELS, KEYSTROKE, LEATHER_ARMOR, MAGIC_MAPPED, MAX_ITEMS_IN_MONSTER_ITEMS_HOPPER, MAX_WAYPOINT_COUNT, MA_ENTER_SUMMONS, MB_ADMINISTRATIVE_DEATH, MB_APPROACHING_DOWNSTAIRS, MB_APPROACHING_PIT, MB_APPROACHING_UPSTAIRS, MB_CAPTIVE, MB_DOES_NOT_RESURRECT, MB_HAS_DIED, MB_IS_DYING, MB_WEAPON_AUTO_ID, MESSAGE_ARCHIVE_ENTRIES, MESSAGE_LINES, MINERS_LIGHT, MONSTER_ALLY, MONSTER_TRACKING_SCENT, MONST_INANIMATE, MONST_RESTRICTED_TO_LIQUID, MONST_WILL_NOT_USE_STAIRS, MOUSE_UP, NUMBER_DYNAMIC_COLORS, NUMBER_MONSTER_KINDS, NUMBER_TERRAIN_LAYERS, PERMANENT_TILE_FLAGS, RATION, REQUIRE_ACKNOWLEDGMENT, RIGHT_MOUSE_UP, RING, RING_AWARENESS, RING_CLAIRVOYANCE, RNG_COSMETIC, RNG_SUBSTANTIVE, ROWS, STAFF, STAFF_ENTRANCEMENT, STAFF_FIRE, STAFF_LIGHTNING, STAFF_OBSTRUCTION, STAFF_TUNNELING, STATUS_DONNING, STATUS_ENTERS_LEVEL_IN, STATUS_ENTRANCED, STATUS_LEVITATING, STATUS_NUTRITION, STATUS_PARALYZED, STAT_BAR_WIDTH, STOMACH_SIZE, TEXT_INPUT_FILENAME, T_AUTO_DESCENT, T_DIVIDES_LEVEL, T_ENTANGLES, T_IS_DEEP_WATER, T_OBSTRUCTS_PASSABILITY, T_PATHING_BLOCKER, T_SACRED, VARIANT_BULLET_BROGUE, VARIANT_RAPID_BROGUE, WAND, WAND_BECKONING, WAND_DOMINATION, WAND_NEGATION, WAND_PLENTY, WEAPON, W_QUIETUS, false_, true_ } from './consts.ts';


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

export async function rogueMain(): Promise<number> {
  G.previousGameSeed = 0n;
  await mainBrogueJunction();
  return G.rogue.gameExitStatusCode;
}

export function printBrogueVersion(): void {
  printf(S("Brogue version: %s\n"), G.brogueVersion);
  printf(S("Supports variant (rapid_brogue): %s\n"), G.rapidBrogueVersion);
  printf(S("Supports variant (bullet_brogue): %s\n"), G.bulletBrogueVersion);
}

export async function executeEvent(theEvent: struct_rogueEvent | null): Promise<void> {
  G.rogue.playbackBetweenTurns = false_;
  if (theEvent.eventType >>> 0 === KEYSTROKE) {
    await executeKeystroke(theEvent.param1, theEvent.controlKey, theEvent.shiftKey);
  } else if (theEvent.eventType >>> 0 === MOUSE_UP || theEvent.eventType >>> 0 === RIGHT_MOUSE_UP) {
    await executeMouseClick(theEvent);
  }
}

export function fileExists(pathname: Ptr | null): number {
  let openedFile = null;
  openedFile = fopen(pathname, S("rb"));
  if (openedFile) {
    fclose(openedFile);
    return true_;
  } else {
    return false_;
  }
}

export async function chooseFile(path: Ptr | null, prompt: Ptr | null, defaultName: Ptr | null, suffix: Ptr | null): Promise<number> {
  if (await getInputTextString(path, prompt, (100 - 20 - 1 - 25 < $u64(4096 > 1024 * 4 ? 1024 * 4 : 4096) - strlen(suffix) ? 100 - 20 - 1 - 25 : $u64(4096 > 1024 * 4 ? 1024 * 4 : 4096) - strlen(suffix)) << 16 >> 16, defaultName, suffix, TEXT_INPUT_FILENAME, false_) && path.a[path.o] !== 0) {
    strcat(path, suffix);
    return true_;
  } else {
    return false_;
  }
}

export function openFile(path: Ptr | null): number {
  let i = 0;
  let buf = new Int8Array(4096);
  let retval = 0;
  if (fileExists(path)) {
    strcpy(P(G.currentFilePath), path);
    G.annotationPathname[0] = 0;
    strcpy(P(buf), path);
    for (i = strlen(path) << 16 >> 16; buf[i] !== 46 && i > 0; i = i - 1 << 16 >> 16) {
      continue;
    }
    if (buf[i] === 46 && $u64(i) + strlen(S(".txt")) < $u64(4096 > 1024 * 4 ? 1024 * 4 : 4096)) {
      buf[i] = 0;
      strcat(P(buf), S(".txt"));
      strcpy(P(G.annotationPathname), P(buf));
    }
    retval = true_;
  } else {
    retval = false_;
  }
  return retval;
}

function getOrdinalSuffix(number: number): Ptr | null {
  if (number === 11 || number === 12 || number === 13) {
    return S("th");
  }
  let lastDigit = number % 10;
  switch (lastDigit) {
  case 1:
    return S("st");
  case 2:
    return S("nd");
  case 3:
    return S("rd");
  default:
    return S("th");
  }
}

async function welcome(): Promise<void> {
  let buf = new Int8Array(237);
  let buf2 = new Int8Array(237);
  await message(S("Hello and welcome, adventurer, to the Dungeons of Doom!"), 0);
  strcpy(P(buf), S("Retrieve the "));
  encodeMessageColor(P(buf), strlen(P(buf)) << 16 >> 16, G.itemMessageColor);
  strcat(P(buf), S("Amulet of Yendor"));
  encodeMessageColor(P(buf), strlen(P(buf)) << 16 >> 16, G.white);
  sprintf(P(buf2), S(" from the %i%s floor and escape with it!"), G.gameConst.amuletLevel, getOrdinalSuffix(G.gameConst.amuletLevel));
  strcat(P(buf), P(buf2));
  await message(P(buf), 0);
  if (KEYBOARD_LABELS) {
    await messageWithColor(S("Press <?> for help at any time."), G.backgroundMessageColor, 0);
  }
  flavorMessage(S("The doors to the dungeon slam shut behind you."));
}

export function initializeGameVariant(): void {
  switch (G.gameVariant) {
  case VARIANT_RAPID_BROGUE:
    initializeGameVariantRapidBrogue();
    break;
  case VARIANT_BULLET_BROGUE:
    initializeGameVariantBulletBrogue();
    break;
  default:
    initializeGameVariantBrogue();
  }
}

export async function initializeRogue(seed: bigint): Promise<void> {
  let $t1: any;
  let i = 0;
  let j = 0;
  let k = 0;
  let theItem = null;
  let playingback = 0;
  let playbackFF = 0;
  let playbackPaused = 0;
  let displayStealthRangeMode = 0;
  let trueColorMode = 0;
  let hideSeed = 0;
  let oldRNG = 0;
  let currentGamePath = new Int8Array(4096);
  let mode = 0;
  playingback = G.rogue.playbackMode;
  playbackPaused = G.rogue.playbackPaused;
  playbackFF = G.rogue.playbackFastForward;
  mode = G.rogue.mode;
  hideSeed = G.rogue.hideSeed;
  displayStealthRangeMode = G.rogue.displayStealthRangeMode;
  trueColorMode = G.rogue.trueColorMode;
  strcpy(P(currentGamePath), P(G.rogue.currentGamePath));
  if (!!G.rogue.meteredItems) {
    free(G.rogue.meteredItems);
  }
  memset(G.rogue, 0, 14368);
  G.rogue.playbackMode = playingback;
  G.rogue.playbackPaused = playbackPaused;
  G.rogue.playbackFastForward = playbackFF;
  G.rogue.mode = mode;
  G.rogue.hideSeed = hideSeed;
  G.rogue.displayStealthRangeMode = displayStealthRangeMode;
  G.rogue.trueColorMode = trueColorMode;
  G.rogue.gameHasEnded = false_;
  G.rogue.gameInProgress = true_;
  G.rogue.highScoreSaved = false_;
  G.rogue.cautiousMode = false_;
  G.rogue.milliseconds = 0;
  G.rogue.meteredItems = $sarr(struct_meteredItem, $u64(G.gameConst.numberMeteredItems))[0];
  G.rogue.featRecord = P(new Int8Array($u64(G.gameConst.numberFeats)));
  strcpy(P(G.rogue.currentGamePath), P(currentGamePath));
  G.rogue.RNG = RNG_SUBSTANTIVE;
  if (!G.rogue.playbackMode) {
    G.rogue.seed = seedRandomGenerator(seed);
    G.previousGameSeed = G.rogue.seed;
  }
  await initRecording();
  G.levels = $sarr(struct_levelData, 201680 * $u64(G.gameConst.deepestLevel + 1) / 201680)[0];
  G.levels.upStairsLoc.x = ((DCOLS - 1) / 2 | 0) - 1 << 16 >> 16;
  G.levels.upStairsLoc.y = DROWS - 2;
  for (i = 0; G.gameConst.numberMeteredItems > i; i = i + 1 << 16 >> 16) {
    $sadd(G.rogue.meteredItems, i).frequency = $sadd(G.meteredItemsGenerationTable, i).initialFrequency;
  }
  resetDFMessageEligibility();
  for (i = 0; G.gameConst.deepestLevel + 1 > i; i = i + 1 << 16 >> 16) {
    if (G.rogue.seed >> 32n) {
      $sadd(G.levels, i).levelSeed = rand_64bits();
    } else {
      $sadd(G.levels, i).levelSeed = BigInt.asUintN(64, BigInt($u64(rand_range(0, 9999))));
      ($t1 = $sadd(G.levels, i), $t1.levelSeed = BigInt.asUintN(64, $t1.levelSeed + BigInt.asUintN(64, BigInt(10000 * $u64(rand_range(0, 9999))))));
    }
    if ($sadd(G.levels, i).levelSeed === 0n) {
      $sadd(G.levels, i).levelSeed = BigInt.asUintN(64, BigInt(i + 1));
    }
    $sadd(G.levels, i).monsters.$cp(createCreatureList());
    ;
    $sadd(G.levels, i).dormantMonsters.$cp(createCreatureList());
    ;
    $sadd(G.levels, i).items = null;
    $sadd(G.levels, i).scentMap = null;
    $sadd(G.levels, i).visited = false_;
    $sadd(G.levels, i).playerExitedVia.$cp(struct_pos.$of());
    do {
      $sadd(G.levels, i).downStairsLoc.x = rand_range(1, DCOLS - 2) << 16 >> 16;
      $sadd(G.levels, i).downStairsLoc.y = rand_range(1, DROWS - 2) << 16 >> 16;
    } while (distanceBetween($sadd(G.levels, i).upStairsLoc, $sadd(G.levels, i).downStairsLoc) < (DCOLS / 3 | 0));
    if (G.gameConst.deepestLevel > i) {
      $sadd(G.levels, (i + 1)).upStairsLoc.x = $sadd(G.levels, i).downStairsLoc.x;
      $sadd(G.levels, (i + 1)).upStairsLoc.y = $sadd(G.levels, i).downStairsLoc.y;
    }
  }
  for (i = 0; MAX_WAYPOINT_COUNT > i; i = i + 1 << 16 >> 16) {
    G.rogue.wpDistance[i] = allocGrid();
    fillGrid(G.rogue.wpDistance[i], 0);
  }
  G.rogue.rewardRoomsGenerated = 0;
  oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      for (k = 0; 8 > k; k = k + 1 << 16 >> 16) {
        G.terrainRandomValues[i][j][k] = rand_range(0, 1000) << 16 >> 16;
      }
    }
  }
  G.rogue.RNG = oldRNG;
  ;
  zeroOutGrid(P(G.displayDetail));
  for (i = 0; NUMBER_MONSTER_KINDS > i; i = i + 1 << 16 >> 16) {
    G.monsterCatalog[i].monsterID = i;
  }
  shuffleFlavors();
  for (i = 0; G.gameConst.numberFeats > i; i = i + 1 << 16 >> 16) {
    G.rogue.featRecord.a[G.rogue.featRecord.o + i] = $sadd(G.featTable, i).initialValue;
  }
  deleteMessages();
  for (i = 0; MESSAGE_ARCHIVE_ENTRIES > i; i = i + 1 << 16 >> 16) {
    G.messageArchive[i].message[0] = 0;
  }
  G.messageArchivePosition = 0;
  G.floorItems = new struct_item();
  memset(G.floorItems, 0, 352);
  G.floorItems.nextItem = null;
  G.packItems = new struct_item();
  memset(G.packItems, 0, 352);
  G.packItems.nextItem = null;
  G.monsterItemsHopper = new struct_item();
  memset(G.monsterItemsHopper, 0, 352);
  G.monsterItemsHopper.nextItem = null;
  for (i = 0; MAX_ITEMS_IN_MONSTER_ITEMS_HOPPER > i; i = i + 1 << 16 >> 16) {
    theItem = await generateItem(ALL_ITEMS & ~FOOD, -1);
    theItem.nextItem = G.monsterItemsHopper.nextItem;
    G.monsterItemsHopper.nextItem = theItem;
  }
  G.monsters = G.levels.monsters;
  G.dormantMonsters = G.levels.dormantMonsters;
  G.purgatory.$cp(createCreatureList());
  G.scentMap = null;
  G.safetyMap = allocGrid();
  G.allySafetyMap = allocGrid();
  G.chokeMap = allocGrid();
  G.rogue.mapToSafeTerrain = allocGrid();
  fillGrid(G.safetyMap, 0);
  fillGrid(G.allySafetyMap, 0);
  fillGrid(G.chokeMap, 0);
  fillGrid(G.rogue.mapToSafeTerrain, 0);
  memset(G.player, 0, 600);
  G.player.info.$cp(G.monsterCatalog[0]);
  setPlayerDisplayChar();
  initializeGender(G.player);
  G.player.movementSpeed = G.player.info.movementSpeed;
  G.player.attackSpeed = G.player.info.attackSpeed;
  initializeStatus(G.player);
  G.player.carriedItem = null;
  G.player.currentHP = G.player.info.maxHP;
  G.player.creatureState = MONSTER_ALLY;
  G.player.ticksUntilTurn = 0;
  G.player.mutationIndex = -1;
  G.rogue.depthLevel = 1;
  G.rogue.deepestLevel = 1;
  G.rogue.scentTurnNumber = 1000;
  G.rogue.playerTurnNumber = 0;
  G.rogue.absoluteTurnNumber = 0;
  G.rogue.previousPoisonPercent = 0;
  G.rogue.foodSpawned = 0;
  G.rogue.gold = 0;
  G.rogue.goldGenerated = 0;
  G.rogue.disturbed = false_;
  G.rogue.autoPlayingLevel = false_;
  G.rogue.automationActive = false_;
  G.rogue.justRested = false_;
  G.rogue.justSearched = false_;
  G.rogue.inWater = false_;
  G.rogue.creaturesWillFlashThisTurn = false_;
  G.rogue.updatedSafetyMapThisTurn = false_;
  G.rogue.updatedAllySafetyMapThisTurn = false_;
  G.rogue.updatedMapToSafeTerrainThisTurn = false_;
  G.rogue.updatedMapToShoreThisTurn = false_;
  G.rogue.strength = 12;
  G.rogue.weapon = null;
  G.rogue.armor = null;
  G.rogue.ringLeft = null;
  G.rogue.ringRight = null;
  G.rogue.swappedIn = null;
  G.rogue.swappedOut = null;
  G.rogue.monsterSpawnFuse = rand_range(125, 175) & 0xffff;
  G.rogue.ticksTillUpdateEnvironment = 100;
  G.rogue.mapToShore = null;
  G.rogue.cursorLoc.$cp(struct_pos.$of(-1, -1));
  G.rogue.xpxpThisTurn = 0;
  G.rogue.yendorWarden = null;
  G.rogue.flares = null;
  G.rogue.flareCount = G.rogue.flareCapacity = 0;
  G.rogue.minersLight.$cp(G.lightCatalog[MINERS_LIGHT]);
  G.rogue.clairvoyance = G.rogue.regenerationBonus = G.rogue.stealthBonus = G.rogue.transference = G.rogue.wisdomBonus = G.rogue.reaping = 0;
  G.rogue.lightMultiplier = 1;
  theItem = await generateItem(FOOD, RATION);
  theItem = addItemToPack(theItem);
  theItem = await generateItem(WEAPON, DAGGER);
  theItem.enchant1 = theItem.enchant2 = 0;
  theItem.flags = (theItem.flags & ~(ITEM_CURSED | ITEM_RUNIC) >>> 0) >>> 0;
  identify(theItem);
  theItem = addItemToPack(theItem);
  await equipItem(theItem, false_, null);
  theItem = await generateItem(WEAPON, DART);
  theItem.enchant1 = theItem.enchant2 = 0;
  theItem.quantity = 15;
  theItem.flags = (theItem.flags & ~(ITEM_CURSED | ITEM_RUNIC) >>> 0) >>> 0;
  identify(theItem);
  theItem = addItemToPack(theItem);
  theItem = await generateItem(ARMOR, LEATHER_ARMOR);
  theItem.enchant1 = 0;
  theItem.flags = (theItem.flags & ~(ITEM_CURSED | ITEM_RUNIC) >>> 0) >>> 0;
  identify(theItem);
  theItem = addItemToPack(theItem);
  await equipItem(theItem, false_, null);
  G.player.status[STATUS_DONNING] = 0;
  recalculateEquipmentBonuses();
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    G.rogue.playbackOmniscience = 1;
  }
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD) {
    theItem = await generateItem(RING, RING_CLAIRVOYANCE);
    theItem.enchant1 = (31 + 3 - 3 - 2 > 100 - 20 - 1 ? 31 + 3 - 3 - 2 : 100 - 20 - 1) << 16 >> 16;
    theItem.flags = (theItem.flags & ~ITEM_CURSED >>> 0) >>> 0;
    identify(theItem);
    theItem = addItemToPack(theItem);
    theItem = await generateItem(RING, RING_AWARENESS);
    theItem.enchant1 = 30;
    theItem.flags = (theItem.flags & ~ITEM_CURSED >>> 0) >>> 0;
    identify(theItem);
    theItem = addItemToPack(theItem);
    theItem = await generateItem(WEAPON, DAGGER);
    theItem.enchant1 = 50;
    theItem.enchant2 = W_QUIETUS;
    theItem.flags = (theItem.flags & ~ITEM_CURSED >>> 0) >>> 0;
    theItem.flags = (theItem.flags | (ITEM_PROTECTED | ITEM_RUNIC | ITEM_RUNIC_HINTED)) >>> 0;
    theItem.damage.lowerBound = theItem.damage.upperBound = 25;
    identify(theItem);
    theItem = addItemToPack(theItem);
    theItem = await generateItem(ARMOR, LEATHER_ARMOR);
    theItem.enchant1 = 50;
    theItem.enchant2 = A_REFLECTION;
    theItem.flags = (theItem.flags & ~(ITEM_CURSED | ITEM_RUNIC_HINTED) >>> 0) >>> 0;
    theItem.flags = (theItem.flags | (ITEM_PROTECTED | ITEM_RUNIC)) >>> 0;
    identify(theItem);
    theItem = addItemToPack(theItem);
    theItem = await generateItem(STAFF, STAFF_FIRE);
    theItem.enchant1 = 10;
    theItem.charges = 300;
    identify(theItem);
    theItem = addItemToPack(theItem);
    theItem = await generateItem(STAFF, STAFF_LIGHTNING);
    theItem.enchant1 = 10;
    theItem.charges = 300;
    identify(theItem);
    theItem = addItemToPack(theItem);
    theItem = await generateItem(STAFF, STAFF_TUNNELING);
    theItem.enchant1 = 10;
    theItem.charges = 3000;
    identify(theItem);
    theItem = addItemToPack(theItem);
    theItem = await generateItem(STAFF, STAFF_OBSTRUCTION);
    theItem.enchant1 = 10;
    theItem.charges = 300;
    identify(theItem);
    theItem = addItemToPack(theItem);
    theItem = await generateItem(STAFF, STAFF_ENTRANCEMENT);
    theItem.enchant1 = 10;
    theItem.charges = 300;
    identify(theItem);
    theItem = addItemToPack(theItem);
    theItem = await generateItem(WAND, WAND_BECKONING);
    theItem.charges = 3000;
    identify(theItem);
    theItem = addItemToPack(theItem);
    theItem = await generateItem(WAND, WAND_DOMINATION);
    theItem.charges = 300;
    identify(theItem);
    theItem = addItemToPack(theItem);
    theItem = await generateItem(WAND, WAND_PLENTY);
    theItem.charges = 300;
    identify(theItem);
    theItem = addItemToPack(theItem);
    theItem = await generateItem(WAND, WAND_NEGATION);
    theItem.charges = 300;
    identify(theItem);
    theItem = addItemToPack(theItem);
  }
  clearMessageArchive();
  blackOutScreen();
  await welcome();
}

function updateColors(): void {
  let i = 0;
  for (i = 0; NUMBER_DYNAMIC_COLORS > i; i = i + 1 << 16 >> 16) {
    G.dynamicColors[i].$cp(G.dynamicColorsBounds[i][0]);
    applyColorAverage(G.dynamicColors[i], G.dynamicColorsBounds[i][1], ((0 > (G.rogue.depthLevel * 100 / G.gameConst.amuletLevel | 0) ? 0 : G.rogue.depthLevel * 100 / G.gameConst.amuletLevel | 0) > 100 ? 100 : 0 > (G.rogue.depthLevel * 100 / G.gameConst.amuletLevel | 0) ? 0 : G.rogue.depthLevel * 100 / G.gameConst.amuletLevel | 0) << 16 >> 16);
  }
}

export async function startLevel(oldLevelNumber: number, stairDirection: number): Promise<void> {
  let $t1: any, $t2: any;
  let oldSeed = 0n;
  let theItem = null;
  let i = 0;
  let j = 0;
  let x = 0;
  let y = 0;
  let px = 0;
  let py = 0;
  let flying = 0;
  let dir = 0;
  let placedPlayer = 0;
  let layer = 0;
  let timeAway = 0;
  let mapToStairs = null;
  let mapToPit = null;
  let connectingStairsDiscovered = 0;
  if (oldLevelNumber === G.gameConst.deepestLevel && stairDirection !== -1) {
    return;
  }
  synchronizePlayerTimeState();
  G.rogue.updatedSafetyMapThisTurn = false_;
  G.rogue.updatedAllySafetyMapThisTurn = false_;
  G.rogue.updatedMapToSafeTerrainThisTurn = false_;
  G.rogue.cursorLoc.$cp(struct_pos.$of(-1, -1));
  G.rogue.lastTarget = null;
  connectingStairsDiscovered = ((pmapAt(G.rogue.downLoc).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0 ? true_ : false_) << 24 >> 24;
  if (stairDirection === 0) {
    $sadd(G.levels, (oldLevelNumber - 1)).playerExitedVia.$cp(struct_pos.$of(G.player.loc.x, G.player.loc.y));
  }
  if (oldLevelNumber !== G.rogue.depthLevel) {
    px = G.player.loc.x;
    py = G.player.loc.y;
    if (cellHasTerrainFlag(G.player.loc, T_AUTO_DESCENT)) {
      for (i = 0; 8 > i; i = i + 1 << 16 >> 16) {
        if (!cellHasTerrainFlag(struct_pos.$of(G.player.loc.x + G.nbDirs[i][0] << 16 >> 16, G.player.loc.y + G.nbDirs[i][1] << 16 >> 16), T_PATHING_BLOCKER)) {
          px = G.player.loc.x + G.nbDirs[i][0] << 16 >> 16;
          py = G.player.loc.y + G.nbDirs[i][1] << 16 >> 16;
          break;
        }
      }
    }
    mapToStairs = allocGrid();
    fillGrid(mapToStairs, 0);
    for (flying = 0; 1 >= flying; flying = flying + 1 << 16 >> 16) {
      fillGrid(mapToStairs, 0);
      calculateDistances(mapToStairs, px, py, $u64((flying ? T_OBSTRUCTS_PASSABILITY : T_PATHING_BLOCKER) | T_SACRED), null, true_, true_);
      for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
        let monst = nextCreature(it);
        x = monst.loc.x;
        y = monst.loc.y;
        if ((monst.creatureState >>> 0 === MONSTER_TRACKING_SCENT && (stairDirection !== 0 || monst.status[STATUS_LEVITATING]) || monst.creatureState >>> 0 === MONSTER_ALLY || monst === G.rogue.yendorWarden) && (stairDirection !== 0 || monst.currentHP > 10 || monst.status[STATUS_LEVITATING]) && (flying !== 0 ? 1 : 0) === (monst.status[STATUS_LEVITATING] !== 0 || cellHasTerrainFlag(struct_pos.$of(x, y), T_PATHING_BLOCKER) || cellHasTerrainFlag(struct_pos.$of(px, py), T_AUTO_DESCENT) ? 1 : 0) && !((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) && !((monst.info.flags & (MONST_WILL_NOT_USE_STAIRS | MONST_RESTRICTED_TO_LIQUID)) >>> 0) && !cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY) && !monst.status[STATUS_ENTRANCED] && !monst.status[STATUS_PARALYZED] && (30000 > $rd(mapToStairs.a[mapToStairs.o + monst.loc.x], monst.loc.y) || monst.creatureState >>> 0 === MONSTER_ALLY || monst === G.rogue.yendorWarden)) {
          monst.status[STATUS_ENTERS_LEVEL_IN] = (((Math.imul($rd(mapToStairs.a[mapToStairs.o + monst.loc.x], monst.loc.y), monst.movementSpeed) / 100 | 0) + 1 > 1 ? (Math.imul($rd(mapToStairs.a[mapToStairs.o + monst.loc.x], monst.loc.y), monst.movementSpeed) / 100 | 0) + 1 : 1) > 150 ? 150 : (Math.imul($rd(mapToStairs.a[mapToStairs.o + monst.loc.x], monst.loc.y), monst.movementSpeed) / 100 | 0) + 1 > 1 ? (Math.imul($rd(mapToStairs.a[mapToStairs.o + monst.loc.x], monst.loc.y), monst.movementSpeed) / 100 | 0) + 1 : 1) << 16 >> 16;
          switch (stairDirection) {
          case 1:
            monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_APPROACHING_DOWNSTAIRS) >>> 0;
            break;
          case -1:
            monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_APPROACHING_UPSTAIRS) >>> 0;
            break;
          case 0:
            monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_APPROACHING_PIT) >>> 0;
            break;
          default:
            break;
          }
        }
      }
    }
    freeGrid(mapToStairs);
  }
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if (monst.mapToMe) {
      freeGrid(monst.mapToMe);
      monst.mapToMe = null;
    }
  }
  $sadd(G.levels, (oldLevelNumber - 1)).items = G.floorItems.nextItem;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (($at2(G.pmap, i, j).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
        storeMemories(i, j);
      }
      for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
        $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).layers[layer] = $at2(G.pmap, i, j).layers[layer];
      }
      $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).volume = $at2(G.pmap, i, j).volume;
      $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).flags = ($at2(G.pmap, i, j).flags & PERMANENT_TILE_FLAGS) >>> 0;
      $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).machineNumber = $at2(G.pmap, i, j).machineNumber;
      $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).rememberedAppearance.$cp($at2(G.pmap, i, j).rememberedAppearance);
      $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).rememberedItemCategory = $at2(G.pmap, i, j).rememberedItemCategory;
      $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).rememberedItemKind = $at2(G.pmap, i, j).rememberedItemKind;
      $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).rememberedItemQuantity = $at2(G.pmap, i, j).rememberedItemQuantity;
      $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).rememberedItemOriginDepth = $at2(G.pmap, i, j).rememberedItemOriginDepth;
      $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).rememberedTerrain = $at2(G.pmap, i, j).rememberedTerrain;
      $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).rememberedCellFlags = $at2(G.pmap, i, j).rememberedCellFlags;
      $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).rememberedTerrainFlags = $at2(G.pmap, i, j).rememberedTerrainFlags;
      $at2($sadd(G.levels, (oldLevelNumber - 1)).mapStorage, i, j).rememberedTMFlags = $at2(G.pmap, i, j).rememberedTMFlags;
    }
  }
  $sadd(G.levels, (oldLevelNumber - 1)).awaySince = G.rogue.absoluteTurnNumber;
  G.rogue.minersLightRadius = 5111808;
  for (i = 0; Math.imul(G.rogue.depthLevel, G.gameConst.depthAccelerator) > i; i = i + 1 << 16 >> 16) {
    G.rogue.minersLightRadius = Math.trunc($mul64(G.rogue.minersLightRadius, 85) / 100);
  }
  G.rogue.minersLightRadius += Math.trunc(14745600 / 100);
  updateColors();
  updateRingBonuses();
  if (!$sadd(G.levels, (G.rogue.depthLevel - 1)).visited) {
    $sadd(G.levels, (G.rogue.depthLevel - 1)).scentMap = allocGrid();
    G.scentMap = $sadd(G.levels, (G.rogue.depthLevel - 1)).scentMap;
    fillGrid($sadd(G.levels, (G.rogue.depthLevel - 1)).scentMap, 0);
    do {
      oldSeed = rand_64bits();
    } while (oldSeed === 0n);
    seedRandomGenerator($sadd(G.levels, (G.rogue.depthLevel - 1)).levelSeed);
    G.monsters = $sadd(G.levels, (G.rogue.depthLevel - 1)).monsters;
    G.dormantMonsters = $sadd(G.levels, (G.rogue.depthLevel - 1)).dormantMonsters;
    G.floorItems.nextItem = $sadd(G.levels, (G.rogue.depthLevel - 1)).items;
    $sadd(G.levels, (G.rogue.depthLevel - 1)).items = null;
    let upStairLocation = new struct_pos();
    let failsafe = 0;
    for (failsafe = 50; failsafe; --failsafe) {
      await digDungeon();
      if (await placeStairs(upStairLocation)) {
        break;
      }
    }
    if (!failsafe) {
      printf(S("\nFailed to place stairs for level %d! Please report this error\n"), G.rogue.depthLevel);
      exit(1);
    }
    await initializeLevel(upStairLocation.$clone());
    setUpWaypoints();
    await shuffleTerrainColors(100, false_);
    if (G.rogue.depthLevel === G.gameConst.amuletLevel && !await numberOfMatchingPackItems(AMULET, 0, 0, false_) && $sadd(G.levels, (G.rogue.depthLevel - 1)).visited === false_) {
      for (theItem = G.floorItems.nextItem; !!theItem; theItem = theItem.nextItem) {
        if (theItem.category & AMULET) {
          break;
        }
      }
      for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
        let monst = nextCreature(it);
        if (monst.carriedItem && monst.carriedItem.category & AMULET) {
          theItem = monst.carriedItem;
          break;
        }
      }
      if (!theItem) {
        await placeItemAt(await generateItem(AMULET, 0), struct_pos.$of(-1, -1));
      }
    }
    seedRandomGenerator(oldSeed);
    timeAway = 50;
  } else {
    G.scentMap = $sadd(G.levels, (G.rogue.depthLevel - 1)).scentMap;
    timeAway = (0 > G.rogue.absoluteTurnNumber - $sadd(G.levels, (G.rogue.depthLevel - 1)).awaySince ? 0 : G.rogue.absoluteTurnNumber - $sadd(G.levels, (G.rogue.depthLevel - 1)).awaySince) > 30000 ? 30000 : 0 > G.rogue.absoluteTurnNumber - $sadd(G.levels, (G.rogue.depthLevel - 1)).awaySince ? 0 : G.rogue.absoluteTurnNumber - $sadd(G.levels, (G.rogue.depthLevel - 1)).awaySince;
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
          $at2(G.pmap, i, j).layers[layer] = $at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).layers[layer];
        }
        $at2(G.pmap, i, j).volume = $at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).volume;
        $at2(G.pmap, i, j).flags = ($at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).flags & PERMANENT_TILE_FLAGS) >>> 0;
        $at2(G.pmap, i, j).machineNumber = $at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).machineNumber;
        $at2(G.pmap, i, j).rememberedAppearance.$cp($at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).rememberedAppearance);
        $at2(G.pmap, i, j).rememberedItemCategory = $at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).rememberedItemCategory;
        $at2(G.pmap, i, j).rememberedItemKind = $at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).rememberedItemKind;
        $at2(G.pmap, i, j).rememberedItemQuantity = $at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).rememberedItemQuantity;
        $at2(G.pmap, i, j).rememberedItemOriginDepth = $at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).rememberedItemOriginDepth;
        $at2(G.pmap, i, j).rememberedTerrain = $at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).rememberedTerrain;
        $at2(G.pmap, i, j).rememberedCellFlags = $at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).rememberedCellFlags;
        $at2(G.pmap, i, j).rememberedTerrainFlags = $at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).rememberedTerrainFlags;
        $at2(G.pmap, i, j).rememberedTMFlags = $at2($sadd(G.levels, (G.rogue.depthLevel - 1)).mapStorage, i, j).rememberedTMFlags;
      }
    }
    setUpWaypoints();
    G.rogue.downLoc.$cp($sadd(G.levels, (G.rogue.depthLevel - 1)).downStairsLoc);
    G.rogue.upLoc.$cp($sadd(G.levels, (G.rogue.depthLevel - 1)).upStairsLoc);
    G.monsters = $sadd(G.levels, (G.rogue.depthLevel - 1)).monsters;
    G.dormantMonsters = $sadd(G.levels, (G.rogue.depthLevel - 1)).dormantMonsters;
    G.floorItems.nextItem = $sadd(G.levels, (G.rogue.depthLevel - 1)).items;
    $sadd(G.levels, (G.rogue.depthLevel - 1)).items = null;
    await restoreItems();
  }
  px = G.player.loc.x;
  py = G.player.loc.y;
  G.player.loc.x = G.player.loc.y = 0;
  let currentTurnNumber = G.rogue.absoluteTurnNumber;
  timeAway = 100 > timeAway ? timeAway : 100;
  while (($t1 = timeAway, timeAway = $u64($t1 - 1), $t1)) {
    G.rogue.absoluteTurnNumber = (currentTurnNumber > timeAway ? currentTurnNumber : timeAway) - timeAway;
    await updateEnvironment();
  }
  G.rogue.absoluteTurnNumber = currentTurnNumber;
  G.player.loc.x = px;
  G.player.loc.y = py;
  if (0 >= G.rogue.ticksTillUpdateEnvironment) {
    G.rogue.ticksTillUpdateEnvironment = G.rogue.ticksTillUpdateEnvironment + 100 << 16 >> 16;
  }
  if (!$sadd(G.levels, (G.rogue.depthLevel - 1)).visited) {
    $sadd(G.levels, (G.rogue.depthLevel - 1)).visited = true_;
    if (G.rogue.depthLevel === G.gameConst.amuletLevel) {
      await messageWithColor(G.levelFeelings.message, G.levelFeelings.color, 0);
    } else if (G.rogue.depthLevel === G.gameConst.deepestLevel) {
      await messageWithColor($sadd(G.levelFeelings, 1).message, $sadd(G.levelFeelings, 1).color, 0);
    }
  }
  let loc = new struct_pos();
  if (stairDirection === 0) {
    getQualifyingLocNear(loc, G.player.loc.$clone(), true_, null, T_PATHING_BLOCKER & ~T_IS_DEEP_WATER, HAS_MONSTER | HAS_ITEM | HAS_STAIRS | IS_IN_MACHINE, false_, false_);
    if (cellHasTerrainFlag(loc, T_IS_DEEP_WATER)) {
      let dryLoc = new struct_pos();
      getQualifyingLocNear(dryLoc, G.player.loc.$clone(), true_, null, T_PATHING_BLOCKER, HAS_MONSTER | HAS_ITEM | HAS_STAIRS | IS_IN_MACHINE, false_, false_);
      let swimDistance = pathingDistance(loc.x, loc.y, dryLoc.x, dryLoc.y, T_PATHING_BLOCKER & ~T_IS_DEEP_WATER);
      if (swimDistance === 30000) {
        loc.$cp(dryLoc);
      }
    }
  } else {
    if (stairDirection === 1) {
      G.player.loc.$cp(G.rogue.upLoc);
    } else if (stairDirection === -1) {
      G.player.loc.$cp(G.rogue.downLoc);
    }
    placedPlayer = false_;
    for (dir = 0; 4 > dir && !placedPlayer; dir = dir + 1 << 16 >> 16) {
      loc.$cp(posNeighborInDirection(G.player.loc, dir));
      if (!cellHasTerrainFlag(loc, T_PATHING_BLOCKER) && !((pmapAt(loc).flags & (HAS_MONSTER | HAS_STAIRS | IS_IN_MACHINE)) >>> 0)) {
        placedPlayer = true_;
      }
    }
    if (!placedPlayer) {
      loc.$cp(getQualifyingPathLocNear(G.player.loc.$clone(), true_, T_DIVIDES_LEVEL, 0, T_PATHING_BLOCKER, HAS_MONSTER | HAS_STAIRS | IS_IN_MACHINE, false_));
    }
  }
  G.player.loc.$cp(loc);
  ($t2 = pmapAt(G.player.loc), $t2.flags = ($t2.flags | HAS_PLAYER) >>> 0);
  if (await itemAtLoc(G.player.loc.$clone())) {
    let theItem = await itemAtLoc(G.player.loc.$clone());
    let msg = new Int8Array(300);
    let itemDescription = $cs("", 300);
    describedItemName(theItem, P(itemDescription), COLS * 3);
    sprintf(P(msg), S("Below you lies %s."), P(itemDescription));
    await messageWithColor(P(msg), G.itemMessageColor, 0);
  }
  if (connectingStairsDiscovered) {
    for (i = G.rogue.upLoc.x - 1 << 16 >> 16; G.rogue.upLoc.x + 1 >= i; i = i + 1 << 16 >> 16) {
      for (j = G.rogue.upLoc.y - 1 << 16 >> 16; G.rogue.upLoc.y + 1 >= j; j = j + 1 << 16 >> 16) {
        if (coordinatesAreInMap(i, j)) {
          discoverCell(i, j);
        }
      }
    }
  }
  if (cellHasTerrainFlag(G.player.loc, T_IS_DEEP_WATER) && !G.player.status[STATUS_LEVITATING] && !cellHasTerrainFlag(G.player.loc, T_ENTANGLES | T_OBSTRUCTS_PASSABILITY)) {
    G.rogue.inWater = true_;
  }
  if ($sadd(G.levels, (G.rogue.depthLevel - 1)).visited) {
    mapToStairs = allocGrid();
    mapToPit = allocGrid();
    fillGrid(mapToStairs, 0);
    fillGrid(mapToPit, 0);
    calculateDistances(mapToStairs, G.player.loc.x, G.player.loc.y, T_PATHING_BLOCKER, null, true_, true_);
    calculateDistances(mapToPit, $sadd(G.levels, (G.rogue.depthLevel - 1)).playerExitedVia.x, $sadd(G.levels, (G.rogue.depthLevel - 1)).playerExitedVia.y, T_PATHING_BLOCKER, null, true_, true_);
    for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
      let monst = nextCreature(it);
      restoreMonster(monst, mapToStairs, mapToPit);
    }
    freeGrid(mapToStairs);
    freeGrid(mapToPit);
  }
  updateMapToShore();
  await updateVision(true_);
  G.rogue.stealthRange = currentStealthRange();
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    updateMonsterState(monst);
  }
  G.rogue.playbackBetweenTurns = true_;
  await displayLevel();
  await refreshSideBar(-1, -1, false_);
  if (G.rogue.playerTurnNumber) {
    G.rogue.playerTurnNumber = $u64(G.rogue.playerTurnNumber + 1);
  }
  await RNGCheck();
  flushBufferToFile();
  deleteAllFlares();
  hideCursor();
}

function freeGlobalDynamicGrid(grid: Ptr | null): void {
  if (grid.a[grid.o]) {
    freeGrid(grid.a[grid.o]);
    grid.a[grid.o] = null;
  }
}

export function freeCreature(monst: struct_creature | null): void {
  freeGlobalDynamicGrid(P(monst, "mapToMe"));
  freeGlobalDynamicGrid(P(monst, "safetyMap"));
  if (monst.carriedItem) {
    free(monst.carriedItem);
    monst.carriedItem = null;
  }
  if (monst.carriedMonster) {
    freeCreature(monst.carriedMonster);
    monst.carriedMonster = null;
  }
  free(monst);
}

function removeDeadMonstersFromList(list: struct_creatureList | null): void {
  let next = list.head;
  while (!!next) {
    let decedent = next.creature;
    next = next.nextCreature;
    if ((decedent.bookkeepingFlags & MB_HAS_DIED) >>> 0) {
      removeCreature(list, decedent);
      if (decedent.leader === G.player && !((decedent.bookkeepingFlags & MB_DOES_NOT_RESURRECT) >>> 0) && (!((decedent.info.flags & MONST_INANIMATE) >>> 0) || (G.monsterCatalog[decedent.info.monsterID].abilityFlags & MA_ENTER_SUMMONS) >>> 0) && (decedent.bookkeepingFlags & MB_WEAPON_AUTO_ID) >>> 0 && !((decedent.bookkeepingFlags & MB_ADMINISTRATIVE_DEATH) >>> 0)) {
        decedent.bookkeepingFlags = (decedent.bookkeepingFlags & ~MB_HAS_DIED >>> 0) >>> 0;
        prependCreature(G.purgatory, decedent);
      } else {
        freeCreature(decedent);
      }
    }
  }
}

export function removeDeadMonsters(): void {
  removeDeadMonstersFromList(G.monsters);
  removeDeadMonstersFromList(G.dormantMonsters);
}

export function freeEverything(): void {
  let i = 0;
  let theItem = null;
  let theItem2 = null;
  freeGlobalDynamicGrid(P(G, "safetyMap"));
  freeGlobalDynamicGrid(P(G, "allySafetyMap"));
  freeGlobalDynamicGrid(P(G, "chokeMap"));
  freeGlobalDynamicGrid(P(G.rogue, "mapToShore"));
  freeGlobalDynamicGrid(P(G.rogue, "mapToSafeTerrain"));
  for (i = 0; G.gameConst.deepestLevel + 1 > i; i = i + 1 << 16 >> 16) {
    freeCreatureList($sadd(G.levels, i).monsters);
    freeCreatureList($sadd(G.levels, i).dormantMonsters);
    for (theItem = $sadd(G.levels, i).items; !!theItem; theItem = theItem2) {
      theItem2 = theItem.nextItem;
      deleteItem(theItem);
    }
    $sadd(G.levels, i).items = null;
    if ($sadd(G.levels, i).scentMap) {
      freeGrid($sadd(G.levels, i).scentMap);
      $sadd(G.levels, i).scentMap = null;
    }
  }
  G.scentMap = null;
  freeCreatureList(G.purgatory);
  for (theItem = G.floorItems; !!theItem; theItem = theItem2) {
    theItem2 = theItem.nextItem;
    deleteItem(theItem);
  }
  G.floorItems = null;
  for (theItem = G.packItems; !!theItem; theItem = theItem2) {
    theItem2 = theItem.nextItem;
    deleteItem(theItem);
  }
  G.packItems = null;
  for (theItem = G.monsterItemsHopper; !!theItem; theItem = theItem2) {
    theItem2 = theItem.nextItem;
    deleteItem(theItem);
  }
  G.monsterItemsHopper = null;
  for (i = 0; MAX_WAYPOINT_COUNT > i; i = i + 1 << 16 >> 16) {
    freeGrid(G.rogue.wpDistance[i]);
  }
  deleteAllFlares();
  if (G.rogue.flares) {
    free(G.rogue.flares);
    G.rogue.flares = null;
  }
  free(G.levels);
  G.levels = null;
  free(G.rogue.featRecord);
}

export async function gameOver(killedBy: Ptr | null, useCustomPhrasing: number): Promise<void> {
  let i = 0;
  let y = 0;
  let buf = new Int8Array(200);
  let highScoreText = new Int8Array(200);
  let buf2 = new Int8Array(200);
  let theEntry = new struct_rogueHighScoresEntry();
  let playback = 0;
  let theEvent = new struct_rogueEvent();
  let theItem = null;
  let recordingFilename = new Int8Array(4096);
  if ((G.player.bookkeepingFlags & MB_IS_DYING) >>> 0) {
    return;
  }
  G.player.bookkeepingFlags = (G.player.bookkeepingFlags | MB_IS_DYING) >>> 0;
  G.rogue.autoPlayingLevel = false_;
  G.rogue.gameInProgress = false_;
  flushBufferToFile();
  if (G.rogue.playbackFastForward) {
    G.rogue.playbackFastForward = false_;
    await displayLevel();
  }
  if (G.rogue.quit) {
    if (G.rogue.playbackMode) {
      G.rogue.playbackMode = false_;
      await message(S("(The player quit at this point.)"), REQUIRE_ACKNOWLEDGMENT);
      G.rogue.playbackMode = true_;
    }
  } else {
    playback = G.rogue.playbackMode;
    if (!(G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 1) && !G.nonInteractivePlayback) {
      G.rogue.playbackMode = false_;
    }
    strcpy(P(buf), S("You die..."));
    if (KEYBOARD_LABELS) {
      encodeMessageColor(P(buf), strlen(P(buf)) << 16 >> 16, G.gray);
      strcat(P(buf), S(" (press 'i' to view your inventory)"));
    }
    G.player.currentHP = 0;
    await refreshSideBar(-1, -1, false_);
    await messageWithColor(P(buf), G.badMessageColor, 0);
    displayMoreSignWithoutWaitingForAcknowledgment();
    do {
      if (G.rogue.playbackMode) {
        break;
      }
      await nextBrogueEvent(theEvent, false_, false_, false_);
      if (theEvent.eventType >>> 0 === KEYSTROKE && theEvent.param1 !== ACKNOWLEDGE_KEY && theEvent.param1 !== ESCAPE_KEY && theEvent.param1 !== INVENTORY_KEY) {
        await flashTemporaryAlert(S(" -- Press space or click to continue, or press 'i' to view inventory -- "), 1500);
      } else if (theEvent.eventType >>> 0 === KEYSTROKE && theEvent.param1 === INVENTORY_KEY) {
        for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
          identify(theItem);
          theItem.flags = (theItem.flags & ~ITEM_MAGIC_DETECTED >>> 0) >>> 0;
        }
        await displayInventory(ALL_ITEMS, 0, 0, true_, false_);
      }
    } while (!(theEvent.eventType >>> 0 === KEYSTROKE && (theEvent.param1 === ACKNOWLEDGE_KEY || theEvent.param1 === ESCAPE_KEY) || theEvent.eventType >>> 0 === MOUSE_UP));
    confirmMessages();
    G.rogue.playbackMode = playback;
  }
  G.rogue.creaturesWillFlashThisTurn = false_;
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 1 && !G.rogue.quit) {
    await message(S("...but then you get better."), 0);
    G.player.currentHP = G.player.info.maxHP;
    if (10 > G.player.status[STATUS_NUTRITION]) {
      G.player.status[STATUS_NUTRITION] = STOMACH_SIZE;
    }
    G.player.bookkeepingFlags = (G.player.bookkeepingFlags & ~MB_IS_DYING >>> 0) >>> 0;
    G.rogue.gameInProgress = true_;
    return;
  }
  if (G.rogue.highScoreSaved) {
    return;
  }
  G.rogue.highScoreSaved = true_;
  if (G.rogue.quit) {
    blackOutScreen();
  } else {
    let dbuf = G.displayBuffer.$clone();
    await funkyFade(dbuf, G.black, null, 120, G.player.loc.x + 20 + 1 << 16 >> 16, G.player.loc.y + 3 << 16 >> 16, false_);
  }
  if (useCustomPhrasing) {
    sprintf(P(buf), S("%s on depth %i"), killedBy, G.rogue.depthLevel);
  } else {
    sprintf(P(buf), S("Killed by a%s %s on depth %i"), isVowelish(killedBy) ? S("n") : S(""), killedBy, G.rogue.depthLevel);
  }
  let numGems = await numberOfMatchingPackItems(GEM, 0, 0, false_);
  G.rogue.gold = G.rogue.gold + $u64(500 * numGems);
  theEntry.score = G.rogue.gold;
  if (G.rogue.mode >>> 0 === GAME_MODE_EASY) {
    theEntry.score = Math.trunc(theEntry.score / 10);
  }
  strcpy(P(highScoreText), P(buf));
  if (theEntry.score > 0) {
    sprintf(P(buf2), numGems > 0 ? S(" with treasure worth %li gold") : S(" with %li gold"), theEntry.score);
    strcat(P(buf), P(buf2));
  }
  if (await numberOfMatchingPackItems(AMULET, 0, 0, false_) > 0) {
    strcat(P(buf), S(", amulet in hand"));
  }
  strcat(P(buf), S("."));
  strcat(P(highScoreText), S("."));
  strcpy(P(theEntry.description), P(highScoreText));
  if (!G.rogue.quit) {
    printString(P(buf), ((COLS - strLenWithoutEscapes(P(buf))) / 2 | 0) << 16 >> 16, (ROWS / 2 | 0) << 16 >> 16, G.gray, G.black, null);
    y = (ROWS / 2 | 0) + 3 << 16 >> 16;
    for (i = 0; G.gameConst.numberFeats > i; i = i + 1 << 16 >> 16) {
      if (G.rogue.featRecord.a[G.rogue.featRecord.o + i] && !$sadd(G.featTable, i).initialValue) {
        sprintf(P(buf), S("%s: %s"), P($sadd(G.featTable, i).name), P($sadd(G.featTable, i).description));
        printString(P(buf), ((COLS - strLenWithoutEscapes(P(buf))) / 2 | 0) << 16 >> 16, y, G.advancementMessageColor, G.black, null);
        y = y + 1 << 16 >> 16;
      }
    }
    await displayMoreSign();
  }
  if (G.serverMode) {
    blackOutScreen();
    saveRecordingNoPrompt(P(recordingFilename));
  } else {
    if (!G.rogue.playbackMode && saveHighScore(theEntry.$clone())) {
      await printHighScores(true_);
    }
    blackOutScreen();
    await saveRecording(P(recordingFilename));
  }
  if (G.rogue.playbackMode && G.nonInteractivePlayback) {
    printf(S("Recording: %s ended after %li turns (game over).\n"), P(G.rogue.currentGamePath), G.rogue.playerTurnNumber);
  }
  if (!G.rogue.playbackMode) {
    if (!G.rogue.quit) {
      notifyEvent(GAMEOVER_DEATH, theEntry.score | 0, 0, P(theEntry.description), P(recordingFilename));
    } else {
      notifyEvent(GAMEOVER_QUIT, theEntry.score | 0, 0, P(theEntry.description), P(recordingFilename));
    }
  } else {
    notifyEvent(GAMEOVER_RECORDING, 0, 0, S("recording ended"), S("none"));
  }
  if (!G.rogue.playbackMode && G.rogue.mode >>> 0 !== GAME_MODE_EASY && G.rogue.mode >>> 0 !== GAME_MODE_WIZARD) {
    saveRunHistory(G.rogue.quit ? S("Quit") : S("Died"), G.rogue.quit ? S("-") : killedBy, theEntry.score | 0, numGems);
  }
  G.rogue.gameHasEnded = true_;
  G.rogue.gameExitStatusCode = EXIT_STATUS_SUCCESS;
}

export async function victory(superVictory: number): Promise<void> {
  let $t1: any;
  let buf = new Int8Array(300);
  let victoryVerb = new Int8Array(20);
  let theItem = null;
  let i = 0;
  let j = 0;
  let gemCount = 0;
  let totalValue = 0;
  let theEntry = new struct_rogueHighScoresEntry();
  let qualified = 0;
  let isPlayback = 0;
  let recordingFilename = new Int8Array(4096);
  G.rogue.gameInProgress = false_;
  flushBufferToFile();
  if (G.rogue.playbackFastForward) {
    G.rogue.playbackFastForward = false_;
    await displayLevel();
  }
  if (superVictory) {
    await message(S("Light streams through the portal, and you are teleported out of the dungeon."), 0);
    let dbuf = G.displayBuffer.$clone();
    await funkyFade(dbuf, G.superVictoryColor, null, 240, G.player.loc.x + 20 + 1 << 16 >> 16, G.player.loc.y + 3 << 16 >> 16, false_);
    await displayMoreSign();
    printString(S("Congratulations; you have transcended the Dungeons of Doom!                 "), 0 + 20 + 1, -1 + 3, G.black, G.white, null);
    await displayMoreSign();
    clearDisplayBuffer(dbuf);
    deleteMessages();
    strcpy(P(G.displayedMessage[0]), S("You retire in splendor, forever renowned for your remarkable triumph.     "));
  } else {
    await message(S("You are bathed in sunlight as you throw open the heavy doors."), 0);
    let dbuf = G.displayBuffer.$clone();
    await funkyFade(dbuf, G.white, null, 240, G.player.loc.x + 20 + 1 << 16 >> 16, G.player.loc.y + 3 << 16 >> 16, false_);
    await displayMoreSign();
    printString(S("Congratulations; you have escaped from the Dungeons of Doom!     "), 0 + 20 + 1, -1 + 3, G.black, G.white, null);
    await displayMoreSign();
    deleteMessages();
    strcpy(P(G.displayedMessage[0]), S("You sell your treasures and live out your days in fame and glory."));
  }
  let dbuf = new struct_screenDisplayBuffer();
  clearDisplayBuffer(dbuf);
  printString(P(G.displayedMessage[0]), 0 + 20 + 1, -1 + 3, G.white, G.black, dbuf);
  plotCharToBuffer(G_GOLD, mapToWindow(struct_pos.$of(2, 1)), G.yellow, G.black, dbuf);
  printString(S("Gold"), 4 + 20 + 1, 1 + 3, G.white, G.black, dbuf);
  sprintf(P(buf), S("%li"), G.rogue.gold);
  printString(P(buf), 60 + 20 + 1, 1 + 3, G.itemMessageColor, G.black, dbuf);
  totalValue = totalValue + G.rogue.gold;
  for (i = 4, theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
    if (theItem.category & GEM) {
      gemCount = gemCount + theItem.quantity << 16 >> 16;
    }
    if (theItem.category === AMULET && superVictory) {
      plotCharToBuffer(G_AMULET, struct_windowpos.$of(2 + 20 + 1, (i + 1 > 31 + 3 - 1 ? 31 + 3 - 1 : i + 1) << 16 >> 16), G.yellow, G.black, dbuf);
      printString(S("The Birthright of Yendor"), 4 + 20 + 1, (i + 1 > 31 + 3 - 1 ? 31 + 3 - 1 : i + 1) << 16 >> 16, G.itemMessageColor, G.black, dbuf);
      sprintf(P(buf), S("%li"), 0 > itemValue(theItem) * 2 ? 0 : itemValue(theItem) * 2);
      printString(P(buf), 60 + 20 + 1, (i + 1 > 31 + 3 - 1 ? 31 + 3 - 1 : i + 1) << 16 >> 16, G.itemMessageColor, G.black, dbuf);
      totalValue = totalValue + (0 > itemValue(theItem) * 2 ? 0 : itemValue(theItem) * 2);
      i = i + 1 << 16 >> 16;
    } else {
      identify(theItem);
      itemName(theItem, P(buf), true_, true_, G.white);
      upperCase(P(buf));
      plotCharToBuffer(theItem.displayChar, struct_windowpos.$of(2 + 20 + 1, (i + 1 > 31 + 3 - 1 ? 31 + 3 - 1 : i + 1) << 16 >> 16), G.yellow, G.black, dbuf);
      printString(P(buf), 4 + 20 + 1, (i + 1 > 31 + 3 - 1 ? 31 + 3 - 1 : i + 1) << 16 >> 16, G.white, G.black, dbuf);
      if (itemValue(theItem) > 0) {
        sprintf(P(buf), S("%li"), 0 > itemValue(theItem) ? 0 : itemValue(theItem));
        printString(P(buf), 60 + 20 + 1, (i + 1 > 31 + 3 - 1 ? 31 + 3 - 1 : i + 1) << 16 >> 16, G.itemMessageColor, G.black, dbuf);
      }
      totalValue = totalValue + (0 > itemValue(theItem) ? 0 : itemValue(theItem));
      i = i + 1 << 16 >> 16;
    }
  }
  i = i + 1 << 16 >> 16;
  printString(S("TOTAL:"), 2 + 20 + 1, (i + 1 > 31 + 3 - 1 ? 31 + 3 - 1 : i + 1) << 16 >> 16, G.lightBlue, G.black, dbuf);
  sprintf(P(buf), S("%li"), totalValue);
  printString(P(buf), 60 + 20 + 1, (i + 1 > 31 + 3 - 1 ? 31 + 3 - 1 : i + 1) << 16 >> 16, G.lightBlue, G.black, dbuf);
  await funkyFade(dbuf, G.white, null, 120, (COLS / 2 | 0) << 16 >> 16, (ROWS / 2 | 0) << 16 >> 16, true_);
  await displayMoreSign();
  blackOutScreen();
  i = 4;
  printString(S("Achievements"), 2 + 20 + 1, ($t1 = i, i = $t1 + 1 << 16 >> 16, $t1), G.lightBlue, G.black, null);
  i = i + 1 << 16 >> 16;
  for (j = 0; ROWS > i && G.gameConst.numberFeats > j; j = j + 1 << 16 >> 16) {
    if (G.rogue.featRecord.a[G.rogue.featRecord.o + j]) {
      sprintf(P(buf), S("%s: %s"), P($sadd(G.featTable, j).name), P($sadd(G.featTable, j).description));
      printString(P(buf), 2 + 20 + 1, i, G.advancementMessageColor, G.black, null);
      i = i + 1 << 16 >> 16;
    }
  }
  strcpy(P(victoryVerb), superVictory ? S("Mastered") : S("Escaped"));
  if (gemCount === 0) {
    sprintf(P(theEntry.description), S("%s the Dungeons of Doom!"), P(victoryVerb));
  } else if (gemCount === 1) {
    sprintf(P(theEntry.description), S("%s the Dungeons of Doom with a lumenstone!"), P(victoryVerb));
  } else {
    sprintf(P(theEntry.description), S("%s the Dungeons of Doom with %i lumenstones!"), P(victoryVerb), gemCount);
  }
  theEntry.score = totalValue;
  if (G.rogue.mode >>> 0 === GAME_MODE_EASY) {
    theEntry.score = Math.trunc(theEntry.score / 10);
  }
  if (G.rogue.mode >>> 0 !== GAME_MODE_WIZARD && !G.rogue.playbackMode) {
    qualified = saveHighScore(theEntry.$clone());
  } else {
    qualified = false_;
  }
  isPlayback = G.rogue.playbackMode;
  G.rogue.playbackMode = false_;
  G.rogue.playbackMode = isPlayback;
  await displayMoreSign();
  if (G.serverMode) {
    saveRecordingNoPrompt(P(recordingFilename));
  } else {
    blackOutScreen();
    await saveRecording(P(recordingFilename));
    await printHighScores(qualified);
  }
  if (G.rogue.playbackMode && G.nonInteractivePlayback) {
    printf(S("Recording: %s ended after %li turns (victory).\n"), P(G.rogue.currentGamePath), G.rogue.playerTurnNumber);
  }
  if (!G.rogue.playbackMode) {
    if (superVictory) {
      notifyEvent(GAMEOVER_SUPERVICTORY, theEntry.score | 0, 0, P(theEntry.description), P(recordingFilename));
    } else {
      notifyEvent(GAMEOVER_VICTORY, theEntry.score | 0, 0, P(theEntry.description), P(recordingFilename));
    }
  } else {
    notifyEvent(GAMEOVER_RECORDING, 0, 0, S("recording ended"), S("none"));
  }
  if (!G.rogue.playbackMode && G.rogue.mode >>> 0 !== GAME_MODE_EASY && G.rogue.mode >>> 0 !== GAME_MODE_NORMAL) {
    saveRunHistory(P(victoryVerb), S("-"), theEntry.score | 0, gemCount);
  }
  G.rogue.gameHasEnded = true_;
  G.rogue.gameExitStatusCode = EXIT_STATUS_SUCCESS;
}

export async function enableEasyMode(): Promise<void> {
  if (G.rogue.mode >>> 0 === GAME_MODE_EASY) {
    await message(S("Alas, all hope of salvation is lost. You shed scalding tears at your plight."), 0);
    return;
  }
  await message(S("A dark presence surrounds you, whispering promises of stolen power."), REQUIRE_ACKNOWLEDGMENT);
  if (await confirm(S("Succumb to demonic temptation (i.e. enable Easy Mode)?"), false_)) {
    recordKeystroke(EASY_MODE_KEY, false_, true_);
    await message(S("An ancient and terrible evil burrows into your willing flesh!"), REQUIRE_ACKNOWLEDGMENT);
    G.rogue.mode = GAME_MODE_EASY;
    setPlayerDisplayChar();
    await refreshDungeonCell(G.player.loc.$clone());
    await refreshSideBar(-1, -1, false_);
    await message(S("Wracked by spasms, your body contorts into an ALL-POWERFUL AMPERSAND!!!"), 0);
    await message(S("You have a feeling that you will take 20% as much damage from now on."), 0);
    await message(S("But great power comes at a great price -- specifically, a 90% income tax rate."), 0);
  } else {
    await message(S("The evil dissipates, hissing, from the air around you."), 0);
  }
}

export function unflag(flag: number): number {
  let i = 0;
  for (i = 0; 32 > i; i = i + 1 << 16 >> 16) {
    if ($shr64(flag, i) === 1) {
      return i;
    }
  }
  return -1;
}

export function $init(): void {
}
