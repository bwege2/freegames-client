// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/DataBufferDouble.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.
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
 * This class extends {@code DataBuffer} and stores data internally
 * in {@code double} form.
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
 *
 * @since 1.4
 */
export class DataBufferDouble extends DataBuffer {
  /**
   * The array of data banks.
   */
  bankdata: number[][] = null;
  /**
   * A reference to the default data bank.
   */
  data: number[] = null;
  /**
   * Constructs a {@code double}-based {@code DataBuffer}
   * with a specified number of banks, all of which are of a
   * specified size.
   *
   * @param size The number of elements in each bank of the
   *        {@code DataBuffer}.
   * @param numBanks The number of banks in the {@code DataBuffer}.
   */
  _DataBufferDouble$int$int(size: number, numBanks: number): this {
    this._DataBuffer$State$int$int$int(StateTrackable$State.STABLE, DataBuffer.TYPE_DOUBLE, size, numBanks);
    this.bankdata = $J.newArray(numBanks, null);
    for (let i = 0; i < numBanks; i++) {
      this.bankdata[i] = $J.newArray(size, 0);
    }
    this.data = this.bankdata[0];
    return this;
  }
  /**
   * Returns the requested data array element from the first
   * (default) bank as an {@code int}.
   *
   * @param i The desired data array element.
   * @return The data entry as an {@code int}.
   * @see #setElem(int, int)
   * @see #setElem(int, int, int)
   */
  getElem$int(i: number): number {
    return $J.d2i((this.data[(i + this.offset) | 0]));
  }
  /**
   * Returns the requested data array element from the specified
   * bank as an {@code int}.
   *
   * @param bank The bank number.
   * @param i The desired data array element.
   *
   * @return The data entry as an {@code int}.
   * @see #setElem(int, int)
   * @see #setElem(int, int, int)
   */
  getElem$int$int(bank: number, i: number): number {
    return $J.d2i((this.bankdata[bank][(i + this.offsets[bank]) | 0]));
  }
  /**
   * Sets the requested data array element in the first (default)
   * bank to the given {@code int}.
   *
   * @param i The desired data array element.
   * @param val The value to be set.
   * @see #getElem(int)
   * @see #getElem(int, int)
   */
  setElem$int$int(i: number, val: number): void {
    (this.data[(i + this.offset) | 0]) = val;
    this.theTrackable.markDirty();
  }
  /**
   * Sets the requested data array element in the specified bank
   * to the given {@code int}.
   *
   * @param bank The bank number.
   * @param i The desired data array element.
   * @param val The value to be set.
   * @see #getElem(int)
   * @see #getElem(int, int)
   */
  setElem$int$int$int(bank: number, i: number, val: number): void {
    (this.bankdata[bank][(i + this.offsets[bank]) | 0]) = val;
    this.theTrackable.markDirty();
  }
  /**
   * Returns the requested data array element from the specified
   * bank as a {@code float}.
   *
   * @param bank The bank number.
   * @param i The desired data array element.
   *
   * @return The data entry as a {@code float}.
   * @see #setElemFloat(int, float)
   * @see #setElemFloat(int, int, float)
   */
  getElemFloat$int$int(bank: number, i: number): number {
    return Math.fround(this.bankdata[bank][(i + this.offsets[bank]) | 0]);
  }
  /**
   * Sets the requested data array element in the specified bank to
   * the given {@code float}.
   *
   * @param bank The bank number.
   * @param i The desired data array element.
   * @param val The value to be set.
   * @see #getElemFloat(int)
   * @see #getElemFloat(int, int)
   */
  setElemFloat$int$int$float(bank: number, i: number, val: number): void {
    (this.bankdata[bank][(i + this.offsets[bank]) | 0]) = val;
    this.theTrackable.markDirty();
  }
  /**
   * Returns the requested data array element from the specified
   * bank as a {@code double}.
   *
   * @param bank The bank number.
   * @param i The desired data array element.
   *
   * @return The data entry as a {@code double}.
   * @see #setElemDouble(int, double)
   * @see #setElemDouble(int, int, double)
   */
  getElemDouble$int$int(bank: number, i: number): number {
    return this.bankdata[bank][(i + this.offsets[bank]) | 0];
  }
  /**
   * Sets the requested data array element in the specified bank to
   * the given {@code double}.
   *
   * @param bank The bank number.
   * @param i The desired data array element.
   * @param val The value to be set.
   * @see #getElemDouble(int)
   * @see #getElemDouble(int, int)
   */
  setElemDouble$int$int$double(bank: number, i: number, val: number): void {
    (this.bankdata[bank][(i + this.offsets[bank]) | 0]) = val;
    this.theTrackable.markDirty();
  }
}

$J.define(DataBufferDouble, 'java.awt.image.DataBufferDouble', { kind: 'class', sup: 'java.awt.image.DataBuffer', ctors: { 'double[][],int,int[]': '_DataBufferDouble$doubleArrArr$int$intArr', 'double[][],int': '_DataBufferDouble$doubleArrArr$int', 'double[],int,int': '_DataBufferDouble$doubleArr$int$int', 'double[],int': '_DataBufferDouble$doubleArr$int', 'int,int': '_DataBufferDouble$int$int', 'int': '_DataBufferDouble$int' }, meths: { 'setElemDouble(int,int,double)': 'setElemDouble$int$int$double', 'setElemDouble(int,double)': 'setElemDouble$int$double', 'getElemDouble(int,int)': 'getElemDouble$int$int', 'getElemDouble(int)': 'getElemDouble$int', 'setElemFloat(int,int,float)': 'setElemFloat$int$int$float', 'setElemFloat(int,float)': 'setElemFloat$int$float', 'getElemFloat(int,int)': 'getElemFloat$int$int', 'getElemFloat(int)': 'getElemFloat$int', 'setElem(int,int,int)': 'setElem$int$int$int', 'setElem(int,int)': 'setElem$int$int', 'getElem(int,int)': 'getElem$int$int', 'getElem(int)': 'getElem$int', 'getData(int)': 'getData$int', 'getData()': 'getData$' } });
$J.module(() => {
  StateTrackable$State = $J.load('sun.java2d.StateTrackable$State');
});
