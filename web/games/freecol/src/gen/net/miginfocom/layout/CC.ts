// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/CC.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, IllegalArgumentException, JObject } from '../../../../jre/index.ts';

let AnimSpec, BoundSize, ConstraintParser, DimConstraint, LayoutUtil, ResizeConstraint, UnitValue;

/**
 * A simple value holder for one component's constraint.
 */
export class CC extends JObject {
  static DEF_GAP: BoundSize = null;
  static DOCK_SIDES: string[] = null;
  dock: number = 0;
  pos: UnitValue[] = null;
  padding: UnitValue[] = null;
  visualPadding: UnitValue[] = null;
  flowX_: boolean = null;
  skip_: number = 0;
  split_: number = 0;
  spanX: number = 0;
  spanY: number = 0;
  cellX: number = 0;
  cellY: number = 0;
  tag_: string = null;
  id_: string = null;
  hideMode_: number = 0;
  hor: DimConstraint = null;
  ver: DimConstraint = null;
  newline: BoundSize = null;
  wrap_: BoundSize = null;
  boundsInGrid: boolean = false;
  external_: boolean = false;
  pushX: number = null;
  pushY: number = null;
  animSpec: AnimSpec = null;
  static EMPTY_ARR: string[] = null;
  linkTargets: string[] = null;
  /**
   * Empty constructor.
   */
  _CC(): this {
    this.dock = -1;
    this.pos = null;
    this.padding = null;
    this.visualPadding = null;
    this.flowX_ = null;
    this.skip_ = 0;
    this.split_ = 1;
    this.spanX = 1;
    this.spanY = 1;
    this.cellX = -1;
    this.cellY = 0;
    this.tag_ = null;
    this.id_ = null;
    this.hideMode_ = -1;
    this.hor = new DimConstraint()._DimConstraint();
    this.ver = new DimConstraint()._DimConstraint();
    this.newline = null;
    this.wrap_ = null;
    this.boundsInGrid = true;
    this.external_ = false;
    this.pushX = null;
    this.pushY = null;
    this.animSpec = AnimSpec.DEF;
    this.linkTargets = null;
    return this;
  }
  getLinkTargets(): string[] {
    if (this.linkTargets == null) {
      let targets = new ArrayList(2);
      if (this.pos != null) {
        for (let i = 0; i < this.pos.length; i++) {
          this.addLinkTargetIDs(targets, this.pos[i]);
        }
      }
      this.linkTargets = targets.size() === 0 ? CC.EMPTY_ARR : $J.toArrayInto(targets.toArray(), $J.newArray(targets.size(), null));
    }
    return this.linkTargets;
  }
  addLinkTargetIDs(targets: ArrayList<string>, uv: UnitValue): void {
    if (uv != null) {
      let linkId = uv.getLinkTargetId();
      if (linkId != null) {
        targets.add(linkId);
      } else {
        for (let i = (uv.getSubUnitCount() - 1) | 0; i >= 0; i--) {
          let subUv = uv.getSubUnitValue(i);
          if (subUv.isLinkedDeep()) {
            this.addLinkTargetIDs(targets, subUv);
          }
        }
      }
    }
  }
  /**
   * Specifies that the component should be put in the end group <code>s</code> and will thus share the same ending
   * coordinate as them within the group.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param s A name to associate on the group that should be the same for other rows/columns in the same group.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  endGroupX(s: string): CC {
    this.hor.setEndGroup(s);
    return this;
  }
  /**
   * Specifies that the component should be put in the size group <code>s</code> and will thus share the same size
   * as them within the group.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param s A name to associate on the group that should be the same for other rows/columns in the same group.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  sizeGroupX(s: string): CC {
    this.hor.setSizeGroup(s);
    return this;
  }
  /**
   * The minimum size for the component. The value will override any value that is set on the component itself.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param size The size expressed as a <code>UnitValue</code>. E.g. "100px" or "200mm".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  minWidth(size: string): CC {
    this.hor.setSize(LayoutUtil.derive(this.hor.getSize(), ConstraintParser.parseUnitValue$String$boolean(size, true), null, null));
    return this;
  }
  /**
   * The size for the component as a min and/or preferred and/or maximum size. The value will override any value that is set on
   * the component itself.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param size The size expressed as a <code>BoundSize</code>. E.g. "50:100px:200mm" or "100px".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  width(size: string): CC {
    this.hor.setSize(ConstraintParser.parseBoundSize(size, false, true));
    return this;
  }
  /**
   * The maximum size for the component. The value will override any value that is set on the component itself.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param size The size expressed as a <code>UnitValue</code>. E.g. "100px" or "200mm".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  maxWidth(size: string): CC {
    this.hor.setSize(LayoutUtil.derive(this.hor.getSize(), null, null, ConstraintParser.parseUnitValue$String$boolean(size, true)));
    return this;
  }
  /**
   * The horizontal gap before and/or after the component. The gap is towards cell bounds and/or other component bounds.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param before The size of the gap expressed as a <code>BoundSize</code>. E.g. "50:100px:200mm" or "100px!".
   * @param after The size of the gap expressed as a <code>BoundSize</code>. E.g. "50:100px:200mm" or "100px!".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  gapX(before: string, after: string): CC {
    if (before != null) {
      this.hor.setGapBefore(ConstraintParser.parseBoundSize(before, true, true));
    }
    if (after != null) {
      this.hor.setGapAfter(ConstraintParser.parseBoundSize(after, true, true));
    }
    return this;
  }
  /**
   * Same functionality as <code>getHorizontal().setAlign(ConstraintParser.parseUnitValue(unitValue, true))</code> only this method
   * returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param align The align keyword or for instance "100px". E.g "left", "right", "leading" or "trailing".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  alignX(align: string): CC {
    this.hor.setAlign(ConstraintParser.parseUnitValueOrAlign(align, true, null));
    return this;
  }
  /**
   * The grow priority compared to other components in the same cell.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param p The grow priority.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  growPrioX(p: number): CC {
    this.hor.setGrowPriority(p);
    return this;
  }
  /**
   * Grow priority for the component horizontally and optionally vertically.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param widthHeight The new shrink weight and height. 1-2 arguments, never null.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  growPrio(widthHeight: number[]): CC {
    switch (widthHeight.length) {
      default:
        throw new IllegalArgumentException('Illegal argument count: ' + widthHeight.length);
      case 2:
        this.growPrioY(widthHeight[1]);
      case 1:
        this.growPrioX(widthHeight[0]);
    }
    return this;
  }
  /**
   * Grow weight for the component horizontally. It default to weight <code>100</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #growX(float)
   */
  growX$(): CC {
    this.hor.setGrow(ResizeConstraint.WEIGHT_100);
    return this;
  }
  /**
   * Grow weight for the component horizontally.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param w The new grow weight.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  growX$float(w: number): CC {
    this.hor.setGrow($J.boxF(w));
    return this;
  }
  /**
   * grow weight for the component horizontally and optionally vertically.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param widthHeight The new shrink weight and height. 1-2 arguments, never null.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  grow$floatArr(widthHeight: number[]): CC {
    switch (widthHeight.length) {
      default:
        throw new IllegalArgumentException('Illegal argument count: ' + widthHeight.length);
      case 2:
        this.growY$float(widthHeight[1]);
      case 1:
        this.growX$float(widthHeight[0]);
    }
    return this;
  }
  /**
   * The shrink priority compared to other components in the same cell.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param p The shrink priority.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  shrinkPrioX(p: number): CC {
    this.hor.setShrinkPriority(p);
    return this;
  }
  /**
   * Shrink priority for the component horizontally and optionally vertically.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param widthHeight The new shrink weight and height. 1-2 arguments, never null.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  shrinkPrio(widthHeight: number[]): CC {
    switch (widthHeight.length) {
      default:
        throw new IllegalArgumentException('Illegal argument count: ' + widthHeight.length);
      case 2:
        this.shrinkPrioY(widthHeight[1]);
      case 1:
        this.shrinkPrioX(widthHeight[0]);
    }
    return this;
  }
  /**
   * Shrink weight for the component horizontally.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param w The new shrink weight.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  shrinkX(w: number): CC {
    this.hor.setShrink($J.boxF(w));
    return this;
  }
  /**
   * Shrink weight for the component horizontally and optionally vertically.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param widthHeight The new shrink weight and height. 1-2 arguments, never null.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  shrink(widthHeight: number[]): CC {
    switch (widthHeight.length) {
      default:
        throw new IllegalArgumentException('Illegal argument count: ' + widthHeight.length);
      case 2:
        this.shrinkY(widthHeight[1]);
      case 1:
        this.shrinkX(widthHeight[0]);
    }
    return this;
  }
  /**
   * The end group that this component should be placed in.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param s The name of the group. If <code>null</code> that means no group (default)
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  endGroupY(s: string): CC {
    this.ver.setEndGroup(s);
    return this;
  }
  /**
   * The end group(s) that this component should be placed in.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param xy The end group for x and y respectively. 1-2 arguments, not null.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  endGroup(xy: string[]): CC {
    switch (xy.length) {
      default:
        throw new IllegalArgumentException('Illegal argument count: ' + xy.length);
      case 2:
        this.endGroupY(xy[1]);
      case 1:
        this.endGroupX(xy[0]);
    }
    return this;
  }
  /**
   * The size group that this component should be placed in.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param s The name of the group. If <code>null</code> that means no group (default)
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  sizeGroupY(s: string): CC {
    this.ver.setSizeGroup(s);
    return this;
  }
  /**
   * The size group(s) that this component should be placed in.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param xy The size group for x and y respectively. 1-2 arguments, not null.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  sizeGroup(xy: string[]): CC {
    switch (xy.length) {
      default:
        throw new IllegalArgumentException('Illegal argument count: ' + xy.length);
      case 2:
        this.sizeGroupY(xy[1]);
      case 1:
        this.sizeGroupX(xy[0]);
    }
    return this;
  }
  /**
   * The minimum size for the component. The value will override any value that is set on the component itself.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param size The size expressed as a <code>UnitValue</code>. E.g. "100px" or "200mm".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  minHeight(size: string): CC {
    this.ver.setSize(LayoutUtil.derive(this.ver.getSize(), ConstraintParser.parseUnitValue$String$boolean(size, false), null, null));
    return this;
  }
  /**
   * The size for the component as a min and/or preferred and/or maximum size. The value will override any value that is set on
   * the component itself.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param size The size expressed as a <code>BoundSize</code>. E.g. "50:100px:200mm" or "100px".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  height(size: string): CC {
    this.ver.setSize(ConstraintParser.parseBoundSize(size, false, false));
    return this;
  }
  /**
   * The maximum size for the component. The value will override any value that is set on the component itself.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param size The size expressed as a <code>UnitValue</code>. E.g. "100px" or "200mm".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  maxHeight(size: string): CC {
    this.ver.setSize(LayoutUtil.derive(this.ver.getSize(), null, null, ConstraintParser.parseUnitValue$String$boolean(size, false)));
    return this;
  }
  /**
   * The vertical gap before (normally above) and/or after (normally below) the component. The gap is towards cell bounds and/or other component bounds.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param before The size of the gap expressed as a <code>BoundSize</code>. E.g. "50:100px:200mm" or "100px!".
   * @param after The size of the gap expressed as a <code>BoundSize</code>. E.g. "50:100px:200mm" or "100px!".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  gapY(before: string, after: string): CC {
    if (before != null) {
      this.ver.setGapBefore(ConstraintParser.parseBoundSize(before, true, false));
    }
    if (after != null) {
      this.ver.setGapAfter(ConstraintParser.parseBoundSize(after, true, false));
    }
    return this;
  }
  /**
   * Same functionality as <code>getVertical().setAlign(ConstraintParser.parseUnitValue(unitValue, true))</code> only this method
   * returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param align The align keyword or for instance "100px". E.g "top" or "bottom".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  alignY(align: string): CC {
    this.ver.setAlign(ConstraintParser.parseUnitValueOrAlign(align, false, null));
    return this;
  }
  /**
   * The grow priority compared to other components in the same cell.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param p The grow priority.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  growPrioY(p: number): CC {
    this.ver.setGrowPriority(p);
    return this;
  }
  /**
   * Grow weight for the component vertically. Defaults to <code>100</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #growY(Float)
   */
  growY$(): CC {
    this.ver.setGrow(ResizeConstraint.WEIGHT_100);
    return this;
  }
  /**
   * Grow weight for the component vertically.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param w The new grow weight.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  growY$float(w: number): CC {
    this.ver.setGrow($J.boxF(w));
    return this;
  }
  /**
   * Grow weight for the component vertically.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param w The new grow weight.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  growY$Float(w: number): CC {
    this.ver.setGrow(w);
    return this;
  }
  /**
   * The shrink priority compared to other components in the same cell.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param p The shrink priority.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  shrinkPrioY(p: number): CC {
    this.ver.setShrinkPriority(p);
    return this;
  }
  /**
   * Shrink weight for the component horizontally.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param w The new shrink weight.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  shrinkY(w: number): CC {
    this.ver.setShrink($J.boxF(w));
    return this;
  }
  /**
   * How this component, if hidden (not visible), should be treated.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param mode The mode. Default to the mode in the {@link net.miginfocom.layout.LC}.
   * 0 == Normal. Bounds will be calculated as if the component was visible.<br>
   * 1 == If hidden the size will be 0, 0 but the gaps remain.<br>
   * 2 == If hidden the size will be 0, 0 and gaps set to zero.<br>
   * 3 == If hidden the component will be disregarded completely and not take up a cell in the grid..
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  hideMode(mode: number): CC {
    this.setHideMode(mode);
    return this;
  }
  /**
   * The id used to reference this component in some constraints.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param s The id or <code>null</code>. May consist of a groupID and an componentID which are separated by a dot: ".". E.g. "grp1.id1".
   * The dot should never be first or last if present.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   */
  id(s: string): CC {
    this.setId(s);
    return this;
  }
  /**
   * Same functionality as {@link #setTag(String tag)} only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param tag The new tag. May be <code>null</code>.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setTag(String)
   */
  tag(tag: string): CC {
    this.setTag(tag);
    return this;
  }
  /**
   * Set the cell(s) that the component should occupy in the grid. Same functionality as {@link #setCellX(int col)} and
   * {@link #setCellY(int row)} together with {@link #setSpanX(int width)} and {@link #setSpanY(int height)}. This method
   * returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param colRowWidthHeight cellX, cellY, spanX, spanY respectively. 1-4 arguments, not null.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setCellX(int)
   * @see #setCellY(int)
   * @see #setSpanX(int)
   * @see #setSpanY(int)
   * @since 3.7.2. Replacing cell(int, int) and cell(int, int, int, int)
   */
  cell(colRowWidthHeight: number[]): CC {
    switch (colRowWidthHeight.length) {
      default:
        throw new IllegalArgumentException('Illegal argument count: ' + colRowWidthHeight.length);
      case 4:
        this.setSpanY(colRowWidthHeight[3]);
      case 3:
        this.setSpanX(colRowWidthHeight[2]);
      case 2:
        this.setCellY(colRowWidthHeight[1]);
      case 1:
        this.setCellX(colRowWidthHeight[0]);
    }
    return this;
  }
  /**
   * Same functionality as <code>spanX(cellsX).spanY(cellsY)</code> which means this cell will span cells in both x and y.
   * This method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * Since 3.7.2 this takes an array/vararg whereas it previously only took two specific values, xSpan and ySpan.
   * @param cells spanX and spanY, when present, and in that order.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setSpanY(int)
   * @see #setSpanX(int)
   * @see #spanY()
   * @see #spanX()
   * @since 3.7.2 Replaces span(int, int).
   */
  span(cells: number[]): CC {
    if (cells == null || cells.length === 0) {
      this.setSpanX(LayoutUtil.INF);
      this.setSpanY(1);
    } else if (cells.length === 1) {
      this.setSpanX(cells[0]);
      this.setSpanY(1);
    } else {
      this.setSpanX(cells[0]);
      this.setSpanY(cells[1]);
    }
    return this;
  }
  /**
   * Corresponds exactly to the "gap left right top bottom" keyword.
   * @param args Same as for the "gap" keyword. Length 1-4, never null buf elements can be null.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  gap(args: string[]): CC {
    switch (args.length) {
      default:
        throw new IllegalArgumentException('Illegal argument count: ' + args.length);
      case 4:
        this.gapBottom(args[3]);
      case 3:
        this.gapTop(args[2]);
      case 2:
        this.gapRight(args[1]);
      case 1:
        this.gapLeft(args[0]);
    }
    return this;
  }
  /**
   * Sets the horizontal gap before the component.
   * <p>
   * Note! This is currently same as gapLeft(). This might change in 4.x.
   * @param boundsSize The size of the gap expressed as a <code>BoundSize</code>. E.g. "50:100px:200mm" or "100px!".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  gapBefore(boundsSize: string): CC {
    this.hor.setGapBefore(ConstraintParser.parseBoundSize(boundsSize, true, true));
    return this;
  }
  /**
   * Sets the horizontal gap after the component.
   * <p>
   * Note! This is currently same as gapRight(). This might change in 4.x.
   * @param boundsSize The size of the gap expressed as a <code>BoundSize</code>. E.g. "50:100px:200mm" or "100px!".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  gapAfter(boundsSize: string): CC {
    this.hor.setGapAfter(ConstraintParser.parseBoundSize(boundsSize, true, true));
    return this;
  }
  /**
   * Sets the gap above the component.
   * @param boundsSize The size of the gap expressed as a <code>BoundSize</code>. E.g. "50:100px:200mm" or "100px!".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  gapTop(boundsSize: string): CC {
    this.ver.setGapBefore(ConstraintParser.parseBoundSize(boundsSize, true, false));
    return this;
  }
  /**
   * Sets the gap to the left the component.
   * @param boundsSize The size of the gap expressed as a <code>BoundSize</code>. E.g. "50:100px:200mm" or "100px!".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  gapLeft(boundsSize: string): CC {
    this.hor.setGapBefore(ConstraintParser.parseBoundSize(boundsSize, true, true));
    return this;
  }
  /**
   * Sets the gap below the component.
   * @param boundsSize The size of the gap expressed as a <code>BoundSize</code>. E.g. "50:100px:200mm" or "100px!".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  gapBottom(boundsSize: string): CC {
    this.ver.setGapAfter(ConstraintParser.parseBoundSize(boundsSize, true, false));
    return this;
  }
  /**
   * Sets the gap to the right of the component.
   * @param boundsSize The size of the gap expressed as a <code>BoundSize</code>. E.g. "50:100px:200mm" or "100px!".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  gapRight(boundsSize: string): CC {
    this.hor.setGapAfter(ConstraintParser.parseBoundSize(boundsSize, true, true));
    return this;
  }
  /**
   * Same functionality as calling {@link #setSpanY(int)} with <code>LayoutUtil.INF</code> which means this cell will span the rest of the column.
   * This method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setSpanY(int)
   * @see #spanY()
   */
  spanY$(): CC {
    return this.spanY$int(LayoutUtil.INF);
  }
  /**
   * Same functionality as {@link #setSpanY(int)} only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param cells The number of cells to span (i.e. merge).
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setSpanY(int)
   */
  spanY$int(cells: number): CC {
    this.setSpanY(cells);
    return this;
  }
  /**
   * Same functionality as {@link #setSpanX(int)} which means this cell will span the rest of the row.
   * This method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setSpanX(int)
   * @see #spanX()
   */
  spanX$(): CC {
    return this.spanX$int(LayoutUtil.INF);
  }
  /**
   * Same functionality as {@link #setSpanX(int)} only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param cells The number of cells to span (i.e. merge).
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setSpanY(int)
   */
  spanX$int(cells: number): CC {
    this.setSpanX(cells);
    return this;
  }
  /**
   * Same functionality as <code>pushX().pushY()</code> which means this cell will push in both x and y dimensions.
   * This method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setPushX(Float)
   * @see #setPushX(Float)
   * @see #pushY()
   * @see #pushX()
   */
  push$(): CC {
    return this.pushX$().pushY$();
  }
  /**
   * Same functionality as <code>pushX(weightX).pushY(weightY)</code> which means this cell will push in both x and y dimensions.
   * This method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param weightX The weight used in the push.
   * @param weightY The weight used in the push.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setPushY(Float)
   * @see #setPushX(Float)
   * @see #pushY()
   * @see #pushX()
   */
  push$Float$Float(weightX: number, weightY: number): CC {
    return this.pushX$Float(weightX).pushY$Float(weightY);
  }
  /**
   * Same functionality as {@link #setPushY(Float)} which means this cell will push the rest of the column.
   * This method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setPushY(Float)
   */
  pushY$(): CC {
    return this.pushY$Float(ResizeConstraint.WEIGHT_100);
  }
  /**
   * Same functionality as {@link #setPushY(Float weight)} only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param weight The weight used in the push.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setPushY(Float)
   */
  pushY$Float(weight: number): CC {
    this.setPushY(weight);
    return this;
  }
  /**
   * Same functionality as {@link #setPushX(Float)} which means this cell will push the rest of the row.
   * This method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setPushX(Float)
   */
  pushX$(): CC {
    return this.pushX$Float(ResizeConstraint.WEIGHT_100);
  }
  /**
   * Same functionality as {@link #setPushX(Float weight)} only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param weight The weight used in the push.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new LayoutConstraint().noGrid().gap().fill()</code>.
   * @see #setPushY(Float)
   */
  pushX$Float(weight: number): CC {
    this.setPushX(weight);
    return this;
  }
  /**
   * Same functionality as {@link #setSplit(int parts)} only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param parts The number of parts (i.e. component slots) the cell should be divided into.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setSplit(int)
   */
  split$int(parts: number): CC {
    this.setSplit(parts);
    return this;
  }
  /**
   * Same functionality as split(LayoutUtil.INF), which means split until one of the keywords that breaks the split is found for
   * a component after this one (e.g. wrap, newline and skip).
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setSplit(int)
   * @since 3.7.2
   */
  split$(): CC {
    this.setSplit(LayoutUtil.INF);
    return this;
  }
  /**
   * Same functionality as {@link #setSkip(int)} only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param cells How many cells in the grid that should be skipped <b>before</b> the component that this constraint belongs to
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setSkip(int)
   */
  skip$int(cells: number): CC {
    this.setSkip(cells);
    return this;
  }
  /**
   * Same functionality as skip(1).
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setSkip(int)
   * @since 3.7.2
   */
  skip$(): CC {
    this.setSkip(1);
    return this;
  }
  /**
   * Same functionality as calling {@link #setExternal(boolean)} with <code>true</code> only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setExternal(boolean)
   */
  external(): CC {
    this.setExternal(true);
    return this;
  }
  /**
   * Same functionality as calling {@link #setFlowX(Boolean)} with <code>Boolean.TRUE</code> only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setFlowX(Boolean)
   */
  flowX(): CC {
    this.setFlowX(true);
    return this;
  }
  /**
   * Same functionality as calling {@link #setFlowX(Boolean)} with <code>Boolean.FALSE</code> only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setFlowX(Boolean)
   */
  flowY(): CC {
    this.setFlowX(false);
    return this;
  }
  /**
   * Same functionality as {@link #growX()} and {@link #growY()}.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #growX()
   * @see #growY()
   */
  grow$(): CC {
    this.growX$();
    this.growY$();
    return this;
  }
  /**
   * Same functionality as calling {@link #setNewline(boolean)} with <code>true</code> only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setNewline(boolean)
   */
  newline$(): CC {
    this.setNewline(true);
    return this;
  }
  /**
   * Same functionality as {@link #setNewlineGapSize(BoundSize)} only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param gapSize The gap size that will override the gap size in the row/column constraints if <code>!= null</code>. E.g. "5px" or "unrel".
   * If <code>null</code> or <code>""</code> the newline size will be set to the default size and turned on. This is different compared to
   * {@link #setNewlineGapSize(BoundSize)}.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setNewlineGapSize(BoundSize)
   */
  newline$String(gapSize: string): CC {
    let bs = ConstraintParser.parseBoundSize(gapSize, true, (this.flowX_ != null && this.flowX_ === false));
    if (bs != null) {
      this.setNewlineGapSize(bs);
    } else {
      this.setNewline(true);
    }
    return this;
  }
  /**
   * Same functionality as calling {@link #setWrap(boolean)} with <code>true</code> only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setWrap(boolean)
   */
  wrap$(): CC {
    this.setWrap(true);
    return this;
  }
  /**
   * Same functionality as {@link #setWrapGapSize(BoundSize)} only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param gapSize The gap size that will override the gap size in the row/column constraints if <code>!= null</code>. E.g. "5px" or "unrel".
   * If <code>null</code> or <code>""</code> the wrap size will be set to the default size and turned on. This is different compared to
   * {@link #setWrapGapSize(BoundSize)}.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setWrapGapSize(BoundSize)
   */
  wrap$String(gapSize: string): CC {
    let bs = ConstraintParser.parseBoundSize(gapSize, true, (this.flowX_ != null && this.flowX_ === false));
    if (bs != null) {
      this.setWrapGapSize(bs);
    } else {
      this.setWrap(true);
    }
    return this;
  }
  /**
   * Same functionality as calling {@link #setDockSide(int)} with <code>0</code> only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setDockSide(int)
   */
  dockNorth(): CC {
    this.setDockSide(0);
    return this;
  }
  /**
   * Same functionality as calling {@link #setDockSide(int)} with <code>1</code> only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setDockSide(int)
   */
  dockWest(): CC {
    this.setDockSide(1);
    return this;
  }
  /**
   * Same functionality as calling {@link #setDockSide(int)} with <code>2</code> only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setDockSide(int)
   */
  dockSouth(): CC {
    this.setDockSide(2);
    return this;
  }
  /**
   * Same functionality as calling {@link #setDockSide(int)} with <code>3</code> only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setDockSide(int)
   */
  dockEast(): CC {
    this.setDockSide(3);
    return this;
  }
  /**
   * Sets the x-coordinate for the component. This is used to set the x coordinate position to a specific value. The component
   * bounds is still precalculated to the grid cell and this method should be seen as a way to correct the x position.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param x The x position as a UnitValue. E.g. "10" or "40mm" or "container.x+10".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setPos(UnitValue[])
   * @see #setBoundsInGrid(boolean)
   */
  x(x: string): CC {
    return this.corrPos(x, 0);
  }
  /**
   * Sets the y-coordinate for the component. This is used to set the y coordinate position to a specific value. The component
   * bounds is still precalculated to the grid cell and this method should be seen as a way to correct the y position.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param y The y position as a UnitValue. E.g. "10" or "40mm" or "container.x+10".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setPos(UnitValue[])
   * @see #setBoundsInGrid(boolean)
   */
  y(y: string): CC {
    return this.corrPos(y, 1);
  }
  /**
   * Sets the x2-coordinate for the component (right side). This is used to set the x2 coordinate position to a specific value. The component
   * bounds is still precalculated to the grid cell and this method should be seen as a way to correct the x position.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param x2 The x2 side's position as a UnitValue. E.g. "10" or "40mm" or "container.x2 - 10".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setPos(UnitValue[])
   * @see #setBoundsInGrid(boolean)
   */
  x2(x2: string): CC {
    return this.corrPos(x2, 2);
  }
  /**
   * Sets the y2-coordinate for the component (bottom side). This is used to set the y2 coordinate position to a specific value. The component
   * bounds is still precalculated to the grid cell and this method should be seen as a way to correct the y position.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param y2 The y2 side's position as a UnitValue. E.g. "10" or "40mm" or "container.x2 - 10".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setPos(UnitValue[])
   * @see #setBoundsInGrid(boolean)
   */
  y2(y2: string): CC {
    return this.corrPos(y2, 3);
  }
  corrPos(uv: string, ix: number): CC {
    let b = this.getPos();
    if (b == null) {
      b = $J.newArray(4, null);
    }
    b[ix] = ConstraintParser.parseUnitValue$String$boolean(uv, (ix % 2 === 0));
    this.setPos(b);
    this.setBoundsInGrid(true);
    return this;
  }
  /**
   * Same functionality as {@link #x(String x)} and {@link #y(String y)} together.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param x The x position as a UnitValue. E.g. "10" or "40mm" or "container.x+10".
   * @param y The y position as a UnitValue. E.g. "10" or "40mm" or "container.x+10".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setPos(UnitValue[])
   */
  pos$String$String(x: string, y: string): CC {
    let b = this.getPos();
    if (b == null) {
      b = $J.newArray(4, null);
    }
    b[0] = ConstraintParser.parseUnitValue$String$boolean(x, true);
    b[1] = ConstraintParser.parseUnitValue$String$boolean(y, false);
    this.setPos(b);
    this.setBoundsInGrid(false);
    return this;
  }
  /**
   * Same functionality as {@link #x(String x)}, {@link #y(String y)}, {@link #y2(String y)} and {@link #y2(String y)} together.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param x The x position as a UnitValue. E.g. "10" or "40mm" or "container.x+10".
   * @param y The y position as a UnitValue. E.g. "10" or "40mm" or "container.x+10".
   * @param x2 The x2 side's position as a UnitValue. E.g. "10" or "40mm" or "container.x2 - 10".
   * @param y2 The y2 side's position as a UnitValue. E.g. "10" or "40mm" or "container.x2 - 10".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setPos(UnitValue[])
   */
  pos$String$String$String$String(x: string, y: string, x2: string, y2: string): CC {
    this.setPos([ConstraintParser.parseUnitValue$String$boolean(x, true), ConstraintParser.parseUnitValue$String$boolean(y, false), ConstraintParser.parseUnitValue$String$boolean(x2, true), ConstraintParser.parseUnitValue$String$boolean(y2, false)]);
    this.setBoundsInGrid(false);
    return this;
  }
  /**
   * Same functionality as {@link #setPadding(UnitValue[])} but the unit values as absolute pixels. This method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param top The top padding that will be added to the y coordinate at the last stage in the layout.
   * @param left The top padding that will be added to the x coordinate at the last stage in the layout.
   * @param bottom The top padding that will be added to the y2 coordinate at the last stage in the layout.
   * @param right The top padding that will be added to the x2 coordinate at the last stage in the layout.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setTag(String)
   */
  pad$int$int$int$int(top: number, left: number, bottom: number, right: number): CC {
    this.setPadding([new UnitValue()._UnitValue$float(Math.fround(top)), new UnitValue()._UnitValue$float(Math.fround(left)), new UnitValue()._UnitValue$float(Math.fround(bottom)), new UnitValue()._UnitValue$float(Math.fround(right))]);
    return this;
  }
  /**
   * Same functionality as <code>setPadding(ConstraintParser.parseInsets(pad, false))}</code> only this method returns <code>this</code> for chaining multiple calls.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param pad The string to parse. E.g. "10 10 10 10" or "20". If less than 4 groups the last will be used for the missing.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new ComponentConstraint().noGrid().gap().fill()</code>.
   * @see #setTag(String)
   */
  pad$String(pad: string): CC {
    this.setPadding(pad != null ? ConstraintParser.parseInsets(pad, false) : null);
    return this;
  }
  /**
   * Returns the horizontal dimension constraint for this component constraint. It has constraints for the horizontal size
   * and grow/shrink priorities and weights.
   * <p>
   * Note! If any changes is to be made it must be made direct when the object is returned. It is not allowed to save the
   * constraint for later use.
   * @return The current dimension constraint. Never <code>null</code>.
   */
  getHorizontal(): DimConstraint {
    return this.hor;
  }
  /**
   * Sets the horizontal dimension constraint for this component constraint. It has constraints for the horizontal size
   * and grow/shrink priorities and weights.
   * @param h The new dimension constraint. If <code>null</code> it will be reset to <code>new DimConstraint();</code>
   */
  setHorizontal(h: DimConstraint): void {
    this.hor = h != null ? h : new DimConstraint()._DimConstraint();
  }
  /**
   * Returns the vertical dimension constraint for this component constraint. It has constraints for the vertical size
   * and grow/shrink priorities and weights.
   * <p>
   * Note! If any changes is to be made it must be made direct when the object is returned. It is not allowed to save the
   * constraint for later use.
   * @return The current dimension constraint. Never <code>null</code>.
   */
  getVertical(): DimConstraint {
    return this.ver;
  }
  /**
   * Sets the vertical dimension constraint for this component constraint. It has constraints for the vertical size
   * and grow/shrink priorities and weights.
   * @param v The new dimension constraint. If <code>null</code> it will be reset to <code>new DimConstraint();</code>
   */
  setVertical(v: DimConstraint): void {
    this.ver = v != null ? v : new DimConstraint()._DimConstraint();
  }
  /**
   * Returns the vertical or horizontal dim constraint.
   * <p>
   * Note! If any changes is to be made it must be made direct when the object is returned. It is not allowed to save the
   * constraint for later use.
   * @param isHor If the horizontal constraint should be returned.
   * @return The dim constraint. Never <code>null</code>.
   */
  getDimConstraint(isHor: boolean): DimConstraint {
    return isHor ? this.hor : this.ver;
  }
  /**
   * Returns the absolute positioning of one or more of the edges. This will be applied last in the layout cycle and will not
   * affect the flow or grid positions. The positioning is relative to the parent and can not (as padding) be used
   * to adjust the edges relative to the old value. May be <code>null</code> and elements may be <code>null</code>.
   * <code>null</code> value(s) for the x2 and y2 will be interpreted as to keep the preferred size and thus the x1
   * and x2 will just absolutely positions the component.
   * <p>
   * Note that {@link #setBoundsInGrid(boolean)} changes the interpretation of this property slightly.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value as a new array, free to modify.
   */
  getPos(): UnitValue[] {
    return this.pos != null ? [this.pos[0], this.pos[1], this.pos[2], this.pos[3]] : null;
  }
  /**
   * Sets absolute positioning of one or more of the edges. This will be applied last in the layout cycle and will not
   * affect the flow or grid positions. The positioning is relative to the parent and can not (as padding) be used
   * to adjust the edges relative to the old value. May be <code>null</code> and elements may be <code>null</code>.
   * <code>null</code> value(s) for the x2 and y2 will be interpreted as to keep the preferred size and thus the x1
   * and x2 will just absolutely positions the component.
   * <p>
   * Note that {@link #setBoundsInGrid(boolean)} changes the interpretation of this property slightly.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param pos <code>UnitValue[] {x, y, x2, y2}</code>. Must be <code>null</code> or of length 4. Elements can be <code>null</code>.
   */
  setPos(pos: UnitValue[]): void {
    this.pos = pos != null ? [pos[0], pos[1], pos[2], pos[3]] : null;
    this.linkTargets = null;
  }
  /**
   * Returns if the absolute <code>pos</code> value should be corrections to the component that is in a normal cell. If <code>false</code>
   * the value of <code>pos</code> is truly absolute in that it will not affect the grid or have a default bounds in the grid.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value.
   * @see #getPos()
   */
  isBoundsInGrid(): boolean {
    return this.boundsInGrid;
  }
  /**
   * Sets if the absolute <code>pos</code> value should be corrections to the component that is in a normal cell. If <code>false</code>
   * the value of <code>pos</code> is truly absolute in that it will not affect the grid or have a default bounds in the grid.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param b <code>true</code> for bounds taken from the grid position. <code>false</code> is default.
   * @see #setPos(UnitValue[])
   */
  setBoundsInGrid(b: boolean): void {
    this.boundsInGrid = b;
  }
  /**
   * Returns the absolute cell position in the grid or <code>-1</code> if cell positioning is not used.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value.
   */
  getCellX(): number {
    return this.cellX;
  }
  /**
   * Set an absolute cell x-position in the grid. If &gt;= 0 this point points to the absolute cell that this constaint's component should occupy.
   * If there's already a component in that cell they will split the cell. The flow will then continue after this cell.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param x The x-position or <code>-1</code> to disable cell positioning.
   */
  setCellX(x: number): void {
    this.cellX = x;
  }
  /**
   * Returns the absolute cell position in the grid or <code>-1</code> if cell positioning is not used.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value.
   */
  getCellY(): number {
    return this.cellX < 0 ? -1 : this.cellY;
  }
  /**
   * Set an absolute cell x-position in the grid. If &gt;= 0 this point points to the absolute cell that this constaint's component should occupy.
   * If there's already a component in that cell they will split the cell. The flow will then continue after this cell.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param y The y-position or <code>-1</code> to disable cell positioning.
   */
  setCellY(y: number): void {
    if (y < 0) {
      this.cellX = -1;
    }
    this.cellY = Math.max(y, 0);
  }
  /**
   * Sets the docking side. -1 means no docking.<br>
   * Valid sides are: <code> north = 0, west = 1, south = 2, east = 3</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current side.
   */
  getDockSide(): number {
    return this.dock;
  }
  /**
   * Sets the docking side. -1 means no docking.<br>
   * Valid sides are: <code> north = 0, west = 1, south = 2, east = 3</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param side -1 or 0-3.
   */
  setDockSide(side: number): void {
    if (side < -1 || side > 3) {
      throw new IllegalArgumentException('Illegal dock side: ' + side);
    }
    this.dock = side;
  }
  /**
   * Returns if this component should have its bounds handled by an external source and not this layout manager.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value.
   */
  isExternal(): boolean {
    return this.external_;
  }
  /**
   * If this boolean is true this component is not handled in any way by the layout manager and the component can have its bounds set by an external
   * handler which is normally by the use of some <code>component.setBounds(x, y, width, height)</code> directly (for Swing).
   * <p>
   * The bounds <b>will not</b> affect the minimum and preferred size of the container.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param b <code>true</code> means that the bounds are not changed.
   */
  setExternal(b: boolean): void {
    this.external_ = b;
  }
  /**
   * Returns if the flow in the <b>cell</b> is in the horizontal dimension. Vertical if <code>false</code>. Only the first
   * component is a cell can set the flow.
   * <p>
   * If <code>null</code> the flow direction is inherited by from the {@link net.miginfocom.layout.LC}.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value.
   */
  getFlowX(): boolean {
    return this.flowX_;
  }
  /**
   * Sets if the flow in the <b>cell</b> is in the horizontal dimension. Vertical if <code>false</code>. Only the first
   * component is a cell can set the flow.
   * <p>
   * If <code>null</code> the flow direction is inherited by from the {@link net.miginfocom.layout.LC}.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param b <code>Boolean.TRUE</code> means horizontal flow in the cell.
   */
  setFlowX(b: boolean): void {
    this.flowX_ = b;
  }
  /**
   * Sets how a component that is hidden (not visible) should be treated by default.
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The mode:<br>
   * 0 == Normal. Bounds will be calculated as if the component was visible.<br>
   * 1 == If hidden the size will be 0, 0 but the gaps remain.<br>
   * 2 == If hidden the size will be 0, 0 and gaps set to zero.<br>
   * 3 == If hidden the component will be disregarded completely and not take up a cell in the grid..
   */
  getHideMode(): number {
    return this.hideMode_;
  }
  /**
   * Sets how a component that is hidden (not visible) should be treated by default.
   * @param mode The mode:<br>
   * 0 == Normal. Bounds will be calculated as if the component was visible.<br>
   * 1 == If hidden the size will be 0, 0 but the gaps remain.<br>
   * 2 == If hidden the size will be 0, 0 and gaps set to zero.<br>
   * 3 == If hidden the component will be disregarded completely and not take up a cell in the grid..
   */
  setHideMode(mode: number): void {
    if (mode < -1 || mode > 3) {
      throw new IllegalArgumentException('Wrong hideMode: ' + mode);
    }
    this.hideMode_ = mode;
  }
  /**
   * Returns the id used to reference this component in some constraints.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The id or <code>null</code>. May consist of a groupID and an componentID which are separated by a dot: ".". E.g. "grp1.id1".
   * The dot should never be first or last if present.
   */
  getId(): string {
    return this.id_;
  }
  /**
   * Sets the id used to reference this component in some constraints.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param id The id or <code>null</code>. May consist of a groupID and an componentID which are separated by a dot: ".". E.g. "grp1.id1".
   * The dot should never be first or last if present.
   */
  setId(id: string): void {
    this.id_ = id;
  }
  /**
   * Returns the absolute resizing in the last stage of the layout cycle. May be <code>null</code> and elements may be <code>null</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value. <code>null</code> or of length 4.
   */
  getPadding(): UnitValue[] {
    return this.padding != null ? [this.padding[0], this.padding[1], this.padding[2], this.padding[3]] : null;
  }
  /**
   * Sets the absolute resizing in the last stage of the layout cycle. These values are added to the edges and can thus for
   * instance be used to grow or reduce the size or move the component an absolute number of pixels. May be <code>null</code>
   * and elements may be <code>null</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param sides top, left, bottom right. Must be <code>null</code> or of length 4.
   */
  setPadding(sides: UnitValue[]): void {
    this.padding = sides != null ? [sides[0], sides[1], sides[2], sides[3]] : null;
  }
  /**
   * Returns the visual padding used when laying out this Component. May be <code>null</code> and elements may be <code>null</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value. <code>null</code> or of length 4.
   */
  getVisualPadding(): UnitValue[] {
    return this.visualPadding != null ? [this.visualPadding[0], this.visualPadding[1], this.visualPadding[2], this.visualPadding[3]] : null;
  }
  /**
   * Sets the visual padding used when laying out this Component.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param sides top, left, bottom right. Must be <code>null</code> or of length 4.
   */
  setVisualPadding(sides: UnitValue[]): void {
    this.visualPadding = sides != null ? [sides[0], sides[1], sides[2], sides[3]] : null;
  }
  /**
   * Returns how many cells in the grid that should be skipped <b>before</b> the component that this constraint belongs to.
   * <p>
   * Note that only the first component will be checked for this property.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value. 0 if no skip.
   */
  getSkip(): number {
    return this.skip_;
  }
  /**
   * Sets how many cells in the grid that should be skipped <b>before</b> the component that this constraint belongs to.
   * <p>
   * Note that only the first component will be checked for this property.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param cells How many cells in the grid that should be skipped <b>before</b> the component that this constraint belongs to
   */
  setSkip(cells: number): void {
    this.skip_ = cells;
  }
  /**
   * Returns the number of cells the cell that this constraint's component will span in the indicated dimension. <code>1</code> is default and
   * means that it only spans the current cell. <code>LayoutUtil.INF</code> is used to indicate a span to the end of the column/row.
   * <p>
   * Note that only the first component will be checked for this property.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value.
   */
  getSpanX(): number {
    return this.spanX;
  }
  /**
   * Sets the number of cells the cell that this constraint's component will span in the indicated dimension. <code>1</code> is default and
   * means that it only spans the current cell. <code>LayoutUtil.INF</code> is used to indicate a span to the end of the column/row.
   * <p>
   * Note that only the first component will be checked for this property.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param cells The number of cells to span (i.e. merge).
   */
  setSpanX(cells: number): void {
    this.spanX = cells;
  }
  /**
   * Returns the number of cells the cell that this constraint's component will span in the indicated dimension. <code>1</code> is default and
   * means that it only spans the current cell. <code>LayoutUtil.INF</code> is used to indicate a span to the end of the column/row.
   * <p>
   * Note that only the first component will be checked for this property.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value.
   */
  getSpanY(): number {
    return this.spanY;
  }
  /**
   * Sets the number of cells the cell that this constraint's component will span in the indicated dimension. <code>1</code> is default and
   * means that it only spans the current cell. <code>LayoutUtil.INF</code> is used to indicate a span to the end of the column/row.
   * <p>
   * Note that only the first component will be checked for this property.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param cells The number of cells to span (i.e. merge).
   */
  setSpanY(cells: number): void {
    this.spanY = cells;
  }
  /**
   * "pushx" indicates that the column that this component is in (this first if the component spans) should default to growing.
   * If any other column has been set to grow this push value on the component does nothing as the column's explicit grow weight
   * will take precedence. Push is normally used when the grid has not been defined in the layout.
   * <p>
   * If multiple components in a column has push weights set the largest one will be used for the column.
   * @return The current push value. Default is <code>null</code>.
   */
  getPushX(): number {
    return this.pushX;
  }
  /**
   * "pushx" indicates that the column that this component is in (this first if the component spans) should default to growing.
   * If any other column has been set to grow this push value on the component does nothing as the column's explicit grow weight
   * will take precedence. Push is normally used when the grid has not been defined in the layout.
   * <p>
   * If multiple components in a column has push weights set the largest one will be used for the column.
   * @param weight The new push value. Default is <code>null</code>.
   */
  setPushX(weight: number): void {
    this.pushX = weight;
  }
  /**
   * "pushx" indicates that the row that this component is in (this first if the component spans) should default to growing.
   * If any other row has been set to grow this push value on the component does nothing as the row's explicit grow weight
   * will take precedence. Push is normally used when the grid has not been defined in the layout.
   * <p>
   * If multiple components in a row has push weights set the largest one will be used for the row.
   * @return The current push value. Default is <code>null</code>.
   */
  getPushY(): number {
    return this.pushY;
  }
  /**
   * "pushx" indicates that the row that this component is in (this first if the component spans) should default to growing.
   * If any other row has been set to grow this push value on the component does nothing as the row's explicit grow weight
   * will take precedence. Push is normally used when the grid has not been defined in the layout.
   * <p>
   * If multiple components in a row has push weights set the largest one will be used for the row.
   * @param weight The new push value. Default is <code>null</code>.
   */
  setPushY(weight: number): void {
    this.pushY = weight;
  }
  /**
   * Returns in how many parts the current cell (that this constraint's component will be in) should be split in. If for instance
   * it is split in two, the next component will also share the same cell. Note that the cell can also span a number of
   * cells, which means that you can for instance span three cells and split that big cell for two components. Split can be
   * set to a very high value to make all components in the same row/column share the same cell (e.g. <code>LayoutUtil.INF</code>).
   * <p>
   * Note that only the first component will be checked for this property.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value.
   */
  getSplit(): number {
    return this.split_;
  }
  /**
   * Sets in how many parts the current cell (that this constraint's component will be in) should be split in. If for instance
   * it is split in two, the next component will also share the same cell. Note that the cell can also span a number of
   * cells, which means that you can for instance span three cells and split that big cell for two components. Split can be
   * set to a very high value to make all components in the same row/column share the same cell (e.g. <code>LayoutUtil.INF</code>).
   * <p>
   * Note that only the first component will be checked for this property.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param parts The number of parts (i.e. component slots) the cell should be divided into.
   */
  setSplit(parts: number): void {
    this.split_ = parts;
  }
  /**
   * Tags the component with metadata. Currently only used to tag buttons with for instance "cancel" or "ok" to make them
   * show up in the correct order depending on platform. See {@link PlatformDefaults#setButtonOrder(String)} for information.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value. May be <code>null</code>.
   */
  getTag(): string {
    return this.tag_;
  }
  /**
   * Optional tag that gives more context to this constraint's component. It is for instance used to tag buttons in a
   * button bar with the button type such as "ok", "help" or "cancel".
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param tag The new tag. May be <code>null</code>.
   */
  setTag(tag: string): void {
    this.tag_ = tag;
  }
  /**
   * Returns if the flow should wrap to the next line/column <b>after</b> the component that this constraint belongs to.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value.
   */
  isWrap(): boolean {
    return this.wrap_ != null;
  }
  /**
   * Sets if the flow should wrap to the next line/column <b>after</b> the component that this constraint belongs to.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param b <code>true</code> means wrap after.
   */
  setWrap(b: boolean): void {
    this.wrap_ = b ? (this.wrap_ == null ? CC.DEF_GAP : this.wrap_) : null;
  }
  /**
   * Returns the wrap size if it is a custom size. If wrap was set to true with {@link #setWrap(boolean)} then this method will
   * return <code>null</code> since that means that the gap size should be the default one as defined in the rows spec.
   * @return The custom gap size. NOTE! Will return <code>null</code> for both no wrap <b>and</b> default wrap.
   * @see #isWrap()
   * @see #setWrap(boolean)
   * @since 2.4.2
   */
  getWrapGapSize(): BoundSize {
    return this.wrap_ === CC.DEF_GAP ? null : this.wrap_;
  }
  /**
   * Set the wrap size and turns wrap on if <code>!= null</code>.
   * @param s The custom gap size. NOTE! <code>null</code> will not turn on or off wrap, it will only set the wrap gap size to "default".
   * A non-null value will turn on wrap though.
   * @see #isWrap()
   * @see #setWrap(boolean)
   * @since 2.4.2
   */
  setWrapGapSize(s: BoundSize): void {
    this.wrap_ = s == null ? (this.wrap_ != null ? CC.DEF_GAP : null) : s;
  }
  /**
   * Returns if the flow should wrap to the next line/column <b>before</b> the component that this constraint belongs to.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return The current value.
   */
  isNewline(): boolean {
    return this.newline != null;
  }
  /**
   * Sets if the flow should wrap to the next line/column <b>before</b> the component that this constraint belongs to.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param b <code>true</code> means wrap before.
   */
  setNewline(b: boolean): void {
    this.newline = b ? (this.newline == null ? CC.DEF_GAP : this.newline) : null;
  }
  /**
   * Returns the newline size if it is a custom size. If newline was set to true with {@link #setNewline(boolean)} then this method will
   * return <code>null</code> since that means that the gap size should be the default one as defined in the rows spec.
   * @return The custom gap size. NOTE! Will return <code>null</code> for both no newline <b>and</b> default newline.
   * @see #isNewline()
   * @see #setNewline(boolean)
   * @since 2.4.2
   */
  getNewlineGapSize(): BoundSize {
    return this.newline === CC.DEF_GAP ? null : this.newline;
  }
  /**
   * Set the newline size and turns newline on if <code>!= null</code>.
   * @param s The custom gap size. NOTE! <code>null</code> will not turn on or off newline, it will only set the newline gap size to "default".
   * A non-null value will turn on newline though.
   * @see #isNewline()
   * @see #setNewline(boolean)
   * @since 2.4.2
   */
  setNewlineGapSize(s: BoundSize): void {
    this.newline = s == null ? (this.newline != null ? CC.DEF_GAP : null) : s;
  }
  /**
   * Returns the animation spec. Default is a spec where animation is off (prio 0).
   * @return Never null.
   */
  getAnimSpec(): AnimSpec {
    return this.animSpec;
  }
  readResolve(): any {
    return LayoutUtil.getSerializedObject(this);
  }
  readExternal(in$: ObjectInput): void {
    LayoutUtil.setSerializedObject(this, LayoutUtil.readAsXML(in$));
  }
  writeExternal(out: ObjectOutput): void {
    if ($J.getClass(this) === $J.cls(CC)) {
      LayoutUtil.writeAsXML(out, this);
    }
  }
  static $clinit() {
    CC.DEF_GAP = BoundSize.NULL_SIZE;
    CC.DOCK_SIDES = ['north', 'west', 'south', 'east'];
    CC.EMPTY_ARR = $J.newArray(0, null);
  }
}

