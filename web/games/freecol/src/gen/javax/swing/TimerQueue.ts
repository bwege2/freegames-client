// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/TimerQueue.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, AtomicLong, DelayQueue, InterruptedException, JObject, ReentrantLock, SecurityException, StringBuffer, StringBuilder, Thread, TimeUnit } from '../../../jre/index.ts';

let SwingUtilities;

/**
 * Internal class to manage all Timers using one thread.
 * TimerQueue manages a queue of Timers. The Timers are chained
 * together in a linked list sorted by the order in which they will expire.
 *
 * @author Dave Moore
 * @author Igor Kushnirskiy
 */
export class TimerQueue extends JObject {
  static sharedInstanceKey: any = null;
  queue: DelayQueue<TimerQueue$DelayedTimer> = null;
  running: boolean = false;
  runningLock: Lock = null;
  static classLock: any = null;
  /**
   * Base of nanosecond timings, to avoid wrapping
   */
  static NANO_ORIGIN: number = 0;
  /**
   * Constructor for TimerQueue.
   */
  _TimerQueue(): this {
    this.queue = new DelayQueue();
    this.runningLock = new ReentrantLock();
    this.startIfNeeded();
    return this;
  }
  static sharedInstance(): TimerQueue {
    {
      let sharedInst = SwingUtilities.appContextGet(TimerQueue.sharedInstanceKey);
      if (sharedInst == null) {
        sharedInst = new TimerQueue()._TimerQueue();
        SwingUtilities.appContextPut(TimerQueue.sharedInstanceKey, sharedInst);
      }
      return sharedInst;
    }
  }
  startIfNeeded(): void {
    if (!this.running) {
      this.runningLock.lock();
      if (this.running) {
        return;
      }
      try {
        let threadGroup = AppContext.getAppContext().getThreadGroup();
        AccessController.doPrivileged($J.lambdaObj(() => {
          let name = 'TimerQueue';
          let timerThread = new Thread(threadGroup, $J.fn(this, 'run'), name, 0, false);
          timerThread.setDaemon(true);
          timerThread.setPriority(5);
          timerThread.start();
          return null;
        }, 'run', 'java.security.PrivilegedAction'));
        this.running = true;
      } finally {
        this.runningLock.unlock();
      }
    }
  }
  addTimer$Timer$long(timer: Timer, delayMillis: number): void {
    timer.getLock().lock();
    try {
      if (!this.containsTimer(timer)) {
        this.addTimer$DelayedTimer$TimerQueue(new TimerQueue$DelayedTimer()._TimerQueue$DelayedTimer(timer, TimeUnit.MILLISECONDS.toNanos(delayMillis) + TimerQueue.now()));
      }
    } finally {
      timer.getLock().unlock();
    }
  }
  addTimer$DelayedTimer$TimerQueue(delayedTimer: TimerQueue$DelayedTimer): void {
    // assert delayedTimer != null && !containsTimer(delayedTimer.getTimer())
    let timer = delayedTimer.getTimer();
    timer.getLock().lock();
    try {
      timer.delayedTimer = delayedTimer;
      this.queue.add(delayedTimer);
    } finally {
      timer.getLock().unlock();
    }
  }
  removeTimer(timer: Timer): void {
    timer.getLock().lock();
    try {
      if (timer.delayedTimer != null) {
        this.queue.remove(timer.delayedTimer);
        timer.delayedTimer = null;
      }
    } finally {
      timer.getLock().unlock();
    }
  }
  containsTimer(timer: Timer): boolean {
    timer.getLock().lock();
    try {
      return timer.delayedTimer != null;
    } finally {
      timer.getLock().unlock();
    }
  }
  run(): void {
    this.runningLock.lock();
    try {
      while (this.running) {
        try {
          let runningTimer = this.queue.take();
          let timer = runningTimer.getTimer();
          timer.getLock().lock();
          try {
            let delayedTimer = timer.delayedTimer;
            if (delayedTimer === runningTimer) {
              timer.post();
              timer.delayedTimer = null;
              if (timer.isRepeats()) {
                delayedTimer.setTime(TimerQueue.now() + TimeUnit.MILLISECONDS.toNanos(timer.getDelay()));
                this.addTimer$DelayedTimer$TimerQueue(delayedTimer);
              }
            }
            timer.getLock().newCondition().awaitNanos(1);
          } catch ($e0) {
            if ($J.isa($e0, SecurityException)) {
              let ignore = $J.exc($e0);
            } else {
              throw $e0;
            }
          } finally {
            timer.getLock().unlock();
          }
        } catch ($e1) {
          if ($J.isa($e1, InterruptedException)) {
            let ie = $J.exc($e1);
            if (AppContext.getAppContext().isDisposed()) {
              break;
            }
          } else {
            throw $e1;
          }
        }
      }
    } finally {
      this.running = false;
      this.runningLock.unlock();
    }
  }
  toString(): string {
    let buf = new StringBuilder();
    buf.append('TimerQueue (');
    let isFirst = true;
    for (const $it2 = this.queue.iterator(); $it2.hasNext(); ) {
      let delayedTimer = $it2.next();
      if (!isFirst) {
        buf.append(', ');
      }
      buf.append(delayedTimer.getTimer().toString());
      isFirst = false;
    }
    buf.append(')');
    return buf.toString();
  }
  /**
   * Returns nanosecond time offset by origin
   */
  static now(): number {
    return $J.system_nanoTime() - TimerQueue.NANO_ORIGIN;
  }
  static $clinit() {
    TimerQueue.sharedInstanceKey = new StringBuffer('TimerQueue.sharedInstanceKey');
    TimerQueue.classLock = new JObject();
    TimerQueue.NANO_ORIGIN = $J.system_nanoTime();
  }
}

