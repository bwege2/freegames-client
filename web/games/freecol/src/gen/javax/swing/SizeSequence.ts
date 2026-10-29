// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/SizeSequence.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2018, Oracle and/or its affiliates. All rights reserved.
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
 * A <code>SizeSequence</code> object
 * efficiently maintains an ordered list
 * of sizes and corresponding positions.
 * One situation for which <code>SizeSequence</code>
 * might be appropriate is in a component
 * that displays multiple rows of unequal size.
 * In this case, a single <code>SizeSequence</code>
 * object could be used to track the heights
 * and Y positions of all rows.
 * <p>
 * Another example would be a multi-column component,
 * such as a <code>JTable</code>,
 * in which the column sizes are not all equal.
 * The <code>JTable</code> might use a single
 * <code>SizeSequence</code> object
 * to store the widths and X positions of all the columns.
 * The <code>JTable</code> could then use the
 * <code>SizeSequence</code> object
 * to find the column corresponding to a certain position.
 * The <code>JTable</code> could update the
 * <code>SizeSequence</code> object
 * whenever one or more column sizes changed.
 *
 * <p>
 * The following figure shows the relationship between size and position data
 * for a multi-column component.
 *
 * <p style="text-align:center">
 * <img src="doc-files/SizeSequence-1.gif" width=384 height = 100
 * alt="The first item begins at position 0, the second at the position equal
 * to the size of the previous item, and so on.">
 * <p>
 * In the figure, the first index (0) corresponds to the first column,
 * the second index (1) to the second column, and so on.
 * The first column's position starts at 0,
 * and the column occupies <em>size<sub>0</sub></em> pixels,
 * where <em>size<sub>0</sub></em> is the value returned by
 * <code>getSize(0)</code>.
 * Thus, the first column ends at <em>size<sub>0</sub></em> - 1.
 * The second column then begins at
 * the position <em>size<sub>0</sub></em>
 * and occupies <em>size<sub>1</sub></em> (<code>getSize(1)</code>) pixels.
 * <p>
 * Note that a <code>SizeSequence</code> object simply represents intervals
 * along an axis.
 * In our examples, the intervals represent height or width in pixels.
 * However, any other unit of measure (for example, time in days)
 * could be just as valid.
 *
 *
 * <h2>Implementation Notes</h2>
 *
 * Normally when storing the size and position of entries,
 * one would choose between
 * storing the sizes or storing their positions
 * instead. The two common operations that are needed during
 * rendering are: <code>getIndex(position)</code>
 * and <code>setSize(index, size)</code>.
 * Whichever choice of internal format is made one of these
 * operations is costly when the number of entries becomes large.
 * If sizes are stored, finding the index of the entry
 * that encloses a particular position is linear in the
 * number of entries. If positions are stored instead, setting
 * the size of an entry at a particular index requires updating
 * the positions of the affected entries, which is also a linear
 * calculation.
 * <p>
 * Like the above techniques this class holds an array of N integers
 * internally but uses a hybrid encoding, which is halfway
 * between the size-based and positional-based approaches.
 * The result is a data structure that takes the same space to store
 * the information but can perform most operations in Log(N) time
 * instead of O(N), where N is the number of entries in the list.
 * <p>
 * Two operations that remain O(N) in the number of entries are
 * the <code>insertEntries</code>
 * and <code>removeEntries</code> methods, both
 * of which are implemented by converting the internal array to
 * a set of integer sizes, copying it into the new array, and then
 * reforming the hybrid representation in place.
 *
 * @author Philip Milne
 * @since 1.3
 */
export class SizeSequence extends JObject {
  static emptyArray: number[] = null;
  a: number[] = null;
}

$J.define(SizeSequence, 'javax.swing.SizeSequence', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int[]': '_SizeSequence$intArr', 'int,int': '_SizeSequence$int$int', 'int': '_SizeSequence$int', '': '_SizeSequence$' }, meths: { 'getIndex(int,int,int)': 'getIndex$int$int$int$SizeSequence', 'getIndex(int)': 'getIndex$int', 'getPosition(int,int,int)': 'getPosition$int$int$int$SizeSequence', 'getPosition(int)': 'getPosition$int', 'getSizes(int,int,int[])': 'getSizes$int$int$intArr$SizeSequence', 'getSizes()': 'getSizes$', 'setSizes(int,int,int[])': 'setSizes$int$int$intArr$SizeSequence', 'setSizes(int[])': 'setSizes$intArr', 'setSizes(int,int,int)': 'setSizes$int$int$int$SizeSequence', 'setSizes(int,int)': 'setSizes$int$int' } });
