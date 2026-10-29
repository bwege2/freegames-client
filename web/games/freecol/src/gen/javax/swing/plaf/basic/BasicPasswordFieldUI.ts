// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicPasswordFieldUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2025, Oracle and/or its affiliates. All rights reserved.
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
import { BasicTextFieldUI } from './BasicTextFieldUI.ts';

let LookAndFeel, UIManager, PasswordView;

/**
 * Provides the Windows look and feel for a password field.
 * The only difference from the standard text field is that
 * the view of the text is simply a string of the echo
 * character as specified in JPasswordField, rather than the
 * real text contained in the field.
 *
 * @author  Timothy Prinzing
 */
export class BasicPasswordFieldUI extends BasicTextFieldUI {
  /**
   * Constructs a {@code BasicPasswordFieldUI}.
   */
  _BasicPasswordFieldUI(): this {
    this._BasicTextFieldUI();
    return this;
  }
  /**
   * Creates a UI for a JPasswordField.
   *
   * @param c the JPasswordField
   * @return the UI
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicPasswordFieldUI()._BasicPasswordFieldUI();
  }
  /**
   * Fetches the name used as a key to look up properties through the
   * UIManager.  This is used as a prefix to all the standard
   * text properties.
   *
   * @return the name ("PasswordField")
   */
  getPropertyPrefix(): string {
    return 'PasswordField';
  }
  /**
   * Installs the necessary properties on the JPasswordField.
   * @since 1.6
   */
  installDefaults(): void {
    super.installDefaults();
    let prefix = this.getPropertyPrefix();
    let echoChar = UIManager.getDefaults().get(prefix + '.echoChar');
    if (echoChar != null) {
      LookAndFeel.installProperty(this.getComponent(), 'echoChar', echoChar);
    }
  }
  /**
   * Creates a view (PasswordView) for an element.
   *
   * @param elem the element
   * @return the view
   */
  create(elem: Element): View {
    return new PasswordView()._PasswordView(elem);
  }
}

$J.define(BasicPasswordFieldUI, 'javax.swing.plaf.basic.BasicPasswordFieldUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicTextFieldUI', ctors: { '': '_BasicPasswordFieldUI' } });
$J.module(() => {
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  UIManager = $J.load('javax.swing.UIManager');
  PasswordView = $J.load('javax.swing.text.PasswordView');
});
