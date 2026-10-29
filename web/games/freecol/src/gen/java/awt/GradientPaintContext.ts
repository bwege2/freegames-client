// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/GradientPaintContext.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

let NoninvertibleTransformException, Point2D$Double, ColorModel, DirectColorModel;

export class GradientPaintContext extends JObject {
  static xrgbmodel: ColorModel = null;
  static xbgrmodel: ColorModel = null;
  static cachedModel: ColorModel = null;
  static cached: WeakReference<Raster> = null;
  x1: number = 0;
  y1: number = 0;
  dx: number = 0;
  dy: number = 0;
  cyclic: boolean = false;
  interp: number[] = null;
  saved: Raster = null;
  model: ColorModel = null;
  _GradientPaintContext(cm: ColorModel, p1: Point2D, p2: Point2D, xform: AffineTransform, c1: Color, c2: Color, cyclic: boolean): this {
    let xvec = new Point2D$Double()._Point2D$Double$double$double(1, 0);
    let yvec = new Point2D$Double()._Point2D$Double$double$double(0, 1);
    try {
      let inverse = xform.createInverse();
      inverse.deltaTransform$Point2D$Point2D(xvec, xvec);
      inverse.deltaTransform$Point2D$Point2D(yvec, yvec);
    } catch ($e0) {
      if ($J.isa($e0, NoninvertibleTransformException)) {
        let e = $J.exc($e0);
        xvec.setLocation$double$double(0, 0);
        yvec.setLocation$double$double(0, 0);
      } else {
        throw $e0;
      }
    }
    let udx = p2.getX() - p1.getX();
    let udy = p2.getY() - p1.getY();
    let ulenSq = udx * udx + udy * udy;
    if (ulenSq <= 4.9E-324) {
      this.dx = 0;
      this.dy = 0;
    } else {
      this.dx = (xvec.getX() * udx + xvec.getY() * udy) / ulenSq;
      this.dy = (yvec.getX() * udx + yvec.getY() * udy) / ulenSq;
      if (cyclic) {
        this.dx = this.dx % 1;
        this.dy = this.dy % 1;
      } else {
        if (this.dx < 0) {
          let p = p1;
          p1 = p2;
          p2 = p;
          let c = c1;
          c1 = c2;
          c2 = c;
          this.dx = -this.dx;
          this.dy = -this.dy;
        }
      }
    }
    let dp1 = xform.transform$Point2D$Point2D(p1, null);
    this.x1 = dp1.getX();
    this.y1 = dp1.getY();
    this.cyclic = cyclic;
    let rgb1 = c1.getRGB();
    let rgb2 = c2.getRGB();
    let a1 = (rgb1 >> 24) & 255;
    let r1 = (rgb1 >> 16) & 255;
    let g1 = (rgb1 >> 8) & 255;
    let b1 = (rgb1) & 255;
    let da = (((rgb2 >> 24) & 255) - a1) | 0;
    let dr = (((rgb2 >> 16) & 255) - r1) | 0;
    let dg = (((rgb2 >> 8) & 255) - g1) | 0;
    let db = (((rgb2) & 255) - b1) | 0;
    if (a1 === 255 && da === 0) {
      this.model = GradientPaintContext.xrgbmodel;
      if (cm instanceof DirectColorModel) {
        let dcm = cm;
        let tmp = dcm.getAlphaMask();
        if ((tmp === 0 || tmp === 255) && dcm.getRedMask() === 255 && dcm.getGreenMask() === 65280 && dcm.getBlueMask() === 16711680) {
          this.model = GradientPaintContext.xbgrmodel;
          tmp = r1;
          r1 = b1;
          b1 = tmp;
          tmp = dr;
          dr = db;
          db = tmp;
        }
      }
    } else {
      this.model = ColorModel.getRGBdefault();
    }
    this.interp = $J.newArray(cyclic ? 513 : 257, 0);
    for (let i = 0; i <= 256; i++) {
      let rel = Math.fround(i / 256);
      let rgb = (($J.d2i((Math.fround(a1 + Math.fround(da * rel))))) << 24) | (($J.d2i((Math.fround(r1 + Math.fround(dr * rel))))) << 16) | (($J.d2i((Math.fround(g1 + Math.fround(dg * rel))))) << 8) | (($J.d2i((Math.fround(b1 + Math.fround(db * rel))))));
      this.interp[i] = rgb;
      if (cyclic) {
        (this.interp[(512 - i) | 0]) = rgb;
      }
    }
    return this;
  }
  static $clinit() {
    GradientPaintContext.xrgbmodel = new DirectColorModel()._DirectColorModel$int$int$int$int(24, 16711680, 65280, 255);
    GradientPaintContext.xbgrmodel = new DirectColorModel()._DirectColorModel$int$int$int$int(24, 255, 65280, 16711680);
  }
}

$J.define(GradientPaintContext, 'java.awt.GradientPaintContext', { kind: 'class', ifaces: ['java.awt.PaintContext'], sup: 'java.lang.Object', ctors: { 'java.awt.image.ColorModel,java.awt.geom.Point2D,java.awt.geom.Point2D,java.awt.geom.AffineTransform,java.awt.Color,java.awt.Color,boolean': '_GradientPaintContext' }, clinit: true, lazy: ['xrgbmodel', 'xbgrmodel', 'cachedModel', 'cached'] });
$J.module(() => {
  NoninvertibleTransformException = $J.load('java.awt.geom.NoninvertibleTransformException');
  Point2D$Double = $J.load('java.awt.geom.Point2D$Double');
  ColorModel = $J.load('java.awt.image.ColorModel');
  DirectColorModel = $J.load('java.awt.image.DirectColorModel');
});
