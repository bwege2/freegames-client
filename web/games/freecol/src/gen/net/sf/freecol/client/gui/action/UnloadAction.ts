// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/UnloadAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

/**
 * An action for unloading a unit.
 */
export class UnloadAction extends MapboardAction {
  static readonly id: string = 'unloadAction';
  unit: Unit = null;
  $init_UnloadAction() {
    this.unit = null;
  }
  /**
   * Creates an action for unloading the currently selected unit.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _UnloadAction$FreeColClient(freeColClient: FreeColClient): this {
    this._UnloadAction$FreeColClient$Unit(freeColClient, null);
    return this;
  }
  /**
   * Creates an action for unloading the {@code Unit}
   * provided.  If the {@code Unit} is {@code null}, then
   * the currently selected unit is used instead.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param unit The {@code Unit} to unload.
   */
  _UnloadAction$FreeColClient$Unit(freeColClient: FreeColClient, unit: Unit): this {
    this._MapboardAction(freeColClient, UnloadAction.id);
    this.$init_UnloadAction();
    this.unit = unit;
    return this;
  }
  getUnit(): Unit {
    return (this.unit != null) ? this.unit : this.getGUI().getActiveUnit();
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    let carrier = this.getUnit();
    let player = this.freeColClient.getMyPlayer();
    return carrier != null && carrier.isCarrier() && carrier.getCargoSpaceTaken() > 0 && player != null && player.owns(carrier) && super.shouldBeEnabled();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let carrier = this.getUnit();
    if (carrier != null) {
      this.igc().unload(carrier);
    }
  }
}

$J.define(UnloadAction, 'net.sf.freecol.client.gui.action.UnloadAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Unit': '_UnloadAction$FreeColClient$Unit', 'net.sf.freecol.client.FreeColClient': '_UnloadAction$FreeColClient' }, returns: { 'getUnit': 'net.sf.freecol.common.model.Unit' } });
