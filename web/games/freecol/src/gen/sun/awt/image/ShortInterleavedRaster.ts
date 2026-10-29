// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/image/ShortInterleavedRaster.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { ShortComponentRaster } from './ShortComponentRaster.ts';

let Point, Rectangle, ComponentSampleModel, PixelInterleavedSampleModel, RasterFormatException, SinglePixelPackedSampleModel, SunWritableRaster;

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
 * ShortInterleavedRaster using a SinglePixelPackedSampleModel and
 * a ComponentColorModel.
 */
export class ShortInterleavedRaster extends ShortComponentRaster {
  /**
   * A cached copy of minX + width for use in bounds checks.
   */
  maxX$ShortInterleavedRaster: number = 0;
  /**
   * A cached copy of minY + height for use in bounds checks.
   */
  maxY$ShortInterleavedRaster: number = 0;
  /**
   * Constructs a ShortInterleavedRaster with the given SampleModel.
   *  The Raster's upper left corner is origin and it is the same
   *  size as the SampleModel.  A DataBuffer large enough to describe the
   *  Raster is automatically created.  SampleModel must be of type
   *  PixelInterleavedSampleModel or SinglePixelPackedSampleModel.
   *  @param sampleModel     The SampleModel that specifies the layout.
   *  @param origin          The Point that specified the origin.
   */
  _ShortInterleavedRaster$SampleModel$Point(sampleModel: SampleModel, origin: Point): this {
    this._ShortInterleavedRaster$SampleModel$DataBufferUShort$Rectangle$Point$ShortInterleavedRaster(sampleModel, sampleModel.createDataBuffer(), new Rectangle()._Rectangle$int$int$int$int(origin.x_, origin.y_, sampleModel.getWidth(), sampleModel.getHeight()), origin, null);
    return this;
  }
  /**
   * Constructs a ShortInterleavedRaster with the given SampleModel
   * and DataBuffer.  The Raster's upper left corner is origin and
   * it is the same sizes the SampleModel.  The DataBuffer is not
   * initialized and must be a DataBufferUShort compatible with SampleModel.
   * SampleModel must be of type PixelInterleavedSampleModel or
   * SinglePixelPackedSampleModel.
   * @param sampleModel     The SampleModel that specifies the layout.
   * @param dataBuffer      The DataBufferUShort that contains the image data.
   * @param origin          The Point that specifies the origin.
   */
  _ShortInterleavedRaster$SampleModel$DataBufferUShort$Point(sampleModel: SampleModel, dataBuffer: DataBufferUShort, origin: Point): this {
    this._ShortInterleavedRaster$SampleModel$DataBufferUShort$Rectangle$Point$ShortInterleavedRaster(sampleModel, dataBuffer, new Rectangle()._Rectangle$int$int$int$int(origin.x_, origin.y_, sampleModel.getWidth(), sampleModel.getHeight()), origin, null);
    return this;
  }
  /**
   * Constructs a ShortInterleavedRaster with the given SampleModel,
   * DataBuffer, and parent.  DataBuffer must be a DataBufferUShort and
   * SampleModel must be of type PixelInterleavedSampleModel or
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
  _ShortInterleavedRaster$SampleModel$DataBufferUShort$Rectangle$Point$ShortInterleavedRaster(sampleModel: SampleModel, dataBuffer: DataBufferUShort, aRegion: Rectangle, origin: Point, parent: ShortInterleavedRaster): this {
    this._ShortComponentRaster$SampleModel$DataBufferUShort$Rectangle$Point$ShortComponentRaster(sampleModel, dataBuffer, aRegion, origin, parent);
    this.maxX$ShortInterleavedRaster = (this.minX + this.width_) | 0;
    this.maxY$ShortInterleavedRaster = (this.minY + this.height_) | 0;
    this.data = SunWritableRaster.stealData$DataBufferUShort$int(dataBuffer, 0);
    if ((sampleModel instanceof PixelInterleavedSampleModel) || (sampleModel instanceof ComponentSampleModel && sampleModel.getNumBands() === 1)) {
      let csm = sampleModel;
      this.scanlineStride = csm.getScanlineStride();
      this.pixelStride = csm.getPixelStride();
      this.dataOffsets = csm.getBandOffsets();
      let xOffset = (aRegion.x_ - origin.x_) | 0;
      let yOffset = (aRegion.y_ - origin.y_) | 0;
      for (let i = 0; i < this.getNumDataElements(); i++) {
        this.dataOffsets[i] = (this.dataOffsets[i] + (Math.imul(xOffset, this.pixelStride) + Math.imul(yOffset, this.scanlineStride))) | 0;
      }
    } else if (sampleModel instanceof SinglePixelPackedSampleModel) {
      let sppsm = sampleModel;
      this.scanlineStride = sppsm.getScanlineStride();
      this.pixelStride = 1;
      this.dataOffsets = $J.newArray(1, 0);
      this.dataOffsets[0] = dataBuffer.getOffset();
      let xOffset = (aRegion.x_ - origin.x_) | 0;
      let yOffset = (aRegion.y_ - origin.y_) | 0;
      this.dataOffsets[0] = (this.dataOffsets[0] + (xOffset + Math.imul(yOffset, this.scanlineStride))) | 0;
    } else {
      throw new RasterFormatException()._RasterFormatException('ShortInterleavedRasters must have PixelInterleavedSampleModel, SinglePixelPackedSampleModel or 1 band ComponentSampleModel.  Sample model is ' + $J.str(sampleModel));
    }
    this.bandOffset = this.dataOffsets[0];
    this.verify();
    return this;
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
    if ((x < this.minX) || (y < this.minY) || (x >= this.maxX$ShortInterleavedRaster) || (y >= this.maxY$ShortInterleavedRaster)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let outData: number[];
    if (obj == null) {
      outData = $J.newArray(this.numDataElements, 0);
    } else {
      outData = obj;
    }
    let off = (Math.imul(((y - this.minY) | 0), this.scanlineStride) + Math.imul(((x - this.minX) | 0), this.pixelStride)) | 0;
    for (let band = 0; band < this.numDataElements; band++) {
      outData[band] = this.data[(this.dataOffsets[band] + off) | 0];
    }
    return outData;
  }
  /**
   * Returns an array  of data elements from the specified rectangular
   * region.
   * An ArrayIndexOutOfBounds exception will be thrown at runtime
   * if the pixel coordinates are out of bounds.
   * A ClassCastException will be thrown if the input object is non null
   * and references anything other than an array of transferType.
   * <pre>
   *       short[] bandData = (short[])Raster.getDataElements(x, y, w, h, null);
   *       int numDataElements = Raster.getBands();
   *       short[] pixel = new short[numDataElements];
   *       // To find the data element at location (x2, y2)
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
    if ((x < this.minX) || (y < this.minY) || (((x + w) | 0) > this.maxX$ShortInterleavedRaster) || (((y + h) | 0) > this.maxY$ShortInterleavedRaster)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let outData: number[];
    if (obj == null) {
      outData = $J.newArray(Math.imul(Math.imul(w, h), this.numDataElements), 0);
    } else {
      outData = obj;
    }
    let yoff = (Math.imul(((y - this.minY) | 0), this.scanlineStride) + Math.imul(((x - this.minX) | 0), this.pixelStride)) | 0;
    let xoff: number;
    let off = 0;
    let xstart: number;
    let ystart: number;
    for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
      xoff = yoff;
      for (xstart = 0; xstart < w; xstart++, xoff = (xoff + this.pixelStride) | 0) {
        for (let c = 0; c < this.numDataElements; c++) {
          outData[off++] = this.data[(this.dataOffsets[c] + xoff) | 0];
        }
      }
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
    if ((x < this.minX) || (y < this.minY) || (x >= this.maxX$ShortInterleavedRaster) || (y >= this.maxY$ShortInterleavedRaster)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let inData = obj;
    let off = (Math.imul(((y - this.minY) | 0), this.scanlineStride) + Math.imul(((x - this.minX) | 0), this.pixelStride)) | 0;
    for (let i = 0; i < this.numDataElements; i++) {
      (this.data[(this.dataOffsets[i] + off) | 0]) = inData[i];
    }
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
    if ((x < this.minX) || (y < this.minY) || (((x + w) | 0) > this.maxX$ShortInterleavedRaster) || (((y + h) | 0) > this.maxY$ShortInterleavedRaster)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let inData = obj;
    let yoff = (Math.imul(((y - this.minY) | 0), this.scanlineStride) + Math.imul(((x - this.minX) | 0), this.pixelStride)) | 0;
    let xoff: number;
    let off = 0;
    let xstart: number;
    let ystart: number;
    for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
      xoff = yoff;
      for (xstart = 0; xstart < w; xstart++, xoff = (xoff + this.pixelStride) | 0) {
        for (let c = 0; c < this.numDataElements; c++) {
          (this.data[(this.dataOffsets[c] + xoff) | 0]) = inData[off++];
        }
      }
    }
    this.markDirty();
  }
  /**
   * Creates a Raster with the same layout but using a different
   * width and height, and with new zeroed data arrays.
   */
  createCompatibleWritableRaster$int$int(w: number, h: number): WritableRaster {
    if (w <= 0 || h <= 0) {
      throw new RasterFormatException()._RasterFormatException('negative ' + ((w <= 0) ? 'width' : 'height'));
    }
    let sm = this.sampleModel.createCompatibleSampleModel(w, h);
    return new ShortInterleavedRaster()._ShortInterleavedRaster$SampleModel$Point(sm, new Point()._Point$int$int(0, 0));
  }
  /**
   * Creates a Raster with the same layout and the same
   * width and height, and with new zeroed data arrays.  If
   * the Raster is a subRaster, this will call
   * createCompatibleRaster(width, height).
   */
  createCompatibleWritableRaster$(): WritableRaster {
    return this.createCompatibleWritableRaster$int$int(this.width_, this.height_);
  }
  toString(): string {
    return 'ShortInterleavedRaster: width = ' + this.width_ + ' height = ' + this.height_ + ' #numDataElements ' + this.numDataElements;
  }
}

