// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/geom/Curve.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2025, Oracle and/or its affiliates. All rights reserved.
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
import { $J, InternalError, JObject, Throwable } from '../../../../jre/index.ts';

let IllegalPathStateException, PathIterator, QuadCurve2D, Order0, Order1, Order2, Order3;

export class Curve extends JObject {
  static readonly INCREASING: number = 1;
  static readonly DECREASING: number = -1;
  direction: number = 0;
  /**
   * The rectangle intersection test counts the number of times
   * that the path crosses through the shadow that the rectangle
   * projects to the right towards (x => +INFINITY).
   *
   * During processing of the path it actually counts every time
   * the path crosses either or both of the top and bottom edges
   * of that shadow.  If the path enters from the top, the count
   * is incremented.  If it then exits back through the top, the
   * same way it came in, the count is decremented and there is
   * no impact on the winding count.  If, instead, the path exits
   * out the bottom, then the count is incremented again and a
   * full pass through the shadow is indicated by the winding count
   * having been incremented by 2.
   *
   * Thus, the winding count that it accumulates is actually double
   * the real winding count.  Since the path is continuous, the
   * final answer should be a multiple of 2, otherwise there is a
   * logic error somewhere.
   *
   * If the path ever has a direct hit on the rectangle, then a
   * special value is returned.  This special value terminates
   * all ongoing accumulation on up through the call chain and
   * ends up getting returned to the calling function which can
   * then produce an answer directly.  For intersection tests,
   * the answer is always "true" if the path intersects the
   * rectangle.  For containment tests, the answer is always
   * "false" if the path intersects the rectangle.  Thus, no
   * further processing is ever needed if an intersection occurs.
   */
  static readonly RECT_INTERSECTS: number = -2147483648;
  static readonly TMIN: number = 0.001;
  _Curve(direction: number): this {
    this.direction = direction;
    return this;
  }
  static insertMove(curves: Vector<Curve>, x: number, y: number): void {
    curves.add(new Order0()._Order0(x, y));
  }
  static insertLine(curves: Vector<Curve>, x0: number, y0: number, x1: number, y1: number): void {
    if (y0 < y1) {
      curves.add(new Order1()._Order1(x0, y0, x1, y1, Curve.INCREASING));
    } else if (y0 > y1) {
      curves.add(new Order1()._Order1(x1, y1, x0, y0, Curve.DECREASING));
    } else {
    }
  }
  static insertQuad(curves: Vector<Curve>, x0: number, y0: number, coords: number[]): void {
    let y1 = coords[3];
    if (y0 > y1) {
      Order2.insert(curves, coords, coords[2], y1, coords[0], coords[1], x0, y0, Curve.DECREASING);
    } else if (y0 === y1 && y0 === coords[1]) {
      return;
    } else {
      Order2.insert(curves, coords, x0, y0, coords[0], coords[1], coords[2], y1, Curve.INCREASING);
    }
  }
  static insertCubic(curves: Vector<Curve>, x0: number, y0: number, coords: number[]): void {
    let y1 = coords[5];
    if (y0 > y1) {
      Order3.insert(curves, coords, coords[4], y1, coords[2], coords[3], coords[0], coords[1], x0, y0, Curve.DECREASING);
    } else if (y0 === y1 && y0 === coords[1] && y0 === coords[3]) {
      return;
    } else {
      Order3.insert(curves, coords, x0, y0, coords[0], coords[1], coords[2], coords[3], coords[4], y1, Curve.INCREASING);
    }
  }
  /**
   * Calculates the number of times the given path
   * crosses the ray extending to the right from (px,py).
   * If the point lies on a part of the path,
   * then no crossings are counted for that intersection.
   * +1 is added for each crossing where the Y coordinate is increasing
   * -1 is added for each crossing where the Y coordinate is decreasing
   * The return value is the sum of all crossings for every segment in
   * the path.
   * The path must start with a SEG_MOVETO, otherwise an exception is
   * thrown.
   * The caller must check p[xy] for NaN values.
   * The caller may also reject infinite p[xy] values as well.
   */
  static pointCrossingsForPath(pi: PathIterator, px: number, py: number): number {
    if (pi.isDone()) {
      return 0;
    }
    let coords = $J.newArray(6, 0);
    if (pi.currentSegment$doubleArr(coords) !== PathIterator.SEG_MOVETO) {
      throw new IllegalPathStateException()._IllegalPathStateException$String('missing initial moveto in path definition');
    }
    pi.next$();
    let movx = coords[0];
    let movy = coords[1];
    let curx = movx;
    let cury = movy;
    let endx: number;
    let endy: number;
    let crossings = 0;
    while (!pi.isDone()) {
      switch (pi.currentSegment$doubleArr(coords)) {
        case PathIterator.SEG_MOVETO:
          if (cury !== movy) {
            crossings = (crossings + Curve.pointCrossingsForLine(px, py, curx, cury, movx, movy)) | 0;
          }
          movx = curx = coords[0];
          movy = cury = coords[1];
          break;
        case PathIterator.SEG_LINETO:
          endx = coords[0];
          endy = coords[1];
          crossings = (crossings + Curve.pointCrossingsForLine(px, py, curx, cury, endx, endy)) | 0;
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_QUADTO:
          endx = coords[2];
          endy = coords[3];
          crossings = (crossings + Curve.pointCrossingsForQuad(px, py, curx, cury, coords[0], coords[1], endx, endy, 0)) | 0;
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_CUBICTO:
          endx = coords[4];
          endy = coords[5];
          crossings = (crossings + Curve.pointCrossingsForCubic(px, py, curx, cury, coords[0], coords[1], coords[2], coords[3], endx, endy, 0)) | 0;
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
      pi.next$();
    }
    if (cury !== movy) {
      crossings = (crossings + Curve.pointCrossingsForLine(px, py, curx, cury, movx, movy)) | 0;
    }
    return crossings;
  }
  /**
   * Calculates the number of times the line from (x0,y0) to (x1,y1)
   * crosses the ray extending to the right from (px,py).
   * If the point lies on the line, then no crossings are recorded.
   * +1 is returned for a crossing where the Y coordinate is increasing
   * -1 is returned for a crossing where the Y coordinate is decreasing
   */
  static pointCrossingsForLine(px: number, py: number, x0: number, y0: number, x1: number, y1: number): number {
    if (py < y0 && py < y1) {
      return 0;
    }
    if (py >= y0 && py >= y1) {
      return 0;
    }
    if (px >= x0 && px >= x1) {
      return 0;
    }
    if (px < x0 && px < x1) {
      return (y0 < y1) ? 1 : -1;
    }
    let xintercept = x0 + (py - y0) * (x1 - x0) / (y1 - y0);
    if (px >= xintercept) {
      return 0;
    }
    return (y0 < y1) ? 1 : -1;
  }
  /**
   * Calculates the number of times the quad from (x0,y0) to (x1,y1)
   * crosses the ray extending to the right from (px,py).
   * If the point lies on a part of the curve,
   * then no crossings are counted for that intersection.
   * the level parameter should be 0 at the top-level call and will count
   * up for each recursion level to prevent infinite recursion
   * +1 is added for each crossing where the Y coordinate is increasing
   * -1 is added for each crossing where the Y coordinate is decreasing
   */
  static pointCrossingsForQuad(px: number, py: number, x0: number, y0: number, xc: number, yc: number, x1: number, y1: number, level: number): number {
    if (py < y0 && py < yc && py < y1) {
      return 0;
    }
    if (py >= y0 && py >= yc && py >= y1) {
      return 0;
    }
    if (px >= x0 && px >= xc && px >= x1) {
      return 0;
    }
    if (px < x0 && px < xc && px < x1) {
      if (py >= y0) {
        if (py < y1) {
          return 1;
        }
      } else {
        if (py >= y1) {
          return -1;
        }
      }
      return 0;
    }
    if (level > 52) {
      return Curve.pointCrossingsForLine(px, py, x0, y0, x1, y1);
    }
    let x0c = (x0 + xc) / 2;
    let y0c = (y0 + yc) / 2;
    let xc1 = (xc + x1) / 2;
    let yc1 = (yc + y1) / 2;
    xc = (x0c + xc1) / 2;
    yc = (y0c + yc1) / 2;
    if ($J.Double_isNaN(xc) || $J.Double_isNaN(yc)) {
      return 0;
    }
    return (((Curve.pointCrossingsForQuad(px, py, x0, y0, x0c, y0c, xc, yc, (level + 1) | 0)) + (Curve.pointCrossingsForQuad(px, py, xc, yc, xc1, yc1, x1, y1, (level + 1) | 0))) | 0);
  }
  /**
   * Calculates the number of times the cubic from (x0,y0) to (x1,y1)
   * crosses the ray extending to the right from (px,py).
   * If the point lies on a part of the curve,
   * then no crossings are counted for that intersection.
   * the level parameter should be 0 at the top-level call and will count
   * up for each recursion level to prevent infinite recursion
   * +1 is added for each crossing where the Y coordinate is increasing
   * -1 is added for each crossing where the Y coordinate is decreasing
   */
  static pointCrossingsForCubic(px: number, py: number, x0: number, y0: number, xc0: number, yc0: number, xc1: number, yc1: number, x1: number, y1: number, level: number): number {
    if (py < y0 && py < yc0 && py < yc1 && py < y1) {
      return 0;
    }
    if (py >= y0 && py >= yc0 && py >= yc1 && py >= y1) {
      return 0;
    }
    if (px >= x0 && px >= xc0 && px >= xc1 && px >= x1) {
      return 0;
    }
    if (px < x0 && px < xc0 && px < xc1 && px < x1) {
      if (py >= y0) {
        if (py < y1) {
          return 1;
        }
      } else {
        if (py >= y1) {
          return -1;
        }
      }
      return 0;
    }
    if (level > 52) {
      return Curve.pointCrossingsForLine(px, py, x0, y0, x1, y1);
    }
    let xmid = (xc0 + xc1) / 2;
    let ymid = (yc0 + yc1) / 2;
    xc0 = (x0 + xc0) / 2;
    yc0 = (y0 + yc0) / 2;
    xc1 = (xc1 + x1) / 2;
    yc1 = (yc1 + y1) / 2;
    let xc0m = (xc0 + xmid) / 2;
    let yc0m = (yc0 + ymid) / 2;
    let xmc1 = (xmid + xc1) / 2;
    let ymc1 = (ymid + yc1) / 2;
    xmid = (xc0m + xmc1) / 2;
    ymid = (yc0m + ymc1) / 2;
    if ($J.Double_isNaN(xmid) || $J.Double_isNaN(ymid)) {
      return 0;
    }
    return (((Curve.pointCrossingsForCubic(px, py, x0, y0, xc0, yc0, xc0m, yc0m, xmid, ymid, (level + 1) | 0)) + (Curve.pointCrossingsForCubic(px, py, xmid, ymid, xmc1, ymc1, xc1, yc1, x1, y1, (level + 1) | 0))) | 0);
  }
  /**
   * Accumulate the number of times the path crosses the shadow
   * extending to the right of the rectangle.  See the comment
   * for the RECT_INTERSECTS constant for more complete details.
   * The return value is the sum of all crossings for both the
   * top and bottom of the shadow for every segment in the path,
   * or the special value RECT_INTERSECTS if the path ever enters
   * the interior of the rectangle.
   * The path must start with a SEG_MOVETO, otherwise an exception is
   * thrown.
   * The caller must check r[xy]{min,max} for NaN values.
   */
  static rectCrossingsForPath(pi: PathIterator, rxmin: number, rymin: number, rxmax: number, rymax: number): number {
    if (rxmax <= rxmin || rymax <= rymin) {
      return 0;
    }
    if (pi.isDone()) {
      return 0;
    }
    let coords = $J.newArray(6, 0);
    if (pi.currentSegment$doubleArr(coords) !== PathIterator.SEG_MOVETO) {
      throw new IllegalPathStateException()._IllegalPathStateException$String('missing initial moveto in path definition');
    }
    pi.next$();
    let curx: number;
    let cury: number;
    let movx: number;
    let movy: number;
    let endx: number;
    let endy: number;
    curx = movx = coords[0];
    cury = movy = coords[1];
    let crossings = 0;
    while (crossings !== Curve.RECT_INTERSECTS && !pi.isDone()) {
      switch (pi.currentSegment$doubleArr(coords)) {
        case PathIterator.SEG_MOVETO:
          if (curx !== movx || cury !== movy) {
            crossings = Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, curx, cury, movx, movy);
          }
          movx = curx = coords[0];
          movy = cury = coords[1];
          break;
        case PathIterator.SEG_LINETO:
          endx = coords[0];
          endy = coords[1];
          crossings = Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, curx, cury, endx, endy);
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_QUADTO:
          endx = coords[2];
          endy = coords[3];
          crossings = Curve.rectCrossingsForQuad(crossings, rxmin, rymin, rxmax, rymax, curx, cury, coords[0], coords[1], endx, endy, 0);
          curx = endx;
          cury = endy;
          break;
        case PathIterator.SEG_CUBICTO:
          endx = coords[4];
          endy = coords[5];
          crossings = Curve.rectCrossingsForCubic(crossings, rxmin, rymin, rxmax, rymax, curx, cury, coords[0], coords[1], coords[2], coords[3], endx, endy, 0);
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
      pi.next$();
    }
    if (crossings !== Curve.RECT_INTERSECTS && (curx !== movx || cury !== movy)) {
      crossings = Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, curx, cury, movx, movy);
    }
    return crossings;
  }
  /**
   * Accumulate the number of times the line crosses the shadow
   * extending to the right of the rectangle.  See the comment
   * for the RECT_INTERSECTS constant for more complete details.
   */
  static rectCrossingsForLine(crossings: number, rxmin: number, rymin: number, rxmax: number, rymax: number, x0: number, y0: number, x1: number, y1: number): number {
    if (y0 >= rymax && y1 >= rymax) {
      return crossings;
    }
    if (y0 <= rymin && y1 <= rymin) {
      return crossings;
    }
    if (x0 <= rxmin && x1 <= rxmin) {
      return crossings;
    }
    if (x0 >= rxmax && x1 >= rxmax) {
      if (y0 < y1) {
        if (y0 <= rymin) {
          crossings++;
        }
        if (y1 >= rymax) {
          crossings++;
        }
      } else if (y1 < y0) {
        if (y1 <= rymin) {
          crossings--;
        }
        if (y0 >= rymax) {
          crossings--;
        }
      }
      return crossings;
    }
    if ((x0 > rxmin && x0 < rxmax && y0 > rymin && y0 < rymax) || (x1 > rxmin && x1 < rxmax && y1 > rymin && y1 < rymax)) {
      return Curve.RECT_INTERSECTS;
    }
    let xi0 = x0;
    if (y0 < rymin) {
      xi0 += ((rymin - y0) * (x1 - x0) / (y1 - y0));
    } else if (y0 > rymax) {
      xi0 += ((rymax - y0) * (x1 - x0) / (y1 - y0));
    }
    let xi1 = x1;
    if (y1 < rymin) {
      xi1 += ((rymin - y1) * (x0 - x1) / (y0 - y1));
    } else if (y1 > rymax) {
      xi1 += ((rymax - y1) * (x0 - x1) / (y0 - y1));
    }
    if (xi0 <= rxmin && xi1 <= rxmin) {
      return crossings;
    }
    if (xi0 >= rxmax && xi1 >= rxmax) {
      if (y0 < y1) {
        if (y0 <= rymin) {
          crossings++;
        }
        if (y1 >= rymax) {
          crossings++;
        }
      } else if (y1 < y0) {
        if (y1 <= rymin) {
          crossings--;
        }
        if (y0 >= rymax) {
          crossings--;
        }
      }
      return crossings;
    }
    return Curve.RECT_INTERSECTS;
  }
  /**
   * Accumulate the number of times the quad crosses the shadow
   * extending to the right of the rectangle.  See the comment
   * for the RECT_INTERSECTS constant for more complete details.
   */
  static rectCrossingsForQuad(crossings: number, rxmin: number, rymin: number, rxmax: number, rymax: number, x0: number, y0: number, xc: number, yc: number, x1: number, y1: number, level: number): number {
    if (y0 >= rymax && yc >= rymax && y1 >= rymax) {
      return crossings;
    }
    if (y0 <= rymin && yc <= rymin && y1 <= rymin) {
      return crossings;
    }
    if (x0 <= rxmin && xc <= rxmin && x1 <= rxmin) {
      return crossings;
    }
    if (x0 >= rxmax && xc >= rxmax && x1 >= rxmax) {
      if (y0 < y1) {
        if (y0 <= rymin && y1 > rymin) {
          crossings++;
        }
        if (y0 < rymax && y1 >= rymax) {
          crossings++;
        }
      } else if (y1 < y0) {
        if (y1 <= rymin && y0 > rymin) {
          crossings--;
        }
        if (y1 < rymax && y0 >= rymax) {
          crossings--;
        }
      }
      return crossings;
    }
    if ((x0 < rxmax && x0 > rxmin && y0 < rymax && y0 > rymin) || (x1 < rxmax && x1 > rxmin && y1 < rymax && y1 > rymin)) {
      return Curve.RECT_INTERSECTS;
    }
    if (level > 52) {
      return Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, x0, y0, x1, y1);
    }
    let x0c = (x0 + xc) / 2;
    let y0c = (y0 + yc) / 2;
    let xc1 = (xc + x1) / 2;
    let yc1 = (yc + y1) / 2;
    xc = (x0c + xc1) / 2;
    yc = (y0c + yc1) / 2;
    if ($J.Double_isNaN(xc) || $J.Double_isNaN(yc)) {
      return 0;
    }
    crossings = Curve.rectCrossingsForQuad(crossings, rxmin, rymin, rxmax, rymax, x0, y0, x0c, y0c, xc, yc, (level + 1) | 0);
    if (crossings !== Curve.RECT_INTERSECTS) {
      crossings = Curve.rectCrossingsForQuad(crossings, rxmin, rymin, rxmax, rymax, xc, yc, xc1, yc1, x1, y1, (level + 1) | 0);
    }
    return crossings;
  }
  /**
   * Accumulate the number of times the cubic crosses the shadow
   * extending to the right of the rectangle.  See the comment
   * for the RECT_INTERSECTS constant for more complete details.
   */
  static rectCrossingsForCubic(crossings: number, rxmin: number, rymin: number, rxmax: number, rymax: number, x0: number, y0: number, xc0: number, yc0: number, xc1: number, yc1: number, x1: number, y1: number, level: number): number {
    if (y0 >= rymax && yc0 >= rymax && yc1 >= rymax && y1 >= rymax) {
      return crossings;
    }
    if (y0 <= rymin && yc0 <= rymin && yc1 <= rymin && y1 <= rymin) {
      return crossings;
    }
    if (x0 <= rxmin && xc0 <= rxmin && xc1 <= rxmin && x1 <= rxmin) {
      return crossings;
    }
    if (x0 >= rxmax && xc0 >= rxmax && xc1 >= rxmax && x1 >= rxmax) {
      if (y0 < y1) {
        if (y0 <= rymin && y1 > rymin) {
          crossings++;
        }
        if (y0 < rymax && y1 >= rymax) {
          crossings++;
        }
      } else if (y1 < y0) {
        if (y1 <= rymin && y0 > rymin) {
          crossings--;
        }
        if (y1 < rymax && y0 >= rymax) {
          crossings--;
        }
      }
      return crossings;
    }
    if ((x0 > rxmin && x0 < rxmax && y0 > rymin && y0 < rymax) || (x1 > rxmin && x1 < rxmax && y1 > rymin && y1 < rymax)) {
      return Curve.RECT_INTERSECTS;
    }
    if (level > 52) {
      return Curve.rectCrossingsForLine(crossings, rxmin, rymin, rxmax, rymax, x0, y0, x1, y1);
    }
    let xmid = (xc0 + xc1) / 2;
    let ymid = (yc0 + yc1) / 2;
    xc0 = (x0 + xc0) / 2;
    yc0 = (y0 + yc0) / 2;
    xc1 = (xc1 + x1) / 2;
    yc1 = (yc1 + y1) / 2;
    let xc0m = (xc0 + xmid) / 2;
    let yc0m = (yc0 + ymid) / 2;
    let xmc1 = (xmid + xc1) / 2;
    let ymc1 = (ymid + yc1) / 2;
    xmid = (xc0m + xmc1) / 2;
    ymid = (yc0m + ymc1) / 2;
    if ($J.Double_isNaN(xmid) || $J.Double_isNaN(ymid)) {
      return 0;
    }
    crossings = Curve.rectCrossingsForCubic(crossings, rxmin, rymin, rxmax, rymax, x0, y0, xc0, yc0, xc0m, yc0m, xmid, ymid, (level + 1) | 0);
    if (crossings !== Curve.RECT_INTERSECTS) {
      crossings = Curve.rectCrossingsForCubic(crossings, rxmin, rymin, rxmax, rymax, xmid, ymid, xmc1, ymc1, xc1, yc1, x1, y1, (level + 1) | 0);
    }
    return crossings;
  }
  /**
   * Accumulate the quadratic extrema into the pre-existing bounding array.
   * <p>
   * This method focuses on one dimension at a time, so to get both the x and y
   * dimensions you'll need to call this method twice.
   * </p>
   * <p>
   * Whenever we have to examine cubic or quadratic extrema that change our bounding
   * box: we run the risk of machine error that may produce a box that is slightly
   * too small. But the contract of {@link Shape#getBounds2D()} says we should err
   * on the side of being too large. So to address this: we'll apply a margin based
   * on the upper limit of numerical error caused by the polynomial evaluation (horner
   * scheme).
   * </p>
   *
   * @param bounds the bounds to update, which are expressed as: { minX, maxX }
   * @param boundsOffset the index in boundsof the minimum value
   * @param x1 the starting value of the bezier curve where t = 0.0
   * @param ctrlX the control value of the bezier curve
   * @param x2 the ending value of the bezier curve where t = 1.0
   * @param coeff an array of at least 3 elements that will be overwritten and reused
   * @param deriv_coeff an array of at least 2 elements that will be overwritten and reused
   */
  static accumulateExtremaBoundsForQuad(bounds: number[], boundsOffset: number, x1: number, ctrlX: number, x2: number, coeff: number[], deriv_coeff: number[]): void {
    if (ctrlX < bounds[boundsOffset] || ctrlX > (bounds[(boundsOffset + 1) | 0])) {
      let dx21 = ctrlX - x1;
      coeff[2] = (x2 - ctrlX) - dx21;
      coeff[1] = 2 * dx21;
      coeff[0] = x1;
      deriv_coeff[0] = coeff[1];
      deriv_coeff[1] = 2 * coeff[2];
      let t = -deriv_coeff[0] / deriv_coeff[1];
      if (t > 0 && t < 1) {
        let v = coeff[0] + t * (coeff[1] + t * coeff[2]);
        let margin = $J.math_ulp(Math.abs(coeff[0]) + Math.abs(coeff[1]) + Math.abs(coeff[2]));
        if (v - margin < bounds[boundsOffset]) {
          bounds[boundsOffset] = v - margin;
        }
        if (v + margin > (bounds[(boundsOffset + 1) | 0])) {
          (bounds[(boundsOffset + 1) | 0]) = v + margin;
        }
      }
    }
  }
  /**
   * Accumulate the cubic extrema into the pre-existing bounding array.
   * <p>
   * This method focuses on one dimension at a time, so to get both the x and y
   * dimensions you'll need to call this method twice.
   * </p>
   * <p>
   * Whenever we have to examine cubic or quadratic extrema that change our bounding
   * box: we run the risk of machine error that may produce a box that is slightly
   * too small. But the contract of {@link Shape#getBounds2D()} says we should err
   * on the side of being too large. So to address this: we'll apply a margin based
   * on the upper limit of numerical error caused by the polynomial evaluation (horner
   * scheme).
   * </p>
   *
   * @param bounds the bounds to update, which are expressed as: { minX, maxX }
   * @param boundsOffset the index in boundsof the minimum value
   * @param x1 the starting value of the bezier curve where t = 0.0
   * @param ctrlX1 the first control value of the bezier curve
   * @param ctrlX1 the second control value of the bezier curve
   * @param x2 the ending value of the bezier curve where t = 1.0
   * @param coeff an array of at least 3 elements that will be overwritten and reused
   * @param deriv_coeff an array of at least 2 elements that will be overwritten and reused
   */
  static accumulateExtremaBoundsForCubic(bounds: number[], boundsOffset: number, x1: number, ctrlX1: number, ctrlX2: number, x2: number, coeff: number[], deriv_coeff: number[]): void {
    if (ctrlX1 < bounds[boundsOffset] || ctrlX1 > (bounds[(boundsOffset + 1) | 0]) || ctrlX2 < bounds[boundsOffset] || ctrlX2 > (bounds[(boundsOffset + 1) | 0])) {
      let dx32 = 3 * (ctrlX2 - ctrlX1);
      let dx21 = 3 * (ctrlX1 - x1);
      coeff[3] = (x2 - x1) - dx32;
      coeff[2] = (dx32 - dx21);
      coeff[1] = dx21;
      coeff[0] = x1;
      deriv_coeff[0] = coeff[1];
      deriv_coeff[1] = 2 * coeff[2];
      deriv_coeff[2] = 3 * coeff[3];
      let tExtrema = deriv_coeff;
      let tExtremaCount = QuadCurve2D.solveQuadratic$doubleArr$doubleArr(deriv_coeff, tExtrema);
      if (tExtremaCount > 0) {
        let margin = $J.math_ulp(Math.abs(coeff[0]) + Math.abs(coeff[1]) + Math.abs(coeff[2]) + Math.abs(coeff[3]));
        for (let i = 0; i < tExtremaCount; i++) {
          let t = tExtrema[i];
          if (t > 0 && t < 1) {
            let v = coeff[0] + t * (coeff[1] + t * (coeff[2] + t * coeff[3]));
            if (v - margin < bounds[boundsOffset]) {
              bounds[boundsOffset] = v - margin;
            }
            if (v + margin > (bounds[(boundsOffset + 1) | 0])) {
              (bounds[(boundsOffset + 1) | 0]) = v + margin;
            }
          }
        }
      }
    }
  }
  getDirection(): number {
    return this.direction;
  }
  getWithDirection(direction: number): Curve {
    return (this.direction === direction ? this : this.getReversedCurve());
  }
  static round(v: number): number {
    return v;
  }
  static orderof(x1: number, x2: number): number {
    if (x1 < x2) {
      return -1;
    }
    if (x1 > x2) {
      return 1;
    }
    return 0;
  }
  static diffbits(y1: number, y2: number): number {
    return Math.abs($J.Double_doubleToLongBits(y1) - $J.Double_doubleToLongBits(y2));
  }
  static prev(v: number): number {
    return $J.Double_longBitsToDouble($J.Double_doubleToLongBits(v) - 1);
  }
  static next(v: number): number {
    return $J.Double_longBitsToDouble($J.Double_doubleToLongBits(v) + 1);
  }
  toString(): string {
    return ('Curve[' + this.getOrder() + ', ' + ('(' + $J.dstr(Curve.round(this.getX0())) + ', ' + $J.dstr(Curve.round(this.getY0())) + '), ') + this.controlPointString() + ('(' + $J.dstr(Curve.round(this.getX1())) + ', ' + $J.dstr(Curve.round(this.getY1())) + '), ') + (this.direction === Curve.INCREASING ? 'D' : 'U') + ']');
  }
  controlPointString(): string {
    return '';
  }
  accumulateCrossings(c: Crossings): boolean {
    let xhi = c.getXHi();
    if (this.getXMin() >= xhi) {
      return false;
    }
    let xlo = c.getXLo();
    let ylo = c.getYLo();
    let yhi = c.getYHi();
    let y0 = this.getYTop();
    let y1 = this.getYBot();
    let tstart: number;
    let ystart: number;
    let tend: number;
    let yend: number;
    if (y0 < ylo) {
      if (y1 <= ylo) {
        return false;
      }
      ystart = ylo;
      tstart = this.TforY(ylo);
    } else {
      if (y0 >= yhi) {
        return false;
      }
      ystart = y0;
      tstart = 0;
    }
    if (y1 > yhi) {
      yend = yhi;
      tend = this.TforY(yhi);
    } else {
      yend = y1;
      tend = 1;
    }
    let hitLo = false;
    let hitHi = false;
    while (true) {
      let x = this.XforT(tstart);
      if (x < xhi) {
        if (hitHi || x > xlo) {
          return true;
        }
        hitLo = true;
      } else {
        if (hitLo) {
          return true;
        }
        hitHi = true;
      }
      if (tstart >= tend) {
        break;
      }
      tstart = this.nextVertical(tstart, tend);
    }
    if (hitLo) {
      c.record(ystart, yend, this.direction);
    }
    return false;
  }
  compareTo(that: Curve, yrange: number[]): number {
    let y0 = yrange[0];
    let y1 = yrange[1];
    y1 = Math.min(Math.min(y1, this.getYBot()), that.getYBot());
    if (y1 <= yrange[0]) {
      $J.err.println('this == ' + $J.str(this));
      $J.err.println('that == ' + $J.str(that));
      $J.out.println('target range = ' + $J.dstr(yrange[0]) + '=>' + $J.dstr(yrange[1]));
      throw new InternalError('backstepping from ' + $J.dstr(yrange[0]) + ' to ' + $J.dstr(y1));
    }
    yrange[1] = y1;
    if (this.getXMax() <= that.getXMin()) {
      if (this.getXMin() === that.getXMax()) {
        return 0;
      }
      return -1;
    }
    if (this.getXMin() >= that.getXMax()) {
      return 1;
    }
    let s0 = this.TforY(y0);
    let ys0 = this.YforT(s0);
    if (ys0 < y0) {
      s0 = this.refineTforY(s0, ys0, y0);
      ys0 = this.YforT(s0);
    }
    let s1 = this.TforY(y1);
    if (this.YforT(s1) < y0) {
      s1 = this.refineTforY(s1, this.YforT(s1), y0);
    }
    let t0 = that.TforY(y0);
    let yt0 = that.YforT(t0);
    if (yt0 < y0) {
      t0 = that.refineTforY(t0, yt0, y0);
      yt0 = that.YforT(t0);
    }
    let t1 = that.TforY(y1);
    if (that.YforT(t1) < y0) {
      t1 = that.refineTforY(t1, that.YforT(t1), y0);
    }
    let xs0 = this.XforT(s0);
    let xt0 = that.XforT(t0);
    let scale = Math.max(Math.abs(y0), Math.abs(y1));
    let ymin = Math.max(scale * 1E-14, 1E-300);
    if (this.fairlyClose(xs0, xt0)) {
      let bump = ymin;
      let maxbump = Math.min(ymin * 1E13, (y1 - y0) * 0.1);
      let y = y0 + bump;
      if (!$J.Double_isFinite(y1)) {
        return 0;
      }
      while (y <= y1) {
        if (this.fairlyClose(this.XforY(y), that.XforY(y))) {
          if ((bump *= 2) > maxbump) {
            bump = maxbump;
          }
        } else {
          y -= bump;
          while (true) {
            bump /= 2;
            let newy = y + bump;
            if (newy <= y) {
              break;
            }
            if (this.fairlyClose(this.XforY(newy), that.XforY(newy))) {
              y = newy;
            }
          }
          break;
        }
        y += bump;
      }
      if (y > y0) {
        if (y < y1) {
          yrange[1] = y;
        }
        return 0;
      }
    }
    if (ymin <= 0) {
      $J.out.println('ymin = ' + $J.dstr(ymin));
    }
    while (s0 < s1 && t0 < t1) {
      let sh = this.nextVertical(s0, s1);
      let xsh = this.XforT(sh);
      let ysh = this.YforT(sh);
      let th = that.nextVertical(t0, t1);
      let xth = that.XforT(th);
      let yth = that.YforT(th);
      try {
        if (this.findIntersect(that, yrange, ymin, 0, 0, s0, xs0, ys0, sh, xsh, ysh, t0, xt0, yt0, th, xth, yth)) {
          break;
        }
      } catch ($e0) {
        {
          let t = $J.exc($e0);
          $J.err.println('Error: ' + $J.str(t));
          $J.err.println('y range was ' + $J.dstr(yrange[0]) + '=>' + $J.dstr(yrange[1]));
          $J.err.println('s y range is ' + $J.dstr(ys0) + '=>' + $J.dstr(ysh));
          $J.err.println('t y range is ' + $J.dstr(yt0) + '=>' + $J.dstr(yth));
          $J.err.println('ymin is ' + $J.dstr(ymin));
          return 0;
        }
      }
      if (ysh < yth) {
        if (ysh > yrange[0]) {
          if (ysh < yrange[1]) {
            yrange[1] = ysh;
          }
          break;
        }
        s0 = sh;
        xs0 = xsh;
        ys0 = ysh;
      } else {
        if (yth > yrange[0]) {
          if (yth < yrange[1]) {
            yrange[1] = yth;
          }
          break;
        }
        t0 = th;
        xt0 = xth;
        yt0 = yth;
      }
    }
    let ymid = (yrange[0] + yrange[1]) / 2;
    return Curve.orderof(this.XforY(ymid), that.XforY(ymid));
  }
  findIntersect(that: Curve, yrange: number[], ymin: number, slevel: number, tlevel: number, s0: number, xs0: number, ys0: number, s1: number, xs1: number, ys1: number, t0: number, xt0: number, yt0: number, t1: number, xt1: number, yt1: number): boolean {
    if (ys0 > yt1 || yt0 > ys1) {
      return false;
    }
    if (Math.min(xs0, xs1) > Math.max(xt0, xt1) || Math.max(xs0, xs1) < Math.min(xt0, xt1)) {
      return false;
    }
    if (s1 - s0 > Curve.TMIN) {
      let s = (s0 + s1) / 2;
      let xs = this.XforT(s);
      let ys = this.YforT(s);
      if (s === s0 || s === s1) {
        $J.out.println('s0 = ' + $J.dstr(s0));
        $J.out.println('s1 = ' + $J.dstr(s1));
        throw new InternalError('no s progress!');
      }
      if (t1 - t0 > Curve.TMIN) {
        let t = (t0 + t1) / 2;
        let xt = that.XforT(t);
        let yt = that.YforT(t);
        if (t === t0 || t === t1) {
          $J.out.println('t0 = ' + $J.dstr(t0));
          $J.out.println('t1 = ' + $J.dstr(t1));
          throw new InternalError('no t progress!');
        }
        if (ys >= yt0 && yt >= ys0) {
          if (this.findIntersect(that, yrange, ymin, (slevel + 1) | 0, (tlevel + 1) | 0, s0, xs0, ys0, s, xs, ys, t0, xt0, yt0, t, xt, yt)) {
            return true;
          }
        }
        if (ys >= yt) {
          if (this.findIntersect(that, yrange, ymin, (slevel + 1) | 0, (tlevel + 1) | 0, s0, xs0, ys0, s, xs, ys, t, xt, yt, t1, xt1, yt1)) {
            return true;
          }
        }
        if (yt >= ys) {
          if (this.findIntersect(that, yrange, ymin, (slevel + 1) | 0, (tlevel + 1) | 0, s, xs, ys, s1, xs1, ys1, t0, xt0, yt0, t, xt, yt)) {
            return true;
          }
        }
        if (ys1 >= yt && yt1 >= ys) {
          if (this.findIntersect(that, yrange, ymin, (slevel + 1) | 0, (tlevel + 1) | 0, s, xs, ys, s1, xs1, ys1, t, xt, yt, t1, xt1, yt1)) {
            return true;
          }
        }
      } else {
        if (ys >= yt0) {
          if (this.findIntersect(that, yrange, ymin, (slevel + 1) | 0, tlevel, s0, xs0, ys0, s, xs, ys, t0, xt0, yt0, t1, xt1, yt1)) {
            return true;
          }
        }
        if (yt1 >= ys) {
          if (this.findIntersect(that, yrange, ymin, (slevel + 1) | 0, tlevel, s, xs, ys, s1, xs1, ys1, t0, xt0, yt0, t1, xt1, yt1)) {
            return true;
          }
        }
      }
    } else if (t1 - t0 > Curve.TMIN) {
      let t = (t0 + t1) / 2;
      let xt = that.XforT(t);
      let yt = that.YforT(t);
      if (t === t0 || t === t1) {
        $J.out.println('t0 = ' + $J.dstr(t0));
        $J.out.println('t1 = ' + $J.dstr(t1));
        throw new InternalError('no t progress!');
      }
      if (yt >= ys0) {
        if (this.findIntersect(that, yrange, ymin, slevel, (tlevel + 1) | 0, s0, xs0, ys0, s1, xs1, ys1, t0, xt0, yt0, t, xt, yt)) {
          return true;
        }
      }
      if (ys1 >= yt) {
        if (this.findIntersect(that, yrange, ymin, slevel, (tlevel + 1) | 0, s0, xs0, ys0, s1, xs1, ys1, t, xt, yt, t1, xt1, yt1)) {
          return true;
        }
      }
    } else {
      let xlk = xs1 - xs0;
      let ylk = ys1 - ys0;
      let xnm = xt1 - xt0;
      let ynm = yt1 - yt0;
      let xmk = xt0 - xs0;
      let ymk = yt0 - ys0;
      let det = xnm * ylk - ynm * xlk;
      if (det !== 0) {
        let detinv = 1 / det;
        let s = (xnm * ymk - ynm * xmk) * detinv;
        let t = (xlk * ymk - ylk * xmk) * detinv;
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
          s = s0 + s * (s1 - s0);
          t = t0 + t * (t1 - t0);
          if (s < 0 || s > 1 || t < 0 || t > 1) {
            $J.out.println('Uh oh!');
          }
          let y = (this.YforT(s) + that.YforT(t)) / 2;
          if (y <= yrange[1] && y > yrange[0]) {
            yrange[1] = y;
            return true;
          }
        }
      }
    }
    return false;
  }
  refineTforY(t0: number, yt0: number, y0: number): number {
    let t1 = 1;
    while (true) {
      let th = (t0 + t1) / 2;
      if (th === t0 || th === t1) {
        return t1;
      }
      let y = this.YforT(th);
      if (y < y0) {
        t0 = th;
        yt0 = y;
      } else if (y > y0) {
        t1 = th;
      } else {
        return t1;
      }
    }
  }
  fairlyClose(v1: number, v2: number): boolean {
    return (Math.abs(v1 - v2) < Math.max(Math.abs(v1), Math.abs(v2)) * 1E-8);
  }
}

$J.define(Curve, 'sun.awt.geom.Curve', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int': '_Curve' }, meths: { 'getSubCurve(double,double,int)': 'getSubCurve$double$double$int', 'getSubCurve(double,double)': 'getSubCurve$double$double' } });
$J.module(() => {
  IllegalPathStateException = $J.load('java.awt.geom.IllegalPathStateException');
  PathIterator = $J.load('java.awt.geom.PathIterator');
  QuadCurve2D = $J.load('java.awt.geom.QuadCurve2D');
  Order0 = $J.load('sun.awt.geom.Order0');
  Order1 = $J.load('sun.awt.geom.Order1');
  Order2 = $J.load('sun.awt.geom.Order2');
  Order3 = $J.load('sun.awt.geom.Order3');
});
