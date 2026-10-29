// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/MapViewerBounds.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Dimension, Point, Rectangle, TileBounds, Direction, Map$Position;

/**
 * Calculates what part of the {@link Map} is visible on screen. This includes handling
 * the size, scaling and focus of the map.
 *
 * The map projection has some interesting properties.  Here is the top
 * left corner of the map (truncated, aspect ratio very wrong) containing
 * x,y "map" coordinates.
 *
 *  /\  /\  /\    
 * /0 \/1 \/2 \   
 * \ 0/\ 0/\ 0/  
 *  \/0 \/1 \/    
 *  /\ 1/\ 1/\  
 * /0 \/1 \/2 \ 
 * \ 2/\ 2/\ 2/ 
 *  \/0 \/1 \/   
 *  /\ 3/\ 3/   
 * /0 \/1 \/     
 * \ 4/\ 4/
 *  \/  \/ 
 *
 * We distinguish ordinary "map" coordinates from the pixel
 * coordinates in the frame, which we will denote P(x,y).
 *
 * Pixel coordinates are measureed from the top left corner of the
 * frame to minimal extent of the rectangle containing the tile
 * (note: not actually inside the tile graphic).
 *
 * Let a general tile with map coordinates (x,y) have pixel coordinates
 * P(px,py)
 * Let tiles have width tw and height th.
 *
 * - Property #1:  Tile (x,0) borders the top of the window at P(?,0)
 * - Property #2:  Tile (x,1) is inset by one half tile height at P(?,th/2)
 * - Property #3:  Tile (0,y) borders the left of the window if y is even,
 *   and is thus at P(0,?), otherwise it is inset one half tile width
 *   at P(tw/2,?)
 * - Property #4:  Within a horizontal row, the tile directly to the 
 *   right of T0 is tile (x+1,y) at P(px+tw,py)
 * - Property #5:  Within a vertical column, the tile directly below
 *   tile T0 is tile (x,y+2) at P(px,py+th)
 */
