// @ts-nocheck
// Brogue CE 1.15.1 Time.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { analyzeMap, cellHasTMFlag, cellHasTerrainFlag, refreshWaypoint, resetDFMessageEligibility, restoreMonster, spawnDungeonFeature, updateMapToShore, zeroOutGrid } from './Architect.ts';
import { addPoison, combatMessage, displayCombatText, flashMonster, inflictDamage, killCreature, strLenWithoutEscapes } from './Combat.ts';
import { dijkstraScan } from './Dijkstra.ts';
import { terrainFlags } from './Globals.ts';
import { allocGrid, freeGrid, getQualifyingPathLocNear } from './Grid.ts';
import { confirmMessages, displayLevel, flashMessage, flavorMessage, message, messageColorFromVictim, messageWithColor, pauseAnimation, refreshDungeonCell, refreshSideBar, shuffleTerrainColors } from './IO.ts';
import { autoIdentify, deleteItem, dropItem, eat, identify, isVowelish, itemName, keyOnTileAt, numberOfMatchingPackItems, recalculateEquipmentBonuses, removeItemFromChain, updateEncumbrance, updateFloorItems, updateIdentifiableItems } from './Items.ts';
import { animateFlares, createFlare, playerInDarkness, updateLighting, updateMinersLightRadius } from './Light.ts';
import { fillSequentialList, randClumpedRange, rand_percent, rand_range, shuffleList } from './Math.ts';
import { avoidedFlagsForMonster, canDirectlySeeMonster, canSeeMonster, decrementMonsterStatus, demoteMonsterFromLeadership, discoveredTerrainFlagsAtLoc, hasNextCreature, iterateCreatures, makeMonsterDropItem, monsterAtLoc, monsterAvoids, monsterIsInClass, monsterName, monsterRevealed, monstersAreEnemies, monstersTurn, nextCreature, prependCreature, removeCreature, spawnPeriodicHorde, teleport } from './Monsters.ts';
import { addScentToCell, describeLocation, discover, getFOVMask, highestPriorityLayer, layerWithFlag, search, tileFlavor, updateFieldOfViewDisplay, useKeyAt } from './Movement.ts';
import { charmRechargeDelay, ringWisdomMultiplier } from './PowerTables.ts';
import { RNGCheck, displayAnnotation, recordKeystroke } from './Recordings.ts';
import { gameOver, removeDeadMonsters, startLevel } from './RogueMain.ts';
import { struct_PauseBehavior, struct_color, struct_creature, struct_item, struct_pcell, struct_pos, struct_tcell, struct_windowpos } from './structs.ts';
import { $arr, $at2, $mul64, $rd, $realloc, $sadd, $sat, $shl64, $ta, $u64, $wr, G, P, S, free, sprintf, strcat, strcpy, strncmp } from '../rt/index.ts';
import { ALL_ITEMS, AMULET, ANY_KIND_OF_VISIBLE, ARMOR, A_DAMPENING, A_IMMUNITY, A_RESPIRATION, CAUGHT_FIRE_THIS_TURN, CHARM, CLAIRVOYANT_DARKENED, CLAIRVOYANT_VISIBLE, COLS, DCOLS, DF_CREATURE_FIRE, DF_ITEM_FIRE, DIRECTION_COUNT, DISCOVERED, DOOR, DROWS, DUNGEON, FAINT_THRESHOLD, FEAT_COMPANION, FLOOR, FOOD, FP_FACTOR, FRUIT, GAME_MODE_WIZARD, GAS, GENERIC_FLASH_LIGHT, GRANITE, HAS_ITEM, HAS_MONSTER, HAS_PLAYER, HAS_STAIRS, HUNGER_THRESHOLD, IN_FIELD_OF_VIEW, IN_LOOP, IS_IN_MACHINE, IS_IN_SHADOW, IS_POWERED, ITEM_ATTACKS_QUICKLY, ITEM_ATTACKS_STAGGER, ITEM_DETECTED, ITEM_EQUIPPED, ITEM_IDENTIFIED, ITEM_RUNIC, ITEM_RUNIC_HINTED, ITEM_RUNIC_IDENTIFIED, KNOWN_TO_BE_TRAP_FREE, MB_ALREADY_SEEN, MB_APPROACHING_DOWNSTAIRS, MB_APPROACHING_PIT, MB_APPROACHING_UPSTAIRS, MB_BOUND_TO_LEADER, MB_CAPTIVE, MB_FOLLOWER, MB_IS_DYING, MB_IS_FALLING, MB_MARKED_FOR_SACRIFICE, MB_PREPLACED, MB_SEIZED, MB_SEIZING, MB_SUBMERGED, MB_TELEPATHICALLY_REVEALED, MB_WAS_VISIBLE, MESSAGE_LINES, MONSTER_ALLY, MONSTER_FLEEING, MONSTER_SLEEPING, MONSTER_TRACKING_SCENT, MONST_ATTACKABLE_THRU_WALLS, MONST_FIERY, MONST_GETS_TURN_ON_ACTIVATION, MONST_IMMOBILE, MONST_IMMUNE_TO_WATER, MONST_IMMUNE_TO_WEBS, MONST_INANIMATE, MONST_INVULNERABLE, MONST_SUBMERGES, NOTHING, NUMBER_TERRAIN_LAYERS, PDS_FORBIDDEN, PDS_OBSTRUCTION, PRESSURE_PLATE_DEPRESSED, REQUIRE_ACKNOWLEDGMENT, REST_KEY, RING, RNG_COSMETIC, ROWS, SEARCHED_FROM_HERE, SEARCH_KEY, STABLE_MEMORY, STAFF, STAFF_BLINKING, STAFF_OBSTRUCTION, STATUS_AGGRAVATING, STATUS_BURNING, STATUS_CONFUSED, STATUS_DARKNESS, STATUS_DISCORDANT, STATUS_DONNING, STATUS_ENTERS_LEVEL_IN, STATUS_ENTRANCED, STATUS_EXPLOSION_IMMUNITY, STATUS_HALLUCINATING, STATUS_HASTED, STATUS_IMMUNE_TO_FIRE, STATUS_INVISIBLE, STATUS_LEVITATING, STATUS_NAUSEOUS, STATUS_NUTRITION, STATUS_PARALYZED, STATUS_POISONED, STATUS_SEARCHING, STATUS_SHIELDED, STATUS_SLOWED, STATUS_STUCK, STATUS_TELEPATHIC, STATUS_WEAKENED, STAT_BAR_WIDTH, TELEPATHIC_VISIBLE, TM_ALLOWS_SUBMERGING, TM_EXPLOSIVE_PROMOTE, TM_EXTINGUISHES_FIRE, TM_GAS_DISSIPATES, TM_GAS_DISSIPATES_QUICKLY, TM_IS_CIRCUIT_BREAKER, TM_IS_SECRET, TM_IS_WIRED, TM_PROMOTES_ON_CREATURE, TM_PROMOTES_ON_ELECTRICITY, TM_PROMOTES_ON_PLAYER_ENTRY, TM_PROMOTES_ON_SACRIFICE_ENTRY, TM_PROMOTES_WITHOUT_KEY, TM_PROMOTES_WITH_KEY, TM_VANISHES_UPON_PROMOTION, TURNS_FOR_FULL_REGEN, T_AUTO_DESCENT, T_CAUSES_CONFUSION, T_CAUSES_DAMAGE, T_CAUSES_EXPLOSIVE_DAMAGE, T_CAUSES_HEALING, T_CAUSES_NAUSEA, T_CAUSES_PARALYSIS, T_CAUSES_POISON, T_DIVIDES_LEVEL, T_ENTANGLES, T_HARMFUL_TERRAIN, T_IS_DEEP_WATER, T_IS_DF_TRAP, T_IS_FIRE, T_IS_FLAMMABLE, T_LAVA_INSTA_DEATH, T_OBSTRUCTS_DIAGONAL_MOVEMENT, T_OBSTRUCTS_GAS, T_OBSTRUCTS_PASSABILITY, T_OBSTRUCTS_SCENT, T_OBSTRUCTS_VISION, T_PATHING_BLOCKER, T_RESPIRATION_IMMUNITIES, T_SACRED, T_SPONTANEOUSLY_IGNITES, VISIBLE, WAS_CLAIRVOYANT_VISIBLE, WAS_TELEPATHIC_VISIBLE, WAS_VISIBLE, WEAK_THRESHOLD, W_SLAYING, XPXP_NEEDED_FOR_TELEPATHIC_BOND, false_, true_ } from './consts.ts';


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

export async function exposeCreatureToFire(monst: struct_creature | null): Promise<void> {
  let buf = new Int8Array(100);
  let buf2 = new Int8Array(100);
  if ((monst.bookkeepingFlags & MB_IS_DYING) >>> 0 || monst.status[STATUS_IMMUNE_TO_FIRE] || (monst.info.flags & MONST_INVULNERABLE) >>> 0 || (monst.bookkeepingFlags & MB_SUBMERGED) >>> 0 || !monst.status[STATUS_LEVITATING] && cellHasTMFlag(monst.loc, TM_EXTINGUISHES_FIRE)) {
    return;
  }
  if (monst.status[STATUS_BURNING] === 0) {
    if (monst === G.player) {
      G.rogue.minersLight.lightColor = G.fireForeColor;
      G.player.info.foreColor = G.torchLightColor;
      await refreshDungeonCell(G.player.loc.$clone());
      await combatMessage(S("you catch fire"), G.badMessageColor);
    } else if (canDirectlySeeMonster(monst)) {
      monsterName(P(buf), monst, true_);
      sprintf(P(buf2), S("%s catches fire"), P(buf));
      await combatMessage(P(buf2), messageColorFromVictim(monst));
    }
  }
  monst.status[STATUS_BURNING] = monst.maxStatus[STATUS_BURNING] = (monst.status[STATUS_BURNING] > 7 ? monst.status[STATUS_BURNING] : 7) << 16 >> 16;
}

export async function updateFlavorText(): Promise<void> {
  let buf = new Int8Array(237);
  if (G.rogue.disturbed && !G.rogue.gameHasEnded) {
    if (G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0 && G.rogue.armor.enchant2 === A_RESPIRATION && (G.tileCatalog[pmapAt(G.player.loc).layers[highestPriorityLayer(G.player.loc.x, G.player.loc.y, false_)]].flags & T_RESPIRATION_IMMUNITIES) >>> 0) {
      flavorMessage(S("A pocket of cool, clean air swirls around you."));
    } else if (G.player.status[STATUS_LEVITATING]) {
      await describeLocation(P(buf), G.player.loc.x, G.player.loc.y);
      flavorMessage(P(buf));
    } else {
      flavorMessage(tileFlavor(G.player.loc.x, G.player.loc.y));
    }
  }
}

export async function updatePlayerUnderwaterness(): Promise<void> {
  if (G.rogue.inWater) {
    if (!cellHasTerrainFlag(G.player.loc, T_IS_DEEP_WATER) || G.player.status[STATUS_LEVITATING] || cellHasTerrainFlag(G.player.loc, T_ENTANGLES | T_OBSTRUCTS_PASSABILITY)) {
      G.rogue.inWater = false_;
      updateMinersLightRadius();
      await updateVision(true_);
      await displayLevel();
    }
  } else {
    if (cellHasTerrainFlag(G.player.loc, T_IS_DEEP_WATER) && !G.player.status[STATUS_LEVITATING] && !cellHasTerrainFlag(G.player.loc, T_ENTANGLES | T_OBSTRUCTS_PASSABILITY)) {
      G.rogue.inWater = true_;
      updateMinersLightRadius();
      await updateVision(true_);
      await displayLevel();
    }
  }
}

export function monsterShouldFall(monst: struct_creature | null): number {
  return (!monst.status[STATUS_LEVITATING] && cellHasTerrainFlag(monst.loc, T_AUTO_DESCENT) && !cellHasTerrainFlag(monst.loc, T_ENTANGLES | T_OBSTRUCTS_PASSABILITY) && !((monst.bookkeepingFlags & MB_PREPLACED) >>> 0) ? 1 : 0) << 24 >> 24;
}

