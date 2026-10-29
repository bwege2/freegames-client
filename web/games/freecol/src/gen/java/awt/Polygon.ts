// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Polygon.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Arrays, IndexOutOfBoundsException, JObject, NegativeArraySizeException } from '../../../jre/index.ts';

let Rectangle, PathIterator, Crossings$EvenOdd;

/**
 * The {@code Polygon} class encapsulates a description of a
 * closed, two-dimensional region within a coordinate space. This
 * region is bounded by an arbitrary number of line segments, each of
 * which is one side of the polygon. Internally, a polygon
 * comprises of a list of {@code (x,y)}
 * coordinate pairs, where each pair defines a <i>vertex</i> of the
 * polygon, and two successive pairs are the endpoints of a
 * line that is a side of the polygon. The first and final
 * pairs of {@code (x,y)} points are joined by a line segment
 * that closes the polygon.  This {@code Polygon} is defined with
 * an even-odd winding rule.  See
 * {@link java.awt.geom.PathIterator#WIND_EVEN_ODD WIND_EVEN_ODD}
 * for a definition of the even-odd winding rule.
 * This class's hit-testing methods, which include the
 * {@code contains}, {@code intersects} and {@code inside}
 * methods, use the <i>insideness</i> definition described in the
 * {@link Shape} class comments.
 *
 * @author      Sami Shaio
 * @see Shape
 * @author      Herb Jellinek
 * @since       1.0
 */
