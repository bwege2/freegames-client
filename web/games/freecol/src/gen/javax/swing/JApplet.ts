// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JApplet.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Applet } from '../../../jre/index.ts';

/**
 * An extended version of <code>java.applet.Applet</code> that adds support for
 * the JFC/Swing component architecture.
 * You can find task-oriented documentation about using <code>JApplet</code>
 * in <em>The Java Tutorial</em>,
 * in the section
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/applet.html">How to Make Applets</a>.
 * <p>
 * The <code>JApplet</code> class is slightly incompatible with
 * <code>java.applet.Applet</code>.  <code>JApplet</code> contains a
 * <code>JRootPane</code> as its only child.  The <code>contentPane</code>
 * should be the parent of any children of the <code>JApplet</code>.
 * As a convenience, the {@code add}, {@code remove}, and {@code setLayout}
 * methods of this class are overridden, so that they delegate calls
 * to the corresponding methods of the {@code ContentPane}.
 * For example, you can add a child component to an applet as follows:
 * <pre>
 *       applet.add(child);
 * </pre>
 *
 * And the child will be added to the <code>contentPane</code>.
 * The <code>contentPane</code> will always be non-<code>null</code>.
 * Attempting to set it to <code>null</code> will cause the
 * <code>JApplet</code> to throw an exception. The default
 * <code>contentPane</code> will have a <code>BorderLayout</code>
 * manager set on it.
 * Refer to {@link javax.swing.RootPaneContainer}
 * for details on adding, removing and setting the <code>LayoutManager</code>
 * of a <code>JApplet</code>.
 * <p>
 * Please see the <code>JRootPane</code> documentation for a
 * complete description of the <code>contentPane</code>, <code>glassPane</code>,
 * and <code>layeredPane</code> properties.
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
 * @see javax.swing.RootPaneContainer
 *
 * @author Arnaud Weber
 * @since 1.2
 *
 * @deprecated The Applet API is deprecated, no replacement.
 */
export class JApplet extends Applet {
  /**
   * The <code>JRootPane</code> instance that manages the
   * <code>contentPane</code>.
   *
   * @see #getRootPane
   * @see #setRootPane
   */
  rootPane: JRootPane = null;
  /**
   * If true then calls to <code>add</code> and <code>setLayout</code>
   * will be forwarded to the <code>contentPane</code>. This is initially
   * false, but is set to true when the <code>JApplet</code> is constructed.
   *
   * @see #isRootPaneCheckingEnabled
   * @see #setRootPaneCheckingEnabled
   * @see javax.swing.RootPaneContainer
   */
  rootPaneCheckingEnabled: boolean = false;
  /**
   * The <code>TransferHandler</code> for this applet.
   */
  transferHandler: TransferHandler = null;
  /**
   * {@code AccessibleContext} associated with this {@code JApplet}
   */
  accessibleContext$JApplet: AccessibleContext = null;
}

$J.define(JApplet, 'javax.swing.JApplet', { kind: 'class', ifaces: ['javax.accessibility.Accessible', 'javax.swing.RootPaneContainer', 'javax.swing.TransferHandler$HasGetTransferHandler'], sup: 'java.applet.Applet', ctors: { '': '_JApplet' }, meths: { 'repaint(long,int,int,int,int)': 'repaint$long$int$int$int$int', 'remove(java.awt.Component)': 'remove$Component', 'update(java.awt.Graphics)': 'update$Graphics' } });
