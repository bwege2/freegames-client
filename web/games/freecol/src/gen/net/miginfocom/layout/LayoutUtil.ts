// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/LayoutUtil.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ByteArrayInputStream, ByteArrayOutputStream, EOFException, Exception, IdentityHashMap, IllegalStateException, Introspector, JObject, SecurityException, Thread, Throwable, TreeSet, WeakHashMap, XMLDecoder, XMLEncoder } from '../../../../jre/index.ts';

let Beans, BoundSize, PlatformDefaults, UnitValue;

/**
 * A utility class that has only static helper methods.
 */
export class LayoutUtil extends JObject {
  /**
   * A substitute value for a really large value. Integer.MAX_VALUE is not used since that means a lot of defensive code
   * for potential overflow must exist in many places. This value is large enough for being unreasonable yet it is hard to
   * overflow.
   */
  static readonly INF: number = 2097051;
  /**
   * Tag int for a value that in considered "not set". Used as "null" element in int arrays.
   */
  static readonly NOT_SET: number = -2147471302;
  static readonly MIN: number = 0;
  static readonly PREF: number = 1;
  static readonly MAX: number = 2;
  static readonly HORIZONTAL: number = 0;
  static readonly VERTICAL: number = 1;
  static CR_MAP: WeakHashMap<any, string> = null;
  static DT_MAP: WeakHashMap<any, boolean> = null;
  static eSz: number = 0;
  static globalDebugMillis: number = 0;
  static HAS_BEANS: boolean = false;
  static writeOutputStream: ByteArrayOutputStream = null;
  static readBuf: number[] = null;
  static SER_MAP: IdentityHashMap<any, any> = null;
  _LayoutUtil(): this {
    return this;
  }
  static hasBeans(): boolean {
    try {
      $J.cls(LayoutUtil).getClassLoader().loadClass('java.beans.Beans');
      return true;
    } catch ($e0) {
      {
        let e = $J.exc($e0);
        return false;
      }
    }
  }
  /**
   * Returns the current version of MiG Layout.
   * @return The current version of MiG Layout. E.g. "3.6.3" or "4.0"
   */
  static getVersion(): string {
    return '5.0';
  }
  /**
   * If global debug should be on or off. If &gt; 0 then debug is turned on for all MigLayout
   * instances.
   * @return The current debug milliseconds.
   * @see LC#setDebugMillis(int)
   */
  static getGlobalDebugMillis(): number {
    return LayoutUtil.globalDebugMillis;
  }
  /**
   * If global debug should be on or off. If &gt; 0 then debug is turned on for all MigLayout
   * instances.
   * <p>
   * Note! This is a passive value and will be read by panels when the needed, which is normally
   * when they repaint/layout.
   * @param millis The new debug milliseconds. 0 turns of global debug and leaves debug up to every
   * individual panel.
   * @see LC#setDebugMillis(int)
   */
  static setGlobalDebugMillis(millis: number): void {
    LayoutUtil.globalDebugMillis = millis;
  }
  /**
   * Sets if design time is turned on for a Container in {@link ContainerWrapper}.
   * @param cw The container to set design time for. <code>null</code> is legal and can be used as
   * a key to turn on/off design time "in general". Note though that design time "in general" is
   * always on as long as there is at least one ContainerWrapper with design time.
   * <p>
   * <strong>If this method has not ever been called it will default to what
   * <code>Beans.isDesignTime()</code> returns.</strong> This means that if you call
   * this method you indicate that you will take responsibility for the design time value.
   * @param b <code>true</code> means design time on.
   */
  static setDesignTime(cw: ContainerWrapper, b: boolean): void {
    if (LayoutUtil.DT_MAP == null) {
      LayoutUtil.DT_MAP = new WeakHashMap();
    }
    LayoutUtil.DT_MAP.put((cw != null ? cw.getComponent() : null), b);
  }
  /**
   * Returns if design time is turned on for a Container in {@link ContainerWrapper}.
   * @param cw The container to set design time for. <code>null</code> is legal will return <code>true</code>
   * if there is at least one <code>ContainerWrapper</code> (or <code>null</code>) that have design time
   * turned on.
   * @return If design time is set for <code>cw</code>.
   */
  static isDesignTime(cw: ContainerWrapper): boolean {
    if (LayoutUtil.DT_MAP == null) {
      return LayoutUtil.HAS_BEANS && Beans.isDesignTime();
    }
    if (cw == null && LayoutUtil.DT_MAP != null && !LayoutUtil.DT_MAP.isEmpty()) {
      return true;
    }
    if (cw != null && LayoutUtil.DT_MAP.containsKey(cw.getComponent()) === false) {
      cw = null;
    }
    let b = LayoutUtil.DT_MAP.get(cw != null ? cw.getComponent() : null);
    return b != null && b;
  }
  /**
   * The size of an empty row or columns in a grid during design time.
   * @return The number of pixels. Default is 15.
   */
  static getDesignTimeEmptySize(): number {
    return LayoutUtil.eSz;
  }
  /**
   * The size of an empty row or columns in a grid during design time.
   * @param pixels The number of pixels. Default is 0 (it was 15 prior to v3.7.2, but since that meant different behaviour
   * under design time by default it was changed to be 0, same as non-design time). IDE vendors can still set it to 15 to
   * get the old behaviour.
   */
  static setDesignTimeEmptySize(pixels: number): void {
    LayoutUtil.eSz = pixels;
  }
  /**
   * Associates <code>con</code> with the creation string <code>s</code>. The <code>con</code> object should
   * probably have an equals method that compares identities or <code>con</code> objects that .equals() will only
   * be able to have <b>one</b> creation string.
   * <p>
   * If {@link LayoutUtil#isDesignTime(ContainerWrapper)} returns <code>false</code> the method does nothing.
   * @param con The object. if <code>null</code> the method does nothing.
   * @param s The creation string. if <code>null</code> the method does nothing.
   */
  static putCCString(con: any, s: string): void {
    if (s != null && con != null && LayoutUtil.isDesignTime(null)) {
      if (LayoutUtil.CR_MAP == null) {
        LayoutUtil.CR_MAP = new WeakHashMap(64);
      }
      LayoutUtil.CR_MAP.put(con, s);
    }
  }
  /**
   * Sets/add the persistence delegates to be used for a class.
   * @param c The class to set the registered delegate for.
   * @param del The new delegate or <code>null</code> to erase to old one.
   */
  static setDelegate(c: JClass<any>, del: PersistenceDelegate): void {
    try {
      Introspector.getBeanInfo(c, 3).getBeanDescriptor().setValue('persistenceDelegate', del);
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let ignored = $J.exc($e1);
      } else {
        throw $e1;
      }
    }
  }
  /**
   * Returns strings set with {@link #putCCString(Object, String)} or <code>null</code> if nothing is associated or
   * {@link LayoutUtil#isDesignTime(ContainerWrapper)} returns <code>false</code>.
   * @param con The constrain object.
   * @return The creation string or <code>null</code> if nothing is registered with the <code>con</code> object.
   */
  static getCCString(con: any): string {
    return LayoutUtil.CR_MAP != null ? LayoutUtil.CR_MAP.get(con) : null;
  }
  static throwCC(): void {
    throw new IllegalStateException('setStoreConstraintData(true) must be set for strings to be saved.');
  }
  /**
   * Takes a number on min/preferred/max sizes and resize constraints and returns the calculated sizes which sum should add up to <code>bounds</code>. Whether the sum
   * will actually equal <code>bounds</code> is dependent on the pref/max sizes and resize constraints.
   * @param sizes [ix],[MIN][PREF][MAX]. Grid.CompWrap.NOT_SET will be treated as N/A or 0. A "[MIN][PREF][MAX]" array with null elements will be interpreted as very flexible (no bounds)
   * but if the array itself is null it will not get any size.
   * @param resConstr Elements can be <code>null</code> and the whole array can be <code>null</code>. <code>null</code> means that the size will not be flexible at all.
   * Can have length less than <code>sizes</code> in which case the last element should be used for the elements missing.
   * @param defPushWeights If there is no grow weight for a resConstr the corresponding value of this array is used.
   * These forced resConstr will be grown last though and only if needed to fill to the bounds.
   * @param startSizeType The initial size to use. E.g. {@link net.miginfocom.layout.LayoutUtil#MIN}.
   * @param bounds To use for relative sizes.
   * @return The sizes. Array length will match <code>sizes</code>.
   */
  static calculateSerial(sizes: number[][], resConstr: ResizeConstraint[], defPushWeights: number[], startSizeType: number, bounds: number): number[] {
    let lengths = $J.newArray(sizes.length, 0);
    let usedLength = 0;
    for (let i = 0; i < sizes.length; i++) {
      if (sizes[i] != null) {
        let len = Math.fround(sizes[i][startSizeType] !== LayoutUtil.NOT_SET ? sizes[i][startSizeType] : 0);
        let newSizeBounded = LayoutUtil.getBrokenBoundary(len, sizes[i][LayoutUtil.MIN], sizes[i][LayoutUtil.MAX]);
        if (newSizeBounded !== LayoutUtil.NOT_SET) {
          len = Math.fround(newSizeBounded);
        }
        usedLength = Math.fround(usedLength + len);
        lengths[i] = len;
      }
    }
    let useLengthI = $J.roundf(usedLength);
    if (useLengthI !== bounds && resConstr != null) {
      let isGrow = useLengthI < bounds;
      let prioList = new TreeSet();
      for (let i = 0; i < sizes.length; i++) {
        let resC = LayoutUtil.getIndexSafe(resConstr, i);
        if (resC != null) {
          prioList.add(isGrow ? resC.growPrio_ : resC.shrinkPrio_);
        }
      }
      let prioIntegers = $J.toArrayInto(prioList.toArray(), $J.newArray(prioList.size(), null));
      for (let force = 0; force <= ((isGrow && defPushWeights != null) ? 1 : 0); force++) {
        for (let pr = (prioIntegers.length - 1) | 0; pr >= 0; pr--) {
          let curPrio = prioIntegers[pr];
          let totWeight = 0;
          let resizeWeight = $J.newArray(sizes.length, null);
          for (let i = 0; i < sizes.length; i++) {
            if (sizes[i] == null) {
              continue;
            }
            let resC = LayoutUtil.getIndexSafe(resConstr, i);
            if (resC != null) {
              let prio = isGrow ? resC.growPrio_ : resC.shrinkPrio_;
              if (curPrio === prio) {
                if (isGrow) {
                  resizeWeight[i] = (force === 0 || resC.grow_ != null) ? resC.grow_ : (defPushWeights[i < defPushWeights.length ? i : (defPushWeights.length - 1) | 0]);
                } else {
                  resizeWeight[i] = resC.shrink_;
                }
                if (resizeWeight[i] != null) {
                  totWeight = Math.fround(totWeight + +resizeWeight[i]);
                }
              }
            }
          }
          if (totWeight > 0) {
            let hit: boolean;
            do {
              let toChange = Math.fround(bounds - usedLength);
              hit = false;
              let changedWeight = 0;
              for (let i = 0; i < sizes.length && totWeight > Math.fround(1E-4); i++) {
                let weight = resizeWeight[i];
                if (weight != null) {
                  let sizeDelta = Math.fround(Math.fround(toChange * +weight) / totWeight);
                  let newSize = Math.fround(lengths[i] + sizeDelta);
                  if (sizes[i] != null) {
                    let newSizeBounded = LayoutUtil.getBrokenBoundary(newSize, sizes[i][LayoutUtil.MIN], sizes[i][LayoutUtil.MAX]);
                    if (newSizeBounded !== LayoutUtil.NOT_SET) {
                      resizeWeight[i] = null;
                      hit = true;
                      changedWeight = Math.fround(changedWeight + +weight);
                      newSize = Math.fround(newSizeBounded);
                      sizeDelta = Math.fround(newSize - lengths[i]);
                    }
                  }
                  lengths[i] = newSize;
                  usedLength = Math.fround(usedLength + sizeDelta);
                }
              }
              totWeight = Math.fround(totWeight - changedWeight);
            } while (hit);
          }
        }
      }
    }
    return LayoutUtil.roundSizes(lengths);
  }
  static getIndexSafe(arr: any[], ix: number): any {
    return arr != null ? arr[ix < arr.length ? ix : (arr.length - 1) | 0] : null;
  }
  /**
   * Returns the broken boundary if <code>sz</code> is outside the boundaries <code>lower</code> or <code>upper</code>. If both boundaries
   * are broken, the lower one is returned. If <code>sz</code> is &lt; 0 then <code>new Float(0f)</code> is returned so that no sizes can be
   * negative.
   * @param sz The size to check
   * @param lower The lower boundary (or <code>null</code> for no boundary).
   * @param upper The upper boundary (or <code>null</code> for no boundary).
   * @return The broken boundary.
   */
  static getBrokenBoundary(sz: number, lower: number, upper: number): number {
    if (lower !== LayoutUtil.NOT_SET) {
      if (sz < Math.fround(lower)) {
        return lower;
      }
    } else if (sz < 0) {
      return 0;
    }
    if (upper !== LayoutUtil.NOT_SET && sz > Math.fround(upper)) {
      return upper;
    }
    return LayoutUtil.NOT_SET;
  }
  static sum$intArr$int$int(terms: number[], start: number, len: number): number {
    let s = 0;
    for (let i = start, iSz = (start + len) | 0; i < iSz; i++) {
      s = (s + terms[i]) | 0;
    }
    return s;
  }
  static sum$intArr(terms: number[]): number {
    return LayoutUtil.sum$intArr$int$int(terms, 0, terms.length);
  }
  /**
   * Keeps f within min and max. Min is of higher priority if min is larger than max.
   * @param f The value to clamp
   * @param min
   * @param max
   * @return The clamped value, between min and max.
   */
  static clamp$float$float$float(f: number, min: number, max: number): number {
    return Math.max(min, Math.min(f, max));
  }
  /**
   * Keeps i within min and max. Min is of higher priority if min is larger than max.
   * @param i The value to clamp
   * @param min
   * @param max
   * @return The clamped value, between min and max.
   */
  static clamp$int$int$int(i: number, min: number, max: number): number {
    return Math.max(min, Math.min(i, max));
  }
  static getSizeSafe(sizes: number[], sizeType: number): number {
    if (sizes == null || sizes[sizeType] === LayoutUtil.NOT_SET) {
      return sizeType === LayoutUtil.MAX ? LayoutUtil.INF : 0;
    }
    return sizes[sizeType];
  }
  static derive(bs: BoundSize, min: UnitValue, pref: UnitValue, max: UnitValue): BoundSize {
    if (bs == null || bs.isUnset()) {
      return new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$String(min, pref, max, null);
    }
    return new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$boolean$String(min != null ? min : bs.getMin(), pref != null ? pref : bs.getPreferred(), max != null ? max : bs.getMax(), bs.getGapPush(), null);
  }
  /**
   * Returns if left-to-right orientation is used. If not set explicitly in the layout constraints the Locale
   * of the <code>parent</code> is used.
   * @param lc The constraint if there is one. Can be <code>null</code>.
   * @param container The parent that may be used to get the left-to-right if lc does not specify this.
   * @return If left-to-right orientation is currently used.
   */
  static isLeftToRight(lc: LC, container: ContainerWrapper): boolean {
    if (lc != null && lc.getLeftToRight() != null) {
      return lc.getLeftToRight();
    }
    return container == null || container.isLeftToRight();
  }
  /**
   * Round a number of float sizes into int sizes so that the total length match up
   * @param sizes The sizes to round
   * @return An array of equal length as <code>sizes</code>.
   */
  static roundSizes(sizes: number[]): number[] {
    let retInts = $J.newArray(sizes.length, 0);
    let posD = 0;
    for (let i = 0; i < retInts.length; i++) {
      let posI = $J.d2i((Math.fround(posD + 0.5)));
      posD = Math.fround(posD + sizes[i]);
      retInts[i] = ($J.d2i((Math.fround(posD + 0.5))) - posI) | 0;
    }
    return retInts;
  }
  /**
   * Safe equals. null == null, but null never equals anything else.
   * @param o1 The first object. May be <code>null</code>.
   * @param o2 The second object. May be <code>null</code>.
   * @return Returns <code>true</code> if <code>o1</code> and <code>o2</code> are equal (using .equals()) or both are <code>null</code>.
   */
  static equals(o1: any, o2: any): boolean {
    return o1 === o2 || (o1 != null && o2 != null && $J.equals(o1, o2));
  }
  /**
   * Returns the insets for the side.
   * @param side top == 0, left == 1, bottom = 2, right = 3.
   * @param getDefault If <code>true</code> the default insets will get retrieved if <code>lc</code> has none set.
   * @return The insets for the side. Never <code>null</code>.
   */
  static getInsets(lc: LC, side: number, getDefault: boolean): UnitValue {
    let i = lc.getInsets();
    return (i != null && i[side] != null) ? i[side] : (getDefault ? PlatformDefaults.getPanelInsets(side) : UnitValue.ZERO);
  }
  /**
   * Writes the object and CLOSES the stream. Uses the persistence delegate registered in this class.
   * @param os The stream to write to. Will be closed.
   * @param o The object to be serialized.
   * @param listener The listener to receive the exceptions if there are any. If <code>null</code> not used.
   */
  static writeXMLObject(os: OutputStream, o: any, listener: ExceptionListener): void {
    let oldClassLoader = Thread.currentThread().getContextClassLoader();
    Thread.currentThread().setContextClassLoader($J.cls(LayoutUtil).getClassLoader());
    let encoder = new XMLEncoder(os);
    if (listener != null) {
      encoder.setExceptionListener(listener);
    }
    encoder.writeObject(o);
    encoder.close();
    Thread.currentThread().setContextClassLoader(oldClassLoader);
  }
  /**
   * Writes an object to XML.
   * @param out The object out to write to. Will not be closed.
   * @param o The object to write.
   */
  static writeAsXML(out: ObjectOutput, o: any): void {
    if (LayoutUtil.writeOutputStream == null) {
      LayoutUtil.writeOutputStream = new ByteArrayOutputStream(16384);
    }
    LayoutUtil.writeOutputStream.reset();
    LayoutUtil.writeXMLObject(LayoutUtil.writeOutputStream, o, new (LayoutUtil$1())());
    let buf = LayoutUtil.writeOutputStream.toByteArray();
    out.writeInt(buf.length);
    out.write(buf);
  }
  /**
   * Reads an object from <code>in</code> using the
   * @param in The object input to read from.
   * @return The object. Never <code>null</code>.
   * @throws IOException If there was a problem saving as XML
   */
  static readAsXML(in$: ObjectInput): any {
    if (LayoutUtil.readBuf == null) {
      LayoutUtil.readBuf = $J.newArray(16384, 0);
    }
    let cThread = Thread.currentThread();
    let oldCL = null;
    try {
      oldCL = cThread.getContextClassLoader();
      cThread.setContextClassLoader($J.cls(LayoutUtil).getClassLoader());
    } catch ($e2) {
      if ($J.isa($e2, SecurityException)) {
        let ignored = $J.exc($e2);
      } else {
        throw $e2;
      }
    }
    let o = null;
    try {
      let length = in$.readInt();
      if (length > LayoutUtil.readBuf.length) {
        LayoutUtil.readBuf = $J.newArray(length, 0);
      }
      in$.readFully(LayoutUtil.readBuf, 0, length);
      o = new XMLDecoder(new ByteArrayInputStream(LayoutUtil.readBuf, 0, length)).readObject();
    } catch ($e3) {
      if ($J.isa($e3, EOFException)) {
        let ignored = $J.exc($e3);
      } else {
        throw $e3;
      }
    }
    if (oldCL != null) {
      cThread.setContextClassLoader(oldCL);
    }
    return o;
  }
  /**
   * Sets the serialized object and associates it with <code>caller</code>.
   * @param caller The object created <code>o</code>
   * @param o The just serialized object.
   */
  static setSerializedObject(caller: any, o: any): void {
    {
      LayoutUtil.SER_MAP.put(caller, o);
    }
  }
  /**
   * Returns the serialized object that are associated with <code>caller</code>. It also removes it from the list.
   * @param caller The original creator of the object.
   * @return The object.
   */
  static getSerializedObject(caller: any): any {
    {
      return LayoutUtil.SER_MAP.remove(caller);
    }
  }
  static $clinit() {
    LayoutUtil.CR_MAP = null;
    LayoutUtil.DT_MAP = null;
    LayoutUtil.eSz = 0;
    LayoutUtil.globalDebugMillis = 0;
    LayoutUtil.HAS_BEANS = LayoutUtil.hasBeans();
    LayoutUtil.writeOutputStream = null;
    LayoutUtil.readBuf = null;
    LayoutUtil.SER_MAP = new IdentityHashMap(2);
  }
}

