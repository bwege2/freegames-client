// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/NativeTrade.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum, JFunction, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let IndianSettlement, NativeTradeItem, StringTemplate, Unit, CollectionUtils;

/**
 * Container class for the information that persists while a
 * native trade session is underway.
 */
export class NativeTrade extends FreeColGameObject {
  static logger: Logger = null;
  static readonly TAG: string = 'nativeTrade';
  /**
   * A template to use as a magic cookie for aborted trades.
   */
  static abortTrade: StringTemplate = null;
  /**
   * The unit that is trading.
   */
  unit: Unit = null;
  /**
   * The settlement to trade with.
   */
  is: IndianSettlement = null;
  /**
   * How many times this trade has been tried.
   */
  count_: number = 0;
  /**
   * True if no purchases made in this trade.
   */
  buy: boolean = false;
  /**
   * True if no sales made in this trade.
   */
  sell: boolean = false;
  /**
   * True if no gifts made in this trade.
   */
  gift: boolean = false;
  /**
   * An item under consideration for a transaction.
   */
  item: NativeTradeItem = null;
  /**
   * The goods on the unit that are being offered for purchase by
   * the settlement.
   */
  unitToSettlement: List<NativeTradeItem> = null;
  /**
   * The goods in the settlement that are being offered for purchase
   * by the unit.
   */
  settlementToUnit: List<NativeTradeItem> = null;
  static readonly BUY_TAG: string = 'buy';
  static readonly COUNT_TAG: string = 'count';
  static readonly GIFT_TAG: string = 'gift';
  static readonly SELL_TAG: string = 'sell';
  static readonly SETTLEMENT_TAG: string = 'settlement';
  static readonly SETTLEMENT_TO_UNIT_TAG: string = 'settlementToUnit';
  static readonly UNIT_TAG: string = 'unit';
  static readonly UNIT_TO_SETTLEMENT_TAG: string = 'unitToSettlement';
  $init_NativeTrade() {
    this.unitToSettlement = new ArrayList();
    this.settlementToUnit = new ArrayList();
  }
  /**
   * Simple constructor, used in Game.newInstance.
   *
   * @param game The enclosing {@code Game}.
   * @param id The identifier (ignored).
   */
  _NativeTrade$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    this.$init_NativeTrade();
    return this;
  }
  /**
   * Create a new trade session.
   *
   * @param unit The {@code Unit} that is trading.
   * @param is The {@code IndianSettlement} to trade with.
   */
  _NativeTrade$Unit$IndianSettlement(unit: Unit, is$: IndianSettlement): this {
    this._NativeTrade$Game$String(unit.getGame(), '');
    this.unit = unit;
    this.is = is$;
    this.count_ = 0;
    this.buy = this.sell = this.gift = true;
    return this;
  }
  /**
   * Check if the trade participants are at war.
   *
   * @return True if the traders are at war.
   */
  atWar(): boolean {
    return this.is.getOwner().atWarWith(this.unit.getOwner());
  }
  /**
   * Get a key for this transaction.
   *
   * @return A suitable key.
   */
  getKey(): string {
    return NativeTrade.getNativeTradeKey(this.unit, this.is);
  }
  /**
   * Make a transaction key for a native trade.
   *
   * @param unit The {@code Unit} that is trading.
   * @param is The {@code IndianSettlement} that is trading.
   * @return A suitable key.
   */
  static getNativeTradeKey(unit: Unit, is$: IndianSettlement): string {
    return unit.getId() + '-' + is$.getId();
  }
  /**
   * Get the unit that is trading.
   *
   * @return The {@code Unit} that started the trade.
   */
  getUnit(): Unit {
    return this.unit;
  }
  /**
   * Get the settlement that is trading.
   *
   * @return The {@code IndianSettlement} that is traded with.
   */
  getIndianSettlement(): IndianSettlement {
    return this.is;
  }
  /**
   * Is purchasing available in this transaction?
   *
   * @return True if no blocking purchase has been made.
   */
  getBuy(): boolean {
    return this.buy;
  }
  /**
   * Can the unit owner buy more items in this session at present?
   *
   * @return True if not blocked, at peace, there are purchases to
   *     be made and space available.
   */
  canBuy(): boolean {
    return this.getBuy() && !this.atWar() && this.unit.getSpaceLeft() > 0 && (CollectionUtils.any$Collection$Predicate(this.getSettlementToUnit(), ($p0) => $p0.priceIsValid()));
  }
  /**
   * Set the purchase state.
   *
   * @param buy The new purchase state.
   */
  setBuy(buy: boolean): void {
    this.buy = buy;
  }
  /**
   * Is selling available in this transaction?
   *
   * @return True if no blocking sale has been made.
   */
  getSell(): boolean {
    return this.sell;
  }
  /**
   * Can the unit owner buy more items in this session at present?
   *
   * @return True if not blocked, at peace, and there are sales to be made.
   */
  canSell(): boolean {
    return this.getSell() && !this.atWar() && (CollectionUtils.any$Collection$Predicate(this.getUnitToSettlement(), ($p0) => $p0.priceIsValid()));
  }
  /**
   * Set the sale state.
   *
   * @param sell The new sale state.
   */
  setSell(sell: boolean): void {
    this.sell = sell;
  }
  /**
   * Is giving available in this transaction?
   *
   * @return True if no blocking gift has been made.
   */
  getGift(): boolean {
    return this.gift;
  }
  /**
   * Can the unit owner give more items in this session at present?
   *
   * @return True if not blocked, and the unit has gifts to give.
   */
  canGift(): boolean {
    return this.getGift() && this.unit.hasGoodsCargo();
  }
  /**
   * Set the gift state.
   *
   * @param gift The new gift state.
   */
  setGift(gift: boolean): void {
    this.gift = gift;
  }
  /**
   * Have no trades been performed in this transaction?
   *
   * @return True if no blocking purchase, sale or gift has occurred.
   */
  hasNotTraded(): boolean {
    return this.getBuy() && this.getSell() && this.getGift();
  }
  /**
   * Get the transaction count.
   *
   * @return The transaction count.
   */
  getCount(): number {
    return this.count_;
  }
  /**
   * Set the transaction count.
   *
   * @param count The new transaction count.
   */
  setCount(count: number): void {
    this.count_ = count;
  }
  /**
   * Is this transaction complete?
   *
   * @return True if the transaction is over.
   */
  getDone(): boolean {
    return this.count_ < 0 || (!this.canBuy() && !this.canSell() && !this.canGift());
  }
  /**
   * Set this transaction as complete.
   */
  setDone(): void {
    this.count_ = -1;
  }
  /**
   * Get the item being traded.
   *
   * @return The current {@code NativeTradeItem}.
   */
  getItem(): NativeTradeItem {
    return this.item;
  }
  /**
   * Set the item being traded.
   *
   * @param nti The new {@code NativeTradeItem}.
   */
  setItem(nti: NativeTradeItem): void {
    this.item = nti;
  }
  /**
   * Get the list of items the unit is able to offer the settlement.
   *
   * Note: some of these items might be currently invalid.
   *
   * @return A list of {@code NativeTradeItem}s the unit might sell.
   */
  getUnitToSettlement(): List<NativeTradeItem> {
    return this.unitToSettlement;
  }
  /**
   * Get the list of items the settlement is able to offer the unit.
   *
   * Note: some of these items might be currently invalid.
   *
   * @return A list of {@code NativeTradeItem}s the unit might buy.
   */
  getSettlementToUnit(): List<NativeTradeItem> {
    return this.settlementToUnit;
  }
  /**
   * Add an item to the unit list of items.
   *
   * @param nti The {@code NativeTradeItem} to add.
   */
  addToUnit(nti: NativeTradeItem): void {
    this.unitToSettlement.add(nti);
  }
  /**
   * Remove an item from the unit list of items.
   *
   * @param nti The {@code NativeTradeItem} to remove.
   */
  removeFromUnit(nti: NativeTradeItem): void {
    CollectionUtils.removeInPlace$Collection$Predicate(this.unitToSettlement, nti.goodsMatcher());
  }
  /**
   * Is another native trade compatible with this one?
   *
   * @param nt The other {@code NativeTrade}.
   * @return True if the other trade is compatible.
   */
  isCompatible(nt: NativeTrade): boolean {
    return $J.equals(this.getKey(), nt.getKey());
  }
  /**
   * Raw initialization of the unit and settlement list.
   * Does not do pricing!
   */
  initialize(): void {
    let unitPlayer = this.unit.getOwner();
    let settlementPlayer = this.is.getOwner();
    let game = this.unit.getGame();
    for (const $it0 = this.unit.getGoodsList().iterator(); $it0.hasNext(); ) {
      let g = $it0.next();
      this.unitToSettlement.add(new NativeTradeItem()._NativeTradeItem$Game$Player$Player$Goods(game, unitPlayer, settlementPlayer, g));
    }
    for (const $it1 = this.is.getSellGoods(this.unit).iterator(); $it1.hasNext(); ) {
      let g = $it1.next();
      this.settlementToUnit.add(new NativeTradeItem()._NativeTradeItem$Game$Player$Player$Goods(game, settlementPlayer, unitPlayer, g));
    }
  }
  /**
   * Merge another compatible native trade into this one.
   *
   * @param nt The {@code NativeTrade} to merge.
   */
  mergeFrom(nt: NativeTrade): void {
    if (this.isCompatible(nt) && !this.equals(nt)) {
      this.unitToSettlement.clear();
      this.unitToSettlement.addAll(nt.getUnitToSettlement());
      this.settlementToUnit.clear();
      this.settlementToUnit.addAll(nt.getSettlementToUnit());
      this.item = nt.getItem();
    }
  }
  /**
   * Limit the number of items offered by the settlement.
   *
   * Used in the client to implement a Col1 restriction.
   *
   * @param n The number of items to offer.
   */
  limitSettlementToUnit(n: number): void {
    let best = CollectionUtils.transform$Collection$Predicate$Function$Comparator(this.settlementToUnit, ($p0) => $p0.priceIsValid(), JFunction.identity(), NativeTradeItem.descendingPriceComparator);
    if (best.size() <= n) {
      return;
    }
    for (const $it2 = best.subList(n, best.size()).iterator(); $it2.hasNext(); ) {
      let nti = $it2.next();
      nti.setPrice(NativeTradeItem.PRICE_INVALID);
    }
  }
  /**
   * Choose the next available upward haggling price.
   *
   * @param price The initial price.
   * @return The new upward haggled price.
   */
  static haggleUp(price: number): number {
    return $J.idiv((Math.imul(price, 11)), 10);
  }
  /**
   * Choose the next available downward haggling price.
   *
   * @param price The initial price.
   * @return The new downward haggled price.
   */
  static haggleDown(price: number): number {
    return $J.idiv((Math.imul(price, 9)), 10);
  }
  /**
   * {@inheritDoc}
   */
  isInternable(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(NativeTrade));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.unit = game.updateRef$FreeColGameObject(o.getUnit());
    this.is = game.updateRef$FreeColGameObject(o.getIndianSettlement());
    this.count_ = o.getCount();
    this.buy = o.getBuy();
    this.sell = o.getSell();
    this.gift = o.getGift();
    this.item = game.update$FreeColGameObject$boolean(o.getItem(), false);
    this.unitToSettlement = game.update$Collection$boolean(o.getUnitToSettlement(), false);
    this.settlementToUnit = game.update$Collection$boolean(o.getSettlementToUnit(), false);
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$boolean(NativeTrade.BUY_TAG, this.buy);
    xw.writeAttribute$String$int(NativeTrade.COUNT_TAG, this.count_);
    xw.writeAttribute$String$boolean(NativeTrade.GIFT_TAG, this.gift);
    xw.writeAttribute$String$boolean(NativeTrade.SELL_TAG, this.sell);
    xw.writeAttribute$String$FreeColObject(NativeTrade.SETTLEMENT_TAG, this.is);
    xw.writeAttribute$String$FreeColObject(NativeTrade.UNIT_TAG, this.unit);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    xw.writeStartElement(NativeTrade.SETTLEMENT_TO_UNIT_TAG);
    for (const $it3 = this.settlementToUnit.iterator(); $it3.hasNext(); ) {
      let nti = $it3.next();
      nti.toXML$FreeColXMLWriter(xw);
    }
    xw.writeEndElement();
    xw.writeStartElement(NativeTrade.UNIT_TO_SETTLEMENT_TAG);
    for (const $it4 = this.unitToSettlement.iterator(); $it4.hasNext(); ) {
      let nti = $it4.next();
      nti.toXML$FreeColXMLWriter(xw);
    }
    xw.writeEndElement();
    if (this.item != null) {
      this.item.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    let game = this.getGame();
    super.readAttributes(xr);
    this.buy = xr.getAttribute$String$boolean(NativeTrade.BUY_TAG, false);
    this.count_ = xr.getAttribute$String$int(NativeTrade.COUNT_TAG, -1);
    this.gift = xr.getAttribute$String$boolean(NativeTrade.GIFT_TAG, false);
    this.sell = xr.getAttribute$String$boolean(NativeTrade.SELL_TAG, false);
    this.is = xr.getAttribute$Game$String$Class$FreeColObject(game, NativeTrade.SETTLEMENT_TAG, $J.cls(IndianSettlement), null);
    this.unit = xr.getAttribute$Game$String$Class$FreeColObject(game, NativeTrade.UNIT_TAG, $J.cls(Unit), null);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.unitToSettlement.clear();
    this.settlementToUnit.clear();
    this.item = null;
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    let game = this.getGame();
    if ($J.equals(NativeTrade.SETTLEMENT_TO_UNIT_TAG, tag)) {
      while (xr.moreTags()) {
        tag = xr.getLocalName();
        if ($J.equals(NativeTradeItem.TAG, tag)) {
          this.settlementToUnit.add(new NativeTradeItem()._NativeTradeItem$Game$FreeColXMLReader(game, xr));
        } else {
          NativeTrade.logger.warning('SettlementToUnit-item expected, not: ' + tag);
        }
      }
    } else if ($J.equals(NativeTrade.UNIT_TO_SETTLEMENT_TAG, tag)) {
      while (xr.moreTags()) {
        tag = xr.getLocalName();
        if ($J.equals(NativeTradeItem.TAG, tag)) {
          this.unitToSettlement.add(new NativeTradeItem()._NativeTradeItem$Game$FreeColXMLReader(game, xr));
        } else {
          NativeTrade.logger.warning('UnitToSettlement-item expected, not: ' + tag);
        }
      }
    } else if ($J.equals(NativeTradeItem.TAG, tag)) {
      this.item = new NativeTradeItem()._NativeTradeItem$Game$FreeColXMLReader(game, xr);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return NativeTrade.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(128);
    let item = this.getItem();
    sb.append(String.fromCharCode(91 /* '[' */)).append(NativeTrade.TAG).append(String.fromCharCode(32 /* ' ' */)).append(this.getUnit().getId()).append(String.fromCharCode(32 /* ' ' */)).append(this.getIndianSettlement().getId()).append(' buy=').append(String(this.getBuy())).append(' sell=').append(String(this.getSell())).append(' gift=').append(String(this.getGift())).append(' count=').append(String(this.getCount())).append(' item=').append((item == null) ? 'null' : item.toString()).append(' unitToSettlement[');
    for (const $it5 = this.unitToSettlement.iterator(); $it5.hasNext(); ) {
      let nti = $it5.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(nti));
    }
    sb.append('] settlementToUnit[');
    for (const $it6 = this.settlementToUnit.iterator(); $it6.hasNext(); ) {
      let nti = $it6.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(nti));
    }
    return sb.append(' ]]').toString();
  }
  static $clinit() {
    NativeTrade.logger = Logger.getLogger($J.cls(NativeTrade).getName());
    NativeTrade.abortTrade = StringTemplate.template$String('');
  }
}

