// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/InternationalFormatter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, AttributedCharacterIterator_Attribute, BitSet, ClassCastException, IllegalArgumentException, JString, NullPointerException, ParseException } from '../../../../jre/index.ts';
import { DefaultFormatter } from './DefaultFormatter.ts';
import { DefaultFormatter$ReplaceHolder } from './DefaultFormatter.ts';
import { AbstractAction } from '../AbstractAction.ts';

let BadLocationException;

/**
 * <code>InternationalFormatter</code> extends <code>DefaultFormatter</code>,
 * using an instance of <code>java.text.Format</code> to handle the
 * conversion to a String, and the conversion from a String.
 * <p>
 * If <code>getAllowsInvalid()</code> is false, this will ask the
 * <code>Format</code> to format the current text on every edit.
 * <p>
 * You can specify a minimum and maximum value by way of the
 * <code>setMinimum</code> and <code>setMaximum</code> methods. In order
 * for this to work the values returned from <code>stringToValue</code> must be
 * comparable to the min/max values by way of the <code>Comparable</code>
 * interface.
 * <p>
 * Be careful how you configure the <code>Format</code> and the
 * <code>InternationalFormatter</code>, as it is possible to create a
 * situation where certain values can not be input. Consider the date
 * format 'M/d/yy', an <code>InternationalFormatter</code> that is always
 * valid (<code>setAllowsInvalid(false)</code>), is in overwrite mode
 * (<code>setOverwriteMode(true)</code>) and the date 7/1/99. In this
 * case the user will not be able to enter a two digit month or day of
 * month. To avoid this, the format should be 'MM/dd/yy'.
 * <p>
 * If <code>InternationalFormatter</code> is configured to only allow valid
 * values (<code>setAllowsInvalid(false)</code>), every valid edit will result
 * in the text of the <code>JFormattedTextField</code> being completely reset
 * from the <code>Format</code>.
 * The cursor position will also be adjusted as literal characters are
 * added/removed from the resulting String.
 * <p>
 * <code>InternationalFormatter</code>'s behavior of
 * <code>stringToValue</code> is  slightly different than that of
 * <code>DefaultTextFormatter</code>, it does the following:
 * <ol>
 *   <li><code>parseObject</code> is invoked on the <code>Format</code>
 *       specified by <code>setFormat</code>
 *   <li>If a Class has been set for the values (<code>setValueClass</code>),
 *       supers implementation is invoked to convert the value returned
 *       from <code>parseObject</code> to the appropriate class.
 *   <li>If a <code>ParseException</code> has not been thrown, and the value
 *       is outside the min/max a <code>ParseException</code> is thrown.
 *   <li>The value is returned.
 * </ol>
 * <code>InternationalFormatter</code> implements <code>stringToValue</code>
 * in this manner so that you can specify an alternate Class than
 * <code>Format</code> may return.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @see java.text.Format
 * @see java.lang.Comparable
 *
 * @since 1.4
 */