export class MapViewerBounds extends JObject {
  /**
   * The size of the displayed {@link MapViewer}.
   */
  size_: Dimension = null;
  /**
   * The current focus Tile as determined by the {@link #mapFocusPoint}.
   */
  focus: Tile = null;
  /**
   * The current speed when scrolling. This speed can increase when
   * scrolling.
   */
  scrollSpeed: number = 0;
  /**
   * The current focus of the visible map given in pixels.
   *
   * The maximum width of the map in pixels is:
   * <code>map.getWidth() * tileBounds.getWidth()</code>.
   */
  mapFocusPoint: Point = null;
  /**
   * The topmost and leftmost tile that is displayed in the MapViewer.
   */
  topLeftVisibleTile: Map$Position = null;
  /**
   * The position of the top-left corner of {@link topLeftVisibleTile} when
   * rendering.
   */
  topLeftVisibleTilePoint: Point = null;
  /**
   * The bottommost and rightmost tile that is displayed in the MapViewer.
   */
  bottomRightVisibleTile: Map$Position = null;
  /**
   * Scaled sizes of a tile. This is used when calculating other variables.
   */
  tileBounds: TileBounds = null;
  _MapViewerBounds(): this {
    this.size_ = null;
    this.focus = null;
    this.scrollSpeed = 1;
    this.mapFocusPoint = null;
    this.topLeftVisibleTile = new Map$Position()._Map$Position$int$int(-1, -1);
    this.topLeftVisibleTilePoint = new Point()._Point$int$int(0, 0);
    this.bottomRightVisibleTile = new Map$Position()._Map$Position$int$int(-1, -1);
    this.size_ = new Dimension()._Dimension$int$int(0, 0);
    this.tileBounds = new TileBounds()._TileBounds(new Dimension()._Dimension$int$int(0, 0), 1);
    return this;
  }
  /**
   * Update the variables that depend on the screen size (and scale).
   *
   * @param tileBounds The new scaled tile sizes.
   */
  updateSizeVariables(tileBounds: TileBounds): void {
    let oldTileBounds = this.tileBounds;
    this.tileBounds = tileBounds;
    if (oldTileBounds != null && this.mapFocusPoint != null) {
      this.mapFocusPoint = new Point()._Point$int$int($J.idiv((Math.imul(this.mapFocusPoint.x_, tileBounds.getWidth())), oldTileBounds.getWidth()), $J.idiv((Math.imul(this.mapFocusPoint.y_, tileBounds.getHalfHeight())), oldTileBounds.getHalfHeight()));
    }
    this.positionMap();
  }
  /**
   * Sets the focus of the map but offset to the left or right so
   * that the focus position can still be visible when a popup is
   * raised.  If successful, the supplied position will either be at
   * the center of the left or right half of the map.
   *
   * WARNING: This method changes the focus. You need to call
   *          {@code repaint()}
   *
   * @param tile The {@code Tile} to display.
   * @return Positive if the focus is on the right hand side, negative
   *     if on the left, zero on failure.
   */
  setOffsetFocus(tile: Tile): number {
    if (tile == null) {
      return 0;
    }
    this.setFocus(tile);
    this.positionMap();
    let ret = 0;
    let moveX = -1;
    let map = tile.getMap();
    let tx = tile.getX();
    let ty = tile.getY();
    let width = (this.bottomRightVisibleTile.getX() - this.topLeftVisibleTile.getX()) | 0;
    if (this.topLeftVisibleTile.getX() <= 0) {
      if (tx <= $J.idiv(width, 4)) {
        ret = -1;
      } else if (tx >= $J.idiv(Math.imul(3, width), 4)) {
        ret = 1;
      } else {
        moveX = (tx + $J.idiv(width, 4)) | 0;
        ret = -1;
      }
    } else if (this.bottomRightVisibleTile.getX() >= ((width - 1) | 0)) {
      if (tx >= ((this.bottomRightVisibleTile.getX() - $J.idiv(width, 4)) | 0)) {
        ret = 1;
      } else if (tx <= ((this.bottomRightVisibleTile.getX() - $J.idiv(Math.imul(3, width), 4)) | 0)) {
        ret = -1;
      } else {
        moveX = (tx - $J.idiv(width, 4)) | 0;
        ret = 1;
      }
    } else {
      moveX = (tx - $J.idiv(width, 4)) | 0;
      ret = 1;
    }
    if (moveX >= 0) {
      let other = map.getTile$int$int(moveX, ty);
      this.setFocus(other);
    } else {
      this.setFocus(tile);
    }
    return ret;
  }
  /**
   * Scroll the map in the given direction.
   *
   * WARNING: This method changes the focus. You need to call
   *          {@code repaint()}
   *
   * @param direction The {@code Direction} to scroll in.
   * @return True if scrolling occurred.
   */
  scrollMap(direction: Direction): boolean {
    let t = this.getFocus();
    if (t == null) {
      this.scrollSpeed = 1;
      return false;
    }
    let fx = t.getX();
    let fy = t.getY();
    if ((t = t.getNeighbourOrNull(direction)) == null) {
      this.scrollSpeed = 1;
      return false;
    }
    if (Direction.longSides.contains(direction)) {
      let extraScrollTile = t.getNeighbourOrNull(direction);
      if (extraScrollTile != null) {
        t = extraScrollTile;
      }
    }
    let tx = t.getX();
    let ty = t.getY();
    let scrollX = this.mapFocusPoint.x_;
    let scrollY = this.mapFocusPoint.y_;
    this.scrollSpeed = (this.scrollSpeed + 1) | 0;
    if (tx > fx) {
      scrollX = (scrollX + (1 + this.scrollSpeed)) | 0;
      if (ty > fy) {
        scrollY = (scrollY + (1 + this.scrollSpeed)) | 0;
      } else if (ty < fy) {
        scrollY = (scrollY - (1 + this.scrollSpeed)) | 0;
      }
    } else if (tx < fx) {
      scrollX = (scrollX - (1 + this.scrollSpeed)) | 0;
      if (ty > fy) {
        scrollY = (scrollY + (1 + this.scrollSpeed)) | 0;
      } else if (ty < fy) {
        scrollY = (scrollY - (1 + this.scrollSpeed)) | 0;
      }
    } else if (ty > fy) {
      scrollY = (scrollY + (1 + this.scrollSpeed)) | 0;
    } else if (ty < fy) {
      scrollY = (scrollY - (1 + this.scrollSpeed)) | 0;
    } else {
      this.scrollSpeed = 1;
      return false;
    }
    this.setFocusMapPoint(new Point()._Point$int$int(scrollX, scrollY));
    return true;
  }
  /**
   * Checks if a tile is displayed on the screen but not too close
   * to the edges.
   *
   * FIXME: The intent appears to be to have a two tile thick boundary?
   *
   * @param tile The {@code Tile} to check.
   * @return True if the tile is roughly on screen.
   */
  onScreen(tile: Tile): boolean {
    return (((tile.getX() - 1) | 0) > this.topLeftVisibleTile.getX()) && (((tile.getX() + 2) | 0) < this.bottomRightVisibleTile.getX()) && (((tile.getY() - 2) | 0) > this.topLeftVisibleTile.getY()) && (((tile.getY() + 3) | 0) < this.bottomRightVisibleTile.getY());
  }
  /**
   * Gets the position of the given {@code Tile} on the visible map.
   *
   * @param tile The {@code Tile} to check.
   * @param rhs If true, find the right edge of the tile, otherwise
   *     the left edge.
   * @return The position of the given {@code Tile}, or {@code null}
   *     if the {@code Tile} is not visible.
   */
  calculateTilePosition(tile: Tile, rhs: boolean): Point {
    if (!this.isTileVisible(tile)) {
      return null;
    }
    let p = this.tileToPoint(tile);
    if (!rhs) {
      return p;
    }
    return new Point()._Point$int$int((p.x_ + this.tileBounds.getWidth()) | 0, p.y_);
  }
  /**
   * Gets the center position of the given {@code Tile} on the visible map.
   *
   * @param tile The {@code Tile} to check.
   * @return The centerposition of the given {@code Tile}.
   */
  calculateCenterTilePosition(tile: Tile): Point {
    if (!this.isTileVisible(tile)) {
      return null;
    }
    let p = this.tileToPoint(tile);
    return new Point()._Point$int$int((p.x_ + this.tileBounds.getHalfWidth()) | 0, (p.y_ + this.tileBounds.getHalfHeight()) | 0);
  }
  /**
   * Sets the focus tile.
   *
   * WARNING: This method changes the focus. You need to call
   *          {@code repaint()}
   *
   * @param focus The new focus {@code Tile}.
   * @return {@code true} if the focus has changed, and
   *      {@code false} otherwise.
   */
  setFocus(focus: Tile): boolean {
    if (focus == null || this.focus === focus) {
      return false;
    }
    this.focus = focus;
    this.setFocusMapPoint(new Point()._Point$int$int((this.tileBounds.getHalfWidth() + Math.imul(focus.getX(), this.tileBounds.getWidth()) + Math.imul((focus.getY() & 1), this.tileBounds.getHalfWidth())) | 0, (this.tileBounds.getHalfHeight() + Math.imul(focus.getY(), this.tileBounds.getHalfHeight())) | 0));
    return true;
  }
  /**
   * The current focus of the visible map given in pixels.
   *
   * The maximum width of the map in pixels is:
   * <code>map.getWidth() * tileBounds.getWidth()</code>.
   *
   * @param mapFocusPoint The new focus point.
   * @return {@code true} if the focus was updated.
   */
  setFocusMapPoint(mapFocusPoint: Point): boolean {
    if (this.focus == null) {
      return false;
    }
    let map = this.focus.getMap();
    let mapFocusPointX = MapViewerBounds.inRange(this.tileBounds.getHalfWidth(), mapFocusPoint.x_, Math.imul(map.getWidth(), this.tileBounds.getWidth()));
    let mapFocusPointY = MapViewerBounds.inRange(this.tileBounds.getHalfHeight(), mapFocusPoint.y_, (Math.imul(map.getHeight(), this.tileBounds.getHalfHeight()) - this.tileBounds.getHalfHeight()) | 0);
    this.mapFocusPoint = new Point()._Point$int$int(mapFocusPointX, mapFocusPointY);
    let tileX = $J.idiv(((mapFocusPoint.x_ - this.tileBounds.getHalfWidth()) | 0), this.tileBounds.getWidth());
    let tileY = $J.idiv(((mapFocusPoint.y_ - this.tileBounds.getHalfHeight()) | 0), this.tileBounds.getHalfHeight());
    this.focus = map.getTile$int$int(MapViewerBounds.inRange(0, tileX, (map.getWidth() - 1) | 0), MapViewerBounds.inRange(0, tileY, (map.getHeight() - 1) | 0));
    this.positionMap();
    return true;
  }
  /**
   * Gets the current focus of the visible map given in pixels.
   *
   * @return The current focus map point that is between {@code 0}
   *   and <code>map.getWidth() * tileBounds.getWidth()</code>.
   */
  getFocusMapPoint(): Point {
    return this.mapFocusPoint;
  }
  static inRange(min: number, value: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
  /**
   * Position the map so that the focus is displayed at the center.
   */
  positionMap(): void {
    if (this.focus == null) {
      return;
    }
    let focusTileX = $J.idiv(((this.mapFocusPoint.x_ - this.tileBounds.getHalfWidth()) | 0), this.tileBounds.getWidth());
    let focusTileY = $J.idiv(((this.mapFocusPoint.y_ - this.tileBounds.getHalfHeight()) | 0), this.tileBounds.getHalfHeight());
    let extraSpaceFocusTileX = ((this.mapFocusPoint.x_ - this.tileBounds.getHalfWidth()) | 0) % this.tileBounds.getWidth();
    let extraSpaceFocusTileY = ((this.mapFocusPoint.y_ - this.tileBounds.getHalfHeight()) | 0) % this.tileBounds.getHalfHeight();
    let topFullTiles = $J.idiv((($J.idiv(this.size_.height_, 2) - extraSpaceFocusTileY) | 0), this.tileBounds.getHalfHeight());
    let extraSpaceY = (($J.idiv(this.size_.height_, 2) - extraSpaceFocusTileY) | 0) % this.tileBounds.getHalfHeight();
    let topTiles = (topFullTiles + (extraSpaceY > 0 ? 1 : 0)) | 0;
    let topLeftTileY = (focusTileY - topTiles) | 0;
    let leftFullTiles = $J.idiv((($J.idiv(this.size_.width_, 2) - extraSpaceFocusTileX) | 0), this.tileBounds.getWidth());
    let extraSpaceX = (($J.idiv(this.size_.width_, 2) - extraSpaceFocusTileX) | 0) % this.tileBounds.getWidth();
    let leftTiles = (leftFullTiles + (extraSpaceX > 0 ? 1 : 0)) | 0;
    this.topLeftVisibleTile = new Map$Position()._Map$Position$int$int((focusTileX - leftTiles) | 0, topLeftTileY);
    this.topLeftVisibleTilePoint = new Point()._Point$int$int((((extraSpaceX === 0) ? 0 : -((this.tileBounds.getWidth() - extraSpaceX) | 0)) - this.tileBounds.getHalfWidth()) | 0, (((extraSpaceY === 0) ? 0 : -((this.tileBounds.getHalfHeight() - extraSpaceY) | 0)) - this.tileBounds.getHalfHeight()) | 0);
    let visibleTilesX = ($J.idiv(((this.size_.width_ - this.topLeftVisibleTilePoint.x_) | 0), this.tileBounds.getWidth()) + (((((this.size_.width_ - this.topLeftVisibleTilePoint.x_) | 0) % this.tileBounds.getWidth()) > 0) ? 1 : 0)) | 0;
    let visibleTilesY = ($J.idiv(((this.size_.height_ - this.topLeftVisibleTilePoint.y_) | 0), this.tileBounds.getHalfHeight()) + (((((this.size_.height_ - this.topLeftVisibleTilePoint.y_) | 0) % this.tileBounds.getHalfHeight()) > 0) ? 1 : 0)) | 0;
    this.bottomRightVisibleTile = new Map$Position()._Map$Position$int$int((this.topLeftVisibleTile.x_ + visibleTilesX - 1) | 0, (this.topLeftVisibleTile.y_ + visibleTilesY - 1) | 0);
  }
  /**
   * Convert tile coordinates to pixel coordinates.
   *
   * Beware:  Only safe to call if the tile is known non-null and
   * currently visible.
   *
   * @param tile The {@code Tile} to convert coordinates.
   * @return The new {@code Point}.
   */
  tileToPoint(tile: Tile): Point {
    let tileX = tile.getX();
    let tileY = tile.getY();
    let x = (this.topLeftVisibleTilePoint.x_ + Math.imul(this.tileBounds.getWidth(), ((tileX - this.topLeftVisibleTile.getX()) | 0)) + Math.imul((tileY & 1), this.tileBounds.getHalfWidth())) | 0;
    let y = (this.topLeftVisibleTilePoint.y_ + Math.imul(this.tileBounds.getHalfHeight(), ((tileY - this.topLeftVisibleTile.getY()) | 0))) | 0;
    return new Point()._Point$int$int(x, y);
  }
  /**
   * Calculate the bounds of the rectangle containing a Tile on the
   * screen.
   *
   * If the Tile is not on-screen an empty rectangle is returned.
   * The bounds includes a one-tile padding area above the Tile and
   * half a tile padding to each side. There is currently no padding
   * below the tile. Feel free to add more padding if we start using
   * larger images.
   *
   * @param tile The {@code Tile} on the screen.
   * @return The bounds {@code Rectangle}.
   */
  calculateDrawnTileBounds(tile: Tile): Rectangle {
    if (!this.isTileVisible(tile)) {
      return new Rectangle()._Rectangle$int$int$int$int(0, 0, 0, 0);
    }
    let p = this.tileToPoint(tile);
    return new Rectangle()._Rectangle$int$int$int$int((p.x_ - this.tileBounds.getHalfWidth()) | 0, (p.y_ - this.tileBounds.getHeight()) | 0, Math.imul(this.tileBounds.getWidth(), 2), Math.imul(this.tileBounds.getHeight(), 2));
  }
  getTopLeftVisibleTile(): Map$Position {
    return this.topLeftVisibleTile;
  }
  getTopLeftVisibleTilePoint(): Point {
    return this.topLeftVisibleTilePoint;
  }
  getBottomRightVisibleTile(): Map$Position {
    return this.bottomRightVisibleTile;
  }
  getSize(): Dimension {
    return this.size_;
  }
  /**
   * Gets the focus tile, that is, the center tile of the displayed map.
   *
   * @return The center {@code Tile}.
   */
  getFocus(): Tile {
    return this.focus;
  }
  /**
   * Converts the given screen coordinates to Map coordinates.
   * It checks to see to which Tile the given pixel 'belongs'.
   *
   * @param map The {@code Map} to convert within.
   * @param x The x-coordinate in pixels.
   * @param y The y-coordinate in pixels.
   * @return The {@code Tile} that is located at the given position
   *     on the screen.
   */
  convertToMapTile(map: Map_, x: number, y: number): Tile {
    if (map == null || this.focus == null) {
      return null;
    }
    let p = this.tileToPoint(this.focus);
    let leftOffset = (p.x_ + this.tileBounds.getHalfWidth()) | 0;
    let topOffset = (p.y_ + this.tileBounds.getHalfHeight()) | 0;
    let fx = this.focus.getX();
    let fy = this.focus.getY();
    let dcol = $J.idiv(((x - leftOffset + (x > leftOffset ? this.tileBounds.getHalfWidth() : -this.tileBounds.getHalfWidth())) | 0), this.tileBounds.getWidth());
    let drow = $J.idiv(((y - topOffset + (y > topOffset ? this.tileBounds.getHalfHeight() : -this.tileBounds.getHalfHeight())) | 0), this.tileBounds.getHeight());
    let px = (leftOffset + Math.imul(dcol, this.tileBounds.getWidth())) | 0;
    let py = (topOffset + Math.imul(drow, this.tileBounds.getHeight())) | 0;
    let newCol = (fx + dcol) | 0;
    let newRow = (fy + Math.imul(drow, 2)) | 0;
    let direction = null;
    if (x > px) {
      if (y > py) {
        if (((y - py) | 0) > ((this.tileBounds.getHalfHeight() - $J.idiv(((x - px) | 0), 2)) | 0)) {
          direction = Direction.SE;
        }
      } else {
        if (((y - py) | 0) < (($J.idiv(((x - px) | 0), 2) - this.tileBounds.getHalfHeight()) | 0)) {
          direction = Direction.NE;
        }
      }
    } else {
      if (y > py) {
        if (((y - py) | 0) > (($J.idiv(((x - px) | 0), 2) + this.tileBounds.getHalfHeight()) | 0)) {
          direction = Direction.SW;
        }
      } else {
        if (((y - py) | 0) < (($J.idiv(((px - x) | 0), 2) - this.tileBounds.getHalfHeight()) | 0)) {
          direction = Direction.NW;
        }
      }
    }
    let col = newCol;
    let row = newRow;
    if (direction != null) {
      let step = direction.step(newCol, newRow);
      col = step.x_;
      row = step.y_;
    }
    return map.getTile$int$int(col, row);
  }
  changeSize(size: Dimension, tileBounds: TileBounds): void {
    this.size_ = size;
    this.updateSizeVariables(tileBounds);
  }
  /**
   * Strict check for tile visibility (unlike onScreen).
   *
   * @param tile The {@code Tile} to check.
   * @return True if the tile is visible.
   */
  isTileVisible(tile: Tile): boolean {
    if (tile == null) {
      return false;
    }
    return tile.getX() >= this.topLeftVisibleTile.getX() && tile.getX() <= this.bottomRightVisibleTile.getX() && tile.getY() >= this.topLeftVisibleTile.getY() && tile.getY() <= this.bottomRightVisibleTile.getY();
  }
  getTileBounds(): TileBounds {
    return this.tileBounds;
  }
  resetScrollSpeed(): void {
    this.scrollSpeed = 1;
  }
}

$J.define(MapViewerBounds, 'net.sf.freecol.client.gui.mapviewer.MapViewerBounds', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MapViewerBounds' }, returns: { 'getTileBounds': 'net.sf.freecol.client.gui.mapviewer.TileBounds', 'getFocus': 'net.sf.freecol.common.model.Tile', 'getSize': 'java.awt.Dimension', 'getBottomRightVisibleTile': 'net.sf.freecol.common.model.Map$Position', 'getTopLeftVisibleTilePoint': 'java.awt.Point', 'getTopLeftVisibleTile': 'net.sf.freecol.common.model.Map$Position', 'getFocusMapPoint': 'java.awt.Point' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  TileBounds = $J.load('net.sf.freecol.client.gui.mapviewer.TileBounds');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  Map$Position = $J.load('net.sf.freecol.common.model.Map$Position');
});
