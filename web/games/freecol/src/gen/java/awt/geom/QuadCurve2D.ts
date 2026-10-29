// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/QuadCurve2D.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../jre/index.ts';

let Line2D;

/**
 * The {@code QuadCurve2D} class defines a quadratic parametric curve
 * segment in {@code (x,y)} coordinate space.
 * <p>
 * This class is only the abstract superclass for all objects that
 * store a 2D quadratic curve segment.
 * The actual storage representation of the coordinates is left to
 * the subclass.
 *
 * @author      Jim Graham
 * @since 1.2
 */
export class QuadCurve2D extends JObject {
  static readonly BELOW: number = -2;
  static readonly LOWEDGE: number = -1;
  static readonly INSIDE: number = 0;
  static readonly HIGHEDGE: number = 1;
  static readonly ABOVE: number = 2;
  /**
   * Returns the square of the flatness, or maximum distance of a
   * control point from the line connecting the end points, of the
   * quadratic curve specified by the control points stored in the
   * indicated array at the indicated index.
   * @param coords an array containing coordinate values
   * @param offset the index into {@code coords} from which to
   *          to start getting the values from the array
   * @return the flatness of the quadratic curve that is defined by the
   *          values in the specified array at the specified index.
   * @since 1.2
   */
  static getFlatnessSq$doubleArr$int(coords: number[], offset: number): number {
    return Line2D.ptSegDistSq(coords[(offset + 0) | 0], coords[(offset + 1) | 0], coords[(offset + 4) | 0], coords[(offset + 5) | 0], coords[(offset + 2) | 0], coords[(offset + 3) | 0]);
  }
  /**
   * Subdivides the quadratic curve specified by the coordinates
   * stored in the {@code src} array at indices
   * {@code srcoff} through {@code srcoff}&nbsp;+&nbsp;5
   * and stores the resulting two subdivided curves into the two
   * result arrays at the corresponding indices.
   * Either or both of the {@code left} and {@code right}
   * arrays can be {@code null} or a reference to the same array
   * and offset as the {@code src} array.
   * Note that the last point in the first subdivided curve is the
   * same as the first point in the second subdivided curve.  Thus,
   * it is possible to pass the same array for {@code left} and
   * {@code right} and to use offsets such that
   * {@code rightoff} equals {@code leftoff} + 4 in order
   * to avoid allocating extra storage for this common point.
   * @param src the array holding the coordinates for the source curve
   * @param srcoff the offset into the array of the beginning of the
   * the 6 source coordinates
   * @param left the array for storing the coordinates for the first
   * half of the subdivided curve
   * @param leftoff the offset into the array of the beginning of the
   * the 6 left coordinates
   * @param right the array for storing the coordinates for the second
   * half of the subdivided curve
   * @param rightoff the offset into the array of the beginning of the
   * the 6 right coordinates
   * @since 1.2
   */
  static subdivide$doubleArr$int$doubleArr$int$doubleArr$int(src: number[], srcoff: number, left: number[], leftoff: number, right: number[], rightoff: number): void {
    let x1 = src[(srcoff + 0) | 0];
    let y1 = src[(srcoff + 1) | 0];
    let ctrlx = src[(srcoff + 2) | 0];
    let ctrly = src[(srcoff + 3) | 0];
    let x2 = src[(srcoff + 4) | 0];
    let y2 = src[(srcoff + 5) | 0];
    if (left != null) {
      (left[(leftoff + 0) | 0]) = x1;
      (left[(leftoff + 1) | 0]) = y1;
    }
    if (right != null) {
      (right[(rightoff + 4) | 0]) = x2;
      (right[(rightoff + 5) | 0]) = y2;
    }
    x1 = (x1 + ctrlx) / 2;
    y1 = (y1 + ctrly) / 2;
    x2 = (x2 + ctrlx) / 2;
    y2 = (y2 + ctrly) / 2;
    ctrlx = (x1 + x2) / 2;
    ctrly = (y1 + y2) / 2;
    if (left != null) {
      (left[(leftoff + 2) | 0]) = x1;
      (left[(leftoff + 3) | 0]) = y1;
      (left[(leftoff + 4) | 0]) = ctrlx;
      (left[(leftoff + 5) | 0]) = ctrly;
    }
    if (right != null) {
      (right[(rightoff + 0) | 0]) = ctrlx;
      (right[(rightoff + 1) | 0]) = ctrly;
      (right[(rightoff + 2) | 0]) = x2;
      (right[(rightoff + 3) | 0]) = y2;
    }
  }
  /**
   * Solves the quadratic whose coefficients are in the {@code eqn}
   * array and places the non-complex roots into the {@code res}
   * array, returning the number of roots.
   * The quadratic solved is represented by the equation:
   * <pre>
   *     eqn = {C, B, A};
   *     ax^2 + bx + c = 0
   * </pre>
   * A return value of {@code -1} is used to distinguish a constant
   * equation, which might be always 0 or never 0, from an equation that
   * has no zeroes.
   * @param eqn the specified array of coefficients to use to solve
   *        the quadratic equation
   * @param res the array that contains the non-complex roots
   *        resulting from the solution of the quadratic equation
   * @return the number of roots, or {@code -1} if the equation is
   *  a constant.
   * @since 1.3
   */
  static solveQuadratic$doubleArr$doubleArr(eqn: number[], res: number[]): number {
    let a = eqn[2];
    let b = eqn[1];
    let c = eqn[0];
    let roots = 0;
    if (a === 0) {
      if (b === 0) {
        return -1;
      }
      res[roots++] = -c / b;
    } else {
      let d = b * b - 4 * a * c;
      if (d < 0) {
        return 0;
      }
      d = Math.sqrt(d);
      if (b < 0) {
        d = -d;
      }
      let q = (b + d) / -2;
      res[roots++] = q / a;
      if (q !== 0) {
        res[roots++] = c / q;
      }
    }
    return roots;
  }
}

