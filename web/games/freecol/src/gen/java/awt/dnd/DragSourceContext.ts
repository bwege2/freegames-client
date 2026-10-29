// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DragSourceContext.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject, NullPointerException, Toolkit } from '../../../../jre/index.ts';

let AWTError, DnDConstants, DragSource, AWTAccessor, ComponentFactory;

/**
 * The {@code DragSourceContext} class is responsible for managing the
 * initiator side of the Drag and Drop protocol. In particular, it is responsible
 * for managing drag event notifications to the
 * {@linkplain DragSourceListener DragSourceListeners}
 * and {@linkplain DragSourceMotionListener DragSourceMotionListeners}, and providing the
 * {@link Transferable} representing the source data for the drag operation.
 * <p>
 * Note that the {@code DragSourceContext} itself
 * implements the {@code DragSourceListener} and
 * {@code DragSourceMotionListener} interfaces.
 * This is to allow the platform peer
 * (the {@link DragSourceContextPeer} instance)
 * created by the {@link DragSource} to notify
 * the {@code DragSourceContext} of
 * state changes in the ongoing operation. This allows the
 * {@code DragSourceContext} object to interpose
 * itself between the platform and the
 * listeners provided by the initiator of the drag operation.
 * <p>
 * <a id="defaultCursor"></a>
 * By default, {@code DragSourceContext} sets the cursor as appropriate
 * for the current state of the drag and drop operation. For example, if
 * the user has chosen {@linkplain DnDConstants#ACTION_MOVE the move action},
 * and the pointer is over a target that accepts
 * the move action, the default move cursor is shown. When
 * the pointer is over an area that does not accept the transfer,
 * the default "no drop" cursor is shown.
 * <p>
 * This default handling mechanism is disabled when a custom cursor is set
 * by the {@link #setCursor} method. When the default handling is disabled,
 * it becomes the responsibility
 * of the developer to keep the cursor up to date, by listening
 * to the {@code DragSource} events and calling the {@code setCursor()} method.
 * Alternatively, you can provide custom cursor behavior by providing
 * custom implementations of the {@code DragSource}
 * and the {@code DragSourceContext} classes.
 *
 * @see DragSourceListener
 * @see DragSourceMotionListener
 * @see DnDConstants
 * @since 1.2
 */
