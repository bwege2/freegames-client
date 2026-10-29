// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/event/EventListenerList.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JArray, JObject } from '../../../../jre/index.ts';

/**
 * A class that holds a list of EventListeners.  A single instance
 * can be used to hold all listeners (of all types) for the instance
 * using the list.  It is the responsibility of the class using the
 * EventListenerList to provide type-safe API (preferably conforming
 * to the JavaBeans spec) and methods which dispatch event notification
 * methods to appropriate Event Listeners on the list.
 *
 * The main benefits that this class provides are that it is relatively
 * cheap in the case of no listeners, and it provides serialization for
 * event-listener lists in a single place, as well as a degree of MT safety
 * (when used correctly).
 *
 * Usage example:
 *    Say one is defining a class that sends out FooEvents, and one wants
 * to allow users of the class to register FooListeners and receive
 * notification when FooEvents occur.  The following should be added
 * to the class definition:
 * <pre>
 * EventListenerList listenerList = new EventListenerList();
 * FooEvent fooEvent = null;
 *
 * public void addFooListener(FooListener l) {
 *     listenerList.add(FooListener.class, l);
 * }
 *
 * public void removeFooListener(FooListener l) {
 *     listenerList.remove(FooListener.class, l);
 * }
 *
 *
 * // Notify all listeners that have registered interest for
 * // notification on this event type.  The event instance
 * // is lazily created using the parameters passed into
 * // the fire method.
 *
 * protected void fireFooXXX() {
 *     // Guaranteed to return a non-null array
 *     Object[] listeners = listenerList.getListenerList();
 *     // Process the listeners last to first, notifying
 *     // those that are interested in this event
 *     for (int i = listeners.length-2; i&gt;=0; i-=2) {
 *         if (listeners[i]==FooListener.class) {
 *             // Lazily create the event:
 *             if (fooEvent == null)
 *                 fooEvent = new FooEvent(this);
 *             ((FooListener)listeners[i+1]).fooXXX(fooEvent);
 *         }
 *     }
 * }
 * </pre>
 * foo should be changed to the appropriate name, and fireFooXxx to the
 * appropriate method name.  One fire method should exist for each
 * notification method in the FooListener interface.
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
 * @author Georges Saab
 * @author Hans Muller
 * @author James Gosling
 */
