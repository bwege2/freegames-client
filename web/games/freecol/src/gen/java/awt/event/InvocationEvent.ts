// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/event/InvocationEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Exception, JObject, Throwable } from '../../../../jre/index.ts';
import { AWTEvent } from '../AWTEvent.ts';

let AWTAccessor;

/**
 * An event which executes the {@code run()} method on a {@code Runnable
 * } when dispatched by the AWT event dispatcher thread. This class can
 * be used as a reference implementation of {@code ActiveEvent} rather
 * than declaring a new class and defining {@code dispatch()}.<p>
 *
 * Instances of this class are placed on the {@code EventQueue} by calls
 * to {@code invokeLater} and {@code invokeAndWait}. Client code
 * can use this fact to write replacement functions for {@code invokeLater
 * } and {@code invokeAndWait} without writing special-case code
 * in any {@code AWTEventListener} objects.
 * <p>
 * An unspecified behavior will be caused if the {@code id} parameter
 * of any particular {@code InvocationEvent} instance is not
 * in the range from {@code INVOCATION_FIRST} to {@code INVOCATION_LAST}.
 *
 * @author      Fred Ecks
 * @author      David Mendenhall
 *
 * @see         java.awt.ActiveEvent
 * @see         java.awt.EventQueue#invokeLater
 * @see         java.awt.EventQueue#invokeAndWait
 * @see         AWTEventListener
 *
 * @since       1.2
 */
