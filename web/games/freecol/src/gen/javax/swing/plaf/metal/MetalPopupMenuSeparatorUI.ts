// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalPopupMenuSeparatorUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2013, Oracle and/or its affiliates. All rights reserved.
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
import { MetalSeparatorUI } from './MetalSeparatorUI.ts';

let Dimension;

/**
 * A Metal L&amp;F implementation of PopupMenuSeparatorUI.  This implementation
 * is a "combined" view/controller.
 *
 * @author Jeff Shapiro
 */
export class MetalPopupMenuSeparatorUI extends MetalSeparatorUI {
  /**
   * Constructs a {@code MetalPopupMenuSeparatorUI}.
   */
  _MetalPopupMenuSeparatorUI(): this {
    this._MetalSeparatorUI();
    return this;
  }
  /**
   * Constructs a new {@code MetalPopupMenuSeparatorUI} instance.
   *
   * @param c a component
   * @return a new {@code MetalPopupMenuSeparatorUI} instance
   */
  static createUI(c: JComponent): ComponentUI {
    return new MetalPopupMenuSeparatorUI()._MetalPopupMenuSeparatorUI();
  }
  paint(g: Graphics, c: JComponent): void {
    let s = c.getSize$();
    g.setColor(c.getForeground());
    g.drawLine(0, 1, s.width_, 1);
    g.setColor(c.getBackground());
    g.drawLine(0, 2, s.width_, 2);
    g.drawLine(0, 0, 0, 0);
    g.drawLine(0, 3, 0, 3);
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    return new Dimension()._Dimension$int$int(0, 4);
  }
}

$J.define(MetalPopupMenuSeparatorUI, 'javax.swing.plaf.metal.MetalPopupMenuSeparatorUI', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalSeparatorUI', ctors: { '': '_MetalPopupMenuSeparatorUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
});
