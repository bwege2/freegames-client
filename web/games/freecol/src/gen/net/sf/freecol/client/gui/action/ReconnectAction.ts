// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ReconnectAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * An action for reconnecting to the server.
 */
export class ReconnectAction extends FreeColAction {
  static readonly id: string = 'reconnectAction';
  /**
   * Creates a new {@code DeclareIndependenceAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReconnectAction(freeColClient: FreeColClient): this {
    this._FreeColAction(freeColClient, ReconnectAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.igc().reconnect();
  }
}

$J.define(ReconnectAction, 'net.sf.freecol.client.gui.action.ReconnectAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.FreeColAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReconnectAction' } });
