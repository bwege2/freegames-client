// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DropTarget.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, IllegalArgumentException, JObject, LightweightPeer, SystemFlavorMap, TooManyListenersException } from '../../../../jre/index.ts';

let GraphicsEnvironment, HeadlessException, DnDConstants, DropTargetContext, DropTargetEvent, DropTargetPeer, AWTAccessor;

/**
 * The {@code DropTarget} is associated
 * with a {@code Component} when that {@code Component}
 * wishes
 * to accept drops during Drag and Drop operations.
 * <P>
 *  Each
 * {@code DropTarget} is associated with a {@code FlavorMap}.
 * The default {@code FlavorMap} hereafter designates the
 * {@code FlavorMap} returned by {@code SystemFlavorMap.getDefaultFlavorMap()}.
 *
 * @since 1.2
 */
export class DropTarget extends JObject {
  /**
   * The DropTargetContext associated with this DropTarget.
   *
   * @serial
   */
  dropTargetContext: DropTargetContext = null;
  /**
   * The Component associated with this DropTarget.
   *
   * @serial
   */
  component: Component = null;
  componentPeer: ComponentPeer = null;
  nativePeer: DropTargetPeer = null;
  /**
   * Default permissible actions supported by this DropTarget.
   *
   * @see #setDefaultActions
   * @see #getDefaultActions
   * @serial
   */
  actions: number = 0;
  /**
   * {@code true} if the DropTarget is accepting Drag &amp; Drop operations.
   *
   * @serial
   */
  active: boolean = false;
  autoScroller: DropTarget$DropTargetAutoScroller = null;
  dtListener: DropTargetListener = null;
  flavorMap: FlavorMap = null;
  isDraggingInside: boolean = false;
  $init_DropTarget() {
    this.dropTargetContext = this.createDropTargetContext();
    this.actions = DnDConstants.ACTION_COPY_OR_MOVE;
    this.active = true;
  }
  /**
   * Creates a new DropTarget given the {@code Component}
   * to associate itself with, an {@code int} representing
   * the default acceptable action(s) to
   * support, a {@code DropTargetListener}
   * to handle event processing, a {@code boolean} indicating
   * if the {@code DropTarget} is currently accepting drops, and
   * a {@code FlavorMap} to use (or null for the default {@code FlavorMap}).
   * <P>
   * The Component will receive drops only if it is enabled.
   * @param c         The {@code Component} with which this {@code DropTarget} is associated
   * @param ops       The default acceptable actions for this {@code DropTarget}
   * @param dtl       The {@code DropTargetListener} for this {@code DropTarget}
   * @param act       Is the {@code DropTarget} accepting drops.
   * @param fm        The {@code FlavorMap} to use, or null for the default {@code FlavorMap}
   * @throws HeadlessException if GraphicsEnvironment.isHeadless()
   *            returns true
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  _DropTarget$Component$int$DropTargetListener$boolean$FlavorMap(c: Component, ops: number, dtl: DropTargetListener, act: boolean, fm: FlavorMap): this {
    this.$init_DropTarget();
    if (GraphicsEnvironment.isHeadless()) {
      throw new HeadlessException()._HeadlessException$();
    }
    this.component = c;
    this.setDefaultActions(ops);
    if (dtl != null) {
      try {
        this.addDropTargetListener(dtl);
      } catch ($e0) {
        if ($J.isa($e0, TooManyListenersException)) {
          let tmle = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    if (c != null) {
      c.setDropTarget(this);
      this.setActive(act);
    }
    if (fm != null) {
      this.flavorMap = fm;
    } else {
      this.flavorMap = SystemFlavorMap.getDefaultFlavorMap();
    }
    return this;
  }
  /**
   * Creates a {@code DropTarget} given the {@code Component}
   * to associate itself with, an {@code int} representing
   * the default acceptable action(s)
   * to support, a {@code DropTargetListener}
   * to handle event processing, and a {@code boolean} indicating
   * if the {@code DropTarget} is currently accepting drops.
   * <P>
   * The Component will receive drops only if it is enabled.
   * @param c         The {@code Component} with which this {@code DropTarget} is associated
   * @param ops       The default acceptable actions for this {@code DropTarget}
   * @param dtl       The {@code DropTargetListener} for this {@code DropTarget}
   * @param act       Is the {@code DropTarget} accepting drops.
   * @throws HeadlessException if GraphicsEnvironment.isHeadless()
   *            returns true
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  _DropTarget$Component$int$DropTargetListener$boolean(c: Component, ops: number, dtl: DropTargetListener, act: boolean): this {
    this._DropTarget$Component$int$DropTargetListener$boolean$FlavorMap(c, ops, dtl, act, null);
    return this;
  }
  /**
   * Creates a {@code DropTarget} given the {@code Component}
   * to associate itself with, an {@code int} representing
   * the default acceptable action(s) to support, and a
   * {@code DropTargetListener} to handle event processing.
   * <P>
   * The Component will receive drops only if it is enabled.
   * @param c         The {@code Component} with which this {@code DropTarget} is associated
   * @param ops       The default acceptable actions for this {@code DropTarget}
   * @param dtl       The {@code DropTargetListener} for this {@code DropTarget}
   * @throws HeadlessException if GraphicsEnvironment.isHeadless()
   *            returns true
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  _DropTarget$Component$int$DropTargetListener(c: Component, ops: number, dtl: DropTargetListener): this {
    this._DropTarget$Component$int$DropTargetListener$boolean(c, ops, dtl, true);
    return this;
  }
  /**
   * Note: this interface is required to permit the safe association
   * of a DropTarget with a Component in one of two ways, either:
   * {@code component.setDropTarget(droptarget);}
   * or {@code droptarget.setComponent(component);}
   * <P>
   * The Component will receive drops only if it is enabled.
   * @param c The new {@code Component} this {@code DropTarget}
   * is to be associated with.
   */
  setComponent(c: Component): void {
    if (this.component === c || this.component != null && this.component.equals(c)) {
      return;
    }
    let old = this.component;
    if (old != null) {
      this.clearAutoscroll();
      this.component = null;
      this.removeNotify();
      old.setDropTarget(null);
    }
    if ((this.component = c) != null) {
      try {
        c.setDropTarget(this);
      } catch ($e1) {
        if ($J.isa($e1, Exception)) {
          let e = $J.exc($e1);
          if (old != null) {
            old.setDropTarget(this);
            this.addNotify();
          }
        } else {
          throw $e1;
        }
      }
    }
  }
  /**
   * Sets the default acceptable actions for this {@code DropTarget}
   *
   * @param ops the default actions
   * @see java.awt.dnd.DnDConstants
   */
  setDefaultActions(ops: number): void {
    this.getDropTargetContext().setTargetActions(ops & (DnDConstants.ACTION_COPY_OR_MOVE | DnDConstants.ACTION_REFERENCE));
  }
  doSetDefaultActions(ops: number): void {
    this.actions = ops;
  }
  /**
   * Sets the DropTarget active if {@code true},
   * inactive if {@code false}.
   *
   * @param isActive sets the {@code DropTarget} (in)active.
   */
  setActive(isActive: boolean): void {
    if (isActive !== this.active) {
      this.active = isActive;
    }
    if (!this.active) {
      this.clearAutoscroll();
    }
  }
  /**
   * Reports whether or not
   * this {@code DropTarget}
   * is currently active (ready to accept drops).
   *
   * @return {@code true} if active, {@code false} if not
   */
  isActive(): boolean {
    return this.active;
  }
  /**
   * Adds a new {@code DropTargetListener} (UNICAST SOURCE).
   *
   * @param dtl The new {@code DropTargetListener}
   *
   * @throws TooManyListenersException if a
   * {@code DropTargetListener} is already added to this
   * {@code DropTarget}.
   */
  addDropTargetListener(dtl: DropTargetListener): void {
    if (dtl == null) {
      return;
    }
    if ($J.equals(this, dtl)) {
      throw new IllegalArgumentException('DropTarget may not be its own Listener');
    }
    if (this.dtListener == null) {
      this.dtListener = dtl;
    } else {
      throw new TooManyListenersException();
    }
  }
  /**
   * Calls {@code dragExit} on the registered
   * {@code DropTargetListener} and passes it
   * the specified {@code DropTargetEvent}.
   * Has no effect if this {@code DropTarget}
   * is not active.
   * <p>
   * This method itself does not throw any exception
   * for null parameter but for exceptions thrown by
   * the respective method of the listener.
   *
   * @param dte the {@code DropTargetEvent}
   *
   * @see #isActive
   */
  dragExit(dte: DropTargetEvent): void {
    this.isDraggingInside = false;
    if (!this.active) {
      return;
    }
    if (this.dtListener != null && this.active) {
      this.dtListener.dragExit(dte);
    }
    this.clearAutoscroll();
  }
  /**
   * Notify the DropTarget that it has been associated with a Component
   *
   *
   * This method is usually called from java.awt.Component.addNotify() of
   * the Component associated with this DropTarget to notify the DropTarget
   * that a ComponentPeer has been associated with that Component.
   *
   * Calling this method, other than to notify this DropTarget of the
   * association of the ComponentPeer with the Component may result in
   * a malfunction of the DnD system.
   */
  addNotify(): void {
    let acc = AWTAccessor.getComponentAccessor();
    let peer = acc.getPeer(this.component);
    if (peer == null || peer === this.componentPeer) {
      return;
    }
    this.componentPeer = peer;
    for (let c = this.component; c != null && $J.isa(peer, LightweightPeer); c = c.getParent()) {
      peer = acc.getPeer(c);
    }
    if ($J.isa(peer, DropTargetPeer)) {
      this.nativePeer = peer;
      (peer).addDropTarget(this);
    } else {
      this.nativePeer = null;
    }
  }
  /**
   * Notify the DropTarget that it has been disassociated from a Component
   *
   *
   * This method is usually called from java.awt.Component.removeNotify() of
   * the Component associated with this DropTarget to notify the DropTarget
   * that a ComponentPeer has been disassociated with that Component.
   *
   * Calling this method, other than to notify this DropTarget of the
   * disassociation of the ComponentPeer from the Component may result in
   * a malfunction of the DnD system.
   */
  removeNotify(): void {
    if (this.nativePeer != null) {
      this.nativePeer.removeDropTarget(this);
    }
    this.componentPeer = null;
    this.nativePeer = null;
    {
      if (this.isDraggingInside) {
        this.dragExit(new DropTargetEvent()._DropTargetEvent(this.getDropTargetContext()));
      }
    }
  }
  /**
   * Gets the {@code DropTargetContext} associated
   * with this {@code DropTarget}.
   *
   * @return the {@code DropTargetContext} associated with this {@code DropTarget}.
   */
  getDropTargetContext(): DropTargetContext {
    return this.dropTargetContext;
  }
  /**
   * Creates the DropTargetContext associated with this DropTarget.
   * Subclasses may override this method to instantiate their own
   * DropTargetContext subclass.
   *
   * This call is typically *only* called by the platform's
   * DropTargetContextPeer as a drag operation encounters this
   * DropTarget. Accessing the Context while no Drag is current
   * has undefined results.
   * @return the DropTargetContext associated with this DropTarget
   */
  createDropTargetContext(): DropTargetContext {
    return new DropTargetContext()._DropTargetContext(this);
  }
  /**
   * clear autoscrolling
   */
  clearAutoscroll(): void {
    if (this.autoScroller != null) {
      this.autoScroller.stop();
      this.autoScroller = null;
    }
  }
}

