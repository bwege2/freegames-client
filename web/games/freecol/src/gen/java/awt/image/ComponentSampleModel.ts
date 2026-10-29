// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/ComponentSampleModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2023, Oracle and/or its affiliates. All rights reserved.
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

let DataBuffer, DataBufferByte, DataBufferDouble, DataBufferFloat, DataBufferInt, DataBufferShort, DataBufferUShort;

/**
 * This class represents image data which is stored such that each sample
 *  of a pixel occupies one data element of the DataBuffer.  It stores the
 *  N samples which make up a pixel in N separate data array elements.
 *  Different bands may be in different banks of the DataBuffer.
 *  Accessor methods are provided so that image data can be manipulated
 *  directly. This class can support different kinds of interleaving, e.g.
 *  band interleaving, scanline interleaving, and pixel interleaving.
 *  Pixel stride is the number of data array elements between two samples
 *  for the same band on the same scanline. Scanline stride is the number
 *  of data array elements between a given sample and the corresponding sample
 *  in the same column of the next scanline.  Band offsets denote the number
 *  of data array elements from the first data array element of the bank
 *  of the DataBuffer holding each band to the first sample of the band.
 *  The bands are numbered from 0 to N-1.  This class can represent image
 *  data for which each sample is an unsigned integral number which can be
 *  stored in 8, 16, or 32 bits (using {@code DataBuffer.TYPE_BYTE},
 *  {@code DataBuffer.TYPE_USHORT}, or {@code DataBuffer.TYPE_INT},
 *  respectively), data for which each sample is a signed integral number
 *  which can be stored in 16 bits (using {@code DataBuffer.TYPE_SHORT}),
 *  or data for which each sample is a signed float or double quantity
 *  (using {@code DataBuffer.TYPE_FLOAT} or
 *  {@code DataBuffer.TYPE_DOUBLE}, respectively).
 *  All samples of a given ComponentSampleModel
 *  are stored with the same precision.  All strides and offsets must be
 *  non-negative.  This class supports
 *  {@link DataBuffer#TYPE_BYTE TYPE_BYTE},
 *  {@link DataBuffer#TYPE_USHORT TYPE_USHORT},
 *  {@link DataBuffer#TYPE_SHORT TYPE_SHORT},
 *  {@link DataBuffer#TYPE_INT TYPE_INT},
 *  {@link DataBuffer#TYPE_FLOAT TYPE_FLOAT},
 *  {@link DataBuffer#TYPE_DOUBLE TYPE_DOUBLE},
 *  @see java.awt.image.PixelInterleavedSampleModel
 *  @see java.awt.image.BandedSampleModel
 */
