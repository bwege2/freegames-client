// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JCheckBoxMenuItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * A menu item that can be selected or deselected. If selected, the menu
 * item typically appears with a checkmark next to it. If unselected or
 * deselected, the menu item appears without a checkmark. Like a regular
 * menu item, a check box menu item can have either text or a graphic
 * icon associated with it, or both.
 * <p>
 * Either <code>isSelected</code>/<code>setSelected</code> or
 * <code>getState</code>/<code>setState</code> can be used
 * to determine/specify the menu item's selection state. The
 * preferred methods are <code>isSelected</code> and
 * <code>setSelected</code>, which work for all menus and buttons.
 * The <code>getState</code> and <code>setState</code> methods exist for
 * compatibility with other component sets.
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
 * Some times it is required to select several check box menu items from a menu.
 * In this case it is useful that clicking on one check box menu item does not
 * close the menu. Such behavior can be controlled either by client
 * {@link JComponent#putClientProperty} or the Look and Feel
 * {@link UIManager#put} property named
 * {@code "CheckBoxMenuItem.doNotCloseOnMouseClick"}. The default value is
 * {@code false}. Setting the property to {@code true} prevents the menu from
 * closing when it is clicked by the mouse. If the client property is set its
 * value is always used; otherwise the {@literal L&F} property is queried.
 * Note: some {@code L&F}s may ignore this property. All built-in {@code L&F}s
 * inherit this behaviour.
 * <p>
 * For further information and examples of using check box menu items,
 * see <a
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
 * @since 1.2
 */
export class JCheckBoxMenuItem extends JMenuItem {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'CheckBoxMenuItemUI';
  /**
   * Creates an initially unselected check box menu item with no set text or icon.
   */
  _JCheckBoxMenuItem$(): this {
    this._JCheckBoxMenuItem$String$Icon$boolean(null, null, false);
    return this;
  }
  /**
   * Creates a check box menu item with the specified text and selection state.
   *
   * @param text the text of the check box menu item.
   * @param b the selected state of the check box menu item
   */
  _JCheckBoxMenuItem$String$boolean(text: string, b: boolean): this {
    this._JCheckBoxMenuItem$String$Icon$boolean(text, null, b);
    return this;
  }
  /**
   * Creates a check box menu item with the specified text, icon, and selection state.
   *
   * @param text the text of the check box menu item
   * @param icon the icon of the check box menu item
   * @param b the selected state of the check box menu item
   */
  _JCheckBoxMenuItem$String$Icon$boolean(text: string, icon: Icon, b: boolean): this {
    this._JMenuItem$String$Icon(text, icon);
    this.setModel(new JToggleButton$ToggleButtonModel()._JToggleButton$ToggleButtonModel());
    this.setSelected(b);
    this.setFocusable(false);
    return this;
  }
  /**
   * Returns the name of the L&amp;F class
   * that renders this component.
   *
   * @return the string "CheckBoxMenuItemUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JCheckBoxMenuItem.uiClassID;
  }
  /**
   * Returns a string representation of this JCheckBoxMenuItem. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this JCheckBoxMenuItem.
   */
  paramString(): string {
    return super.paramString();
  }
  /**
   * Overridden to return true, JCheckBoxMenuItem supports
   * the selected state.
   */
  shouldUpdateSelectedStateFromAction(): boolean {
    return true;
  }
  /**
   * Gets the AccessibleContext associated with this JCheckBoxMenuItem.
   * For JCheckBoxMenuItems, the AccessibleContext takes the form of an
   * AccessibleJCheckBoxMenuItem.
   * A new AccessibleJCheckBoxMenuItem instance is created if necessary.
   *
   * @return an AccessibleJCheckBoxMenuItem that serves as the
   *         AccessibleContext of this AccessibleJCheckBoxMenuItem
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JCheckBoxMenuItem$AccessibleJCheckBoxMenuItem().$o(this)._JCheckBoxMenuItem$AccessibleJCheckBoxMenuItem();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JCheckBoxMenuItem</code> class.  It provides an implementation
 * of the Java Accessibility API appropriate to checkbox menu item
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
export class JCheckBoxMenuItem$AccessibleJCheckBoxMenuItem extends JMenuItem$AccessibleJMenuItem {
  /**
   * Constructs an {@code AccessibleJCheckBoxMenuItem}.
   */
  _JCheckBoxMenuItem$AccessibleJCheckBoxMenuItem(): this {
    this._JMenuItem$AccessibleJMenuItem();
    return this;
  }
}

$J.define(JCheckBoxMenuItem, 'javax.swing.JCheckBoxMenuItem', { kind: 'class', ifaces: ['javax.swing.SwingConstants', 'javax.accessibility.Accessible'], sup: 'javax.swing.JMenuItem', ctors: { 'java.lang.String,javax.swing.Icon,boolean': '_JCheckBoxMenuItem$String$Icon$boolean', 'java.lang.String,boolean': '_JCheckBoxMenuItem$String$boolean', 'java.lang.String,javax.swing.Icon': '_JCheckBoxMenuItem$String$Icon', 'javax.swing.Action': '_JCheckBoxMenuItem$Action', 'java.lang.String': '_JCheckBoxMenuItem$String', 'javax.swing.Icon': '_JCheckBoxMenuItem$Icon', '': '_JCheckBoxMenuItem$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JCheckBoxMenuItem' } });
$J.define(JCheckBoxMenuItem$AccessibleJCheckBoxMenuItem, 'javax.swing.JCheckBoxMenuItem$AccessibleJCheckBoxMenuItem', { kind: 'class', sup: 'javax.swing.JMenuItem$AccessibleJMenuItem', ctors: { '': '_JCheckBoxMenuItem$AccessibleJCheckBoxMenuItem' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  JToggleButton$ToggleButtonModel = $J.load('javax.swing.JToggleButton$ToggleButtonModel');
});
