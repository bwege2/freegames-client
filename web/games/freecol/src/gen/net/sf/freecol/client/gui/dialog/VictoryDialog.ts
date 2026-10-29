// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/VictoryDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColConfirmDialog } from './FreeColConfirmDialog.ts';

let ImageIcon, JLabel, MigLayout, MigPanel, Utility, Messages;

/**
 * This dialog is displayed to a player who has won the game.
 */
export class VictoryDialog extends FreeColConfirmDialog {
  /**
   * Create a Victory dialog.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   */
  _VictoryDialog(freeColClient: FreeColClient, frame: JFrame): this {
    this._FreeColConfirmDialog$FreeColClient$JFrame(freeColClient, frame);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '', ''));
    panel.add$Component$Object(Utility.localizedHeader(Messages.message$String('victory.text'), Utility.FONTSPEC_TITLE), 'align center, wrap 20');
    let image = freeColClient.getGUI().getFixedImageLibrary().getScaledImage('image.flavor.Victory');
    panel.add$Component$Object(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(image)), 'align center');
    this.initializeConfirmDialog(frame, false, panel, null, 'victory.yes', 'victory.continue');
    return this;
  }
}

$J.define(VictoryDialog, 'net.sf.freecol.client.gui.dialog.VictoryDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColConfirmDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame': '_VictoryDialog' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
