// @ts-nocheck
// Brogue CE 1.15.1 Monsters.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { buildAMachine, cellHasTMFlag, cellHasTerrainFlag, cellHasTerrainType, passableArcCount, randomMatchingLocation, spawnDungeonFeature, zeroOutGrid } from './Architect.ts';
import { attack, buildHitList, combatMessage, flashMonster, hitProbability, inflictDamage, killCreature, monsterDamageAdjustmentAmount, netEnchant, strengthModifier } from './Combat.ts';
import { calculateDistances, dijkstraScan } from './Dijkstra.ts';
import { terrainFlags } from './Globals.ts';
import { allocGrid, copyGrid, fillGrid, findReplaceGrid, freeGrid, getQualifyingPathLocNear, getTMGrid, getTerrainGrid, randomLocationInGrid, validLocationCount } from './Grid.ts';
import { encodeMessageColor, getCellAppearance, message, messageColorFromVictim, messageWithColor, refreshDungeonCell, upperCase } from './IO.ts';
import { boltEffectForItem, boltForItem, getImpactLoc, getLineCoordinates, heal, itemName, pickUpItemAt, placeItemAt, tableForItemCategory, zap } from './Items.ts';
import { createFlare, updateMinersLightRadius } from './Light.ts';
import { fillSequentialList, randClump, rand_percent, rand_range, shuffleList } from './Math.ts';
import { becomeAllyWith, diagonalBlocked, discover, getFOVMask, getLocationFlags, handleSpearAttacks, handleWhipAttacks, layerWithFlag, nextStep, randValidDirectionFrom, vomit } from './Movement.ts';
import { damageFraction, staffBlinkDistance, staffDamageHigh, staffDamageLow, staffPoison, wandDominate } from './PowerTables.ts';
import { freeCreature, gameOver, unflag } from './RogueMain.ts';
import { applyInstantTileEffectsToCreature, extinguishFireOnCreature, scentDistance, updateAllySafetyMap, updateSafeTerrainMap, updateSafetyMap, updateVision } from './Time.ts';
import { endswith } from './Utilities.ts';
import { struct_bolt, struct_color, struct_creature, struct_creatureIterator, struct_creatureList, struct_creatureListNode, struct_creatureType, struct_item, struct_packSummary, struct_pcell, struct_pos, struct_tcell, struct_windowpos } from './structs.ts';
import { $arr, $at2, $cs, $mul64, $rd, $rows, $sadd, $sarr, $sat, $shl64, $ta, $u64, $wr, G, P, S, free, sprintf, strcat, strcpy, strlen } from '../rt/index.ts';
import { ANY_KIND_OF_VISIBLE, A_IMMUNITY, A_REFLECTION, A_RESPIRATION, BE_ATTACK, BE_BECKONING, BE_BLINKING, BE_DAMAGE, BE_DISCORD, BE_HASTE, BE_HEALING, BE_NEGATION, BE_NONE, BE_OBSTRUCTION, BE_POISON, BE_SHIELDING, BE_SLOW, BE_TUNNELING, BF_FIERY, BF_HALTS_BEFORE_OBSTRUCTION, BF_NEVER_REFLECTS, BF_NOT_NEGATABLE, BF_TARGET_ALLIES, BF_TARGET_ENEMIES, BOLT_BLINKING, BOLT_NONE, CHARM, CHARM_NEGATION, CHARM_SHATTERING, CLAIRVOYANT_VISIBLE, COLOR_ESCAPE, COLS, DCOLS, DIRECTION_COUNT, DISCOVERED, DOWN, DOWNLEFT, DOWNRIGHT, DROWS, DUNGEON, FEAT_JELLYMANCER, FLOOR, FP_FACTOR, GAME_MODE_EASY, GAME_MODE_WIZARD, GAS, GRANITE, G_DEMON, G_PLAYER, HAS_DORMANT_MONSTER, HAS_ITEM, HAS_MONSTER, HAS_PLAYER, HAS_STAIRS, HORDE_ALLIED_WITH_PLAYER, HORDE_DIES_ON_LEADER_DEATH, HORDE_IS_SUMMONED, HORDE_LEADER_CAPTIVE, HORDE_MACHINE_ONLY, HORDE_MACHINE_THIEF, HORDE_NEVER_OOD, HORDE_NO_PERIODIC_SPAWN, HORDE_SACRIFICE_TARGET, HORDE_SUMMONED_AT_DISTANCE, IN_FIELD_OF_VIEW, IS_IN_MACHINE, ITEM_IDENTIFIED, ITEM_MAX_CHARGES_KNOWN, ITEM_RUNIC, ITEM_RUNIC_IDENTIFIED, LEFT, LIQUID, MANACLE_B, MANACLE_BL, MANACLE_BR, MANACLE_L, MANACLE_R, MANACLE_T, MANACLE_TL, MANACLE_TR, MAX_WAYPOINT_COUNT, MA_ATTACKS_ALL_ADJACENT, MA_AVOID_CORRIDORS, MA_CAST_SUMMON, MA_CLONE_SELF_ON_DEFEND, MA_ENTER_SUMMONS, MA_HIT_STEAL_FLEE, MA_KAMIKAZE, MA_NEVER_MUTATED, MA_NON_NEGATABLE_ABILITIES, MA_POISONS, MA_REFLECT_100, MA_SEIZES, MB_ABSORBING, MB_ADMINISTRATIVE_DEATH, MB_BOUND_TO_LEADER, MB_CAPTIVE, MB_DOES_NOT_RESURRECT, MB_DOES_NOT_TRACK_LEADER, MB_FOLLOWER, MB_GIVEN_UP_ON_SCENT, MB_HAS_DIED, MB_IS_DORMANT, MB_IS_DYING, MB_IS_FALLING, MB_JUST_SUMMONED, MB_LEADER, MB_MARKED_FOR_SACRIFICE, MB_SEIZED, MB_SEIZING, MB_SUBMERGED, MB_TELEPATHICALLY_REVEALED, MB_WEAPON_AUTO_ID, MESSAGE_LINES, MODE_NORMAL, MODE_PERM_FLEEING, MONSTER_ALLY, MONSTER_FLEEING, MONSTER_SLEEPING, MONSTER_TRACKING_SCENT, MONSTER_WANDERING, MONST_ALWAYS_HUNTING, MONST_ALWAYS_USE_ABILITY, MONST_ATTACKABLE_THRU_WALLS, MONST_CARRY_ITEM_100, MONST_CARRY_ITEM_25, MONST_CAST_SPELLS_SLOWLY, MONST_DIES_IF_NEGATED, MONST_FEMALE, MONST_FIERY, MONST_FLEES_NEAR_DEATH, MONST_FLIES, MONST_FLITS, MONST_GETS_TURN_ON_ACTIVATION, MONST_IMMOBILE, MONST_IMMUNE_TO_FIRE, MONST_IMMUNE_TO_WATER, MONST_IMMUNE_TO_WEAPONS, MONST_IMMUNE_TO_WEBS, MONST_INANIMATE, MONST_INVISIBLE, MONST_INVULNERABLE, MONST_MAINTAINS_DISTANCE, MONST_MALE, MONST_NEVER_MUTATED, MONST_NEVER_SLEEPS, MONST_REFLECT_50, MONST_RESTRICTED_TO_LIQUID, MONST_SUBMERGES, MONST_WILL_NOT_USE_STAIRS, NEGATABLE_TRAITS, NOTHING, NO_DIRECTION, NUMBER_MONSTER_KINDS, NUMBER_MUTATORS, NUMBER_OF_STATUS_EFFECTS, NUMBER_TERRAIN_LAYERS, PDS_FORBIDDEN, PDS_OBSTRUCTION, PRESSURE_PLATE_DEPRESSED, REQUIRE_ACKNOWLEDGMENT, RIGHT, RNG_COSMETIC, ROWS, SACRIFICE_MARK_LIGHT, SCROLL, SCROLL_NEGATION, SCROLL_SHATTERING, STAFF, STAFF_TUNNELING, STATUS_BURNING, STATUS_CONFUSED, STATUS_DARKNESS, STATUS_DISCORDANT, STATUS_ENRAGED, STATUS_ENTRANCED, STATUS_HALLUCINATING, STATUS_HASTED, STATUS_IMMUNE_TO_FIRE, STATUS_INVISIBLE, STATUS_LEVITATING, STATUS_LIFESPAN_REMAINING, STATUS_MAGICAL_FEAR, STATUS_NAUSEOUS, STATUS_NUTRITION, STATUS_PARALYZED, STATUS_POISONED, STATUS_SHIELDED, STATUS_SLOWED, STATUS_STUCK, STATUS_TELEPATHIC, STATUS_WEAKENED, STAT_BAR_WIDTH, STOMACH_SIZE, SUBSEQ_BURN, SUBSEQ_DISCOVER, SUBSEQ_PROMOTE, SUMMONING_FLASH_LIGHT, SURFACE, TM_ALLOWS_SUBMERGING, TM_EXPLOSIVE_PROMOTE, TM_IS_SECRET, TM_STAND_IN_TILE, T_AUTO_DESCENT, T_CAUSES_CONFUSION, T_CAUSES_DAMAGE, T_CAUSES_EXPLOSIVE_DAMAGE, T_CAUSES_NAUSEA, T_CAUSES_PARALYSIS, T_CAUSES_POISON, T_DIVIDES_LEVEL, T_ENTANGLES, T_HARMFUL_TERRAIN, T_IS_DEEP_WATER, T_IS_DF_TRAP, T_IS_FIRE, T_IS_FLAMMABLE, T_LAVA_INSTA_DEATH, T_OBSTRUCTS_DIAGONAL_MOVEMENT, T_OBSTRUCTS_ITEMS, T_OBSTRUCTS_PASSABILITY, T_OBSTRUCTS_VISION, T_PATHING_BLOCKER, T_RESPIRATION_IMMUNITIES, T_SACRED, T_SPONTANEOUSLY_IGNITES, UP, UPLEFT, UPRIGHT, VISIBLE, WAND, WAND_DOMINATION, WAND_NEGATION, W_SLAYING, false_, true_ } from './consts.ts';


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

export function mutateMonster(monst: struct_creature | null, mutationIndex: number): void {
  monst.mutationIndex = mutationIndex;
  let theMut = $sat(G.mutationCatalog, mutationIndex);
  monst.info.flags = (monst.info.flags | theMut.monsterFlags) >>> 0;
  monst.info.abilityFlags = (monst.info.abilityFlags | theMut.monsterAbilityFlags) >>> 0;
  monst.info.maxHP = (Math.imul(monst.info.maxHP, theMut.healthFactor) / 100 | 0) << 16 >> 16;
  monst.info.movementSpeed = (Math.imul(monst.info.movementSpeed, theMut.moveSpeedFactor) / 100 | 0) << 16 >> 16;
  monst.info.attackSpeed = (Math.imul(monst.info.attackSpeed, theMut.attackSpeedFactor) / 100 | 0) << 16 >> 16;
  monst.info.defense = (Math.imul(monst.info.defense, theMut.defenseFactor) / 100 | 0) << 16 >> 16;
  if (monst.info.damage.lowerBound > 0) {
    monst.info.damage.lowerBound = (Math.imul(monst.info.damage.lowerBound, theMut.damageFactor) / 100 | 0) << 16 >> 16;
    monst.info.damage.lowerBound = (monst.info.damage.lowerBound > 1 ? monst.info.damage.lowerBound : 1) << 16 >> 16;
  }
  if (monst.info.damage.upperBound > 0) {
    monst.info.damage.upperBound = (Math.imul(monst.info.damage.upperBound, theMut.damageFactor) / 100 | 0) << 16 >> 16;
    monst.info.damage.upperBound = (monst.info.damage.upperBound > ((monst.info.abilityFlags & MA_POISONS) >>> 0 ? 2 : 1) ? monst.info.damage.upperBound : (monst.info.abilityFlags & MA_POISONS) >>> 0 ? 2 : 1) << 16 >> 16;
  }
  if (theMut.DFChance >= 0) {
    monst.info.DFChance = theMut.DFChance;
  }
  if (theMut.DFType >>> 0 > 0) {
    monst.info.DFType = theMut.DFType;
  }
}

export function generateMonster(monsterID: number, itemPossible: number, mutationPossible: number): struct_creature | null {
  let mutationChance = 0;
  let mutationAttempt = 0;
  let POW_DEEP_MUTATION = $ta(Int32Array, 13, [11, 13, 16, 18, 21, 25, 30, 35, 41, 48, 56, 65, 76]);
  let monst = new struct_creature();
  monst.info.$cp(G.monsterCatalog[monsterID]);
  initializeStatus(monst);
  monst.mutationIndex = -1;
  if (mutationPossible && !((monst.info.flags & MONST_NEVER_MUTATED) >>> 0) && !((monst.info.abilityFlags & MA_NEVER_MUTATED) >>> 0) && G.rogue.depthLevel > G.gameConst.mutationsOccurAboveLevel) {
    if (G.gameConst.amuletLevel >= G.rogue.depthLevel) {
      mutationChance = ((Math.imul(G.rogue.depthLevel - G.gameConst.mutationsOccurAboveLevel, G.gameConst.depthAccelerator) > 1 ? Math.imul(G.rogue.depthLevel - G.gameConst.mutationsOccurAboveLevel, G.gameConst.depthAccelerator) : 1) > 10 ? 10 : Math.imul(G.rogue.depthLevel - G.gameConst.mutationsOccurAboveLevel, G.gameConst.depthAccelerator) > 1 ? Math.imul(G.rogue.depthLevel - G.gameConst.mutationsOccurAboveLevel, G.gameConst.depthAccelerator) : 1) << 16 >> 16;
    } else {
      mutationChance = POW_DEEP_MUTATION[12 > Math.imul(G.rogue.depthLevel - G.gameConst.amuletLevel, G.gameConst.depthAccelerator) ? Math.imul(G.rogue.depthLevel - G.gameConst.amuletLevel, G.gameConst.depthAccelerator) : 12] << 16 >> 16;
      mutationChance = (75 > mutationChance ? mutationChance : 75) << 16 >> 16;
    }
    if (rand_percent(mutationChance)) {
      mutationAttempt = rand_range(0, NUMBER_MUTATORS - 1) << 16 >> 16;
      if (!((monst.info.flags & G.mutationCatalog[mutationAttempt].forbiddenFlags) >>> 0) && !((monst.info.abilityFlags & G.mutationCatalog[mutationAttempt].forbiddenAbilityFlags) >>> 0)) {
        mutateMonster(monst, mutationAttempt);
      }
    }
  }
  prependCreature(G.monsters, monst);
  initializeMonster(monst, itemPossible);
  return monst;
}

export function initializeMonster(monst: struct_creature | null, itemPossible: number): void {
  monst.loc.x = monst.loc.y = 0;
  monst.depth = G.rogue.depthLevel;
  monst.bookkeepingFlags = 0;
  monst.mapToMe = null;
  monst.safetyMap = null;
  monst.leader = null;
  monst.carriedMonster = null;
  monst.creatureState = (monst.info.flags & MONST_NEVER_SLEEPS) >>> 0 || rand_percent(25) ? MONSTER_TRACKING_SCENT : MONSTER_SLEEPING;
  monst.creatureMode = MODE_NORMAL;
  monst.currentHP = monst.info.maxHP;
  monst.spawnDepth = G.rogue.depthLevel;
  monst.ticksUntilTurn = monst.info.movementSpeed;
  monst.turnsUntilRegen = $mul64(monst.info.turnsBetweenRegen, 1000);
  monst.regenPerTurn = 0;
  monst.movementSpeed = monst.info.movementSpeed;
  monst.attackSpeed = monst.info.attackSpeed;
  monst.turnsSpentStationary = 0;
  monst.xpxp = 0;
  monst.machineHome = 0;
  monst.newPowerCount = monst.totalPowerCount = 0;
  monst.targetCorpseLoc.$cp(struct_pos.$of(-1, -1));
  monst.lastSeenPlayerAt.$cp(struct_pos.$of(-1, -1));
  monst.targetWaypointIndex = -1;
  for (let i = 0; MAX_WAYPOINT_COUNT > i; ++i) {
    monst.waypointAlreadyVisited[i] = rand_range(0, 1) << 24 >> 24;
  }
  let itemChance = 0;
  if ((monst.info.flags & MONST_CARRY_ITEM_100) >>> 0) {
    itemChance = 100;
  } else if ((monst.info.flags & MONST_CARRY_ITEM_25) >>> 0) {
    itemChance = 25;
  } else {
    itemChance = 0;
  }
  if ((!(G.rogue.mode >>> 0 === GAME_MODE_WIZARD) || 1) && itemPossible && G.gameConst.amuletLevel >= G.rogue.depthLevel && G.monsterItemsHopper.nextItem && rand_percent(itemChance << 16 >> 16)) {
    monst.carriedItem = G.monsterItemsHopper.nextItem;
    G.monsterItemsHopper.nextItem = G.monsterItemsHopper.nextItem.nextItem;
    monst.carriedItem.nextItem = null;
    monst.carriedItem.originDepth = G.rogue.depthLevel;
  } else {
    monst.carriedItem = null;
  }
  initializeGender(monst);
  if (!((monst.info.flags & MONST_INANIMATE) >>> 0) || (monst.info.abilityFlags & MA_ENTER_SUMMONS) >>> 0) {
    monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_WEAPON_AUTO_ID) >>> 0;
  }
}

export function monsterRevealed(monst: struct_creature | null): number {
  if (monst === G.player) {
    return false_;
  } else if ((monst.bookkeepingFlags & MB_TELEPATHICALLY_REVEALED) >>> 0) {
    return true_;
  } else if (monst.status[STATUS_ENTRANCED]) {
    return true_;
  } else if (G.player.status[STATUS_TELEPATHIC] && !((monst.info.flags & MONST_INANIMATE) >>> 0)) {
    return true_;
  }
  return false_;
}

