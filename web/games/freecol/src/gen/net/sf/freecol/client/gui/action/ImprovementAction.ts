// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ImprovementAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { UnitAction } from './UnitAction.ts';

let Unit$UnitState;

/**
 * An action for using the active unit to add a tile improvement to
 * the unit's tile, possibly changing the tile type in the process. In
 * the original game, artificial tile improvements were clearing,
 * plowing and building a road.
 */
export class ImprovementAction extends UnitAction {
  improvement: TileImprovementType = null;
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param improvement The {@code TileImprovementType} to make.
   */
  _ImprovementAction(freeColClient: FreeColClient, improvement: TileImprovementType): this {
    this._UnitAction(freeColClient, improvement.getSuffix$() + 'Action');
    this.improvement = improvement;
    this.addImageIcons(improvement.getSuffix$());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    if (!super.shouldBeEnabled()) {
      return false;
    }
    let selectedUnit = this.getGUI().getActiveUnit();
    let tile = selectedUnit.getTile$();
    return tile != null && tile.isImprovementTypeAllowed(this.improvement) && this.improvement.isWorkerAllowed(selectedUnit) && selectedUnit.checkSetState(Unit$UnitState.IMPROVING);
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let unit = this.getGUI().getActiveUnit();
    if (unit == null) {
      return;
    }
    this.igc().changeWorkImprovementType(unit, this.improvement);
  }
}

$J.define(ImprovementAction, 'net.sf.freecol.client.gui.action.ImprovementAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.UnitAction', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.TileImprovementType': '_ImprovementAction' } });
$J.module(() => {
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
});
