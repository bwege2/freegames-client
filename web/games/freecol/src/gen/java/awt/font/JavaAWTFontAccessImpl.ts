// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/font/JavaAWTFontAccessImpl.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2014, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AssertionError, JObject } from '../../../../jre/index.ts';

let TextAttribute;

export class JavaAWTFontAccessImpl extends JObject {
  _JavaAWTFontAccessImpl(): this {
    return this;
  }
  getTextAttributeConstant(name: string): any {
    switch (name) {
      case 'RUN_DIRECTION':
        return TextAttribute.RUN_DIRECTION;
      case 'NUMERIC_SHAPING':
        return TextAttribute.NUMERIC_SHAPING;
      case 'BIDI_EMBEDDING':
        return TextAttribute.BIDI_EMBEDDING;
      case 'RUN_DIRECTION_LTR':
        return TextAttribute.RUN_DIRECTION_LTR;
      default:
        throw new AssertionError('Constant name is not recognized');
    }
  }
  shape(shaper: any, text: number[], start: number, count: number): void {
    // assert shaper instanceof NumericShaper
    (shaper).shape$charArr$int$int(text, start, count);
  }
}

$J.define(JavaAWTFontAccessImpl, 'java.awt.font.JavaAWTFontAccessImpl', { kind: 'class', ifaces: ['jdk.internal.access.JavaAWTFontAccess'], sup: 'java.lang.Object', ctors: { '': '_JavaAWTFontAccessImpl' } });
$J.module(() => {
  TextAttribute = $J.load('java.awt.font.TextAttribute');
});
