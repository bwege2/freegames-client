// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/DefaultKeyboardFocusManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, InterruptedException, JObject, LightweightPeer, LinkedList, PlatformLogger, PlatformLogger_Level, SunToolkit, Thread, WeakReference } from '../../../jre/index.ts';
import { KeyboardFocusManager } from './KeyboardFocusManager.ts';
import { SentEvent } from './SentEvent.ts';

let AWTKeyStroke, Container, Dialog, EventDispatchThread, EventQueue, Frame, SequencedEvent, Window, FocusEvent, FocusEvent$Cause, KeyEvent, WindowEvent, AWTAccessor, TimedWindowEvent;

/**
 * The default KeyboardFocusManager for AWT applications. Focus traversal is
 * done in response to a Component's focus traversal keys, and using a
 * Container's FocusTraversalPolicy.
 * <p>
 * Please see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
 * How to Use the Focus Subsystem</a>,
 * a section in <em>The Java Tutorial</em>, and the
 * <a href="doc-files/FocusSpec.html">Focus Specification</a>
 * for more information.
 *
 * @author David Mendenhall
 *
 * @see FocusTraversalPolicy
 * @see Component#setFocusTraversalKeys
 * @see Component#getFocusTraversalKeys
 * @since 1.4
 */
export class DefaultKeyboardFocusManager extends KeyboardFocusManager {
  static focusLog: PlatformLogger = null;
  static NULL_WINDOW_WR: WeakReference<Window> = null;
  static NULL_COMPONENT_WR: WeakReference<Component> = null;
  realOppositeWindowWR: WeakReference<Window> = null;
  realOppositeComponentWR: WeakReference<Component> = null;
  inSendMessage: number = 0;
  enqueuedKeyEvents: LinkedList<KeyEvent> = null;
  typeAheadMarkers: LinkedList<DefaultKeyboardFocusManager$TypeAheadMarker> = null;
  consumeNextKeyTyped_: boolean = false;
  restoreFocusTo: Component = null;
  static fxAppThreadIsDispatchThread: boolean = false;
  /**
   * Constructs a {@code DefaultKeyboardFocusManager}.
   */
  _DefaultKeyboardFocusManager(): this {
    this._KeyboardFocusManager();
    this.realOppositeWindowWR = DefaultKeyboardFocusManager.NULL_WINDOW_WR;
    this.realOppositeComponentWR = DefaultKeyboardFocusManager.NULL_COMPONENT_WR;
    this.enqueuedKeyEvents = new LinkedList();
    this.typeAheadMarkers = new LinkedList();
    return this;
  }
  static initStatic(): void {
    AWTAccessor.setDefaultKeyboardFocusManagerAccessor(new (DefaultKeyboardFocusManager$1())());
    AccessController.doPrivileged(new (DefaultKeyboardFocusManager$2())());
  }
  getOwningFrameDialog(window: Window): Window {
    while (window != null && !(window instanceof Frame || window instanceof Dialog)) {
      window = window.getParent();
    }
    return window;
  }
  restoreFocus$FocusEvent$Window$DefaultKeyboardFocusManager(fe: FocusEvent, newFocusedWindow: Window): void {
    let realOppositeComponent = this.realOppositeComponentWR.get();
    let vetoedComponent = fe.getComponent();
    if (newFocusedWindow != null && this.restoreFocus$Window$Component$boolean$DefaultKeyboardFocusManager(newFocusedWindow, vetoedComponent, false)) {
    } else if (realOppositeComponent != null && this.doRestoreFocus(realOppositeComponent, vetoedComponent, false)) {
    } else if (fe.getOppositeComponent() != null && this.doRestoreFocus(fe.getOppositeComponent(), vetoedComponent, false)) {
    } else {
      this.clearGlobalFocusOwnerPriv();
    }
  }
  restoreFocus$WindowEvent$DefaultKeyboardFocusManager(we: WindowEvent): void {
    let realOppositeWindow = this.realOppositeWindowWR.get();
    if (realOppositeWindow != null && this.restoreFocus$Window$Component$boolean$DefaultKeyboardFocusManager(realOppositeWindow, null, false)) {
    } else if (we.getOppositeWindow() != null && this.restoreFocus$Window$Component$boolean$DefaultKeyboardFocusManager(we.getOppositeWindow(), null, false)) {
    } else {
      this.clearGlobalFocusOwnerPriv();
    }
  }
  restoreFocus$Window$Component$boolean$DefaultKeyboardFocusManager(aWindow: Window, vetoedComponent: Component, clearOnFailure: boolean): boolean {
    this.restoreFocusTo = null;
    let toFocus = KeyboardFocusManager.getMostRecentFocusOwner(aWindow);
    if (toFocus != null && toFocus !== vetoedComponent) {
      if (KeyboardFocusManager.getHeavyweight(aWindow) !== this.getNativeFocusOwner()) {
        if (!toFocus.isShowing() || !toFocus.canBeFocusOwner()) {
          toFocus = toFocus.getNextFocusCandidate();
        }
        if (toFocus != null && toFocus !== vetoedComponent) {
          if (!toFocus.requestFocus$boolean$Cause(false, FocusEvent$Cause.ROLLBACK)) {
            this.restoreFocusTo = toFocus;
          }
          return true;
        }
      } else if (this.doRestoreFocus(toFocus, vetoedComponent, false)) {
        return true;
      }
    }
    if (clearOnFailure) {
      this.clearGlobalFocusOwnerPriv();
      return true;
    } else {
      return false;
    }
  }
  restoreFocus$Component$boolean$DefaultKeyboardFocusManager(toFocus: Component, clearOnFailure: boolean): boolean {
    return this.doRestoreFocus(toFocus, null, clearOnFailure);
  }
  doRestoreFocus(toFocus: Component, vetoedComponent: Component, clearOnFailure: boolean): boolean {
    let success = true;
    if (toFocus !== vetoedComponent && toFocus.isShowing() && toFocus.canBeFocusOwner() && (success = toFocus.requestFocus$boolean$Cause(false, FocusEvent$Cause.ROLLBACK))) {
      return true;
    } else {
      if (!success && this.getGlobalFocusedWindow() !== SunToolkit.getContainingWindow(toFocus)) {
        this.restoreFocusTo = toFocus;
        return true;
      }
      let nextFocus = toFocus.getNextFocusCandidate();
      if (nextFocus != null && nextFocus !== vetoedComponent && nextFocus.requestFocusInWindow$Cause(FocusEvent$Cause.ROLLBACK)) {
        return true;
      } else if (clearOnFailure) {
        this.clearGlobalFocusOwnerPriv();
        return true;
      } else {
        return false;
      }
    }
  }
  /**
   * Sends a synthetic AWTEvent to a Component. If the Component is in
   * the current AppContext, then the event is immediately dispatched.
   * If the Component is in a different AppContext, then the event is
   * posted to the other AppContext's EventQueue, and this method blocks
   * until the event is handled or target AppContext is disposed.
   * Returns true if successfully dispatched event, false if failed
   * to dispatch.
   */
  static sendMessage(target: Component, e: AWTEvent): boolean {
    e.isPosted = true;
    let myAppContext = AppContext.getAppContext();
    let targetAppContext = target.appContext;
    let se = new DefaultKeyboardFocusManager$DefaultKeyboardFocusManagerSentEvent()._DefaultKeyboardFocusManager$DefaultKeyboardFocusManagerSentEvent(e, myAppContext);
    if (myAppContext === targetAppContext) {
      se.dispatch();
    } else {
      if (targetAppContext.isDisposed()) {
        return false;
      }
      SunToolkit.postEvent(targetAppContext, se);
      if (EventQueue.isDispatchThread()) {
        if (Thread.currentThread() instanceof EventDispatchThread) {
          let edt = Thread.currentThread();
          edt.pumpEvents$int$Conditional(SentEvent.ID, () => {
            return !se.dispatched_ && !targetAppContext.isDisposed();
          });
        } else {
          if (DefaultKeyboardFocusManager.fxAppThreadIsDispatchThread) {
            let fxCheckDispatchThread = new (DefaultKeyboardFocusManager$4())().$c(se, targetAppContext)._Thread();
            fxCheckDispatchThread.start();
            try {
              fxCheckDispatchThread.join(500);
            } catch ($e1) {
              if ($J.isa($e1, InterruptedException)) {
                let ex = $J.exc($e1);
              } else {
                throw $e1;
              }
            }
          }
        }
      } else {
        {
          while (!se.dispatched_ && !targetAppContext.isDisposed()) {
            try {
              se.wait(1000);
            } catch ($e2) {
              if ($J.isa($e2, InterruptedException)) {
                let ie = $J.exc($e2);
                break;
              } else {
                throw $e2;
              }
            }
          }
        }
      }
    }
    return se.dispatched_;
  }
  repostIfFollowsKeyEvents(e: WindowEvent): boolean {
    if (!(e instanceof TimedWindowEvent)) {
      return false;
    }
    let we = e;
    let time = we.getWhen();
    {
      let ke = this.enqueuedKeyEvents.isEmpty() ? null : this.enqueuedKeyEvents.getFirst();
      if (ke != null && time >= ke.getWhen()) {
        let marker = this.typeAheadMarkers.isEmpty() ? null : this.typeAheadMarkers.getFirst();
        if (marker != null) {
          let toplevel = marker.untilFocused.getContainingWindow();
          if (toplevel != null && toplevel.isFocused()) {
            SunToolkit.postEvent(AppContext.getAppContext(), new SequencedEvent()._SequencedEvent(e));
            return true;
          }
        }
      }
    }
    return false;
  }
  /**
   * This method is called by the AWT event dispatcher requesting that the
   * current KeyboardFocusManager dispatch the specified event on its behalf.
   * DefaultKeyboardFocusManagers dispatch all FocusEvents, all WindowEvents
   * related to focus, and all KeyEvents. These events are dispatched based
   * on the KeyboardFocusManager's notion of the focus owner and the focused
   * and active Windows, sometimes overriding the source of the specified
   * AWTEvent. If this method returns {@code false}, then the AWT event
   * dispatcher will attempt to dispatch the event itself.
   *
   * @param e the AWTEvent to be dispatched
   * @return {@code true} if this method dispatched the event;
   *         {@code false} otherwise
   */
  dispatchEvent(e: AWTEvent): boolean {
    if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINE) && (e instanceof WindowEvent || e instanceof FocusEvent)) {
      DefaultKeyboardFocusManager.focusLog.fine('' + $J.str(e));
    }
    switch (e.getID()) {
      case WindowEvent.WINDOW_GAINED_FOCUS:
        {
          if (this.repostIfFollowsKeyEvents(e)) {
            break;
          }
          let we = e;
          let oldFocusedWindow = this.getGlobalFocusedWindow();
          let newFocusedWindow = we.getWindow();
          if (newFocusedWindow === oldFocusedWindow) {
            break;
          }
          if (!(newFocusedWindow.isFocusableWindow() && newFocusedWindow.isVisible$() && newFocusedWindow.isDisplayable())) {
            this.restoreFocus$WindowEvent$DefaultKeyboardFocusManager(we);
            break;
          }
          if (oldFocusedWindow != null) {
            let isEventDispatched = DefaultKeyboardFocusManager.sendMessage(oldFocusedWindow, new WindowEvent()._WindowEvent$Window$int$Window(oldFocusedWindow, WindowEvent.WINDOW_LOST_FOCUS, newFocusedWindow));
            if (!isEventDispatched) {
              this.setGlobalFocusOwner(null);
              this.setGlobalFocusedWindow(null);
            }
          }
          let newActiveWindow = this.getOwningFrameDialog(newFocusedWindow);
          let currentActiveWindow = this.getGlobalActiveWindow();
          if (newActiveWindow !== currentActiveWindow) {
            DefaultKeyboardFocusManager.sendMessage(newActiveWindow, new WindowEvent()._WindowEvent$Window$int$Window(newActiveWindow, WindowEvent.WINDOW_ACTIVATED, currentActiveWindow));
            if (newActiveWindow !== this.getGlobalActiveWindow()) {
              this.restoreFocus$WindowEvent$DefaultKeyboardFocusManager(we);
              break;
            }
          }
          this.setGlobalFocusedWindow(newFocusedWindow);
          if (newFocusedWindow !== this.getGlobalFocusedWindow()) {
            this.restoreFocus$WindowEvent$DefaultKeyboardFocusManager(we);
            break;
          }
          if (this.inSendMessage === 0) {
            let toFocus = KeyboardFocusManager.getMostRecentFocusOwner(newFocusedWindow);
            let isFocusRestore = this.restoreFocusTo != null && toFocus === this.restoreFocusTo;
            if ((toFocus == null) && newFocusedWindow.isFocusableWindow()) {
              toFocus = newFocusedWindow.getFocusTraversalPolicy().getInitialComponent$Window(newFocusedWindow);
            }
            let tempLost = null;
            {
              tempLost = newFocusedWindow.setTemporaryLostComponent(null);
            }
            if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
              DefaultKeyboardFocusManager.focusLog.finer('tempLost {0}, toFocus {1}', tempLost, toFocus);
            }
            if (tempLost != null) {
              tempLost.requestFocusInWindow$Cause(isFocusRestore && tempLost === toFocus ? FocusEvent$Cause.ROLLBACK : FocusEvent$Cause.ACTIVATION);
            }
            if (toFocus != null && toFocus !== tempLost) {
              toFocus.requestFocusInWindow$Cause(FocusEvent$Cause.ACTIVATION);
            }
          }
          this.restoreFocusTo = null;
          let realOppositeWindow = this.realOppositeWindowWR.get();
          if (realOppositeWindow !== we.getOppositeWindow()) {
            we = new WindowEvent()._WindowEvent$Window$int$Window(newFocusedWindow, WindowEvent.WINDOW_GAINED_FOCUS, realOppositeWindow);
          }
          return this.typeAheadAssertions(newFocusedWindow, we);
        }
      case WindowEvent.WINDOW_ACTIVATED:
        {
          let we = e;
          let oldActiveWindow = this.getGlobalActiveWindow();
          let newActiveWindow = we.getWindow();
          if (oldActiveWindow === newActiveWindow) {
            break;
          }
          if (oldActiveWindow != null) {
            let isEventDispatched = DefaultKeyboardFocusManager.sendMessage(oldActiveWindow, new WindowEvent()._WindowEvent$Window$int$Window(oldActiveWindow, WindowEvent.WINDOW_DEACTIVATED, newActiveWindow));
            if (!isEventDispatched) {
              this.setGlobalActiveWindow(null);
            }
            if (this.getGlobalActiveWindow() != null) {
              break;
            }
          }
          this.setGlobalActiveWindow(newActiveWindow);
          if (newActiveWindow !== this.getGlobalActiveWindow()) {
            break;
          }
          return this.typeAheadAssertions(newActiveWindow, we);
        }
      case FocusEvent.FOCUS_GAINED:
        {
          this.restoreFocusTo = null;
          let fe = e;
          let oldFocusOwner = this.getGlobalFocusOwner();
          let newFocusOwner = fe.getComponent();
          if (oldFocusOwner === newFocusOwner) {
            if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINE)) {
              DefaultKeyboardFocusManager.focusLog.fine('Skipping {0} because focus owner is the same', e);
            }
            this.dequeueKeyEvents(-1, newFocusOwner);
            break;
          }
          if (oldFocusOwner != null) {
            let isEventDispatched = DefaultKeyboardFocusManager.sendMessage(oldFocusOwner, new FocusEvent()._FocusEvent$Component$int$boolean$Component$Cause(oldFocusOwner, FocusEvent.FOCUS_LOST, fe.isTemporary(), newFocusOwner, fe.getCause()));
            if (!isEventDispatched) {
              this.setGlobalFocusOwner(null);
              if (!fe.isTemporary()) {
                this.setGlobalPermanentFocusOwner(null);
              }
            }
          }
          let newFocusedWindow = SunToolkit.getContainingWindow(newFocusOwner);
          let currentFocusedWindow = this.getGlobalFocusedWindow();
          if (newFocusedWindow != null && newFocusedWindow !== currentFocusedWindow) {
            DefaultKeyboardFocusManager.sendMessage(newFocusedWindow, new WindowEvent()._WindowEvent$Window$int$Window(newFocusedWindow, WindowEvent.WINDOW_GAINED_FOCUS, currentFocusedWindow));
            if (newFocusedWindow !== this.getGlobalFocusedWindow()) {
              this.dequeueKeyEvents(-1, newFocusOwner);
              break;
            }
          }
          if (!(newFocusOwner.isFocusable() && newFocusOwner.isShowing() && (newFocusOwner.isEnabled() || fe.getCause().equals(FocusEvent$Cause.UNKNOWN)))) {
            this.dequeueKeyEvents(-1, newFocusOwner);
            if (KeyboardFocusManager.isAutoFocusTransferEnabled()) {
              if (newFocusedWindow == null) {
                this.restoreFocus$FocusEvent$Window$DefaultKeyboardFocusManager(fe, currentFocusedWindow);
              } else {
                this.restoreFocus$FocusEvent$Window$DefaultKeyboardFocusManager(fe, newFocusedWindow);
              }
              KeyboardFocusManager.setMostRecentFocusOwner$Window$Component(newFocusedWindow, null);
            }
            break;
          }
          this.setGlobalFocusOwner(newFocusOwner);
          if (newFocusOwner !== this.getGlobalFocusOwner()) {
            this.dequeueKeyEvents(-1, newFocusOwner);
            if (KeyboardFocusManager.isAutoFocusTransferEnabled()) {
              this.restoreFocus$FocusEvent$Window$DefaultKeyboardFocusManager(fe, newFocusedWindow);
            }
            break;
          }
          if (!fe.isTemporary()) {
            this.setGlobalPermanentFocusOwner(newFocusOwner);
            if (newFocusOwner !== this.getGlobalPermanentFocusOwner()) {
              this.dequeueKeyEvents(-1, newFocusOwner);
              if (KeyboardFocusManager.isAutoFocusTransferEnabled()) {
                this.restoreFocus$FocusEvent$Window$DefaultKeyboardFocusManager(fe, newFocusedWindow);
              }
              break;
            }
          }
          this.setNativeFocusOwner(KeyboardFocusManager.getHeavyweight(newFocusOwner));
          let realOppositeComponent = this.realOppositeComponentWR.get();
          if (realOppositeComponent != null && realOppositeComponent !== fe.getOppositeComponent()) {
            fe = new FocusEvent()._FocusEvent$Component$int$boolean$Component$Cause(newFocusOwner, FocusEvent.FOCUS_GAINED, fe.isTemporary(), realOppositeComponent, fe.getCause());
            (fe).isPosted = true;
          }
          return this.typeAheadAssertions(newFocusOwner, fe);
        }
      case FocusEvent.FOCUS_LOST:
        {
          let fe = e;
          let currentFocusOwner = this.getGlobalFocusOwner();
          if (currentFocusOwner == null) {
            if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINE)) {
              DefaultKeyboardFocusManager.focusLog.fine('Skipping {0} because focus owner is null', e);
            }
            break;
          }
          if (currentFocusOwner === fe.getOppositeComponent()) {
            if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINE)) {
              DefaultKeyboardFocusManager.focusLog.fine('Skipping {0} because current focus owner is equal to opposite', e);
            }
            break;
          }
          this.setGlobalFocusOwner(null);
          if (this.getGlobalFocusOwner() != null) {
            this.restoreFocus$Component$boolean$DefaultKeyboardFocusManager(currentFocusOwner, true);
            break;
          }
          if (!fe.isTemporary()) {
            this.setGlobalPermanentFocusOwner(null);
            if (this.getGlobalPermanentFocusOwner() != null) {
              this.restoreFocus$Component$boolean$DefaultKeyboardFocusManager(currentFocusOwner, true);
              break;
            }
          } else {
            let owningWindow = currentFocusOwner.getContainingWindow();
            if (owningWindow != null) {
              owningWindow.setTemporaryLostComponent(currentFocusOwner);
            }
          }
          this.setNativeFocusOwner(null);
          fe.setSource(currentFocusOwner);
          this.realOppositeComponentWR = (fe.getOppositeComponent() != null) ? new WeakReference(currentFocusOwner) : DefaultKeyboardFocusManager.NULL_COMPONENT_WR;
          return this.typeAheadAssertions(currentFocusOwner, fe);
        }
      case WindowEvent.WINDOW_DEACTIVATED:
        {
          let we = e;
          let currentActiveWindow = this.getGlobalActiveWindow();
          if (currentActiveWindow == null) {
            break;
          }
          if (currentActiveWindow !== e.getSource()) {
            break;
          }
          this.setGlobalActiveWindow(null);
          if (this.getGlobalActiveWindow() != null) {
            break;
          }
          we.setSource(currentActiveWindow);
          return this.typeAheadAssertions(currentActiveWindow, we);
        }
      case WindowEvent.WINDOW_LOST_FOCUS:
        {
          if (this.repostIfFollowsKeyEvents(e)) {
            break;
          }
          let we = e;
          let currentFocusedWindow = this.getGlobalFocusedWindow();
          let losingFocusWindow = we.getWindow();
          let activeWindow = this.getGlobalActiveWindow();
          let oppositeWindow = we.getOppositeWindow();
          if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINE)) {
            DefaultKeyboardFocusManager.focusLog.fine('Active {0}, Current focused {1}, losing focus {2} opposite {3}', activeWindow, currentFocusedWindow, losingFocusWindow, oppositeWindow);
          }
          if (currentFocusedWindow == null) {
            break;
          }
          if (this.inSendMessage === 0 && losingFocusWindow === activeWindow && oppositeWindow === currentFocusedWindow) {
            break;
          }
          let currentFocusOwner = this.getGlobalFocusOwner();
          if (currentFocusOwner != null) {
            let oppositeComp = null;
            if (oppositeWindow != null) {
              oppositeComp = oppositeWindow.getTemporaryLostComponent();
              if (oppositeComp == null) {
                oppositeComp = oppositeWindow.getMostRecentFocusOwner();
              }
            }
            if (oppositeComp == null) {
              oppositeComp = oppositeWindow;
            }
            DefaultKeyboardFocusManager.sendMessage(currentFocusOwner, new FocusEvent()._FocusEvent$Component$int$boolean$Component$Cause(currentFocusOwner, FocusEvent.FOCUS_LOST, true, oppositeComp, FocusEvent$Cause.ACTIVATION));
          }
          this.setGlobalFocusedWindow(null);
          if (this.getGlobalFocusedWindow() != null) {
            this.restoreFocus$Window$Component$boolean$DefaultKeyboardFocusManager(currentFocusedWindow, null, true);
            break;
          }
          we.setSource(currentFocusedWindow);
          this.realOppositeWindowWR = (oppositeWindow != null) ? new WeakReference(currentFocusedWindow) : DefaultKeyboardFocusManager.NULL_WINDOW_WR;
          this.typeAheadAssertions(currentFocusedWindow, we);
          if (oppositeWindow == null && activeWindow != null) {
            DefaultKeyboardFocusManager.sendMessage(activeWindow, new WindowEvent()._WindowEvent$Window$int$Window(activeWindow, WindowEvent.WINDOW_DEACTIVATED, null));
            if (this.getGlobalActiveWindow() != null) {
              this.restoreFocus$Window$Component$boolean$DefaultKeyboardFocusManager(currentFocusedWindow, null, true);
            }
          }
          break;
        }
      case KeyEvent.KEY_TYPED:
      case KeyEvent.KEY_PRESSED:
      case KeyEvent.KEY_RELEASED:
        return this.typeAheadAssertions(null, e);
      default:
        return false;
    }
    return true;
  }
  /**
   * Called by {@code dispatchEvent} if no other
   * KeyEventDispatcher in the dispatcher chain dispatched the KeyEvent, or
   * if no other KeyEventDispatchers are registered. If the event has not
   * been consumed, its target is enabled, and the focus owner is not null,
   * this method dispatches the event to its target. This method will also
   * subsequently dispatch the event to all registered
   * KeyEventPostProcessors. After all this operations are finished,
   * the event is passed to peers for processing.
   * <p>
   * In all cases, this method returns {@code true}, since
   * DefaultKeyboardFocusManager is designed so that neither
   * {@code dispatchEvent}, nor the AWT event dispatcher, should take
   * further action on the event in any situation.
   *
   * @param e the KeyEvent to be dispatched
   * @return {@code true}
   * @see Component#dispatchEvent
   */
  dispatchKeyEvent(e: KeyEvent): boolean {
    let focusOwner = ((e).isPosted) ? this.getFocusOwner() : e.getComponent();
    if (focusOwner != null && focusOwner.isShowing() && focusOwner.canBeFocusOwner()) {
      if (!e.isConsumed()) {
        let comp = e.getComponent();
        if (comp != null && comp.isEnabled()) {
          this.redispatchEvent(comp, e);
        }
      }
    }
    let stopPostProcessing = false;
    let processors = this.getKeyEventPostProcessors();
    if (processors != null) {
      for (const $it3 = processors.iterator(); $it3.hasNext(); ) {
        let processor = $it3.next();
        stopPostProcessing = processor.postProcessKeyEvent(e);
        if (stopPostProcessing) {
          break;
        }
      }
    }
    if (!stopPostProcessing) {
      this.postProcessKeyEvent(e);
    }
    let source = e.getComponent();
    let peer = source.peer;
    if (peer == null || $J.isa(peer, LightweightPeer)) {
      let target = source.getNativeContainer();
      if (target != null) {
        peer = target.peer;
      }
    }
    if (peer != null) {
      peer.handleEvent(e);
    }
    return true;
  }
  /**
   * This method will be called by {@code dispatchKeyEvent}. It will
   * handle any unconsumed KeyEvents that map to an AWT
   * {@code MenuShortcut} by consuming the event and activating the
   * shortcut.
   *
   * @param e the KeyEvent to post-process
   * @return {@code true}
   * @see #dispatchKeyEvent
   * @see MenuShortcut
   */
  postProcessKeyEvent(e: KeyEvent): boolean {
    if (!e.isConsumed()) {
      let target = e.getComponent();
      let p = (target instanceof Container ? target : target.getParent());
      if (p != null) {
        p.postProcessKeyEvent(e);
      }
    }
    return true;
  }
  pumpApprovedKeyEvents(): void {
    let ke: KeyEvent;
    do {
      ke = null;
      {
        if (this.enqueuedKeyEvents.size() !== 0) {
          ke = this.enqueuedKeyEvents.getFirst();
          if (this.typeAheadMarkers.size() !== 0) {
            let marker = this.typeAheadMarkers.getFirst();
            if (ke.getWhen() > marker.after) {
              ke = null;
            }
          }
          if (ke != null) {
            if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
              DefaultKeyboardFocusManager.focusLog.finer('Pumping approved event {0}', ke);
            }
            this.enqueuedKeyEvents.removeFirst();
          }
        }
      }
      if (ke != null) {
        this.preDispatchKeyEvent(ke);
      }
    } while (ke != null);
  }
  /**
   * Dumps the list of type-ahead queue markers to stderr
   */
  dumpMarkers(): void {
    if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
      DefaultKeyboardFocusManager.focusLog.finest('>>> Markers dump, time: {0}', $J.system_currentTimeMillis());
      {
        if (this.typeAheadMarkers.size() !== 0) {
          for (const $it4 = this.typeAheadMarkers.iterator(); $it4.hasNext(); ) {
            let marker = $it4.next();
            DefaultKeyboardFocusManager.focusLog.finest('    {0}', marker);
          }
        }
      }
    }
  }
  typeAheadAssertions(target: Component, e: AWTEvent): boolean {
    this.pumpApprovedKeyEvents();
    switch (e.getID()) {
      case KeyEvent.KEY_TYPED:
      case KeyEvent.KEY_PRESSED:
      case KeyEvent.KEY_RELEASED:
        {
          let ke = e;
          {
            if (e.isPosted && this.typeAheadMarkers.size() !== 0) {
              let marker = this.typeAheadMarkers.getFirst();
              if (ke.getWhen() > marker.after) {
                if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
                  DefaultKeyboardFocusManager.focusLog.finer('Storing event {0} because of marker {1}', ke, marker);
                }
                this.enqueuedKeyEvents.addLast(ke);
                return true;
              }
            }
          }
          return this.preDispatchKeyEvent(ke);
        }
      case FocusEvent.FOCUS_GAINED:
        if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
          DefaultKeyboardFocusManager.focusLog.finest('Markers before FOCUS_GAINED on {0}', target);
        }
        this.dumpMarkers();
        {
          let found = false;
          if (this.hasMarker(target)) {
            for (let iter = this.typeAheadMarkers.iterator(); iter.hasNext(); ) {
              if (iter.next().untilFocused === target) {
                found = true;
              } else if (found) {
                break;
              }
              iter.remove();
            }
          } else {
            if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
              DefaultKeyboardFocusManager.focusLog.finer('Event without marker {0}', e);
            }
          }
        }
        DefaultKeyboardFocusManager.focusLog.finest('Markers after FOCUS_GAINED');
        this.dumpMarkers();
        this.redispatchEvent(target, e);
        this.pumpApprovedKeyEvents();
        return true;
      default:
        this.redispatchEvent(target, e);
        return true;
    }
  }
  /**
   * Returns true if there are some marker associated with component {@code comp}
   * in a markers' queue
   * @since 1.5
   */
  hasMarker(comp: Component): boolean {
    for (const $it5 = this.typeAheadMarkers.iterator(); $it5.hasNext(); ) {
      let typeAheadMarker = $it5.next();
      if (typeAheadMarker.untilFocused === comp) {
        return true;
      }
    }
    return false;
  }
  /**
   * Clears markers queue
   * @since 1.5
   */
  clearMarkers(): void {
    {
      this.typeAheadMarkers.clear();
    }
  }
  preDispatchKeyEvent(ke: KeyEvent): boolean {
    if ((ke).isPosted) {
      let focusOwner = this.getFocusOwner();
      ke.setSource(((focusOwner != null) ? focusOwner : this.getFocusedWindow()));
    }
    if (ke.getSource() == null) {
      return true;
    }
    EventQueue.setCurrentEventAndMostRecentTime(ke);
    if (KeyboardFocusManager.isProxyActive(ke)) {
      let source = ke.getSource();
      let target = source.getNativeContainer();
      if (target != null) {
        let peer = target.peer;
        if (peer != null) {
          peer.handleEvent(ke);
          ke.consume();
        }
      }
      return true;
    }
    let dispatchers = this.getKeyEventDispatchers();
    if (dispatchers != null) {
      for (const $it6 = dispatchers.iterator(); $it6.hasNext(); ) {
        let dispatcher = $it6.next();
        if (dispatcher.dispatchKeyEvent(ke)) {
          return true;
        }
      }
    }
    return this.dispatchKeyEvent(ke);
  }
  consumeTraversalKey(e: KeyEvent): void {
    e.consume();
    this.consumeNextKeyTyped_ = (e.getID() === KeyEvent.KEY_PRESSED) && !e.isActionKey();
  }
  consumeProcessedKeyEvent(e: KeyEvent): boolean {
    if ((e.getID() === KeyEvent.KEY_TYPED) && this.consumeNextKeyTyped_) {
      e.consume();
      this.consumeNextKeyTyped_ = false;
      return true;
    }
    return false;
  }
  /**
   * This method initiates a focus traversal operation if and only if the
   * KeyEvent represents a focus traversal key for the specified
   * focusedComponent. It is expected that focusedComponent is the current
   * focus owner, although this need not be the case. If it is not,
   * focus traversal will nevertheless proceed as if focusedComponent
   * were the focus owner.
   *
   * @param focusedComponent the Component that is the basis for a focus
   *        traversal operation if the specified event represents a focus
   *        traversal key for the Component
   * @param e the event that may represent a focus traversal key
   */
  processKeyEvent(focusedComponent: Component, e: KeyEvent): void {
    if (this.consumeProcessedKeyEvent(e)) {
      return;
    }
    if (e.getID() === KeyEvent.KEY_TYPED) {
      return;
    }
    if (focusedComponent.getFocusTraversalKeysEnabled() && !e.isConsumed()) {
      let stroke = AWTKeyStroke.getAWTKeyStrokeForEvent(e);
      let oppStroke = AWTKeyStroke.getAWTKeyStroke$int$int$boolean(stroke.getKeyCode(), stroke.getModifiers(), !stroke.isOnKeyRelease());
      let toTest: JSet<AWTKeyStroke>;
      let contains: boolean;
      let containsOpp: boolean;
      toTest = focusedComponent.getFocusTraversalKeys(KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS);
      contains = toTest.contains(stroke);
      containsOpp = toTest.contains(oppStroke);
      if (contains || containsOpp) {
        this.consumeTraversalKey(e);
        if (contains) {
          this.focusNextComponent$Component(focusedComponent);
        }
        return;
      } else if (e.getID() === KeyEvent.KEY_PRESSED) {
        this.consumeNextKeyTyped_ = false;
      }
      toTest = focusedComponent.getFocusTraversalKeys(KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS);
      contains = toTest.contains(stroke);
      containsOpp = toTest.contains(oppStroke);
      if (contains || containsOpp) {
        this.consumeTraversalKey(e);
        if (contains) {
          this.focusPreviousComponent$Component(focusedComponent);
        }
        return;
      }
      toTest = focusedComponent.getFocusTraversalKeys(KeyboardFocusManager.UP_CYCLE_TRAVERSAL_KEYS);
      contains = toTest.contains(stroke);
      containsOpp = toTest.contains(oppStroke);
      if (contains || containsOpp) {
        this.consumeTraversalKey(e);
        if (contains) {
          this.upFocusCycle$Component(focusedComponent);
        }
        return;
      }
      if (!((focusedComponent instanceof Container) && (focusedComponent).isFocusCycleRoot$())) {
        return;
      }
      toTest = focusedComponent.getFocusTraversalKeys(KeyboardFocusManager.DOWN_CYCLE_TRAVERSAL_KEYS);
      contains = toTest.contains(stroke);
      containsOpp = toTest.contains(oppStroke);
      if (contains || containsOpp) {
        this.consumeTraversalKey(e);
        if (contains) {
          this.downFocusCycle$Container(focusedComponent);
        }
      }
    }
  }
  /**
   * Delays dispatching of KeyEvents until the specified Component becomes
   * the focus owner. KeyEvents with timestamps later than the specified
   * timestamp will be enqueued until the specified Component receives a
   * FOCUS_GAINED event, or the AWT cancels the delay request by invoking
   * {@code dequeueKeyEvents} or {@code discardKeyEvents}.
   *
   * @param after timestamp of current event, or the current, system time if
   *        the current event has no timestamp, or the AWT cannot determine
   *        which event is currently being handled
   * @param untilFocused Component which will receive a FOCUS_GAINED event
   *        before any pending KeyEvents
   * @see #dequeueKeyEvents
   * @see #discardKeyEvents
   */
  enqueueKeyEvents(after: number, untilFocused: Component): void {
    if (untilFocused == null) {
      return;
    }
    if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
      DefaultKeyboardFocusManager.focusLog.finer('Enqueue at {0} for {1}', after, untilFocused);
    }
    let insertionIndex = 0;
    let i = this.typeAheadMarkers.size();
    let iter = this.typeAheadMarkers.listIterator(i);
    for (; i > 0; i--) {
      let marker = iter.previous();
      if (marker.after <= after) {
        insertionIndex = i;
        break;
      }
    }
    this.typeAheadMarkers.add(insertionIndex, new DefaultKeyboardFocusManager$TypeAheadMarker()._DefaultKeyboardFocusManager$TypeAheadMarker(after, untilFocused));
  }
  /**
   * Releases for normal dispatching to the current focus owner all
   * KeyEvents which were enqueued because of a call to
   * {@code enqueueKeyEvents} with the same timestamp and Component.
   * If the given timestamp is less than zero, the outstanding enqueue
   * request for the given Component with the <b>oldest</b> timestamp (if
   * any) should be cancelled.
   *
   * @param after the timestamp specified in the call to
   *        {@code enqueueKeyEvents}, or any value &lt; 0
   * @param untilFocused the Component specified in the call to
   *        {@code enqueueKeyEvents}
   * @see #enqueueKeyEvents
   * @see #discardKeyEvents
   */
  dequeueKeyEvents(after: number, untilFocused: Component): void {
    if (untilFocused == null) {
      return;
    }
    if (DefaultKeyboardFocusManager.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
      DefaultKeyboardFocusManager.focusLog.finer('Dequeue at {0} for {1}', after, untilFocused);
    }
    let marker: DefaultKeyboardFocusManager$TypeAheadMarker;
    let iter = this.typeAheadMarkers.listIterator((after >= 0) ? this.typeAheadMarkers.size() : 0);
    if (after < 0) {
      while (iter.hasNext()) {
        marker = iter.next();
        if (marker.untilFocused === untilFocused) {
          iter.remove();
          return;
        }
      }
    } else {
      while (iter.hasPrevious()) {
        marker = iter.previous();
        if (marker.untilFocused === untilFocused && marker.after === after) {
          iter.remove();
          return;
        }
      }
    }
  }
  /**
   * Discards all KeyEvents which were enqueued because of one or more calls
   * to {@code enqueueKeyEvents} with the specified Component, or one of
   * its descendants.
   *
   * @param comp the Component specified in one or more calls to
   *        {@code enqueueKeyEvents}, or a parent of such a Component
   * @see #enqueueKeyEvents
   * @see #dequeueKeyEvents
   */
  discardKeyEvents(comp: Component): void {
    if (comp == null) {
      return;
    }
    let start = -1;
    for (let iter = this.typeAheadMarkers.iterator(); iter.hasNext(); ) {
      let marker = iter.next();
      let toTest = marker.untilFocused;
      let match = (toTest === comp);
      while (!match && toTest != null && !(toTest instanceof Window)) {
        toTest = toTest.getParent();
        match = (toTest === comp);
      }
      if (match) {
        if (start < 0) {
          start = marker.after;
        }
        iter.remove();
      } else if (start >= 0) {
        this.purgeStampedEvents(start, marker.after);
        start = -1;
      }
    }
    this.purgeStampedEvents(start, -1);
  }
  purgeStampedEvents(start: number, end: number): void {
    if (start < 0) {
      return;
    }
    for (let iter = this.enqueuedKeyEvents.iterator(); iter.hasNext(); ) {
      let ke = iter.next();
      let time = ke.getWhen();
      if (start < time && (end < 0 || time <= end)) {
        iter.remove();
      }
      if (end >= 0 && time > end) {
        break;
      }
    }
  }
  /**
   * Focuses the Component before aComponent, typically based on a
   * FocusTraversalPolicy.
   *
   * @param aComponent the Component that is the basis for the focus
   *        traversal operation
   * @see FocusTraversalPolicy
   * @see Component#transferFocusBackward
   */
  focusPreviousComponent$Component(aComponent: Component): void {
    if (aComponent != null) {
      aComponent.transferFocusBackward$();
    }
  }
  /**
   * Focuses the Component after aComponent, typically based on a
   * FocusTraversalPolicy.
   *
   * @param aComponent the Component that is the basis for the focus
   *        traversal operation
   * @see FocusTraversalPolicy
   * @see Component#transferFocus
   */
  focusNextComponent$Component(aComponent: Component): void {
    if (aComponent != null) {
      aComponent.transferFocus$();
    }
  }
  /**
   * Moves the focus up one focus traversal cycle. Typically, the focus owner
   * is set to aComponent's focus cycle root, and the current focus cycle
   * root is set to the new focus owner's focus cycle root. If, however,
   * aComponent's focus cycle root is a Window, then the focus owner is set
   * to the focus cycle root's default Component to focus, and the current
   * focus cycle root is unchanged.
   *
   * @param aComponent the Component that is the basis for the focus
   *        traversal operation
   * @see Component#transferFocusUpCycle
   */
  upFocusCycle$Component(aComponent: Component): void {
    if (aComponent != null) {
      aComponent.transferFocusUpCycle();
    }
  }
  /**
   * Moves the focus down one focus traversal cycle. If aContainer is a focus
   * cycle root, then the focus owner is set to aContainer's default
   * Component to focus, and the current focus cycle root is set to
   * aContainer. If aContainer is not a focus cycle root, then no focus
   * traversal operation occurs.
   *
   * @param aContainer the Container that is the basis for the focus
   *        traversal operation
   * @see Container#transferFocusDownCycle
   */
  downFocusCycle$Container(aContainer: Container): void {
    if (aContainer != null && aContainer.isFocusCycleRoot$()) {
      aContainer.transferFocusDownCycle();
    }
  }
  static $clinit() {
    DefaultKeyboardFocusManager.focusLog = PlatformLogger.getLogger('java.awt.focus.DefaultKeyboardFocusManager');
    DefaultKeyboardFocusManager.NULL_WINDOW_WR = new WeakReference(null);
    DefaultKeyboardFocusManager.NULL_COMPONENT_WR = new WeakReference(null);
    DefaultKeyboardFocusManager.initStatic();
  }
}

