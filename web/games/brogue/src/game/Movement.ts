// @ts-nocheck
// Brogue CE 1.15.1 Movement.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { cellHasTMFlag, cellHasTerrainFlag, cellHasTerrainType, oppositeDirection, spawnDungeonFeature } from './Architect.ts';
import { attack, buildHitList, combatMessage, monsterDamageAdjustmentAmount } from './Combat.ts';
import { calculateDistances, dijkstraScan } from './Dijkstra.ts';
import { terrainFlags, terrainMechFlags } from './Globals.ts';
import { allocGrid, freeGrid, getQualifyingPathLocNear } from './Grid.ts';
import { clearCursorPath, commitDraws, confirm, confirmMessages, describeHallucinatedItem, executeMouseClick, flavorMessage, getPlayerPathOnMap, hiliteCell, hilitePath, message, messageWithColor, nextBrogueEvent, pauseAnimation, plotForegroundChar, printString, refreshDungeonCell, refreshSideBar } from './IO.ts';
import { checkForMissingKeys, deleteItem, getImpactLoc, initializeItem, itemAtLoc, itemMagicPolarity, itemName, keyInPackFor, numberOfMatchingPackItems, pickUpItemAt, removeItemFromChain, zap } from './Items.ts';
import { fp_sqrt, rand_percent, rand_range } from './Math.ts';
import { canDirectlySeeMonster, canPass, canSeeMonster, demoteMonsterFromLeadership, discoveredTerrainFlagsAtLoc, distanceBetween, dormantMonsterAtLoc, forbiddenFlagsForMonster, hasNextCreature, iterateCreatures, knownToPlayerAsPassableOrSecretDoor, makeMonsterDropItem, monsterAtLoc, monsterAvoids, monsterCanSubmergeNow, monsterIsHidden, monsterIsInClass, monsterName, monsterRevealed, monsterWillAttackTarget, monstersAreEnemies, monstersAreTeammates, moveMonster, nextCreature } from './Monsters.ts';
import { cancelKeystroke, recordKeystroke, recordMouseClick } from './Recordings.ts';
import { startLevel, victory } from './RogueMain.ts';
import { discoverCell, monsterShouldFall, playerRecoversFromAttacking, playerTurnEnded, promoteTile, updateFlavorText, updatePlayerUnderwaterness, updateVision } from './Time.ts';
import { struct_PauseBehavior, struct_bolt, struct_creature, struct_item, struct_pcell, struct_pos, struct_rogueEvent, struct_tcell, struct_windowpos } from './structs.ts';
import { $at2, $cs, $mul64, $rd, $sadd, $sarr, $sat, $ta, $u64, $wr, G, P, S, free, sprintf, strcat, strcpy, strlen } from '../rt/index.ts';
import { AMULET, ANY_KIND_OF_VISIBLE, ASCEND_KEY, A_RESPIRATION, BOLT_WHIP, CLAIRVOYANT_DARKENED, CLAIRVOYANT_VISIBLE, COLS, DCOLS, DESCEND_KEY, DF_VOMIT, DIRECTION_COUNT, DISCOVERED, DOWNLEFT_KEY, DOWNRIGHT_KEY, DOWN_KEY, DROWS, DUNGEON, FLOOR, FP_FACTOR, GAME_MODE_EASY, GAME_MODE_WIZARD, GAS, GAS_TRAP_CONFUSION, GAS_TRAP_PARALYSIS, GAS_TRAP_POISON, GOLD, GRANITE, HAS_DORMANT_MONSTER, HAS_ITEM, HAS_MONSTER, HAS_PLAYER, HAS_STAIRS, IN_FIELD_OF_VIEW, IS_IN_PATH, ITEM_ATTACKS_ALL_ADJACENT, ITEM_ATTACKS_EXTEND, ITEM_ATTACKS_PENETRATE, ITEM_LUNGE_ATTACKS, ITEM_MAGIC_DETECTED, ITEM_PASS_ATTACKS, ITEM_PLAYER_AVOIDS, ITEM_PROTECTED, ITEM_RUNIC, ITEM_RUNIC_IDENTIFIED, KEY, KEYBOARD_LABELS, KEYSTROKE, KEY_ID_MAXIMUM, KNOWN_TO_BE_TRAP_FREE, LEFT_KEY, LIQUID, LOS_SLOPE_GRANULARITY, MAGIC_MAPPED, MA_ATTACKS_EXTEND, MA_ATTACKS_PENETRATE, MB_ALREADY_SEEN, MB_CAPTIVE, MB_FOLLOWER, MB_IS_DYING, MB_IS_FALLING, MB_SEIZED, MB_SEIZING, MB_SUBMERGED, MESSAGE_LINES, MONSTER_ALLY, MONSTER_FLEEING, MONSTER_SLEEPING, MONSTER_TRACKING_SCENT, MONSTER_WANDERING, MONST_ATTACKABLE_THRU_WALLS, MONST_DEFEND_DEGRADE_WEAPON, MONST_FIERY, MONST_FLIES, MONST_GETS_TURN_ON_ACTIVATION, MONST_IMMOBILE, MONST_IMMUNE_TO_FIRE, MONST_IMMUNE_TO_WATER, MONST_IMMUNE_TO_WEAPONS, MONST_IMMUNE_TO_WEBS, MONST_INVULNERABLE, MONST_RESTRICTED_TO_LIQUID, MONST_SUBMERGES, MOUSE_UP, NOTHING, NO_DIRECTION, NO_LAYER, NUMBER_TERRAIN_LAYERS, PDS_FORBIDDEN, PDS_OBSTRUCTION, PRESSURE_PLATE_DEPRESSED, RETURN_KEY, RIGHT_KEY, RNG_COSMETIC, ROWS, STABLE_MEMORY, STATUS_BURNING, STATUS_CONFUSED, STATUS_DISCORDANT, STATUS_ENTRANCED, STATUS_HALLUCINATING, STATUS_IMMUNE_TO_FIRE, STATUS_INVISIBLE, STATUS_LEVITATING, STATUS_NAUSEOUS, STATUS_PARALYZED, STATUS_STUCK, STATUS_TELEPATHIC, STAT_BAR_WIDTH, SURFACE, TELEPATHIC_VISIBLE, TM_ALLOWS_SUBMERGING, TM_EXTINGUISHES_FIRE, TM_INTERRUPT_EXPLORATION_WHEN_SEEN, TM_IS_SECRET, TM_PROMOTES_ON_ITEM_PICKUP, TM_PROMOTES_ON_PLAYER_ENTRY, TM_PROMOTES_WITH_KEY, TM_STAND_IN_TILE, T_AUTO_DESCENT, T_CAUSES_CONFUSION, T_CAUSES_NAUSEA, T_CAUSES_PARALYSIS, T_ENTANGLES, T_IS_DEEP_WATER, T_IS_DF_TRAP, T_IS_FIRE, T_LAVA_INSTA_DEATH, T_MOVES_ITEMS, T_OBSTRUCTS_DIAGONAL_MOVEMENT, T_OBSTRUCTS_PASSABILITY, T_OBSTRUCTS_SCENT, T_OBSTRUCTS_VISION, T_PATHING_BLOCKER, UPLEFT_KEY, UPRIGHT_KEY, UP_KEY, VISIBILITY_THRESHOLD, VISIBLE, WAS_CLAIRVOYANT_VISIBLE, WAS_TELEPATHIC_VISIBLE, WAS_VISIBLE, W_SLAYING, false_, true_ } from './consts.ts';


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

export async function playerRuns(direction: number): Promise<void> {
  let cardinalPassability = new Int8Array(4);
  G.rogue.disturbed = (G.player.status[STATUS_CONFUSED] ? true_ : false_) << 24 >> 24;
  for (let dir = 0; 4 > dir; ++dir) {
    cardinalPassability[dir] = monsterAvoids(G.player, posNeighborInDirection(G.player.loc, dir));
  }
  while (!G.rogue.disturbed) {
    if (!await playerMoves(direction)) {
      G.rogue.disturbed = true_;
      break;
    }
    let newLoc = posNeighborInDirection(G.player.loc, direction).$clone();
    if (!isPosInMap(newLoc) || monsterAvoids(G.player, newLoc)) {
      G.rogue.disturbed = true_;
    }
    if (isDisturbed(G.player.loc.x, G.player.loc.y)) {
      G.rogue.disturbed = true_;
    } else if (4 > direction) {
      for (let dir = 0; 4 > dir; ++dir) {
        let newLoc = posNeighborInDirection(G.player.loc, dir).$clone();
        if (cardinalPassability[dir] !== monsterAvoids(G.player, newLoc) && !posEq(G.player.loc, posNeighborInDirection(newLoc, direction))) {
          G.rogue.disturbed = true_;
        }
      }
    }
  }
  await updateFlavorText();
}

export function highestPriorityLayer(x: number, y: number, skipGas: number): number {
  let bestPriority = 10000;
  let tt = 0;
  let best = 0;
  for (tt = 0; NUMBER_TERRAIN_LAYERS > tt; ++tt) {
    if (tt === GAS && skipGas) {
      continue;
    }
    if ($at2(G.pmap, x, y).layers[tt] >>> 0 && bestPriority > G.tileCatalog[$at2(G.pmap, x, y).layers[tt]].drawPriority) {
      bestPriority = G.tileCatalog[$at2(G.pmap, x, y).layers[tt]].drawPriority;
      best = tt;
    }
  }
  return best;
}

export function layerWithTMFlag(x: number, y: number, flag: number): number {
  let layer = 0;
  for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
    if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].mechFlags & flag) >>> 0) {
      return layer;
    }
  }
  return NO_LAYER;
}

export function layerWithFlag(x: number, y: number, flag: number): number {
  let layer = 0;
  for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
    if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].flags & flag) >>> 0) {
      return layer;
    }
  }
  return NO_LAYER;
}

export function tileFlavor(x: number, y: number): Ptr | null {
  return P(G.tileCatalog[$at2(G.pmap, x, y).layers[highestPriorityLayer(x, y, false_)]].flavorText);
}

export function tileText(x: number, y: number): Ptr | null {
  return P(G.tileCatalog[$at2(G.pmap, x, y).layers[highestPriorityLayer(x, y, false_)]].description);
}

export function describedItemBasedOnParameters(theCategory: number, theKind: number, theQuantity: number, theOriginDepth: number, buf: Ptr | null): void {
  let tempItem = initializeItem();
  tempItem.category = theCategory & 0xffff;
  tempItem.kind = theKind;
  tempItem.quantity = theQuantity;
  tempItem.originDepth = theOriginDepth;
  itemName(tempItem, buf, false_, true_, null);
  free(tempItem);
  return;
}

export function describedItemName(theItem: struct_item | null, description: Ptr | null, maxLength: number): void {
  if (G.rogue.playbackOmniscience || !G.player.status[STATUS_HALLUCINATING]) {
    itemName(theItem, description, true_, true_, null);
    if (strlen(description) > $u64(maxLength)) {
      itemName(theItem, description, false_, true_, null);
    }
  } else {
    describeHallucinatedItem(description);
  }
}

