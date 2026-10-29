// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/pathfinding/CostDeciders.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, RuntimeException } from '../../../../../../../jre/index.ts';
import { BaseCostDecider } from './BaseCostDecider.ts';

let Ability, Constants, Europe, CostDecider, CollectionUtils;

/**
 * Cost deciders to be used while finding paths.
 */
export class CostDeciders extends JObject {
  /**
   * A {@code CostDecider} that costs unit moves normally.
   */
  static avoidIllegalCostDecider: CostDecider = null;
  /**
   * A trivial {@code CostDecider} that only considers the
   * number of locations visited when determining cost.  Totally ignores
   * the legality of the move.
   */
  static trivialCostDecider: CostDecider = null;
  /**
   * A {@code CostDecider} that only considers the number of legal
   * tiles visited when determining the cost.
   */
  static legalTileCountDecider: CostDecider = null;
  /**
   * A server-side {@code CostDecider} that costs unit moves normally.
   */
  static serverAvoidIllegalCostDecider: CostDecider = null;
  /**
   * An instance of the cost decider for avoiding settlements.
   */
  static avoidSettlementsCostDecider: CostDeciders$AvoidSettlementsCostDecider = null;
  /**
   * An instance of the settlement+unit avoiding cost decider.
   */
  static avoidSettlementsAndBlockingUnitsCostDecider: CostDeciders$AvoidSettlementsAndBlockingUnitsCostDecider = null;
  _CostDeciders(): this {
    return this;
  }
  /**
   * Gets a composite cost decider composed of two or more
   * individual cost deciders.  The result/s are determined by the
   * cost decider which returns the highest cost, with an
   * ILLEGAL_MOVE result dominating.
   *
   * @param cds A series (two minimum) of {@code CostDecider}s
   *     to compose.
   * @return A new {@code CostDecider} composed of the argument
   *     cost deciders.
   */
  static getComposedCostDecider(cds: CostDecider[]): CostDecider {
    if (cds.length < 2) {
      throw new RuntimeException('Short CostDecider list: ' + cds.length);
    }
    return new (CostDeciders$3())().$c(cds).$init_anon();
  }
  /**
   * Selects a default {@code CostDecider} for the given unit
   * depending on the owner of the unit and if the unit can attack
   * other units.
   *
   * @param unit The {@code Unit} to choose a CostDecider for.
   * @return A suitable {@code CostDecider}.
   */
  static defaultCostDeciderFor(unit: Unit): CostDecider {
    return (unit == null) ? CostDeciders.avoidIllegal() : (unit.isNaval() && !unit.isOffensiveUnit()) ? CostDeciders.avoidNavalDanger() : (unit.isOffensiveUnit()) ? CostDeciders.avoidSettlements() : CostDeciders.avoidSettlementsAndBlockingUnits();
  }
  /**
   * The trivial {@code CostDecider}.
   *
   * @return The {@code CostDecider}.
   */
  static numberOfTiles(): CostDecider {
    return CostDeciders.trivialCostDecider;
  }
  /**
   * Get a {@code CostDecider} that considers only tile cost, but otherwise
   * ignores legality.
   *
   * This is useful for path finding to a tile that is temporarily blocked
   * by another nations unit.
   *
   * @return The {@code CostDecider}.
   */
  static tileCost(): CostDecider {
    return new CostDeciders$TileCostDecider()._CostDeciders$TileCostDecider();
  }
  /**
   * A {@code CostDecider} only considering the number of legal tiles
   * visited when determining the cost.
   *
   * @return The {@code CostDecider}.
   */
  static numberOfLegalTiles(): CostDecider {
    return CostDeciders.legalTileCountDecider;
  }
  /**
   * A {@code CostDecider} that returns the cost of moving
   * across the terrain, excluding only illegal moves.
   *
   * @return The {@code CostDecider}.
   */
  static avoidIllegal(): CostDecider {
    return CostDeciders.avoidIllegalCostDecider;
  }
  /**
   * A {@code CostDecider} that returns the cost of moving
   * across the terrain, excluding only illegal moves, and works correctly
   * on the server side by refusing to consider locations unexplored by the
   * player.
   *
   * @return The {@code CostDecider}.
   */
  static serverAvoidIllegal(): CostDecider {
    return CostDeciders.serverAvoidIllegalCostDecider;
  }
  /**
   * A {@code CostDecider} returning only the cost of moving
   * across the terrain (no additional cost for blocking enemy units
   * etc) but excluding settlements.
   *
   * Public for the test suite.
   *
   * @return The {@code CostDecider}.
   */
  static avoidSettlements(): CostDecider {
    return CostDeciders.avoidSettlementsCostDecider;
  }
  /**
   * A {@code CostDecider} for avoiding using locations which have
   * blocking enemy units on them. Paths containing an enemy
   * settlement are considered illegal, and so are paths where the
   * next move has an enemy unit on it.
   *
   * @return The {@code CostDecider}.
   */
  static avoidSettlementsAndBlockingUnits(): CostDecider {
    return CostDeciders.avoidSettlementsAndBlockingUnitsCostDecider;
  }
  /**
   * A {@code CostDecider} for avoiding using locations which have
   * blocking enemy units or expose naval units to bombardment.
   *
   * @return The {@code CostDecider}.
   */
  static avoidNavalDanger(): CostDecider {
    return new CostDeciders$AvoidNavalDangerCostDecider()._CostDeciders$AvoidNavalDangerCostDecider();
  }
  static $clinit() {
    CostDeciders.avoidIllegalCostDecider = new BaseCostDecider()._BaseCostDecider();
    CostDeciders.trivialCostDecider = new (CostDeciders$1())();
    CostDeciders.legalTileCountDecider = new (CostDeciders$2())();
    CostDeciders.serverAvoidIllegalCostDecider = new CostDeciders$ServerBaseCostDecider()._CostDeciders$ServerBaseCostDecider();
    CostDeciders.avoidSettlementsCostDecider = new CostDeciders$AvoidSettlementsCostDecider()._CostDeciders$AvoidSettlementsCostDecider();
    CostDeciders.avoidSettlementsAndBlockingUnitsCostDecider = new CostDeciders$AvoidSettlementsAndBlockingUnitsCostDecider()._CostDeciders$AvoidSettlementsAndBlockingUnitsCostDecider();
  }
}

