// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/Box.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { Component$AccessibleAWTComponent } from '../../java/awt/Component.ts';
import { Container$AccessibleAWTContainer } from '../../java/awt/Container.ts';

let AWTError, BoxLayout;

/**
 * A lightweight container
 * that uses a BoxLayout object as its layout manager.
 * Box provides several class methods
 * that are useful for containers using BoxLayout --
 * even non-Box containers.
 *
 * <p>
 * The <code>Box</code> class can create several kinds
 * of invisible components
 * that affect layout:
 * glue, struts, and rigid areas.
 * If all the components your <code>Box</code> contains
 * have a fixed size,
 * you might want to use a glue component
 * (returned by <code>createGlue</code>)
 * to control the components' positions.
 * If you need a fixed amount of space between two components,
 * try using a strut
 * (<code>createHorizontalStrut</code> or <code>createVerticalStrut</code>).
 * If you need an invisible component
 * that always takes up the same amount of space,
 * get it by invoking <code>createRigidArea</code>.
 * <p>
 * If you are implementing a <code>BoxLayout</code> you
 * can find further information and examples in
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/layout/box.html">How to Use BoxLayout</a>,
 * a section in <em>The Java Tutorial.</em>
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
 * @see BoxLayout
 *
 * @author  Timothy Prinzing
 * @since 1.2
 */
export class Box extends JComponent {
  /**
   * Creates a <code>Box</code> that displays its components
   * along the specified axis.
   *
   * @param axis  can be {@link BoxLayout#X_AXIS},
   *              {@link BoxLayout#Y_AXIS},
   *              {@link BoxLayout#LINE_AXIS} or
   *              {@link BoxLayout#PAGE_AXIS}.
   * @throws AWTError if the <code>axis</code> is invalid
   * @see #createHorizontalBox
   * @see #createVerticalBox
   */
  _Box(axis: number): this {
    this._JComponent();
    super.setLayout(new BoxLayout()._BoxLayout$Container$int(this, axis));
    return this;
  }
  /**
   * Creates a <code>Box</code> that displays its components
   * from top to bottom. If you want a <code>Box</code> that
   * respects the component orientation you should create the
   * <code>Box</code> using the constructor and pass in
   * <code>BoxLayout.PAGE_AXIS</code>, eg:
   * <pre>
   *   Box lineBox = new Box(BoxLayout.PAGE_AXIS);
   * </pre>
   *
   * @return the box
   */
  static createVerticalBox(): Box {
    return new Box()._Box(BoxLayout.Y_AXIS);
  }
  /**
   * Creates an invisible component that's always the specified size.
   * <!-- WHEN WOULD YOU USE THIS AS OPPOSED TO A STRUT? -->
   *
   * @param d the dimensions of the invisible component
   * @return the component
   * @see #createGlue
   * @see #createHorizontalStrut
   * @see #createVerticalStrut
   */
  static createRigidArea(d: Dimension): Component {
    return new Box$Filler()._Box$Filler(d, d, d);
  }
  /**
   * Throws an AWTError, since a Box can use only a BoxLayout.
   *
   * @param l the layout manager to use
   */
  setLayout(l: LayoutManager): void {
    throw new AWTError()._AWTError('Illegal request');
  }
  /**
   * Paints this <code>Box</code>.  If this <code>Box</code> has a UI this
   * method invokes super's implementation, otherwise if this
   * <code>Box</code> is opaque the <code>Graphics</code> is filled
   * using the background.
   *
   * @param g the <code>Graphics</code> to paint to
   * @throws NullPointerException if <code>g</code> is null
   * @since 1.6
   */
  paintComponent(g: Graphics): void {
    if (this.ui != null) {
      super.paintComponent(g);
    } else if (this.isOpaque()) {
      g.setColor(this.getBackground());
      g.fillRect(0, 0, this.getWidth(), this.getHeight());
    }
  }
  /**
   * Gets the AccessibleContext associated with this Box.
   * For boxes, the AccessibleContext takes the form of an
   * AccessibleBox.
   * A new AccessibleAWTBox instance is created if necessary.
   *
   * @return an AccessibleBox that serves as the
   *         AccessibleContext of this Box
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new Box$AccessibleBox().$o(this)._Box$AccessibleBox();
    }
    return this.accessibleContext;
  }
}

/**
 * An implementation of a lightweight component that participates in
 * layout but has no view.
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
export class Box$Filler extends JComponent {
  /**
   * Constructor to create shape with the given size ranges.
   *
   * @param min   Minimum size
   * @param pref  Preferred size
   * @param max   Maximum size
   */
  _Box$Filler(min: Dimension, pref: Dimension, max: Dimension): this {
    this._JComponent();
    this.setMinimumSize(min);
    this.setPreferredSize(pref);
    this.setMaximumSize(max);
    this.setFocusable(false);
    return this;
  }
  /**
   * Paints this <code>Filler</code>.  If this
   * <code>Filler</code> has a UI this method invokes super's
   * implementation, otherwise if this <code>Filler</code> is
   * opaque the <code>Graphics</code> is filled using the
   * background.
   *
   * @param g the <code>Graphics</code> to paint to
   * @throws NullPointerException if <code>g</code> is null
   * @since 1.6
   */
  paintComponent(g: Graphics): void {
    if (this.ui != null) {
      super.paintComponent(g);
    } else if (this.isOpaque()) {
      g.setColor(this.getBackground());
      g.fillRect(0, 0, this.getWidth(), this.getHeight());
    }
  }
  /**
   * Gets the AccessibleContext associated with this Box.Filler.
   * For box fillers, the AccessibleContext takes the form of an
   * AccessibleBoxFiller.
   * A new AccessibleAWTBoxFiller instance is created if necessary.
   *
   * @return an AccessibleBoxFiller that serves as the
   *         AccessibleContext of this Box.Filler.
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new Box$Filler$AccessibleBoxFiller().$o(this)._Box$Filler$AccessibleBoxFiller();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>Box.Filler</code> class.
 */
export class Box$Filler$AccessibleBoxFiller extends Component$AccessibleAWTComponent {
  /**
   * Constructs an {@code AccessibleBoxFiller}.
   */
  _Box$Filler$AccessibleBoxFiller(): this {
    this._Component$AccessibleAWTComponent();
    return this;
  }
}

/**
 * This class implements accessibility support for the
 * <code>Box</code> class.
 */
export class Box$AccessibleBox extends Container$AccessibleAWTContainer {
  /**
   * Constructs an {@code AccessibleBox}.
   */
  _Box$AccessibleBox(): this {
    this._Container$AccessibleAWTContainer();
    return this;
  }
}

$J.define(Box, 'javax.swing.Box', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'int': '_Box' } });
$J.define(Box$Filler, 'javax.swing.Box$Filler', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'java.awt.Dimension,java.awt.Dimension,java.awt.Dimension': '_Box$Filler' } });
$J.define(Box$Filler$AccessibleBoxFiller, 'javax.swing.Box$Filler$AccessibleBoxFiller', { kind: 'class', sup: 'java.awt.Component$AccessibleAWTComponent', ctors: { '': '_Box$Filler$AccessibleBoxFiller' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.define(Box$AccessibleBox, 'javax.swing.Box$AccessibleBox', { kind: 'class', sup: 'java.awt.Container$AccessibleAWTContainer', ctors: { '': '_Box$AccessibleBox' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  AWTError = $J.load('java.awt.AWTError');
  BoxLayout = $J.load('javax.swing.BoxLayout');
});
