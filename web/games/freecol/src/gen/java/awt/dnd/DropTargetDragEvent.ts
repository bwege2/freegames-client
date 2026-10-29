// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DropTargetDragEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { DropTargetEvent } from './DropTargetEvent.ts';

/**
 * The {@code DropTargetDragEvent} is delivered to a
 * {@code DropTargetListener} via its
 * dragEnter() and dragOver() methods.
 * <p>
 * The {@code DropTargetDragEvent} reports the <i>source drop actions</i>
 * and the <i>user drop action</i> that reflect the current state of
 * the drag operation.
 * <p>
 * <i>Source drop actions</i> is a bitwise mask of {@code DnDConstants}
 * that represents the set of drop actions supported by the drag source for
 * this drag operation.
 * <p>
 * <i>User drop action</i> depends on the drop actions supported by the drag
 * source and the drop action selected by the user. The user can select a drop
 * action by pressing modifier keys during the drag operation:
 * <pre>
 *   Ctrl + Shift -&gt; ACTION_LINK
 *   Ctrl         -&gt; ACTION_COPY
 *   Shift        -&gt; ACTION_MOVE
 * </pre>
 * If the user selects a drop action, the <i>user drop action</i> is one of
 * {@code DnDConstants} that represents the selected drop action if this
 * drop action is supported by the drag source or
 * {@code DnDConstants.ACTION_NONE} if this drop action is not supported
 * by the drag source.
 * <p>
 * If the user doesn't select a drop action, the set of
 * {@code DnDConstants} that represents the set of drop actions supported
 * by the drag source is searched for {@code DnDConstants.ACTION_MOVE},
 * then for {@code DnDConstants.ACTION_COPY}, then for
 * {@code DnDConstants.ACTION_LINK} and the <i>user drop action</i> is the
 * first constant found. If no constant is found the <i>user drop action</i>
 * is {@code DnDConstants.ACTION_NONE}.
 *
 * @since 1.2
 */
export class DropTargetDragEvent extends DropTargetEvent {
  /**
   * The location of the drag cursor's hotspot in Component coordinates.
   *
   * @serial
   */
  location_: Point = null;
  /**
   * The source drop actions.
   *
   * @serial
   */
  actions: number = 0;
  /**
   * The user drop action.
   *
   * @serial
   */
  dropAction: number = 0;
}

$J.define(DropTargetDragEvent, 'java.awt.dnd.DropTargetDragEvent', { kind: 'class', sup: 'java.awt.dnd.DropTargetEvent', ctors: { 'java.awt.dnd.DropTargetContext,java.awt.Point,int,int': '_DropTargetDragEvent' } });
