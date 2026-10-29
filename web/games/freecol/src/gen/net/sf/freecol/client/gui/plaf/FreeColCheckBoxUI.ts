// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColCheckBoxUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { MetalCheckBoxUI } from '../../../../../../javax/swing/plaf/metal/MetalCheckBoxUI.ts';

let AlphaComposite, Dimension, MetalLookAndFeel, FontLibrary, ImageLibrary, FreeColImageBorder, LAFUtilities, ResourceManager, ImageUtils;

/**
 * Sets the default opaque attribute to <i>false</i>.
 */
export class FreeColCheckBoxUI extends MetalCheckBoxUI {
  _FreeColCheckBoxUI(): this {
    this._MetalCheckBoxUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return new FreeColCheckBoxUI()._FreeColCheckBoxUI();
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    c.setOpaque(false);
  }
  paint(g: Graphics, c: JComponent): void {
    LAFUtilities.setProperties(g, c);
    super.paint(g, c);
  }
  static createCheckBoxIcon(): Icon {
    return new FreeColCheckBoxUI$CheckBoxIcon()._FreeColCheckBoxUI$CheckBoxIcon();
  }
}

export class FreeColCheckBoxUI$CheckBoxIcon extends JObject {
  _FreeColCheckBoxUI$CheckBoxIcon(): this {
    return this;
  }
  getWidgetSize(): number {
    return $J.idiv(Math.imul(FontLibrary.getMainFont().getSize(), 3), 2);
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let g2d = g;
    let mainFontSize = FontLibrary.getMainFont().getSize();
    let model = (c).getModel();
    let widgetSize = this.getWidgetSize();
    ImageUtils.fillTexture((g), ImageLibrary.getButtonBackground(), x, y, widgetSize, widgetSize);
    if (!model.isEnabled()) {
      g.setColor(MetalLookAndFeel.getControlDisabled());
      g.fillRect(x, y, (widgetSize - 1) | 0, (widgetSize - 1) | 0);
    } else if (model.isPressed() && model.isArmed()) {
      g.setColor(MetalLookAndFeel.getControlShadow());
      g.fillRect(x, y, (widgetSize - 1) | 0, (widgetSize - 1) | 0);
    }
    if (model.isEnabled()) {
      let border = FreeColImageBorder.simpleButtonBorder;
      border.paintBorder(c, g, x, y, this.getWidgetSize(), this.getWidgetSize());
    }
    if (c.hasFocus()) {
      g.setColor(MetalLookAndFeel.getControlHighlight());
      g.drawRect(x, y, (widgetSize - 1) | 0, (widgetSize - 1) | 0);
    }
    if (model.isSelected()) {
      let checkmarkImage = ResourceManager.getImage$String$Dimension$boolean('image.ui.checkmark', new Dimension()._Dimension$int$int(mainFontSize, mainFontSize), false);
      let origComposite = g2d.getComposite();
      if (!model.isEnabled()) {
        g2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, 0.5));
      }
      g.drawImage$Image$int$int$ImageObserver(checkmarkImage, (x + $J.idiv(((widgetSize - checkmarkImage.getWidth()) | 0), 2)) | 0, (y + $J.idiv(((widgetSize - checkmarkImage.getHeight()) | 0), 2)) | 0, null);
      g2d.setComposite(origComposite);
    }
  }
  getIconWidth(): number {
    return this.getWidgetSize();
  }
  getIconHeight(): number {
    return this.getWidgetSize();
  }
}

$J.define(FreeColCheckBoxUI, 'net.sf.freecol.client.gui.plaf.FreeColCheckBoxUI', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalCheckBoxUI', ctors: { '': '_FreeColCheckBoxUI' } });
$J.define(FreeColCheckBoxUI$CheckBoxIcon, 'net.sf.freecol.client.gui.plaf.FreeColCheckBoxUI$CheckBoxIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_FreeColCheckBoxUI$CheckBoxIcon' }, returns: { 'getIconHeight': 'int', 'getIconWidth': 'int', 'getWidgetSize': 'int' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  Dimension = $J.load('java.awt.Dimension');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  FreeColImageBorder = $J.load('net.sf.freecol.client.gui.panel.FreeColImageBorder');
  LAFUtilities = $J.load('net.sf.freecol.client.gui.plaf.LAFUtilities');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
