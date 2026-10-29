// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/Raster.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject, NullPointerException } from '../../../../jre/index.ts';

let Point, Rectangle, ColorModel, DataBuffer, DataBufferByte, DataBufferInt, DataBufferUShort, MultiPixelPackedSampleModel, PixelInterleavedSampleModel, RasterFormatException, SinglePixelPackedSampleModel, ByteInterleavedRaster, BytePackedRaster, IntegerInterleavedRaster, ShortInterleavedRaster, SunWritableRaster;

/**
 * A class representing a rectangular array of pixels.  A Raster
 * encapsulates a DataBuffer that stores the sample values and a
 * SampleModel that describes how to locate a given sample value in a
 * DataBuffer.
 * <p>
 * A Raster defines values for pixels occupying a particular
 * rectangular area of the plane, not necessarily including (0, 0).
 * The rectangle, known as the Raster's bounding rectangle and
 * available by means of the getBounds method, is defined by minX,
 * minY, width, and height values.  The minX and minY values define
 * the coordinate of the upper left corner of the Raster.  References
 * to pixels outside of the bounding rectangle may result in an
 * exception being thrown, or may result in references to unintended
 * elements of the Raster's associated DataBuffer.  It is the user's
 * responsibility to avoid accessing such pixels.
 * <p>
 * A SampleModel describes how samples of a Raster
 * are stored in the primitive array elements of a DataBuffer.
 * Samples may be stored one per data element, as in a
 * PixelInterleavedSampleModel or BandedSampleModel, or packed several to
 * an element, as in a SinglePixelPackedSampleModel or
 * MultiPixelPackedSampleModel.  The SampleModel is also
 * controls whether samples are sign extended, allowing unsigned
 * data to be stored in signed Java data types such as byte, short, and
 * int.
 * <p>
 * Although a Raster may live anywhere in the plane, a SampleModel
 * makes use of a simple coordinate system that starts at (0, 0).  A
 * Raster therefore contains a translation factor that allows pixel
 * locations to be mapped between the Raster's coordinate system and
 * that of the SampleModel.  The translation from the SampleModel
 * coordinate system to that of the Raster may be obtained by the
 * getSampleModelTranslateX and getSampleModelTranslateY methods.
 * <p>
 * A Raster may share a DataBuffer with another Raster either by
 * explicit construction or by the use of the createChild and
 * createTranslatedChild methods.  Rasters created by these methods
 * can return a reference to the Raster they were created from by
 * means of the getParent method.  For a Raster that was not
 * constructed by means of a call to createTranslatedChild or
 * createChild, getParent will return null.
 * <p>
 * The createTranslatedChild method returns a new Raster that
 * shares all of the data of the current Raster, but occupies a
 * bounding rectangle of the same width and height but with a
 * different starting point.  For example, if the parent Raster
 * occupied the region (10, 10) to (100, 100), and the translated
 * Raster was defined to start at (50, 50), then pixel (20, 20) of the
 * parent and pixel (60, 60) of the child occupy the same location in
 * the DataBuffer shared by the two Rasters.  In the first case, (-10,
 * -10) should be added to a pixel coordinate to obtain the
 * corresponding SampleModel coordinate, and in the second case (-50,
 * -50) should be added.
 * <p>
 * The translation between a parent and child Raster may be
 * determined by subtracting the child's sampleModelTranslateX and
 * sampleModelTranslateY values from those of the parent.
 * <p>
 * The createChild method may be used to create a new Raster
 * occupying only a subset of its parent's bounding rectangle
 * (with the same or a translated coordinate system) or
 * with a subset of the bands of its parent.
 * <p>
 * All constructors are protected.  The correct way to create a
 * Raster is to use one of the static create methods defined in this
 * class.  These methods create instances of Raster that use the
 * standard Interleaved, Banded, and Packed SampleModels and that may
 * be processed more efficiently than a Raster created by combining
 * an externally generated SampleModel and DataBuffer.
 * @see java.awt.image.DataBuffer
 * @see java.awt.image.SampleModel
 * @see java.awt.image.PixelInterleavedSampleModel
 * @see java.awt.image.BandedSampleModel
 * @see java.awt.image.SinglePixelPackedSampleModel
 * @see java.awt.image.MultiPixelPackedSampleModel
 */
