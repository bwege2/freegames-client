// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColTextFieldUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { BasicTextFieldUI } from '../../../../../../javax/swing/plaf/basic/BasicTextFieldUI.ts';

let AlphaComposite, Color, ImageLibrary, LAFUtilities, ImageUtils;

/**
 * Provides a tiled background image "image.background.FreeColTextField" to
 * text fields.
 */
export class FreeColTextFieldUI extends BasicTextFieldUI {
  c: JComponent = null;
  _FreeColTextFieldUI(c: JComponent): this {
    this._BasicTextFieldUI();
    this.c = c;
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return new FreeColTextFieldUI()._FreeColTextFieldUI(c);
  }
  paintSafely(g: Graphics): void {
    LAFUtilities.setProperties(g, this.c);
    if (!this.c.isOpaque()) {
      let g2d = g;
      let origComposite = g2d.getComposite();
      g.setColor(Color.WHITE);
      g2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, Math.fround(0.38)));
      g.fillRect(0, 0, this.c.getWidth(), this.c.getHeight());
      g2d.setComposite(origComposite);
    }
    super.paintSafely(g);
  }
  paintBackground(g: Graphics): void {
    let c = this.getComponent();
    ImageUtils.drawTiledImage(ImageLibrary.getTextFieldBackground(), g, c, null);
  }
}

$J.define(FreeColTextFieldUI, 'net.sf.freecol.client.gui.plaf.FreeColTextFieldUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicTextFieldUI', ctors: { 'javax.swing.JComponent': '_FreeColTextFieldUI' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  Color = $J.load('java.awt.Color');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  LAFUtilities = $J.load('net.sf.freecol.client.gui.plaf.LAFUtilities');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
