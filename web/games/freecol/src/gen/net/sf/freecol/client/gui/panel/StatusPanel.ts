// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/StatusPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColPanel } from './FreeColPanel.ts';

let JLabel;

/**
 * A {@code Panel} for showing status information on screen.
 */
export class StatusPanel extends FreeColPanel {
  static logger: Logger = null;
  statusLabel: JLabel = null;
  /**
   * Creates a basic status panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _StatusPanel(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient(freeColClient);
    this.setFocusable(false);
    this.statusLabel = new JLabel()._JLabel$();
    this.add$Component(this.statusLabel);
    this.setSize$int$int(260, 60);
    return this;
  }
  /**
   * Sets a new status message to be displayed by this
   * {@code StatusPanel}.
   *
   * @param message The message to be displayed.
   */
  setStatusMessage(message: string): void {
    this.statusLabel.setText(message);
    this.setSize$Dimension(this.getPreferredSize$());
  }
  static $clinit() {
    StatusPanel.logger = Logger.getLogger($J.cls(StatusPanel).getName());
  }
}

$J.define(StatusPanel, 'net.sf.freecol.client.gui.panel.StatusPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_StatusPanel' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  JLabel = $J.load('javax.swing.JLabel');
});
