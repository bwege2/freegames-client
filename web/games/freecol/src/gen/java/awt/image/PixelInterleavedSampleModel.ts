// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/PixelInterleavedSampleModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException } from '../../../../jre/index.ts';
import { ComponentSampleModel } from './ComponentSampleModel.ts';

/**
 * This class represents image data which is stored in a pixel interleaved
 *  fashion and for
 *  which each sample of a pixel occupies one data element of the DataBuffer.
 *  It subclasses ComponentSampleModel but provides a more efficient
 *  implementation for accessing pixel interleaved image data than is provided
 *  by ComponentSampleModel.  This class
 *  stores sample data for all bands in a single bank of the
 *  DataBuffer. Accessor methods are provided so that image data can be
 *  manipulated directly. Pixel stride is the number of
 *  data array elements between two samples for the same band on the same
 *  scanline. Scanline stride is the number of data array elements between
 *  a given sample and the corresponding sample in the same column of the next
 *  scanline.  Band offsets denote the number
 *  of data array elements from the first data array element of the bank
 *  of the DataBuffer holding each band to the first sample of the band.
 *  The bands are numbered from 0 to N-1.
 *  Bank indices denote the correspondence between a bank of the data buffer
 *  and a band of image data.
 *  This class supports
 *  {@link DataBuffer#TYPE_BYTE TYPE_BYTE},
 *  {@link DataBuffer#TYPE_USHORT TYPE_USHORT},
 *  {@link DataBuffer#TYPE_SHORT TYPE_SHORT},
 *  {@link DataBuffer#TYPE_INT TYPE_INT},
 *  {@link DataBuffer#TYPE_FLOAT TYPE_FLOAT} and
 *  {@link DataBuffer#TYPE_DOUBLE TYPE_DOUBLE} datatypes.
 */
export class PixelInterleavedSampleModel extends ComponentSampleModel {
  /**
   * Constructs a PixelInterleavedSampleModel with the specified parameters.
   * The number of bands will be given by the length of the bandOffsets
   * array.
   * @param dataType  The data type for storing samples.
   * @param w         The width (in pixels) of the region of
   *                  image data described.
   * @param h         The height (in pixels) of the region of
   *                  image data described.
   * @param pixelStride The pixel stride of the image data.
   * @param scanlineStride The line stride of the image data.
   * @param bandOffsets The offsets of all bands.
   * @throws IllegalArgumentException if {@code w} or
   *         {@code h} is not greater than 0
   * @throws IllegalArgumentException if any offset between bands is
   *         greater than the scanline stride
   * @throws IllegalArgumentException if the product of
   *         {@code pixelStride} and {@code w} is greater
   *         than {@code scanlineStride}
   * @throws IllegalArgumentException if {@code pixelStride} is
   *         less than any offset between bands
   * @throws IllegalArgumentException if {@code dataType} is not
   *         one of the supported data types
   */
  _PixelInterleavedSampleModel(dataType: number, w: number, h: number, pixelStride: number, scanlineStride: number, bandOffsets: number[]): this {
    this._ComponentSampleModel$int$int$int$int$int$intArr(dataType, w, h, pixelStride, scanlineStride, bandOffsets);
    let minBandOff = this.bandOffsets[0];
    let maxBandOff = this.bandOffsets[0];
    for (let i = 1; i < this.bandOffsets.length; i++) {
      minBandOff = Math.min(minBandOff, this.bandOffsets[i]);
      maxBandOff = Math.max(maxBandOff, this.bandOffsets[i]);
    }
    maxBandOff = (maxBandOff - minBandOff) | 0;
    if (maxBandOff > scanlineStride) {
      throw new IllegalArgumentException('Offsets between bands must be less than the scanline  stride');
    }
    if (Math.imul(pixelStride, w) > scanlineStride) {
      throw new IllegalArgumentException('Pixel stride times width must be less than or equal to the scanline stride');
    }
    if (pixelStride < maxBandOff) {
      throw new IllegalArgumentException('Pixel stride must be greater than or equal to the offsets between bands');
    }
    return this;
  }
  /**
   * Creates a new PixelInterleavedSampleModel with the specified
   * width and height.  The new PixelInterleavedSampleModel will have the
   * same number of bands, storage data type, and pixel stride
   * as this PixelInterleavedSampleModel.  The band offsets may be
   * compressed such that the minimum of all of the band offsets is zero.
   * @param w the width of the resulting {@code SampleModel}
   * @param h the height of the resulting {@code SampleModel}
   * @return a new {@code SampleModel} with the specified width
   *         and height.
   * @throws IllegalArgumentException if {@code w} or
   *         {@code h} is not greater than 0
   */
  createCompatibleSampleModel(w: number, h: number): SampleModel {
    let minBandoff = this.bandOffsets[0];
    let numBands = this.bandOffsets.length;
    for (let i = 1; i < numBands; i++) {
      if (this.bandOffsets[i] < minBandoff) {
        minBandoff = this.bandOffsets[i];
      }
    }
    let bandOff: number[];
    if (minBandoff > 0) {
      bandOff = $J.newArray(numBands, 0);
      for (let i = 0; i < numBands; i++) {
        bandOff[i] = (this.bandOffsets[i] - minBandoff) | 0;
      }
    } else {
      bandOff = this.bandOffsets;
    }
    return new PixelInterleavedSampleModel()._PixelInterleavedSampleModel(this.dataType, w, h, this.pixelStride, Math.imul(this.pixelStride, w), bandOff);
  }
  hashCode(): number {
    return super.hashCode() ^ 1;
  }
}

$J.define(PixelInterleavedSampleModel, 'java.awt.image.PixelInterleavedSampleModel', { kind: 'class', sup: 'java.awt.image.ComponentSampleModel', ctors: { 'int,int,int,int,int,int[]': '_PixelInterleavedSampleModel' } });