/**
 * A simple {@code CostDecider} that considers only the base tile
 * cost.  Totally ignores the legality of the move as this is used
 * when considering paths to temporarily blocked goals.
 */
export class CostDeciders$TileCostDecider extends BaseCostDecider {
  _CostDeciders$TileCostDecider(): this {
    this._BaseCostDecider();
    return this;
  }
  getCost(unit: Unit, oldLocation: Location, newLocation: Location, movesLeft: number): number {
    if (oldLocation == null || newLocation == null) {
      return CostDecider.ILLEGAL_MOVE;
    }
    if (newLocation instanceof Europe || oldLocation instanceof Europe) {
      return 1;
    }
    if (newLocation.getTile$() == null || oldLocation.getTile$() == null) {
      return CostDecider.ILLEGAL_MOVE;
    }
    return this.adjust(unit, oldLocation.getTile$(), newLocation.getTile$(), movesLeft);
  }
}

/**
 * A {@code CostDecider} that uses server-side knowledge of where
 * a player has explored to limit searches.
 */
export class CostDeciders$ServerBaseCostDecider extends BaseCostDecider {
  _CostDeciders$ServerBaseCostDecider(): this {
    this._BaseCostDecider();
    return this;
  }
  getCost(unit: Unit, oldLocation: Location, newLocation: Location, movesLeft: number): number {
    let cost = super.getCost(unit, oldLocation, newLocation, movesLeft);
    if (cost !== CostDecider.ILLEGAL_MOVE && cost !== Constants.INFINITY) {
      if (newLocation instanceof Europe) {
      } else if (!newLocation.getTile$().isExploredBy(unit.getOwner())) {
        return CostDecider.ILLEGAL_MOVE;
      }
    }
    return cost;
  }
}

/**
 * A {@code CostDecider} that costs unit moves normally while
 * avoiding other player settlements.
 */
export class CostDeciders$AvoidSettlementsCostDecider extends BaseCostDecider {
  _CostDeciders$AvoidSettlementsCostDecider(): this {
    this._BaseCostDecider();
    return this;
  }
  getCost(unit: Unit, oldLocation: Location, newLocation: Location, movesLeft: number): number {
    let cost = super.getCost(unit, oldLocation, newLocation, movesLeft);
    if (cost !== CostDecider.ILLEGAL_MOVE && cost !== Constants.INFINITY) {
      let settlement = newLocation.getSettlement();
      if (settlement != null && settlement.getOwner() !== unit.getOwner()) {
        return CostDecider.ILLEGAL_MOVE;
      }
    }
    return cost;
  }
}

