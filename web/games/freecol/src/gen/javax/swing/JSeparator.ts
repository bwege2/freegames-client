// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JSeparator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let SwingConstants, UIManager;

/**
 * <code>JSeparator</code> provides a general purpose component for
 * implementing divider lines - most commonly used as a divider
 * between menu items that breaks them up into logical groupings.
 * Instead of using <code>JSeparator</code> directly,
 * you can use the <code>JMenu</code> or <code>JPopupMenu</code>
 * <code>addSeparator</code> method to create and add a separator.
 * <code>JSeparator</code>s may also be used elsewhere in a GUI
 * wherever a visual divider is useful.
 *
 * <p>
 *
 * For more information and examples see
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
 * @author Jeff Shapiro
 * @since 1.2
 */
export class JSeparator extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'SeparatorUI';
  orientation: number = 0;
  $init_JSeparator() {
    this.orientation = SwingConstants.HORIZONTAL;
  }
  /**
   * Creates a new horizontal separator.
   */
  _JSeparator$(): this {
    this._JSeparator$int(SwingConstants.HORIZONTAL);
    return this;
  }
  /**
   * Creates a new separator with the specified horizontal or
   * vertical orientation.
   *
   * @param orientation an integer specifying
   *          <code>SwingConstants.HORIZONTAL</code> or
   *          <code>SwingConstants.VERTICAL</code>
   * @throws IllegalArgumentException if <code>orientation</code>
   *          is neither <code>SwingConstants.HORIZONTAL</code> nor
   *          <code>SwingConstants.VERTICAL</code>
   */
  _JSeparator$int(orientation: number): this {
    this._JComponent();
    this.$init_JSeparator();
    this.checkOrientation(orientation);
    this.orientation = orientation;
    this.setFocusable(false);
    this.updateUI();
    return this;
  }
  /**
   * Sets the L&amp;F object that renders this component.
   *
   * @param ui  the SeparatorUI L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$SeparatorUI(ui: SeparatorUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Resets the UI property to a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$SeparatorUI(UIManager.getUI(this));
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "SeparatorUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JSeparator.uiClassID;
  }
  /**
   * Returns the orientation of this separator.
   *
   * @return   The value of the orientation property, one of the
   *           following constants defined in <code>SwingConstants</code>:
   *           <code>VERTICAL</code>, or
   *           <code>HORIZONTAL</code>.
   *
   * @see SwingConstants
   * @see #setOrientation
   */
  getOrientation(): number {
    return this.orientation;
  }
  /**
   * Sets the orientation of the separator.
   * The default value of this property is HORIZONTAL.
   * @param orientation  either <code>SwingConstants.HORIZONTAL</code>
   *                  or <code>SwingConstants.VERTICAL</code>
   * @throws IllegalArgumentException  if <code>orientation</code>
   *          is neither <code>SwingConstants.HORIZONTAL</code>
   *          nor <code>SwingConstants.VERTICAL</code>
   *
   * @see SwingConstants
   * @see #getOrientation
   */
  setOrientation(orientation: number): void {
    if (this.orientation === orientation) {
      return;
    }
    let oldValue = this.orientation;
    this.checkOrientation(orientation);
    this.orientation = orientation;
    this.firePropertyChange$String$int$int('orientation', oldValue, orientation);
    this.revalidate();
    this.repaint$();
  }
  checkOrientation(orientation: number): void {
    switch (orientation) {
      case SwingConstants.VERTICAL:
      case SwingConstants.HORIZONTAL:
        break;
      default:
        throw new IllegalArgumentException('orientation must be one of: VERTICAL, HORIZONTAL');
    }
  }
  /**
   * Returns a string representation of this <code>JSeparator</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JSeparator</code>
   */
  paramString(): string {
    let orientationString = (this.orientation === SwingConstants.HORIZONTAL ? 'HORIZONTAL' : 'VERTICAL');
    return super.paramString() + ',orientation=' + orientationString;
  }
  /**
   * Gets the AccessibleContext associated with this JSeparator.
   * For separators, the AccessibleContext takes the form of an
   * AccessibleJSeparator.
   * A new AccessibleJSeparator instance is created if necessary.
   *
   * @return an AccessibleJSeparator that serves as the
   *         AccessibleContext of this JSeparator
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JSeparator$AccessibleJSeparator().$o(this)._JSeparator$AccessibleJSeparator();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JSeparator</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to separator user-interface elements.
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
export class JSeparator$AccessibleJSeparator extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJSeparator}.
   */
  _JSeparator$AccessibleJSeparator(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
}

$J.define(JSeparator, 'javax.swing.JSeparator', { kind: 'class', ifaces: ['javax.swing.SwingConstants', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'int': '_JSeparator$int', '': '_JSeparator$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JSeparator', 'setUI(javax.swing.plaf.SeparatorUI)': 'setUI$SeparatorUI' } });
$J.define(JSeparator$AccessibleJSeparator, 'javax.swing.JSeparator$AccessibleJSeparator', { kind: 'class', sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JSeparator$AccessibleJSeparator' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  SwingConstants = $J.load('javax.swing.SwingConstants');
  UIManager = $J.load('javax.swing.UIManager');
});
