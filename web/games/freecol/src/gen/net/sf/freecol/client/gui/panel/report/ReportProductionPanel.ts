// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportProductionPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collectors } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let JComboBox, JLabel, SwingConstants, MigLayout, GoodsLabel, BuildingPanel, Utility, Messages, Goods, CollectionUtils;

/**
 * This panel displays the Production Report.
 */
export class ReportProductionPanel extends ReportPanel {
  /**
   * The number of selection boxes.
   */
  static readonly NUMBER_OF_GOODS: number = 4;
  /**
   * The goods types available for selection.
   */
  goodsTypes: List<GoodsType> = null;
  /**
   * The boxes with which to select goods types for display.
   */
  boxes: List<JComboBox<string>> = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * FIXME: can we extend this to cover farmed goods?
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportProductionPanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportProductionAction');
    this.goodsTypes = CollectionUtils.transform$Collection$Predicate(this.getSpecification().getGoodsTypeList(), (gt) => !gt.isFarmed());
    let goodsNames = CollectionUtils.transform$Collection$Predicate$Function(this.goodsTypes, CollectionUtils.alwaysTrue(), (gt) => Messages.getName$Named(gt));
    goodsNames.add(0, Messages.message$String('nothing'));
    let model = $J.toArrayInto(goodsNames.toArray(), $J.newArray(0, null));
    this.boxes = new ArrayList(ReportProductionPanel.NUMBER_OF_GOODS);
    for (let index = 0; index < ReportProductionPanel.NUMBER_OF_GOODS; index++) {
      let newBox = new JComboBox()._JComboBox$ObjectArr(model);
      newBox.setSelectedIndex(0);
      this.boxes.add(newBox);
    }
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String$String('gap 0 0', '[fill]', '[fill]'));
    this.update$$ReportProductionPanel();
    return this;
  }
  update$$ReportProductionPanel(): void {
    this.reportPanel.removeAll();
    let selectLabel = Utility.localizedLabel$String('report.production.selectGoods');
    this.reportPanel.add$Component(selectLabel);
    let selectButton = Utility.localizedButton$String('report.production.update');
    selectButton.addActionListener((ae) => this.update$$ReportProductionPanel());
    this.reportPanel.add$Component$Object(selectButton, 'wrap');
    let selectedTypes = new ArrayList();
    for (let index = 0; index < ReportProductionPanel.NUMBER_OF_GOODS; index++) {
      let box = this.boxes.get(index);
      this.reportPanel.add$Component(box);
      let selectedIndex = box.getSelectedIndex();
      if (selectedIndex > 0) {
        selectedTypes.add(this.goodsTypes.get((selectedIndex - 1) | 0));
      }
    }
    if (!selectedTypes.isEmpty()) {
      let spec = this.getSpecification();
      let fcc = this.getFreeColClient();
      let mapper = (gt) => CollectionUtils.transform$Collection$Predicate$Function$Collector(spec.getBuildingTypeList(), (bt) => (gt === bt.getProducedGoodsType() || bt.hasModifier$String(gt.getId())), ($p0) => $p0.getFirstLevel(), Collectors.toSet());
      let basicBuildingTypes = CollectionUtils.transform$Collection$Predicate$Function(selectedTypes, CollectionUtils.alwaysTrue(), mapper);
      let newLabel: JLabel;
      newLabel = Utility.localizedLabel$String('Colony');
      newLabel.setBorder(Utility.getTopLeftCellBorder());
      this.reportPanel.add$Component$Object(newLabel, 'newline 20');
      for (let index = 0; index < selectedTypes.size(); index++) {
        newLabel = Utility.localizedLabel$FreeColSpecObjectType(selectedTypes.get(index));
        newLabel.setBorder(Utility.getTopCellBorder());
        this.reportPanel.add$Component(newLabel);
        for (const $it0 = basicBuildingTypes.get(index).iterator(); $it0.hasNext(); ) {
          let bt = $it0.next();
          newLabel = Utility.localizedLabel$FreeColSpecObjectType(bt);
          newLabel.setBorder(Utility.getTopCellBorder());
          this.reportPanel.add$Component(newLabel);
        }
      }
      let player = this.getMyPlayer();
      for (const $it1 = player.getColonyList().iterator(); $it1.hasNext(); ) {
        let colony = $it1.next();
        let colonyButton = Utility.getLinkButton(colony.getName(), null, colony.getId());
        colonyButton.setBorder(Utility.getLeftCellBorder());
        colonyButton.addActionListener($J.fn(this, 'actionPerformed'));
        this.reportPanel.add$Component$Object(colonyButton, 'newline');
        for (let index = 0; index < selectedTypes.size(); index++) {
          let goodsType = selectedTypes.get(index);
          let newValue = colony.getNetProductionOf(goodsType);
          let goods = new Goods()._Goods$Game$Location$GoodsType$int(colony.getGame(), colony, goodsType, newValue);
          let goodsLabel = new GoodsLabel()._GoodsLabel$FreeColClient$Goods(fcc, goods);
          goodsLabel.setHorizontalAlignment(SwingConstants.LEADING);
          goodsLabel.setBorder(Utility.getCellBorder());
          this.reportPanel.add$Component(goodsLabel);
          for (const $it2 = basicBuildingTypes.get(index).iterator(); $it2.hasNext(); ) {
            let bt = $it2.next();
            let building = colony.getBuilding(bt);
            if (building == null) {
              newLabel = new JLabel()._JLabel$();
              newLabel.setBorder(Utility.getCellBorder());
              this.reportPanel.add$Component(newLabel);
            } else {
              let buildingPanel = new BuildingPanel()._BuildingPanel(fcc, building);
              buildingPanel.setBorder(Utility.getCellBorder());
              buildingPanel.initialize();
              this.reportPanel.add$Component(buildingPanel);
            }
          }
        }
      }
    }
    this.revalidate();
    this.repaint$();
  }
}

$J.define(ReportProductionPanel, 'net.sf.freecol.client.gui.panel.report.ReportProductionPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportProductionPanel' }, meths: { 'update()': 'update$$ReportProductionPanel' } });
$J.module(() => {
  JComboBox = $J.load('javax.swing.JComboBox');
  JLabel = $J.load('javax.swing.JLabel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  GoodsLabel = $J.load('net.sf.freecol.client.gui.label.GoodsLabel');
  BuildingPanel = $J.load('net.sf.freecol.client.gui.panel.BuildingPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
