// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/AC.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../jre/index.ts';

let ConstraintParser, DimConstraint, LayoutUtil;

/**
 * A constraint that holds the column <b>or</b> row constraints for the grid. It also holds the gaps between the rows and columns.
 * <p>
 * This class is a holder and builder for a number of {@link net.miginfocom.layout.DimConstraint}s.
 * <p>
 * For a more thorough explanation of what these constraints do, and how to build the constraints, see the White Paper or Cheat Sheet at www.migcomponents.com.
 * <p>
 * Note that there are two way to build this constraint. Through String (e.g. <code>"[100]3[200,fill]"</code> or through API (E.g.
 * <code>new AC().size("100").gap("3").size("200").fill()</code>.
 */
export class AC extends JObject {
  cList: ArrayList<DimConstraint> = null;
  curIx: number = 0;
  /**
   * Constructor. Creates an instance that can be configured manually. Will be initialized with a default
   * {@link net.miginfocom.layout.DimConstraint}.
   */
  _AC(): this {
    this.cList = new ArrayList(1);
    this.curIx = 0;
    this.cList.add(new DimConstraint()._DimConstraint());
    return this;
  }
  /**
   * Property. The different {@link net.miginfocom.layout.DimConstraint}s that this object consists of.
   * These <code>DimConstraints</code> contains all information in this class.
   * <p>
   * Yes, we are embarrassingly aware that the method is misspelled.
   * @return The different {@link net.miginfocom.layout.DimConstraint}s that this object consists of. A new list and
   * never <code>null</code>.
   */
  getConstaints(): DimConstraint[] {
    return $J.toArrayInto(this.cList.toArray(), $J.newArray(this.cList.size(), null));
  }
  /**
   * Sets the different {@link net.miginfocom.layout.DimConstraint}s that this object should consists of.
   * <p>
   * Yes, we are embarrassingly aware that the method is misspelled.
   * @param constr The different {@link net.miginfocom.layout.DimConstraint}s that this object consists of. The list
   * will be copied for storage. <code>null</code> or and empty array will reset the constraints to one <code>DimConstraint</code>
   * with default values.
   */
  setConstaints(constr: DimConstraint[]): void {
    if (constr == null || constr.length < 1) {
      constr = [new DimConstraint()._DimConstraint()];
    }
    this.cList.clear();
    this.cList.ensureCapacity(constr.length);
    for (let c of constr) {
      this.cList.add(c);
    }
  }
  /**
   * Returns the number of rows/columns that this constraints currently have.
   * @return The number of rows/columns that this constraints currently have. At least 1.
   */
  getCount(): number {
    return this.cList.size();
  }
  /**
   * Sets the total number of rows/columns to <code>size</code>. If the number of rows/columns is already more
   * than <code>size</code> nothing will happen.
   * @param size The total number of rows/columns
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  count(size: number): AC {
    this.makeSize(size);
    return this;
  }
  /**
   * Specifies that the current row/column should not be grid-like. The while row/column will have its components layed out
   * in one single cell. It is the same as to say that the cells in this column/row will all be merged (a.k.a spanned).
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  noGrid$(): AC {
    return this.noGrid$intArr([this.curIx]);
  }
  /**
   * Specifies that the indicated rows/columns should not be grid-like. The while row/column will have its components layed out
   * in one single cell. It is the same as to say that the cells in this column/row will all be merged (a.k.a spanned).
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param indexes The index(es) (0-based) of the columns/rows that should be affected by this constraint.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  noGrid$intArr(indexes: number[]): AC {
    for (let i = (indexes.length - 1) | 0; i >= 0; i--) {
      let ix = indexes[i];
      this.makeSize(ix);
      this.cList.get(ix).setNoGrid(true);
    }
    return this;
  }
  /**
   * Sets the current row/column to <code>i</code>. If the current number of rows/columns is less than <code>i</code> a call
   * to {@link #count(int)} will set the size accordingly.
   * <p>
   * The next call to any of the constraint methods (e.g. {@link net.miginfocom.layout.AC#noGrid}) will be carried
   * out on this new row/column.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param i The new current row/column.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  index(i: number): AC {
    this.makeSize(i);
    this.curIx = i;
    return this;
  }
  /**
   * Specifies that the current row/column's component should grow by default. It does not affect the size of the row/column.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  fill$(): AC {
    return this.fill$intArr([this.curIx]);
  }
  /**
   * Specifies that the indicated rows'/columns' component should grow by default. It does not affect the size of the row/column.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param indexes The index(es) (0-based) of the columns/rows that should be affected by this constraint.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  fill$intArr(indexes: number[]): AC {
    for (let i = (indexes.length - 1) | 0; i >= 0; i--) {
      let ix = indexes[i];
      this.makeSize(ix);
      this.cList.get(ix).setFill(true);
    }
    return this;
  }
  /**
   * Specifies that the current row/column should be put in the size group <code>s</code> and will thus share the same size
   * constraints as the other components in the group.
   * <p>
   * Same as <code>sizeGroup("")</code>
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  sizeGroup$(): AC {
    return this.sizeGroup$String$intArr('', [this.curIx]);
  }
  /**
   * Specifies that the current row/column should be put in the size group <code>s</code> and will thus share the same size
   * constraints as the other components in the group.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param s A name to associate on the group that should be the same for other rows/columns in the same group.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  sizeGroup$String(s: string): AC {
    return this.sizeGroup$String$intArr(s, [this.curIx]);
  }
  /**
   * Specifies that the indicated rows/columns should be put in the size group <code>s</code> and will thus share the same size
   * constraints as the other components in the group.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param s A name to associate on the group that should be the same for other rows/columns in the same group.
   * @param indexes The index(es) (0-based) of the columns/rows that should be affected by this constraint.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  sizeGroup$String$intArr(s: string, indexes: number[]): AC {
    for (let i = (indexes.length - 1) | 0; i >= 0; i--) {
      let ix = indexes[i];
      this.makeSize(ix);
      this.cList.get(ix).setSizeGroup(s);
    }
    return this;
  }
  /**
   * Specifies the current row/column's min and/or preferred and/or max size. E.g. <code>"10px"</code> or <code>"50:100:200"</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param s The minimum and/or preferred and/or maximum size of this row. The string will be interpreted
   * as a <b>BoundSize</b>. For more info on how <b>BoundSize</b> is formatted see the documentation.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  size$String(s: string): AC {
    return this.size$String$intArr(s, [this.curIx]);
  }
  /**
   * Specifies the indicated rows'/columns' min and/or preferred and/or max size. E.g. <code>"10px"</code> or <code>"50:100:200"</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param size The minimum and/or preferred and/or maximum size of this row. The string will be interpreted
   * as a <b>BoundSize</b>. For more info on how <b>BoundSize</b> is formatted see the documentation.
   * @param indexes The index(es) (0-based) of the columns/rows that should be affected by this constraint.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  size$String$intArr(size: string, indexes: number[]): AC {
    let bs = ConstraintParser.parseBoundSize(size, false, true);
    for (let i = (indexes.length - 1) | 0; i >= 0; i--) {
      let ix = indexes[i];
      this.makeSize(ix);
      this.cList.get(ix).setSize(bs);
    }
    return this;
  }
  /**
   * Specifies the gap size to be the default one <b>AND</b> moves to the next column/row. The method is called <code>.gap()</code>
   * rather the more natural <code>.next()</code> to indicate that it is very much related to the other <code>.gap(..)</code> methods.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  gap$(): AC {
    this.curIx++;
    this.makeSize(this.curIx);
    return this;
  }
  /**
   * Specifies the gap size to <code>size</code> <b>AND</b> moves to the next column/row.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param size minimum and/or preferred and/or maximum size of the gap between this and the next row/column.
   * The string will be interpreted as a <b>BoundSize</b>. For more info on how <b>BoundSize</b> is formatted see the documentation.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  gap$String(size: string): AC {
    return this.gap$String$intArr(size, [this.curIx++]);
  }
  /**
   * Specifies the indicated rows'/columns' gap size to <code>size</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param size minimum and/or preferred and/or maximum size of the gap between this and the next row/column.
   * The string will be interpreted as a <b>BoundSize</b>. For more info on how <b>BoundSize</b> is formatted see the documentation.
   * @param indexes The index(es) (0-based) of the columns/rows that should be affected by this constraint.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  gap$String$intArr(size: string, indexes: number[]): AC {
    let bsa = size != null ? ConstraintParser.parseBoundSize(size, true, true) : null;
    for (let i = (indexes.length - 1) | 0; i >= 0; i--) {
      let ix = indexes[i];
      this.makeSize((ix + 1) | 0);
      if (bsa != null) {
        this.cList.get(ix).setGapAfter(bsa);
      }
    }
    return this;
  }
  /**
   * Specifies the current row/column's columns default alignment <b>for its components</b>. It does not affect the positioning
   * or size of the columns/row itself. For columns it is the horizontal alignment (e.g. "left") and for rows it is the vertical
   * alignment (e.g. "top").
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param side The default side to align the components. E.g. "top" or "left", or "leading" or "trailing" or "bottom" or "right".
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  align$String(side: string): AC {
    return this.align$String$intArr(side, [this.curIx]);
  }
  /**
   * Specifies the indicated rows'/columns' columns default alignment <b>for its components</b>. It does not affect the positioning
   * or size of the columns/row itself. For columns it is the horizontal alignment (e.g. "left") and for rows it is the vertical
   * alignment (e.g. "top").
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param side The default side to align the components. E.g. "top" or "left", or "before" or "after" or "bottom" or "right".
   * @param indexes The index(es) (0-based) of the columns/rows that should be affected by this constraint.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  align$String$intArr(side: string, indexes: number[]): AC {
    let al = ConstraintParser.parseAlignKeywords(side, true);
    if (al == null) {
      al = ConstraintParser.parseAlignKeywords(side, false);
    }
    for (let i = (indexes.length - 1) | 0; i >= 0; i--) {
      let ix = indexes[i];
      this.makeSize(ix);
      this.cList.get(ix).setAlign(al);
    }
    return this;
  }
  /**
   * Specifies the current row/column's grow priority.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param p The new grow priority.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  growPrio$int(p: number): AC {
    return this.growPrio$int$intArr(p, [this.curIx]);
  }
  /**
   * Specifies the indicated rows'/columns' grow priority.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param p The new grow priority.
   * @param indexes The index(es) (0-based) of the columns/rows that should be affected by this constraint.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  growPrio$int$intArr(p: number, indexes: number[]): AC {
    for (let i = (indexes.length - 1) | 0; i >= 0; i--) {
      let ix = indexes[i];
      this.makeSize(ix);
      this.cList.get(ix).setGrowPriority(p);
    }
    return this;
  }
  /**
   * Specifies the current row/column's grow weight within columns/rows with the <code>grow priority</code> 100f.
   * <p>
   * Same as <code>grow(100f)</code>
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  grow$(): AC {
    return this.grow$float$intArr(100, [this.curIx]);
  }
  /**
   * Specifies the current row/column's grow weight within columns/rows with the same <code>grow priority</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param w The new grow weight.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  grow$float(w: number): AC {
    return this.grow$float$intArr(w, [this.curIx]);
  }
  /**
   * Specifies the indicated rows'/columns' grow weight within columns/rows with the same <code>grow priority</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param w The new grow weight.
   * @param indexes The index(es) (0-based) of the columns/rows that should be affected by this constraint.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  grow$float$intArr(w: number, indexes: number[]): AC {
    let gw = $J.boxF(w);
    for (let i = (indexes.length - 1) | 0; i >= 0; i--) {
      let ix = indexes[i];
      this.makeSize(ix);
      this.cList.get(ix).setGrow(gw);
    }
    return this;
  }
  /**
   * Specifies the current row/column's shrink priority.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param p The new shrink priority.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  shrinkPrio$int(p: number): AC {
    return this.shrinkPrio$int$intArr(p, [this.curIx]);
  }
  /**
   * Specifies the indicated rows'/columns' shrink priority.
   * <p>
   * For a more thorough explanation of what this constraint does see the white paper or cheat Sheet at www.migcomponents.com.
   * @param p The new shrink priority.
   * @param indexes The index(es) (0-based) of the columns/rows that should be affected by this constraint.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   */
  shrinkPrio$int$intArr(p: number, indexes: number[]): AC {
    for (let i = (indexes.length - 1) | 0; i >= 0; i--) {
      let ix = indexes[i];
      this.makeSize(ix);
      this.cList.get(ix).setShrinkPriority(p);
    }
    return this;
  }
  /**
   * Specifies that the current row/column's shrink weight within the columns/rows with the <code>shrink priority</code> 100f.
   * <p>
   * Same as <code>shrink(100f)</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the White Paper or Cheat Sheet at www.migcomponents.com.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  shrink$(): AC {
    return this.shrink$float$intArr(100, [this.curIx]);
  }
  /**
   * Specifies that the current row/column's shrink weight within the columns/rows with the same <code>shrink priority</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the White Paper or Cheat Sheet at www.migcomponents.com.
   * @param w The shrink weight.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  shrink$float(w: number): AC {
    return this.shrink$float$intArr(w, [this.curIx]);
  }
  /**
   * Specifies the indicated rows'/columns' shrink weight within the columns/rows with the same <code>shrink priority</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the White Paper or Cheat Sheet at www.migcomponents.com.
   * @param w The shrink weight.
   * @param indexes The index(es) (0-based) of the columns/rows that should be affected by this constraint.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   * @since 3.7.2
   */
  shrink$float$intArr(w: number, indexes: number[]): AC {
    let sw = $J.boxF(w);
    for (let i = (indexes.length - 1) | 0; i >= 0; i--) {
      let ix = indexes[i];
      this.makeSize(ix);
      this.cList.get(ix).setShrink(sw);
    }
    return this;
  }
  /**
   * Specifies that the current row/column's shrink weight within the columns/rows with the same <code>shrink priority</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the White Paper or Cheat Sheet at www.migcomponents.com.
   * @param w The shrink weight.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   * @deprecated in 3.7.2. Use {@link #shrink(float)} instead.
   */
  shrinkWeight$float(w: number): AC {
    return this.shrink$float(w);
  }
  /**
   * Specifies the indicated rows'/columns' shrink weight within the columns/rows with the same <code>shrink priority</code>.
   * <p>
   * For a more thorough explanation of what this constraint does see the White Paper or Cheat Sheet at www.migcomponents.com.
   * @param w The shrink weight.
   * @param indexes The index(es) (0-based) of the columns/rows that should be affected by this constraint.
   * @return <code>this</code> so it is possible to chain calls. E.g. <code>new AxisConstraint().noGrid().gap().fill()</code>.
   * @deprecated in 3.7.2. Use {@link #shrink(float, int...)} instead.
   */
  shrinkWeight$float$intArr(w: number, indexes: number[]): AC {
    return this.shrink$float$intArr(w, indexes);
  }
  makeSize(sz: number): void {
    if (this.cList.size() <= sz) {
      this.cList.ensureCapacity(sz);
      for (let i = this.cList.size(); i <= sz; i++) {
        this.cList.add(new DimConstraint()._DimConstraint());
      }
    }
  }
  readResolve(): any {
    return LayoutUtil.getSerializedObject(this);
  }
  readExternal(in$: ObjectInput): void {
    LayoutUtil.setSerializedObject(this, LayoutUtil.readAsXML(in$));
  }
  writeExternal(out: ObjectOutput): void {
    if ($J.getClass(this) === $J.cls(AC)) {
      LayoutUtil.writeAsXML(out, this);
    }
  }
}