/**
 * The type of native trade command.
 */
export class NativeTrade$NativeTradeAction extends JEnum {
  /**
   * Does this action close the trade?
   */
  closing: boolean = false;
  /**
   * Should this action originate with a European player?
   */
  fromEuropeans: boolean = false;
  static OPEN: NativeTrade$NativeTradeAction = null;
  static CLOSE: NativeTrade$NativeTradeAction = null;
  static BUY: NativeTrade$NativeTradeAction = null;
  static SELL: NativeTrade$NativeTradeAction = null;
  static GIFT: NativeTrade$NativeTradeAction = null;
  static ACK_OPEN: NativeTrade$NativeTradeAction = null;
  static ACK_BUY: NativeTrade$NativeTradeAction = null;
  static ACK_SELL: NativeTrade$NativeTradeAction = null;
  static ACK_GIFT: NativeTrade$NativeTradeAction = null;
  static ACK_BUY_HAGGLE: NativeTrade$NativeTradeAction = null;
  static ACK_SELL_HAGGLE: NativeTrade$NativeTradeAction = null;
  static NAK_GOODS: NativeTrade$NativeTradeAction = null;
  static NAK_HAGGLE: NativeTrade$NativeTradeAction = null;
  static NAK_HOSTILE: NativeTrade$NativeTradeAction = null;
  static NAK_NOSALE: NativeTrade$NativeTradeAction = null;
  static NAK_INVALID: NativeTrade$NativeTradeAction = null;
  static $VALUES: NativeTrade$NativeTradeAction[] = null;
  /**
   * Create a new native trade action.
   *
   * @param closing If true this is an action that closes the session.
   * @param fromEuropeans True if a European action.
   */
  _NativeTrade$NativeTradeAction($name: string, $ordinal: number, closing: boolean, fromEuropeans: boolean): this {
    this._JEnum($name, $ordinal);
    this.closing = closing;
    this.fromEuropeans = fromEuropeans;
    return this;
  }
  /**
   * Is this a closing action?
   *
   * @return True if a closing action.
   */
  isClosing(): boolean {
    return this.closing;
  }
  /**
   * Should this action have come from a European player?
   *
   * @return True if a European action.
   */
  isEuropean(): boolean {
    return this.fromEuropeans;
  }
  static values(): NativeTrade$NativeTradeAction[] { return NativeTrade$NativeTradeAction.$VALUES.slice(); }
  static valueOf(name: string): NativeTrade$NativeTradeAction { return $J.enumValueOf(NativeTrade$NativeTradeAction, name); }
  static $clinit() {
    NativeTrade$NativeTradeAction.OPEN = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('OPEN', 0, false, true);
    NativeTrade$NativeTradeAction.CLOSE = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('CLOSE', 1, true, true);
    NativeTrade$NativeTradeAction.BUY = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('BUY', 2, false, true);
    NativeTrade$NativeTradeAction.SELL = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('SELL', 3, false, true);
    NativeTrade$NativeTradeAction.GIFT = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('GIFT', 4, false, true);
    NativeTrade$NativeTradeAction.ACK_OPEN = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('ACK_OPEN', 5, false, false);
    NativeTrade$NativeTradeAction.ACK_BUY = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('ACK_BUY', 6, false, false);
    NativeTrade$NativeTradeAction.ACK_SELL = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('ACK_SELL', 7, false, false);
    NativeTrade$NativeTradeAction.ACK_GIFT = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('ACK_GIFT', 8, false, false);
    NativeTrade$NativeTradeAction.ACK_BUY_HAGGLE = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('ACK_BUY_HAGGLE', 9, false, false);
    NativeTrade$NativeTradeAction.ACK_SELL_HAGGLE = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('ACK_SELL_HAGGLE', 10, false, false);
    NativeTrade$NativeTradeAction.NAK_GOODS = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('NAK_GOODS', 11, false, false);
    NativeTrade$NativeTradeAction.NAK_HAGGLE = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('NAK_HAGGLE', 12, true, false);
    NativeTrade$NativeTradeAction.NAK_HOSTILE = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('NAK_HOSTILE', 13, true, false);
    NativeTrade$NativeTradeAction.NAK_NOSALE = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('NAK_NOSALE', 14, true, false);
    NativeTrade$NativeTradeAction.NAK_INVALID = new NativeTrade$NativeTradeAction()._NativeTrade$NativeTradeAction('NAK_INVALID', 15, true, false);
    NativeTrade$NativeTradeAction.$VALUES = [NativeTrade$NativeTradeAction.OPEN, NativeTrade$NativeTradeAction.CLOSE, NativeTrade$NativeTradeAction.BUY, NativeTrade$NativeTradeAction.SELL, NativeTrade$NativeTradeAction.GIFT, NativeTrade$NativeTradeAction.ACK_OPEN, NativeTrade$NativeTradeAction.ACK_BUY, NativeTrade$NativeTradeAction.ACK_SELL, NativeTrade$NativeTradeAction.ACK_GIFT, NativeTrade$NativeTradeAction.ACK_BUY_HAGGLE, NativeTrade$NativeTradeAction.ACK_SELL_HAGGLE, NativeTrade$NativeTradeAction.NAK_GOODS, NativeTrade$NativeTradeAction.NAK_HAGGLE, NativeTrade$NativeTradeAction.NAK_HOSTILE, NativeTrade$NativeTradeAction.NAK_NOSALE, NativeTrade$NativeTradeAction.NAK_INVALID];
  }
}

