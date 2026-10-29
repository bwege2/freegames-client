// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/geom/Order2.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { Curve } from './Curve.ts';

let PathIterator;

export class Order2 extends Curve {
  x0: number = 0;
  y0: number = 0;
  cx0: number = 0;
  cy0: number = 0;
  x1: number = 0;
  y1: number = 0;
  xmin: number = 0;
  xmax: number = 0;
  xcoeff0: number = 0;
  xcoeff1: number = 0;
  xcoeff2: number = 0;
  ycoeff0: number = 0;
  ycoeff1: number = 0;
  ycoeff2: number = 0;
  _Order2(x0: number, y0: number, cx0: number, cy0: number, x1: number, y1: number, direction: number): this {
    this._Curve(direction);
    if (cy0 < y0) {
      cy0 = y0;
    } else if (cy0 > y1) {
      cy0 = y1;
    }
    this.x0 = x0;
    this.y0 = y0;
    this.cx0 = cx0;
    this.cy0 = cy0;
    this.x1 = x1;
    this.y1 = y1;
    this.xmin = Math.min(Math.min(x0, x1), cx0);
    this.xmax = Math.max(Math.max(x0, x1), cx0);
    this.xcoeff0 = x0;
    this.xcoeff1 = cx0 + cx0 - x0 - x0;
    this.xcoeff2 = x0 - cx0 - cx0 + x1;
    this.ycoeff0 = y0;
    this.ycoeff1 = cy0 + cy0 - y0 - y0;
    this.ycoeff2 = y0 - cy0 - cy0 + y1;
    return this;
  }
  static insert(curves: Vector<Curve>, tmp: number[], x0: number, y0: number, cx0: number, cy0: number, x1: number, y1: number, direction: number): void {
    let numparams = Order2.getHorizontalParams(y0, cy0, y1, tmp);
    if (numparams === 0) {
      Order2.addInstance(curves, x0, y0, cx0, cy0, x1, y1, direction);
      return;
    }
    let t = tmp[0];
    tmp[0] = x0;
    tmp[1] = y0;
    tmp[2] = cx0;
    tmp[3] = cy0;
    tmp[4] = x1;
    tmp[5] = y1;
    Order2.split(tmp, 0, t);
    let i0 = (direction === Curve.INCREASING) ? 0 : 4;
    let i1 = (4 - i0) | 0;
    Order2.addInstance(curves, tmp[i0], tmp[(i0 + 1) | 0], tmp[(i0 + 2) | 0], tmp[(i0 + 3) | 0], tmp[(i0 + 4) | 0], tmp[(i0 + 5) | 0], direction);
    Order2.addInstance(curves, tmp[i1], tmp[(i1 + 1) | 0], tmp[(i1 + 2) | 0], tmp[(i1 + 3) | 0], tmp[(i1 + 4) | 0], tmp[(i1 + 5) | 0], direction);
  }
  static addInstance(curves: Vector<Curve>, x0: number, y0: number, cx0: number, cy0: number, x1: number, y1: number, direction: number): void {
    if (y0 > y1) {
      curves.add(new Order2()._Order2(x1, y1, cx0, cy0, x0, y0, -direction));
    } else if (y1 > y0) {
      curves.add(new Order2()._Order2(x0, y0, cx0, cy0, x1, y1, direction));
    }
  }
  static getHorizontalParams(c0: number, cp: number, c1: number, ret: number[]): number {
    if (c0 <= cp && cp <= c1) {
      return 0;
    }
    c0 -= cp;
    c1 -= cp;
    let denom = c0 + c1;
    if (denom === 0) {
      return 0;
    }
    let t = c0 / denom;
    if (t <= 0 || t >= 1) {
      return 0;
    }
    ret[0] = t;
    return 1;
  }
  static split(coords: number[], pos: number, t: number): void {
    let x0: number;
    let y0: number;
    let cx: number;
    let cy: number;
    let x1: number;
    let y1: number;
    (coords[(pos + 8) | 0]) = x1 = coords[(pos + 4) | 0];
    (coords[(pos + 9) | 0]) = y1 = coords[(pos + 5) | 0];
    cx = coords[(pos + 2) | 0];
    cy = coords[(pos + 3) | 0];
    x1 = cx + (x1 - cx) * t;
    y1 = cy + (y1 - cy) * t;
    x0 = coords[(pos + 0) | 0];
    y0 = coords[(pos + 1) | 0];
    x0 = x0 + (cx - x0) * t;
    y0 = y0 + (cy - y0) * t;
    cx = x0 + (x1 - x0) * t;
    cy = y0 + (y1 - y0) * t;
    (coords[(pos + 2) | 0]) = x0;
    (coords[(pos + 3) | 0]) = y0;
    (coords[(pos + 4) | 0]) = cx;
    (coords[(pos + 5) | 0]) = cy;
    (coords[(pos + 6) | 0]) = x1;
    (coords[(pos + 7) | 0]) = y1;
  }
  getOrder(): number {
    return 2;
  }
  getXTop(): number {
    return this.x0;
  }
  getYTop(): number {
    return this.y0;
  }
  getYBot(): number {
    return this.y1;
  }
  getXMin(): number {
    return this.xmin;
  }
  getXMax(): number {
    return this.xmax;
  }
  getX0(): number {
    return (this.direction === Curve.INCREASING) ? this.x0 : this.x1;
  }
  getY0(): number {
    return (this.direction === Curve.INCREASING) ? this.y0 : this.y1;
  }
  getX1(): number {
    return (this.direction === Curve.DECREASING) ? this.x0 : this.x1;
  }
  getY1(): number {
    return (this.direction === Curve.DECREASING) ? this.y0 : this.y1;
  }
  XforY(y: number): number {
    if (y <= this.y0) {
      return this.x0;
    }
    if (y >= this.y1) {
      return this.x1;
    }
    return this.XforT(this.TforY(y));
  }
  TforY(y: number): number {
    if (y <= this.y0) {
      return 0;
    }
    if (y >= this.y1) {
      return 1;
    }
    return Order2.TforY(y, this.ycoeff0, this.ycoeff1, this.ycoeff2);
  }
  static TforY(y: number, ycoeff0: number, ycoeff1: number, ycoeff2: number): number {
    ycoeff0 -= y;
    if (ycoeff2 === 0) {
      let root = -ycoeff0 / ycoeff1;
      if (root >= 0 && root <= 1) {
        return root;
      }
    } else {
      let d = ycoeff1 * ycoeff1 - 4 * ycoeff2 * ycoeff0;
      if (d >= 0) {
        d = Math.sqrt(d);
        if (ycoeff1 < 0) {
          d = -d;
        }
        let q = (ycoeff1 + d) / -2;
        let root = q / ycoeff2;
        if (root >= 0 && root <= 1) {
          return root;
        }
        if (q !== 0) {
          root = ycoeff0 / q;
          if (root >= 0 && root <= 1) {
            return root;
          }
        }
      }
    }
    let y0 = ycoeff0;
    let y1 = ycoeff0 + ycoeff1 + ycoeff2;
    return (0 < (y0 + y1) / 2) ? 0 : 1;
  }
  XforT(t: number): number {
    return (this.xcoeff2 * t + this.xcoeff1) * t + this.xcoeff0;
  }
  YforT(t: number): number {
    return (this.ycoeff2 * t + this.ycoeff1) * t + this.ycoeff0;
  }
  nextVertical(t0: number, t1: number): number {
    let t = -this.xcoeff1 / (2 * this.xcoeff2);
    if (t > t0 && t < t1) {
      return t;
    }
    return t1;
  }
  enlarge(r: Rectangle2D): void {
    r.add$double$double(this.x0, this.y0);
    let t = -this.xcoeff1 / (2 * this.xcoeff2);
    if (t > 0 && t < 1) {
      r.add$double$double(this.XforT(t), this.YforT(t));
    }
    r.add$double$double(this.x1, this.y1);
  }
  getSubCurve$double$double$int(ystart: number, yend: number, dir: number): Curve {
    let t0: number;
    let t1: number;
    if (ystart <= this.y0) {
      if (yend >= this.y1) {
        return this.getWithDirection(dir);
      }
      t0 = 0;
    } else {
      t0 = Order2.TforY(ystart, this.ycoeff0, this.ycoeff1, this.ycoeff2);
    }
    if (yend >= this.y1) {
      t1 = 1;
    } else {
      t1 = Order2.TforY(yend, this.ycoeff0, this.ycoeff1, this.ycoeff2);
    }
    let eqn = $J.newArray(10, 0);
    eqn[0] = this.x0;
    eqn[1] = this.y0;
    eqn[2] = this.cx0;
    eqn[3] = this.cy0;
    eqn[4] = this.x1;
    eqn[5] = this.y1;
    if (t1 < 1) {
      Order2.split(eqn, 0, t1);
    }
    let i: number;
    if (t0 <= 0) {
      i = 0;
    } else {
      Order2.split(eqn, 0, t0 / t1);
      i = 4;
    }
    return new Order2()._Order2(eqn[(i + 0) | 0], ystart, eqn[(i + 2) | 0], eqn[(i + 3) | 0], eqn[(i + 4) | 0], yend, dir);
  }
  getReversedCurve(): Curve {
    return new Order2()._Order2(this.x0, this.y0, this.cx0, this.cy0, this.x1, this.y1, -this.direction);
  }
  getSegment(coords: number[]): number {
    coords[0] = this.cx0;
    coords[1] = this.cy0;
    if (this.direction === Curve.INCREASING) {
      coords[2] = this.x1;
      coords[3] = this.y1;
    } else {
      coords[2] = this.x0;
      coords[3] = this.y0;
    }
    return PathIterator.SEG_QUADTO;
  }
  controlPointString(): string {
    return ('(' + $J.dstr(Curve.round(this.cx0)) + ', ' + $J.dstr(Curve.round(this.cy0)) + '), ');
  }
}

$J.define(Order2, 'sun.awt.geom.Order2', { kind: 'class', sup: 'sun.awt.geom.Curve', ctors: { 'double,double,double,double,double,double,int': '_Order2' }, meths: { 'getSubCurve(double,double,int)': 'getSubCurve$double$double$int' } });
$J.module(() => {
  PathIterator = $J.load('java.awt.geom.PathIterator');
});
