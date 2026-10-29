// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/PropertyChangeSupport.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, NullPointerException } from '../../../jre/index.ts';
import { ChangeListenerMap } from './ChangeListenerMap.ts';

let IndexedPropertyChangeEvent, PropertyChangeEvent, PropertyChangeListenerProxy;

/**
 * This is a utility class that can be used by beans that support bound
 * properties.  It manages a list of listeners and dispatches
 * {@link PropertyChangeEvent}s to them.  You can use an instance of this class
 * as a member field of your bean and delegate these types of work to it.
 * The {@link PropertyChangeListener} can be registered for all properties
 * or for a property specified by name.
 * <p>
 * Here is an example of {@code PropertyChangeSupport} usage that follows
 * the rules and recommendations laid out in the JavaBeans specification:
 * <pre>
 * public class MyBean {
 *     private final PropertyChangeSupport pcs = new PropertyChangeSupport(this);
 *
 *     public void addPropertyChangeListener(PropertyChangeListener listener) {
 *         this.pcs.addPropertyChangeListener(listener);
 *     }
 *
 *     public void removePropertyChangeListener(PropertyChangeListener listener) {
 *         this.pcs.removePropertyChangeListener(listener);
 *     }
 *
 *     private String value;
 *
 *     public String getValue() {
 *         return this.value;
 *     }
 *
 *     public void setValue(String newValue) {
 *         String oldValue = this.value;
 *         this.value = newValue;
 *         this.pcs.firePropertyChange("value", oldValue, newValue);
 *     }
 *
 *     [...]
 * }
 * </pre>
 * <p>
 * A {@code PropertyChangeSupport} instance is thread-safe.
 * <p>
 * This class is serializable.  When it is serialized it will save
 * (and restore) any listeners that are themselves serializable.  Any
 * non-serializable listeners will be skipped during serialization.
 *
 * @see VetoableChangeSupport
 * @since 1.1
 */