export async function applyInstantTileEffectsToCreature(monst: struct_creature | null): Promise<void> {
  let $t1: any, $t2: any, $t3: any;
  let buf = new Int8Array(100);
  let buf2 = new Int8Array(100);
  let buf3 = new Int8Array(100);
  let s = null;
  let x = P(monst.loc, "x");
  let y = P(monst.loc, "y");
  let damage = 0;
  let layer = 0;
  let theItem = null;
  if ((monst.bookkeepingFlags & MB_IS_DYING) >>> 0) {
    return;
  }
  if (monst === G.player) {
    if (!G.player.status[STATUS_LEVITATING]) {
      ($t1 = $at2(G.pmap, x.a[x.o], y.a[y.o]), $t1.flags = ($t1.flags | KNOWN_TO_BE_TRAP_FREE) >>> 0);
    }
  } else if (!G.player.status[STATUS_HALLUCINATING] && !monst.status[STATUS_LEVITATING] && canSeeMonster(monst) && !cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_IS_DF_TRAP)) {
    ($t2 = $at2(G.pmap, x.a[x.o], y.a[y.o]), $t2.flags = ($t2.flags | KNOWN_TO_BE_TRAP_FREE) >>> 0);
  }
  if (monst === G.player && !monst.status[STATUS_LEVITATING] && cellHasTMFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), TM_IS_SECRET) && ($at2(G.pmap, x.a[x.o], y.a[y.o]).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
    await discover(x.a[x.o], y.a[y.o]);
  }
  if ((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0 && !cellHasTMFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), TM_ALLOWS_SUBMERGING)) {
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_SUBMERGED >>> 0) >>> 0;
  }
  if (monst === G.player) {
    await updatePlayerUnderwaterness();
  }
  if ((monst.bookkeepingFlags & MB_SEIZING) >>> 0 && cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_OBSTRUCTS_PASSABILITY) && !((monst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0)) {
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_SEIZING >>> 0) >>> 0;
  }
  if (monsterShouldFall(monst)) {
    if (monst === G.player) {
      if (!((monst.bookkeepingFlags & MB_IS_FALLING) >>> 0)) {
        monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_IS_FALLING) >>> 0;
      }
      return;
    } else {
      monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_IS_FALLING) >>> 0;
    }
  }
  if (!monst.status[STATUS_LEVITATING] && !monst.status[STATUS_IMMUNE_TO_FIRE] && !((monst.info.flags & MONST_INVULNERABLE) >>> 0) && !cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_ENTANGLES | T_OBSTRUCTS_PASSABILITY) && !cellHasTMFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), TM_EXTINGUISHES_FIRE) && cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_LAVA_INSTA_DEATH)) {
    if (monst === G.player) {
      sprintf(P(buf), S("you plunge into %s!"), P(G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layerWithFlag(x.a[x.o], y.a[y.o], T_LAVA_INSTA_DEATH)]].description));
      await message(P(buf), REQUIRE_ACKNOWLEDGMENT);
      sprintf(P(buf), S("Killed by %s"), P(G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layerWithFlag(x.a[x.o], y.a[y.o], T_LAVA_INSTA_DEATH)]].description));
      await gameOver(P(buf), true_);
      return;
    } else {
      if (canSeeMonster(monst)) {
        monsterName(P(buf), monst, true_);
        s = P(G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layerWithFlag(x.a[x.o], y.a[y.o], T_LAVA_INSTA_DEATH)]].description);
        if (strncmp(s, S("a "), 2) === 0) {
          s = s.add(2);
        } else if (strncmp(s, S("an "), 3) === 0) {
          s = s.add(3);
        }
        sprintf(P(buf2), S("%s is consumed by the %s instantly!"), P(buf), s);
        await messageWithColor(P(buf2), messageColorFromVictim(monst), 0);
      }
      await killCreature(monst, false_);
      await spawnDungeonFeature(x.a[x.o], y.a[y.o], G.dungeonFeatureCatalog[DF_CREATURE_FIRE], true_, false_);
      await refreshDungeonCell(struct_pos.$of(x.a[x.o], y.a[y.o]));
      return;
    }
  }
  if (cellHasTMFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), TM_EXTINGUISHES_FIRE) && monst.status[STATUS_BURNING] && !monst.status[STATUS_LEVITATING] && !((monst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) && !((monst.info.flags & MONST_FIERY) >>> 0)) {
    await extinguishFireOnCreature(monst);
  }
  if (($at2(G.pmap, x.a[x.o], y.a[y.o]).flags & ANY_KIND_OF_VISIBLE) >>> 0 && cellHasTMFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), TM_IS_SECRET) && cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_OBSTRUCTS_PASSABILITY)) {
    await discover(x.a[x.o], y.a[y.o]);
  }
  if (!monst.status[STATUS_LEVITATING] && !((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0) && (!cellHasTMFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), TM_ALLOWS_SUBMERGING) || !((monst.info.flags & MONST_SUBMERGES) >>> 0)) && cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_IS_DF_TRAP) && !(($at2(G.pmap, x.a[x.o], y.a[y.o]).flags & PRESSURE_PLATE_DEPRESSED) >>> 0)) {
    ($t3 = $at2(G.pmap, x.a[x.o], y.a[y.o]), $t3.flags = ($t3.flags | PRESSURE_PLATE_DEPRESSED) >>> 0);
    if (($at2(G.pmap, x.a[x.o], y.a[y.o]).flags & ANY_KIND_OF_VISIBLE) >>> 0 && cellHasTMFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), TM_IS_SECRET)) {
      await discover(x.a[x.o], y.a[y.o]);
      await refreshDungeonCell(struct_pos.$of(x.a[x.o], y.a[y.o]));
    }
    if (canSeeMonster(monst)) {
      monsterName(P(buf), monst, true_);
      sprintf(P(buf2), S("a pressure plate clicks underneath %s!"), P(buf));
      await message(P(buf2), REQUIRE_ACKNOWLEDGMENT);
    } else if (($at2(G.pmap, x.a[x.o], y.a[y.o]).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
      await message(S("a pressure plate clicks!"), 0);
    }
    for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
      if ((G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layer]].flags & T_IS_DF_TRAP) >>> 0) {
        await spawnDungeonFeature(x.a[x.o], y.a[y.o], $sat(G.dungeonFeatureCatalog, G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layer]].fireType), true_, false_);
        await promoteTile(x.a[x.o], y.a[y.o], layer, false_);
      }
    }
  }
  if (cellHasTMFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), TM_PROMOTES_ON_CREATURE)) {
    for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
      if ((G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layer]].mechFlags & TM_PROMOTES_ON_CREATURE) >>> 0) {
        await promoteTile(x.a[x.o], y.a[y.o], layer, false_);
      }
    }
  }
  if (cellHasTMFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), TM_PROMOTES_ON_PLAYER_ENTRY) && monst === G.player) {
    for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
      if ((G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layer]].mechFlags & TM_PROMOTES_ON_PLAYER_ENTRY) >>> 0) {
        await promoteTile(x.a[x.o], y.a[y.o], layer, false_);
      }
    }
  }
  if (cellHasTMFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), TM_PROMOTES_ON_SACRIFICE_ENTRY) && monst.machineHome === $at2(G.pmap, x.a[x.o], y.a[y.o]).machineNumber && (monst.bookkeepingFlags & MB_MARKED_FOR_SACRIFICE) >>> 0) {
    for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
      if ((G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layer]].mechFlags & TM_PROMOTES_ON_SACRIFICE_ENTRY) >>> 0) {
        await promoteTile(x.a[x.o], y.a[y.o], layer, false_);
      }
    }
  }
  if (cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_ENTANGLES) && !monst.status[STATUS_STUCK] && !((monst.info.flags & (MONST_IMMUNE_TO_WEBS | MONST_INVULNERABLE)) >>> 0) && !((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
    monst.status[STATUS_STUCK] = monst.maxStatus[STATUS_STUCK] = rand_range(3, 7) << 16 >> 16;
    if (monst === G.player) {
      if (!G.rogue.automationActive) {
        sprintf(P(buf2), S("you are stuck fast in %s!"), P(G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layerWithFlag(x.a[x.o], y.a[y.o], T_ENTANGLES)]].description));
        await message(P(buf2), 0);
      }
    } else if (canDirectlySeeMonster(monst)) {
      if (!G.rogue.automationActive) {
        monsterName(P(buf), monst, true_);
        sprintf(P(buf2), S("%s is stuck fast in %s!"), P(buf), P(G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layerWithFlag(x.a[x.o], y.a[y.o], T_ENTANGLES)]].description));
        await message(P(buf2), 0);
      }
    }
  }
  if (cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_CAUSES_EXPLOSIVE_DAMAGE) && !monst.status[STATUS_EXPLOSION_IMMUNITY] && !((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
    damage = rand_range(15, 20) << 16 >> 16;
    damage = (damage > (monst.info.maxHP / 2 | 0) ? damage : monst.info.maxHP / 2 | 0) << 16 >> 16;
    monst.status[STATUS_EXPLOSION_IMMUNITY] = 5;
    if (monst === G.player) {
      G.rogue.disturbed = true_;
      for (layer = 0; NUMBER_TERRAIN_LAYERS > layer && !((G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layer]].flags & T_CAUSES_EXPLOSIVE_DAMAGE) >>> 0); ++layer) {
        ;
      }
      await message(P(G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layer]].flavorText), 0);
      if (G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0 && G.rogue.armor.enchant2 === A_DAMPENING) {
        itemName(G.rogue.armor, P(buf2), false_, false_, null);
        sprintf(P(buf), S("Your %s pulses and absorbs the damage."), P(buf2));
        await messageWithColor(P(buf), G.goodMessageColor, 0);
        await autoIdentify(G.rogue.armor);
      } else if (await inflictDamage(null, G.player, damage, G.yellow, false_)) {
        await killCreature(G.player, false_);
        strcpy(P(buf2), P(G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layerWithFlag(x.a[x.o], y.a[y.o], T_CAUSES_EXPLOSIVE_DAMAGE)]].description));
        sprintf(P(buf), S("Killed by %s"), P(buf2));
        await gameOver(P(buf), true_);
        return;
      }
    } else {
      if (monst.creatureState >>> 0 === MONSTER_SLEEPING) {
        monst.creatureState = MONSTER_TRACKING_SCENT;
      }
      monsterName(P(buf), monst, true_);
      strcpy(P(buf3), P(G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layerWithFlag(x.a[x.o], y.a[y.o], T_CAUSES_EXPLOSIVE_DAMAGE)]].description));
      if (await inflictDamage(null, monst, damage, G.yellow, false_)) {
        sprintf(P(buf2), S("%s %s %s."), P(buf), (monst.info.flags & MONST_INANIMATE) >>> 0 ? S("is destroyed by") : S("dies in"), P(buf3));
        await messageWithColor(P(buf2), messageColorFromVictim(monst), 0);
        await killCreature(monst, false_);
        await refreshDungeonCell(struct_pos.$of(x.a[x.o], y.a[y.o]));
        return;
      } else {
        sprintf(P(buf2), S("%s engulfs %s."), P(G.tileCatalog[$at2(G.pmap, x.a[x.o], y.a[y.o]).layers[layerWithFlag(x.a[x.o], y.a[y.o], T_CAUSES_EXPLOSIVE_DAMAGE)]].description), P(buf));
        await messageWithColor(P(buf2), messageColorFromVictim(monst), 0);
      }
    }
  }
  if (monst === G.player && cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_RESPIRATION_IMMUNITIES) && G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0 && G.rogue.armor.enchant2 === A_RESPIRATION) {
    if (!((G.rogue.armor.flags & ITEM_RUNIC_IDENTIFIED) >>> 0)) {
      await message(S("Your armor trembles and a pocket of clean air swirls around you."), 0);
      await autoIdentify(G.rogue.armor);
    }
  } else {
    if (cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_CAUSES_NAUSEA) && !((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0) && !((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
      if (monst === G.player) {
        G.rogue.disturbed = true_;
      }
      if (canDirectlySeeMonster(monst) && !monst.status[STATUS_NAUSEOUS]) {
        if (monst.creatureState >>> 0 === MONSTER_SLEEPING) {
          monst.creatureState = MONSTER_TRACKING_SCENT;
        }
        flashMonster(monst, G.brown, 100);
        monsterName(P(buf), monst, true_);
        sprintf(P(buf2), S("%s choke%s and gag%s on the overpowering stench of decay."), P(buf), monst === G.player ? S("") : S("s"), monst === G.player ? S("") : S("s"));
        await message(P(buf2), 0);
      }
      monst.status[STATUS_NAUSEOUS] = monst.maxStatus[STATUS_NAUSEOUS] = (monst.status[STATUS_NAUSEOUS] > 20 ? monst.status[STATUS_NAUSEOUS] : 20) << 16 >> 16;
    }
    if (cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_CAUSES_CONFUSION) && !((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
      if (monst === G.player) {
        G.rogue.disturbed = true_;
      }
      if (canDirectlySeeMonster(monst) && !monst.status[STATUS_CONFUSED]) {
        if (monst.creatureState >>> 0 === MONSTER_SLEEPING) {
          monst.creatureState = MONSTER_TRACKING_SCENT;
        }
        flashMonster(monst, G.confusionGasColor, 100);
        monsterName(P(buf), monst, true_);
        sprintf(P(buf2), S("%s %s very confused!"), P(buf), monst === G.player ? S("feel") : S("looks"));
        await message(P(buf2), 0);
      }
      monst.status[STATUS_CONFUSED] = monst.maxStatus[STATUS_CONFUSED] = (monst.status[STATUS_CONFUSED] > 25 ? monst.status[STATUS_CONFUSED] : 25) << 16 >> 16;
    }
    if (cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_CAUSES_PARALYSIS) && !((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0) && !((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
      if (canDirectlySeeMonster(monst) && !monst.status[STATUS_PARALYZED]) {
        flashMonster(monst, G.pink, 100);
        monsterName(P(buf), monst, true_);
        sprintf(P(buf2), S("%s %s paralyzed!"), P(buf), monst === G.player ? S("are") : S("is"));
        await message(P(buf2), $u64(monst === G.player ? REQUIRE_ACKNOWLEDGMENT : 0));
      }
      monst.status[STATUS_PARALYZED] = monst.maxStatus[STATUS_PARALYZED] = (monst.status[STATUS_PARALYZED] > 20 ? monst.status[STATUS_PARALYZED] : 20) << 16 >> 16;
      if (monst === G.player) {
        G.rogue.disturbed = true_;
      }
    }
  }
  if (cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_CAUSES_POISON) && !((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0) && !monst.status[STATUS_LEVITATING]) {
    if (monst === G.player && !G.player.status[STATUS_POISONED]) {
      G.rogue.disturbed = true_;
    }
    if (canDirectlySeeMonster(monst) && !monst.status[STATUS_POISONED]) {
      if (monst.creatureState >>> 0 === MONSTER_SLEEPING) {
        monst.creatureState = MONSTER_TRACKING_SCENT;
      }
      flashMonster(monst, G.green, 100);
      monsterName(P(buf), monst, true_);
      sprintf(P(buf2), S("the lichen's grasping tendrils poison %s."), P(buf));
      await messageWithColor(P(buf2), messageColorFromVictim(monst), 0);
    }
    damage = (0 > 5 - monst.status[STATUS_POISONED] ? 0 : 5 - monst.status[STATUS_POISONED]) << 16 >> 16;
    await addPoison(monst, damage, 0);
  }
  if (cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_IS_FIRE)) {
    await exposeCreatureToFire(monst);
  } else if (cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_IS_FLAMMABLE) && !($at2(G.pmap, x.a[x.o], y.a[y.o]).layers[GAS] >>> 0 !== NOTHING && $at2(G.pmap, x.a[x.o], y.a[y.o]).volume === 0) && !cellHasTerrainFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), T_IS_FIRE) && monst.status[STATUS_BURNING] && !((monst.bookkeepingFlags & (MB_SUBMERGED | MB_IS_FALLING)) >>> 0)) {
    await exposeTileToFire(x.a[x.o], y.a[y.o], true_);
  }
  if (cellHasTMFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), TM_PROMOTES_WITH_KEY) && (theItem = await keyOnTileAt(struct_pos.$of(x.a[x.o], y.a[y.o])))) {
    await useKeyAt(theItem, x.a[x.o], y.a[y.o]);
  }
}

