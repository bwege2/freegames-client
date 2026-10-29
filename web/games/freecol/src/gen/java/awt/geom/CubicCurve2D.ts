// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/CubicCurve2D.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * The {@code CubicCurve2D} class defines a cubic parametric curve
 * segment in {@code (x,y)} coordinate space.
 * <p>
 * This class is only the abstract superclass for all objects which
 * store a 2D cubic curve segment.
 * The actual storage representation of the coordinates is left to
 * the subclass.
 *
 * @author      Jim Graham
 * @since 1.2
 */
export class CubicCurve2D extends JObject {
  /**
   * Returns the square of the flatness of the cubic curve specified
   * by the indicated control points. The flatness is the maximum distance
   * of a control point from the line connecting the end points.
   *
   * @param x1 the X coordinate that specifies the start point
   *           of a {@code CubicCurve2D}
   * @param y1 the Y coordinate that specifies the start point
   *           of a {@code CubicCurve2D}
   * @param ctrlx1 the X coordinate that specifies the first control point
   *               of a {@code CubicCurve2D}
   * @param ctrly1 the Y coordinate that specifies the first control point
   *               of a {@code CubicCurve2D}
   * @param ctrlx2 the X coordinate that specifies the second control point
   *               of a {@code CubicCurve2D}
   * @param ctrly2 the Y coordinate that specifies the second control point
   *               of a {@code CubicCurve2D}
   * @param x2 the X coordinate that specifies the end point
   *           of a {@code CubicCurve2D}
   * @param y2 the Y coordinate that specifies the end point
   *           of a {@code CubicCurve2D}
   * @return the square of the flatness of the {@code CubicCurve2D}
   *          represented by the specified coordinates.
   * @since 1.2
   */
  static getFlatnessSq$double$double$double$double$double$double$double$double(x1: number, y1: number, ctrlx1: number, ctrly1: number, ctrlx2: number, ctrly2: number, x2: number, y2: number): number {
    return Math.max(Line2D.ptSegDistSq(x1, y1, x2, y2, ctrlx1, ctrly1), Line2D.ptSegDistSq(x1, y1, x2, y2, ctrlx2, ctrly2));
  }
  /**
   * Returns the square of the flatness of the cubic curve specified
   * by the control points stored in the indicated array at the
   * indicated index. The flatness is the maximum distance
   * of a control point from the line connecting the end points.
   * @param coords an array containing coordinates
   * @param offset the index of {@code coords} from which to begin
   *          getting the end points and control points of the curve
   * @return the square of the flatness of the {@code CubicCurve2D}
   *          specified by the coordinates in {@code coords} at
   *          the specified offset.
   * @since 1.2
   */
  static getFlatnessSq$doubleArr$int(coords: number[], offset: number): number {
    return CubicCurve2D.getFlatnessSq$double$double$double$double$double$double$double$double(coords[(offset + 0) | 0], coords[(offset + 1) | 0], coords[(offset + 2) | 0], coords[(offset + 3) | 0], coords[(offset + 4) | 0], coords[(offset + 5) | 0], coords[(offset + 6) | 0], coords[(offset + 7) | 0]);
  }
  /**
   * Subdivides the cubic curve specified by the coordinates
   * stored in the {@code src} array at indices {@code srcoff}
   * through ({@code srcoff}&nbsp;+&nbsp;7) and stores the
   * resulting two subdivided curves into the two result arrays at the
   * corresponding indices.
   * Either or both of the {@code left} and {@code right}
   * arrays may be {@code null} or a reference to the same array
   * as the {@code src} array.
   * Note that the last point in the first subdivided curve is the
   * same as the first point in the second subdivided curve. Thus,
   * it is possible to pass the same array for {@code left}
   * and {@code right} and to use offsets, such as {@code rightoff}
   * equals ({@code leftoff} + 6), in order
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
    let ctrlx1 = src[(srcoff + 2) | 0];
    let ctrly1 = src[(srcoff + 3) | 0];
    let ctrlx2 = src[(srcoff + 4) | 0];
    let ctrly2 = src[(srcoff + 5) | 0];
    let x2 = src[(srcoff + 6) | 0];
    let y2 = src[(srcoff + 7) | 0];
    if (left != null) {
      (left[(leftoff + 0) | 0]) = x1;
      (left[(leftoff + 1) | 0]) = y1;
    }
    if (right != null) {
      (right[(rightoff + 6) | 0]) = x2;
      (right[(rightoff + 7) | 0]) = y2;
    }
    x1 = (x1 + ctrlx1) / 2;
    y1 = (y1 + ctrly1) / 2;
    x2 = (x2 + ctrlx2) / 2;
    y2 = (y2 + ctrly2) / 2;
    let centerx = (ctrlx1 + ctrlx2) / 2;
    let centery = (ctrly1 + ctrly2) / 2;
    ctrlx1 = (x1 + centerx) / 2;
    ctrly1 = (y1 + centery) / 2;
    ctrlx2 = (x2 + centerx) / 2;
    ctrly2 = (y2 + centery) / 2;
    centerx = (ctrlx1 + ctrlx2) / 2;
    centery = (ctrly1 + ctrly2) / 2;
    if (left != null) {
      (left[(leftoff + 2) | 0]) = x1;
      (left[(leftoff + 3) | 0]) = y1;
      (left[(leftoff + 4) | 0]) = ctrlx1;
      (left[(leftoff + 5) | 0]) = ctrly1;
      (left[(leftoff + 6) | 0]) = centerx;
      (left[(leftoff + 7) | 0]) = centery;
    }
    if (right != null) {
      (right[(rightoff + 0) | 0]) = centerx;
      (right[(rightoff + 1) | 0]) = centery;
      (right[(rightoff + 2) | 0]) = ctrlx2;
      (right[(rightoff + 3) | 0]) = ctrly2;
      (right[(rightoff + 4) | 0]) = x2;
      (right[(rightoff + 5) | 0]) = y2;
    }
  }
}

$J.define(CubicCurve2D, 'java.awt.geom.CubicCurve2D', { kind: 'class', ifaces: ['java.awt.Shape', 'java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { '': '_CubicCurve2D' }, meths: { 'getPathIterator(java.awt.geom.AffineTransform,double)': 'getPathIterator$AffineTransform$double', 'getPathIterator(java.awt.geom.AffineTransform)': 'getPathIterator$AffineTransform', 'contains(java.awt.geom.Rectangle2D)': 'contains$Rectangle2D', 'contains(double,double,double,double)': 'contains$double$double$double$double', 'intersects(java.awt.geom.Rectangle2D)': 'intersects$Rectangle2D', 'intersects(double,double,double,double)': 'intersects$double$double$double$double', 'contains(java.awt.geom.Point2D)': 'contains$Point2D', 'contains(double,double)': 'contains$double$double', 'solveCubic(double[],double[])': 'solveCubic$doubleArr$doubleArr', 'solveCubic(double[])': 'solveCubic$doubleArr', 'subdivide(double[],int,double[],int,double[],int)': 'subdivide$doubleArr$int$doubleArr$int$doubleArr$int', 'subdivide(java.awt.geom.CubicCurve2D,java.awt.geom.CubicCurve2D,java.awt.geom.CubicCurve2D)': 'subdivide$CubicCurve2D$CubicCurve2D$CubicCurve2D', 'getFlatness(double[],int)': 'getFlatness$doubleArr$int', 'getFlatnessSq(double[],int)': 'getFlatnessSq$doubleArr$int', 'getFlatness(double,double,double,double,double,double,double,double)': 'getFlatness$double$double$double$double$double$double$double$double', 'getFlatnessSq(double,double,double,double,double,double,double,double)': 'getFlatnessSq$double$double$double$double$double$double$double$double', 'setCurve(java.awt.geom.CubicCurve2D)': 'setCurve$CubicCurve2D', 'setCurve(java.awt.geom.Point2D[],int)': 'setCurve$Point2DArr$int', 'setCurve(java.awt.geom.Point2D,java.awt.geom.Point2D,java.awt.geom.Point2D,java.awt.geom.Point2D)': 'setCurve$Point2D$Point2D$Point2D$Point2D', 'setCurve(double[],int)': 'setCurve$doubleArr$int', 'setCurve(double,double,double,double,double,double,double,double)': 'setCurve$double$double$double$double$double$double$double$double' } });
$J.module(() => {
  Line2D = $J.load('java.awt.geom.Line2D');
});
