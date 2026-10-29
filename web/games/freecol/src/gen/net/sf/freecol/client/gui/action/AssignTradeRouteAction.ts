// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/AssignTradeRouteAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { UnitAction } from './UnitAction.ts';

/**
 * An action for assigning a trade route to the currently selected unit.
 */
export class AssignTradeRouteAction extends UnitAction {
  static readonly id: string = 'assignTradeRouteAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _AssignTradeRouteAction(freeColClient: FreeColClient): this {
    this._UnitAction(freeColClient, AssignTradeRouteAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    if (super.shouldBeEnabled()) {
      let unit = this.getGUI().getActiveUnit();
      return (unit != null && unit.isCarrier());
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let unit = this.getGUI().getActiveUnit();
    if (unit != null) {
      this.getGUI().showTradeRoutePanel(unit);
    }
  }
}

$J.define(AssignTradeRouteAction, 'net.sf.freecol.client.gui.action.AssignTradeRouteAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.UnitAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_AssignTradeRouteAction' } });
