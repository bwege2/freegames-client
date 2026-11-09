// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/Statistics.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, Arrays, HashSet, JObject } from '../../../../jre/index.ts';

let GamesInProgress, SparseArray;

export class Statistics extends JObject {
  static goldCollected: number = 0;
  static deepestFloor: number = 0;
  static highestAscent: number = 0;
  static enemiesSlain: number = 0;
  static foodEaten: number = 0;
  static itemsCrafted: number = 0;
  static piranhasKilled: number = 0;
  static hazardAssistedKills: number = 0;
  static ankhsUsed: number = 0;
  static itemTypesDiscovered: HashSet<JClass> = null;
  static progressScore: number = 0;
  static heldItemValue: number = 0;
  static treasureScore: number = 0;
  static floorsExplored: SparseArray<number> = null;
  static exploreScore: number = 0;
  static bossScores: number[] = null;
  static totalBossScore: number = 0;
  static questScores: number[] = null;
  static totalQuestScore: number = 0;
  static winMultiplier: number = 0;
  static chalMultiplier: number = 0;
  static totalScore: number = 0;
  static upgradesUsed: number = 0;
  static sneakAttacks: number = 0;
  static thrownAttacks: number = 0;
  static spawnersAlive: number = 0;
  static duration: number = 0;
  static qualifiedForNoKilling: boolean = false;
  static completedWithNoKilling: boolean = false;
  static qualifiedForBossRemainsBadge: boolean = false;
  static qualifiedForBossChallengeBadge: boolean = false;
  static qualifiedForRandomVictoryBadge: boolean = false;
  static vaultInjureWarned: boolean = false;
  static amuletObtained: boolean = false;
  static gameWon: boolean = false;
  static ascended: boolean = false;
  static readonly GOLD: string = 'score';
  static readonly DEEPEST: string = 'maxDepth';
  static readonly HIGHEST: string = 'maxAscent';
  static readonly SLAIN: string = 'enemiesSlain';
  static readonly FOOD: string = 'foodEaten';
  static readonly ALCHEMY: string = 'potionsCooked';
  static readonly PIRANHAS: string = 'priranhas';
  static readonly HAZARD_ASSISTS: string = 'hazard_assists';
  static readonly ANKHS: string = 'ankhsUsed';
  static readonly PROG_SCORE: string = 'prog_score';
  static readonly ITEM_VAL: string = 'item_val';
  static readonly TRES_SCORE: string = 'tres_score';
  static readonly FLR_EXPL: string = 'flr_expl_';
  static readonly EXPL_SCORE: string = 'expl_score';
  static readonly BOSS_SCORES: string = 'boss_scores';
  static readonly TOT_BOSS: string = 'tot_boss';
  static readonly QUEST_SCORES: string = 'quest_scores';
  static readonly TOT_QUEST: string = 'tot_quest';
  static readonly WIN_MULT: string = 'win_mult';
  static readonly CHAL_MULT: string = 'chal_mult';
  static readonly TOTAL_SCORE: string = 'total_score';
  static readonly UPGRADES: string = 'upgradesUsed';
  static readonly SNEAKS: string = 'sneakAttacks';
  static readonly THROWN: string = 'thrownAssists';
  static readonly ITEM_TYPES_DISCOVERED: string = 'item_types_discovered';
  static readonly SPAWNERS: string = 'spawnersAlive';
  static readonly DURATION: string = 'duration';
  static readonly NO_KILLING_QUALIFIED: string = 'qualifiedForNoKilling';
  static readonly BOSS_REMAINS_QUALIFIED: string = 'qualifiedForBossRemainsBadge';
  static readonly BOSS_CHALLENGE_QUALIFIED: string = 'qualifiedForBossChallengeBadge';
  static readonly RANDOM_VICTORY_QUALIFIED: string = 'qualifiedForRandomVictory';
  static readonly AMULET: string = 'amuletObtained';
  static readonly WON: string = 'won';
  static readonly ASCENDED: string = 'ascended';
  _Statistics(): this {
    return this;
  }
  static reset(): void {
    Statistics.goldCollected = 0;
    Statistics.deepestFloor = 0;
    Statistics.highestAscent = 0;
    Statistics.enemiesSlain = 0;
    Statistics.foodEaten = 0;
    Statistics.itemsCrafted = 0;
    Statistics.piranhasKilled = 0;
    Statistics.hazardAssistedKills = 0;
    Statistics.ankhsUsed = 0;
    Statistics.itemTypesDiscovered.clear();
    Statistics.progressScore = 0;
    Statistics.heldItemValue = 0;
    Statistics.treasureScore = 0;
    Statistics.floorsExplored = new SparseArray()._SparseArray();
    Statistics.exploreScore = 0;
    Statistics.bossScores = $J.newArray(5, 0);
    Statistics.totalBossScore = 0;
    Statistics.questScores = $J.newArray(5, 0);
    Statistics.totalQuestScore = 0;
    Statistics.winMultiplier = 1;
    Statistics.chalMultiplier = 1;
    Statistics.totalScore = 0;
    Statistics.upgradesUsed = 0;
    Statistics.sneakAttacks = 0;
    Statistics.thrownAttacks = 0;
    Statistics.spawnersAlive = 0;
    Statistics.duration = 0;
    Statistics.qualifiedForNoKilling = false;
    Statistics.qualifiedForBossRemainsBadge = false;
    Statistics.qualifiedForBossChallengeBadge = false;
    Statistics.qualifiedForRandomVictoryBadge = GamesInProgress.randomizedClass;
    Statistics.vaultInjureWarned = false;
    Statistics.amuletObtained = false;
    Statistics.gameWon = false;
    Statistics.ascended = false;
  }
  static storeInBundle(bundle: Bundle): void {
    bundle.put$String$int(Statistics.GOLD, Statistics.goldCollected);
    bundle.put$String$int(Statistics.DEEPEST, Statistics.deepestFloor);
    bundle.put$String$int(Statistics.HIGHEST, Statistics.highestAscent);
    bundle.put$String$int(Statistics.SLAIN, Statistics.enemiesSlain);
    bundle.put$String$int(Statistics.FOOD, Statistics.foodEaten);
    bundle.put$String$int(Statistics.ALCHEMY, Statistics.itemsCrafted);
    bundle.put$String$int(Statistics.PIRANHAS, Statistics.piranhasKilled);
    bundle.put$String$int(Statistics.HAZARD_ASSISTS, Statistics.hazardAssistedKills);
    bundle.put$String$int(Statistics.ANKHS, Statistics.ankhsUsed);
    bundle.put$String$ClassArr(Statistics.ITEM_TYPES_DISCOVERED, $J.toArrayInto(Statistics.itemTypesDiscovered.toArray(), $J.newArray(0, null)));
    bundle.put$String$int(Statistics.PROG_SCORE, Statistics.progressScore);
    bundle.put$String$int(Statistics.ITEM_VAL, Statistics.heldItemValue);
    bundle.put$String$int(Statistics.TRES_SCORE, Statistics.treasureScore);
    for (let i = 1; i < 26; i++) {
      if (Statistics.floorsExplored.containsKey(i)) {
        bundle.put$String$float(Statistics.FLR_EXPL + i, +$J.boxF(Statistics.floorsExplored.get(i)));
      }
    }
    bundle.put$String$int(Statistics.EXPL_SCORE, Statistics.exploreScore);
    bundle.put$String$intArr(Statistics.BOSS_SCORES, Statistics.bossScores);
    bundle.put$String$int(Statistics.TOT_BOSS, Statistics.totalBossScore);
    bundle.put$String$intArr(Statistics.QUEST_SCORES, Statistics.questScores);
    bundle.put$String$int(Statistics.TOT_QUEST, Statistics.totalQuestScore);
    bundle.put$String$float(Statistics.WIN_MULT, Statistics.winMultiplier);
    bundle.put$String$float(Statistics.CHAL_MULT, Statistics.chalMultiplier);
    bundle.put$String$int(Statistics.TOTAL_SCORE, Statistics.totalScore);
    bundle.put$String$int(Statistics.UPGRADES, Statistics.upgradesUsed);
    bundle.put$String$int(Statistics.SNEAKS, Statistics.sneakAttacks);
    bundle.put$String$int(Statistics.THROWN, Statistics.thrownAttacks);
    bundle.put$String$int(Statistics.SPAWNERS, Statistics.spawnersAlive);
    bundle.put$String$float(Statistics.DURATION, Statistics.duration);
    bundle.put$String$boolean(Statistics.NO_KILLING_QUALIFIED, Statistics.qualifiedForNoKilling);
    bundle.put$String$boolean(Statistics.BOSS_REMAINS_QUALIFIED, Statistics.qualifiedForBossRemainsBadge);
    bundle.put$String$boolean(Statistics.BOSS_CHALLENGE_QUALIFIED, Statistics.qualifiedForBossChallengeBadge);
    bundle.put$String$boolean(Statistics.RANDOM_VICTORY_QUALIFIED, Statistics.qualifiedForRandomVictoryBadge);
    bundle.put$String$boolean(Statistics.AMULET, Statistics.amuletObtained);
    bundle.put$String$boolean(Statistics.WON, Statistics.gameWon);
    bundle.put$String$boolean(Statistics.ASCENDED, Statistics.ascended);
  }
  static restoreFromBundle(bundle: Bundle): void {
    Statistics.goldCollected = bundle.getInt(Statistics.GOLD);
    Statistics.deepestFloor = bundle.getInt(Statistics.DEEPEST);
    Statistics.highestAscent = bundle.getInt(Statistics.HIGHEST);
    Statistics.enemiesSlain = bundle.getInt(Statistics.SLAIN);
    Statistics.foodEaten = bundle.getInt(Statistics.FOOD);
    Statistics.itemsCrafted = bundle.getInt(Statistics.ALCHEMY);
    Statistics.piranhasKilled = bundle.getInt(Statistics.PIRANHAS);
    Statistics.hazardAssistedKills = bundle.getInt(Statistics.HAZARD_ASSISTS);
    Statistics.ankhsUsed = bundle.getInt(Statistics.ANKHS);
    if (bundle.contains(Statistics.ITEM_TYPES_DISCOVERED)) {
      Statistics.itemTypesDiscovered = new HashSet(Arrays.asList(...bundle.getClassArray(Statistics.ITEM_TYPES_DISCOVERED)));
    } else {
      Statistics.itemTypesDiscovered.clear();
    }
    Statistics.progressScore = bundle.getInt(Statistics.PROG_SCORE);
    Statistics.heldItemValue = bundle.getInt(Statistics.ITEM_VAL);
    Statistics.treasureScore = bundle.getInt(Statistics.TRES_SCORE);
    Statistics.floorsExplored.clear();
    for (let i = 1; i < 26; i++) {
      if (bundle.contains(Statistics.FLR_EXPL + i)) {
        Statistics.floorsExplored.put(i, $J.boxF(bundle.getFloat(Statistics.FLR_EXPL + i)));
      }
    }
    Statistics.exploreScore = bundle.getInt(Statistics.EXPL_SCORE);
    if (bundle.contains(Statistics.BOSS_SCORES)) {
      Statistics.bossScores = bundle.getIntArray(Statistics.BOSS_SCORES);
    } else {
      Statistics.bossScores = $J.newArray(5, 0);
    }
    Statistics.totalBossScore = bundle.getInt(Statistics.TOT_BOSS);
    if (bundle.contains(Statistics.QUEST_SCORES)) {
      Statistics.questScores = bundle.getIntArray(Statistics.QUEST_SCORES);
    } else {
      Statistics.questScores = $J.newArray(5, 0);
    }
    Statistics.totalQuestScore = bundle.getInt(Statistics.TOT_QUEST);
    Statistics.winMultiplier = bundle.getFloat(Statistics.WIN_MULT);
    Statistics.chalMultiplier = bundle.getFloat(Statistics.CHAL_MULT);
    Statistics.totalScore = bundle.getInt(Statistics.TOTAL_SCORE);
    Statistics.upgradesUsed = bundle.getInt(Statistics.UPGRADES);
    Statistics.sneakAttacks = bundle.getInt(Statistics.SNEAKS);
    Statistics.thrownAttacks = bundle.getInt(Statistics.THROWN);
    Statistics.spawnersAlive = bundle.getInt(Statistics.SPAWNERS);
    Statistics.duration = bundle.getFloat(Statistics.DURATION);
    Statistics.qualifiedForNoKilling = bundle.getBoolean(Statistics.NO_KILLING_QUALIFIED);
    Statistics.qualifiedForBossRemainsBadge = bundle.getBoolean(Statistics.BOSS_REMAINS_QUALIFIED);
    Statistics.qualifiedForBossChallengeBadge = bundle.getBoolean(Statistics.BOSS_CHALLENGE_QUALIFIED);
    Statistics.qualifiedForRandomVictoryBadge = bundle.getBoolean(Statistics.RANDOM_VICTORY_QUALIFIED);
    Statistics.amuletObtained = bundle.getBoolean(Statistics.AMULET);
    Statistics.gameWon = bundle.getBoolean(Statistics.WON);
    Statistics.ascended = bundle.getBoolean(Statistics.ASCENDED);
  }
  static preview(info: GamesInProgress$Info, bundle: Bundle): void {
    info.goldCollected = bundle.getInt(Statistics.GOLD);
    info.maxDepth = bundle.getInt(Statistics.DEEPEST);
  }
  static $clinit() {
    Statistics.itemTypesDiscovered = new HashSet();
    Statistics.floorsExplored = new SparseArray()._SparseArray();
    Statistics.bossScores = $J.newArray(5, 0);
    Statistics.questScores = $J.newArray(5, 0);
    Statistics.qualifiedForNoKilling = false;
    Statistics.completedWithNoKilling = false;
    Statistics.qualifiedForBossRemainsBadge = false;
    Statistics.qualifiedForBossChallengeBadge = false;
    Statistics.qualifiedForRandomVictoryBadge = false;
    Statistics.vaultInjureWarned = false;
    Statistics.amuletObtained = false;
    Statistics.gameWon = false;
    Statistics.ascended = false;
  }
}

$J.define(Statistics, 'com.shatteredpixel.shatteredpixeldungeon.Statistics', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Statistics' }, clinit: true, lazy: ['goldCollected', 'deepestFloor', 'highestAscent', 'enemiesSlain', 'foodEaten', 'itemsCrafted', 'piranhasKilled', 'hazardAssistedKills', 'ankhsUsed', 'itemTypesDiscovered', 'progressScore', 'heldItemValue', 'treasureScore', 'floorsExplored', 'exploreScore', 'bossScores', 'totalBossScore', 'questScores', 'totalQuestScore', 'winMultiplier', 'chalMultiplier', 'totalScore', 'upgradesUsed', 'sneakAttacks', 'thrownAttacks', 'spawnersAlive', 'duration', 'qualifiedForNoKilling', 'completedWithNoKilling', 'qualifiedForBossRemainsBadge', 'qualifiedForBossChallengeBadge', 'qualifiedForRandomVictoryBadge', 'vaultInjureWarned', 'amuletObtained', 'gameWon', 'ascended'] });
$J.module(() => {
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  SparseArray = $J.load('com.watabou.utils.SparseArray');
});
