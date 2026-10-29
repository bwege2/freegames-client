// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/EventDispatchThread.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, InterruptedException, JObject, PlatformLogger, PlatformLogger_Level, SunDragSourceContextPeer, SunToolkit, Thread, Throwable } from '../../../jre/index.ts';

let Component, Container, EventFilter$FilterAction, ModalEventFilter, Window, ActionEvent, MouseEvent, WindowEvent, ModalExclude;

/**
 * EventDispatchThread is a package-private AWT class which takes
 * events off the EventQueue and dispatches them to the appropriate
 * AWT components.
 *
 * The Thread starts a "permanent" event pump with a call to
 * pumpEvents(Conditional) in its run() method. Event handlers can choose to
 * block this event pump at any time, but should start a new pump (<b>not</b>
 * a new EventDispatchThread) by again calling pumpEvents(Conditional). This
 * secondary event pump will exit automatically as soon as the Conditional
 * evaluate()s to false and an additional Event is pumped and dispatched.
 *
 * @author Tom Ball
 * @author Amy Fowler
 * @author Fred Ecks
 * @author David Mendenhall
 *
 * @since 1.1
 */
export class EventDispatchThread extends Thread {
  static eventLog: PlatformLogger = null;
  theQueue: EventQueue = null;
  doDispatch: boolean = false;
  static readonly ANY_EVENT: number = -1;
  eventFilters: ArrayList<EventFilter> = null;
  $init_EventDispatchThread() {
    this.doDispatch = true;
    this.eventFilters = new ArrayList();
  }
  _EventDispatchThread$ThreadGroup$String$EventQueue(group: ThreadGroup, name: string, queue: EventQueue): this {
    this._Thread(group, null, name, 0, false);
    this.$init_EventDispatchThread();
    this.setEventQueue(queue);
    return this;
  }
  stopDispatching(): void {
    this.doDispatch = false;
  }
  run(): void {
    try {
      this.pumpEvents$Conditional(() => {
        return true;
      });
    } finally {
      this.getEventQueue().detachDispatchThread(this);
    }
  }
  pumpEvents$Conditional(cond: Conditional): void {
    this.pumpEvents$int$Conditional(EventDispatchThread.ANY_EVENT, cond);
  }
  pumpEvents$int$Conditional(id: number, cond: Conditional): void {
    this.pumpEventsForHierarchy$int$Conditional$Component(id, cond, null);
  }
  pumpEventsForHierarchy$int$Conditional$Component(id: number, cond: Conditional, modalComponent: Component): void {
    this.pumpEventsForFilter$int$Conditional$EventFilter(id, cond, new EventDispatchThread$HierarchyEventFilter()._EventDispatchThread$HierarchyEventFilter(modalComponent));
  }
  pumpEventsForFilter$Conditional$EventFilter(cond: Conditional, filter: EventFilter): void {
    this.pumpEventsForFilter$int$Conditional$EventFilter(EventDispatchThread.ANY_EVENT, cond, filter);
  }
  pumpEventsForFilter$int$Conditional$EventFilter(id: number, cond: Conditional, filter: EventFilter): void {
    this.addEventFilter(filter);
    this.doDispatch = true;
    while (this.doDispatch && !this.isInterrupted() && $J.fn(cond, 'evaluate')()) {
      this.pumpOneEventForFilters(id);
    }
    this.removeEventFilter(filter);
  }
  addEventFilter(filter: EventFilter): void {
    if (EventDispatchThread.eventLog.isLoggable(PlatformLogger_Level.FINEST)) {
      EventDispatchThread.eventLog.finest('adding the event filter: ' + $J.str(filter));
    }
    {
      if (!this.eventFilters.contains(filter)) {
        if (filter instanceof ModalEventFilter) {
          let newFilter = filter;
          let k = 0;
          for (k = 0; k < this.eventFilters.size(); k++) {
            let f = this.eventFilters.get(k);
            if (f instanceof ModalEventFilter) {
              let cf = f;
              if (cf.compareTo(newFilter) > 0) {
                break;
              }
            }
          }
          this.eventFilters.add(k, filter);
        } else {
          this.eventFilters.add(filter);
        }
      }
    }
  }
  removeEventFilter(filter: EventFilter): void {
    if (EventDispatchThread.eventLog.isLoggable(PlatformLogger_Level.FINEST)) {
      EventDispatchThread.eventLog.finest('removing the event filter: ' + $J.str(filter));
    }
    {
      this.eventFilters.remove(filter);
    }
  }
  filterAndCheckEvent(event: AWTEvent): boolean {
    let eventOK = true;
    {
      for (let i = (this.eventFilters.size() - 1) | 0; i >= 0; i--) {
        let f = this.eventFilters.get(i);
        let accept = f.acceptEvent(event);
        if (accept === EventFilter$FilterAction.REJECT) {
          eventOK = false;
          break;
        } else if (accept === EventFilter$FilterAction.ACCEPT_IMMEDIATELY) {
          break;
        }
      }
    }
    return eventOK && SunDragSourceContextPeer.checkEvent(event);
  }
  pumpOneEventForFilters(id: number): void {
    let event = null;
    let eventOK = false;
    try {
      let eq = null;
      do {
        eq = this.getEventQueue();
        event = (id === EventDispatchThread.ANY_EVENT) ? eq.getNextEvent$() : eq.getNextEvent$int(id);
        eventOK = this.filterAndCheckEvent(event);
        if (!eventOK) {
          event.consume();
        }
      } while (eventOK === false);
      if (EventDispatchThread.eventLog.isLoggable(PlatformLogger_Level.FINEST)) {
        EventDispatchThread.eventLog.finest('Dispatching: ' + $J.str(event));
      }
      eq.dispatchEvent(event);
    } catch ($e0) {
      if ($J.isa($e0, InterruptedException)) {
        let interruptedException = $J.exc($e0);
        this.doDispatch = false;
      } else {
        let e = $J.exc($e0);
        this.processException(e);
      }
    }
  }
  processException(e: Throwable): void {
    if (EventDispatchThread.eventLog.isLoggable(PlatformLogger_Level.FINE)) {
      EventDispatchThread.eventLog.fine('Processing exception: ' + $J.str(e));
    }
    this.getUncaughtExceptionHandler().uncaughtException(this, e);
  }
  getEventQueue(): EventQueue {
    return this.theQueue;
  }
  setEventQueue(eq: EventQueue): void {
    this.theQueue = eq;
  }
  static $clinit() {
    EventDispatchThread.eventLog = PlatformLogger.getLogger('java.awt.event.EventDispatchThread');
  }
}

