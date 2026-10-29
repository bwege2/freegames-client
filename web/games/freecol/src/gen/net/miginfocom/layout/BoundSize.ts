// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/BoundSize.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject, StringBuilder } from '../../../../jre/index.ts';

let Expression, PersistenceDelegate, Grid, LayoutUtil, UnitValue;

/**
 * A size that contains minimum, preferred and maximum size of type {@link UnitValue}.
 * <p>
 * This class is a simple value container and it is immutable.
 * <p>
 * If a size is missing (i.e., <code>null</code>) that boundary should be considered "not in use".
 * <p>
 * You can create a BoundSize from a String with the use of {@link ConstraintParser#parseBoundSize(String, boolean, boolean)}
 */
export class BoundSize extends JObject {
  static NULL_SIZE: BoundSize = null;
  static ZERO_PIXEL: BoundSize = null;
  min: UnitValue = null;
  pref: UnitValue = null;
  max_: UnitValue = null;
  gapPush: boolean = false;
  /**
   * Constructor that use the same value for min/preferred/max size.
   * @param minMaxPref The value to use for min/preferred/max size.
   * @param createString The string used to create the BoundsSize.
   */
  _BoundSize$UnitValue$String(minMaxPref: UnitValue, createString: string): this {
    this._BoundSize$UnitValue$UnitValue$UnitValue$String(minMaxPref, minMaxPref, minMaxPref, createString);
    return this;
  }
  /**
   * Constructor. <b>This method is here for serialization only and should normally not be used.</b> Use
   * {@link ConstraintParser#parseBoundSize(String, boolean, boolean)} instead.
   * @param min The minimum size. May be <code>null</code>.
   * @param preferred  The preferred size. May be <code>null</code>.
   * @param max  The maximum size. May be <code>null</code>.
   * @param createString The string used to create the BoundsSize.
   */
  _BoundSize$UnitValue$UnitValue$UnitValue$String(min: UnitValue, preferred: UnitValue, max: UnitValue, createString: string): this {
    this._BoundSize$UnitValue$UnitValue$UnitValue$boolean$String(min, preferred, max, false, createString);
    return this;
  }
  /**
   * Constructor. <b>This method is here for serialization only and should normally not be used.</b> Use
   * {@link ConstraintParser#parseBoundSize(String, boolean, boolean)} instead.
   * @param min The minimum size. May be <code>null</code>.
   * @param preferred  The preferred size. May be <code>null</code>.
   * @param max  The maximum size. May be <code>null</code>.
   * @param gapPush If the size should be hinted as "pushing" and thus want to occupy free space if no one else is claiming it.
   * @param createString The string used to create the BoundsSize.
   */
  _BoundSize$UnitValue$UnitValue$UnitValue$boolean$String(min: UnitValue, preferred: UnitValue, max: UnitValue, gapPush: boolean, createString: string): this {
    this.min = min;
    this.pref = preferred;
    this.max_ = max;
    this.gapPush = gapPush;
    LayoutUtil.putCCString(this, createString);
    return this;
  }
  /**
   * Returns the minimum size as sent into the constructor.
   * @return The minimum size as sent into the constructor. May be <code>null</code>.
   */
  getMin(): UnitValue {
    return this.min;
  }
  /**
   * Returns the preferred size as sent into the constructor.
   * @return The preferred size as sent into the constructor. May be <code>null</code>.
   */
  getPreferred(): UnitValue {
    return this.pref;
  }
  /**
   * Returns the maximum size as sent into the constructor.
   * @return The maximum size as sent into the constructor. May be <code>null</code>.
   */
  getMax(): UnitValue {
    return this.max_;
  }
  /**
   * If the size should be hinted as "pushing" and thus want to occupy free space if no one else is claiming it.
   * @return The value.
   */
  getGapPush(): boolean {
    return this.gapPush;
  }
  /**
   * Returns if this bound size has no min, preferred and maximum size set (they are all <code>null</code>)
   * @return If unset.
   */
  isUnset(): boolean {
    return this === BoundSize.ZERO_PIXEL || (this.pref == null && this.min == null && this.max_ == null && this.gapPush === false);
  }
  /**
   * Makes sure that <code>size</code> is within min and max of this size.
   * @param size The size to constrain.
   * @param refValue The reference to use for relative sizes.
   * @param parent The parent container.
   * @return The size, constrained within min and max.
   */
  constrain(size: number, refValue: number, parent: ContainerWrapper): number {
    if (this.max_ != null) {
      size = Math.min(size, this.max_.getPixels(refValue, parent, parent));
    }
    if (this.min != null) {
      size = Math.max(size, this.min.getPixels(refValue, parent, parent));
    }
    return size;
  }
  /**
   * Returns the minimum, preferred or maximum size for this bounded size.
   * @param sizeType The type. <code>LayoutUtil.MIN</code>, <code>LayoutUtil.PREF</code> or <code>LayoutUtil.MAX</code>.
   * @return
   */
  getSize(sizeType: number): UnitValue {
    switch (sizeType) {
      case LayoutUtil.MIN:
        return this.min;
      case LayoutUtil.PREF:
        return this.pref;
      case LayoutUtil.MAX:
        return this.max_;
      default:
        throw new IllegalArgumentException('Unknown size: ' + sizeType);
    }
  }
  /**
   * Convert the bound sizes to pixels.
   * <p>
   * <code>null</code> bound sizes will be 0 for min and preferred and {@link net.miginfocom.layout.LayoutUtil#INF} for max.
   * @param refSize The reference size.
   * @param parent The parent. Not <code>null</code>.
   * @param comp The component, if applicable, can be <code>null</code>.
   * @return An array of length three (min,pref,max).
   */
  getPixelSizes(refSize: number, parent: ContainerWrapper, comp: ComponentWrapper): number[] {
    return [this.min != null ? this.min.getPixels(refSize, parent, comp) : 0, this.pref != null ? this.pref.getPixels(refSize, parent, comp) : 0, this.max_ != null ? this.max_.getPixels(refSize, parent, comp) : LayoutUtil.INF];
  }
  /**
   * Returns the a constraint string that can be re-parsed to be the exact same UnitValue.
   * @return A String. Never <code>null</code>.
   */
  getConstraintString(): string {
    let cs = LayoutUtil.getCCString(this);
    if (cs != null) {
      return cs;
    }
    if (this.min === this.pref && this.pref === this.max_) {
      return this.min != null ? (this.min.getConstraintString() + '!') : 'null';
    }
    let sb = new StringBuilder(16);
    if (this.min != null) {
      sb.append(this.min.getConstraintString()).append(String.fromCharCode(58 /* ':' */));
    }
    if (this.pref != null) {
      if (this.min == null && this.max_ != null) {
        sb.append(':');
      }
      sb.append(this.pref.getConstraintString());
    } else if (this.min != null) {
      sb.append(String.fromCharCode(110 /* 'n' */));
    }
    if (this.max_ != null) {
      sb.append(sb.length() === 0 ? '::' : ':').append(this.max_.getConstraintString());
    }
    if (this.gapPush) {
      if (sb.length() > 0) {
        sb.append(String.fromCharCode(58 /* ':' */));
      }
      sb.append('push');
    }
    return sb.toString();
  }
  checkNotLinked(): void {
    if (this.isLinked()) {
      throw new IllegalArgumentException('Size may not contain links');
    }
  }
  isLinked(): boolean {
    return this.min != null && this.min.isLinkedDeep() || this.pref != null && this.pref.isLinkedDeep() || this.max_ != null && this.max_.isLinkedDeep();
  }
  isAbsolute(): boolean {
    return (this.min == null || this.min.isAbsoluteDeep()) && (this.pref == null || this.pref.isAbsoluteDeep()) && (this.max_ == null || this.max_.isAbsoluteDeep());
  }
  toString(): string {
    return 'BoundSize{min=' + $J.str(this.min) + ', pref=' + $J.str(this.pref) + ', max=' + $J.str(this.max_) + ', gapPush=' + this.gapPush + String.fromCharCode(125 /* '}' */);
  }
  readResolve(): any {
    return LayoutUtil.getSerializedObject(this);
  }
  writeObject(out: ObjectOutputStream): void {
    if ($J.getClass(this) === $J.cls(BoundSize)) {
      LayoutUtil.writeAsXML(out, this);
    }
  }
  readObject(in$: ObjectInputStream): void {
    LayoutUtil.setSerializedObject(this, LayoutUtil.readAsXML(in$));
  }
  static $clinit() {
    BoundSize.NULL_SIZE = new BoundSize()._BoundSize$UnitValue$String(null, null);
    BoundSize.ZERO_PIXEL = new BoundSize()._BoundSize$UnitValue$String(UnitValue.ZERO, '0px');
    if (LayoutUtil.HAS_BEANS) {
      LayoutUtil.setDelegate($J.cls(BoundSize), new (BoundSize$1())()._PersistenceDelegate());
    }
  }
}

