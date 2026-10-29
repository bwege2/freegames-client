// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/MapViewerState.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';

let GUI$ViewMode, TerrainCursor, Unit$UnitState;

/**
 * Internal state for the {@link MapViewer}.
 *
 * Methods in this class should only be used by {@link SwingGUI},
 * {@link net.sf.freecol.client.gui.Canvas} or {@link MapViewer}.
 */
export class MapViewerState extends JObject {
  /**
   * The cursor for the selected tile.
   */
  cursor: TerrainCursor = null;
  /**
   * A path for a current goto order.
   */
  gotoPath: PathNode = null;
  /**
   * A path for the active unit.
   */
  unitPath: PathNode = null;
  /**
   * The view mode in use.
   */
  viewMode: GUI$ViewMode = null;
  /**
   * The selected tile, for ViewMode.TERRAIN.
   */
  selectedTile: Tile = null;
  /**
   * The active unit, for ViewMode.MOVE_UNITS.
   */
  activeUnit: Unit = null;
  rangedAttackMode: boolean = false;
  /**
   * The chat message area.
   */
  chatDisplay: ChatDisplay = null;
  unitAnimator: UnitAnimator = null;
  _MapViewerState(chatDisplay: ChatDisplay, unitAnimator: UnitAnimator, al: ActionListener): this {
    this.gotoPath = null;
    this.unitPath = null;
    this.viewMode = GUI$ViewMode.MOVE_UNITS;
    this.rangedAttackMode = false;
    this.cursor = new TerrainCursor()._TerrainCursor();
    this.cursor.addActionListener(al);
    this.chatDisplay = chatDisplay;
    this.unitAnimator = unitAnimator;
    return this;
  }
  setRangedAttackMode(rangedAttackMode: boolean): void {
    this.rangedAttackMode = rangedAttackMode;
  }
  isRangedAttackMode(): boolean {
    return this.rangedAttackMode;
  }
  /**
   * Sets if the cursor should be blinking.
   *
   * @param cursorBlinking The cursor will start blinking if set to {@code true},
   *      and stop if set to {@code false}
   */
  setCursorBlinking(cursorBlinking: boolean): void {
    if (cursorBlinking) {
      this.cursor.startBlinking();
    } else {
      this.cursor.stopBlinking();
    }
  }
  /**
   * Add a chat message.
   *
   * @param message The chat message.
   */
  displayChat(message: GUIMessage): void {
    this.chatDisplay.addMessage(message);
  }
  /**
   * Gets the unit that should be displayed on the given tile.
   *
   * Used mostly by displayMap, but public for SwingGUI.clickAt.
   *
   * @param unitTile The {@code Tile} to check.
   * @return The {@code Unit} to display or null if none found.
   */
  findUnitInFront(unitTile: Tile): Unit {
    let result: Unit;
    if (unitTile == null || unitTile.isEmpty()) {
      result = null;
    } else if (this.activeUnit != null && this.activeUnit.getTile$() === unitTile && !this.unitAnimator.isOutForAnimation(this.activeUnit)) {
      result = this.activeUnit;
    } else if (unitTile.hasSettlement()) {
      result = null;
    } else if (this.activeUnit != null && this.activeUnit.isOffensiveUnit()) {
      result = unitTile.getDefendingUnit(this.activeUnit);
    } else {
      result = null;
      let units = unitTile.getUnitList();
      let bestScore = -1;
      while (!units.isEmpty()) {
        let u = units.removeAt(0);
        if (this.unitAnimator.isOutForAnimation(u)) {
          continue;
        }
        let active = u.getState() === Unit$UnitState.ACTIVE;
        let score = (u.getMovesLeft() + ((active) ? 10000 : 0)) | 0;
        if (bestScore < score) {
          bestScore = score;
          result = u;
        }
      }
    }
    return result;
  }
  /**
   * Change the goto path.
   *
   * @param gotoPath The new goto {@code PathNode}.
   * @return True if the goto path was changed.
   */
  changeGotoPath(gotoPath: PathNode): boolean {
    if (this.gotoPath === gotoPath) {
      return false;
    }
    this.gotoPath = gotoPath;
    this.rangedAttackMode = false;
    return true;
  }
  /**
   * Get the current goto path.
   *
   * @return The goto {@code PathNode}.
   */
  getGotoPath(): PathNode {
    return this.gotoPath;
  }
  /**
   * Set the current active unit path.
   *
   * @param path The new {@code PathNode}.
   */
  setUnitPath(path: PathNode): void {
    this.unitPath = path;
    this.rangedAttackMode = false;
  }
  /**
   * Get the view mode.
   *
   * @return The view mode.
   */
  getViewMode(): GUI$ViewMode {
    return this.viewMode;
  }
  /**
   * Set the view mode.
   *
   * @param vm The new {@code ViewMode}.
   */
  setViewMode(vm: GUI$ViewMode): void {
    this.viewMode = vm;
    this.rangedAttackMode = false;
  }
  /**
   * Gets the active unit.
   *
   * @return The {@code Unit}.
   */
  getActiveUnit(): Unit {
    return this.activeUnit;
  }
  /**
   * Sets the active unit.
   *
   * @param activeUnit The new active {@code Unit}.
   */
  setActiveUnit(activeUnit: Unit): void {
    this.activeUnit = activeUnit;
    this.rangedAttackMode = false;
  }
  /**
   * Gets the selected tile.
   *
   * @return The {@code Tile} selected.
   */
  getSelectedTile(): Tile {
    return this.selectedTile;
  }
  /**
   * Sets the selected tile.
   *
   * @param tile The new selected {@code Tile}.
   */
  setSelectedTile(tile: Tile): void {
    this.selectedTile = tile;
    this.rangedAttackMode = false;
  }
  /**
   * Get the tile with a cursor on it.
   *
   * @return The {@code Tile} found.
   */
  getCursorTile(): Tile {
    let ret = null;
    switch (this.viewMode) {
      case GUI$ViewMode.MOVE_UNITS:
        if (this.activeUnit != null) {
          ret = this.activeUnit.getTile$();
        }
        break;
      case GUI$ViewMode.TERRAIN:
        ret = this.selectedTile;
        break;
      default:
        break;
    }
    return ret;
  }
  getUnitAnimator(): UnitAnimator {
    return this.unitAnimator;
  }
  getChatDisplay(): ChatDisplay {
    return this.chatDisplay;
  }
  getUnitPath(): PathNode {
    return this.unitPath;
  }
  getCursor(): TerrainCursor {
    return this.cursor;
  }
}