export class InternationalFormatter extends DefaultFormatter {
  /**
   * Used by <code>getFields</code>.
   */
  static EMPTY_FIELD_ARRAY: Format_Field[] = null;
  /**
   * Object used to handle the conversion.
   */
  format_: Format = null;
  /**
   * Can be used to impose a maximum value.
   */
  max_: Comparable<any> = null;
  /**
   * Can be used to impose a minimum value.
   */
  min: Comparable<any> = null;
  /**
   * A bit is set for every index identified in the
   * AttributedCharacterIterator that is not considered decoration.
   * This should only be used if validMask is true.
   */
  literalMask: BitSet = null;
  /**
   * Used to iterate over characters.
   */
  iterator_: AttributedCharacterIterator = null;
  /**
   * True if the Format was able to convert the value to a String and
   * back.
   */
  validMask: boolean = false;
  /**
   * Current value being displayed.
   */
  string: string = null;
  /**
   * If true, DocumentFilter methods are unconditionally allowed,
   * and no checking is done on their values. This is used when
   * incrementing/decrementing via the actions.
   */
  ignoreDocumentMutate: boolean = false;
  /**
   * Creates an <code>InternationalFormatter</code> with no
   * <code>Format</code> specified.
   */
  _InternationalFormatter$(): this {
    this._DefaultFormatter();
    this.setOverwriteMode(false);
    return this;
  }
  /**
   * Creates an <code>InternationalFormatter</code> with the specified
   * <code>Format</code> instance.
   *
   * @param format Format instance used for converting from/to Strings
   */
  _InternationalFormatter$Format(format: Format): this {
    this._InternationalFormatter$();
    this.setFormat$Format(format);
    return this;
  }
  /**
   * Sets the format that dictates the legal values that can be edited
   * and displayed.
   *
   * @param format <code>Format</code> instance used for converting
   * from/to Strings
   */
  setFormat$Format(format: Format): void {
    this.format_ = format;
  }
  /**
   * Returns the format that dictates the legal values that can be edited
   * and displayed.
   *
   * @return Format instance used for converting from/to Strings
   */
  getFormat(): Format {
    return this.format_;
  }
  /**
   * Returns the minimum permissible value.
   *
   * @return Minimum legal value that can be input
   */
  getMinimum(): Comparable<any> {
    return this.min;
  }
  /**
   * Returns the maximum permissible value.
   *
   * @return Maximum legal value that can be input
   */
  getMaximum(): Comparable<any> {
    return this.max_;
  }
  /**
   * Installs the <code>DefaultFormatter</code> onto a particular
   * <code>JFormattedTextField</code>.
   * This will invoke <code>valueToString</code> to convert the
   * current value from the <code>JFormattedTextField</code> to
   * a String. This will then install the <code>Action</code>s from
   * <code>getActions</code>, the <code>DocumentFilter</code>
   * returned from <code>getDocumentFilter</code> and the
   * <code>NavigationFilter</code> returned from
   * <code>getNavigationFilter</code> onto the
   * <code>JFormattedTextField</code>.
   * <p>
   * Subclasses will typically only need to override this if they
   * wish to install additional listeners on the
   * <code>JFormattedTextField</code>.
   * <p>
   * If there is a <code>ParseException</code> in converting the
   * current value to a String, this will set the text to an empty
   * String, and mark the <code>JFormattedTextField</code> as being
   * in an invalid state.
   * <p>
   * While this is a public method, this is typically only useful
   * for subclassers of <code>JFormattedTextField</code>.
   * <code>JFormattedTextField</code> will invoke this method at
   * the appropriate times when the value changes, or its internal
   * state changes.
   *
   * @param ftf JFormattedTextField to format for, may be null indicating
   *            uninstall from current JFormattedTextField.
   */
  install(ftf: JFormattedTextField): void {
    super.install(ftf);
    this.updateMaskIfNecessary();
    this.positionCursorAtInitialLocation();
  }
  /**
   * Returns a String representation of the Object <code>value</code>.
   * This invokes <code>format</code> on the current <code>Format</code>.
   *
   * @throws ParseException if there is an error in the conversion
   * @param value Value to convert
   * @return String representation of value
   */
  valueToString(value: any): string {
    if (value == null) {
      return '';
    }
    let f = this.getFormat();
    if (f == null) {
      return $J.str(value);
    }
    return f.format(value);
  }
  /**
   * Returns the <code>Object</code> representation of the
   * <code>String</code> <code>text</code>.
   *
   * @param text <code>String</code> to convert
   * @return <code>Object</code> representation of text
   * @throws ParseException if there is an error in the conversion
   */
  stringToValue$String(text: string): any {
    let value = this.stringToValue$String$Format(text, this.getFormat());
    if (value != null && this.getValueClass() != null && !this.getValueClass().isInstance(value)) {
      value = super.stringToValue$String($J.str(value));
    }
    try {
      if (!this.isValidValue(value, true)) {
        throw new ParseException('Value not within min/max range', 0);
      }
    } catch ($e0) {
      if ($J.isa($e0, ClassCastException)) {
        let cce = $J.exc($e0);
        throw new ParseException('Class cast exception comparing values: ' + $J.str(cce), 0);
      } else {
        throw $e0;
      }
    }
    return value;
  }
  /**
   * Returns the <code>Format.Field</code> constants associated with
   * the text at <code>offset</code>. If <code>offset</code> is not
   * a valid location into the current text, this will return an
   * empty array.
   *
   * @param offset offset into text to be examined
   * @return Format.Field constants associated with the text at the
   *         given position.
   */
  getFields(offset: number): Format_Field[] {
    if (this.getAllowsInvalid()) {
      this.updateMask$();
    }
    let attrs = this.getAttributes(offset);
    if (attrs != null && attrs.size() > 0) {
      let al = new ArrayList();
      al.addAll(attrs.keySet());
      return $J.toArrayInto(al.toArray(), InternationalFormatter.EMPTY_FIELD_ARRAY);
    }
    return InternationalFormatter.EMPTY_FIELD_ARRAY;
  }
  /**
   * Creates a copy of the DefaultFormatter.
   *
   * @return copy of the DefaultFormatter
   */
  clone(): any {
    let formatter = super.clone();
    formatter.literalMask = null;
    formatter.iterator_ = null;
    formatter.validMask = false;
    formatter.string = null;
    return formatter;
  }
  /**
   * If <code>getSupportsIncrement</code> returns true, this returns
   * two Actions suitable for incrementing/decrementing the value.
   */
  getActions(): Action[] {
    if (this.getSupportsIncrement()) {
      return [new InternationalFormatter$IncrementAction().$o(this)._InternationalFormatter$IncrementAction('increment', 1), new InternationalFormatter$IncrementAction().$o(this)._InternationalFormatter$IncrementAction('decrement', -1)];
    }
    return null;
  }
  /**
   * Invokes <code>parseObject</code> on <code>f</code>, returning
   * its value.
   */
  stringToValue$String$Format(text: string, f: Format): any {
    if (f == null) {
      return text;
    }
    return f.parseObject(text);
  }
  /**
   * Returns true if <code>value</code> is between the min/max.
   *
   * @param wantsCCE If false, and a ClassCastException is thrown in
   *                 comparing the values, the exception is consumed and
   *                 false is returned.
   */
  isValidValue(value: any, wantsCCE: boolean): boolean {
    let min = this.getMinimum();
    try {
      if (min != null && $J.compareTo(min, value) > 0) {
        return false;
      }
    } catch ($e1) {
      if ($J.isa($e1, ClassCastException)) {
        let cce = $J.exc($e1);
        if (wantsCCE) {
          throw cce;
        }
        return false;
      } else {
        throw $e1;
      }
    }
    let max = this.getMaximum();
    try {
      if (max != null && $J.compareTo(max, value) < 0) {
        return false;
      }
    } catch ($e2) {
      if ($J.isa($e2, ClassCastException)) {
        let cce = $J.exc($e2);
        if (wantsCCE) {
          throw cce;
        }
        return false;
      } else {
        throw $e2;
      }
    }
    return true;
  }
  /**
   * Returns a Set of the attribute identifiers at <code>index</code>.
   */
  getAttributes(index: number): JMap<AttributedCharacterIterator_Attribute, any> {
    if (this.isValidMask()) {
      let iterator = this.getIterator();
      if (index >= 0 && index <= iterator.getEndIndex()) {
        iterator.setIndex(index);
        return iterator.getAttributes();
      }
    }
    return null;
  }
  /**
   * Returns the start of the first run that contains the attribute
   * <code>id</code>. This will return <code>-1</code> if the attribute
   * can not be found.
   */
  getAttributeStart(id: AttributedCharacterIterator_Attribute): number {
    if (this.isValidMask()) {
      let iterator = this.getIterator();
      iterator.first();
      while (iterator.current() !== 65535 /* \uffff */) {
        if (iterator.getAttribute(id) != null) {
          return iterator.getIndex();
        }
        iterator.next();
      }
    }
    return -1;
  }
  /**
   * Returns the <code>AttributedCharacterIterator</code> used to
   * format the last value.
   */
  getIterator(): AttributedCharacterIterator {
    return this.iterator_;
  }
  /**
   * Updates the AttributedCharacterIterator and bitset, if necessary.
   */
  updateMaskIfNecessary(): void {
    if (!this.getAllowsInvalid() && (this.getFormat() != null)) {
      if (!this.isValidMask()) {
        this.updateMask$();
      } else {
        let newString = this.getFormattedTextField().getText$();
        if (!$J.equals(newString, this.string)) {
          this.updateMask$();
        }
      }
    }
  }
  /**
   * Updates the AttributedCharacterIterator by invoking
   * <code>formatToCharacterIterator</code> on the <code>Format</code>.
   * If this is successful,
   * <code>updateMask(AttributedCharacterIterator)</code>
   * is then invoked to update the internal bitmask.
   */
  updateMask$(): void {
    if (this.getFormat() != null) {
      let doc = this.getFormattedTextField().getDocument();
      this.validMask = false;
      if (doc != null) {
        try {
          this.string = doc.getText$int$int(0, doc.getLength());
        } catch ($e3) {
          if ($J.isa($e3, BadLocationException)) {
            let ble = $J.exc($e3);
            this.string = null;
          } else {
            throw $e3;
          }
        }
        if (this.string != null) {
          try {
            let value = this.stringToValue$String(this.string);
            let iterator = this.getFormat().formatToCharacterIterator(value);
            this.updateMask$AttributedCharacterIterator$InternationalFormatter(iterator);
          } catch ($e4) {
            if ($J.isa($e4, ParseException) || $J.isa($e4, NullPointerException) || $J.isa($e4, IllegalArgumentException)) {
              let e = $J.exc($e4);
            } else {
              throw $e4;
            }
          }
        }
      }
    }
  }
  /**
   * Returns the number of literal characters before <code>index</code>.
   */
  getLiteralCountTo(index: number): number {
    let lCount = 0;
    for (let counter = 0; counter < index; counter++) {
      if (this.isLiteral$int(counter)) {
        lCount++;
      }
    }
    return lCount;
  }
  /**
   * Returns true if the character at index is a literal, that is
   * not editable.
   */
  isLiteral$int(index: number): boolean {
    if (this.isValidMask() && index < this.string.length) {
      return this.literalMask.get(index);
    }
    return false;
  }
  /**
   * Returns true if the character at offset is navigable too. This
   * is implemented in terms of <code>isLiteral</code>, subclasses
   * may wish to provide different behavior.
   */
  isNavigatable(offset: number): boolean {
    return !this.isLiteral$int(offset);
  }
  /**
   * Overridden to update the mask after invoking supers implementation.
   */
  updateValue$Object(value: any): void {
    super.updateValue$Object(value);
    this.updateMaskIfNecessary();
  }
  /**
   * Overridden to unconditionally allow the replace if
   * ignoreDocumentMutate is true.
   */
  replace$FilterBypass$int$int$String$AttributeSet(fb: DocumentFilter$FilterBypass, offset: number, length: number, text: string, attrs: AttributeSet): void {
    if (this.ignoreDocumentMutate) {
      fb.replace(offset, length, text, attrs);
      return;
    }
    super.replace$FilterBypass$int$int$String$AttributeSet(fb, offset, length, text, attrs);
  }
  /**
   * Returns the index of the next non-literal character starting at
   * index. If index is not a literal, it will be returned.
   *
   * @param direction Amount to increment looking for non-literal
   */
  getNextNonliteralIndex(index: number, direction: number): number {
    let max = this.getFormattedTextField().getDocument().getLength();
    while (index >= 0 && index < max) {
      if (this.isLiteral$int(index)) {
        index = (index + direction) | 0;
      } else {
        return index;
      }
    }
    return (direction === -1) ? 0 : max;
  }
  /**
   * Overridden in an attempt to honor the literals.
   * <p>If we do not allow invalid values and are in overwrite mode, this
   * {@code rh.length} is corrected as to preserve trailing literals.
   * If not in overwrite mode, and there is text to insert it is
   * inserted at the next non literal index going forward.  If there
   * is only text to remove, it is removed from the next non literal
   * index going backward.
   */
  canReplace(rh: DefaultFormatter$ReplaceHolder): boolean {
    if (!this.getAllowsInvalid()) {
      let text = rh.text_;
      let tl = (text != null) ? text.length : 0;
      let c = this.getFormattedTextField();
      if (tl === 0 && rh.length_ === 1 && c.getSelectionStart() !== rh.offset) {
        rh.offset = this.getNextNonliteralIndex(rh.offset, -1);
      } else if (this.getOverwriteMode()) {
        let pos = rh.offset;
        let textPos = pos;
        let overflown = false;
        for (let i = 0; i < rh.length_; i++) {
          while (this.isLiteral$int(pos)) {
            pos++;
          }
          if (pos >= this.string.length) {
            pos = textPos;
            overflown = true;
            break;
          }
          textPos = ++pos;
        }
        if (overflown || c.getSelectedText() == null) {
          rh.length_ = (pos - rh.offset) | 0;
        }
      } else if (tl > 0) {
        rh.offset = this.getNextNonliteralIndex(rh.offset, 1);
      } else {
        rh.offset = this.getNextNonliteralIndex(rh.offset, -1);
      }
      (rh).endOffset = rh.offset;
      (rh).endTextLength = (rh.text_ != null) ? rh.text_.length : 0;
    } else {
      (rh).endOffset = rh.offset;
      (rh).endTextLength = (rh.text_ != null) ? rh.text_.length : 0;
    }
    let can = super.canReplace(rh);
    if (can && !this.getAllowsInvalid()) {
      (rh).resetFromValue(this);
    }
    return can;
  }
  /**
   * When in !allowsInvalid mode the text is reset on every edit, thus
   * supers implementation will position the cursor at the wrong position.
   * As such, this invokes supers implementation and then invokes
   * <code>repositionCursor</code> to correctly reset the cursor.
   */
  replace$ReplaceHolder(rh: DefaultFormatter$ReplaceHolder): boolean {
    let start = -1;
    let direction = 1;
    let literalCount = -1;
    if (rh.length_ > 0 && (rh.text_ == null || rh.text_.length === 0) && (this.getFormattedTextField().getSelectionStart() !== rh.offset || rh.length_ > 1)) {
      direction = -1;
    }
    if (!this.getAllowsInvalid()) {
      if ((rh.text_ == null || rh.text_.length === 0) && rh.length_ > 0) {
        start = this.getFormattedTextField().getSelectionStart();
      } else {
        start = rh.offset;
      }
      literalCount = this.getLiteralCountTo(start);
    }
    if (super.replace$ReplaceHolder(rh)) {
      if (start !== -1) {
        let end = (rh).endOffset;
        end = (end + (rh).endTextLength) | 0;
        this.repositionCursor$int$int$int$InternationalFormatter(literalCount, end, direction);
      } else {
        start = (rh).endOffset;
        if (direction === 1) {
          start = (start + (rh).endTextLength) | 0;
        }
        this.repositionCursor$int$int(start, direction);
      }
      return true;
    }
    return false;
  }
  /**
   * Repositions the cursor. <code>startLiteralCount</code> gives
   * the number of literals to the start of the deleted range, end
   * gives the ending location to adjust from, direction gives
   * the direction relative to <code>end</code> to position the
   * cursor from.
   */
  repositionCursor$int$int$int$InternationalFormatter(startLiteralCount: number, end: number, direction: number): void {
    let endLiteralCount = this.getLiteralCountTo(end);
    if (endLiteralCount !== end) {
      end = (end - startLiteralCount) | 0;
      for (let counter = 0; counter < end; counter++) {
        if (this.isLiteral$int(counter)) {
          end++;
        }
      }
    }
    this.repositionCursor$int$int(end, 1);
  }
  /**
   * Returns the character from the mask that has been buffered
   * at <code>index</code>.
   */
  getBufferedChar(index: number): number {
    if (this.isValidMask()) {
      if (this.string != null && index < this.string.length) {
        return this.string.charCodeAt(index);
      }
    }
    return (0) & 0xffff;
  }
  /**
   * Returns true if the current mask is valid.
   */
  isValidMask(): boolean {
    return this.validMask;
  }
  /**
   * Returns true if <code>attributes</code> is null or empty.
   */
  isLiteral$Map(attributes: JMap<any, any>): boolean {
    return ((attributes == null) || attributes.size() === 0);
  }
  /**
   * Updates the internal bitset from <code>iterator</code>. This will
   * set <code>validMask</code> to true if <code>iterator</code> is
   * non-null.
   */
  updateMask$AttributedCharacterIterator$InternationalFormatter(iterator: AttributedCharacterIterator): void {
    if (iterator != null) {
      this.validMask = true;
      this.iterator_ = iterator;
      if (this.literalMask == null) {
        this.literalMask = new BitSet();
      } else {
        for (let counter = (this.literalMask.length() - 1) | 0; counter >= 0; counter--) {
          this.literalMask.clear(counter);
        }
      }
      iterator.first();
      while (iterator.current() !== 65535 /* \uffff */) {
        let attributes = iterator.getAttributes();
        let set$ = this.isLiteral$Map(attributes);
        let start = iterator.getIndex();
        let end = iterator.getRunLimit();
        while (start < end) {
          if (set$) {
            this.literalMask.set(start);
          } else {
            this.literalMask.clear(start);
          }
          start++;
        }
        iterator.setIndex(start);
      }
    }
  }
  /**
   * Returns true if <code>field</code> is non-null.
   * Subclasses that wish to allow incrementing to happen outside of
   * the known fields will need to override this.
   */
  canIncrement(field: any, cursorPosition: number): boolean {
    return (field != null);
  }
  /**
   * Selects the fields identified by <code>attributes</code>.
   */
  selectField(f: any, count: number): void {
    let iterator = this.getIterator();
    if (iterator != null && ($J.isa(f, AttributedCharacterIterator_Attribute))) {
      let field = f;
      iterator.first();
      while (iterator.current() !== 65535 /* \uffff */) {
        while (iterator.getAttribute(field) == null && iterator.next() !== 65535 /* \uffff */) {
        }
        if (iterator.current() !== 65535 /* \uffff */) {
          let limit = iterator.getRunLimit(field);
          if (--count <= 0) {
            this.getFormattedTextField().select(iterator.getIndex(), limit);
            break;
          }
          iterator.setIndex(limit);
          iterator.next();
        }
      }
    }
  }
  /**
   * Returns the field that will be adjusted by adjustValue.
   */
  getAdjustField(start: number, attributes: JMap<any, any>): any {
    return null;
  }
  /**
   * Returns the number of occurrences of <code>f</code> before
   * the location <code>start</code> in the current
   * <code>AttributedCharacterIterator</code>.
   */
  getFieldTypeCountTo(f: any, start: number): number {
    let iterator = this.getIterator();
    let count = 0;
    if (iterator != null && ($J.isa(f, AttributedCharacterIterator_Attribute))) {
      let field = f;
      iterator.first();
      while (iterator.getIndex() < start) {
        while (iterator.getAttribute(field) == null && iterator.next() !== 65535 /* \uffff */) {
        }
        if (iterator.current() !== 65535 /* \uffff */) {
          iterator.setIndex(iterator.getRunLimit(field));
          iterator.next();
          count++;
        } else {
          break;
        }
      }
    }
    return count;
  }
  /**
   * Subclasses supporting incrementing must override this to handle
   * the actual incrementing. <code>value</code> is the current value,
   * <code>attributes</code> gives the field the cursor is in (may be
   * null depending upon <code>canIncrement</code>) and
   * <code>direction</code> is the amount to increment by.
   */
  adjustValue(value: any, attributes: JMap<any, any>, field: any, direction: number): any {
    return null;
  }
  /**
   * Returns false, indicating InternationalFormatter does not allow
   * incrementing of the value. Subclasses that wish to support
   * incrementing/decrementing the value should override this and
   * return true. Subclasses should also override
   * <code>adjustValue</code>.
   */
  getSupportsIncrement(): boolean {
    return false;
  }
  /**
   * Resets the value of the JFormattedTextField to be
   * <code>value</code>.
   */
  resetValue(value: any): void {
    let doc = this.getFormattedTextField().getDocument();
    let string$ = this.valueToString(value);
    try {
      this.ignoreDocumentMutate = true;
      doc.remove(0, doc.getLength());
      doc.insertString(0, string$, null);
    } finally {
      this.ignoreDocumentMutate = false;
    }
    this.updateValue$Object(value);
  }
  /**
   * Overridden to return an instance of <code>ExtendedReplaceHolder</code>.
   */
  getReplaceHolder(fb: DocumentFilter$FilterBypass, offset: number, length: number, text: string, attrs: AttributeSet): DefaultFormatter$ReplaceHolder {
    if (this.replaceHolder == null) {
      this.replaceHolder = new InternationalFormatter$ExtendedReplaceHolder()._InternationalFormatter$ExtendedReplaceHolder();
    }
    return super.getReplaceHolder(fb, offset, length, text, attrs);
  }
  static $clinit() {
    InternationalFormatter.EMPTY_FIELD_ARRAY = $J.newArray(0, null);
  }
}

