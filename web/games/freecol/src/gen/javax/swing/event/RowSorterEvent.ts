// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/event/RowSorterEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, EventObject, IllegalArgumentException, JEnum } from '../../../../jre/index.ts';

/**
 * <code>RowSorterEvent</code> provides notification of changes to
 * a <code>RowSorter</code>.  Two types of notification are possible:
 * <ul>
 * <li><code>Type.SORT_ORDER_CHANGED</code>: indicates the sort order has
 *     changed.  This is typically followed by a notification of:
 * <li><code>Type.SORTED</code>: indicates the contents of the model have
 *     been transformed in some way.  For example, the contents may have
 *     been sorted or filtered.
 * </ul>
 *
 * @see javax.swing.RowSorter
 * @since 1.6
 */
export class RowSorterEvent extends EventObject {
  type: RowSorterEvent$Type = null;
  oldViewToModel: number[] = null;
  /**
   * Creates a <code>RowSorterEvent</code> of type
   * <code>SORT_ORDER_CHANGED</code>.
   *
   * @param source the source of the change
   * @throws IllegalArgumentException if <code>source</code> is
   *         <code>null</code>
   */
  _RowSorterEvent$RowSorter(source: RowSorter<any>): this {
    this._RowSorterEvent$RowSorter$Type$intArr(source, RowSorterEvent$Type.SORT_ORDER_CHANGED, null);
    return this;
  }
  /**
   * Creates a <code>RowSorterEvent</code>.
   *
   * @param source the source of the change
   * @param type the type of event
   * @param previousRowIndexToModel the mapping from model indices to
   *        view indices prior to the sort, may be <code>null</code>
   * @throws IllegalArgumentException if source or <code>type</code> is
   *         <code>null</code>
   */
  _RowSorterEvent$RowSorter$Type$intArr(source: RowSorter<any>, type$: RowSorterEvent$Type, previousRowIndexToModel: number[]): this {
    this._EventObject(source);
    if (type$ == null) {
      throw new IllegalArgumentException('type must be non-null');
    }
    this.type = type$;
    this.oldViewToModel = previousRowIndexToModel;
    return this;
  }
  /**
   * Returns the source of the event as a <code>RowSorter</code>.
   *
   * @return the source of the event as a <code>RowSorter</code>
   */
  getSource(): RowSorter<any> {
    return super.getSource();
  }
  /**
   * Returns the type of event.
   *
   * @return the type of event
   */
  getType(): RowSorterEvent$Type {
    return this.type;
  }
  /**
   * Returns the location of <code>index</code> in terms of the
   * model prior to the sort.  This method is only useful for events
   * of type <code>SORTED</code>.  This method will return -1 if the
   * index is not valid, or the locations prior to the sort have not
   * been provided.
   *
   * @param index the index in terms of the view
   * @return the index in terms of the model prior to the sort, or -1 if
   *         the location is not valid or the mapping was not provided.
   */
  convertPreviousRowIndexToModel(index: number): number {
    if (this.oldViewToModel != null && index >= 0 && index < this.oldViewToModel.length) {
      return this.oldViewToModel[index];
    }
    return -1;
  }
  /**
   * Returns the number of rows before the sort.  This method is only
   * useful for events of type <code>SORTED</code> and if the
   * last locations have not been provided will return 0.
   *
   * @return the number of rows in terms of the view prior to the sort
   */
  getPreviousRowCount(): number {
    return (this.oldViewToModel == null) ? 0 : this.oldViewToModel.length;
  }
}

/**
 * Enumeration of the types of <code>RowSorterEvent</code>s.
 *
 * @since 1.6
 */
export class RowSorterEvent$Type extends JEnum {
  static SORT_ORDER_CHANGED: RowSorterEvent$Type = null;
  static SORTED: RowSorterEvent$Type = null;
  static $VALUES: RowSorterEvent$Type[] = null;
  _RowSorterEvent$Type($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): RowSorterEvent$Type[] { return RowSorterEvent$Type.$VALUES.slice(); }
  static valueOf(name: string): RowSorterEvent$Type { return $J.enumValueOf(RowSorterEvent$Type, name); }
  static $clinit() {
    RowSorterEvent$Type.SORT_ORDER_CHANGED = new RowSorterEvent$Type()._RowSorterEvent$Type('SORT_ORDER_CHANGED', 0);
    RowSorterEvent$Type.SORTED = new RowSorterEvent$Type()._RowSorterEvent$Type('SORTED', 1);
    RowSorterEvent$Type.$VALUES = [RowSorterEvent$Type.SORT_ORDER_CHANGED, RowSorterEvent$Type.SORTED];
  }
}

$J.define(RowSorterEvent, 'javax.swing.event.RowSorterEvent', { kind: 'class', sup: 'java.util.EventObject', ctors: { 'javax.swing.RowSorter,javax.swing.event.RowSorterEvent$Type,int[]': '_RowSorterEvent$RowSorter$Type$intArr', 'javax.swing.RowSorter': '_RowSorterEvent$RowSorter' } });
$J.define(RowSorterEvent$Type, 'javax.swing.event.RowSorterEvent$Type', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_RowSorterEvent$Type' }, clinit: true, lazy: ['$VALUES', 'SORT_ORDER_CHANGED', 'SORTED'] });