$J.define(ShortInterleavedRaster, 'sun.awt.image.ShortInterleavedRaster', { kind: 'class', sup: 'sun.awt.image.ShortComponentRaster', ctors: { 'java.awt.image.SampleModel,java.awt.image.DataBufferUShort,java.awt.Rectangle,java.awt.Point,sun.awt.image.ShortInterleavedRaster': '_ShortInterleavedRaster$SampleModel$DataBufferUShort$Rectangle$Point$ShortInterleavedRaster', 'java.awt.image.SampleModel,java.awt.image.DataBufferUShort,java.awt.Point': '_ShortInterleavedRaster$SampleModel$DataBufferUShort$Point', 'java.awt.image.SampleModel,java.awt.Point': '_ShortInterleavedRaster$SampleModel$Point' }, meths: { 'createCompatibleWritableRaster()': 'createCompatibleWritableRaster$', 'createCompatibleWritableRaster(int,int)': 'createCompatibleWritableRaster$int$int', 'putShortData(int,int,int,int,short[])': 'putShortData$int$int$int$int$shortArr', 'putShortData(int,int,int,int,int,short[])': 'putShortData$int$int$int$int$int$shortArr', 'setDataElements(int,int,int,int,java.lang.Object)': 'setDataElements$int$int$int$int$Object', 'setDataElements(int,int,int,int,java.awt.image.Raster)': 'setDataElements$int$int$int$int$Raster$ShortInterleavedRaster', 'setDataElements(int,int,java.awt.image.Raster)': 'setDataElements$int$int$Raster', 'setDataElements(int,int,java.lang.Object)': 'setDataElements$int$int$Object', 'getShortData(int,int,int,int,short[])': 'getShortData$int$int$int$int$shortArr', 'getShortData(int,int,int,int,int,short[])': 'getShortData$int$int$int$int$int$shortArr', 'getDataElements(int,int,int,int,java.lang.Object)': 'getDataElements$int$int$int$int$Object', 'getDataElements(int,int,java.lang.Object)': 'getDataElements$int$int$Object' } });
$J.module(() => {
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  ComponentSampleModel = $J.load('java.awt.image.ComponentSampleModel');
  PixelInterleavedSampleModel = $J.load('java.awt.image.PixelInterleavedSampleModel');
  RasterFormatException = $J.load('java.awt.image.RasterFormatException');
  SinglePixelPackedSampleModel = $J.load('java.awt.image.SinglePixelPackedSampleModel');
  SunWritableRaster = $J.load('sun.awt.image.SunWritableRaster');
});
