// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportExplorationPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Comparator, JFunction, JString } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let JLabel, MigLayout, FontLibrary, Utility, CollectionUtils;

/**
 * This panel displays the exploration report.
 */
export class ReportExplorationPanel extends ReportPanel {
  /**
   * Comparator for discovered regions, by descending turn and score.
   */
  static regionComparator: Comparator<Region> = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportExplorationPanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportExplorationAction');
    this.reportPanel.removeAll();
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String$String('wrap 5, fillx', '', ''));
    let font = FontLibrary.getScaledFont$String('normal-bold-tiny');
    let nameOfRegion = Utility.localizedLabel$String('report.exploration.nameOfRegion');
    nameOfRegion.setFont(font);
    this.reportPanel.add$Component(nameOfRegion);
    let typeOfRegion = Utility.localizedLabel$String('report.exploration.typeOfRegion');
    typeOfRegion.setFont(font);
    this.reportPanel.add$Component(typeOfRegion);
    let discoveredIn = Utility.localizedLabel$String('report.exploration.discoveredIn');
    discoveredIn.setFont(font);
    this.reportPanel.add$Component(discoveredIn);
    let discoveredBy = Utility.localizedLabel$String('report.exploration.discoveredBy');
    discoveredBy.setFont(font);
    this.reportPanel.add$Component(discoveredBy);
    let valueOfRegion = Utility.localizedLabel$String('report.exploration.valueOfRegion');
    valueOfRegion.setFont(font);
    this.reportPanel.add$Component(valueOfRegion);
    for (const $it0 = CollectionUtils.transform$Collection$Predicate$Function$Comparator(this.getMap().getRegions(), CollectionUtils.isNotNull$Function(($p0) => $p0.getDiscoveredIn()), JFunction.identity(), ReportExplorationPanel.regionComparator).iterator(); $it0.hasNext(); ) {
      let region = $it0.next();
      this.reportPanel.add$Component(new JLabel()._JLabel$String(region.getName()));
      this.reportPanel.add$Component(Utility.localizedLabel$String(region.getType().getNameKey()));
      this.reportPanel.add$Component(Utility.localizedLabel$StringTemplate(region.getDiscoveredIn().getLabel()));
      this.reportPanel.add$Component(Utility.localizedLabel$StringTemplate(region.getDiscoveredBy().getCountryLabel()));
      this.reportPanel.add$Component(new JLabel()._JLabel$String(String(region.getScoreValue())));
    }
    return this;
  }
  static $clinit() {
    ReportExplorationPanel.regionComparator = Comparator.reversed(Comparator.thenComparingInt(Comparator.reversed((Comparator.comparingInt((r) => r.getDiscoveredIn().getNumber()))), ($p0) => $p0.getScoreValue()));
  }
}

$J.define(ReportExplorationPanel, 'net.sf.freecol.client.gui.panel.report.ReportExplorationPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportExplorationPanel' }, clinit: true, lazy: ['regionComparator'] });
$J.module(() => {
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
