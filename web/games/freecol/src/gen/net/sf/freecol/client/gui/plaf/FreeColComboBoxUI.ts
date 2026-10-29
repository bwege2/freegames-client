// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColComboBoxUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { MetalComboBoxUI } from '../../../../../../javax/swing/plaf/metal/MetalComboBoxUI.ts';

let FreeColComboBoxRenderer;

/**
 * Sets the default opaque attribute to <i>false</i>.
 */
export class FreeColComboBoxUI extends MetalComboBoxUI {
  _FreeColComboBoxUI(): this {
    this._MetalComboBoxUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return new FreeColComboBoxUI()._FreeColComboBoxUI();
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    c.setOpaque(false);
  }
  createRenderer(): ListCellRenderer {
    return new FreeColComboBoxRenderer()._FreeColComboBoxRenderer$();
  }
}

$J.define(FreeColComboBoxUI, 'net.sf.freecol.client.gui.plaf.FreeColComboBoxUI', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalComboBoxUI', ctors: { '': '_FreeColComboBoxUI' } });
$J.module(() => {
  FreeColComboBoxRenderer = $J.load('net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer');
});
