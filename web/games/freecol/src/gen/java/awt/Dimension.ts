// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Dimension.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Toolkit } from '../../../jre/index.ts';
import { Dimension2D } from './geom/Dimension2D.ts';

let GraphicsEnvironment;

/**
 * The {@code Dimension} class encapsulates the width and
 * height of a component (in integer precision) in a single object.
 * The class is
 * associated with certain properties of components. Several methods
 * defined by the {@code Component} class and the
 * {@code LayoutManager} interface return a
 * {@code Dimension} object.
 * <p>
 * Normally the values of {@code width}
 * and {@code height} are non-negative integers.
 * The constructors that allow you to create a dimension do
 * not prevent you from setting a negative value for these properties.
 * If the value of {@code width} or {@code height} is
 * negative, the behavior of some methods defined by other objects is
 * undefined.
 *
 * @author      Sami Shaio
 * @author      Arthur van Hoff
 * @see         java.awt.Component
 * @see         java.awt.LayoutManager
 * @since       1.0
 */
export class Dimension extends Dimension2D {
  /**
   * The width dimension; negative values can be used.
   *
   * @serial
   * @see #getSize
   * @see #setSize
   * @since 1.0
   */
  width_: number = 0;
  /**
   * The height dimension; negative values can be used.
   *
   * @serial
   * @see #getSize
   * @see #setSize
   * @since 1.0
   */
  height_: number = 0;
  /**
   * Creates an instance of {@code Dimension} with a width
   * of zero and a height of zero.
   */
  _Dimension$(): this {
    this._Dimension$int$int(0, 0);
    return this;
  }
  /**
   * Creates an instance of {@code Dimension} whose width
   * and height are the same as for the specified dimension.
   *
   * @param    d   the specified dimension for the
   *               {@code width} and
   *               {@code height} values
   */
  _Dimension$Dimension(d: Dimension): this {
    this._Dimension$int$int(d.width_, d.height_);
    return this;
  }
  /**
   * Constructs a {@code Dimension} and initializes
   * it to the specified width and specified height.
   *
   * @param width the specified width
   * @param height the specified height
   */
  _Dimension$int$int(width: number, height: number): this {
    this._Dimension2D();
    this.width_ = width;
    this.height_ = height;
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.Dimension', 'initIDs', this, $a);
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
   * Gets the size of this {@code Dimension} object.
   * This method is included for completeness, to parallel the
   * {@code getSize} method defined by {@code Component}.
   *
   * @return   the size of this dimension, a new instance of
   *           {@code Dimension} with the same width and height
   * @see      java.awt.Dimension#setSize
   * @see      java.awt.Component#getSize
   * @since    1.1
   */
  getSize(): Dimension {
    return new Dimension()._Dimension$int$int(this.width_, this.height_);
  }
  /**
   * Sets the size of this {@code Dimension} object
   * to the specified width and height.
   * This method is included for completeness, to parallel the
   * {@code setSize} method defined by {@code Component}.
   *
   * @param    width   the new width for this {@code Dimension} object
   * @param    height  the new height for this {@code Dimension} object
   * @see      java.awt.Dimension#getSize
   * @see      java.awt.Component#setSize
   * @since    1.1
   */
  setSize$int$int(width: number, height: number): void {
    this.width_ = width;
    this.height_ = height;
  }
  /**
   * Checks whether two dimension objects have equal values.
   */
  equals(obj: any): boolean {
    if (obj instanceof Dimension) {
      let d = obj;
      return (this.width_ === d.width_) && (this.height_ === d.height_);
    }
    return false;
  }
  /**
   * Returns the hash code for this {@code Dimension}.
   *
   * @return    a hash code for this {@code Dimension}
   */
  hashCode(): number {
    let sum = (this.width_ + this.height_) | 0;
    return ($J.idiv(Math.imul(sum, ((sum + 1) | 0)), 2) + this.width_) | 0;
  }
  /**
   * Returns a string representation of the values of this
   * {@code Dimension} object's {@code height} and
   * {@code width} fields. This method is intended to be used only
   * for debugging purposes, and the content and format of the returned
   * string may vary between implementations. The returned string may be
   * empty but may not be {@code null}.
   *
   * @return  a string representation of this {@code Dimension}
   *          object
   */
  toString(): string {
    return $J.getClass(this).getName() + '[width=' + this.width_ + ',height=' + this.height_ + ']';
  }
  static $clinit() {
    Toolkit.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      Dimension.initIDs();
    }
  }
}

$J.define(Dimension, 'java.awt.Dimension', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.geom.Dimension2D', ctors: { 'int,int': '_Dimension$int$int', 'java.awt.Dimension': '_Dimension$Dimension', '': '_Dimension$' }, meths: { 'setSize(int,int)': 'setSize$int$int', 'setSize(java.awt.Dimension)': 'setSize$Dimension', 'setSize(double,double)': 'setSize$double$double' }, clinit: true, lazy: [] });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
});
