// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/GapContent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Arrays, JObject, JString, ReferenceQueue, Vector, WeakReference } from '../../../../jre/index.ts';
import { GapVector } from './GapVector.ts';
import { AbstractUndoableEdit } from '../undo/AbstractUndoableEdit.ts';

let BadLocationException, Segment;

/**
 * An implementation of the AbstractDocument.Content interface
 * implemented using a gapped buffer similar to that used by emacs.
 * The underlying storage is an array of Unicode characters with
 * a gap somewhere.  The gap is moved to the location of changes
 * to take advantage of common behavior where most changes are
 * in the same location.  Changes that occur at a gap boundary are
 * generally cheap and moving the gap is generally cheaper than
 * moving the array contents directly to accommodate the change.
 * <p>
 * The positions tracking change are also generally cheap to
 * maintain.  The Position implementations (marks) store the array
 * index and can easily calculate the sequential position from
 * the current gap location.  Changes only require updating the
 * marks between the old and new gap boundaries when the gap
 * is moved, so generally updating the marks is pretty cheap.
 * The marks are stored sorted so they can be located quickly
 * with a binary search.  This increases the cost of adding a
 * mark, and decreases the cost of keeping the mark updated.
 *
 * @author  Timothy Prinzing
 */
export class GapContent extends GapVector {
  static empty: number[] = null;
  marks: GapContent$MarkVector = null;
  /**
   * Record used for searching for the place to
   * start updating mark indexes when the gap
   * boundaries are moved.
   */
  search_: GapContent$MarkData = null;
  /**
   * The number of unused mark entries
   */
  unusedMarks: number = 0;
  queue: ReferenceQueue<GapContent$StickyPosition> = null;
  static readonly GROWTH_SIZE: number = 524288;
  $init_GapContent() {
    this.unusedMarks = 0;
  }
  /**
   * Creates a new GapContent object.  Initial size defaults to 10.
   */
  _GapContent$(): this {
    this._GapContent$int(10);
    return this;
  }
  /**
   * Creates a new GapContent object, with the initial
   * size specified.  The initial size will not be allowed
   * to go below 2, to give room for the implied break and
   * the gap.
   *
   * @param initialLength the initial size
   */
  _GapContent$int(initialLength: number): this {
    this._GapVector$int(Math.max(initialLength, 2));
    this.$init_GapContent();
    let implied = $J.newArray(1, 0);
    implied[0] = 10 /* \u000a */;
    this.replace(0, 0, implied, implied.length);
    this.marks = new GapContent$MarkVector()._GapContent$MarkVector$();
    this.search_ = new GapContent$MarkData().$o(this)._GapContent$MarkData$int(0);
    this.queue = new ReferenceQueue();
    return this;
  }
  /**
   * Allocate an array to store items of the type
   * appropriate (which is determined by the subclass).
   */
  allocateArray(len: number): any {
    return $J.newArray(len, 0);
  }
  /**
   * Get the length of the allocated array.
   */
  getArrayLength(): number {
    let carray = this.getArray();
    return carray.length;
  }
  resize(nsize: number): void {
    let carray = this.getArray();
    super.resize(nsize);
    Arrays.fill(carray, 0 /* \u0000 */);
  }
  /**
   * Returns the length of the content.
   *
   * @return the length &gt;= 1
   * @see AbstractDocument.Content#length
   */
  length(): number {
    let len = (this.getArrayLength() - (this.getGapEnd() - this.getGapStart())) | 0;
    return len;
  }
  /**
   * Inserts a string into the content.
   *
   * @param where the starting position &gt;= 0, &lt; length()
   * @param str the non-null string to insert
   * @return an UndoableEdit object for undoing
   * @throws BadLocationException if the specified position is invalid
   * @see AbstractDocument.Content#insertString
   */
  insertString(where: number, str: string): UndoableEdit {
    if (where > this.length() || where < 0) {
      throw new BadLocationException()._BadLocationException('Invalid insert', this.length());
    }
    let chars = JString.toCharArray(str);
    this.replace(where, 0, chars, chars.length);
    return new GapContent$InsertUndo().$o(this)._GapContent$InsertUndo(where, str.length);
  }
  /**
   * Removes part of the content.
   *
   * @param where the starting position &gt;= 0, where + nitems &lt; length()
   * @param nitems the number of characters to remove &gt;= 0
   * @return an UndoableEdit object for undoing
   * @throws BadLocationException if the specified position is invalid
   * @see AbstractDocument.Content#remove
   */
  remove(where: number, nitems: number): UndoableEdit {
    if (((where + nitems) | 0) >= this.length()) {
      throw new BadLocationException()._BadLocationException('Invalid remove', (this.length() + 1) | 0);
    }
    let removedString = this.getString(where, nitems);
    let edit = new GapContent$RemoveUndo().$o(this)._GapContent$RemoveUndo(where, removedString);
    this.replace(where, nitems, GapContent.empty, 0);
    return edit;
  }
  /**
   * Retrieves a portion of the content.
   *
   * @param where the starting position &gt;= 0
   * @param len the length to retrieve &gt;= 0
   * @return a string representing the content
   * @throws BadLocationException if the specified position is invalid
   * @see AbstractDocument.Content#getString
   */
  getString(where: number, len: number): string {
    let s = new Segment()._Segment$();
    this.getChars(where, len, s);
    return JString.newString(s.array, s.offset, s.count_);
  }
  /**
   * Retrieves a portion of the content.  If the desired content spans
   * the gap, we copy the content.  If the desired content does not
   * span the gap, the actual store is returned to avoid the copy since
   * it is contiguous.
   *
   * @param where the starting position &gt;= 0, where + len &lt;= length()
   * @param len the number of characters to retrieve &gt;= 0
   * @param chars the Segment object to return the characters in
   * @throws BadLocationException if the specified position is invalid
   * @see AbstractDocument.Content#getChars
   */
  getChars(where: number, len: number, chars: Segment): void {
    let end = (where + len) | 0;
    if (where < 0 || end < 0) {
      throw new BadLocationException()._BadLocationException('Invalid location', -1);
    }
    if (end > this.length() || where > this.length()) {
      throw new BadLocationException()._BadLocationException('Invalid location', (this.length() + 1) | 0);
    }
    let g0 = this.getGapStart();
    let g1 = this.getGapEnd();
    let array = this.getArray();
    if (((where + len) | 0) <= g0) {
      chars.array = array;
      chars.copy_ = false;
      chars.offset = where;
    } else if (where >= g0) {
      chars.array = array;
      chars.copy_ = false;
      chars.offset = (g1 + where - g0) | 0;
    } else {
      let before = (g0 - where) | 0;
      if (chars.isPartialReturn()) {
        chars.array = array;
        chars.copy_ = false;
        chars.offset = where;
        chars.count_ = before;
        return;
      }
      chars.array = $J.newArray(len, 0);
      chars.copy_ = true;
      chars.offset = 0;
      $J.system_arraycopy(array, where, chars.array, 0, before);
      $J.system_arraycopy(array, g1, chars.array, before, (len - before) | 0);
    }
    chars.count_ = len;
  }
  /**
   * Creates a position within the content that will
   * track change as the content is mutated.
   *
   * @param offset the offset to track &gt;= 0
   * @return the position
   * @throws BadLocationException if the specified position is invalid
   */
  createPosition(offset: number): Position {
    while (this.queue.poll() != null) {
      this.unusedMarks++;
    }
    if (this.unusedMarks > Math.max(5, ($J.idiv(this.marks.size(), 10)))) {
      this.removeUnusedMarks();
    }
    let g0 = this.getGapStart();
    let g1 = this.getGapEnd();
    let index = (offset < g0) ? offset : (offset + (g1 - g0)) | 0;
    this.search_.index_ = index;
    let sortIndex = this.findSortIndex(this.search_);
    let m: GapContent$MarkData;
    let position: GapContent$StickyPosition;
    if (sortIndex < this.marks.size() && (m = this.marks.elementAt(sortIndex)).index_ === index && (position = m.getPosition()) != null) {
    } else {
      position = new GapContent$StickyPosition().$o(this)._GapContent$StickyPosition();
      m = new GapContent$MarkData().$o(this)._GapContent$MarkData$int$StickyPosition$ReferenceQueue(index, position, this.queue);
      position.setMark(m);
      this.marks.insertElementAt(m, sortIndex);
    }
    return position;
  }
  /**
   * Make the gap bigger, moving any necessary data and updating
   * the appropriate marks
   */
  shiftEnd(newSize: number): void {
    let oldGapEnd = this.getGapEnd();
    super.shiftEnd(newSize);
    let dg = (this.getGapEnd() - oldGapEnd) | 0;
    let adjustIndex = this.findMarkAdjustIndex(oldGapEnd);
    let n = this.marks.size();
    for (let i = adjustIndex; i < n; i++) {
      let mark = this.marks.elementAt(i);
      mark.index_ = (mark.index_ + dg) | 0;
    }
  }
  /**
   * Overridden to make growth policy less aggressive for large
   * text amount.
   */
  getNewArraySize(reqSize: number): number {
    if (reqSize < GapContent.GROWTH_SIZE) {
      return super.getNewArraySize(reqSize);
    } else {
      return (reqSize + GapContent.GROWTH_SIZE) | 0;
    }
  }
  /**
   * Move the start of the gap to a new location,
   * without changing the size of the gap.  This
   * moves the data in the array and updates the
   * marks accordingly.
   */
  shiftGap(newGapStart: number): void {
    let oldGapStart = this.getGapStart();
    let dg = (newGapStart - oldGapStart) | 0;
    let oldGapEnd = this.getGapEnd();
    let newGapEnd = (oldGapEnd + dg) | 0;
    let gapSize = (oldGapEnd - oldGapStart) | 0;
    super.shiftGap(newGapStart);
    if (dg > 0) {
      let adjustIndex = this.findMarkAdjustIndex(oldGapStart);
      let n = this.marks.size();
      for (let i = adjustIndex; i < n; i++) {
        let mark = this.marks.elementAt(i);
        if (mark.index_ >= newGapEnd) {
          break;
        }
        mark.index_ = (mark.index_ - gapSize) | 0;
      }
    } else if (dg < 0) {
      let adjustIndex = this.findMarkAdjustIndex(newGapStart);
      let n = this.marks.size();
      for (let i = adjustIndex; i < n; i++) {
        let mark = this.marks.elementAt(i);
        if (mark.index_ >= oldGapEnd) {
          break;
        }
        mark.index_ = (mark.index_ + gapSize) | 0;
      }
    }
    this.resetMarksAtZero();
  }
  /**
   * Resets all the marks that have an offset of 0 to have an index of
   * zero as well.
   */
  resetMarksAtZero(): void {
    if (this.marks != null && this.getGapStart() === 0) {
      let g1 = this.getGapEnd();
      for (let counter = 0, maxCounter = this.marks.size(); counter < maxCounter; counter++) {
        let mark = this.marks.elementAt(counter);
        if (mark.index_ <= g1) {
          mark.index_ = 0;
        } else {
          break;
        }
      }
    }
  }
  /**
   * Adjust the gap end downward.  This doesn't move
   * any data, but it does update any marks affected
   * by the boundary change.  All marks from the old
   * gap start down to the new gap start are squeezed
   * to the end of the gap (their location has been
   * removed).
   */
  shiftGapStartDown(newGapStart: number): void {
    let adjustIndex = this.findMarkAdjustIndex(newGapStart);
    let n = this.marks.size();
    let g0 = this.getGapStart();
    let g1 = this.getGapEnd();
    for (let i = adjustIndex; i < n; i++) {
      let mark = this.marks.elementAt(i);
      if (mark.index_ > g0) {
        break;
      }
      mark.index_ = g1;
    }
    super.shiftGapStartDown(newGapStart);
    this.resetMarksAtZero();
  }
  /**
   * Adjust the gap end upward.  This doesn't move
   * any data, but it does update any marks affected
   * by the boundary change. All marks from the old
   * gap end up to the new gap end are squeezed
   * to the end of the gap (their location has been
   * removed).
   */
  shiftGapEndUp(newGapEnd: number): void {
    let adjustIndex = this.findMarkAdjustIndex(this.getGapEnd());
    let n = this.marks.size();
    for (let i = adjustIndex; i < n; i++) {
      let mark = this.marks.elementAt(i);
      if (mark.index_ >= newGapEnd) {
        break;
      }
      mark.index_ = newGapEnd;
    }
    super.shiftGapEndUp(newGapEnd);
    this.resetMarksAtZero();
  }
  /**
   * Compares two marks.
   *
   * @param o1 the first object
   * @param o2 the second object
   * @return < 0 if o1 < o2, 0 if the same, > 0 if o1 > o2
   */
  compare(o1: GapContent$MarkData, o2: GapContent$MarkData): number {
    return $J.icmp(o1.index_, o2.index_);
  }
  /**
   * Finds the index to start mark adjustments given
   * some search index.
   */
  findMarkAdjustIndex(searchIndex: number): number {
    this.search_.index_ = Math.max(searchIndex, 1);
    let index = this.findSortIndex(this.search_);
    for (let i = (index - 1) | 0; i >= 0; i--) {
      let d = this.marks.elementAt(i);
      if (d.index_ !== this.search_.index_) {
        break;
      }
      index = (index - 1) | 0;
    }
    return index;
  }
  /**
   * Finds the index of where to insert a new mark.
   *
   * @param o the mark to insert
   * @return the index
   */
  findSortIndex(o: GapContent$MarkData): number {
    let lower = 0;
    let upper = (this.marks.size() - 1) | 0;
    let mid = 0;
    if (upper === -1) {
      return 0;
    }
    let cmp: number;
    let last = this.marks.elementAt(upper);
    cmp = this.compare(o, last);
    if (cmp > 0) {
      return (upper + 1) | 0;
    }
    while (lower <= upper) {
      mid = (lower + ($J.idiv(((upper - lower) | 0), 2))) | 0;
      let entry = this.marks.elementAt(mid);
      cmp = this.compare(o, entry);
      if (cmp === 0) {
        return mid;
      } else if (cmp < 0) {
        upper = (mid - 1) | 0;
      } else {
        lower = (mid + 1) | 0;
      }
    }
    return (cmp < 0) ? mid : (mid + 1) | 0;
  }
  /**
   * Remove all unused marks out of the sorted collection
   * of marks.
   */
  removeUnusedMarks(): void {
    let n = this.marks.size();
    let cleaned = new GapContent$MarkVector()._GapContent$MarkVector$int(n);
    for (let i = 0; i < n; i++) {
      let mark = this.marks.elementAt(i);
      if (mark.get() != null) {
        cleaned.addElement(mark);
      }
    }
    this.marks = cleaned;
    this.unusedMarks = 0;
  }
  /**
   * Returns a Vector containing instances of UndoPosRef for the
   * Positions in the range
   * <code>offset</code> to <code>offset</code> + <code>length</code>.
   * If <code>v</code> is not null the matching Positions are placed in
   * there. The vector with the resulting Positions are returned.
   *
   * @param v the Vector to use, with a new one created on null
   * @param offset the starting offset &gt;= 0
   * @param length the length &gt;= 0
   * @return the set of instances
   */
  getPositionsInRange(v: Vector, offset: number, length: number): Vector {
    let endOffset = (offset + length) | 0;
    let startIndex: number;
    let endIndex: number;
    let g0 = this.getGapStart();
    let g1 = this.getGapEnd();
    if (offset < g0) {
      if (offset === 0) {
        startIndex = 0;
      } else {
        startIndex = this.findMarkAdjustIndex(offset);
      }
      if (endOffset >= g0) {
        endIndex = this.findMarkAdjustIndex((endOffset + (g1 - g0) + 1) | 0);
      } else {
        endIndex = this.findMarkAdjustIndex((endOffset + 1) | 0);
      }
    } else {
      startIndex = this.findMarkAdjustIndex((offset + (g1 - g0)) | 0);
      endIndex = this.findMarkAdjustIndex((endOffset + (g1 - g0) + 1) | 0);
    }
    let placeIn = (v == null) ? new Vector(Math.max(1, (endIndex - startIndex) | 0)) : v;
    for (let counter = startIndex; counter < endIndex; counter++) {
      placeIn.addElement(new GapContent$UndoPosRef().$o(this)._GapContent$UndoPosRef(this.marks.elementAt(counter)));
    }
    return placeIn;
  }
  static $clinit() {
    GapContent.empty = $J.newArray(0, 0);
  }
}

