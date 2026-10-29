// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/menu/FreeColMenuBar.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { JMenuBar } from '../../../../../../javax/swing/JMenuBar.ts';

let KeyEvent, JCheckBoxMenuItem, JMenuItem, JRadioButtonMenuItem, ImageLibrary, AboutAction, ColopediaAction, ColopediaAction$PanelType, FreeColImageBorder, Utility, ImageUtils;

/**
 * The menu bar that is displayed on the top left corner of the
 * {@code Canvas}.
 */
export class FreeColMenuBar extends JMenuBar {
  static logger: Logger = null;
  freeColClient: FreeColClient = null;
  listener: MouseMotionListener = null;
  am: ActionManager = null;
  /**
   * Creates a new {@code FreeColMenuBar}. This menu bar will include
   * all of the submenus and items.
   *
   * @param f The main controller.
   */
  _FreeColMenuBar(f: FreeColClient, listener: MouseMotionListener): this {
    this._JMenuBar();
    this.setOpaque(false);
    this.freeColClient = f;
    this.listener = listener;
    this.am = f.getActionManager();
    this.addMouseMotionListener(listener);
    this.setBorder(FreeColImageBorder.menuBarBorder);
    return this;
  }
  add$JMenu(c: JMenu): JMenu {
    c.addMouseMotionListener(this.listener);
    return super.add$JMenu(c);
  }
  /**
   * Creates a default FreeCol JMenuItem.
   *
   * @param actionId The identifier given to the
   *      {@link ActionManager#getFreeColAction(String) action manager}.
   * @return The menu item.
   */
  getMenuItem$String(actionId: string): JMenuItem {
    let rtn = null;
    let action = this.am.getFreeColAction(actionId);
    if (action != null) {
      rtn = new JMenuItem()._JMenuItem$();
      rtn.setAction(action);
      rtn.setOpaque(false);
      if (action.getMnemonic() != null) {
        rtn.addMenuKeyListener(action.getMenuKeyListener());
      }
    } else {
      FreeColMenuBar.logger.finest('Could not create menu item. [' + actionId + '] not found.');
    }
    return rtn;
  }
  /**
   * Creates a default FreeCol JMenuItem.
   *
   * @param actionId The identifier given to the
   *      {@link ActionManager#getFreeColAction(String) action manager}.
   * @param actionListener An {@code ActionListener} that will be
   *      added to the menu item.
   * @return The menu item with the {@code ActionListener} added.
   */
  getMenuItem$String$ActionListener(actionId: string, actionListener: ActionListener): JMenuItem {
    let rtn = this.getMenuItem$String(actionId);
    rtn.addActionListener(actionListener);
    return rtn;
  }
  /**
   * Creates a default FreeCol {@code JCheckBoxMenuItem}.
   *
   * @param actionId The identifier given to the
   *      {@link ActionManager#getFreeColAction(String) action manager}.
   * @return The menu item.
   */
  getCheckBoxMenuItem(actionId: string): JCheckBoxMenuItem {
    let rtn = null;
    let action = this.am.getFreeColAction(actionId);
    if (action != null) {
      rtn = new JCheckBoxMenuItem()._JCheckBoxMenuItem$();
      rtn.setAction(action);
      rtn.setOpaque(false);
    } else {
      FreeColMenuBar.logger.finest('Could not create menu item. [' + actionId + '] not found.');
    }
    return rtn;
  }
  /**
   * Creates a default FreeCol {@code JRadioButtonMenuItem}.
   *
   * @param actionId The identifier given to the
   *      {@link ActionManager#getFreeColAction(String) action manager}.
   * @param group The {@code ButtonGroup} to add this item to
   * @return The menu item.
   */
  getRadioButtonMenuItem(actionId: string, group: ButtonGroup): JRadioButtonMenuItem {
    let rtn = null;
    let action = this.am.getFreeColAction(actionId);
    if (action != null) {
      rtn = new JRadioButtonMenuItem()._JRadioButtonMenuItem$();
      rtn.setAction(action);
      rtn.setOpaque(false);
      rtn.setSelected((this.am.getFreeColAction(actionId)).isSelected());
      group.add(rtn);
    } else {
      FreeColMenuBar.logger.finest('Could not create menu item. [' + actionId + '] not found.');
    }
    return rtn;
  }
  /**
   * Updates this {@code FreeColMenuBar}.
   */
  update$(): void {
    this.revalidate();
    this.repaint$();
  }
  /**
   * When a {@code FreeColMenuBar} is disabled, it does not show the
   * "in game options".
   */
  setEnabled(enabled: boolean): void {
    this.update$();
  }
  buildColopediaMenu(): void {
    let menu = Utility.localizedMenu$String('menuBar.colopedia');
    menu.setOpaque(false);
    menu.setMnemonic$int(KeyEvent.VK_C);
    for (let type$ of ColopediaAction$PanelType.values()) {
      menu.add$JMenuItem(this.getMenuItem$String(ColopediaAction.id + type$.getKey()));
    }
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(AboutAction.id));
    this.add$JMenu(menu);
  }
  /**
   * Paints the background and borders of the menubar.
   */
  paintComponent(g: Graphics): void {
    if (this.isOpaque()) {
      super.paintComponent(g);
    } else {
      ImageUtils.drawTiledImage(ImageLibrary.getMenuBarBackground(), g, this, this.getInsets$());
    }
  }
  static $clinit() {
    FreeColMenuBar.logger = Logger.getLogger($J.cls(FreeColMenuBar).getName());
  }
}

$J.define(FreeColMenuBar, 'net.sf.freecol.client.gui.menu.FreeColMenuBar', { kind: 'class', sup: 'javax.swing.JMenuBar', ctors: { 'net.sf.freecol.client.FreeColClient,java.awt.event.MouseMotionListener': '_FreeColMenuBar' }, meths: { 'update()': 'update$', 'getMenuItem(java.lang.String,java.awt.event.ActionListener)': 'getMenuItem$String$ActionListener', 'getMenuItem(java.lang.String)': 'getMenuItem$String', 'add(javax.swing.JMenu)': 'add$JMenu' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  JCheckBoxMenuItem = $J.load('javax.swing.JCheckBoxMenuItem');
  JMenuItem = $J.load('javax.swing.JMenuItem');
  JRadioButtonMenuItem = $J.load('javax.swing.JRadioButtonMenuItem');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  AboutAction = $J.load('net.sf.freecol.client.gui.action.AboutAction');
  ColopediaAction = $J.load('net.sf.freecol.client.gui.action.ColopediaAction');
  ColopediaAction$PanelType = $J.load('net.sf.freecol.client.gui.action.ColopediaAction$PanelType');
  FreeColImageBorder = $J.load('net.sf.freecol.client.gui.panel.FreeColImageBorder');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
