// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/SequencedEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AccessController, AppContext, InterruptedException, JObject, LinkedList, SunToolkit, Thread, Toolkit } from '../../../jre/index.ts';
import { AWTEvent } from './AWTEvent.ts';

let Component, EventDispatchThread, EventFilter$FilterAction, EventQueue, KeyboardFocusManager, SentEvent, AWTAccessor;

/**
 * A mechanism for ensuring that a series of AWTEvents are executed in a
 * precise order, even across multiple AppContexts. The nested events will be
 * dispatched in the order in which their wrapping SequencedEvents were
 * constructed. The only exception to this rule is if the peer of the target of
 * the nested event was destroyed (with a call to Component.removeNotify)
 * before the wrapping SequencedEvent was able to be dispatched. In this case,
 * the nested event is never dispatched.
 *
 * @author David Mendenhall
 */
export class SequencedEvent extends AWTEvent {
  static readonly ID: number = 1006;
  static list: LinkedList<SequencedEvent> = null;
  nested: AWTEvent = null;
  appContext: AppContext = null;
  disposed: boolean = false;
  pendingEvents: LinkedList<AWTEvent> = null;
  static fxAppThreadIsDispatchThread: boolean = false;
  fxCheckSequenceThread: Thread = null;
  /**
   * Constructs a new SequencedEvent which will dispatch the specified
   * nested event.
   *
   * @param nested the AWTEvent which this SequencedEvent's dispatch()
   *        method will dispatch
   */
  _SequencedEvent(nested: AWTEvent): this {
    this._AWTEvent$Object$int(nested.getSource(), SequencedEvent.ID);
    this.pendingEvents = new LinkedList();
    this.nested = nested;
    SunToolkit.setSystemGenerated(nested);
    if (SequencedEvent.fxAppThreadIsDispatchThread) {
      this.fxCheckSequenceThread = new (SequencedEvent$3())().$o(this)._Thread();
    }
    {
      SequencedEvent.list.add(this);
    }
    return this;
  }
  /**
   * Dispatches the nested event after all previous nested events have been
   * dispatched or disposed. If this method is invoked before all previous nested events
   * have been dispatched, then this method blocks until such a point is
   * reached.
   * While waiting disposes nested events to disposed AppContext
   *
   * NOTE: Locking protocol.  Since dispose() can get EventQueue lock,
   * dispatch() shall never call dispose() while holding the lock on the list,
   * as EventQueue lock is held during dispatching.  The locks should be acquired
   * in the same order.
   */
  dispatch(): void {
    try {
      this.appContext = AppContext.getAppContext();
      if (SequencedEvent.getFirst() !== this) {
        if (EventQueue.isDispatchThread()) {
          if (Thread.currentThread() instanceof EventDispatchThread) {
            let edt = Thread.currentThread();
            edt.pumpEventsForFilter$Conditional$EventFilter(() => !this.isFirstOrDisposed(), new SequencedEvent$SequencedEventsFilter()._SequencedEvent$SequencedEventsFilter(this));
          } else {
            if (SequencedEvent.fxAppThreadIsDispatchThread) {
              this.fxCheckSequenceThread.start();
              try {
                this.fxCheckSequenceThread.join(500);
              } catch ($e1) {
                if ($J.isa($e1, InterruptedException)) {
                  let e = $J.exc($e1);
                } else {
                  throw $e1;
                }
              }
            }
          }
        } else {
          while (!this.isFirstOrDisposed()) {
            {
              try {
                $J.monitorWait($J.cls(SequencedEvent), 1000);
              } catch ($e2) {
                if ($J.isa($e2, InterruptedException)) {
                  let e = $J.exc($e2);
                  break;
                } else {
                  throw $e2;
                }
              }
            }
          }
        }
      }
      if (!this.disposed) {
        KeyboardFocusManager.getCurrentKeyboardFocusManager$().setCurrentSequencedEvent(this);
        Toolkit.getEventQueue().dispatchEvent(this.nested);
      }
    } finally {
      this.dispose();
    }
  }
  /**
   * true only if event exists and nested source appContext is disposed.
   */
  static isOwnerAppContextDisposed(se: SequencedEvent): boolean {
    if (se != null) {
      let target = se.nested.getSource();
      if (target instanceof Component) {
        return (target).appContext.isDisposed();
      }
    }
    return false;
  }
  /**
   * Sequenced events are dispatched in order, so we cannot dispatch
   * until we are the first sequenced event in the queue (i.e. it's our
   * turn).  But while we wait for our turn to dispatch, the event
   * could have been disposed for a number of reasons.
   */
  isFirstOrDisposed(): boolean {
    if (this.disposed) {
      return true;
    }
    return this === SequencedEvent.getFirstWithContext() || this.disposed;
  }
  static getFirst(): SequencedEvent {
    return SequencedEvent.list.getFirst();
  }
  static getFirstWithContext(): SequencedEvent {
    let first = SequencedEvent.getFirst();
    while (SequencedEvent.isOwnerAppContextDisposed(first)) {
      first.dispose();
      first = SequencedEvent.getFirst();
    }
    return first;
  }
  /**
   * Disposes of this instance. This method is invoked once the nested event
   * has been dispatched and handled, or when the peer of the target of the
   * nested event has been disposed with a call to Component.removeNotify.
   *
   * NOTE: Locking protocol.  Since SunToolkit.postEvent can get EventQueue lock,
   * it shall never be called while holding the lock on the list,
   * as EventQueue lock is held during dispatching and dispatch() will get
   * lock on the list. The locks should be acquired in the same order.
   */
  dispose(): void {
    {
      if (this.disposed) {
        return;
      }
      if (KeyboardFocusManager.getCurrentKeyboardFocusManager$().getCurrentSequencedEvent() === this) {
        KeyboardFocusManager.getCurrentKeyboardFocusManager$().setCurrentSequencedEvent(null);
      }
      this.disposed = true;
    }
    let next = null;
    {
      $J.monitorNotify($J.cls(SequencedEvent), true);
      if (SequencedEvent.list.getFirst() === this) {
        SequencedEvent.list.removeFirst();
        if (!SequencedEvent.list.isEmpty()) {
          next = SequencedEvent.list.getFirst();
        }
      } else {
        SequencedEvent.list.remove(this);
      }
    }
    if (next != null && next.appContext != null) {
      SunToolkit.postEvent(next.appContext, new SentEvent()._SentEvent$());
    }
    for (const $it3 = this.pendingEvents.iterator(); $it3.hasNext(); ) {
      let e = $it3.next();
      SunToolkit.postEvent(this.appContext, e);
    }
  }
  static $clinit() {
    SequencedEvent.list = new LinkedList();
    AWTAccessor.setSequencedEventAccessor(new (SequencedEvent$1())());
    AccessController.doPrivileged(new (SequencedEvent$2())());
  }
}

