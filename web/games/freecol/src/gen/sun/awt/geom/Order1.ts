// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/geom/Order1.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, InternalError } from '../../../../jre/index.ts';
import { Curve } from './Curve.ts';

let PathIterator;

export class Order1 extends Curve {
  x0: number = 0;
  y0: number = 0;
  x1: number = 0;
  y1: number = 0;
  xmin: number = 0;
  xmax: number = 0;
  _Order1(x0: number, y0: number, x1: number, y1: number, direction: number): this {
    this._Curve(direction);
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    if (x0 < x1) {
      this.xmin = x0;
      this.xmax = x1;
    } else {
      this.xmin = x1;
      this.xmax = x0;
    }
    return this;
  }
  getOrder(): number {
    return 1;
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
    if (this.x0 === this.x1 || y <= this.y0) {
      return this.x0;
    }
    if (y >= this.y1) {
      return this.x1;
    }
    return (this.x0 + (y - this.y0) * (this.x1 - this.x0) / (this.y1 - this.y0));
  }
  TforY(y: number): number {
    if (y <= this.y0) {
      return 0;
    }
    if (y >= this.y1) {
      return 1;
    }
    return (y - this.y0) / (this.y1 - this.y0);
  }
  XforT(t: number): number {
    return this.x0 + t * (this.x1 - this.x0);
  }
  YforT(t: number): number {
    return this.y0 + t * (this.y1 - this.y0);
  }
  nextVertical(t0: number, t1: number): number {
    return t1;
  }
  accumulateCrossings(c: Crossings): boolean {
    let xlo = c.getXLo();
    let ylo = c.getYLo();
    let xhi = c.getXHi();
    let yhi = c.getYHi();
    if (this.xmin >= xhi) {
      return false;
    }
    let xstart: number;
    let ystart: number;
    let xend: number;
    let yend: number;
    if (this.y0 < ylo) {
      if (this.y1 <= ylo) {
        return false;
      }
      ystart = ylo;
      xstart = this.XforY(ylo);
    } else {
      if (this.y0 >= yhi) {
        return false;
      }
      ystart = this.y0;
      xstart = this.x0;
    }
    if (this.y1 > yhi) {
      yend = yhi;
      xend = this.XforY(yhi);
    } else {
      yend = this.y1;
      xend = this.x1;
    }
    if (xstart >= xhi && xend >= xhi) {
      return false;
    }
    if (xstart > xlo || xend > xlo) {
      return true;
    }
    c.record(ystart, yend, this.direction);
    return false;
  }
  enlarge(r: Rectangle2D): void {
    r.add$double$double(this.x0, this.y0);
    r.add$double$double(this.x1, this.y1);
  }
  getSubCurve$double$double$int(ystart: number, yend: number, dir: number): Curve {
    if (ystart === this.y0 && yend === this.y1) {
      return this.getWithDirection(dir);
    }
    if (this.x0 === this.x1) {
      return new Order1()._Order1(this.x0, ystart, this.x1, yend, dir);
    }
    let num = this.x0 - this.x1;
    let denom = this.y0 - this.y1;
    let xstart = (this.x0 + (ystart - this.y0) * num / denom);
    let xend = (this.x0 + (yend - this.y0) * num / denom);
    return new Order1()._Order1(xstart, ystart, xend, yend, dir);
  }
  getReversedCurve(): Curve {
    return new Order1()._Order1(this.x0, this.y0, this.x1, this.y1, -this.direction);
  }
  compareTo(other: Curve, yrange: number[]): number {
    if (!(other instanceof Order1)) {
      return super.compareTo(other, yrange);
    }
    let c1 = other;
    if (yrange[1] <= yrange[0]) {
      throw new InternalError('yrange already screwed up...');
    }
    yrange[1] = Math.min(Math.min(yrange[1], this.y1), c1.y1);
    if (yrange[1] <= yrange[0]) {
      throw new InternalError('backstepping from ' + $J.dstr(yrange[0]) + ' to ' + $J.dstr(yrange[1]));
    }
    if (this.xmax <= c1.xmin) {
      return (this.xmin === c1.xmax) ? 0 : -1;
    }
    if (this.xmin >= c1.xmax) {
      return 1;
    }
    let dxa = this.x1 - this.x0;
    let dya = this.y1 - this.y0;
    let dxb = c1.x1 - c1.x0;
    let dyb = c1.y1 - c1.y0;
    let denom = dxb * dya - dxa * dyb;
    let y: number;
    if (denom !== 0) {
      let num = ((this.x0 - c1.x0) * dya * dyb - this.y0 * dxa * dyb + c1.y0 * dxb * dya);
      y = num / denom;
      if (y <= yrange[0]) {
        y = Math.min(this.y1, c1.y1);
      } else {
        if (y < yrange[1]) {
          yrange[1] = y;
        }
        y = Math.max(this.y0, c1.y0);
      }
    } else {
      y = Math.max(this.y0, c1.y0);
    }
    return Curve.orderof(this.XforY(y), c1.XforY(y));
  }
  getSegment(coords: number[]): number {
    if (this.direction === Curve.INCREASING) {
      coords[0] = this.x1;
      coords[1] = this.y1;
    } else {
      coords[0] = this.x0;
      coords[1] = this.y0;
    }
    return PathIterator.SEG_LINETO;
  }
}

$J.define(Order1, 'sun.awt.geom.Order1', { kind: 'class', sup: 'sun.awt.geom.Curve', ctors: { 'double,double,double,double,int': '_Order1' }, meths: { 'getSubCurve(double,double,int)': 'getSubCurve$double$double$int' } });
$J.module(() => {
  PathIterator = $J.load('java.awt.geom.PathIterator');
});
