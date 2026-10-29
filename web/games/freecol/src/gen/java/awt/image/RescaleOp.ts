// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/RescaleOp.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { $J, BufferedImage, IllegalArgumentException, ImagingLib, JObject } from '../../../../jre/index.ts';

let AlphaComposite, Point2D$Float, ByteLookupTable, ColorConvertOp, ComponentSampleModel, DataBuffer, IndexColorModel, LookupOp, ShortLookupTable;

/**
 * This class performs a pixel-by-pixel rescaling of the data in the
 * source image by multiplying the sample values for each pixel by a scale
 * factor and then adding an offset. The scaled sample values are clipped
 * to the minimum/maximum representable in the destination image.
 * <p>
 * The pseudo code for the rescaling operation is as follows:
 * <pre>
 * for each pixel from Source object {
 *    for each band/component of the pixel {
 *        dstElement = (srcElement*scaleFactor) + offset
 *    }
 * }
 * </pre>
 * <p>
 * For Rasters, rescaling operates on bands.  The number of
 * sets of scaling constants may be one, in which case the same constants
 * are applied to all bands, or it must equal the number of Source
 * Raster bands.
 * <p>
 * For BufferedImages, rescaling operates on color and alpha components.
 * The number of sets of scaling constants may be one, in which case the
 * same constants are applied to all color (but not alpha) components.
 * Otherwise, the  number of sets of scaling constants may
 * equal the number of Source color components, in which case no
 * rescaling of the alpha component (if present) is performed.
 * If neither of these cases apply, the number of sets of scaling constants
 * must equal the number of Source color components plus alpha components,
 * in which case all color and alpha components are rescaled.
 * <p>
 * BufferedImage sources with premultiplied alpha data are treated in the same
 * manner as non-premultiplied images for purposes of rescaling.  That is,
 * the rescaling is done per band on the raw data of the BufferedImage source
 * without regard to whether the data is premultiplied.  If a color conversion
 * is required to the destination ColorModel, the premultiplied state of
 * both source and destination will be taken into account for this step.
 * <p>
 * Images with an IndexColorModel cannot be rescaled.
 * <p>
 * If a RenderingHints object is specified in the constructor, the
 * color rendering hint and the dithering hint may be used when color
 * conversion is required.
 * <p>
 * Note that in-place operation is allowed (i.e. the source and destination can
 * be the same object).
 * @see java.awt.RenderingHints#KEY_COLOR_RENDERING
 * @see java.awt.RenderingHints#KEY_DITHERING
 */
