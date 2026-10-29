// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/geom/Order3.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let PathIterator, QuadCurve2D, Order2;

export class Order3 extends Curve {
  x0: number = 0;
  y0: number = 0;
  cx0: number = 0;
  cy0: number = 0;
  cx1: number = 0;
  cy1: number = 0;
  x1: number = 0;
  y1: number = 0;
  xmin: number = 0;
  xmax: number = 0;
  xcoeff0: number = 0;
  xcoeff1: number = 0;
  xcoeff2: number = 0;
  xcoeff3: number = 0;
  ycoeff0: number = 0;
  ycoeff1: number = 0;
  ycoeff2: number = 0;
  ycoeff3: number = 0;
  TforY1: number = 0;
  YforT1: number = 0;
  TforY2: number = 0;
  YforT2: number = 0;
  TforY3: number = 0;
  YforT3: number = 0;
  _Order3(x0: number, y0: number, cx0: number, cy0: number, cx1: number, cy1: number, x1: number, y1: number, direction: number): this {
    this._Curve(direction);
    if (cy0 < y0) {
      cy0 = y0;
    }
    if (cy1 > y1) {
      cy1 = y1;
    }
    this.x0 = x0;
    this.y0 = y0;
    this.cx0 = cx0;
    this.cy0 = cy0;
    this.cx1 = cx1;
    this.cy1 = cy1;
    this.x1 = x1;
    this.y1 = y1;
    this.xmin = Math.min(Math.min(x0, x1), Math.min(cx0, cx1));
    this.xmax = Math.max(Math.max(x0, x1), Math.max(cx0, cx1));
    this.xcoeff0 = x0;
    this.xcoeff1 = (cx0 - x0) * 3;
    this.xcoeff2 = (cx1 - cx0 - cx0 + x0) * 3;
    this.xcoeff3 = x1 - (cx1 - cx0) * 3 - x0;
    this.ycoeff0 = y0;
    this.ycoeff1 = (cy0 - y0) * 3;
    this.ycoeff2 = (cy1 - cy0 - cy0 + y0) * 3;
    this.ycoeff3 = y1 - (cy1 - cy0) * 3 - y0;
    this.YforT1 = this.YforT2 = this.YforT3 = y0;
    return this;
  }
  static insert(curves: Vector<Curve>, tmp: number[], x0: number, y0: number, cx0: number, cy0: number, cx1: number, cy1: number, x1: number, y1: number, direction: number): void {
    let numparams = Order3.getHorizontalParams(y0, cy0, cy1, y1, tmp);
    if (numparams === 0) {
      Order3.addInstance(curves, x0, y0, cx0, cy0, cx1, cy1, x1, y1, direction);
      return;
    }
    tmp[3] = x0;
    tmp[4] = y0;
    tmp[5] = cx0;
    tmp[6] = cy0;
    tmp[7] = cx1;
    tmp[8] = cy1;
    tmp[9] = x1;
    tmp[10] = y1;
    let t = tmp[0];
    if (numparams > 1 && t > tmp[1]) {
      tmp[0] = tmp[1];
      tmp[1] = t;
      t = tmp[0];
    }
    Order3.split(tmp, 3, t);
    if (numparams > 1) {
      t = (tmp[1] - t) / (1 - t);
      Order3.split(tmp, 9, t);
    }
    let index = 3;
    if (direction === Curve.DECREASING) {
      index = (index + Math.imul(numparams, 6)) | 0;
    }
    while (numparams >= 0) {
      Order3.addInstance(curves, tmp[(index + 0) | 0], tmp[(index + 1) | 0], tmp[(index + 2) | 0], tmp[(index + 3) | 0], tmp[(index + 4) | 0], tmp[(index + 5) | 0], tmp[(index + 6) | 0], tmp[(index + 7) | 0], direction);
      numparams--;
      if (direction === Curve.INCREASING) {
        index = (index + 6) | 0;
      } else {
        index = (index - 6) | 0;
      }
    }
  }
  static addInstance(curves: Vector<Curve>, x0: number, y0: number, cx0: number, cy0: number, cx1: number, cy1: number, x1: number, y1: number, direction: number): void {
    if (y0 > y1) {
      curves.add(new Order3()._Order3(x1, y1, cx1, cy1, cx0, cy0, x0, y0, -direction));
    } else if (y1 > y0) {
      curves.add(new Order3()._Order3(x0, y0, cx0, cy0, cx1, cy1, x1, y1, direction));
    }
  }
  static getHorizontalParams(c0: number, cp0: number, cp1: number, c1: number, ret: number[]): number {
    if (c0 <= cp0 && cp0 <= cp1 && cp1 <= c1) {
      return 0;
    }
    c1 -= cp1;
    cp1 -= cp0;
    cp0 -= c0;
    ret[0] = cp0;
    ret[1] = (cp1 - cp0) * 2;
    ret[2] = (c1 - cp1 - cp1 + cp0);
    let numroots = QuadCurve2D.solveQuadratic$doubleArr$doubleArr(ret, ret);
    let j = 0;
    for (let i = 0; i < numroots; i++) {
      let t = ret[i];
      if (t > 0 && t < 1) {
        if (j < i) {
          ret[j] = t;
        }
        j++;
      }
    }
    return j;
  }
  static split(coords: number[], pos: number, t: number): void {
    let x0: number;
    let y0: number;
    let cx0: number;
    let cy0: number;
    let cx1: number;
    let cy1: number;
    let x1: number;
    let y1: number;
    (coords[(pos + 12) | 0]) = x1 = coords[(pos + 6) | 0];
    (coords[(pos + 13) | 0]) = y1 = coords[(pos + 7) | 0];
    cx1 = coords[(pos + 4) | 0];
    cy1 = coords[(pos + 5) | 0];
    x1 = cx1 + (x1 - cx1) * t;
    y1 = cy1 + (y1 - cy1) * t;
    x0 = coords[(pos + 0) | 0];
    y0 = coords[(pos + 1) | 0];
    cx0 = coords[(pos + 2) | 0];
    cy0 = coords[(pos + 3) | 0];
    x0 = x0 + (cx0 - x0) * t;
    y0 = y0 + (cy0 - y0) * t;
    cx0 = cx0 + (cx1 - cx0) * t;
    cy0 = cy0 + (cy1 - cy0) * t;
    cx1 = cx0 + (x1 - cx0) * t;
    cy1 = cy0 + (y1 - cy0) * t;
    cx0 = x0 + (cx0 - x0) * t;
    cy0 = y0 + (cy0 - y0) * t;
    (coords[(pos + 2) | 0]) = x0;
    (coords[(pos + 3) | 0]) = y0;
    (coords[(pos + 4) | 0]) = cx0;
    (coords[(pos + 5) | 0]) = cy0;
    (coords[(pos + 6) | 0]) = cx0 + (cx1 - cx0) * t;
    (coords[(pos + 7) | 0]) = cy0 + (cy1 - cy0) * t;
    (coords[(pos + 8) | 0]) = cx1;
    (coords[(pos + 9) | 0]) = cy1;
    (coords[(pos + 10) | 0]) = x1;
    (coords[(pos + 11) | 0]) = y1;
  }
  getOrder(): number {
    return 3;
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
  getCX0(): number {
    return (this.direction === Curve.INCREASING) ? this.cx0 : this.cx1;
  }
  getCY0(): number {
    return (this.direction === Curve.INCREASING) ? this.cy0 : this.cy1;
  }
  getCX1(): number {
    return (this.direction === Curve.DECREASING) ? this.cx0 : this.cx1;
  }
  getCY1(): number {
    return (this.direction === Curve.DECREASING) ? this.cy0 : this.cy1;
  }
  getX1(): number {
    return (this.direction === Curve.DECREASING) ? this.x0 : this.x1;
  }
  getY1(): number {
    return (this.direction === Curve.DECREASING) ? this.y0 : this.y1;
  }
  TforY(y: number): number {
    if (y <= this.y0) {
      return 0;
    }
    if (y >= this.y1) {
      return 1;
    }
    if (y === this.YforT1) {
      return this.TforY1;
    }
    if (y === this.YforT2) {
      return this.TforY2;
    }
    if (y === this.YforT3) {
      return this.TforY3;
    }
    if (this.ycoeff3 === 0) {
      return Order2.TforY(y, this.ycoeff0, this.ycoeff1, this.ycoeff2);
    }
    let a = this.ycoeff2 / this.ycoeff3;
    let b = this.ycoeff1 / this.ycoeff3;
    let c = (this.ycoeff0 - y) / this.ycoeff3;
    let roots = 0;
    let Q = (a * a - 3 * b) / 9;
    let R = (2 * a * a * a - 9 * a * b + 27 * c) / 54;
    let R2 = R * R;
    let Q3 = Q * Q * Q;
    let a_3 = a / 3;
    let t: number;
    if (R2 < Q3) {
      let theta = Math.acos(R / Math.sqrt(Q3));
      Q = -2 * Math.sqrt(Q);
      t = this.refine(a, b, c, y, Q * (Math.cos(theta / 3)) - a_3);
      if (t < 0) {
        t = this.refine(a, b, c, y, Q * (Math.cos((theta + 3.141592653589793 * 2) / 3)) - a_3);
      }
      if (t < 0) {
        t = this.refine(a, b, c, y, Q * (Math.cos((theta - 3.141592653589793 * 2) / 3)) - a_3);
      }
    } else {
      let neg = (R < 0);
      let S = Math.sqrt(R2 - Q3);
      if (neg) {
        R = -R;
      }
      let A = $J.pow(R + S, 1 / 3);
      if (!neg) {
        A = -A;
      }
      let B = (A === 0) ? 0 : (Q / A);
      t = this.refine(a, b, c, y, (A + B) - a_3);
    }
    if (t < 0) {
      let t0 = 0;
      let t1 = 1;
      while (true) {
        t = (t0 + t1) / 2;
        if (t === t0 || t === t1) {
          break;
        }
        let yt = this.YforT(t);
        if (yt < y) {
          t0 = t;
        } else if (yt > y) {
          t1 = t;
        } else {
          break;
        }
      }
    }
    if (t >= 0) {
      this.TforY3 = this.TforY2;
      this.YforT3 = this.YforT2;
      this.TforY2 = this.TforY1;
      this.YforT2 = this.YforT1;
      this.TforY1 = t;
      this.YforT1 = y;
    }
    return t;
  }
  refine(a: number, b: number, c: number, target: number, t: number): number {
    if (t < -0.1 || t > 1.1) {
      return -1;
    }
    let y = this.YforT(t);
    let t0: number;
    let t1: number;
    if (y < target) {
      t0 = t;
      t1 = 1;
    } else {
      t0 = 0;
      t1 = t;
    }
    let origt = t;
    let origy = y;
    let useslope = true;
    while (y !== target) {
      if (!useslope) {
        let t2 = (t0 + t1) / 2;
        if (t2 === t0 || t2 === t1) {
          break;
        }
        t = t2;
      } else {
        let slope = this.dYforT(t, 1);
        if (slope === 0) {
          useslope = false;
          continue;
        }
        let t2 = t + ((target - y) / slope);
        if (t2 === t || t2 <= t0 || t2 >= t1) {
          useslope = false;
          continue;
        }
        t = t2;
      }
      y = this.YforT(t);
      if (y < target) {
        t0 = t;
      } else if (y > target) {
        t1 = t;
      } else {
        break;
      }
    }
    let verbose = false;
    if (false && t >= 0 && t <= 1) {
      y = this.YforT(t);
      let tdiff = Curve.diffbits(t, origt);
      let ydiff = Curve.diffbits(y, origy);
      let yerr = Curve.diffbits(y, target);
      if (yerr > 0 || (verbose && tdiff > 0)) {
        $J.out.println('target was y = ' + $J.dstr(target));
        $J.out.println('original was y = ' + $J.dstr(origy) + ', t = ' + $J.dstr(origt));
        $J.out.println('final was y = ' + $J.dstr(y) + ', t = ' + $J.dstr(t));
        $J.out.println('t diff is ' + tdiff);
        $J.out.println('y diff is ' + ydiff);
        $J.out.println('y error is ' + yerr);
        let tlow = Curve.prev(t);
        let ylow = this.YforT(tlow);
        let thi = Curve.next(t);
        let yhi = this.YforT(thi);
        if (Math.abs(target - ylow) < Math.abs(target - y) || Math.abs(target - yhi) < Math.abs(target - y)) {
          $J.out.println('adjacent y\'s = [' + $J.dstr(ylow) + ', ' + $J.dstr(yhi) + ']');
        }
      }
    }
    return (t > 1) ? -1 : t;
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
  XforT(t: number): number {
    return (((this.xcoeff3 * t) + this.xcoeff2) * t + this.xcoeff1) * t + this.xcoeff0;
  }
  YforT(t: number): number {
    return (((this.ycoeff3 * t) + this.ycoeff2) * t + this.ycoeff1) * t + this.ycoeff0;
  }
  dYforT(t: number, deriv: number): number {
    switch (deriv) {
      case 0:
        return (((this.ycoeff3 * t) + this.ycoeff2) * t + this.ycoeff1) * t + this.ycoeff0;
      case 1:
        return ((3 * this.ycoeff3 * t) + 2 * this.ycoeff2) * t + this.ycoeff1;
      case 2:
        return (6 * this.ycoeff3 * t) + 2 * this.ycoeff2;
      case 3:
        return 6 * this.ycoeff3;
      default:
        return 0;
    }
  }
  nextVertical(t0: number, t1: number): number {
    let eqn = [this.xcoeff1, 2 * this.xcoeff2, 3 * this.xcoeff3];
    let numroots = QuadCurve2D.solveQuadratic$doubleArr$doubleArr(eqn, eqn);
    for (let i = 0; i < numroots; i++) {
      if (eqn[i] > t0 && eqn[i] < t1) {
        t1 = eqn[i];
      }
    }
    return t1;
  }
  enlarge(r: Rectangle2D): void {
    r.add$double$double(this.x0, this.y0);
    let eqn = [this.xcoeff1, 2 * this.xcoeff2, 3 * this.xcoeff3];
    let numroots = QuadCurve2D.solveQuadratic$doubleArr$doubleArr(eqn, eqn);
    for (let i = 0; i < numroots; i++) {
      let t = eqn[i];
      if (t > 0 && t < 1) {
        r.add$double$double(this.XforT(t), this.YforT(t));
      }
    }
    r.add$double$double(this.x1, this.y1);
  }
  getSubCurve$double$double$int(ystart: number, yend: number, dir: number): Curve {
    if (ystart <= this.y0 && yend >= this.y1) {
      return this.getWithDirection(dir);
    }
    let eqn = $J.newArray(14, 0);
    let t0: number;
    let t1: number;
    t0 = this.TforY(ystart);
    t1 = this.TforY(yend);
    eqn[0] = this.x0;
    eqn[1] = this.y0;
    eqn[2] = this.cx0;
    eqn[3] = this.cy0;
    eqn[4] = this.cx1;
    eqn[5] = this.cy1;
    eqn[6] = this.x1;
    eqn[7] = this.y1;
    if (t0 > t1) {
      let t = t0;
      t0 = t1;
      t1 = t;
    }
    if (t1 < 1) {
      Order3.split(eqn, 0, t1);
    }
    let i: number;
    if (t0 <= 0) {
      i = 0;
    } else {
      Order3.split(eqn, 0, t0 / t1);
      i = 6;
    }
    return new Order3()._Order3(eqn[(i + 0) | 0], ystart, eqn[(i + 2) | 0], eqn[(i + 3) | 0], eqn[(i + 4) | 0], eqn[(i + 5) | 0], eqn[(i + 6) | 0], yend, dir);
  }
  getReversedCurve(): Curve {
    return new Order3()._Order3(this.x0, this.y0, this.cx0, this.cy0, this.cx1, this.cy1, this.x1, this.y1, -this.direction);
  }
  getSegment(coords: number[]): number {
    if (this.direction === Curve.INCREASING) {
      coords[0] = this.cx0;
      coords[1] = this.cy0;
      coords[2] = this.cx1;
      coords[3] = this.cy1;
      coords[4] = this.x1;
      coords[5] = this.y1;
    } else {
      coords[0] = this.cx1;
      coords[1] = this.cy1;
      coords[2] = this.cx0;
      coords[3] = this.cy0;
      coords[4] = this.x0;
      coords[5] = this.y0;
    }
    return PathIterator.SEG_CUBICTO;
  }
  controlPointString(): string {
    return (('(' + $J.dstr(Curve.round(this.getCX0())) + ', ' + $J.dstr(Curve.round(this.getCY0())) + '), ') + ('(' + $J.dstr(Curve.round(this.getCX1())) + ', ' + $J.dstr(Curve.round(this.getCY1())) + '), '));
  }
}

$J.define(Order3, 'sun.awt.geom.Order3', { kind: 'class', sup: 'sun.awt.geom.Curve', ctors: { 'double,double,double,double,double,double,double,double,int': '_Order3' }, meths: { 'getSubCurve(double,double,int)': 'getSubCurve$double$double$int' } });
$J.module(() => {
  PathIterator = $J.load('java.awt.geom.PathIterator');
  QuadCurve2D = $J.load('java.awt.geom.QuadCurve2D');
  Order2 = $J.load('sun.awt.geom.Order2');
});
