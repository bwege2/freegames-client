// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/RootPaneContainer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2013, Oracle and/or its affiliates. All rights reserved.
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

/**
 * This interface is implemented by components that have a single
 * JRootPane child: JDialog, JFrame, JWindow, JApplet, JInternalFrame.
 * The methods in  this interface are just <i>covers</i> for the JRootPane
 * properties, e.g. <code>getContentPane()</code> is generally implemented
 * like this:<pre>
 *     public Container getContentPane() {
 *         return getRootPane().getContentPane();
 *     }
 * </pre>
 * This interface serves as a <i>marker</i> for Swing GUI builders
 * that need to treat components like JFrame, that contain a
 * single JRootPane, specially.  For example in a GUI builder,
 * dropping a component on a RootPaneContainer would be interpreted
 * as <code>frame.getContentPane().add(child)</code>.
 * <p>
 * As a convenience, the standard classes that implement this interface
 * (such as {@code JFrame}, {@code JDialog}, {@code JWindow}, {@code JApplet},
 * and {@code JInternalFrame}) have their {@code add}, {@code remove},
 * and {@code setLayout} methods overridden, so that they delegate calls
 * to the corresponding methods of the {@code ContentPane}.
 * For example, you can add a child component to a frame as follows:
 * <pre>
 *       frame.add(child);
 * </pre>
 * instead of:
 * <pre>
 *       frame.getContentPane().add(child);
 * </pre>
 * <p>
 * The behavior of the <code>add</code> and
 * <code>setLayout</code> methods for
 * <code>JFrame</code>, <code>JDialog</code>, <code>JWindow</code>,
 * <code>JApplet</code> and <code>JInternalFrame</code> is controlled by
 * the <code>rootPaneCheckingEnabled</code> property. If this property is
 * true (the default), then calls to these methods are
 * forwarded to the <code>contentPane</code>; if false, these
 * methods operate directly on the <code>RootPaneContainer</code>. This
 * property is only intended for subclasses, and is therefore protected.
 *
 * @see JRootPane
 * @see JFrame
 * @see JDialog
 * @see JWindow
 * @see JApplet
 * @see JInternalFrame
 *
 * @author Hans Muller
 * @since 1.2
 */
export class RootPaneContainer {
}

$J.define(RootPaneContainer, 'javax.swing.RootPaneContainer', { kind: 'interface' });
