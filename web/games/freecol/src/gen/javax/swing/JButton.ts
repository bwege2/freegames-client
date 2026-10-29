// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JButton.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../jre/index.ts';
import { AbstractButton } from './AbstractButton.ts';
import { AbstractButton$AccessibleAbstractButton } from './AbstractButton.ts';

let DefaultButtonModel, SwingUtilities, UIManager;

/**
 * An implementation of a "push" button.
 * <p>
 * Buttons can be configured, and to some degree controlled, by
 * <code><a href="Action.html">Action</a></code>s.  Using an
 * <code>Action</code> with a button has many benefits beyond directly
 * configuring a button.  Refer to <a href="Action.html#buttonActions">
 * Swing Components Supporting <code>Action</code></a> for more
 * details, and you can find more information in <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/misc/action.html">How
 * to Use Actions</a>, a section in <em>The Java Tutorial</em>.
 * <p>
 * See <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/button.html">How to Use Buttons, Check Boxes, and Radio Buttons</a>
 * in <em>The Java Tutorial</em>
 * for information and examples of using buttons.
 * <p>
 * <strong>Warning:</strong> Swing is not thread safe. For more
 * information see <a
 * href="package-summary.html#threading">Swing's Threading
 * Policy</a>.
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
 * @author Jeff Dinkins
 * @since 1.2
 */
export class JButton extends AbstractButton {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'ButtonUI';
  /**
   * Creates a button with no set text or icon.
   */
  _JButton$(): this {
    this._JButton$String$Icon(null, null);
    return this;
  }
  /**
   * Creates a button with an icon.
   *
   * @param icon  the Icon image to display on the button
   */
  _JButton$Icon(icon: Icon): this {
    this._JButton$String$Icon(null, icon);
    return this;
  }
  /**
   * Creates a button with text.
   *
   * @param text  the text of the button
   */
  _JButton$String(text: string): this {
    this._JButton$String$Icon(text, null);
    return this;
  }
  /**
   * Creates a button where properties are taken from the
   * <code>Action</code> supplied.
   *
   * @param a the <code>Action</code> used to specify the new button
   *
   * @since 1.3
   */
  _JButton$Action(a: Action): this {
    this._JButton$();
    this.setAction(a);
    return this;
  }
  /**
   * Creates a button with initial text and an icon.
   *
   * @param text  the text of the button
   * @param icon  the Icon image to display on the button
   */
  _JButton$String$Icon(text: string, icon: Icon): this {
    this._AbstractButton();
    this.setModel(new DefaultButtonModel()._DefaultButtonModel());
    this.init(text, icon);
    return this;
  }
  /**
   * Resets the UI property to a value from the current look and
   * feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$ButtonUI(UIManager.getUI(this));
  }
  /**
   * Returns a string that specifies the name of the L&amp;F class
   * that renders this component.
   *
   * @return the string "ButtonUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JButton.uiClassID;
  }
  /**
   * Gets the value of the <code>defaultButton</code> property,
   * which if <code>true</code> means that this button is the current
   * default button for its <code>JRootPane</code>.
   * Most look and feels render the default button
   * differently, and may potentially provide bindings
   * to access the default button.
   *
   * @return the value of the <code>defaultButton</code> property
   * @see JRootPane#setDefaultButton
   * @see #isDefaultCapable
   */
  isDefaultButton(): boolean {
    let root = SwingUtilities.getRootPane(this);
    if (root != null) {
      return root.getDefaultButton() === this;
    }
    return false;
  }
  /**
   * Gets the value of the <code>defaultCapable</code> property.
   *
   * @return the value of the <code>defaultCapable</code> property
   * @see #setDefaultCapable
   * @see #isDefaultButton
   * @see JRootPane#setDefaultButton
   */
  isDefaultCapable(): boolean {
    return this.defaultCapable;
  }
  /**
   * Overrides <code>JComponent.removeNotify</code> to check if
   * this button is currently set as the default button on the
   * <code>RootPane</code>, and if so, sets the <code>RootPane</code>'s
   * default button to <code>null</code> to ensure the
   * <code>RootPane</code> doesn't hold onto an invalid button reference.
   */
  removeNotify(): void {
    let root = SwingUtilities.getRootPane(this);
    if (root != null && root.getDefaultButton() === this) {
      root.setDefaultButton(null);
    }
    super.removeNotify();
  }
  /**
   * Returns a string representation of this <code>JButton</code>.
   * This method is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JButton</code>
   */
  paramString(): string {
    let defaultCapableString = (this.defaultCapable ? 'true' : 'false');
    return super.paramString() + ',defaultCapable=' + defaultCapableString;
  }
  /**
   * Gets the <code>AccessibleContext</code> associated with this
   * <code>JButton</code>. For <code>JButton</code>s,
   * the <code>AccessibleContext</code> takes the form of an
   * <code>AccessibleJButton</code>.
   * A new <code>AccessibleJButton</code> instance is created if necessary.
   *
   * @return an <code>AccessibleJButton</code> that serves as the
   *         <code>AccessibleContext</code> of this <code>JButton</code>
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JButton$AccessibleJButton().$o(this)._JButton$AccessibleJButton();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JButton</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to button user-interface
 * elements.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class JButton$AccessibleJButton extends AbstractButton$AccessibleAbstractButton {
  /**
   * Constructs an {@code AccessibleJButton}.
   */
  _JButton$AccessibleJButton(): this {
    this._AbstractButton$AccessibleAbstractButton();
    return this;
  }
}

$J.define(JButton, 'javax.swing.JButton', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.AbstractButton', ctors: { 'java.lang.String,javax.swing.Icon': '_JButton$String$Icon', 'javax.swing.Action': '_JButton$Action', 'java.lang.String': '_JButton$String', 'javax.swing.Icon': '_JButton$Icon', '': '_JButton$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JButton' } });
$J.define(JButton$AccessibleJButton, 'javax.swing.JButton$AccessibleJButton', { kind: 'class', sup: 'javax.swing.AbstractButton$AccessibleAbstractButton', ctors: { '': '_JButton$AccessibleJButton' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  DefaultButtonModel = $J.load('javax.swing.DefaultButtonModel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
});
