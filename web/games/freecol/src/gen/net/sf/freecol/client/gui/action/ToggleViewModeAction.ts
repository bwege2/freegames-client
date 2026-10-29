// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ToggleViewModeAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let GUI$ViewMode;

/**
 * An action for changing view mode between move units mode and view terrain
 * mode.
 */
export class ToggleViewModeAction extends MapboardAction {
  static readonly id: string = 'toggleViewModeAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ToggleViewModeAction(freeColClient: FreeColClient): this {
    this._MapboardAction(freeColClient, ToggleViewModeAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let gui = this.getGUI();
    let vm = gui.getViewMode();
    switch (vm) {
      case GUI$ViewMode.MOVE_UNITS:
        gui.changeView$Tile(gui.getSelectedTile());
        break;
      case GUI$ViewMode.TERRAIN:
        gui.changeView$Unit$boolean(gui.getActiveUnit(), false);
        break;
      default:
        break;
    }
  }
}

$J.define(ToggleViewModeAction, 'net.sf.freecol.client.gui.action.ToggleViewModeAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_ToggleViewModeAction' } });
$J.module(() => {
  GUI$ViewMode = $J.load('net.sf.freecol.client.gui.GUI$ViewMode');
});