export async function describeLocation(buf: Ptr | null, x: number, y: number): Promise<void> {
  let monst = null;
  let theItem = null;
  let magicItem = null;
  let standsInTerrain = 0;
  let subjectMoving = 0;
  let prepositionLocked = false_;
  let monsterDormant = 0;
  let monsterIsPlayer = false_;
  let subject = new Int8Array(300);
  let verb = new Int8Array(300);
  let preposition = new Int8Array(300);
  let object = new Int8Array(300);
  let itemLocation = $cs("", 300);
  let adjective = new Int8Array(300);
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  theItem = await itemAtLoc(struct_pos.$of(x, y));
  if (x === G.player.loc.x && y === G.player.loc.y && !theItem) {
    if (G.player.status[STATUS_LEVITATING]) {
      sprintf(buf, S("you are hovering above %s."), tileText(x, y));
    } else {
      strcpy(buf, tileFlavor(x, y));
    }
    G.rogue.RNG = oldRNG;
    ;
    return;
  }
  monst = null;
  standsInTerrain = ((G.tileCatalog[$at2(G.pmap, x, y).layers[highestPriorityLayer(x, y, false_)]].mechFlags & TM_STAND_IN_TILE) >>> 0 ? true_ : false_) << 24 >> 24;
  monsterDormant = false_;
  if (($at2(G.pmap, x, y).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0) {
    monst = monsterAtLoc(struct_pos.$of(x, y));
    monsterIsPlayer = (monst === G.player ? 1 : 0) << 24 >> 24;
  } else if (($at2(G.pmap, x, y).flags & HAS_DORMANT_MONSTER) >>> 0) {
    monst = dormantMonsterAtLoc(struct_pos.$of(x, y));
    monsterDormant = true_;
  }
  magicItem = null;
  if (theItem && !(($at2(G.pmap, x, y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, x, y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, x, y).flags & DISCOVERED) >>> 0)) && (theItem.flags & ITEM_MAGIC_DETECTED) >>> 0 && itemMagicPolarity(theItem)) {
    magicItem = theItem;
  } else if (monst && !canSeeMonster(monst) && monst.carriedItem && (monst.carriedItem.flags & ITEM_MAGIC_DETECTED) >>> 0 && itemMagicPolarity(monst.carriedItem)) {
    magicItem = monst.carriedItem;
  }
  if (magicItem && !(($at2(G.pmap, x, y).flags & DISCOVERED) >>> 0)) {
    switch (itemMagicPolarity(magicItem)) {
    case 1:
      strcpy(P(object), magicItem.category === AMULET ? S("the Amulet of Yendor") : S("benevolent magic"));
      break;
    case -1:
      strcpy(P(object), S("malevolent magic"));
      break;
    default:
      strcpy(P(object), S("mysterious magic"));
      break;
    }
    sprintf(buf, S("you can detect the aura of %s here."), P(object));
    G.rogue.RNG = oldRNG;
    ;
    return;
  }
  if (monst && !monsterIsPlayer && !canSeeMonster(monst) && monsterRevealed(monst)) {
    strcpy(P(adjective), (!G.player.status[STATUS_HALLUCINATING] || G.rogue.playbackOmniscience) && !monst.info.isLarge || G.player.status[STATUS_HALLUCINATING] && !G.rogue.playbackOmniscience && rand_range(0, 1) ? S("small") : S("large"));
    if (($at2(G.pmap, x, y).flags & DISCOVERED) >>> 0) {
      strcpy(P(object), tileText(x, y));
      if ((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0) {
        strcpy(P(preposition), S("under "));
      } else if (monsterDormant) {
        strcpy(P(preposition), S("coming from within "));
      } else if (standsInTerrain) {
        strcpy(P(preposition), S("in "));
      } else {
        strcpy(P(preposition), S("over "));
      }
    } else {
      strcpy(P(object), S("here"));
      strcpy(P(preposition), S(""));
    }
    sprintf(buf, S("you can sense a %s psychic emanation %s%s."), P(adjective), P(preposition), P(object));
    G.rogue.RNG = oldRNG;
    ;
    return;
  }
  if (monst && !canSeeMonster(monst) && !G.rogue.playbackOmniscience) {
    monst = null;
  }
  if (!(($at2(G.pmap, x, y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, x, y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, x, y).flags & DISCOVERED) >>> 0))) {
    if (($at2(G.pmap, x, y).flags & DISCOVERED) >>> 0) {
      if ($at2(G.pmap, x, y).rememberedItemCategory) {
        if (G.player.status[STATUS_HALLUCINATING] && !G.rogue.playbackOmniscience) {
          describeHallucinatedItem(P(object));
        } else {
          describedItemBasedOnParameters($at2(G.pmap, x, y).rememberedItemCategory << 16 >> 16, $at2(G.pmap, x, y).rememberedItemKind, $at2(G.pmap, x, y).rememberedItemQuantity, $at2(G.pmap, x, y).rememberedItemOriginDepth, P(object));
        }
      } else {
        strcpy(P(object), P(G.tileCatalog[$at2(G.pmap, x, y).rememberedTerrain].description));
      }
      sprintf(buf, S("you remember seeing %s here."), P(object));
      G.rogue.RNG = oldRNG;
      ;
      return;
    } else if (($at2(G.pmap, x, y).flags & MAGIC_MAPPED) >>> 0) {
      sprintf(buf, S("you expect %s to be here."), P(G.tileCatalog[$at2(G.pmap, x, y).rememberedTerrain].description));
      G.rogue.RNG = oldRNG;
      ;
      return;
    }
    strcpy(buf, S(""));
    G.rogue.RNG = oldRNG;
    ;
    return;
  }
  if (monst) {
    monsterName(P(subject), monst, true_);
    strcpy(P(verb), monsterIsPlayer ? S("are") : S("is"));
    if ($at2(G.pmap, x, y).layers[GAS] >>> 0 && monst.status[STATUS_INVISIBLE] && !monsterIsPlayer) {
      sprintf(buf, S("you can perceive the faint outline of %s in %s."), P(subject), P(G.tileCatalog[$at2(G.pmap, x, y).layers[GAS]].description));
      G.rogue.RNG = oldRNG;
      ;
      return;
    }
    subjectMoving = (monst.turnsSpentStationary === 0 && !((monst.info.flags & (MONST_GETS_TURN_ON_ACTIVATION | MONST_IMMOBILE)) >>> 0) && monst.creatureState >>> 0 !== MONSTER_SLEEPING && !((monst.bookkeepingFlags & (MB_SEIZED | MB_CAPTIVE)) >>> 0) ? 1 : 0) << 24 >> 24;
    if ((monst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0 && cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY)) {
      strcat(P(verb), S(" embedded"));
    } else if (cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY)) {
      strcat(P(verb), S(" trapped"));
      subjectMoving = false_;
    } else if ((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
      strcat(P(verb), S(" shackled in place"));
      subjectMoving = false_;
    } else if (monst.status[STATUS_PARALYZED]) {
      strcat(P(verb), S(" frozen in place"));
      subjectMoving = false_;
    } else if (monst.status[STATUS_STUCK]) {
      strcat(P(verb), S(" entangled"));
      subjectMoving = false_;
    } else if (monst.status[STATUS_LEVITATING]) {
      strcat(P(verb), monsterIsPlayer ? S(" hovering") : subjectMoving ? S(" flying") : S(" hovering"));
      strcat(P(preposition), S("over"));
      prepositionLocked = true_;
    } else if (monsterCanSubmergeNow(monst)) {
      strcat(P(verb), subjectMoving ? S(" gliding") : S(" drifting"));
    } else if (cellHasTerrainFlag(struct_pos.$of(x, y), T_MOVES_ITEMS) && !((monst.info.flags & MONST_SUBMERGES) >>> 0)) {
      strcat(P(verb), subjectMoving ? S(" swimming") : S(" struggling"));
    } else if (cellHasTerrainFlag(struct_pos.$of(x, y), T_AUTO_DESCENT)) {
      strcat(P(verb), S(" suspended in mid-air"));
      strcat(P(preposition), S("over"));
      prepositionLocked = true_;
      subjectMoving = false_;
    } else if (monst.status[STATUS_CONFUSED]) {
      strcat(P(verb), S(" staggering"));
    } else if ((monst.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0 && !cellHasTMFlag(monst.loc, TM_ALLOWS_SUBMERGING)) {
      strcat(P(verb), S(" lying"));
      subjectMoving = false_;
    } else if ((monst.info.flags & MONST_IMMOBILE) >>> 0) {
      strcat(P(verb), S(" resting"));
    } else {
      switch (monst.creatureState >>> 0) {
      case MONSTER_SLEEPING:
        strcat(P(verb), S(" sleeping"));
        subjectMoving = false_;
        break;
      case MONSTER_WANDERING:
        strcat(P(verb), subjectMoving ? S(" wandering") : S(" standing"));
        break;
      case MONSTER_FLEEING:
        strcat(P(verb), subjectMoving ? S(" fleeing") : S(" standing"));
        break;
      case MONSTER_TRACKING_SCENT:
        strcat(P(verb), subjectMoving ? S(" charging") : S(" standing"));
        break;
      case MONSTER_ALLY:
        strcat(P(verb), monsterIsPlayer ? S(" standing") : subjectMoving ? S(" following you") : S(" standing"));
        break;
      default:
        strcat(P(verb), S(" standing"));
        break;
      }
    }
    if (monst.status[STATUS_BURNING] && !((monst.info.flags & MONST_FIERY) >>> 0)) {
      strcat(P(verb), S(", burning,"));
    }
    if (theItem) {
      if (verb[strlen(P(verb)) - 1] !== 32) {
        strcat(P(verb), S(" "));
      }
      strcpy(P(preposition), S("over"));
      if (monsterIsPlayer) {
        strcat(P(itemLocation), standsInTerrain ? S(" in ") : S(" on "));
        strcat(P(itemLocation), tileText(x, y));
      }
      sprintf(buf, S("%s %s %s %s%s."), P(subject), P(verb), P(preposition), P(object), P(itemLocation));
      describedItemName(theItem, P(object), DCOLS - strlen(buf) | 0);
    } else {
      if (!prepositionLocked) {
        strcpy(P(preposition), subjectMoving ? standsInTerrain ? S("through") : S("across") : standsInTerrain ? S("in") : S("on"));
      }
      strcpy(P(object), tileText(x, y));
    }
  } else {
    strcpy(P(object), tileText(x, y));
    if (theItem) {
      subjectMoving = cellHasTerrainFlag(struct_pos.$of(x, y), T_MOVES_ITEMS);
      if (G.player.status[STATUS_HALLUCINATING] && !G.rogue.playbackOmniscience) {
        strcpy(P(verb), S("is"));
      } else {
        strcpy(P(verb), theItem.quantity > 1 || theItem.category & GOLD ? S("are") : S("is"));
      }
      if (cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY)) {
        strcat(P(verb), S(" enclosed"));
      } else {
        strcat(P(verb), subjectMoving ? S(" drifting") : S(" lying"));
      }
      strcpy(P(preposition), standsInTerrain ? subjectMoving ? S("through") : S("in") : subjectMoving ? S("across") : S("on"));
      sprintf(buf, S("%s %s %s %s%s."), P(subject), P(verb), P(preposition), P(object), P(itemLocation));
      describedItemName(theItem, P(subject), DCOLS - strlen(buf) | 0);
    } else {
      sprintf(buf, S("you %s %s."), ($at2(G.pmap, x, y).flags & VISIBLE) >>> 0 ? S("see") : S("sense"), P(object));
      G.rogue.RNG = oldRNG;
      ;
      return;
    }
  }
  sprintf(buf, S("%s %s %s %s%s."), P(subject), P(verb), P(preposition), P(object), P(itemLocation));
  G.rogue.RNG = oldRNG;
  ;
}

export async function printLocationDescription(x: number, y: number): Promise<void> {
  let buf = new Int8Array(237);
  await describeLocation(P(buf), x, y);
  flavorMessage(P(buf));
}

export async function useKeyAt(theItem: struct_item | null, x: number, y: number): Promise<void> {
  let $t1: any;
  let layer = 0;
  let i = 0;
  let monst = null;
  let buf = new Int8Array(100);
  let buf2 = new Int8Array(100);
  let terrainName = new Int8Array(100);
  let preposition = new Int8Array(10);
  let disposable = 0;
  strcpy(P(terrainName), S("unknown terrain"));
  for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; layer = layer + 1 << 16 >> 16) {
    if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].mechFlags & TM_PROMOTES_WITH_KEY) >>> 0) {
      if (G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].description[0] === 97 && G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].description[1] === 32) {
        sprintf(P(terrainName), S("the %s"), P(G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].description, 2));
      } else {
        strcpy(P(terrainName), P(G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].description));
      }
      if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].mechFlags & TM_STAND_IN_TILE) >>> 0) {
        strcpy(P(preposition), S("in"));
      } else {
        strcpy(P(preposition), S("on"));
      }
      await promoteTile(x, y, layer, false_);
    }
  }
  disposable = false_;
  for (i = 0; KEY_ID_MAXIMUM > i && (theItem.keyLoc[i].loc.x || theItem.keyLoc[i].machine); i = i + 1 << 16 >> 16) {
    if (posEq(theItem.keyLoc[i].loc, struct_pos.$of(x, y)) && theItem.keyLoc[i].disposableHere) {
      disposable = true_;
    } else if (theItem.keyLoc[i].machine === $at2(G.pmap, x, y).machineNumber && theItem.keyLoc[i].disposableHere) {
      disposable = true_;
    }
  }
  if (disposable) {
    if (removeItemFromChain(theItem, G.packItems)) {
      itemName(theItem, P(buf2), true_, false_, null);
      sprintf(P(buf), S("you use your %s %s %s."), P(buf2), P(preposition), P(terrainName));
      await messageWithColor(P(buf), G.itemMessageColor, 0);
      deleteItem(theItem);
    } else if (removeItemFromChain(theItem, G.floorItems)) {
      deleteItem(theItem);
      ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags & ~HAS_ITEM >>> 0) >>> 0);
    } else if (($at2(G.pmap, x, y).flags & HAS_MONSTER) >>> 0) {
      monst = monsterAtLoc(struct_pos.$of(x, y));
      if (monst.carriedItem && monst.carriedItem === theItem) {
        monst.carriedItem = null;
        deleteItem(theItem);
      }
    }
  }
}

