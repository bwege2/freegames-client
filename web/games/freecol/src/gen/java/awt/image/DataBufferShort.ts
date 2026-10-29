// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/DataBufferShort.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { DataBuffer } from './DataBuffer.ts';

let StateTrackable$State;

/**
 * This class extends {@code DataBuffer} and stores data internally as shorts.
 * <p>
 * <a id="optimizations">
 * Note that some implementations may function more efficiently
 * if they can maintain control over how the data for an image is
 * stored.
 * For example, optimizations such as caching an image in video
 * memory require that the implementation track all modifications
 * to that data.
 * Other implementations may operate better if they can store the
 * data in locations other than a Java array.
 * To maintain optimum compatibility with various optimizations
 * it is best to avoid constructors and methods which expose the
 * underlying storage as a Java array as noted below in the
 * documentation for those methods.
 * </a>
 */
export class DataBufferShort extends DataBuffer {
  /**
   * The default data bank.
   */
  data: number[] = null;
  /**
   * All data banks
   */
  bankdata: number[][] = null;
  /**
   * Constructs a short-based {@code DataBuffer} with the specified number of
   * banks all of which are the specified size.
   *
   * @param size The size of the banks in the {@code DataBuffer}.
   * @param numBanks The number of banks in the {@code DataBuffer}.
   */
  _DataBufferShort$int$int(size: number, numBanks: number): this {
    this._DataBuffer$State$int$int$int(StateTrackable$State.STABLE, DataBuffer.TYPE_SHORT, size, numBanks);
    this.bankdata = $J.newArray(numBanks, null);
    for (let i = 0; i < numBanks; i++) {
      this.bankdata[i] = $J.newArray(size, 0);
    }
    this.data = this.bankdata[0];
    return this;
  }
  /**
   * Returns the requested data array element from the first (default) bank.
   *
   * @param i The data array element you want to get.
   * @return The requested data array element as an integer.
   * @see #setElem(int, int)
   * @see #setElem(int, int, int)
   */
  getElem$int(i: number): number {
    return (this.data[(i + this.offset) | 0]);
  }
  /**
   * Returns the requested data array element from the specified bank.
   *
   * @param bank The bank from which you want to get a data array element.
   * @param i The data array element you want to get.
   * @return The requested data array element as an integer.
   * @see #setElem(int, int)
   * @see #setElem(int, int, int)
   */
  getElem$int$int(bank: number, i: number): number {
    return (this.bankdata[bank][(i + this.offsets[bank]) | 0]);
  }
  /**
   * Sets the requested data array element in the first (default) bank
   * to the specified value.
   *
   * @param i The data array element you want to set.
   * @param val The integer value to which you want to set the data array element.
   * @see #getElem(int)
   * @see #getElem(int, int)
   */
  setElem$int$int(i: number, val: number): void {
    (this.data[(i + this.offset) | 0]) = ((val) << 16) >> 16;
    this.theTrackable.markDirty();
  }
  /**
   * Sets the requested data array element in the specified bank
   * from the given integer.
   * @param bank The bank in which you want to set the data array element.
   * @param i The data array element you want to set.
   * @param val The integer value to which you want to set the specified data array element.
   * @see #getElem(int)
   * @see #getElem(int, int)
   */
  setElem$int$int$int(bank: number, i: number, val: number): void {
    (this.bankdata[bank][(i + this.offsets[bank]) | 0]) = ((val) << 16) >> 16;
    this.theTrackable.markDirty();
  }
}

$J.define(DataBufferShort, 'java.awt.image.DataBufferShort', { kind: 'class', sup: 'java.awt.image.DataBuffer', ctors: { 'short[][],int,int[]': '_DataBufferShort$shortArrArr$int$intArr', 'short[][],int': '_DataBufferShort$shortArrArr$int', 'short[],int,int': '_DataBufferShort$shortArr$int$int', 'short[],int': '_DataBufferShort$shortArr$int', 'int,int': '_DataBufferShort$int$int', 'int': '_DataBufferShort$int' }, meths: { 'setElem(int,int,int)': 'setElem$int$int$int', 'setElem(int,int)': 'setElem$int$int', 'getElem(int,int)': 'getElem$int$int', 'getElem(int)': 'getElem$int', 'getData(int)': 'getData$int', 'getData()': 'getData$' } });
$J.module(() => {
  StateTrackable$State = $J.load('sun.java2d.StateTrackable$State');
});
