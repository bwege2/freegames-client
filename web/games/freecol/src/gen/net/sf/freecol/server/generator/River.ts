// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/generator/River.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum, JObject, Logger } from '../../../../../../jre/index.ts';

let Direction, TileImprovement, MapGeneratorOptions, CollectionUtils, RandomUtils, RiverSection;

/**
 * A river for the map generator.
 */
export class River extends JObject {
  static logger: Logger = null;
  riverType: TileImprovementType = null;
  /**
   * Current direction the river is flowing in.
   */
  direction: Direction = null;
  /**
   * The map on which the river flows.
   */
  map_: Map_ = null;
  /**
   * A list of river sections.
   */
  sections: List<RiverSection> = null;
  /**
   * The next river.
   */
  nextRiver: River = null;
  /**
   * The ServerRegion this River belongs to.
   */
  region: ServerRegion = null;
  /**
   * The random number source.
   */
  random: Random = null;
  /**
   * A hashtable of position-river pairs.
   */
  riverMap: JMap<Tile, River> = null;
  /**
   * Whether the river is connected to the high seas.
   */
  connected: boolean = false;
  /**
   * Constructor.
   *
   * @param map The map on which the river flows.
   * @param riverMap A hashtable of position-river pairs.
   * @param region The region for this river.
   * @param random The {@code Random} number source to use.
   */
  _River(map: Map_, riverMap: JMap<Tile, River>, region: ServerRegion, random: Random): this {
    this.sections = new ArrayList();
    this.nextRiver = null;
    this.connected = false;
    this.map_ = map;
    this.riverMap = riverMap;
    this.region = region;
    this.random = random;
    this.riverType = map.getSpecification().getTileImprovementType('model.improvement.river');
    this.direction = RandomUtils.getRandomMember$Logger$String$List$Random(River.logger, 'River', Direction.longSides, random);
    River.logger.fine('Starting new river flowing ' + $J.str(this.direction));
    return this;
  }
  getSections(): List<RiverSection> {
    return this.sections;
  }
  /**
   * Returns the length of this river.
   *
   * @return the length of this river.
   */
  getLength(): number {
    return this.sections.size();
  }
  getLastSection(): RiverSection {
    return this.sections.get((this.sections.size() - 1) | 0);
  }
  /**
   * Get the {@code ServerRegion} value.
   *
   * @return a {@code ServerRegion} value
   */
  getRegion(): ServerRegion {
    return this.region;
  }
  /**
   * Set the {@code ServerRegion} value.
   *
   * @param newServerRegion The new ServerRegion value.
   */
  setRegion(newServerRegion: ServerRegion): void {
    this.region = newServerRegion;
  }
  /**
   * Adds a new section to this river.
   *
   * @param tile The {@code Tile} where this section is located.
   * @param direction The {@code Direction} the river is flowing in.
   */
  add(tile: Tile, direction: Direction): void {
    this.sections.add(new RiverSection()._RiverSection$Tile$Direction(tile, direction));
  }
  /**
   * Increases the size of this river.
   *
   * @param lastSection The last section of the river flowing into this one.
   * @param tile The {@code Tile} of the confluence.
   */
  grow(lastSection: RiverSection, tile: Tile): void {
    let found = false;
    for (const $it0 = this.sections.iterator(); $it0.hasNext(); ) {
      let section = $it0.next();
      if (found) {
        section.grow();
      } else if (section.getTile().equals(tile)) {
        section.setBranch(lastSection.direction.getReverseDirection(), lastSection.getSize());
        section.grow();
        found = true;
      }
    }
    this.drawToMap(this.sections);
    if (this.nextRiver != null) {
      let section = this.sections.get((this.sections.size() - 1) | 0);
      let neighbor = section.getTile().getNeighbourOrNull(section.direction);
      this.nextRiver.grow(section, neighbor);
    }
  }
  /**
   * Returns true if the given tile is next to this river.
   *
   * @param tile A map tile.
   * @return true if the given tile is next to this river.
   */
  isNextToSelf(tile: Tile): boolean {
    return CollectionUtils.any$Collection$Predicate(Direction.longSides, (d) => this.contains(tile.getNeighbourOrNull(d)));
  }
  /**
   * Returns true if the given tile is next to a river, lake or sea.
   *
   * @param tile A map tile.
   * @return true if the given tile is next to a river, lake or sea.
   */
  isNextToWater(tile: Tile): boolean {
    return CollectionUtils.any$Collection$Predicate(Direction.longSides, (d) => {
      let t = tile.getNeighbourOrNull(d);
      return t != null && (!t.isLand() || t.hasRiver());
    });
  }
  /**
   * Returns true if this river already contains the given tile.
   *
   * @param tile A map tile.
   * @return true if this river already contains the given tile.
   */
  contains(tile: Tile): boolean {
    return CollectionUtils.any$Collection$Predicate(this.getSections(), (rs) => rs.getTile() === tile);
  }
  /**
   * Creates a river flowing from the given tile if possible.
   *
   * @param tile An origin map {@code Tile}.
   * @return True if a river was created, false otherwise.
   */
  flowFromSource(tile: Tile): boolean {
    let riverType = this.map_.getSpecification().getTileImprovementType('model.improvement.river');
    if (!riverType.isTileTypeAllowed(tile.getType())) {
      River.logger.fine('Tile (' + $J.str(tile) + ') can not have a river.');
      return false;
    } else if (this.isNextToWater(tile)) {
      River.logger.fine('Tile (' + $J.str(tile) + ') is next to water.');
      return false;
    } else {
      River.logger.fine('Tile (' + $J.str(tile) + ') is suitable source.');
      return this.flow(tile);
    }
  }
  /**
   * Lets the river flow from the given tile.
   *
   * @param source A map tile.
   * @return true if a river was created, false otherwise.
   */
  flow(source: Tile): boolean {
    let other = this;
    flow:
    while (true) {
      if (other.sections.size() % 2 === 0) {
        let length = River$DirectionChange.values().length;
        let index = RandomUtils.randomInt(River.logger, 'Flow', this.random, length);
        let change = River$DirectionChange.values()[index];
        other.direction = change.getNewDirection(other.direction);
        River.logger.fine('Direction is now ' + $J.str(other.direction));
      }
      for (let change of River$DirectionChange.values()) {
        let dir = change.getNewDirection(other.direction);
        let nextTile = source.getNeighbourOrNull(dir);
        if (nextTile == null) {
          continue;
        }
        if (!other.riverType.isTileTypeAllowed(nextTile.getType())) {
          River.logger.fine('Tile (' + $J.str(nextTile) + ') can not have a river.');
          continue;
        } else if (other.contains(nextTile)) {
          River.logger.fine('Tile (' + $J.str(nextTile) + ') is already in river.');
          continue;
        } else if (other.isNextToSelf(nextTile)) {
          River.logger.fine('Tile (' + $J.str(nextTile) + ') is next to the river.');
          continue;
        } else {
          for (let change2 of River$DirectionChange.values()) {
            let lastDir = change2.getNewDirection(dir);
            let t = nextTile.getNeighbourOrNull(lastDir);
            if (t == null) {
              continue;
            }
            if (t.isLand() && !t.hasRiver()) {
              continue;
            }
            other.sections.add(new RiverSection()._RiverSection$Tile$Direction(source, dir));
            let lastSection = new RiverSection()._RiverSection$Tile$Direction(nextTile, lastDir);
            other.sections.add(lastSection);
            if (t.hasRiver() && t.isLand()) {
              River.logger.fine('Tile (' + $J.str(t) + ') is next to another river.');
              other.nextRiver = other.riverMap.get(t);
              other.nextRiver.grow(lastSection, t);
              other.connected = !!(other.connected | other.nextRiver.connected);
              if (other.getLength() < 10) {
                other.region = other.nextRiver.region;
              }
              other.drawToMap(this.sections);
            } else {
              River.logger.fine('Tile (' + $J.str(t) + ') is next to water.');
              let someRiver = other.riverMap.get(t);
              if (someRiver == null) {
                other.sections.add(new RiverSection()._RiverSection$Tile$Direction(t, lastDir.getReverseDirection()));
                if (lastSection.getSize() < TileImprovement.FJORD_RIVER) {
                  other.createDelta(nextTile, lastDir, lastSection);
                }
              } else {
                let waterSection = someRiver.getLastSection();
                waterSection.setBranch(lastDir.getReverseDirection(), TileImprovement.SMALL_RIVER);
              }
              other.connected = !!(other.connected | t.isHighSeasConnected());
              other.drawToMap(this.sections);
            }
            return true;
          }
          River.logger.fine('Tile (' + $J.str(nextTile) + ') is suitable.');
          other.sections.add(new RiverSection()._RiverSection$Tile$Direction(source, dir));
          source = nextTile;
          continue flow;
        }
      }
      other.sections = new ArrayList();
      return false;
    }
  }
  createDelta(tile: Tile, direction: Direction, section: RiverSection): void {
    this.delta(tile, direction, section, River$DirectionChange.LEFT_TURN.getNewDirection(direction));
    this.delta(tile, direction, section, River$DirectionChange.RIGHT_TURN.getNewDirection(direction));
  }
  delta(tile: Tile, direction: Direction, section: RiverSection, d: Direction): void {
    let t = tile.getNeighbourOrNull(d);
    if (!t.isLand()) {
      let deltaSections = new ArrayList();
      section.setBranch(d, TileImprovement.SMALL_RIVER);
      deltaSections.add(new RiverSection()._RiverSection$Tile$Direction(tile, d.getReverseDirection()));
      this.drawToMap(deltaSections);
    } else if (this.riverType.isTileTypeAllowed(t.getType())) {
      let t2 = t.getNeighbourOrNull(direction);
      if (!t2.isLand() && RandomUtils.randomInt(River.logger, 'Delta', this.random, 2) === 0) {
        let deltaSections = new ArrayList();
        section.setBranch(d, TileImprovement.SMALL_RIVER);
        let rs = new RiverSection()._RiverSection$Tile$Direction(t, direction);
        rs.setBranch(d.getReverseDirection(), TileImprovement.SMALL_RIVER);
        deltaSections.add(rs);
        rs = new RiverSection()._RiverSection$Tile$Direction(t2, direction.getReverseDirection());
        deltaSections.add(rs);
        this.drawToMap(deltaSections);
      }
    }
  }
  /**
   * Draws the completed river to the map.
   *
   * @param sections A list of {@code RiverSection}s to draw.
   */
  drawToMap(sections: List<RiverSection>): void {
    let oldSection = null;
    let enableGreatRivers = this.map_.getGame().getMapGeneratorOptions().getBoolean(MapGeneratorOptions.ENABLE_GREAT_RIVERS);
    for (const $it1 = sections.iterator(); $it1.hasNext(); ) {
      let section = $it1.next();
      this.riverMap.put(section.getTile(), this);
      if (oldSection != null) {
        section.setBranch(oldSection.direction.getReverseDirection(), oldSection.getSize());
      }
      let tile = section.getTile();
      if (tile.isLand()) {
        if (enableGreatRivers && section.getSize() >= TileImprovement.FJORD_RIVER) {
          let greatRiver = this.map_.getSpecification().getTileType('model.tile.greatRiver');
          tile.changeType(greatRiver);
          River.logger.fine('Added fjord (magnitude: ' + section.getSize() + ') to tile: ' + $J.str(section.getTile()));
        } else if (section.getSize() > TileImprovement.NO_RIVER) {
          let magnitude = Math.min(section.getSize(), TileImprovement.LARGE_RIVER);
          let style = section.encodeStyle();
          tile.addRiver(magnitude, style);
          River.logger.fine('Added river(magnitude: ' + section.getSize() + ' style: ' + style);
        }
        this.region.addTile(tile);
        oldSection = section;
      }
    }
  }
  static $clinit() {
    River.logger = Logger.getLogger($J.cls(River).getName());
  }
}