export class InvocationEvent extends AWTEvent {
  /**
   * Marks the first integer id for the range of invocation event ids.
   */
  static readonly INVOCATION_FIRST: number = 1200;
  /**
   * The default id for all InvocationEvents.
   */
  static readonly INVOCATION_DEFAULT: number = 1200;
  /**
   * Marks the last integer id for the range of invocation event ids.
   */
  static readonly INVOCATION_LAST: number = 1200;
  /**
   * The Runnable whose run() method will be called.
   */
  runnable: Runnable = null;
  /**
   * The (potentially null) Object whose notifyAll() method will be called
   * immediately after the Runnable.run() method has returned or thrown an exception
   * or after the event was disposed.
   *
   * @see #isDispatched
   */
  notifier: any = null;
  /**
   * The (potentially null) Runnable whose run() method will be called
   * immediately after the event was dispatched or disposed.
   *
   * @see #isDispatched
   * @since 1.8
   */
  listener: Runnable = null;
  /**
   * Indicates whether the {@code run()} method of the {@code runnable}
   * was executed or not.
   *
   * @see #isDispatched
   * @since 1.7
   */
  dispatched_: boolean = false;
  /**
   * Set to true if dispatch() catches Throwable and stores it in the
   * exception instance variable. If false, Throwables are propagated up
   * to the EventDispatchThread's dispatch loop.
   */
  catchExceptions: boolean = false;
  /**
   * The (potentially null) Exception thrown during execution of the
   * Runnable.run() method. This variable will also be null if a particular
   * instance does not catch exceptions.
   */
  exception: Exception = null;
  /**
   * The (potentially null) Throwable thrown during execution of the
   * Runnable.run() method. This variable will also be null if a particular
   * instance does not catch exceptions.
   */
  throwable: Throwable = null;
  /**
   * The timestamp of when this event occurred.
   *
   * @serial
   * @see #getWhen
   */
  when: number = 0;
  $init_InvocationEvent() {
    this.exception = null;
    this.throwable = null;
  }
  /**
   * Constructs an {@code InvocationEvent} with the specified
   * source which will execute the runnable's {@code run()}
   * method when dispatched.
   * <p>This is a convenience constructor.  An invocation of the form
   * {@code InvocationEvent(source, runnable)}
   * behaves in exactly the same way as the invocation of
   * {@link #InvocationEvent(Object, Runnable, Object, boolean)
   * InvocationEvent(source, runnable, null, false)}.
   * <p> This method throws an {@code IllegalArgumentException}
   * if {@code source} is {@code null}.
   *
   * @param source    The {@code Object} that originated the event
   * @param runnable  The {@code Runnable} whose {@code run()}
   *                  method will be executed
   * @throws IllegalArgumentException if {@code source} is null
   *
   * @see #getSource()
   * @see #InvocationEvent(Object, Runnable, Object, boolean)
   */
  _InvocationEvent$Object$Runnable(source: any, runnable: Runnable): this {
    this._InvocationEvent$Object$int$Runnable$Object$Runnable$boolean(source, InvocationEvent.INVOCATION_DEFAULT, runnable, null, null, false);
    return this;
  }
  /**
   * Constructs an {@code InvocationEvent} with the specified
   * source which will execute the runnable's {@code run()}
   * method when dispatched.  If notifier is non-{@code null},
   * {@code notifyAll()} will be called on it
   * immediately after {@code run()} has returned or thrown an exception.
   * <p>An invocation of the form
   * {@code InvocationEvent(source, runnable, notifier, catchThrowables)}
   * behaves in exactly the same way as the invocation of
   * {@link #InvocationEvent(Object, int, Runnable, Object, boolean)
   * InvocationEvent(source, InvocationEvent.INVOCATION_DEFAULT, runnable, notifier, catchThrowables)}.
   * <p>This method throws an {@code IllegalArgumentException}
   * if {@code source} is {@code null}.
   *
   * @param source            The {@code Object} that originated
   *                          the event
   * @param runnable          The {@code Runnable} whose
   *                          {@code run()} method will be
   *                          executed
   * @param notifier          The {@code Object} whose {@code notifyAll}
   *                          method will be called after
   *                          {@code Runnable.run} has returned or
   *                          thrown an exception or after the event was
   *                          disposed
   * @param catchThrowables   Specifies whether {@code dispatch}
   *                          should catch Throwable when executing
   *                          the {@code Runnable}'s {@code run()}
   *                          method, or should instead propagate those
   *                          Throwables to the EventDispatchThread's
   *                          dispatch loop
   * @throws IllegalArgumentException if {@code source} is null
   *
   * @see #getSource()
   * @see     #InvocationEvent(Object, int, Runnable, Object, boolean)
   */
  _InvocationEvent$Object$Runnable$Object$boolean(source: any, runnable: Runnable, notifier: any, catchThrowables: boolean): this {
    this._InvocationEvent$Object$int$Runnable$Object$Runnable$boolean(source, InvocationEvent.INVOCATION_DEFAULT, runnable, notifier, null, catchThrowables);
    return this;
  }
  /**
   * Constructs an {@code InvocationEvent} with the specified
   * source which will execute the runnable's {@code run()}
   * method when dispatched.  If listener is non-{@code null},
   * {@code listener.run()} will be called immediately after
   * {@code run} has returned, thrown an exception or the event
   * was disposed.
   * <p>This method throws an {@code IllegalArgumentException}
   * if {@code source} is {@code null}.
   *
   * @param source            The {@code Object} that originated
   *                          the event
   * @param runnable          The {@code Runnable} whose
   *                          {@code run()} method will be
   *                          executed
   * @param listener          The {@code Runnable} whose
   *                          {@code run()} method will be called
   *                          after the {@code InvocationEvent}
   *                          was dispatched or disposed
   * @param catchThrowables   Specifies whether {@code dispatch}
   *                          should catch Throwable when executing
   *                          the {@code Runnable}'s {@code run()}
   *                          method, or should instead propagate those
   *                          Throwables to the EventDispatchThread's
   *                          dispatch loop
   * @throws IllegalArgumentException if {@code source} is null
   */
  _InvocationEvent$Object$Runnable$Runnable$boolean(source: any, runnable: Runnable, listener: Runnable, catchThrowables: boolean): this {
    this._InvocationEvent$Object$int$Runnable$Object$Runnable$boolean(source, InvocationEvent.INVOCATION_DEFAULT, runnable, null, listener, catchThrowables);
    return this;
  }
  /**
   * Constructs an {@code InvocationEvent} with the specified
   * source and ID which will execute the runnable's {@code run()}
   * method when dispatched.  If notifier is non-{@code null},
   * {@code notifyAll()} will be called on it immediately after
   * {@code run()} has returned or thrown an exception.
   * <p>This method throws an
   * {@code IllegalArgumentException} if {@code source}
   * is {@code null}.
   *
   * @param source            The {@code Object} that originated
   *                          the event
   * @param id     An integer indicating the type of event.
   *                     For information on allowable values, see
   *                     the class description for {@link InvocationEvent}
   * @param runnable          The {@code Runnable} whose
   *                          {@code run()} method will be executed
   * @param notifier          The {@code Object} whose {@code notifyAll}
   *                          method will be called after
   *                          {@code Runnable.run} has returned or
   *                          thrown an exception or after the event was
   *                          disposed
   * @param catchThrowables   Specifies whether {@code dispatch}
   *                          should catch Throwable when executing the
   *                          {@code Runnable}'s {@code run()}
   *                          method, or should instead propagate those
   *                          Throwables to the EventDispatchThread's
   *                          dispatch loop
   * @throws IllegalArgumentException if {@code source} is null
   * @see #getSource()
   * @see #getID()
   */
  _InvocationEvent$Object$int$Runnable$Object$boolean(source: any, id: number, runnable: Runnable, notifier: any, catchThrowables: boolean): this {
    this._InvocationEvent$Object$int$Runnable$Object$Runnable$boolean(source, id, runnable, notifier, null, catchThrowables);
    return this;
  }
  _InvocationEvent$Object$int$Runnable$Object$Runnable$boolean(source: any, id: number, runnable: Runnable, notifier: any, listener: Runnable, catchThrowables: boolean): this {
    this._AWTEvent$Object$int(source, id);
    this.$init_InvocationEvent();
    this.runnable = runnable;
    this.notifier = notifier;
    this.listener = listener;
    this.catchExceptions = catchThrowables;
    this.when = $J.system_currentTimeMillis();
    return this;
  }
  /**
   * Executes the Runnable's {@code run()} method and notifies the
   * notifier (if any) when {@code run()} has returned or thrown an exception.
   *
   * @see #isDispatched
   */
  dispatch(): void {
    try {
      if (this.catchExceptions) {
        try {
          this.runnable();
        } catch ($e0) {
          {
            let t = $J.exc($e0);
            if ($J.isa(t, Exception)) {
              this.exception = t;
            }
            this.throwable = t;
          }
        }
      } else {
        this.runnable();
      }
    } finally {
      this.finishedDispatching(true);
    }
  }
  /**
   * Returns any Throwable caught while executing
   * the Runnable's {@code run()} method.
   *
   * @return  A reference to the Throwable if one was thrown; null if no
   *          Throwable was thrown or if this InvocationEvent does not
   *          catch Throwables
   * @since 1.5
   */
  getThrowable(): Throwable {
    return (this.catchExceptions) ? this.throwable : null;
  }
  /**
   * Returns the timestamp of when this event occurred.
   *
   * @return this event's timestamp
   * @since 1.4
   */
  getWhen(): number {
    return this.when;
  }
  /**
   * Returns {@code true} if the event is dispatched or any exception is
   * thrown while dispatching, {@code false} otherwise. The method should
   * be called by a waiting thread that calls the {@code notifier.wait()} method.
   * Since spurious wakeups are possible (as explained in {@link Object#wait()}),
   * this method should be used in a waiting loop to ensure that the event
   * got dispatched:
   * <pre>
   *     while (!event.isDispatched()) {
   *         notifier.wait();
   *     }
   * </pre>
   * If the waiting thread wakes up without dispatching the event,
   * the {@code isDispatched()} method returns {@code false}, and
   * the {@code while} loop executes once more, thus, causing
   * the awakened thread to revert to the waiting mode.
   * <p>
   * If the {@code notifier.notifyAll()} happens before the waiting thread
   * enters the {@code notifier.wait()} method, the {@code while} loop ensures
   * that the waiting thread will not enter the {@code notifier.wait()} method.
   * Otherwise, there is no guarantee that the waiting thread will ever be woken
   * from the wait.
   *
   * @return {@code true} if the event has been dispatched, or any exception
   * has been thrown while dispatching, {@code false} otherwise
   * @see #dispatch
   * @see #notifier
   * @see #catchExceptions
   * @since 1.7
   */
  isDispatched(): boolean {
    return this.dispatched_;
  }
  /**
   * Called when the event was dispatched or disposed
   * @param dispatched true if the event was dispatched
   *                   false if the event was disposed
   */
  finishedDispatching(dispatched: boolean): void {
    this.dispatched_ = dispatched;
    if (this.notifier != null) {
      {
        $J.monitorNotify(this.notifier, true);
      }
    }
    if (this.listener != null) {
      this.listener();
    }
  }
  /**
   * Returns a parameter string identifying this event.
   * This method is useful for event-logging and for debugging.
   *
   * @return  A string identifying the event and its attributes
   */
  paramString(): string {
    let typeStr: string;
    switch (this.id_) {
      case InvocationEvent.INVOCATION_DEFAULT:
        typeStr = 'INVOCATION_DEFAULT';
        break;
      default:
        typeStr = 'unknown type';
    }
    return typeStr + ',runnable=' + $J.str(this.runnable) + ',notifier=' + $J.str(this.notifier) + ',catchExceptions=' + this.catchExceptions + ',when=' + this.when;
  }
  static $clinit() {
    AWTAccessor.setInvocationEventAccessor(new (InvocationEvent$1())());
  }
}

