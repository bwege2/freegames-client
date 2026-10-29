// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/ChangeListenerMap.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2012, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, HashMap, JObject } from '../../../jre/index.ts';

/**
 * This is an abstract class that provides base functionality
 * for the {@link PropertyChangeSupport PropertyChangeSupport} class
 * and the {@link VetoableChangeSupport VetoableChangeSupport} class.
 *
 * @see PropertyChangeSupport.PropertyChangeListenerMap
 * @see VetoableChangeSupport.VetoableChangeListenerMap
 *
 * @author Sergey A. Malenkov
 */
export class ChangeListenerMap<L> extends JObject {
  map_: JMap<string, L[]> = null;
  _ChangeListenerMap(): this {
    return this;
  }
  /**
   * Adds a listener to the list of listeners for the specified property.
   * This listener is called as many times as it was added.
   *
   * @param name      the name of the property to listen on
   * @param listener  the listener to process events
   */
  add(name: string, listener: L): void {
    if (this.map_ == null) {
      this.map_ = new HashMap();
    }
    let array = this.map_.get(name);
    let size = (array != null) ? array.length : 0;
    let clone = this.newArray((size + 1) | 0);
    clone[size] = listener;
    if (array != null) {
      $J.system_arraycopy(array, 0, clone, 0, size);
    }
    this.map_.put(name, clone);
  }
  /**
   * Removes a listener from the list of listeners for the specified property.
   * If the listener was added more than once to the same event source,
   * this listener will be notified one less time after being removed.
   *
   * @param name      the name of the property to listen on
   * @param listener  the listener to process events
   */
  remove(name: string, listener: L): void {
    if (this.map_ != null) {
      let array = this.map_.get(name);
      if (array != null) {
        for (let i = 0; i < array.length; i++) {
          if (listener.equals(array[i])) {
            let size = (array.length - 1) | 0;
            if (size > 0) {
              let clone = this.newArray(size);
              $J.system_arraycopy(array, 0, clone, 0, i);
              $J.system_arraycopy(array, (i + 1) | 0, clone, i, (size - i) | 0);
              this.map_.put(name, clone);
            } else {
              this.map_.remove(name);
              if (this.map_.isEmpty()) {
                this.map_ = null;
              }
            }
            break;
          }
        }
      }
    }
  }
  /**
   * Returns the list of listeners for the specified property.
   *
   * @param name  the name of the property
   * @return      the corresponding list of listeners
   */
  get(name: string): L[] {
    return (this.map_ != null) ? this.map_.get(name) : null;
  }
  /**
   * Returns all listeners in the map.
   *
   * @return an array of all listeners
   */
  getListeners$(): L[] {
    if (this.map_ == null) {
      return this.newArray(0);
    }
    let list = new ArrayList();
    let listeners = this.map_.get(null);
    if (listeners != null) {
      for (let listener of listeners) {
        list.add(listener);
      }
    }
    for (const $it0 = this.map_.entrySet().iterator(); $it0.hasNext(); ) {
      let entry = $it0.next();
      let name = entry.getKey();
      if (name != null) {
        for (let listener of entry.getValue()) {
          list.add(this.newProxy(name, listener));
        }
      }
    }
    return $J.toArrayInto(list.toArray(), this.newArray(list.size()));
  }
  /**
   * Returns listeners that have been associated with the named property.
   *
   * @param name  the name of the property
   * @return an array of listeners for the named property
   */
  getListeners$String(name: string): L[] {
    if (name != null) {
      let listeners = this.get(name);
      if (listeners != null) {
        return listeners.slice();
      }
    }
    return this.newArray(0);
  }
  /**
   * Indicates whether the map contains
   * at least one listener to be notified.
   *
   * @param name  the name of the property
   * @return      {@code true} if at least one listener exists or
   *              {@code false} otherwise
   */
  hasListeners(name: string): boolean {
    if (this.map_ == null) {
      return false;
    }
    let array = this.map_.get(null);
    return (array != null) || ((name != null) && (null != this.map_.get(name)));
  }
}

$J.define(ChangeListenerMap, 'java.beans.ChangeListenerMap', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ChangeListenerMap' }, meths: { 'getListeners(java.lang.String)': 'getListeners$String', 'getListeners()': 'getListeners$' } });