$J.define(AC, 'net.miginfocom.layout.AC', { kind: 'class', ifaces: ['java.io.Externalizable'], sup: 'java.lang.Object', ctors: { '': '_AC' }, meths: { 'shrinkWeight(float,int[])': 'shrinkWeight$float$intArr', 'shrinkWeight(float)': 'shrinkWeight$float', 'shrink(float,int[])': 'shrink$float$intArr', 'shrink(float)': 'shrink$float', 'shrink()': 'shrink$', 'shrinkPrio(int,int[])': 'shrinkPrio$int$intArr', 'shrinkPrio(int)': 'shrinkPrio$int', 'grow(float,int[])': 'grow$float$intArr', 'grow(float)': 'grow$float', 'grow()': 'grow$', 'growPrio(int,int[])': 'growPrio$int$intArr', 'growPrio(int)': 'growPrio$int', 'align(java.lang.String,int[])': 'align$String$intArr', 'align(java.lang.String)': 'align$String', 'gap(java.lang.String,int[])': 'gap$String$intArr', 'gap(java.lang.String)': 'gap$String', 'gap()': 'gap$', 'size(java.lang.String,int[])': 'size$String$intArr', 'size(java.lang.String)': 'size$String', 'sizeGroup(java.lang.String,int[])': 'sizeGroup$String$intArr', 'sizeGroup(java.lang.String)': 'sizeGroup$String', 'sizeGroup()': 'sizeGroup$', 'fill(int[])': 'fill$intArr', 'fill()': 'fill$', 'noGrid(int[])': 'noGrid$intArr', 'noGrid()': 'noGrid$' } });
$J.module(() => {
  ConstraintParser = $J.load('net.miginfocom.layout.ConstraintParser');
  DimConstraint = $J.load('net.miginfocom.layout.DimConstraint');
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
});
