// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/TileBounds.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Point;

/**
 * Bounds of the tiles to be rendered. These bounds are scaled according to the
 * zoom level of the map.
 */
export class TileBounds extends JObject {
  /**
   * The height offset to paint a Unit at (in pixels).
   */
  static readonly UNIT_OFFSET: number = 20;
  /**
   * The height offset to paint a Unit at (in pixels).
   */
  static readonly OTHER_UNITS_OFFSET_X: number = -5;
  /**
   * The height offset to paint a Unit at (in pixels).
   */
  static readonly OTHER_UNITS_OFFSET_Y: number = 1;
  /**
   * The height offset to paint a Unit at (in pixels).
   */
  static readonly OTHER_UNITS_WIDTH: number = 3;
  /**
   * The height offset to paint a Unit at (in pixels).
   */
  static readonly MAX_OTHER_UNITS: number = 10;
  /**
   * Tile width and height, and half values thereof.
   */
  tileHeight: number = 0;
  /**
   * Tile width and height, and half values thereof.
   */
  tileWidth: number = 0;
  /**
   * Tile width and height, and half values thereof.
   */
  halfHeight: number = 0;
  /**
   * Tile width and height, and half values thereof.
   */
  halfWidth: number = 0;
  scaleFactor: number = 0;
  _TileBounds(tileSize: Dimension, scaleFactor: number): this {
    this.tileHeight = tileSize.height_;
    this.tileWidth = tileSize.width_;
    this.halfHeight = $J.idiv(tileSize.height_, 2);
    this.halfWidth = $J.idiv(tileSize.width_, 2);
    this.scaleFactor = scaleFactor;
    return this;
  }
  getWidth(): number {
    return this.tileWidth;
  }
  getHalfWidth(): number {
    return this.halfWidth;
  }
  getHeight(): number {
    return this.tileHeight;
  }
  getHalfHeight(): number {
    return this.halfHeight;
  }
  /**
   * Gets the position where a unitLabel located at tile should be drawn.
   *
   * @param unitLabel The unit label.
   * @param tileP The position of the {@code Tile} on the screen.
   * @return The position where to put the label, null if tileP is null.
   */
  calculateUnitLabelPositionInTile(unitLabel: JLabel, tileP: Point): Point {
    if (tileP == null) {
      return null;
    }
    let labelX = (tileP.x_ + $J.idiv(this.tileWidth, 2) - $J.idiv(unitLabel.getWidth(), 2)) | 0;
    let labelY = (tileP.y_ + $J.idiv(this.tileHeight, 2) - $J.idiv(unitLabel.getHeight(), 2)) | 0;
    return new Point()._Point$int$int(labelX, labelY);
  }
}

$J.define(TileBounds, 'net.sf.freecol.client.gui.mapviewer.TileBounds', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.Dimension,float': '_TileBounds' }, returns: { 'getHalfHeight': 'int', 'getHeight': 'int', 'getHalfWidth': 'int', 'getWidth': 'int' } });
$J.module(() => {
  Point = $J.load('java.awt.Point');
});
