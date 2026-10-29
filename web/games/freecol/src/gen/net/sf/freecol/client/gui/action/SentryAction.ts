// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/SentryAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * An action to set sentry state to the active unit.
 */
export class SentryAction extends UnitAction {
  static readonly id: string = 'sentryAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _SentryAction(freeColClient: FreeColClient): this {
    this._UnitAction(freeColClient, SentryAction.id);
    this.addImageIcons('sentry');
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(actionEvent: ActionEvent): void {
    this.igc().changeState(this.getGUI().getActiveUnit(), Unit$UnitState.SENTRY);
  }
}

$J.define(SentryAction, 'net.sf.freecol.client.gui.action.SentryAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.UnitAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_SentryAction' } });
$J.module(() => {
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
});
