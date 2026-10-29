// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/TrainPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { NewUnitPanel } from './NewUnitPanel.ts';

let MigLayout, Messages;

/**
 * The panel that allows a user to train a new unit in Europe.
 */
export class TrainPanel extends NewUnitPanel {
  /**
   * The constructor to use.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _TrainPanel(freeColClient: FreeColClient): this {
    this._NewUnitPanel(freeColClient, new MigLayout()._MigLayout$String$String$String('wrap 5', '[sg]', ''), Messages.message$String('trainPanel.clickOn'), freeColClient.getGame().getSpecification().getUnitTypesTrainedInEurope(freeColClient.getMyPlayer()));
    return this;
  }
}

$J.define(TrainPanel, 'net.sf.freecol.client.gui.panel.TrainPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.NewUnitPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_TrainPanel' } });
$J.module(() => {
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
