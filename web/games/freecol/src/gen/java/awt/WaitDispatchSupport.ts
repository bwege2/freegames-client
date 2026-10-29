// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/WaitDispatchSupport.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2010, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AtomicBoolean, IllegalArgumentException, InterruptedException, JObject, PlatformLogger, PlatformLogger_Level, Thread, Timer, TimerTask } from '../../../jre/index.ts';

let Component, KeyboardFocusManager, PeerEvent;

/**
 * This utility class is used to suspend execution on a thread
 * while still allowing {@code EventDispatchThread} to dispatch events.
 * The API methods of the class are thread-safe.
 *
 * @author Anton Tarasov, Artem Ananiev
 *
 * @since 1.7
 */
export class WaitDispatchSupport extends JObject {
  static log: PlatformLogger = null;
  dispatchThread: EventDispatchThread = null;
  filter_: EventFilter = null;
  extCondition: Conditional = null;
  condition: Conditional = null;
  interval: number = 0;
  static timer: Timer = null;
  timerTask: TimerTask = null;
  keepBlockingEDT: AtomicBoolean = null;
  keepBlockingCT: AtomicBoolean = null;
  afterExit: AtomicBoolean = null;
  wakingRunnable: Runnable = null;
  $init_WaitDispatchSupport() {
    this.keepBlockingEDT = new AtomicBoolean(false);
    this.keepBlockingCT = new AtomicBoolean(false);
    this.afterExit = new AtomicBoolean(false);
    this.wakingRunnable = () => {
      WaitDispatchSupport.log.fine('Wake up EDT');
      {
        this.keepBlockingCT.set(false);
        $J.monitorNotify(WaitDispatchSupport.getTreeLock(), true);
      }
      WaitDispatchSupport.log.fine('Wake up EDT done');
    };
  }
  /**
   * Creates a {@code WaitDispatchSupport} instance to
   * serve the given event dispatch thread.
   *
   * @param dispatchThread An event dispatch thread that
   *        should not stop dispatching events while waiting
   * @param extCond A conditional object used to determine
   *        if the loop should be terminated
   *
   * @since 1.7
   */
  _WaitDispatchSupport$EventDispatchThread$Conditional(dispatchThread: EventDispatchThread, extCond: Conditional): this {
    this.$init_WaitDispatchSupport();
    if (dispatchThread == null) {
      throw new IllegalArgumentException('The dispatchThread can not be null');
    }
    this.dispatchThread = dispatchThread;
    this.extCondition = extCond;
    this.condition = () => {
      if (WaitDispatchSupport.log.isLoggable(PlatformLogger_Level.FINEST)) {
        WaitDispatchSupport.log.finest('evaluate(): blockingEDT=' + this.keepBlockingEDT.get() + ', blockingCT=' + this.keepBlockingCT.get());
      }
      let extEvaluate = (this.extCondition != null) ? $J.fn(this.extCondition, 'evaluate')() : true;
      if (!this.keepBlockingEDT.get() || !extEvaluate || this.afterExit.get()) {
        if (this.timerTask != null) {
          this.timerTask.cancel();
          this.timerTask = null;
        }
        return false;
      }
      return true;
    };
    return this;
  }
  /**
   * Creates a {@code WaitDispatchSupport} instance to
   * serve the given event dispatch thread.
   * <p>
   * The {@link EventFilter} is set on the {@code dispatchThread}
   * while waiting. The filter is removed on completion of the
   * waiting process.
   * <p>
   *
   *
   * @param dispatchThread An event dispatch thread that
   *        should not stop dispatching events while waiting
   * @param filter {@code EventFilter} to be set
   * @param interval A time interval to wait for. Note that
   *        when the waiting process takes place on EDT
   *        there is no guarantee to stop it in the given time
   *
   * @since 1.7
   */
  _WaitDispatchSupport$EventDispatchThread$Conditional$EventFilter$long(dispatchThread: EventDispatchThread, extCondition: Conditional, filter: EventFilter, interval: number): this {
    this._WaitDispatchSupport$EventDispatchThread$Conditional(dispatchThread, extCondition);
    this.filter_ = filter;
    if (interval < 0) {
      throw new IllegalArgumentException('The interval value must be >= 0');
    }
    this.interval = interval;
    if (interval !== 0) {
      WaitDispatchSupport.initializeTimer();
    }
    return this;
  }
  static initializeTimer(): void {
    if (WaitDispatchSupport.timer == null) {
      WaitDispatchSupport.timer = new Timer('AWT-WaitDispatchSupport-Timer', true);
    }
  }
  /**
   * {@inheritDoc}
   */
  enter(): boolean {
    if (WaitDispatchSupport.log.isLoggable(PlatformLogger_Level.FINE)) {
      WaitDispatchSupport.log.fine('enter(): blockingEDT=' + this.keepBlockingEDT.get() + ', blockingCT=' + this.keepBlockingCT.get());
    }
    if (!this.keepBlockingEDT.compareAndSet(false, true)) {
      WaitDispatchSupport.log.fine('The secondary loop is already running, aborting');
      return false;
    }
    try {
      if (this.afterExit.get()) {
        WaitDispatchSupport.log.fine('Exit was called already, aborting');
        return false;
      }
      let run = () => {
        WaitDispatchSupport.log.fine('Starting a new event pump');
        if (this.filter_ == null) {
          this.dispatchThread.pumpEvents$Conditional(this.condition);
        } else {
          this.dispatchThread.pumpEventsForFilter$Conditional$EventFilter(this.condition, this.filter_);
        }
      };
      let currentThread = Thread.currentThread();
      if (currentThread === this.dispatchThread) {
        if (WaitDispatchSupport.log.isLoggable(PlatformLogger_Level.FINEST)) {
          WaitDispatchSupport.log.finest('On dispatch thread: ' + $J.str(this.dispatchThread));
        }
        if (this.interval !== 0) {
          if (WaitDispatchSupport.log.isLoggable(PlatformLogger_Level.FINEST)) {
            WaitDispatchSupport.log.finest('scheduling the timer for ' + this.interval + ' ms');
          }
          WaitDispatchSupport.timer.schedule(this.timerTask = new (WaitDispatchSupport$3())().$o(this)._TimerTask(), this.interval);
        }
        let currentSE = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getCurrentSequencedEvent();
        if (currentSE != null) {
          if (WaitDispatchSupport.log.isLoggable(PlatformLogger_Level.FINE)) {
            WaitDispatchSupport.log.fine('Dispose current SequencedEvent: ' + $J.str(currentSE));
          }
          currentSE.dispose();
        }
        AccessController.doPrivileged(new (WaitDispatchSupport$4())().$o(this).$c(run));
      } else {
        if (WaitDispatchSupport.log.isLoggable(PlatformLogger_Level.FINEST)) {
          WaitDispatchSupport.log.finest('On non-dispatch thread: ' + $J.str(currentThread));
        }
        this.keepBlockingCT.set(true);
        {
          if (this.afterExit.get()) {
            return false;
          }
          if (this.filter_ != null) {
            this.dispatchThread.addEventFilter(this.filter_);
          }
          try {
            let eq = this.dispatchThread.getEventQueue();
            eq.postEvent$AWTEvent(new PeerEvent()._PeerEvent$Object$Runnable$long(this, run, PeerEvent.PRIORITY_EVENT));
            if (this.interval > 0) {
              let currTime = $J.system_currentTimeMillis();
              while (this.keepBlockingCT.get() && ((this.extCondition != null) ? $J.fn(this.extCondition, 'evaluate')() : true) && (currTime + this.interval > $J.system_currentTimeMillis())) {
                $J.monitorWait(WaitDispatchSupport.getTreeLock(), this.interval);
              }
            } else {
              while (this.keepBlockingCT.get() && ((this.extCondition != null) ? $J.fn(this.extCondition, 'evaluate')() : true)) {
                $J.monitorWait(WaitDispatchSupport.getTreeLock());
              }
            }
            if (WaitDispatchSupport.log.isLoggable(PlatformLogger_Level.FINE)) {
              WaitDispatchSupport.log.fine('waitDone ' + this.keepBlockingEDT.get() + ' ' + this.keepBlockingCT.get());
            }
          } catch ($e0) {
            if ($J.isa($e0, InterruptedException)) {
              let e = $J.exc($e0);
              if (WaitDispatchSupport.log.isLoggable(PlatformLogger_Level.FINE)) {
                WaitDispatchSupport.log.fine('Exception caught while waiting: ' + $J.str(e));
              }
            } else {
              throw $e0;
            }
          } finally {
            if (this.filter_ != null) {
              this.dispatchThread.removeEventFilter(this.filter_);
            }
          }
        }
      }
      return true;
    } finally {
      this.keepBlockingEDT.set(false);
      this.keepBlockingCT.set(false);
      this.afterExit.set(false);
    }
  }
  /**
   * {@inheritDoc}
   */
  exit(): boolean {
    if (WaitDispatchSupport.log.isLoggable(PlatformLogger_Level.FINE)) {
      WaitDispatchSupport.log.fine('exit(): blockingEDT=' + this.keepBlockingEDT.get() + ', blockingCT=' + this.keepBlockingCT.get());
    }
    this.afterExit.set(true);
    if (this.keepBlockingEDT.getAndSet(false)) {
      this.wakeupEDT();
      return true;
    }
    return false;
  }
  static getTreeLock(): any {
    return Component.LOCK;
  }
  wakeupEDT(): void {
    if (WaitDispatchSupport.log.isLoggable(PlatformLogger_Level.FINEST)) {
      WaitDispatchSupport.log.finest('wakeupEDT(): EDT == ' + $J.str(this.dispatchThread));
    }
    let eq = this.dispatchThread.getEventQueue();
    eq.postEvent$AWTEvent(new PeerEvent()._PeerEvent$Object$Runnable$long(this, this.wakingRunnable, PeerEvent.PRIORITY_EVENT));
  }
  static $clinit() {
    WaitDispatchSupport.log = PlatformLogger.getLogger('java.awt.event.WaitDispatchSupport');
  }
}

