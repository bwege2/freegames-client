// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicPanelUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { PanelUI } from '../PanelUI.ts';

let Component$BaselineResizeBehavior, LookAndFeel, AbstractBorder;

/**
 * BasicPanel implementation
 *
 * @author Steve Wilson
 */
export class BasicPanelUI extends PanelUI {
  static panelUI: PanelUI = null;
  /**
   * Constructs a {@code BasicPanelUI}.
   */
  _BasicPanelUI(): this {
    this._PanelUI();
    return this;
  }
  /**
   * Returns an instance of {@code BasicPanelUI}.
   *
   * @param c a component
   * @return an instance of {@code BasicPanelUI}
   */
  static createUI(c: JComponent): ComponentUI {
    if (BasicPanelUI.panelUI == null) {
      BasicPanelUI.panelUI = new BasicPanelUI()._BasicPanelUI();
    }
    return BasicPanelUI.panelUI;
  }
  installUI(c: JComponent): void {
    let p = c;
    super.installUI(p);
    this.installDefaults(p);
  }
  uninstallUI(c: JComponent): void {
    let p = c;
    this.uninstallDefaults(p);
    super.uninstallUI(c);
  }
  /**
   * Method for installing panel properties.
   *
   * @param p an instance of {@code JPanel}
   */
  installDefaults(p: JPanel): void {
    LookAndFeel.installColorsAndFont(p, 'Panel.background', 'Panel.foreground', 'Panel.font');
    LookAndFeel.installBorder(p, 'Panel.border');
    LookAndFeel.installProperty(p, 'opaque', true);
  }
  /**
   * Method for uninstalling panel properties.
   *
   * @param p an instance of {@code JPanel}
   */
  uninstallDefaults(p: JPanel): void {
    LookAndFeel.uninstallBorder(p);
  }
  /**
   * Returns the baseline.
   *
   * @throws NullPointerException {@inheritDoc}
   * @throws IllegalArgumentException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaseline$JComponent$int$int(c: JComponent, width: number, height: number): number {
    super.getBaseline$JComponent$int$int(c, width, height);
    let border = c.getBorder();
    if (border instanceof AbstractBorder) {
      return (border).getBaseline(c, width, height);
    }
    return -1;
  }
  /**
   * Returns an enum indicating how the baseline of the component
   * changes as the size changes.
   *
   * @throws NullPointerException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaselineResizeBehavior(c: JComponent): Component$BaselineResizeBehavior {
    super.getBaselineResizeBehavior(c);
    let border = c.getBorder();
    if (border instanceof AbstractBorder) {
      return (border).getBaselineResizeBehavior(c);
    }
    return Component$BaselineResizeBehavior.OTHER;
  }
}

$J.define(BasicPanelUI, 'javax.swing.plaf.basic.BasicPanelUI', { kind: 'class', sup: 'javax.swing.plaf.PanelUI', ctors: { '': '_BasicPanelUI' }, meths: { 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int' } });
$J.module(() => {
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  AbstractBorder = $J.load('javax.swing.border.AbstractBorder');
});
