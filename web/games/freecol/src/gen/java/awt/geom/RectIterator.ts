// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/RectIterator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, Oracle and/or its affiliates. All rights reserved.
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
 * A utility class to iterate over the path segments of a rectangle
 * through the PathIterator interface.
 *
 * @author      Jim Graham
 */
export class RectIterator extends JObject {
  x_: number = 0;
  y_: number = 0;
  w: number = 0;
  h: number = 0;
  affine: AffineTransform = null;
  index_: number = 0;
  _RectIterator(r: Rectangle2D, at: AffineTransform): this {
    this.x_ = r.getX();
    this.y_ = r.getY();
    this.w = r.getWidth();
    this.h = r.getHeight();
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
      throw new NoSuchElementException('rect iterator out of bounds');
    }
    if (this.index_ === 5) {
      return PathIterator.SEG_CLOSE;
    }
    coords[0] = Math.fround(this.x_);
    coords[1] = Math.fround(this.y_);
    if (this.index_ === 1 || this.index_ === 2) {
      coords[0] = Math.fround(coords[0] + Math.fround(this.w));
    }
    if (this.index_ === 2 || this.index_ === 3) {
      coords[1] = Math.fround(coords[1] + Math.fround(this.h));
    }
    if (this.affine != null) {
      this.affine.transform$floatArr$int$floatArr$int$int(coords, 0, coords, 0, 1);
    }
    return (this.index_ === 0 ? PathIterator.SEG_MOVETO : PathIterator.SEG_LINETO);
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
      throw new NoSuchElementException('rect iterator out of bounds');
    }
    if (this.index_ === 5) {
      return PathIterator.SEG_CLOSE;
    }
    coords[0] = this.x_;
    coords[1] = this.y_;
    if (this.index_ === 1 || this.index_ === 2) {
      coords[0] += this.w;
    }
    if (this.index_ === 2 || this.index_ === 3) {
      coords[1] += this.h;
    }
    if (this.affine != null) {
      this.affine.transform$doubleArr$int$doubleArr$int$int(coords, 0, coords, 0, 1);
    }
    return (this.index_ === 0 ? PathIterator.SEG_MOVETO : PathIterator.SEG_LINETO);
  }
}

$J.define(RectIterator, 'java.awt.geom.RectIterator', { kind: 'class', ifaces: ['java.awt.geom.PathIterator'], sup: 'java.lang.Object', ctors: { 'java.awt.geom.Rectangle2D,java.awt.geom.AffineTransform': '_RectIterator' }, meths: { 'currentSegment(double[])': 'currentSegment$doubleArr', 'currentSegment(float[])': 'currentSegment$floatArr', 'next()': 'next$' } });
$J.module(() => {
  PathIterator = $J.load('java.awt.geom.PathIterator');
});
