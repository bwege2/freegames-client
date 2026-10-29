// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColTransparentPanelUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, RuntimeException } from '../../../../../../../jre/index.ts';
import { BasicPanelUI } from '../../../../../../javax/swing/plaf/basic/BasicPanelUI.ts';

let AlphaComposite, Color;

/**
 * Draws with partial transparency.  Used in Europe.
 */
export class FreeColTransparentPanelUI extends BasicPanelUI {
  static sharedInstance: FreeColTransparentPanelUI = null;
  _FreeColTransparentPanelUI(): this {
    this._BasicPanelUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return FreeColTransparentPanelUI.sharedInstance;
  }
  paint(g: Graphics, c: JComponent): void {
    if (c.isOpaque()) {
      throw new RuntimeException('FreeColTransparentPanelUI can only be used on components which are !isOpaque(): ' + $J.str(c));
    }
    let width = c.getWidth();
    let height = c.getHeight();
    let g2 = g;
    let oldComposite = g2.getComposite();
    g2.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, Math.fround(0.6)));
    g2.setColor(Color.WHITE);
    g2.fillRect(0, 0, width, height);
    g2.setComposite(oldComposite);
  }
  static $clinit() {
    FreeColTransparentPanelUI.sharedInstance = new FreeColTransparentPanelUI()._FreeColTransparentPanelUI();
  }
}

$J.define(FreeColTransparentPanelUI, 'net.sf.freecol.client.gui.plaf.FreeColTransparentPanelUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicPanelUI', ctors: { '': '_FreeColTransparentPanelUI' }, clinit: true, lazy: ['sharedInstance'] });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  Color = $J.load('java.awt.Color');
});
