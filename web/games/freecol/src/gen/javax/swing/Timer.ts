// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/Timer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AtomicBoolean, IllegalArgumentException, JObject, ReentrantLock, SecurityException } from '../../../jre/index.ts';

let ActionEvent, ActionListener, SwingUtilities, TimerQueue, EventListenerList;

/**
 * Fires one or more {@code ActionEvent}s at specified
 * intervals. An example use is an animation object that uses a
 * <code>Timer</code> as the trigger for drawing its frames.
 * <p>
 * Setting up a timer
 * involves creating a <code>Timer</code> object,
 * registering one or more action listeners on it,
 * and starting the timer using
 * the <code>start</code> method.
 * For example,
 * the following code creates and starts a timer
 * that fires an action event once per second
 * (as specified by the first argument to the <code>Timer</code> constructor).
 * The second argument to the <code>Timer</code> constructor
 * specifies a listener to receive the timer's action events.
 *
 * <pre>
 *  int delay = 1000; //milliseconds
 *  ActionListener taskPerformer = new ActionListener() {
 *      public void actionPerformed(ActionEvent evt) {
 *          <em>//...Perform a task...</em>
 *      }
 *  };
 *  new Timer(delay, taskPerformer).start();</pre>
 *
 * <p>
 * {@code Timers} are constructed by specifying both a delay parameter
 * and an {@code ActionListener}. The delay parameter is used
 * to set both the initial delay and the delay between event
 * firing, in milliseconds. Once the timer has been started,
 * it waits for the initial delay before firing its
 * first <code>ActionEvent</code> to registered listeners.
 * After this first event, it continues to fire events
 * every time the between-event delay has elapsed, until it
 * is stopped.
 * <p>
 * After construction, the initial delay and the between-event
 * delay can be changed independently, and additional
 * <code>ActionListeners</code> may be added.
 * <p>
 * If you want the timer to fire only the first time and then stop,
 * invoke <code>setRepeats(false)</code> on the timer.
 * <p>
 * Although all <code>Timer</code>s perform their waiting
 * using a single, shared thread
 * (created by the first <code>Timer</code> object that executes),
 * the action event handlers for <code>Timer</code>s
 * execute on another thread -- the event-dispatching thread.
 * This means that the action handlers for <code>Timer</code>s
 * can safely perform operations on Swing components.
 * However, it also means that the handlers must execute quickly
 * to keep the GUI responsive.
 *
 * <p>
 * In v 1.3, another <code>Timer</code> class was added
 * to the Java platform: <code>java.util.Timer</code>.
 * Both it and <code>javax.swing.Timer</code>
 * provide the same basic functionality,
 * but <code>java.util.Timer</code>
 * is more general and has more features.
 * The <code>javax.swing.Timer</code> has two features
 * that can make it a little easier to use with GUIs.
 * First, its event handling metaphor is familiar to GUI programmers
 * and can make dealing with the event-dispatching thread
 * a bit simpler.
 * Second, its
 * automatic thread sharing means that you don't have to
 * take special steps to avoid spawning
 * too many threads.
 * Instead, your timer uses the same thread
 * used to make cursors blink,
 * tool tips appear,
 * and so on.
 *
 * <p>
 * You can find further documentation
 * and several examples of using timers by visiting
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/timer.html"
 * target = "_top">How to Use Timers</a>,
 * a section in <em>The Java Tutorial.</em>
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @see java.util.Timer
 *
 *
 * @author Dave Moore
 * @since 1.2
 */
