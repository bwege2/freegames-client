// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/TexturePaintContext.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let RenderingHints, Transparency, NoninvertibleTransformException, ColorModel, DirectColorModel, IndexColorModel, ByteInterleavedRaster, IntegerInterleavedRaster;

export class TexturePaintContext extends JObject {
  static xrgbmodel: ColorModel = null;
  static argbmodel: ColorModel = null;
  colorModel: ColorModel = null;
  bWidth: number = 0;
  bHeight: number = 0;
  maxWidth_: number = 0;
  outRas: WritableRaster = null;
  xOrg: number = 0;
  yOrg: number = 0;
  incXAcross: number = 0;
  incYAcross: number = 0;
  incXDown: number = 0;
  incYDown: number = 0;
  colincx: number = 0;
  colincy: number = 0;
  colincxerr: number = 0;
  colincyerr: number = 0;
  rowincx: number = 0;
  rowincy: number = 0;
  rowincxerr: number = 0;
  rowincyerr: number = 0;
  static xrgbRasRef: WeakReference<Raster> = null;
  static argbRasRef: WeakReference<Raster> = null;
  static byteRasRef: WeakReference<Raster> = null;
  _TexturePaintContext(cm: ColorModel, xform: AffineTransform, bWidth: number, bHeight: number, maxw: number): this {
    this.colorModel = TexturePaintContext.getInternedColorModel(cm);
    this.bWidth = bWidth;
    this.bHeight = bHeight;
    this.maxWidth_ = maxw;
    try {
      xform = xform.createInverse();
    } catch ($e0) {
      if ($J.isa($e0, NoninvertibleTransformException)) {
        let e = $J.exc($e0);
        xform.setToScale(0, 0);
      } else {
        throw $e0;
      }
    }
    this.incXAcross = TexturePaintContext.mod(xform.getScaleX(), bWidth);
    this.incYAcross = TexturePaintContext.mod(xform.getShearY(), bHeight);
    this.incXDown = TexturePaintContext.mod(xform.getShearX(), bWidth);
    this.incYDown = TexturePaintContext.mod(xform.getScaleY(), bHeight);
    this.xOrg = xform.getTranslateX();
    this.yOrg = xform.getTranslateY();
    this.colincx = $J.d2i(this.incXAcross);
    this.colincy = $J.d2i(this.incYAcross);
    this.colincxerr = TexturePaintContext.fractAsInt(this.incXAcross);
    this.colincyerr = TexturePaintContext.fractAsInt(this.incYAcross);
    this.rowincx = $J.d2i(this.incXDown);
    this.rowincy = $J.d2i(this.incYDown);
    this.rowincxerr = TexturePaintContext.fractAsInt(this.incXDown);
    this.rowincyerr = TexturePaintContext.fractAsInt(this.incYDown);
    return this;
  }
  static getContext(bufImg: BufferedImage, xform: AffineTransform, hints: RenderingHints, devBounds: Rectangle): PaintContext {
    let raster = bufImg.getRaster();
    let cm = bufImg.getColorModel();
    let maxw = devBounds.width_;
    let val = hints.get(RenderingHints.KEY_INTERPOLATION);
    let filter = (val == null ? (hints.get(RenderingHints.KEY_RENDERING) === RenderingHints.VALUE_RENDER_QUALITY) : (val !== RenderingHints.VALUE_INTERPOLATION_NEAREST_NEIGHBOR));
    if (raster instanceof IntegerInterleavedRaster && (!filter || TexturePaintContext.isFilterableDCM(cm))) {
      let iir = raster;
      if (iir.getNumDataElements() === 1 && iir.getPixelStride() === 1) {
        return new TexturePaintContext$Int()._TexturePaintContext$Int(iir, cm, xform, maxw, filter);
      }
    } else if (raster instanceof ByteInterleavedRaster) {
      let bir = raster;
      if (bir.getNumDataElements() === 1 && bir.getPixelStride() === 1) {
        if (filter) {
          if (TexturePaintContext.isFilterableICM(cm)) {
            return new TexturePaintContext$ByteFilter()._TexturePaintContext$ByteFilter(bir, cm, xform, maxw);
          }
        } else {
          return new TexturePaintContext$Byte()._TexturePaintContext$Byte(bir, cm, xform, maxw);
        }
      }
    }
    return new TexturePaintContext$Any()._TexturePaintContext$Any(raster, cm, xform, maxw, filter);
  }
  static isFilterableICM(cm: ColorModel): boolean {
    if (cm instanceof IndexColorModel) {
      let icm = cm;
      if (icm.getMapSize() <= 256) {
        return true;
      }
    }
    return false;
  }
  static isFilterableDCM(cm: ColorModel): boolean {
    if (cm instanceof DirectColorModel) {
      let dcm = cm;
      return (TexturePaintContext.isMaskOK(dcm.getAlphaMask(), true) && TexturePaintContext.isMaskOK(dcm.getRedMask(), false) && TexturePaintContext.isMaskOK(dcm.getGreenMask(), false) && TexturePaintContext.isMaskOK(dcm.getBlueMask(), false));
    }
    return false;
  }
  static isMaskOK(mask: number, canbezero: boolean): boolean {
    if (canbezero && mask === 0) {
      return true;
    }
    return (mask === 255 || mask === 65280 || mask === 16711680 || mask === -16777216);
  }
  static getInternedColorModel(cm: ColorModel): ColorModel {
    if (TexturePaintContext.xrgbmodel === cm || TexturePaintContext.xrgbmodel.equals(cm)) {
      return TexturePaintContext.xrgbmodel;
    }
    if (TexturePaintContext.argbmodel === cm || TexturePaintContext.argbmodel.equals(cm)) {
      return TexturePaintContext.argbmodel;
    }
    return cm;
  }
  static fractAsInt(d: number): number {
    return $J.d2i(((d % 1) * 2147483647));
  }
  static mod(num: number, den: number): number {
    num = num % den;
    if (num < 0) {
      num += den;
      if (num >= den) {
        num = 0;
      }
    }
    return num;
  }
  static $clinit() {
    TexturePaintContext.xrgbmodel = new DirectColorModel()._DirectColorModel$int$int$int$int(24, 16711680, 65280, 255);
    TexturePaintContext.argbmodel = ColorModel.getRGBdefault();
  }
}

