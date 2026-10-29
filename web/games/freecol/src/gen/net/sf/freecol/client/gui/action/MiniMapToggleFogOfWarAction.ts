// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/MiniMapToggleFogOfWarAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * An action for enable/disable fog of war in on the minimap.
 */
export class MiniMapToggleFogOfWarAction extends MapboardAction {
  static readonly id: string = 'miniMapToggleFogOfWarAction';
  /**
   * Creates a new {@code MiniMapToggleFogAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _MiniMapToggleFogOfWarAction$FreeColClient(freeColClient: FreeColClient): this {
    this._MapboardAction(freeColClient, MiniMapToggleFogOfWarAction.id);
    this.addImageIcons('toggle_fog_of_war');
    return this;
  }
  /**
   * Creates a new {@code MiniMapToggleFogAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param b a {@code boolean} value
   */
  _MiniMapToggleFogOfWarAction$FreeColClient$boolean(freeColClient: FreeColClient, b: boolean): this {
    this._MapboardAction(freeColClient, MiniMapToggleFogOfWarAction.id + '.secondary');
    this.addImageIcons('toggle_fog_of_war');
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getGUI().miniMapToggleFogOfWarControls();
    this.updateIcons();
  }
  update(): void {
    super.update();
    this.updateIcons();
  }
  updateIcons(): void {
    if (this.freeColClient.getClientOptions().getBoolean(ClientOptions.MINIMAP_TOGGLE_FOG_OF_WAR)) {
      this.addImageIcons('toggle_fog_of_war');
    } else {
      this.addImageIcons('toggle_fog_of_war_no');
    }
  }
}

$J.define(MiniMapToggleFogOfWarAction, 'net.sf.freecol.client.gui.action.MiniMapToggleFogOfWarAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient,boolean': '_MiniMapToggleFogOfWarAction$FreeColClient$boolean', 'net.sf.freecol.client.FreeColClient': '_MiniMapToggleFogOfWarAction$FreeColClient' } });
$J.module(() => {
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
});
