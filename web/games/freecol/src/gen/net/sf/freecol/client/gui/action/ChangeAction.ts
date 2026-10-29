// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ChangeAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Action, Messages, Unit$UnitState, CollectionUtils;

/**
 * An action for changing the view. This action will:
 *
 *  - Open a colony panel if the active unit is located on a tile with
 *    a colony.
 *  - If aboard a carrier then the carrier will be the active unit.
 *  - In other cases: switch to another unit on the same tile.
 */
export class ChangeAction extends UnitAction {
  static readonly id: string = 'changeAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ChangeAction(freeColClient: FreeColClient): this {
    this._UnitAction(freeColClient, ChangeAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    return super.shouldBeEnabled() && this.getGUI().getActiveUnit().hasTile();
  }
  /**
   * {@inheritDoc}
   */
  update(): void {
    super.update();
    let unit = this.getGUI().getActiveUnit();
    if (unit != null && unit.hasTile()) {
      if (unit.getColony() != null) {
        this.putValue(Action.NAME, Messages.getName$String('changeAction.enterColony'));
      } else if (unit.isOnCarrier()) {
        this.putValue(Action.NAME, Messages.getName$String('changeAction.selectCarrier'));
      } else {
        this.putValue(Action.NAME, Messages.getName$String('changeAction.nextUnitOnTile'));
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let unit = this.getGUI().getActiveUnit();
    let tile = unit.getTile$();
    if (tile.getColony() != null) {
      this.getGUI().showColonyPanel(tile.getColony(), unit);
    } else if (unit.isOnCarrier()) {
      this.getGUI().changeView$Unit$boolean(unit.getCarrier(), false);
    } else {
      let activeUnitFound = false;
      for (const $it0 = tile.getUnitList().iterator(); $it0.hasNext(); ) {
        let u = $it0.next();
        if (u === unit) {
          activeUnitFound = true;
        } else if (activeUnitFound && u.getState() === Unit$UnitState.ACTIVE && u.getMovesLeft() > 0) {
          this.getGUI().changeView$Unit$boolean(u, false);
          return;
        }
      }
      let active = CollectionUtils.find$Stream$Predicate(tile.getUnits(), (u) => (u !== unit && u.getState() === Unit$UnitState.ACTIVE && u.getMovesLeft() > 0));
      if (active != null) {
        this.getGUI().changeView$Unit$boolean(active, false);
      }
    }
  }
}

$J.define(ChangeAction, 'net.sf.freecol.client.gui.action.ChangeAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.UnitAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_ChangeAction' } });
$J.module(() => {
  Action = $J.load('javax.swing.Action');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