$J.define(CC, 'net.miginfocom.layout.CC', { kind: 'class', ifaces: ['java.io.Externalizable'], sup: 'java.lang.Object', ctors: { '': '_CC' }, meths: { 'pad(java.lang.String)': 'pad$String', 'pad(int,int,int,int)': 'pad$int$int$int$int', 'pos(java.lang.String,java.lang.String,java.lang.String,java.lang.String)': 'pos$String$String$String$String', 'pos(java.lang.String,java.lang.String)': 'pos$String$String', 'wrap(java.lang.String)': 'wrap$String', 'wrap()': 'wrap$', 'newline(java.lang.String)': 'newline$String', 'newline()': 'newline$', 'grow()': 'grow$', 'skip()': 'skip$', 'skip(int)': 'skip$int', 'split()': 'split$', 'split(int)': 'split$int', 'pushX(java.lang.Float)': 'pushX$Float', 'pushX()': 'pushX$', 'pushY(java.lang.Float)': 'pushY$Float', 'pushY()': 'pushY$', 'push(java.lang.Float,java.lang.Float)': 'push$Float$Float', 'push()': 'push$', 'spanX(int)': 'spanX$int', 'spanX()': 'spanX$', 'spanY(int)': 'spanY$int', 'spanY()': 'spanY$', 'growY(java.lang.Float)': 'growY$Float', 'growY(float)': 'growY$float', 'growY()': 'growY$', 'grow(float[])': 'grow$floatArr', 'growX(float)': 'growX$float', 'growX()': 'growX$' }, clinit: true, lazy: ['DEF_GAP', 'DOCK_SIDES', 'EMPTY_ARR'] });
$J.module(() => {
  AnimSpec = $J.load('net.miginfocom.layout.AnimSpec');
  BoundSize = $J.load('net.miginfocom.layout.BoundSize');
  ConstraintParser = $J.load('net.miginfocom.layout.ConstraintParser');
  DimConstraint = $J.load('net.miginfocom.layout.DimConstraint');
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
  ResizeConstraint = $J.load('net.miginfocom.layout.ResizeConstraint');
  UnitValue = $J.load('net.miginfocom.layout.UnitValue');
});
