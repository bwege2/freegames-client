// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/SaveAndQuitAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

/**
 * An action for prompting the user to save before quitting the game.
 */
export class SaveAndQuitAction extends FreeColAction {
  static readonly id: string = 'saveAndQuitAction';
  /**
   * Creates a new {@code SaveAndQuitAction}.
   *
   * @param freeColClient The main controller object for the client.
   */
  _SaveAndQuitAction(freeColClient: FreeColClient): this {
    this._FreeColAction(freeColClient, SaveAndQuitAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    if (this.freeColClient.isMapEditor()) {
      return true;
    }
    if (!this.freeColClient.canSaveCurrentGame()) {
      return false;
    }
    return !this.getGUI().isPanelShowing();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    if (this.freeColClient.isMapEditor()) {
      this.freeColClient.getMapEditorController().saveMapEditorGame$();
      this.freeColClient.quit();
    } else {
      if (!this.igc().saveAndQuit()) {
        return;
      }
    }
  }
}

$J.define(SaveAndQuitAction, 'net.sf.freecol.client.gui.action.SaveAndQuitAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.FreeColAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_SaveAndQuitAction' } });