async function applyGradualTileEffectsToCreature(monst: struct_creature | null, ticks: number): Promise<void> {
  let itemCandidates = 0;
  let randItemIndex = 0;
  let x = monst.loc.x;
  let y = monst.loc.y;
  let damage = 0;
  let buf = new Int8Array(500);
  let buf2 = new Int8Array(300);
  let theItem = null;
  let layer = 0;
  if (!monst.status[STATUS_LEVITATING] && cellHasTerrainFlag(struct_pos.$of(x, y), T_IS_DEEP_WATER) && !cellHasTerrainFlag(struct_pos.$of(x, y), T_ENTANGLES | T_OBSTRUCTS_PASSABILITY) && !((monst.info.flags & MONST_IMMUNE_TO_WATER) >>> 0)) {
    if (monst === G.player) {
      if (!(($at2(G.pmap, x, y).flags & HAS_ITEM) >>> 0) && rand_percent((ticks * 50 / 100 | 0) << 16 >> 16)) {
        itemCandidates = await numberOfMatchingPackItems(ALL_ITEMS, 0, ITEM_EQUIPPED, false_);
        if (itemCandidates) {
          randItemIndex = rand_range(1, itemCandidates) << 16 >> 16;
          for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
            if (!((theItem.flags & ITEM_EQUIPPED) >>> 0)) {
              if (randItemIndex === 1) {
                break;
              } else {
                randItemIndex = randItemIndex - 1 << 16 >> 16;
              }
            }
          }
          theItem = await dropItem(theItem);
          if (theItem) {
            itemName(theItem, P(buf2), false_, true_, null);
            sprintf(P(buf), S("%s float%s away in the current!"), P(buf2), theItem.quantity === 1 ? S("s") : S(""));
            await messageWithColor(P(buf), G.itemMessageColor, 0);
          }
        }
      }
    } else if (monst.carriedItem && !(($at2(G.pmap, x, y).flags & HAS_ITEM) >>> 0) && rand_percent((ticks * 50 / 100 | 0) << 16 >> 16)) {
      await makeMonsterDropItem(monst);
    }
  }
  if (cellHasTerrainFlag(struct_pos.$of(x, y), T_CAUSES_DAMAGE) && !((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0) && !((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
    damage = (Math.imul(monst.info.maxHP / 15 | 0, ticks) / 100 | 0) << 16 >> 16;
    damage = (1 > damage ? 1 : damage) << 16 >> 16;
    for (layer = 0; NUMBER_TERRAIN_LAYERS > layer && !((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].flags & T_CAUSES_DAMAGE) >>> 0); ++layer) {
      ;
    }
    if (monst === G.player) {
      if (G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0 && G.rogue.armor.enchant2 === A_RESPIRATION) {
        if (!((G.rogue.armor.flags & ITEM_RUNIC_IDENTIFIED) >>> 0)) {
          await message(S("Your armor trembles and a pocket of clean air swirls around you."), 0);
          await autoIdentify(G.rogue.armor);
        }
      } else {
        G.rogue.disturbed = true_;
        await messageWithColor(P(G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].flavorText), G.badMessageColor, 0);
        if (await inflictDamage(null, G.player, damage, G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].backColor, true_)) {
          await killCreature(G.player, false_);
          sprintf(P(buf), S("Killed by %s"), P(G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].description));
          await gameOver(P(buf), true_);
          return;
        }
      }
    } else {
      if (monst.creatureState >>> 0 === MONSTER_SLEEPING) {
        monst.creatureState = MONSTER_TRACKING_SCENT;
      }
      if (await inflictDamage(null, monst, damage, G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].backColor, true_)) {
        if (canSeeMonster(monst)) {
          monsterName(P(buf), monst, true_);
          sprintf(P(buf2), S("%s dies."), P(buf));
          await messageWithColor(P(buf2), messageColorFromVictim(monst), 0);
        }
        await killCreature(monst, false_);
        await refreshDungeonCell(struct_pos.$of(x, y));
        return;
      }
    }
  }
  if (cellHasTerrainFlag(struct_pos.$of(x, y), T_CAUSES_HEALING) && !((monst.info.flags & MONST_INANIMATE) >>> 0) && !((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
    damage = (Math.imul(monst.info.maxHP / 15 | 0, ticks) / 100 | 0) << 16 >> 16;
    damage = (1 > damage ? 1 : damage) << 16 >> 16;
    if (monst.info.maxHP > monst.currentHP) {
      monst.currentHP = (monst.info.maxHP > monst.currentHP + damage ? monst.currentHP + damage : monst.info.maxHP) << 16 >> 16;
      if (monst === G.player) {
        await messageWithColor(S("you feel much better."), G.goodMessageColor, 0);
      }
    }
  }
}

export function updateClairvoyance(): void {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any;
  let i = 0;
  let j = 0;
  let clairvoyanceRadius = 0;
  let dx = 0;
  let dy = 0;
  let cursed = 0;
  let cFlags = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags & ~WAS_CLAIRVOYANT_VISIBLE >>> 0) >>> 0);
      if (($at2(G.pmap, i, j).flags & CLAIRVOYANT_VISIBLE) >>> 0) {
        ($t2 = $at2(G.pmap, i, j), $t2.flags = ($t2.flags | WAS_CLAIRVOYANT_VISIBLE) >>> 0);
      }
      ($t3 = $at2(G.pmap, i, j), $t3.flags = ($t3.flags & ~(CLAIRVOYANT_VISIBLE | CLAIRVOYANT_DARKENED) >>> 0) >>> 0);
    }
  }
  cursed = (0 > G.rogue.clairvoyance ? 1 : 0) << 24 >> 24;
  if (cursed) {
    clairvoyanceRadius = (G.rogue.clairvoyance - 1) * -1 << 16 >> 16;
    cFlags = CLAIRVOYANT_DARKENED;
  } else {
    clairvoyanceRadius = (G.rogue.clairvoyance > 0 ? G.rogue.clairvoyance + 1 : 0) << 16 >> 16;
    cFlags = CLAIRVOYANT_VISIBLE | DISCOVERED;
  }
  for (i = (0 > G.player.loc.x - clairvoyanceRadius ? 0 : G.player.loc.x - clairvoyanceRadius) << 16 >> 16; (G.player.loc.x + clairvoyanceRadius + 1 > 100 - 20 - 1 ? 100 - 20 - 1 : G.player.loc.x + clairvoyanceRadius + 1) > i; i = i + 1 << 16 >> 16) {
    for (j = (0 > G.player.loc.y - clairvoyanceRadius ? 0 : G.player.loc.y - clairvoyanceRadius) << 16 >> 16; (G.player.loc.y + clairvoyanceRadius + 1 > 31 + 3 - 3 - 2 ? 31 + 3 - 3 - 2 : G.player.loc.y + clairvoyanceRadius + 1) > j; j = j + 1 << 16 >> 16) {
      dx = G.player.loc.x - i << 16 >> 16;
      dy = G.player.loc.y - j << 16 >> 16;
      if (Math.imul(clairvoyanceRadius, clairvoyanceRadius) + clairvoyanceRadius > Math.imul(dx, dx) + Math.imul(dy, dy) && ($at2(G.pmap, i, j).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, i, j).flags & DISCOVERED) >>> 0)) {
        if ((cFlags & DISCOVERED) >>> 0) {
          discoverCell(i, j);
        }
        ($t4 = $at2(G.pmap, i, j), $t4.flags = ($t4.flags | cFlags) >>> 0);
        if (!(($at2(G.pmap, i, j).flags & HAS_PLAYER) >>> 0) && !cursed) {
          ($t5 = $at2(G.pmap, i, j), $t5.flags = ($t5.flags & ~STABLE_MEMORY >>> 0) >>> 0);
        }
      }
    }
  }
}

function updateTelepathy(): void {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any;
  let i = 0;
  let j = 0;
  let grid = $arr(79, () => new Int8Array(29));
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags & ~WAS_TELEPATHIC_VISIBLE >>> 0) >>> 0);
      if (($at2(G.pmap, i, j).flags & TELEPATHIC_VISIBLE) >>> 0) {
        ($t2 = $at2(G.pmap, i, j), $t2.flags = ($t2.flags | WAS_TELEPATHIC_VISIBLE) >>> 0);
      }
      ($t3 = $at2(G.pmap, i, j), $t3.flags = ($t3.flags & ~TELEPATHIC_VISIBLE >>> 0) >>> 0);
    }
  }
  zeroOutGrid(P(grid));
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if (monsterRevealed(monst)) {
      getFOVMask(P(grid), monst.loc.x, monst.loc.y, 131072, T_OBSTRUCTS_VISION, 0, false_);
      ($t4 = pmapAt(monst.loc), $t4.flags = ($t4.flags | TELEPATHIC_VISIBLE) >>> 0);
      discoverCell(monst.loc.x, monst.loc.y);
    }
  }
  for (let it = iterateCreatures(G.dormantMonsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if (monsterRevealed(monst)) {
      getFOVMask(P(grid), monst.loc.x, monst.loc.y, 131072, T_OBSTRUCTS_VISION, 0, false_);
      ($t5 = pmapAt(monst.loc), $t5.flags = ($t5.flags | TELEPATHIC_VISIBLE) >>> 0);
      discoverCell(monst.loc.x, monst.loc.y);
    }
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (grid[i][j]) {
        ($t6 = $at2(G.pmap, i, j), $t6.flags = ($t6.flags | TELEPATHIC_VISIBLE) >>> 0);
        discoverCell(i, j);
      }
    }
  }
}

export function scentDistance(x1: number, y1: number, x2: number, y2: number): number {
  if (Math.abs(x1 - x2) > Math.abs(y1 - y2)) {
    return 2 * Math.abs(x1 - x2) + Math.abs(y1 - y2) << 16 >> 16;
  } else {
    return Math.abs(x1 - x2) + 2 * Math.abs(y1 - y2) << 16 >> 16;
  }
}

function updateScent(): void {
  let i = 0;
  let j = 0;
  let grid = $arr(79, () => new Int8Array(29));
  zeroOutGrid(P(grid));
  getFOVMask(P(grid), G.player.loc.x, G.player.loc.y, 5177344, T_OBSTRUCTS_SCENT, 0, false_);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (grid[i][j]) {
        addScentToCell(i, j, scentDistance(G.player.loc.x, G.player.loc.y, i, j));
      }
    }
  }
  addScentToCell(G.player.loc.x, G.player.loc.y, 0);
}

export function armorStealthAdjustment(theArmor: struct_item | null): number {
  if (!theArmor || !(theArmor.category & ARMOR)) {
    return 0;
  }
  return (0 > G.armorTable[theArmor.kind].strengthRequired - 12 ? 0 : G.armorTable[theArmor.kind].strengthRequired - 12) << 16 >> 16;
}

export function currentStealthRange(): number {
  let stealthRange = 14;
  if (G.player.status[STATUS_INVISIBLE]) {
    stealthRange = 1;
  } else {
    if (playerInDarkness()) {
      stealthRange = (stealthRange / 2 | 0) << 16 >> 16;
    }
    if ((pmapAt(G.player.loc).flags & IS_IN_SHADOW) >>> 0) {
      stealthRange = (stealthRange / 2 | 0) << 16 >> 16;
    }
    stealthRange = stealthRange + armorStealthAdjustment(G.rogue.armor) << 16 >> 16;
    if (G.rogue.justRested) {
      stealthRange = ((stealthRange + 1) / 2 | 0) << 16 >> 16;
    }
    if (G.player.status[STATUS_AGGRAVATING] > 0) {
      stealthRange = stealthRange + G.player.status[STATUS_AGGRAVATING] << 16 >> 16;
    }
    stealthRange = stealthRange - G.rogue.stealthBonus << 16 >> 16;
    if (2 > stealthRange && !G.rogue.justRested) {
      stealthRange = 2;
    } else if (1 > stealthRange) {
      stealthRange = 1;
    }
  }
  return stealthRange;
}

export function demoteVisibility(): void {
  let $t1: any, $t2: any, $t3: any;
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags & ~WAS_VISIBLE >>> 0) >>> 0);
      if (($at2(G.pmap, i, j).flags & VISIBLE) >>> 0) {
        ($t2 = $at2(G.pmap, i, j), $t2.flags = ($t2.flags & ~VISIBLE >>> 0) >>> 0);
        ($t3 = $at2(G.pmap, i, j), $t3.flags = ($t3.flags | WAS_VISIBLE) >>> 0);
      }
    }
  }
}

export function discoverCell(x: number, y: number): void {
  let $t1: any, $t2: any;
  ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags & ~STABLE_MEMORY >>> 0) >>> 0);
  if (!(($at2(G.pmap, x, y).flags & DISCOVERED) >>> 0)) {
    ($t2 = $at2(G.pmap, x, y), $t2.flags = ($t2.flags | DISCOVERED) >>> 0);
    if (!cellHasTerrainFlag(struct_pos.$of(x, y), T_PATHING_BLOCKER)) {
      G.rogue.xpxpThisTurn = G.rogue.xpxpThisTurn + 1 << 16 >> 16;
    }
  }
}

export async function updateVision(refreshDisplay: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any;
  let i = 0;
  let j = 0;
  let grid = $arr(79, () => new Int8Array(29));
  let theItem = null;
  demoteVisibility();
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags & ~IN_FIELD_OF_VIEW >>> 0) >>> 0);
    }
  }
  zeroOutGrid(P(grid));
  getFOVMask(P(grid), G.player.loc.x, G.player.loc.y, 7077888, T_OBSTRUCTS_VISION, 0, false_);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (grid[i][j]) {
        ($t2 = $at2(G.pmap, i, j), $t2.flags = ($t2.flags | IN_FIELD_OF_VIEW) >>> 0);
      }
    }
  }
  ($t3 = pmapAt(G.player.loc), $t3.flags = ($t3.flags | (IN_FIELD_OF_VIEW | VISIBLE)) >>> 0);
  if (0 > G.rogue.clairvoyance) {
    discoverCell(G.player.loc.x, G.player.loc.y);
  }
  if (G.rogue.clairvoyance !== 0) {
    updateClairvoyance();
  }
  updateTelepathy();
  updateLighting();
  await updateFieldOfViewDisplay(true_, refreshDisplay);
  if (G.player.status[STATUS_HALLUCINATING] > 0) {
    for (theItem = G.floorItems.nextItem; !!theItem; theItem = theItem.nextItem) {
      if ((pmapAt(theItem.loc).flags & DISCOVERED) >>> 0 && refreshDisplay) {
        await refreshDungeonCell(theItem.loc.$clone());
      }
    }
    for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
      let monst = nextCreature(it);
      if ((pmapAt(monst.loc).flags & DISCOVERED) >>> 0 && refreshDisplay) {
        await refreshDungeonCell(monst.loc.$clone());
      }
    }
  }
}

async function checkNutrition(): Promise<void> {
  let theItem = null;
  let buf = new Int8Array(237);
  let foodWarning = new Int8Array(237);
  if (await numberOfMatchingPackItems(FOOD, 0, 0, false_) === 0) {
    sprintf(P(foodWarning), S(" and have no food"));
  } else {
    foodWarning[0] = 0;
  }
  if (G.player.status[STATUS_NUTRITION] === HUNGER_THRESHOLD) {
    --G.player.status[STATUS_NUTRITION];
    sprintf(P(buf), S("you are hungry%s."), P(foodWarning));
    await message(P(buf), $u64(foodWarning[0] ? REQUIRE_ACKNOWLEDGMENT : 0));
  } else if (G.player.status[STATUS_NUTRITION] === WEAK_THRESHOLD) {
    --G.player.status[STATUS_NUTRITION];
    sprintf(P(buf), S("you feel weak with hunger%s."), P(foodWarning));
    await message(P(buf), REQUIRE_ACKNOWLEDGMENT);
  } else if (G.player.status[STATUS_NUTRITION] === FAINT_THRESHOLD) {
    --G.player.status[STATUS_NUTRITION];
    sprintf(P(buf), S("you feel faint with hunger%s."), P(foodWarning));
    await message(P(buf), REQUIRE_ACKNOWLEDGMENT);
  } else if (1 >= G.player.status[STATUS_NUTRITION]) {
    for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
      if (theItem.category === FOOD) {
        sprintf(P(buf), S("unable to control your hunger, you eat a %s."), theItem.kind === FRUIT ? S("mango") : S("ration of food"));
        await messageWithColor(P(buf), G.itemMessageColor, REQUIRE_ACKNOWLEDGMENT);
        confirmMessages();
        await eat(theItem, false_);
        await playerTurnEnded();
        break;
      }
    }
  }
  if (G.player.status[STATUS_NUTRITION] === 1) {
    G.player.status[STATUS_NUTRITION] = 0;
    await message(S("you are starving to death!"), REQUIRE_ACKNOWLEDGMENT);
  }
}

export async function burnItem(theItem: struct_item | null): Promise<void> {
  let $t1: any;
  let x = 0;
  let y = 0;
  let buf1 = new Int8Array(300);
  let buf2 = new Int8Array(300);
  itemName(theItem, P(buf1), false_, true_, null);
  sprintf(P(buf2), S("%s burn%s up!"), P(buf1), theItem.quantity === 1 ? S("s") : S(""));
  x = theItem.loc.x;
  y = theItem.loc.y;
  removeItemFromChain(theItem, G.floorItems);
  deleteItem(theItem);
  ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags & ~(HAS_ITEM | ITEM_DETECTED) >>> 0) >>> 0);
  if (($at2(G.pmap, x, y).flags & (ANY_KIND_OF_VISIBLE | DISCOVERED | ITEM_DETECTED)) >>> 0) {
    await refreshDungeonCell(struct_pos.$of(x, y));
  }
  if (($at2(G.pmap, x, y).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
    await messageWithColor(P(buf2), G.itemMessageColor, 0);
  }
  await spawnDungeonFeature(x, y, G.dungeonFeatureCatalog[DF_ITEM_FIRE], true_, false_);
}

