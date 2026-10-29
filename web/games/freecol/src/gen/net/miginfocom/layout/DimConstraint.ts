// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/DimConstraint.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../jre/index.ts';

let BoundSize, LayoutUtil, PlatformDefaults, ResizeConstraint, UnitValue;

/**
 * A simple value holder for a constraint for one dimension.
 */
export class DimConstraint extends JObject {
  /**
   * How this entity can be resized in the dimension that this constraint represents.
   */
  resize_: ResizeConstraint = null;
  sizeGroup_: string = null;
  size_: BoundSize = null;
  gapBefore_: BoundSize = null;
  gapAfter_: BoundSize = null;
  align_: UnitValue = null;
  endGroup_: string = null;
  fill_: boolean = false;
  noGrid_: boolean = false;
  /**
   * Empty constructor.
   */
  _DimConstraint(): this {
    this.resize_ = new ResizeConstraint()._ResizeConstraint$();
    this.sizeGroup_ = null;
    this.size_ = BoundSize.NULL_SIZE;
    this.gapBefore_ = null;
    this.gapAfter_ = null;
    this.align_ = null;
    this.endGroup_ = null;
    this.fill_ = false;
    this.noGrid_ = false;
    return this;
  }
  /**
   * Returns the grow priority. Relative priority is used for determining which entities gets the extra space first.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The grow priority.
   */
  getGrowPriority(): number {
    return this.resize_.growPrio_;
  }
  /**
   * Sets the grow priority. Relative priority is used for determining which entities gets the extra space first.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param p The new grow priority.
   */
  setGrowPriority(p: number): void {
    this.resize_.growPrio_ = p;
  }
  /**
   * Returns the grow weight.<p>
   * Grow weight is how flexible the entity should be, relative to other entities, when it comes to growing. <code>null</code> or
   * zero mean it will never grow. An entity that has twice the grow weight compared to another entity will get twice
   * as much of available space.
   * <p>
   * GrowWeight are only compared within the same GrowPrio.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current grow weight.
   */
  getGrow(): number {
    return this.resize_.grow_;
  }
  /**
   * Sets the grow weight.<p>
   * Grow weight is how flexible the entity should be, relative to other entities, when it comes to growing. <code>null</code> or
   * zero mean it will never grow. An entity that has twice the grow weight compared to another entity will get twice
   * as much of available space.
   * <p>
   * GrowWeight are only compared within the same GrowPrio.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param weight The new grow weight.
   */
  setGrow(weight: number): void {
    this.resize_.grow_ = weight;
  }
  /**
   * Returns the shrink priority. Relative priority is used for determining which entities gets smaller first when space is scarce.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The shrink priority.
   */
  getShrinkPriority(): number {
    return this.resize_.shrinkPrio_;
  }
  /**
   * Sets the shrink priority. Relative priority is used for determining which entities gets smaller first when space is scarce.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param p The new shrink priority.
   */
  setShrinkPriority(p: number): void {
    this.resize_.shrinkPrio_ = p;
  }
  /**
   * Returns the shrink priority. Relative priority is used for determining which entities gets smaller first when space is scarce.
   * Shrink weight is how flexible the entity should be, relative to other entities, when it comes to shrinking. <code>null</code> or
   * zero mean it will never shrink (default). An entity that has twice the shrink weight compared to another entity will get twice
   * as much of available space.
   * <p>
   * Shrink(Weight) are only compared within the same ShrinkPrio.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current shrink weight.
   */
  getShrink(): number {
    return this.resize_.shrink_;
  }
  /**
   * Sets the shrink priority. Relative priority is used for determining which entities gets smaller first when space is scarce.
   * Shrink weight is how flexible the entity should be, relative to other entities, when it comes to shrinking. <code>null</code> or
   * zero mean it will never shrink (default). An entity that has twice the shrink weight compared to another entity will get twice
   * as much of available space.
   * <p>
   * Shrink(Weight) are only compared within the same ShrinkPrio.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param weight The new shrink weight.
   */
  setShrink(weight: number): void {
    this.resize_.shrink_ = weight;
  }
  getAlignOrDefault(isCols: boolean): UnitValue {
    if (this.align_ != null) {
      return this.align_;
    }
    if (isCols) {
      return UnitValue.LEADING;
    }
    return this.fill_ || PlatformDefaults.getDefaultRowAlignmentBaseline() === false ? UnitValue.CENTER : UnitValue.BASELINE_IDENTITY;
  }
  /**
   * Returns the alignment used either as a default value for sub-entities or for this entity.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The alignment.
   */
  getAlign(): UnitValue {
    return this.align_;
  }
  /**
   * Sets the alignment used wither as a default value for sub-entities or for this entity.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param uv The new shrink priority. E.g. {@link UnitValue#CENTER} or {@link net.miginfocom.layout.UnitValue#LEADING}.
   */
  setAlign(uv: UnitValue): void {
    this.align_ = uv;
  }
  /**
   * Returns the gap after this entity. The gap is an empty space and can have a min/preferred/maximum size so that it can shrink and
   * grow depending on available space. Gaps are against other entities' edges and not against other entities' gaps.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The gap after this entity
   */
  getGapAfter(): BoundSize {
    return this.gapAfter_;
  }
  /**
   * Sets the gap after this entity. The gap is an empty space and can have a min/preferred/maximum size so that it can shrink and
   * grow depending on available space. Gaps are against other entities' edges and not against other entities' gaps.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param size The new gap.
   * @see net.miginfocom.layout.ConstraintParser#parseBoundSize(String, boolean, boolean)
   */
  setGapAfter(size: BoundSize): void {
    this.gapAfter_ = size;
  }
  hasGapAfter(): boolean {
    return this.gapAfter_ != null && this.gapAfter_.isUnset() === false;
  }
  isGapAfterPush(): boolean {
    return this.gapAfter_ != null && this.gapAfter_.getGapPush();
  }
  /**
   * Returns the gap before this entity. The gap is an empty space and can have a min/preferred/maximum size so that it can shrink and
   * grow depending on available space. Gaps are against other entities' edges and not against other entities' gaps.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The gap before this entity
   */
  getGapBefore(): BoundSize {
    return this.gapBefore_;
  }
  /**
   * Sets the gap before this entity. The gap is an empty space and can have a min/preferred/maximum size so that it can shrink and
   * grow depending on available space. Gaps are against other entities' edges and not against other entities' gaps.
   * <p>
   * See also {@link net.miginfocom.layout.ConstraintParser#parseBoundSize(String, boolean, boolean)}.
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param size The new gap.
   */
  setGapBefore(size: BoundSize): void {
    this.gapBefore_ = size;
  }
  hasGapBefore(): boolean {
    return this.gapBefore_ != null && this.gapBefore_.isUnset() === false;
  }
  isGapBeforePush(): boolean {
    return this.gapBefore_ != null && this.gapBefore_.getGapPush();
  }
  /**
   * Returns the min/preferred/max size for the entity in the dimension that this object describes.
   * <p>
   * See also {@link net.miginfocom.layout.ConstraintParser#parseBoundSize(String, boolean, boolean)}.
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current size. Never <code>null</code> since v3.5.
   */
  getSize(): BoundSize {
    return this.size_;
  }
  /**
   * Sets the min/preferred/max size for the entity in the dimension that this object describes.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param size The new size. May be <code>null</code>.
   */
  setSize(size: BoundSize): void {
    if (size != null) {
      size.checkNotLinked();
    }
    this.size_ = size;
  }
  /**
   * Returns the size group that this entity should be in for the dimension that this object is describing.
   * If this constraint is in a size group that is specified here. <code>null</code> means no size group
   * and all other values are legal. Comparison with .equals(). Components/columns/rows in the same size group
   * will have the same min/preferred/max size; that of the largest in the group for the first two and the
   * smallest for max.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current size group. May be <code>null</code>.
   */
  getSizeGroup(): string {
    return this.sizeGroup_;
  }
  /**
   * Sets the size group that this entity should be in for the dimension that this object is describing.
   * If this constraint is in a size group that is specified here. <code>null</code> means no size group
   * and all other values are legal. Comparison with .equals(). Components/columns/rows in the same size group
   * will have the same min/preferred/max size; that of the largest in the group for the first two and the
   * smallest for max.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param s The new size group. <code>null</code> disables size grouping.
   */
  setSizeGroup(s: string): void {
    this.sizeGroup_ = s;
  }
  /**
   * Returns the end group that this entity should be in for the dimension that this object is describing.
   * If this constraint is in an end group that is specified here. <code>null</code> means no end group
   * and all other values are legal. Comparison with .equals(). Components in the same end group
   * will have the same end coordinate.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current end group. <code>null</code> may be returned.
   */
  getEndGroup(): string {
    return this.endGroup_;
  }
  /**
   * Sets the end group that this entity should be in for the dimension that this object is describing.
   * If this constraint is in an end group that is specified here. <code>null</code> means no end group
   * and all other values are legal. Comparison with .equals(). Components in the same end group
   * will have the same end coordinate.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param s The new end group. <code>null</code> disables end grouping.
   */
  setEndGroup(s: string): void {
    this.endGroup_ = s;
  }
  /**
   * Returns if the component in the row/column that this constraint should default be grown in the same dimension that
   * this constraint represents (width for column and height for a row).
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>true</code> means that components should grow.
   */
  isFill(): boolean {
    return this.fill_;
  }
  /**
   * Sets if the component in the row/column that this constraint should default be grown in the same dimension that
   * this constraint represents (width for column and height for a row).
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param b <code>true</code> means that components should grow.
   */
  setFill(b: boolean): void {
    this.fill_ = b;
  }
  /**
   * Returns if the row/column should default to flow and not to grid behaviour. This means that the whole row/column
   * will be one cell and all components will end up in that cell.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>true</code> means that the whole row/column should be one cell.
   */
  isNoGrid(): boolean {
    return this.noGrid_;
  }
  /**
   * Sets if the row/column should default to flow and not to grid behaviour. This means that the whole row/column
   * will be one cell and all components will end up in that cell.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param b <code>true</code> means that the whole row/column should be one cell.
   */
  setNoGrid(b: boolean): void {
    this.noGrid_ = b;
  }
  /**
   * Returns the gaps as pixel values.
   * @param parent The parent. Used to get the pixel values.
   * @param defGap The default gap to use if there is no gap set on this object (i.e. it is null).
   * @param refSize The reference size used to get the pixel sizes.
   * @param before IF it is the gap before rather than the gap after to return.
   * @return The [min,preferred,max] sizes for the specified gap. Uses {@link net.miginfocom.layout.LayoutUtil#NOT_SET}
   * for gap sizes that are <code>null</code>. Returns <code>null</code> if there was no gap specified. A new and free to use array.
   */
  getRowGaps(parent: ContainerWrapper, defGap: BoundSize, refSize: number, before: boolean): number[] {
    let gap = before ? this.gapBefore_ : this.gapAfter_;
    if (gap == null || gap.isUnset()) {
      gap = defGap;
    }
    if (gap == null || gap.isUnset()) {
      return null;
    }
    let ret = $J.newArray(3, 0);
    for (let i = LayoutUtil.MIN; i <= LayoutUtil.MAX; i++) {
      let uv = gap.getSize(i);
      ret[i] = uv != null ? uv.getPixels(Math.fround(refSize), parent, null) : LayoutUtil.NOT_SET;
    }
    return ret;
  }
  /**
   * Returns the gaps as pixel values.
   * @param parent The parent. Used to get the pixel values.
   * @param comp The component that the gap is for. If not for a component it is <code>null</code>.
   * @param adjGap The gap that the adjacent component, if any, has towards <code>comp</code>.
   * @param adjacentComp The adjacent component if any. May be <code>null</code>.
   * @param refSize The reference size used to get the pixel sizes.
   * @param adjacentSide What side the <code>adjacentComp</code> is on. 0 = top, 1 = left, 2 = bottom, 3 = right.
   * @param tag The tag string that the component might be tagged with in the component constraints. May be <code>null</code>.
   * @param isLTR If it is left-to-right.
   * @return The [min,preferred,max] sizes for the specified gap. Uses {@link net.miginfocom.layout.LayoutUtil#NOT_SET}
   * for gap sizes that are <code>null</code>. Returns <code>null</code> if there was no gap specified. A new and free to use array.
   */
  getComponentGaps(parent: ContainerWrapper, comp: ComponentWrapper, adjGap: BoundSize, adjacentComp: ComponentWrapper, tag: string, refSize: number, adjacentSide: number, isLTR: boolean): number[] {
    let gap = adjacentSide < 2 ? this.gapBefore_ : this.gapAfter_;
    let hasGap = gap != null && gap.getGapPush();
    if ((gap == null || gap.isUnset()) && (adjGap == null || adjGap.isUnset()) && comp != null) {
      gap = PlatformDefaults.getDefaultComponentGap(comp, adjacentComp, (adjacentSide + 1) | 0, tag, isLTR);
    }
    if (gap == null) {
      return hasGap ? [0, 0, LayoutUtil.NOT_SET] : null;
    }
    let ret = $J.newArray(3, 0);
    for (let i = LayoutUtil.MIN; i <= LayoutUtil.MAX; i++) {
      let uv = gap.getSize(i);
      ret[i] = uv != null ? uv.getPixels(Math.fround(refSize), parent, null) : LayoutUtil.NOT_SET;
    }
    return ret;
  }
  readResolve(): any {
    return LayoutUtil.getSerializedObject(this);
  }
  readExternal(in$: ObjectInput): void {
    LayoutUtil.setSerializedObject(this, LayoutUtil.readAsXML(in$));
  }
  writeExternal(out: ObjectOutput): void {
    if ($J.getClass(this) === $J.cls(DimConstraint)) {
      LayoutUtil.writeAsXML(out, this);
    }
  }
}

$J.define(DimConstraint, 'net.miginfocom.layout.DimConstraint', { kind: 'class', ifaces: ['java.io.Externalizable'], sup: 'java.lang.Object', ctors: { '': '_DimConstraint' } });
$J.module(() => {
  BoundSize = $J.load('net.miginfocom.layout.BoundSize');
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
  PlatformDefaults = $J.load('net.miginfocom.layout.PlatformDefaults');
  ResizeConstraint = $J.load('net.miginfocom.layout.ResizeConstraint');
  UnitValue = $J.load('net.miginfocom.layout.UnitValue');
});
