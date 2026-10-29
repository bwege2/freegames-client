// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/Area.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, Vector } from '../../../../jre/index.ts';

let AreaIterator, FlatteningPathIterator, PathIterator, Rectangle2D$Double, AreaOp$EOWindOp, AreaOp$NZWindOp, AreaOp$SubOp, Crossings, Curve;

/**
 * An {@code Area} object stores and manipulates a
 * resolution-independent description of an enclosed area of
 * 2-dimensional space.
 * {@code Area} objects can be transformed and can perform
 * various Constructive Area Geometry (CAG) operations when combined
 * with other {@code Area} objects.
 * The CAG operations include area
 * {@link #add addition}, {@link #subtract subtraction},
 * {@link #intersect intersection}, and {@link #exclusiveOr exclusive or}.
 * See the linked method documentation for examples of the various
 * operations.
 * <p>
 * The {@code Area} class implements the {@code Shape}
 * interface and provides full support for all of its hit-testing
 * and path iteration facilities, but an {@code Area} is more
 * specific than a generalized path in a number of ways:
 * <ul>
 * <li>Only closed paths and sub-paths are stored.
 *     {@code Area} objects constructed from unclosed paths
 *     are implicitly closed during construction as if those paths
 *     had been filled by the {@code Graphics2D.fill} method.
 * <li>The interiors of the individual stored sub-paths are all
 *     non-empty and non-overlapping.  Paths are decomposed during
 *     construction into separate component non-overlapping parts,
 *     empty pieces of the path are discarded, and then these
 *     non-empty and non-overlapping properties are maintained
 *     through all subsequent CAG operations.  Outlines of different
 *     component sub-paths may touch each other, as long as they
 *     do not cross so that their enclosed areas overlap.
 * <li>The geometry of the path describing the outline of the
 *     {@code Area} resembles the path from which it was
 *     constructed only in that it describes the same enclosed
 *     2-dimensional area, but may use entirely different types
 *     and ordering of the path segments to do so.
 * </ul>
 * Interesting issues which are not always obvious when using
 * the {@code Area} include:
 * <ul>
 * <li>Creating an {@code Area} from an unclosed (open)
 *     {@code Shape} results in a closed outline in the
 *     {@code Area} object.
 * <li>Creating an {@code Area} from a {@code Shape}
 *     which encloses no area (even when "closed") produces an
 *     empty {@code Area}.  A common example of this issue
 *     is that producing an {@code Area} from a line will
 *     be empty since the line encloses no area.  An empty
 *     {@code Area} will iterate no geometry in its
 *     {@code PathIterator} objects.
 * <li>A self-intersecting {@code Shape} may be split into
 *     two (or more) sub-paths each enclosing one of the
 *     non-intersecting portions of the original path.
 * <li>An {@code Area} may take more path segments to
 *     describe the same geometry even when the original
 *     outline is simple and obvious.  The analysis that the
 *     {@code Area} class must perform on the path may
 *     not reflect the same concepts of "simple and obvious"
 *     as a human being perceives.
 * </ul>
 *
 * @since 1.2
 */
