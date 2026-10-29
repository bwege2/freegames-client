// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/Ellipse2D.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { RectangularShape } from './RectangularShape.ts';

let EllipseIterator, Rectangle2D$Double;

/**
 * The {@code Ellipse2D} class describes an ellipse that is defined
 * by a framing rectangle.
 * <p>
 * This class is only the abstract superclass for all objects which
 * store a 2D ellipse.
 * The actual storage representation of the coordinates is left to
 * the subclass.
 *
 * @author      Jim Graham
 * @since 1.2
 */
export class Ellipse2D extends RectangularShape {
  /**
   * This is an abstract class that cannot be instantiated directly.
   * Type-specific implementation subclasses are available for
   * instantiation and provide a number of formats for storing
   * the information necessary to satisfy the various accessor
   * methods below.
   *
   * @see java.awt.geom.Ellipse2D.Float
   * @see java.awt.geom.Ellipse2D.Double
   * @since 1.2
   */
  _Ellipse2D(): this {
    this._RectangularShape();
    return this;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  intersects$double$double$double$double(x: number, y: number, w: number, h: number): boolean {
    if (w <= 0 || h <= 0) {
      return false;
    }
    let ellw = this.getWidth();
    if (ellw <= 0) {
      return false;
    }
    let normx0 = (x - this.getX()) / ellw - 0.5;
    let normx1 = normx0 + w / ellw;
    let ellh = this.getHeight();
    if (ellh <= 0) {
      return false;
    }
    let normy0 = (y - this.getY()) / ellh - 0.5;
    let normy1 = normy0 + h / ellh;
    let nearx: number;
    let neary: number;
    if (normx0 > 0) {
      nearx = normx0;
    } else if (normx1 < 0) {
      nearx = normx1;
    } else {
      nearx = 0;
    }
    if (normy0 > 0) {
      neary = normy0;
    } else if (normy1 < 0) {
      neary = normy1;
    } else {
      neary = 0;
    }
    return (nearx * nearx + neary * neary) < 0.25;
  }
  /**
   * Returns an iteration object that defines the boundary of this
   * {@code Ellipse2D}.
   * The iterator for this class is multi-threaded safe, which means
   * that this {@code Ellipse2D} class guarantees that
   * modifications to the geometry of this {@code Ellipse2D}
   * object do not affect any iterations of that geometry that
   * are already in process.
   * @param at an optional {@code AffineTransform} to be applied to
   * the coordinates as they are returned in the iteration, or
   * {@code null} if untransformed coordinates are desired
   * @return    the {@code PathIterator} object that returns the
   *          geometry of the outline of this {@code Ellipse2D},
   *          one segment at a time.
   * @since 1.2
   */
  getPathIterator$AffineTransform(at: AffineTransform): PathIterator {
    return new EllipseIterator()._EllipseIterator(this, at);
  }
  /**
   * Returns the hashcode for this {@code Ellipse2D}.
   * @return the hashcode for this {@code Ellipse2D}.
   * @since 1.6
   */
  hashCode(): number {
    let bits = $J.Double_doubleToLongBits(this.getX());
    bits += $J.Double_doubleToLongBits(this.getY()) * 37;
    bits += $J.Double_doubleToLongBits(this.getWidth()) * 43;
    bits += $J.Double_doubleToLongBits(this.getHeight()) * 47;
    return (((bits) | 0) ^ ((($J.lshr(bits, 32))) | 0));
  }
  /**
   * Determines whether or not the specified {@code Object} is
   * equal to this {@code Ellipse2D}.  The specified
   * {@code Object} is equal to this {@code Ellipse2D}
   * if it is an instance of {@code Ellipse2D} and if its
   * location and size are the same as this {@code Ellipse2D}.
   * @param obj  an {@code Object} to be compared with this
   *             {@code Ellipse2D}.
   * @return  {@code true} if {@code obj} is an instance
   *          of {@code Ellipse2D} and has the same values;
   *          {@code false} otherwise.
   * @since 1.6
   */
  equals(obj: any): boolean {
    if (obj === this) {
      return true;
    }
    if (obj instanceof Ellipse2D) {
      let e2d = obj;
      return ((this.getX() === e2d.getX()) && (this.getY() === e2d.getY()) && (this.getWidth() === e2d.getWidth()) && (this.getHeight() === e2d.getHeight()));
    }
    return false;
  }
}

/**
 * The {@code Double} class defines an ellipse specified
 * in {@code double} precision.
 * @since 1.2
 */
export class Ellipse2D$Double extends Ellipse2D {
  /**
   * The X coordinate of the upper-left corner of the
   * framing rectangle of this {@code Ellipse2D}.
   * @since 1.2
   * @serial
   */
  x_: number = 0;
  /**
   * The Y coordinate of the upper-left corner of the
   * framing rectangle of this {@code Ellipse2D}.
   * @since 1.2
   * @serial
   */
  y_: number = 0;
  /**
   * The overall width of this {@code Ellipse2D}.
   * @since 1.2
   * @serial
   */
  width_: number = 0;
  /**
   * The overall height of the {@code Ellipse2D}.
   * @since 1.2
   * @serial
   */
  height_: number = 0;
  /**
   * Constructs and initializes an {@code Ellipse2D} from the
   * specified coordinates.
   *
   * @param x the X coordinate of the upper-left corner
   *        of the framing rectangle
   * @param y the Y coordinate of the upper-left corner
   *        of the framing rectangle
   * @param w the width of the framing rectangle
   * @param h the height of the framing rectangle
   * @since 1.2
   */
  _Ellipse2D$Double$double$double$double$double(x: number, y: number, w: number, h: number): this {
    this._Ellipse2D();
    this.setFrame$double$double$double$double(x, y, w, h);
    return this;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  getX(): number {
    return this.x_;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  getY(): number {
    return this.y_;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  getWidth(): number {
    return this.width_;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  getHeight(): number {
    return this.height_;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  isEmpty(): boolean {
    return (this.width_ <= 0 || this.height_ <= 0);
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  setFrame$double$double$double$double(x: number, y: number, w: number, h: number): void {
    this.x_ = x;
    this.y_ = y;
    this.width_ = w;
    this.height_ = h;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  getBounds2D(): Rectangle2D {
    return new Rectangle2D$Double()._Rectangle2D$Double$double$double$double$double(this.x_, this.y_, this.width_, this.height_);
  }
}

$J.define(Ellipse2D, 'java.awt.geom.Ellipse2D', { kind: 'class', sup: 'java.awt.geom.RectangularShape', ctors: { '': '_Ellipse2D' }, meths: { 'getPathIterator(java.awt.geom.AffineTransform)': 'getPathIterator$AffineTransform', 'contains(double,double,double,double)': 'contains$double$double$double$double', 'intersects(double,double,double,double)': 'intersects$double$double$double$double', 'contains(double,double)': 'contains$double$double' } });
$J.define(Ellipse2D$Double, 'java.awt.geom.Ellipse2D$Double', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.geom.Ellipse2D', ctors: { 'double,double,double,double': '_Ellipse2D$Double$double$double$double$double', '': '_Ellipse2D$Double$' }, meths: { 'setFrame(double,double,double,double)': 'setFrame$double$double$double$double' } });
$J.module(() => {
  EllipseIterator = $J.load('java.awt.geom.EllipseIterator');
  Rectangle2D$Double = $J.load('java.awt.geom.Rectangle2D$Double');
});
