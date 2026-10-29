// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/WarehouseDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from '../panel/FreeColPanel.ts';
import { MigPanel } from '../panel/MigPanel.ts';

let Color, Dimension, AbstractAction, BorderFactory, JCheckBox, JPanel, JScrollPane, JSpinner, ScrollPaneConstants, SpinnerNumberModel, SwingConstants, MigLayout, GoodsLabel, FreeColButton$ButtonStyle, Utility, WrapLayout, Messages, Ability, Goods, GameOptions;

/**
 * A dialog to display a colony warehouse.
 */
export class WarehouseDialog extends FreeColPanel {
  static logger: Logger = null;
  /**
   * Creates a dialog to display the warehouse.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colony The {@code Colony} containing the warehouse.
   * @param dialogHandler A {@code DialogHandler} for the dialog response.
   */
  _WarehouseDialog(freeColClient: FreeColClient, colony: Colony, dialogHandler: DialogHandler<boolean>): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('fill, wrap 1', '', ''));
    let warehousePanel = this.createWarehousePanel(freeColClient, colony);
    let scrollPane = this.scrollPaneWithHiddenBorder(warehousePanel);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('fill, wrap 1', '', ''));
    panel.add$Component$Object(Utility.localizedHeader(Messages.nameKey$String('warehouseDialog'), Utility.FONTSPEC_TITLE), 'align center');
    panel.add$Component$Object(scrollPane, 'grow, gap 0 0');
    let okButton = Utility.localizedButton$String('ok').withButtonStyle(FreeColButton$ButtonStyle.IMPORTANT);
    okButton.setActionCommand(FreeColPanel.OK);
    okButton.addActionListener((event) => {
      for (let c of warehousePanel.getComponents()) {
        if (c instanceof WarehouseDialog$WarehouseGoodsPanel) {
          (c).saveSettings();
        }
      }
      this.getGUI().removeComponent(this);
      if (dialogHandler != null) {
        $J.fn(dialogHandler, 'handle')(true);
      }
    });
    panel.add$Component$Object(okButton, 'newline, span, split 2, tag ok');
    let cancelButton = Utility.localizedButton$String('cancel');
    let cancelAction = new (WarehouseDialog$1())().$o(this).$c(dialogHandler)._AbstractAction$();
    cancelButton.addActionListener($J.fn(cancelAction, 'actionPerformed'));
    this.setEscapeAction(cancelAction);
    panel.add$Component$Object(cancelButton, 'tag cancel');
    this.add$Component$Object(panel, 'grow');
    return this;
  }
  createWarehousePanel(freeColClient: FreeColClient, colony: Colony): JPanel {
    let warehousePanel = new JPanel()._JPanel$LayoutManager(new WrapLayout()._WrapLayout());
    warehousePanel.setOpaque(false);
    let goodsTypes = freeColClient.getGame().getSpecification().getStorableGoodsTypeList();
    let preferredWidth = 0;
    for (const $it0 = goodsTypes.iterator(); $it0.hasNext(); ) {
      let type$ = $it0.next();
      let wgp = new WarehouseDialog$WarehouseGoodsPanel().$o(this)._WarehouseDialog$WarehouseGoodsPanel(freeColClient, colony, type$);
      warehousePanel.add$Component(wgp);
      preferredWidth = (preferredWidth + wgp.getPreferredSize$().width_) | 0;
    }
    preferredWidth = $J.idiv(preferredWidth, 4);
    warehousePanel.setSize$Dimension(new Dimension()._Dimension$int$int(preferredWidth, 1));
    return warehousePanel;
  }
  scrollPaneWithHiddenBorder(warehousePanel: JPanel): JScrollPane {
    let scrollPane = new JScrollPane()._JScrollPane$Component$int$int(warehousePanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    scrollPane.getVerticalScrollBar().setUnitIncrement(16);
    scrollPane.getViewport().setOpaque(false);
    scrollPane.setBorder(BorderFactory.createEmptyBorder$int$int$int$int(0, 0, 10, 0));
    return scrollPane;
  }
  static $clinit() {
    WarehouseDialog.logger = Logger.getLogger($J.cls(WarehouseDialog).getName());
  }
}

