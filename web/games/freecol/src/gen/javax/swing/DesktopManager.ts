// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DesktopManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2015, Oracle and/or its affiliates. All rights reserved.
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
 * DesktopManager objects are owned by a JDesktopPane object. They are responsible
 * for implementing L&amp;F specific behaviors for the JDesktopPane. JInternalFrame
 * implementations should delegate specific behaviors to the DesktopManager. For
 * instance, if a JInternalFrame was asked to iconify, it should try:
 * <PRE>
 *    getDesktopPane().getDesktopManager().iconifyFrame(frame);
 * </PRE>
 * This delegation allows each L&amp;F to provide custom behaviors for desktop-specific
 * actions. (For example, how and where the internal frame's icon would appear.)
 * <p>This class provides a policy for the various JInternalFrame methods, it is not
 * meant to be called directly rather the various JInternalFrame methods will call
 * into the DesktopManager.</p>
 *
 * @see JDesktopPane
 * @see JInternalFrame
 * @see JInternalFrame.JDesktopIcon
 *
 * @author David Kloba
 * @since 1.2
 */
export class DesktopManager {
}

$J.define(DesktopManager, 'javax.swing.DesktopManager', { kind: 'interface' });
