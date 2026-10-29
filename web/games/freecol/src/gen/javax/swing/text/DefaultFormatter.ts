// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/DefaultFormatter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, JString, NoSuchMethodException, ParseException, ReflectUtil, Throwable } from '../../../../jre/index.ts';
import { JFormattedTextField$AbstractFormatter } from '../JFormattedTextField.ts';
import { NavigationFilter } from './NavigationFilter.ts';
import { DocumentFilter } from './DocumentFilter.ts';

let SwingConstants, Position$Bias, Utilities, SwingUtilities2;

/**
 * <code>DefaultFormatter</code> formats arbitrary objects. Formatting is done
 * by invoking the <code>toString</code> method. In order to convert the
 * value back to a String, your class must provide a constructor that
 * takes a String argument. If no single argument constructor that takes a
 * String is found, the returned value will be the String passed into
 * <code>stringToValue</code>.
 * <p>
 * Instances of <code>DefaultFormatter</code> can not be used in multiple
 * instances of <code>JFormattedTextField</code>. To obtain a copy of
 * an already configured <code>DefaultFormatter</code>, use the
 * <code>clone</code> method.
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
 * @see javax.swing.JFormattedTextField.AbstractFormatter
 *
 * @since 1.4
 */
export class DefaultFormatter extends JFormattedTextField$AbstractFormatter {
  /**
   * Indicates if the value being edited must match the mask.
   */
  allowsInvalid: boolean = false;
  /**
   * If true, editing mode is in overwrite (or strikethough).
   */
  overwriteMode: boolean = false;
  /**
   * If true, any time a valid edit happens commitEdit is invoked.
   */
  commitOnEdit: boolean = false;
  /**
   * Class used to create new instances.
   */
  valueClass: JClass<any> = null;
  /**
   * NavigationFilter that forwards calls back to DefaultFormatter.
   */
  navigationFilter: NavigationFilter = null;
  /**
   * DocumentFilter that forwards calls back to DefaultFormatter.
   */
  documentFilter: DocumentFilter = null;
  /**
   * Used during replace to track the region to replace.
   */
  replaceHolder: DefaultFormatter$ReplaceHolder = null;
  /**
   * Creates a DefaultFormatter.
   */
  _DefaultFormatter(): this {
    this._JFormattedTextField$AbstractFormatter();
    this.overwriteMode = true;
    this.allowsInvalid = true;
    return this;
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
    this.positionCursorAtInitialLocation();
  }
  /**
   * Sets when edits are published back to the
   * <code>JFormattedTextField</code>. If true, <code>commitEdit</code>
   * is invoked after every valid edit (any time the text is edited). On
   * the other hand, if this is false than the <code>DefaultFormatter</code>
   * does not publish edits back to the <code>JFormattedTextField</code>.
   * As such, the only time the value of the <code>JFormattedTextField</code>
   * will change is when <code>commitEdit</code> is invoked on
   * <code>JFormattedTextField</code>, typically when enter is pressed
   * or focus leaves the <code>JFormattedTextField</code>.
   *
   * @param commit Used to indicate when edits are committed back to the
   *               JTextComponent
   */
  setCommitsOnValidEdit(commit: boolean): void {
    this.commitOnEdit = commit;
  }
  /**
   * Returns when edits are published back to the
   * <code>JFormattedTextField</code>.
   *
   * @return true if edits are committed after every valid edit
   */
  getCommitsOnValidEdit(): boolean {
    return this.commitOnEdit;
  }
  /**
   * Configures the behavior when inserting characters. If
   * <code>overwriteMode</code> is true (the default), new characters
   * overwrite existing characters in the model.
   *
   * @param overwriteMode Indicates if overwrite or overstrike mode is used
   */
  setOverwriteMode(overwriteMode: boolean): void {
    this.overwriteMode = overwriteMode;
  }
  /**
   * Returns the behavior when inserting characters.
   *
   * @return true if newly inserted characters overwrite existing characters
   */
  getOverwriteMode(): boolean {
    return this.overwriteMode;
  }
  /**
   * Sets whether or not the value being edited is allowed to be invalid
   * for a length of time (that is, <code>stringToValue</code> throws
   * a <code>ParseException</code>).
   * It is often convenient to allow the user to temporarily input an
   * invalid value.
   *
   * @param allowsInvalid Used to indicate if the edited value must always
   *        be valid
   */
  setAllowsInvalid(allowsInvalid: boolean): void {
    this.allowsInvalid = allowsInvalid;
  }
  /**
   * Returns whether or not the value being edited is allowed to be invalid
   * for a length of time.
   *
   * @return false if the edited value must always be valid
   */
  getAllowsInvalid(): boolean {
    return this.allowsInvalid;
  }
  /**
   * Sets that class that is used to create new Objects. If the
   * passed in class does not have a single argument constructor that
   * takes a String, String values will be used.
   *
   * @param valueClass Class used to construct return value from
   *        stringToValue
   */
  setValueClass(valueClass: JClass<any>): void {
    this.valueClass = valueClass;
  }
  /**
   * Returns that class that is used to create new Objects.
   *
   * @return Class used to construct return value from stringToValue
   */
  getValueClass(): JClass<any> {
    return this.valueClass;
  }
  /**
   * Converts the passed in String into an instance of
   * <code>getValueClass</code> by way of the constructor that
   * takes a String argument. If <code>getValueClass</code>
   * returns null, the Class of the current value in the
   * <code>JFormattedTextField</code> will be used. If this is null, a
   * String will be returned. If the constructor throws an exception, a
   * <code>ParseException</code> will be thrown. If there is no single
   * argument String constructor, <code>string</code> will be returned.
   *
   * @throws ParseException if there is an error in the conversion
   * @param string String to convert
   * @return Object representation of text
   */
  stringToValue$String(string$: string): any {
    let vc = this.getValueClass();
    let ftf = this.getFormattedTextField();
    if (vc == null && ftf != null) {
      let value = ftf.getValue();
      if (value != null) {
        vc = $J.getClass(value);
      }
    }
    if (vc != null) {
      let cons: Constructor<any>;
      try {
        ReflectUtil.checkPackageAccess(vc);
        SwingUtilities2.checkAccess(vc.getModifiers());
        cons = vc.getConstructor(...[$J.cls(JString)]);
      } catch ($e0) {
        if ($J.isa($e0, NoSuchMethodException)) {
          let nsme = $J.exc($e0);
          cons = null;
        } else {
          throw $e0;
        }
      }
      if (cons != null) {
        try {
          SwingUtilities2.checkAccess(cons.getModifiers());
          return cons.newInstance(...[string$]);
        } catch ($e1) {
          {
            let ex = $J.exc($e1);
            throw new ParseException('Error creating instance', 0);
          }
        }
      }
    }
    return string$;
  }
  /**
   * Converts the passed in Object into a String by way of the
   * <code>toString</code> method.
   *
   * @throws ParseException if there is an error in the conversion
   * @param value Value to convert
   * @return String representation of value
   */
  valueToString(value: any): string {
    if (value == null) {
      return '';
    }
    return $J.str(value);
  }
  /**
   * Returns the <code>DocumentFilter</code> used to restrict the characters
   * that can be input into the <code>JFormattedTextField</code>.
   *
   * @return DocumentFilter to restrict edits
   */
  getDocumentFilter(): DocumentFilter {
    if (this.documentFilter == null) {
      this.documentFilter = new DefaultFormatter$DefaultDocumentFilter().$o(this)._DefaultFormatter$DefaultDocumentFilter();
    }
    return this.documentFilter;
  }
  /**
   * Returns the <code>NavigationFilter</code> used to restrict where the
   * cursor can be placed.
   *
   * @return NavigationFilter to restrict navigation
   */
  getNavigationFilter(): NavigationFilter {
    if (this.navigationFilter == null) {
      this.navigationFilter = new DefaultFormatter$DefaultNavigationFilter().$o(this)._DefaultFormatter$DefaultNavigationFilter();
    }
    return this.navigationFilter;
  }
  /**
   * Creates a copy of the DefaultFormatter.
   *
   * @return copy of the DefaultFormatter
   */
  clone(): any {
    let formatter = super.clone();
    formatter.navigationFilter = null;
    formatter.documentFilter = null;
    formatter.replaceHolder = null;
    return formatter;
  }
  /**
   * Positions the cursor at the initial location.
   */
  positionCursorAtInitialLocation(): void {
    let ftf = this.getFormattedTextField();
    if (ftf != null) {
      ftf.setCaretPosition(this.getInitialVisualPosition());
    }
  }
  /**
   * Returns the initial location to position the cursor at. This forwards
   * the call to <code>getNextNavigatableChar</code>.
   */
  getInitialVisualPosition(): number {
    return this.getNextNavigatableChar(0, 1);
  }
  /**
   * Subclasses should override this if they want cursor navigation
   * to skip certain characters. A return value of false indicates
   * the character at <code>offset</code> should be skipped when
   * navigating through the field.
   */
  isNavigatable(offset: number): boolean {
    return true;
  }
  /**
   * Returns true if the text in <code>text</code> can be inserted.  This
   * does not mean the text will ultimately be inserted, it is used if
   * text can trivially reject certain characters.
   */
  isLegalInsertText(text: string): boolean {
    return true;
  }
  /**
   * Returns the next editable character starting at offset incrementing
   * the offset by <code>direction</code>.
   */
  getNextNavigatableChar(offset: number, direction: number): number {
    let max = this.getFormattedTextField().getDocument().getLength();
    while (offset >= 0 && offset < max) {
      if (this.isNavigatable(offset)) {
        return offset;
      }
      offset = (offset + direction) | 0;
    }
    return offset;
  }
  /**
   * A convenience methods to return the result of deleting
   * <code>deleteLength</code> characters at <code>offset</code>
   * and inserting <code>replaceString</code> at <code>offset</code>
   * in the current text field.
   */
  getReplaceString(offset: number, deleteLength: number, replaceString: string): string {
    let string$ = this.getFormattedTextField().getText$();
    let result: string;
    result = string$.substring(0, offset);
    if (replaceString != null) {
      result += replaceString;
    }
    if (((offset + deleteLength) | 0) < string$.length) {
      result += string$.substring((offset + deleteLength) | 0);
    }
    return result;
  }
  isValidEdit(rh: DefaultFormatter$ReplaceHolder): boolean {
    if (!this.getAllowsInvalid()) {
      let newString = this.getReplaceString(rh.offset, rh.length_, rh.text_);
      try {
        rh.value_ = this.stringToValue$String(newString);
        return true;
      } catch ($e2) {
        if ($J.isa($e2, ParseException)) {
          let pe = $J.exc($e2);
          return false;
        } else {
          throw $e2;
        }
      }
    }
    return true;
  }
  /**
   * Invokes <code>commitEdit</code> on the JFormattedTextField.
   */
  commitEdit(): void {
    let ftf = this.getFormattedTextField();
    if (ftf != null) {
      ftf.commitEdit();
    }
  }
  /**
   * Pushes the <code>value</code> to the editor if we are to
   * commit on edits. If <code>value</code> is null, the current value
   * will be obtained from the text component.
   */
  updateValue$Object(value: any): void {
    try {
      if (value == null) {
        let string$ = this.getFormattedTextField().getText$();
        value = this.stringToValue$String(string$);
      }
      if (this.getCommitsOnValidEdit()) {
        this.commitEdit();
      }
      this.setEditValid(true);
    } catch ($e3) {
      if ($J.isa($e3, ParseException)) {
        let pe = $J.exc($e3);
        this.setEditValid(false);
      } else {
        throw $e3;
      }
    }
  }
  /**
   * Returns the next cursor position from offset by incrementing
   * <code>direction</code>. This uses
   * <code>getNextNavigatableChar</code>
   * as well as constraining the location to the max position.
   */
  getNextCursorPosition(offset: number, direction: number): number {
    let newOffset = this.getNextNavigatableChar(offset, direction);
    let max = this.getFormattedTextField().getDocument().getLength();
    if (!this.getAllowsInvalid()) {
      if (direction === -1 && offset === newOffset) {
        newOffset = this.getNextNavigatableChar(newOffset, 1);
        if (newOffset >= max) {
          newOffset = offset;
        }
      } else if (direction === 1 && newOffset >= max) {
        newOffset = this.getNextNavigatableChar((max - 1) | 0, -1);
        if (newOffset < max) {
          newOffset++;
        }
      }
    }
    return newOffset;
  }
  /**
   * Resets the cursor by using getNextCursorPosition.
   */
  repositionCursor$int$int(offset: number, direction: number): void {
    this.getFormattedTextField().getCaret().setDot$int(this.getNextCursorPosition(offset, direction));
  }
  /**
   * Finds the next navigable character.
   */
  getNextVisualPositionFrom(text: JTextComponent, pos: number, bias: Position$Bias, direction: number, biasRet: Position$Bias[]): number {
    let value = text.getUI().getNextVisualPositionFrom(text, pos, bias, direction, biasRet);
    if (value === -1) {
      return -1;
    }
    if (!this.getAllowsInvalid() && (direction === SwingConstants.EAST || direction === SwingConstants.WEST)) {
      let last = -1;
      while (!this.isNavigatable(value) && value !== last) {
        last = value;
        value = text.getUI().getNextVisualPositionFrom(text, value, bias, direction, biasRet);
      }
      let max = this.getFormattedTextField().getDocument().getLength();
      if (last === value || value === max) {
        if (value === 0) {
          biasRet[0] = Position$Bias.Forward;
          value = this.getInitialVisualPosition();
        }
        if (value >= max && max > 0) {
          biasRet[0] = Position$Bias.Forward;
          value = (this.getNextNavigatableChar((max - 1) | 0, -1) + 1) | 0;
        }
      }
    }
    return value;
  }
  /**
   * Returns true if the edit described by <code>rh</code> will result
   * in a legal value.
   */
  canReplace(rh: DefaultFormatter$ReplaceHolder): boolean {
    return this.isValidEdit(rh);
  }
  /**
   * DocumentFilter method, funnels into <code>replace</code>.
   */
  replace$FilterBypass$int$int$String$AttributeSet(fb: DocumentFilter$FilterBypass, offset: number, length: number, text: string, attrs: AttributeSet): void {
    let rh = this.getReplaceHolder(fb, offset, length, text, attrs);
    this.replace$ReplaceHolder(rh);
  }
  /**
   * If the edit described by <code>rh</code> is legal, this will
   * return true, commit the edit (if necessary) and update the cursor
   * position.  This forwards to <code>canReplace</code> and
   * <code>isLegalInsertText</code> as necessary to determine if
   * the edit is in fact legal.
   * <p>
   * All of the DocumentFilter methods funnel into here, you should
   * generally only have to override this.
   */
  replace$ReplaceHolder(rh: DefaultFormatter$ReplaceHolder): boolean {
    let valid = true;
    let direction = 1;
    if (rh.length_ > 0 && (rh.text_ == null || rh.text_.length === 0) && (this.getFormattedTextField().getSelectionStart() !== rh.offset || rh.length_ > 1)) {
      direction = -1;
    }
    if (this.getOverwriteMode() && rh.text_ != null && this.getFormattedTextField().getSelectedText() == null) {
      rh.length_ = Math.min(Math.max(rh.length_, rh.text_.length), (rh.fb.getDocument().getLength() - rh.offset) | 0);
    }
    if ((rh.text_ != null && !this.isLegalInsertText(rh.text_)) || !this.canReplace(rh) || (rh.length_ === 0 && (rh.text_ == null || rh.text_.length === 0))) {
      valid = false;
    }
    if (valid) {
      let cursor = rh.cursorPosition;
      rh.fb.replace(rh.offset, rh.length_, rh.text_, rh.attrs);
      if (cursor === -1) {
        cursor = rh.offset;
        if (direction === 1 && rh.text_ != null) {
          cursor = (rh.offset + rh.text_.length) | 0;
        }
      }
      this.updateValue$Object(rh.value_);
      this.repositionCursor$int$int(cursor, direction);
      return true;
    } else {
      this.invalidEdit();
    }
    return false;
  }
  /**
   * NavigationFilter method, subclasses that wish finer control should
   * override this.
   */
  setDot(fb: NavigationFilter$FilterBypass, dot: number, bias: Position$Bias): void {
    fb.setDot(dot, bias);
  }
  /**
   * NavigationFilter method, subclasses that wish finer control should
   * override this.
   */
  moveDot(fb: NavigationFilter$FilterBypass, dot: number, bias: Position$Bias): void {
    fb.moveDot(dot, bias);
  }
  /**
   * Returns the ReplaceHolder to track the replace of the specified
   * text.
   */
  getReplaceHolder(fb: DocumentFilter$FilterBypass, offset: number, length: number, text: string, attrs: AttributeSet): DefaultFormatter$ReplaceHolder {
    if (this.replaceHolder == null) {
      this.replaceHolder = new DefaultFormatter$ReplaceHolder()._DefaultFormatter$ReplaceHolder();
    }
    this.replaceHolder.reset(fb, offset, length, text, attrs);
    return this.replaceHolder;
  }
}

