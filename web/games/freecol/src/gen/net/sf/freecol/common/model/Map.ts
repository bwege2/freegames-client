// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Map.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Comparator, HashMap, HashSet, IllegalArgumentException, IllegalStateException, JEnum, JObject, Level, LinkedList, Logger, NoSuchElementException, PriorityQueue, RuntimeException, Stream, StringBuilder, UnsupportedOperationException, XMLStreamException } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let ImageLibrary, FreeColDebugger, FreeColDebugger$DebugMode, Constants, Direction, Europe, IndianSettlement, Location, PathNode, Region, StringTemplate, Tile, TileItemContainer, Unit, Unit$MoveType, CostDecider, CostDeciders, GoalDeciders, CollectionUtils, LogBuilder, RandomUtils;

/**
 * A rectangular isometric map.  The map is represented as a
 * two-dimensional array of tiles.  Off-map destinations, such as
 * {@link Europe}, can be reached via the {@link HighSeas}.
 *
 * In theory, a {@link Game} might contain several Map instances
 * connected by the HighSeas.
 */
export class Map_ extends FreeColGameObject {
  static logger: Logger = null;
  static readonly TAG: string = 'map';
  /**
   * The number of tiles from the upper edge that are considered
   * polar by default.
   */
  static readonly POLAR_HEIGHT: number = 2;
  /**
   * The width and height of the map.
   */
  width_: number = 0;
  /**
   * The width and height of the map.
   */
  height_: number = 0;
  /**
   * The tiles that this map contains, as a 2D array.  This starts
   * out unassigned, but is initialized in setTiles().  Then the
   * individual tiles are filled in with setTile(), however once a
   * Tile is present further calls to setTile will copyIn to it.
   */
  tileArray: Tile[][] = null;
  /**
   * The tiles that this map contains, as a list.
   * This is populated in setTile().
   */
  tileList: List<Tile> = null;
  /**
   * The highest map layer included.
   */
  layer: Map$Layer = null;
  /**
   * The latitude of the northern edge of the map. A negative value
   * indicates northern latitude, a positive value southern
   * latitude. Thus, -30 equals 30 degrees N, and 40 equals 40 degrees S.
   */
  minimumLatitude: number = 0;
  /**
   * The latitude of the southern edge of the map. A negative value
   * indicates northern latitude, a positive value southern
   * latitude. Thus, -30 equals 30 degrees N, and 40 equals 40 degrees S.
   */
  maximumLatitude: number = 0;
  /**
   * Variable used to convert rows to latitude.
   */
  latitudePerRow: number = 0;
  /**
   * The regions on the map.
   */
  regions: List<Region> = null;
  /**
   * The search tracing status.
   */
  traceSearch: boolean = false;
  /**
   * A trivial search heuristic that always returns zero.
   */
  trivialSearchHeuristic: Map$SearchHeuristic = null;
  static readonly HEIGHT_TAG: string = 'height';
  static readonly LAYER_TAG: string = 'layer';
  static readonly MAXIMUM_LATITUDE_TAG: string = 'maximumLatitude';
  static readonly MINIMUM_LATITUDE_TAG: string = 'minimumLatitude';
  static readonly WIDTH_TAG: string = 'width';
  $init_Map_() {
    this.width_ = -1;
    this.height_ = -1;
    this.tileList = new ArrayList();
    this.minimumLatitude = -90;
    this.maximumLatitude = 90;
    this.regions = new ArrayList();
    this.traceSearch = false;
    this.trivialSearchHeuristic = (t) => 0;
  }
  /**
   * Create a new {@code Map} from a collection of tiles.
   *
   * @param game The enclosing {@code Game}.
   * @param width The map width.
   * @param height The map height.
   */
  _Map$Game$int$int(game: Game, width: number, height: number): this {
    this._FreeColGameObject$Game(game);
    this.$init_Map_();
    this.setTiles(width, height);
    this.setLayer(Map$Layer.RESOURCES);
    this.calculateLatitudePerRow();
    this.initializeTraceSearch();
    return this;
  }
  /**
   * Create a new {@code Map} from an input stream.
   *
   * @param game The enclosing {@code Game}.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered during parsing.
   */
  _Map$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._Map$Game$int$int(game, xr.getAttribute$String$int(Map_.WIDTH_TAG, -1), xr.getAttribute$String$int(Map_.HEIGHT_TAG, -1));
    this.readFromXML(xr);
    return this;
  }
  /**
   * Creates a new {@code Map} with the given object identifier.
   *
   * The object should be initialized later.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _Map$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    this.$init_Map_();
    this.initializeTraceSearch();
    return this;
  }
  /**
   * Enable full path logging by default if in PATHS debug mode.
   */
  initializeTraceSearch(): void {
    this.traceSearch = FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.PATHS);
  }
  /**
   * Gets the width of this map.
   *
   * @return The width of this map.
   */
  getWidth(): number {
    return this.width_;
  }
  /**
   * Gets the height of this map.
   *
   * @return The height of this map.
   */
  getHeight(): number {
    return this.height_;
  }
  /**
   * Checks if an (x,y) coordinate tuple is within a map of
   * specified width and height.
   *
   * @param x The x-coordinate of the position.
   * @param y The y-coordinate of the position.
   * @param width The width of the map.
   * @param height The height of the map.
   * @return True if the given position is within the bounds of the map.
   */
  static inBox(x: number, y: number, width: number, height: number): boolean {
    return x >= 0 && x < width && y >= 0 && y < height;
  }
  /**
   * Checks whether a position is valid (within the map limits).
   *
   * @param x The X coordinate to check.
   * @param y The Y coordinate to check.
   * @return True if the coordinates are valid.
   */
  isValid$int$int(x: number, y: number): boolean {
    return Map_.inBox(x, y, this.getWidth(), this.getHeight());
  }
  /**
   * Checks whether a position is valid (within the map limits).
   *
   * @param position The {@code Position} to check.
   * @return True if the position is valid.
   */
  isValid$Position(position: Map$Position): boolean {
    return this.isValid$int$int(position.getX(), position.getY());
  }
  /**
   * Initialize the tile shape.  This must be called *once* per map.
   *
   * @param width The new map width.
   * @param height The new map height.
   * @return An error message if setting the tile array was invalid, null if valid.
   */
  setTiles(width: number, height: number): string {
    if (width <= 0 || height <= 0) {
      return 'Bad map tile array size: (' + width + ',' + height + ')';
    }
    this.width_ = width;
    this.height_ = height;
    this.tileArray = $J.newArrayN([width, height], null);
    this.tileList.clear();
    return null;
  }
  /**
   * Update the tile shape, however it is an error to change the map
   * size after the initial setting.
   *
   * @param width The new map width.
   * @param height The new map height.
   * @return An error message if setting the tile array was invalid, null if valid.
   */
  updateTiles(width: number, height: number): string {
    if (this.width_ < 0 && this.height_ < 0) {
      return this.setTiles(width, height);
    }
    if (this.width_ !== width || this.height_ !== height) {
      return 'Attempted map resize (' + this.width_ + ',' + this.height_ + ' -> ' + width + ',' + height + ')';
    }
    return null;
  }
  /**
   * Gets the Tile at position (x, y).  'x' specifies a column and
   * 'y' specifies a row.  (0, 0) is the Tile at the top-left corner
   * of the Map.
   *
   * @param x The x-coordinate of the {@code Tile}.
   * @param y The y-coordinate of the {@code Tile}.
   * @return The {@code Tile} at (x, y), or null if the
   *     position is invalid.
   */
  getTile$int$int(x: number, y: number): Tile {
    if (!this.isValid$int$int(x, y)) {
      return null;
    }
    return this.tileArray[x][y];
  }
  /**
   * Gets the Tile at a requested position.
   *
   * @param p The {@code Position} to query.
   * @return The {@code Tile} at the given position.
   */
  getTile$Position(p: Map$Position): Tile {
    return this.getTile$int$int(p.getX(), p.getY());
  }
  /**
   * Set the tile at the given coordinates.
   *
   * This can be done *once* per tile.  Currently that is enforced
   * by calling setTile() only from populateTiles() where the map is
   * being built or indirectly through updateTile() where the
   * absence of the tile is checked.
   *
   * @param x The x-coordinate of the {@code Tile}.
   * @param y The y-coordinate of the {@code Tile}.
   * @param tile The {@code Tile} to set.
   * @return True if the {@code Tile} was updated.
   */
  setTile(tile: Tile, x: number, y: number): boolean {
    if (tile == null) {
      return false;
    }
    this.tileArray[x][y] = tile;
    this.tileList.add(tile);
    return true;
  }
  /**
   * Update a tile in this map from the given tile.
   *
   * @param tile The {@code Tile} to update from.
   * @return True if the tile was updated.
   */
  updateTile(tile: Tile): boolean {
    if (tile == null) {
      return false;
    }
    let x = tile.getX();
    let y = tile.getY();
    if (!this.isValid$int$int(x, y)) {
      return false;
    }
    let old = this.tileArray[x][y];
    if (old == null) {
      return this.setTile(tile, x, y);
    }
    old.copyIn(tile);
    return true;
  }
  /**
   * Get the layer.
   *
   * @return The maximum implemented layer on this map.
   */
  getLayer(): Map$Layer {
    return this.layer;
  }
  /**
   * Set the layer.
   *
   * @param newLayer The new maximum implemented layer for this map.
   */
  setLayer(newLayer: Map$Layer): void {
    this.layer = newLayer;
  }
  /**
   * Get the minimum latitude.
   *
   * @return The minimum latitude of this map.
   */
  getMinimumLatitude(): number {
    return this.minimumLatitude;
  }
  /**
   * Set the minimum latitude.
   *
   * @param newMinimumLatitude The new minimum latitude for this map.
   */
  setMinimumLatitude(newMinimumLatitude: number): void {
    this.minimumLatitude = newMinimumLatitude;
    this.calculateLatitudePerRow();
  }
  /**
   * Get the maximum latitude.
   *
   * @return The maximum latitude of this map.
   */
  getMaximumLatitude(): number {
    return this.maximumLatitude;
  }
  /**
   * Set the maxmimum latitude.
   *
   * @param newMaximumLatitude The new maximum latitude for this map.
   */
  setMaximumLatitude(newMaximumLatitude: number): void {
    this.maximumLatitude = newMaximumLatitude;
    this.calculateLatitudePerRow();
  }
  /**
   * Get the latitude/row.
   *
   * @return The latitude change between rows.
   */
  getLatitudePerRow(): number {
    return this.latitudePerRow;
  }
  /**
   * Recalculate the latitude/row from the current maximum and minimum.
   */
  calculateLatitudePerRow(): void {
    this.latitudePerRow = Math.fround(Math.fround(1 * ((this.maximumLatitude - this.minimumLatitude) | 0)) / ((this.getHeight() - 1) | 0));
  }
  /**
   * Gets the latitude of the given map row.
   *
   * @param row The row to check.
   * @return The row latitude.
   */
  getLatitude(row: number): number {
    return (this.minimumLatitude + $J.d2i((Math.fround(row * this.latitudePerRow)))) | 0;
  }
  /**
   * Gets the map row with the given latitude.
   *
   * @param latitude The latitude to find.
   * @return The row closest to the supplied latitude.
   */
  getRow(latitude: number): number {
    return $J.d2i((Math.fround(((latitude - this.minimumLatitude) | 0) / this.latitudePerRow)));
  }
  /**
   * Gets the regions in this map.
   *
   * @return All the regions in this map.
   */
  getRegions(): Collection<Region> {
    {
      return new ArrayList(this.regions);
    }
  }
  /**
   * Adds a region to this map.
   *
   * @param region The {@code Region} to add.
   */
  addRegion(region: Region): void {
    {
      this.regions.add(region);
    }
  }
  /**
   * Remove a region from this map.
   *
   * @param region The {@code Region} to be removed.
   */
  removeRegion(region: Region): void {
    {
      this.regions.remove(region);
    }
  }
  /**
   * Clear the regions list.
   */
  clearRegions(): void {
    {
      this.regions.clear();
    }
  }
  /**
   * Get the fixed regions indexed by key.
   *
   * @return A map of the fixed regions.
   */
  getFixedRegions(): JMap<string, Region> {
    let result = new HashMap();
    for (const $it0 = this.getRegions().iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      let n = r.getKey();
      if (n != null) {
        result.put(n, r);
      }
    }
    return result;
  }
  /**
   * Gets a {@code Region} by name key.
   *
   * @param key The name key to lookup the region with.
   * @return The {@code Region} with the given name key, or
   *     null if none found.
   */
  getRegionByKey(key: string): Region {
    return (key == null) ? null : CollectionUtils.find$Collection$Predicate(this.getRegions(), CollectionUtils.matchKeyEquals$Object$Function(key, ($p0) => $p0.getKey()));
  }
  removeRegionsByKey(key: string): void {
    {
      for (const $it1 = new ArrayList(this.regions).iterator(); $it1.hasNext(); ) {
        let region = $it1.next();
        if ($J.equals(key, region.getKey())) {
          this.removeRegion(region);
        }
      }
    }
  }
  /**
   * Gets a {@code Region} by name.
   *
   * @param name The region name.
   * @return The {@code Region} with the given name, or null if
   *     not found.
   */
  getRegionByName(name: string): Region {
    return (name == null) ? null : CollectionUtils.find$Collection$Predicate(this.getRegions(), CollectionUtils.matchKeyEquals$Object$Function(name, ($p0) => $p0.getName()));
  }
  /**
   * Are two locations non-null and either the same or at the same tile.
   * This routine is here because Location is an interface.
   *
   * @param l1 The first {@code Location}.
   * @param l2 The second {@code Location}.
   * @return True if the locations are the same or at the same tile.
   */
  static isSameLocation(l1: Location, l2: Location): boolean {
    return (l1 == null || l2 == null) ? false : (l1 === l2) ? true : (l1.getTile$() == null) ? false : l1.getTile$() === l2.getTile$();
  }
  /**
   * Are two locations at least in the same contiguous land/sea-mass?
   * This routine is here because Location is an interface.
   *
   * @param l1 The first {@code Location}.
   * @param l2 The second {@code Location}.
   * @return True if the locations are the same or in the same land/sea-mass.
   */
  static isSameContiguity(l1: Location, l2: Location): boolean {
    return (l1 == null || l2 == null) ? false : (l1 === l2) ? true : (l1.getTile$() == null || l2.getTile$() == null) ? false : l1.getTile$().isConnectedTo(l2.getTile$());
  }
  /**
   * Is a tile in the map in a polar region?
   *
   * @param tile The {@code Tile} to examine.
   * @return True if the tile is in a polar region.
   */
  isPolar(tile: Tile): boolean {
    return tile.getY() <= Map_.POLAR_HEIGHT || tile.getY() >= ((this.getHeight() - Map_.POLAR_HEIGHT - 1) | 0);
  }
  /**
   * Gets the direction a unit needs to move in
   * order to get from {@code t1} to {@code t2}
   *
   * @param t1 The tile to move from.
   * @param t2 The target tile if moving from {@code t1}
   *      in the direction returned by this method.
   * @return The direction you need to move from {@code t1}
   *      in order to reach {@code t2}, or null if the two
   *      specified tiles are not neighbours.
   */
  getDirection(t1: Tile, t2: Tile): Direction {
    return (t1 == null || t2 == null) ? null : new Map$Position()._Map$Position$Tile(t1).getDirection(new Map$Position()._Map$Position$Tile(t2));
  }
  /**
   * Get the approximate direction from one tile to another.
   *
   * @param src The source {@code Tile}.
   * @param dst The destination {@code Tile}.
   * @return The approximate direction from source to direction, or null
   *     if source and destination are the same.
   */
  static getRoughDirection(src: Tile, dst: Tile): Direction {
    let x = (dst.getX() - src.getX()) | 0;
    let y = (dst.getY() - src.getY()) | 0;
    if (x === 0 && y === 0) {
      return null;
    }
    let theta = Math.atan2(y, x) + 3.141592653589793 / 2 + 3.141592653589793 / 8;
    if (theta < 0) {
      theta += 2 * 3.141592653589793;
    }
    return Direction.angleToDirection(theta);
  }
  /**
   * Gets the adjacent tile in a given direction from the given coordinates.
   *
   * @param x The x coordinate to work from.
   * @param y The y coordinate to work from.
   * @param direction The {@code Direction} to check.
   * @return The adjacent {@code Tile} in the specified
   *     direction, or null if invalid.
   */
  getAdjacentTile$int$int$Direction(x: number, y: number, direction: Direction): Tile {
    return this.getTile$Position(direction.step(x, y));
  }
  /**
   * Gets the adjacent tile in a given direction from a given tile.
   *
   * @param tile The starting {@code Tile}.
   * @param direction The {@code Direction} to check.
   * @return The adjacent {@code Tile} in the specified
   *     direction, or null if invalid.
   */
  getAdjacentTile$Tile$Direction(tile: Tile, direction: Direction): Tile {
    return this.getAdjacentTile$int$int$Direction(tile.getX(), tile.getY(), direction);
  }
  /**
   * Gets the distance between two tiles.
   *
   * @param t1 The first {@code Tile}.
   * @param t2 The second {@code Tile}.
   * @return The distance between the tiles.
   */
  getDistance(t1: Tile, t2: Tile): number {
    return Map$Position.getXYDistance(t1.getX(), t1.getY(), t2.getX(), t2.getY());
  }
  /**
   * Get the closest tile to a given one from a list of other tiles.
   *
   * @param tile The {@code Tile} to start from.
   * @param tiles The list of {@code Tile}s to check.
   * @return The closest tile found (may be null if the list is empty).
   */
  getClosestTile(tile: Tile, tiles: Collection<Tile>): Tile {
    return CollectionUtils.minimize$Collection$Comparator(tiles, CollectionUtils.cachingIntComparator((t) => this.getDistance(t, tile)));
  }
  /**
   * Select a random land tile on the map.
   *
   * @param random A {@code Random} number source.
   * @return A random land tile, or null if none found.
   */
  getRandomLandTile(random: Random): Tile {
    let SLOSH = 10;
    let x = 0;
    let y = 0;
    let width = this.getWidth();
    let height = this.getHeight();
    if (width >= SLOSH) {
      width = (width - SLOSH) | 0;
      x = (x + $J.idiv(SLOSH, 2)) | 0;
    }
    if (height >= SLOSH) {
      height = (height - SLOSH) | 0;
      y = (y + $J.idiv(SLOSH, 2)) | 0;
    }
    x = (x + RandomUtils.randomInt(Map_.logger, 'W', random, width)) | 0;
    y = (y + RandomUtils.randomInt(Map_.logger, 'H', random, height)) | 0;
    for (const $it2 = this.getCircleTiles(this.getTile$int$int(x, y), true, Constants.INFINITY).iterator(); $it2.hasNext(); ) {
      let t = $it2.next();
      if (t.isLand()) {
        return t;
      }
    }
    return null;
  }
  /**
   * Get a list of all the tiles that match a predicate.
   *
   * @param predicate The <code>Predicate</code> to check.
   * @return A {@code List} of all matching {@code Tile}s.
   */
  getTileSet(predicate: Predicate<Tile>): JSet<Tile> {
    let ret = new HashSet();
    for (const $it3 = this.tileList.iterator(); $it3.hasNext(); ) {
      let t = $it3.next();
      if (predicate(t)) {
        ret.add(t);
      }
    }
    return ret;
  }
  iterator(): Iterator<Tile> {
    return Collections.unmodifiableList(this.tileList).iterator();
  }
  /**
   * Get a list of all the tiles that match a predicate.
   *
   * @param predicate The <code>Predicate</code> to check.
   * @return A {@code List} of all matching {@code Tile}s.
   */
  getTileList(predicate: Predicate<Tile>): List<Tile> {
    let ret = new ArrayList();
    for (const $it4 = this.tileList.iterator(); $it4.hasNext(); ) {
      let t = $it4.next();
      if (predicate(t)) {
        ret.add(t);
      }
    }
    return ret;
  }
  /**
   * Perform an action on each tile.
   *
   * @param consumer The {@code Consumer} action to perform.
   */
  forEachTile$Consumer(consumer: Consumer<Tile>): void {
    for (const $it5 = this.tileList.iterator(); $it5.hasNext(); ) {
      let t = $it5.next();
      consumer(t);
    }
  }
  /**
   * Perform an action on each tile that matches a predicate.
   *
   * @param predicate The {@code Predicate} to match.
   * @param consumer The {@code Consumer} action to perform.
   */
  forEachTile$Predicate$Consumer(predicate: Predicate<Tile>, consumer: Consumer<Tile>): void {
    for (const $it6 = this.tileList.iterator(); $it6.hasNext(); ) {
      let t = $it6.next();
      if (predicate(t)) {
        consumer(t);
      }
    }
  }
  /**
   * Populate the map.
   *
   * To be called to build a new map.
   *
   * @param func A <code>Function</code> that makes a new
   *    <code>Tile</code> for the supplied x,y coordinates.
   * @return True if the map was populated.
   */
  populateTiles(func: BiFunction<number, number, Tile>): boolean {
    for (let y = 0; y < this.height_; y++) {
      for (let x = 0; x < this.width_; x++) {
        if (!this.setTile(func(x, y), x, y)) {
          return false;
        }
      }
    }
    return true;
  }
  /**
   * Iterates through a rectangular subpart of the Map.
   * Intentionally avoids calling methods doing redundant checks,
   * which would slow down map display.
   *
   * @param x X-component of the position of first tile.
   * @param y Y-component of the position of first tile.
   * @param w Width of the rectangle.
   * @param h Height of the rectangle.
   * @param consumer Provides a function to call for each tile.
   */
  forSubMap(x: number, y: number, w: number, h: number, consumer: Consumer<Tile>): void {
    for (const $it7 = this.subMap(x, y, w, h).iterator(); $it7.hasNext(); ) {
      let t = $it7.next();
      consumer(t);
    }
  }
  /**
   * Collect the tiles in a rectangular portion of the map.
   *
   * @param x X-component of the position of first tile.
   * @param y Y-component of the position of first tile.
   * @param w Width of the rectangle.
   * @param h Height of the rectangle.
   * @return A list of {@code Tile}s found (empty on error).
   */
  subMap(x: number, y: number, w: number, h: number): List<Tile> {
    if (x < 0) {
      w = (w + x) | 0;
      x = 0;
    }
    if (y < 0) {
      h = (h + y) | 0;
      y = 0;
    }
    let width = this.getWidth();
    let height = this.getHeight();
    if (w <= 0 || h <= 0 || x > width || y > height) {
      return Collections.emptyList();
    }
    if (((x + w) | 0) > width) {
      w = (width - x) | 0;
    }
    if (((y + h) | 0) > height) {
      h = (height - y) | 0;
    }
    let ret = new ArrayList();
    for (let yi = y; yi < ((y + h) | 0); yi++) {
      for (let xi = x; xi < ((x + w) | 0); xi++) {
        ret.add(this.getTile$int$int(xi, yi));
      }
    }
    return ret;
  }
  /**
   * Get a shuffled list of all the tiles.
   *
   * @param random A pseudo-random number source.
   * @return A shuffled list of all the {@code Tile}s in this map.
   */
  getShuffledTiles(random: Random): List<Tile> {
    let ret = new ArrayList(this.tileList);
    RandomUtils.randomShuffle(Map_.logger, 'All tile shuffle', ret, random);
    return ret;
  }
  /**
   * Gets a circle iterator.
   *
   * @param center The center {@code Tile} to iterate around.
   * @param isFilled True to get all of the positions in the circle.
   * @param radius The radius of circle. No tiles are returned if
   *      {@code radius <= 0}.
   * @return The circle iterator. The center tile is never returned.
   *      The innermost tiles are returned first.
   */
  getCircleIterator(center: Tile, isFilled: boolean, radius: number): Iterator<Tile> {
    return new Map$CircleIterator().$o(this)._Map$CircleIterator(center, isFilled, radius);
  }
  /**
   * Gets an iterable for all the tiles in a circle using an
   * underlying CircleIterator.
   *
   * @param center The center {@code Tile} to iterate around.
   * @param isFilled True to get all of the positions in the circle.
   * @param radius The radius of circle. No tiles are returned if
   *      {@code radius <= 0}.
   * @return An {@code Iterable} The center tile is never returned.
   *      The innermost tiles are returned first.
   */
  getCircleTiles(center: Tile, isFilled: boolean, radius: number): Iterable<Tile> {
    return new (Map$1())().$o(this).$c(center, isFilled, radius);
  }
  /**
   * Gets a search heuristic using the Manhatten distance to an end tile.
   *
   * @param endTile The {@code Tile} to aim for.
   * @return A new {@code SearchHeuristic} aiming for the end tile.
   */
  getManhattenHeuristic(endTile: Tile): Map$SearchHeuristic {
    return (tile) => tile.getDistanceTo(endTile);
  }
  /**
   * Destination argument test for path searches.  Find the actual
   * destination of a path.
   *
   * @param unit An optional {@code Unit} to search for.
   * @param end  The candidate end {@code Location}.
   * @return The actual end location.
   */
  findRealEnd(unit: Unit, end: Location): Location {
    while (true) {
      if (end == null) {
        throw new RuntimeException('Null end for: ' + $J.str(unit));
      } else if (end instanceof Europe) {
        return end;
      } else if (end instanceof Map_) {
        end = unit.getFullEntryLocation();
      } else if (end.getTile$() != null) {
        return end.getTile$();
      } else if (unit != null) {
        return unit.resolveDestination();
      } else {
        throw new RuntimeException('Invalid end: ' + $J.str(end));
      }
    }
  }
  /**
   * Gets the best (closest) path location for this unit to reach a
   * given tile from off the map.
   *
   * @param unit The {@code Unit} to check.
   * @param tile The target {@code Tile}.
   * @param carrier An optional carrier {@code Unit}to use.
   * @param costDecider An optional {@code CostDecider} to use.
   * @return A path to the best entry location tile to arrive on the
   *     map at, or null if none found.
   */
  getBestEntryPath(unit: Unit, tile: Tile, carrier: Unit, costDecider: CostDecider): PathNode {
    if (costDecider == null) {
      costDecider = CostDeciders.avoidSettlementsAndBlockingUnits();
    }
    return this.searchMap(unit, tile, GoalDeciders.getHighSeasGoalDecider(), costDecider, Constants.INFINITY, carrier, null, null);
  }
  /**
   * Gets the best (closest) entry location for this unit to reach a
   * given tile from off the map.
   *
   * @param unit The {@code Unit} to check.
   * @param tile The target {@code Tile}.
   * @param carrier An optional carrier {@code Unit}to use.
   * @param costDecider An optional {@code CostDecider} to use.
   * @return The best entry location tile to arrive on the map at, or null
   *     if none found.
   */
  getBestEntryTile(unit: Unit, tile: Tile, carrier: Unit, costDecider: CostDecider): Tile {
    let path = this.getBestEntryPath(unit, tile, carrier, costDecider);
    return (path == null) ? null : path.getLastNode().getTile();
  }
  /**
   * Find the quickest path for a unit (with optional carrier) from
   * a start tile to an end tile.
   *
   * @param unit The {@code Unit} to find the path for.
   * @param start The {@code Tile} in which the path starts from.
   * @param end The {@code Tile} at the end of the path.
   * @param carrier An optional naval carrier {@code Unit} to use.
   * @param costDecider An optional {@code CostDecider} for
   *     determining the movement costs (uses default cost deciders
   *     for the unit/s if not provided).
   * @param lb An optional {@code LogBuilder} to log to.
   * @return A path starting at the start tile and ending at the end
   *     tile, or null if none found.
   */
  findMapPath(unit: Unit, start: Tile, end: Tile, carrier: Unit, costDecider: CostDecider, lb: LogBuilder): PathNode {
    let offMapUnit = (carrier != null) ? carrier : (unit != null && unit.isNaval()) ? unit : null;
    let gd = GoalDeciders.getLocationGoalDecider(end);
    let sh = this.getManhattenHeuristic(end);
    let embarkTo: Unit;
    let endUnit: Unit;
    let path: PathNode;
    if (start.getContiguity() === end.getContiguity()) {
      path = this.searchMap(unit, start, gd, costDecider, Constants.INFINITY, null, sh, lb);
      let carrierPath = (carrier == null) ? null : this.searchMap(unit, start, gd, costDecider, Constants.INFINITY, carrier, sh, lb);
      if (carrierPath != null && (path == null || (path.getLastNode().getCost() > carrierPath.getLastNode().getCost()))) {
        path = carrierPath;
      }
    } else if (offMapUnit != null) {
      path = this.searchMap(unit, start, gd, costDecider, Constants.INFINITY, carrier, sh, lb);
    } else if (unit != null && unit.isOnCarrier() && !start.isLand() && end.isLand() && !start.getContiguityAdjacent(end.getContiguity()).isEmpty()) {
      path = this.searchMap(unit, start, gd, costDecider, Constants.INFINITY, carrier, sh, lb);
    } else if (start.isLand() && !end.isLand() && (endUnit = end.getFirstUnit()) != null && unit != null && unit.getOwner().owns(endUnit) && !end.getContiguityAdjacent(start.getContiguity()).isEmpty() && (embarkTo = end.getCarrierForUnit(unit)) != null) {
      path = this.searchMap(unit, start, GoalDeciders.getAdjacentLocationGoalDecider(end), costDecider, Constants.INFINITY, null, null, lb);
      if (path != null) {
        let last = path.getLastNode();
        last.next_ = new PathNode()._PathNode(embarkTo, 0, (last.getTurns() + 1) | 0, true, last, null);
      }
    } else {
      path = null;
    }
    return path;
  }
  /**
   * Finish processing a path.
   *
   * @param path The {@code PathNode} to finish.
   * @param unit The {@code Unit} that is travelling along the path.
   * @param lb An optional {@code LogBuilder} to log to.
   */
  finishPath(path: PathNode, unit: Unit, lb: LogBuilder): void {
    if (path != null) {
      let initialTurns = (!unit.isAtSea()) ? 0 : ((unit.isOnCarrier()) ? unit.getCarrier() : unit).getWorkLeft();
      if (initialTurns !== 0) {
        path.addTurns(initialTurns);
      }
      if (lb != null) {
        lb.add(['\nSuccess\n', path.fullPathToString()]);
      }
    }
    if (lb != null) {
      lb.log(Map_.logger, Level.INFO);
    }
  }
  /**
   * Find the quickest path for a unit (with optional carrier) from
   * a start location to an end location.
   *
   * @param unit The {@code Unit} to find the path for.
   * @param start The {@code Location} in which the path starts from.
   * @param end The {@code Location} at the end of the path.
   * @param carrier An optional naval carrier {@code Unit} to use.
   * @param costDecider An optional {@code CostDecider} for
   *     determining the movement costs (uses default cost deciders
   *     for the unit/s if not provided).
   * @param lb An optional {@code LogBuilder} to log to.
   * @return A path starting at the start location and ending at the
   *     end location, or null if none found.
   */
  findPath(unit: Unit, start: Location, end: Location, carrier: Unit, costDecider: CostDecider, lb: LogBuilder): PathNode {
    if (this.traceSearch) {
      lb = new LogBuilder()._LogBuilder(1024);
    }
    let realEnd: Location;
    try {
      realEnd = this.findRealEnd(unit, end);
    } catch ($e8) {
      if ($J.isa($e8, IllegalArgumentException)) {
        let iae = $J.exc($e8);
        throw new IllegalArgumentException('Path fail: ' + $J.str(unit) + ' from ' + $J.str(start) + ' to ' + $J.str(end) + ' with ' + $J.str(carrier), iae);
      } else {
        throw $e8;
      }
    }
    let offMapUnit = (carrier != null) ? carrier : unit;
    let p: PathNode;
    let path: PathNode;
    let tile: Tile;
    if (realEnd instanceof Tile && !(realEnd).isExplored()) {
      let closest = (start instanceof Tile) ? (this.getClosestTile(start, CollectionUtils.transform$Collection$Predicate((realEnd).getSurroundingTiles$int$int(1, 1), (t) => t.isExplored() && Map_.isSameContiguity(t, start)))) : null;
      path = (closest == null) ? null : this.findPath(unit, start, closest, carrier, costDecider, lb);
      if (path != null) {
        let last = path.getLastNode();
        last.next_ = new PathNode()._PathNode(realEnd, 0, (last.getTurns() + 1) | 0, last.isOnCarrier(), last, null);
      }
    } else if (start instanceof Europe && realEnd instanceof Europe) {
      path = new PathNode()._PathNode(start, unit.getMovesLeft(), 0, false, null, null);
    } else if (start instanceof Europe && realEnd instanceof Tile) {
      if (offMapUnit == null || !offMapUnit.getType().canMoveToHighSeas()) {
        path = null;
      } else if ((p = this.getBestEntryPath(unit, realEnd, carrier, costDecider)) == null) {
        path = null;
      } else if ((path = this.findMapPath(unit, (tile = p.getLastNode().getTile()), realEnd, carrier, costDecider, lb)) == null) {
        if (!(realEnd).isOnRiver()) {
          let l2 = new LogBuilder()._LogBuilder(512);
          l2.add(['Fail in findPath(', unit, ', ', tile, ', ', realEnd, ', ', carrier, ')\n']);
          l2.addStackTrace();
          l2.add([p.fullPathToString()]);
          this.findMapPath(unit, tile, realEnd, carrier, costDecider, l2);
          l2.log(Map_.logger, Level.WARNING);
        }
        path = null;
      } else {
        path.addTurns(offMapUnit.getSailTurns());
        path.previous_ = new PathNode()._PathNode(start, unit.getMovesLeft(), 0, carrier != null, null, path);
        path = path.previous_;
        if (carrier != null && unit.getLocation() !== carrier) {
          path.previous_ = new PathNode()._PathNode(start, unit.getMovesLeft(), 0, false, null, path);
          path = path.previous_;
        }
      }
    } else if (start instanceof Tile && realEnd instanceof Europe) {
      if (offMapUnit == null || !offMapUnit.getType().canMoveToHighSeas()) {
        path = null;
      } else if ((p = this.searchMap(unit, start, GoalDeciders.getHighSeasGoalDecider(), costDecider, Constants.INFINITY, carrier, null, lb)) == null) {
        path = null;
      } else {
        let last = p.getLastNode();
        last.next_ = new PathNode()._PathNode(realEnd, unit.getInitialMovesLeft(), (last.getTurns() + offMapUnit.getSailTurns()) | 0, last.isOnCarrier(), last, null);
        path = p;
      }
    } else if (start instanceof Tile && realEnd instanceof Tile) {
      let d: Direction;
      let mt: Unit$MoveType;
      if (unit != null && (d = (start).getDirection(realEnd)) != null && (mt = unit.getMoveType$Direction(d)).isLegal() && !mt.isProgress()) {
        path = new PathNode()._PathNode(start, unit.getMovesLeft(), 0, carrier != null, null, null);
        let cost = unit.getMoveCost$Tile$Tile$int(start, realEnd, unit.getMovesLeft());
        path.next_ = new PathNode()._PathNode(realEnd, (unit.getMovesLeft() - cost) | 0, 0, false, path, null);
      } else {
        path = this.findMapPath(unit, start, realEnd, carrier, costDecider, lb);
      }
    } else {
      throw new IllegalStateException('Can not happen: ' + $J.str(start) + ', ' + $J.str(realEnd));
    }
    this.finishPath(path, unit, lb);
    return path;
  }
  /**
   * Searches for a goal.
   * Assumes units in Europe return to their current entry location,
   * which is not optimal most of the time.
   * Returns the full path including the start and end locations.
   *
   * @param unit The {@code Unit} to find a path for.
   * @param start The {@code Location} to start the search from.
   * @param goalDecider The object responsible for determining whether a
   *     given {@code PathNode} is a goal or not.
   * @param costDecider An optional {@code CostDecider}
   *     responsible for determining the path cost.
   * @param maxTurns The maximum number of turns the given
   *     {@code Unit} is allowed to move.  This is the
   *     maximum search range for a goal.
   * @param carrier An optional naval carrier {@code Unit} to use.
   * @param lb An optional {@code LogBuilder} to log to.
   * @return The path to a goal, or null if none can be found.
   * @throws IllegalArgumentException If the unit is null, or the
   *     start location does not make sense, or the carrier/unit
   *     combination is bogus.
   */
  search(unit: Unit, start: Location, goalDecider: GoalDecider, costDecider: CostDecider, maxTurns: number, carrier: Unit, lb: LogBuilder): PathNode {
    if (this.traceSearch) {
      lb = new LogBuilder()._LogBuilder(1024);
    }
    let offMapUnit = (carrier != null) ? carrier : unit;
    let p: PathNode;
    let path: PathNode;
    if (start instanceof Europe) {
      if (offMapUnit == null || !offMapUnit.getType().canMoveToHighSeas()) {
        path = null;
      } else if ((p = this.searchMap(unit, offMapUnit.getFullEntryLocation(), goalDecider, costDecider, maxTurns, carrier, null, lb)) == null) {
        path = null;
      } else {
        path = this.findPath(unit, start, p.getLastNode().getTile(), carrier, costDecider, lb);
      }
    } else {
      path = this.searchMap(unit, start.getTile$(), goalDecider, costDecider, maxTurns, carrier, null, lb);
    }
    this.finishPath(path, unit, lb);
    return path;
  }
  /**
   * Gets the search tracing status.
   *
   * @return The search tracing status.
   */
  getSearchTrace(): boolean {
    return this.traceSearch;
  }
  /**
   * Sets the search tracing status.
   *
   * @param trace The new search tracing status.
   * @return The original search tracing status.
   */
  setSearchTrace(trace: boolean): boolean {
    let ret = this.traceSearch;
    this.traceSearch = trace;
    return ret;
  }
  /**
   * Was a carrier used previously on a path?
   *
   * Beware!  This is special case code for partially constructed
   * paths that do not yet have valid .next links, so we can not use the
   * generic PathNode routines.
   *
   * @param path The path the search.
   * @return True if the path includes a previous on-carrier node.
   */
  usedCarrier(path: PathNode): boolean {
    while (path != null) {
      if (path.isOnCarrier()) {
        return true;
      }
      path = path.previous_;
    }
    return false;
  }
  /**
   * Searches for a path to a goal determined by the given
   * {@code GoalDecider}.
   *
   * Using A* with a List (closedMap) for marking the visited nodes
   * and using a PriorityQueue (openMapQueue) for getting the next
   * edge with the least cost.  This implementation could be
   * improved by having the visited attribute stored on each Tile in
   * order to avoid both of the HashMaps currently being used to
   * serve this purpose.
   *
   * If the SearchHeuristic is not supplied, then the algorithm
   * degrades gracefully to Dijkstra's algorithm.
   *
   * The data structure for the open list is a combined structure: using a
   * HashMap for membership tests and a PriorityQueue for getting the node
   * with the minimal f (cost+heuristics). This gives O(1) on membership
   * test and O(log N) for remove-best and insertions.
   *
   * @param unit The {@code Unit} to find a path for.
   * @param start The {@code Tile} to start the search from.
   * @param goalDecider The object responsible for determining whether a
   *     given {@code PathNode} is a goal or not.
   * @param costDecider An optional {@code CostDecider}
   *     responsible for determining the path cost.
   * @param maxTurns The maximum number of turns the given
   *     {@code Unit} is allowed to move. This is the
   *     maximum search range for a goal.
   * @param carrier An optional naval carrier {@code Unit} to use.
   * @param searchHeuristic An optional {@code SearchHeuristic}.
   * @param lb An optional {@code LogBuilder} to log to.
   * @return A path to a goal determined by the given
   *     {@code GoalDecider}.
   */
  searchMap(unit: Unit, start: Tile, goalDecider: GoalDecider, costDecider: CostDecider, maxTurns: number, carrier: Unit, searchHeuristic: Map$SearchHeuristic, lb: LogBuilder): PathNode {
    let openMap = new HashMap();
    let closedMap = new HashMap();
    let f = new HashMap();
    let openMapQueue = new PriorityQueue(1024, Comparator.comparingInt((p) => f.get(p.getLocation().getId())));
    let sh = (searchHeuristic == null) ? this.trivialSearchHeuristic : searchHeuristic;
    let offMapUnit = (carrier != null) ? carrier : unit;
    let currentUnit = (start.isLand()) ? ((unit != null && unit.getLocation() === carrier && start.hasSettlement() && start.getSettlement().isConnectedPort()) ? carrier : unit) : offMapUnit;
    if (lb != null) {
      lb.add(['Search trace(unit=', unit, ', from=', start, ', max=', ((maxTurns === Constants.INFINITY) ? '-' : String(maxTurns)), ', carrier=', carrier, ')', '\n', FreeColDebugger.stackTraceToString$()]);
    }
    let firstNode = new PathNode()._PathNode(start, ((currentUnit != null) ? currentUnit.getMovesLeft() : -1), 0, carrier != null && currentUnit === carrier, null, null);
    f.put(start.getId(), $J.fn(sh, 'getValue')(start));
    openMap.put(start.getId(), firstNode);
    openMapQueue.offer(firstNode);
    let best = null;
    let bestScore = Constants.INFINITY;
    ok:
    while (!openMap.isEmpty()) {
      let currentNode = openMapQueue.poll();
      let currentLocation = currentNode.getLocation();
      openMap.remove(currentLocation.getId());
      if (lb != null) {
        lb.add(['\n  ', currentNode]);
      }
      currentUnit = (currentNode.isOnCarrier()) ? carrier : unit;
      if (goalDecider.check(currentUnit, currentNode)) {
        if (lb != null) {
          lb.add([' ***goal(', currentNode.getCost(), ')***']);
        }
        best = goalDecider.getGoal();
        if (best == null || !goalDecider.hasSubGoals()) {
          break ok;
        }
        bestScore = best.getCost();
        continue;
      }
      closedMap.put(currentLocation.getId(), currentNode);
      if (lb != null) {
        lb.add([' closing']);
      }
      if (bestScore < currentNode.getCost()) {
        if (lb != null) {
          lb.add(['...goal cost wins(', bestScore, ' < ', currentNode.getCost(), ')...']);
        }
        continue;
      }
      if (currentNode.getTurns() > maxTurns) {
        if (lb != null) {
          lb.add(['...out-of-range']);
        }
        continue;
      }
      let currentMovesLeft = currentNode.getMovesLeft();
      let currentTurns = currentNode.getTurns();
      let currentOnCarrier = currentNode.isOnCarrier();
      let currentTile = currentNode.getTile();
      if (currentTile == null) {
        if (lb != null) {
          lb.add(['...skip Europe']);
        }
        continue;
      }
      let closed: PathNode;
      for (const $it9 = currentTile.getSurroundingTiles$int(1).iterator(); $it9.hasNext(); ) {
        let moveTile = $it9.next();
        if (lb != null) {
          lb.add(['\n    ', moveTile]);
        }
        if (currentNode.previous_ != null && currentNode.previous_.getTile() === moveTile) {
          if (lb != null) {
            lb.add([' !prev']);
          }
          continue;
        }
        closed = closedMap.get(moveTile.getId());
        if (closed != null) {
          let cc = closed.getCost();
          if (cc <= currentNode.getCost()) {
            if (lb != null) {
              lb.add([' !worse ', cc]);
            }
            continue;
          }
        }
        let umt = unit.getSimpleMoveType$Tile$Tile(currentTile, moveTile);
        let unitMove = umt.isProgress();
        let carrierMove = carrier != null && carrier.getSimpleMoveType$Tile$Tile(carrier.getTile$(), moveTile).isProgress();
        if (lb != null) {
          lb.add([' ', ((unitMove) ? 'U' : ((carrierMove) ? 'C' : ''))]);
        }
        let move: Map$MoveCandidate;
        let stepLog: string;
        let isGoal = goalDecider.check(unit, new PathNode()._PathNode(moveTile, 0, $J.idiv(Constants.INFINITY, 2), false, currentNode, null));
        if (isGoal) {
          if (lb != null) {
            lb.add([' *goal*', umt]);
          }
          if (unitMove) {
            if (moveTile.hasSettlement() && currentOnCarrier && carrierMove) {
              move = new Map$MoveCandidate()._Map$MoveCandidate(carrier, currentNode, moveTile, currentMovesLeft, currentTurns, true, CostDeciders.tileCost());
            } else {
              let left = (currentOnCarrier) ? ((currentNode.embarkedThisTurn(currentTurns)) ? 0 : unit.getInitialMovesLeft()) : currentMovesLeft;
              move = new Map$MoveCandidate()._Map$MoveCandidate(unit, currentNode, moveTile, left, currentTurns, false, CostDeciders.tileCost());
            }
          } else {
            switch (umt) {
              case Unit$MoveType.ATTACK_UNIT:
              case Unit$MoveType.ATTACK_SETTLEMENT:
              case Unit$MoveType.ENTER_FOREIGN_COLONY_WITH_SCOUT:
              case Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_SCOUT:
              case Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_FREE_COLONIST:
              case Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY:
              case Unit$MoveType.ENTER_SETTLEMENT_WITH_CARRIER_AND_GOODS:
                move = new Map$MoveCandidate()._Map$MoveCandidate(unit, currentNode, moveTile, currentMovesLeft, currentTurns, false, CostDeciders.tileCost());
                unitMove = true;
                break;
              case Unit$MoveType.EMBARK:
                move = new Map$MoveCandidate()._Map$MoveCandidate(unit, currentNode, moveTile, currentMovesLeft, currentTurns, true, CostDeciders.tileCost());
                unitMove = true;
                break;
              case Unit$MoveType.MOVE_NO_ATTACK_CIVILIAN:
                if (moveTile.hasSettlement()) {
                  if (lb != null) {
                    lb.add([' !FAIL-SETTLEMENT']);
                  }
                  if (!goalDecider.hasSubGoals()) {
                    break ok;
                  }
                  continue;
                }
                if (currentNode.getTurns() <= 0 || moveTile.getAvailableAdjacentCount() < 3) {
                  if (lb != null) {
                    lb.add([' !FAIL-ATTACK']);
                  }
                  if (!goalDecider.hasSubGoals()) {
                    break ok;
                  }
                  continue;
                }
                if (lb != null) {
                  lb.add([' blocked']);
                }
                unitMove = true;
                move = new Map$MoveCandidate()._Map$MoveCandidate(unit, currentNode, moveTile, currentMovesLeft, currentTurns, false, CostDeciders.tileCost());
                break;
              default:
                if (lb != null) {
                  lb.add([' !FAIL-', umt]);
                }
                continue;
            }
          }
          // assert move != null
          stepLog = '@';
        } else {
          let step = (currentOnCarrier) ? ((carrierMove) ? Map$MoveStep.BYWATER : (unitMove) ? Map$MoveStep.DISEMBARK : Map$MoveStep.FAIL) : (carrierMove && !this.usedCarrier(currentNode)) ? Map$MoveStep.EMBARK : (unitMove) ? ((unit.isNaval()) ? Map$MoveStep.BYWATER : Map$MoveStep.BYLAND) : Map$MoveStep.FAIL;
          switch (step) {
            case Map$MoveStep.BYLAND:
              move = new Map$MoveCandidate()._Map$MoveCandidate(unit, currentNode, moveTile, currentMovesLeft, currentTurns, false, costDecider);
              break;
            case Map$MoveStep.BYWATER:
              move = new Map$MoveCandidate()._Map$MoveCandidate(offMapUnit, currentNode, moveTile, currentMovesLeft, currentTurns, currentOnCarrier, costDecider);
              break;
            case Map$MoveStep.EMBARK:
              move = new Map$MoveCandidate()._Map$MoveCandidate(offMapUnit, currentNode, moveTile, currentMovesLeft, currentTurns, true, costDecider);
              move.embarkUnit(carrier);
              break;
            case Map$MoveStep.DISEMBARK:
              move = new Map$MoveCandidate()._Map$MoveCandidate(unit, currentNode, moveTile, 0, currentTurns, false, costDecider);
              break;
            case Map$MoveStep.FAIL:
            default:
              if (lb != null) {
                lb.add(['!']);
              }
              continue;
          }
          stepLog = ' ' + $J.str(step) + '_';
        }
        if (move.cost >= Constants.INFINITY) {
          continue;
        }
        // assert move.getCost() >= 0
        if (closed != null) {
          if (move.canImprove(closed)) {
            closedMap.remove(moveTile.getId());
            move.improve(openMap, openMapQueue, f, sh);
            stepLog += '^' + String(move.getCost());
          } else {
            stepLog += 'v';
          }
        } else {
          if (move.canImprove(openMap.get(moveTile.getId()))) {
            move.improve(openMap, openMapQueue, f, sh);
            stepLog += '+' + String(move.getCost());
          } else {
            stepLog += '-';
          }
        }
        if (lb != null) {
          lb.add([stepLog]);
        }
      }
    }
    best = goalDecider.getGoal();
    if (best != null) {
      while (best.previous_ != null) {
        best.previous_.next_ = best;
        best = best.previous_;
      }
    }
    return best;
  }
  /**
   * Searches for a tile within a radius of a starting tile.
   *
   * Does not use a unit, and thus does not consider movement validity.
   *
   * @param start The starting {@code Tile}.
   * @param goalDecider A {@code GoalDecider} that chooses the goal,
   *     which must be capable of tolerating a null unit.
   * @param radius The maximum radius of tiles to search from the start.
   * @return The goal tile as determined by the, or null if none found.
   */
  searchCircle(start: Tile, goalDecider: GoalDecider, radius: number): Tile {
    if (start == null || goalDecider == null || radius <= 0) {
      return null;
    }
    for (const $it10 = this.getCircleTiles(start, true, radius).iterator(); $it10.hasNext(); ) {
      let t = $it10.next();
      let path = new PathNode()._PathNode(t, 0, start.getDistanceTo(t), false, null, null);
      if (goalDecider.check(null, path) && !goalDecider.hasSubGoals()) {
        break;
      }
    }
    let best = goalDecider.getGoal();
    return (best == null) ? null : best.getTile();
  }
  /**
   * Searches for land within the given radius.
   *
   * @param x X-component of the position to search from.
   * @param y Y-component of the position to search from.
   * @param distance The radius in tiles that should be searched for land.
   * @return The first land tile found within the radius, or null if none
   *     found.
   */
  getLandWithinDistance(x: number, y: number, distance: number): Tile {
    for (const $it11 = this.getCircleTiles(this.getTile$int$int(x, y), true, distance).iterator(); $it11.hasNext(); ) {
      let t = $it11.next();
      if (t.isLand()) {
        return t;
      }
    }
    return null;
  }
  /**
   * Flood fills from a given {@code Position} p, based on
   * connectivity information encoded in boolmap
   *
   * @param boolmap The connectivity information for this floodfill.
   * @param x The starting x coordinate.
   * @param y The starting y coordinate.
   * @return A boolean[][] of the same size as boolmap, where "true"
   *      means the fill succeeded at that location.
   */
  static floodFillBool$booleanArrArr$int$int(boolmap: boolean[][], x: number, y: number): boolean[][] {
    return Map_.floodFillBool$booleanArrArr$int$int$int(boolmap, x, y, 2147483647);
  }
  /**
   * Flood fills from a given {@code Position} p, based on
   * connectivity information encoded in boolmap
   *
   * @param boolmap The connectivity information for this floodfill.
   * @param x The starting x coordinate.
   * @param y The starting y coordinate.
   * @param limit Limit to stop flood fill at.
   * @return A boolean[][] of the same size as boolmap, where "true"
   *      means the fill succeeded at that location.
   */
  static floodFillBool$booleanArrArr$int$int$int(boolmap: boolean[][], x: number, y: number, limit: number): boolean[][] {
    let xmax = boolmap.length;
    let ymax = boolmap[0].length;
    let visited = $J.newArrayN([xmax, ymax], false);
    let q = new LinkedList();
    visited[x][y] = true;
    let p = new Map$Position()._Map$Position$int$int(x, y);
    for (; p != null && --limit > 0; p = q.poll()) {
      for (let d of Direction.values()) {
        let np = new Map$Position()._Map$Position$Position$Direction(p, d);
        if (!np.isValid(xmax, ymax)) {
          continue;
        }
        let nx = np.getX();
        let ny = np.getY();
        if (boolmap[nx][ny] && !visited[nx][ny]) {
          visited[nx][ny] = true;
          q.add(np);
        }
      }
    }
    return visited;
  }
  /**
   * Sets the contiguity identifier for all tiles.
   */
  resetContiguity(): void {
    let xmax = this.getWidth();
    let ymax = this.getHeight();
    let waterMap = $J.newArrayN([xmax, ymax], false);
    for (let y = 0; y < ymax; y++) {
      for (let x = 0; x < xmax; x++) {
        if (this.isValid$int$int(x, y)) {
          waterMap[x][y] = !this.getTile$int$int(x, y).isLand();
          let tile = this.getTile$int$int(x, y);
          tile.setContiguity(-1);
        }
      }
    }
    let contig = 0;
    this.floodFill(contig, ymax, xmax, waterMap);
    for (let y = 0; y < ymax; y++) {
      for (let x = 0; x < xmax; x++) {
        if (this.isValid$int$int(x, y)) {
          waterMap[x][y] = !waterMap[x][y];
        }
      }
    }
    this.floodFill(contig, ymax, xmax, waterMap);
  }
  /**
   * Performs fill flood action and calculations
   *
   * @param contig The contiguity number.
   * @param ymax The Y-value
   * @param xmax The X-value
   * @param waterMap The boolean array containing the x and y coordinates
   */
  floodFill(contig: number, ymax: number, xmax: number, waterMap: boolean[][]): void {
    for (let y = 0; y < ymax; y++) {
      for (let x = 0; x < xmax; x++) {
        if (waterMap[x][y]) {
          let tile = this.getTile$int$int(x, y);
          if (tile.getContiguity() >= 0) {
            continue;
          }
          let found = Map_.floodFillBool$booleanArrArr$int$int(waterMap, x, y);
          for (let yy = 0; yy < ymax; yy++) {
            for (let xx = 0; xx < xmax; xx++) {
              if (found[xx][yy]) {
                let t = this.getTile$int$int(xx, yy);
                if (t.getContiguity() < 0) {
                  t.setContiguity(contig);
                }
              }
            }
          }
          contig++;
        }
      }
    }
  }
  /**
   * Collect lists of valid starting tiles on this map.
   * Called from the map generator to help choose starting tiles
   * for European units.
   *
   * @param eastTiles A list of {@code Tile}s on the east of the map
   *     to fill in.
   * @param westTiles A list of {@code Tile}s on the west of the map
   *     to fill in.
   */
  collectStartingTiles(eastTiles: List<Tile>, westTiles: List<Tile>): void {
    let west = 0;
    let east = (this.getWidth() - 1) | 0;
    eastTiles.clear();
    westTiles.clear();
    for (let y = 0; y < this.getHeight(); y++) {
      let x: number;
      let ok = this.getTile$int$int(east, y);
      if (ok.isDirectlyHighSeasConnected()) {
        for (x = east; x > west; x--) {
          let t = this.getTile$int$int(x, y);
          if (!t.isDirectlyHighSeasConnected()) {
            break;
          }
          ok = t;
        }
        if (ok != null) {
          eastTiles.add(ok);
        }
      }
      ok = this.getTile$int$int(west, y);
      if (ok.isDirectlyHighSeasConnected()) {
        for (x = west; x < east; x++) {
          let t = this.getTile$int$int(x, y);
          if (!t.isDirectlyHighSeasConnected()) {
            break;
          }
          ok = t;
        }
        if (ok != null) {
          westTiles.add(ok);
        }
      }
    }
  }
  /**
   * Places the "high seas"-tiles on the border of this map.
   *
   * All other tiles previously of type High Seas will be set to Ocean.
   *
   * @param distToLandFromHighSeas The distance between the land
   *     and the high seas (given in tiles).
   * @param maxDistanceToEdge The maximum distance a high sea tile
   *     can have from the edge of the map.
   */
  resetHighSeas(distToLandFromHighSeas: number, maxDistanceToEdge: number): void {
    let spec = this.getSpecification();
    let ocean = spec.getTileType('model.tile.ocean');
    let highSeas = spec.getTileType('model.tile.highSeas');
    if (highSeas == null) {
      throw new RuntimeException('HighSeas TileType must exist: ' + $J.str(spec));
    }
    if (ocean == null) {
      throw new RuntimeException('Ocean TileType must exist: ' + $J.str(spec));
    }
    if (distToLandFromHighSeas < 0) {
      throw new RuntimeException('Land<->HighSeas distance can not be negative: ' + distToLandFromHighSeas);
    }
    if (maxDistanceToEdge < 0) {
      throw new RuntimeException('Distance to edge can not be negative: ' + maxDistanceToEdge);
    }
    this.forEachTile$Predicate$Consumer((t) => t.getType() === highSeas, (t) => t.setType(ocean));
    let width = this.getWidth();
    let height = this.getHeight();
    let t: Tile;
    let seaL = null;
    let seaR = null;
    let totalL = 0;
    let totalR = 0;
    let distanceL = -1;
    let distanceR = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < maxDistanceToEdge && x < width && this.isValid$int$int(x, y) && (t = this.getTile$int$int(x, y)).getType() === ocean; x++) {
        let other = this.getLandWithinDistance(x, y, distToLandFromHighSeas);
        if (other == null) {
          t.setType(highSeas);
          totalL++;
        } else {
          let distance = t.getDistanceTo(other);
          if (distanceL < distance) {
            distanceL = distance;
            seaL = t;
          }
        }
      }
      for (let x = 0; x < maxDistanceToEdge && x < width && this.isValid$int$int((width - 1 - x) | 0, y) && (t = this.getTile$int$int((width - 1 - x) | 0, y)).getType() === ocean; x++) {
        let other = this.getLandWithinDistance((width - 1 - x) | 0, y, distToLandFromHighSeas);
        if (other == null) {
          t.setType(highSeas);
          totalR++;
        } else {
          let distance = t.getDistanceTo(other);
          if (distanceR < distance) {
            distanceR = distance;
            seaR = t;
          }
        }
      }
    }
    if (totalL <= 0 && seaL != null) {
      seaL.setType(highSeas);
      totalL++;
    }
    if (totalR <= 0 && seaR != null) {
      seaR.setType(highSeas);
      totalR++;
    }
    if (totalL <= 0 || totalR <= 0) {
      Map_.logger.warning('No high seas on ' + ((totalL <= 0 && totalR <= 0) ? 'either' : (totalL <= 0) ? 'left' : (totalR <= 0) ? 'right' : 'BOGUS') + ' side of the map.  This can cause failures on small test maps.');
    }
  }
  /**
   * Sets the high seas count for all tiles connected to the high seas.
   * Any ocean tiles on the map vertical edges that do not have an
   * explicit false moveToEurope attribute are given a true one.
   *
   * Set all high seas counts negative, then start with a count of
   * zero for tiles with the moveToEurope attribute or of a type
   * with that ability.  Iterate outward by neighbouring tile,
   * incrementing the count on each pass, stopping at land.  Thus,
   * only the coastal land tiles will have a non-negative high seas
   * count.  This significantly speeds up the colony site evaluator,
   * as it does not have to try to find a path to Europe for each
   * tile.
   */
  resetHighSeasCount(): void {
    let curr = new ArrayList();
    let next = new ArrayList();
    let hsc = 0;
    for (const $it12 = this.tileList.iterator(); $it12.hasNext(); ) {
      let t = $it12.next();
      t.setHighSeasCount(-1);
      if (!t.isLand()) {
        if ((t.getX() === 0 || t.getX() === ((this.getWidth() - 1) | 0)) && t.getType() != null && t.getType().isHighSeasConnected() && !t.getType().isDirectlyHighSeasConnected() && t.getMoveToEurope() == null) {
          t.setMoveToEurope(true);
        }
        if (t.isDirectlyHighSeasConnected()) {
          t.setHighSeasCount(0);
          next.add(t);
        }
      }
    }
    while (!next.isEmpty()) {
      hsc++;
      curr.addAll(next);
      next.clear();
      while (!curr.isEmpty()) {
        let tile = curr.removeAt(0);
        let position = new Map$Position()._Map$Position$int$int(tile.getX(), tile.getY());
        for (const $it13 = (CollectionUtils.transform$ObjectArr$Predicate$Function(Direction.values(), CollectionUtils.alwaysTrue(), (d) => new Map$Position()._Map$Position$Position$Direction(position, d))).iterator(); $it13.hasNext(); ) {
          let p = $it13.next();
          if (this.isValid$Position(p)) {
            let t = this.getTile$Position(p);
            if (t.getHighSeasCount() < 0) {
              t.setHighSeasCount(hsc);
              if (!t.isLand()) {
                next.add(t);
              }
            }
          }
        }
      }
    }
  }
  /**
   * Reset layer to reflect what is actually there.
   */
  resetLayers(): void {
    let regions = false;
    let rivers = false;
    let lostCityRumours = false;
    let resources = false;
    let nativeSettlements = false;
    let hgt = this.getHeight();
    let wid = this.getWidth();
    for (let y = 0; y < hgt; y++) {
      for (let x = 0; x < wid; x++) {
        let t = this.getTile$int$int(x, y);
        regions = !!(regions | t.getRegion() != null);
        rivers = !!(rivers | t.hasRiver());
        lostCityRumours = !!(lostCityRumours | t.hasLostCityRumour());
        resources = !!(resources | t.hasResource());
        nativeSettlements = !!(nativeSettlements | t.getSettlement() instanceof IndianSettlement);
      }
    }
    this.setLayer((rivers && lostCityRumours && resources && nativeSettlements) ? Map$Layer.ALL : (nativeSettlements) ? Map$Layer.NATIVES : (lostCityRumours) ? Map$Layer.RUMOURS : (resources) ? Map$Layer.RESOURCES : (rivers) ? Map$Layer.RIVERS : (regions) ? Map$Layer.REGIONS : Map$Layer.TERRAIN);
  }
  /**
   * Fix the region parent/child relationships.
   */
  fixupRegions(): void {
    for (const $it14 = (CollectionUtils.transform$Collection$Predicate(this.getRegions(), (r) => !r.isPacific())).iterator(); $it14.hasNext(); ) {
      let r = $it14.next();
      let p = r.getParent();
      if (p != null && p.getDiscoverable() && r.getDiscoverable()) {
        p = p.getParent();
        r.setParent(p);
      }
      if (p != null && !p.getChildren().contains(r)) {
        p.addChild(r);
      }
    }
  }
  /**
   * Import a tile, possibly from another game.
   *
   * @param other The <code>Tile</code> to import.
   * @param x The x-coordinate of the new tile.
   * @param y The y-coordinate of the new tile.
   * @param layer The maximum layer to import.
   * @return The new imported <code>Tile</code>.
   */
  importTile(other: Tile, x: number, y: number, layer: Map$Layer): Tile {
    let game = this.getGame();
    let t = new Tile()._Tile$Game$TileType$int$int(game, other.getType(), x, y);
    if (other.getMoveToEurope() != null) {
      t.setMoveToEurope(other.getMoveToEurope());
    }
    if (other.getTileItemContainer() != null) {
      let container = new TileItemContainer()._TileItemContainer$Game$Tile(game, t);
      container.copyFrom(other.getTileItemContainer(), layer);
      t.setTileItemContainer(container);
    }
    return t;
  }
  /**
   * Scale the map into the specified size.
   *
   * This implementation uses a simple linear scaling, and
   * the isometric shape is not taken into account.
   *
   * FIXME: Find a better method for choosing a group of
   * adjacent tiles.  This group can then be merged into a
   * common tile by using the average value (for example: are
   * there a majority of ocean tiles?).
   *
   * @param width The width of the resulting map.
   * @param height The height of the resulting map.
   * @return A scaled version of this map.
   */
  scale(width: number, height: number): Map_ {
    let game = this.getGame();
    let ret = new Map_()._Map$Game$int$int(game, width, height);
    let oldWidth = this.getWidth();
    let oldHeight = this.getHeight();
    ret.populateTiles((x, y) => {
      let oldX = $J.idiv((Math.imul(x, oldWidth)), width);
      let oldY = $J.idiv((Math.imul(y, oldHeight)), height);
      return this.importTile(this.getTile$int$int(oldX, oldY), x, y, Map$Layer.ALL);
    });
    ret.resetContiguity();
    ret.resetHighSeasCount();
    return ret;
  }
  /**
   * Gets the location tile.  Obviously not applicable to a Map.
   *
   * @return Null.
   */
  getTile$(): Tile {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabel(): StringTemplate {
    return StringTemplate.key$String('newWorld');
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabelFor(player: Player): StringTemplate {
    let name = player.getNewLandName();
    return (name == null) ? this.getLocationLabel() : StringTemplate.name_(name);
  }
  /**
   * {@inheritDoc}
   */
  add(locatable: Locatable): boolean {
    if (locatable instanceof Unit) {
      throw new RuntimeException('Disabled Map.add(Unit): ' + $J.str(locatable));
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  remove(locatable: Locatable): boolean {
    if (locatable instanceof Unit) {
      let tile = locatable.getTile$();
      if (tile != null) {
        return tile.remove(locatable);
      }
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  contains(locatable: Locatable): boolean {
    return locatable instanceof Unit && locatable.getLocation() != null && locatable.getLocation().getTile$() != null;
  }
  /**
   * {@inheritDoc}
   */
  canAdd(locatable: Locatable): boolean {
    return locatable instanceof Unit;
  }
  /**
   * {@inheritDoc}
   */
  getUnitCount(): number {
    return -1;
  }
  /**
   * {@inheritDoc}
   */
  getUnits(): Stream<Unit> {
    return Stream.empty();
  }
  /**
   * {@inheritDoc}
   */
  getUnitList(): List<Unit> {
    return Collections.emptyList();
  }
  /**
   * {@inheritDoc}
   */
  getGoodsContainer(): GoodsContainer {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  getSettlement(): Settlement {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  getColony(): Colony {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  getIndianSettlement(): IndianSettlement {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  up(): Location {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getRank(): number {
    return Location.LOCATION_RANK_NOWHERE;
  }
  /**
   * {@inheritDoc}
   */
  toShortString(): string {
    return 'Map';
  }
  /**
   * {@inheritDoc}
   */
  getLocationImageKey(): string {
    return ImageLibrary.LOST_CITY_RUMOUR;
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity(fix, lb);
    let hgt = this.getHeight();
    let wid = this.getWidth();
    for (let y = 0; y < hgt; y++) {
      for (let x = 0; x < wid; x++) {
        let t = this.getTile$int$int(x, y);
        result = result.combine(t.checkIntegrity(fix, lb));
      }
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Map_));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    let err = this.updateTiles(o.getWidth(), o.getHeight());
    if (err != null) {
      throw new RuntimeException('copyIn failure, ' + err);
    }
    this.clearRegions();
    for (const $it15 = o.getRegions().iterator(); $it15.hasNext(); ) {
      let r = $it15.next();
      this.addRegion(game.update$FreeColGameObject$boolean(r, true));
    }
    o.forEachTile$Consumer((t) => this.updateTile(game.update$FreeColGameObject$boolean(t, true)));
    this.layer = o.getLayer();
    this.minimumLatitude = o.getMinimumLatitude();
    this.maximumLatitude = o.getMaximumLatitude();
    this.latitudePerRow = o.getLatitudePerRow();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(Map_.WIDTH_TAG, this.getWidth());
    xw.writeAttribute$String$int(Map_.HEIGHT_TAG, this.getHeight());
    xw.writeAttribute$String$Enum(Map_.LAYER_TAG, this.layer);
    xw.writeAttribute$String$int(Map_.MINIMUM_LATITUDE_TAG, this.minimumLatitude);
    xw.writeAttribute$String$int(Map_.MAXIMUM_LATITUDE_TAG, this.maximumLatitude);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it16 = CollectionUtils.sort$Collection(this.getRegions()).iterator(); $it16.hasNext(); ) {
      let region = $it16.next();
      region.toXML$FreeColXMLWriter(xw);
    }
    let hgt = this.getHeight();
    let wid = this.getWidth();
    for (let y = 0; y < hgt; y++) {
      for (let x = 0; x < wid; x++) {
        this.getTile$int$int(x, y).toXML$FreeColXMLWriter(xw);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let err = this.updateTiles(xr.getAttribute$String$int(Map_.WIDTH_TAG, -1), xr.getAttribute$String$int(Map_.HEIGHT_TAG, -1));
    if (err != null) {
      throw new XMLStreamException('Map.readAttributes failure, ' + err);
    }
    this.setLayer(xr.getAttribute$String$Class$Enum(Map_.LAYER_TAG, $J.cls(Map$Layer), Map$Layer.ALL));
    this.minimumLatitude = xr.getAttribute$String$int(Map_.MINIMUM_LATITUDE_TAG, -90);
    this.maximumLatitude = xr.getAttribute$String$int(Map_.MAXIMUM_LATITUDE_TAG, 90);
    this.calculateLatitudePerRow();
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    super.readChildren(xr);
    this.forEachTile$Consumer((t) => {
      let s = t.getOwningSettlement();
      if (s != null) {
        s.addTile(t);
      }
    });
    this.fixupRegions();
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let game = this.getGame();
    let tag = xr.getLocalName();
    if ($J.equals(Region.TAG, tag)) {
      this.addRegion(xr.readFreeColObject$Game$Class(game, $J.cls(Region)));
    } else if ($J.equals(Tile.TAG, tag)) {
      let t = xr.readFreeColObject$Game$Class(game, $J.cls(Tile));
      if (!this.updateTile(t)) {
        Map_.logger.warning('Tile update failure for: ' + $J.str(t));
      }
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Map_.TAG;
  }
  static $clinit() {
    Map_.logger = Logger.getLogger($J.cls(Map_).getName());
  }
}

/**
 * Possible actions by the unit travelling along a path in consideration
 * of the next tile.
 */
export class Map$MoveStep extends JEnum {
  static FAIL: Map$MoveStep = null;
  static BYLAND: Map$MoveStep = null;
  static BYWATER: Map$MoveStep = null;
  static EMBARK: Map$MoveStep = null;
  static DISEMBARK: Map$MoveStep = null;
  static $VALUES: Map$MoveStep[] = null;
  _Map$MoveStep($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Map$MoveStep[] { return Map$MoveStep.$VALUES.slice(); }
  static valueOf(name: string): Map$MoveStep { return $J.enumValueOf(Map$MoveStep, name); }
  static $clinit() {
    Map$MoveStep.FAIL = new Map$MoveStep()._Map$MoveStep('FAIL', 0);
    Map$MoveStep.BYLAND = new Map$MoveStep()._Map$MoveStep('BYLAND', 1);
    Map$MoveStep.BYWATER = new Map$MoveStep()._Map$MoveStep('BYWATER', 2);
    Map$MoveStep.EMBARK = new Map$MoveStep()._Map$MoveStep('EMBARK', 3);
    Map$MoveStep.DISEMBARK = new Map$MoveStep()._Map$MoveStep('DISEMBARK', 4);
    Map$MoveStep.$VALUES = [Map$MoveStep.FAIL, Map$MoveStep.BYLAND, Map$MoveStep.BYWATER, Map$MoveStep.EMBARK, Map$MoveStep.DISEMBARK];
  }
}

/**
 * The layers included in the map. The RIVERS layer includes all
 * natural tile improvements that are not resources.
 */
export class Map$Layer extends JEnum {
  static NONE: Map$Layer = null;
  static LAND: Map$Layer = null;
  static TERRAIN: Map$Layer = null;
  static REGIONS: Map$Layer = null;
  static RIVERS: Map$Layer = null;
  static RESOURCES: Map$Layer = null;
  static RUMOURS: Map$Layer = null;
  static NATIVES: Map$Layer = null;
  static ALL: Map$Layer = null;
  static $VALUES: Map$Layer[] = null;
  _Map$Layer($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Map$Layer[] { return Map$Layer.$VALUES.slice(); }
  static valueOf(name: string): Map$Layer { return $J.enumValueOf(Map$Layer, name); }
  static $clinit() {
    Map$Layer.NONE = new Map$Layer()._Map$Layer('NONE', 0);
    Map$Layer.LAND = new Map$Layer()._Map$Layer('LAND', 1);
    Map$Layer.TERRAIN = new Map$Layer()._Map$Layer('TERRAIN', 2);
    Map$Layer.REGIONS = new Map$Layer()._Map$Layer('REGIONS', 3);
    Map$Layer.RIVERS = new Map$Layer()._Map$Layer('RIVERS', 4);
    Map$Layer.RESOURCES = new Map$Layer()._Map$Layer('RESOURCES', 5);
    Map$Layer.RUMOURS = new Map$Layer()._Map$Layer('RUMOURS', 6);
    Map$Layer.NATIVES = new Map$Layer()._Map$Layer('NATIVES', 7);
    Map$Layer.ALL = new Map$Layer()._Map$Layer('ALL', 8);
    Map$Layer.$VALUES = [Map$Layer.NONE, Map$Layer.LAND, Map$Layer.TERRAIN, Map$Layer.REGIONS, Map$Layer.RIVERS, Map$Layer.RESOURCES, Map$Layer.RUMOURS, Map$Layer.NATIVES, Map$Layer.ALL];
  }
}

/**
 * A position on the Map.
 */
export class Map$Position extends JObject {
  /**
   * The coordinates of the position.
   */
  x_: number = 0;
  /**
   * The coordinates of the position.
   */
  y_: number = 0;
  /**
   * Creates a new {@code Position} object with the given
   * coordinates.
   *
   * @param posX The x-coordinate for this position.
   * @param posY The y-coordinate for this position.
   */
  _Map$Position$int$int(posX: number, posY: number): this {
    this.x_ = posX;
    this.y_ = posY;
    return this;
  }
  /**
   * Creates a new {@code Position} object with the coordinates
   * of a supplied tile.
   *
   * @param tile The {@code Tile} to extract coordinates from.
   */
  _Map$Position$Tile(tile: Tile): this {
    this._Map$Position$int$int(tile.getX(), tile.getY());
    return this;
  }
  /**
   * Creates a new {@code Position} from an existing one with
   * an optional step in a given direction.
   *
   * @param start The starting {@code Position}.
   * @param direction An optional {@code Direction} to step.
   */
  _Map$Position$Position$Direction(start: Map$Position, direction: Direction): this {
    let step = (direction == null) ? start : direction.step(start.x_, start.y_);
    this.x_ = step.x_;
    this.y_ = step.y_;
    return this;
  }
  /**
   * Gets the x-coordinate of this Position.
   *
   * @return The x-coordinate of this Position.
   */
  getX(): number {
    return this.x_;
  }
  /**
   * Gets the y-coordinate of this Position.
   *
   * @return The y-coordinate of this Position.
   */
  getY(): number {
    return this.y_;
  }
  /**
   * Checks whether a position is valid within a given map size.
   *
   * @param width The width of the map.
   * @param height The height of the map.
   * @return True if the given position is within the bounds of the map.
   */
  isValid(width: number, height: number): boolean {
    return Map_.inBox(this.x_, this.y_, width, height);
  }
  /**
   * Gets the distance in tiles between two map positions.
   * With an isometric map this is a non-trivial task.
   * The formula below has been developed largely through trial and
   * error.  It should cover all cases, but I wouldn't bet my
   * life on it.
   *
   * @param ax The x-coordinate of the first position.
   * @param ay The y-coordinate of the first position.
   * @param bx The x-coordinate of the second position.
   * @param by The y-coordinate of the second position.
   * @return The distance in tiles between the positions.
   */
  static getXYDistance(ax: number, ay: number, bx: number, by: number): number {
    let r = (bx - ax - $J.idiv(((ay - by) | 0), 2)) | 0;
    if (by > ay && ay % 2 === 0 && by % 2 !== 0) {
      r++;
    } else if (by < ay && ay % 2 !== 0 && by % 2 === 0) {
      r--;
    }
    return Math.max(Math.abs((ay - by + r) | 0), Math.abs(r));
  }
  /**
   * Gets the distance in tiles between two map positions.
   * With an isometric map this is a non-trivial task.
   * The formula below has been developed largely through trial and
   * error.  It should cover all cases, but I wouldn't bet my
   * life on it.
   *
   * @param position The other {@code Position} to compare.
   * @return The distance in tiles to the other position.
   */
  getDistance(position: Map$Position): number {
    return Map$Position.getXYDistance(this.getX(), this.getY(), position.getX(), position.getY());
  }
  /**
   * Get the direction from this position to an adjacent position.
   *
   * @param other The adjacent {@code Position}.
   * @return The {@code Direction}, or null if not adjacent.
   */
  getDirection(other: Map$Position): Direction {
    return CollectionUtils.find$ObjectArr$Predicate(Direction.values(), CollectionUtils.matchKeyEquals$Object$Function(other, (d) => new Map$Position()._Map$Position$Position$Direction(this, d)));
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof Map$Position) {
      let other = o;
      return this.x_ === other.x_ && this.y_ === other.y_;
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    return this.x_ | (this.y_ << 16);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return '(' + this.x_ + ', ' + this.y_ + ')';
  }
}

/**
 * An iterator returning positions in a spiral starting at a given
 * center tile.  The center tile is never included in the returned
 * tiles, and all returned tiles are valid.
 */
export class Map$CircleIterator extends JObject {
  /**
   * The maximum radius.
   */
  radius: number = 0;
  /**
   * The current radius of the iteration.
   */
  currentRadius: number = 0;
  /**
   * The current index in the circle with the current radius:
   */
  n: number = 0;
  /**
   * The current position in the circle.
   */
  x_: number = 0;
  /**
   * The current position in the circle.
   */
  y_: number = 0;
  /**
   * Create a new Circle Iterator.
   *
   * @param center The center {@code Tile} of the circle.
   * @param isFilled True to get all of the positions within the circle.
   * @param radius The radius of the circle.
   */
  _Map$CircleIterator(center: Tile, isFilled: boolean, radius: number): this {
    if (center == null) {
      throw new RuntimeException('center must not be null: ' + $J.str(this));
    }
    this.radius = radius;
    this.n = 0;
    let step: Map$Position;
    if (radius <= 0) {
      this.x_ = this.y_ = Constants.UNDEFINED;
    } else if (isFilled || radius === 1) {
      step = Direction.NE.step(center.getX(), center.getY());
      this.x_ = step.x_;
      this.y_ = step.y_;
      this.currentRadius = 1;
    } else {
      this.currentRadius = radius;
      this.x_ = center.getX();
      this.y_ = center.getY();
      for (let i = 1; i < radius; i++) {
        step = Direction.N.step(this.x_, this.y_);
        this.x_ = step.x_;
        this.y_ = step.y_;
      }
      step = Direction.NE.step(this.x_, this.y_);
      this.x_ = step.x_;
      this.y_ = step.y_;
    }
    if (!this.$outer.isValid$int$int(this.x_, this.y_)) {
      this.nextTile();
    }
    return this;
  }
  /**
   * Gets the current radius of the circle.
   *
   * @return The distance from the center tile this
   *     {@code CircleIterator} was initialized with.
   */
  getCurrentRadius(): number {
    return this.currentRadius;
  }
  /**
   * Finds the next position.
   */
  nextTile(): void {
    let started = this.n !== 0;
    do {
      this.n++;
      let width = Math.imul(this.currentRadius, 2);
      if (this.n >= Math.imul(width, 4)) {
        this.currentRadius++;
        if (this.currentRadius > this.radius) {
          this.x_ = this.y_ = Constants.UNDEFINED;
          break;
        } else if (!started) {
          this.x_ = this.y_ = Constants.UNDEFINED;
          break;
        } else {
          this.n = 0;
          started = false;
          let step = Direction.NE.step(this.x_, this.y_);
          this.x_ = step.x_;
          this.y_ = step.y_;
        }
      } else {
        let i = $J.idiv(this.n, width);
        let direction: Direction;
        switch (i) {
          case 0:
            direction = Direction.SE;
            break;
          case 1:
            direction = Direction.SW;
            break;
          case 2:
            direction = Direction.NW;
            break;
          case 3:
            direction = Direction.NE;
            break;
          default:
            throw new IllegalStateException('i=' + i + ', n=' + this.n + ', width=' + width);
        }
        let step = direction.step(this.x_, this.y_);
        this.x_ = step.x_;
        this.y_ = step.y_;
      }
    } while (!this.$outer.isValid$int$int(this.x_, this.y_));
  }
  /**
   * {@inheritDoc}
   */
  hasNext(): boolean {
    return this.x_ !== Constants.UNDEFINED && this.y_ !== Constants.UNDEFINED;
  }
  /**
   * {@inheritDoc}
   */
  next(): Tile {
    if (!this.hasNext()) {
      throw new NoSuchElementException('CircleIterator exhausted: ' + this.n);
    }
    let result = this.$outer.getTile$int$int(this.x_, this.y_);
    this.nextTile();
    return result;
  }
  /**
   * {@inheritDoc}
   */
  remove(): void {
    throw new UnsupportedOperationException();
  }
}

/**
 * Simple interface to supply a heuristic to the A* routine.
 */
export class Map$SearchHeuristic {
}

/**
 * Internal class for evaluating a candidate move.
 */
export class Map$MoveCandidate extends JObject {
  unit: Unit = null;
  current_: PathNode = null;
  dst: Location = null;
  movesLeft: number = 0;
  turns: number = 0;
  onCarrier: boolean = false;
  cost: number = 0;
  /**
   * Creates a new move candidate where a cost decider will be used
   * to work out the new moves and turns left.
   *
   * @param unit The {@code Unit} to move.
   * @param current The current position on the path.
   * @param dst The {@code Location} to move to.
   * @param movesLeft The initial number of moves left.
   * @param turns The initial number of turns.
   * @param onCarrier Will the new move be on a carrier.
   * @param decider The {@code CostDecider} to use.
   */
  _Map$MoveCandidate(unit: Unit, current: PathNode, dst: Location, movesLeft: number, turns: number, onCarrier: boolean, decider: CostDecider): this {
    this.unit = unit;
    this.current_ = current;
    this.dst = dst;
    this.movesLeft = movesLeft;
    this.turns = turns;
    this.onCarrier = onCarrier;
    let cd = (decider != null) ? decider : CostDeciders.defaultCostDeciderFor(unit);
    this.cost = cd.getCost(unit, current.getLocation(), dst, movesLeft);
    if (this.cost === CostDecider.ILLEGAL_MOVE) {
      if (dst.getTile$() != null && !dst.getTile$().isExplored()) {
        this.turns = (this.turns + 2) | 0;
        this.movesLeft = 0;
        this.cost = PathNode.getNodeCost(this.turns, this.movesLeft);
      } else {
        this.turns = Constants.INFINITY;
        this.movesLeft = 0;
        this.cost = Constants.INFINITY;
      }
    } else {
      this.turns = (this.turns + cd.getNewTurns()) | 0;
      this.movesLeft = cd.getMovesLeft();
      this.cost = PathNode.getNodeCost(this.turns, this.movesLeft);
    }
    return this;
  }
  /**
   * Get the cost.
   *
   * @return The current move cost.
   */
  getCost(): number {
    return this.cost;
  }
  /**
   * Handles the change of unit as a result of an embark.
   *
   * @param unit The {@code Unit} to embark.
   */
  embarkUnit(unit: Unit): void {
    this.unit = unit;
    this.movesLeft = unit.getInitialMovesLeft();
    this.turns++;
    this.cost = PathNode.getNodeCost(this.turns, this.movesLeft);
  }
  /**
   * Does this move candidate improve on a specified move.
   *
   * @param best The {@code PathNode} to compare against.
   * @return True if this candidate is an improvement.
   */
  canImprove(best: PathNode): boolean {
    return best == null || this.cost < best.getCost();
  }
  /**
   * Replace a given path with that of this candidate move.
   *
   * @param openMap The list of available nodes.
   * @param openMapQueue The queue of available nodes.
   * @param f The heuristic values for A*.
   * @param sh A {@code SearchHeuristic} to apply.
   */
  improve(openMap: HashMap<string, PathNode>, openMapQueue: PriorityQueue<PathNode>, f: HashMap<string, number>, sh: Map$SearchHeuristic): void {
    let best = openMap.get(this.dst.getId());
    if (best != null) {
      openMap.remove(this.dst.getId());
      openMapQueue.remove(best);
    }
    this.add(openMap, openMapQueue, f, sh);
  }
  /**
   * Add this candidate to the open map+queue.
   *
   * @param openMap The list of available nodes.
   * @param openMapQueue The queue of available nodes.
   * @param f The map of f-values.
   * @param sh A {@code SearchHeuristic} to apply.
   */
  add(openMap: HashMap<string, PathNode>, openMapQueue: PriorityQueue<PathNode>, f: HashMap<string, number>, sh: Map$SearchHeuristic): void {
    let fcost = this.cost;
    if (this.dst.getTile$() != null) {
      fcost = (fcost + $J.fn(sh, 'getValue')(this.dst.getTile$())) | 0;
    }
    f.put(this.dst.getId(), fcost);
    let path = new PathNode()._PathNode(this.dst, this.movesLeft, this.turns, this.onCarrier, this.current_, null);
    openMap.put(this.dst.getId(), path);
    openMapQueue.offer(path);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(128);
    sb.append('[candidate unit=').append($J.str(this.unit)).append(' dst=').append($J.str(this.dst)).append(' movesLeft=').append(String(this.movesLeft)).append(' turns=').append(String(this.turns)).append(' onCarrier=').append(String(this.onCarrier)).append(' cost=').append(String(this.cost)).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

let $Map$1: any = null;
/** An anonymous class (Map.java:1149). */
function Map$1(): any {
  return $Map$1 ??= $J.local(class extends JObject {
    iterator(): Iterator<Tile> {
      return this.$outer.getCircleIterator(this.$cv_center, this.$cv_isFilled, this.$cv_radius);
    }
    $c($center, $isFilled, $radius): this {
      this.$cv_center = $center; this.$cv_isFilled = $isFilled; this.$cv_radius = $radius;
      return this;
    }
  }, 'net.sf.freecol.common.model.Map$1', ['java.lang.Iterable']);
}

$J.define(Map_, 'net.sf.freecol.common.model.Map', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Location', 'java.lang.Iterable'], sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_Map$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_Map$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game,int,int': '_Map$Game$int$int' }, returns: { 'getXMLTagName': 'java.lang.String', 'getLocationImageKey': 'java.lang.String', 'getRank': 'int', 'getIndianSettlement': 'net.sf.freecol.common.model.IndianSettlement', 'getColony': 'net.sf.freecol.common.model.Colony', 'getSettlement': 'net.sf.freecol.common.model.Settlement', 'getGoodsContainer': 'net.sf.freecol.common.model.GoodsContainer', 'getUnitList': 'java.util.List', 'getUnits': 'java.util.stream.Stream', 'getUnitCount': 'int', 'getLocationLabel': 'net.sf.freecol.common.model.StringTemplate', 'getTile$': 'net.sf.freecol.common.model.Tile', 'getSearchTrace': 'boolean', 'getFixedRegions': 'java.util.Map', 'getRegions': 'java.util.Collection', 'getLatitudePerRow': 'float', 'getMaximumLatitude': 'int', 'getMinimumLatitude': 'int', 'getLayer': 'net.sf.freecol.common.model.Map$Layer', 'getHeight': 'int', 'getWidth': 'int' }, meths: { 'getTile()': 'getTile$', 'floodFillBool(boolean[][],int,int,int)': 'floodFillBool$booleanArrArr$int$int$int', 'floodFillBool(boolean[][],int,int)': 'floodFillBool$booleanArrArr$int$int', 'forEachTile(java.util.function.Predicate,java.util.function.Consumer)': 'forEachTile$Predicate$Consumer', 'forEachTile(java.util.function.Consumer)': 'forEachTile$Consumer', 'getAdjacentTile(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.Direction)': 'getAdjacentTile$Tile$Direction', 'getAdjacentTile(int,int,net.sf.freecol.common.model.Direction)': 'getAdjacentTile$int$int$Direction', 'getTile(net.sf.freecol.common.model.Map$Position)': 'getTile$Position', 'getTile(int,int)': 'getTile$int$int', 'isValid(net.sf.freecol.common.model.Map$Position)': 'isValid$Position', 'isValid(int,int)': 'isValid$int$int' }, clinit: true, lazy: ['logger'] });
$J.define(Map$MoveStep, 'net.sf.freecol.common.model.Map$MoveStep', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Map$MoveStep' }, clinit: true, lazy: ['$VALUES', 'FAIL', 'BYLAND', 'BYWATER', 'EMBARK', 'DISEMBARK'] });
$J.define(Map$Layer, 'net.sf.freecol.common.model.Map$Layer', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Map$Layer' }, clinit: true, lazy: ['$VALUES', 'NONE', 'LAND', 'TERRAIN', 'REGIONS', 'RIVERS', 'RESOURCES', 'RUMOURS', 'NATIVES', 'ALL'] });
$J.define(Map$Position, 'net.sf.freecol.common.model.Map$Position', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Map$Position,net.sf.freecol.common.model.Direction': '_Map$Position$Position$Direction', 'net.sf.freecol.common.model.Tile': '_Map$Position$Tile', 'int,int': '_Map$Position$int$int' }, returns: { 'hashCode': 'int', 'getY': 'int', 'getX': 'int' } });
$J.define(Map$CircleIterator, 'net.sf.freecol.common.model.Map$CircleIterator', { kind: 'class', ifaces: ['java.util.Iterator'], sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Tile,boolean,int': '_Map$CircleIterator' }, returns: { 'hasNext': 'boolean', 'getCurrentRadius': 'int' }, inner: true });
$J.define(Map$SearchHeuristic, 'net.sf.freecol.common.model.Map$SearchHeuristic', { kind: 'interface' });
$J.define(Map$MoveCandidate, 'net.sf.freecol.common.model.Map$MoveCandidate', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.PathNode,net.sf.freecol.common.model.Location,int,int,boolean,net.sf.freecol.common.model.pathfinding.CostDecider': '_Map$MoveCandidate' }, returns: { 'getCost': 'int' } });
$J.module(() => {
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Location = $J.load('net.sf.freecol.common.model.Location');
  PathNode = $J.load('net.sf.freecol.common.model.PathNode');
  Region = $J.load('net.sf.freecol.common.model.Region');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  TileItemContainer = $J.load('net.sf.freecol.common.model.TileItemContainer');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDecider = $J.load('net.sf.freecol.common.model.pathfinding.CostDecider');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  GoalDeciders = $J.load('net.sf.freecol.common.model.pathfinding.GoalDeciders');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
});