export function monsterHiddenBySubmersion(monst: struct_creature | null, observer: struct_creature | null): number {
  if ((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0) {
    if (observer && (terrainFlags(observer.loc) & T_IS_DEEP_WATER) >>> 0 && !observer.status[STATUS_LEVITATING]) {
      return false_;
    } else {
      return true_;
    }
  }
  return false_;
}

export function monsterIsHidden(monst: struct_creature | null, observer: struct_creature | null): number {
  if ((monst.bookkeepingFlags & MB_IS_DORMANT) >>> 0) {
    return true_;
  }
  if (observer && monstersAreTeammates(monst, observer)) {
    return false_;
  }
  if (monst.status[STATUS_INVISIBLE] && !pmapAt(monst.loc).layers[GAS]) {
    return true_;
  }
  if (monsterHiddenBySubmersion(monst, observer)) {
    return true_;
  }
  return false_;
}

export function canSeeMonster(monst: struct_creature | null): number {
  if (monst === G.player) {
    return true_;
  }
  if (!monsterIsHidden(monst, G.player) && (($at2(G.pmap, monst.loc.x, monst.loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || monsterRevealed(monst))) {
    return true_;
  }
  return false_;
}

export function canDirectlySeeMonster(monst: struct_creature | null): number {
  if (monst === G.player) {
    return true_;
  }
  if (($at2(G.pmap, monst.loc.x, monst.loc.y).flags & VISIBLE) >>> 0 && !monsterIsHidden(monst, G.player)) {
    return true_;
  }
  return false_;
}

export function monsterName(buf: Ptr | null, monst: struct_creature | null, includeArticle: number): void {
  let oldRNG = 0;
  if (monst === G.player) {
    strcpy(buf, S("you"));
    return;
  }
  if (canSeeMonster(monst) || G.rogue.playbackOmniscience) {
    if (G.player.status[STATUS_HALLUCINATING] && !G.rogue.playbackOmniscience && !G.player.status[STATUS_TELEPATHIC]) {
      oldRNG = G.rogue.RNG;
      G.rogue.RNG = RNG_COSMETIC;
      sprintf(buf, S("%s%s"), includeArticle ? S("the ") : S(""), P(G.monsterCatalog[rand_range(1, NUMBER_MONSTER_KINDS - 1)].monsterName));
      G.rogue.RNG = oldRNG;
      ;
      return;
    }
    sprintf(buf, S("%s%s"), includeArticle ? monst.creatureState >>> 0 === MONSTER_ALLY ? S("your ") : S("the ") : S(""), P(monst.info.monsterName));
    return;
  } else {
    strcpy(buf, S("something"));
    return;
  }
}

export function monsterIsInClass(monst: struct_creature | null, monsterClass: number): number {
  let i = 0;
  for (i = 0; G.monsterClassCatalog[monsterClass].memberList[i] >>> 0 !== 0; i = i + 1 << 16 >> 16) {
    if (G.monsterClassCatalog[monsterClass].memberList[i] >>> 0 === monst.info.monsterID >>> 0) {
      return true_;
    }
  }
  return false_;
}

function attackWouldBeFutile(attacker: struct_creature | null, defender: struct_creature | null): number {
  if (cellHasTerrainFlag(defender.loc, T_OBSTRUCTS_PASSABILITY) && !((defender.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0)) {
    return true_;
  }
  if (attacker === G.player) {
    return false_;
  }
  if ((attacker.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0 && !attacker.status[STATUS_LEVITATING] && defender.status[STATUS_LEVITATING]) {
    return true_;
  }
  if ((defender.info.flags & MONST_INVULNERABLE) >>> 0) {
    return true_;
  }
  if ((defender.info.flags & MONST_IMMUNE_TO_WEAPONS) >>> 0 && !((attacker.info.abilityFlags & MA_POISONS) >>> 0)) {
    return true_;
  }
  return false_;
}

export function monsterWillAttackTarget(attacker: struct_creature | null, defender: struct_creature | null): number {
  if (attacker === defender || (defender.bookkeepingFlags & MB_IS_DYING) >>> 0) {
    return false_;
  }
  if (attacker === G.player && defender.creatureState >>> 0 === MONSTER_ALLY) {
    return defender.status[STATUS_DISCORDANT] << 24 >> 24;
  }
  if (attacker.status[STATUS_ENTRANCED] && defender.creatureState >>> 0 !== MONSTER_ALLY) {
    return true_;
  }
  if (attacker.creatureState >>> 0 === MONSTER_ALLY && attacker !== G.player && defender.status[STATUS_ENTRANCED]) {
    return false_;
  }
  if ((defender.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
    return false_;
  }
  if (attacker.status[STATUS_DISCORDANT] || defender.status[STATUS_DISCORDANT] || attacker.status[STATUS_CONFUSED]) {
    return true_;
  }
  if (monstersAreEnemies(attacker, defender) && !monstersAreTeammates(attacker, defender)) {
    return true_;
  }
  return false_;
}

export function monstersAreTeammates(monst1: struct_creature | null, monst2: struct_creature | null): number {
  return ((monst1.bookkeepingFlags & MB_FOLLOWER) >>> 0 && monst1.leader === monst2 || (monst2.bookkeepingFlags & MB_FOLLOWER) >>> 0 && monst2.leader === monst1 || monst1.creatureState >>> 0 === MONSTER_ALLY && monst2 === G.player || monst1 === G.player && monst2.creatureState >>> 0 === MONSTER_ALLY || monst1.creatureState >>> 0 === MONSTER_ALLY && monst2.creatureState >>> 0 === MONSTER_ALLY || (monst1.bookkeepingFlags & MB_FOLLOWER) >>> 0 && (monst2.bookkeepingFlags & MB_FOLLOWER) >>> 0 && monst1.leader === monst2.leader ? true_ : false_) << 24 >> 24;
}

export function monstersAreEnemies(monst1: struct_creature | null, monst2: struct_creature | null): number {
  if (((monst1.bookkeepingFlags | monst2.bookkeepingFlags) >>> 0 & MB_CAPTIVE) >>> 0) {
    return false_;
  }
  if (monst1 === monst2) {
    return false_;
  }
  if (monst1.status[STATUS_DISCORDANT] || monst2.status[STATUS_DISCORDANT]) {
    return true_;
  }
  if ((monst1.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0 && !((monst2.info.flags & MONST_IMMUNE_TO_WATER) >>> 0) && !monst2.status[STATUS_LEVITATING] && cellHasTerrainFlag(monst2.loc, T_IS_DEEP_WATER) || (monst2.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0 && !((monst1.info.flags & MONST_IMMUNE_TO_WATER) >>> 0) && !monst1.status[STATUS_LEVITATING] && cellHasTerrainFlag(monst1.loc, T_IS_DEEP_WATER)) {
    return true_;
  }
  return ((monst1.creatureState >>> 0 === MONSTER_ALLY || monst1 === G.player ? 1 : 0) !== (monst2.creatureState >>> 0 === MONSTER_ALLY || monst2 === G.player ? 1 : 0) ? 1 : 0) << 24 >> 24;
}

export function initializeGender(monst: struct_creature | null): void {
  if ((monst.info.flags & MONST_MALE) >>> 0 && (monst.info.flags & MONST_FEMALE) >>> 0) {
    monst.info.flags = (monst.info.flags & $u64(~(rand_percent(50) ? MONST_MALE : MONST_FEMALE))) >>> 0;
  }
}

export function setPlayerDisplayChar(): void {
  if (G.rogue.mode >>> 0 === GAME_MODE_EASY) {
    G.player.info.displayChar = G_DEMON;
  } else {
    G.player.info.displayChar = G_PLAYER;
  }
}

export function stringsMatch(str1: Ptr | null, str2: Ptr | null): number {
  let i = 0;
  for (i = 0; str1.a[str1.o + i] && str2.a[str2.o + i]; i = i + 1 << 16 >> 16) {
    if (str1.a[str1.o + i] !== str2.a[str2.o + i]) {
      return false_;
    }
  }
  return true_;
}

export function resolvePronounEscapes(text: Ptr | null, monst: struct_creature | null): void {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any;
  let pronounType = 0;
  let gender = 0;
  let i = 0;
  let insert = null;
  let scan = null;
  let capitalize = 0;
  let pronouns = [$rows([$cs("$HESHE", 20),
$cs("you", 20),
$cs("he", 20),
$cs("she", 20),
$cs("it", 20)]),
$rows([$cs("$HIMHER", 20),
$cs("you", 20),
$cs("him", 20),
$cs("her", 20),
$cs("it", 20)]),
$rows([$cs("$HISHER", 20),
$cs("your", 20),
$cs("his", 20),
$cs("her", 20),
$cs("its", 20)]),
$rows([$cs("$HIMSELFHERSELF", 20),
$cs("yourself", 20),
$cs("himself", 20),
$cs("herself", 20),
$cs("itself", 20)])];
  if (monst === G.player) {
    gender = 1;
  } else if (!canSeeMonster(monst) && !G.rogue.playbackOmniscience) {
    gender = 4;
  } else if ((monst.info.flags & MONST_MALE) >>> 0) {
    gender = 2;
  } else if ((monst.info.flags & MONST_FEMALE) >>> 0) {
    gender = 3;
  } else {
    gender = 4;
  }
  capitalize = false_;
  for (insert = scan = text; scan.a[scan.o]; ) {
    if (scan.a[scan.o] === 36) {
      for (pronounType = 0; 4 > pronounType; pronounType = pronounType + 1 << 16 >> 16) {
        if (stringsMatch(P(pronouns[pronounType][0]), scan)) {
          strcpy(insert, P(pronouns[pronounType][gender]));
          if (capitalize) {
            upperCase(insert);
            capitalize = false_;
          }
          scan = scan.add(strlen(P(pronouns[pronounType][0])));
          insert = insert.add(strlen(P(pronouns[pronounType][gender])));
          break;
        }
      }
      if (pronounType === 4) {
        $wr(($t1 = insert, insert = $t1.add(1), $t1), 0, $rd(($t2 = scan, scan = $t2.add(1), $t2)));
      }
    } else if (scan.a[scan.o] === COLOR_ESCAPE) {
      for (i = 0; 4 > i; i = i + 1 << 16 >> 16) {
        $wr(($t3 = insert, insert = $t3.add(1), $t3), 0, $rd(($t4 = scan, scan = $t4.add(1), $t4)));
      }
    } else {
      if (scan.a[scan.o] === 46) {
        capitalize = true_;
      } else if (scan.a[scan.o] !== 32) {
        capitalize = false_;
      }
      $wr(($t5 = insert, insert = $t5.add(1), $t5), 0, $rd(($t6 = scan, scan = $t6.add(1), $t6)));
    }
  }
  insert.a[insert.o] = 0;
}

export function pickHordeType(depth: number, summonerType: number, forbiddenFlags: number, requiredFlags: number): number {
  let i = 0;
  let index = 0;
  let possCount = 0;
  if (0 >= depth) {
    depth = G.rogue.depthLevel;
  }
  for (i = 0; G.gameConst.numberHordes > i; i = i + 1 << 16 >> 16) {
    if (!(($u64($sadd(G.hordeCatalog, i).flags) & forbiddenFlags) >>> 0) && !((~($sadd(G.hordeCatalog, i).flags >>> 0) >>> 0 & requiredFlags) >>> 0) && (!summonerType && depth >= $sadd(G.hordeCatalog, i).minLevel && $sadd(G.hordeCatalog, i).maxLevel >= depth || summonerType >>> 0 && ($sadd(G.hordeCatalog, i).flags >>> 0 & HORDE_IS_SUMMONED) >>> 0 && $sadd(G.hordeCatalog, i).leaderType >>> 0 === summonerType >>> 0)) {
      possCount = possCount + $sadd(G.hordeCatalog, i).frequency << 16 >> 16;
    }
  }
  if (possCount === 0) {
    return -1;
  }
  index = rand_range(1, possCount) << 16 >> 16;
  for (i = 0; G.gameConst.numberHordes > i; i = i + 1 << 16 >> 16) {
    if (!(($u64($sadd(G.hordeCatalog, i).flags) & forbiddenFlags) >>> 0) && !((~($sadd(G.hordeCatalog, i).flags >>> 0) >>> 0 & requiredFlags) >>> 0) && (!summonerType && depth >= $sadd(G.hordeCatalog, i).minLevel && $sadd(G.hordeCatalog, i).maxLevel >= depth || summonerType >>> 0 && ($sadd(G.hordeCatalog, i).flags >>> 0 & HORDE_IS_SUMMONED) >>> 0 && $sadd(G.hordeCatalog, i).leaderType >>> 0 === summonerType >>> 0)) {
      if ($sadd(G.hordeCatalog, i).frequency >= index) {
        return i;
      }
      index = index - $sadd(G.hordeCatalog, i).frequency << 16 >> 16;
    }
  }
  return 0;
}

export async function empowerMonster(monst: struct_creature | null): Promise<void> {
  let theMonsterName = new Int8Array(100);
  let buf = new Int8Array(200);
  monst.info.maxHP = monst.info.maxHP + 12 << 16 >> 16;
  monst.info.defense = monst.info.defense + 10 << 16 >> 16;
  monst.info.accuracy = monst.info.accuracy + 10 << 16 >> 16;
  monst.info.damage.lowerBound = monst.info.damage.lowerBound + (1 > (monst.info.damage.lowerBound / 10 | 0) ? 1 : monst.info.damage.lowerBound / 10 | 0) << 16 >> 16;
  monst.info.damage.upperBound = monst.info.damage.upperBound + (1 > (monst.info.damage.upperBound / 10 | 0) ? 1 : monst.info.damage.upperBound / 10 | 0) << 16 >> 16;
  monst.newPowerCount = monst.newPowerCount + 1 << 16 >> 16;
  monst.totalPowerCount = monst.totalPowerCount + 1 << 16 >> 16;
  await heal(monst, 100, true_);
  if (canSeeMonster(monst)) {
    monsterName(P(theMonsterName), monst, true_);
    sprintf(P(buf), S("%s looks stronger"), P(theMonsterName));
    await combatMessage(P(buf), G.advancementMessageColor);
  }
}

export async function cloneMonster(monst: struct_creature | null, announce: number, placeClone: number): Promise<struct_creature | null> {
  let $t1: any;
  let buf = new Int8Array(79);
  let monstName = new Int8Array(79);
  let jellyCount = 0;
  let newMonst = generateMonster(monst.info.monsterID << 16 >> 16, false_, false_);
  newMonst.$cp(monst);
  newMonst.carriedMonster = null;
  initializeGender(newMonst);
  newMonst.bookkeepingFlags = (newMonst.bookkeepingFlags & ~(MB_LEADER | MB_CAPTIVE | MB_WEAPON_AUTO_ID) >>> 0) >>> 0;
  newMonst.bookkeepingFlags = (newMonst.bookkeepingFlags | MB_FOLLOWER) >>> 0;
  newMonst.mapToMe = null;
  newMonst.safetyMap = null;
  newMonst.carriedItem = null;
  if (monst.carriedMonster) {
    let parentMonst = await cloneMonster(monst.carriedMonster, false_, false_);
    removeCreature(G.monsters, parentMonst);
    removeCreature(G.dormantMonsters, parentMonst);
  }
  newMonst.ticksUntilTurn = 101;
  if (!(monst.creatureState >>> 0 === MONSTER_ALLY)) {
    newMonst.bookkeepingFlags = (newMonst.bookkeepingFlags & ~MB_TELEPATHICALLY_REVEALED >>> 0) >>> 0;
  }
  if (monst.leader) {
    newMonst.leader = monst.leader;
  } else {
    newMonst.leader = monst;
    monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_LEADER) >>> 0;
  }
  if ((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
    await becomeAllyWith(newMonst);
  }
  if (placeClone) {
    newMonst.loc.$cp(getQualifyingPathLocNear(monst.loc.$clone(), true_, (T_DIVIDES_LEVEL & avoidedFlagsForMonster(newMonst.info)) >>> 0, HAS_PLAYER, avoidedFlagsForMonster(newMonst.info), HAS_PLAYER | HAS_MONSTER | HAS_STAIRS, false_));
    ($t1 = pmapAt(newMonst.loc), $t1.flags = ($t1.flags | HAS_MONSTER) >>> 0);
    await refreshDungeonCell(newMonst.loc.$clone());
    if (announce && canSeeMonster(newMonst)) {
      monsterName(P(monstName), newMonst, false_);
      sprintf(P(buf), S("another %s appears!"), P(monstName));
      await message(P(buf), 0);
    }
  }
  if (monst === G.player) {
    newMonst.info.foreColor = G.gray;
    newMonst.info.damage.lowerBound = 1;
    newMonst.info.damage.upperBound = 2;
    newMonst.info.damage.clumpFactor = 1;
    newMonst.info.defense = 0;
    strcpy(P(newMonst.info.monsterName), S("clone"));
    newMonst.creatureState = MONSTER_ALLY;
  }
  if (monst.creatureState >>> 0 === MONSTER_ALLY && (monst.info.abilityFlags & MA_CLONE_SELF_ON_DEFEND) >>> 0 && !G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_JELLYMANCER]) {
    jellyCount = 0;
    for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
      let nextMonst = nextCreature(it);
      if (nextMonst.creatureState >>> 0 === MONSTER_ALLY && (nextMonst.info.abilityFlags & MA_CLONE_SELF_ON_DEFEND) >>> 0) {
        jellyCount = jellyCount + 1 << 16 >> 16;
      }
    }
    if (jellyCount >= 90) {
      G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_JELLYMANCER] = true_;
    }
  }
  return newMonst;
}

export function forbiddenFlagsForMonster(monsterType: struct_creatureType | null): number {
  let flags = 0;
  flags = T_PATHING_BLOCKER;
  if ((monsterType.flags & MONST_INVULNERABLE) >>> 0) {
    flags = (flags & ~(T_LAVA_INSTA_DEATH | T_SPONTANEOUSLY_IGNITES | T_IS_FIRE) >>> 0) >>> 0;
  }
  if ((monsterType.flags & (MONST_IMMUNE_TO_FIRE | MONST_FLIES)) >>> 0) {
    flags = (flags & ~T_LAVA_INSTA_DEATH >>> 0) >>> 0;
  }
  if ((monsterType.flags & MONST_IMMUNE_TO_FIRE) >>> 0) {
    flags = (flags & ~(T_SPONTANEOUSLY_IGNITES | T_IS_FIRE) >>> 0) >>> 0;
  }
  if ((monsterType.flags & (MONST_IMMUNE_TO_WATER | MONST_FLIES)) >>> 0) {
    flags = (flags & ~T_IS_DEEP_WATER >>> 0) >>> 0;
  }
  if ((monsterType.flags & MONST_FLIES) >>> 0) {
    flags = (flags & ~(T_AUTO_DESCENT | T_IS_DF_TRAP) >>> 0) >>> 0;
  }
  return flags;
}

export function avoidedFlagsForMonster(monsterType: struct_creatureType | null): number {
  let flags = 0;
  flags = ((forbiddenFlagsForMonster(monsterType) | T_HARMFUL_TERRAIN) >>> 0 | T_SACRED) >>> 0;
  if ((monsterType.flags & MONST_INVULNERABLE) >>> 0) {
    flags = (flags & ~(T_HARMFUL_TERRAIN | T_IS_DF_TRAP) >>> 0) >>> 0;
  }
  if ((monsterType.flags & MONST_INANIMATE) >>> 0) {
    flags = (flags & ~(T_CAUSES_POISON | T_CAUSES_DAMAGE | T_CAUSES_PARALYSIS | T_CAUSES_CONFUSION) >>> 0) >>> 0;
  }
  if ((monsterType.flags & MONST_IMMUNE_TO_FIRE) >>> 0) {
    flags = (flags & ~T_IS_FIRE >>> 0) >>> 0;
  }
  if ((monsterType.flags & MONST_FLIES) >>> 0) {
    flags = (flags & ~T_CAUSES_POISON >>> 0) >>> 0;
  }
  return flags;
}

export function monsterCanSubmergeNow(monst: struct_creature | null): number {
  return ((monst.info.flags & MONST_SUBMERGES) >>> 0 && cellHasTMFlag(monst.loc, TM_ALLOWS_SUBMERGING) && !cellHasTerrainFlag(monst.loc, T_OBSTRUCTS_PASSABILITY) && !((monst.bookkeepingFlags & (MB_SEIZING | MB_SEIZED | MB_CAPTIVE)) >>> 0) && ((monst.info.flags & (MONST_IMMUNE_TO_FIRE | MONST_INVULNERABLE)) >>> 0 || monst.status[STATUS_IMMUNE_TO_FIRE] || !cellHasTerrainFlag(monst.loc, T_LAVA_INSTA_DEATH)) ? 1 : 0) << 24 >> 24;
}

async function spawnMinions(hordeID: number, leader: struct_creature | null, summoned: number, itemPossible: number): Promise<number> {
  let $t1: any, $t2: any, $t3: any;
  let iSpecies = 0;
  let iMember = 0;
  let count = 0;
  let forbiddenTerrainFlags = 0;
  let theHorde = null;
  let monst = null;
  let x = 0;
  let y = 0;
  let failsafe = 0;
  let atLeastOneMinion = false_;
  x = leader.loc.x;
  y = leader.loc.y;
  theHorde = $sadd(G.hordeCatalog, hordeID);
  for (iSpecies = 0; theHorde.numberOfMemberTypes > iSpecies; iSpecies = iSpecies + 1 << 16 >> 16) {
    count = randClump(theHorde.memberCount[iSpecies]);
    forbiddenTerrainFlags = forbiddenFlagsForMonster($sat(G.monsterCatalog, theHorde.memberType[iSpecies]));
    if ($sadd(G.hordeCatalog, hordeID).spawnsIn) {
      forbiddenTerrainFlags = (forbiddenTerrainFlags & ~G.tileCatalog[$sadd(G.hordeCatalog, hordeID).spawnsIn].flags >>> 0) >>> 0;
    }
    for (iMember = 0; count > iMember; iMember = iMember + 1 << 16 >> 16) {
      monst = generateMonster(theHorde.memberType[iSpecies] << 16 >> 16, itemPossible, (!summoned ? 1 : 0) << 24 >> 24);
      failsafe = 0;
      do {
        monst.loc.$cp(getQualifyingPathLocNear(struct_pos.$of(x, y), summoned, (T_DIVIDES_LEVEL & forbiddenTerrainFlags) >>> 0, HAS_PLAYER | HAS_STAIRS, forbiddenTerrainFlags, HAS_MONSTER, false_));
      } while (theHorde.spawnsIn >>> 0 && !cellHasTerrainType(monst.loc, theHorde.spawnsIn) && ($t2 = failsafe, failsafe = $t2 + 1 << 16 >> 16, $t2) < 20);
      if (failsafe >= 20) {
        await killCreature(monst, true_);
        break;
      }
      if (monsterCanSubmergeNow(monst)) {
        monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_SUBMERGED) >>> 0;
      }
      ;
      ($t3 = pmapAt(monst.loc), $t3.flags = ($t3.flags | HAS_MONSTER) >>> 0);
      monst.bookkeepingFlags = (monst.bookkeepingFlags | (MB_FOLLOWER | MB_JUST_SUMMONED)) >>> 0;
      monst.leader = leader;
      monst.creatureState = leader.creatureState;
      if (monst.creatureState >>> 0 === MONSTER_ALLY) {
        monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_DOES_NOT_RESURRECT) >>> 0;
      }
      monst.mapToMe = null;
      if ((theHorde.flags >>> 0 & HORDE_DIES_ON_LEADER_DEATH) >>> 0) {
        monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_BOUND_TO_LEADER) >>> 0;
      }
      if (($sadd(G.hordeCatalog, hordeID).flags >>> 0 & HORDE_ALLIED_WITH_PLAYER) >>> 0) {
        await becomeAllyWith(monst);
      }
      atLeastOneMinion = true_;
    }
  }
  if (atLeastOneMinion && !((theHorde.flags >>> 0 & HORDE_DIES_ON_LEADER_DEATH) >>> 0)) {
    leader.bookkeepingFlags = (leader.bookkeepingFlags | MB_LEADER) >>> 0;
  }
  return atLeastOneMinion;
}

function drawManacle(loc: struct_pos, dir: number): number {
  let manacles = $ta(Int32Array, 8, [MANACLE_T, MANACLE_B, MANACLE_L, MANACLE_R, MANACLE_TL, MANACLE_BL, MANACLE_TR, MANACLE_BR]);
  let newLoc = posNeighborInDirection(loc, dir).$clone();
  if (isPosInMap(newLoc) && pmapAt(newLoc).layers[DUNGEON] >>> 0 === FLOOR && pmapAt(newLoc).layers[LIQUID] >>> 0 === NOTHING) {
    pmapAt(newLoc).layers[SURFACE] = manacles[dir];
    return true_;
  }
  return false_;
}

function drawManacles(loc: struct_pos): void {
  let fallback = $rows([$ta(Int32Array, 3, [UPLEFT, UP, LEFT]),
$ta(Int32Array, 3, [DOWNLEFT, DOWN, LEFT]),
$ta(Int32Array, 3, [UPRIGHT, UP, RIGHT]),
$ta(Int32Array, 3, [DOWNRIGHT, DOWN, RIGHT])]);
  let i = 0;
  let j = 0;
  for (i = 0; 4 > i; i = i + 1 << 16 >> 16) {
    for (j = 0; 3 > j && !drawManacle(loc, fallback[i][j]); j = j + 1 << 16 >> 16) {
      ;
    }
  }
}

export async function spawnHorde(hordeID: number, loc: struct_pos, forbiddenFlags: number, requiredFlags: number): Promise<struct_creature | null> {
  let $t1: any;
  let i = 0;
  let failsafe = 0;
  let depth = 0;
  let theHorde = null;
  let leader = null;
  let preexistingMonst = null;
  let tryAgain = 0;
  if (G.rogue.depthLevel > 1 && rand_percent(G.gameConst.monsterOutOfDepthChance << 16 >> 16)) {
    depth = G.rogue.depthLevel + rand_range(1, (G.rogue.depthLevel / 2 | 0) > 5 ? 5 : G.rogue.depthLevel / 2 | 0) << 16 >> 16;
    if (depth > G.gameConst.amuletLevel) {
      depth = (G.rogue.depthLevel > G.gameConst.amuletLevel ? G.rogue.depthLevel : G.gameConst.amuletLevel) << 16 >> 16;
    }
    forbiddenFlags = (forbiddenFlags | HORDE_NEVER_OOD) >>> 0;
  } else {
    depth = G.rogue.depthLevel;
  }
  if (0 >= hordeID) {
    failsafe = 50;
    do {
      tryAgain = false_;
      hordeID = pickHordeType(depth, 0, forbiddenFlags, requiredFlags);
      if (0 > hordeID) {
        return null;
      }
      if (isPosInMap(loc)) {
        if (cellHasTerrainFlag(loc, T_PATHING_BLOCKER) && (!$sadd(G.hordeCatalog, hordeID).spawnsIn || !cellHasTerrainType(loc, $sadd(G.hordeCatalog, hordeID).spawnsIn))) {
          tryAgain = true_;
        }
        if ($sadd(G.hordeCatalog, hordeID).spawnsIn >>> 0 && !cellHasTerrainType(loc, $sadd(G.hordeCatalog, hordeID).spawnsIn)) {
          tryAgain = true_;
        }
      }
    } while ((failsafe = failsafe - 1 << 16 >> 16) && tryAgain);
  }
  failsafe = 50;
  if (!isPosInMap(loc)) {
    i = 0;
    do {
      while (!randomMatchingLocation(loc, FLOOR, NOTHING, ($sadd(G.hordeCatalog, hordeID).spawnsIn >>> 0 ? $sadd(G.hordeCatalog, hordeID).spawnsIn >>> 0 : 4294967295) << 16 >> 16) || passableArcCount(loc.x, loc.y) > 1) {
        if (!(failsafe = failsafe - 1 << 16 >> 16)) {
          return null;
        }
        hordeID = pickHordeType(depth, 0, forbiddenFlags, 0);
        if (0 > hordeID) {
          return null;
        }
      }
      i = i + 1 << 16 >> 16;
    } while (25 > i && (pmapAt(loc).flags & (ANY_KIND_OF_VISIBLE | IN_FIELD_OF_VIEW)) >>> 0);
  }
  theHorde = $sadd(G.hordeCatalog, hordeID);
  if (theHorde.machine > 0) {
    await buildAMachine(theHorde.machine, loc.x, loc.y, 0, null, null, null);
  }
  leader = generateMonster(theHorde.leaderType << 16 >> 16, true_, true_);
  leader.loc.$cp(loc);
  if (($sadd(G.hordeCatalog, hordeID).flags >>> 0 & HORDE_LEADER_CAPTIVE) >>> 0) {
    leader.bookkeepingFlags = (leader.bookkeepingFlags | MB_CAPTIVE) >>> 0;
    leader.creatureState = MONSTER_WANDERING;
    if (leader.info.turnsBetweenRegen > 0) {
      leader.currentHP = (leader.info.maxHP / 4 | 0) + 1 << 16 >> 16;
    }
    if (!$sadd(G.hordeCatalog, hordeID).spawnsIn) {
      drawManacles(loc);
    }
  } else if (($sadd(G.hordeCatalog, hordeID).flags >>> 0 & HORDE_ALLIED_WITH_PLAYER) >>> 0) {
    await becomeAllyWith(leader);
  }
  if (($sadd(G.hordeCatalog, hordeID).flags >>> 0 & HORDE_SACRIFICE_TARGET) >>> 0) {
    leader.bookkeepingFlags = (leader.bookkeepingFlags | MB_MARKED_FOR_SACRIFICE) >>> 0;
    leader.info.intrinsicLightType = SACRIFICE_MARK_LIGHT;
  }
  if ((theHorde.flags >>> 0 & HORDE_MACHINE_THIEF) >>> 0) {
    leader.safetyMap = allocGrid();
    fillGrid(leader.safetyMap, 0);
  }
  preexistingMonst = monsterAtLoc(loc);
  if (preexistingMonst) {
    await killCreature(preexistingMonst, true_);
  }
  ;
  ($t1 = pmapAt(loc), $t1.flags = ($t1.flags | HAS_MONSTER) >>> 0);
  if (($at2(G.pmap, loc.x, loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 || G.rogue.playbackOmniscience && ($at2(G.pmap, loc.x, loc.y).layers[DUNGEON] >>> 0 !== GRANITE || ($at2(G.pmap, loc.x, loc.y).flags & DISCOVERED) >>> 0)) {
    await refreshDungeonCell(loc.$clone());
  }
  if (monsterCanSubmergeNow(leader)) {
    leader.bookkeepingFlags = (leader.bookkeepingFlags | MB_SUBMERGED) >>> 0;
  }
  await spawnMinions(hordeID, leader, false_, true_);
  return leader;
}

export async function fadeInMonster(monst: struct_creature | null): Promise<void> {
  let fColor = new struct_color();
  let bColor = new struct_color();
  const displayChar = new Int32Array(1);
  await getCellAppearance(monst.loc.$clone(), P(displayChar, 0), fColor, bColor);
  flashMonster(monst, bColor, 100);
}

export function createCreatureList(): struct_creatureList {
  let list = new struct_creatureList();
  list.head = null;
  return list.$clone();
}

export function iterateCreatures(list: struct_creatureList | null): struct_creatureIterator {
  let iter = new struct_creatureIterator();
  iter.list = list;
  iter.next = list.head;
  while (!!iter.next && (iter.next.creature.bookkeepingFlags & MB_HAS_DIED) >>> 0) {
    iter.next = iter.next.nextCreature;
  }
  return iter.$clone();
}

export function hasNextCreature(iter: struct_creatureIterator): number {
  return (!!iter.next ? 1 : 0) << 24 >> 24;
}

export function nextCreature(iter: struct_creatureIterator | null): struct_creature | null {
  if (!iter.next) {
    return null;
  }
  let result = iter.next.creature;
  iter.next = iter.next.nextCreature;
  while (!!iter.next && (iter.next.creature.bookkeepingFlags & MB_HAS_DIED) >>> 0) {
    iter.next = iter.next.nextCreature;
  }
  return result;
}

export function prependCreature(list: struct_creatureList | null, add: struct_creature | null): void {
  let node = new struct_creatureListNode();
  node.creature = add;
  node.nextCreature = list.head;
  list.head = node;
}

export function removeCreature(list: struct_creatureList | null, remove: struct_creature | null): number {
  let node = P(list, "head");
  while (!!node.a[node.o]) {
    if (node.a[node.o].creature === remove) {
      let removeNode = node.a[node.o];
      node.a[node.o] = removeNode.nextCreature;
      free(removeNode);
      return true_;
    }
    node = P(node.a[node.o], "nextCreature");
  }
  return false_;
}

export function firstCreature(list: struct_creatureList | null): struct_creature | null {
  if (!list.head) {
    return null;
  }
  return list.head.creature;
}

export function freeCreatureList(list: struct_creatureList | null): void {
  let nextMonst = null;
  for (let monstNode = list.head; !!monstNode; monstNode = nextMonst) {
    nextMonst = monstNode.nextCreature;
    freeCreature(monstNode.creature);
    free(monstNode);
  }
  list.head = null;
}

async function summonMinions(summoner: struct_creature | null): Promise<number> {
  let $t1: any, $t2: any;
  let summonerType = summoner.info.monsterID;
  let hordeID = pickHordeType(0, summonerType, 0, 0);
  let seenMinionCount = 0;
  const x = new Int16Array(1);
  const y = new Int16Array(1);
  let atLeastOneMinion = false_;
  let buf = new Int8Array(79);
  let monstName = new Int8Array(79);
  let grid = null;
  if (0 > hordeID) {
    return false_;
  }
  if ((summoner.info.abilityFlags & MA_ENTER_SUMMONS) >>> 0) {
    ($t1 = pmapAt(summoner.loc), $t1.flags = ($t1.flags & ~HAS_MONSTER >>> 0) >>> 0);
    removeCreature(G.monsters, summoner);
  }
  atLeastOneMinion = await spawnMinions(hordeID, summoner, true_, false_);
  if (($sadd(G.hordeCatalog, hordeID).flags >>> 0 & HORDE_SUMMONED_AT_DISTANCE) >>> 0) {
    grid = allocGrid();
    fillGrid(grid, 0);
    calculateDistances(grid, summoner.loc.x, summoner.loc.y, T_PATHING_BLOCKER | T_SACRED, null, true_, true_);
    findReplaceGrid(grid, 1, (DCOLS / 2 | 0) << 16 >> 16, 1);
    findReplaceGrid(grid, 2, 30000, 0);
    getTerrainGrid(grid, 0, T_PATHING_BLOCKER | T_HARMFUL_TERRAIN, IN_FIELD_OF_VIEW | CLAIRVOYANT_VISIBLE | HAS_PLAYER | HAS_MONSTER);
  } else {
    grid = null;
  }
  let host = null;
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if (monst !== summoner && monstersAreTeammates(monst, summoner) && (monst.bookkeepingFlags & MB_JUST_SUMMONED) >>> 0) {
      if (($sadd(G.hordeCatalog, hordeID).flags >>> 0 & HORDE_SUMMONED_AT_DISTANCE) >>> 0) {
        x[0] = y[0] = -1;
        randomLocationInGrid(grid, P(x, 0), P(y, 0), 1);
        await teleport(monst, struct_pos.$of(x[0], y[0]), true_);
        if (x[0] !== -1 && y[0] !== -1 && !!grid) {
          $wr(grid.a[grid.o + x[0]], y[0], 0);
        }
      }
      monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_JUST_SUMMONED >>> 0) >>> 0;
      if (canSeeMonster(monst)) {
        seenMinionCount = seenMinionCount + 1 << 16 >> 16;
        await refreshDungeonCell(monst.loc.$clone());
      }
      monst.ticksUntilTurn = 101;
      monst.leader = summoner;
      await fadeInMonster(monst);
      host = monst;
    }
  }
  if (canSeeMonster(summoner)) {
    monsterName(P(monstName), summoner, true_);
    if (G.monsterText[summoner.info.monsterID].summonMessage[0]) {
      sprintf(P(buf), S("%s %s"), P(monstName), P(G.monsterText[summoner.info.monsterID].summonMessage));
    } else {
      sprintf(P(buf), S("%s incants darkly!"), P(monstName));
    }
    await message(P(buf), 0);
  }
  if ((summoner.info.abilityFlags & MA_ENTER_SUMMONS) >>> 0) {
    removeCreature(G.monsters, summoner);
    if (atLeastOneMinion && host) {
      host.carriedMonster = summoner;
      demoteMonsterFromLeadership(summoner);
      await refreshDungeonCell(summoner.loc.$clone());
    } else {
      ($t2 = pmapAt(summoner.loc), $t2.flags = ($t2.flags | HAS_MONSTER) >>> 0);
      prependCreature(G.monsters, summoner);
    }
  } else if (atLeastOneMinion) {
    summoner.bookkeepingFlags = (summoner.bookkeepingFlags | MB_LEADER) >>> 0;
  }
  createFlare(summoner.loc.x, summoner.loc.y, SUMMONING_FLASH_LIGHT);
  if (grid) {
    freeGrid(grid);
  }
  return atLeastOneMinion;
}

export async function populateMonsters(): Promise<void> {
  if (!(!(G.rogue.mode >>> 0 === GAME_MODE_WIZARD) || 1)) {
    return;
  }
  let i = 0;
  let numberOfMonsters = (6 + 3 * (0 > G.rogue.depthLevel - G.gameConst.amuletLevel ? 0 : G.rogue.depthLevel - G.gameConst.amuletLevel) > 20 ? 20 : 6 + 3 * (0 > G.rogue.depthLevel - G.gameConst.amuletLevel ? 0 : G.rogue.depthLevel - G.gameConst.amuletLevel)) << 16 >> 16;
  while (rand_percent(60)) {
    numberOfMonsters = numberOfMonsters + 1 << 16 >> 16;
  }
  for (i = 0; numberOfMonsters > i; i = i + 1 << 16 >> 16) {
    await spawnHorde(0, struct_pos.$of(-1, -1), HORDE_IS_SUMMONED | HORDE_MACHINE_ONLY, 0);
  }
}

export function getRandomMonsterSpawnLocation(x: Ptr | null, y: Ptr | null): number {
  let grid = null;
  grid = allocGrid();
  fillGrid(grid, 0);
  calculateDistances(grid, G.player.loc.x, G.player.loc.y, T_DIVIDES_LEVEL, null, true_, true_);
  getTerrainGrid(grid, 0, T_PATHING_BLOCKER | T_HARMFUL_TERRAIN, HAS_PLAYER | HAS_MONSTER | HAS_STAIRS | IN_FIELD_OF_VIEW);
  findReplaceGrid(grid, -30000, (DCOLS / 2 | 0) - 1 << 16 >> 16, 0);
  findReplaceGrid(grid, 30000, 30000, 0);
  findReplaceGrid(grid, (DCOLS / 2 | 0) << 16 >> 16, 30000 - 1, 1);
  randomLocationInGrid(grid, x, y, 1);
  if (0 > x.a[x.o] || 0 > y.a[y.o]) {
    fillGrid(grid, 1);
    getTerrainGrid(grid, 0, T_PATHING_BLOCKER | T_HARMFUL_TERRAIN, HAS_PLAYER | HAS_MONSTER | HAS_STAIRS | IN_FIELD_OF_VIEW | IS_IN_MACHINE);
    randomLocationInGrid(grid, x, y, 1);
  }
  freeGrid(grid);
  if (0 > x.a[x.o] || 0 > y.a[y.o]) {
    return false_;
  }
  return true_;
}

export async function spawnPeriodicHorde(): Promise<void> {
  let monst = null;
  const x = new Int16Array(1);
  const y = new Int16Array(1);
  if (!(!(G.rogue.mode >>> 0 === GAME_MODE_WIZARD) || 1)) {
    return;
  }
  if (getRandomMonsterSpawnLocation(P(x, 0), P(y, 0))) {
    monst = await spawnHorde(0, struct_pos.$of(x[0], y[0]), HORDE_IS_SUMMONED | HORDE_LEADER_CAPTIVE | HORDE_NO_PERIODIC_SPAWN | HORDE_MACHINE_ONLY, 0);
    if (monst) {
      monst.creatureState = MONSTER_WANDERING;
      for (let it2 = iterateCreatures(G.monsters); hasNextCreature(it2); ) {
        let monst2 = nextCreature(it2);
        if (monst2.leader === monst) {
          monst2.creatureState = MONSTER_WANDERING;
        }
      }
    }
  }
}

export async function disentangle(monst: struct_creature | null): Promise<void> {
  if (monst === G.player && monst.status[STATUS_STUCK]) {
    await message(S("you break free!"), false_);
  }
  monst.status[STATUS_STUCK] = 0;
}

export async function teleport(monst: struct_creature | null, destination: struct_pos, respectTerrainAvoidancePreferences: number): Promise<void> {
  let grid = null;
  let i = 0;
  let j = 0;
  let monstFOV = $arr(79, () => new Int8Array(29));
  if (!isPosInMap(destination)) {
    zeroOutGrid(P(monstFOV));
    getFOVMask(P(monstFOV), monst.loc.x, monst.loc.y, 5177344, T_OBSTRUCTS_VISION, 0, false_);
    grid = allocGrid();
    fillGrid(grid, 0);
    calculateDistances(grid, monst.loc.x, monst.loc.y, (forbiddenFlagsForMonster(monst.info) & T_DIVIDES_LEVEL) >>> 0, null, true_, false_);
    findReplaceGrid(grid, -30000, (DCOLS / 2 | 0) << 16 >> 16, 0);
    findReplaceGrid(grid, 2, 30000, 1);
    if (validLocationCount(grid, 1) < 1) {
      fillGrid(grid, 1);
    }
    if (respectTerrainAvoidancePreferences) {
      if ((monst.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0) {
        fillGrid(grid, 0);
        getTMGrid(grid, 1, TM_ALLOWS_SUBMERGING);
      }
      getTerrainGrid(grid, 0, avoidedFlagsForMonster(monst.info), IS_IN_MACHINE | HAS_PLAYER | HAS_MONSTER | HAS_STAIRS);
    } else {
      getTerrainGrid(grid, 0, forbiddenFlagsForMonster(monst.info), IS_IN_MACHINE | HAS_PLAYER | HAS_MONSTER | HAS_STAIRS);
    }
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (monstFOV[i][j]) {
          $wr(grid.a[grid.o + i], j, 0);
        }
      }
    }
    randomLocationInGrid(grid, P(destination, "x"), P(destination, "y"), 1);
    freeGrid(grid);
    if (!isPosInMap(destination)) {
      return;
    }
  }
  await disentangle(monst);
  await setMonsterLocation(monst, destination.$clone());
  if (monst !== G.player) {
    chooseNewWanderDestination(monst);
  }
}

function isValidWanderDestination(monst: struct_creature | null, wpIndex: number): number {
  return (wpIndex >= 0 && G.rogue.wpCount > wpIndex && !monst.waypointAlreadyVisited[wpIndex] && $rd($rd(G.rogue.wpDistance[wpIndex], monst.loc.x), monst.loc.y) >= 0 && nextStep(G.rogue.wpDistance[wpIndex], monst.loc, monst, false_) !== NO_DIRECTION ? 1 : 0) << 24 >> 24;
}

function closestWaypointIndex(monst: struct_creature | null): number {
  let i = 0;
  let closestDistance = 0;
  let closestIndex = 0;
  closestDistance = (DCOLS / 2 | 0) << 16 >> 16;
  closestIndex = -1;
  for (i = 0; G.rogue.wpCount > i; i = i + 1 << 16 >> 16) {
    if (isValidWanderDestination(monst, i) && closestDistance > $rd($rd(G.rogue.wpDistance[i], monst.loc.x), monst.loc.y)) {
      closestDistance = $rd($rd(G.rogue.wpDistance[i], monst.loc.x), monst.loc.y);
      closestIndex = i;
    }
  }
  return closestIndex;
}

export function chooseNewWanderDestination(monst: struct_creature | null): void {
  let i = 0;
  ;
  ;
  monst.waypointAlreadyVisited[rand_range(0, G.rogue.wpCount - 1)] = false_;
  monst.waypointAlreadyVisited[rand_range(0, G.rogue.wpCount - 1)] = false_;
  if (monst.targetWaypointIndex >= 0) {
    monst.waypointAlreadyVisited[monst.targetWaypointIndex] = true_;
  }
  monst.targetWaypointIndex = closestWaypointIndex(monst);
  if (monst.targetWaypointIndex === -1) {
    for (i = 0; G.rogue.wpCount > i; i = i + 1 << 16 >> 16) {
      monst.waypointAlreadyVisited[i] = 0;
    }
    monst.targetWaypointIndex = closestWaypointIndex(monst);
  }
}

function successorTerrainFlags(tile: number, promotionType: number): number {
  let DF = 0;
  switch (promotionType >>> 0) {
  case SUBSEQ_PROMOTE:
    DF = G.tileCatalog[tile].promoteType;
    break;
  case SUBSEQ_BURN:
    DF = G.tileCatalog[tile].fireType;
    break;
  case SUBSEQ_DISCOVER:
    DF = G.tileCatalog[tile].discoverType;
    break;
  default:
    break;
  }
  if (DF) {
    return G.tileCatalog[G.dungeonFeatureCatalog[DF].tile].flags;
  } else {
    return 0;
  }
}

export function burnedTerrainFlagsAtLoc(loc: struct_pos): number {
  let layer = 0;
  let flags = 0;
  for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; layer = layer + 1 << 16 >> 16) {
    if ((G.tileCatalog[pmapAt(loc).layers[layer]].flags & T_IS_FLAMMABLE) >>> 0) {
      flags = (flags | successorTerrainFlags(pmapAt(loc).layers[layer], SUBSEQ_BURN)) >>> 0;
      if ((G.tileCatalog[pmapAt(loc).layers[layer]].mechFlags & TM_EXPLOSIVE_PROMOTE) >>> 0) {
        flags = (flags | successorTerrainFlags(pmapAt(loc).layers[layer], SUBSEQ_PROMOTE)) >>> 0;
      }
    }
  }
  return flags;
}