export function randValidDirectionFrom(monst: struct_creature | null, x: number, y: number, respectAvoidancePreferences: number): number {
  let $t1: any, $t2: any;
  let i = 0;
  let newX = 0;
  let newY = 0;
  let validDirections = new Int16Array(8);
  let count = 0;
  ;
  for (i = 0; 8 > i; i = i + 1 << 16 >> 16) {
    newX = x + G.nbDirs[i][0] << 16 >> 16;
    newY = y + G.nbDirs[i][1] << 16 >> 16;
    if (coordinatesAreInMap(newX, newY) && !cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY) && !diagonalBlocked(x, y, newX, newY, false_) && (!respectAvoidancePreferences || !monsterAvoids(monst, struct_pos.$of(newX, newY)) || ($at2(G.pmap, newX, newY).flags & HAS_PLAYER) >>> 0 && monst.creatureState >>> 0 !== MONSTER_ALLY)) {
      validDirections[($t2 = count, count = $t2 + 1 << 16 >> 16, $t2)] = i;
    }
  }
  if (count === 0) {
    return NO_DIRECTION;
  }
  return validDirections[rand_range(0, count - 1)];
}

export async function vomit(monst: struct_creature | null): Promise<void> {
  let buf = new Int8Array(100);
  let monstName = new Int8Array(100);
  await spawnDungeonFeature(monst.loc.x, monst.loc.y, G.dungeonFeatureCatalog[DF_VOMIT], true_, false_);
  if (canDirectlySeeMonster(monst) && !G.rogue.automationActive) {
    monsterName(P(monstName), monst, true_);
    sprintf(P(buf), S("%s vomit%s profusely"), P(monstName), monst === G.player ? S("") : S("s"));
    await combatMessage(P(buf), null);
  }
}

async function moveEntrancedMonsters(dir: number): Promise<void> {
  dir = oppositeDirection(dir << 16 >> 16);
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if (monst.status[STATUS_ENTRANCED] && !monst.status[STATUS_STUCK] && !monst.status[STATUS_PARALYZED] && !((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0)) {
      await moveMonster(monst, G.nbDirs[dir][0], G.nbDirs[dir][1]);
    }
  }
}

export async function becomeAllyWith(monst: struct_creature | null): Promise<void> {
  demoteMonsterFromLeadership(monst);
  if (monst.carriedItem) {
    await makeMonsterDropItem(monst);
  }
  if (monst.carriedMonster) {
    await becomeAllyWith(monst.carriedMonster);
  }
  monst.creatureState = MONSTER_ALLY;
  monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_FOLLOWER) >>> 0;
  monst.leader = G.player;
  monst.bookkeepingFlags = (monst.bookkeepingFlags & ~(MB_CAPTIVE | MB_SEIZED) >>> 0) >>> 0;
  await refreshDungeonCell(monst.loc.$clone());
}

export async function freeCaptive(monst: struct_creature | null): Promise<void> {
  let buf = new Int8Array(300);
  let monstName = new Int8Array(100);
  await becomeAllyWith(monst);
  monsterName(P(monstName), monst, false_);
  sprintf(P(buf), S("you free the grateful %s and gain a faithful ally."), P(monstName));
  await message(P(buf), 0);
}

