// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/DateFormatter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Calendar, DateFormat, DateFormat_Field, Throwable } from '../../../../jre/index.ts';
import { InternationalFormatter } from './InternationalFormatter.ts';

/**
 * DateFormatter is an <code>InternationalFormatter</code> that does its
 * formatting by way of an instance of <code>java.text.DateFormat</code>.
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
 * @see java.text.DateFormat
 *
 * @since 1.4
 */
export class DateFormatter extends InternationalFormatter {
  /**
   * This is shorthand for
   * <code>new DateFormatter(DateFormat.getDateInstance())</code>.
   */
  _DateFormatter$(): this {
    this._DateFormatter$DateFormat(DateFormat.getDateInstance());
    return this;
  }
  /**
   * Returns a DateFormatter configured with the specified
   * <code>Format</code> instance.
   *
   * @param format Format used to dictate legal values
   */
  _DateFormatter$DateFormat(format: DateFormat): this {
    this._InternationalFormatter$Format(format);
    this.setFormat$DateFormat(format);
    return this;
  }
  /**
   * Sets the format that dictates the legal values that can be edited
   * and displayed.
   * <p>
   * If you have used the nullary constructor the value of this property
   * will be determined for the current locale by way of the
   * <code>Dateformat.getDateInstance()</code> method.
   *
   * @param format DateFormat instance used for converting from/to Strings
   */
  setFormat$DateFormat(format: DateFormat): void {
    super.setFormat$Format(format);
  }
  /**
   * Returns the Calendar that <code>DateFormat</code> is associated with,
   * or if the <code>Format</code> is not a <code>DateFormat</code>
   * <code>Calendar.getInstance</code> is returned.
   */
  getCalendar(): Calendar {
    let f = this.getFormat();
    if ($J.isa(f, DateFormat)) {
      return (f).getCalendar();
    }
    return Calendar.getInstance();
  }
  /**
   * Returns true, as DateFormatterFilter will support
   * incrementing/decrementing of the value.
   */
  getSupportsIncrement(): boolean {
    return true;
  }
  /**
   * Returns the field that will be adjusted by adjustValue.
   */
  getAdjustField(start: number, attributes: JMap<any, any>): any {
    for (const $it0 = attributes.keySet().iterator(); $it0.hasNext(); ) {
      let key = $it0.next();
      if (($J.isa(key, DateFormat_Field)) && (key === DateFormat_Field.HOUR1 || (key).getCalendarField() !== -1)) {
        return key;
      }
    }
    return null;
  }
  /**
   * Adjusts the Date if FieldPosition identifies a known calendar
   * field.
   */
  adjustValue(value: any, attributes: JMap<any, any>, key: any, direction: number): any {
    if (key != null) {
      let field: number;
      if (key === DateFormat_Field.HOUR1) {
        key = DateFormat_Field.HOUR0;
      }
      field = (key).getCalendarField();
      let calendar = this.getCalendar();
      if (calendar != null) {
        calendar.setTime(value);
        let fieldValue = calendar.get(field);
        try {
          calendar.add(field, direction);
          value = calendar.getTime();
        } catch ($e1) {
          {
            let th = $J.exc($e1);
            value = null;
          }
        }
        return value;
      }
    }
    return null;
  }
}

$J.define(DateFormatter, 'javax.swing.text.DateFormatter', { kind: 'class', sup: 'javax.swing.text.InternationalFormatter', ctors: { 'java.text.DateFormat': '_DateFormatter$DateFormat', '': '_DateFormatter$' }, meths: { 'setFormat(java.text.DateFormat)': 'setFormat$DateFormat' } });