export class Raster extends JObject {
  /**
   * The SampleModel that describes how pixels from this Raster
   * are stored in the DataBuffer.
   */
  sampleModel: SampleModel = null;
  /**
   * The DataBuffer that stores the image data.
   */
  dataBuffer: DataBuffer = null;
  /**
   * The X coordinate of the upper-left pixel of this Raster.
   */
  minX: number = 0;
  /**
   * The Y coordinate of the upper-left pixel of this Raster.
   */
  minY: number = 0;
  /**
   * The width of this Raster.
   */
  width_: number = 0;
  /**
   * The height of this Raster.
   */
  height_: number = 0;
  /**
   * The X translation from the coordinate space of the
   * Raster's SampleModel to that of the Raster.
   */
  sampleModelTranslateX: number = 0;
  /**
   * The Y translation from the coordinate space of the
   * Raster's SampleModel to that of the Raster.
   */
  sampleModelTranslateY: number = 0;
  /**
   * The number of bands in the Raster.
   */
  numBands: number = 0;
  /**
   * The number of DataBuffer data elements per pixel.
   */
  numDataElements: number = 0;
  /**
   * The parent of this Raster, or null.
   */
  parent: Raster = null;
  /**
   * Constructs a Raster with the given SampleModel, DataBuffer, and
   * parent.  aRegion specifies the bounding rectangle of the new
   * Raster.  When translated into the base Raster's coordinate
   * system, aRegion must be contained by the base Raster.
   * (The base Raster is the Raster's ancestor which has no parent.)
   * sampleModelTranslate specifies the sampleModelTranslateX and
   * sampleModelTranslateY values of the new Raster.
   *
   * Note that this constructor should generally be called by other
   * constructors or create methods, it should not be used directly.
   * @param sampleModel     The SampleModel that specifies the layout
   * @param dataBuffer      The DataBuffer that contains the image data
   * @param aRegion         The Rectangle that specifies the image area
   * @param sampleModelTranslate  The Point that specifies the translation
   *                        from SampleModel to Raster coordinates
   * @param parent          The parent (if any) of this raster
   * @throws NullPointerException if any of {@code sampleModel},
   *         {@code dataBuffer}, {@code aRegion} or
   *         {@code sampleModelTranslate} is null
   * @throws RasterFormatException if {@code aRegion} has width
   *         or height less than or equal to zero, or computing either
   *         {@code aRegion.x + aRegion.width} or
   *         {@code aRegion.y + aRegion.height} results in integer
   *         overflow
   */
  _Raster$SampleModel$DataBuffer$Rectangle$Point$Raster(sampleModel: SampleModel, dataBuffer: DataBuffer, aRegion: Rectangle, sampleModelTranslate: Point, parent: Raster): this {
    if ((sampleModel == null) || (dataBuffer == null) || (aRegion == null) || (sampleModelTranslate == null)) {
      throw new NullPointerException('SampleModel, dataBuffer, aRegion and sampleModelTranslate cannot be null');
    }
    this.sampleModel = sampleModel;
    this.dataBuffer = dataBuffer;
    this.minX = aRegion.x_;
    this.minY = aRegion.y_;
    this.width_ = aRegion.width_;
    this.height_ = aRegion.height_;
    if (this.width_ <= 0 || this.height_ <= 0) {
      throw new RasterFormatException()._RasterFormatException('negative or zero ' + ((this.width_ <= 0) ? 'width' : 'height'));
    }
    if (((this.minX + this.width_) | 0) < this.minX) {
      throw new RasterFormatException()._RasterFormatException('overflow condition for X coordinates of Raster');
    }
    if (((this.minY + this.height_) | 0) < this.minY) {
      throw new RasterFormatException()._RasterFormatException('overflow condition for Y coordinates of Raster');
    }
    this.sampleModelTranslateX = sampleModelTranslate.x_;
    this.sampleModelTranslateY = sampleModelTranslate.y_;
    this.numBands = sampleModel.getNumBands();
    this.numDataElements = sampleModel.getNumDataElements();
    this.parent = parent;
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.image.Raster', 'initIDs', this, $a);
  }
  /**
   * Creates a Raster based on a PixelInterleavedSampleModel with the
   * specified data type, width, height, and number of bands.
   *
   * <p> The upper left corner of the Raster is given by the
   * location argument.  If location is null, (0, 0) will be used.
   * The dataType parameter should be one of the enumerated values
   * defined in the DataBuffer class.
   *
   * <p> Note that interleaved {@code DataBuffer.TYPE_INT}
   * Rasters are not supported.  To create a 1-band Raster of type
   * {@code DataBuffer.TYPE_INT}, use
   * Raster.createPackedRaster().
   * <p> The only dataTypes supported currently are TYPE_BYTE
   * and TYPE_USHORT.
   * @param dataType  the data type for storing samples
   * @param w         the width in pixels of the image data
   * @param h         the height in pixels of the image data
   * @param bands     the number of bands
   * @param location  the upper-left corner of the {@code Raster}
   * @return a WritableRaster object with the specified data type,
   *         width, height and number of bands.
   * @throws IllegalArgumentException if {@code dataType} is not
   *         one of the supported data types
   * @throws IllegalArgumentException if {@code bands} is less than 1
   * @throws IllegalArgumentException if {@code w} and {@code h} are not
   *         both > 0
   * @throws IllegalArgumentException if the product of {@code w}
   *         and {@code h} is greater than {@code Integer.MAX_VALUE}
   * @throws RasterFormatException if computing either
   *         {@code location.x + w} or
   *         {@code location.y + h} results in integer overflow
   */
  static createInterleavedRaster$int$int$int$int$Point(dataType: number, w: number, h: number, bands: number, location: Point): WritableRaster {
    if (w <= 0 || h <= 0) {
      throw new IllegalArgumentException('w and h must be > 0');
    }
    let lsz = w * h;
    if (lsz > 2147483647) {
      throw new IllegalArgumentException('Dimensions (width=' + w + ' height=' + h + ') are too large');
    }
    let bandOffsets = $J.newArray(bands, 0);
    for (let i = 0; i < bands; i++) {
      bandOffsets[i] = i;
    }
    return Raster.createInterleavedRaster$int$int$int$int$int$intArr$Point(dataType, w, h, Math.imul(w, bands), bands, bandOffsets, location);
  }
  /**
   * Creates a Raster based on a PixelInterleavedSampleModel with the
   * specified data type, width, height, scanline stride, pixel
   * stride, and band offsets.  The number of bands is inferred from
   * bandOffsets.length.
   *
   * <p> The upper left corner of the Raster is given by the
   * location argument.  If location is null, (0, 0) will be used.
   * The dataType parameter should be one of the enumerated values
   * defined in the DataBuffer class.
   *
   * <p> Note that interleaved {@code DataBuffer.TYPE_INT}
   * Rasters are not supported.  To create a 1-band Raster of type
   * {@code DataBuffer.TYPE_INT}, use
   * Raster.createPackedRaster().
   * <p> The only dataTypes supported currently are TYPE_BYTE
   * and TYPE_USHORT.
   * @param dataType  the data type for storing samples
   * @param w         the width in pixels of the image data
   * @param h         the height in pixels of the image data
   * @param scanlineStride the line stride of the image data
   * @param pixelStride the pixel stride of the image data
   * @param bandOffsets the offsets of all bands
   * @param location  the upper-left corner of the {@code Raster}
   * @return a WritableRaster object with the specified data type,
   *         width, height, scanline stride, pixel stride and band
   *         offsets.
   * @throws IllegalArgumentException if {@code dataType} is not
   *         one of the supported data types, which are
   *         {@code DataBuffer.TYPE_BYTE}, or
   *         {@code DataBuffer.TYPE_USHORT}.
   * @throws IllegalArgumentException if {@code w} and {@code h} are not
   *         both > 0
   * @throws IllegalArgumentException if the product of {@code w}
   *         and {@code h} is greater than {@code Integer.MAX_VALUE}
   * @throws RasterFormatException if computing either
   *         {@code location.x + w} or
   *         {@code location.y + h} results in integer overflow
   * @throws IllegalArgumentException if {@code scanlineStride}
   *         is less than 0
   * @throws IllegalArgumentException if {@code pixelStride} is less than 0
   * @throws NullPointerException if {@code bandOffsets} is null
   */
  static createInterleavedRaster$int$int$int$int$int$intArr$Point(dataType: number, w: number, h: number, scanlineStride: number, pixelStride: number, bandOffsets: number[], location: Point): WritableRaster {
    let d: DataBuffer;
    if (w <= 0 || h <= 0) {
      throw new IllegalArgumentException('w and h must be > 0');
    }
    let lsz = w * h;
    if (lsz > 2147483647) {
      throw new IllegalArgumentException('Dimensions (width=' + w + ' height=' + h + ') are too large');
    }
    if (pixelStride < 0) {
      throw new IllegalArgumentException('pixelStride is < 0');
    }
    if (scanlineStride < 0) {
      throw new IllegalArgumentException('scanlineStride is < 0');
    }
    let size = (Math.imul(scanlineStride, ((h - 1) | 0)) + Math.imul(pixelStride, w)) | 0;
    if (location == null) {
      location = new Point()._Point$int$int(0, 0);
    } else {
      if ((w + location.getX() > 2147483647) || (h + location.getY() > 2147483647)) {
        throw new RasterFormatException()._RasterFormatException('location.x + w and location.y + h  cannot exceed Integer.MAX_VALUE');
      }
    }
    switch (dataType) {
      case DataBuffer.TYPE_BYTE:
        d = new DataBufferByte()._DataBufferByte$int(size);
        break;
      case DataBuffer.TYPE_USHORT:
        d = new DataBufferUShort()._DataBufferUShort$int(size);
        break;
      default:
        throw new IllegalArgumentException('Unsupported data type ' + dataType);
    }
    return Raster.createInterleavedRaster$DataBuffer$int$int$int$int$intArr$Point(d, w, h, scanlineStride, pixelStride, bandOffsets, location);
  }
  /**
   * Creates a Raster based on a SinglePixelPackedSampleModel with
   * the specified data type, width, height, and band masks.
   * The number of bands is inferred from bandMasks.length.
   *
   * <p> The upper left corner of the Raster is given by the
   * location argument.  If location is null, (0, 0) will be used.
   * The dataType parameter should be one of the enumerated values
   * defined in the DataBuffer class.
   *
   * <p> The only dataTypes supported currently are TYPE_BYTE, TYPE_USHORT,
   * and TYPE_INT.
   * @param dataType  the data type for storing samples
   * @param w         the width in pixels of the image data
   * @param h         the height in pixels of the image data
   * @param bandMasks an array containing an entry for each band
   * @param location  the upper-left corner of the {@code Raster}
   * @return a WritableRaster object with the specified data type,
   *         width, height, and band masks.
   * @throws RasterFormatException if {@code w} or {@code h}
   *         is less than or equal to zero, or computing either
   *         {@code location.x + w} or
   *         {@code location.y + h} results in integer
   *         overflow
   * @throws IllegalArgumentException if {@code dataType} is not
   *         one of the supported data types, which are
   *         {@code DataBuffer.TYPE_BYTE},
   *         {@code DataBuffer.TYPE_USHORT}
   *         or {@code DataBuffer.TYPE_INT}
   */
  static createPackedRaster$int$int$int$intArr$Point(dataType: number, w: number, h: number, bandMasks: number[], location: Point): WritableRaster {
    let d: DataBuffer;
    switch (dataType) {
      case DataBuffer.TYPE_BYTE:
        d = new DataBufferByte()._DataBufferByte$int(Math.imul(w, h));
        break;
      case DataBuffer.TYPE_USHORT:
        d = new DataBufferUShort()._DataBufferUShort$int(Math.imul(w, h));
        break;
      case DataBuffer.TYPE_INT:
        d = new DataBufferInt()._DataBufferInt$int(Math.imul(w, h));
        break;
      default:
        throw new IllegalArgumentException('Unsupported data type ' + dataType);
    }
    return Raster.createPackedRaster$DataBuffer$int$int$int$intArr$Point(d, w, h, w, bandMasks, location);
  }
  /**
   * Creates a Raster based on a packed SampleModel with the
   * specified data type, width, height, number of bands, and bits
   * per band.  If the number of bands is one, the SampleModel will
   * be a MultiPixelPackedSampleModel.
   *
   * <p> If the number of bands is more than one, the SampleModel
   * will be a SinglePixelPackedSampleModel, with each band having
   * bitsPerBand bits.  In either case, the requirements on dataType
   * and bitsPerBand imposed by the corresponding SampleModel must
   * be met.
   *
   * <p> The upper left corner of the Raster is given by the
   * location argument.  If location is null, (0, 0) will be used.
   * The dataType parameter should be one of the enumerated values
   * defined in the DataBuffer class.
   *
   * <p> The only dataTypes supported currently are TYPE_BYTE, TYPE_USHORT,
   * and TYPE_INT.
   * @param dataType  the data type for storing samples
   * @param w         the width in pixels of the image data
   * @param h         the height in pixels of the image data
   * @param bands     the number of bands
   * @param bitsPerBand the number of bits per band
   * @param location  the upper-left corner of the {@code Raster}
   * @return a WritableRaster object with the specified data type,
   *         width, height, number of bands, and bits per band.
   * @throws RasterFormatException if {@code w} or {@code h}
   *         is less than or equal to zero, or computing either
   *         {@code location.x + w} or
   *         {@code location.y + h} results in integer
   *         overflow
   * @throws IllegalArgumentException if the product of
   *         {@code bitsPerBand} and {@code bands} is
   *         greater than the number of bits held by
   *         {@code dataType}
   * @throws IllegalArgumentException if {@code bitsPerBand} or
   *         {@code bands} is not greater than zero
   * @throws IllegalArgumentException if {@code dataType} is not
   *         one of the supported data types, which are
   *         {@code DataBuffer.TYPE_BYTE},
   *         {@code DataBuffer.TYPE_USHORT}
   *         or {@code DataBuffer.TYPE_INT}
   */
  static createPackedRaster$int$int$int$int$int$Point(dataType: number, w: number, h: number, bands: number, bitsPerBand: number, location: Point): WritableRaster {
    let d: DataBuffer;
    if (bands <= 0) {
      throw new IllegalArgumentException('Number of bands (' + bands + ') must be greater than 0');
    }
    if (bitsPerBand <= 0) {
      throw new IllegalArgumentException('Bits per band (' + bitsPerBand + ') must be greater than 0');
    }
    if (bands !== 1) {
      let masks = $J.newArray(bands, 0);
      let mask = ((1 << bitsPerBand) - 1) | 0;
      let shift = Math.imul(((bands - 1) | 0), bitsPerBand);
      if (((shift + bitsPerBand) | 0) > DataBuffer.getDataTypeSize(dataType)) {
        throw new IllegalArgumentException('bitsPerBand(' + bitsPerBand + ') * bands is  greater than data type size.');
      }
      switch (dataType) {
        case DataBuffer.TYPE_BYTE:
        case DataBuffer.TYPE_USHORT:
        case DataBuffer.TYPE_INT:
          break;
        default:
          throw new IllegalArgumentException('Unsupported data type ' + dataType);
      }
      for (let i = 0; i < bands; i++) {
        masks[i] = mask << shift;
        shift = (shift - bitsPerBand) | 0;
      }
      return Raster.createPackedRaster$int$int$int$intArr$Point(dataType, w, h, masks, location);
    } else {
      let fw = w;
      switch (dataType) {
        case DataBuffer.TYPE_BYTE:
          d = new DataBufferByte()._DataBufferByte$int(Math.imul($J.d2i((Math.ceil(fw / ($J.idiv(8, bitsPerBand))))), h));
          break;
        case DataBuffer.TYPE_USHORT:
          d = new DataBufferUShort()._DataBufferUShort$int(Math.imul($J.d2i((Math.ceil(fw / ($J.idiv(16, bitsPerBand))))), h));
          break;
        case DataBuffer.TYPE_INT:
          d = new DataBufferInt()._DataBufferInt$int(Math.imul($J.d2i((Math.ceil(fw / ($J.idiv(32, bitsPerBand))))), h));
          break;
        default:
          throw new IllegalArgumentException('Unsupported data type ' + dataType);
      }
      return Raster.createPackedRaster$DataBuffer$int$int$int$Point(d, w, h, bitsPerBand, location);
    }
  }
  /**
   * Creates a Raster based on a PixelInterleavedSampleModel with the
   * specified DataBuffer, width, height, scanline stride, pixel
   * stride, and band offsets.  The number of bands is inferred from
   * bandOffsets.length.  The upper left corner of the Raster
   * is given by the location argument.  If location is null, (0, 0)
   * will be used.
   * <p> Note that interleaved {@code DataBuffer.TYPE_INT}
   * Rasters are not supported.  To create a 1-band Raster of type
   * {@code DataBuffer.TYPE_INT}, use
   * Raster.createPackedRaster().
   * @param dataBuffer the {@code DataBuffer} that contains the
   *        image data
   * @param w         the width in pixels of the image data
   * @param h         the height in pixels of the image data
   * @param scanlineStride the line stride of the image data
   * @param pixelStride the pixel stride of the image data
   * @param bandOffsets the offsets of all bands
   * @param location  the upper-left corner of the {@code Raster}
   * @return a WritableRaster object with the specified
   *         {@code DataBuffer}, width, height, scanline stride,
   *         pixel stride and band offsets.
   * @throws IllegalArgumentException if {@code dataType} is not
   *         one of the supported data types, which are
   *         {@code DataBuffer.TYPE_BYTE},
   *         {@code DataBuffer.TYPE_USHORT}
   * @throws NullPointerException if {@code dataBuffer} is null
   * @throws IllegalArgumentException if {@code dataType} is not
   *         one of the supported data types, which are
   *         {@code DataBuffer.TYPE_BYTE}, or
   *         {@code DataBuffer.TYPE_USHORT}.
   * @throws RasterFormatException if {@code dataBuffer} has more
   *         than one bank.
   * @throws IllegalArgumentException if {@code w} and {@code h} are not
   *         both > 0
   * @throws IllegalArgumentException if the product of {@code w}
   *         and {@code h} is greater than {@code Integer.MAX_VALUE}
   * @throws RasterFormatException if computing either
   *         {@code location.x + w} or
   *         {@code location.y + h} results in integer overflow
   * @throws IllegalArgumentException if {@code scanlineStride}
   *         is less than 0
   * @throws IllegalArgumentException if {@code pixelStride} is less than 0
   * @throws NullPointerException if {@code bandOffsets} is null
   */
  static createInterleavedRaster$DataBuffer$int$int$int$int$intArr$Point(dataBuffer: DataBuffer, w: number, h: number, scanlineStride: number, pixelStride: number, bandOffsets: number[], location: Point): WritableRaster {
    if (dataBuffer == null) {
      throw new NullPointerException('DataBuffer cannot be null');
    }
    if (location == null) {
      location = new Point()._Point$int$int(0, 0);
    } else {
      if ((w + location.getX() > 2147483647) || (h + location.getY() > 2147483647)) {
        throw new RasterFormatException()._RasterFormatException('location.x + w and location.y + h  cannot exceed Integer.MAX_VALUE');
      }
    }
    let dataType = dataBuffer.getDataType();
    let csm = new PixelInterleavedSampleModel()._PixelInterleavedSampleModel(dataType, w, h, pixelStride, scanlineStride, bandOffsets);
    switch (dataType) {
      case DataBuffer.TYPE_BYTE:
        if (dataBuffer instanceof DataBufferByte) {
          return new ByteInterleavedRaster()._ByteInterleavedRaster$SampleModel$DataBufferByte$Point(csm, dataBuffer, location);
        }
        break;
      case DataBuffer.TYPE_USHORT:
        if (dataBuffer instanceof DataBufferUShort) {
          return new ShortInterleavedRaster()._ShortInterleavedRaster$SampleModel$DataBufferUShort$Point(csm, dataBuffer, location);
        }
        break;
      default:
        throw new IllegalArgumentException('Unsupported data type ' + dataType);
    }
    return new SunWritableRaster()._SunWritableRaster$SampleModel$DataBuffer$Point(csm, dataBuffer, location);
  }
  /**
   * Creates a Raster based on a SinglePixelPackedSampleModel with
   * the specified DataBuffer, width, height, scanline stride, and
   * band masks.  The number of bands is inferred from bandMasks.length.
   * The upper left corner of the Raster is given by
   * the location argument.  If location is null, (0, 0) will be used.
   * @param dataBuffer the {@code DataBuffer} that contains the
   *        image data
   * @param w         the width in pixels of the image data
   * @param h         the height in pixels of the image data
   * @param scanlineStride the line stride of the image data
   * @param bandMasks an array containing an entry for each band
   * @param location  the upper-left corner of the {@code Raster}
   * @return a WritableRaster object with the specified
   *         {@code DataBuffer}, width, height, scanline stride,
   *         and band masks.
   * @throws RasterFormatException if {@code w} or {@code h}
   *         is less than or equal to zero, or computing either
   *         {@code location.x + w} or
   *         {@code location.y + h} results in integer
   *         overflow
   * @throws IllegalArgumentException if {@code dataBuffer} is not
   *         one of the supported data types, which are
   *         {@code DataBuffer.TYPE_BYTE},
   *         {@code DataBuffer.TYPE_USHORT}
   *         or {@code DataBuffer.TYPE_INT}
   * @throws RasterFormatException if {@code dataBuffer} has more
   *         than one bank.
   * @throws NullPointerException if {@code dataBuffer} is null
   */
  static createPackedRaster$DataBuffer$int$int$int$intArr$Point(dataBuffer: DataBuffer, w: number, h: number, scanlineStride: number, bandMasks: number[], location: Point): WritableRaster {
    if (dataBuffer == null) {
      throw new NullPointerException('DataBuffer cannot be null');
    }
    if (location == null) {
      location = new Point()._Point$int$int(0, 0);
    }
    let dataType = dataBuffer.getDataType();
    let sppsm = new SinglePixelPackedSampleModel()._SinglePixelPackedSampleModel$int$int$int$int$intArr(dataType, w, h, scanlineStride, bandMasks);
    switch (dataType) {
      case DataBuffer.TYPE_BYTE:
        if (dataBuffer instanceof DataBufferByte) {
          return new ByteInterleavedRaster()._ByteInterleavedRaster$SampleModel$DataBufferByte$Point(sppsm, dataBuffer, location);
        }
        break;
      case DataBuffer.TYPE_USHORT:
        if (dataBuffer instanceof DataBufferUShort) {
          return new ShortInterleavedRaster()._ShortInterleavedRaster$SampleModel$DataBufferUShort$Point(sppsm, dataBuffer, location);
        }
        break;
      case DataBuffer.TYPE_INT:
        if (dataBuffer instanceof DataBufferInt) {
          return new IntegerInterleavedRaster()._IntegerInterleavedRaster$SampleModel$DataBufferInt$Point(sppsm, dataBuffer, location);
        }
        break;
      default:
        throw new IllegalArgumentException('Unsupported data type ' + dataType);
    }
    return new SunWritableRaster()._SunWritableRaster$SampleModel$DataBuffer$Point(sppsm, dataBuffer, location);
  }
  /**
   * Creates a Raster based on a MultiPixelPackedSampleModel with the
   * specified DataBuffer, width, height, and bits per pixel.  The upper
   * left corner of the Raster is given by the location argument.  If
   * location is null, (0, 0) will be used.
   * @param dataBuffer the {@code DataBuffer} that contains the
   *        image data
   * @param w         the width in pixels of the image data
   * @param h         the height in pixels of the image data
   * @param bitsPerPixel the number of bits for each pixel
   * @param location  the upper-left corner of the {@code Raster}
   * @return a WritableRaster object with the specified
   *         {@code DataBuffer}, width, height, and
   *         bits per pixel.
   * @throws RasterFormatException if {@code w} or {@code h}
   *         is less than or equal to zero, or computing either
   *         {@code location.x + w} or
   *         {@code location.y + h} results in integer
   *         overflow
   * @throws IllegalArgumentException if {@code dataType} is not
   *         one of the supported data types, which are
   *         {@code DataBuffer.TYPE_BYTE},
   *         {@code DataBuffer.TYPE_USHORT}
   *         or {@code DataBuffer.TYPE_INT}
   * @throws RasterFormatException if {@code dataBuffer} has more
   *         than one bank.
   * @throws NullPointerException if {@code dataBuffer} is null
   */
  static createPackedRaster$DataBuffer$int$int$int$Point(dataBuffer: DataBuffer, w: number, h: number, bitsPerPixel: number, location: Point): WritableRaster {
    if (dataBuffer == null) {
      throw new NullPointerException('DataBuffer cannot be null');
    }
    if (location == null) {
      location = new Point()._Point$int$int(0, 0);
    }
    let dataType = dataBuffer.getDataType();
    if (dataType !== DataBuffer.TYPE_BYTE && dataType !== DataBuffer.TYPE_USHORT && dataType !== DataBuffer.TYPE_INT) {
      throw new IllegalArgumentException('Unsupported data type ' + dataType);
    }
    if (dataBuffer.getNumBanks() !== 1) {
      throw new RasterFormatException()._RasterFormatException('DataBuffer for packed Rasters must only have 1 bank.');
    }
    let mppsm = new MultiPixelPackedSampleModel()._MultiPixelPackedSampleModel$int$int$int$int(dataType, w, h, bitsPerPixel);
    if (dataBuffer instanceof DataBufferByte && (bitsPerPixel === 1 || bitsPerPixel === 2 || bitsPerPixel === 4)) {
      return new BytePackedRaster()._BytePackedRaster$SampleModel$DataBufferByte$Point(mppsm, dataBuffer, location);
    } else {
      return new SunWritableRaster()._SunWritableRaster$SampleModel$DataBuffer$Point(mppsm, dataBuffer, location);
    }
  }
  /**
   * Creates a WritableRaster with the specified SampleModel and DataBuffer.
   *  The upper left corner of the Raster is given by the location argument.
   *  If location is null, (0, 0) will be used.
   *  @param sm the specified {@code SampleModel}
   *  @param db the specified {@code DataBuffer}
   *  @param location the upper-left corner of the
   *         {@code WritableRaster}
   *  @return a {@code WritableRaster} with the specified
   *          {@code SampleModel}, {@code DataBuffer}, and
   *          location.
   * @throws RasterFormatException if computing either
   *         {@code location.x + sm.getWidth()} or
   *         {@code location.y + sm.getHeight()} results in integer
   *         overflow
   * @throws RasterFormatException if {@code db} has more
   *         than one bank and {@code sm} is a
   *         PixelInterleavedSampleModel, SinglePixelPackedSampleModel,
   *         or MultiPixelPackedSampleModel.
   * @throws NullPointerException if either SampleModel or DataBuffer is null
   */
  static createWritableRaster$SampleModel$DataBuffer$Point(sm: SampleModel, db: DataBuffer, location: Point): WritableRaster {
    if ((sm == null) || (db == null)) {
      throw new NullPointerException('SampleModel and DataBuffer cannot be null');
    }
    if (location == null) {
      location = new Point()._Point$int$int(0, 0);
    }
    let dataType = sm.getDataType();
    if (sm instanceof PixelInterleavedSampleModel) {
      switch (dataType) {
        case DataBuffer.TYPE_BYTE:
          if (db instanceof DataBufferByte) {
            return new ByteInterleavedRaster()._ByteInterleavedRaster$SampleModel$DataBufferByte$Point(sm, db, location);
          }
          break;
        case DataBuffer.TYPE_USHORT:
          if (db instanceof DataBufferUShort) {
            return new ShortInterleavedRaster()._ShortInterleavedRaster$SampleModel$DataBufferUShort$Point(sm, db, location);
          }
          break;
      }
    } else if (sm instanceof SinglePixelPackedSampleModel) {
      switch (dataType) {
        case DataBuffer.TYPE_BYTE:
          if (db instanceof DataBufferByte) {
            return new ByteInterleavedRaster()._ByteInterleavedRaster$SampleModel$DataBufferByte$Point(sm, db, location);
          }
          break;
        case DataBuffer.TYPE_USHORT:
          if (db instanceof DataBufferUShort) {
            return new ShortInterleavedRaster()._ShortInterleavedRaster$SampleModel$DataBufferUShort$Point(sm, db, location);
          }
          break;
        case DataBuffer.TYPE_INT:
          if (db instanceof DataBufferInt) {
            return new IntegerInterleavedRaster()._IntegerInterleavedRaster$SampleModel$DataBufferInt$Point(sm, db, location);
          }
          break;
      }
    } else if (sm instanceof MultiPixelPackedSampleModel && dataType === DataBuffer.TYPE_BYTE && db instanceof DataBufferByte && sm.getSampleSize$int(0) < 8) {
      return new BytePackedRaster()._BytePackedRaster$SampleModel$DataBufferByte$Point(sm, db, location);
    }
    return new SunWritableRaster()._SunWritableRaster$SampleModel$DataBuffer$Point(sm, db, location);
  }
  /**
   * Create a compatible WritableRaster the same size as this Raster with
   * the same SampleModel and a new initialized DataBuffer.
   * @return a compatible {@code WritableRaster} with the same sample
   *         model and a new data buffer.
   */
  createCompatibleWritableRaster$(): WritableRaster {
    return new SunWritableRaster()._SunWritableRaster$SampleModel$Point(this.sampleModel, new Point()._Point$int$int(0, 0));
  }
  /**
   * Create a compatible WritableRaster with the specified size, a new
   * SampleModel, and a new initialized DataBuffer.
   * @param w the specified width of the new {@code WritableRaster}
   * @param h the specified height of the new {@code WritableRaster}
   * @return a compatible {@code WritableRaster} with the specified
   *         size and a new sample model and data buffer.
   * @throws RasterFormatException if the width or height is less than
   *                               or equal to zero.
   */
  createCompatibleWritableRaster$int$int(w: number, h: number): WritableRaster {
    if (w <= 0 || h <= 0) {
      throw new RasterFormatException()._RasterFormatException('negative ' + ((w <= 0) ? 'width' : 'height'));
    }
    let sm = this.sampleModel.createCompatibleSampleModel(w, h);
    return new SunWritableRaster()._SunWritableRaster$SampleModel$Point(sm, new Point()._Point$int$int(0, 0));
  }
  /**
   * Returns the bounding Rectangle of this Raster. This function returns
   * the same information as getMinX/MinY/Width/Height.
   * @return the bounding box of this {@code Raster}.
   */
  getBounds(): Rectangle {
    return new Rectangle()._Rectangle$int$int$int$int(this.minX, this.minY, this.width_, this.height_);
  }
  /**
   * Returns the minimum valid X coordinate of the Raster.
   *  @return the minimum x coordinate of this {@code Raster}.
   */
  getMinX(): number {
    return this.minX;
  }
  /**
   * Returns the minimum valid Y coordinate of the Raster.
   *  @return the minimum y coordinate of this {@code Raster}.
   */
  getMinY(): number {
    return this.minY;
  }
  /**
   * Returns the width in pixels of the Raster.
   *  @return the width of this {@code Raster}.
   */
  getWidth(): number {
    return this.width_;
  }
  /**
   * Returns the height in pixels of the Raster.
   *  @return the height of this {@code Raster}.
   */
  getHeight(): number {
    return this.height_;
  }
  /**
   * Returns the number of bands (samples per pixel) in this Raster.
   *  @return the number of bands of this {@code Raster}.
   */
  getNumBands(): number {
    return this.numBands;
  }
  /**
   * Returns the number of data elements needed to transfer one pixel
   *  via the getDataElements and setDataElements methods.  When pixels
   *  are transferred via these methods, they may be transferred in a
   *  packed or unpacked format, depending on the implementation of the
   *  underlying SampleModel.  Using these methods, pixels are transferred
   *  as an array of getNumDataElements() elements of a primitive type given
   *  by getTransferType().  The TransferType may or may not be the same
   *  as the storage data type of the DataBuffer.
   *  @return the number of data elements.
   */
  getNumDataElements(): number {
    return this.sampleModel.getNumDataElements();
  }
  /**
   * Returns the TransferType used to transfer pixels via the
   *  getDataElements and setDataElements methods.  When pixels
   *  are transferred via these methods, they may be transferred in a
   *  packed or unpacked format, depending on the implementation of the
   *  underlying SampleModel.  Using these methods, pixels are transferred
   *  as an array of getNumDataElements() elements of a primitive type given
   *  by getTransferType().  The TransferType may or may not be the same
   *  as the storage data type of the DataBuffer.  The TransferType will
   *  be one of the types defined in DataBuffer.
   *  @return this transfer type.
   */
  getTransferType(): number {
    return this.sampleModel.getTransferType();
  }
  /**
   * Returns the DataBuffer associated with this Raster.
   *  @return the {@code DataBuffer} of this {@code Raster}.
   */
  getDataBuffer(): DataBuffer {
    return this.dataBuffer;
  }
  /**
   * Returns the SampleModel that describes the layout of the image data.
   *  @return the {@code SampleModel} of this {@code Raster}.
   */
  getSampleModel(): SampleModel {
    return this.sampleModel;
  }
  /**
   * Returns data for a single pixel in a primitive array of type
   * TransferType.  For image data supported by the Java 2D(tm) API,
   * this will be one of DataBuffer.TYPE_BYTE, DataBuffer.TYPE_USHORT,
   * DataBuffer.TYPE_INT, DataBuffer.TYPE_SHORT, DataBuffer.TYPE_FLOAT,
   * or DataBuffer.TYPE_DOUBLE.  Data may be returned in a packed format,
   * thus increasing efficiency for data transfers.
   * An ArrayIndexOutOfBoundsException may be thrown
   * if the coordinates are not in bounds.  However, explicit bounds
   * checking is not guaranteed.
   * A ClassCastException will be thrown if the input object is non null
   * and references anything other than an array of TransferType.
   * @see java.awt.image.SampleModel#getDataElements(int, int, Object, DataBuffer)
   * @param x        The X coordinate of the pixel location
   * @param y        The Y coordinate of the pixel location
   * @param outData  An object reference to an array of type defined by
   *                 getTransferType() and length getNumDataElements().
   *                 If null, an array of appropriate type and size will be
   *                 allocated
   * @return         An object reference to an array of type defined by
   *                 getTransferType() with the requested pixel data.
   *
   * @throws ArrayIndexOutOfBoundsException if the coordinates are not
   * in bounds, or if outData is too small to hold the output.
   */
  getDataElements$int$int$Object(x: number, y: number, outData: any): any {
    return this.sampleModel.getDataElements$int$int$Object$DataBuffer((x - this.sampleModelTranslateX) | 0, (y - this.sampleModelTranslateY) | 0, outData, this.dataBuffer);
  }
  /**
   * Returns the pixel data for the specified rectangle of pixels in a
   * primitive array of type TransferType.
   * For image data supported by the Java 2D API, this
   * will be one of DataBuffer.TYPE_BYTE, DataBuffer.TYPE_USHORT,
   * DataBuffer.TYPE_INT, DataBuffer.TYPE_SHORT, DataBuffer.TYPE_FLOAT,
   * or DataBuffer.TYPE_DOUBLE.  Data may be returned in a packed format,
   * thus increasing efficiency for data transfers.
   * An ArrayIndexOutOfBoundsException may be thrown
   * if the coordinates are not in bounds.  However, explicit bounds
   * checking is not guaranteed.
   * A ClassCastException will be thrown if the input object is non null
   * and references anything other than an array of TransferType.
   * @see java.awt.image.SampleModel#getDataElements(int, int, int, int, Object, DataBuffer)
   * @param x    The X coordinate of the upper-left pixel location
   * @param y    The Y coordinate of the upper-left pixel location
   * @param w    Width of the pixel rectangle
   * @param h   Height of the pixel rectangle
   * @param outData  An object reference to an array of type defined by
   *                 getTransferType() and length w*h*getNumDataElements().
   *                 If null, an array of appropriate type and size will be
   *                 allocated.
   * @return         An object reference to an array of type defined by
   *                 getTransferType() with the requested pixel data.
   *
   * @throws ArrayIndexOutOfBoundsException if the coordinates are not
   * in bounds, or if outData is too small to hold the output.
   */
  getDataElements$int$int$int$int$Object(x: number, y: number, w: number, h: number, outData: any): any {
    return this.sampleModel.getDataElements$int$int$int$int$Object$DataBuffer((x - this.sampleModelTranslateX) | 0, (y - this.sampleModelTranslateY) | 0, w, h, outData, this.dataBuffer);
  }
  /**
   * Returns the samples in an array of int for the specified pixel.
   * An ArrayIndexOutOfBoundsException may be thrown
   * if the coordinates are not in bounds.  However, explicit bounds
   * checking is not guaranteed.
   * @param x The X coordinate of the pixel location
   * @param y The Y coordinate of the pixel location
   * @param iArray An optionally preallocated int array
   * @return the samples for the specified pixel.
   *
   * @throws ArrayIndexOutOfBoundsException if the coordinates are not
   * in bounds, or if iArray is too small to hold the output.
   */
  getPixel$int$int$intArr(x: number, y: number, iArray: number[]): number[] {
    return this.sampleModel.getPixel$int$int$intArr$DataBuffer((x - this.sampleModelTranslateX) | 0, (y - this.sampleModelTranslateY) | 0, iArray, this.dataBuffer);
  }
  /**
   * Returns the samples for a specified band for the specified rectangle
   * of pixels in an int array, one sample per array element.
   * An ArrayIndexOutOfBoundsException may be thrown
   * if the coordinates are not in bounds.  However, explicit bounds
   * checking is not guaranteed.
   * @param x        The X coordinate of the upper-left pixel location
   * @param y        The Y coordinate of the upper-left pixel location
   * @param w        Width of the pixel rectangle
   * @param h        Height of the pixel rectangle
   * @param b        The band to return
   * @param iArray   An optionally pre-allocated int array
   * @return the samples for the specified band for the specified
   *         rectangle of pixels.
   *
   * @throws ArrayIndexOutOfBoundsException if the coordinates or
   * the band index are not in bounds, or if iArray is too small to
   * hold the output.
   */
  getSamples$int$int$int$int$int$intArr(x: number, y: number, w: number, h: number, b: number, iArray: number[]): number[] {
    return this.sampleModel.getSamples$int$int$int$int$int$intArr$DataBuffer((x - this.sampleModelTranslateX) | 0, (y - this.sampleModelTranslateY) | 0, w, h, b, iArray, this.dataBuffer);
  }
  static $clinit() {
    ColorModel.loadLibraries();
    Raster.initIDs();
  }
}