export async function freeCaptivesEmbeddedAt(x: number, y: number): Promise<number> {
  let monst = null;
  if (($at2(G.pmap, x, y).flags & HAS_MONSTER) >>> 0) {
    monst = monsterAtLoc(struct_pos.$of(x, y));
    if ((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0 && !((monst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) && cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY)) {
      await freeCaptive(monst);
      return true_;
    }
  }
  return false_;
}

async function abortAttackAgainstAcidicTarget(hitList: Ptr | null): Promise<number> {
  let i = 0;
  let monstName = new Int8Array(100);
  let weaponName = new Int8Array(100);
  let buf = new Int8Array(300);
  if (G.rogue.weapon && !((G.rogue.weapon.flags & ITEM_PROTECTED) >>> 0)) {
    for (i = 0; 8 > i; i = i + 1 << 16 >> 16) {
      if (hitList.a[hitList.o + i] && (hitList.a[hitList.o + i].info.flags & MONST_DEFEND_DEGRADE_WEAPON) >>> 0 && canSeeMonster(hitList.a[hitList.o + i]) && (!((G.rogue.weapon.flags & ITEM_RUNIC) >>> 0) || !((G.rogue.weapon.flags & ITEM_RUNIC_IDENTIFIED) >>> 0) || G.rogue.weapon.enchant2 !== W_SLAYING || !monsterIsInClass(hitList.a[hitList.o + i], G.rogue.weapon.vorpalEnemy << 16 >> 16))) {
        monsterName(P(monstName), hitList.a[hitList.o + i], true_);
        itemName(G.rogue.weapon, P(weaponName), false_, false_, null);
        sprintf(P(buf), S("Degrade your %s by attacking %s?"), P(weaponName), P(monstName));
        if (await confirm(P(buf), false_)) {
          return false_;
        } else {
          return true_;
        }
      }
    }
  }
  return false_;
}

async function abortAttackAgainstDiscordantAlly(hitList: Ptr | null): Promise<number> {
  for (let i = 0; 8 > i; ++i) {
    if (hitList.a[hitList.o + i] && hitList.a[hitList.o + i].creatureState >>> 0 === MONSTER_ALLY && hitList.a[hitList.o + i].status[STATUS_DISCORDANT] && canSeeMonster(hitList.a[hitList.o + i])) {
      let monstName = new Int8Array(100);
      let buf = new Int8Array(300);
      monsterName(P(monstName), hitList.a[hitList.o + i], true_);
      sprintf(P(buf), S("Are you sure you want to attack %s?"), P(monstName));
      if (await confirm(P(buf), false_)) {
        return false_;
      } else {
        return true_;
      }
    }
  }
  return false_;
}

async function abortAttack(hitList: Ptr | null): Promise<number> {
  if (G.player.status[STATUS_CONFUSED] || G.player.status[STATUS_HALLUCINATING] && !G.player.status[STATUS_TELEPATHIC]) {
    return false_;
  }
  if (await abortAttackAgainstAcidicTarget(hitList) || await abortAttackAgainstDiscordantAlly(hitList)) {
    return true_;
  }
  return false_;
}

export async function handleWhipAttacks(attacker: struct_creature | null, dir: number, aborted: Ptr | null): Promise<number> {
  let theBolt = new struct_bolt();
  let defender = null;
  let hitList = [null,
null,
null,
null,
null,
null,
null,
null];
  let boltChar = $cs("||~~\\//\\", 8);
  ;
  if (attacker === G.player) {
    if (!G.rogue.weapon || !((G.rogue.weapon.flags & ITEM_ATTACKS_EXTEND) >>> 0)) {
      return false_;
    }
  } else if (!((attacker.info.abilityFlags & MA_ATTACKS_EXTEND) >>> 0)) {
    return false_;
  }
  let originLoc = attacker.loc.$clone();
  let targetLoc = posNeighborInDirection(attacker.loc, dir).$clone();
  if (diagonalBlocked(originLoc.x, originLoc.y, targetLoc.x, targetLoc.y, (attacker === G.player ? 1 : 0) << 24 >> 24)) {
    return false_;
  }
  let strikeLoc = new struct_pos();
  getImpactLoc(strikeLoc, originLoc.$clone(), targetLoc.$clone(), 5, false_, $sadd(G.boltCatalog, BOLT_WHIP));
  defender = monsterAtLoc(strikeLoc);
  if (defender && (attacker !== G.player || canSeeMonster(defender)) && !monsterIsHidden(defender, attacker) && monsterWillAttackTarget(attacker, defender)) {
    if (attacker === G.player) {
      hitList[0] = defender;
      if (await abortAttack(P(hitList))) {
        if (aborted) {
          aborted.a[aborted.o] = true_;
        }
        return false_;
      }
    }
    attacker.bookkeepingFlags = (attacker.bookkeepingFlags & ~MB_SUBMERGED >>> 0) >>> 0;
    theBolt.$cp($sadd(G.boltCatalog, BOLT_WHIP));
    theBolt.theChar = boltChar[dir];
    await zap(originLoc.$clone(), targetLoc.$clone(), theBolt, false_, false_);
    return true_;
  }
  return false_;
}

export async function handleSpearAttacks(attacker: struct_creature | null, dir: number, aborted: Ptr | null): Promise<number> {
  let $t1: any, $t2: any;
  let defender = null;
  let hitList = [null,
null,
null,
null,
null,
null,
null,
null];
  let range = 2;
  let i = 0;
  let h = 0;
  let proceed = false_;
  let visualEffect = false_;
  let boltChar = $cs("||--\\//\\", 8);
  ;
  if (attacker === G.player) {
    if (!G.rogue.weapon || !((G.rogue.weapon.flags & ITEM_ATTACKS_PENETRATE) >>> 0)) {
      return false_;
    }
  } else if (!((attacker.info.abilityFlags & MA_ATTACKS_PENETRATE) >>> 0)) {
    return false_;
  }
  let neighborLoc = posNeighborInDirection(attacker.loc, dir).$clone();
  if (diagonalBlocked(attacker.loc.x, attacker.loc.y, neighborLoc.x, neighborLoc.y, (attacker === G.player ? 1 : 0) << 24 >> 24)) {
    return false_;
  }
  for (i = 0; range > i; i = i + 1 << 16 >> 16) {
    let targetLoc = struct_pos.$of(attacker.loc.x + Math.imul(1 + i, G.nbDirs[dir][0]) << 16 >> 16, attacker.loc.y + Math.imul(1 + i, G.nbDirs[dir][1]) << 16 >> 16).$clone();
    if (!isPosInMap(targetLoc)) {
      break;
    }
    defender = monsterAtLoc(targetLoc);
    if (defender && (!cellHasTerrainFlag(targetLoc, T_OBSTRUCTS_PASSABILITY) || (defender.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) && monsterWillAttackTarget(attacker, defender)) {
      hitList[($t2 = h, h = $t2 + 1 << 16 >> 16, $t2)] = defender;
      if (i === 0 || !monsterIsHidden(defender, attacker) && (attacker !== G.player || canSeeMonster(defender))) {
        proceed = true_;
      }
    }
    if (cellHasTerrainFlag(targetLoc, T_OBSTRUCTS_PASSABILITY | T_OBSTRUCTS_VISION)) {
      break;
    }
  }
  range = i;
  if (proceed) {
    if (attacker === G.player) {
      if (await abortAttack(P(hitList))) {
        if (aborted) {
          aborted.a[aborted.o] = true_;
        }
        return false_;
      }
    }
    if (!G.rogue.playbackFastForward) {
      for (i = 0; range > i; i = i + 1 << 16 >> 16) {
        let targetLoc = struct_pos.$of(attacker.loc.x + Math.imul(1 + i, G.nbDirs[dir][0]) << 16 >> 16, attacker.loc.y + Math.imul(1 + i, G.nbDirs[dir][1]) << 16 >> 16).$clone();
        if (isPosInMap(targetLoc) && (($at2(G.pmap, targetLoc.x, targetLoc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, targetLoc.x, targetLoc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, targetLoc.x, targetLoc.y).flags & DISCOVERED) >>> 0))) {
          visualEffect = true_;
          await plotForegroundChar(boltChar[dir], targetLoc.x, targetLoc.y, G.lightBlue, true_);
        }
      }
    }
    attacker.bookkeepingFlags = (attacker.bookkeepingFlags & ~MB_SUBMERGED >>> 0) >>> 0;
    for (i = h - 1 << 16 >> 16; i >= 0; i = i - 1 << 16 >> 16) {
      await attack(attacker, hitList[i], false_);
    }
    if (visualEffect) {
      await pauseAnimation(16, struct_PauseBehavior.$of());
      for (i = 0; range > i; i = i + 1 << 16 >> 16) {
        let targetLoc = struct_pos.$of(attacker.loc.x + Math.imul(1 + i, G.nbDirs[dir][0]) << 16 >> 16, attacker.loc.y + Math.imul(1 + i, G.nbDirs[dir][1]) << 16 >> 16).$clone();
        if (isPosInMap(targetLoc)) {
          await refreshDungeonCell(targetLoc.$clone());
        }
      }
    }
    return true_;
  }
  return false_;
}

function buildFlailHitList(x: number, y: number, newX: number, newY: number, hitList: Ptr | null): void {
  let mx = 0;
  let my = 0;
  let i = 0;
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    mx = monst.loc.x;
    my = monst.loc.y;
    if (distanceBetween(struct_pos.$of(x, y), struct_pos.$of(mx, my)) === 1 && distanceBetween(struct_pos.$of(newX, newY), struct_pos.$of(mx, my)) === 1 && canSeeMonster(monst) && monstersAreEnemies(G.player, monst) && monst.creatureState >>> 0 !== MONSTER_ALLY && !((monst.bookkeepingFlags & MB_IS_DYING) >>> 0) && (!cellHasTerrainFlag(monst.loc, T_OBSTRUCTS_PASSABILITY) || (monst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0)) {
      while (hitList.a[hitList.o + i]) {
        i = i + 1 << 16 >> 16;
      }
      hitList.a[hitList.o + i] = monst;
    }
  }
}

export function diagonalBlocked(x1: number, y1: number, x2: number, y2: number, limitToPlayerKnowledge: number): number {
  const tFlags = new Float64Array(1);
  if (x1 === x2 || y1 === y2) {
    return false_;
  }
  getLocationFlags(x1, y2, P(tFlags, 0), null, null, limitToPlayerKnowledge);
  if ((tFlags[0] & T_OBSTRUCTS_DIAGONAL_MOVEMENT) >>> 0) {
    return true_;
  }
  getLocationFlags(x2, y1, P(tFlags, 0), null, null, limitToPlayerKnowledge);
  if ((tFlags[0] & T_OBSTRUCTS_DIAGONAL_MOVEMENT) >>> 0) {
    return true_;
  }
  return false_;
}

export async function playerMoves(direction: number): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any;
  let initialDirection = direction;
  let i = 0;
  let layer = 0;
  let x = G.player.loc.x;
  let y = G.player.loc.y;
  let newX = 0;
  let newY = 0;
  let newestX = 0;
  let newestY = 0;
  let playerMoved = false_;
  const specialAttackAborted = new Int8Array(1);
  specialAttackAborted[0] = false_;
  let anyAttackHit = false_;
  let defender = null;
  let tempMonst = null;
  let hitList = [null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null];
  let monstName = new Int8Array(100);
  let buf = new Int8Array(300);
  let directionKeys = $ta(Int32Array, 8, [UP_KEY, DOWN_KEY, LEFT_KEY, RIGHT_KEY, UPLEFT_KEY, DOWNLEFT_KEY, UPRIGHT_KEY, DOWNRIGHT_KEY]);
  ;
  newX = x + G.nbDirs[direction][0] << 16 >> 16;
  newY = y + G.nbDirs[direction][1] << 16 >> 16;
  if (!coordinatesAreInMap(newX, newY)) {
    return false_;
  }
  recordKeystroke(directionKeys[initialDirection], false_, false_);
  let committed = false_;
  if (G.player.status[STATUS_CONFUSED]) {
    if (1 >= G.player.status[STATUS_LEVITATING] && 1 >= G.player.status[STATUS_IMMUNE_TO_FIRE]) {
      for (i = 0; 8 > i; i = i + 1 << 16 >> 16) {
        newestX = x + G.nbDirs[i][0] << 16 >> 16;
        newestY = y + G.nbDirs[i][1] << 16 >> 16;
        if (coordinatesAreInMap(newestX, newestY) && ($at2(G.pmap, newestX, newestY).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0 && !diagonalBlocked(x, y, newestX, newestY, false_) && cellHasTerrainFlag(struct_pos.$of(newestX, newestY), T_LAVA_INSTA_DEATH) && !cellHasTerrainFlag(struct_pos.$of(newestX, newestY), T_OBSTRUCTS_PASSABILITY | T_ENTANGLES) && !(($at2(G.pmap, newestX, newestY).flags & HAS_MONSTER) >>> 0 && canSeeMonster(monsterAtLoc(struct_pos.$of(newestX, newestY))) && monsterAtLoc(struct_pos.$of(newestX, newestY)).creatureState >>> 0 !== MONSTER_ALLY)) {
          if (!await confirm(S("Risk stumbling into lava?"), false_)) {
            cancelKeystroke();
            return false_;
          } else {
            break;
          }
        }
      }
    }
    direction = randValidDirectionFrom(G.player, x, y, false_);
    if (direction === -1) {
      cancelKeystroke();
      return false_;
    } else {
      newX = x + G.nbDirs[direction][0] << 16 >> 16;
      newY = y + G.nbDirs[direction][1] << 16 >> 16;
      if (!coordinatesAreInMap(newX, newY)) {
        cancelKeystroke();
        return false_;
      }
      committed = true_;
    }
  }
  if (($at2(G.pmap, newX, newY).flags & HAS_MONSTER) >>> 0) {
    defender = monsterAtLoc(struct_pos.$of(newX, newY));
  }
  if (!defender || !canSeeMonster(defender) && !monsterRevealed(defender) || !monstersAreEnemies(G.player, defender)) {
    if (cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY) && cellHasTMFlag(struct_pos.$of(newX, newY), TM_PROMOTES_ON_PLAYER_ENTRY)) {
      layer = layerWithTMFlag(newX, newY, TM_PROMOTES_ON_PLAYER_ENTRY) << 16 >> 16;
      if ((G.tileCatalog[$at2(G.pmap, newX, newY).layers[layer]].flags & T_OBSTRUCTS_PASSABILITY) >>> 0) {
        committed = true_;
        await message(P(G.tileCatalog[$at2(G.pmap, newX, newY).layers[layer]].flavorText), 0);
        await promoteTile(newX, newY, layer, false_);
        await playerTurnEnded();
        return true_;
      }
    }
  }
  if ((!cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY) || cellHasTMFlag(struct_pos.$of(newX, newY), TM_PROMOTES_WITH_KEY) && keyInPackFor(struct_pos.$of(newX, newY))) && !diagonalBlocked(x, y, newX, newY, false_) && (!cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY) || cellHasTMFlag(struct_pos.$of(x, y), TM_PROMOTES_WITH_KEY) && keyInPackFor(struct_pos.$of(x, y))) || defender && (defender.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) {
    if (await handleWhipAttacks(G.player, direction, P(specialAttackAborted, 0)) || await handleSpearAttacks(G.player, direction, P(specialAttackAborted, 0))) {
      committed = true_;
      playerRecoversFromAttacking(true_);
      await moveEntrancedMonsters(direction);
      await playerTurnEnded();
      return true_;
    } else if (specialAttackAborted[0]) {
      ;
      cancelKeystroke();
      G.rogue.disturbed = true_;
      return false_;
    }
    if (defender) {
      if ((defender.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
        monsterName(P(monstName), defender, false_);
        sprintf(P(buf), S("Free the captive %s?"), P(monstName));
        if (committed || await confirm(P(buf), false_)) {
          committed = true_;
          if (cellHasTMFlag(struct_pos.$of(newX, newY), TM_PROMOTES_WITH_KEY) && keyInPackFor(struct_pos.$of(newX, newY))) {
            await useKeyAt(keyInPackFor(struct_pos.$of(newX, newY)), newX, newY);
          }
          await freeCaptive(defender);
          G.player.ticksUntilTurn = G.player.ticksUntilTurn + G.player.attackSpeed << 16 >> 16;
          await playerTurnEnded();
          return true_;
        } else {
          cancelKeystroke();
          return false_;
        }
      }
      if (defender.creatureState >>> 0 !== MONSTER_ALLY || defender.status[STATUS_DISCORDANT]) {
        buildHitList(P(hitList), G.player, defender, (G.rogue.weapon && (G.rogue.weapon.flags & ITEM_ATTACKS_ALL_ADJACENT) >>> 0 ? 1 : 0) << 24 >> 24);
        if (await abortAttack(P(hitList))) {
          ;
          cancelKeystroke();
          G.rogue.disturbed = true_;
          return false_;
        }
        if (G.player.status[STATUS_NAUSEOUS]) {
          committed = true_;
          if (rand_percent(25)) {
            await vomit(G.player);
            await playerTurnEnded();
            return false_;
          }
        }
        committed = true_;
        for (i = 0; 16 > i; i = i + 1 << 16 >> 16) {
          if (hitList[i] && monsterWillAttackTarget(G.player, hitList[i]) && !((hitList[i].bookkeepingFlags & MB_IS_DYING) >>> 0) && !G.rogue.gameHasEnded) {
            if (await attack(G.player, hitList[i], false_)) {
              anyAttackHit = true_;
            }
          }
        }
        playerRecoversFromAttacking(anyAttackHit);
        await moveEntrancedMonsters(direction);
        await playerTurnEnded();
        return true_;
      }
    }
    if ((G.player.bookkeepingFlags & MB_SEIZED) >>> 0) {
      for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
        let tempMonst = nextCreature(it);
        if ((tempMonst.bookkeepingFlags & MB_SEIZING) >>> 0 && monstersAreEnemies(G.player, tempMonst) && distanceBetween(G.player.loc, tempMonst.loc) === 1 && !diagonalBlocked(G.player.loc.x, G.player.loc.y, tempMonst.loc.x, tempMonst.loc.y, false_) && !tempMonst.status[STATUS_ENTRANCED]) {
          monsterName(P(monstName), tempMonst, true_);
          if (committed || !canSeeMonster(tempMonst)) {
            committed = true_;
            sprintf(P(buf), S("you struggle but %s is holding your legs!"), P(monstName));
            await moveEntrancedMonsters(direction);
            await message(P(buf), 0);
            await playerTurnEnded();
            return true_;
          } else {
            sprintf(P(buf), S("you cannot move; %s is holding your legs!"), P(monstName));
            await message(P(buf), 0);
            cancelKeystroke();
            return false_;
          }
        }
      }
      G.player.bookkeepingFlags = (G.player.bookkeepingFlags & ~MB_SEIZED >>> 0) >>> 0;
    }
    if (($at2(G.pmap, newX, newY).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0 && 1 >= G.player.status[STATUS_LEVITATING] && !G.player.status[STATUS_CONFUSED] && cellHasTerrainFlag(struct_pos.$of(newX, newY), T_LAVA_INSTA_DEATH) && 1 >= G.player.status[STATUS_IMMUNE_TO_FIRE] && !cellHasTerrainFlag(struct_pos.$of(newX, newY), T_ENTANGLES) && !cellHasTMFlag(struct_pos.$of(newX, newY), TM_IS_SECRET)) {
      await message(S("that would be certain death!"), 0);
      ;
      cancelKeystroke();
      return false_;
    } else if (($at2(G.pmap, newX, newY).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0 && 1 >= G.player.status[STATUS_LEVITATING] && !G.player.status[STATUS_CONFUSED] && cellHasTerrainFlag(struct_pos.$of(newX, newY), T_AUTO_DESCENT) && (!cellHasTerrainFlag(struct_pos.$of(newX, newY), T_ENTANGLES) || cellHasTMFlag(struct_pos.$of(newX, newY), TM_PROMOTES_ON_PLAYER_ENTRY)) && !cellHasTMFlag(struct_pos.$of(newX, newY), TM_IS_SECRET) && !await confirm(S("Dive into the depths?"), false_)) {
      ;
      cancelKeystroke();
      return false_;
    } else if (($at2(G.pmap, newX, newY).flags & ANY_KIND_OF_VISIBLE) >>> 0 && !G.player.status[STATUS_CONFUSED] && !G.player.status[STATUS_BURNING] && 1 >= G.player.status[STATUS_IMMUNE_TO_FIRE] && cellHasTerrainFlag(struct_pos.$of(newX, newY), T_IS_FIRE) && !cellHasTMFlag(struct_pos.$of(newX, newY), TM_EXTINGUISHES_FIRE) && !await confirm(S("Venture into flame?"), false_)) {
      ;
      cancelKeystroke();
      return false_;
    } else if (($at2(G.pmap, newX, newY).flags & ANY_KIND_OF_VISIBLE) >>> 0 && !G.player.status[STATUS_CONFUSED] && !G.player.status[STATUS_BURNING] && cellHasTerrainFlag(struct_pos.$of(newX, newY), T_CAUSES_CONFUSION | T_CAUSES_PARALYSIS) && (!G.rogue.armor || !((G.rogue.armor.flags & ITEM_RUNIC) >>> 0) || !((G.rogue.armor.flags & ITEM_RUNIC_IDENTIFIED) >>> 0) || G.rogue.armor.enchant2 !== A_RESPIRATION) && !await confirm(S("Venture into dangerous gas?"), false_)) {
      ;
      cancelKeystroke();
      return false_;
    } else if (($at2(G.pmap, newX, newY).flags & (ANY_KIND_OF_VISIBLE | MAGIC_MAPPED)) >>> 0 && 1 >= G.player.status[STATUS_LEVITATING] && !G.player.status[STATUS_CONFUSED] && cellHasTerrainFlag(struct_pos.$of(newX, newY), T_IS_DF_TRAP) && !(($at2(G.pmap, newX, newY).flags & PRESSURE_PLATE_DEPRESSED) >>> 0) && !cellHasTMFlag(struct_pos.$of(newX, newY), TM_IS_SECRET) && (!G.rogue.armor || !((G.rogue.armor.flags & ITEM_RUNIC) >>> 0) || !((G.rogue.armor.flags & ITEM_RUNIC_IDENTIFIED) >>> 0) || G.rogue.armor.enchant2 !== A_RESPIRATION || !cellHasTerrainType(struct_pos.$of(newX, newY), GAS_TRAP_POISON) && !cellHasTerrainType(struct_pos.$of(newX, newY), GAS_TRAP_PARALYSIS) && !cellHasTerrainType(struct_pos.$of(newX, newY), GAS_TRAP_CONFUSION)) && !await confirm(S("Step onto the pressure plate?"), false_)) {
      ;
      cancelKeystroke();
      return false_;
    }
    if (G.rogue.weapon && (G.rogue.weapon.flags & ITEM_LUNGE_ATTACKS) >>> 0) {
      newestX = G.player.loc.x + 2 * G.nbDirs[direction][0] << 16 >> 16;
      newestY = G.player.loc.y + 2 * G.nbDirs[direction][1] << 16 >> 16;
      if (coordinatesAreInMap(newestX, newestY) && ($at2(G.pmap, newestX, newestY).flags & HAS_MONSTER) >>> 0) {
        tempMonst = monsterAtLoc(struct_pos.$of(newestX, newestY));
        if (tempMonst && (canSeeMonster(tempMonst) || monsterRevealed(tempMonst)) && monstersAreEnemies(G.player, tempMonst) && tempMonst.creatureState >>> 0 !== MONSTER_ALLY && !((tempMonst.bookkeepingFlags & MB_IS_DYING) >>> 0) && (!cellHasTerrainFlag(tempMonst.loc, T_OBSTRUCTS_PASSABILITY) || (tempMonst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0)) {
          hitList[0] = tempMonst;
          if (await abortAttack(P(hitList))) {
            ;
            cancelKeystroke();
            G.rogue.disturbed = true_;
            return false_;
          }
        }
      }
    }
    if (G.rogue.weapon && (G.rogue.weapon.flags & ITEM_PASS_ATTACKS) >>> 0) {
      buildFlailHitList(x, y, newX, newY, P(hitList));
      if (await abortAttack(P(hitList))) {
        ;
        cancelKeystroke();
        G.rogue.disturbed = true_;
        return false_;
      }
    }
    if (G.player.status[STATUS_STUCK] && cellHasTerrainFlag(struct_pos.$of(x, y), T_ENTANGLES)) {
      if (--G.player.status[STATUS_STUCK]) {
        if (!G.rogue.automationActive) {
          await message(S("you struggle but cannot free yourself."), 0);
        }
        await moveEntrancedMonsters(direction);
        committed = true_;
        await playerTurnEnded();
        return true_;
      } else {
        if (!G.rogue.automationActive) {
          await message(S("you break free!"), 0);
        }
        if ((G.tileCatalog[$at2(G.pmap, x, y).layers[SURFACE]].flags & T_ENTANGLES) >>> 0) {
          $at2(G.pmap, x, y).layers[SURFACE] = NOTHING;
        }
      }
    }
    if (G.player.status[STATUS_NAUSEOUS]) {
      committed = true_;
      if (rand_percent(25)) {
        await vomit(G.player);
        await playerTurnEnded();
        return true_;
      }
    }
    if (G.rogue.downLoc.x === newX && G.rogue.downLoc.y === newY) {
      committed = true_;
      await useStairs(1);
    } else if (G.rogue.upLoc.x === newX && G.rogue.upLoc.y === newY) {
      committed = true_;
      await useStairs(-1);
    } else {
      committed = true_;
      G.player.loc.x = G.player.loc.x + G.nbDirs[direction][0] << 16 >> 16;
      G.player.loc.y = G.player.loc.y + G.nbDirs[direction][1] << 16 >> 16;
      ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags & ~HAS_PLAYER >>> 0) >>> 0);
      ($t2 = pmapAt(G.player.loc), $t2.flags = ($t2.flags | HAS_PLAYER) >>> 0);
      ($t3 = pmapAt(G.player.loc), $t3.flags = ($t3.flags & ~IS_IN_PATH >>> 0) >>> 0);
      if (defender && defender.creatureState >>> 0 === MONSTER_ALLY) {
        ($t4 = pmapAt(defender.loc), $t4.flags = ($t4.flags & ~HAS_MONSTER >>> 0) >>> 0);
        defender.loc.x = x;
        defender.loc.y = y;
        if (monsterAvoids(defender, struct_pos.$of(x, y))) {
          defender.loc.$cp(getQualifyingPathLocNear(G.player.loc.$clone(), true_, forbiddenFlagsForMonster(defender.info), 0, 0, HAS_PLAYER | HAS_MONSTER | HAS_STAIRS, false_));
        }
        ($t5 = pmapAt(defender.loc), $t5.flags = ($t5.flags | HAS_MONSTER) >>> 0);
      }
      if ((pmapAt(G.player.loc).flags & HAS_ITEM) >>> 0) {
        await pickUpItemAt(G.player.loc.$clone());
        G.rogue.disturbed = true_;
      }
      await refreshDungeonCell(struct_pos.$of(x, y));
      await refreshDungeonCell(G.player.loc.$clone());
      playerMoved = true_;
      await checkForMissingKeys(x, y);
      if (monsterShouldFall(G.player)) {
        G.player.bookkeepingFlags = (G.player.bookkeepingFlags | MB_IS_FALLING) >>> 0;
      }
      await moveEntrancedMonsters(direction);
      for (i = 0; 16 > i; i = i + 1 << 16 >> 16) {
        if (hitList[i]) {
          if (await attack(G.player, hitList[i], (G.rogue.weapon && (G.rogue.weapon.flags & ITEM_LUNGE_ATTACKS) >>> 0 ? 1 : 0) << 24 >> 24)) {
            anyAttackHit = true_;
          }
        }
      }
      if (hitList[0]) {
        playerRecoversFromAttacking(anyAttackHit);
      }
      await playerTurnEnded();
    }
  } else if (cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY)) {
    i = $at2(G.pmap, newX, newY).layers[layerWithFlag(newX, newY, T_OBSTRUCTS_PASSABILITY)] << 16 >> 16;
    if ((G.tileCatalog[i].flags & T_OBSTRUCTS_PASSABILITY) >>> 0 && (!diagonalBlocked(x, y, newX, newY, false_) || !cellHasTMFlag(struct_pos.$of(newX, newY), TM_PROMOTES_WITH_KEY))) {
      if (!(($at2(G.pmap, newX, newY).flags & DISCOVERED) >>> 0)) {
        committed = true_;
        discoverCell(newX, newY);
        await refreshDungeonCell(struct_pos.$of(newX, newY));
      }
      await messageWithColor(P(G.tileCatalog[i].flavorText), G.backgroundMessageColor, 0);
    }
  }
  return playerMoved;
}

