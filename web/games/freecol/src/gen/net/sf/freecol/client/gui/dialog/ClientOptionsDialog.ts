// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/ClientOptionsDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { OptionsDialog } from './OptionsDialog.ts';

let ClientOptions, Utility, FreeColDirectories;

/**
 * Dialog for changing the {@link net.sf.freecol.client.ClientOptions}.
 */
export class ClientOptionsDialog extends OptionsDialog {
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   */
  _ClientOptionsDialog(freeColClient: FreeColClient, frame: JFrame, editable: boolean): this {
    this._OptionsDialog(freeColClient, freeColClient.getClientOptions(), freeColClient.getClientOptions().getId(), FreeColDirectories.CLIENT_OPTIONS_FILE_NAME, ClientOptions.TAG, editable);
    let buttons = new ArrayList();
    if (editable) {
      let resetButton = Utility.localizedButton$String('reset');
      resetButton.addActionListener((e) => {
        this.getOptionUI().reset();
      });
      buttons.add(resetButton);
      let applyDefaults = Utility.localizedButton$String('revertToDefaults');
      applyDefaults.addActionListener((e) => {
        this.load(FreeColDirectories.getBaseClientOptionsFile());
      });
      buttons.add(applyDefaults);
    }
    this.initialize(frame, buttons);
    return this;
  }
}

$J.define(ClientOptionsDialog, 'net.sf.freecol.client.gui.dialog.ClientOptionsDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.OptionsDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,boolean': '_ClientOptionsDialog' } });
$J.module(() => {
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
});
