// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ExecuteGotoOrdersAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { MapboardAction } from './MapboardAction.ts';

/**
 * An action for executing goto orders immediately.
 */
export class ExecuteGotoOrdersAction extends MapboardAction {
  static readonly id: string = 'executeGotoOrdersAction';
  /**
   * Creates a new {@code ExecuteGotoOrdersAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ExecuteGotoOrdersAction(freeColClient: FreeColClient): this {
    this._MapboardAction(freeColClient, ExecuteGotoOrdersAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.igc().executeGotoOrders();
  }
}

$J.define(ExecuteGotoOrdersAction, 'net.sf.freecol.client.gui.action.ExecuteGotoOrdersAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_ExecuteGotoOrdersAction' } });