export function nextStep(distanceMap: Ptr | null, target: struct_pos, monst: struct_creature | null, preferDiagonals: number): number {
  let newX = 0;
  let newY = 0;
  let bestScore = 0;
  let dir = 0;
  let bestDir = 0;
  let blocker = null;
  let blocked = 0;
  ;
  bestScore = 0;
  bestDir = NO_DIRECTION;
  for (dir = preferDiagonals ? 7 : 0; preferDiagonals ? dir >= 0 ? 1 : 0 : DIRECTION_COUNT > dir ? 1 : 0; preferDiagonals ? dir-- : dir++) {
    newX = target.x + G.nbDirs[dir][0] << 16 >> 16;
    newY = target.y + G.nbDirs[dir][1] << 16 >> 16;
    ;
    if (coordinatesAreInMap(newX, newY)) {
      blocked = false_;
      blocker = monsterAtLoc(struct_pos.$of(newX, newY));
      if (monst && monsterAvoids(monst, struct_pos.$of(newX, newY))) {
        blocked = true_;
      } else if (monst && blocker && !canPass(monst, blocker) && !monstersAreTeammates(monst, blocker) && !monstersAreEnemies(monst, blocker)) {
        blocked = true_;
      }
      if ($rd(distanceMap.a[distanceMap.o + target.x], target.y) - $rd(distanceMap.a[distanceMap.o + newX], newY) > bestScore && !diagonalBlocked(target.x, target.y, newX, newY, (monst === G.player ? 1 : 0) << 24 >> 24) && knownToPlayerAsPassableOrSecretDoor(struct_pos.$of(newX, newY)) && !blocked) {
        bestDir = dir;
        bestScore = $rd(distanceMap.a[distanceMap.o + target.x], target.y) - $rd(distanceMap.a[distanceMap.o + newX], newY) << 16 >> 16;
      }
    }
  }
  return bestDir << 16 >> 16;
}

async function displayRoute(distanceMap: Ptr | null, removeRoute: number): Promise<void> {
  let currentX = G.player.loc.x;
  let currentY = G.player.loc.y;
  let dir = 0;
  let newX = 0;
  let newY = 0;
  let advanced = 0;
  if (0 > $rd(distanceMap.a[distanceMap.o + G.player.loc.x], G.player.loc.y) || $rd(distanceMap.a[distanceMap.o + G.player.loc.x], G.player.loc.y) === 30000) {
    return;
  }
  do {
    if (removeRoute) {
      await refreshDungeonCell(struct_pos.$of(currentX, currentY));
    } else {
      await hiliteCell(currentX, currentY, G.hiliteColor, 50, true_);
    }
    advanced = false_;
    for (dir = 7; dir >= 0; dir = dir - 1 << 16 >> 16) {
      newX = currentX + G.nbDirs[dir][0] << 16 >> 16;
      newY = currentY + G.nbDirs[dir][1] << 16 >> 16;
      if (coordinatesAreInMap(newX, newY) && $rd(distanceMap.a[distanceMap.o + newX], newY) >= 0 && $rd(distanceMap.a[distanceMap.o + currentX], currentY) > $rd(distanceMap.a[distanceMap.o + newX], newY) && !diagonalBlocked(currentX, currentY, newX, newY, true_)) {
        currentX = newX;
        currentY = newY;
        advanced = true_;
        break;
      }
    }
  } while (advanced);
}

export async function travelRoute(path: struct_pos | null, steps: number): Promise<void> {
  let i = 0;
  let j = 0;
  let dir = 0;
  ;
  G.rogue.disturbed = false_;
  G.rogue.automationActive = true_;
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if (canSeeMonster(monst)) {
      monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_ALREADY_SEEN) >>> 0;
    } else {
      monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_ALREADY_SEEN >>> 0) >>> 0;
    }
  }
  for (i = 0; steps > i && !G.rogue.disturbed; i = i + 1 << 16 >> 16) {
    for (j = i + 1 << 16 >> 16; steps - 1 > j; j = j + 1 << 16 >> 16) {
      if (diagonalBlocked($sadd(path, (j - 1)).x, $sadd(path, (j - 1)).y, $sadd(path, j).x, $sadd(path, j).y, true_) || monsterAvoids(G.player, $sadd(path, j))) {
        G.rogue.disturbed = true_;
        break;
      }
    }
    for (dir = 0; DIRECTION_COUNT > dir && !G.rogue.disturbed; dir = dir + 1 << 16 >> 16) {
      if (posEq(posNeighborInDirection(G.player.loc, dir), $sadd(path, i))) {
        if (!await playerMoves(dir)) {
          G.rogue.disturbed = true_;
        }
        if (await pauseAnimation(25, struct_PauseBehavior.$of())) {
          G.rogue.disturbed = true_;
        }
        break;
      }
    }
  }
  G.rogue.disturbed = true_;
  G.rogue.automationActive = false_;
  await updateFlavorText();
}

async function travelMap(distanceMap: Ptr | null): Promise<void> {
  let currentX = G.player.loc.x;
  let currentY = G.player.loc.y;
  let dir = 0;
  let newX = 0;
  let newY = 0;
  let advanced = 0;
  G.rogue.disturbed = false_;
  G.rogue.automationActive = true_;
  if (0 > $rd(distanceMap.a[distanceMap.o + G.player.loc.x], G.player.loc.y) || $rd(distanceMap.a[distanceMap.o + G.player.loc.x], G.player.loc.y) === 30000) {
    return;
  }
  do {
    advanced = false_;
    for (dir = 7; dir >= 0; dir = dir - 1 << 16 >> 16) {
      newX = currentX + G.nbDirs[dir][0] << 16 >> 16;
      newY = currentY + G.nbDirs[dir][1] << 16 >> 16;
      if (coordinatesAreInMap(newX, newY) && $rd(distanceMap.a[distanceMap.o + newX], newY) >= 0 && $rd(distanceMap.a[distanceMap.o + currentX], currentY) > $rd(distanceMap.a[distanceMap.o + newX], newY) && !diagonalBlocked(currentX, currentY, newX, newY, true_)) {
        if (!await playerMoves(dir)) {
          G.rogue.disturbed = true_;
        }
        if (await pauseAnimation(500, struct_PauseBehavior.$of())) {
          G.rogue.disturbed = true_;
        }
        currentX = newX;
        currentY = newY;
        advanced = true_;
        break;
      }
    }
  } while (advanced && !G.rogue.disturbed);
  G.rogue.disturbed = true_;
  G.rogue.automationActive = false_;
  await updateFlavorText();
}