export class PropertyChangeSupport extends JObject {
  map_: PropertyChangeSupport$PropertyChangeListenerMap = null;
  /**
   * The object to be provided as the "source" for any generated events.
   */
  source: any = null;
  /**
   * Constructs a {@code PropertyChangeSupport} object.
   *
   * @param sourceBean  The bean to be given as the source for any events.
   */
  _PropertyChangeSupport(sourceBean: any): this {
    this.map_ = new PropertyChangeSupport$PropertyChangeListenerMap()._PropertyChangeSupport$PropertyChangeListenerMap();
    if (sourceBean == null) {
      throw new NullPointerException();
    }
    this.source = sourceBean;
    return this;
  }
  /**
   * Add a PropertyChangeListener to the listener list.
   * The listener is registered for all properties.
   * The same listener object may be added more than once, and will be called
   * as many times as it is added.
   * If {@code listener} is null, no exception is thrown and no action
   * is taken.
   *
   * @param listener  The PropertyChangeListener to be added
   */
  addPropertyChangeListener$PropertyChangeListener(listener: PropertyChangeListener): void {
    if (listener == null) {
      return;
    }
    if ($J.unfn(listener) instanceof PropertyChangeListenerProxy) {
      let proxy = $J.unfn(listener);
      this.addPropertyChangeListener$String$PropertyChangeListener(proxy.getPropertyName(), proxy.getListener());
    } else {
      this.map_.add(null, listener);
    }
  }
  /**
   * Remove a PropertyChangeListener from the listener list.
   * This removes a PropertyChangeListener that was registered
   * for all properties.
   * If {@code listener} was added more than once to the same event
   * source, it will be notified one less time after being removed.
   * If {@code listener} is null, or was never added, no exception is
   * thrown and no action is taken.
   *
   * @param listener  The PropertyChangeListener to be removed
   */
  removePropertyChangeListener$PropertyChangeListener(listener: PropertyChangeListener): void {
    if (listener == null) {
      return;
    }
    if ($J.unfn(listener) instanceof PropertyChangeListenerProxy) {
      let proxy = $J.unfn(listener);
      this.removePropertyChangeListener$String$PropertyChangeListener(proxy.getPropertyName(), proxy.getListener());
    } else {
      this.map_.remove(null, listener);
    }
  }
  /**
   * Returns an array of all the listeners that were added to the
   * PropertyChangeSupport object with addPropertyChangeListener().
   * <p>
   * If some listeners have been added with a named property, then
   * the returned array will be a mixture of PropertyChangeListeners
   * and {@code PropertyChangeListenerProxy}s. If the calling
   * method is interested in distinguishing the listeners then it must
   * test each element to see if it's a
   * {@code PropertyChangeListenerProxy}, perform the cast, and examine
   * the parameter.
   *
   * <pre>{@code
   * PropertyChangeListener[] listeners = bean.getPropertyChangeListeners();
   * for (int i = 0; i < listeners.length; i++) {
   *   if (listeners[i] instanceof PropertyChangeListenerProxy) {
   *     PropertyChangeListenerProxy proxy =
   *                    (PropertyChangeListenerProxy)listeners[i];
   *     if (proxy.getPropertyName().equals("foo")) {
   *       // proxy is a PropertyChangeListener which was associated
   *       // with the property named "foo"
   *     }
   *   }
   * }
   * }</pre>
   *
   * @see PropertyChangeListenerProxy
   * @return all of the {@code PropertyChangeListeners} added or an
   *         empty array if no listeners have been added
   * @since 1.4
   */
  getPropertyChangeListeners$(): PropertyChangeListener[] {
    return this.map_.getListeners$();
  }
  /**
   * Add a PropertyChangeListener for a specific property.  The listener
   * will be invoked only when a call on firePropertyChange names that
   * specific property.
   * The same listener object may be added more than once.  For each
   * property,  the listener will be invoked the number of times it was added
   * for that property.
   * If {@code propertyName} or {@code listener} is null, no
   * exception is thrown and no action is taken.
   *
   * @param propertyName  The name of the property to listen on.
   * @param listener  The PropertyChangeListener to be added
   * @since 1.2
   */
  addPropertyChangeListener$String$PropertyChangeListener(propertyName: string, listener: PropertyChangeListener): void {
    if (listener == null || propertyName == null) {
      return;
    }
    listener = this.map_.extract(listener);
    if (listener != null) {
      this.map_.add(propertyName, listener);
    }
  }
  /**
   * Remove a PropertyChangeListener for a specific property.
   * If {@code listener} was added more than once to the same event
   * source for the specified property, it will be notified one less time
   * after being removed.
   * If {@code propertyName} is null,  no exception is thrown and no
   * action is taken.
   * If {@code listener} is null, or was never added for the specified
   * property, no exception is thrown and no action is taken.
   *
   * @param propertyName  The name of the property that was listened on.
   * @param listener  The PropertyChangeListener to be removed
   * @since 1.2
   */
  removePropertyChangeListener$String$PropertyChangeListener(propertyName: string, listener: PropertyChangeListener): void {
    if (listener == null || propertyName == null) {
      return;
    }
    listener = this.map_.extract(listener);
    if (listener != null) {
      this.map_.remove(propertyName, listener);
    }
  }
  /**
   * Returns an array of all the listeners which have been associated
   * with the named property.
   *
   * @param propertyName  The name of the property being listened to
   * @return all of the {@code PropertyChangeListeners} associated with
   *         the named property.  If no such listeners have been added,
   *         or if {@code propertyName} is null, an empty array is
   *         returned.
   * @since 1.4
   */
  getPropertyChangeListeners$String(propertyName: string): PropertyChangeListener[] {
    return this.map_.getListeners$String(propertyName);
  }
  /**
   * Reports a bound property update to listeners
   * that have been registered to track updates of
   * all properties or a property with the specified name.
   * <p>
   * No event is fired if old and new values are equal and non-null.
   * <p>
   * This is merely a convenience wrapper around the more general
   * {@link #firePropertyChange(PropertyChangeEvent)} method.
   *
   * @param propertyName  the programmatic name of the property that was changed
   * @param oldValue      the old value of the property
   * @param newValue      the new value of the property
   */
  firePropertyChange$String$Object$Object(propertyName: string, oldValue: any, newValue: any): void {
    if (oldValue == null || newValue == null || !$J.equals(oldValue, newValue)) {
      this.firePropertyChange$PropertyChangeEvent(new PropertyChangeEvent()._PropertyChangeEvent(this.source, propertyName, oldValue, newValue));
    }
  }
  /**
   * Reports an integer bound property update to listeners
   * that have been registered to track updates of
   * all properties or a property with the specified name.
   * <p>
   * No event is fired if old and new values are equal.
   * <p>
   * This is merely a convenience wrapper around the more general
   * {@link #firePropertyChange(String, Object, Object)}  method.
   *
   * @param propertyName  the programmatic name of the property that was changed
   * @param oldValue      the old value of the property
   * @param newValue      the new value of the property
   * @since 1.2
   */
  firePropertyChange$String$int$int(propertyName: string, oldValue: number, newValue: number): void {
    if (oldValue !== newValue) {
      this.firePropertyChange$String$Object$Object(propertyName, oldValue, newValue);
    }
  }
  /**
   * Reports a boolean bound property update to listeners
   * that have been registered to track updates of
   * all properties or a property with the specified name.
   * <p>
   * No event is fired if old and new values are equal.
   * <p>
   * This is merely a convenience wrapper around the more general
   * {@link #firePropertyChange(String, Object, Object)}  method.
   *
   * @param propertyName  the programmatic name of the property that was changed
   * @param oldValue      the old value of the property
   * @param newValue      the new value of the property
   * @since 1.2
   */
  firePropertyChange$String$boolean$boolean(propertyName: string, oldValue: boolean, newValue: boolean): void {
    if (oldValue !== newValue) {
      this.firePropertyChange$String$Object$Object(propertyName, oldValue, newValue);
    }
  }
  /**
   * Fires a property change event to listeners
   * that have been registered to track updates of
   * all properties or a property with the specified name.
   * <p>
   * No event is fired if the given event's old and new values are equal and non-null.
   *
   * @param event  the {@code PropertyChangeEvent} to be fired
   * @since 1.2
   */
  firePropertyChange$PropertyChangeEvent(event: PropertyChangeEvent): void {
    let oldValue = event.getOldValue();
    let newValue = event.getNewValue();
    if (oldValue == null || newValue == null || !$J.equals(oldValue, newValue)) {
      let name = event.getPropertyName();
      let common = this.map_.get(null);
      let named = (name != null) ? this.map_.get(name) : null;
      PropertyChangeSupport.fire(common, event);
      PropertyChangeSupport.fire(named, event);
    }
  }
  static fire(listeners: PropertyChangeListener[], event: PropertyChangeEvent): void {
    if (listeners != null) {
      for (let listener of listeners) {
        $J.fn(listener, 'propertyChange')(event);
      }
    }
  }
  /**
   * Reports a bound indexed property update to listeners
   * that have been registered to track updates of
   * all properties or a property with the specified name.
   * <p>
   * No event is fired if old and new values are equal and non-null.
   * <p>
   * This is merely a convenience wrapper around the more general
   * {@link #firePropertyChange(PropertyChangeEvent)} method.
   *
   * @param propertyName  the programmatic name of the property that was changed
   * @param index         the index of the property element that was changed
   * @param oldValue      the old value of the property
   * @param newValue      the new value of the property
   * @since 1.5
   */
  fireIndexedPropertyChange$String$int$Object$Object(propertyName: string, index: number, oldValue: any, newValue: any): void {
    if (oldValue == null || newValue == null || !$J.equals(oldValue, newValue)) {
      this.firePropertyChange$PropertyChangeEvent(new IndexedPropertyChangeEvent()._IndexedPropertyChangeEvent(this.source, propertyName, oldValue, newValue, index));
    }
  }
  /**
   * Reports an integer bound indexed property update to listeners
   * that have been registered to track updates of
   * all properties or a property with the specified name.
   * <p>
   * No event is fired if old and new values are equal.
   * <p>
   * This is merely a convenience wrapper around the more general
   * {@link #fireIndexedPropertyChange(String, int, Object, Object)} method.
   *
   * @param propertyName  the programmatic name of the property that was changed
   * @param index         the index of the property element that was changed
   * @param oldValue      the old value of the property
   * @param newValue      the new value of the property
   * @since 1.5
   */
  fireIndexedPropertyChange$String$int$int$int(propertyName: string, index: number, oldValue: number, newValue: number): void {
    if (oldValue !== newValue) {
      this.fireIndexedPropertyChange$String$int$Object$Object(propertyName, index, oldValue, newValue);
    }
  }
  /**
   * Reports a boolean bound indexed property update to listeners
   * that have been registered to track updates of
   * all properties or a property with the specified name.
   * <p>
   * No event is fired if old and new values are equal.
   * <p>
   * This is merely a convenience wrapper around the more general
   * {@link #fireIndexedPropertyChange(String, int, Object, Object)} method.
   *
   * @param propertyName  the programmatic name of the property that was changed
   * @param index         the index of the property element that was changed
   * @param oldValue      the old value of the property
   * @param newValue      the new value of the property
   * @since 1.5
   */
  fireIndexedPropertyChange$String$int$boolean$boolean(propertyName: string, index: number, oldValue: boolean, newValue: boolean): void {
    if (oldValue !== newValue) {
      this.fireIndexedPropertyChange$String$int$Object$Object(propertyName, index, oldValue, newValue);
    }
  }
  /**
   * Check if there are any listeners for a specific property, including
   * those registered on all properties.  If {@code propertyName}
   * is null, only check for listeners registered on all properties.
   *
   * @param propertyName  the property name.
   * @return true if there are one or more listeners for the given property
   * @since 1.2
   */
  hasListeners(propertyName: string): boolean {
    return this.map_.hasListeners(propertyName);
  }
}

