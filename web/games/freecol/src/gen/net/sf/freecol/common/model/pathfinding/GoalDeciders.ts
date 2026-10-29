// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/pathfinding/GoalDeciders.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, Comparator, HashMap, JObject, RuntimeException } from '../../../../../../../jre/index.ts';

let Ability, Constants, Map_, CollectionUtils;

/**
 * Handy library of GoalDeciders.
 */
export class GoalDeciders extends JObject {
  _GoalDeciders(): this {
    return this;
  }
  /**
   * Gets a composite goal decider composed of two or more individual
   * goal deciders.  The first one dominates the second etc.
   *
   * @param all If true, all deciders must succeed (and-semantics),
   *     if false, any decide may succeed (or-semantics).
   * @param gds A series (two minimum) of {@code GoalDecider}s
   *     to compose.
   * @return A new {@code GoalDecider} composed of the argument
   *     goal deciders.
   */
  static getComposedGoalDecider(all: boolean, gds: GoalDecider[]): GoalDecider {
    if (gds.length < 2) {
      throw new RuntimeException('Short GoalDecider list: ' + gds.length);
    }
    return new (GoalDeciders$1())().$c(gds, all).$init_anon();
  }
  /**
   * Gets a GoalDecider to find the `closest' settlement owned by the
   * searching unit player, with connected ports weighted double.
   *
   * @return The closest settlement goal decider.
   */
  static getOurClosestSettlementGoalDecider(): GoalDecider {
    return new (GoalDeciders$2())().$init_anon();
  }
  /**
   * Gets a GoalDecider to find the closest high seas tile to a target.
   * Used when arriving on the map from Europe.
   *
   * @return The high seas goal decider.
   */
  static getHighSeasGoalDecider(): GoalDecider {
    return new (GoalDeciders$3())().$init_anon();
  }
  /**
   * Build a simple goal decider to find the first high seas tile
   * without using the unit parameter.
   *
   * @return A {@code GoalDecider} that finds the nearest high seas tile.
   */
  static getSimpleHighSeasGoalDecider(): GoalDecider {
    return new (GoalDeciders$4())().$init_anon();
  }
  /**
   * Builds a simple goal decider to find a single target location.
   *
   * @param target The target {@code Location}.
   * @return A {@code GoalDecider} that only succeeds for the
   *     target location.
   */
  static getLocationGoalDecider(target: Location): GoalDecider {
    return new (GoalDeciders$5())().$c(target).$init_anon();
  }
  /**
   * Builds a goal decider to find an adjacent tile to a target location.
   *
   * @param target The target {@code Location}.
   * @return A {@code GoalDecider} that only succeeds for tiles
   *     adjacent to the target location.
   */
  static getAdjacentLocationGoalDecider(target: Location): GoalDecider {
    let tile = target.getTile$();
    if (tile == null) {
      return null;
    }
    return new (GoalDeciders$6())().$c(tile).$init_anon();
  }
  /**
   * Get a goal decider that succeeds for settlements owned by one
   * of a given list of enemies.
   *
   * @param enemies The list of enemy {@code Player}s.
   * @return A suitable {@code GoalDecider}.
   */
  static getEnemySettlementGoalDecider(enemies: Collection<Player>): GoalDecider {
    return new (GoalDeciders$7())().$c(enemies).$init_anon();
  }
  /**
   * Goal decider to find the best land tile to disembark a unit that
   * is planning to attack a given target.
   *
   * The result must be:
   * - Unoccupied
   * - Have at least one unoccupied high-seas-connected neighbour
   * - Favour the best natural defence of the alternatives
   * - Favour a short journey to the target
   * - Prioritize not landing next to a hostile fort/fortress.
   *
   * @param target The target {@code Tile}.
   * @return A suitable {@code GoalDecider}.
   */
  static getDisembarkGoalDecider(target: Tile): GoalDecider {
    let NO_DANGER_BONUS = 1000;
    return new (GoalDeciders$8())().$c(target, NO_DANGER_BONUS).$init_anon();
  }
  /**
   * Get a goal decider to find tiles that an enemy player can not see.
   *
   * @param enemy The enemy {@code Player} to avoid.
   * @return A suitable {@code GoalDecider}.
   */
  static getStealthyGoalDecider(enemy: Player): GoalDecider {
    return new (GoalDeciders$9())().$c(enemy).$init_anon();
  }
  /**
   * Get a goal decider to find tiles with a settlement with a lower
   * high seas count than a unit currently has.  Useful for tunnelling
   * out of intermittantly blocked rivers.
   *
   * @param unit The {@code Unit} to get the goal decider for.
   * @return A suitable {@code GoalDecider}.
   */
  static getReduceHighSeasCountGoalDecider(unit: Unit): GoalDecider {
    return new (GoalDeciders$10())().$c(unit).$init_anon();
  }
  /**
   * Get a goal decider to find tiles on river corners, preferring ones
   * closest to the high seas.  This is useful when a unit is stuck on
   * a river.  By moving to a corner (i.e. where another unit can get
   * past it) the chance that the blockage clears is enhanced.
   *
   * @return A suitable goal decider.
   */
  static getCornerGoalDecider(): GoalDecider {
    return new (GoalDeciders$11())().$init_anon();
  }
}

