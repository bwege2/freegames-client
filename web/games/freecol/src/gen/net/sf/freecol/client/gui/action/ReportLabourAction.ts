// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ReportLabourAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { FreeColAction } from './FreeColAction.ts';

let ClientOptions;

/**
 * An action for displaying a Labour Report.
 */
export class ReportLabourAction extends FreeColAction {
  static readonly id: string = 'reportLabourAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportLabourAction(freeColClient: FreeColClient): this {
    this._FreeColAction(freeColClient, ReportLabourAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    if (this.getClientOptions().getInteger(ClientOptions.LABOUR_REPORT) === ClientOptions.LABOUR_REPORT_CLASSIC) {
      this.getGUI().showReportLabourPanel();
    } else {
      this.getGUI().showCompactLabourReport$();
    }
  }
}

$J.define(ReportLabourAction, 'net.sf.freecol.client.gui.action.ReportLabourAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.FreeColAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportLabourAction' } });
$J.module(() => {
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
});