/**
 * A {@code CostDecider} that costs unit moves normally while
 * avoiding other player settlements and units, and does not explore
 * if it is trading.
 */
export class CostDeciders$AvoidSettlementsAndBlockingUnitsCostDecider extends CostDeciders$AvoidSettlementsCostDecider {
  _CostDeciders$AvoidSettlementsAndBlockingUnitsCostDecider(): this {
    this._CostDeciders$AvoidSettlementsCostDecider();
    return this;
  }
  getCost(unit: Unit, oldLocation: Location, newLocation: Location, movesLeft: number): number {
    let cost = super.getCost(unit, oldLocation, newLocation, movesLeft);
    let tile = newLocation.getTile$();
    if (cost !== CostDecider.ILLEGAL_MOVE && cost !== Constants.INFINITY && tile != null) {
      let defender = tile.getFirstUnit();
      if (defender != null && defender.getOwner() !== unit.getOwner()) {
        return CostDecider.ILLEGAL_MOVE;
      } else if (unit.getTradeRoute() != null && tile.hasLostCityRumour()) {
        return CostDecider.ILLEGAL_MOVE;
      }
    }
    return cost;
  }
}

/**
 * A {@code CostDecider} to avoid naval danger.
 */
export class CostDeciders$AvoidNavalDangerCostDecider extends CostDeciders$AvoidSettlementsAndBlockingUnitsCostDecider {
  static readonly DANGER_FACTOR: number = 2;
  _CostDeciders$AvoidNavalDangerCostDecider(): this {
    this._CostDeciders$AvoidSettlementsAndBlockingUnitsCostDecider();
    return this;
  }
  getCost(unit: Unit, oldLocation: Location, newLocation: Location, movesLeft: number): number {
    let cost = super.getCost(unit, oldLocation, newLocation, movesLeft);
    let tile = newLocation.getTile$();
    if (cost !== CostDecider.ILLEGAL_MOVE && cost !== Constants.INFINITY && tile != null) {
      let owner = unit.getOwner();
      let threatPred = (u) => (!owner.owns(u) && u.isNaval() && (u.hasAbility$String(Ability.PIRACY) || (u.getOwner().atWarWith(owner) && u.isOffensiveUnit())));
      if (CollectionUtils.any$Stream$Predicate(CollectionUtils.flatten$Collection$Function(tile.getSurroundingTiles$int$int(1, 1), ($p0) => $p0.getUnits()), threatPred)) {
        cost = (cost + this.movesLeft) | 0;
        this.movesLeft = 0;
        this.newTurns++;
      }
      if (tile.isDangerousToShip(unit)) {
        cost = Math.imul(cost, CostDeciders$AvoidNavalDangerCostDecider.DANGER_FACTOR);
      }
    }
    return cost;
  }
}

let $CostDeciders$3: any = null;
/** An anonymous class (CostDeciders.java:251). */
function CostDeciders$3(): any {
  return $CostDeciders$3 ??= $J.local(class extends JObject {
    costDeciders: CostDecider[] = null;
    ret: number = 0;
    index_: number = 0;
    $init_anon() {
      this.costDeciders = this.$cv_cds;
      this.ret = -1;
      this.index_ = -1;
      return this;
    }
    getCost(unit: Unit, oldLocation: Location, newLocation: Location, movesLeft: number): number {
      for (let i = 0; i < this.costDeciders.length; i++) {
        let cost = this.costDeciders[i].getCost(unit, oldLocation, newLocation, movesLeft);
        if (cost === CostDecider.ILLEGAL_MOVE || cost === Constants.INFINITY) {
          this.index_ = i;
          return CostDecider.ILLEGAL_MOVE;
        }
        if (cost > this.ret) {
          this.index_ = i;
          this.ret = cost;
        }
      }
      return this.ret;
    }
    getMovesLeft(): number {
      return (this.index_ < 0) ? 0 : this.costDeciders[this.index_].getMovesLeft();
    }
    getNewTurns(): number {
      return (this.index_ < 0) ? 0 : this.costDeciders[this.index_].getNewTurns();
    }
    $c($cds): this {
      this.$cv_cds = $cds;
      return this;
    }
  }, 'net.sf.freecol.common.model.pathfinding.CostDeciders$3', ['net.sf.freecol.common.model.pathfinding.CostDecider']);
}

