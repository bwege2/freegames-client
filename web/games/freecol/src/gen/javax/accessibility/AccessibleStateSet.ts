// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/accessibility/AccessibleStateSet.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, Vector } from '../../../jre/index.ts';

/**
 * Class {@code AccessibleStateSet} determines a component's state set. The
 * state set of a component is a set of {@code AccessibleState} objects and
 * descriptions. E.G., The current overall state of the object, such as whether
 * it is enabled, has focus, etc.
 *
 * @author Willie Walker
 * @see AccessibleState
 */
export class AccessibleStateSet extends JObject {
  /**
   * Each entry in the {@code Vector} represents an {@code AccessibleState}.
   *
   * @see #add
   * @see #addAll
   * @see #remove
   * @see #contains
   * @see #toArray
   * @see #clear
   */
  states: Vector<AccessibleState> = null;
  $init_AccessibleStateSet() {
    this.states = null;
  }
  /**
   * Creates a new empty state set.
   */
  _AccessibleStateSet$(): this {
    this.$init_AccessibleStateSet();
    this.states = null;
    return this;
  }
  /**
   * Adds a new state to the current state set if it is not already present.
   * If the state is already in the state set, the state set is unchanged and
   * the return value is {@code false}. Otherwise, the state is added to the
   * state set and the return value is {@code true}.
   *
   * @param  state the state to add to the state set
   * @return {@code true} if state is added to the state set; {@code false} if
   *         the state set is unchanged
   */
  add(state: AccessibleState): boolean {
    if (this.states == null) {
      this.states = new Vector();
    }
    if (!this.states.contains(state)) {
      this.states.addElement(state);
      return true;
    } else {
      return false;
    }
  }
  /**
   * Removes a state from the current state set. If the state is not in the
   * set, the state set will be unchanged and the return value will be
   * {@code false}. If the state is in the state set, it will be removed from
   * the set and the return value will be {@code true}.
   *
   * @param  state the state to remove from the state set
   * @return {@code true} if the state is in the state set; {@code false} if
   *         the state set will be unchanged
   */
  remove(state: AccessibleState): boolean {
    if (this.states == null) {
      return false;
    } else {
      return this.states.removeElement(state);
    }
  }
  /**
   * Checks if the current state is in the state set.
   *
   * @param  state the state
   * @return {@code true} if the state is in the state set; otherwise
   *         {@code false}
   */
  contains(state: AccessibleState): boolean {
    if (this.states == null) {
      return false;
    } else {
      return this.states.contains(state);
    }
  }
  /**
   * Creates a localized string representing all the states in the set using
   * the default locale.
   *
   * @return comma separated localized string
   * @see AccessibleBundle#toDisplayString
   */
  toString(): string {
    let ret = null;
    if ((this.states != null) && (this.states.size() > 0)) {
      ret = this.states.elementAt(0).toDisplayString$();
      for (let i = 1; i < this.states.size(); i++) {
        ret = ret + ',' + this.states.elementAt(i).toDisplayString$();
      }
    }
    return ret;
  }
}

$J.define(AccessibleStateSet, 'javax.accessibility.AccessibleStateSet', { kind: 'class', sup: 'java.lang.Object', ctors: { 'javax.accessibility.AccessibleState[]': '_AccessibleStateSet$AccessibleStateArr', '': '_AccessibleStateSet$' } });
