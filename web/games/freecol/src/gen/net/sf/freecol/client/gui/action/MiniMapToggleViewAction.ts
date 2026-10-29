// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/MiniMapToggleViewAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let ClientOptions;

/**
 * Change view in on the minimap.
 */
export class MiniMapToggleViewAction extends MapboardAction {
  static readonly id: string = 'miniMapToggleBordersAction';
  /**
   * Creates a new {@code MiniMapToggleViewAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _MiniMapToggleViewAction$FreeColClient(freeColClient: FreeColClient): this {
    this._MapboardAction(freeColClient, MiniMapToggleViewAction.id);
    this.addImageIcons('toggle_view_politics');
    return this;
  }
  /**
   * Creates a new {@code MiniMapToggleViewAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param b a {@code boolean} value
   */
  _MiniMapToggleViewAction$FreeColClient$boolean(freeColClient: FreeColClient, b: boolean): this {
    this._MapboardAction(freeColClient, MiniMapToggleViewAction.id + '.secondary');
    this.addImageIcons('toggle_view_politics');
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getGUI().miniMapToggleViewControls();
    this.updateIcons();
  }
  update(): void {
    super.update();
    this.updateIcons();
  }
  updateIcons(): void {
    if (this.freeColClient.getClientOptions().getBoolean(ClientOptions.MINIMAP_TOGGLE_BORDERS)) {
      this.addImageIcons('toggle_view_politics');
    } else {
      this.addImageIcons('toggle_view_economic');
    }
  }
}

$J.define(MiniMapToggleViewAction, 'net.sf.freecol.client.gui.action.MiniMapToggleViewAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient,boolean': '_MiniMapToggleViewAction$FreeColClient$boolean', 'net.sf.freecol.client.FreeColClient': '_MiniMapToggleViewAction$FreeColClient' } });
$J.module(() => {
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
});
