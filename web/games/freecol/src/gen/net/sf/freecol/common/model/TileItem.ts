// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/TileItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let Tile;

/**
 * Represents a {@code TileItem} item on a {@code Tile}.
 */
export class TileItem extends FreeColGameObject {
  static logger: Logger = null;
  /**
   * The tile where the tile item is.
   */
  tile: Tile = null;
  /**
   * Creates a new {@code TileItem}.
   *
   * @param game The enclosing {@code Game}.
   * @param tile The location of this {@code TileItem}.
   */
  _TileItem$Game$Tile(game: Game, tile: Tile): this {
    this._FreeColGameObject$Game(game);
    if (tile == null) {
      throw new RuntimeException('Tile must not be null: ' + $J.str(this));
    }
    this.tile = tile;
    return this;
  }
  /**
   * Creates a new {@code TileItem} from an XML stream.
   *
   * @param game The enclosing {@code Game}.
   * @param xr The input stream containing the XML.
   */
  _TileItem$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._FreeColGameObject$Game$String(game, null);
    return this;
  }
  /**
   * Initiates a new {@code TileItem} with the given
   * identifier.  The object should later be initialized by calling
   * either {@link #readFromXML(FreeColXMLReader)}.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _TileItem$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getLocation(): Location {
    return this.tile;
  }
  /**
   * {@inheritDoc}
   */
  setLocation(newLocation: Location): boolean {
    if (newLocation == null || newLocation instanceof Tile) {
      this.tile = newLocation;
      return true;
    }
    throw new RuntimeException('newLocation is not a Tile: ' + $J.str(newLocation));
  }
  /**
   * {@inheritDoc}
   */
  isInEurope(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  getTile$(): Tile {
    return this.tile;
  }
  /**
   * {@inheritDoc}
   */
  getSpaceTaken(): number {
    return 0;
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity(fix, lb);
    if (this.tile == null) {
      lb.add(['\n  Tile item with no tile: ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(TileItem));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.tile = this.getGame().updateRef$FreeColGameObject(o.getTile$());
    return true;
  }
  static $clinit() {
    TileItem.logger = Logger.getLogger($J.cls(TileItem).getName());
  }
}

$J.define(TileItem, 'net.sf.freecol.common.model.TileItem', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Locatable', 'net.sf.freecol.common.model.Named'], sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_TileItem$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_TileItem$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Tile': '_TileItem$Game$Tile' }, returns: { 'getNameKey': 'java.lang.String', 'getSpaceTaken': 'int', 'getTile$': 'net.sf.freecol.common.model.Tile', 'isInEurope': 'boolean', 'getLocation': 'net.sf.freecol.common.model.Location', 'getLayer': 'net.sf.freecol.common.model.Map$Layer', 'isComplete': 'boolean', 'isNatural': 'boolean', 'getZIndex': 'int' }, meths: { 'getTile()': 'getTile$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Tile = $J.load('net.sf.freecol.common.model.Tile');
});
