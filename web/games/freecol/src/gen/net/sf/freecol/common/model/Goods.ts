// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Goods.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, RuntimeException, UnsupportedOperationException, XMLStreamException } from '../../../../../../jre/index.ts';
import { AbstractGoods } from './AbstractGoods.ts';

let Europe, GoodsType, Ownable, Unit, Utils;

/**
 * Represents locatable goods of a specified type and amount. Use
 * AbstractGoods to represent abstract or potential goods that need
 * not be present in any particular location.
 *
 * @see AbstractGoods
 */
export class Goods extends AbstractGoods {
  static logger: Logger = null;
  static readonly TAG: string = 'goods';
  /**
   * The game containing these goods.  It would be nice to make this
   * a FreeColGameObject, but then it could not extend AbstractGoods.
   */
  game: Game = null;
  /**
   * Where the goods are.  This should always be non-null except for the
   * really special case of goods that are in the process of being looted
   * from a ship --- we can not use the ship as it is removed/disposed
   * at once while the looting is still being resolved.
   */
  location_: Location = null;
  static readonly AMOUNT_TAG: string = 'amount';
  static readonly LOCATION_TAG: string = 'location';
  static readonly TYPE_TAG: string = 'type';
  /**
   * Fundamental constructor.
   *
   * @param game The enclosing {@code Game}.
   */
  _Goods$Game(game: Game): this {
    this._AbstractGoods$();
    if (game == null) {
      throw new RuntimeException('Null game: ' + $J.str(this));
    }
    this.game = game;
    return this;
  }
  /**
   * Creates a standard {@code Goods}-instance given the place where
   * the goods is.
   *
   * Used by Game.newInstance.
   *
   * @param game The enclosing {@code Game}.
   * @param id The identifier (ignored, type gives identifier here).
   */
  _Goods$Game$String(game: Game, id: string): this {
    this._Goods$Game(game);
    return this;
  }
  /**
   * Creates a standard {@code Goods}-instance given the place
   * where the goods is.
   *
   * This constructor only asserts that the game and that the
   * location (if given) can store goods. The goods will not be
   * added to the location (use Location.add for this).
   *
   * @param game The enclosing {@code Game}.
   * @param location The {@code Location} of the goods (may be null).
   * @param type The {@code GoodsType} for the goods.
   * @param amount The amount of the goods.
   */
  _Goods$Game$Location$GoodsType$int(game: Game, location: Location, type$: GoodsType, amount: number): this {
    this._Goods$Game(game);
    if (type$ == null) {
      throw new RuntimeException('Null type: ' + $J.str(this));
    }
    if (location != null && location.getGoodsContainer() == null) {
      throw new RuntimeException('Can not store goods at: ' + $J.str(location));
    }
    this.setId(type$.getId());
    this.setType(type$);
    this.setAmount(amount);
    this.location_ = location;
    return this;
  }
  /**
   * Creates a new {@code Goods} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if an error occurs
   */
  _Goods$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._Goods$Game(game);
    this.readFromXML(xr);
    return this;
  }
  /**
   * If the amount of goods is greater than the container can hold,
   * then this method adjusts the amount to the maximum amount possible.
   */
  adjustAmount(): void {
    if (this.location_ == null) {
      return;
    }
    let gc = this.location_.getGoodsContainer();
    if (gc != null) {
      let maxAmount = gc.getGoodsCount(this.getType());
      if (this.getAmount() > maxAmount) {
        this.setAmount(maxAmount);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  getLocation(): Location {
    return this.location_;
  }
  /**
   * @param location The Settlement that is located on this Tile
   */
  setLocation(location: Location): boolean {
    this.location_ = location;
    return true;
  }
  /**
   * {@inheritDoc}
   */
  isInEurope(): boolean {
    return (this.location_ instanceof Europe) || (this.location_ instanceof Unit && (this.location_).isInEurope());
  }
  /**
   * {@inheritDoc}
   */
  getTile$(): Tile {
    return (this.location_ == null) ? null : this.location_.getTile$();
  }
  /**
   * {@inheritDoc}
   */
  getSpaceTaken(): number {
    return 1;
  }
  /**
   * {@inheritDoc}
   */
  getOwner(): Player {
    return ($J.isa(this.location_, Ownable)) ? (this.location_).getOwner() : null;
  }
  /**
   * {@inheritDoc}
   */
  setOwner(p: Player): void {
    throw new UnsupportedOperationException();
  }
  /**
   * {@inheritDoc}
   */
  getSpecification(): Specification {
    return this.getGame().getSpecification();
  }
  /**
   * {@inheritDoc}
   */
  setSpecification(specification: Specification): void {
    throw new RuntimeException('Can not set specification: ' + $J.str(this));
  }
  /**
   * {@inheritDoc}
   */
  getGame(): Game {
    return this.game;
  }
  /**
   * {@inheritDoc}
   */
  setGame(game: Game): void {
    throw new RuntimeException('Can not set game: ' + $J.str(this));
  }
  /**
   * {@inheritDoc}
   */
  getDisplayObject(): FreeColObject {
    return this.getType();
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Goods));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.location_ = this.getGame().updateLocationRef(o.getLocation());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(Goods.TYPE_TAG, this.type);
    xw.writeAttribute$String$int(Goods.AMOUNT_TAG, this.amount);
    if (this.location_ != null) {
      xw.writeLocationAttribute(Goods.LOCATION_TAG, this.location_);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    super.readAttributes(xr);
    this.type = xr.getType(spec, Goods.TYPE_TAG, $J.cls(GoodsType), null);
    if (this.type == null) {
      throw new XMLStreamException('Null goods type: ' + $J.str(this));
    } else {
      this.setId(this.type.getId());
    }
    this.amount = xr.getAttribute$String$int(Goods.AMOUNT_TAG, 0);
    this.location_ = xr.getLocationAttribute(this.game, Goods.LOCATION_TAG, true);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Goods.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (o instanceof Goods) {
      let other = o;
      return this.location_ === other.location_ && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    return (Math.imul(31, hash) + Utils.hashCode(this.location_)) | 0;
  }
  static $clinit() {
    Goods.logger = Logger.getLogger($J.cls(Goods).getName());
  }
}

$J.define(Goods, 'net.sf.freecol.common.model.Goods', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Locatable', 'net.sf.freecol.common.model.Ownable'], sup: 'net.sf.freecol.common.model.AbstractGoods', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_Goods$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Location,net.sf.freecol.common.model.GoodsType,int': '_Goods$Game$Location$GoodsType$int', 'net.sf.freecol.common.model.Game,java.lang.String': '_Goods$Game$String', 'net.sf.freecol.common.model.Game': '_Goods$Game' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getDisplayObject': 'net.sf.freecol.common.model.FreeColObject', 'getGame': 'net.sf.freecol.common.model.Game', 'getSpecification': 'net.sf.freecol.common.model.Specification', 'getOwner': 'net.sf.freecol.common.model.Player', 'getSpaceTaken': 'int', 'getTile$': 'net.sf.freecol.common.model.Tile', 'isInEurope': 'boolean', 'getLocation': 'net.sf.freecol.common.model.Location' }, meths: { 'getTile()': 'getTile$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
