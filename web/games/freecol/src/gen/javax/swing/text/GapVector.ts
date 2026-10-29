// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/GapVector.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../jre/index.ts';

/**
 * An implementation of a gapped buffer similar to that used by
 * emacs.  The underlying storage is a java array of some type,
 * which is known only by the subclass of this class.  The array
 * has a gap somewhere.  The gap is moved to the location of changes
 * to take advantage of common behavior where most changes occur
 * in the same location.  Changes that occur at a gap boundary are
 * generally cheap and moving the gap is generally cheaper than
 * moving the array contents directly to accommodate the change.
 *
 * @author  Timothy Prinzing
 * @see GapContent
 */
export class GapVector extends JObject {
  /**
   * The array of items.  The type is determined by the subclass.
   */
  array: any = null;
  /**
   * start of gap in the array
   */
  g0: number = 0;
  /**
   * end of gap in the array
   */
  g1: number = 0;
  /**
   * Creates a new GapVector object.  Initial size defaults to 10.
   */
  _GapVector$(): this {
    this._GapVector$int(10);
    return this;
  }
  /**
   * Creates a new GapVector object, with the initial
   * size specified.
   *
   * @param initialLength the initial size
   */
  _GapVector$int(initialLength: number): this {
    this.array = this.allocateArray(initialLength);
    this.g0 = 0;
    this.g1 = initialLength;
    return this;
  }
  /**
   * Access to the array.  The actual type
   * of the array is known only by the subclass.
   *
   * @return the java array of some type
   */
  getArray(): any {
    return this.array;
  }
  /**
   * Access to the start of the gap.
   *
   * @return the start of the gap
   */
  getGapStart(): number {
    return this.g0;
  }
  /**
   * Access to the end of the gap.
   *
   * @return the end of the gap
   */
  getGapEnd(): number {
    return this.g1;
  }
  /**
   * Replace the given logical position in the storage with
   * the given new items.  This will move the gap to the area
   * being changed if the gap is not currently located at the
   * change location.
   *
   * @param position the location to make the replacement.  This
   *  is not the location in the underlying storage array, but
   *  the location in the contiguous space being modeled.
   * @param rmSize the number of items to remove
   * @param addItems the new items to place in storage.
   * @param addSize the number of items to add
   */
  replace(position: number, rmSize: number, addItems: any, addSize: number): void {
    let addOffset = 0;
    if (addSize === 0) {
      this.close(position, rmSize);
      return;
    } else if (rmSize > addSize) {
      this.close((position + addSize) | 0, (rmSize - addSize) | 0);
    } else {
      let endSize = (addSize - rmSize) | 0;
      let end = this.open((position + rmSize) | 0, endSize);
      $J.system_arraycopy(addItems, rmSize, this.array, end, endSize);
      addSize = rmSize;
    }
    $J.system_arraycopy(addItems, addOffset, this.array, position, addSize);
  }
  /**
   * Delete nItems at position.  Squeezes any marks
   * within the deleted area to position.  This moves
   * the gap to the best place by minimizing it's
   * overall movement.  The gap must intersect the
   * target block.
   */
  close(position: number, nItems: number): void {
    if (nItems === 0) {
      return;
    }
    let end = (position + nItems) | 0;
    let new_gs = (this.g1 - this.g0 + nItems) | 0;
    if (end <= this.g0) {
      if (this.g0 !== end) {
        this.shiftGap(end);
      }
      this.shiftGapStartDown((this.g0 - nItems) | 0);
    } else if (position >= this.g0) {
      if (this.g0 !== position) {
        this.shiftGap(position);
      }
      this.shiftGapEndUp((this.g0 + new_gs) | 0);
    } else {
      this.shiftGapStartDown(position);
      this.shiftGapEndUp((this.g0 + new_gs) | 0);
    }
  }
  /**
   * Make space for the given number of items at the given
   * location.
   *
   * @return the location that the caller should fill in
   */
  open(position: number, nItems: number): number {
    let gapSize = (this.g1 - this.g0) | 0;
    if (nItems === 0) {
      if (position > this.g0) {
        position = (position + gapSize) | 0;
      }
      return position;
    }
    this.shiftGap(position);
    if (nItems >= gapSize) {
      this.shiftEnd((this.getArrayLength() - gapSize + nItems) | 0);
      gapSize = (this.g1 - this.g0) | 0;
    }
    this.g0 = (this.g0 + nItems) | 0;
    return position;
  }
  /**
   * resize the underlying storage array to the
   * given new size
   */
  resize(nsize: number): void {
    let narray = this.allocateArray(nsize);
    $J.system_arraycopy(this.array, 0, narray, 0, Math.min(nsize, this.getArrayLength()));
    this.array = narray;
  }
  /**
   * Make the gap bigger, moving any necessary data and updating
   * the appropriate marks.
   *
   * @param  newSize the new capacity
   */
  shiftEnd(newSize: number): void {
    let oldSize = this.getArrayLength();
    let oldGapEnd = this.g1;
    let upperSize = (oldSize - oldGapEnd) | 0;
    let arrayLength = this.getNewArraySize(newSize);
    let newGapEnd = (arrayLength - upperSize) | 0;
    this.resize(arrayLength);
    this.g1 = newGapEnd;
    if (upperSize !== 0) {
      $J.system_arraycopy(this.array, oldGapEnd, this.array, newGapEnd, upperSize);
    }
  }
  /**
   * Calculates a new size of the storage array depending on required
   * capacity.
   * @param reqSize the size which is necessary for new content
   * @return the new size of the storage array
   */
  getNewArraySize(reqSize: number): number {
    return Math.imul(((reqSize + 1) | 0), 2);
  }
  /**
   * Move the start of the gap to a new location,
   * without changing the size of the gap.  This
   * moves the data in the array and updates the
   * marks accordingly.
   *
   * @param  newGapStart the new start of the gap
   */
  shiftGap(newGapStart: number): void {
    if (newGapStart === this.g0) {
      return;
    }
    let oldGapStart = this.g0;
    let dg = (newGapStart - oldGapStart) | 0;
    let oldGapEnd = this.g1;
    let newGapEnd = (oldGapEnd + dg) | 0;
    let gapSize = (oldGapEnd - oldGapStart) | 0;
    this.g0 = newGapStart;
    this.g1 = newGapEnd;
    if (dg > 0) {
      $J.system_arraycopy(this.array, oldGapEnd, this.array, oldGapStart, dg);
    } else if (dg < 0) {
      $J.system_arraycopy(this.array, newGapStart, this.array, newGapEnd, -dg);
    }
  }
  /**
   * Adjust the gap end downward.  This doesn't move
   * any data, but it does update any marks affected
   * by the boundary change.  All marks from the old
   * gap start down to the new gap start are squeezed
   * to the end of the gap (their location has been
   * removed).
   *
   * @param  newGapStart the new start of the gap
   */
  shiftGapStartDown(newGapStart: number): void {
    this.g0 = newGapStart;
  }
  /**
   * Adjust the gap end upward.  This doesn't move
   * any data, but it does update any marks affected
   * by the boundary change. All marks from the old
   * gap end up to the new gap end are squeezed
   * to the end of the gap (their location has been
   * removed).
   *
   * @param  newGapEnd the new end of the gap
   */
  shiftGapEndUp(newGapEnd: number): void {
    this.g1 = newGapEnd;
  }
}

$J.define(GapVector, 'javax.swing.text.GapVector', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int': '_GapVector$int', '': '_GapVector$' } });
