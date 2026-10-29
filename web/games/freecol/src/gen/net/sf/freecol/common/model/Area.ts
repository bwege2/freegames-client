// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Area.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, IllegalArgumentException, JString } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let Color, FreeColObject, Nation, Tile;

/**
 * An area of the map. Areas can be used to define starting locations and other
 * behavior where a list of tiles is needed.
 *
 * Note that areas can overlap.
 *
 * @see Region
 */
export class Area extends FreeColGameObject {
  static readonly TAG: string = 'area';
  static readonly PREFIX_PLAYER_STARTING_POSITION: string = 'model.area.starting.';
  nameKey: string = null;
  name: string = null;
  tiles: List<Tile> = null;
  static readonly TILE_REFERENCE_TAG: string = 'tileReference';
  static readonly NAME_KEY_TAG: string = 'nameKey';
  static readonly NAME_TAG: string = 'name';
  $init_Area() {
    this.nameKey = null;
    this.name = null;
    this.tiles = new ArrayList();
  }
  /**
   * Creates a new {@code Region} instance.
   *
   * @param game The enclosing {@code Game}.
   */
  _Area$Game(game: Game): this {
    this._FreeColGameObject$Game(game);
    this.$init_Area();
    return this;
  }
  /**
   * Creates a new {@code Region} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _Area$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    this.$init_Area();
    return this;
  }
  /**
   * Creates a new {@code Region} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   * @param nameKey A key for getting a translatable name of this area.
   */
  _Area$Game$String$String(game: Game, id: string, nameKey: string): this {
    this._FreeColGameObject$Game$String(game, id);
    this.$init_Area();
    this.nameKey = nameKey;
    return this;
  }
  _Area$Game$Area(game: Game, copyFrom: Area): this {
    this._FreeColGameObject$Game$String(game, copyFrom.getId());
    this.$init_Area();
    this.name = copyFrom.name;
    this.nameKey = copyFrom.nameKey;
    for (const $it0 = copyFrom.tiles.iterator(); $it0.hasNext(); ) {
      let copyFromTile = $it0.next();
      this.tiles.add(game.getMap().getTile$int$int(copyFromTile.getX(), copyFromTile.getY()));
    }
    return this;
  }
  /**
   * Gets a list of tiles within this {@code Area}.
   */
  getTiles(): List<Tile> {
    return Collections.unmodifiableList(this.tiles);
  }
  /**
   * Adds a new tile to the area.
   * @param tile The tile to be added.
   */
  addTile(tile: Tile): void {
    this.tiles.add(tile);
  }
  /**
   * Checks if this area contains the given tile.
   * @param tile The tile to checked,
   */
  containsTile(tile: Tile): boolean {
    return this.tiles.contains(tile);
  }
  /**
   * Removes a tile from the area.
   * @param tile The tile to be removed.
   */
  removeTile(tile: Tile): void {
    this.tiles.remove(tile);
  }
  /**
   * Gets the name of this area.
   */
  getName(): string {
    return this.name;
  }
  /**
   * Sets the name of this area.
   * @param name The name.
   */
  setName(name: string): void {
    if (this.nameKey != null) {
      throw new IllegalArgumentException('Cannot change the name of areas with a fixed nameKey.');
    }
    this.name = name;
  }
  /**
   * Gets a i18n key for naming this area.
   * @return The key to be used with {@link Messages#message(String)}.
   */
  getNameKey(): string {
    return this.nameKey;
  }
  /**
   * Checks if this area has no tiles.
   * @return {@code true} if there are no tiles attached to this area.
   */
  isEmpty(): boolean {
    return this.tiles.isEmpty();
  }
  /**
   * Returns the color to be used for displaying the area in the map editor.
   * @return The color that can be used by the map editor.
   */
  getColor(): Color {
    if (this.getId().startsWith(Area.PREFIX_PLAYER_STARTING_POSITION)) {
      let nationId = this.getId().substring(Area.PREFIX_PLAYER_STARTING_POSITION.length);
      let nation = this.getGame().getSpecification().getAlreadyInitializedType(nationId, $J.cls(Nation));
      if (nation != null) {
        return nation.getColor();
      }
    }
    let hashCode = $J.hashCode(this.getId());
    let r = hashCode % 256;
    let g = ($J.idiv(hashCode, 256)) % 256;
    let b = ($J.idiv(hashCode, (Math.imul(256, 256)))) % 256;
    return new Color()._Color$int$int$int(r, g, b);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Area));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.tiles = game.updateRef$Collection(this.tiles);
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.nameKey != null) {
      xw.writeAttribute(Area.NAME_KEY_TAG, this.nameKey);
    }
    if (this.name != null) {
      xw.writeAttribute(Area.NAME_TAG, this.name);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it1 = this.tiles.iterator(); $it1.hasNext(); ) {
      let tile = $it1.next();
      xw.writeStartElement(Area.TILE_REFERENCE_TAG);
      xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, tile.getId());
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.nameKey = xr.getAttribute$String$String(Area.NAME_KEY_TAG, null);
    this.name = xr.getAttribute$String$String(Area.NAME_TAG, null);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.tiles = new ArrayList();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(Area.TILE_REFERENCE_TAG, tag)) {
      this.tiles.add(xr.makeFreeColObject(this.getGame(), FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(Tile), true));
      xr.closeTag$String(Area.TILE_REFERENCE_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Area.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return '[' + this.getId() + ']';
  }
}

$J.define(Area, 'net.sf.freecol.common.model.Area', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Area': '_Area$Game$Area', 'net.sf.freecol.common.model.Game,java.lang.String,java.lang.String': '_Area$Game$String$String', 'net.sf.freecol.common.model.Game,java.lang.String': '_Area$Game$String', 'net.sf.freecol.common.model.Game': '_Area$Game' }, returns: { 'getXMLTagName': 'java.lang.String', 'getColor': 'java.awt.Color', 'isEmpty': 'boolean', 'getNameKey': 'java.lang.String', 'getName': 'java.lang.String', 'getTiles': 'java.util.List' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Nation = $J.load('net.sf.freecol.common.model.Nation');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
});