export class SequencedEvent$SequencedEventsFilter extends JObject {
  currentSequencedEvent: SequencedEvent = null;
  _SequencedEvent$SequencedEventsFilter(currentSequencedEvent: SequencedEvent): this {
    this.currentSequencedEvent = currentSequencedEvent;
    return this;
  }
  acceptEvent(ev: AWTEvent): EventFilter$FilterAction {
    if (ev.getID() === SequencedEvent.ID) {
      {
        for (const $it4 = SequencedEvent.list.iterator(); $it4.hasNext(); ) {
          let iev = $it4.next();
          if (iev.equals(this.currentSequencedEvent)) {
            break;
          } else if (iev.equals(ev)) {
            return EventFilter$FilterAction.ACCEPT;
          }
        }
      }
    } else if (ev.getID() === SentEvent.ID) {
      return EventFilter$FilterAction.ACCEPT;
    }
    this.currentSequencedEvent.pendingEvents.add(ev);
    return EventFilter$FilterAction.REJECT;
  }
}

let $SequencedEvent$3: any = null;
/** An anonymous class (SequencedEvent.java:134). */
function SequencedEvent$3(): any {
  return $SequencedEvent$3 ??= $J.local(class extends Thread {
    run(): void {
      while (!this.$outer.isFirstOrDisposed()) {
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
  }, 'java.awt.SequencedEvent$3', []);
}

let $SequencedEvent$1: any = null;
/** An anonymous class (SequencedEvent.java:71). */
function SequencedEvent$1(): any {
  return $SequencedEvent$1 ??= $J.local(class extends JObject {
  }, 'java.awt.SequencedEvent$1', ['sun.awt.AWTAccessor$SequencedEventAccessor']);
}

let $SequencedEvent$2: any = null;
/** An anonymous class (SequencedEvent.java:83). */
function SequencedEvent$2(): any {
  return $SequencedEvent$2 ??= $J.local(class extends JObject {
    run(): any {
      SequencedEvent.fxAppThreadIsDispatchThread = $J.equals('true', $J.system_getProperty('javafx.embed.singleThread'));
      return null;
    }
  }, 'java.awt.SequencedEvent$2', ['java.security.PrivilegedAction']);
}

$J.define(SequencedEvent, 'java.awt.SequencedEvent', { kind: 'class', ifaces: ['java.awt.ActiveEvent'], sup: 'java.awt.AWTEvent', ctors: { 'java.awt.AWTEvent': '_SequencedEvent' }, clinit: true, lazy: ['list', 'fxAppThreadIsDispatchThread'] });
$J.define(SequencedEvent$SequencedEventsFilter, 'java.awt.SequencedEvent$SequencedEventsFilter', { kind: 'class', ifaces: ['java.awt.EventFilter'], sup: 'java.lang.Object', ctors: { 'java.awt.SequencedEvent': '_SequencedEvent$SequencedEventsFilter' } });
$J.module(() => {
  Component = $J.load('java.awt.Component');
  EventDispatchThread = $J.load('java.awt.EventDispatchThread');
  EventFilter$FilterAction = $J.load('java.awt.EventFilter$FilterAction');
  EventQueue = $J.load('java.awt.EventQueue');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  SentEvent = $J.load('java.awt.SentEvent');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
