// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/DetermineHighSeasAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * An action for determining the high seas tiles.
 */
export class DetermineHighSeasAction extends FreeColAction {
  static readonly id: string = 'determineHighSeasAction';
  /**
   * Creates a new {@code DetermineHighSeasAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _DetermineHighSeasAction(freeColClient: FreeColClient): this {
    this._FreeColAction(freeColClient, DetermineHighSeasAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    return super.shouldBeEnabled() && this.freeColClient.isMapEditor() && this.getMap() != null;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let map = this.getMap();
    let p = this.getGUI().showParametersDialog();
    if (p != null) {
      map.resetHighSeas(p.distToLandFromHighSeas, p.maxDistanceToEdge);
    }
  }
}

$J.define(DetermineHighSeasAction, 'net.sf.freecol.client.gui.action.DetermineHighSeasAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.FreeColAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_DetermineHighSeasAction' } });
