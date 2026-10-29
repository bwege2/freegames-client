// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/WritableRaster.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../jre/index.ts';
import { Raster } from './Raster.ts';

let Rectangle;

/**
 * This class extends Raster to provide pixel writing capabilities.
 * Refer to the class comment for Raster for descriptions of how
 * a Raster stores pixels.
 *
 * <p> The constructors of this class are protected.  To instantiate
 * a WritableRaster, use one of the createWritableRaster factory methods
 * in the Raster class.
 */
export class WritableRaster extends Raster {
  /**
   * Constructs a WritableRaster with the given SampleModel.  The
   *  WritableRaster's upper left corner is origin and it is the
   *  same size as the  SampleModel.  A DataBuffer large enough to
   *  describe the WritableRaster is automatically created.
   *  @param sampleModel     The SampleModel that specifies the layout.
   *  @param origin          The Point that specifies the origin.
   *  @throws RasterFormatException if computing either
   *          {@code origin.x + sampleModel.getWidth()} or
   *          {@code origin.y + sampleModel.getHeight()} results
   *          in integer overflow
   */
  _WritableRaster$SampleModel$Point(sampleModel: SampleModel, origin: Point): this {
    this._WritableRaster$SampleModel$DataBuffer$Rectangle$Point$WritableRaster(sampleModel, sampleModel.createDataBuffer(), new Rectangle()._Rectangle$int$int$int$int(origin.x_, origin.y_, sampleModel.getWidth(), sampleModel.getHeight()), origin, null);
    return this;
  }
  /**
   * Constructs a WritableRaster with the given SampleModel and DataBuffer.
   *  The WritableRaster's upper left corner is origin and it is the same
   *  size as the SampleModel.  The DataBuffer is not initialized and must
   *  be compatible with SampleModel.
   *  @param sampleModel     The SampleModel that specifies the layout.
   *  @param dataBuffer      The DataBuffer that contains the image data.
   *  @param origin          The Point that specifies the origin.
   *  @throws RasterFormatException if computing either
   *          {@code origin.x + sampleModel.getWidth()} or
   *          {@code origin.y + sampleModel.getHeight()} results
   *          in integer overflow
   */
  _WritableRaster$SampleModel$DataBuffer$Point(sampleModel: SampleModel, dataBuffer: DataBuffer, origin: Point): this {
    this._WritableRaster$SampleModel$DataBuffer$Rectangle$Point$WritableRaster(sampleModel, dataBuffer, new Rectangle()._Rectangle$int$int$int$int(origin.x_, origin.y_, sampleModel.getWidth(), sampleModel.getHeight()), origin, null);
    return this;
  }
  /**
   * Constructs a WritableRaster with the given SampleModel, DataBuffer,
   * and parent.  aRegion specifies the bounding rectangle of the new
   * Raster.  When translated into the base Raster's coordinate
   * system, aRegion must be contained by the base Raster.
   * (The base Raster is the Raster's ancestor which has no parent.)
   * sampleModelTranslate specifies the sampleModelTranslateX and
   * sampleModelTranslateY values of the new Raster.
   *
   * Note that this constructor should generally be called by other
   * constructors or create methods, it should not be used directly.
   * @param sampleModel     The SampleModel that specifies the layout.
   * @param dataBuffer      The DataBuffer that contains the image data.
   * @param aRegion         The Rectangle that specifies the image area.
   * @param sampleModelTranslate  The Point that specifies the translation
   *                        from SampleModel to Raster coordinates.
   * @param parent          The parent (if any) of this raster.
   * @throws RasterFormatException if {@code aRegion} has width
   *         or height less than or equal to zero, or computing either
   *         {@code aRegion.x + aRegion.width} or
   *         {@code aRegion.y + aRegion.height} results in integer
   *         overflow
   */
  _WritableRaster$SampleModel$DataBuffer$Rectangle$Point$WritableRaster(sampleModel: SampleModel, dataBuffer: DataBuffer, aRegion: Rectangle, sampleModelTranslate: Point, parent: WritableRaster): this {
    this._Raster$SampleModel$DataBuffer$Rectangle$Point$Raster(sampleModel, dataBuffer, aRegion, sampleModelTranslate, parent);
    return this;
  }
  /**
   * Sets the data for a single pixel from a
   * primitive array of type TransferType.  For image data supported by
   * the Java 2D(tm) API, this will be one of DataBuffer.TYPE_BYTE,
   * DataBuffer.TYPE_USHORT, DataBuffer.TYPE_INT, DataBuffer.TYPE_SHORT,
   * DataBuffer.TYPE_FLOAT, or DataBuffer.TYPE_DOUBLE.  Data in the array
   * may be in a packed format, thus increasing efficiency for data
   * transfers.
   * An ArrayIndexOutOfBoundsException may be thrown if the coordinates are
   * not in bounds, or if inData is not large enough to hold the pixel data.
   * However, explicit bounds checking is not guaranteed.
   * A ClassCastException will be thrown if the input object is not null
   * and references anything other than an array of TransferType.
   * @see java.awt.image.SampleModel#setDataElements(int, int, Object, DataBuffer)
   * @param x        The X coordinate of the pixel location.
   * @param y        The Y coordinate of the pixel location.
   * @param inData   An object reference to an array of type defined by
   *                 getTransferType() and length getNumDataElements()
   *                 containing the pixel data to place at x,y.
   *
   * @throws ArrayIndexOutOfBoundsException if the coordinates are not
   * in bounds, or if inData is too small to hold the input.
   */
  setDataElements$int$int$Object(x: number, y: number, inData: any): void {
    this.sampleModel.setDataElements$int$int$Object$DataBuffer((x - this.sampleModelTranslateX) | 0, (y - this.sampleModelTranslateY) | 0, inData, this.dataBuffer);
  }
  /**
   * Sets the data for a rectangle of pixels from a
   * primitive array of type TransferType.  For image data supported by
   * the Java 2D API, this will be one of DataBuffer.TYPE_BYTE,
   * DataBuffer.TYPE_USHORT, DataBuffer.TYPE_INT, DataBuffer.TYPE_SHORT,
   * DataBuffer.TYPE_FLOAT, or DataBuffer.TYPE_DOUBLE.  Data in the array
   * may be in a packed format, thus increasing efficiency for data
   * transfers.
   * An ArrayIndexOutOfBoundsException may be thrown if the coordinates are
   * not in bounds, or if inData is not large enough to hold the pixel data.
   * However, explicit bounds checking is not guaranteed.
   * A ClassCastException will be thrown if the input object is not null
   * and references anything other than an array of TransferType.
   * @see java.awt.image.SampleModel#setDataElements(int, int, int, int, Object, DataBuffer)
   * @param x        The X coordinate of the upper left pixel location.
   * @param y        The Y coordinate of the upper left pixel location.
   * @param w        Width of the pixel rectangle.
   * @param h        Height of the pixel rectangle.
   * @param inData   An object reference to an array of type defined by
   *                 getTransferType() and length w*h*getNumDataElements()
   *                 containing the pixel data to place between x,y and
   *                 x+w-1, y+h-1.
   *
   * @throws NullPointerException if inData is null.
   * @throws ArrayIndexOutOfBoundsException if the coordinates are not
   * in bounds, or if inData is too small to hold the input.
   */
  setDataElements$int$int$int$int$Object(x: number, y: number, w: number, h: number, inData: any): void {
    this.sampleModel.setDataElements$int$int$int$int$Object$DataBuffer((x - this.sampleModelTranslateX) | 0, (y - this.sampleModelTranslateY) | 0, w, h, inData, this.dataBuffer);
  }
  /**
   * Sets a pixel in the DataBuffer using an int array of samples for input.
   * An ArrayIndexOutOfBoundsException may be thrown if the coordinates are
   * not in bounds.
   * However, explicit bounds checking is not guaranteed.
   * @param x      The X coordinate of the pixel location.
   * @param y      The Y coordinate of the pixel location.
   * @param iArray The input samples in a int array.
   *
   * @throws NullPointerException if iArray is null.
   * @throws ArrayIndexOutOfBoundsException if the coordinates are not
   * in bounds, or if iArray is too small to hold the input.
   */
  setPixel$int$int$intArr(x: number, y: number, iArray: number[]): void {
    this.sampleModel.setPixel$int$int$intArr$DataBuffer((x - this.sampleModelTranslateX) | 0, (y - this.sampleModelTranslateY) | 0, iArray, this.dataBuffer);
  }
  /**
   * Sets the samples in the specified band for the specified rectangle
   * of pixels from an int array containing one sample per array element.
   * An ArrayIndexOutOfBoundsException may be thrown if the coordinates are
   * not in bounds.
   * However, explicit bounds checking is not guaranteed.
   * @param x        The X coordinate of the upper left pixel location.
   * @param y        The Y coordinate of the upper left pixel location.
   * @param w        Width of the pixel rectangle.
   * @param h        Height of the pixel rectangle.
   * @param b        The band to set.
   * @param iArray   The input int sample array.
   *
   * @throws NullPointerException if iArray is null.
   * @throws ArrayIndexOutOfBoundsException if the coordinates or
   * the band index are not in bounds, or if iArray is too small to
   * hold the input.
   */
  setSamples$int$int$int$int$int$intArr(x: number, y: number, w: number, h: number, b: number, iArray: number[]): void {
    this.sampleModel.setSamples$int$int$int$int$int$intArr$DataBuffer((x - this.sampleModelTranslateX) | 0, (y - this.sampleModelTranslateY) | 0, w, h, b, iArray, this.dataBuffer);
  }
}

