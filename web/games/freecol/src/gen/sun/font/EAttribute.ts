// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/font/EAttribute.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JEnum, JString } from '../../../jre/index.ts';

let TextAttribute;

export class EAttribute extends JEnum {
  mask: number = 0;
  att: TextAttribute = null;
  static atts: EAttribute[] = null;
  static EFAMILY: EAttribute = null;
  static EWEIGHT: EAttribute = null;
  static EWIDTH: EAttribute = null;
  static EPOSTURE: EAttribute = null;
  static ESIZE: EAttribute = null;
  static ETRANSFORM: EAttribute = null;
  static ESUPERSCRIPT: EAttribute = null;
  static EFONT: EAttribute = null;
  static ECHAR_REPLACEMENT: EAttribute = null;
  static EFOREGROUND: EAttribute = null;
  static EBACKGROUND: EAttribute = null;
  static EUNDERLINE: EAttribute = null;
  static ESTRIKETHROUGH: EAttribute = null;
  static ERUN_DIRECTION: EAttribute = null;
  static EBIDI_EMBEDDING: EAttribute = null;
  static EJUSTIFICATION: EAttribute = null;
  static EINPUT_METHOD_HIGHLIGHT: EAttribute = null;
  static EINPUT_METHOD_UNDERLINE: EAttribute = null;
  static ESWAP_COLORS: EAttribute = null;
  static ENUMERIC_SHAPING: EAttribute = null;
  static EKERNING: EAttribute = null;
  static ELIGATURES: EAttribute = null;
  static ETRACKING: EAttribute = null;
  static EBASELINE_TRANSFORM: EAttribute = null;
  static $VALUES: EAttribute[] = null;
  _EAttribute($name: string, $ordinal: number, ta: TextAttribute): this {
    this._JEnum($name, $ordinal);
    this.mask = 1 << this.ordinal();
    this.att = ta;
    return this;
  }
  static forAttribute(ta: AttributedCharacterIterator_Attribute): EAttribute {
    for (let ea of EAttribute.atts) {
      if (ea.att === ta) {
        return ea;
      }
    }
    return null;
  }
  toString(): string {
    return this.name().substring(1).toLowerCase();
  }
  static values(): EAttribute[] { return EAttribute.$VALUES.slice(); }
  static valueOf(name: string): EAttribute { return $J.enumValueOf(EAttribute, name); }
  static $clinit() {
    EAttribute.EFAMILY = new EAttribute()._EAttribute('EFAMILY', 0, TextAttribute.FAMILY);
    EAttribute.EWEIGHT = new EAttribute()._EAttribute('EWEIGHT', 1, TextAttribute.WEIGHT);
    EAttribute.EWIDTH = new EAttribute()._EAttribute('EWIDTH', 2, TextAttribute.WIDTH);
    EAttribute.EPOSTURE = new EAttribute()._EAttribute('EPOSTURE', 3, TextAttribute.POSTURE);
    EAttribute.ESIZE = new EAttribute()._EAttribute('ESIZE', 4, TextAttribute.SIZE);
    EAttribute.ETRANSFORM = new EAttribute()._EAttribute('ETRANSFORM', 5, TextAttribute.TRANSFORM);
    EAttribute.ESUPERSCRIPT = new EAttribute()._EAttribute('ESUPERSCRIPT', 6, TextAttribute.SUPERSCRIPT);
    EAttribute.EFONT = new EAttribute()._EAttribute('EFONT', 7, TextAttribute.FONT);
    EAttribute.ECHAR_REPLACEMENT = new EAttribute()._EAttribute('ECHAR_REPLACEMENT', 8, TextAttribute.CHAR_REPLACEMENT);
    EAttribute.EFOREGROUND = new EAttribute()._EAttribute('EFOREGROUND', 9, TextAttribute.FOREGROUND);
    EAttribute.EBACKGROUND = new EAttribute()._EAttribute('EBACKGROUND', 10, TextAttribute.BACKGROUND);
    EAttribute.EUNDERLINE = new EAttribute()._EAttribute('EUNDERLINE', 11, TextAttribute.UNDERLINE);
    EAttribute.ESTRIKETHROUGH = new EAttribute()._EAttribute('ESTRIKETHROUGH', 12, TextAttribute.STRIKETHROUGH);
    EAttribute.ERUN_DIRECTION = new EAttribute()._EAttribute('ERUN_DIRECTION', 13, TextAttribute.RUN_DIRECTION);
    EAttribute.EBIDI_EMBEDDING = new EAttribute()._EAttribute('EBIDI_EMBEDDING', 14, TextAttribute.BIDI_EMBEDDING);
    EAttribute.EJUSTIFICATION = new EAttribute()._EAttribute('EJUSTIFICATION', 15, TextAttribute.JUSTIFICATION);
    EAttribute.EINPUT_METHOD_HIGHLIGHT = new EAttribute()._EAttribute('EINPUT_METHOD_HIGHLIGHT', 16, TextAttribute.INPUT_METHOD_HIGHLIGHT);
    EAttribute.EINPUT_METHOD_UNDERLINE = new EAttribute()._EAttribute('EINPUT_METHOD_UNDERLINE', 17, TextAttribute.INPUT_METHOD_UNDERLINE);
    EAttribute.ESWAP_COLORS = new EAttribute()._EAttribute('ESWAP_COLORS', 18, TextAttribute.SWAP_COLORS);
    EAttribute.ENUMERIC_SHAPING = new EAttribute()._EAttribute('ENUMERIC_SHAPING', 19, TextAttribute.NUMERIC_SHAPING);
    EAttribute.EKERNING = new EAttribute()._EAttribute('EKERNING', 20, TextAttribute.KERNING);
    EAttribute.ELIGATURES = new EAttribute()._EAttribute('ELIGATURES', 21, TextAttribute.LIGATURES);
    EAttribute.ETRACKING = new EAttribute()._EAttribute('ETRACKING', 22, TextAttribute.TRACKING);
    EAttribute.EBASELINE_TRANSFORM = new EAttribute()._EAttribute('EBASELINE_TRANSFORM', 23, null);
    EAttribute.$VALUES = [EAttribute.EFAMILY, EAttribute.EWEIGHT, EAttribute.EWIDTH, EAttribute.EPOSTURE, EAttribute.ESIZE, EAttribute.ETRANSFORM, EAttribute.ESUPERSCRIPT, EAttribute.EFONT, EAttribute.ECHAR_REPLACEMENT, EAttribute.EFOREGROUND, EAttribute.EBACKGROUND, EAttribute.EUNDERLINE, EAttribute.ESTRIKETHROUGH, EAttribute.ERUN_DIRECTION, EAttribute.EBIDI_EMBEDDING, EAttribute.EJUSTIFICATION, EAttribute.EINPUT_METHOD_HIGHLIGHT, EAttribute.EINPUT_METHOD_UNDERLINE, EAttribute.ESWAP_COLORS, EAttribute.ENUMERIC_SHAPING, EAttribute.EKERNING, EAttribute.ELIGATURES, EAttribute.ETRACKING, EAttribute.EBASELINE_TRANSFORM];
    EAttribute.atts = EAttribute.values();
  }
}

$J.define(EAttribute, 'sun.font.EAttribute', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'java.awt.font.TextAttribute': '_EAttribute' }, clinit: true, lazy: ['$VALUES', 'EFAMILY', 'EWEIGHT', 'EWIDTH', 'EPOSTURE', 'ESIZE', 'ETRANSFORM', 'ESUPERSCRIPT', 'EFONT', 'ECHAR_REPLACEMENT', 'EFOREGROUND', 'EBACKGROUND', 'EUNDERLINE', 'ESTRIKETHROUGH', 'ERUN_DIRECTION', 'EBIDI_EMBEDDING', 'EJUSTIFICATION', 'EINPUT_METHOD_HIGHLIGHT', 'EINPUT_METHOD_UNDERLINE', 'ESWAP_COLORS', 'ENUMERIC_SHAPING', 'EKERNING', 'ELIGATURES', 'ETRACKING', 'EBASELINE_TRANSFORM', 'atts'] });
$J.module(() => {
  TextAttribute = $J.load('java.awt.font.TextAttribute');
});
