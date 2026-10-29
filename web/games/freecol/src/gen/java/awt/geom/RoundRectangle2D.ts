// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/RoundRectangle2D.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Rectangle2D$Float, RoundRectIterator;

/**
 * The {@code RoundRectangle2D} class defines a rectangle with
 * rounded corners defined by a location {@code (x,y)}, a
 * dimension {@code (w x h)}, and the width and height of an arc
 * with which to round the corners.
 * <p>
 * This class is the abstract superclass for all objects that
 * store a 2D rounded rectangle.
 * The actual storage representation of the coordinates is left to
 * the subclass.
 *
 * @author      Jim Graham
 * @since 1.2
 */
export class RoundRectangle2D extends RectangularShape {
  /**
   * This is an abstract class that cannot be instantiated directly.
   * Type-specific implementation subclasses are available for
   * instantiation and provide a number of formats for storing
   * the information necessary to satisfy the various accessor
   * methods below.
   *
   * @see java.awt.geom.RoundRectangle2D.Float
   * @see java.awt.geom.RoundRectangle2D.Double
   * @since 1.2
   */
  _RoundRectangle2D(): this {
    this._RectangularShape();
    return this;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  setFrame$double$double$double$double(x: number, y: number, w: number, h: number): void {
    this.setRoundRect$double$double$double$double$double$double(x, y, w, h, this.getArcWidth(), this.getArcHeight());
  }
  classify(coord: number, left: number, right: number, arcsize: number): number {
    if (coord < left) {
      return 0;
    } else if (coord < left + arcsize) {
      return 1;
    } else if (coord < right - arcsize) {
      return 2;
    } else if (coord < right) {
      return 3;
    } else {
      return 4;
    }
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  intersects$double$double$double$double(x: number, y: number, w: number, h: number): boolean {
    if (this.isEmpty() || w <= 0 || h <= 0) {
      return false;
    }
    let rrx0 = this.getX();
    let rry0 = this.getY();
    let rrx1 = rrx0 + this.getWidth();
    let rry1 = rry0 + this.getHeight();
    if (x + w <= rrx0 || x >= rrx1 || y + h <= rry0 || y >= rry1) {
      return false;
    }
    let aw = Math.min(this.getWidth(), Math.abs(this.getArcWidth())) / 2;
    let ah = Math.min(this.getHeight(), Math.abs(this.getArcHeight())) / 2;
    let x0class = this.classify(x, rrx0, rrx1, aw);
    let x1class = this.classify(x + w, rrx0, rrx1, aw);
    let y0class = this.classify(y, rry0, rry1, ah);
    let y1class = this.classify(y + h, rry0, rry1, ah);
    if (x0class === 2 || x1class === 2 || y0class === 2 || y1class === 2) {
      return true;
    }
    if ((x0class < 2 && x1class > 2) || (y0class < 2 && y1class > 2)) {
      return true;
    }
    x = (x1class === 1) ? (x = x + w - (rrx0 + aw)) : (x = x - (rrx1 - aw));
    y = (y1class === 1) ? (y = y + h - (rry0 + ah)) : (y = y - (rry1 - ah));
    x = x / aw;
    y = y / ah;
    return (x * x + y * y <= 1);
  }
  /**
   * Returns an iteration object that defines the boundary of this
   * {@code RoundRectangle2D}.
   * The iterator for this class is multi-threaded safe, which means
   * that this {@code RoundRectangle2D} class guarantees that
   * modifications to the geometry of this {@code RoundRectangle2D}
   * object do not affect any iterations of that geometry that
   * are already in process.
   * @param at an optional {@code AffineTransform} to be applied to
   * the coordinates as they are returned in the iteration, or
   * {@code null} if untransformed coordinates are desired
   * @return    the {@code PathIterator} object that returns the
   *          geometry of the outline of this
   *          {@code RoundRectangle2D}, one segment at a time.
   * @since 1.2
   */
  getPathIterator$AffineTransform(at: AffineTransform): PathIterator {
    return new RoundRectIterator()._RoundRectIterator(this, at);
  }
  /**
   * Returns the hashcode for this {@code RoundRectangle2D}.
   * @return the hashcode for this {@code RoundRectangle2D}.
   * @since 1.6
   */
  hashCode(): number {
    let bits = $J.Double_doubleToLongBits(this.getX());
    bits += $J.Double_doubleToLongBits(this.getY()) * 37;
    bits += $J.Double_doubleToLongBits(this.getWidth()) * 43;
    bits += $J.Double_doubleToLongBits(this.getHeight()) * 47;
    bits += $J.Double_doubleToLongBits(this.getArcWidth()) * 53;
    bits += $J.Double_doubleToLongBits(this.getArcHeight()) * 59;
    return (((bits) | 0) ^ ((($J.lshr(bits, 32))) | 0));
  }
  /**
   * Determines whether or not the specified {@code Object} is
   * equal to this {@code RoundRectangle2D}.  The specified
   * {@code Object} is equal to this {@code RoundRectangle2D}
   * if it is an instance of {@code RoundRectangle2D} and if its
   * location, size, and corner arc dimensions are the same as this
   * {@code RoundRectangle2D}.
   * @param obj  an {@code Object} to be compared with this
   *             {@code RoundRectangle2D}.
   * @return  {@code true} if {@code obj} is an instance
   *          of {@code RoundRectangle2D} and has the same values;
   *          {@code false} otherwise.
   * @since 1.6
   */
  equals(obj: any): boolean {
    if (obj === this) {
      return true;
    }
    if (obj instanceof RoundRectangle2D) {
      let rr2d = obj;
      return ((this.getX() === rr2d.getX()) && (this.getY() === rr2d.getY()) && (this.getWidth() === rr2d.getWidth()) && (this.getHeight() === rr2d.getHeight()) && (this.getArcWidth() === rr2d.getArcWidth()) && (this.getArcHeight() === rr2d.getArcHeight()));
    }
    return false;
  }
}

/**
 * The {@code Float} class defines a rectangle with rounded
 * corners all specified in {@code float} coordinates.
 * @since 1.2
 */
export class RoundRectangle2D$Float extends RoundRectangle2D {
  /**
   * The X coordinate of this {@code RoundRectangle2D}.
   * @since 1.2
   * @serial
   */
  x_: number = 0;
  /**
   * The Y coordinate of this {@code RoundRectangle2D}.
   * @since 1.2
   * @serial
   */
  y_: number = 0;
  /**
   * The width of this {@code RoundRectangle2D}.
   * @since 1.2
   * @serial
   */
  width_: number = 0;
  /**
   * The height of this {@code RoundRectangle2D}.
   * @since 1.2
   * @serial
   */
  height_: number = 0;
  /**
   * The width of the arc that rounds off the corners.
   * @since 1.2
   * @serial
   */
  arcwidth: number = 0;
  /**
   * The height of the arc that rounds off the corners.
   * @since 1.2
   * @serial
   */
  archeight: number = 0;
  /**
   * Constructs and initializes a {@code RoundRectangle2D}
   * from the specified {@code float} coordinates.
   *
   * @param x the X coordinate of the newly
   *          constructed {@code RoundRectangle2D}
   * @param y the Y coordinate of the newly
   *          constructed {@code RoundRectangle2D}
   * @param w the width to which to set the newly
   *          constructed {@code RoundRectangle2D}
   * @param h the height to which to set the newly
   *          constructed {@code RoundRectangle2D}
   * @param arcw the width of the arc to use to round off the
   *             corners of the newly constructed
   *             {@code RoundRectangle2D}
   * @param arch the height of the arc to use to round off the
   *             corners of the newly constructed
   *             {@code RoundRectangle2D}
   * @since 1.2
   */
  _RoundRectangle2D$Float$float$float$float$float$float$float(x: number, y: number, w: number, h: number, arcw: number, arch: number): this {
    this._RoundRectangle2D();
    this.setRoundRect$float$float$float$float$float$float(x, y, w, h, arcw, arch);
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
  getArcWidth(): number {
    return this.arcwidth;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  getArcHeight(): number {
    return this.archeight;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  isEmpty(): boolean {
    return (this.width_ <= 0) || (this.height_ <= 0);
  }
  /**
   * Sets the location, size, and corner radii of this
   * {@code RoundRectangle2D} to the specified
   * {@code float} values.
   *
   * @param x the X coordinate to which to set the
   *          location of this {@code RoundRectangle2D}
   * @param y the Y coordinate to which to set the
   *          location of this {@code RoundRectangle2D}
   * @param w the width to which to set this
   *          {@code RoundRectangle2D}
   * @param h the height to which to set this
   *          {@code RoundRectangle2D}
   * @param arcw the width to which to set the arc of this
   *             {@code RoundRectangle2D}
   * @param arch the height to which to set the arc of this
   *             {@code RoundRectangle2D}
   * @since 1.2
   */
  setRoundRect$float$float$float$float$float$float(x: number, y: number, w: number, h: number, arcw: number, arch: number): void {
    this.x_ = x;
    this.y_ = y;
    this.width_ = w;
    this.height_ = h;
    this.arcwidth = arcw;
    this.archeight = arch;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  setRoundRect$double$double$double$double$double$double(x: number, y: number, w: number, h: number, arcw: number, arch: number): void {
    this.x_ = Math.fround(x);
    this.y_ = Math.fround(y);
    this.width_ = Math.fround(w);
    this.height_ = Math.fround(h);
    this.arcwidth = Math.fround(arcw);
    this.archeight = Math.fround(arch);
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  getBounds2D(): Rectangle2D {
    return new Rectangle2D$Float()._Rectangle2D$Float$float$float$float$float(this.x_, this.y_, this.width_, this.height_);
  }
}

$J.define(RoundRectangle2D, 'java.awt.geom.RoundRectangle2D', { kind: 'class', sup: 'java.awt.geom.RectangularShape', ctors: { '': '_RoundRectangle2D' }, meths: { 'getPathIterator(java.awt.geom.AffineTransform)': 'getPathIterator$AffineTransform', 'contains(double,double,double,double)': 'contains$double$double$double$double', 'intersects(double,double,double,double)': 'intersects$double$double$double$double', 'contains(double,double)': 'contains$double$double', 'setFrame(double,double,double,double)': 'setFrame$double$double$double$double', 'setRoundRect(java.awt.geom.RoundRectangle2D)': 'setRoundRect$RoundRectangle2D', 'setRoundRect(double,double,double,double,double,double)': 'setRoundRect$double$double$double$double$double$double' } });
$J.define(RoundRectangle2D$Float, 'java.awt.geom.RoundRectangle2D$Float', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.geom.RoundRectangle2D', ctors: { 'float,float,float,float,float,float': '_RoundRectangle2D$Float$float$float$float$float$float$float', '': '_RoundRectangle2D$Float$' }, meths: { 'setRoundRect(java.awt.geom.RoundRectangle2D)': 'setRoundRect$RoundRectangle2D', 'setRoundRect(double,double,double,double,double,double)': 'setRoundRect$double$double$double$double$double$double', 'setRoundRect(float,float,float,float,float,float)': 'setRoundRect$float$float$float$float$float$float' } });
$J.module(() => {
  Rectangle2D$Float = $J.load('java.awt.geom.Rectangle2D$Float');
  RoundRectIterator = $J.load('java.awt.geom.RoundRectIterator');
});
