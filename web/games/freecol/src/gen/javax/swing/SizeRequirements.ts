// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/SizeRequirements.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

/**
 * For the convenience of layout managers,
 * calculates information about the size and position of components.
 * All size and position calculation methods are class methods
 * that take arrays of SizeRequirements as arguments.
 * The SizeRequirements class supports two types of layout:
 *
 * <blockquote>
 * <dl>
 * <dt> tiled
 * <dd> The components are placed end-to-end,
 *      starting either at coordinate 0 (the leftmost or topmost position)
 *      or at the coordinate representing the end of the allocated span
 *      (the rightmost or bottommost position).
 *
 * <dt> aligned
 * <dd> The components are aligned as specified
 *      by each component's X or Y alignment value.
 * </dl>
 * </blockquote>
 *
 * <p>
 *
 * Each SizeRequirements object contains information
 * about either the width (and X alignment)
 * or height (and Y alignment)
 * of a single component or a group of components:
 *
 * <blockquote>
 * <dl>
 * <dt> <code>minimum</code>
 * <dd> The smallest reasonable width/height of the component
 *      or component group, in pixels.
 *
 * <dt> <code>preferred</code>
 * <dd> The natural width/height of the component
 *      or component group, in pixels.
 *
 * <dt> <code>maximum</code>
 * <dd> The largest reasonable width/height of the component
 *      or component group, in pixels.
 *
 * <dt> <code>alignment</code>
 * <dd> The X/Y alignment of the component
 *      or component group.
 * </dl>
 * </blockquote>
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @see Component#getMinimumSize
 * @see Component#getPreferredSize
 * @see Component#getMaximumSize
 * @see Component#getAlignmentX
 * @see Component#getAlignmentY
 *
 * @author Timothy Prinzing
 * @since 1.2
 */
