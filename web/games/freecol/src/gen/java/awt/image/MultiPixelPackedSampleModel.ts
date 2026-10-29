// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/MultiPixelPackedSampleModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayIndexOutOfBoundsException, IllegalArgumentException } from '../../../../jre/index.ts';
import { SampleModel } from './SampleModel.ts';

let DataBuffer, DataBufferByte, DataBufferInt, DataBufferUShort, RasterFormatException;

/**
 * The {@code MultiPixelPackedSampleModel} class represents
 * one-banded images and can pack multiple one-sample
 * pixels into one data element.  Pixels are not allowed to span data elements.
 * The data type can be DataBuffer.TYPE_BYTE, DataBuffer.TYPE_USHORT,
 * or DataBuffer.TYPE_INT.  Each pixel must be a power of 2 number of bits
 * and a power of 2 number of pixels must fit exactly in one data element.
 * Pixel bit stride is equal to the number of bits per pixel.  Scanline
 * stride is in data elements and the last several data elements might be
 * padded with unused pixels.  Data bit offset is the offset in bits from
 * the beginning of the {@link DataBuffer} to the first pixel and must be
 * a multiple of pixel bit stride.
 * <p>
 * The following code illustrates extracting the bits for pixel
 * <code>x,&nbsp;y</code> from {@code DataBuffer data}
 * and storing the pixel data in data elements of type
 * {@code dataType}:
 * <pre>{@code
 *      int dataElementSize = DataBuffer.getDataTypeSize(dataType);
 *      int bitnum = dataBitOffset + x*pixelBitStride;
 *      int element = data.getElem(y*scanlineStride + bitnum/dataElementSize);
 *      int shift = dataElementSize - (bitnum & (dataElementSize-1))
 *                  - pixelBitStride;
 *      int pixel = (element >> shift) & ((1 << pixelBitStride) - 1);
 * }</pre>
 */