/**
 * ReplaceHolder is used to track where insert/remove/replace is
 * going to happen.
 */
export class DefaultFormatter$ReplaceHolder extends JObject {
  /**
   * The FilterBypass that was passed to the DocumentFilter method.
   */
  fb: DocumentFilter$FilterBypass = null;
  /**
   * Offset where the remove/insert is going to occur.
   */
  offset: number = 0;
  /**
   * Length of text to remove.
   */
  length_: number = 0;
  /**
   * The text to insert, may be null.
   */
  text_: string = null;
  /**
   * AttributeSet to attach to text, may be null.
   */
  attrs: AttributeSet = null;
  /**
   * The resulting value, this may never be set.
   */
  value_: any = null;
  /**
   * Position the cursor should be adjusted from.  If this is -1
   * the cursor position will be adjusted based on the direction of
   * the replace (-1: offset, 1: offset + text.length()), otherwise
   * the cursor position is adjusted from this position.
   */
  cursorPosition: number = 0;
  _DefaultFormatter$ReplaceHolder(): this {
    return this;
  }
  reset(fb: DocumentFilter$FilterBypass, offset: number, length: number, text: string, attrs: AttributeSet): void {
    this.fb = fb;
    this.offset = offset;
    this.length_ = length;
    this.text_ = text;
    this.attrs = attrs;
    this.value_ = null;
    this.cursorPosition = -1;
  }
}

