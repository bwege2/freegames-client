// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/ValueFormatter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2008, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Character, Integer, JString, Locale, NumberFormatException, ParseException } from '../../../../jre/index.ts';
import { JFormattedTextField$AbstractFormatter } from '../JFormattedTextField.ts';

let JFormattedTextField, SwingConstants, SwingUtilities, DefaultFormatterFactory, DocumentFilter;

export class ValueFormatter extends JFormattedTextField$AbstractFormatter {
  filter_: DocumentFilter = null;
  length_: number = 0;
  radix: number = 0;
  text_: JFormattedTextField = null;
  _ValueFormatter(length: number, hex: boolean): this {
    this._JFormattedTextField$AbstractFormatter();
    this.filter_ = new (ValueFormatter$1())().$o(this)._DocumentFilter();
    this.length_ = length;
    this.radix = hex ? 16 : 10;
    return this;
  }
  static init(length: number, hex: boolean, text: JFormattedTextField): void {
    let formatter = new ValueFormatter()._ValueFormatter(length, hex);
    text.setColumns(length);
    text.setFormatterFactory(new DefaultFormatterFactory()._DefaultFormatterFactory$AbstractFormatter(formatter));
    text.setHorizontalAlignment(SwingConstants.RIGHT);
    text.setMinimumSize(text.getPreferredSize$());
    text.addFocusListener(formatter);
  }
  stringToValue$String(text: string): any {
    try {
      return $J.parseInt(text, this.radix);
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let nfe = $J.exc($e0);
        let pe = new ParseException('illegal format', 0);
        pe.initCause(nfe);
        throw pe;
      } else {
        throw $e0;
      }
    }
  }
  valueToString(object$: any): string {
    if ($J.isa(object$, Integer)) {
      if (this.radix === 10) {
        return $J.str(object$);
      }
      let value = object$;
      let index = this.length_;
      let array = $J.newArray(index, 0);
      while (0 < index--) {
        array[index] = Character.forDigit(value & 15, this.radix);
        value >>= 4;
      }
      return JString.newString(array).toUpperCase();
    }
    throw new ParseException('illegal object', 0);
  }
  getDocumentFilter(): DocumentFilter {
    return this.filter_;
  }
  focusGained(event: FocusEvent): void {
    let source = event.getSource();
    if (source instanceof JFormattedTextField) {
      this.text_ = source;
      SwingUtilities.invokeLater($J.fn(this, 'run'));
    }
  }
  focusLost(event: FocusEvent): void {
  }
  run(): void {
    if (this.text_ != null) {
      this.text_.selectAll();
    }
  }
  isValid$int$ValueFormatter(length: number): boolean {
    return (0 <= length) && (length <= this.length_);
  }
  isValid$String$ValueFormatter(text: string): boolean {
    let length = text.length;
    for (let i = 0; i < length; i++) {
      let ch = text.charCodeAt(i);
      if (Character.digit(ch, this.radix) < 0) {
        return false;
      }
    }
    return true;
  }
}

let $ValueFormatter$1: any = null;
/** An anonymous class (ValueFormatter.java:53). */
function ValueFormatter$1(): any {
  return $ValueFormatter$1 ??= $J.local(class extends DocumentFilter {
    remove(fb: DocumentFilter$FilterBypass, offset: number, length: number): void {
      if (this.$outer.isValid$int$ValueFormatter((fb.getDocument().getLength() - length) | 0)) {
        fb.remove(offset, length);
      }
    }
    replace(fb: DocumentFilter$FilterBypass, offset: number, length: number, text: string, set$: AttributeSet): void {
      if (this.$outer.isValid$int$ValueFormatter((fb.getDocument().getLength() + text.length - length) | 0) && this.$outer.isValid$String$ValueFormatter(text)) {
        fb.replace(offset, length, text.toUpperCase(), set$);
      }
    }
    insertString(fb: DocumentFilter$FilterBypass, offset: number, text: string, set$: AttributeSet): void {
      if (this.$outer.isValid$int$ValueFormatter((fb.getDocument().getLength() + text.length) | 0) && this.$outer.isValid$String$ValueFormatter(text)) {
        fb.insertString(offset, text.toUpperCase(), set$);
      }
    }
  }, 'javax.swing.colorchooser.ValueFormatter$1', []);
}

$J.define(ValueFormatter, 'javax.swing.colorchooser.ValueFormatter', { kind: 'class', ifaces: ['java.awt.event.FocusListener', 'java.lang.Runnable'], sup: 'javax.swing.JFormattedTextField$AbstractFormatter', ctors: { 'int,boolean': '_ValueFormatter' }, meths: { 'isValid(java.lang.String)': 'isValid$String$ValueFormatter', 'isValid(int)': 'isValid$int$ValueFormatter', 'stringToValue(java.lang.String)': 'stringToValue$String' } });
$J.module(() => {
  JFormattedTextField = $J.load('javax.swing.JFormattedTextField');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  DefaultFormatterFactory = $J.load('javax.swing.text.DefaultFormatterFactory');
  DocumentFilter = $J.load('javax.swing.text.DocumentFilter');
});
