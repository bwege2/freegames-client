// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/Path2D.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2006, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayIndexOutOfBoundsException, Arrays, IllegalArgumentException, InternalError, InvalidObjectException, JObject, OutOfMemoryError, StreamCorruptedException } from '../../../../jre/index.ts';

let FlatteningPathIterator, GeneralPath, IllegalPathStateException, PathIterator, Point2D$Double, Point2D$Float, Rectangle2D$Double, Curve;

/**
 * The {@code Path2D} class provides a simple, yet flexible
 * shape which represents an arbitrary geometric path.
 * It can fully represent any path which can be iterated by the
 * {@link PathIterator} interface including all of its segment
 * types and winding rules and it implements all of the
 * basic hit testing methods of the {@link Shape} interface.
 * <p>
 * Use {@link Path2D.Float} when dealing with data that can be represented
 * and used with floating point precision.  Use {@link Path2D.Double}
 * for data that requires the accuracy or range of double precision.
 * <p>
 * {@code Path2D} provides exactly those facilities required for
 * basic construction and management of a geometric path and
 * implementation of the above interfaces with little added
 * interpretation.
 * If it is useful to manipulate the interiors of closed
 * geometric shapes beyond simple hit testing then the
 * {@link Area} class provides additional capabilities
 * specifically targeted at closed figures.
 * While both classes nominally implement the {@code Shape}
 * interface, they differ in purpose and together they provide
 * two useful views of a geometric shape where {@code Path2D}
 * deals primarily with a trajectory formed by path segments
 * and {@code Area} deals more with interpretation and manipulation
 * of enclosed regions of 2D geometric space.
 * <p>
 * The {@link PathIterator} interface has more detailed descriptions
 * of the types of segments that make up a path and the winding rules
 * that control how to determine which regions are inside or outside
 * the path.
 *
 * @author Jim Graham
 * @since 1.6
 * @sealedGraph
 */
