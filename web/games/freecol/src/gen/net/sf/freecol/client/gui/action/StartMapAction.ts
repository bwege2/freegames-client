// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/StartMapAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColAction } from './FreeColAction.ts';

let FreeColDirectories, MapGeneratorOptions;

/**
 * An action for starting a new game from the current map editor map.
 */
export class StartMapAction extends FreeColAction {
  static readonly id: string = 'startMapAction';
  /**
   * Creates this action
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _StartMapAction(freeColClient: FreeColClient): this {
    this._FreeColAction(freeColClient, StartMapAction.id);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    if (!this.freeColClient.isMapEditor() || this.freeColClient.getGame() == null || this.freeColClient.getGame().getMap() == null) {
      return;
    }
    let startFile = FreeColDirectories.getStartMapFile();
    this.freeColClient.getMapEditorController().saveMapEditorGame$File(startFile);
    let game = this.freeColClient.getGame();
    let options = game.getMapGeneratorOptions();
    options.setFile(MapGeneratorOptions.IMPORT_FILE, startFile);
    let mapOptionsFile = FreeColDirectories.getOptionsFile(FreeColDirectories.MAP_GENERATOR_OPTIONS_FILE_NAME);
    options.save$File$WriteScope$boolean(mapOptionsFile, null, true);
    this.freeColClient.getGUI().removeInGameComponents();
    this.freeColClient.getGUI().showNewPanel$Specification(game.getSpecification());
  }
}

$J.define(StartMapAction, 'net.sf.freecol.client.gui.action.StartMapAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.FreeColAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_StartMapAction' } });
$J.module(() => {
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  MapGeneratorOptions = $J.load('net.sf.freecol.common.option.MapGeneratorOptions');
});
