// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DragGestureRecognizer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, IllegalArgumentException, JObject, TooManyListenersException } from '../../../../jre/index.ts';

let DnDConstants, DragGestureEvent;

/**
 * The {@code DragGestureRecognizer} is an
 * abstract base class for the specification
 * of a platform-dependent listener that can be associated with a particular
 * {@code Component} in order to
 * identify platform-dependent drag initiating gestures.
 * <p>
 * The appropriate {@code DragGestureRecognizer}
 * subclass instance is obtained from the
 * {@link DragSource} associated with
 * a particular {@code Component}, or from the {@code Toolkit} object via its
 * {@link java.awt.Toolkit#createDragGestureRecognizer createDragGestureRecognizer()}
 * method.
 * <p>
 * Once the {@code DragGestureRecognizer}
 * is associated with a particular {@code Component}
 * it will register the appropriate listener interfaces on that
 * {@code Component}
 * in order to track the input events delivered to the {@code Component}.
 * <p>
 * Once the {@code DragGestureRecognizer} identifies a sequence of events
 * on the {@code Component} as a drag initiating gesture, it will notify
 * its unicast {@code DragGestureListener} by
 * invoking its
 * {@link java.awt.dnd.DragGestureListener#dragGestureRecognized gestureRecognized()}
 * method.
 * <P>
 * When a concrete {@code DragGestureRecognizer}
 * instance detects a drag initiating
 * gesture on the {@code Component} it is associated with,
 * it fires a {@link DragGestureEvent} to
 * the {@code DragGestureListener} registered on
 * its unicast event source for {@code DragGestureListener}
 * events. This {@code DragGestureListener} is responsible
 * for causing the associated
 * {@code DragSource} to start the Drag and Drop operation (if
 * appropriate).
 *
 * @author Laurence P. G. Cable
 * @see java.awt.dnd.DragGestureListener
 * @see java.awt.dnd.DragGestureEvent
 * @see java.awt.dnd.DragSource
 */
