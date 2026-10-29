// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/LoadAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Goods, GoodsContainer;

/**
 * An action for filling the holds of the currently selected unit.
 */
export class LoadAction extends MapboardAction {
  static readonly id: string = 'loadAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _LoadAction(freeColClient: FreeColClient): this {
    this._MapboardAction(freeColClient, LoadAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    let carrier = this.getGUI().getActiveUnit();
    return carrier != null && carrier.isCarrier() && carrier.hasSpaceLeft() && super.shouldBeEnabled();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let unit = this.getGUI().getActiveUnit();
    if (unit == null) {
      return;
    }
    let colony = unit.getColony();
    if (colony == null) {
      return;
    }
    for (const $it0 = unit.getCompactGoodsList().iterator(); $it0.hasNext(); ) {
      let goods = $it0.next();
      let type$ = goods.getType();
      let loadable = unit.getLoadableAmount(type$);
      let present = colony.getGoodsCount(type$);
      if (loadable > 0 && present > 0) {
        let n = Math.min(Math.min(loadable, present), GoodsContainer.CARGO_SIZE);
        this.igc().loadCargo(new Goods()._Goods$Game$Location$GoodsType$int(goods.getGame(), colony, type$, n), unit);
      }
    }
  }
}

$J.define(LoadAction, 'net.sf.freecol.client.gui.action.LoadAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_LoadAction' } });
$J.module(() => {
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
});