/**
 * NavigationFilter implementation that calls back to methods with
 * same name in DefaultFormatter.
 */
export class DefaultFormatter$DefaultNavigationFilter extends NavigationFilter {
  _DefaultFormatter$DefaultNavigationFilter(): this {
    this._NavigationFilter();
    return this;
  }
  setDot(fb: NavigationFilter$FilterBypass, dot: number, bias: Position$Bias): void {
    let tc = this.$outer.getFormattedTextField();
    if (tc.composedTextExists()) {
      fb.setDot(dot, bias);
    } else {
      this.$outer.setDot(fb, dot, bias);
    }
  }
  moveDot(fb: NavigationFilter$FilterBypass, dot: number, bias: Position$Bias): void {
    let tc = this.$outer.getFormattedTextField();
    if (tc.composedTextExists()) {
      fb.moveDot(dot, bias);
    } else {
      this.$outer.moveDot(fb, dot, bias);
    }
  }
  getNextVisualPositionFrom(text: JTextComponent, pos: number, bias: Position$Bias, direction: number, biasRet: Position$Bias[]): number {
    if (text.composedTextExists()) {
      return text.getUI().getNextVisualPositionFrom(text, pos, bias, direction, biasRet);
    } else {
      return this.$outer.getNextVisualPositionFrom(text, pos, bias, direction, biasRet);
    }
  }
}