export class Polygon extends JObject {
  /**
   * The total number of points.  The value of {@code npoints}
   * represents the number of valid points in this {@code Polygon}
   * and might be less than the number of elements in
   * {@link #xpoints xpoints} or {@link #ypoints ypoints}.
   * This value can be 0.
   *
   * @serial
   * @see #addPoint(int, int)
   * @since 1.0
   */
  npoints: number = 0;
  /**
   * The array of X coordinates.  The number of elements in
   * this array might be more than the number of X coordinates
   * in this {@code Polygon}.  The extra elements allow new points
   * to be added to this {@code Polygon} without re-creating this
   * array.  The value of {@link #npoints npoints} is equal to the
   * number of valid points in this {@code Polygon}.
   *
   * @serial
   * @see #addPoint(int, int)
   * @since 1.0
   */
  xpoints: number[] = null;
  /**
   * The array of Y coordinates.  The number of elements in
   * this array might be more than the number of Y coordinates
   * in this {@code Polygon}.  The extra elements allow new points
   * to be added to this {@code Polygon} without re-creating this
   * array.  The value of {@code npoints} is equal to the
   * number of valid points in this {@code Polygon}.
   *
   * @serial
   * @see #addPoint(int, int)
   * @since 1.0
   */
  ypoints: number[] = null;
  /**
   * The bounds of this {@code Polygon}.
   * This value can be null.
   *
   * @serial
   * @see #getBoundingBox()
   * @see #getBounds()
   * @since 1.0
   */
  bounds_: Rectangle = null;
  static readonly MIN_LENGTH: number = 4;
  /**
   * Creates an empty polygon.
   * @since 1.0
   */
  _Polygon$(): this {
    this.xpoints = $J.newArray(Polygon.MIN_LENGTH, 0);
    this.ypoints = $J.newArray(Polygon.MIN_LENGTH, 0);
    return this;
  }
  /**
   * Constructs and initializes a {@code Polygon} from the specified
   * parameters.
   * @param xpoints an array of X coordinates
   * @param ypoints an array of Y coordinates
   * @param npoints the total number of points in the
   *                          {@code Polygon}
   * @throws  NegativeArraySizeException if the value of
   *                       {@code npoints} is negative.
   * @throws  IndexOutOfBoundsException if {@code npoints} is
   *             greater than the length of {@code xpoints}
   *             or the length of {@code ypoints}.
   * @throws  NullPointerException if {@code xpoints} or
   *             {@code ypoints} is {@code null}.
   * @since 1.0
   */
  _Polygon$intArr$intArr$int(xpoints: number[], ypoints: number[], npoints: number): this {
    if (npoints > xpoints.length || npoints > ypoints.length) {
      throw new IndexOutOfBoundsException('npoints > xpoints.length || npoints > ypoints.length');
    }
    if (npoints < 0) {
      throw new NegativeArraySizeException('npoints < 0');
    }
    this.npoints = npoints;
    this.xpoints = Arrays.copyOf(xpoints, npoints);
    this.ypoints = Arrays.copyOf(ypoints, npoints);
    return this;
  }
  calculateBounds(xpoints: number[], ypoints: number[], npoints: number): void {
    let boundsMinX = 2147483647;
    let boundsMinY = 2147483647;
    let boundsMaxX = -2147483648;
    let boundsMaxY = -2147483648;
    for (let i = 0; i < npoints; i++) {
      let x = xpoints[i];
      boundsMinX = Math.min(boundsMinX, x);
      boundsMaxX = Math.max(boundsMaxX, x);
      let y = ypoints[i];
      boundsMinY = Math.min(boundsMinY, y);
      boundsMaxY = Math.max(boundsMaxY, y);
    }
    this.bounds_ = new Rectangle()._Rectangle$int$int$int$int(boundsMinX, boundsMinY, (boundsMaxX - boundsMinX) | 0, (boundsMaxY - boundsMinY) | 0);
  }
  updateBounds(x: number, y: number): void {
    if (x < this.bounds_.x_) {
      this.bounds_.width_ = (this.bounds_.width_ + (this.bounds_.x_ - x)) | 0;
      this.bounds_.x_ = x;
    } else {
      this.bounds_.width_ = Math.max(this.bounds_.width_, (x - this.bounds_.x_) | 0);
    }
    if (y < this.bounds_.y_) {
      this.bounds_.height_ = (this.bounds_.height_ + (this.bounds_.y_ - y)) | 0;
      this.bounds_.y_ = y;
    } else {
      this.bounds_.height_ = Math.max(this.bounds_.height_, (y - this.bounds_.y_) | 0);
    }
  }
  /**
   * Appends the specified coordinates to this {@code Polygon}.
   * <p>
   * If an operation that calculates the bounding box of this
   * {@code Polygon} has already been performed, such as
   * {@code getBounds} or {@code contains}, then this
   * method updates the bounding box.
   * @param       x the specified X coordinate
   * @param       y the specified Y coordinate
   * @see         java.awt.Polygon#getBounds
   * @see         java.awt.Polygon#contains
   * @since 1.0
   */
  addPoint(x: number, y: number): void {
    if (this.npoints >= this.xpoints.length || this.npoints >= this.ypoints.length) {
      let newLength = Math.imul(this.npoints, 2);
      if (newLength < Polygon.MIN_LENGTH) {
        newLength = Polygon.MIN_LENGTH;
      } else if ((newLength & ((newLength - 1) | 0)) !== 0) {
        newLength = $J.Integer_highestOneBit(newLength);
      }
      this.xpoints = Arrays.copyOf(this.xpoints, newLength);
      this.ypoints = Arrays.copyOf(this.ypoints, newLength);
    }
    this.xpoints[this.npoints] = x;
    this.ypoints[this.npoints] = y;
    this.npoints++;
    if (this.bounds_ != null) {
      this.updateBounds(x, y);
    }
  }
  /**
   * Gets the bounding box of this {@code Polygon}.
   * The bounding box is the smallest {@link Rectangle} whose
   * sides are parallel to the x and y axes of the
   * coordinate space, and can completely contain the {@code Polygon}.
   * @return a {@code Rectangle} that defines the bounds of this
   * {@code Polygon}.
   * @since 1.1
   */
  getBounds(): Rectangle {
    return this.getBoundingBox();
  }
  /**
   * Returns the bounds of this {@code Polygon}.
   * @return the bounds of this {@code Polygon}.
   * @deprecated As of JDK version 1.1,
   * replaced by {@code getBounds()}.
   * @since 1.0
   */
  getBoundingBox(): Rectangle {
    if (this.npoints === 0) {
      return new Rectangle()._Rectangle$();
    }
    if (this.bounds_ == null) {
      this.calculateBounds(this.xpoints, this.ypoints, this.npoints);
    }
    return this.bounds_.getBounds();
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  getBounds2D(): Rectangle2D {
    return this.getBounds();
  }
  getCrossings(xlo: number, ylo: number, xhi: number, yhi: number): Crossings {
    let cross = new Crossings$EvenOdd()._Crossings$EvenOdd(xlo, ylo, xhi, yhi);
    let lastx = this.xpoints[(this.npoints - 1) | 0];
    let lasty = this.ypoints[(this.npoints - 1) | 0];
    let curx: number;
    let cury: number;
    for (let i = 0; i < this.npoints; i++) {
      curx = this.xpoints[i];
      cury = this.ypoints[i];
      if (cross.accumulateLine$double$double$double$double(lastx, lasty, curx, cury)) {
        return null;
      }
      lastx = curx;
      lasty = cury;
    }
    return cross;
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  intersects$double$double$double$double(x: number, y: number, w: number, h: number): boolean {
    if (this.npoints <= 0 || !this.getBoundingBox().intersects$double$double$double$double(x, y, w, h)) {
      return false;
    }
    let cross = this.getCrossings(x, y, x + w, y + h);
    return (cross == null || !cross.isEmpty());
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  intersects$Rectangle2D(r: Rectangle2D): boolean {
    return this.intersects$double$double$double$double(r.getX(), r.getY(), r.getWidth(), r.getHeight());
  }
  /**
   * Returns an iterator object that iterates along the boundary of this
   * {@code Polygon} and provides access to the geometry
   * of the outline of this {@code Polygon}.  An optional
   * {@link AffineTransform} can be specified so that the coordinates
   * returned in the iteration are transformed accordingly.
   * @param at an optional {@code AffineTransform} to be applied to the
   *          coordinates as they are returned in the iteration, or
   *          {@code null} if untransformed coordinates are desired
   * @return a {@link PathIterator} object that provides access to the
   *          geometry of this {@code Polygon}.
   * @since 1.2
   */
  getPathIterator$AffineTransform(at: AffineTransform): PathIterator {
    return new Polygon$PolygonPathIterator()._Polygon$PolygonPathIterator(this, at);
  }
  /**
   * Returns an iterator object that iterates along the boundary of
   * the {@code Shape} and provides access to the geometry of the
   * outline of the {@code Shape}.  Only SEG_MOVETO, SEG_LINETO, and
   * SEG_CLOSE point types are returned by the iterator.
   * Since polygons are already flat, the {@code flatness} parameter
   * is ignored.  An optional {@code AffineTransform} can be specified
   * in which case the coordinates returned in the iteration are transformed
   * accordingly.
   * @param at an optional {@code AffineTransform} to be applied to the
   *          coordinates as they are returned in the iteration, or
   *          {@code null} if untransformed coordinates are desired
   * @param flatness the maximum amount that the control points
   *          for a given curve can vary from collinear before a subdivided
   *          curve is replaced by a straight line connecting the
   *          endpoints.  Since polygons are already flat the
   *          {@code flatness} parameter is ignored.
   * @return a {@code PathIterator} object that provides access to the
   *          {@code Shape} object's geometry.
   * @since 1.2
   */
  getPathIterator$AffineTransform$double(at: AffineTransform, flatness: number): PathIterator {
    return this.getPathIterator$AffineTransform(at);
  }
}

export class Polygon$PolygonPathIterator extends JObject {
  poly: Polygon = null;
  transform_: AffineTransform = null;
  index_: number = 0;
  _Polygon$PolygonPathIterator(pg: Polygon, at: AffineTransform): this {
    this.poly = pg;
    this.transform_ = at;
    if (pg.npoints === 0) {
      this.index_ = 1;
    }
    return this;
  }
  /**
   * Returns the winding rule for determining the interior of the
   * path.
   * @return an integer representing the current winding rule.
   * @see PathIterator#WIND_NON_ZERO
   */
  getWindingRule(): number {
    return PathIterator.WIND_EVEN_ODD;
  }
  /**
   * Tests if there are more points to read.
   * @return {@code true} if there are more points to read;
   *          {@code false} otherwise.
   */
  isDone(): boolean {
    return this.index_ > this.poly.npoints;
  }
  /**
   * Moves the iterator forwards, along the primary direction of
   * traversal, to the next segment of the path when there are
   * more points in that direction.
   */
  next$(): void {
    this.index_++;
  }
  /**
   * Returns the coordinates and type of the current path segment in
   * the iteration.
   * The return value is the path segment type:
   * SEG_MOVETO, SEG_LINETO, or SEG_CLOSE.
   * A {@code float} array of length 2 must be passed in and
   * can be used to store the coordinates of the point(s).
   * Each point is stored as a pair of {@code float} x,&nbsp;y
   * coordinates.  SEG_MOVETO and SEG_LINETO types return one
   * point, and SEG_CLOSE does not return any points.
   * @param coords a {@code float} array that specifies the
   * coordinates of the point(s)
   * @return an integer representing the type and coordinates of the
   *              current path segment.
   * @see PathIterator#SEG_MOVETO
   * @see PathIterator#SEG_LINETO
   * @see PathIterator#SEG_CLOSE
   */
  currentSegment$floatArr(coords: number[]): number {
    if (this.index_ >= this.poly.npoints) {
      return PathIterator.SEG_CLOSE;
    }
    coords[0] = Math.fround(this.poly.xpoints[this.index_]);
    coords[1] = Math.fround(this.poly.ypoints[this.index_]);
    if (this.transform_ != null) {
      this.transform_.transform$floatArr$int$floatArr$int$int(coords, 0, coords, 0, 1);
    }
    return (this.index_ === 0 ? PathIterator.SEG_MOVETO : PathIterator.SEG_LINETO);
  }
  /**
   * Returns the coordinates and type of the current path segment in
   * the iteration.
   * The return value is the path segment type:
   * SEG_MOVETO, SEG_LINETO, or SEG_CLOSE.
   * A {@code double} array of length 2 must be passed in and
   * can be used to store the coordinates of the point(s).
   * Each point is stored as a pair of {@code double} x,&nbsp;y
   * coordinates.
   * SEG_MOVETO and SEG_LINETO types return one point,
   * and SEG_CLOSE does not return any points.
   * @param coords a {@code double} array that specifies the
   * coordinates of the point(s)
   * @return an integer representing the type and coordinates of the
   *              current path segment.
   * @see PathIterator#SEG_MOVETO
   * @see PathIterator#SEG_LINETO
   * @see PathIterator#SEG_CLOSE
   */
  currentSegment$doubleArr(coords: number[]): number {
    if (this.index_ >= this.poly.npoints) {
      return PathIterator.SEG_CLOSE;
    }
    coords[0] = this.poly.xpoints[this.index_];
    coords[1] = this.poly.ypoints[this.index_];
    if (this.transform_ != null) {
      this.transform_.transform$doubleArr$int$doubleArr$int$int(coords, 0, coords, 0, 1);
    }
    return (this.index_ === 0 ? PathIterator.SEG_MOVETO : PathIterator.SEG_LINETO);
  }
}

$J.define(Polygon, 'java.awt.Polygon', { kind: 'class', ifaces: ['java.awt.Shape', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int[],int[],int': '_Polygon$intArr$intArr$int', '': '_Polygon$' }, meths: { 'getPathIterator(java.awt.geom.AffineTransform,double)': 'getPathIterator$AffineTransform$double', 'getPathIterator(java.awt.geom.AffineTransform)': 'getPathIterator$AffineTransform', 'contains(java.awt.geom.Rectangle2D)': 'contains$Rectangle2D', 'contains(double,double,double,double)': 'contains$double$double$double$double', 'intersects(java.awt.geom.Rectangle2D)': 'intersects$Rectangle2D', 'intersects(double,double,double,double)': 'intersects$double$double$double$double', 'contains(java.awt.geom.Point2D)': 'contains$Point2D', 'contains(double,double)': 'contains$double$double', 'contains(int,int)': 'contains$int$int', 'contains(java.awt.Point)': 'contains$Point' } });
$J.define(Polygon$PolygonPathIterator, 'java.awt.Polygon$PolygonPathIterator', { kind: 'class', ifaces: ['java.awt.geom.PathIterator'], sup: 'java.lang.Object', ctors: { 'java.awt.Polygon,java.awt.geom.AffineTransform': '_Polygon$PolygonPathIterator' }, meths: { 'currentSegment(double[])': 'currentSegment$doubleArr', 'currentSegment(float[])': 'currentSegment$floatArr', 'next()': 'next$' } });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  PathIterator = $J.load('java.awt.geom.PathIterator');
  Crossings$EvenOdd = $J.load('sun.awt.geom.Crossings$EvenOdd');
});