async function flashCreatureAlert(monst: struct_creature | null, msg: Ptr | null, foreColor: struct_color | null, backColor: struct_color | null): Promise<void> {
  let x = 0;
  let y = 0;
  if (monst.loc.y > (DROWS / 2 | 0)) {
    y = monst.loc.y - 2 + 3 << 16 >> 16;
  } else {
    y = monst.loc.y + 2 + 3 << 16 >> 16;
  }
  x = monst.loc.x - (strLenWithoutEscapes(msg) / 2 | 0) + 20 + 1 << 16 >> 16;
  if (x > COLS - strLenWithoutEscapes(msg)) {
    x = COLS - strLenWithoutEscapes(msg) << 16 >> 16;
  }
  await flashMessage(msg, x, y, G.rogue.playbackMode ? 100 : 1000, foreColor, backColor);
  G.rogue.disturbed = true_;
  G.rogue.autoPlayingLevel = false_;
}

async function handleHealthAlerts(): Promise<void> {
  let i = 0;
  let currentPercent = 0;
  let previousPercent = 0;
  let thresholds = $ta(Int16Array, 4, [5, 10, 25, 40]);
  let pThresholds = $ta(Int16Array, 3, [100, 90, 50]);
  let buf = new Int8Array(79);
  let healthThresholdsCount = 4;
  let poisonThresholdsCount = 3;
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  currentPercent = (G.player.currentHP * 100 / G.player.info.maxHP | 0) << 16 >> 16;
  previousPercent = (G.player.previousHealthPoints * 100 / G.player.info.maxHP | 0) << 16 >> 16;
  if (previousPercent > currentPercent && !G.rogue.gameHasEnded) {
    for (i = 0; healthThresholdsCount > i; i = i + 1 << 16 >> 16) {
      if (thresholds[i] > currentPercent && previousPercent >= thresholds[i]) {
        sprintf(P(buf), S(" <%i%% health "), thresholds[i]);
        await flashCreatureAlert(G.player, P(buf), G.badMessageColor, G.darkRed);
        break;
      }
    }
  }
  if (!G.rogue.gameHasEnded) {
    currentPercent = (Math.imul(G.player.status[STATUS_POISONED], G.player.poisonAmount) * 100 / G.player.currentHP | 0) << 16 >> 16;
    if (currentPercent > G.rogue.previousPoisonPercent && !G.rogue.gameHasEnded) {
      for (i = 0; poisonThresholdsCount > i; i = i + 1 << 16 >> 16) {
        if (currentPercent > pThresholds[i] && pThresholds[i] >= G.rogue.previousPoisonPercent) {
          if (100 > currentPercent) {
            sprintf(P(buf), S(" >%i%% poisoned "), pThresholds[i]);
          } else {
            strcpy(P(buf), S(" Fatally poisoned "));
          }
          await flashCreatureAlert(G.player, P(buf), G.yellow, G.darkGreen);
          break;
        }
      }
    }
    G.rogue.previousPoisonPercent = currentPercent;
  }
  G.rogue.RNG = oldRNG;
  ;
}

async function addXPXPToAlly(monst: struct_creature | null): Promise<void> {
  if (!(monst.creatureState >>> 0 === MONSTER_ALLY) || (monst.info.flags & (MONST_INANIMATE | MONST_IMMOBILE)) >>> 0) {
    return;
  }
  monst.xpxp = monst.xpxp + G.rogue.xpxpThisTurn << 16 >> 16;
  if (!((monst.bookkeepingFlags & MB_TELEPATHICALLY_REVEALED) >>> 0) && monst.xpxp >= XPXP_NEEDED_FOR_TELEPATHIC_BOND) {
    monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_TELEPATHICALLY_REVEALED) >>> 0;
    await updateVision(true_);
    let theMonsterName = new Int8Array(100);
    let buf = new Int8Array(200);
    monsterName(P(theMonsterName), monst, false_);
    sprintf(P(buf), S("you have developed a telepathic bond with your %s."), P(theMonsterName));
    await messageWithColor(P(buf), G.advancementMessageColor, 0);
  }
  if (!G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_COMPANION] && monst.xpxp >= G.gameConst.companionFeatRequiredXP) {
    G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_COMPANION] = true_;
  }
}

async function handleXPXP(): Promise<void> {
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    await addXPXPToAlly(monst);
  }
  if (G.rogue.depthLevel > 1) {
    for (let it = iterateCreatures($sadd(G.levels, (G.rogue.depthLevel - 2)).monsters); hasNextCreature(it); ) {
      let monst = nextCreature(it);
      await addXPXPToAlly(monst);
    }
  }
  if (G.gameConst.deepestLevel > G.rogue.depthLevel) {
    for (let it = iterateCreatures($sadd(G.levels, G.rogue.depthLevel).monsters); hasNextCreature(it); ) {
      let monst = nextCreature(it);
      await addXPXPToAlly(monst);
    }
  }
  G.rogue.xpxpThisTurn = 0;
}

async function playerFalls(): Promise<void> {
  let damage = 0;
  let layer = 0;
  if (cellHasTMFlag(G.player.loc, TM_IS_SECRET) && ($at2(G.pmap, G.player.loc.x, G.player.loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
    await discover(G.player.loc.x, G.player.loc.y);
  }
  await monstersFall();
  await updateFloorItems();
  layer = layerWithFlag(G.player.loc.x, G.player.loc.y, T_AUTO_DESCENT) << 16 >> 16;
  if (layer >= 0) {
    await message(P(G.tileCatalog[pmapAt(G.player.loc).layers[layer]].flavorText), REQUIRE_ACKNOWLEDGMENT);
  } else if (layer === -1) {
    await message(S("You plunge downward!"), REQUIRE_ACKNOWLEDGMENT);
  }
  G.player.bookkeepingFlags = (G.player.bookkeepingFlags & ~(MB_IS_FALLING | MB_SEIZED | MB_SEIZING) >>> 0) >>> 0;
  G.rogue.disturbed = true_;
  if (G.gameConst.deepestLevel > G.rogue.depthLevel) {
    G.rogue.depthLevel = G.rogue.depthLevel + 1 << 16 >> 16;
    await startLevel(G.rogue.depthLevel - 1 << 16 >> 16, 0);
    damage = randClumpedRange(G.gameConst.fallDamageMin << 16 >> 16, G.gameConst.fallDamageMax << 16 >> 16, 2);
    let killed = false_;
    if ((terrainFlags(G.player.loc) & T_IS_DEEP_WATER) >>> 0) {
      await messageWithColor(S("You fall into deep water, unharmed."), G.badMessageColor, 0);
    } else {
      if (cellHasTMFlag(G.player.loc, TM_ALLOWS_SUBMERGING)) {
        damage = (damage / 2 | 0) << 16 >> 16;
      }
      await messageWithColor(S("You are injured by the fall."), G.badMessageColor, 0);
      if (await inflictDamage(null, G.player, damage, G.red, false_)) {
        await killCreature(G.player, false_);
        await gameOver(S("Killed by a fall"), true_);
        killed = true_;
      }
    }
    if (!killed && G.rogue.depthLevel > G.rogue.deepestLevel) {
      G.rogue.deepestLevel = G.rogue.depthLevel;
    }
  } else {
    await message(S("A strange force seizes you as you fall."), 0);
    await teleport(G.player, struct_pos.$of(-1, -1), true_);
  }
  createFlare(G.player.loc.x, G.player.loc.y, GENERIC_FLASH_LIGHT);
  await animateFlares(G.rogue.flares, G.rogue.flareCount);
  G.rogue.flareCount = 0;
}

export async function activateMachine(machineNumber: number): Promise<void> {
  let $t1: any;
  let i = 0;
  let j = 0;
  let x = 0;
  let y = 0;
  let layer = 0;
  let sRows = new Int16Array(29);
  let sCols = new Int16Array(79);
  let monsterCount = 0;
  let maxMonsters = 0;
  fillSequentialList(P(sCols), DCOLS);
  shuffleList(P(sCols), DCOLS);
  fillSequentialList(P(sRows), DROWS);
  shuffleList(P(sRows), DROWS);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      x = sCols[i];
      y = sRows[j];
      if (($at2(G.pmap, x, y).flags & IS_IN_MACHINE) >>> 0 && $at2(G.pmap, x, y).machineNumber === machineNumber && !(($at2(G.pmap, x, y).flags & IS_POWERED) >>> 0) && cellHasTMFlag(struct_pos.$of(x, y), TM_IS_WIRED)) {
        ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags | IS_POWERED) >>> 0);
        for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; layer = layer + 1 << 16 >> 16) {
          if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].mechFlags & TM_IS_WIRED) >>> 0) {
            await promoteTile(x, y, layer, false_);
          }
        }
      }
    }
  }
  monsterCount = maxMonsters = 0;
  let activatedMonsterList = null;
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if (monst.machineHome === machineNumber && monst.spawnDepth === G.rogue.depthLevel && (monst.info.flags & MONST_GETS_TURN_ON_ACTIVATION) >>> 0) {
      monsterCount = monsterCount + 1 << 16 >> 16;
      if (monsterCount > maxMonsters) {
        maxMonsters = maxMonsters + 10 << 16 >> 16;
        activatedMonsterList = $realloc(activatedMonsterList, 8 * $u64(maxMonsters), Array);
      }
      activatedMonsterList.a[activatedMonsterList.o + (monsterCount - 1)] = monst;
    }
  }
  for (i = 0; monsterCount > i; i = i + 1 << 16 >> 16) {
    if (!((activatedMonsterList.a[activatedMonsterList.o + i].bookkeepingFlags & MB_IS_DYING) >>> 0)) {
      await monstersTurn(activatedMonsterList.a[activatedMonsterList.o + i]);
    }
  }
  if (activatedMonsterList) {
    free(activatedMonsterList);
  }
}

export function circuitBreakersPreventActivation(machineNumber: number): number {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($at2(G.pmap, i, j).machineNumber === machineNumber && cellHasTMFlag(struct_pos.$of(i, j), TM_IS_CIRCUIT_BREAKER)) {
        return true_;
      }
    }
  }
  return false_;
}

export async function promoteTile(x: number, y: number, layer: number, useFireDF: number): Promise<void> {
  let $t1: any, $t2: any;
  let i = 0;
  let j = 0;
  let DFType = 0;
  let tile = null;
  tile = $sat(G.tileCatalog, $at2(G.pmap, x, y).layers[layer]);
  DFType = (useFireDF ? tile.fireType >>> 0 : tile.promoteType >>> 0) | 0;
  if ((tile.mechFlags & TM_VANISHES_UPON_PROMOTION) >>> 0) {
    if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].flags & T_PATHING_BLOCKER) >>> 0) {
      G.rogue.staleLoopMap = true_;
    }
    $at2(G.pmap, x, y).layers[layer] = layer === DUNGEON ? FLOOR : NOTHING;
    if (layer === GAS) {
      $at2(G.pmap, x, y).volume = 0;
    }
    await refreshDungeonCell(struct_pos.$of(x, y));
  }
  if (DFType) {
    await spawnDungeonFeature(x, y, $sat(G.dungeonFeatureCatalog, DFType), true_, false_);
  }
  if (!useFireDF && (tile.mechFlags & TM_IS_WIRED) >>> 0 && !(($at2(G.pmap, x, y).flags & IS_POWERED) >>> 0) && !circuitBreakersPreventActivation($at2(G.pmap, x, y).machineNumber)) {
    ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags | IS_POWERED) >>> 0);
    await activateMachine($at2(G.pmap, x, y).machineNumber);
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        ($t2 = $at2(G.pmap, i, j), $t2.flags = ($t2.flags & ~IS_POWERED >>> 0) >>> 0);
      }
    }
  }
}

export async function exposeTileToElectricity(x: number, y: number): Promise<number> {
  let layer = 0;
  let promotedSomething = false_;
  if (!cellHasTMFlag(struct_pos.$of(x, y), TM_PROMOTES_ON_ELECTRICITY)) {
    return false_;
  }
  for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
    if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].mechFlags & TM_PROMOTES_ON_ELECTRICITY) >>> 0) {
      await promoteTile(x, y, layer, false_);
      promotedSomething = true_;
    }
  }
  return promotedSomething;
}

export async function exposeTileToFire(x: number, y: number, alwaysIgnite: number): Promise<number> {
  let $t1: any;
  let layer = 0;
  let ignitionChance = 0;
  let bestExtinguishingPriority = 1000;
  let explosiveNeighborCount = 0;
  let newX = 0;
  let newY = 0;
  let dir = 0;
  let fireIgnited = false_;
  let explosivePromotion = false_;
  if (!cellHasTerrainFlag(struct_pos.$of(x, y), T_IS_FLAMMABLE) || $at2(G.pmap, x, y).exposedToFire >= 12) {
    return false_;
  }
  ($t1 = $at2(G.pmap, x, y), $t1.exposedToFire = $t1.exposedToFire + 1 << 16 >> 16);
  for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
    if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].mechFlags & TM_EXTINGUISHES_FIRE) >>> 0 && bestExtinguishingPriority > G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].drawPriority) {
      bestExtinguishingPriority = G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].drawPriority;
    }
  }
  for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
    if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].flags & T_IS_FLAMMABLE) >>> 0 && (layer === GAS || bestExtinguishingPriority >= G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].drawPriority) && G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].chanceToIgnite > ignitionChance) {
      ignitionChance = G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].chanceToIgnite;
    }
  }
  if (alwaysIgnite || ignitionChance && rand_percent(ignitionChance)) {
    fireIgnited = true_;
    if (cellHasTMFlag(struct_pos.$of(x, y), TM_EXPLOSIVE_PROMOTE)) {
      for (dir = 0, explosiveNeighborCount = 0; DIRECTION_COUNT > dir; ++dir) {
        newX = x + G.nbDirs[dir][0] << 16 >> 16;
        newY = y + G.nbDirs[dir][1] << 16 >> 16;
        if (coordinatesAreInMap(newX, newY) && (cellHasTerrainFlag(struct_pos.$of(newX, newY), T_IS_FIRE | T_OBSTRUCTS_GAS) || cellHasTMFlag(struct_pos.$of(newX, newY), TM_EXPLOSIVE_PROMOTE))) {
          explosiveNeighborCount = explosiveNeighborCount + 1 << 16 >> 16;
        }
      }
      if (explosiveNeighborCount >= 8) {
        explosivePromotion = true_;
      }
    }
    for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
      if ((G.tileCatalog[$at2(G.pmap, x, y).layers[layer]].flags & T_IS_FLAMMABLE) >>> 0) {
        if (layer === GAS) {
          $at2(G.pmap, x, y).volume = 0;
        }
        await promoteTile(x, y, layer, (!explosivePromotion ? 1 : 0) << 24 >> 24);
      }
    }
    await refreshDungeonCell(struct_pos.$of(x, y));
  }
  return fireIgnited;
}

