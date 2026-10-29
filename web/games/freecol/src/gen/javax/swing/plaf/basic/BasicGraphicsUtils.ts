// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicGraphicsUtils.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, Toolkit } from '../../../../../jre/index.ts';

let Insets, Rectangle, SwingUtilities;

/**
 * Convenient util class.
 *
 * @author Hans Muller
 */
export class BasicGraphicsUtils extends JObject {
  static GROOVE_INSETS: Insets = null;
  static ETCHED_INSETS: Insets = null;
  /**
   * Draws an etched rectangle.
   *
   * @param g an instance of {@code Graphics}
   * @param x an X coordinate
   * @param y an Y coordinate
   * @param w a width
   * @param h a height
   * @param shadow a color of shadow
   * @param darkShadow a color of dark shadow
   * @param highlight a color highlighting
   * @param lightHighlight a color of light highlighting
   */
  static drawEtchedRect(g: Graphics, x: number, y: number, w: number, h: number, shadow: Color, darkShadow: Color, highlight: Color, lightHighlight: Color): void {
    let oldColor = g.getColor();
    g.translate$int$int(x, y);
    g.setColor(shadow);
    g.drawLine(0, 0, (w - 1) | 0, 0);
    g.drawLine(0, 1, 0, (h - 2) | 0);
    g.setColor(darkShadow);
    g.drawLine(1, 1, (w - 3) | 0, 1);
    g.drawLine(1, 2, 1, (h - 3) | 0);
    g.setColor(lightHighlight);
    g.drawLine((w - 1) | 0, 0, (w - 1) | 0, (h - 1) | 0);
    g.drawLine(0, (h - 1) | 0, (w - 1) | 0, (h - 1) | 0);
    g.setColor(highlight);
    g.drawLine((w - 2) | 0, 1, (w - 2) | 0, (h - 3) | 0);
    g.drawLine(1, (h - 2) | 0, (w - 2) | 0, (h - 2) | 0);
    g.translate$int$int(-x, -y);
    g.setColor(oldColor);
  }
  /**
   * Draws a bezel.
   *
   * @param g an instance of {@code Graphics}
   * @param x an X coordinate
   * @param y an Y coordinate
   * @param w a width
   * @param h a height
   * @param isPressed is component pressed
   * @param isDefault is default drawing
   * @param shadow a color of shadow
   * @param darkShadow a color of dark shadow
   * @param highlight a color highlighting
   * @param lightHighlight a color of light highlighting
   */
  static drawBezel(g: Graphics, x: number, y: number, w: number, h: number, isPressed: boolean, isDefault: boolean, shadow: Color, darkShadow: Color, highlight: Color, lightHighlight: Color): void {
    let oldColor = g.getColor();
    g.translate$int$int(x, y);
    if (isPressed && isDefault) {
      g.setColor(darkShadow);
      g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
      g.setColor(shadow);
      g.drawRect(1, 1, (w - 3) | 0, (h - 3) | 0);
    } else if (isPressed) {
      BasicGraphicsUtils.drawLoweredBezel(g, x, y, w, h, shadow, darkShadow, highlight, lightHighlight);
    } else if (isDefault) {
      g.setColor(darkShadow);
      g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
      g.setColor(lightHighlight);
      g.drawLine(1, 1, 1, (h - 3) | 0);
      g.drawLine(2, 1, (w - 3) | 0, 1);
      g.setColor(highlight);
      g.drawLine(2, 2, 2, (h - 4) | 0);
      g.drawLine(3, 2, (w - 4) | 0, 2);
      g.setColor(shadow);
      g.drawLine(2, (h - 3) | 0, (w - 3) | 0, (h - 3) | 0);
      g.drawLine((w - 3) | 0, 2, (w - 3) | 0, (h - 4) | 0);
      g.setColor(darkShadow);
      g.drawLine(1, (h - 2) | 0, (w - 2) | 0, (h - 2) | 0);
      g.drawLine((w - 2) | 0, (h - 2) | 0, (w - 2) | 0, 1);
    } else {
      g.setColor(lightHighlight);
      g.drawLine(0, 0, 0, (h - 1) | 0);
      g.drawLine(1, 0, (w - 2) | 0, 0);
      g.setColor(highlight);
      g.drawLine(1, 1, 1, (h - 3) | 0);
      g.drawLine(2, 1, (w - 3) | 0, 1);
      g.setColor(shadow);
      g.drawLine(1, (h - 2) | 0, (w - 2) | 0, (h - 2) | 0);
      g.drawLine((w - 2) | 0, 1, (w - 2) | 0, (h - 3) | 0);
      g.setColor(darkShadow);
      g.drawLine(0, (h - 1) | 0, (w - 1) | 0, (h - 1) | 0);
      g.drawLine((w - 1) | 0, (h - 1) | 0, (w - 1) | 0, 0);
    }
    g.translate$int$int(-x, -y);
    g.setColor(oldColor);
  }
  /**
   * Draws a lowered bezel.
   *
   * @param g an instance of {@code Graphics}
   * @param x an X coordinate
   * @param y an Y coordinate
   * @param w a width
   * @param h a height
   * @param shadow a color of shadow
   * @param darkShadow a color of dark shadow
   * @param highlight a color highlighting
   * @param lightHighlight a color of light highlighting
   */
  static drawLoweredBezel(g: Graphics, x: number, y: number, w: number, h: number, shadow: Color, darkShadow: Color, highlight: Color, lightHighlight: Color): void {
    g.setColor(darkShadow);
    g.drawLine(0, 0, 0, (h - 1) | 0);
    g.drawLine(1, 0, (w - 2) | 0, 0);
    g.setColor(shadow);
    g.drawLine(1, 1, 1, (h - 2) | 0);
    g.drawLine(1, 1, (w - 3) | 0, 1);
    g.setColor(lightHighlight);
    g.drawLine(0, (h - 1) | 0, (w - 1) | 0, (h - 1) | 0);
    g.drawLine((w - 1) | 0, (h - 1) | 0, (w - 1) | 0, 0);
    g.setColor(highlight);
    g.drawLine(1, (h - 2) | 0, (w - 2) | 0, (h - 2) | 0);
    g.drawLine((w - 2) | 0, (h - 2) | 0, (w - 2) | 0, 1);
  }
  /**
   * Draws dashed rectangle.
   *
   * @param g an instance of {@code Graphics}
   * @param x an X coordinate
   * @param y an Y coordinate
   * @param width a width of rectangle
   * @param height a height of rectangle
   */
  static drawDashedRect(g: Graphics, x: number, y: number, width: number, height: number): void {
    let vx: number;
    let vy: number;
    for (vx = x; vx < ((x + width) | 0); vx = (vx + 2) | 0) {
      g.fillRect(vx, y, 1, 1);
      g.fillRect(vx, (y + height - 1) | 0, 1, 1);
    }
    for (vy = y; vy < ((y + height) | 0); vy = (vy + 2) | 0) {
      g.fillRect(x, vy, 1, 1);
      g.fillRect((x + width - 1) | 0, vy, 1, 1);
    }
  }
  /**
   * Returns the preferred size of the button.
   *
   * @param b an instance of {@code AbstractButton}
   * @param textIconGap a gap between text and icon
   * @return the preferred size of the button
   */
  static getPreferredButtonSize(b: AbstractButton, textIconGap: number): Dimension {
    if (b.getComponentCount() > 0) {
      return null;
    }
    let icon = b.getIcon();
    let text = b.getText();
    let font = b.getFont();
    let fm = b.getFontMetrics(font);
    let iconR = new Rectangle()._Rectangle$();
    let textR = new Rectangle()._Rectangle$();
    let viewR = new Rectangle()._Rectangle$int$int(32767, 32767);
    SwingUtilities.layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int(b, fm, text, icon, b.getVerticalAlignment(), b.getHorizontalAlignment(), b.getVerticalTextPosition(), b.getHorizontalTextPosition(), viewR, iconR, textR, (text == null ? 0 : textIconGap));
    let r = iconR.union(textR);
    let insets = b.getInsets$();
    r.width_ = (r.width_ + (insets.left + insets.right)) | 0;
    r.height_ = (r.height_ + (insets.top + insets.bottom)) | 0;
    return r.getSize();
  }
  static isLeftToRight(c: Component): boolean {
    return c.getComponentOrientation().isLeftToRight();
  }
  static isMenuShortcutKeyDown(event: InputEvent): boolean {
    return (event.getModifiersEx() & Toolkit.getDefaultToolkit().getMenuShortcutKeyMaskEx()) !== 0;
  }
  static $clinit() {
    BasicGraphicsUtils.GROOVE_INSETS = new Insets()._Insets(2, 2, 2, 2);
    BasicGraphicsUtils.ETCHED_INSETS = new Insets()._Insets(2, 2, 2, 2);
  }
}

$J.define(BasicGraphicsUtils, 'javax.swing.plaf.basic.BasicGraphicsUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_BasicGraphicsUtils' }, meths: { 'drawStringUnderlineCharAt(javax.swing.JComponent,java.awt.Graphics2D,java.lang.String,int,float,float)': 'drawStringUnderlineCharAt$JComponent$Graphics2D$String$int$float$float', 'drawString(javax.swing.JComponent,java.awt.Graphics2D,java.lang.String,float,float)': 'drawString$JComponent$Graphics2D$String$float$float', 'drawStringUnderlineCharAt(java.awt.Graphics,java.lang.String,int,int,int)': 'drawStringUnderlineCharAt$Graphics$String$int$int$int', 'drawString(java.awt.Graphics,java.lang.String,int,int,int)': 'drawString$Graphics$String$int$int$int' }, clinit: true, lazy: ['GROOVE_INSETS', 'ETCHED_INSETS'] });
$J.module(() => {
  Insets = $J.load('java.awt.Insets');
  Rectangle = $J.load('java.awt.Rectangle');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
});