/**
 * DocumentFilter implementation that calls back to the replace
 * method of DefaultFormatter.
 */
export class DefaultFormatter$DefaultDocumentFilter extends DocumentFilter {
  _DefaultFormatter$DefaultDocumentFilter(): this {
    this._DocumentFilter();
    return this;
  }
  remove(fb: DocumentFilter$FilterBypass, offset: number, length: number): void {
    let tc = this.$outer.getFormattedTextField();
    if (tc.composedTextExists()) {
      fb.remove(offset, length);
    } else {
      this.$outer.replace$FilterBypass$int$int$String$AttributeSet(fb, offset, length, null, null);
    }
  }
  insertString(fb: DocumentFilter$FilterBypass, offset: number, string$: string, attr: AttributeSet): void {
    let tc = this.$outer.getFormattedTextField();
    if (tc.composedTextExists() || Utilities.isComposedTextAttributeDefined(attr)) {
      fb.insertString(offset, string$, attr);
    } else {
      this.$outer.replace$FilterBypass$int$int$String$AttributeSet(fb, offset, 0, string$, attr);
    }
  }
  replace(fb: DocumentFilter$FilterBypass, offset: number, length: number, text: string, attr: AttributeSet): void {
    let tc = this.$outer.getFormattedTextField();
    if (tc.composedTextExists() || Utilities.isComposedTextAttributeDefined(attr)) {
      fb.replace(offset, length, text, attr);
    } else {
      this.$outer.replace$FilterBypass$int$int$String$AttributeSet(fb, offset, length, text, attr);
    }
  }
}

