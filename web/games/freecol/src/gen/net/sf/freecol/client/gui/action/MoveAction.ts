// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/MoveAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * An action for chosing the next unit as the active unit.
 */
export class MoveAction extends MapboardAction {
  static readonly id: string = 'moveAction.';
  direction: Direction = null;
  /**
   * Creates a new {@code MoveAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param direction The {@code Direction} to move.
   */
  _MoveAction$FreeColClient$Direction(freeColClient: FreeColClient, direction: Direction): this {
    this._MapboardAction(freeColClient, MoveAction.id + $J.str(direction));
    this.direction = direction;
    return this;
  }
  /**
   * Creates a new {@code MoveAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param direction The {@code Direction} to move in.
   * @param secondary a {@code boolean} value
   */
  _MoveAction$FreeColClient$Direction$boolean(freeColClient: FreeColClient, direction: Direction, secondary: boolean): this {
    this._MapboardAction(freeColClient, MoveAction.id + $J.str(direction) + '.secondary');
    this.direction = direction;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let gui = this.getGUI();
    {
      let tile: Tile;
      switch (gui.getViewMode()) {
        case GUI$ViewMode.MOVE_UNITS:
          this.igc().moveUnit(gui.getActiveUnit(), this.direction);
          break;
        case GUI$ViewMode.TERRAIN:
          tile = gui.getSelectedTile();
          if (tile != null) {
            let newTile = tile.getNeighbourOrNull(this.direction);
            if (newTile != null) {
              gui.changeView$Tile(newTile);
            }
          }
          break;
        default:
          break;
      }
    }
  }
}

$J.define(MoveAction, 'net.sf.freecol.client.gui.action.MoveAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Direction,boolean': '_MoveAction$FreeColClient$Direction$boolean', 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Direction': '_MoveAction$FreeColClient$Direction' } });
$J.module(() => {
  GUI$ViewMode = $J.load('net.sf.freecol.client.gui.GUI$ViewMode');
});