export class MultiPixelPackedSampleModel extends SampleModel {
  /**
   * The number of bits from one pixel to the next.
   */
  pixelBitStride: number = 0;
  /**
   * Bitmask that extracts the rightmost pixel of a data element.
   */
  bitMask: number = 0;
  /**
   * The number of pixels that fit in a data element.  Also used
   * as the number of bits per pixel.
   */
  pixelsPerDataElement: number = 0;
  /**
   * The size of a data element in bits.
   */
  dataElementSize: number = 0;
  /**
   * The bit offset into the data array where the first pixel begins.
   */
  dataBitOffset: number = 0;
  /**
   * ScanlineStride of the data buffer described in data array elements.
   */
  scanlineStride: number = 0;
  /**
   * Constructs a {@code MultiPixelPackedSampleModel} with the
   * specified data type, width, height and number of bits per pixel.
   * @param dataType  the data type for storing samples
   * @param w         the width, in pixels, of the region of
   *                  image data described
   * @param h         the height, in pixels, of the region of
   *                  image data described
   * @param numberOfBits the number of bits per pixel
   * @throws IllegalArgumentException if {@code dataType} is not
   *         either {@code DataBuffer.TYPE_BYTE},
   *         {@code DataBuffer.TYPE_USHORT}, or
   *         {@code DataBuffer.TYPE_INT}
   */
  _MultiPixelPackedSampleModel$int$int$int$int(dataType: number, w: number, h: number, numberOfBits: number): this {
    this._MultiPixelPackedSampleModel$int$int$int$int$int$int(dataType, w, h, numberOfBits, $J.idiv(((Math.imul(w, numberOfBits) + DataBuffer.getDataTypeSize(dataType) - 1) | 0), DataBuffer.getDataTypeSize(dataType)), 0);
    if (dataType !== DataBuffer.TYPE_BYTE && dataType !== DataBuffer.TYPE_USHORT && dataType !== DataBuffer.TYPE_INT) {
      throw new IllegalArgumentException('Unsupported data type ' + dataType);
    }
    return this;
  }
  /**
   * Constructs a {@code MultiPixelPackedSampleModel} with
   * specified data type, width, height, number of bits per pixel,
   * scanline stride and data bit offset.
   * @param dataType  the data type for storing samples
   * @param w         the width, in pixels, of the region of
   *                  image data described
   * @param h         the height, in pixels, of the region of
   *                  image data described
   * @param numberOfBits the number of bits per pixel
   * @param scanlineStride the line stride of the image data
   * @param dataBitOffset the data bit offset for the region of image
   *                  data described
   * @throws RasterFormatException if the number of bits per pixel
   *                  is not a power of 2 or if a power of 2 number of
   *                  pixels do not fit in one data element.
   * @throws IllegalArgumentException if {@code w} or
   *         {@code h} is not greater than 0
   * @throws IllegalArgumentException if {@code dataType} is not
   *         either {@code DataBuffer.TYPE_BYTE},
   *         {@code DataBuffer.TYPE_USHORT}, or
   *         {@code DataBuffer.TYPE_INT}
   */
  _MultiPixelPackedSampleModel$int$int$int$int$int$int(dataType: number, w: number, h: number, numberOfBits: number, scanlineStride: number, dataBitOffset: number): this {
    this._SampleModel(dataType, w, h, 1);
    if (dataType !== DataBuffer.TYPE_BYTE && dataType !== DataBuffer.TYPE_USHORT && dataType !== DataBuffer.TYPE_INT) {
      throw new IllegalArgumentException('Unsupported data type ' + dataType);
    }
    this.dataType = dataType;
    this.pixelBitStride = numberOfBits;
    this.scanlineStride = scanlineStride;
    this.dataBitOffset = dataBitOffset;
    this.dataElementSize = DataBuffer.getDataTypeSize(dataType);
    this.pixelsPerDataElement = $J.idiv(this.dataElementSize, numberOfBits);
    if (Math.imul(this.pixelsPerDataElement, numberOfBits) !== this.dataElementSize) {
      throw new RasterFormatException()._RasterFormatException('MultiPixelPackedSampleModel does not allow pixels to span data element boundaries');
    }
    this.bitMask = ((1 << numberOfBits) - 1) | 0;
    return this;
  }
  /**
   * Creates a new {@code MultiPixelPackedSampleModel} with the
   * specified width and height.  The new
   * {@code MultiPixelPackedSampleModel} has the
   * same storage data type and number of bits per pixel as this
   * {@code MultiPixelPackedSampleModel}.
   * @param w the specified width
   * @param h the specified height
   * @return a {@link SampleModel} with the specified width and height
   * and with the same storage data type and number of bits per pixel
   * as this {@code MultiPixelPackedSampleModel}.
   * @throws IllegalArgumentException if {@code w} or
   *         {@code h} is not greater than 0
   */
  createCompatibleSampleModel(w: number, h: number): SampleModel {
    let sampleModel = new MultiPixelPackedSampleModel()._MultiPixelPackedSampleModel$int$int$int$int(this.dataType, w, h, this.pixelBitStride);
    return sampleModel;
  }
  /**
   * Creates a {@code DataBuffer} that corresponds to this
   * {@code MultiPixelPackedSampleModel}.  The
   * {@code DataBuffer} object's data type and size
   * is consistent with this {@code MultiPixelPackedSampleModel}.
   * The {@code DataBuffer} has a single bank.
   * @return a {@code DataBuffer} with the same data type and
   * size as this {@code MultiPixelPackedSampleModel}.
   */
  createDataBuffer(): DataBuffer {
    let dataBuffer = null;
    let size = Math.imul(this.scanlineStride, this.height_);
    switch (this.dataType) {
      case DataBuffer.TYPE_BYTE:
        dataBuffer = new DataBufferByte()._DataBufferByte$int((size + $J.idiv(((this.dataBitOffset + 7) | 0), 8)) | 0);
        break;
      case DataBuffer.TYPE_USHORT:
        dataBuffer = new DataBufferUShort()._DataBufferUShort$int((size + $J.idiv(((this.dataBitOffset + 15) | 0), 16)) | 0);
        break;
      case DataBuffer.TYPE_INT:
        dataBuffer = new DataBufferInt()._DataBufferInt$int((size + $J.idiv(((this.dataBitOffset + 31) | 0), 32)) | 0);
        break;
    }
    return dataBuffer;
  }
  /**
   * Returns the number of data elements needed to transfer one pixel
   * via the {@link #getDataElements} and {@link #setDataElements}
   * methods.  For a {@code MultiPixelPackedSampleModel}, this is
   * one.
   * @return the number of data elements.
   */
  getNumDataElements(): number {
    return 1;
  }
  /**
   * Returns the number of bits per sample for the specified band.
   * @param band the specified band
   * @return the number of bits per sample for the specified band.
   */
  getSampleSize$int(band: number): number {
    return this.pixelBitStride;
  }
  /**
   * Returns the scanline stride.
   * @return the scanline stride of this
   * {@code MultiPixelPackedSampleModel}.
   */
  getScanlineStride(): number {
    return this.scanlineStride;
  }
  /**
   * Returns the pixel bit stride in bits.  This value is the same as
   * the number of bits per pixel.
   * @return the {@code pixelBitStride} of this
   * {@code MultiPixelPackedSampleModel}.
   */
  getPixelBitStride(): number {
    return this.pixelBitStride;
  }
  /**
   * Returns the data bit offset in bits.
   * @return the {@code dataBitOffset} of this
   * {@code MultiPixelPackedSampleModel}.
   */
  getDataBitOffset(): number {
    return this.dataBitOffset;
  }
  /**
   * Returns the TransferType used to transfer pixels by way of the
   *  {@code getDataElements} and {@code setDataElements}
   *  methods. The TransferType might or might not be the same as the
   *  storage DataType.  The TransferType is one of
   *  DataBuffer.TYPE_BYTE, DataBuffer.TYPE_USHORT,
   *  or DataBuffer.TYPE_INT.
   *  @return the transfertype.
   */
  getTransferType(): number {
    if (this.pixelBitStride > 16) {
      return DataBuffer.TYPE_INT;
    } else if (this.pixelBitStride > 8) {
      return DataBuffer.TYPE_USHORT;
    } else {
      return DataBuffer.TYPE_BYTE;
    }
  }
  /**
   * Returns as {@code int} the sample in a specified band for the
   * pixel located at (x,&nbsp;y).  An
   * {@code ArrayIndexOutOfBoundsException} is thrown if the
   * coordinates are not in bounds.
   * @param x         the X coordinate of the specified pixel
   * @param y         the Y coordinate of the specified pixel
   * @param b         the band to return, which is assumed to be 0
   * @param data      the {@code DataBuffer} containing the image
   *                  data
   * @return the specified band containing the sample of the specified
   * pixel.
   * @throws ArrayIndexOutOfBoundsException if the specified
   *          coordinates are not in bounds.
   * @see #setSample(int, int, int, int, DataBuffer)
   */
  getSample(x: number, y: number, b: number, data: DataBuffer): number {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_) || (b !== 0)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let bitnum = (this.dataBitOffset + Math.imul(x, this.pixelBitStride)) | 0;
    let element = data.getElem$int((Math.imul(y, this.scanlineStride) + $J.idiv(bitnum, this.dataElementSize)) | 0);
    let shift = (this.dataElementSize - (bitnum & ((this.dataElementSize - 1) | 0)) - this.pixelBitStride) | 0;
    return (element >> shift) & this.bitMask;
  }
  /**
   * Sets a sample in the specified band for the pixel located at
   * (x,&nbsp;y) in the {@code DataBuffer} using an
   * {@code int} for input.
   * An {@code ArrayIndexOutOfBoundsException} is thrown if the
   * coordinates are not in bounds.
   * @param x the X coordinate of the specified pixel
   * @param y the Y coordinate of the specified pixel
   * @param b the band to return, which is assumed to be 0
   * @param s the input sample as an {@code int}
   * @param data the {@code DataBuffer} where image data is stored
   * @throws ArrayIndexOutOfBoundsException if the coordinates are
   * not in bounds.
   * @see #getSample(int, int, int, DataBuffer)
   */
  setSample$int$int$int$int$DataBuffer(x: number, y: number, b: number, s: number, data: DataBuffer): void {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_) || (b !== 0)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let bitnum = (this.dataBitOffset + Math.imul(x, this.pixelBitStride)) | 0;
    let index = (Math.imul(y, this.scanlineStride) + ($J.idiv(bitnum, this.dataElementSize))) | 0;
    let shift = (this.dataElementSize - (bitnum & ((this.dataElementSize - 1) | 0)) - this.pixelBitStride) | 0;
    let element = data.getElem$int(index);
    element &= ~(this.bitMask << shift);
    element |= (s & this.bitMask) << shift;
    data.setElem$int$int(index, element);
  }
  /**
   * Returns data for a single pixel in a primitive array of type
   * TransferType.  For a {@code MultiPixelPackedSampleModel},
   * the array has one element, and the type is the smallest of
   * DataBuffer.TYPE_BYTE, DataBuffer.TYPE_USHORT, or DataBuffer.TYPE_INT
   * that can hold a single pixel.  Generally, {@code obj}
   * should be passed in as {@code null}, so that the
   * {@code Object} is created automatically and is the
   * correct primitive data type.
   * <p>
   * The following code illustrates transferring data for one pixel from
   * {@code DataBuffer db1}, whose storage layout is
   * described by {@code MultiPixelPackedSampleModel}
   * {@code mppsm1}, to {@code DataBuffer db2},
   * whose storage layout is described by
   * {@code MultiPixelPackedSampleModel mppsm2}.
   * The transfer is generally more efficient than using
   * {@code getPixel} or {@code setPixel}.
   * <pre>
   *       MultiPixelPackedSampleModel mppsm1, mppsm2;
   *       DataBufferInt db1, db2;
   *       mppsm2.setDataElements(x, y, mppsm1.getDataElements(x, y, null,
   *                              db1), db2);
   * </pre>
   * Using {@code getDataElements} or {@code setDataElements}
   * to transfer between two {@code DataBuffer/SampleModel} pairs
   * is legitimate if the {@code SampleModels} have the same number
   * of bands, corresponding bands have the same number of
   * bits per sample, and the TransferTypes are the same.
   * <p>
   * If {@code obj} is not {@code null}, it should be a
   * primitive array of type TransferType.  Otherwise, a
   * {@code ClassCastException} is thrown.  An
   * {@code ArrayIndexOutOfBoundsException} is thrown if the
   * coordinates are not in bounds, or if {@code obj} is not
   * {@code null} and is not large enough to hold the pixel data.
   * @param x the X coordinate of the specified pixel
   * @param y the Y coordinate of the specified pixel
   * @param obj a primitive array in which to return the pixel data or
   *          {@code null}.
   * @param data the {@code DataBuffer} containing the image data.
   * @return an {@code Object} containing data for the specified
   *  pixel.
   * @throws ClassCastException if {@code obj} is not a
   *  primitive array of type TransferType or is not {@code null}
   * @throws ArrayIndexOutOfBoundsException if the coordinates are
   * not in bounds, or if {@code obj} is not {@code null} or
   * not large enough to hold the pixel data
   * @see #setDataElements(int, int, Object, DataBuffer)
   */
  getDataElements$int$int$Object$DataBuffer(x: number, y: number, obj: any, data: DataBuffer): any {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let type$ = this.getTransferType();
    let bitnum = (this.dataBitOffset + Math.imul(x, this.pixelBitStride)) | 0;
    let shift = (this.dataElementSize - (bitnum & ((this.dataElementSize - 1) | 0)) - this.pixelBitStride) | 0;
    let element = 0;
    {
      let bdata: number[], sdata: number[], idata: number[];
      switch (type$) {
        case DataBuffer.TYPE_BYTE:
          if (obj == null) {
            bdata = $J.newArray(1, 0);
          } else {
            bdata = obj;
          }
          element = data.getElem$int((Math.imul(y, this.scanlineStride) + $J.idiv(bitnum, this.dataElementSize)) | 0);
          bdata[0] = ((((element >> shift) & this.bitMask)) << 24) >> 24;
          obj = bdata;
          break;
        case DataBuffer.TYPE_USHORT:
          if (obj == null) {
            sdata = $J.newArray(1, 0);
          } else {
            sdata = obj;
          }
          element = data.getElem$int((Math.imul(y, this.scanlineStride) + $J.idiv(bitnum, this.dataElementSize)) | 0);
          sdata[0] = ((((element >> shift) & this.bitMask)) << 16) >> 16;
          obj = sdata;
          break;
        case DataBuffer.TYPE_INT:
          if (obj == null) {
            idata = $J.newArray(1, 0);
          } else {
            idata = obj;
          }
          element = data.getElem$int((Math.imul(y, this.scanlineStride) + $J.idiv(bitnum, this.dataElementSize)) | 0);
          idata[0] = (element >> shift) & this.bitMask;
          obj = idata;
          break;
      }
    }
    return obj;
  }
  /**
   * Returns the specified single band pixel in the first element
   * of an {@code int} array.
   * {@code ArrayIndexOutOfBoundsException} is thrown if the
   * coordinates are not in bounds.
   * @param x the X coordinate of the specified pixel
   * @param y the Y coordinate of the specified pixel
   * @param iArray the array containing the pixel to be returned or
   *  {@code null}
   * @param data the {@code DataBuffer} where image data is stored
   * @return an array containing the specified pixel.
   * @throws ArrayIndexOutOfBoundsException if the coordinates
   *  are not in bounds
   * @see #setPixel(int, int, int[], DataBuffer)
   */
  getPixel$int$int$intArr$DataBuffer(x: number, y: number, iArray: number[], data: DataBuffer): number[] {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let pixels: number[];
    if (iArray != null) {
      pixels = iArray;
    } else {
      pixels = $J.newArray(this.numBands, 0);
    }
    let bitnum = (this.dataBitOffset + Math.imul(x, this.pixelBitStride)) | 0;
    let element = data.getElem$int((Math.imul(y, this.scanlineStride) + $J.idiv(bitnum, this.dataElementSize)) | 0);
    let shift = (this.dataElementSize - (bitnum & ((this.dataElementSize - 1) | 0)) - this.pixelBitStride) | 0;
    pixels[0] = (element >> shift) & this.bitMask;
    return pixels;
  }
  /**
   * Sets the data for a single pixel in the specified
   * {@code DataBuffer} from a primitive array of type
   * TransferType.  For a {@code MultiPixelPackedSampleModel},
   * only the first element of the array holds valid data,
   * and the type must be the smallest of
   * DataBuffer.TYPE_BYTE, DataBuffer.TYPE_USHORT, or DataBuffer.TYPE_INT
   * that can hold a single pixel.
   * <p>
   * The following code illustrates transferring data for one pixel from
   * {@code DataBuffer db1}, whose storage layout is
   * described by {@code MultiPixelPackedSampleModel}
   * {@code mppsm1}, to {@code DataBuffer db2},
   * whose storage layout is described by
   * {@code MultiPixelPackedSampleModel mppsm2}.
   * The transfer is generally more efficient than using
   * {@code getPixel} or {@code setPixel}.
   * <pre>
   *       MultiPixelPackedSampleModel mppsm1, mppsm2;
   *       DataBufferInt db1, db2;
   *       mppsm2.setDataElements(x, y, mppsm1.getDataElements(x, y, null,
   *                              db1), db2);
   * </pre>
   * Using {@code getDataElements} or {@code setDataElements} to
   * transfer between two {@code DataBuffer/SampleModel} pairs is
   * legitimate if the {@code SampleModel} objects have
   * the same number of bands, corresponding bands have the same number of
   * bits per sample, and the TransferTypes are the same.
   * <p>
   * {@code obj} must be a primitive array of type TransferType.
   * Otherwise, a {@code ClassCastException} is thrown.  An
   * {@code ArrayIndexOutOfBoundsException} is thrown if the
   * coordinates are not in bounds, or if {@code obj} is not large
   * enough to hold the pixel data.
   * @param x the X coordinate of the pixel location
   * @param y the Y coordinate of the pixel location
   * @param obj a primitive array containing pixel data
   * @param data the {@code DataBuffer} containing the image data
   * @see #getDataElements(int, int, Object, DataBuffer)
   */
  setDataElements$int$int$Object$DataBuffer(x: number, y: number, obj: any, data: DataBuffer): void {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let type$ = this.getTransferType();
    let bitnum = (this.dataBitOffset + Math.imul(x, this.pixelBitStride)) | 0;
    let index = (Math.imul(y, this.scanlineStride) + ($J.idiv(bitnum, this.dataElementSize))) | 0;
    let shift = (this.dataElementSize - (bitnum & ((this.dataElementSize - 1) | 0)) - this.pixelBitStride) | 0;
    let element = data.getElem$int(index);
    element &= ~(this.bitMask << shift);
    {
      let barray: number[], sarray: number[], iarray: number[];
      switch (type$) {
        case DataBuffer.TYPE_BYTE:
          barray = obj;
          element |= (((barray[0]) & 255) & this.bitMask) << shift;
          data.setElem$int$int(index, element);
          break;
        case DataBuffer.TYPE_USHORT:
          sarray = obj;
          element |= (((sarray[0]) & 65535) & this.bitMask) << shift;
          data.setElem$int$int(index, element);
          break;
        case DataBuffer.TYPE_INT:
          iarray = obj;
          element |= (iarray[0] & this.bitMask) << shift;
          data.setElem$int$int(index, element);
          break;
      }
    }
  }
  /**
   * Sets a pixel in the {@code DataBuffer} using an
   * {@code int} array for input.
   * {@code ArrayIndexOutOfBoundsException} is thrown if
   * the coordinates are not in bounds.
   * @param x the X coordinate of the pixel location
   * @param y the Y coordinate of the pixel location
   * @param iArray the input pixel in an {@code int} array
   * @param data the {@code DataBuffer} containing the image data
   * @see #getPixel(int, int, int[], DataBuffer)
   */
  setPixel$int$int$intArr$DataBuffer(x: number, y: number, iArray: number[], data: DataBuffer): void {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let bitnum = (this.dataBitOffset + Math.imul(x, this.pixelBitStride)) | 0;
    let index = (Math.imul(y, this.scanlineStride) + ($J.idiv(bitnum, this.dataElementSize))) | 0;
    let shift = (this.dataElementSize - (bitnum & ((this.dataElementSize - 1) | 0)) - this.pixelBitStride) | 0;
    let element = data.getElem$int(index);
    element &= ~(this.bitMask << shift);
    element |= (iArray[0] & this.bitMask) << shift;
    data.setElem$int$int(index, element);
  }
  equals(o: any): boolean {
    var that;
    if (!((that = o) instanceof MultiPixelPackedSampleModel)) {
      return false;
    }
    return this.width_ === that.width_ && this.height_ === that.height_ && this.numBands === that.numBands && this.dataType === that.dataType && this.pixelBitStride === that.pixelBitStride && this.bitMask === that.bitMask && this.pixelsPerDataElement === that.pixelsPerDataElement && this.dataElementSize === that.dataElementSize && this.dataBitOffset === that.dataBitOffset && this.scanlineStride === that.scanlineStride;
  }
  hashCode(): number {
    let hash = 0;
    hash = this.width_;
    hash <<= 8;
    hash ^= this.height_;
    hash <<= 8;
    hash ^= this.numBands;
    hash <<= 8;
    hash ^= this.dataType;
    hash <<= 8;
    hash ^= this.pixelBitStride;
    hash <<= 8;
    hash ^= this.bitMask;
    hash <<= 8;
    hash ^= this.pixelsPerDataElement;
    hash <<= 8;
    hash ^= this.dataElementSize;
    hash <<= 8;
    hash ^= this.dataBitOffset;
    hash <<= 8;
    hash ^= this.scanlineStride;
    return hash;
  }
}

