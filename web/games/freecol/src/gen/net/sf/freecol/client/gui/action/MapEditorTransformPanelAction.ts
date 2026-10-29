// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/MapEditorTransformPanelAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { SelectableAction } from './SelectableAction.ts';

/**
 * An action for displaying the map editor tile transform panel.
 */
export class MapEditorTransformPanelAction extends SelectableAction {
  static readonly id: string = 'mapEditorTransformPanelAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _MapEditorTransformPanelAction(freeColClient: FreeColClient): this {
    this._SelectableAction(freeColClient, MapEditorTransformPanelAction.id);
    this.setSelected(this.isSelected());
    return this;
  }
  shouldBeEnabled(): boolean {
    return this.freeColClient.isMapEditor() && this.getGame() != null && this.getGame().getMap() != null;
  }
  shouldBeSelected(): boolean {
    return this.getGUI().isShowingMapEditorTransformPanel();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getGUI().enableEditorTransformPanel(this.isEnabled() && this.isSelected());
  }
}

$J.define(MapEditorTransformPanelAction, 'net.sf.freecol.client.gui.action.MapEditorTransformPanelAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.SelectableAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_MapEditorTransformPanelAction' } });
