// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/AWTAutoShutdown.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AccessController, AppContext, HashSet, IdentityHashMap, InterruptedException, JObject, Thread } from '../../../jre/index.ts';

let ThreadGroupUtils;

/**
 * This class is to let AWT shutdown automatically when a user is done
 * with AWT. It tracks AWT state using the following parameters:
 * <ul>
 * <li>{@code peerMap} - the map between the existing peer objects
 *     and their associated targets
 * <li>{@code toolkitThreadBusy} - whether the toolkit thread
 *     is waiting for a new native event to appear in its queue
 *     or is dispatching an event
 * <li>{@code busyThreadSet} - a set of all the event dispatch
 *     threads that are busy at this moment, i.e. those that are not
 *     waiting for a new event to appear in their event queue.
 * </ul><p>
 * AWT is considered to be in ready-to-shutdown state when
 * {@code peerMap} is empty and {@code toolkitThreadBusy}
 * is false and {@code busyThreadSet} is empty.
 * The internal AWTAutoShutdown logic secures that the single non-daemon
 * thread ({@code blockerThread}) is running when AWT is not in
 * ready-to-shutdown state. This blocker thread is to prevent AWT from
 * exiting since the toolkit thread is now daemon and all the event
 * dispatch threads are started only when needed. Once it is detected
 * that AWT is in ready-to-shutdown state this blocker thread waits
 * for a certain timeout and if AWT state doesn't change during timeout
 * this blocker thread terminates all the event dispatch threads and
 * exits.
 */
