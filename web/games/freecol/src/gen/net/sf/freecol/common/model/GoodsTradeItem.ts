// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/GoodsTradeItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, StringBuilder } from '../../../../../../jre/index.ts';
import { TradeItem } from './TradeItem.ts';

let Messages, ColonyTradeItem, Goods, Ownable, Utils;

/**
 * A trade item consisting of some goods.
 */
export class GoodsTradeItem extends TradeItem {
  static readonly TAG: string = 'goodsTradeItem';
  /**
   * The goods to change hands.
   */
  goods: Goods = null;
  /**
   * Creates a new {@code GoodsTradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param source The source {@code Player}.
   * @param destination The destination {@code Player}.
   * @param goods The {@code Goods} to trade.
   */
  _GoodsTradeItem$Game$Player$Player$Goods(game: Game, source: Player, destination: Player, goods: Goods): this {
    this._TradeItem$Game$String$Player$Player(game, Messages.nameKey$String('model.tradeItem.goods'), source, destination);
    this.goods = goods;
    return this;
  }
  /**
   * Creates a new {@code GoodsTradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is an error reading the stream.
   */
  _GoodsTradeItem$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._TradeItem$Game$FreeColXMLReader(game, xr);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  isValid(): boolean {
    return this.goods != null && this.goods.getType() != null && this.goods.getAmount() > 0 && ($J.isa(this.goods.getLocation(), Ownable)) && this.getSource().owns(this.goods.getLocation());
  }
  /**
   * {@inheritDoc}
   */
  isUnique(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  getLabel(): StringTemplate {
    return this.goods.getLabel$boolean(true);
  }
  /**
   * {@inheritDoc}
   */
  getGoods(): Goods {
    return this.goods;
  }
  /**
   * {@inheritDoc}
   */
  setGoods(goods: Goods): void {
    this.goods = goods;
  }
  /**
   * {@inheritDoc}
   */
  evaluateFor(player: Player): number {
    let market = player.getMarket();
    let goods = this.getGoods();
    return (!this.isValid()) ? TradeItem.INVALID_TRADE_ITEM : (this.getSource() === player) ? ((market == null) ? Math.imul(-2, goods.getAmount()) : market.getBidPrice(goods.getType(), goods.getAmount())) : ((market == null) ? Math.imul(2, goods.getAmount()) : ($J.round(market.getSalePrice$GoodsType$int(goods.getType(), goods.getAmount()) * (1 - player.getTax() / 100))) | 0);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    this.goods.toXML$FreeColXMLWriter(xw);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.goods = null;
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let game = this.getGame();
    let tag = xr.getLocalName();
    if ($J.equals(Goods.TAG, tag)) {
      this.goods = new Goods()._Goods$Game$FreeColXMLReader(game, xr);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return GoodsTradeItem.TAG;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(ColonyTradeItem));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let g = o.getGoods();
    if (g == null) {
      this.goods = null;
    } else if (this.goods == null) {
      this.goods = g;
    } else {
      return this.goods.copyIn(g);
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  equals(other: any): boolean {
    if (other instanceof GoodsTradeItem) {
      return Utils.equals(this.goods, (other).goods) && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    return (Math.imul(37, hash) + Utils.hashCode(this.goods)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append(String(this.goods.getAmount())).append(String.fromCharCode(32 /* ' ' */)).append(Messages.getName$Named(this.goods)).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(GoodsTradeItem, 'net.sf.freecol.common.model.GoodsTradeItem', { kind: 'class', sup: 'net.sf.freecol.common.model.TradeItem', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_GoodsTradeItem$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Goods': '_GoodsTradeItem$Game$Player$Player$Goods' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getGoods': 'net.sf.freecol.common.model.Goods', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'isUnique': 'boolean', 'isValid': 'boolean' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  ColonyTradeItem = $J.load('net.sf.freecol.common.model.ColonyTradeItem');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
