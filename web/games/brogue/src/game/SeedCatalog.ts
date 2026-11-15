// @ts-nocheck
// Brogue CE 1.15.1 SeedCatalog.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { cellHasTMFlag } from './Architect.ts';
import { upperCase } from './IO.ts';
import { itemKindName, itemName, itemRunicName } from './Items.ts';
import { hasNextCreature, iterateCreatures, nextCreature } from './Monsters.ts';
import { freeEverything, initializeGameVariant, initializeRogue, startLevel, unflag } from './RogueMain.ts';
import { struct_creature, struct_item, struct_pcell, struct_pos, struct_tcell, struct_windowpos } from './structs.ts';
import { $at2, $cs, $sat, G, P, R, S, fprintf, printf, snprintf, sprintf, strcpy, strncpy } from '../rt/index.ts';
import { ALTAR_CAGE_RETRACTABLE, ALTAR_INERT, ALTAR_SWITCH, ALTAR_SWITCH_RETRACTING, AMULET, AMULET_SWITCH, ARMOR, CHARM, COLS, COMMUTATION_ALTAR, DCOLS, DROWS, ERROR_MESSAGE_LENGTH, FLOOR, GOLD, KEY, KEY_DOOR, MB_CAPTIVE, MESSAGE_LINES, MONSTER_ALLY, NG_NOTHING, RESURRECTION_ALTAR, RING, ROWS, STAFF, STAT_BAR_WIDTH, TM_PROMOTES_WITH_KEY, WAND, WEAPON, false_, true_ } from './consts.ts';


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

function printSeedCatalogCsvLine(seed: bigint, depth: number, quantity: number, categoryName: Ptr | null, kindName: Ptr | null, enchantment: Ptr | null, runicName: Ptr | null, vaultNumber: Ptr | null, opensVaultNumber: Ptr | null, carriedByMonsterName: Ptr | null, allyStatusName: Ptr | null, mutationName: Ptr | null): void {
  printf(S("%s,%llu,%i,%i,%s,%s,%s,%s,%s,%s,%s,%s,%s\n"), G.gameConst.dungeonVersionString, seed, depth, quantity, categoryName, kindName, enchantment, runicName, vaultNumber, opensVaultNumber, carriedByMonsterName, allyStatusName, mutationName);
}

function getMonsterDetailedName(theMonster: struct_creature | null, theMonsterName: Ptr | null): void {
  if (theMonster.mutationIndex >= 0) {
    sprintf(theMonsterName, S("%s [%s]"), P(theMonster.info.monsterName), P(G.mutationCatalog[theMonster.mutationIndex].title));
  } else {
    strcpy(theMonsterName, P(theMonster.info.monsterName));
  }
}

function printSeedCatalogItem(theItem: struct_item | null, theMonster: struct_creature | null, isCsvFormat: number): void {
  let inGameItemName = $cs("", 500);
  let carriedByMonsterName = $cs("", 100);
  let vaultNumber = $cs("", 36);
  let opensVaultNumber = $cs("", 36);
  let categoryName = $cs("", 20);
  let kindName = $cs("", 50);
  let enchantment = $cs("", 5);
  let runicName = $cs("", 30);
  let mutationName = $cs("", 100);
  if (isCsvFormat) {
    strcpy(P(categoryName), P(G.itemCategoryNames[unflag(theItem.category)]));
    itemKindName(theItem, P(kindName));
    itemRunicName(theItem, P(runicName));
    if (theItem.category & (ARMOR | CHARM | RING | STAFF | WAND | WEAPON)) {
      if (theItem.category === WAND) {
        sprintf(P(enchantment), S("%i"), theItem.charges);
      } else {
        sprintf(P(enchantment), S("%i"), theItem.enchant1);
      }
    }
  } else {
    itemName(theItem, P(inGameItemName), true_, true_, null);
  }
  if (!!theMonster) {
    if (isCsvFormat) {
      sprintf(P(carriedByMonsterName), S("%s"), P(theMonster.info.monsterName));
      strcpy(P(mutationName), theMonster.mutationIndex >= 0 ? P(G.mutationCatalog[theMonster.mutationIndex].title) : S(""));
    } else {
      getMonsterDetailedName(theMonster, P(carriedByMonsterName));
    }
  }
  if (pmapAt(theItem.loc).machineNumber > 0) {
    if (pmapAt(theItem.loc).layers[0] >>> 0 !== ALTAR_SWITCH && pmapAt(theItem.loc).layers[0] >>> 0 !== ALTAR_SWITCH_RETRACTING && pmapAt(theItem.loc).layers[0] >>> 0 !== ALTAR_CAGE_RETRACTABLE && pmapAt(theItem.loc).layers[0] >>> 0 !== ALTAR_INERT && pmapAt(theItem.loc).layers[0] >>> 0 !== AMULET_SWITCH && pmapAt(theItem.loc).layers[0] >>> 0 !== FLOOR) {
      sprintf(P(vaultNumber), isCsvFormat ? S("%i") : S(" (vault %i)"), pmapAt(theItem.loc).machineNumber);
    }
  }
  if (theItem.category === KEY && theItem.kind === KEY_DOOR) {
    sprintf(P(opensVaultNumber), isCsvFormat ? S("%i") : S(" (opens vault %i)"), pmapAt(theItem.keyLoc[0].loc).machineNumber - 1);
  }
  if (isCsvFormat) {
    printSeedCatalogCsvLine(G.rogue.seed, G.rogue.depthLevel, theItem.quantity, P(categoryName), P(kindName), P(enchantment), P(runicName), P(vaultNumber), P(opensVaultNumber), P(carriedByMonsterName), S(""), P(mutationName));
  } else {
    upperCase(P(inGameItemName));
    if (!!theMonster) {
      printf(S("        %s (%s)%s%s\n"), P(inGameItemName), P(carriedByMonsterName), P(vaultNumber), P(opensVaultNumber));
    } else {
      printf(S("        %s%s%s\n"), P(inGameItemName), P(vaultNumber), P(opensVaultNumber));
    }
  }
}

