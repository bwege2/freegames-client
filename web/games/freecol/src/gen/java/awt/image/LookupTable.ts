// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/LookupTable.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, JObject } from '../../../../jre/index.ts';

/**
 * This abstract class defines a lookup table object.  ByteLookupTable
 * and ShortLookupTable are subclasses, which
 * contain byte and short data, respectively.  A lookup table
 * contains data arrays for one or more bands (or components) of an image
 * (for example, separate arrays for R, G, and B),
 * and it contains an offset which will be subtracted from the
 * input values before indexing into the arrays.  This allows an array
 * smaller than the native data size to be provided for a
 * constrained input.  If there is only one array in the lookup
 * table, it will be applied to all bands.  All arrays must be the
 * same size.
 *
 * @see ByteLookupTable
 * @see ShortLookupTable
 * @see LookupOp
 */
export class LookupTable extends JObject {
  /**
   * Constants
   */
  numComponents: number = 0;
  offset: number = 0;
  numEntries: number = 0;
  /**
   * Constructs a new LookupTable from the number of components and an offset
   * into the lookup table.
   * @param offset the offset to subtract from input values before indexing
   *        into the data arrays for this {@code LookupTable}
   * @param numComponents the number of data arrays in this
   *        {@code LookupTable}
   * @throws IllegalArgumentException if {@code offset} is less than 0
   *         or if {@code numComponents} is less than 1
   */
  _LookupTable(offset: number, numComponents: number): this {
    if (offset < 0) {
      throw new IllegalArgumentException('Offset must be greater than 0');
    }
    if (numComponents < 1) {
      throw new IllegalArgumentException('Number of components must  be at least 1');
    }
    this.numComponents = numComponents;
    this.offset = offset;
    return this;
  }
  /**
   * Returns the number of components in the lookup table.
   * @return the number of components in this {@code LookupTable}.
   */
  getNumComponents(): number {
    return this.numComponents;
  }
  /**
   * Returns the offset.
   * @return the offset of this {@code LookupTable}.
   */
  getOffset(): number {
    return this.offset;
  }
}

$J.define(LookupTable, 'java.awt.image.LookupTable', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int': '_LookupTable' }, meths: { 'lookupPixel(int[],int[])': 'lookupPixel$intArr$intArr' } });
