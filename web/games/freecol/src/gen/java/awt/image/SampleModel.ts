// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/SampleModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayIndexOutOfBoundsException, IllegalArgumentException, JObject } from '../../../../jre/index.ts';

let ColorModel, DataBuffer;

/**
 * This abstract class defines an interface for extracting samples of pixels
 *  in an image.  All image data is expressed as a collection of pixels.
 *  Each pixel consists of a number of samples. A sample is a datum
 *  for one band of an image and a band consists of all samples of a
 *  particular type in an image.  For example, a pixel might contain
 *  three samples representing its red, green and blue components.
 *  There are three bands in the image containing this pixel.  One band
 *  consists of all the red samples from all pixels in the
 *  image.  The second band consists of all the green samples and
 *  the remaining band consists of all of the blue samples.  The pixel
 *  can be stored in various formats.  For example, all samples from
 *  a particular band can be stored contiguously or all samples from a
 *  single pixel can be stored contiguously.
 *  <p>
 *  Subclasses of SampleModel specify the types of samples they can
 *  represent (e.g. unsigned 8-bit byte, signed 16-bit short, etc.)
 *  and may specify how the samples are organized in memory.
 *  In the Java 2D(tm) API, built-in image processing operators may
 *  not operate on all possible sample types, but generally will work
 *  for unsigned integral samples of 16 bits or less.  Some operators
 *  support a wider variety of sample types.
 *  <p>
 *  A collection of pixels is represented as a Raster, which consists of
 *  a DataBuffer and a SampleModel.  The SampleModel allows access to
 *  samples in the DataBuffer and may provide low-level information that
 *  a programmer can use to directly manipulate samples and pixels in the
 *  DataBuffer.
 *  <p>
 *  This class is generally a fall back method for dealing with
 *  images.  More efficient code will cast the SampleModel to the
 *  appropriate subclass and extract the information needed to directly
 *  manipulate pixels in the DataBuffer.
 *
 *  @see java.awt.image.DataBuffer
 *  @see java.awt.image.Raster
 *  @see java.awt.image.ComponentSampleModel
 *  @see java.awt.image.PixelInterleavedSampleModel
 *  @see java.awt.image.BandedSampleModel
 *  @see java.awt.image.MultiPixelPackedSampleModel
 *  @see java.awt.image.SinglePixelPackedSampleModel
 */
