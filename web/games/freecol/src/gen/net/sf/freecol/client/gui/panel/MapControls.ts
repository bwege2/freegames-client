// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/MapControls.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger } from '../../../../../../../jre/index.ts';
import { FreeColClientHolder } from '../../control/FreeColClientHolder.ts';

let GUI$ViewMode, InfoPanel, MiniMap;

/**
 * A collection of panels and buttons that are used to provide the
 * user with a more detailed view of certain elements on the map and
 * also to provide a means of input in case the user can't use the
 * keyboard.
 */
export class MapControls extends FreeColClientHolder {
  static logger: Logger = null;
  static readonly MINI_MAP_WIDTH: number = 220;
  static readonly MINI_MAP_HEIGHT: number = 128;
  static readonly GAP: number = 4;
  /**
   * The info panel, showing current active unit et al.
   */
  infoPanel: InfoPanel = null;
  /**
   * The mini map, showing the whole of map context.
   */
  miniMap: MiniMap = null;
  /**
   * Special purpose buttons for the mini map.
   */
  miniMapToggleBorders: UnitButton = null;
  /**
   * Special purpose buttons for the mini map.
   */
  miniMapToggleFogOfWarButton: UnitButton = null;
  /**
   * Special purpose buttons for the mini map.
   */
  miniMapZoomOutButton: UnitButton = null;
  /**
   * Special purpose buttons for the mini map.
   */
  miniMapZoomInButton: UnitButton = null;
  /**
   * The buttons to control unit actions.
   */
  unitButtons_: List<UnitButton> = null;
  useSkin: boolean = false;
  /**
   * The basic constructor.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param useSkin Use a skin or not in the info panel.
   */
  _MapControls(freeColClient: FreeColClient): this {
    this._FreeColClientHolder(freeColClient);
    this.unitButtons_ = new ArrayList();
    this.useSkin = !this.getFreeColClient().isMapEditor();
    this.infoPanel = new InfoPanel()._InfoPanel$FreeColClient$boolean(freeColClient, this.useSkin);
    this.infoPanel.setFocusable(false);
    this.miniMap = new MiniMap()._MiniMap(freeColClient);
    let am = freeColClient.getActionManager();
    let miniButtons = am.makeMiniMapButtons();
    for (const $it0 = miniButtons.iterator(); $it0.hasNext(); ) {
      let ub = $it0.next();
      ub.setFocusable(false);
    }
    this.miniMapToggleBorders = miniButtons.removeAt(0);
    this.miniMapToggleFogOfWarButton = miniButtons.removeAt(0);
    this.miniMapZoomOutButton = miniButtons.removeAt(0);
    this.miniMapZoomInButton = miniButtons.removeAt(0);
    return this;
  }
  isUseSkin(): boolean {
    return this.useSkin;
  }
  /**
   * Updates the layout with possibly a new skin and/or size.
   */
  updateLayoutIfNeeded(): void {
    this.useSkin = !this.getFreeColClient().isMapEditor();
    this.infoPanel.updateLayoutIfNeeded(this.useSkin);
  }
  /**
   * Initialize the unit buttons.
   *
   * Initialization is deferred until in-game and the action manager is
   * available.
   *
   * @return True if initialization occurs.
   */
  initializeUnitButtons(): boolean {
    if (!this.unitButtons_.isEmpty()) {
      return false;
    }
    let am = this.getFreeColClient().getActionManager();
    this.unitButtons_.addAll(am.makeUnitActionButtons(this.getSpecification()));
    return true;
  }
  canZoomInMapControls(): boolean {
    return this.miniMap.canZoomIn();
  }
  canZoomOutMapControls(): boolean {
    return this.miniMap.canZoomOut();
  }
  repaint(): void {
    for (const $it1 = this.getComponentsPresent().iterator(); $it1.hasNext(); ) {
      let c = $it1.next();
      c.repaint$();
    }
  }
  /**
   * Updates this {@code MapControls}.
   *
   * @param viewMode The gui {@code ViewMode}.
   * @param active The active {@code Unit} if any.
   * @param tile The selected {@code Tile} if any.
   */
  update(viewMode: GUI$ViewMode, active: Unit, tile: Tile): void {
    this.updateLayoutIfNeeded();
    if (active != null) {
      let iub = this.initializeUnitButtons();
      if (iub) {
        MapControls.logger.fine('Unit buttons initialized.');
      }
    }
    for (const $it2 = this.unitButtons_.iterator(); $it2.hasNext(); ) {
      let ub = $it2.next();
      ub.setVisible(active != null);
    }
    switch (viewMode) {
      case GUI$ViewMode.MOVE_UNITS:
        this.infoPanel.update$Unit(active);
        break;
      case GUI$ViewMode.TERRAIN:
        this.infoPanel.update$Tile(tile);
        break;
      case GUI$ViewMode.MAP_TRANSFORM:
        this.infoPanel.update$MapTransform(this.getFreeColClient().getMapEditorController().getMapTransform());
        break;
      case GUI$ViewMode.END_TURN:
        this.infoPanel.update$();
        break;
      default:
        break;
    }
  }
  /**
   * Updates the minimap and repaints it.
   */
  updateMinimap(): void {
    this.miniMap.updateCachedMinimap();
    this.repaint();
  }
  zoomIn(): void {
    this.miniMap.zoomIn();
    this.repaint();
  }
  zoomOut(): void {
    this.miniMap.zoomOut();
    this.repaint();
  }
  clear(): void {
    this.unitButtons_.clear();
  }
  static $clinit() {
    MapControls.logger = Logger.getLogger($J.cls(MapControls).getName());
  }
}

$J.define(MapControls, 'net.sf.freecol.client.gui.panel.MapControls', { kind: 'class', sup: 'net.sf.freecol.client.control.FreeColClientHolder', ctors: { 'net.sf.freecol.client.FreeColClient': '_MapControls' }, returns: { 'getComponentsPresent': 'java.util.List', 'isUseSkin': 'boolean' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  GUI$ViewMode = $J.load('net.sf.freecol.client.gui.GUI$ViewMode');
  InfoPanel = $J.load('net.sf.freecol.client.gui.panel.InfoPanel');
  MiniMap = $J.load('net.sf.freecol.client.gui.panel.MiniMap');
});
