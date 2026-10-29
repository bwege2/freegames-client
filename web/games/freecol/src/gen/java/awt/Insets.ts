// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Insets.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, CloneNotSupportedException, InternalError, JObject, Toolkit } from '../../../jre/index.ts';

let GraphicsEnvironment;

/**
 * An {@code Insets} object is a representation of the borders
 * of a container. It specifies the space that a container must leave
 * at each of its edges. The space can be a border, a blank space, or
 * a title.
 *
 * @author      Arthur van Hoff
 * @author      Sami Shaio
 * @see         java.awt.LayoutManager
 * @see         java.awt.Container
 * @since       1.0
 */
export class Insets extends JObject {
  /**
   * The inset from the top.
   * This value is added to the Top of the rectangle
   * to yield a new location for the Top.
   *
   * @serial
   * @see #clone()
   */
  top: number = 0;
  /**
   * The inset from the left.
   * This value is added to the Left of the rectangle
   * to yield a new location for the Left edge.
   *
   * @serial
   * @see #clone()
   */
  left: number = 0;
  /**
   * The inset from the bottom.
   * This value is subtracted from the Bottom of the rectangle
   * to yield a new location for the Bottom.
   *
   * @serial
   * @see #clone()
   */
  bottom: number = 0;
  /**
   * The inset from the right.
   * This value is subtracted from the Right of the rectangle
   * to yield a new location for the Right edge.
   *
   * @serial
   * @see #clone()
   */
  right: number = 0;
  /**
   * Creates and initializes a new {@code Insets} object with the
   * specified top, left, bottom, and right insets.
   * @param       top   the inset from the top.
   * @param       left   the inset from the left.
   * @param       bottom   the inset from the bottom.
   * @param       right   the inset from the right.
   */
  _Insets(top: number, left: number, bottom: number, right: number): this {
    this.top = top;
    this.left = left;
    this.bottom = bottom;
    this.right = right;
    return this;
  }
  /**
   * Set top, left, bottom, and right to the specified values
   *
   * @param       top   the inset from the top.
   * @param       left   the inset from the left.
   * @param       bottom   the inset from the bottom.
   * @param       right   the inset from the right.
   * @since 1.5
   */
  set(top: number, left: number, bottom: number, right: number): void {
    this.top = top;
    this.left = left;
    this.bottom = bottom;
    this.right = right;
  }
  /**
   * Checks whether two insets objects are equal. Two instances
   * of {@code Insets} are equal if the four integer values
   * of the fields {@code top}, {@code left},
   * {@code bottom}, and {@code right} are all equal.
   * @return      {@code true} if the two insets are equal;
   *                          otherwise {@code false}.
   * @since       1.1
   */
  equals(obj: any): boolean {
    if (obj instanceof Insets) {
      let insets = obj;
      return ((this.top === insets.top) && (this.left === insets.left) && (this.bottom === insets.bottom) && (this.right === insets.right));
    }
    return false;
  }
  /**
   * Returns the hash code for this Insets.
   *
   * @return    a hash code for this Insets.
   */
  hashCode(): number {
    let sum1 = (this.left + this.bottom) | 0;
    let sum2 = (this.right + this.top) | 0;
    let val1 = ($J.idiv(Math.imul(sum1, ((sum1 + 1) | 0)), 2) + this.left) | 0;
    let val2 = ($J.idiv(Math.imul(sum2, ((sum2 + 1) | 0)), 2) + this.top) | 0;
    let sum3 = (val1 + val2) | 0;
    return ($J.idiv(Math.imul(sum3, ((sum3 + 1) | 0)), 2) + val2) | 0;
  }
  /**
   * Returns a string representation of this {@code Insets} object.
   * This method is intended to be used only for debugging purposes, and
   * the content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not be
   * {@code null}.
   *
   * @return  a string representation of this {@code Insets} object.
   */
  toString(): string {
    return $J.getClass(this).getName() + '[top=' + this.top + ',left=' + this.left + ',bottom=' + this.bottom + ',right=' + this.right + ']';
  }
  /**
   * Create a copy of this object.
   * @return     a copy of this {@code Insets} object.
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
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.Insets', 'initIDs', this, $a);
  }
  static $clinit() {
    Toolkit.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      Insets.initIDs();
    }
  }
}

$J.define(Insets, 'java.awt.Insets', { kind: 'class', ifaces: ['java.lang.Cloneable', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int,int,int,int': '_Insets' }, clinit: true, lazy: [] });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
});
