// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/EventQueue.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, AtomicInteger, InvocationTargetException, JError, JObject, PlatformLogger, PlatformLogger_Level, SharedSecrets, SunDropTargetEvent, SunToolkit, Thread, Toolkit, WeakReference } from '../../../jre/index.ts';

let ActiveEvent, Component, EventDispatchThread, MenuComponent, Queue, SentEvent, SequencedEvent, TrayIcon, WaitDispatchSupport, ActionEvent, FocusEvent, InputEvent, InputMethodEvent, InvocationEvent, KeyEvent, MouseEvent, PaintEvent, WindowEvent, AWTAccessor, AWTAutoShutdown, EventQueueItem, PeerEvent;

/**
 * {@code EventQueue} is a platform-independent class
 * that queues events, both from the underlying peer classes
 * and from trusted application classes.
 * <p>
 * It encapsulates asynchronous event dispatch machinery which
 * extracts events from the queue and dispatches them by calling
 * {@link #dispatchEvent(AWTEvent) dispatchEvent(AWTEvent)} method
 * on this {@code EventQueue} with the event to be dispatched
 * as an argument.  The particular behavior of this machinery is
 * implementation-dependent.  The only requirements are that events
 * which were actually enqueued to this queue (note that events
 * being posted to the {@code EventQueue} can be coalesced)
 * are dispatched:
 * <dl>
 *   <dt> Sequentially.
 *   <dd> That is, it is not permitted that several events from
 *        this queue are dispatched simultaneously.
 *   <dt> In the same order as they are enqueued.
 *   <dd> That is, if {@code AWTEvent}&nbsp;A is enqueued
 *        to the {@code EventQueue} before
 *        {@code AWTEvent}&nbsp;B then event B will not be
 *        dispatched before event A.
 * </dl>
 * <p>
 * Some browsers partition applets in different code bases into
 * separate contexts, and establish walls between these contexts.
 * In such a scenario, there will be one {@code EventQueue}
 * per context. Other browsers place all applets into the same
 * context, implying that there will be only a single, global
 * {@code EventQueue} for all applets. This behavior is
 * implementation-dependent.  Consult your browser's documentation
 * for more information.
 * <p>
 * For information on the threading issues of the event dispatch
 * machinery, see <a href="doc-files/AWTThreadIssues.html#Autoshutdown"
 * >AWT Threading Issues</a>.
 *
 * @author Thomas Ball
 * @author Fred Ecks
 * @author David Mendenhall
 *
 * @since       1.1
 */