export function discoveredTerrainFlagsAtLoc(loc: struct_pos): number {
  let layer = 0;
  let flags = 0;
  for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; layer = layer + 1 << 16 >> 16) {
    if ((G.tileCatalog[pmapAt(loc).layers[layer]].mechFlags & TM_IS_SECRET) >>> 0) {
      flags = (flags | successorTerrainFlags(pmapAt(loc).layers[layer], SUBSEQ_DISCOVER)) >>> 0;
    }
  }
  return flags;
}

export function monsterAvoids(monst: struct_creature | null, p: struct_pos): number {
  let terrainImmunities = 0;
  let defender = null;
  const tFlags = new Float64Array(1);
  const cFlags = new Float64Array(1);
  getLocationFlags(p.x, p.y, P(tFlags, 0), null, P(cFlags, 0), (monst === G.player ? 1 : 0) << 24 >> 24);
  if (p.x === G.rogue.downLoc.x && p.y === G.rogue.downLoc.y || p.x === G.rogue.upLoc.x && p.y === G.rogue.upLoc.y) {
    return (monst !== G.player ? 1 : 0) << 24 >> 24;
  }
  if ((monst.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0 && !cellHasTMFlag(p, TM_ALLOWS_SUBMERGING)) {
    return true_;
  }
  if (G.player.loc.x === p.x && G.player.loc.y === p.y && monst !== G.player && monst.creatureState >>> 0 !== MONSTER_ALLY) {
    return false_;
  }
  if ((tFlags[0] & T_OBSTRUCTS_PASSABILITY) >>> 0) {
    if (monst !== G.player && cellHasTMFlag(p, TM_IS_SECRET) && !((discoveredTerrainFlagsAtLoc(p) & avoidedFlagsForMonster(monst.info)) >>> 0)) {
      return false_;
    }
    if (distanceBetween(monst.loc, p) <= 1) {
      defender = monsterAtLoc(p);
      if (defender && (defender.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) {
        return false_;
      }
    }
    return true_;
  }
  if (distanceBetween(monst.loc, p) <= 1) {
    defender = monsterAtLoc(p);
    if (defender && !((defender.bookkeepingFlags & MB_IS_DYING) >>> 0) && monsterWillAttackTarget(monst, defender)) {
      if (attackWouldBeFutile(monst, defender)) {
        return true_;
      } else {
        return false_;
      }
    }
  }
  defender = monsterAtLoc(p);
  if (defender && !((defender.bookkeepingFlags & MB_IS_DYING) >>> 0) && monstersAreEnemies(monst, defender) && attackWouldBeFutile(monst, defender)) {
    return true_;
  }
  if (cellHasTMFlag(p, TM_IS_SECRET) && monst === G.player) {
    return false_;
  }
  terrainImmunities = 0;
  if (monst.status[STATUS_IMMUNE_TO_FIRE]) {
    terrainImmunities = (terrainImmunities | (T_IS_FIRE | T_SPONTANEOUSLY_IGNITES | T_LAVA_INSTA_DEATH)) >>> 0;
  }
  if ((monst.info.flags & MONST_INVULNERABLE) >>> 0) {
    terrainImmunities = (terrainImmunities | (T_HARMFUL_TERRAIN | T_ENTANGLES | T_SPONTANEOUSLY_IGNITES | T_LAVA_INSTA_DEATH)) >>> 0;
  }
  if ((monst.info.flags & MONST_INANIMATE) >>> 0) {
    terrainImmunities = (terrainImmunities | (T_CAUSES_DAMAGE | T_CAUSES_PARALYSIS | T_CAUSES_CONFUSION | T_CAUSES_NAUSEA | T_CAUSES_POISON)) >>> 0;
  }
  if (monst.status[STATUS_LEVITATING]) {
    terrainImmunities = (terrainImmunities | (T_AUTO_DESCENT | T_CAUSES_POISON | T_IS_DEEP_WATER | T_IS_DF_TRAP | T_LAVA_INSTA_DEATH)) >>> 0;
  }
  if ((monst.info.flags & MONST_IMMUNE_TO_WEBS) >>> 0) {
    terrainImmunities = (terrainImmunities | T_ENTANGLES) >>> 0;
  }
  if ((monst.info.flags & MONST_IMMUNE_TO_WATER) >>> 0) {
    terrainImmunities = (terrainImmunities | T_IS_DEEP_WATER) >>> 0;
  }
  if (monst === G.player) {
    terrainImmunities = (terrainImmunities | T_SACRED) >>> 0;
  }
  if (monst === G.player && G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0 && (G.rogue.armor.flags & ITEM_RUNIC_IDENTIFIED) >>> 0 && G.rogue.armor.enchant2 === A_RESPIRATION) {
    terrainImmunities = (terrainImmunities | T_RESPIRATION_IMMUNITIES) >>> 0;
  }
  if (((tFlags[0] & T_SACRED) >>> 0 & ~terrainImmunities >>> 0) >>> 0) {
    return true_;
  }
  if (!monst.status[STATUS_IMMUNE_TO_FIRE] && !((monst.info.flags & MONST_INVULNERABLE) >>> 0) && (tFlags[0] & T_SPONTANEOUSLY_IGNITES) >>> 0 && !((cFlags[0] & (HAS_MONSTER | HAS_PLAYER)) >>> 0) && !cellHasTerrainFlag(monst.loc, T_IS_FIRE | T_SPONTANEOUSLY_IGNITES) && (monst === G.player || monst.creatureState >>> 0 !== MONSTER_TRACKING_SCENT && monst.creatureState >>> 0 !== MONSTER_FLEEING)) {
    return true_;
  }
  if (monst !== G.player && monst.creatureState >>> 0 === MONSTER_WANDERING && (monst.info.flags & MONST_FIERY) >>> 0 && (tFlags[0] & T_IS_FLAMMABLE) >>> 0) {
    return true_;
  }
  if (monst !== G.player && monst.status[STATUS_BURNING] && ((burnedTerrainFlagsAtLoc(p) & (T_CAUSES_EXPLOSIVE_DAMAGE | T_CAUSES_DAMAGE | T_AUTO_DESCENT)) >>> 0 & ~terrainImmunities >>> 0) >>> 0) {
    return true_;
  }
  if (((tFlags[0] & T_IS_FIRE) >>> 0 & ~terrainImmunities >>> 0) >>> 0 && !cellHasTerrainFlag(monst.loc, T_IS_FIRE) && !((cFlags[0] & (HAS_MONSTER | HAS_PLAYER)) >>> 0) && (monst !== G.player || $rd(G.rogue.mapToShore.a[G.rogue.mapToShore.o + p.x], p.y) >= G.player.status[STATUS_IMMUNE_TO_FIRE])) {
    return true_;
  }
  if ((((tFlags[0] & T_HARMFUL_TERRAIN) >>> 0 & ~T_IS_FIRE >>> 0) >>> 0 & ~terrainImmunities >>> 0) >>> 0 && !cellHasTerrainFlag(monst.loc, T_HARMFUL_TERRAIN & ~T_IS_FIRE)) {
    return true_;
  }
  if (((tFlags[0] & T_AUTO_DESCENT) >>> 0 & ~terrainImmunities >>> 0) >>> 0 && (!((tFlags[0] & T_ENTANGLES) >>> 0) || !((monst.info.flags & MONST_IMMUNE_TO_WEBS) >>> 0))) {
    return true_;
  }
  if (((tFlags[0] & T_IS_DF_TRAP) >>> 0 & ~terrainImmunities >>> 0) >>> 0 && !((cFlags[0] & PRESSURE_PLATE_DEPRESSED) >>> 0) && (monst === G.player || monst.creatureState >>> 0 === MONSTER_WANDERING || monst.creatureState >>> 0 === MONSTER_ALLY && !cellHasTMFlag(p, TM_IS_SECRET)) && !monst.status[STATUS_ENTRANCED] && (!((tFlags[0] & T_ENTANGLES) >>> 0) || !((monst.info.flags & MONST_IMMUNE_TO_WEBS) >>> 0))) {
    return true_;
  }
  if (((tFlags[0] & T_LAVA_INSTA_DEATH) >>> 0 & ~terrainImmunities >>> 0) >>> 0 && (!((tFlags[0] & T_ENTANGLES) >>> 0) || !((monst.info.flags & MONST_IMMUNE_TO_WEBS) >>> 0)) && (monst !== G.player || $rd(G.rogue.mapToShore.a[G.rogue.mapToShore.o + p.x], p.y) >= (G.player.status[STATUS_IMMUNE_TO_FIRE] > G.player.status[STATUS_LEVITATING] ? G.player.status[STATUS_IMMUNE_TO_FIRE] : G.player.status[STATUS_LEVITATING]))) {
    return true_;
  }
  if (((tFlags[0] & T_IS_DEEP_WATER) >>> 0 & ~terrainImmunities >>> 0) >>> 0 && (!((tFlags[0] & T_ENTANGLES) >>> 0) || !((monst.info.flags & MONST_IMMUNE_TO_WEBS) >>> 0)) && !cellHasTerrainFlag(monst.loc, T_IS_DEEP_WATER)) {
    return true_;
  }
  if (((tFlags[0] & T_CAUSES_POISON) >>> 0 & ~terrainImmunities >>> 0) >>> 0 && !cellHasTerrainFlag(monst.loc, T_CAUSES_POISON) && (monst === G.player || monst.creatureState >>> 0 !== MONSTER_TRACKING_SCENT || 10 > monst.currentHP)) {
    return true_;
  }
  if ((monst.info.abilityFlags & MA_AVOID_CORRIDORS) >>> 0 && !(monst.status[STATUS_ENRAGED] && (monst.info.maxHP / 2 | 0) >= monst.currentHP) && monst.creatureState >>> 0 === MONSTER_TRACKING_SCENT && (monst.bookkeepingFlags & (MB_FOLLOWER | MB_LEADER)) >>> 0 && passableArcCount(p.x, p.y) >= 2 && passableArcCount(monst.loc.x, monst.loc.y) < 2 && !cellHasTerrainFlag(monst.loc, (T_HARMFUL_TERRAIN & ~terrainImmunities >>> 0) >>> 0)) {
    return true_;
  }
  return false_;
}

async function moveMonsterPassivelyTowards(monst: struct_creature | null, targetLoc: struct_pos, willingToAttackPlayer: number): Promise<number> {
  let x = monst.loc.x;
  let y = monst.loc.y;
  let dx = signum(targetLoc.x - x);
  let dy = signum(targetLoc.y - y);
  if (dx === 0 && dy === 0) {
    return false_;
  }
  let newX = x + dx;
  let newY = y + dy;
  if (!coordinatesAreInMap(newX << 16 >> 16, newY << 16 >> 16)) {
    return false_;
  }
  if (monst.creatureState >>> 0 !== MONSTER_TRACKING_SCENT && dx && dy) {
    if (Math.abs(targetLoc.x - x) > Math.abs(targetLoc.y - y) && rand_range(0, Math.abs(targetLoc.x - x)) > Math.abs(targetLoc.y - y)) {
      if (!(monsterAvoids(monst, struct_pos.$of(newX << 16 >> 16, y << 16 >> 16)) || !willingToAttackPlayer && ($at2(G.pmap, newX, y).flags & HAS_PLAYER) >>> 0 || !await moveMonster(monst, dx << 16 >> 16, 0))) {
        return true_;
      }
    } else if (Math.abs(targetLoc.x - x) < Math.abs(targetLoc.y - y) && rand_range(0, Math.abs(targetLoc.y - y)) > Math.abs(targetLoc.x - x)) {
      if (!(monsterAvoids(monst, struct_pos.$of(x << 16 >> 16, newY << 16 >> 16)) || !willingToAttackPlayer && ($at2(G.pmap, x, newY).flags & HAS_PLAYER) >>> 0 || !await moveMonster(monst, 0, dy << 16 >> 16))) {
        return true_;
      }
    }
  }
  if (monsterAvoids(monst, struct_pos.$of(newX << 16 >> 16, newY << 16 >> 16)) || !willingToAttackPlayer && ($at2(G.pmap, newX, newY).flags & HAS_PLAYER) >>> 0 || !await moveMonster(monst, dx << 16 >> 16, dy << 16 >> 16)) {
    if (distanceBetween(struct_pos.$of(x << 16 >> 16, y << 16 >> 16), targetLoc) <= 1 && (dx === 0 || dy === 0)) {
      return false_;
    }
    if ((targetLoc.y > y ? targetLoc.y : y) - (y > targetLoc.y ? targetLoc.y : y) > (targetLoc.x > x ? targetLoc.x : x) - (x > targetLoc.x ? targetLoc.x : x)) {
      if (monsterAvoids(monst, struct_pos.$of(x << 16 >> 16, newY << 16 >> 16)) || !willingToAttackPlayer && ($at2(G.pmap, x, newY).flags & HAS_PLAYER) >>> 0 || !await moveMonster(monst, 0, dy << 16 >> 16)) {
        if (monsterAvoids(monst, struct_pos.$of(newX << 16 >> 16, y << 16 >> 16)) || !willingToAttackPlayer && ($at2(G.pmap, newX, y).flags & HAS_PLAYER) >>> 0 || !await moveMonster(monst, dx << 16 >> 16, 0)) {
          if (monsterAvoids(monst, struct_pos.$of(x - 1 << 16 >> 16, newY << 16 >> 16)) || !willingToAttackPlayer && ($at2(G.pmap, x - 1, newY).flags & HAS_PLAYER) >>> 0 || !await moveMonster(monst, -1, dy << 16 >> 16)) {
            if (monsterAvoids(monst, struct_pos.$of(x + 1 << 16 >> 16, newY << 16 >> 16)) || !willingToAttackPlayer && ($at2(G.pmap, x + 1, newY).flags & HAS_PLAYER) >>> 0 || !await moveMonster(monst, 1, dy << 16 >> 16)) {
              return false_;
            }
          }
        }
      }
    } else {
      if (monsterAvoids(monst, struct_pos.$of(newX << 16 >> 16, y << 16 >> 16)) || !willingToAttackPlayer && ($at2(G.pmap, newX, y).flags & HAS_PLAYER) >>> 0 || !await moveMonster(monst, dx << 16 >> 16, 0)) {
        if (monsterAvoids(monst, struct_pos.$of(x << 16 >> 16, newY << 16 >> 16)) || !willingToAttackPlayer && ($at2(G.pmap, x, newY).flags & HAS_PLAYER) >>> 0 || !await moveMonster(monst, 0, dy << 16 >> 16)) {
          if (monsterAvoids(monst, struct_pos.$of(newX << 16 >> 16, y - 1 << 16 >> 16)) || !willingToAttackPlayer && ($at2(G.pmap, newX, y - 1).flags & HAS_PLAYER) >>> 0 || !await moveMonster(monst, dx << 16 >> 16, -1)) {
            if (monsterAvoids(monst, struct_pos.$of(newX << 16 >> 16, y + 1 << 16 >> 16)) || !willingToAttackPlayer && ($at2(G.pmap, newX, y + 1).flags & HAS_PLAYER) >>> 0 || !await moveMonster(monst, dx << 16 >> 16, 1)) {
              return false_;
            }
          }
        }
      }
    }
  }
  return true_;
}

export function distanceBetween(loc1: struct_pos, loc2: struct_pos): number {
  return (Math.abs(loc1.x - loc2.x) > Math.abs(loc1.y - loc2.y) ? Math.abs(loc1.x - loc2.x) : Math.abs(loc1.y - loc2.y)) << 16 >> 16;
}

export function alertMonster(monst: struct_creature | null): void {
  monst.creatureState = monst.creatureMode >>> 0 === MODE_PERM_FLEEING ? MONSTER_FLEEING : MONSTER_TRACKING_SCENT;
  monst.lastSeenPlayerAt.$cp(G.player.loc);
}

export function wakeUp(monst: struct_creature | null): void {
  if (monst.creatureState >>> 0 !== MONSTER_ALLY) {
    alertMonster(monst);
  }
  monst.ticksUntilTurn = 100;
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let teammate = nextCreature(it);
    if (monst !== teammate && monstersAreTeammates(monst, teammate) && teammate.creatureMode >>> 0 === MODE_NORMAL) {
      if (teammate.creatureState >>> 0 === MONSTER_SLEEPING || teammate.creatureState >>> 0 === MONSTER_WANDERING) {
        teammate.ticksUntilTurn = (100 > teammate.ticksUntilTurn ? 100 : teammate.ticksUntilTurn) << 16 >> 16;
      }
      if (monst.creatureState >>> 0 !== MONSTER_ALLY) {
        teammate.creatureState = teammate.creatureMode >>> 0 === MODE_PERM_FLEEING ? MONSTER_FLEEING : MONSTER_TRACKING_SCENT;
        updateMonsterState(teammate);
      }
    }
  }
}

function monsterCanShootWebs(monst: struct_creature | null): number {
  let i = 0;
  for (i = 0; monst.info.bolts[i] >>> 0 !== 0; i = i + 1 << 16 >> 16) {
    let theBolt = $sadd(G.boltCatalog, monst.info.bolts[i]);
    if (theBolt.pathDF && (G.tileCatalog[G.dungeonFeatureCatalog[theBolt.pathDF].tile].flags & T_ENTANGLES) >>> 0) {
      return true_;
    }
  }
  return false_;
}

function awarenessDistance(observer: struct_creature | null, target: struct_creature | null): number {
  let perceivedDistance = 0;
  perceivedDistance = G.rogue.scentTurnNumber - $rd(G.scentMap.a[G.scentMap.o + observer.loc.x], observer.loc.y);
  if (target === G.player && (pmapAt(observer.loc).flags & IN_FIELD_OF_VIEW) >>> 0 || target !== G.player && openPathBetween(observer.loc.$clone(), target.loc.$clone())) {
    perceivedDistance = perceivedDistance < scentDistance(observer.loc.x, observer.loc.y, target.loc.x, target.loc.y) ? perceivedDistance : scentDistance(observer.loc.x, observer.loc.y, target.loc.x, target.loc.y);
  }
  perceivedDistance = 1000 > perceivedDistance ? perceivedDistance : 1000;
  if (0 > perceivedDistance) {
    perceivedDistance = 1000;
  }
  return perceivedDistance << 16 >> 16;
}

function awareOfTarget(observer: struct_creature | null, target: struct_creature | null): number {
  let perceivedDistance = awarenessDistance(observer, target);
  let awareness = G.rogue.stealthRange * 2 << 16 >> 16;
  let retval = 0;
  ;
  if ((observer.info.flags & MONST_ALWAYS_HUNTING) >>> 0) {
    retval = true_;
  } else if ((observer.info.flags & MONST_IMMOBILE) >>> 0) {
    retval = (awareness >= perceivedDistance ? 1 : 0) << 24 >> 24;
  } else if (perceivedDistance > awareness * 3) {
    retval = false_;
  } else if (observer.creatureState >>> 0 === MONSTER_TRACKING_SCENT) {
    if (perceivedDistance > awareness) {
      retval = rand_percent(97);
    } else {
      retval = true_;
    }
  } else if (target === G.player && !((pmapAt(observer.loc).flags & IN_FIELD_OF_VIEW) >>> 0)) {
    retval = false_;
  } else if (awareness >= perceivedDistance) {
    retval = rand_percent(25);
  } else {
    retval = false_;
  }
  return retval;
}

function closestWaypointIndexTo(p: struct_pos): number {
  let i = 0;
  let closestDistance = 0;
  let closestIndex = 0;
  closestDistance = 1000;
  closestIndex = -1;
  for (i = 0; G.rogue.wpCount > i; i = i + 1 << 16 >> 16) {
    if (closestDistance > $rd($rd(G.rogue.wpDistance[i], p.x), p.y)) {
      closestDistance = $rd($rd(G.rogue.wpDistance[i], p.x), p.y);
      closestIndex = i;
    }
  }
  return closestIndex;
}

function wanderToward(monst: struct_creature | null, destination: struct_pos): void {
  if (isPosInMap(destination)) {
    let theWaypointIndex = closestWaypointIndexTo(destination);
    if (theWaypointIndex !== -1) {
      monst.waypointAlreadyVisited[theWaypointIndex] = false_;
      monst.targetWaypointIndex = theWaypointIndex;
    }
  }
}

export function updateMonsterState(monst: struct_creature | null): void {
  let x = 0;
  let y = 0;
  let closestFearedEnemy = 0;
  let awareOfPlayer = 0;
  x = monst.loc.x;
  y = monst.loc.y;
  if ((monst.info.flags & MONST_ALWAYS_HUNTING) >>> 0 && monst.creatureState >>> 0 !== MONSTER_ALLY) {
    monst.creatureState = MONSTER_TRACKING_SCENT;
    return;
  }
  awareOfPlayer = awareOfTarget(monst, G.player);
  if ((monst.info.flags & MONST_IMMOBILE) >>> 0 && monst.creatureState >>> 0 !== MONSTER_ALLY) {
    if (awareOfPlayer) {
      monst.creatureState = MONSTER_TRACKING_SCENT;
    } else {
      monst.creatureState = MONSTER_SLEEPING;
    }
    return;
  }
  if (monst.creatureMode >>> 0 === MODE_PERM_FLEEING && (monst.creatureState >>> 0 === MONSTER_WANDERING || monst.creatureState >>> 0 === MONSTER_TRACKING_SCENT)) {
    monst.creatureState = MONSTER_FLEEING;
  }
  closestFearedEnemy = DCOLS + DROWS;
  let handledPlayer = false_;
  for (let it = iterateCreatures(G.monsters); !handledPlayer || hasNextCreature(it); ) {
    let monst2 = !handledPlayer ? G.player : nextCreature(it);
    handledPlayer = true_;
    if (monsterFleesFrom(monst, monst2) && distanceBetween(struct_pos.$of(x, y), monst2.loc) < closestFearedEnemy && traversiblePathBetween(monst2, x, y) && openPathBetween(struct_pos.$of(x, y), monst2.loc.$clone())) {
      closestFearedEnemy = distanceBetween(struct_pos.$of(x, y), monst2.loc);
    }
  }
  if (monst.creatureState >>> 0 === MONSTER_WANDERING && awareOfPlayer && (pmapAt(G.player.loc).flags & IN_FIELD_OF_VIEW) >>> 0) {
    alertMonster(monst);
  } else if (monst.creatureState >>> 0 === MONSTER_SLEEPING) {
    if (awareOfPlayer) {
      wakeUp(monst);
    }
  } else if (monst.creatureState >>> 0 === MONSTER_TRACKING_SCENT && !awareOfPlayer) {
    monst.creatureState = MONSTER_WANDERING;
    wanderToward(monst, monst.lastSeenPlayerAt);
  } else if (monst.creatureState >>> 0 === MONSTER_TRACKING_SCENT && 3 > closestFearedEnemy) {
    monst.creatureState = MONSTER_FLEEING;
  } else if (monst.creatureState >>> 0 !== MONSTER_ALLY && (monst.info.flags & MONST_FLEES_NEAR_DEATH) >>> 0 && (3 * monst.info.maxHP / 4 | 0) >= monst.currentHP) {
    if (monst.creatureState >>> 0 === MONSTER_FLEEING || (monst.info.maxHP / 4 | 0) >= monst.currentHP) {
      monst.creatureState = MONSTER_FLEEING;
    }
  } else if (monst.creatureMode >>> 0 === MODE_NORMAL && monst.creatureState >>> 0 === MONSTER_FLEEING && !monst.status[STATUS_MAGICAL_FEAR] && closestFearedEnemy >= 3) {
    monst.creatureState = MONSTER_TRACKING_SCENT;
  } else if (monst.creatureMode >>> 0 === MODE_PERM_FLEEING && monst.creatureState >>> 0 === MONSTER_FLEEING && (monst.info.abilityFlags & MA_HIT_STEAL_FLEE) >>> 0 && !monst.status[STATUS_MAGICAL_FEAR] && !monst.carriedItem) {
    monst.creatureMode = MODE_NORMAL;
    if (monst.leader === G.player) {
      monst.creatureState = MONSTER_ALLY;
    } else {
      alertMonster(monst);
    }
  } else if (monst.creatureMode >>> 0 === MODE_NORMAL && monst.creatureState >>> 0 === MONSTER_FLEEING && (monst.info.flags & MONST_FLEES_NEAR_DEATH) >>> 0 && !monst.status[STATUS_MAGICAL_FEAR] && monst.currentHP >= (monst.info.maxHP * 3 / 4 | 0)) {
    if ((monst.bookkeepingFlags & MB_FOLLOWER) >>> 0 && monst.leader === G.player) {
      monst.creatureState = MONSTER_ALLY;
    } else {
      alertMonster(monst);
    }
  }
  if (awareOfPlayer) {
    if (monst.creatureState >>> 0 === MONSTER_FLEEING || monst.creatureState >>> 0 === MONSTER_TRACKING_SCENT) {
      monst.lastSeenPlayerAt.$cp(G.player.loc);
    }
  }
}

export async function decrementMonsterStatus(monst: struct_creature | null): Promise<void> {
  let i = 0;
  let damage = 0;
  let buf = new Int8Array(100);
  let buf2 = new Int8Array(100);
  monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_JUST_SUMMONED >>> 0) >>> 0;
  if (monst.info.maxHP > monst.currentHP && monst.info.turnsBetweenRegen > 0 && !monst.status[STATUS_POISONED]) {
    if ((monst.turnsUntilRegen -= 1000) <= 0) {
      monst.currentHP = monst.currentHP + 1 << 16 >> 16;
      monst.previousHealthPoints = monst.previousHealthPoints + 1 << 16 >> 16;
      monst.turnsUntilRegen += $mul64(monst.info.turnsBetweenRegen, 1000);
    }
  }
  for (i = 0; NUMBER_OF_STATUS_EFFECTS > i; i = i + 1 << 16 >> 16) {
    switch (i) {
    case STATUS_LEVITATING:
      if (monst.status[i] && !((monst.info.flags & MONST_FLIES) >>> 0)) {
        --monst.status[i];
      }
      break;
    case STATUS_SLOWED:
      if (monst.status[i] && !--monst.status[i]) {
        monst.movementSpeed = monst.info.movementSpeed;
        monst.attackSpeed = monst.info.attackSpeed;
      }
      break;
    case STATUS_WEAKENED:
      if (monst.status[i] && !--monst.status[i]) {
        monst.weaknessAmount = 0;
      }
      break;
    case STATUS_HASTED:
      if (monst.status[i]) {
        if (!--monst.status[i]) {
          monst.movementSpeed = monst.info.movementSpeed;
          monst.attackSpeed = monst.info.attackSpeed;
        }
      }
      break;
    case STATUS_BURNING:
      if (monst.status[i]) {
        if (!((monst.info.flags & MONST_FIERY) >>> 0)) {
          --monst.status[i];
        }
        damage = rand_range(1, 3) << 16 >> 16;
        if (!monst.status[STATUS_IMMUNE_TO_FIRE] && !((monst.info.flags & MONST_INVULNERABLE) >>> 0) && await inflictDamage(null, monst, damage, G.orange, true_)) {
          if (canSeeMonster(monst)) {
            monsterName(P(buf), monst, true_);
            sprintf(P(buf2), S("%s burns %s."), P(buf), (monst.info.flags & MONST_INANIMATE) >>> 0 ? S("up") : S("to death"));
            await messageWithColor(P(buf2), messageColorFromVictim(monst), 0);
          }
          await killCreature(monst, false_);
          return;
        }
        if (0 >= monst.status[i]) {
          await extinguishFireOnCreature(monst);
        }
      }
      break;
    case STATUS_LIFESPAN_REMAINING:
      if (monst.status[i]) {
        --monst.status[i];
        if (0 >= monst.status[i]) {
          await killCreature(monst, false_);
          if (canSeeMonster(monst)) {
            monsterName(P(buf), monst, true_);
            sprintf(P(buf2), S("%s dissipates into thin air."), P(buf));
            await messageWithColor(P(buf2), G.white, 0);
          }
          return;
        }
      }
      break;
    case STATUS_POISONED:
      if (monst.status[i]) {
        --monst.status[i];
        if (await inflictDamage(null, monst, monst.poisonAmount, G.green, true_)) {
          if (canSeeMonster(monst)) {
            monsterName(P(buf), monst, true_);
            sprintf(P(buf2), S("%s dies of poison."), P(buf));
            await messageWithColor(P(buf2), messageColorFromVictim(monst), 0);
          }
          await killCreature(monst, false_);
          return;
        }
        if (!monst.status[i]) {
          monst.poisonAmount = 0;
        }
      }
      break;
    case STATUS_STUCK:
      if (monst.status[i] && !cellHasTerrainFlag(monst.loc, T_ENTANGLES)) {
        monst.status[i] = 0;
      }
      break;
    case STATUS_DISCORDANT:
      if (monst.status[i] && !--monst.status[i]) {
        if (monst.creatureState >>> 0 === MONSTER_FLEEING && !monst.status[STATUS_MAGICAL_FEAR] && monst.leader === G.player) {
          monst.creatureState = MONSTER_ALLY;
          if (monst.carriedItem) {
            await makeMonsterDropItem(monst);
          }
        }
      }
      break;
    case STATUS_MAGICAL_FEAR:
      if (monst.status[i]) {
        if (!--monst.status[i]) {
          monst.creatureState = monst.leader === G.player ? MONSTER_ALLY : MONSTER_TRACKING_SCENT;
        }
      }
      break;
    case STATUS_SHIELDED:
      monst.status[i] -= monst.maxStatus[i] / 20 | 0;
      if (0 >= monst.status[i]) {
        monst.status[i] = monst.maxStatus[i] = 0;
      }
      break;
    case STATUS_IMMUNE_TO_FIRE:
      if (monst.status[i] && !((monst.info.flags & MONST_IMMUNE_TO_FIRE) >>> 0)) {
        --monst.status[i];
      }
      break;
    case STATUS_INVISIBLE:
      if (monst.status[i] && !((monst.info.flags & MONST_INVISIBLE) >>> 0) && !--monst.status[i] && ($at2(G.pmap, monst.loc.x, monst.loc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
        await refreshDungeonCell(monst.loc.$clone());
      }
      break;
    default:
      if (monst.status[i]) {
        --monst.status[i];
      }
      break;
    }
  }
  if (monsterCanSubmergeNow(monst) && !((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
    if (rand_percent(20)) {
      monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_SUBMERGED) >>> 0;
      if (!monst.status[STATUS_MAGICAL_FEAR] && monst.creatureState >>> 0 === MONSTER_FLEEING && (!((monst.info.flags & MONST_FLEES_NEAR_DEATH) >>> 0) || monst.currentHP >= (monst.info.maxHP * 3 / 4 | 0))) {
        monst.creatureState = MONSTER_TRACKING_SCENT;
      }
      await refreshDungeonCell(monst.loc.$clone());
    } else if ((monst.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0 && monst.creatureState >>> 0 !== MONSTER_ALLY) {
      monst.creatureState = MONSTER_FLEEING;
    }
  }
}

export function traversiblePathBetween(monst: struct_creature | null, x2: number, y2: number): number {
  let originLoc = monst.loc.$clone();
  let targetLoc = struct_pos.$of(x2, y2).$clone();
  let coords = $sarr(struct_pos, 79);
  let n = getLineCoordinates(coords[0], originLoc.$clone(), targetLoc.$clone(), $sadd(G.boltCatalog, BOLT_NONE));
  for (let i = 0; n > i; ++i) {
    if (posEq(coords[i], targetLoc)) {
      return true_;
    }
    if (monsterAvoids(monst, coords[i])) {
      return false_;
    }
  }
  ;
  return true_;
}

export function specifiedPathBetween(x1: number, y1: number, x2: number, y2: number, blockingTerrain: number, blockingFlags: number): number {
  let originLoc = struct_pos.$of(x1, y1).$clone();
  let targetLoc = struct_pos.$of(x2, y2).$clone();
  let coords = $sarr(struct_pos, 79);
  let n = getLineCoordinates(coords[0], originLoc.$clone(), targetLoc.$clone(), $sadd(G.boltCatalog, BOLT_NONE));
  for (let i = 0; n > i; ++i) {
    let x = coords[i].x;
    let y = coords[i].y;
    if (cellHasTerrainFlag(struct_pos.$of(x, y), blockingTerrain) || ($at2(G.pmap, x, y).flags & blockingFlags) >>> 0) {
      return false_;
    }
    if (x === x2 && y === y2) {
      return true_;
    }
  }
  ;
  return true_;
}

export function openPathBetween(startLoc: struct_pos, targetLoc: struct_pos): number {
  let returnLoc = new struct_pos();
  getImpactLoc(returnLoc, startLoc.$clone(), targetLoc.$clone(), DCOLS, false_, $sadd(G.boltCatalog, BOLT_NONE));
  return posEq(returnLoc, targetLoc);
}

export function monsterAtLoc(p: struct_pos): struct_creature | null {
  if (!((pmapAt(p).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0)) {
    return null;
  }
  if (posEq(G.player.loc, p)) {
    return G.player;
  }
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if (posEq(monst.loc, p)) {
      return monst;
    }
  }
  ;
  return null;
}

export function dormantMonsterAtLoc(p: struct_pos): struct_creature | null {
  if (!((pmapAt(p).flags & HAS_DORMANT_MONSTER) >>> 0)) {
    return null;
  }
  for (let it = iterateCreatures(G.dormantMonsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if (posEq(monst.loc, p)) {
      return monst;
    }
  }
  ;
  return null;
}

function monsterHasBoltEffect(monst: struct_creature | null, boltEffectIndex: number): number {
  let i = 0;
  for (i = 0; monst.info.bolts[i] >>> 0 !== 0; i = i + 1 << 16 >> 16) {
    if ($sadd(G.boltCatalog, monst.info.bolts[i]).boltEffect >>> 0 === boltEffectIndex >>> 0) {
      return monst.info.bolts[i];
    }
  }
  return BOLT_NONE;
}

async function pathTowardCreature(monst: struct_creature | null, target: struct_creature | null): Promise<void> {
  if (traversiblePathBetween(monst, target.loc.x, target.loc.y)) {
    if (distanceBetween(monst.loc, target.loc) <= 2) {
      monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_GIVEN_UP_ON_SCENT >>> 0) >>> 0;
    }
    await moveMonsterPassivelyTowards(monst, target.loc.$clone(), (monst.creatureState >>> 0 !== MONSTER_ALLY ? 1 : 0) << 24 >> 24);
    return;
  }
  if (!target.mapToMe) {
    target.mapToMe = allocGrid();
    fillGrid(target.mapToMe, 0);
    calculateDistances(target.mapToMe, target.loc.x, target.loc.y, 0, monst, true_, false_);
  }
  if ($rd(target.mapToMe.a[target.mapToMe.o + target.loc.x], target.loc.y) > 3) {
    calculateDistances(target.mapToMe, target.loc.x, target.loc.y, 0, monst, true_, false_);
  }
  if (distanceBetween(monst.loc, target.loc) > 10 || monstersAreEnemies(monst, target)) {
    if (await monsterBlinkToPreferenceMap(monst, target.mapToMe, false_)) {
      monst.ticksUntilTurn = Math.imul(monst.attackSpeed, (monst.info.flags & MONST_CAST_SPELLS_SLOWLY) >>> 0 ? 2 : 1) << 16 >> 16;
      return;
    }
  }
  let dir = nextStep(target.mapToMe, monst.loc, monst, true_);
  if (dir === NO_DIRECTION) {
    dir = randValidDirectionFrom(monst, monst.loc.x, monst.loc.y, true_);
  }
  if (dir === NO_DIRECTION) {
    return;
  }
  let targetLoc = posNeighborInDirection(monst.loc, dir).$clone();
  await moveMonsterPassivelyTowards(monst, targetLoc.$clone(), (monst.creatureState >>> 0 !== MONSTER_ALLY ? 1 : 0) << 24 >> 24);
}

function creatureEligibleForSwarming(monst: struct_creature | null): number {
  if ((monst.info.flags & (MONST_IMMOBILE | MONST_GETS_TURN_ON_ACTIVATION | MONST_MAINTAINS_DISTANCE)) >>> 0 || monst.status[STATUS_ENTRANCED] || monst.status[STATUS_CONFUSED] || monst.status[STATUS_STUCK] || monst.status[STATUS_PARALYZED] || monst.status[STATUS_MAGICAL_FEAR] || monst.status[STATUS_LIFESPAN_REMAINING] === 1 || (monst.bookkeepingFlags & (MB_SEIZED | MB_SEIZING)) >>> 0) {
    return false_;
  }
  if (monst !== G.player && monst.creatureState >>> 0 !== MONSTER_ALLY && monst.creatureState >>> 0 !== MONSTER_TRACKING_SCENT) {
    return false_;
  }
  return true_;
}

function monsterSwarmDirection(monst: struct_creature | null, enemy: struct_creature | null): number {
  let dir = 0;
  let targetDir = 0;
  let dirList = $ta(Int16Array, 8, [0, 1, 2, 3, 4, 5, 6, 7]);
  let alternateDirectionExists = 0;
  if (monst === G.player || !creatureEligibleForSwarming(monst)) {
    return NO_DIRECTION;
  }
  if (distanceBetween(monst.loc, enemy.loc) !== 1 || (diagonalBlocked(monst.loc.x, monst.loc.y, enemy.loc.x, enemy.loc.y, false_) || (enemy.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) || !monstersAreEnemies(monst, enemy)) {
    return NO_DIRECTION;
  }
  targetDir = NO_DIRECTION;
  shuffleList(P(dirList), 4);
  shuffleList(P(dirList, 4), 4);
  for (let i = 0; 8 > i && targetDir === NO_DIRECTION; ++i) {
    dir = dirList[i];
    let newLoc = posNeighborInDirection(monst.loc, dir).$clone();
    if (isPosInMap(newLoc) && distanceBetween(enemy.loc, newLoc) === 1 && !((pmapAt(newLoc).flags & (HAS_PLAYER | HAS_MONSTER)) >>> 0) && !diagonalBlocked(monst.loc.x, monst.loc.y, newLoc.x, newLoc.y, false_) && (!diagonalBlocked(enemy.loc.x, enemy.loc.y, newLoc.x, newLoc.y, false_) || (enemy.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) && !monsterAvoids(monst, newLoc)) {
      targetDir = dir;
    }
  }
  if (targetDir === NO_DIRECTION) {
    return NO_DIRECTION;
  }
  let handledPlayer = false_;
  for (let it = iterateCreatures(G.monsters); !handledPlayer || hasNextCreature(it); ) {
    let ally = !handledPlayer ? G.player : nextCreature(it);
    handledPlayer = true_;
    if (ally !== monst && ally !== enemy && monstersAreTeammates(monst, ally) && monstersAreEnemies(ally, enemy) && creatureEligibleForSwarming(ally) && distanceBetween(monst.loc, ally.loc) === 1 && !diagonalBlocked(monst.loc.x, monst.loc.y, ally.loc.x, ally.loc.y, false_) && !monsterAvoids(ally, monst.loc) && (distanceBetween(enemy.loc, ally.loc) > 1 || diagonalBlocked(enemy.loc.x, enemy.loc.y, ally.loc.x, ally.loc.y, false_))) {
      alternateDirectionExists = false_;
      for (dir = 0; DIRECTION_COUNT > dir && !alternateDirectionExists; ++dir) {
        let newPos = posNeighborInDirection(ally.loc, dir).$clone();
        if (isPosInMap(newPos) && !((pmapAt(newPos).flags & (HAS_PLAYER | HAS_MONSTER)) >>> 0) && distanceBetween(enemy.loc, newPos) === 1 && !diagonalBlocked(enemy.loc.x, enemy.loc.y, newPos.x, newPos.y, false_) && !diagonalBlocked(ally.loc.x, ally.loc.y, newPos.x, newPos.y, false_) && !monsterAvoids(ally, newPos)) {
          alternateDirectionExists = true_;
        }
      }
      if (!alternateDirectionExists) {
        let foundConflict = false_;
        let handledPlayer = false_;
        for (let it2 = iterateCreatures(G.monsters); !handledPlayer || hasNextCreature(it2); ) {
          let otherEnemy = !handledPlayer ? G.player : nextCreature(it2);
          handledPlayer = true_;
          if (ally !== otherEnemy && monst !== otherEnemy && enemy !== otherEnemy && monstersAreEnemies(ally, otherEnemy) && distanceBetween(ally.loc, otherEnemy.loc) === 1 && (!diagonalBlocked(ally.loc.x, ally.loc.y, otherEnemy.loc.x, otherEnemy.loc.y, false_) || (otherEnemy.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0)) {
            foundConflict = true_;
            break;
          }
        }
        if (!foundConflict) {
          return targetDir;
        }
      }
    }
  }
  return NO_DIRECTION;
}

export async function perimeterCoords(n: number): Promise<struct_pos> {
  if (10 >= n) {
    return struct_pos.$of(n - 5 << 16 >> 16, -5);
  } else if (21 >= n) {
    return struct_pos.$of(n - 11 - 5 << 16 >> 16, 5);
  } else if (30 >= n) {
    return struct_pos.$of(-5, n - 22 - 4 << 16 >> 16);
  } else if (39 >= n) {
    return struct_pos.$of(5, n - 31 - 4 << 16 >> 16);
  } else {
    await message(S("ERROR! Bad perimeter coordinate request!"), REQUIRE_ACKNOWLEDGMENT);
    return struct_pos.$of();
  }
}

export async function monsterBlinkToPreferenceMap(monst: struct_creature | null, preferenceMap: Ptr | null, blinkUphill: number): Promise<number> {
  let i = 0;
  let nowPreference = 0;
  let maxDistance = 0;
  let gotOne = 0;
  let monstName = new Int8Array(79);
  let buf = new Int8Array(79);
  let theBoltType = 0;
  let theBolt = new struct_bolt();
  theBoltType = monsterHasBoltEffect(monst, BE_BLINKING);
  if (!theBoltType) {
    return false_;
  }
  maxDistance = staffBlinkDistance(327680);
  gotOne = false_;
  let origin = monst.loc.$clone();
  let bestTarget = struct_pos.$of().$clone();
  let bestPreference = $rd(preferenceMap.a[preferenceMap.o + monst.loc.x], monst.loc.y);
  for (i = 0; 4 > i; i = i + 1 << 16 >> 16) {
    let monstNeighborLoc = posNeighborInDirection(monst.loc, i).$clone();
    nowPreference = $rd(preferenceMap.a[preferenceMap.o + monstNeighborLoc.x], monstNeighborLoc.y);
    if ((blinkUphill && nowPreference > bestPreference || !blinkUphill && bestPreference > nowPreference) && !monsterAvoids(monst, monstNeighborLoc)) {
      bestPreference = nowPreference;
    }
  }
  for (i = 0; 40 > i; i = i + 1 << 16 >> 16) {
    let target = (await perimeterCoords(i)).$clone();
    target.x = target.x + monst.loc.x << 16 >> 16;
    target.y = target.y + monst.loc.y << 16 >> 16;
    let impact = new struct_pos();
    getImpactLoc(impact, origin.$clone(), target.$clone(), maxDistance, true_, $sadd(G.boltCatalog, BOLT_BLINKING));
    nowPreference = $rd(preferenceMap.a[preferenceMap.o + impact.x], impact.y);
    if ((blinkUphill && nowPreference > bestPreference || !blinkUphill && bestPreference > nowPreference) && !monsterAvoids(monst, impact)) {
      bestTarget.$cp(target);
      bestPreference = nowPreference;
      if (Math.abs(impact.x - origin.x) > 1 || Math.abs(impact.y - origin.y) > 1 || cellHasTerrainFlag(struct_pos.$of(impact.x, origin.y), T_OBSTRUCTS_PASSABILITY) || cellHasTerrainFlag(struct_pos.$of(origin.x, impact.y), T_OBSTRUCTS_PASSABILITY)) {
        gotOne = true_;
      } else {
        gotOne = false_;
      }
    }
  }
  if (gotOne) {
    if (canDirectlySeeMonster(monst)) {
      monsterName(P(monstName), monst, true_);
      sprintf(P(buf), S("%s blinks"), P(monstName));
      await combatMessage(P(buf), null);
    }
    monst.ticksUntilTurn = Math.imul(monst.attackSpeed, (monst.info.flags & MONST_CAST_SPELLS_SLOWLY) >>> 0 ? 2 : 1) << 16 >> 16;
    theBolt.$cp($sadd(G.boltCatalog, theBoltType));
    await zap(origin.$clone(), bestTarget.$clone(), theBolt, false_, false_);
    return true_;
  }
  return false_;
}

function fleeingMonsterAwareOfPlayer(monst: struct_creature | null): number {
  if (G.player.status[STATUS_INVISIBLE]) {
    return (distanceBetween(monst.loc, G.player.loc) <= 1 ? 1 : 0) << 24 >> 24;
  } else {
    return ((pmapAt(monst.loc).flags & IN_FIELD_OF_VIEW) >>> 0 ? true_ : false_) << 24 >> 24;
  }
}

function getSafetyMap(monst: struct_creature | null): Ptr | null {
  if (fleeingMonsterAwareOfPlayer(monst)) {
    if (monst.safetyMap) {
      freeGrid(monst.safetyMap);
      monst.safetyMap = null;
    }
    if (!G.rogue.updatedSafetyMapThisTurn) {
      updateSafetyMap();
    }
    return G.safetyMap;
  } else {
    if (!monst.safetyMap) {
      if (!G.rogue.updatedSafetyMapThisTurn) {
        updateSafetyMap();
      }
      monst.safetyMap = allocGrid();
      copyGrid(monst.safetyMap, G.safetyMap);
    }
    return monst.safetyMap;
  }
}

async function monsterBlinkToSafety(monst: struct_creature | null): Promise<number> {
  let blinkSafetyMap = null;
  if (monst.creatureState >>> 0 === MONSTER_ALLY) {
    if (!G.rogue.updatedAllySafetyMapThisTurn) {
      updateAllySafetyMap();
    }
    blinkSafetyMap = G.allySafetyMap;
  } else {
    blinkSafetyMap = getSafetyMap(monst);
  }
  return await monsterBlinkToPreferenceMap(monst, blinkSafetyMap, false_);
}

export async function monsterSummons(monst: struct_creature | null, alwaysUse: number): Promise<number> {
  let minionCount = 0;
  if ((monst.info.abilityFlags & MA_CAST_SUMMON) >>> 0) {
    for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
      let target = nextCreature(it);
      if (monst.creatureState >>> 0 === MONSTER_ALLY) {
        if (target.creatureState >>> 0 === MONSTER_ALLY) {
          minionCount = minionCount + 1 << 16 >> 16;
        }
      } else if ((target.bookkeepingFlags & MB_FOLLOWER) >>> 0 && target.leader === monst) {
        minionCount = minionCount + 1 << 16 >> 16;
      }
    }
    if (monst.creatureState >>> 0 === MONSTER_ALLY) {
      if (G.rogue.depthLevel > 1) {
        for (let it = iterateCreatures($sadd(G.levels, (G.rogue.depthLevel - 2)).monsters); hasNextCreature(it); ) {
          let target = nextCreature(it);
          if (target.creatureState >>> 0 === MONSTER_ALLY && !((target.info.flags & MONST_WILL_NOT_USE_STAIRS) >>> 0)) {
            minionCount = minionCount + 1 << 16 >> 16;
          }
        }
      }
      if (G.gameConst.deepestLevel > G.rogue.depthLevel) {
        for (let it = iterateCreatures($sadd(G.levels, G.rogue.depthLevel).monsters); hasNextCreature(it); ) {
          let target = nextCreature(it);
          if (target.creatureState >>> 0 === MONSTER_ALLY && !((target.info.flags & MONST_WILL_NOT_USE_STAIRS) >>> 0)) {
            minionCount = minionCount + 1 << 16 >> 16;
          }
        }
      }
    }
    if (alwaysUse && 50 > minionCount) {
      await summonMinions(monst);
      return true_;
    } else if ((monst.info.abilityFlags & MA_ENTER_SUMMONS) >>> 0) {
      if (!rand_range(0, 7)) {
        await summonMinions(monst);
        return true_;
      }
    } else if ((monst.creatureState >>> 0 !== MONSTER_ALLY || 5 > minionCount) && !rand_range(0, Math.imul(minionCount, minionCount) * 3 + 1)) {
      await summonMinions(monst);
      return true_;
    }
  }
  return false_;
}

export function canNegateCreatureStatusEffects(monst: struct_creature | null): number {
  if (!monst || (monst.info.flags & MONST_INVULNERABLE) >>> 0) {
    return false_;
  }
  let hasNegatableStatusEffect = false_;
  for (let i = 0; NUMBER_OF_STATUS_EFFECTS > i; ++i) {
    let theStatus = i;
    if (monst.status[theStatus] > 0 && G.statusEffectCatalog[theStatus].isNegatable) {
      hasNegatableStatusEffect = true_;
    }
  }
  return hasNegatableStatusEffect;
}

export async function negateCreatureStatusEffects(monst: struct_creature | null): Promise<void> {
  if (!monst || (monst.info.flags & MONST_INVULNERABLE) >>> 0) {
    return;
  }
  for (let i = 0; NUMBER_OF_STATUS_EFFECTS > i; ++i) {
    let theStatus = i;
    if (monst.status[theStatus] > 0 && G.statusEffectCatalog[theStatus].isNegatable) {
      monst.status[theStatus] = (monst === G.player ? G.statusEffectCatalog[theStatus].playerNegatedValue : 0) << 16 >> 16;
      if (theStatus >>> 0 === STATUS_DARKNESS && monst === G.player) {
        updateMinersLightRadius();
        await updateVision(true_);
      }
    }
  }
}

export function monsterIsNegatable(monst: struct_creature | null): number {
  if ((monst.info.flags & MONST_INVULNERABLE) >>> 0) {
    return false_;
  }
  if ((monst.info.abilityFlags & ~MA_NON_NEGATABLE_ABILITIES >>> 0) >>> 0 || (monst.bookkeepingFlags & MB_SEIZING) >>> 0 || (monst.info.flags & MONST_DIES_IF_NEGATED) >>> 0 || (monst.info.flags & NEGATABLE_TRAITS) >>> 0 || (monst.info.flags & MONST_IMMUNE_TO_FIRE) >>> 0 || (monst.info.flags & MONST_FIERY) >>> 0 && monst.status[STATUS_BURNING] || canNegateCreatureStatusEffects(monst) || monst.movementSpeed !== monst.info.movementSpeed || monst.attackSpeed !== monst.info.attackSpeed || monst.mutationIndex > -1 && G.mutationCatalog[monst.mutationIndex].canBeNegated) {
    return true_;
  }
  for (let i = 0; 20 > i; ++i) {
    if (monst.info.bolts[i] >>> 0 && !(($sadd(G.boltCatalog, monst.info.bolts[i]).flags & BF_NOT_NEGATABLE) >>> 0)) {
      return true_;
    }
  }
  return false_;
}

function generallyValidBoltTarget(caster: struct_creature | null, target: struct_creature | null): number {
  if (caster === target) {
    return false_;
  }
  if (caster.status[STATUS_DISCORDANT] && caster.creatureState >>> 0 === MONSTER_WANDERING && target === G.player) {
    return false_;
  }
  if (caster.creatureState >>> 0 === MONSTER_ALLY && !caster.status[STATUS_DISCORDANT] && (target.bookkeepingFlags & MB_MARKED_FOR_SACRIFICE) >>> 0) {
    return false_;
  }
  if (monsterIsHidden(target, caster) || (target.bookkeepingFlags & MB_SUBMERGED) >>> 0) {
    return false_;
  }
  return openPathBetween(caster.loc.$clone(), target.loc.$clone());
}

function targetEligibleForCombatBuff(caster: struct_creature | null, target: struct_creature | null): number {
  if (caster.creatureState >>> 0 === MONSTER_ALLY) {
    if (canDirectlySeeMonster(caster)) {
      let handledPlayer = false_;
      for (let it = iterateCreatures(G.monsters); !handledPlayer || hasNextCreature(it); ) {
        let enemy = !handledPlayer ? G.player : nextCreature(it);
        handledPlayer = true_;
        if (monstersAreEnemies(G.player, enemy) && canSeeMonster(enemy) && (pmapAt(enemy.loc).flags & IN_FIELD_OF_VIEW) >>> 0) {
          return true_;
        }
      }
    }
    return false_;
  } else {
    return (target.creatureState >>> 0 === MONSTER_TRACKING_SCENT ? 1 : 0) << 24 >> 24;
  }
}

function specificallyValidBoltTarget(caster: struct_creature | null, target: struct_creature | null, theBoltType: number): number {
  if (($sadd(G.boltCatalog, theBoltType).flags & BF_TARGET_ALLIES) >>> 0 && (!monstersAreTeammates(caster, target) || monstersAreEnemies(caster, target))) {
    return false_;
  }
  if (($sadd(G.boltCatalog, theBoltType).flags & BF_TARGET_ENEMIES) >>> 0 && !monstersAreEnemies(caster, target)) {
    return false_;
  }
  if (($sadd(G.boltCatalog, theBoltType).flags & BF_TARGET_ENEMIES) >>> 0 && (target.info.flags & MONST_INVULNERABLE) >>> 0) {
    return false_;
  }
  if (((target.info.flags & MONST_REFLECT_50) >>> 0 || (target.info.abilityFlags & MA_REFLECT_100) >>> 0) && target.creatureState >>> 0 !== MONSTER_ALLY && !(($sadd(G.boltCatalog, theBoltType).flags & (BF_NEVER_REFLECTS | BF_HALTS_BEFORE_OBSTRUCTION)) >>> 0)) {
    return false_;
  }
  if (($sadd(G.boltCatalog, theBoltType).forbiddenMonsterFlags & target.info.flags) >>> 0) {
    return false_;
  }
  if (($sadd(G.boltCatalog, theBoltType).flags & BF_FIERY) >>> 0 && target.status[STATUS_IMMUNE_TO_FIRE]) {
    return false_;
  }
  if (($sadd(G.boltCatalog, theBoltType).flags & BF_FIERY) >>> 0 && (burnedTerrainFlagsAtLoc(caster.loc) & avoidedFlagsForMonster(caster.info)) >>> 0) {
    return false_;
  }
  switch ($sadd(G.boltCatalog, theBoltType).boltEffect) {
  case BE_BECKONING:
    if (distanceBetween(caster.loc, target.loc) <= 1) {
      return false_;
    }
    break;
  case BE_ATTACK:
    if (cellHasTerrainFlag(target.loc, T_OBSTRUCTS_PASSABILITY) && !((target.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0)) {
      return false_;
    }
  case BE_DAMAGE:
    if (target.status[STATUS_ENTRANCED] && monstersAreEnemies(caster, target)) {
      return false_;
    }
    break;
  case BE_NONE:
    if ($sadd(G.boltCatalog, theBoltType).targetDF) {
      let terrainFlags = G.tileCatalog[G.dungeonFeatureCatalog[$sadd(G.boltCatalog, theBoltType).targetDF].tile].flags;
      if ((terrainFlags & T_ENTANGLES) >>> 0 && target.status[STATUS_STUCK]) {
        return false_;
      }
      if (($sadd(G.boltCatalog, theBoltType).flags & BF_TARGET_ENEMIES) >>> 0 && !((terrainFlags & avoidedFlagsForMonster(target.info)) >>> 0) && (!((terrainFlags & T_ENTANGLES) >>> 0) || (target.info.flags & MONST_IMMUNE_TO_WEBS) >>> 0)) {
        return false_;
      }
    }
    break;
  case BE_DISCORD:
    if (target.status[STATUS_DISCORDANT] || target === G.player) {
      return false_;
    }
    break;
  case BE_NEGATION:
    if (monstersAreEnemies(caster, target)) {
      if (target.status[STATUS_HASTED] || target.status[STATUS_TELEPATHIC] || target.status[STATUS_SHIELDED]) {
        return true_;
      }
      if ((target.info.flags & (MONST_DIES_IF_NEGATED | MONST_IMMUNE_TO_WEAPONS)) >>> 0) {
        return true_;
      }
      if ((target.status[STATUS_IMMUNE_TO_FIRE] || target.status[STATUS_LEVITATING]) && cellHasTerrainFlag(target.loc, T_LAVA_INSTA_DEATH | T_IS_DEEP_WATER | T_AUTO_DESCENT)) {
        return true_;
      }
      if (monstersAreTeammates(caster, target) && target.status[STATUS_DISCORDANT] && !caster.status[STATUS_DISCORDANT] && !((target.info.flags & MONST_DIES_IF_NEGATED) >>> 0)) {
        return true_;
      }
    } else if (monstersAreTeammates(caster, target)) {
      if (target === G.player && G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0 && (G.rogue.armor.flags & ITEM_RUNIC_IDENTIFIED) >>> 0 && G.rogue.armor.enchant2 === A_REFLECTION && netEnchant(G.rogue.armor) > 0) {
        return false_;
      }
      if ((target.info.flags & MONST_DIES_IF_NEGATED) >>> 0) {
        return false_;
      }
      if (target.status[STATUS_ENTRANCED] && caster.creatureState >>> 0 !== MONSTER_ALLY) {
        return true_;
      }
      if (target.status[STATUS_MAGICAL_FEAR]) {
        return true_;
      }
    }
    return false_;
    break;
  case BE_SLOW:
    if (target.status[STATUS_SLOWED]) {
      return false_;
    }
    break;
  case BE_HASTE:
    if (target.status[STATUS_HASTED]) {
      return false_;
    }
    if (!targetEligibleForCombatBuff(caster, target)) {
      return false_;
    }
    break;
  case BE_SHIELDING:
    if (target.status[STATUS_SHIELDED]) {
      return false_;
    }
    if (!targetEligibleForCombatBuff(caster, target)) {
      return false_;
    }
    break;
  case BE_HEALING:
    if (target.currentHP >= target.info.maxHP) {
      return false_;
    }
    break;
  case BE_TUNNELING:
  case BE_OBSTRUCTION:
    return false_;
    break;
  default:
    break;
  }
  return true_;
}

async function monsterCastSpell(caster: struct_creature | null, target: struct_creature | null, boltIndex: number): Promise<void> {
  let theBolt = new struct_bolt();
  let buf = new Int8Array(200);
  let monstName = new Int8Array(100);
  if (canDirectlySeeMonster(caster)) {
    monsterName(P(monstName), caster, true_);
    sprintf(P(buf), S("%s %s"), P(monstName), P($sadd(G.boltCatalog, boltIndex).description));
    resolvePronounEscapes(P(buf), caster);
    await combatMessage(P(buf), null);
  }
  theBolt.$cp($sadd(G.boltCatalog, boltIndex));
  let originLoc = caster.loc.$clone();
  let targetLoc = target.loc.$clone();
  await zap(originLoc.$clone(), targetLoc.$clone(), theBolt, false_, false_);
  if (0 >= G.player.currentHP) {
    await gameOver(P(G.monsterCatalog[caster.info.monsterID].monsterName), false_);
  }
}

async function monstUseBolt(monst: struct_creature | null): Promise<number> {
  let i = 0;
  if (!monst.info.bolts[0]) {
    return false_;
  }
  let handledPlayer = false_;
  for (let it = iterateCreatures(G.monsters); !handledPlayer || hasNextCreature(it); ) {
    let target = !handledPlayer ? G.player : nextCreature(it);
    handledPlayer = true_;
    if (generallyValidBoltTarget(monst, target)) {
      for (i = 0; monst.info.bolts[i]; i = i + 1 << 16 >> 16) {
        if ($sadd(G.boltCatalog, monst.info.bolts[i]).boltEffect === BE_BLINKING) {
          continue;
        }
        if (specificallyValidBoltTarget(monst, target, monst.info.bolts[i])) {
          if ((monst.info.flags & MONST_ALWAYS_USE_ABILITY) >>> 0 || rand_percent(30)) {
            await monsterCastSpell(monst, target, monst.info.bolts[i]);
            return true_;
          }
        }
      }
    }
  }
  return false_;
}

async function monstUseMagic(monst: struct_creature | null): Promise<number> {
  if (await monsterSummons(monst, ((monst.info.flags & MONST_ALWAYS_USE_ABILITY) >>> 0) << 24 >> 24)) {
    return true_;
  } else if (await monstUseBolt(monst)) {
    return true_;
  }
  return false_;
}

function isLocalScentMaximum(loc: struct_pos): number {
  let baselineScent = $rd(G.scentMap.a[G.scentMap.o + loc.x], loc.y);
  for (let dir = 0; DIRECTION_COUNT > dir; ++dir) {
    let newLoc = posNeighborInDirection(loc, dir).$clone();
    if (isPosInMap(newLoc) && $rd(G.scentMap.a[G.scentMap.o + newLoc.x], newLoc.y) > baselineScent && !cellHasTerrainFlag(newLoc, T_OBSTRUCTS_PASSABILITY) && !diagonalBlocked(loc.x, loc.y, newLoc.x, newLoc.y, false_)) {
      return false_;
    }
  }
  return true_;
}

function scentDirection(monst: struct_creature | null): number {
  let newX = 0;
  let newY = 0;
  let x = 0;
  let y = 0;
  let newestX = 0;
  let newestY = 0;
  let bestDirection = NO_DIRECTION;
  let dir = 0;
  let dir2 = 0;
  let bestNearbyScent = 0;
  let canTryAgain = true_;
  let otherMonst = null;
  x = monst.loc.x;
  y = monst.loc.y;
  for (; ; ) {
    for (dir = 0; DIRECTION_COUNT > dir; ++dir) {
      newX = x + G.nbDirs[dir][0] << 16 >> 16;
      newY = y + G.nbDirs[dir][1] << 16 >> 16;
      otherMonst = monsterAtLoc(struct_pos.$of(newX, newY));
      if (coordinatesAreInMap(newX, newY) && $rd(G.scentMap.a[G.scentMap.o + newX], newY) > bestNearbyScent && (!(($at2(G.pmap, newX, newY).flags & HAS_MONSTER) >>> 0) || otherMonst && canPass(monst, otherMonst)) && !cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY) && !diagonalBlocked(x, y, newX, newY, false_) && !monsterAvoids(monst, struct_pos.$of(newX, newY))) {
        bestNearbyScent = $rd(G.scentMap.a[G.scentMap.o + newX], newY) & 0xffff;
        bestDirection = dir;
      }
    }
    if (bestDirection >= 0 && bestNearbyScent > $rd(G.scentMap.a[G.scentMap.o + x], y)) {
      return bestDirection;
    }
    if (canTryAgain) {
      canTryAgain = false_;
      for (dir = 0; 4 > dir; ++dir) {
        newX = x + G.nbDirs[dir][0] << 16 >> 16;
        newY = y + G.nbDirs[dir][1] << 16 >> 16;
        for (dir2 = 0; 4 > dir2; ++dir2) {
          newestX = newX + G.nbDirs[dir2][0] << 16 >> 16;
          newestY = newY + G.nbDirs[dir2][1] << 16 >> 16;
          if (coordinatesAreInMap(newX, newY) && coordinatesAreInMap(newestX, newestY)) {
            $wr(G.scentMap.a[G.scentMap.o + newX], newY, ($rd(G.scentMap.a[G.scentMap.o + newX], newY) > $rd(G.scentMap.a[G.scentMap.o + newestX], newestY) - 1 ? $rd(G.scentMap.a[G.scentMap.o + newX], newY) : $rd(G.scentMap.a[G.scentMap.o + newestX], newestY) - 1) << 16 >> 16);
          }
        }
      }
    } else {
      return NO_DIRECTION;
    }
  }
}

export async function resurrectAlly(loc: struct_pos): Promise<number> {
  let $t1: any;
  let allyIterator = iterateCreatures(G.purgatory).$clone();
  let monToCheck = null;
  let monToRaise = null;
  while (monToCheck = nextCreature(allyIterator)) {
    if (!monToRaise || monToCheck.totalPowerCount > monToRaise.totalPowerCount || monToCheck.totalPowerCount === monToRaise.totalPowerCount && monToCheck.info.monsterID >>> 0 > monToRaise.info.monsterID >>> 0) {
      monToRaise = monToCheck;
    }
  }
  if (monToRaise) {
    removeCreature(G.purgatory, monToRaise);
    prependCreature(G.monsters, monToRaise);
    monToRaise.loc.$cp(getQualifyingPathLocNear(loc.$clone(), true_, T_PATHING_BLOCKER | T_HARMFUL_TERRAIN, 0, 0, HAS_PLAYER | HAS_MONSTER, false_));
    ($t1 = pmapAt(monToRaise.loc), $t1.flags = ($t1.flags | HAS_MONSTER) >>> 0);
    monToRaise.bookkeepingFlags = (monToRaise.bookkeepingFlags & ~(MB_IS_DYING | MB_ADMINISTRATIVE_DEATH | MB_HAS_DIED | MB_IS_FALLING) >>> 0) >>> 0;
    if (!((monToRaise.info.flags & MONST_FIERY) >>> 0) && monToRaise.status[STATUS_BURNING]) {
      monToRaise.status[STATUS_BURNING] = 0;
    }
    monToRaise.status[STATUS_DISCORDANT] = 0;
    await heal(monToRaise, 100, true_);
    if ((G.monsterCatalog[monToRaise.info.monsterID].abilityFlags & MA_ENTER_SUMMONS) >>> 0) {
      monToRaise.info.$cp(G.monsterCatalog[monToRaise.info.monsterID]);
      initializeStatus(monToRaise);
      monToRaise.wasNegated = false_;
    }
    return true_;
  } else {
    return false_;
  }
}

export function unAlly(monst: struct_creature | null): void {
  if (monst.creatureState >>> 0 === MONSTER_ALLY) {
    monst.creatureState = MONSTER_TRACKING_SCENT;
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~(MB_FOLLOWER | MB_TELEPATHICALLY_REVEALED) >>> 0) >>> 0;
    monst.leader = null;
  }
}

export function monsterFleesFrom(monst: struct_creature | null, defender: struct_creature | null): number {
  let x = monst.loc.x;
  let y = monst.loc.y;
  if (!monsterWillAttackTarget(defender, monst)) {
    return false_;
  }
  if (distanceBetween(struct_pos.$of(x, y), defender.loc) >= 4) {
    return false_;
  }
  if ((defender.info.flags & (MONST_IMMUNE_TO_WEAPONS | MONST_INVULNERABLE)) >>> 0 && !((defender.info.flags & MONST_IMMOBILE) >>> 0)) {
    return true_;
  }
  if (monst.creatureState >>> 0 === MONSTER_ALLY && !monst.status[STATUS_DISCORDANT] && (defender.bookkeepingFlags & MB_MARKED_FOR_SACRIFICE) >>> 0) {
    return true_;
  }
  if ((monst.info.flags & MONST_MAINTAINS_DISTANCE) >>> 0 || (defender.info.abilityFlags & MA_KAMIKAZE) >>> 0) {
    return true_;
  }
  if ((monst.info.abilityFlags & MA_POISONS) >>> 0 && Math.imul(defender.status[STATUS_POISONED], defender.poisonAmount) > defender.currentHP) {
    return true_;
  }
  return false_;
}

function allyFlees(ally: struct_creature | null, closestEnemy: struct_creature | null): number {
  let x = ally.loc.x;
  let y = ally.loc.y;
  if (!closestEnemy) {
    return false_;
  }
  if (1 >= ally.info.maxHP || ally.status[STATUS_LIFESPAN_REMAINING] > 0) {
    return false_;
  }
  if (distanceBetween(struct_pos.$of(x, y), closestEnemy.loc) < 10 && 33 >= (100 * ally.currentHP / ally.info.maxHP | 0) && ally.info.turnsBetweenRegen > 0 && !ally.carriedMonster && ((ally.info.flags & MONST_FLEES_NEAR_DEATH) >>> 0 || (100 * G.player.currentHP / G.player.info.maxHP | 0) > (100 * ally.currentHP / ally.info.maxHP | 0) * 2)) {
    return true_;
  }
  if (monsterFleesFrom(ally, closestEnemy)) {
    return true_;
  }
  return false_;
}

async function monsterMillAbout(monst: struct_creature | null, movementChance: number): Promise<void> {
  let dir = 0;
  let x = monst.loc.x;
  let y = monst.loc.y;
  if (rand_percent(movementChance)) {
    dir = randValidDirectionFrom(monst, x, y, true_);
    if (dir !== -1) {
      let targetLoc = struct_pos.$of(x + G.nbDirs[dir][0] << 16 >> 16, y + G.nbDirs[dir][1] << 16 >> 16);
      await moveMonsterPassivelyTowards(monst, targetLoc.$clone(), false_);
    }
  }
}

async function moveAlly(monst: struct_creature | null): Promise<void> {
  let closestMonster = null;
  let i = 0;
  let j = 0;
  let x = 0;
  let y = 0;
  let dir = 0;
  let shortestDistance = 0;
  let leashLength = 0;
  let enemyMap = null;
  let costMap = null;
  let buf = new Int8Array(79);
  let monstName = new Int8Array(79);
  x = monst.loc.x;
  y = monst.loc.y;
  let targetLoc = struct_pos.$of(-1, -1).$clone();
  if (!monst.leader) {
    monst.leader = G.player;
    monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_FOLLOWER) >>> 0;
  }
  if (cellHasTerrainFlag(struct_pos.$of(x, y), T_HARMFUL_TERRAIN & ~(T_IS_FIRE | T_CAUSES_DAMAGE | T_CAUSES_PARALYSIS | T_CAUSES_CONFUSION)) || cellHasTerrainFlag(struct_pos.$of(x, y), T_IS_FIRE) && !monst.status[STATUS_IMMUNE_TO_FIRE] || cellHasTerrainFlag(struct_pos.$of(x, y), T_CAUSES_DAMAGE | T_CAUSES_PARALYSIS | T_CAUSES_CONFUSION) && !((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
    if (!G.rogue.updatedMapToSafeTerrainThisTurn) {
      updateSafeTerrainMap();
    }
    if (await monsterBlinkToPreferenceMap(monst, G.rogue.mapToSafeTerrain, false_)) {
      monst.ticksUntilTurn = Math.imul(monst.attackSpeed, (monst.info.flags & MONST_CAST_SPELLS_SLOWLY) >>> 0 ? 2 : 1) << 16 >> 16;
      return;
    }
    dir = nextStep(G.rogue.mapToSafeTerrain, struct_pos.$of(x, y), monst, true_);
    if (dir !== -1) {
      targetLoc.$cp(struct_pos.$of(x + G.nbDirs[dir][0] << 16 >> 16, y + G.nbDirs[dir][1] << 16 >> 16));
      if (await moveMonsterPassivelyTowards(monst, targetLoc.$clone(), false_)) {
        return;
      }
    }
  }
  shortestDistance = (31 + 3 - 3 - 2 > 100 - 20 - 1 ? 31 + 3 - 3 - 2 : 100 - 20 - 1) << 16 >> 16;
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let target = nextCreature(it);
    if (target !== monst && (!((target.bookkeepingFlags & MB_SUBMERGED) >>> 0) || (monst.bookkeepingFlags & MB_SUBMERGED) >>> 0) && monsterWillAttackTarget(monst, target) && distanceBetween(struct_pos.$of(x, y), target.loc) < shortestDistance && traversiblePathBetween(monst, target.loc.x, target.loc.y) && (!cellHasTerrainFlag(target.loc, T_OBSTRUCTS_PASSABILITY) || (target.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) && (!target.status[STATUS_INVISIBLE] || rand_percent(33))) {
      shortestDistance = distanceBetween(struct_pos.$of(x, y), target.loc);
      closestMonster = target;
    }
  }
  if (allyFlees(monst, closestMonster)) {
    if (monsterHasBoltEffect(monst, BE_BLINKING) >>> 0 && ((monst.info.flags & MONST_ALWAYS_USE_ABILITY) >>> 0 || rand_percent(30)) && await monsterBlinkToSafety(monst)) {
      return;
    }
    if (await monsterSummons(monst, ((monst.info.flags & MONST_ALWAYS_USE_ABILITY) >>> 0) << 24 >> 24)) {
      return;
    }
    if (!G.rogue.updatedAllySafetyMapThisTurn) {
      updateAllySafetyMap();
    }
    dir = nextStep(G.allySafetyMap, monst.loc, monst, true_);
    if (dir !== -1) {
      targetLoc.$cp(struct_pos.$of(x + G.nbDirs[dir][0] << 16 >> 16, y + G.nbDirs[dir][1] << 16 >> 16));
    }
    if (dir === -1 || $rd(G.allySafetyMap.a[G.allySafetyMap.o + targetLoc.x], targetLoc.y) >= $rd(G.allySafetyMap.a[G.allySafetyMap.o + x], y) || !await moveMonster(monst, G.nbDirs[dir][0], G.nbDirs[dir][1]) && !await moveMonsterPassivelyTowards(monst, targetLoc.$clone(), true_)) {
    } else {
      return;
    }
  }
  if (await monstUseMagic(monst)) {
    monst.ticksUntilTurn = Math.imul(monst.attackSpeed, (monst.info.flags & MONST_CAST_SPELLS_SLOWLY) >>> 0 ? 2 : 1) << 16 >> 16;
    return;
  }
  if ((monst.bookkeepingFlags & MB_SEIZED) >>> 0) {
    leashLength = (100 - 20 - 1 > 31 + 3 - 3 - 2 ? 100 - 20 - 1 : 31 + 3 - 3 - 2) << 16 >> 16;
  } else if (G.rogue.justRested || G.rogue.justSearched) {
    leashLength = 10;
  } else {
    leashLength = 4;
  }
  if (shortestDistance === 1) {
    if (monst.movementSpeed > closestMonster.movementSpeed && !((closestMonster.info.flags & (MONST_FLITS | MONST_IMMOBILE)) >>> 0) && closestMonster.creatureState >>> 0 === MONSTER_TRACKING_SCENT) {
      leashLength = (100 - 20 - 1 > 31 + 3 - 3 - 2 ? 100 - 20 - 1 : 31 + 3 - 3 - 2) << 16 >> 16;
    } else {
      leashLength = leashLength + 1 << 16 >> 16;
    }
  }
  if (closestMonster && (distanceBetween(struct_pos.$of(x, y), G.player.loc) < leashLength || (monst.bookkeepingFlags & MB_DOES_NOT_TRACK_LEADER) >>> 0) && !((monst.info.flags & MONST_MAINTAINS_DISTANCE) >>> 0) && !attackWouldBeFutile(monst, closestMonster)) {
    if (monsterHasBoltEffect(monst, BE_BLINKING) >>> 0 && ((monst.info.flags & MONST_ALWAYS_USE_ABILITY) >>> 0 || rand_percent(30))) {
      enemyMap = allocGrid();
      costMap = allocGrid();
      for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
        for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
          if (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_PASSABILITY)) {
            $wr(costMap.a[costMap.o + i], j, (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_DIAGONAL_MOVEMENT) ? PDS_OBSTRUCTION : PDS_FORBIDDEN) << 16 >> 16);
            $wr(enemyMap.a[enemyMap.o + i], j, 0);
          } else if (monsterAvoids(monst, struct_pos.$of(i, j))) {
            $wr(costMap.a[costMap.o + i], j, PDS_FORBIDDEN);
            $wr(enemyMap.a[enemyMap.o + i], j, 0);
          } else {
            $wr(costMap.a[costMap.o + i], j, 1);
            $wr(enemyMap.a[enemyMap.o + i], j, 10000);
          }
        }
      }
      for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
        let target = nextCreature(it);
        if (target !== monst && (!((target.bookkeepingFlags & MB_SUBMERGED) >>> 0) || (monst.bookkeepingFlags & MB_SUBMERGED) >>> 0) && monsterWillAttackTarget(monst, target) && distanceBetween(struct_pos.$of(x, y), target.loc) < shortestDistance && traversiblePathBetween(monst, target.loc.x, target.loc.y) && (!monsterAvoids(monst, target.loc) || (target.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) && (!target.status[STATUS_INVISIBLE] || ((monst.info.flags & MONST_ALWAYS_USE_ABILITY) >>> 0 || rand_percent(33)))) {
          $wr(enemyMap.a[enemyMap.o + target.loc.x], target.loc.y, 0);
          $wr(costMap.a[costMap.o + target.loc.x], target.loc.y, 1);
        }
      }
      dijkstraScan(enemyMap, costMap, true_);
      freeGrid(costMap);
      if (await monsterBlinkToPreferenceMap(monst, enemyMap, false_)) {
        monst.ticksUntilTurn = Math.imul(monst.attackSpeed, (monst.info.flags & MONST_CAST_SPELLS_SLOWLY) >>> 0 ? 2 : 1) << 16 >> 16;
        freeGrid(enemyMap);
        return;
      }
      freeGrid(enemyMap);
    }
    targetLoc.$cp(closestMonster.loc);
    await moveMonsterPassivelyTowards(monst, targetLoc.$clone(), true_);
  } else if (isPosInMap(monst.targetCorpseLoc) && !monst.status[STATUS_POISONED] && (!monst.status[STATUS_BURNING] || monst.status[STATUS_IMMUNE_TO_FIRE])) {
    await moveMonsterPassivelyTowards(monst, monst.targetCorpseLoc.$clone(), false_);
    if (posEq(monst.loc, monst.targetCorpseLoc) && !((monst.bookkeepingFlags & MB_ABSORBING) >>> 0)) {
      if (canSeeMonster(monst)) {
        monsterName(P(monstName), monst, true_);
        sprintf(P(buf), S("%s begins %s the fallen %s."), P(monstName), P(G.monsterText[monst.info.monsterID].absorbing), P(monst.targetCorpseName));
        await messageWithColor(P(buf), G.goodMessageColor, 0);
      }
      monst.corpseAbsorptionCounter = 20;
      monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_ABSORBING) >>> 0;
    }
  } else if ((monst.bookkeepingFlags & MB_DOES_NOT_TRACK_LEADER) >>> 0 || distanceBetween(struct_pos.$of(x, y), G.player.loc) < 3 && ($at2(G.pmap, x, y).flags & IN_FIELD_OF_VIEW) >>> 0) {
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_GIVEN_UP_ON_SCENT >>> 0) >>> 0;
    await monsterMillAbout(monst, 30);
  } else {
    if (!((monst.bookkeepingFlags & MB_GIVEN_UP_ON_SCENT) >>> 0) && distanceBetween(struct_pos.$of(x, y), G.player.loc) > 10 && await monsterBlinkToPreferenceMap(monst, G.scentMap, true_)) {
      monst.ticksUntilTurn = Math.imul(monst.attackSpeed, (monst.info.flags & MONST_CAST_SPELLS_SLOWLY) >>> 0 ? 2 : 1) << 16 >> 16;
      return;
    }
    dir = scentDirection(monst) << 16 >> 16;
    if (dir === -1 || (monst.bookkeepingFlags & MB_GIVEN_UP_ON_SCENT) >>> 0) {
      monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_GIVEN_UP_ON_SCENT) >>> 0;
      await pathTowardCreature(monst, monst.leader);
    } else {
      targetLoc.$cp(struct_pos.$of(x + G.nbDirs[dir][0] << 16 >> 16, y + G.nbDirs[dir][1] << 16 >> 16));
      await moveMonsterPassivelyTowards(monst, targetLoc.$clone(), false_);
    }
  }
}

