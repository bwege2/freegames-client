// @ts-nocheck
// Brogue CE 1.15.1 Combat.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { cellHasTerrainFlag, spawnDungeonFeature, zeroOutGrid } from './Architect.ts';
import { calculateDistances } from './Dijkstra.ts';
import { allocGrid, fillGrid, freeGrid, getQualifyingPathLocNear } from './Grid.ts';
import { encodeMessageColor, message, messageColorFromVictim, messageWithColor, refreshDungeonCell, refreshSideBar } from './IO.ts';
import { autoIdentify, checkForDisenchantment, deleteItem, equipItem, generateItem, heal, itemName, numberOfMatchingPackItems, removeItemFromChain, slow, strengthCheck, updateIdentifiableItems, weaken, zap } from './Items.ts';
import { createFlare } from './Light.ts';
import { randClump, rand_percent, rand_range } from './Math.ts';
import { alertMonster, avoidedFlagsForMonster, canDirectlySeeMonster, canSeeMonster, checkForContinuedLeadership, cloneMonster, demoteMonsterFromLeadership, distanceBetween, fadeInMonster, forbiddenFlagsForMonster, generateMonster, hasNextCreature, iterateCreatures, makeMonsterDropItem, monsterAtLoc, monsterAvoids, monsterIsInClass, monsterName, monsterWillAttackTarget, monstersAreEnemies, monstersAreTeammates, nextCreature, prependCreature, resolvePronounEscapes, setMonsterLocation, unAlly, wakeUp } from './Monsters.ts';
import { diagonalBlocked, highestPriorityLayer } from './Movement.ts';
import { accuracyFraction, armorAbsorptionMax, armorImageCount, armorReprisalPercent, damageFraction, defenseFraction, runicWeaponChance, weaponConfusionDuration, weaponForceDistance, weaponImageCount, weaponImageDuration, weaponParalysisDuration, weaponSlowDuration } from './PowerTables.ts';
import { gameOver } from './RogueMain.ts';
import { applyInstantTileEffectsToCreature, exposeCreatureToFire, rechargeItemsIncrementally, updateVision } from './Time.ts';
import { struct_bolt, struct_color, struct_creature, struct_dungeonFeature, struct_item, struct_pcell, struct_pos, struct_tcell, struct_windowpos } from './structs.ts';
import { $arr, $at2, $cs, $mul64, $rd, $sadd, $sat, $shl64, $u64, $wr, G, P, S, free, snprintf, sprintf, strcpy, strlen, strncat } from '../rt/index.ts';
import { ALL_ITEMS, ARMOR, A_ABSORPTION, A_BURDEN, A_IMMOLATION, A_IMMUNITY, A_MULTIPLICITY, A_MUTUALITY, A_REPRISAL, A_VULNERABILITY, BF_NOT_LEARNABLE, BOLT_BLINKING, BOLT_NONE, BROADSWORD, COLOR_ESCAPE, COLS, DCOLS, DF_ARMOR_IMMOLATION, DIRECTION_COUNT, DROWS, FEAT_DRAGONSLAYER, FEAT_PALADIN, FEAT_PURE_MAGE, FOLDABLE, FP_FACTOR, GAME_MODE_EASY, GAS, HAMMER, HAS_DORMANT_MONSTER, HAS_MONSTER, HAS_PLAYER, HAS_STAIRS, ITEM_ATTACKS_ALL_ADJACENT, ITEM_ATTACKS_EXTEND, ITEM_ATTACKS_PENETRATE, ITEM_ATTACKS_QUICKLY, ITEM_ATTACKS_STAGGER, ITEM_EQUIPPED, ITEM_IDENTIFIED, ITEM_PLAYER_AVOIDS, ITEM_PROTECTED, ITEM_RUNIC, ITEM_RUNIC_IDENTIFIED, ITEM_SNEAK_ATTACK_BONUS, LEARNABLE_ABILITIES, LEARNABLE_BEHAVIORS, MA_ATTACKS_ALL_ADJACENT, MA_ATTACKS_EXTEND, MA_ATTACKS_PENETRATE, MA_ATTACKS_STAGGER, MA_AVOID_CORRIDORS, MA_CAST_SUMMON, MA_CAUSES_WEAKNESS, MA_CLONE_SELF_ON_DEFEND, MA_DF_ON_DEATH, MA_ENTER_SUMMONS, MA_HIT_BURN, MA_HIT_DEGRADE_ARMOR, MA_HIT_HALLUCINATE, MA_HIT_STEAL_FLEE, MA_KAMIKAZE, MA_POISONS, MA_SEIZES, MA_TRANSFERENCE, MB_ABSORBING, MB_ADMINISTRATIVE_DEATH, MB_BOUND_TO_LEADER, MB_CAPTIVE, MB_DOES_NOT_TRACK_LEADER, MB_FOLLOWER, MB_HAS_DIED, MB_IS_DORMANT, MB_IS_DYING, MB_IS_FALLING, MB_JUST_SUMMONED, MB_SEIZED, MB_SEIZING, MB_SUBMERGED, MB_TELEPATHICALLY_REVEALED, MB_WEAPON_AUTO_ID, MB_WILL_FLASH, MESSAGE_LINES, MIN_FLASH_STRENGTH, MK_DRAGON, MK_SPECTRAL_IMAGE, MODE_PERM_FLEEING, MONSTER_ALLY, MONSTER_FLEEING, MONSTER_SLEEPING, MONSTER_TRACKING_SCENT, MONSTER_WANDERING, MONST_ATTACKABLE_THRU_WALLS, MONST_DEFEND_DEGRADE_WEAPON, MONST_DIES_IF_NEGATED, MONST_FLEES_NEAR_DEATH, MONST_FLIES, MONST_IMMOBILE, MONST_IMMUNE_TO_WEAPONS, MONST_INANIMATE, MONST_INVULNERABLE, MONST_RESTRICTED_TO_LIQUID, MONST_TURRET, NO_DIRECTION, PIKE, QUIETUS_FLARE_LIGHT, REQUIRE_ACKNOWLEDGMENT, ROWS, SCROLL_ENCHANTMENT_LIGHT, SLAYING_FLARE_LIGHT, SPECIAL_HIT, SPECTRAL_IMAGE_LIGHT, STATUS_CONFUSED, STATUS_DISCORDANT, STATUS_ENRAGED, STATUS_ENTRANCED, STATUS_HALLUCINATING, STATUS_IMMUNE_TO_FIRE, STATUS_LEVITATING, STATUS_LIFESPAN_REMAINING, STATUS_MAGICAL_FEAR, STATUS_PARALYZED, STATUS_POISONED, STATUS_SHIELDED, STATUS_STUCK, STATUS_TELEPATHIC, STAT_BAR_WIDTH, T_DIVIDES_LEVEL, T_OBSTRUCTS_PASSABILITY, T_OBSTRUCTS_VISION, UP, WAR_AXE, WEAPON, W_CONFUSION, W_FORCE, W_MERCY, W_MULTIPLICITY, W_PARALYSIS, W_PLENTY, W_QUIETUS, W_SLAYING, W_SLOWING, W_SPEED, false_, true_ } from './consts.ts';


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

export function strengthModifier(theItem: struct_item | null): number {
  let difference = G.rogue.strength - G.player.weaknessAmount - theItem.strengthRequired;
  if (difference > 0) {
    return Math.trunc($mul64(difference, FP_FACTOR) / 4);
  } else {
    return Math.trunc($mul64($mul64(difference, FP_FACTOR), 5) / 2);
  }
}

export function netEnchant(theItem: struct_item | null): number {
  let retval = $mul64(theItem.enchant1, FP_FACTOR);
  if (theItem.category & (WEAPON | ARMOR)) {
    retval += strengthModifier(theItem);
  }
  return (retval > -1310720 ? retval : -1310720) > 3276800 ? 3276800 : retval > -1310720 ? retval : -1310720;
}

export function monsterDamageAdjustmentAmount(monst: struct_creature | null): number {
  if (monst === G.player) {
    return FP_FACTOR;
  } else {
    return damageFraction(Math.trunc($mul64($mul64(monst.weaknessAmount, FP_FACTOR), -3) / 2));
  }
}

export function monsterDefenseAdjusted(monst: struct_creature | null): number {
  let retval = 0;
  if (monst === G.player) {
    retval = monst.info.defense;
  } else {
    retval = monst.info.defense - 25 * monst.weaknessAmount << 16 >> 16;
  }
  return (retval > 0 ? retval : 0) << 16 >> 16;
}

export function monsterAccuracyAdjusted(monst: struct_creature | null): number {
  let retval = Math.trunc($mul64(monst.info.accuracy, accuracyFraction(Math.trunc($mul64($mul64(monst.weaknessAmount, FP_FACTOR), -3) / 2))) / FP_FACTOR) << 16 >> 16;
  return (retval > 0 ? retval : 0) << 16 >> 16;
}

