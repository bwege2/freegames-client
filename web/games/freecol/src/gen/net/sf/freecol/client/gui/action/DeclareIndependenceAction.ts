// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/DeclareIndependenceAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Player$PlayerType;

/**
 * An action for declaring independence.
 */
export class DeclareIndependenceAction extends MapboardAction {
  static readonly id: string = 'declareIndependenceAction';
  /**
   * Creates a new {@code DeclareIndependenceAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _DeclareIndependenceAction(freeColClient: FreeColClient): this {
    this._MapboardAction(freeColClient, DeclareIndependenceAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    let p = this.freeColClient.getMyPlayer();
    return p != null && p.getPlayerType() === Player$PlayerType.COLONIAL && super.shouldBeEnabled();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.igc().declareIndependence();
  }
}

$J.define(DeclareIndependenceAction, 'net.sf.freecol.client.gui.action.DeclareIndependenceAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_DeclareIndependenceAction' } });
$J.module(() => {
  Player$PlayerType = $J.load('net.sf.freecol.common.model.Player$PlayerType');
});
