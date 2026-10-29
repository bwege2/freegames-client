// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColPopupMenuUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { BasicPopupMenuUI } from '../../../../../../javax/swing/plaf/basic/BasicPopupMenuUI.ts';

let ImageLibrary, ImageUtils;

/**
 * Draw the "image.background.FreeColPopupMenu" resource as a tiled
 * background image on popup menus, such as the drop down from the
 * menu bar at the top of the main window or the tile popup.
 * Obviously these contain text so a light colour is recommended.
 */
export class FreeColPopupMenuUI extends BasicPopupMenuUI {
  static sharedInstance: FreeColPopupMenuUI = null;
  _FreeColPopupMenuUI(): this {
    this._BasicPopupMenuUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return FreeColPopupMenuUI.sharedInstance;
  }
  paint(g: Graphics, c: JComponent): void {
    if (c.isOpaque()) {
      ImageUtils.drawTiledImage(ImageLibrary.getPopupMenuBackground(), g, c, null);
    }
  }
  static $clinit() {
    FreeColPopupMenuUI.sharedInstance = new FreeColPopupMenuUI()._FreeColPopupMenuUI();
  }
}

$J.define(FreeColPopupMenuUI, 'net.sf.freecol.client.gui.plaf.FreeColPopupMenuUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicPopupMenuUI', ctors: { '': '_FreeColPopupMenuUI' }, clinit: true, lazy: ['sharedInstance'] });
$J.module(() => {
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
