// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColFileChooserUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { MetalFileChooserUI } from '../../../../../../javax/swing/plaf/metal/MetalFileChooserUI.ts';

let Dimension, FreeColLookAndFeel;

/**
 * UI for the file chooser.
 */
export class FreeColFileChooserUI extends MetalFileChooserUI {
  _FreeColFileChooserUI(filechooser: JFileChooser): this {
    this._MetalFileChooserUI(filechooser);
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return new FreeColFileChooserUI()._FreeColFileChooserUI(c);
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    let d = this.getPreferredSize$JComponent(c);
    let scaleFactor = FreeColLookAndFeel.getScaleFactor();
    c.setPreferredSize(new Dimension()._Dimension$int$int($J.d2i((Math.fround(d.width_ * scaleFactor))), $J.d2i((Math.fround(d.height_ * scaleFactor)))));
  }
  addControlButtons(): void {
    let buttonPanel = this.getButtonPanel();
    let buttons = buttonPanel.getComponents();
    buttonPanel.removeAll();
    for (let i = (buttons.length - 1) | 0; i >= 0; i--) {
      buttonPanel.add$Component(buttons[i]);
    }
    super.addControlButtons();
  }
}

$J.define(FreeColFileChooserUI, 'net.sf.freecol.client.gui.plaf.FreeColFileChooserUI', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalFileChooserUI', ctors: { 'javax.swing.JFileChooser': '_FreeColFileChooserUI' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  FreeColLookAndFeel = $J.load('net.sf.freecol.client.gui.plaf.FreeColLookAndFeel');
});
