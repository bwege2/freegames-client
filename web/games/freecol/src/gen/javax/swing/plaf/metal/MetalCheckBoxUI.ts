// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalCheckBoxUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AppContext, JObject } from '../../../../../jre/index.ts';
import { MetalRadioButtonUI } from './MetalRadioButtonUI.ts';

let UIManager;

/**
 * CheckboxUI implementation for MetalCheckboxUI
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author Michael C. Albers
 */
export class MetalCheckBoxUI extends MetalRadioButtonUI {
  static METAL_CHECK_BOX_UI_KEY: any = null;
  static readonly propertyPrefix: string = 'CheckBox.';
  defaults_initialized$MetalCheckBoxUI: boolean = false;
  /**
   * Constructs a {@code MetalCheckBoxUI}.
   */
  _MetalCheckBoxUI(): this {
    this._MetalRadioButtonUI();
    this.defaults_initialized$MetalCheckBoxUI = false;
    return this;
  }
  /**
   * Returns an instance of {@code MetalCheckBoxUI}.
   *
   * @param b a component
   * @return a new instance of {@code MetalCheckBoxUI}
   */
  static createUI(b: JComponent): ComponentUI {
    let appContext = AppContext.getAppContext();
    let checkboxUI = appContext.get(MetalCheckBoxUI.METAL_CHECK_BOX_UI_KEY);
    if (checkboxUI == null) {
      checkboxUI = new MetalCheckBoxUI()._MetalCheckBoxUI();
      appContext.put(MetalCheckBoxUI.METAL_CHECK_BOX_UI_KEY, checkboxUI);
    }
    return checkboxUI;
  }
  getPropertyPrefix(): string {
    return MetalCheckBoxUI.propertyPrefix;
  }
  installDefaults(b: AbstractButton): void {
    super.installDefaults(b);
    if (!this.defaults_initialized$MetalCheckBoxUI) {
      this.icon = UIManager.getIcon$Object(this.getPropertyPrefix() + 'icon');
      this.defaults_initialized$MetalCheckBoxUI = true;
    }
  }
  uninstallDefaults(b: AbstractButton): void {
    super.uninstallDefaults(b);
    this.defaults_initialized$MetalCheckBoxUI = false;
  }
  static $clinit() {
    MetalCheckBoxUI.METAL_CHECK_BOX_UI_KEY = new JObject();
  }
}

$J.define(MetalCheckBoxUI, 'javax.swing.plaf.metal.MetalCheckBoxUI', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalRadioButtonUI', ctors: { '': '_MetalCheckBoxUI' }, clinit: true, lazy: ['METAL_CHECK_BOX_UI_KEY'] });
$J.module(() => {
  UIManager = $J.load('javax.swing.UIManager');
});