export class Timer extends JObject {
  /**
   * The collection of registered listeners
   */
  listenerList: EventListenerList = null;
  notify_: AtomicBoolean = null;
  initialDelay: number = 0;
  delay: number = 0;
  repeats: boolean = false;
  coalesce: boolean = false;
  doPostEvent: Runnable = null;
  static logTimers: boolean = false;
  lock: Lock = null;
  delayedTimer: TimerQueue$DelayedTimer = null;
  actionCommand: string = null;
  acc: AccessControlContext = null;
  /**
   * Creates a {@code Timer} and initializes both the initial delay and
   * between-event delay to {@code delay} milliseconds. If {@code delay}
   * is less than or equal to zero, the timer fires as soon as it
   * is started. If <code>listener</code> is not <code>null</code>,
   * it's registered as an action listener on the timer.
   *
   * @param delay milliseconds for the initial and between-event delay
   * @param listener  an initial listener; can be <code>null</code>
   *
   * @see #addActionListener
   * @see #setInitialDelay
   * @see #setRepeats
   */
  _Timer(delay: number, listener: ActionListener): this {
    this.listenerList = new EventListenerList()._EventListenerList();
    this.notify_ = new AtomicBoolean(false);
    this.repeats = true;
    this.coalesce = true;
    this.lock = new ReentrantLock();
    this.delayedTimer = null;
    this.acc = AccessController.getContext();
    this.delay = delay;
    this.initialDelay = delay;
    this.doPostEvent = $J.fn(new Timer$DoPostEvent().$o(this)._Timer$DoPostEvent(), 'run');
    if (listener != null) {
      this.addActionListener(listener);
    }
    return this;
  }
  /**
   * Returns the acc this timer was constructed with.
   */
  getAccessControlContext(): AccessControlContext {
    if (this.acc == null) {
      throw new SecurityException('Timer is missing AccessControlContext');
    }
    return this.acc;
  }
  /**
   * Adds an action listener to the <code>Timer</code>.
   *
   * @param listener the listener to add
   *
   * @see #Timer
   */
  addActionListener(listener: ActionListener): void {
    this.listenerList.add($J.cls(ActionListener), listener);
  }
  /**
   * Removes the specified action listener from the <code>Timer</code>.
   *
   * @param listener the listener to remove
   */
  removeActionListener(listener: ActionListener): void {
    this.listenerList.remove($J.cls(ActionListener), listener);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.
   *
   * @param e the action event to fire
   * @see EventListenerList
   */
  fireActionPerformed(e: ActionEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ActionListener)) {
        $J.fn((listeners[(i + 1) | 0]), 'actionPerformed')(e);
      }
    }
  }
  /**
   * Returns the timer queue.
   */
  timerQueue(): TimerQueue {
    return TimerQueue.sharedInstance();
  }
  /**
   * Sets the <code>Timer</code>'s between-event delay, the number of milliseconds
   * between successive action events. This does not affect the initial delay
   * property, which can be set by the {@code setInitialDelay} method.
   *
   * @param delay the delay in milliseconds
   * @see #setInitialDelay
   */
  setDelay(delay: number): void {
    Timer.checkDelay(delay, 'Invalid delay: ');
    this.delay = delay;
  }
  static checkDelay(delay: number, message: string): void {
    if (delay < 0) {
      throw new IllegalArgumentException(message + delay);
    }
  }
  /**
   * Returns the delay, in milliseconds,
   * between firings of action events.
   *
   * @return the delay, in milliseconds, between firings of action events
   * @see #setDelay
   * @see #getInitialDelay
   */
  getDelay(): number {
    return this.delay;
  }
  /**
   * Sets the <code>Timer</code>'s initial delay, the time
   * in milliseconds to wait after the timer is started
   * before firing the first event. Upon construction, this
   * is set to be the same as the between-event delay,
   * but then its value is independent and remains unaffected
   * by changes to the between-event delay.
   *
   * @param initialDelay the initial delay, in milliseconds
   * @see #setDelay
   */
  setInitialDelay(initialDelay: number): void {
    Timer.checkDelay(initialDelay, 'Invalid initial delay: ');
    this.initialDelay = initialDelay;
  }
  /**
   * Returns the {@code Timer}'s initial delay.
   *
   * @return the {@code Timer}'s initial delay, in milliseconds
   * @see #setInitialDelay
   * @see #setDelay
   */
  getInitialDelay(): number {
    return this.initialDelay;
  }
  /**
   * If <code>flag</code> is <code>false</code>,
   * instructs the <code>Timer</code> to send only one
   * action event to its listeners.
   *
   * @param flag specify <code>false</code> to make the timer
   *             stop after sending its first action event
   */
  setRepeats(flag: boolean): void {
    this.repeats = flag;
  }
  /**
   * Returns <code>true</code> (the default)
   * if the <code>Timer</code> will send
   * an action event
   * to its listeners multiple times.
   *
   * @return true if the {@code Timer} will send an action event to its
   *              listeners multiple times
   * @see #setRepeats
   */
  isRepeats(): boolean {
    return this.repeats;
  }
  /**
   * Sets whether the <code>Timer</code> coalesces multiple pending
   * <code>ActionEvent</code> firings.
   * A busy application may not be able
   * to keep up with a <code>Timer</code>'s event generation,
   * causing multiple
   * action events to be queued.  When processed,
   * the application sends these events one after the other, causing the
   * <code>Timer</code>'s listeners to receive a sequence of
   * events with no delay between them. Coalescing avoids this situation
   * by reducing multiple pending events to a single event.
   * <code>Timer</code>s
   * coalesce events by default.
   *
   * @param flag specify <code>false</code> to turn off coalescing
   */
  setCoalesce(flag: boolean): void {
    let old = this.coalesce;
    this.coalesce = flag;
    if (!old && this.coalesce) {
      this.cancelEvent();
    }
  }
  /**
   * Returns the string that will be delivered as the action command
   * in <code>ActionEvent</code>s fired by this timer. May be
   * <code>null</code>, which is also the default.
   *
   * @return the action command used in firing events
   * @since 1.6
   */
  getActionCommand(): string {
    return this.actionCommand;
  }
  /**
   * Starts the <code>Timer</code>,
   * causing it to start sending action events
   * to its listeners.
   *
   * @see #stop
   */
  start(): void {
    this.timerQueue().addTimer$Timer$long(this, this.getInitialDelay());
  }
  /**
   * Returns {@code true} if the {@code Timer} is running.
   *
   * @return true if the {@code Timer} is running, false otherwise
   * @see #start
   */
  isRunning(): boolean {
    return this.timerQueue().containsTimer(this);
  }
  /**
   * Stops the <code>Timer</code>,
   * causing it to stop sending action events
   * to its listeners.
   *
   * @see #start
   */
  stop(): void {
    this.getLock().lock();
    try {
      this.cancelEvent();
      this.timerQueue().removeTimer(this);
    } finally {
      this.getLock().unlock();
    }
  }
  /**
   * Restarts the <code>Timer</code>,
   * canceling any pending firings and causing
   * it to fire with its initial delay.
   */
  restart(): void {
    this.getLock().lock();
    try {
      this.stop();
      this.start();
    } finally {
      this.getLock().unlock();
    }
  }
  /**
   * Resets the internal state to indicate this Timer shouldn't notify
   * any of its listeners. This does not stop a repeatable Timer from
   * firing again, use <code>stop</code> for that.
   */
  cancelEvent(): void {
    this.notify_.set(false);
  }
  post(): void {
    if (this.notify_.compareAndSet(false, true) || !this.coalesce) {
      AccessController.doPrivileged(new (Timer$1())().$o(this), this.getAccessControlContext());
    }
  }
  getLock(): Lock {
    return this.lock;
  }
}

