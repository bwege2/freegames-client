// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ContinueAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Action, Messages, FreeColDirectories, Game$LogoutReason;

/**
 * Action to load and start the most recent save game of the client.
 */
export class ContinueAction extends FreeColAction {
  static readonly id: string = 'continueAction';
  /**
   * Creates a new {@code ContinueAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ContinueAction(freeColClient: FreeColClient): this {
    this._FreeColAction(freeColClient, ContinueAction.id);
    this.putValue(Action.NAME, Messages.message$String('victory.continue'));
    this.putValue(Action.SHORT_DESCRIPTION, null);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let lastSave = FreeColDirectories.getLastSaveGameFile();
    if (lastSave != null) {
      if (this.getFreeColClient().isLoggedIn()) {
        this.getFreeColClient().getConnectController().requestLogout(Game$LogoutReason.LOGIN);
      }
      this.getFreeColClient().stopServer();
      if (!this.getConnectController().startSavedGame(lastSave)) {
        this.getGUI().showMainPanel(null);
      }
    }
  }
}

$J.define(ContinueAction, 'net.sf.freecol.client.gui.action.ContinueAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.FreeColAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_ContinueAction' } });
$J.module(() => {
  Action = $J.load('javax.swing.Action');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  Game$LogoutReason = $J.load('net.sf.freecol.common.model.Game$LogoutReason');
});