/**
 * This is a {@link ChangeListenerMap ChangeListenerMap} implementation
 * that works with {@link PropertyChangeListener PropertyChangeListener} objects.
 */
export class PropertyChangeSupport$PropertyChangeListenerMap extends ChangeListenerMap {
  static EMPTY: PropertyChangeListener[] = null;
  _PropertyChangeSupport$PropertyChangeListenerMap(): this {
    this._ChangeListenerMap();
    return this;
  }
  /**
   * Creates an array of {@link PropertyChangeListener PropertyChangeListener} objects.
   * This method uses the same instance of the empty array
   * when {@code length} equals {@code 0}.
   *
   * @param length  the array length
   * @return        an array with specified length
   */
  newArray(length: number): PropertyChangeListener[] {
    return (0 < length) ? $J.newArray(length, null) : PropertyChangeSupport$PropertyChangeListenerMap.EMPTY;
  }
  /**
   * Creates a {@link PropertyChangeListenerProxy PropertyChangeListenerProxy}
   * object for the specified property.
   *
   * @param name      the name of the property to listen on
   * @param listener  the listener to process events
   * @return          a {@code PropertyChangeListenerProxy} object
   */
  newProxy(name: string, listener: PropertyChangeListener): PropertyChangeListener {
    return $J.fn(new PropertyChangeListenerProxy()._PropertyChangeListenerProxy(name, listener), 'propertyChange');
  }
  /**
   * {@inheritDoc}
   */
  extract(listener: PropertyChangeListener): PropertyChangeListener {
    while ($J.unfn(listener) instanceof PropertyChangeListenerProxy) {
      listener = ($J.unfn(listener)).getListener();
    }
    return listener;
  }
  static $clinit() {
    PropertyChangeSupport$PropertyChangeListenerMap.EMPTY = [];
  }
}

