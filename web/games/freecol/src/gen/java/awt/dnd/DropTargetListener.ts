// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DropTargetListener.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2007, Oracle and/or its affiliates. All rights reserved.
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
 * The {@code DropTargetListener} interface
 * is the callback interface used by the
 * {@code DropTarget} class to provide
 * notification of DnD operations that involve
 * the subject {@code DropTarget}. Methods of
 * this interface may be implemented to provide
 * "drag under" visual feedback to the user throughout
 * the Drag and Drop operation.
 * <p>
 * Create a listener object by implementing the interface and then register it
 * with a {@code DropTarget}. When the drag enters, moves over, or exits
 * the operable part of the drop site for that {@code DropTarget}, when
 * the drop action changes, and when the drop occurs, the relevant method in
 * the listener object is invoked, and the {@code DropTargetEvent} is
 * passed to it.
 * <p>
 * The operable part of the drop site for the {@code DropTarget} is
 * the part of the associated {@code Component}'s geometry that is not
 * obscured by an overlapping top-level window or by another
 * {@code Component} higher in the Z-order that has an associated active
 * {@code DropTarget}.
 * <p>
 * During the drag, the data associated with the current drag operation can be
 * retrieved by calling {@code getTransferable()} on
 * {@code DropTargetDragEvent} instances passed to the listener's
 * methods.
 * <p>
 * Note that {@code getTransferable()} on the
 * {@code DropTargetDragEvent} instance should only be called within the
 * respective listener's method and all the necessary data should be retrieved
 * from the returned {@code Transferable} before that method returns.
 *
 * @since 1.2
 */
export class DropTargetListener {
}

$J.define(DropTargetListener, 'java.awt.dnd.DropTargetListener', { kind: 'interface', ifaces: ['java.util.EventListener'] });
