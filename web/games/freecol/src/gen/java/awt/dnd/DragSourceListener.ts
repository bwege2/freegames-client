// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DragSourceListener.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2003, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../jre/index.ts';

/**
 * The {@code DragSourceListener} defines the
 * event interface for originators of
 * Drag and Drop operations to track the state of the user's gesture, and to
 * provide appropriate &quot;drag over&quot;
 * feedback to the user throughout the
 * Drag and Drop operation.
 * <p>
 * The drop site is <i>associated with the previous {@code dragEnter()}
 * invocation</i> if the latest invocation of {@code dragEnter()} on this
 * listener:
 * <ul>
 * <li>corresponds to that drop site and
 * <li> is not followed by a {@code dragExit()} invocation on this listener.
 * </ul>
 *
 * @since 1.2
 */
export class DragSourceListener {
}

$J.define(DragSourceListener, 'java.awt.dnd.DragSourceListener', { kind: 'interface', ifaces: ['java.util.EventListener'] });
