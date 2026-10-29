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
import { $J, JObject, NoSuchElementException } from '../../../../jre/index.ts';

let PathIterator;

export class AreaIterator extends JObject {
  transform_: AffineTransform = null;
  curves: Vector<Curve> = null;
  index_: number = 0;
  prevcurve: Curve = null;
  thiscurve: Curve = null;
  _AreaIterator(curves: Vector<Curve>, at: AffineTransform): this {
    this.curves = curves;
    this.transform_ = at;
    if (curves.size() >= 1) {
      this.thiscurve = curves.get(0);
    }
    return this;
  }
  getWindingRule(): number {
    return PathIterator.WIND_NON_ZERO;
  }
  isDone(): boolean {
    return (this.prevcurve == null && this.thiscurve == null);
  }
  next$(): void {
    if (this.prevcurve != null) {
      this.prevcurve = null;
    } else {
      this.prevcurve = this.thiscurve;
      this.index_++;
      if (this.index_ < this.curves.size()) {
        this.thiscurve = this.curves.get(this.index_);
        if (this.thiscurve.getOrder() !== 0 && this.prevcurve.getX1() === this.thiscurve.getX0() && this.prevcurve.getY1() === this.thiscurve.getY0()) {
          this.prevcurve = null;
        }
      } else {
        this.thiscurve = null;
      }
    }
  }
  currentSegment$floatArr(coords: number[]): number {
    let dcoords = $J.newArray(6, 0);
    let segtype = this.currentSegment$doubleArr(dcoords);
    let numpoints = (segtype === PathIterator.SEG_CLOSE ? 0 : (segtype === PathIterator.SEG_QUADTO ? 2 : (segtype === PathIterator.SEG_CUBICTO ? 3 : 1)));
    for (let i = 0; i < Math.imul(numpoints, 2); i++) {
      coords[i] = Math.fround(dcoords[i]);
    }
    return segtype;
  }
  currentSegment$doubleArr(coords: number[]): number {
    let segtype: number;
    let numpoints: number;
    if (this.prevcurve != null) {
      if (this.thiscurve == null || this.thiscurve.getOrder() === 0) {
        return PathIterator.SEG_CLOSE;
      }
      coords[0] = this.thiscurve.getX0();
      coords[1] = this.thiscurve.getY0();
      segtype = PathIterator.SEG_LINETO;
      numpoints = 1;
    } else if (this.thiscurve == null) {
      throw new NoSuchElementException('area iterator out of bounds');
    } else {
      segtype = this.thiscurve.getSegment(coords);
      numpoints = this.thiscurve.getOrder();
      if (numpoints === 0) {
        numpoints = 1;
      }
    }
    if (this.transform_ != null) {
      this.transform_.transform$doubleArr$int$doubleArr$int$int(coords, 0, coords, 0, numpoints);
    }
    return segtype;
  }
}

$J.define(AreaIterator, 'java.awt.geom.AreaIterator', { kind: 'class', ifaces: ['java.awt.geom.PathIterator'], sup: 'java.lang.Object', ctors: { 'java.util.Vector,java.awt.geom.AffineTransform': '_AreaIterator' }, meths: { 'currentSegment(double[])': 'currentSegment$doubleArr', 'currentSegment(float[])': 'currentSegment$floatArr', 'next()': 'next$' } });
$J.module(() => {
  PathIterator = $J.load('java.awt.geom.PathIterator');
});
