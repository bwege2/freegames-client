// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DropMode.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * Drop modes, used to determine the method by which a component
 * tracks and indicates a drop location during drag and drop.
 *
 * @author Shannon Hickey
 * @see JTable#setDropMode
 * @see JList#setDropMode
 * @see JTree#setDropMode
 * @see javax.swing.text.JTextComponent#setDropMode
 * @since 1.6
 */
export class DropMode extends JEnum {
  static USE_SELECTION: DropMode = null;
  static ON: DropMode = null;
  static INSERT: DropMode = null;
  static INSERT_ROWS: DropMode = null;
  static INSERT_COLS: DropMode = null;
  static ON_OR_INSERT: DropMode = null;
  static ON_OR_INSERT_ROWS: DropMode = null;
  static ON_OR_INSERT_COLS: DropMode = null;
  static $VALUES: DropMode[] = null;
  _DropMode($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): DropMode[] { return DropMode.$VALUES.slice(); }
  static valueOf(name: string): DropMode { return $J.enumValueOf(DropMode, name); }
  static $clinit() {
    DropMode.USE_SELECTION = new DropMode()._DropMode('USE_SELECTION', 0);
    DropMode.ON = new DropMode()._DropMode('ON', 1);
    DropMode.INSERT = new DropMode()._DropMode('INSERT', 2);
    DropMode.INSERT_ROWS = new DropMode()._DropMode('INSERT_ROWS', 3);
    DropMode.INSERT_COLS = new DropMode()._DropMode('INSERT_COLS', 4);
    DropMode.ON_OR_INSERT = new DropMode()._DropMode('ON_OR_INSERT', 5);
    DropMode.ON_OR_INSERT_ROWS = new DropMode()._DropMode('ON_OR_INSERT_ROWS', 6);
    DropMode.ON_OR_INSERT_COLS = new DropMode()._DropMode('ON_OR_INSERT_COLS', 7);
    DropMode.$VALUES = [DropMode.USE_SELECTION, DropMode.ON, DropMode.INSERT, DropMode.INSERT_ROWS, DropMode.INSERT_COLS, DropMode.ON_OR_INSERT, DropMode.ON_OR_INSERT_ROWS, DropMode.ON_OR_INSERT_COLS];
  }
}

$J.define(DropMode, 'javax.swing.DropMode', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_DropMode' }, clinit: true, lazy: ['$VALUES', 'USE_SELECTION', 'ON', 'INSERT', 'INSERT_ROWS', 'INSERT_COLS', 'ON_OR_INSERT', 'ON_OR_INSERT_ROWS', 'ON_OR_INSERT_COLS'] });
