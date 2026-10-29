// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/border/LineBorder.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2025, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Region } from '../../../../jre/index.ts';
import { AbstractBorder } from './AbstractBorder.ts';

let SwingUtilities3, Graphics2D, Path2D, Path2D$Float, Rectangle2D$Float, RoundRectangle2D$Float;

/**
 * A class which implements a line border of arbitrary thickness
 * and of a single color.
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
 */
export class LineBorder extends AbstractBorder {
  static blackLine: Border = null;
  static grayLine: Border = null;
  /**
   * Thickness of the border.
   */
  thickness: number = 0;
  /**
   * Color of the border.
   */
  lineColor: Color = null;
  /**
   * Whether or not the border has rounded corners.
   */
  roundedCorners: boolean = false;
  /**
   * Creates a line border with the specified color and a
   * thickness = 1.
   *
   * @param color the color for the border
   */
  _LineBorder$Color(color: Color): this {
    this._LineBorder$Color$int$boolean(color, 1, false);
    return this;
  }
  /**
   * Creates a line border with the specified color and thickness.
   *
   * @param color the color of the border
   * @param thickness the thickness of the border
   */
  _LineBorder$Color$int(color: Color, thickness: number): this {
    this._LineBorder$Color$int$boolean(color, thickness, false);
    return this;
  }
  /**
   * Creates a line border with the specified color, thickness,
   * and corner shape.
   *
   * @param color the color of the border
   * @param thickness the thickness of the border
   * @param roundedCorners whether or not border corners should be round
   * @since 1.3
   */
  _LineBorder$Color$int$boolean(color: Color, thickness: number, roundedCorners: boolean): this {
    this._AbstractBorder();
    this.lineColor = color;
    this.thickness = thickness;
    this.roundedCorners = roundedCorners;
    return this;
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
    if ((this.thickness > 0) && (g instanceof Graphics2D)) {
      let g2d = g;
      let oldColor = g2d.getColor();
      g2d.setColor(this.lineColor);
      let outer: Shape;
      let inner: Shape;
      let offs = Region.clipRound(this.thickness * scaleFactor);
      let size = (offs + offs) | 0;
      if (this.roundedCorners) {
        let arc = Math.fround(Math.fround(0.2) * offs);
        outer = new RoundRectangle2D$Float()._RoundRectangle2D$Float$float$float$float$float$float$float(0, 0, Math.fround(w), Math.fround(h), Math.fround(offs), Math.fround(offs));
        inner = new RoundRectangle2D$Float()._RoundRectangle2D$Float$float$float$float$float$float$float(Math.fround(offs), Math.fround(offs), Math.fround((w - size) | 0), Math.fround((h - size) | 0), arc, arc);
      } else {
        outer = new Rectangle2D$Float()._Rectangle2D$Float$float$float$float$float(0, 0, Math.fround(w), Math.fround(h));
        inner = new Rectangle2D$Float()._Rectangle2D$Float$float$float$float$float(Math.fround(offs), Math.fround(offs), Math.fround((w - size) | 0), Math.fround((h - size) | 0));
      }
      let path = new Path2D$Float()._Path2D$Float$int(Path2D.WIND_EVEN_ODD);
      path.append$Shape$boolean(outer, false);
      path.append$Shape$boolean(inner, false);
      g2d.fill(path);
      g2d.setColor(oldColor);
    }
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
    insets.set(this.thickness, this.thickness, this.thickness, this.thickness);
    return insets;
  }
}

$J.define(LineBorder, 'javax.swing.border.LineBorder', { kind: 'class', sup: 'javax.swing.border.AbstractBorder', ctors: { 'java.awt.Color,int,boolean': '_LineBorder$Color$int$boolean', 'java.awt.Color,int': '_LineBorder$Color$int', 'java.awt.Color': '_LineBorder$Color' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.module(() => {
  SwingUtilities3 = $J.load('com.sun.java.swing.SwingUtilities3');
  Graphics2D = $J.load('java.awt.Graphics2D');
  Path2D = $J.load('java.awt.geom.Path2D');
  Path2D$Float = $J.load('java.awt.geom.Path2D$Float');
  Rectangle2D$Float = $J.load('java.awt.geom.Rectangle2D$Float');
  RoundRectangle2D$Float = $J.load('java.awt.geom.RoundRectangle2D$Float');
});
