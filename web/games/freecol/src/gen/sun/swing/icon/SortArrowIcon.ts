// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/icon/SortArrowIcon.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject } from '../../../../jre/index.ts';

let UIManager;

/**
 * Sorting icon.
 */
export class SortArrowIcon extends JObject {
  static readonly ARROW_HEIGHT: number = 5;
  static readonly X_PADDING: number = 7;
  ascending: boolean = false;
  color: Color = null;
  colorKey: string = null;
  /**
   * Creates a <code>SortArrowIcon</code>.
   *
   * @param ascending if true, icon respresenting ascending sort, otherwise
   *        descending
   * @param colorKey the key used to find color in UIManager
   */
  _SortArrowIcon$boolean$String(ascending: boolean, colorKey: string): this {
    this.ascending = ascending;
    this.colorKey = colorKey;
    if (colorKey == null) {
      throw new IllegalArgumentException();
    }
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    g.setColor(this.getColor());
    let startX = (SortArrowIcon.X_PADDING + x + $J.idiv(SortArrowIcon.ARROW_HEIGHT, 2)) | 0;
    if (this.ascending) {
      let startY = y;
      g.fillRect(startX, startY, 1, 1);
      for (let line = 1; line < SortArrowIcon.ARROW_HEIGHT; line++) {
        g.fillRect((startX - line) | 0, (startY + line) | 0, (line + line + 1) | 0, 1);
      }
    } else {
      let startY = (y + SortArrowIcon.ARROW_HEIGHT - 1) | 0;
      g.fillRect(startX, startY, 1, 1);
      for (let line = 1; line < SortArrowIcon.ARROW_HEIGHT; line++) {
        g.fillRect((startX - line) | 0, (startY - line) | 0, (line + line + 1) | 0, 1);
      }
    }
  }
  getIconWidth(): number {
    return (SortArrowIcon.X_PADDING + Math.imul(SortArrowIcon.ARROW_HEIGHT, 2)) | 0;
  }
  getIconHeight(): number {
    return (SortArrowIcon.ARROW_HEIGHT + 2) | 0;
  }
  getColor(): Color {
    if (this.color != null) {
      return this.color;
    }
    return UIManager.getColor$Object(this.colorKey);
  }
}

$J.define(SortArrowIcon, 'sun.swing.icon.SortArrowIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'boolean,java.lang.String': '_SortArrowIcon$boolean$String', 'boolean,java.awt.Color': '_SortArrowIcon$boolean$Color' } });
$J.module(() => {
  UIManager = $J.load('javax.swing.UIManager');
});
