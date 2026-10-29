// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportReligiousPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let MigLayout, FontLibrary, BuildingPanel, FreeColPanel, FreeColProgressBar, Utility, Building, CollectionUtils;

/**
 * This panel displays the Religious Report.
 */
export class ReportReligiousPanel extends ReportPanel {
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportReligiousPanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportReligionAction');
    let font = FontLibrary.getScaledFont$String('normal-bold-smaller');
    let player = this.getMyPlayer();
    let spec = this.getSpecification();
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String('wrap 6, fill', 'center'));
    for (const $it0 = spec.getImmigrationGoodsTypeList().iterator(); $it0.hasNext(); ) {
      let gt = $it0.next();
      let crosses = Utility.localizedLabel$FreeColSpecObjectType(gt);
      crosses.setFont(font);
      this.reportPanel.add$Component$Object(crosses, FreeColPanel.SPAN_SPLIT_2);
      let progressBar = new FreeColProgressBar()._FreeColProgressBar$FreeColClient$GoodsType$int$int$int$int(freeColClient, gt, 0, player.getImmigrationRequired(), player.getImmigration(), player.getTotalImmigrationProduction());
      this.reportPanel.add$Component$Object(progressBar, 'span');
      for (const $it1 = player.getColonyList().iterator(); $it1.hasNext(); ) {
        let colony = $it1.next();
        let wl = CollectionUtils.first$Collection(colony.getWorkLocationsForProducing(gt));
        if (wl instanceof Building) {
          this.reportPanel.add$Component$Object(this.createColonyButton$Colony(colony), 'split 2, flowy');
          let bp = new BuildingPanel()._BuildingPanel(this.getFreeColClient(), wl);
          bp.initialize();
          this.reportPanel.add$Component(bp);
        }
      }
    }
    return this;
  }
}

$J.define(ReportReligiousPanel, 'net.sf.freecol.client.gui.panel.report.ReportReligiousPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportReligiousPanel' } });
$J.module(() => {
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  BuildingPanel = $J.load('net.sf.freecol.client.gui.panel.BuildingPanel');
  FreeColPanel = $J.load('net.sf.freecol.client.gui.panel.FreeColPanel');
  FreeColProgressBar = $J.load('net.sf.freecol.client.gui.panel.FreeColProgressBar');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Building = $J.load('net.sf.freecol.common.model.Building');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