export async function travel(target: struct_pos, autoConfirm: number): Promise<void> {
  let $t1: any, $t2: any;
  let theEvent = new struct_rogueEvent();
  let staircaseConfirmKey = 0;
  confirmMessages();
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 1) {
    recordMouseClick(target.x + 20 + 1 << 16 >> 16, target.y + 3 << 16 >> 16, true_, false_);
    ($t1 = pmapAt(G.player.loc), $t1.flags = ($t1.flags & ~HAS_PLAYER >>> 0) >>> 0);
    await refreshDungeonCell(G.player.loc.$clone());
    G.player.loc.$cp(target);
    ($t2 = pmapAt(target), $t2.flags = ($t2.flags | HAS_PLAYER) >>> 0);
    await updatePlayerUnderwaterness();
    await refreshDungeonCell(target.$clone());
    await updateVision(true_);
    return;
  }
  if (Math.abs(G.player.loc.x - target.x) + Math.abs(G.player.loc.y - target.y) === 1) {
    for (let i = 0; 4 > i; ++i) {
      if (G.nbDirs[i][0] === target.x - G.player.loc.x && G.nbDirs[i][1] === target.y - G.player.loc.y) {
        await playerMoves(i << 16 >> 16);
        break;
      }
    }
    return;
  }
  if (!((pmapAt(target).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0)) {
    await message(S("You have not explored that location."), 0);
    return;
  }
  let distanceMap = allocGrid();
  calculateDistances(distanceMap, target.x, target.y, 0, G.player, false_, false_);
  if (30000 > $rd(distanceMap.a[distanceMap.o + G.player.loc.x], G.player.loc.y)) {
    if (autoConfirm) {
      await travelMap(distanceMap);
    } else {
      if (posEq(G.rogue.upLoc, target)) {
        staircaseConfirmKey = ASCEND_KEY;
      } else if (posEq(G.rogue.downLoc, target)) {
        staircaseConfirmKey = DESCEND_KEY;
      } else {
        staircaseConfirmKey = 0;
      }
      await displayRoute(distanceMap, false_);
      await message(S("Travel this route? (y/n)"), 0);
      do {
        await nextBrogueEvent(theEvent, true_, false_, false_);
      } while (theEvent.eventType >>> 0 !== MOUSE_UP && theEvent.eventType >>> 0 !== KEYSTROKE);
      await displayRoute(distanceMap, true_);
      confirmMessages();
      if (theEvent.eventType >>> 0 === MOUSE_UP && theEvent.param1 - 20 - 1 === target.x && theEvent.param2 - 3 === target.y || theEvent.eventType >>> 0 === KEYSTROKE && (theEvent.param1 === 89 || theEvent.param1 === 121 || theEvent.param1 === RETURN_KEY || theEvent.param1 === staircaseConfirmKey && theEvent.param1 !== 0)) {
        await travelMap(distanceMap);
        commitDraws();
      } else if (theEvent.eventType >>> 0 === MOUSE_UP) {
        await executeMouseClick(theEvent);
      }
    }
  } else {
    G.rogue.cursorLoc.$cp(struct_pos.$of(-1, -1));
    await message(S("No path is available."), 0);
  }
  freeGrid(distanceMap);
}

export function populateGenericCostMap(costMap: Ptr | null): void {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_PASSABILITY) && (!cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET) || (discoveredTerrainFlagsAtLoc(struct_pos.$of(i, j)) & T_OBSTRUCTS_PASSABILITY) >>> 0)) {
        $wr(costMap.a[costMap.o + i], j, (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_DIAGONAL_MOVEMENT) ? PDS_OBSTRUCTION : PDS_FORBIDDEN) << 16 >> 16);
      } else if (cellHasTerrainFlag(struct_pos.$of(i, j), T_PATHING_BLOCKER & ~T_OBSTRUCTS_PASSABILITY)) {
        $wr(costMap.a[costMap.o + i], j, PDS_FORBIDDEN);
      } else {
        $wr(costMap.a[costMap.o + i], j, 1);
      }
    }
  }
}

export function getLocationFlags(x: number, y: number, tFlags: Ptr | null, TMFlags: Ptr | null, cellFlags: Ptr | null, limitToPlayerKnowledge: number): void {
  if (limitToPlayerKnowledge && ($at2(G.pmap, x, y).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0 && !(($at2(G.pmap, x, y).flags & ANY_KIND_OF_VISIBLE) >>> 0)) {
    if (tFlags) {
      tFlags.a[tFlags.o] = $at2(G.pmap, x, y).rememberedTerrainFlags;
    }
    if (TMFlags) {
      TMFlags.a[TMFlags.o] = $at2(G.pmap, x, y).rememberedTMFlags;
    }
    if (cellFlags) {
      cellFlags.a[cellFlags.o] = $at2(G.pmap, x, y).rememberedCellFlags;
    }
  } else {
    if (tFlags) {
      tFlags.a[tFlags.o] = terrainFlags(struct_pos.$of(x, y));
    }
    if (TMFlags) {
      TMFlags.a[TMFlags.o] = terrainMechFlags(struct_pos.$of(x, y));
    }
    if (cellFlags) {
      cellFlags.a[cellFlags.o] = $at2(G.pmap, x, y).flags;
    }
  }
}

export async function populateCreatureCostMap(costMap: Ptr | null, monst: struct_creature | null): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let i = 0;
  let j = 0;
  let unexploredCellCost = 0;
  let currentTenant = null;
  let theItem = null;
  const tFlags = new Float64Array(1);
  const cFlags = new Float64Array(1);
  unexploredCellCost = 10 + (((G.rogue.depthLevel > 5 ? G.rogue.depthLevel : 5) > 15 ? 15 : G.rogue.depthLevel > 5 ? G.rogue.depthLevel : 5) - 5) * 2 << 16 >> 16;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (monst === G.player && !(($at2(G.pmap, i, j).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0)) {
        $wr(costMap.a[costMap.o + i], j, PDS_OBSTRUCTION);
        continue;
      }
      getLocationFlags(i, j, P(tFlags, 0), null, P(cFlags, 0), (monst === G.player ? 1 : 0) << 24 >> 24);
      if ((tFlags[0] & T_OBSTRUCTS_PASSABILITY) >>> 0 && (!cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET) || (discoveredTerrainFlagsAtLoc(struct_pos.$of(i, j)) & T_OBSTRUCTS_PASSABILITY) >>> 0 || monst === G.player)) {
        $wr(costMap.a[costMap.o + i], j, ((tFlags[0] & T_OBSTRUCTS_DIAGONAL_MOVEMENT) >>> 0 ? PDS_OBSTRUCTION : PDS_FORBIDDEN) << 16 >> 16);
        continue;
      }
      if ((tFlags[0] & T_LAVA_INSTA_DEATH) >>> 0 && !((monst.info.flags & (MONST_IMMUNE_TO_FIRE | MONST_FLIES | MONST_INVULNERABLE)) >>> 0) && (monst.status[STATUS_LEVITATING] || monst.status[STATUS_IMMUNE_TO_FIRE]) && (monst.status[STATUS_LEVITATING] > monst.status[STATUS_IMMUNE_TO_FIRE] ? monst.status[STATUS_LEVITATING] : monst.status[STATUS_IMMUNE_TO_FIRE]) < $rd(G.rogue.mapToShore.a[G.rogue.mapToShore.o + i], j) + (Math.imul(distanceBetween(struct_pos.$of(i, j), monst.loc), monst.movementSpeed) / 100 | 0)) {
        $wr(costMap.a[costMap.o + i], j, PDS_FORBIDDEN);
        continue;
      }
      if (((tFlags[0] & T_AUTO_DESCENT) >>> 0 || (tFlags[0] & T_IS_DEEP_WATER) >>> 0 && !((monst.info.flags & MONST_IMMUNE_TO_WATER) >>> 0)) && !((monst.info.flags & MONST_FLIES) >>> 0) && monst.status[STATUS_LEVITATING] && monst.status[STATUS_LEVITATING] < $rd(G.rogue.mapToShore.a[G.rogue.mapToShore.o + i], j) + (Math.imul(distanceBetween(struct_pos.$of(i, j), monst.loc), monst.movementSpeed) / 100 | 0)) {
        $wr(costMap.a[costMap.o + i], j, PDS_FORBIDDEN);
        continue;
      }
      if (monsterAvoids(monst, struct_pos.$of(i, j))) {
        $wr(costMap.a[costMap.o + i], j, PDS_FORBIDDEN);
        continue;
      }
      if ((cFlags[0] & HAS_MONSTER) >>> 0) {
        currentTenant = monsterAtLoc(struct_pos.$of(i, j));
        if (currentTenant && (currentTenant.info.flags & (MONST_IMMUNE_TO_WEAPONS | MONST_INVULNERABLE)) >>> 0 && !canPass(monst, currentTenant)) {
          $wr(costMap.a[costMap.o + i], j, PDS_FORBIDDEN);
          continue;
        }
      }
      if ((cFlags[0] & KNOWN_TO_BE_TRAP_FREE) >>> 0 || monst !== G.player && monst.creatureState >>> 0 !== MONSTER_ALLY) {
        $wr(costMap.a[costMap.o + i], j, 10);
      } else {
        $wr(costMap.a[costMap.o + i], j, unexploredCellCost);
      }
      if (!((monst.info.flags & MONST_INVULNERABLE) >>> 0)) {
        if ((tFlags[0] & T_CAUSES_NAUSEA) >>> 0 || cellHasTMFlag(struct_pos.$of(i, j), TM_PROMOTES_ON_ITEM_PICKUP) || (tFlags[0] & T_ENTANGLES) >>> 0 && !((monst.info.flags & MONST_IMMUNE_TO_WEBS) >>> 0)) {
          ($t1 = costMap.a[costMap.o + i], $t2 = j, $t1.a[$t1.o + $t2] = $t1.a[$t1.o + $t2] + 20 << 16 >> 16);
        }
      }
      if (monst === G.player) {
        theItem = await itemAtLoc(struct_pos.$of(i, j));
        if (theItem && (theItem.flags & ITEM_PLAYER_AVOIDS) >>> 0) {
          ($t3 = costMap.a[costMap.o + i], $t4 = j, $t3.a[$t3.o + $t4] = $t3.a[$t3.o + $t4] + 10 << 16 >> 16);
        }
      }
    }
  }
}

export function adjacentFightingDir(): number {
  if (cellHasTerrainFlag(G.player.loc, T_OBSTRUCTS_PASSABILITY)) {
    return NO_DIRECTION;
  }
  for (let dir = 0; DIRECTION_COUNT > dir; ++dir) {
    let newLoc = posNeighborInDirection(G.player.loc, dir).$clone();
    let monst = monsterAtLoc(newLoc);
    if (monst && canSeeMonster(monst) && (!diagonalBlocked(G.player.loc.x, G.player.loc.y, newLoc.x, newLoc.y, false_) || (monst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) && monstersAreEnemies(G.player, monst) && !((monst.info.flags & (MONST_IMMUNE_TO_WEAPONS | MONST_INVULNERABLE)) >>> 0)) {
      return dir;
    }
  }
  return NO_DIRECTION;
}

export async function getExploreMap(map: Ptr | null, headingToStairs: number): Promise<void> {
  let i = 0;
  let j = 0;
  let costMap = null;
  let theItem = null;
  costMap = allocGrid();
  await populateCreatureCostMap(costMap, G.player);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      $wr(map.a[map.o + i], j, 30000);
      theItem = await itemAtLoc(struct_pos.$of(i, j));
      if (!(($at2(G.pmap, i, j).flags & DISCOVERED) >>> 0)) {
        if (($at2(G.pmap, i, j).flags & MAGIC_MAPPED) >>> 0 && ((G.tileCatalog[$at2(G.pmap, i, j).layers[DUNGEON]].flags | G.tileCatalog[$at2(G.pmap, i, j).layers[LIQUID]].flags) >>> 0 & T_PATHING_BLOCKER) >>> 0) {
          $wr(costMap.a[costMap.o + i], j, (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_DIAGONAL_MOVEMENT) ? PDS_OBSTRUCTION : PDS_FORBIDDEN) << 16 >> 16);
        } else {
          $wr(costMap.a[costMap.o + i], j, 1);
          $wr(map.a[map.o + i], j, 0 - (Math.abs(i - ((100 - 20 - 1) / 2 | 0)) / 3 | 0) - (Math.abs(i - ((100 - 20 - 1) / 2 | 0)) / 4 | 0) << 16 >> 16);
        }
      } else if (theItem && !monsterAvoids(G.player, struct_pos.$of(i, j))) {
        if ((theItem.flags & ITEM_PLAYER_AVOIDS) >>> 0) {
          $wr(costMap.a[costMap.o + i], j, 20);
        } else {
          $wr(costMap.a[costMap.o + i], j, 1);
          $wr(map.a[map.o + i], j, 0 - (Math.abs(i - ((100 - 20 - 1) / 2 | 0)) / 3 | 0) - (Math.abs(i - ((100 - 20 - 1) / 2 | 0)) / 4 | 0) - 10 << 16 >> 16);
        }
      }
    }
  }
  $wr(costMap.a[costMap.o + G.rogue.downLoc.x], G.rogue.downLoc.y, 100);
  $wr(costMap.a[costMap.o + G.rogue.upLoc.x], G.rogue.upLoc.y, 100);
  if (headingToStairs) {
    $wr(map.a[map.o + G.rogue.downLoc.x], G.rogue.downLoc.y, 0);
  }
  dijkstraScan(map, costMap, true_);
  freeGrid(costMap);
}

