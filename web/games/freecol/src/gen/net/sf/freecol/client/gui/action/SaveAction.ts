// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/SaveAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * An action for saving the game.
 */
export class SaveAction extends FreeColAction {
  static readonly id: string = 'saveAction';
  /**
   * Creates a new {@code SaveAction}.
   *
   * @param freeColClient The main controller object for the client.
   */
  _SaveAction(freeColClient: FreeColClient): this {
    this._FreeColAction(freeColClient, SaveAction.id);
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
    if (!this.freeColClient.isMapEditor()) {
      this.igc().saveGame$();
    } else {
      this.freeColClient.getMapEditorController().saveMapEditorGame$();
    }
  }
}

$J.define(SaveAction, 'net.sf.freecol.client.gui.action.SaveAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.FreeColAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_SaveAction' } });