function printSeedCatalogMonster(theMonster: struct_creature | null, isCsvFormat: number): void {
  let categoryName = $cs("", 10);
  let allyStatusName = $cs("", 20);
  let mutationName = $cs("", 100);
  let theMonsterName = $cs("", 100);
  strcpy(P(mutationName), theMonster.mutationIndex >= 0 ? P(G.mutationCatalog[theMonster.mutationIndex].title) : S(""));
  if ((theMonster.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
    strcpy(P(categoryName), S("ally"));
    if (cellHasTMFlag(theMonster.loc, TM_PROMOTES_WITH_KEY)) {
      strcpy(P(allyStatusName), isCsvFormat ? S("caged") : S("A caged "));
    } else {
      strcpy(P(allyStatusName), isCsvFormat ? S("shackled") : S("A shackled "));
    }
  } else if (theMonster.creatureState >>> 0 === MONSTER_ALLY) {
    strcpy(P(categoryName), S("ally"));
    strcpy(P(allyStatusName), isCsvFormat ? S("allied") : S("An allied "));
  } else {
    strcpy(P(categoryName), S("monster"));
  }
  if (isCsvFormat) {
    printSeedCatalogCsvLine(G.rogue.seed, G.rogue.depthLevel, 1, P(categoryName), P(theMonster.info.monsterName), S(""), S(""), S(""), S(""), S(""), P(allyStatusName), P(mutationName));
  } else {
    getMonsterDetailedName(theMonster, P(theMonsterName));
    printf(S("        %s%s\n"), P(allyStatusName), P(theMonsterName));
  }
}

function printSeedCatalogMonsters(isCsvFormat: number, includeAll: number): void {
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let theMonster = nextCreature(it);
    if ((theMonster.bookkeepingFlags & MB_CAPTIVE) >>> 0 || theMonster.creatureState >>> 0 === MONSTER_ALLY || includeAll) {
      printSeedCatalogMonster(theMonster, isCsvFormat);
    }
  }
  for (let it = iterateCreatures(G.dormantMonsters); hasNextCreature(it); ) {
    let theMonster = nextCreature(it);
    if ((theMonster.bookkeepingFlags & MB_CAPTIVE) >>> 0 || theMonster.creatureState >>> 0 === MONSTER_ALLY || includeAll) {
      printSeedCatalogMonster(theMonster, isCsvFormat);
    }
  }
}

function printSeedCatalogMonsterItems(isCsvFormat: number): void {
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let theMonster = nextCreature(it);
    if (!!theMonster.carriedItem && theMonster.carriedItem.category !== GOLD) {
      printSeedCatalogItem(theMonster.carriedItem, theMonster, isCsvFormat);
    }
  }
  for (let it = iterateCreatures(G.dormantMonsters); hasNextCreature(it); ) {
    let theMonster = nextCreature(it);
    if (!!theMonster.carriedItem && theMonster.carriedItem.category !== GOLD) {
      printSeedCatalogItem(theMonster.carriedItem, theMonster, isCsvFormat);
    }
  }
}

function printSeedCatalogFloorGold(gold: number, piles: number, isCsvFormat: number): void {
  let kindName = $cs("", 50);
  if (isCsvFormat) {
    if (piles === 1) {
      strcpy(P(kindName), S("gold pieces"));
    } else if (piles > 1) {
      sprintf(P(kindName), S("gold pieces (%i piles)"), piles);
    }
    printSeedCatalogCsvLine(G.rogue.seed, G.rogue.depthLevel, gold << 16 >> 16, S("gold"), P(kindName), S(""), S(""), S(""), S(""), S(""), S(""), S(""));
  } else {
    if (piles === 1) {
      printf(S("        %i gold pieces\n"), gold);
    } else if (piles > 1) {
      printf(S("        %i gold pieces (%i piles)\n"), gold, piles);
    }
  }
}

function printSeedCatalogFloorItems(isCsvFormat: number): void {
  let theItem = null;
  let gold = 0;
  let piles = 0;
  for (theItem = G.floorItems.nextItem; !!theItem; theItem = theItem.nextItem) {
    if (theItem.category === GOLD) {
      piles = piles + 1 << 16 >> 16;
      gold += theItem.quantity;
    } else if (theItem.category === AMULET) {
    } else {
      printSeedCatalogItem(theItem, null, isCsvFormat);
    }
  }
  if (gold > 0) {
    printSeedCatalogFloorGold(gold, piles, isCsvFormat);
  }
}

