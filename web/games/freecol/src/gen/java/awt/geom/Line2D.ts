// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/Line2D.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

/**
 * This {@code Line2D} represents a line segment in {@code (x,y)}
 * coordinate space.
 * <p>
 * This class is only the abstract superclass for all objects that
 * store a 2D line segment.
 * The actual storage representation of the coordinates is left to
 * the subclass.
 *
 * @author      Jim Graham
 * @since 1.2
 */
export class Line2D extends JObject {
  /**
   * Returns the square of the distance from a point to a line segment.
   * The distance measured is the distance between the specified
   * point and the closest point between the specified end points.
   * If the specified point intersects the line segment in between the
   * end points, this method returns 0.0.
   *
   * @param x1 the X coordinate of the start point of the
   *           specified line segment
   * @param y1 the Y coordinate of the start point of the
   *           specified line segment
   * @param x2 the X coordinate of the end point of the
   *           specified line segment
   * @param y2 the Y coordinate of the end point of the
   *           specified line segment
   * @param px the X coordinate of the specified point being
   *           measured against the specified line segment
   * @param py the Y coordinate of the specified point being
   *           measured against the specified line segment
   * @return a double value that is the square of the distance from the
   *                  specified point to the specified line segment.
   * @see #ptLineDistSq(double, double, double, double, double, double)
   * @since 1.2
   */
  static ptSegDistSq(x1: number, y1: number, x2: number, y2: number, px: number, py: number): number {
    x2 -= x1;
    y2 -= y1;
    px -= x1;
    py -= y1;
    let dotprod = px * x2 + py * y2;
    let projlenSq: number;
    if (dotprod <= 0) {
      projlenSq = 0;
    } else {
      px = x2 - px;
      py = y2 - py;
      dotprod = px * x2 + py * y2;
      if (dotprod <= 0) {
        projlenSq = 0;
      } else {
        projlenSq = dotprod * dotprod / (x2 * x2 + y2 * y2);
      }
    }
    let lenSq = px * px + py * py - projlenSq;
    if (lenSq < 0) {
      lenSq = 0;
    }
    return lenSq;
  }
}

$J.define(Line2D, 'java.awt.geom.Line2D', { kind: 'class', ifaces: ['java.awt.Shape', 'java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { '': '_Line2D' }, meths: { 'getPathIterator(java.awt.geom.AffineTransform,double)': 'getPathIterator$AffineTransform$double', 'getPathIterator(java.awt.geom.AffineTransform)': 'getPathIterator$AffineTransform', 'contains(java.awt.geom.Rectangle2D)': 'contains$Rectangle2D', 'contains(double,double,double,double)': 'contains$double$double$double$double', 'intersects(java.awt.geom.Rectangle2D)': 'intersects$Rectangle2D', 'intersects(double,double,double,double)': 'intersects$double$double$double$double', 'contains(java.awt.geom.Point2D)': 'contains$Point2D', 'contains(double,double)': 'contains$double$double', 'ptLineDist(java.awt.geom.Point2D)': 'ptLineDist$Point2D', 'ptLineDist(double,double)': 'ptLineDist$double$double', 'ptLineDistSq(java.awt.geom.Point2D)': 'ptLineDistSq$Point2D', 'ptLineDistSq(double,double)': 'ptLineDistSq$double$double', 'ptSegDist(java.awt.geom.Point2D)': 'ptSegDist$Point2D', 'ptSegDist(double,double)': 'ptSegDist$double$double', 'ptSegDistSq(java.awt.geom.Point2D)': 'ptSegDistSq$Point2D', 'ptSegDistSq(double,double)': 'ptSegDistSq$double$double', 'intersectsLine(java.awt.geom.Line2D)': 'intersectsLine$Line2D', 'intersectsLine(double,double,double,double)': 'intersectsLine$double$double$double$double', 'relativeCCW(java.awt.geom.Point2D)': 'relativeCCW$Point2D', 'relativeCCW(double,double)': 'relativeCCW$double$double', 'setLine(java.awt.geom.Line2D)': 'setLine$Line2D', 'setLine(java.awt.geom.Point2D,java.awt.geom.Point2D)': 'setLine$Point2D$Point2D', 'setLine(double,double,double,double)': 'setLine$double$double$double$double' } });
