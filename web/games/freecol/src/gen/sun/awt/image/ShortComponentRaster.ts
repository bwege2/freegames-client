// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/image/ShortComponentRaster.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, NativeLibLoader } from '../../../../jre/index.ts';
import { SunWritableRaster } from './SunWritableRaster.ts';

let ComponentSampleModel, RasterFormatException, SinglePixelPackedSampleModel, IntegerComponentRaster;

/**
 * This class defines a Raster with pixels consisting of one or more 16-bit
 * data elements stored in close proximity to each other in a short integer
 * array.  The bit precision per data element is that
 * of the data type (that is, the bit precision for this Raster is 16).
 * There is only one pixel stride and one scanline stride for all
 * bands.  This type of Raster can be used with a
 * ComponentColorModel if there are multiple bands, or a
 * IndexColorModel if there is only one band.
 * <p>
 * For example, 5-6-5 RGB image data can be represented by a
 * ShortComponentRaster using a SinglePixelPackedSampleModel and
 * a ComponentColorModel.
 */
export class ShortComponentRaster extends SunWritableRaster {
  /**
   * private band offset for use by native code
   */
  bandOffset: number = 0;
  /**
   * Data offsets for each band of image data.
   */
  dataOffsets: number[] = null;
  /**
   * Scanline stride of the image data contained in this Raster.
   */
  scanlineStride: number = 0;
  /**
   * Pixel stride of the image data contained in this Raster.
   */
  pixelStride: number = 0;
  /**
   * The image data array.
   */
  data: number[] = null;
  type: number = 0;
  /**
   * A cached copy of minX + width for use in bounds checks.
   */
  maxX: number = 0;
  /**
   * A cached copy of minY + height for use in bounds checks.
   */
  maxY: number = 0;
  /**
   * Constructs a ShortComponentRaster with the given SampleModel,
   * DataBuffer, and parent.  DataBuffer must be a DataBufferUShort and
   * SampleModel must be of type ComponentSampleModel or
   * SinglePixelPackedSampleModel.  When translated into the base Raster's
   * coordinate system, aRegion must be contained by the base Raster.
   * Origin is the coordinate in the new Raster's coordinate system of
   * the origin of the base Raster.  (The base Raster is the Raster's
   * ancestor which has no parent.)
   *
   * Note that this constructor should generally be called by other
   * constructors or create methods, it should not be used directly.
   * @param sampleModel     The SampleModel that specifies the layout.
   * @param dataBuffer      The DataBufferUShort that contains the image data.
   * @param aRegion         The Rectangle that specifies the image area.
   * @param origin          The Point that specifies the origin.
   * @param parent          The parent (if any) of this raster.
   */
  _ShortComponentRaster$SampleModel$DataBufferUShort$Rectangle$Point$ShortComponentRaster(sampleModel: SampleModel, dataBuffer: DataBufferUShort, aRegion: Rectangle, origin: Point, parent: ShortComponentRaster): this {
    this._SunWritableRaster$SampleModel$DataBuffer$Rectangle$Point$WritableRaster(sampleModel, dataBuffer, aRegion, origin, parent);
    this.maxX = (this.minX + this.width_) | 0;
    this.maxY = (this.minY + this.height_) | 0;
    this.data = SunWritableRaster.stealData$DataBufferUShort$int(dataBuffer, 0);
    if (dataBuffer.getNumBanks() !== 1) {
      throw new RasterFormatException()._RasterFormatException('DataBuffer for ShortComponentRasters must only have 1 bank.');
    }
    let dbOffset = dataBuffer.getOffset();
    if (sampleModel instanceof ComponentSampleModel) {
      let csm = sampleModel;
      this.type = IntegerComponentRaster.TYPE_USHORT_SAMPLES;
      this.scanlineStride = csm.getScanlineStride();
      this.pixelStride = csm.getPixelStride();
      this.dataOffsets = csm.getBandOffsets();
      let xOffset = (aRegion.x_ - origin.x_) | 0;
      let yOffset = (aRegion.y_ - origin.y_) | 0;
      for (let i = 0; i < this.getNumDataElements(); i++) {
        this.dataOffsets[i] = (this.dataOffsets[i] + (dbOffset + Math.imul(xOffset, this.pixelStride) + Math.imul(yOffset, this.scanlineStride))) | 0;
      }
    } else if (sampleModel instanceof SinglePixelPackedSampleModel) {
      let sppsm = sampleModel;
      this.type = IntegerComponentRaster.TYPE_USHORT_PACKED_SAMPLES;
      this.scanlineStride = sppsm.getScanlineStride();
      this.pixelStride = 1;
      this.dataOffsets = $J.newArray(1, 0);
      this.dataOffsets[0] = dbOffset;
      let xOffset = (aRegion.x_ - origin.x_) | 0;
      let yOffset = (aRegion.y_ - origin.y_) | 0;
      this.dataOffsets[0] = (this.dataOffsets[0] + (xOffset + Math.imul(yOffset, this.scanlineStride))) | 0;
    } else {
      throw new RasterFormatException()._RasterFormatException('ShortComponentRasters must haveComponentSampleModel or SinglePixelPackedSampleModel');
    }
    this.bandOffset = this.dataOffsets[0];
    this.verify();
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('sun.awt.image.ShortComponentRaster', 'initIDs', this, $a);
  }
  /**
   * Verify that the layout parameters are consistent with the data.
   *
   * The method verifies whether scanline stride and pixel stride do not
   * cause an integer overflow during calculation of a position of the pixel
   * in data buffer. It also verifies whether the data buffer has enough data
   *  to correspond the raster layout attributes.
   *
   * @throws RasterFormatException if an integer overflow is detected,
   * or if data buffer has not enough capacity.
   */
  verify(): void {
    if (this.width_ <= 0 || this.height_ <= 0 || this.height_ > ($J.idiv(2147483647, this.width_))) {
      throw new RasterFormatException()._RasterFormatException('Invalid raster dimension');
    }
    for (let i = 0; i < this.dataOffsets.length; i++) {
      if (this.dataOffsets[i] < 0) {
        throw new RasterFormatException()._RasterFormatException('Data offsets for band ' + i + '(' + this.dataOffsets[i] + ') must be >= 0');
      }
    }
    if (this.minX - this.sampleModelTranslateX < 0 || this.minY - this.sampleModelTranslateY < 0) {
      throw new RasterFormatException()._RasterFormatException('Incorrect origin/translate: (' + this.minX + ', ' + this.minY + ') / (' + this.sampleModelTranslateX + ', ' + this.sampleModelTranslateY + ')');
    }
    if (this.scanlineStride < 0 || this.scanlineStride > ($J.idiv(2147483647, this.height_))) {
      throw new RasterFormatException()._RasterFormatException('Incorrect scanline stride: ' + this.scanlineStride);
    }
    if (this.height_ > 1 || ((this.minY - this.sampleModelTranslateY) | 0) > 0) {
      if (this.scanlineStride > this.data.length) {
        throw new RasterFormatException()._RasterFormatException('Incorrect scanline stride: ' + this.scanlineStride);
      }
    }
    let lastScanOffset = Math.imul(((this.height_ - 1) | 0), this.scanlineStride);
    if (this.pixelStride < 0 || this.pixelStride > ($J.idiv(2147483647, this.width_)) || this.pixelStride > this.data.length) {
      throw new RasterFormatException()._RasterFormatException('Incorrect pixel stride: ' + this.pixelStride);
    }
    let lastPixelOffset = Math.imul(((this.width_ - 1) | 0), this.pixelStride);
    if (lastPixelOffset > ((2147483647 - lastScanOffset) | 0)) {
      throw new RasterFormatException()._RasterFormatException('Incorrect raster attributes');
    }
    lastPixelOffset = (lastPixelOffset + lastScanOffset) | 0;
    let index: number;
    let maxIndex = 0;
    for (let i = 0; i < this.numDataElements; i++) {
      if (this.dataOffsets[i] > ((2147483647 - lastPixelOffset) | 0)) {
        throw new RasterFormatException()._RasterFormatException('Incorrect band offset: ' + this.dataOffsets[i]);
      }
      index = (lastPixelOffset + this.dataOffsets[i]) | 0;
      if (index > maxIndex) {
        maxIndex = index;
      }
    }
    if (this.data.length <= maxIndex) {
      throw new RasterFormatException()._RasterFormatException('Data array too small (should be > ' + maxIndex + ' )');
    }
  }
  static $clinit() {
    NativeLibLoader.loadLibraries();
    ShortComponentRaster.initIDs();
  }
}