/**
 * Holds the data for a mark... separately from
 * the real mark so that the real mark (Position
 * that the caller of createPosition holds) can be
 * collected if there are no more references to
 * it.  The update table holds only a reference
 * to this data.
 */
export class GapContent$MarkData extends WeakReference {
  index_: number = 0;
  _GapContent$MarkData$int(index: number): this {
    this._WeakReference(null);
    this.index_ = index;
    return this;
  }
  _GapContent$MarkData$int$StickyPosition$ReferenceQueue(index: number, position: GapContent$StickyPosition, queue: ReferenceQueue<any>): this {
    this._WeakReference(position, queue);
    this.index_ = index;
    return this;
  }
  /**
   * Fetch the location in the contiguous sequence
   * being modeled.  The index in the gap array
   * is held by the mark, so it is adjusted according
   * to it's relationship to the gap.
   */
  getOffset(): number {
    let g0 = this.$outer.getGapStart();
    let g1 = this.$outer.getGapEnd();
    let offs = (this.index_ < g0) ? this.index_ : (this.index_ - (g1 - g0)) | 0;
    return Math.max(offs, 0);
  }
  getPosition(): GapContent$StickyPosition {
    return this.get();
  }
}

export class GapContent$StickyPosition extends JObject {
  mark_: GapContent$MarkData = null;
  _GapContent$StickyPosition(): this {
    return this;
  }
  setMark(mark: GapContent$MarkData): void {
    this.mark_ = mark;
  }
  getOffset(): number {
    return this.mark_.getOffset();
  }
  toString(): string {
    return String(this.getOffset());
  }
}