async function updateVolumetricMedia(): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any;
  let i = 0;
  let j = 0;
  let newX = 0;
  let newY = 0;
  let numSpaces = 0;
  let highestNeighborVolume = 0;
  let sum = 0;
  let gasType = 0;
  let dir = 0;
  let newGasVolume = $arr(79, () => new Uint16Array(29));
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      newGasVolume[i][j] = 0;
    }
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (!cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_GAS)) {
        sum = $at2(G.pmap, i, j).volume;
        numSpaces = 1;
        highestNeighborVolume = $at2(G.pmap, i, j).volume;
        gasType = $at2(G.pmap, i, j).layers[GAS];
        for (dir = 0; DIRECTION_COUNT > dir; ++dir) {
          newX = i + G.nbDirs[dir][0] << 16 >> 16;
          newY = j + G.nbDirs[dir][1] << 16 >> 16;
          if (coordinatesAreInMap(newX, newY) && !cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_GAS)) {
            sum = sum + $at2(G.pmap, newX, newY).volume;
            numSpaces = numSpaces + 1 << 16 >> 16;
            if ($at2(G.pmap, newX, newY).volume > highestNeighborVolume) {
              highestNeighborVolume = $at2(G.pmap, newX, newY).volume;
              gasType = $at2(G.pmap, newX, newY).layers[GAS];
            }
          }
        }
        if (cellHasTerrainFlag(struct_pos.$of(i, j), T_AUTO_DESCENT)) {
          numSpaces = numSpaces + 1 << 16 >> 16;
        }
        ($t1 = newGasVolume[i], $t2 = j, $t1[$t2] = $t1[$t2] + Math.trunc(sum / $u64(1 > numSpaces ? 1 : numSpaces)) & 0xffff);
        if (rand_range(0, numSpaces - 1) >>> 0 < sum % $u64(numSpaces)) {
          ($t3 = newGasVolume[i], $t4 = j, $t3[$t4] = $t3[$t4] + 1 & 0xffff);
        }
        if ($at2(G.pmap, i, j).layers[GAS] >>> 0 !== gasType >>> 0 && newGasVolume[i][j] > 3) {
          if ($at2(G.pmap, i, j).layers[GAS] >>> 0 !== NOTHING) {
            newGasVolume[i][j] = (newGasVolume[i][j] > 3 ? 3 : newGasVolume[i][j]) & 0xffff;
          }
          $at2(G.pmap, i, j).layers[GAS] = gasType;
        } else if ($at2(G.pmap, i, j).layers[GAS] >>> 0 && 1 > newGasVolume[i][j]) {
          $at2(G.pmap, i, j).layers[GAS] = NOTHING;
          await refreshDungeonCell(struct_pos.$of(i, j));
        }
        if ($at2(G.pmap, i, j).volume > 0) {
          if ((G.tileCatalog[$at2(G.pmap, i, j).layers[GAS]].mechFlags & TM_GAS_DISSIPATES_QUICKLY) >>> 0) {
            ($t5 = newGasVolume[i], $t6 = j, $t5[$t6] = $t5[$t6] - (rand_percent(50) ? 1 : 0) & 0xffff);
          } else if ((G.tileCatalog[$at2(G.pmap, i, j).layers[GAS]].mechFlags & TM_GAS_DISSIPATES) >>> 0) {
            ($t7 = newGasVolume[i], $t8 = j, $t7[$t8] = $t7[$t8] - (rand_percent(20) ? 1 : 0) & 0xffff);
          }
        }
      } else if ($at2(G.pmap, i, j).volume > 0) {
        numSpaces = 0;
        for (dir = 0; DIRECTION_COUNT > dir; ++dir) {
          newX = i + G.nbDirs[dir][0] << 16 >> 16;
          newY = j + G.nbDirs[dir][1] << 16 >> 16;
          if (coordinatesAreInMap(newX, newY) && !cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_GAS)) {
            numSpaces = numSpaces + 1 << 16 >> 16;
          }
        }
        if (numSpaces > 0) {
          for (dir = 0; DIRECTION_COUNT > dir; ++dir) {
            newX = i + G.nbDirs[dir][0] << 16 >> 16;
            newY = j + G.nbDirs[dir][1] << 16 >> 16;
            if (coordinatesAreInMap(newX, newY) && !cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_GAS)) {
              ($t9 = newGasVolume[newX], $t10 = newY, $t9[$t10] = $t9[$t10] + ($at2(G.pmap, i, j).volume / numSpaces | 0) & 0xffff);
              if ($at2(G.pmap, i, j).volume / numSpaces | 0) {
                $at2(G.pmap, newX, newY).layers[GAS] = $at2(G.pmap, i, j).layers[GAS];
              }
            }
          }
        }
        newGasVolume[i][j] = 0;
        $at2(G.pmap, i, j).layers[GAS] = NOTHING;
      }
    }
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($at2(G.pmap, i, j).volume !== newGasVolume[i][j]) {
        $at2(G.pmap, i, j).volume = newGasVolume[i][j];
        await refreshDungeonCell(struct_pos.$of(i, j));
      }
    }
  }
}

function updateYendorWardenTracking(): void {
  let $t1: any;
  let n = 0;
  if (!G.rogue.yendorWarden) {
    return;
  }
  if (G.rogue.yendorWarden.depth === G.rogue.depthLevel) {
    return;
  }
  if (!((G.rogue.yendorWarden.bookkeepingFlags & MB_PREPLACED) >>> 0)) {
    ($t1 = $at2($sadd(G.levels, (G.rogue.yendorWarden.depth - 1)).mapStorage, G.rogue.yendorWarden.loc.x, G.rogue.yendorWarden.loc.y), $t1.flags = ($t1.flags & ~HAS_MONSTER >>> 0) >>> 0);
  }
  n = G.rogue.yendorWarden.depth - 1 << 16 >> 16;
  removeCreature($sadd(G.levels, n).monsters, G.rogue.yendorWarden);
  if (G.rogue.yendorWarden.depth > G.rogue.depthLevel) {
    G.rogue.yendorWarden.depth = G.rogue.depthLevel + 1 << 16 >> 16;
    n = G.rogue.yendorWarden.depth - 1 << 16 >> 16;
    G.rogue.yendorWarden.bookkeepingFlags = (G.rogue.yendorWarden.bookkeepingFlags | MB_APPROACHING_UPSTAIRS) >>> 0;
    G.rogue.yendorWarden.loc.x = $sadd(G.levels, n).downStairsLoc.x;
    G.rogue.yendorWarden.loc.y = $sadd(G.levels, n).downStairsLoc.y;
  } else {
    G.rogue.yendorWarden.depth = G.rogue.depthLevel - 1 << 16 >> 16;
    n = G.rogue.yendorWarden.depth - 1 << 16 >> 16;
    G.rogue.yendorWarden.bookkeepingFlags = (G.rogue.yendorWarden.bookkeepingFlags | MB_APPROACHING_DOWNSTAIRS) >>> 0;
    G.rogue.yendorWarden.loc.x = $sadd(G.levels, n).upStairsLoc.x;
    G.rogue.yendorWarden.loc.y = $sadd(G.levels, n).upStairsLoc.y;
  }
  prependCreature($sadd(G.levels, (G.rogue.yendorWarden.depth - 1)).monsters, G.rogue.yendorWarden);
  G.rogue.yendorWarden.bookkeepingFlags = (G.rogue.yendorWarden.bookkeepingFlags | MB_PREPLACED) >>> 0;
  G.rogue.yendorWarden.status[STATUS_ENTERS_LEVEL_IN] = 50;
}

export async function monstersFall(): Promise<void> {
  let $t1: any;
  let x = 0;
  let y = 0;
  let buf = new Int8Array(79);
  let buf2 = new Int8Array(79);
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if ((monst.bookkeepingFlags & MB_IS_FALLING) >>> 0 || monsterShouldFall(monst)) {
      monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_IS_FALLING) >>> 0;
      x = monst.loc.x;
      y = monst.loc.y;
      if (canSeeMonster(monst)) {
        monsterName(P(buf), monst, true_);
        sprintf(P(buf2), S("%s plunges out of sight!"), P(buf));
        await messageWithColor(P(buf2), messageColorFromVictim(monst), 0);
      }
      if ((monst.info.flags & MONST_GETS_TURN_ON_ACTIVATION) >>> 0) {
        await killCreature(monst, false_);
      } else if (!await inflictDamage(null, monst, randClumpedRange(6, 12, 2), G.red, false_)) {
        demoteMonsterFromLeadership(monst);
        monst.status[STATUS_ENTRANCED] = 0;
        monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_PREPLACED) >>> 0;
        monst.bookkeepingFlags = (monst.bookkeepingFlags & ~(MB_IS_FALLING | MB_SEIZED | MB_SEIZING) >>> 0) >>> 0;
        monst.targetCorpseLoc.$cp(struct_pos.$of(-1, -1));
        removeCreature(G.monsters, monst);
        prependCreature($sadd(G.levels, (G.rogue.depthLevel - 1 + 1)).monsters, monst);
        monst.depth = G.rogue.depthLevel + 1 << 16 >> 16;
        if (monst === G.rogue.yendorWarden) {
          updateYendorWardenTracking();
        }
      } else {
        await killCreature(monst, false_);
      }
      ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags & ~HAS_MONSTER >>> 0) >>> 0);
      await refreshDungeonCell(struct_pos.$of(x, y));
    }
  }
}

export async function updateEnvironment(): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let i = 0;
  let j = 0;
  let direction = 0;
  let newX = 0;
  let newY = 0;
  let promotions = $arr(79, () => new Int16Array(29));
  let promoteChance = 0;
  let layer = 0;
  let tile = null;
  let isVolumetricGas = false_;
  await monstersFall();
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      $at2(G.pmap, i, j).exposedToFire = 0;
    }
  }
  for (i = 0; DCOLS > i && !isVolumetricGas; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j && !isVolumetricGas; j = j + 1 << 16 >> 16) {
      if (!isVolumetricGas && $at2(G.pmap, i, j).layers[GAS] >>> 0) {
        isVolumetricGas = true_;
      }
    }
  }
  if (isVolumetricGas) {
    await updateVolumetricMedia();
    await updateVolumetricMedia();
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      promotions[i][j] = 0;
      for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
        tile = $sat(G.tileCatalog, $at2(G.pmap, i, j).layers[layer]);
        if (0 > tile.promoteChance) {
          promoteChance = 0;
          for (direction = 0; 4 > direction; direction = direction + 1 << 16 >> 16) {
            if (coordinatesAreInMap(i + G.nbDirs[direction][0] << 16 >> 16, j + G.nbDirs[direction][1] << 16 >> 16) && !cellHasTerrainFlag(struct_pos.$of(i + G.nbDirs[direction][0] << 16 >> 16, j + G.nbDirs[direction][1] << 16 >> 16), T_OBSTRUCTS_PASSABILITY) && $at2(G.pmap, i + G.nbDirs[direction][0], j + G.nbDirs[direction][1]).layers[layer] >>> 0 !== $at2(G.pmap, i, j).layers[layer] >>> 0 && !(($at2(G.pmap, i, j).flags & CAUGHT_FIRE_THIS_TURN) >>> 0)) {
              promoteChance += -1 * tile.promoteChance;
            }
          }
        } else {
          promoteChance = tile.promoteChance;
        }
        if (promoteChance && !(($at2(G.pmap, i, j).flags & CAUGHT_FIRE_THIS_TURN) >>> 0) && rand_range(0, 10000) < promoteChance) {
          ($t1 = promotions[i], $t2 = j, $t1[$t2] = (($u64($t1[$t2]) | $shl64(1, layer)) >>> 0) << 16 >> 16);
        }
      }
    }
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
        if (($u64(promotions[i][j]) & $shl64(1, layer)) >>> 0) {
          await promoteTile(i, j, layer, false_);
        }
      }
    }
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      ($t3 = $at2(G.pmap, i, j), $t3.flags = ($t3.flags & ~CAUGHT_FIRE_THIS_TURN >>> 0) >>> 0);
      if (!(($at2(G.pmap, i, j).flags & (HAS_PLAYER | HAS_MONSTER | HAS_ITEM)) >>> 0) && ($at2(G.pmap, i, j).flags & PRESSURE_PLATE_DEPRESSED) >>> 0) {
        ($t4 = $at2(G.pmap, i, j), $t4.flags = ($t4.flags & ~PRESSURE_PLATE_DEPRESSED >>> 0) >>> 0);
      }
      if (cellHasTMFlag(struct_pos.$of(i, j), TM_PROMOTES_WITHOUT_KEY) && !await keyOnTileAt(struct_pos.$of(i, j))) {
        for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
          if ((G.tileCatalog[$at2(G.pmap, i, j).layers[layer]].mechFlags & TM_PROMOTES_WITHOUT_KEY) >>> 0) {
            await promoteTile(i, j, layer, false_);
          }
        }
      }
    }
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (cellHasTerrainFlag(struct_pos.$of(i, j), T_IS_FIRE) && !(($at2(G.pmap, i, j).flags & CAUGHT_FIRE_THIS_TURN) >>> 0)) {
        await exposeTileToFire(i, j, false_);
        for (direction = 0; 4 > direction; direction = direction + 1 << 16 >> 16) {
          newX = i + G.nbDirs[direction][0] << 16 >> 16;
          newY = j + G.nbDirs[direction][1] << 16 >> 16;
          if (coordinatesAreInMap(newX, newY)) {
            await exposeTileToFire(newX, newY, false_);
          }
        }
      }
    }
  }
  await updateFloorItems();
}

export function updateAllySafetyMap(): void {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let i = 0;
  let j = 0;
  let playerCostMap = null;
  let monsterCostMap = null;
  G.rogue.updatedAllySafetyMapThisTurn = true_;
  playerCostMap = allocGrid();
  monsterCostMap = allocGrid();
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      $wr(G.allySafetyMap.a[G.allySafetyMap.o + i], j, 30000);
      $wr(playerCostMap.a[playerCostMap.o + i], j, $wr(monsterCostMap.a[monsterCostMap.o + i], j, 1));
      if (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_PASSABILITY) && (!cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET) || (discoveredTerrainFlagsAtLoc(struct_pos.$of(i, j)) & T_OBSTRUCTS_PASSABILITY) >>> 0)) {
        $wr(playerCostMap.a[playerCostMap.o + i], j, $wr(monsterCostMap.a[monsterCostMap.o + i], j, (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_DIAGONAL_MOVEMENT) ? PDS_OBSTRUCTION : PDS_FORBIDDEN) << 16 >> 16));
      } else if (cellHasTerrainFlag(struct_pos.$of(i, j), T_PATHING_BLOCKER & ~T_OBSTRUCTS_PASSABILITY)) {
        $wr(playerCostMap.a[playerCostMap.o + i], j, $wr(monsterCostMap.a[monsterCostMap.o + i], j, PDS_FORBIDDEN));
      } else if (cellHasTerrainFlag(struct_pos.$of(i, j), T_SACRED)) {
        $wr(playerCostMap.a[playerCostMap.o + i], j, 1);
        $wr(monsterCostMap.a[monsterCostMap.o + i], j, PDS_FORBIDDEN);
      } else if (($at2(G.pmap, i, j).flags & HAS_MONSTER) >>> 0 && monstersAreEnemies(G.player, monsterAtLoc(struct_pos.$of(i, j)))) {
        $wr(playerCostMap.a[playerCostMap.o + i], j, 1);
        $wr(monsterCostMap.a[monsterCostMap.o + i], j, PDS_FORBIDDEN);
        $wr(G.allySafetyMap.a[G.allySafetyMap.o + i], j, 0);
      }
    }
  }
  $wr(playerCostMap.a[playerCostMap.o + G.player.loc.x], G.player.loc.y, PDS_FORBIDDEN);
  $wr(monsterCostMap.a[monsterCostMap.o + G.player.loc.x], G.player.loc.y, PDS_FORBIDDEN);
  dijkstraScan(G.allySafetyMap, playerCostMap, false_);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (0 > $rd(monsterCostMap.a[monsterCostMap.o + i], j)) {
        continue;
      }
      if ($rd(G.allySafetyMap.a[G.allySafetyMap.o + i], j) === 30000) {
        $wr(G.allySafetyMap.a[G.allySafetyMap.o + i], j, 150);
      }
      $wr(G.allySafetyMap.a[G.allySafetyMap.o + i], j, (50 * $rd(G.allySafetyMap.a[G.allySafetyMap.o + i], j) / (50 + $rd(G.allySafetyMap.a[G.allySafetyMap.o + i], j)) | 0) << 16 >> 16);
      ($t1 = G.allySafetyMap.a[G.allySafetyMap.o + i], $t2 = j, $t1.a[$t1.o + $t2] = $t1.a[$t1.o + $t2] * -3 << 16 >> 16);
      if (($at2(G.pmap, i, j).flags & IN_LOOP) >>> 0) {
        ($t3 = G.allySafetyMap.a[G.allySafetyMap.o + i], $t4 = j, $t3.a[$t3.o + $t4] = $t3.a[$t3.o + $t4] - 10 << 16 >> 16);
      }
    }
  }
  dijkstraScan(G.allySafetyMap, monsterCostMap, false_);
  freeGrid(playerCostMap);
  freeGrid(monsterCostMap);
}