let $CostDeciders$1: any = null;
/** An anonymous class (CostDeciders.java:52). */
function CostDeciders$1(): any {
  return $CostDeciders$1 ??= $J.local(class extends JObject {
    getCost(unit: Unit, oldLocation: Location, newLocation: Location, movesLeft: number): number {
      return (newLocation == null) ? CostDecider.ILLEGAL_MOVE : (newLocation instanceof Europe) ? 1 : (newLocation.getTile$() == null) ? CostDecider.ILLEGAL_MOVE : 1;
    }
    getMovesLeft(): number {
      return 0;
    }
    getNewTurns(): number {
      return 0;
    }
  }, 'net.sf.freecol.common.model.pathfinding.CostDeciders$1', ['net.sf.freecol.common.model.pathfinding.CostDecider']);
}

let $CostDeciders$2: any = null;
/** An anonymous class (CostDeciders.java:93). */
function CostDeciders$2(): any {
  return $CostDeciders$2 ??= $J.local(class extends JObject {
    getCost(unit: Unit, oldLocation: Location, newLocation: Location, movesLeft: number): number {
      return (newLocation == null) ? CostDecider.ILLEGAL_MOVE : (newLocation instanceof Europe) ? 1 : (newLocation.getTile$() == null) ? CostDecider.ILLEGAL_MOVE : (unit.isTileAccessible(newLocation.getTile$())) ? 1 : CostDecider.ILLEGAL_MOVE;
    }
    getMovesLeft(): number {
      return 0;
    }
    getNewTurns(): number {
      return 1;
    }
  }, 'net.sf.freecol.common.model.pathfinding.CostDeciders$2', ['net.sf.freecol.common.model.pathfinding.CostDecider']);
}

$J.define(CostDeciders, 'net.sf.freecol.common.model.pathfinding.CostDeciders', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_CostDeciders' }, clinit: true, lazy: ['avoidIllegalCostDecider', 'trivialCostDecider', 'legalTileCountDecider', 'serverAvoidIllegalCostDecider', 'avoidSettlementsCostDecider', 'avoidSettlementsAndBlockingUnitsCostDecider'] });
$J.define(CostDeciders$TileCostDecider, 'net.sf.freecol.common.model.pathfinding.CostDeciders$TileCostDecider', { kind: 'class', sup: 'net.sf.freecol.common.model.pathfinding.BaseCostDecider', ctors: { '': '_CostDeciders$TileCostDecider' } });
$J.define(CostDeciders$ServerBaseCostDecider, 'net.sf.freecol.common.model.pathfinding.CostDeciders$ServerBaseCostDecider', { kind: 'class', sup: 'net.sf.freecol.common.model.pathfinding.BaseCostDecider', ctors: { '': '_CostDeciders$ServerBaseCostDecider' } });
$J.define(CostDeciders$AvoidSettlementsCostDecider, 'net.sf.freecol.common.model.pathfinding.CostDeciders$AvoidSettlementsCostDecider', { kind: 'class', sup: 'net.sf.freecol.common.model.pathfinding.BaseCostDecider', ctors: { '': '_CostDeciders$AvoidSettlementsCostDecider' } });
$J.define(CostDeciders$AvoidSettlementsAndBlockingUnitsCostDecider, 'net.sf.freecol.common.model.pathfinding.CostDeciders$AvoidSettlementsAndBlockingUnitsCostDecider', { kind: 'class', sup: 'net.sf.freecol.common.model.pathfinding.CostDeciders$AvoidSettlementsCostDecider', ctors: { '': '_CostDeciders$AvoidSettlementsAndBlockingUnitsCostDecider' } });
$J.define(CostDeciders$AvoidNavalDangerCostDecider, 'net.sf.freecol.common.model.pathfinding.CostDeciders$AvoidNavalDangerCostDecider', { kind: 'class', sup: 'net.sf.freecol.common.model.pathfinding.CostDeciders$AvoidSettlementsAndBlockingUnitsCostDecider', ctors: { '': '_CostDeciders$AvoidNavalDangerCostDecider' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  CostDecider = $J.load('net.sf.freecol.common.model.pathfinding.CostDecider');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
