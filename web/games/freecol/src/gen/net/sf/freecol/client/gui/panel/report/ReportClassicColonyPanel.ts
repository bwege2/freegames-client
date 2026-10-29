// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportClassicColonyPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let GridLayout, ImageIcon, JLabel, JPanel, JSeparator, SwingConstants, MigLayout, ProductionLabel, UnitLabel, Utility, Messages, AbstractGoods, FreeColObject, GoodsType, Unit, CollectionUtils;

/**
 * This panel displays the classic version of the colony report.
 */
export class ReportClassicColonyPanel extends ReportPanel {
  /**
   * Compare buildings by their underlying type index (which reduces
   * to the order in the spec), then the FCO order.
   */
  static buildingTypeComparator: Comparator<Building> = null;
  static readonly COLONISTS_PER_ROW: number = 20;
  static readonly UNITS_PER_ROW: number = 14;
  static readonly GOODS_PER_ROW: number = 10;
  static readonly BUILDINGS_PER_ROW: number = 8;
  colonies: List<Colony> = null;
  /**
   * Creates a colony report.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportClassicColonyPanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportColonyAction');
    this.colonies = new ArrayList();
    this.colonies.addAll(freeColClient.getMyPlayer().getColonyList());
    this.update$$ReportClassicColonyPanel();
    return this;
  }
  update$$ReportClassicColonyPanel(): void {
    let spec = this.getSpecification();
    let lib = this.getImageLibrary();
    this.reportPanel.removeAll();
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String('fill'));
    for (const $it0 = this.colonies.iterator(); $it0.hasNext(); ) {
      let colony = $it0.next();
      let button = Utility.getLinkButton(colony.getName(), null, colony.getId());
      button.addActionListener($J.fn(this, 'actionPerformed'));
      this.reportPanel.add$Component$Object(button, 'newline, split 2');
      this.reportPanel.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.HORIZONTAL), 'growx');
      let currentType = colony.getCurrentlyBuilding();
      let buildableLabel = null;
      if (currentType != null) {
        buildableLabel = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(lib.getSmallBuildableTypeImage(currentType, colony.getOwner())));
        Utility.localizeToolTip$JComponent$StringTemplate(buildableLabel, currentType.getCurrentlyBuildingLabel());
        buildableLabel.setIcon(buildableLabel.getDisabledIcon());
      }
      let colonistsPanel = new JPanel()._JPanel$LayoutManager(new GridLayout()._GridLayout$int$int(0, ReportClassicColonyPanel.COLONISTS_PER_ROW));
      colonistsPanel.setOpaque(false);
      for (const $it1 = CollectionUtils.sort$Stream$Comparator(colony.getUnits(), Unit.typeRoleComparator).iterator(); $it1.hasNext(); ) {
        let u = $it1.next();
        colonistsPanel.add$Component(new UnitLabel()._UnitLabel$FreeColClient$Unit$boolean$boolean(this.getFreeColClient(), u, true, true));
      }
      let unitsPanel = new JPanel()._JPanel$LayoutManager(new GridLayout()._GridLayout$int$int(0, ReportClassicColonyPanel.UNITS_PER_ROW));
      unitsPanel.setOpaque(false);
      for (const $it2 = CollectionUtils.sort$Stream$Comparator(colony.getTile$().getUnits(), Unit.typeRoleComparator).iterator(); $it2.hasNext(); ) {
        let u = $it2.next();
        unitsPanel.add$Component(new UnitLabel()._UnitLabel$FreeColClient$Unit$boolean$boolean(this.getFreeColClient(), u, true, true));
      }
      if (buildableLabel != null && spec.getUnitTypeList().contains(currentType)) {
        unitsPanel.add$Component(buildableLabel);
      }
      this.reportPanel.add$Component$Object(colonistsPanel, 'newline, growx');
      this.reportPanel.add$Component$Object(unitsPanel, 'newline, growx');
      let count = 0;
      for (const $it3 = CollectionUtils.sort$Collection$Comparator(spec.getGoodsTypeList(), GoodsType.goodsTypeComparator).iterator(); $it3.hasNext(); ) {
        let gt = $it3.next();
        let newValue = colony.getNetProductionOf(gt);
        let stockValue = colony.getGoodsCount(gt);
        if (newValue !== 0 || stockValue > 0) {
          let maxProduction = CollectionUtils.sum$Collection$ToIntFunction(colony.getWorkLocationsForProducing(gt), (wl) => wl.getMaximumProductionOf(gt));
          let productionLabel = new ProductionLabel()._ProductionLabel$FreeColClient$AbstractGoods$int$int$boolean(this.getFreeColClient(), new AbstractGoods()._AbstractGoods$GoodsType$int(gt, newValue), maxProduction, stockValue, true);
          if (count % ReportClassicColonyPanel.GOODS_PER_ROW === 0) {
            this.reportPanel.add$Component$Object(productionLabel, 'newline, split ' + ReportClassicColonyPanel.GOODS_PER_ROW);
          } else {
            this.reportPanel.add$Component(productionLabel);
          }
          count++;
        }
      }
      let buildingsPanel = new JPanel()._JPanel$LayoutManager(new GridLayout()._GridLayout$int$int(0, ReportClassicColonyPanel.BUILDINGS_PER_ROW));
      buildingsPanel.setOpaque(false);
      for (const $it4 = CollectionUtils.sort$Collection$Comparator(colony.getBuildings(), ReportClassicColonyPanel.buildingTypeComparator).iterator(); $it4.hasNext(); ) {
        let building = $it4.next();
        if (building.getType().isAutomaticBuild()) {
          continue;
        }
        let buildingLabel = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(lib.getSmallBuildingImage(building)));
        buildingLabel.setToolTipText(Messages.getName$Named(building));
        buildingsPanel.add$Component(buildingLabel);
      }
      if (buildableLabel != null && spec.getBuildingTypeList().contains(currentType)) {
        buildingsPanel.add$Component(buildableLabel);
      }
      this.reportPanel.add$Component$Object(buildingsPanel, 'newline, growx');
    }
  }
  static $clinit() {
    ReportClassicColonyPanel.buildingTypeComparator = Comparator.thenComparing((Comparator.comparingInt((b) => b.getType().getIndex())), FreeColObject.fcoComparator);
  }
}

$J.define(ReportClassicColonyPanel, 'net.sf.freecol.client.gui.panel.report.ReportClassicColonyPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportClassicColonyPanel' }, meths: { 'update()': 'update$$ReportClassicColonyPanel' }, clinit: true, lazy: ['buildingTypeComparator'] });
$J.module(() => {
  GridLayout = $J.load('java.awt.GridLayout');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JPanel = $J.load('javax.swing.JPanel');
  JSeparator = $J.load('javax.swing.JSeparator');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ProductionLabel = $J.load('net.sf.freecol.client.gui.label.ProductionLabel');
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
