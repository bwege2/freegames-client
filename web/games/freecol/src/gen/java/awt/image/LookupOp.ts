// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/LookupOp.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, ImagingLib, JObject } from '../../../../jre/index.ts';

let ByteLookupTable, ShortLookupTable;

/**
 * This class implements a lookup operation from the source
 * to the destination.  The LookupTable object may contain a single array
 * or multiple arrays, subject to the restrictions below.
 * <p>
 * For Rasters, the lookup operates on bands.  The number of
 * lookup arrays may be one, in which case the same array is
 * applied to all bands, or it must equal the number of Source
 * Raster bands.
 * <p>
 * For BufferedImages, the lookup operates on color and alpha components.
 * The number of lookup arrays may be one, in which case the
 * same array is applied to all color (but not alpha) components.
 * Otherwise, the number of lookup arrays may
 * equal the number of Source color components, in which case no
 * lookup of the alpha component (if present) is performed.
 * If neither of these cases apply, the number of lookup arrays
 * must equal the number of Source color components plus alpha components,
 * in which case lookup is performed for all color and alpha components.
 * This allows non-uniform rescaling of multi-band BufferedImages.
 * <p>
 * BufferedImage sources with premultiplied alpha data are treated in the same
 * manner as non-premultiplied images for purposes of the lookup.  That is,
 * the lookup is done per band on the raw data of the BufferedImage source
 * without regard to whether the data is premultiplied.  If a color conversion
 * is required to the destination ColorModel, the premultiplied state of
 * both source and destination will be taken into account for this step.
 * <p>
 * Images with an IndexColorModel cannot be used.
 * <p>
 * If a RenderingHints object is specified in the constructor, the
 * color rendering hint and the dithering hint may be used when color
 * conversion is required.
 * <p>
 * This class allows the Source to be the same as the Destination.
 *
 * @see LookupTable
 * @see java.awt.RenderingHints#KEY_COLOR_RENDERING
 * @see java.awt.RenderingHints#KEY_DITHERING
 */