export class RescaleOp extends JObject {
  scaleFactors: number[] = null;
  offsets: number[] = null;
  length_: number = 0;
  hints: RenderingHints = null;
  srcNbits: number = 0;
  dstNbits: number = 0;
  $init_RescaleOp() {
    this.length_ = 0;
  }
  /**
   * Constructs a new RescaleOp with the desired scale factors
   * and offsets.  The length of the scaleFactor and offset arrays
   * must meet the restrictions stated in the class comments above.
   * The RenderingHints argument may be null.
   * @param scaleFactors the specified scale factors
   * @param offsets the specified offsets
   * @param hints the specified {@code RenderingHints}, or
   *        {@code null}
   */
  _RescaleOp$floatArr$floatArr$RenderingHints(scaleFactors: number[], offsets: number[], hints: RenderingHints): this {
    this.$init_RescaleOp();
    this.length_ = scaleFactors.length;
    if (this.length_ > offsets.length) {
      this.length_ = offsets.length;
    }
    this.scaleFactors = $J.newArray(this.length_, 0);
    this.offsets = $J.newArray(this.length_, 0);
    for (let i = 0; i < this.length_; i++) {
      this.scaleFactors[i] = scaleFactors[i];
      this.offsets[i] = offsets[i];
    }
    this.hints = hints;
    return this;
  }
  /**
   * Constructs a new RescaleOp with the desired scale factor
   * and offset.  The scaleFactor and offset will be applied to
   * all bands in a source Raster and to all color (but not alpha)
   * components in a BufferedImage.
   * The RenderingHints argument may be null.
   * @param scaleFactor the specified scale factor
   * @param offset the specified offset
   * @param hints the specified {@code RenderingHints}, or
   *        {@code null}
   */
  _RescaleOp$float$float$RenderingHints(scaleFactor: number, offset: number, hints: RenderingHints): this {
    this.$init_RescaleOp();
    this.length_ = 1;
    this.scaleFactors = $J.newArray(1, 0);
    this.offsets = $J.newArray(1, 0);
    this.scaleFactors[0] = scaleFactor;
    this.offsets[0] = offset;
    this.hints = hints;
    return this;
  }
  /**
   * Returns the scale factors in the given array. The array is also
   * returned for convenience.  If scaleFactors is null, a new array
   * will be allocated.
   * @param scaleFactors the array to contain the scale factors of
   *        this {@code RescaleOp}
   * @return the scale factors of this {@code RescaleOp}.
   */
  getScaleFactors(scaleFactors: number[]): number[] {
    if (scaleFactors == null) {
      return this.scaleFactors.slice();
    }
    $J.system_arraycopy(this.scaleFactors, 0, scaleFactors, 0, Math.min(this.scaleFactors.length, scaleFactors.length));
    return scaleFactors;
  }
  /**
   * Returns the offsets in the given array. The array is also returned
   * for convenience.  If offsets is null, a new array
   * will be allocated.
   * @param offsets the array to contain the offsets of
   *        this {@code RescaleOp}
   * @return the offsets of this {@code RescaleOp}.
   */
  getOffsets(offsets: number[]): number[] {
    if (offsets == null) {
      return this.offsets.slice();
    }
    $J.system_arraycopy(this.offsets, 0, offsets, 0, Math.min(this.offsets.length, offsets.length));
    return offsets;
  }
  /**
   * Returns the number of scaling factors and offsets used in this
   * RescaleOp.
   * @return the number of scaling factors and offsets of this
   *         {@code RescaleOp}.
   */
  getNumFactors(): number {
    return this.length_;
  }
  /**
   * Creates a ByteLookupTable to implement the rescale.
   * The table may have either a SHORT or BYTE input.
   * @param nElems    Number of elements the table is to have.
   *                  This will generally be 256 for byte and
   *                  65536 for short.
   */
  createByteLut(scale: number[], off: number[], nBands: number, nElems: number): ByteLookupTable {
    let lutData = $J.newArrayN([nBands, nElems], 0);
    let band: number;
    for (band = 0; band < scale.length; band++) {
      let bandScale = scale[band];
      let bandOff = off[band];
      let bandLutData = lutData[band];
      for (let i = 0; i < nElems; i++) {
        let val = $J.d2i((Math.fround(Math.fround(i * bandScale) + bandOff)));
        if ((val & -256) !== 0) {
          if (val < 0) {
            val = 0;
          } else {
            val = 255;
          }
        }
        bandLutData[i] = ((val) << 24) >> 24;
      }
    }
    let maxToCopy = (nBands === 4 && scale.length === 4) ? 4 : 3;
    while (band < lutData.length && band < maxToCopy) {
      $J.system_arraycopy(lutData[(band - 1) | 0], 0, lutData[band], 0, nElems);
      band++;
    }
    if (nBands === 4 && band < nBands) {
      let bandLutData = lutData[band];
      for (let i = 0; i < nElems; i++) {
        bandLutData[i] = ((i) << 24) >> 24;
      }
    }
    return new ByteLookupTable()._ByteLookupTable$int$byteArrArr(0, lutData);
  }
  /**
   * Creates a ShortLookupTable to implement the rescale.
   * The table may have either a SHORT or BYTE input.
   * @param nElems    Number of elements the table is to have.
   *                  This will generally be 256 for byte and
   *                  65536 for short.
   */
  createShortLut(scale: number[], off: number[], nBands: number, nElems: number): ShortLookupTable {
    let lutData = $J.newArrayN([nBands, nElems], 0);
    let band = 0;
    for (band = 0; band < scale.length; band++) {
      let bandScale = scale[band];
      let bandOff = off[band];
      let bandLutData = lutData[band];
      for (let i = 0; i < nElems; i++) {
        let val = $J.d2i((Math.fround(Math.fround(i * bandScale) + bandOff)));
        if ((val & -65536) !== 0) {
          if (val < 0) {
            val = 0;
          } else {
            val = 65535;
          }
        }
        bandLutData[i] = ((val) << 16) >> 16;
      }
    }
    let maxToCopy = (nBands === 4 && scale.length === 4) ? 4 : 3;
    while (band < lutData.length && band < maxToCopy) {
      $J.system_arraycopy(lutData[(band - 1) | 0], 0, lutData[band], 0, nElems);
      band++;
    }
    if (nBands === 4 && band < nBands) {
      let bandLutData = lutData[band];
      for (let i = 0; i < nElems; i++) {
        bandLutData[i] = ((i) << 16) >> 16;
      }
    }
    return new ShortLookupTable()._ShortLookupTable$int$shortArrArr(0, lutData);
  }
  /**
   * Determines if the rescale can be performed as a lookup.
   * The dst must be a byte or short type.
   * The src must be less than 16 bits.
   * All source band sizes must be the same and all dst band sizes
   * must be the same.
   */
  canUseLookup(src: Raster, dst: Raster): boolean {
    let datatype = src.getDataBuffer().getDataType();
    if (datatype !== DataBuffer.TYPE_BYTE && datatype !== DataBuffer.TYPE_USHORT) {
      return false;
    }
    let dstSM = dst.getSampleModel();
    this.dstNbits = dstSM.getSampleSize$int(0);
    if (!(this.dstNbits === 8 || this.dstNbits === 16)) {
      return false;
    }
    for (let i = 1; i < src.getNumBands(); i++) {
      let bandSize = dstSM.getSampleSize$int(i);
      if (bandSize !== this.dstNbits) {
        return false;
      }
    }
    let srcSM = src.getSampleModel();
    this.srcNbits = srcSM.getSampleSize$int(0);
    if (this.srcNbits > 16) {
      return false;
    }
    for (let i = 1; i < src.getNumBands(); i++) {
      let bandSize = srcSM.getSampleSize$int(i);
      if (bandSize !== this.srcNbits) {
        return false;
      }
    }
    if (dstSM instanceof ComponentSampleModel) {
      let dsm = dstSM;
      if (dsm.getPixelStride() !== dst.getNumBands()) {
        return false;
      }
    }
    if (srcSM instanceof ComponentSampleModel) {
      let csm = srcSM;
      if (csm.getPixelStride() !== src.getNumBands()) {
        return false;
      }
    }
    return true;
  }
  /**
   * Rescales the source BufferedImage.
   * If the color model in the source image is not the same as that
   * in the destination image, the pixels will be converted
   * in the destination.  If the destination image is null,
   * a BufferedImage will be created with the source ColorModel.
   * An IllegalArgumentException may be thrown if the number of
   * scaling factors/offsets in this object does not meet the
   * restrictions stated in the class comments above, or if the
   * source image has an IndexColorModel.
   * @param src the {@code BufferedImage} to be filtered
   * @param dst the destination for the filtering operation
   *            or {@code null}
   * @return the filtered {@code BufferedImage}.
   * @throws IllegalArgumentException if the {@code ColorModel}
   *         of {@code src} is an {@code IndexColorModel},
   *         or if the number of scaling factors and offsets in this
   *         {@code RescaleOp} do not meet the requirements
   *         stated in the class comments, or if the source and
   *         destination images differ in size.
   */
  filter$BufferedImage$BufferedImage(src: BufferedImage, dst: BufferedImage): BufferedImage {
    let srcCM = src.getColorModel();
    let dstCM: ColorModel;
    let numSrcColorComp = srcCM.getNumColorComponents();
    let scaleConst = this.length_;
    if (srcCM instanceof IndexColorModel) {
      throw new IllegalArgumentException('Rescaling cannot be performed on an indexed image');
    }
    if (scaleConst !== 1 && scaleConst !== numSrcColorComp && scaleConst !== srcCM.getNumComponents()) {
      throw new IllegalArgumentException('Number of scaling constants does not equal the number of color or color/alpha components');
    }
    let needToConvert = false;
    let needToDraw = false;
    if (scaleConst > numSrcColorComp && srcCM.hasAlpha()) {
      scaleConst = (numSrcColorComp + 1) | 0;
    }
    let width = src.getWidth();
    let height = src.getHeight();
    let origDst = dst;
    if (dst == null) {
      dst = this.createCompatibleDestImage$BufferedImage$ColorModel(src, null);
      dstCM = srcCM;
    } else {
      if (width !== dst.getWidth()) {
        throw new IllegalArgumentException('Src width (' + width + ') not equal to dst width (' + dst.getWidth() + ')');
      }
      if (height !== dst.getHeight()) {
        throw new IllegalArgumentException('Src height (' + height + ') not equal to dst height (' + dst.getHeight() + ')');
      }
      dstCM = dst.getColorModel();
      if (srcCM.getColorSpace().getType() !== dstCM.getColorSpace().getType()) {
        needToConvert = true;
        dst = this.createCompatibleDestImage$BufferedImage$ColorModel(src, null);
      }
    }
    if (ImagingLib.filter(this, src, dst) == null) {
      if (src.getRaster().getNumBands() !== dst.getRaster().getNumBands()) {
        needToDraw = true;
        dst = this.createCompatibleDestImage$BufferedImage$ColorModel(src, null);
      }
      let srcRaster = src.getRaster();
      let dstRaster = dst.getRaster();
      this.filterRasterImpl(srcRaster, dstRaster, scaleConst, false);
    }
    if (needToDraw) {
      let g = origDst.createGraphics();
      g.setComposite(AlphaComposite.Src);
      g.drawImage$Image$int$int$int$int$ImageObserver(dst, 0, 0, width, height, null);
      g.dispose();
    }
    if (needToConvert) {
      let ccop = new ColorConvertOp()._ColorConvertOp$RenderingHints(this.hints);
      dst = ccop.filter$BufferedImage$BufferedImage(dst, origDst);
    }
    return dst;
  }
  /**
   * Rescales the pixel data in the source Raster.
   * If the destination Raster is null, a new Raster will be created.
   * The source and destination must have the same number of bands.
   * Otherwise, an IllegalArgumentException is thrown.
   * Note that the number of scaling factors/offsets in this object must
   * meet the restrictions stated in the class comments above.
   * Otherwise, an IllegalArgumentException is thrown.
   * @param src the {@code Raster} to be filtered
   * @param dst the destination for the filtering operation
   *            or {@code null}
   * @return the filtered {@code WritableRaster}.
   * @throws IllegalArgumentException if {@code src} and
   *         {@code dst} do not have the same number of bands,
   *         or if the number of scaling factors and offsets in this
   *         {@code RescaleOp} do not meet the requirements
   *         stated in the class comments, or if the source and
   *         destination rasters differ in size.
   */
  filter$Raster$WritableRaster(src: Raster, dst: WritableRaster): WritableRaster {
    return this.filterRasterImpl(src, dst, this.length_, true);
  }
  filterRasterImpl(src: Raster, dst: WritableRaster, scaleConst: number, sCheck: boolean): WritableRaster {
    let numBands = src.getNumBands();
    let width = src.getWidth();
    let height = src.getHeight();
    let srcPix = null;
    let step = 0;
    let tidx = 0;
    if (dst == null) {
      dst = this.createCompatibleDestRaster(src);
    } else if (height !== dst.getHeight() || width !== dst.getWidth()) {
      throw new IllegalArgumentException('Width or height of Rasters do not match');
    } else if (numBands !== dst.getNumBands()) {
      throw new IllegalArgumentException('Number of bands in src ' + numBands + ' does not equal number of bands in dest ' + dst.getNumBands());
    }
    if (sCheck && scaleConst !== 1 && scaleConst !== src.getNumBands()) {
      throw new IllegalArgumentException('Number of scaling constants does not equal the number of bands in the src raster');
    }
    if (ImagingLib.filter(this, src, dst) != null) {
      return dst;
    }
    if (this.canUseLookup(src, dst)) {
      let srcNgray = (1 << this.srcNbits);
      let dstNgray = (1 << this.dstNbits);
      if (dstNgray === 256) {
        let lut = this.createByteLut(this.scaleFactors, this.offsets, numBands, srcNgray);
        let op = new LookupOp()._LookupOp(lut, this.hints);
        op.filter$Raster$WritableRaster(src, dst);
      } else {
        let lut = this.createShortLut(this.scaleFactors, this.offsets, numBands, srcNgray);
        let op = new LookupOp()._LookupOp(lut, this.hints);
        op.filter$Raster$WritableRaster(src, dst);
      }
    } else {
      if (scaleConst > 1) {
        step = 1;
      }
      let sminX = src.getMinX();
      let sY = src.getMinY();
      let dminX = dst.getMinX();
      let dY = dst.getMinY();
      let sX: number;
      let dX: number;
      let nbits: number;
      let dstMax = $J.newArray(numBands, 0);
      let dstMask = $J.newArray(numBands, 0);
      let dstSM = dst.getSampleModel();
      for (let z = 0; z < numBands; z++) {
        nbits = dstSM.getSampleSize$int(z);
        dstMax[z] = ((1 << nbits) - 1) | 0;
        dstMask[z] = ~(dstMax[z]);
      }
      let val: number;
      for (let y = 0; y < height; y++, sY++, dY++) {
        dX = dminX;
        sX = sminX;
        for (let x = 0; x < width; x++, sX++, dX++) {
          srcPix = src.getPixel$int$int$intArr(sX, sY, srcPix);
          tidx = 0;
          for (let z = 0; z < numBands; z++, tidx = (tidx + step) | 0) {
            if ((scaleConst === 1 || scaleConst === 3) && (z === 3) && (numBands === 4)) {
              val = srcPix[z];
            } else {
              val = $J.d2i((Math.fround(Math.fround(srcPix[z] * this.scaleFactors[tidx]) + this.offsets[tidx])));
            }
            if ((val & dstMask[z]) !== 0) {
              if (val < 0) {
                val = 0;
              } else {
                val = dstMax[z];
              }
            }
            srcPix[z] = val;
          }
          dst.setPixel$int$int$intArr(dX, dY, srcPix);
        }
      }
    }
    return dst;
  }
  /**
   * Returns the bounding box of the rescaled destination image.  Since
   * this is not a geometric operation, the bounding box does not
   * change.
   */
  getBounds2D$BufferedImage(src: BufferedImage): Rectangle2D {
    return this.getBounds2D$Raster(src.getRaster());
  }
  /**
   * Returns the bounding box of the rescaled destination Raster.  Since
   * this is not a geometric operation, the bounding box does not
   * change.
   * @param src the rescaled destination {@code Raster}
   * @return the bounds of the specified {@code Raster}.
   */
  getBounds2D$Raster(src: Raster): Rectangle2D {
    return src.getBounds();
  }
  /**
   * Creates a zeroed destination image with the correct size and number of
   * bands.
   * @param src       Source image for the filter operation.
   * @param destCM    ColorModel of the destination.  If null, the
   *                  ColorModel of the source will be used.
   * @return the zeroed-destination image.
   */
  createCompatibleDestImage$BufferedImage$ColorModel(src: BufferedImage, destCM: ColorModel): BufferedImage {
    let image: BufferedImage;
    if (destCM == null) {
      let cm = src.getColorModel();
      image = new BufferedImage(cm, src.getRaster().createCompatibleWritableRaster$(), cm.isAlphaPremultiplied(), null);
    } else {
      let w = src.getWidth();
      let h = src.getHeight();
      image = new BufferedImage(destCM, destCM.createCompatibleWritableRaster(w, h), destCM.isAlphaPremultiplied(), null);
    }
    return image;
  }
  /**
   * Creates a zeroed-destination {@code Raster} with the correct
   * size and number of bands, given this source.
   * @param src       the source {@code Raster}
   * @return the zeroed-destination {@code Raster}.
   */
  createCompatibleDestRaster(src: Raster): WritableRaster {
    return src.createCompatibleWritableRaster$int$int(src.getWidth(), src.getHeight());
  }
  /**
   * Returns the location of the destination point given a
   * point in the source.  If dstPt is non-null, it will
   * be used to hold the return value.  Since this is not a geometric
   * operation, the srcPt will equal the dstPt.
   * @param srcPt a point in the source image
   * @param dstPt the destination point or {@code null}
   * @return the location of the destination point.
   */
  getPoint2D(srcPt: Point2D, dstPt: Point2D): Point2D {
    if (dstPt == null) {
      dstPt = new Point2D$Float()._Point2D$Float$();
    }
    dstPt.setLocation$double$double(srcPt.getX(), srcPt.getY());
    return dstPt;
  }
  /**
   * Returns the rendering hints for this op.
   * @return the rendering hints of this {@code RescaleOp}.
   */
  getRenderingHints(): RenderingHints {
    return this.hints;
  }
}

