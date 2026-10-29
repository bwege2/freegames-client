// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/RoundRectIterator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * A utility class to iterate over the path segments of an rounded rectangle
 * through the PathIterator interface.
 *
 * @author      Jim Graham
 */
export class RoundRectIterator extends JObject {
  x_: number = 0;
  y_: number = 0;
  w: number = 0;
  h: number = 0;
  aw: number = 0;
  ah: number = 0;
  affine: AffineTransform = null;
  index_: number = 0;
  static readonly angle: number = 0.7853981633974483;
  static a: number = 0;
  static b: number = 0;
  static c: number = 0;
  static cv: number = 0;
  static acv: number = 0;
  static ctrlpts: number[][] = null;
  static types: number[] = null;
  _RoundRectIterator(rr: RoundRectangle2D, at: AffineTransform): this {
    this.x_ = rr.getX();
    this.y_ = rr.getY();
    this.w = rr.getWidth();
    this.h = rr.getHeight();
    this.aw = Math.min(this.w, Math.abs(rr.getArcWidth()));
    this.ah = Math.min(this.h, Math.abs(rr.getArcHeight()));
    this.affine = at;
    if (this.aw < 0 || this.ah < 0) {
      this.index_ = RoundRectIterator.ctrlpts.length;
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
    return this.index_ >= RoundRectIterator.ctrlpts.length;
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
      throw new NoSuchElementException('roundrect iterator out of bounds');
    }
    let ctrls = RoundRectIterator.ctrlpts[this.index_];
    let nc = 0;
    for (let i = 0; i < ctrls.length; i = (i + 4) | 0) {
      coords[nc++] = Math.fround((this.x_ + (ctrls[(i + 0) | 0]) * this.w + (ctrls[(i + 1) | 0]) * this.aw));
      coords[nc++] = Math.fround((this.y_ + (ctrls[(i + 2) | 0]) * this.h + (ctrls[(i + 3) | 0]) * this.ah));
    }
    if (this.affine != null) {
      this.affine.transform$floatArr$int$floatArr$int$int(coords, 0, coords, 0, $J.idiv(nc, 2));
    }
    return RoundRectIterator.types[this.index_];
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
      throw new NoSuchElementException('roundrect iterator out of bounds');
    }
    let ctrls = RoundRectIterator.ctrlpts[this.index_];
    let nc = 0;
    for (let i = 0; i < ctrls.length; i = (i + 4) | 0) {
      coords[nc++] = (this.x_ + (ctrls[(i + 0) | 0]) * this.w + (ctrls[(i + 1) | 0]) * this.aw);
      coords[nc++] = (this.y_ + (ctrls[(i + 2) | 0]) * this.h + (ctrls[(i + 3) | 0]) * this.ah);
    }
    if (this.affine != null) {
      this.affine.transform$doubleArr$int$doubleArr$int$int(coords, 0, coords, 0, $J.idiv(nc, 2));
    }
    return RoundRectIterator.types[this.index_];
  }
  static $clinit() {
    RoundRectIterator.a = 1 - Math.cos(RoundRectIterator.angle);
    RoundRectIterator.b = Math.tan(RoundRectIterator.angle);
    RoundRectIterator.c = Math.sqrt(1 + RoundRectIterator.b * RoundRectIterator.b) - 1 + RoundRectIterator.a;
    RoundRectIterator.cv = 4 / 3 * RoundRectIterator.a * RoundRectIterator.b / RoundRectIterator.c;
    RoundRectIterator.acv = (1 - RoundRectIterator.cv) / 2;
    RoundRectIterator.ctrlpts = [[0, 0, 0, 0.5], [0, 0, 1, -0.5], [0, 0, 1, -RoundRectIterator.acv, 0, RoundRectIterator.acv, 1, 0, 0, 0.5, 1, 0], [1, -0.5, 1, 0], [1, -RoundRectIterator.acv, 1, 0, 1, 0, 1, -RoundRectIterator.acv, 1, 0, 1, -0.5], [1, 0, 0, 0.5], [1, 0, 0, RoundRectIterator.acv, 1, -RoundRectIterator.acv, 0, 0, 1, -0.5, 0, 0], [0, 0.5, 0, 0], [0, RoundRectIterator.acv, 0, 0, 0, 0, 0, RoundRectIterator.acv, 0, 0, 0, 0.5], []];
    RoundRectIterator.types = [PathIterator.SEG_MOVETO, PathIterator.SEG_LINETO, PathIterator.SEG_CUBICTO, PathIterator.SEG_LINETO, PathIterator.SEG_CUBICTO, PathIterator.SEG_LINETO, PathIterator.SEG_CUBICTO, PathIterator.SEG_LINETO, PathIterator.SEG_CUBICTO, PathIterator.SEG_CLOSE];
  }
}

$J.define(RoundRectIterator, 'java.awt.geom.RoundRectIterator', { kind: 'class', ifaces: ['java.awt.geom.PathIterator'], sup: 'java.lang.Object', ctors: { 'java.awt.geom.RoundRectangle2D,java.awt.geom.AffineTransform': '_RoundRectIterator' }, meths: { 'currentSegment(double[])': 'currentSegment$doubleArr', 'currentSegment(float[])': 'currentSegment$floatArr', 'next()': 'next$' }, clinit: true, lazy: ['a', 'b', 'c', 'cv', 'acv', 'ctrlpts', 'types'] });
$J.module(() => {
  PathIterator = $J.load('java.awt.geom.PathIterator');
});
