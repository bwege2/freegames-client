// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JToolBar.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { JSeparator } from './JSeparator.ts';

let SwingConstants;

/**
 * <code>JToolBar</code> provides a component that is useful for
 * displaying commonly used <code>Action</code>s or controls.
 * For examples and information on using tool bars see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/toolbar.html">How to Use Tool Bars</a>,
 * a section in <em>The Java Tutorial</em>.
 *
 * <p>
 * With most look and feels,
 * the user can drag out a tool bar into a separate window
 * (unless the <code>floatable</code> property is set to <code>false</code>).
 * For drag-out to work correctly, it is recommended that you add
 * <code>JToolBar</code> instances to one of the four "sides" of a
 * container whose layout manager is a <code>BorderLayout</code>,
 * and do not add children to any of the other four "sides".
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
 * @see Action
 * @since 1.2
 */
export class JToolBar extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'ToolBarUI';
  paintBorder_: boolean = false;
  margin: Insets = null;
  floatable: boolean = false;
  orientation: number = 0;
  $init_JToolBar() {
    this.paintBorder_ = true;
    this.margin = null;
    this.floatable = true;
    this.orientation = SwingConstants.HORIZONTAL;
  }
}

/**
 * A toolbar-specific separator. An object with dimension but
 * no contents used to divide buttons on a tool bar into groups.
 */
export class JToolBar$Separator extends JSeparator {
  separatorSize: Dimension = null;
}

$J.define(JToolBar, 'javax.swing.JToolBar', { kind: 'class', ifaces: ['javax.swing.SwingConstants', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'java.lang.String,int': '_JToolBar$String$int', 'java.lang.String': '_JToolBar$String', 'int': '_JToolBar$int', '': '_JToolBar$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JToolBar', 'add(javax.swing.Action)': 'add$Action', 'addSeparator(java.awt.Dimension)': 'addSeparator$Dimension', 'addSeparator()': 'addSeparator$', 'setUI(javax.swing.plaf.ToolBarUI)': 'setUI$ToolBarUI' } });
$J.define(JToolBar$Separator, 'javax.swing.JToolBar$Separator', { kind: 'class', sup: 'javax.swing.JSeparator', ctors: { 'java.awt.Dimension': '_JToolBar$Separator$Dimension', '': '_JToolBar$Separator$' }, meths: { 'getPreferredSize()': 'getPreferredSize$', 'getMinimumSize()': 'getMinimumSize$' } });
$J.module(() => {
  SwingConstants = $J.load('javax.swing.SwingConstants');
});
