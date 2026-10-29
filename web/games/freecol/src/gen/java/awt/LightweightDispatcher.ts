// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Container.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, JObject, PlatformLogger, PlatformLogger_Level, SunDropTargetEvent, SunToolkit, WeakReference } from '../../../jre/index.ts';

let AWTEvent, Container, Window, InputEvent, MouseEvent, MouseWheelEvent, AWTAccessor;

/**
 * Class to manage the dispatching of MouseEvents to the lightweight descendants
 * and SunDropTargetEvents to both lightweight and heavyweight descendants
 * contained by a native container.
 *
 * NOTE: the class name is not appropriate anymore, but we cannot change it
 * because we must keep serialization compatibility.
 *
 * @author Timothy Prinzing
 */
export class LightweightDispatcher extends JObject {
  static readonly LWD_MOUSE_DRAGGED_OVER: number = 1500;
  static eventLog: PlatformLogger = null;
  static BUTTONS_DOWN_MASK: number = 0;
  /**
   * The windowed container that might be hosting events for
   * subcomponents.
   */
  nativeContainer: Container = null;
  /**
   * This variable is not used, but kept for serialization compatibility
   */
  focus: Component = null;
  /**
   * The current subcomponent being hosted by this windowed
   * component that has events being forwarded to it.  If this
   * is null, there are currently no events being forwarded to
   * a subcomponent.
   */
  mouseEventTarget: WeakReference<Component> = null;
  /**
   * The last component entered by the {@code MouseEvent}.
   */
  targetLastEntered: WeakReference<Component> = null;
  /**
   * The last component entered by the {@code SunDropTargetEvent}.
   */
  targetLastEnteredDT: WeakReference<Component> = null;
  /**
   * Is the mouse over the native container.
   */
  isMouseInNativeContainer: boolean = false;
  /**
   * Is DnD over the native container.
   */
  isMouseDTInNativeContainer: boolean = false;
  /**
   * This variable is not used, but kept for serialization compatibility
   */
  nativeCursor: Cursor = null;
  /**
   * The event mask for contained lightweight components.  Lightweight
   * components need a windowed container to host window-related
   * events.  This separate mask indicates events that have been
   * requested by contained lightweight components without effecting
   * the mask of the windowed component itself.
   */
  eventMask: number = 0;
  /**
   * The kind of events routed to lightweight components from windowed
   * hosts.
   */
  static readonly PROXY_EVENT_MASK: number = 131132;
  static readonly MOUSE_MASK: number = 131120;
  _LightweightDispatcher(nativeContainer: Container): this {
    this.isMouseInNativeContainer = false;
    this.isMouseDTInNativeContainer = false;
    this.nativeContainer = nativeContainer;
    this.mouseEventTarget = new WeakReference(null);
    this.targetLastEntered = new WeakReference(null);
    this.targetLastEnteredDT = new WeakReference(null);
    this.eventMask = 0;
    return this;
  }
  dispose(): void {
    this.stopListeningForOtherDrags();
    this.mouseEventTarget.clear();
    this.targetLastEntered.clear();
    this.targetLastEnteredDT.clear();
  }
  /**
   * Enables events to subcomponents.
   */
  enableEvents(events: number): void {
    this.eventMask = $J.lor(this.eventMask, events);
  }
  /**
   * Dispatches an event to a sub-component if necessary, and
   * returns whether or not the event was forwarded to a
   * sub-component.
   *
   * @param e the event
   */
  dispatchEvent(e: AWTEvent): boolean {
    let ret = false;
    if ($J.isa(e, SunDropTargetEvent)) {
      let sdde = e;
      ret = this.processDropTargetEvent(sdde);
    } else {
      if (e instanceof MouseEvent && ($J.land(this.eventMask, LightweightDispatcher.MOUSE_MASK)) !== 0) {
        let me = e;
        ret = this.processMouseEvent(me);
      }
      if (e.getID() === MouseEvent.MOUSE_MOVED) {
        this.nativeContainer.updateCursorImmediately();
      }
    }
    return ret;
  }
  isMouseGrab(e: MouseEvent): boolean {
    let modifiers = e.getModifiersEx();
    if (e.getID() === MouseEvent.MOUSE_PRESSED || e.getID() === MouseEvent.MOUSE_RELEASED) {
      modifiers ^= InputEvent.getMaskForButton(e.getButton());
    }
    return ((modifiers & LightweightDispatcher.BUTTONS_DOWN_MASK) !== 0);
  }
  /**
   * This method attempts to distribute a mouse event to a lightweight
   * component.  It tries to avoid doing any unnecessary probes down
   * into the component tree to minimize the overhead of determining
   * where to route the event, since mouse movement events tend to
   * come in large and frequent amounts.
   */
  processMouseEvent(e: MouseEvent): boolean {
    let id = e.getID();
    let mouseOver = this.nativeContainer.getMouseEventTarget$int$int$boolean(e.getX(), e.getY(), Container.INCLUDE_SELF);
    this.trackMouseEnterExit(mouseOver, e);
    let met = this.mouseEventTarget.get();
    if (!this.isMouseGrab(e) && id !== MouseEvent.MOUSE_CLICKED) {
      met = (mouseOver !== this.nativeContainer) ? mouseOver : null;
      this.mouseEventTarget = new WeakReference(met);
    }
    if (met != null) {
      switch (id) {
        case MouseEvent.MOUSE_ENTERED:
        case MouseEvent.MOUSE_EXITED:
          break;
        case MouseEvent.MOUSE_PRESSED:
          this.retargetMouseEvent(met, id, e);
          break;
        case MouseEvent.MOUSE_RELEASED:
          this.retargetMouseEvent(met, id, e);
          break;
        case MouseEvent.MOUSE_CLICKED:
          if (mouseOver === met) {
            this.retargetMouseEvent(mouseOver, id, e);
          }
          break;
        case MouseEvent.MOUSE_MOVED:
          this.retargetMouseEvent(met, id, e);
          break;
        case MouseEvent.MOUSE_DRAGGED:
          if (this.isMouseGrab(e)) {
            this.retargetMouseEvent(met, id, e);
          }
          break;
        case MouseEvent.MOUSE_WHEEL:
          if (LightweightDispatcher.eventLog.isLoggable(PlatformLogger_Level.FINEST) && (mouseOver != null)) {
            LightweightDispatcher.eventLog.finest('retargeting mouse wheel to ' + mouseOver.getName$() + ', ' + $J.str(mouseOver.getClass()));
          }
          this.retargetMouseEvent(mouseOver, id, e);
          break;
      }
      if (id !== MouseEvent.MOUSE_WHEEL) {
        e.consume();
      }
    }
    return e.isConsumed();
  }
  processDropTargetEvent(e: SunDropTargetEvent): boolean {
    let id = e.getID();
    let x = e.getX();
    let y = e.getY();
    if (!this.nativeContainer.contains$int$int(x, y)) {
      let d = this.nativeContainer.getSize$();
      if (d.width_ <= x) {
        x = (d.width_ - 1) | 0;
      } else if (x < 0) {
        x = 0;
      }
      if (d.height_ <= y) {
        y = (d.height_ - 1) | 0;
      } else if (y < 0) {
        y = 0;
      }
    }
    let mouseOver = this.nativeContainer.getDropTargetEventTarget(x, y, Container.INCLUDE_SELF);
    this.trackMouseEnterExit(mouseOver, e);
    if (mouseOver !== this.nativeContainer && mouseOver != null) {
      switch (id) {
        case MouseEvent.MOUSE_ENTERED:
        case MouseEvent.MOUSE_EXITED:
          break;
        default:
          this.retargetMouseEvent(mouseOver, id, e);
          e.consume();
          break;
      }
    }
    return e.isConsumed();
  }
  trackDropTargetEnterExit(targetOver: Component, e: MouseEvent): void {
    let id = e.getID();
    if (id === MouseEvent.MOUSE_ENTERED && this.isMouseDTInNativeContainer) {
      this.targetLastEnteredDT.clear();
    } else if (id === MouseEvent.MOUSE_ENTERED) {
      this.isMouseDTInNativeContainer = true;
    } else if (id === MouseEvent.MOUSE_EXITED) {
      this.isMouseDTInNativeContainer = false;
    }
    let tle = this.retargetMouseEnterExit(targetOver, e, this.targetLastEnteredDT.get(), this.isMouseDTInNativeContainer);
    this.targetLastEnteredDT = new WeakReference(tle);
  }
  trackMouseEnterExit(targetOver: Component, e: MouseEvent): void {
    if ($J.isa(e, SunDropTargetEvent)) {
      this.trackDropTargetEnterExit(targetOver, e);
      return;
    }
    let id = e.getID();
    if (id !== MouseEvent.MOUSE_EXITED && id !== MouseEvent.MOUSE_DRAGGED && id !== LightweightDispatcher.LWD_MOUSE_DRAGGED_OVER && !this.isMouseInNativeContainer) {
      this.isMouseInNativeContainer = true;
      this.startListeningForOtherDrags();
    } else if (id === MouseEvent.MOUSE_EXITED) {
      this.isMouseInNativeContainer = false;
      this.stopListeningForOtherDrags();
    }
    let tle = this.retargetMouseEnterExit(targetOver, e, this.targetLastEntered.get(), this.isMouseInNativeContainer);
    this.targetLastEntered = new WeakReference(tle);
  }
  retargetMouseEnterExit(targetOver: Component, e: MouseEvent, lastEntered: Component, inNativeContainer: boolean): Component {
    let id = e.getID();
    let targetEnter = inNativeContainer ? targetOver : null;
    if (lastEntered !== targetEnter) {
      if (lastEntered != null) {
        this.retargetMouseEvent(lastEntered, MouseEvent.MOUSE_EXITED, e);
      }
      if (id === MouseEvent.MOUSE_EXITED) {
        e.consume();
      }
      if (targetEnter != null) {
        this.retargetMouseEvent(targetEnter, MouseEvent.MOUSE_ENTERED, e);
      }
      if (id === MouseEvent.MOUSE_ENTERED) {
        e.consume();
      }
    }
    return targetEnter;
  }
  startListeningForOtherDrags(): void {
    AccessController.doPrivileged(new (LightweightDispatcher$1())().$o(this));
  }
  stopListeningForOtherDrags(): void {
    AccessController.doPrivileged(new (LightweightDispatcher$2())().$o(this));
  }
  eventDispatched(e: AWTEvent): void {
    let isForeignDrag = (e instanceof MouseEvent) && !($J.isa(e, SunDropTargetEvent)) && (e.id_ === MouseEvent.MOUSE_DRAGGED) && (e.getSource() !== this.nativeContainer);
    if (!isForeignDrag) {
      return;
    }
    let srcEvent = e;
    let me: MouseEvent;
    {
      let srcComponent = srcEvent.getComponent();
      if (!srcComponent.isShowing()) {
        return;
      }
      let c = this.nativeContainer;
      while ((c != null) && !(c instanceof Window)) {
        c = c.getParent_NoClientCode();
      }
      if ((c == null) || (c).isModalBlocked()) {
        return;
      }
      me = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(this.nativeContainer, LightweightDispatcher.LWD_MOUSE_DRAGGED_OVER, srcEvent.getWhen(), srcEvent.getModifiersEx() | srcEvent.getModifiers(), srcEvent.getX(), srcEvent.getY(), srcEvent.getXOnScreen(), srcEvent.getYOnScreen(), srcEvent.getClickCount(), srcEvent.isPopupTrigger(), srcEvent.getButton());
      let meAccessor = AWTAccessor.getMouseEventAccessor();
      meAccessor.setCausedByTouchEvent(me, meAccessor.isCausedByTouchEvent(srcEvent));
      (srcEvent).copyPrivateDataInto(me);
      let ptSrcOrigin = srcComponent.getLocationOnScreen();
      if (AppContext.getAppContext() !== this.nativeContainer.appContext) {
        let mouseEvent = me;
        let r = () => {
          if (!this.nativeContainer.isShowing()) {
            return;
          }
          let ptDstOrigin = this.nativeContainer.getLocationOnScreen();
          mouseEvent.translatePoint((ptSrcOrigin.x_ - ptDstOrigin.x_) | 0, (ptSrcOrigin.y_ - ptDstOrigin.y_) | 0);
          let targetOver = this.nativeContainer.getMouseEventTarget$int$int$boolean(mouseEvent.getX(), mouseEvent.getY(), Container.INCLUDE_SELF);
          this.trackMouseEnterExit(targetOver, mouseEvent);
        };
        SunToolkit.executeOnEventHandlerThread(this.nativeContainer, r);
        return;
      } else {
        if (!this.nativeContainer.isShowing()) {
          return;
        }
        let ptDstOrigin = this.nativeContainer.getLocationOnScreen();
        me.translatePoint((ptSrcOrigin.x_ - ptDstOrigin.x_) | 0, (ptSrcOrigin.y_ - ptDstOrigin.y_) | 0);
      }
    }
    let targetOver = this.nativeContainer.getMouseEventTarget$int$int$boolean(me.getX(), me.getY(), Container.INCLUDE_SELF);
    this.trackMouseEnterExit(targetOver, me);
  }
  /**
   * Sends a mouse event to the current mouse event recipient using
   * the given event (sent to the windowed host) as a srcEvent.  If
   * the mouse event target is still in the component tree, the
   * coordinates of the event are translated to those of the target.
   * If the target has been removed, we don't bother to send the
   * message.
   */
  retargetMouseEvent(target: Component, id: number, e: MouseEvent): void {
    if (target == null) {
      return;
    }
    let x = e.getX();
    let y = e.getY();
    let component: Component;
    for (component = target; component != null && component !== this.nativeContainer; component = component.getParent()) {
      x = (x - component.x_) | 0;
      y = (y - component.y_) | 0;
    }
    let retargeted: MouseEvent;
    if (component != null) {
      if ($J.isa(e, SunDropTargetEvent)) {
        retargeted = new SunDropTargetEvent(target, id, x, y, (e).getDispatcher());
      } else if (id === MouseEvent.MOUSE_WHEEL) {
        retargeted = new MouseWheelEvent()._MouseWheelEvent$Component$int$long$int$int$int$int$int$int$boolean$int$int$int$double(target, id, e.getWhen(), e.getModifiersEx() | e.getModifiers(), x, y, e.getXOnScreen(), e.getYOnScreen(), e.getClickCount(), e.isPopupTrigger(), (e).getScrollType(), (e).getScrollAmount(), (e).getWheelRotation(), (e).getPreciseWheelRotation());
      } else {
        retargeted = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(target, id, e.getWhen(), e.getModifiersEx() | e.getModifiers(), x, y, e.getXOnScreen(), e.getYOnScreen(), e.getClickCount(), e.isPopupTrigger(), e.getButton());
        let meAccessor = AWTAccessor.getMouseEventAccessor();
        meAccessor.setCausedByTouchEvent(retargeted, meAccessor.isCausedByTouchEvent(e));
      }
      (e).copyPrivateDataInto(retargeted);
      if (target === this.nativeContainer) {
        (target).dispatchEventToSelf(retargeted);
      } else {
        // assert AppContext.getAppContext() == target.appContext
        if (this.nativeContainer.modalComp != null) {
          if ((this.nativeContainer.modalComp).isAncestorOf(target)) {
            target.dispatchEvent(retargeted);
          } else {
            e.consume();
          }
        } else {
          target.dispatchEvent(retargeted);
        }
      }
      if (id === MouseEvent.MOUSE_WHEEL && retargeted.isConsumed()) {
        e.consume();
      }
    }
  }
  static $clinit() {
    LightweightDispatcher.eventLog = PlatformLogger.getLogger('java.awt.event.LightweightDispatcher');
    let buttonsDownMask = AWTAccessor.getInputEventAccessor().getButtonDownMasks();
    let mask = 0;
    for (let buttonDownMask of buttonsDownMask) {
      mask |= buttonDownMask;
    }
    LightweightDispatcher.BUTTONS_DOWN_MASK = mask;
  }
}

