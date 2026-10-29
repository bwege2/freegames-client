// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/DataBuffer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject } from '../../../../jre/index.ts';

let SunWritableRaster, StateTrackableDelegate;

/**
 * This class exists to wrap one or more data arrays.  Each data array in
 * the DataBuffer is referred to as a bank.  Accessor methods for getting
 * and setting elements of the DataBuffer's banks exist with and without
 * a bank specifier.  The methods without a bank specifier use the default 0th
 * bank.  The DataBuffer can optionally take an offset per bank, so that
 * data in an existing array can be used even if the interesting data
 * doesn't start at array location zero.  Getting or setting the 0th
 * element of a bank, uses the (0+offset)th element of the array.  The
 * size field specifies how much of the data array is available for
 * use.  Size + offset for a given bank should never be greater
 * than the length of the associated data array.  The data type of
 * a data buffer indicates the type of the data array(s) and may also
 * indicate additional semantics, e.g. storing unsigned 8-bit data
 * in elements of a byte array.  The data type may be TYPE_UNDEFINED
 * or one of the types defined below.  Other types may be added in
 * the future.  Generally, an object of class DataBuffer will be cast down
 * to one of its data type specific subclasses to access data type specific
 * methods for improved performance.  Currently, the Java 2D(tm) API
 * image classes use TYPE_BYTE, TYPE_USHORT, TYPE_INT, TYPE_SHORT,
 * TYPE_FLOAT, and TYPE_DOUBLE DataBuffers to store image data.
 * @see java.awt.image.Raster
 * @see java.awt.image.SampleModel
 */
export class DataBuffer extends JObject {
  /**
   * Tag for unsigned byte data.
   */
  static readonly TYPE_BYTE: number = 0;
  /**
   * Tag for unsigned short data.
   */
  static readonly TYPE_USHORT: number = 1;
  /**
   * Tag for signed short data.
   */
  static readonly TYPE_SHORT: number = 2;
  /**
   * Tag for int data.
   */
  static readonly TYPE_INT: number = 3;
  /**
   * Tag for float data.
   */
  static readonly TYPE_FLOAT: number = 4;
  /**
   * Tag for double data.
   */
  static readonly TYPE_DOUBLE: number = 5;
  /**
   * Tag for undefined data.
   */
  static readonly TYPE_UNDEFINED: number = 32;
  /**
   * The data type of this DataBuffer.
   */
  dataType: number = 0;
  /**
   * The number of banks in this DataBuffer.
   */
  banks: number = 0;
  /**
   * Offset into default (first) bank from which to get the first element.
   */
  offset: number = 0;
  /**
   * Usable size of all banks.
   */
  size_: number = 0;
  /**
   * Offsets into all banks.
   */
  offsets: number[] = null;
  theTrackable: StateTrackableDelegate = null;
  /**
   * Size of the data types indexed by DataType tags defined above.
   */
  static dataTypeSize: number[] = null;
  /**
   * Constructs a DataBuffer containing one bank of the specified
   *  data type and size with the indicated initial {@link State State}.
   *
   *  @param initialState the initial {@link State State} state of the data
   *  @param dataType the data type of this {@code DataBuffer}
   *  @param size the size of the banks
   *  @since 1.7
   */
  _DataBuffer$State$int$int(initialState: StateTrackable$State, dataType: number, size: number): this {
    this.theTrackable = StateTrackableDelegate.createInstance(initialState);
    this.dataType = dataType;
    this.banks = 1;
    this.size_ = size;
    this.offset = 0;
    this.offsets = $J.newArray(1, 0);
    return this;
  }
  /**
   * Constructs a DataBuffer containing the specified number of
   *  banks with the indicated initial {@link State State}.
   *  Each bank has the specified size and an offset of 0.
   *
   *  @param initialState the initial {@link State State} state of the data
   *  @param dataType the data type of this {@code DataBuffer}
   *  @param size the size of the banks
   *  @param numBanks the number of banks in this
   *         {@code DataBuffer}
   *  @since 1.7
   */
  _DataBuffer$State$int$int$int(initialState: StateTrackable$State, dataType: number, size: number, numBanks: number): this {
    this.theTrackable = StateTrackableDelegate.createInstance(initialState);
    this.dataType = dataType;
    this.banks = numBanks;
    this.size_ = size;
    this.offset = 0;
    this.offsets = $J.newArray(this.banks, 0);
    return this;
  }
  /**
   * Returns the size (in bits) of the data type, given a datatype tag.
   * @param type the value of one of the defined datatype tags
   * @return the size of the data type
   * @throws IllegalArgumentException if {@code type} is less than
   *         zero or greater than {@link #TYPE_DOUBLE}
   */
  static getDataTypeSize(type$: number): number {
    if (type$ < DataBuffer.TYPE_BYTE || type$ > DataBuffer.TYPE_DOUBLE) {
      throw new IllegalArgumentException('Unknown data type ' + type$);
    }
    return DataBuffer.dataTypeSize[type$];
  }
  /**
   * Returns the data type of this DataBuffer.
   *   @return the data type of this {@code DataBuffer}.
   */
  getDataType(): number {
    return this.dataType;
  }
  /**
   * Returns the offset of the default bank in array elements.
   *  @return the offset of the default bank.
   */
  getOffset(): number {
    return this.offset;
  }
  /**
   * Returns the number of banks in this DataBuffer.
   *  @return the number of banks.
   */
  getNumBanks(): number {
    return this.banks;
  }
  /**
   * Returns the requested data array element from the specified bank
   * as a float.  The implementation in this class is to cast
   * {@link #getElem(int, int)}
   * to a float.  Subclasses can override this method if another
   * implementation is needed.
   * @param bank the specified bank
   * @param i the index of the requested data array element
   * @return a float value representing the data array element from the
   * specified bank at the specified index.
   * @see #setElemFloat(int, float)
   * @see #setElemFloat(int, int, float)
   */
  getElemFloat$int$int(bank: number, i: number): number {
    return Math.fround(this.getElem$int$int(bank, i));
  }
  /**
   * Sets the requested data array element in the specified bank
   * from the given float.  The implementation in this class is to cast
   * val to an int and call {@link #setElem(int, int)}.  Subclasses can
   * override this method if another implementation is needed.
   * @param bank the specified bank
   * @param i the specified index
   * @param val the value to set the element in the specified bank at
   * the specified index in the data array
   * @see #getElemFloat(int)
   * @see #getElemFloat(int, int)
   */
  setElemFloat$int$int$float(bank: number, i: number, val: number): void {
    this.setElem$int$int$int(bank, i, $J.d2i(val));
  }
  /**
   * Returns the requested data array element from the specified bank as
   * a double.  The implementation in this class is to cast getElem(bank, i)
   * to a double.  Subclasses may override this method if another
   * implementation is needed.
   * @param bank the specified bank
   * @param i the specified index
   * @return a double value representing the element from the specified
   * bank at the specified index in the data array.
   * @see #setElemDouble(int, double)
   * @see #setElemDouble(int, int, double)
   */
  getElemDouble$int$int(bank: number, i: number): number {
    return this.getElem$int$int(bank, i);
  }
  /**
   * Sets the requested data array element in the specified bank
   * from the given double.  The implementation in this class is to cast
   * val to an int and call {@link #setElem(int, int)}.  Subclasses can
   * override this method if another implementation is needed.
   * @param bank the specified bank
   * @param i the specified index
   * @param val the value to set the element in the specified bank
   * at the specified index of the data array
   * @see #getElemDouble(int)
   * @see #getElemDouble(int, int)
   */
  setElemDouble$int$int$double(bank: number, i: number, val: number): void {
    this.setElem$int$int$int(bank, i, $J.d2i(val));
  }
  static toIntArray(obj: any): number[] {
    if (Array.isArray(obj)) {
      return obj;
    } else if (obj == null) {
      return null;
    } else if (Array.isArray(obj)) {
      let sdata = obj;
      let idata = $J.newArray(sdata.length, 0);
      for (let i = 0; i < sdata.length; i++) {
        idata[i] = sdata[i] & 65535;
      }
      return idata;
    } else if (Array.isArray(obj)) {
      let bdata = obj;
      let idata = $J.newArray(bdata.length, 0);
      for (let i = 0; i < bdata.length; i++) {
        idata[i] = 255 & bdata[i];
      }
      return idata;
    }
    return null;
  }
  static $clinit() {
    DataBuffer.dataTypeSize = [8, 16, 16, 32, 32, 64];
    SunWritableRaster.setDataStealer(new (DataBuffer$1())());
  }
}