export class EventDispatchThread$HierarchyEventFilter extends JObject {
  modalComponent: Component = null;
  _EventDispatchThread$HierarchyEventFilter(modalComponent: Component): this {
    this.modalComponent = modalComponent;
    return this;
  }
  acceptEvent(event: AWTEvent): EventFilter$FilterAction {
    if (this.modalComponent != null) {
      let eventID = event.getID();
      let mouseEvent = (eventID >= MouseEvent.MOUSE_FIRST) && (eventID <= MouseEvent.MOUSE_LAST);
      let actionEvent = (eventID >= ActionEvent.ACTION_FIRST) && (eventID <= ActionEvent.ACTION_LAST);
      let windowClosingEvent = (eventID === WindowEvent.WINDOW_CLOSING);
      if (Component.isInstanceOf(this.modalComponent, 'javax.swing.JInternalFrame')) {
        return windowClosingEvent ? EventFilter$FilterAction.REJECT : EventFilter$FilterAction.ACCEPT;
      }
      if (mouseEvent || actionEvent || windowClosingEvent) {
        let o = event.getSource();
        if ($J.isa(o, ModalExclude)) {
          return EventFilter$FilterAction.ACCEPT;
        } else if (o instanceof Component) {
          let c = o;
          let modalExcluded = false;
          if (this.modalComponent instanceof Container) {
            while (c !== this.modalComponent && c != null) {
              if ((c instanceof Window) && (SunToolkit.isModalExcluded(c))) {
                modalExcluded = true;
                break;
              }
              c = c.getParent();
            }
          }
          if (!modalExcluded && (c !== this.modalComponent)) {
            return EventFilter$FilterAction.REJECT;
          }
        }
      }
    }
    return EventFilter$FilterAction.ACCEPT;
  }
}

$J.define(EventDispatchThread, 'java.awt.EventDispatchThread', { kind: 'class', sup: 'java.lang.Thread', ctors: { 'java.lang.ThreadGroup,java.lang.String,java.awt.EventQueue': '_EventDispatchThread$ThreadGroup$String$EventQueue', '': '_EventDispatchThread$' }, meths: { 'pumpEventsForFilter(int,java.awt.Conditional,java.awt.EventFilter)': 'pumpEventsForFilter$int$Conditional$EventFilter', 'pumpEventsForFilter(java.awt.Conditional,java.awt.EventFilter)': 'pumpEventsForFilter$Conditional$EventFilter', 'pumpEventsForHierarchy(int,java.awt.Conditional,java.awt.Component)': 'pumpEventsForHierarchy$int$Conditional$Component', 'pumpEvents(int,java.awt.Conditional)': 'pumpEvents$int$Conditional', 'pumpEventsForHierarchy(java.awt.Conditional,java.awt.Component)': 'pumpEventsForHierarchy$Conditional$Component', 'pumpEvents(java.awt.Conditional)': 'pumpEvents$Conditional' }, clinit: true, lazy: ['eventLog'] });
$J.define(EventDispatchThread$HierarchyEventFilter, 'java.awt.EventDispatchThread$HierarchyEventFilter', { kind: 'class', ifaces: ['java.awt.EventFilter'], sup: 'java.lang.Object', ctors: { 'java.awt.Component': '_EventDispatchThread$HierarchyEventFilter' } });
$J.module(() => {
  Component = $J.load('java.awt.Component');
  Container = $J.load('java.awt.Container');
  EventFilter$FilterAction = $J.load('java.awt.EventFilter$FilterAction');
  ModalEventFilter = $J.load('java.awt.ModalEventFilter');
  Window = $J.load('java.awt.Window');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  WindowEvent = $J.load('java.awt.event.WindowEvent');
  ModalExclude = $J.load('sun.awt.ModalExclude');
});