export class DefaultKeyboardFocusManager$TypeAheadMarker extends JObject {
  after: number = 0;
  untilFocused: Component = null;
  _DefaultKeyboardFocusManager$TypeAheadMarker(after: number, untilFocused: Component): this {
    this.after = after;
    this.untilFocused = untilFocused;
    return this;
  }
  /**
   * Returns string representation of the marker
   */
  toString(): string {
    return '>>> Marker after ' + this.after + ' on ' + $J.str(this.untilFocused);
  }
}

/**
 * A special type of SentEvent which updates a counter in the target
 * KeyboardFocusManager if it is an instance of
 * DefaultKeyboardFocusManager.
 */
export class DefaultKeyboardFocusManager$DefaultKeyboardFocusManagerSentEvent extends SentEvent {
  _DefaultKeyboardFocusManager$DefaultKeyboardFocusManagerSentEvent(nested: AWTEvent, toNotify: AppContext): this {
    this._SentEvent$AWTEvent$AppContext(nested, toNotify);
    return this;
  }
  dispatch(): void {
    let manager = KeyboardFocusManager.getCurrentKeyboardFocusManager$();
    let defaultManager = (manager instanceof DefaultKeyboardFocusManager) ? manager : null;
    if (defaultManager != null) {
      {
        defaultManager.inSendMessage++;
      }
    }
    super.dispatch();
    if (defaultManager != null) {
      {
        defaultManager.inSendMessage--;
      }
    }
  }
}