/**
 * As InternationalFormatter replaces the complete text on every edit,
 * ExtendedReplaceHolder keeps track of the offset and length passed
 * into canReplace.
 */
export class InternationalFormatter$ExtendedReplaceHolder extends DefaultFormatter$ReplaceHolder {
  /**
   * Offset of the insert/remove. This may differ from offset in
   * that if !allowsInvalid the text is replaced on every edit.
   */
  endOffset: number = 0;
  /**
   * Length of the text. This may differ from text.length in
   * that if !allowsInvalid the text is replaced on every edit.
   */
  endTextLength: number = 0;
  _InternationalFormatter$ExtendedReplaceHolder(): this {
    this._DefaultFormatter$ReplaceHolder();
    return this;
  }
  /**
   * Resets the region to delete to be the complete document and
   * the text from invoking valueToString on the current value.
   */
  resetFromValue(formatter: InternationalFormatter): void {
    this.offset = 0;
    try {
      this.text_ = formatter.valueToString(this.value_);
    } catch ($e5) {
      if ($J.isa($e5, ParseException)) {
        let pe = $J.exc($e5);
        this.text_ = '';
      } else {
        throw $e5;
      }
    }
    this.length_ = this.fb.getDocument().getLength();
  }
}

/**
 * IncrementAction is used to increment the value by a certain amount.
 * It calls into <code>adjustValue</code> to handle the actual
 * incrementing of the value.
 */
