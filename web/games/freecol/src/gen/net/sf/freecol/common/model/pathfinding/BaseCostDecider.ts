// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/pathfinding/BaseCostDecider.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';

let Europe, Unit$MoveType, CostDecider;

/**
 * Class for determining the cost of a single move.
 *
 * This {@link CostDecider} is used as a default by
 * {@link net.sf.freecol.common.model.Map#findPath} and 
 * {@link net.sf.freecol.common.model.Map#search} 
 * if no other {@code CostDecider} has been specified.
 */
export class BaseCostDecider extends JObject {
  /**
   * The number of moves left following a proposed move.
   */
  movesLeft: number = 0;
  /**
   * The number of turns consumed by the proposed move.
   */
  newTurns: number = 0;
  _BaseCostDecider(): this {
    return this;
  }
  /**
   * Determines the cost of a single move.
   *
   * @param unit The {@code Unit} making the move.
   * @param oldLocation The {@code Location} we are moving from.
   * @param newLocation The {@code Location} we are moving to.
   * @param movesLeftBefore The moves left before making the move.
   * @return The cost of moving the given unit from the
   *      {@code oldLocation} to the {@code newLocation}.
   */
  getCost(unit: Unit, oldLocation: Location, newLocation: Location, movesLeftBefore: number): number {
    let cost = 0;
    this.newTurns = 0;
    let oldTile = oldLocation.getTile$();
    let newTile = newLocation.getTile$();
    if (oldLocation instanceof Europe) {
      if (newLocation instanceof Europe || newTile == null || !newTile.isDirectlyHighSeasConnected() || !unit.getType().canMoveToHighSeas()) {
        return CostDecider.ILLEGAL_MOVE;
      }
      this.newTurns = unit.getSailTurns();
      this.movesLeft = unit.getInitialMovesLeft();
      cost = Math.imul(this.newTurns, unit.getInitialMovesLeft());
    } else if (oldTile == null) {
      return CostDecider.ILLEGAL_MOVE;
    } else if (newLocation instanceof Europe) {
      if (!unit.getType().canMoveToHighSeas()) {
        return CostDecider.ILLEGAL_MOVE;
      }
      this.newTurns = unit.getSailTurns();
      this.movesLeft = unit.getInitialMovesLeft();
      cost = Math.imul(this.newTurns, unit.getInitialMovesLeft());
    } else if (newTile == null || !newTile.isExplored()) {
      return CostDecider.ILLEGAL_MOVE;
    } else {
      let consumeMove = false;
      switch (unit.getSimpleMoveType$Tile$Tile(oldTile, newTile)) {
        case Unit$MoveType.MOVE_HIGH_SEAS:
          break;
        case Unit$MoveType.ATTACK_UNIT:
        case Unit$MoveType.MOVE:
          if (!unit.isOnCarrier()) {
            break;
          }
        case Unit$MoveType.ATTACK_SETTLEMENT:
        case Unit$MoveType.EXPLORE_LOST_CITY_RUMOUR:
        case Unit$MoveType.EMBARK:
        case Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_FREE_COLONIST:
        case Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_SCOUT:
        case Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY:
        case Unit$MoveType.ENTER_FOREIGN_COLONY_WITH_SCOUT:
        case Unit$MoveType.ENTER_SETTLEMENT_WITH_CARRIER_AND_GOODS:
          consumeMove = true;
          break;
        default:
          return CostDecider.ILLEGAL_MOVE;
      }
      cost = this.adjust(unit, oldTile, newTile, movesLeftBefore);
      if (consumeMove) {
        cost = (cost + this.movesLeft) | 0;
        this.movesLeft = 0;
      }
    }
    return cost;
  }
  /**
   * Given an unit, a source and destination tile, and the moves
   * left, calculate actual moves left and new turns.
   *
   * @param unit The {@code Unit} to use.
   * @param oldTile The source {@code Tile}.
   * @param newTile The destination {@code Tile}.
   * @param movesLeftBefore An initial number of moves left.
   * @return The new movement cost, with this.movesLeft and this.newTurns
   *     adjusted.
   */
  adjust(unit: Unit, oldTile: Tile, newTile: Tile, movesLeftBefore: number): number {
    let cost = unit.getMoveCost$Tile$Tile$int(oldTile, newTile, movesLeftBefore);
    if (cost <= movesLeftBefore) {
      this.movesLeft = (movesLeftBefore - cost) | 0;
      this.newTurns = 0;
    } else {
      let thisTurnMovesLeft = movesLeftBefore;
      let initialMoves = unit.getInitialMovesLeft();
      let moveCostNextTurn = unit.getMoveCost$Tile$Tile$int(oldTile, newTile, initialMoves);
      cost = (thisTurnMovesLeft + moveCostNextTurn) | 0;
      this.movesLeft = (initialMoves - moveCostNextTurn) | 0;
      this.newTurns = 1;
    }
    return cost;
  }
  /**
   * Gets the number of moves left after the proposed move.
   * This method should be called after invoking {@link #getCost}.
   *
   * @return The number of moves left.
   */
  getMovesLeft(): number {
    return this.movesLeft;
  }
  /**
   * Gets the number of turns consumed by the proposed move.
   * This method should be called after invoking {@link #getCost}.
   *
   * @return The number of turns consumed.
   */
  getNewTurns(): number {
    return this.newTurns;
  }
}

$J.define(BaseCostDecider, 'net.sf.freecol.common.model.pathfinding.BaseCostDecider', { kind: 'class', ifaces: ['net.sf.freecol.common.model.pathfinding.CostDecider'], sup: 'java.lang.Object', ctors: { '': '_BaseCostDecider' }, returns: { 'getNewTurns': 'int', 'getMovesLeft': 'int' } });
$J.module(() => {
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDecider = $J.load('net.sf.freecol.common.model.pathfinding.CostDecider');
});
