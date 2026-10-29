// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/geom/Order0.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

export class Order0 extends Curve {
  x_: number = 0;
  y_: number = 0;
  _Order0(x: number, y: number): this {
    this._Curve(Curve.INCREASING);
    this.x_ = x;
    this.y_ = y;
    return this;
  }
  getOrder(): number {
    return 0;
  }
  getXTop(): number {
    return this.x_;
  }
  getYTop(): number {
    return this.y_;
  }
  getYBot(): number {
    return this.y_;
  }
  getXMin(): number {
    return this.x_;
  }
  getXMax(): number {
    return this.x_;
  }
  getX0(): number {
    return this.x_;
  }
  getY0(): number {
    return this.y_;
  }
  getX1(): number {
    return this.x_;
  }
  getY1(): number {
    return this.y_;
  }
  XforY(y: number): number {
    return y;
  }
  TforY(y: number): number {
    return 0;
  }
  XforT(t: number): number {
    return this.x_;
  }
  YforT(t: number): number {
    return this.y_;
  }
  nextVertical(t0: number, t1: number): number {
    return t1;
  }
  accumulateCrossings(c: Crossings): boolean {
    return (this.x_ > c.getXLo() && this.x_ < c.getXHi() && this.y_ > c.getYLo() && this.y_ < c.getYHi());
  }
  enlarge(r: Rectangle2D): void {
    r.add$double$double(this.x_, this.y_);
  }
  getSubCurve$double$double$int(ystart: number, yend: number, dir: number): Curve {
    return this;
  }
  getReversedCurve(): Curve {
    return this;
  }
  getSegment(coords: number[]): number {
    coords[0] = this.x_;
    coords[1] = this.y_;
    return PathIterator.SEG_MOVETO;
  }
}

$J.define(Order0, 'sun.awt.geom.Order0', { kind: 'class', sup: 'sun.awt.geom.Curve', ctors: { 'double,double': '_Order0' }, meths: { 'getSubCurve(double,double,int)': 'getSubCurve$double$double$int' } });
$J.module(() => {
  PathIterator = $J.load('java.awt.geom.PathIterator');
});
