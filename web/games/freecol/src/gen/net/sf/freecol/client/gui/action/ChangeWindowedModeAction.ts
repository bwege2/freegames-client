// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ChangeWindowedModeAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { SelectableOptionAction } from './SelectableOptionAction.ts';

/**
 * An action for toggling between full-screen and windowed mode.
 */
export class ChangeWindowedModeAction extends SelectableOptionAction {
  static readonly id: string = 'changeWindowedModeAction';
  /**
   * Creates a new {@code ChangeWindowedModeAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ChangeWindowedModeAction(freeColClient: FreeColClient): this {
    this._SelectableOptionAction(freeColClient, ChangeWindowedModeAction.id, null);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let gui = this.getGUI();
    if (gui == null) {
      return;
    }
    gui.changeWindowedMode();
  }
}

$J.define(ChangeWindowedModeAction, 'net.sf.freecol.client.gui.action.ChangeWindowedModeAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.SelectableOptionAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_ChangeWindowedModeAction' } });