export async function explore(frameDelay: number): Promise<number> {
  ;
  await clearCursorPath();
  let madeProgress = false_;
  let headingToStairs = false_;
  if (G.player.status[STATUS_CONFUSED]) {
    await message(S("Not while you're confused."), 0);
    return false_;
  }
  if (cellHasTerrainFlag(G.player.loc, T_OBSTRUCTS_PASSABILITY)) {
    await message(S("Not while you're trapped."), 0);
    return false_;
  }
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if (canSeeMonster(monst)) {
      monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_ALREADY_SEEN) >>> 0;
    } else {
      monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_ALREADY_SEEN >>> 0) >>> 0;
    }
  }
  let dir = adjacentFightingDir();
  if (dir !== NO_DIRECTION && await startFighting(dir, (G.player.status[STATUS_HALLUCINATING] ? true_ : false_) << 24 >> 24)) {
    return true_;
  }
  if (!G.rogue.autoPlayingLevel) {
    await message(KEYBOARD_LABELS ? S("Exploring... press any key to stop.") : S("Exploring... touch anywhere to stop."), 0);
    confirmMessages();
    printString(KEYBOARD_LABELS ? S("Exploring... press any key to stop.") : S("Exploring... touch anywhere to stop."), 0 + 20 + 1, -1 + 3, G.white, G.black, null);
  }
  G.rogue.disturbed = false_;
  G.rogue.automationActive = true_;
  let distanceMap = allocGrid();
  do {
    dir = adjacentFightingDir();
    if (dir !== NO_DIRECTION) {
      await startFighting(dir, (G.player.status[STATUS_HALLUCINATING] ? true_ : false_) << 24 >> 24);
      if (G.rogue.disturbed) {
        madeProgress = true_;
        continue;
      }
    }
    if (G.rogue.disturbed) {
      continue;
    }
    await getExploreMap(distanceMap, headingToStairs);
    let path = $sarr(struct_pos, 1000);
    let steps = getPlayerPathOnMap(path[0], distanceMap, G.player.loc.$clone());
    await hilitePath(path[0], steps << 16 >> 16, false_);
    dir = nextStep(distanceMap, G.player.loc, null, false_);
    if (!headingToStairs && G.rogue.autoPlayingLevel && dir === NO_DIRECTION) {
      headingToStairs = true_;
      continue;
    }
    await refreshSideBar(-1, -1, false_);
    if (dir === NO_DIRECTION) {
      G.rogue.disturbed = true_;
    } else if (!await playerMoves(dir << 16 >> 16)) {
      G.rogue.disturbed = true_;
    } else {
      madeProgress = true_;
      if (await pauseAnimation(frameDelay, struct_PauseBehavior.$of())) {
        G.rogue.disturbed = true_;
        G.rogue.autoPlayingLevel = false_;
      }
    }
    await hilitePath(path[0], steps << 16 >> 16, true_);
  } while (!G.rogue.disturbed);
  G.rogue.automationActive = false_;
  await refreshSideBar(-1, -1, false_);
  freeGrid(distanceMap);
  return madeProgress;
}

export async function autoPlayLevel(fastForward: number): Promise<void> {
  let madeProgress = 0;
  G.rogue.autoPlayingLevel = true_;
  confirmMessages();
  await message(KEYBOARD_LABELS ? S("Playing... press any key to stop.") : S("Playing... touch anywhere to stop."), 0);
  do {
    madeProgress = await explore((fastForward ? 1 : 50) << 16 >> 16);
    if (!madeProgress && G.rogue.downLoc.x === G.player.loc.x && G.rogue.downLoc.y === G.player.loc.y) {
      await useStairs(1);
      madeProgress = true_;
    }
  } while (madeProgress && G.rogue.autoPlayingLevel);
  confirmMessages();
  G.rogue.autoPlayingLevel = false_;
}

export async function startFighting(dir: number, tillDeath: number): Promise<number> {
  let neighborLoc = posNeighborInDirection(G.player.loc, dir).$clone();
  let monst = monsterAtLoc(neighborLoc);
  if ((monst.info.flags & (MONST_IMMUNE_TO_WEAPONS | MONST_INVULNERABLE)) >>> 0) {
    return false_;
  }
  let expectedDamage = Math.trunc($mul64(monst.info.damage.upperBound, monsterDamageAdjustmentAmount(monst)) / FP_FACTOR) | 0;
  if (G.rogue.mode >>> 0 === GAME_MODE_EASY) {
    expectedDamage = expectedDamage / 5 | 0;
  }
  G.rogue.blockCombatText = true_;
  G.rogue.disturbed = false_;
  do {
    if (!await playerMoves(dir << 16 >> 16)) {
      break;
    }
    if (await pauseAnimation(1, struct_PauseBehavior.$of())) {
      break;
    }
  } while (!G.rogue.disturbed && !G.rogue.gameHasEnded && (tillDeath || G.player.currentHP > expectedDamage) && (pmapAt(neighborLoc).flags & HAS_MONSTER) >>> 0 && monsterAtLoc(neighborLoc) === monst);
  G.rogue.blockCombatText = false_;
  return G.rogue.disturbed;
}

export function isDisturbed(x: number, y: number): number {
  let p = struct_pos.$of(x, y).$clone();
  for (let i = 0; DIRECTION_COUNT > i; ++i) {
    let neighborPos = posNeighborInDirection(p, i).$clone();
    let monst = monsterAtLoc(neighborPos);
    if ((pmapAt(neighborPos).flags & HAS_ITEM) >>> 0) {
      return true_;
    }
    if (monst && !(monst.creatureState >>> 0 === MONSTER_ALLY) && (canSeeMonster(monst) || monsterRevealed(monst))) {
      return true_;
    }
  }
  return false_;
}

export async function discover(x: number, y: number): Promise<void> {
  let layer = 0;
  let feat = null;
  if (cellHasTMFlag(struct_pos.$of(x, y), TM_IS_SECRET)) {
    for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
      if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].mechFlags & TM_IS_SECRET) >>> 0) {
        feat = $sat(G.dungeonFeatureCatalog, G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].discoverType);
        $at2(G.pmap, x, y).layers[layer] = layer === DUNGEON ? FLOOR : NOTHING;
        await spawnDungeonFeature(x, y, feat, true_, false_);
      }
    }
    await refreshDungeonCell(struct_pos.$of(x, y));
    if (($at2(G.pmap, x, y).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
      G.rogue.disturbed = true_;
    }
  }
}

export async function search(searchStrength: number): Promise<number> {
  let $t1: any;
  let i = 0;
  let j = 0;
  let radius = 0;
  let x = 0;
  let y = 0;
  let percent = 0;
  let foundSomething = false_;
  radius = (searchStrength / 10 | 0) << 16 >> 16;
  x = G.player.loc.x;
  y = G.player.loc.y;
  for (i = x - radius << 16 >> 16; x + radius >= i; i = i + 1 << 16 >> 16) {
    for (j = y - radius << 16 >> 16; y + radius >= j; j = j + 1 << 16 >> 16) {
      if (coordinatesAreInMap(i, j) && ($at2(G.pmap, i, j).flags & VISIBLE) >>> 0) {
        percent = searchStrength - distanceBetween(struct_pos.$of(x, y), struct_pos.$of(i, j)) * 10 << 16 >> 16;
        if (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_PASSABILITY)) {
          percent = (percent * 2 / 3 | 0) << 16 >> 16;
        }
        if (percent >= 100) {
          ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags | KNOWN_TO_BE_TRAP_FREE) >>> 0);
        }
        percent = (100 > percent ? percent : 100) << 16 >> 16;
        if (cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET)) {
          if (rand_percent(percent)) {
            await discover(i, j);
            foundSomething = true_;
          }
        }
      }
    }
  }
  return foundSomething;
}

export async function proposeOrConfirmLocation(target: struct_pos, failureMessage: Ptr | null): Promise<number> {
  let retval = false_;
  if (posEq(G.player.loc, target)) {
    await message(S("you are already there."), 0);
  } else if ((pmapAt(target).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0) {
    if (posEq(G.rogue.cursorLoc, target)) {
      retval = true_;
    } else {
      G.rogue.cursorLoc.$cp(target);
    }
  } else {
    await message(failureMessage, 0);
  }
  return retval;
}

export async function useStairs(stairDirection: number): Promise<number> {
  let succeeded = false_;
  if (stairDirection === 1) {
    if (G.gameConst.deepestLevel > G.rogue.depthLevel) {
      G.rogue.cursorLoc.$cp(struct_pos.$of(-1, -1));
      G.rogue.depthLevel = G.rogue.depthLevel + 1 << 16 >> 16;
      await message(S("You descend."), 0);
      await startLevel(G.rogue.depthLevel - 1 << 16 >> 16, stairDirection);
      if (G.rogue.depthLevel > G.rogue.deepestLevel) {
        G.rogue.deepestLevel = G.rogue.depthLevel;
      }
    } else if (await numberOfMatchingPackItems(AMULET, 0, 0, false_)) {
      await victory(true_);
    } else {
      confirmMessages();
      await messageWithColor(S("the crystal archway repels you with a mysterious force!"), G.lightBlue, 0);
      await messageWithColor(S("(Only the bearer of the Amulet of Yendor may pass.)"), G.backgroundMessageColor, 0);
    }
    succeeded = true_;
  } else {
    if (G.rogue.depthLevel > 1 || await numberOfMatchingPackItems(AMULET, 0, 0, false_)) {
      G.rogue.cursorLoc.$cp(struct_pos.$of(-1, -1));
      G.rogue.depthLevel = G.rogue.depthLevel - 1 << 16 >> 16;
      if (G.rogue.depthLevel === 0) {
        await victory(false_);
      } else {
        await message(S("You ascend."), 0);
        await startLevel(G.rogue.depthLevel + 1 << 16 >> 16, stairDirection);
      }
      succeeded = true_;
    } else {
      confirmMessages();
      await messageWithColor(S("The dungeon exit is magically sealed!"), G.lightBlue, 0);
      await messageWithColor(S("(Only the bearer of the Amulet of Yendor may pass.)"), G.backgroundMessageColor, 0);
    }
  }
  if (succeeded) {
    await updatePlayerUnderwaterness();
  }
  return succeeded;
}

export function storeMemories(x: number, y: number): void {
  $at2(G.pmap, x, y).rememberedTerrainFlags = terrainFlags(struct_pos.$of(x, y));
  $at2(G.pmap, x, y).rememberedTMFlags = terrainMechFlags(struct_pos.$of(x, y));
  $at2(G.pmap, x, y).rememberedCellFlags = $at2(G.pmap, x, y).flags;
  $at2(G.pmap, x, y).rememberedTerrain = $at2(G.pmap, x, y).layers[highestPriorityLayer(x, y, false_)];
}

export async function updateFieldOfViewDisplay(updateDancingTerrain: number, refreshDisplay: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let i = 0;
  let j = 0;
  let theItem = null;
  let buf = new Int8Array(300);
  let name = new Int8Array(300);
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = DROWS - 1; j >= 0; j = j - 1 << 16 >> 16) {
      if (($at2(G.pmap, i, j).flags & IN_FIELD_OF_VIEW) >>> 0 && (0 > $at2(G.tmap, i, j).light[0] ? 0 : $at2(G.tmap, i, j).light[0]) + (0 > $at2(G.tmap, i, j).light[1] ? 0 : $at2(G.tmap, i, j).light[1]) + (0 > $at2(G.tmap, i, j).light[2] ? 0 : $at2(G.tmap, i, j).light[2]) > VISIBILITY_THRESHOLD && !(($at2(G.pmap, i, j).flags & CLAIRVOYANT_DARKENED) >>> 0)) {
        ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags | VISIBLE) >>> 0);
      }
      if (($at2(G.pmap, i, j).flags & VISIBLE) >>> 0 && !(($at2(G.pmap, i, j).flags & WAS_VISIBLE) >>> 0)) {
        if (!(($at2(G.pmap, i, j).flags & DISCOVERED) >>> 0) && G.rogue.automationActive) {
          if (($at2(G.pmap, i, j).flags & HAS_ITEM) >>> 0) {
            theItem = await itemAtLoc(struct_pos.$of(i, j));
            if (theItem && theItem.category & KEY) {
              itemName(theItem, P(name), false_, true_, null);
              sprintf(P(buf), S("you see %s."), P(name));
              await messageWithColor(P(buf), G.itemMessageColor, 0);
            }
          }
          if (!(($at2(G.pmap, i, j).flags & MAGIC_MAPPED) >>> 0) && cellHasTMFlag(struct_pos.$of(i, j), TM_INTERRUPT_EXPLORATION_WHEN_SEEN)) {
            strcpy(P(name), P(G.tileCatalog[$at2(G.pmap, i, j).layers[layerWithTMFlag(i, j, TM_INTERRUPT_EXPLORATION_WHEN_SEEN)]].description));
            sprintf(P(buf), S("you see %s."), P(name));
            await messageWithColor(P(buf), G.backgroundMessageColor, 0);
          }
        }
        discoverCell(i, j);
        if (refreshDisplay) {
          await refreshDungeonCell(struct_pos.$of(i, j));
        }
      } else if (!(($at2(G.pmap, i, j).flags & VISIBLE) >>> 0) && ($at2(G.pmap, i, j).flags & WAS_VISIBLE) >>> 0) {
        storeMemories(i, j);
        if (refreshDisplay) {
          await refreshDungeonCell(struct_pos.$of(i, j));
        }
      } else if (!(($at2(G.pmap, i, j).flags & CLAIRVOYANT_VISIBLE) >>> 0) && ($at2(G.pmap, i, j).flags & WAS_CLAIRVOYANT_VISIBLE) >>> 0) {
        storeMemories(i, j);
        if (refreshDisplay) {
          await refreshDungeonCell(struct_pos.$of(i, j));
        }
      } else if (!(($at2(G.pmap, i, j).flags & WAS_CLAIRVOYANT_VISIBLE) >>> 0) && ($at2(G.pmap, i, j).flags & CLAIRVOYANT_VISIBLE) >>> 0) {
        ($t2 = $at2(G.pmap, i, j), $t2.flags = ($t2.flags & ~STABLE_MEMORY >>> 0) >>> 0);
        if (refreshDisplay) {
          await refreshDungeonCell(struct_pos.$of(i, j));
        }
      } else if (!(($at2(G.pmap, i, j).flags & TELEPATHIC_VISIBLE) >>> 0) && ($at2(G.pmap, i, j).flags & WAS_TELEPATHIC_VISIBLE) >>> 0) {
        storeMemories(i, j);
        if (refreshDisplay) {
          await refreshDungeonCell(struct_pos.$of(i, j));
        }
      } else if (!(($at2(G.pmap, i, j).flags & WAS_TELEPATHIC_VISIBLE) >>> 0) && ($at2(G.pmap, i, j).flags & TELEPATHIC_VISIBLE) >>> 0) {
        if (!(($at2(G.pmap, i, j).flags & DISCOVERED) >>> 0) && !cellHasTerrainFlag(struct_pos.$of(i, j), T_PATHING_BLOCKER)) {
          G.rogue.xpxpThisTurn = G.rogue.xpxpThisTurn + 1 << 16 >> 16;
        }
        ($t3 = $at2(G.pmap, i, j), $t3.flags = ($t3.flags & ~STABLE_MEMORY >>> 0) >>> 0);
        if (refreshDisplay) {
          await refreshDungeonCell(struct_pos.$of(i, j));
        }
      } else if ((($at2(G.pmap, i, j).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, i, j).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, i, j).flags & DISCOVERED) >>> 0)) && ($at2(G.tmap, i, j).light[0] !== $at2(G.tmap, i, j).oldLight[0] || $at2(G.tmap, i, j).light[1] !== $at2(G.tmap, i, j).oldLight[1] || $at2(G.tmap, i, j).light[2] !== $at2(G.tmap, i, j).oldLight[2])) {
        if (refreshDisplay) {
          await refreshDungeonCell(struct_pos.$of(i, j));
        }
      } else if (updateDancingTerrain && ($at2(G.pmap, i, j).flags & ANY_KIND_OF_VISIBLE) >>> 0 && (!G.rogue.automationActive || !(G.rogue.playerTurnNumber % 5)) && (G.tileCatalog[$at2(G.pmap, i, j).layers[DUNGEON]].backColor && G.tileCatalog[$at2(G.pmap, i, j).layers[DUNGEON]].backColor.colorDances || G.tileCatalog[$at2(G.pmap, i, j).layers[DUNGEON]].foreColor && G.tileCatalog[$at2(G.pmap, i, j).layers[DUNGEON]].foreColor.colorDances || G.tileCatalog[$at2(G.pmap, i, j).layers[LIQUID]].backColor && G.tileCatalog[$at2(G.pmap, i, j).layers[LIQUID]].backColor.colorDances || G.tileCatalog[$at2(G.pmap, i, j).layers[LIQUID]].foreColor && G.tileCatalog[$at2(G.pmap, i, j).layers[LIQUID]].foreColor.colorDances || G.tileCatalog[$at2(G.pmap, i, j).layers[SURFACE]].backColor && G.tileCatalog[$at2(G.pmap, i, j).layers[SURFACE]].backColor.colorDances || G.tileCatalog[$at2(G.pmap, i, j).layers[SURFACE]].foreColor && G.tileCatalog[$at2(G.pmap, i, j).layers[SURFACE]].foreColor.colorDances || G.tileCatalog[$at2(G.pmap, i, j).layers[GAS]].backColor && G.tileCatalog[$at2(G.pmap, i, j).layers[GAS]].backColor.colorDances || G.tileCatalog[$at2(G.pmap, i, j).layers[GAS]].foreColor && G.tileCatalog[$at2(G.pmap, i, j).layers[GAS]].foreColor.colorDances || G.player.status[STATUS_HALLUCINATING])) {
        ($t4 = $at2(G.pmap, i, j), $t4.flags = ($t4.flags & ~STABLE_MEMORY >>> 0) >>> 0);
        if (refreshDisplay) {
          await refreshDungeonCell(struct_pos.$of(i, j));
        }
      }
    }
  }
  G.rogue.RNG = oldRNG;
  ;
}