let $InvocationEvent$1: any = null;
/** An anonymous class (InvocationEvent.java:63). */
function InvocationEvent$1(): any {
  return $InvocationEvent$1 ??= $J.local(class extends JObject {
    dispose(invocationEvent: InvocationEvent): void {
      invocationEvent.finishedDispatching(false);
    }
  }, 'java.awt.event.InvocationEvent$1', ['sun.awt.AWTAccessor$InvocationEventAccessor']);
}

$J.define(InvocationEvent, 'java.awt.event.InvocationEvent', { kind: 'class', ifaces: ['java.awt.ActiveEvent'], sup: 'java.awt.AWTEvent', ctors: { 'java.lang.Object,int,java.lang.Runnable,java.lang.Object,java.lang.Runnable,boolean': '_InvocationEvent$Object$int$Runnable$Object$Runnable$boolean', 'java.lang.Object,int,java.lang.Runnable,java.lang.Object,boolean': '_InvocationEvent$Object$int$Runnable$Object$boolean', 'java.lang.Object,java.lang.Runnable,java.lang.Runnable,boolean': '_InvocationEvent$Object$Runnable$Runnable$boolean', 'java.lang.Object,java.lang.Runnable,java.lang.Object,boolean': '_InvocationEvent$Object$Runnable$Object$boolean', 'java.lang.Object,java.lang.Runnable': '_InvocationEvent$Object$Runnable' }, clinit: true, lazy: [] });
$J.module(() => {
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
