// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ShowMainAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * Returns to the {@code MainPanel}.
 * All in-game components are removed.
 *
 * @see net.sf.freecol.client.gui.panel.MainPanel
 */
export class ShowMainAction extends FreeColAction {
  static readonly id: string = 'showMainAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ShowMainAction(freeColClient: FreeColClient): this {
    this._FreeColAction(freeColClient, ShowMainAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getFreeColClient().getConnectController().mainTitle();
  }
}

$J.define(ShowMainAction, 'net.sf.freecol.client.gui.action.ShowMainAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.FreeColAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_ShowMainAction' } });
