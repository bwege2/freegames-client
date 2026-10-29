// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/FlatteningPathIterator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject, NoSuchElementException } from '../../../../jre/index.ts';

let CubicCurve2D, PathIterator, QuadCurve2D;

/**
 * The {@code FlatteningPathIterator} class returns a flattened view of
 * another {@link PathIterator} object.  Other {@link java.awt.Shape Shape}
 * classes can use this class to provide flattening behavior for their paths
 * without having to perform the interpolation calculations themselves.
 *
 * @author Jim Graham
 */
export class FlatteningPathIterator extends JObject {
  static readonly GROW_SIZE: number = 24;
  src: PathIterator = null;
  squareflat: number = 0;
  limit_: number = 0;
  hold: number[] = null;
  curx: number = 0;
  cury: number = 0;
  movx: number = 0;
  movy: number = 0;
  holdType: number = 0;
  holdEnd: number = 0;
  holdIndex: number = 0;
  levels: number[] = null;
  levelIndex: number = 0;
  done_: boolean = false;
  $init_FlatteningPathIterator() {
    this.hold = $J.newArray(14, 0);
  }
  /**
   * Constructs a new {@code FlatteningPathIterator} object that
   * flattens a path as it iterates over it.  The iterator does not
   * subdivide any curve read from the source iterator to more than
   * 10 levels of subdivision which yields a maximum of 1024 line
   * segments per curve.
   * @param src the original unflattened path being iterated over
   * @param flatness the maximum allowable distance between the
   * control points and the flattened curve
   */
  _FlatteningPathIterator$PathIterator$double(src: PathIterator, flatness: number): this {
    this._FlatteningPathIterator$PathIterator$double$int(src, flatness, 10);
    return this;
  }
  /**
   * Constructs a new {@code FlatteningPathIterator} object
   * that flattens a path as it iterates over it.
   * The {@code limit} parameter allows you to control the
   * maximum number of recursive subdivisions that the iterator
   * can make before it assumes that the curve is flat enough
   * without measuring against the {@code flatness} parameter.
   * The flattened iteration therefore never generates more than
   * a maximum of {@code (2^limit)} line segments per curve.
   * @param src the original unflattened path being iterated over
   * @param flatness the maximum allowable distance between the
   * control points and the flattened curve
   * @param limit the maximum number of recursive subdivisions
   * allowed for any curved segment
   * @throws IllegalArgumentException if
   *          {@code flatness} or {@code limit}
   *          is less than zero
   */
  _FlatteningPathIterator$PathIterator$double$int(src: PathIterator, flatness: number, limit: number): this {
    this.$init_FlatteningPathIterator();
    if (flatness < 0) {
      throw new IllegalArgumentException('flatness must be >= 0');
    }
    if (limit < 0) {
      throw new IllegalArgumentException('limit must be >= 0');
    }
    this.src = src;
    this.squareflat = flatness * flatness;
    this.limit_ = limit;
    this.levels = $J.newArray((limit + 1) | 0, 0);
    this.next$boolean$FlatteningPathIterator(false);
    return this;
  }
  /**
   * Returns the winding rule for determining the interior of the
   * path.
   * @return the winding rule of the original unflattened path being
   * iterated over.
   * @see PathIterator#WIND_EVEN_ODD
   * @see PathIterator#WIND_NON_ZERO
   */
  getWindingRule(): number {
    return this.src.getWindingRule();
  }
  /**
   * Tests if the iteration is complete.
   * @return {@code true} if all the segments have
   * been read; {@code false} otherwise.
   */
  isDone(): boolean {
    return this.done_;
  }
  ensureHoldCapacity(want: number): void {
    if (((this.holdIndex - want) | 0) < 0) {
      let have = (this.hold.length - this.holdIndex) | 0;
      let newsize = (this.hold.length + FlatteningPathIterator.GROW_SIZE) | 0;
      let newhold = $J.newArray(newsize, 0);
      $J.system_arraycopy(this.hold, this.holdIndex, newhold, (this.holdIndex + FlatteningPathIterator.GROW_SIZE) | 0, have);
      this.hold = newhold;
      this.holdIndex = (this.holdIndex + FlatteningPathIterator.GROW_SIZE) | 0;
      this.holdEnd = (this.holdEnd + FlatteningPathIterator.GROW_SIZE) | 0;
    }
  }
  /**
   * Moves the iterator to the next segment of the path forwards
   * along the primary direction of traversal as long as there are
   * more points in that direction.
   */
  next$(): void {
    this.next$boolean$FlatteningPathIterator(true);
  }
  next$boolean$FlatteningPathIterator(doNext: boolean): void {
    let level: number;
    if (this.holdIndex >= this.holdEnd) {
      if (doNext) {
        this.src.next$();
      }
      if (this.src.isDone()) {
        this.done_ = true;
        return;
      }
      this.holdType = this.src.currentSegment$doubleArr(this.hold);
      this.levelIndex = 0;
      this.levels[0] = 0;
    }
    switch (this.holdType) {
      case PathIterator.SEG_MOVETO:
      case PathIterator.SEG_LINETO:
        this.curx = this.hold[0];
        this.cury = this.hold[1];
        if (this.holdType === PathIterator.SEG_MOVETO) {
          this.movx = this.curx;
          this.movy = this.cury;
        }
        this.holdIndex = 0;
        this.holdEnd = 0;
        break;
      case PathIterator.SEG_CLOSE:
        this.curx = this.movx;
        this.cury = this.movy;
        this.holdIndex = 0;
        this.holdEnd = 0;
        break;
      case PathIterator.SEG_QUADTO:
        if (this.holdIndex >= this.holdEnd) {
          this.holdIndex = (this.hold.length - 6) | 0;
          this.holdEnd = (this.hold.length - 2) | 0;
          (this.hold[(this.holdIndex + 0) | 0]) = this.curx;
          (this.hold[(this.holdIndex + 1) | 0]) = this.cury;
          (this.hold[(this.holdIndex + 2) | 0]) = this.hold[0];
          (this.hold[(this.holdIndex + 3) | 0]) = this.hold[1];
          (this.hold[(this.holdIndex + 4) | 0]) = this.curx = this.hold[2];
          (this.hold[(this.holdIndex + 5) | 0]) = this.cury = this.hold[3];
        }
        level = this.levels[this.levelIndex];
        while (level < this.limit_) {
          if (QuadCurve2D.getFlatnessSq$doubleArr$int(this.hold, this.holdIndex) < this.squareflat) {
            break;
          }
          this.ensureHoldCapacity(4);
          QuadCurve2D.subdivide$doubleArr$int$doubleArr$int$doubleArr$int(this.hold, this.holdIndex, this.hold, (this.holdIndex - 4) | 0, this.hold, this.holdIndex);
          this.holdIndex = (this.holdIndex - 4) | 0;
          level++;
          this.levels[this.levelIndex] = level;
          this.levelIndex++;
          this.levels[this.levelIndex] = level;
        }
        this.holdIndex = (this.holdIndex + 4) | 0;
        this.levelIndex--;
        break;
      case PathIterator.SEG_CUBICTO:
        if (this.holdIndex >= this.holdEnd) {
          this.holdIndex = (this.hold.length - 8) | 0;
          this.holdEnd = (this.hold.length - 2) | 0;
          (this.hold[(this.holdIndex + 0) | 0]) = this.curx;
          (this.hold[(this.holdIndex + 1) | 0]) = this.cury;
          (this.hold[(this.holdIndex + 2) | 0]) = this.hold[0];
          (this.hold[(this.holdIndex + 3) | 0]) = this.hold[1];
          (this.hold[(this.holdIndex + 4) | 0]) = this.hold[2];
          (this.hold[(this.holdIndex + 5) | 0]) = this.hold[3];
          (this.hold[(this.holdIndex + 6) | 0]) = this.curx = this.hold[4];
          (this.hold[(this.holdIndex + 7) | 0]) = this.cury = this.hold[5];
        }
        level = this.levels[this.levelIndex];
        while (level < this.limit_) {
          if (CubicCurve2D.getFlatnessSq$doubleArr$int(this.hold, this.holdIndex) < this.squareflat) {
            break;
          }
          this.ensureHoldCapacity(6);
          CubicCurve2D.subdivide$doubleArr$int$doubleArr$int$doubleArr$int(this.hold, this.holdIndex, this.hold, (this.holdIndex - 6) | 0, this.hold, this.holdIndex);
          this.holdIndex = (this.holdIndex - 6) | 0;
          level++;
          this.levels[this.levelIndex] = level;
          this.levelIndex++;
          this.levels[this.levelIndex] = level;
        }
        this.holdIndex = (this.holdIndex + 6) | 0;
        this.levelIndex--;
        break;
    }
  }
  /**
   * Returns the coordinates and type of the current path segment in
   * the iteration.
   * The return value is the path segment type:
   * SEG_MOVETO, SEG_LINETO, or SEG_CLOSE.
   * A float array of length 6 must be passed in and can be used to
   * store the coordinates of the point(s).
   * Each point is stored as a pair of float x,y coordinates.
   * SEG_MOVETO and SEG_LINETO types return one point,
   * and SEG_CLOSE does not return any points.
   * @param coords an array that holds the data returned from
   * this method
   * @return the path segment type of the current path segment.
   * @throws NoSuchElementException if there
   *          are no more elements in the flattening path to be
   *          returned.
   * @see PathIterator#SEG_MOVETO
   * @see PathIterator#SEG_LINETO
   * @see PathIterator#SEG_CLOSE
   */
  currentSegment$floatArr(coords: number[]): number {
    if (this.isDone()) {
      throw new NoSuchElementException('flattening iterator out of bounds');
    }
    let type$ = this.holdType;
    if (type$ !== PathIterator.SEG_CLOSE) {
      coords[0] = Math.fround(this.hold[(this.holdIndex + 0) | 0]);
      coords[1] = Math.fround(this.hold[(this.holdIndex + 1) | 0]);
      if (type$ !== PathIterator.SEG_MOVETO) {
        type$ = PathIterator.SEG_LINETO;
      }
    }
    return type$;
  }
  /**
   * Returns the coordinates and type of the current path segment in
   * the iteration.
   * The return value is the path segment type:
   * SEG_MOVETO, SEG_LINETO, or SEG_CLOSE.
   * A double array of length 6 must be passed in and can be used to
   * store the coordinates of the point(s).
   * Each point is stored as a pair of double x,y coordinates.
   * SEG_MOVETO and SEG_LINETO types return one point,
   * and SEG_CLOSE does not return any points.
   * @param coords an array that holds the data returned from
   * this method
   * @return the path segment type of the current path segment.
   * @throws NoSuchElementException if there
   *          are no more elements in the flattening path to be
   *          returned.
   * @see PathIterator#SEG_MOVETO
   * @see PathIterator#SEG_LINETO
   * @see PathIterator#SEG_CLOSE
   */
  currentSegment$doubleArr(coords: number[]): number {
    if (this.isDone()) {
      throw new NoSuchElementException('flattening iterator out of bounds');
    }
    let type$ = this.holdType;
    if (type$ !== PathIterator.SEG_CLOSE) {
      coords[0] = this.hold[(this.holdIndex + 0) | 0];
      coords[1] = this.hold[(this.holdIndex + 1) | 0];
      if (type$ !== PathIterator.SEG_MOVETO) {
        type$ = PathIterator.SEG_LINETO;
      }
    }
    return type$;
  }
}

$J.define(FlatteningPathIterator, 'java.awt.geom.FlatteningPathIterator', { kind: 'class', ifaces: ['java.awt.geom.PathIterator'], sup: 'java.lang.Object', ctors: { 'java.awt.geom.PathIterator,double,int': '_FlatteningPathIterator$PathIterator$double$int', 'java.awt.geom.PathIterator,double': '_FlatteningPathIterator$PathIterator$double' }, meths: { 'currentSegment(double[])': 'currentSegment$doubleArr', 'currentSegment(float[])': 'currentSegment$floatArr', 'next(boolean)': 'next$boolean$FlatteningPathIterator', 'next()': 'next$' } });
$J.module(() => {
  CubicCurve2D = $J.load('java.awt.geom.CubicCurve2D');
  PathIterator = $J.load('java.awt.geom.PathIterator');
  QuadCurve2D = $J.load('java.awt.geom.QuadCurve2D');
});