async function updateMonsterCorpseAbsorption(monst: struct_creature | null): Promise<number> {
  let i = 0;
  let buf = new Int8Array(100);
  let buf2 = new Int8Array(100);
  if (posEq(monst.loc, monst.targetCorpseLoc) && (monst.bookkeepingFlags & MB_ABSORBING) >>> 0) {
    if ((monst.corpseAbsorptionCounter = monst.corpseAbsorptionCounter - 1 << 16 >> 16) <= 0) {
      monst.targetCorpseLoc.$cp(struct_pos.$of(-1, -1));
      if (monst.absorptionBolt !== BOLT_NONE) {
        for (i = 0; monst.info.bolts[i] >>> 0 !== BOLT_NONE; i = i + 1 << 16 >> 16) {
          ;
        }
        monst.info.bolts[i] = monst.absorptionBolt;
      } else if (monst.absorbBehavior) {
        monst.info.flags = (monst.info.flags | monst.absorptionFlags) >>> 0;
      } else {
        monst.info.abilityFlags = (monst.info.abilityFlags | monst.absorptionFlags) >>> 0;
      }
      monst.newPowerCount = monst.newPowerCount - 1 << 16 >> 16;
      monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_ABSORBING >>> 0) >>> 0;
      if ((monst.info.flags & MONST_FIERY) >>> 0) {
        monst.status[STATUS_BURNING] = monst.maxStatus[STATUS_BURNING] = 1000;
      }
      if ((monst.info.flags & MONST_FLIES) >>> 0) {
        monst.status[STATUS_LEVITATING] = monst.maxStatus[STATUS_LEVITATING] = 1000;
        monst.info.flags = (monst.info.flags & ~(MONST_RESTRICTED_TO_LIQUID | MONST_SUBMERGES) >>> 0) >>> 0;
        monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_SUBMERGED >>> 0) >>> 0;
      }
      if ((monst.info.flags & MONST_IMMUNE_TO_FIRE) >>> 0) {
        monst.status[STATUS_IMMUNE_TO_FIRE] = monst.maxStatus[STATUS_IMMUNE_TO_FIRE] = 1000;
      }
      if ((monst.info.flags & MONST_INVISIBLE) >>> 0) {
        monst.status[STATUS_INVISIBLE] = monst.maxStatus[STATUS_INVISIBLE] = 1000;
      }
      if (canSeeMonster(monst)) {
        monsterName(P(buf2), monst, true_);
        sprintf(P(buf), S("%s finished %s the %s."), P(buf2), P(G.monsterText[monst.info.monsterID].absorbing), P(monst.targetCorpseName));
        await messageWithColor(P(buf), G.goodMessageColor, 0);
        if (monst.absorptionBolt !== BOLT_NONE) {
          sprintf(P(buf), S("%s %s!"), P(buf2), P($sadd(G.boltCatalog, monst.absorptionBolt).abilityDescription));
        } else if (monst.absorbBehavior) {
          sprintf(P(buf), S("%s now %s!"), P(buf2), P(G.monsterBehaviorCatalog[unflag(monst.absorptionFlags)].description));
        } else {
          sprintf(P(buf), S("%s now %s!"), P(buf2), P(G.monsterAbilityCatalog[unflag(monst.absorptionFlags)].description));
        }
        resolvePronounEscapes(P(buf), monst);
        await messageWithColor(P(buf), G.advancementMessageColor, 0);
      }
      monst.absorptionFlags = 0;
      monst.absorptionBolt = BOLT_NONE;
    }
    monst.ticksUntilTurn = 100;
    return true_;
  } else if ((monst.corpseAbsorptionCounter = monst.corpseAbsorptionCounter - 1 << 16 >> 16) <= 0) {
    monst.targetCorpseLoc.$cp(struct_pos.$of(-1, -1));
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_ABSORBING >>> 0) >>> 0;
    monst.absorptionFlags = 0;
    monst.absorptionBolt = BOLT_NONE;
  } else if ((monst.bookkeepingFlags & MB_ABSORBING) >>> 0) {
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_ABSORBING >>> 0) >>> 0;
    if (15 >= monst.corpseAbsorptionCounter) {
      monst.targetCorpseLoc.$cp(struct_pos.$of(-1, -1));
      monst.absorptionFlags = 0;
      monst.absorptionBolt = BOLT_NONE;
    }
  }
  return false_;
}

