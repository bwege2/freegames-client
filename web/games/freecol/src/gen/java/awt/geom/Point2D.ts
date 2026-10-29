// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/Point2D.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, CloneNotSupportedException, InternalError, JObject } from '../../../../jre/index.ts';

/**
 * The {@code Point2D} class defines a point representing a location
 * in {@code (x,y)} coordinate space.
 * <p>
 * This class is only the abstract superclass for all objects that
 * store a 2D coordinate.
 * The actual storage representation of the coordinates is left to
 * the subclass.
 *
 * @author      Jim Graham
 * @since 1.2
 */
export class Point2D extends JObject {
  /**
   * This is an abstract class that cannot be instantiated directly.
   * Type-specific implementation subclasses are available for
   * instantiation and provide a number of formats for storing
   * the information necessary to satisfy the various accessor
   * methods below.
   *
   * @see java.awt.geom.Point2D.Float
   * @see java.awt.geom.Point2D.Double
   * @see java.awt.Point
   * @since 1.2
   */
  _Point2D(): this {
    return this;
  }
  /**
   * Returns the distance between two points.
   *
   * @param x1 the X coordinate of the first specified point
   * @param y1 the Y coordinate of the first specified point
   * @param x2 the X coordinate of the second specified point
   * @param y2 the Y coordinate of the second specified point
   * @return the distance between the two sets of specified
   * coordinates.
   * @since 1.2
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    x1 -= x2;
    y1 -= y2;
    return Math.sqrt(x1 * x1 + y1 * y1);
  }
  /**
   * Returns the distance from this {@code Point2D} to a
   * specified {@code Point2D}.
   *
   * @param pt the specified point to be measured
   *           against this {@code Point2D}
   * @return the distance between this {@code Point2D} and
   * the specified {@code Point2D}.
   * @since 1.2
   */
  distance$Point2D(pt: Point2D): number {
    let px = pt.getX() - this.getX();
    let py = pt.getY() - this.getY();
    return Math.sqrt(px * px + py * py);
  }
  /**
   * Creates a new object of the same class and with the
   * same contents as this object.
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
  /**
   * Returns the hashcode for this {@code Point2D}.
   * @return      a hash code for this {@code Point2D}.
   */
  hashCode(): number {
    let bits = $J.Double_doubleToLongBits(this.getX());
    bits = $J.lxor(bits, $J.Double_doubleToLongBits(this.getY()) * 31);
    return (((bits) | 0) ^ ((($J.lshr(bits, 32))) | 0));
  }
  /**
   * Determines whether or not two points are equal. Two instances of
   * {@code Point2D} are equal if the values of their
   * {@code x} and {@code y} member fields, representing
   * their position in the coordinate space, are the same.
   * @param obj an object to be compared with this {@code Point2D}
   * @return {@code true} if the object to be compared is
   *         an instance of {@code Point2D} and has
   *         the same values; {@code false} otherwise.
   * @since 1.2
   */
  equals(obj: any): boolean {
    if (obj instanceof Point2D) {
      let p2d = obj;
      return (this.getX() === p2d.getX()) && (this.getY() === p2d.getY());
    }
    return super.equals(obj);
  }
}

/**
 * The {@code Float} class defines a point specified in float
 * precision.
 * @since 1.2
 */
export class Point2D$Float extends Point2D {
  /**
   * The X coordinate of this {@code Point2D}.
   * @since 1.2
   * @serial
   */
  x_: number = 0;
  /**
   * The Y coordinate of this {@code Point2D}.
   * @since 1.2
   * @serial
   */
  y_: number = 0;
  /**
   * Constructs and initializes a {@code Point2D} with
   * coordinates (0,&nbsp;0).
   * @since 1.2
   */
  _Point2D$Float$(): this {
    this._Point2D();
    return this;
  }
  /**
   * Constructs and initializes a {@code Point2D} with
   * the specified coordinates.
   *
   * @param x the X coordinate of the newly
   *          constructed {@code Point2D}
   * @param y the Y coordinate of the newly
   *          constructed {@code Point2D}
   * @since 1.2
   */
  _Point2D$Float$float$float(x: number, y: number): this {
    this._Point2D();
    this.x_ = x;
    this.y_ = y;
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
  setLocation$double$double(x: number, y: number): void {
    this.x_ = Math.fround(x);
    this.y_ = Math.fround(y);
  }
  /**
   * Sets the location of this {@code Point2D} to the
   * specified {@code float} coordinates.
   *
   * @param x the new X coordinate of this {@code Point2D}
   * @param y the new Y coordinate of this {@code Point2D}
   * @since 1.2
   */
  setLocation$float$float(x: number, y: number): void {
    this.x_ = x;
    this.y_ = y;
  }
  /**
   * Returns a {@code String} that represents the value
   * of this {@code Point2D}.
   * @return a string representation of this {@code Point2D}.
   * @since 1.2
   */
  toString(): string {
    return 'Point2D.Float[' + $J.fstr(this.x_) + ', ' + $J.fstr(this.y_) + ']';
  }
}

/**
 * The {@code Double} class defines a point specified in
 * {@code double} precision.
 * @since 1.2
 */
export class Point2D$Double extends Point2D {
  /**
   * The X coordinate of this {@code Point2D}.
   * @since 1.2
   * @serial
   */
  x_: number = 0;
  /**
   * The Y coordinate of this {@code Point2D}.
   * @since 1.2
   * @serial
   */
  y_: number = 0;
  /**
   * Constructs and initializes a {@code Point2D} with
   * coordinates (0,&nbsp;0).
   * @since 1.2
   */
  _Point2D$Double$(): this {
    this._Point2D();
    return this;
  }
  /**
   * Constructs and initializes a {@code Point2D} with the
   * specified coordinates.
   *
   * @param x the X coordinate of the newly
   *          constructed {@code Point2D}
   * @param y the Y coordinate of the newly
   *          constructed {@code Point2D}
   * @since 1.2
   */
  _Point2D$Double$double$double(x: number, y: number): this {
    this._Point2D();
    this.x_ = x;
    this.y_ = y;
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
  setLocation$double$double(x: number, y: number): void {
    this.x_ = x;
    this.y_ = y;
  }
  /**
   * Returns a {@code String} that represents the value
   * of this {@code Point2D}.
   * @return a string representation of this {@code Point2D}.
   * @since 1.2
   */
  toString(): string {
    return 'Point2D.Double[' + $J.dstr(this.x_) + ', ' + $J.dstr(this.y_) + ']';
  }
}

$J.define(Point2D, 'java.awt.geom.Point2D', { kind: 'class', ifaces: ['java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { '': '_Point2D' }, meths: { 'distance(java.awt.geom.Point2D)': 'distance$Point2D', 'distance(double,double)': 'distance$double$double', 'distanceSq(java.awt.geom.Point2D)': 'distanceSq$Point2D', 'distanceSq(double,double)': 'distanceSq$double$double', 'setLocation(java.awt.geom.Point2D)': 'setLocation$Point2D', 'setLocation(double,double)': 'setLocation$double$double' } });
$J.define(Point2D$Float, 'java.awt.geom.Point2D$Float', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.geom.Point2D', ctors: { 'float,float': '_Point2D$Float$float$float', '': '_Point2D$Float$' }, meths: { 'setLocation(float,float)': 'setLocation$float$float', 'setLocation(double,double)': 'setLocation$double$double' } });
$J.define(Point2D$Double, 'java.awt.geom.Point2D$Double', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.geom.Point2D', ctors: { 'double,double': '_Point2D$Double$double$double', '': '_Point2D$Double$' }, meths: { 'setLocation(double,double)': 'setLocation$double$double' } });
