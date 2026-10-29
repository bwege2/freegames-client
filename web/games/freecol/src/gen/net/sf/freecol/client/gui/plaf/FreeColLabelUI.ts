// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColLabelUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { MetalLabelUI } from '../../../../../../javax/swing/plaf/metal/MetalLabelUI.ts';

let LAFUtilities;

/**
 * Sets the default opaque attribute to <i>false</i>.
 */
export class FreeColLabelUI extends MetalLabelUI {
  _FreeColLabelUI(): this {
    this._MetalLabelUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return new FreeColLabelUI()._FreeColLabelUI();
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    c.setOpaque(false);
  }
  paint(g: Graphics, c: JComponent): void {
    LAFUtilities.setProperties(g, c);
    super.paint(g, c);
  }
}

$J.define(FreeColLabelUI, 'net.sf.freecol.client.gui.plaf.FreeColLabelUI', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalLabelUI', ctors: { '': '_FreeColLabelUI' } });
$J.module(() => {
  LAFUtilities = $J.load('net.sf.freecol.client.gui.plaf.LAFUtilities');
});
