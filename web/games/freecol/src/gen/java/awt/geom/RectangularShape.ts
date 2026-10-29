// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/RectangularShape.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2011, Oracle and/or its affiliates. All rights reserved.
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
import { $J, CloneNotSupportedException, InternalError, JObject } from '../../../../jre/index.ts';

let Rectangle, FlatteningPathIterator;

/**
 * {@code RectangularShape} is the base class for a number of
 * {@link Shape} objects whose geometry is defined by a rectangular frame.
 * This class does not directly specify any specific geometry by
 * itself, but merely provides manipulation methods inherited by
 * a whole category of {@code Shape} objects.
 * The manipulation methods provided by this class can be used to
 * query and modify the rectangular frame, which provides a reference
 * for the subclasses to define their geometry.
 *
 * @author      Jim Graham
 * @since 1.2
 */
export class RectangularShape extends JObject {
  /**
   * This is an abstract class that cannot be instantiated directly.
   *
   * @see Arc2D
   * @see Ellipse2D
   * @see Rectangle2D
   * @see RoundRectangle2D
   * @since 1.2
   */
  _RectangularShape(): this {
    return this;
  }
  /**
   * Returns the smallest X coordinate of the framing
   * rectangle of the {@code Shape} in {@code double}
   * precision.
   * @return the smallest X coordinate of the framing
   *          rectangle of the {@code Shape}.
   * @since 1.2
   */
  getMinX(): number {
    return this.getX();
  }
  /**
   * Returns the smallest Y coordinate of the framing
   * rectangle of the {@code Shape} in {@code double}
   * precision.
   * @return the smallest Y coordinate of the framing
   *          rectangle of the {@code Shape}.
   * @since 1.2
   */
  getMinY(): number {
    return this.getY();
  }
  /**
   * Returns the largest X coordinate of the framing
   * rectangle of the {@code Shape} in {@code double}
   * precision.
   * @return the largest X coordinate of the framing
   *          rectangle of the {@code Shape}.
   * @since 1.2
   */
  getMaxX(): number {
    return this.getX() + this.getWidth();
  }
  /**
   * Returns the largest Y coordinate of the framing
   * rectangle of the {@code Shape} in {@code double}
   * precision.
   * @return the largest Y coordinate of the framing
   *          rectangle of the {@code Shape}.
   * @since 1.2
   */
  getMaxY(): number {
    return this.getY() + this.getHeight();
  }
  /**
   * Sets the diagonal of the framing rectangle of this {@code Shape}
   * based on the two specified coordinates.  The framing rectangle is
   * used by the subclasses of {@code RectangularShape} to define
   * their geometry.
   *
   * @param x1 the X coordinate of the start point of the specified diagonal
   * @param y1 the Y coordinate of the start point of the specified diagonal
   * @param x2 the X coordinate of the end point of the specified diagonal
   * @param y2 the Y coordinate of the end point of the specified diagonal
   * @since 1.2
   */
  setFrameFromDiagonal$double$double$double$double(x1: number, y1: number, x2: number, y2: number): void {
    if (x2 < x1) {
      let t = x1;
      x1 = x2;
      x2 = t;
    }
    if (y2 < y1) {
      let t = y1;
      y1 = y2;
      y2 = t;
    }
    this.setFrame$double$double$double$double(x1, y1, x2 - x1, y2 - y1);
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  intersects$Rectangle2D(r: Rectangle2D): boolean {
    return this.intersects$double$double$double$double(r.getX(), r.getY(), r.getWidth(), r.getHeight());
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  getBounds(): Rectangle {
    let width = this.getWidth();
    let height = this.getHeight();
    if (width < 0 || height < 0) {
      return new Rectangle()._Rectangle$();
    }
    let x = this.getX();
    let y = this.getY();
    let x1 = Math.floor(x);
    let y1 = Math.floor(y);
    let x2 = Math.ceil(x + width);
    let y2 = Math.ceil(y + height);
    return new Rectangle()._Rectangle$int$int$int$int($J.d2i(x1), $J.d2i(y1), $J.d2i((x2 - x1)), $J.d2i((y2 - y1)));
  }
  /**
   * Returns an iterator object that iterates along the
   * {@code Shape} object's boundary and provides access to a
   * flattened view of the outline of the {@code Shape}
   * object's geometry.
   * <p>
   * Only SEG_MOVETO, SEG_LINETO, and SEG_CLOSE point types will
   * be returned by the iterator.
   * <p>
   * The amount of subdivision of the curved segments is controlled
   * by the {@code flatness} parameter, which specifies the
   * maximum distance that any point on the unflattened transformed
   * curve can deviate from the returned flattened path segments.
   * An optional {@link AffineTransform} can
   * be specified so that the coordinates returned in the iteration are
   * transformed accordingly.
   * @param at an optional {@code AffineTransform} to be applied to the
   *          coordinates as they are returned in the iteration,
   *          or {@code null} if untransformed coordinates are desired.
   * @param flatness the maximum distance that the line segments used to
   *          approximate the curved segments are allowed to deviate
   *          from any point on the original curve
   * @return a {@code PathIterator} object that provides access to
   *          the {@code Shape} object's flattened geometry.
   * @since 1.2
   */
  getPathIterator$AffineTransform$double(at: AffineTransform, flatness: number): PathIterator {
    return new FlatteningPathIterator()._FlatteningPathIterator$PathIterator$double(this.getPathIterator$AffineTransform(at), flatness);
  }
  /**
   * Creates a new object of the same class and with the same
   * contents as this object.
   * @return     a clone of this instance.
   * @throws  OutOfMemoryError            if there is not enough memory.
   * @see        java.lang.Cloneable
   * @since      1.2
   */
  clone(): any {
    try {
      return super.clone();
    } catch ($e0) {
      if ($J.isa($e0, CloneNotSupportedException)) {
        let e = $J.exc($e0);
        throw new InternalError(e);
      } else {
        throw $e0;
      }
    }
  }
}

$J.define(RectangularShape, 'java.awt.geom.RectangularShape', { kind: 'class', ifaces: ['java.awt.Shape', 'java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { '': '_RectangularShape' }, meths: { 'getPathIterator(java.awt.geom.AffineTransform,double)': 'getPathIterator$AffineTransform$double', 'contains(java.awt.geom.Rectangle2D)': 'contains$Rectangle2D', 'intersects(java.awt.geom.Rectangle2D)': 'intersects$Rectangle2D', 'contains(java.awt.geom.Point2D)': 'contains$Point2D', 'setFrameFromCenter(java.awt.geom.Point2D,java.awt.geom.Point2D)': 'setFrameFromCenter$Point2D$Point2D', 'setFrameFromCenter(double,double,double,double)': 'setFrameFromCenter$double$double$double$double', 'setFrameFromDiagonal(java.awt.geom.Point2D,java.awt.geom.Point2D)': 'setFrameFromDiagonal$Point2D$Point2D', 'setFrameFromDiagonal(double,double,double,double)': 'setFrameFromDiagonal$double$double$double$double', 'setFrame(java.awt.geom.Rectangle2D)': 'setFrame$Rectangle2D', 'setFrame(java.awt.geom.Point2D,java.awt.geom.Dimension2D)': 'setFrame$Point2D$Dimension2D', 'setFrame(double,double,double,double)': 'setFrame$double$double$double$double' } });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  FlatteningPathIterator = $J.load('java.awt.geom.FlatteningPathIterator');
});
