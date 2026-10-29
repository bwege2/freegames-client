// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportLabourDetailPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let ImageIcon, JLabel, MigLayout, MigPanel, Utility, Messages, Colony, CollectionUtils;

/**
 * This panel displays the Labour Report.
 */
export class ReportLabourDetailPanel extends ReportPanel {
  data: JMap<UnitType, JMap<Location, number>> = null;
  unitCount: TypeCountMap<UnitType> = null;
  colonies: List<Colony> = null;
  unitType: UnitType = null;
  /**
   * Creates the detail portion of a labour report.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param unitType The {@code UnitType} to display detail for.
   * @param data The location data.
   * @param unitCount The unit counts by type.
   * @param colonies A list of {@code Colony}s for this player.
   */
  _ReportLabourDetailPanel(freeColClient: FreeColClient, unitType: UnitType, data: JMap<UnitType, JMap<Location, number>>, unitCount: TypeCountMap<UnitType>, colonies: List<Colony>): this {
    this._ReportPanel(freeColClient, 'report.labour.details');
    this.unitType = unitType;
    this.data = data;
    this.unitCount = unitCount;
    this.colonies = colonies;
    return this;
  }
  initialize(): void {
    let detailPanel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 7', '[]30[][]30[][]30[][]', ''));
    detailPanel.setOpaque(false);
    detailPanel.add$Component$Object(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledUnitTypeImage(this.unitType))), 'spany');
    detailPanel.add$Component(Utility.localizedLabel$FreeColSpecObjectType(this.unitType));
    detailPanel.add$Component$Object(new JLabel()._JLabel$String(String(this.unitCount.getCount(this.unitType))), 'wrap 10');
    let canTrain = false;
    let unitLocations = this.data.get(this.unitType);
    for (const $it0 = this.colonies.iterator(); $it0.hasNext(); ) {
      let colony = $it0.next();
      if (unitLocations.get(colony) != null) {
        let colonyName = colony.getName();
        if (colony.canTrain$UnitType(this.unitType)) {
          canTrain = true;
          colonyName += '*';
        }
        let colonyButton = Utility.getLinkButton(colonyName, null, colony.getId());
        colonyButton.addActionListener($J.fn(this, 'actionPerformed'));
        detailPanel.add$Component(colonyButton);
        let countLabel = new JLabel()._JLabel$String($J.str(unitLocations.get(colony)));
        countLabel.setForeground(Utility.getLinkColor());
        detailPanel.add$Component(countLabel);
      }
    }
    CollectionUtils.forEachMapEntry$Map$Predicate$Consumer(unitLocations, (e) => !(e.getKey() instanceof Colony), (e) => {
      let locationName = Messages.message$StringTemplate(e.getKey().getLocationLabel());
      let linkButton = Utility.getLinkButton(locationName, null, e.getKey().getId());
      linkButton.addActionListener($J.fn(this, 'actionPerformed'));
      detailPanel.add$Component(linkButton);
      let countLabel = new JLabel()._JLabel$String($J.str(e.getValue()));
      countLabel.setForeground(Utility.getLinkColor());
      detailPanel.add$Component(countLabel);
    });
    if (canTrain) {
      detailPanel.add$Component$Object(Utility.localizedLabel$String('report.labour.canTrain'), 'newline 20, span');
    }
    this.reportPanel.add$Component(detailPanel);
  }
}

$J.define(ReportLabourDetailPanel, 'net.sf.freecol.client.gui.panel.report.ReportLabourDetailPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.UnitType,java.util.Map,net.sf.freecol.common.model.TypeCountMap,java.util.List': '_ReportLabourDetailPanel' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
