// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/DragRecognitionSupport.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2008, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, JObject, SunDragSourceContextPeer } from '../../../../../jre/index.ts';

let DragSource, SwingUtilities, TransferHandler;

/**
 * Drag gesture recognition support for classes that have a
 * <code>TransferHandler</code>. The gesture for a drag in this class is a mouse
 * press followed by movement by <code>DragSource.getDragThreshold()</code>
 * pixels. An instance of this class is maintained per AppContext, and the
 * public static methods call into the appropriate instance.
 *
 * @author Shannon Hickey
 */
export class DragRecognitionSupport extends JObject {
  motionThreshold: number = 0;
  dndArmedEvent: MouseEvent = null;
  component: JComponent = null;
  _DragRecognitionSupport(): this {
    return this;
  }
  /**
   * Returns the DragRecognitionSupport for the caller's AppContext.
   */
  static getDragRecognitionSupport(): DragRecognitionSupport {
    let support = AppContext.getAppContext().get($J.cls(DragRecognitionSupport));
    if (support == null) {
      support = new DragRecognitionSupport()._DragRecognitionSupport();
      AppContext.getAppContext().put($J.cls(DragRecognitionSupport), support);
    }
    return support;
  }
  /**
   * Returns whether or not the event is potentially part of a drag sequence.
   */
  static mousePressed(me: MouseEvent): boolean {
    return DragRecognitionSupport.getDragRecognitionSupport().mousePressedImpl(me);
  }
  /**
   * If a dnd recognition has been going on, return the MouseEvent
   * that started the recognition. Otherwise, return null.
   */
  static mouseReleased(me: MouseEvent): MouseEvent {
    return DragRecognitionSupport.getDragRecognitionSupport().mouseReleasedImpl(me);
  }
  /**
   * Returns whether or not a drag gesture recognition is ongoing.
   */
  static mouseDragged(me: MouseEvent, bd: DragRecognitionSupport$BeforeDrag): boolean {
    return DragRecognitionSupport.getDragRecognitionSupport().mouseDraggedImpl(me, bd);
  }
  clearState(): void {
    this.dndArmedEvent = null;
    this.component = null;
  }
  mapDragOperationFromModifiers(me: MouseEvent, th: TransferHandler): number {
    if (th == null || !SwingUtilities.isLeftMouseButton(me)) {
      return TransferHandler.NONE;
    }
    return SunDragSourceContextPeer.convertModifiersToDropAction(me.getModifiersEx(), th.getSourceActions(this.component));
  }
  /**
   * Returns whether or not the event is potentially part of a drag sequence.
   */
  mousePressedImpl(me: MouseEvent): boolean {
    this.component = me.getSource();
    if (this.mapDragOperationFromModifiers(me, this.component.getTransferHandler()) !== TransferHandler.NONE) {
      this.motionThreshold = DragSource.getDragThreshold();
      this.dndArmedEvent = me;
      return true;
    }
    this.clearState();
    return false;
  }
  /**
   * If a dnd recognition has been going on, return the MouseEvent
   * that started the recognition. Otherwise, return null.
   */
  mouseReleasedImpl(me: MouseEvent): MouseEvent {
    if (this.dndArmedEvent == null) {
      return null;
    }
    let retEvent = null;
    if (me.getSource() === this.component) {
      retEvent = this.dndArmedEvent;
    }
    this.clearState();
    return retEvent;
  }
  /**
   * Returns whether or not a drag gesture recognition is ongoing.
   */
  mouseDraggedImpl(me: MouseEvent, bd: DragRecognitionSupport$BeforeDrag): boolean {
    if (this.dndArmedEvent == null) {
      return false;
    }
    if (me.getSource() !== this.component) {
      this.clearState();
      return false;
    }
    let dx = Math.abs((me.getX() - this.dndArmedEvent.getX()) | 0);
    let dy = Math.abs((me.getY() - this.dndArmedEvent.getY()) | 0);
    if ((dx > this.motionThreshold) || (dy > this.motionThreshold)) {
      let th = this.component.getTransferHandler();
      let action = this.mapDragOperationFromModifiers(me, th);
      if (action !== TransferHandler.NONE) {
        if (bd != null) {
          bd.dragStarting(this.dndArmedEvent);
        }
        th.exportAsDrag(this.component, this.dndArmedEvent, action);
        this.clearState();
      }
    }
    return true;
  }
}

/**
 * This interface allows us to pass in a handler to mouseDragged,
 * so that we can be notified immediately before a drag begins.
 */
export class DragRecognitionSupport$BeforeDrag {
}

$J.define(DragRecognitionSupport, 'javax.swing.plaf.basic.DragRecognitionSupport', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DragRecognitionSupport' } });
$J.define(DragRecognitionSupport$BeforeDrag, 'javax.swing.plaf.basic.DragRecognitionSupport$BeforeDrag', { kind: 'interface' });
$J.module(() => {
  DragSource = $J.load('java.awt.dnd.DragSource');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  TransferHandler = $J.load('javax.swing.TransferHandler');
});
