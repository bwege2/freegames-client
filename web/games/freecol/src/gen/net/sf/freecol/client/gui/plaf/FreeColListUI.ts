// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColListUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { BasicListUI } from '../../../../../../javax/swing/plaf/basic/BasicListUI.ts';

let ImageLibrary, LAFUtilities, ImageUtils;

/**
 * UI-class for lists, such as the drop down list of colonies in the
 * Colony panel.
 */
export class FreeColListUI extends BasicListUI {
  _FreeColListUI(): this {
    this._BasicListUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return new FreeColListUI()._FreeColListUI();
  }
  installUI(c: JComponent): void {
    super.installUI(c);
  }
  paint(g: Graphics, c: JComponent): void {
    ImageUtils.drawTiledImage(ImageLibrary.getListBackground(), g, c, null);
    LAFUtilities.setProperties(g, c);
    super.paint(g, c);
  }
}

$J.define(FreeColListUI, 'net.sf.freecol.client.gui.plaf.FreeColListUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicListUI', ctors: { '': '_FreeColListUI' } });
$J.module(() => {
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  LAFUtilities = $J.load('net.sf.freecol.client.gui.plaf.LAFUtilities');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
