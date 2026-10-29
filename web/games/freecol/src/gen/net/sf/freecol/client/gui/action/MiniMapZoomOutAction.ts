// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/MiniMapZoomOutAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let MiniMapZoomInAction;

/**
 * An action for zooming out on the minimap.
 */
export class MiniMapZoomOutAction extends MapboardAction {
  static readonly id: string = 'miniMapZoomOutAction';
  /**
   * Creates a new {@code MiniMapZoomOutAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _MiniMapZoomOutAction$FreeColClient(freeColClient: FreeColClient): this {
    this._MapboardAction(freeColClient, MiniMapZoomOutAction.id);
    this.addImageIcons('zoom_out');
    return this;
  }
  /**
   * Creates a new {@code MiniMapZoomOutAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param b A boolean.
   */
  _MiniMapZoomOutAction$FreeColClient$boolean(freeColClient: FreeColClient, b: boolean): this {
    this._MapboardAction(freeColClient, MiniMapZoomOutAction.id + '.secondary');
    this.addImageIcons('zoom_out');
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    return super.shouldBeEnabled() && this.getGUI().canZoomOutMapControls();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getGUI().zoomOutMapControls();
    this.update();
    this.getActionManager().getFreeColAction(MiniMapZoomInAction.id).update();
    this.getActionManager().getFreeColAction(MiniMapZoomInAction.id + '.secondary').update();
  }
}

$J.define(MiniMapZoomOutAction, 'net.sf.freecol.client.gui.action.MiniMapZoomOutAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient,boolean': '_MiniMapZoomOutAction$FreeColClient$boolean', 'net.sf.freecol.client.FreeColClient': '_MiniMapZoomOutAction$FreeColClient' } });
$J.module(() => {
  MiniMapZoomInAction = $J.load('net.sf.freecol.client.gui.action.MiniMapZoomInAction');
});
