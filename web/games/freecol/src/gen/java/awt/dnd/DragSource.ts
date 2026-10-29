// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DragSource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AccessController, Exception, GetIntegerAction, JObject, RuntimeException, SunDragSourceContextPeer, SystemFlavorMap, Toolkit } from '../../../../jre/index.ts';

let GraphicsEnvironment, HeadlessException, DragSourceContext, InvalidDnDOperationException, AWTAccessor;

/**
 * The {@code DragSource} is the entity responsible
 * for the initiation of the Drag
 * and Drop operation, and may be used in a number of scenarios:
 * <UL>
 * <LI>1 default instance per JVM for the lifetime of that JVM.
 * <LI>1 instance per class of potential Drag Initiator object (e.g
 * TextField). [implementation dependent]
 * <LI>1 per instance of a particular
 * {@code Component}, or application specific
 * object associated with a {@code Component}
 * instance in the GUI. [implementation dependent]
 * <LI>Some other arbitrary association. [implementation dependent]
 * </UL>
 *
 * Once the {@code DragSource} is
 * obtained, a {@code DragGestureRecognizer} should
 * also be obtained to associate the {@code DragSource}
 * with a particular
 * {@code Component}.
 * <P>
 * The initial interpretation of the user's gesture,
 * and the subsequent starting of the drag operation
 * are the responsibility of the implementing
 * {@code Component}, which is usually
 * implemented by a {@code DragGestureRecognizer}.
 * <P>
 * When a drag gesture occurs, the
 * {@code DragSource}'s
 * startDrag() method shall be
 * invoked in order to cause processing
 * of the user's navigational
 * gestures and delivery of Drag and Drop
 * protocol notifications. A
 * {@code DragSource} shall only
 * permit a single Drag and Drop operation to be
 * current at any one time, and shall
 * reject any further startDrag() requests
 * by throwing an {@code IllegalDnDOperationException}
 * until such time as the extant operation is complete.
 * <P>
 * The startDrag() method invokes the
 * createDragSourceContext() method to
 * instantiate an appropriate
 * {@code DragSourceContext}
 * and associate the {@code DragSourceContextPeer}
 * with that.
 * <P>
 * If the Drag and Drop System is
 * unable to initiate a drag operation for
 * some reason, the startDrag() method throws
 * a {@code java.awt.dnd.InvalidDnDOperationException}
 * to signal such a condition. Typically this
 * exception is thrown when the underlying platform
 * system is either not in a state to
 * initiate a drag, or the parameters specified are invalid.
 * <P>
 * Note that during the drag, the
 * set of operations exposed by the source
 * at the start of the drag operation may not change
 * until the operation is complete.
 * The operation(s) are constant for the
 * duration of the operation with respect to the
 * {@code DragSource}.
 *
 * @since 1.2
 */