export class EventQueue extends JObject {
  static threadInitNumber: AtomicInteger = null;
  static readonly LOW_PRIORITY: number = 0;
  static readonly NORM_PRIORITY: number = 1;
  static readonly HIGH_PRIORITY: number = 2;
  static readonly ULTIMATE_PRIORITY: number = 3;
  static readonly NUM_PRIORITIES: number = 4;
  queues: Queue[] = null;
  nextQueue: EventQueue = null;
  previousQueue: EventQueue = null;
  pushPopLock: Lock = null;
  pushPopCond: Condition = null;
  static dummyRunnable: Runnable = null;
  dispatchThread: EventDispatchThread = null;
  threadGroup: ThreadGroup = null;
  classLoader: ClassLoader = null;
  mostRecentEventTime: number = 0;
  mostRecentKeyEventTime: number = 0;
  /**
   * The modifiers field of the current event, if the current event is an
   * InputEvent or ActionEvent.
   */
  currentEvent: WeakReference<AWTEvent> = null;
  waitForID: number = 0;
  appContext: AppContext = null;
  name: string = null;
  fwDispatcher: FwDispatcher = null;
  static eventLog: PlatformLogger = null;
  static fxAppThreadIsDispatchThread: boolean = false;
  static readonly PAINT: number = 0;
  static readonly UPDATE: number = 1;
  static readonly MOVE: number = 2;
  static readonly DRAG: number = 3;
  static readonly PEER: number = 4;
  static readonly CACHE_LENGTH: number = 5;
  static javaSecurityAccess: JavaSecurityAccess = null;
  /**
   * Initializes a new instance of {@code EventQueue}.
   */
  _EventQueue(): this {
    this.queues = $J.newArray(EventQueue.NUM_PRIORITIES, null);
    this.threadGroup = Thread.currentThread().getThreadGroup();
    this.classLoader = Thread.currentThread().getContextClassLoader();
    this.mostRecentEventTime = $J.system_currentTimeMillis();
    this.mostRecentKeyEventTime = $J.system_currentTimeMillis();
    this.name = 'AWT-EventQueue-' + EventQueue.threadInitNumber.getAndIncrement();
    for (let i = 0; i < EventQueue.NUM_PRIORITIES; i++) {
      this.queues[i] = new Queue()._Queue();
    }
    this.appContext = AppContext.getAppContext();
    this.pushPopLock = this.appContext.get(AppContext.EVENT_QUEUE_LOCK_KEY);
    this.pushPopCond = this.appContext.get(AppContext.EVENT_QUEUE_COND_KEY);
    return this;
  }
  static getEventLog(): PlatformLogger {
    if (EventQueue.eventLog == null) {
      EventQueue.eventLog = PlatformLogger.getLogger('java.awt.event.EventQueue');
    }
    return EventQueue.eventLog;
  }
  /**
   * Posts a 1.1-style event to the {@code EventQueue}.
   * If there is an existing event on the queue with the same ID
   * and event source, the source {@code Component}'s
   * {@code coalesceEvents} method will be called.
   *
   * @param theEvent an instance of {@code java.awt.AWTEvent},
   *          or a subclass of it
   * @throws NullPointerException if {@code theEvent} is {@code null}
   */
  postEvent$AWTEvent(theEvent: AWTEvent): void {
    SunToolkit.flushPendingEvents(this.appContext);
    this.postEventPrivate(theEvent);
  }
  /**
   * Posts a 1.1-style event to the {@code EventQueue}.
   * If there is an existing event on the queue with the same ID
   * and event source, the source {@code Component}'s
   * {@code coalesceEvents} method will be called.
   *
   * @param theEvent an instance of {@code java.awt.AWTEvent},
   *          or a subclass of it
   */
  postEventPrivate(theEvent: AWTEvent): void {
    theEvent.isPosted = true;
    this.pushPopLock.lock();
    try {
      if (this.nextQueue != null) {
        this.nextQueue.postEventPrivate(theEvent);
        return;
      }
      if (this.dispatchThread == null) {
        if (theEvent.getSource() === AWTAutoShutdown.getInstance()) {
          return;
        } else {
          this.initDispatchThread();
        }
      }
      this.postEvent$AWTEvent$int$EventQueue(theEvent, EventQueue.getPriority(theEvent));
    } finally {
      this.pushPopLock.unlock();
    }
  }
  static getPriority(theEvent: AWTEvent): number {
    if (theEvent instanceof PeerEvent) {
      let peerEvent = theEvent;
      if (($J.land(peerEvent.getFlags(), PeerEvent.ULTIMATE_PRIORITY_EVENT)) !== 0) {
        return EventQueue.ULTIMATE_PRIORITY;
      }
      if (($J.land(peerEvent.getFlags(), PeerEvent.PRIORITY_EVENT)) !== 0) {
        return EventQueue.HIGH_PRIORITY;
      }
      if (($J.land(peerEvent.getFlags(), PeerEvent.LOW_PRIORITY_EVENT)) !== 0) {
        return EventQueue.LOW_PRIORITY;
      }
    }
    let id = theEvent.getID();
    if ((id >= PaintEvent.PAINT_FIRST) && (id <= PaintEvent.PAINT_LAST)) {
      return EventQueue.LOW_PRIORITY;
    }
    return EventQueue.NORM_PRIORITY;
  }
  /**
   * Posts the event to the internal Queue of specified priority,
   * coalescing as appropriate.
   *
   * @param theEvent an instance of {@code java.awt.AWTEvent},
   *          or a subclass of it
   * @param priority  the desired priority of the event
   */
  postEvent$AWTEvent$int$EventQueue(theEvent: AWTEvent, priority: number): void {
    if (this.coalesceEvent(theEvent, priority)) {
      return;
    }
    let newItem = new EventQueueItem()._EventQueueItem(theEvent);
    this.cacheEQItem(newItem);
    let notifyID = (theEvent.getID() === this.waitForID);
    if (this.queues[priority].head == null) {
      let shouldNotify = this.noEvents();
      this.queues[priority].head = this.queues[priority].tail = newItem;
      if (shouldNotify) {
        if (theEvent.getSource() !== AWTAutoShutdown.getInstance()) {
          AWTAutoShutdown.getInstance().notifyThreadBusy(this.dispatchThread);
        }
        this.pushPopCond.signalAll();
      } else if (notifyID) {
        this.pushPopCond.signalAll();
      }
    } else {
      this.queues[priority].tail.next_ = newItem;
      this.queues[priority].tail = newItem;
      if (notifyID) {
        this.pushPopCond.signalAll();
      }
    }
  }
  coalescePaintEvent(e: PaintEvent): boolean {
    let sourcePeer = (e.getSource()).peer;
    if (sourcePeer != null) {
      sourcePeer.coalescePaintEvent(e);
    }
    let cache = (e.getSource()).eventCache;
    if (cache == null) {
      return false;
    }
    let index = EventQueue.eventToCacheIndex(e);
    if (index !== -1 && cache[index] != null) {
      let merged = this.mergePaintEvents(e, cache[index].event);
      if (merged != null) {
        cache[index].event = merged;
        return true;
      }
    }
    return false;
  }
  mergePaintEvents(a: PaintEvent, b: PaintEvent): PaintEvent {
    let aRect = a.getUpdateRect();
    let bRect = b.getUpdateRect();
    if (bRect.contains$Rectangle(aRect)) {
      return b;
    }
    if (aRect.contains$Rectangle(bRect)) {
      return a;
    }
    return null;
  }
  coalesceMouseEvent(e: MouseEvent): boolean {
    let cache = (e.getSource()).eventCache;
    if (cache == null) {
      return false;
    }
    let index = EventQueue.eventToCacheIndex(e);
    if (index !== -1 && cache[index] != null) {
      cache[index].event = e;
      return true;
    }
    return false;
  }
  coalescePeerEvent(e: PeerEvent): boolean {
    let cache = (e.getSource()).eventCache;
    if (cache == null) {
      return false;
    }
    let index = EventQueue.eventToCacheIndex(e);
    if (index !== -1 && cache[index] != null) {
      e = e.coalesceEvents(cache[index].event);
      if (e != null) {
        cache[index].event = e;
        return true;
      } else {
        cache[index] = null;
      }
    }
    return false;
  }
  coalesceOtherEvent(e: AWTEvent, priority: number): boolean {
    let id = e.getID();
    let source = e.getSource();
    for (let entry = this.queues[priority].head; entry != null; entry = entry.next_) {
      if (entry.event.getSource() === source && entry.event.getID() === id) {
        let coalescedEvent = source.coalesceEvents(entry.event, e);
        if (coalescedEvent != null) {
          entry.event = coalescedEvent;
          return true;
        }
      }
    }
    return false;
  }
  coalesceEvent(e: AWTEvent, priority: number): boolean {
    if (!(e.getSource() instanceof Component)) {
      return false;
    }
    if (e instanceof PeerEvent) {
      return this.coalescePeerEvent(e);
    }
    if ((e.getSource()).isCoalescingEnabled() && this.coalesceOtherEvent(e, priority)) {
      return true;
    }
    if (e instanceof PaintEvent) {
      return this.coalescePaintEvent(e);
    }
    if (e instanceof MouseEvent) {
      return this.coalesceMouseEvent(e);
    }
    return false;
  }
  cacheEQItem(entry: EventQueueItem): void {
    let index = EventQueue.eventToCacheIndex(entry.event);
    if (index !== -1 && entry.event.getSource() instanceof Component) {
      let source = entry.event.getSource();
      if (source.eventCache == null) {
        source.eventCache = $J.newArray(EventQueue.CACHE_LENGTH, null);
      }
      source.eventCache[index] = entry;
    }
  }
  uncacheEQItem(entry: EventQueueItem): void {
    let index = EventQueue.eventToCacheIndex(entry.event);
    if (index !== -1 && entry.event.getSource() instanceof Component) {
      let source = entry.event.getSource();
      if (source.eventCache == null) {
        return;
      }
      source.eventCache[index] = null;
    }
  }
  static eventToCacheIndex(e: AWTEvent): number {
    switch (e.getID()) {
      case PaintEvent.PAINT:
        return EventQueue.PAINT;
      case PaintEvent.UPDATE:
        return EventQueue.UPDATE;
      case MouseEvent.MOUSE_MOVED:
        return EventQueue.MOVE;
      case MouseEvent.MOUSE_DRAGGED:
        return $J.isa(e, SunDropTargetEvent) ? -1 : EventQueue.DRAG;
      default:
        return e instanceof PeerEvent ? EventQueue.PEER : -1;
    }
  }
  /**
   * Returns whether an event is pending on any of the separate
   * Queues.
   * @return whether an event is pending on any of the separate Queues
   */
  noEvents(): boolean {
    for (let i = 0; i < EventQueue.NUM_PRIORITIES; i++) {
      if (this.queues[i].head != null) {
        return false;
      }
    }
    return true;
  }
  /**
   * Removes an event from the {@code EventQueue} and
   * returns it.  This method will block until an event has
   * been posted by another thread.
   * @return the next {@code AWTEvent}
   * @throws InterruptedException
   *            if any thread has interrupted this thread
   */
  getNextEvent$(): AWTEvent {
    do {
      SunToolkit.flushPendingEvents(this.appContext);
      this.pushPopLock.lock();
      try {
        let event = this.getNextEventPrivate();
        if (event != null) {
          return event;
        }
        AWTAutoShutdown.getInstance().notifyThreadFree(this.dispatchThread);
        this.pushPopCond.await();
      } finally {
        this.pushPopLock.unlock();
      }
    } while (true);
  }
  getNextEventPrivate(): AWTEvent {
    for (let i = (EventQueue.NUM_PRIORITIES - 1) | 0; i >= 0; i--) {
      if (this.queues[i].head != null) {
        let entry = this.queues[i].head;
        this.queues[i].head = entry.next_;
        if (entry.next_ == null) {
          this.queues[i].tail = null;
        }
        this.uncacheEQItem(entry);
        return entry.event;
      }
    }
    return null;
  }
  getNextEvent$int(id: number): AWTEvent {
    do {
      SunToolkit.flushPendingEvents(this.appContext);
      this.pushPopLock.lock();
      try {
        for (let i = 0; i < EventQueue.NUM_PRIORITIES; i++) {
          for (let entry = this.queues[i].head, prev = null; entry != null; prev = entry, entry = entry.next_) {
            if (entry.event.getID() === id) {
              if (prev == null) {
                this.queues[i].head = entry.next_;
              } else {
                prev.next_ = entry.next_;
              }
              if (this.queues[i].tail === entry) {
                this.queues[i].tail = prev;
              }
              this.uncacheEQItem(entry);
              return entry.event;
            }
          }
        }
        this.waitForID = id;
        this.pushPopCond.await();
        this.waitForID = 0;
      } finally {
        this.pushPopLock.unlock();
      }
    } while (true);
  }
  /**
   * Returns the first event on the {@code EventQueue}
   * without removing it.
   * @return the first event
   */
  peekEvent$(): AWTEvent {
    this.pushPopLock.lock();
    try {
      for (let i = (EventQueue.NUM_PRIORITIES - 1) | 0; i >= 0; i--) {
        if (this.queues[i].head != null) {
          return this.queues[i].head.event;
        }
      }
    } finally {
      this.pushPopLock.unlock();
    }
    return null;
  }
  /**
   * Returns the first event with the specified id, if any.
   * @param id the id of the type of event desired
   * @return the first event of the specified id or {@code null}
   *    if there is no such event
   */
  peekEvent$int(id: number): AWTEvent {
    this.pushPopLock.lock();
    try {
      for (let i = (EventQueue.NUM_PRIORITIES - 1) | 0; i >= 0; i--) {
        let q = this.queues[i].head;
        for (; q != null; q = q.next_) {
          if (q.event.getID() === id) {
            return q.event;
          }
        }
      }
    } finally {
      this.pushPopLock.unlock();
    }
    return null;
  }
  /**
   * Dispatches an event. The manner in which the event is
   * dispatched depends upon the type of the event and the
   * type of the event's source object:
   *
   * <table class="striped">
   * <caption>Event types, source types, and dispatch methods</caption>
   * <thead>
   *   <tr>
   *     <th scope="col">Event Type
   *     <th scope="col">Source Type
   *     <th scope="col">Dispatched To
   * </thead>
   * <tbody>
   *   <tr>
   *     <th scope="row">ActiveEvent
   *     <td>Any
   *     <td>event.dispatch()
   *   <tr>
   *     <th scope="row">Other
   *     <td>Component
   *     <td>source.dispatchEvent(AWTEvent)
   *   <tr>
   *     <th scope="row">Other
   *     <td>MenuComponent
   *     <td>source.dispatchEvent(AWTEvent)
   *   <tr>
   *     <th scope="row">Other
   *     <td>Other
   *     <td>No action (ignored)
   * </tbody>
   * </table>
   *
   * @param event an instance of {@code java.awt.AWTEvent},
   *          or a subclass of it
   * @throws NullPointerException if {@code event} is {@code null}
   * @since           1.2
   */
  dispatchEvent(event: AWTEvent): void {
    let src = event.getSource();
    let action = new (EventQueue$4())().$o(this).$c(event, src);
    let stack = AccessController.getContext();
    let srcAcc = EventQueue.getAccessControlContextFrom(src);
    let eventAcc = event.getAccessControlContext();
    if (srcAcc == null) {
      EventQueue.javaSecurityAccess.doIntersectionPrivilege(action, stack, eventAcc);
    } else {
      EventQueue.javaSecurityAccess.doIntersectionPrivilege(new (EventQueue$5())().$o(this).$c(action, eventAcc), stack, srcAcc);
    }
  }
  static getAccessControlContextFrom(src: any): AccessControlContext {
    return src instanceof Component ? (src).getAccessControlContext() : src instanceof MenuComponent ? (src).getAccessControlContext() : src instanceof TrayIcon ? (src).getAccessControlContext() : null;
  }
  /**
   * Called from dispatchEvent() under a correct AccessControlContext
   */
  dispatchEventImpl(event: AWTEvent, src: any): void {
    event.isPosted = true;
    if ($J.isa(event, ActiveEvent)) {
      this.setCurrentEventAndMostRecentTimeImpl(event);
      (event).dispatch();
    } else if (src instanceof Component) {
      (src).dispatchEvent(event);
      event.dispatched();
    } else if (src instanceof MenuComponent) {
      (src).dispatchEvent(event);
    } else if (src instanceof TrayIcon) {
      (src).dispatchEvent(event);
    } else if (src instanceof AWTAutoShutdown) {
      if (this.noEvents()) {
        this.dispatchThread.stopDispatching();
      }
    } else {
      if (EventQueue.getEventLog().isLoggable(PlatformLogger_Level.FINE)) {
        EventQueue.getEventLog().fine('Unable to dispatch event: ' + $J.str(event));
      }
    }
  }
  /**
   * Returns the timestamp of the most recent event that had a timestamp, and
   * that was dispatched from the {@code EventQueue} associated with the
   * calling thread. If an event with a timestamp is currently being
   * dispatched, its timestamp will be returned. If no events have yet
   * been dispatched, the EventQueue's initialization time will be
   * returned instead.In the current version of
   * the JDK, only {@code InputEvent}s,
   * {@code ActionEvent}s, and {@code InvocationEvent}s have
   * timestamps; however, future versions of the JDK may add timestamps to
   * additional event types. Note that this method should only be invoked
   * from an application's {@link #isDispatchThread event dispatching thread}.
   * If this method is
   * invoked from another thread, the current system time (as reported by
   * {@code System.currentTimeMillis()}) will be returned instead.
   *
   * @return the timestamp of the last {@code InputEvent},
   *         {@code ActionEvent}, or {@code InvocationEvent} to be
   *         dispatched, or {@code System.currentTimeMillis()} if this
   *         method is invoked on a thread other than an event dispatching
   *         thread
   * @see java.awt.event.InputEvent#getWhen
   * @see java.awt.event.ActionEvent#getWhen
   * @see java.awt.event.InvocationEvent#getWhen
   * @see #isDispatchThread
   *
   * @since 1.4
   */
  static getMostRecentEventTime(): number {
    return Toolkit.getEventQueue().getMostRecentEventTimeImpl();
  }
  getMostRecentEventTimeImpl(): number {
    this.pushPopLock.lock();
    try {
      return (Thread.currentThread() === this.dispatchThread) ? this.mostRecentEventTime : $J.system_currentTimeMillis();
    } finally {
      this.pushPopLock.unlock();
    }
  }
  /**
   * Returns the event currently being dispatched by the
   * {@code EventQueue} associated with the calling thread. This is
   * useful if a method needs access to the event, but was not designed to
   * receive a reference to it as an argument. Note that this method should
   * only be invoked from an application's event dispatching thread. If this
   * method is invoked from another thread, null will be returned.
   *
   * @return the event currently being dispatched, or null if this method is
   *         invoked on a thread other than an event dispatching thread
   * @since 1.4
   */
  static getCurrentEvent(): AWTEvent {
    return Toolkit.getEventQueue().getCurrentEventImpl();
  }
  getCurrentEventImpl(): AWTEvent {
    this.pushPopLock.lock();
    try {
      if (Thread.currentThread() === this.dispatchThread || EventQueue.fxAppThreadIsDispatchThread) {
        return (this.currentEvent != null) ? this.currentEvent.get() : null;
      }
      return null;
    } finally {
      this.pushPopLock.unlock();
    }
  }
  /**
   * Creates a new {@code secondary loop} associated with this
   * event queue. Use the {@link SecondaryLoop#enter} and
   * {@link SecondaryLoop#exit} methods to start and stop the
   * event loop and dispatch the events from this queue.
   *
   * @return secondaryLoop A new secondary loop object, which can
   *                       be used to launch a new nested event
   *                       loop and dispatch events from this queue
   *
   * @see SecondaryLoop#enter
   * @see SecondaryLoop#exit
   *
   * @since 1.7
   */
  createSecondaryLoop$(): SecondaryLoop {
    return this.createSecondaryLoop$Conditional$EventFilter$long(null, null, 0);
  }
  createSecondaryLoop$Conditional$EventFilter$long(cond: Conditional, filter: EventFilter, interval: number): SecondaryLoop {
    this.pushPopLock.lock();
    try {
      if (this.nextQueue != null) {
        return this.nextQueue.createSecondaryLoop$Conditional$EventFilter$long(cond, filter, interval);
      }
      if (this.fwDispatcher != null) {
        return new EventQueue$FwSecondaryLoopWrapper().$o(this)._EventQueue$FwSecondaryLoopWrapper(this.fwDispatcher.createSecondaryLoop(), filter);
      }
      if (this.dispatchThread == null) {
        this.initDispatchThread();
      }
      return new WaitDispatchSupport()._WaitDispatchSupport$EventDispatchThread$Conditional$EventFilter$long(this.dispatchThread, cond, filter, interval);
    } finally {
      this.pushPopLock.unlock();
    }
  }
  /**
   * Returns true if the calling thread is
   * {@link Toolkit#getSystemEventQueue the current AWT EventQueue}'s
   * dispatch thread. Use this method to ensure that a particular
   * task is being executed (or not being) there.
   * <p>
   * Note: use the {@link #invokeLater} or {@link #invokeAndWait}
   * methods to execute a task in
   * {@link Toolkit#getSystemEventQueue the current AWT EventQueue}'s
   * dispatch thread.
   *
   * @return true if running in
   * {@link Toolkit#getSystemEventQueue the current AWT EventQueue}'s
   * dispatch thread
   * @see             #invokeLater
   * @see             #invokeAndWait
   * @see             Toolkit#getSystemEventQueue
   * @since           1.2
   */
  static isDispatchThread(): boolean {
    let eq = Toolkit.getEventQueue();
    return eq.isDispatchThreadImpl();
  }
  isDispatchThreadImpl(): boolean {
    let eq = this;
    this.pushPopLock.lock();
    try {
      let next = eq.nextQueue;
      while (next != null) {
        eq = next;
        next = eq.nextQueue;
      }
      if (eq.fwDispatcher != null) {
        return eq.fwDispatcher.isDispatchThread();
      }
      return (Thread.currentThread() === eq.dispatchThread);
    } finally {
      this.pushPopLock.unlock();
    }
  }
  initDispatchThread(): void {
    this.pushPopLock.lock();
    try {
      if (this.dispatchThread == null && !this.threadGroup.isDestroyed() && !this.appContext.isDisposed()) {
        this.dispatchThread = AccessController.doPrivileged(new (EventQueue$6())().$o(this));
        this.dispatchThread.start();
      }
    } finally {
      this.pushPopLock.unlock();
    }
  }
  detachDispatchThread(edt: EventDispatchThread): void {
    SunToolkit.flushPendingEvents(this.appContext);
    this.pushPopLock.lock();
    try {
      if (edt === this.dispatchThread) {
        this.dispatchThread = null;
      }
      AWTAutoShutdown.getInstance().notifyThreadFree(edt);
      if (this.peekEvent$() != null) {
        this.initDispatchThread();
      }
    } finally {
      this.pushPopLock.unlock();
    }
  }
  getDispatchThread(): EventDispatchThread {
    this.pushPopLock.lock();
    try {
      return this.dispatchThread;
    } finally {
      this.pushPopLock.unlock();
    }
  }
  removeSourceEvents(source: any, removeAllEvents: boolean): void {
    SunToolkit.flushPendingEvents(this.appContext);
    this.pushPopLock.lock();
    try {
      for (let i = 0; i < EventQueue.NUM_PRIORITIES; i++) {
        let entry = this.queues[i].head;
        let prev = null;
        while (entry != null) {
          if ((entry.event.getSource() === source) && (removeAllEvents || !(entry.event instanceof SequencedEvent || entry.event instanceof SentEvent || entry.event instanceof FocusEvent || entry.event instanceof WindowEvent || entry.event instanceof KeyEvent || entry.event instanceof InputMethodEvent))) {
            if (entry.event instanceof SequencedEvent) {
              (entry.event).dispose();
            }
            if (entry.event instanceof SentEvent) {
              (entry.event).dispose();
            }
            if (entry.event instanceof InvocationEvent) {
              AWTAccessor.getInvocationEventAccessor().dispose(entry.event);
            }
            if ($J.isa(entry.event, SunDropTargetEvent)) {
              (entry.event).dispose();
            }
            if (prev == null) {
              this.queues[i].head = entry.next_;
            } else {
              prev.next_ = entry.next_;
            }
            this.uncacheEQItem(entry);
          } else {
            prev = entry;
          }
          entry = entry.next_;
        }
        this.queues[i].tail = prev;
      }
    } finally {
      this.pushPopLock.unlock();
    }
  }
  getMostRecentKeyEventTime(): number {
    this.pushPopLock.lock();
    try {
      return this.mostRecentKeyEventTime;
    } finally {
      this.pushPopLock.unlock();
    }
  }
  static setCurrentEventAndMostRecentTime(e: AWTEvent): void {
    Toolkit.getEventQueue().setCurrentEventAndMostRecentTimeImpl(e);
  }
  setCurrentEventAndMostRecentTimeImpl(e: AWTEvent): void {
    this.pushPopLock.lock();
    try {
      if (!EventQueue.fxAppThreadIsDispatchThread && Thread.currentThread() !== this.dispatchThread) {
        return;
      }
      this.currentEvent = new WeakReference(e);
      let mostRecentEventTime2 = -9223372036854775808;
      if (e instanceof InputEvent) {
        let ie = e;
        mostRecentEventTime2 = ie.getWhen();
        if (e instanceof KeyEvent) {
          this.mostRecentKeyEventTime = ie.getWhen();
        }
      } else if (e instanceof InputMethodEvent) {
        let ime = e;
        mostRecentEventTime2 = ime.getWhen();
      } else if (e instanceof ActionEvent) {
        let ae = e;
        mostRecentEventTime2 = ae.getWhen();
      } else if (e instanceof InvocationEvent) {
        let ie = e;
        mostRecentEventTime2 = ie.getWhen();
      }
      this.mostRecentEventTime = Math.max(this.mostRecentEventTime, mostRecentEventTime2);
    } finally {
      this.pushPopLock.unlock();
    }
  }
  /**
   * Causes {@code runnable} to have its {@code run}
   * method called in the {@link #isDispatchThread dispatch thread} of
   * {@link Toolkit#getSystemEventQueue the system EventQueue}.
   * This will happen after all pending events are processed.
   *
   * @param runnable  the {@code Runnable} whose {@code run}
   *                  method should be executed
   *                  asynchronously in the
   *                  {@link #isDispatchThread event dispatch thread}
   *                  of {@link Toolkit#getSystemEventQueue the system EventQueue}
   * @see             #invokeAndWait
   * @see             Toolkit#getSystemEventQueue
   * @see             #isDispatchThread
   * @since           1.2
   */
  static invokeLater(runnable: Runnable): void {
    Toolkit.getEventQueue().postEvent$AWTEvent(new InvocationEvent()._InvocationEvent$Object$Runnable(Toolkit.getDefaultToolkit(), runnable));
  }
  /**
   * Causes {@code runnable} to have its {@code run}
   * method called in the {@link #isDispatchThread dispatch thread} of
   * {@link Toolkit#getSystemEventQueue the system EventQueue}.
   * This will happen after all pending events are processed.
   * The call blocks until this has happened.  This method
   * will throw an Error if called from the
   * {@link #isDispatchThread event dispatcher thread}.
   *
   * @param runnable  the {@code Runnable} whose {@code run}
   *                  method should be executed
   *                  synchronously in the
   *                  {@link #isDispatchThread event dispatch thread}
   *                  of {@link Toolkit#getSystemEventQueue the system EventQueue}
   * @throws       InterruptedException  if any thread has
   *                  interrupted this thread
   * @throws       InvocationTargetException  if an throwable is thrown
   *                  when running {@code runnable}
   * @see             #invokeLater
   * @see             Toolkit#getSystemEventQueue
   * @see             #isDispatchThread
   * @since           1.2
   */
  static invokeAndWait$Runnable(runnable: Runnable): void {
    EventQueue.invokeAndWait$Object$Runnable(Toolkit.getDefaultToolkit(), runnable);
  }
  static invokeAndWait$Object$Runnable(source: any, runnable: Runnable): void {
    if (EventQueue.isDispatchThread()) {
      throw new JError('Cannot call invokeAndWait from the event dispatcher thread');
    }
    // class AWTInvocationLock: EventQueue$1AWTInvocationLock(), below
    let lock = new (EventQueue$1AWTInvocationLock())()._AWTInvocationLock();
    let event = new InvocationEvent()._InvocationEvent$Object$Runnable$Object$boolean(source, runnable, lock, true);
    {
      Toolkit.getEventQueue().postEvent$AWTEvent(event);
      while (!event.isDispatched()) {
        $J.monitorWait(lock);
      }
    }
    let eventThrowable = event.getThrowable();
    if (eventThrowable != null) {
      throw new InvocationTargetException(eventThrowable);
    }
  }
  wakeup(isShutdown: boolean): void {
    this.pushPopLock.lock();
    try {
      if (this.nextQueue != null) {
        this.nextQueue.wakeup(isShutdown);
      } else if (this.dispatchThread != null) {
        this.pushPopCond.signalAll();
      } else if (!isShutdown) {
        this.initDispatchThread();
      }
    } finally {
      this.pushPopLock.unlock();
    }
  }
  static $clinit() {
    EventQueue.threadInitNumber = new AtomicInteger();
    EventQueue.dummyRunnable = () => {
    };
    AWTAccessor.setEventQueueAccessor(new (EventQueue$2())());
    EventQueue.fxAppThreadIsDispatchThread = AccessController.doPrivileged(new (EventQueue$3())());
    EventQueue.javaSecurityAccess = SharedSecrets.getJavaSecurityAccess();
  }
}