let $WaitDispatchSupport$3: any = null;
/** An anonymous class (WaitDispatchSupport.java:209). */
function WaitDispatchSupport$3(): any {
  return $WaitDispatchSupport$3 ??= $J.local(class extends TimerTask {
    run(): void {
      if (this.$outer.keepBlockingEDT.compareAndSet(true, false)) {
        this.$outer.wakeupEDT();
      }
    }
  }, 'java.awt.WaitDispatchSupport$3', []);
}

let $WaitDispatchSupport$4: any = null;
/** An anonymous class (WaitDispatchSupport.java:234). */
function WaitDispatchSupport$4(): any {
  return $WaitDispatchSupport$4 ??= $J.local(class extends JObject {
    run(): Void {
      this.$cv_run();
      return null;
    }
    $c($run): this {
      this.$cv_run = $run;
      return this;
    }
  }, 'java.awt.WaitDispatchSupport$4', ['java.security.PrivilegedAction']);
}

$J.define(WaitDispatchSupport, 'java.awt.WaitDispatchSupport', { kind: 'class', ifaces: ['java.awt.SecondaryLoop'], sup: 'java.lang.Object', ctors: { 'java.awt.EventDispatchThread,java.awt.Conditional,java.awt.EventFilter,long': '_WaitDispatchSupport$EventDispatchThread$Conditional$EventFilter$long', 'java.awt.EventDispatchThread,java.awt.Conditional': '_WaitDispatchSupport$EventDispatchThread$Conditional', 'java.awt.EventDispatchThread': '_WaitDispatchSupport$EventDispatchThread' }, clinit: true, lazy: ['log', 'timer'] });
$J.module(() => {
  Component = $J.load('java.awt.Component');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  PeerEvent = $J.load('sun.awt.PeerEvent');
});