$J.define(Raster, 'java.awt.image.Raster', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.image.SampleModel,java.awt.image.DataBuffer,java.awt.Rectangle,java.awt.Point,java.awt.image.Raster': '_Raster$SampleModel$DataBuffer$Rectangle$Point$Raster', 'java.awt.image.SampleModel,java.awt.image.DataBuffer,java.awt.Point': '_Raster$SampleModel$DataBuffer$Point', 'java.awt.image.SampleModel,java.awt.Point': '_Raster$SampleModel$Point' }, meths: { 'getSamples(int,int,int,int,int,double[])': 'getSamples$int$int$int$int$int$doubleArr', 'getSamples(int,int,int,int,int,float[])': 'getSamples$int$int$int$int$int$floatArr', 'getSamples(int,int,int,int,int,int[])': 'getSamples$int$int$int$int$int$intArr', 'getPixels(int,int,int,int,double[])': 'getPixels$int$int$int$int$doubleArr', 'getPixels(int,int,int,int,float[])': 'getPixels$int$int$int$int$floatArr', 'getPixels(int,int,int,int,int[])': 'getPixels$int$int$int$int$intArr', 'getPixel(int,int,double[])': 'getPixel$int$int$doubleArr', 'getPixel(int,int,float[])': 'getPixel$int$int$floatArr', 'getPixel(int,int,int[])': 'getPixel$int$int$intArr', 'getDataElements(int,int,int,int,java.lang.Object)': 'getDataElements$int$int$int$int$Object', 'getDataElements(int,int,java.lang.Object)': 'getDataElements$int$int$Object', 'createCompatibleWritableRaster(int,int,int,int)': 'createCompatibleWritableRaster$int$int$int$int', 'createCompatibleWritableRaster(java.awt.Rectangle)': 'createCompatibleWritableRaster$Rectangle', 'createCompatibleWritableRaster(int,int)': 'createCompatibleWritableRaster$int$int', 'createCompatibleWritableRaster()': 'createCompatibleWritableRaster$', 'createWritableRaster(java.awt.image.SampleModel,java.awt.image.DataBuffer,java.awt.Point)': 'createWritableRaster$SampleModel$DataBuffer$Point', 'createWritableRaster(java.awt.image.SampleModel,java.awt.Point)': 'createWritableRaster$SampleModel$Point', 'createPackedRaster(java.awt.image.DataBuffer,int,int,int,java.awt.Point)': 'createPackedRaster$DataBuffer$int$int$int$Point', 'createPackedRaster(java.awt.image.DataBuffer,int,int,int,int[],java.awt.Point)': 'createPackedRaster$DataBuffer$int$int$int$intArr$Point', 'createBandedRaster(java.awt.image.DataBuffer,int,int,int,int[],int[],java.awt.Point)': 'createBandedRaster$DataBuffer$int$int$int$intArr$intArr$Point', 'createInterleavedRaster(java.awt.image.DataBuffer,int,int,int,int,int[],java.awt.Point)': 'createInterleavedRaster$DataBuffer$int$int$int$int$intArr$Point', 'createPackedRaster(int,int,int,int,int,java.awt.Point)': 'createPackedRaster$int$int$int$int$int$Point', 'createPackedRaster(int,int,int,int[],java.awt.Point)': 'createPackedRaster$int$int$int$intArr$Point', 'createBandedRaster(int,int,int,int,int[],int[],java.awt.Point)': 'createBandedRaster$int$int$int$int$intArr$intArr$Point', 'createBandedRaster(int,int,int,int,java.awt.Point)': 'createBandedRaster$int$int$int$int$Point', 'createInterleavedRaster(int,int,int,int,int,int[],java.awt.Point)': 'createInterleavedRaster$int$int$int$int$int$intArr$Point', 'createInterleavedRaster(int,int,int,int,java.awt.Point)': 'createInterleavedRaster$int$int$int$int$Point' }, clinit: true, lazy: [] });
$J.module(() => {
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  ColorModel = $J.load('java.awt.image.ColorModel');
  DataBuffer = $J.load('java.awt.image.DataBuffer');
  DataBufferByte = $J.load('java.awt.image.DataBufferByte');
  DataBufferInt = $J.load('java.awt.image.DataBufferInt');
  DataBufferUShort = $J.load('java.awt.image.DataBufferUShort');
  MultiPixelPackedSampleModel = $J.load('java.awt.image.MultiPixelPackedSampleModel');
  PixelInterleavedSampleModel = $J.load('java.awt.image.PixelInterleavedSampleModel');
  RasterFormatException = $J.load('java.awt.image.RasterFormatException');
  SinglePixelPackedSampleModel = $J.load('java.awt.image.SinglePixelPackedSampleModel');
  ByteInterleavedRaster = $J.load('sun.awt.image.ByteInterleavedRaster');
  BytePackedRaster = $J.load('sun.awt.image.BytePackedRaster');
  IntegerInterleavedRaster = $J.load('sun.awt.image.IntegerInterleavedRaster');
  ShortInterleavedRaster = $J.load('sun.awt.image.ShortInterleavedRaster');
  SunWritableRaster = $J.load('sun.awt.image.SunWritableRaster');
});
