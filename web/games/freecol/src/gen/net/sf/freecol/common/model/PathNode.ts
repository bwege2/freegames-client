// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/PathNode.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

let Constants, LogBuilder;

/**
 * Represents a single {@code Location} in a path.
 *
 * You will most likely be using: {@link #next}, {@link #getDirection},
 * {@link #getTile} and {@link #getTotalTurns}, when
 * evaluating/following a path.
 */
export class PathNode extends JObject {
  /**
   * Weight turns much greater than moves.
   */
  static readonly TURN_FACTOR: number = 100;
  /**
   * The location this node refers to.  Usually a Tile.
   */
  location_: Location = null;
  /**
   * The number of moves left at this node for the unit traversing
   * this path.
   */
  movesLeft: number = 0;
  /**
   * The number of turns used to get to this node by the unit
   * traversing the path.
   */
  turns: number = 0;
  /**
   * Whether the unit traversing this path is on a carrier at this node.
   */
  onCarrier: boolean = false;
  /**
   * The next node in the path.
   */
  next_: PathNode = null;
  /**
   * The previous node in the path.
   */
  previous_: PathNode = null;
  /**
   * Creates a new {@code PathNode}.
   *
   * @param location The {@code Location} this
   *      {@code PathNode} represents in the path.
   * @param movesLeft The number of moves remaining at this point in
   *      the path.
   * @param turns The number of turns it takes to reach this
   *      {@code PathNode}'s {@code Tile} from the start
   *      of the path.
   * @param onCarrier Whether the path is still using a carrier.
   * @param previous The previous {@code PathNode} in the path.
   * @param next The next {@code PathNode} in the path.
   */
  _PathNode(location: Location, movesLeft: number, turns: number, onCarrier: boolean, previous: PathNode, next: PathNode): this {
    this.onCarrier = false;
    this.next_ = null;
    this.previous_ = null;
    this.location_ = location;
    this.movesLeft = movesLeft;
    this.turns = turns;
    this.onCarrier = onCarrier;
    this.previous_ = previous;
    this.next_ = next;
    return this;
  }
  /**
   * Gets the location of this path.
   *
   * @return The {@code Location}.
   */
  getLocation(): Location {
    return this.location_;
  }
  /**
   * Gets the {@code Tile} of this {@code PathNode}.
   *
   * @return The {@code Tile} this {@code PathNode}
   *     represents in the path, if any.
   */
  getTile(): Tile {
    return (this.location_ == null) ? null : this.location_.getTile$();
  }
  /**
   * Gets the number of moves remaining at this point in the path.
   *
   * @return The number of moves remaining. {@code -1} is
   *     returned if the number of moves left has not been calculated.
   */
  getMovesLeft(): number {
    return this.movesLeft;
  }
  /**
   * Sets the number of moves remaining at this point in the path.
   *
   * @param movesLeft The number of moves remaining.
   */
  setMovesLeft(movesLeft: number): void {
    this.movesLeft = movesLeft;
  }
  /**
   * Gets the number of turns it will take to reach this
   * {@code PathNode}'s {@code Tile} in the path.
   *
   * @return The number of turns, using zero for the first
   *     move. {@code -1} is returned if the number of turns
   *     has not been calculated.
   */
  getTurns(): number {
    return this.turns;
  }
  /**
   * Sets the number of turns it will take to reach this
   * {@code PathNode}'s {@code Tile} in the path.
   *
   * @param turns The new number of turns.
   */
  setTurns(turns: number): void {
    this.turns = turns;
  }
  /**
   * Adds turns to the turns on this path.
   *
   * @param turns The number of turns to add.
   */
  addTurns(turns: number): void {
    for (let p = this; p != null; p = p.next_) {
      p.setTurns((p.getTurns() + turns) | 0);
    }
  }
  /**
   * Checks if the unit using this path is still onboard its transport.
   *
   * @return {@code true} if the unit is still onboard a
   *     carrier when using this path.
   * @see #getTransportDropTurns
   */
  isOnCarrier(): boolean {
    return this.onCarrier;
  }
  /**
   * Sets if the unit using this path is still onboard its transport.
   *
   * @param onCarrier Should be set to {@code true} in order to
   *     indicate that the unit using this path is still onboard the
   *     carrier on this path node.
   * @see #getTransportDropTurns
   */
  setOnCarrier(onCarrier: boolean): void {
    this.onCarrier = onCarrier;
  }
  /**
   * Get the length of the path.
   *
   * @return The number of nodes in the path.
   */
  getLength(): number {
    let n = 0;
    for (let temp = this; temp != null; temp = temp.next_) {
      n++;
    }
    return n;
  }
  /**
   * Gets the direction to move in order to get to this path node.
   *
   * @return The direction to move on the map in order to get to the
   *     {@code Tile} returned by this {@code PathNode}'s
   *     {@link #getTile}, or null if there is no previous node or either
   *     this or the previous node location is not on the map.
   */
  getDirection(): Direction {
    if (this.previous_ == null || this.previous_.getTile() == null || this.getTile() == null) {
      return null;
    }
    let prev = this.previous_.getTile();
    return prev.getMap().getDirection(prev, this.getTile());
  }
  /**
   * Gets the node where the unit using this path should leave its
   * transport.
   *
   * @return The node where the unit leaves the carrier.
   */
  getTransportDropNode(): PathNode {
    let p = this;
    while (p.next_ != null && p.isOnCarrier()) {
      p = p.next_;
    }
    return p;
  }
  /**
   * Gets the first node of this path.
   *
   * @return The first {@code PathNode}.
   */
  getFirstNode(): PathNode {
    let path: PathNode;
    for (path = this; path.previous_ != null; path = path.previous_) {
    }
    return path;
  }
  /**
   * Gets the last node of this path.
   *
   * @return The last {@code PathNode}.
   */
  getLastNode(): PathNode {
    let path: PathNode;
    for (path = this; path.next_ != null; path = path.next_) {
    }
    return path;
  }
  /**
   * Gets the number of turns it will take to move the entire path,
   * from the starting {@code PathNode} until the end.
   *
   * @return The number of turns, using zero for the first move.
   */
  getTotalTurns(): number {
    let path = this.getLastNode();
    let n = path.getTurns();
    if (path.getMovesLeft() === 0) {
      n++;
    }
    return n;
  }
  /**
   * Gets the number of turns it takes to reach the
   * {@link #getTransportDropNode transport node}.
   *
   * @return The number of turns in takes to get to the node where
   *     the unit using this path should leave it's transport.
   */
  getTransportDropTurns(): number {
    return this.getTransportDropNode().getTurns();
  }
  /**
   * Standard function to get the cost of moving to a {@code PathNode}.
   *
   * Static version provided for path calculation comparisons.  Some
   * care is taken to avoid overflow as test paths with infinite
   * moves are created in the path planning process.
   *
   * @param turns The number of turns taken.
   * @param movesLeft The number of moves left for the moving unit.
   * @return The cost of moving to a {@code PathNode}.
   */
  static getNodeCost(turns: number, movesLeft: number): number {
    return (turns >= $J.idiv(Constants.INFINITY, ((PathNode.TURN_FACTOR + 1) | 0))) ? Constants.INFINITY : (Math.imul(PathNode.TURN_FACTOR, turns) + (PathNode.TURN_FACTOR - movesLeft)) | 0;
  }
  /**
   * Gets the cost of moving to this {@code PathNode}.
   *
   * @return The cost of moving to this {@code PathNode}.
   */
  getCost(): number {
    return PathNode.getNodeCost(this.turns, this.movesLeft);
  }
  /**
   * Gets the next carrier move on this path.
   *
   * @return The first node along the path which is a carrier move, or null
   *     if the path does not use a carrier.
   */
  getCarrierMove(): PathNode {
    for (let p = this; p != null; p = p.next_) {
      if (p.isOnCarrier()) {
        return p;
      }
    }
    return null;
  }
  /**
   * Does this path us a carrier at any point?
   *
   * @return True if there is an onCarrier move in this path.
   */
  usesCarrier(): boolean {
    return this.getFirstNode().getCarrierMove() != null;
  }
  /**
   * Does this path include a non-carrier move within a given turn?
   *
   * @param turns Paths with fewer turns than this are previous turns.
   * @return True if there was a non-carrier move in the last turn.
   */
  embarkedThisTurn(turns: number): boolean {
    for (let p = this; p != null; p = p.previous_) {
      if (p.getTurns() < turns) {
        return false;
      }
      if (!p.isOnCarrier()) {
        return true;
      }
    }
    return false;
  }
  /**
   * Convert this path to a delivery path for some goods, where
   * every node is marked as on carrier, except for a duplicate of
   * the last node.
   */
  convertToGoodsDeliveryPath(): void {
    let p: PathNode;
    for (p = this; p.next_ != null; p = p.next_) {
      p.onCarrier = true;
    }
    p.onCarrier = true;
    this.ensureDisembark();
  }
  /**
   * Ensure the last node of this path is no longer on the carrier.
   */
  ensureDisembark(): void {
    let p = this.getLastNode();
    if (p.isOnCarrier()) {
      p.next_ = new PathNode()._PathNode(p.location_, p.movesLeft, p.turns, false, p, null);
    }
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let lb = new LogBuilder()._LogBuilder(256);
    lb.add(['PathNode loc=', this.location_, ' movesLeft=', this.movesLeft, ' turns=', this.turns, ' onCarrier=', this.onCarrier, ' direction=', this.getDirection(), ' cost=', this.getCost()]);
    return lb.toString();
  }
  /**
   * Another debug helper.
   *
   * @return A string describing the whole path.
   */
  fullPathToString(): string {
    let lb = new LogBuilder()._LogBuilder(500);
    let p: PathNode;
    for (p = this; p != null; p = p.next_) {
      lb.add([p, '\n']);
    }
    return lb.toString();
  }
}

$J.define(PathNode, 'net.sf.freecol.common.model.PathNode', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Location,int,int,boolean,net.sf.freecol.common.model.PathNode,net.sf.freecol.common.model.PathNode': '_PathNode' }, returns: { 'getCarrierMove': 'net.sf.freecol.common.model.PathNode', 'getCost': 'int', 'getTransportDropTurns': 'int', 'getTotalTurns': 'int', 'getLastNode': 'net.sf.freecol.common.model.PathNode', 'getFirstNode': 'net.sf.freecol.common.model.PathNode', 'getTransportDropNode': 'net.sf.freecol.common.model.PathNode', 'getDirection': 'net.sf.freecol.common.model.Direction', 'getLength': 'int', 'isOnCarrier': 'boolean', 'getTurns': 'int', 'getMovesLeft': 'int', 'getTile': 'net.sf.freecol.common.model.Tile', 'getLocation': 'net.sf.freecol.common.model.Location' } });
$J.module(() => {
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
});
