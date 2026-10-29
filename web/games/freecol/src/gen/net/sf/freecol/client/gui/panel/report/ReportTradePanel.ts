// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportTradePanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString, StringBuilder } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let Color, JLabel, SwingConstants, EmptyBorder, MigLayout, ImageLibrary, MarketLabel, MigPanel, Utility, Messages, Ability, StringTemplate, TypeCountMap, CollectionUtils;

/**
 * This panel displays the Trade Report.
 */
export class ReportTradePanel extends ReportPanel {
  colonies: List<Colony> = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportTradePanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportTradeAction');
    let player = this.getMyPlayer();
    let warnColor = ImageLibrary.getColor$String('color.report.trade.warn');
    this.colonies = player.getColonyList();
    let goodsHeader = new MigPanel()._MigPanel$String('ReportPanelUI');
    goodsHeader.setBorder(new EmptyBorder()._EmptyBorder$int$int$int$int(20, 20, 0, 20));
    this.scrollPane.setColumnHeaderView(goodsHeader);
    let spec = this.getSpecification();
    let storableGoods = spec.getStorableGoodsTypeList();
    let market = player.getMarket();
    this.reportPanel.removeAll();
    goodsHeader.removeAll();
    let layoutConstraints = 'insets 0, gap 0 0';
    let columnConstraints = '[25%!, fill][' + (($J.round(ImageLibrary.ICON_SIZE.width_ * 1.25)) | 0) + '!, fill]';
    let rowConstraints = '[fill]';
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String$String(layoutConstraints, columnConstraints, rowConstraints));
    goodsHeader.setLayout(new MigLayout()._MigLayout$String$String$String(layoutConstraints, columnConstraints, rowConstraints));
    goodsHeader.setOpaque(true);
    let emptyLabel = new JLabel()._JLabel$();
    emptyLabel.setBorder(Utility.getTopLeftCellBorder());
    goodsHeader.add$Component$Object(emptyLabel, 'cell 0 0');
    let jl = this.createLeftLabel('report.trade.unitsSold');
    jl.setBorder(Utility.getTopLeftCellBorder());
    this.reportPanel.add$Component$Object(jl, 'cell 0 0');
    this.reportPanel.add$Component$Object(this.createLeftLabel('report.trade.beforeTaxes'), 'cell 0 1');
    this.reportPanel.add$Component$Object(this.createLeftLabel('report.trade.afterTaxes'), 'cell 0 2');
    this.reportPanel.add$Component$Object(this.createLeftLabel('report.trade.cargoUnits'), 'cell 0 3');
    this.reportPanel.add$Component$Object(this.createLeftLabel('report.trade.totalUnits'), 'cell 0 4');
    this.reportPanel.add$Component$Object(this.createLeftLabel('report.trade.totalDelta'), 'cell 0 5');
    let totalUnits = new TypeCountMap()._TypeCountMap();
    let deltaUnits = new TypeCountMap()._TypeCountMap();
    let cargoUnits = new TypeCountMap()._TypeCountMap();
    for (const $it0 = (CollectionUtils.transform$Stream$Predicate(player.getUnits(), ($p0) => $p0.isCarrier())).iterator(); $it0.hasNext(); ) {
      let unit = $it0.next();
      for (const $it1 = unit.getCompactGoodsList().iterator(); $it1.hasNext(); ) {
        let goods = $it1.next();
        cargoUnits.incrementCount(goods.getType(), goods.getAmount());
        totalUnits.incrementCount(goods.getType(), goods.getAmount());
      }
    }
    let column = 0;
    for (const $it2 = storableGoods.iterator(); $it2.hasNext(); ) {
      let goodsType = $it2.next();
      column++;
      let sales = player.getSales(goodsType);
      let beforeTaxes = player.getIncomeBeforeTaxes(goodsType);
      let afterTaxes = player.getIncomeAfterTaxes(goodsType);
      goodsHeader.add$Component(new MarketLabel()._MarketLabel(freeColClient, goodsType, market).addBorder());
      jl = this.createNumberLabel$int$ReportTradePanel(sales);
      jl.setBorder(Utility.getTopCellBorder());
      this.reportPanel.add$Component$Object(jl, 'cell ' + column + ' 0');
      this.reportPanel.add$Component$Object(this.createNumberLabel$int$ReportTradePanel(beforeTaxes), 'cell ' + column + ' 1');
      this.reportPanel.add$Component$Object(this.createNumberLabel$int$ReportTradePanel(afterTaxes), 'cell ' + column + ' 2');
      this.reportPanel.add$Component$Object(this.createNumberLabel$int$ReportTradePanel(cargoUnits.getCount(goodsType)), 'cell ' + column + ' 3');
    }
    let row = 6;
    let first = true;
    for (const $it3 = this.colonies.iterator(); $it3.hasNext(); ) {
      let colony = $it3.next();
      for (const $it4 = this.getSpecification().getGoodsTypeList().iterator(); $it4.hasNext(); ) {
        let goodsType = $it4.next();
        deltaUnits.incrementCount(goodsType, colony.getNetProductionOf(goodsType));
      }
      for (const $it5 = colony.getCompactGoodsList().iterator(); $it5.hasNext(); ) {
        let goods = $it5.next();
        totalUnits.incrementCount(goods.getType(), goods.getAmount());
      }
      let colonyButton = this.createColonyButton$Colony(colony);
      if (colony.hasAbility$String(Ability.EXPORT)) {
        colonyButton.setText(colonyButton.getText() + '*');
      }
      colonyButton.setBorder((first) ? Utility.getTopLeftCellBorder() : Utility.getLeftCellBorder());
      this.reportPanel.add$Component$Object(colonyButton, 'cell 0 ' + row + ' 1 2');
      column = 0;
      for (const $it6 = storableGoods.iterator(); $it6.hasNext(); ) {
        let goodsType = $it6.next();
        column++;
        let amount = colony.getGoodsCount(goodsType);
        let goodsLabel = new JLabel()._JLabel$String$int(String(amount), SwingConstants.TRAILING);
        goodsLabel.setBorder((first) ? Utility.getTopCellBorder() : Utility.getCellBorder());
        goodsLabel.setForeground(ImageLibrary.getGoodsColor(goodsType, amount, colony, false));
        let ed = colony.getExportData$GoodsType(goodsType);
        if (ed.getExported()) {
          goodsLabel.setToolTipText(Messages.message$StringTemplate(StringTemplate.template$String('report.trade.export').addNamed$String$Named('%goods%', goodsType).addAmount('%amount%', ed.getExportLevel())));
        }
        this.reportPanel.add$Component$Object(goodsLabel, 'cell ' + column + ' ' + row);
        let production = colony.getNetProductionOf(goodsType);
        let productionLabel = this.createNumberLabel$int$boolean$ReportTradePanel(production, true);
        productionLabel.setForeground(ImageLibrary.getGoodsColor(goodsType, production, colony, false));
        let warnings = colony.getProductionWarnings(goodsType);
        if (!warnings.isEmpty()) {
          let sb = new StringBuilder();
          for (const $it7 = warnings.iterator(); $it7.hasNext(); ) {
            let warning = $it7.next();
            sb.append(Messages.message$StringTemplate(warning)).append(String.fromCharCode(32 /* ' ' */));
          }
          sb.setLength((sb.length() - 1) | 0);
          productionLabel.setToolTipText(sb.toString());
          productionLabel.setForeground(warnColor);
        }
        this.reportPanel.add$Component$Object(productionLabel, 'cell ' + column + ' ' + ((row + 1) | 0));
      }
      row = (row + 2) | 0;
      first = false;
    }
    row++;
    this.reportPanel.add$Component$Object(Utility.localizedLabel$String('report.trade.hasCustomHouse'), 'cell 0 ' + row + ', span');
    column = 0;
    for (const $it8 = storableGoods.iterator(); $it8.hasNext(); ) {
      let goodsType = $it8.next();
      column++;
      this.reportPanel.add$Component$Object(this.createNumberLabel$int$ReportTradePanel(totalUnits.getCount(goodsType)), 'cell ' + column + ' 4');
      this.reportPanel.add$Component$Object(this.createNumberLabel$int$boolean$ReportTradePanel(deltaUnits.getCount(goodsType), true), 'cell ' + column + ' 5, wrap 20');
    }
    return this;
  }
  createLeftLabel(key: string): JLabel {
    let result = Utility.localizedLabel$String(key);
    result.setBorder(Utility.getLeftCellBorder());
    return result;
  }
  createNumberLabel$int$ReportTradePanel(value: number): JLabel {
    return this.createNumberLabel$int$boolean$ReportTradePanel(value, false);
  }
  createNumberLabel$int$boolean$ReportTradePanel(value: number, alwaysAddSign: boolean): JLabel {
    let result = new JLabel()._JLabel$String$int(String(value), SwingConstants.TRAILING);
    result.setBorder(Utility.getCellBorder());
    if (value < 0) {
      result.setForeground(Color.RED);
    } else if (alwaysAddSign && value > 0) {
      result.setText('+' + value);
    }
    return result;
  }
}

$J.define(ReportTradePanel, 'net.sf.freecol.client.gui.panel.report.ReportTradePanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportTradePanel' }, meths: { 'createNumberLabel(int,boolean)': 'createNumberLabel$int$boolean$ReportTradePanel', 'createNumberLabel(int)': 'createNumberLabel$int$ReportTradePanel' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  JLabel = $J.load('javax.swing.JLabel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  MarketLabel = $J.load('net.sf.freecol.client.gui.label.MarketLabel');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  TypeCountMap = $J.load('net.sf.freecol.common.model.TypeCountMap');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
