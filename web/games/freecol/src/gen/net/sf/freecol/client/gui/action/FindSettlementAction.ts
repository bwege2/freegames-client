// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/FindSettlementAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * An action for finding a settlement on the map.
 */
export class FindSettlementAction extends MapboardAction {
  static readonly id: string = 'findSettlementAction';
  /**
   * Creates a new {@code FindSettlementAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _FindSettlementAction(freeColClient: FreeColClient): this {
    this._MapboardAction(freeColClient, FindSettlementAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getGUI().showFindSettlementPanel();
  }
}

$J.define(FindSettlementAction, 'net.sf.freecol.client.gui.action.FindSettlementAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_FindSettlementAction' } });
