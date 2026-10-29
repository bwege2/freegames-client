// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ZoomOutAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let ZoomInAction;

/**
 * An action for zooming out on the main map.
 */
export class ZoomOutAction extends MapboardAction {
  static readonly id: string = 'zoomOutAction';
  /**
   * Creates a new {@code ZoomOutAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ZoomOutAction(freeColClient: FreeColClient): this {
    this._MapboardAction(freeColClient, ZoomOutAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    if (!super.shouldBeEnabled()) {
      return false;
    }
    return this.getGUI().canZoomOutMap();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getGUI().zoomOutMap();
    this.update();
    this.getActionManager().getFreeColAction(ZoomInAction.id).update();
  }
}

$J.define(ZoomOutAction, 'net.sf.freecol.client.gui.action.ZoomOutAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_ZoomOutAction' } });
$J.module(() => {
  ZoomInAction = $J.load('net.sf.freecol.client.gui.action.ZoomInAction');
});
