// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/geom/Crossings.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

export class Crossings extends JObject {
  static readonly debug: boolean = false;
  limit_: number = 0;
  yranges: number[] = null;
  xlo: number = 0;
  ylo: number = 0;
  xhi: number = 0;
  yhi: number = 0;
  tmp: Vector<Curve> = null;
  _Crossings(xlo: number, ylo: number, xhi: number, yhi: number): this {
    this.limit_ = 0;
    this.yranges = $J.newArray(10, 0);
    this.tmp = new Vector();
    this.xlo = xlo;
    this.ylo = ylo;
    this.xhi = xhi;
    this.yhi = yhi;
    return this;
  }
  getXLo(): number {
    return this.xlo;
  }
  getYLo(): number {
    return this.ylo;
  }
  getXHi(): number {
    return this.xhi;
  }
  getYHi(): number {
    return this.yhi;
  }
  print(): void {
    $J.out.println('Crossings [');
    $J.out.println('  bounds = [' + $J.dstr(this.ylo) + ', ' + $J.dstr(this.yhi) + ']');
    for (let i = 0; i < this.limit_; i = (i + 2) | 0) {
      $J.out.println('  [' + $J.dstr(this.yranges[i]) + ', ' + $J.dstr(this.yranges[(i + 1) | 0]) + ']');
    }
    $J.out.println(']');
  }
  isEmpty(): boolean {
    return (this.limit_ === 0);
  }
  static findCrossings$Vector$double$double$double$double(curves: Vector<Curve>, xlo: number, ylo: number, xhi: number, yhi: number): Crossings {
    let cross = new Crossings$EvenOdd()._Crossings$EvenOdd(xlo, ylo, xhi, yhi);
    let enum_ = curves.elements();
    while (enum_.hasMoreElements()) {
      let c = enum_.nextElement();
      if (c.accumulateCrossings(cross)) {
        return null;
      }
    }
    if (Crossings.debug) {
      cross.print();
    }
    return cross;
  }
  accumulateLine$double$double$double$double(x0: number, y0: number, x1: number, y1: number): boolean {
    if (y0 <= y1) {
      return this.accumulateLine$double$double$double$double$int(x0, y0, x1, y1, 1);
    } else {
      return this.accumulateLine$double$double$double$double$int(x1, y1, x0, y0, -1);
    }
  }
  accumulateLine$double$double$double$double$int(x0: number, y0: number, x1: number, y1: number, direction: number): boolean {
    if (this.yhi <= y0 || this.ylo >= y1) {
      return false;
    }
    if (x0 >= this.xhi && x1 >= this.xhi) {
      return false;
    }
    if (y0 === y1) {
      return (x0 >= this.xlo || x1 >= this.xlo);
    }
    let xstart: number;
    let ystart: number;
    let xend: number;
    let yend: number;
    let dx = (x1 - x0);
    let dy = (y1 - y0);
    if (y0 < this.ylo) {
      xstart = x0 + (this.ylo - y0) * dx / dy;
      ystart = this.ylo;
    } else {
      xstart = x0;
      ystart = y0;
    }
    if (this.yhi < y1) {
      xend = x0 + (this.yhi - y0) * dx / dy;
      yend = this.yhi;
    } else {
      xend = x1;
      yend = y1;
    }
    if (xstart >= this.xhi && xend >= this.xhi) {
      return false;
    }
    if (xstart > this.xlo || xend > this.xlo) {
      return true;
    }
    this.record(ystart, yend, direction);
    return false;
  }
}

export class Crossings$EvenOdd extends Crossings {
  _Crossings$EvenOdd(xlo: number, ylo: number, xhi: number, yhi: number): this {
    this._Crossings(xlo, ylo, xhi, yhi);
    return this;
  }
  record(ystart: number, yend: number, direction: number): void {
    if (ystart >= yend) {
      return;
    }
    let from = 0;
    while (from < this.limit_ && ystart > (this.yranges[(from + 1) | 0])) {
      from = (from + 2) | 0;
    }
    let to = from;
    while (from < this.limit_) {
      let yrlo = this.yranges[from++];
      let yrhi = this.yranges[from++];
      if (yend < yrlo) {
        this.yranges[to++] = ystart;
        this.yranges[to++] = yend;
        ystart = yrlo;
        yend = yrhi;
        continue;
      }
      let yll: number;
      let ylh: number;
      let yhl: number;
      let yhh: number;
      if (ystart < yrlo) {
        yll = ystart;
        ylh = yrlo;
      } else {
        yll = yrlo;
        ylh = ystart;
      }
      if (yend < yrhi) {
        yhl = yend;
        yhh = yrhi;
      } else {
        yhl = yrhi;
        yhh = yend;
      }
      if (ylh === yhl) {
        ystart = yll;
        yend = yhh;
      } else {
        if (ylh > yhl) {
          ystart = yhl;
          yhl = ylh;
          ylh = ystart;
        }
        if (yll !== ylh) {
          this.yranges[to++] = yll;
          this.yranges[to++] = ylh;
        }
        ystart = yhl;
        yend = yhh;
      }
      if (ystart >= yend) {
        break;
      }
    }
    if (to < from && from < this.limit_) {
      $J.system_arraycopy(this.yranges, from, this.yranges, to, (this.limit_ - from) | 0);
    }
    to = (to + (this.limit_ - from)) | 0;
    if (ystart < yend) {
      if (to >= this.yranges.length) {
        let newranges = $J.newArray((to + 10) | 0, 0);
        $J.system_arraycopy(this.yranges, 0, newranges, 0, to);
        this.yranges = newranges;
      }
      this.yranges[to++] = ystart;
      this.yranges[to++] = yend;
    }
    this.limit_ = to;
  }
}

$J.define(Crossings, 'sun.awt.geom.Crossings', { kind: 'class', sup: 'java.lang.Object', ctors: { 'double,double,double,double': '_Crossings' }, meths: { 'accumulateLine(double,double,double,double,int)': 'accumulateLine$double$double$double$double$int', 'accumulateLine(double,double,double,double)': 'accumulateLine$double$double$double$double', 'findCrossings(java.awt.geom.PathIterator,double,double,double,double)': 'findCrossings$PathIterator$double$double$double$double', 'findCrossings(java.util.Vector,double,double,double,double)': 'findCrossings$Vector$double$double$double$double' } });
$J.define(Crossings$EvenOdd, 'sun.awt.geom.Crossings$EvenOdd', { kind: 'class', sup: 'sun.awt.geom.Crossings', ctors: { 'double,double,double,double': '_Crossings$EvenOdd' } });
