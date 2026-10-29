// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColSelectedPanelUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let AlphaComposite, Color;

/**
 * Draws with partial transparency.  Used in Europe.
 */
export class FreeColSelectedPanelUI extends BasicPanelUI {
  static sharedInstance: FreeColSelectedPanelUI = null;
  _FreeColSelectedPanelUI(): this {
    this._BasicPanelUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return FreeColSelectedPanelUI.sharedInstance;
  }
  paint(g: Graphics, c: JComponent): void {
    let g2d = g;
    let oldComposite = g2d.getComposite();
    let oldColor = g2d.getColor();
    g2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, Math.fround(0.1)));
    g2d.setColor(Color.BLACK);
    g2d.fillRect(0, 0, c.getWidth(), c.getHeight());
    g2d.setComposite(oldComposite);
    g2d.setColor(oldColor);
  }
  static $clinit() {
    FreeColSelectedPanelUI.sharedInstance = new FreeColSelectedPanelUI()._FreeColSelectedPanelUI();
  }
}

$J.define(FreeColSelectedPanelUI, 'net.sf.freecol.client.gui.plaf.FreeColSelectedPanelUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicPanelUI', ctors: { '': '_FreeColSelectedPanelUI' }, clinit: true, lazy: ['sharedInstance'] });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  Color = $J.load('java.awt.Color');
});
