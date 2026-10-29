// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/InputMap.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, HashMap, JObject } from '../../../jre/index.ts';

let ArrayTable;

/**
 * {@code InputMap} provides a binding between an input event (currently only
 * {@code KeyStroke}s are used) and an {@code Object}. {@code InputMap}s are
 * usually used with an {@code ActionMap}, to determine an {@code Action} to
 * perform when a key is pressed. An {@code InputMap} can have a parent that
 * is searched for bindings not defined in the {@code InputMap}.
 * <p>As with {@code ActionMap} if you create a cycle, eg:
 * <pre>
 *   InputMap am = new InputMap();
 *   InputMap bm = new InputMap():
 *   am.setParent(bm);
 *   bm.setParent(am);
 * </pre>
 * some of the methods will cause a StackOverflowError to be thrown.
 *
 * @author Scott Violet
 * @since 1.3
 */
export class InputMap extends JObject {
  /**
   * Handles the mapping between KeyStroke and Action name.
   */
  arrayTable: ArrayTable = null;
  /**
   * Parent that handles any bindings we don't contain.
   */
  parent: InputMap = null;
  /**
   * Creates an {@code InputMap} with no parent and no mappings.
   */
  _InputMap(): this {
    return this;
  }
  /**
   * Sets this {@code InputMap}'s parent.
   *
   * @param map the {@code InputMap} that is the parent of this one
   */
  setParent(map: InputMap): void {
    this.parent = map;
  }
  /**
   * Gets this {@code InputMap}'s parent.
   *
   * @return map the {@code InputMap} that is the parent of this one,
   *             or null if this {@code InputMap} has no parent
   */
  getParent(): InputMap {
    return this.parent;
  }
  /**
   * Adds a binding for {@code keyStroke} to {@code actionMapKey}.
   * If {@code actionMapKey} is null, this removes the current binding
   * for {@code keyStroke}.
   *
   * @param keyStroke a {@code KeyStroke}
   * @param actionMapKey an action map key
   */
  put(keyStroke: KeyStroke, actionMapKey: any): void {
    if (keyStroke == null) {
      return;
    }
    if (actionMapKey == null) {
      this.remove(keyStroke);
    } else {
      if (this.arrayTable == null) {
        this.arrayTable = new ArrayTable()._ArrayTable();
      }
      this.arrayTable.put(keyStroke, actionMapKey);
    }
  }
  /**
   * Returns the binding for {@code keyStroke}, messaging the
   * parent {@code InputMap} if the binding is not locally defined.
   *
   * @param keyStroke the {@code KeyStroke} for which to get the binding
   * @return the binding for {@code keyStroke}
   */
  get(keyStroke: KeyStroke): any {
    if (this.arrayTable == null) {
      let parent = this.getParent();
      if (parent != null) {
        return parent.get(keyStroke);
      }
      return null;
    }
    let value = this.arrayTable.get(keyStroke);
    if (value == null) {
      let parent = this.getParent();
      if (parent != null) {
        return parent.get(keyStroke);
      }
    }
    return value;
  }
  /**
   * Removes the binding for {@code key} from this {@code InputMap}.
   *
   * @param key the {@code KeyStroke} for which to remove the binding
   */
  remove(key: KeyStroke): void {
    if (this.arrayTable != null) {
      this.arrayTable.remove(key);
    }
  }
  /**
   * Removes all the mappings from this {@code InputMap}.
   */
  clear(): void {
    if (this.arrayTable != null) {
      this.arrayTable.clear();
    }
  }
  /**
   * Returns the {@code KeyStroke}s that are bound in this {@code InputMap}.
   *
   * @return an array of the {@code KeyStroke}s that are bound in this
   *         {@code InputMap}
   */
  keys(): KeyStroke[] {
    if (this.arrayTable == null) {
      return null;
    }
    let keys = $J.newArray(this.arrayTable.size(), null);
    this.arrayTable.getKeys(keys);
    return keys;
  }
  /**
   * Returns the number of {@code KeyStroke} bindings.
   *
   * @return the number of {@code KeyStroke} bindings
   */
  size(): number {
    if (this.arrayTable == null) {
      return 0;
    }
    return this.arrayTable.size();
  }
  /**
   * Returns an array of the {@code KeyStroke}s defined in this
   * {@code InputMap} and its parent. This differs from {@code keys()}
   * in that this method includes the keys defined in the parent.
   *
   * @return an array of the {@code KeyStroke}s defined in this
   *         {@code InputMap} and its parent
   */
  allKeys(): KeyStroke[] {
    let count = this.size();
    let parent = this.getParent();
    if (count === 0) {
      if (parent != null) {
        return parent.allKeys();
      }
      return this.keys();
    }
    if (parent == null) {
      return this.keys();
    }
    let keys = this.keys();
    let pKeys = parent.allKeys();
    if (pKeys == null) {
      return keys;
    }
    if (keys == null) {
      return pKeys;
    }
    let keyMap = new HashMap();
    let counter: number;
    for (counter = (keys.length - 1) | 0; counter >= 0; counter--) {
      keyMap.put(keys[counter], keys[counter]);
    }
    for (counter = (pKeys.length - 1) | 0; counter >= 0; counter--) {
      keyMap.put(pKeys[counter], pKeys[counter]);
    }
    let allKeys = $J.newArray(keyMap.size(), null);
    return $J.toArrayInto(keyMap.keySet().toArray(), allKeys);
  }
}

$J.define(InputMap, 'javax.swing.InputMap', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_InputMap' } });
$J.module(() => {
  ArrayTable = $J.load('javax.swing.ArrayTable');
});
