// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JRadioButton.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { JToggleButton } from './JToggleButton.ts';
import { JToggleButton$AccessibleJToggleButton } from './JToggleButton.ts';

let SwingConstants, UIManager;

/**
 * An implementation of a radio button -- an item that can be selected or
 * deselected, and which displays its state to the user.
 * Used with a {@link ButtonGroup} object to create a group of buttons
 * in which only one button at a time can be selected. (Create a ButtonGroup
 * object and use its <code>add</code> method to include the JRadioButton objects
 * in the group.)
 * <blockquote>
 * <strong>Note:</strong>
 * The ButtonGroup object is a logical grouping -- not a physical grouping.
 * To create a button panel, you should still create a {@link JPanel} or similar
 * container-object and add a {@link javax.swing.border.Border} to it to set it off from surrounding
 * components.
 * </blockquote>
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
 * for further documentation.
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
 * @see ButtonGroup
 * @see JCheckBox
 * @author Jeff Dinkins
 * @since 1.2
 */
export class JRadioButton extends JToggleButton {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'RadioButtonUI';
  /**
   * Creates an initially unselected radio button
   * with no set text.
   */
  _JRadioButton$(): this {
    this._JRadioButton$String$Icon$boolean(null, null, false);
    return this;
  }
  /**
   * Creates an unselected radio button with the specified text.
   *
   * @param text  the string displayed on the radio button
   */
  _JRadioButton$String(text: string): this {
    this._JRadioButton$String$Icon$boolean(text, null, false);
    return this;
  }
  /**
   * Creates a radio button with the specified text
   * and selection state.
   *
   * @param text  the string displayed on the radio button
   * @param selected  if true, the button is initially selected;
   *                  otherwise, the button is initially unselected
   */
  _JRadioButton$String$boolean(text: string, selected: boolean): this {
    this._JRadioButton$String$Icon$boolean(text, null, selected);
    return this;
  }
  /**
   * Creates a radio button that has the specified text, image,
   * and selection state.
   *
   * @param text  the string displayed on the radio button
   * @param icon  the image that the button should display
   * @param selected if {@code true}, the button is initially selected
   *                 otherwise, the button is initially unselected
   */
  _JRadioButton$String$Icon$boolean(text: string, icon: Icon, selected: boolean): this {
    this._JToggleButton$String$Icon$boolean(text, icon, selected);
    this.setBorderPainted(false);
    this.setHorizontalAlignment(SwingConstants.LEADING);
    return this;
  }
  /**
   * Resets the UI property to a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$ButtonUI(UIManager.getUI(this));
  }
  /**
   * Returns the name of the L&amp;F class
   * that renders this component.
   *
   * @return the string "RadioButtonUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JRadioButton.uiClassID;
  }
  /**
   * The icon for radio buttons comes from the look and feel,
   * not the Action.
   */
  setIconFromAction(a: Action): void {
  }
  /**
   * Returns a string representation of this JRadioButton. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this JRadioButton.
   */
  paramString(): string {
    return super.paramString();
  }
  /**
   * Gets the AccessibleContext associated with this JRadioButton.
   * For JRadioButtons, the AccessibleContext takes the form of an
   * AccessibleJRadioButton.
   * A new AccessibleJRadioButton instance is created if necessary.
   *
   * @return an AccessibleJRadioButton that serves as the
   *         AccessibleContext of this JRadioButton
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JRadioButton$AccessibleJRadioButton().$o(this)._JRadioButton$AccessibleJRadioButton();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JRadioButton</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to radio button
 * user-interface elements.
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
export class JRadioButton$AccessibleJRadioButton extends JToggleButton$AccessibleJToggleButton {
  /**
   * Constructs an {@code AccessibleJRadioButton}.
   */
  _JRadioButton$AccessibleJRadioButton(): this {
    this._JToggleButton$AccessibleJToggleButton();
    return this;
  }
}

$J.define(JRadioButton, 'javax.swing.JRadioButton', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JToggleButton', ctors: { 'java.lang.String,javax.swing.Icon,boolean': '_JRadioButton$String$Icon$boolean', 'java.lang.String,javax.swing.Icon': '_JRadioButton$String$Icon', 'java.lang.String,boolean': '_JRadioButton$String$boolean', 'java.lang.String': '_JRadioButton$String', 'javax.swing.Icon,boolean': '_JRadioButton$Icon$boolean', 'javax.swing.Action': '_JRadioButton$Action', 'javax.swing.Icon': '_JRadioButton$Icon', '': '_JRadioButton$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JRadioButton' } });
$J.define(JRadioButton$AccessibleJRadioButton, 'javax.swing.JRadioButton$AccessibleJRadioButton', { kind: 'class', sup: 'javax.swing.JToggleButton$AccessibleJToggleButton', ctors: { '': '_JRadioButton$AccessibleJRadioButton' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  SwingConstants = $J.load('javax.swing.SwingConstants');
  UIManager = $J.load('javax.swing.UIManager');
});