export class DragGestureRecognizer extends JObject {
  /**
   * The {@code DragSource}
   * associated with this
   * {@code DragGestureRecognizer}.
   *
   * @serial
   */
  dragSource: DragSource = null;
  /**
   * The {@code Component}
   * associated with this {@code DragGestureRecognizer}.
   *
   * @serial
   */
  component: Component = null;
  /**
   * The {@code DragGestureListener}
   * associated with this {@code DragGestureRecognizer}.
   */
  dragGestureListener: DragGestureListener = null;
  /**
   * An {@code int} representing
   * the type(s) of action(s) used
   * in this Drag and Drop operation.
   *
   * @serial
   */
  sourceActions: number = 0;
  /**
   * The list of events (in order) that
   * the {@code DragGestureRecognizer}
   * "recognized" as a "gesture" that triggers a drag.
   *
   * @serial
   */
  events: ArrayList<InputEvent> = null;
  $init_DragGestureRecognizer() {
    this.events = new ArrayList(1);
  }
  /**
   * Construct a new {@code DragGestureRecognizer}
   * given the {@code DragSource} to be used
   * in this Drag and Drop operation, the {@code Component}
   * this {@code DragGestureRecognizer} should "observe"
   * for drag initiating gestures, the action(s) supported
   * for this Drag and Drop operation, and the
   * {@code DragGestureListener} to notify
   * once a drag initiating gesture has been detected.
   *
   * @param ds  the {@code DragSource} this
   * {@code DragGestureRecognizer}
   * will use to process the Drag and Drop operation
   *
   * @param c the {@code Component}
   * this {@code DragGestureRecognizer}
   * should "observe" the event stream to,
   * in order to detect a drag initiating gesture.
   * If this value is {@code null}, the
   * {@code DragGestureRecognizer}
   * is not associated with any {@code Component}.
   *
   * @param sa  the set (logical OR) of the
   * {@code DnDConstants}
   * that this Drag and Drop operation will support
   *
   * @param dgl the {@code DragGestureRecognizer}
   * to notify when a drag gesture is detected
   *
   * @throws IllegalArgumentException
   * if ds is {@code null}.
   */
  _DragGestureRecognizer$DragSource$Component$int$DragGestureListener(ds: DragSource, c: Component, sa: number, dgl: DragGestureListener): this {
    this.$init_DragGestureRecognizer();
    if (ds == null) {
      throw new IllegalArgumentException('null DragSource');
    }
    this.dragSource = ds;
    this.component = c;
    this.sourceActions = sa & (DnDConstants.ACTION_COPY_OR_MOVE | DnDConstants.ACTION_LINK);
    try {
      if (dgl != null) {
        this.addDragGestureListener(dgl);
      }
    } catch ($e0) {
      if ($J.isa($e0, TooManyListenersException)) {
        let tmle = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
    return this;
  }
  /**
   * This method returns the {@code DragSource}
   * this {@code DragGestureRecognizer}
   * will use in order to process the Drag and Drop
   * operation.
   *
   * @return the DragSource
   */
  getDragSource(): DragSource {
    return this.dragSource;
  }
  /**
   * This method returns the {@code Component}
   * that is to be "observed" by the
   * {@code DragGestureRecognizer}
   * for drag initiating gestures.
   *
   * @return The Component this DragGestureRecognizer
   * is associated with
   */
  getComponent(): Component {
    return this.component;
  }
  /**
   * set the Component that the DragGestureRecognizer is associated with
   *
   * registerListeners() and unregisterListeners() are called as a side
   * effect as appropriate.
   *
   * @param c The {@code Component} or {@code null}
   */
  setComponent(c: Component): void {
    if (this.component != null && this.dragGestureListener != null) {
      this.unregisterListeners();
    }
    this.component = c;
    if (this.component != null && this.dragGestureListener != null) {
      this.registerListeners();
    }
  }
  /**
   * This method returns an int representing the
   * type of action(s) this Drag and Drop
   * operation will support.
   *
   * @return the currently permitted source action(s)
   */
  getSourceActions(): number {
    return this.sourceActions;
  }
  /**
   * This method sets the permitted source drag action(s)
   * for this Drag and Drop operation.
   *
   * @param actions the permitted source drag action(s)
   */
  setSourceActions(actions: number): void {
    this.sourceActions = actions & (DnDConstants.ACTION_COPY_OR_MOVE | DnDConstants.ACTION_LINK);
  }
  /**
   * Register a new {@code DragGestureListener}.
   *
   * @param dgl the {@code DragGestureListener} to register
   * with this {@code DragGestureRecognizer}.
   *
   * @throws java.util.TooManyListenersException if a
   * {@code DragGestureListener} has already been added.
   */
  addDragGestureListener(dgl: DragGestureListener): void {
    if (this.dragGestureListener != null) {
      throw new TooManyListenersException();
    } else {
      this.dragGestureListener = dgl;
      if (this.component != null) {
        this.registerListeners();
      }
    }
  }
  /**
   * Notify the DragGestureListener that a Drag and Drop initiating
   * gesture has occurred. Then reset the state of the Recognizer.
   *
   * @param dragAction The action initially selected by the users gesture
   * @param p          The point (in Component coords) where the gesture originated
   */
  fireDragGestureRecognized(dragAction: number, p: Point): void {
    try {
      if (this.dragGestureListener != null) {
        this.dragGestureListener.dragGestureRecognized(new DragGestureEvent()._DragGestureEvent(this, dragAction, p, this.events));
      }
    } finally {
      this.events.clear();
    }
  }
  /**
   * Listeners registered on the Component by this Recognizer shall record
   * all Events that are recognized as part of the series of Events that go
   * to comprise a Drag and Drop initiating gesture via this API.
   * <P>
   * This method is used by a {@code DragGestureRecognizer}
   * implementation to add an {@code InputEvent}
   * subclass (that it believes is one in a series
   * of events that comprise a Drag and Drop operation)
   * to the array of events that this
   * {@code DragGestureRecognizer} maintains internally.
   *
   * @param awtie the {@code InputEvent}
   * to add to this {@code DragGestureRecognizer}'s
   * internal array of events. Note that {@code null}
   * is not a valid value, and will be ignored.
   */
  appendEvent(awtie: InputEvent): void {
    this.events.add(awtie);
  }
}

$J.define(DragGestureRecognizer, 'java.awt.dnd.DragGestureRecognizer', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.awt.dnd.DragSource': '_DragGestureRecognizer$DragSource', 'java.awt.dnd.DragSource,java.awt.Component': '_DragGestureRecognizer$DragSource$Component', 'java.awt.dnd.DragSource,java.awt.Component,int': '_DragGestureRecognizer$DragSource$Component$int', 'java.awt.dnd.DragSource,java.awt.Component,int,java.awt.dnd.DragGestureListener': '_DragGestureRecognizer$DragSource$Component$int$DragGestureListener' } });
$J.module(() => {
  DnDConstants = $J.load('java.awt.dnd.DnDConstants');
  DragGestureEvent = $J.load('java.awt.dnd.DragGestureEvent');
});
