// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DragGestureEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, EventObject, IllegalArgumentException } from '../../../../jre/index.ts';

let DnDConstants;

/**
 * A {@code DragGestureEvent} is passed
 * to {@code DragGestureListener}'s
 * dragGestureRecognized() method
 * when a particular {@code DragGestureRecognizer} detects that a
 * platform dependent drag initiating gesture has occurred
 * on the {@code Component} that it is tracking.
 *
 * The {@code action} field of any {@code DragGestureEvent} instance should take one of the following
 * values:
 * <ul>
 * <li> {@code DnDConstants.ACTION_COPY}
 * <li> {@code DnDConstants.ACTION_MOVE}
 * <li> {@code DnDConstants.ACTION_LINK}
 * </ul>
 * Assigning the value different from listed above will cause an unspecified behavior.
 *
 * @see java.awt.dnd.DragGestureRecognizer
 * @see java.awt.dnd.DragGestureListener
 * @see java.awt.dnd.DragSource
 * @see java.awt.dnd.DnDConstants
 */
export class DragGestureEvent extends EventObject {
  events: List = null;
  /**
   * The DragSource associated with this DragGestureEvent.
   *
   * @serial
   */
  dragSource: DragSource = null;
  /**
   * The Component associated with this DragGestureEvent.
   *
   * @serial
   */
  component: Component = null;
  /**
   * The origin of the drag.
   *
   * @serial
   */
  origin: Point = null;
  /**
   * The user's preferred action.
   *
   * @serial
   */
  action_: number = 0;
  /**
   * Constructs a {@code DragGestureEvent} object given by the
   * {@code DragGestureRecognizer} instance firing this event,
   * an {@code act} parameter representing
   * the user's preferred action, an {@code ori} parameter
   * indicating the origin of the drag, and a {@code List} of
   * events that comprise the gesture({@code evs} parameter).
   *
   * @param dgr The {@code DragGestureRecognizer} firing this event
   * @param act The user's preferred action.
   *            For information on allowable values, see
   *            the class description for {@link DragGestureEvent}
   * @param ori The origin of the drag
   * @param evs The {@code List} of events that comprise the gesture
   *
   * @throws IllegalArgumentException if any parameter equals {@code null}
   * @throws IllegalArgumentException if the act parameter does not comply with
   *                                  the values given in the class
   *                                  description for {@link DragGestureEvent}
   * @see java.awt.dnd.DnDConstants
   */
  _DragGestureEvent(dgr: DragGestureRecognizer, act: number, ori: Point, evs: List<InputEvent>): this {
    this._EventObject(dgr);
    if ((this.component = dgr.getComponent()) == null) {
      throw new IllegalArgumentException('null component');
    }
    if ((this.dragSource = dgr.getDragSource()) == null) {
      throw new IllegalArgumentException('null DragSource');
    }
    if (evs == null || evs.isEmpty()) {
      throw new IllegalArgumentException('null or empty list of events');
    }
    if (act !== DnDConstants.ACTION_COPY && act !== DnDConstants.ACTION_MOVE && act !== DnDConstants.ACTION_LINK) {
      throw new IllegalArgumentException('bad action');
    }
    if (ori == null) {
      throw new IllegalArgumentException('null origin');
    }
    this.events = evs;
    this.action_ = act;
    this.origin = ori;
    return this;
  }
  /**
   * Returns the source as a {@code DragGestureRecognizer}.
   *
   * @return the source as a {@code DragGestureRecognizer}
   */
  getSourceAsDragGestureRecognizer(): DragGestureRecognizer {
    return this.getSource();
  }
  /**
   * Returns the {@code Component} associated
   * with this {@code DragGestureEvent}.
   *
   * @return the Component
   */
  getComponent(): Component {
    return this.component;
  }
  /**
   * Returns the {@code DragSource}.
   *
   * @return the {@code DragSource}
   */
  getDragSource(): DragSource {
    return this.dragSource;
  }
  /**
   * Returns an {@code int} representing the
   * action selected by the user.
   *
   * @return the action selected by the user
   */
  getDragAction(): number {
    return this.action_;
  }
  /**
   * Starts the drag given the initial {@code Cursor} to display,
   * the {@code Transferable} object,
   * and the {@code DragSourceListener} to use.
   *
   * @param dragCursor     The initial {@code Cursor} for this drag operation
   *                       or {@code null} for the default cursor handling;
   *                       see
   *                       <a href="DragSourceContext.html#defaultCursor">DragSourceContext</a>
   *                       for more details on the cursor handling mechanism
   *                       during drag and drop
   * @param transferable The source's Transferable
   * @param dsl          The source's DragSourceListener
   *
   * @throws InvalidDnDOperationException if
   * the Drag and Drop system is unable to
   * initiate a drag operation, or if the user
   * attempts to start a drag while an existing
   * drag operation is still executing.
   */
  startDrag$Cursor$Transferable$DragSourceListener(dragCursor: Cursor, transferable: Transferable, dsl: DragSourceListener): void {
    this.dragSource.startDrag$DragGestureEvent$Cursor$Transferable$DragSourceListener(this, dragCursor, transferable, dsl);
  }
  /**
   * Start the drag given the initial {@code Cursor} to display,
   * a drag {@code Image}, the offset of
   * the {@code Image},
   * the {@code Transferable} object, and
   * the {@code DragSourceListener} to use.
   *
   * @param dragCursor     The initial {@code Cursor} for this drag operation
   *                       or {@code null} for the default cursor handling;
   *                       see
   *                       <a href="DragSourceContext.html#defaultCursor">DragSourceContext</a>
   *                       for more details on the cursor handling mechanism
   *                       during drag and drop
   * @param dragImage    The source's dragImage
   * @param imageOffset  The dragImage's offset
   * @param transferable The source's Transferable
   * @param dsl          The source's DragSourceListener
   *
   * @throws InvalidDnDOperationException if
   * the Drag and Drop system is unable to
   * initiate a drag operation, or if the user
   * attempts to start a drag while an existing
   * drag operation is still executing.
   */
  startDrag$Cursor$Image$Point$Transferable$DragSourceListener(dragCursor: Cursor, dragImage: Image, imageOffset: Point, transferable: Transferable, dsl: DragSourceListener): void {
    this.dragSource.startDrag$DragGestureEvent$Cursor$Image$Point$Transferable$DragSourceListener(this, dragCursor, dragImage, imageOffset, transferable, dsl);
  }
}

$J.define(DragGestureEvent, 'java.awt.dnd.DragGestureEvent', { kind: 'class', sup: 'java.util.EventObject', ctors: { 'java.awt.dnd.DragGestureRecognizer,int,java.awt.Point,java.util.List': '_DragGestureEvent' }, meths: { 'startDrag(java.awt.Cursor,java.awt.Image,java.awt.Point,java.awt.datatransfer.Transferable,java.awt.dnd.DragSourceListener)': 'startDrag$Cursor$Image$Point$Transferable$DragSourceListener', 'startDrag(java.awt.Cursor,java.awt.datatransfer.Transferable,java.awt.dnd.DragSourceListener)': 'startDrag$Cursor$Transferable$DragSourceListener', 'startDrag(java.awt.Cursor,java.awt.datatransfer.Transferable)': 'startDrag$Cursor$Transferable', 'toArray(java.lang.Object[])': 'toArray$ObjectArr', 'toArray()': 'toArray$' } });
$J.module(() => {
  DnDConstants = $J.load('java.awt.dnd.DnDConstants');
});
