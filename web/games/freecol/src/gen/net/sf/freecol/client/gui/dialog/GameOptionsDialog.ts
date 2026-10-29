// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/GameOptionsDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Utility, FreeColDirectories, GameOptions;

/**
 * Dialog for changing the {@link net.sf.freecol.common.option.GameOptions}.
 */
export class GameOptionsDialog extends OptionsDialog {
  /**
   * Creates a game options dialog.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param editable Whether the game options can be modified.
   */
  _GameOptionsDialog(freeColClient: FreeColClient, frame: JFrame, editable: boolean): this {
    this._OptionsDialog(freeColClient, freeColClient.getGame().getGameOptions(), GameOptions.TAG, FreeColDirectories.GAME_OPTIONS_FILE_NAME, GameOptions.TAG, editable);
    if (this.isEditable() && freeColClient.getSinglePlayer()) {
      let comp = this.getOptionUI().getOptionUI$String(GameOptions.VICTORY_DEFEAT_HUMANS);
      if (comp != null) {
        comp.setValue(false);
        comp.getComponent().setEnabled(false);
      }
    }
    let buttons = new ArrayList();
    if (this.isEditable()) {
      let resetButton = Utility.localizedButton$String('reset');
      resetButton.addActionListener((e) => {
        this.getOptionUI().reset();
      });
      buttons.add(resetButton);
    }
    this.initialize(frame, buttons);
    return this;
  }
}

$J.define(GameOptionsDialog, 'net.sf.freecol.client.gui.dialog.GameOptionsDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.OptionsDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,boolean': '_GameOptionsDialog' } });
$J.module(() => {
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
});
