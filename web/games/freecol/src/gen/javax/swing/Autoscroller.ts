// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/Autoscroller.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2006, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

let MouseEvent, Timer, AWTAccessor;

/**
 * Autoscroller is responsible for generating synthetic mouse dragged
 * events. It is the responsibility of the Component (or its MouseListeners)
 * that receive the events to do the actual scrolling in response to the
 * mouse dragged events.
 *
 * @author Dave Moore
 * @author Scott Violet
 */
export class Autoscroller extends JObject {
  /**
   * Global Autoscroller.
   */
  static sharedInstance: Autoscroller = null;
  static event: MouseEvent = null;
  static timer: Timer = null;
  static component: JComponent = null;
  _Autoscroller(): this {
    return this;
  }
  /**
   * Stops autoscroll events from happening on the specified component.
   */
  static stop(c: JComponent): void {
    Autoscroller.sharedInstance._stop(c);
  }
  /**
   * Stops autoscroll events from happening on the specified component.
   */
  static isRunning(c: JComponent): boolean {
    return Autoscroller.sharedInstance._isRunning(c);
  }
  /**
   * Invoked when a mouse dragged event occurs, will start the autoscroller
   * if necessary.
   */
  static processMouseDragged(e: MouseEvent): void {
    Autoscroller.sharedInstance._processMouseDragged(e);
  }
  /**
   * Starts the timer targeting the passed in component.
   */
  start(c: JComponent, e: MouseEvent): void {
    let screenLocation = c.getLocationOnScreen();
    if (Autoscroller.component !== c) {
      this._stop(Autoscroller.component);
    }
    Autoscroller.component = c;
    Autoscroller.event = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(Autoscroller.component, e.getID(), e.getWhen(), e.getModifiers(), (e.getX() + screenLocation.x_) | 0, (e.getY() + screenLocation.y_) | 0, e.getXOnScreen(), e.getYOnScreen(), e.getClickCount(), e.isPopupTrigger(), MouseEvent.NOBUTTON);
    let meAccessor = AWTAccessor.getMouseEventAccessor();
    meAccessor.setCausedByTouchEvent(Autoscroller.event, meAccessor.isCausedByTouchEvent(e));
    if (Autoscroller.timer == null) {
      Autoscroller.timer = new Timer()._Timer(100, $J.fn(this, 'actionPerformed'));
    }
    if (!Autoscroller.timer.isRunning()) {
      Autoscroller.timer.start();
    }
  }
  /**
   * Stops scrolling for the passed in widget.
   */
  _stop(c: JComponent): void {
    if (Autoscroller.component === c) {
      if (Autoscroller.timer != null) {
        Autoscroller.timer.stop();
      }
      Autoscroller.timer = null;
      Autoscroller.event = null;
      Autoscroller.component = null;
    }
  }
  /**
   * Returns true if autoscrolling is currently running for the specified
   * widget.
   */
  _isRunning(c: JComponent): boolean {
    return (c === Autoscroller.component && Autoscroller.timer != null && Autoscroller.timer.isRunning());
  }
  /**
   * MouseListener method, invokes start/stop as necessary.
   */
  _processMouseDragged(e: MouseEvent): void {
    let component = e.getComponent();
    let stop = true;
    if (component.isShowing()) {
      let visibleRect = component.getVisibleRect();
      stop = visibleRect.contains$int$int(e.getX(), e.getY());
    }
    if (stop) {
      this._stop(component);
    } else {
      this.start(component, e);
    }
  }
  /**
   * ActionListener method. Invoked when the Timer fires. This will scroll
   * if necessary.
   */
  actionPerformed(x: ActionEvent): void {
    let component = Autoscroller.component;
    if (component == null || !component.isShowing() || (Autoscroller.event == null)) {
      this._stop(component);
      return;
    }
    let screenLocation = component.getLocationOnScreen();
    let e = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(component, Autoscroller.event.getID(), Autoscroller.event.getWhen(), Autoscroller.event.getModifiers(), (Autoscroller.event.getX() - screenLocation.x_) | 0, (Autoscroller.event.getY() - screenLocation.y_) | 0, Autoscroller.event.getXOnScreen(), Autoscroller.event.getYOnScreen(), Autoscroller.event.getClickCount(), Autoscroller.event.isPopupTrigger(), MouseEvent.NOBUTTON);
    let meAccessor = AWTAccessor.getMouseEventAccessor();
    meAccessor.setCausedByTouchEvent(e, meAccessor.isCausedByTouchEvent(Autoscroller.event));
    component.superProcessMouseMotionEvent(e);
  }
  static $clinit() {
    Autoscroller.sharedInstance = new Autoscroller()._Autoscroller();
  }
}

$J.define(Autoscroller, 'javax.swing.Autoscroller', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { '': '_Autoscroller' }, clinit: true, lazy: ['sharedInstance', 'event', 'timer', 'component'] });
$J.module(() => {
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  Timer = $J.load('javax.swing.Timer');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
