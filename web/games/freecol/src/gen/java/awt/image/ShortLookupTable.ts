// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/ShortLookupTable.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayIndexOutOfBoundsException } from '../../../../jre/index.ts';
import { LookupTable } from './LookupTable.ts';

/**
 * This class defines a lookup table object.  The output of a
 * lookup operation using an object of this class is interpreted
 * as an unsigned short quantity.  The lookup table contains short
 * data arrays for one or more bands (or components) of an image,
 * and it contains an offset which will be subtracted from the
 * input values before indexing the arrays.  This allows an array
 * smaller than the native data size to be provided for a
 * constrained input.  If there is only one array in the lookup
 * table, it will be applied to all bands.
 *
 * @see ByteLookupTable
 * @see LookupOp
 */
export class ShortLookupTable extends LookupTable {
  /**
   * Constants
   */
  data: number[][] = null;
  /**
   * Constructs a ShortLookupTable object from an array of short
   * arrays representing a lookup table for each
   * band.  The offset will be subtracted from the input
   * values before indexing into the arrays.  The number of
   * bands is the length of the data argument.  The
   * data array for each band is stored as a reference.
   * @param offset the value subtracted from the input values
   *        before indexing into the arrays
   * @param data an array of short arrays representing a lookup
   *        table for each band
   */
  _ShortLookupTable$int$shortArrArr(offset: number, data: number[][]): this {
    this._LookupTable(offset, data.length);
    this.numComponents = data.length;
    this.numEntries = data[0].length;
    this.data = $J.newArray(this.numComponents, null);
    for (let i = 0; i < this.numComponents; i++) {
      this.data[i] = data[i];
    }
    return this;
  }
  /**
   * Returns the lookup table data by reference.  If this ShortLookupTable
   * was constructed using a single short array, the length of the returned
   * array is one.
   * @return ShortLookupTable data array.
   */
  getTable(): number[][] {
    return this.data;
  }
  /**
   * Returns an array of samples of a pixel, translated with the lookup
   * table. The source and destination array can be the same array.
   * Array {@code dst} is returned.
   *
   * @param src the source array.
   * @param dst the destination array. This array must be at least as
   *         long as {@code src}.  If {@code dst} is
   *         {@code null}, a new array will be allocated having the
   *         same length as {@code src}.
   * @return the array {@code dst}, an {@code int} array of
   *         samples.
   * @throws ArrayIndexOutOfBoundsException if {@code src} is
   *            longer than {@code dst} or if for any element
   *            {@code i} of {@code src},
   *            {@code (src[i]&0xffff)-offset} is either less than
   *            zero or greater than or equal to the length of the
   *            lookup table for any band.
   */
  lookupPixel$intArr$intArr(src: number[], dst: number[]): number[] {
    if (dst == null) {
      dst = $J.newArray(src.length, 0);
    }
    if (this.numComponents === 1) {
      for (let i = 0; i < src.length; i++) {
        let s = ((src[i] & 65535) - this.offset) | 0;
        if (s < 0) {
          throw new ArrayIndexOutOfBoundsException('src[' + i + ']-offset is less than zero');
        }
        dst[i] = this.data[0][s];
      }
    } else {
      for (let i = 0; i < src.length; i++) {
        let s = ((src[i] & 65535) - this.offset) | 0;
        if (s < 0) {
          throw new ArrayIndexOutOfBoundsException('src[' + i + ']-offset is less than zero');
        }
        dst[i] = this.data[i][s];
      }
    }
    return dst;
  }
}

$J.define(ShortLookupTable, 'java.awt.image.ShortLookupTable', { kind: 'class', sup: 'java.awt.image.LookupTable', ctors: { 'int,short[]': '_ShortLookupTable$int$shortArr', 'int,short[][]': '_ShortLookupTable$int$shortArrArr' }, meths: { 'lookupPixel(short[],short[])': 'lookupPixel$shortArr$shortArr', 'lookupPixel(int[],int[])': 'lookupPixel$intArr$intArr' } });