$J.define(QuadCurve2D, 'java.awt.geom.QuadCurve2D', { kind: 'class', ifaces: ['java.awt.Shape', 'java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { '': '_QuadCurve2D' }, meths: { 'getPathIterator(java.awt.geom.AffineTransform,double)': 'getPathIterator$AffineTransform$double', 'getPathIterator(java.awt.geom.AffineTransform)': 'getPathIterator$AffineTransform', 'contains(java.awt.geom.Rectangle2D)': 'contains$Rectangle2D', 'contains(double,double,double,double)': 'contains$double$double$double$double', 'intersects(java.awt.geom.Rectangle2D)': 'intersects$Rectangle2D', 'intersects(double,double,double,double)': 'intersects$double$double$double$double', 'contains(java.awt.geom.Point2D)': 'contains$Point2D', 'contains(double,double)': 'contains$double$double', 'solveQuadratic(double[],double[])': 'solveQuadratic$doubleArr$doubleArr', 'solveQuadratic(double[])': 'solveQuadratic$doubleArr', 'subdivide(double[],int,double[],int,double[],int)': 'subdivide$doubleArr$int$doubleArr$int$doubleArr$int', 'subdivide(java.awt.geom.QuadCurve2D,java.awt.geom.QuadCurve2D,java.awt.geom.QuadCurve2D)': 'subdivide$QuadCurve2D$QuadCurve2D$QuadCurve2D', 'getFlatness(double[],int)': 'getFlatness$doubleArr$int', 'getFlatnessSq(double[],int)': 'getFlatnessSq$doubleArr$int', 'getFlatness(double,double,double,double,double,double)': 'getFlatness$double$double$double$double$double$double', 'getFlatnessSq(double,double,double,double,double,double)': 'getFlatnessSq$double$double$double$double$double$double', 'setCurve(java.awt.geom.QuadCurve2D)': 'setCurve$QuadCurve2D', 'setCurve(java.awt.geom.Point2D[],int)': 'setCurve$Point2DArr$int', 'setCurve(java.awt.geom.Point2D,java.awt.geom.Point2D,java.awt.geom.Point2D)': 'setCurve$Point2D$Point2D$Point2D', 'setCurve(double[],int)': 'setCurve$doubleArr$int', 'setCurve(double,double,double,double,double,double)': 'setCurve$double$double$double$double$double$double' } });
$J.module(() => {
  Line2D = $J.load('java.awt.geom.Line2D');
});