$J.define(WritableRaster, 'java.awt.image.WritableRaster', { kind: 'class', sup: 'java.awt.image.Raster', ctors: { 'java.awt.image.SampleModel,java.awt.image.DataBuffer,java.awt.Rectangle,java.awt.Point,java.awt.image.WritableRaster': '_WritableRaster$SampleModel$DataBuffer$Rectangle$Point$WritableRaster', 'java.awt.image.SampleModel,java.awt.image.DataBuffer,java.awt.Point': '_WritableRaster$SampleModel$DataBuffer$Point', 'java.awt.image.SampleModel,java.awt.Point': '_WritableRaster$SampleModel$Point' }, meths: { 'setSamples(int,int,int,int,int,double[])': 'setSamples$int$int$int$int$int$doubleArr', 'setSamples(int,int,int,int,int,float[])': 'setSamples$int$int$int$int$int$floatArr', 'setSamples(int,int,int,int,int,int[])': 'setSamples$int$int$int$int$int$intArr', 'setSample(int,int,int,double)': 'setSample$int$int$int$double', 'setSample(int,int,int,float)': 'setSample$int$int$int$float', 'setSample(int,int,int,int)': 'setSample$int$int$int$int', 'setPixels(int,int,int,int,double[])': 'setPixels$int$int$int$int$doubleArr', 'setPixels(int,int,int,int,float[])': 'setPixels$int$int$int$int$floatArr', 'setPixels(int,int,int,int,int[])': 'setPixels$int$int$int$int$intArr', 'setPixel(int,int,double[])': 'setPixel$int$int$doubleArr', 'setPixel(int,int,float[])': 'setPixel$int$int$floatArr', 'setPixel(int,int,int[])': 'setPixel$int$int$intArr', 'setRect(int,int,java.awt.image.Raster)': 'setRect$int$int$Raster', 'setRect(java.awt.image.Raster)': 'setRect$Raster', 'setDataElements(int,int,int,int,java.lang.Object)': 'setDataElements$int$int$int$int$Object', 'setDataElements(int,int,java.awt.image.Raster)': 'setDataElements$int$int$Raster', 'setDataElements(int,int,java.lang.Object)': 'setDataElements$int$int$Object' } });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
});
