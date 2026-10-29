// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JRadioButtonMenuItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { JMenuItem } from './JMenuItem.ts';
import { JMenuItem$AccessibleJMenuItem } from './JMenuItem.ts';

let JToggleButton$ToggleButtonModel;

/**
 * An implementation of a radio button menu item.
 * A <code>JRadioButtonMenuItem</code> is
 * a menu item that is part of a group of menu items in which only one
 * item in the group can be selected. The selected item displays its
 * selected state. Selecting it causes any other selected item to
 * switch to the unselected state.
 * To control the selected state of a group of radio button menu items,
 * use a <code>ButtonGroup</code> object.
 * <p>
 * Menu items can be configured, and to some degree controlled, by
 * <code><a href="Action.html">Action</a></code>s.  Using an
 * <code>Action</code> with a menu item has many benefits beyond directly
 * configuring a menu item.  Refer to <a href="Action.html#buttonActions">
 * Swing Components Supporting <code>Action</code></a> for more
 * details, and you can find more information in <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/misc/action.html">How
 * to Use Actions</a>, a section in <em>The Java Tutorial</em>.
 * <p>
 * Some menus can have several button groups with radio button menu items. In
 * this case it is useful that clicking on one radio button menu item does not
 * close the menu. Such behavior can be controlled either by client
 * {@link JComponent#putClientProperty} or the Look and Feel
 * {@link UIManager#put} property named
 * {@code "RadioButtonMenuItem.doNotCloseOnMouseClick"}. The default value is
 * {@code false}. Setting the property to {@code true} prevents the menu from
 * closing when it is clicked by the mouse. If the client property is set its
 * value is always used; otherwise the {@literal L&F} property is queried.
 * Note: some {@code L&F}s may ignore this property. All built-in {@code L&F}s
 * inherit this behaviour.
 * <p>
 * For further documentation and examples see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/menu.html">How to Use Menus</a>,
 * a section in <em>The Java Tutorial.</em>
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
 * @author Georges Saab
 * @author David Karlton
 * @see ButtonGroup
 * @since 1.2
 */
export class JRadioButtonMenuItem extends JMenuItem {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'RadioButtonMenuItemUI';
  /**
   * Creates a <code>JRadioButtonMenuItem</code> with no set text or icon.
   */
  _JRadioButtonMenuItem$(): this {
    this._JRadioButtonMenuItem$String$Icon$boolean(null, null, false);
    return this;
  }
  /**
   * Creates a <code>JRadioButtonMenuItem</code> with text.
   *
   * @param text the text of the <code>JRadioButtonMenuItem</code>
   */
  _JRadioButtonMenuItem$String(text: string): this {
    this._JRadioButtonMenuItem$String$Icon$boolean(text, null, false);
    return this;
  }
  /**
   * Creates a radio button menu item whose properties are taken from the
   * <code>Action</code> supplied.
   *
   * @param  a the <code>Action</code> on which to base the radio
   *          button menu item
   *
   * @since 1.3
   */
  _JRadioButtonMenuItem$Action(a: Action): this {
    this._JRadioButtonMenuItem$();
    this.setAction(a);
    return this;
  }
  /**
   * Creates a radio button menu item with the specified text
   * and selection state.
   *
   * @param text the text of the <code>CheckBoxMenuItem</code>
   * @param selected the selected state of the <code>CheckBoxMenuItem</code>
   */
  _JRadioButtonMenuItem$String$boolean(text: string, selected: boolean): this {
    this._JRadioButtonMenuItem$String(text);
    this.setSelected(selected);
    return this;
  }
  /**
   * Creates a radio button menu item that has the specified
   * text, image, and selection state.  All other constructors
   * defer to this one.
   *
   * @param text  the string displayed on the radio button
   * @param icon  the image that the button should display
   * @param selected if {@code true}, the button is initially selected,
   *                 otherwise, the button is initially unselected
   */
  _JRadioButtonMenuItem$String$Icon$boolean(text: string, icon: Icon, selected: boolean): this {
    this._JMenuItem$String$Icon(text, icon);
    this.setModel(new JToggleButton$ToggleButtonModel()._JToggleButton$ToggleButtonModel());
    this.setSelected(selected);
    this.setFocusable(false);
    return this;
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "RadioButtonMenuItemUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JRadioButtonMenuItem.uiClassID;
  }
  /**
   * Returns a string representation of this
   * <code>JRadioButtonMenuItem</code>.  This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this
   *          <code>JRadioButtonMenuItem</code>
   */
  paramString(): string {
    return super.paramString();
  }
  /**
   * Overridden to return true, JRadioButtonMenuItem supports
   * the selected state.
   */
  shouldUpdateSelectedStateFromAction(): boolean {
    return true;
  }
  /**
   * Gets the AccessibleContext associated with this JRadioButtonMenuItem.
   * For JRadioButtonMenuItems, the AccessibleContext takes the form of an
   * AccessibleJRadioButtonMenuItem.
   * A new AccessibleJRadioButtonMenuItem instance is created if necessary.
   *
   * @return an AccessibleJRadioButtonMenuItem that serves as the
   *         AccessibleContext of this JRadioButtonMenuItem
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JRadioButtonMenuItem$AccessibleJRadioButtonMenuItem().$o(this)._JRadioButtonMenuItem$AccessibleJRadioButtonMenuItem();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JRadioButtonMenuItem</code> class.  It provides an
 * implementation of the Java Accessibility API appropriate to
 * <code>JRadioButtonMenuItem</code> user-interface elements.
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
export class JRadioButtonMenuItem$AccessibleJRadioButtonMenuItem extends JMenuItem$AccessibleJMenuItem {
  /**
   * Constructs an {@code AccessibleJRadioButtonMenuItem}.
   */
  _JRadioButtonMenuItem$AccessibleJRadioButtonMenuItem(): this {
    this._JMenuItem$AccessibleJMenuItem();
    return this;
  }
}

$J.define(JRadioButtonMenuItem, 'javax.swing.JRadioButtonMenuItem', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JMenuItem', ctors: { 'java.lang.String,javax.swing.Icon,boolean': '_JRadioButtonMenuItem$String$Icon$boolean', 'javax.swing.Icon,boolean': '_JRadioButtonMenuItem$Icon$boolean', 'java.lang.String,boolean': '_JRadioButtonMenuItem$String$boolean', 'java.lang.String,javax.swing.Icon': '_JRadioButtonMenuItem$String$Icon', 'javax.swing.Action': '_JRadioButtonMenuItem$Action', 'java.lang.String': '_JRadioButtonMenuItem$String', 'javax.swing.Icon': '_JRadioButtonMenuItem$Icon', '': '_JRadioButtonMenuItem$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JRadioButtonMenuItem' } });
$J.define(JRadioButtonMenuItem$AccessibleJRadioButtonMenuItem, 'javax.swing.JRadioButtonMenuItem$AccessibleJRadioButtonMenuItem', { kind: 'class', sup: 'javax.swing.JMenuItem$AccessibleJMenuItem', ctors: { '': '_JRadioButtonMenuItem$AccessibleJRadioButtonMenuItem' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  JToggleButton$ToggleButtonModel = $J.load('javax.swing.JToggleButton$ToggleButtonModel');
});
