// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/AttackRangedAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

export class AttackRangedAction extends UnitAction {
  static readonly id: string = 'attackRangedAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.@param improvement The {@code TileImprovementType} to make.
   */
  _AttackRangedAction(freeColClient: FreeColClient): this {
    this._UnitAction(freeColClient, AttackRangedAction.id);
    this.addImageIcons('ranged');
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
    return selectedUnit != null && selectedUnit.getType().getAttackRange() > 0 && selectedUnit.getMovesLeft() > 0 && selectedUnit.isOffensiveUnit();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let unit = this.getGUI().getActiveUnit();
    if (unit == null) {
      return;
    }
    this.getGUI().toggleRangedAttackMode();
  }
}

$J.define(AttackRangedAction, 'net.sf.freecol.client.gui.action.AttackRangedAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.UnitAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_AttackRangedAction' } });
