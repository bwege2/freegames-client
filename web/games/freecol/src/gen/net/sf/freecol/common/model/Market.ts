// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Market.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator, HashMap, JEnum, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let MarketData, ModelMessage, ModelMessage$MessageType, Player, CollectionUtils;

/**
 * This class implements a simple economic model where a market holds
 * all goods to be sold and the price of a particular goods type is
 * determined solely by its availability in that market.
 */
export class Market extends FreeColGameObject {
  static logger: Logger = null;
  static readonly TAG: string = 'market';
  /**
   * European markets are bottomless.  Goods present never decrease
   * below this threshold.
   */
  static readonly MINIMUM_AMOUNT: number = 100;
  static readonly PRICE_CHANGE: string = 'priceChange';
  /**
   * The contents of the market, keyed by goods type.
   */
  marketData: JMap<GoodsType, MarketData> = null;
  /**
   * The owning player.
   */
  owner: Player = null;
  /**
   * Watching listeners.
   */
  transactionListeners: ArrayList<TransactionListener> = null;
  static readonly OWNER_TAG: string = 'owner';
  $init_Market() {
    this.marketData = new HashMap();
    this.transactionListeners = new ArrayList();
  }
  /**
   * Main constructor for creating a market for a new player.
   *
   * @param game The enclosing {@code Game}.
   * @param player The {@code Player} to own the market.
   */
  _Market$Game$Player(game: Game, player: Player): this {
    this._FreeColGameObject$Game(game);
    this.$init_Market();
    this.owner = player;
    for (const $it0 = this.getSpecification().getStorableGoodsTypeList().iterator(); $it0.hasNext(); ) {
      let goodsType = $it0.next();
      this.putMarketData(goodsType, new MarketData()._MarketData$Game$GoodsType(game, goodsType));
    }
    return this;
  }
  /**
   * Creates a new {@code Market} with the given identifier.
   *
   * The object should be initialized later.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _Market$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    this.$init_Market();
    return this;
  }
  /**
   * Get the market data.
   *
   * @return The map of goods type to market data.
   */
  getMarketData$$Market(): JMap<GoodsType, MarketData> {
    {
      return this.marketData;
    }
  }
  /**
   * Get the market data values.
   *
   * @return The market data in this market.
   */
  getMarketDataValues(): Collection<MarketData> {
    {
      return this.marketData.values();
    }
  }
  /**
   * Gets the market data for a type of goods.
   *
   * Public so the server can send individual MarketData updates.
   *
   * @param goodsType The {@code GoodsType} to look for.
   * @return The corresponding {@code MarketData}, or null if none.
   */
  getMarketData$GoodsType(goodsType: GoodsType): MarketData {
    {
      return this.marketData.get(goodsType);
    }
  }
  /**
   * Set the market data for a given goods type.
   *
   * @param goodsType The {@code GoodsType} to set the market data for.
   * @param data The new {@code MarketData}.
   */
  putMarketData(goodsType: GoodsType, data: MarketData): void {
    {
      this.marketData.put(goodsType, data);
    }
  }
  /**
   * Gets the market data for a specified goods type, creating it
   * if it does not exist yet.
   *
   * @param goodsType The {@code GoodsType} to query.
   * @return The {@code MarketData} required.
   */
  requireMarketData(goodsType: GoodsType): MarketData {
    let data = this.getMarketData$GoodsType(goodsType);
    if (data == null) {
      data = new MarketData()._MarketData$Game$GoodsType(this.getGame(), goodsType);
      this.putMarketData(goodsType, data);
    }
    return data;
  }
  /**
   * Set the market data.
   *
   * @param data The new market data.
   */
  setMarketData(data: JMap<GoodsType, MarketData>): void {
    {
      this.marketData.clear();
      this.marketData.putAll(data);
    }
  }
  /**
   * Clear the market data.
   */
  clearMarketData(): void {
    {
      this.marketData.clear();
    }
  }
  /**
   * Has a type of goods been traded in this market?
   *
   * @param type The type of goods to consider.
   * @return True if the goods type has been traded.
   */
  hasBeenTraded(type$: GoodsType): boolean {
    let data = this.getMarketData$GoodsType(type$);
    return data != null && data.getTraded();
  }
  /**
   * Determines the cost to buy a single unit of a particular type of good.
   *
   * @param type A {@code GoodsType} value.
   * @return The cost to buy a single unit of the given type of goods.
   */
  getCostToBuy(type$: GoodsType): number {
    let data = this.getMarketData$GoodsType(type$);
    return (data == null) ? 0 : data.getCostToBuy();
  }
  /**
   * Determines the price paid for the sale of a single unit of a particular
   * type of goods.
   *
   * @param type A {@code GoodsType} value.
   * @return The price for a single unit of the given type of goods
   *         if it is for sale.
   */
  getPaidForSale(type$: GoodsType): number {
    let data = this.getMarketData$GoodsType(type$);
    return (data == null) ? 0 : data.getPaidForSale();
  }
  /**
   * Add (or remove) some goods to this market.
   *
   * @param goodsType The {@code GoodsType} to add.
   * @param amount The amount of goods.
   * @return True if the price changes as a result of this addition.
   */
  addGoodsToMarket(goodsType: GoodsType, amount: number): boolean {
    let data = this.requireMarketData(goodsType);
    data.setAmountInMarket(Math.max(Market.MINIMUM_AMOUNT, (data.getAmountInMarket() + amount) | 0));
    data.setTraded(true);
    return data.price();
  }
  /**
   * Gets the initial price of a given goods type.
   *
   * @param goodsType The {@code GoodsType} to get the initial price of.
   * @return The initial price.
   */
  getInitialPrice(goodsType: GoodsType): number {
    let data = this.requireMarketData(goodsType);
    return data.getInitialPrice();
  }
  /**
   * Sets the initial price of a given goods type.
   *
   * @param goodsType The {@code GoodsType} to set the initial price of.
   * @param amount The new initial price.
   */
  setInitialPrice(goodsType: GoodsType, amount: number): void {
    let data = this.requireMarketData(goodsType);
    data.setInitialPrice(amount);
  }
  /**
   * Gets the price of a given goods when the {@code Player} buys.
   *
   * @param type a {@code GoodsType} value
   * @param amount The amount of goods.
   * @return The bid price of the given goods.
   */
  getBidPrice(type$: GoodsType, amount: number): number {
    let data = this.getMarketData$GoodsType(type$);
    return (data == null) ? 0 : Math.imul(amount, data.getCostToBuy());
  }
  /**
   * Gets the price of a given goods when the {@code Player} sells.
   *
   * @param type a {@code GoodsType} value
   * @param amount The amount of goods.
   * @return The sale price of the given goods.
   */
  getSalePrice$GoodsType$int(type$: GoodsType, amount: number): number {
    let data = this.getMarketData$GoodsType(type$);
    return (data == null) ? 0 : Math.imul(amount, data.getPaidForSale());
  }
  /**
   * Gets the price of a given goods when the {@code Player} sells.
   *
   * @param <T> The base type of the goods.
   * @param goods The {@code Goods} to evaluate.
   * @return The price.
   */
  getSalePrice$AbstractGoods<T>(goods: T): number {
    return this.getSalePrice$GoodsType$int(goods.getType(), goods.getAmount());
  }
  /**
   * Gets the arrears for of a given goods type.
   *
   * @param goodsType The {@code GoodsType} to get arrears for.
   * @return The arrears.
   */
  getArrears(goodsType: GoodsType): number {
    let data = this.getMarketData$GoodsType(goodsType);
    return (data == null) ? 0 : data.getArrears();
  }
  /**
   * Sets the arrears associated with a type of goods.
   *
   * @param goodsType The {@code GoodsType} to set the arrears for.
   * @param value The amount of arrears to set.
   */
  setArrears(goodsType: GoodsType, value: number): void {
    let data = this.requireMarketData(goodsType);
    data.setArrears(value);
  }
  /**
   * Gets the sales of a type of goods.
   *
   * @param goodsType The {@code GoodsType} to get the sales for.
   * @return The current sales amount.
   */
  getSales(goodsType: GoodsType): number {
    let data = this.getMarketData$GoodsType(goodsType);
    return (data == null) ? 0 : data.getSales();
  }
  /**
   * Modifies the sales of a type of goods.
   *
   * @param goodsType The {@code GoodsType} to set the sales for.
   * @param amount The amount of sales to add to the current amount.
   */
  modifySales(goodsType: GoodsType, amount: number): void {
    if (amount !== 0) {
      let data = this.requireMarketData(goodsType);
      data.setSales((data.getSales() + amount) | 0);
      data.setTraded(true);
    }
  }
  /**
   * Gets the income before taxes for a type of goods.
   *
   * @param goodsType The {@code GoodsType} to get the income for.
   * @return The current income before taxes.
   */
  getIncomeBeforeTaxes(goodsType: GoodsType): number {
    let data = this.getMarketData$GoodsType(goodsType);
    return (data == null) ? 0 : data.getIncomeBeforeTaxes();
  }
  /**
   * Modifies the income before taxes on sales of a type of goods.
   *
   * @param goodsType The {@code GoodsType} to set the income for.
   * @param amount The amount of tax income to add to the current amount.
   */
  modifyIncomeBeforeTaxes(goodsType: GoodsType, amount: number): void {
    let data = this.requireMarketData(goodsType);
    data.setIncomeBeforeTaxes((data.getIncomeBeforeTaxes() + amount) | 0);
  }
  /**
   * Gets the income after taxes for a type of goods.
   *
   * @param goodsType The {@code GoodsType} to get the income for.
   * @return The current income after taxes.
   */
  getIncomeAfterTaxes(goodsType: GoodsType): number {
    let data = this.getMarketData$GoodsType(goodsType);
    return (data == null) ? 0 : data.getIncomeAfterTaxes();
  }
  /**
   * Modifies the income after taxes on sales of a type of goods.
   *
   * @param goodsType The {@code GoodsType} to set the income for.
   * @param amount The amount of tax income to add to the current amount.
   */
  modifyIncomeAfterTaxes(goodsType: GoodsType, amount: number): void {
    let data = this.requireMarketData(goodsType);
    data.setIncomeAfterTaxes((data.getIncomeAfterTaxes() + amount) | 0);
  }
  /**
   * Gets the amount of a goods type in the market.
   *
   * @param goodsType The {@code GoodsType} to get the amount of.
   * @return The current amount of the goods in the market.
   */
  getAmountInMarket(goodsType: GoodsType): number {
    let data = this.getMarketData$GoodsType(goodsType);
    return (data == null) ? 0 : data.getAmountInMarket();
  }
  /**
   * Has the price of a type of goods changed in this market?
   *
   * @param goodsType The type of goods to consider.
   * @return True if the price has changed.
   */
  hasPriceChanged(goodsType: GoodsType): boolean {
    let data = this.getMarketData$GoodsType(goodsType);
    return data != null && data.getOldPrice() !== 0 && data.getOldPrice() !== data.getCostToBuy();
  }
  /**
   * Clear any price changes for a type of goods.
   *
   * @param goodsType The type of goods to consider.
   */
  flushPriceChange(goodsType: GoodsType): void {
    let data = this.getMarketData$GoodsType(goodsType);
    if (data != null) {
      data.setOldPrice(data.getCostToBuy());
    }
  }
  /**
   * Make up a {@code ModelMessage} describing the change in this
   * {@code Market} for a specified type of goods.
   *
   * @param goodsType The {@code GoodsType} that has changed price.
   * @return A message describing the change.
   */
  makePriceChangeMessage(goodsType: GoodsType): ModelMessage {
    let data = this.getMarketData$GoodsType(goodsType);
    let oldPrice = data.getOldPrice();
    let newPrice = data.getCostToBuy();
    return (oldPrice === newPrice) ? null : new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.MARKET_PRICES, ((newPrice > oldPrice) ? 'model.market.priceIncrease' : 'model.market.priceDecrease'), this, goodsType).addStringTemplate$String$StringTemplate('%market%', this.owner.getMarketName()).addNamed$String$Named('%goods%', goodsType).addAmount('%buy%', newPrice).addAmount('%sell%', data.getPaidForSale());
  }
  /**
   * Update the price for a type of goods, bypassing the price change
   * clamping.
   *
   * Used to reset the prices when the initial price is randomized.  Do
   * not use during the game, the price change clamping mechanism should
   * remain in effect.
   *
   * @param goodsType The {@code GoodsType} to update.
   */
  update(goodsType: GoodsType): void {
    let data = this.requireMarketData(goodsType);
    data.update();
  }
  /**
   * Get a sale price comparator for this market.
   *
   * @param <T> The {@code AbstractGoods} type to compare.
   * @return A suitable {@code Comparator}.
   */
  getSalePriceComparator<T>(): Comparator<T> {
    return Comparator.reversed((Comparator.comparingInt((t) => this.getSalePrice$GoodsType$int(t.getType(), t.getAmount()))));
  }
  /**
   * Adds a transaction listener for notification of any transaction
   *
   * @param listener The {@code TransactionListener} to add.
   */
  addTransactionListener(listener: TransactionListener): void {
    this.transactionListeners.add(listener);
  }
  /**
   * Removes a transaction listener
   *
   * @param listener The {@code TransactionListener} to remove.
   */
  removeTransactionListener(listener: TransactionListener): void {
    this.transactionListeners.remove(listener);
  }
  /**
   * Gets the listeners added to this market.
   *
   * @return An array of all the {@code TransactionListener}s
   *     added, or an empty array if none found.
   */
  getTransactionListener(): TransactionListener[] {
    return $J.toArrayInto(this.transactionListeners.toArray(), $J.newArray(0, null));
  }
  /**
   * {@inheritDoc}
   */
  getOwner(): Player {
    return this.owner;
  }
  /**
   * {@inheritDoc}
   */
  setOwner(owner: Player): void {
    this.owner = owner;
  }
  /**
   * {@inheritDoc}
   */
  getLinkTarget(player: Player): FreeColGameObject {
    return (player === this.getOwner()) ? this.getOwner().getEurope() : null;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Market));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.marketData.clear();
    for (const $it1 = game.update$Collection$boolean(o.getMarketDataValues(), true).iterator(); $it1.hasNext(); ) {
      let md = $it1.next();
      this.marketData.put(md.getGoodsType(), md);
    }
    this.owner = game.updateRef$FreeColGameObject(o.getOwner());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(Market.OWNER_TAG, this.owner);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (xw.validFor(this.owner)) {
      for (const $it2 = CollectionUtils.sort$Collection(this.getMarketDataValues()).iterator(); $it2.hasNext(); ) {
        let data = $it2.next();
        data.toXML$FreeColXMLWriter(xw);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.owner = xr.findFreeColGameObject(this.getGame(), Market.OWNER_TAG, $J.cls(Player), null, true);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.clearMarketData();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(MarketData.TAG, tag)) {
      let data = xr.readFreeColObject$Game$Class(this.getGame(), $J.cls(MarketData));
      this.putMarketData(data.getGoodsType(), data);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Market.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(' owner=').append((this.owner == null) ? 'null' : this.owner.getId());
    for (const $it3 = CollectionUtils.sort$Collection(this.getMarketDataValues()).iterator(); $it3.hasNext(); ) {
      let md = $it3.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(md));
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    Market.logger = Logger.getLogger($J.cls(Market).getName());
  }
}