export class SampleModel extends JObject {
  /**
   * Width in pixels of the region of image data that this SampleModel
   *  describes.
   */
  width_: number = 0;
  /**
   * Height in pixels of the region of image data that this SampleModel
   *  describes.
   */
  height_: number = 0;
  /**
   * Number of bands of the image data that this SampleModel describes.
   */
  numBands: number = 0;
  /**
   * Data type of the DataBuffer storing the pixel data.
   *  @see java.awt.image.DataBuffer
   */
  dataType: number = 0;
  /**
   * Constructs a SampleModel with the specified parameters.
   * @param dataType  The data type of the DataBuffer storing the pixel data.
   * @param w         The width (in pixels) of the region of image data.
   * @param h         The height (in pixels) of the region of image data.
   * @param numBands  The number of bands of the image data.
   * @throws IllegalArgumentException if {@code w} or {@code h}
   *         is not greater than 0
   * @throws IllegalArgumentException if the product of {@code w}
   *         and {@code h} is greater than {@code Integer.MAX_VALUE}
   * @throws IllegalArgumentException if {@code dataType} is not
   *         one of the pre-defined data type tags in the
   *         {@code DataBuffer} class
   * @throws IllegalArgumentException if {@code numBands} is less than 1
   */
  _SampleModel(dataType: number, w: number, h: number, numBands: number): this {
    let size = w * h;
    if (w <= 0 || h <= 0) {
      throw new IllegalArgumentException('Width (' + w + ') and height (' + h + ') must be > 0');
    }
    if (size > 2147483647) {
      throw new IllegalArgumentException('Dimensions (width=' + w + ' height=' + h + ') are too large');
    }
    if (dataType < DataBuffer.TYPE_BYTE || (dataType > DataBuffer.TYPE_DOUBLE && dataType !== DataBuffer.TYPE_UNDEFINED)) {
      throw new IllegalArgumentException('Unsupported dataType: ' + dataType);
    }
    if (numBands <= 0) {
      throw new IllegalArgumentException('Number of bands must be > 0');
    }
    this.dataType = dataType;
    this.width_ = w;
    this.height_ = h;
    this.numBands = numBands;
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.image.SampleModel', 'initIDs', this, $a);
  }
  /**
   * Returns the width in pixels.
   *  @return the width in pixels of the region of image data
   *          that this {@code SampleModel} describes.
   */
  getWidth(): number {
    return this.width_;
  }
  /**
   * Returns the height in pixels.
   *  @return the height in pixels of the region of image data
   *          that this {@code SampleModel} describes.
   */
  getHeight(): number {
    return this.height_;
  }
  /**
   * Returns the total number of bands of image data.
   *  @return the number of bands of image data that this
   *          {@code SampleModel} describes.
   */
  getNumBands(): number {
    return this.numBands;
  }
  /**
   * Returns the data type of the DataBuffer storing the pixel data.
   *  @return the data type.
   */
  getDataType(): number {
    return this.dataType;
  }
  /**
   * Returns the TransferType used to transfer pixels via the
   *  getDataElements and setDataElements methods.  When pixels
   *  are transferred via these methods, they may be transferred in a
   *  packed or unpacked format, depending on the implementation of the
   *  SampleModel.  Using these methods, pixels are transferred as an
   *  array of getNumDataElements() elements of a primitive type given
   *  by getTransferType().  The TransferType may or may not be the same
   *  as the storage DataType.  The TransferType will be one of the types
   *  defined in DataBuffer.
   *  @return the transfer type.
   *  @see #getDataElements(int, int, Object, DataBuffer)
   *  @see #getDataElements(int, int, int, int, Object, DataBuffer)
   *  @see #setDataElements(int, int, Object, DataBuffer)
   *  @see #setDataElements(int, int, int, int, Object, DataBuffer)
   *  @see #getNumDataElements
   *  @see java.awt.image.DataBuffer
   */
  getTransferType(): number {
    return this.dataType;
  }
  /**
   * Returns the pixel data for the specified rectangle of pixels in a
   * primitive array of type TransferType.
   * For image data supported by the Java 2D API, this
   * will be one of DataBuffer.TYPE_BYTE, DataBuffer.TYPE_USHORT,
   * DataBuffer.TYPE_INT, DataBuffer.TYPE_SHORT, DataBuffer.TYPE_FLOAT,
   * or DataBuffer.TYPE_DOUBLE.  Data may be returned in a packed format,
   * thus increasing efficiency for data transfers. Generally, obj
   * should be passed in as null, so that the Object will be created
   * automatically and will be of the right primitive data type.
   * <p>
   * The following code illustrates transferring data for a rectangular
   * region of pixels from
   * DataBuffer {@code db1}, whose storage layout is described by
   * SampleModel {@code sm1}, to DataBuffer {@code db2}, whose
   * storage layout is described by SampleModel {@code sm2}.
   * The transfer will generally be more efficient than using
   * getPixels/setPixels.
   * <pre>
   *       SampleModel sm1, sm2;
   *       DataBuffer db1, db2;
   *       sm2.setDataElements(x, y, w, h, sm1.getDataElements(x, y, w,
   *                           h, null, db1), db2);
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
   * @param x         The minimum X coordinate of the pixel rectangle.
   * @param y         The minimum Y coordinate of the pixel rectangle.
   * @param w         The width of the pixel rectangle.
   * @param h         The height of the pixel rectangle.
   * @param obj       If non-null, a primitive array in which to return
   *                  the pixel data.
   * @param data      The DataBuffer containing the image data.
   * @return the data elements for the specified region of pixels.
   * @see #getNumDataElements
   * @see #getTransferType
   * @see #setDataElements(int, int, int, int, Object, DataBuffer)
   * @see java.awt.image.DataBuffer
   *
   * @throws NullPointerException if data is null.
   * @throws ArrayIndexOutOfBoundsException if the coordinates are
   * not in bounds, or if obj is too small to hold the output.
   */
  getDataElements$int$int$int$int$Object$DataBuffer(x: number, y: number, w: number, h: number, obj: any, data: DataBuffer): any {
    let type$ = this.getTransferType();
    let numDataElems = this.getNumDataElements();
    let cnt = 0;
    let o = null;
    let x1 = (x + w) | 0;
    let y1 = (y + h) | 0;
    if (x < 0 || x >= this.width_ || w > this.width_ || x1 < 0 || x1 > this.width_ || y < 0 || y >= this.height_ || h > this.height_ || y1 < 0 || y1 > this.height_) {
      throw new ArrayIndexOutOfBoundsException('Invalid coordinates.');
    }
    {
      let btemp: number[], bdata: number[], sdata: number[], stemp: number[], idata: number[], itemp: number[], fdata: number[], ftemp: number[], ddata: number[], dtemp: number[];
      switch (type$) {
        case DataBuffer.TYPE_BYTE:
          if (obj == null) {
            bdata = $J.newArray(Math.imul(Math.imul(numDataElems, w), h), 0);
          } else {
            bdata = obj;
          }
          for (let i = y; i < y1; i++) {
            for (let j = x; j < x1; j++) {
              o = this.getDataElements$int$int$Object$DataBuffer(j, i, o, data);
              btemp = o;
              for (let k = 0; k < numDataElems; k++) {
                bdata[cnt++] = btemp[k];
              }
            }
          }
          obj = bdata;
          break;
        case DataBuffer.TYPE_USHORT:
        case DataBuffer.TYPE_SHORT:
          if (obj == null) {
            sdata = $J.newArray(Math.imul(Math.imul(numDataElems, w), h), 0);
          } else {
            sdata = obj;
          }
          for (let i = y; i < y1; i++) {
            for (let j = x; j < x1; j++) {
              o = this.getDataElements$int$int$Object$DataBuffer(j, i, o, data);
              stemp = o;
              for (let k = 0; k < numDataElems; k++) {
                sdata[cnt++] = stemp[k];
              }
            }
          }
          obj = sdata;
          break;
        case DataBuffer.TYPE_INT:
          if (obj == null) {
            idata = $J.newArray(Math.imul(Math.imul(numDataElems, w), h), 0);
          } else {
            idata = obj;
          }
          for (let i = y; i < y1; i++) {
            for (let j = x; j < x1; j++) {
              o = this.getDataElements$int$int$Object$DataBuffer(j, i, o, data);
              itemp = o;
              for (let k = 0; k < numDataElems; k++) {
                idata[cnt++] = itemp[k];
              }
            }
          }
          obj = idata;
          break;
        case DataBuffer.TYPE_FLOAT:
          if (obj == null) {
            fdata = $J.newArray(Math.imul(Math.imul(numDataElems, w), h), 0);
          } else {
            fdata = obj;
          }
          for (let i = y; i < y1; i++) {
            for (let j = x; j < x1; j++) {
              o = this.getDataElements$int$int$Object$DataBuffer(j, i, o, data);
              ftemp = o;
              for (let k = 0; k < numDataElems; k++) {
                fdata[cnt++] = ftemp[k];
              }
            }
          }
          obj = fdata;
          break;
        case DataBuffer.TYPE_DOUBLE:
          if (obj == null) {
            ddata = $J.newArray(Math.imul(Math.imul(numDataElems, w), h), 0);
          } else {
            ddata = obj;
          }
          for (let i = y; i < y1; i++) {
            for (let j = x; j < x1; j++) {
              o = this.getDataElements$int$int$Object$DataBuffer(j, i, o, data);
              dtemp = o;
              for (let k = 0; k < numDataElems; k++) {
                ddata[cnt++] = dtemp[k];
              }
            }
          }
          obj = ddata;
          break;
      }
    }
    return obj;
  }
  /**
   * Sets the data for a rectangle of pixels in the specified DataBuffer
   * from a primitive array of type TransferType.  For image data supported
   * by the Java 2D API, this will be one of DataBuffer.TYPE_BYTE,
   * DataBuffer.TYPE_USHORT, DataBuffer.TYPE_INT, DataBuffer.TYPE_SHORT,
   * DataBuffer.TYPE_FLOAT, or DataBuffer.TYPE_DOUBLE.  Data in the array
   * may be in a packed format, thus increasing efficiency for data
   * transfers.
   * <p>
   * The following code illustrates transferring data for a rectangular
   * region of pixels from
   * DataBuffer {@code db1}, whose storage layout is described by
   * SampleModel {@code sm1}, to DataBuffer {@code db2}, whose
   * storage layout is described by SampleModel {@code sm2}.
   * The transfer will generally be more efficient than using
   * getPixels/setPixels.
   * <pre>
   *       SampleModel sm1, sm2;
   *       DataBuffer db1, db2;
   *       sm2.setDataElements(x, y, w, h, sm1.getDataElements(x, y, w, h,
   *                           null, db1), db2);
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
   * @param x         The minimum X coordinate of the pixel rectangle.
   * @param y         The minimum Y coordinate of the pixel rectangle.
   * @param w         The width of the pixel rectangle.
   * @param h         The height of the pixel rectangle.
   * @param obj       A primitive array containing pixel data.
   * @param data      The DataBuffer containing the image data.
   * @see #getNumDataElements
   * @see #getTransferType
   * @see #getDataElements(int, int, int, int, Object, DataBuffer)
   * @see java.awt.image.DataBuffer
   *
   * @throws NullPointerException if data is null.
   * @throws ArrayIndexOutOfBoundsException if the coordinates are
   * not in bounds, or if obj is too small to hold the input.
   */
  setDataElements$int$int$int$int$Object$DataBuffer(x: number, y: number, w: number, h: number, obj: any, data: DataBuffer): void {
    let cnt = 0;
    let o = null;
    let type$ = this.getTransferType();
    let numDataElems = this.getNumDataElements();
    let x1 = (x + w) | 0;
    let y1 = (y + h) | 0;
    if (x < 0 || x >= this.width_ || w > this.width_ || x1 < 0 || x1 > this.width_ || y < 0 || y >= this.height_ || h > this.height_ || y1 < 0 || y1 > this.height_) {
      throw new ArrayIndexOutOfBoundsException('Invalid coordinates.');
    }
    {
      let barray: number[], btemp: number[], sarray: number[], stemp: number[], iArray: number[], itemp: number[], fArray: number[], ftemp: number[], dArray: number[], dtemp: number[];
      switch (type$) {
        case DataBuffer.TYPE_BYTE:
          barray = obj;
          btemp = $J.newArray(numDataElems, 0);
          for (let i = y; i < y1; i++) {
            for (let j = x; j < x1; j++) {
              for (let k = 0; k < numDataElems; k++) {
                btemp[k] = barray[cnt++];
              }
              this.setDataElements$int$int$Object$DataBuffer(j, i, btemp, data);
            }
          }
          break;
        case DataBuffer.TYPE_USHORT:
        case DataBuffer.TYPE_SHORT:
          sarray = obj;
          stemp = $J.newArray(numDataElems, 0);
          for (let i = y; i < y1; i++) {
            for (let j = x; j < x1; j++) {
              for (let k = 0; k < numDataElems; k++) {
                stemp[k] = sarray[cnt++];
              }
              this.setDataElements$int$int$Object$DataBuffer(j, i, stemp, data);
            }
          }
          break;
        case DataBuffer.TYPE_INT:
          iArray = obj;
          itemp = $J.newArray(numDataElems, 0);
          for (let i = y; i < y1; i++) {
            for (let j = x; j < x1; j++) {
              for (let k = 0; k < numDataElems; k++) {
                itemp[k] = iArray[cnt++];
              }
              this.setDataElements$int$int$Object$DataBuffer(j, i, itemp, data);
            }
          }
          break;
        case DataBuffer.TYPE_FLOAT:
          fArray = obj;
          ftemp = $J.newArray(numDataElems, 0);
          for (let i = y; i < y1; i++) {
            for (let j = x; j < x1; j++) {
              for (let k = 0; k < numDataElems; k++) {
                ftemp[k] = fArray[cnt++];
              }
              this.setDataElements$int$int$Object$DataBuffer(j, i, ftemp, data);
            }
          }
          break;
        case DataBuffer.TYPE_DOUBLE:
          dArray = obj;
          dtemp = $J.newArray(numDataElems, 0);
          for (let i = y; i < y1; i++) {
            for (let j = x; j < x1; j++) {
              for (let k = 0; k < numDataElems; k++) {
                dtemp[k] = dArray[cnt++];
              }
              this.setDataElements$int$int$Object$DataBuffer(j, i, dtemp, data);
            }
          }
          break;
      }
    }
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
   * @return the samples for the specified band for the specified region
   *         of pixels.
   * @see #setSamples(int, int, int, int, int, int[], DataBuffer)
   *
   * @throws NullPointerException if data is null.
   * @throws ArrayIndexOutOfBoundsException if the coordinates or
   * the band index are not in bounds, or if iArray is too small to
   * hold the output.
   */
  getSamples$int$int$int$int$int$intArr$DataBuffer(x: number, y: number, w: number, h: number, b: number, iArray: number[], data: DataBuffer): number[] {
    let pixels: number[];
    let Offset = 0;
    let x1 = (x + w) | 0;
    let y1 = (y + h) | 0;
    if (x < 0 || x1 < x || x1 > this.width_ || y < 0 || y1 < y || y1 > this.height_) {
      throw new ArrayIndexOutOfBoundsException('Invalid coordinates.');
    }
    if (iArray != null) {
      pixels = iArray;
    } else {
      pixels = $J.newArray(Math.imul(w, h), 0);
    }
    for (let i = y; i < y1; i++) {
      for (let j = x; j < x1; j++) {
        pixels[Offset++] = this.getSample(j, i, b, data);
      }
    }
    return pixels;
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
   *
   * @throws NullPointerException if iArray or data is null.
   * @throws ArrayIndexOutOfBoundsException if the coordinates or
   * the band index are not in bounds, or if iArray is too small to
   * hold the input.
   */
  setSamples$int$int$int$int$int$intArr$DataBuffer(x: number, y: number, w: number, h: number, b: number, iArray: number[], data: DataBuffer): void {
    let Offset = 0;
    let x1 = (x + w) | 0;
    let y1 = (y + h) | 0;
    if (x < 0 || x >= this.width_ || w > this.width_ || x1 < 0 || x1 > this.width_ || y < 0 || y >= this.height_ || h > this.height_ || y1 < 0 || y1 > this.height_) {
      throw new ArrayIndexOutOfBoundsException('Invalid coordinates.');
    }
    for (let i = y; i < y1; i++) {
      for (let j = x; j < x1; j++) {
        this.setSample$int$int$int$int$DataBuffer(j, i, b, iArray[Offset++], data);
      }
    }
  }
  static $clinit() {
    ColorModel.loadLibraries();
    SampleModel.initIDs();
  }
}

$J.define(SampleModel, 'java.awt.image.SampleModel', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int,int,int': '_SampleModel' }, meths: { 'getSampleSize(int)': 'getSampleSize$int', 'getSampleSize()': 'getSampleSize$', 'setSamples(int,int,int,int,int,double[],java.awt.image.DataBuffer)': 'setSamples$int$int$int$int$int$doubleArr$DataBuffer', 'setSamples(int,int,int,int,int,float[],java.awt.image.DataBuffer)': 'setSamples$int$int$int$int$int$floatArr$DataBuffer', 'setSamples(int,int,int,int,int,int[],java.awt.image.DataBuffer)': 'setSamples$int$int$int$int$int$intArr$DataBuffer', 'setSample(int,int,int,double,java.awt.image.DataBuffer)': 'setSample$int$int$int$double$DataBuffer', 'setSample(int,int,int,float,java.awt.image.DataBuffer)': 'setSample$int$int$int$float$DataBuffer', 'setSample(int,int,int,int,java.awt.image.DataBuffer)': 'setSample$int$int$int$int$DataBuffer', 'setPixels(int,int,int,int,double[],java.awt.image.DataBuffer)': 'setPixels$int$int$int$int$doubleArr$DataBuffer', 'setPixels(int,int,int,int,float[],java.awt.image.DataBuffer)': 'setPixels$int$int$int$int$floatArr$DataBuffer', 'setPixels(int,int,int,int,int[],java.awt.image.DataBuffer)': 'setPixels$int$int$int$int$intArr$DataBuffer', 'setPixel(int,int,double[],java.awt.image.DataBuffer)': 'setPixel$int$int$doubleArr$DataBuffer', 'setPixel(int,int,float[],java.awt.image.DataBuffer)': 'setPixel$int$int$floatArr$DataBuffer', 'setPixel(int,int,int[],java.awt.image.DataBuffer)': 'setPixel$int$int$intArr$DataBuffer', 'getSamples(int,int,int,int,int,double[],java.awt.image.DataBuffer)': 'getSamples$int$int$int$int$int$doubleArr$DataBuffer', 'getSamples(int,int,int,int,int,float[],java.awt.image.DataBuffer)': 'getSamples$int$int$int$int$int$floatArr$DataBuffer', 'getSamples(int,int,int,int,int,int[],java.awt.image.DataBuffer)': 'getSamples$int$int$int$int$int$intArr$DataBuffer', 'getPixels(int,int,int,int,double[],java.awt.image.DataBuffer)': 'getPixels$int$int$int$int$doubleArr$DataBuffer', 'getPixels(int,int,int,int,float[],java.awt.image.DataBuffer)': 'getPixels$int$int$int$int$floatArr$DataBuffer', 'getPixels(int,int,int,int,int[],java.awt.image.DataBuffer)': 'getPixels$int$int$int$int$intArr$DataBuffer', 'getPixel(int,int,double[],java.awt.image.DataBuffer)': 'getPixel$int$int$doubleArr$DataBuffer', 'getPixel(int,int,float[],java.awt.image.DataBuffer)': 'getPixel$int$int$floatArr$DataBuffer', 'setDataElements(int,int,int,int,java.lang.Object,java.awt.image.DataBuffer)': 'setDataElements$int$int$int$int$Object$DataBuffer', 'setDataElements(int,int,java.lang.Object,java.awt.image.DataBuffer)': 'setDataElements$int$int$Object$DataBuffer', 'getDataElements(int,int,int,int,java.lang.Object,java.awt.image.DataBuffer)': 'getDataElements$int$int$int$int$Object$DataBuffer', 'getDataElements(int,int,java.lang.Object,java.awt.image.DataBuffer)': 'getDataElements$int$int$Object$DataBuffer', 'getPixel(int,int,int[],java.awt.image.DataBuffer)': 'getPixel$int$int$intArr$DataBuffer' }, clinit: true, lazy: [] });
$J.module(() => {
  ColorModel = $J.load('java.awt.image.ColorModel');
  DataBuffer = $J.load('java.awt.image.DataBuffer');
});