/**
 * DoPostEvent is a runnable class that fires actionEvents to
 * the listeners on the EventDispatchThread, via invokeLater.
 * @see Timer#post
 */
export class Timer$DoPostEvent extends JObject {
  _Timer$DoPostEvent(): this {
    return this;
  }
  run(): void {
    if (Timer.logTimers) {
      $J.out.println('Timer ringing: ' + $J.str(this.$outer));
    }
    if (this.$outer.notify_.get()) {
      this.$outer.fireActionPerformed(new ActionEvent()._ActionEvent$Object$int$String$long$int(this.$outer, 0, this.$outer.getActionCommand(), $J.system_currentTimeMillis(), 0));
      if (this.$outer.coalesce) {
        this.$outer.cancelEvent();
      }
    }
  }
}

let $Timer$1: any = null;
/** An anonymous class (Timer.java:615). */
function Timer$1(): any {
  return $Timer$1 ??= $J.local(class extends JObject {
    run(): Void {
      SwingUtilities.invokeLater(this.$outer.doPostEvent);
      return null;
    }
  }, 'javax.swing.Timer$1', ['java.security.PrivilegedAction']);
}

$J.define(Timer, 'javax.swing.Timer', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int,java.awt.event.ActionListener': '_Timer' } });
$J.define(Timer$DoPostEvent, 'javax.swing.Timer$DoPostEvent', { kind: 'class', ifaces: ['java.lang.Runnable'], sup: 'java.lang.Object', ctors: { '': '_Timer$DoPostEvent' }, inner: true });
$J.module(() => {
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  ActionListener = $J.load('java.awt.event.ActionListener');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  TimerQueue = $J.load('javax.swing.TimerQueue');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
});
