// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalLabelUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, JObject } from '../../../../../jre/index.ts';
import { BasicLabelUI } from '../basic/BasicLabelUI.ts';

let UIManager, SwingUtilities2;

/**
 * A Windows L&amp;F implementation of LabelUI.  This implementation
 * is completely static, i.e. there's only one UIView implementation
 * that's shared by all JLabel objects.
 *
 * @author Hans Muller
 */
export class MetalLabelUI extends BasicLabelUI {
  /**
   * The default <code>MetalLabelUI</code> instance. This field might
   * not be used. To change the default instance use a subclass which
   * overrides the <code>createUI</code> method, and place that class
   * name in defaults table under the key "LabelUI".
   */
  static metalLabelUI: MetalLabelUI = null;
  static METAL_LABEL_UI_KEY: any = null;
  /**
   * Constructs a {@code MetalLabelUI}.
   */
  _MetalLabelUI(): this {
    this._BasicLabelUI();
    return this;
  }
  /**
   * Returns an instance of {@code MetalLabelUI}.
   *
   * @param c a component
   * @return an instance of {@code MetalLabelUI}
   */
  static createUI(c: JComponent): ComponentUI {
    if ($J.system_getSecurityManager() != null) {
      let appContext = AppContext.getAppContext();
      let safeMetalLabelUI = appContext.get(MetalLabelUI.METAL_LABEL_UI_KEY);
      if (safeMetalLabelUI == null) {
        safeMetalLabelUI = new MetalLabelUI()._MetalLabelUI();
        appContext.put(MetalLabelUI.METAL_LABEL_UI_KEY, safeMetalLabelUI);
      }
      return safeMetalLabelUI;
    }
    return MetalLabelUI.metalLabelUI;
  }
  /**
   * Just paint the text gray (Label.disabledForeground) rather than
   * in the labels foreground color.
   *
   * @see #paint
   * @see #paintEnabledText
   */
  paintDisabledText(l: JLabel, g: Graphics, s: string, textX: number, textY: number): void {
    let mnemIndex = l.getDisplayedMnemonicIndex();
    g.setColor(UIManager.getColor$Object('Label.disabledForeground'));
    SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(l, g, s, mnemIndex, textX, textY);
  }
  static $clinit() {
    MetalLabelUI.metalLabelUI = new MetalLabelUI()._MetalLabelUI();
    MetalLabelUI.METAL_LABEL_UI_KEY = new JObject();
  }
}

$J.define(MetalLabelUI, 'javax.swing.plaf.metal.MetalLabelUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicLabelUI', ctors: { '': '_MetalLabelUI' }, clinit: true, lazy: ['metalLabelUI', 'METAL_LABEL_UI_KEY'] });
$J.module(() => {
  UIManager = $J.load('javax.swing.UIManager');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
