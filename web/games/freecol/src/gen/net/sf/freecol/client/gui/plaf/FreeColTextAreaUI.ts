// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColTextAreaUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { BasicTextAreaUI } from '../../../../../../javax/swing/plaf/basic/BasicTextAreaUI.ts';

let ImageLibrary, LAFUtilities, ImageUtils;

/**
 * Provides a tiled background image "image.background.FreeColTextArea" to
 * text areas.
 */
export class FreeColTextAreaUI extends BasicTextAreaUI {
  c: JComponent = null;
  _FreeColTextAreaUI(c: JComponent): this {
    this._BasicTextAreaUI();
    this.c = c;
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return new FreeColTextAreaUI()._FreeColTextAreaUI(c);
  }
  paintSafely(g: Graphics): void {
    LAFUtilities.setProperties(g, this.c);
    super.paintSafely(g);
  }
  paintBackground(g: Graphics): void {
    let c = this.getComponent();
    if (c.isOpaque()) {
      ImageUtils.drawTiledImage(ImageLibrary.getTextAreaBackground(), g, c, null);
    }
  }
}

$J.define(FreeColTextAreaUI, 'net.sf.freecol.client.gui.plaf.FreeColTextAreaUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicTextAreaUI', ctors: { 'javax.swing.JComponent': '_FreeColTextAreaUI' } });
$J.module(() => {
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  LAFUtilities = $J.load('net.sf.freecol.client.gui.plaf.LAFUtilities');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
