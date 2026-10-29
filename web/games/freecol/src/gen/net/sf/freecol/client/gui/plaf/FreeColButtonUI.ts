// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColButtonUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { MetalButtonUI } from '../../../../../../javax/swing/plaf/metal/MetalButtonUI.ts';

let AlphaComposite, Color, MouseInfo, BorderFactory, SwingUtilities, FontLibrary, ImageLibrary, FreeColButton, FreeColButton$ButtonStyle, FreeColImageBorder, LAFUtilities, ImageUtils;

/**
 * Sets the default opaque attribute to <i>false</i> and
 * uses a 10% black shading on the {@link #paintButtonPressed}.
 */
export class FreeColButtonUI extends MetalButtonUI {
  paintBackground_: boolean = false;
  pcl: PropertyChangeListener = null;
  _FreeColButtonUI(): this {
    this._MetalButtonUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return new FreeColButtonUI()._FreeColButtonUI();
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    this.pcl = (evt) => {
      if ($J.equals(FreeColButton.BUTTON_STYLE_PROPERTY_NAME, evt.getPropertyName())) {
        this.updateStyle(c, evt.getNewValue());
      }
    };
    c.addPropertyChangeListener$PropertyChangeListener(this.pcl);
    this.updateStyle(c, this.getButtonStyle(c));
  }
  getButtonStyle(c: JComponent): FreeColButton$ButtonStyle {
    if (c instanceof FreeColButton) {
      return (c).getButtonStyle();
    } else {
      return c.getClientProperty(FreeColButton.BUTTON_STYLE_PROPERTY_NAME);
    }
  }
  uninstallUI(c: JComponent): void {
    super.uninstallUI(c);
    c.removePropertyChangeListener$PropertyChangeListener(this.pcl);
  }
  updateStyle(c: JComponent, buttonStyle: FreeColButton$ButtonStyle): void {
    let padding = $J.d2i((Math.fround(5 * FontLibrary.getFontScaling())));
    if (buttonStyle === FreeColButton$ButtonStyle.IMPORTANT) {
      c.setBorder(BorderFactory.createCompoundBorder$Border$Border(FreeColImageBorder.buttonBorder, BorderFactory.createEmptyBorder$int$int$int$int(padding, padding, padding, padding)));
      c.setOpaque(true);
      this.paintBackground_ = true;
    } else if (buttonStyle === FreeColButton$ButtonStyle.TRANSPARENT) {
      c.setBorder(BorderFactory.createEmptyBorder$int$int$int$int(5, 5, 5, 5));
      c.setOpaque(false);
      this.paintBackground_ = false;
    } else {
      c.setBorder(BorderFactory.createCompoundBorder$Border$Border(FreeColImageBorder.simpleButtonBorder, BorderFactory.createEmptyBorder$int$int$int$int(padding, padding, padding, padding)));
      c.setOpaque(false);
      this.paintBackground_ = true;
    }
  }
  paint(g: Graphics, c: JComponent): void {
    LAFUtilities.setProperties(g, c);
    if (c.isOpaque() || this.paintBackground_) {
      ImageUtils.drawTiledImage(ImageLibrary.getButtonBackground(), g, c, null);
    }
    super.paint(g, c);
    let a = c;
    if (a.isRolloverEnabled()) {
      let p = MouseInfo.getPointerInfo().getLocation();
      SwingUtilities.convertPointFromScreen(p, c);
      let rollover = c.contains$Point(p);
      if (rollover) {
        this.paintButtonPressed(g, c);
      }
    }
  }
  paintButtonPressed(g: Graphics, c: AbstractButton): void {
    if (c.isContentAreaFilled()) {
      let g2d = g;
      let size = c.getSize$();
      let oldComposite = g2d.getComposite();
      let oldColor = g2d.getColor();
      g2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, Math.fround(0.1)));
      g2d.setColor(Color.BLACK);
      g2d.fillRect(0, 0, size.width_, size.height_);
      g2d.setComposite(oldComposite);
      g2d.setColor(oldColor);
    }
  }
}

$J.define(FreeColButtonUI, 'net.sf.freecol.client.gui.plaf.FreeColButtonUI', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalButtonUI', ctors: { '': '_FreeColButtonUI' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  Color = $J.load('java.awt.Color');
  MouseInfo = $J.load('java.awt.MouseInfo');
  BorderFactory = $J.load('javax.swing.BorderFactory');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  FreeColButton = $J.load('net.sf.freecol.client.gui.panel.FreeColButton');
  FreeColButton$ButtonStyle = $J.load('net.sf.freecol.client.gui.panel.FreeColButton$ButtonStyle');
  FreeColImageBorder = $J.load('net.sf.freecol.client.gui.panel.FreeColImageBorder');
  LAFUtilities = $J.load('net.sf.freecol.client.gui.plaf.LAFUtilities');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
