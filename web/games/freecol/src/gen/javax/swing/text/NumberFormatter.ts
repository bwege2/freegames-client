// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/NumberFormatter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Byte, Character, DecimalFormat, Double, Float, Integer, JNumber, JString, Long, NumberFormat, NumberFormat_Field, ParseException, ReflectUtil, Short, StringBuilder, Throwable } from '../../../../jre/index.ts';
import { InternationalFormatter } from './InternationalFormatter.ts';

let SwingUtilities2;

/**
 * <code>NumberFormatter</code> subclasses <code>InternationalFormatter</code>
 * adding special behavior for numbers. Among the specializations are
 * (these are only used if the <code>NumberFormatter</code> does not display
 * invalid numbers, for example, <code>setAllowsInvalid(false)</code>):
 * <ul>
 *   <li>Pressing +/- (- is determined from the
 *       <code>DecimalFormatSymbols</code> associated with the
 *       <code>DecimalFormat</code>) in any field but the exponent
 *       field will attempt to change the sign of the number to
 *       positive/negative.
 *   <li>Pressing +/- (- is determined from the
 *       <code>DecimalFormatSymbols</code> associated with the
 *       <code>DecimalFormat</code>) in the exponent field will
 *       attempt to change the sign of the exponent to positive/negative.
 * </ul>
 * <p>
 * If you are displaying scientific numbers, you may wish to turn on
 * overwrite mode, <code>setOverwriteMode(true)</code>. For example:
 * <pre>
 * DecimalFormat decimalFormat = new DecimalFormat("0.000E0");
 * NumberFormatter textFormatter = new NumberFormatter(decimalFormat);
 * textFormatter.setOverwriteMode(true);
 * textFormatter.setAllowsInvalid(false);
 * </pre>
 * <p>
 * If you are going to allow the user to enter decimal
 * values, you should either force the DecimalFormat to contain at least
 * one decimal (<code>#.0###</code>), or allow the value to be invalid
 * <code>setAllowsInvalid(true)</code>. Otherwise users may not be able to
 * input decimal values.
 * <p>
 * <code>NumberFormatter</code> provides slightly different behavior to
 * <code>stringToValue</code> than that of its superclass. If you have
 * specified a Class for values, {@link #setValueClass}, that is one of
 * of <code>Integer</code>, <code>Long</code>, <code>Float</code>,
 * <code>Double</code>, <code>Byte</code> or <code>Short</code> and
 * the Format's <code>parseObject</code> returns an instance of
 * <code>Number</code>, the corresponding instance of the value class
 * will be created using the constructor appropriate for the primitive
 * type the value class represents. For example:
 * <code>setValueClass(Integer.class)</code> will cause the resulting
 * value to be created via
 * <code>Integer.valueOf(((Number)formatter.parseObject(string)).intValue())</code>.
 * This is typically useful if you
 * wish to set a min/max value as the various <code>Number</code>
 * implementations are generally not comparable to each other. This is also
 * useful if for some reason you need a specific <code>Number</code>
 * implementation for your values.
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
 * @since 1.4
 */