let $BoundSize$1: any = null;
/** An anonymous class (BoundSize.java:249). */
function BoundSize$1(): any {
  return $BoundSize$1 ??= $J.local(class extends PersistenceDelegate {
    instantiate(oldInstance: any, out: Encoder): Expression {
      let bs = oldInstance;
      if (Grid.TEST_GAPS) {
        return new Expression()._Expression$Object$Object$String$ObjectArr(oldInstance, $J.cls(BoundSize), 'new', [bs.getMin(), bs.getPreferred(), bs.getMax(), bs.getGapPush(), bs.getConstraintString()]);
      } else {
        return new Expression()._Expression$Object$Object$String$ObjectArr(oldInstance, $J.cls(BoundSize), 'new', [bs.getMin(), bs.getPreferred(), bs.getMax(), bs.getConstraintString()]);
      }
    }
  }, 'net.miginfocom.layout.BoundSize$1', []);
}

$J.define(BoundSize, 'net.miginfocom.layout.BoundSize', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'net.miginfocom.layout.UnitValue,net.miginfocom.layout.UnitValue,net.miginfocom.layout.UnitValue,boolean,java.lang.String': '_BoundSize$UnitValue$UnitValue$UnitValue$boolean$String', 'net.miginfocom.layout.UnitValue,net.miginfocom.layout.UnitValue,net.miginfocom.layout.UnitValue,java.lang.String': '_BoundSize$UnitValue$UnitValue$UnitValue$String', 'net.miginfocom.layout.UnitValue,java.lang.String': '_BoundSize$UnitValue$String' }, clinit: true, lazy: ['NULL_SIZE', 'ZERO_PIXEL'] });
$J.module(() => {
  Expression = $J.load('java.beans.Expression');
  PersistenceDelegate = $J.load('java.beans.PersistenceDelegate');
  Grid = $J.load('net.miginfocom.layout.Grid');
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
  UnitValue = $J.load('net.miginfocom.layout.UnitValue');
});
