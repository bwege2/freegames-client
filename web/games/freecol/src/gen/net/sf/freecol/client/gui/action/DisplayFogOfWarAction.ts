// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/DisplayFogOfWarAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let ClientOptions, GameOptions;

/**
 * An action to toggle the display of national borders.
 */
export class DisplayFogOfWarAction extends SelectableOptionAction {
  static readonly id: string = 'displayFogOfWarAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _DisplayFogOfWarAction(freeColClient: FreeColClient): this {
    this._SelectableOptionAction(freeColClient, DisplayFogOfWarAction.id, ClientOptions.DISPLAY_FOG_OF_WAR);
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
  shouldBeEnabled(): boolean {
    if (!super.shouldBeEnabled()) {
      return false;
    }
    return this.freeColClient.getGame() == null || this.freeColClient.getGame().getGameOptions() == null || this.freeColClient.getGame().getGameOptions().getBoolean(GameOptions.FOG_OF_WAR);
  }
}

$J.define(DisplayFogOfWarAction, 'net.sf.freecol.client.gui.action.DisplayFogOfWarAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.SelectableOptionAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_DisplayFogOfWarAction' } });
$J.module(() => {
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
});