export class DragSource extends JObject {
  /**
   * The default {@code Cursor} to use with a copy operation indicating
   * that a drop is currently allowed. {@code null} if
   * {@code GraphicsEnvironment.isHeadless()} returns {@code true}.
   *
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static DefaultCopyDrop: Cursor = null;
  /**
   * The default {@code Cursor} to use with a move operation indicating
   * that a drop is currently allowed. {@code null} if
   * {@code GraphicsEnvironment.isHeadless()} returns {@code true}.
   *
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static DefaultMoveDrop: Cursor = null;
  /**
   * The default {@code Cursor} to use with a link operation indicating
   * that a drop is currently allowed. {@code null} if
   * {@code GraphicsEnvironment.isHeadless()} returns {@code true}.
   *
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static DefaultLinkDrop: Cursor = null;
  /**
   * The default {@code Cursor} to use with a copy operation indicating
   * that a drop is currently not allowed. {@code null} if
   * {@code GraphicsEnvironment.isHeadless()} returns {@code true}.
   *
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static DefaultCopyNoDrop: Cursor = null;
  /**
   * The default {@code Cursor} to use with a move operation indicating
   * that a drop is currently not allowed. {@code null} if
   * {@code GraphicsEnvironment.isHeadless()} returns {@code true}.
   *
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static DefaultMoveNoDrop: Cursor = null;
  /**
   * The default {@code Cursor} to use with a link operation indicating
   * that a drop is currently not allowed. {@code null} if
   * {@code GraphicsEnvironment.isHeadless()} returns {@code true}.
   *
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static DefaultLinkNoDrop: Cursor = null;
  static dflt: DragSource = null;
  /**
   * Internal constants for serialization.
   */
  static readonly dragSourceListenerK: string = 'dragSourceL';
  static readonly dragSourceMotionListenerK: string = 'dragSourceMotionL';
  flavorMap: FlavorMap = null;
  listener: DragSourceListener = null;
  motionListener: DragSourceMotionListener = null;
  /**
   * Creates a new {@code DragSource}.
   *
   * @throws HeadlessException if GraphicsEnvironment.isHeadless()
   *            returns true
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  _DragSource(): this {
    this.flavorMap = SystemFlavorMap.getDefaultFlavorMap();
    if (GraphicsEnvironment.isHeadless()) {
      throw new HeadlessException()._HeadlessException$();
    }
    return this;
  }
  static load(name: string): Cursor {
    if (GraphicsEnvironment.isHeadless()) {
      return null;
    }
    try {
      return Toolkit.getDefaultToolkit().getDesktopProperty(name);
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        e.printStackTrace();
        throw new RuntimeException('failed to load system cursor: ' + name + ' : ' + e.getMessage());
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Gets the {@code DragSource} object associated with
   * the underlying platform.
   *
   * @return the platform DragSource
   * @throws HeadlessException if GraphicsEnvironment.isHeadless()
   *            returns true
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static getDefaultDragSource(): DragSource {
    if (GraphicsEnvironment.isHeadless()) {
      throw new HeadlessException()._HeadlessException$();
    } else {
      return DragSource.dflt;
    }
  }
  /**
   * Start a drag, given the {@code DragGestureEvent}
   * that initiated the drag, the initial
   * {@code Cursor} to use,
   * the {@code Image} to drag,
   * the offset of the {@code Image} origin
   * from the hotspot of the {@code Cursor} at
   * the instant of the trigger,
   * the {@code Transferable} subject data
   * of the drag, the {@code DragSourceListener},
   * and the {@code FlavorMap}.
   *
   * @param trigger        the {@code DragGestureEvent} that initiated the drag
   * @param dragCursor     the initial {@code Cursor} for this drag operation
   *                       or {@code null} for the default cursor handling;
   *                       see <a href="DragSourceContext.html#defaultCursor">DragSourceContext</a>
   *                       for more details on the cursor handling mechanism during drag and drop
   * @param dragImage      the image to drag or {@code null}
   * @param imageOffset    the offset of the {@code Image} origin from the hotspot
   *                       of the {@code Cursor} at the instant of the trigger
   * @param transferable   the subject data of the drag
   * @param dsl            the {@code DragSourceListener}
   * @param flavorMap      the {@code FlavorMap} to use, or {@code null}
   *
   * @throws java.awt.dnd.InvalidDnDOperationException
   *    if the Drag and Drop
   *    system is unable to initiate a drag operation, or if the user
   *    attempts to start a drag while an existing drag operation
   *    is still executing
   */
  startDrag$DragGestureEvent$Cursor$Image$Point$Transferable$DragSourceListener$FlavorMap(trigger: DragGestureEvent, dragCursor: Cursor, dragImage: Image, imageOffset: Point, transferable: Transferable, dsl: DragSourceListener, flavorMap: FlavorMap): void {
    SunDragSourceContextPeer.setDragDropInProgress(true);
    try {
      if (flavorMap != null) {
        this.flavorMap = flavorMap;
      }
      let dsc = this.createDragSourceContext(trigger, dragCursor, dragImage, imageOffset, transferable, dsl);
      if (dsc == null) {
        throw new InvalidDnDOperationException()._InvalidDnDOperationException$();
      }
      let acc = AWTAccessor.getDragSourceContextAccessor();
      $J.fn(acc, 'getPeer')(dsc).startDrag(dsc, dsc.getCursor(), dragImage, imageOffset);
    } catch ($e1) {
      if ($J.isa($e1, RuntimeException)) {
        let e = $J.exc($e1);
        SunDragSourceContextPeer.setDragDropInProgress(false);
        throw e;
      } else {
        throw $e1;
      }
    }
  }
  /**
   * Start a drag, given the {@code DragGestureEvent}
   * that initiated the drag, the initial {@code Cursor}
   * to use,
   * the {@code Image} to drag,
   * the offset of the {@code Image} origin
   * from the hotspot of the {@code Cursor}
   * at the instant of the trigger,
   * the subject data of the drag, and
   * the {@code DragSourceListener}.
   *
   * @param trigger           the {@code DragGestureEvent} that initiated the drag
   * @param dragCursor     the initial {@code Cursor} for this drag operation
   *                       or {@code null} for the default cursor handling;
   *                       see <a href="DragSourceContext.html#defaultCursor">DragSourceContext</a>
   *                       for more details on the cursor handling mechanism during drag and drop
   * @param dragImage         the {@code Image} to drag or {@code null}
   * @param dragOffset        the offset of the {@code Image} origin from the hotspot
   *                          of the {@code Cursor} at the instant of the trigger
   * @param transferable      the subject data of the drag
   * @param dsl               the {@code DragSourceListener}
   *
   * @throws java.awt.dnd.InvalidDnDOperationException
   *    if the Drag and Drop
   *    system is unable to initiate a drag operation, or if the user
   *    attempts to start a drag while an existing drag operation
   *    is still executing
   */
  startDrag$DragGestureEvent$Cursor$Image$Point$Transferable$DragSourceListener(trigger: DragGestureEvent, dragCursor: Cursor, dragImage: Image, dragOffset: Point, transferable: Transferable, dsl: DragSourceListener): void {
    this.startDrag$DragGestureEvent$Cursor$Image$Point$Transferable$DragSourceListener$FlavorMap(trigger, dragCursor, dragImage, dragOffset, transferable, dsl, null);
  }
  /**
   * Start a drag, given the {@code DragGestureEvent}
   * that initiated the drag, the initial
   * {@code Cursor} to
   * use,
   * the {@code Transferable} subject data
   * of the drag, and the {@code DragSourceListener}.
   *
   * @param trigger        the {@code DragGestureEvent} that initiated the drag
   * @param dragCursor     the initial {@code Cursor} for this drag operation
   *                       or {@code null} for the default cursor handling;
   *                       see <a href="DragSourceContext.html#defaultCursor">DragSourceContext</a> class
   *                       for more details on the cursor handling mechanism during drag and drop
   * @param transferable      the subject data of the drag
   * @param dsl               the {@code DragSourceListener}
   *
   * @throws java.awt.dnd.InvalidDnDOperationException
   *    if the Drag and Drop
   *    system is unable to initiate a drag operation, or if the user
   *    attempts to start a drag while an existing drag operation
   *    is still executing
   */
  startDrag$DragGestureEvent$Cursor$Transferable$DragSourceListener(trigger: DragGestureEvent, dragCursor: Cursor, transferable: Transferable, dsl: DragSourceListener): void {
    this.startDrag$DragGestureEvent$Cursor$Image$Point$Transferable$DragSourceListener$FlavorMap(trigger, dragCursor, null, null, transferable, dsl, null);
  }
  /**
   * Creates the {@code DragSourceContext} to handle the current drag
   * operation.
   * <p>
   * To incorporate a new {@code DragSourceContext}
   * subclass, subclass {@code DragSource} and
   * override this method.
   * <p>
   * If {@code dragImage} is {@code null}, no image is used
   * to represent the drag over feedback for this drag operation, but
   * {@code NullPointerException} is not thrown.
   * <p>
   * If {@code dsl} is {@code null}, no drag source listener
   * is registered with the created {@code DragSourceContext},
   * but {@code NullPointerException} is not thrown.
   *
   * @param dgl           The {@code DragGestureEvent} that triggered the
   *                      drag
   * @param dragCursor     The initial {@code Cursor} for this drag operation
   *                       or {@code null} for the default cursor handling;
   *                       see <a href="DragSourceContext.html#defaultCursor">DragSourceContext</a> class
   *                       for more details on the cursor handling mechanism during drag and drop
   * @param dragImage     The {@code Image} to drag or {@code null}
   * @param imageOffset   The offset of the {@code Image} origin from the
   *                      hotspot of the cursor at the instant of the trigger
   * @param t             The subject data of the drag
   * @param dsl           The {@code DragSourceListener}
   *
   * @return the {@code DragSourceContext}
   *
   * @throws NullPointerException if {@code dscp} is {@code null}
   * @throws NullPointerException if {@code dgl} is {@code null}
   * @throws NullPointerException if {@code dragImage} is not
   *    {@code null} and {@code imageOffset} is {@code null}
   * @throws NullPointerException if {@code t} is {@code null}
   * @throws IllegalArgumentException if the {@code Component}
   *         associated with the trigger event is {@code null}.
   * @throws IllegalArgumentException if the {@code DragSource} for the
   *         trigger event is {@code null}.
   * @throws IllegalArgumentException if the drag action for the
   *         trigger event is {@code DnDConstants.ACTION_NONE}.
   * @throws IllegalArgumentException if the source actions for the
   *         {@code DragGestureRecognizer} associated with the trigger
   *         event are equal to {@code DnDConstants.ACTION_NONE}.
   */
  createDragSourceContext(dgl: DragGestureEvent, dragCursor: Cursor, dragImage: Image, imageOffset: Point, t: Transferable, dsl: DragSourceListener): DragSourceContext {
    return new DragSourceContext()._DragSourceContext(dgl, dragCursor, dragImage, imageOffset, t, dsl);
  }
  /**
   * Returns the drag gesture motion threshold. The drag gesture motion threshold
   * defines the recommended behavior for {@link MouseDragGestureRecognizer}s.
   * <p>
   * If the system property {@code awt.dnd.drag.threshold} is set to
   * a positive integer, this method returns the value of the system property;
   * otherwise if a pertinent desktop property is available and supported by
   * the implementation of the Java platform, this method returns the value of
   * that property; otherwise this method returns some default value.
   * The pertinent desktop property can be queried using
   * {@code java.awt.Toolkit.getDesktopProperty("DnD.gestureMotionThreshold")}.
   *
   * @return the drag gesture motion threshold
   * @see MouseDragGestureRecognizer
   * @since 1.5
   */
  static getDragThreshold(): number {
    let ts = (+AccessController.doPrivileged(new GetIntegerAction('awt.dnd.drag.threshold', 0)));
    if (ts > 0) {
      return ts;
    } else {
      let td = Toolkit.getDefaultToolkit().getDesktopProperty('DnD.gestureMotionThreshold');
      if (td != null) {
        return (+td);
      }
    }
    return 5;
  }
  static $clinit() {
    DragSource.DefaultCopyDrop = DragSource.load('DnD.Cursor.CopyDrop');
    DragSource.DefaultMoveDrop = DragSource.load('DnD.Cursor.MoveDrop');
    DragSource.DefaultLinkDrop = DragSource.load('DnD.Cursor.LinkDrop');
    DragSource.DefaultCopyNoDrop = DragSource.load('DnD.Cursor.CopyNoDrop');
    DragSource.DefaultMoveNoDrop = DragSource.load('DnD.Cursor.MoveNoDrop');
    DragSource.DefaultLinkNoDrop = DragSource.load('DnD.Cursor.LinkNoDrop');
    DragSource.dflt = (GraphicsEnvironment.isHeadless()) ? null : new DragSource()._DragSource();
  }
}