export async function monstersTurn(monst: struct_creature | null): Promise<void> {
  let x = 0;
  let y = 0;
  let dir = 0;
  let shortestDistance = 0;
  let alreadyAtBestScent = 0;
  let closestMonster = null;
  let targetLoc = new struct_pos();
  monst.turnsSpentStationary = monst.turnsSpentStationary + 1 << 16 >> 16;
  if (monst.corpseAbsorptionCounter >= 0 && await updateMonsterCorpseAbsorption(monst)) {
    return;
  }
  if (monst.info.DFChance && (monst.info.flags & MONST_GETS_TURN_ON_ACTIVATION) >>> 0 && rand_percent(monst.info.DFChance)) {
    await spawnDungeonFeature(monst.loc.x, monst.loc.y, $sat(G.dungeonFeatureCatalog, monst.info.DFType), true_, false_);
  }
  await applyInstantTileEffectsToCreature(monst);
  if (monst.status[STATUS_PARALYZED] || monst.status[STATUS_ENTRANCED] || (monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
    monst.ticksUntilTurn = monst.movementSpeed;
    if ((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0 && monst.carriedItem) {
      await makeMonsterDropItem(monst);
    }
    return;
  }
  if ((monst.bookkeepingFlags & MB_IS_DYING) >>> 0) {
    return;
  }
  monst.ticksUntilTurn = (monst.movementSpeed / 3 | 0) << 16 >> 16;
  x = monst.loc.x;
  y = monst.loc.y;
  if (monst.creatureState >>> 0 === MONSTER_SLEEPING) {
    monst.ticksUntilTurn = monst.movementSpeed;
    updateMonsterState(monst);
    return;
  }
  updateMonsterState(monst);
  if (monst.creatureState >>> 0 === MONSTER_SLEEPING) {
    monst.ticksUntilTurn = monst.movementSpeed;
    return;
  }
  if ((monst.info.flags & MONST_IMMOBILE) >>> 0) {
    if (await monstUseMagic(monst)) {
      monst.ticksUntilTurn = Math.imul(monst.attackSpeed, (monst.info.flags & MONST_CAST_SPELLS_SLOWLY) >>> 0 ? 2 : 1) << 16 >> 16;
      return;
    }
    monst.ticksUntilTurn = monst.attackSpeed;
    return;
  }
  if (monst.status[STATUS_DISCORDANT] && monst.creatureState >>> 0 !== MONSTER_FLEEING) {
    shortestDistance = (31 + 3 - 3 - 2 > 100 - 20 - 1 ? 31 + 3 - 3 - 2 : 100 - 20 - 1) << 16 >> 16;
    closestMonster = null;
    let handledPlayer = false_;
    for (let it = iterateCreatures(G.monsters); !handledPlayer || hasNextCreature(it); ) {
      let target = !handledPlayer ? G.player : nextCreature(it);
      handledPlayer = true_;
      if (target !== monst && (!((target.bookkeepingFlags & MB_SUBMERGED) >>> 0) || (monst.bookkeepingFlags & MB_SUBMERGED) >>> 0) && monsterWillAttackTarget(monst, target) && distanceBetween(struct_pos.$of(x, y), target.loc) < shortestDistance && traversiblePathBetween(monst, target.loc.x, target.loc.y) && (!monsterAvoids(monst, target.loc) || (target.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) && (!target.status[STATUS_INVISIBLE] || rand_percent(33))) {
        shortestDistance = distanceBetween(struct_pos.$of(x, y), target.loc);
        closestMonster = target;
      }
    }
    if (closestMonster && await monstUseMagic(monst)) {
      monst.ticksUntilTurn = Math.imul(monst.attackSpeed, (monst.info.flags & MONST_CAST_SPELLS_SLOWLY) >>> 0 ? 2 : 1) << 16 >> 16;
      return;
    }
    if (closestMonster && !((monst.info.flags & MONST_MAINTAINS_DISTANCE) >>> 0)) {
      targetLoc.$cp(closestMonster.loc);
      if (await moveMonsterPassivelyTowards(monst, targetLoc.$clone(), true_)) {
        return;
      }
    }
  }
  if ((monst.creatureState >>> 0 === MONSTER_TRACKING_SCENT || monst.creatureState >>> 0 === MONSTER_ALLY && monst.status[STATUS_DISCORDANT]) && (!((monst.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0) || cellHasTMFlag(G.player.loc, TM_ALLOWS_SUBMERGING))) {
    if (await monstUseMagic(monst) || monsterHasBoltEffect(monst, BE_BLINKING) >>> 0 && ((monst.info.flags & MONST_ALWAYS_USE_ABILITY) >>> 0 || rand_percent(30)) && await monsterBlinkToPreferenceMap(monst, G.scentMap, true_)) {
      monst.ticksUntilTurn = Math.imul(monst.attackSpeed, (monst.info.flags & MONST_CAST_SPELLS_SLOWLY) >>> 0 ? 2 : 1) << 16 >> 16;
      return;
    }
    if (distanceBetween(struct_pos.$of(x, y), G.player.loc) > 1 || diagonalBlocked(x, y, G.player.loc.x, G.player.loc.y, false_)) {
      for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
        let ally = nextCreature(it);
        if (monsterWillAttackTarget(monst, ally) && distanceBetween(struct_pos.$of(x, y), ally.loc) === 1 && (!ally.status[STATUS_INVISIBLE] || rand_percent(33))) {
          targetLoc.$cp(ally.loc);
          if (await moveMonsterPassivelyTowards(monst, targetLoc.$clone(), true_)) {
            return;
          }
        }
      }
    }
    if ((monst.status[STATUS_LEVITATING] || (monst.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0 || (monst.bookkeepingFlags & MB_SUBMERGED) >>> 0 || (monst.info.flags & (MONST_IMMUNE_TO_WEBS | MONST_INVULNERABLE)) >>> 0 && monsterCanShootWebs(monst)) && ($at2(G.pmap, x, y).flags & IN_FIELD_OF_VIEW) >>> 0) {
      await moveMonsterPassivelyTowards(monst, G.player.loc.$clone(), true_);
      return;
    }
    if ((monst.info.flags & MONST_ALWAYS_HUNTING) >>> 0 && (monst.bookkeepingFlags & MB_GIVEN_UP_ON_SCENT) >>> 0) {
      await pathTowardCreature(monst, G.player);
      return;
    }
    dir = scentDirection(monst) << 16 >> 16;
    if (dir === NO_DIRECTION) {
      alreadyAtBestScent = isLocalScentMaximum(struct_pos.$of(x, y));
      if (alreadyAtBestScent && monst.creatureState >>> 0 !== MONSTER_ALLY && !(($at2(G.pmap, x, y).flags & IN_FIELD_OF_VIEW) >>> 0)) {
        if ((monst.info.flags & MONST_ALWAYS_HUNTING) >>> 0) {
          await pathTowardCreature(monst, G.player);
          monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_GIVEN_UP_ON_SCENT) >>> 0;
          return;
        }
        monst.creatureState = MONSTER_WANDERING;
        wanderToward(monst, monst.lastSeenPlayerAt);
      }
    } else {
      await moveMonster(monst, G.nbDirs[dir][0], G.nbDirs[dir][1]);
    }
  } else if (monst.creatureState >>> 0 === MONSTER_FLEEING) {
    if (monsterHasBoltEffect(monst, BE_BLINKING) >>> 0 && ((monst.info.flags & MONST_ALWAYS_USE_ABILITY) >>> 0 || rand_percent(30)) && await monsterBlinkToSafety(monst)) {
      return;
    }
    if (await monsterSummons(monst, ((monst.info.flags & MONST_ALWAYS_USE_ABILITY) >>> 0) << 24 >> 24)) {
      return;
    }
    dir = nextStep(getSafetyMap(monst), monst.loc, null, true_);
    if (dir !== -1) {
      targetLoc.$cp(struct_pos.$of(x + G.nbDirs[dir][0] << 16 >> 16, y + G.nbDirs[dir][1] << 16 >> 16));
    }
    if (dir === -1 || !await moveMonster(monst, G.nbDirs[dir][0], G.nbDirs[dir][1]) && !await moveMonsterPassivelyTowards(monst, targetLoc.$clone(), true_)) {
      let handledPlayer = false_;
      for (let it = iterateCreatures(G.monsters); !handledPlayer || hasNextCreature(it); ) {
        let ally = !handledPlayer ? G.player : nextCreature(it);
        handledPlayer = true_;
        if (!monst.status[STATUS_MAGICAL_FEAR] && monsterWillAttackTarget(monst, ally) && distanceBetween(struct_pos.$of(x, y), ally.loc) <= 1) {
          await moveMonster(monst, ally.loc.x - x << 16 >> 16, ally.loc.y - y << 16 >> 16);
          return;
        }
      }
    }
    return;
  } else if (monst.creatureState >>> 0 === MONSTER_WANDERING || (monst.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0 && !cellHasTMFlag(G.player.loc, TM_ALLOWS_SUBMERGING)) {
    if (cellHasTerrainFlag(struct_pos.$of(x, y), T_HARMFUL_TERRAIN & ~T_IS_FIRE) || cellHasTerrainFlag(struct_pos.$of(x, y), T_IS_FIRE) && !monst.status[STATUS_IMMUNE_TO_FIRE] && !((monst.info.flags & MONST_INVULNERABLE) >>> 0)) {
      if (!G.rogue.updatedMapToSafeTerrainThisTurn) {
        updateSafeTerrainMap();
      }
      if (await monsterBlinkToPreferenceMap(monst, G.rogue.mapToSafeTerrain, false_)) {
        monst.ticksUntilTurn = Math.imul(monst.attackSpeed, (monst.info.flags & MONST_CAST_SPELLS_SLOWLY) >>> 0 ? 2 : 1) << 16 >> 16;
        return;
      }
      dir = nextStep(G.rogue.mapToSafeTerrain, struct_pos.$of(x, y), monst, true_);
      if (dir !== -1) {
        targetLoc.$cp(struct_pos.$of(x + G.nbDirs[dir][0] << 16 >> 16, y + G.nbDirs[dir][1] << 16 >> 16));
        if (await moveMonsterPassivelyTowards(monst, targetLoc.$clone(), true_)) {
          return;
        }
      }
    }
    if ((monst.bookkeepingFlags & MB_FOLLOWER) >>> 0 && (monst.leader.bookkeepingFlags & MB_CAPTIVE) >>> 0 && monst.leader.currentHP > (Math.trunc($mul64(monst.info.damage.upperBound, monsterDamageAdjustmentAmount(monst)) / FP_FACTOR) | 0) && monst.leader.info.turnsBetweenRegen > 0 && !((monst.info.abilityFlags & MA_POISONS) >>> 0) && !diagonalBlocked(monst.loc.x, monst.loc.y, monst.leader.loc.x, monst.leader.loc.y, false_)) {
      if (distanceBetween(monst.loc, monst.leader.loc) === 1) {
        monst.ticksUntilTurn = monst.attackSpeed;
        await attack(monst, monst.leader, false_);
        return;
      } else {
        await pathTowardCreature(monst, monst.leader);
        return;
      }
    }
    if (monst.creatureState >>> 0 === MONSTER_WANDERING) {
      for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
        let ally = nextCreature(it);
        if (monsterWillAttackTarget(monst, ally) && distanceBetween(struct_pos.$of(x, y), ally.loc) === 1 && (!ally.status[STATUS_INVISIBLE] || rand_percent(33))) {
          targetLoc.$cp(ally.loc);
          if (await moveMonsterPassivelyTowards(monst, targetLoc.$clone(), true_)) {
            return;
          }
        }
      }
    }
    if ((monst.bookkeepingFlags & MB_FOLLOWER) >>> 0) {
      if (distanceBetween(struct_pos.$of(x, y), monst.leader.loc) > 2) {
        await pathTowardCreature(monst, monst.leader);
      } else if ((monst.leader.info.flags & MONST_IMMOBILE) >>> 0) {
        await monsterMillAbout(monst, 100);
      } else if ((monst.leader.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
        await monsterMillAbout(monst, 10);
      } else {
        await monsterMillAbout(monst, 30);
      }
    } else {
      dir = NO_DIRECTION;
      if (isValidWanderDestination(monst, monst.targetWaypointIndex)) {
        dir = nextStep(G.rogue.wpDistance[monst.targetWaypointIndex], monst.loc, monst, false_);
      }
      if (!isValidWanderDestination(monst, monst.targetWaypointIndex) || dir === NO_DIRECTION) {
        chooseNewWanderDestination(monst);
        if (isValidWanderDestination(monst, monst.targetWaypointIndex)) {
          dir = nextStep(G.rogue.wpDistance[monst.targetWaypointIndex], monst.loc, monst, false_);
        }
      }
      if (dir === NO_DIRECTION) {
        dir = randValidDirectionFrom(monst, x, y, true_);
      }
      if (dir !== NO_DIRECTION) {
        targetLoc.$cp(struct_pos.$of(x + G.nbDirs[dir][0] << 16 >> 16, y + G.nbDirs[dir][1] << 16 >> 16));
        if (await moveMonsterPassivelyTowards(monst, targetLoc.$clone(), true_)) {
          return;
        }
      }
    }
  } else if (monst.creatureState >>> 0 === MONSTER_ALLY) {
    await moveAlly(monst);
  }
}

export function canPass(mover: struct_creature | null, blocker: struct_creature | null): number {
  if (blocker === G.player) {
    return false_;
  }
  if (blocker.status[STATUS_CONFUSED] || blocker.status[STATUS_STUCK] || blocker.status[STATUS_PARALYZED] || blocker.status[STATUS_ENTRANCED] || mover.status[STATUS_ENTRANCED]) {
    return false_;
  }
  if ((blocker.bookkeepingFlags & (MB_CAPTIVE | MB_ABSORBING)) >>> 0 || (blocker.info.flags & MONST_IMMOBILE) >>> 0) {
    return false_;
  }
  if (monstersAreEnemies(mover, blocker)) {
    return false_;
  }
  if (blocker.leader === mover) {
    return true_;
  }
  if (mover.leader === blocker) {
    return false_;
  }
  return (monstersAreTeammates(mover, blocker) && mover.currentHP > blocker.currentHP ? 1 : 0) << 24 >> 24;
}

export function isPassableOrSecretDoor(loc: struct_pos): number {
  return (!cellHasTerrainFlag(loc, T_OBSTRUCTS_PASSABILITY) || cellHasTMFlag(loc, TM_IS_SECRET) && !((discoveredTerrainFlagsAtLoc(loc) & T_OBSTRUCTS_PASSABILITY) >>> 0) ? 1 : 0) << 24 >> 24;
}

export function knownToPlayerAsPassableOrSecretDoor(loc: struct_pos): number {
  const tFlags = new Float64Array(1);
  const TMFlags = new Float64Array(1);
  getLocationFlags(loc.x, loc.y, P(tFlags, 0), P(TMFlags, 0), null, true_);
  return (!((tFlags[0] & T_OBSTRUCTS_PASSABILITY) >>> 0) || (TMFlags[0] & TM_IS_SECRET) >>> 0 && !((discoveredTerrainFlagsAtLoc(loc) & T_OBSTRUCTS_PASSABILITY) >>> 0) ? 1 : 0) << 24 >> 24;
}

export async function setMonsterLocation(monst: struct_creature | null, newLoc: struct_pos): Promise<void> {
  let $t1: any, $t2: any;
  let creatureFlag = $u64(monst === G.player ? HAS_PLAYER : HAS_MONSTER);
  ($t1 = pmapAt(monst.loc), $t1.flags = ($t1.flags & ~creatureFlag >>> 0) >>> 0);
  await refreshDungeonCell(monst.loc.$clone());
  monst.turnsSpentStationary = 0;
  monst.loc.$cp(newLoc);
  ($t2 = pmapAt(newLoc), $t2.flags = ($t2.flags | creatureFlag) >>> 0);
  if ((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0 && !cellHasTMFlag(newLoc, TM_ALLOWS_SUBMERGING)) {
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_SUBMERGED >>> 0) >>> 0;
  }
  if (($at2(G.pmap, newLoc.x, newLoc.y).flags & ANY_KIND_OF_VISIBLE) >>> 0 && cellHasTMFlag(newLoc, TM_IS_SECRET) && cellHasTerrainFlag(newLoc, T_OBSTRUCTS_PASSABILITY)) {
    await discover(newLoc.x, newLoc.y);
  }
  await refreshDungeonCell(newLoc.$clone());
  await applyInstantTileEffectsToCreature(monst);
  if (monst === G.player) {
    await updateVision(true_);
    if ((pmapAt(G.player.loc).flags & HAS_ITEM) >>> 0) {
      await pickUpItemAt(G.player.loc.$clone());
    }
  }
}

export async function moveMonster(monst: struct_creature | null, dx: number, dy: number): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let x = monst.loc.x;
  let y = monst.loc.y;
  let newX = 0;
  let newY = 0;
  let i = 0;
  let confusedDirection = 0;
  let swarmDirection = 0;
  let defender = null;
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
  let dir = 0;
  if (dx === 0 && dy === 0) {
    return false_;
  }
  newX = x + dx << 16 >> 16;
  newY = y + dy << 16 >> 16;
  if (!coordinatesAreInMap(newX, newY)) {
    return false_;
  }
  if (monst.status[STATUS_NAUSEOUS] && rand_percent(25)) {
    await vomit(monst);
    monst.ticksUntilTurn = monst.movementSpeed;
    return true_;
  }
  if (!monst.status[STATUS_ENTRANCED]) {
    if (monst.status[STATUS_CONFUSED]) {
      confusedDirection = randValidDirectionFrom(monst, x, y, false_);
      if (confusedDirection !== -1) {
        dx = G.nbDirs[confusedDirection][0];
        dy = G.nbDirs[confusedDirection][1];
      }
    } else if ((monst.info.flags & MONST_FLITS) >>> 0 && !((monst.bookkeepingFlags & MB_SEIZING) >>> 0) && rand_percent(33)) {
      confusedDirection = randValidDirectionFrom(monst, x, y, true_);
      if (confusedDirection !== -1) {
        dx = G.nbDirs[confusedDirection][0];
        dy = G.nbDirs[confusedDirection][1];
      }
    }
  }
  newX = x + dx << 16 >> 16;
  newY = y + dy << 16 >> 16;
  if ((monst.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0 && !cellHasTMFlag(struct_pos.$of(newX, newY), TM_ALLOWS_SUBMERGING)) {
    return false_;
  }
  if (monst.status[STATUS_STUCK] && !(($at2(G.pmap, newX, newY).flags & (HAS_PLAYER | HAS_MONSTER)) >>> 0) && cellHasTerrainFlag(struct_pos.$of(x, y), T_ENTANGLES) && !((monst.info.flags & MONST_IMMUNE_TO_WEBS) >>> 0)) {
    if (!((monst.info.flags & MONST_INVULNERABLE) >>> 0) && --monst.status[STATUS_STUCK]) {
      monst.ticksUntilTurn = monst.movementSpeed;
      return true_;
    } else if ((G.tileCatalog[$at2(G.pmap, x, y).layers[SURFACE]].flags & T_ENTANGLES) >>> 0) {
      $at2(G.pmap, x, y).layers[SURFACE] = NOTHING;
    }
  }
  if (($at2(G.pmap, newX, newY).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0) {
    defender = monsterAtLoc(struct_pos.$of(newX, newY));
  } else {
    if ((monst.bookkeepingFlags & MB_SEIZED) >>> 0) {
      for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
        let defender = nextCreature(it);
        if ((defender.bookkeepingFlags & MB_SEIZING) >>> 0 && monstersAreEnemies(monst, defender) && distanceBetween(monst.loc, defender.loc) === 1 && !diagonalBlocked(monst.loc.x, monst.loc.y, defender.loc.x, defender.loc.y, false_)) {
          monst.ticksUntilTurn = monst.movementSpeed;
          return true_;
        }
      }
      monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_SEIZED >>> 0) >>> 0;
    }
    if ((monst.bookkeepingFlags & MB_SEIZING) >>> 0) {
      monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_SEIZING >>> 0) >>> 0;
    }
  }
  for (dir = 0; DIRECTION_COUNT > dir; ++dir) {
    if (dx === G.nbDirs[dir][0] && dy === G.nbDirs[dir][1]) {
      break;
    }
  }
  ;
  if (await handleWhipAttacks(monst, dir, null) || await handleSpearAttacks(monst, dir, null)) {
    monst.ticksUntilTurn = monst.attackSpeed;
    return true_;
  }
  if ((defender && (defender.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0 || isPassableOrSecretDoor(struct_pos.$of(newX, newY)) && !diagonalBlocked(x, y, newX, newY, false_) && isPassableOrSecretDoor(struct_pos.$of(x, y))) && (!defender || canPass(monst, defender) || monsterWillAttackTarget(monst, defender))) {
    if (defender) {
      if (canPass(monst, defender)) {
        ($t1 = pmapAt(defender.loc), $t1.flags = ($t1.flags & ~HAS_MONSTER >>> 0) >>> 0);
        await refreshDungeonCell(defender.loc.$clone());
        ($t2 = pmapAt(monst.loc), $t2.flags = ($t2.flags & ~HAS_MONSTER >>> 0) >>> 0);
        await refreshDungeonCell(monst.loc.$clone());
        monst.loc.x = newX;
        monst.loc.y = newY;
        ($t3 = pmapAt(monst.loc), $t3.flags = ($t3.flags | HAS_MONSTER) >>> 0);
        if (monsterAvoids(defender, struct_pos.$of(x, y))) {
          defender.loc.$cp(getQualifyingPathLocNear(struct_pos.$of(x, y), true_, forbiddenFlagsForMonster(defender.info), HAS_PLAYER, forbiddenFlagsForMonster(defender.info), HAS_PLAYER | HAS_MONSTER | HAS_STAIRS, false_));
        } else {
          defender.loc.x = x;
          defender.loc.y = y;
        }
        ($t4 = pmapAt(defender.loc), $t4.flags = ($t4.flags | HAS_MONSTER) >>> 0);
        await refreshDungeonCell(monst.loc.$clone());
        await refreshDungeonCell(defender.loc.$clone());
        monst.ticksUntilTurn = monst.movementSpeed;
        return true_;
      }
      swarmDirection = monsterSwarmDirection(monst, defender) << 16 >> 16;
      if (swarmDirection !== NO_DIRECTION) {
        let newLoc = posNeighborInDirection(monst.loc, swarmDirection).$clone();
        await setMonsterLocation(monst, newLoc.$clone());
        monst.ticksUntilTurn = monst.movementSpeed;
        return true_;
      } else {
        monst.ticksUntilTurn = monst.attackSpeed;
        if (!((monst.info.abilityFlags & MA_SEIZES) >>> 0 && !((monst.bookkeepingFlags & MB_SEIZING) >>> 0))) {
          monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_SUBMERGED >>> 0) >>> 0;
        }
        await refreshDungeonCell(struct_pos.$of(x, y));
        buildHitList(P(hitList), monst, defender, ((monst.info.abilityFlags & MA_ATTACKS_ALL_ADJACENT) >>> 0 ? true_ : false_) << 24 >> 24);
        for (i = 0; 16 > i; i = i + 1 << 16 >> 16) {
          if (hitList[i] && monsterWillAttackTarget(monst, hitList[i]) && !((hitList[i].bookkeepingFlags & MB_IS_DYING) >>> 0) && !G.rogue.gameHasEnded) {
            await attack(monst, hitList[i], false_);
          }
        }
      }
      return true_;
    } else {
      await setMonsterLocation(monst, struct_pos.$of(newX, newY));
      monst.ticksUntilTurn = monst.movementSpeed;
      return true_;
    }
  }
  return false_;
}

export function initializeStatus(monst: struct_creature | null): void {
  let i = 0;
  for (i = 0; NUMBER_OF_STATUS_EFFECTS > i; i = i + 1 << 16 >> 16) {
    monst.status[i] = monst.maxStatus[i] = 0;
  }
  if ((monst.info.flags & MONST_FIERY) >>> 0) {
    monst.status[STATUS_BURNING] = monst.maxStatus[STATUS_BURNING] = 1000;
  }
  if ((monst.info.flags & MONST_FLIES) >>> 0) {
    monst.status[STATUS_LEVITATING] = monst.maxStatus[STATUS_LEVITATING] = 1000;
  }
  if ((monst.info.flags & MONST_IMMUNE_TO_FIRE) >>> 0) {
    monst.status[STATUS_IMMUNE_TO_FIRE] = monst.maxStatus[STATUS_IMMUNE_TO_FIRE] = 1000;
  }
  if ((monst.info.flags & MONST_INVISIBLE) >>> 0) {
    monst.status[STATUS_INVISIBLE] = monst.maxStatus[STATUS_INVISIBLE] = 1000;
  }
  monst.status[STATUS_NUTRITION] = monst.maxStatus[STATUS_NUTRITION] = (monst === G.player ? STOMACH_SIZE : 1000) << 16 >> 16;
}

export function findAlternativeHomeFor(monst: struct_creature | null, x: Ptr | null, y: Ptr | null, chooseRandomly: number): void {
  let sCols = new Int16Array(79);
  let sRows = new Int16Array(29);
  let i = 0;
  let j = 0;
  let maxPermissibleDifference = 0;
  let dist = 0;
  fillSequentialList(P(sCols), DCOLS);
  fillSequentialList(P(sRows), DROWS);
  if (chooseRandomly) {
    shuffleList(P(sCols), DCOLS);
    shuffleList(P(sRows), DROWS);
  }
  for (maxPermissibleDifference = 1; (100 - 20 - 1 > 31 + 3 - 3 - 2 ? 100 - 20 - 1 : 31 + 3 - 3 - 2) > maxPermissibleDifference; maxPermissibleDifference = maxPermissibleDifference + 1 << 16 >> 16) {
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        dist = Math.abs(sCols[i] - monst.loc.x) + Math.abs(sRows[j] - monst.loc.y) << 16 >> 16;
        if (maxPermissibleDifference >= dist && dist > 0 && !(($at2(G.pmap, sCols[i], sRows[j]).flags & (HAS_PLAYER | HAS_MONSTER)) >>> 0) && !monsterAvoids(monst, struct_pos.$of(sCols[i], sRows[j])) && !(monst === G.player && cellHasTerrainFlag(struct_pos.$of(sCols[i], sRows[j]), T_PATHING_BLOCKER))) {
          x.a[x.o] = sCols[i];
          y.a[y.o] = sRows[j];
          return;
        }
      }
    }
  }
  x.a[x.o] = y.a[y.o] = -1;
}