function resetDistanceCellInGrid(grid: Ptr | null, x: number, y: number): void {
  let dir = 0;
  let newX = 0;
  let newY = 0;
  for (dir = 0; 4 > dir; ++dir) {
    newX = x + G.nbDirs[dir][0] << 16 >> 16;
    newY = y + G.nbDirs[dir][1] << 16 >> 16;
    if (coordinatesAreInMap(newX, newY) && $rd(grid.a[grid.o + x], y) > $rd(grid.a[grid.o + newX], newY) + 1) {
      $wr(grid.a[grid.o + x], y, $rd(grid.a[grid.o + newX], newY) + 1 << 16 >> 16);
    }
  }
}

export function updateSafetyMap(): void {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let i = 0;
  let j = 0;
  let playerCostMap = null;
  let monsterCostMap = null;
  let monst = null;
  G.rogue.updatedSafetyMapThisTurn = true_;
  playerCostMap = allocGrid();
  monsterCostMap = allocGrid();
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      $wr(G.safetyMap.a[G.safetyMap.o + i], j, 30000);
      $wr(playerCostMap.a[playerCostMap.o + i], j, $wr(monsterCostMap.a[monsterCostMap.o + i], j, 1));
      if (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_PASSABILITY) && (!cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET) || (discoveredTerrainFlagsAtLoc(struct_pos.$of(i, j)) & T_OBSTRUCTS_PASSABILITY) >>> 0)) {
        $wr(playerCostMap.a[playerCostMap.o + i], j, $wr(monsterCostMap.a[monsterCostMap.o + i], j, (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_DIAGONAL_MOVEMENT) ? PDS_OBSTRUCTION : PDS_FORBIDDEN) << 16 >> 16));
      } else if (cellHasTerrainFlag(struct_pos.$of(i, j), T_SACRED)) {
        $wr(playerCostMap.a[playerCostMap.o + i], j, 1);
        $wr(monsterCostMap.a[monsterCostMap.o + i], j, PDS_FORBIDDEN);
      } else if (cellHasTerrainFlag(struct_pos.$of(i, j), T_LAVA_INSTA_DEATH)) {
        $wr(monsterCostMap.a[monsterCostMap.o + i], j, PDS_FORBIDDEN);
        if (G.player.status[STATUS_LEVITATING] || !G.player.status[STATUS_IMMUNE_TO_FIRE]) {
          $wr(playerCostMap.a[playerCostMap.o + i], j, 1);
        } else {
          $wr(playerCostMap.a[playerCostMap.o + i], j, PDS_FORBIDDEN);
        }
      } else {
        if (($at2(G.pmap, i, j).flags & HAS_MONSTER) >>> 0) {
          monst = monsterAtLoc(struct_pos.$of(i, j));
          if ((monst.creatureState >>> 0 === MONSTER_SLEEPING || monst.turnsSpentStationary > 2 || (monst.info.flags & MONST_GETS_TURN_ON_ACTIVATION) >>> 0 || monst.creatureState >>> 0 === MONSTER_ALLY) && monst.creatureState >>> 0 !== MONSTER_FLEEING) {
            $wr(playerCostMap.a[playerCostMap.o + i], j, 1);
            $wr(monsterCostMap.a[monsterCostMap.o + i], j, PDS_FORBIDDEN);
            continue;
          }
        }
        if (cellHasTerrainFlag(struct_pos.$of(i, j), T_AUTO_DESCENT | T_IS_DF_TRAP)) {
          $wr(monsterCostMap.a[monsterCostMap.o + i], j, PDS_FORBIDDEN);
          if (G.player.status[STATUS_LEVITATING]) {
            $wr(playerCostMap.a[playerCostMap.o + i], j, 1);
          } else {
            $wr(playerCostMap.a[playerCostMap.o + i], j, PDS_FORBIDDEN);
          }
        } else if (cellHasTerrainFlag(struct_pos.$of(i, j), T_IS_FIRE)) {
          $wr(monsterCostMap.a[monsterCostMap.o + i], j, PDS_FORBIDDEN);
          if (G.player.status[STATUS_IMMUNE_TO_FIRE]) {
            $wr(playerCostMap.a[playerCostMap.o + i], j, 1);
          } else {
            $wr(playerCostMap.a[playerCostMap.o + i], j, PDS_FORBIDDEN);
          }
        } else if (cellHasTerrainFlag(struct_pos.$of(i, j), T_IS_DEEP_WATER | T_SPONTANEOUSLY_IGNITES)) {
          if (G.player.status[STATUS_LEVITATING]) {
            $wr(playerCostMap.a[playerCostMap.o + i], j, 1);
          } else {
            $wr(playerCostMap.a[playerCostMap.o + i], j, 5);
          }
          $wr(monsterCostMap.a[monsterCostMap.o + i], j, 5);
        } else if (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_PASSABILITY) && cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET) && !((discoveredTerrainFlagsAtLoc(struct_pos.$of(i, j)) & T_OBSTRUCTS_PASSABILITY) >>> 0) && !(($at2(G.pmap, i, j).flags & IN_FIELD_OF_VIEW) >>> 0)) {
          $wr(playerCostMap.a[playerCostMap.o + i], j, 100);
          $wr(monsterCostMap.a[monsterCostMap.o + i], j, 1);
        } else {
          $wr(playerCostMap.a[playerCostMap.o + i], j, $wr(monsterCostMap.a[monsterCostMap.o + i], j, 1));
        }
      }
    }
  }
  $wr(G.safetyMap.a[G.safetyMap.o + G.player.loc.x], G.player.loc.y, 0);
  $wr(playerCostMap.a[playerCostMap.o + G.player.loc.x], G.player.loc.y, 1);
  $wr(monsterCostMap.a[monsterCostMap.o + G.player.loc.x], G.player.loc.y, PDS_FORBIDDEN);
  $wr(playerCostMap.a[playerCostMap.o + G.rogue.upLoc.x], G.rogue.upLoc.y, PDS_FORBIDDEN);
  $wr(monsterCostMap.a[monsterCostMap.o + G.rogue.upLoc.x], G.rogue.upLoc.y, PDS_FORBIDDEN);
  $wr(playerCostMap.a[playerCostMap.o + G.rogue.downLoc.x], G.rogue.downLoc.y, PDS_FORBIDDEN);
  $wr(monsterCostMap.a[monsterCostMap.o + G.rogue.downLoc.x], G.rogue.downLoc.y, PDS_FORBIDDEN);
  dijkstraScan(G.safetyMap, playerCostMap, false_);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_PASSABILITY) && cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET) && !((discoveredTerrainFlagsAtLoc(struct_pos.$of(i, j)) & T_OBSTRUCTS_PASSABILITY) >>> 0) && !(($at2(G.pmap, i, j).flags & IN_FIELD_OF_VIEW) >>> 0)) {
        resetDistanceCellInGrid(G.safetyMap, i, j);
      }
    }
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (0 > $rd(monsterCostMap.a[monsterCostMap.o + i], j)) {
        continue;
      }
      if ($rd(G.safetyMap.a[G.safetyMap.o + i], j) === 30000) {
        $wr(G.safetyMap.a[G.safetyMap.o + i], j, 150);
      }
      $wr(G.safetyMap.a[G.safetyMap.o + i], j, (50 * $rd(G.safetyMap.a[G.safetyMap.o + i], j) / (50 + $rd(G.safetyMap.a[G.safetyMap.o + i], j)) | 0) << 16 >> 16);
      ($t1 = G.safetyMap.a[G.safetyMap.o + i], $t2 = j, $t1.a[$t1.o + $t2] = $t1.a[$t1.o + $t2] * -3 << 16 >> 16);
      if (($at2(G.pmap, i, j).flags & IN_LOOP) >>> 0) {
        ($t3 = G.safetyMap.a[G.safetyMap.o + i], $t4 = j, $t3.a[$t3.o + $t4] = $t3.a[$t3.o + $t4] - 10 << 16 >> 16);
      }
    }
  }
  dijkstraScan(G.safetyMap, monsterCostMap, false_);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (0 > $rd(monsterCostMap.a[monsterCostMap.o + i], j)) {
        $wr(G.safetyMap.a[G.safetyMap.o + i], j, 30000);
      }
    }
  }
  freeGrid(playerCostMap);
  freeGrid(monsterCostMap);
}

export function updateSafeTerrainMap(): void {
  let i = 0;
  let j = 0;
  let costMap = null;
  let monst = null;
  G.rogue.updatedMapToSafeTerrainThisTurn = true_;
  costMap = allocGrid();
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      monst = monsterAtLoc(struct_pos.$of(i, j));
      if (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_PASSABILITY) && (!cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET) || (discoveredTerrainFlagsAtLoc(struct_pos.$of(i, j)) & T_OBSTRUCTS_PASSABILITY) >>> 0)) {
        $wr(costMap.a[costMap.o + i], j, (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_DIAGONAL_MOVEMENT) ? PDS_OBSTRUCTION : PDS_FORBIDDEN) << 16 >> 16);
        $wr(G.rogue.mapToSafeTerrain.a[G.rogue.mapToSafeTerrain.o + i], j, 30000);
      } else if (monst && (monst.turnsSpentStationary > 1 || (monst.info.flags & MONST_GETS_TURN_ON_ACTIVATION) >>> 0) || cellHasTerrainFlag(struct_pos.$of(i, j), T_PATHING_BLOCKER & ~T_HARMFUL_TERRAIN) && !cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET)) {
        $wr(costMap.a[costMap.o + i], j, PDS_FORBIDDEN);
        $wr(G.rogue.mapToSafeTerrain.a[G.rogue.mapToSafeTerrain.o + i], j, 30000);
      } else if (cellHasTerrainFlag(struct_pos.$of(i, j), T_HARMFUL_TERRAIN) || $at2(G.pmap, i, j).layers[DUNGEON] >>> 0 === DOOR) {
        $wr(costMap.a[costMap.o + i], j, 1);
        $wr(G.rogue.mapToSafeTerrain.a[G.rogue.mapToSafeTerrain.o + i], j, 30000);
      } else {
        $wr(costMap.a[costMap.o + i], j, 1);
        $wr(G.rogue.mapToSafeTerrain.a[G.rogue.mapToSafeTerrain.o + i], j, 0);
      }
    }
  }
  dijkstraScan(G.rogue.mapToSafeTerrain, costMap, false_);
  freeGrid(costMap);
}

async function processIncrementalAutoID(): Promise<void> {
  let theItem = null;
  let autoIdentifyItems = [G.rogue.armor, G.rogue.ringLeft, G.rogue.ringRight];
  let buf = new Int8Array(237);
  let theItemName = new Int8Array(237);
  let i = 0;
  for (i = 0; 3 > i; i = i + 1 << 16 >> 16) {
    theItem = autoIdentifyItems[i];
    if (theItem && theItem.charges > 0 && (!((theItem.flags & ITEM_IDENTIFIED) >>> 0) || theItem.category & RING && !G.ringTable[theItem.kind].identified)) {
      theItem.charges = theItem.charges - 1 << 16 >> 16;
      if (0 >= theItem.charges) {
        itemName(theItem, P(theItemName), false_, false_, null);
        sprintf(P(buf), S("you are now familiar enough with your %s to identify it."), P(theItemName));
        await messageWithColor(P(buf), G.itemMessageColor, 0);
        if (theItem.category & ARMOR) {
          theItem.flags = (theItem.flags | ITEM_IDENTIFIED) >>> 0;
        } else if (theItem.category & RING) {
          identify(theItem);
        }
        updateIdentifiableItems();
        itemName(theItem, P(theItemName), true_, true_, null);
        sprintf(P(buf), S("%s %s."), theItem.quantity > 1 ? S("they are") : S("it is"), P(theItemName));
        await messageWithColor(P(buf), G.itemMessageColor, 0);
      }
    }
  }
}

export function staffChargeDuration(theItem: struct_item | null): number {
  return ((theItem.kind === STAFF_BLINKING || theItem.kind === STAFF_OBSTRUCTION ? 10000 : 5000) / theItem.enchant1 | 0) << 16 >> 16;
}

export async function rechargeItemsIncrementally(multiplier: number): Promise<void> {
  let theItem = null;
  let buf = new Int8Array(237);
  let theItemName = new Int8Array(237);
  let rechargeIncrement = 0;
  let staffRechargeDuration = 0;
  if (G.rogue.wisdomBonus) {
    rechargeIncrement = Math.trunc($mul64(10, ringWisdomMultiplier($mul64(G.rogue.wisdomBonus, FP_FACTOR))) / FP_FACTOR) << 16 >> 16;
  } else {
    rechargeIncrement = 10;
  }
  rechargeIncrement = Math.imul(rechargeIncrement, multiplier) << 16 >> 16;
  for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
    if (theItem.category & STAFF) {
      if (theItem.enchant1 > theItem.charges && rechargeIncrement > 0 || theItem.charges > 0 && 0 > rechargeIncrement) {
        theItem.enchant2 = theItem.enchant2 - rechargeIncrement << 16 >> 16;
      }
      staffRechargeDuration = staffChargeDuration(theItem);
      while (0 >= theItem.enchant2) {
        if (theItem.enchant1 > theItem.charges) {
          theItem.charges = theItem.charges + 1 << 16 >> 16;
        }
        theItem.enchant2 = theItem.enchant2 + randClumpedRange(((staffRechargeDuration / 3 | 0) > 1 ? staffRechargeDuration / 3 | 0 : 1) << 16 >> 16, (staffRechargeDuration * 5 / 3 | 0) << 16 >> 16, 3) << 16 >> 16;
      }
      while (theItem.enchant2 > (staffRechargeDuration * 5 / 3 | 0)) {
        if (theItem.charges > 0) {
          theItem.charges = theItem.charges - 1 << 16 >> 16;
        }
        theItem.enchant2 = theItem.enchant2 - staffRechargeDuration << 16 >> 16;
      }
    } else if (theItem.category & CHARM && theItem.charges > 0) {
      theItem.charges = (charmRechargeDelay(theItem.kind, theItem.enchant1) < (theItem.charges - multiplier > 0 ? theItem.charges - multiplier : 0) ? charmRechargeDelay(theItem.kind, theItem.enchant1) : theItem.charges - multiplier > 0 ? theItem.charges - multiplier : 0) << 16 >> 16;
      if (theItem.charges === 0) {
        itemName(theItem, P(theItemName), false_, false_, null);
        sprintf(P(buf), S("your %s has recharged."), P(theItemName));
        await message(P(buf), 0);
      }
    }
  }
}

export async function extinguishFireOnCreature(monst: struct_creature | null): Promise<void> {
  monst.status[STATUS_BURNING] = 0;
  if (monst === G.player) {
    G.player.info.foreColor = G.white;
    G.rogue.minersLight.lightColor = G.minersLightColor;
    await refreshDungeonCell(G.player.loc.$clone());
    await updateVision(true_);
    await message(S("you are no longer on fire."), 0);
  }
}