export class DragSourceContext extends JObject {
  /**
   * An {@code int} used by updateCurrentCursor()
   * indicating that the {@code Cursor} should change
   * to the default (no drop) {@code Cursor}.
   */
  static readonly DEFAULT: number = 0;
  /**
   * An {@code int} used by updateCurrentCursor()
   * indicating that the {@code Cursor}
   * has entered a {@code DropTarget}.
   */
  static readonly ENTER: number = 1;
  /**
   * An {@code int} used by updateCurrentCursor()
   * indicating that the {@code Cursor} is
   * over a {@code DropTarget}.
   */
  static readonly OVER: number = 2;
  /**
   * An {@code int} used by updateCurrentCursor()
   * indicating that the user operation has changed.
   */
  static readonly CHANGED: number = 3;
  static emptyTransferable: Transferable = null;
  peer: DragSourceContextPeer = null;
  /**
   * The event which triggered the start of the drag.
   *
   * @serial
   */
  trigger: DragGestureEvent = null;
  /**
   * The current drag cursor.
   *
   * @serial
   */
  cursor: Cursor = null;
  transferable: Transferable = null;
  listener: DragSourceListener = null;
  /**
   * {@code true} if the custom drag cursor is used instead of the
   * default one.
   *
   * @serial
   */
  useCustomCursor: boolean = false;
  /**
   * A bitwise mask of {@code DnDConstants} that represents the set of
   * drop actions supported by the drag source for the drag operation associated
   * with this {@code DragSourceContext.}
   *
   * @serial
   */
  sourceActions: number = 0;
  /**
   * Called from {@code DragSource}, this constructor creates a new
   * {@code DragSourceContext} given the
   * {@code DragSourceContextPeer} for this Drag, the
   * {@code DragGestureEvent} that triggered the Drag, the initial
   * {@code Cursor} to use for the Drag, an (optional)
   * {@code Image} to display while the Drag is taking place, the offset
   * of the {@code Image} origin from the hotspot at the instant of the
   * triggering event, the {@code Transferable} subject data, and the
   * {@code DragSourceListener} to use during the Drag and Drop
   * operation.
   * <br>
   * If {@code DragSourceContextPeer} is {@code null}
   * {@code NullPointerException} is thrown.
   * <br>
   * If {@code DragGestureEvent} is {@code null}
   * {@code NullPointerException} is thrown.
   * <br>
   * If {@code Cursor} is {@code null} no exception is thrown and
   * the default drag cursor behavior is activated for this drag operation.
   * <br>
   * If {@code Image} is {@code null} no exception is thrown.
   * <br>
   * If {@code Image} is not {@code null} and the offset is
   * {@code null NullPointerException} is thrown.
   * <br>
   * If {@code Transferable} is {@code null}
   * {@code NullPointerException} is thrown.
   * <br>
   * If {@code DragSourceListener} is {@code null} no exception
   * is thrown.
   *
   * @param trigger    the triggering event
   * @param dragCursor     the initial {@code Cursor} for this drag operation
   *                       or {@code null} for the default cursor handling;
   *                       see <a href="DragSourceContext.html#defaultCursor">class level documentation</a>
   *                       for more details on the cursor handling mechanism during drag and drop
   * @param dragImage  the {@code Image} to drag (or {@code null})
   * @param offset     the offset of the image origin from the hotspot at the
   *                   instant of the triggering event
   * @param t          the {@code Transferable}
   * @param dsl        the {@code DragSourceListener}
   *
   * @throws IllegalArgumentException if the {@code Component} associated
   *         with the trigger event is {@code null}.
   * @throws IllegalArgumentException if the {@code DragSource} for the
   *         trigger event is {@code null}.
   * @throws IllegalArgumentException if the drag action for the
   *         trigger event is {@code DnDConstants.ACTION_NONE}.
   * @throws IllegalArgumentException if the source actions for the
   *         {@code DragGestureRecognizer} associated with the trigger
   *         event are equal to {@code DnDConstants.ACTION_NONE}.
   * @throws NullPointerException if dscp, trigger, or t are null, or
   *         if dragImage is non-null and offset is null
   */
  _DragSourceContext(trigger: DragGestureEvent, dragCursor: Cursor, dragImage: Image, offset: Point, t: Transferable, dsl: DragSourceListener): this {
    let toolkit = Toolkit.getDefaultToolkit();
    if (!($J.isa(toolkit, ComponentFactory))) {
      throw new AWTError()._AWTError('Unsupported toolkit: ' + $J.str(toolkit));
    }
    let dscp = (toolkit).createDragSourceContextPeer(trigger);
    if (dscp == null) {
      throw new NullPointerException('DragSourceContextPeer');
    }
    if (trigger == null) {
      throw new NullPointerException('Trigger');
    }
    if (trigger.getDragSource() == null) {
      throw new IllegalArgumentException('DragSource');
    }
    if (trigger.getComponent() == null) {
      throw new IllegalArgumentException('Component');
    }
    if (trigger.getSourceAsDragGestureRecognizer().getSourceActions() === DnDConstants.ACTION_NONE) {
      throw new IllegalArgumentException('source actions');
    }
    if (trigger.getDragAction() === DnDConstants.ACTION_NONE) {
      throw new IllegalArgumentException('no drag action');
    }
    if (t == null) {
      throw new NullPointerException('Transferable');
    }
    if (dragImage != null && offset == null) {
      throw new NullPointerException('offset');
    }
    this.peer = dscp;
    this.trigger = trigger;
    this.cursor = dragCursor;
    this.transferable = t;
    this.listener = dsl;
    this.sourceActions = trigger.getSourceAsDragGestureRecognizer().getSourceActions();
    this.useCustomCursor = (dragCursor != null);
    this.updateCurrentCursor(trigger.getDragAction(), this.getSourceActions(), DragSourceContext.DEFAULT);
    return this;
  }
  /**
   * Returns the {@code Component} associated with this
   * {@code DragSourceContext}.
   *
   * @return the {@code Component} that started the drag
   */
  getComponent(): Component {
    return this.trigger.getComponent();
  }
  /**
   * Returns a bitwise mask of {@code DnDConstants} that
   * represent the set of drop actions supported by the drag source for the
   * drag operation associated with this {@code DragSourceContext}.
   *
   * @return the drop actions supported by the drag source
   */
  getSourceActions(): number {
    return this.sourceActions;
  }
  /**
   * Returns the current custom drag {@code Cursor}.
   *
   * @return the current custom drag {@code Cursor}, if it was set
   *         otherwise returns {@code null}.
   * @see #setCursor
   */
  getCursor(): Cursor {
    return this.cursor;
  }
  /**
   * Returns the {@code Transferable} associated with
   * this {@code DragSourceContext}.
   *
   * @return the {@code Transferable}
   */
  getTransferable(): Transferable {
    return this.transferable;
  }
  /**
   * If the default drag cursor behavior is active, this method
   * sets the default drag cursor for the specified actions
   * supported by the drag source, the drop target action,
   * and status, otherwise this method does nothing.
   *
   * @param sourceAct the actions supported by the drag source
   * @param targetAct the drop target action
   * @param status one of the fields {@code DEFAULT},
   *               {@code ENTER}, {@code OVER},
   *               {@code CHANGED}
   */
  updateCurrentCursor(sourceAct: number, targetAct: number, status: number): void {
    if (this.useCustomCursor) {
      return;
    }
    let c = null;
    {
      let ra: number;
      switch (status) {
        default:
          targetAct = DnDConstants.ACTION_NONE;
        case DragSourceContext.ENTER:
        case DragSourceContext.OVER:
        case DragSourceContext.CHANGED:
          ra = sourceAct & targetAct;
          if (ra === DnDConstants.ACTION_NONE) {
            if ((sourceAct & DnDConstants.ACTION_LINK) === DnDConstants.ACTION_LINK) {
              c = DragSource.DefaultLinkNoDrop;
            } else if ((sourceAct & DnDConstants.ACTION_MOVE) === DnDConstants.ACTION_MOVE) {
              c = DragSource.DefaultMoveNoDrop;
            } else {
              c = DragSource.DefaultCopyNoDrop;
            }
          } else {
            if ((ra & DnDConstants.ACTION_LINK) === DnDConstants.ACTION_LINK) {
              c = DragSource.DefaultLinkDrop;
            } else if ((ra & DnDConstants.ACTION_MOVE) === DnDConstants.ACTION_MOVE) {
              c = DragSource.DefaultMoveDrop;
            } else {
              c = DragSource.DefaultCopyDrop;
            }
          }
      }
    }
    this.setCursorImpl(c);
  }
  setCursorImpl(c: Cursor): void {
    if (this.cursor == null || !this.cursor.equals(c)) {
      this.cursor = c;
      if (this.peer != null) {
        this.peer.setCursor(this.cursor);
      }
    }
  }
  static $clinit() {
    AWTAccessor.setDragSourceContextAccessor((dsc) => dsc.peer);
  }
}

$J.define(DragSourceContext, 'java.awt.dnd.DragSourceContext', { kind: 'class', ifaces: ['java.awt.dnd.DragSourceListener', 'java.awt.dnd.DragSourceMotionListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.awt.dnd.DragGestureEvent,java.awt.Cursor,java.awt.Image,java.awt.Point,java.awt.datatransfer.Transferable,java.awt.dnd.DragSourceListener': '_DragSourceContext' }, clinit: true, lazy: ['emptyTransferable'] });
$J.module(() => {
  AWTError = $J.load('java.awt.AWTError');
  DnDConstants = $J.load('java.awt.dnd.DnDConstants');
  DragSource = $J.load('java.awt.dnd.DragSource');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  ComponentFactory = $J.load('sun.awt.ComponentFactory');
});
