// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/ListSelectionModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2006, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../jre/index.ts';

/**
 * This interface represents the current state of the
 * selection for any of the components that display a
 * list of values with stable indices.  The selection is
 * modeled as a set of intervals, each interval represents
 * a contiguous range of selected list elements.
 * The methods for modifying the set of selected intervals
 * all take a pair of indices, index0 and index1, that represent
 * a closed interval, i.e. the interval includes both index0 and
 * index1.
 *
 * @author Hans Muller
 * @author Philip Milne
 * @see DefaultListSelectionModel
 * @since 1.2
 */
export class ListSelectionModel {
  /**
   * A value for the selectionMode property: select one list index
   * at a time.
   *
   * @see #setSelectionMode
   */
  static readonly SINGLE_SELECTION: number = 0;
  /**
   * A value for the selectionMode property: select one contiguous
   * range of indices at a time.
   *
   * @see #setSelectionMode
   */
  static readonly SINGLE_INTERVAL_SELECTION: number = 1;
  /**
   * A value for the selectionMode property: select one or more
   * contiguous ranges of indices at a time.
   *
   * @see #setSelectionMode
   */
  static readonly MULTIPLE_INTERVAL_SELECTION: number = 2;
  /**
   * Returns an array of all of the selected indices in the selection model,
   * in increasing order.
   *
   * @return all of the selected indices, in increasing order,
   *         or an empty array if nothing is selected
   * @see #removeSelectionInterval
   * @see #addListSelectionListener
   * @since 11
   * @implSpec The default implementation iterates from minimum selected
   * index {@link #getMinSelectionIndex()} to maximum selected index {@link
   * #getMaxSelectionIndex()} and returns the selected indices {@link
   * #isSelectedIndex(int)} in a newly allocated int array.
   */
  getSelectedIndices(): number[] {
    let iMin = this.getMinSelectionIndex();
    let iMax = this.getMaxSelectionIndex();
    if ((iMin < 0) || (iMax < 0)) {
      return $J.newArray(0, 0);
    }
    let rvTmp = $J.newArray((1 + (iMax - iMin)) | 0, 0);
    let n = 0;
    for (let i = iMin; i <= iMax; i++) {
      if (this.isSelectedIndex(i)) {
        rvTmp[n++] = i;
      }
    }
    let rv = $J.newArray(n, 0);
    $J.system_arraycopy(rvTmp, 0, rv, 0, n);
    return rv;
  }
  /**
   * Returns the number of selected items.
   *
   * @return the number of selected items, 0 if no items are selected
   * @since 11
   * @implSpec The default implementation iterates from minimum selected
   * index {@link #getMinSelectionIndex()} to maximum selected index {@link
   * #getMaxSelectionIndex()} and returns the number of selected indices
   * {@link #isSelectedIndex(int)}
   */
  getSelectedItemsCount(): number {
    let iMin = this.getMinSelectionIndex();
    let iMax = this.getMaxSelectionIndex();
    let count = 0;
    for (let i = iMin; i <= iMax; i++) {
      if (this.isSelectedIndex(i)) {
        count++;
      }
    }
    return count;
  }
}

$J.define(ListSelectionModel, 'javax.swing.ListSelectionModel', { kind: 'interface' });
