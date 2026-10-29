// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColRadioButtonUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';
import { BasicRadioButtonUI } from '../../../../../../javax/swing/plaf/basic/BasicRadioButtonUI.ts';

let AlphaComposite, Dimension, MetalLookAndFeel, FontLibrary, LAFUtilities, ResourceManager;

/**
 * Sets the default opaque attribute to <i>false</i>.
 */
export class FreeColRadioButtonUI extends BasicRadioButtonUI {
  _FreeColRadioButtonUI(): this {
    this._BasicRadioButtonUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return new FreeColRadioButtonUI()._FreeColRadioButtonUI();
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    c.setOpaque(false);
  }
  paint(g: Graphics, c: JComponent): void {
    LAFUtilities.setProperties(g, c);
    super.paint(g, c);
  }
  static createRadioButtonIcon(): Icon {
    return new FreeColRadioButtonUI$RadioButtonIcon()._FreeColRadioButtonUI$RadioButtonIcon();
  }
}

export class FreeColRadioButtonUI$RadioButtonIcon extends JObject {
  _FreeColRadioButtonUI$RadioButtonIcon(): this {
    return this;
  }
  getWidgetSize(): number {
    return $J.idiv(Math.imul(FontLibrary.getMainFont().getSize(), 3), 2);
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let g2d = g;
    let model = (c).getModel();
    let widgetSize = this.getWidgetSize();
    if (!model.isEnabled()) {
      g.setColor(MetalLookAndFeel.getControlDisabled());
      g.fillRect(x, y, (widgetSize - 1) | 0, (widgetSize - 1) | 0);
    } else if (model.isPressed() && model.isArmed()) {
      g.setColor(MetalLookAndFeel.getControlShadow());
      g.fillRect(x, y, (widgetSize - 1) | 0, (widgetSize - 1) | 0);
    }
    if (c.hasFocus()) {
      g.setColor(MetalLookAndFeel.getControlHighlight());
      g.drawRect(x, y, (widgetSize - 1) | 0, (widgetSize - 1) | 0);
    }
    if (model.isSelected()) {
      let radioButtonImage = ResourceManager.getImage$String$Dimension$boolean('image.ui.button.radio.selected', new Dimension()._Dimension$int$int(this.getIconWidth(), this.getIconHeight()), false);
      let origComposite = g2d.getComposite();
      if (!model.isEnabled()) {
        g2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, 0.5));
      }
      if (radioButtonImage != null) {
        g2d.drawImage$Image$int$int$ImageObserver(radioButtonImage, x, y, null);
      }
      g2d.setComposite(origComposite);
    } else {
      let radioButtonImage = ResourceManager.getImage$String$Dimension$boolean('image.ui.button.radio', new Dimension()._Dimension$int$int(this.getIconWidth(), this.getIconHeight()), false);
      if (radioButtonImage != null) {
        g2d.drawImage$Image$int$int$ImageObserver(radioButtonImage, x, y, null);
      }
    }
  }
  getIconWidth(): number {
    return this.getWidgetSize();
  }
  getIconHeight(): number {
    return this.getWidgetSize();
  }
}

$J.define(FreeColRadioButtonUI, 'net.sf.freecol.client.gui.plaf.FreeColRadioButtonUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicRadioButtonUI', ctors: { '': '_FreeColRadioButtonUI' } });
$J.define(FreeColRadioButtonUI$RadioButtonIcon, 'net.sf.freecol.client.gui.plaf.FreeColRadioButtonUI$RadioButtonIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_FreeColRadioButtonUI$RadioButtonIcon' }, returns: { 'getIconHeight': 'int', 'getIconWidth': 'int', 'getWidgetSize': 'int' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  Dimension = $J.load('java.awt.Dimension');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  LAFUtilities = $J.load('net.sf.freecol.client.gui.plaf.LAFUtilities');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
});