export class TexturePaintContext$Int extends TexturePaintContext {
  srcRas: IntegerInterleavedRaster = null;
  inData: number[] = null;
  inOff: number = 0;
  inSpan: number = 0;
  outData: number[] = null;
  outOff: number = 0;
  outSpan: number = 0;
  filter_: boolean = false;
  _TexturePaintContext$Int(srcRas: IntegerInterleavedRaster, cm: ColorModel, xform: AffineTransform, maxw: number, filter: boolean): this {
    this._TexturePaintContext(cm, xform, srcRas.getWidth(), srcRas.getHeight(), maxw);
    this.srcRas = srcRas;
    this.inData = srcRas.getDataStorage();
    this.inSpan = srcRas.getScanlineStride();
    this.inOff = srcRas.getDataOffset(0);
    this.filter_ = filter;
    return this;
  }
}

export class TexturePaintContext$Byte extends TexturePaintContext {
  srcRas: ByteInterleavedRaster = null;
  inData: number[] = null;
  inOff: number = 0;
  inSpan: number = 0;
  outData: number[] = null;
  outOff: number = 0;
  outSpan: number = 0;
  _TexturePaintContext$Byte(srcRas: ByteInterleavedRaster, cm: ColorModel, xform: AffineTransform, maxw: number): this {
    this._TexturePaintContext(cm, xform, srcRas.getWidth(), srcRas.getHeight(), maxw);
    this.srcRas = srcRas;
    this.inData = srcRas.getDataStorage();
    this.inSpan = srcRas.getScanlineStride();
    this.inOff = srcRas.getDataOffset(0);
    return this;
  }
}