let $LightweightDispatcher$1: any = null;
/** An anonymous class (Container.java:4745). */
function LightweightDispatcher$1(): any {
  return $LightweightDispatcher$1 ??= $J.local(class extends JObject {
    run(): any {
      this.$outer.nativeContainer.getToolkit().addAWTEventListener(this.$outer, $J.lor(AWTEvent.MOUSE_EVENT_MASK, AWTEvent.MOUSE_MOTION_EVENT_MASK));
      return null;
    }
  }, 'java.awt.LightweightDispatcher$1', ['java.security.PrivilegedAction']);
}

let $LightweightDispatcher$2: any = null;
/** An anonymous class (Container.java:4761). */
function LightweightDispatcher$2(): any {
  return $LightweightDispatcher$2 ??= $J.local(class extends JObject {
    run(): any {
      this.$outer.nativeContainer.getToolkit().removeAWTEventListener(this.$outer);
      return null;
    }
  }, 'java.awt.LightweightDispatcher$2', ['java.security.PrivilegedAction']);
}

$J.define(LightweightDispatcher, 'java.awt.LightweightDispatcher', { kind: 'class', ifaces: ['java.io.Serializable', 'java.awt.event.AWTEventListener'], sup: 'java.lang.Object', ctors: { 'java.awt.Container': '_LightweightDispatcher' }, clinit: true, lazy: ['eventLog', 'BUTTONS_DOWN_MASK'] });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  Container = $J.load('java.awt.Container');
  Window = $J.load('java.awt.Window');
  InputEvent = $J.load('java.awt.event.InputEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  MouseWheelEvent = $J.load('java.awt.event.MouseWheelEvent');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