/**
 * Constant for specifying the access to this {@code Market}
 * when selling goods.
 */
export class Market$Access extends JEnum {
  static EUROPE: Market$Access = null;
  static CUSTOM_HOUSE: Market$Access = null;
  static $VALUES: Market$Access[] = null;
  _Market$Access($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Market$Access[] { return Market$Access.$VALUES.slice(); }
  static valueOf(name: string): Market$Access { return $J.enumValueOf(Market$Access, name); }
  static $clinit() {
    Market$Access.EUROPE = new Market$Access()._Market$Access('EUROPE', 0);
    Market$Access.CUSTOM_HOUSE = new Market$Access()._Market$Access('CUSTOM_HOUSE', 1);
    Market$Access.$VALUES = [Market$Access.EUROPE, Market$Access.CUSTOM_HOUSE];
  }
}

$J.define(Market, 'net.sf.freecol.common.model.Market', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Ownable'], sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_Market$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player': '_Market$Game$Player' }, returns: { 'getXMLTagName': 'java.lang.String', 'getOwner': 'net.sf.freecol.common.model.Player', 'getSalePriceComparator': 'java.util.Comparator', 'getMarketDataValues': 'java.util.Collection', 'getMarketData$$Market': 'java.util.Map' }, meths: { 'getSalePrice(net.sf.freecol.common.model.AbstractGoods)': 'getSalePrice$AbstractGoods', 'getSalePrice(net.sf.freecol.common.model.GoodsType,int)': 'getSalePrice$GoodsType$int', 'getMarketData(net.sf.freecol.common.model.GoodsType)': 'getMarketData$GoodsType', 'getMarketData()': 'getMarketData$$Market' }, clinit: true, lazy: ['logger'] });
$J.define(Market$Access, 'net.sf.freecol.common.model.Market$Access', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Market$Access' }, clinit: true, lazy: ['$VALUES', 'EUROPE', 'CUSTOM_HOUSE'] });
$J.module(() => {
  MarketData = $J.load('net.sf.freecol.common.model.MarketData');
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  Player = $J.load('net.sf.freecol.common.model.Player');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
