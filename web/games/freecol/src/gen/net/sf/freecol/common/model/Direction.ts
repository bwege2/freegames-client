// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Direction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum } from '../../../../../../jre/index.ts';

let Messages, Map$Position, CollectionUtils, RandomUtils;

/**
 * The directions a Unit can move to. Includes deltas for moving
 * to adjacent squares, which are required due to the isometric
 * map. Starting north and going clockwise.
 */
export class Direction extends JEnum {
  static NUMBER_OF_DIRECTIONS: number = 0;
  static allDirections: List<Direction> = null;
  static longSides: List<Direction> = null;
  static corners: List<Direction> = null;
  /**
   * The direction increments.
   */
  oddDX: number = 0;
  oddDY: number = 0;
  evenDX: number = 0;
  evenDY: number = 0;
  static N: Direction = null;
  static NE: Direction = null;
  static E: Direction = null;
  static SE: Direction = null;
  static S: Direction = null;
  static SW: Direction = null;
  static W: Direction = null;
  static NW: Direction = null;
  static $VALUES: Direction[] = null;
  /**
   * Create a new direction with the given increments.
   *
   * @param oddDX Delta X/odd.
   * @param oddDY Delta y/odd.
   * @param evenDX Delta X/even.
   * @param evenDY Delta y/even.
   */
  _Direction($name: string, $ordinal: number, oddDX: number, oddDY: number, evenDX: number, evenDY: number): this {
    this._JEnum($name, $ordinal);
    this.oddDX = oddDX;
    this.oddDY = oddDY;
    this.evenDX = evenDX;
    this.evenDY = evenDY;
    return this;
  }
  /**
   * Step the x and y coordinates in this direction.
   *
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @return The map position after the step.
   */
  step(x: number, y: number): Map$Position {
    return ((y & 1) !== 0) ? new Map$Position()._Map$Position$int$int((x + this.oddDX) | 0, (y + this.oddDY) | 0) : new Map$Position()._Map$Position$int$int((x + this.evenDX) | 0, (y + this.evenDY) | 0);
  }
  /**
   * Gets this direction rotated by n places.
   *
   * @param n The number of places to rotate
   *     (-#directions &le; n &le; #directions).
   * @return The rotated direction.
   */
  rotate(n: number): Direction {
    return Direction.values()[((this.ordinal() + n + Direction.NUMBER_OF_DIRECTIONS) | 0) % Direction.NUMBER_OF_DIRECTIONS];
  }
  /**
   * Get the next direction after this one (clockwise).
   *
   * @return The next {@code Direction}.
   */
  getNextDirection(): Direction {
    return this.rotate(1);
  }
  /**
   * Get the previous direction after this one (anticlockwise).
   *
   * @return The previous {@code Direction}.
   */
  getPreviousDirection(): Direction {
    return this.rotate(-1);
  }
  /**
   * Gets the reverse direction of this one.
   *
   * @return The reverse {@code Direction}.
   */
  getReverseDirection(): Direction {
    return this.rotate($J.idiv(Direction.NUMBER_OF_DIRECTIONS, 2));
  }
  /**
   * Gets the direction with east-west part mirrored.
   *
   * @return The mirrored {@code Direction}.
   */
  getEWMirroredDirection(): Direction {
    switch (this) {
      case Direction.NW:
        return Direction.NE;
      case Direction.W:
        return Direction.E;
      case Direction.SW:
        return Direction.SE;
      case Direction.NE:
        return Direction.NW;
      case Direction.E:
        return Direction.W;
      case Direction.SE:
        return Direction.SW;
      default:
        return this;
    }
  }
  /**
   * Gets a random Direction.
   *
   * @param logMe A string to log with the random results.
   * @param logger A {@code Logger} to log to.
   * @param random A {@code Random} number source.
   * @return A random {@code Direction} value.
   */
  static getRandomDirection(logMe: string, logger: Logger, random: Random): Direction {
    return Direction.values()[RandomUtils.randomInt(logger, logMe, random, Direction.NUMBER_OF_DIRECTIONS)];
  }
  /**
   * Creates an array of the eight directions in a random order.
   *
   * @param logMe A string to log with the random results.
   * @param logger A {@code Logger} to log to.
   * @param random A {@code Random} number source.
   * @return An array of the {@code Direction}s in a random order.
   */
  static getRandomDirections(logMe: string, logger: Logger, random: Random): Direction[] {
    let directions = new ArrayList(Direction.allDirections);
    RandomUtils.randomShuffle(logger, logMe, directions, random);
    return $J.toArrayInto(directions.toArray(), $J.newArray(0, null));
  }
  /**
   * Creates an array of the directions in an order that favours
   * a supplied one.  Entry 0 will be the supplied direction,
   * entry 1+2 will be those immediately to the left and right
   * of it (chosen randomly), and so on until the last entry
   * will be the complete reverse of the supplied direction.
   *
   * Useful if we want to travel in a particular direction, but
   * if this fails to be able to try the closest other
   * directions to the original one in order.
   *
   * @param logMe A string to log with the random results.
   * @param logger A {@code Logger} to log to.
   * @param random A {@code Random} number source.
   * @return An array of the {@code Direction}s favouring this one.
   */
  getClosestDirections(logMe: string, logger: Logger, random: Random): Direction[] {
    let nbits = $J.idiv(((Direction.NUMBER_OF_DIRECTIONS - 2) | 0), 2);
    let r = RandomUtils.randomInt(logger, logMe, random, 1 << nbits);
    let ret = $J.newArray(Direction.NUMBER_OF_DIRECTIONS, null);
    ret[0] = this;
    let step = 1;
    let mask = 1;
    for (let i = 1; i < ((Direction.NUMBER_OF_DIRECTIONS - 1) | 0); i = (i + 2) | 0) {
      let dr = this.rotate(step);
      let dl = this.rotate((Direction.NUMBER_OF_DIRECTIONS - step) | 0);
      ret[i] = ((r & mask) === 0) ? dr : dl;
      (ret[(i + 1) | 0]) = ((r & mask) === 0) ? dl : dr;
      step = (step + 1) | 0;
      mask = Math.imul(mask, 2);
    }
    (ret[(Direction.NUMBER_OF_DIRECTIONS - 1) | 0]) = this.getReverseDirection();
    return ret;
  }
  /**
   * Convert an angle (radians) to a direction.
   *
   * @param angle The angle to convert.
   * @return An equivalent {@code Direction}.
   */
  static angleToDirection(angle: number): Direction {
    return Direction.values()[$J.d2i(Math.floor(angle / (3.141592653589793 / 4)))];
  }
  /**
   * Get a message key for this direction.
   *
   * @return A suitable message key.
   */
  getKey(): string {
    return 'direction.' + $J.str(this);
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return Messages.nameKey$String('model.' + this.getKey());
  }
  static values(): Direction[] { return Direction.$VALUES.slice(); }
  static valueOf(name: string): Direction { return $J.enumValueOf(Direction, name); }
  static $clinit() {
    Direction.N = new Direction()._Direction('N', 0, 0, -2, 0, -2);
    Direction.NE = new Direction()._Direction('NE', 1, 1, -1, 0, -1);
    Direction.E = new Direction()._Direction('E', 2, 1, 0, 1, 0);
    Direction.SE = new Direction()._Direction('SE', 3, 1, 1, 0, 1);
    Direction.S = new Direction()._Direction('S', 4, 0, 2, 0, 2);
    Direction.SW = new Direction()._Direction('SW', 5, 0, 1, -1, 1);
    Direction.W = new Direction()._Direction('W', 6, -1, 0, -1, 0);
    Direction.NW = new Direction()._Direction('NW', 7, 0, -1, -1, -1);
    Direction.$VALUES = [Direction.N, Direction.NE, Direction.E, Direction.SE, Direction.S, Direction.SW, Direction.W, Direction.NW];
    Direction.NUMBER_OF_DIRECTIONS = Direction.values().length;
    Direction.allDirections = CollectionUtils.makeUnmodifiableList([Direction.N, Direction.NE, Direction.E, Direction.SE, Direction.S, Direction.SW, Direction.W, Direction.NW]);
    Direction.longSides = CollectionUtils.makeUnmodifiableList([Direction.NE, Direction.SE, Direction.SW, Direction.NW]);
    Direction.corners = CollectionUtils.makeUnmodifiableList([Direction.N, Direction.E, Direction.S, Direction.W]);
  }
}

$J.define(Direction, 'net.sf.freecol.common.model.Direction', { kind: 'enum', ifaces: ['net.sf.freecol.common.model.Named'], sup: 'java.lang.Enum', ctors: { 'int,int,int,int': '_Direction' }, returns: { 'getNameKey': 'java.lang.String', 'getKey': 'java.lang.String', 'getEWMirroredDirection': 'net.sf.freecol.common.model.Direction', 'getReverseDirection': 'net.sf.freecol.common.model.Direction', 'getPreviousDirection': 'net.sf.freecol.common.model.Direction', 'getNextDirection': 'net.sf.freecol.common.model.Direction' }, clinit: true, lazy: ['$VALUES', 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'NUMBER_OF_DIRECTIONS', 'allDirections', 'longSides', 'corners'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Map$Position = $J.load('net.sf.freecol.common.model.Map$Position');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
});