$J.define(PropertyChangeSupport, 'java.beans.PropertyChangeSupport', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.lang.Object': '_PropertyChangeSupport' }, meths: { 'fireIndexedPropertyChange(java.lang.String,int,boolean,boolean)': 'fireIndexedPropertyChange$String$int$boolean$boolean', 'fireIndexedPropertyChange(java.lang.String,int,int,int)': 'fireIndexedPropertyChange$String$int$int$int', 'fireIndexedPropertyChange(java.lang.String,int,java.lang.Object,java.lang.Object)': 'fireIndexedPropertyChange$String$int$Object$Object', 'firePropertyChange(java.beans.PropertyChangeEvent)': 'firePropertyChange$PropertyChangeEvent', 'firePropertyChange(java.lang.String,boolean,boolean)': 'firePropertyChange$String$boolean$boolean', 'firePropertyChange(java.lang.String,int,int)': 'firePropertyChange$String$int$int', 'firePropertyChange(java.lang.String,java.lang.Object,java.lang.Object)': 'firePropertyChange$String$Object$Object', 'getPropertyChangeListeners(java.lang.String)': 'getPropertyChangeListeners$String', 'removePropertyChangeListener(java.lang.String,java.beans.PropertyChangeListener)': 'removePropertyChangeListener$String$PropertyChangeListener', 'addPropertyChangeListener(java.lang.String,java.beans.PropertyChangeListener)': 'addPropertyChangeListener$String$PropertyChangeListener', 'getPropertyChangeListeners()': 'getPropertyChangeListeners$', 'removePropertyChangeListener(java.beans.PropertyChangeListener)': 'removePropertyChangeListener$PropertyChangeListener', 'addPropertyChangeListener(java.beans.PropertyChangeListener)': 'addPropertyChangeListener$PropertyChangeListener' } });
$J.define(PropertyChangeSupport$PropertyChangeListenerMap, 'java.beans.PropertyChangeSupport$PropertyChangeListenerMap', { kind: 'class', sup: 'java.beans.ChangeListenerMap', ctors: { '': '_PropertyChangeSupport$PropertyChangeListenerMap' }, clinit: true, lazy: ['EMPTY'] });
$J.module(() => {
  IndexedPropertyChangeEvent = $J.load('java.beans.IndexedPropertyChangeEvent');
  PropertyChangeEvent = $J.load('java.beans.PropertyChangeEvent');
  PropertyChangeListenerProxy = $J.load('java.beans.PropertyChangeListenerProxy');
});
