// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/image/IntegerInterleavedRaster.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayIndexOutOfBoundsException } from '../../../../jre/index.ts';
import { IntegerComponentRaster } from './IntegerComponentRaster.ts';

let Point, Rectangle, RasterFormatException, SinglePixelPackedSampleModel, SunWritableRaster;

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
export class IntegerInterleavedRaster extends IntegerComponentRaster {
  /**
   * A cached copy of minX + width for use in bounds checks.
   */
  maxX$IntegerInterleavedRaster: number = 0;
  /**
   * A cached copy of minY + height for use in bounds checks.
   */
  maxY$IntegerInterleavedRaster: number = 0;
  /**
   * Constructs a IntegerInterleavedRaster with the given SampleModel.
   *  The Raster's upper left corner is origin and it is the same
   *  size as the SampleModel.  A DataBuffer large enough to describe the
   *  Raster is automatically created.  SampleModel must be of type
   *  SinglePixelPackedSampleModel.
   *  @param sampleModel     The SampleModel that specifies the layout.
   *  @param origin          The Point that specified the origin.
   */
  _IntegerInterleavedRaster$SampleModel$Point(sampleModel: SampleModel, origin: Point): this {
    this._IntegerInterleavedRaster$SampleModel$DataBufferInt$Rectangle$Point$IntegerInterleavedRaster(sampleModel, sampleModel.createDataBuffer(), new Rectangle()._Rectangle$int$int$int$int(origin.x_, origin.y_, sampleModel.getWidth(), sampleModel.getHeight()), origin, null);
    return this;
  }
  /**
   * Constructs a IntegerInterleavedRaster with the given SampleModel
   * and DataBuffer.  The Raster's upper left corner is origin and
   * it is the same sizes the SampleModel.  The DataBuffer is not
   * initialized and must be a DataBufferInt compatible with SampleModel.
   * SampleModel must be of type SinglePixelPackedSampleModel.
   * @param sampleModel     The SampleModel that specifies the layout.
   * @param dataBuffer      The DataBufferInt that contains the image data.
   * @param origin          The Point that specifies the origin.
   */
  _IntegerInterleavedRaster$SampleModel$DataBufferInt$Point(sampleModel: SampleModel, dataBuffer: DataBufferInt, origin: Point): this {
    this._IntegerInterleavedRaster$SampleModel$DataBufferInt$Rectangle$Point$IntegerInterleavedRaster(sampleModel, dataBuffer, new Rectangle()._Rectangle$int$int$int$int(origin.x_, origin.y_, sampleModel.getWidth(), sampleModel.getHeight()), origin, null);
    return this;
  }
  /**
   * Constructs a IntegerInterleavedRaster with the given SampleModel,
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
  _IntegerInterleavedRaster$SampleModel$DataBufferInt$Rectangle$Point$IntegerInterleavedRaster(sampleModel: SampleModel, dataBuffer: DataBufferInt, aRegion: Rectangle, origin: Point, parent: IntegerInterleavedRaster): this {
    this._IntegerComponentRaster$SampleModel$DataBufferInt$Rectangle$Point$IntegerComponentRaster(sampleModel, dataBuffer, aRegion, origin, parent);
    this.maxX$IntegerInterleavedRaster = (this.minX + this.width_) | 0;
    this.maxY$IntegerInterleavedRaster = (this.minY + this.height_) | 0;
    this.data = SunWritableRaster.stealData$DataBufferInt$int(dataBuffer, 0);
    if (sampleModel instanceof SinglePixelPackedSampleModel) {
      let sppsm = sampleModel;
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
      throw new RasterFormatException()._RasterFormatException('IntegerInterleavedRasters must have SinglePixelPackedSampleModel');
    }
    this.verify();
    return this;
  }
  /**
   * Returns data offset for the specified band.  The data offset
   * is the index into the data array in which the first sample
   * of the first scanline is stored.
   */
  getDataOffset(band: number): number {
    return this.dataOffsets[band];
  }
  /**
   * Returns the scanline stride -- the number of data array elements between
   * a given sample and the sample in the same column of the next row.
   */
  getScanlineStride(): number {
    return this.scanlineStride;
  }
  /**
   * Returns pixel stride -- the number of data array elements  between two
   * samples for the same band on the same scanline.
   */
  getPixelStride(): number {
    return this.pixelStride;
  }
  /**
   * Returns a reference to the data array.
   */
  getDataStorage(): number[] {
    return this.data;
  }
  /**
   * Returns the data elements for all bands at the specified
   * location.
   * An ArrayIndexOutOfBounds exception will be thrown at runtime
   * if the pixel coordinate is out of bounds.
   * A ClassCastException will be thrown if the input object is non null
   * and references anything other than an array of transferType.
   * @param x        The X coordinate of the pixel location.
   * @param y        The Y coordinate of the pixel location.
   * @param obj      An object reference to an array of type defined by
   *                 getTransferType() and length getNumDataElements().
   *                 If null an array of appropriate type and size will be
   *                 allocated.
   * @return         An object reference to an array of type defined by
   *                 getTransferType() with the request pixel data.
   */
  getDataElements$int$int$Object(x: number, y: number, obj: any): any {
    if ((x < this.minX) || (y < this.minY) || (x >= this.maxX$IntegerInterleavedRaster) || (y >= this.maxY$IntegerInterleavedRaster)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let outData: number[];
    if (obj == null) {
      outData = $J.newArray(1, 0);
    } else {
      outData = obj;
    }
    let off = (Math.imul(((y - this.minY) | 0), this.scanlineStride) + (x - this.minX) + this.dataOffsets[0]) | 0;
    outData[0] = this.data[off];
    return outData;
  }
  /**
   * Returns an array  of data elements from the specified rectangular
   * region.
   * An ArrayIndexOutOfBounds exception will be thrown at runtime
   * if the pixel coordinates are out of bounds.
   * A ClassCastException will be thrown if the input object is non null
   * and references anything other than an array of transferType.
   *     <pre>
   *       int[] bandData = (int[])raster.getDataElements(x, y, w, h, null);
   *       int numDataElements = raster.getNumDataElements();
   *       int[] pixel = new int[numDataElements];
   *       // To find a data element at location (x2, y2)
   *       System.arraycopy(bandData, ((y2-y)*w + (x2-x))*numDataElements,
   *                        pixel, 0, numDataElements);
   * </pre>
   * @param x        The X coordinate of the upper left pixel location.
   * @param y        The Y coordinate of the upper left pixel location.
   * @param w        Width of the pixel rectangle.
   * @param h        Height of the pixel rectangle.
   * @param obj      An object reference to an array of type defined by
   *                 getTransferType() and length w*h*getNumDataElements().
   *                 If null an array of appropriate type and size will be
   *                 allocated.
   * @return         An object reference to an array of type defined by
   *                 getTransferType() with the request pixel data.
   */
  getDataElements$int$int$int$int$Object(x: number, y: number, w: number, h: number, obj: any): any {
    if ((x < this.minX) || (y < this.minY) || (((x + w) | 0) > this.maxX$IntegerInterleavedRaster) || (((y + h) | 0) > this.maxY$IntegerInterleavedRaster)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let outData: number[];
    if (Array.isArray(obj)) {
      outData = obj;
    } else {
      outData = $J.newArray(Math.imul(w, h), 0);
    }
    let yoff = (Math.imul(((y - this.minY) | 0), this.scanlineStride) + (x - this.minX) + this.dataOffsets[0]) | 0;
    let off = 0;
    for (let ystart = 0; ystart < h; ystart++) {
      $J.system_arraycopy(this.data, yoff, outData, off, w);
      off = (off + w) | 0;
      yoff = (yoff + this.scanlineStride) | 0;
    }
    return outData;
  }
  /**
   * Stores the data elements for all bands at the specified location.
   * An ArrayIndexOutOfBounds exception will be thrown at runtime
   * if the pixel coordinate is out of bounds.
   * A ClassCastException will be thrown if the input object is non null
   * and references anything other than an array of transferType.
   * @param x        The X coordinate of the pixel location.
   * @param y        The Y coordinate of the pixel location.
   * @param obj      An object reference to an array of type defined by
   *                 getTransferType() and length getNumDataElements()
   *                 containing the pixel data to place at x,y.
   */
  setDataElements$int$int$Object(x: number, y: number, obj: any): void {
    if ((x < this.minX) || (y < this.minY) || (x >= this.maxX$IntegerInterleavedRaster) || (y >= this.maxY$IntegerInterleavedRaster)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let inData = obj;
    let off = (Math.imul(((y - this.minY) | 0), this.scanlineStride) + (x - this.minX) + this.dataOffsets[0]) | 0;
    this.data[off] = inData[0];
    this.markDirty();
  }
  /**
   * Stores an array of data elements into the specified rectangular
   * region.
   * An ArrayIndexOutOfBounds exception will be thrown at runtime
   * if the pixel coordinates are out of bounds.
   * A ClassCastException will be thrown if the input object is non null
   * and references anything other than an array of transferType.
   * The data elements in the
   * data array are assumed to be packed.  That is, a data element
   * for the nth band at location (x2, y2) would be found at:
   * <pre>
   *      inData[((y2-y)*w + (x2-x))*numDataElements + n]
   * </pre>
   * @param x        The X coordinate of the upper left pixel location.
   * @param y        The Y coordinate of the upper left pixel location.
   * @param w        Width of the pixel rectangle.
   * @param h        Height of the pixel rectangle.
   * @param obj      An object reference to an array of type defined by
   *                 getTransferType() and length w*h*getNumDataElements()
   *                 containing the pixel data to place between x,y and
   *                 x+h, y+h.
   */
  setDataElements$int$int$int$int$Object(x: number, y: number, w: number, h: number, obj: any): void {
    if ((x < this.minX) || (y < this.minY) || (((x + w) | 0) > this.maxX$IntegerInterleavedRaster) || (((y + h) | 0) > this.maxY$IntegerInterleavedRaster)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let inData = obj;
    let yoff = (Math.imul(((y - this.minY) | 0), this.scanlineStride) + (x - this.minX) + this.dataOffsets[0]) | 0;
    let off = 0;
    for (let ystart = 0; ystart < h; ystart++) {
      $J.system_arraycopy(inData, off, this.data, yoff, w);
      off = (off + w) | 0;
      yoff = (yoff + this.scanlineStride) | 0;
    }
    this.markDirty();
  }
  /**
   * Creates a raster with the same band layout but using a different
   * width and height, and with new zeroed data arrays.
   */
  createCompatibleWritableRaster$int$int(w: number, h: number): WritableRaster {
    if (w <= 0 || h <= 0) {
      throw new RasterFormatException()._RasterFormatException('negative ' + ((w <= 0) ? 'width' : 'height'));
    }
    let sm = this.sampleModel.createCompatibleSampleModel(w, h);
    return new IntegerInterleavedRaster()._IntegerInterleavedRaster$SampleModel$Point(sm, new Point()._Point$int$int(0, 0));
  }
  /**
   * Creates a raster with the same data layout and the same
   * width and height, and with new zeroed data arrays.  If
   * the raster is a subraster, this will call
   * createCompatibleRaster(width, height).
   */
  createCompatibleWritableRaster$(): WritableRaster {
    return this.createCompatibleWritableRaster$int$int(this.width_, this.height_);
  }
  toString(): string {
    return 'IntegerInterleavedRaster: width = ' + this.width_ + ' height = ' + this.height_ + ' #Bands = ' + this.numBands + ' xOff = ' + this.sampleModelTranslateX + ' yOff = ' + this.sampleModelTranslateY + ' dataOffset[0] ' + this.dataOffsets[0];
  }
}

$J.define(IntegerInterleavedRaster, 'sun.awt.image.IntegerInterleavedRaster', { kind: 'class', sup: 'sun.awt.image.IntegerComponentRaster', ctors: { 'java.awt.image.SampleModel,java.awt.image.DataBufferInt,java.awt.Rectangle,java.awt.Point,sun.awt.image.IntegerInterleavedRaster': '_IntegerInterleavedRaster$SampleModel$DataBufferInt$Rectangle$Point$IntegerInterleavedRaster', 'java.awt.image.SampleModel,java.awt.image.DataBufferInt,java.awt.Point': '_IntegerInterleavedRaster$SampleModel$DataBufferInt$Point', 'java.awt.image.SampleModel,java.awt.Point': '_IntegerInterleavedRaster$SampleModel$Point' }, meths: { 'createCompatibleWritableRaster()': 'createCompatibleWritableRaster$', 'createCompatibleWritableRaster(int,int)': 'createCompatibleWritableRaster$int$int', 'setDataElements(int,int,int,int,java.lang.Object)': 'setDataElements$int$int$int$int$Object', 'setDataElements(int,int,int,int,java.awt.image.Raster)': 'setDataElements$int$int$int$int$Raster$IntegerInterleavedRaster', 'setDataElements(int,int,java.awt.image.Raster)': 'setDataElements$int$int$Raster', 'setDataElements(int,int,java.lang.Object)': 'setDataElements$int$int$Object', 'getDataElements(int,int,int,int,java.lang.Object)': 'getDataElements$int$int$int$int$Object', 'getDataElements(int,int,java.lang.Object)': 'getDataElements$int$int$Object' } });
$J.module(() => {
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  RasterFormatException = $J.load('java.awt.image.RasterFormatException');
  SinglePixelPackedSampleModel = $J.load('java.awt.image.SinglePixelPackedSampleModel');
  SunWritableRaster = $J.load('sun.awt.image.SunWritableRaster');
});
