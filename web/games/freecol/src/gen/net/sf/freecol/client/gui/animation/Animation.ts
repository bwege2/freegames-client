// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/animation/Animation.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

/**
 * The base class for the animations.
 *
 * Note: we used to focus the map on the unit even when animation is
 * off as long as the center-active-unit option was set.  However
 * IR#115 requested that if animation is off that we display nothing
 * so as to speed up the other player moves as much as possible.
 */
export class Animation extends JObject {
  /**
   * The unit to animate.
   */
  unit: Unit = null;
  /**
   * The tiles where the animation occurs.
   */
  tiles: List<Tile> = null;
  /**
   * Positions for the unit label during the animation.
   */
  points: List<Point> = null;
  /**
   * Make a new animation.
   *
   * @param unit The {@code Unit} to be animated.
   * @param tiles A list of {@code Tile}s where the animation occurs.
   */
  _Animation(unit: Unit, tiles: List<Tile>): this {
    this.unit = unit;
    this.tiles = tiles;
    this.points = null;
    return this;
  }
  /**
   * Get the unit to animate.
   *
   * @return The {@code Unit}.
   */
  getUnit(): Unit {
    return this.unit;
  }
  /**
   * Get the tiles where the animation occurs.
   *
   * @return A list of {@code Tile}s.
   */
  getTiles(): List<Tile> {
    return this.tiles;
  }
  /**
   * Set the points for each tile.
   *
   * @param points A list of {@code Point}s to position the animation label.
   */
  setPoints(points: List<Point>): void {
    this.points = points;
  }
}

$J.define(Animation, 'net.sf.freecol.client.gui.animation.Animation', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Unit,java.util.List': '_Animation' }, returns: { 'getTiles': 'java.util.List', 'getUnit': 'net.sf.freecol.common.model.Unit' } });