let $DataBuffer$1: any = null;
/** An anonymous class (DataBuffer.java:519). */
function DataBuffer$1(): any {
  return $DataBuffer$1 ??= $J.local(class extends JObject {
    getData$DataBufferByte$int(dbb: DataBufferByte, bank: number): number[] {
      return dbb.bankdata[bank];
    }
    getData$DataBufferUShort$int(dbus: DataBufferUShort, bank: number): number[] {
      return dbus.bankdata[bank];
    }
    getData$DataBufferInt$int(dbi: DataBufferInt, bank: number): number[] {
      return dbi.bankdata[bank];
    }
    getTrackable(db: DataBuffer): StateTrackableDelegate {
      return db.theTrackable;
    }
  }, 'java.awt.image.DataBuffer$1', ['sun.awt.image.SunWritableRaster$DataStealer']);
}

$J.define(DataBuffer, 'java.awt.image.DataBuffer', { kind: 'class', sup: 'java.lang.Object', ctors: { 'sun.java2d.StateTrackable$State,int,int,int,int[]': '_DataBuffer$State$int$int$int$intArr', 'int,int,int,int[]': '_DataBuffer$int$int$int$intArr', 'sun.java2d.StateTrackable$State,int,int,int,int': '_DataBuffer$State$int$int$int$int', 'int,int,int,int': '_DataBuffer$int$int$int$int', 'sun.java2d.StateTrackable$State,int,int,int': '_DataBuffer$State$int$int$int', 'int,int,int': '_DataBuffer$int$int$int', 'sun.java2d.StateTrackable$State,int,int': '_DataBuffer$State$int$int', 'int,int': '_DataBuffer$int$int' }, meths: { 'setElemDouble(int,int,double)': 'setElemDouble$int$int$double', 'setElemDouble(int,double)': 'setElemDouble$int$double', 'getElemDouble(int,int)': 'getElemDouble$int$int', 'getElemDouble(int)': 'getElemDouble$int', 'setElemFloat(int,int,float)': 'setElemFloat$int$int$float', 'setElemFloat(int,float)': 'setElemFloat$int$float', 'getElemFloat(int,int)': 'getElemFloat$int$int', 'getElemFloat(int)': 'getElemFloat$int', 'setElem(int,int,int)': 'setElem$int$int$int', 'setElem(int,int)': 'setElem$int$int', 'getElem(int,int)': 'getElem$int$int', 'getElem(int)': 'getElem$int' }, clinit: true, lazy: ['dataTypeSize'] });
$J.module(() => {
  SunWritableRaster = $J.load('sun.awt.image.SunWritableRaster');
  StateTrackableDelegate = $J.load('sun.java2d.StateTrackableDelegate');
});