export function getQualifyingLocNear(loc: struct_pos | null, target: struct_pos, hallwaysAllowed: number, blockingMap: Ptr | null, forbiddenTerrainFlags: number, forbiddenMapFlags: number, forbidLiquid: number, deterministic: number): number {
  let candidateLocs = 0;
  for (let k = 0; (31 + 3 - 3 - 2 > 100 - 20 - 1 ? 31 + 3 - 3 - 2 : 100 - 20 - 1) > k && !candidateLocs; ++k) {
    for (let i = target.x - k; target.x + k >= i; ++i) {
      for (let j = target.y - k; target.y + k >= j; ++j) {
        if (coordinatesAreInMap(i << 16 >> 16, j << 16 >> 16) && (i === target.x - k || i === target.x + k || j === target.y - k || j === target.y + k) && (!blockingMap || !blockingMap.a[blockingMap.o + i][j]) && !cellHasTerrainFlag(struct_pos.$of(i << 16 >> 16, j << 16 >> 16), forbiddenTerrainFlags) && !(($at2(G.pmap, i, j).flags & forbiddenMapFlags) >>> 0) && (!forbidLiquid || $at2(G.pmap, i, j).layers[LIQUID] >>> 0 === NOTHING) && (hallwaysAllowed || passableArcCount(i << 16 >> 16, j << 16 >> 16) < 2)) {
          candidateLocs = candidateLocs + 1 << 16 >> 16;
        }
      }
    }
  }
  if (candidateLocs === 0) {
    return false_;
  }
  let randIndex = 0;
  if (deterministic) {
    randIndex = 1 + (candidateLocs / 2 | 0) << 16 >> 16;
  } else {
    randIndex = rand_range(1, candidateLocs) << 16 >> 16;
  }
  for (let k = 0; (31 + 3 - 3 - 2 > 100 - 20 - 1 ? 31 + 3 - 3 - 2 : 100 - 20 - 1) > k; ++k) {
    for (let i = target.x - k; target.x + k >= i; ++i) {
      for (let j = target.y - k; target.y + k >= j; ++j) {
        if (coordinatesAreInMap(i << 16 >> 16, j << 16 >> 16) && (i === target.x - k || i === target.x + k || j === target.y - k || j === target.y + k) && (!blockingMap || !blockingMap.a[blockingMap.o + i][j]) && !cellHasTerrainFlag(struct_pos.$of(i << 16 >> 16, j << 16 >> 16), forbiddenTerrainFlags) && !(($at2(G.pmap, i, j).flags & forbiddenMapFlags) >>> 0) && (!forbidLiquid || $at2(G.pmap, i, j).layers[LIQUID] >>> 0 === NOTHING) && (hallwaysAllowed || passableArcCount(i << 16 >> 16, j << 16 >> 16) < 2)) {
          if ((randIndex = randIndex - 1 << 16 >> 16) === 0) {
            loc.$cp(struct_pos.$of(i << 16 >> 16, j << 16 >> 16));
            return true_;
          }
        }
      }
    }
  }
  ;
  return false_;
}

