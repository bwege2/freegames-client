// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/GradientPaint.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2010, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, NullPointerException } from '../../../jre/index.ts';

let GradientPaintContext, Transparency, Point2D$Float;

/**
 * The {@code GradientPaint} class provides a way to fill
 * a {@link Shape} with a linear color gradient pattern.
 * If {@link Point} P1 with {@link Color} C1 and {@code Point} P2 with
 * {@code Color} C2 are specified in user space, the
 * {@code Color} on the P1, P2 connecting line is proportionally
 * changed from C1 to C2.  Any point P not on the extended P1, P2
 * connecting line has the color of the point P' that is the perpendicular
 * projection of P on the extended P1, P2 connecting line.
 * Points on the extended line outside of the P1, P2 segment can be colored
 * in one of two ways.
 * <ul>
 * <li>
 * If the gradient is cyclic then the points on the extended P1, P2
 * connecting line cycle back and forth between the colors C1 and C2.
 * <li>
 * If the gradient is acyclic then points on the P1 side of the segment
 * have the constant {@code Color} C1 while points on the P2 side
 * have the constant {@code Color} C2.
 * </ul>
 *
 * @see Paint
 * @see Graphics2D#setPaint
 * @version 10 Feb 1997
 */
export class GradientPaint extends JObject {
  p1: Point2D$Float = null;
  p2: Point2D$Float = null;
  color1: Color = null;
  color2: Color = null;
  cyclic: boolean = false;
  /**
   * Constructs a simple acyclic {@code GradientPaint} object.
   * @param x1 x coordinate of the first specified
   * {@code Point} in user space
   * @param y1 y coordinate of the first specified
   * {@code Point} in user space
   * @param color1 {@code Color} at the first specified
   * {@code Point}
   * @param x2 x coordinate of the second specified
   * {@code Point} in user space
   * @param y2 y coordinate of the second specified
   * {@code Point} in user space
   * @param color2 {@code Color} at the second specified
   * {@code Point}
   * @throws NullPointerException if either one of colors is null
   */
  _GradientPaint$float$float$Color$float$float$Color(x1: number, y1: number, color1: Color, x2: number, y2: number, color2: Color): this {
    if ((color1 == null) || (color2 == null)) {
      throw new NullPointerException('Colors cannot be null');
    }
    this.p1 = new Point2D$Float()._Point2D$Float$float$float(x1, y1);
    this.p2 = new Point2D$Float()._Point2D$Float$float$float(x2, y2);
    this.color1 = color1;
    this.color2 = color2;
    return this;
  }
  /**
   * Constructs a simple acyclic {@code GradientPaint} object.
   * @param pt1 the first specified {@code Point} in user space
   * @param color1 {@code Color} at the first specified
   * {@code Point}
   * @param pt2 the second specified {@code Point} in user space
   * @param color2 {@code Color} at the second specified
   * {@code Point}
   * @throws NullPointerException if either one of colors or points
   * is null
   */
  _GradientPaint$Point2D$Color$Point2D$Color(pt1: Point2D, color1: Color, pt2: Point2D, color2: Color): this {
    if ((color1 == null) || (color2 == null) || (pt1 == null) || (pt2 == null)) {
      throw new NullPointerException('Colors and points should be non-null');
    }
    this.p1 = new Point2D$Float()._Point2D$Float$float$float(Math.fround(pt1.getX()), Math.fround(pt1.getY()));
    this.p2 = new Point2D$Float()._Point2D$Float$float$float(Math.fround(pt2.getX()), Math.fround(pt2.getY()));
    this.color1 = color1;
    this.color2 = color2;
    return this;
  }
  /**
   * Constructs either a cyclic or acyclic {@code GradientPaint}
   * object depending on the {@code boolean} parameter.
   * @param x1 x coordinate of the first specified
   * {@code Point} in user space
   * @param y1 y coordinate of the first specified
   * {@code Point} in user space
   * @param color1 {@code Color} at the first specified
   * {@code Point}
   * @param x2 x coordinate of the second specified
   * {@code Point} in user space
   * @param y2 y coordinate of the second specified
   * {@code Point} in user space
   * @param color2 {@code Color} at the second specified
   * {@code Point}
   * @param cyclic {@code true} if the gradient pattern should cycle
   * repeatedly between the two colors; {@code false} otherwise
   */
  _GradientPaint$float$float$Color$float$float$Color$boolean(x1: number, y1: number, color1: Color, x2: number, y2: number, color2: Color, cyclic: boolean): this {
    this._GradientPaint$float$float$Color$float$float$Color(x1, y1, color1, x2, y2, color2);
    this.cyclic = cyclic;
    return this;
  }
  /**
   * Constructs either a cyclic or acyclic {@code GradientPaint}
   * object depending on the {@code boolean} parameter.
   * @param pt1 the first specified {@code Point}
   * in user space
   * @param color1 {@code Color} at the first specified
   * {@code Point}
   * @param pt2 the second specified {@code Point}
   * in user space
   * @param color2 {@code Color} at the second specified
   * {@code Point}
   * @param cyclic {@code true} if the gradient pattern should cycle
   * repeatedly between the two colors; {@code false} otherwise
   * @throws NullPointerException if either one of colors or points
   * is null
   */
  _GradientPaint$Point2D$Color$Point2D$Color$boolean(pt1: Point2D, color1: Color, pt2: Point2D, color2: Color, cyclic: boolean): this {
    this._GradientPaint$Point2D$Color$Point2D$Color(pt1, color1, pt2, color2);
    this.cyclic = cyclic;
    return this;
  }
  /**
   * Returns a copy of the point P1 that anchors the first color.
   * @return a {@link Point2D} object that is a copy of the point
   * that anchors the first color of this
   * {@code GradientPaint}.
   */
  getPoint1(): Point2D {
    return new Point2D$Float()._Point2D$Float$float$float(this.p1.x_, this.p1.y_);
  }
  /**
   * Returns the color C1 anchored by the point P1.
   * @return a {@code Color} object that is the color
   * anchored by P1.
   */
  getColor1(): Color {
    return this.color1;
  }
  /**
   * Returns a copy of the point P2 which anchors the second color.
   * @return a {@link Point2D} object that is a copy of the point
   * that anchors the second color of this
   * {@code GradientPaint}.
   */
  getPoint2(): Point2D {
    return new Point2D$Float()._Point2D$Float$float$float(this.p2.x_, this.p2.y_);
  }
  /**
   * Returns the color C2 anchored by the point P2.
   * @return a {@code Color} object that is the color
   * anchored by P2.
   */
  getColor2(): Color {
    return this.color2;
  }
  /**
   * Returns {@code true} if the gradient cycles repeatedly
   * between the two colors C1 and C2.
   * @return {@code true} if the gradient cycles repeatedly
   * between the two colors; {@code false} otherwise.
   */
  isCyclic(): boolean {
    return this.cyclic;
  }
  /**
   * Creates and returns a {@link PaintContext} used to
   * generate a linear color gradient pattern.
   * See the {@link Paint#createContext specification} of the
   * method in the {@link Paint} interface for information
   * on null parameter handling.
   *
   * @param cm the preferred {@link ColorModel} which represents the most convenient
   *           format for the caller to receive the pixel data, or {@code null}
   *           if there is no preference.
   * @param deviceBounds the device space bounding box
   *                     of the graphics primitive being rendered.
   * @param userBounds the user space bounding box
   *                   of the graphics primitive being rendered.
   * @param xform the {@link AffineTransform} from user
   *              space into device space.
   * @param hints the set of hints that the context object can use to
   *              choose between rendering alternatives.
   * @return the {@code PaintContext} for
   *         generating color patterns.
   * @see Paint
   * @see PaintContext
   * @see ColorModel
   * @see Rectangle
   * @see Rectangle2D
   * @see AffineTransform
   * @see RenderingHints
   */
  createContext(cm: ColorModel, deviceBounds: Rectangle, userBounds: Rectangle2D, xform: AffineTransform, hints: RenderingHints): PaintContext {
    return new GradientPaintContext()._GradientPaintContext(cm, this.p1, this.p2, xform, this.color1, this.color2, this.cyclic);
  }
  /**
   * Returns the transparency mode for this {@code GradientPaint}.
   * @return an integer value representing this {@code GradientPaint}
   * object's transparency mode.
   * @see Transparency
   */
  getTransparency(): number {
    let a1 = this.color1.getAlpha();
    let a2 = this.color2.getAlpha();
    return (((a1 & a2) === 255) ? Transparency.OPAQUE : Transparency.TRANSLUCENT);
  }
}

$J.define(GradientPaint, 'java.awt.GradientPaint', { kind: 'class', ifaces: ['java.awt.Paint'], sup: 'java.lang.Object', ctors: { 'java.awt.geom.Point2D,java.awt.Color,java.awt.geom.Point2D,java.awt.Color,boolean': '_GradientPaint$Point2D$Color$Point2D$Color$boolean', 'float,float,java.awt.Color,float,float,java.awt.Color,boolean': '_GradientPaint$float$float$Color$float$float$Color$boolean', 'java.awt.geom.Point2D,java.awt.Color,java.awt.geom.Point2D,java.awt.Color': '_GradientPaint$Point2D$Color$Point2D$Color', 'float,float,java.awt.Color,float,float,java.awt.Color': '_GradientPaint$float$float$Color$float$float$Color' } });
$J.module(() => {
  GradientPaintContext = $J.load('java.awt.GradientPaintContext');
  Transparency = $J.load('java.awt.Transparency');
  Point2D$Float = $J.load('java.awt.geom.Point2D$Float');
});