export class TimerQueue$DelayedTimer extends JObject {
  /**
   * Sequence number to break scheduling ties, and in turn to
   * guarantee FIFO order among tied entries.
   */
  static sequencer: AtomicLong = null;
  /**
   * Sequence number to break ties FIFO
   */
  sequenceNumber: number = 0;
  /**
   * The time the task is enabled to execute in nanoTime units
   */
  time: number = 0;
  timer: Timer = null;
  _TimerQueue$DelayedTimer(timer: Timer, nanos: number): this {
    this.timer = timer;
    this.time = nanos;
    this.sequenceNumber = TimerQueue$DelayedTimer.sequencer.getAndIncrement();
    return this;
  }
  getDelay(unit: TimeUnit): number {
    return unit.convert(this.time - TimerQueue.now(), TimeUnit.NANOSECONDS);
  }
  setTime(nanos: number): void {
    this.time = nanos;
  }
  getTimer(): Timer {
    return this.timer;
  }
  compareTo(other: Delayed): number {
    if (other === this) {
      return 0;
    }
    if (other instanceof TimerQueue$DelayedTimer) {
      let x = other;
      let diff = this.time - x.time;
      if (diff < 0) {
        return -1;
      } else if (diff > 0) {
        return 1;
      } else if (this.sequenceNumber < x.sequenceNumber) {
        return -1;
      } else {
        return 1;
      }
    }
    let d = (this.getDelay(TimeUnit.NANOSECONDS) - other.getDelay(TimeUnit.NANOSECONDS));
    return (d === 0) ? 0 : ((d < 0) ? -1 : 1);
  }
  static $clinit() {
    TimerQueue$DelayedTimer.sequencer = new AtomicLong();
  }
}

$J.define(TimerQueue, 'javax.swing.TimerQueue', { kind: 'class', ifaces: ['java.lang.Runnable'], sup: 'java.lang.Object', ctors: { '': '_TimerQueue' }, meths: { 'addTimer(javax.swing.TimerQueue$DelayedTimer)': 'addTimer$DelayedTimer$TimerQueue', 'addTimer(javax.swing.Timer,long)': 'addTimer$Timer$long' }, clinit: true, lazy: ['sharedInstanceKey', 'classLock', 'NANO_ORIGIN'] });
$J.define(TimerQueue$DelayedTimer, 'javax.swing.TimerQueue$DelayedTimer', { kind: 'class', ifaces: ['java.util.concurrent.Delayed'], sup: 'java.lang.Object', ctors: { 'javax.swing.Timer,long': '_TimerQueue$DelayedTimer' }, clinit: true, lazy: ['sequencer'] });
$J.module(() => {
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
});
