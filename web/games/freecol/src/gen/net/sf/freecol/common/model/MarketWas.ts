// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/MarketWas.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, Logger } from '../../../../../../jre/index.ts';
import { ObjectWas } from './ObjectWas.ts';

let Market;

/**
 * Helper container to remember the Market state prior to some
 * change, and fire off any consequent property changes.
 */
export class MarketWas extends ObjectWas {
  static logger: Logger = null;
  market: Market = null;
  tax: number = 0;
  costToBuy: JMap<GoodsType, number> = null;
  paidForSale: JMap<GoodsType, number> = null;
  transactions: List<AbstractGoods> = null;
  /**
   * Make a new MarketWas instance for the given player.
   *
   * @param player The {@code Player} to find a market for.
   */
  _MarketWas(player: Player): this {
    this._ObjectWas();
    this.transactions = new ArrayList();
    this.market = player.getMarket();
    this.tax = player.getTax();
    let mdv = this.market.getMarketDataValues();
    this.costToBuy = new HashMap(mdv.size());
    this.paidForSale = new HashMap(mdv.size());
    for (const $it0 = mdv.iterator(); $it0.hasNext(); ) {
      let md = $it0.next();
      this.costToBuy.put(md.getGoodsType(), md.getCostToBuy());
      this.paidForSale.put(md.getGoodsType(), md.getPaidForSale());
    }
    return this;
  }
  /**
   * Add a single transaction.
   *
   * @param ag The {@code AbstractGoods} describing the transaction.
   */
  add(ag: AbstractGoods): void {
    this.transactions.add(ag);
  }
  /**
   * Add multiple transactions.
   *
   * @param ag A list of {@code AbstractGoods} describing the transactions.
   */
  addAll(ag: List<AbstractGoods>): void {
    this.transactions.addAll(ag);
  }
  /**
   * Fire any property changes resulting from actions in Market.
   *
   * @param type A {@code GoodsType} that changed hands.
   * @param amount The amount of goods that changed hands.
   */
  fireChange(type$: GoodsType, amount: number): void {
    for (let l of this.market.getTransactionListener()) {
      if (amount < 0) {
        let buy = this.costToBuy.get(type$);
        l.logPurchase(type$, -amount, buy);
        let buyNow = this.market.getCostToBuy(type$);
        if (buy !== buyNow) {
          this.market.getMarketData$GoodsType(type$).firePropertyChange$String$int$int(Market.PRICE_CHANGE, buy, buyNow);
        }
      } else if (amount > 0) {
        let sell = this.paidForSale.get(type$);
        l.logSale(type$, amount, sell, this.tax);
        let sellNow = this.market.getPaidForSale(type$);
        if (sell !== sellNow) {
          this.market.getMarketData$GoodsType(type$).firePropertyChange$String$int$int(Market.PRICE_CHANGE, sell, sellNow);
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  fireChanges(): boolean {
    if (this.transactions.isEmpty()) {
      return false;
    }
    for (const $it1 = this.transactions.iterator(); $it1.hasNext(); ) {
      let ag = $it1.next();
      this.fireChange(ag.getType(), ag.getAmount());
    }
    this.transactions.clear();
    return true;
  }
  static $clinit() {
    MarketWas.logger = Logger.getLogger($J.cls(MarketWas).getName());
  }
}

$J.define(MarketWas, 'net.sf.freecol.common.model.MarketWas', { kind: 'class', sup: 'net.sf.freecol.common.model.ObjectWas', ctors: { 'net.sf.freecol.common.model.Player': '_MarketWas' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Market = $J.load('net.sf.freecol.common.model.Market');
});
