// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/SinglePixelPackedSampleModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayIndexOutOfBoundsException, Arrays, IllegalArgumentException } from '../../../../jre/index.ts';
import { SampleModel } from './SampleModel.ts';

let ColorModel, DataBuffer, DataBufferByte, DataBufferInt, DataBufferUShort;

/**
 * This class represents pixel data packed such that the N samples which make
 *  up a single pixel are stored in a single data array element, and each data
 *  data array element holds samples for only one pixel.
 *  This class supports
 *  {@link DataBuffer#TYPE_BYTE TYPE_BYTE},
 *  {@link DataBuffer#TYPE_USHORT TYPE_USHORT},
 *  {@link DataBuffer#TYPE_INT TYPE_INT} data types.
 *  All data array elements reside
 *  in the first bank of a DataBuffer.  Accessor methods are provided so
 *  that the image data can be manipulated directly. Scanline stride is the
 *  number of data array elements between a given sample and the corresponding
 *  sample in the same column of the next scanline. Bit masks are the masks
 *  required to extract the samples representing the bands of the pixel.
 *  Bit offsets are the offsets in bits into the data array
 *  element of the samples representing the bands of the pixel.
 * <p>
 * The following code illustrates extracting the bits of the sample
 * representing band {@code b} for pixel {@code x,y}
 * from DataBuffer {@code data}:
 * <pre>{@code
 *      int sample = data.getElem(y * scanlineStride + x);
 *      sample = (sample & bitMasks[b]) >>> bitOffsets[b];
 * }</pre>
 */
