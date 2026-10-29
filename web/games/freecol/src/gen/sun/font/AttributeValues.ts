// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/font/AttributeValues.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2004, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Annotation, ClassCastException, CloneNotSupportedException, Exception, HashMap, Hashtable, InternalError, JBoolean, JObject, JString, Serializable, StringBuilder } from '../../../jre/index.ts';

let TextAttribute, TransformAttribute, AffineTransform, NoninvertibleTransformException, Point2D$Double, AttributeMap, EAttribute;

export class AttributeValues extends JObject {
  defined_: number = 0;
  nondefault: number = 0;
  family: string = null;
  weight: number = 0;
  width_: number = 0;
  posture: number = 0;
  size_: number = 0;
  tracking: number = 0;
  numericShaping: NumericShaper = null;
  transform_: AffineTransform = null;
  charReplacement: GraphicAttribute = null;
  foreground: Paint = null;
  background: Paint = null;
  justification: number = 0;
  imHighlight: any = null;
  font: Font = null;
  imUnderline: number = 0;
  superscript: number = 0;
  underline: number = 0;
  runDirection: number = 0;
  bidiEmbedding: number = 0;
  kerning: number = 0;
  ligatures: number = 0;
  strikethrough: boolean = false;
  swapColors: boolean = false;
  baselineTransform: AffineTransform = null;
  charTransform: AffineTransform = null;
  static DEFAULT: AttributeValues = null;
  static MASK_ALL: number = 0;
  static readonly DEFINED_KEY: string = 'sun.font.attributevalues.defined_key';
  _AttributeValues(): this {
    this.family = 'Default';
    this.weight = 1;
    this.width_ = 1;
    this.size_ = 12;
    this.justification = 1;
    this.imUnderline = -1;
    this.underline = -1;
    this.runDirection = -2;
    return this;
  }
  getFamily(): string {
    return this.family;
  }
  setFamily(f: string): void {
    this.family = f;
    this.update(EAttribute.EFAMILY);
  }
  getWeight(): number {
    return this.weight;
  }
  setWeight(f: number): void {
    this.weight = f;
    this.update(EAttribute.EWEIGHT);
  }
  getWidth(): number {
    return this.width_;
  }
  getPosture(): number {
    return this.posture;
  }
  setPosture(f: number): void {
    this.posture = f;
    this.update(EAttribute.EPOSTURE);
  }
  getSize(): number {
    return this.size_;
  }
  setSize(f: number): void {
    this.size_ = f;
    this.update(EAttribute.ESIZE);
  }
  getTransform(): AffineTransform {
    return this.transform_;
  }
  setTransform$AffineTransform(f: AffineTransform): void {
    this.transform_ = (f == null || f.isIdentity()) ? AttributeValues.DEFAULT.transform_ : new AffineTransform()._AffineTransform$AffineTransform(f);
    this.updateDerivedTransforms();
    this.update(EAttribute.ETRANSFORM);
  }
  getSuperscript(): number {
    return this.superscript;
  }
  getFont(): Font {
    return this.font;
  }
  getKerning(): number {
    return this.kerning;
  }
  getTracking(): number {
    return this.tracking;
  }
  getLigatures(): number {
    return this.ligatures;
  }
  getBaselineTransform(): AffineTransform {
    return this.baselineTransform;
  }
  getCharTransform(): AffineTransform {
    return this.charTransform;
  }
  static getMask$EAttribute(att: EAttribute): number {
    return att.mask;
  }
  static getMask$EAttributeArr(atts: EAttribute[]): number {
    let mask = 0;
    for (let a of atts) {
      mask |= a.mask;
    }
    return mask;
  }
  unsetDefault(): void {
    this.defined_ &= this.nondefault;
  }
  defineAll(mask: number): void {
    this.defined_ |= mask;
    if ((this.defined_ & EAttribute.EBASELINE_TRANSFORM.mask) !== 0) {
      throw new InternalError('can\'t define derived attribute');
    }
  }
  anyDefined(mask: number): boolean {
    return (this.defined_ & mask) !== 0;
  }
  anyNonDefault(mask: number): boolean {
    return (this.nondefault & mask) !== 0;
  }
  isNonDefault(a: EAttribute): boolean {
    return (this.nondefault & a.mask) !== 0;
  }
  setDefault(a: EAttribute): void {
    if (a.att == null) {
      throw new InternalError('can\'t set default derived attribute: ' + $J.str(a));
    }
    this.i_set$EAttribute$AttributeValues$AttributeValues(a, AttributeValues.DEFAULT);
    this.defined_ |= a.mask;
    this.nondefault &= ~a.mask;
  }
  set$EAttribute$Object(a: EAttribute, o: any): void {
    if (a.att == null) {
      throw new InternalError('can\'t set derived attribute: ' + $J.str(a));
    }
    if (o != null) {
      try {
        this.i_set$EAttribute$Object$AttributeValues(a, o);
        this.update(a);
        return;
      } catch ($e0) {
        if ($J.isa($e0, Exception)) {
          let e = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    this.setDefault(a);
  }
  get(a: EAttribute): any {
    if (a.att == null) {
      throw new InternalError('can\'t get derived attribute: ' + $J.str(a));
    }
    if ((this.nondefault & a.mask) !== 0) {
      return this.i_get(a);
    }
    return null;
  }
  merge$Map$int(map: JMap<AttributedCharacterIterator_Attribute, any>, mask: number): AttributeValues {
    if (map instanceof AttributeMap && (map).getValues() != null) {
      this.merge$AttributeValues$int((map).getValues(), mask);
    } else if (map != null && !map.isEmpty()) {
      for (const $it1 = map.entrySet().iterator(); $it1.hasNext(); ) {
        let e = $it1.next();
        try {
          let ea = EAttribute.forAttribute(e.getKey());
          if (ea != null && (mask & ea.mask) !== 0) {
            this.set$EAttribute$Object(ea, e.getValue());
          }
        } catch ($e2) {
          if ($J.isa($e2, ClassCastException)) {
            let cce = $J.exc($e2);
          } else {
            throw $e2;
          }
        }
      }
    }
    return this;
  }
  merge$AttributeValues(src: AttributeValues): AttributeValues {
    return this.merge$AttributeValues$int(src, AttributeValues.MASK_ALL);
  }
  merge$AttributeValues$int(src: AttributeValues, mask: number): AttributeValues {
    let m = mask & src.defined_;
    for (let ea of EAttribute.atts) {
      if (m === 0) {
        break;
      }
      if ((m & ea.mask) !== 0) {
        m &= ~ea.mask;
        this.i_set$EAttribute$AttributeValues$AttributeValues(ea, src);
        this.update(ea);
      }
    }
    return this;
  }
  static fromMap$Map$int(map: JMap<AttributedCharacterIterator_Attribute, any>, mask: number): AttributeValues {
    return new AttributeValues()._AttributeValues().merge$Map$int(map, mask);
  }
  toMap(fill: JMap<TextAttribute, any>): JMap<TextAttribute, any> {
    if (fill == null) {
      fill = new HashMap();
    }
    for (let m = this.defined_, i = 0; m !== 0; ++i) {
      let ea = EAttribute.atts[i];
      if ((m & ea.mask) !== 0) {
        m &= ~ea.mask;
        fill.put(ea.att, this.get(ea));
      }
    }
    return fill;
  }
  static is16Hashtable(ht: Hashtable<any, any>): boolean {
    return ht.containsKey(AttributeValues.DEFINED_KEY);
  }
  static fromSerializableHashtable(ht: Hashtable<any, any>): AttributeValues {
    let result = new AttributeValues()._AttributeValues();
    if (ht != null && !ht.isEmpty()) {
      for (const $it3 = ht.entrySet().iterator(); $it3.hasNext(); ) {
        let e = $it3.next();
        let key = e.getKey();
        let val = e.getValue();
        if ($J.equals(key, AttributeValues.DEFINED_KEY)) {
          result.defineAll((+(val)));
        } else {
          try {
            let ea = EAttribute.forAttribute(key);
            if (ea != null) {
              result.set$EAttribute$Object(ea, val);
            }
          } catch ($e4) {
            if ($J.isa($e4, ClassCastException)) {
              let ex = $J.exc($e4);
            } else {
              throw $e4;
            }
          }
        }
      }
    }
    return result;
  }
  toSerializableHashtable(): Hashtable<any, any> {
    let ht = new Hashtable();
    let hashkey = this.defined_;
    for (let m = this.defined_, i = 0; m !== 0; ++i) {
      let ea = EAttribute.atts[i];
      if ((m & ea.mask) !== 0) {
        m &= ~ea.mask;
        let o = this.get(ea);
        if (o == null) {
        } else if ($J.isa(o, Serializable)) {
          ht.put(ea.att, o);
        } else {
          hashkey &= ~ea.mask;
        }
      }
    }
    ht.put(AttributeValues.DEFINED_KEY, hashkey);
    return ht;
  }
  hashCode(): number {
    return this.defined_ << 8 ^ this.nondefault;
  }
  equals(rhs: any): boolean {
    try {
      return this.equals$AttributeValues(rhs);
    } catch ($e5) {
      if ($J.isa($e5, ClassCastException)) {
        let e = $J.exc($e5);
      } else {
        throw $e5;
      }
    }
    return false;
  }
  equals$AttributeValues(rhs: AttributeValues): boolean {
    if (rhs == null) {
      return false;
    }
    if (rhs === this) {
      return true;
    }
    return this.defined_ === rhs.defined_ && this.nondefault === rhs.nondefault && this.underline === rhs.underline && this.strikethrough === rhs.strikethrough && this.superscript === rhs.superscript && this.width_ === rhs.width_ && this.kerning === rhs.kerning && this.tracking === rhs.tracking && this.ligatures === rhs.ligatures && this.runDirection === rhs.runDirection && this.bidiEmbedding === rhs.bidiEmbedding && this.swapColors === rhs.swapColors && AttributeValues.equals(this.transform_, rhs.transform_) && AttributeValues.equals(this.foreground, rhs.foreground) && AttributeValues.equals(this.background, rhs.background) && AttributeValues.equals(this.numericShaping, rhs.numericShaping) && AttributeValues.equals($J.boxF(this.justification), $J.boxF(rhs.justification)) && AttributeValues.equals(this.charReplacement, rhs.charReplacement) && this.size_ === rhs.size_ && this.weight === rhs.weight && this.posture === rhs.posture && AttributeValues.equals(this.family, rhs.family) && AttributeValues.equals(this.font, rhs.font) && this.imUnderline === rhs.imUnderline && AttributeValues.equals(this.imHighlight, rhs.imHighlight);
  }
  clone(): AttributeValues {
    try {
      let result = super.clone();
      if (this.transform_ != null) {
        result.transform_ = new AffineTransform()._AffineTransform$AffineTransform(this.transform_);
        result.updateDerivedTransforms();
      }
      return result;
    } catch ($e6) {
      if ($J.isa($e6, CloneNotSupportedException)) {
        let e = $J.exc($e6);
        return null;
      } else {
        throw $e6;
      }
    }
  }
  toString(): string {
    let b = new StringBuilder();
    b.append(String.fromCharCode(123 /* '{' */));
    for (let m = this.defined_, i = 0; m !== 0; ++i) {
      let ea = EAttribute.atts[i];
      if ((m & ea.mask) !== 0) {
        m &= ~ea.mask;
        if (b.length() > 1) {
          b.append(', ');
        }
        b.append($J.str(ea));
        b.append(String.fromCharCode(61 /* '=' */));
        switch (ea) {
          case EAttribute.EFAMILY:
            b.append(String.fromCharCode(34 /* '"' */));
            b.append(this.family);
            b.append(String.fromCharCode(34 /* '"' */));
            break;
          case EAttribute.EWEIGHT:
            b.append($J.fstr(this.weight));
            break;
          case EAttribute.EWIDTH:
            b.append($J.fstr(this.width_));
            break;
          case EAttribute.EPOSTURE:
            b.append($J.fstr(this.posture));
            break;
          case EAttribute.ESIZE:
            b.append($J.fstr(this.size_));
            break;
          case EAttribute.ETRANSFORM:
            b.append($J.str(this.transform_));
            break;
          case EAttribute.ESUPERSCRIPT:
            b.append(String(this.superscript));
            break;
          case EAttribute.EFONT:
            b.append($J.str(this.font));
            break;
          case EAttribute.ECHAR_REPLACEMENT:
            b.append($J.str(this.charReplacement));
            break;
          case EAttribute.EFOREGROUND:
            b.append($J.str(this.foreground));
            break;
          case EAttribute.EBACKGROUND:
            b.append($J.str(this.background));
            break;
          case EAttribute.EUNDERLINE:
            b.append(String(this.underline));
            break;
          case EAttribute.ESTRIKETHROUGH:
            b.append(String(this.strikethrough));
            break;
          case EAttribute.ERUN_DIRECTION:
            b.append(String(this.runDirection));
            break;
          case EAttribute.EBIDI_EMBEDDING:
            b.append(String(this.bidiEmbedding));
            break;
          case EAttribute.EJUSTIFICATION:
            b.append($J.fstr(this.justification));
            break;
          case EAttribute.EINPUT_METHOD_HIGHLIGHT:
            b.append($J.str(this.imHighlight));
            break;
          case EAttribute.EINPUT_METHOD_UNDERLINE:
            b.append(String(this.imUnderline));
            break;
          case EAttribute.ESWAP_COLORS:
            b.append(String(this.swapColors));
            break;
          case EAttribute.ENUMERIC_SHAPING:
            b.append($J.str(this.numericShaping));
            break;
          case EAttribute.EKERNING:
            b.append(String(this.kerning));
            break;
          case EAttribute.ELIGATURES:
            b.append(String(this.ligatures));
            break;
          case EAttribute.ETRACKING:
            b.append($J.fstr(this.tracking));
            break;
          default:
            throw new InternalError();
        }
        if ((this.nondefault & ea.mask) === 0) {
          b.append(String.fromCharCode(42 /* \u002a */));
        }
      }
    }
    b.append('[btx=' + $J.str(this.baselineTransform) + ', ctx=' + $J.str(this.charTransform) + ']');
    b.append(String.fromCharCode(125 /* '}' */));
    return b.toString();
  }
  static equals(lhs: any, rhs: any): boolean {
    return lhs == null ? rhs == null : $J.equals(lhs, rhs);
  }
  update(a: EAttribute): void {
    this.defined_ |= a.mask;
    if (this.i_validate(a)) {
      if (this.i_equals(a, AttributeValues.DEFAULT)) {
        this.nondefault &= ~a.mask;
      } else {
        this.nondefault |= a.mask;
      }
    } else {
      this.setDefault(a);
    }
  }
  i_set$EAttribute$AttributeValues$AttributeValues(a: EAttribute, src: AttributeValues): void {
    switch (a) {
      case EAttribute.EFAMILY:
        this.family = src.family;
        break;
      case EAttribute.EWEIGHT:
        this.weight = src.weight;
        break;
      case EAttribute.EWIDTH:
        this.width_ = src.width_;
        break;
      case EAttribute.EPOSTURE:
        this.posture = src.posture;
        break;
      case EAttribute.ESIZE:
        this.size_ = src.size_;
        break;
      case EAttribute.ETRANSFORM:
        this.transform_ = src.transform_;
        this.updateDerivedTransforms();
        break;
      case EAttribute.ESUPERSCRIPT:
        this.superscript = src.superscript;
        break;
      case EAttribute.EFONT:
        this.font = src.font;
        break;
      case EAttribute.ECHAR_REPLACEMENT:
        this.charReplacement = src.charReplacement;
        break;
      case EAttribute.EFOREGROUND:
        this.foreground = src.foreground;
        break;
      case EAttribute.EBACKGROUND:
        this.background = src.background;
        break;
      case EAttribute.EUNDERLINE:
        this.underline = src.underline;
        break;
      case EAttribute.ESTRIKETHROUGH:
        this.strikethrough = src.strikethrough;
        break;
      case EAttribute.ERUN_DIRECTION:
        this.runDirection = src.runDirection;
        break;
      case EAttribute.EBIDI_EMBEDDING:
        this.bidiEmbedding = src.bidiEmbedding;
        break;
      case EAttribute.EJUSTIFICATION:
        this.justification = src.justification;
        break;
      case EAttribute.EINPUT_METHOD_HIGHLIGHT:
        this.imHighlight = src.imHighlight;
        break;
      case EAttribute.EINPUT_METHOD_UNDERLINE:
        this.imUnderline = src.imUnderline;
        break;
      case EAttribute.ESWAP_COLORS:
        this.swapColors = src.swapColors;
        break;
      case EAttribute.ENUMERIC_SHAPING:
        this.numericShaping = src.numericShaping;
        break;
      case EAttribute.EKERNING:
        this.kerning = src.kerning;
        break;
      case EAttribute.ELIGATURES:
        this.ligatures = src.ligatures;
        break;
      case EAttribute.ETRACKING:
        this.tracking = src.tracking;
        break;
      default:
        throw new InternalError();
    }
  }
  i_equals(a: EAttribute, src: AttributeValues): boolean {
    switch (a) {
      case EAttribute.EFAMILY:
        return AttributeValues.equals(this.family, src.family);
      case EAttribute.EWEIGHT:
        return this.weight === src.weight;
      case EAttribute.EWIDTH:
        return this.width_ === src.width_;
      case EAttribute.EPOSTURE:
        return this.posture === src.posture;
      case EAttribute.ESIZE:
        return this.size_ === src.size_;
      case EAttribute.ETRANSFORM:
        return AttributeValues.equals(this.transform_, src.transform_);
      case EAttribute.ESUPERSCRIPT:
        return this.superscript === src.superscript;
      case EAttribute.EFONT:
        return AttributeValues.equals(this.font, src.font);
      case EAttribute.ECHAR_REPLACEMENT:
        return AttributeValues.equals(this.charReplacement, src.charReplacement);
      case EAttribute.EFOREGROUND:
        return AttributeValues.equals(this.foreground, src.foreground);
      case EAttribute.EBACKGROUND:
        return AttributeValues.equals(this.background, src.background);
      case EAttribute.EUNDERLINE:
        return this.underline === src.underline;
      case EAttribute.ESTRIKETHROUGH:
        return this.strikethrough === src.strikethrough;
      case EAttribute.ERUN_DIRECTION:
        return this.runDirection === src.runDirection;
      case EAttribute.EBIDI_EMBEDDING:
        return this.bidiEmbedding === src.bidiEmbedding;
      case EAttribute.EJUSTIFICATION:
        return this.justification === src.justification;
      case EAttribute.EINPUT_METHOD_HIGHLIGHT:
        return AttributeValues.equals(this.imHighlight, src.imHighlight);
      case EAttribute.EINPUT_METHOD_UNDERLINE:
        return this.imUnderline === src.imUnderline;
      case EAttribute.ESWAP_COLORS:
        return this.swapColors === src.swapColors;
      case EAttribute.ENUMERIC_SHAPING:
        return AttributeValues.equals(this.numericShaping, src.numericShaping);
      case EAttribute.EKERNING:
        return this.kerning === src.kerning;
      case EAttribute.ELIGATURES:
        return this.ligatures === src.ligatures;
      case EAttribute.ETRACKING:
        return this.tracking === src.tracking;
      default:
        throw new InternalError();
    }
  }
  i_set$EAttribute$Object$AttributeValues(a: EAttribute, o: any): void {
    switch (a) {
      case EAttribute.EFAMILY:
        this.family = JString.trim((o));
        break;
      case EAttribute.EWEIGHT:
        this.weight = Math.fround(+(o));
        break;
      case EAttribute.EWIDTH:
        this.width_ = Math.fround(+(o));
        break;
      case EAttribute.EPOSTURE:
        this.posture = Math.fround(+(o));
        break;
      case EAttribute.ESIZE:
        this.size_ = Math.fround(+(o));
        break;
      case EAttribute.ETRANSFORM:
        {
          if (o instanceof TransformAttribute) {
            let ta = o;
            if (ta.isIdentity()) {
              this.transform_ = null;
            } else {
              this.transform_ = ta.getTransform();
            }
          } else {
            this.transform_ = new AffineTransform()._AffineTransform$AffineTransform(o);
          }
          this.updateDerivedTransforms();
        }
        break;
      case EAttribute.ESUPERSCRIPT:
        this.superscript = (((+(o))) << 24) >> 24;
        break;
      case EAttribute.EFONT:
        this.font = o;
        break;
      case EAttribute.ECHAR_REPLACEMENT:
        this.charReplacement = o;
        break;
      case EAttribute.EFOREGROUND:
        this.foreground = o;
        break;
      case EAttribute.EBACKGROUND:
        this.background = o;
        break;
      case EAttribute.EUNDERLINE:
        this.underline = (((+(o))) << 24) >> 24;
        break;
      case EAttribute.ESTRIKETHROUGH:
        this.strikethrough = (o);
        break;
      case EAttribute.ERUN_DIRECTION:
        {
          if ($J.isa(o, JBoolean)) {
            this.runDirection = ((($J.equals(TextAttribute.RUN_DIRECTION_LTR, o) ? 0 : 1)) << 24) >> 24;
          } else {
            this.runDirection = (((+(o))) << 24) >> 24;
          }
        }
        break;
      case EAttribute.EBIDI_EMBEDDING:
        this.bidiEmbedding = (((+(o))) << 24) >> 24;
        break;
      case EAttribute.EJUSTIFICATION:
        this.justification = Math.fround(+(o));
        break;
      case EAttribute.EINPUT_METHOD_HIGHLIGHT:
        {
          if ($J.isa(o, Annotation)) {
            let at = o;
            this.imHighlight = at.getValue();
          } else {
            this.imHighlight = o;
          }
        }
        break;
      case EAttribute.EINPUT_METHOD_UNDERLINE:
        this.imUnderline = (((+(o))) << 24) >> 24;
        break;
      case EAttribute.ESWAP_COLORS:
        this.swapColors = (o);
        break;
      case EAttribute.ENUMERIC_SHAPING:
        this.numericShaping = o;
        break;
      case EAttribute.EKERNING:
        this.kerning = (((+(o))) << 24) >> 24;
        break;
      case EAttribute.ELIGATURES:
        this.ligatures = (((+(o))) << 24) >> 24;
        break;
      case EAttribute.ETRACKING:
        this.tracking = Math.fround(+(o));
        break;
      default:
        throw new InternalError();
    }
  }
  i_get(a: EAttribute): any {
    switch (a) {
      case EAttribute.EFAMILY:
        return this.family;
      case EAttribute.EWEIGHT:
        return $J.boxF($J.boxF(this.weight));
      case EAttribute.EWIDTH:
        return $J.boxF($J.boxF(this.width_));
      case EAttribute.EPOSTURE:
        return $J.boxF($J.boxF(this.posture));
      case EAttribute.ESIZE:
        return $J.boxF($J.boxF(this.size_));
      case EAttribute.ETRANSFORM:
        return this.transform_ == null ? TransformAttribute.IDENTITY : new TransformAttribute()._TransformAttribute(this.transform_);
      case EAttribute.ESUPERSCRIPT:
        return this.superscript;
      case EAttribute.EFONT:
        return this.font;
      case EAttribute.ECHAR_REPLACEMENT:
        return this.charReplacement;
      case EAttribute.EFOREGROUND:
        return this.foreground;
      case EAttribute.EBACKGROUND:
        return this.background;
      case EAttribute.EUNDERLINE:
        return this.underline;
      case EAttribute.ESTRIKETHROUGH:
        return this.strikethrough;
      case EAttribute.ERUN_DIRECTION:
        {
          switch (this.runDirection) {
            case 0:
              return TextAttribute.RUN_DIRECTION_LTR;
            case 1:
              return TextAttribute.RUN_DIRECTION_RTL;
            default:
              return null;
          }
        }
      case EAttribute.EBIDI_EMBEDDING:
        return this.bidiEmbedding;
      case EAttribute.EJUSTIFICATION:
        return $J.boxF($J.boxF(this.justification));
      case EAttribute.EINPUT_METHOD_HIGHLIGHT:
        return this.imHighlight;
      case EAttribute.EINPUT_METHOD_UNDERLINE:
        return this.imUnderline;
      case EAttribute.ESWAP_COLORS:
        return this.swapColors;
      case EAttribute.ENUMERIC_SHAPING:
        return this.numericShaping;
      case EAttribute.EKERNING:
        return this.kerning;
      case EAttribute.ELIGATURES:
        return this.ligatures;
      case EAttribute.ETRACKING:
        return $J.boxF($J.boxF(this.tracking));
      default:
        throw new InternalError();
    }
  }
  i_validate(a: EAttribute): boolean {
    switch (a) {
      case EAttribute.EFAMILY:
        if (this.family == null || this.family.length === 0) {
          this.family = AttributeValues.DEFAULT.family;
        }
        return true;
      case EAttribute.EWEIGHT:
        return this.weight > Math.fround(0) && this.weight < Math.fround(10);
      case EAttribute.EWIDTH:
        return this.width_ >= 0.5 && this.width_ < Math.fround(10);
      case EAttribute.EPOSTURE:
        return this.posture >= Math.fround(-1) && this.posture <= Math.fround(1);
      case EAttribute.ESIZE:
        return this.size_ >= Math.fround(0);
      case EAttribute.ETRANSFORM:
        if (this.transform_ != null && this.transform_.isIdentity()) {
          this.transform_ = AttributeValues.DEFAULT.transform_;
        }
        return true;
      case EAttribute.ESUPERSCRIPT:
        return this.superscript >= -7 && this.superscript <= 7;
      case EAttribute.EFONT:
        return true;
      case EAttribute.ECHAR_REPLACEMENT:
        return true;
      case EAttribute.EFOREGROUND:
        return true;
      case EAttribute.EBACKGROUND:
        return true;
      case EAttribute.EUNDERLINE:
        return this.underline >= -1 && this.underline < 6;
      case EAttribute.ESTRIKETHROUGH:
        return true;
      case EAttribute.ERUN_DIRECTION:
        return this.runDirection >= -2 && this.runDirection <= 1;
      case EAttribute.EBIDI_EMBEDDING:
        return this.bidiEmbedding >= -61 && this.bidiEmbedding < 62;
      case EAttribute.EJUSTIFICATION:
        this.justification = Math.max(0, Math.min(this.justification, 1));
        return true;
      case EAttribute.EINPUT_METHOD_HIGHLIGHT:
        return true;
      case EAttribute.EINPUT_METHOD_UNDERLINE:
        return this.imUnderline >= -1 && this.imUnderline < 6;
      case EAttribute.ESWAP_COLORS:
        return true;
      case EAttribute.ENUMERIC_SHAPING:
        return true;
      case EAttribute.EKERNING:
        return this.kerning >= 0 && this.kerning <= 1;
      case EAttribute.ELIGATURES:
        return this.ligatures >= 0 && this.ligatures <= 1;
      case EAttribute.ETRACKING:
        return this.tracking >= Math.fround(-1) && this.tracking <= Math.fround(10);
      default:
        throw new InternalError('unknown attribute: ' + $J.str(a));
    }
  }
  updateDerivedTransforms(): void {
    if (this.transform_ == null) {
      this.baselineTransform = null;
      this.charTransform = null;
    } else {
      this.charTransform = new AffineTransform()._AffineTransform$AffineTransform(this.transform_);
      this.baselineTransform = AttributeValues.extractXRotation(this.charTransform, true);
      if (this.charTransform.isIdentity()) {
        this.charTransform = null;
      }
      if (this.baselineTransform.isIdentity()) {
        this.baselineTransform = null;
      }
    }
    if (this.baselineTransform == null) {
      this.nondefault &= ~EAttribute.EBASELINE_TRANSFORM.mask;
    } else {
      this.nondefault |= EAttribute.EBASELINE_TRANSFORM.mask;
    }
  }
  static extractXRotation(tx: AffineTransform, andTranslation: boolean): AffineTransform {
    return AttributeValues.extractRotation(new Point2D$Double()._Point2D$Double$double$double(1, 0), tx, andTranslation);
  }
  static extractRotation(pt: Point2D$Double, tx: AffineTransform, andTranslation: boolean): AffineTransform {
    tx.deltaTransform$Point2D$Point2D(pt, pt);
    let rtx = AffineTransform.getRotateInstance$double$double(pt.x_, pt.y_);
    try {
      let rtxi = rtx.createInverse();
      let dx = tx.getTranslateX();
      let dy = tx.getTranslateY();
      tx.preConcatenate(rtxi);
      if (andTranslation) {
        if (dx !== 0 || dy !== 0) {
          tx.setTransform$double$double$double$double$double$double(tx.getScaleX(), tx.getShearY(), tx.getShearX(), tx.getScaleY(), 0, 0);
          rtx.setTransform$double$double$double$double$double$double(rtx.getScaleX(), rtx.getShearY(), rtx.getShearX(), rtx.getScaleY(), dx, dy);
        }
      }
    } catch ($e7) {
      if ($J.isa($e7, NoninvertibleTransformException)) {
        let e = $J.exc($e7);
        return null;
      } else {
        throw $e7;
      }
    }
    return rtx;
  }
  static $clinit() {
    AttributeValues.DEFAULT = new AttributeValues()._AttributeValues();
    AttributeValues.MASK_ALL = AttributeValues.getMask$EAttributeArr(EAttribute.values());
  }
}

$J.define(AttributeValues, 'sun.font.AttributeValues', { kind: 'class', ifaces: ['java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { '': '_AttributeValues' }, meths: { 'i_set(sun.font.EAttribute,java.lang.Object)': 'i_set$EAttribute$Object$AttributeValues', 'i_set(sun.font.EAttribute,sun.font.AttributeValues)': 'i_set$EAttribute$AttributeValues$AttributeValues', 'equals(sun.font.AttributeValues)': 'equals$AttributeValues', 'fromMap(java.util.Map,int)': 'fromMap$Map$int', 'fromMap(java.util.Map)': 'fromMap$Map', 'merge(sun.font.AttributeValues,int)': 'merge$AttributeValues$int', 'merge(sun.font.AttributeValues)': 'merge$AttributeValues', 'merge(java.util.Map,int)': 'merge$Map$int', 'merge(java.util.Map)': 'merge$Map', 'set(sun.font.EAttribute,java.lang.Object)': 'set$EAttribute$Object', 'set(sun.font.EAttribute,sun.font.AttributeValues)': 'set$EAttribute$AttributeValues', 'getMask(sun.font.EAttribute[])': 'getMask$EAttributeArr', 'getMask(sun.font.EAttribute)': 'getMask$EAttribute', 'setInputMethodHighlight(java.awt.im.InputMethodHighlight)': 'setInputMethodHighlight$InputMethodHighlight', 'setInputMethodHighlight(java.text.Annotation)': 'setInputMethodHighlight$Annotation', 'setTransform(java.awt.font.TransformAttribute)': 'setTransform$TransformAttribute', 'setTransform(java.awt.geom.AffineTransform)': 'setTransform$AffineTransform' }, clinit: true, lazy: ['DEFAULT', 'MASK_ALL'] });
$J.module(() => {
  TextAttribute = $J.load('java.awt.font.TextAttribute');
  TransformAttribute = $J.load('java.awt.font.TransformAttribute');
  AffineTransform = $J.load('java.awt.geom.AffineTransform');
  NoninvertibleTransformException = $J.load('java.awt.geom.NoninvertibleTransformException');
  Point2D$Double = $J.load('java.awt.geom.Point2D$Double');
  AttributeMap = $J.load('sun.font.AttributeMap');
  EAttribute = $J.load('sun.font.EAttribute');
});
