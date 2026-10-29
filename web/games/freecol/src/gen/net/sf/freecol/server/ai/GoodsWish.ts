// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/GoodsWish.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, NullPointerException } from '../../../../../../jre/index.ts';
import { Wish } from './Wish.ts';

let GoodsContainer, GoodsType, LogBuilder, Utils, AIGoods;

/**
 * Represents the need for goods within a {@code Colony}.
 */
export class GoodsWish extends Wish {
  static logger: Logger = null;
  static readonly TAG: string = 'goodsWish';
  /**
   * The type of goods required.
   */
  goodsType: GoodsType = null;
  /**
   * The amount of goods required.
   */
  amountRequested: number = 0;
  static readonly AMOUNT_REQUESTED_TAG: string = 'amountRequested';
  static readonly GOODS_TYPE_TAG: string = 'goodsType';
  static readonly TRANSPORTABLE_TAG: string = 'transportable';
  /**
   * Creates a new uninitialized {@code GoodsWish}.
   *
   * @param aiMain The main AI-object.
   * @param id The object identifier.
   */
  _GoodsWish$AIMain$String(aiMain: AIMain, id: string): this {
    this._Wish$AIMain$String(aiMain, id);
    this.goodsType = null;
    this.amountRequested = -1;
    this.initialized = false;
    return this;
  }
  /**
   * Creates a new {@code GoodsWish}.
   *
   * @param aiMain The main AI-object.
   * @param destination The {@code Location} in which the
   *       {@link Wish#getTransportable transportable} assigned to
   *       this {@code GoodsWish} will have to reach.
   * @param value The value identifying the importance of
   *       this {@code Wish}.
   * @param amountRequested The amount requested.
   * @param goodsType The type of goods needed for releasing this wish
   *       completly.
   */
  _GoodsWish$AIMain$Location$int$int$GoodsType(aiMain: AIMain, destination: Location, value: number, amountRequested: number, goodsType: GoodsType): this {
    this._GoodsWish$AIMain$String(aiMain, GoodsWish.TAG + ':' + aiMain.getNextId());
    if (destination == null) {
      throw new NullPointerException('destination == null: ' + $J.str(this));
    }
    this.destination = destination;
    this.setValue(value);
    this.goodsType = goodsType;
    this.amountRequested = amountRequested;
    this.setInitialized();
    return this;
  }
  /**
   * Creates a new {@code GoodsWish} from the given
   * XML-representation.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   */
  _GoodsWish$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._Wish$AIMain$FreeColXMLReader(aiMain, xr);
    this.setInitialized();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setInitialized(): void {
    this.initialized = this.getGoodsType() != null && this.getGoodsAmount() > 0;
  }
  /**
   * Updates this {@code GoodsWish} with the given attributes.
   *
   * @param goodsType The {@code GoodsType} to wish for.
   * @param amount The amount of goods.
   * @param value The urgency of the wish.
   */
  update(goodsType: GoodsType, amount: number, value: number): void {
    this.goodsType = goodsType;
    this.amountRequested = amount;
    this.setValue(value);
    if (this.transportable != null) {
      this.transportable.incrementTransportPriority();
    }
  }
  /**
   * Checks if this {@code Wish} needs to be stored in a savegame.
   *
   * @return True.  We always store goods wishes.
   */
  shouldBeStored(): boolean {
    return true;
  }
  /**
   * Gets the type of goods wished for.
   *
   * @return The type of goods wished for.
   */
  getGoodsType(): GoodsType {
    return this.goodsType;
  }
  /**
   * Gets the amount of goods wished for.
   *
   * @return The amount of goods wished for.
   */
  getGoodsAmount(): number {
    return this.amountRequested;
  }
  /**
   * Sets the amount of goods wished for.
   * Called in AIColony when the colony needs to change the required goods
   * amount.
   *
   * @param amount The new amount of goods wished for.
   */
  setGoodsAmount(amount: number): void {
    this.amountRequested = amount;
  }
  /**
   * {@inheritDoc}
   */
  satisfiedBy$Unit(unit: Unit): boolean {
    return false;
  }
  /**
   * Does some specified goods satisfy this wish?
   *
   * @param <T> The base type of the goods.
   * @param goods The goods to test.
   * @return True if the goods type matches and amount is not less than
   *     that requested.
   */
  satisfiedBy$AbstractGoods<T>(goods: T): boolean {
    return goods.getType() === this.goodsType && goods.getAmount() >= this.amountRequested;
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity$boolean$LogBuilder(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity$boolean$LogBuilder(fix, lb);
    if (this.goodsType == null) {
      lb.add(['\n  GoodsWish without type: ', this.getId()]);
      result = result.fail();
    } else if (this.amountRequested <= 0) {
      lb.add(['\n  GoodsWish with non-positive requested: ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(GoodsWish.GOODS_TYPE_TAG, this.goodsType);
    xw.writeAttribute$String$int(GoodsWish.AMOUNT_REQUESTED_TAG, this.amountRequested);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let aiMain = this.getAIMain();
    let spec = this.getSpecification();
    this.transportable = (xr.hasAttribute(GoodsWish.TRANSPORTABLE_TAG)) ? xr.makeAIObject(aiMain, GoodsWish.TRANSPORTABLE_TAG, $J.cls(AIGoods), null, true) : null;
    this.goodsType = xr.getType(spec, GoodsWish.GOODS_TYPE_TAG, $J.cls(GoodsType), null);
    this.amountRequested = xr.getAttribute$String$int(GoodsWish.AMOUNT_REQUESTED_TAG, GoodsContainer.CARGO_SIZE);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return GoodsWish.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (!(o instanceof GoodsWish)) {
      return false;
    }
    let other = o;
    return this.amountRequested === other.amountRequested && Utils.equals(this.goodsType, other.goodsType) && super.equals(other);
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(37, hash) + Utils.hashCode(this.goodsType)) | 0;
    return (Math.imul(37, hash) + this.amountRequested) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let lb = new LogBuilder()._LogBuilder(32);
    lb.add(['[', this.getId(), ' ', this.amountRequested, ' ', ((this.goodsType == null) ? 'null' : this.goodsType.getSuffix$()), ' -> ', this.destination, ' (', this.getValue(), ')]']);
    return lb.toString();
  }
  static $clinit() {
    GoodsWish.logger = Logger.getLogger($J.cls(GoodsWish).getName());
  }
}

$J.define(GoodsWish, 'net.sf.freecol.server.ai.GoodsWish', { kind: 'class', sup: 'net.sf.freecol.server.ai.Wish', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_GoodsWish$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.Location,int,int,net.sf.freecol.common.model.GoodsType': '_GoodsWish$AIMain$Location$int$int$GoodsType', 'net.sf.freecol.server.ai.AIMain,java.lang.String': '_GoodsWish$AIMain$String' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getGoodsAmount': 'int', 'getGoodsType': 'net.sf.freecol.common.model.GoodsType' }, meths: { 'checkIntegrity(boolean,net.sf.freecol.common.util.LogBuilder)': 'checkIntegrity$boolean$LogBuilder', 'satisfiedBy(net.sf.freecol.common.model.AbstractGoods)': 'satisfiedBy$AbstractGoods', 'satisfiedBy(net.sf.freecol.common.model.Unit)': 'satisfiedBy$Unit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  AIGoods = $J.load('net.sf.freecol.server.ai.AIGoods');
});
