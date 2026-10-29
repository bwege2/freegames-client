// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let FlowLayout, UIManager;

/**
 * <code>JPanel</code> is a generic lightweight container.
 * For examples and task-oriented documentation for JPanel, see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/panel.html">How to Use Panels</a>,
 * a section in <em>The Java Tutorial</em>.
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
 * @author Arnaud Weber
 * @author Steve Wilson
 * @since 1.2
 */
export class JPanel extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'PanelUI';
  /**
   * Creates a new JPanel with the specified layout manager and buffering
   * strategy.
   *
   * @param layout  the LayoutManager to use
   * @param isDoubleBuffered  a boolean, true for double-buffering, which
   *        uses additional memory space to achieve fast, flicker-free
   *        updates
   */
  _JPanel$LayoutManager$boolean(layout: LayoutManager, isDoubleBuffered: boolean): this {
    this._JComponent();
    this.setLayout(layout);
    this.setDoubleBuffered(isDoubleBuffered);
    this.setUIProperty('opaque', true);
    this.updateUI();
    return this;
  }
  /**
   * Create a new buffered JPanel with the specified layout manager
   *
   * @param layout  the LayoutManager to use
   */
  _JPanel$LayoutManager(layout: LayoutManager): this {
    this._JPanel$LayoutManager$boolean(layout, true);
    return this;
  }
  /**
   * Creates a new <code>JPanel</code> with <code>FlowLayout</code>
   * and the specified buffering strategy.
   * If <code>isDoubleBuffered</code> is true, the <code>JPanel</code>
   * will use a double buffer.
   *
   * @param isDoubleBuffered  a boolean, true for double-buffering, which
   *        uses additional memory space to achieve fast, flicker-free
   *        updates
   */
  _JPanel$boolean(isDoubleBuffered: boolean): this {
    this._JPanel$LayoutManager$boolean(new FlowLayout()._FlowLayout$(), isDoubleBuffered);
    return this;
  }
  /**
   * Creates a new <code>JPanel</code> with a double buffer
   * and a flow layout.
   */
  _JPanel$(): this {
    this._JPanel$boolean(true);
    return this;
  }
  /**
   * Resets the UI property with a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$PanelUI(UIManager.getUI(this));
  }
  /**
   * Sets the look and feel (L&amp;F) object that renders this component.
   *
   * @param ui  the PanelUI L&amp;F object
   * @see UIDefaults#getUI
   * @since 1.4
   */
  setUI$PanelUI(ui: PanelUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Returns a string that specifies the name of the L&amp;F class
   * that renders this component.
   *
   * @return the string "PanelUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JPanel.uiClassID;
  }
  /**
   * Returns a string representation of this JPanel. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this JPanel.
   */
  paramString(): string {
    return super.paramString();
  }
  /**
   * Gets the AccessibleContext associated with this JPanel.
   * For JPanels, the AccessibleContext takes the form of an
   * AccessibleJPanel.
   * A new AccessibleJPanel instance is created if necessary.
   *
   * @return an AccessibleJPanel that serves as the
   *         AccessibleContext of this JPanel
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JPanel$AccessibleJPanel().$o(this)._JPanel$AccessibleJPanel();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JPanel</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to panel user-interface
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
export class JPanel$AccessibleJPanel extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJPanel}.
   */
  _JPanel$AccessibleJPanel(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
}

$J.define(JPanel, 'javax.swing.JPanel', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { '': '_JPanel$', 'boolean': '_JPanel$boolean', 'java.awt.LayoutManager': '_JPanel$LayoutManager', 'java.awt.LayoutManager,boolean': '_JPanel$LayoutManager$boolean' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JPanel', 'setUI(javax.swing.plaf.PanelUI)': 'setUI$PanelUI' } });
$J.define(JPanel$AccessibleJPanel, 'javax.swing.JPanel$AccessibleJPanel', { kind: 'class', sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JPanel$AccessibleJPanel' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  FlowLayout = $J.load('java.awt.FlowLayout');
  UIManager = $J.load('javax.swing.UIManager');
});
