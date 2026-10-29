// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/LayoutManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2014, Oracle and/or its affiliates. All rights reserved.
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
 * Defines the interface for classes that know how to lay out
 * {@code Container}s.
 * <p>
 * Swing's painting architecture assumes the children of a
 * {@code JComponent} do not overlap.  If a
 * {@code JComponent}'s {@code LayoutManager} allows
 * children to overlap, the {@code JComponent} must override
 * {@code isOptimizedDrawingEnabled} to return false.
 *
 * @see Container
 * @see javax.swing.JComponent#isOptimizedDrawingEnabled
 *
 * @author      Sami Shaio
 * @author      Arthur van Hoff
 */
export class LayoutManager {
}

$J.define(LayoutManager, 'java.awt.LayoutManager', { kind: 'interface', meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' } });