export class GapContent$MarkVector extends GapVector {
  oneMark: GapContent$MarkData[] = null;
  $init_GapContent_MarkVector() {
    this.oneMark = $J.newArray(1, null);
  }
  _GapContent$MarkVector$(): this {
    this._GapVector$();
    this.$init_GapContent_MarkVector();
    return this;
  }
  _GapContent$MarkVector$int(size: number): this {
    this._GapVector$int(size);
    this.$init_GapContent_MarkVector();
    return this;
  }
  /**
   * Allocate an array to store items of the type
   * appropriate (which is determined by the subclass).
   */
  allocateArray(len: number): any {
    return $J.newArray(len, null);
  }
  /**
   * Get the length of the allocated array
   */
  getArrayLength(): number {
    let marks = this.getArray();
    return marks.length;
  }
  /**
   * Returns the number of marks currently held
   */
  size(): number {
    let len = (this.getArrayLength() - (this.getGapEnd() - this.getGapStart())) | 0;
    return len;
  }
  /**
   * Inserts a mark into the vector
   */
  insertElementAt(m: GapContent$MarkData, index: number): void {
    this.oneMark[0] = m;
    this.replace(index, 0, this.oneMark, 1);
  }
  /**
   * Add a mark to the end
   */
  addElement(m: GapContent$MarkData): void {
    this.insertElementAt(m, this.size());
  }
  /**
   * Fetches the mark at the given index
   */
  elementAt(index: number): GapContent$MarkData {
    let g0 = this.getGapStart();
    let g1 = this.getGapEnd();
    let array = this.getArray();
    if (index < g0) {
      return array[index];
    } else {
      index = (index + (g1 - g0)) | 0;
      return array[index];
    }
  }
}

