// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/UnitValue.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * License (BSD):
 * ==============
 *
 * Copyright (c) 2004, Mikael Grev, MiG InfoCom AB. (miglayout (at) miginfocom (dot) com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this list
 * of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 * Neither the name of the MiG InfoCom AB nor the names of its contributors may be
 * used to endorse or promote products derived from this software without specific
 * prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE.
 *
 * @version 1.0
 * @author Mikael Grev, MiG InfoCom AB
 *         Date: 2006-sep-08
 */
import { $J, ArrayList, HashMap, IllegalArgumentException, IllegalStateException, JObject, JString, NullPointerException } from '../../../../jre/index.ts';

let Expression, PersistenceDelegate, ConstraintParser, LayoutUtil, LinkHandler, PlatformDefaults, UnitConverter;

export class UnitValue extends JObject {
  static UNIT_MAP: HashMap<string, number> = null;
  static CONVERTERS: ArrayList<UnitConverter> = null;
  /**
   * An operation indicating a static value.
   */
  static readonly STATIC: number = 100;
  /**
   * An operation indicating a addition of two sub units.
   */
  static readonly ADD: number = 101;
  /**
   * An operation indicating a subtraction of two sub units
   */
  static readonly SUB: number = 102;
  /**
   * An operation indicating a multiplication of two sub units.
   */
  static readonly MUL: number = 103;
  /**
   * An operation indicating a division of two sub units.
   */
  static readonly DIV: number = 104;
  /**
   * An operation indicating the minimum of two sub units
   */
  static readonly MIN: number = 105;
  /**
   * An operation indicating the maximum of two sub units
   */
  static readonly MAX: number = 106;
  /**
   * An operation indicating the middle value of two sub units
   */
  static readonly MID: number = 107;
  /**
   * A unit indicating pixels.
   */
  static readonly PIXEL: number = 0;
  /**
   * A unit indicating logical horizontal pixels.
   */
  static readonly LPX: number = 1;
  /**
   * A unit indicating logical vertical pixels.
   */
  static readonly LPY: number = 2;
  /**
   * A unit indicating millimeters.
   */
  static readonly MM: number = 3;
  /**
   * A unit indicating centimeters.
   */
  static readonly CM: number = 4;
  /**
   * A unit indicating inches.
   */
  static readonly INCH: number = 5;
  /**
   * A unit indicating percent.
   */
  static readonly PERCENT: number = 6;
  /**
   * A unit indicating points.
   */
  static readonly PT: number = 7;
  /**
   * A unit indicating screen percentage width.
   */
  static readonly SPX: number = 8;
  /**
   * A unit indicating screen percentage height.
   */
  static readonly SPY: number = 9;
  /**
   * A unit indicating alignment.
   */
  static readonly ALIGN: number = 12;
  /**
   * A unit indicating minimum size.
   */
  static readonly MIN_SIZE: number = 13;
  /**
   * A unit indicating preferred size.
   */
  static readonly PREF_SIZE: number = 14;
  /**
   * A unit indicating maximum size.
   */
  static readonly MAX_SIZE: number = 15;
  /**
   * A unit indicating button size.
   */
  static readonly BUTTON: number = 16;
  /**
   * A unit indicating linking to x.
   */
  static readonly LINK_X: number = 18;
  /**
   * A unit indicating linking to y.
   */
  static readonly LINK_Y: number = 19;
  /**
   * A unit indicating linking to width.
   */
  static readonly LINK_W: number = 20;
  /**
   * A unit indicating linking to height.
   */
  static readonly LINK_H: number = 21;
  /**
   * A unit indicating linking to x2.
   */
  static readonly LINK_X2: number = 22;
  /**
   * A unit indicating linking to y2.
   */
  static readonly LINK_Y2: number = 23;
  /**
   * A unit indicating linking to x position on screen.
   */
  static readonly LINK_XPOS: number = 24;
  /**
   * A unit indicating linking to y position on screen.
   */
  static readonly LINK_YPOS: number = 25;
  /**
   * A unit indicating a lookup.
   */
  static readonly LOOKUP: number = 26;
  /**
   * A unit indicating label alignment.
   */
  static readonly LABEL_ALIGN: number = 27;
  static readonly IDENTITY: number = -1;
  static ZERO: UnitValue = null;
  static TOP: UnitValue = null;
  static LEADING: UnitValue = null;
  static LEFT: UnitValue = null;
  static CENTER: UnitValue = null;
  static TRAILING: UnitValue = null;
  static RIGHT: UnitValue = null;
  static BOTTOM: UnitValue = null;
  static LABEL: UnitValue = null;
  static INF: UnitValue = null;
  static BASELINE_IDENTITY: UnitValue = null;
  value_: number = 0;
  unit: number = 0;
  oper: number = 0;
  unitStr: string = null;
  linkId: string = null;
  isHor: boolean = false;
  subUnits: UnitValue[] = null;
  static SCALE: number[] = null;
  $init_UnitValue() {
    this.linkId = null;
  }
  _UnitValue$float(value: number): this {
    this._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(value, null, UnitValue.PIXEL, true, UnitValue.STATIC, null, null, $J.fstr(value) + 'px');
    return this;
  }
  _UnitValue$float$int$String(value: number, unit: number, createString: string): this {
    this._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(value, null, unit, true, UnitValue.STATIC, null, null, createString);
    return this;
  }
  _UnitValue$float$String$boolean$int$String(value: number, unitStr: string, isHor: boolean, oper: number, createString: string): this {
    this._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(value, unitStr, -1, isHor, oper, null, null, createString);
    return this;
  }
  _UnitValue$boolean$int$UnitValue$UnitValue$String(isHor: boolean, oper: number, sub1: UnitValue, sub2: UnitValue, createString: string): this {
    this._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(0, '', -1, isHor, oper, sub1, sub2, createString);
    if (sub1 == null || sub2 == null) {
      throw new IllegalArgumentException('Sub units is null!');
    }
    return this;
  }
  _UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(value: number, unitStr: string, unit: number, isHor: boolean, oper: number, sub1: UnitValue, sub2: UnitValue, createString: string): this {
    this.$init_UnitValue();
    if (oper < UnitValue.STATIC || oper > UnitValue.MID) {
      throw new IllegalArgumentException('Unknown Operation: ' + oper);
    }
    if (oper >= UnitValue.ADD && oper <= UnitValue.MID && (sub1 == null || sub2 == null)) {
      throw new IllegalArgumentException(oper + ' Operation may not have null sub-UnitValues.');
    }
    this.value_ = value;
    this.oper = oper;
    this.isHor = isHor;
    this.unitStr = unitStr;
    this.unit = unitStr != null ? this.parseUnitString() : unit;
    this.subUnits = sub1 != null && sub2 != null ? [sub1, sub2] : null;
    LayoutUtil.putCCString(this, createString);
    return this;
  }
  /**
   * Returns the size in pixels rounded.
   * @param refValue The reference value. Normally the size of the parent. For unit {@link #ALIGN} the current size of the component should be sent in.
   * @param parent The parent. May be <code>null</code> for testing the validity of the value, but should normally not and are not
   * required to return any usable value if <code>null</code>.
   * @param comp The component, if any, that the value is for. Might be <code>null</code> if the value is not
   * connected to any component.
   * @return The size in pixels.
   */
  getPixels(refValue: number, parent: ContainerWrapper, comp: ComponentWrapper): number {
    return $J.roundf(this.getPixelsExact(refValue, parent, comp));
  }
  /**
   * Returns the size in pixels.
   * @param refValue The reference value. Normally the size of the parent. For unit {@link #ALIGN} the current size of the component should be sent in.
   * @param parent The parent. May be <code>null</code> for testing the validity of the value, but should normally not and are not
   * required to return any usable value if <code>null</code>.
   * @param comp The component, if any, that the value is for. Might be <code>null</code> if the value is not
   * connected to any component.
   * @return The size in pixels.
   */
  getPixelsExact(refValue: number, parent: ContainerWrapper, comp: ComponentWrapper): number {
    if (parent == null) {
      return 1;
    }
    if (this.oper === UnitValue.STATIC) {
      {
        let f: number, s: number, st: number, sz: number, v: number, res: number;
        switch (this.unit) {
          case UnitValue.PIXEL:
            return this.value_;
          case UnitValue.LPX:
          case UnitValue.LPY:
            return Math.fround(parent.getPixelUnitFactor(this.unit === UnitValue.LPX) * this.value_);
          case UnitValue.MM:
          case UnitValue.CM:
          case UnitValue.INCH:
          case UnitValue.PT:
            f = UnitValue.SCALE[(this.unit - UnitValue.MM) | 0];
            s = this.isHor ? PlatformDefaults.getHorizontalScaleFactor() : PlatformDefaults.getVerticalScaleFactor();
            if (s != null) {
              f = Math.fround(f * +s);
            }
            return Math.fround(Math.fround((this.isHor ? parent.getHorizontalScreenDPI() : parent.getVerticalScreenDPI()) * this.value_) / f);
          case UnitValue.PERCENT:
            return Math.fround(Math.fround(this.value_ * refValue) * Math.fround(0.01));
          case UnitValue.SPX:
          case UnitValue.SPY:
            return Math.fround(Math.fround((this.unit === UnitValue.SPX ? parent.getScreenWidth() : parent.getScreenHeight()) * this.value_) * Math.fround(0.01));
          case UnitValue.ALIGN:
            st = LinkHandler.getValue(parent.getLayout(), 'visual', this.isHor ? LinkHandler.X : LinkHandler.Y);
            sz = LinkHandler.getValue(parent.getLayout(), 'visual', this.isHor ? LinkHandler.WIDTH : LinkHandler.HEIGHT);
            if (st == null || sz == null) {
              return 0;
            }
            return Math.fround(Math.fround(this.value_ * (Math.fround(Math.max(0, (+sz)) - refValue))) + st);
          case UnitValue.MIN_SIZE:
            if (comp == null) {
              return 0;
            }
            return Math.fround(this.isHor ? comp.getMinimumWidth(comp.getHeight()) : comp.getMinimumHeight(comp.getWidth()));
          case UnitValue.PREF_SIZE:
            if (comp == null) {
              return 0;
            }
            return Math.fround(this.isHor ? comp.getPreferredWidth(comp.getHeight()) : comp.getPreferredHeight(comp.getWidth()));
          case UnitValue.MAX_SIZE:
            if (comp == null) {
              return 0;
            }
            return Math.fround(this.isHor ? comp.getMaximumWidth(comp.getHeight()) : comp.getMaximumHeight(comp.getWidth()));
          case UnitValue.BUTTON:
            return PlatformDefaults.getMinimumButtonWidthIncludingPadding(refValue, parent, comp);
          case UnitValue.LINK_X:
          case UnitValue.LINK_Y:
          case UnitValue.LINK_W:
          case UnitValue.LINK_H:
          case UnitValue.LINK_X2:
          case UnitValue.LINK_Y2:
          case UnitValue.LINK_XPOS:
          case UnitValue.LINK_YPOS:
            v = LinkHandler.getValue(parent.getLayout(), this.getLinkTargetId(), (this.unit - (this.unit >= UnitValue.LINK_XPOS ? UnitValue.LINK_XPOS : UnitValue.LINK_X)) | 0);
            if (v == null) {
              return 0;
            }
            if (this.unit === UnitValue.LINK_XPOS) {
              return Math.fround((parent.getScreenLocationX() + v) | 0);
            }
            if (this.unit === UnitValue.LINK_YPOS) {
              return Math.fround((parent.getScreenLocationY() + v) | 0);
            }
            return Math.fround(v);
          case UnitValue.LOOKUP:
            res = this.lookup(refValue, parent, comp);
            if (res !== Math.fround(UnitConverter.UNABLE)) {
              return res;
            }
          case UnitValue.LABEL_ALIGN:
            return Math.fround(PlatformDefaults.getLabelAlignPercentage() * refValue);
          case UnitValue.IDENTITY:
        }
      }
      throw new IllegalArgumentException('Unknown/illegal unit: ' + this.unit + ', unitStr: ' + this.unitStr);
    }
    if (this.subUnits != null && this.subUnits.length === 2) {
      let r1 = this.subUnits[0].getPixelsExact(refValue, parent, comp);
      let r2 = this.subUnits[1].getPixelsExact(refValue, parent, comp);
      switch (this.oper) {
        case UnitValue.ADD:
          return Math.fround(r1 + r2);
        case UnitValue.SUB:
          return Math.fround(r1 - r2);
        case UnitValue.MUL:
          return Math.fround(r1 * r2);
        case UnitValue.DIV:
          return Math.fround(r1 / r2);
        case UnitValue.MIN:
          return r1 < r2 ? r1 : r2;
        case UnitValue.MAX:
          return r1 > r2 ? r1 : r2;
        case UnitValue.MID:
          return Math.fround((Math.fround(r1 + r2)) * 0.5);
      }
    }
    throw new IllegalArgumentException('Internal: Unknown Oper: ' + this.oper);
  }
  lookup(refValue: number, parent: ContainerWrapper, comp: ComponentWrapper): number {
    let res = Math.fround(UnitConverter.UNABLE);
    for (let i = (UnitValue.CONVERTERS.size() - 1) | 0; i >= 0; i--) {
      res = Math.fround(UnitValue.CONVERTERS.get(i).convertToPixels(this.value_, this.unitStr, this.isHor, refValue, parent, comp));
      if (res !== Math.fround(UnitConverter.UNABLE)) {
        return res;
      }
    }
    return Math.fround(PlatformDefaults.convertToPixels(this.value_, this.unitStr, this.isHor, refValue, parent, comp));
  }
  parseUnitString(): number {
    let len = this.unitStr.length;
    if (len === 0) {
      return this.isHor ? PlatformDefaults.getDefaultHorizontalUnit() : PlatformDefaults.getDefaultVerticalUnit();
    }
    let u = UnitValue.UNIT_MAP.get(this.unitStr);
    if (u != null) {
      if (!this.isHor && (u === UnitValue.BUTTON || u === UnitValue.LABEL_ALIGN)) {
        throw new IllegalArgumentException('Not valid in vertical contexts: \'' + this.unitStr + '\'');
      }
      return u;
    }
    if ($J.equals(this.unitStr, 'lp')) {
      return this.isHor ? UnitValue.LPX : UnitValue.LPY;
    }
    if ($J.equals(this.unitStr, 'sp')) {
      return this.isHor ? UnitValue.SPX : UnitValue.SPY;
    }
    if (this.lookup(0, null, null) !== Math.fround(UnitConverter.UNABLE)) {
      return UnitValue.LOOKUP;
    }
    let pIx = this.unitStr.indexOf(String.fromCharCode(46 /* '.' */));
    if (pIx !== -1) {
      this.linkId = this.unitStr.substring(0, pIx);
      let e = this.unitStr.substring((pIx + 1) | 0);
      if ($J.equals(e, 'x')) {
        return UnitValue.LINK_X;
      }
      if ($J.equals(e, 'y')) {
        return UnitValue.LINK_Y;
      }
      if ($J.equals(e, 'w') || $J.equals(e, 'width')) {
        return UnitValue.LINK_W;
      }
      if ($J.equals(e, 'h') || $J.equals(e, 'height')) {
        return UnitValue.LINK_H;
      }
      if ($J.equals(e, 'x2')) {
        return UnitValue.LINK_X2;
      }
      if ($J.equals(e, 'y2')) {
        return UnitValue.LINK_Y2;
      }
      if ($J.equals(e, 'xpos')) {
        return UnitValue.LINK_XPOS;
      }
      if ($J.equals(e, 'ypos')) {
        return UnitValue.LINK_YPOS;
      }
    }
    throw new IllegalArgumentException('Unknown keyword: ' + this.unitStr);
  }
  isAbsolute(): boolean {
    switch (this.unit) {
      case UnitValue.PIXEL:
      case UnitValue.LPX:
      case UnitValue.LPY:
      case UnitValue.MM:
      case UnitValue.CM:
      case UnitValue.INCH:
      case UnitValue.PT:
        return true;
      case UnitValue.SPX:
      case UnitValue.SPY:
      case UnitValue.PERCENT:
      case UnitValue.ALIGN:
      case UnitValue.MIN_SIZE:
      case UnitValue.PREF_SIZE:
      case UnitValue.MAX_SIZE:
      case UnitValue.BUTTON:
      case UnitValue.LINK_X:
      case UnitValue.LINK_Y:
      case UnitValue.LINK_W:
      case UnitValue.LINK_H:
      case UnitValue.LINK_X2:
      case UnitValue.LINK_Y2:
      case UnitValue.LINK_XPOS:
      case UnitValue.LINK_YPOS:
      case UnitValue.LOOKUP:
      case UnitValue.LABEL_ALIGN:
        return false;
      case UnitValue.IDENTITY:
    }
    throw new IllegalArgumentException('Unknown/illegal unit: ' + this.unit + ', unitStr: ' + this.unitStr);
  }
  isAbsoluteDeep(): boolean {
    if (this.subUnits != null) {
      for (let subUnit of this.subUnits) {
        if (subUnit.isAbsoluteDeep()) {
          return true;
        }
      }
    }
    return this.isAbsolute();
  }
  isLinked(): boolean {
    return this.linkId != null;
  }
  isLinkedDeep(): boolean {
    if (this.subUnits != null) {
      for (let subUnit of this.subUnits) {
        if (subUnit.isLinkedDeep()) {
          return true;
        }
      }
    }
    return this.isLinked();
  }
  getLinkTargetId(): string {
    return this.linkId;
  }
  getSubUnitValue(i: number): UnitValue {
    return this.subUnits[i];
  }
  getSubUnitCount(): number {
    return this.subUnits != null ? this.subUnits.length : 0;
  }
  getSubUnits(): UnitValue[] {
    return this.subUnits != null ? this.subUnits.slice() : null;
  }
  getUnit(): number {
    return this.unit;
  }
  getUnitString(): string {
    return this.unitStr;
  }
  getOperation(): number {
    return this.oper;
  }
  getValue(): number {
    return this.value_;
  }
  isHorizontal(): boolean {
    return this.isHor;
  }
  toString(): string {
    return $J.getClass(this).getName() + '. Value=' + $J.fstr(this.value_) + ', unit=' + this.unit + ', unitString: ' + this.unitStr + ', oper=' + this.oper + ', isHor: ' + this.isHor;
  }
  /**
   * Returns the creation string for this object. Note that {@link LayoutUtil#setDesignTime(ContainerWrapper, boolean)} must be
   * set to <code>true</code> for the creation strings to be stored.
   * @return The constraint string or <code>null</code> if none is registered.
   */
  getConstraintString(): string {
    return LayoutUtil.getCCString(this);
  }
  hashCode(): number {
    return (($J.d2i((Math.fround(this.value_ * 12345))) + (this.oper >>> 5) + this.unit) | 0) >>> 17;
  }
  /**
   * Adds a global unit converter that can convert from some <code>unit</code> to pixels.
   * <p>
   * This converter will be asked before the platform converter so the values for it (e.g. "related" and "unrelated")
   * can be overridden. It is however not possible to override the built in ones (e.g. "mm", "pixel" or "lp").
   * @param conv The converter. Not <code>null</code>.
   */
  static addGlobalUnitConverter(conv: UnitConverter): void {
    if (conv == null) {
      throw new NullPointerException();
    }
    UnitValue.CONVERTERS.add(conv);
  }
  /**
   * Removed the converter.
   * @param unit The converter.
   * @return If there was a converter found and thus removed.
   */
  static removeGlobalUnitConverter(unit: UnitConverter): boolean {
    return UnitValue.CONVERTERS.remove(unit);
  }
  /**
   * Returns the global converters currently registered. The platform converter will not be in this list.
   * @return The converters. Never <code>null</code>.
   */
  static getGlobalUnitConverters(): UnitConverter[] {
    return $J.toArrayInto(UnitValue.CONVERTERS.toArray(), $J.newArray(UnitValue.CONVERTERS.size(), null));
  }
  /**
   * Returns the current default unit. The default unit is the unit used if no unit is set. E.g. "width 10".
   * @return The current default unit.
   * @see #PIXEL
   * @see #LPX
   * @deprecated Use {@link PlatformDefaults#getDefaultHorizontalUnit()} and {@link PlatformDefaults#getDefaultVerticalUnit()} instead.
   */
  static getDefaultUnit(): number {
    return PlatformDefaults.getDefaultHorizontalUnit();
  }
  /**
   * Sets the default unit. The default unit is the unit used if no unit is set. E.g. "width 10".
   * @param unit The new default unit.
   * @see #PIXEL
   * @see #LPX
   * @deprecated Use {@link PlatformDefaults#setDefaultHorizontalUnit(int)} and {@link PlatformDefaults#setDefaultVerticalUnit(int)} instead.
   */
  static setDefaultUnit(unit: number): void {
    PlatformDefaults.setDefaultHorizontalUnit(unit);
    PlatformDefaults.setDefaultVerticalUnit(unit);
  }
  readResolve(): any {
    return LayoutUtil.getSerializedObject(this);
  }
  writeObject(out: ObjectOutputStream): void {
    if ($J.getClass(this) === $J.cls(UnitValue)) {
      LayoutUtil.writeAsXML(out, this);
    }
  }
  readObject(in$: ObjectInputStream): void {
    LayoutUtil.setSerializedObject(this, LayoutUtil.readAsXML(in$));
  }
  static $clinit() {
    UnitValue.UNIT_MAP = new HashMap(32);
    UnitValue.CONVERTERS = new ArrayList();
    UnitValue.UNIT_MAP.put('px', UnitValue.PIXEL);
    UnitValue.UNIT_MAP.put('lpx', UnitValue.LPX);
    UnitValue.UNIT_MAP.put('lpy', UnitValue.LPY);
    UnitValue.UNIT_MAP.put('%', UnitValue.PERCENT);
    UnitValue.UNIT_MAP.put('cm', UnitValue.CM);
    UnitValue.UNIT_MAP.put('in', UnitValue.INCH);
    UnitValue.UNIT_MAP.put('spx', UnitValue.SPX);
    UnitValue.UNIT_MAP.put('spy', UnitValue.SPY);
    UnitValue.UNIT_MAP.put('al', UnitValue.ALIGN);
    UnitValue.UNIT_MAP.put('mm', UnitValue.MM);
    UnitValue.UNIT_MAP.put('pt', UnitValue.PT);
    UnitValue.UNIT_MAP.put('min', UnitValue.MIN_SIZE);
    UnitValue.UNIT_MAP.put('minimum', UnitValue.MIN_SIZE);
    UnitValue.UNIT_MAP.put('p', UnitValue.PREF_SIZE);
    UnitValue.UNIT_MAP.put('pref', UnitValue.PREF_SIZE);
    UnitValue.UNIT_MAP.put('max', UnitValue.MAX_SIZE);
    UnitValue.UNIT_MAP.put('maximum', UnitValue.MAX_SIZE);
    UnitValue.UNIT_MAP.put('button', UnitValue.BUTTON);
    UnitValue.UNIT_MAP.put('label', UnitValue.LABEL_ALIGN);
    UnitValue.ZERO = new UnitValue()._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(0, null, UnitValue.PIXEL, true, UnitValue.STATIC, null, null, '0px');
    UnitValue.TOP = new UnitValue()._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(0, null, UnitValue.PERCENT, false, UnitValue.STATIC, null, null, 'top');
    UnitValue.LEADING = new UnitValue()._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(0, null, UnitValue.PERCENT, true, UnitValue.STATIC, null, null, 'leading');
    UnitValue.LEFT = new UnitValue()._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(0, null, UnitValue.PERCENT, true, UnitValue.STATIC, null, null, 'left');
    UnitValue.CENTER = new UnitValue()._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(50, null, UnitValue.PERCENT, true, UnitValue.STATIC, null, null, 'center');
    UnitValue.TRAILING = new UnitValue()._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(100, null, UnitValue.PERCENT, true, UnitValue.STATIC, null, null, 'trailing');
    UnitValue.RIGHT = new UnitValue()._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(100, null, UnitValue.PERCENT, true, UnitValue.STATIC, null, null, 'right');
    UnitValue.BOTTOM = new UnitValue()._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(100, null, UnitValue.PERCENT, false, UnitValue.STATIC, null, null, 'bottom');
    UnitValue.LABEL = new UnitValue()._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(0, null, UnitValue.LABEL_ALIGN, false, UnitValue.STATIC, null, null, 'label');
    UnitValue.INF = new UnitValue()._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(Math.fround(LayoutUtil.INF), null, UnitValue.PIXEL, true, UnitValue.STATIC, null, null, 'inf');
    UnitValue.BASELINE_IDENTITY = new UnitValue()._UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String(0, null, UnitValue.IDENTITY, false, UnitValue.STATIC, null, null, 'baseline');
    UnitValue.SCALE = [Math.fround(25.4), Math.fround(2.54), 1, 0, 72];
    if (LayoutUtil.HAS_BEANS) {
      LayoutUtil.setDelegate($J.cls(UnitValue), new (UnitValue$1())()._PersistenceDelegate());
    }
  }
}

let $UnitValue$1: any = null;
/** An anonymous class (UnitValue.java:653). */
function UnitValue$1(): any {
  return $UnitValue$1 ??= $J.local(class extends PersistenceDelegate {
    instantiate(oldInstance: any, out: Encoder): Expression {
      let uv = oldInstance;
      let cs = uv.getConstraintString();
      if (cs == null) {
        throw new IllegalStateException('Design time must be on to use XML persistence. See LayoutUtil.');
      }
      return new Expression()._Expression$Object$Object$String$ObjectArr(oldInstance, $J.cls(ConstraintParser), 'parseUnitValueOrAlign', [uv.getConstraintString(), (uv.isHorizontal() ? true : false), null]);
    }
  }, 'net.miginfocom.layout.UnitValue$1', []);
}

$J.define(UnitValue, 'net.miginfocom.layout.UnitValue', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'float,java.lang.String,int,boolean,int,net.miginfocom.layout.UnitValue,net.miginfocom.layout.UnitValue,java.lang.String': '_UnitValue$float$String$int$boolean$int$UnitValue$UnitValue$String', 'boolean,int,net.miginfocom.layout.UnitValue,net.miginfocom.layout.UnitValue,java.lang.String': '_UnitValue$boolean$int$UnitValue$UnitValue$String', 'float,java.lang.String,boolean,int,java.lang.String': '_UnitValue$float$String$boolean$int$String', 'float,int,java.lang.String': '_UnitValue$float$int$String', 'float': '_UnitValue$float' }, clinit: true, lazy: ['UNIT_MAP', 'CONVERTERS', 'ZERO', 'TOP', 'LEADING', 'LEFT', 'CENTER', 'TRAILING', 'RIGHT', 'BOTTOM', 'LABEL', 'INF', 'BASELINE_IDENTITY', 'SCALE'] });
$J.module(() => {
  Expression = $J.load('java.beans.Expression');
  PersistenceDelegate = $J.load('java.beans.PersistenceDelegate');
  ConstraintParser = $J.load('net.miginfocom.layout.ConstraintParser');
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
  LinkHandler = $J.load('net.miginfocom.layout.LinkHandler');
  PlatformDefaults = $J.load('net.miginfocom.layout.PlatformDefaults');
  UnitConverter = $J.load('net.miginfocom.layout.UnitConverter');
});