export class AWTAutoShutdown extends JObject {
  static theInstance: AWTAutoShutdown = null;
  /**
   * This lock object is used to synchronize shutdown operations.
   */
  mainLock: any = null;
  /**
   * This lock object is to secure that when a new blocker thread is
   * started it will be the first who acquire the main lock after
   * the thread that created the new blocker released the main lock
   * by calling lock.wait() to wait for the blocker to start.
   */
  activationLock: any = null;
  /**
   * This set keeps references to all the event dispatch threads that
   * are busy at this moment, i.e. those that are not waiting for a
   * new event to appear in their event queue.
   * Access is synchronized on the main lock object.
   */
  busyThreadSet: JSet<Thread> = null;
  /**
   * Indicates whether the toolkit thread is waiting for a new native
   * event to appear or is dispatching an event.
   */
  toolkitThreadBusy: boolean = false;
  /**
   * This is a map between components and their peers.
   * we should work with in under activationLock&mainLock lock.
   */
  peerMap: JMap<any, any> = null;
  /**
   * References the alive non-daemon thread that is currently used
   * for keeping AWT from exiting.
   */
  blockerThread: Thread = null;
  /**
   * We need this flag to secure that AWT state hasn't changed while
   * we were waiting for the safety timeout to pass.
   */
  timeoutPassed: boolean = false;
  /**
   * Once we detect that AWT is ready to shutdown we wait for a certain
   * timeout to pass before stopping event dispatch threads.
   */
  static readonly SAFETY_TIMEOUT: number = 1000;
  /**
   * Constructor method is intentionally made private to secure
   * a single instance. Use getInstance() to reference it.
   *
   * @see     AWTAutoShutdown#getInstance
   */
  _AWTAutoShutdown(): this {
    this.mainLock = new JObject();
    this.activationLock = new JObject();
    this.busyThreadSet = new HashSet(7);
    this.toolkitThreadBusy = false;
    this.peerMap = new IdentityHashMap();
    this.blockerThread = null;
    this.timeoutPassed = false;
    return this;
  }
  /**
   * Returns reference to a single AWTAutoShutdown instance.
   */
  static getInstance(): AWTAutoShutdown {
    return AWTAutoShutdown.theInstance;
  }
  /**
   * Add a specified thread to the set of busy event dispatch threads.
   * If this set already contains the specified thread or the thread is null,
   * the call leaves this set unchanged and returns silently.
   *
   * @param thread thread to be added to this set, if not present.
   * @see     AWTAutoShutdown#notifyThreadFree
   * @see     AWTAutoShutdown#isReadyToShutdown
   */
  notifyThreadBusy(thread: Thread): void {
    if (thread == null) {
      return;
    }
    {
      {
        if (this.blockerThread == null) {
          this.activateBlockerThread();
        } else if (this.isReadyToShutdown()) {
          $J.monitorNotify(this.mainLock, true);
          this.timeoutPassed = false;
        }
        this.busyThreadSet.add(thread);
      }
    }
  }
  /**
   * Remove a specified thread from the set of busy event dispatch threads.
   * If this set doesn't contain the specified thread or the thread is null,
   * the call leaves this set unchanged and returns silently.
   *
   * @param thread thread to be removed from this set, if present.
   * @see     AWTAutoShutdown#notifyThreadBusy
   * @see     AWTAutoShutdown#isReadyToShutdown
   */
  notifyThreadFree(thread: Thread): void {
    if (thread == null) {
      return;
    }
    {
      {
        this.busyThreadSet.remove(thread);
        if (this.isReadyToShutdown()) {
          $J.monitorNotify(this.mainLock, true);
          this.timeoutPassed = false;
        }
      }
    }
  }
  /**
   * Determine whether AWT is currently in ready-to-shutdown state.
   * AWT is considered to be in ready-to-shutdown state if
   * {@code peerMap} is empty and {@code toolkitThreadBusy}
   * is false and {@code busyThreadSet} is empty.
   *
   * @return true if AWT is in ready-to-shutdown state.
   */
  isReadyToShutdown(): boolean {
    return (!this.toolkitThreadBusy && this.peerMap.isEmpty() && this.busyThreadSet.isEmpty());
  }
  /**
   * Implementation of the Runnable interface.
   * Incapsulates the blocker thread functionality.
   *
   * @see     AWTAutoShutdown#isReadyToShutdown
   */
  run(): void {
    let currentThread = Thread.currentThread();
    let interrupted = false;
    {
      try {
        $J.monitorNotify(this.mainLock, true);
        while (this.blockerThread === currentThread) {
          $J.monitorWait(this.mainLock);
          this.timeoutPassed = false;
          while (this.isReadyToShutdown()) {
            if (this.timeoutPassed) {
              this.timeoutPassed = false;
              this.blockerThread = null;
              break;
            }
            this.timeoutPassed = true;
            $J.monitorWait(this.mainLock, AWTAutoShutdown.SAFETY_TIMEOUT);
          }
        }
      } catch ($e0) {
        if ($J.isa($e0, InterruptedException)) {
          let e = $J.exc($e0);
          interrupted = true;
        } else {
          throw $e0;
        }
      } finally {
        if (this.blockerThread === currentThread) {
          this.blockerThread = null;
        }
      }
    }
    if (!interrupted) {
      AppContext.stopEventDispatchThreads();
    }
  }
  /**
   * Creates and starts a new blocker thread. Doesn't return until
   * the new blocker thread starts.
   */
  activateBlockerThread(): void {
    AccessController.doPrivileged($J.lambdaObj(() => {
      let name = 'AWT-Shutdown';
      let thread = new Thread(ThreadGroupUtils.getRootThreadGroup(), $J.fn(this, 'run'), name, 0, false);
      thread.setContextClassLoader(null);
      thread.setDaemon(false);
      this.blockerThread = thread;
      return thread;
    }, 'run', 'java.security.PrivilegedAction')).start();
    try {
      $J.monitorWait(this.mainLock);
    } catch ($e1) {
      if ($J.isa($e1, InterruptedException)) {
        let e = $J.exc($e1);
        $J.err.println('AWT blocker activation interrupted:');
        e.printStackTrace();
      } else {
        throw $e1;
      }
    }
  }
  static $clinit() {
    AWTAutoShutdown.theInstance = new AWTAutoShutdown()._AWTAutoShutdown();
  }
}

$J.define(AWTAutoShutdown, 'sun.awt.AWTAutoShutdown', { kind: 'class', ifaces: ['java.lang.Runnable'], sup: 'java.lang.Object', ctors: { '': '_AWTAutoShutdown' }, clinit: true, lazy: ['theInstance'] });
$J.module(() => {
  ThreadGroupUtils = $J.load('sun.awt.util.ThreadGroupUtils');
});
