// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportHistoryPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let MigLayout, Utility;

/**
 * This panel displays the History Report.
 */
export class ReportHistoryPanel extends ReportPanel {
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportHistoryPanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportHistoryAction');
    let history = this.getMyPlayer().getHistory();
    this.reportPanel.removeAll();
    if (history.isEmpty()) {
      return this;
    }
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String$String('wrap 2', '[]20[fill]', ''));
    for (const $it0 = history.iterator(); $it0.hasNext(); ) {
      let event = $it0.next();
      this.reportPanel.add$Component(Utility.localizedLabel$StringTemplate(event.getTurn().getLabel()));
      this.reportPanel.add$Component(Utility.localizedTextArea$StringTemplate$int(event, 40));
    }
    return this;
  }
}

$J.define(ReportHistoryPanel, 'net.sf.freecol.client.gui.panel.report.ReportHistoryPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportHistoryPanel' } });
$J.module(() => {
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