export function hitProbability(attacker: struct_creature | null, defender: struct_creature | null): number {
  let accuracy = monsterAccuracyAdjusted(attacker);
  let defense = monsterDefenseAdjusted(defender);
  let hitProbability = 0;
  if (defender.status[STATUS_STUCK] || (defender.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
    return 100;
  }
  if ((defender.bookkeepingFlags & MB_SEIZED) >>> 0 && (attacker.bookkeepingFlags & MB_SEIZING) >>> 0) {
    return 100;
  }
  if (attacker === G.player && G.rogue.weapon) {
    if ((G.rogue.weapon.flags & ITEM_RUNIC) >>> 0 && G.rogue.weapon.enchant2 === W_SLAYING && monsterIsInClass(defender, G.rogue.weapon.vorpalEnemy << 16 >> 16)) {
      return 100;
    }
    accuracy = Math.trunc($mul64(G.player.info.accuracy, accuracyFraction(netEnchant(G.rogue.weapon))) / FP_FACTOR) << 16 >> 16;
  }
  hitProbability = Math.trunc($mul64(accuracy, defenseFraction($mul64(defense, FP_FACTOR))) / FP_FACTOR) << 16 >> 16;
  if (hitProbability > 100) {
    hitProbability = 100;
  } else if (0 > hitProbability) {
    hitProbability = 0;
  }
  return hitProbability;
}

export function attackHit(attacker: struct_creature | null, defender: struct_creature | null): number {
  if (defender.status[STATUS_STUCK] || defender.status[STATUS_PARALYZED] || (defender.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
    return true_;
  }
  return rand_percent(hitProbability(attacker, defender));
}

function addMonsterToContiguousMonsterGrid(x: number, y: number, monst: struct_creature | null, grid: Ptr | null): void {
  let newX = 0;
  let newY = 0;
  let dir = 0;
  let tempMonst = null;
  grid.a[grid.o + x][y] = true_;
  for (dir = 0; 4 > dir; ++dir) {
    newX = x + G.nbDirs[dir][0] << 16 >> 16;
    newY = y + G.nbDirs[dir][1] << 16 >> 16;
    if (coordinatesAreInMap(newX, newY) && !grid.a[grid.o + newX][newY]) {
      tempMonst = monsterAtLoc(struct_pos.$of(newX, newY));
      if (tempMonst && monstersAreTeammates(monst, tempMonst)) {
        addMonsterToContiguousMonsterGrid(newX, newY, monst, grid);
      }
    }
  }
}

function alliedCloneCount(monst: struct_creature | null): number {
  let count = 0;
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let temp = nextCreature(it);
    if (temp !== monst && temp.info.monsterID >>> 0 === monst.info.monsterID >>> 0 && monstersAreTeammates(temp, monst)) {
      count = count + 1 << 16 >> 16;
    }
  }
  if (G.rogue.depthLevel > 1) {
    for (let it = iterateCreatures($sadd(G.levels, (G.rogue.depthLevel - 2)).monsters); hasNextCreature(it); ) {
      let temp = nextCreature(it);
      if (temp !== monst && temp.info.monsterID >>> 0 === monst.info.monsterID >>> 0 && monstersAreTeammates(temp, monst)) {
        count = count + 1 << 16 >> 16;
      }
    }
  }
  if (G.gameConst.deepestLevel > G.rogue.depthLevel) {
    for (let it = iterateCreatures($sadd(G.levels, G.rogue.depthLevel).monsters); hasNextCreature(it); ) {
      let temp = nextCreature(it);
      if (temp !== monst && temp.info.monsterID >>> 0 === monst.info.monsterID >>> 0 && monstersAreTeammates(temp, monst)) {
        count = count + 1 << 16 >> 16;
      }
    }
  }
  return count;
}

export async function splitMonster(monst: struct_creature | null, attacker: struct_creature | null): Promise<void> {
  let $t1: any;
  let buf = new Int8Array(237);
  let monstName = new Int8Array(79);
  let monsterGrid = $arr(79, () => new Int8Array(29));
  let eligibleGrid = $arr(79, () => new Int8Array(29));
  let clone = null;
  let loc = struct_pos.$of(-1, -1).$clone();
  if ((monst.info.abilityFlags & MA_CLONE_SELF_ON_DEFEND) >>> 0 && alliedCloneCount(monst) < 100 && monst.currentHP > 0 && !((monst.bookkeepingFlags & MB_IS_DYING) >>> 0)) {
    if (distanceBetween(monst.loc, attacker.loc) <= 1) {
      loc.$cp(attacker.loc);
    }
  } else {
    return;
  }
  zeroOutGrid(P(monsterGrid));
  zeroOutGrid(P(eligibleGrid));
  let eligibleLocationCount = 0;
  if (isPosInMap(loc)) {
    monsterGrid[loc.x][loc.y] = true_;
  }
  addMonsterToContiguousMonsterGrid(monst.loc.x, monst.loc.y, monst, P(monsterGrid));
  for (let i = 0; DCOLS > i; ++i) {
    for (let j = 0; DROWS > j; ++j) {
      if (monsterGrid[i][j]) {
        for (let dir = 0; 4 > dir; ++dir) {
          let newX = i + G.nbDirs[dir][0];
          let newY = j + G.nbDirs[dir][1];
          if (coordinatesAreInMap(newX << 16 >> 16, newY << 16 >> 16) && !eligibleGrid[newX][newY] && !monsterGrid[newX][newY] && !(($at2(G.pmap, newX, newY).flags & (HAS_PLAYER | HAS_MONSTER)) >>> 0) && !monsterAvoids(monst, struct_pos.$of(newX << 16 >> 16, newY << 16 >> 16))) {
            eligibleGrid[newX][newY] = true_;
            ++eligibleLocationCount;
          }
        }
      }
    }
  }
  if (eligibleLocationCount) {
    let randIndex = rand_range(1, eligibleLocationCount) | 0;
    for (let i = 0; DCOLS > i; ++i) {
      for (let j = 0; DROWS > j; ++j) {
        if (eligibleGrid[i][j] && !--randIndex) {
          monsterName(P(monstName), monst, true_);
          monst.currentHP = ((monst.currentHP + 1) / 2 | 0) << 16 >> 16;
          clone = await cloneMonster(monst, false_, false_);
          if (monst.mutationIndex >= 0) {
            clone.info.flags = (clone.info.flags & (G.monsterCatalog[clone.info.monsterID].flags | G.mutationCatalog[monst.mutationIndex].monsterFlags) >>> 0) >>> 0;
            clone.info.abilityFlags = (clone.info.abilityFlags & (G.monsterCatalog[clone.info.monsterID].abilityFlags | G.mutationCatalog[monst.mutationIndex].monsterAbilityFlags) >>> 0) >>> 0;
          } else {
            clone.info.flags = (clone.info.flags & G.monsterCatalog[clone.info.monsterID].flags) >>> 0;
            clone.info.abilityFlags = (clone.info.abilityFlags & G.monsterCatalog[clone.info.monsterID].abilityFlags) >>> 0;
          }
          for (let b = 0; 20 > b; ++b) {
            clone.info.bolts[b] = G.monsterCatalog[clone.info.monsterID].bolts[b];
          }
          if (!((clone.info.flags & MONST_FLIES) >>> 0) && clone.status[STATUS_LEVITATING] === 1000) {
            clone.status[STATUS_LEVITATING] = 0;
          }
          clone.loc.$cp(struct_pos.$of(i << 16 >> 16, j << 16 >> 16));
          ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags | HAS_MONSTER) >>> 0);
          clone.ticksUntilTurn = (clone.ticksUntilTurn > 101 ? clone.ticksUntilTurn : 101) << 16 >> 16;
          await fadeInMonster(clone);
          await refreshSideBar(-1, -1, false_);
          if (canDirectlySeeMonster(monst)) {
            sprintf(P(buf), S("%s splits in two!"), P(monstName));
            await message(P(buf), 0);
          }
          return;
        }
      }
    }
  }
}

export function moralAttack(attacker: struct_creature | null, defender: struct_creature | null): void {
  if (defender.currentHP > 0 && !((defender.bookkeepingFlags & MB_IS_DYING) >>> 0)) {
    if (defender.status[STATUS_PARALYZED]) {
      defender.status[STATUS_PARALYZED] = 0;
      defender.ticksUntilTurn = (100 > attacker.attackSpeed ? attacker.attackSpeed : 100) - 1 << 16 >> 16;
    }
    if (defender.status[STATUS_MAGICAL_FEAR]) {
      defender.status[STATUS_MAGICAL_FEAR] = 1;
    }
    defender.status[STATUS_ENTRANCED] = 0;
    if ((defender.info.abilityFlags & MA_AVOID_CORRIDORS) >>> 0) {
      defender.status[STATUS_ENRAGED] = defender.maxStatus[STATUS_ENRAGED] = 4;
    }
    if (attacker === G.player && defender.creatureState >>> 0 === MONSTER_ALLY && !defender.status[STATUS_DISCORDANT] && !attacker.status[STATUS_CONFUSED] && !((attacker.bookkeepingFlags & MB_IS_DYING) >>> 0)) {
      unAlly(defender);
    }
    if ((attacker === G.player || attacker.creatureState >>> 0 === MONSTER_ALLY) && defender !== G.player && defender.creatureState >>> 0 !== MONSTER_ALLY) {
      alertMonster(defender);
    }
  }
}

export function handlePaladinFeat(defender: struct_creature | null): void {
  if (G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_PALADIN] && defender.creatureState >>> 0 !== MONSTER_TRACKING_SCENT && (G.player.status[STATUS_TELEPATHIC] || canSeeMonster(defender)) && !((defender.info.flags & (MONST_INANIMATE | MONST_TURRET | MONST_IMMOBILE | MONST_INVULNERABLE)) >>> 0) && !((G.player.bookkeepingFlags & MB_SEIZED) >>> 0) && defender !== G.player) {
    G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_PALADIN] = false_;
  }
}

function playerImmuneToMonster(monst: struct_creature | null): number {
  if (monst !== G.player && G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0 && G.rogue.armor.enchant2 === A_IMMUNITY && monsterIsInClass(monst, G.rogue.armor.vorpalEnemy << 16 >> 16)) {
    return true_;
  } else {
    return false_;
  }
}

