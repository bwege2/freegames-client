// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/label/MarketLabel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 * Copyright (C) 2002-2022   The FreeCol Team
 *
 * This file is part of FreeCol.
 *
 * FreeCol is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * FreeCol is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, RuntimeException } from '../../../../../../../jre/index.ts';
import { AbstractGoodsLabel } from './AbstractGoodsLabel.ts';

let SwingConstants, Utility, FreeColDebugger, FreeColDebugger$DebugMode, Messages, AbstractGoods, GoodsContainer;

/**
 * This label represents a cargo type on the European market.
 */
export class MarketLabel extends AbstractGoodsLabel {
  /**
   * The enclosing market.
   */
  market: Market = null;
  /**
   * Initializes this FreeColLabel with the given goods type.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param type The {@code GoodsType} to represent.
   * @param market The {@code Market} in which to trade the goods.
   */
  _MarketLabel(freeColClient: FreeColClient, type$: GoodsType, market: Market): this {
    this._AbstractGoodsLabel(freeColClient, new AbstractGoods()._AbstractGoods$GoodsType$int(type$, GoodsContainer.CARGO_SIZE));
    if (market == null) {
      throw new RuntimeException('Null market for ' + $J.str(this));
    }
    this.market = market;
    this.update$$MarketLabel();
    return this;
  }
  /**
   * Update this label.
   */
  update$$MarketLabel(): void {
    let type$ = this.getType();
    let player = this.market.getOwner();
    let toolTipText = Messages.getName$Named(type$);
    if (player == null || player.canTrade$GoodsType(type$)) {
      this.setEnabled(true);
    } else {
      toolTipText = Messages.message$StringTemplate(type$.getLabel());
      this.setEnabled(false);
    }
    if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) {
      toolTipText += ' ' + this.market.getAmountInMarket(type$);
    }
    this.setToolTipText(toolTipText);
    this.setText(this.market.getPaidForSale(type$) + '/' + this.market.getCostToBuy(type$));
  }
  /**
   * Wrap the label with a border.
   *
   * @return This {@code MarketLabel}.
   */
  addBorder(): MarketLabel {
    this.setBorder(Utility.getTopCellBorder());
    this.setVerticalTextPosition(SwingConstants.BOTTOM);
    this.setHorizontalTextPosition(SwingConstants.CENTER);
    return this;
  }
  /**
   * Get this MarketLabel's market.
   *
   * @return The enclosing {@code Market}.
   */
  getMarket(): Market {
    return this.market;
  }
  /**
   * Sets the amount of the goods wrapped by this Label to
   * GoodsContainer.CARGO_SIZE.
   */
  setDefaultAmount(): void {
    this.setAmount(GoodsContainer.CARGO_SIZE);
  }
  /**
   * Is this label on a carrier?  No, it is in a market!
   *
   * @return False.
   */
  isOnCarrier(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  propertyChange(event: PropertyChangeEvent): void {
    this.update$$MarketLabel();
  }
  /**
   * {@inheritDoc}
   */
  addCargo(comp: Component, carrier: Unit, cargoPanel: CargoPanel): boolean {
    let label = comp;
    let player = carrier.getOwner();
    if (!player.canTrade$GoodsType(label.getType())) {
      cargoPanel.igc().payArrears(label.getType());
      return false;
    }
    let loadable = carrier.getLoadableAmount(label.getType());
    if (loadable <= 0) {
      return false;
    }
    if (loadable > label.getAmount()) {
      loadable = label.getAmount();
    }
    if (cargoPanel.igc().buyGoods(label.getType(), loadable, carrier)) {
      cargoPanel.igc().nextModelMessage();
      cargoPanel.update$();
      return true;
    }
    return false;
  }
}

$J.define(MarketLabel, 'net.sf.freecol.client.gui.label.MarketLabel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.label.CargoLabel', 'net.sf.freecol.client.gui.label.Draggable', 'java.beans.PropertyChangeListener'], sup: 'net.sf.freecol.client.gui.label.AbstractGoodsLabel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.GoodsType,net.sf.freecol.common.model.Market': '_MarketLabel' }, returns: { 'isOnCarrier': 'boolean', 'getMarket': 'net.sf.freecol.common.model.Market' }, meths: { 'update()': 'update$$MarketLabel' } });
$J.module(() => {
  SwingConstants = $J.load('javax.swing.SwingConstants');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
});