$J.define(DefaultFormatter, 'javax.swing.text.DefaultFormatter', { kind: 'class', ifaces: ['java.lang.Cloneable', 'java.io.Serializable'], sup: 'javax.swing.JFormattedTextField$AbstractFormatter', ctors: { '': '_DefaultFormatter' }, meths: { 'replace(javax.swing.text.DefaultFormatter$ReplaceHolder)': 'replace$ReplaceHolder', 'replace(javax.swing.text.DocumentFilter$FilterBypass,int,int,java.lang.String,javax.swing.text.AttributeSet)': 'replace$FilterBypass$int$int$String$AttributeSet', 'repositionCursor(int,int)': 'repositionCursor$int$int', 'updateValue(java.lang.Object)': 'updateValue$Object', 'updateValue()': 'updateValue$', 'stringToValue(java.lang.String)': 'stringToValue$String' } });
$J.define(DefaultFormatter$ReplaceHolder, 'javax.swing.text.DefaultFormatter$ReplaceHolder', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DefaultFormatter$ReplaceHolder' } });
$J.define(DefaultFormatter$DefaultNavigationFilter, 'javax.swing.text.DefaultFormatter$DefaultNavigationFilter', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'javax.swing.text.NavigationFilter', ctors: { '': '_DefaultFormatter$DefaultNavigationFilter' }, inner: true });
$J.define(DefaultFormatter$DefaultDocumentFilter, 'javax.swing.text.DefaultFormatter$DefaultDocumentFilter', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'javax.swing.text.DocumentFilter', ctors: { '': '_DefaultFormatter$DefaultDocumentFilter' }, inner: true });
$J.module(() => {
  SwingConstants = $J.load('javax.swing.SwingConstants');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  Utilities = $J.load('javax.swing.text.Utilities');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