export class EventQueue$FwSecondaryLoopWrapper extends JObject {
  loop: SecondaryLoop = null;
  filter_: EventFilter = null;
  _EventQueue$FwSecondaryLoopWrapper(loop: SecondaryLoop, filter: EventFilter): this {
    this.loop = loop;
    this.filter_ = filter;
    return this;
  }
  enter(): boolean {
    if (this.filter_ != null) {
      this.$outer.dispatchThread.addEventFilter(this.filter_);
    }
    return this.loop.enter();
  }
  exit(): boolean {
    if (this.filter_ != null) {
      this.$outer.dispatchThread.removeEventFilter(this.filter_);
    }
    return this.loop.exit();
  }
}

let $EventQueue$4: any = null;
/** An anonymous class (EventQueue.java:714). */
function EventQueue$4(): any {
  return $EventQueue$4 ??= $J.local(class extends JObject {
    run(): Void {
      if (this.$outer.fwDispatcher == null || this.$outer.isDispatchThreadImpl()) {
        this.$outer.dispatchEventImpl(this.$cv_event, this.$cv_src);
      } else {
        this.$outer.fwDispatcher.scheduleDispatch(() => {
          if (this.$outer.dispatchThread.filterAndCheckEvent(this.$cv_event)) {
            this.$outer.dispatchEventImpl(this.$cv_event, this.$cv_src);
          }
        });
      }
      return null;
    }
    $c($event, $src): this {
      this.$cv_event = $event; this.$cv_src = $src;
      return this;
    }
  }, 'java.awt.EventQueue$4', ['java.security.PrivilegedAction']);
}

