// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/generator/RiverSection.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, EnumMap, JObject, StringBuilder } from '../../../../../../jre/index.ts';

let Direction, TileImprovement;

/**
 * This class facilitates building, editing the TileImprovement style
 * for rivers Rivers on the Map are composed of many individual
 * TileImprovements displayed on each Tile the river flows through The
 * river TileImprovement on a Tile has a style which represents the
 * inputs/outputs of water to/from neighboring Tiles This class allows
 * manipulation of individual stream(s) to neighboring Tiles (there
 * are many in case of confluence)
 */
export class RiverSection extends JObject {
  static template: number[] = null;
  /**
   * River magnitude (size) for each direction toward the edges of the tile
   */
  branches: JMap<Direction, number> = null;
  /**
   * River magnitude (size) at the center of the tile
   */
  size_: number = 0;
  /**
   * Direction the river is flowing toward, at the current section
   */
  direction: Direction = null;
  /**
   * Tile of the current river section
   */
  tile: Tile = null;
  $init_RiverSection() {
    this.branches = new EnumMap($J.cls(Direction));
    this.size_ = TileImprovement.SMALL_RIVER;
  }
  /**
   * Creates a new RiverSection with the given branches. This
   * constructor is used by the map editor.
   *
   * @param branches The encoded style
   */
  _RiverSection$Map(branches: JMap<Direction, number>): this {
    this.$init_RiverSection();
    this.branches = branches;
    return this;
  }
  /**
   * Constructor used to automatically generate rivers.
   *
   * @param tile The map tile
   * @param direction The direction the river is flowing toward
   */
  _RiverSection$Tile$Direction(tile: Tile, direction: Direction): this {
    this.$init_RiverSection();
    this.tile = tile;
    this.direction = direction;
    this.setBranch(direction, TileImprovement.SMALL_RIVER);
    return this;
  }
  /**
   * Get the section tile.
   *
   * @return The {@code Tile}.
   */
  getTile(): Tile {
    return this.tile;
  }
  /**
   * Returns the size
   * @return size
   */
  getSize(): number {
    return this.size_;
  }
  /**
   * Sets the size of a branch
   *
   * @param direction The {@code Direction} of the branch.
   * @param size The size to set.
   */
  setBranch(direction: Direction, size: number): void {
    if (size !== TileImprovement.SMALL_RIVER) {
      size = TileImprovement.LARGE_RIVER;
    }
    this.branches.put(direction, size);
  }
  /**
   * Gets the size of a branch
   *
   * @param direction The {@code Direction} of the branch.
   * @return The branch size.
   */
  getBranch(direction: Direction): number {
    let val = this.branches.get(direction);
    return (val == null) ? TileImprovement.NO_RIVER : val;
  }
  /**
   * Removes a branch
   *
   * @param direction The {@code Direction} of the branch.
   */
  removeBranch(direction: Direction): void {
    this.branches.remove(direction);
  }
  /**
   * Increases the size a branch
   *
   * @param direction The {@code Direction} of the branch.
   * @param increment The amount to add to the branch size.
   */
  growBranch(direction: Direction, increment: number): void {
    let newSize = Math.min(TileImprovement.LARGE_RIVER, Math.max(TileImprovement.NO_RIVER, (this.getBranch(direction) + increment) | 0));
    this.setBranch(direction, newSize);
  }
  /**
   * Increases the size of this section by one.
   */
  grow(): void {
    this.size_++;
    this.setBranch(this.direction, TileImprovement.LARGE_RIVER);
  }
  encodeStyle(): string {
    let sb = new StringBuilder();
    for (const $it0 = Direction.longSides.iterator(); $it0.hasNext(); ) {
      let direction = $it0.next();
      sb.append((this.getBranch(direction)).toString(36));
    }
    return sb.toString();
  }
  static $clinit() {
    RiverSection.template = [48 /* '0' */, 49 /* '1' */, 50 /* '2' */, 51 /* '3' */];
  }
}

$J.define(RiverSection, 'net.sf.freecol.server.generator.RiverSection', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.Direction': '_RiverSection$Tile$Direction', 'java.util.Map': '_RiverSection$Map' }, returns: { 'getSize': 'int', 'getTile': 'net.sf.freecol.common.model.Tile' }, clinit: true, lazy: ['template'] });
$J.module(() => {
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  TileImprovement = $J.load('net.sf.freecol.common.model.TileImprovement');
});
