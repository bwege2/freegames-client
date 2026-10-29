// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/NewEmptyMapAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Random } from '../../../../../../../jre/index.ts';
import { MapboardAction } from './MapboardAction.ts';

let ServerGame;

/**
 * Creates a new empty map.
 */
export class NewEmptyMapAction extends MapboardAction {
  static readonly id: string = 'newEmptyMapAction';
  /**
   * Creates this action
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _NewEmptyMapAction(freeColClient: FreeColClient): this {
    this._MapboardAction(freeColClient, NewEmptyMapAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    return this.freeColClient.isMapEditor();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let size = this.getGUI().showMapSizeDialog();
    if (size == null) {
      return;
    }
    let fcc = this.getFreeColClient();
    let game = new ServerGame()._ServerGame$Specification$Random(fcc.getMapEditorController().getDefaultSpecification(), new Random());
    fcc.getFreeColServer().setGame(game);
    fcc.setGame(game);
    let map = fcc.getFreeColServer().generateEmptyMap(size.width_, size.height_);
    let tile = map.getTile$int$int($J.idiv(size.width_, 2), $J.idiv(size.height_, 2));
    this.getGUI().removeInGameComponents();
    this.getGUI().startMapEditorGUI();
    this.getGUI().refresh();
    this.getGUI().setFocus(tile);
    this.getGUI().refresh();
  }
}

$J.define(NewEmptyMapAction, 'net.sf.freecol.client.gui.action.NewEmptyMapAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_NewEmptyMapAction' } });
$J.module(() => {
  ServerGame = $J.load('net.sf.freecol.server.model.ServerGame');
});
