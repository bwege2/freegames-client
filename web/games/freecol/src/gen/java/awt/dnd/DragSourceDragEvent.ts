// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DragSourceDragEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { DragSourceEvent } from './DragSourceEvent.ts';

let DnDConstants;

/**
 * The {@code DragSourceDragEvent} is
 * delivered from the {@code DragSourceContextPeer},
 * via the {@code DragSourceContext}, to the {@code DragSourceListener}
 * registered with that {@code DragSourceContext} and with its associated
 * {@code DragSource}.
 * <p>
 * The {@code DragSourceDragEvent} reports the <i>target drop action</i>
 * and the <i>user drop action</i> that reflect the current state of
 * the drag operation.
 * <p>
 * <i>Target drop action</i> is one of {@code DnDConstants} that represents
 * the drop action selected by the current drop target if this drop action is
 * supported by the drag source or {@code DnDConstants.ACTION_NONE} if this
 * drop action is not supported by the drag source.
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
export class DragSourceDragEvent extends DragSourceEvent {
  static readonly JDK_1_3_MODIFIERS: number = 63;
  static readonly JDK_1_4_MODIFIERS: number = 16320;
  /**
   * The target drop action.
   *
   * @serial
   */
  targetActions: number = 0;
  /**
   * The user drop action.
   *
   * @serial
   */
  dropAction: number = 0;
  /**
   * The state of the input device modifiers associated with the user
   * gesture.
   *
   * @serial
   */
  gestureModifiers: number = 0;
  /**
   * Indicates whether the {@code gestureModifiers} are invalid.
   *
   * @serial
   */
  invalidModifiers: boolean = false;
  $init_DragSourceDragEvent() {
    this.targetActions = DnDConstants.ACTION_NONE;
    this.dropAction = DnDConstants.ACTION_NONE;
    this.gestureModifiers = 0;
  }
}

$J.define(DragSourceDragEvent, 'java.awt.dnd.DragSourceDragEvent', { kind: 'class', sup: 'java.awt.dnd.DragSourceEvent', ctors: { 'java.awt.dnd.DragSourceContext,int,int,int,int,int': '_DragSourceDragEvent$DragSourceContext$int$int$int$int$int', 'java.awt.dnd.DragSourceContext,int,int,int': '_DragSourceDragEvent$DragSourceContext$int$int$int' } });
$J.module(() => {
  DnDConstants = $J.load('java.awt.dnd.DnDConstants');
});
