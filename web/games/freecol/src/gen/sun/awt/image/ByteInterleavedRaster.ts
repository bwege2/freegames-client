// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/image/ByteInterleavedRaster.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { ByteComponentRaster } from './ByteComponentRaster.ts';

let Point, Rectangle, ComponentSampleModel, PixelInterleavedSampleModel, RasterFormatException, SinglePixelPackedSampleModel, SunWritableRaster;

/**
 * This class defines a Raster with pixels consisting of one or more
 * 8-bit data elements stored in close proximity to each other in a
 * single byte array.
 * <p>
 * The bit precision per data element is that of the data type (that
 * is, the bit precision for this Raster is 8).  There is only one
 * pixel stride and one scanline stride for all bands.  This type of
 * Raster can be used with a ComponentColorModel if there are multiple
 * bands, or an IndexColorModel if there is only one band.
 */
export class ByteInterleavedRaster extends ByteComponentRaster {
  /**
   * True if the data offsets range from 0 to (pixelStride - 1) in order.
   */
  inOrder: boolean = false;
  /**
   * The DataBuffer offset, minus sampleModelTranslateX*pixelStride,
   * minus sampleModelTranslateY*scanlineStride, used to calculate
   * pixel offsets.
   */
  dbOffset: number = 0;
  dbOffsetPacked: number = 0;
  /**
   * True if a SinglePixelPackedSampleModel is being used.
   */
  packed: boolean = false;
  /**
   * If packed == true, the SampleModel's bit masks.
   */
  bitMasks: number[] = null;
  /**
   * If packed == true, the SampleModel's bit offsets.
   */
  bitOffsets: number[] = null;
  /**
   * A cached copy of minX + width for use in bounds checks.
   */
  maxX$ByteInterleavedRaster: number = 0;
  /**
   * A cached copy of minY + height for use in bounds checks.
   */
  maxY$ByteInterleavedRaster: number = 0;
  $init_ByteInterleavedRaster() {
    this.packed = false;
  }
  /**
   * Constructs a ByteInterleavedRaster with the given SampleModel.
   * The Raster's upper left corner is origin and it is the same
   * size as the SampleModel.  A DataBuffer large enough to describe the
   * Raster is automatically created.  SampleModel must be of type
   * SinglePixelPackedSampleModel or InterleavedSampleModel.
   * @param sampleModel     The SampleModel that specifies the layout.
   * @param origin          The Point that specified the origin.
   */
  _ByteInterleavedRaster$SampleModel$Point(sampleModel: SampleModel, origin: Point): this {
    this._ByteInterleavedRaster$SampleModel$DataBufferByte$Rectangle$Point$ByteInterleavedRaster(sampleModel, sampleModel.createDataBuffer(), new Rectangle()._Rectangle$int$int$int$int(origin.x_, origin.y_, sampleModel.getWidth(), sampleModel.getHeight()), origin, null);
    return this;
  }
  /**
   * Constructs a ByteInterleavedRaster with the given SampleModel
   * and DataBuffer.  The Raster's upper left corner is origin and
   * it is the same size as the SampleModel.  The DataBuffer is not
   * initialized and must be a DataBufferByte compatible with SampleModel.
   * SampleModel must be of type SinglePixelPackedSampleModel
   * or InterleavedSampleModel.
   * @param sampleModel     The SampleModel that specifies the layout.
   * @param dataBuffer      The DataBufferByte that contains the image data.
   * @param origin          The Point that specifies the origin.
   */
  _ByteInterleavedRaster$SampleModel$DataBufferByte$Point(sampleModel: SampleModel, dataBuffer: DataBufferByte, origin: Point): this {
    this._ByteInterleavedRaster$SampleModel$DataBufferByte$Rectangle$Point$ByteInterleavedRaster(sampleModel, dataBuffer, new Rectangle()._Rectangle$int$int$int$int(origin.x_, origin.y_, sampleModel.getWidth(), sampleModel.getHeight()), origin, null);
    return this;
  }
  /**
   * Constructs a ByteInterleavedRaster with the given SampleModel,
   * DataBuffer, and parent.  DataBuffer must be a DataBufferByte and
   * SampleModel must be of type SinglePixelPackedSampleModel
   * or InterleavedSampleModel.
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
   */
  _ByteInterleavedRaster$SampleModel$DataBufferByte$Rectangle$Point$ByteInterleavedRaster(sampleModel: SampleModel, dataBuffer: DataBufferByte, aRegion: Rectangle, origin: Point, parent: ByteInterleavedRaster): this {
    this._ByteComponentRaster$SampleModel$DataBufferByte$Rectangle$Point$ByteComponentRaster(sampleModel, dataBuffer, aRegion, origin, parent);
    this.$init_ByteInterleavedRaster();
    this.maxX$ByteInterleavedRaster = (this.minX + this.width_) | 0;
    this.maxY$ByteInterleavedRaster = (this.minY + this.height_) | 0;
    this.data = SunWritableRaster.stealData$DataBufferByte$int(dataBuffer, 0);
    let xOffset = (aRegion.x_ - origin.x_) | 0;
    let yOffset = (aRegion.y_ - origin.y_) | 0;
    if (sampleModel instanceof PixelInterleavedSampleModel || (sampleModel instanceof ComponentSampleModel && this.isInterleaved(sampleModel))) {
      let csm = sampleModel;
      this.scanlineStride = csm.getScanlineStride();
      this.pixelStride = csm.getPixelStride();
      this.dataOffsets = csm.getBandOffsets();
      for (let i = 0; i < this.getNumDataElements(); i++) {
        this.dataOffsets[i] = (this.dataOffsets[i] + (Math.imul(xOffset, this.pixelStride) + Math.imul(yOffset, this.scanlineStride))) | 0;
      }
    } else if (sampleModel instanceof SinglePixelPackedSampleModel) {
      let sppsm = sampleModel;
      this.packed = true;
      this.bitMasks = sppsm.getBitMasks();
      this.bitOffsets = sppsm.getBitOffsets();
      this.scanlineStride = sppsm.getScanlineStride();
      this.pixelStride = 1;
      this.dataOffsets = $J.newArray(1, 0);
      this.dataOffsets[0] = dataBuffer.getOffset();
      this.dataOffsets[0] = (this.dataOffsets[0] + (Math.imul(xOffset, this.pixelStride) + Math.imul(yOffset, this.scanlineStride))) | 0;
    } else {
      throw new RasterFormatException()._RasterFormatException('ByteInterleavedRasters must have PixelInterleavedSampleModel, SinglePixelPackedSampleModel or interleaved ComponentSampleModel.  Sample model is ' + $J.str(sampleModel));
    }
    this.bandOffset = this.dataOffsets[0];
    this.dbOffsetPacked = (dataBuffer.getOffset() - Math.imul(this.sampleModelTranslateY, this.scanlineStride) - Math.imul(this.sampleModelTranslateX, this.pixelStride)) | 0;
    this.dbOffset = (this.dbOffsetPacked - (Math.imul(xOffset, this.pixelStride) + Math.imul(yOffset, this.scanlineStride))) | 0;
    this.inOrder = false;
    if (this.numDataElements === this.pixelStride) {
      this.inOrder = true;
      for (let i = 1; i < this.numDataElements; i++) {
        if (((this.dataOffsets[i] - this.dataOffsets[0]) | 0) !== i) {
          this.inOrder = false;
          break;
        }
      }
    }
    this.verify();
    return this;
  }
  /**
   * Analyzes a ComponentSampleModel to determine if it can function
   * as a PixelInterleavedSampleModel.  In order to do so, it must use
   * only bank 0 of its DataBuffer, and the data offsets must span a range
   * of less than pixelStride.
   *
   * <p> These properties are trivially true for a 1-banded SampleModel.
   */
  isInterleaved(sm: ComponentSampleModel): boolean {
    let numBands = this.sampleModel.getNumBands();
    if (numBands === 1) {
      return true;
    }
    let bankIndices = sm.getBankIndices();
    for (let i = 0; i < numBands; i++) {
      if (bankIndices[i] !== 0) {
        return false;
      }
    }
    let bandOffsets = sm.getBandOffsets();
    let minOffset = bandOffsets[0];
    let maxOffset = minOffset;
    for (let i = 1; i < numBands; i++) {
      let offset = bandOffsets[i];
      if (offset < minOffset) {
        minOffset = offset;
      }
      if (offset > maxOffset) {
        maxOffset = offset;
      }
    }
    if (((maxOffset - minOffset) | 0) >= sm.getPixelStride()) {
      return false;
    }
    return true;
  }
  /**
   * Returns the data offset for the specified band.  The data offset
   * is the index into the data array
   * in which the first sample of the first scanline is stored.
   * @param band  The band whose offset is returned.
   */
  getDataOffset(band: number): number {
    return this.dataOffsets[band];
  }
  /**
   * Returns the scanline stride -- the number of data array elements between
   * a given sample and the sample in the same column of the next row in the
   * same band.
   */
  getScanlineStride(): number {
    return this.scanlineStride;
  }
  /**
   * Returns pixel stride -- the number of data array elements between two
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
    if ((x < this.minX) || (y < this.minY) || (x >= this.maxX$ByteInterleavedRaster) || (y >= this.maxY$ByteInterleavedRaster)) {
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
   * Returns an array of data elements from the specified rectangular
   * region.
   * An ArrayIndexOutOfBounds exception will be thrown at runtime
   * if the pixel coordinates are out of bounds.
   * A ClassCastException will be thrown if the input object is non null
   * and references anything other than an array of transferType.
   * <pre>
   *       byte[] bandData = (byte[])raster.getDataElements(x, y, w, h, null);
   *       int numDataElements = raster.getNumDataElements();
   *       byte[] pixel = new byte[numDataElements];
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
    return this.getByteData$int$int$int$int$byteArr(x, y, w, h, obj);
  }
  /**
   * Returns a byte array of data elements from the specified rectangular
   * region.
   * An ArrayIndexOutOfBounds exception will be thrown at runtime
   * if the pixel coordinates are out of bounds.
   * <pre>
   *       byte[] bandData = raster.getByteData(x, y, w, h, null);
   *       int numDataElements = raster.getnumDataElements();
   *       byte[] pixel = new byte[numDataElements];
   *       // To find a data element at location (x2, y2)
   *       System.arraycopy(bandData, ((y2-y)*w + (x2-x))*numDataElements,
   *                        pixel, 0, numDataElements);
   * </pre>
   * @param x        The X coordinate of the upper left pixel location.
   * @param y        The Y coordinate of the upper left pixel location.
   * @param w        Width of the pixel rectangle.
   * @param h        Height of the pixel rectangle.
   * @param outData  If non-null, data elements for all bands
   *                 at the specified location are returned in this array.
   * @return         Data array with data elements for all bands.
   */
  getByteData$int$int$int$int$byteArr(x: number, y: number, w: number, h: number, outData: number[]): number[] {
    if ((x < this.minX) || (y < this.minY) || (((x + w) | 0) > this.maxX$ByteInterleavedRaster) || (((y + h) | 0) > this.maxY$ByteInterleavedRaster)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    if (outData == null) {
      outData = $J.newArray(Math.imul(Math.imul(this.numDataElements, w), h), 0);
    }
    let yoff = (Math.imul(((y - this.minY) | 0), this.scanlineStride) + Math.imul(((x - this.minX) | 0), this.pixelStride)) | 0;
    let xoff: number;
    let off = 0;
    let xstart: number;
    let ystart: number;
    if (this.inOrder) {
      yoff = (yoff + this.dataOffsets[0]) | 0;
      let rowBytes = Math.imul(w, this.pixelStride);
      if (this.scanlineStride === rowBytes) {
        $J.system_arraycopy(this.data, yoff, outData, off, Math.imul(rowBytes, h));
      } else {
        for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
          $J.system_arraycopy(this.data, yoff, outData, off, rowBytes);
          off = (off + rowBytes) | 0;
        }
      }
    } else if (this.numDataElements === 1) {
      yoff = (yoff + this.dataOffsets[0]) | 0;
      for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
        xoff = yoff;
        for (xstart = 0; xstart < w; xstart++, xoff = (xoff + this.pixelStride) | 0) {
          outData[off++] = this.data[xoff];
        }
      }
    } else if (this.numDataElements === 2) {
      yoff = (yoff + this.dataOffsets[0]) | 0;
      let d1 = (this.dataOffsets[1] - this.dataOffsets[0]) | 0;
      for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
        xoff = yoff;
        for (xstart = 0; xstart < w; xstart++, xoff = (xoff + this.pixelStride) | 0) {
          outData[off++] = this.data[xoff];
          outData[off++] = this.data[(xoff + d1) | 0];
        }
      }
    } else if (this.numDataElements === 3) {
      yoff = (yoff + this.dataOffsets[0]) | 0;
      let d1 = (this.dataOffsets[1] - this.dataOffsets[0]) | 0;
      let d2 = (this.dataOffsets[2] - this.dataOffsets[0]) | 0;
      for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
        xoff = yoff;
        for (xstart = 0; xstart < w; xstart++, xoff = (xoff + this.pixelStride) | 0) {
          outData[off++] = this.data[xoff];
          outData[off++] = this.data[(xoff + d1) | 0];
          outData[off++] = this.data[(xoff + d2) | 0];
        }
      }
    } else if (this.numDataElements === 4) {
      yoff = (yoff + this.dataOffsets[0]) | 0;
      let d1 = (this.dataOffsets[1] - this.dataOffsets[0]) | 0;
      let d2 = (this.dataOffsets[2] - this.dataOffsets[0]) | 0;
      let d3 = (this.dataOffsets[3] - this.dataOffsets[0]) | 0;
      for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
        xoff = yoff;
        for (xstart = 0; xstart < w; xstart++, xoff = (xoff + this.pixelStride) | 0) {
          outData[off++] = this.data[xoff];
          outData[off++] = this.data[(xoff + d1) | 0];
          outData[off++] = this.data[(xoff + d2) | 0];
          outData[off++] = this.data[(xoff + d3) | 0];
        }
      }
    } else {
      for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
        xoff = yoff;
        for (xstart = 0; xstart < w; xstart++, xoff = (xoff + this.pixelStride) | 0) {
          for (let c = 0; c < this.numDataElements; c++) {
            outData[off++] = this.data[(this.dataOffsets[c] + xoff) | 0];
          }
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
    if ((x < this.minX) || (y < this.minY) || (x >= this.maxX$ByteInterleavedRaster) || (y >= this.maxY$ByteInterleavedRaster)) {
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
    this.putByteData$int$int$int$int$byteArr(x, y, w, h, obj);
  }
  /**
   * Stores a byte array of data elements into the specified rectangular
   * region.
   * An ArrayIndexOutOfBounds exception will be thrown at runtime
   * if the pixel coordinates are out of bounds.
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
   * @param inData   The data elements to be stored.
   */
  putByteData$int$int$int$int$byteArr(x: number, y: number, w: number, h: number, inData: number[]): void {
    if ((x < this.minX) || (y < this.minY) || (((x + w) | 0) > this.maxX$ByteInterleavedRaster) || (((y + h) | 0) > this.maxY$ByteInterleavedRaster)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let yoff = (Math.imul(((y - this.minY) | 0), this.scanlineStride) + Math.imul(((x - this.minX) | 0), this.pixelStride)) | 0;
    let xoff: number;
    let off = 0;
    let xstart: number;
    let ystart: number;
    if (this.inOrder) {
      yoff = (yoff + this.dataOffsets[0]) | 0;
      let rowBytes = Math.imul(w, this.pixelStride);
      if (rowBytes === this.scanlineStride) {
        $J.system_arraycopy(inData, 0, this.data, yoff, Math.imul(rowBytes, h));
      } else {
        for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
          $J.system_arraycopy(inData, off, this.data, yoff, rowBytes);
          off = (off + rowBytes) | 0;
        }
      }
    } else if (this.numDataElements === 1) {
      yoff = (yoff + this.dataOffsets[0]) | 0;
      for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
        xoff = yoff;
        for (xstart = 0; xstart < w; xstart++, xoff = (xoff + this.pixelStride) | 0) {
          this.data[xoff] = inData[off++];
        }
      }
    } else if (this.numDataElements === 2) {
      yoff = (yoff + this.dataOffsets[0]) | 0;
      let d1 = (this.dataOffsets[1] - this.dataOffsets[0]) | 0;
      for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
        xoff = yoff;
        for (xstart = 0; xstart < w; xstart++, xoff = (xoff + this.pixelStride) | 0) {
          this.data[xoff] = inData[off++];
          (this.data[(xoff + d1) | 0]) = inData[off++];
        }
      }
    } else if (this.numDataElements === 3) {
      yoff = (yoff + this.dataOffsets[0]) | 0;
      let d1 = (this.dataOffsets[1] - this.dataOffsets[0]) | 0;
      let d2 = (this.dataOffsets[2] - this.dataOffsets[0]) | 0;
      for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
        xoff = yoff;
        for (xstart = 0; xstart < w; xstart++, xoff = (xoff + this.pixelStride) | 0) {
          this.data[xoff] = inData[off++];
          (this.data[(xoff + d1) | 0]) = inData[off++];
          (this.data[(xoff + d2) | 0]) = inData[off++];
        }
      }
    } else if (this.numDataElements === 4) {
      yoff = (yoff + this.dataOffsets[0]) | 0;
      let d1 = (this.dataOffsets[1] - this.dataOffsets[0]) | 0;
      let d2 = (this.dataOffsets[2] - this.dataOffsets[0]) | 0;
      let d3 = (this.dataOffsets[3] - this.dataOffsets[0]) | 0;
      for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
        xoff = yoff;
        for (xstart = 0; xstart < w; xstart++, xoff = (xoff + this.pixelStride) | 0) {
          this.data[xoff] = inData[off++];
          (this.data[(xoff + d1) | 0]) = inData[off++];
          (this.data[(xoff + d2) | 0]) = inData[off++];
          (this.data[(xoff + d3) | 0]) = inData[off++];
        }
      }
    } else {
      for (ystart = 0; ystart < h; ystart++, yoff = (yoff + this.scanlineStride) | 0) {
        xoff = yoff;
        for (xstart = 0; xstart < w; xstart++, xoff = (xoff + this.pixelStride) | 0) {
          for (let c = 0; c < this.numDataElements; c++) {
            (this.data[(this.dataOffsets[c] + xoff) | 0]) = inData[off++];
          }
        }
      }
    }
    this.markDirty();
  }
  getSamples$int$int$int$int$int$intArr(x: number, y: number, w: number, h: number, b: number, iArray: number[]): number[] {
    if ((x < this.minX) || (y < this.minY) || (((x + w) | 0) > this.maxX$ByteInterleavedRaster) || (((y + h) | 0) > this.maxY$ByteInterleavedRaster)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let samples: number[];
    if (iArray != null) {
      samples = iArray;
    } else {
      samples = $J.newArray(Math.imul(w, h), 0);
    }
    let lineOffset = (Math.imul(y, this.scanlineStride) + Math.imul(x, this.pixelStride)) | 0;
    let dstOffset = 0;
    if (this.packed) {
      lineOffset = (lineOffset + this.dbOffsetPacked) | 0;
      let bitMask = this.bitMasks[b];
      let bitOffset = this.bitOffsets[b];
      for (let j = 0; j < h; j++) {
        let sampleOffset = lineOffset;
        for (let i = 0; i < w; i++) {
          let value = this.data[sampleOffset++];
          samples[dstOffset++] = ((value & bitMask) >>> bitOffset);
        }
        lineOffset = (lineOffset + this.scanlineStride) | 0;
      }
    } else {
      lineOffset = (lineOffset + (this.dbOffset + this.dataOffsets[b])) | 0;
      for (let j = 0; j < h; j++) {
        let sampleOffset = lineOffset;
        for (let i = 0; i < w; i++) {
          samples[dstOffset++] = this.data[sampleOffset] & 255;
          sampleOffset = (sampleOffset + this.pixelStride) | 0;
        }
        lineOffset = (lineOffset + this.scanlineStride) | 0;
      }
    }
    return samples;
  }
  setSamples$int$int$int$int$int$intArr(x: number, y: number, w: number, h: number, b: number, iArray: number[]): void {
    if ((x < this.minX) || (y < this.minY) || (((x + w) | 0) > this.maxX$ByteInterleavedRaster) || (((y + h) | 0) > this.maxY$ByteInterleavedRaster)) {
      throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
    }
    let lineOffset = (Math.imul(y, this.scanlineStride) + Math.imul(x, this.pixelStride)) | 0;
    let srcOffset = 0;
    if (this.packed) {
      lineOffset = (lineOffset + this.dbOffsetPacked) | 0;
      let bitMask = this.bitMasks[b];
      for (let j = 0; j < h; j++) {
        let sampleOffset = lineOffset;
        for (let i = 0; i < w; i++) {
          let value = this.data[sampleOffset];
          value = ((value & ~bitMask) << 24) >> 24;
          let sample = iArray[srcOffset++];
          value = ((value | (sample << this.bitOffsets[b]) & bitMask) << 24) >> 24;
          this.data[sampleOffset++] = value;
        }
        lineOffset = (lineOffset + this.scanlineStride) | 0;
      }
    } else {
      lineOffset = (lineOffset + (this.dbOffset + this.dataOffsets[b])) | 0;
      for (let i = 0; i < h; i++) {
        let sampleOffset = lineOffset;
        for (let j = 0; j < w; j++) {
          this.data[sampleOffset] = ((iArray[srcOffset++]) << 24) >> 24;
          sampleOffset = (sampleOffset + this.pixelStride) | 0;
        }
        lineOffset = (lineOffset + this.scanlineStride) | 0;
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
    return new ByteInterleavedRaster()._ByteInterleavedRaster$SampleModel$Point(sm, new Point()._Point$int$int(0, 0));
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
    return 'ByteInterleavedRaster: width = ' + this.width_ + ' height = ' + this.height_ + ' #numDataElements ' + this.numDataElements + ' dataOff[0] = ' + this.dataOffsets[0];
  }
}

$J.define(ByteInterleavedRaster, 'sun.awt.image.ByteInterleavedRaster', { kind: 'class', sup: 'sun.awt.image.ByteComponentRaster', ctors: { 'java.awt.image.SampleModel,java.awt.image.DataBufferByte,java.awt.Rectangle,java.awt.Point,sun.awt.image.ByteInterleavedRaster': '_ByteInterleavedRaster$SampleModel$DataBufferByte$Rectangle$Point$ByteInterleavedRaster', 'java.awt.image.SampleModel,java.awt.image.DataBufferByte,java.awt.Point': '_ByteInterleavedRaster$SampleModel$DataBufferByte$Point', 'java.awt.image.SampleModel,java.awt.Point': '_ByteInterleavedRaster$SampleModel$Point' }, meths: { 'createCompatibleWritableRaster()': 'createCompatibleWritableRaster$', 'createCompatibleWritableRaster(int,int)': 'createCompatibleWritableRaster$int$int', 'setRect(int,int,java.awt.image.Raster)': 'setRect$int$int$Raster', 'setPixels(int,int,int,int,int[])': 'setPixels$int$int$int$int$intArr', 'getPixels(int,int,int,int,int[])': 'getPixels$int$int$int$int$intArr', 'setSamples(int,int,int,int,int,int[])': 'setSamples$int$int$int$int$int$intArr', 'getSamples(int,int,int,int,int,int[])': 'getSamples$int$int$int$int$int$intArr', 'setSample(int,int,int,int)': 'setSample$int$int$int$int', 'putByteData(int,int,int,int,byte[])': 'putByteData$int$int$int$int$byteArr', 'putByteData(int,int,int,int,int,byte[])': 'putByteData$int$int$int$int$int$byteArr', 'setDataElements(int,int,int,int,java.lang.Object)': 'setDataElements$int$int$int$int$Object', 'setDataElements(int,int,int,int,int,int,java.awt.image.Raster)': 'setDataElements$int$int$int$int$int$int$Raster$ByteInterleavedRaster', 'setDataElements(int,int,java.awt.image.Raster)': 'setDataElements$int$int$Raster', 'setDataElements(int,int,java.lang.Object)': 'setDataElements$int$int$Object', 'getByteData(int,int,int,int,byte[])': 'getByteData$int$int$int$int$byteArr', 'getByteData(int,int,int,int,int,byte[])': 'getByteData$int$int$int$int$int$byteArr', 'getDataElements(int,int,int,int,java.lang.Object)': 'getDataElements$int$int$int$int$Object', 'getDataElements(int,int,java.lang.Object)': 'getDataElements$int$int$Object' } });
$J.module(() => {
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  ComponentSampleModel = $J.load('java.awt.image.ComponentSampleModel');
  PixelInterleavedSampleModel = $J.load('java.awt.image.PixelInterleavedSampleModel');
  RasterFormatException = $J.load('java.awt.image.RasterFormatException');
  SinglePixelPackedSampleModel = $J.load('java.awt.image.SinglePixelPackedSampleModel');
  SunWritableRaster = $J.load('sun.awt.image.SunWritableRaster');
});
