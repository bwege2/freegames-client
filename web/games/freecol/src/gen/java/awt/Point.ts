// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Point.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../jre/index.ts';
import { Point2D } from './geom/Point2D.ts';

/**
 * A point representing a location in {@code (x,y)} coordinate space,
 * specified in integer precision.
 *
 * @author      Sami Shaio
 * @since       1.0
 */
export class Point extends Point2D {
  /**
   * The X coordinate of this {@code Point}.
   * If no X coordinate is set it will default to 0.
   *
   * @serial
   * @see #getLocation()
   * @see #move(int, int)
   * @since 1.0
   */
  x_: number = 0;
  /**
   * The Y coordinate of this {@code Point}.
   * If no Y coordinate is set it will default to 0.
   *
   * @serial
   * @see #getLocation()
   * @see #move(int, int)
   * @since 1.0
   */
  y_: number = 0;
  /**
   * Constructs and initializes a point at the origin
   * (0,&nbsp;0) of the coordinate space.
   * @since       1.1
   */
  _Point$(): this {
    this._Point$int$int(0, 0);
    return this;
  }
  /**
   * Constructs and initializes a point with the same location as
   * the specified {@code Point} object.
   * @param       p a point
   * @since       1.1
   */
  _Point$Point(p: Point): this {
    this._Point$int$int(p.x_, p.y_);
    return this;
  }
  /**
   * Constructs and initializes a point at the specified
   * {@code (x,y)} location in the coordinate space.
   * @param x the X coordinate of the newly constructed {@code Point}
   * @param y the Y coordinate of the newly constructed {@code Point}
   * @since 1.0
   */
  _Point$int$int(x: number, y: number): this {
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
   * Sets the location of this point to the specified double coordinates.
   * The double values will be rounded to integer values.
   * Any number smaller than {@code Integer.MIN_VALUE}
   * will be reset to {@code MIN_VALUE}, and any number
   * larger than {@code Integer.MAX_VALUE} will be
   * reset to {@code MAX_VALUE}.
   *
   * @param x the X coordinate of the new location
   * @param y the Y coordinate of the new location
   * @see #getLocation
   */
  setLocation$double$double(x: number, y: number): void {
    this.x_ = $J.d2i(Math.floor(x + 0.5));
    this.y_ = $J.d2i(Math.floor(y + 0.5));
  }
  /**
   * Translates this point, at location {@code (x,y)},
   * by {@code dx} along the {@code x} axis and {@code dy}
   * along the {@code y} axis so that it now represents the point
   * {@code (x+dx,y+dy)}.
   *
   * @param       dx   the distance to move this point
   *                            along the X axis
   * @param       dy    the distance to move this point
   *                            along the Y axis
   */
  translate(dx: number, dy: number): void {
    this.x_ = (this.x_ + dx) | 0;
    this.y_ = (this.y_ + dy) | 0;
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
   */
  equals(obj: any): boolean {
    if (obj instanceof Point) {
      let pt = obj;
      return (this.x_ === pt.x_) && (this.y_ === pt.y_);
    }
    return super.equals(obj);
  }
  /**
   * Returns a string representation of this point and its location
   * in the {@code (x,y)} coordinate space. This method is
   * intended to be used only for debugging purposes, and the content
   * and format of the returned string may vary between implementations.
   * The returned string may be empty but may not be {@code null}.
   *
   * @return  a string representation of this point
   */
  toString(): string {
    return $J.getClass(this).getName() + '[x=' + this.x_ + ',y=' + this.y_ + ']';
  }
}

$J.define(Point, 'java.awt.Point', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.geom.Point2D', ctors: { 'int,int': '_Point$int$int', 'java.awt.Point': '_Point$Point', '': '_Point$' }, meths: { 'setLocation(double,double)': 'setLocation$double$double', 'setLocation(int,int)': 'setLocation$int$int', 'setLocation(java.awt.Point)': 'setLocation$Point' } });
