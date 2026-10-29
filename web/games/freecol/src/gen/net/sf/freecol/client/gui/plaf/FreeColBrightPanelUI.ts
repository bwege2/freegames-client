// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColBrightPanelUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { BasicPanelUI } from '../../../../../../javax/swing/plaf/basic/BasicPanelUI.ts';

let ImageLibrary, ImageUtils;

/**
 * Draw the "image.background.FreeColBrightPanel" resource as a tiled
 * background image.  BrightPanel is intended to provide a lighter
 * background than the default panel, and is used for panels that
 * might contain icons and text annotations, for example, many of the
 * subpanels in the ColonyPanel.
 */
export class FreeColBrightPanelUI extends BasicPanelUI {
  static sharedInstance: FreeColBrightPanelUI = null;
  _FreeColBrightPanelUI(): this {
    this._BasicPanelUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return FreeColBrightPanelUI.sharedInstance;
  }
  paint(g: Graphics, c: JComponent): void {
    if (c.isOpaque()) {
      ImageUtils.drawTiledImage(ImageLibrary.getBrightPanelBackground(), g, c, null);
    }
  }
  static $clinit() {
    FreeColBrightPanelUI.sharedInstance = new FreeColBrightPanelUI()._FreeColBrightPanelUI();
  }
}

$J.define(FreeColBrightPanelUI, 'net.sf.freecol.client.gui.plaf.FreeColBrightPanelUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicPanelUI', ctors: { '': '_FreeColBrightPanelUI' }, clinit: true, lazy: ['sharedInstance'] });
$J.module(() => {
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
