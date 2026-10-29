// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/RoadPainter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Arrays, EnumMap, JObject } from '../../../../../../../jre/index.ts';

let BasicStroke, RenderingHints, GeneralPath, Point2D$Float, ImageLibrary, Direction, CollectionUtils;

/**
 * This class is responsible for drawing the Roads on a tile.
 */
export class RoadPainter extends JObject {
  /**
   * Helper variables for displaying the map.
   */
  tileHeight: number = 0;
  /**
   * Helper variables for displaying the map.
   */
  tileWidth: number = 0;
  /**
   * Helper variables for displaying the map.
   */
  halfHeight: number = 0;
  /**
   * Helper variables for displaying the map.
   */
  halfWidth: number = 0;
  corners: EnumMap<Direction, Point2D$Float> = null;
  prohibitedRoads: EnumMap<Direction, List<Direction>> = null;
  roadStroke: Stroke = null;
  /**
   * Create a new road painter for a given tile size.
   *
   * @param tileSize The tile size as a {@code Dimension}.
   */
  _RoadPainter(tileSize: Dimension): this {
    this.corners = new EnumMap($J.cls(Direction));
    this.prohibitedRoads = new EnumMap($J.cls(Direction));
    this.roadStroke = new BasicStroke()._BasicStroke$float(2);
    this.tileHeight = tileSize.height_;
    this.tileWidth = tileSize.width_;
    this.halfHeight = $J.idiv(this.tileHeight, 2);
    this.halfWidth = $J.idiv(this.tileWidth, 2);
    let dy = $J.idiv(this.tileHeight, 16);
    this.roadStroke = new BasicStroke()._BasicStroke$float(Math.fround(dy / 2));
    this.corners.put(Direction.N, new Point2D$Float()._Point2D$Float$float$float(Math.fround(this.halfWidth), 0));
    this.corners.put(Direction.NE, new Point2D$Float()._Point2D$Float$float$float(Math.fround(0.75 * this.tileWidth), Math.fround(0.25 * this.tileHeight)));
    this.corners.put(Direction.E, new Point2D$Float()._Point2D$Float$float$float(Math.fround(this.tileWidth), Math.fround(this.halfHeight)));
    this.corners.put(Direction.SE, new Point2D$Float()._Point2D$Float$float$float(Math.fround(0.75 * this.tileWidth), Math.fround(0.75 * this.tileHeight)));
    this.corners.put(Direction.S, new Point2D$Float()._Point2D$Float$float$float(Math.fround(this.halfWidth), Math.fround(this.tileHeight)));
    this.corners.put(Direction.SW, new Point2D$Float()._Point2D$Float$float$float(Math.fround(0.25 * this.tileWidth), Math.fround(0.75 * this.tileHeight)));
    this.corners.put(Direction.W, new Point2D$Float()._Point2D$Float$float$float(0, Math.fround(this.halfHeight)));
    this.corners.put(Direction.NW, new Point2D$Float()._Point2D$Float$float$float(Math.fround(0.25 * this.tileWidth), Math.fround(0.25 * this.tileHeight)));
    this.prohibitedRoads.put(Direction.N, Arrays.asList(Direction.NW, Direction.NE));
    this.prohibitedRoads.put(Direction.NE, Arrays.asList(Direction.N, Direction.E));
    this.prohibitedRoads.put(Direction.E, Arrays.asList(Direction.NE, Direction.SE));
    this.prohibitedRoads.put(Direction.SE, Arrays.asList(Direction.E, Direction.S));
    this.prohibitedRoads.put(Direction.S, Arrays.asList(Direction.SE, Direction.SW));
    this.prohibitedRoads.put(Direction.SW, Arrays.asList(Direction.S, Direction.W));
    this.prohibitedRoads.put(Direction.W, Arrays.asList(Direction.SW, Direction.NW));
    this.prohibitedRoads.put(Direction.NW, Arrays.asList(Direction.W, Direction.N));
    return this;
  }
  /**
   * Draws all roads on the given Tile.
   *
   * @param g The {@code Graphics} to draw the road upon.
   * @param tile The {@code Tile} with the road.
   * @param rop An optional RescaleOp for fog of war.
   */
  displayRoad(g: Graphics2D, tile: Tile, rop: RescaleOp): void {
    let oldColor = g.getColor();
    g.setColor(ImageLibrary.getRoadColor());
    g.setStroke(this.roadStroke);
    g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    let map = tile.getMap();
    let x = tile.getX();
    let y = tile.getY();
    let borderPred = (d) => {
      let borderingTile = map.getTile$Position(d.step(x, y));
      let r: TileImprovement;
      return borderingTile != null && (r = borderingTile.getRoad()) != null && r.isComplete();
    };
    let directions = CollectionUtils.transform$Collection$Predicate(Direction.allDirections, borderPred);
    let points = CollectionUtils.transform$Collection$Predicate$Function(directions, CollectionUtils.alwaysTrue(), (d) => this.corners.get(d));
    let path = new GeneralPath()._GeneralPath$();
    {
      let pen: Direction, pt: Point2D;
      switch (points.size()) {
        case 0:
          path.moveTo$float$float(Math.fround(Math.fround(0.35) * this.tileWidth), Math.fround(Math.fround(0.35) * this.tileHeight));
          path.lineTo$float$float(Math.fround(Math.fround(0.65) * this.tileWidth), Math.fround(Math.fround(0.65) * this.tileHeight));
          path.moveTo$float$float(Math.fround(Math.fround(0.35) * this.tileWidth), Math.fround(Math.fround(0.65) * this.tileHeight));
          path.lineTo$float$float(Math.fround(Math.fround(0.65) * this.tileWidth), Math.fround(Math.fround(0.35) * this.tileHeight));
          break;
        case 1:
          path.moveTo$float$float(Math.fround(this.halfWidth), Math.fround(this.halfHeight));
          path.lineTo$double$double(points.get(0).getX(), points.get(0).getY());
          break;
        case 2:
          path.moveTo$double$double(points.get(0).getX(), points.get(0).getY());
          path.quadTo$double$double$double$double(this.halfWidth, this.halfHeight, points.get(1).getX(), points.get(1).getY());
          break;
        case 3:
        case 4:
          pen = directions.get((directions.size() - 1) | 0);
          pt = this.corners.get(pen);
          path.moveTo$double$double(pt.getX(), pt.getY());
          for (const $it0 = directions.iterator(); $it0.hasNext(); ) {
            let d = $it0.next();
            pt = this.corners.get(d);
            if (this.prohibitedRoads.get(pen).contains(d)) {
              path.moveTo$double$double(pt.getX(), pt.getY());
            } else {
              path.quadTo$double$double$double$double(this.halfWidth, this.halfHeight, pt.getX(), pt.getY());
            }
            pen = d;
          }
          break;
        default:
          for (const $it1 = points.iterator(); $it1.hasNext(); ) {
            let p = $it1.next();
            path.moveTo$float$float(Math.fround(this.halfWidth), Math.fround(this.halfHeight));
            path.lineTo$double$double(p.getX(), p.getY());
          }
          break;
      }
    }
    g.draw(path);
    g.setColor(oldColor);
    g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_OFF);
  }
}

$J.define(RoadPainter, 'net.sf.freecol.client.gui.mapviewer.RoadPainter', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.Dimension': '_RoadPainter' } });
$J.module(() => {
  BasicStroke = $J.load('java.awt.BasicStroke');
  RenderingHints = $J.load('java.awt.RenderingHints');
  GeneralPath = $J.load('java.awt.geom.GeneralPath');
  Point2D$Float = $J.load('java.awt.geom.Point2D$Float');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
