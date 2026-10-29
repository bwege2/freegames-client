// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/KeyboardFocusManagerPeerImpl.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2003, 2016, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, PlatformLogger, PlatformLogger_Level, SunToolkit } from '../../../jre/index.ts';

let Canvas, Panel, Scrollbar, FocusEvent, FocusEvent$Cause, AWTAccessor;

export class KeyboardFocusManagerPeerImpl extends JObject {
  static focusLog: PlatformLogger = null;
  static readonly SNFH_FAILURE: number = 0;
  static readonly SNFH_SUCCESS_HANDLED: number = 1;
  static readonly SNFH_SUCCESS_PROCEED: number = 2;
  _KeyboardFocusManagerPeerImpl(): this {
    return this;
  }
  clearGlobalFocusOwner(activeWindow: Window): void {
    if (activeWindow != null) {
      let focusOwner = activeWindow.getFocusOwner();
      if (KeyboardFocusManagerPeerImpl.focusLog.isLoggable(PlatformLogger_Level.FINE)) {
        KeyboardFocusManagerPeerImpl.focusLog.fine('Clearing global focus owner ' + $J.str(focusOwner));
      }
      if (focusOwner != null) {
        let fl = new FocusEvent()._FocusEvent$Component$int$boolean$Component$Cause(focusOwner, FocusEvent.FOCUS_LOST, false, null, FocusEvent$Cause.CLEAR_GLOBAL_FOCUS_OWNER);
        SunToolkit.postPriorityEvent(fl);
      }
    }
  }
  static shouldFocusOnClick(component: Component): boolean {
    let acceptFocusOnClick = false;
    let acc = AWTAccessor.getComponentAccessor();
    if (component instanceof Canvas || component instanceof Scrollbar) {
      acceptFocusOnClick = true;
    } else if (component instanceof Panel) {
      acceptFocusOnClick = ((component).getComponentCount() === 0);
    } else {
      let peer = (component != null ? acc.getPeer(component) : null);
      acceptFocusOnClick = (peer != null ? peer.isFocusable() : false);
    }
    return acceptFocusOnClick && acc.canBeFocusOwner(component);
  }
  static deliverFocus(lightweightChild: Component, target: Component, temporary: boolean, focusedWindowChangeAllowed: boolean, time: number, cause: FocusEvent$Cause, currentFocusOwner: Component): boolean {
    if (lightweightChild == null) {
      lightweightChild = target;
    }
    let currentOwner = currentFocusOwner;
    if (currentOwner != null && !currentOwner.isDisplayable()) {
      currentOwner = null;
    }
    if (currentOwner != null) {
      let fl = new FocusEvent()._FocusEvent$Component$int$boolean$Component$Cause(currentOwner, FocusEvent.FOCUS_LOST, false, lightweightChild, cause);
      if (KeyboardFocusManagerPeerImpl.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
        KeyboardFocusManagerPeerImpl.focusLog.finer('Posting focus event: ' + $J.str(fl));
      }
      SunToolkit.postEvent(SunToolkit.targetToAppContext(currentOwner), fl);
    }
    let fg = new FocusEvent()._FocusEvent$Component$int$boolean$Component$Cause(lightweightChild, FocusEvent.FOCUS_GAINED, false, currentOwner, cause);
    if (KeyboardFocusManagerPeerImpl.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
      KeyboardFocusManagerPeerImpl.focusLog.finer('Posting focus event: ' + $J.str(fg));
    }
    SunToolkit.postEvent(SunToolkit.targetToAppContext(lightweightChild), fg);
    return true;
  }
  static requestFocusFor(target: Component, cause: FocusEvent$Cause): void {
    AWTAccessor.getComponentAccessor().requestFocus(target, cause);
  }
  static shouldNativelyFocusHeavyweight(heavyweight: Component, descendant: Component, temporary: boolean, focusedWindowChangeAllowed: boolean, time: number, cause: FocusEvent$Cause): number {
    return KeyboardFocusManagerPeerImpl$KfmAccessor.instance.shouldNativelyFocusHeavyweight(heavyweight, descendant, temporary, focusedWindowChangeAllowed, time, cause);
  }
  static removeLastFocusRequest(heavyweight: Component): void {
    KeyboardFocusManagerPeerImpl$KfmAccessor.instance.removeLastFocusRequest(heavyweight);
  }
  static processSynchronousLightweightTransfer(heavyweight: Component, descendant: Component, temporary: boolean, focusedWindowChangeAllowed: boolean, time: number): boolean {
    return KeyboardFocusManagerPeerImpl$KfmAccessor.instance.processSynchronousLightweightTransfer(heavyweight, descendant, temporary, focusedWindowChangeAllowed, time);
  }
  static $clinit() {
    KeyboardFocusManagerPeerImpl.focusLog = PlatformLogger.getLogger('sun.awt.focus.KeyboardFocusManagerPeerImpl');
  }
}

export class KeyboardFocusManagerPeerImpl$KfmAccessor extends JObject {
  static instance: AWTAccessor$KeyboardFocusManagerAccessor = null;
  static $clinit() {
    KeyboardFocusManagerPeerImpl$KfmAccessor.instance = AWTAccessor.getKeyboardFocusManagerAccessor();
  }
}

$J.define(KeyboardFocusManagerPeerImpl, 'sun.awt.KeyboardFocusManagerPeerImpl', { kind: 'class', ifaces: ['java.awt.peer.KeyboardFocusManagerPeer'], sup: 'java.lang.Object', ctors: { '': '_KeyboardFocusManagerPeerImpl' }, clinit: true, lazy: ['focusLog'] });
$J.define(KeyboardFocusManagerPeerImpl$KfmAccessor, 'sun.awt.KeyboardFocusManagerPeerImpl$KfmAccessor', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_KeyboardFocusManagerPeerImpl$KfmAccessor' }, clinit: true, lazy: ['instance'] });
$J.module(() => {
  Canvas = $J.load('java.awt.Canvas');
  Panel = $J.load('java.awt.Panel');
  Scrollbar = $J.load('java.awt.Scrollbar');
  FocusEvent = $J.load('java.awt.event.FocusEvent');
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
