// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/MarketData.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let GoodsType;

/**
 * Objects of this class hold the market data for a particular type of
 * goods.
 */
export class MarketData extends FreeColGameObject {
  static logger: Logger = null;
  static readonly TAG: string = 'marketData';
  /**
   * Inclusive lower bound on goods price.
   */
  static readonly MINIMUM_PRICE: number = 1;
  /**
   * Inclusive upper bound on goods price.
   */
  static readonly MAXIMUM_PRICE: number = 19;
  /**
   * What type of goods is this.
   */
  goodsType: GoodsType = null;
  /**
   * Current purchase price.
   */
  costToBuy: number = 0;
  /**
   * Current selling price.
   */
  paidForSale: number = 0;
  /**
   * Amount of this goods in the market.
   */
  amountInMarket: number = 0;
  /**
   * The initial price.
   */
  initialPrice: number = 0;
  /**
   * Arrears owed to the crown.
   */
  arrears: number = 0;
  /**
   * Total sales.
   */
  sales: number = 0;
  /**
   * Total income before taxes.
   */
  incomeBeforeTaxes: number = 0;
  /**
   * Total income after taxes.
   */
  incomeAfterTaxes: number = 0;
  /**
   * Place to save to old price so as to be able to tell when a price change
   * message should be generated.  Not necessary to serialize.
   */
  oldPrice: number = 0;
  /**
   * Has this good been traded?
   */
  traded: boolean = false;
  static readonly AMOUNT_TAG: string = 'amount';
  static readonly ARREARS_TAG: string = 'arrears';
  static readonly GOODS_TYPE_TAG: string = 'goods-type';
  static readonly INCOME_AFTER_TAXES_TAG: string = 'incomeAfterTaxes';
  static readonly INCOME_BEFORE_TAXES_TAG: string = 'incomeBeforeTaxes';
  static readonly INITIAL_PRICE_TAG: string = 'initialPrice';
  static readonly SALES_TAG: string = 'sales';
  static readonly TRADED_TAG: string = 'traded';
  /**
   * Creates a new {@code MarketData} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param goodsType The {@code GoodsType} this market data describes.
   */
  _MarketData$Game$GoodsType(game: Game, goodsType: GoodsType): this {
    this._FreeColGameObject$Game(game);
    this.goodsType = goodsType;
    this.paidForSale = goodsType.getInitialSellPrice();
    this.costToBuy = goodsType.getInitialBuyPrice();
    this.amountInMarket = goodsType.getInitialAmount();
    this.initialPrice = goodsType.getInitialSellPrice();
    this.arrears = 0;
    this.sales = 0;
    this.incomeBeforeTaxes = 0;
    this.incomeAfterTaxes = 0;
    this.oldPrice = this.costToBuy;
    this.traded = false;
    return this;
  }
  /**
   * Creates a new {@code MarketData} with the given identifier.
   *
   * The object should be initialized later.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _MarketData$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    return this;
  }
  /**
   * Get the type of goods of this {@code MarketData}.
   *
   * @return The goods type for this data.
   */
  getGoodsType(): GoodsType {
    return this.goodsType;
  }
  /**
   * Get the current purchase price.
   *
   * @return The purchase price.
   */
  getCostToBuy(): number {
    return this.costToBuy;
  }
  /**
   * Set the current purchase price.
   *
   * @param newCostToBuy The new purchase price.
   */
  setCostToBuy(newCostToBuy: number): void {
    this.costToBuy = newCostToBuy;
  }
  /**
   * Get the current sale price.
   *
   * @return The sale price.
   */
  getPaidForSale(): number {
    return this.paidForSale;
  }
  /**
   * Set the current sale price.
   *
   * @param newPaidForSale The new sale price.
   */
  setPaidForSale(newPaidForSale: number): void {
    this.paidForSale = newPaidForSale;
  }
  /**
   * Get the amount of the goods type in the market.
   *
   * @return The amount of goods.
   */
  getAmountInMarket(): number {
    return this.amountInMarket;
  }
  /**
   * Set the amount of goods in the market.
   *
   * @param newAmountInMarket The new amount of goods in the market.
   */
  setAmountInMarket(newAmountInMarket: number): void {
    this.amountInMarket = newAmountInMarket;
  }
  /**
   * Get the initial price of these goods.
   *
   * @return The initial price.
   */
  getInitialPrice(): number {
    return this.initialPrice;
  }
  /**
   * Set the initial price value.
   *
   * @param newInitialPrice The new initial price value.
   */
  setInitialPrice(newInitialPrice: number): void {
    this.initialPrice = newInitialPrice;
  }
  /**
   * Get the amount of arrears owned to the crown for this goods type.
   *
   * @return The arrears amount.
   */
  getArrears(): number {
    return this.arrears;
  }
  /**
   * Set the amount of arrears owed to the crown.
   *
   * @param newArrears The new amount of arrears.
   */
  setArrears(newArrears: number): void {
    this.arrears = newArrears;
  }
  /**
   * Get the total sales.
   *
   * @return The total sales.
   */
  getSales(): number {
    return this.sales;
  }
  /**
   * Set the total sales value.
   *
   * @param newSales The new total sales value.
   */
  setSales(newSales: number): void {
    this.sales = newSales;
  }
  /**
   * Get the income before taxes from trading in this goods type.
   *
   * @return The income before taxes.
   */
  getIncomeBeforeTaxes(): number {
    return this.incomeBeforeTaxes;
  }
  /**
   * Set the income before taxes value.
   *
   * @param newIncomeBeforeTaxes The new income before taxes value.
   */
  setIncomeBeforeTaxes(newIncomeBeforeTaxes: number): void {
    this.incomeBeforeTaxes = newIncomeBeforeTaxes;
  }
  /**
   * Get the income after taxes from trading in this goods type.
   *
   * @return The income after taxes.
   */
  getIncomeAfterTaxes(): number {
    return this.incomeAfterTaxes;
  }
  /**
   * Set the income after taxes value.
   *
   * @param newIncomeAfterTaxes The new income after taxes value.
   */
  setIncomeAfterTaxes(newIncomeAfterTaxes: number): void {
    this.incomeAfterTaxes = newIncomeAfterTaxes;
  }
  /**
   * Get the old price.
   *
   * @return The old price.
   */
  getOldPrice(): number {
    return this.oldPrice;
  }
  /**
   * Set the old price.
   *
   * @param oldPrice A `new' old price.
   */
  setOldPrice(oldPrice: number): void {
    this.oldPrice = oldPrice;
  }
  /**
   * Has there been trading in this {@code MarketData}?
   *
   * @return True if trading has occurred.
   */
  getTraded(): boolean {
    return this.traded;
  }
  /**
   * Set the trading status of this {@code MarketData}.
   *
   * @param traded The trade status to set.
   */
  setTraded(traded: boolean): void {
    this.traded = traded;
  }
  /**
   * Adjust the prices.
   *
   * Sets the costToBuy and paidForSale fields from the amount in
   * the market, initial price and goods-type specific information.
   * Ensures that prices change incrementally with a clamping
   * mechanism.
   *
   * @return True if the price changes.
   */
  price(): boolean {
    if (!this.goodsType.isStorable()) {
      return false;
    }
    let diff = this.goodsType.getPriceDifference();
    let amountPrice = Math.fround(this.initialPrice * (Math.fround(this.goodsType.getInitialAmount() / Math.fround(this.amountInMarket))));
    let newSalePrice = $J.roundf(amountPrice);
    let newPrice = (newSalePrice + diff) | 0;
    if (newSalePrice > ((this.initialPrice + 2) | 0) && ((this.goodsType.getInputType() != null && this.goodsType.getInputType().isNewWorldGoodsType()) || this.goodsType.isNewWorldGoodsType())) {
      newSalePrice = (this.initialPrice + 2) | 0;
      newPrice = (newSalePrice + diff) | 0;
    }
    if (this.costToBuy > 0) {
      if (newPrice > ((this.costToBuy + diff) | 0)) {
        amountPrice = Math.fround(amountPrice - ((newPrice - (this.costToBuy + diff)) | 0));
        this.amountInMarket = $J.roundf(Math.fround(this.goodsType.getInitialAmount() * (Math.fround(this.initialPrice / amountPrice))));
        MarketData.logger.info('Clamped price rise for ' + this.getId() + ' from ' + newPrice + ' to ' + ((this.costToBuy + diff) | 0));
        newPrice = (this.costToBuy + diff) | 0;
      } else if (newPrice < ((this.costToBuy - diff) | 0)) {
        amountPrice = Math.fround(amountPrice + ((this.costToBuy - diff - newPrice) | 0));
        this.amountInMarket = $J.roundf(Math.fround(this.goodsType.getInitialAmount() * (Math.fround(this.initialPrice / amountPrice))));
        MarketData.logger.info('Clamped price fall for ' + this.getId() + ' from ' + newPrice + ' to ' + ((this.costToBuy - diff) | 0));
        newPrice = (this.costToBuy - diff) | 0;
      }
      newSalePrice = (newPrice - diff) | 0;
    }
    if (newPrice > MarketData.MAXIMUM_PRICE) {
      newPrice = MarketData.MAXIMUM_PRICE;
      newSalePrice = (newPrice - diff) | 0;
    } else if (newSalePrice < MarketData.MINIMUM_PRICE) {
      newSalePrice = MarketData.MINIMUM_PRICE;
      newPrice = (newSalePrice + diff) | 0;
    }
    let oldCostToBuy = this.costToBuy;
    let oldPaidForSale = this.paidForSale;
    this.costToBuy = newPrice;
    this.paidForSale = newSalePrice;
    if (this.costToBuy !== oldCostToBuy) {
      this.firePropertyChange$String$int$int(this.goodsType.getId(), oldCostToBuy, this.costToBuy);
    } else if (this.paidForSale !== oldPaidForSale) {
      this.firePropertyChange$String$int$int(this.goodsType.getId(), oldPaidForSale, this.paidForSale);
    }
    return this.costToBuy !== oldCostToBuy || this.paidForSale !== oldPaidForSale;
  }
  /**
   * Update the pricing of this datum, ignoring the price change clamp.
   */
  update(): void {
    this.costToBuy = -1;
    this.price();
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(MarketData));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.goodsType = o.getGoodsType();
    this.costToBuy = o.getCostToBuy();
    this.paidForSale = o.getPaidForSale();
    this.amountInMarket = o.getAmountInMarket();
    this.initialPrice = o.getInitialPrice();
    this.arrears = o.getArrears();
    this.sales = o.getSales();
    this.incomeBeforeTaxes = o.getIncomeBeforeTaxes();
    this.incomeAfterTaxes = o.getIncomeAfterTaxes();
    this.oldPrice = o.getOldPrice();
    this.traded = o.getTraded();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(MarketData.GOODS_TYPE_TAG, this.goodsType);
    xw.writeAttribute$String$int(MarketData.AMOUNT_TAG, this.amountInMarket);
    xw.writeAttribute$String$int(MarketData.INITIAL_PRICE_TAG, this.initialPrice);
    xw.writeAttribute$String$int(MarketData.ARREARS_TAG, this.arrears);
    xw.writeAttribute$String$int(MarketData.SALES_TAG, this.sales);
    xw.writeAttribute$String$int(MarketData.INCOME_AFTER_TAXES_TAG, this.incomeAfterTaxes);
    xw.writeAttribute$String$int(MarketData.INCOME_BEFORE_TAXES_TAG, this.incomeBeforeTaxes);
    xw.writeAttribute$String$boolean(MarketData.TRADED_TAG, this.traded);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    this.goodsType = xr.getType(spec, MarketData.GOODS_TYPE_TAG, $J.cls(GoodsType), null);
    this.amountInMarket = xr.getAttribute$String$int(MarketData.AMOUNT_TAG, 0);
    this.initialPrice = xr.getAttribute$String$int(MarketData.INITIAL_PRICE_TAG, -1);
    this.arrears = xr.getAttribute$String$int(MarketData.ARREARS_TAG, 0);
    this.sales = xr.getAttribute$String$int(MarketData.SALES_TAG, 0);
    this.incomeBeforeTaxes = xr.getAttribute$String$int(MarketData.INCOME_BEFORE_TAXES_TAG, 0);
    this.incomeAfterTaxes = xr.getAttribute$String$int(MarketData.INCOME_AFTER_TAXES_TAG, 0);
    this.traded = xr.getAttribute$String$boolean(MarketData.TRADED_TAG, this.sales !== 0);
    this.update();
    this.oldPrice = this.costToBuy;
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return MarketData.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(128);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append((this.goodsType == null) ? 'null' : this.goodsType.getId()).append(' costToBuy=').append(String(this.costToBuy)).append(' paidForSale=').append(String(this.paidForSale)).append(' amountInMarket=').append(String(this.amountInMarket)).append(' initialPrice=').append(String(this.initialPrice)).append(' arrears=').append(String(this.arrears)).append(' sales=').append(String(this.sales)).append(' incomeBeforeTaxes=').append(String(this.incomeBeforeTaxes)).append(' incomeAfterTaxes=').append(String(this.incomeAfterTaxes)).append(' oldPrice=').append(String(this.oldPrice)).append(' traded=').append(String(this.traded)).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    MarketData.logger = Logger.getLogger($J.cls(MarketData).getName());
  }
}

$J.define(MarketData, 'net.sf.freecol.common.model.MarketData', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_MarketData$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.GoodsType': '_MarketData$Game$GoodsType' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTraded': 'boolean', 'getOldPrice': 'int', 'getIncomeAfterTaxes': 'int', 'getIncomeBeforeTaxes': 'int', 'getSales': 'int', 'getArrears': 'int', 'getInitialPrice': 'int', 'getAmountInMarket': 'int', 'getPaidForSale': 'int', 'getCostToBuy': 'int', 'getGoodsType': 'net.sf.freecol.common.model.GoodsType' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
});