export class WarehouseDialog$WarehouseGoodsPanel extends MigPanel {
  colony: Colony = null;
  goodsType: GoodsType = null;
  export: JCheckBox = null;
  lowLevel: JSpinner = null;
  highLevel: JSpinner = null;
  importLevel: JSpinner = null;
  exportLevel: JSpinner = null;
  _WarehouseDialog$WarehouseGoodsPanel(freeColClient: FreeColClient, colony: Colony, goodsType: GoodsType): this {
    this._MigPanel$String$LayoutManager('WarehouseGoodsPanelUI', new MigLayout()._MigLayout$String$String$String('wrap 2', '', ''));
    let enhancedTradeRoutes = colony.getSpecification().getBoolean(GameOptions.ENHANCED_TRADE_ROUTES);
    this.colony = colony;
    this.goodsType = goodsType;
    let capacity = colony.getWarehouseCapacity();
    let maxCapacity = 300;
    this.setOpaque(false);
    this.setBorder(Utility.localizedBorder$Named$Color(goodsType, new Color()._Color$int(0)));
    Utility.padBorder(this, 6, 6, 6, 6);
    let exportData = colony.getExportData$GoodsType(goodsType);
    let goods = new Goods()._Goods$Game$Location$GoodsType$int(colony.getGame(), colony, goodsType, colony.getGoodsCount(goodsType));
    let goodsLabel = new GoodsLabel()._GoodsLabel$FreeColClient$Goods(freeColClient, goods);
    goodsLabel.setHorizontalAlignment(SwingConstants.LEADING);
    this.add$Component$Object(goodsLabel, 'span 1 2');
    let str: string;
    let lowLevelModel = new SpinnerNumberModel()._SpinnerNumberModel$int$int$int$int(exportData.getLowLevel(), 0, 100, 1);
    this.lowLevel = new JSpinner()._JSpinner$SpinnerModel(lowLevelModel);
    Utility.localizeToolTip$JComponent$String(this.lowLevel, 'warehouseDialog.lowLevel.shortDescription');
    this.add$Component(this.lowLevel);
    let highLevelModel = new SpinnerNumberModel()._SpinnerNumberModel$int$int$int$int(exportData.getHighLevel(), 0, 100, 1);
    this.highLevel = new JSpinner()._JSpinner$SpinnerModel(highLevelModel);
    Utility.localizeToolTip$JComponent$String(this.highLevel, 'warehouseDialog.highLevel.shortDescription');
    this.add$Component(this.highLevel);
    if (enhancedTradeRoutes) {
      let importInit = exportData.getEffectiveImportLevel(capacity);
      let importLevelModel = new SpinnerNumberModel()._SpinnerNumberModel$int$int$int$int(importInit, 0, (goodsType.limitIgnored()) ? maxCapacity : capacity, 1);
      this.importLevel = new JSpinner()._JSpinner$SpinnerModel(importLevelModel);
      Utility.localizeToolTip$JComponent$String(this.importLevel, 'warehouseDialog.importLevel.shortDescription');
      this.add$Component(this.importLevel);
    } else {
      this.importLevel = null;
    }
    this.export = new JCheckBox()._JCheckBox$String$boolean(Messages.message$String('warehouseDialog.export'), exportData.getExported());
    Utility.localizeToolTip$JComponent$String(this.export, 'warehouseDialog.export.shortDescription');
    if (!colony.hasAbility$String(Ability.EXPORT)) {
      this.export.setEnabled(false);
    }
    this.add$Component(this.export);
    let exportLevelModel = new SpinnerNumberModel()._SpinnerNumberModel$int$int$int$int(exportData.getExportLevel(), 0, (goodsType.limitIgnored()) ? maxCapacity : capacity, 1);
    this.exportLevel = new JSpinner()._JSpinner$SpinnerModel(exportLevelModel);
    Utility.localizeToolTip$JComponent$String(this.exportLevel, 'warehouseDialog.exportLevel.shortDescription');
    this.add$Component(this.exportLevel);
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  saveSettings(): void {
    let lowLevelValue = $J.d2i(+(this.lowLevel.getModel()).getNumber());
    let highLevelValue = $J.d2i(+(this.highLevel.getModel()).getNumber());
    let importLevelValue = (this.importLevel == null) ? -1 : $J.d2i(+(this.importLevel.getModel()).getNumber());
    let exportLevelValue = $J.d2i(+(this.exportLevel.getModel()).getNumber());
    let exportData = this.colony.getExportData$GoodsType(this.goodsType);
    let importValue = exportData.getEffectiveImportLevel(this.colony.getWarehouseCapacity());
    let changed = (this.export.isSelected() !== exportData.getExported()) || (lowLevelValue !== exportData.getLowLevel()) || (highLevelValue !== exportData.getHighLevel()) || (this.importLevel != null && importLevelValue !== importValue) || (exportLevelValue !== exportData.getExportLevel());
    exportData.setExported(this.export.isSelected());
    exportData.setLowLevel(lowLevelValue);
    exportData.setHighLevel(highLevelValue);
    exportData.setImportLevel(importLevelValue);
    exportData.setExportLevel(exportLevelValue);
    if (changed) {
      this.$outer.getFreeColClient().getInGameController().setGoodsLevels(this.colony, this.goodsType);
    }
  }
}

let $WarehouseDialog$1: any = null;
/** An anonymous class (WarehouseDialog.java:98). */
function WarehouseDialog$1(): any {
  return $WarehouseDialog$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.getGUI().removeComponent(this.$outer);
      if (this.$cv_dialogHandler != null) {
        $J.fn(this.$cv_dialogHandler, 'handle')(false);
      }
    }
    $c($dialogHandler): this {
      this.$cv_dialogHandler = $dialogHandler;
      return this;
    }
  }, 'net.sf.freecol.client.gui.dialog.WarehouseDialog$1', []);
}

$J.define(WarehouseDialog, 'net.sf.freecol.client.gui.dialog.WarehouseDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Colony,net.sf.freecol.client.gui.DialogHandler': '_WarehouseDialog' }, clinit: true, lazy: ['logger'] });
$J.define(WarehouseDialog$WarehouseGoodsPanel, 'net.sf.freecol.client.gui.dialog.WarehouseDialog$WarehouseGoodsPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.GoodsType': '_WarehouseDialog$WarehouseGoodsPanel' }, inner: true });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  BorderFactory = $J.load('javax.swing.BorderFactory');
  JCheckBox = $J.load('javax.swing.JCheckBox');
  JPanel = $J.load('javax.swing.JPanel');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JSpinner = $J.load('javax.swing.JSpinner');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  SpinnerNumberModel = $J.load('javax.swing.SpinnerNumberModel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  GoodsLabel = $J.load('net.sf.freecol.client.gui.label.GoodsLabel');
  FreeColButton$ButtonStyle = $J.load('net.sf.freecol.client.gui.panel.FreeColButton$ButtonStyle');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  WrapLayout = $J.load('net.sf.freecol.client.gui.panel.WrapLayout');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
});