export class InternationalFormatter$IncrementAction extends AbstractAction {
  direction: number = 0;
  _InternationalFormatter$IncrementAction(name: string, direction: number): this {
    this._AbstractAction$String(name);
    this.direction = direction;
    return this;
  }
  actionPerformed(ae: ActionEvent): void {
    if (this.$outer.getFormattedTextField().isEditable()) {
      if (this.$outer.getAllowsInvalid()) {
        this.$outer.updateMask$();
      }
      let validEdit = false;
      if (this.$outer.isValidMask()) {
        let start = this.$outer.getFormattedTextField().getSelectionStart();
        if (start !== -1) {
          let iterator = this.$outer.getIterator();
          iterator.setIndex(start);
          let attributes = iterator.getAttributes();
          let field = this.$outer.getAdjustField(start, attributes);
          if (this.$outer.canIncrement(field, start)) {
            try {
              let value = this.$outer.stringToValue$String(this.$outer.getFormattedTextField().getText$());
              let fieldTypeCount = this.$outer.getFieldTypeCountTo(field, start);
              value = this.$outer.adjustValue(value, attributes, field, this.direction);
              if (value != null && this.$outer.isValidValue(value, false)) {
                this.$outer.resetValue(value);
                this.$outer.updateMask$();
                if (this.$outer.isValidMask()) {
                  this.$outer.selectField(field, fieldTypeCount);
                }
                validEdit = true;
              }
            } catch ($e6) {
              if ($J.isa($e6, ParseException) || $J.isa($e6, BadLocationException)) {
                let e = $J.exc($e6);
              } else {
                throw $e6;
              }
            }
          }
        }
      }
      if (!validEdit) {
        this.$outer.invalidEdit();
      }
    }
  }
}

