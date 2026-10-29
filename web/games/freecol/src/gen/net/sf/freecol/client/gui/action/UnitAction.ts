// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/UnitAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * Super class for all actions that should be disabled when no unit is
 * selected.
 */
export class UnitAction extends MapboardAction {
  /**
   * Creates a new {@code UnitAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param id The object identifier.
   */
  _UnitAction(freeColClient: FreeColClient, id: string): this {
    this._MapboardAction(freeColClient, id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    let gui = this.getGUI();
    let player: Player;
    let unit: Unit;
    return gui != null && (player = this.getFreeColClient().getMyPlayer()) != null && (unit = gui.getActiveUnit()) != null && player.owns(unit) && super.shouldBeEnabled();
  }
}

$J.define(UnitAction, 'net.sf.freecol.client.gui.action.UnitAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient,java.lang.String': '_UnitAction' } });
