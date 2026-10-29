// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/geom/Edge.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../jre/index.ts';

let AreaOp;

export class Edge extends JObject {
  curve: Curve = null;
  ctag: number = 0;
  etag: number = 0;
  activey: number = 0;
  equivalence: number = 0;
  lastEdge: Edge = null;
  lastResult: number = 0;
  lastLimit: number = 0;
  _Edge$Curve$int(c: Curve, ctag: number): this {
    this._Edge$Curve$int$int(c, ctag, AreaOp.ETAG_IGNORE);
    return this;
  }
  _Edge$Curve$int$int(c: Curve, ctag: number, etag: number): this {
    this.curve = c;
    this.ctag = ctag;
    this.etag = etag;
    return this;
  }
  getCurve(): Curve {
    return this.curve;
  }
  getCurveTag(): number {
    return this.ctag;
  }
  getEquivalence(): number {
    return this.equivalence;
  }
  setEquivalence(eq: number): void {
    this.equivalence = eq;
  }
  compareTo(other: Edge, yrange: number[]): number {
    if (other === this.lastEdge && yrange[0] < this.lastLimit) {
      if (yrange[1] > this.lastLimit) {
        yrange[1] = this.lastLimit;
      }
      return this.lastResult;
    }
    if (this === other.lastEdge && yrange[0] < other.lastLimit) {
      if (yrange[1] > other.lastLimit) {
        yrange[1] = other.lastLimit;
      }
      return (0 - other.lastResult) | 0;
    }
    let ret = this.curve.compareTo(other.curve, yrange);
    this.lastEdge = other;
    this.lastLimit = yrange[1];
    this.lastResult = ret;
    return ret;
  }
  record(yend: number, etag: number): void {
    this.activey = yend;
    this.etag = etag;
  }
  isActiveFor(y: number, etag: number): boolean {
    return (this.etag === etag && this.activey >= y);
  }
  toString(): string {
    return ('Edge[' + $J.str(this.curve) + ', ' + (this.ctag === AreaOp.CTAG_LEFT ? 'L' : 'R') + ', ' + (this.etag === AreaOp.ETAG_ENTER ? 'I' : (this.etag === AreaOp.ETAG_EXIT ? 'O' : 'N')) + ']');
  }
}

$J.define(Edge, 'sun.awt.geom.Edge', { kind: 'class', sup: 'java.lang.Object', ctors: { 'sun.awt.geom.Curve,int,int': '_Edge$Curve$int$int', 'sun.awt.geom.Curve,int': '_Edge$Curve$int' } });
$J.module(() => {
  AreaOp = $J.load('sun.awt.geom.AreaOp');
});
