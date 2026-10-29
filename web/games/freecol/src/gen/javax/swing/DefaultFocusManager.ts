// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DefaultFocusManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FocusManager } from './FocusManager.ts';

/**
 * This class has been obsoleted by the 1.4 focus APIs. While client code may
 * still use this class, developers are strongly encouraged to use
 * <code>java.awt.KeyboardFocusManager</code> and
 * <code>java.awt.DefaultKeyboardFocusManager</code> instead.
 * <p>
 * Please see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
 * How to Use the Focus Subsystem</a>,
 * a section in <em>The Java Tutorial</em>, and the
 * <a href="../../java/awt/doc-files/FocusSpec.html">Focus Specification</a>
 * for more information.
 *
 * @author Arnaud Weber
 * @author David Mendenhall
 * @since 1.2
 */
export class DefaultFocusManager extends FocusManager {
  gluePolicy: FocusTraversalPolicy = null;
  layoutPolicy: FocusTraversalPolicy = null;
  comparator: LayoutComparator = null;
}

$J.define(DefaultFocusManager, 'javax.swing.DefaultFocusManager', { kind: 'class', sup: 'javax.swing.FocusManager', ctors: { '': '_DefaultFocusManager' } });