/**
 * this protected nested class implements autoscrolling
 */
export class DropTarget$DropTargetAutoScroller extends JObject {
  component: Component = null;
  autoScroll: Autoscroll = null;
  timer: Timer = null;
  locn: Point = null;
  prev_: Point = null;
  outer: Rectangle = null;
  inner: Rectangle = null;
  hysteresis: number = 0;
}

$J.define(DropTarget, 'java.awt.dnd.DropTarget', { kind: 'class', ifaces: ['java.awt.dnd.DropTargetListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.awt.Component,int,java.awt.dnd.DropTargetListener': '_DropTarget$Component$int$DropTargetListener', 'java.awt.Component,java.awt.dnd.DropTargetListener': '_DropTarget$Component$DropTargetListener', '': '_DropTarget$', 'java.awt.Component,int,java.awt.dnd.DropTargetListener,boolean': '_DropTarget$Component$int$DropTargetListener$boolean', 'java.awt.Component,int,java.awt.dnd.DropTargetListener,boolean,java.awt.datatransfer.FlavorMap': '_DropTarget$Component$int$DropTargetListener$boolean$FlavorMap' } });
$J.define(DropTarget$DropTargetAutoScroller, 'java.awt.dnd.DropTarget$DropTargetAutoScroller', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { 'java.awt.Component,java.awt.Point': '_DropTarget$DropTargetAutoScroller' } });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  HeadlessException = $J.load('java.awt.HeadlessException');
  DnDConstants = $J.load('java.awt.dnd.DnDConstants');
  DropTargetContext = $J.load('java.awt.dnd.DropTargetContext');
  DropTargetEvent = $J.load('java.awt.dnd.DropTargetEvent');
  DropTargetPeer = $J.load('java.awt.dnd.peer.DropTargetPeer');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
