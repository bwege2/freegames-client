// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/ActionMap.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../jre/index.ts';

let ArrayTable;

/**
 * <code>ActionMap</code> provides mappings from
 * <code>Object</code>s
 * (called <em>keys</em> or <em><code>Action</code> names</em>)
 * to <code>Action</code>s.
 * An <code>ActionMap</code> is usually used with an <code>InputMap</code>
 * to locate a particular action
 * when a key is pressed. As with <code>InputMap</code>,
 * an <code>ActionMap</code> can have a parent
 * that is searched for keys not defined in the <code>ActionMap</code>.
 * <p>As with <code>InputMap</code> if you create a cycle, eg:
 * <pre>
 *   ActionMap am = new ActionMap();
 *   ActionMap bm = new ActionMap():
 *   am.setParent(bm);
 *   bm.setParent(am);
 * </pre>
 * some of the methods will cause a StackOverflowError to be thrown.
 *
 * @see InputMap
 *
 * @author Scott Violet
 * @since 1.3
 */
export class ActionMap extends JObject {
  /**
   * Handles the mapping between Action name and Action.
   */
  arrayTable: ArrayTable = null;
  /**
   * Parent that handles any bindings we don't contain.
   */
  parent: ActionMap = null;
  /**
   * Creates an <code>ActionMap</code> with no parent and no mappings.
   */
  _ActionMap(): this {
    return this;
  }
  /**
   * Sets this <code>ActionMap</code>'s parent.
   *
   * @param map  the <code>ActionMap</code> that is the parent of this one
   */
  setParent(map: ActionMap): void {
    this.parent = map;
  }
  /**
   * Returns this <code>ActionMap</code>'s parent.
   *
   * @return the <code>ActionMap</code> that is the parent of this one,
   *         or null if this <code>ActionMap</code> has no parent
   */
  getParent(): ActionMap {
    return this.parent;
  }
  /**
   * Adds a binding for <code>key</code> to <code>action</code>.
   * If <code>action</code> is null, this removes the current binding
   * for <code>key</code>.
   * <p>In most instances, <code>key</code> will be
   * <code>action.getValue(NAME)</code>.
   *
   * @param key a key
   * @param action a binding for {@code key}
   */
  put$Object$Action(key: any, action: Action): void {
    if (key == null) {
      return;
    }
    if (action == null) {
      this.remove(key);
    } else {
      if (this.arrayTable == null) {
        this.arrayTable = new ArrayTable()._ArrayTable();
      }
      this.arrayTable.put(key, action);
    }
  }
  /**
   * Returns the binding for <code>key</code>, messaging the
   * parent <code>ActionMap</code> if the binding is not locally defined.
   *
   * @param key a key
   * @return the binding for {@code key}
   */
  get(key: any): Action {
    let value = (this.arrayTable == null) ? null : this.arrayTable.get(key);
    if (value == null) {
      let parent = this.getParent();
      if (parent != null) {
        return parent.get(key);
      }
    }
    return value;
  }
  /**
   * Removes the binding for <code>key</code> from this <code>ActionMap</code>.
   *
   * @param key a key
   */
  remove(key: any): void {
    if (this.arrayTable != null) {
      this.arrayTable.remove(key);
    }
  }
  /**
   * Removes all the mappings from this <code>ActionMap</code>.
   */
  clear(): void {
    if (this.arrayTable != null) {
      this.arrayTable.clear();
    }
  }
}

$J.define(ActionMap, 'javax.swing.ActionMap', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_ActionMap' }, meths: { 'put(java.lang.Object,javax.swing.Action)': 'put$Object$Action' } });
$J.module(() => {
  ArrayTable = $J.load('javax.swing.ArrayTable');
});