$J.define(MapViewerState, 'net.sf.freecol.client.gui.mapviewer.MapViewerState', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.mapviewer.ChatDisplay,net.sf.freecol.client.gui.mapviewer.UnitAnimator,java.awt.event.ActionListener': '_MapViewerState' }, returns: { 'getCursor': 'net.sf.freecol.client.gui.mapviewer.TerrainCursor', 'getUnitPath': 'net.sf.freecol.common.model.PathNode', 'getChatDisplay': 'net.sf.freecol.client.gui.mapviewer.ChatDisplay', 'getUnitAnimator': 'net.sf.freecol.client.gui.mapviewer.UnitAnimator', 'getCursorTile': 'net.sf.freecol.common.model.Tile', 'getSelectedTile': 'net.sf.freecol.common.model.Tile', 'getActiveUnit': 'net.sf.freecol.common.model.Unit', 'getViewMode': 'net.sf.freecol.client.gui.GUI$ViewMode', 'getGotoPath': 'net.sf.freecol.common.model.PathNode', 'isRangedAttackMode': 'boolean' } });
$J.module(() => {
  GUI$ViewMode = $J.load('net.sf.freecol.client.gui.GUI$ViewMode');
  TerrainCursor = $J.load('net.sf.freecol.client.gui.mapviewer.TerrainCursor');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
});