/**
 * Used to hold a reference to a Mark that is being reset as the
 * result of removing from the content.
 */
export class GapContent$UndoPosRef extends JObject {
  /**
   * Previous Offset of rec.
   */
  undoLocation: number = 0;
  /**
   * Mark to reset offset.
   */
  rec: GapContent$MarkData = null;
  _GapContent$UndoPosRef(rec: GapContent$MarkData): this {
    this.rec = rec;
    this.undoLocation = rec.getOffset();
    return this;
  }
}

/**
 * UnoableEdit created for inserts.
 */
export class GapContent$InsertUndo extends AbstractUndoableEdit {
  /**
   * Where string was inserted.
   */
  offset: number = 0;
  /**
   * Length of string inserted.
   */
  length_: number = 0;
  /**
   * The string that was inserted. This will only be valid after an
   * undo.
   */
  string: string = null;
  /**
   * An array of instances of UndoPosRef for the Positions in the
   * range that was removed, valid after undo.
   */
  posRefs: Vector = null;
  _GapContent$InsertUndo(offset: number, length: number): this {
    this._AbstractUndoableEdit();
    this.offset = offset;
    this.length_ = length;
    return this;
  }
}

/**
 * UndoableEdit created for removes.
 */
export class GapContent$RemoveUndo extends AbstractUndoableEdit {
  /**
   * Where the string was removed from.
   */
  offset: number = 0;
  /**
   * Length of string removed.
   */
  length_: number = 0;
  /**
   * The string that was removed. This is valid when redo is valid.
   */
  string: string = null;
  /**
   * An array of instances of UndoPosRef for the Positions in the
   * range that was removed, valid before undo.
   */
  posRefs: Vector<GapContent$UndoPosRef> = null;
  _GapContent$RemoveUndo(offset: number, string$: string): this {
    this._AbstractUndoableEdit();
    this.offset = offset;
    this.string = string$;
    this.length_ = string$.length;
    this.posRefs = this.$outer.getPositionsInRange(null, offset, this.length_);
    return this;
  }
}