let $DefaultKeyboardFocusManager$1: any = null;
/** An anonymous class (DefaultKeyboardFocusManager.java:92). */
function DefaultKeyboardFocusManager$1(): any {
  return $DefaultKeyboardFocusManager$1 ??= $J.local(class extends JObject {
  }, 'java.awt.DefaultKeyboardFocusManager$1', ['sun.awt.AWTAccessor$DefaultKeyboardFocusManagerAccessor']);
}

let $DefaultKeyboardFocusManager$2: any = null;
/** An anonymous class (DefaultKeyboardFocusManager.java:97). */
function DefaultKeyboardFocusManager$2(): any {
  return $DefaultKeyboardFocusManager$2 ??= $J.local(class extends JObject {
    run(): any {
      DefaultKeyboardFocusManager.fxAppThreadIsDispatchThread = $J.equals('true', $J.system_getProperty('javafx.embed.singleThread'));
      return null;
    }
  }, 'java.awt.DefaultKeyboardFocusManager$2', ['java.security.PrivilegedAction']);
}

let $DefaultKeyboardFocusManager$4: any = null;
/** An anonymous class (DefaultKeyboardFocusManager.java:305). */
function DefaultKeyboardFocusManager$4(): any {
  return $DefaultKeyboardFocusManager$4 ??= $J.local(class extends Thread {
    run(): void {
      while (!this.$cv_se.dispatched_ && !this.$cv_targetAppContext.isDisposed()) {
        try {
          Thread.sleep(100);
        } catch ($e0) {
          if ($J.isa($e0, InterruptedException)) {
            let e = $J.exc($e0);
            break;
          } else {
            throw $e0;
          }
        }
      }
    }
    $c($se, $targetAppContext): this {
      this.$cv_se = $se; this.$cv_targetAppContext = $targetAppContext;
      return this;
    }
  }, 'java.awt.DefaultKeyboardFocusManager$4', []);
}