export function betweenOctant1andN(x: Ptr | null, y: Ptr | null, x0: number, y0: number, n: number): void {
  let x1 = x.a[x.o];
  let y1 = y.a[y.o];
  let dx = x1 - x0 << 16 >> 16;
  let dy = y1 - y0 << 16 >> 16;
  switch (n) {
  case 1:
    return;
  case 2:
    y.a[y.o] = y0 - dy << 16 >> 16;
    return;
  case 5:
    x.a[x.o] = x0 - dx << 16 >> 16;
    y.a[y.o] = y0 - dy << 16 >> 16;
    return;
  case 6:
    x.a[x.o] = x0 - dx << 16 >> 16;
    return;
  case 8:
    x.a[x.o] = x0 - dy << 16 >> 16;
    y.a[y.o] = y0 - dx << 16 >> 16;
    return;
  case 3:
    x.a[x.o] = x0 - dy << 16 >> 16;
    y.a[y.o] = y0 + dx << 16 >> 16;
    return;
  case 7:
    x.a[x.o] = x0 + dy << 16 >> 16;
    y.a[y.o] = y0 - dx << 16 >> 16;
    return;
  case 4:
    x.a[x.o] = x0 + dy << 16 >> 16;
    y.a[y.o] = y0 + dx << 16 >> 16;
    return;
  }
}

export function getFOVMask(grid: Ptr | null, xLoc: number, yLoc: number, maxRadius: number, forbiddenTerrain: number, forbiddenFlags: number, cautiousOnWalls: number): void {
  let loc = struct_pos.$of(xLoc, yLoc);
  for (let i = 1; 8 >= i; ++i) {
    scanOctantFOV(grid, loc.x, loc.y, i << 16 >> 16, maxRadius, 1, LOS_SLOPE_GRANULARITY * -1, 0, forbiddenTerrain, forbiddenFlags, cautiousOnWalls);
  }
}

export function scanOctantFOV(grid: Ptr | null, xLoc: number, yLoc: number, octant: number, maxRadius: number, columnsRightFromOrigin: number, startSlope: number, endSlope: number, forbiddenTerrain: number, forbiddenFlags: number, cautiousOnWalls: number): void {
  let loc = struct_pos.$of(xLoc, yLoc);
  if ($mul64(columnsRightFromOrigin, FP_FACTOR) >= maxRadius) {
    return;
  }
  let i = 0;
  let a = 0;
  let b = 0;
  let iStart = 0;
  let iEnd = 0;
  const x = new Int16Array(1);
  const y = new Int16Array(1);
  const x2 = new Int16Array(1);
  const y2 = new Int16Array(1);
  let newStartSlope = 0;
  let newEndSlope = 0;
  let cellObstructed = 0;
  newStartSlope = startSlope;
  a = Math.trunc(((LOS_SLOPE_GRANULARITY / -2 | 0) + 1 + $mul64(startSlope, columnsRightFromOrigin)) / LOS_SLOPE_GRANULARITY) << 16 >> 16;
  b = Math.trunc(((LOS_SLOPE_GRANULARITY / -2 | 0) + 1 + $mul64(endSlope, columnsRightFromOrigin)) / LOS_SLOPE_GRANULARITY) << 16 >> 16;
  iStart = (b > a ? a : b) << 16 >> 16;
  iEnd = (a > b ? a : b) << 16 >> 16;
  if (Math.imul(columnsRightFromOrigin, columnsRightFromOrigin) + Math.imul(iEnd, iEnd) >= Math.trunc(Math.trunc($mul64(maxRadius, maxRadius) / FP_FACTOR) / FP_FACTOR)) {
    return;
  }
  if (Math.imul(columnsRightFromOrigin, columnsRightFromOrigin) + Math.imul(iStart, iStart) >= Math.trunc(Math.trunc($mul64(maxRadius, maxRadius) / FP_FACTOR) / FP_FACTOR)) {
    iStart = (Math.trunc($mul64(-1, fp_sqrt(Math.trunc($mul64(maxRadius, maxRadius) / FP_FACTOR) - $mul64(Math.imul(columnsRightFromOrigin, columnsRightFromOrigin), FP_FACTOR))) / FP_FACTOR) | 0) << 16 >> 16;
  }
  x[0] = loc.x + columnsRightFromOrigin << 16 >> 16;
  y[0] = loc.y + iStart << 16 >> 16;
  betweenOctant1andN(P(x, 0), P(y, 0), loc.x, loc.y, octant);
  let currentlyLit = (coordinatesAreInMap(x[0], y[0]) && !(cellHasTerrainFlag(struct_pos.$of(x[0], y[0]), forbiddenTerrain) || ($at2(G.pmap, x[0], y[0]).flags & forbiddenFlags) >>> 0) ? 1 : 0) << 24 >> 24;
  for (i = iStart; iEnd >= i; i = i + 1 << 16 >> 16) {
    x[0] = loc.x + columnsRightFromOrigin << 16 >> 16;
    y[0] = loc.y + i << 16 >> 16;
    betweenOctant1andN(P(x, 0), P(y, 0), loc.x, loc.y, octant);
    if (!coordinatesAreInMap(x[0], y[0])) {
      continue;
    }
    cellObstructed = (cellHasTerrainFlag(struct_pos.$of(x[0], y[0]), forbiddenTerrain) || ($at2(G.pmap, x[0], y[0]).flags & forbiddenFlags) >>> 0 ? 1 : 0) << 24 >> 24;
    if (cautiousOnWalls && cellObstructed) {
      x2[0] = loc.x + columnsRightFromOrigin - 1 << 16 >> 16;
      y2[0] = loc.y + i << 16 >> 16;
      if (0 > i) {
        y2[0] = y2[0] + 1 << 16 >> 16;
      } else if (i > 0) {
        y2[0] = y2[0] - 1 << 16 >> 16;
      }
      betweenOctant1andN(P(x2, 0), P(y2, 0), loc.x, loc.y, octant);
      if (($at2(G.pmap, x2[0], y2[0]).flags & IN_FIELD_OF_VIEW) >>> 0) {
        grid.a[grid.o + x[0]][y[0]] = 1;
      }
    } else {
      grid.a[grid.o + x[0]][y[0]] = 1;
    }
    if (!cellObstructed && !currentlyLit) {
      newStartSlope = ((Math.imul(LOS_SLOPE_GRANULARITY, i) - (LOS_SLOPE_GRANULARITY / 2 | 0)) / (columnsRightFromOrigin * 2 + 1) | 0) * 2;
      currentlyLit = true_;
    } else if (cellObstructed && currentlyLit) {
      newEndSlope = ((Math.imul(LOS_SLOPE_GRANULARITY, i) - (LOS_SLOPE_GRANULARITY / 2 | 0)) / (columnsRightFromOrigin * 2 - 1) | 0) * 2;
      if (newEndSlope >= newStartSlope) {
        scanOctantFOV(grid, loc.x, loc.y, octant, maxRadius, columnsRightFromOrigin + 1 << 16 >> 16, newStartSlope, newEndSlope, forbiddenTerrain, forbiddenFlags, cautiousOnWalls);
      }
      currentlyLit = false_;
    }
  }
  if (currentlyLit) {
    newEndSlope = endSlope;
    if (newEndSlope >= newStartSlope) {
      scanOctantFOV(grid, loc.x, loc.y, octant, maxRadius, columnsRightFromOrigin + 1 << 16 >> 16, newStartSlope, newEndSlope, forbiddenTerrain, forbiddenFlags, cautiousOnWalls);
    }
  }
}

export function addScentToCell(x: number, y: number, distance: number): void {
  let value = 0;
  if (!cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_SCENT) || !cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY)) {
    value = G.rogue.scentTurnNumber - distance & 0xffff;
    $wr(G.scentMap.a[G.scentMap.o + x], y, (value > ($rd(G.scentMap.a[G.scentMap.o + x], y) & 0xffff) ? value : $rd(G.scentMap.a[G.scentMap.o + x], y) & 0xffff) << 16 >> 16);
  }
}

export function $init(): void {
}