export class Path2D extends JObject {
  /**
   * An even-odd winding rule for determining the interior of
   * a path.
   *
   * @see PathIterator#WIND_EVEN_ODD
   * @since 1.6
   */
  static readonly WIND_EVEN_ODD: number = 0;
  /**
   * A non-zero winding rule for determining the interior of a
   * path.
   *
   * @see PathIterator#WIND_NON_ZERO
   * @since 1.6
   */
  static readonly WIND_NON_ZERO: number = 1;
  static readonly SEG_MOVETO: number = 0;
  static readonly SEG_LINETO: number = 1;
  static readonly SEG_QUADTO: number = 2;
  static readonly SEG_CUBICTO: number = 3;
  static readonly SEG_CLOSE: number = 4;
  pointTypes: number[] = null;
  numTypes: number = 0;
  numCoords: number = 0;
  windingRule: number = 0;
  static readonly INIT_SIZE: number = 20;
  static readonly EXPAND_MAX: number = 500;
  static readonly EXPAND_MAX_COORDS: number = 1000;
  static readonly EXPAND_MIN: number = 10;
  static readonly SERIAL_STORAGE_FLT_ARRAY: number = 48;
  static readonly SERIAL_STORAGE_DBL_ARRAY: number = 49;
  static readonly SERIAL_SEG_FLT_MOVETO: number = 64;
  static readonly SERIAL_SEG_FLT_LINETO: number = 65;
  static readonly SERIAL_SEG_FLT_QUADTO: number = 66;
  static readonly SERIAL_SEG_FLT_CUBICTO: number = 67;
  static readonly SERIAL_SEG_DBL_MOVETO: number = 80;
  static readonly SERIAL_SEG_DBL_LINETO: number = 81;
  static readonly SERIAL_SEG_DBL_QUADTO: number = 82;
  static readonly SERIAL_SEG_DBL_CUBICTO: number = 83;
  static readonly SERIAL_SEG_CLOSE: number = 96;
  static readonly SERIAL_PATH_END: number = 97;
  /**
   * Constructs a new empty {@code Path2D} object.
   * It is assumed that the package sibling subclass that is
   * defaulting to this constructor will fill in all values.
   *
   * @since 1.6
   */
  _Path2D$(): this {
    return this;
  }
  /**
   * Constructs a new {@code Path2D} object from the given
   * specified initial values.
   * This method is only intended for internal use and should
   * not be made public if the other constructors for this class
   * are ever exposed.
   *
   * @param rule the winding rule
   * @param initialTypes the size to make the initial array to
   *                     store the path segment types
   * @throws IllegalArgumentException if {@code rule} is not either
   *         {@link #WIND_EVEN_ODD} or {@link #WIND_NON_ZERO}
   * @throws NegativeArraySizeException if {@code initialTypes} is negative
   * @since 1.6
   */
  _Path2D$int$int(rule: number, initialTypes: number): this {
    this.setWindingRule(rule);
    this.pointTypes = $J.newArray(initialTypes, 0);
    return this;
  }
  static expandPointTypes(oldPointTypes: number[], needed: number): number[] {
    let oldSize = oldPointTypes.length;
    let newSizeMin = (oldSize + needed) | 0;
    if (newSizeMin < oldSize) {
      throw new ArrayIndexOutOfBoundsException('pointTypes exceeds maximum capacity !');
    }
    let grow = oldSize;
    if (grow > Path2D.EXPAND_MAX) {
      grow = Math.max(Path2D.EXPAND_MAX, oldSize >> 3);
    } else if (grow < Path2D.EXPAND_MIN) {
      grow = Path2D.EXPAND_MIN;
    }
    // assert grow > 0
    let newSize = (oldSize + grow) | 0;
    if (newSize < newSizeMin) {
      newSize = 2147483647;
    }
    while (true) {
      try {
        return Arrays.copyOf(oldPointTypes, newSize);
      } catch ($e0) {
        if ($J.isa($e0, OutOfMemoryError)) {
          let oome = $J.exc($e0);
          if (newSize === newSizeMin) {
            throw oome;
          }
        } else {
          throw $e0;
        }
      }
      newSize = (newSizeMin + $J.idiv(((newSize - newSizeMin) | 0), 2)) | 0;
    }
  }
  /**
   * Closes the current subpath by drawing a straight line back to
   * the coordinates of the last {@code moveTo}.  If the path is already
   * closed then this method has no effect.
   *
   * @since 1.6
   */
  closePath(): void {
    if (this.numTypes === 0 || (this.pointTypes[(this.numTypes - 1) | 0]) !== Path2D.SEG_CLOSE) {
      this.needRoom(true, 0);
      this.pointTypes[this.numTypes++] = Path2D.SEG_CLOSE;
    }
  }
  /**
   * Appends the geometry of the specified {@code Shape} object to the
   * path, possibly connecting the new geometry to the existing path
   * segments with a line segment.
   * If the {@code connect} parameter is {@code true} and the
   * path is not empty then any initial {@code moveTo} in the
   * geometry of the appended {@code Shape}
   * is turned into a {@code lineTo} segment.
   * If the destination coordinates of such a connecting {@code lineTo}
   * segment match the ending coordinates of a currently open
   * subpath then the segment is omitted as superfluous.
   * The winding rule of the specified {@code Shape} is ignored
   * and the appended geometry is governed by the winding
   * rule specified for this path.
   *
   * @param s the {@code Shape} whose geometry is appended
   *          to this path
   * @param connect a boolean to control whether or not to turn an initial
   *                {@code moveTo} segment into a {@code lineTo} segment
   *                to connect the new geometry to the existing path
   * @since 1.6
   */
  append$Shape$boolean(s: Shape, connect: boolean): void {
    this.append$PathIterator$boolean(s.getPathIterator$AffineTransform(null), connect);
  }
  /**
   * Returns the fill style winding rule.
   *
   * @return an integer representing the current winding rule.
   * @see #WIND_EVEN_ODD
   * @see #WIND_NON_ZERO
   * @see #setWindingRule
   * @since 1.6
   */
  getWindingRule(): number {
    return this.windingRule;
  }
  /**
   * Sets the winding rule for this path to the specified value.
   *
   * @param rule an integer representing the specified
   *             winding rule
   * @throws IllegalArgumentException if
   *          {@code rule} is not either
   *          {@link #WIND_EVEN_ODD} or
   *          {@link #WIND_NON_ZERO}
   * @see #getWindingRule
   * @since 1.6
   */
  setWindingRule(rule: number): void {
    if (rule !== Path2D.WIND_EVEN_ODD && rule !== Path2D.WIND_NON_ZERO) {
      throw new IllegalArgumentException('winding rule must be WIND_EVEN_ODD or WIND_NON_ZERO');
    }
    this.windingRule = rule;
  }
  /**
   * Returns the coordinates most recently added to the end of the path
   * as a {@link Point2D} object.
   *
   * @return a {@code Point2D} object containing the ending coordinates of
   *         the path or {@code null} if there are no points in the path.
   * @since 1.6
   */
  getCurrentPoint(): Point2D {
    let index = this.numCoords;
    if (this.numTypes < 1 || index < 1) {
      return null;
    }
    if ((this.pointTypes[(this.numTypes - 1) | 0]) === Path2D.SEG_CLOSE) {
      loop:
      for (let i = (this.numTypes - 2) | 0; i > 0; i--) {
        switch (this.pointTypes[i]) {
          case Path2D.SEG_MOVETO:
            break loop;
          case Path2D.SEG_LINETO:
            index = (index - 2) | 0;
            break;
          case Path2D.SEG_QUADTO:
            index = (index - 4) | 0;
            break;
          case Path2D.SEG_CUBICTO:
            index = (index - 6) | 0;
            break;
          case Path2D.SEG_CLOSE:
            break;
        }
      }
    }
    return this.getPoint((index - 2) | 0);
  }
  /**
   * Resets the path to empty.  The append position is set back to the
   * beginning of the path and all coordinates and point types are
   * forgotten.
   *
   * @since 1.6
   */
  reset(): void {
    this.numTypes = this.numCoords = 0;
  }
  /**
   * Returns a new {@code Shape} representing a transformed version
   * of this {@code Path2D}.
   * Note that the exact type and coordinate precision of the return
   * value is not specified for this method.
   * The method will return a Shape that contains no less precision
   * for the transformed geometry than this {@code Path2D} currently
   * maintains, but it may contain no more precision either.
   * If the tradeoff of precision vs. storage size in the result is
   * important then the convenience constructors in the
   * {@link Path2D.Float#Float(Shape, AffineTransform) Path2D.Float}
   * and
   * {@link Path2D.Double#Double(Shape, AffineTransform) Path2D.Double}
   * subclasses should be used to make the choice explicit.
   *
   * @param at the {@code AffineTransform} used to transform a
   *           new {@code Shape}.
   * @return a new {@code Shape}, transformed with the specified
   *         {@code AffineTransform}.
   * @since 1.6
   */
  createTransformedShape(at: AffineTransform): Shape {
    let p2d = this.clone();
    if (at != null) {
      p2d.transform(at);
    }
    return p2d;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  getBounds(): Rectangle {
    return this.getBounds2D().getBounds();
  }
  /**
   * Returns a high precision bounding box of the specified PathIterator.
   * <p>
   * This method provides a basic facility for implementors of the {@link Shape} interface to
   * implement support for the {@link Shape#getBounds2D()} method.
   * </p>
   *
   * @param pi the specified {@code PathIterator}
   * @return an instance of {@code Rectangle2D} that is a high-precision bounding box of the
   *         {@code PathIterator}.
   * @see Shape#getBounds2D()
   */
  static getBounds2D(pi: PathIterator): Rectangle2D {
    let coeff = $J.newArray(4, 0);
    let deriv_coeff = $J.newArray(3, 0);
    let coords = $J.newArray(6, 0);
    let bounds = null;
    let lastX = 0;
    let lastY = 0;
    let endX = 0;
    let endY = 0;
    let startX = 0;
    let startY = 0;
    for (; !pi.isDone(); pi.next$()) {
      let type$ = pi.currentSegment$doubleArr(coords);
      switch (type$) {
        case PathIterator.SEG_MOVETO:
          if (bounds == null) {
            bounds = [coords[0], coords[0], coords[1], coords[1]];
          }
          startX = endX = coords[0];
          startY = endY = coords[1];
          break;
        case PathIterator.SEG_LINETO:
          endX = coords[0];
          endY = coords[1];
          break;
        case PathIterator.SEG_QUADTO:
          endX = coords[2];
          endY = coords[3];
          break;
        case PathIterator.SEG_CUBICTO:
          endX = coords[4];
          endY = coords[5];
          break;
        case PathIterator.SEG_CLOSE:
          endX = startX;
          endY = startY;
          break;
        default:
          continue;
      }
      if (endX < bounds[0]) {
        bounds[0] = endX;
      }
      if (endX > bounds[1]) {
        bounds[1] = endX;
      }
      if (endY < bounds[2]) {
        bounds[2] = endY;
      }
      if (endY > bounds[3]) {
        bounds[3] = endY;
      }
      switch (type$) {
        case PathIterator.SEG_QUADTO:
          Curve.accumulateExtremaBoundsForQuad(bounds, 0, lastX, coords[0], coords[2], coeff, deriv_coeff);
          Curve.accumulateExtremaBoundsForQuad(bounds, 2, lastY, coords[1], coords[3], coeff, deriv_coeff);
          break;
        case PathIterator.SEG_CUBICTO:
          Curve.accumulateExtremaBoundsForCubic(bounds, 0, lastX, coords[0], coords[2], coords[4], coeff, deriv_coeff);
          Curve.accumulateExtremaBoundsForCubic(bounds, 2, lastY, coords[1], coords[3], coords[5], coeff, deriv_coeff);
          break;
        default:
          break;
      }
      lastX = endX;
      lastY = endY;
    }
    if (bounds != null) {
      return new Rectangle2D$Double()._Rectangle2D$Double$double$double$double$double(bounds[0], bounds[2], bounds[1] - bounds[0], bounds[3] - bounds[2]);
    }
    return new Rectangle2D$Double()._Rectangle2D$Double$();
  }
  /**
   * Tests if the specified coordinates are inside the closed
   * boundary of the specified {@link PathIterator}.
   * <p>
   * This method provides a basic facility for implementors of
   * the {@link Shape} interface to implement support for the
   * {@link Shape#contains(double, double)} method.
   *
   * @param pi the specified {@code PathIterator}
   * @param x the specified X coordinate
   * @param y the specified Y coordinate
   * @return {@code true} if the specified coordinates are inside the
   *         specified {@code PathIterator}; {@code false} otherwise
   * @since 1.6
   */
  static contains$PathIterator$double$double(pi: PathIterator, x: number, y: number): boolean {
    if (x * 0 + y * 0 === 0) {
      let mask = (pi.getWindingRule() === Path2D.WIND_NON_ZERO ? -1 : 1);
      let cross = Curve.pointCrossingsForPath(pi, x, y);
      return ((cross & mask) !== 0);
    } else {
      return false;
    }
  }
  /**
   * Tests if the specified {@link Point2D} is inside the closed
   * boundary of the specified {@link PathIterator}.
   * <p>
   * This method provides a basic facility for implementors of
   * the {@link Shape} interface to implement support for the
   * {@link Shape#contains(Point2D)} method.
   *
   * @param pi the specified {@code PathIterator}
   * @param p the specified {@code Point2D}
   * @return {@code true} if the specified coordinates are inside the
   *         specified {@code PathIterator}; {@code false} otherwise
   * @since 1.6
   */
  static contains$PathIterator$Point2D(pi: PathIterator, p: Point2D): boolean {
    return Path2D.contains$PathIterator$double$double(pi, p.getX(), p.getY());
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  contains$double$double(x: number, y: number): boolean {
    if (x * 0 + y * 0 === 0) {
      if (this.numTypes < 2) {
        return false;
      }
      let mask = (this.windingRule === Path2D.WIND_NON_ZERO ? -1 : 1);
      return ((this.pointCrossings(x, y) & mask) !== 0);
    } else {
      return false;
    }
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  contains$Point2D(p: Point2D): boolean {
    return this.contains$double$double(p.getX(), p.getY());
  }
  /**
   * Tests if the specified rectangular area is entirely inside the
   * closed boundary of the specified {@link PathIterator}.
   * <p>
   * This method provides a basic facility for implementors of
   * the {@link Shape} interface to implement support for the
   * {@link Shape#contains(double, double, double, double)} method.
   * <p>
   * This method object may conservatively return false in
   * cases where the specified rectangular area intersects a
   * segment of the path, but that segment does not represent a
   * boundary between the interior and exterior of the path.
   * Such segments could lie entirely within the interior of the
   * path if they are part of a path with a {@link #WIND_NON_ZERO}
   * winding rule or if the segments are retraced in the reverse
   * direction such that the two sets of segments cancel each
   * other out without any exterior area falling between them.
   * To determine whether segments represent true boundaries of
   * the interior of the path would require extensive calculations
   * involving all of the segments of the path and the winding
   * rule and are thus beyond the scope of this implementation.
   *
   * @param pi the specified {@code PathIterator}
   * @param x the specified X coordinate
   * @param y the specified Y coordinate
   * @param w the width of the specified rectangular area
   * @param h the height of the specified rectangular area
   * @return {@code true} if the specified {@code PathIterator} contains
   *         the specified rectangular area; {@code false} otherwise.
   * @since 1.6
   */
  static contains$PathIterator$double$double$double$double(pi: PathIterator, x: number, y: number, w: number, h: number): boolean {
    if ($J.Double_isNaN(x + w) || $J.Double_isNaN(y + h)) {
      return false;
    }
    if (w <= 0 || h <= 0) {
      return false;
    }
    let mask = (pi.getWindingRule() === Path2D.WIND_NON_ZERO ? -1 : 2);
    let crossings = Curve.rectCrossingsForPath(pi, x, y, x + w, y + h);
    return (crossings !== Curve.RECT_INTERSECTS && (crossings & mask) !== 0);
  }
  /**
   * Tests if the specified {@link Rectangle2D} is entirely inside the
   * closed boundary of the specified {@link PathIterator}.
   * <p>
   * This method provides a basic facility for implementors of
   * the {@link Shape} interface to implement support for the
   * {@link Shape#contains(Rectangle2D)} method.
   * <p>
   * This method object may conservatively return false in
   * cases where the specified rectangular area intersects a
   * segment of the path, but that segment does not represent a
   * boundary between the interior and exterior of the path.
   * Such segments could lie entirely within the interior of the
   * path if they are part of a path with a {@link #WIND_NON_ZERO}
   * winding rule or if the segments are retraced in the reverse
   * direction such that the two sets of segments cancel each
   * other out without any exterior area falling between them.
   * To determine whether segments represent true boundaries of
   * the interior of the path would require extensive calculations
   * involving all of the segments of the path and the winding
   * rule and are thus beyond the scope of this implementation.
   *
   * @param pi the specified {@code PathIterator}
   * @param r a specified {@code Rectangle2D}
   * @return {@code true} if the specified {@code PathIterator} contains
   *         the specified {@code Rectangle2D}; {@code false} otherwise.
   * @since 1.6
   */
  static contains$PathIterator$Rectangle2D(pi: PathIterator, r: Rectangle2D): boolean {
    return Path2D.contains$PathIterator$double$double$double$double(pi, r.getX(), r.getY(), r.getWidth(), r.getHeight());
  }
  /**
   * {@inheritDoc}
   * <p>
   * This method object may conservatively return false in
   * cases where the specified rectangular area intersects a
   * segment of the path, but that segment does not represent a
   * boundary between the interior and exterior of the path.
   * Such segments could lie entirely within the interior of the
   * path if they are part of a path with a {@link #WIND_NON_ZERO}
   * winding rule or if the segments are retraced in the reverse
   * direction such that the two sets of segments cancel each
   * other out without any exterior area falling between them.
   * To determine whether segments represent true boundaries of
   * the interior of the path would require extensive calculations
   * involving all of the segments of the path and the winding
   * rule and are thus beyond the scope of this implementation.
   *
   * @since 1.6
   */
  contains$double$double$double$double(x: number, y: number, w: number, h: number): boolean {
    if ($J.Double_isNaN(x + w) || $J.Double_isNaN(y + h)) {
      return false;
    }
    if (w <= 0 || h <= 0) {
      return false;
    }
    let mask = (this.windingRule === Path2D.WIND_NON_ZERO ? -1 : 2);
    let crossings = this.rectCrossings(x, y, x + w, y + h);
    return (crossings !== Curve.RECT_INTERSECTS && (crossings & mask) !== 0);
  }
  /**
   * {@inheritDoc}
   * <p>
   * This method object may conservatively return false in
   * cases where the specified rectangular area intersects a
   * segment of the path, but that segment does not represent a
   * boundary between the interior and exterior of the path.
   * Such segments could lie entirely within the interior of the
   * path if they are part of a path with a {@link #WIND_NON_ZERO}
   * winding rule or if the segments are retraced in the reverse
   * direction such that the two sets of segments cancel each
   * other out without any exterior area falling between them.
   * To determine whether segments represent true boundaries of
   * the interior of the path would require extensive calculations
   * involving all of the segments of the path and the winding
   * rule and are thus beyond the scope of this implementation.
   *
   * @since 1.6
   */
  contains$Rectangle2D(r: Rectangle2D): boolean {
    return this.contains$double$double$double$double(r.getX(), r.getY(), r.getWidth(), r.getHeight());
  }
  /**
   * Tests if the interior of the specified {@link PathIterator}
   * intersects the interior of a specified set of rectangular
   * coordinates.
   * <p>
   * This method provides a basic facility for implementors of
   * the {@link Shape} interface to implement support for the
   * {@link Shape#intersects(double, double, double, double)} method.
   * <p>
   * This method object may conservatively return true in
   * cases where the specified rectangular area intersects a
   * segment of the path, but that segment does not represent a
   * boundary between the interior and exterior of the path.
   * Such a case may occur if some set of segments of the
   * path are retraced in the reverse direction such that the
   * two sets of segments cancel each other out without any
   * interior area between them.
   * To determine whether segments represent true boundaries of
   * the interior of the path would require extensive calculations
   * involving all of the segments of the path and the winding
   * rule and are thus beyond the scope of this implementation.
   *
   * @param pi the specified {@code PathIterator}
   * @param x the specified X coordinate
   * @param y the specified Y coordinate
   * @param w the width of the specified rectangular coordinates
   * @param h the height of the specified rectangular coordinates
   * @return {@code true} if the specified {@code PathIterator} and
   *         the interior of the specified set of rectangular
   *         coordinates intersect each other; {@code false} otherwise.
   * @since 1.6
   */
  static intersects$PathIterator$double$double$double$double(pi: PathIterator, x: number, y: number, w: number, h: number): boolean {
    if ($J.Double_isNaN(x + w) || $J.Double_isNaN(y + h)) {
      return false;
    }
    if (w <= 0 || h <= 0) {
      return false;
    }
    let mask = (pi.getWindingRule() === Path2D.WIND_NON_ZERO ? -1 : 2);
    let crossings = Curve.rectCrossingsForPath(pi, x, y, x + w, y + h);
    return (crossings === Curve.RECT_INTERSECTS || (crossings & mask) !== 0);
  }
  /**
   * Tests if the interior of the specified {@link PathIterator}
   * intersects the interior of a specified {@link Rectangle2D}.
   * <p>
   * This method provides a basic facility for implementors of
   * the {@link Shape} interface to implement support for the
   * {@link Shape#intersects(Rectangle2D)} method.
   * <p>
   * This method object may conservatively return true in
   * cases where the specified rectangular area intersects a
   * segment of the path, but that segment does not represent a
   * boundary between the interior and exterior of the path.
   * Such a case may occur if some set of segments of the
   * path are retraced in the reverse direction such that the
   * two sets of segments cancel each other out without any
   * interior area between them.
   * To determine whether segments represent true boundaries of
   * the interior of the path would require extensive calculations
   * involving all of the segments of the path and the winding
   * rule and are thus beyond the scope of this implementation.
   *
   * @param pi the specified {@code PathIterator}
   * @param r the specified {@code Rectangle2D}
   * @return {@code true} if the specified {@code PathIterator} and
   *         the interior of the specified {@code Rectangle2D}
   *         intersect each other; {@code false} otherwise.
   * @since 1.6
   */
  static intersects$PathIterator$Rectangle2D(pi: PathIterator, r: Rectangle2D): boolean {
    return Path2D.intersects$PathIterator$double$double$double$double(pi, r.getX(), r.getY(), r.getWidth(), r.getHeight());
  }
  /**
   * {@inheritDoc}
   * <p>
   * This method object may conservatively return true in
   * cases where the specified rectangular area intersects a
   * segment of the path, but that segment does not represent a
   * boundary between the interior and exterior of the path.
   * Such a case may occur if some set of segments of the
   * path are retraced in the reverse direction such that the
   * two sets of segments cancel each other out without any
   * interior area between them.
   * To determine whether segments represent true boundaries of
   * the interior of the path would require extensive calculations
   * involving all of the segments of the path and the winding
   * rule and are thus beyond the scope of this implementation.
   *
   * @since 1.6
   */
  intersects$double$double$double$double(x: number, y: number, w: number, h: number): boolean {
    if ($J.Double_isNaN(x + w) || $J.Double_isNaN(y + h)) {
      return false;
    }
    if (w <= 0 || h <= 0) {
      return false;
    }
    let mask = (this.windingRule === Path2D.WIND_NON_ZERO ? -1 : 2);
    let crossings = this.rectCrossings(x, y, x + w, y + h);
    return (crossings === Curve.RECT_INTERSECTS || (crossings & mask) !== 0);
  }
  /**
   * {@inheritDoc}
   * <p>
   * This method object may conservatively return true in
   * cases where the specified rectangular area intersects a
   * segment of the path, but that segment does not represent a
   * boundary between the interior and exterior of the path.
   * Such a case may occur if some set of segments of the
   * path are retraced in the reverse direction such that the
   * two sets of segments cancel each other out without any
   * interior area between them.
   * To determine whether segments represent true boundaries of
   * the interior of the path would require extensive calculations
   * involving all of the segments of the path and the winding
   * rule and are thus beyond the scope of this implementation.
   *
   * @since 1.6
   */
  intersects$Rectangle2D(r: Rectangle2D): boolean {
    return this.intersects$double$double$double$double(r.getX(), r.getY(), r.getWidth(), r.getHeight());
  }
  /**
   * {@inheritDoc}
   * <p>
   * The iterator for this class is not multi-threaded safe,
   * which means that this {@code Path2D} class does not
   * guarantee that modifications to the geometry of this
   * {@code Path2D} object do not affect any iterations of
   * that geometry that are already in process.
   *
   * @since 1.6
   */
  getPathIterator$AffineTransform$double(at: AffineTransform, flatness: number): PathIterator {
    return new FlatteningPathIterator()._FlatteningPathIterator$PathIterator$double(this.getPathIterator$AffineTransform(at), flatness);
  }
  writeObject$ObjectOutputStream$boolean(s: ObjectOutputStream, isdbl: boolean): void {
    s.defaultWriteObject();
    let fCoords: number[];
    let dCoords: number[];
    if (isdbl) {
      dCoords = (this).doubleCoords;
      fCoords = null;
    } else {
      fCoords = (this).floatCoords;
      dCoords = null;
    }
    let numTypes = this.numTypes;
    s.writeByte(isdbl ? Path2D.SERIAL_STORAGE_DBL_ARRAY : Path2D.SERIAL_STORAGE_FLT_ARRAY);
    s.writeInt(numTypes);
    s.writeInt(this.numCoords);
    s.writeByte(((this.windingRule) << 24) >> 24);
    let cindex = 0;
    for (let i = 0; i < numTypes; i++) {
      let npoints: number;
      let serialtype: number;
      switch (this.pointTypes[i]) {
        case Path2D.SEG_MOVETO:
          npoints = 1;
          serialtype = (isdbl ? Path2D.SERIAL_SEG_DBL_MOVETO : Path2D.SERIAL_SEG_FLT_MOVETO);
          break;
        case Path2D.SEG_LINETO:
          npoints = 1;
          serialtype = (isdbl ? Path2D.SERIAL_SEG_DBL_LINETO : Path2D.SERIAL_SEG_FLT_LINETO);
          break;
        case Path2D.SEG_QUADTO:
          npoints = 2;
          serialtype = (isdbl ? Path2D.SERIAL_SEG_DBL_QUADTO : Path2D.SERIAL_SEG_FLT_QUADTO);
          break;
        case Path2D.SEG_CUBICTO:
          npoints = 3;
          serialtype = (isdbl ? Path2D.SERIAL_SEG_DBL_CUBICTO : Path2D.SERIAL_SEG_FLT_CUBICTO);
          break;
        case Path2D.SEG_CLOSE:
          npoints = 0;
          serialtype = Path2D.SERIAL_SEG_CLOSE;
          break;
        default:
          throw new InternalError('unrecognized path type');
      }
      s.writeByte(serialtype);
      while (--npoints >= 0) {
        if (isdbl) {
          s.writeDouble(dCoords[cindex++]);
          s.writeDouble(dCoords[cindex++]);
        } else {
          s.writeFloat(fCoords[cindex++]);
          s.writeFloat(fCoords[cindex++]);
        }
      }
    }
    s.writeByte(Path2D.SERIAL_PATH_END);
  }
  readObject$ObjectInputStream$boolean(s: ObjectInputStream, storedbl: boolean): void {
    s.defaultReadObject();
    s.readByte();
    let nT = s.readInt();
    let nC = s.readInt();
    try {
      this.setWindingRule(s.readByte());
    } catch ($e1) {
      if ($J.isa($e1, IllegalArgumentException)) {
        let iae = $J.exc($e1);
        throw new InvalidObjectException(iae.getMessage());
      } else {
        throw $e1;
      }
    }
    this.pointTypes = $J.newArray((nT < 0 || nT > Path2D.INIT_SIZE) ? Path2D.INIT_SIZE : nT, 0);
    let initX2 = Math.imul(Path2D.INIT_SIZE, 2);
    if (nC < 0 || nC > initX2) {
      nC = initX2;
    }
    if (storedbl) {
      (this).doubleCoords = $J.newArray(nC, 0);
    } else {
      (this).floatCoords = $J.newArray(nC, 0);
    }
    PATHDONE:
    for (let i = 0; nT < 0 || i < nT; i++) {
      let isdbl: boolean;
      let npoints: number;
      let segtype: number;
      let serialtype = s.readByte();
      switch (serialtype) {
        case Path2D.SERIAL_SEG_FLT_MOVETO:
          isdbl = false;
          npoints = 1;
          segtype = Path2D.SEG_MOVETO;
          break;
        case Path2D.SERIAL_SEG_FLT_LINETO:
          isdbl = false;
          npoints = 1;
          segtype = Path2D.SEG_LINETO;
          break;
        case Path2D.SERIAL_SEG_FLT_QUADTO:
          isdbl = false;
          npoints = 2;
          segtype = Path2D.SEG_QUADTO;
          break;
        case Path2D.SERIAL_SEG_FLT_CUBICTO:
          isdbl = false;
          npoints = 3;
          segtype = Path2D.SEG_CUBICTO;
          break;
        case Path2D.SERIAL_SEG_DBL_MOVETO:
          isdbl = true;
          npoints = 1;
          segtype = Path2D.SEG_MOVETO;
          break;
        case Path2D.SERIAL_SEG_DBL_LINETO:
          isdbl = true;
          npoints = 1;
          segtype = Path2D.SEG_LINETO;
          break;
        case Path2D.SERIAL_SEG_DBL_QUADTO:
          isdbl = true;
          npoints = 2;
          segtype = Path2D.SEG_QUADTO;
          break;
        case Path2D.SERIAL_SEG_DBL_CUBICTO:
          isdbl = true;
          npoints = 3;
          segtype = Path2D.SEG_CUBICTO;
          break;
        case Path2D.SERIAL_SEG_CLOSE:
          isdbl = false;
          npoints = 0;
          segtype = Path2D.SEG_CLOSE;
          break;
        case Path2D.SERIAL_PATH_END:
          if (nT < 0) {
            break PATHDONE;
          }
          throw new StreamCorruptedException('unexpected PATH_END');
        default:
          throw new StreamCorruptedException('unrecognized path type');
      }
      this.needRoom(segtype !== Path2D.SEG_MOVETO, Math.imul(npoints, 2));
      if (isdbl) {
        while (--npoints >= 0) {
          this.append$double$double(s.readDouble(), s.readDouble());
        }
      } else {
        while (--npoints >= 0) {
          this.append$float$float(s.readFloat(), s.readFloat());
        }
      }
      this.pointTypes[this.numTypes++] = segtype;
    }
    if (nT >= 0 && s.readByte() !== Path2D.SERIAL_PATH_END) {
      throw new StreamCorruptedException('missing PATH_END');
    }
  }
}

/**
 * The {@code Float} class defines a geometric path with
 * coordinates stored in single precision floating point.
 *
 * @since 1.6
 */
export class Path2D$Float extends Path2D {
  floatCoords: number[] = null;
  /**
   * Constructs a new empty single precision {@code Path2D} object
   * with a default winding rule of {@link #WIND_NON_ZERO}.
   *
   * @since 1.6
   */
  _Path2D$Float$(): this {
    this._Path2D$Float$int$int(Path2D.WIND_NON_ZERO, Path2D.INIT_SIZE);
    return this;
  }
  /**
   * Constructs a new empty single precision {@code Path2D} object
   * with the specified winding rule to control operations that
   * require the interior of the path to be defined.
   *
   * @param rule the winding rule
   * @throws IllegalArgumentException if {@code rule} is not either
   *         {@link #WIND_EVEN_ODD} or {@link #WIND_NON_ZERO}
   * @see #WIND_EVEN_ODD
   * @see #WIND_NON_ZERO
   * @since 1.6
   */
  _Path2D$Float$int(rule: number): this {
    this._Path2D$Float$int$int(rule, Path2D.INIT_SIZE);
    return this;
  }
  /**
   * Constructs a new empty single precision {@code Path2D} object
   * with the specified winding rule and the specified initial
   * capacity to store path segments.
   * This number is an initial guess as to how many path segments
   * will be added to the path, but the storage is expanded as
   * needed to store whatever path segments are added.
   *
   * @param rule the winding rule
   * @param initialCapacity the estimate for the number of path segments
   *                        in the path
   * @throws IllegalArgumentException if {@code rule} is not either
   *         {@link #WIND_EVEN_ODD} or {@link #WIND_NON_ZERO}
   * @throws NegativeArraySizeException if {@code initialCapacity} is
   *         negative
   * @see #WIND_EVEN_ODD
   * @see #WIND_NON_ZERO
   * @since 1.6
   */
  _Path2D$Float$int$int(rule: number, initialCapacity: number): this {
    this._Path2D$int$int(rule, initialCapacity);
    this.floatCoords = $J.newArray(Math.imul(initialCapacity, 2), 0);
    return this;
  }
  /**
   * Constructs a new single precision {@code Path2D} object
   * from an arbitrary {@link Shape} object.
   * All of the initial geometry and the winding rule for this path are
   * taken from the specified {@code Shape} object.
   *
   * @param s the specified {@code Shape} object
   * @throws NullPointerException if {@code s} is {@code null}
   * @since 1.6
   */
  _Path2D$Float$Shape(s: Shape): this {
    this._Path2D$Float$Shape$AffineTransform(s, null);
    return this;
  }
  /**
   * Constructs a new single precision {@code Path2D} object
   * from an arbitrary {@link Shape} object, transformed by an
   * {@link AffineTransform} object.
   * All of the initial geometry and the winding rule for this path are
   * taken from the specified {@code Shape} object and transformed
   * by the specified {@code AffineTransform} object.
   *
   * @param s the specified {@code Shape} object
   * @param at the specified {@code AffineTransform} object
   * @throws NullPointerException if {@code s} is {@code null}
   * @since 1.6
   */
  _Path2D$Float$Shape$AffineTransform(s: Shape, at: AffineTransform): this {
    this._Path2D$();
    if (s instanceof Path2D) {
      let p2d = s;
      this.setWindingRule(p2d.windingRule);
      this.numTypes = p2d.numTypes;
      this.pointTypes = Arrays.copyOf(p2d.pointTypes, p2d.numTypes);
      this.numCoords = p2d.numCoords;
      this.floatCoords = p2d.cloneCoordsFloat(at);
    } else {
      let pi = s.getPathIterator$AffineTransform(at);
      this.setWindingRule(pi.getWindingRule());
      this.pointTypes = $J.newArray(Path2D.INIT_SIZE, 0);
      this.floatCoords = $J.newArray(Math.imul(Path2D.INIT_SIZE, 2), 0);
      this.append$PathIterator$boolean(pi, false);
    }
    return this;
  }
  trimToSize(): void {
    if (this.numTypes < this.pointTypes.length) {
      this.pointTypes = Arrays.copyOf(this.pointTypes, this.numTypes);
    }
    if (this.numCoords < this.floatCoords.length) {
      this.floatCoords = Arrays.copyOf(this.floatCoords, this.numCoords);
    }
  }
  cloneCoordsFloat(at: AffineTransform): number[] {
    let ret: number[];
    if (at == null) {
      ret = Arrays.copyOf(this.floatCoords, this.numCoords);
    } else {
      ret = $J.newArray(this.numCoords, 0);
      at.transform$floatArr$int$floatArr$int$int(this.floatCoords, 0, ret, 0, $J.idiv(this.numCoords, 2));
    }
    return ret;
  }
  cloneCoordsDouble(at: AffineTransform): number[] {
    let ret = $J.newArray(this.numCoords, 0);
    if (at == null) {
      for (let i = 0; i < this.numCoords; i++) {
        ret[i] = this.floatCoords[i];
      }
    } else {
      at.transform$floatArr$int$doubleArr$int$int(this.floatCoords, 0, ret, 0, $J.idiv(this.numCoords, 2));
    }
    return ret;
  }
  append$float$float(x: number, y: number): void {
    this.floatCoords[this.numCoords++] = x;
    this.floatCoords[this.numCoords++] = y;
  }
  append$double$double(x: number, y: number): void {
    this.floatCoords[this.numCoords++] = Math.fround(x);
    this.floatCoords[this.numCoords++] = Math.fround(y);
  }
  getPoint(coordindex: number): Point2D {
    return new Point2D$Float()._Point2D$Float$float$float(this.floatCoords[coordindex], this.floatCoords[(coordindex + 1) | 0]);
  }
  needRoom(needMove: boolean, newCoords: number): void {
    if ((this.numTypes === 0) && needMove) {
      throw new IllegalPathStateException()._IllegalPathStateException$String('missing initial moveto in path definition');
    }
    if (this.numTypes >= this.pointTypes.length) {
      this.pointTypes = Path2D.expandPointTypes(this.pointTypes, 1);
    }
    if (this.numCoords > ((this.floatCoords.length - newCoords) | 0)) {
      this.floatCoords = Path2D$Float.expandCoords(this.floatCoords, newCoords);
    }
  }
  static expandCoords(oldCoords: number[], needed: number): number[] {
    let oldSize = oldCoords.length;
    let newSizeMin = (oldSize + needed) | 0;
    if (newSizeMin < oldSize) {
      throw new ArrayIndexOutOfBoundsException('coords exceeds maximum capacity !');
    }
    let grow = oldSize;
    if (grow > Path2D.EXPAND_MAX_COORDS) {
      grow = Math.max(Path2D.EXPAND_MAX_COORDS, oldSize >> 3);
    } else if (grow < Path2D.EXPAND_MIN) {
      grow = Path2D.EXPAND_MIN;
    }
    // assert grow > needed
    let newSize = (oldSize + grow) | 0;
    if (newSize < newSizeMin) {
      newSize = 2147483647;
    }
    while (true) {
      try {
        return Arrays.copyOf(oldCoords, newSize);
      } catch ($e2) {
        if ($J.isa($e2, OutOfMemoryError)) {
          let oome = $J.exc($e2);
          if (newSize === newSizeMin) {
            throw oome;
          }
        } else {
          throw $e2;
        }
      }
      newSize = (newSizeMin + $J.idiv(((newSize - newSizeMin) | 0), 2)) | 0;
    }
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  moveTo$double$double(x: number, y: number): void {
    if (this.numTypes > 0 && (this.pointTypes[(this.numTypes - 1) | 0]) === Path2D.SEG_MOVETO) {
      (this.floatCoords[(this.numCoords - 2) | 0]) = Math.fround(x);
      (this.floatCoords[(this.numCoords - 1) | 0]) = Math.fround(y);
    } else {
      this.needRoom(false, 2);
      this.pointTypes[this.numTypes++] = Path2D.SEG_MOVETO;
      this.floatCoords[this.numCoords++] = Math.fround(x);
      this.floatCoords[this.numCoords++] = Math.fround(y);
    }
  }
  /**
   * Adds a point to the path by moving to the specified
   * coordinates specified in float precision.
   * <p>
   * This method provides a single precision variant of
   * the double precision {@code moveTo()} method on the
   * base {@code Path2D} class.
   *
   * @param x the specified X coordinate
   * @param y the specified Y coordinate
   * @see Path2D#moveTo
   * @since 1.6
   */
  moveTo$float$float(x: number, y: number): void {
    if (this.numTypes > 0 && (this.pointTypes[(this.numTypes - 1) | 0]) === Path2D.SEG_MOVETO) {
      (this.floatCoords[(this.numCoords - 2) | 0]) = x;
      (this.floatCoords[(this.numCoords - 1) | 0]) = y;
    } else {
      this.needRoom(false, 2);
      this.pointTypes[this.numTypes++] = Path2D.SEG_MOVETO;
      this.floatCoords[this.numCoords++] = x;
      this.floatCoords[this.numCoords++] = y;
    }
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  lineTo$double$double(x: number, y: number): void {
    this.needRoom(true, 2);
    this.pointTypes[this.numTypes++] = Path2D.SEG_LINETO;
    this.floatCoords[this.numCoords++] = Math.fround(x);
    this.floatCoords[this.numCoords++] = Math.fround(y);
  }
  /**
   * Adds a point to the path by drawing a straight line from the
   * current coordinates to the new specified coordinates
   * specified in float precision.
   * <p>
   * This method provides a single precision variant of
   * the double precision {@code lineTo()} method on the
   * base {@code Path2D} class.
   *
   * @param x the specified X coordinate
   * @param y the specified Y coordinate
   * @see Path2D#lineTo
   * @since 1.6
   */
  lineTo$float$float(x: number, y: number): void {
    this.needRoom(true, 2);
    this.pointTypes[this.numTypes++] = Path2D.SEG_LINETO;
    this.floatCoords[this.numCoords++] = x;
    this.floatCoords[this.numCoords++] = y;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  quadTo$double$double$double$double(x1: number, y1: number, x2: number, y2: number): void {
    this.needRoom(true, 4);
    this.pointTypes[this.numTypes++] = Path2D.SEG_QUADTO;
    this.floatCoords[this.numCoords++] = Math.fround(x1);
    this.floatCoords[this.numCoords++] = Math.fround(y1);
    this.floatCoords[this.numCoords++] = Math.fround(x2);
    this.floatCoords[this.numCoords++] = Math.fround(y2);
  }
  /**
   * Adds a curved segment, defined by two new points, to the path by
   * drawing a Quadratic curve that intersects both the current
   * coordinates and the specified coordinates {@code (x2,y2)},
   * using the specified point {@code (x1,y1)} as a quadratic
   * parametric control point.
   * All coordinates are specified in float precision.
   * <p>
   * This method provides a single precision variant of
   * the double precision {@code quadTo()} method on the
   * base {@code Path2D} class.
   *
   * @param x1 the X coordinate of the quadratic control point
   * @param y1 the Y coordinate of the quadratic control point
   * @param x2 the X coordinate of the final end point
   * @param y2 the Y coordinate of the final end point
   * @see Path2D#quadTo
   * @since 1.6
   */
  quadTo$float$float$float$float(x1: number, y1: number, x2: number, y2: number): void {
    this.needRoom(true, 4);
    this.pointTypes[this.numTypes++] = Path2D.SEG_QUADTO;
    this.floatCoords[this.numCoords++] = x1;
    this.floatCoords[this.numCoords++] = y1;
    this.floatCoords[this.numCoords++] = x2;
    this.floatCoords[this.numCoords++] = y2;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  curveTo$double$double$double$double$double$double(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
    this.needRoom(true, 6);
    this.pointTypes[this.numTypes++] = Path2D.SEG_CUBICTO;
    this.floatCoords[this.numCoords++] = Math.fround(x1);
    this.floatCoords[this.numCoords++] = Math.fround(y1);
    this.floatCoords[this.numCoords++] = Math.fround(x2);
    this.floatCoords[this.numCoords++] = Math.fround(y2);
    this.floatCoords[this.numCoords++] = Math.fround(x3);
    this.floatCoords[this.numCoords++] = Math.fround(y3);
  }
  /**
   * Adds a curved segment, defined by three new points, to the path by
   * drawing a B&eacute;zier curve that intersects both the current
   * coordinates and the specified coordinates {@code (x3,y3)},
   * using the specified points {@code (x1,y1)} and {@code (x2,y2)} as
   * B&eacute;zier control points.
   * All coordinates are specified in float precision.
   * <p>
   * This method provides a single precision variant of
   * the double precision {@code curveTo()} method on the
   * base {@code Path2D} class.
   *
   * @param x1 the X coordinate of the first B&eacute;zier control point
   * @param y1 the Y coordinate of the first B&eacute;zier control point
   * @param x2 the X coordinate of the second B&eacute;zier control point
   * @param y2 the Y coordinate of the second B&eacute;zier control point
   * @param x3 the X coordinate of the final end point
   * @param y3 the Y coordinate of the final end point
   * @see Path2D#curveTo
   * @since 1.6
   */
  curveTo$float$float$float$float$float$float(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
    this.needRoom(true, 6);
    this.pointTypes[this.numTypes++] = Path2D.SEG_CUBICTO;
    this.floatCoords[this.numCoords++] = x1;
    this.floatCoords[this.numCoords++] = y1;
    this.floatCoords[this.numCoords++] = x2;
    this.floatCoords[this.numCoords++] = y2;
    this.floatCoords[this.numCoords++] = x3;
    this.floatCoords[this.numCoords++] = y3;
  }
  pointCrossings(px: number, py: number): number {
    if (this.numTypes === 0) {
      return 0;
    }
    let movx: number;
    let movy: number;
    let curx: number;
    let cury: number;
    let endx: number;
    let endy: number;
    let coords = this.floatCoords;
    curx = movx = coords[0];
    cury = movy = coords[1];
    let crossings = 0;
    let ci = 2;
    for (let i = 1; i < this.numTypes; i++) {
      switch (this.pointTypes[i]) {
        case PathIterator.SEG_MOVETO:
          if (cury !== movy) {
            crossings = (crossings + Curve.pointCrossingsForLine(px, py, curx, cury, movx, movy)) | 0;
          }
          movx = curx = coords[ci++];
          movy = cury = coords[ci++];
          break;
        case PathIterator.SEG_LINETO:
          crossings = (crossings + (Curve.pointCrossingsForLine(px, py, curx, cury, endx = coords[ci++], endy = coords[ci++]))) | 0;
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_QUADTO:
          crossings = (crossings + Curve.pointCrossingsForQuad(px, py, curx, cury, coords[ci++], coords[ci++], endx = coords[ci++], endy = coords[ci++], 0)) | 0;
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_CUBICTO:
          crossings = (crossings + Curve.pointCrossingsForCubic(px, py, curx, cury, coords[ci++], coords[ci++], coords[ci++], coords[ci++], endx = coords[ci++], endy = coords[ci++], 0)) | 0;
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_CLOSE:
          if (cury !== movy) {
            crossings = (crossings + Curve.pointCrossingsForLine(px, py, curx, cury, movx, movy)) | 0;
          }
          curx = movx;
          cury = movy;
          break;
      }
    }
    if (cury !== movy) {
      crossings = (crossings + Curve.pointCrossingsForLine(px, py, curx, cury, movx, movy)) | 0;
    }
    return crossings;
  }
  rectCrossings(rxmin: number, rymin: number, rxmax: number, rymax: number): number {
    if (this.numTypes === 0) {
      return 0;
    }
    let coords = this.floatCoords;
    let curx: number;
    let cury: number;
    let movx: number;
    let movy: number;
    let endx: number;
    let endy: number;
    curx = movx = coords[0];
    cury = movy = coords[1];
    let crossings = 0;
    let ci = 2;
    for (let i = 1; crossings !== Curve.RECT_INTERSECTS && i < this.numTypes; i++) {
      switch (this.pointTypes[i]) {
        case PathIterator.SEG_MOVETO:
          if (curx !== movx || cury !== movy) {
            crossings = Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, curx, cury, movx, movy);
          }
          movx = curx = coords[ci++];
          movy = cury = coords[ci++];
          break;
        case PathIterator.SEG_LINETO:
          crossings = Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, curx, cury, endx = coords[ci++], endy = coords[ci++]);
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_QUADTO:
          crossings = Curve.rectCrossingsForQuad(crossings, rxmin, rymin, rxmax, rymax, curx, cury, coords[ci++], coords[ci++], endx = coords[ci++], endy = coords[ci++], 0);
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_CUBICTO:
          crossings = Curve.rectCrossingsForCubic(crossings, rxmin, rymin, rxmax, rymax, curx, cury, coords[ci++], coords[ci++], coords[ci++], coords[ci++], endx = coords[ci++], endy = coords[ci++], 0);
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_CLOSE:
          if (curx !== movx || cury !== movy) {
            crossings = Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, curx, cury, movx, movy);
          }
          curx = movx;
          cury = movy;
          break;
      }
    }
    if (crossings !== Curve.RECT_INTERSECTS && (curx !== movx || cury !== movy)) {
      crossings = Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, curx, cury, movx, movy);
    }
    return crossings;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  append$PathIterator$boolean(pi: PathIterator, connect: boolean): void {
    let coords = $J.newArray(6, 0);
    while (!pi.isDone()) {
      switch (pi.currentSegment$floatArr(coords)) {
        case Path2D.SEG_MOVETO:
          if (!connect || this.numTypes < 1 || this.numCoords < 1) {
            this.moveTo$float$float(coords[0], coords[1]);
            break;
          }
          if ((this.pointTypes[(this.numTypes - 1) | 0]) !== Path2D.SEG_CLOSE && (this.floatCoords[(this.numCoords - 2) | 0]) === coords[0] && (this.floatCoords[(this.numCoords - 1) | 0]) === coords[1]) {
            break;
          }
          this.lineTo$float$float(coords[0], coords[1]);
          break;
        case Path2D.SEG_LINETO:
          this.lineTo$float$float(coords[0], coords[1]);
          break;
        case Path2D.SEG_QUADTO:
          this.quadTo$float$float$float$float(coords[0], coords[1], coords[2], coords[3]);
          break;
        case Path2D.SEG_CUBICTO:
          this.curveTo$float$float$float$float$float$float(coords[0], coords[1], coords[2], coords[3], coords[4], coords[5]);
          break;
        case Path2D.SEG_CLOSE:
          this.closePath();
          break;
      }
      pi.next$();
      connect = false;
    }
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  transform(at: AffineTransform): void {
    at.transform$floatArr$int$floatArr$int$int(this.floatCoords, 0, this.floatCoords, 0, $J.idiv(this.numCoords, 2));
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  getBounds2D(): Rectangle2D {
    return Path2D.getBounds2D(this.getPathIterator$AffineTransform(null));
  }
  /**
   * {@inheritDoc}
   * <p>
   * The iterator for this class is not multi-threaded safe,
   * which means that the {@code Path2D} class does not
   * guarantee that modifications to the geometry of this
   * {@code Path2D} object do not affect any iterations of
   * that geometry that are already in process.
   *
   * @since 1.6
   */
  getPathIterator$AffineTransform(at: AffineTransform): PathIterator {
    if (at == null) {
      return new Path2D$Float$CopyIterator()._Path2D$Float$CopyIterator(this);
    } else {
      return new Path2D$Float$TxIterator()._Path2D$Float$TxIterator(this, at);
    }
  }
  /**
   * Creates a new object of the same class as this object.
   *
   * @return     a clone of this instance.
   * @throws  OutOfMemoryError    if there is not enough memory.
   * @see        java.lang.Cloneable
   * @since      1.6
   */
  clone(): any {
    if (this instanceof GeneralPath) {
      return new GeneralPath()._GeneralPath$Shape(this);
    } else {
      return new Path2D$Float()._Path2D$Float$Shape(this);
    }
  }
  /**
   * Writes the default serializable fields to the
   * {@code ObjectOutputStream} followed by an explicit
   * serialization of the path segments stored in this
   * path.
   *
   * @param  s the {@code ObjectOutputStream} to write
   * @throws IOException if an I/O error occurs
   * @serialData
   * <ol>
   * <li>The default serializable fields.
   * There are no default serializable fields as of 1.6.
   * <li>followed by
   * a byte indicating the storage type of the original object
   * as a hint (SERIAL_STORAGE_FLT_ARRAY)
   * <li>followed by
   * an integer indicating the number of path segments to follow (NP)
   * or -1 to indicate an unknown number of path segments follows
   * <li>followed by
   * an integer indicating the total number of coordinates to follow (NC)
   * or -1 to indicate an unknown number of coordinates follows
   * (NC should always be even since coordinates always appear in pairs
   *  representing an x,y pair)
   * <li>followed by
   * a byte indicating the winding rule
   * ({@link #WIND_EVEN_ODD WIND_EVEN_ODD} or
   *  {@link #WIND_NON_ZERO WIND_NON_ZERO})
   * <li>followed by
   * {@code NP} (or unlimited if {@code NP < 0}) sets of values consisting of
   * a single byte indicating a path segment type
   * followed by one or more pairs of float or double
   * values representing the coordinates of the path segment
   * <li>followed by
   * a byte indicating the end of the path (SERIAL_PATH_END).
   * </ol>
   * <p>
   * The following byte value constants are used in the serialized form
   * of {@code Path2D} objects:
   *
   * <table class="striped">
   * <caption>Constants</caption>
   * <thead>
   * <tr>
   * <th scope="col">Constant Name</th>
   * <th scope="col">Byte Value</th>
   * <th scope="col">Followed by</th>
   * <th scope="col">Description</th>
   * </tr>
   * </thead>
   * <tbody>
   * <tr>
   * <th scope="row">{@code SERIAL_STORAGE_FLT_ARRAY}</th>
   * <td>0x30</td>
   * <td></td>
   * <td>A hint that the original {@code Path2D} object stored
   * the coordinates in a Java array of floats.</td>
   * </tr>
   * <tr>
   * <th scope="row">{@code SERIAL_STORAGE_DBL_ARRAY}</th>
   * <td>0x31</td>
   * <td></td>
   * <td>A hint that the original {@code Path2D} object stored
   * the coordinates in a Java array of doubles.</td>
   * </tr>
   * <tr>
   * <th scope="row">{@code SERIAL_SEG_FLT_MOVETO}</th>
   * <td>0x40</td>
   * <td>2 floats</td>
   * <td>A {@link #moveTo moveTo} path segment follows.</td>
   * </tr>
   * <tr>
   * <th scope="row">{@code SERIAL_SEG_FLT_LINETO}</th>
   * <td>0x41</td>
   * <td>2 floats</td>
   * <td>A {@link #lineTo lineTo} path segment follows.</td>
   * </tr>
   * <tr>
   * <th scope="row">{@code SERIAL_SEG_FLT_QUADTO}</th>
   * <td>0x42</td>
   * <td>4 floats</td>
   * <td>A {@link #quadTo quadTo} path segment follows.</td>
   * </tr>
   * <tr>
   * <th scope="row">{@code SERIAL_SEG_FLT_CUBICTO}</th>
   * <td>0x43</td>
   * <td>6 floats</td>
   * <td>A {@link #curveTo curveTo} path segment follows.</td>
   * </tr>
   * <tr>
   * <th scope="row">{@code SERIAL_SEG_DBL_MOVETO}</th>
   * <td>0x50</td>
   * <td>2 doubles</td>
   * <td>A {@link #moveTo moveTo} path segment follows.</td>
   * </tr>
   * <tr>
   * <th scope="row">{@code SERIAL_SEG_DBL_LINETO}</th>
   * <td>0x51</td>
   * <td>2 doubles</td>
   * <td>A {@link #lineTo lineTo} path segment follows.</td>
   * </tr>
   * <tr>
   * <th scope="row">{@code SERIAL_SEG_DBL_QUADTO}</th>
   * <td>0x52</td>
   * <td>4 doubles</td>
   * <td>A {@link #curveTo curveTo} path segment follows.</td>
   * </tr>
   * <tr>
   * <th scope="row">{@code SERIAL_SEG_DBL_CUBICTO}</th>
   * <td>0x53</td>
   * <td>6 doubles</td>
   * <td>A {@link #curveTo curveTo} path segment follows.</td>
   * </tr>
   * <tr>
   * <th scope="row">{@code SERIAL_SEG_CLOSE}</th>
   * <td>0x60</td>
   * <td></td>
   * <td>A {@link #closePath closePath} path segment.</td>
   * </tr>
   * <tr>
   * <th scope="row">{@code SERIAL_PATH_END}</th>
   * <td>0x61</td>
   * <td></td>
   * <td>There are no more path segments following.</td>
   * </tbody>
   * </table>
   *
   * @since 1.6
   */
  writeObject$ObjectOutputStream$Path2D_Float(s: ObjectOutputStream): void {
    super.writeObject$ObjectOutputStream$boolean(s, false);
  }
  /**
   * Reads the default serializable fields from the
   * {@code ObjectInputStream} followed by an explicit
   * serialization of the path segments stored in this
   * path.
   * <p>
   * There are no default serializable fields as of 1.6.
   * <p>
   * The serial data for this object is described in the
   * writeObject method.
   *
   * @param  s the {@code ObjectInputStream} to read
   * @throws ClassNotFoundException if the class of a serialized object
   *         could not be found
   * @throws IOException if an I/O error occurs
   * @since 1.6
   */
  readObject$ObjectInputStream$Path2D_Float(s: ObjectInputStream): void {
    super.readObject$ObjectInputStream$boolean(s, false);
  }
}

export class Path2D$Iterator extends JObject {
  typeIdx: number = 0;
  pointIdx: number = 0;
  path: Path2D = null;
  static curvecoords: number[] = null;
  _Path2D$Iterator(path: Path2D): this {
    this.path = path;
    return this;
  }
  getWindingRule(): number {
    return this.path.getWindingRule();
  }
  isDone(): boolean {
    return (this.typeIdx >= this.path.numTypes);
  }
  next$(): void {
    let type$ = this.path.pointTypes[this.typeIdx++];
    this.pointIdx = (this.pointIdx + Path2D$Iterator.curvecoords[type$]) | 0;
  }
  static $clinit() {
    Path2D$Iterator.curvecoords = [2, 2, 4, 6, 0];
  }
}

export class Path2D$Float$CopyIterator extends Path2D$Iterator {
  floatCoords: number[] = null;
  _Path2D$Float$CopyIterator(p2df: Path2D$Float): this {
    this._Path2D$Iterator(p2df);
    this.floatCoords = p2df.floatCoords;
    return this;
  }
  currentSegment$floatArr(coords: number[]): number {
    let type$ = this.path.pointTypes[this.typeIdx];
    let numCoords = Path2D$Iterator.curvecoords[type$];
    if (numCoords > 0) {
      $J.system_arraycopy(this.floatCoords, this.pointIdx, coords, 0, numCoords);
    }
    return type$;
  }
  currentSegment$doubleArr(coords: number[]): number {
    let type$ = this.path.pointTypes[this.typeIdx];
    let numCoords = Path2D$Iterator.curvecoords[type$];
    if (numCoords > 0) {
      for (let i = 0; i < numCoords; i++) {
        coords[i] = this.floatCoords[(this.pointIdx + i) | 0];
      }
    }
    return type$;
  }
}

export class Path2D$Float$TxIterator extends Path2D$Iterator {
  floatCoords: number[] = null;
  affine: AffineTransform = null;
  _Path2D$Float$TxIterator(p2df: Path2D$Float, at: AffineTransform): this {
    this._Path2D$Iterator(p2df);
    this.floatCoords = p2df.floatCoords;
    this.affine = at;
    return this;
  }
  currentSegment$floatArr(coords: number[]): number {
    let type$ = this.path.pointTypes[this.typeIdx];
    let numCoords = Path2D$Iterator.curvecoords[type$];
    if (numCoords > 0) {
      this.affine.transform$floatArr$int$floatArr$int$int(this.floatCoords, this.pointIdx, coords, 0, $J.idiv(numCoords, 2));
    }
    return type$;
  }
  currentSegment$doubleArr(coords: number[]): number {
    let type$ = this.path.pointTypes[this.typeIdx];
    let numCoords = Path2D$Iterator.curvecoords[type$];
    if (numCoords > 0) {
      this.affine.transform$floatArr$int$doubleArr$int$int(this.floatCoords, this.pointIdx, coords, 0, $J.idiv(numCoords, 2));
    }
    return type$;
  }
}

/**
 * The {@code Double} class defines a geometric path with
 * coordinates stored in double precision floating point.
 *
 * @since 1.6
 */
export class Path2D$Double extends Path2D {
  doubleCoords: number[] = null;
  /**
   * Constructs a new empty double precision {@code Path2D} object
   * with a default winding rule of {@link #WIND_NON_ZERO}.
   *
   * @since 1.6
   */
  _Path2D$Double$(): this {
    this._Path2D$Double$int$int(Path2D.WIND_NON_ZERO, Path2D.INIT_SIZE);
    return this;
  }
  /**
   * Constructs a new empty double precision {@code Path2D} object
   * with the specified winding rule and the specified initial
   * capacity to store path segments.
   * This number is an initial guess as to how many path segments
   * are in the path, but the storage is expanded as needed to store
   * whatever path segments are added to this path.
   *
   * @param rule the winding rule
   * @param initialCapacity the estimate for the number of path segments
   *                        in the path
   * @throws IllegalArgumentException if {@code rule} is not either
   *         {@link #WIND_EVEN_ODD} or {@link #WIND_NON_ZERO}
   * @throws NegativeArraySizeException if {@code initialCapacity} is
   *         negative
   * @see #WIND_EVEN_ODD
   * @see #WIND_NON_ZERO
   * @since 1.6
   */
  _Path2D$Double$int$int(rule: number, initialCapacity: number): this {
    this._Path2D$int$int(rule, initialCapacity);
    this.doubleCoords = $J.newArray(Math.imul(initialCapacity, 2), 0);
    return this;
  }
  /**
   * Constructs a new double precision {@code Path2D} object
   * from an arbitrary {@link Shape} object.
   * All of the initial geometry and the winding rule for this path are
   * taken from the specified {@code Shape} object.
   *
   * @param s the specified {@code Shape} object
   * @throws NullPointerException if {@code s} is {@code null}
   * @since 1.6
   */
  _Path2D$Double$Shape(s: Shape): this {
    this._Path2D$Double$Shape$AffineTransform(s, null);
    return this;
  }
  /**
   * Constructs a new double precision {@code Path2D} object
   * from an arbitrary {@link Shape} object, transformed by an
   * {@link AffineTransform} object.
   * All of the initial geometry and the winding rule for this path are
   * taken from the specified {@code Shape} object and transformed
   * by the specified {@code AffineTransform} object.
   *
   * @param s the specified {@code Shape} object
   * @param at the specified {@code AffineTransform} object
   * @throws NullPointerException if {@code s} is {@code null}
   * @since 1.6
   */
  _Path2D$Double$Shape$AffineTransform(s: Shape, at: AffineTransform): this {
    this._Path2D$();
    if (s instanceof Path2D) {
      let p2d = s;
      this.setWindingRule(p2d.windingRule);
      this.numTypes = p2d.numTypes;
      this.pointTypes = Arrays.copyOf(p2d.pointTypes, p2d.numTypes);
      this.numCoords = p2d.numCoords;
      this.doubleCoords = p2d.cloneCoordsDouble(at);
    } else {
      let pi = s.getPathIterator$AffineTransform(at);
      this.setWindingRule(pi.getWindingRule());
      this.pointTypes = $J.newArray(Path2D.INIT_SIZE, 0);
      this.doubleCoords = $J.newArray(Math.imul(Path2D.INIT_SIZE, 2), 0);
      this.append$PathIterator$boolean(pi, false);
    }
    return this;
  }
  cloneCoordsFloat(at: AffineTransform): number[] {
    let ret = $J.newArray(this.numCoords, 0);
    if (at == null) {
      for (let i = 0; i < this.numCoords; i++) {
        ret[i] = Math.fround(this.doubleCoords[i]);
      }
    } else {
      at.transform$doubleArr$int$floatArr$int$int(this.doubleCoords, 0, ret, 0, $J.idiv(this.numCoords, 2));
    }
    return ret;
  }
  cloneCoordsDouble(at: AffineTransform): number[] {
    let ret: number[];
    if (at == null) {
      ret = Arrays.copyOf(this.doubleCoords, this.numCoords);
    } else {
      ret = $J.newArray(this.numCoords, 0);
      at.transform$doubleArr$int$doubleArr$int$int(this.doubleCoords, 0, ret, 0, $J.idiv(this.numCoords, 2));
    }
    return ret;
  }
  append$float$float(x: number, y: number): void {
    this.doubleCoords[this.numCoords++] = x;
    this.doubleCoords[this.numCoords++] = y;
  }
  append$double$double(x: number, y: number): void {
    this.doubleCoords[this.numCoords++] = x;
    this.doubleCoords[this.numCoords++] = y;
  }
  getPoint(coordindex: number): Point2D {
    return new Point2D$Double()._Point2D$Double$double$double(this.doubleCoords[coordindex], this.doubleCoords[(coordindex + 1) | 0]);
  }
  needRoom(needMove: boolean, newCoords: number): void {
    if ((this.numTypes === 0) && needMove) {
      throw new IllegalPathStateException()._IllegalPathStateException$String('missing initial moveto in path definition');
    }
    if (this.numTypes >= this.pointTypes.length) {
      this.pointTypes = Path2D.expandPointTypes(this.pointTypes, 1);
    }
    if (this.numCoords > ((this.doubleCoords.length - newCoords) | 0)) {
      this.doubleCoords = Path2D$Double.expandCoords(this.doubleCoords, newCoords);
    }
  }
  static expandCoords(oldCoords: number[], needed: number): number[] {
    let oldSize = oldCoords.length;
    let newSizeMin = (oldSize + needed) | 0;
    if (newSizeMin < oldSize) {
      throw new ArrayIndexOutOfBoundsException('coords exceeds maximum capacity !');
    }
    let grow = oldSize;
    if (grow > Path2D.EXPAND_MAX_COORDS) {
      grow = Math.max(Path2D.EXPAND_MAX_COORDS, oldSize >> 3);
    } else if (grow < Path2D.EXPAND_MIN) {
      grow = Path2D.EXPAND_MIN;
    }
    // assert grow > needed
    let newSize = (oldSize + grow) | 0;
    if (newSize < newSizeMin) {
      newSize = 2147483647;
    }
    while (true) {
      try {
        return Arrays.copyOf(oldCoords, newSize);
      } catch ($e3) {
        if ($J.isa($e3, OutOfMemoryError)) {
          let oome = $J.exc($e3);
          if (newSize === newSizeMin) {
            throw oome;
          }
        } else {
          throw $e3;
        }
      }
      newSize = (newSizeMin + $J.idiv(((newSize - newSizeMin) | 0), 2)) | 0;
    }
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  moveTo$double$double(x: number, y: number): void {
    if (this.numTypes > 0 && (this.pointTypes[(this.numTypes - 1) | 0]) === Path2D.SEG_MOVETO) {
      (this.doubleCoords[(this.numCoords - 2) | 0]) = x;
      (this.doubleCoords[(this.numCoords - 1) | 0]) = y;
    } else {
      this.needRoom(false, 2);
      this.pointTypes[this.numTypes++] = Path2D.SEG_MOVETO;
      this.doubleCoords[this.numCoords++] = x;
      this.doubleCoords[this.numCoords++] = y;
    }
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  lineTo$double$double(x: number, y: number): void {
    this.needRoom(true, 2);
    this.pointTypes[this.numTypes++] = Path2D.SEG_LINETO;
    this.doubleCoords[this.numCoords++] = x;
    this.doubleCoords[this.numCoords++] = y;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  quadTo$double$double$double$double(x1: number, y1: number, x2: number, y2: number): void {
    this.needRoom(true, 4);
    this.pointTypes[this.numTypes++] = Path2D.SEG_QUADTO;
    this.doubleCoords[this.numCoords++] = x1;
    this.doubleCoords[this.numCoords++] = y1;
    this.doubleCoords[this.numCoords++] = x2;
    this.doubleCoords[this.numCoords++] = y2;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  curveTo$double$double$double$double$double$double(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
    this.needRoom(true, 6);
    this.pointTypes[this.numTypes++] = Path2D.SEG_CUBICTO;
    this.doubleCoords[this.numCoords++] = x1;
    this.doubleCoords[this.numCoords++] = y1;
    this.doubleCoords[this.numCoords++] = x2;
    this.doubleCoords[this.numCoords++] = y2;
    this.doubleCoords[this.numCoords++] = x3;
    this.doubleCoords[this.numCoords++] = y3;
  }
  pointCrossings(px: number, py: number): number {
    if (this.numTypes === 0) {
      return 0;
    }
    let movx: number;
    let movy: number;
    let curx: number;
    let cury: number;
    let endx: number;
    let endy: number;
    let coords = this.doubleCoords;
    curx = movx = coords[0];
    cury = movy = coords[1];
    let crossings = 0;
    let ci = 2;
    for (let i = 1; i < this.numTypes; i++) {
      switch (this.pointTypes[i]) {
        case PathIterator.SEG_MOVETO:
          if (cury !== movy) {
            crossings = (crossings + Curve.pointCrossingsForLine(px, py, curx, cury, movx, movy)) | 0;
          }
          movx = curx = coords[ci++];
          movy = cury = coords[ci++];
          break;
        case PathIterator.SEG_LINETO:
          crossings = (crossings + (Curve.pointCrossingsForLine(px, py, curx, cury, endx = coords[ci++], endy = coords[ci++]))) | 0;
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_QUADTO:
          crossings = (crossings + Curve.pointCrossingsForQuad(px, py, curx, cury, coords[ci++], coords[ci++], endx = coords[ci++], endy = coords[ci++], 0)) | 0;
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_CUBICTO:
          crossings = (crossings + Curve.pointCrossingsForCubic(px, py, curx, cury, coords[ci++], coords[ci++], coords[ci++], coords[ci++], endx = coords[ci++], endy = coords[ci++], 0)) | 0;
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_CLOSE:
          if (cury !== movy) {
            crossings = (crossings + Curve.pointCrossingsForLine(px, py, curx, cury, movx, movy)) | 0;
          }
          curx = movx;
          cury = movy;
          break;
      }
    }
    if (cury !== movy) {
      crossings = (crossings + Curve.pointCrossingsForLine(px, py, curx, cury, movx, movy)) | 0;
    }
    return crossings;
  }
  rectCrossings(rxmin: number, rymin: number, rxmax: number, rymax: number): number {
    if (this.numTypes === 0) {
      return 0;
    }
    let coords = this.doubleCoords;
    let curx: number;
    let cury: number;
    let movx: number;
    let movy: number;
    let endx: number;
    let endy: number;
    curx = movx = coords[0];
    cury = movy = coords[1];
    let crossings = 0;
    let ci = 2;
    for (let i = 1; crossings !== Curve.RECT_INTERSECTS && i < this.numTypes; i++) {
      switch (this.pointTypes[i]) {
        case PathIterator.SEG_MOVETO:
          if (curx !== movx || cury !== movy) {
            crossings = Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, curx, cury, movx, movy);
          }
          movx = curx = coords[ci++];
          movy = cury = coords[ci++];
          break;
        case PathIterator.SEG_LINETO:
          endx = coords[ci++];
          endy = coords[ci++];
          crossings = Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, curx, cury, endx, endy);
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_QUADTO:
          crossings = Curve.rectCrossingsForQuad(crossings, rxmin, rymin, rxmax, rymax, curx, cury, coords[ci++], coords[ci++], endx = coords[ci++], endy = coords[ci++], 0);
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_CUBICTO:
          crossings = Curve.rectCrossingsForCubic(crossings, rxmin, rymin, rxmax, rymax, curx, cury, coords[ci++], coords[ci++], coords[ci++], coords[ci++], endx = coords[ci++], endy = coords[ci++], 0);
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_CLOSE:
          if (curx !== movx || cury !== movy) {
            crossings = Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, curx, cury, movx, movy);
          }
          curx = movx;
          cury = movy;
          break;
      }
    }
    if (crossings !== Curve.RECT_INTERSECTS && (curx !== movx || cury !== movy)) {
      crossings = Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, curx, cury, movx, movy);
    }
    return crossings;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  append$PathIterator$boolean(pi: PathIterator, connect: boolean): void {
    let coords = $J.newArray(6, 0);
    while (!pi.isDone()) {
      switch (pi.currentSegment$doubleArr(coords)) {
        case Path2D.SEG_MOVETO:
          if (!connect || this.numTypes < 1 || this.numCoords < 1) {
            this.moveTo$double$double(coords[0], coords[1]);
            break;
          }
          if ((this.pointTypes[(this.numTypes - 1) | 0]) !== Path2D.SEG_CLOSE && (this.doubleCoords[(this.numCoords - 2) | 0]) === coords[0] && (this.doubleCoords[(this.numCoords - 1) | 0]) === coords[1]) {
            break;
          }
          this.lineTo$double$double(coords[0], coords[1]);
          break;
        case Path2D.SEG_LINETO:
          this.lineTo$double$double(coords[0], coords[1]);
          break;
        case Path2D.SEG_QUADTO:
          this.quadTo$double$double$double$double(coords[0], coords[1], coords[2], coords[3]);
          break;
        case Path2D.SEG_CUBICTO:
          this.curveTo$double$double$double$double$double$double(coords[0], coords[1], coords[2], coords[3], coords[4], coords[5]);
          break;
        case Path2D.SEG_CLOSE:
          this.closePath();
          break;
      }
      pi.next$();
      connect = false;
    }
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  transform(at: AffineTransform): void {
    at.transform$doubleArr$int$doubleArr$int$int(this.doubleCoords, 0, this.doubleCoords, 0, $J.idiv(this.numCoords, 2));
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  getBounds2D(): Rectangle2D {
    return Path2D.getBounds2D(this.getPathIterator$AffineTransform(null));
  }
  /**
   * {@inheritDoc}
   * <p>
   * The iterator for this class is not multi-threaded safe,
   * which means that the {@code Path2D} class does not
   * guarantee that modifications to the geometry of this
   * {@code Path2D} object do not affect any iterations of
   * that geometry that are already in process.
   *
   * @param at an {@code AffineTransform}
   * @return a new {@code PathIterator} that iterates along the boundary
   *         of this {@code Shape} and provides access to the geometry
   *         of this {@code Shape}'s outline
   * @since 1.6
   */
  getPathIterator$AffineTransform(at: AffineTransform): PathIterator {
    if (at == null) {
      return new Path2D$Double$CopyIterator()._Path2D$Double$CopyIterator(this);
    } else {
      return new Path2D$Double$TxIterator()._Path2D$Double$TxIterator(this, at);
    }
  }
  /**
   * Creates a new object of the same class as this object.
   *
   * @return     a clone of this instance.
   * @throws  OutOfMemoryError    if there is not enough memory.
   * @see        java.lang.Cloneable
   * @since      1.6
   */
  clone(): any {
    return new Path2D$Double()._Path2D$Double$Shape(this);
  }
}

export class Path2D$Double$CopyIterator extends Path2D$Iterator {
  doubleCoords: number[] = null;
  _Path2D$Double$CopyIterator(p2dd: Path2D$Double): this {
    this._Path2D$Iterator(p2dd);
    this.doubleCoords = p2dd.doubleCoords;
    return this;
  }
  currentSegment$floatArr(coords: number[]): number {
    let type$ = this.path.pointTypes[this.typeIdx];
    let numCoords = Path2D$Iterator.curvecoords[type$];
    if (numCoords > 0) {
      for (let i = 0; i < numCoords; i++) {
        coords[i] = Math.fround(this.doubleCoords[(this.pointIdx + i) | 0]);
      }
    }
    return type$;
  }
  currentSegment$doubleArr(coords: number[]): number {
    let type$ = this.path.pointTypes[this.typeIdx];
    let numCoords = Path2D$Iterator.curvecoords[type$];
    if (numCoords > 0) {
      $J.system_arraycopy(this.doubleCoords, this.pointIdx, coords, 0, numCoords);
    }
    return type$;
  }
}

export class Path2D$Double$TxIterator extends Path2D$Iterator {
  doubleCoords: number[] = null;
  affine: AffineTransform = null;
  _Path2D$Double$TxIterator(p2dd: Path2D$Double, at: AffineTransform): this {
    this._Path2D$Iterator(p2dd);
    this.doubleCoords = p2dd.doubleCoords;
    this.affine = at;
    return this;
  }
  currentSegment$floatArr(coords: number[]): number {
    let type$ = this.path.pointTypes[this.typeIdx];
    let numCoords = Path2D$Iterator.curvecoords[type$];
    if (numCoords > 0) {
      this.affine.transform$doubleArr$int$floatArr$int$int(this.doubleCoords, this.pointIdx, coords, 0, $J.idiv(numCoords, 2));
    }
    return type$;
  }
  currentSegment$doubleArr(coords: number[]): number {
    let type$ = this.path.pointTypes[this.typeIdx];
    let numCoords = Path2D$Iterator.curvecoords[type$];
    if (numCoords > 0) {
      this.affine.transform$doubleArr$int$doubleArr$int$int(this.doubleCoords, this.pointIdx, coords, 0, $J.idiv(numCoords, 2));
    }
    return type$;
  }
}

$J.define(Path2D, 'java.awt.geom.Path2D', { kind: 'class', ifaces: ['java.awt.Shape', 'java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { 'int,int': '_Path2D$int$int', '': '_Path2D$' }, meths: { 'readObject(java.io.ObjectInputStream,boolean)': 'readObject$ObjectInputStream$boolean', 'writeObject(java.io.ObjectOutputStream,boolean)': 'writeObject$ObjectOutputStream$boolean', 'getPathIterator(java.awt.geom.AffineTransform,double)': 'getPathIterator$AffineTransform$double', 'intersects(java.awt.geom.Rectangle2D)': 'intersects$Rectangle2D', 'intersects(double,double,double,double)': 'intersects$double$double$double$double', 'intersects(java.awt.geom.PathIterator,java.awt.geom.Rectangle2D)': 'intersects$PathIterator$Rectangle2D', 'intersects(java.awt.geom.PathIterator,double,double,double,double)': 'intersects$PathIterator$double$double$double$double', 'contains(java.awt.geom.Rectangle2D)': 'contains$Rectangle2D', 'contains(double,double,double,double)': 'contains$double$double$double$double', 'contains(java.awt.geom.PathIterator,java.awt.geom.Rectangle2D)': 'contains$PathIterator$Rectangle2D', 'contains(java.awt.geom.PathIterator,double,double,double,double)': 'contains$PathIterator$double$double$double$double', 'contains(java.awt.geom.Point2D)': 'contains$Point2D', 'contains(double,double)': 'contains$double$double', 'contains(java.awt.geom.PathIterator,java.awt.geom.Point2D)': 'contains$PathIterator$Point2D', 'contains(java.awt.geom.PathIterator,double,double)': 'contains$PathIterator$double$double', 'append(java.awt.geom.PathIterator,boolean)': 'append$PathIterator$boolean', 'append(java.awt.Shape,boolean)': 'append$Shape$boolean', 'curveTo(double,double,double,double,double,double)': 'curveTo$double$double$double$double$double$double', 'quadTo(double,double,double,double)': 'quadTo$double$double$double$double', 'lineTo(double,double)': 'lineTo$double$double', 'moveTo(double,double)': 'moveTo$double$double', 'append(double,double)': 'append$double$double', 'append(float,float)': 'append$float$float' } });
$J.define(Path2D$Float, 'java.awt.geom.Path2D$Float', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.geom.Path2D', ctors: { 'java.awt.Shape,java.awt.geom.AffineTransform': '_Path2D$Float$Shape$AffineTransform', 'java.awt.Shape': '_Path2D$Float$Shape', 'int,int': '_Path2D$Float$int$int', 'int': '_Path2D$Float$int', '': '_Path2D$Float$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$Path2D_Float', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$Path2D_Float', 'getPathIterator(java.awt.geom.AffineTransform)': 'getPathIterator$AffineTransform', 'append(java.awt.geom.PathIterator,boolean)': 'append$PathIterator$boolean', 'curveTo(float,float,float,float,float,float)': 'curveTo$float$float$float$float$float$float', 'curveTo(double,double,double,double,double,double)': 'curveTo$double$double$double$double$double$double', 'quadTo(float,float,float,float)': 'quadTo$float$float$float$float', 'quadTo(double,double,double,double)': 'quadTo$double$double$double$double', 'lineTo(float,float)': 'lineTo$float$float', 'lineTo(double,double)': 'lineTo$double$double', 'moveTo(float,float)': 'moveTo$float$float', 'moveTo(double,double)': 'moveTo$double$double', 'append(double,double)': 'append$double$double', 'append(float,float)': 'append$float$float' } });
$J.define(Path2D$Iterator, 'java.awt.geom.Path2D$Iterator', { kind: 'class', ifaces: ['java.awt.geom.PathIterator'], sup: 'java.lang.Object', ctors: { 'java.awt.geom.Path2D': '_Path2D$Iterator' }, meths: { 'next()': 'next$' }, clinit: true, lazy: ['curvecoords'] });
$J.define(Path2D$Float$CopyIterator, 'java.awt.geom.Path2D$Float$CopyIterator', { kind: 'class', sup: 'java.awt.geom.Path2D$Iterator', ctors: { 'java.awt.geom.Path2D$Float': '_Path2D$Float$CopyIterator' }, meths: { 'currentSegment(double[])': 'currentSegment$doubleArr', 'currentSegment(float[])': 'currentSegment$floatArr' } });
$J.define(Path2D$Float$TxIterator, 'java.awt.geom.Path2D$Float$TxIterator', { kind: 'class', sup: 'java.awt.geom.Path2D$Iterator', ctors: { 'java.awt.geom.Path2D$Float,java.awt.geom.AffineTransform': '_Path2D$Float$TxIterator' }, meths: { 'currentSegment(double[])': 'currentSegment$doubleArr', 'currentSegment(float[])': 'currentSegment$floatArr' } });
$J.define(Path2D$Double, 'java.awt.geom.Path2D$Double', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.geom.Path2D', ctors: { 'java.awt.Shape,java.awt.geom.AffineTransform': '_Path2D$Double$Shape$AffineTransform', 'java.awt.Shape': '_Path2D$Double$Shape', 'int,int': '_Path2D$Double$int$int', 'int': '_Path2D$Double$int', '': '_Path2D$Double$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$Path2D_Double', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$Path2D_Double', 'getPathIterator(java.awt.geom.AffineTransform)': 'getPathIterator$AffineTransform', 'append(java.awt.geom.PathIterator,boolean)': 'append$PathIterator$boolean', 'curveTo(double,double,double,double,double,double)': 'curveTo$double$double$double$double$double$double', 'quadTo(double,double,double,double)': 'quadTo$double$double$double$double', 'lineTo(double,double)': 'lineTo$double$double', 'moveTo(double,double)': 'moveTo$double$double', 'append(double,double)': 'append$double$double', 'append(float,float)': 'append$float$float' } });
$J.define(Path2D$Double$CopyIterator, 'java.awt.geom.Path2D$Double$CopyIterator', { kind: 'class', sup: 'java.awt.geom.Path2D$Iterator', ctors: { 'java.awt.geom.Path2D$Double': '_Path2D$Double$CopyIterator' }, meths: { 'currentSegment(double[])': 'currentSegment$doubleArr', 'currentSegment(float[])': 'currentSegment$floatArr' } });
$J.define(Path2D$Double$TxIterator, 'java.awt.geom.Path2D$Double$TxIterator', { kind: 'class', sup: 'java.awt.geom.Path2D$Iterator', ctors: { 'java.awt.geom.Path2D$Double,java.awt.geom.AffineTransform': '_Path2D$Double$TxIterator' }, meths: { 'currentSegment(double[])': 'currentSegment$doubleArr', 'currentSegment(float[])': 'currentSegment$floatArr' } });
$J.module(() => {
  FlatteningPathIterator = $J.load('java.awt.geom.FlatteningPathIterator');
  GeneralPath = $J.load('java.awt.geom.GeneralPath');
  IllegalPathStateException = $J.load('java.awt.geom.IllegalPathStateException');
  PathIterator = $J.load('java.awt.geom.PathIterator');
  Point2D$Double = $J.load('java.awt.geom.Point2D$Double');
  Point2D$Float = $J.load('java.awt.geom.Point2D$Float');
  Rectangle2D$Double = $J.load('java.awt.geom.Rectangle2D$Double');
  Curve = $J.load('sun.awt.geom.Curve');
});
