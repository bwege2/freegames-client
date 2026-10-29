// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalUtils.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2014, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
import { $J, Integer, JObject, JString, NumberFormatException, Toolkit } from '../../../../../jre/index.ts';
import { CachedPainter } from '../../../../sun/swing/CachedPainter.ts';
import { RGBImageFilter } from '../../../../java/awt/image/RGBImageFilter.ts';

let GradientPaint, Graphics2D, FilteredImageSource, JToolBar, UIManager, MetalLookAndFeel, ImageIconUIResource;

/**
 * This is a dumping ground for random stuff we want to use in several places.
 *
 * @author Steve Wilson
 */
export class MetalUtils extends JObject {
  /**
   * This draws the "Flush 3D Border" which is used throughout the Metal L&F
   */
  static drawFlush3DBorder$Graphics$int$int$int$int(g: Graphics, x: number, y: number, w: number, h: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getControlDarkShadow());
    g.drawRect(0, 0, (w - 2) | 0, (h - 2) | 0);
    g.setColor(MetalLookAndFeel.getControlHighlight());
    g.drawRect(1, 1, (w - 2) | 0, (h - 2) | 0);
    g.setColor(MetalLookAndFeel.getControl());
    g.drawLine(0, (h - 1) | 0, 1, (h - 2) | 0);
    g.drawLine((w - 1) | 0, 0, (w - 2) | 0, 1);
    g.translate$int$int(-x, -y);
  }
  static drawDisabledBorder(g: Graphics, x: number, y: number, w: number, h: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getControlShadow());
    g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
    g.translate$int$int(-x, -y);
  }
  /**
   * This draws a variant "Flush 3D Border"
   * It is used for things like pressed buttons.
   */
  static drawPressed3DBorder$Graphics$int$int$int$int(g: Graphics, x: number, y: number, w: number, h: number): void {
    g.translate$int$int(x, y);
    MetalUtils.drawFlush3DBorder$Graphics$int$int$int$int(g, 0, 0, w, h);
    g.setColor(MetalLookAndFeel.getControlShadow());
    g.drawLine(1, 1, 1, (h - 2) | 0);
    g.drawLine(1, 1, (w - 2) | 0, 1);
    g.translate$int$int(-x, -y);
  }
  /**
   * This draws a variant "Flush 3D Border"
   * It is used for things like active toggle buttons.
   * This is used rarely.
   */
  static drawDark3DBorder$Graphics$int$int$int$int(g: Graphics, x: number, y: number, w: number, h: number): void {
    g.translate$int$int(x, y);
    MetalUtils.drawFlush3DBorder$Graphics$int$int$int$int(g, 0, 0, w, h);
    g.setColor(MetalLookAndFeel.getControl());
    g.drawLine(1, 1, 1, (h - 2) | 0);
    g.drawLine(1, 1, (w - 2) | 0, 1);
    g.setColor(MetalLookAndFeel.getControlShadow());
    g.drawLine(1, (h - 2) | 0, 1, (h - 2) | 0);
    g.drawLine((w - 2) | 0, 1, (w - 2) | 0, 1);
    g.translate$int$int(-x, -y);
  }
  static drawButtonBorder(g: Graphics, x: number, y: number, w: number, h: number, active: boolean): void {
    if (active) {
      MetalUtils.drawActiveButtonBorder(g, x, y, w, h);
    } else {
      MetalUtils.drawFlush3DBorder$Graphics$int$int$int$int(g, x, y, w, h);
    }
  }
  static drawActiveButtonBorder(g: Graphics, x: number, y: number, w: number, h: number): void {
    MetalUtils.drawFlush3DBorder$Graphics$int$int$int$int(g, x, y, w, h);
    g.setColor(MetalLookAndFeel.getPrimaryControl());
    g.drawLine((x + 1) | 0, (y + 1) | 0, (x + 1) | 0, (h - 3) | 0);
    g.drawLine((x + 1) | 0, (y + 1) | 0, (w - 3) | 0, (x + 1) | 0);
    g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
    g.drawLine((x + 2) | 0, (h - 2) | 0, (w - 2) | 0, (h - 2) | 0);
    g.drawLine((w - 2) | 0, (y + 2) | 0, (w - 2) | 0, (h - 2) | 0);
  }
  static drawDefaultButtonBorder(g: Graphics, x: number, y: number, w: number, h: number, active: boolean): void {
    MetalUtils.drawButtonBorder(g, (x + 1) | 0, (y + 1) | 0, (w - 1) | 0, (h - 1) | 0, active);
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getControlDarkShadow());
    g.drawRect(0, 0, (w - 3) | 0, (h - 3) | 0);
    g.drawLine((w - 2) | 0, 0, (w - 2) | 0, 0);
    g.drawLine(0, (h - 2) | 0, 0, (h - 2) | 0);
    g.translate$int$int(-x, -y);
  }
  static drawDefaultButtonPressedBorder(g: Graphics, x: number, y: number, w: number, h: number): void {
    MetalUtils.drawPressed3DBorder$Graphics$int$int$int$int(g, (x + 1) | 0, (y + 1) | 0, (w - 1) | 0, (h - 1) | 0);
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getControlDarkShadow());
    g.drawRect(0, 0, (w - 3) | 0, (h - 3) | 0);
    g.drawLine((w - 2) | 0, 0, (w - 2) | 0, 0);
    g.drawLine(0, (h - 2) | 0, 0, (h - 2) | 0);
    g.setColor(MetalLookAndFeel.getControl());
    g.drawLine((w - 1) | 0, 0, (w - 1) | 0, 0);
    g.drawLine(0, (h - 1) | 0, 0, (h - 1) | 0);
    g.translate$int$int(-x, -y);
  }
  static isLeftToRight(c: Component): boolean {
    return c.getComponentOrientation().isLeftToRight();
  }
  static getInt(key: any, defaultValue: number): number {
    let value = UIManager.get$Object(key);
    if ($J.isa(value, Integer)) {
      return (+(value));
    }
    if ($J.isa(value, JString)) {
      try {
        return $J.parseInt(value);
      } catch ($e0) {
        if ($J.isa($e0, NumberFormatException)) {
          let nfe = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    return defaultValue;
  }
  /**
   * Draws a radial type gradient. The gradient will be drawn vertically if
   * <code>vertical</code> is true, otherwise horizontally.
   * The UIManager key consists of five values:
   * r1 r2 c1 c2 c3. The gradient is broken down into four chunks drawn
   * in order from the origin.
   * <ol>
   * <li>Gradient r1 % of the size from c1 to c2
   * <li>Rectangle r2 % of the size in c2.
   * <li>Gradient r1 % of the size from c2 to c1
   * <li>The remaining size will be filled with a gradient from c1 to c3.
   * </ol>
   *
   * @param c Component rendering to
   * @param g Graphics to draw to.
   * @param key UIManager key used to look up gradient values.
   * @param x X coordinate to draw from
   * @param y Y coordinate to draw from
   * @param w Width to draw to
   * @param h Height to draw to
   * @param vertical Direction of the gradient
   * @return true if <code>key</code> exists, otherwise false.
   */
  static drawGradient(c: Component, g: Graphics, key: string, x: number, y: number, w: number, h: number, vertical: boolean): boolean {
    let gradient = UIManager.get$Object(key);
    if (gradient == null || !(g instanceof Graphics2D)) {
      return false;
    }
    if (w <= 0 || h <= 0) {
      return true;
    }
    MetalUtils$GradientPainter.INSTANCE.paint$Component$Graphics2D$List$int$int$int$int$boolean(c, g, gradient, x, y, w, h, vertical);
    return true;
  }
  /**
   * Returns true if the specified widget is in a toolbar.
   */
  static isToolBarButton(c: JComponent): boolean {
    return (c.getParent() instanceof JToolBar);
  }
  static getOceanDisabledButtonIcon(image: Image): Icon {
    let range = UIManager.get$Object('Button.disabledGrayRange');
    let min = 180;
    let max = 215;
    if (range != null) {
      min = (+(range[0]));
      max = (+(range[1]));
    }
    let prod = new FilteredImageSource()._FilteredImageSource(image.getSource(), new MetalUtils$OceanDisabledButtonImageFilter()._MetalUtils$OceanDisabledButtonImageFilter(min, max));
    return new ImageIconUIResource()._ImageIconUIResource$Image(Toolkit.getDefaultToolkit().createImage(prod));
  }
}

export class MetalUtils$GradientPainter extends CachedPainter {
  /**
   * Instance used for painting.  This is the only instance that is
   * ever created.
   */
  static INSTANCE: MetalUtils$GradientPainter = null;
  static readonly IMAGE_SIZE: number = 64;
  /**
   * This is the actual width we're painting in, or last painted to.
   */
  w: number = 0;
  /**
   * This is the actual height we're painting in, or last painted to
   */
  h: number = 0;
  _MetalUtils$GradientPainter(count: number): this {
    this._CachedPainter(count);
    return this;
  }
  paint$Component$Graphics2D$List$int$int$int$int$boolean(c: Component, g: Graphics2D, gradient: List<any>, x: number, y: number, w: number, h: number, isVertical: boolean): void {
    let imageWidth: number;
    let imageHeight: number;
    if (isVertical) {
      imageWidth = MetalUtils$GradientPainter.IMAGE_SIZE;
      imageHeight = h;
    } else {
      imageWidth = w;
      imageHeight = MetalUtils$GradientPainter.IMAGE_SIZE;
    }
    {
      this.w = w;
      this.h = h;
      this.paint$Component$Graphics$int$int$int$int$ObjectArr(c, g, x, y, imageWidth, imageHeight, [gradient, isVertical]);
    }
  }
  paintToImage(c: Component, image: Image, g: Graphics, w: number, h: number, args: any[]): void {
    let g2 = g;
    let gradient = args[0];
    let isVertical = (args[1]);
    if (isVertical) {
      this.drawVerticalGradient(g2, Math.fround(+(gradient.get(0))), Math.fround(+(gradient.get(1))), gradient.get(2), gradient.get(3), gradient.get(4), w, h);
    } else {
      this.drawHorizontalGradient(g2, Math.fround(+(gradient.get(0))), Math.fround(+(gradient.get(1))), gradient.get(2), gradient.get(3), gradient.get(4), w, h);
    }
  }
  paintImage(c: Component, g: Graphics, x: number, y: number, imageW: number, imageH: number, image: Image, args: any[]): void {
    let isVertical = (args[1]);
    g.translate$int$int(x, y);
    if (isVertical) {
      for (let counter = 0; counter < this.w; counter = (counter + MetalUtils$GradientPainter.IMAGE_SIZE) | 0) {
        let tileSize = Math.min(MetalUtils$GradientPainter.IMAGE_SIZE, (this.w - counter) | 0);
        g.drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver(image, counter, 0, (counter + tileSize) | 0, this.h, 0, 0, tileSize, this.h, null);
      }
    } else {
      for (let counter = 0; counter < this.h; counter = (counter + MetalUtils$GradientPainter.IMAGE_SIZE) | 0) {
        let tileSize = Math.min(MetalUtils$GradientPainter.IMAGE_SIZE, (this.h - counter) | 0);
        g.drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver(image, 0, counter, this.w, (counter + tileSize) | 0, 0, 0, this.w, tileSize, null);
      }
    }
    g.translate$int$int(-x, -y);
  }
  drawVerticalGradient(g: Graphics2D, ratio1: number, ratio2: number, c1: Color, c2: Color, c3: Color, w: number, h: number): void {
    let mid = $J.d2i((Math.fround(ratio1 * h)));
    let mid2 = $J.d2i((Math.fround(ratio2 * h)));
    if (mid > 0) {
      g.setPaint(this.getGradient(Math.fround(0), Math.fround(0), c1, Math.fround(0), Math.fround(mid), c2));
      g.fillRect(0, 0, w, mid);
    }
    if (mid2 > 0) {
      g.setColor(c2);
      g.fillRect(0, mid, w, mid2);
    }
    if (mid > 0) {
      g.setPaint(this.getGradient(Math.fround(0), Math.fround(Math.fround(mid) + mid2), c2, Math.fround(0), Math.fround(Math.fround(Math.fround(mid) * 2) + mid2), c1));
      g.fillRect(0, (mid + mid2) | 0, w, mid);
    }
    if (((h - Math.imul(mid, 2) - mid2) | 0) > 0) {
      g.setPaint(this.getGradient(Math.fround(0), Math.fround(Math.fround(Math.fround(mid) * 2) + mid2), c1, Math.fround(0), Math.fround(h), c3));
      g.fillRect(0, (Math.imul(mid, 2) + mid2) | 0, w, (h - Math.imul(mid, 2) - mid2) | 0);
    }
  }
  drawHorizontalGradient(g: Graphics2D, ratio1: number, ratio2: number, c1: Color, c2: Color, c3: Color, w: number, h: number): void {
    let mid = $J.d2i((Math.fround(ratio1 * w)));
    let mid2 = $J.d2i((Math.fround(ratio2 * w)));
    if (mid > 0) {
      g.setPaint(this.getGradient(Math.fround(0), Math.fround(0), c1, Math.fround(mid), Math.fround(0), c2));
      g.fillRect(0, 0, mid, h);
    }
    if (mid2 > 0) {
      g.setColor(c2);
      g.fillRect(mid, 0, mid2, h);
    }
    if (mid > 0) {
      g.setPaint(this.getGradient(Math.fround(Math.fround(mid) + mid2), Math.fround(0), c2, Math.fround(Math.fround(Math.fround(mid) * 2) + mid2), Math.fround(0), c1));
      g.fillRect((mid + mid2) | 0, 0, mid, h);
    }
    if (((w - Math.imul(mid, 2) - mid2) | 0) > 0) {
      g.setPaint(this.getGradient(Math.fround(Math.fround(Math.fround(mid) * 2) + mid2), Math.fround(0), c1, Math.fround(w), Math.fround(0), c3));
      g.fillRect((Math.imul(mid, 2) + mid2) | 0, 0, (w - Math.imul(mid, 2) - mid2) | 0, h);
    }
  }
  getGradient(x1: number, y1: number, c1: Color, x2: number, y2: number, c2: Color): GradientPaint {
    return new GradientPaint()._GradientPaint$float$float$Color$float$float$Color$boolean(x1, y1, c1, x2, y2, c2, true);
  }
  static $clinit() {
    MetalUtils$GradientPainter.INSTANCE = new MetalUtils$GradientPainter()._MetalUtils$GradientPainter(8);
  }
}

/**
 * Used to create a disabled Icon with the ocean look.
 */
export class MetalUtils$OceanDisabledButtonImageFilter extends RGBImageFilter {
  min: number = 0;
  factor: number = 0;
  _MetalUtils$OceanDisabledButtonImageFilter(min: number, max: number): this {
    this._RGBImageFilter();
    this.canFilterIndexColorModel = true;
    this.min = Math.fround(min);
    this.factor = Math.fround(((max - min) | 0) / 255);
    return this;
  }
}

$J.define(MetalUtils, 'javax.swing.plaf.metal.MetalUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MetalUtils' }, meths: { 'drawDark3DBorder(java.awt.Graphics,int,int,int,int)': 'drawDark3DBorder$Graphics$int$int$int$int', 'drawDark3DBorder(java.awt.Graphics,java.awt.Rectangle)': 'drawDark3DBorder$Graphics$Rectangle', 'drawPressed3DBorder(java.awt.Graphics,int,int,int,int)': 'drawPressed3DBorder$Graphics$int$int$int$int', 'drawPressed3DBorder(java.awt.Graphics,java.awt.Rectangle)': 'drawPressed3DBorder$Graphics$Rectangle', 'drawFlush3DBorder(java.awt.Graphics,int,int,int,int)': 'drawFlush3DBorder$Graphics$int$int$int$int', 'drawFlush3DBorder(java.awt.Graphics,java.awt.Rectangle)': 'drawFlush3DBorder$Graphics$Rectangle' } });
$J.define(MetalUtils$GradientPainter, 'javax.swing.plaf.metal.MetalUtils$GradientPainter', { kind: 'class', sup: 'sun.swing.CachedPainter', ctors: { 'int': '_MetalUtils$GradientPainter' }, meths: { 'paint(java.awt.Component,java.awt.Graphics2D,java.util.List,int,int,int,int,boolean)': 'paint$Component$Graphics2D$List$int$int$int$int$boolean' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(MetalUtils$OceanDisabledButtonImageFilter, 'javax.swing.plaf.metal.MetalUtils$OceanDisabledButtonImageFilter', { kind: 'class', sup: 'java.awt.image.RGBImageFilter', ctors: { 'int,int': '_MetalUtils$OceanDisabledButtonImageFilter' } });
$J.module(() => {
  GradientPaint = $J.load('java.awt.GradientPaint');
  Graphics2D = $J.load('java.awt.Graphics2D');
  FilteredImageSource = $J.load('java.awt.image.FilteredImageSource');
  JToolBar = $J.load('javax.swing.JToolBar');
  UIManager = $J.load('javax.swing.UIManager');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  ImageIconUIResource = $J.load('sun.swing.ImageIconUIResource');
});
