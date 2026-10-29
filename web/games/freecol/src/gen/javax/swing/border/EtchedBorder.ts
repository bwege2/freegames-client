// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/border/EtchedBorder.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../jre/index.ts';
import { AbstractBorder } from './AbstractBorder.ts';

let SwingUtilities3, BasicStroke, Graphics2D;

/**
 * A class which implements a simple etched border which can
 * either be etched-in or etched-out.  If no highlight/shadow
 * colors are initialized when the border is created, then
 * these colors will be dynamically derived from the background
 * color of the component argument passed into the paintBorder()
 * method.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author David Kloba
 * @author Amy Fowler
 */
export class EtchedBorder extends AbstractBorder {
  /**
   * Raised etched type.
   */
  static readonly RAISED: number = 0;
  /**
   * Lowered etched type.
   */
  static readonly LOWERED: number = 1;
  /**
   * The type of etch to be drawn by the border.
   */
  etchType: number = 0;
  /**
   * The color to use for the etched highlight.
   */
  highlight: Color = null;
  /**
   * The color to use for the etched shadow.
   */
  shadow: Color = null;
  /**
   * Creates a lowered etched border whose colors will be derived
   * from the background color of the component passed into
   * the paintBorder method.
   */
  _EtchedBorder$(): this {
    this._EtchedBorder$int(EtchedBorder.LOWERED);
    return this;
  }
  /**
   * Creates an etched border with the specified etch-type
   * whose colors will be derived
   * from the background color of the component passed into
   * the paintBorder method.
   *
   * @param etchType the type of etch to be drawn by the border
   */
  _EtchedBorder$int(etchType: number): this {
    this._EtchedBorder$int$Color$Color(etchType, null, null);
    return this;
  }
  /**
   * Creates an etched border with the specified etch-type,
   * highlight and shadow colors.
   *
   * @param etchType the type of etch to be drawn by the border
   * @param highlight the color to use for the etched highlight
   * @param shadow the color to use for the etched shadow
   */
  _EtchedBorder$int$Color$Color(etchType: number, highlight: Color, shadow: Color): this {
    this._AbstractBorder();
    this.etchType = etchType;
    this.highlight = highlight;
    this.shadow = shadow;
    return this;
  }
  paintBorderHighlight(g: Graphics, c: Color, w: number, h: number, stkWidth: number): void {
    g.setColor(c);
    g.drawRect($J.idiv(stkWidth, 2), $J.idiv(stkWidth, 2), (w - (Math.imul(2, stkWidth))) | 0, (h - (Math.imul(2, stkWidth))) | 0);
  }
  paintBorderShadow(g: Graphics, c: Color, w: number, h: number, stkWidth: number): void {
    g.setColor(c);
    g.drawLine(($J.idiv((Math.imul(3, stkWidth)), 2)), (h - ($J.idiv((Math.imul(3, stkWidth)), 2))) | 0, ($J.idiv((Math.imul(3, stkWidth)), 2)), ($J.idiv((Math.imul(3, stkWidth)), 2)));
    g.drawLine(($J.idiv((Math.imul(3, stkWidth)), 2)), ($J.idiv((Math.imul(3, stkWidth)), 2)), (w - ($J.idiv((Math.imul(3, stkWidth)), 2))) | 0, ($J.idiv((Math.imul(3, stkWidth)), 2)));
    g.drawLine(($J.idiv(stkWidth, 2)), (h - (stkWidth - $J.idiv(stkWidth, 2))) | 0, (w - (stkWidth - $J.idiv(stkWidth, 2))) | 0, (h - (stkWidth - $J.idiv(stkWidth, 2))) | 0);
    g.drawLine((w - (stkWidth - $J.idiv(stkWidth, 2))) | 0, (h - (stkWidth - $J.idiv(stkWidth, 2))) | 0, (w - (stkWidth - $J.idiv(stkWidth, 2))) | 0, $J.idiv(stkWidth, 2));
  }
  /**
   * Paints the border for the specified component with the
   * specified position and size.
   *
   * @param c the component for which this border is being painted
   * @param g the paint graphics
   * @param x the x position of the painted border
   * @param y the y position of the painted border
   * @param width the width of the painted border
   * @param height the height of the painted border
   */
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    SwingUtilities3.paintBorder(c, g, x, y, width, height, ($p0, $p1, $p2, $p3, $p4) => this.paintUnscaledBorder($p0, $p1, $p2, $p3, $p4));
  }
  paintUnscaledBorder(c: Component, g: Graphics, w: number, h: number, scaleFactor: number): void {
    let stkWidth = $J.d2i(Math.floor(scaleFactor));
    if (g instanceof Graphics2D) {
      (g).setStroke(new BasicStroke()._BasicStroke$float(Math.fround(stkWidth)));
    }
    this.paintBorderShadow(g, (this.etchType === EtchedBorder.LOWERED) ? this.getHighlightColor$Component(c) : this.getShadowColor$Component(c), w, h, stkWidth);
    this.paintBorderHighlight(g, (this.etchType === EtchedBorder.LOWERED) ? this.getShadowColor$Component(c) : this.getHighlightColor$Component(c), w, h, stkWidth);
  }
  /**
   * Reinitialize the insets parameter with this Border's current Insets.
   *
   * @param c the component for which this border insets value applies
   * @param insets the object to be reinitialized
   * @throws NullPointerException if the specified {@code insets}
   *         is {@code null}
   */
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    insets.set(2, 2, 2, 2);
    return insets;
  }
  /**
   * Returns the highlight color of the etched border
   * when rendered on the specified component.  If no highlight
   * color was specified at instantiation, the highlight color
   * is derived from the specified component's background color.
   *
   * @param c the component for which the highlight may be derived
   * @return the highlight {@code Color} of this {@code EtchedBorder}
   * @since 1.3
   */
  getHighlightColor$Component(c: Component): Color {
    return this.highlight != null ? this.highlight : c.getBackground().brighter();
  }
  /**
   * Returns the shadow color of the etched border
   * when rendered on the specified component.  If no shadow
   * color was specified at instantiation, the shadow color
   * is derived from the specified component's background color.
   *
   * @param c the component for which the shadow may be derived
   * @return the shadow {@code Color} of this {@code EtchedBorder}
   * @since 1.3
   */
  getShadowColor$Component(c: Component): Color {
    return this.shadow != null ? this.shadow : c.getBackground().darker();
  }
}

$J.define(EtchedBorder, 'javax.swing.border.EtchedBorder', { kind: 'class', sup: 'javax.swing.border.AbstractBorder', ctors: { 'int,java.awt.Color,java.awt.Color': '_EtchedBorder$int$Color$Color', 'java.awt.Color,java.awt.Color': '_EtchedBorder$Color$Color', 'int': '_EtchedBorder$int', '': '_EtchedBorder$' }, meths: { 'getShadowColor()': 'getShadowColor$', 'getShadowColor(java.awt.Component)': 'getShadowColor$Component', 'getHighlightColor()': 'getHighlightColor$', 'getHighlightColor(java.awt.Component)': 'getHighlightColor$Component', 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.module(() => {
  SwingUtilities3 = $J.load('com.sun.java.swing.SwingUtilities3');
  BasicStroke = $J.load('java.awt.BasicStroke');
  Graphics2D = $J.load('java.awt.Graphics2D');
});