$J.define(InternationalFormatter, 'javax.swing.text.InternationalFormatter', { kind: 'class', sup: 'javax.swing.text.DefaultFormatter', ctors: { 'java.text.Format': '_InternationalFormatter$Format', '': '_InternationalFormatter$' }, meths: { 'updateMask(java.text.AttributedCharacterIterator)': 'updateMask$AttributedCharacterIterator$InternationalFormatter', 'isLiteral(java.util.Map)': 'isLiteral$Map', 'repositionCursor(int,int,int)': 'repositionCursor$int$int$int$InternationalFormatter', 'replace(javax.swing.text.DefaultFormatter$ReplaceHolder)': 'replace$ReplaceHolder', 'replace(javax.swing.text.DocumentFilter$FilterBypass,int,int,java.lang.String,javax.swing.text.AttributeSet)': 'replace$FilterBypass$int$int$String$AttributeSet', 'updateValue(java.lang.Object)': 'updateValue$Object', 'isLiteral(int)': 'isLiteral$int', 'updateMask()': 'updateMask$', 'stringToValue(java.lang.String,java.text.Format)': 'stringToValue$String$Format', 'stringToValue(java.lang.String)': 'stringToValue$String', 'setFormat(java.text.Format)': 'setFormat$Format' }, clinit: true, lazy: ['EMPTY_FIELD_ARRAY'] });
$J.define(InternationalFormatter$ExtendedReplaceHolder, 'javax.swing.text.InternationalFormatter$ExtendedReplaceHolder', { kind: 'class', sup: 'javax.swing.text.DefaultFormatter$ReplaceHolder', ctors: { '': '_InternationalFormatter$ExtendedReplaceHolder' } });
$J.define(InternationalFormatter$IncrementAction, 'javax.swing.text.InternationalFormatter$IncrementAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { 'java.lang.String,int': '_InternationalFormatter$IncrementAction' }, inner: true });
$J.module(() => {
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
});
