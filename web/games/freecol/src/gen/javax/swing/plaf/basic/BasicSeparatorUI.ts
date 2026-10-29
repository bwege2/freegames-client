// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicSeparatorUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { SeparatorUI } from '../SeparatorUI.ts';

let Dimension, LookAndFeel, SwingConstants;

/**
 * A Basic L&amp;F implementation of SeparatorUI.  This implementation
 * is a "combined" view/controller.
 *
 * @author Georges Saab
 * @author Jeff Shapiro
 */
export class BasicSeparatorUI extends SeparatorUI {
  /**
   * The color of the shadow.
   */
  shadow: Color = null;
  /**
   * The color of the highlighting.
   */
  highlight: Color = null;
  /**
   * Constructs a {@code BasicSeparatorUI}.
   */
  _BasicSeparatorUI(): this {
    this._SeparatorUI();
    return this;
  }
  /**
   * Returns a new instance of {@code BasicSeparatorUI}.
   *
   * @param c a component
   * @return a new instance of {@code BasicSeparatorUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicSeparatorUI()._BasicSeparatorUI();
  }
  installUI(c: JComponent): void {
    this.installDefaults(c);
    this.installListeners(c);
  }
  uninstallUI(c: JComponent): void {
    this.uninstallDefaults(c);
    this.uninstallListeners(c);
  }
  /**
   * Installs default properties.
   *
   * @param s an instance of {@code JSeparator}
   */
  installDefaults(s: JSeparator): void {
    LookAndFeel.installColors(s, 'Separator.background', 'Separator.foreground');
    LookAndFeel.installProperty(s, 'opaque', false);
  }
  /**
   * Uninstalls default properties.
   *
   * @param s an instance of {@code JSeparator}
   */
  uninstallDefaults(s: JSeparator): void {
  }
  /**
   * Registers listeners.
   *
   * @param s an instance of {@code JSeparator}
   */
  installListeners(s: JSeparator): void {
  }
  /**
   * Unregisters listeners.
   *
   * @param s an instance of {@code JSeparator}
   */
  uninstallListeners(s: JSeparator): void {
  }
  paint(g: Graphics, c: JComponent): void {
    let s = c.getSize$();
    if ((c).getOrientation() === SwingConstants.VERTICAL) {
      g.setColor(c.getForeground());
      g.drawLine(0, 0, 0, s.height_);
      g.setColor(c.getBackground());
      g.drawLine(1, 0, 1, s.height_);
    } else {
      g.setColor(c.getForeground());
      g.drawLine(0, 0, s.width_, 0);
      g.setColor(c.getBackground());
      g.drawLine(0, 1, s.width_, 1);
    }
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    if ((c).getOrientation() === SwingConstants.VERTICAL) {
      return new Dimension()._Dimension$int$int(2, 0);
    } else {
      return new Dimension()._Dimension$int$int(0, 2);
    }
  }
  getMinimumSize(c: JComponent): Dimension {
    return null;
  }
  getMaximumSize(c: JComponent): Dimension {
    return null;
  }
}

$J.define(BasicSeparatorUI, 'javax.swing.plaf.basic.BasicSeparatorUI', { kind: 'class', sup: 'javax.swing.plaf.SeparatorUI', ctors: { '': '_BasicSeparatorUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
});