$J.define(NativeTrade, 'net.sf.freecol.common.model.NativeTrade', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.IndianSettlement': '_NativeTrade$Unit$IndianSettlement', 'net.sf.freecol.common.model.Game,java.lang.String': '_NativeTrade$Game$String' }, returns: { 'getXMLTagName': 'java.lang.String', 'isInternable': 'boolean', 'getSettlementToUnit': 'java.util.List', 'getUnitToSettlement': 'java.util.List', 'getItem': 'net.sf.freecol.common.model.NativeTradeItem', 'getDone': 'boolean', 'getCount': 'int', 'hasNotTraded': 'boolean', 'getGift': 'boolean', 'getSell': 'boolean', 'getBuy': 'boolean', 'getIndianSettlement': 'net.sf.freecol.common.model.IndianSettlement', 'getUnit': 'net.sf.freecol.common.model.Unit', 'getKey': 'java.lang.String' }, clinit: true, lazy: ['logger', 'abortTrade'] });
$J.define(NativeTrade$NativeTradeAction, 'net.sf.freecol.common.model.NativeTrade$NativeTradeAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'boolean,boolean': '_NativeTrade$NativeTradeAction' }, returns: { 'isEuropean': 'boolean', 'isClosing': 'boolean' }, clinit: true, lazy: ['$VALUES', 'OPEN', 'CLOSE', 'BUY', 'SELL', 'GIFT', 'ACK_OPEN', 'ACK_BUY', 'ACK_SELL', 'ACK_GIFT', 'ACK_BUY_HAGGLE', 'ACK_SELL_HAGGLE', 'NAK_GOODS', 'NAK_HAGGLE', 'NAK_HOSTILE', 'NAK_NOSALE', 'NAK_INVALID'] });
$J.module(() => {
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  NativeTradeItem = $J.load('net.sf.freecol.common.model.NativeTradeItem');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
