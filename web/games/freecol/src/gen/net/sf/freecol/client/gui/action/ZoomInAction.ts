// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ZoomInAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let ZoomOutAction;

/**
 * An action for zooming in on the main map.
 */
export class ZoomInAction extends MapboardAction {
  static readonly id: string = 'zoomInAction';
  /**
   * Creates a new {@code ZoomInAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ZoomInAction(freeColClient: FreeColClient): this {
    this._MapboardAction(freeColClient, ZoomInAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    if (!super.shouldBeEnabled()) {
      return false;
    }
    return this.getGUI().canZoomInMap();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getGUI().zoomInMap();
    this.update();
    this.getActionManager().getFreeColAction(ZoomOutAction.id).update();
  }
}

$J.define(ZoomInAction, 'net.sf.freecol.client.gui.action.ZoomInAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_ZoomInAction' } });
$J.module(() => {
  ZoomOutAction = $J.load('net.sf.freecol.client.gui.action.ZoomOutAction');
});