/**
 * Possible direction changes for a river.
 * @see net.sf.freecol.common.model.Map
 */
export class River$DirectionChange extends JEnum {
  static STRAIGHT_AHEAD: River$DirectionChange = null;
  static RIGHT_TURN: River$DirectionChange = null;
  static LEFT_TURN: River$DirectionChange = null;
  static $VALUES: River$DirectionChange[] = null;
  _River$DirectionChange($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  getNewDirection(oldDirection: Direction): Direction {
    switch (this) {
      case River$DirectionChange.STRAIGHT_AHEAD:
        return oldDirection;
      case River$DirectionChange.RIGHT_TURN:
        switch (oldDirection) {
          case Direction.NE:
            return Direction.SE;
          case Direction.SE:
            return Direction.SW;
          case Direction.SW:
            return Direction.NW;
          case Direction.NW:
            return Direction.NE;
          default:
            return oldDirection;
        }
      case River$DirectionChange.LEFT_TURN:
        switch (oldDirection) {
          case Direction.NE:
            return Direction.NW;
          case Direction.SE:
            return Direction.NE;
          case Direction.SW:
            return Direction.SE;
          case Direction.NW:
            return Direction.SW;
          default:
            return oldDirection;
        }
    }
    return oldDirection;
  }
  static values(): River$DirectionChange[] { return River$DirectionChange.$VALUES.slice(); }
  static valueOf(name: string): River$DirectionChange { return $J.enumValueOf(River$DirectionChange, name); }
  static $clinit() {
    River$DirectionChange.STRAIGHT_AHEAD = new River$DirectionChange()._River$DirectionChange('STRAIGHT_AHEAD', 0);
    River$DirectionChange.RIGHT_TURN = new River$DirectionChange()._River$DirectionChange('RIGHT_TURN', 1);
    River$DirectionChange.LEFT_TURN = new River$DirectionChange()._River$DirectionChange('LEFT_TURN', 2);
    River$DirectionChange.$VALUES = [River$DirectionChange.STRAIGHT_AHEAD, River$DirectionChange.RIGHT_TURN, River$DirectionChange.LEFT_TURN];
  }
}

$J.define(River, 'net.sf.freecol.server.generator.River', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Map,java.util.Map,net.sf.freecol.server.model.ServerRegion,java.util.Random': '_River' }, returns: { 'getRegion': 'net.sf.freecol.server.model.ServerRegion', 'getLastSection': 'net.sf.freecol.server.generator.RiverSection', 'getLength': 'int', 'getSections': 'java.util.List' }, clinit: true, lazy: ['logger'] });
$J.define(River$DirectionChange, 'net.sf.freecol.server.generator.River$DirectionChange', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_River$DirectionChange' }, clinit: true, lazy: ['$VALUES', 'STRAIGHT_AHEAD', 'RIGHT_TURN', 'LEFT_TURN'] });
$J.module(() => {
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  TileImprovement = $J.load('net.sf.freecol.common.model.TileImprovement');
  MapGeneratorOptions = $J.load('net.sf.freecol.common.option.MapGeneratorOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  RiverSection = $J.load('net.sf.freecol.server.generator.RiverSection');
});
