// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/Rectangle2D.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let RectIterator;

/**
 * The {@code Rectangle2D} class describes a rectangle
 * defined by a location {@code (x,y)} and dimension
 * {@code (w x h)}.
 * <p>
 * This class is only the abstract superclass for all objects that
 * store a 2D rectangle.
 * The actual storage representation of the coordinates is left to
 * the subclass.
 *
 * @author      Jim Graham
 * @since 1.2
 */
export class Rectangle2D extends RectangularShape {
  /**
   * The bitmask that indicates that a point lies to the left of
   * this {@code Rectangle2D}.
   * @since 1.2
   */
  static readonly OUT_LEFT: number = 1;
  /**
   * The bitmask that indicates that a point lies above
   * this {@code Rectangle2D}.
   * @since 1.2
   */
  static readonly OUT_TOP: number = 2;
  /**
   * The bitmask that indicates that a point lies to the right of
   * this {@code Rectangle2D}.
   * @since 1.2
   */
  static readonly OUT_RIGHT: number = 4;
  /**
   * The bitmask that indicates that a point lies below
   * this {@code Rectangle2D}.
   * @since 1.2
   */
  static readonly OUT_BOTTOM: number = 8;
  /**
   * This is an abstract class that cannot be instantiated directly.
   * Type-specific implementation subclasses are available for
   * instantiation and provide a number of formats for storing
   * the information necessary to satisfy the various accessor
   * methods below.
   *
   * @see java.awt.geom.Rectangle2D.Float
   * @see java.awt.geom.Rectangle2D.Double
   * @see java.awt.Rectangle
   * @since 1.2
   */
  _Rectangle2D(): this {
    this._RectangularShape();
    return this;
  }
  /**
   * Sets this {@code Rectangle2D} to be the same as the specified
   * {@code Rectangle2D}.
   * @param r the specified {@code Rectangle2D}
   * @since 1.2
   */
  setRect$Rectangle2D(r: Rectangle2D): void {
    this.setRect$double$double$double$double(r.getX(), r.getY(), r.getWidth(), r.getHeight());
  }
  /**
   * Sets the location and size of the outer bounds of this
   * {@code Rectangle2D} to the specified rectangular values.
   *
   * @param x the X coordinate of the upper-left corner
   *          of this {@code Rectangle2D}
   * @param y the Y coordinate of the upper-left corner
   *          of this {@code Rectangle2D}
   * @param w the width of this {@code Rectangle2D}
   * @param h the height of this {@code Rectangle2D}
   * @since 1.2
   */
  setFrame$double$double$double$double(x: number, y: number, w: number, h: number): void {
    this.setRect$double$double$double$double(x, y, w, h);
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  contains$double$double(x: number, y: number): boolean {
    let x0 = this.getX();
    let y0 = this.getY();
    return (x >= x0 && y >= y0 && x < x0 + this.getWidth() && y < y0 + this.getHeight());
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  intersects$double$double$double$double(x: number, y: number, w: number, h: number): boolean {
    if (this.isEmpty() || w <= 0 || h <= 0) {
      return false;
    }
    let x0 = this.getX();
    let y0 = this.getY();
    return (x + w > x0 && y + h > y0 && x < x0 + this.getWidth() && y < y0 + this.getHeight());
  }
  /**
   * Intersects the pair of specified source {@code Rectangle2D}
   * objects and puts the result into the specified destination
   * {@code Rectangle2D} object.  One of the source rectangles
   * can also be the destination to avoid creating a third Rectangle2D
   * object, but in this case the original points of this source
   * rectangle will be overwritten by this method.
   * @param src1 the first of a pair of {@code Rectangle2D}
   * objects to be intersected with each other
   * @param src2 the second of a pair of {@code Rectangle2D}
   * objects to be intersected with each other
   * @param dest the {@code Rectangle2D} that holds the
   * results of the intersection of {@code src1} and
   * {@code src2}
   * @since 1.2
   */
  static intersect(src1: Rectangle2D, src2: Rectangle2D, dest: Rectangle2D): void {
    let x1 = Math.max(src1.getMinX(), src2.getMinX());
    let y1 = Math.max(src1.getMinY(), src2.getMinY());
    let x2 = Math.min(src1.getMaxX(), src2.getMaxX());
    let y2 = Math.min(src1.getMaxY(), src2.getMaxY());
    dest.setFrame$double$double$double$double(x1, y1, x2 - x1, y2 - y1);
  }
  /**
   * Unions the pair of source {@code Rectangle2D} objects
   * and puts the result into the specified destination
   * {@code Rectangle2D} object.  One of the source rectangles
   * can also be the destination to avoid creating a third Rectangle2D
   * object, but in this case the original points of this source
   * rectangle will be overwritten by this method.
   * @param src1 the first of a pair of {@code Rectangle2D}
   * objects to be combined with each other
   * @param src2 the second of a pair of {@code Rectangle2D}
   * objects to be combined with each other
   * @param dest the {@code Rectangle2D} that holds the
   * results of the union of {@code src1} and
   * {@code src2}
   * @since 1.2
   */
  static union(src1: Rectangle2D, src2: Rectangle2D, dest: Rectangle2D): void {
    let x1 = Math.min(src1.getMinX(), src2.getMinX());
    let y1 = Math.min(src1.getMinY(), src2.getMinY());
    let x2 = Math.max(src1.getMaxX(), src2.getMaxX());
    let y2 = Math.max(src1.getMaxY(), src2.getMaxY());
    dest.setFrameFromDiagonal$double$double$double$double(x1, y1, x2, y2);
  }
  /**
   * Adds a point, specified by the double precision arguments
   * {@code newx} and {@code newy}, to this
   * {@code Rectangle2D}.  The resulting {@code Rectangle2D}
   * is the smallest {@code Rectangle2D} that
   * contains both the original {@code Rectangle2D} and the
   * specified point.
   * <p>
   * After adding a point, a call to {@code contains} with the
   * added point as an argument does not necessarily return
   * {@code true}. The {@code contains} method does not
   * return {@code true} for points on the right or bottom
   * edges of a rectangle. Therefore, if the added point falls on
   * the right or bottom edge of the enlarged rectangle,
   * {@code contains} returns {@code false} for that point.
   * @param newx the X coordinate of the new point
   * @param newy the Y coordinate of the new point
   * @since 1.2
   */
  add$double$double(newx: number, newy: number): void {
    let x1 = Math.min(this.getMinX(), newx);
    let x2 = Math.max(this.getMaxX(), newx);
    let y1 = Math.min(this.getMinY(), newy);
    let y2 = Math.max(this.getMaxY(), newy);
    this.setRect$double$double$double$double(x1, y1, x2 - x1, y2 - y1);
  }
  /**
   * Returns an iteration object that defines the boundary of this
   * {@code Rectangle2D}.
   * The iterator for this class is multi-threaded safe, which means
   * that this {@code Rectangle2D} class guarantees that
   * modifications to the geometry of this {@code Rectangle2D}
   * object do not affect any iterations of that geometry that
   * are already in process.
   * @param at an optional {@code AffineTransform} to be applied to
   * the coordinates as they are returned in the iteration, or
   * {@code null} if untransformed coordinates are desired
   * @return    the {@code PathIterator} object that returns the
   *          geometry of the outline of this
   *          {@code Rectangle2D}, one segment at a time.
   * @since 1.2
   */
  getPathIterator$AffineTransform(at: AffineTransform): PathIterator {
    return new RectIterator()._RectIterator(this, at);
  }
  /**
   * Returns an iteration object that defines the boundary of the
   * flattened {@code Rectangle2D}.  Since rectangles are already
   * flat, the {@code flatness} parameter is ignored.
   * The iterator for this class is multi-threaded safe, which means
   * that this {@code Rectangle2D} class guarantees that
   * modifications to the geometry of this {@code Rectangle2D}
   * object do not affect any iterations of that geometry that
   * are already in process.
   * @param at an optional {@code AffineTransform} to be applied to
   * the coordinates as they are returned in the iteration, or
   * {@code null} if untransformed coordinates are desired
   * @param flatness the maximum distance that the line segments used to
   * approximate the curved segments are allowed to deviate from any
   * point on the original curve.  Since rectangles are already flat,
   * the {@code flatness} parameter is ignored.
   * @return    the {@code PathIterator} object that returns the
   *          geometry of the outline of this
   *          {@code Rectangle2D}, one segment at a time.
   * @since 1.2
   */
  getPathIterator$AffineTransform$double(at: AffineTransform, flatness: number): PathIterator {
    return new RectIterator()._RectIterator(this, at);
  }
  /**
   * Returns the hashcode for this {@code Rectangle2D}.
   * @return the hashcode for this {@code Rectangle2D}.
   * @since 1.2
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
   * equal to this {@code Rectangle2D}.  The specified
   * {@code Object} is equal to this {@code Rectangle2D}
   * if it is an instance of {@code Rectangle2D} and if its
   * location and size are the same as this {@code Rectangle2D}.
   * @param obj an {@code Object} to be compared with this
   * {@code Rectangle2D}.
   * @return     {@code true} if {@code obj} is an instance
   *                     of {@code Rectangle2D} and has
   *                     the same values; {@code false} otherwise.
   * @since 1.2
   */
  equals(obj: any): boolean {
    if (obj === this) {
      return true;
    }
    if (obj instanceof Rectangle2D) {
      let r2d = obj;
      return ((this.getX() === r2d.getX()) && (this.getY() === r2d.getY()) && (this.getWidth() === r2d.getWidth()) && (this.getHeight() === r2d.getHeight()));
    }
    return false;
  }
}

/**
 * The {@code Float} class defines a rectangle specified in float
 * coordinates.
 * @since 1.2
 */
export class Rectangle2D$Float extends Rectangle2D {
  /**
   * The X coordinate of this {@code Rectangle2D}.
   * @since 1.2
   * @serial
   */
  x_: number = 0;
  /**
   * The Y coordinate of this {@code Rectangle2D}.
   * @since 1.2
   * @serial
   */
  y_: number = 0;
  /**
   * The width of this {@code Rectangle2D}.
   * @since 1.2
   * @serial
   */
  width_: number = 0;
  /**
   * The height of this {@code Rectangle2D}.
   * @since 1.2
   * @serial
   */
  height_: number = 0;
  /**
   * Constructs a new {@code Rectangle2D}, initialized to
   * location (0.0,&nbsp;0.0) and size (0.0,&nbsp;0.0).
   * @since 1.2
   */
  _Rectangle2D$Float$(): this {
    this._Rectangle2D();
    return this;
  }
  /**
   * Constructs and initializes a {@code Rectangle2D}
   * from the specified {@code float} coordinates.
   *
   * @param x the X coordinate of the upper-left corner
   *          of the newly constructed {@code Rectangle2D}
   * @param y the Y coordinate of the upper-left corner
   *          of the newly constructed {@code Rectangle2D}
   * @param w the width of the newly constructed
   *          {@code Rectangle2D}
   * @param h the height of the newly constructed
   *          {@code Rectangle2D}
   * @since 1.2
   */
  _Rectangle2D$Float$float$float$float$float(x: number, y: number, w: number, h: number): this {
    this._Rectangle2D();
    this.setRect$float$float$float$float(x, y, w, h);
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
    return (this.width_ <= 0) || (this.height_ <= 0);
  }
  /**
   * Sets the location and size of this {@code Rectangle2D}
   * to the specified {@code float} values.
   *
   * @param x the X coordinate of the upper-left corner
   *          of this {@code Rectangle2D}
   * @param y the Y coordinate of the upper-left corner
   *          of this {@code Rectangle2D}
   * @param w the width of this {@code Rectangle2D}
   * @param h the height of this {@code Rectangle2D}
   * @since 1.2
   */
  setRect$float$float$float$float(x: number, y: number, w: number, h: number): void {
    this.x_ = x;
    this.y_ = y;
    this.width_ = w;
    this.height_ = h;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  setRect$double$double$double$double(x: number, y: number, w: number, h: number): void {
    this.x_ = Math.fround(x);
    this.y_ = Math.fround(y);
    this.width_ = Math.fround(w);
    this.height_ = Math.fround(h);
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  setRect$Rectangle2D(r: Rectangle2D): void {
    this.x_ = Math.fround(r.getX());
    this.y_ = Math.fround(r.getY());
    this.width_ = Math.fround(r.getWidth());
    this.height_ = Math.fround(r.getHeight());
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  outcode$double$double(x: number, y: number): number {
    let out = 0;
    if (this.width_ <= Math.fround(0)) {
      out |= Rectangle2D.OUT_LEFT | Rectangle2D.OUT_RIGHT;
    } else if (x < this.x_) {
      out |= Rectangle2D.OUT_LEFT;
    } else if (x > this.x_ + this.width_) {
      out |= Rectangle2D.OUT_RIGHT;
    }
    if (this.height_ <= Math.fround(0)) {
      out |= Rectangle2D.OUT_TOP | Rectangle2D.OUT_BOTTOM;
    } else if (y < this.y_) {
      out |= Rectangle2D.OUT_TOP;
    } else if (y > this.y_ + this.height_) {
      out |= Rectangle2D.OUT_BOTTOM;
    }
    return out;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  getBounds2D(): Rectangle2D {
    return new Rectangle2D$Float()._Rectangle2D$Float$float$float$float$float(this.x_, this.y_, this.width_, this.height_);
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  createIntersection(r: Rectangle2D): Rectangle2D {
    let dest: Rectangle2D;
    if (r instanceof Rectangle2D$Float) {
      dest = new Rectangle2D$Float()._Rectangle2D$Float$();
    } else {
      dest = new Rectangle2D$Double()._Rectangle2D$Double$();
    }
    Rectangle2D.intersect(this, r, dest);
    return dest;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  createUnion(r: Rectangle2D): Rectangle2D {
    let dest: Rectangle2D;
    if (r instanceof Rectangle2D$Float) {
      dest = new Rectangle2D$Float()._Rectangle2D$Float$();
    } else {
      dest = new Rectangle2D$Double()._Rectangle2D$Double$();
    }
    Rectangle2D.union(this, r, dest);
    return dest;
  }
  /**
   * Returns the {@code String} representation of this
   * {@code Rectangle2D}.
   * @return a {@code String} representing this
   * {@code Rectangle2D}.
   * @since 1.2
   */
  toString(): string {
    return $J.getClass(this).getName() + '[x=' + $J.fstr(this.x_) + ',y=' + $J.fstr(this.y_) + ',w=' + $J.fstr(this.width_) + ',h=' + $J.fstr(this.height_) + ']';
  }
}

/**
 * The {@code Double} class defines a rectangle specified in
 * double coordinates.
 * @since 1.2
 */
export class Rectangle2D$Double extends Rectangle2D {
  /**
   * The X coordinate of this {@code Rectangle2D}.
   * @since 1.2
   * @serial
   */
  x_: number = 0;
  /**
   * The Y coordinate of this {@code Rectangle2D}.
   * @since 1.2
   * @serial
   */
  y_: number = 0;
  /**
   * The width of this {@code Rectangle2D}.
   * @since 1.2
   * @serial
   */
  width_: number = 0;
  /**
   * The height of this {@code Rectangle2D}.
   * @since 1.2
   * @serial
   */
  height_: number = 0;
  /**
   * Constructs a new {@code Rectangle2D}, initialized to
   * location (0,&nbsp;0) and size (0,&nbsp;0).
   * @since 1.2
   */
  _Rectangle2D$Double$(): this {
    this._Rectangle2D();
    return this;
  }
  /**
   * Constructs and initializes a {@code Rectangle2D}
   * from the specified {@code double} coordinates.
   *
   * @param x the X coordinate of the upper-left corner
   *          of the newly constructed {@code Rectangle2D}
   * @param y the Y coordinate of the upper-left corner
   *          of the newly constructed {@code Rectangle2D}
   * @param w the width of the newly constructed
   *          {@code Rectangle2D}
   * @param h the height of the newly constructed
   *          {@code Rectangle2D}
   * @since 1.2
   */
  _Rectangle2D$Double$double$double$double$double(x: number, y: number, w: number, h: number): this {
    this._Rectangle2D();
    this.setRect$double$double$double$double(x, y, w, h);
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
    return (this.width_ <= 0) || (this.height_ <= 0);
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  setRect$double$double$double$double(x: number, y: number, w: number, h: number): void {
    this.x_ = x;
    this.y_ = y;
    this.width_ = w;
    this.height_ = h;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  setRect$Rectangle2D(r: Rectangle2D): void {
    this.x_ = r.getX();
    this.y_ = r.getY();
    this.width_ = r.getWidth();
    this.height_ = r.getHeight();
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  getBounds2D(): Rectangle2D {
    return new Rectangle2D$Double()._Rectangle2D$Double$double$double$double$double(this.x_, this.y_, this.width_, this.height_);
  }
  /**
   * Returns the {@code String} representation of this
   * {@code Rectangle2D}.
   * @return a {@code String} representing this
   * {@code Rectangle2D}.
   * @since 1.2
   */
  toString(): string {
    return $J.getClass(this).getName() + '[x=' + $J.dstr(this.x_) + ',y=' + $J.dstr(this.y_) + ',w=' + $J.dstr(this.width_) + ',h=' + $J.dstr(this.height_) + ']';
  }
}

$J.define(Rectangle2D, 'java.awt.geom.Rectangle2D', { kind: 'class', sup: 'java.awt.geom.RectangularShape', ctors: { '': '_Rectangle2D' }, meths: { 'getPathIterator(java.awt.geom.AffineTransform,double)': 'getPathIterator$AffineTransform$double', 'getPathIterator(java.awt.geom.AffineTransform)': 'getPathIterator$AffineTransform', 'add(java.awt.geom.Rectangle2D)': 'add$Rectangle2D', 'add(java.awt.geom.Point2D)': 'add$Point2D', 'add(double,double)': 'add$double$double', 'contains(double,double,double,double)': 'contains$double$double$double$double', 'intersects(double,double,double,double)': 'intersects$double$double$double$double', 'contains(double,double)': 'contains$double$double', 'setFrame(double,double,double,double)': 'setFrame$double$double$double$double', 'outcode(java.awt.geom.Point2D)': 'outcode$Point2D', 'outcode(double,double)': 'outcode$double$double', 'intersectsLine(java.awt.geom.Line2D)': 'intersectsLine$Line2D', 'intersectsLine(double,double,double,double)': 'intersectsLine$double$double$double$double', 'setRect(java.awt.geom.Rectangle2D)': 'setRect$Rectangle2D', 'setRect(double,double,double,double)': 'setRect$double$double$double$double' } });
$J.define(Rectangle2D$Float, 'java.awt.geom.Rectangle2D$Float', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.geom.Rectangle2D', ctors: { 'float,float,float,float': '_Rectangle2D$Float$float$float$float$float', '': '_Rectangle2D$Float$' }, meths: { 'outcode(double,double)': 'outcode$double$double', 'setRect(java.awt.geom.Rectangle2D)': 'setRect$Rectangle2D', 'setRect(double,double,double,double)': 'setRect$double$double$double$double', 'setRect(float,float,float,float)': 'setRect$float$float$float$float' } });
$J.define(Rectangle2D$Double, 'java.awt.geom.Rectangle2D$Double', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.geom.Rectangle2D', ctors: { 'double,double,double,double': '_Rectangle2D$Double$double$double$double$double', '': '_Rectangle2D$Double$' }, meths: { 'outcode(double,double)': 'outcode$double$double', 'setRect(java.awt.geom.Rectangle2D)': 'setRect$Rectangle2D', 'setRect(double,double,double,double)': 'setRect$double$double$double$double' } });
$J.module(() => {
  RectIterator = $J.load('java.awt.geom.RectIterator');
});