$J.define(MultiPixelPackedSampleModel, 'java.awt.image.MultiPixelPackedSampleModel', { kind: 'class', sup: 'java.awt.image.SampleModel', ctors: { 'int,int,int,int,int,int': '_MultiPixelPackedSampleModel$int$int$int$int$int$int', 'int,int,int,int': '_MultiPixelPackedSampleModel$int$int$int$int' }, meths: { 'setPixel(int,int,int[],java.awt.image.DataBuffer)': 'setPixel$int$int$intArr$DataBuffer', 'setDataElements(int,int,java.lang.Object,java.awt.image.DataBuffer)': 'setDataElements$int$int$Object$DataBuffer', 'getPixel(int,int,int[],java.awt.image.DataBuffer)': 'getPixel$int$int$intArr$DataBuffer', 'getDataElements(int,int,java.lang.Object,java.awt.image.DataBuffer)': 'getDataElements$int$int$Object$DataBuffer', 'setSample(int,int,int,int,java.awt.image.DataBuffer)': 'setSample$int$int$int$int$DataBuffer', 'getSampleSize(int)': 'getSampleSize$int', 'getSampleSize()': 'getSampleSize$' } });
$J.module(() => {
  DataBuffer = $J.load('java.awt.image.DataBuffer');
  DataBufferByte = $J.load('java.awt.image.DataBufferByte');
  DataBufferInt = $J.load('java.awt.image.DataBufferInt');
  DataBufferUShort = $J.load('java.awt.image.DataBufferUShort');
  RasterFormatException = $J.load('java.awt.image.RasterFormatException');
});
