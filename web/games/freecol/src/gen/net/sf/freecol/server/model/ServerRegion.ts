// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/ServerRegion.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, LinkedList, StringBuilder } from '../../../../../../jre/index.ts';
import { Region } from '../../common/model/Region.ts';

let Rectangle, Direction, HistoryEvent, HistoryEvent$HistoryEventType, Map_, Region$RegionType, ChangeSet$See, GameOptions;

/**
 * The server version of a region.
 */
export class ServerRegion extends Region {
  /**
   * Score for being first to discover the pacific.
   */
  static readonly PACIFIC_SCORE_VALUE: number = 100;
  /**
   * The size of this Region (number of Tiles).
   */
  size_: number = 0;
  /**
   * A Rectangle that contains all points of the Region.
   */
  bounds_: Rectangle = null;
  $init_ServerRegion() {
    this.size_ = 0;
    this.bounds_ = new Rectangle()._Rectangle$();
  }
  /**
   * Trivial constructor for serialization.
   *
   * @param game The {@code Game} to create in.
   * @param id The object identifier.
   */
  _ServerRegion$Game$String(game: Game, id: string): this {
    this._Region$Game$String(game, id);
    this.$init_ServerRegion();
    return this;
  }
  /**
   * Constructor for copying in a new region from an imported game.
   *
   * @param game The {@code Game} to create in.
   * @param region A {@code Region} to copy.
   */
  _ServerRegion$Game$Region(game: Game, region: Region): this {
    this._Region$Game(game);
    this.$init_ServerRegion();
    this.name = region.getName();
    this.key = region.getKey();
    this.type = region.getType();
    this.parent = null;
    this.claimable = region.getClaimable();
    this.discoverable = region.getDiscoverable();
    this.discoveredIn = region.getDiscoveredIn();
    this.discoveredBy = region.getDiscoveredBy();
    this.scoreValue = region.getScoreValue();
    return this;
  }
  /**
   * Create a new discoverable server region of a given type.
   *
   * @param game The {@code Game} to create in.
   * @param type The {@code RegionType} to use.
   */
  _ServerRegion$Game$RegionType(game: Game, type$: Region$RegionType): this {
    this._ServerRegion$Game$String$RegionType$Region(game, null, type$, null);
    this.setClaimable(type$.getClaimable());
    this.setDiscoverable(true);
    return this;
  }
  /**
   * Create a new fixed server region.
   *
   * @param map The {@code Map} to create in.
   * @param key The key for the region.
   * @param type The {@code RegionType} to use.
   * @param parent The {@code Region} to be the parent of this one.
   */
  _ServerRegion$Map$String$RegionType$Region(map: Map_, key: string, type$: Region$RegionType, parent: Region): this {
    this._ServerRegion$Game$String$RegionType$Region(map.getGame(), key, type$, parent);
    map.addRegion(this);
    return this;
  }
  /**
   * Create a new fixed server region.
   *
   * @param game The {@code Game} to create in.
   * @param key The key for the region.
   * @param type The {@code RegionType} to use.
   * @param parent The {@code Region} to be the parent of this one.
   */
  _ServerRegion$Game$String$RegionType$Region(game: Game, key: string, type$: Region$RegionType, parent: Region): this {
    this._Region$Game(game);
    this.$init_ServerRegion();
    this.key = key;
    this.name = null;
    this.type = type$;
    this.parent = parent;
    if (this.parent != null) {
      this.parent.addChild(this);
    }
    this.claimable = false;
    this.discoverable = false;
    this.discoveredIn = null;
    this.discoveredBy = null;
    this.scoreValue = 0;
    return this;
  }
  /**
   * Get the number of tiles in this region.
   *
   * @return The number of tiles in this region.
   */
  getSize(): number {
    return this.size_;
  }
  /**
   * Set the number of tiles in this region.
   *
   * @param size The new number of tiles.
   */
  setSize(size: number): void {
    this.size_ = size;
  }
  /**
   * Get the bounding rectangle for this region.
   *
   * @return The bounding {@code Rectangle}.
   */
  getBounds(): Rectangle {
    return this.bounds_;
  }
  /**
   * Is this a geographic region?
   *
   * @return True if this is a geographic region.
   */
  isGeographic(): boolean {
    return this.key != null && this.type === Region$RegionType.LAND;
  }
  /**
   * Get the center of the regions bounds.
   *
   * @return An two member array [x,y] of the center coordinate.
   */
  getCenter(): number[] {
    return [(this.bounds_.x_ + $J.idiv(this.bounds_.width_, 2)) | 0, (this.bounds_.y_ + $J.idiv(this.bounds_.height_, 2)) | 0];
  }
  /**
   * Does this region contain the center of another?
   *
   * @param other The other {@code ServerRegion} to check.
   * @return True if the center of the other region is within this one.
   */
  containsCenter(other: ServerRegion): boolean {
    let xy = other.getCenter();
    return this.bounds_.contains$int$int(xy[0], xy[1]);
  }
  /**
   * Add the given tile to this region.
   *
   * @param tile A {@code Tile} to add.
   */
  addTile(tile: Tile): void {
    tile.setRegion(this);
    this.size_++;
    if (this.bounds_.x_ === 0 && this.bounds_.width_ === 0 || this.bounds_.y_ === 0 && this.bounds_.height_ === 0) {
      this.bounds_.setBounds$int$int$int$int(tile.getX(), tile.getY(), 0, 0);
    } else {
      this.bounds_.add$int$int(tile.getX(), tile.getY());
    }
  }
  /**
   * Discover this region.
   *
   * @param player The discovering {@code Player}.
   * @param unit The discovering {@code Unit}.
   * @param turn The discovery {@code Turn}.
   * @param newName The name of the region.
   * @param cs A {@code ChangeSet} to update.
   */
  csDiscover(player: Player, unit: Unit, turn: Turn, newName: string, cs: ChangeSet): void {
    if (!this.getDiscoverable()) {
      return;
    }
    let score = (this.getSpecification().getBoolean(GameOptions.EXPLORATION_POINTS)) ? this.scoreValue : 0;
    if (!this.hasName()) {
      this.name = newName;
    }
    for (const $it0 = this.discover(player, unit, turn).iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.all(), [r]);
    }
    let h = new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(turn, HistoryEvent$HistoryEventType.DISCOVER_REGION, player).addStringTemplate$String$StringTemplate('%nation%', player.getNationLabel()).addName$String$String('%region%', newName);
    h.setScore(score);
    cs.addGlobalHistory(this.getGame(), h);
  }
  /**
   * Determines how to separate the given map into three
   * parts (north, center and south) with equal amount of land tiles
   * for each.
   *  
   * @param map The map.
   * @return The indexes separating the three parts.
   */
  static findYForThirdsOfLand(map: Map_): number[] {
    let landTiles = $J.newArray((map.getHeight() - 1) | 0, 0);
    let sum = 0;
    for (const $it1 = map.iterator(); $it1.hasNext(); ) {
      let t = $it1.next();
      if (t.isLand() && !t.isPolar()) {
        landTiles[t.getY()]++;
        sum++;
      }
    }
    return ServerRegion.findThirdsOfValues(landTiles, sum);
  }
  /**
   * Determines how to separate the given submap into three
   * parts (west, center and east) with equal amount of land tiles
   * for each.
   *  
   * @param map The map.
   * @param startY The starting Y-coordinate for the submap (inclusive).
   * @param endY The ending Y-coordinate for the submap (inclusive).
   * @return The indexes separating the three parts.
   */
  static findXForThirdsOfLand(map: Map_, startY: number, endY: number): number[] {
    let subMap = map.subMap(0, startY, (map.getWidth() - 1) | 0, (endY - startY + 1) | 0);
    let landTiles = $J.newArray((map.getWidth() - 1) | 0, 0);
    let sum = 0;
    for (const $it2 = subMap.iterator(); $it2.hasNext(); ) {
      let t = $it2.next();
      if (t.isLand() && !t.isPolar()) {
        landTiles[t.getX()]++;
        sum++;
      }
    }
    return ServerRegion.findThirdsOfValues(landTiles, sum);
  }
  /**
   * Finds the indexes  for separating the given array into three parts.
   * @param timesTheValue An array containing the number of elements for
   *      each number (as given by the index).
   * @param sum The total sum.
   * @return The indexes separating the three parts.
   */
  static findThirdsOfValues(timesTheValue: number[], sum: number): number[] {
    let result = $J.newArray(2, 0);
    let accumulatedSum = 0;
    let needFirst = true;
    for (let i = 0; i < timesTheValue.length; i++) {
      accumulatedSum = (accumulatedSum + timesTheValue[i]) | 0;
      if (needFirst && accumulatedSum >= $J.ldiv(sum, 3)) {
        result[0] = i;
        needFirst = false;
      }
      if (accumulatedSum >= $J.ldiv((2 * sum), 3)) {
        result[1] = i;
        break;
      }
    }
    return result;
  }
  static ensureWithinMap(map: Map_, bounds: Rectangle): Rectangle {
    let capX = Math.max(0, bounds.x_);
    let capY = Math.max(0, bounds.y_);
    let capWidth = ((Math.min((map.getWidth() - 1) | 0, (bounds.x_ + Math.min((map.getWidth() - 1) | 0, bounds.width_)) | 0)) - capX) | 0;
    let capHeight = ((Math.min((map.getHeight() - 1) | 0, (bounds.y_ + Math.min((map.getHeight() - 1) | 0, bounds.height_)) | 0)) - capY) | 0;
    return new Rectangle()._Rectangle$int$int$int$int(capX, capY, capWidth, capHeight);
  }
  /**
   * Make the fixed regions if they do not exist in a given map.
   *
   * @param map The {@code Map} to check.
   * @param lb A {@code LogBuilder} to log to.
   * @return A list of fixed server regions.
   */
  static requireFixedRegions(map: Map_, lb: LogBuilder): List<ServerRegion> {
    let fixed = map.getFixedRegions();
    let result = new ArrayList(16);
    lb.add(['Add regions ']);
    let arcticHeight = Map_.POLAR_HEIGHT;
    let arctic = fixed.get('model.region.arctic');
    if (arctic == null) {
      arctic = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.arctic', Region$RegionType.LAND, null);
      for (let x = 0; x < map.getWidth(); x++) {
        for (let y = 0; y < arcticHeight; y++) {
          if (map.isValid$int$int(x, y)) {
            let tile = map.getTile$int$int(x, y);
            if (tile.isLand()) {
              arctic.addTile(tile);
            }
          }
        }
      }
      lb.add(['+arctic']);
    }
    result.add(arctic);
    let antarcticHeight = (map.getHeight() - Map_.POLAR_HEIGHT - 1) | 0;
    let antarctic = fixed.get('model.region.antarctic');
    if (antarctic == null) {
      antarctic = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.antarctic', Region$RegionType.LAND, null);
      for (let x = 0; x < map.getWidth(); x++) {
        for (let y = antarcticHeight; y < map.getHeight(); y++) {
          if (map.isValid$int$int(x, y)) {
            let tile = map.getTile$int$int(x, y);
            if (tile.isLand()) {
              antarctic.addTile(tile);
            }
          }
        }
      }
      lb.add(['+antarctic']);
    }
    result.add(antarctic);
    let yDelimiterThirds = ServerRegion.findYForThirdsOfLand(map);
    let xDelimiterThirds = ServerRegion.findXForThirdsOfLand(map, 0, yDelimiterThirds[0]);
    map.removeRegionsByKey('model.region.northWest');
    let northWest = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.northWest', Region$RegionType.LAND, null);
    northWest.bounds_.setBounds$Rectangle(ServerRegion.ensureWithinMap(map, new Rectangle()._Rectangle$int$int$int$int(0, 0, xDelimiterThirds[0], yDelimiterThirds[0])));
    map.addRegion(northWest);
    map.removeRegionsByKey('model.region.north');
    let north = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.north', Region$RegionType.LAND, null);
    north.bounds_.setBounds$Rectangle(ServerRegion.ensureWithinMap(map, new Rectangle()._Rectangle$int$int$int$int(xDelimiterThirds[0], 0, (xDelimiterThirds[1] - xDelimiterThirds[0]) | 0, yDelimiterThirds[0])));
    map.addRegion(north);
    map.removeRegionsByKey('model.region.northEast');
    let northEast = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.northEast', Region$RegionType.LAND, null);
    northEast.bounds_.setBounds$Rectangle(ServerRegion.ensureWithinMap(map, new Rectangle()._Rectangle$int$int$int$int(xDelimiterThirds[1], 0, 2147483647, yDelimiterThirds[0])));
    map.addRegion(northEast);
    xDelimiterThirds = ServerRegion.findXForThirdsOfLand(map, yDelimiterThirds[0], yDelimiterThirds[1]);
    map.removeRegionsByKey('model.region.west');
    let west = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.west', Region$RegionType.LAND, null);
    west.bounds_.setBounds$Rectangle(ServerRegion.ensureWithinMap(map, new Rectangle()._Rectangle$int$int$int$int(0, yDelimiterThirds[0], xDelimiterThirds[0], (yDelimiterThirds[1] - yDelimiterThirds[0]) | 0)));
    map.addRegion(west);
    map.removeRegionsByKey('model.region.center');
    let center = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.center', Region$RegionType.LAND, null);
    center.bounds_.setBounds$Rectangle(ServerRegion.ensureWithinMap(map, new Rectangle()._Rectangle$int$int$int$int(xDelimiterThirds[0], yDelimiterThirds[0], (xDelimiterThirds[1] - xDelimiterThirds[0]) | 0, (yDelimiterThirds[1] - yDelimiterThirds[0]) | 0)));
    map.addRegion(center);
    map.removeRegionsByKey('model.region.east');
    let east = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.east', Region$RegionType.LAND, null);
    east.bounds_.setBounds$Rectangle(ServerRegion.ensureWithinMap(map, new Rectangle()._Rectangle$int$int$int$int(xDelimiterThirds[1], yDelimiterThirds[0], 2147483647, (yDelimiterThirds[1] - yDelimiterThirds[0]) | 0)));
    map.addRegion(east);
    xDelimiterThirds = ServerRegion.findXForThirdsOfLand(map, yDelimiterThirds[1], (map.getHeight() - 1) | 0);
    map.removeRegionsByKey('model.region.southWest');
    let southWest = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.southWest', Region$RegionType.LAND, null);
    southWest.bounds_.setBounds$Rectangle(ServerRegion.ensureWithinMap(map, new Rectangle()._Rectangle$int$int$int$int(0, yDelimiterThirds[1], xDelimiterThirds[0], 2147483647)));
    map.addRegion(southWest);
    map.removeRegionsByKey('model.region.south');
    let south = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.south', Region$RegionType.LAND, null);
    south.bounds_.setBounds$Rectangle(ServerRegion.ensureWithinMap(map, new Rectangle()._Rectangle$int$int$int$int(xDelimiterThirds[0], yDelimiterThirds[1], (xDelimiterThirds[1] - xDelimiterThirds[0]) | 0, 2147483647)));
    map.addRegion(south);
    map.removeRegionsByKey('model.region.southEast');
    let southEast = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.southEast', Region$RegionType.LAND, null);
    southEast.bounds_.setBounds$Rectangle(ServerRegion.ensureWithinMap(map, new Rectangle()._Rectangle$int$int$int$int(xDelimiterThirds[1], yDelimiterThirds[1], 2147483647, 2147483647)));
    map.addRegion(southEast);
    let allOceans = true;
    let pacific = fixed.get('model.region.pacific');
    if (pacific == null) {
      pacific = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.pacific', Region$RegionType.OCEAN, null);
      pacific.setDiscoverable(true);
      pacific.setScoreValue(ServerRegion.PACIFIC_SCORE_VALUE);
      allOceans = false;
      lb.add(['+pacific']);
    }
    result.add(pacific);
    let northPacific = fixed.get('model.region.northPacific');
    if (northPacific == null) {
      northPacific = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.northPacific', Region$RegionType.OCEAN, pacific);
      northPacific.setDiscoverable(false);
      allOceans = false;
      lb.add(['+northPacific']);
    }
    result.add(northPacific);
    let southPacific = fixed.get('model.region.southPacific');
    if (southPacific == null) {
      southPacific = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.southPacific', Region$RegionType.OCEAN, pacific);
      southPacific.setDiscoverable(false);
      allOceans = false;
      lb.add(['+southPacific']);
    }
    result.add(southPacific);
    let atlantic = fixed.get('model.region.atlantic');
    if (atlantic == null) {
      atlantic = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.atlantic', Region$RegionType.OCEAN, null);
      atlantic.setDiscoverable(false);
      allOceans = false;
      lb.add(['+atlantic']);
    }
    result.add(atlantic);
    let northAtlantic = fixed.get('model.region.northAtlantic');
    if (northAtlantic == null) {
      northAtlantic = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.northAtlantic', Region$RegionType.OCEAN, atlantic);
      northAtlantic.setDiscoverable(false);
      allOceans = false;
      lb.add(['+northAtlantic']);
    }
    result.add(northAtlantic);
    let southAtlantic = fixed.get('model.region.southAtlantic');
    if (southAtlantic == null) {
      southAtlantic = new ServerRegion()._ServerRegion$Map$String$RegionType$Region(map, 'model.region.southAtlantic', Region$RegionType.OCEAN, atlantic);
      southAtlantic.setDiscoverable(false);
      allOceans = false;
      lb.add(['+southAtlantic']);
    }
    result.add(southAtlantic);
    if (!allOceans) {
      let maxx = map.getWidth();
      let midx = $J.idiv(maxx, 2);
      let maxy = map.getHeight();
      let midy = $J.idiv(maxy, 2);
      let tNP = null;
      let tSP = null;
      let tNA = null;
      let tSA = null;
      let t: Tile;
      for (let y = (midy - 1) | 0; y >= 0; y--) {
        if (tNP == null && !(t = map.getTile$int$int(0, y)).isLand()) {
          tNP = t;
        }
        if (tNA == null && !(t = map.getTile$int$int((maxx - 1) | 0, y)).isLand()) {
          tNA = t;
        }
        if (tNP != null && tNA != null) {
          break;
        }
      }
      for (let y = midy; y < maxy; y++) {
        if (tSP == null && !(t = map.getTile$int$int(0, y)).isLand()) {
          tSP = t;
        }
        if (tSA == null && !(t = map.getTile$int$int((maxx - 1) | 0, y)).isLand()) {
          tSA = t;
        }
        if (tSP != null && tSA != null) {
          break;
        }
      }
      let nNP = 0;
      let nSP = 0;
      let nNA = 0;
      let nSA = 0;
      let rNP = new Rectangle()._Rectangle$int$int$int$int(0, 0, midx, midy);
      let rSP = new Rectangle()._Rectangle$int$int$int$int(0, midy, midx, (maxy - midy) | 0);
      let rNA = new Rectangle()._Rectangle$int$int$int$int(midx, 0, (maxx - midx) | 0, midy);
      let rSA = new Rectangle()._Rectangle$int$int$int$int(midx, midy, (maxx - midx) | 0, (maxy - midy) | 0);
      if (tNP != null) {
        nNP = (nNP + ServerRegion.fillOcean(map, tNP, northPacific, rNP)) | 0;
      }
      if (tSP != null) {
        nSP = (nSP + ServerRegion.fillOcean(map, tSP, southPacific, rSP)) | 0;
      }
      if (tNA != null) {
        nNA = (nNA + ServerRegion.fillOcean(map, tNA, northAtlantic, rNA)) | 0;
      }
      if (tSA != null) {
        nSA = (nSA + ServerRegion.fillOcean(map, tSA, southAtlantic, rSA)) | 0;
      }
      let rN = new Rectangle()._Rectangle$int$int$int$int(0, 0, maxx, midy);
      let rS = new Rectangle()._Rectangle$int$int$int$int(0, midy, maxx, (maxy - midy) | 0);
      if (tNP != null) {
        nNP = (nNP + ServerRegion.fillOcean(map, tNP, northPacific, rN)) | 0;
      }
      if (tSP != null) {
        nSP = (nSP + ServerRegion.fillOcean(map, tSP, southPacific, rS)) | 0;
      }
      if (tNA != null) {
        nNA = (nNA + ServerRegion.fillOcean(map, tNA, northAtlantic, rN)) | 0;
      }
      if (tSA != null) {
        nSA = (nSA + ServerRegion.fillOcean(map, tSA, southAtlantic, rS)) | 0;
      }
      let rAll = new Rectangle()._Rectangle$int$int$int$int(0, 0, maxx, maxy);
      if (tNP != null) {
        nNP = (nNP + ServerRegion.fillOcean(map, tNP, northPacific, rAll)) | 0;
      }
      if (tSP != null) {
        nSP = (nSP + ServerRegion.fillOcean(map, tSP, southPacific, rAll)) | 0;
      }
      if (tNA != null) {
        nNA = (nNA + ServerRegion.fillOcean(map, tNA, northAtlantic, rAll)) | 0;
      }
      if (tSA != null) {
        nSA = (nSA + ServerRegion.fillOcean(map, tSA, southAtlantic, rAll)) | 0;
      }
      lb.add([' filled ocean regions ', nNP, ' North Pacific, ', nSP, ' South Pacific, ', nNA, ' North Atlantic, ', nSA, ' South Atlantic.\n']);
    }
    return result;
  }
  /**
   * Flood fill ocean regions.
   *
   * @param map The {@code Map} to fill in.
   * @param tile A valid starting {@code Tile}.
   * @param region A {@code ServerRegion} to fill with.
   * @param bounds A {@code Rectangle} that bounds the filling.
   * @return The number of tiles filled.
   */
  static fillOcean(map: Map_, tile: Tile, region: ServerRegion, bounds: Rectangle): number {
    let q = new LinkedList();
    let n = 0;
    let visited = $J.newArrayN([map.getWidth(), map.getHeight()], false);
    visited[tile.getX()][tile.getY()] = true;
    q.add(tile);
    while ((tile = q.poll()) != null) {
      region.addTile(tile);
      n++;
      for (let direction of Direction.values()) {
        let t = map.getAdjacentTile$Tile$Direction(tile, direction);
        if (t != null && !visited[t.getX()][t.getY()] && bounds.contains$int$int(t.getX(), t.getY())) {
          visited[t.getX()][t.getY()] = true;
          if ((t.getRegion() == null || t.getRegion() === region) && !t.isLand()) {
            q.add(t);
          }
        }
      }
    }
    return n;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(super.toString());
    sb.setLength((sb.length() - 1) | 0);
    sb.append(String.fromCharCode(32 /* ' ' */)).append(String(this.size_)).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.bounds_)).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(ServerRegion, 'net.sf.freecol.server.model.ServerRegion', { kind: 'class', sup: 'net.sf.freecol.common.model.Region', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String,net.sf.freecol.common.model.Region$RegionType,net.sf.freecol.common.model.Region': '_ServerRegion$Game$String$RegionType$Region', 'net.sf.freecol.common.model.Map,java.lang.String,net.sf.freecol.common.model.Region$RegionType,net.sf.freecol.common.model.Region': '_ServerRegion$Map$String$RegionType$Region', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Region$RegionType': '_ServerRegion$Game$RegionType', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Region': '_ServerRegion$Game$Region', 'net.sf.freecol.common.model.Game,java.lang.String': '_ServerRegion$Game$String' }, returns: { 'isGeographic': 'boolean', 'getBounds': 'java.awt.Rectangle', 'getSize': 'int' } });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  HistoryEvent = $J.load('net.sf.freecol.common.model.HistoryEvent');
  HistoryEvent$HistoryEventType = $J.load('net.sf.freecol.common.model.HistoryEvent$HistoryEventType');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Region$RegionType = $J.load('net.sf.freecol.common.model.Region$RegionType');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
});