let $LayoutUtil$1: any = null;
/** An anonymous class (LayoutUtil.java:523). */
function LayoutUtil$1(): any {
  return $LayoutUtil$1 ??= $J.local(class extends JObject {
    exceptionThrown(e: Exception): void {
      e.printStackTrace();
    }
  }, 'net.miginfocom.layout.LayoutUtil$1', ['java.beans.ExceptionListener']);
}

$J.define(LayoutUtil, 'net.miginfocom.layout.LayoutUtil', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_LayoutUtil' }, meths: { 'clamp(int,int,int)': 'clamp$int$int$int', 'clamp(float,float,float)': 'clamp$float$float$float', 'sum(int[])': 'sum$intArr', 'sum(int[],int,int)': 'sum$intArr$int$int' }, clinit: true, lazy: ['CR_MAP', 'DT_MAP', 'eSz', 'globalDebugMillis', 'HAS_BEANS', 'writeOutputStream', 'readBuf', 'SER_MAP'] });
$J.module(() => {
  Beans = $J.load('java.beans.Beans');
  BoundSize = $J.load('net.miginfocom.layout.BoundSize');
  PlatformDefaults = $J.load('net.miginfocom.layout.PlatformDefaults');
  UnitValue = $J.load('net.miginfocom.layout.UnitValue');
});
