// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ShowGameOptionsAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * An action for displaying the Game Options.
 */
export class ShowGameOptionsAction extends FreeColAction {
  static readonly id: string = 'gameOptionsAction';
  /**
   * Creates a new {@code ShowGameOptionsAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ShowGameOptionsAction(freeColClient: FreeColClient): this {
    this._FreeColAction(freeColClient, ShowGameOptionsAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getGUI().showGameOptionsDialog(false, null);
  }
}

$J.define(ShowGameOptionsAction, 'net.sf.freecol.client.gui.action.ShowGameOptionsAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.FreeColAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_ShowGameOptionsAction' } });