export function getQualifyingGridLocNear(loc: struct_pos | null, target: struct_pos, grid: Ptr | null, deterministic: number): number {
  let candidateLocs = 0;
  for (let k = 0; (31 + 3 - 3 - 2 > 100 - 20 - 1 ? 31 + 3 - 3 - 2 : 100 - 20 - 1) > k && !candidateLocs; ++k) {
    for (let i = target.x - k; target.x + k >= i; ++i) {
      for (let j = target.y - k; target.y + k >= j; ++j) {
        if (coordinatesAreInMap(i << 16 >> 16, j << 16 >> 16) && (i === target.x - k || i === target.x + k || j === target.y - k || j === target.y + k) && grid.a[grid.o + i][j]) {
          candidateLocs = candidateLocs + 1 << 16 >> 16;
        }
      }
    }
  }
  if (candidateLocs === 0) {
    return false_;
  }
  let randIndex = 0;
  if (deterministic) {
    randIndex = 1 + (candidateLocs / 2 | 0) << 16 >> 16;
  } else {
    randIndex = rand_range(1, candidateLocs) << 16 >> 16;
  }
  for (let k = 0; (31 + 3 - 3 - 2 > 100 - 20 - 1 ? 31 + 3 - 3 - 2 : 100 - 20 - 1) > k; ++k) {
    for (let i = target.x - k; target.x + k >= i; ++i) {
      for (let j = target.y - k; target.y + k >= j; ++j) {
        if (coordinatesAreInMap(i << 16 >> 16, j << 16 >> 16) && (i === target.x - k || i === target.x + k || j === target.y - k || j === target.y + k) && grid.a[grid.o + i][j]) {
          if ((randIndex = randIndex - 1 << 16 >> 16) === 0) {
            loc.$cp(struct_pos.$of(i << 16 >> 16, j << 16 >> 16));
            return true_;
          }
        }
      }
    }
  }
  ;
  return false_;
}

export async function makeMonsterDropItem(monst: struct_creature | null): Promise<void> {
  let dropLocation = getQualifyingPathLocNear(monst.loc.$clone(), true_, T_DIVIDES_LEVEL, 0, T_OBSTRUCTS_ITEMS, HAS_PLAYER | HAS_STAIRS | HAS_ITEM, false_).$clone();
  await placeItemAt(monst.carriedItem, dropLocation.$clone());
  monst.carriedItem = null;
  await refreshDungeonCell(dropLocation.$clone());
}

export function checkForContinuedLeadership(monst: struct_creature | null): void {
  let maintainLeadership = false_;
  if ((monst.bookkeepingFlags & MB_LEADER) >>> 0) {
    for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
      let follower = nextCreature(it);
      if (follower.leader === monst && monst !== follower) {
        maintainLeadership = true_;
        break;
      }
    }
  }
  if (!maintainLeadership) {
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_LEADER >>> 0) >>> 0;
  }
}

export function demoteMonsterFromLeadership(monst: struct_creature | null): void {
  let newLeader = null;
  let atLeastOneNewFollower = false_;
  monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_LEADER >>> 0) >>> 0;
  if (monst.mapToMe) {
    freeGrid(monst.mapToMe);
    monst.mapToMe = null;
  }
  for (let level = 0; G.gameConst.deepestLevel >= level; ++level) {
    let nearbyList = level === 0 ? G.monsters : $sadd(G.levels, (level - 1)).monsters;
    for (let it = iterateCreatures(nearbyList); hasNextCreature(it); ) {
      let follower = nextCreature(it);
      if (follower === monst || follower.leader !== monst) {
        continue;
      }
      if ((follower.bookkeepingFlags & MB_BOUND_TO_LEADER) >>> 0) {
        follower.leader = null;
        follower.bookkeepingFlags = (follower.bookkeepingFlags & ~MB_FOLLOWER >>> 0) >>> 0;
      } else if (newLeader) {
        follower.leader = newLeader;
        atLeastOneNewFollower = true_;
        follower.targetWaypointIndex = monst.targetWaypointIndex;
        if (follower.targetWaypointIndex >= 0) {
          follower.waypointAlreadyVisited[follower.targetWaypointIndex] = false_;
        }
      } else {
        newLeader = follower;
        follower.bookkeepingFlags = (follower.bookkeepingFlags | MB_LEADER) >>> 0;
        follower.bookkeepingFlags = (follower.bookkeepingFlags & ~MB_FOLLOWER >>> 0) >>> 0;
        follower.leader = null;
      }
    }
  }
  if (newLeader && !atLeastOneNewFollower) {
    newLeader.bookkeepingFlags = (newLeader.bookkeepingFlags & ~MB_LEADER >>> 0) >>> 0;
  }
  for (let level = 0; G.gameConst.deepestLevel >= level; ++level) {
    let candidateList = level === 0 ? G.dormantMonsters : $sadd(G.levels, (level - 1)).dormantMonsters;
    for (let it = iterateCreatures(candidateList); hasNextCreature(it); ) {
      let follower = nextCreature(it);
      if (follower === monst || follower.leader !== monst) {
        continue;
      }
      follower.leader = null;
      follower.bookkeepingFlags = (follower.bookkeepingFlags & ~MB_FOLLOWER >>> 0) >>> 0;
    }
  }
}

export async function toggleMonsterDormancy(monst: struct_creature | null): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  if (removeCreature(G.dormantMonsters, monst)) {
    prependCreature(G.monsters, monst);
    ($t1 = pmapAt(monst.loc), $t1.flags = ($t1.flags & ~HAS_DORMANT_MONSTER >>> 0) >>> 0);
    if ((pmapAt(monst.loc).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0) {
      monst.loc.$cp(getQualifyingPathLocNear(monst.loc.$clone(), true_, (T_DIVIDES_LEVEL & avoidedFlagsForMonster(monst.info)) >>> 0, HAS_PLAYER, avoidedFlagsForMonster(monst.info), HAS_PLAYER | HAS_MONSTER | HAS_STAIRS, false_));
    }
    if ((monst.bookkeepingFlags & MB_MARKED_FOR_SACRIFICE) >>> 0) {
      monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_TELEPATHICALLY_REVEALED) >>> 0;
      if (monst.carriedItem) {
        await makeMonsterDropItem(monst);
      }
    }
    monst.ticksUntilTurn = 200;
    ($t2 = pmapAt(monst.loc), $t2.flags = ($t2.flags | HAS_MONSTER) >>> 0);
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_IS_DORMANT >>> 0) >>> 0;
    await fadeInMonster(monst);
    return;
  }
  if (removeCreature(G.monsters, monst)) {
    prependCreature(G.dormantMonsters, monst);
    ($t3 = pmapAt(monst.loc), $t3.flags = ($t3.flags & ~HAS_MONSTER >>> 0) >>> 0);
    ($t4 = pmapAt(monst.loc), $t4.flags = ($t4.flags | HAS_DORMANT_MONSTER) >>> 0);
    monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_IS_DORMANT) >>> 0;
    return;
  }
}

