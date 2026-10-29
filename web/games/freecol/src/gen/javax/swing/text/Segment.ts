// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/Segment.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { $J, CloneNotSupportedException, IllegalArgumentException, JObject, JString, StringIndexOutOfBoundsException } from '../../../../jre/index.ts';

/**
 * A segment of a character array representing a fragment
 * of text.  It should be treated as immutable even though
 * the array is directly accessible.  This gives fast access
 * to fragments of text without the overhead of copying
 * around characters.  This is effectively an unprotected
 * String.
 * <p>
 * The Segment implements the java.text.CharacterIterator
 * interface to support use with the i18n support without
 * copying text into a string.
 *
 * @author  Timothy Prinzing
 */
export class Segment extends JObject {
  /**
   * This is the array containing the text of
   * interest.  This array should never be modified;
   * it is available only for efficiency.
   */
  array: number[] = null;
  /**
   * This is the offset into the array that
   * the desired text begins.
   */
  offset: number = 0;
  /**
   * This is the number of array elements that
   * make up the text of interest.
   */
  count_: number = 0;
  /**
   * Whether the array is a copy of data or not.
   */
  copy_: boolean = false;
  partialReturn: boolean = false;
  pos: number = 0;
  /**
   * Creates a new segment.
   */
  _Segment$(): this {
    this._Segment$charArr$int$int(null, 0, 0);
    return this;
  }
  /**
   * Creates a new segment referring to an existing array.
   *
   * @param array the array to refer to
   * @param offset the offset into the array
   * @param count the number of characters
   */
  _Segment$charArr$int$int(array: number[], offset: number, count: number): this {
    this.array = array;
    this.offset = offset;
    this.count_ = count;
    this.partialReturn = false;
    return this;
  }
  /**
   * Flag to indicate that partial returns are valid.  If the flag is true,
   * an implementation of the interface method Document.getText(position,length,Segment)
   * should return as much text as possible without making a copy.  The default
   * state of the flag is false which will cause Document.getText(position,length,Segment)
   * to provide the same return behavior it always had, which may or may not
   * make a copy of the text depending upon the request.
   *
   * @param p whether or not partial returns are valid.
   * @since 1.4
   */
  setPartialReturn(p: boolean): void {
    this.partialReturn = p;
  }
  /**
   * Flag to indicate that partial returns are valid.
   *
   * @return whether or not partial returns are valid.
   * @since 1.4
   */
  isPartialReturn(): boolean {
    return this.partialReturn;
  }
  /**
   * Converts a segment into a String.
   *
   * @return the string
   */
  toString(): string {
    if (this.array != null) {
      return JString.newString(this.array, this.offset, this.count_);
    }
    return '';
  }
  /**
   * Sets the position to getBeginIndex() and returns the character at that
   * position.
   * @return the first character in the text, or DONE if the text is empty
   * @see #getBeginIndex
   * @since 1.3
   */
  first(): number {
    this.pos = this.offset;
    if (this.count_ !== 0) {
      return this.array[this.pos];
    }
    return 65535 /* \uffff */;
  }
  /**
   * Sets the position to getEndIndex()-1 (getEndIndex() if the text is empty)
   * and returns the character at that position.
   * @return the last character in the text, or DONE if the text is empty
   * @see #getEndIndex
   * @since 1.3
   */
  last(): number {
    this.pos = (this.offset + this.count_) | 0;
    if (this.count_ !== 0) {
      this.pos = (this.pos - 1) | 0;
      return this.array[this.pos];
    }
    return 65535 /* \uffff */;
  }
  /**
   * Gets the character at the current position (as returned by getIndex()).
   * @return the character at the current position or DONE if the current
   * position is off the end of the text.
   * @see #getIndex
   * @since 1.3
   */
  current(): number {
    if (this.count_ !== 0 && this.pos < ((this.offset + this.count_) | 0)) {
      return this.array[this.pos];
    }
    return 65535 /* \uffff */;
  }
  /**
   * Increments the iterator's index by one and returns the character
   * at the new index.  If the resulting index is greater or equal
   * to getEndIndex(), the current index is reset to getEndIndex() and
   * a value of DONE is returned.
   * @return the character at the new position or DONE if the new
   * position is off the end of the text range.
   * @since 1.3
   */
  next(): number {
    this.pos = (this.pos + 1) | 0;
    let end = (this.offset + this.count_) | 0;
    if (this.pos >= end) {
      this.pos = end;
      return 65535 /* \uffff */;
    }
    return this.current();
  }
  /**
   * Decrements the iterator's index by one and returns the character
   * at the new index. If the current index is getBeginIndex(), the index
   * remains at getBeginIndex() and a value of DONE is returned.
   * @return the character at the new position or DONE if the current
   * position is equal to getBeginIndex().
   * @since 1.3
   */
  previous(): number {
    if (this.pos === this.offset) {
      return 65535 /* \uffff */;
    }
    this.pos = (this.pos - 1) | 0;
    return this.current();
  }
  /**
   * Sets the position to the specified position in the text and returns that
   * character.
   * @param position the position within the text.  Valid values range from
   * getBeginIndex() to getEndIndex().  An IllegalArgumentException is thrown
   * if an invalid value is supplied.
   * @return the character at the specified position or DONE if the specified position is equal to getEndIndex()
   * @since 1.3
   */
  setIndex(position: number): number {
    let end = (this.offset + this.count_) | 0;
    if ((position < this.offset) || (position > end)) {
      throw new IllegalArgumentException('bad position: ' + position);
    }
    this.pos = position;
    if ((this.pos !== end) && (this.count_ !== 0)) {
      return this.array[this.pos];
    }
    return 65535 /* \uffff */;
  }
  /**
   * Returns the start index of the text.
   * @return the index at which the text begins.
   * @since 1.3
   */
  getBeginIndex(): number {
    return this.offset;
  }
  /**
   * Returns the end index of the text.  This index is the index of the first
   * character following the end of the text.
   * @return the index after the last character in the text
   * @since 1.3
   */
  getEndIndex(): number {
    return (this.offset + this.count_) | 0;
  }
  /**
   * Returns the current index.
   * @return the current index.
   * @since 1.3
   */
  getIndex(): number {
    return this.pos;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  charAt(index: number): number {
    if (index < 0 || index >= this.count_) {
      throw new StringIndexOutOfBoundsException(index);
    }
    return this.array[(this.offset + index) | 0];
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  length(): number {
    return this.count_;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  subSequence(start: number, end: number): CharSequence {
    if (start < 0) {
      throw new StringIndexOutOfBoundsException(start);
    }
    if (end > this.count_) {
      throw new StringIndexOutOfBoundsException(end);
    }
    if (start > end) {
      throw new StringIndexOutOfBoundsException((end - start) | 0);
    }
    let segment = new Segment()._Segment$();
    segment.array = this.array;
    segment.offset = (this.offset + start) | 0;
    segment.count_ = (end - start) | 0;
    return segment;
  }
  /**
   * Creates a shallow copy.
   *
   * @return the copy
   */
  clone(): any {
    let o: any;
    try {
      o = super.clone();
    } catch ($e0) {
      if ($J.isa($e0, CloneNotSupportedException)) {
        let cnse = $J.exc($e0);
        o = null;
      } else {
        throw $e0;
      }
    }
    return o;
  }
}

$J.define(Segment, 'javax.swing.text.Segment', { kind: 'class', ifaces: ['java.lang.Cloneable', 'java.text.CharacterIterator', 'java.lang.CharSequence'], sup: 'java.lang.Object', ctors: { 'char[],int,int': '_Segment$charArr$int$int', '': '_Segment$' } });