$J.define(ShortComponentRaster, 'sun.awt.image.ShortComponentRaster', { kind: 'class', sup: 'sun.awt.image.SunWritableRaster', ctors: { 'java.awt.image.SampleModel,java.awt.image.DataBufferUShort,java.awt.Rectangle,java.awt.Point,sun.awt.image.ShortComponentRaster': '_ShortComponentRaster$SampleModel$DataBufferUShort$Rectangle$Point$ShortComponentRaster', 'java.awt.image.SampleModel,java.awt.image.DataBufferUShort,java.awt.Point': '_ShortComponentRaster$SampleModel$DataBufferUShort$Point', 'java.awt.image.SampleModel,java.awt.Point': '_ShortComponentRaster$SampleModel$Point' }, meths: { 'createCompatibleWritableRaster()': 'createCompatibleWritableRaster$', 'createCompatibleWritableRaster(int,int)': 'createCompatibleWritableRaster$int$int', 'putShortData(int,int,int,int,short[])': 'putShortData$int$int$int$int$shortArr', 'putShortData(int,int,int,int,int,short[])': 'putShortData$int$int$int$int$int$shortArr', 'setDataElements(int,int,int,int,java.lang.Object)': 'setDataElements$int$int$int$int$Object', 'setDataElements(int,int,int,int,java.awt.image.Raster)': 'setDataElements$int$int$int$int$Raster$ShortComponentRaster', 'setDataElements(int,int,java.awt.image.Raster)': 'setDataElements$int$int$Raster', 'setDataElements(int,int,java.lang.Object)': 'setDataElements$int$int$Object', 'getShortData(int,int,int,int,short[])': 'getShortData$int$int$int$int$shortArr', 'getShortData(int,int,int,int,int,short[])': 'getShortData$int$int$int$int$int$shortArr', 'getDataElements(int,int,int,int,java.lang.Object)': 'getDataElements$int$int$int$int$Object', 'getDataElements(int,int,java.lang.Object)': 'getDataElements$int$int$Object' }, clinit: true, lazy: [] });
$J.module(() => {
  ComponentSampleModel = $J.load('java.awt.image.ComponentSampleModel');
  RasterFormatException = $J.load('java.awt.image.RasterFormatException');
  SinglePixelPackedSampleModel = $J.load('java.awt.image.SinglePixelPackedSampleModel');
  IntegerComponentRaster = $J.load('sun.awt.image.IntegerComponentRaster');
});
