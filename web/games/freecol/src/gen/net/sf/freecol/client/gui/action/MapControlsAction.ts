// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/MapControlsAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * An action for displaying the map controls.
 */
export class MapControlsAction extends SelectableOptionAction {
  static readonly id: string = 'mapControlsAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _MapControlsAction(freeColClient: FreeColClient): this {
    this._SelectableOptionAction(freeColClient, MapControlsAction.id, ClientOptions.DISPLAY_MAP_CONTROLS);
    this.setSelected(this.shouldBeSelected());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  update(): void {
    super.update();
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    return super.shouldBeEnabled() && this.getGame() != null && this.getGame().getMap() != null;
  }
  shouldBeSelected(): boolean {
    return this.getOption();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getGUI().enableMapControls(this.isEnabled() && this.isSelected());
    this.setOption(this.isSelected());
  }
}

$J.define(MapControlsAction, 'net.sf.freecol.client.gui.action.MapControlsAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.SelectableOptionAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_MapControlsAction' } });
$J.module(() => {
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
});
