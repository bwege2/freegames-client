// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/LandMap.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Logger } from '../../../../../../jre/index.ts';

let Direction, Map_, Map$Position, MapGeneratorOptions, CollectionUtils;

/**
 * A class to encapsulate a binary land map.
 */
export class LandMap extends JObject {
  static logger: Logger = null;
  /**
   * The map width.
   */
  width_: number = 0;
  /**
   * The map height.
   */
  height_: number = 0;
  /**
   * A cached random integer source.
   */
  cache: RandomUtils$RandomIntCache = null;
  /**
   * The land map.  True means land.
   */
  map_: boolean[][] = null;
  /**
   * Number of land tiles on the map.
   */
  numberOfLandTiles: number = 0;
  /**
   * Create a new land map with specified dimensions.
   *
   * @param width The map width.
   * @param height The map height.
   * @param cache A pseudo random number source.
   */
  _LandMap$int$int$RandomIntCache(width: number, height: number, cache: RandomUtils$RandomIntCache): this {
    this.width_ = width;
    this.height_ = height;
    this.cache = cache;
    this.map_ = $J.newArrayN([this.width_, this.height_], false);
    this.numberOfLandTiles = 0;
    return this;
  }
  /**
   * Create a land map by importing it from a given map.
   *
   * @param map The {@code Map} to get the land map from.
   * @param cache A pseudo random number source.
   */
  _LandMap$Map$RandomIntCache(map: Map_, cache: RandomUtils$RandomIntCache): this {
    this._LandMap$int$int$RandomIntCache(map.getWidth(), map.getHeight(), cache);
    for (let y = 0; y < this.height_; y++) {
      for (let x = 0; x < this.width_; x++) {
        this.map_[x][y] = (map.isValid$int$int(x, y)) ? map.getTile$int$int(x, y).isLand() : false;
        if (this.map_[x][y]) {
          this.numberOfLandTiles++;
        }
      }
    }
    return this;
  }
  /**
   * Create a new land map using parameters from a supplied map
   * generator options option group.
   *
   * @param mgo The map generator {@code OptionGroup} to use.
   * @param cache A pseudo random number source.
   */
  _LandMap$OptionGroup$RandomIntCache(mgo: OptionGroup, cache: RandomUtils$RandomIntCache): this {
    this._LandMap$int$int$RandomIntCache(mgo.getInteger(MapGeneratorOptions.MAP_WIDTH), mgo.getInteger(MapGeneratorOptions.MAP_HEIGHT), cache);
    let distanceToEdge = mgo.getInteger(MapGeneratorOptions.PREFERRED_DISTANCE_TO_EDGE);
    let minNumberOfTiles = $J.idiv(Math.imul(Math.imul(mgo.getInteger(MapGeneratorOptions.LAND_MASS), this.getWidth()), this.getHeight()), 100);
    let gen = mgo.getSelection(MapGeneratorOptions.LAND_GENERATOR_TYPE);
    LandMap.logger.info('Using land generator ' + mgo.getSelectionName(MapGeneratorOptions.LAND_GENERATOR_TYPE) + ' to make ' + this.width_ + 'x' + this.height_ + ' map with distance-to-edge=' + distanceToEdge + ' and min-tile#=' + minNumberOfTiles);
    this.generate(gen, distanceToEdge, minNumberOfTiles);
    return this;
  }
  /**
   * Get the width of the land map.
   *
   * @return The map width.
   */
  getWidth(): number {
    return this.width_;
  }
  /**
   * Get the height of the land map.
   *
   * @return The map height.
   */
  getHeight(): number {
    return this.height_;
  }
  /**
   * Is an xy coordinate valid on this map?
   *
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @return True if there coordinate is valid.
   */
  isValid(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.getWidth() && y < this.getHeight();
  }
  /**
   * Is there land on this map at a given xy coordinate?
   *
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @return True if there is land present.
   */
  isLand(x: number, y: number): boolean {
    return (this.isValid(x, y)) ? this.map_[x][y] : false;
  }
  /**
   * Is there any land in this land map?
   *
   * @return True if any land is present.
   */
  hasLand(): boolean {
    for (let y = 0; y < this.height_; y++) {
      for (let x = 0; x < this.width_; x++) {
        if (this.map_[x][y]) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Set a map position to land, and increase the land tile count.
   *
   * @param x The x coordinate of the new land.
   * @param y The y coordinate of the new land.
   * @return True if the land tile was set.
   */
  setLand$int$int$LandMap(x: number, y: number): boolean {
    if (this.isLand(x, y)) {
      return false;
    }
    this.map_[x][y] = true;
    this.numberOfLandTiles++;
    return true;
  }
  /**
   * Sets a given map position to land and grow outward.
   *
   * Calls #growLand(int,int) for all valid adjacent map positions,
   * which may recursively call setLand for these.
   *
   * @param x The x coordinate of the new land.
   * @param y The y coordinate of the new land.
   * @param distanceToEdge The preferred distance to the map edge.
   */
  setLand$int$int$int$LandMap(x: number, y: number, distanceToEdge: number): void {
    if (!this.setLand$int$int$LandMap(x, y)) {
      return;
    }
    let p = new Map$Position()._Map$Position$int$int(x, y);
    for (const $it0 = Direction.longSides.iterator(); $it0.hasNext(); ) {
      let direction = $it0.next();
      let n = new Map$Position()._Map$Position$Position$Direction(p, direction);
      if (n.isValid(this.getWidth(), this.getHeight())) {
        this.growLand(n.getX(), n.getY(), distanceToEdge);
      }
    }
  }
  /**
   * Generate the land map using the given generator type.
   *
   * @param type The generator type.
   * @param minNumberOfTiles The minimum land tiles to generate.
   * @param distanceToEdge The preferred distance to the map edge.
   */
  generate(type$: number, distanceToEdge: number, minNumberOfTiles: number): void {
    {
      let contsize: number, height: number, archsize: number;
      switch (type$) {
        case MapGeneratorOptions.LAND_GENERATOR_CLASSIC:
          this.createClassicLandMap(distanceToEdge, minNumberOfTiles);
          break;
        case MapGeneratorOptions.LAND_GENERATOR_CONTINENT:
          this.addPolarRegions();
          contsize = $J.idiv((Math.imul(minNumberOfTiles, 75)), 100);
          height = ($J.idiv(this.getHeight(), 4) + this.cache.nextInt$int($J.idiv(this.getHeight(), 2))) | 0;
          this.addLandMass(contsize, contsize, $J.idiv(this.getWidth(), 2), height, distanceToEdge);
          while (this.numberOfLandTiles < minNumberOfTiles) {
            this.addLandMass(15, 25, -1, -1, distanceToEdge);
          }
          break;
        case MapGeneratorOptions.LAND_GENERATOR_ARCHIPELAGO:
          this.addPolarRegions();
          archsize = $J.idiv((Math.imul(minNumberOfTiles, 10)), 100);
          for (let i = 0; i < 5; i++) {
            this.addLandMass((archsize - 5) | 0, (archsize + 5) | 0, -1, -1, distanceToEdge);
          }
        case MapGeneratorOptions.LAND_GENERATOR_ISLANDS:
          this.addPolarRegions();
          while (this.numberOfLandTiles < minNumberOfTiles) {
            this.addLandMass(25, (25 + this.cache.nextInt$int(50)) | 0, -1, -1, distanceToEdge);
          }
          break;
      }
    }
    this.cleanMap();
  }
  /**
   * Create the standard FreeCol land map.
   *
   * @param distanceToEdge The nominal edge clearance.
   * @param minNumberOfTiles Lower bound for the tiles to create.
   */
  createClassicLandMap(distanceToEdge: number, minNumberOfTiles: number): void {
    let edg = Math.imul(distanceToEdge, 2);
    let wid = (this.getWidth() - Math.imul(edg, 2)) | 0;
    let hgt = (this.getHeight() - Math.imul(edg, 2)) | 0;
    let x: number;
    let y: number;
    while (this.numberOfLandTiles < minNumberOfTiles) {
      let failCounter = 0;
      do {
        x = (edg + this.cache.nextInt$int(wid)) | 0;
        y = (edg + this.cache.nextInt$int(hgt)) | 0;
        failCounter++;
        if (failCounter > 100) {
          failCounter = 0;
          minNumberOfTiles--;
          break;
        }
      } while (this.isLand(x, y));
      this.setLand$int$int$int$LandMap(x, y, distanceToEdge);
    }
    this.addPolarRegions();
  }
  /**
   * Add land to the polar map rows at the top and bottom of the map,
   * with height determined by Map.POLAR_HEIGHT.
   *
   * FIXME: Make POLAR_HEIGHT an option.
   */
  addPolarRegions(): void {
    for (let x = 0; x < this.width_; x++) {
      for (let y = 0; y < Map_.POLAR_HEIGHT; y++) {
        this.setLand$int$int$LandMap(x, y);
      }
      let limit = (this.height_ - 1 - Map_.POLAR_HEIGHT) | 0;
      for (let y = limit; y < this.height_; y++) {
        this.setLand$int$int$LandMap(x, y);
      }
    }
  }
  /**
   * Remove any 1x1 islands on the map.
   */
  cleanMap(): void {
    for (let y = 0; y < this.height_; y++) {
      for (let x = 0; x < this.width_; x++) {
        if (!this.hasAdjacentLand(x, y)) {
          this.map_[x][y] = false;
        }
      }
    }
  }
  /**
   * Do the given coordinates correspond to a location in the land map
   * with adjacent land?
   *
   * Note: does not check the tile at the coordinates itself.
   *
   * @param x The x coordinate to check.
   * @param y The y coordinate to check.
   * @return True if this tile has adjacent land.
   */
  hasAdjacentLand(x: number, y: number): boolean {
    let p = new Map$Position()._Map$Position$int$int(x, y);
    let landPred = (d) => {
      let n = new Map$Position()._Map$Position$Position$Direction(p, d);
      return this.isLand(n.getX(), n.getY());
    };
    return CollectionUtils.any$ObjectArr$Predicate(Direction.values(), landPred);
  }
  /**
   * Get the positions surrounding a central position that are potential
   * valid land positions.
   *
   * @param position The central {@code Position} to work from.
   * @param distanceToEdge The preferred distance to the map edge.
   * @return A list of suitable {@code Position}s.
   */
  newPositions(position: Map$Position, distanceToEdge: number): List<Map$Position> {
    let landPred = (p) => (p.isValid(this.getWidth(), this.getHeight()) && !this.hasAdjacentLand(p.getX(), p.getY()) && p.getX() > distanceToEdge && p.getX() < ((this.getWidth() - distanceToEdge) | 0));
    let positionMapper = (d) => new Map$Position()._Map$Position$Position$Direction(position, d);
    return CollectionUtils.transform$Stream$Predicate(CollectionUtils.map$Collection$Function(Direction.longSides, positionMapper), landPred);
  }
  /**
   * Determines, based on position, number of adjacent land tiles
   * and some random factor, whether a given map position should be
   * set to land.  This is called for all valid map positions
   * adjacent to a position that has been set to land by
   * #setLand(int,int), and may recursively call setLand for the
   * current position.
   *
   * @param x The x coordinate to grow land at.
   * @param y The y coordinate to grow land at.
   * @param distanceToEdge The preferred distance to the map edge.
   */
  growLand(x: number, y: number, distanceToEdge: number): void {
    if (this.isLand(x, y)) {
      return;
    }
    let r = (this.cache.nextInt$int(8) + Math.max(-1, ((1 + (Math.max((distanceToEdge - (Math.min(x, (this.getWidth() - x) | 0))) | 0, (Math.imul(2, distanceToEdge) - (Math.min(y, (this.getHeight() - y) | 0))) | 0))) | 0))) | 0;
    let p = new Map$Position()._Map$Position$int$int(x, y);
    let landPred = (d) => {
      let n = new Map$Position()._Map$Position$Position$Direction(p, d);
      return this.isLand(n.getX(), n.getY());
    };
    if (CollectionUtils.count$ObjectArr$Predicate(Direction.values(), landPred) > r) {
      this.setLand$int$int$int$LandMap(x, y, distanceToEdge);
    }
  }
  /**
   * Create a new land mass (unconnected to existing land masses) of
   * size up to maxSize, and adds it to the current map if it is at
   * least minSize.
   *
   * @param minSize Minimum number of tiles in the land mass.
   * @param maxSize Maximum number of tiles in the land mass.
   * @param x Optional starting x coordinate (chosen randomly if negative).
   * @param y Optional starting y coordinate (chosen randomly if negative).
   * @param distanceToEdge The preferred distance to the map edge.
   * @return The number of tiles added.
   */
  addLandMass(minSize: number, maxSize: number, x: number, y: number, distanceToEdge: number): number {
    let size = 0;
    let newLand = $J.newArrayN([this.getWidth(), this.getHeight()], false);
    if (x < 0 || y < 0) {
      let wid = (this.getWidth() - Math.imul(distanceToEdge, 2)) | 0;
      let hgt = (this.getHeight() - Math.imul(distanceToEdge, 2)) | 0;
      do {
        x = (distanceToEdge + this.cache.nextInt$int(wid)) | 0;
        y = (distanceToEdge + this.cache.nextInt$int(hgt)) | 0;
      } while (this.isLand(x, y) || this.hasAdjacentLand(x, y));
    }
    newLand[x][y] = true;
    size++;
    let p = new Map$Position()._Map$Position$int$int(x, y);
    let l = this.newPositions(p, distanceToEdge);
    let enough = (minSize + this.cache.nextInt$int((maxSize - minSize + 1) | 0)) | 0;
    while (size < enough && !l.isEmpty()) {
      let i = this.cache.nextInt$int(l.size());
      p = l.removeAt(i);
      if (!newLand[p.getX()][p.getY()]) {
        newLand[p.getX()][p.getY()] = true;
        size++;
        l.addAll(this.newPositions(p, distanceToEdge));
      }
    }
    if (size >= minSize) {
      for (x = 0; x < this.width_; x++) {
        for (y = 0; y < this.height_; y++) {
          if (newLand[x][y]) {
            this.setLand$int$int$LandMap(x, y);
          }
        }
      }
    }
    return (size >= minSize) ? size : 0;
  }
  static $clinit() {
    LandMap.logger = Logger.getLogger($J.cls(LandMap).getName());
  }
}

$J.define(LandMap, 'net.sf.freecol.common.model.LandMap', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.option.OptionGroup,net.sf.freecol.common.util.RandomUtils$RandomIntCache': '_LandMap$OptionGroup$RandomIntCache', 'net.sf.freecol.common.model.Map,net.sf.freecol.common.util.RandomUtils$RandomIntCache': '_LandMap$Map$RandomIntCache', 'int,int,net.sf.freecol.common.util.RandomUtils$RandomIntCache': '_LandMap$int$int$RandomIntCache' }, returns: { 'hasLand': 'boolean', 'getHeight': 'int', 'getWidth': 'int' }, meths: { 'setLand(int,int,int)': 'setLand$int$int$int$LandMap', 'setLand(int,int)': 'setLand$int$int$LandMap' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Map$Position = $J.load('net.sf.freecol.common.model.Map$Position');
  MapGeneratorOptions = $J.load('net.sf.freecol.common.option.MapGeneratorOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