$J.define(RescaleOp, 'java.awt.image.RescaleOp', { kind: 'class', ifaces: ['java.awt.image.BufferedImageOp', 'java.awt.image.RasterOp'], sup: 'java.lang.Object', ctors: { 'float,float,java.awt.RenderingHints': '_RescaleOp$float$float$RenderingHints', 'float[],float[],java.awt.RenderingHints': '_RescaleOp$floatArr$floatArr$RenderingHints' }, meths: { 'createCompatibleDestImage(java.awt.image.BufferedImage,java.awt.image.ColorModel)': 'createCompatibleDestImage$BufferedImage$ColorModel', 'getBounds2D(java.awt.image.Raster)': 'getBounds2D$Raster', 'getBounds2D(java.awt.image.BufferedImage)': 'getBounds2D$BufferedImage', 'filter(java.awt.image.Raster,java.awt.image.WritableRaster)': 'filter$Raster$WritableRaster', 'filter(java.awt.image.BufferedImage,java.awt.image.BufferedImage)': 'filter$BufferedImage$BufferedImage' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  Point2D$Float = $J.load('java.awt.geom.Point2D$Float');
  ByteLookupTable = $J.load('java.awt.image.ByteLookupTable');
  ColorConvertOp = $J.load('java.awt.image.ColorConvertOp');
  ComponentSampleModel = $J.load('java.awt.image.ComponentSampleModel');
  DataBuffer = $J.load('java.awt.image.DataBuffer');
  IndexColorModel = $J.load('java.awt.image.IndexColorModel');
  LookupOp = $J.load('java.awt.image.LookupOp');
  ShortLookupTable = $J.load('java.awt.image.ShortLookupTable');
});
