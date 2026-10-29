// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColMenuBarUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { BasicMenuBarUI } from '../../../../../../javax/swing/plaf/basic/BasicMenuBarUI.ts';

let ImageLibrary, ImageUtils;

/**
 * Use the "image.background.FreeColMenuBar" resource as a tiled background
 * image on FreeColMenuBar, such as that at the top of the window.
 */
export class FreeColMenuBarUI extends BasicMenuBarUI {
  static sharedInstance: FreeColMenuBarUI = null;
  _FreeColMenuBarUI(): this {
    this._BasicMenuBarUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return FreeColMenuBarUI.sharedInstance;
  }
  paint(g: Graphics, c: JComponent): void {
    if (c.isOpaque()) {
      ImageUtils.drawTiledImage(ImageLibrary.getMenuBarBackground(), g, c, null);
    }
  }
  static $clinit() {
    FreeColMenuBarUI.sharedInstance = new FreeColMenuBarUI()._FreeColMenuBarUI();
  }
}

$J.define(FreeColMenuBarUI, 'net.sf.freecol.client.gui.plaf.FreeColMenuBarUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicMenuBarUI', ctors: { '': '_FreeColMenuBarUI' }, clinit: true, lazy: ['sharedInstance'] });
$J.module(() => {
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
