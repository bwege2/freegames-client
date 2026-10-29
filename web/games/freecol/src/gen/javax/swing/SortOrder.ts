// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/SortOrder.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JEnum } from '../../../jre/index.ts';

/**
 * SortOrder is an enumeration of the possible sort orderings.
 *
 * @see RowSorter
 * @since 1.6
 */
export class SortOrder extends JEnum {
  static ASCENDING: SortOrder = null;
  static DESCENDING: SortOrder = null;
  static UNSORTED: SortOrder = null;
  static $VALUES: SortOrder[] = null;
  _SortOrder($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): SortOrder[] { return SortOrder.$VALUES.slice(); }
  static valueOf(name: string): SortOrder { return $J.enumValueOf(SortOrder, name); }
  static $clinit() {
    SortOrder.ASCENDING = new SortOrder()._SortOrder('ASCENDING', 0);
    SortOrder.DESCENDING = new SortOrder()._SortOrder('DESCENDING', 1);
    SortOrder.UNSORTED = new SortOrder()._SortOrder('UNSORTED', 2);
    SortOrder.$VALUES = [SortOrder.ASCENDING, SortOrder.DESCENDING, SortOrder.UNSORTED];
  }
}

$J.define(SortOrder, 'javax.swing.SortOrder', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_SortOrder' }, clinit: true, lazy: ['$VALUES', 'ASCENDING', 'DESCENDING', 'UNSORTED'] });