function getMonsterDominationText(buf: Ptr | null, monst: struct_creature | null): void {
  if (!monst || monst.creatureState >>> 0 === MONSTER_ALLY || (monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
    return;
  }
  let monstName = new Int8Array(100);
  let monstNamePossessive = new Int8Array(100);
  monsterName(P(monstName), monst, true_);
  strcpy(P(monstNamePossessive), P(monstName));
  strcat(P(monstNamePossessive), endswith(P(monstName), S("s")) ? S("'") : S("'s"));
  let newText = new Int8Array(2000);
  let successChance = 0;
  if (!((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
    successChance = wandDominate(monst);
  }
  if ((monst.info.flags & MONST_INANIMATE) >>> 0) {
    sprintf(P(newText), S("\n     A wand of domination will have no effect on objects like %s."), P(monstName));
  } else if ((monst.info.flags & MONST_INVULNERABLE) >>> 0) {
    sprintf(P(newText), S("\n     A wand of domination will not affect %s."), P(monstName));
  } else if (0 >= successChance) {
    sprintf(P(newText), S("\n     A wand of domination will fail at %s current health level."), P(monstNamePossessive));
  } else if (successChance >= 100) {
    sprintf(P(newText), S("\n     A wand of domination will always succeed at %s current health level."), P(monstNamePossessive));
  } else {
    sprintf(P(newText), S("\n     A wand of domination will have a %i%% chance of success at %s current health level."), successChance, P(monstNamePossessive));
  }
  strcat(buf, P(newText));
}

function buildProperCommaString(dest: Ptr | null, newText: Ptr | null): void {
  if (!newText || newText.a[newText.o] === 0 || newText.a[newText.o] === 38 && newText.a[newText.o + 1] === 0) {
    return;
  }
  let start = newText.a[newText.o] === 38 ? 1 : 0;
  let commaCount = 0;
  for (let i = start; newText.a[newText.o + i] !== 0; ++i) {
    if (newText.a[newText.o + i] === 38) {
      ++commaCount;
    }
  }
  if (commaCount === 0) {
    strcat(dest, start === 0 ? newText : newText.add(1));
    return;
  }
  let j = strlen(dest) | 0;
  for (let i = start; newText.a[newText.o + i] !== 0; ++i) {
    if (newText.a[newText.o + i] === 38) {
      dest.a[dest.o + j] = 0;
      if (!--commaCount) {
        strcat(dest, S(" and "));
        j += 5;
      } else {
        strcat(dest, S(", "));
        j += 2;
      }
    } else {
      dest.a[dest.o + j++] = newText.a[newText.o + i];
    }
  }
  dest.a[dest.o + j] = 0;
}

function getMonsterAbilitiesText(monst: struct_creature | null, abilitiesText: Ptr | null, includeNegatable: number, includeNonNegatable: number): void {
  let buf = $cs("", 6800);
  if (includeNegatable && monst.mutationIndex >= 0 && G.mutationCatalog[monst.mutationIndex].canBeNegated) {
    strcat(P(buf), S("has a rare mutation"));
  }
  if (includeNegatable && monst.attackSpeed !== monst.info.attackSpeed || includeNonNegatable && monst.attackSpeed === monst.info.attackSpeed) {
    if (100 > monst.attackSpeed) {
      strcat(P(buf), S("&attacks quickly"));
    } else if (monst.attackSpeed > 100) {
      strcat(P(buf), S("&attacks slowly"));
    }
  }
  if (includeNegatable && monst.movementSpeed !== monst.info.movementSpeed || includeNonNegatable && monst.movementSpeed === monst.info.movementSpeed) {
    if (100 > monst.movementSpeed) {
      strcat(P(buf), S("&moves quickly"));
    } else if (monst.movementSpeed > 100) {
      strcat(P(buf), S("&moves slowly"));
    }
  }
  if (includeNonNegatable) {
    if (monst.info.turnsBetweenRegen === 0) {
      strcat(P(buf), S("&does not regenerate"));
    } else if (5000 > monst.info.turnsBetweenRegen) {
      strcat(P(buf), S("&regenerates quickly"));
    }
  }
  for (let i = 0; monst.info.bolts[i] >>> 0 !== BOLT_NONE; ++i) {
    if ($sadd(G.boltCatalog, monst.info.bolts[i]).abilityDescription[0]) {
      if (includeNegatable && !(($sadd(G.boltCatalog, monst.info.bolts[i]).flags & BF_NOT_NEGATABLE) >>> 0) || includeNonNegatable && ($sadd(G.boltCatalog, monst.info.bolts[i]).flags & BF_NOT_NEGATABLE) >>> 0) {
        strcat(P(buf), S("&"));
        strcat(P(buf), P($sadd(G.boltCatalog, monst.info.bolts[i]).abilityDescription));
      }
    }
  }
  for (let i = 0; 32 > i; ++i) {
    if ((monst.info.abilityFlags & $shl64(1, i)) >>> 0 && G.monsterAbilityCatalog[i].description[0]) {
      if (includeNegatable && G.monsterAbilityCatalog[i].isNegatable || includeNonNegatable && !G.monsterAbilityCatalog[i].isNegatable) {
        strcat(P(buf), S("&"));
        strcat(P(buf), P(G.monsterAbilityCatalog[i].description));
      }
    }
  }
  for (let i = 0; 32 > i; ++i) {
    if ((monst.info.flags & $shl64(1, i)) >>> 0 && G.monsterBehaviorCatalog[i].description[0]) {
      if (includeNegatable && G.monsterBehaviorCatalog[i].isNegatable || includeNonNegatable && !G.monsterBehaviorCatalog[i].isNegatable) {
        strcat(P(buf), S("&"));
        strcat(P(buf), P(G.monsterBehaviorCatalog[i].description));
      }
    }
  }
  for (let i = 0; 32 > i; ++i) {
    if ((monst.bookkeepingFlags & $shl64(1, i)) >>> 0 && G.monsterBookkeepingFlagDescriptions[i][0]) {
      if (includeNegatable && (monst.bookkeepingFlags & MB_SEIZING) >>> 0 || includeNonNegatable && !((monst.bookkeepingFlags & MB_SEIZING) >>> 0)) {
        strcat(P(buf), S("&"));
        strcat(P(buf), P(G.monsterBookkeepingFlagDescriptions[i]));
      }
    }
  }
  buildProperCommaString(abilitiesText, P(buf));
}

function staffOrWandEffectOnMonsterDescription(newText: Ptr | null, theItem: struct_item | null, monst: struct_creature | null): number {
  let theItemName = new Int8Array(100);
  let monstName = new Int8Array(100);
  let successfulDescription = false_;
  let enchant = netEnchant(theItem);
  if (theItem.category & (STAFF | WAND) && $sadd(tableForItemCategory(theItem.category), theItem.kind).identified) {
    monsterName(P(monstName), monst, true_);
    itemName(theItem, P(theItemName), false_, false_, null);
    switch (boltEffectForItem(theItem) >>> 0) {
    case BE_DAMAGE:
      if (($sadd(G.boltCatalog, boltForItem(theItem)).flags & BF_FIERY) >>> 0 && monst.status[STATUS_IMMUNE_TO_FIRE] || (monst.info.flags & MONST_INVULNERABLE) >>> 0) {
        sprintf(newText, S("\n     Your %s (%c) will not harm %s."), P(theItemName), theItem.inventoryLetter, P(monstName));
        successfulDescription = true_;
      } else if ((theItem.flags & (ITEM_MAX_CHARGES_KNOWN | ITEM_IDENTIFIED)) >>> 0) {
        if (staffDamageLow(enchant) >= monst.currentHP) {
          sprintf(newText, S("\n     Your %s (%c) will %s %s in one hit."), P(theItemName), theItem.inventoryLetter, (monst.info.flags & MONST_INANIMATE) >>> 0 ? S("destroy") : S("kill"), P(monstName));
        } else {
          sprintf(newText, S("\n     Your %s (%c) will hit %s for between %i%% and %i%% of $HISHER current health."), P(theItemName), theItem.inventoryLetter, P(monstName), 100 * staffDamageLow(enchant) / monst.currentHP | 0, 100 * staffDamageHigh(enchant) / monst.currentHP | 0);
        }
        successfulDescription = true_;
      }
      break;
    case BE_POISON:
      if ((monst.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0) {
        sprintf(newText, S("\n     Your %s (%c) will not affect %s."), P(theItemName), theItem.inventoryLetter, P(monstName));
      } else {
        sprintf(newText, S("\n     Your %s (%c) will poison %s for %i%% of $HISHER current health."), P(theItemName), theItem.inventoryLetter, P(monstName), 100 * staffPoison(enchant) / monst.currentHP | 0);
      }
      successfulDescription = true_;
      break;
    default:
      strcpy(newText, S(""));
      break;
    }
  }
  return successfulDescription;
}

function summarizePack(pack: struct_packSummary | null): void {
  for (let theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
    if (theItem.category & (CHARM | WAND | SCROLL | STAFF)) {
      if ($sadd(tableForItemCategory(theItem.category), theItem.kind).identified) {
        switch (theItem.category) {
        case WAND:
          ++pack.wandCount;
          if (theItem.kind === WAND_NEGATION) {
            pack.hasNegationWand = true_;
          } else if (theItem.kind === WAND_DOMINATION) {
            pack.hasDominationWand = true_;
          }
          break;
        case STAFF:
          ++pack.staffCount;
          if (theItem.kind === STAFF_TUNNELING) {
            pack.hasTunnelingStaff = true_;
          }
          break;
        case CHARM:
          if (theItem.kind === CHARM_NEGATION) {
            pack.hasNegationCharm = true_;
          } else if (theItem.kind === CHARM_SHATTERING) {
            pack.hasShatteringCharm = true_;
          }
          break;
        case SCROLL:
          if (theItem.kind === SCROLL_NEGATION) {
            pack.hasNegationScroll = true_;
          } else if (theItem.kind === SCROLL_SHATTERING) {
            pack.hasShatteringScroll = true_;
          }
          break;
        default:
          break;
        }
      }
    }
  }
}

export function monsterDetails(buf: Ptr | null, monst: struct_creature | null): void {
  let monstName = new Int8Array(100);
  let capMonstName = new Int8Array(100);
  let theItemName = new Int8Array(300);
  let newText = new Int8Array(2000);
  let i = 0;
  let combatMath = 0;
  let combatMath2 = 0;
  let playerKnownAverageDamage = 0;
  let playerKnownMaxDamage = 0;
  let realArmorValue = 0;
  let theItem = null;
  buf.a[buf.o] = 0;
  monsterName(P(monstName), monst, true_);
  strcpy(P(capMonstName), P(monstName));
  upperCase(P(capMonstName));
  if (!((monst.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0) || cellHasTMFlag(monst.loc, TM_ALLOWS_SUBMERGING)) {
    sprintf(P(newText), S("     %s\n     "), P(G.monsterText[monst.info.monsterID].flavorText));
    strcat(buf, P(newText));
  }
  if (monst.mutationIndex >= 0) {
    i = strlen(buf) << 16 >> 16;
    i = encodeMessageColor(buf, i, G.mutationCatalog[monst.mutationIndex].textColor);
    strcpy(P(newText), P(G.mutationCatalog[monst.mutationIndex].description));
    resolvePronounEscapes(P(newText), monst);
    upperCase(P(newText));
    strcat(P(newText), S("\n     "));
    strcat(buf, P(newText));
    i = strlen(buf) << 16 >> 16;
    i = encodeMessageColor(buf, i, G.white);
  }
  if (!((monst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) && cellHasTerrainFlag(monst.loc, T_OBSTRUCTS_PASSABILITY)) {
    sprintf(P(newText), S("%s is trapped %s %s.\n     "), P(capMonstName), (G.tileCatalog[pmapAt(monst.loc).layers[layerWithFlag(monst.loc.x, monst.loc.y, T_OBSTRUCTS_PASSABILITY)]].mechFlags & TM_STAND_IN_TILE) >>> 0 ? S("in") : S("on"), P(G.tileCatalog[pmapAt(monst.loc).layers[layerWithFlag(monst.loc.x, monst.loc.y, T_OBSTRUCTS_PASSABILITY)]].description));
    strcat(buf, P(newText));
  }
  newText[0] = 0;
  if (monst.creatureState >>> 0 === MONSTER_ALLY) {
    i = strlen(buf) << 16 >> 16;
    i = encodeMessageColor(buf, i, G.goodMessageColor);
    sprintf(P(newText), S("%s is your ally.\n     "), P(capMonstName));
    strcat(buf, P(newText));
    if (monst.newPowerCount > 0) {
      i = strlen(buf) << 16 >> 16;
      i = encodeMessageColor(buf, i, G.advancementMessageColor);
      if (monst.newPowerCount === 1) {
        sprintf(P(newText), S("$HESHE seems ready to learn something new.\n     "));
      } else {
        sprintf(P(newText), S("$HESHE seems ready to learn %i new talents.\n     "), monst.newPowerCount);
      }
      resolvePronounEscapes(P(newText), monst);
      upperCase(P(newText));
      strcat(buf, P(newText));
    }
  }
  if (!G.rogue.armor || (G.rogue.armor.flags & ITEM_IDENTIFIED) >>> 0) {
    combatMath2 = hitProbability(monst, G.player);
  } else {
    realArmorValue = G.player.info.defense;
    G.player.info.defense = ((G.armorTable[G.rogue.armor.kind].range.upperBound + G.armorTable[G.rogue.armor.kind].range.lowerBound) / 2 | 0) << 16 >> 16;
    G.player.info.defense = G.player.info.defense + Math.trunc($mul64(10, strengthModifier(G.rogue.armor)) / FP_FACTOR) << 16 >> 16;
    combatMath2 = hitProbability(monst, G.player);
    G.player.info.defense = realArmorValue;
  }
  if ((monst.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0 && !cellHasTMFlag(monst.loc, TM_ALLOWS_SUBMERGING)) {
    sprintf(P(newText), S("     %s writhes helplessly on dry land.\n     "), P(capMonstName));
  } else if (G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0 && (G.rogue.armor.flags & ITEM_RUNIC_IDENTIFIED) >>> 0 && G.rogue.armor.enchant2 === A_IMMUNITY && monsterIsInClass(monst, G.rogue.armor.vorpalEnemy << 16 >> 16)) {
    itemName(G.rogue.armor, P(theItemName), false_, false_, null);
    sprintf(P(newText), S("Your %s renders you immune to %s.\n     "), P(theItemName), P(monstName));
  } else if (Math.trunc($mul64(monst.info.damage.upperBound, monsterDamageAdjustmentAmount(monst)) / FP_FACTOR) === 0) {
    sprintf(P(newText), S("%s deals no direct damage.\n     "), P(capMonstName));
  } else {
    i = strlen(buf) << 16 >> 16;
    i = encodeMessageColor(buf, i, G.badMessageColor);
    if ((monst.info.abilityFlags & MA_POISONS) >>> 0) {
      combatMath = G.player.status[STATUS_POISONED];
      for (i = 0; G.player.currentHP > Math.imul(combatMath, G.player.poisonAmount + i); i = i + 1 << 16 >> 16) {
        combatMath = combatMath + Math.trunc($mul64(monst.info.damage.upperBound, monsterDamageAdjustmentAmount(monst)) / FP_FACTOR) << 16 >> 16;
      }
      if (i === 0) {
        sprintf(P(newText), S("%s has a %i%% chance to poison you and typically poisons for %i turns.\n     "), P(capMonstName), combatMath2, Math.trunc(Math.trunc($mul64(monst.info.damage.lowerBound + monst.info.damage.upperBound, monsterDamageAdjustmentAmount(monst)) / 2) / FP_FACTOR) | 0);
      } else {
        sprintf(P(newText), S("%s has a %i%% chance to poison you, typically poisons for %i turns, and at worst, could fatally poison you in %i hit%s.\n     "), P(capMonstName), combatMath2, Math.trunc(Math.trunc($mul64(monst.info.damage.lowerBound + monst.info.damage.upperBound, monsterDamageAdjustmentAmount(monst)) / 2) / FP_FACTOR) | 0, i, i > 1 ? S("s") : S(""));
      }
    } else {
      combatMath = Math.trunc($mul64(G.player.currentHP + Math.trunc($mul64(monst.info.damage.upperBound, monsterDamageAdjustmentAmount(monst)) / FP_FACTOR) - 1, FP_FACTOR) / $mul64(monst.info.damage.upperBound, monsterDamageAdjustmentAmount(monst))) << 16 >> 16;
      if (1 > combatMath) {
        combatMath = 1;
      }
      sprintf(P(newText), S("%s has a %i%% chance to hit you, typically hits for %i%% of your current health, and at worst, could defeat you in %i hit%s.\n     "), P(capMonstName), combatMath2, Math.trunc(Math.trunc(Math.trunc($mul64(100 * (monst.info.damage.lowerBound + monst.info.damage.upperBound), monsterDamageAdjustmentAmount(monst)) / 2) / G.player.currentHP) / FP_FACTOR) | 0, combatMath, combatMath > 1 ? S("s") : S(""));
    }
  }
  upperCase(P(newText));
  strcat(buf, P(newText));
  if (!G.rogue.weapon || (G.rogue.weapon.flags & ITEM_IDENTIFIED) >>> 0) {
    playerKnownAverageDamage = ((G.player.info.damage.upperBound + G.player.info.damage.lowerBound) / 2 | 0) << 16 >> 16;
    playerKnownMaxDamage = G.player.info.damage.upperBound;
  } else {
    let strengthFactor = damageFraction(strengthModifier(G.rogue.weapon));
    let tempLow = Math.trunc($mul64(G.rogue.weapon.damage.lowerBound, strengthFactor) / FP_FACTOR) << 16 >> 16;
    let tempHigh = Math.trunc($mul64(G.rogue.weapon.damage.upperBound, strengthFactor) / FP_FACTOR) << 16 >> 16;
    playerKnownAverageDamage = (1 > ((tempLow + tempHigh) / 2 | 0) ? 1 : (tempLow + tempHigh) / 2 | 0) << 16 >> 16;
    playerKnownMaxDamage = (1 > tempHigh ? 1 : tempHigh) << 16 >> 16;
  }
  if (playerKnownMaxDamage === 0) {
    i = strlen(buf) << 16 >> 16;
    i = encodeMessageColor(buf, i, G.white);
    sprintf(P(newText), S("You deal no direct damage."));
  } else if (G.rogue.weapon && (G.rogue.weapon.flags & ITEM_RUNIC) >>> 0 && (G.rogue.weapon.flags & ITEM_RUNIC_IDENTIFIED) >>> 0 && G.rogue.weapon.enchant2 === W_SLAYING && monsterIsInClass(monst, G.rogue.weapon.vorpalEnemy << 16 >> 16)) {
    i = strlen(buf) << 16 >> 16;
    i = encodeMessageColor(buf, i, G.goodMessageColor);
    itemName(G.rogue.weapon, P(theItemName), false_, false_, null);
    sprintf(P(newText), S("Your %s will slay %s in one stroke."), P(theItemName), P(monstName));
  } else if ((monst.info.flags & (MONST_INVULNERABLE | MONST_IMMUNE_TO_WEAPONS)) >>> 0) {
    i = strlen(buf) << 16 >> 16;
    i = encodeMessageColor(buf, i, G.white);
    sprintf(P(newText), S("%s is immune to your attacks."), P(monstName));
  } else if ((monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
    i = strlen(buf) << 16 >> 16;
    i = encodeMessageColor(buf, i, G.goodMessageColor);
    sprintf(P(newText), S("%s is being held captive."), P(capMonstName));
  } else {
    i = strlen(buf) << 16 >> 16;
    i = encodeMessageColor(buf, i, G.goodMessageColor);
    combatMath = ((monst.currentHP + playerKnownMaxDamage - 1) / playerKnownMaxDamage | 0) << 16 >> 16;
    if (1 > combatMath) {
      combatMath = 1;
    }
    if (G.rogue.weapon && !((G.rogue.weapon.flags & ITEM_IDENTIFIED) >>> 0)) {
      realArmorValue = G.rogue.weapon.enchant1;
      G.rogue.weapon.enchant1 = 0;
      combatMath2 = hitProbability(G.player, monst);
      G.rogue.weapon.enchant1 = realArmorValue;
    } else {
      combatMath2 = hitProbability(G.player, monst);
    }
    sprintf(P(newText), S("You have a %i%% chance to hit %s, typically hit for %i%% of $HISHER current health, and at best, could defeat $HIMHER in %i hit%s."), combatMath2, P(monstName), 100 * playerKnownAverageDamage / monst.currentHP | 0, combatMath, combatMath > 1 ? S("s") : S(""));
  }
  upperCase(P(newText));
  strcat(buf, P(newText));
  let pack = struct_packSummary.$of();
  summarizePack(pack);
  let buf2 = $cs("", 100);
  if (monsterIsNegatable(monst)) {
    if (pack.hasNegationCharm) {
      strcpy(P(buf2), S("negation charm"));
    }
    if (pack.hasNegationScroll) {
      strcat(P(buf2), S("&scroll of negation"));
    }
    if (pack.hasNegationWand && !((monst.info.abilityFlags & MA_REFLECT_100) >>> 0)) {
      strcat(P(buf2), S("&wand of negation"));
    }
  }
  let negationMethodText = $cs("", 100);
  buildProperCommaString(P(negationMethodText), P(buf2));
  encodeMessageColor(buf, strlen(buf) << 16 >> 16, G.itemMessageColor);
  let printStaffOrWandEffect = true_;
  if ((monst.info.flags & MONST_DIES_IF_NEGATED) >>> 0 && negationMethodText[0]) {
    sprintf(P(newText), S("\n     Your %s will %s %s."), P(negationMethodText), (monst.info.flags & MONST_INANIMATE) >>> 0 ? S("destroy") : S("kill"), P(monstName));
    strcat(buf, P(newText));
  }
  if ((monst.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0) {
    strcpy(P(buf2), S(""));
    if (pack.hasShatteringCharm) {
      strcpy(P(buf2), S("shattering charm"));
    }
    if (pack.hasShatteringScroll) {
      strcat(P(buf2), S("&scroll of shattering"));
    }
    if (pack.hasTunnelingStaff) {
      strcat(P(buf2), S("&staff of tunneling"));
    }
    let shatterMethodText = $cs("", 100);
    buildProperCommaString(P(shatterMethodText), P(buf2));
    if (shatterMethodText[0]) {
      sprintf(P(newText), S("\n     Your %s will destroy %s."), P(shatterMethodText), P(monstName));
      strcat(buf, P(newText));
    }
  }
  if ((monst.info.abilityFlags & MA_REFLECT_100) >>> 0 && (pack.staffCount || pack.wandCount)) {
    sprintf(P(newText), S("\n     Bolts from your %s%s%s%s%s that hit %s will be reflected directly back at you."), pack.staffCount ? S("staff") : S(""), pack.staffCount > 1 ? S("s") : S(""), pack.wandCount && pack.staffCount ? S(" and ") : S(""), pack.wandCount ? S("wand") : S(""), pack.wandCount > 1 ? S("s") : S(""), P(monstName));
    strcat(buf, P(newText));
    printStaffOrWandEffect = false_;
  }
  if ((monst.info.flags & MONST_INVULNERABLE) >>> 0) {
    printStaffOrWandEffect = false_;
  }
  if (printStaffOrWandEffect) {
    for (theItem = G.packItems.nextItem; !!theItem; theItem = theItem.nextItem) {
      if ((theItem.category === STAFF || theItem.category === WAND) && $sadd(tableForItemCategory(theItem.category), theItem.kind).identified && staffOrWandEffectOnMonsterDescription(P(newText), theItem, monst)) {
        strcat(buf, P(newText));
      }
    }
    if (pack.hasDominationWand) {
      strcpy(P(newText), S(""));
      getMonsterDominationText(P(newText), monst);
      strcat(buf, P(newText));
    }
  }
  if (monst.carriedItem) {
    i = strlen(buf) << 16 >> 16;
    i = encodeMessageColor(buf, i, G.itemMessageColor);
    itemName(monst.carriedItem, P(theItemName), true_, true_, null);
    sprintf(P(newText), S("%s has %s."), P(capMonstName), P(theItemName));
    upperCase(P(newText));
    strcat(buf, S("\n     "));
    strcat(buf, P(newText));
  }
  if (monst.wasNegated && monst.newPowerCount === monst.totalPowerCount) {
    i = strlen(buf) << 16 >> 16;
    i = encodeMessageColor(buf, i, G.pink);
    sprintf(P(newText), S("%s is stripped of $HISHER special traits."), P(capMonstName));
    resolvePronounEscapes(P(newText), monst);
    upperCase(P(newText));
    strcat(buf, S("\n     "));
    strcat(buf, P(newText));
  }
  encodeMessageColor(buf, strlen(buf) << 16 >> 16, G.white);
  let abilitiesText = $cs("", 2000);
  if ((monst.info.flags & MONST_DIES_IF_NEGATED) >>> 0 && negationMethodText[0] || !negationMethodText[0]) {
    getMonsterAbilitiesText(monst, P(abilitiesText), true_, true_);
    if (abilitiesText[0]) {
      sprintf(P(newText), S("\n     %s %s."), P(capMonstName), P(abilitiesText));
      strcat(buf, P(newText));
    }
  } else {
    getMonsterAbilitiesText(monst, P(abilitiesText), false_, true_);
    let hasNonNegatableAbilities = false_;
    if (abilitiesText[0]) {
      hasNonNegatableAbilities = true_;
      sprintf(P(newText), S("\n     %s %s."), P(capMonstName), P(abilitiesText));
      strcat(buf, P(newText));
    }
    strcpy(P(abilitiesText), S(""));
    getMonsterAbilitiesText(monst, P(abilitiesText), true_, false_);
    if (abilitiesText[0]) {
      sprintf(P(newText), S("\n     %s%s has special traits that can be removed by a "), P(capMonstName), hasNonNegatableAbilities ? S(" also") : S(""));
      encodeMessageColor(P(newText), strlen(P(newText)) << 16 >> 16, G.itemMessageColor);
      strcat(P(newText), P(negationMethodText));
      encodeMessageColor(P(newText), strlen(P(newText)) << 16 >> 16, G.white);
      strcat(P(newText), S(": it "));
      strcat(P(newText), P(abilitiesText));
      strcat(P(newText), S("."));
      strcat(buf, P(newText));
    }
  }
  resolvePronounEscapes(buf, monst);
}

export function $init(): void {
}
