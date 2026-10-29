// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/menu/MapEditorMenuBar.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { FreeColMenuBar } from './FreeColMenuBar.ts';

let KeyEvent, ButtonGroup, ChangeWindowedModeAction, DetermineHighSeasAction, DisplayGridAction, DisplayTileTextAction, DisplayTileTextAction$DisplayText, MapControlsAction, MapEditorToolboxPanelAction, MapEditorTransformPanelAction, NewAction, NewEmptyMapAction, OpenAction, PreferencesAction, QuitAction, SaveAction, ScaleMapAction, ShowMainAction, StartMapAction, ZoomInAction, ZoomOutAction, DebugMenu, Utility, FreeColDebugger, FreeColDebugger$DebugMode;

/**
 * The menu bar used when running in editor mode.
 *
 * <br><br>
 *
 * The menu bar that is displayed on the top left corner of the
 * {@code Canvas}.
 *
 * @see InGameMenuBar
 */
export class MapEditorMenuBar extends FreeColMenuBar {
  static logger: Logger = null;
  /**
   * Creates a new {@code MapEditorMenuBar}. This menu bar will include
   * all of the submenus and items.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param listener An optional mouse motion listener.
   */
  _MapEditorMenuBar(freeColClient: FreeColClient, listener: MouseMotionListener): this {
    this._FreeColMenuBar(freeColClient, listener);
    this.reset();
    return this;
  }
  /**
   * Resets this menu bar.
   */
  reset(): void {
    this.removeAll();
    this.buildGameMenu();
    this.buildViewMenu();
    this.buildToolsMenu();
    this.buildColopediaMenu();
    if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) {
      this.add$JMenu(new DebugMenu()._DebugMenu(this.freeColClient));
    }
    this.update$();
  }
  buildGameMenu(): void {
    let menu = Utility.localizedMenu$String('menuBar.game');
    menu.setOpaque(false);
    menu.setMnemonic$int(KeyEvent.VK_G);
    menu.add$JMenuItem(this.getMenuItem$String(NewAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(NewEmptyMapAction.id));
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(OpenAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(SaveAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(StartMapAction.id));
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(PreferencesAction.id));
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(ShowMainAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(QuitAction.id));
    this.add$JMenu(menu);
  }
  buildViewMenu(): void {
    let menu = Utility.localizedMenu$String('menuBar.view');
    menu.setOpaque(false);
    menu.setMnemonic$int(KeyEvent.VK_V);
    menu.add$JMenuItem(this.getCheckBoxMenuItem(MapControlsAction.id));
    menu.add$JMenuItem(this.getCheckBoxMenuItem(MapEditorToolboxPanelAction.id));
    menu.add$JMenuItem(this.getCheckBoxMenuItem(MapEditorTransformPanelAction.id));
    menu.add$JMenuItem(this.getCheckBoxMenuItem(DisplayGridAction.id));
    menu.add$JMenuItem(this.getCheckBoxMenuItem(ChangeWindowedModeAction.id));
    menu.addSeparator();
    let tileTextGroup = new ButtonGroup()._ButtonGroup();
    for (let type$ of DisplayTileTextAction$DisplayText.values()) {
      menu.add$JMenuItem(this.getRadioButtonMenuItem(DisplayTileTextAction.id + type$.getKey(), tileTextGroup));
    }
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(ZoomInAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ZoomOutAction.id));
    this.add$JMenu(menu);
  }
  buildToolsMenu(): void {
    let menu = Utility.localizedMenu$String('menuBar.tools');
    menu.setOpaque(false);
    menu.setMnemonic$int(KeyEvent.VK_T);
    menu.add$JMenuItem(this.getMenuItem$String(ScaleMapAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(DetermineHighSeasAction.id));
    this.add$JMenu(menu);
  }
  static $clinit() {
    MapEditorMenuBar.logger = Logger.getLogger($J.cls(MapEditorMenuBar).getName());
  }
}

$J.define(MapEditorMenuBar, 'net.sf.freecol.client.gui.menu.MapEditorMenuBar', { kind: 'class', sup: 'net.sf.freecol.client.gui.menu.FreeColMenuBar', ctors: { 'net.sf.freecol.client.FreeColClient,java.awt.event.MouseMotionListener': '_MapEditorMenuBar' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  ButtonGroup = $J.load('javax.swing.ButtonGroup');
  ChangeWindowedModeAction = $J.load('net.sf.freecol.client.gui.action.ChangeWindowedModeAction');
  DetermineHighSeasAction = $J.load('net.sf.freecol.client.gui.action.DetermineHighSeasAction');
  DisplayGridAction = $J.load('net.sf.freecol.client.gui.action.DisplayGridAction');
  DisplayTileTextAction = $J.load('net.sf.freecol.client.gui.action.DisplayTileTextAction');
  DisplayTileTextAction$DisplayText = $J.load('net.sf.freecol.client.gui.action.DisplayTileTextAction$DisplayText');
  MapControlsAction = $J.load('net.sf.freecol.client.gui.action.MapControlsAction');
  MapEditorToolboxPanelAction = $J.load('net.sf.freecol.client.gui.action.MapEditorToolboxPanelAction');
  MapEditorTransformPanelAction = $J.load('net.sf.freecol.client.gui.action.MapEditorTransformPanelAction');
  NewAction = $J.load('net.sf.freecol.client.gui.action.NewAction');
  NewEmptyMapAction = $J.load('net.sf.freecol.client.gui.action.NewEmptyMapAction');
  OpenAction = $J.load('net.sf.freecol.client.gui.action.OpenAction');
  PreferencesAction = $J.load('net.sf.freecol.client.gui.action.PreferencesAction');
  QuitAction = $J.load('net.sf.freecol.client.gui.action.QuitAction');
  SaveAction = $J.load('net.sf.freecol.client.gui.action.SaveAction');
  ScaleMapAction = $J.load('net.sf.freecol.client.gui.action.ScaleMapAction');
  ShowMainAction = $J.load('net.sf.freecol.client.gui.action.ShowMainAction');
  StartMapAction = $J.load('net.sf.freecol.client.gui.action.StartMapAction');
  ZoomInAction = $J.load('net.sf.freecol.client.gui.action.ZoomInAction');
  ZoomOutAction = $J.load('net.sf.freecol.client.gui.action.ZoomOutAction');
  DebugMenu = $J.load('net.sf.freecol.client.gui.menu.DebugMenu');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
});