let $EventQueue$5: any = null;
/** An anonymous class (EventQueue.java:745). */
function EventQueue$5(): any {
  return $EventQueue$5 ??= $J.local(class extends JObject {
    run(): Void {
      EventQueue.javaSecurityAccess.doIntersectionPrivilege(this.$cv_action, this.$cv_eventAcc);
      return null;
    }
    $c($action, $eventAcc): this {
      this.$cv_action = $action; this.$cv_eventAcc = $eventAcc;
      return this;
    }
  }, 'java.awt.EventQueue$5', ['java.security.PrivilegedAction']);
}

let $EventQueue$6: any = null;
/** An anonymous class (EventQueue.java:1117). */
function EventQueue$6(): any {
  return $EventQueue$6 ??= $J.local(class extends JObject {
    run(): EventDispatchThread {
      let t = new EventDispatchThread()._EventDispatchThread$ThreadGroup$String$EventQueue(this.$outer.threadGroup, this.$outer.name, this.$outer);
      t.setContextClassLoader(this.$outer.classLoader);
      t.setPriority((5 + 1) | 0);
      t.setDaemon(false);
      AWTAutoShutdown.getInstance().notifyThreadBusy(t);
      return t;
    }
  }, 'java.awt.EventQueue$6', ['java.security.PrivilegedAction']);
}

