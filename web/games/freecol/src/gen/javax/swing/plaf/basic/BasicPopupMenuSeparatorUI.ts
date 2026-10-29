// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicPopupMenuSeparatorUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../../jre/index.ts';
import { BasicSeparatorUI } from './BasicSeparatorUI.ts';

let Dimension;

/**
 * A Basic L&amp;F implementation of PopupMenuSeparatorUI.  This implementation
 * is a "combined" view/controller.
 *
 * @author Jeff Shapiro
 */
export class BasicPopupMenuSeparatorUI extends BasicSeparatorUI {
  /**
   * Constructs a {@code BasicPopupMenuSeparatorUI}.
   */
  _BasicPopupMenuSeparatorUI(): this {
    this._BasicSeparatorUI();
    return this;
  }
  /**
   * Returns a new instance of {@code BasicPopupMenuSeparatorUI}.
   *
   * @param c a component
   * @return a new instance of {@code BasicPopupMenuSeparatorUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicPopupMenuSeparatorUI()._BasicPopupMenuSeparatorUI();
  }
  paint(g: Graphics, c: JComponent): void {
    let s = c.getSize$();
    g.setColor(c.getForeground());
    g.drawLine(0, 0, s.width_, 0);
    g.setColor(c.getBackground());
    g.drawLine(0, 1, s.width_, 1);
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    return new Dimension()._Dimension$int$int(0, 2);
  }
}

$J.define(BasicPopupMenuSeparatorUI, 'javax.swing.plaf.basic.BasicPopupMenuSeparatorUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicSeparatorUI', ctors: { '': '_BasicPopupMenuSeparatorUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
});