export class ComponentSampleModel extends SampleModel {
  /**
   * Offsets for all bands in data array elements.
   */
  bandOffsets: number[] = null;
  /**
   * Index for each bank storing a band of image data.
   */
  bankIndices: number[] = null;
  /**
   * The number of bands in this
   * {@code ComponentSampleModel}.
   */
  numBands$ComponentSampleModel: number = 0;
  /**
   * The number of banks in this
   * {@code ComponentSampleModel}.
   */
  numBanks: number = 0;
  /**
   * Line stride (in data array elements) of the region of image
   *  data described by this ComponentSampleModel.
   */
  scanlineStride: number = 0;
  /**
   * Pixel stride (in data array elements) of the region of image
   *  data described by this ComponentSampleModel.
   */
  pixelStride: number = 0;
  $init_ComponentSampleModel() {
    this.numBands$ComponentSampleModel = 1;
    this.numBanks = 1;
  }
  /**
   * Constructs a ComponentSampleModel with the specified parameters.
   * The number of bands will be given by the length of the bandOffsets array.
   * All bands will be stored in the first bank of the DataBuffer.
   * @param dataType  the data type for storing samples
   * @param w         the width (in pixels) of the region of
   *     image data described
   * @param h         the height (in pixels) of the region of
   *     image data described
   * @param pixelStride the pixel stride of the region of image
   *     data described
   * @param scanlineStride the line stride of the region of image
   *     data described
   * @param bandOffsets the offsets of all bands
   * @throws IllegalArgumentException if {@code w} and {@code h}
   *         are not both greater than 0
   * @throws IllegalArgumentException if the product of {@code w}
   *         and {@code h} is greater than {@code Integer.MAX_VALUE}
   * @throws IllegalArgumentException if {@code pixelStride} is less than 0
   * @throws IllegalArgumentException if {@code scanlineStride} is less than 0
   * @throws NullPointerException if {@code bandOffsets} is {@code null}
   * @throws IllegalArgumentException if {@code bandOffsets.length} is 0
   * @throws IllegalArgumentException if {@code dataType} is not
   *         one of the supported data types for this sample model.
   */
  _ComponentSampleModel$int$int$int$int$int$intArr(dataType: number, w: number, h: number, pixelStride: number, scanlineStride: number, bandOffsets: number[]): this {
    this._SampleModel(dataType, w, h, bandOffsets.length);
    this.$init_ComponentSampleModel();
    this.dataType = dataType;
    this.pixelStride = pixelStride;
    this.scanlineStride = scanlineStride;
    this.bandOffsets = bandOffsets.slice();
    this.numBands$ComponentSampleModel = this.bandOffsets.length;
    if (pixelStride < 0) {
      throw new IllegalArgumentException('Pixel stride must be >= 0');
    }
    if (scanlineStride < 0) {
      throw new IllegalArgumentException('Scanline stride must be >= 0');
    }
    if ((dataType < DataBuffer.TYPE_BYTE) || (dataType > DataBuffer.TYPE_DOUBLE)) {
      throw new IllegalArgumentException('Unsupported dataType.');
    }
    this.bankIndices = $J.newArray(this.numBands$ComponentSampleModel, 0);
    this.verify();
    return this;
  }
  /**
   * Constructs a ComponentSampleModel with the specified parameters.
   * The number of bands will be given by the length of the bandOffsets array.
   * Different bands may be stored in different banks of the DataBuffer.
   *
   * @param dataType  the data type for storing samples
   * @param w         the width (in pixels) of the region of
   *     image data described
   * @param h         the height (in pixels) of the region of
   *     image data described
   * @param pixelStride the pixel stride of the region of image
   *     data described
   * @param scanlineStride The line stride of the region of image
   *     data described
   * @param bankIndices the bank indices of all bands
   * @param bandOffsets the band offsets of all bands
   * @throws IllegalArgumentException if {@code w} and {@code h}
   *         are not both greater than 0
   * @throws IllegalArgumentException if the product of {@code w}
   *         and {@code h} is greater than {@code Integer.MAX_VALUE}
   * @throws IllegalArgumentException if {@code pixelStride} is less than 0
   * @throws IllegalArgumentException if {@code scanlineStride} is less than 0
   * @throws NullPointerException if {@code bankIndices} is {@code null}
   * @throws NullPointerException if {@code bandOffsets} is {@code null}
   * @throws IllegalArgumentException if {@code bandOffsets.length} is 0
   * @throws IllegalArgumentException if the length of
   *         {@code bankIndices} does not equal the length of
   *         {@code bandOffsets}
   * @throws IllegalArgumentException if any of the bank indices
   *         of {@code bandIndices} is less than 0
   * @throws IllegalArgumentException if {@code dataType} is not
   *         one of the supported data types for this sample model
   */
  _ComponentSampleModel$int$int$int$int$int$intArr$intArr(dataType: number, w: number, h: number, pixelStride: number, scanlineStride: number, bankIndices: number[], bandOffsets: number[]): this {
    this._SampleModel(dataType, w, h, bandOffsets.length);
    this.$init_ComponentSampleModel();
    this.dataType = dataType;
    this.pixelStride = pixelStride;
    this.scanlineStride = scanlineStride;
    this.bandOffsets = bandOffsets.slice();
    this.bankIndices = bankIndices.slice();
    if (this.bandOffsets.length !== this.bankIndices.length) {
      throw new IllegalArgumentException('Length of bandOffsets must equal length of bankIndices.');
    }
    if (pixelStride < 0) {
      throw new IllegalArgumentException('Pixel stride must be >= 0');
    }
    if (scanlineStride < 0) {
      throw new IllegalArgumentException('Scanline stride must be >= 0');
    }
    if ((dataType < DataBuffer.TYPE_BYTE) || (dataType > DataBuffer.TYPE_DOUBLE)) {
      throw new IllegalArgumentException('Unsupported dataType.');
    }
    let maxBank = this.bankIndices[0];
    if (maxBank < 0) {
      throw new IllegalArgumentException('Index of bank 0 is less than 0 (' + maxBank + ')');
    }
    for (let i = 1; i < this.bankIndices.length; i++) {
      if (this.bankIndices[i] > maxBank) {
        maxBank = this.bankIndices[i];
      } else if (this.bankIndices[i] < 0) {
        throw new IllegalArgumentException('Index of bank ' + i + ' is less than 0 (' + maxBank + ')');
      }
    }
    this.numBanks = (maxBank + 1) | 0;
    this.numBands$ComponentSampleModel = this.bandOffsets.length;
    this.verify();
    return this;
  }
  verify(): void {
    let requiredSize = this.getBufferSize();
  }
  /**
   * Returns the size of the data buffer (in data elements) needed
   * for a data buffer that matches this ComponentSampleModel.
   */
  getBufferSize(): number {
    let maxBandOff = this.bandOffsets[0];
    for (let i = 1; i < this.bandOffsets.length; i++) {
      maxBandOff = Math.max(maxBandOff, this.bandOffsets[i]);
    }
    if (maxBandOff < 0 || maxBandOff > ((2147483647 - 1) | 0)) {
      throw new IllegalArgumentException('Invalid band offset');
    }
    if (this.pixelStride < 0 || this.pixelStride > ($J.idiv(2147483647, this.width_))) {
      throw new IllegalArgumentException('Invalid pixel stride');
    }
    if (this.scanlineStride < 0 || this.scanlineStride > ($J.idiv(2147483647, this.height_))) {
      throw new IllegalArgumentException('Invalid scanline stride');
    }
    let size = (maxBandOff + 1) | 0;
    let val = Math.imul(this.pixelStride, ((this.width_ - 1) | 0));
    if (val > ((2147483647 - size) | 0)) {
      throw new IllegalArgumentException('Invalid pixel stride');
    }
    size = (size + val) | 0;
    val = Math.imul(this.scanlineStride, ((this.height_ - 1) | 0));
    if (val > ((2147483647 - size) | 0)) {
      throw new IllegalArgumentException('Invalid scan stride');
    }
    size = (size + val) | 0;
    return size;
  }
  /**
   * Preserves band ordering with new step factor...
   */
  orderBands(orig: number[], step: number): number[] {
    let map = $J.newArray(orig.length, 0);
    let ret = $J.newArray(orig.length, 0);
    for (let i = 0; i < map.length; i++) {
      map[i] = i;
    }
    for (let i = 0; i < ret.length; i++) {
      let index = i;
      for (let j = (i + 1) | 0; j < ret.length; j++) {
        if (orig[map[index]] > orig[map[j]]) {
          index = j;
        }
      }
      ret[map[index]] = Math.imul(i, step);
      map[index] = map[i];
    }
    return ret;
  }
  /**
   * Creates a new {@code ComponentSampleModel} with the specified
   * width and height.  The new {@code SampleModel} will have the same
   * number of bands, storage data type, interleaving scheme, and
   * pixel stride as this {@code SampleModel}.
   * @param w the width of the resulting {@code SampleModel}
   * @param h the height of the resulting {@code SampleModel}
   * @return a new {@code ComponentSampleModel} with the specified size
   * @throws IllegalArgumentException if {@code w} or
   *         {@code h} is not greater than 0
   */
  createCompatibleSampleModel(w: number, h: number): SampleModel {
    let ret = null;
    let size: number;
    let minBandOff = this.bandOffsets[0];
    let maxBandOff = this.bandOffsets[0];
    for (let i = 1; i < this.bandOffsets.length; i++) {
      minBandOff = Math.min(minBandOff, this.bandOffsets[i]);
      maxBandOff = Math.max(maxBandOff, this.bandOffsets[i]);
    }
    maxBandOff = (maxBandOff - minBandOff) | 0;
    let bands = this.bandOffsets.length;
    let bandOff: number[];
    let pStride = Math.abs(this.pixelStride);
    let lStride = Math.abs(this.scanlineStride);
    let bStride = Math.abs(maxBandOff);
    if (pStride > lStride) {
      if (pStride > bStride) {
        if (lStride > bStride) {
          bandOff = $J.newArray(this.bandOffsets.length, 0);
          for (let i = 0; i < bands; i++) {
            bandOff[i] = (this.bandOffsets[i] - minBandOff) | 0;
          }
          lStride = (bStride + 1) | 0;
          pStride = Math.imul(lStride, h);
        } else {
          bandOff = this.orderBands(this.bandOffsets, Math.imul(lStride, h));
          pStride = Math.imul(Math.imul(bands, lStride), h);
        }
      } else {
        pStride = Math.imul(lStride, h);
        bandOff = this.orderBands(this.bandOffsets, Math.imul(pStride, w));
      }
    } else {
      if (pStride > bStride) {
        bandOff = $J.newArray(this.bandOffsets.length, 0);
        for (let i = 0; i < bands; i++) {
          bandOff[i] = (this.bandOffsets[i] - minBandOff) | 0;
        }
        pStride = (bStride + 1) | 0;
        lStride = Math.imul(pStride, w);
      } else {
        if (lStride > bStride) {
          bandOff = this.orderBands(this.bandOffsets, Math.imul(pStride, w));
          lStride = Math.imul(Math.imul(bands, pStride), w);
        } else {
          lStride = Math.imul(pStride, w);
          bandOff = this.orderBands(this.bandOffsets, Math.imul(lStride, h));
        }
      }
    }
    let base = 0;
    if (this.scanlineStride < 0) {
      base = (base + Math.imul(lStride, h)) | 0;
      lStride = Math.imul(lStride, -1);
    }
    if (this.pixelStride < 0) {
      base = (base + Math.imul(pStride, w)) | 0;
      pStride = Math.imul(pStride, -1);
    }
    for (let i = 0; i < bands; i++) {
      bandOff[i] = (bandOff[i] + base) | 0;
    }
    return new ComponentSampleModel()._ComponentSampleModel$int$int$int$int$int$intArr$intArr(this.dataType, w, h, pStride, lStride, this.bankIndices, bandOff);
  }
  /**
   * Creates a {@code DataBuffer} that corresponds to this
   * {@code ComponentSampleModel}.
   * The {@code DataBuffer} object's data type, number of banks,
   * and size are be consistent with this {@code ComponentSampleModel}.
   * @return a {@code DataBuffer} whose data type, number of banks
   *         and size are consistent with this
   *         {@code ComponentSampleModel}.
   */
  createDataBuffer(): DataBuffer {
    let dataBuffer = null;
    let size = this.getBufferSize();
    switch (this.dataType) {
      case DataBuffer.TYPE_BYTE:
        dataBuffer = new DataBufferByte()._DataBufferByte$int$int(size, this.numBanks);
        break;
      case DataBuffer.TYPE_USHORT:
        dataBuffer = new DataBufferUShort()._DataBufferUShort$int$int(size, this.numBanks);
        break;
      case DataBuffer.TYPE_SHORT:
        dataBuffer = new DataBufferShort()._DataBufferShort$int$int(size, this.numBanks);
        break;
      case DataBuffer.TYPE_INT:
        dataBuffer = new DataBufferInt()._DataBufferInt$int$int(size, this.numBanks);
        break;
      case DataBuffer.TYPE_FLOAT:
        dataBuffer = new DataBufferFloat()._DataBufferFloat$int$int(size, this.numBanks);
        break;
      case DataBuffer.TYPE_DOUBLE:
        dataBuffer = new DataBufferDouble()._DataBufferDouble$int$int(size, this.numBanks);
        break;
    }
    return dataBuffer;
  }
  /**
   * Returns the number of bits per sample for the specified band.
   *  @param band the specified band
   *  @return the number of bits per sample for the specified band.
   */
  getSampleSize$int(band: number): number {
    return DataBuffer.getDataTypeSize(this.dataType);
  }
  /**
   * Returns the bank indices for all bands.
   *  @return the bank indices for all bands.
   */
  getBankIndices(): number[] {
    return this.bankIndices.slice();
  }
  /**
   * Returns the band offset for all bands.
   *  @return the band offsets for all bands.
   */
  getBandOffsets(): number[] {
    return this.bandOffsets.slice();
  }
  /**
   * Returns the scanline stride of this ComponentSampleModel.
   *  @return the scanline stride of this {@code ComponentSampleModel}.
   */
  getScanlineStride(): number {
    return this.scanlineStride;
  }
  /**
   * Returns the pixel stride of this ComponentSampleModel.
   *  @return the pixel stride of this {@code ComponentSampleModel}.
   */
  getPixelStride(): number {
    return this.pixelStride;
  }
  /**
   * Returns the number of data elements needed to transfer a pixel
   * with the
   * {@link #getDataElements(int, int, Object, DataBuffer) } and
   * {@link #setDataElements(int, int, Object, DataBuffer) }
   * methods.
   * For a {@code ComponentSampleModel}, this is identical to the
   * number of bands.
   * @return the number of data elements needed to transfer a pixel with
   *         the {@code getDataElements} and
   *         {@code setDataElements} methods.
   * @see java.awt.image.SampleModel#getNumDataElements
   * @see #getNumBands
   */
  getNumDataElements(): number {
    return this.getNumBands();
  }
  /**
   * Returns data for a single pixel in a primitive array of type
   * {@code TransferType}.  For a {@code ComponentSampleModel},
   * this is the same as the data type, and samples are returned
   * one per array element.  Generally, {@code obj} should
   * be passed in as {@code null}, so that the {@code Object}
   * is created automatically and is the right primitive data type.
   * <p>
   * The following code illustrates transferring data for one pixel from
   * {@code DataBuffer db1}, whose storage layout is
   * described by {@code ComponentSampleModel csm1},
   * to {@code DataBuffer db2}, whose storage layout
   * is described by {@code ComponentSampleModel csm2}.
   * The transfer is usually more efficient than using
   * {@code getPixel} and {@code setPixel}.
   * <pre>
   *       ComponentSampleModel csm1, csm2;
   *       DataBufferInt db1, db2;
   *       csm2.setDataElements(x, y,
   *                            csm1.getDataElements(x, y, null, db1), db2);
   * </pre>
   *
   * Using {@code getDataElements} and {@code setDataElements}
   * to transfer between two {@code DataBuffer/SampleModel}
   * pairs is legitimate if the {@code SampleModel} objects have
   * the same number of bands, corresponding bands have the same number of
   * bits per sample, and the {@code TransferType}s are the same.
   * <p>
   * If {@code obj} is not {@code null}, it should be a
   * primitive array of type {@code TransferType}.
   * Otherwise, a {@code ClassCastException} is thrown.  An
   * {@code ArrayIndexOutOfBoundsException} might be thrown if the
   * coordinates are not in bounds, or if {@code obj} is not
   * {@code null} and is not large enough to hold
   * the pixel data.
   *
   * @param x         the X coordinate of the pixel location
   * @param y         the Y coordinate of the pixel location
   * @param obj       if non-{@code null}, a primitive array
   *                  in which to return the pixel data
   * @param data      the {@code DataBuffer} containing the image data
   * @return the data of the specified pixel
   * @see #setDataElements(int, int, Object, DataBuffer)
   *
   * @throws NullPointerException if data is null.
   * @throws ArrayIndexOutOfBoundsException if the coordinates are
   * not in bounds, or if obj is too small to hold the output.
   */
  getDataElements$int$int$Object$DataBuffer(x: number, y: number, obj: any, data: DataBuffer): any {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let type$ = this.getTransferType();
    let numDataElems = this.getNumDataElements();
    let pixelOffset = (Math.imul(y, this.scanlineStride) + Math.imul(x, this.pixelStride)) | 0;
    {
      let bdata: number[], sdata: number[], idata: number[], fdata: number[], ddata: number[];
      switch (type$) {
        case DataBuffer.TYPE_BYTE:
          if (obj == null) {
            bdata = $J.newArray(numDataElems, 0);
          } else {
            bdata = obj;
          }
          for (let i = 0; i < numDataElems; i++) {
            bdata[i] = ((data.getElem$int$int(this.bankIndices[i], (pixelOffset + this.bandOffsets[i]) | 0)) << 24) >> 24;
          }
          obj = bdata;
          break;
        case DataBuffer.TYPE_USHORT:
        case DataBuffer.TYPE_SHORT:
          if (obj == null) {
            sdata = $J.newArray(numDataElems, 0);
          } else {
            sdata = obj;
          }
          for (let i = 0; i < numDataElems; i++) {
            sdata[i] = ((data.getElem$int$int(this.bankIndices[i], (pixelOffset + this.bandOffsets[i]) | 0)) << 16) >> 16;
          }
          obj = sdata;
          break;
        case DataBuffer.TYPE_INT:
          if (obj == null) {
            idata = $J.newArray(numDataElems, 0);
          } else {
            idata = obj;
          }
          for (let i = 0; i < numDataElems; i++) {
            idata[i] = data.getElem$int$int(this.bankIndices[i], (pixelOffset + this.bandOffsets[i]) | 0);
          }
          obj = idata;
          break;
        case DataBuffer.TYPE_FLOAT:
          if (obj == null) {
            fdata = $J.newArray(numDataElems, 0);
          } else {
            fdata = obj;
          }
          for (let i = 0; i < numDataElems; i++) {
            fdata[i] = data.getElemFloat$int$int(this.bankIndices[i], (pixelOffset + this.bandOffsets[i]) | 0);
          }
          obj = fdata;
          break;
        case DataBuffer.TYPE_DOUBLE:
          if (obj == null) {
            ddata = $J.newArray(numDataElems, 0);
          } else {
            ddata = obj;
          }
          for (let i = 0; i < numDataElems; i++) {
            ddata[i] = data.getElemDouble$int$int(this.bankIndices[i], (pixelOffset + this.bandOffsets[i]) | 0);
          }
          obj = ddata;
          break;
      }
    }
    return obj;
  }
  /**
   * Returns all samples for the specified pixel in an int array,
   * one sample per array element.
   * An {@code ArrayIndexOutOfBoundsException} might be thrown if
   * the coordinates are not in bounds.
   * @param x         the X coordinate of the pixel location
   * @param y         the Y coordinate of the pixel location
   * @param iArray    If non-null, returns the samples in this array
   * @param data      The DataBuffer containing the image data
   * @return the samples of the specified pixel.
   * @see #setPixel(int, int, int[], DataBuffer)
   *
   * @throws NullPointerException if data is null.
   * @throws ArrayIndexOutOfBoundsException if the coordinates are
   * not in bounds, or if iArray is too small to hold the output.
   */
  getPixel$int$int$intArr$DataBuffer(x: number, y: number, iArray: number[], data: DataBuffer): number[] {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let pixels: number[];
    if (iArray != null) {
      pixels = iArray;
    } else {
      pixels = $J.newArray(this.numBands$ComponentSampleModel, 0);
    }
    let pixelOffset = (Math.imul(y, this.scanlineStride) + Math.imul(x, this.pixelStride)) | 0;
    for (let i = 0; i < this.numBands$ComponentSampleModel; i++) {
      pixels[i] = data.getElem$int$int(this.bankIndices[i], (pixelOffset + this.bandOffsets[i]) | 0);
    }
    return pixels;
  }
  /**
   * Returns as int the sample in a specified band for the pixel
   * located at (x,y).
   * An {@code ArrayIndexOutOfBoundsException} might be thrown if
   * the coordinates are not in bounds.
   * @param x         the X coordinate of the pixel location
   * @param y         the Y coordinate of the pixel location
   * @param b         the band to return
   * @param data      the {@code DataBuffer} containing the image data
   * @return the sample in a specified band for the specified pixel
   * @see #setSample(int, int, int, int, DataBuffer)
   */
  getSample(x: number, y: number, b: number, data: DataBuffer): number {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let sample = data.getElem$int$int(this.bankIndices[b], (Math.imul(y, this.scanlineStride) + Math.imul(x, this.pixelStride) + this.bandOffsets[b]) | 0);
    return sample;
  }
  /**
   * Returns the samples in a specified band for the specified rectangle
   * of pixels in an int array, one sample per data array element.
   * An {@code ArrayIndexOutOfBoundsException} might be thrown if
   * the coordinates are not in bounds.
   * @param x         The X coordinate of the upper left pixel location
   * @param y         The Y coordinate of the upper left pixel location
   * @param w         the width of the pixel rectangle
   * @param h         the height of the pixel rectangle
   * @param b         the band to return
   * @param iArray    if non-{@code null}, returns the samples
   *                  in this array
   * @param data      the {@code DataBuffer} containing the image data
   * @return the samples in the specified band of the specified pixel
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
    let lineOffset = (Math.imul(y, this.scanlineStride) + Math.imul(x, this.pixelStride) + this.bandOffsets[b]) | 0;
    let srcOffset = 0;
    for (let i = 0; i < h; i++) {
      let sampleOffset = lineOffset;
      for (let j = 0; j < w; j++) {
        samples[srcOffset++] = data.getElem$int$int(this.bankIndices[b], sampleOffset);
        sampleOffset = (sampleOffset + this.pixelStride) | 0;
      }
      lineOffset = (lineOffset + this.scanlineStride) | 0;
    }
    return samples;
  }
  /**
   * Sets the data for a single pixel in the specified
   * {@code DataBuffer} from a primitive array of type
   * {@code TransferType}.  For a {@code ComponentSampleModel},
   * this is the same as the data type, and samples are transferred
   * one per array element.
   * <p>
   * The following code illustrates transferring data for one pixel from
   * {@code DataBuffer db1}, whose storage layout is
   * described by {@code ComponentSampleModel csm1},
   * to {@code DataBuffer db2}, whose storage layout
   * is described by {@code ComponentSampleModel csm2}.
   * The transfer is usually more efficient than using
   * {@code getPixel} and {@code setPixel}.
   * <pre>
   *       ComponentSampleModel csm1, csm2;
   *       DataBufferInt db1, db2;
   *       csm2.setDataElements(x, y, csm1.getDataElements(x, y, null, db1),
   *                            db2);
   * </pre>
   * Using {@code getDataElements} and {@code setDataElements}
   * to transfer between two {@code DataBuffer/SampleModel} pairs
   * is legitimate if the {@code SampleModel} objects have
   * the same number of bands, corresponding bands have the same number of
   * bits per sample, and the {@code TransferType}s are the same.
   * <p>
   * A {@code ClassCastException} is thrown if {@code obj} is not
   * a primitive array of type {@code TransferType}.
   * An {@code ArrayIndexOutOfBoundsException} might be thrown if
   * the coordinates are not in bounds, or if {@code obj} is not large
   * enough to hold the pixel data.
   * @param x         the X coordinate of the pixel location
   * @param y         the Y coordinate of the pixel location
   * @param obj       a primitive array containing pixel data
   * @param data      the DataBuffer containing the image data
   * @see #getDataElements(int, int, Object, DataBuffer)
   */
  setDataElements$int$int$Object$DataBuffer(x: number, y: number, obj: any, data: DataBuffer): void {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let type$ = this.getTransferType();
    let numDataElems = this.getNumDataElements();
    let pixelOffset = (Math.imul(y, this.scanlineStride) + Math.imul(x, this.pixelStride)) | 0;
    {
      let barray: number[], sarray: number[], iarray: number[], farray: number[], darray: number[];
      switch (type$) {
        case DataBuffer.TYPE_BYTE:
          barray = obj;
          for (let i = 0; i < numDataElems; i++) {
            data.setElem$int$int$int(this.bankIndices[i], (pixelOffset + this.bandOffsets[i]) | 0, (barray[i]) & 255);
          }
          break;
        case DataBuffer.TYPE_USHORT:
        case DataBuffer.TYPE_SHORT:
          sarray = obj;
          for (let i = 0; i < numDataElems; i++) {
            data.setElem$int$int$int(this.bankIndices[i], (pixelOffset + this.bandOffsets[i]) | 0, (sarray[i]) & 65535);
          }
          break;
        case DataBuffer.TYPE_INT:
          iarray = obj;
          for (let i = 0; i < numDataElems; i++) {
            data.setElem$int$int$int(this.bankIndices[i], (pixelOffset + this.bandOffsets[i]) | 0, iarray[i]);
          }
          break;
        case DataBuffer.TYPE_FLOAT:
          farray = obj;
          for (let i = 0; i < numDataElems; i++) {
            data.setElemFloat$int$int$float(this.bankIndices[i], (pixelOffset + this.bandOffsets[i]) | 0, farray[i]);
          }
          break;
        case DataBuffer.TYPE_DOUBLE:
          darray = obj;
          for (let i = 0; i < numDataElems; i++) {
            data.setElemDouble$int$int$double(this.bankIndices[i], (pixelOffset + this.bandOffsets[i]) | 0, darray[i]);
          }
          break;
      }
    }
  }
  /**
   * Sets a pixel in the {@code DataBuffer} using an int array of
   * samples for input.  An {@code ArrayIndexOutOfBoundsException}
   * might be thrown if the coordinates are
   * not in bounds.
   * @param x         The X coordinate of the pixel location
   * @param y         The Y coordinate of the pixel location
   * @param iArray    The input samples in an int array
   * @param data      The DataBuffer containing the image data
   * @see #getPixel(int, int, int[], DataBuffer)
   */
  setPixel$int$int$intArr$DataBuffer(x: number, y: number, iArray: number[], data: DataBuffer): void {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let pixelOffset = (Math.imul(y, this.scanlineStride) + Math.imul(x, this.pixelStride)) | 0;
    for (let i = 0; i < this.numBands$ComponentSampleModel; i++) {
      data.setElem$int$int$int(this.bankIndices[i], (pixelOffset + this.bandOffsets[i]) | 0, iArray[i]);
    }
  }
  /**
   * Sets a sample in the specified band for the pixel located at (x,y)
   * in the {@code DataBuffer} using an int for input.
   * An {@code ArrayIndexOutOfBoundsException} might be thrown if the
   * coordinates are not in bounds.
   * @param x         The X coordinate of the pixel location
   * @param y         The Y coordinate of the pixel location
   * @param b         the band to set
   * @param s         the input sample as an int
   * @param data      the DataBuffer containing the image data
   * @see #getSample(int, int, int, DataBuffer)
   */
  setSample$int$int$int$int$DataBuffer(x: number, y: number, b: number, s: number, data: DataBuffer): void {
    if ((x < 0) || (y < 0) || (x >= this.width_) || (y >= this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    data.setElem$int$int$int(this.bankIndices[b], (Math.imul(y, this.scanlineStride) + Math.imul(x, this.pixelStride) + this.bandOffsets[b]) | 0, s);
  }
  /**
   * Sets the samples in the specified band for the specified rectangle
   * of pixels from an int array containing one sample per data array element.
   * An {@code ArrayIndexOutOfBoundsException} might be thrown if the
   * coordinates are not in bounds.
   * @param x         The X coordinate of the upper left pixel location
   * @param y         The Y coordinate of the upper left pixel location
   * @param w         The width of the pixel rectangle
   * @param h         The height of the pixel rectangle
   * @param b         The band to set
   * @param iArray    The input samples in an int array
   * @param data      The DataBuffer containing the image data
   * @see #getSamples(int, int, int, int, int, int[], DataBuffer)
   */
  setSamples$int$int$int$int$int$intArr$DataBuffer(x: number, y: number, w: number, h: number, b: number, iArray: number[], data: DataBuffer): void {
    if ((x < 0) || (y < 0) || (((x + w) | 0) > this.width_) || (((y + h) | 0) > this.height_)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let lineOffset = (Math.imul(y, this.scanlineStride) + Math.imul(x, this.pixelStride) + this.bandOffsets[b]) | 0;
    let srcOffset = 0;
    for (let i = 0; i < h; i++) {
      let sampleOffset = lineOffset;
      for (let j = 0; j < w; j++) {
        data.setElem$int$int$int(this.bankIndices[b], sampleOffset, iArray[srcOffset++]);
        sampleOffset = (sampleOffset + this.pixelStride) | 0;
      }
      lineOffset = (lineOffset + this.scanlineStride) | 0;
    }
  }
  equals(o: any): boolean {
    var that;
    if (!((that = o) instanceof ComponentSampleModel)) {
      return false;
    }
    return this.width_ === that.width_ && this.height_ === that.height_ && this.numBands$ComponentSampleModel === that.numBands$ComponentSampleModel && this.dataType === that.dataType && Arrays.equals(this.bandOffsets, that.bandOffsets) && Arrays.equals(this.bankIndices, that.bankIndices) && this.numBanks === that.numBanks && this.scanlineStride === that.scanlineStride && this.pixelStride === that.pixelStride;
  }
  hashCode(): number {
    let hash = 0;
    hash = this.width_;
    hash <<= 8;
    hash ^= this.height_;
    hash <<= 8;
    hash ^= this.numBands$ComponentSampleModel;
    hash <<= 8;
    hash ^= this.dataType;
    hash <<= 8;
    for (let i = 0; i < this.bandOffsets.length; i++) {
      hash ^= this.bandOffsets[i];
      hash <<= 8;
    }
    for (let i = 0; i < this.bankIndices.length; i++) {
      hash ^= this.bankIndices[i];
      hash <<= 8;
    }
    hash ^= this.numBanks;
    hash <<= 8;
    hash ^= this.scanlineStride;
    hash <<= 8;
    hash ^= this.pixelStride;
    return hash;
  }
}

$J.define(ComponentSampleModel, 'java.awt.image.ComponentSampleModel', { kind: 'class', sup: 'java.awt.image.SampleModel', ctors: { 'int,int,int,int,int,int[],int[]': '_ComponentSampleModel$int$int$int$int$int$intArr$intArr', 'int,int,int,int,int,int[]': '_ComponentSampleModel$int$int$int$int$int$intArr' }, meths: { 'setSamples(int,int,int,int,int,int[],java.awt.image.DataBuffer)': 'setSamples$int$int$int$int$int$intArr$DataBuffer', 'setSample(int,int,int,double,java.awt.image.DataBuffer)': 'setSample$int$int$int$double$DataBuffer', 'setSample(int,int,int,float,java.awt.image.DataBuffer)': 'setSample$int$int$int$float$DataBuffer', 'setSample(int,int,int,int,java.awt.image.DataBuffer)': 'setSample$int$int$int$int$DataBuffer', 'setPixels(int,int,int,int,int[],java.awt.image.DataBuffer)': 'setPixels$int$int$int$int$intArr$DataBuffer', 'setPixel(int,int,int[],java.awt.image.DataBuffer)': 'setPixel$int$int$intArr$DataBuffer', 'setDataElements(int,int,java.lang.Object,java.awt.image.DataBuffer)': 'setDataElements$int$int$Object$DataBuffer', 'getSamples(int,int,int,int,int,int[],java.awt.image.DataBuffer)': 'getSamples$int$int$int$int$int$intArr$DataBuffer', 'getPixels(int,int,int,int,int[],java.awt.image.DataBuffer)': 'getPixels$int$int$int$int$intArr$DataBuffer', 'getPixel(int,int,int[],java.awt.image.DataBuffer)': 'getPixel$int$int$intArr$DataBuffer', 'getDataElements(int,int,java.lang.Object,java.awt.image.DataBuffer)': 'getDataElements$int$int$Object$DataBuffer', 'getSampleSize(int)': 'getSampleSize$int', 'getSampleSize()': 'getSampleSize$', 'getOffset(int,int,int)': 'getOffset$int$int$int', 'getOffset(int,int)': 'getOffset$int$int' } });
$J.module(() => {
  DataBuffer = $J.load('java.awt.image.DataBuffer');
  DataBufferByte = $J.load('java.awt.image.DataBufferByte');
  DataBufferDouble = $J.load('java.awt.image.DataBufferDouble');
  DataBufferFloat = $J.load('java.awt.image.DataBufferFloat');
  DataBufferInt = $J.load('java.awt.image.DataBufferInt');
  DataBufferShort = $J.load('java.awt.image.DataBufferShort');
  DataBufferUShort = $J.load('java.awt.image.DataBufferUShort');
});