export class LookupOp extends JObject {
  ltable: LookupTable = null;
  numComponents: number = 0;
  hints: RenderingHints = null;
  /**
   * Constructs a {@code LookupOp} object given the lookup
   * table and a {@code RenderingHints} object, which might
   * be {@code null}.
   * @param lookup the specified {@code LookupTable}
   * @param hints the specified {@code RenderingHints},
   *        or {@code null}
   */
  _LookupOp(lookup: LookupTable, hints: RenderingHints): this {
    this.ltable = lookup;
    this.hints = hints;
    this.numComponents = this.ltable.getNumComponents();
    return this;
  }
  /**
   * Performs a lookup operation on a {@code Raster}.
   * If the destination {@code Raster} is {@code null},
   * a new {@code Raster} will be created.
   * The {@code IllegalArgumentException} might be thrown
   * if the source {@code Raster} and the destination
   * {@code Raster} do not have the same
   * number of bands or if the number of arrays in the
   * {@code LookupTable} does not meet the
   * restrictions stated in the class comment above.
   * @param src the source {@code Raster} to filter
   * @param dst the destination {@code WritableRaster} for the
   *            filtered {@code src}
   * @return the filtered {@code WritableRaster}.
   * @throws IllegalArgumentException if the source and destinations
   *         rasters do not have the same number of bands, or the
   *         number of arrays in the {@code LookupTable} does
   *         not meet the restrictions described in the class comments.
   */
  filter$Raster$WritableRaster(src: Raster, dst: WritableRaster): WritableRaster {
    let numBands = src.getNumBands();
    let height = src.getHeight();
    let width = src.getWidth();
    let srcPix = $J.newArray(numBands, 0);
    if (dst == null) {
      dst = this.createCompatibleDestRaster(src);
    } else if (height !== dst.getHeight() || width !== dst.getWidth()) {
      throw new IllegalArgumentException('Width or height of Rasters do not match');
    }
    let dstLength = dst.getNumBands();
    if (numBands !== dstLength) {
      throw new IllegalArgumentException('Number of channels in the src (' + numBands + ') does not match number of channels in the destination (' + dstLength + ')');
    }
    let numComponents = this.ltable.getNumComponents();
    if (numComponents !== 1 && numComponents !== src.getNumBands()) {
      throw new IllegalArgumentException('Number of arrays in the  lookup table (' + numComponents + ' is not compatible with the  src Raster: ' + $J.str(src));
    }
    if (ImagingLib.filter(this, src, dst) != null) {
      return dst;
    }
    if (this.ltable instanceof ByteLookupTable) {
      this.byteFilter(this.ltable, src, dst, width, height, numBands);
    } else if (this.ltable instanceof ShortLookupTable) {
      this.shortFilter(this.ltable, src, dst, width, height, numBands);
    } else {
      let sminX = src.getMinX();
      let sY = src.getMinY();
      let dminX = dst.getMinX();
      let dY = dst.getMinY();
      for (let y = 0; y < height; y++, sY++, dY++) {
        let sX = sminX;
        let dX = dminX;
        for (let x = 0; x < width; x++, sX++, dX++) {
          src.getPixel$int$int$intArr(sX, sY, srcPix);
          this.ltable.lookupPixel$intArr$intArr(srcPix, srcPix);
          dst.setPixel$int$int$intArr(dX, dY, srcPix);
        }
      }
    }
    return dst;
  }
  /**
   * Creates a zeroed-destination {@code Raster} with the
   * correct size and number of bands, given this source.
   * @param src the {@code Raster} to be transformed
   * @return the zeroed-destination {@code Raster}.
   */
  createCompatibleDestRaster(src: Raster): WritableRaster {
    return src.createCompatibleWritableRaster$();
  }
  byteFilter(lookup: ByteLookupTable, src: Raster, dst: WritableRaster, width: number, height: number, numBands: number): void {
    let srcPix = null;
    let table = lookup.getTable();
    let offset = lookup.getOffset();
    let tidx: number;
    let step = 1;
    if (table.length === 1) {
      step = 0;
    }
    let x: number;
    let y: number;
    let band: number;
    let len = table[0].length;
    for (y = 0; y < height; y++) {
      tidx = 0;
      for (band = 0; band < numBands; band++, tidx = (tidx + step) | 0) {
        srcPix = src.getSamples$int$int$int$int$int$intArr(0, y, width, 1, band, srcPix);
        for (x = 0; x < width; x++) {
          let index = (srcPix[x] - offset) | 0;
          if (index < 0 || index > len) {
            throw new IllegalArgumentException('index (' + index + '(out of range:  srcPix[' + x + ']=' + srcPix[x] + ' offset=' + offset);
          }
          srcPix[x] = table[tidx][index];
        }
        dst.setSamples$int$int$int$int$int$intArr(0, y, width, 1, band, srcPix);
      }
    }
  }
  shortFilter(lookup: ShortLookupTable, src: Raster, dst: WritableRaster, width: number, height: number, numBands: number): void {
    let band: number;
    let srcPix = null;
    let table = lookup.getTable();
    let offset = lookup.getOffset();
    let tidx: number;
    let step = 1;
    if (table.length === 1) {
      step = 0;
    }
    let x = 0;
    let y = 0;
    let index: number;
    let maxShort = ((1 << 16) - 1) | 0;
    for (y = 0; y < height; y++) {
      tidx = 0;
      for (band = 0; band < numBands; band++, tidx = (tidx + step) | 0) {
        srcPix = src.getSamples$int$int$int$int$int$intArr(0, y, width, 1, band, srcPix);
        for (x = 0; x < width; x++) {
          index = (srcPix[x] - offset) | 0;
          if (index < 0 || index > maxShort) {
            throw new IllegalArgumentException('index out of range ' + index + ' x is ' + x + 'srcPix[x]=' + srcPix[x] + ' offset=' + offset);
          }
          srcPix[x] = table[tidx][index];
        }
        dst.setSamples$int$int$int$int$int$intArr(0, y, width, 1, band, srcPix);
      }
    }
  }
}

$J.define(LookupOp, 'java.awt.image.LookupOp', { kind: 'class', ifaces: ['java.awt.image.BufferedImageOp', 'java.awt.image.RasterOp'], sup: 'java.lang.Object', ctors: { 'java.awt.image.LookupTable,java.awt.RenderingHints': '_LookupOp' }, meths: { 'createCompatibleDestImage(java.awt.image.BufferedImage,java.awt.image.ColorModel)': 'createCompatibleDestImage$BufferedImage$ColorModel', 'getBounds2D(java.awt.image.Raster)': 'getBounds2D$Raster', 'getBounds2D(java.awt.image.BufferedImage)': 'getBounds2D$BufferedImage', 'filter(java.awt.image.Raster,java.awt.image.WritableRaster)': 'filter$Raster$WritableRaster', 'filter(java.awt.image.BufferedImage,java.awt.image.BufferedImage)': 'filter$BufferedImage$BufferedImage' } });
$J.module(() => {
  ByteLookupTable = $J.load('java.awt.image.ByteLookupTable');
  ShortLookupTable = $J.load('java.awt.image.ShortLookupTable');
});