export class SizeRequirements extends JObject {
  /**
   * The minimum size required.
   * For a component <code>comp</code>, this should be equal to either
   * <code>comp.getMinimumSize().width</code> or
   * <code>comp.getMinimumSize().height</code>.
   */
  minimum: number = 0;
  /**
   * The preferred (natural) size.
   * For a component <code>comp</code>, this should be equal to either
   * <code>comp.getPreferredSize().width</code> or
   * <code>comp.getPreferredSize().height</code>.
   */
  preferred_: number = 0;
  /**
   * The maximum size allowed.
   * For a component <code>comp</code>, this should be equal to either
   * <code>comp.getMaximumSize().width</code> or
   * <code>comp.getMaximumSize().height</code>.
   */
  maximum: number = 0;
  /**
   * The alignment, specified as a value between 0.0 and 1.0,
   * inclusive.
   * To specify centering, the alignment should be 0.5.
   */
  alignment: number = 0;
  /**
   * Creates a SizeRequirements object with the minimum, preferred,
   * and maximum sizes set to zero and an alignment value of 0.5
   * (centered).
   */
  _SizeRequirements$(): this {
    this.minimum = 0;
    this.preferred_ = 0;
    this.maximum = 0;
    this.alignment = 0.5;
    return this;
  }
  /**
   * Creates a SizeRequirements object with the specified minimum, preferred,
   * and maximum sizes and the specified alignment.
   *
   * @param min the minimum size &gt;= 0
   * @param pref the preferred size &gt;= 0
   * @param max the maximum size &gt;= 0
   * @param a the alignment &gt;= 0.0f &amp;&amp; &lt;= 1.0f
   */
  _SizeRequirements$int$int$int$float(min: number, pref: number, max: number, a: number): this {
    this.minimum = min;
    this.preferred_ = pref;
    this.maximum = max;
    this.alignment = a > 1 ? 1 : a < 0 ? 0 : a;
    return this;
  }
  /**
   * Returns a string describing the minimum, preferred, and maximum
   * size requirements, along with the alignment.
   *
   * @return the string
   */
  toString(): string {
    return '[' + this.minimum + ',' + this.preferred_ + ',' + this.maximum + ']@' + $J.fstr(this.alignment);
  }
  /**
   * Determines the total space necessary to
   * place a set of components end-to-end.  The needs
   * of each component in the set are represented by an entry in the
   * passed-in SizeRequirements array.
   * The returned SizeRequirements object has an alignment of 0.5
   * (centered).  The space requirement is never more than
   * Integer.MAX_VALUE.
   *
   * @param children  the space requirements for a set of components.
   *   The vector may be of zero length, which will result in a
   *   default SizeRequirements object instance being passed back.
   * @return  the total space requirements.
   */
  static getTiledSizeRequirements(children: SizeRequirements[]): SizeRequirements {
    let total = new SizeRequirements()._SizeRequirements$();
    for (let i = 0; i < children.length; i++) {
      let req = children[i];
      total.minimum = (Math.min(total.minimum + req.minimum, 2147483647)) | 0;
      total.preferred_ = (Math.min(total.preferred_ + req.preferred_, 2147483647)) | 0;
      total.maximum = (Math.min(total.maximum + req.maximum, 2147483647)) | 0;
    }
    return total;
  }
  /**
   * Determines the total space necessary to
   * align a set of components.  The needs
   * of each component in the set are represented by an entry in the
   * passed-in SizeRequirements array.  The total space required will
   * never be more than Integer.MAX_VALUE.
   *
   * @param children  the set of child requirements.  If of zero length,
   *  the returns result will be a default instance of SizeRequirements.
   * @return  the total space requirements.
   */
  static getAlignedSizeRequirements(children: SizeRequirements[]): SizeRequirements {
    let totalAscent = new SizeRequirements()._SizeRequirements$();
    let totalDescent = new SizeRequirements()._SizeRequirements$();
    for (let i = 0; i < children.length; i++) {
      let req = children[i];
      let ascent = $J.d2i((Math.fround(req.alignment * req.minimum)));
      let descent = (req.minimum - ascent) | 0;
      totalAscent.minimum = Math.max(ascent, totalAscent.minimum);
      totalDescent.minimum = Math.max(descent, totalDescent.minimum);
      ascent = $J.d2i((Math.fround(req.alignment * req.preferred_)));
      descent = (req.preferred_ - ascent) | 0;
      totalAscent.preferred_ = Math.max(ascent, totalAscent.preferred_);
      totalDescent.preferred_ = Math.max(descent, totalDescent.preferred_);
      ascent = $J.d2i((Math.fround(req.alignment * req.maximum)));
      descent = (req.maximum - ascent) | 0;
      totalAscent.maximum = Math.max(ascent, totalAscent.maximum);
      totalDescent.maximum = Math.max(descent, totalDescent.maximum);
    }
    let min = (Math.min(totalAscent.minimum + totalDescent.minimum, 2147483647)) | 0;
    let pref = (Math.min(totalAscent.preferred_ + totalDescent.preferred_, 2147483647)) | 0;
    let max = (Math.min(totalAscent.maximum + totalDescent.maximum, 2147483647)) | 0;
    let alignment = 0;
    if (min > 0) {
      alignment = Math.fround(Math.fround(totalAscent.minimum) / min);
      alignment = alignment > 1 ? 1 : alignment < 0 ? 0 : alignment;
    }
    return new SizeRequirements()._SizeRequirements$int$int$int$float(min, pref, max, alignment);
  }
  /**
   * Creates a set of offset/span pairs representing how to
   * lay out a set of components end-to-end.
   * This method requires that you specify
   * the total amount of space to be allocated,
   * the size requirements for each component to be placed
   * (specified as an array of SizeRequirements), and
   * the total size requirement of the set of components.
   * You can get the total size requirement
   * by invoking the getTiledSizeRequirements method.  The components
   * will be tiled in the forward direction with offsets increasing from 0.
   *
   * @param allocated the total span to be allocated &gt;= 0.
   * @param total     the total of the children requests.  This argument
   *  is optional and may be null.
   * @param children  the size requirements for each component.
   * @param offsets   the offset from 0 for each child where
   *   the spans were allocated (determines placement of the span).
   * @param spans     the span allocated for each child to make the
   *   total target span.
   */
  static calculateTiledPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr(allocated: number, total: SizeRequirements, children: SizeRequirements[], offsets: number[], spans: number[]): void {
    SizeRequirements.calculateTiledPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr$boolean(allocated, total, children, offsets, spans, true);
  }
  /**
   * Creates a set of offset/span pairs representing how to
   * lay out a set of components end-to-end.
   * This method requires that you specify
   * the total amount of space to be allocated,
   * the size requirements for each component to be placed
   * (specified as an array of SizeRequirements), and
   * the total size requirement of the set of components.
   * You can get the total size requirement
   * by invoking the getTiledSizeRequirements method.
   *
   * This method also requires a flag indicating whether components
   * should be tiled in the forward direction (offsets increasing
   * from 0) or reverse direction (offsets decreasing from the end
   * of the allocated space).  The forward direction represents
   * components tiled from left to right or top to bottom.  The
   * reverse direction represents components tiled from right to left
   * or bottom to top.
   *
   * @param allocated the total span to be allocated &gt;= 0.
   * @param total     the total of the children requests.  This argument
   *  is optional and may be null.
   * @param children  the size requirements for each component.
   * @param offsets   the offset from 0 for each child where
   *   the spans were allocated (determines placement of the span).
   * @param spans     the span allocated for each child to make the
   *   total target span.
   * @param forward   tile with offsets increasing from 0 if true
   *   and with offsets decreasing from the end of the allocated space
   *   if false.
   * @since 1.4
   */
  static calculateTiledPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr$boolean(allocated: number, total: SizeRequirements, children: SizeRequirements[], offsets: number[], spans: number[], forward: boolean): void {
    let min = 0;
    let pref = 0;
    let max = 0;
    for (let i = 0; i < children.length; i++) {
      min += children[i].minimum;
      pref += children[i].preferred_;
      max += children[i].maximum;
    }
    if (allocated >= pref) {
      SizeRequirements.expandedTile(allocated, min, pref, max, children, offsets, spans, forward);
    } else {
      SizeRequirements.compressedTile(allocated, min, pref, max, children, offsets, spans, forward);
    }
  }
  static compressedTile(allocated: number, min: number, pref: number, max: number, request: SizeRequirements[], offsets: number[], spans: number[], forward: boolean): void {
    let totalPlay = Math.fround(Math.min(pref - allocated, pref - min));
    let factor = (pref - min === 0) ? 0 : Math.fround(totalPlay / (pref - min));
    let totalOffset: number;
    if (forward) {
      totalOffset = 0;
      for (let i = 0; i < spans.length; i++) {
        offsets[i] = totalOffset;
        let req = request[i];
        let play = Math.fround(factor * ((req.preferred_ - req.minimum) | 0));
        spans[i] = $J.d2i((Math.fround(req.preferred_ - play)));
        totalOffset = (Math.min(totalOffset + spans[i], 2147483647)) | 0;
      }
    } else {
      totalOffset = allocated;
      for (let i = 0; i < spans.length; i++) {
        let req = request[i];
        let play = Math.fround(factor * ((req.preferred_ - req.minimum) | 0));
        spans[i] = $J.d2i((Math.fround(req.preferred_ - play)));
        offsets[i] = (totalOffset - spans[i]) | 0;
        totalOffset = (Math.max(totalOffset - spans[i], 0)) | 0;
      }
    }
  }
  static expandedTile(allocated: number, min: number, pref: number, max: number, request: SizeRequirements[], offsets: number[], spans: number[], forward: boolean): void {
    let totalPlay = Math.fround(Math.min(allocated - pref, max - pref));
    let factor = (max - pref === 0) ? 0 : Math.fround(totalPlay / (max - pref));
    let totalOffset: number;
    if (forward) {
      totalOffset = 0;
      for (let i = 0; i < spans.length; i++) {
        offsets[i] = totalOffset;
        let req = request[i];
        let play = $J.d2i((Math.fround(factor * ((req.maximum - req.preferred_) | 0))));
        spans[i] = (Math.min(req.preferred_ + play, 2147483647)) | 0;
        totalOffset = (Math.min(totalOffset + spans[i], 2147483647)) | 0;
      }
    } else {
      totalOffset = allocated;
      for (let i = 0; i < spans.length; i++) {
        let req = request[i];
        let play = $J.d2i((Math.fround(factor * ((req.maximum - req.preferred_) | 0))));
        spans[i] = (Math.min(req.preferred_ + play, 2147483647)) | 0;
        offsets[i] = (totalOffset - spans[i]) | 0;
        totalOffset = (Math.max(totalOffset - spans[i], 0)) | 0;
      }
    }
  }
  /**
   * Creates a bunch of offset/span pairs specifying how to
   * lay out a set of components with the specified alignments.
   * The resulting span allocations will overlap, with each one
   * fitting as well as possible into the given total allocation.
   * This method requires that you specify
   * the total amount of space to be allocated,
   * the size requirements for each component to be placed
   * (specified as an array of SizeRequirements), and
   * the total size requirements of the set of components
   * (only the alignment field of which is actually used).
   * You can get the total size requirement by invoking
   * getAlignedSizeRequirements.
   *
   * Normal alignment will be done with an alignment value of 0.0f
   * representing the left/top edge of a component.
   *
   * @param allocated the total span to be allocated &gt;= 0.
   * @param total     the total of the children requests.
   * @param children  the size requirements for each component.
   * @param offsets   the offset from 0 for each child where
   *   the spans were allocated (determines placement of the span).
   * @param spans     the span allocated for each child to make the
   *   total target span.
   */
  static calculateAlignedPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr(allocated: number, total: SizeRequirements, children: SizeRequirements[], offsets: number[], spans: number[]): void {
    SizeRequirements.calculateAlignedPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr$boolean(allocated, total, children, offsets, spans, true);
  }
  /**
   * Creates a set of offset/span pairs specifying how to
   * lay out a set of components with the specified alignments.
   * The resulting span allocations will overlap, with each one
   * fitting as well as possible into the given total allocation.
   * This method requires that you specify
   * the total amount of space to be allocated,
   * the size requirements for each component to be placed
   * (specified as an array of SizeRequirements), and
   * the total size requirements of the set of components
   * (only the alignment field of which is actually used)
   * You can get the total size requirement by invoking
   * getAlignedSizeRequirements.
   *
   * This method also requires a flag indicating whether normal or
   * reverse alignment should be performed.  With normal alignment
   * the value 0.0f represents the left/top edge of the component
   * to be aligned.  With reverse alignment, 0.0f represents the
   * right/bottom edge.
   *
   * @param allocated the total span to be allocated &gt;= 0.
   * @param total     the total of the children requests.
   * @param children  the size requirements for each component.
   * @param offsets   the offset from 0 for each child where
   *   the spans were allocated (determines placement of the span).
   * @param spans     the span allocated for each child to make the
   *   total target span.
   * @param normal    when true, the alignment value 0.0f means
   *   left/top; when false, it means right/bottom.
   * @since 1.4
   */
  static calculateAlignedPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr$boolean(allocated: number, total: SizeRequirements, children: SizeRequirements[], offsets: number[], spans: number[], normal: boolean): void {
    let totalAlignment = normal ? total.alignment : Math.fround(1 - total.alignment);
    let totalAscent = $J.d2i((Math.fround(allocated * totalAlignment)));
    let totalDescent = (allocated - totalAscent) | 0;
    for (let i = 0; i < children.length; i++) {
      let req = children[i];
      let alignment = normal ? req.alignment : Math.fround(1 - req.alignment);
      let maxAscent = $J.d2i((Math.fround(req.maximum * alignment)));
      let maxDescent = (req.maximum - maxAscent) | 0;
      let ascent = Math.min(totalAscent, maxAscent);
      let descent = Math.min(totalDescent, maxDescent);
      offsets[i] = (totalAscent - ascent) | 0;
      spans[i] = (Math.min(ascent + descent, 2147483647)) | 0;
    }
  }
}

$J.define(SizeRequirements, 'javax.swing.SizeRequirements', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int,int,int,float': '_SizeRequirements$int$int$int$float', '': '_SizeRequirements$' }, meths: { 'calculateAlignedPositions(int,javax.swing.SizeRequirements,javax.swing.SizeRequirements[],int[],int[],boolean)': 'calculateAlignedPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr$boolean', 'calculateAlignedPositions(int,javax.swing.SizeRequirements,javax.swing.SizeRequirements[],int[],int[])': 'calculateAlignedPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr', 'calculateTiledPositions(int,javax.swing.SizeRequirements,javax.swing.SizeRequirements[],int[],int[],boolean)': 'calculateTiledPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr$boolean', 'calculateTiledPositions(int,javax.swing.SizeRequirements,javax.swing.SizeRequirements[],int[],int[])': 'calculateTiledPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr' } });