$J.define(GapContent, 'javax.swing.text.GapContent', { kind: 'class', ifaces: ['javax.swing.text.AbstractDocument$Content', 'java.io.Serializable'], sup: 'javax.swing.text.GapVector', ctors: { 'int': '_GapContent$int', '': '_GapContent$' }, clinit: true, lazy: ['empty'] });
$J.define(GapContent$MarkData, 'javax.swing.text.GapContent$MarkData', { kind: 'class', sup: 'java.lang.ref.WeakReference', ctors: { 'int,javax.swing.text.GapContent$StickyPosition,java.lang.ref.ReferenceQueue': '_GapContent$MarkData$int$StickyPosition$ReferenceQueue', 'int': '_GapContent$MarkData$int' }, inner: true });
$J.define(GapContent$StickyPosition, 'javax.swing.text.GapContent$StickyPosition', { kind: 'class', ifaces: ['javax.swing.text.Position'], sup: 'java.lang.Object', ctors: { '': '_GapContent$StickyPosition' }, inner: true });
$J.define(GapContent$MarkVector, 'javax.swing.text.GapContent$MarkVector', { kind: 'class', sup: 'javax.swing.text.GapVector', ctors: { 'int': '_GapContent$MarkVector$int', '': '_GapContent$MarkVector$' } });
$J.define(GapContent$UndoPosRef, 'javax.swing.text.GapContent$UndoPosRef', { kind: 'class', sup: 'java.lang.Object', ctors: { 'javax.swing.text.GapContent$MarkData': '_GapContent$UndoPosRef' }, inner: true });
$J.define(GapContent$InsertUndo, 'javax.swing.text.GapContent$InsertUndo', { kind: 'class', sup: 'javax.swing.undo.AbstractUndoableEdit', ctors: { 'int,int': '_GapContent$InsertUndo' }, inner: true });
$J.define(GapContent$RemoveUndo, 'javax.swing.text.GapContent$RemoveUndo', { kind: 'class', sup: 'javax.swing.undo.AbstractUndoableEdit', ctors: { 'int,java.lang.String': '_GapContent$RemoveUndo' }, inner: true });
$J.module(() => {
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  Segment = $J.load('javax.swing.text.Segment');
});