$J.define(DefaultKeyboardFocusManager, 'java.awt.DefaultKeyboardFocusManager', { kind: 'class', sup: 'java.awt.KeyboardFocusManager', ctors: { '': '_DefaultKeyboardFocusManager' }, meths: { 'downFocusCycle(java.awt.Container)': 'downFocusCycle$Container', 'upFocusCycle(java.awt.Component)': 'upFocusCycle$Component', 'focusNextComponent(java.awt.Component)': 'focusNextComponent$Component', 'focusPreviousComponent(java.awt.Component)': 'focusPreviousComponent$Component', 'restoreFocus(java.awt.Component,boolean)': 'restoreFocus$Component$boolean$DefaultKeyboardFocusManager', 'restoreFocus(java.awt.Window,java.awt.Component,boolean)': 'restoreFocus$Window$Component$boolean$DefaultKeyboardFocusManager', 'restoreFocus(java.awt.event.WindowEvent)': 'restoreFocus$WindowEvent$DefaultKeyboardFocusManager', 'restoreFocus(java.awt.event.FocusEvent,java.awt.Window)': 'restoreFocus$FocusEvent$Window$DefaultKeyboardFocusManager' }, clinit: true, lazy: ['focusLog', 'NULL_WINDOW_WR', 'NULL_COMPONENT_WR', 'fxAppThreadIsDispatchThread'] });
$J.define(DefaultKeyboardFocusManager$TypeAheadMarker, 'java.awt.DefaultKeyboardFocusManager$TypeAheadMarker', { kind: 'class', sup: 'java.lang.Object', ctors: { 'long,java.awt.Component': '_DefaultKeyboardFocusManager$TypeAheadMarker' } });
$J.define(DefaultKeyboardFocusManager$DefaultKeyboardFocusManagerSentEvent, 'java.awt.DefaultKeyboardFocusManager$DefaultKeyboardFocusManagerSentEvent', { kind: 'class', sup: 'java.awt.SentEvent', ctors: { 'java.awt.AWTEvent,sun.awt.AppContext': '_DefaultKeyboardFocusManager$DefaultKeyboardFocusManagerSentEvent' } });
$J.module(() => {
  AWTKeyStroke = $J.load('java.awt.AWTKeyStroke');
  Container = $J.load('java.awt.Container');
  Dialog = $J.load('java.awt.Dialog');
  EventDispatchThread = $J.load('java.awt.EventDispatchThread');
  EventQueue = $J.load('java.awt.EventQueue');
  Frame = $J.load('java.awt.Frame');
  SequencedEvent = $J.load('java.awt.SequencedEvent');
  Window = $J.load('java.awt.Window');
  FocusEvent = $J.load('java.awt.event.FocusEvent');
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  WindowEvent = $J.load('java.awt.event.WindowEvent');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  TimedWindowEvent = $J.load('sun.awt.TimedWindowEvent');
});