async function specialHit(attacker: struct_creature | null, defender: struct_creature | null, damage: number): Promise<void> {
  let itemCandidates = 0;
  let randItemIndex = 0;
  let stolenQuantity = 0;
  let theItem = null;
  let itemFromTopOfStack = null;
  let buf = new Int8Array(100);
  let buf2 = new Int8Array(100);
  let buf3 = new Int8Array(100);
  if (!((attacker.info.abilityFlags & SPECIAL_HIT) >>> 0)) {
    return;
  }
  if (defender === G.player) {
    if (playerImmuneToMonster(attacker)) {
      return;
    }
    if ((attacker.info.abilityFlags & MA_HIT_DEGRADE_ARMOR) >>> 0 && defender === G.player && G.rogue.armor && !((G.rogue.armor.flags & ITEM_PROTECTED) >>> 0) && G.rogue.armor.enchant1 + (G.rogue.armor.armor / 10 | 0) > -10) {
      G.rogue.armor.enchant1 = G.rogue.armor.enchant1 - 1 << 16 >> 16;
      await equipItem(G.rogue.armor, true_, null);
      itemName(G.rogue.armor, P(buf2), false_, false_, null);
      sprintf(P(buf), S("your %s weakens!"), P(buf2));
      await messageWithColor(P(buf), G.itemMessageColor, 0);
      await checkForDisenchantment(G.rogue.armor);
    }
    if ((attacker.info.abilityFlags & MA_HIT_HALLUCINATE) >>> 0) {
      if (!G.player.status[STATUS_HALLUCINATING]) {
        await combatMessage(S("you begin to hallucinate"), null);
      }
      if (!G.player.status[STATUS_HALLUCINATING]) {
        G.player.maxStatus[STATUS_HALLUCINATING] = 0;
      }
      G.player.status[STATUS_HALLUCINATING] += G.gameConst.onHitHallucinateDuration;
      G.player.maxStatus[STATUS_HALLUCINATING] = (G.player.maxStatus[STATUS_HALLUCINATING] > G.player.status[STATUS_HALLUCINATING] ? G.player.maxStatus[STATUS_HALLUCINATING] : G.player.status[STATUS_HALLUCINATING]) << 16 >> 16;
    }
    if ((attacker.info.abilityFlags & MA_HIT_BURN) >>> 0 && !defender.status[STATUS_IMMUNE_TO_FIRE]) {
      await exposeCreatureToFire(defender);
    }
    if ((attacker.info.abilityFlags & MA_HIT_STEAL_FLEE) >>> 0 && !attacker.carriedItem && G.packItems.nextItem && attacker.currentHP > 0 && !attacker.status[STATUS_CONFUSED] && attackHit(attacker, defender)) {
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
        if (theItem) {
          if (theItem.category & WEAPON) {
            if (theItem.quantity > 3) {
              stolenQuantity = ((theItem.quantity + 1) / 2 | 0) << 16 >> 16;
            } else {
              stolenQuantity = theItem.quantity;
            }
          } else {
            stolenQuantity = 1;
          }
          if (theItem.quantity > stolenQuantity) {
            itemFromTopOfStack = await generateItem(ALL_ITEMS, -1);
            itemFromTopOfStack.$cp(theItem);
            theItem.quantity = theItem.quantity - stolenQuantity << 16 >> 16;
            itemFromTopOfStack.quantity = stolenQuantity;
            theItem = itemFromTopOfStack;
          } else {
            if (G.rogue.swappedIn === theItem || G.rogue.swappedOut === theItem) {
              G.rogue.swappedIn = null;
              G.rogue.swappedOut = null;
            }
            removeItemFromChain(theItem, G.packItems);
          }
          theItem.flags = (theItem.flags & ~ITEM_PLAYER_AVOIDS >>> 0) >>> 0;
          attacker.carriedItem = theItem;
          attacker.creatureMode = MODE_PERM_FLEEING;
          attacker.creatureState = MONSTER_FLEEING;
          monsterName(P(buf2), attacker, true_);
          itemName(theItem, P(buf3), false_, true_, null);
          sprintf(P(buf), S("%s stole %s!"), P(buf2), P(buf3));
          await messageWithColor(P(buf), G.badMessageColor, 0);
          G.rogue.autoPlayingLevel = false_;
        }
      }
    }
  }
  if ((attacker.info.abilityFlags & MA_POISONS) >>> 0 && damage > 0 && !((defender.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
    await addPoison(defender, damage, 1);
  }
  if ((attacker.info.abilityFlags & MA_CAUSES_WEAKNESS) >>> 0 && damage > 0 && !((defender.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
    await weaken(defender, G.gameConst.onHitWeakenDuration << 16 >> 16);
  }
  if ((attacker.info.abilityFlags & MA_ATTACKS_STAGGER) >>> 0) {
    await processStaggerHit(attacker, defender);
  }
}

async function forceWeaponHit(defender: struct_creature | null, theItem: struct_item | null): Promise<number> {
  let forceDamage = 0;
  let buf = new Int8Array(237);
  let buf2 = new Int8Array(100);
  let monstName = new Int8Array(79);
  let otherMonster = null;
  let knowFirstMonsterDied = false_;
  let autoID = false_;
  let theBolt = new struct_bolt();
  monsterName(P(monstName), defender, true_);
  let oldLoc = defender.loc.$clone();
  let newLoc = struct_pos.$of(defender.loc.x + ((defender.loc.x - G.player.loc.x > -1 ? defender.loc.x - G.player.loc.x : -1) > 1 ? 1 : defender.loc.x - G.player.loc.x > -1 ? defender.loc.x - G.player.loc.x : -1) << 16 >> 16, defender.loc.y + ((defender.loc.y - G.player.loc.y > -1 ? defender.loc.y - G.player.loc.y : -1) > 1 ? 1 : defender.loc.y - G.player.loc.y > -1 ? defender.loc.y - G.player.loc.y : -1) << 16 >> 16).$clone();
  if (canDirectlySeeMonster(defender) && !cellHasTerrainFlag(newLoc, T_OBSTRUCTS_PASSABILITY | T_OBSTRUCTS_VISION) && !((pmapAt(newLoc).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0)) {
    sprintf(P(buf), S("you launch %s backward with the force of your blow"), P(monstName));
    buf[DCOLS] = 0;
    await combatMessage(P(buf), messageColorFromVictim(defender));
    autoID = true_;
  }
  theBolt.$cp($sadd(G.boltCatalog, BOLT_BLINKING));
  theBolt.magnitude = (1 > Math.trunc(netEnchant(theItem) / 65536) ? 1 : Math.trunc(netEnchant(theItem) / 65536)) << 16 >> 16;
  await zap(oldLoc.$clone(), newLoc.$clone(), theBolt, false_, false_);
  if (!((defender.bookkeepingFlags & MB_IS_DYING) >>> 0) && distanceBetween(oldLoc, defender.loc) > 0 && distanceBetween(oldLoc, defender.loc) < weaponForceDistance(netEnchant(theItem))) {
    if (($at2(G.pmap, defender.loc.x + newLoc.x - oldLoc.x, defender.loc.y + newLoc.y - oldLoc.y).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0) {
      otherMonster = monsterAtLoc(struct_pos.$of(defender.loc.x + newLoc.x - oldLoc.x << 16 >> 16, defender.loc.y + newLoc.y - oldLoc.y << 16 >> 16));
      monsterName(P(buf2), otherMonster, true_);
    } else {
      otherMonster = null;
      strcpy(P(buf2), P(G.tileCatalog[$at2(G.pmap, defender.loc.x + newLoc.x - oldLoc.x, defender.loc.y + newLoc.y - oldLoc.y).layers[highestPriorityLayer(defender.loc.x + newLoc.x - oldLoc.x << 16 >> 16, defender.loc.y + newLoc.y - oldLoc.y << 16 >> 16, true_)]].description));
    }
    forceDamage = distanceBetween(oldLoc, defender.loc);
    if (!((defender.info.flags & (MONST_IMMUNE_TO_WEAPONS | MONST_INVULNERABLE)) >>> 0) && await inflictDamage(null, defender, forceDamage, G.white, false_)) {
      if (canDirectlySeeMonster(defender)) {
        knowFirstMonsterDied = true_;
        sprintf(P(buf), S("%s %s on impact with %s"), P(monstName), (defender.info.flags & MONST_INANIMATE) >>> 0 ? S("is destroyed") : S("dies"), P(buf2));
        buf[DCOLS] = 0;
        await combatMessage(P(buf), messageColorFromVictim(defender));
        autoID = true_;
      }
      await killCreature(defender, false_);
    } else {
      if (canDirectlySeeMonster(defender)) {
        sprintf(P(buf), S("%s slams against %s"), P(monstName), P(buf2));
        buf[DCOLS] = 0;
        await combatMessage(P(buf), messageColorFromVictim(defender));
        autoID = true_;
      }
    }
    moralAttack(G.player, defender);
    await splitMonster(defender, G.player);
    if (otherMonster && !((otherMonster.info.flags & (MONST_IMMUNE_TO_WEAPONS | MONST_INVULNERABLE)) >>> 0)) {
      if (await inflictDamage(null, otherMonster, forceDamage, G.white, false_)) {
        if (canDirectlySeeMonster(otherMonster)) {
          sprintf(P(buf), S("%s %s%s when %s slams into $HIMHER"), P(buf2), knowFirstMonsterDied ? S("also ") : S(""), (otherMonster.info.flags & MONST_INANIMATE) >>> 0 ? S("is destroyed") : S("dies"), P(monstName));
          resolvePronounEscapes(P(buf), otherMonster);
          buf[DCOLS] = 0;
          await combatMessage(P(buf), messageColorFromVictim(otherMonster));
          autoID = true_;
        }
        await killCreature(otherMonster, false_);
      }
      if (otherMonster.creatureState >>> 0 !== MONSTER_ALLY) {
        moralAttack(G.player, otherMonster);
        await splitMonster(otherMonster, G.player);
      }
    }
  }
  return autoID;
}

export async function magicWeaponHit(defender: struct_creature | null, theItem: struct_item | null, backstabbed: number): Promise<void> {
  let $t1: any;
  let buf = new Int8Array(237);
  let monstName = new Int8Array(79);
  let theItemName = new Int8Array(79);
  let effectColors = [G.white,
G.black,
G.yellow,
G.pink,
G.green,
G.confusionGasColor,
null,
null,
G.darkRed,
G.rainbow];
  let chance = 0;
  let i = 0;
  let enchant = 0;
  let enchantType = theItem.enchant2;
  let newMonst = null;
  let autoID = false_;
  if ((defender.bookkeepingFlags & MB_IS_DYING) >>> 0 && theItem.enchant2 !== W_SPEED && theItem.enchant2 !== W_MULTIPLICITY) {
    return;
  }
  enchant = netEnchant(theItem);
  if (theItem.enchant2 === W_SLAYING) {
    chance = (monsterIsInClass(defender, theItem.vorpalEnemy << 16 >> 16) ? 100 : 0) << 16 >> 16;
  } else if ((defender.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0) {
    chance = 0;
  } else {
    chance = runicWeaponChance(theItem, false_, 0);
    if (backstabbed && 100 > chance) {
      chance = (((chance + 100) / 2 | 0) > chance * 2 ? chance * 2 : (chance + 100) / 2 | 0) << 16 >> 16;
    }
  }
  if (chance > 0 && rand_percent(chance)) {
    if (!((defender.bookkeepingFlags & MB_SUBMERGED) >>> 0)) {
      switch (enchantType >>> 0) {
      case W_SPEED:
        createFlare(G.player.loc.x, G.player.loc.y, SCROLL_ENCHANTMENT_LIGHT);
        break;
      case W_QUIETUS:
        createFlare(defender.loc.x, defender.loc.y, QUIETUS_FLARE_LIGHT);
        break;
      case W_SLAYING:
        createFlare(defender.loc.x, defender.loc.y, SLAYING_FLARE_LIGHT);
        break;
      default:
        flashMonster(defender, effectColors[enchantType], 100);
        break;
      }
      autoID = true_;
    }
    G.rogue.disturbed = true_;
    monsterName(P(monstName), defender, true_);
    itemName(theItem, P(theItemName), false_, false_, null);
    switch (enchantType >>> 0) {
    case W_SPEED:
      if (G.player.ticksUntilTurn !== -1) {
        sprintf(P(buf), S("your %s trembles and time freezes for a moment"), P(theItemName));
        buf[DCOLS] = 0;
        await combatMessage(P(buf), null);
        G.player.ticksUntilTurn = -1;
        autoID = true_;
      }
      break;
    case W_SLAYING:
    case W_QUIETUS:
      await inflictLethalDamage(G.player, defender);
      sprintf(P(buf), S("%s suddenly %s"), P(monstName), (defender.info.flags & MONST_INANIMATE) >>> 0 ? S("shatters") : S("dies"));
      buf[DCOLS] = 0;
      await combatMessage(P(buf), messageColorFromVictim(defender));
      await killCreature(defender, false_);
      autoID = true_;
      break;
    case W_PARALYSIS:
      defender.status[STATUS_PARALYZED] = (defender.status[STATUS_PARALYZED] > weaponParalysisDuration(enchant) ? defender.status[STATUS_PARALYZED] : weaponParalysisDuration(enchant)) << 16 >> 16;
      defender.maxStatus[STATUS_PARALYZED] = defender.status[STATUS_PARALYZED];
      if (canDirectlySeeMonster(defender)) {
        sprintf(P(buf), S("%s is frozen in place"), P(monstName));
        buf[DCOLS] = 0;
        await combatMessage(P(buf), messageColorFromVictim(defender));
        autoID = true_;
      }
      break;
    case W_MULTIPLICITY:
      sprintf(P(buf), S("Your %s emits a flash of light, and %sspectral duplicate%s appear%s!"), P(theItemName), weaponImageCount(enchant) === 1 ? S("a ") : S(""), weaponImageCount(enchant) === 1 ? S("") : S("s"), weaponImageCount(enchant) === 1 ? S("s") : S(""));
      buf[DCOLS] = 0;
      for (i = 0; i < weaponImageCount(enchant); i = i + 1 << 16 >> 16) {
        newMonst = generateMonster(MK_SPECTRAL_IMAGE, true_, false_);
        newMonst.loc.$cp(getQualifyingPathLocNear(defender.loc.$clone(), true_, (T_DIVIDES_LEVEL & avoidedFlagsForMonster(newMonst.info)) >>> 0, HAS_PLAYER, avoidedFlagsForMonster(newMonst.info), HAS_PLAYER | HAS_MONSTER | HAS_STAIRS, false_));
        newMonst.bookkeepingFlags = (newMonst.bookkeepingFlags | (MB_FOLLOWER | MB_BOUND_TO_LEADER | MB_DOES_NOT_TRACK_LEADER | MB_TELEPATHICALLY_REVEALED)) >>> 0;
        newMonst.bookkeepingFlags = (newMonst.bookkeepingFlags & ~MB_JUST_SUMMONED >>> 0) >>> 0;
        newMonst.leader = G.player;
        newMonst.creatureState = MONSTER_ALLY;
        if ((theItem.flags & ITEM_ATTACKS_STAGGER) >>> 0) {
          newMonst.info.attackSpeed = newMonst.info.attackSpeed * 2 << 16 >> 16;
          newMonst.info.abilityFlags = (newMonst.info.abilityFlags | MA_ATTACKS_STAGGER) >>> 0;
        }
        if ((theItem.flags & ITEM_ATTACKS_QUICKLY) >>> 0) {
          newMonst.info.attackSpeed = (newMonst.info.attackSpeed / 2 | 0) << 16 >> 16;
        }
        if ((theItem.flags & ITEM_ATTACKS_PENETRATE) >>> 0) {
          newMonst.info.abilityFlags = (newMonst.info.abilityFlags | MA_ATTACKS_PENETRATE) >>> 0;
        }
        if ((theItem.flags & ITEM_ATTACKS_ALL_ADJACENT) >>> 0) {
          newMonst.info.abilityFlags = (newMonst.info.abilityFlags | MA_ATTACKS_ALL_ADJACENT) >>> 0;
        }
        if ((theItem.flags & ITEM_ATTACKS_EXTEND) >>> 0) {
          newMonst.info.abilityFlags = (newMonst.info.abilityFlags | MA_ATTACKS_EXTEND) >>> 0;
        }
        newMonst.ticksUntilTurn = 100;
        newMonst.info.accuracy = G.player.info.accuracy + Math.trunc($mul64(5, netEnchant(theItem)) / FP_FACTOR) << 16 >> 16;
        newMonst.info.damage.$cp(G.player.info.damage);
        newMonst.status[STATUS_LIFESPAN_REMAINING] = newMonst.maxStatus[STATUS_LIFESPAN_REMAINING] = weaponImageDuration(enchant);
        if (strLenWithoutEscapes(P(theItemName)) <= 8) {
          sprintf(P(newMonst.info.monsterName), S("spectral %s"), P(theItemName));
        } else {
          switch (G.rogue.weapon.kind) {
          case BROADSWORD:
            strcpy(P(newMonst.info.monsterName), S("spectral sword"));
            break;
          case HAMMER:
            strcpy(P(newMonst.info.monsterName), S("spectral hammer"));
            break;
          case PIKE:
            strcpy(P(newMonst.info.monsterName), S("spectral pike"));
            break;
          case WAR_AXE:
            strcpy(P(newMonst.info.monsterName), S("spectral axe"));
            break;
          default:
            strcpy(P(newMonst.info.monsterName), S("spectral weapon"));
            break;
          }
        }
        ($t1 = pmapAt(newMonst.loc), $t1.flags = ($t1.flags | HAS_MONSTER) >>> 0);
        await fadeInMonster(newMonst);
      }
      await updateVision(true_);
      await message(P(buf), 0);
      autoID = true_;
      break;
    case W_SLOWING:
      await slow(defender, weaponSlowDuration(enchant));
      if (canDirectlySeeMonster(defender)) {
        sprintf(P(buf), S("%s slows down"), P(monstName));
        buf[DCOLS] = 0;
        await combatMessage(P(buf), messageColorFromVictim(defender));
        autoID = true_;
      }
      break;
    case W_CONFUSION:
      defender.status[STATUS_CONFUSED] = (defender.status[STATUS_CONFUSED] > weaponConfusionDuration(enchant) ? defender.status[STATUS_CONFUSED] : weaponConfusionDuration(enchant)) << 16 >> 16;
      defender.maxStatus[STATUS_CONFUSED] = defender.status[STATUS_CONFUSED];
      if (canDirectlySeeMonster(defender)) {
        sprintf(P(buf), S("%s looks very confused"), P(monstName));
        buf[DCOLS] = 0;
        await combatMessage(P(buf), messageColorFromVictim(defender));
        autoID = true_;
      }
      break;
    case W_FORCE:
      autoID = await forceWeaponHit(defender, theItem);
      break;
    case W_MERCY:
      await heal(defender, G.gameConst.onHitMercyHealPercent << 16 >> 16, false_);
      if (canSeeMonster(defender)) {
        autoID = true_;
      }
      break;
    case W_PLENTY:
      newMonst = await cloneMonster(defender, true_, true_);
      if (newMonst) {
        flashMonster(newMonst, effectColors[enchantType], 100);
        if (canSeeMonster(newMonst)) {
          autoID = true_;
        }
      }
      break;
    default:
      break;
    }
  }
  if (autoID) {
    await autoIdentify(theItem);
  }
}

function attackVerb(returnString: Ptr | null, attacker: struct_creature | null, hitPercentile: number): void {
  let verbCount = 0;
  let increment = 0;
  if (attacker !== G.player && (G.player.status[STATUS_HALLUCINATING] || !canSeeMonster(attacker))) {
    strcpy(returnString, S("hits"));
    return;
  }
  if (attacker === G.player && !G.rogue.weapon) {
    strcpy(returnString, S("punch"));
    return;
  }
  for (verbCount = 0; 4 > verbCount && G.monsterText[attacker.info.monsterID].attack[verbCount + 1][0] !== 0; verbCount = verbCount + 1 << 16 >> 16) {
    ;
  }
  increment = (100 / (verbCount + 1) | 0) << 16 >> 16;
  hitPercentile = (0 > (Math.imul(increment, verbCount + 1) - 1 > hitPercentile ? hitPercentile : Math.imul(increment, verbCount + 1) - 1) ? 0 : Math.imul(increment, verbCount + 1) - 1 > hitPercentile ? hitPercentile : Math.imul(increment, verbCount + 1) - 1) << 16 >> 16;
  strcpy(returnString, P(G.monsterText[attacker.info.monsterID].attack[hitPercentile / increment | 0]));
  resolvePronounEscapes(returnString, attacker);
}

export async function applyArmorRunicEffect(returnString: Ptr | null, attacker: struct_creature | null, damage: Ptr | null, melee: number): Promise<void> {
  let armorName = new Int8Array(79);
  let attackerName = new Int8Array(79);
  let monstName = new Int8Array(79);
  let buf = new Int8Array(237);
  let runicKnown = 0;
  let runicDiscovered = 0;
  let newDamage = 0;
  let dir = 0;
  let newX = 0;
  let newY = 0;
  let count = 0;
  let i = 0;
  let enchant = 0;
  let monst = null;
  let hitList = new Array(8).fill(null);
  returnString.a[returnString.o] = 0;
  if (!(G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0)) {
    return;
  }
  enchant = netEnchant(G.rogue.armor);
  runicKnown = ((G.rogue.armor.flags & ITEM_RUNIC_IDENTIFIED) >>> 0) << 24 >> 24;
  runicDiscovered = false_;
  itemName(G.rogue.armor, P(armorName), false_, false_, null);
  monsterName(P(attackerName), attacker, true_);
  switch (G.rogue.armor.enchant2) {
  case A_MULTIPLICITY:
    if (melee && !((attacker.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0) && rand_percent(33)) {
      for (i = 0; i < armorImageCount(enchant); i = i + 1 << 16 >> 16) {
        monst = await cloneMonster(attacker, false_, true_);
        monst.bookkeepingFlags = (monst.bookkeepingFlags | (MB_FOLLOWER | MB_BOUND_TO_LEADER | MB_DOES_NOT_TRACK_LEADER | MB_TELEPATHICALLY_REVEALED)) >>> 0;
        monst.info.flags = (monst.info.flags | MONST_DIES_IF_NEGATED) >>> 0;
        monst.bookkeepingFlags = (monst.bookkeepingFlags & ~(MB_JUST_SUMMONED | MB_SEIZED | MB_SEIZING) >>> 0) >>> 0;
        monst.info.abilityFlags = (monst.info.abilityFlags & ~(MA_CAST_SUMMON | MA_DF_ON_DEATH) >>> 0) >>> 0;
        monst.leader = G.player;
        monst.creatureState = MONSTER_ALLY;
        monst.status[STATUS_DISCORDANT] = 0;
        monst.ticksUntilTurn = 100;
        monst.info.monsterID = MK_SPECTRAL_IMAGE;
        if (monst.carriedMonster) {
          let carried = monst.carriedMonster;
          monst.carriedMonster = null;
          await killCreature(carried, true_);
        }
        monst.info.intrinsicLightType = SPECTRAL_IMAGE_LIGHT;
        monst.info.foreColor = G.spectralImageColor;
        monst.status[STATUS_LIFESPAN_REMAINING] = monst.maxStatus[STATUS_LIFESPAN_REMAINING] = 3;
        monst.currentHP = monst.info.maxHP = 1;
        monst.info.defense = 0;
        if (strLenWithoutEscapes(P(attacker.info.monsterName)) <= 6) {
          sprintf(P(monst.info.monsterName), S("spectral %s"), P(attacker.info.monsterName));
        } else {
          strcpy(P(monst.info.monsterName), S("spectral clone"));
        }
        await fadeInMonster(monst);
      }
      await updateVision(true_);
      runicDiscovered = true_;
      sprintf(returnString, S("Your %s flashes, and spectral images of %s appear!"), P(armorName), P(attackerName));
    }
    break;
  case A_MUTUALITY:
    if (damage.a[damage.o] > 0) {
      count = 0;
      for (i = 0; 8 > i; i = i + 1 << 16 >> 16) {
        hitList[i] = null;
        dir = i % 8 << 16 >> 16;
        newX = G.player.loc.x + G.nbDirs[dir][0] << 16 >> 16;
        newY = G.player.loc.y + G.nbDirs[dir][1] << 16 >> 16;
        if (coordinatesAreInMap(newX, newY) && ($at2(G.pmap, newX, newY).flags & HAS_MONSTER) >>> 0) {
          monst = monsterAtLoc(struct_pos.$of(newX, newY));
          if (monst && monst !== attacker && monstersAreEnemies(G.player, monst) && !((monst.info.flags & (MONST_IMMUNE_TO_WEAPONS | MONST_INVULNERABLE)) >>> 0) && !((monst.bookkeepingFlags & MB_IS_DYING) >>> 0)) {
            hitList[i] = monst;
            count = count + 1 << 16 >> 16;
          }
        }
      }
      if (count) {
        for (i = 0; 8 > i; i = i + 1 << 16 >> 16) {
          if (hitList[i] && !((hitList[i].bookkeepingFlags & MB_IS_DYING) >>> 0)) {
            monsterName(P(monstName), hitList[i], true_);
            if (await inflictDamage(G.player, hitList[i], ((damage.a[damage.o] + count) / (count + 1) | 0) << 16 >> 16, G.blue, true_)) {
              if (canSeeMonster(hitList[i])) {
                sprintf(P(buf), S("%s %s"), P(monstName), (hitList[i].info.flags & MONST_INANIMATE) >>> 0 ? S("is destroyed") : S("dies"));
                await combatMessage(P(buf), messageColorFromVictim(hitList[i]));
              }
              await killCreature(hitList[i], false_);
            }
          }
        }
        runicDiscovered = true_;
        if (!runicKnown) {
          sprintf(returnString, S("Your %s pulses, and the damage is shared with %s!"), P(armorName), count === 1 ? P(monstName) : S("the other adjacent enemies"));
        }
        damage.a[damage.o] = ((damage.a[damage.o] + count) / (count + 1) | 0) << 16 >> 16;
      }
    }
    break;
  case A_ABSORPTION:
    damage.a[damage.o] = damage.a[damage.o] - rand_range(1, armorAbsorptionMax(enchant)) << 16 >> 16;
    if (0 >= damage.a[damage.o]) {
      damage.a[damage.o] = 0;
      runicDiscovered = true_;
      if (!runicKnown) {
        sprintf(returnString, S("your %s pulses and absorbs the blow!"), P(armorName));
      }
    }
    break;
  case A_REPRISAL:
    if (melee && !((attacker.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
      newDamage = (1 > (Math.imul(armorReprisalPercent(enchant), damage.a[damage.o]) / 100 | 0) ? 1 : Math.imul(armorReprisalPercent(enchant), damage.a[damage.o]) / 100 | 0) << 16 >> 16;
      if (await inflictDamage(G.player, attacker, newDamage, G.blue, true_)) {
        if (canSeeMonster(attacker)) {
          sprintf(returnString, S("your %s pulses and %s drops dead!"), P(armorName), P(attackerName));
          runicDiscovered = true_;
        }
        await killCreature(attacker, false_);
      } else if (!runicKnown) {
        if (canSeeMonster(attacker)) {
          sprintf(returnString, S("your %s pulses and %s shudders in pain!"), P(armorName), P(attackerName));
          runicDiscovered = true_;
        }
      }
    }
    break;
  case A_IMMUNITY:
    if (monsterIsInClass(attacker, G.rogue.armor.vorpalEnemy << 16 >> 16)) {
      damage.a[damage.o] = 0;
      runicDiscovered = true_;
    }
    break;
  case A_BURDEN:
    if (rand_percent(10)) {
      G.rogue.armor.strengthRequired = G.rogue.armor.strengthRequired + 1 << 16 >> 16;
      sprintf(returnString, S("your %s suddenly feels heavier!"), P(armorName));
      await equipItem(G.rogue.armor, true_, null);
      runicDiscovered = true_;
    }
    break;
  case A_VULNERABILITY:
    damage.a[damage.o] = damage.a[damage.o] * 2 << 16 >> 16;
    if (!runicKnown) {
      sprintf(returnString, S("your %s pulses and you are wracked with pain!"), P(armorName));
      runicDiscovered = true_;
    }
    break;
  case A_IMMOLATION:
    if (rand_percent(10)) {
      sprintf(returnString, S("flames suddenly explode out of your %s!"), P(armorName));
      await message(returnString, $u64(runicKnown ? 0 : REQUIRE_ACKNOWLEDGMENT));
      returnString.a[returnString.o] = 0;
      await spawnDungeonFeature(G.player.loc.x, G.player.loc.y, G.dungeonFeatureCatalog[DF_ARMOR_IMMOLATION], true_, false_);
      runicDiscovered = true_;
    }
  default:
    break;
  }
  if (runicDiscovered && !runicKnown) {
    await autoIdentify(G.rogue.armor);
  }
}

async function decrementWeaponAutoIDTimer(): Promise<void> {
  let buf = new Int8Array(300);
  let buf2 = new Int8Array(300);
  if (G.rogue.weapon && !((G.rogue.weapon.flags & ITEM_IDENTIFIED) >>> 0) && !(G.rogue.weapon.charges = G.rogue.weapon.charges - 1 << 16 >> 16)) {
    G.rogue.weapon.flags = (G.rogue.weapon.flags | ITEM_IDENTIFIED) >>> 0;
    updateIdentifiableItems();
    await messageWithColor(S("you are now familiar enough with your weapon to identify it."), G.itemMessageColor, 0);
    itemName(G.rogue.weapon, P(buf2), true_, true_, null);
    sprintf(P(buf), S("%s %s."), G.rogue.weapon.quantity > 1 ? S("they are") : S("it is"), P(buf2));
    await messageWithColor(P(buf), G.itemMessageColor, 0);
  }
}

export async function processStaggerHit(attacker: struct_creature | null, defender: struct_creature | null): Promise<void> {
  if ((defender.info.flags & (MONST_INVULNERABLE | MONST_IMMOBILE | MONST_INANIMATE)) >>> 0 || (defender.bookkeepingFlags & MB_CAPTIVE) >>> 0 || cellHasTerrainFlag(defender.loc, T_OBSTRUCTS_PASSABILITY)) {
    return;
  }
  let newX = ((defender.loc.x - attacker.loc.x > -1 ? defender.loc.x - attacker.loc.x : -1) > 1 ? 1 : defender.loc.x - attacker.loc.x > -1 ? defender.loc.x - attacker.loc.x : -1) + defender.loc.x << 16 >> 16;
  let newY = ((defender.loc.y - attacker.loc.y > -1 ? defender.loc.y - attacker.loc.y : -1) > 1 ? 1 : defender.loc.y - attacker.loc.y > -1 ? defender.loc.y - attacker.loc.y : -1) + defender.loc.y << 16 >> 16;
  if (coordinatesAreInMap(newX, newY) && !cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY) && !(($at2(G.pmap, newX, newY).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0)) {
    await setMonsterLocation(defender, struct_pos.$of(newX, newY));
  }
}

export async function attack(attacker: struct_creature | null, defender: struct_creature | null, lungeAttack: number): Promise<number> {
  const damage = new Int16Array(1);
  let specialDamage = 0;
  let poisonDamage = 0;
  let buf = new Int8Array(200);
  let buf2 = new Int8Array(200);
  let attackerName = new Int8Array(100);
  let defenderName = new Int8Array(100);
  let verb = new Int8Array(79);
  let explicationClause = $cs("", 79);
  let armorRunicString = new Int8Array(237);
  let sneakAttack = 0;
  let defenderWasAsleep = 0;
  let defenderWasParalyzed = 0;
  let degradesAttackerWeapon = 0;
  let sightUnseen = 0;
  if (attacker === G.player && !((defender.info.flags & MONST_IMMUNE_TO_WEAPONS) >>> 0)) {
    handlePaladinFeat(defender);
  }
  if (attacker === G.player && G.rogue.weapon && G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_PURE_MAGE] && canSeeMonster(defender)) {
    G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_PURE_MAGE] = false_;
  }
  if ((attacker.info.abilityFlags & MA_KAMIKAZE) >>> 0) {
    await killCreature(attacker, false_);
    return true_;
  }
  armorRunicString[0] = 0;
  poisonDamage = 0;
  degradesAttackerWeapon = ((defender.info.flags & MONST_DEFEND_DEGRADE_WEAPON) >>> 0 ? true_ : false_) << 24 >> 24;
  sightUnseen = (!canSeeMonster(attacker) && !canSeeMonster(defender) ? 1 : 0) << 24 >> 24;
  if (defender.status[STATUS_LEVITATING] && (attacker.info.flags & MONST_RESTRICTED_TO_LIQUID) >>> 0) {
    return false_;
  }
  if ((attacker === G.player || defender === G.player) && !G.rogue.blockCombatText) {
    G.rogue.disturbed = true_;
  }
  defender.status[STATUS_ENTRANCED] = 0;
  if (defender.status[STATUS_MAGICAL_FEAR]) {
    defender.status[STATUS_MAGICAL_FEAR] = 1;
  }
  if (attacker !== G.player && defender === G.player && attacker.creatureState >>> 0 === MONSTER_WANDERING) {
    attacker.creatureState = MONSTER_TRACKING_SCENT;
  }
  if ((defender.info.flags & MONST_INANIMATE) >>> 0) {
    sneakAttack = false_;
    defenderWasAsleep = false_;
    defenderWasParalyzed = false_;
  } else {
    sneakAttack = (defender !== G.player && attacker === G.player && defender.creatureState >>> 0 === MONSTER_WANDERING ? true_ : false_) << 24 >> 24;
    defenderWasAsleep = (defender !== G.player && defender.creatureState >>> 0 === MONSTER_SLEEPING ? true_ : false_) << 24 >> 24;
    defenderWasParalyzed = (defender.status[STATUS_PARALYZED] > 0 ? 1 : 0) << 24 >> 24;
  }
  monsterName(P(attackerName), attacker, true_);
  monsterName(P(defenderName), defender, true_);
  if ((attacker.info.abilityFlags & MA_SEIZES) >>> 0 && (!((attacker.bookkeepingFlags & MB_SEIZING) >>> 0) || !((defender.bookkeepingFlags & MB_SEIZED) >>> 0)) && (distanceBetween(attacker.loc, defender.loc) === 1 && !diagonalBlocked(attacker.loc.x, attacker.loc.y, defender.loc.x, defender.loc.y, false_))) {
    attacker.bookkeepingFlags = (attacker.bookkeepingFlags | MB_SEIZING) >>> 0;
    defender.bookkeepingFlags = (defender.bookkeepingFlags | MB_SEIZED) >>> 0;
    if (defender === G.player && (attacker.bookkeepingFlags & MB_SUBMERGED) >>> 0 && canSeeMonster(attacker)) {
      attacker.bookkeepingFlags = (attacker.bookkeepingFlags & ~MB_SUBMERGED >>> 0) >>> 0;
      monsterName(P(attackerName), attacker, true_);
    }
    if (canSeeMonster(attacker) || canSeeMonster(defender)) {
      sprintf(P(buf), S("%s seizes %s!"), P(attackerName), defender === G.player ? S("your legs") : P(defenderName));
      await messageWithColor(P(buf), G.white, 0);
    }
    return false_;
  }
  if (sneakAttack || defenderWasAsleep || defenderWasParalyzed || lungeAttack || attackHit(attacker, defender)) {
    damage[0] = ((defender.info.flags & (MONST_IMMUNE_TO_WEAPONS | MONST_INVULNERABLE)) >>> 0 ? 0 : Math.trunc($mul64(randClump(attacker.info.damage), monsterDamageAdjustmentAmount(attacker)) / FP_FACTOR)) << 16 >> 16;
    if (sneakAttack || defenderWasAsleep || defenderWasParalyzed) {
      if (defender !== G.player) {
        defender.ticksUntilTurn = defender.ticksUntilTurn + (defender.movementSpeed > defender.attackSpeed ? defender.movementSpeed : defender.attackSpeed) << 16 >> 16;
        if (defender.creatureState >>> 0 !== MONSTER_ALLY) {
          defender.creatureState = MONSTER_TRACKING_SCENT;
        }
      }
    }
    if (sneakAttack || defenderWasAsleep || defenderWasParalyzed || lungeAttack) {
      if (attacker === G.player && G.rogue.weapon && (G.rogue.weapon.flags & ITEM_SNEAK_ATTACK_BONUS) >>> 0) {
        damage[0] = damage[0] * 5 << 16 >> 16;
      } else {
        damage[0] = damage[0] * 3 << 16 >> 16;
      }
    }
    if (defender === G.player && G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0) {
      await applyArmorRunicEffect(P(armorRunicString), attacker, P(damage, 0), true_);
    }
    if (attacker === G.player && G.rogue.reaping && !((defender.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
      specialDamage = Math.imul(defender.currentHP > damage[0] ? damage[0] : defender.currentHP, G.rogue.reaping) << 16 >> 16;
      if (G.rogue.reaping > 0) {
        specialDamage = rand_range(0, specialDamage) << 16 >> 16;
      } else {
        specialDamage = rand_range(specialDamage, 0) << 16 >> 16;
      }
      if (specialDamage) {
        await rechargeItemsIncrementally(specialDamage);
      }
    }
    if (damage[0] === 0) {
      sprintf(P(explicationClause), S(" but %s no damage"), attacker === G.player ? S("do") : S("does"));
      if (attacker === G.player) {
        G.rogue.disturbed = true_;
      }
    } else if (lungeAttack) {
      strcpy(P(explicationClause), S(" with a vicious lunge attack"));
    } else if (defenderWasParalyzed) {
      sprintf(P(explicationClause), S(" while $HESHE %s paralyzed"), defender === G.player ? S("are") : S("is"));
    } else if (defenderWasAsleep) {
      strcpy(P(explicationClause), S(" in $HISHER sleep"));
    } else if (sneakAttack) {
      strcpy(P(explicationClause), S(", catching $HIMHER unaware"));
    } else if (defender.status[STATUS_STUCK] || (defender.bookkeepingFlags & MB_CAPTIVE) >>> 0) {
      sprintf(P(explicationClause), S(" while %s dangle%s helplessly"), canSeeMonster(defender) ? S("$HESHE") : S("it"), defender === G.player ? S("") : S("s"));
    }
    resolvePronounEscapes(P(explicationClause), defender);
    if ((attacker.info.abilityFlags & MA_POISONS) >>> 0 && damage[0] > 0) {
      poisonDamage = damage[0];
      damage[0] = 1;
    }
    if (await inflictDamage(attacker, defender, damage[0], G.red, false_)) {
      if (defenderWasAsleep || sneakAttack || defenderWasParalyzed || lungeAttack) {
        sprintf(P(buf), S("%s %s %s%s"), P(attackerName), (defender.info.flags & MONST_INANIMATE) >>> 0 ? S("destroyed") : S("dispatched"), P(defenderName), P(explicationClause));
      } else {
        sprintf(P(buf), S("%s %s %s%s"), P(attackerName), (defender.info.flags & MONST_INANIMATE) >>> 0 ? S("destroyed") : S("defeated"), P(defenderName), P(explicationClause));
      }
      if (sightUnseen) {
        if ((defender.info.flags & MONST_INANIMATE) >>> 0) {
          await combatMessage(S("you hear something get destroyed in combat"), null);
        } else {
          await combatMessage(S("you hear something die in combat"), null);
        }
      } else {
        await combatMessage(P(buf), damage[0] > 0 ? messageColorFromVictim(defender) : G.white);
      }
      await killCreature(defender, false_);
      if (G.player === defender) {
        await gameOver(P(attacker.info.monsterName), false_);
        return true_;
      } else if (G.player === attacker && defender.info.monsterID >>> 0 === MK_DRAGON) {
        G.rogue.featRecord.a[G.rogue.featRecord.o + FEAT_DRAGONSLAYER] = true_;
      }
    } else {
      if (!G.rogue.blockCombatText && (canSeeMonster(attacker) || canSeeMonster(defender))) {
        attackVerb(P(verb), attacker, Math.trunc($mul64(damage[0] - Math.trunc($mul64(attacker.info.damage.lowerBound, monsterDamageAdjustmentAmount(attacker)) / 65536) > 0 ? damage[0] - Math.trunc($mul64(attacker.info.damage.lowerBound, monsterDamageAdjustmentAmount(attacker)) / 65536) : 0, 100) / (1 > Math.trunc($mul64(attacker.info.damage.upperBound - attacker.info.damage.lowerBound, monsterDamageAdjustmentAmount(attacker)) / 65536) ? 1 : Math.trunc($mul64(attacker.info.damage.upperBound - attacker.info.damage.lowerBound, monsterDamageAdjustmentAmount(attacker)) / 65536))) << 16 >> 16);
        sprintf(P(buf), S("%s %s %s%s"), P(attackerName), P(verb), P(defenderName), P(explicationClause));
        if (sightUnseen) {
          if (!G.rogue.heardCombatThisTurn) {
            G.rogue.heardCombatThisTurn = true_;
            await combatMessage(S("you hear combat in the distance"), null);
          }
        } else {
          await combatMessage(P(buf), messageColorFromVictim(defender));
        }
      }
      if (attacker === G.player && G.rogue.weapon && (G.rogue.weapon.flags & ITEM_ATTACKS_STAGGER) >>> 0) {
        await processStaggerHit(attacker, defender);
      }
      if ((attacker.info.abilityFlags & SPECIAL_HIT) >>> 0) {
        await specialHit(attacker, defender, ((attacker.info.abilityFlags & MA_POISONS) >>> 0 ? poisonDamage : damage[0]) << 16 >> 16);
      }
      if (armorRunicString[0]) {
        await message(P(armorRunicString), 0);
        if (G.rogue.armor && (G.rogue.armor.flags & ITEM_RUNIC) >>> 0 && G.rogue.armor.enchant2 === A_BURDEN) {
          await strengthCheck(G.rogue.armor, true_);
        }
      }
    }
    moralAttack(attacker, defender);
    if (attacker === G.player && G.rogue.weapon && (G.rogue.weapon.flags & ITEM_RUNIC) >>> 0) {
      await magicWeaponHit(defender, G.rogue.weapon, (sneakAttack || defenderWasAsleep || defenderWasParalyzed ? 1 : 0) << 24 >> 24);
    }
    await splitMonster(defender, attacker);
    if (attacker === G.player && (defender.bookkeepingFlags & MB_IS_DYING) >>> 0 && (defender.bookkeepingFlags & MB_WEAPON_AUTO_ID) >>> 0) {
      await decrementWeaponAutoIDTimer();
    }
    if (degradesAttackerWeapon && attacker === G.player && G.rogue.weapon && !((G.rogue.weapon.flags & ITEM_PROTECTED) >>> 0) && !((G.rogue.weapon.flags & ITEM_RUNIC) >>> 0 && G.rogue.weapon.enchant2 === W_SLAYING && monsterIsInClass(defender, G.rogue.weapon.vorpalEnemy << 16 >> 16)) && G.rogue.weapon.enchant1 >= -10) {
      G.rogue.weapon.enchant1 = G.rogue.weapon.enchant1 - 1 << 16 >> 16;
      if (G.rogue.weapon.quiverNumber) {
        G.rogue.weapon.quiverNumber = rand_range(1, 60000) & 0xffff;
      }
      await equipItem(G.rogue.weapon, true_, null);
      itemName(G.rogue.weapon, P(buf2), false_, false_, null);
      sprintf(P(buf), S("your %s weakens!"), P(buf2));
      await messageWithColor(P(buf), G.itemMessageColor, 0);
      await checkForDisenchantment(G.rogue.weapon);
    }
    return true_;
  } else {
    if (!G.rogue.blockCombatText) {
      if (sightUnseen) {
        if (!G.rogue.heardCombatThisTurn) {
          G.rogue.heardCombatThisTurn = true_;
          await combatMessage(S("you hear combat in the distance"), null);
        }
      } else {
        sprintf(P(buf), S("%s missed %s"), P(attackerName), P(defenderName));
        await combatMessage(P(buf), null);
      }
    }
    return false_;
  }
}

export function strLenWithoutEscapes(str: Ptr | null): number {
  let i = 0;
  let count = 0;
  count = 0;
  for (i = 0; str.a[str.o + i]; ) {
    if (str.a[str.o + i] === COLOR_ESCAPE) {
      i = i + 4 << 16 >> 16;
      continue;
    }
    count = count + 1 << 16 >> 16;
    i = i + 1 << 16 >> 16;
  }
  return count;
}

export async function combatMessage(theMsg: Ptr | null, theColor: struct_color | null): Promise<void> {
  let length = 0;
  let newMsg = new Int8Array(199);
  if (!theColor) {
    theColor = G.white;
  }
  newMsg[0] = 0;
  encodeMessageColor(P(newMsg), 0, theColor);
  length = strlen(P(newMsg)) << 16 >> 16;
  strncat(P(newMsg, length), theMsg, $u64(COLS * 2 - 1 - length - 1));
  length = strlen(P(G.combatText)) << 16 >> 16;
  if ($u64(length) + strlen(P(newMsg)) > COLS * 2 - 2) {
    await displayCombatText();
  }
  if (G.combatText[0]) {
    snprintf(P(G.combatText, length), $u64(COLS * 2 - length), S("\n%s"), P(newMsg));
  } else {
    strcpy(P(G.combatText), P(newMsg));
  }
}

export async function displayCombatText(): Promise<void> {
  let buf = new Int8Array(200);
  let start = null;
  let end = null;
  if (G.combatText[0] === 0) {
    return;
  }
  strcpy(P(buf), P(G.combatText));
  G.combatText[0] = 0;
  start = P(buf);
  for (end = start; end.a[end.o] !== 0; end = end.add(1)) {
    if (end.a[end.o] === 10) {
      end.a[end.o] = 0;
      await message(start, $u64(FOLDABLE | (G.rogue.cautiousMode ? REQUIRE_ACKNOWLEDGMENT : 0)));
      start = end.add(1);
    }
  }
  await message(start, $u64(FOLDABLE | (G.rogue.cautiousMode ? REQUIRE_ACKNOWLEDGMENT : 0)));
  G.rogue.cautiousMode = false_;
}

export function flashMonster(monst: struct_creature | null, theColor: struct_color | null, strength: number): void {
  if (!theColor) {
    return;
  }
  if (!((monst.bookkeepingFlags & MB_WILL_FLASH) >>> 0) || strength > monst.flashStrength) {
    monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_WILL_FLASH) >>> 0;
    monst.flashStrength = strength;
    monst.flashColor.$cp(theColor);
    G.rogue.creaturesWillFlashThisTurn = true_;
  }
}

function canAbsorb(ally: struct_creature | null, ourBolts: Ptr | null, prey: struct_creature | null, grid: Ptr | null): number {
  let i = 0;
  if (ally.creatureState >>> 0 === MONSTER_ALLY && ally.newPowerCount > 0 && !isPosInMap(ally.targetCorpseLoc) && !(((ally.info.flags | prey.info.flags) >>> 0 & (MONST_INANIMATE | MONST_IMMOBILE)) >>> 0) && !monsterAvoids(ally, prey.loc) && 10 >= $rd(grid.a[grid.o + ally.loc.x], ally.loc.y)) {
    if (((~ally.info.abilityFlags >>> 0 & prey.info.abilityFlags) >>> 0 & LEARNABLE_ABILITIES) >>> 0) {
      return true_;
    } else if (((~ally.info.flags >>> 0 & prey.info.flags) >>> 0 & LEARNABLE_BEHAVIORS) >>> 0) {
      return true_;
    } else {
      for (i = 0; G.gameConst.numberBoltKinds > i; i = i + 1 << 16 >> 16) {
        ourBolts.a[ourBolts.o + i] = false_;
      }
      for (i = 0; ally.info.bolts[i] >>> 0 !== BOLT_NONE; i = i + 1 << 16 >> 16) {
        ourBolts.a[ourBolts.o + ally.info.bolts[i]] = true_;
      }
      for (i = 0; prey.info.bolts[i] >>> 0 !== BOLT_NONE; i = i + 1 << 16 >> 16) {
        if (!(($sadd(G.boltCatalog, prey.info.bolts[i]).flags & BF_NOT_LEARNABLE) >>> 0) && !ourBolts.a[ourBolts.o + prey.info.bolts[i]]) {
          return true_;
        }
      }
    }
  }
  return false_;
}

function anyoneWantABite(decedent: struct_creature | null): number {
  let candidates = 0;
  let randIndex = 0;
  let i = 0;
  let grid = null;
  let success = false_;
  let ourBolts = null;
  ourBolts = P(new Int8Array($u64(G.gameConst.numberBoltKinds)));
  candidates = 0;
  if (!((decedent.info.abilityFlags & LEARNABLE_ABILITIES) >>> 0) && !((decedent.info.flags & LEARNABLE_BEHAVIORS) >>> 0) && decedent.info.bolts[0] >>> 0 === BOLT_NONE || cellHasTerrainFlag(decedent.loc, T_OBSTRUCTS_PASSABILITY) || decedent.info.monsterID >>> 0 === MK_SPECTRAL_IMAGE || (decedent.info.flags & (MONST_INANIMATE | MONST_IMMOBILE)) >>> 0) {
    return false_;
  }
  grid = allocGrid();
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let ally = nextCreature(it);
    if (ally.creatureState >>> 0 === MONSTER_ALLY) {
      fillGrid(grid, 0);
      calculateDistances(grid, decedent.loc.x, decedent.loc.y, forbiddenFlagsForMonster(ally.info), null, true_, true_);
    }
    if (canAbsorb(ally, ourBolts, decedent, grid)) {
      candidates = candidates + 1 << 16 >> 16;
    }
  }
  if (candidates > 0) {
    randIndex = rand_range(1, candidates) << 16 >> 16;
    let firstAlly = null;
    for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
      let ally = nextCreature(it);
      if (canAbsorb(ally, ourBolts, decedent, grid) && !(randIndex = randIndex - 1 << 16 >> 16)) {
        firstAlly = ally;
        break;
      }
    }
    if (firstAlly) {
      firstAlly.targetCorpseLoc.$cp(decedent.loc);
      strcpy(P(firstAlly.targetCorpseName), P(decedent.info.monsterName));
      firstAlly.corpseAbsorptionCounter = 20;
      candidates = 0;
      for (i = 0; 32 > i; i = i + 1 << 16 >> 16) {
        if (((($shl64(1, i) & ~firstAlly.info.abilityFlags >>> 0) >>> 0 & decedent.info.abilityFlags) >>> 0 & LEARNABLE_ABILITIES) >>> 0) {
          candidates = candidates + 1 << 16 >> 16;
        }
      }
      for (i = 0; 32 > i; i = i + 1 << 16 >> 16) {
        if (((($shl64(1, i) & ~firstAlly.info.flags >>> 0) >>> 0 & decedent.info.flags) >>> 0 & LEARNABLE_BEHAVIORS) >>> 0) {
          candidates = candidates + 1 << 16 >> 16;
        }
      }
      if (candidates > 0) {
        randIndex = rand_range(1, candidates) << 16 >> 16;
        for (i = 0; 32 > i; i = i + 1 << 16 >> 16) {
          if (((($shl64(1, i) & ~firstAlly.info.abilityFlags >>> 0) >>> 0 & decedent.info.abilityFlags) >>> 0 & LEARNABLE_ABILITIES) >>> 0 && !(randIndex = randIndex - 1 << 16 >> 16)) {
            firstAlly.absorptionFlags = $shl64(1, i);
            firstAlly.absorbBehavior = false_;
            success = true_;
            break;
          }
        }
        for (i = 0; 32 > i && !success; i = i + 1 << 16 >> 16) {
          if (((($shl64(1, i) & ~firstAlly.info.flags >>> 0) >>> 0 & decedent.info.flags) >>> 0 & LEARNABLE_BEHAVIORS) >>> 0 && !(randIndex = randIndex - 1 << 16 >> 16)) {
            firstAlly.absorptionFlags = $shl64(1, i);
            firstAlly.absorbBehavior = true_;
            success = true_;
            break;
          }
        }
      } else if (decedent.info.bolts[0] >>> 0 !== BOLT_NONE) {
        candidates = 0;
        for (i = 0; decedent.info.bolts[i] >>> 0 !== BOLT_NONE; i = i + 1 << 16 >> 16) {
          if (!(($sadd(G.boltCatalog, decedent.info.bolts[i]).flags & BF_NOT_LEARNABLE) >>> 0) && !ourBolts.a[ourBolts.o + decedent.info.bolts[i]]) {
            candidates = candidates + 1 << 16 >> 16;
          }
        }
        if (candidates > 0) {
          randIndex = rand_range(1, candidates) << 16 >> 16;
          for (i = 0; decedent.info.bolts[i] >>> 0 !== BOLT_NONE; i = i + 1 << 16 >> 16) {
            if (!(($sadd(G.boltCatalog, decedent.info.bolts[i]).flags & BF_NOT_LEARNABLE) >>> 0) && !ourBolts.a[ourBolts.o + decedent.info.bolts[i]] && !(randIndex = randIndex - 1 << 16 >> 16)) {
              firstAlly.absorptionBolt = decedent.info.bolts[i] << 16 >> 16;
              success = true_;
              break;
            }
          }
        }
      }
    }
  }
  freeGrid(grid);
  free(ourBolts);
  return success;
}

export async function inflictLethalDamage(attacker: struct_creature | null, defender: struct_creature | null): Promise<void> {
  await inflictDamage(attacker, defender, defender.currentHP, null, true_);
}

export async function inflictDamage(attacker: struct_creature | null, defender: struct_creature | null, damage: number, flashColor: struct_color | null, ignoresProtectionShield: number): Promise<number> {
  let theBlood = new struct_dungeonFeature();
  let transferenceAmount = 0;
  if (damage === 0 || (defender.info.flags & MONST_INVULNERABLE) >>> 0) {
    return false_;
  }
  if (!ignoresProtectionShield && defender.status[STATUS_SHIELDED]) {
    if (defender.status[STATUS_SHIELDED] > damage * 10) {
      defender.status[STATUS_SHIELDED] -= damage * 10;
      damage = 0;
    } else {
      damage = damage - ((defender.status[STATUS_SHIELDED] + 9) / 10 | 0) << 16 >> 16;
      defender.status[STATUS_SHIELDED] = defender.maxStatus[STATUS_SHIELDED] = 0;
    }
  }
  defender.bookkeepingFlags = (defender.bookkeepingFlags & ~MB_ABSORBING >>> 0) >>> 0;
  if (damage > 0 && defender.info.bloodType >>> 0) {
    theBlood.$cp(G.dungeonFeatureCatalog[defender.info.bloodType]);
    theBlood.startProbability = (Math.imul(theBlood.startProbability, 15 + ((defender.currentHP > damage ? damage : defender.currentHP) * 3 / 2 | 0)) / 100 | 0) << 16 >> 16;
    if (theBlood.layer === GAS) {
      theBlood.startProbability = theBlood.startProbability * 100 << 16 >> 16;
    }
    await spawnDungeonFeature(defender.loc.x, defender.loc.y, theBlood, true_, false_);
  }
  if (defender !== G.player && defender.creatureState >>> 0 === MONSTER_SLEEPING) {
    wakeUp(defender);
  }
  if (defender === G.player && G.rogue.mode >>> 0 === GAME_MODE_EASY && damage > 0) {
    damage = (1 > (damage / 5 | 0) ? 1 : damage / 5 | 0) << 16 >> 16;
  }
  if ((attacker === G.player && G.rogue.transference || attacker && attacker !== G.player && (attacker.info.abilityFlags & MA_TRANSFERENCE) >>> 0) && !((defender.info.flags & (MONST_INANIMATE | MONST_INVULNERABLE)) >>> 0)) {
    transferenceAmount = (defender.currentHP > damage ? damage : defender.currentHP) << 16 >> 16;
    if (attacker === G.player) {
      transferenceAmount = (Math.imul(transferenceAmount, G.rogue.transference) / G.gameConst.playerTransferenceRatio | 0) << 16 >> 16;
      if (transferenceAmount === 0) {
        transferenceAmount = (G.rogue.transference > 0 ? 1 : -1) << 16 >> 16;
      }
    } else if (attacker.creatureState >>> 0 === MONSTER_ALLY) {
      transferenceAmount = (transferenceAmount * 4 / 10 | 0) << 16 >> 16;
    } else {
      transferenceAmount = (transferenceAmount * 9 / 10 | 0) << 16 >> 16;
    }
    attacker.currentHP = attacker.currentHP + transferenceAmount << 16 >> 16;
    if (attacker === G.player && 0 >= G.player.currentHP) {
      await gameOver(S("Drained by a cursed ring"), true_);
      return false_;
    }
  }
  if (damage >= defender.currentHP) {
    defender.currentHP = 0;
    return true_;
  } else {
    if (0 > damage && defender.currentHP - damage > defender.info.maxHP) {
      defender.currentHP = (defender.currentHP > defender.info.maxHP ? defender.currentHP : defender.info.maxHP) << 16 >> 16;
    } else {
      defender.currentHP = defender.currentHP - damage << 16 >> 16;
    }
    if (defender !== G.player && defender.creatureState >>> 0 !== MONSTER_ALLY && (defender.info.flags & MONST_FLEES_NEAR_DEATH) >>> 0 && (defender.info.maxHP / 4 | 0) >= defender.currentHP) {
      defender.creatureState = MONSTER_FLEEING;
    }
    if (flashColor && damage > 0) {
      flashMonster(defender, flashColor, MIN_FLASH_STRENGTH + (Math.imul(100 - MIN_FLASH_STRENGTH, damage) / defender.info.maxHP | 0) << 16 >> 16);
    }
  }
  await refreshSideBar(-1, -1, false_);
  return false_;
}

export async function addPoison(monst: struct_creature | null, durationIncrement: number, concentrationIncrement: number): Promise<void> {
  if (durationIncrement > 0) {
    if (monst === G.player && !G.player.status[STATUS_POISONED]) {
      await combatMessage(S("scalding poison fills your veins"), G.badMessageColor);
    }
    if (!monst.status[STATUS_POISONED]) {
      monst.maxStatus[STATUS_POISONED] = 0;
    }
    monst.poisonAmount = monst.poisonAmount + concentrationIncrement << 16 >> 16;
    if (monst.poisonAmount === 0) {
      monst.poisonAmount = 1;
    }
    monst.status[STATUS_POISONED] += durationIncrement;
    monst.maxStatus[STATUS_POISONED] = (monst.info.maxHP / monst.poisonAmount | 0) << 16 >> 16;
    if (canSeeMonster(monst)) {
      flashMonster(monst, G.poisonColor, 100);
    }
  }
}

export async function killCreature(decedent: struct_creature | null, administrativeDeath: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any;
  let x = 0;
  let y = 0;
  let monstName = new Int8Array(79);
  let buf = new Int8Array(237);
  if ((decedent.bookkeepingFlags & (MB_IS_DYING | MB_HAS_DIED)) >>> 0) {
    return;
  }
  if (decedent !== G.player) {
    decedent.bookkeepingFlags = (decedent.bookkeepingFlags | MB_IS_DYING) >>> 0;
  }
  if (G.rogue.lastTarget === decedent) {
    G.rogue.lastTarget = null;
  }
  if (G.rogue.yendorWarden === decedent) {
    G.rogue.yendorWarden = null;
  }
  if (decedent.carriedItem) {
    if (administrativeDeath) {
      deleteItem(decedent.carriedItem);
      decedent.carriedItem = null;
    } else {
      await makeMonsterDropItem(decedent);
    }
  }
  if (!administrativeDeath && (decedent.info.abilityFlags & MA_DF_ON_DEATH) >>> 0 && !((decedent.bookkeepingFlags & MB_IS_FALLING) >>> 0)) {
    await spawnDungeonFeature(decedent.loc.x, decedent.loc.y, $sat(G.dungeonFeatureCatalog, decedent.info.DFType), true_, false_);
    if (G.monsterText[decedent.info.monsterID].DFMessage[0] && canSeeMonster(decedent)) {
      monsterName(P(monstName), decedent, true_);
      snprintf(P(buf), DCOLS * 3, S("%s %s"), P(monstName), P(G.monsterText[decedent.info.monsterID].DFMessage));
      resolvePronounEscapes(P(buf), decedent);
      await message(P(buf), 0);
    }
  }
  if (decedent === G.player) {
  } else {
    if (!administrativeDeath && decedent.creatureState >>> 0 === MONSTER_ALLY && !canSeeMonster(decedent) && (!((decedent.info.flags & MONST_INANIMATE) >>> 0) || (G.monsterCatalog[decedent.info.monsterID].abilityFlags & MA_ENTER_SUMMONS) >>> 0) && !((decedent.bookkeepingFlags & MB_BOUND_TO_LEADER) >>> 0) && !decedent.carriedMonster) {
      await messageWithColor(S("you feel a sense of loss."), G.badMessageColor, 0);
    }
    x = decedent.loc.x;
    y = decedent.loc.y;
    if ((decedent.bookkeepingFlags & MB_IS_DORMANT) >>> 0) {
      ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags & ~HAS_DORMANT_MONSTER >>> 0) >>> 0);
    } else {
      ($t2 = $at2(G.pmap, x, y), $t2.flags = ($t2.flags & ~HAS_MONSTER >>> 0) >>> 0);
    }
    decedent.bookkeepingFlags = (decedent.bookkeepingFlags | MB_HAS_DIED) >>> 0;
    if (administrativeDeath) {
      decedent.bookkeepingFlags = (decedent.bookkeepingFlags | MB_ADMINISTRATIVE_DEATH) >>> 0;
    }
    if (!administrativeDeath && !((decedent.bookkeepingFlags & MB_IS_DORMANT) >>> 0)) {
      if (decedent.carriedMonster) {
        let carriedMonster = decedent.carriedMonster;
        decedent.carriedMonster = null;
        prependCreature(G.monsters, carriedMonster);
        carriedMonster.loc.x = x;
        carriedMonster.loc.y = y;
        carriedMonster.ticksUntilTurn = 200;
        ($t3 = $at2(G.pmap, x, y), $t3.flags = ($t3.flags | HAS_MONSTER) >>> 0);
        await fadeInMonster(carriedMonster);
        if (canSeeMonster(carriedMonster)) {
          monsterName(P(monstName), carriedMonster, true_);
          sprintf(P(buf), S("%s appears"), P(monstName));
          await combatMessage(P(buf), null);
        }
        await applyInstantTileEffectsToCreature(carriedMonster);
      }
      anyoneWantABite(decedent);
      await refreshDungeonCell(struct_pos.$of(x, y));
    }
  }
  decedent.currentHP = 0;
  demoteMonsterFromLeadership(decedent);
  if (decedent.leader) {
    checkForContinuedLeadership(decedent.leader);
  }
}

export function buildHitList(hitList: Ptr | null, attacker: struct_creature | null, defender: struct_creature | null, sweep: number): void {
  let i = 0;
  let x = 0;
  let y = 0;
  let newX = 0;
  let newY = 0;
  let newestX = 0;
  let newestY = 0;
  let dir = 0;
  let newDir = 0;
  x = attacker.loc.x;
  y = attacker.loc.y;
  newX = defender.loc.x;
  newY = defender.loc.y;
  dir = NO_DIRECTION;
  for (i = 0; DIRECTION_COUNT > i; i = i + 1 << 16 >> 16) {
    if (G.nbDirs[i][0] === newX - x && G.nbDirs[i][1] === newY - y) {
      dir = i;
      break;
    }
  }
  if (sweep) {
    if (dir === NO_DIRECTION) {
      dir = UP;
    }
    for (i = 0; 8 > i; i = i + 1 << 16 >> 16) {
      newDir = (dir + i) % DIRECTION_COUNT;
      newestX = x + G.cDirs[newDir][0] << 16 >> 16;
      newestY = y + G.cDirs[newDir][1] << 16 >> 16;
      if (coordinatesAreInMap(newestX, newestY) && ($at2(G.pmap, newestX, newestY).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0) {
        defender = monsterAtLoc(struct_pos.$of(newestX, newestY));
        if (defender && monsterWillAttackTarget(attacker, defender) && (!cellHasTerrainFlag(defender.loc, T_OBSTRUCTS_PASSABILITY) || (defender.info.flags & MONST_ATTACKABLE_THRU_WALLS) >>> 0)) {
          hitList.a[hitList.o + i] = defender;
        }
      }
    }
  } else {
    hitList.a[hitList.o] = defender;
  }
}

export function $init(): void {
}
