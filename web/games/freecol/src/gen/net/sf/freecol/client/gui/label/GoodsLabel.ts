// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/label/GoodsLabel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../../../jre/index.ts';
import { AbstractGoodsLabel } from './AbstractGoodsLabel.ts';

let ImageLibrary, AbstractGoodsLabel$AmountType, Utility, Ability, Colony, Goods, GoodsContainer, Ownable, Unit, GameOptions;

/**
 * This label holds Goods data in addition to the JLabel data, which
 * makes it ideal to use for drag and drop purposes.
 */
export class GoodsLabel extends AbstractGoodsLabel {
  whiteForeground: boolean = false;
  /**
   * Initializes this FreeColLabel with the given goods data.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param goods The {@code Goods} that this label will represent.
   */
  _GoodsLabel$FreeColClient$Goods(freeColClient: FreeColClient, goods: Goods): this {
    this._GoodsLabel$FreeColClient$Goods$boolean(freeColClient, goods, false);
    return this;
  }
  /**
   * Initializes this FreeColLabel with the given goods data.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param goods The {@code Goods} that this label will represent.
   * @param whiteForeground If the color should be white (or bright) so that
   *     it works on a black background.
   */
  _GoodsLabel$FreeColClient$Goods$boolean(freeColClient: FreeColClient, goods: Goods, whiteForeground: boolean): this {
    this._AbstractGoodsLabel(freeColClient, goods);
    this.whiteForeground = whiteForeground;
    this.initialize();
    return this;
  }
  /**
   * Initialize this label.
   */
  initialize(): void {
    let goods = this.getGoods();
    let location = goods.getLocation();
    let player = ($J.isa(location, Ownable)) ? (location).getOwner() : null;
    let type$ = goods.getType();
    let spec = goods.getGame().getSpecification();
    if (this.getAmount() < GoodsContainer.CARGO_SIZE) {
      this.setAmountType(AbstractGoodsLabel$AmountType.PARTIAL);
    }
    this.setForeground(ImageLibrary.getGoodsColor(type$, goods.getAmount(), location, this.whiteForeground));
    this.setText(String(goods.getAmount()));
    if (player == null || !type$.isStorable() || player.canTrade$GoodsType(type$) || (location instanceof Colony && spec.getBoolean(GameOptions.CUSTOM_IGNORE_BOYCOTT) && (location).hasAbility$String(Ability.EXPORT))) {
      Utility.localizeToolTip$JComponent$StringTemplate(this, goods.getLabel$boolean(true));
    } else {
      Utility.localizeToolTip$JComponent$StringTemplate(this, goods.getLabel$boolean(false));
      this.setIcon(this.getDisabledIcon());
    }
  }
  /**
   * Get the goods being labelled.
   *
   * @return The {@code Goods} we have labelled.
   */
  getGoods(): Goods {
    return this.getAbstractGoods();
  }
  /**
   * {@inheritDoc}
   */
  isOnCarrier(): boolean {
    let goods = this.getGoods();
    return goods != null && goods.getLocation() instanceof Unit;
  }
  /**
   * {@inheritDoc}
   */
  addCargo(comp: Component, carrier: Unit, cargoPanel: CargoPanel): boolean {
    let goods = (comp).getGoods();
    let loadable = carrier.getLoadableAmount(goods.getType());
    if (loadable <= 0) {
      return false;
    }
    if (loadable > goods.getAmount()) {
      loadable = goods.getAmount();
    }
    let toAdd = new Goods()._Goods$Game$Location$GoodsType$int(goods.getGame(), goods.getLocation(), goods.getType(), loadable);
    goods.setAmount((goods.getAmount() - loadable) | 0);
    cargoPanel.igc().loadCargo(toAdd, carrier);
    cargoPanel.update$();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  removeCargo(comp: Component, cargoPanel: CargoPanel): void {
    let g = (comp).getGoods();
    cargoPanel.igc().unloadCargo(g, false);
    cargoPanel.update$();
  }
}

$J.define(GoodsLabel, 'net.sf.freecol.client.gui.label.GoodsLabel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.label.CargoLabel', 'net.sf.freecol.client.gui.label.Draggable'], sup: 'net.sf.freecol.client.gui.label.AbstractGoodsLabel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Goods,boolean': '_GoodsLabel$FreeColClient$Goods$boolean', 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Goods': '_GoodsLabel$FreeColClient$Goods' }, returns: { 'isOnCarrier': 'boolean', 'getGoods': 'net.sf.freecol.common.model.Goods' } });
$J.module(() => {
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  AbstractGoodsLabel$AmountType = $J.load('net.sf.freecol.client.gui.label.AbstractGoodsLabel$AmountType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
});
