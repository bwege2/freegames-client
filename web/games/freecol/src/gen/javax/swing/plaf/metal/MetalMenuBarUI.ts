// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalMenuBarUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2003, 2005, Oracle and/or its affiliates. All rights reserved.
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
import { $J, NullPointerException } from '../../../../../jre/index.ts';
import { BasicMenuBarUI } from '../basic/BasicMenuBarUI.ts';

let JToolBar, UIManager, UIResource, MetalToolBarUI, MetalUtils;

/**
 * Metal implementation of <code>MenuBarUI</code>. This class is responsible
 * for providing the metal look and feel for <code>JMenuBar</code>s.
 *
 * @see javax.swing.plaf.MenuBarUI
 * @since 1.5
 */
export class MetalMenuBarUI extends BasicMenuBarUI {
  /**
   * Constructs a {@code MetalMenuBarUI}.
   */
  _MetalMenuBarUI(): this {
    this._BasicMenuBarUI();
    return this;
  }
  /**
   * Creates the <code>ComponentUI</code> implementation for the passed
   * in component.
   *
   * @param x JComponent to create the ComponentUI implementation for
   * @return ComponentUI implementation for <code>x</code>
   * @throws NullPointerException if <code>x</code> is null
   */
  static createUI(x: JComponent): ComponentUI {
    if (x == null) {
      throw new NullPointerException('Must pass in a non-null component');
    }
    return new MetalMenuBarUI()._MetalMenuBarUI();
  }
  /**
   * Configures the specified component appropriate for the metal look and
   * feel.
   *
   * @param c the component where this UI delegate is being installed
   * @throws NullPointerException if <code>c</code> is null.
   */
  installUI(c: JComponent): void {
    super.installUI(c);
    MetalToolBarUI.register(c);
  }
  /**
   * Reverses configuration which was done on the specified component during
   * <code>installUI</code>.
   *
   * @param c the component where this UI delegate is being installed
   * @throws NullPointerException if <code>c</code> is null.
   */
  uninstallUI(c: JComponent): void {
    super.uninstallUI(c);
    MetalToolBarUI.unregister(c);
  }
  /**
   * If necessary paints the background of the component, then
   * invokes <code>paint</code>.
   *
   * @param g Graphics to paint to
   * @param c JComponent painting on
   * @throws NullPointerException if <code>g</code> or <code>c</code> is
   *         null
   * @see javax.swing.plaf.ComponentUI#update
   * @see javax.swing.plaf.ComponentUI#paint
   * @since 1.5
   */
  update(g: Graphics, c: JComponent): void {
    let isOpaque = c.isOpaque();
    if (g == null) {
      throw new NullPointerException('Graphics must be non-null');
    }
    if (isOpaque && ($J.isa(c.getBackground(), UIResource)) && UIManager.get$Object('MenuBar.gradient') != null) {
      if (MetalToolBarUI.doesMenuBarBorderToolBar(c)) {
        let tb = MetalToolBarUI.findRegisteredComponentOfType(c, $J.cls(JToolBar));
        if (tb.isOpaque() && $J.isa(tb.getBackground(), UIResource)) {
          MetalUtils.drawGradient(c, g, 'MenuBar.gradient', 0, 0, c.getWidth(), (c.getHeight() + tb.getHeight()) | 0, true);
          this.paint(g, c);
          return;
        }
      }
      MetalUtils.drawGradient(c, g, 'MenuBar.gradient', 0, 0, c.getWidth(), c.getHeight(), true);
      this.paint(g, c);
    } else {
      super.update(g, c);
    }
  }
}

$J.define(MetalMenuBarUI, 'javax.swing.plaf.metal.MetalMenuBarUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicMenuBarUI', ctors: { '': '_MetalMenuBarUI' } });
$J.module(() => {
  JToolBar = $J.load('javax.swing.JToolBar');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  MetalToolBarUI = $J.load('javax.swing.plaf.metal.MetalToolBarUI');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
});
