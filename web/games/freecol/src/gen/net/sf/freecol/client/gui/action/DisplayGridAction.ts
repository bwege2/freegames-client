// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/DisplayGridAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { SelectableOptionAction } from './SelectableOptionAction.ts';

let ClientOptions;

/**
 * An action to toggle the display of the map grid.
 */
export class DisplayGridAction extends SelectableOptionAction {
  static readonly id: string = 'displayGridAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _DisplayGridAction(freeColClient: FreeColClient): this {
    this._SelectableOptionAction(freeColClient, DisplayGridAction.id, ClientOptions.DISPLAY_GRID);
    this.setSelected(this.shouldBeSelected());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.setSelected((ae.getSource()).isSelected());
    this.setOption(this.isSelected());
    this.getGUI().refresh();
  }
}

$J.define(DisplayGridAction, 'net.sf.freecol.client.gui.action.DisplayGridAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.SelectableOptionAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_DisplayGridAction' } });
$J.module(() => {
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
});
