// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/AttributeValue.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2013, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, PlatformLogger, PlatformLogger_Level } from '../../../jre/index.ts';

export class AttributeValue extends JObject {
  static log: PlatformLogger = null;
  value_: number = 0;
  names: string[] = null;
  _AttributeValue(value: number, names: string[]): this {
    if (AttributeValue.log.isLoggable(PlatformLogger_Level.FINEST)) {
      AttributeValue.log.finest('value = ' + value + ', names = ' + $J.str(names));
    }
    if (AttributeValue.log.isLoggable(PlatformLogger_Level.FINER)) {
      if ((value < 0) || (names == null) || (value >= names.length)) {
        AttributeValue.log.finer('Assertion failed');
      }
    }
    this.value_ = value;
    this.names = names;
    return this;
  }
  hashCode(): number {
    return this.value_;
  }
  toString(): string {
    return this.names[this.value_];
  }
  static $clinit() {
    AttributeValue.log = PlatformLogger.getLogger('java.awt.AttributeValue');
  }
}

$J.define(AttributeValue, 'java.awt.AttributeValue', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,java.lang.String[]': '_AttributeValue' }, clinit: true, lazy: ['log'] });
