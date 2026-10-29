// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/EllipseIterator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, NoSuchElementException } from '../../../../jre/index.ts';

let PathIterator;

/**
 * A utility class to iterate over the path segments of an ellipse
 * through the PathIterator interface.
 *
 * @author      Jim Graham
 */
export class EllipseIterator extends JObject {
  x_: number = 0;
  y_: number = 0;
  w: number = 0;
  h: number = 0;
  affine: AffineTransform = null;
  index_: number = 0;
  static readonly CtrlVal: number = 0.5522847498307933;
  static readonly pcv: number = 0.7761423749153966;
  static readonly ncv: number = 0.22385762508460333;
  static ctrlpts: number[][] = null;
  _EllipseIterator(e: Ellipse2D, at: AffineTransform): this {
    this.x_ = e.getX();
    this.y_ = e.getY();
    this.w = e.getWidth();
    this.h = e.getHeight();
    this.affine = at;
    if (this.w < 0 || this.h < 0) {
      this.index_ = 6;
    }
    return this;
  }
  /**
   * Return the winding rule for determining the insideness of the
   * path.
   * @see #WIND_EVEN_ODD
   * @see #WIND_NON_ZERO
   */
  getWindingRule(): number {
    return PathIterator.WIND_NON_ZERO;
  }
  /**
   * Tests if there are more points to read.
   * @return true if there are more points to read
   */
  isDone(): boolean {
    return this.index_ > 5;
  }
  /**
   * Moves the iterator to the next segment of the path forwards
   * along the primary direction of traversal as long as there are
   * more points in that direction.
   */
  next$(): void {
    this.index_++;
  }
  /**
   * Returns the coordinates and type of the current path segment in
   * the iteration.
   * The return value is the path segment type:
   * SEG_MOVETO, SEG_LINETO, SEG_QUADTO, SEG_CUBICTO, or SEG_CLOSE.
   * A float array of length 6 must be passed in and may be used to
   * store the coordinates of the point(s).
   * Each point is stored as a pair of float x,y coordinates.
   * SEG_MOVETO and SEG_LINETO types will return one point,
   * SEG_QUADTO will return two points,
   * SEG_CUBICTO will return 3 points
   * and SEG_CLOSE will not return any points.
   * @see #SEG_MOVETO
   * @see #SEG_LINETO
   * @see #SEG_QUADTO
   * @see #SEG_CUBICTO
   * @see #SEG_CLOSE
   */
  currentSegment$floatArr(coords: number[]): number {
    if (this.isDone()) {
      throw new NoSuchElementException('ellipse iterator out of bounds');
    }
    if (this.index_ === 5) {
      return PathIterator.SEG_CLOSE;
    }
    if (this.index_ === 0) {
      let ctrls = EllipseIterator.ctrlpts[3];
      coords[0] = Math.fround((this.x_ + ctrls[4] * this.w));
      coords[1] = Math.fround((this.y_ + ctrls[5] * this.h));
      if (this.affine != null) {
        this.affine.transform$floatArr$int$floatArr$int$int(coords, 0, coords, 0, 1);
      }
      return PathIterator.SEG_MOVETO;
    }
    let ctrls = EllipseIterator.ctrlpts[(this.index_ - 1) | 0];
    coords[0] = Math.fround((this.x_ + ctrls[0] * this.w));
    coords[1] = Math.fround((this.y_ + ctrls[1] * this.h));
    coords[2] = Math.fround((this.x_ + ctrls[2] * this.w));
    coords[3] = Math.fround((this.y_ + ctrls[3] * this.h));
    coords[4] = Math.fround((this.x_ + ctrls[4] * this.w));
    coords[5] = Math.fround((this.y_ + ctrls[5] * this.h));
    if (this.affine != null) {
      this.affine.transform$floatArr$int$floatArr$int$int(coords, 0, coords, 0, 3);
    }
    return PathIterator.SEG_CUBICTO;
  }
  /**
   * Returns the coordinates and type of the current path segment in
   * the iteration.
   * The return value is the path segment type:
   * SEG_MOVETO, SEG_LINETO, SEG_QUADTO, SEG_CUBICTO, or SEG_CLOSE.
   * A double array of length 6 must be passed in and may be used to
   * store the coordinates of the point(s).
   * Each point is stored as a pair of double x,y coordinates.
   * SEG_MOVETO and SEG_LINETO types will return one point,
   * SEG_QUADTO will return two points,
   * SEG_CUBICTO will return 3 points
   * and SEG_CLOSE will not return any points.
   * @see #SEG_MOVETO
   * @see #SEG_LINETO
   * @see #SEG_QUADTO
   * @see #SEG_CUBICTO
   * @see #SEG_CLOSE
   */
  currentSegment$doubleArr(coords: number[]): number {
    if (this.isDone()) {
      throw new NoSuchElementException('ellipse iterator out of bounds');
    }
    if (this.index_ === 5) {
      return PathIterator.SEG_CLOSE;
    }
    if (this.index_ === 0) {
      let ctrls = EllipseIterator.ctrlpts[3];
      coords[0] = this.x_ + ctrls[4] * this.w;
      coords[1] = this.y_ + ctrls[5] * this.h;
      if (this.affine != null) {
        this.affine.transform$doubleArr$int$doubleArr$int$int(coords, 0, coords, 0, 1);
      }
      return PathIterator.SEG_MOVETO;
    }
    let ctrls = EllipseIterator.ctrlpts[(this.index_ - 1) | 0];
    coords[0] = this.x_ + ctrls[0] * this.w;
    coords[1] = this.y_ + ctrls[1] * this.h;
    coords[2] = this.x_ + ctrls[2] * this.w;
    coords[3] = this.y_ + ctrls[3] * this.h;
    coords[4] = this.x_ + ctrls[4] * this.w;
    coords[5] = this.y_ + ctrls[5] * this.h;
    if (this.affine != null) {
      this.affine.transform$doubleArr$int$doubleArr$int$int(coords, 0, coords, 0, 3);
    }
    return PathIterator.SEG_CUBICTO;
  }
  static $clinit() {
    EllipseIterator.ctrlpts = [[1, EllipseIterator.pcv, EllipseIterator.pcv, 1, 0.5, 1], [EllipseIterator.ncv, 1, 0, EllipseIterator.pcv, 0, 0.5], [0, EllipseIterator.ncv, EllipseIterator.ncv, 0, 0.5, 0], [EllipseIterator.pcv, 0, 1, EllipseIterator.ncv, 1, 0.5]];
  }
}

$J.define(EllipseIterator, 'java.awt.geom.EllipseIterator', { kind: 'class', ifaces: ['java.awt.geom.PathIterator'], sup: 'java.lang.Object', ctors: { 'java.awt.geom.Ellipse2D,java.awt.geom.AffineTransform': '_EllipseIterator' }, meths: { 'currentSegment(double[])': 'currentSegment$doubleArr', 'currentSegment(float[])': 'currentSegment$floatArr', 'next()': 'next$' }, clinit: true, lazy: ['ctrlpts'] });
$J.module(() => {
  PathIterator = $J.load('java.awt.geom.PathIterator');
});