export class SinglePixelPackedSampleModel extends SampleModel {
  /**
   * Bit masks for all bands of the image data.
   */
  bitMasks: number[] = null;
  /**
   * Bit Offsets for all bands of the image data.
   */
  bitOffsets: number[] = null;
  /**
   * Bit sizes for all the bands of the image data.
   */
  bitSizes: number[] = null;
  /**
   * Maximum bit size.
   */
  maxBitSize: number = 0;
  /**
   * Line stride of the region of image data described by this
   *  SinglePixelPackedSampleModel.
   */
  scanlineStride: number = 0;
  /**
   * Constructs a SinglePixelPackedSampleModel with bitMasks.length bands.
   * Each sample is stored in a data array element in the position of
   * its corresponding bit mask.  Each bit mask must be contiguous and
   * masks must not overlap. Bit masks exceeding data type capacity are
   * truncated.
   * @param dataType  The data type for storing samples.
   * @param w         The width (in pixels) of the region of the
   *                  image data described.
   * @param h         The height (in pixels) of the region of the
   *                  image data described.
   * @param bitMasks  The bit masks for all bands.
   * @throws IllegalArgumentException if {@code dataType} is not
   *         either {@code DataBuffer.TYPE_BYTE},
   *         {@code DataBuffer.TYPE_USHORT}, or
   *         {@code DataBuffer.TYPE_INT}
   */
  _SinglePixelPackedSampleModel$int$int$int$intArr(dataType: number, w: number, h: number, bitMasks: number[]): this {
    this._SinglePixelPackedSampleModel$int$int$int$int$intArr(dataType, w, h, w, bitMasks);
    if (dataType !== DataBuffer.TYPE_BYTE && dataType !== DataBuffer.TYPE_USHORT && dataType !== DataBuffer.TYPE_INT) {
      throw new IllegalArgumentException('Unsupported data type ' + dataType);
    }
    return this;
  }
  /**
   * Constructs a SinglePixelPackedSampleModel with bitMasks.length bands
   * and a scanline stride equal to scanlineStride data array elements.
   * Each sample is stored in a data array element in the position of
   * its corresponding bit mask.  Each bit mask must be contiguous and
   * masks must not overlap. Bit masks exceeding data type capacity are
   * truncated.
   * @param dataType  The data type for storing samples.
   * @param w         The width (in pixels) of the region of
   *                  image data described.
   * @param h         The height (in pixels) of the region of
   *                  image data described.
   * @param scanlineStride The line stride of the image data.
   * @param bitMasks The bit masks for all bands.
   * @throws IllegalArgumentException if {@code w} or
   *         {@code h} is not greater than 0
   * @throws IllegalArgumentException if any mask in
   *         {@code bitMask} is not contiguous
   * @throws IllegalArgumentException if {@code dataType} is not
   *         either {@code DataBuffer.TYPE_BYTE},
   *         {@code DataBuffer.TYPE_USHORT}, or
   *         {@code DataBuffer.TYPE_INT}
   */
  _SinglePixelPackedSampleModel$int$int$int$int$intArr(dataType: number, w: number, h: number, scanlineStride: number, bitMasks: number[]): this {
    this._SampleModel(dataType, w, h, bitMasks.length);
    if (dataType !== DataBuffer.TYPE_BYTE && dataType !== DataBuffer.TYPE_USHORT && dataType !== DataBuffer.TYPE_INT) {
      throw new IllegalArgumentException('Unsupported data type ' + dataType);
    }
    this.dataType = dataType;
    this.bitMasks = bitMasks.slice();
    this.scanlineStride = scanlineStride;
    this.bitOffsets = $J.newArray(this.numBands, 0);
    this.bitSizes = $J.newArray(this.numBands, 0);
    let maxMask = ((($J.lshl(1, DataBuffer.getDataTypeSize(dataType))) - 1)) | 0;
    this.maxBitSize = 0;
    for (let i = 0; i < this.numBands; i++) {
      let bitOffset = 0;
      let bitSize = 0;
      let mask: number;
      this.bitMasks[i] &= maxMask;
      mask = this.bitMasks[i];
      if (mask !== 0) {
        while ((mask & 1) === 0) {
          mask = mask >>> 1;
          bitOffset++;
        }
        while ((mask & 1) === 1) {
          mask = mask >>> 1;
          bitSize++;
        }
        if (mask !== 0) {
          throw new IllegalArgumentException('Mask ' + bitMasks[i] + ' must be contiguous');
        }
      }
      this.bitOffsets[i] = bitOffset;
      this.bitSizes[i] = bitSize;
      if (bitSize > this.maxBitSize) {
        this.maxBitSize = bitSize;
      }
    }
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.image.SinglePixelPackedSampleModel', 'initIDs', this, $a);
  }
  /**
   * Returns the number of data elements needed to transfer one pixel
   * via the getDataElements and setDataElements methods.
   * For a SinglePixelPackedSampleModel, this is one.
   */
  getNumDataElements(): number {
    return 1;
  }
  /**
   * Returns the size of the buffer (in data array elements)
   * needed for a data buffer that matches this
   * SinglePixelPackedSampleModel.
   */
  getBufferSize(): number {
    let size = (Math.imul(this.scanlineStride, ((this.height_ - 1) | 0)) + this.width_) | 0;
    return size;
  }
  /**
   * Creates a new SinglePixelPackedSampleModel with the specified
   * width and height.  The new SinglePixelPackedSampleModel will have the
   * same storage data type and bit masks as this
   * SinglePixelPackedSampleModel.
   * @param w the width of the resulting {@code SampleModel}
   * @param h the height of the resulting {@code SampleModel}
   * @return a {@code SinglePixelPackedSampleModel} with the
   *         specified width and height.
   * @throws IllegalArgumentException if {@code w} or
   *         {@code h} is not greater than 0
   */
  createCompatibleSampleModel(w: number, h: number): SampleModel {
    let sampleModel = new SinglePixelPackedSampleModel()._SinglePixelPackedSampleModel$int$int$int$intArr(this.dataType, w, h, this.bitMasks);
    return sampleModel;
  }
  /**
   * Creates a DataBuffer that corresponds to this
   * SinglePixelPackedSampleModel.  The DataBuffer's data type and size
   * will be consistent with this SinglePixelPackedSampleModel.  The
   * DataBuffer will have a single bank.
   */
  createDataBuffer(): DataBuffer {
    let dataBuffer = null;
    let size = (this.getBufferSize()) | 0;
    switch (this.dataType) {
      case DataBuffer.TYPE_BYTE:
        dataBuffer = new DataBufferByte()._DataBufferByte$int(size);
        break;
      case DataBuffer.TYPE_USHORT:
        dataBuffer = new DataBufferUShort()._DataBufferUShort$int(size);
        break;
      case DataBuffer.TYPE_INT:
        dataBuffer = new DataBufferInt()._DataBufferInt$int(size);
        break;
    }
    return dataBuffer;
  }
  /**
   * Returns the number of bits per sample for the specified band.
   */
  getSampleSize$int(band: number): number {
    return this.bitSizes[band];
  }
  /**
   * Returns the bit offsets into the data array element representing
   *  a pixel for all bands.
   *  @return the bit offsets representing a pixel for all bands.
   */
  getBitOffsets(): number[] {
    return this.bitOffsets.slice();
  }
  /**
   * Returns the bit masks for all bands.
   *  @return the bit masks for all bands.
   */
  getBitMasks(): number[] {
    return this.bitMasks.slice();
  }
  /**
   * Returns the scanline stride of this SinglePixelPackedSampleModel.
   *  @return the scanline stride of this
   *          {@code SinglePixelPackedSampleModel}.
   */
  getScanlineStride(): number {
    return this.scanlineStride;
  }
  /**
   * Returns data for a single pixel in a primitive array of type
   * TransferType.  For a SinglePixelPackedSampleModel, the array will
   * have one element, and the type will be the same as the storage
   * data type.  Generally, obj
   * should be passed in as null, so that the Object will be created
   * automatically and will be of the right primitive data type.
   * <p>
   * The following code illustrates transferring data for one pixel from
   * DataBuffer {@code db1}, whose storage layout is described by
   * SinglePixelPackedSampleModel {@code sppsm1}, to
   * DataBuffer {@code db2}, whose storage layout is described by
   * SinglePixelPackedSampleModel {@code sppsm2}.
   * The transfer will generally be more efficient than using
   * getPixel/setPixel.
   * <pre>
   *       SinglePixelPackedSampleModel sppsm1, sppsm2;
   *       DataBufferInt db1, db2;
   *       sppsm2.setDataElements(x, y, sppsm1.getDataElements(x, y, null,
   *                              db1), db2);
   * </pre>
   * Using getDataElements/setDataElements to transfer between two
   * DataBuffer/SampleModel pairs is legitimate if the SampleModels have
   * the same number of bands, corresponding bands have the same number of
   * bits per sample, and the TransferTypes are the same.
   * <p>
   * If obj is non-null, it should be a primitive array of type TransferType.
   * Otherwise, a ClassCastException is thrown.  An
   * ArrayIndexOutOfBoundsException may be thrown if the coordinates are
   * not in bounds, or if obj is non-null and is not large enough to hold
   * the pixel data.
   * @param x         The X coordinate of the pixel location.
   * @param y         The Y coordinate of the pixel location.
   * @param obj       If non-null, a primitive array in which to return
   *                  the pixel data.
   * @param data      The DataBuffer containing the image data.
   * @return the data for the specified pixel.
   * @see #setDataElements(int, int, Object, DataBuffer)
   */
  getDataElements$int$int$Object$DataBuffer(x: number, y: number, obj: any, data: DataBuffer): any {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let type$ = this.getTransferType();
    {
      let bdata: number[], sdata: number[], idata: number[];
      switch (type$) {
        case DataBuffer.TYPE_BYTE:
          if (obj == null) {
            bdata = $J.newArray(1, 0);
          } else {
            bdata = obj;
          }
          bdata[0] = ((data.getElem$int((Math.imul(y, this.scanlineStride) + x) | 0)) << 24) >> 24;
          obj = bdata;
          break;
        case DataBuffer.TYPE_USHORT:
          if (obj == null) {
            sdata = $J.newArray(1, 0);
          } else {
            sdata = obj;
          }
          sdata[0] = ((data.getElem$int((Math.imul(y, this.scanlineStride) + x) | 0)) << 16) >> 16;
          obj = sdata;
          break;
        case DataBuffer.TYPE_INT:
          if (obj == null) {
            idata = $J.newArray(1, 0);
          } else {
            idata = obj;
          }
          idata[0] = data.getElem$int((Math.imul(y, this.scanlineStride) + x) | 0);
          obj = idata;
          break;
      }
    }
    return obj;
  }
  /**
   * Returns all samples in for the specified pixel in an int array.
   * ArrayIndexOutOfBoundsException may be thrown if the coordinates are
   * not in bounds.
   * @param x         The X coordinate of the pixel location.
   * @param y         The Y coordinate of the pixel location.
   * @param iArray    If non-null, returns the samples in this array
   * @param data      The DataBuffer containing the image data.
   * @return all samples for the specified pixel.
   * @see #setPixel(int, int, int[], DataBuffer)
   */
  getPixel$int$int$intArr$DataBuffer(x: number, y: number, iArray: number[], data: DataBuffer): number[] {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let pixels: number[];
    if (iArray == null) {
      pixels = $J.newArray(this.numBands, 0);
    } else {
      pixels = iArray;
    }
    let value = data.getElem$int((Math.imul(y, this.scanlineStride) + x) | 0);
    for (let i = 0; i < this.numBands; i++) {
      pixels[i] = (value & this.bitMasks[i]) >>> this.bitOffsets[i];
    }
    return pixels;
  }
  /**
   * Returns as int the sample in a specified band for the pixel
   * located at (x,y).
   * ArrayIndexOutOfBoundsException may be thrown if the coordinates are
   * not in bounds.
   * @param x         The X coordinate of the pixel location.
   * @param y         The Y coordinate of the pixel location.
   * @param b         The band to return.
   * @param data      The DataBuffer containing the image data.
   * @return the sample in a specified band for the specified
   *         pixel.
   * @see #setSample(int, int, int, int, DataBuffer)
   */
  getSample(x: number, y: number, b: number, data: DataBuffer): number {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let sample = data.getElem$int((Math.imul(y, this.scanlineStride) + x) | 0);
    return ((sample & this.bitMasks[b]) >>> this.bitOffsets[b]);
  }
  /**
   * Returns the samples for a specified band for the specified rectangle
   * of pixels in an int array, one sample per array element.
   * ArrayIndexOutOfBoundsException may be thrown if the coordinates are
   * not in bounds.
   * @param x         The X coordinate of the upper left pixel location.
   * @param y         The Y coordinate of the upper left pixel location.
   * @param w         The width of the pixel rectangle.
   * @param h         The height of the pixel rectangle.
   * @param b         The band to return.
   * @param iArray    If non-null, returns the samples in this array.
   * @param data      The DataBuffer containing the image data.
   * @return the samples for the specified band for the specified
   *         region of pixels.
   * @see #setSamples(int, int, int, int, int, int[], DataBuffer)
   */
  getSamples$int$int$int$int$int$intArr$DataBuffer(x: number, y: number, w: number, h: number, b: number, iArray: number[], data: DataBuffer): number[] {
    if ((x < 0) || (y < 0) || (((x + w) | 0) > this.width_) || (((y + h) | 0) > this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let samples: number[];
    if (iArray != null) {
      samples = iArray;
    } else {
      samples = $J.newArray(Math.imul(w, h), 0);
    }
    let lineOffset = (Math.imul(y, this.scanlineStride) + x) | 0;
    let dstOffset = 0;
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        let value = data.getElem$int((lineOffset + j) | 0);
        samples[dstOffset++] = ((value & this.bitMasks[b]) >>> this.bitOffsets[b]);
      }
      lineOffset = (lineOffset + this.scanlineStride) | 0;
    }
    return samples;
  }
  /**
   * Sets the data for a single pixel in the specified DataBuffer from a
   * primitive array of type TransferType.  For a
   * SinglePixelPackedSampleModel, only the first element of the array
   * will hold valid data, and the type of the array must be the same as
   * the storage data type of the SinglePixelPackedSampleModel.
   * <p>
   * The following code illustrates transferring data for one pixel from
   * DataBuffer {@code db1}, whose storage layout is described by
   * SinglePixelPackedSampleModel {@code sppsm1},
   * to DataBuffer {@code db2}, whose storage layout is described by
   * SinglePixelPackedSampleModel {@code sppsm2}.
   * The transfer will generally be more efficient than using
   * getPixel/setPixel.
   * <pre>
   *       SinglePixelPackedSampleModel sppsm1, sppsm2;
   *       DataBufferInt db1, db2;
   *       sppsm2.setDataElements(x, y, sppsm1.getDataElements(x, y, null,
   *                              db1), db2);
   * </pre>
   * Using getDataElements/setDataElements to transfer between two
   * DataBuffer/SampleModel pairs is legitimate if the SampleModels have
   * the same number of bands, corresponding bands have the same number of
   * bits per sample, and the TransferTypes are the same.
   * <p>
   * obj must be a primitive array of type TransferType.  Otherwise,
   * a ClassCastException is thrown.  An
   * ArrayIndexOutOfBoundsException may be thrown if the coordinates are
   * not in bounds, or if obj is not large enough to hold the pixel data.
   * @param x         The X coordinate of the pixel location.
   * @param y         The Y coordinate of the pixel location.
   * @param obj       A primitive array containing pixel data.
   * @param data      The DataBuffer containing the image data.
   * @see #getDataElements(int, int, Object, DataBuffer)
   */
  setDataElements$int$int$Object$DataBuffer(x: number, y: number, obj: any, data: DataBuffer): void {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let type$ = this.getTransferType();
    {
      let barray: number[], sarray: number[], iarray: number[];
      switch (type$) {
        case DataBuffer.TYPE_BYTE:
          barray = obj;
          data.setElem$int$int((Math.imul(y, this.scanlineStride) + x) | 0, (barray[0]) & 255);
          break;
        case DataBuffer.TYPE_USHORT:
          sarray = obj;
          data.setElem$int$int((Math.imul(y, this.scanlineStride) + x) | 0, (sarray[0]) & 65535);
          break;
        case DataBuffer.TYPE_INT:
          iarray = obj;
          data.setElem$int$int((Math.imul(y, this.scanlineStride) + x) | 0, iarray[0]);
          break;
      }
    }
  }
  /**
   * Sets a pixel in the DataBuffer using an int array of samples for input.
   * ArrayIndexOutOfBoundsException may be thrown if the coordinates are
   * not in bounds.
   * @param x         The X coordinate of the pixel location.
   * @param y         The Y coordinate of the pixel location.
   * @param iArray    The input samples in an int array.
   * @param data      The DataBuffer containing the image data.
   * @see #getPixel(int, int, int[], DataBuffer)
   */
  setPixel$int$int$intArr$DataBuffer(x: number, y: number, iArray: number[], data: DataBuffer): void {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let lineOffset = (Math.imul(y, this.scanlineStride) + x) | 0;
    let value = data.getElem$int(lineOffset);
    for (let i = 0; i < this.numBands; i++) {
      value &= ~this.bitMasks[i];
      value |= ((iArray[i] << this.bitOffsets[i]) & this.bitMasks[i]);
    }
    data.setElem$int$int(lineOffset, value);
  }
  /**
   * Sets a sample in the specified band for the pixel located at (x,y)
   * in the DataBuffer using an int for input.
   * ArrayIndexOutOfBoundsException may be thrown if the coordinates are
   * not in bounds.
   * @param x         The X coordinate of the pixel location.
   * @param y         The Y coordinate of the pixel location.
   * @param b         The band to set.
   * @param s         The input sample as an int.
   * @param data      The DataBuffer containing the image data.
   * @see #getSample(int, int, int, DataBuffer)
   */
  setSample$int$int$int$int$DataBuffer(x: number, y: number, b: number, s: number, data: DataBuffer): void {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let value = data.getElem$int((Math.imul(y, this.scanlineStride) + x) | 0);
    value &= ~this.bitMasks[b];
    value |= (s << this.bitOffsets[b]) & this.bitMasks[b];
    data.setElem$int$int((Math.imul(y, this.scanlineStride) + x) | 0, value);
  }
  /**
   * Sets the samples in the specified band for the specified rectangle
   * of pixels from an int array containing one sample per array element.
   * ArrayIndexOutOfBoundsException may be thrown if the coordinates are
   * not in bounds.
   * @param x         The X coordinate of the upper left pixel location.
   * @param y         The Y coordinate of the upper left pixel location.
   * @param w         The width of the pixel rectangle.
   * @param h         The height of the pixel rectangle.
   * @param b         The band to set.
   * @param iArray    The input samples in an int array.
   * @param data      The DataBuffer containing the image data.
   * @see #getSamples(int, int, int, int, int, int[], DataBuffer)
   */
  setSamples$int$int$int$int$int$intArr$DataBuffer(x: number, y: number, w: number, h: number, b: number, iArray: number[], data: DataBuffer): void {
    if ((x < 0) || (y < 0) || (((x + w) | 0) > this.width_) || (((y + h) | 0) > this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let lineOffset = (Math.imul(y, this.scanlineStride) + x) | 0;
    let srcOffset = 0;
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        let value = data.getElem$int((lineOffset + j) | 0);
        value &= ~this.bitMasks[b];
        let sample = iArray[srcOffset++];
        value |= (sample << this.bitOffsets[b]) & this.bitMasks[b];
        data.setElem$int$int((lineOffset + j) | 0, value);
      }
      lineOffset = (lineOffset + this.scanlineStride) | 0;
    }
  }
  equals(o: any): boolean {
    var that;
    if (!((that = o) instanceof SinglePixelPackedSampleModel)) {
      return false;
    }
    return this.width_ === that.width_ && this.height_ === that.height_ && this.numBands === that.numBands && this.dataType === that.dataType && Arrays.equals(this.bitMasks, that.bitMasks) && Arrays.equals(this.bitOffsets, that.bitOffsets) && Arrays.equals(this.bitSizes, that.bitSizes) && this.maxBitSize === that.maxBitSize && this.scanlineStride === that.scanlineStride;
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
    for (let i = 0; i < this.bitMasks.length; i++) {
      hash ^= this.bitMasks[i];
      hash <<= 8;
    }
    for (let i = 0; i < this.bitOffsets.length; i++) {
      hash ^= this.bitOffsets[i];
      hash <<= 8;
    }
    for (let i = 0; i < this.bitSizes.length; i++) {
      hash ^= this.bitSizes[i];
      hash <<= 8;
    }
    hash ^= this.maxBitSize;
    hash <<= 8;
    hash ^= this.scanlineStride;
    return hash;
  }
  static $clinit() {
    ColorModel.loadLibraries();
    SinglePixelPackedSampleModel.initIDs();
  }
}

