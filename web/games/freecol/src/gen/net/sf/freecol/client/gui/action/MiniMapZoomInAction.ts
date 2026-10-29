// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/MiniMapZoomInAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let MiniMapZoomOutAction;

/**
 * An action for zooming in on the minimap.
 */
export class MiniMapZoomInAction extends MapboardAction {
  static readonly id: string = 'miniMapZoomInAction';
  /**
   * Creates a new {@code MiniMapZoomInAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _MiniMapZoomInAction$FreeColClient(freeColClient: FreeColClient): this {
    this._MapboardAction(freeColClient, MiniMapZoomInAction.id);
    this.addImageIcons('zoom_in');
    return this;
  }
  /**
   * Creates a new {@code MiniMapZoomInAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param b a {@code boolean} value
   */
  _MiniMapZoomInAction$FreeColClient$boolean(freeColClient: FreeColClient, b: boolean): this {
    this._MapboardAction(freeColClient, MiniMapZoomInAction.id + '.secondary');
    this.addImageIcons('zoom_in');
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    return super.shouldBeEnabled() && this.getGUI().canZoomInMapControls();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getGUI().zoomInMapControls();
    this.update();
    this.getActionManager().getFreeColAction(MiniMapZoomOutAction.id).update();
    this.getActionManager().getFreeColAction(MiniMapZoomOutAction.id + '.secondary').update();
  }
}

$J.define(MiniMapZoomInAction, 'net.sf.freecol.client.gui.action.MiniMapZoomInAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient,boolean': '_MiniMapZoomInAction$FreeColClient$boolean', 'net.sf.freecol.client.FreeColClient': '_MiniMapZoomInAction$FreeColClient' } });
$J.module(() => {
  MiniMapZoomOutAction = $J.load('net.sf.freecol.client.gui.action.MiniMapZoomOutAction');
});