export class Area extends JObject {
  static EmptyCurves: Vector<Curve> = null;
  curves: Vector<Curve> = null;
  cachedBounds: Rectangle2D = null;
  /**
   * The {@code Area} class creates an area geometry from the
   * specified {@link Shape} object.  The geometry is explicitly
   * closed, if the {@code Shape} is not already closed.  The
   * fill rule (even-odd or winding) specified by the geometry of the
   * {@code Shape} is used to determine the resulting enclosed area.
   * @param s  the {@code Shape} from which the area is constructed
   * @throws NullPointerException if {@code s} is null
   * @since 1.2
   */
  _Area$Shape(s: Shape): this {
    if (s instanceof Area) {
      this.curves = (s).curves;
    } else {
      this.curves = Area.pathToCurves(s.getPathIterator$AffineTransform(null));
    }
    return this;
  }
  static pathToCurves(pi: PathIterator): Vector<Curve> {
    let curves = new Vector();
    let windingRule = pi.getWindingRule();
    let coords = $J.newArray(23, 0);
    let movx = 0;
    let movy = 0;
    let curx = 0;
    let cury = 0;
    let newx: number;
    let newy: number;
    while (!pi.isDone()) {
      switch (pi.currentSegment$doubleArr(coords)) {
        case PathIterator.SEG_MOVETO:
          Curve.insertLine(curves, curx, cury, movx, movy);
          curx = movx = coords[0];
          cury = movy = coords[1];
          Curve.insertMove(curves, movx, movy);
          break;
        case PathIterator.SEG_LINETO:
          newx = coords[0];
          newy = coords[1];
          Curve.insertLine(curves, curx, cury, newx, newy);
          curx = newx;
          cury = newy;
          break;
        case PathIterator.SEG_QUADTO:
          newx = coords[2];
          newy = coords[3];
          Curve.insertQuad(curves, curx, cury, coords);
          curx = newx;
          cury = newy;
          break;
        case PathIterator.SEG_CUBICTO:
          newx = coords[4];
          newy = coords[5];
          Curve.insertCubic(curves, curx, cury, coords);
          curx = newx;
          cury = newy;
          break;
        case PathIterator.SEG_CLOSE:
          Curve.insertLine(curves, curx, cury, movx, movy);
          curx = movx;
          cury = movy;
          break;
      }
      pi.next$();
    }
    Curve.insertLine(curves, curx, cury, movx, movy);
    let operator: AreaOp;
    if (windingRule === PathIterator.WIND_EVEN_ODD) {
      operator = new AreaOp$EOWindOp()._AreaOp$EOWindOp();
    } else {
      operator = new AreaOp$NZWindOp()._AreaOp$NZWindOp();
    }
    return operator.calculate(curves, Area.EmptyCurves);
  }
  /**
   * Subtracts the shape of the specified {@code Area} from the
   * shape of this {@code Area}.
   * The resulting shape of this {@code Area} will include
   * areas that were contained only in this {@code Area}
   * and not in the specified {@code Area}.
   * <pre>
   *     // Example:
   *     Area a1 = new Area([triangle 0,0 =&gt; 8,0 =&gt; 0,8]);
   *     Area a2 = new Area([triangle 0,0 =&gt; 8,0 =&gt; 8,8]);
   *     a1.subtract(a2);
   *
   *        a1(before)     -         a2         =     a1(after)
   *
   *     ################     ################
   *     ##############         ##############     ##
   *     ############             ############     ####
   *     ##########                 ##########     ######
   *     ########                     ########     ########
   *     ######                         ######     ######
   *     ####                             ####     ####
   *     ##                                 ##     ##
   * </pre>
   * @param   rhs  the {@code Area} to be subtracted from the
   *          current shape
   * @throws NullPointerException if {@code rhs} is null
   * @since 1.2
   */
  subtract(rhs: Area): void {
    this.curves = new AreaOp$SubOp()._AreaOp$SubOp().calculate(this.curves, rhs.curves);
    this.invalidateBounds();
  }
  invalidateBounds(): void {
    this.cachedBounds = null;
  }
  getCachedBounds(): Rectangle2D {
    if (this.cachedBounds != null) {
      return this.cachedBounds;
    }
    let r = new Rectangle2D$Double()._Rectangle2D$Double$();
    if (this.curves.size() > 0) {
      let c = this.curves.get(0);
      r.setRect$double$double$double$double(c.getX0(), c.getY0(), 0, 0);
      for (let i = 1; i < this.curves.size(); i++) {
        this.curves.get(i).enlarge(r);
      }
    }
    return (this.cachedBounds = r);
  }
  /**
   * Returns a high precision bounding {@link Rectangle2D} that
   * completely encloses this {@code Area}.
   * <p>
   * The Area class will attempt to return the tightest bounding
   * box possible for the Shape.  The bounding box will not be
   * padded to include the control points of curves in the outline
   * of the Shape, but should tightly fit the actual geometry of
   * the outline itself.
   * @return    the bounding {@code Rectangle2D} for the
   * {@code Area}.
   * @since 1.2
   */
  getBounds2D(): Rectangle2D {
    return this.getCachedBounds().getBounds2D();
  }
  /**
   * Returns a bounding {@link Rectangle} that completely encloses
   * this {@code Area}.
   * <p>
   * The Area class will attempt to return the tightest bounding
   * box possible for the Shape.  The bounding box will not be
   * padded to include the control points of curves in the outline
   * of the Shape, but should tightly fit the actual geometry of
   * the outline itself.  Since the returned object represents
   * the bounding box with integers, the bounding box can only be
   * as tight as the nearest integer coordinates that encompass
   * the geometry of the Shape.
   * @return    the bounding {@code Rectangle} for the
   * {@code Area}.
   * @since 1.2
   */
  getBounds(): Rectangle {
    return this.getCachedBounds().getBounds();
  }
  /**
   * Returns an exact copy of this {@code Area} object.
   * @return    Created clone object
   * @since 1.2
   */
  clone(): any {
    return new Area()._Area$Shape(this);
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  intersects$double$double$double$double(x: number, y: number, w: number, h: number): boolean {
    if (w < 0 || h < 0) {
      return false;
    }
    if (!this.getCachedBounds().intersects$double$double$double$double(x, y, w, h)) {
      return false;
    }
    let c = Crossings.findCrossings$Vector$double$double$double$double(this.curves, x, y, x + w, y + h);
    return (c == null || !c.isEmpty());
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  intersects$Rectangle2D(r: Rectangle2D): boolean {
    return this.intersects$double$double$double$double(r.getX(), r.getY(), r.getWidth(), r.getHeight());
  }
  /**
   * Creates a {@link PathIterator} for the outline of this
   * {@code Area} object.  This {@code Area} object is unchanged.
   * @param at an optional {@code AffineTransform} to be applied to
   * the coordinates as they are returned in the iteration, or
   * {@code null} if untransformed coordinates are desired
   * @return    the {@code PathIterator} object that returns the
   *          geometry of the outline of this {@code Area}, one
   *          segment at a time.
   * @since 1.2
   */
  getPathIterator$AffineTransform(at: AffineTransform): PathIterator {
    return new AreaIterator()._AreaIterator(this.curves, at);
  }
  /**
   * Creates a {@code PathIterator} for the flattened outline of
   * this {@code Area} object.  Only uncurved path segments
   * represented by the SEG_MOVETO, SEG_LINETO, and SEG_CLOSE point
   * types are returned by the iterator.  This {@code Area}
   * object is unchanged.
   * @param at an optional {@code AffineTransform} to be
   * applied to the coordinates as they are returned in the
   * iteration, or {@code null} if untransformed coordinates
   * are desired
   * @param flatness the maximum amount that the control points
   * for a given curve can vary from colinear before a subdivided
   * curve is replaced by a straight line connecting the end points
   * @return    the {@code PathIterator} object that returns the
   * geometry of the outline of this {@code Area}, one segment
   * at a time.
   * @since 1.2
   */
  getPathIterator$AffineTransform$double(at: AffineTransform, flatness: number): PathIterator {
    return new FlatteningPathIterator()._FlatteningPathIterator$PathIterator$double(this.getPathIterator$AffineTransform(at), flatness);
  }
  static $clinit() {
    Area.EmptyCurves = new Vector();
  }
}

$J.define(Area, 'java.awt.geom.Area', { kind: 'class', ifaces: ['java.awt.Shape', 'java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { 'java.awt.Shape': '_Area$Shape', '': '_Area$' }, meths: { 'getPathIterator(java.awt.geom.AffineTransform,double)': 'getPathIterator$AffineTransform$double', 'getPathIterator(java.awt.geom.AffineTransform)': 'getPathIterator$AffineTransform', 'intersects(java.awt.geom.Rectangle2D)': 'intersects$Rectangle2D', 'intersects(double,double,double,double)': 'intersects$double$double$double$double', 'contains(java.awt.geom.Rectangle2D)': 'contains$Rectangle2D', 'contains(double,double,double,double)': 'contains$double$double$double$double', 'contains(java.awt.geom.Point2D)': 'contains$Point2D', 'contains(double,double)': 'contains$double$double', 'equals(java.awt.geom.Area)': 'equals$Area' }, clinit: true, lazy: ['EmptyCurves'] });
$J.module(() => {
  AreaIterator = $J.load('java.awt.geom.AreaIterator');
  FlatteningPathIterator = $J.load('java.awt.geom.FlatteningPathIterator');
  PathIterator = $J.load('java.awt.geom.PathIterator');
  Rectangle2D$Double = $J.load('java.awt.geom.Rectangle2D$Double');
  AreaOp$EOWindOp = $J.load('sun.awt.geom.AreaOp$EOWindOp');
  AreaOp$NZWindOp = $J.load('sun.awt.geom.AreaOp$NZWindOp');
  AreaOp$SubOp = $J.load('sun.awt.geom.AreaOp$SubOp');
  Crossings = $J.load('sun.awt.geom.Crossings');
  Curve = $J.load('sun.awt.geom.Curve');
});