function printSeedCatalogAltars(isCsvFormat: number): void {
  let i = 0;
  let j = 0;
  let c_altars = new Int8Array(50);
  let vaultNumber = $cs("", 10);
  for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      if ($at2(G.pmap, i, j).layers[0] >>> 0 === RESURRECTION_ALTAR) {
        sprintf(P(vaultNumber), S("%i"), $at2(G.pmap, i, j).machineNumber);
        if (isCsvFormat) {
          printSeedCatalogCsvLine(G.rogue.seed, G.rogue.depthLevel, 1, S("altar"), S("resurrection altar"), S(""), S(""), P(vaultNumber), S(""), S(""), S(""), S(""));
        } else {
          printf(S("        A resurrection altar (vault %s)\n"), P(vaultNumber));
        }
      }
      if ($at2(G.pmap, i, j).layers[0] >>> 0 === COMMUTATION_ALTAR) {
        c_altars[$at2(G.pmap, i, j).machineNumber] = true_;
      }
    }
  }
  for (i = 0; 50 > i; i = i + 1 << 16 >> 16) {
    if (c_altars[i]) {
      sprintf(P(vaultNumber), S("%i"), i);
      if (isCsvFormat) {
        printSeedCatalogCsvLine(G.rogue.seed, G.rogue.depthLevel, 1, S("altar"), S("commutation altar"), S(""), S(""), P(vaultNumber), S(""), S(""), S(""), S(""));
      } else {
        printf(S("        A commutation altar (vault %s)\n"), P(vaultNumber));
      }
    }
  }
}

export async function printSeedCatalog(startingSeed: bigint, numberOfSeedsToScan: bigint, scanThroughDepth: number, isCsvFormat: number, errorMessage: Ptr | null): Promise<number> {
  let theSeed = 0n;
  let message = $cs("", 1000);
  G.rogue.nextGame = NG_NOTHING;
  initializeGameVariant();
  if (startingSeed === 0n) {
    strncpy(errorMessage, S("Starting seed must be 1+"), ERROR_MESSAGE_LENGTH);
    return 1;
  }
  if (scanThroughDepth === 0 || scanThroughDepth > G.gameConst.deepestLevel >>> 0) {
    snprintf(errorMessage, ERROR_MESSAGE_LENGTH, S("Depth must be between 1 and %d"), G.gameConst.deepestLevel);
    return 1;
  }
  sprintf(P(message), S("Brogue seed catalog, seeds %llu to %llu, through depth %u.\nGenerated with %s. Dungeons unchanged since %s.\n\nTo play one of these seeds, select Play>New Seeded Game from the title screen.\n"), startingSeed, BigInt.asUintN(64, BigInt.asUintN(64, startingSeed + numberOfSeedsToScan) - 1n), scanThroughDepth, G.gameConst.versionString, G.gameConst.dungeonVersionString);
  if (isCsvFormat) {
    fprintf(R.stderr, S("%s"), P(message));
    printf(S("%s\n"), S("dungeon_version,seed,depth,quantity,category,kind,enchantment,runic,vault_number,opens_vault_number,carried_by_monster_name,ally_status_name,mutation_name"));
  } else {
    printf(S("%s"), P(message));
  }
  for (theSeed = startingSeed; BigInt.asUintN(64, startingSeed + numberOfSeedsToScan) > theSeed; theSeed = BigInt.asUintN(64, theSeed + 1n)) {
    if (!isCsvFormat) {
      printf(S("Seed %llu:\n"), theSeed);
    }
    fprintf(R.stderr, S("Scanning seed %llu...\n"), theSeed);
    G.rogue.nextGamePath[0] = 0;
    G.randomNumbersGenerated = 0;
    G.rogue.playbackMode = false_;
    G.rogue.playbackFastForward = false_;
    G.rogue.playbackBetweenTurns = false_;
    G.currentFilePath[0] = 0;
    await initializeRogue(theSeed);
    G.rogue.playbackOmniscience = true_;
    for (G.rogue.depthLevel = 1; scanThroughDepth >= G.rogue.depthLevel >>> 0; G.rogue.depthLevel = G.rogue.depthLevel + 1 << 16 >> 16) {
      await startLevel((G.rogue.depthLevel === 1 ? 1 : G.rogue.depthLevel - 1) << 16 >> 16, 1);
      if (!isCsvFormat) {
        printf(S("    Depth %i:\n"), G.rogue.depthLevel);
      }
      printSeedCatalogFloorItems(isCsvFormat);
      printSeedCatalogMonsterItems(isCsvFormat);
      printSeedCatalogMonsters(isCsvFormat, false_);
      if (G.rogue.depthLevel >= G.gameConst.minimumAltarLevel) {
        printSeedCatalogAltars(isCsvFormat);
      }
    }
    freeEverything();
  }
  return 0;
}

export function $init(): void {
}
