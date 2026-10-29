// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/AIGoods.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../jre/index.ts';
import { TransportableAIObject } from './TransportableAIObject.ts';

let Colony, Europe, Goods, Location, Settlement, Unit, LogBuilder, Utils, AIMessage, Mission;

/**
 * Objects of this class contains AI-information for a single {@link Goods}.
 */
export class AIGoods extends TransportableAIObject {
  static logger: Logger = null;
  static readonly TAG: string = 'aiGoods';
  /**
   * The underlying goods.
   */
  goods: Goods = null;
  /**
   * The destination location for the goods.
   */
  destination: Location = null;
  static readonly DESTINATION_TAG: string = 'destination';
  /**
   * Creates a new uninitialized {@code AIGoods}.
   *
   * @param aiMain The main AI-object.
   * @param id The object identifier.
   */
  _AIGoods$AIMain$String(aiMain: AIMain, id: string): this {
    this._TransportableAIObject$AIMain$String(aiMain, id);
    this.goods = null;
    this.destination = null;
    this.initialized = false;
    return this;
  }
  /**
   * Creates a new {@code AIGoods}.
   *
   * @param aiMain The main AI-object.
   * @param location The location of the goods.
   * @param type The type of goods.
   * @param amount The amount of goods.
   * @param destination The destination of the goods. This is the
   *      {@code Location} to which the goods should be transported.
   */
  _AIGoods$AIMain$Location$GoodsType$int$Location(aiMain: AIMain, location: Location, type$: GoodsType, amount: number, destination: Location): this {
    this._AIGoods$AIMain$String(aiMain, AIGoods.TAG + ':' + aiMain.getNextId());
    this.goods = new Goods()._Goods$Game$Location$GoodsType$int(aiMain.getGame(), location, type$, amount);
    this.destination = destination;
    this.setInitialized();
    return this;
  }
  /**
   * Creates a new {@code AIGoods} from the given
   * XML-representation.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @exception XMLStreamException if a problem was encountered
   *      during parsing.
   */
  _AIGoods$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._TransportableAIObject$AIMain$FreeColXMLReader(aiMain, xr);
    this.setInitialized();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setInitialized(): void {
    this.initialized = this.getGoods() != null;
  }
  /**
   * Gets the goods this {@code AIGoods} is controlling.
   *
   * @return The {@code Goods}.
   */
  getGoods(): Goods {
    return this.goods;
  }
  /**
   * Sets the goods this {@code AIGoods} is controlling.
   *
   * @param goods The new {@code Goods}.
   */
  setGoods(goods: Goods): void {
    this.goods = goods;
  }
  /**
   * Gets the type of goods this {@code AIGoods} is controlling.
   *
   * @return The {@code GoodsType}.
   */
  getGoodsType(): GoodsType {
    return this.goods.getType();
  }
  /**
   * Gets the amount of goods this {@code AIGoods} is controlling.
   *
   * @return The amount of goods.
   */
  getGoodsAmount(): number {
    return this.goods.getAmount();
  }
  /**
   * Sets the amount of goods this {@code AIGoods} is controlling.
   *
   * @param amount The new amount of goods.
   */
  setGoodsAmount(amount: number): void {
    this.goods.setAmount(amount);
  }
  /**
   * Goods leaves a ship.
   *
   * @param amount The amount of goods to unload.
   * @return True if the unload succeeds.
   */
  leaveTransport$int$AIGoods(amount: number): boolean {
    if (!(this.goods.getLocation() instanceof Unit)) {
      return false;
    }
    let carrier = this.goods.getLocation();
    let type$ = this.goods.getType();
    if (carrier.getGoodsCount(type$) < amount) {
      return false;
    }
    let aiCarrier = this.getAIMain().getAIUnit(carrier);
    let oldAmount = carrier.getGoodsCount(type$);
    let result = AIMessage.askUnloadGoods(type$, amount, aiCarrier);
    if (result) {
      let newAmount = carrier.getGoodsCount(type$);
      if (((oldAmount - newAmount) | 0) !== amount) {
        AIGoods.logger.warning('Partial goods unload, expected: ' + amount + ', got: ' + ((oldAmount - newAmount) | 0));
        result = false;
      }
      AIGoods.logger.fine('Unloaded ' + amount + ' ' + $J.str(type$) + ' from ' + oldAmount + ' leaving ' + newAmount + ' off of ' + $J.str(carrier) + ' at ' + $J.str(carrier.getLocation()));
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getTransportLocatable(): Locatable {
    return this.getGoods();
  }
  /**
   * {@inheritDoc}
   */
  getTransportSource(): Location {
    return (this.goods == null) ? null : this.goods.getLocation();
  }
  /**
   * {@inheritDoc}
   */
  getTransportDestination(): Location {
    return this.destination;
  }
  /**
   * {@inheritDoc}
   */
  setTransportDestination(destination: Location): void {
    this.destination = destination;
  }
  /**
   * {@inheritDoc}
   */
  getDeliveryPath(carrier: Unit, dst: Location): PathNode {
    if (dst == null) {
      dst = Location.upLoc(this.getTransportDestination());
    }
    let path = (this.goods.getLocation() === carrier) ? carrier.findPath$Location(dst) : (this.goods.getLocation() instanceof Unit) ? null : carrier.findPath$Location$Location(this.goods.getLocation(), dst);
    if (path != null) {
      path.convertToGoodsDeliveryPath();
    }
    return path;
  }
  /**
   * {@inheritDoc}
   */
  getIntermediatePath(carrier: Unit, dst: Location): PathNode {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  carriableBy(carrier: Unit): boolean {
    return carrier.couldCarry$Goods(this.getGoods());
  }
  /**
   * {@inheritDoc}
   */
  canMove(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  leaveTransport$(): boolean {
    return this.leaveTransport$Direction(null);
  }
  /**
   * {@inheritDoc}
   */
  leaveTransport$Direction(direction: Direction): boolean {
    if (direction != null) {
      return false;
    }
    return this.leaveTransport$int$AIGoods(this.goods.getAmount());
  }
  /**
   * {@inheritDoc}
   */
  joinTransport(carrier: Unit, direction: Direction): boolean {
    if (direction != null) {
      return false;
    }
    let aiCarrier = this.getAIMain().getAIUnit(carrier);
    if (aiCarrier == null) {
      return false;
    }
    let type$ = this.goods.getType();
    let failed = false;
    let oldAmount = carrier.getGoodsCount(type$);
    let goodsAmount = this.goods.getAmount();
    let amount = Math.min(goodsAmount, carrier.getLoadableAmount(type$));
    if (AIMessage.askLoadGoods(this.goods.getLocation(), type$, amount, aiCarrier)) {
      this.setGoods(new Goods()._Goods$Game$Location$GoodsType$int(this.getGame(), carrier, type$, amount));
      let colony = carrier.getColony();
      if (colony != null) {
        this.getAIMain().getAIColony(colony).removeExportGoods(this);
      }
    }
    AIGoods.logger.fine('Loaded ' + amount + ' ' + type$.getSuffix$() + ' over ' + oldAmount + ' leaving ' + ((goodsAmount - amount) | 0) + ' onto ' + $J.str(carrier) + ' at ' + $J.str(carrier.getLocation()));
    return !failed;
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    let reason = Mission.invalidTransportableReason(this);
    let s: Settlement;
    return (reason != null) ? reason : (this.goods.getLocation() instanceof Unit && this.destination instanceof Settlement && !(this.goods.getLocation()).getOwner().owns(s = this.destination)) ? 'transportableDestination-' + s.getName() + '-captured-by-' + s.getOwner().getDebugName() : null;
  }
  /**
   * Disposes this object.
   */
  dispose(): void {
    this.dropTransport();
    if (this.destination != null) {
      if (this.destination instanceof Colony) {
        let aic = this.getAIMain().getAIColony(this.destination);
        if (aic != null) {
          aic.removeExportGoods(this);
        }
      } else if (this.destination instanceof Europe) {
      } else {
        AIGoods.logger.warning('Unknown type of destination: ' + $J.str(this.destination));
      }
      this.destination = null;
    }
    this.goods = null;
    super.dispose();
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity$boolean$LogBuilder(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity$boolean$LogBuilder(fix, lb);
    let why = (!result.safe()) ? 'super' : (this.goods == null) ? 'null-goods' : (this.goods.getType() == null) ? 'null-goods-type' : (this.goods.getAmount() <= 0) ? 'non-positive-goods-amount' : (this.goods.getLocation() == null) ? 'null-location' : ((this.goods.getLocation()).isDisposed()) ? 'disposed-location' : null;
    if (this.destination != null && (this.destination).isDisposed()) {
      if (fix) {
        lb.add(['\n  Fixing disposed destination for: ', this.getId()]);
        this.destination = null;
        result = result.fix();
      } else {
        why = 'disposed-destination';
      }
    }
    if (why != null) {
      lb.add(['\n  AIGoods with ', why, ': ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.destination != null) {
      xw.writeAttribute(AIGoods.DESTINATION_TAG, this.destination.getId());
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.goods != null) {
      this.goods.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let game = this.getAIMain().getGame();
    this.destination = xr.getLocationAttribute(game, AIGoods.DESTINATION_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(Goods.TAG, tag)) {
      if (this.goods != null) {
        this.goods.readFromXML(xr);
      } else {
        this.goods = new Goods()._Goods$Game$FreeColXMLReader(this.getAIMain().getGame(), xr);
      }
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return AIGoods.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (!(o instanceof AIGoods)) {
      return false;
    }
    let other = o;
    return Utils.equals(this.goods, other.goods) && Utils.equals(this.destination, other.destination) && super.equals(other);
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(37, hash) + Utils.hashCode(this.goods)) | 0;
    return (Math.imul(37, hash) + Utils.hashCode(this.destination)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let lb = new LogBuilder()._LogBuilder(64);
    lb.add(['[', this.getId(), ' ', this.goods]);
    if (this.goods != null) {
      lb.add([' at ', this.goods.getLocation()]);
    }
    lb.add([' -> ', this.destination]);
    let transport = this.getTransport();
    if (transport != null) {
      lb.add([' using ', transport.getUnit()]);
    }
    lb.add(['/', this.getTransportPriority(), ']']);
    return lb.toString();
  }
  static $clinit() {
    AIGoods.logger = Logger.getLogger($J.cls(AIGoods).getName());
  }
}

$J.define(AIGoods, 'net.sf.freecol.server.ai.AIGoods', { kind: 'class', sup: 'net.sf.freecol.server.ai.TransportableAIObject', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_AIGoods$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.Location,net.sf.freecol.common.model.GoodsType,int,net.sf.freecol.common.model.Location': '_AIGoods$AIMain$Location$GoodsType$int$Location', 'net.sf.freecol.server.ai.AIMain,java.lang.String': '_AIGoods$AIMain$String' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getTransportDestination': 'net.sf.freecol.common.model.Location', 'getTransportSource': 'net.sf.freecol.common.model.Location', 'getTransportLocatable': 'net.sf.freecol.common.model.Locatable', 'getGoodsAmount': 'int', 'getGoodsType': 'net.sf.freecol.common.model.GoodsType', 'getGoods': 'net.sf.freecol.common.model.Goods' }, meths: { 'checkIntegrity(boolean,net.sf.freecol.common.util.LogBuilder)': 'checkIntegrity$boolean$LogBuilder', 'leaveTransport(net.sf.freecol.common.model.Direction)': 'leaveTransport$Direction', 'leaveTransport()': 'leaveTransport$', 'leaveTransport(int)': 'leaveTransport$int$AIGoods' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
  Mission = $J.load('net.sf.freecol.server.ai.mission.Mission');
});
