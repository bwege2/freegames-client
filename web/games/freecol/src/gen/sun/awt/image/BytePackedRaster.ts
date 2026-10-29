// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/image/BytePackedRaster.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayIndexOutOfBoundsException, NativeLibLoader } from '../../../../jre/index.ts';
import { SunWritableRaster } from './SunWritableRaster.ts';

let Point, Rectangle, MultiPixelPackedSampleModel, RasterFormatException, IntegerComponentRaster;

/**
 * This class is useful for describing 1, 2, or 4 bit image data
 * elements.  This raster has one band whose pixels are packed
 * together into individual bytes in a single byte array.  This type
 * of raster can be used with an IndexColorModel. This raster uses a
 * MultiPixelPackedSampleModel.
 */
export class BytePackedRaster extends SunWritableRaster {
  /**
   * The data bit offset for each pixel.
   */
  dataBitOffset: number = 0;
  /**
   * Scanline stride of the image data contained in this Raster.
   */
  scanlineStride: number = 0;
  /**
   * The bit stride of a pixel, equal to the total number of bits
   * required to store a pixel.
   */
  pixelBitStride: number = 0;
  /**
   * The bit mask for extracting the pixel.
   */
  bitMask: number = 0;
  /**
   * The image data array.
   */
  data: number[] = null;
  /**
   * 8 minus the pixel bit stride.
   */
  shiftOffset: number = 0;
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
   * Constructs a BytePackedRaster with the given SampleModel.
   * The Raster's upper left corner is origin and it is the same
   * size as the SampleModel.  A DataBuffer large enough to describe the
   * Raster is automatically created.  SampleModel must be of type
   * MultiPixelPackedSampleModel.
   * @param sampleModel     The SampleModel that specifies the layout.
   * @param origin          The Point that specified the origin.
   */
  _BytePackedRaster$SampleModel$Point(sampleModel: SampleModel, origin: Point): this {
    this._BytePackedRaster$SampleModel$DataBufferByte$Rectangle$Point$BytePackedRaster(sampleModel, sampleModel.createDataBuffer(), new Rectangle()._Rectangle$int$int$int$int(origin.x_, origin.y_, sampleModel.getWidth(), sampleModel.getHeight()), origin, null);
    return this;
  }
  /**
   * Constructs a BytePackedRaster with the given SampleModel
   * and DataBuffer.  The Raster's upper left corner is origin and
   * it is the same size as the SampleModel.  The DataBuffer is not
   * initialized and must be a DataBufferByte compatible with SampleModel.
   * SampleModel must be of type MultiPixelPackedSampleModel.
   * @param sampleModel     The SampleModel that specifies the layout.
   * @param dataBuffer      The DataBufferByte that contains the image data.
   * @param origin          The Point that specifies the origin.
   */
  _BytePackedRaster$SampleModel$DataBufferByte$Point(sampleModel: SampleModel, dataBuffer: DataBufferByte, origin: Point): this {
    this._BytePackedRaster$SampleModel$DataBufferByte$Rectangle$Point$BytePackedRaster(sampleModel, dataBuffer, new Rectangle()._Rectangle$int$int$int$int(origin.x_, origin.y_, sampleModel.getWidth(), sampleModel.getHeight()), origin, null);
    return this;
  }
  /**
   * Constructs a BytePackedRaster with the given SampleModel,
   * DataBuffer, and parent.  DataBuffer must be a DataBufferByte and
   * SampleModel must be of type MultiPixelPackedSampleModel.
   * When translated into the base Raster's
   * coordinate system, aRegion must be contained by the base Raster.
   * Origin is the coordinate in the new Raster's coordinate system of
   * the origin of the base Raster.  (The base Raster is the Raster's
   * ancestor which has no parent.)
   *
   * Note that this constructor should generally be called by other
   * constructors or create methods, it should not be used directly.
   * @param sampleModel     The SampleModel that specifies the layout.
   * @param dataBuffer      The DataBufferByte that contains the image data.
   * @param aRegion         The Rectangle that specifies the image area.
   * @param origin          The Point that specifies the origin.
   * @param parent          The parent (if any) of this raster.
   *
   * @throws RasterFormatException if the parameters do not conform
   * to requirements of this Raster type.
   */
  _BytePackedRaster$SampleModel$DataBufferByte$Rectangle$Point$BytePackedRaster(sampleModel: SampleModel, dataBuffer: DataBufferByte, aRegion: Rectangle, origin: Point, parent: BytePackedRaster): this {
    this._SunWritableRaster$SampleModel$DataBuffer$Rectangle$Point$WritableRaster(sampleModel, dataBuffer, aRegion, origin, parent);
    this.maxX = (this.minX + this.width_) | 0;
    this.maxY = (this.minY + this.height_) | 0;
    this.data = SunWritableRaster.stealData$DataBufferByte$int(dataBuffer, 0);
    if (dataBuffer.getNumBanks() !== 1) {
      throw new RasterFormatException()._RasterFormatException('DataBuffer for BytePackedRasters must only have 1 bank.');
    }
    let dbOffset = dataBuffer.getOffset();
    if (sampleModel instanceof MultiPixelPackedSampleModel) {
      let mppsm = sampleModel;
      this.type = IntegerComponentRaster.TYPE_BYTE_BINARY_SAMPLES;
      this.pixelBitStride = mppsm.getPixelBitStride();
      if (this.pixelBitStride !== 1 && this.pixelBitStride !== 2 && this.pixelBitStride !== 4) {
        throw new RasterFormatException()._RasterFormatException('BytePackedRasters must have a bit depth of 1, 2, or 4');
      }
      this.scanlineStride = mppsm.getScanlineStride();
      this.dataBitOffset = (mppsm.getDataBitOffset() + Math.imul(dbOffset, 8)) | 0;
      let xOffset = (aRegion.x_ - origin.x_) | 0;
      let yOffset = (aRegion.y_ - origin.y_) | 0;
      this.dataBitOffset = (this.dataBitOffset + (Math.imul(xOffset, this.pixelBitStride) + Math.imul(Math.imul(yOffset, this.scanlineStride), 8))) | 0;
      this.bitMask = ((1 << this.pixelBitStride) - 1) | 0;
      this.shiftOffset = (8 - this.pixelBitStride) | 0;
    } else {
      throw new RasterFormatException()._RasterFormatException('BytePackedRasters must haveMultiPixelPackedSampleModel');
    }
    this.verify(false);
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('sun.awt.image.BytePackedRaster', 'initIDs', this, $a);
  }
  /**
   * Returns the data element at the specified
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
    if ((x < this.minX) || (y < this.minY) || (x >= this.maxX) || (y >= this.maxY)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let outData: number[];
    if (obj == null) {
      outData = $J.newArray(this.numDataElements, 0);
    } else {
      outData = obj;
    }
    let bitnum = (this.dataBitOffset + Math.imul(((x - this.minX) | 0), this.pixelBitStride)) | 0;
    let element = (this.data[(Math.imul(((y - this.minY) | 0), this.scanlineStride) + (bitnum >> 3)) | 0]) & 255;
    let shift = (this.shiftOffset - (bitnum & 7)) | 0;
    outData[0] = ((((element >> shift) & this.bitMask)) << 24) >> 24;
    return outData;
  }
  /**
   * Returns the pixel data for the specified rectangle of pixels in a
   * primitive array of type TransferType.
   * For image data supported by the Java 2D API, this
   * will be one of DataBuffer.TYPE_BYTE, DataBuffer.TYPE_USHORT, or
   * DataBuffer.TYPE_INT.  Data may be returned in a packed format,
   * thus increasing efficiency for data transfers.
   *
   * An ArrayIndexOutOfBoundsException may be thrown
   * if the coordinates are not in bounds.
   * A ClassCastException will be thrown if the input object is non null
   * and references anything other than an array of TransferType.
   * @see java.awt.image.SampleModel#getDataElements(int, int, int, int, Object, DataBuffer)
   * @param x        The X coordinate of the upper left pixel location.
   * @param y        The Y coordinate of the upper left pixel location.
   * @param w        Width of the pixel rectangle.
   * @param h        Height of the pixel rectangle.
   * @param outData  An object reference to an array of type defined by
   *                 getTransferType() and length w*h*getNumDataElements().
   *                 If null, an array of appropriate type and size will be
   *                 allocated.
   * @return         An object reference to an array of type defined by
   *                 getTransferType() with the requested pixel data.
   */
  getDataElements$int$int$int$int$Object(x: number, y: number, w: number, h: number, outData: any): any {
    return this.getByteData$int$int$int$int$byteArr(x, y, w, h, outData);
  }
  /**
   * Returns a byte array containing the specified data elements
   * from the data array.
   * An ArrayIndexOutOfBounds exception will be thrown at runtime
   * if the pixel coordinates are out of bounds.
   * <pre>
   *       byte[] byteData = raster.getByteData(x, y, w, h, null);
   *       byte pixel;
   *       // To find a data element at location (x2, y2)
   *       pixel = byteData[((y2-y)*w + (x2-x))];
   * </pre>
   * @param x        The X coordinate of the upper left pixel location.
   * @param y        The Y coordinate of the upper left pixel location.
   * @param w        Width of the pixel rectangle.
   * @param h        Height of the pixel rectangle.
   * @param outData  If non-null, data elements
   *                 at the specified locations are returned in this array.
   * @return         Byte array with data elements.
   */
  getByteData$int$int$int$int$byteArr(x: number, y: number, w: number, h: number, outData: number[]): number[] {
    if ((x < this.minX) || (y < this.minY) || (((x + w) | 0) > this.maxX) || (((y + h) | 0) > this.maxY)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    if (outData == null) {
      outData = $J.newArray(Math.imul(w, h), 0);
    }
    let pixbits = this.pixelBitStride;
    let scanbit = (this.dataBitOffset + Math.imul(((x - this.minX) | 0), pixbits)) | 0;
    let index = Math.imul(((y - this.minY) | 0), this.scanlineStride);
    let outindex = 0;
    let data = this.data;
    for (let j = 0; j < h; j++) {
      let bitnum = scanbit;
      let element: number;
      let i = 0;
      while ((i < w) && ((bitnum & 7) !== 0)) {
        let shift = (this.shiftOffset - (bitnum & 7)) | 0;
        outData[outindex++] = (((this.bitMask & ((data[(index + (bitnum >> 3)) | 0]) >> shift))) << 24) >> 24;
        bitnum = (bitnum + pixbits) | 0;
        i++;
      }
      let inIndex = (index + (bitnum >> 3)) | 0;
      switch (pixbits) {
        case 1:
          for (; i < ((w - 7) | 0); i = (i + 8) | 0) {
            element = data[inIndex++];
            outData[outindex++] = ((((element >> 7) & 1)) << 24) >> 24;
            outData[outindex++] = ((((element >> 6) & 1)) << 24) >> 24;
            outData[outindex++] = ((((element >> 5) & 1)) << 24) >> 24;
            outData[outindex++] = ((((element >> 4) & 1)) << 24) >> 24;
            outData[outindex++] = ((((element >> 3) & 1)) << 24) >> 24;
            outData[outindex++] = ((((element >> 2) & 1)) << 24) >> 24;
            outData[outindex++] = ((((element >> 1) & 1)) << 24) >> 24;
            outData[outindex++] = (((element & 1)) << 24) >> 24;
            bitnum = (bitnum + 8) | 0;
          }
          break;
        case 2:
          for (; i < ((w - 7) | 0); i = (i + 8) | 0) {
            element = data[inIndex++];
            outData[outindex++] = ((((element >> 6) & 3)) << 24) >> 24;
            outData[outindex++] = ((((element >> 4) & 3)) << 24) >> 24;
            outData[outindex++] = ((((element >> 2) & 3)) << 24) >> 24;
            outData[outindex++] = (((element & 3)) << 24) >> 24;
            element = data[inIndex++];
            outData[outindex++] = ((((element >> 6) & 3)) << 24) >> 24;
            outData[outindex++] = ((((element >> 4) & 3)) << 24) >> 24;
            outData[outindex++] = ((((element >> 2) & 3)) << 24) >> 24;
            outData[outindex++] = (((element & 3)) << 24) >> 24;
            bitnum = (bitnum + 16) | 0;
          }
          break;
        case 4:
          for (; i < ((w - 7) | 0); i = (i + 8) | 0) {
            element = data[inIndex++];
            outData[outindex++] = ((((element >> 4) & 15)) << 24) >> 24;
            outData[outindex++] = (((element & 15)) << 24) >> 24;
            element = data[inIndex++];
            outData[outindex++] = ((((element >> 4) & 15)) << 24) >> 24;
            outData[outindex++] = (((element & 15)) << 24) >> 24;
            element = data[inIndex++];
            outData[outindex++] = ((((element >> 4) & 15)) << 24) >> 24;
            outData[outindex++] = (((element & 15)) << 24) >> 24;
            element = data[inIndex++];
            outData[outindex++] = ((((element >> 4) & 15)) << 24) >> 24;
            outData[outindex++] = (((element & 15)) << 24) >> 24;
            bitnum = (bitnum + 32) | 0;
          }
          break;
      }
      for (; i < w; i++) {
        let shift = (this.shiftOffset - (bitnum & 7)) | 0;
        outData[outindex++] = (((this.bitMask & ((data[(index + (bitnum >> 3)) | 0]) >> shift))) << 24) >> 24;
        bitnum = (bitnum + pixbits) | 0;
      }
      index = (index + this.scanlineStride) | 0;
    }
    return outData;
  }
  /**
   * Stores the data elements at the specified location.
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
    if ((x < this.minX) || (y < this.minY) || (x >= this.maxX) || (y >= this.maxY)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let inData = obj;
    let bitnum = (this.dataBitOffset + Math.imul(((x - this.minX) | 0), this.pixelBitStride)) | 0;
    let index = (Math.imul(((y - this.minY) | 0), this.scanlineStride) + (bitnum >> 3)) | 0;
    let shift = (this.shiftOffset - (bitnum & 7)) | 0;
    let element = this.data[index];
    element = ((element & ~(this.bitMask << shift)) << 24) >> 24;
    element = ((element | (inData[0] & this.bitMask) << shift) << 24) >> 24;
    this.data[index] = element;
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
   * at location (x2, y2) would be found at:
   * <pre>
   *      inData[((y2-y)*w + (x2-x))]
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
    this.putByteData$int$int$int$int$byteArr(x, y, w, h, obj);
  }
  /**
   * Stores a byte array of data elements into the specified rectangular
   * region.
   * An ArrayIndexOutOfBounds exception will be thrown at runtime
   * if the pixel coordinates are out of bounds.
   * The data elements in the
   * data array are assumed to be packed.  That is, a data element
   * at location (x2, y2) would be found at:
   * <pre>
   *      inData[((y2-y)*w + (x2-x))]
   * </pre>
   * @param x        The X coordinate of the upper left pixel location.
   * @param y        The Y coordinate of the upper left pixel location.
   * @param w        Width of the pixel rectangle.
   * @param h        Height of the pixel rectangle.
   * @param inData   The data elements to be stored.
   */
  putByteData$int$int$int$int$byteArr(x: number, y: number, w: number, h: number, inData: number[]): void {
    if ((x < this.minX) || (y < this.minY) || (((x + w) | 0) > this.maxX) || (((y + h) | 0) > this.maxY)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    if (w === 0 || h === 0) {
      return;
    }
    let pixbits = this.pixelBitStride;
    let scanbit = (this.dataBitOffset + Math.imul(((x - this.minX) | 0), pixbits)) | 0;
    let index = Math.imul(((y - this.minY) | 0), this.scanlineStride);
    let outindex = 0;
    let data = this.data;
    for (let j = 0; j < h; j++) {
      let bitnum = scanbit;
      let element: number;
      let i = 0;
      while ((i < w) && ((bitnum & 7) !== 0)) {
        let shift = (this.shiftOffset - (bitnum & 7)) | 0;
        element = data[(index + (bitnum >> 3)) | 0];
        element &= ~(this.bitMask << shift);
        element |= (inData[outindex++] & this.bitMask) << shift;
        (data[(index + (bitnum >> 3)) | 0]) = ((element) << 24) >> 24;
        bitnum = (bitnum + pixbits) | 0;
        i++;
      }
      let inIndex = (index + (bitnum >> 3)) | 0;
      switch (pixbits) {
        case 1:
          for (; i < ((w - 7) | 0); i = (i + 8) | 0) {
            element = (inData[outindex++] & 1) << 7;
            element |= (inData[outindex++] & 1) << 6;
            element |= (inData[outindex++] & 1) << 5;
            element |= (inData[outindex++] & 1) << 4;
            element |= (inData[outindex++] & 1) << 3;
            element |= (inData[outindex++] & 1) << 2;
            element |= (inData[outindex++] & 1) << 1;
            element |= (inData[outindex++] & 1);
            data[inIndex++] = ((element) << 24) >> 24;
            bitnum = (bitnum + 8) | 0;
          }
          break;
        case 2:
          for (; i < ((w - 7) | 0); i = (i + 8) | 0) {
            element = (inData[outindex++] & 3) << 6;
            element |= (inData[outindex++] & 3) << 4;
            element |= (inData[outindex++] & 3) << 2;
            element |= (inData[outindex++] & 3);
            data[inIndex++] = ((element) << 24) >> 24;
            element = (inData[outindex++] & 3) << 6;
            element |= (inData[outindex++] & 3) << 4;
            element |= (inData[outindex++] & 3) << 2;
            element |= (inData[outindex++] & 3);
            data[inIndex++] = ((element) << 24) >> 24;
            bitnum = (bitnum + 16) | 0;
          }
          break;
        case 4:
          for (; i < ((w - 7) | 0); i = (i + 8) | 0) {
            element = (inData[outindex++] & 15) << 4;
            element |= (inData[outindex++] & 15);
            data[inIndex++] = ((element) << 24) >> 24;
            element = (inData[outindex++] & 15) << 4;
            element |= (inData[outindex++] & 15);
            data[inIndex++] = ((element) << 24) >> 24;
            element = (inData[outindex++] & 15) << 4;
            element |= (inData[outindex++] & 15);
            data[inIndex++] = ((element) << 24) >> 24;
            element = (inData[outindex++] & 15) << 4;
            element |= (inData[outindex++] & 15);
            data[inIndex++] = ((element) << 24) >> 24;
            bitnum = (bitnum + 32) | 0;
          }
          break;
      }
      for (; i < w; i++) {
        let shift = (this.shiftOffset - (bitnum & 7)) | 0;
        element = data[(index + (bitnum >> 3)) | 0];
        element &= ~(this.bitMask << shift);
        element |= (inData[outindex++] & this.bitMask) << shift;
        (data[(index + (bitnum >> 3)) | 0]) = ((element) << 24) >> 24;
        bitnum = (bitnum + pixbits) | 0;
      }
      index = (index + this.scanlineStride) | 0;
    }
    this.markDirty();
  }
  /**
   * Creates a raster with the same layout but using a different
   * width and height, and with new zeroed data arrays.
   */
  createCompatibleWritableRaster$int$int(w: number, h: number): WritableRaster {
    if (w <= 0 || h <= 0) {
      throw new RasterFormatException()._RasterFormatException('negative ' + ((w <= 0) ? 'width' : 'height'));
    }
    let sm = this.sampleModel.createCompatibleSampleModel(w, h);
    return new BytePackedRaster()._BytePackedRaster$SampleModel$Point(sm, new Point()._Point$int$int(0, 0));
  }
  /**
   * Creates a raster with the same layout and the same
   * width and height, and with new zeroed data arrays.
   */
  createCompatibleWritableRaster$(): WritableRaster {
    return this.createCompatibleWritableRaster$int$int(this.width_, this.height_);
  }
  /**
   * Verify that the layout parameters are consistent with
   * the data.  If strictCheck
   * is false, this method will check for ArrayIndexOutOfBounds conditions.
   * If strictCheck is true, this method will check for additional error
   * conditions such as line wraparound (width of a line greater than
   * the scanline stride).
   * @return   String   Error string, if the layout is incompatible with
   *                    the data.  Otherwise returns null.
   */
  verify(strictCheck: boolean): void {
    if (this.dataBitOffset < 0) {
      throw new RasterFormatException()._RasterFormatException('Data offsets must be >= 0');
    }
    if (this.width_ <= 0 || this.height_ <= 0 || this.height_ > ($J.idiv(2147483647, this.width_))) {
      throw new RasterFormatException()._RasterFormatException('Invalid raster dimension');
    }
    if (((this.width_ - 1) | 0) > $J.idiv(2147483647, this.pixelBitStride)) {
      throw new RasterFormatException()._RasterFormatException('Invalid raster dimension');
    }
    if (this.minX - this.sampleModelTranslateX < 0 || this.minY - this.sampleModelTranslateY < 0) {
      throw new RasterFormatException()._RasterFormatException('Incorrect origin/translate: (' + this.minX + ', ' + this.minY + ') / (' + this.sampleModelTranslateX + ', ' + this.sampleModelTranslateY + ')');
    }
    if (this.scanlineStride < 0 || this.scanlineStride > ($J.idiv(2147483647, this.height_))) {
      throw new RasterFormatException()._RasterFormatException('Invalid scanline stride');
    }
    if (this.height_ > 1 || ((this.minY - this.sampleModelTranslateY) | 0) > 0) {
      if (this.scanlineStride > this.data.length) {
        throw new RasterFormatException()._RasterFormatException('Incorrect scanline stride: ' + this.scanlineStride);
      }
    }
    let lastbit = this.dataBitOffset + ((this.height_ - 1) | 0) * this.scanlineStride * 8 + ((this.width_ - 1) | 0) * this.pixelBitStride + this.pixelBitStride - 1;
    if (lastbit < 0 || $J.ldiv(lastbit, 8) >= this.data.length) {
      throw new RasterFormatException()._RasterFormatException('raster dimensions overflow array bounds');
    }
    if (strictCheck) {
      if (this.height_ > 1) {
        lastbit = (Math.imul(this.width_, this.pixelBitStride) - 1) | 0;
        if ($J.ldiv(lastbit, 8) >= this.scanlineStride) {
          throw new RasterFormatException()._RasterFormatException('data for adjacent scanlines overlaps');
        }
      }
    }
  }
  toString(): string {
    return 'BytePackedRaster: width = ' + this.width_ + ' height = ' + this.height_ + ' #channels ' + this.numBands + ' xOff = ' + this.sampleModelTranslateX + ' yOff = ' + this.sampleModelTranslateY;
  }
  static $clinit() {
    NativeLibLoader.loadLibraries();
    BytePackedRaster.initIDs();
  }
}

$J.define(BytePackedRaster, 'sun.awt.image.BytePackedRaster', { kind: 'class', sup: 'sun.awt.image.SunWritableRaster', ctors: { 'java.awt.image.SampleModel,java.awt.image.DataBufferByte,java.awt.Rectangle,java.awt.Point,sun.awt.image.BytePackedRaster': '_BytePackedRaster$SampleModel$DataBufferByte$Rectangle$Point$BytePackedRaster', 'java.awt.image.SampleModel,java.awt.image.DataBufferByte,java.awt.Point': '_BytePackedRaster$SampleModel$DataBufferByte$Point', 'java.awt.image.SampleModel,java.awt.Point': '_BytePackedRaster$SampleModel$Point' }, meths: { 'createCompatibleWritableRaster()': 'createCompatibleWritableRaster$', 'createCompatibleWritableRaster(int,int)': 'createCompatibleWritableRaster$int$int', 'setPixels(int,int,int,int,int[])': 'setPixels$int$int$int$int$intArr', 'getPixels(int,int,int,int,int[])': 'getPixels$int$int$int$int$intArr', 'putByteData(int,int,int,int,byte[])': 'putByteData$int$int$int$int$byteArr', 'putByteData(int,int,int,int,int,byte[])': 'putByteData$int$int$int$int$int$byteArr', 'setDataElements(int,int,int,int,java.lang.Object)': 'setDataElements$int$int$int$int$Object', 'setRect(int,int,java.awt.image.Raster)': 'setRect$int$int$Raster', 'setDataElements(int,int,int,int,int,int,sun.awt.image.BytePackedRaster)': 'setDataElements$int$int$int$int$int$int$BytePackedRaster$BytePackedRaster', 'setDataElements(int,int,java.awt.image.Raster)': 'setDataElements$int$int$Raster', 'setDataElements(int,int,java.lang.Object)': 'setDataElements$int$int$Object', 'getByteData(int,int,int,int,byte[])': 'getByteData$int$int$int$int$byteArr', 'getByteData(int,int,int,int,int,byte[])': 'getByteData$int$int$int$int$int$byteArr', 'getDataElements(int,int,int,int,java.lang.Object)': 'getDataElements$int$int$int$int$Object', 'getDataElements(int,int,java.lang.Object)': 'getDataElements$int$int$Object' }, clinit: true, lazy: [] });
$J.module(() => {
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  MultiPixelPackedSampleModel = $J.load('java.awt.image.MultiPixelPackedSampleModel');
  RasterFormatException = $J.load('java.awt.image.RasterFormatException');
  IntegerComponentRaster = $J.load('sun.awt.image.IntegerComponentRaster');
});