async function monsterEntersLevel(monst: struct_creature | null, n: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any;
  let monstName = new Int8Array(100);
  let buf = new Int8Array(100);
  let pit = false_;
  ($t1 = $at2($sadd(G.levels, n).mapStorage, monst.loc.x, monst.loc.y), $t1.flags = ($t1.flags & ~HAS_MONSTER >>> 0) >>> 0);
  if ((monst.bookkeepingFlags & MB_APPROACHING_DOWNSTAIRS) >>> 0) {
    monst.loc.$cp(G.rogue.upLoc);
  } else if ((monst.bookkeepingFlags & MB_APPROACHING_UPSTAIRS) >>> 0) {
    monst.loc.$cp(G.rogue.downLoc);
  } else if ((monst.bookkeepingFlags & MB_APPROACHING_PIT) >>> 0) {
    pit = true_;
    monst.loc.$cp($sadd(G.levels, n).playerExitedVia);
  } else {
    ;
  }
  monst.depth = G.rogue.depthLevel;
  monst.targetCorpseLoc.$cp(struct_pos.$of(-1, -1));
  if (!pit) {
    monst.loc.$cp(getQualifyingPathLocNear(monst.loc.$clone(), true_, (T_DIVIDES_LEVEL & avoidedFlagsForMonster(monst.info)) >>> 0, 0, avoidedFlagsForMonster(monst.info), HAS_STAIRS, false_));
  }
  if (!pit && (pmapAt(monst.loc).flags & (HAS_PLAYER | HAS_MONSTER)) >>> 0 && !((terrainFlags(monst.loc) & avoidedFlagsForMonster(monst.info)) >>> 0)) {
    let prevMonst = monsterAtLoc(monst.loc);
    ;
    prevMonst.loc.$cp(getQualifyingPathLocNear(monst.loc.$clone(), true_, (T_DIVIDES_LEVEL & avoidedFlagsForMonster(prevMonst.info)) >>> 0, 0, avoidedFlagsForMonster(prevMonst.info), HAS_MONSTER | HAS_PLAYER | HAS_STAIRS, false_));
    ($t2 = pmapAt(monst.loc), $t2.flags = ($t2.flags & ~(HAS_PLAYER | HAS_MONSTER) >>> 0) >>> 0);
    ($t3 = pmapAt(prevMonst.loc), $t3.flags = ($t3.flags | $u64(prevMonst === G.player ? HAS_PLAYER : HAS_MONSTER)) >>> 0);
    await refreshDungeonCell(prevMonst.loc.$clone());
  }
  removeCreature($sadd(G.levels, n).monsters, monst);
  prependCreature(G.monsters, monst);
  monst.status[STATUS_ENTERS_LEVEL_IN] = 0;
  monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_PREPLACED) >>> 0;
  monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_IS_FALLING >>> 0) >>> 0;
  restoreMonster(monst, null, null);
  monst.ticksUntilTurn = monst.movementSpeed;
  await refreshDungeonCell(monst.loc.$clone());
  if (pit) {
    monsterName(P(monstName), monst, true_);
    if (!monst.status[STATUS_LEVITATING]) {
      if (await inflictDamage(null, monst, randClumpedRange(6, 12, 2), G.red, false_)) {
        if (canSeeMonster(monst)) {
          sprintf(P(buf), S("%s plummets from above and splatters against the ground!"), P(monstName));
          await messageWithColor(P(buf), messageColorFromVictim(monst), 0);
        }
        await killCreature(monst, false_);
      } else {
        if (canSeeMonster(monst)) {
          sprintf(P(buf), S("%s falls from above and crashes to the ground!"), P(monstName));
          await message(P(buf), 0);
        }
      }
    } else if (canSeeMonster(monst)) {
      sprintf(P(buf), S("%s swoops into the cavern from above."), P(monstName));
      await message(P(buf), 0);
    }
  }
}

async function monstersApproachStairs(): Promise<void> {
  let n = 0;
  for (n = G.rogue.depthLevel - 2 << 16 >> 16; G.rogue.depthLevel >= n; n = n + 2 << 16 >> 16) {
    if (n >= 0 && G.gameConst.deepestLevel > n && $sadd(G.levels, n).visited) {
      for (let it = iterateCreatures($sadd(G.levels, n).monsters); hasNextCreature(it); ) {
        let monst = nextCreature(it);
        if (monst.status[STATUS_ENTERS_LEVEL_IN] > 1) {
          --monst.status[STATUS_ENTERS_LEVEL_IN];
        } else if (monst.status[STATUS_ENTERS_LEVEL_IN] === 1) {
          await monsterEntersLevel(monst, n);
        }
      }
    }
  }
  if (G.rogue.yendorWarden && Math.abs(G.rogue.depthLevel - G.rogue.yendorWarden.depth) > 1) {
    updateYendorWardenTracking();
  }
}

async function decrementPlayerStatus(): Promise<void> {
  if (!G.player.status[STATUS_PARALYZED]) {
    if (G.player.status[STATUS_NUTRITION] > 0) {
      if (!await numberOfMatchingPackItems(AMULET, 0, 0, false_) || rand_percent(20)) {
        --G.player.status[STATUS_NUTRITION];
      }
    }
    await checkNutrition();
  }
  if (G.player.status[STATUS_TELEPATHIC] > 0 && !--G.player.status[STATUS_TELEPATHIC]) {
    await updateVision(true_);
    await message(S("your preternatural mental sensitivity fades."), 0);
  }
  if (G.player.status[STATUS_DARKNESS] > 0) {
    --G.player.status[STATUS_DARKNESS];
    updateMinersLightRadius();
    if (!G.player.status[STATUS_DARKNESS]) {
      await message(S("the cloak of darkness lifts from your vision."), 0);
    }
  }
  if (G.player.status[STATUS_HALLUCINATING] > 0 && !--G.player.status[STATUS_HALLUCINATING]) {
    await displayLevel();
    await message(S("your hallucinations fade."), 0);
  }
  if (G.player.status[STATUS_LEVITATING] > 0 && !--G.player.status[STATUS_LEVITATING]) {
    await message(S("you are no longer levitating."), 0);
  }
  if (G.player.status[STATUS_CONFUSED] > 0 && !--G.player.status[STATUS_CONFUSED]) {
    await message(S("you no longer feel confused."), 0);
  }
  if (G.player.status[STATUS_NAUSEOUS] > 0 && !--G.player.status[STATUS_NAUSEOUS]) {
    await message(S("you feel less nauseous."), 0);
  }
  if (G.player.status[STATUS_PARALYZED] > 0 && !--G.player.status[STATUS_PARALYZED]) {
    await message(S("you can move again."), 0);
  }
  if (G.player.status[STATUS_HASTED] > 0 && !--G.player.status[STATUS_HASTED]) {
    G.player.movementSpeed = G.player.info.movementSpeed;
    G.player.attackSpeed = G.player.info.attackSpeed;
    synchronizePlayerTimeState();
    await message(S("your supernatural speed fades."), 0);
  }
  if (G.player.status[STATUS_SLOWED] > 0 && !--G.player.status[STATUS_SLOWED]) {
    G.player.movementSpeed = G.player.info.movementSpeed;
    G.player.attackSpeed = G.player.info.attackSpeed;
    synchronizePlayerTimeState();
    await message(S("your normal speed resumes."), 0);
  }
  if (G.player.status[STATUS_WEAKENED] > 0 && !--G.player.status[STATUS_WEAKENED]) {
    G.player.weaknessAmount = 0;
    await message(S("strength returns to your muscles as the weakening toxin wears off."), 0);
    updateEncumbrance();
  }
  if (G.player.status[STATUS_DONNING]) {
    --G.player.status[STATUS_DONNING];
    recalculateEquipmentBonuses();
  }
  if (G.player.status[STATUS_IMMUNE_TO_FIRE] > 0 && !--G.player.status[STATUS_IMMUNE_TO_FIRE]) {
    await message(S("you no longer feel immune to fire."), 0);
  }
  if (G.player.status[STATUS_STUCK] && !cellHasTerrainFlag(G.player.loc, T_ENTANGLES)) {
    G.player.status[STATUS_STUCK] = 0;
  }
  if (G.player.status[STATUS_EXPLOSION_IMMUNITY]) {
    --G.player.status[STATUS_EXPLOSION_IMMUNITY];
  }
  if (G.player.status[STATUS_DISCORDANT]) {
    --G.player.status[STATUS_DISCORDANT];
  }
  if (G.player.status[STATUS_AGGRAVATING]) {
    --G.player.status[STATUS_AGGRAVATING];
  }
  if (G.player.status[STATUS_SHIELDED]) {
    G.player.status[STATUS_SHIELDED] -= G.player.maxStatus[STATUS_SHIELDED] / 20 | 0;
    if (0 >= G.player.status[STATUS_SHIELDED]) {
      G.player.status[STATUS_SHIELDED] = G.player.maxStatus[STATUS_SHIELDED] = 0;
    }
  }
  if (G.player.status[STATUS_INVISIBLE] > 0 && !--G.player.status[STATUS_INVISIBLE]) {
    await message(S("you are no longer invisible."), 0);
  }
  if (0 >= G.rogue.monsterSpawnFuse) {
    await spawnPeriodicHorde();
    G.rogue.monsterSpawnFuse = rand_range(125, 175) & 0xffff;
  }
}

function dangerChanged(danger: Ptr | null): number {
  for (let dir = 0; 4 > dir; ++dir) {
    let newLoc = posNeighborInDirection(G.player.loc, dir).$clone();
    if (danger.a[danger.o + dir] !== monsterAvoids(G.player, newLoc)) {
      return true_;
    }
  }
  return false_;
}

export async function autoRest(): Promise<void> {
  let danger = new Int8Array(4);
  for (let dir = 0; 4 > dir; ++dir) {
    let newLoc = posNeighborInDirection(G.player.loc, dir).$clone();
    danger[dir] = monsterAvoids(G.player, newLoc);
  }
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_ALREADY_SEEN >>> 0) >>> 0;
  }
  G.rogue.disturbed = false_;
  G.rogue.automationActive = true_;
  let initiallyEmbedded = cellHasTerrainFlag(G.player.loc, T_OBSTRUCTS_PASSABILITY);
  if ((G.player.info.maxHP > G.player.currentHP || G.player.status[STATUS_HALLUCINATING] || G.player.status[STATUS_CONFUSED] || G.player.status[STATUS_NAUSEOUS] || G.player.status[STATUS_POISONED] || G.player.status[STATUS_DARKNESS] || initiallyEmbedded) && !G.rogue.disturbed) {
    let i = 0;
    while (i++ < TURNS_FOR_FULL_REGEN && (G.player.info.maxHP > G.player.currentHP || G.player.status[STATUS_HALLUCINATING] || G.player.status[STATUS_CONFUSED] || G.player.status[STATUS_NAUSEOUS] || G.player.status[STATUS_POISONED] || G.player.status[STATUS_DARKNESS] || cellHasTerrainFlag(G.player.loc, T_OBSTRUCTS_PASSABILITY)) && !G.rogue.disturbed && (!initiallyEmbedded || cellHasTerrainFlag(G.player.loc, T_OBSTRUCTS_PASSABILITY))) {
      recordKeystroke(REST_KEY, false_, false_);
      G.rogue.justRested = true_;
      await playerTurnEnded();
      if (dangerChanged(P(danger)) || await pauseAnimation(1, struct_PauseBehavior.$of())) {
        G.rogue.disturbed = true_;
      }
    }
  } else {
    for (let i = 0; 100 > i && !G.rogue.disturbed; ++i) {
      recordKeystroke(REST_KEY, false_, false_);
      G.rogue.justRested = true_;
      await playerTurnEnded();
      if (dangerChanged(P(danger)) || await pauseAnimation(1, struct_PauseBehavior.$of())) {
        G.rogue.disturbed = true_;
      }
    }
  }
  G.rogue.automationActive = false_;
}

export async function manualSearch(): Promise<void> {
  recordKeystroke(SEARCH_KEY, false_, false_);
  if (0 >= G.player.status[STATUS_SEARCHING]) {
    G.player.status[STATUS_SEARCHING] = 0;
    G.player.maxStatus[STATUS_SEARCHING] = 5;
  }
  G.player.status[STATUS_SEARCHING] += 1;
  let searchStrength = 0;
  if (5 > G.player.status[STATUS_SEARCHING]) {
    searchStrength = (G.rogue.awarenessBonus >= 0 ? 60 : 30) << 16 >> 16;
  } else {
    searchStrength = 160;
    await message(S("you finish your detailed search of the area."), 0);
    G.player.status[STATUS_SEARCHING] = 0;
  }
  await search((searchStrength > G.rogue.awarenessBonus + 30 ? searchStrength : G.rogue.awarenessBonus + 30) << 16 >> 16);
  G.rogue.justSearched = true_;
  await playerTurnEnded();
}

export function synchronizePlayerTimeState(): void {
  G.rogue.ticksTillUpdateEnvironment = G.player.ticksUntilTurn;
}

export function playerRecoversFromAttacking(anAttackHit: number): void {
  if (G.player.ticksUntilTurn >= 0) {
    if (G.rogue.weapon && (G.rogue.weapon.flags & ITEM_ATTACKS_STAGGER) >>> 0 && anAttackHit) {
      G.player.ticksUntilTurn = G.player.ticksUntilTurn + 2 * G.player.attackSpeed << 16 >> 16;
    } else if (G.rogue.weapon && (G.rogue.weapon.flags & ITEM_ATTACKS_QUICKLY) >>> 0) {
      G.player.ticksUntilTurn = G.player.ticksUntilTurn + (G.player.attackSpeed / 2 | 0) << 16 >> 16;
    } else {
      G.player.ticksUntilTurn = G.player.ticksUntilTurn + G.player.attackSpeed << 16 >> 16;
    }
  }
}

function recordCurrentCreatureHealths(): void {
  let handledPlayer = false_;
  for (let it = iterateCreatures(G.monsters); !handledPlayer || hasNextCreature(it); ) {
    let monst = !handledPlayer ? G.player : nextCreature(it);
    handledPlayer = true_;
    monst.previousHealthPoints = monst.currentHP;
  }
}