export class TexturePaintContext$ByteFilter extends TexturePaintContext {
  srcRas: ByteInterleavedRaster = null;
  inPalette: number[] = null;
  inData: number[] = null;
  inOff: number = 0;
  inSpan: number = 0;
  outData: number[] = null;
  outOff: number = 0;
  outSpan: number = 0;
  _TexturePaintContext$ByteFilter(srcRas: ByteInterleavedRaster, cm: ColorModel, xform: AffineTransform, maxw: number): this {
    this._TexturePaintContext((cm.getTransparency() === Transparency.OPAQUE ? TexturePaintContext.xrgbmodel : TexturePaintContext.argbmodel), xform, srcRas.getWidth(), srcRas.getHeight(), maxw);
    this.inPalette = $J.newArray(256, 0);
    (cm).getRGBs(this.inPalette);
    this.srcRas = srcRas;
    this.inData = srcRas.getDataStorage();
    this.inSpan = srcRas.getScanlineStride();
    this.inOff = srcRas.getDataOffset(0);
    return this;
  }
}

export class TexturePaintContext$Any extends TexturePaintContext {
  srcRas: WritableRaster = null;
  filter_: boolean = false;
  _TexturePaintContext$Any(srcRas: WritableRaster, cm: ColorModel, xform: AffineTransform, maxw: number, filter: boolean): this {
    this._TexturePaintContext(cm, xform, srcRas.getWidth(), srcRas.getHeight(), maxw);
    this.srcRas = srcRas;
    this.filter_ = filter;
    return this;
  }
}

$J.define(TexturePaintContext, 'java.awt.TexturePaintContext', { kind: 'class', ifaces: ['java.awt.PaintContext'], sup: 'java.lang.Object', ctors: { 'java.awt.image.ColorModel,java.awt.geom.AffineTransform,int,int,int': '_TexturePaintContext' }, clinit: true, lazy: ['xrgbmodel', 'argbmodel', 'xrgbRasRef', 'argbRasRef', 'byteRasRef'] });
$J.define(TexturePaintContext$Int, 'java.awt.TexturePaintContext$Int', { kind: 'class', sup: 'java.awt.TexturePaintContext', ctors: { 'sun.awt.image.IntegerInterleavedRaster,java.awt.image.ColorModel,java.awt.geom.AffineTransform,int,boolean': '_TexturePaintContext$Int' } });
$J.define(TexturePaintContext$Byte, 'java.awt.TexturePaintContext$Byte', { kind: 'class', sup: 'java.awt.TexturePaintContext', ctors: { 'sun.awt.image.ByteInterleavedRaster,java.awt.image.ColorModel,java.awt.geom.AffineTransform,int': '_TexturePaintContext$Byte' } });
$J.define(TexturePaintContext$ByteFilter, 'java.awt.TexturePaintContext$ByteFilter', { kind: 'class', sup: 'java.awt.TexturePaintContext', ctors: { 'sun.awt.image.ByteInterleavedRaster,java.awt.image.ColorModel,java.awt.geom.AffineTransform,int': '_TexturePaintContext$ByteFilter' } });
$J.define(TexturePaintContext$Any, 'java.awt.TexturePaintContext$Any', { kind: 'class', sup: 'java.awt.TexturePaintContext', ctors: { 'java.awt.image.WritableRaster,java.awt.image.ColorModel,java.awt.geom.AffineTransform,int,boolean': '_TexturePaintContext$Any' } });
$J.module(() => {
  RenderingHints = $J.load('java.awt.RenderingHints');
  Transparency = $J.load('java.awt.Transparency');
  NoninvertibleTransformException = $J.load('java.awt.geom.NoninvertibleTransformException');
  ColorModel = $J.load('java.awt.image.ColorModel');
  DirectColorModel = $J.load('java.awt.image.DirectColorModel');
  IndexColorModel = $J.load('java.awt.image.IndexColorModel');
  ByteInterleavedRaster = $J.load('sun.awt.image.ByteInterleavedRaster');
  IntegerInterleavedRaster = $J.load('sun.awt.image.IntegerInterleavedRaster');
});