export class NumberFormatter extends InternationalFormatter {
  /**
   * The special characters from the Format instance.
   */
  specialChars: string = null;
  /**
   * Creates a <code>NumberFormatter</code> with the default
   * <code>NumberFormat</code> instance obtained from
   * <code>NumberFormat.getNumberInstance()</code>.
   */
  _NumberFormatter$(): this {
    this._NumberFormatter$NumberFormat(NumberFormat.getNumberInstance());
    return this;
  }
  /**
   * Creates a NumberFormatter with the specified Format instance.
   *
   * @param format Format used to dictate legal values
   */
  _NumberFormatter$NumberFormat(format: NumberFormat): this {
    this._InternationalFormatter$Format(format);
    this.setFormat$Format(format);
    this.setAllowsInvalid(true);
    this.setCommitsOnValidEdit(false);
    this.setOverwriteMode(false);
    return this;
  }
  /**
   * Sets the format that dictates the legal values that can be edited
   * and displayed.
   * <p>
   * If you have used the nullary constructor the value of this property
   * will be determined for the current locale by way of the
   * <code>NumberFormat.getNumberInstance()</code> method.
   *
   * @param format NumberFormat instance used to dictate legal values
   */
  setFormat$Format(format: Format): void {
    super.setFormat$Format(format);
    let dfs = this.getDecimalFormatSymbols();
    if (dfs != null) {
      let sb = new StringBuilder();
      sb.append(dfs.getCurrencySymbol());
      sb.append(String.fromCharCode(dfs.getDecimalSeparator()));
      sb.append(String.fromCharCode(dfs.getGroupingSeparator()));
      sb.append(dfs.getInfinity());
      sb.append(dfs.getInternationalCurrencySymbol());
      sb.append(String.fromCharCode(dfs.getMinusSign()));
      sb.append(String.fromCharCode(dfs.getMonetaryDecimalSeparator()));
      sb.append(dfs.getNaN());
      sb.append(String.fromCharCode(dfs.getPercent()));
      sb.append(String.fromCharCode(43 /* '+' */));
      this.specialChars = sb.toString();
    } else {
      this.specialChars = '';
    }
  }
  /**
   * Invokes <code>parseObject</code> on <code>f</code>, returning
   * its value.
   */
  stringToValue$String$Format(text: string, f: Format): any {
    if (f == null) {
      return text;
    }
    let value = f.parseObject(text);
    return this.convertValueToValueClass(value, this.getValueClass());
  }
  /**
   * Converts the passed in value to the passed in class. This only
   * works if <code>valueClass</code> is one of <code>Integer</code>,
   * <code>Long</code>, <code>Float</code>, <code>Double</code>,
   * <code>Byte</code> or <code>Short</code> and <code>value</code>
   * is an instanceof <code>Number</code>.
   */
  convertValueToValueClass(value: any, valueClass: JClass<any>): any {
    if (valueClass != null && ($J.isa(value, JNumber))) {
      let numberValue = value;
      if (valueClass === $J.cls(Integer)) {
        return $J.d2i(+numberValue);
      } else if (valueClass === $J.cls(Long)) {
        return $J.d2i(+numberValue);
      } else if (valueClass === $J.cls(Float)) {
        return $J.boxF($J.boxF(Math.fround(+numberValue)));
      } else if (valueClass === $J.cls(Double)) {
        return $J.boxD($J.boxD((+numberValue)));
      } else if (valueClass === $J.cls(Byte)) {
        return (+numberValue);
      } else if (valueClass === $J.cls(Short)) {
        return (+numberValue);
      }
    }
    return value;
  }
  /**
   * Returns the character that is used to toggle to positive values.
   */
  getPositiveSign(): number {
    return 43 /* '+' */;
  }
  /**
   * Returns the character that is used to toggle to negative values.
   */
  getMinusSign(): number {
    let dfs = this.getDecimalFormatSymbols();
    if (dfs != null) {
      return dfs.getMinusSign();
    }
    return 45 /* '-' */;
  }
  /**
   * Returns the character that is used to toggle to negative values.
   */
  getDecimalSeparator(): number {
    let dfs = this.getDecimalFormatSymbols();
    if (dfs != null) {
      return dfs.getDecimalSeparator();
    }
    return 46 /* '.' */;
  }
  /**
   * Returns the DecimalFormatSymbols from the Format instance.
   */
  getDecimalFormatSymbols(): DecimalFormatSymbols {
    let f = this.getFormat();
    if ($J.isa(f, DecimalFormat)) {
      return (f).getDecimalFormatSymbols();
    }
    return null;
  }
  /**
   * Subclassed to return false if <code>text</code> contains in an invalid
   * character to insert, that is, it is not a digit
   * (<code>Character.isDigit()</code>) and
   * not one of the characters defined by the DecimalFormatSymbols.
   */
  isLegalInsertText(text: string): boolean {
    if (this.getAllowsInvalid()) {
      return true;
    }
    for (let counter = (text.length - 1) | 0; counter >= 0; counter--) {
      let aChar = text.charCodeAt(counter);
      if (!Character.isDigit(aChar) && this.specialChars.indexOf(String.fromCharCode(aChar)) === -1) {
        return false;
      }
    }
    return true;
  }
  /**
   * Subclassed to treat the decimal separator, grouping separator,
   * exponent symbol, percent, permille, currency and sign as literals.
   */
  isLiteral$Map(attrs: JMap<any, any>): boolean {
    if (!super.isLiteral$Map(attrs)) {
      if (attrs == null) {
        return false;
      }
      let size = attrs.size();
      if (attrs.get(NumberFormat_Field.GROUPING_SEPARATOR) != null) {
        size--;
        if (attrs.get(NumberFormat_Field.INTEGER) != null) {
          size--;
        }
      }
      if (attrs.get(NumberFormat_Field.EXPONENT_SYMBOL) != null) {
        size--;
      }
      if (attrs.get(NumberFormat_Field.PERCENT) != null) {
        size--;
      }
      if (attrs.get(NumberFormat_Field.PERMILLE) != null) {
        size--;
      }
      if (attrs.get(NumberFormat_Field.CURRENCY) != null) {
        size--;
      }
      if (attrs.get(NumberFormat_Field.SIGN) != null) {
        size--;
      }
      return size === 0;
    }
    return true;
  }
  /**
   * Subclassed to make the decimal separator navigable, as well
   * as making the character between the integer field and the next
   * field navigable.
   */
  isNavigatable(index: number): boolean {
    if (!super.isNavigatable(index)) {
      return this.getBufferedChar(index) === this.getDecimalSeparator();
    }
    return true;
  }
  /**
   * Returns the first <code>NumberFormat.Field</code> starting
   * <code>index</code> incrementing by <code>direction</code>.
   */
  getFieldFrom(index: number, direction: number): NumberFormat_Field {
    if (this.isValidMask()) {
      let max = this.getFormattedTextField().getDocument().getLength();
      let iterator = this.getIterator();
      if (index >= max) {
        index = (index + direction) | 0;
      }
      while (index >= 0 && index < max) {
        iterator.setIndex(index);
        let attrs = iterator.getAttributes();
        if (attrs != null && attrs.size() > 0) {
          for (const $it0 = attrs.keySet().iterator(); $it0.hasNext(); ) {
            let key = $it0.next();
            if ($J.isa(key, NumberFormat_Field)) {
              return key;
            }
          }
        }
        index = (index + direction) | 0;
      }
    }
    return null;
  }
  /**
   * Overridden to toggle the value if the positive/minus sign
   * is inserted.
   */
  replace$FilterBypass$int$int$String$AttributeSet(fb: DocumentFilter$FilterBypass, offset: number, length: number, string$: string, attr: AttributeSet): void {
    if (!this.getAllowsInvalid() && length === 0 && string$ != null && string$.length === 1 && this.toggleSignIfNecessary(fb, offset, string$.charCodeAt(0))) {
      return;
    }
    super.replace$FilterBypass$int$int$String$AttributeSet(fb, offset, length, string$, attr);
  }
  /**
   * Will change the sign of the integer or exponent field if
   * <code>aChar</code> is the positive or minus sign. Returns
   * true if a sign change was attempted.
   */
  toggleSignIfNecessary(fb: DocumentFilter$FilterBypass, offset: number, aChar: number): boolean {
    if (aChar === this.getMinusSign() || aChar === this.getPositiveSign()) {
      let field = this.getFieldFrom(offset, -1);
      let newValue: any;
      try {
        if (field == null || (field !== NumberFormat_Field.EXPONENT && field !== NumberFormat_Field.EXPONENT_SYMBOL && field !== NumberFormat_Field.EXPONENT_SIGN)) {
          newValue = this.toggleSign((aChar === this.getPositiveSign()));
        } else {
          newValue = this.toggleExponentSign(offset, aChar);
        }
        if (newValue != null && this.isValidValue(newValue, false)) {
          let lc = this.getLiteralCountTo(offset);
          let string$ = this.valueToString(newValue);
          fb.remove(0, fb.getDocument().getLength());
          fb.insertString(0, string$, null);
          this.updateValue$Object(newValue);
          this.repositionCursor$int$int((this.getLiteralCountTo(offset) - lc + offset) | 0, 1);
          return true;
        }
      } catch ($e1) {
        if ($J.isa($e1, ParseException)) {
          let pe = $J.exc($e1);
          this.invalidEdit();
        } else {
          throw $e1;
        }
      }
    }
    return false;
  }
  /**
   * Invoked to toggle the sign. For this to work the value class
   * must have a single arg constructor that takes a String.
   */
  toggleSign(positive: boolean): any {
    let value = this.stringToValue$String(this.getFormattedTextField().getText$());
    if (value != null) {
      let string$ = $J.str(value);
      if (string$ != null && string$.length > 0) {
        if (positive) {
          if (string$.charCodeAt(0) === 45 /* '-' */) {
            string$ = string$.substring(1);
          }
        } else {
          if (string$.charCodeAt(0) === 43 /* '+' */) {
            string$ = string$.substring(1);
          }
          if (string$.length > 0 && string$.charCodeAt(0) !== 45 /* '-' */) {
            string$ = '-' + string$;
          }
        }
        if (string$ != null) {
          let valueClass = this.getValueClass();
          if (valueClass == null) {
            valueClass = $J.getClass(value);
          }
          try {
            ReflectUtil.checkPackageAccess(valueClass);
            SwingUtilities2.checkAccess(valueClass.getModifiers());
            let cons = valueClass.getConstructor(...[$J.cls(JString)]);
            if (cons != null) {
              SwingUtilities2.checkAccess(cons.getModifiers());
              return cons.newInstance(...[string$]);
            }
          } catch ($e2) {
            {
              let ex = $J.exc($e2);
            }
          }
        }
      }
    }
    return null;
  }
  /**
   * Invoked to toggle the sign of the exponent (for scientific
   * numbers).
   */
  toggleExponentSign(offset: number, aChar: number): any {
    let string$ = this.getFormattedTextField().getText$();
    let replaceLength = 0;
    let loc = this.getAttributeStart(NumberFormat_Field.EXPONENT_SIGN);
    if (loc >= 0) {
      replaceLength = 1;
      offset = loc;
    }
    if (aChar === this.getPositiveSign()) {
      string$ = this.getReplaceString(offset, replaceLength, null);
    } else {
      string$ = this.getReplaceString(offset, replaceLength, String.fromCharCode(aChar));
    }
    return this.stringToValue$String(string$);
  }
}

$J.define(NumberFormatter, 'javax.swing.text.NumberFormatter', { kind: 'class', sup: 'javax.swing.text.InternationalFormatter', ctors: { 'java.text.NumberFormat': '_NumberFormatter$NumberFormat', '': '_NumberFormatter$' }, meths: { 'replace(javax.swing.text.DocumentFilter$FilterBypass,int,int,java.lang.String,javax.swing.text.AttributeSet)': 'replace$FilterBypass$int$int$String$AttributeSet', 'isLiteral(java.util.Map)': 'isLiteral$Map', 'stringToValue(java.lang.String,java.text.Format)': 'stringToValue$String$Format', 'setFormat(java.text.Format)': 'setFormat$Format' } });
$J.module(() => {
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