$J.define(DragSource, 'java.awt.dnd.DragSource', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_DragSource' }, meths: { 'startDrag(java.awt.dnd.DragGestureEvent,java.awt.Cursor,java.awt.datatransfer.Transferable,java.awt.dnd.DragSourceListener)': 'startDrag$DragGestureEvent$Cursor$Transferable$DragSourceListener', 'startDrag(java.awt.dnd.DragGestureEvent,java.awt.Cursor,java.awt.Image,java.awt.Point,java.awt.datatransfer.Transferable,java.awt.dnd.DragSourceListener)': 'startDrag$DragGestureEvent$Cursor$Image$Point$Transferable$DragSourceListener', 'startDrag(java.awt.dnd.DragGestureEvent,java.awt.Cursor,java.awt.datatransfer.Transferable,java.awt.dnd.DragSourceListener,java.awt.datatransfer.FlavorMap)': 'startDrag$DragGestureEvent$Cursor$Transferable$DragSourceListener$FlavorMap', 'startDrag(java.awt.dnd.DragGestureEvent,java.awt.Cursor,java.awt.Image,java.awt.Point,java.awt.datatransfer.Transferable,java.awt.dnd.DragSourceListener,java.awt.datatransfer.FlavorMap)': 'startDrag$DragGestureEvent$Cursor$Image$Point$Transferable$DragSourceListener$FlavorMap' }, clinit: true, lazy: ['DefaultCopyDrop', 'DefaultMoveDrop', 'DefaultLinkDrop', 'DefaultCopyNoDrop', 'DefaultMoveNoDrop', 'DefaultLinkNoDrop', 'dflt'] });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  HeadlessException = $J.load('java.awt.HeadlessException');
  DragSourceContext = $J.load('java.awt.dnd.DragSourceContext');
  InvalidDnDOperationException = $J.load('java.awt.dnd.InvalidDnDOperationException');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
