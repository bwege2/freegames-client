// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/WindowConstants.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2013, Oracle and/or its affiliates. All rights reserved.
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
 * Constants used to control the window-closing operation.
 * The <code>setDefaultCloseOperation</code> and
 * <code>getDefaultCloseOperation</code> methods
 * provided by <code>JFrame</code>,
 * <code>JInternalFrame</code>, and
 * <code>JDialog</code>
 * use these constants.
 * For examples of setting the default window-closing operation, see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/frame.html#windowevents">Responding to Window-Closing Events</a>,
 * a section in <em>The Java Tutorial</em>.
 * @see JFrame#setDefaultCloseOperation(int)
 * @see JDialog#setDefaultCloseOperation(int)
 * @see JInternalFrame#setDefaultCloseOperation(int)
 *
 *
 * @author Amy Fowler
 * @since 1.2
 */
export class WindowConstants {
  /**
   * The do-nothing default window close operation.
   */
  static readonly DO_NOTHING_ON_CLOSE: number = 0;
  /**
   * The hide-window default window close operation
   */
  static readonly HIDE_ON_CLOSE: number = 1;
  /**
   * The dispose-window default window close operation.
   * <p>
   * <b>Note</b>: When the last displayable window
   * within the Java virtual machine (VM) is disposed of, the VM may
   * terminate.  See <a href="../../java/awt/doc-files/AWTThreadIssues.html">
   * AWT Threading Issues</a> for more information.
   * @see java.awt.Window#dispose()
   * @see JInternalFrame#dispose()
   */
  static readonly DISPOSE_ON_CLOSE: number = 2;
  /**
   * The exit application default window close operation. Attempting
   * to set this on Windows that support this, such as
   * <code>JFrame</code>, may throw a <code>SecurityException</code> based
   * on the <code>SecurityManager</code>.
   * It is recommended you only use this in an application.
   *
   * @since 1.4
   * @see JFrame#setDefaultCloseOperation
   */
  static readonly EXIT_ON_CLOSE: number = 3;
}

$J.define(WindowConstants, 'javax.swing.WindowConstants', { kind: 'interface' });