export class EventListenerList extends JObject {
  static NULL_ARRAY: any[] = null;
  /**
   * The list of ListenerType - Listener pairs
   */
  listenerList: any[] = null;
  /**
   * Constructs a {@code EventListenerList}.
   */
  _EventListenerList(): this {
    this.listenerList = EventListenerList.NULL_ARRAY;
    return this;
  }
  /**
   * Passes back the event listener list as an array
   * of ListenerType-listener pairs.  Note that for
   * performance reasons, this implementation passes back
   * the actual data structure in which the listener data
   * is stored internally!
   * This method is guaranteed to pass back a non-null
   * array, so that no null-checking is required in
   * fire methods.  A zero-length array of Object should
   * be returned if there are currently no listeners.
   *
   * WARNING!!! Absolutely NO modification of
   * the data contained in this array should be made -- if
   * any such manipulation is necessary, it should be done
   * on a copy of the array returned rather than the array
   * itself.
   *
   * @return array of ListenerType-listener pairs
   */
  getListenerList(): any[] {
    return this.listenerList;
  }
  /**
   * Return an array of all the listeners of the given type.
   *
   * @param <T> the type of {@code EventListener} to search for
   * @param t the type of {@code EventListener} classes to be returned
   * @return all of the listeners of the specified type.
   * @throws  ClassCastException if the supplied class
   *          is not assignable to EventListener
   *
   * @since 1.3
   */
  getListeners<T>(t: JClass<T>): T[] {
    let lList = this.listenerList;
    let n = this.getListenerCount$ObjectArr$Class$EventListenerList(lList, t);
    let result = JArray.newInstance(t, n);
    let j = 0;
    for (let i = (lList.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (lList[i] === t) {
        let tmp = lList[(i + 1) | 0];
        result[j++] = tmp;
      }
    }
    return result;
  }
  /**
   * Returns the total number of listeners of the supplied type
   * for this listener list.
   *
   * @param t the type of listeners to count
   * @return the number of listeners of type {@code t}
   */
  getListenerCount$Class(t: JClass<any>): number {
    let lList = this.listenerList;
    return this.getListenerCount$ObjectArr$Class$EventListenerList(lList, t);
  }
  getListenerCount$ObjectArr$Class$EventListenerList(list: any[], t: JClass<any>): number {
    let count = 0;
    for (let i = 0; i < list.length; i = (i + 2) | 0) {
      if (t === list[i]) {
        count++;
      }
    }
    return count;
  }
  /**
   * Adds the listener as a listener of the specified type.
   *
   * @param <T> the type of {@code EventListener} to add
   * @param t the type of the {@code EventListener} class to add
   * @param l the listener to be added
   */
  add<T>(t: JClass<T>, l: T): void {
    if (l == null) {
      return;
    }
    if (!t.isInstance(l)) {
      throw new IllegalArgumentException('Listener ' + $J.str(l) + ' is not of type ' + $J.str(t));
    }
    if (this.listenerList === EventListenerList.NULL_ARRAY) {
      this.listenerList = [t, l];
    } else {
      let i = this.listenerList.length;
      let tmp = $J.newArray((i + 2) | 0, null);
      $J.system_arraycopy(this.listenerList, 0, tmp, 0, i);
      tmp[i] = t;
      (tmp[(i + 1) | 0]) = l;
      this.listenerList = tmp;
    }
  }
  /**
   * Removes the listener as a listener of the specified type.
   *
   * @param <T> the type of {@code EventListener}
   * @param t the type of the listener to be removed
   * @param l the listener to be removed
   */
  remove<T>(t: JClass<T>, l: T): void {
    if (l == null) {
      return;
    }
    if (!t.isInstance(l)) {
      throw new IllegalArgumentException('Listener ' + $J.str(l) + ' is not of type ' + $J.str(t));
    }
    let index = -1;
    for (let i = (this.listenerList.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if ((this.listenerList[i] === t) && ($J.equals((this.listenerList[(i + 1) | 0]), l) === true)) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      let tmp = $J.newArray((this.listenerList.length - 2) | 0, null);
      $J.system_arraycopy(this.listenerList, 0, tmp, 0, index);
      if (index < tmp.length) {
        $J.system_arraycopy(this.listenerList, (index + 2) | 0, tmp, index, (tmp.length - index) | 0);
      }
      this.listenerList = (tmp.length === 0) ? EventListenerList.NULL_ARRAY : tmp;
    }
  }
  /**
   * Returns a string representation of the EventListenerList.
   */
  toString(): string {
    let lList = this.listenerList;
    let s = 'EventListenerList: ';
    s += $J.idiv(lList.length, 2) + ' listeners: ';
    for (let i = 0; i <= ((lList.length - 2) | 0); i = (i + 2) | 0) {
      s += ' type ' + (lList[i]).getName();
      s += ' listener ' + $J.str(lList[(i + 1) | 0]);
    }
    return s;
  }
  static $clinit() {
    EventListenerList.NULL_ARRAY = $J.newArray(0, null);
  }
}

$J.define(EventListenerList, 'javax.swing.event.EventListenerList', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_EventListenerList' }, meths: { 'getListenerCount(java.lang.Object[],java.lang.Class)': 'getListenerCount$ObjectArr$Class$EventListenerList', 'getListenerCount(java.lang.Class)': 'getListenerCount$Class', 'getListenerCount()': 'getListenerCount$' }, clinit: true, lazy: ['NULL_ARRAY'] });