$J.define(SinglePixelPackedSampleModel, 'java.awt.image.SinglePixelPackedSampleModel', { kind: 'class', sup: 'java.awt.image.SampleModel', ctors: { 'int,int,int,int,int[]': '_SinglePixelPackedSampleModel$int$int$int$int$intArr', 'int,int,int,int[]': '_SinglePixelPackedSampleModel$int$int$int$intArr' }, meths: { 'setSamples(int,int,int,int,int,int[],java.awt.image.DataBuffer)': 'setSamples$int$int$int$int$int$intArr$DataBuffer', 'setSample(int,int,int,int,java.awt.image.DataBuffer)': 'setSample$int$int$int$int$DataBuffer', 'setPixels(int,int,int,int,int[],java.awt.image.DataBuffer)': 'setPixels$int$int$int$int$intArr$DataBuffer', 'setPixel(int,int,int[],java.awt.image.DataBuffer)': 'setPixel$int$int$intArr$DataBuffer', 'setDataElements(int,int,java.lang.Object,java.awt.image.DataBuffer)': 'setDataElements$int$int$Object$DataBuffer', 'getSamples(int,int,int,int,int,int[],java.awt.image.DataBuffer)': 'getSamples$int$int$int$int$int$intArr$DataBuffer', 'getPixels(int,int,int,int,int[],java.awt.image.DataBuffer)': 'getPixels$int$int$int$int$intArr$DataBuffer', 'getPixel(int,int,int[],java.awt.image.DataBuffer)': 'getPixel$int$int$intArr$DataBuffer', 'getDataElements(int,int,java.lang.Object,java.awt.image.DataBuffer)': 'getDataElements$int$int$Object$DataBuffer', 'getSampleSize(int)': 'getSampleSize$int', 'getSampleSize()': 'getSampleSize$' }, clinit: true, lazy: [] });
$J.module(() => {
  ColorModel = $J.load('java.awt.image.ColorModel');
  DataBuffer = $J.load('java.awt.image.DataBuffer');
  DataBufferByte = $J.load('java.awt.image.DataBufferByte');
  DataBufferInt = $J.load('java.awt.image.DataBufferInt');
  DataBufferUShort = $J.load('java.awt.image.DataBufferUShort');
});