let $EventQueue$1AWTInvocationLock: any = null;
/** The local class AWTInvocationLock (EventQueue.java:1356). */
function EventQueue$1AWTInvocationLock(): any {
  return $EventQueue$1AWTInvocationLock ??= $J.local(class extends JObject {
    _AWTInvocationLock(): this {
      return this;
    }
  }, 'java.awt.EventQueue$1AWTInvocationLock', []);
}

let $EventQueue$2: any = null;
/** An anonymous class (EventQueue.java:196). */
function EventQueue$2(): any {
  return $EventQueue$2 ??= $J.local(class extends JObject {
  }, 'java.awt.EventQueue$2', ['sun.awt.AWTAccessor$EventQueueAccessor']);
}

let $EventQueue$3: any = null;
/** An anonymous class (EventQueue.java:234). */
function EventQueue$3(): any {
  return $EventQueue$3 ??= $J.local(class extends JObject {
    run(): boolean {
      return $J.equals('true', $J.system_getProperty('javafx.embed.singleThread'));
    }
  }, 'java.awt.EventQueue$3', ['java.security.PrivilegedAction']);
}

$J.define(EventQueue, 'java.awt.EventQueue', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_EventQueue' }, meths: { 'invokeAndWait(java.lang.Object,java.lang.Runnable)': 'invokeAndWait$Object$Runnable', 'invokeAndWait(java.lang.Runnable)': 'invokeAndWait$Runnable', 'createSecondaryLoop(java.awt.Conditional,java.awt.EventFilter,long)': 'createSecondaryLoop$Conditional$EventFilter$long', 'createSecondaryLoop()': 'createSecondaryLoop$', 'peekEvent(int)': 'peekEvent$int', 'peekEvent()': 'peekEvent$', 'getNextEvent(int)': 'getNextEvent$int', 'getNextEvent()': 'getNextEvent$', 'postEvent(java.awt.AWTEvent,int)': 'postEvent$AWTEvent$int$EventQueue', 'postEvent(java.awt.AWTEvent)': 'postEvent$AWTEvent' }, clinit: true, lazy: ['threadInitNumber', 'dummyRunnable', 'eventLog', 'fxAppThreadIsDispatchThread', 'javaSecurityAccess'] });
$J.define(EventQueue$FwSecondaryLoopWrapper, 'java.awt.EventQueue$FwSecondaryLoopWrapper', { kind: 'class', ifaces: ['java.awt.SecondaryLoop'], sup: 'java.lang.Object', ctors: { 'java.awt.SecondaryLoop,java.awt.EventFilter': '_EventQueue$FwSecondaryLoopWrapper' }, inner: true });
$J.module(() => {
  ActiveEvent = $J.load('java.awt.ActiveEvent');
  Component = $J.load('java.awt.Component');
  EventDispatchThread = $J.load('java.awt.EventDispatchThread');
  MenuComponent = $J.load('java.awt.MenuComponent');
  Queue = $J.load('java.awt.Queue');
  SentEvent = $J.load('java.awt.SentEvent');
  SequencedEvent = $J.load('java.awt.SequencedEvent');
  TrayIcon = $J.load('java.awt.TrayIcon');
  WaitDispatchSupport = $J.load('java.awt.WaitDispatchSupport');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  FocusEvent = $J.load('java.awt.event.FocusEvent');
  InputEvent = $J.load('java.awt.event.InputEvent');
  InputMethodEvent = $J.load('java.awt.event.InputMethodEvent');
  InvocationEvent = $J.load('java.awt.event.InvocationEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  PaintEvent = $J.load('java.awt.event.PaintEvent');
  WindowEvent = $J.load('java.awt.event.WindowEvent');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  AWTAutoShutdown = $J.load('sun.awt.AWTAutoShutdown');
  EventQueueItem = $J.load('sun.awt.EventQueueItem');
  PeerEvent = $J.load('sun.awt.PeerEvent');
});
