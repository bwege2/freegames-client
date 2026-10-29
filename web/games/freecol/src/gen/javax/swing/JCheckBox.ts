// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JCheckBox.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * An implementation of a check box -- an item that can be selected or
 * deselected, and which displays its state to the user.
 * By convention, any number of check boxes in a group can be selected.
 * See <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/button.html">How to Use Buttons, Check Boxes, and Radio Buttons</a>
 * in <em>The Java Tutorial</em>
 * for examples and information on using check boxes.
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
 * @see JRadioButton
 *
 * @author Jeff Dinkins
 * @since 1.2
 */
export class JCheckBox extends JToggleButton {
  /**
   * Identifies a change to the flat property.
   */
  static readonly BORDER_PAINTED_FLAT_CHANGED_PROPERTY: string = 'borderPaintedFlat';
  flat: boolean = false;
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'CheckBoxUI';
  $init_JCheckBox() {
    this.flat = false;
  }
  /**
   * Creates an initially unselected check box button with no text, no icon.
   */
  _JCheckBox$(): this {
    this._JCheckBox$String$Icon$boolean(null, null, false);
    return this;
  }
  /**
   * Creates an initially unselected check box with text.
   *
   * @param text the text of the check box.
   */
  _JCheckBox$String(text: string): this {
    this._JCheckBox$String$Icon$boolean(text, null, false);
    return this;
  }
  /**
   * Creates a check box with text and specifies whether
   * or not it is initially selected.
   *
   * @param text the text of the check box.
   * @param selected a boolean value indicating the initial selection
   *        state. If <code>true</code> the check box is selected
   */
  _JCheckBox$String$boolean(text: string, selected: boolean): this {
    this._JCheckBox$String$Icon$boolean(text, null, selected);
    return this;
  }
  /**
   * Creates a check box with text and icon,
   * and specifies whether or not it is initially selected.
   *
   * @param text the text of the check box.
   * @param icon  the Icon image to display
   * @param selected a boolean value indicating the initial selection
   *        state. If <code>true</code> the check box is selected
   */
  _JCheckBox$String$Icon$boolean(text: string, icon: Icon, selected: boolean): this {
    this._JToggleButton$String$Icon$boolean(text, icon, selected);
    this.$init_JCheckBox();
    this.setUIProperty('borderPainted', false);
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
   * Returns a string that specifies the name of the L&amp;F class
   * that renders this component.
   *
   * @return the string "CheckBoxUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JCheckBox.uiClassID;
  }
  /**
   * The icon for checkboxes comes from the look and feel,
   * not the Action; this is overridden to do nothing.
   */
  setIconFromAction(a: Action): void {
  }
  /**
   * Returns a string representation of this JCheckBox. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   * specific new aspects of the JFC components.
   *
   * @return  a string representation of this JCheckBox.
   */
  paramString(): string {
    return super.paramString();
  }
  /**
   * Gets the AccessibleContext associated with this JCheckBox.
   * For JCheckBoxes, the AccessibleContext takes the form of an
   * AccessibleJCheckBox.
   * A new AccessibleJCheckBox instance is created if necessary.
   *
   * @return an AccessibleJCheckBox that serves as the
   *         AccessibleContext of this JCheckBox
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JCheckBox$AccessibleJCheckBox().$o(this)._JCheckBox$AccessibleJCheckBox();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JCheckBox</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to check box user-interface
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
export class JCheckBox$AccessibleJCheckBox extends JToggleButton$AccessibleJToggleButton {
  /**
   * Constructs an {@code AccessibleJCheckBox}.
   */
  _JCheckBox$AccessibleJCheckBox(): this {
    this._JToggleButton$AccessibleJToggleButton();
    return this;
  }
}

$J.define(JCheckBox, 'javax.swing.JCheckBox', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JToggleButton', ctors: { 'java.lang.String,javax.swing.Icon,boolean': '_JCheckBox$String$Icon$boolean', 'java.lang.String,javax.swing.Icon': '_JCheckBox$String$Icon', 'java.lang.String,boolean': '_JCheckBox$String$boolean', 'javax.swing.Action': '_JCheckBox$Action', 'java.lang.String': '_JCheckBox$String', 'javax.swing.Icon,boolean': '_JCheckBox$Icon$boolean', 'javax.swing.Icon': '_JCheckBox$Icon', '': '_JCheckBox$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$JCheckBox', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JCheckBox' } });
$J.define(JCheckBox$AccessibleJCheckBox, 'javax.swing.JCheckBox$AccessibleJCheckBox', { kind: 'class', sup: 'javax.swing.JToggleButton$AccessibleJToggleButton', ctors: { '': '_JCheckBox$AccessibleJCheckBox' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  SwingConstants = $J.load('javax.swing.SwingConstants');
  UIManager = $J.load('javax.swing.UIManager');
});
