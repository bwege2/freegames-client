// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/geom/CurveLink.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, Oracle and/or its affiliates. All rights reserved.
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
import { $J, InternalError, JObject } from '../../../../jre/index.ts';

let Order0;

export class CurveLink extends JObject {
  curve: Curve = null;
  ytop: number = 0;
  ybot: number = 0;
  etag: number = 0;
  next_: CurveLink = null;
  _CurveLink(curve: Curve, ystart: number, yend: number, etag: number): this {
    this.curve = curve;
    this.ytop = ystart;
    this.ybot = yend;
    this.etag = etag;
    if (this.ytop < curve.getYTop() || this.ybot > curve.getYBot()) {
      throw new InternalError('bad curvelink [' + $J.dstr(this.ytop) + '=>' + $J.dstr(this.ybot) + '] for ' + $J.str(curve));
    }
    return this;
  }
  absorb$CurveLink(link: CurveLink): boolean {
    return this.absorb$Curve$double$double$int(link.curve, link.ytop, link.ybot, link.etag);
  }
  absorb$Curve$double$double$int(curve: Curve, ystart: number, yend: number, etag: number): boolean {
    if (this.curve !== curve || this.etag !== etag || this.ybot < ystart || this.ytop > yend) {
      return false;
    }
    if (ystart < curve.getYTop() || yend > curve.getYBot()) {
      throw new InternalError('bad curvelink [' + $J.dstr(ystart) + '=>' + $J.dstr(yend) + '] for ' + $J.str(curve));
    }
    this.ytop = Math.min(this.ytop, ystart);
    this.ybot = Math.max(this.ybot, yend);
    return true;
  }
  getSubCurve(): Curve {
    if (this.ytop === this.curve.getYTop() && this.ybot === this.curve.getYBot()) {
      return this.curve.getWithDirection(this.etag);
    }
    return this.curve.getSubCurve$double$double$int(this.ytop, this.ybot, this.etag);
  }
  getMoveto(): Curve {
    return new Order0()._Order0(this.getXTop(), this.getYTop());
  }
  getXTop(): number {
    return this.curve.XforY(this.ytop);
  }
  getYTop(): number {
    return this.ytop;
  }
  getXBot(): number {
    return this.curve.XforY(this.ybot);
  }
  getX(): number {
    return this.curve.XforY(this.ytop);
  }
  getEdgeTag(): number {
    return this.etag;
  }
  setNext(link: CurveLink): void {
    this.next_ = link;
  }
  getNext(): CurveLink {
    return this.next_;
  }
}

$J.define(CurveLink, 'sun.awt.geom.CurveLink', { kind: 'class', sup: 'java.lang.Object', ctors: { 'sun.awt.geom.Curve,double,double,int': '_CurveLink' }, meths: { 'absorb(sun.awt.geom.Curve,double,double,int)': 'absorb$Curve$double$double$int', 'absorb(sun.awt.geom.CurveLink)': 'absorb$CurveLink' } });
$J.module(() => {
  Order0 = $J.load('sun.awt.geom.Order0');
});