/**
 * A class to wrap a goal decider that searches for paths to an
 * adjacent tile to a set of locations, and the results of such a
 * search.
 */
export class GoalDeciders$MultipleAdjacentDecider extends JObject {
  gd: GoalDecider = null;
  results: HashMap<Location, PathNode> = null;
  /**
   * Create a multiple decider.
   *
   * @param locs The list of {@code Location}s to search for
   *     paths to an adjacent location for.
   */
  _GoalDeciders$MultipleAdjacentDecider(locs: List<Location>): this {
    this.results = new HashMap();
    this.gd = new (GoalDeciders$MultipleAdjacentDecider$1())().$o(this).$c(locs);
    return this;
  }
  getGoalDecider(): GoalDecider {
    return this.gd;
  }
  getResults(): HashMap<Location, PathNode> {
    return this.results;
  }
}

let $GoalDeciders$1: any = null;
/** An anonymous class (GoalDeciders.java:63). */
function GoalDeciders$1(): any {
  return $GoalDeciders$1 ??= $J.local(class extends JObject {
    winner: number = 0;
    goal: PathNode = null;
    $init_anon() {
      this.winner = this.$cv_gds.length;
      this.goal = null;
      return this;
    }
    getGoal(): PathNode {
      return this.goal;
    }
    hasSubGoals(): boolean {
      for (let i = 0; i < this.$cv_gds.length; i++) {
        if (!this.$cv_all && i > this.winner) {
          break;
        }
        if (this.$cv_gds[i].hasSubGoals()) {
          if (!this.$cv_all) {
            return true;
          }
        } else {
          if (this.$cv_all) {
            return false;
          }
        }
      }
      return !this.$cv_all;
    }
    check(u: Unit, path: PathNode): boolean {
      for (let i = 0; i < this.$cv_gds.length; i++) {
        if (!this.$cv_all && i > this.winner) {
          break;
        }
        if (this.$cv_gds[i].check(u, path)) {
          if (!this.$cv_all) {
            this.winner = i;
            this.goal = path;
            return true;
          }
        } else {
          if (this.$cv_all) {
            return false;
          }
        }
      }
      if (this.$cv_all) {
        this.winner = 0;
        this.goal = path;
        return true;
      }
      return false;
    }
    $c($gds, $all): this {
      this.$cv_gds = $gds; this.$cv_all = $all;
      return this;
    }
  }, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$1', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

let $GoalDeciders$2: any = null;
/** An anonymous class (GoalDeciders.java:114). */
function GoalDeciders$2(): any {
  return $GoalDeciders$2 ??= $J.local(class extends JObject {
    bestPath: PathNode = null;
    bestValue: number = 0;
    $init_anon() {
      this.bestPath = null;
      this.bestValue = 0;
      return this;
    }
    getGoal(): PathNode {
      return this.bestPath;
    }
    hasSubGoals(): boolean {
      return true;
    }
    check(u: Unit, path: PathNode): boolean {
      let loc = path.getLastNode().getLocation();
      let settlement = loc.getSettlement();
      if (settlement != null && settlement.getOwner().owns(u)) {
        let value = Math.fround(((settlement.isConnectedPort()) ? 2 : 1) / ((path.getTotalTurns() + 1) | 0));
        if (this.bestValue < value) {
          this.bestValue = value;
          this.bestPath = path;
          return true;
        }
      }
      return false;
    }
  }, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$2', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

let $GoalDeciders$3: any = null;
/** An anonymous class (GoalDeciders.java:147). */
function GoalDeciders$3(): any {
  return $GoalDeciders$3 ??= $J.local(class extends JObject {
    best: PathNode = null;
    $init_anon() {
      this.best = null;
      return this;
    }
    getGoal(): PathNode {
      return this.best;
    }
    hasSubGoals(): boolean {
      return false;
    }
    check(u: Unit, path: PathNode): boolean {
      let tile = path.getTile();
      if (tile != null && tile.isExploredBy(u.getOwner()) && tile.isDirectlyHighSeasConnected() && (tile.getFirstUnit() == null || u.getOwner().owns(tile.getFirstUnit()))) {
        if (this.best == null || path.getCost() < this.best.getCost()) {
          this.best = path;
          return true;
        }
      }
      return false;
    }
  }, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$3', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

let $GoalDeciders$4: any = null;
/** An anonymous class (GoalDeciders.java:179). */
function GoalDeciders$4(): any {
  return $GoalDeciders$4 ??= $J.local(class extends JObject {
    first_: PathNode = null;
    $init_anon() {
      this.first_ = null;
      return this;
    }
    getGoal(): PathNode {
      return this.first_;
    }
    hasSubGoals(): boolean {
      return false;
    }
    check(u: Unit, path: PathNode): boolean {
      let tile = path.getTile();
      if (tile != null && tile.isDirectlyHighSeasConnected()) {
        this.first_ = path;
        return true;
      }
      return false;
    }
  }, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$4', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

let $GoalDeciders$5: any = null;
/** An anonymous class (GoalDeciders.java:207). */
function GoalDeciders$5(): any {
  return $GoalDeciders$5 ??= $J.local(class extends JObject {
    best: PathNode = null;
    bestCost: number = 0;
    $init_anon() {
      this.best = null;
      this.bestCost = Constants.INFINITY;
      return this;
    }
    getGoal(): PathNode {
      return this.best;
    }
    hasSubGoals(): boolean {
      return false;
    }
    check(u: Unit, path: PathNode): boolean {
      let cost: number;
      if (Map_.isSameLocation(path.getLocation(), this.$cv_target)) {
        if ((cost = path.getCost()) < this.bestCost) {
          this.best = path;
          this.bestCost = cost;
        }
        return true;
      }
      return false;
    }
    $c($target): this {
      this.$cv_target = $target;
      return this;
    }
  }, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$5', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

let $GoalDeciders$6: any = null;
/** An anonymous class (GoalDeciders.java:241). */
function GoalDeciders$6(): any {
  return $GoalDeciders$6 ??= $J.local(class extends JObject {
    best: PathNode = null;
    $init_anon() {
      this.best = null;
      return this;
    }
    getGoal(): PathNode {
      return this.best;
    }
    hasSubGoals(): boolean {
      return false;
    }
    check(u: Unit, path: PathNode): boolean {
      let t = path.getTile();
      if (t != null && t.isAdjacent(this.$cv_tile)) {
        this.best = path;
        return true;
      }
      return false;
    }
    $c($tile): this {
      this.$cv_tile = $tile;
      return this;
    }
  }, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$6', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

let $GoalDeciders$7: any = null;
/** An anonymous class (GoalDeciders.java:268). */
function GoalDeciders$7(): any {
  return $GoalDeciders$7 ??= $J.local(class extends JObject {
    best: PathNode = null;
    $init_anon() {
      this.best = null;
      return this;
    }
    getGoal(): PathNode {
      return this.best;
    }
    hasSubGoals(): boolean {
      return false;
    }
    check(u: Unit, path: PathNode): boolean {
      let t = path.getTile();
      if (t == null || !t.isLand()) {
        return false;
      }
      let s = t.getSettlement();
      if (s == null) {
        return false;
      }
      if (this.$cv_enemies.contains(s.getOwner())) {
        this.best = path;
        return true;
      }
      return false;
    }
    $c($enemies): this {
      this.$cv_enemies = $enemies;
      return this;
    }
  }, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$7', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

let $GoalDeciders$8: any = null;
/** An anonymous class (GoalDeciders.java:307). */
function GoalDeciders$8(): any {
  return $GoalDeciders$8 ??= $J.local(class extends JObject {
    bestScore: number = 0;
    goal: PathNode = null;
    $init_anon() {
      this.bestScore = -1;
      this.goal = null;
      return this;
    }
    getGoal(): PathNode {
      return this.goal;
    }
    hasSubGoals(): boolean {
      return true;
    }
    check(u: Unit, pathNode: PathNode): boolean {
      let tile = pathNode.getTile();
      if (tile == null || !tile.isLand() || !tile.isEmpty() || tile.hasSettlement()) {
        return false;
      }
      let owner = u.getOwner();
      let map = u.getGame().getMap();
      let dockPred = (t) => t.isHighSeasConnected() && !t.isLand();
      let dangerPred = (t) => {
        let settlement = t.getSettlement();
        return (settlement != null && !owner.owns(settlement) && settlement.hasAbility$String(Ability.BOMBARD_SHIPS) && (owner.atWarWith(settlement.getOwner()) || u.hasAbility$String(Ability.PIRACY)));
      };
      let tileScorer = CollectionUtils.cacheDouble((t) => $J.boxD((t.getDefenceValue() / (1 + map.getDistance(this.$cv_target, t)) + ((CollectionUtils.none$Collection$Predicate(t.getSurroundingTiles$int$int(1, 1), dangerPred)) ? this.$cv_NO_DANGER_BONUS : 0))));
      let best = CollectionUtils.maximize$Collection$Predicate$Comparator(tile.getSurroundingTiles$int$int(1, 1), dockPred, Comparator.comparingDouble(tileScorer));
      let score: number;
      if (best != null && (score = tileScorer(best)) > this.bestScore) {
        this.bestScore = score;
        this.goal = pathNode;
        return true;
      }
      return false;
    }
    $c($target, $NO_DANGER_BONUS): this {
      this.$cv_target = $target; this.$cv_NO_DANGER_BONUS = $NO_DANGER_BONUS;
      return this;
    }
  }, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$8', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

let $GoalDeciders$9: any = null;
/** An anonymous class (GoalDeciders.java:358). */
function GoalDeciders$9(): any {
  return $GoalDeciders$9 ??= $J.local(class extends JObject {
    goal: PathNode = null;
    $init_anon() {
      this.goal = null;
      return this;
    }
    getGoal(): PathNode {
      return this.goal;
    }
    hasSubGoals(): boolean {
      return true;
    }
    check(u: Unit, pathNode: PathNode): boolean {
      let tile = pathNode.getTile();
      if (this.$cv_enemy.canSee(tile)) {
        return false;
      }
      this.goal = pathNode;
      return true;
    }
    $c($enemy): this {
      this.$cv_enemy = $enemy;
      return this;
    }
  }, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$9', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

let $GoalDeciders$10: any = null;
/** An anonymous class (GoalDeciders.java:384). */
function GoalDeciders$10(): any {
  return $GoalDeciders$10 ??= $J.local(class extends JObject {
    goal: PathNode = null;
    score: number = 0;
    $init_anon() {
      this.goal = null;
      this.score = this.$cv_unit.getTile$().getHighSeasCount();
      return this;
    }
    getGoal(): PathNode {
      return this.goal;
    }
    hasSubGoals(): boolean {
      return true;
    }
    check(u: Unit, pathNode: PathNode): boolean {
      let tile = pathNode.getTile();
      if (tile.getHighSeasCount() < this.score) {
        let s = tile.getSettlement();
        if (this.$cv_unit.getOwner().owns(s)) {
          this.goal = pathNode;
          this.score = tile.getHighSeasCount();
          return true;
        }
      }
      return false;
    }
    $c($unit): this {
      this.$cv_unit = $unit;
      return this;
    }
  }, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$10', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

let $GoalDeciders$11: any = null;
/** An anonymous class (GoalDeciders.java:417). */
function GoalDeciders$11(): any {
  return $GoalDeciders$11 ??= $J.local(class extends JObject {
    goal: PathNode = null;
    score: number = 0;
    $init_anon() {
      this.goal = null;
      this.score = 2147483647;
      return this;
    }
    getGoal(): PathNode {
      return this.goal;
    }
    hasSubGoals(): boolean {
      return true;
    }
    check(u: Unit, pathNode: PathNode): boolean {
      let tile = pathNode.getTile();
      if (tile.getHighSeasCount() < this.score && tile.isRiverCorner()) {
        this.score = tile.getHighSeasCount();
        this.goal = pathNode;
        return true;
      }
      return false;
    }
  }, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$11', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

let $GoalDeciders$MultipleAdjacentDecider$1: any = null;
/** An anonymous class (GoalDeciders.java:457). */
function GoalDeciders$MultipleAdjacentDecider$1(): any {
  return $GoalDeciders$MultipleAdjacentDecider$1 ??= $J.local(class extends JObject {
    getGoal(): PathNode {
      return null;
    }
    hasSubGoals(): boolean {
      return true;
    }
    check(u: Unit, path: PathNode): boolean {
      let tile = path.getTile();
      if (tile == null) {
        return false;
      }
      for (const $it0 = (CollectionUtils.transform$Collection$Predicate(this.$cv_locs, (l) => tile.isAdjacent(l.getTile$()))).iterator(); $it0.hasNext(); ) {
        let loc = $it0.next();
        let p = this.$outer.results.get(loc);
        if (p == null || p.getCost() > path.getCost()) {
          this.$outer.results.put(loc, path);
        }
      }
      return false;
    }
    $c($locs): this {
      this.$cv_locs = $locs;
      return this;
    }
  }, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$MultipleAdjacentDecider$1', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

$J.define(GoalDeciders, 'net.sf.freecol.common.model.pathfinding.GoalDeciders', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_GoalDeciders' } });
$J.define(GoalDeciders$MultipleAdjacentDecider, 'net.sf.freecol.common.model.pathfinding.GoalDeciders$MultipleAdjacentDecider', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.util.List': '_GoalDeciders$MultipleAdjacentDecider' }, returns: { 'getResults': 'java.util.HashMap', 'getGoalDecider': 'net.sf.freecol.common.model.pathfinding.GoalDecider' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
