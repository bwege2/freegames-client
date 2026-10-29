// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/image/IntegerComponentRaster.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let RasterFormatException, SinglePixelPackedSampleModel;

/**
 * This class defines a Raster with pixels consisting of one or more 32-bit
 * data elements stored in close proximity to each other in a integer array.
 * The bit precision per data element is that
 * of the data type (that is, the bit precision for this raster is 32).
 * There is only one pixel stride and one scanline stride for all
 * bands.  For a given pixel, all samples fit in N data elements and these
 * N data elements hold samples for only one pixel.  This type of Raster
 * can be used with a PackedColorModel.
 * <p>
 * For example, if there is only one data element per pixel, a
 * SinglePixelPackedSampleModel can be used to represent multiple
 * bands with a PackedColorModel (including a DirectColorModel) for
 * color interpretation.
 */
export class IntegerComponentRaster extends SunWritableRaster {
  static readonly TYPE_CUSTOM: number = 0;
  static readonly TYPE_BYTE_SAMPLES: number = 1;
  static readonly TYPE_USHORT_SAMPLES: number = 2;
  static readonly TYPE_INT_SAMPLES: number = 3;
  static readonly TYPE_BYTE_BANDED_SAMPLES: number = 4;
  static readonly TYPE_USHORT_BANDED_SAMPLES: number = 5;
  static readonly TYPE_INT_BANDED_SAMPLES: number = 6;
  static readonly TYPE_BYTE_PACKED_SAMPLES: number = 7;
  static readonly TYPE_USHORT_PACKED_SAMPLES: number = 8;
  static readonly TYPE_INT_PACKED_SAMPLES: number = 9;
  static readonly TYPE_INT_8BIT_SAMPLES: number = 10;
  static readonly TYPE_BYTE_BINARY_SAMPLES: number = 11;
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
  /**
   * The number of data elements required to store a pixel.
   */
  numDataElems: number = 0;
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
   * Constructs a IntegerComponentRaster with the given SampleModel,
   * DataBuffer, and parent.  DataBuffer must be a DataBufferInt and
   * SampleModel must be of type SinglePixelPackedSampleModel.
   * When translated into the base Raster's
   * coordinate system, aRegion must be contained by the base Raster.
   * Origin is the coordinate in the new Raster's coordinate system of
   * the origin of the base Raster.  (The base Raster is the Raster's
   * ancestor which has no parent.)
   *
   * Note that this constructor should generally be called by other
   * constructors or create methods, it should not be used directly.
   * @param sampleModel     The SampleModel that specifies the layout.
   * @param dataBuffer      The DataBufferInt that contains the image data.
   * @param aRegion         The Rectangle that specifies the image area.
   * @param origin          The Point that specifies the origin.
   * @param parent          The parent (if any) of this raster.
   */
  _IntegerComponentRaster$SampleModel$DataBufferInt$Rectangle$Point$IntegerComponentRaster(sampleModel: SampleModel, dataBuffer: DataBufferInt, aRegion: Rectangle, origin: Point, parent: IntegerComponentRaster): this {
    this._SunWritableRaster$SampleModel$DataBuffer$Rectangle$Point$WritableRaster(sampleModel, dataBuffer, aRegion, origin, parent);
    this.maxX = (this.minX + this.width_) | 0;
    this.maxY = (this.minY + this.height_) | 0;
    if (dataBuffer.getNumBanks() !== 1) {
      throw new RasterFormatException()._RasterFormatException('DataBuffer for IntegerComponentRasters must only have 1 bank.');
    }
    this.data = SunWritableRaster.stealData$DataBufferInt$int(dataBuffer, 0);
    if (sampleModel instanceof SinglePixelPackedSampleModel) {
      let sppsm = sampleModel;
      let boffsets = sppsm.getBitOffsets();
      let notByteBoundary = false;
      for (let i = 1; i < boffsets.length; i++) {
        if ((boffsets[i] % 8) !== 0) {
          notByteBoundary = true;
        }
      }
      this.type = (notByteBoundary ? IntegerComponentRaster.TYPE_INT_PACKED_SAMPLES : IntegerComponentRaster.TYPE_INT_8BIT_SAMPLES);
      this.scanlineStride = sppsm.getScanlineStride();
      this.pixelStride = 1;
      this.dataOffsets = $J.newArray(1, 0);
      this.dataOffsets[0] = dataBuffer.getOffset();
      this.bandOffset = this.dataOffsets[0];
      let xOffset = (aRegion.x_ - origin.x_) | 0;
      let yOffset = (aRegion.y_ - origin.y_) | 0;
      this.dataOffsets[0] = (this.dataOffsets[0] + (xOffset + Math.imul(yOffset, this.scanlineStride))) | 0;
      this.numDataElems = sppsm.getNumDataElements();
    } else {
      throw new RasterFormatException()._RasterFormatException('IntegerComponentRasters must have SinglePixelPackedSampleModel');
    }
    this.verify();
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('sun.awt.image.IntegerComponentRaster', 'initIDs', this, $a);
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
    if (this.dataOffsets[0] < 0) {
      throw new RasterFormatException()._RasterFormatException('Data offset (' + this.dataOffsets[0] + ') must be >= 0');
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
    IntegerComponentRaster.initIDs();
  }
}

$J.define(IntegerComponentRaster, 'sun.awt.image.IntegerComponentRaster', { kind: 'class', sup: 'sun.awt.image.SunWritableRaster', ctors: { 'java.awt.image.SampleModel,java.awt.image.DataBufferInt,java.awt.Rectangle,java.awt.Point,sun.awt.image.IntegerComponentRaster': '_IntegerComponentRaster$SampleModel$DataBufferInt$Rectangle$Point$IntegerComponentRaster', 'java.awt.image.SampleModel,java.awt.image.DataBufferInt,java.awt.Point': '_IntegerComponentRaster$SampleModel$DataBufferInt$Point', 'java.awt.image.SampleModel,java.awt.Point': '_IntegerComponentRaster$SampleModel$Point' }, meths: { 'createCompatibleWritableRaster()': 'createCompatibleWritableRaster$', 'createCompatibleWritableRaster(int,int)': 'createCompatibleWritableRaster$int$int', 'setDataElements(int,int,int,int,java.lang.Object)': 'setDataElements$int$int$int$int$Object', 'setDataElements(int,int,int,int,java.awt.image.Raster)': 'setDataElements$int$int$int$int$Raster$IntegerComponentRaster', 'setDataElements(int,int,java.awt.image.Raster)': 'setDataElements$int$int$Raster', 'setDataElements(int,int,java.lang.Object)': 'setDataElements$int$int$Object', 'getDataElements(int,int,int,int,java.lang.Object)': 'getDataElements$int$int$int$int$Object', 'getDataElements(int,int,java.lang.Object)': 'getDataElements$int$int$Object' }, clinit: true, lazy: [] });
$J.module(() => {
  RasterFormatException = $J.load('java.awt.image.RasterFormatException');
  SinglePixelPackedSampleModel = $J.load('java.awt.image.SinglePixelPackedSampleModel');
});