export async function playerTurnEnded(): Promise<void> {
  let $t1: any;
  let soonestTurn = 0;
  let damage = 0;
  let turnsRequiredToShore = 0;
  let turnsToShore = 0;
  let buf = new Int8Array(100);
  let buf2 = new Int8Array(100);
  let fastForward = false_;
  let oldRNG = 0;
  ;
  await handleXPXP();
  resetDFMessageEligibility();
  recordCurrentCreatureHealths();
  if ((G.player.bookkeepingFlags & MB_IS_FALLING) >>> 0) {
    await playerFalls();
    if (!G.rogue.gameHasEnded) {
      await handleHealthAlerts();
    }
    return;
  }
  await monstersFall();
  do {
    if (G.rogue.gameHasEnded) {
      return;
    }
    if (!G.player.status[STATUS_PARALYZED]) {
      G.rogue.playerTurnNumber = $u64(G.rogue.playerTurnNumber + 1);
    }
    G.rogue.absoluteTurnNumber = $u64(G.rogue.absoluteTurnNumber + 1);
    if (G.player.status[STATUS_INVISIBLE]) {
      G.rogue.scentTurnNumber = G.rogue.scentTurnNumber + 10 & 0xffff;
    } else {
      G.rogue.scentTurnNumber = G.rogue.scentTurnNumber + 3 & 0xffff;
    }
    if (G.rogue.scentTurnNumber > 20000) {
      resetScentTurnNumber();
    }
    if (0 >= G.player.status[STATUS_NUTRITION]) {
      G.player.currentHP = G.player.currentHP - 1 << 16 >> 16;
      if (0 >= G.player.currentHP) {
        await gameOver(S("Starved to death"), true_);
        return;
      }
    } else if (G.player.info.maxHP > G.player.currentHP && !G.player.status[STATUS_POISONED]) {
      if ((G.player.turnsUntilRegen -= 1000) <= 0) {
        G.player.currentHP = G.player.currentHP + 1 << 16 >> 16;
        if (G.player.currentHP > G.player.previousHealthPoints) {
          G.player.previousHealthPoints = G.player.previousHealthPoints + 1 << 16 >> 16;
        }
        G.player.turnsUntilRegen += G.player.info.turnsBetweenRegen;
      }
      if (G.player.regenPerTurn) {
        G.player.currentHP = G.player.currentHP + G.player.regenPerTurn << 16 >> 16;
        if (G.player.currentHP > G.player.previousHealthPoints) {
          G.player.previousHealthPoints = (G.player.previousHealthPoints + G.player.regenPerTurn > G.player.currentHP ? G.player.currentHP : G.player.previousHealthPoints + G.player.regenPerTurn) << 16 >> 16;
        }
      }
    }
    if (G.rogue.awarenessBonus > -30 && !((pmapAt(G.player.loc).flags & SEARCHED_FROM_HERE) >>> 0)) {
      await search(G.rogue.awarenessBonus + 30 << 16 >> 16);
      ($t1 = pmapAt(G.player.loc), $t1.flags = ($t1.flags | SEARCHED_FROM_HERE) >>> 0);
    }
    if (!G.rogue.justSearched && G.player.status[STATUS_SEARCHING] > 0) {
      G.player.status[STATUS_SEARCHING] = 0;
    }
    if (G.rogue.staleLoopMap) {
      analyzeMap(false_);
    }
    for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
      let monst = nextCreature(it);
      if ((monst.bookkeepingFlags & MB_BOUND_TO_LEADER) >>> 0 && (!monst.leader || !((monst.bookkeepingFlags & MB_FOLLOWER) >>> 0)) && monst.creatureState >>> 0 !== MONSTER_ALLY) {
        await killCreature(monst, false_);
        if (canSeeMonster(monst)) {
          monsterName(P(buf2), monst, true_);
          sprintf(P(buf), S("%s dissipates into thin air"), P(buf2));
          await combatMessage(P(buf), messageColorFromVictim(monst));
        }
      }
    }
    if (G.player.status[STATUS_BURNING] > 0) {
      damage = rand_range(1, 3) << 16 >> 16;
      if (!G.player.status[STATUS_IMMUNE_TO_FIRE] && await inflictDamage(null, G.player, damage, G.orange, true_)) {
        await killCreature(G.player, false_);
        await gameOver(S("Burned to death"), true_);
      }
      if (!--G.player.status[STATUS_BURNING]) {
        await extinguishFireOnCreature(G.player);
      }
    }
    if (G.player.status[STATUS_POISONED] > 0) {
      --G.player.status[STATUS_POISONED];
      if (await inflictDamage(null, G.player, G.player.poisonAmount, G.green, true_)) {
        await killCreature(G.player, false_);
        await gameOver(S("Died from poison"), true_);
      }
      if (!G.player.status[STATUS_POISONED]) {
        G.player.poisonAmount = 0;
      }
    }
    if (G.player.ticksUntilTurn === 0) {
      G.player.ticksUntilTurn = G.player.ticksUntilTurn + G.player.movementSpeed << 16 >> 16;
    } else if (0 > G.player.ticksUntilTurn) {
      G.player.ticksUntilTurn = 0;
    }
    updateScent();
    G.rogue.updatedSafetyMapThisTurn = false_;
    G.rogue.updatedAllySafetyMapThisTurn = false_;
    G.rogue.updatedMapToSafeTerrainThisTurn = false_;
    for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
      let monst = nextCreature(it);
      if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0 || monst.creatureState >>> 0 === MONSTER_FLEEING && (pmapAt(monst.loc).flags & IN_FIELD_OF_VIEW) >>> 0) {
        updateSafetyMap();
        break;
      }
    }
    if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0 && !G.rogue.justRested) {
      G.player.ticksUntilTurn = 0;
    }
    await applyGradualTileEffectsToCreature(G.player, G.player.ticksUntilTurn);
    if (G.rogue.gameHasEnded) {
      return;
    }
    G.rogue.heardCombatThisTurn = false_;
    while (G.player.ticksUntilTurn > 0) {
      soonestTurn = 10000;
      for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
        let monst = nextCreature(it);
        soonestTurn = (monst.ticksUntilTurn > soonestTurn ? soonestTurn : monst.ticksUntilTurn) << 16 >> 16;
      }
      soonestTurn = (G.player.ticksUntilTurn > soonestTurn ? soonestTurn : G.player.ticksUntilTurn) << 16 >> 16;
      soonestTurn = (G.rogue.ticksTillUpdateEnvironment > soonestTurn ? soonestTurn : G.rogue.ticksTillUpdateEnvironment) << 16 >> 16;
      for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
        let monst = nextCreature(it);
        monst.ticksUntilTurn = monst.ticksUntilTurn - soonestTurn << 16 >> 16;
      }
      G.rogue.ticksTillUpdateEnvironment = G.rogue.ticksTillUpdateEnvironment - soonestTurn << 16 >> 16;
      if (0 >= G.rogue.ticksTillUpdateEnvironment) {
        G.rogue.ticksTillUpdateEnvironment = G.rogue.ticksTillUpdateEnvironment + 100 << 16 >> 16;
        await rechargeItemsIncrementally(1);
        await processIncrementalAutoID();
        G.rogue.monsterSpawnFuse = G.rogue.monsterSpawnFuse - 1 & 0xffff;
        for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
          let monst = nextCreature(it);
          await applyInstantTileEffectsToCreature(monst);
        }
        for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
          let monst = nextCreature(it);
          await decrementMonsterStatus(monst);
        }
        for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
          let monst = nextCreature(it);
          if (monst.info.DFChance && !((monst.info.flags & MONST_GETS_TURN_ON_ACTIVATION) >>> 0) && rand_percent(monst.info.DFChance)) {
            await spawnDungeonFeature(monst.loc.x, monst.loc.y, $sat(G.dungeonFeatureCatalog, monst.info.DFType), true_, false_);
          }
        }
        await updateEnvironment();
        await decrementPlayerStatus();
        await applyInstantTileEffectsToCreature(G.player);
        if (G.rogue.gameHasEnded) {
          return;
        }
        await monstersApproachStairs();
        if (G.player.ticksUntilTurn > 100 && !fastForward) {
          fastForward = (G.rogue.playbackFastForward || await pauseAnimation(25, struct_PauseBehavior.$of()) ? 1 : 0) << 24 >> 24;
        }
        G.rogue.wpRefreshTicker = G.rogue.wpRefreshTicker + 1 << 16 >> 16;
        if (G.rogue.wpRefreshTicker >= G.rogue.wpCount) {
          G.rogue.wpRefreshTicker = 0;
        }
        refreshWaypoint(G.rogue.wpRefreshTicker);
      }
      for (let it = iterateCreatures(G.monsters); hasNextCreature(it) && G.rogue.gameHasEnded === false_; ) {
        let monst = nextCreature(it);
        if (0 >= monst.ticksUntilTurn) {
          if (monst.currentHP > monst.info.maxHP) {
            monst.currentHP = monst.info.maxHP;
          }
          if ((monst.info.flags & MONST_GETS_TURN_ON_ACTIVATION) >>> 0 || monst.status[STATUS_PARALYZED] || monst.status[STATUS_ENTRANCED] || (monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
            monst.ticksUntilTurn = monst.movementSpeed;
          } else {
            await monstersTurn(monst);
          }
          for (let it2 = iterateCreatures(G.monsters); hasNextCreature(it2); ) {
            let monst2 = nextCreature(it2);
            if (monst2 === monst) {
              await applyGradualTileEffectsToCreature(monst, monst.ticksUntilTurn);
              break;
            }
          }
        }
      }
      G.player.ticksUntilTurn = G.player.ticksUntilTurn - soonestTurn << 16 >> 16;
      if (G.rogue.gameHasEnded) {
        return;
      }
    }
    await updateVision(true_);
    G.rogue.stealthRange = currentStealthRange();
    if (G.rogue.displayStealthRangeMode) {
      await displayLevel();
    }
    for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
      let monst = nextCreature(it);
      if (canSeeMonster(monst) && !((monst.bookkeepingFlags & (MB_WAS_VISIBLE | MB_ALREADY_SEEN)) >>> 0)) {
        if (monst.creatureState >>> 0 !== MONSTER_ALLY) {
          G.rogue.disturbed = true_;
          if (G.rogue.cautiousMode || G.rogue.automationActive) {
            oldRNG = G.rogue.RNG;
            G.rogue.RNG = RNG_COSMETIC;
            monsterName(P(buf2), monst, false_);
            sprintf(P(buf), S("you %s a%s %s"), ($at2(G.pmap, monst.loc.x, monst.loc.y).flags & VISIBLE) >>> 0 ? S("see") : S("sense"), isVowelish(P(buf2)) ? S("n") : S(""), P(buf2));
            if (G.rogue.cautiousMode) {
              strcat(P(buf), S("."));
              await message(P(buf), REQUIRE_ACKNOWLEDGMENT);
            } else {
              await combatMessage(P(buf), null);
            }
            G.rogue.RNG = oldRNG;
            ;
          }
        }
      }
      if (canSeeMonster(monst)) {
        monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_WAS_VISIBLE) >>> 0;
        if (cellHasTerrainFlag(monst.loc, T_OBSTRUCTS_PASSABILITY) && cellHasTMFlag(monst.loc, TM_IS_SECRET)) {
          await discover(monst.loc.x, monst.loc.y);
        }
        if (canDirectlySeeMonster(monst)) {
          if (G.rogue.weapon && (G.rogue.weapon.flags & ITEM_RUNIC) >>> 0 && G.rogue.weapon.enchant2 === W_SLAYING && !((G.rogue.weapon.flags & ITEM_RUNIC_HINTED) >>> 0) && monsterIsInClass(monst, G.rogue.weapon.vorpalEnemy << 16 >> 16)) {
            G.rogue.weapon.flags = (G.rogue.weapon.flags | ITEM_RUNIC_HINTED) >>> 0;
            itemName(G.rogue.weapon, P(buf2), false_, false_, null);
            sprintf(P(buf), S("the runes on your %s gleam balefully."), P(buf2));
            await messageWithColor(P(buf), G.itemMessageColor, REQUIRE_ACKNOWLEDGMENT);
          }
          if (G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0 && G.rogue.armor.enchant2 === A_IMMUNITY && !((G.rogue.armor.flags & ITEM_RUNIC_HINTED) >>> 0) && monsterIsInClass(monst, G.rogue.armor.vorpalEnemy << 16 >> 16)) {
            G.rogue.armor.flags = (G.rogue.armor.flags | ITEM_RUNIC_HINTED) >>> 0;
            itemName(G.rogue.armor, P(buf2), false_, false_, null);
            sprintf(P(buf), S("the runes on your %s glow protectively."), P(buf2));
            await messageWithColor(P(buf), G.itemMessageColor, REQUIRE_ACKNOWLEDGMENT);
          }
        }
      }
      if (!canSeeMonster(monst) && (monst.bookkeepingFlags & MB_WAS_VISIBLE) >>> 0 && !((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0)) {
        monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_WAS_VISIBLE >>> 0) >>> 0;
      }
    }
    await displayCombatText();
    if (G.player.status[STATUS_PARALYZED]) {
      if (!fastForward) {
        fastForward = (G.rogue.playbackFastForward || await pauseAnimation(25, struct_PauseBehavior.$of()) ? 1 : 0) << 24 >> 24;
      }
    }
    if (!G.rogue.playbackFastForward) {
      await shuffleTerrainColors(100, false_);
    }
    await displayAnnotation();
    await refreshSideBar(-1, -1, false_);
    await applyInstantTileEffectsToCreature(G.player);
    if (G.rogue.gameHasEnded) {
      return;
    }
    if (G.player.currentHP > G.player.info.maxHP) {
      G.player.currentHP = G.player.info.maxHP;
    }
    if ((G.player.bookkeepingFlags & MB_IS_FALLING) >>> 0) {
      await playerFalls();
      await handleHealthAlerts();
      return;
    }
  } while (G.player.status[STATUS_PARALYZED]);
  G.rogue.justRested = false_;
  G.rogue.justSearched = false_;
  await updateFlavorText();
  if (!G.rogue.updatedMapToShoreThisTurn) {
    updateMapToShore();
  }
  if (G.player.status[STATUS_LEVITATING] && cellHasTerrainFlag(G.player.loc, T_LAVA_INSTA_DEATH | T_IS_DEEP_WATER | T_AUTO_DESCENT) || G.player.status[STATUS_IMMUNE_TO_FIRE] && cellHasTerrainFlag(G.player.loc, T_LAVA_INSTA_DEATH)) {
    if (!G.rogue.receivedLevitationWarning) {
      turnsRequiredToShore = (Math.imul($rd(G.rogue.mapToShore.a[G.rogue.mapToShore.o + G.player.loc.x], G.player.loc.y), G.player.movementSpeed) / 100 | 0) << 16 >> 16;
      if (cellHasTerrainFlag(G.player.loc, T_LAVA_INSTA_DEATH)) {
        turnsToShore = ((G.player.status[STATUS_LEVITATING] > G.player.status[STATUS_IMMUNE_TO_FIRE] ? G.player.status[STATUS_LEVITATING] : G.player.status[STATUS_IMMUNE_TO_FIRE]) * 100 / G.player.movementSpeed | 0) << 16 >> 16;
      } else {
        turnsToShore = (G.player.status[STATUS_LEVITATING] * 100 / G.player.movementSpeed | 0) << 16 >> 16;
      }
      if (turnsRequiredToShore === turnsToShore || turnsRequiredToShore + 1 === turnsToShore) {
        await message(S("better head back to solid ground!"), REQUIRE_ACKNOWLEDGMENT);
        G.rogue.receivedLevitationWarning = true_;
      } else if (turnsRequiredToShore > turnsToShore && 10000 > turnsRequiredToShore) {
        await message(S("you're past the point of no return!"), REQUIRE_ACKNOWLEDGMENT);
        G.rogue.receivedLevitationWarning = true_;
      }
    }
  } else {
    G.rogue.receivedLevitationWarning = false_;
  }
  removeDeadMonsters();
  G.rogue.playbackBetweenTurns = true_;
  await RNGCheck();
  await handleHealthAlerts();
  if (G.rogue.flareCount > 0) {
    await animateFlares(G.rogue.flares, G.rogue.flareCount);
    G.rogue.flareCount = 0;
  }
}

export function resetScentTurnNumber(): void {
  let $t1: any, $t2: any;
  let i = 0;
  let j = 0;
  let d = 0;
  G.rogue.scentTurnNumber = G.rogue.scentTurnNumber - 15000 & 0xffff;
  for (d = 0; G.gameConst.deepestLevel > d; d = d + 1 << 16 >> 16) {
    if ($sadd(G.levels, d).visited) {
      for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
        for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
          if ($rd($rd($sadd(G.levels, d).scentMap, i), j) > 15000) {
            ($t1 = $rd($sadd(G.levels, d).scentMap, i), $t2 = j, $t1.a[$t1.o + $t2] = $t1.a[$t1.o + $t2] - 15000 << 16 >> 16);
          } else {
            $wr($rd($sadd(G.levels, d).scentMap, i), j, 0);
          }
        }
      }
    }
  }
}

export function $init(): void {
}
